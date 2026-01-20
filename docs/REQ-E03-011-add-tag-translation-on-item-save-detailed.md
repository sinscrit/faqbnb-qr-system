# Detailed Task Breakdown: REQ-E03-011 - Add Tag Translation on Item Save

**Request ID:** REQ-E03-011
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.5
**Type:** ENHANCEMENT
**Size:** S
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 14:38 UTC (Implementation Complete)

---

## Overview

This document provides a detailed, step-by-step task breakdown for implementing automatic tag translation queuing when items are created or updated. The implementation modifies both the POST handler (`/src/app/api/admin/items/route.ts`) and PUT handler (`/src/app/api/admin/items/[publicId]/route.ts`) to iterate through user-defined tags, filter out system tags, and queue translation jobs for missing translations.

---

## Prerequisites

Before starting this task, ensure the following are completed:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| REQ-E03-001: Content Translation Module Structure | Required | Module must exist at `/src/lib/content-translation/` |
| REQ-E03-004: Tag Translation Trigger | Required | `triggerTagTranslation()` function must be implemented |
| REQ-E03-008: Modify Items API to Trigger Translations | Required | Source language detection and item translation already added |
| Translation Service (Epic 1) | Required | `SupportedLanguage` type must exist |

---

## Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `triggerTagTranslation` | `/src/lib/content-translation/triggers/tag-trigger.ts` | Queue tag translation jobs |
| `detectSourceLanguage` | `/src/lib/content-translation/source-language.ts` | Already added in REQ-E03-008 |
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Language type definition |
| `QueueTranslationResult` | `/src/lib/content-translation/content-translation.types.ts` | Result type for tag trigger |

---

## Task Breakdown

### Task 1: Update Import in POST Handler Route

**File:** `/src/app/api/admin/items/route.ts`
**Lines:** 1-10 (import section)
**Effort:** XS (5 minutes)
**Priority:** Required

#### 1.1 Current State

The file currently has basic imports but no content-translation imports (assuming REQ-E03-008 was already implemented, it would have added the import for `queueContentTranslations` and `detectSourceLanguage`).

#### 1.2 Implementation Steps

1. **Locate the existing import block** at the top of the file (lines 1-8)
2. **Find or add the content-translation import:**
   - If REQ-E03-008 is already implemented, find the existing import from `@/lib/content-translation`
   - Add `triggerTagTranslation` to that import

#### 1.3 Code Change

```typescript
// If REQ-E03-008 import exists, modify it:
import {
  queueContentTranslations,
  detectSourceLanguage,
  triggerTagTranslation  // ADD THIS LINE
} from '@/lib/content-translation';

// If REQ-E03-008 is not yet implemented, add new import:
import { triggerTagTranslation } from '@/lib/content-translation';
```

#### 1.4 Verification

- [x] File compiles without import errors
- [x] `triggerTagTranslation` function is recognized by TypeScript
- [x] No duplicate imports exist

---

### Task 2: Add getUserTags Helper Function in POST Handler Route

**File:** `/src/app/api/admin/items/route.ts`
**Lines:** After line ~83 (after `getAccountContext` function)
**Effort:** XS (10 minutes)
**Priority:** Required

#### 2.1 Purpose

This helper function filters out system tags (those starting with `#`) from a tags array, returning only user-defined tags that may need translation.

#### 2.2 Implementation Steps

1. **Locate insertion point:** After the `getAccountContext` function definition (around line 83)
2. **Add the helper function** with JSDoc documentation

#### 2.3 Code to Add

```typescript
/**
 * Filters out system tags from a tags array.
 * System tags start with '#' (e.g., '#room.kitchen', '#type.appliance')
 * and are pre-seeded with translations, so they don't need dynamic translation.
 *
 * @param tags - Array of tag strings from item
 * @returns Array of user-defined tags only (excluding system tags)
 *
 * @example
 * getUserTags(['#room.kitchen', 'coffee-maker', '#type.appliance', 'my-tag'])
 * // Returns: ['coffee-maker', 'my-tag']
 */
function getUserTags(tags: string[] | undefined | null): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.filter(tag => !tag.startsWith('#'));
}
```

#### 2.4 Verification

- [x] Function handles undefined input
- [x] Function handles null input
- [x] Function handles empty array
- [x] Function correctly filters `#` prefix tags
- [x] Function returns array of strings

---

### Task 3: Add Tag Translation Block to POST Handler

**File:** `/src/app/api/admin/items/route.ts`
**Function:** `POST` handler (lines 267-561)
**Lines:** After item translation queuing (around line 500-540), before the response
**Effort:** S (30 minutes)
**Priority:** Required

#### 3.1 Context

