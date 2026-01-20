# Implementation Overview: REQ-E03-011 - Add Tag Translation on Item Save

**Request ID:** REQ-E03-011
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.5
**Type:** ENHANCEMENT
**Size:** S
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 17:30 UTC

---

## Summary

Modify the items creation and update API endpoints to automatically queue translation jobs for user-defined tags attached to items. The handlers will iterate through the tags array, skip system tags (those starting with `#` character), check for existing translations, and queue translation jobs only for user-created tags that don't already have translations in all target languages. Tag translation errors will be logged but will not prevent the item save operation from succeeding.

---

## Background & Context

### Current State

The Items API handles tags in the following way:

**POST Handler (`/src/app/api/admin/items/route.ts:267-561`)**
- Accepts optional `tags` array in request body (see `CreateItemRequest` type at line 315)
- Tags are NOT currently processed on item creation
- The POST handler only inserts basic item fields without tags (lines 407-418)
- Tags field exists in `CreateItemRequest` type but not utilized in POST handler

**PUT Handler (`/src/app/api/admin/items/[publicId]/route.ts:458-810`)**
- Accepts `tags` array in request body via `UpdateItemRequest`
- Updates tags in the items table (line 623: `tags: body.tags || []`)
- Tags are stored as a text array in the `items` table
- No translation processing occurs when tags are saved

**Tags Data Model**
- Tags are stored in `items.tags` as a `text[]` (array of strings)
- Tags follow naming conventions:
  - **System tags**: Use format `#room.{roomname}`, `#type.{typename}`, etc. (start with `#`)
  - **Plain tags**: e.g., `kitchen`, `appliance`, `instructions` (used by tagMapper.ts)
  - **User-created tags**: Any custom tag string defined by the user

**Tag Translation Infrastructure (from prior tasks)**
- Tag translations table: `tag_translations` with `tag_key`, `language`, `translated_value`, `is_system_tag`
- System tags are pre-seeded with 17 tags × 6 languages = 102 records
- Translation jobs table: `translation_jobs` tracks tag translation queue
- Tag trigger: `triggerTagTranslation()` in `/src/lib/content-translation/triggers/tag-trigger.ts`

### Tag Naming Convention Analysis

From codebase investigation:

| Tag Type | Format | Example | Translation Action |
|----------|--------|---------|-------------------|
| System Room Tags | `#room.{roomname}` | `#room.kitchen` | **SKIP** - starts with `#` |
| System Type Tags | `#type.{typename}` | `#type.appliance` | **SKIP** - starts with `#` |
| Plain System Tags | `{tagname}` | `kitchen`, `appliance` | **CHECK** - use `isSystemTag()` |
| User-Created Tags | Any string | `coffee-maker`, `my-tag` | **QUEUE** - if not already translated |

Per the implementation plan (Plan-111), the acceptance criteria states:
> "Skip system tags (starting with `#`)"

This means we skip tags with the `#` prefix (like `#room.kitchen`). For plain tags (like `kitchen`), we rely on the `triggerTagTranslation()` function which internally checks `is_system_tag` in the database.

### Problem Statement

1. When items are created with user-defined tags, those tags remain untranslated
2. When items are updated with new tags, the new tags are not queued for translation
3. Guests searching or filtering by tags in other languages cannot find items with user-created tags
4. Tag-based navigation and discovery is limited to the source language only
5. No integration exists between item save handlers and the tag translation trigger

### Solution Approach

Integrate tag translation into both POST and PUT handlers:

1. **POST Handler Modifications:**
   - After successful item creation, extract tags from request body
   - Filter out system tags (starting with `#`)
   - For each remaining tag, call `triggerTagTranslation()`
   - Use the same source language as determined for the item
   - Log errors but don't fail item creation

2. **PUT Handler Modifications:**
   - After successful item update, extract tags from request body
   - Filter out system tags (starting with `#`)
   - For each remaining tag, call `triggerTagTranslation()`
   - Use the same source language as determined for the item
   - Log errors but don't fail item update

---

## Technical Design

### Architecture Position

