# Implementation Overview: REQ-E03-008 - Modify Items API to Trigger Translations

**Request ID:** REQ-E03-008
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.2
**Type:** ENHANCEMENT
**Size:** M
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 14:30 UTC

---

## Summary

Modify the items creation and update API endpoints to automatically initiate translation workflows when items are created or modified. The POST handler will trigger translations after successful item creation, and the PUT handler will delete existing translations before re-queuing new translations after updates. Both handlers will include translation job identifiers in their responses for status tracking.

---

## Background & Context

### Current State

The Items API consists of two route files that handle CRUD operations for items without any translation integration:

**POST Handler (`/src/app/api/admin/items/route.ts:267-561`)**
- Validates authentication via `validateAdminAuth` (imported from `@/lib/auth-server`)
- Extracts account context via local `getAccountContext` helper function
- Validates required fields (publicId, name, propertyId)
- Validates UUID format for publicId
- Validates links array structure and link types (youtube, pdf, image, text, video)
- Validates QR code URL if provided
- Validates article purpose if provided
- Creates item in database with fields: public_id, name, description, property_id, qr_code_url
- Optionally creates associated article and links
- Returns item data with nested articles and links without translation information

**PUT Handler (`/src/app/api/admin/items/[publicId]/route.ts:458-810`)**
- Uses local `validateAdminAuth` helper (duplicated from auth-server pattern)
- Validates item access within account context via `validateItemAccess` helper
- Validates required fields (name, propertyId)
- Validates links array structure and link types
- Updates item fields: name, description, property_id, tags, qr_code_url, qr_code_uploaded_at
- Deletes existing links and recreates them
- Handles article creation/updates (checks for existing article by purpose, updates or creates)
- Returns updated item data without translation information

### Existing Code Patterns

| Pattern | Location | Lines | Description |
|---------|----------|-------|-------------|
| Auth validation | `validateAdminAuth` | route.ts:6, [publicId]/route.ts:9-127 | Returns user, isAdmin, supabase client |
| Account context | `getAccountContext` | route.ts:10-83, [publicId]/route.ts:130-203 | Extracts accountId, accountRole |
| Item validation | `validateItemAccess` | [publicId]/route.ts:206-294 | Validates item belongs to account |
| Response format | Both files | Various | `{ success, data, accountContext }` |
| Error handling | Both files | Various | Returns `{ success: false, error, code }` with HTTP status |

### Problem Statement

1. When items are created, no translation process is initiated - content remains in original language only
2. When items are updated, existing translations become stale but are not replaced
3. API responses don't include translation job information for status tracking
4. There's no mechanism to pass source language for content translation
5. Translatable field changes (name, description) don't trigger re-translation
6. No `source_language` column is being set on items

### Solution Approach

Integrate the content translation orchestrator into both handlers:

1. **POST Handler Modifications:**
   - Accept optional `sourceLanguage` in request body
   - Use `detectSourceLanguage()` utility when not explicitly provided
   - After successful item creation, call `queueContentTranslations()`
   - Update item with `source_language` column
   - Include `translationJobIds` array in response

2. **PUT Handler Modifications:**
   - Detect when translatable fields (name, description) have changed
   - Delete existing item translations before update
   - Queue new translations after successful update
   - Update item with `source_language` column
   - Include `translationJobIds` array in response
   - Skip translation queuing if only non-translatable fields changed

---

## Technical Design

### Architecture Position