The POST handler creates items with optional tags. After the item is successfully created and item field translations are queued (by REQ-E03-008), we need to also queue tag translations.

#### 3.2 Insertion Point

Insert the tag translation block:
- **After:** The item translation queuing block (added in REQ-E03-008)
- **Before:** The response transformation section (around line 505)

If REQ-E03-008 is not yet implemented, insert after line 503 (after `console.log('Links created successfully:', createdLinks.length);`).

#### 3.3 Implementation Steps

1. **Locate the insertion point** after item creation and translation queuing
2. **Add the tag translation processing block**
3. **Ensure sourceLanguage variable is available** (should be defined by REQ-E03-008, or use 'en' as default)

#### 3.4 Code to Add

```typescript
// ============================================================
// TAG TRANSLATION (REQ-E03-011)
// Queue tag translations after item creation
// ============================================================
const userTags = getUserTags(body.tags);
if (userTags.length > 0) {
  // Determine source language (from REQ-E03-008 or default to 'en')
  const tagSourceLanguage = sourceLanguage || 'en';

  console.log('ITEMS_API: Processing tag translations', {
    itemId: newItem.id,
    publicId: newItem.public_id,
    tagCount: userTags.length,
    tags: userTags,
    sourceLanguage: tagSourceLanguage,
  });

  // Process tags in parallel, but don't fail item creation on tag errors
  try {
    const tagResults = await Promise.allSettled(
      userTags.map(tag => triggerTagTranslation(tag, tagSourceLanguage as SupportedLanguage))
    );

    // Count successful jobs queued
    const tagJobsQueued = tagResults
      .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
        r.status === 'fulfilled' && r.value.success)
      .reduce((sum, r) => sum + r.value.jobIds.length, 0);

    // Collect any errors
    const tagErrors = tagResults
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message || String(r.reason));

    // Also collect errors from fulfilled but unsuccessful results
    const fulfillmentErrors = tagResults
      .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
        r.status === 'fulfilled' && !r.value.success)
      .map(r => r.value.error || 'Unknown error');

    const allTagErrors = [...tagErrors, ...fulfillmentErrors];

    if (allTagErrors.length > 0) {
      console.error('ITEMS_API: Tag translation errors on create', {
        itemId: newItem.id,
        publicId: newItem.public_id,
        errors: allTagErrors,
      });
    }

    console.log('ITEMS_API: Tag translation complete on create', {
      itemId: newItem.id,
      publicId: newItem.public_id,
      tagsProcessed: userTags.length,
      jobsQueued: tagJobsQueued,
      errors: allTagErrors.length,
    });
  } catch (tagTranslationError) {
    // Log but don't fail item creation
    console.error('ITEMS_API: Tag translation processing error on create', {
      itemId: newItem.id,
      publicId: newItem.public_id,
      error: tagTranslationError instanceof Error ? tagTranslationError.message : String(tagTranslationError),
    });
  }
}
// ============================================================
```

#### 3.5 Required Type Imports

If not already imported, add to the imports section:

```typescript
import type { QueueTranslationResult } from '@/lib/content-translation/content-translation.types';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

#### 3.6 Verification

- [x] Tag translation code doesn't affect item creation response
- [x] System tags (starting with `#`) are not processed
- [x] Multiple tags are processed in parallel
- [x] Errors are logged but don't fail the request
- [x] `sourceLanguage` variable is correctly resolved

---

### Task 4: Update Import in PUT Handler Route

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Lines:** 1-10 (import section)
**Effort:** XS (5 minutes)
**Priority:** Required

#### 4.1 Implementation Steps

1. **Locate the import section** at the top of the file (lines 1-7)
2. **Add import for triggerTagTranslation**

#### 4.2 Code Change

```typescript
// Add to existing imports or create new import
import { triggerTagTranslation } from '@/lib/content-translation';
import type { QueueTranslationResult } from '@/lib/content-translation/content-translation.types';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

#### 4.3 Verification

- [x] File compiles without import errors
- [x] `triggerTagTranslation` function is recognized
- [x] Type imports are correctly resolved

---

### Task 5: Add getUserTags Helper Function in PUT Handler Route

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Lines:** After line ~203 (after `getAccountContext` function)
**Effort:** XS (10 minutes)
**Priority:** Required

#### 5.1 Note on Code Duplication

This is the same helper function as in Task 2. While code duplication is generally avoided, for this small utility function, locality is preferred for simplicity. Consider refactoring to a shared utility in a future cleanup task.

#### 5.2 Code to Add

```typescript
/**
 * Filters out system tags from a tags array.
 * System tags start with '#' (e.g., '#room.kitchen', '#type.appliance')
 * and are pre-seeded with translations, so they don't need dynamic translation.
 *
 * @param tags - Array of tag strings from item
 * @returns Array of user-defined tags only (excluding system tags)
 */
