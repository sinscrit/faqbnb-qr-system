# REQ-344: Create/Modify Links API to Trigger Translations - Detailed Task Breakdown
*Generated: 2026-01-19 16:15:00 UTC*
*Last Modified: 2026-01-19 16:15:00 UTC*

## Reference
- **Request**: REQ-344 (Modify Links API to Trigger Translations)
- **Overview Document**: docs/REQ-344-createmodify-links-api-to-trigger-translations-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: Enhancement
- **Phase**: 2 - Modify Existing Content APIs
- **Task ID**: 2.4
- **Size**: M
- **Estimated Story Points**: 5

## Goals Summary
1. Create a dedicated Links API route file at `/src/app/api/admin/items/[publicId]/links/route.ts`
2. Implement GET, POST, PUT, DELETE handlers for CRUD operations on item links
3. POST handler queues link title translations after successful link creation
4. PUT handler deletes existing link translations before queuing new ones
5. All translation operations are non-blocking - API responses return immediately
6. Source language detection uses the standard utility from Task 2.1
7. Integration with content translation orchestrator from Tasks 1.2/1.3

## Dependencies (Must Be Completed First)
| Dependency | Task | Description | Status Check |
|------------|------|-------------|--------------|
| Epic 1 Foundation | - | Translation tables, translation service, job queue | `ls src/lib/translation-service/` |
| Task 1.1 | Content Translation Types | Type definitions for content translation | `ls src/lib/content-translation/content-translation.types.ts` |
| Task 1.2 | Content Translation Orchestrator | `queueContentTranslations()` function | `grep -r "queueContentTranslations" src/` |
| Task 1.3 | Link Trigger | `triggerLinkTranslation()` function | `ls src/lib/content-translation/triggers/link-trigger.ts` |
| Task 2.1 | Source Language Detection | `detectSourceLanguage()` utility | `ls src/lib/content-translation/source-language.ts` |

---

## Detailed Tasks

### Task 1: Create Links API Route File Structure (1 SP)

**File**: `/src/app/api/admin/items/[publicId]/links/route.ts` (NEW FILE)

**Objective**: Create the new API route file with proper imports and helper functions.

**Steps**:

1.1. Create the directory structure if it doesn't exist:
```bash
mkdir -p src/app/api/admin/items/[publicId]/links
```

1.2. Create the route file with base imports:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
```

1.3. Copy the `validateAdminAuth` helper function from `/src/app/api/admin/items/[publicId]/route.ts`:
- This function validates authentication and returns user, isAdmin, and supabase client
- Keep the exact same implementation for consistency

1.4. Copy the `getAccountContext` helper function from `/src/app/api/admin/items/[publicId]/route.ts`:
- This function extracts account context from request
- Required for multi-tenant access control

1.5. Create a `validateItemAccess` helper specific to links operations:
- Accepts `publicId`, `userId`, `isAdmin`, `accountId`, `supabaseClient`
- Returns the item record with its internal `id` needed for link operations
- Returns appropriate error responses for not found or access denied

1.6. Add translation-related imports (these will be available after dependency tasks):
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

**Acceptance Criteria**:
- [ ] File exists at `/src/app/api/admin/items/[publicId]/links/route.ts`
- [ ] All helper functions are implemented and match existing patterns
- [ ] TypeScript compiles without errors
- [ ] Imports are correctly structured

---

### Task 2: Implement GET Handler (0.5 SP)

**File**: `/src/app/api/admin/items/[publicId]/links/route.ts`

**Objective**: Return all links for a specific item.

**Steps**:

2.1. Implement the GET handler function:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  // Implementation
}
```

2.2. Validate admin authentication using `validateAdminAuth(request)`

2.3. Get account context using `getAccountContext(request, user.id, userIsAdmin, supabase)`

2.4. Extract and validate the `publicId` parameter:
- Await the params promise
- Validate UUID format using regex

2.5. Validate item access within account context using `validateItemAccess`

