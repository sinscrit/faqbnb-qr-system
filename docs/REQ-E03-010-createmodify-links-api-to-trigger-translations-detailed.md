# Detailed Task Breakdown: REQ-E03-010 - Create/Modify Links API to Trigger Translations

**Request ID:** REQ-E03-010
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.4
**Type:** ENHANCEMENT
**Size:** M
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 19:45:00 UTC

---

## Overview

This document provides a granular, step-by-step task breakdown for creating a dedicated Links API endpoint and integrating translation workflows into link creation and update operations. The implementation creates new endpoints at `/api/admin/items/[publicId]/links/` for managing links independently with automatic translation triggering.

**Reference Documents:**
- Overview: `/docs/REQ-E03-010-createmodify-links-api-to-trigger-translations-overview.md`
- Requirements: `/docs/gen_requests_epic3.md` (Request #10)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

---

## Prerequisites

Before starting this task, ensure the following are complete:

- [ ] REQ-E03-001: Content translation module structure exists at `/src/lib/content-translation/`
- [ ] REQ-E03-002: Content translation orchestrator (`queueContentTranslations`) is implemented
- [ ] REQ-E03-005: Translation storage utilities (`deleteEntityTranslations`) are implemented
- [ ] REQ-E03-007: Source language detection utility (`detectSourceLanguage`) is implemented
- [ ] Epic 1 foundation tables exist: `link_translations`, `translation_jobs`
- [ ] `item_links.source_language` column exists in database

---

## Task Breakdown

### Phase 1: Type Definitions (Tasks 1-4)

---

#### Task 1: Create CreateLinkRequest Type

**File:** `/src/types/index.ts`
**Action:** ADD
**Location:** After line ~307 (after `ArticlesListResponse` interface)

**Code to Add:**
```typescript
/**
 * Request payload for creating a link via dedicated Links API.
 * Used with POST /api/admin/items/[publicId]/links
 * @see REQ-E03-010 Links API with translation integration
 */
export interface CreateLinkRequest {
  /** Optional article ID for article-specific links */
  articleId?: string;
  /** Link title - this field gets translated */
  title: string;
  /** Type of link resource */
  linkType: LinkType;
  /** URL - NEVER translated (URLs are language-agnostic) */
  url: string;
  /** Optional thumbnail URL */
  thumbnailUrl?: string;
  /** Display order in list */
  displayOrder?: number;
  /**
   * Optional source language override for translations.
   * If not provided, detected from user/account preferences.
   * @see detectSourceLanguage in content-translation module
   */
  sourceLanguage?: SupportedLanguage;
}
```

**Verification:**
- TypeScript compiles without errors
- `CreateLinkRequest` is exported from `/src/types/index.ts`
- Run: `npx tsc --noEmit`

---

#### Task 2: Create UpdateLinkRequest Type

**File:** `/src/types/index.ts`
**Action:** ADD
**Location:** Immediately after `CreateLinkRequest` interface

**Code to Add:**
```typescript
/**
 * Request payload for updating a link via dedicated Links API.
 * Used with PUT /api/admin/items/[publicId]/links/[linkId]
 * All fields are optional - only provided fields are updated.
 * @see REQ-E03-010 Links API with translation integration
 */
export interface UpdateLinkRequest {
  /** Link title - this field gets translated */
  title?: string;
  /** Type of link resource */
  linkType?: LinkType;
  /** URL - NEVER translated (URLs are language-agnostic) */
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

**Verification:**
- TypeScript compiles without errors
- `UpdateLinkRequest` is exported from `/src/types/index.ts`

---

#### Task 3: Create LinkApiResponse Type

**File:** `/src/types/index.ts`
**Action:** ADD
**Location:** Immediately after `UpdateLinkRequest` interface

**Code to Add:**
```typescript
/**
 * Response from Link API operations (POST, PUT, GET single).
 * Includes translation job information for status tracking.
 * @see REQ-E03-010 Links API with translation integration
 */
export interface LinkApiResponse {
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
    sourceLanguage?: string;
    createdAt: string;
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  /**
   * Array of translation job IDs for status tracking.
   * Empty array if translation queuing was skipped or failed.
   */
  translationJobIds?: string[];
  /**
   * Translation error message if queuing failed.
   * Link creation/update still succeeds even if translation fails.
   */
  translationError?: string;
  /**
   * Languages queued for translation (excludes source language).
   */
  queuedLanguages?: SupportedLanguage[];
}
```

**Verification:**
- TypeScript compiles without errors
- `LinkApiResponse` is exported from `/src/types/index.ts`

---

#### Task 4: Create LinksListApiResponse Type

**File:** `/src/types/index.ts`
**Action:** ADD
**Location:** Immediately after `LinkApiResponse` interface

**Code to Add:**
```typescript
/**
 * Response from Link API list operation (GET all links for item).
 * @see REQ-E03-010 Links API with translation integration
 */
export interface LinksListApiResponse {
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
    sourceLanguage?: string;
    createdAt: string;
  }[];
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

**Verification:**
- TypeScript compiles without errors
- `LinksListApiResponse` is exported from `/src/types/index.ts`
- All four new types are importable: `import { CreateLinkRequest, UpdateLinkRequest, LinkApiResponse, LinksListApiResponse } from '@/types';`

---

### Phase 2: Links List Route File (Tasks 5-11)

---

#### Task 5: Create Links Route Directory Structure

**Action:** CREATE directory and file
**Path:** `/src/app/api/admin/items/[publicId]/links/route.ts`

**Commands to execute:**
```bash
mkdir -p /Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/api/admin/items/\[publicId\]/links
touch /Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/api/admin/items/\[publicId\]/links/route.ts
```

**File initial content:**
```typescript
/**
 * REQ-E03-010: Links CRUD Endpoints with Translation Integration
 *
 * GET /api/admin/items/[publicId]/links - List all links for an item
 * POST /api/admin/items/[publicId]/links - Create new link with translation trigger
 *
 * Created: 2026-01-20
 * Last Modified: 2026-01-20 19:45:00 UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

// Placeholder - implement handlers in subsequent tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}
```

**Verification:**
- File exists at correct path
- TypeScript compiles without errors
- Run: `curl -X GET http://localhost:3000/api/admin/items/test/links` returns 501

---

#### Task 6: Add Required Imports to Links Route

**File:** `/src/app/api/admin/items/[publicId]/links/route.ts`
**Action:** UPDATE
**Location:** Replace lines 1-15 with complete imports

**Code to Replace With:**
```typescript
/**
 * REQ-E03-010: Links CRUD Endpoints with Translation Integration
 *
 * GET /api/admin/items/[publicId]/links - List all links for an item
 * POST /api/admin/items/[publicId]/links - Create new link with translation trigger
 *
 * Created: 2026-01-20
 * Last Modified: 2026-01-20 19:45:00 UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  queueContentTranslations,
  detectSourceLanguage,
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type { CreateLinkRequest, LinkApiResponse, LinksListApiResponse } from '@/types';
```

**Verification:**
- TypeScript compiles without errors
- All imports resolve correctly

---

#### Task 7: Implement Helper Functions

**File:** `/src/app/api/admin/items/[publicId]/links/route.ts`
**Action:** ADD
**Location:** After imports, before GET handler

**Code to Add:**
```typescript
// Valid link types
const VALID_LINK_TYPES = ['youtube', 'pdf', 'image', 'text', 'video'] as const;

/**
 * Extract account context from request headers.
 * Follows pattern from /src/app/api/admin/items/route.ts
 */
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<{ accountId: string | null; accountRole: string; error?: NextResponse }> {
  const accountIdHeader = request.headers.get('x-account-id');

  if (isAdmin && !accountIdHeader) {
    // Admin without account context - can access all
    return { accountId: null, accountRole: 'admin' };
  }

  if (accountIdHeader) {
    // Validate account access
    const { data: accountUser, error } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId)
      .eq('account_id', accountIdHeader)
      .single();

    if (error || !accountUser) {
      return {
        accountId: null,
        accountRole: '',
        error: NextResponse.json(
          { success: false, error: 'Access denied to specified account' },
          { status: 403 }
        )
      };
    }

    return { accountId: accountUser.account_id, accountRole: accountUser.role };
  }

  // Non-admin without account header - get default account
  const { data: accountUser, error } = await supabase
    .from('account_users')
    .select('account_id, role')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !accountUser) {
    return {
      accountId: null,
      accountRole: '',
      error: NextResponse.json(
        { success: false, error: 'No account access' },
        { status: 403 }
      )
    };
  }

  return { accountId: accountUser.account_id, accountRole: accountUser.role };
}

/**
 * Fetch user's preferred language from database.
 */
async function getUserPreferredLanguage(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('preferred_language')
    .eq('id', userId)
    .single();
  return data?.preferred_language || null;
}

/**
 * Fetch account's preferred language from database.
 */
async function getAccountPreferredLanguage(
  supabase: any,
  accountId: string | null
): Promise<string | null> {
  if (!accountId) return null;
  const { data } = await supabase
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();
  return data?.preferred_language || null;
}

/**
 * Resolve item ID from publicId and validate access.
 */
async function resolveAndValidateItemAccess(
  publicId: string,
  userId: string,
  isAdmin: boolean,
  accountId: string | null,
  supabase: any
): Promise<{ itemId: string | null; error?: NextResponse }> {
  // Get item by publicId with property and account information
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      public_id,
      name,
      property_id,
      properties!left(account_id, user_id)
    `)
    .eq('public_id', publicId)
    .single();

  if (error || !item) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    };
  }

  const itemProperty = item.properties;

  // Admin without account context can access all
  if (isAdmin && !accountId) {
    return { itemId: item.id };
  }

  // Admin with account context - verify item belongs to account
  if (isAdmin && accountId) {
    if (itemProperty?.account_id !== accountId) {
      return {
        itemId: null,
        error: NextResponse.json(
          { success: false, error: 'Item does not belong to the specified account' },
          { status: 403 }
        )
      };
    }
    return { itemId: item.id };
  }

  // Non-admin - verify item belongs to user's account
  const canAccess = itemProperty?.account_id === accountId;
  if (!canAccess) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      )
    };
  }

  return { itemId: item.id };
}
```

**Verification:**
- TypeScript compiles without errors
- Helper functions are accessible within the file

---

#### Task 8: Implement GET Handler (List Links)

**File:** `/src/app/api/admin/items/[publicId]/links/route.ts`
**Action:** UPDATE
**Location:** Replace placeholder GET handler

**Code:**
```typescript
/**
 * GET /api/admin/items/[publicId]/links
 * List all links for an item, ordered by display_order.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<LinksListApiResponse>> {
  try {
    console.log('Admin list links API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    // Fetch links for this item
    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('id, item_id, article_id, title, link_type, url, thumbnail_url, display_order, source_language, created_at')
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
        articleId: link.article_id || undefined,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url || undefined,
        displayOrder: link.display_order || 0,
        sourceLanguage: link.source_language || undefined,
        createdAt: link.created_at
      })),
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Links GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- TypeScript compiles without errors
- Test with curl: `curl -X GET http://localhost:3000/api/admin/items/{publicId}/links -H "Authorization: Bearer {token}"`

---

#### Task 9: Implement POST Handler - Validation Section

**File:** `/src/app/api/admin/items/[publicId]/links/route.ts`
**Action:** UPDATE
**Location:** Replace placeholder POST handler

**Code (Part 1 - Validation):**
```typescript
/**
 * POST /api/admin/items/[publicId]/links
 * Create a new link with translation trigger.
 * Only the title field is translated - URLs are never translated.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<LinkApiResponse>> {
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
    const { publicId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    // Parse and validate request body
    const body: CreateLinkRequest = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required field: title' },
        { status: 400 }
      );
    }

    if (!body.linkType || !VALID_LINK_TYPES.includes(body.linkType as any)) {
      return NextResponse.json(
        { success: false, error: `Invalid link type: ${body.linkType}. Valid types: ${VALID_LINK_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: `Invalid URL format: ${body.url}` },
        { status: 400 }
      );
    }

    // Validate articleId if provided
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

    // Continue to Task 10 for database insert and translation...
```

**Note:** This is Part 1 of the POST handler. Continue to Task 10 for completion.

---

#### Task 10: Implement POST Handler - Database Insert Section

**File:** `/src/app/api/admin/items/[publicId]/links/route.ts`
**Action:** UPDATE (continue from Task 9)
**Location:** Inside POST handler, after validation section

**Code (Part 2 - Database Insert):**
```typescript
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
        title: body.title.trim(),
        link_type: body.linkType,
        url: body.url,
        thumbnail_url: body.thumbnailUrl || null,
        display_order: body.displayOrder ?? 0,
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

    // Continue to Task 11 for translation queuing...
```

**Note:** This is Part 2 of the POST handler. Continue to Task 11 for completion.

---

#### Task 11: Implement POST Handler - Translation Queuing Section

**File:** `/src/app/api/admin/items/[publicId]/links/route.ts`
**Action:** UPDATE (continue from Task 10)
**Location:** Inside POST handler, after database insert section

**Code (Part 3 - Translation & Response):**
```typescript
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
        articleId: newLink.article_id || undefined,
        title: newLink.title,
        linkType: newLink.link_type,
        url: newLink.url,
        thumbnailUrl: newLink.thumbnail_url || undefined,
        displayOrder: newLink.display_order || 0,
        sourceLanguage: newLink.source_language || undefined,
        createdAt: newLink.created_at
      },
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError }),
      accountContext: { accountId, accountRole }
    }, { status: 201 });
  } catch (error) {
    console.error('Links POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- TypeScript compiles without errors
- POST handler creates link successfully
- Translation jobs are queued (verify in `translation_jobs` table)
- Response includes `translationJobIds` array
- Response includes `queuedLanguages` array (5 languages excluding source)
- URL field is NOT in any translation job payload

---

### Phase 3: Individual Link Route File (Tasks 12-16)

---

#### Task 12: Create Individual Link Route File

**Action:** CREATE file
**Path:** `/src/app/api/admin/items/[publicId]/links/[linkId]/route.ts`

**Commands to execute:**
```bash
mkdir -p /Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/api/admin/items/\[publicId\]/links/\[linkId\]
touch /Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/api/admin/items/\[publicId\]/links/\[linkId\]/route.ts
```

**Initial file content:**
```typescript
/**
 * REQ-E03-010: Individual Link Operations with Translation Integration
 *
 * GET /api/admin/items/[publicId]/links/[linkId] - Get single link
 * PUT /api/admin/items/[publicId]/links/[linkId] - Update link with translation trigger
 * DELETE /api/admin/items/[publicId]/links/[linkId] - Delete link
 *
 * Created: 2026-01-20
 * Last Modified: 2026-01-20 19:45:00 UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  queueContentTranslations,
  detectSourceLanguage,
  deleteEntityTranslations
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type { UpdateLinkRequest, LinkApiResponse } from '@/types';

// Valid link types
const VALID_LINK_TYPES = ['youtube', 'pdf', 'image', 'text', 'video'] as const;

// Helper functions (same as parent route file)
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<{ accountId: string | null; accountRole: string; error?: NextResponse }> {
  const accountIdHeader = request.headers.get('x-account-id');

  if (isAdmin && !accountIdHeader) {
    return { accountId: null, accountRole: 'admin' };
  }

  if (accountIdHeader) {
    const { data: accountUser, error } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId)
      .eq('account_id', accountIdHeader)
      .single();

    if (error || !accountUser) {
      return {
        accountId: null,
        accountRole: '',
        error: NextResponse.json(
          { success: false, error: 'Access denied to specified account' },
          { status: 403 }
        )
      };
    }

    return { accountId: accountUser.account_id, accountRole: accountUser.role };
  }

  const { data: accountUser, error } = await supabase
    .from('account_users')
    .select('account_id, role')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !accountUser) {
    return {
      accountId: null,
      accountRole: '',
      error: NextResponse.json(
        { success: false, error: 'No account access' },
        { status: 403 }
      )
    };
  }

  return { accountId: accountUser.account_id, accountRole: accountUser.role };
}

async function getUserPreferredLanguage(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('preferred_language')
    .eq('id', userId)
    .single();
  return data?.preferred_language || null;
}

async function getAccountPreferredLanguage(
  supabase: any,
  accountId: string | null
): Promise<string | null> {
  if (!accountId) return null;
  const { data } = await supabase
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();
  return data?.preferred_language || null;
}

async function resolveAndValidateItemAccess(
  publicId: string,
  userId: string,
  isAdmin: boolean,
  accountId: string | null,
  supabase: any
): Promise<{ itemId: string | null; error?: NextResponse }> {
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      public_id,
      name,
      property_id,
      properties!left(account_id, user_id)
    `)
    .eq('public_id', publicId)
    .single();

  if (error || !item) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    };
  }

  const itemProperty = item.properties;

  if (isAdmin && !accountId) {
    return { itemId: item.id };
  }

  if (isAdmin && accountId) {
    if (itemProperty?.account_id !== accountId) {
      return {
        itemId: null,
        error: NextResponse.json(
          { success: false, error: 'Item does not belong to the specified account' },
          { status: 403 }
        )
      };
    }
    return { itemId: item.id };
  }

  const canAccess = itemProperty?.account_id === accountId;
  if (!canAccess) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      )
    };
  }

  return { itemId: item.id };
}

// Placeholder handlers - implement in subsequent tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
) {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
) {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
) {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}
```

**Verification:**
- File exists at correct path
- TypeScript compiles without errors

---

#### Task 13: Implement GET Handler (Single Link)

**File:** `/src/app/api/admin/items/[publicId]/links/[linkId]/route.ts`
**Action:** UPDATE
**Location:** Replace placeholder GET handler

**Code:**
```typescript
/**
 * GET /api/admin/items/[publicId]/links/[linkId]
 * Get a single link by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
): Promise<NextResponse<LinkApiResponse>> {
  try {
    console.log('Admin get link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId, linkId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    // Fetch the specific link
    const { data: link, error: linkError } = await supabase
      .from('item_links')
      .select('id, item_id, article_id, title, link_type, url, thumbnail_url, display_order, source_language, created_at')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: link.id,
        itemId: link.item_id,
        articleId: link.article_id || undefined,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url || undefined,
        displayOrder: link.display_order || 0,
        sourceLanguage: link.source_language || undefined,
        createdAt: link.created_at
      },
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Link GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- TypeScript compiles without errors
- GET returns link data for valid linkId
- GET returns 404 for invalid linkId

---

#### Task 14: Implement PUT Handler (Update Link with Translation)

**File:** `/src/app/api/admin/items/[publicId]/links/[linkId]/route.ts`
**Action:** UPDATE
**Location:** Replace placeholder PUT handler

**Code:**
```typescript
/**
 * PUT /api/admin/items/[publicId]/links/[linkId]
 * Update a link with translation trigger.
 * Only re-queues translations when title field changes.
 * URL changes do NOT trigger translation workflows.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
): Promise<NextResponse<LinkApiResponse>> {
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
    const { publicId, linkId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

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

    // Parse and validate request body
    const body: UpdateLinkRequest = await request.json();

    // Validate link type if provided
    if (body.linkType !== undefined && !VALID_LINK_TYPES.includes(body.linkType as any)) {
      return NextResponse.json(
        { success: false, error: `Invalid link type: ${body.linkType}. Valid types: ${VALID_LINK_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate URL if provided
    if (body.url !== undefined) {
      try {
        new URL(body.url);
      } catch {
        return NextResponse.json(
          { success: false, error: `Invalid URL format: ${body.url}` },
          { status: 400 }
        );
      }
    }

    // Detect if translatable field (title only) has changed
    const newTitle = body.title !== undefined ? body.title.trim() : existingLink.title;
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

    // Build update data object
    const updateData: Record<string, any> = {
      source_language: sourceLanguage
    };
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.linkType !== undefined) updateData.link_type = body.linkType;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    // Update link in database
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

    // Translation handling - only process if title changed
    let translationJobIds: string[] = [];
    let translationError: string | undefined;
    let queuedLanguages: SupportedLanguage[] = [];

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
        articleId: updatedLink.article_id || undefined,
        title: updatedLink.title,
        linkType: updatedLink.link_type,
        url: updatedLink.url,
        thumbnailUrl: updatedLink.thumbnail_url || undefined,
        displayOrder: updatedLink.display_order || 0,
        sourceLanguage: updatedLink.source_language || undefined,
        createdAt: updatedLink.created_at
      },
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError }),
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Link PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- TypeScript compiles without errors
- PUT with title change: translations deleted + new jobs queued
- PUT without title change: no translation jobs created
- PUT with only URL change: no translation jobs created
- Response includes `translationJobIds` when translations queued
- Existing translations are deleted before new ones queued

---

#### Task 15: Implement DELETE Handler

**File:** `/src/app/api/admin/items/[publicId]/links/[linkId]/route.ts`
**Action:** UPDATE
**Location:** Replace placeholder DELETE handler

**Code:**
```typescript
/**
 * DELETE /api/admin/items/[publicId]/links/[linkId]
 * Delete a link. Translations are cascade-deleted by database FK constraint.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
): Promise<NextResponse> {
  try {
    console.log('Admin delete link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId, linkId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    // Verify link exists and belongs to item
    const { data: existingLink, error: linkError } = await supabase
      .from('item_links')
      .select('id')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkError || !existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Delete link (translations cascade-deleted via FK constraint)
    const { error: deleteError } = await supabase
      .from('item_links')
      .delete()
      .eq('id', linkId);

    if (deleteError) {
      console.error('Link delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete link' },
        { status: 500 }
      );
    }

    console.log('Link deleted successfully:', linkId);

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Link DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- TypeScript compiles without errors
- DELETE removes link from database
- Translations are cascade-deleted (verify FK constraint)
- Returns 404 for non-existent link

---

### Phase 4: Verification (Task 16)

---

#### Task 16: Build Verification and Integration Testing

**Action:** VERIFY

**Commands to execute:**
```bash
# 1. Verify TypeScript compilation
cd /Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus
npm run build

# 2. Run type checking
npx tsc --noEmit

# 3. Verify new types are exported
grep -n "CreateLinkRequest\|UpdateLinkRequest\|LinkApiResponse\|LinksListApiResponse" src/types/index.ts

# 4. Verify route files exist
ls -la src/app/api/admin/items/\[publicId\]/links/
ls -la src/app/api/admin/items/\[publicId\]/links/\[linkId\]/
```

**Integration Test Cases to Verify:**

1. **POST - Create Link with Translation:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/items/{publicId}/links \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Getting Started Video",
       "linkType": "youtube",
       "url": "https://youtube.com/watch?v=abc123"
     }'
   ```
   Expected: 201 response with `translationJobIds` array containing 5 job IDs

2. **GET - List Links:**
   ```bash
   curl -X GET http://localhost:3000/api/admin/items/{publicId}/links \
     -H "Authorization: Bearer {token}"
   ```
   Expected: 200 response with links array

3. **PUT - Update Link Title (triggers translation):**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/items/{publicId}/links/{linkId} \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"title": "Updated Video Title"}'
   ```
   Expected: 200 response with `translationJobIds` array

4. **PUT - Update Link URL (no translation):**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/items/{publicId}/links/{linkId} \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://youtube.com/watch?v=newvideo"}'
   ```
   Expected: 200 response with empty `translationJobIds` array

5. **DELETE - Remove Link:**
   ```bash
   curl -X DELETE http://localhost:3000/api/admin/items/{publicId}/links/{linkId} \
     -H "Authorization: Bearer {token}"
   ```
   Expected: 200 response with success message

**Database Verification:**
```sql
-- Verify translation jobs created for link
SELECT * FROM translation_jobs
WHERE entity_type = 'link'
AND entity_id = '{linkId}'
ORDER BY created_at DESC;

-- Verify source_language populated on link
SELECT id, title, source_language FROM item_links WHERE id = '{linkId}';

-- Verify translations deleted on update (check link_translations is empty during re-translation)
SELECT * FROM link_translations WHERE link_id = '{linkId}';
```

**Verification Checklist:**
- [ ] `npm run build` completes without errors
- [ ] `npx tsc --noEmit` passes
- [ ] POST creates link and queues 5 translation jobs
- [ ] POST response includes `translationJobIds` array
- [ ] POST response includes `queuedLanguages` array
- [ ] GET list returns all links for item
- [ ] GET single returns specific link
- [ ] PUT with title change deletes old translations and queues new jobs
- [ ] PUT without title change does not queue translation jobs
- [ ] PUT with only URL change does not queue translation jobs
- [ ] DELETE removes link and translations cascade-deleted
- [ ] `source_language` column populated on link records
- [ ] URL field is NEVER included in translation job payload (verify by inspecting jobs)

---

## Complete File Listings

### File: `/src/app/api/admin/items/[publicId]/links/route.ts`

Full consolidated code for Tasks 5-11:

```typescript
/**
 * REQ-E03-010: Links CRUD Endpoints with Translation Integration
 *
 * GET /api/admin/items/[publicId]/links - List all links for an item
 * POST /api/admin/items/[publicId]/links - Create new link with translation trigger
 *
 * Created: 2026-01-20
 * Last Modified: 2026-01-20 19:45:00 UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  queueContentTranslations,
  detectSourceLanguage,
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type { CreateLinkRequest, LinkApiResponse, LinksListApiResponse } from '@/types';

// Valid link types
const VALID_LINK_TYPES = ['youtube', 'pdf', 'image', 'text', 'video'] as const;

/**
 * Extract account context from request headers.
 * Follows pattern from /src/app/api/admin/items/route.ts
 */
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<{ accountId: string | null; accountRole: string; error?: NextResponse }> {
  const accountIdHeader = request.headers.get('x-account-id');

  if (isAdmin && !accountIdHeader) {
    return { accountId: null, accountRole: 'admin' };
  }

  if (accountIdHeader) {
    const { data: accountUser, error } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId)
      .eq('account_id', accountIdHeader)
      .single();

    if (error || !accountUser) {
      return {
        accountId: null,
        accountRole: '',
        error: NextResponse.json(
          { success: false, error: 'Access denied to specified account' },
          { status: 403 }
        )
      };
    }

    return { accountId: accountUser.account_id, accountRole: accountUser.role };
  }

  const { data: accountUser, error } = await supabase
    .from('account_users')
    .select('account_id, role')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !accountUser) {
    return {
      accountId: null,
      accountRole: '',
      error: NextResponse.json(
        { success: false, error: 'No account access' },
        { status: 403 }
      )
    };
  }

  return { accountId: accountUser.account_id, accountRole: accountUser.role };
}