```
/src/app/api/admin/items/
├── route.ts                      # MODIFY: POST handler - add tag translation
└── [publicId]/
    └── route.ts                  # MODIFY: PUT handler - add tag translation

/src/lib/content-translation/     # Dependencies (from prior tasks)
├── index.ts                      # Module exports
├── source-language.ts            # detectSourceLanguage()
└── triggers/
    └── tag-trigger.ts            # triggerTagTranslation() (REQ-E03-004)
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `triggerTagTranslation` | `/src/lib/content-translation/triggers/tag-trigger.ts` | Queue tag translation jobs |
| `detectSourceLanguage` | `/src/lib/content-translation/source-language.ts` | Determine source language (already added in REQ-E03-008) |
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Language type |

### Database Schema Reference

**Items Table (`items`):**
```sql
id: uuid PRIMARY KEY
public_id: uuid UNIQUE
name: text NOT NULL
description: text
property_id: uuid REFERENCES properties(id)
source_language: text  -- Added in Epic 1, populated in REQ-E03-008
tags: text[]  -- Array of tag strings
qr_code_url: text
created_at: timestamptz
updated_at: timestamptz
```

**Tag Translations Table (`tag_translations`):**
```sql
id: uuid PRIMARY KEY
tag_key: varchar(100) NOT NULL
language: varchar(5) NOT NULL
translated_value: varchar(255) NOT NULL
is_system_tag: boolean DEFAULT false
created_at: timestamptz
UNIQUE(tag_key, language)
```

**Translation Jobs Table (`translation_jobs`):**
```sql
id: uuid PRIMARY KEY
entity_type: varchar(50) NOT NULL  -- 'item', 'article', 'link', 'tag'
entity_id: uuid NOT NULL  -- For tags, this is the tag_key (not UUID)
source_language: varchar(5) NOT NULL
target_language: varchar(5) NOT NULL
status: varchar(20) NOT NULL  -- 'queued', 'processing', 'completed', 'failed'
priority: integer DEFAULT 50
attempts: integer DEFAULT 0
created_at: timestamptz
```

---

## Interface Contracts

### Tag Translation Trigger (from REQ-E03-004)

```typescript
// /src/lib/content-translation/triggers/tag-trigger.ts

/**
 * Triggers translation for a tag's value across all target languages.
 *
 * - System tags (pre-seeded) are skipped
 * - User-created tags are checked for existing translations before queuing
 * - Only missing translations are queued
 */
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>;

interface QueueTranslationResult {
  success: boolean;
  jobIds: string[];
  queuedLanguages: SupportedLanguage[];
  error?: string;
}
```

### Helper Function for Tag Filtering

```typescript
/**
 * Filters out system tags (those starting with '#') from a tags array.
 * Returns only user-defined tags that may need translation.
 *
 * @param tags - Array of tag strings
 * @returns Array of user tag strings (excludes system tags)
 *
 * @example
 * getUserTags(['#room.kitchen', 'coffee-maker', '#type.appliance', 'my-tag'])
 * // Returns: ['coffee-maker', 'my-tag']
 */
function getUserTags(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.filter(tag => !tag.startsWith('#'));
}
```

---

## Implementation Details

### POST Handler Modifications

**Location:** `/src/app/api/admin/items/route.ts`
**Function:** `POST` (lines 267-561)

**Note:** This builds on REQ-E03-008 which already added:
- Import for `detectSourceLanguage` from `@/lib/content-translation`
- Helper functions `getUserPreferredLanguage` and `getAccountPreferredLanguage`
- Source language detection logic
- Translation queuing for item fields (name, description)

**Step 1: Add import for tag trigger (update existing import)**
```typescript
// Update existing import (added in REQ-E03-008)
import {
  queueContentTranslations,
  detectSourceLanguage,
  triggerTagTranslation  // ADD THIS
} from '@/lib/content-translation';
```

**Step 2: Add helper function for tag filtering (after line ~120)**
```typescript
/**
 * Filters out system tags from a tags array.
 * System tags start with '#' (e.g., '#room.kitchen', '#type.appliance')
 * @param tags - Array of tag strings
 * @returns Array of user-defined tags only
 */
function getUserTags(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.filter(tag => !tag.startsWith('#'));
}
```

**Step 3: After item translation queuing (after existing translation code, before response), add tag translation**

Insert after the item translation queuing block (added in REQ-E03-008):
```typescript
// After: console.log('Translation jobs queued:', translationJobIds.length);
// or after the translation try/catch block

