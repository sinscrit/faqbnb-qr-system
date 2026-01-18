# Implementation Overview: Add Tag Translation on Item Save

## Header

| Field | Value |
|-------|-------|
| Request Reference | #269 |
| Source File | docs/gen_requests_epic3.md |
| Implementation Plan | docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| Original Request Date | 2026-01-18 |
| Breakdown Created | 2026-01-18 11:45:00 CET |
| T-shirt Size | M |
| Estimated Effort | 1-2 days (8-16 hours) |
| Phase | 2 - Modify Existing Content APIs |
| Task ID | 2.5 |
| Dependencies | REQ-260 (Content Translation Orchestrator), REQ-262 (Tag Translation Trigger) |

## Goals

Enhance the Items API to automatically queue translation jobs for user-created tags when items are created or updated, while intelligently skipping system tags that already have pre-seeded translations.

### Key Requirements

1. **System Tag Detection**: Identify system tags (prefixed with `#`) and skip translation for them
2. **User Tag Translation**: Queue translation jobs for user-created tags that lack translations
3. **Duplicate Prevention**: Check existing translations before queuing to avoid redundant jobs
4. **Non-Blocking**: Translation failures should not prevent item create/update operations
5. **Transparency**: Include translation job IDs in API responses for tracking

### Assumptions & Clarifications

- System tags are identified by the `#` prefix (e.g., `#room.kitchen`, `#appliance.coffee-maker`)
- User tags are plain strings without the `#` prefix (e.g., `wifi-enabled`, `premium-feature`)
- The `triggerTagTranslation` function from REQ-262 handles individual tag translation logic
- Source language detection uses the utility from REQ-265 (`detectSourceLanguage`)
- Translation job tracking IDs are UUIDs returned by the translation job queue
- The tag translations table and job queue infrastructure must be in place from Epic 1

## Implementation Plan

### Step 1: Add Tag Translation Helper Function

- **Description**: Create a helper function that iterates through tags, identifies user tags vs system tags, and queues translations for eligible user tags
- **Rationale**: Centralizes tag translation logic for reuse in both POST and PUT handlers
- **File**: `src/app/api/admin/items/route.ts` (inline helper or separate utility)
- **Estimated Effort**: S (2-3 hours)

```typescript
// Pseudocode for the helper
async function queueTagTranslations(
  tags: string[],
  sourceLanguage: string,
  supabase: SupabaseClient
): Promise<{ jobIds: string[], skippedTags: string[], errors: string[] }> {
  const jobIds: string[] = [];
  const skippedTags: string[] = [];
  const errors: string[] = [];

  for (const tag of tags) {
    // Skip system tags (starting with #)
    if (tag.startsWith('#')) {
      skippedTags.push(tag);
      continue;
    }

    try {
      const result = await triggerTagTranslation(tag, sourceLanguage);
      if (result.success && result.jobIds.length > 0) {
        jobIds.push(...result.jobIds);
      }
    } catch (error) {
      errors.push(`Failed to queue translation for tag: ${tag}`);
      console.error(`Tag translation error for "${tag}":`, error);
    }
  }

  return { jobIds, skippedTags, errors };
}
```

### Step 2: Modify Items POST Handler for Tag Translation

- **Description**: After successful item creation, examine the `tags` array and queue translations for user tags
- **Rationale**: Ensures new items have their custom tags translated immediately
- **File**: `src/app/api/admin/items/route.ts`
- **Estimated Effort**: M (3-4 hours)

**Changes Required:**
1. Import `triggerTagTranslation` from content-translation module
2. Import `detectSourceLanguage` from source-language utility
3. Accept optional `sourceLanguage` in request body
4. After item creation, call `queueTagTranslations` with item's tags
5. Include `tagTranslationJobIds` in response

### Step 3: Modify Items PUT Handler for Tag Translation

- **Description**: After successful item update, perform the same tag translation logic as POST
- **Rationale**: Ensures updated items have any new custom tags translated
- **File**: `src/app/api/admin/items/[publicId]/route.ts`
- **Estimated Effort**: M (3-4 hours)

**Changes Required:**
1. Import `triggerTagTranslation` from content-translation module
2. Import `detectSourceLanguage` from source-language utility
3. After item update, call `queueTagTranslations` with updated item's tags
4. Include `tagTranslationJobIds` in response

### Step 4: Add Error Handling and Logging

- **Description**: Implement comprehensive error handling that logs translation failures without blocking item operations
- **Rationale**: Translation is a secondary operation; item CRUD must succeed regardless
- **Estimated Effort**: S (1-2 hours)

**Requirements:**
- Log errors with sufficient context (tag value, item ID, error message)
- Continue processing remaining tags if one fails
- Track partial failures in response metadata

### Step 5: Update Response Types

- **Description**: Add `tagTranslationJobIds` field to Item API response types
- **Rationale**: Enables clients to track translation progress for tags
- **File**: `src/types/index.ts`
- **Estimated Effort**: XS (30 minutes)

### Step 6: Write Unit Tests

- **Description**: Create tests for tag translation logic covering all scenarios
- **Rationale**: Ensures correctness and prevents regression
- **Estimated Effort**: S (2-3 hours)

**Test Cases:**
- Item with only system tags (all skipped)
- Item with only user tags (all queued)
- Item with mixed system and user tags
- Item with no tags (no-op)
- Translation queue failure handling
- Duplicate tag prevention
- Source language detection fallback

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### API Route Files

| File | Target | Type |
|------|--------|------|
| `src/app/api/admin/items/route.ts` | `POST` handler | Modify |
| `src/app/api/admin/items/[publicId]/route.ts` | `PUT` handler | Modify |

### Content Translation Module (Dependencies - Create if not exists)