/**
 * Fetch user's preferred language from database.
 */
async function getUserPreferredLanguage(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('preferred_language')
    .eq('id', userId)
    .single();
  return data?.preferred_language || null;
}

/**
 * Fetch account's preferred language from database.
 */
async function getAccountPreferredLanguage(
  supabase: any,
  accountId: string | null
): Promise<string | null> {
  if (!accountId) return null;
  const { data } = await supabase
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();
  return data?.preferred_language || null;
}

/**
 * Resolve item ID from publicId and validate access.
 */
async function resolveAndValidateItemAccess(
  publicId: string,
  userId: string,
  isAdmin: boolean,
  accountId: string | null,
  supabase: any
): Promise<{ itemId: string | null; error?: NextResponse }> {
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      public_id,
      name,
      property_id,
      properties!left(account_id, user_id)
    `)
    .eq('public_id', publicId)
    .single();

  if (error || !item) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    };
  }

  const itemProperty = item.properties;

  if (isAdmin && !accountId) {
    return { itemId: item.id };
  }

  if (isAdmin && accountId) {
    if (itemProperty?.account_id !== accountId) {
      return {
        itemId: null,
        error: NextResponse.json(
          { success: false, error: 'Item does not belong to the specified account' },
          { status: 403 }
        )
      };
    }
    return { itemId: item.id };
  }

  const canAccess = itemProperty?.account_id === accountId;
  if (!canAccess) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      )
    };
  }

  return { itemId: item.id };
}

/**
 * GET /api/admin/items/[publicId]/links
 * List all links for an item, ordered by display_order.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<LinksListApiResponse>> {
  try {
    console.log('Admin list links API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId } = await params;

    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('id, item_id, article_id, title, link_type, url, thumbnail_url, display_order, source_language, created_at')
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
        articleId: link.article_id || undefined,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url || undefined,
        displayOrder: link.display_order || 0,
        sourceLanguage: link.source_language || undefined,
        createdAt: link.created_at
      })),
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Links GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/items/[publicId]/links
 * Create a new link with translation trigger.
 * Only the title field is translated - URLs are never translated.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<LinkApiResponse>> {
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
    const { publicId } = await params;

    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;
    const body: CreateLinkRequest = await request.json();

    // Validation
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required field: title' },
        { status: 400 }
      );
    }

    if (!body.linkType || !VALID_LINK_TYPES.includes(body.linkType as any)) {
      return NextResponse.json(
        { success: false, error: `Invalid link type: ${body.linkType}. Valid types: ${VALID_LINK_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: `Invalid URL format: ${body.url}` },
        { status: 400 }
      );
    }

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

    // Language detection
    const [userPreferredLanguage, accountPreferredLanguage] = await Promise.all([
      getUserPreferredLanguage(supabase, user.id),
      getAccountPreferredLanguage(supabase, accountId)
    ]);

    const sourceLanguage = detectSourceLanguage({
      user: { preferred_language: userPreferredLanguage },
      account: { preferred_language: accountPreferredLanguage },
      override: body.sourceLanguage
    });

    // Create link
    const { data: newLink, error: insertError } = await supabase
      .from('item_links')
      .insert({
        item_id: itemId,
        article_id: body.articleId || null,
        title: body.title.trim(),
        link_type: body.linkType,
        url: body.url,
        thumbnail_url: body.thumbnailUrl || null,
        display_order: body.displayOrder ?? 0,
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

    // Queue translations
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
        articleId: newLink.article_id || undefined,
        title: newLink.title,
        linkType: newLink.link_type,
        url: newLink.url,
        thumbnailUrl: newLink.thumbnail_url || undefined,
        displayOrder: newLink.display_order || 0,
        sourceLanguage: newLink.source_language || undefined,
        createdAt: newLink.created_at
      },
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError }),
      accountContext: { accountId, accountRole }
    }, { status: 201 });
  } catch (error) {
    console.error('Links POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task | Verification |
|---------------------|------|--------------|
| POST handler accepts optional sourceLanguage parameter | Task 1, 9 | `body.sourceLanguage` in `CreateLinkRequest` |
| POST handler uses language detection utility when not explicitly provided | Task 10 | `detectSourceLanguage()` call |
| POST handler calls content translation orchestrator after successful link creation | Task 11 | `queueContentTranslations()` after insert |
| POST handler passes only the title field to the orchestrator | Task 11 | Only `title` in `fields` array |
| POST handler includes translationJobIds array in response | Task 11 | Response includes `translationJobIds` |
| POST handler includes translation error messages if orchestration fails | Task 11 | Response includes `translationError` when error |
| POST handler completes link creation even if translation queuing fails | Task 11 | Try/catch around translation code |
| PUT handler identifies when title field has changed | Task 14 | `translatableFieldsChanged` boolean |
| PUT handler ignores URL field changes for translation purposes | Task 14 | Only title compared |
| PUT handler deletes existing translations before update | Task 14 | `deleteEntityTranslations()` call |
| PUT handler calls orchestrator after successful update | Task 14 | `queueContentTranslations()` after update |
| PUT handler includes translationJobIds in response | Task 14 | Response includes `translationJobIds` |
| PUT handler skips translation if title unchanged | Task 14 | Conditional on `translatableFieldsChanged` |
| Both handlers maintain existing response structure | Tasks 3-4, 11, 14 | Standard response with optional new fields |
| Both handlers handle translation errors gracefully | Tasks 11, 14 | Try/catch blocks |
| Response types include optional translation fields | Tasks 3-4 | `LinkApiResponse` type definition |

---

## Error Handling Reference

| Error Scenario | HTTP Status | Response |
|---------------|-------------|----------|
| Missing/invalid title | 400 | `{ success: false, error: "Missing or invalid required field: title" }` |
| Invalid link type | 400 | `{ success: false, error: "Invalid link type: {type}" }` |
| Missing URL | 400 | `{ success: false, error: "Missing required field: url" }` |
| Invalid URL format | 400 | `{ success: false, error: "Invalid URL format: {url}" }` |
| Invalid article ID | 400 | `{ success: false, error: "Invalid article ID..." }` |
| Item not found | 404 | `{ success: false, error: "Item not found" }` |
| Link not found | 404 | `{ success: false, error: "Link not found" }` |
| Access denied | 403 | `{ success: false, error: "Access denied to item" }` |
| No account access | 403 | `{ success: false, error: "No account access" }` |
| Database error | 500 | `{ success: false, error: "Failed to create/update/fetch link" }` |
| Translation error | 200/201 | `{ success: true, ..., translationError: "..." }` |

---

## Notes

1. **URL Field Never Translated:** The URL field is intentionally excluded from all translation operations. URLs are language-agnostic.

2. **Route Parameter:** Uses `[publicId]` to match existing item API patterns, not `[id]`.

3. **Helper Function Duplication:** Helper functions are duplicated between route files. Consider extracting to shared utility in future refactoring.

4. **Non-Blocking Translation:** Translation operations are wrapped in try/catch to ensure link CRUD operations always succeed even if translation fails.

5. **Source Language Population:** The `source_language` column is always populated on link records.

6. **Translation Deletion on Update:** Existing translations are deleted before new ones are queued, ensuring guests see source language content while new translations process.

---

*Document generated: 2026-01-20 19:45:00 UTC*
*Pipeline: Epic 3 Dynamic Content Translation*
*Phase: 2 - Modify Existing Content APIs*
*Task: 2.4 - Create/Modify Links API to Trigger Translations*
