# REQ-345: Add Tag Translation on Item Save - Detailed Task Breakdown

**Generated:** 2026-01-19 15:30:00 UTC
**Last Modified:** 2026-01-19 15:30:00 UTC
**Request Reference:** REQ-345 - Add Tag Translation on Item Save
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 2, Task 2.5)
**Overview Document:** REQ-345-add-tag-translation-on-item-save-overview.md
**Status:** Ready for Implementation

---

## Executive Summary

This task modifies the items API POST and PUT handlers to automatically trigger tag translation workflows when items are created or updated with user-defined tags. For each user tag in the `tags[]` array, the system checks if translations exist; if not, it queues a tag translation job. System tags (those starting with `#` or found in the `AVAILABLE_TAGS` constant) are skipped.

**Estimated Effort:** ~80 minutes
**Prerequisites:** REQ-262 (Task 1.4 - Tag Translation Trigger) must be completed

---

## Pre-Implementation Checklist

Before starting implementation, verify the following:

- [ ] REQ-262 (Tag Translation Trigger) is complete
- [ ] File exists: `/src/lib/content-translation/triggers/tag-trigger.ts`
- [ ] Functions exported: `triggerBatchTagTranslation`, `isSystemTag`
- [ ] TypeScript compilation passes: `npx tsc --noEmit`
- [ ] Understand current item POST handler flow (lines 267-561)
- [ ] Understand current item PUT handler flow (lines 458-810)

**Verification Commands:**
```bash
# Verify REQ-262 is complete
ls -la src/lib/content-translation/triggers/tag-trigger.ts

# Verify exports
grep -n "triggerBatchTagTranslation\|isSystemTag" src/lib/content-translation/index.ts

# Verify TypeScript compilation
npx tsc --noEmit
```

---

## Task Breakdown

### Task 2.5.1: Add imports to /src/app/api/admin/items/route.ts

**Objective:** Add necessary imports for tag translation utilities to the items route file.

**File:** `/src/app/api/admin/items/route.ts`

**Location:** Import section at top of file (after existing imports)

**Implementation Steps:**

1. Open `/src/app/api/admin/items/route.ts`
2. Locate the existing import statements section
3. Add the following imports after other `@/lib` imports:

```typescript
// REQ-345: Import tag translation utilities
import {
  triggerBatchTagTranslation,
  isSystemTag
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/content-translation';
```

**Verification:**
```bash
grep -n "triggerBatchTagTranslation" src/app/api/admin/items/route.ts
# Expected: import statement present at top of file
```

**Acceptance Criteria:**
- [ ] Import statement for `triggerBatchTagTranslation` is present
- [ ] Import statement for `isSystemTag` is present
- [ ] Type import for `SupportedLanguage` is present
- [ ] No TypeScript compilation errors

---

### Task 2.5.2: Create queueTagTranslations helper function in items/route.ts

**Objective:** Create a helper function that filters out system tags and queues translations for user-defined tags.

**File:** `/src/app/api/admin/items/route.ts`

**Location:** Add after imports section, before the route handlers (approximately after line 50, before the GET/POST functions)

**Implementation Steps:**

1. Add the following helper function after the imports section:

```typescript
/**
 * Queues tag translations for user-defined tags (non-blocking)
 * REQ-345: Filters out system tags and '#'-prefixed tags, then queues
 * translation jobs for remaining user tags.
 *
 * @param tags - Array of tag strings from item
 * @param sourceLanguage - Source language for translation
 * @returns Array of job IDs for queued translations, or undefined on error
 */
async function queueTagTranslations(
  tags: string[],
  sourceLanguage: SupportedLanguage
): Promise<string[] | undefined> {
  if (!tags || tags.length === 0) {
    return undefined;
  }

  try {
    // Filter out system tags and '#'-prefixed tags
    const userTags = tags.filter(tag => {
      // Skip '#'-prefixed tags (room tags format)
      if (tag.startsWith('#')) {
        return false;
      }
      // Skip system tags defined in AVAILABLE_TAGS
      if (isSystemTag(tag)) {
        return false;
      }
      return true;
    });

    if (userTags.length === 0) {
      console.log('REQ-345: No user tags to translate (all system or prefixed tags)');
      return undefined;
    }

    console.log(`REQ-345: Queueing translation for ${userTags.length} user tag(s):`, userTags);

    // Queue translations for user tags
    const results = await triggerBatchTagTranslation(userTags, sourceLanguage);

    // Collect all job IDs from results
    const jobIds = results.flatMap(result => result.jobIds);
    console.log(`REQ-345: Tag translation jobs queued: ${jobIds.length}`);

    return jobIds.length > 0 ? jobIds : undefined;
  } catch (error) {
    // Log error but don't throw - tag translation is non-blocking
    console.error('REQ-345: Tag translation queueing failed (non-blocking):', error);
    return undefined;
  }
}
```