2.6. Fetch links from `item_links` table:
```typescript
const { data: links, error: linksError } = await supabase
  .from('item_links')
  .select('id, title, link_type, url, thumbnail_url, display_order, created_at')
  .eq('item_id', item.id)
  .order('display_order', { ascending: true });
```

2.7. Transform and return the response with proper typing

**Response Contract**:
```typescript
{
  success: boolean;
  data?: {
    id: string;
    itemId: string;
    title: string;
    linkType: 'youtube' | 'pdf' | 'image' | 'text' | 'video';
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

**Acceptance Criteria**:
- [ ] Returns all links for the specified item
- [ ] Validates admin authentication
- [ ] Respects account context filtering
- [ ] Returns 401 if not authenticated
- [ ] Returns 404 if item not found
- [ ] Returns 403 if access denied to item
- [ ] Links are ordered by displayOrder ascending

---

### Task 3: Implement POST Handler with Translation Triggering (1.5 SP)

**File**: `/src/app/api/admin/items/[publicId]/links/route.ts`

**Objective**: Create a new link and queue translations for the link title.

**Steps**:

3.1. Implement the POST handler function:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  // Implementation
}
```

3.2. Validate authentication and account context (same as GET)

3.3. Parse and validate request body:
```typescript
interface CreateLinkRequest {
  title: string;           // Required
  linkType: string;        // Required: 'youtube' | 'pdf' | 'image' | 'text' | 'video'
  url: string;             // Required
  thumbnailUrl?: string;   // Optional
  displayOrder?: number;   // Optional
  articleId?: string;      // Optional: association with article
  sourceLanguage?: string; // Optional: override source language detection
}
```

3.4. Validate required fields:
```typescript
if (!body.title || !body.url || !body.linkType) {
  return NextResponse.json(
    { success: false, error: 'Missing required fields: title, url, linkType' },
    { status: 400 }
  );
}
```

3.5. Validate URL format:
```typescript
try {
  new URL(body.url);
} catch {
  return NextResponse.json(
    { success: false, error: `Invalid URL: ${body.url}` },
    { status: 400 }
  );
}
```

3.6. Validate linkType:
```typescript
const validLinkTypes = ['youtube', 'pdf', 'image', 'text', 'video'];
if (!validLinkTypes.includes(body.linkType)) {
  return NextResponse.json(
    { success: false, error: `Invalid link type: ${body.linkType}` },
    { status: 400 }
  );
}
```

3.7. Validate item access and get item.id

3.8. Determine display order if not provided:
```typescript
let displayOrder = body.displayOrder;
if (displayOrder === undefined) {
  const { data: maxOrderLink } = await supabase
    .from('item_links')
    .select('display_order')
    .eq('item_id', item.id)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();
  displayOrder = maxOrderLink ? (maxOrderLink.display_order || 0) + 1 : 0;
}
```

3.9. Insert the new link:
```typescript
const { data: newLink, error: insertError } = await supabase
  .from('item_links')
  .insert({
    item_id: item.id,
    title: body.title,
    link_type: body.linkType,
    url: body.url,
    thumbnail_url: body.thumbnailUrl || null,
    display_order: displayOrder,
    article_id: body.articleId || null
  })
  .select()
  .single();
```