// Queue tag translations (non-blocking)
const userTags = getUserTags(body.tags);
if (userTags.length > 0) {
  console.log('ITEMS_API: Processing tag translations', {
    itemId: newItem.id,
    tagCount: userTags.length,
    tags: userTags,
  });

  // Process tags in parallel, but don't fail item creation on tag errors
  const tagResults = await Promise.allSettled(
    userTags.map(tag => triggerTagTranslation(tag, sourceLanguage))
  );

  // Log results
  const tagJobsQueued = tagResults
    .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
      r.status === 'fulfilled' && r.value.success)
    .reduce((sum, r) => sum + r.value.jobIds.length, 0);

  const tagErrors = tagResults
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason);

  if (tagErrors.length > 0) {
    console.error('ITEMS_API: Tag translation errors', {
      itemId: newItem.id,
      errors: tagErrors,
    });
  }

  console.log('ITEMS_API: Tag translation complete', {
    itemId: newItem.id,
    tagsProcessed: userTags.length,
    jobsQueued: tagJobsQueued,
    errors: tagErrors.length,
  });
}
```

### PUT Handler Modifications

**Location:** `/src/app/api/admin/items/[publicId]/route.ts`
**Function:** `PUT` (lines 458-810)

**Note:** This builds on REQ-E03-008 which already added similar modifications to the PUT handler.

**Step 1: Add import for tag trigger (update existing import)**
```typescript
// Update existing import (added in REQ-E03-008)
import {
  queueContentTranslations,
  detectSourceLanguage,
  deleteEntityTranslations,
  triggerTagTranslation  // ADD THIS
} from '@/lib/content-translation';
```

**Step 2: Add helper function for tag filtering (after line ~240)**
```typescript
/**
 * Filters out system tags from a tags array.
 * System tags start with '#' (e.g., '#room.kitchen', '#type.appliance')
 * @param tags - Array of tag strings
 * @returns Array of user-defined tags only
 */
function getUserTags(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.filter(tag => !tag.startsWith('#'));
}
```

**Step 3: After item translation queuing (after existing translation code, before response), add tag translation**

Insert after the item translation queuing block (added in REQ-E03-008):
```typescript
// After: console.log('Translation jobs queued after update:', translationJobIds.length);
// or after the translation try/catch block

// Queue tag translations (non-blocking)
const userTags = getUserTags(body.tags);
if (userTags.length > 0) {
  console.log('ITEMS_API: Processing tag translations on update', {
    itemId: updatedItem.id,
    tagCount: userTags.length,
    tags: userTags,
  });

  // Process tags in parallel, but don't fail item update on tag errors
  const tagResults = await Promise.allSettled(
    userTags.map(tag => triggerTagTranslation(tag, sourceLanguage))
  );

  // Log results
  const tagJobsQueued = tagResults
    .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
      r.status === 'fulfilled' && r.value.success)
    .reduce((sum, r) => sum + r.value.jobIds.length, 0);

  const tagErrors = tagResults
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason);

  if (tagErrors.length > 0) {
    console.error('ITEMS_API: Tag translation errors on update', {
      itemId: updatedItem.id,
      errors: tagErrors,
    });
  }

  console.log('ITEMS_API: Tag translation complete on update', {
    itemId: updatedItem.id,
    tagsProcessed: userTags.length,
    jobsQueued: tagJobsQueued,
    errors: tagErrors.length,
  });
}
```

---

## Authorized Files and Functions for Modification

### Files to Modify (UPDATE)

| File Path | Change Type | Lines Affected | Description |
|-----------|-------------|----------------|-------------|
| `/src/app/api/admin/items/route.ts` | Modify | 1-10 (imports), ~120 (helper), ~500-540 (tag translation block) | Add tag translation to POST handler |
| `/src/app/api/admin/items/[publicId]/route.ts` | Modify | 1-10 (imports), ~240 (helper), ~720-760 (tag translation block) | Add tag translation to PUT handler |

### Functions to Modify

| Function | File | Lines | Modification |
|----------|------|-------|--------------|
| `POST` handler | route.ts | 267-561 | Add tag translation after item creation and item translation queuing |
| `PUT` handler | [publicId]/route.ts | 458-810 | Add tag translation after item update and item translation queuing |

### New Functions to Add

| Function | File | Purpose |
|----------|------|---------|
| `getUserTags` | route.ts | Filter system tags from tags array |
| `getUserTags` | [publicId]/route.ts | Filter system tags from tags array (duplicate for locality) |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Import content translation functions |
| `/src/lib/content-translation/triggers/tag-trigger.ts` | `triggerTagTranslation` function signature |
| `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult` type |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type |
| `/src/types/index.ts` | `CreateItemRequest`, `UpdateItemRequest` types (already have `tags` field) |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority | Dependencies |
|---|------|------|----------|--------------|
| 1 | Add `triggerTagTranslation` to existing import in route.ts | XS | Required | REQ-E03-004, REQ-E03-008 |
| 2 | Add `getUserTags` helper function in route.ts | XS | Required | None |
| 3 | Add tag translation block after item translation in POST handler | S | Required | Tasks 1-2, REQ-E03-008 |
| 4 | Add `triggerTagTranslation` to existing import in [publicId]/route.ts | XS | Required | REQ-E03-004, REQ-E03-008 |
| 5 | Add `getUserTags` helper function in [publicId]/route.ts | XS | Required | None |
| 6 | Add tag translation block after item translation in PUT handler | S | Required | Tasks 4-5, REQ-E03-008 |
| 7 | Verify TypeScript compilation with `npm run build` | XS | Required | Tasks 1-6 |

### Implementation Order

1. **Phase 1 - POST Handler:**
   - Tasks 1, 2, 3: Update imports, add helper, add tag translation block

2. **Phase 2 - PUT Handler:**
   - Tasks 4, 5, 6: Update imports, add helper, add tag translation block

3. **Phase 3 - Verification:**
   - Task 7: Build and verify no TypeScript errors

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| POST handler extracts tags array from successfully saved item | `const userTags = getUserTags(body.tags)` after item creation |
| POST handler iterates through each tag in the array | `userTags.map(tag => triggerTagTranslation(tag, sourceLanguage))` |
| POST handler skips tags where the tag key begins with '#' character | `getUserTags()` filters with `!tag.startsWith('#')` |
| POST handler queries database to check for existing translation records for each user tag | `triggerTagTranslation()` handles this internally via `isSystemTag()` and `getExistingTagTranslationLanguages()` |
| POST handler queues tag translation jobs only for missing language translations | `triggerTagTranslation()` handles this internally via `excludeLanguages` |
| POST handler avoids creating duplicate translation jobs for tags that are already queued or completed | `triggerTagTranslation()` checks `getPendingTagJobLanguages()` internally |
| PUT/PATCH handler performs the same tag translation logic after item updates | Same implementation pattern in PUT handler |
| Both handlers continue item save operation even if tag translation queuing fails | `Promise.allSettled()` catches all errors, item save not affected |
| Both handlers log tag translation errors to system error tracking | `console.error('ITEMS_API: Tag translation errors', ...)` |
| Tag translation queuing does not impact item save response time noticeably | `Promise.allSettled()` runs in parallel, non-blocking |
| Tag translation uses the same source language as the item itself | Uses `sourceLanguage` variable from REQ-E03-008 |
| All database queries for tag translation status are optimized to avoid N+1 problems | `triggerTagTranslation()` uses efficient queries in tag-trigger.ts |
| System tags are never sent to the translation queue | `getUserTags()` filters `#` prefix, `triggerTagTranslation()` checks `is_system_tag` |

