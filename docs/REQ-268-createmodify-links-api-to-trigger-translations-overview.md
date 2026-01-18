# REQ-268: Modify Links API to Trigger Content Translations - Implementation Breakdown

**Document Generated:** 2026-01-18 21:45 UTC
**Last Modified:** 2026-01-18 21:45 UTC
**Request Reference:** REQ-268 (Modify Links API to Trigger Content Translations)
**Implementation Plan Reference:** [Plan-111-L10N-Epic3-Dynamic-Content-Translation.md](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
**Epic:** Localization Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.4
**Size:** M (Medium)

---

## Overview

This document provides a detailed implementation breakdown for modifying the Links API to automatically trigger content translations when links are created or updated. The API must queue translation jobs for link titles while explicitly preserving the original URL across all languages. This ensures international guests can understand the purpose of each link without manual translation management by property owners.

### Context from Implementation Plan

From the Implementation Plan (Phase 2, Task 2.4):

> **Task 2.4: Create/Modify Links API to trigger translations**
> - File: `/src/app/api/admin/items/[id]/links/route.ts`
> - **POST handler:**
>   - Queue link title translation after creation
> - **PUT handler:**
>   - Delete existing link translations
>   - Queue new translations

### Key Requirements

1. **Title-Only Translation:** Only the link's `title` field should be translated; the URL must remain unchanged across all languages
2. **Async Processing:** Translation operations must not block the API response
3. **Optional Source Language:** Accept optional `sourceLanguage` parameter, defaulting to detected user/account language
4. **Response Enhancement:** Include `translationJobIds` in the API response
5. **Graceful Degradation:** Translation failures must not cause link operations to fail

---

## Current State Analysis

### Existing API Endpoints

The Links API currently does **not exist** as a dedicated route. Links are currently managed through:

| Current Pattern | Location | How Links Are Handled |
|-----------------|----------|----------------------|
| Item Creation | `src/app/api/admin/items/route.ts` POST | Links created inline with item |
| Item Update | `src/app/api/admin/items/[publicId]/route.ts` PUT | Links deleted and recreated |
| Article Update | `src/app/api/admin/articles/[articleId]/route.ts` PUT | Links updated via article |

### Required: New Links API Route

This task requires **creating a new API route** at:
```
/src/app/api/admin/items/[id]/links/route.ts
```

The route will provide dedicated CRUD operations for links, enabling:
- Independent link management without full item updates
- Translation triggering on link-specific operations
- Better separation of concerns

### Existing API Patterns

The codebase follows these established patterns (from `src/app/api/admin/articles/route.ts`):

1. **Authentication:** `validateAdminAuth(request)` returns `{ user, isAdmin, supabase }`
2. **Account Context:** `getAccountContext(request, userId, isAdmin, supabase)` for multi-tenant filtering
3. **Response Format:** `{ success: boolean, data?: T, error?: string, accountContext?: {...} }`
4. **Validation:** UUID format validation, required field checks, type validation
5. **Error Handling:** Consistent error responses with status codes (400, 401, 403, 404, 500)

### Database Schema

**item_links table (from `src/lib/supabase.ts:213`):**
```typescript
item_links: {
  Row: {
    id: string
    item_id: string | null
    article_id: string | null
    title: string
    link_type: string
    url: string
    thumbnail_url: string | null
    display_order: number | null
    created_at: string | null
  }
}
```

**Epic 1 Translation Infrastructure (Required):**
- `link_translations` table: Stores translated link titles per language
- `translation_jobs` table: Queue for pending translation jobs
- Source language columns added to content tables

---

## Technical Approach

### API Request/Response Contracts

#### POST /api/admin/items/[id]/links - Create Link

**Request:**
```typescript
interface CreateLinkRequest {
  title: string;
  linkType: 'youtube' | 'pdf' | 'image' | 'text' | 'video';
  url: string;
  thumbnailUrl?: string;
  displayOrder?: number;
  articleId?: string;           // Optional: Associate with article
  sourceLanguage?: string;      // NEW: Optional source language override
}
```

**Response:**
```typescript
interface CreateLinkResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    linkType: string;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    articleId?: string;
    createdAt: string;
  };
  translationJobIds?: string[];  // NEW: IDs of queued translation jobs
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

#### PUT /api/admin/items/[id]/links/[linkId] - Update Link

**Request:**
```typescript
interface UpdateLinkRequest {
  title?: string;
  linkType?: 'youtube' | 'pdf' | 'image' | 'text' | 'video';
  url?: string;
  thumbnailUrl?: string;
  displayOrder?: number;
  articleId?: string;
  sourceLanguage?: string;      // NEW: Optional source language override
}
```

**Response:**
```typescript
interface UpdateLinkResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    linkType: string;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    articleId?: string;
    updatedAt: string;
  };
  translationJobIds?: string[];  // NEW: IDs of newly queued translation jobs
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