**Verification:**
```bash
grep -n "queueTagTranslations" src/app/api/admin/items/route.ts
# Expected: function definition present
```

**Acceptance Criteria:**
- [ ] Function `queueTagTranslations` is defined
- [ ] Function filters out '#'-prefixed tags
- [ ] Function uses `isSystemTag()` to filter system tags
- [ ] Function calls `triggerBatchTagTranslation()` for user tags
- [ ] Error handling catches exceptions and returns undefined
- [ ] Console logging includes REQ-345 prefix for traceability
- [ ] No TypeScript compilation errors

---

### Task 2.5.3: Modify POST handler in items/route.ts to trigger tag translation

**Objective:** Add tag translation trigger after successful item creation in the POST handler.

**File:** `/src/app/api/admin/items/route.ts`

**Location:** After line 502 (after links created successfully) and before line 507 (response construction)

**Context:** The POST handler creates an item, optionally creates an article (REQ-151), and creates links. After all content is created successfully, we add the tag translation trigger.

**Implementation Steps:**

1. Locate the section in POST handler after links are created (around line 502-506):
   ```typescript
   createdLinks.push(...(newLinks || []));
   console.log('Links created successfully:', createdLinks.length);
   }
   ```

2. Add the following code block after the links section and before the response construction:

```typescript
    // REQ-345: Queue tag translations for user-defined tags
    let tagTranslationJobIds: string[] | undefined;
    if (body.tags && body.tags.length > 0) {
      // Determine source language (default to 'en')
      // TODO: Use detectSourceLanguage utility from Task 2.1 when available
      const sourceLanguage = ((body as Record<string, unknown>).sourceLanguage as SupportedLanguage) || 'en';
      tagTranslationJobIds = await queueTagTranslations(body.tags, sourceLanguage);
    }
```

3. Locate the response construction section (around line 507-553):
   ```typescript
   const response = {
     success: true,
     data: {
   ```

4. Add `translationJobIds` to the response object:
   ```typescript
   const response = {
     success: true,
     data: {
       // ... existing fields
     },
     // REQ-345: Include tag translation job IDs
     translationJobIds: tagTranslationJobIds,
     accountContext: {
       accountId,
       accountRole
     }
   };
   ```

**Verification:**
```bash
# Check tag translation trigger is present in POST handler
grep -n "REQ-345" src/app/api/admin/items/route.ts
# Expected: Multiple matches showing REQ-345 comments

# Check translationJobIds in response
grep -n "translationJobIds" src/app/api/admin/items/route.ts
# Expected: translationJobIds field in response object
```

**Acceptance Criteria:**
- [ ] Tag translation trigger code is added after links creation
- [ ] `tagTranslationJobIds` variable is declared with correct type
- [ ] Source language defaults to 'en' if not provided
- [ ] `queueTagTranslations` is called with tags array and source language
- [ ] `translationJobIds` is included in the response object
- [ ] No changes to existing item creation logic
- [ ] No TypeScript compilation errors

---

### Task 2.5.4: Add imports to /src/app/api/admin/items/[publicId]/route.ts

**Objective:** Add necessary imports for tag translation utilities to the items [publicId] route file.

**File:** `/src/app/api/admin/items/[publicId]/route.ts`

**Location:** Import section at top of file (after existing imports)

**Implementation Steps:**

1. Open `/src/app/api/admin/items/[publicId]/route.ts`
2. Locate the existing import statements section
3. Add the following imports after other `@/lib` imports:

```typescript
// REQ-345: Import tag translation utilities
import {
  triggerBatchTagTranslation,
  isSystemTag
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/content-translation';
```

**Verification:**
```bash
grep -n "triggerBatchTagTranslation" "src/app/api/admin/items/[publicId]/route.ts"
# Expected: import statement present at top of file
```

**Acceptance Criteria:**
- [ ] Import statement for `triggerBatchTagTranslation` is present
- [ ] Import statement for `isSystemTag` is present
- [ ] Type import for `SupportedLanguage` is present
- [ ] No TypeScript compilation errors

