# Implementation Overview: Modify Items API to Trigger Content Translations

## Header

| Field | Value |
|-------|-------|
| Request Reference | #266 |
| Source File | docs/gen_requests_epic3.md |
| Implementation Plan | docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| Phase | 2 - Modify Existing Content APIs |
| Task ID | 2.2 |
| Original Request Date | 2026-01-18 |
| Breakdown Created | 2026-01-18 12:30:00 UTC |
| T-shirt Size | M |
| Estimated Effort | 1-2 days (8-16 hours) |

## Goals

Enhance the Items API to automatically trigger translation jobs when items are created or updated, ensuring multilingual content is generated without manual intervention.

1. **POST Handler Enhancement**: Accept optional `sourceLanguage` parameter and queue translations after successful item creation
2. **PUT Handler Enhancement**: Delete existing translations before update, queue new translations after successful update
3. **Non-Blocking Operation**: Translation failures should not block item CRUD operations
4. **Response Enhancement**: Include `translationJobIds` in API responses for tracking

### Assumptions & Clarifications

- **Epic 1 Dependency**: This task assumes Epic 1 (Plan-110) infrastructure is implemented, including:
  - Translation service at `/src/lib/translation-service/`
  - Job queue at `/src/lib/job-queue/`
  - Translation tables (`item_translations`, `translation_jobs`)
  - `source_language` column on `items` table
  - `preferred_language` columns on `users` and `accounts` tables
- The `queueContentTranslations` function from REQ-260 must be implemented first
- The `detectSourceLanguage` utility from REQ-265 must be implemented first
- Translation to 5 target languages (excluding source): en, fr, es, de, nl, it
- Translation errors are logged but do not fail the main CRUD operation

## Implementation Plan

### Step 1: Add Source Language Detection Import

- **Description**: Import the `detectSourceLanguage` utility from the content-translation module to determine the appropriate source language for translation
- **Rationale**: Must establish how to determine source language before implementing translation triggers
- **Estimated Effort**: XS (15-30 minutes)

### Step 2: Modify POST Handler - Request Body Validation

- **Description**: Update the POST handler request body type to accept an optional `sourceLanguage` field
- **Rationale**: Allow API consumers to explicitly specify source language when creating items
- **Estimated Effort**: XS (15-30 minutes)

### Step 3: Modify POST Handler - Source Language Storage

- **Description**: Store the source language in the `items.source_language` column during item creation
- **Rationale**: Source language must be persisted for future reference and translation status queries
- **Estimated Effort**: S (30-60 minutes)

### Step 4: Modify POST Handler - Queue Translations

- **Description**: After successful item creation (including article and links), call `queueContentTranslations` to queue translation jobs for all target languages
- **Rationale**: Core feature - automatically trigger translations when content is created
- **Estimated Effort**: M (1-2 hours)

### Step 5: Modify POST Handler - Include Translation Job IDs in Response

- **Description**: Add `translationJobIds` field to the POST response containing the array of queued job identifiers
- **Rationale**: Allows API consumers to track translation progress
- **Estimated Effort**: S (30-60 minutes)

### Step 6: Modify PUT Handler - Delete Existing Translations

- **Description**: Before updating the item, delete all existing translations from `item_translations` table for this item
- **Rationale**: Prevents stale translations from being served when content is updated
- **Estimated Effort**: S (30-60 minutes)

### Step 7: Modify PUT Handler - Request Body Validation

- **Description**: Update the PUT handler request body type to accept an optional `sourceLanguage` field
- **Rationale**: Allow API consumers to change the source language during updates
- **Estimated Effort**: XS (15-30 minutes)

### Step 8: Modify PUT Handler - Queue Translations

- **Description**: After successful item update, call `queueContentTranslations` to queue new translation jobs for the updated content
- **Rationale**: Re-translate content when it changes to maintain consistency
- **Estimated Effort**: M (1-2 hours)

### Step 9: Modify PUT Handler - Include Translation Job IDs in Response

- **Description**: Add `translationJobIds` field to the PUT response containing the array of queued job identifiers
- **Rationale**: Allows API consumers to track translation progress for updated content
- **Estimated Effort**: S (30-60 minutes)

### Step 10: Implement Error Handling for Translation Queue

- **Description**: Wrap translation queueing calls in try-catch blocks, log errors, and ensure CRUD operations succeed regardless of translation queue status
- **Rationale**: Translation is async and should not block item operations - graceful degradation
- **Estimated Effort**: S (30-60 minutes)

### Step 11: Update TypeScript Types

- **Description**: Update the `CreateItemRequest`, `UpdateItemRequest`, and response types in `/src/types/index.ts` to include `sourceLanguage` and `translationJobIds` fields
- **Rationale**: Maintain type safety across the codebase
- **Estimated Effort**: S (30-60 minutes)

### Step 12: Add Integration Tests