```
/src/app/api/admin/items/
├── route.ts                    # MODIFY: POST handler (lines 267-561)
└── [publicId]/
    └── route.ts                # MODIFY: PUT handler (lines 458-810)

/src/lib/content-translation/   # Dependencies (from prior tasks)
├── index.ts                    # Module exports
├── content-translation.ts      # queueContentTranslations()
├── content-translation.types.ts # Type definitions
├── source-language.ts          # detectSourceLanguage()
├── triggers/
│   └── item-trigger.ts         # triggerItemTranslation()
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
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Authentication (POST uses imported, PUT has local copy) |

### Database Schema Reference

**Items Table (`items`):**
```sql
id: uuid PRIMARY KEY
public_id: uuid UNIQUE
name: text NOT NULL
description: text
property_id: uuid REFERENCES properties(id)
source_language: text  -- Added in Epic 1, to be populated
qr_code_url: text
qr_code_uploaded_at: timestamptz
tags: text[]
created_at: timestamptz
updated_at: timestamptz
```

**Item Translations Table (`item_translations`):**
```sql
id: uuid PRIMARY KEY
item_id: uuid REFERENCES items(id) ON DELETE CASCADE
language: text NOT NULL  -- Target language code
name: text
description: text
translation_status: text  -- 'pending', 'completed', 'failed', 'manual'
translated_at: timestamptz
source_version_at: timestamptz
reviewed_by: uuid REFERENCES users(id)
created_at: timestamptz
updated_at: timestamptz
UNIQUE(item_id, language)
```

**Translation Jobs Table (`translation_jobs`):**
```sql
id: uuid PRIMARY KEY
entity_type: text NOT NULL  -- 'item', 'article', 'link', 'tag'
entity_id: uuid NOT NULL
source_language: text NOT NULL
target_language: text NOT NULL
status: text NOT NULL  -- 'queued', 'processing', 'completed', 'failed'
priority: integer DEFAULT 50
attempts: integer DEFAULT 0
error_message: text
created_at: timestamptz
started_at: timestamptz
completed_at: timestamptz
```

---

## Interface Contracts

### Extended Request Types

```typescript
// Extended CreateItemRequest (POST)
// File: /src/types/index.ts
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  articles?: {
    purpose: PurposeType;
    title: string;
    description?: string;
    displayOrder: number;
    links?: { /* ... */ }[];
  }[];
  /**
   * Optional source language override for translations.
   * If not provided, detected from user/account preferences.
   * @see detectSourceLanguage()
   */
  sourceLanguage?: SupportedLanguage;  // NEW
}
```

### Extended Response Types

```typescript
// Extended item response (both POST and PUT)
// File: /src/types/index.ts
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    links: { /* ... */ }[];
    articles?: { /* ... */ }[];
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
  translationJobIds?: string[];  // NEW

  /**
   * Translation error message if queuing failed.
   * Item creation/update still succeeds even if translation fails.
   */
  translationError?: string;  // NEW

  /**
   * Languages queued for translation.
   */
  queuedLanguages?: SupportedLanguage[];  // NEW
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
    entityType: 'item',
    entityId: newItem.id,
    sourceLanguage,
    fields: [
      {
        fieldName: 'name',
        value: newItem.name,
        context: { contentType: 'item_name', domainContext: 'property_rental_appliances' },
        maxLength: 255
      },
      {
        fieldName: 'description',
        value: newItem.description || '',
        context: { contentType: 'item_description', domainContext: 'property_rental_appliances' }
      }
    ]
  },
  trigger: 'create'
});
```

---

## Implementation Details

### POST Handler Modifications

**Location:** `/src/app/api/admin/items/route.ts`
**Function:** `POST` (lines 267-561)

**Step 1: Add imports at top of file (after line 7)**
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

**Step 2: Add helper function after `getAccountContext` (after line 83)**
```typescript
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
```

**Step 3: After successful item creation (after line 432), add translation logic**
```typescript
// After: console.log('Item created successfully:', newItem.id);

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

// Update item with source_language
await supabase
  .from('items')
  .update({ source_language: sourceLanguage })
  .eq('id', newItem.id);

// Queue translations (non-blocking - errors don't fail item creation)
let translationJobIds: string[] = [];
let translationError: string | undefined;
let queuedLanguages: SupportedLanguage[] = [];