---

### Task 2.5.5: Create queueTagTranslations helper function in items/[publicId]/route.ts

**Objective:** Add the same helper function to the [publicId] route file for PUT handler.

**File:** `/src/app/api/admin/items/[publicId]/route.ts`

**Location:** Add after imports section, before the route handlers

**Implementation Steps:**

1. Add the same `queueTagTranslations` helper function from Task 2.5.2:

```typescript
/**
 * Queues tag translations for user-defined tags (non-blocking)
 * REQ-345: Filters out system tags and '#'-prefixed tags, then queues
 * translation jobs for remaining user tags.
 *
 * @param tags - Array of tag strings from item
 * @param sourceLanguage - Source language for translation
 * @returns Array of job IDs for queued translations, or undefined on error
 */
async function queueTagTranslations(
  tags: string[],
  sourceLanguage: SupportedLanguage
): Promise<string[] | undefined> {
  if (!tags || tags.length === 0) {
    return undefined;
  }

  try {
    // Filter out system tags and '#'-prefixed tags
    const userTags = tags.filter(tag => {
      // Skip '#'-prefixed tags (room tags format)
      if (tag.startsWith('#')) {
        return false;
      }
      // Skip system tags defined in AVAILABLE_TAGS
      if (isSystemTag(tag)) {
        return false;
      }
      return true;
    });

    if (userTags.length === 0) {
      console.log('REQ-345: No user tags to translate (all system or prefixed tags)');
      return undefined;
    }

    console.log(`REQ-345: Queueing translation for ${userTags.length} user tag(s):`, userTags);

    // Queue translations for user tags
    const results = await triggerBatchTagTranslation(userTags, sourceLanguage);

    // Collect all job IDs from results
    const jobIds = results.flatMap(result => result.jobIds);
    console.log(`REQ-345: Tag translation jobs queued: ${jobIds.length}`);

    return jobIds.length > 0 ? jobIds : undefined;
  } catch (error) {
    // Log error but don't throw - tag translation is non-blocking
    console.error('REQ-345: Tag translation queueing failed (non-blocking):', error);
    return undefined;
  }
}
```

**Note:** The helper function is duplicated in both files. In a future refactor, this could be extracted to a shared utility file like `/src/lib/api/tag-translation-helper.ts`.

**Verification:**
```bash
grep -n "queueTagTranslations" "src/app/api/admin/items/[publicId]/route.ts"
# Expected: function definition present
```

**Acceptance Criteria:**
- [ ] Function `queueTagTranslations` is defined
- [ ] Function logic matches Task 2.5.2 implementation
- [ ] No TypeScript compilation errors

---

### Task 2.5.6: Modify PUT handler in items/[publicId]/route.ts to trigger tag translation

**Objective:** Add tag translation trigger after successful item update in the PUT handler.

**File:** `/src/app/api/admin/items/[publicId]/route.ts`

**Location:** After line 752 (after article handling) and before line 756 (response construction)

**Context:** The PUT handler updates an item, deletes and recreates links, and handles article create/update. After all content is processed successfully, we add the tag translation trigger.

**Implementation Steps:**

1. Locate the section in PUT handler after article handling (around line 752-755):
   ```typescript
       console.log('Links associated with article:', linkIds.length);
     }
   }
   ```

2. Add the following code block after the article section and before the response construction:

```typescript
    // REQ-345: Queue tag translations for user-defined tags
    let tagTranslationJobIds: string[] | undefined;
    if (body.tags && body.tags.length > 0) {
      // Determine source language (default to 'en')
      // TODO: Use detectSourceLanguage utility from Task 2.1 when available
      const sourceLanguage = ((body as Record<string, unknown>).sourceLanguage as SupportedLanguage) || 'en';
      tagTranslationJobIds = await queueTagTranslations(body.tags, sourceLanguage);
    }
```

3. Locate the response construction section (around line 756-801):
   ```typescript
   const response = {
     success: true,
     data: {
   ```

4. Add `translationJobIds` to the response object:
   ```typescript
   const response = {
     success: true,
     data: {
       // ... existing fields
     },
     // REQ-345: Include tag translation job IDs
     translationJobIds: tagTranslationJobIds,
     accountContext: {
       accountId,
       accountRole
     }
   };
   ```