3.10. Queue translations (non-blocking):
```typescript
let translationJobIds: string[] = [];
try {
  // Detect source language
  const sourceLanguage = detectSourceLanguage(user, accountContext, body.sourceLanguage);

  // Queue translations for link title
  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'link',
      entityId: newLink.id,
      sourceLanguage,
      fields: [
        {
          fieldName: 'title',
          value: newLink.title,
          context: { contentType: 'link_title', domain: 'property_rental' },
          maxLength: 255
        }
        // NOTE: URLs are NOT translated - only the title field
      ]
    },
    trigger: 'create'
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for link ${newLink.id}`);
  } else {
    console.error('Link translation queueing failed:', translationResult.error);
  }
} catch (translationError) {
  console.error('Error queueing link translations:', translationError);
  // Don't fail the link creation - translations can be retried later
}
```

3.11. Return success response with translationJobIds:
```typescript
return NextResponse.json({
  success: true,
  data: {
    id: newLink.id,
    itemId: item.id,
    title: newLink.title,
    linkType: newLink.link_type,
    url: newLink.url,
    thumbnailUrl: newLink.thumbnail_url || undefined,
    displayOrder: newLink.display_order || 0,
    createdAt: newLink.created_at,
    translationJobIds
  },
  accountContext: {
    accountId,
    accountRole
  }
});
```

**Acceptance Criteria**:
- [ ] Creates link in `item_links` table
- [ ] Validates required fields (title, linkType, url)
- [ ] Validates URL format
- [ ] Validates linkType is one of allowed values
- [ ] Auto-calculates displayOrder if not provided
- [ ] Calls `queueContentTranslations` after link creation
- [ ] Uses `detectSourceLanguage` for source language
- [ ] Includes `translationJobIds` in success response
- [ ] Link creation succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging
- [ ] Does not expose internal errors to client

---

### Task 4: Implement PUT Handler with Translation Deletion and Re-queuing (1.5 SP)

**File**: `/src/app/api/admin/items/[publicId]/links/route.ts`

**Objective**: Update an existing link, delete old translations, and queue new ones.

**Steps**:

4.1. Implement the PUT handler function:
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  // Implementation
}
```

4.2. Validate authentication and account context

4.3. Parse and validate request body:
```typescript
interface UpdateLinkRequest {
  id: string;              // Required: link ID to update
  title: string;           // Required
  linkType: string;        // Required
  url: string;             // Required
  thumbnailUrl?: string;   // Optional
  displayOrder?: number;   // Optional
  sourceLanguage?: string; // Optional
}
```

4.4. Validate required fields including link ID

4.5. Validate URL and linkType (same as POST)

4.6. Validate item access

4.7. Verify link exists and belongs to the item:
```typescript
const { data: existingLink, error: linkError } = await supabase
  .from('item_links')
  .select('id, item_id')
  .eq('id', body.id)
  .eq('item_id', item.id)
  .single();

if (linkError || !existingLink) {
  return NextResponse.json(
    { success: false, error: 'Link not found or does not belong to this item' },
    { status: 404 }
  );
}
```

4.8. Delete existing translations (non-blocking):
```typescript
try {
  const { error: deleteTranslationsError } = await supabase
    .from('link_translations')
    .delete()
    .eq('link_id', body.id);

  if (deleteTranslationsError) {
    console.error('Failed to delete existing link translations:', deleteTranslationsError);
    // Continue with update - don't fail the main operation
  } else {
    console.log(`Deleted existing translations for link ${body.id}`);
  }
} catch (deleteError) {
  console.error('Error deleting link translations:', deleteError);
  // Continue with update
}
```

4.9. Update the link:
```typescript
const { data: updatedLink, error: updateError } = await supabase
  .from('item_links')
  .update({
    title: body.title,
    link_type: body.linkType,
    url: body.url,
    thumbnail_url: body.thumbnailUrl || null,
    display_order: body.displayOrder ?? existingLink.display_order
  })
  .eq('id', body.id)
  .select()
  .single();
```

4.10. Queue new translations (same pattern as POST, but with trigger: 'update')

4.11. Return success response with translationJobIds

**Acceptance Criteria**:
- [ ] Validates link exists and belongs to item
- [ ] Deletes existing `link_translations` before update
- [ ] Translation deletion failure doesn't block update
- [ ] Updates link successfully before queueing translations
- [ ] Calls `queueContentTranslations` after link update
- [ ] Uses trigger: 'update' for proper priority (50)
- [ ] Uses `detectSourceLanguage` for source language
- [ ] Includes `translationJobIds` in success response
- [ ] Link update succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging

---

### Task 5: Implement DELETE Handler (0.5 SP)

**File**: `/src/app/api/admin/items/[publicId]/links/route.ts`

**Objective**: Delete a link (cascade will handle translation records).

**Steps**:

5.1. Implement the DELETE handler function:
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  // Implementation
}
```

5.2. Validate authentication and account context

5.3. Parse request body for link ID:
```typescript
interface DeleteLinkRequest {
  id: string;  // Required: link ID to delete
}
```

5.4. Validate item access

5.5. Verify link exists and belongs to the item

5.6. Delete the link:
```typescript
const { error: deleteError } = await supabase
  .from('item_links')
  .delete()
  .eq('id', body.id);

if (deleteError) {
  console.error('Link deletion error:', deleteError);
  return NextResponse.json(
    { success: false, error: 'Failed to delete link' },
    { status: 500 }
  );
}
```

5.7. Return success response:
```typescript
return NextResponse.json({
  success: true,
  message: `Link "${existingLink.title}" has been deleted successfully`,
  deletedLink: {
    id: body.id,
    title: existingLink.title
  },
  accountContext: {
    accountId,
    accountRole
  }
});
```

**Note**: The `link_translations` table should have a CASCADE delete constraint on `link_id` foreign key. Verify this exists in the database schema (Epic 1).

**Acceptance Criteria**:
- [ ] Validates link exists and belongs to item
- [ ] Deletes link from `item_links` table
- [ ] Cascade deletes handle `link_translations` records
- [ ] Returns success with deleted link info
- [ ] Returns 404 if link not found
- [ ] Returns 403 if access denied

---

### Task 6: TypeScript Compilation and Build Verification (0.5 SP)

**Objective**: Ensure all code compiles and integrates properly.

**Steps**:

6.1. Run TypeScript compilation:
```bash
npx tsc --noEmit
```

6.2. Fix any type errors

6.3. Run the development build:
```bash
npm run build
```

6.4. Verify no build errors

6.5. Test the API routes manually:
- Start dev server: `npm run dev`
- Test GET endpoint with existing item
- Test POST endpoint to create a link
- Test PUT endpoint to update a link
- Test DELETE endpoint to remove a link

**Acceptance Criteria**:
- [ ] TypeScript compilation succeeds without errors
- [ ] `npm run build` succeeds without errors
- [ ] All four handlers (GET, POST, PUT, DELETE) respond correctly
- [ ] Error responses have proper HTTP status codes

---

### Task 7: Database Verification (0.5 SP)

**Objective**: Verify database operations and translation job creation.

**Steps**:

7.1. After creating a link via POST, verify:
```sql
-- Check link was created
SELECT * FROM item_links WHERE id = '<new_link_id>';

-- Check translation jobs were queued
SELECT * FROM translation_jobs
WHERE entity_type = 'link'
AND entity_id = '<new_link_id>';
```

7.2. After updating a link via PUT, verify:
```sql
-- Check old translations were deleted
SELECT * FROM link_translations WHERE link_id = '<link_id>';

-- Check new translation jobs were queued
SELECT * FROM translation_jobs
WHERE entity_type = 'link'
AND entity_id = '<link_id>'
AND status = 'queued';
```

7.3. After deleting a link via DELETE, verify:
```sql
-- Check link was deleted
SELECT * FROM item_links WHERE id = '<deleted_link_id>';