try {
  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'item',
      entityId: newItem.id,
      sourceLanguage,
      fields: [
        {
          fieldName: 'name',
          value: newItem.name,
          context: { contentType: 'item_name', domainContext: 'property_rental_appliances' },
          maxLength: 255
        },
        {
          fieldName: 'description',
          value: newItem.description || '',
          context: { contentType: 'item_description', domainContext: 'property_rental_appliances' }
        }
      ]
    },
    trigger: 'create'
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    queuedLanguages = translationResult.queuedLanguages;
    console.log('Translation jobs queued:', translationJobIds.length);
  } else {
    translationError = translationResult.error;
    console.error('Translation queuing returned error:', translationError);
  }
} catch (error) {
  console.error('Translation queuing error:', error);
  translationError = error instanceof Error ? error.message : 'Unknown translation error';
}
```

**Step 4: Modify response object (around line 507-547)**
```typescript
const response = {
  success: true,
  data: {
    // ... existing data fields ...
  },
  // NEW: Include translation fields
  translationJobIds,
  queuedLanguages,
  ...(translationError && { translationError }),
  accountContext: {
    accountId,
    accountRole
  }
};
```

### PUT Handler Modifications

**Location:** `/src/app/api/admin/items/[publicId]/route.ts`
**Function:** `PUT` (lines 458-810)

**Step 1: Add imports at top of file (after line 6)**
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage,
  deleteEntityTranslations
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

**Step 2: Add helper functions after `getAccountContext` (after line 203)**
```typescript
// Same helpers as POST handler
async function getAccountPreferredLanguage(supabase: any, accountId: string | null): Promise<string | null> { /* ... */ }
async function getUserPreferredLanguage(supabase: any, userId: string): Promise<string | null> { /* ... */ }
```

**Step 3: Before item update, detect translatable field changes (before line 617)**
```typescript
// Get current item values for comparison
const currentItem = item; // From validateItemAccess

// Detect if translatable fields have changed
const translatableFieldsChanged = (
  body.name !== currentItem.name ||
  (body.description || '') !== (currentItem.description || '')
);
```

**Step 4: After successful item update (after line 637), add translation logic**
```typescript
// Fetch language preferences
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

// Update item with source_language
await supabase
  .from('items')
  .update({ source_language: sourceLanguage })
  .eq('id', updatedItem.id);

let translationJobIds: string[] = [];
let translationError: string | undefined;
let queuedLanguages: SupportedLanguage[] = [];