| File | Target | Type |
|------|--------|------|
| `src/lib/content-translation/index.ts` | Module exports | Create |
| `src/lib/content-translation/triggers/tag-trigger.ts` | `triggerTagTranslation` | Create |
| `src/lib/content-translation/source-language.ts` | `detectSourceLanguage` | Create |

### Type Definitions

| File | Target | Type |
|------|--------|------|
| `src/types/index.ts` | `ItemResponse` | Extend |
| `src/types/index.ts` | `CreateItemRequest` | Extend |
| `src/types/index.ts` | `UpdateItemRequest` | Extend |

### Test Files

| File | Target | Type |
|------|--------|------|
| `src/app/api/admin/items/__tests__/tag-translation.test.ts` | Tag translation tests | Create |
| `src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts` | Trigger tests | Create |

## Dependencies

### Internal Dependencies (Must be implemented first)

| Requirement | Description | Status |
|-------------|-------------|--------|
| REQ-260 | Content Translation Orchestrator | **Required** |
| REQ-262 | Tag Translation Trigger with System Tag Handling | **Required** |
| REQ-265 | Source Language Detection Utility | **Required** |
| Epic 1 | Translation tables and job queue infrastructure | **Required** |

### External Dependencies

| Dependency | Purpose |
|------------|---------|
| Supabase | Database for translation jobs and tag translations tables |
| Translation Service (Epic 1) | Backend translation processing |

## Technical Details

### System Tag Identification

System tags in FAQBNB use the `#` prefix format:
- Room tags: `#room.kitchen`, `#room.bathroom`, `#room.living-room`
- Appliance tags: `#appliance.coffee-maker`, `#appliance.dishwasher`
- Item type tags: `#type.appliance`, `#type.room-item`

The implementation will use a simple prefix check:

```typescript
function isSystemTag(tag: string): boolean {
  return tag.startsWith('#');
}
```

### User Tag Examples

User-created tags are plain strings:
- `wifi-enabled`
- `pet-friendly`
- `premium-feature`
- `energy-efficient`
- `requires-key`

### Translation Job Flow

```
Item Save Request (POST/PUT)
    │
    ├── 1. Save item with tags array
    │
    └── 2. For each tag in tags[]:
            │
            ├── System tag (starts with #)? → Skip
            │
            └── User tag? → Call triggerTagTranslation
                    │
                    ├── Check if translation exists
                    │       │
                    │       ├── Yes → Return existing job IDs
                    │       │
                    │       └── No → Queue translation jobs
                    │               │
                    │               └── Return new job IDs
                    │
                    └── Collect all job IDs
    │
    └── 3. Return response with tagTranslationJobIds
```

### Response Structure

```typescript
// POST /api/admin/items response
{
  success: true,
  data: {
    id: "item-uuid",
    publicId: "public-uuid",
    name: "Coffee Maker",
    // ... other fields
  },
  translationJobIds: ["job-1", "job-2"],     // Item name/description translations
  tagTranslationJobIds: ["job-3", "job-4"],  // NEW: Tag translations
  accountContext: {
    accountId: "account-uuid",
    accountRole: "owner"
  }
}
```

## Risks and Considerations

### Potential Side Effects

1. **API Response Size**: Adding `tagTranslationJobIds` increases response payload slightly
2. **Processing Time**: Tag translation queueing adds ~10-50ms per tag to request time
3. **Job Queue Load**: Items with many custom tags will generate multiple translation jobs

### Mitigation Strategies

1. **Async Processing**: Translation queueing is fire-and-forget; doesn't block response
2. **Batch Optimization**: Consider batching multiple tag translations if needed in future
3. **Error Isolation**: Individual tag failures don't affect other tags or item save
4. **Rate Limiting**: Relies on Epic 1 job queue rate limiting

### Testing Requirements

1. **Unit Tests**
   - System tag detection function
   - Tag translation helper function
   - Error handling scenarios

2. **Integration Tests**
   - Full POST flow with tag translations
   - Full PUT flow with tag translations
   - Mixed system/user tags

3. **E2E Tests**
   - Create item with custom tags → verify jobs queued
   - Update item with new tags → verify new jobs queued
   - Verify system tags are skipped

## Out of Scope

1. **Tag Translation Display**: Frontend display of translated tags is Epic 4
2. **Tag Translation Management UI**: Admin UI for managing translations is Epic 5
3. **Batch Tag Import**: Bulk operations on tags will be handled separately
4. **Tag Normalization**: Deduplication of semantically similar tags is future work
5. **Tag Auto-Suggestions**: Suggesting existing translated tags is future work

## Acceptance Criteria Mapping

| REQ-269 Acceptance Criteria | Implementation Task |
|-----------------------------|---------------------|
| POST handler examines tags array after item creation | Step 2 |
| Handler determines system tags based on hash prefix | Step 1 |
| System tags (starting with #) are skipped | Step 1 |
| User tags checked against existing translations | Step 1 (via REQ-262) |
| Jobs queued only for tags lacking translations | Step 1 (via REQ-262) |
| POST response includes tagTranslationJobIds | Step 2, Step 5 |
| PUT/PATCH performs same tag translation logic | Step 3 |
| PUT/PATCH response includes tagTranslationJobIds | Step 3, Step 5 |
| Tag translation failures don't fail item operations | Step 4 |
| Errors logged but don't prevent successful response | Step 4 |
| Uses triggerTagTranslation from REQ-262 | Step 1, Step 2, Step 3 |
| Integrates with orchestrator from REQ-260 | Via REQ-262 |
| Uses source language detection when not provided | Step 2, Step 3 (via REQ-265) |

---
*Document generated: 2026-01-18 11:45:00 CET*
*Implementation Plan Reference: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md*
