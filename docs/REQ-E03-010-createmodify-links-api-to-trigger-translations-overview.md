# Implementation Overview: REQ-E03-010 - Create/Modify Links API to Trigger Translations

**Request ID:** REQ-E03-010
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.4
**Type:** ENHANCEMENT
**Size:** M
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 18:30 UTC

---

## Summary

Create a dedicated Links API endpoint and integrate translation workflows into link creation and update operations. The POST handler will trigger translations for link titles after successful link creation, and the PUT handler will delete existing translations before re-queuing new translations after updates. Both handlers will include translation job identifiers in their responses for status tracking. Importantly, only the `title` field is translated - URLs are never sent for translation.

---

## Background & Context

### Current State

Currently, links are managed through several existing API routes but there is no dedicated links endpoint:

**Links in Items API (`/src/app/api/admin/items/route.ts:471-503`)**
- POST handler creates links as part of item creation
- Links are inserted into `item_links` table with fields: item_id, article_id, title, link_type, url, thumbnail_url, display_order
- No translation process is initiated for link titles

**Links in Items PUT API (`/src/app/api/admin/items/[publicId]/route.ts:641-684`)**
- PUT handler deletes existing links and recreates them
- Links are deleted and re-inserted in batch
- No translation handling for link titles

**Links in Articles PUT API (`/src/app/api/admin/articles/[articleId]/route.ts:339-387`)**
- PUT handler handles link updates via delete/update/insert pattern
- Processes links array with id (for existing) or without (for new)
- No translation handling for link titles

**Database Schema (`item_links` table from `/src/lib/supabase.ts:219-272`):**
```sql
id: uuid PRIMARY KEY
item_id: uuid REFERENCES items(id)
article_id: uuid REFERENCES item_articles(id)
title: text NOT NULL
link_type: text NOT NULL  -- 'youtube', 'pdf', 'image', 'text', 'video'
url: text NOT NULL
thumbnail_url: text
display_order: integer
source_language: text  -- Added in Epic 1 (REQ-224)
created_at: timestamptz
```

### Existing Code Patterns

| Pattern | Location | Lines | Description |
|---------|----------|-------|-------------|
| Auth validation | `validateAdminAuth` | `/src/lib/auth-server.ts` | Returns user, isAdmin, supabase client |
| Account context | `getAccountContext` | Multiple route files | Extracts accountId, accountRole |
| Link creation | Items POST | route.ts:471-503 | Batch insert links with item_id |
| Link update | Items PUT | [publicId]/route.ts:641-684 | Delete existing, insert new |
| Link update | Articles PUT | [articleId]/route.ts:339-387 | Delete/update/insert pattern |
| Response format | All APIs | Various | `{ success, data, accountContext }` |

### Problem Statement

1. No dedicated API endpoint exists for managing links independently
2. When links are created (via items/articles APIs), no translation process is initiated
3. Link titles remain in their original language only
4. There's no mechanism to trigger translation for link title changes
5. The `source_language` column on `item_links` is not being populated
6. URL fields must never be translated (they are language-agnostic)

### Solution Approach

Create a dedicated Links API endpoint and integrate translation:

1. **Create Links API Endpoint:**
   - Create `/src/app/api/admin/items/[id]/links/route.ts`
   - Implement POST handler for creating new links
   - Implement PUT handler for updating existing links
   - Implement DELETE handler for removing links

2. **POST Handler Implementation:**
   - Validate authentication and account context
   - Validate item belongs to user's account
   - Accept optional `sourceLanguage` in request body
   - Create link in database with `source_language` column populated
   - Queue translation jobs for `title` field only (NOT url)
   - Include `translationJobIds` array in response

3. **PUT Handler Implementation:**
   - Validate authentication and link access
   - Detect when translatable field (title) has changed
   - Delete existing link translations before update
   - Queue new translations after successful update
   - Skip translation queuing if only non-translatable fields changed
   - Include `translationJobIds` array in response

---

## Technical Design

### Architecture Position