- **Description**: Create tests verifying translation queue is called correctly on item create/update, errors are handled gracefully, and job IDs are returned in responses
- **Rationale**: Ensure feature works correctly and handles edge cases
- **Estimated Effort**: M (2-3 hours)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Core API Routes

| File | Target | Type |
|------|--------|------|
| `src/app/api/admin/items/route.ts` | `POST` handler | Modify |
| `src/app/api/admin/items/[publicId]/route.ts` | `PUT` handler | Modify |
| `src/app/api/admin/items/[publicId]/route.ts` | `validateAdminAuth` | Review (ensure user/account available) |
| `src/app/api/admin/items/[publicId]/route.ts` | `getAccountContext` | Review (ensure account available) |

### Type Definitions

| File | Target | Type |
|------|--------|------|
| `src/types/index.ts` | `CreateItemRequest` | Modify (add `sourceLanguage?: string`) |
| `src/types/index.ts` | `UpdateItemRequest` | Modify (add `sourceLanguage?: string`) |
| `src/types/index.ts` | `ItemResponse` | Modify (add `translationJobIds?: string[]`) |

### Content Translation Module (Dependencies - Must Exist)

| File | Target | Type |
|------|--------|------|
| `src/lib/content-translation/index.ts` | Module exports | Import |
| `src/lib/content-translation/content-translation.ts` | `queueContentTranslations` | Import |
| `src/lib/content-translation/source-language.ts` | `detectSourceLanguage` | Import |
| `src/lib/content-translation/content-translation.types.ts` | `QueueTranslationOptions`, `QueueTranslationResult` | Import |

### Database Schema (Dependencies - Must Exist)

| Table | Column | Type |
|-------|--------|------|
| `items` | `source_language` | Must exist (Epic 1) |
| `item_translations` | All columns | Must exist (Epic 1) |
| `translation_jobs` | All columns | Must exist (Epic 1) |

## Dependencies

### Internal Dependencies (Must Be Implemented First)

| REQ | Description | Status Required |
|-----|-------------|-----------------|
| REQ-259 | Content Translation Module Structure and Type Definitions | Complete |
| REQ-260 | Content Translation Orchestrator (`queueContentTranslations`) | Complete |
| REQ-265 | Source Language Detection Utility (`detectSourceLanguage`) | Complete |
| Epic 1 (Plan-110) | Translation service, job queue, database schema | Complete |

### External Dependencies

| Dependency | Purpose |
|------------|---------|
| Supabase | Database operations for items and item_translations tables |
| Next.js 15 | API routes and request handling |
| TypeScript | Type definitions and compile-time safety |

## Technical Specifications

### Modified POST Handler Flow

```typescript
// 1. Validate authentication and account context
// 2. Validate request body (existing)
// 3. Validate property access (existing)
// 4. Detect source language
const sourceLanguage = detectSourceLanguage(
  user,
  account,
  body.sourceLanguage
);
// 5. Create item with source_language
const { data: newItem } = await supabase.from('items').insert({
  ...existingFields,
  source_language: sourceLanguage
});
// 6. Create articles and links (existing)
// 7. Queue translations (non-blocking)
let translationJobIds: string[] = [];
try {
  const result = await queueContentTranslations({
    content: {
      entityType: 'item',
      entityId: newItem.id,
      sourceLanguage,
      fields: [
        { fieldName: 'name', value: newItem.name, context: { contentType: 'item_name', domain: 'property_rental' } },
        { fieldName: 'description', value: newItem.description || '', context: { contentType: 'item_description', domain: 'property_rental' } }
      ]
    },
    trigger: 'create'
  });
  translationJobIds = result.jobIds;
} catch (error) {
  console.error('Translation queue error:', error);
  // Don't fail the request
}
// 8. Return response with translationJobIds
return NextResponse.json({
  success: true,
  data: transformedItem,
  translationJobIds,
  accountContext
}, { status: 201 });
```

### Modified PUT Handler Flow

```typescript
// 1. Validate authentication and account context
// 2. Validate request body and item access (existing)
// 3. Detect source language
const sourceLanguage = detectSourceLanguage(
  user,
  account,
  body.sourceLanguage
);
// 4. Delete existing translations
await supabase
  .from('item_translations')
  .delete()
  .eq('item_id', item.id);
// 5. Update item (existing, add source_language)
const { data: updatedItem } = await supabase.from('items').update({
  ...existingFields,
  source_language: sourceLanguage
});
// 6. Update articles and links (existing)
// 7. Queue translations (non-blocking)
let translationJobIds: string[] = [];
try {
  const result = await queueContentTranslations({
    content: {
      entityType: 'item',
      entityId: updatedItem.id,
      sourceLanguage,
      fields: [
        { fieldName: 'name', value: updatedItem.name, context: { contentType: 'item_name', domain: 'property_rental' } },
        { fieldName: 'description', value: updatedItem.description || '', context: { contentType: 'item_description', domain: 'property_rental' } }
      ]
    },
    trigger: 'update'
  });
  translationJobIds = result.jobIds;
} catch (error) {
  console.error('Translation queue error:', error);
  // Don't fail the request
}
// 8. Return response with translationJobIds
return NextResponse.json({
  success: true,
  data: transformedItem,
  translationJobIds,
  accountContext
});
```