// Only process translations if translatable fields changed
if (translatableFieldsChanged) {
  try {
    // Delete existing translations (guests see source content while re-translating)
    await deleteEntityTranslations('item', updatedItem.id);
    console.log('Existing translations deleted for item:', updatedItem.id);

    // Queue new translations
    const translationResult = await queueContentTranslations({
      content: {
        entityType: 'item',
        entityId: updatedItem.id,
        sourceLanguage,
        fields: [
          {
            fieldName: 'name',
            value: updatedItem.name,
            context: { contentType: 'item_name', domainContext: 'property_rental_appliances' },
            maxLength: 255
          },
          {
            fieldName: 'description',
            value: updatedItem.description || '',
            context: { contentType: 'item_description', domainContext: 'property_rental_appliances' }
          }
        ]
      },
      trigger: 'update'
    });

    if (translationResult.success) {
      translationJobIds = translationResult.jobIds;
      queuedLanguages = translationResult.queuedLanguages;
      console.log('Translation jobs queued after update:', translationJobIds.length);
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
```

**Step 5: Modify response object (around line 756-796)**
```typescript
const response = {
  success: true,
  data: {
    // ... existing data fields ...
  },
  // NEW: Include translation fields
  translationJobIds,
  queuedLanguages,
  ...(translationError && { translationError }),
  accountContext: {
    accountId,
    accountRole
  }
};
```

---

## Authorized Files and Functions for Modification

### Files to Modify (UPDATE)

| File Path | Change Type | Lines Affected | Description |
|-----------|-------------|----------------|-------------|
| `/src/app/api/admin/items/route.ts` | Modify | 1-7 (imports), 84-120 (helpers), 433-510 (POST handler) | Add translation integration to POST |
| `/src/app/api/admin/items/[publicId]/route.ts` | Modify | 1-7 (imports), 204-240 (helpers), 503-530 (change detection), 638-720 (PUT handler), 756-800 (response) | Add translation integration to PUT |
| `/src/types/index.ts` | Modify | ~310-375 | Extend CreateItemRequest and ItemResponse types |

### Functions to Modify

| Function | File | Lines | Modification |
|----------|------|-------|--------------|
| `POST` handler | route.ts | 267-561 | Add source language detection, queue translations, update response |
| `PUT` handler | [publicId]/route.ts | 458-810 | Add change detection, delete/re-queue translations, update response |

### New Functions to Add

| Function | File | Purpose |
|----------|------|---------|
| `getAccountPreferredLanguage` | route.ts | Fetch account language preference |
| `getUserPreferredLanguage` | route.ts | Fetch user language preference |
| `getAccountPreferredLanguage` | [publicId]/route.ts | Fetch account language preference (duplicate) |
| `getUserPreferredLanguage` | [publicId]/route.ts | Fetch user language preference (duplicate) |

### Types to Extend

| Type | File | Line | Changes |
|------|------|------|---------|
| `CreateItemRequest` | `/src/types/index.ts` | ~310 | Add `sourceLanguage?: SupportedLanguage` |
| `ItemResponse` | `/src/types/index.ts` | ~125 | Add `translationJobIds?`, `translationError?`, `queuedLanguages?` |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Import content translation functions |
| `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` function signature |
| `/src/lib/content-translation/source-language.ts` | `detectSourceLanguage` function signature |
| `/src/lib/content-translation/storage/translation-storage.ts` | `deleteEntityTranslations` function signature |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type definition |
| `/src/lib/auth-server.ts` | `validateAdminAuth` pattern reference |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority | Dependencies |
|---|------|------|----------|--------------|
| 1 | Extend `CreateItemRequest` type with `sourceLanguage` field | XS | Required | None |
| 2 | Extend `ItemResponse` type with translation fields | S | Required | None |
| 3 | Add imports to route.ts (POST handler file) | XS | Required | Tasks 1-2 |
| 4 | Add `getUserPreferredLanguage` helper in route.ts | XS | Required | Task 3 |
| 5 | Add `getAccountPreferredLanguage` helper in route.ts | XS | Required | Task 3 |
| 6 | Modify POST handler to fetch language preferences | S | Required | Tasks 4-5 |
| 7 | Modify POST handler to determine source language | S | Required | Task 6 |
| 8 | Modify POST handler to update item with source_language | XS | Required | Task 7 |
| 9 | Modify POST handler to queue translations | M | Required | Task 8 |
| 10 | Modify POST handler response to include translation fields | S | Required | Task 9 |
| 11 | Add imports to [publicId]/route.ts (PUT handler file) | XS | Required | Tasks 1-2 |
| 12 | Add helper functions in [publicId]/route.ts | XS | Required | Task 11 |
| 13 | Add translatable field change detection in PUT handler | S | Required | Task 12 |
| 14 | Modify PUT handler to delete existing translations | S | Required | Task 13 |
| 15 | Modify PUT handler to queue new translations | M | Required | Task 14 |
| 16 | Modify PUT handler response to include translation fields | S | Required | Task 15 |
| 17 | Verify TypeScript compilation with `npm run build` | XS | Required | Tasks 1-16 |

### Implementation Order

1. **Phase 1 - Type Updates:**
   - Tasks 1, 2: Extend TypeScript types in `/src/types/index.ts`

2. **Phase 2 - POST Handler:**
   - Tasks 3, 4, 5: Add imports and helper functions
   - Tasks 6, 7, 8, 9, 10: Modify POST handler flow

3. **Phase 3 - PUT Handler:**
   - Tasks 11, 12: Add imports and helper functions
   - Tasks 13, 14, 15, 16: Modify PUT handler flow

4. **Phase 4 - Verification:**
   - Task 17: Build and verify no TypeScript errors

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| POST handler accepts optional sourceLanguage parameter in request body | `body.sourceLanguage` field in `CreateItemRequest` type |
| POST handler uses language detection utility when not explicitly provided | `detectSourceLanguage({ user, account, override: body.sourceLanguage })` |
| POST handler calls content translation orchestrator after successful item creation | `queueContentTranslations()` called after item insert succeeds |
| POST handler includes translationJobIds array in successful response payload | `translationJobIds` field in response object |
| POST handler includes translation error messages in response if orchestration fails | `translationError` field in response object (only when error occurs) |
| POST handler completes item creation even if translation queuing fails | Try/catch around translation code, item creation not affected |
| PUT/PATCH handler identifies when name or description fields have changed | `translatableFieldsChanged` boolean comparison before update |
| PUT/PATCH handler deletes existing translation records for the item before update | `deleteEntityTranslations('item', itemId)` call |
| PUT/PATCH handler calls content translation orchestrator after successful update | `queueContentTranslations()` called after item update succeeds |
| PUT/PATCH handler includes translationJobIds array in successful response payload | `translationJobIds` field in response object |
| PUT/PATCH handler skips translation queuing if translatable fields are unchanged | Conditional check on `translatableFieldsChanged` |
| Both handlers maintain existing response structure with new fields added as non-breaking changes | New fields are optional, existing fields unchanged |
| Both handlers handle translation orchestrator errors gracefully without failing the primary operation | Try/catch blocks, errors logged, don't fail item operations |
| Response type definitions are updated to include optional translation-related fields | `ItemResponse` extended with `translationJobIds?`, `translationError?`, `queuedLanguages?` |
| API documentation reflects new request parameters and response fields | JSDoc comments added to type definitions |

---

## Error Handling Strategy

### Translation Errors Should NOT Fail Item Operations

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

// Item creation/update succeeds regardless of translation status
return NextResponse.json({
  success: true, // Item operation succeeded
  data: { /* item data */ },
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

---

## Testing Considerations

### Unit Test Cases

1. **POST Handler Translation Integration**
   - Item created successfully with translations queued
   - Item created successfully when translation queuing fails
   - Source language from body.sourceLanguage override
   - Source language detected from user preference
   - Source language detected from account preference
   - Default English when no preferences set
   - translationJobIds array populated on success
   - translationError populated on failure
   - queuedLanguages shows 5 target languages (excluding source)

2. **PUT Handler Translation Integration**
   - Translations re-queued when name changes
   - Translations re-queued when description changes
   - Translations re-queued when both name and description change
   - Translations skipped when only tags change
   - Translations skipped when only qrCodeUrl changes
   - Translations skipped when only propertyId changes
   - Existing translations deleted before new ones queued
   - Update succeeds when translation deletion fails
   - Update succeeds when translation queuing fails

3. **Response Structure Validation**
   - POST response includes all existing fields plus translation fields
   - PUT response includes all existing fields plus translation fields
   - translationError only included when there's an error
   - translationJobIds is empty array (not undefined) when no jobs queued
   - Backward compatibility: existing fields unchanged

### Integration Test Cases

1. Create item -> Verify 5 translation jobs in `translation_jobs` table
2. Create item -> Verify `source_language` column populated on item
3. Update item name -> Verify old translations deleted from `item_translations`
4. Update item name -> Verify 5 new jobs queued in `translation_jobs`
5. Update item (only tags) -> Verify no new translation jobs created
6. Create item with sourceLanguage='fr' -> Verify jobs have source_language='fr'
7. Create item without sourceLanguage -> Verify source detected from user preference

### Test File Locations

- Unit tests: `/src/app/api/admin/items/__tests__/route.test.ts`
- Unit tests: `/src/app/api/admin/items/[publicId]/__tests__/route.test.ts`
- Integration tests: `/src/tests/integration/items-translation.test.ts`

---

## Related Documentation

- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-008)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 2, Task 2.2)
- **Source Language Detection:** `/docs/REQ-E03-007-add-source-language-detection-utility-overview.md`
- **Content Translation Orchestrator:** `/docs/REQ-E03-002-implement-content-translation-orchestrator-overview.md`
- **Translation Storage:** `/docs/REQ-E03-005-implement-translation-storage-utilities-overview.md`
- **Existing Items API:** `/src/app/api/admin/items/route.ts`, `/src/app/api/admin/items/[publicId]/route.ts`
- **Type Definitions:** `/src/types/index.ts`

---

## Notes

1. **Backward Compatibility:** The new response fields (`translationJobIds`, `translationError`, `queuedLanguages`) are optional, so existing API consumers will not break. The new `sourceLanguage` request field is also optional.

2. **Non-Blocking Translation:** Translation queuing is designed to be non-blocking. If translation fails, the item creation/update still succeeds. This follows the principle that the primary operation should never fail due to secondary concerns.

3. **Dependency on Prior Tasks:** This task depends on:
   - REQ-E03-001: Content translation module structure
   - REQ-E03-002: Content translation orchestrator (`queueContentTranslations`)
   - REQ-E03-005: Translation storage utilities (`deleteEntityTranslations`)
   - REQ-E03-007: Source language detection utility (`detectSourceLanguage`)

4. **Duplicate Helper Functions:** The `getAccountPreferredLanguage` and `getUserPreferredLanguage` functions are added to both route files. This is acceptable for now but could be refactored into a shared utility later.

5. **Change Detection Logic:** Only `name` and `description` are considered translatable fields. Changes to `tags`, `qrCodeUrl`, `propertyId`, `links`, or `articles` do not trigger translation re-queuing.

6. **Delete Before Re-translate:** On update, existing translations are deleted before queuing new ones. This ensures guests see source language content while new translations are processing, rather than potentially stale translations.

7. **source_language Column:** The `source_language` column on items is updated on both create and update operations, ensuring it always reflects the current source language.

8. **Tags Translation:** Tags are handled separately in Task 2.5. Item creation/update will trigger tag translation via a separate mechanism.

---

## File Structure After Implementation

```typescript
// /src/app/api/admin/items/route.ts (modified)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// ... existing imports ...
import { queueContentTranslations, detectSourceLanguage } from '@/lib/content-translation';  // NEW
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';  // NEW

async function getAccountContext(request, userId, isAdmin, supabase) { /* existing */ }
async function getUserPreferredLanguage(supabase, userId): Promise<string | null> { /* NEW */ }
async function getAccountPreferredLanguage(supabase, accountId): Promise<string | null> { /* NEW */ }

export async function GET(request: NextRequest) { /* unchanged */ }

export async function POST(request: NextRequest) {
  // ... existing validation and item creation ...

  // NEW: Source language detection and translation queuing
  const sourceLanguage = detectSourceLanguage({ /* ... */ });
  await supabase.from('items').update({ source_language: sourceLanguage }).eq('id', newItem.id);

  let translationJobIds: string[] = [];
  let translationError: string | undefined;
  let queuedLanguages: SupportedLanguage[] = [];

  try {
    const translationResult = await queueContentTranslations({ /* ... */ });
    // Handle result
  } catch (error) {
    translationError = error.message;
  }

  // MODIFIED: Response includes translation fields
  return NextResponse.json({
    success: true,
    data: { /* existing */ },
    translationJobIds,
    queuedLanguages,
    ...(translationError && { translationError }),
    accountContext: { /* existing */ }
  }, { status: 201 });
}
```

```typescript
// /src/app/api/admin/items/[publicId]/route.ts (modified)
// Similar structure with change detection and delete before re-queue logic
```

```typescript
// /src/types/index.ts (extended)
export interface CreateItemRequest {
  // ... existing fields ...
  sourceLanguage?: SupportedLanguage;  // NEW
}

export interface ItemResponse {
  success: boolean;
  data?: { /* existing */ };
  error?: string;
  accountContext?: { /* existing */ };
  translationJobIds?: string[];      // NEW
  translationError?: string;         // NEW
  queuedLanguages?: SupportedLanguage[];  // NEW
}
```