-- Check translations were cascade deleted
SELECT * FROM link_translations WHERE link_id = '<deleted_link_id>';
```

7.4. Verify job records have correct properties:
- `entity_type = 'link'`
- `entity_id` matches link.id
- `priority = 100` for create, `50` for update
- `status = 'queued'`
- `source_language` is correctly detected
- 5 target languages (all except source)

**Acceptance Criteria**:
- [ ] Link records are created/updated/deleted correctly
- [ ] Translation jobs are created with entity_type='link'
- [ ] Job records have correct entity_id matching link.id
- [ ] Job records have appropriate priority
- [ ] 5 translation jobs are created (one per target language)
- [ ] link_translations records are deleted on link update
- [ ] link_translations records are cascade deleted on link deletion

---

## Translation Context Reference

Per the implementation plan, use this context for link title translations:

```typescript
const LINK_TRANSLATION_CONTEXT = {
  contentType: 'link_title' as const,
  domain: 'property_rental_media',
  systemPrompt: 'Translate a media link title (video, PDF, etc.) for vacation rental guests. Keep it descriptive but concise.'
};
```

## Link Fields for Translation

| Field | Translated | Reason |
|-------|------------|--------|
| `title` | Yes | Human-readable description of the link |
| `url` | No | URLs are universal |
| `thumbnailUrl` | No | URLs are universal |
| `linkType` | No | Enum value, not user-facing text |

## Supported Languages

| Language | Code | Source Language? |
|----------|------|-----------------|
| English | en | Default |
| French | fr | If detected |
| Spanish | es | If detected |
| German | de | If detected |
| Dutch | nl | If detected |
| Italian | it | If detected |

When content is saved, the source language is detected and excluded from target languages, resulting in 5 translation jobs per link.

## Error Handling Strategy

### Translation Failures Do NOT Block Link Operations
```typescript
try {
  // Translation queueing logic
} catch (translationError) {
  // Log error for debugging
  console.error('Link translation queueing error:', translationError);
  // Continue with success response - link was saved
  // translationJobIds will be empty array
}
```

### Response Always Includes translationJobIds
```typescript
// Even on translation failure, include the field
const response = {
  success: true,
  data: {
    // ... link data ...
    translationJobIds: translationJobIds // May be empty array
  }
};
```

## Testing Checklist

### Manual Testing
- [ ] Create a link for an existing item
- [ ] Verify link appears in GET response
- [ ] Verify translation_jobs table has 5 new records
- [ ] Update the link title
- [ ] Verify link_translations were deleted
- [ ] Verify new translation_jobs were created
- [ ] Delete the link
- [ ] Verify link is removed
- [ ] Verify cascade handled translations

### Error Cases
- [ ] Missing required fields returns 400
- [ ] Invalid URL format returns 400
- [ ] Invalid linkType returns 400
- [ ] Non-existent item returns 404
- [ ] Non-existent link (for PUT/DELETE) returns 404
- [ ] Access denied returns 403
- [ ] Unauthenticated request returns 401

### Translation Failure Cases
- [ ] Link creation succeeds when translation module not available
- [ ] Link update succeeds when translation deletion fails
- [ ] Response includes empty translationJobIds on failure

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `/src/app/api/admin/items/[publicId]/links/route.ts` | CREATE | New API route with GET, POST, PUT, DELETE handlers |

## Estimated Total Effort

| Task | Story Points |
|------|--------------|
| Task 1: Create File Structure | 1 |
| Task 2: GET Handler | 0.5 |
| Task 3: POST Handler with Translations | 1.5 |
| Task 4: PUT Handler with Translation Deletion | 1.5 |
| Task 5: DELETE Handler | 0.5 |
| Task 6: Build Verification | 0.5 |
| Task 7: Database Verification | 0.5 |
| **Total** | **6** |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dependencies not complete | Medium | High | Verify all Task 1.x and 2.1 are done before starting |
| Translation table schema mismatch | Low | Medium | Verify `link_translations` table exists with correct columns |
| Performance impact from translation queueing | Low | Low | Translation queueing is async, uses simple INSERT |
| Link deletion cascade not configured | Low | Medium | Verify FK constraint with ON DELETE CASCADE |

## Acceptance Criteria Mapping

| PRD Criteria | Task | Implementation |
|--------------|------|----------------|
| POST handler queues link title translation | Task 3 | `queueContentTranslations` call after insert |
| PUT handler deletes existing link translations | Task 4 | DELETE from `link_translations` before update |
| Translation queueing uses orchestrator | Task 3, 4 | Import from `@/lib/content-translation` |
| API responses return immediately | Task 3, 4 | Non-blocking try-catch wrapper |
| Errors don't block CRUD operations | Task 3, 4 | Translation in try-catch, continue on error |
| Source language detection | Task 3, 4 | `detectSourceLanguage()` utility |
| All supported languages covered | Task 3, 4 | Orchestrator handles language iteration |

---

*Document generated for FAQBNB Localization Epic 3 - Phase 2, Task 2.4*