```
/src/app/api/admin/items/[id]/
├── route.ts                    # Existing item CRUD (GET/PUT/DELETE)
├── analytics/
│   └── route.ts                # Existing analytics endpoint
└── links/
    └── route.ts                # NEW: Dedicated links CRUD endpoint

/src/lib/content-translation/   # Dependencies (from prior tasks)
├── index.ts                    # Module exports
├── content-translation.ts      # queueContentTranslations()
├── content-translation.types.ts # Type definitions
├── source-language.ts          # detectSourceLanguage()
├── triggers/
│   └── link-trigger.ts         # triggerLinkTranslation()
└── storage/
    └── translation-storage.ts  # deleteEntityTranslations()
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `queueContentTranslations` | `/src/lib/content-translation/content-translation.ts` | Queue translation jobs |
| `detectSourceLanguage` | `/src/lib/content-translation/source-language.ts` | Determine source language |
| `deleteEntityTranslations` | `/src/lib/content-translation/storage/translation-storage.ts` | Delete existing translations |
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Language type |
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Authentication |

### Database Schema Reference

**Item Links Table (`item_links`):**
```sql
id: uuid PRIMARY KEY
item_id: uuid REFERENCES items(id) ON DELETE CASCADE
article_id: uuid REFERENCES item_articles(id) ON DELETE SET NULL
title: text NOT NULL           -- TRANSLATABLE
link_type: text NOT NULL       -- NOT translated
url: text NOT NULL             -- NEVER translated (URLs are language-agnostic)
thumbnail_url: text            -- NOT translated
display_order: integer DEFAULT 0
source_language: text          -- Added in Epic 1, to be populated
created_at: timestamptz DEFAULT now()
```

**Link Translations Table (`link_translations`):**
```sql
id: uuid PRIMARY KEY
link_id: uuid REFERENCES item_links(id) ON DELETE CASCADE
language: text NOT NULL        -- Target language code
title: text NOT NULL           -- Translated title
translation_status: text       -- 'pending', 'completed', 'failed', 'manual'
translated_at: timestamptz
source_version_at: timestamptz
created_at: timestamptz
updated_at: timestamptz
UNIQUE(link_id, language)
```

**Translation Jobs Table (`translation_jobs`):**
```sql
id: uuid PRIMARY KEY
entity_type: text NOT NULL     -- 'item', 'article', 'link', 'tag'
entity_id: uuid NOT NULL
source_language: text NOT NULL
target_language: text NOT NULL
status: text NOT NULL          -- 'queued', 'processing', 'completed', 'failed'
priority: integer DEFAULT 50
attempts: integer DEFAULT 0
error_message: text
created_at: timestamptz
started_at: timestamptz
completed_at: timestamptz
```

---

## Interface Contracts

### Request Types

```typescript
// Create Link Request (POST)
// File: /src/types/index.ts (or inline in route file)
export interface CreateLinkRequest {
  /** Item ID this link belongs to */
  itemId: string;
  /** Optional article ID for article-specific links */
  articleId?: string;
  /** Link title - this field gets translated */
  title: string;
  /** Type of link resource */
  linkType: LinkType;  // 'youtube' | 'pdf' | 'image' | 'text' | 'video'
  /** URL - NEVER translated */
  url: string;
  /** Optional thumbnail URL */
  thumbnailUrl?: string;
  /** Display order in list */
  displayOrder?: number;
  /**
   * Optional source language override for translations.
   * If not provided, detected from user/account preferences.
   * @see detectSourceLanguage()
   */
  sourceLanguage?: SupportedLanguage;
}