---

## Error Handling Strategy

### Tag Translation Errors Should NOT Fail Item Operations

```typescript
// Correct pattern - tag translation errors don't fail item save
const tagResults = await Promise.allSettled(
  userTags.map(tag => triggerTagTranslation(tag, sourceLanguage))
);

// Log failures but continue
const tagErrors = tagResults.filter(r => r.status === 'rejected');
if (tagErrors.length > 0) {
  console.error('Tag translation errors', tagErrors);
}

// Item save response is unaffected
return NextResponse.json({
  success: true,  // Item operation succeeded
  data: { /* item data */ },
  // Tag translation status not included in response
}, { status: 201 });
```

### Error Scenarios

| Error Scenario | Handling | Impact on Item Save |
|---------------|----------|---------------------|
| Tag trigger throws exception | Caught by `Promise.allSettled()` | None - item saves normally |
| Database error checking system tag | Caught in `triggerTagTranslation()` | None - treated as non-system tag |
| Job queue insert fails | Caught in `triggerTagTranslation()` | None - logged, continues |
| Network timeout to database | Caught by `Promise.allSettled()` | None - logged, continues |
| Invalid tag format | Handled gracefully | None - translation may fail later |

---

## Testing Considerations

### Unit Test Cases

1. **POST Handler Tag Translation Integration**
   - Create item with user tags -> tags trigger translation
   - Create item with system tags (`#room.kitchen`) -> tags skipped
   - Create item with mixed tags -> only user tags processed
   - Create item with no tags -> no tag translation attempted
   - Create item with empty tags array -> no tag translation attempted
   - Tag translation error -> item creation still succeeds

2. **PUT Handler Tag Translation Integration**
   - Update item with new user tags -> tags trigger translation
   - Update item adding system tags -> system tags skipped
   - Update item with same tags -> `triggerTagTranslation` called (handles dedup internally)
   - Update item removing tags -> no errors (tags array is smaller)
   - Tag translation error -> item update still succeeds