function getUserTags(tags: string[] | undefined | null): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.filter(tag => !tag.startsWith('#'));
}
```

#### 5.3 Verification

- [x] Function compiles without errors
- [x] Function correctly filters system tags

---

### Task 6: Add Tag Translation Block to PUT Handler

**File:** `/src/app/api/admin/items/[publicId]/route.ts`
**Function:** `PUT` handler (lines 458-810)
**Lines:** After item update and links processing (around line 752), before response
**Effort:** S (30 minutes)
**Priority:** Required

#### 6.1 Context

The PUT handler updates items including their tags. After the item is successfully updated and any item field translations are queued, we need to also queue tag translations for the updated tag list.

#### 6.2 Insertion Point

Insert the tag translation block:
- **After:** The article/links association block (around line 751: `console.log('Links associated with article:', linkIds.length);`)
- **Before:** The response transformation section (around line 754)

#### 6.3 Implementation Steps

1. **Locate the insertion point** after item update and links processing
2. **Add the tag translation processing block**
3. **Use the `updatedItem` variable** which contains the updated item data

#### 6.4 Code to Add

```typescript
    // ============================================================
    // TAG TRANSLATION (REQ-E03-011)
    // Queue tag translations after item update
    // ============================================================
    const userTags = getUserTags(body.tags);
    if (userTags.length > 0) {
      // Determine source language (from REQ-E03-008 or default to 'en')
      const tagSourceLanguage = sourceLanguage || 'en';

      console.log('ITEMS_API: Processing tag translations on update', {
        itemId: updatedItem.id,
        publicId: updatedItem.public_id,
        tagCount: userTags.length,
        tags: userTags,
        sourceLanguage: tagSourceLanguage,
      });

      // Process tags in parallel, but don't fail item update on tag errors
      try {
        const tagResults = await Promise.allSettled(
          userTags.map(tag => triggerTagTranslation(tag, tagSourceLanguage as SupportedLanguage))
        );

        // Count successful jobs queued
        const tagJobsQueued = tagResults
          .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
            r.status === 'fulfilled' && r.value.success)
          .reduce((sum, r) => sum + r.value.jobIds.length, 0);

        // Collect any errors
        const tagErrors = tagResults
          .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
          .map(r => r.reason?.message || String(r.reason));

        // Also collect errors from fulfilled but unsuccessful results
        const fulfillmentErrors = tagResults
          .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
            r.status === 'fulfilled' && !r.value.success)
          .map(r => r.value.error || 'Unknown error');

        const allTagErrors = [...tagErrors, ...fulfillmentErrors];

        if (allTagErrors.length > 0) {
          console.error('ITEMS_API: Tag translation errors on update', {
            itemId: updatedItem.id,
            publicId: updatedItem.public_id,
            errors: allTagErrors,
          });
        }

        console.log('ITEMS_API: Tag translation complete on update', {
          itemId: updatedItem.id,
          publicId: updatedItem.public_id,
          tagsProcessed: userTags.length,
          jobsQueued: tagJobsQueued,
          errors: allTagErrors.length,
        });
      } catch (tagTranslationError) {
        // Log but don't fail item update
        console.error('ITEMS_API: Tag translation processing error on update', {
          itemId: updatedItem.id,
          publicId: updatedItem.public_id,
          error: tagTranslationError instanceof Error ? tagTranslationError.message : String(tagTranslationError),
        });
      }
    }
    // ============================================================
```

#### 6.5 Verification

- [x] Tag translation code doesn't affect item update response
- [x] System tags (starting with `#`) are not processed
- [x] Multiple tags are processed in parallel
- [x] Errors are logged but don't fail the request
- [x] Uses correct `updatedItem` reference

---

### Task 7: TypeScript Build Verification

**Command:** `npm run build`
**Effort:** XS (5 minutes)
**Priority:** Required

#### 7.1 Implementation Steps

1. **Run TypeScript compilation:**
   ```bash
   npm run build
   ```

2. **Verify no type errors** in the modified files

3. **Address any errors** before proceeding

#### 7.2 Expected Verification Points

- [x] No TypeScript compilation errors
- [x] No missing imports
- [x] No type mismatches with `triggerTagTranslation`
- [x] `QueueTranslationResult` type is correctly imported
- [x] `SupportedLanguage` type is correctly imported

---

## Implementation Order Summary

| Order | Task | File | Effort |
|-------|------|------|--------|
| 1 | Add import for triggerTagTranslation | route.ts | XS |
| 2 | Add getUserTags helper | route.ts | XS |
| 3 | Add tag translation block in POST | route.ts | S |
| 4 | Add import for triggerTagTranslation | [publicId]/route.ts | XS |
| 5 | Add getUserTags helper | [publicId]/route.ts | XS |
| 6 | Add tag translation block in PUT | [publicId]/route.ts | S |
| 7 | Build verification | - | XS |