// Update Link Request (PUT)
export interface UpdateLinkRequest {
  /** Link title - this field gets translated */
  title?: string;
  /** Type of link resource */
  linkType?: LinkType;
  /** URL - NEVER translated */
  url?: string;
  /** Optional thumbnail URL */
  thumbnailUrl?: string;
  /** Display order in list */
  displayOrder?: number;
  /**
   * Optional source language override for translations.
   * If not provided, detected from user/account preferences.
   */
  sourceLanguage?: SupportedLanguage;
}
```

### Response Types

```typescript
// Link Response (POST, PUT, GET)
export interface LinkResponse {
  success: boolean;
  data?: {
    id: string;
    itemId: string;
    articleId?: string;
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    createdAt: string;
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  /**
   * Array of translation job IDs for status tracking.
   * Empty if translation queuing was skipped or failed.
   */
  translationJobIds?: string[];

  /**
   * Translation error message if queuing failed.
   * Link creation/update still succeeds even if translation fails.
   */
  translationError?: string;

  /**
   * Languages queued for translation.
   */
  queuedLanguages?: SupportedLanguage[];
}

// Links List Response (GET all links for item)
export interface LinksListResponse {
  success: boolean;
  data?: {
    id: string;
    itemId: string;
    articleId?: string;
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    createdAt: string;
  }[];
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

### Translation Integration Contract

```typescript
// Usage pattern in POST handler
import {
  queueContentTranslations,
  detectSourceLanguage
} from '@/lib/content-translation';

const sourceLanguage = detectSourceLanguage({
  user: { preferred_language: userPreferredLanguage },
  account: { preferred_language: accountPreferredLanguage },
  override: body.sourceLanguage
});

const translationResult = await queueContentTranslations({
  content: {
    entityType: 'link',
    entityId: newLink.id,
    sourceLanguage,
    fields: [
      {
        fieldName: 'title',
        value: newLink.title,
        context: { contentType: 'link_title', domainContext: 'property_rental_media' },
        maxLength: 255
      }
      // NOTE: URL field is NEVER included - URLs are not translated
    ]
  },
  trigger: 'create'
});
```

---

## Implementation Details

### New File: Links API Route

**Location:** `/src/app/api/admin/items/[id]/links/route.ts`

```typescript
/**
 * REQ-E03-010: Links CRUD Endpoints with Translation Integration
 * Created: 2026-01-20
 *
 * GET /api/admin/items/[id]/links - List all links for an item
 * POST /api/admin/items/[id]/links - Create new link with translation trigger
 * PUT /api/admin/items/[id]/links/[linkId] - Update link with translation trigger
 * DELETE /api/admin/items/[id]/links/[linkId] - Delete link
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  queueContentTranslations,
  detectSourceLanguage,
  deleteEntityTranslations
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// Helper function to extract account context from request
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean, supabase: any) {
  // ... standard implementation matching other API routes ...
}

// Helper function to fetch user's preferred language
async function getUserPreferredLanguage(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('preferred_language')
    .eq('id', userId)
    .single();
  return data?.preferred_language || null;
}

// Helper function to fetch account's preferred language
async function getAccountPreferredLanguage(supabase: any, accountId: string | null): Promise<string | null> {
  if (!accountId) return null;
  const { data } = await supabase
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();
  return data?.preferred_language || null;
}

// Helper function to validate item access within account context
async function validateItemAccess(itemId: string, userId: string, isAdmin: boolean, accountId: string | null, supabase: any) {
  // Get item with property and account information
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      name,
      property_id,
      properties!left(account_id, user_id)
    `)
    .eq('id', itemId)
    .single();

  if (error || !item) {
    return { canAccess: false, error: 'Item not found' };
  }

  const itemProperty = item.properties;