### API Request/Response Contract

```typescript
// Extended CreateItemRequest
interface CreateItemRequest {
  publicId: string;
  name: string;
  description?: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: LinkInput[];
  articles?: ArticleInput[];
  sourceLanguage?: string;  // NEW: Optional override (defaults to user's preferred language)
}

// Extended UpdateItemRequest
interface UpdateItemRequest extends CreateItemRequest {
  id: string;
  sourceLanguage?: string;  // NEW: Optional override for source language
}

// Extended ItemResponse
interface ItemResponse {
  success: boolean;
  data?: { ... };
  error?: string;
  accountContext?: { ... };
  translationJobIds?: string[];  // NEW: IDs of queued translation jobs
}
```

## Risks and Considerations

### Potential Side Effects

1. **Epic 1 Dependency**: If Epic 1 infrastructure is not complete, this feature cannot be implemented. Must verify Epic 1 completion first.
2. **Database Schema**: Assumes `items.source_language` column exists. Migration must be applied.
3. **Translation Service Availability**: If translation service is down, translations won't queue but item operations continue.
4. **Performance Impact**: Adding translation queueing adds latency to item create/update operations (should be minimal with async processing).

### Edge Cases to Handle

1. **Empty Description**: Queue translation with empty string for description field
2. **Source Language Same as Target**: Translation orchestrator should skip translations where source equals target
3. **Missing User/Account Language Preferences**: Fall back to 'en' as default
4. **Translation Service Timeout**: Use reasonable timeout and don't block CRUD operation
5. **Existing Translations on Create**: Should not happen, but orchestrator should use UPSERT pattern

### Testing Requirements

1. **Unit Tests**:
   - Source language detection with various user/account/override combinations
   - Translation queue called with correct parameters on create
   - Translation queue called with correct parameters on update
   - Existing translations deleted before update
   - Error handling when translation queue fails

2. **Integration Tests**:
   - Full flow: create item -> verify translations queued
   - Full flow: update item -> verify old translations deleted, new queued
   - Response includes translationJobIds
   - CRUD succeeds when translation queue fails

3. **Manual Verification**:
   - Create item via API and verify `translation_jobs` table has entries
   - Update item via API and verify `item_translations` are deleted and re-queued
   - Check logs for translation queue errors

### Open Questions

- [ ] Should article translations also be triggered when item is created/updated with articles? (Likely REQ-267)
- [ ] Should link translations be triggered for item links? (Likely REQ-268)
- [ ] What is the timeout for translation queue operations? (Recommendation: 5 seconds)
- [ ] Should we add rate limiting per user/account for translation queuing? (Recommendation: Handle at orchestrator level)

## Out of Scope

Per Task 2.2 definition:

1. **Article Translation Triggers**: Handled separately in Task 2.3 (REQ-267)
2. **Link Translation Triggers**: Handled separately in Task 2.4 (REQ-268)
3. **Tag Translation Triggers**: Handled separately in Task 2.5
4. **Job Processing**: Handled in Phase 3 (Tasks 3.1-3.8)
5. **Translation Status APIs**: Handled in Phase 4 (Tasks 4.1-4.4)
6. **Database Index Creation**: Handled in Phase 6

## Acceptance Criteria Checklist

From gen_requests_epic3.md REQ-266:

- [ ] The POST handler in `/src/app/api/admin/items/route.ts` accepts an optional `sourceLanguage` field in the request body
- [ ] After successful item creation, the POST handler calls `queueContentTranslations` with the new item identifier and source language
- [ ] The POST response includes a `translationJobIds` field containing identifiers for queued translation jobs
- [ ] The PUT or PATCH handler in `/src/app/api/admin/items/[publicId]/route.ts` deletes all existing translations for the item before updating
- [ ] After successful item update, the PUT/PATCH handler calls `queueContentTranslations` with the updated item identifier and source language
- [ ] The PUT/PATCH response includes a `translationJobIds` field containing identifiers for newly queued translation jobs
- [ ] Translation queueing failures do not cause the item create or update operation to fail
- [ ] Translation queueing errors are logged but do not prevent the API from returning a successful response for item operations
- [ ] When `sourceLanguage` is not provided, the API uses the source language detection utility to determine the appropriate source language
- [ ] The implementation integrates with the content translation orchestrator established in REQ-260

---
*Document generated: 2026-01-18 12:30:00 UTC*
*Implementation Plan Reference: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md Phase 2 Task 2.2*