**Verification:**
```bash
# Check tag translation trigger is present in PUT handler
grep -n "REQ-345" "src/app/api/admin/items/[publicId]/route.ts"
# Expected: Multiple matches showing REQ-345 comments

# Check translationJobIds in response
grep -n "translationJobIds" "src/app/api/admin/items/[publicId]/route.ts"
# Expected: translationJobIds field in response object
```

**Acceptance Criteria:**
- [ ] Tag translation trigger code is added after article handling
- [ ] `tagTranslationJobIds` variable is declared with correct type
- [ ] Source language defaults to 'en' if not provided
- [ ] `queueTagTranslations` is called with tags array and source language
- [ ] `translationJobIds` is included in the response object
- [ ] No changes to existing item update logic
- [ ] No TypeScript compilation errors

---

### Task 2.5.7: Verify/Update TypeScript types for API responses

**Objective:** Ensure `translationJobIds` is properly typed in the item response interfaces.

**File:** `/src/types/index.ts`

**Context:** According to Plan-111 Task 2.6, the types should already include `translationJobIds`. This task verifies the types exist and adds them if missing.

**Implementation Steps:**

1. Open `/src/types/index.ts`

2. Search for `ItemResponse` or similar response type interfaces

3. Verify that `translationJobIds?: string[]` is present in the response type:

```typescript
// Expected type (verify or add)
export interface ItemResponse {
  success: boolean;
  data?: { ... };
  error?: string;
  translationJobIds?: string[];  // REQ-345: Translation job tracking
  accountContext?: {
    accountId: string;
    accountRole: string;
  };
}
```

4. If `translationJobIds` is not present, add it to the appropriate response interfaces

**Verification:**
```bash
grep -n "translationJobIds" src/types/index.ts
# Expected: translationJobIds field definition
```

**Acceptance Criteria:**
- [ ] `translationJobIds?: string[]` is defined in ItemResponse (or equivalent)
- [ ] Type is optional (using `?:`)
- [ ] No TypeScript compilation errors

---

### Task 2.5.8: Run TypeScript compilation and build verification

**Objective:** Verify all changes compile and build successfully.

**Implementation Steps:**

1. Run TypeScript compilation check:
   ```bash
   npx tsc --noEmit
   ```

2. Run the build:
   ```bash
   npm run build
   ```

3. If there are any errors, fix them before proceeding

**Verification Commands:**
```bash
# TypeScript check
npx tsc --noEmit

# Full build
npm run build

# Run tests if available
npm run test
```

**Acceptance Criteria:**
- [ ] TypeScript compilation passes without errors
- [ ] Build completes successfully
- [ ] All existing tests pass (if test suite exists)

---

## Post-Implementation Verification Checklist

After completing all tasks, verify:

### Code Verification
- [ ] Import statements present in `/src/app/api/admin/items/route.ts`
- [ ] Import statements present in `/src/app/api/admin/items/[publicId]/route.ts`
- [ ] `queueTagTranslations` helper function in both route files
- [ ] POST handler calls tag translation after item creation
- [ ] PUT handler calls tag translation after item update
- [ ] `translationJobIds` returned in responses when jobs are queued
- [ ] REQ-345 comments present for traceability

### Behavior Verification
- [ ] System tags from `AVAILABLE_TAGS` are skipped (kitchen, appliance, etc.)
- [ ] Tags with '#' prefix are skipped (#room.bedroom, etc.)
- [ ] User tags trigger translation jobs
- [ ] Errors in translation do not fail item operations
- [ ] Response is returned immediately (non-blocking)

### Build Verification
- [ ] TypeScript compilation passes: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] Existing tests pass: `npm run test`

---

## Integration Test Scenarios

### Test Scenario 1: Create item with user tags

**Request:**
```bash
POST /api/admin/items
{
  "publicId": "uuid-here",
  "name": "Coffee Maker",
  "propertyId": "property-uuid",
  "tags": ["coffee-maker", "morning-essentials", "kitchen"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": { ... },
  "translationJobIds": ["job-id-1", "job-id-2"],
  "accountContext": { ... }
}
```

**Verification:**
- `kitchen` is a system tag and should be skipped
- Only `coffee-maker` and `morning-essentials` trigger translation jobs

---

### Test Scenario 2: Create item with only system tags

**Request:**
```bash
POST /api/admin/items
{
  "publicId": "uuid-here",
  "name": "Oven",
  "propertyId": "property-uuid",
  "tags": ["kitchen", "appliance"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": { ... },
  "accountContext": { ... }
}
```