  if (isAdmin && !accountId) {
    return { canAccess: true, item };
  } else if (isAdmin && accountId) {
    if (itemProperty.account_id !== accountId) {
      return { canAccess: false, error: 'Item does not belong to the specified account' };
    }
    return { canAccess: true, item };
  } else {
    const canAccess = itemProperty.account_id === accountId && itemProperty.user_id === userId;
    if (!canAccess) {
      return { canAccess: false, error: 'Access denied to item' };
    }
    return { canAccess: true, item };
  }
}
```

### GET Handler - List Links for Item

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { id: itemId } = await params;

    // Validate item access
    const accessResult = await validateItemAccess(itemId, user.id, userIsAdmin, accountId, supabase);
    if (!accessResult.canAccess) {
      return NextResponse.json(
        { success: false, error: accessResult.error },
        { status: accessResult.error === 'Item not found' ? 404 : 403 }
      );
    }

    // Fetch links for this item
    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('id, item_id, article_id, title, link_type, url, thumbnail_url, display_order, created_at')
      .eq('item_id', itemId)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Links fetch error:', linksError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch links' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (links || []).map(link => ({
        id: link.id,
        itemId: link.item_id,
        articleId: link.article_id,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url,
        displayOrder: link.display_order || 0,
        createdAt: link.created_at
      })),
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### POST Handler - Create Link with Translation

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Admin create link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { id: itemId } = await params;

    // Validate item access
    const accessResult = await validateItemAccess(itemId, user.id, userIsAdmin, accountId, supabase);
    if (!accessResult.canAccess) {
      return NextResponse.json(
        { success: false, error: accessResult.error },
        { status: accessResult.error === 'Item not found' ? 404 : 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.linkType || !body.url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, linkType, url' },
        { status: 400 }
      );
    }

    // Validate link type
    const validLinkTypes = ['youtube', 'pdf', 'image', 'text', 'video'];
    if (!validLinkTypes.includes(body.linkType)) {
      return NextResponse.json(
        { success: false, error: `Invalid link type: ${body.linkType}` },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: `Invalid URL: ${body.url}` },
        { status: 400 }
      );
    }

    // Validate article_id if provided
    if (body.articleId) {
      const { data: article, error: articleError } = await supabase
        .from('item_articles')
        .select('id')
        .eq('id', body.articleId)
        .eq('item_id', itemId)
        .single();

      if (articleError || !article) {
        return NextResponse.json(
          { success: false, error: 'Invalid article ID or article does not belong to this item' },
          { status: 400 }
        );
      }
    }

    // Fetch language preferences for source language detection
    const [userPreferredLanguage, accountPreferredLanguage] = await Promise.all([
      getUserPreferredLanguage(supabase, user.id),
      getAccountPreferredLanguage(supabase, accountId)
    ]);

    // Determine source language
    const sourceLanguage = detectSourceLanguage({
      user: { preferred_language: userPreferredLanguage },
      account: { preferred_language: accountPreferredLanguage },
      override: body.sourceLanguage
    });

    // Create link in database
    const { data: newLink, error: insertError } = await supabase
      .from('item_links')
      .insert({
        item_id: itemId,
        article_id: body.articleId || null,
        title: body.title,
        link_type: body.linkType,
        url: body.url,
        thumbnail_url: body.thumbnailUrl || null,
        display_order: body.displayOrder || 0,
        source_language: sourceLanguage
      })
      .select()
      .single();

    if (insertError || !newLink) {
      console.error('Link creation error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create link' },
        { status: 500 }
      );
    }

    console.log('Link created successfully:', newLink.id);

    // Queue translations (non-blocking - errors don't fail link creation)
    let translationJobIds: string[] = [];
    let translationError: string | undefined;
    let queuedLanguages: SupportedLanguage[] = [];

    try {
      const translationResult = await queueContentTranslations({
        content: {
          entityType: 'link',
          entityId: newLink.id,
          sourceLanguage,
          fields: [
            {
              fieldName: 'title',
              value: newLink.title,
              context: { contentType: 'link_title', domainContext: 'property_rental_media' },
              maxLength: 255
            }
            // NOTE: URL is NEVER included - URLs are not translated
          ]
        },
        trigger: 'create'
      });

      if (translationResult.success) {
        translationJobIds = translationResult.jobIds;
        queuedLanguages = translationResult.queuedLanguages;
        console.log('Translation jobs queued for link:', translationJobIds.length);
      } else {
        translationError = translationResult.error;
        console.error('Translation queuing returned error:', translationError);
      }
    } catch (error) {
      console.error('Translation queuing error:', error);
      translationError = error instanceof Error ? error.message : 'Unknown translation error';
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newLink.id,
        itemId: newLink.item_id,
        articleId: newLink.article_id,
        title: newLink.title,
        linkType: newLink.link_type,
        url: newLink.url,
        thumbnailUrl: newLink.thumbnail_url,
        displayOrder: newLink.display_order || 0,
        createdAt: newLink.created_at
      },
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError }),
      accountContext: { accountId, accountRole }
    }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### PUT Handler - Update Link with Translation

**Note:** For the PUT handler, we need a separate route file or handle linkId in the URL. Two options:

**Option A:** Create `/src/app/api/admin/items/[id]/links/[linkId]/route.ts` for individual link operations
**Option B:** Accept linkId in query params or request body

Recommended approach: Create separate route file for individual link operations.

**Location:** `/src/app/api/admin/items/[id]/links/[linkId]/route.ts`

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    console.log('Admin update link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { id: itemId, linkId } = await params;

    // Validate item access
    const accessResult = await validateItemAccess(itemId, user.id, userIsAdmin, accountId, supabase);
    if (!accessResult.canAccess) {
      return NextResponse.json(
        { success: false, error: accessResult.error },
        { status: accessResult.error === 'Item not found' ? 404 : 403 }
      );
    }

    // Fetch existing link
    const { data: existingLink, error: linkError } = await supabase
      .from('item_links')
      .select('*')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkError || !existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate link type if provided
    if (body.linkType) {
      const validLinkTypes = ['youtube', 'pdf', 'image', 'text', 'video'];
      if (!validLinkTypes.includes(body.linkType)) {
        return NextResponse.json(
          { success: false, error: `Invalid link type: ${body.linkType}` },
          { status: 400 }
        );
      }
    }

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return NextResponse.json(
          { success: false, error: `Invalid URL: ${body.url}` },
          { status: 400 }
        );
      }
    }

    // Detect if translatable field (title) has changed
    const newTitle = body.title !== undefined ? body.title : existingLink.title;
    const translatableFieldsChanged = newTitle !== existingLink.title;

    // Fetch language preferences for source language detection
    const [userPreferredLanguage, accountPreferredLanguage] = await Promise.all([
      getUserPreferredLanguage(supabase, user.id),
      getAccountPreferredLanguage(supabase, accountId)
    ]);

    // Determine source language
    const sourceLanguage = detectSourceLanguage({
      user: { preferred_language: userPreferredLanguage },
      account: { preferred_language: accountPreferredLanguage },
      override: body.sourceLanguage
    });

    // Update link in database
    const updateData: Record<string, any> = {
      source_language: sourceLanguage
    };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.linkType !== undefined) updateData.link_type = body.linkType;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    const { data: updatedLink, error: updateError } = await supabase
      .from('item_links')
      .update(updateData)
      .eq('id', linkId)
      .select()
      .single();

    if (updateError || !updatedLink) {
      console.error('Link update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update link' },
        { status: 500 }
      );
    }

    console.log('Link updated successfully:', updatedLink.id);

    // Translation handling
    let translationJobIds: string[] = [];
    let translationError: string | undefined;
    let queuedLanguages: SupportedLanguage[] = [];

    // Only process translations if title changed
    if (translatableFieldsChanged) {
      try {
        // Delete existing translations (guests see source content while re-translating)
        await deleteEntityTranslations('link', updatedLink.id);
        console.log('Existing translations deleted for link:', updatedLink.id);

        // Queue new translations
        const translationResult = await queueContentTranslations({
          content: {
            entityType: 'link',
            entityId: updatedLink.id,
            sourceLanguage,
            fields: [
              {
                fieldName: 'title',
                value: updatedLink.title,
                context: { contentType: 'link_title', domainContext: 'property_rental_media' },
                maxLength: 255
              }
              // NOTE: URL is NEVER included - URLs are not translated
            ]
          },
          trigger: 'update'
        });

        if (translationResult.success) {
          translationJobIds = translationResult.jobIds;
          queuedLanguages = translationResult.queuedLanguages;
          console.log('Translation jobs queued after link update:', translationJobIds.length);
        } else {
          translationError = translationResult.error;
        }
      } catch (error) {
        console.error('Translation update error:', error);
        translationError = error instanceof Error ? error.message : 'Unknown translation error';
      }
    } else {
      console.log('No translatable field changes - skipping translation queuing');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLink.id,
        itemId: updatedLink.item_id,
        articleId: updatedLink.article_id,
        title: updatedLink.title,
        linkType: updatedLink.link_type,
        url: updatedLink.url,
        thumbnailUrl: updatedLink.thumbnail_url,
        displayOrder: updatedLink.display_order || 0,
        createdAt: updatedLink.created_at
      },
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError }),
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Authorized Files and Functions for Modification

### Files to Create (NEW)

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/items/[id]/links/route.ts` | GET (list), POST (create) handlers for links |
| `/src/app/api/admin/items/[id]/links/[linkId]/route.ts` | GET (single), PUT (update), DELETE handlers for individual link |