3. **getUserTags Helper Function**
   - `getUserTags(['tag1', 'tag2'])` returns `['tag1', 'tag2']`
   - `getUserTags(['#room.kitchen', 'tag1'])` returns `['tag1']`
   - `getUserTags(['#room.kitchen', '#type.appliance'])` returns `[]`
   - `getUserTags([])` returns `[]`
   - `getUserTags(undefined)` returns `[]`
   - `getUserTags(null)` returns `[]`

### Integration Test Cases

1. Create item with user tags -> Verify translation jobs in `translation_jobs` table
2. Create item with system tags -> Verify NO translation jobs created
3. Update item adding new tag -> Verify translation job created for new tag
4. Update item with existing translated tag -> Verify no duplicate jobs
5. Create item with tag that already exists -> Verify no duplicate translations

### Test File Locations

- Unit tests: `/src/app/api/admin/items/__tests__/route.test.ts`
- Unit tests: `/src/app/api/admin/items/[publicId]/__tests__/route.test.ts`
- Integration tests: `/src/tests/integration/tag-translation.test.ts`

---

## Related Documentation

- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-011)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 2, Task 2.5)
- **Items API Translation:** `/docs/REQ-E03-008-modify-items-api-to-trigger-translations-overview.md` (prerequisite)
- **Tag Trigger:** `/docs/REQ-E03-004-implement-tag-translation-trigger-overview.md` (dependency)
- **Existing Items API:** `/src/app/api/admin/items/route.ts`, `/src/app/api/admin/items/[publicId]/route.ts`
- **Tag Mapper Utility:** `/src/components/ItemCreationWorkflow/utils/tagMapper.ts`
- **System Tags Seed:** `/database/seeds/20260117_system_tag_translations.sql`

---

## Notes

1. **Dependency on REQ-E03-008:** This task MUST be implemented after REQ-E03-008 (Modify Items API to Trigger Translations) because it builds on the infrastructure added there (source language detection, imports, etc.).

2. **Dependency on REQ-E03-004:** The `triggerTagTranslation()` function from Task 1.4 must exist before this task can be implemented.

3. **Non-Blocking Tag Translation:** Tag translation is intentionally non-blocking. If tag translation fails, the item save operation still succeeds. This follows the principle that secondary concerns should never fail primary operations.

4. **Duplicate Helper Functions:** The `getUserTags` function is added to both route files. This is acceptable for simplicity but could be refactored to a shared utility later.

5. **System Tag Detection:**
   - First line of defense: `getUserTags()` filters tags starting with `#`
   - Second line: `triggerTagTranslation()` checks `is_system_tag` in database
   - This double-check ensures system tags are never translated redundantly

6. **No Response Changes:** Unlike REQ-E03-008, this task does NOT add new fields to the response. Tag translation is completely silent from the API consumer's perspective.

7. **Tags Array Already Exists:** The `tags` field already exists in both `CreateItemRequest` and `UpdateItemRequest` types. No type changes are needed.

8. **POST Handler Tag Support:** Note that the current POST handler (`route.ts` lines 407-418) does NOT include tags in the database insert. This may need to be addressed separately or may be intentional (tags added on subsequent updates).

9. **Performance Consideration:** Tags are processed in parallel using `Promise.allSettled()`. For items with many tags (e.g., 10+), this should complete quickly since each `triggerTagTranslation()` call is independent.

---

## File Structure After Implementation

```typescript
// /src/app/api/admin/items/route.ts (modified)
import { NextRequest, NextResponse } from 'next/server';
// ... existing imports ...
import {
  queueContentTranslations,
  detectSourceLanguage,
  triggerTagTranslation  // NEW (added in this task)
} from '@/lib/content-translation';

// NEW: Helper function
function getUserTags(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.filter(tag => !tag.startsWith('#'));
}

// ... existing code ...

export async function POST(request: NextRequest) {
  // ... existing item creation and translation code from REQ-E03-008 ...

  // NEW: Tag translation block
  const userTags = getUserTags(body.tags);
  if (userTags.length > 0) {
    const tagResults = await Promise.allSettled(
      userTags.map(tag => triggerTagTranslation(tag, sourceLanguage))
    );
    // ... logging ...
  }

  // ... existing response ...
}
```

```typescript
// /src/app/api/admin/items/[publicId]/route.ts (modified)
// Similar structure to POST handler
```