**Verification:**
- Both tags are system tags
- `translationJobIds` should be undefined (not present in response)

---

### Test Scenario 3: Create item with '#'-prefixed tags

**Request:**
```bash
POST /api/admin/items
{
  "publicId": "uuid-here",
  "name": "Lamp",
  "propertyId": "property-uuid",
  "tags": ["#room.bedroom", "lamp-shade"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": { ... },
  "translationJobIds": ["job-id-for-lamp-shade"],
  "accountContext": { ... }
}
```

**Verification:**
- `#room.bedroom` is prefixed and should be skipped
- Only `lamp-shade` triggers translation job

---

### Test Scenario 4: Update item with new tags

**Request:**
```bash
PUT /api/admin/items/existing-public-id
{
  "name": "Updated Coffee Maker",
  "propertyId": "property-uuid",
  "tags": ["updated-tag", "new-feature"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": { ... },
  "translationJobIds": ["job-id-1", "job-id-2"],
  "accountContext": { ... }
}
```

**Verification:**
- Both user tags trigger translation jobs
- Item update succeeds

---

### Test Scenario 5: Translation error does NOT fail item creation

**Setup:** Mock `triggerBatchTagTranslation` to throw an error

**Request:**
```bash
POST /api/admin/items
{
  "publicId": "uuid-here",
  "name": "Test Item",
  "propertyId": "property-uuid",
  "tags": ["test-tag"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": { "id": "created-item-id", ... },
  "accountContext": { ... }
}
```

**Verification:**
- Item is created successfully despite translation error
- `translationJobIds` may be undefined
- Error is logged but not propagated

---

## Summary of Tag Translation Behavior

| Scenario | Tags Example | Behavior | Result |
|----------|--------------|----------|--------|
| No tags | `[]` or undefined | Skip processing | No `translationJobIds` |
| Only system tags | `['kitchen', 'appliance']` | Skip all (system tags) | No `translationJobIds` |
| Only '#'-prefixed | `['#room.bedroom']` | Skip all (prefixed) | No `translationJobIds` |
| User tags only | `['coffee-maker', 'my-tag']` | Queue for all user tags | `translationJobIds: [...]` |
| Mixed tags | `['kitchen', 'my-tag', '#room.living']` | Queue only user tags | `translationJobIds: [...]` (only for 'my-tag') |
| Translation error | Any | Error logged, item saved | Item success, `translationJobIds` may be undefined |

---

## Files Modified Summary

| File Path | Changes |
|-----------|---------|
| `/src/app/api/admin/items/route.ts` | Add imports, add `queueTagTranslations` helper, modify POST handler |
| `/src/app/api/admin/items/[publicId]/route.ts` | Add imports, add `queueTagTranslations` helper, modify PUT handler |
| `/src/types/index.ts` | Verify/add `translationJobIds` field (if not present from Task 2.6) |

---

## Dependencies

### Upstream Dependencies (Must be complete before this task)
| Task | Component | Status |
|------|-----------|--------|
| REQ-262 (Task 1.4) | `/src/lib/content-translation/triggers/tag-trigger.ts` | Required |

### Downstream Dependencies (Blocked by this task)
| Task | Description |
|------|-------------|
| Task 3.5 | Tag translation processor (processes jobs created by this trigger) |
| Phase 4 | Translation status APIs (can query tag translation status) |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-262 not complete | Medium | High | Verify task completion before starting; clear error message if imports fail |
| Tag trigger functions not exported | Low | Medium | Verify exports in `/src/lib/content-translation/index.ts` |
| Performance impact from async calls | Low | Low | Calls are non-blocking; no impact on response time |
| Duplicate translation jobs | Low | Low | `triggerBatchTagTranslation` already checks for existing translations |
| Breaking existing item operations | Low | High | Use try/catch to isolate tag translation; comprehensive testing |

---

## References

- [Overview Document](/docs/REQ-345-add-tag-translation-on-item-save-overview.md)
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-345
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md) - Phase 2, Task 2.5
- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Tag Trigger Implementation](/docs/REQ-262-implement-tag-translation-trigger-overview.md) - REQ-262
- [Items POST API](/src/app/api/admin/items/route.ts)
- [Items PUT API](/src/app/api/admin/items/[publicId]/route.ts)
- [System Tags Constants](/src/components/ItemCreationWorkflow/utils/constants.ts) - `AVAILABLE_TAGS`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 2, Task 2.5*
*Last Modified: 2026-01-19 15:30:00 UTC*