### Files to Modify (UPDATE)

| File Path | Change Type | Lines Affected | Description |
|-----------|-------------|----------------|-------------|
| `/src/types/index.ts` | Modify | New types | Add CreateLinkRequest, UpdateLinkRequest, LinkResponse types |

### Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `GET` (list) | `/src/app/api/admin/items/[id]/links/route.ts` | List all links for an item |
| `POST` | `/src/app/api/admin/items/[id]/links/route.ts` | Create new link with translation |
| `GET` (single) | `/src/app/api/admin/items/[id]/links/[linkId]/route.ts` | Get single link details |
| `PUT` | `/src/app/api/admin/items/[id]/links/[linkId]/route.ts` | Update link with translation |
| `DELETE` | `/src/app/api/admin/items/[id]/links/[linkId]/route.ts` | Delete link |
| `getAccountContext` | Both route files | Extract account context from request |
| `getUserPreferredLanguage` | Both route files | Fetch user language preference |
| `getAccountPreferredLanguage` | Both route files | Fetch account language preference |
| `validateItemAccess` | Both route files | Validate item belongs to account |

### Types to Create/Extend

| Type | File | Description |
|------|------|-------------|
| `CreateLinkRequest` | `/src/types/index.ts` | Request body for POST with sourceLanguage |
| `UpdateLinkRequest` | `/src/types/index.ts` | Request body for PUT with sourceLanguage |
| `LinkResponse` | `/src/types/index.ts` | Response with translationJobIds, translationError, queuedLanguages |
| `LinksListResponse` | `/src/types/index.ts` | Response for GET list endpoint |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Import content translation functions |
| `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` function signature |
| `/src/lib/content-translation/source-language.ts` | `detectSourceLanguage` function signature |
| `/src/lib/content-translation/storage/translation-storage.ts` | `deleteEntityTranslations` function signature |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type definition |
| `/src/lib/auth-server.ts` | `validateAdminAuth` pattern reference |
| `/src/app/api/admin/items/[publicId]/route.ts` | Pattern reference for item access validation |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Pattern reference for similar API structure |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority | Dependencies |
|---|------|------|----------|--------------|
| 1 | Create `CreateLinkRequest` type | XS | Required | None |
| 2 | Create `UpdateLinkRequest` type | XS | Required | None |
| 3 | Create `LinkResponse` type | S | Required | None |
| 4 | Create `LinksListResponse` type | XS | Required | None |
| 5 | Create `/src/app/api/admin/items/[id]/links/route.ts` skeleton | S | Required | None |
| 6 | Implement `getAccountContext` helper | XS | Required | Task 5 |
| 7 | Implement `getUserPreferredLanguage` helper | XS | Required | Task 5 |
| 8 | Implement `getAccountPreferredLanguage` helper | XS | Required | Task 5 |
| 9 | Implement `validateItemAccess` helper | S | Required | Task 5 |
| 10 | Implement GET handler (list links) | S | Required | Tasks 6-9 |
| 11 | Implement POST handler with translation | M | Required | Tasks 6-9, 1, 3 |
| 12 | Create `/src/app/api/admin/items/[id]/links/[linkId]/route.ts` | S | Required | Task 5 |
| 13 | Implement GET handler (single link) | S | Required | Task 12 |
| 14 | Implement PUT handler with translation | M | Required | Task 12, 2, 3 |
| 15 | Implement DELETE handler | S | Required | Task 12 |
| 16 | Verify TypeScript compilation with `npm run build` | XS | Required | Tasks 1-15 |