**Total Estimated Effort:** ~1.5 hours

---

## Acceptance Criteria Verification

| Criteria | Task | Verification Method |
|----------|------|---------------------|
| POST handler extracts tags array from saved item | Task 3 | `getUserTags(body.tags)` extracts tags |
| POST handler iterates through each tag | Task 3 | `userTags.map()` iterates |
| POST handler skips tags starting with '#' | Task 2, 3 | `getUserTags()` filters `#` prefix |
| POST handler queries for existing translations | Task 3 | `triggerTagTranslation()` handles internally |
| POST handler queues only missing translations | Task 3 | `triggerTagTranslation()` handles internally |
| POST handler avoids duplicates | Task 3 | `triggerTagTranslation()` checks pending jobs |
| PUT handler performs same logic | Tasks 4-6 | Same pattern in PUT handler |
| Item save succeeds even if tag translation fails | Tasks 3, 6 | `Promise.allSettled()` + try/catch |
| Errors are logged | Tasks 3, 6 | `console.error()` statements |
| Tag translation doesn't impact response time | Tasks 3, 6 | Parallel processing, non-blocking |
| Uses same source language as item | Tasks 3, 6 | `sourceLanguage` variable reused |
| System tags never queued | Tasks 2, 5 | `getUserTags()` filters `#` prefix |

---

## Testing Checklist

### Unit Tests for getUserTags Helper

```typescript
describe('getUserTags', () => {
  it('returns empty array for undefined', () => {
    expect(getUserTags(undefined)).toEqual([]);
  });

  it('returns empty array for null', () => {
    expect(getUserTags(null)).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(getUserTags([])).toEqual([]);
  });

  it('returns all tags when none are system tags', () => {
    expect(getUserTags(['tag1', 'tag2'])).toEqual(['tag1', 'tag2']);
  });

  it('filters out system tags starting with #', () => {
    expect(getUserTags(['#room.kitchen', 'coffee-maker', '#type.appliance', 'my-tag']))
      .toEqual(['coffee-maker', 'my-tag']);
  });

  it('returns empty array when all are system tags', () => {
    expect(getUserTags(['#room.kitchen', '#type.appliance'])).toEqual([]);
  });
});
```

### Integration Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Create item with user tags | Translation jobs queued for user tags |
| Create item with system tags only | No translation jobs queued |
| Create item with mixed tags | Only user tags get translation jobs |
| Create item with no tags | No tag translation attempted |
| Update item adding new user tags | Translation jobs queued for new tags |
| Update item with only system tags | No translation jobs queued |
| Tag translation fails | Item creation/update still succeeds |

---

## Error Handling Scenarios

| Error Scenario | Handling | Impact on Item Save |
|---------------|----------|---------------------|
| `triggerTagTranslation` throws | Caught by `Promise.allSettled()` | None |
| Database error in tag trigger | Caught internally | None |
| Network timeout | Caught by outer try/catch | None |
| Invalid tag format | Handled gracefully | None |
| All tag translations fail | Logged, continues | None |

---

## Notes

1. **sourceLanguage Variable:** The code assumes `sourceLanguage` is defined by REQ-E03-008. If that task is not yet implemented, default to `'en'`.

2. **Type Safety:** The `QueueTranslationResult` type must be exported from the content-translation module. If it doesn't exist yet, it will be created in REQ-E03-001 or REQ-E03-004.

3. **Non-Blocking Design:** Tag translation is intentionally non-blocking. The item save operation always succeeds regardless of tag translation outcome.

4. **Logging:** Comprehensive logging is included for debugging and monitoring. These logs can be adjusted based on environment (production vs development).

5. **No Response Changes:** Unlike REQ-E03-008, this task does NOT add new fields to the API response. Tag translation is completely transparent to API consumers.

---

## Related Documents

- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-011)
- **Overview Document:** `/docs/REQ-E03-011-add-tag-translation-on-item-save-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Items API (POST):** `/src/app/api/admin/items/route.ts`
- **Items API (PUT):** `/src/app/api/admin/items/[publicId]/route.ts`
- **Tag Trigger Dependency:** `/docs/REQ-E03-004-implement-tag-translation-trigger-overview.md`
- **Items API Translation Dependency:** `/docs/REQ-E03-008-modify-items-api-to-trigger-translations-overview.md`

---

*Document generated for REQ-E03-011 - Add Tag Translation on Item Save*
*Epic 3 - Dynamic Content Translation | Phase 2 - Modify Existing Content APIs*