#### GET /api/admin/items/[id]/links - List Links

**Response:**
```typescript
interface LinksListResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    linkType: string;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    articleId?: string;
    createdAt: string;
  }[];
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

#### DELETE /api/admin/items/[id]/links/[linkId] - Delete Link

**Response:**
```typescript
interface DeleteLinkResponse {
  success: boolean;
  message?: string;
  deletedLink?: {
    id: string;
    title: string;
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

### Translation Integration Flow

```
Link Create/Update Request
    |
    v
Links API Route Handler
    |
    +-- 1. Validate authentication & account context
    |
    +-- 2. Validate request data (URL, link type, etc.)
    |
    +-- 3. If UPDATE: Delete existing translations for this link
    |       DELETE FROM link_translations WHERE link_id = ?
    |
    +-- 4. Create/Update link in database
    |       INSERT/UPDATE item_links SET ...
    |
    +-- 5. Detect source language
    |       detectSourceLanguage(user, account, body.sourceLanguage)
    |
    +-- 6. Queue translation jobs (non-blocking)
    |       triggerLinkTranslation(linkId, sourceLanguage)
    |       - Only translates 'title' field
    |       - URL is NOT translated
    |       - Returns QueueTranslationResult
    |
    +-- 7. Return response with translationJobIds
    |       (even if translation queueing fails, link operation succeeds)
    |
    v
Response: { success: true, data: link, translationJobIds: [...] }
```

---

## Implementation Tasks

### Task 1: Create Links API Route File [Foundation]

**Objective:** Create the new API route file with proper structure and helper functions.

**File:** `src/app/api/admin/items/[id]/links/route.ts` (NEW)

**Implementation:**

```typescript
/**
 * REQ-268: Links API Endpoints with Translation Triggers
 * Created: 2026-01-18
 *
 * GET /api/admin/items/[id]/links - List links for an item
 * POST /api/admin/items/[id]/links - Create a new link
 * PUT /api/admin/items/[id]/links?linkId=xxx - Update a link
 * DELETE /api/admin/items/[id]/links?linkId=xxx - Delete a link
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
// Epic 3 imports (available after REQ-260, REQ-261, REQ-265 are implemented)
// import { triggerLinkTranslation } from '@/lib/content-translation';
// import { detectSourceLanguage } from '@/lib/content-translation/source-language';

// Helper function to extract account context from request
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: any
) {
  // ... (copy from existing articles/route.ts pattern)
}

// Helper function to validate item access within account context
async function validateItemAccess(
  itemId: string,
  userId: string,
  isAdmin: boolean,
  accountId: string | null,
  supabase: any
) {
  // Validate the item exists and user has access
  // Returns { canAccess: boolean, item?: any, error?: Response }
}
```

**Verification:**
- [ ] File created at correct location
- [ ] Helper functions match existing patterns
- [ ] Imports are correct

---

### Task 2: Implement GET Handler - List Links [Core]

**Objective:** Implement GET endpoint to list all links for an item.

**File:** `src/app/api/admin/items/[id]/links/route.ts`

**Implementation:**

```typescript
// GET /api/admin/items/[id]/links
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Admin list links API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    const { id: itemId } = await params;

    // Validate UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID format' },
        { status: 400 }
      );
    }

    // Validate item access
    const accessResult = await validateItemAccess(itemId, user.id, userIsAdmin, accountId, supabase);
    if (!accessResult.canAccess) {
      return accessResult.error;
    }

    // Fetch links for the item
    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('id, title, link_type, url, thumbnail_url, display_order, article_id, created_at')
      .eq('item_id', itemId)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Links fetch error:', linksError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch links' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      data: (links || []).map(link => ({
        id: link.id,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url,
        displayOrder: link.display_order || 0,
        articleId: link.article_id,
        createdAt: link.created_at
      })),
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- [ ] Returns links for valid item ID
- [ ] Access control enforced
- [ ] Response matches contract

---

### Task 3: Implement POST Handler - Create Link with Translation [Core]

**Objective:** Implement POST endpoint to create a link and queue translation jobs.

**File:** `src/app/api/admin/items/[id]/links/route.ts`

**Implementation:**

```typescript
// POST /api/admin/items/[id]/links
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Admin create link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    const { id: itemId } = await params;

    // Validate UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID format' },
        { status: 400 }
      );
    }

    // Validate item access
    const accessResult = await validateItemAccess(itemId, user.id, userIsAdmin, accountId, supabase);
    if (!accessResult.canAccess) {
      return accessResult.error;
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.linkType || !body.url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, linkType, and url' },
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

    // Get max display order for this item
    const { data: maxOrderResult } = await supabase
      .from('item_links')
      .select('display_order')
      .eq('item_id', itemId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextDisplayOrder = body.displayOrder ?? ((maxOrderResult?.display_order || 0) + 1);

    // Create the link
    const { data: newLink, error: linkError } = await supabase
      .from('item_links')
      .insert({
        item_id: itemId,
        article_id: body.articleId || null,
        title: body.title,
        link_type: body.linkType,
        url: body.url,
        thumbnail_url: body.thumbnailUrl || null,
        display_order: nextDisplayOrder
      })
      .select()
      .single();

    if (linkError) {
      console.error('Link creation error:', linkError);
      return NextResponse.json(
        { success: false, error: 'Failed to create link' },
        { status: 500 }
      );
    }

    console.log('Link created successfully:', newLink.id);

    // Queue translation jobs (non-blocking)
    let translationJobIds: string[] = [];
    try {
      // Detect source language
      // const sourceLanguage = detectSourceLanguage(user, account, body.sourceLanguage);
      const sourceLanguage = body.sourceLanguage || 'en'; // Placeholder until Epic 1 complete

      // Queue link title translation
      // const translationResult = await triggerLinkTranslation(newLink.id, sourceLanguage);
      // translationJobIds = translationResult.jobIds;

      // TODO: Uncomment above when Epic 1/3 infrastructure is ready
      console.log(`Translation queued for link ${newLink.id} from ${sourceLanguage}`);
    } catch (translationError) {
      // Log but don't fail the request
      console.error('Translation queueing error (non-blocking):', translationError);
    }

    const response = {
      success: true,
      data: {
        id: newLink.id,
        title: newLink.title,
        linkType: newLink.link_type,
        url: newLink.url,
        thumbnailUrl: newLink.thumbnail_url,
        displayOrder: newLink.display_order || 0,
        articleId: newLink.article_id,
        createdAt: newLink.created_at
      },
      translationJobIds,
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- [ ] Link created successfully
- [ ] Translation jobs queued (when infrastructure ready)
- [ ] Translation failure doesn't fail link creation
- [ ] Response includes translationJobIds
- [ ] Access control enforced

---

### Task 4: Implement PUT Handler - Update Link with Translation [Core]

**Objective:** Implement PUT endpoint to update a link, delete old translations, and queue new translation jobs.

**File:** `src/app/api/admin/items/[id]/links/route.ts`

**Implementation:**

```typescript
// PUT /api/admin/items/[id]/links?linkId=xxx
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Admin update link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    const { id: itemId } = await params;

    // Get linkId from query params
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    // Validate UUID formats
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID format' },
        { status: 400 }
      );
    }
    if (!linkId || !uuidRegex.test(linkId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing linkId parameter' },
        { status: 400 }
      );
    }

    // Validate item access
    const accessResult = await validateItemAccess(itemId, user.id, userIsAdmin, accountId, supabase);
    if (!accessResult.canAccess) {
      return accessResult.error;
    }

    // Verify link belongs to item
    const { data: existingLink, error: linkCheckError } = await supabase
      .from('item_links')
      .select('id, title')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkCheckError || !existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found or does not belong to this item' },
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

    // Delete existing translations for this link (before update)
    // This ensures stale translations are removed
    const { error: deleteTranslationsError } = await supabase
      .from('link_translations')
      .delete()
      .eq('link_id', linkId);

    if (deleteTranslationsError) {
      // Log but don't fail - table may not exist yet (Epic 1 dependency)
      console.warn('Could not delete existing translations:', deleteTranslationsError.message);
    } else {
      console.log(`Deleted existing translations for link ${linkId}`);
    }

    // Build update data
    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.linkType !== undefined) updateData.link_type = body.linkType;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;
    if (body.articleId !== undefined) updateData.article_id = body.articleId;

    // Update the link
    const { data: updatedLink, error: updateError } = await supabase
      .from('item_links')
      .update(updateData)
      .eq('id', linkId)
      .select()
      .single();

    if (updateError) {
      console.error('Link update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update link' },
        { status: 500 }
      );
    }

    console.log('Link updated successfully:', updatedLink.id);

    // Queue new translation jobs (non-blocking)
    let translationJobIds: string[] = [];
    try {
      // Detect source language
      // const sourceLanguage = detectSourceLanguage(user, account, body.sourceLanguage);
      const sourceLanguage = body.sourceLanguage || 'en'; // Placeholder until Epic 1 complete

      // Queue link title translation
      // const translationResult = await triggerLinkTranslation(updatedLink.id, sourceLanguage);
      // translationJobIds = translationResult.jobIds;

      // TODO: Uncomment above when Epic 1/3 infrastructure is ready
      console.log(`Translation queued for updated link ${updatedLink.id} from ${sourceLanguage}`);
    } catch (translationError) {
      // Log but don't fail the request
      console.error('Translation queueing error (non-blocking):', translationError);
    }

    const response = {
      success: true,
      data: {
        id: updatedLink.id,
        title: updatedLink.title,
        linkType: updatedLink.link_type,
        url: updatedLink.url,
        thumbnailUrl: updatedLink.thumbnail_url,
        displayOrder: updatedLink.display_order || 0,
        articleId: updatedLink.article_id,
        updatedAt: new Date().toISOString()
      },
      translationJobIds,
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:**
- [ ] Link updated successfully
- [ ] Existing translations deleted before update
- [ ] New translation jobs queued (when infrastructure ready)
- [ ] Translation failure doesn't fail link update
- [ ] Response includes translationJobIds
- [ ] Link ownership verified

---

### Task 5: Implement DELETE Handler [Core]

**Objective:** Implement DELETE endpoint to remove a link (translations cascade deleted).

**File:** `src/app/api/admin/items/[id]/links/route.ts`

**Implementation:**

```typescript
// DELETE /api/admin/items/[id]/links?linkId=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Admin delete link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    const { id: itemId } = await params;

    // Get linkId from query params
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    // Validate UUID formats
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID format' },
        { status: 400 }
      );
    }
    if (!linkId || !uuidRegex.test(linkId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing linkId parameter' },
        { status: 400 }
      );
    }

    // Validate item access
    const accessResult = await validateItemAccess(itemId, user.id, userIsAdmin, accountId, supabase);
    if (!accessResult.canAccess) {
      return accessResult.error;
    }

    // Get link info before deletion
    const { data: linkToDelete, error: linkCheckError } = await supabase
      .from('item_links')
      .select('id, title')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkCheckError || !linkToDelete) {
      return NextResponse.json(
        { success: false, error: 'Link not found or does not belong to this item' },
        { status: 404 }
      );
    }

    // Delete the link (translations should cascade delete via FK constraint)
    const { error: deleteError } = await supabase
      .from('item_links')
      .delete()
      .eq('id', linkId);

    if (deleteError) {
      console.error('Link deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete link' },
        { status: 500 }
      );
    }

    console.log(`Link deleted by: ${user.email}, linkId: ${linkId}`);

    return NextResponse.json({
      success: true,
      message: `Link "${linkToDelete.title}" has been deleted successfully`,
      deletedLink: {
        id: linkToDelete.id,
        title: linkToDelete.title
      },
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

**Verification:**
- [ ] Link deleted successfully
- [ ] Translations cascade deleted
- [ ] Access control enforced
- [ ] Response includes deleted link info

---

### Task 6: Enable Translation Integration [Enhancement]

**Objective:** Uncomment and integrate translation triggers when Epic 1/3 infrastructure is ready.

**File:** `src/app/api/admin/items/[id]/links/route.ts`

**Changes Required (when dependencies available):**

```typescript
// At top of file, add imports:
import { triggerLinkTranslation } from '@/lib/content-translation';
import { detectSourceLanguage } from '@/lib/content-translation/source-language';

// In POST handler, replace placeholder with:
const sourceLanguage = await detectSourceLanguage(
  authResult.user,
  accountContext.account,
  body.sourceLanguage
);
const translationResult = await triggerLinkTranslation(newLink.id, sourceLanguage);
translationJobIds = translationResult.jobIds || [];

// In PUT handler, replace placeholder with:
const sourceLanguage = await detectSourceLanguage(
  authResult.user,
  accountContext.account,
  body.sourceLanguage
);
const translationResult = await triggerLinkTranslation(updatedLink.id, sourceLanguage);
translationJobIds = translationResult.jobIds || [];
```

**Verification:**
- [ ] Imports resolve correctly
- [ ] detectSourceLanguage returns valid language code
- [ ] triggerLinkTranslation queues jobs for 5 target languages
- [ ] Only title field is translated (not URL)
- [ ] translationJobIds populated in responses

---

## Authorized Files and Functions for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/admin/items/[id]/links/route.ts` | Links API with CRUD operations and translation triggers |

### Files to Reference (Read-Only Patterns)

| File | Pattern to Follow |
|------|-------------------|
| `src/app/api/admin/articles/route.ts` | Authentication, account context, validation patterns |
| `src/app/api/admin/articles/[articleId]/route.ts` | Single resource CRUD pattern |
| `src/app/api/admin/items/[publicId]/route.ts` | validateItemAccess pattern |

### Future Integration Files (When Epic 1/3 Ready)

| File | Integration Point |
|------|-------------------|
| `src/lib/content-translation/index.ts` | Import triggerLinkTranslation |
| `src/lib/content-translation/source-language.ts` | Import detectSourceLanguage |
| `src/lib/content-translation/triggers/link-trigger.ts` | Link-specific translation trigger |

---

## Dependencies

### Required Before This Task

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | **REQUIRED** | Translation tables, job queue |
| REQ-260 Content Translation Orchestrator | **REQUIRED** | queueContentTranslations function |
| REQ-261 Entity-Specific Triggers | **REQUIRED** | triggerLinkTranslation function |
| REQ-265 Source Language Detection | **REQUIRED** | detectSourceLanguage utility |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| Phase 3: Job Processing | Processes translation jobs queued by this API |
| Phase 4: Translation Status API | Allows checking translation status for links |
| Epic 4: Guest Experience | Displays translated link titles to guests |

---

## Testing Strategy

### Unit Tests

1. **GET Handler:**
   - Returns links for valid item
   - Handles empty links array
   - Returns 404 for invalid item

2. **POST Handler:**
   - Creates link with all fields
   - Validates required fields
   - Validates link type enum
   - Validates URL format
   - Returns 201 with new link data

3. **PUT Handler:**
   - Updates link fields
   - Validates link belongs to item
   - Deletes existing translations before update
   - Returns updated link data

4. **DELETE Handler:**
   - Deletes link successfully
   - Returns 404 for non-existent link
   - Verifies link belongs to item

### Integration Tests

1. **Translation Queueing (when infrastructure ready):**
   - POST queues 5 translation jobs (one per target language)
   - PUT deletes old translations and queues new jobs
   - Translation errors don't fail link operations

2. **Account Context:**
   - Regular user can only access own links
   - Admin can access any link

### E2E Tests

1. **Full CRUD Flow:**
   - Create link -> verify in DB
   - Update link -> verify changes
   - Delete link -> verify removal

2. **Translation Flow (when infrastructure ready):**
   - Create link -> verify translation jobs queued
   - Check translation status endpoint
   - Verify translated content available

---

## Acceptance Criteria (from REQ-268)

- [ ] The POST handler in `/src/app/api/admin/items/[id]/links/route.ts` accepts an optional sourceLanguage field in the request body
- [ ] After successful link creation, the POST handler calls triggerLinkTranslation with the new link identifier and source language
- [ ] The POST response includes a translationJobIds field containing identifiers for queued translation jobs
- [ ] The PUT handler deletes all existing translations for the link before updating
- [ ] After successful link update, the PUT handler calls triggerLinkTranslation with the updated link identifier and source language
- [ ] The PUT response includes a translationJobIds field containing identifiers for newly queued translation jobs
- [ ] Translation queueing failures do not cause the link create or update operation to fail
- [ ] Translation queueing errors are logged but do not prevent the API from returning a successful response for link operations
- [ ] When sourceLanguage is not provided, the API uses the source language detection utility to determine the appropriate source language
- [ ] The implementation uses triggerLinkTranslation function which only translates the title field and explicitly excludes URL from translation
- [ ] The implementation integrates with the content translation orchestrator and entity-specific triggers established in REQ-260 and REQ-261

---

## Rollback Plan

If implementation needs to be reversed:

1. **Delete API Route:** Remove `src/app/api/admin/items/[id]/links/route.ts`
2. **Links Continue Via Items API:** Links management reverts to inline handling in items route
3. **No Translation Impact:** Translation tables unaffected (managed by Epic 1)

---

## Success Criteria

- [ ] GET endpoint returns links for item
- [ ] POST creates link and queues translations
- [ ] PUT updates link, deletes old translations, queues new translations
- [ ] DELETE removes link
- [ ] Access control properly enforced
- [ ] Translation failures don't break link operations
- [ ] Response includes translationJobIds
- [ ] URL field is never translated (only title)
- [ ] Source language detection works with fallback chain

---

## References

- **Request:** REQ-268 in `/docs/gen_requests_epic3.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Epic 1 Plan:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Similar Pattern:** REQ-266 (Items API), REQ-267 (Articles API)
- **Existing Links Handling:** `/src/app/api/admin/items/route.ts`
- **Database Types:** `/src/lib/supabase.ts`