### Implementation Order

1. **Phase 1 - Type Definitions:**
   - Tasks 1, 2, 3, 4: Create TypeScript types in `/src/types/index.ts`

2. **Phase 2 - Links List Route:**
   - Tasks 5, 6, 7, 8, 9: Create route file with helper functions
   - Task 10: Implement GET handler for listing links
   - Task 11: Implement POST handler with translation integration

3. **Phase 3 - Individual Link Route:**
   - Task 12: Create individual link route file
   - Task 13: Implement GET handler for single link
   - Task 14: Implement PUT handler with translation integration
   - Task 15: Implement DELETE handler

4. **Phase 4 - Verification:**
   - Task 16: Build and verify no TypeScript errors

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| POST handler accepts optional sourceLanguage parameter in request body | `body.sourceLanguage` field in `CreateLinkRequest` type |
| POST handler uses language detection utility when not explicitly provided | `detectSourceLanguage({ user, account, override: body.sourceLanguage })` |
| POST handler calls content translation orchestrator after successful link creation | `queueContentTranslations()` called after link insert succeeds |
| POST handler passes only the title field to the orchestrator (excludes URL field) | Only `title` field in `fields` array, URL never included |
| POST handler includes translationJobIds array in successful response payload | `translationJobIds` field in response object |
| POST handler includes translation error messages in response if orchestration fails | `translationError` field in response object (only when error occurs) |
| POST handler completes link creation even if translation queuing fails | Try/catch around translation code, link creation not affected |
| PUT handler identifies when the title field has changed | `translatableFieldsChanged` boolean comparison |
| PUT handler ignores URL field changes for translation purposes | Only `title` compared, URL changes don't trigger translation |
| PUT handler deletes existing translation records for the link before update | `deleteEntityTranslations('link', linkId)` call |
| PUT handler calls content translation orchestrator after successful update | `queueContentTranslations()` called after link update succeeds |
| PUT handler includes translationJobIds array in successful response payload | `translationJobIds` field in response object |
| PUT handler skips translation queuing if the title field is unchanged | Conditional check on `translatableFieldsChanged` |
| Both handlers maintain existing response structure with new fields added as non-breaking changes | New fields are optional, standard response structure maintained |
| Both handlers handle translation orchestrator errors gracefully without failing the primary operation | Try/catch blocks, errors logged, don't fail link operations |
| Response type definitions are updated to include optional translation-related fields | `LinkResponse` includes `translationJobIds?`, `translationError?`, `queuedLanguages?` |
| API documentation reflects new request parameters and response fields | JSDoc comments added to type definitions |

---

## Error Handling Strategy

### Translation Errors Should NOT Fail Link Operations

```typescript
// Correct pattern - translation errors are caught and reported but don't fail the primary operation
try {
  const translationResult = await queueContentTranslations(/* ... */);
  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    queuedLanguages = translationResult.queuedLanguages;
  } else {
    translationError = translationResult.error;
  }
} catch (error) {
  console.error('Translation queuing failed:', error);
  translationError = error instanceof Error ? error.message : 'Unknown translation error';
}

// Link creation/update succeeds regardless of translation status
return NextResponse.json({
  success: true, // Link operation succeeded
  data: { /* link data */ },
  translationJobIds, // May be empty if translation failed
  queuedLanguages,
  ...(translationError && { translationError }) // Only included if there was an error
}, { status: 201 }); // POST returns 201, PUT returns 200
```

### Error Scenarios

| Error Scenario | Handling | Response |
|---------------|----------|----------|
| Translation service unavailable | Catch error, log, continue | `{ success: true, translationError: "..." }` |
| Invalid source language in body | Fallback via `detectSourceLanguage` | Normal response |
| Database error deleting translations | Catch error, log, continue | `{ success: true, translationError: "..." }` |
| Job queue insert fails | Catch error, log, continue | `{ success: true, translationError: "..." }` |
| No language preferences found | Use English default | Normal response |
| Invalid URL provided | Return 400 error | `{ success: false, error: "Invalid URL" }` |
| Invalid link type | Return 400 error | `{ success: false, error: "Invalid link type" }` |
| Item not found | Return 404 error | `{ success: false, error: "Item not found" }` |
| Link not found | Return 404 error | `{ success: false, error: "Link not found" }` |
| Access denied | Return 403 error | `{ success: false, error: "Access denied" }` |

---

## Testing Considerations

### Unit Test Cases

1. **POST Handler Translation Integration**
   - Link created successfully with translations queued
   - Link created successfully when translation queuing fails
   - Source language from body.sourceLanguage override
   - Source language detected from user preference
   - Source language detected from account preference
   - Default English when no preferences set
   - translationJobIds array populated on success
   - translationError populated on failure
   - queuedLanguages shows 5 target languages (excluding source)
   - URL field is NEVER sent to translation (verify by mock)

2. **PUT Handler Translation Integration**
   - Translations re-queued when title changes
   - Translations skipped when only URL changes
   - Translations skipped when only linkType changes
   - Translations skipped when only displayOrder changes
   - Existing translations deleted before new ones queued
   - Update succeeds when translation deletion fails
   - Update succeeds when translation queuing fails
   - URL field never sent to translation even on title change

3. **Validation Tests**
   - Invalid link type rejected with 400
   - Invalid URL rejected with 400
   - Missing required fields rejected with 400
   - Invalid item ID returns 404
   - Invalid link ID returns 404
   - Unauthorized access returns 403

4. **Response Structure Validation**
   - POST response includes all required fields plus translation fields
   - PUT response includes all required fields plus translation fields
   - translationError only included when there's an error
   - translationJobIds is empty array (not undefined) when no jobs queued
   - Backward compatibility: standard response structure maintained

### Integration Test Cases

1. Create link -> Verify 5 translation jobs in `translation_jobs` table
2. Create link -> Verify `source_language` column populated on link
3. Create link -> Verify URL is NOT in any translation job payload
4. Update link title -> Verify old translations deleted from `link_translations`
5. Update link title -> Verify 5 new jobs queued in `translation_jobs`
6. Update link (only URL) -> Verify no new translation jobs created
7. Update link (only displayOrder) -> Verify no new translation jobs created
8. Create link with sourceLanguage='fr' -> Verify jobs have source_language='fr'
9. Create link without sourceLanguage -> Verify source detected from user preference
10. Delete link -> Verify link and translations removed

### Test File Locations

- Unit tests: `/src/app/api/admin/items/[id]/links/__tests__/route.test.ts`
- Unit tests: `/src/app/api/admin/items/[id]/links/[linkId]/__tests__/route.test.ts`
- Integration tests: `/src/tests/integration/links-translation.test.ts`

---

## Related Documentation

- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-010)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 2, Task 2.4)
- **Source Language Detection:** `/docs/REQ-E03-007-add-source-language-detection-utility-overview.md`
- **Content Translation Orchestrator:** `/docs/REQ-E03-002-implement-content-translation-orchestrator-overview.md`
- **Translation Storage:** `/docs/REQ-E03-005-implement-translation-storage-utilities-overview.md`
- **Items API Translation (similar pattern):** `/docs/REQ-E03-008-modify-items-api-to-trigger-translations-overview.md`
- **Articles API Translation (similar pattern):** `/docs/REQ-E03-009-modify-articles-api-to-trigger-translations-overview.md`
- **Existing Items API:** `/src/app/api/admin/items/route.ts`, `/src/app/api/admin/items/[publicId]/route.ts`
- **Existing Articles API:** `/src/app/api/admin/articles/[articleId]/route.ts`
- **Type Definitions:** `/src/types/index.ts`

---

## Notes

1. **URL Field Never Translated:** This is a critical requirement. The URL field is language-agnostic and must NEVER be sent to the translation service. Only the `title` field is translated.

2. **Backward Compatibility:** The new response fields (`translationJobIds`, `translationError`, `queuedLanguages`) are optional, so API consumers using the existing items/articles APIs for link management will not break.

3. **Non-Blocking Translation:** Translation queuing is designed to be non-blocking. If translation fails, the link creation/update still succeeds. This follows the principle that the primary operation should never fail due to secondary concerns.

4. **Dependency on Prior Tasks:** This task depends on:
   - REQ-E03-001: Content translation module structure
   - REQ-E03-002: Content translation orchestrator (`queueContentTranslations`)
   - REQ-E03-005: Translation storage utilities (`deleteEntityTranslations`)
   - REQ-E03-007: Source language detection utility (`detectSourceLanguage`)

5. **New API Endpoint:** This task creates a new dedicated Links API endpoint. The existing link management through items/articles APIs remains unchanged and continues to work.

6. **Change Detection Logic:** Only `title` is considered a translatable field. Changes to `url`, `linkType`, `thumbnailUrl`, `displayOrder`, or `articleId` do not trigger translation re-queuing.

7. **Delete Before Re-translate:** On update, existing translations are deleted before queuing new ones. This ensures guests see source language content while new translations are processing, rather than potentially stale translations.

8. **source_language Column:** The `source_language` column on links is populated on both create and update operations, ensuring it always reflects the current source language.

9. **Translation Context:** The translation context uses `contentType: 'link_title'` with `domainContext: 'property_rental_media'` to provide appropriate context to the translation service, as links typically reference media resources (videos, PDFs, images).

10. **Route Structure:** The implementation uses Next.js 15 App Router conventions with dynamic route segments `[id]` and `[linkId]`. The parameter access uses the Promise-based pattern as shown in existing routes.

---

## File Structure After Implementation

```
/src/app/api/admin/items/[id]/
├── route.ts                           # Existing (unchanged)
├── analytics/
│   └── route.ts                       # Existing (unchanged)
└── links/
    ├── route.ts                       # NEW: GET (list), POST handlers
    └── [linkId]/
        └── route.ts                   # NEW: GET, PUT, DELETE handlers
```

```typescript
// /src/types/index.ts (new types added)
export interface CreateLinkRequest {
  itemId: string;
  articleId?: string;
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  displayOrder?: number;
  sourceLanguage?: SupportedLanguage;
}

export interface UpdateLinkRequest {
  title?: string;
  linkType?: LinkType;
  url?: string;
  thumbnailUrl?: string;
  displayOrder?: number;
  sourceLanguage?: SupportedLanguage;
}

export interface LinkResponse {
  success: boolean;
  data?: {
    id: string;
    itemId: string;
    articleId?: string;
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    createdAt: string;
  };
  error?: string;
  accountContext?: { accountId: string | null; accountRole: string };
  translationJobIds?: string[];
  translationError?: string;
  queuedLanguages?: SupportedLanguage[];
}
```
