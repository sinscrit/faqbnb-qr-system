# REQ-342: Modify Items API to Trigger Translations - Implementation Overview
*Generated: 2026-01-19 14:30:00 UTC*
*Last Modified: 2026-01-19 14:30:00 UTC*

## Reference
- **Request**: REQ-342 (Modify Items API to Trigger Translations)
- **Source**: docs/gen_requests_epic3.md (corresponds to REQ-266 in file)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: Enhancement
- **Phase**: 2 - Modify Existing Content APIs
- **Task ID**: 2.2
- **Size**: M

## Goals
1. Modify the Items API POST handler to accept optional `sourceLanguage` in request body
2. After successful item creation, call `queueContentTranslations` to queue translations for all target languages
3. Include `translationJobIds` in POST response
4. Modify the Items API PUT handler to delete existing translations before update
5. After successful item update, queue new translations and include `translationJobIds` in PUT response
6. Ensure translation queueing failures do not block item CRUD operations
7. Log translation queueing errors for debugging without failing the main operation

## Context from Implementation Plan

### Task Description (Task 2.2)
Per the implementation plan, this task modifies the Items API to automatically trigger translations:

```
- [ ] **Task 2.2:** Modify Items API to trigger translations
  - File: `/src/app/api/admin/items/route.ts`
  - **POST handler:**
    - Accept optional `sourceLanguage` in request body
    - After successful item creation, call `queueContentTranslations`
    - Include `translationJobIds` in response
  - **PUT/PATCH handler (in [id]/route.ts):**
    - Delete existing translations for this item before update
    - Queue new translations after update
    - Include `translationJobIds` in response
```

### Task Dependencies
- **Task 2.1** (Source Language Detection): Must be completed first - provides `detectSourceLanguage()` utility
- **Task 1.2** (Content Translation Orchestrator): Must be completed first - provides `queueContentTranslations()` function
- **Task 1.1** (Content Translation Types): Must be completed first - provides type definitions
- **Epic 1** (Foundation): Translation tables and translation service must exist

### Related Tasks That Depend on This
- **Task 2.5** (Tag Translation on Item Save): Will extend the changes made in this task

### Data Flow (From Implementation Plan)
```
Content Save Request
    │
    ▼
API Route (items/route.ts)
    │
    ├── 1. Save content with source_language
    │
    ├── 2. Delete existing translations (if update)
    │
    ├── 3. Queue translation jobs (5 target languages)
    │       │
    │       └── Insert into translation_jobs table
    │           - entity_type: 'item'
    │           - entity_id: UUID
    │           - source_language: detected from user/account
    │           - target_language: each of 5 other languages
    │           - status: 'queued'
    │           - priority: based on job type
    │
    └── 4. Return success immediately
            │
            └── Response includes translationJobIds
```

## Implementation Order

### Step 1: Update TypeScript Types
Add `sourceLanguage` to CreateItemRequest and `translationJobIds` to ItemResponse in `/src/types/index.ts`.

**Changes:**
- Add optional `sourceLanguage?: string` field to `CreateItemRequest` interface
- Add optional `translationJobIds?: string[]` field to `ItemResponse.data` structure

### Step 2: Modify POST Handler in `/src/app/api/admin/items/route.ts`
Enhance the POST handler to trigger translations after item creation.

**Changes:**
1. Import `queueContentTranslations` from `@/lib/content-translation`
2. Import `detectSourceLanguage` from `@/lib/content-translation`
3. Extract `sourceLanguage` from request body
4. After successful item creation, call `queueContentTranslations()`
5. Add `translationJobIds` to response (even if empty on failure)
6. Wrap translation logic in try-catch to prevent blocking main operation
7. Log errors for debugging without failing the item creation

### Step 3: Modify PUT Handler in `/src/app/api/admin/items/[publicId]/route.ts`
Enhance the PUT handler to delete existing translations and queue new ones.

**Changes:**
1. Import `queueContentTranslations` from `@/lib/content-translation`
2. Import `detectSourceLanguage` from `@/lib/content-translation`
3. Import supabase client for translation deletion
4. Before updating item, delete existing translations from `item_translations` table
5. Extract `sourceLanguage` from request body (if provided)
6. After successful item update, call `queueContentTranslations()`
7. Add `translationJobIds` to response
8. Wrap translation logic in try-catch to prevent blocking main operation
9. Log errors for debugging without failing the item update

### Step 4: Verification
- Run TypeScript compilation to verify no errors
- Test item creation triggers translation jobs
- Test item update deletes old translations and creates new jobs
- Verify main operations succeed even if translation queueing fails

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/types/index.ts`
- **Purpose**: Add translation-related fields to API request/response types
- **Functions/Interfaces to modify**:
  - `CreateItemRequest` interface - Add `sourceLanguage?: string` field
  - `UpdateItemRequest` interface - Add `sourceLanguage?: string` field (inherits from CreateItemRequest)
  - `ItemResponse` interface - Add `translationJobIds?: string[]` to data structure

#### `/src/app/api/admin/items/route.ts`
- **Purpose**: Trigger translations after item creation
- **Functions to modify**:
  - `POST` handler function (lines 267-562)
    - Add imports for content-translation module
    - Extract sourceLanguage from request body
    - Add translation queueing logic after item creation (after line 433)
    - Include translationJobIds in response (lines 507-547)

#### `/src/app/api/admin/items/[publicId]/route.ts`
- **Purpose**: Delete existing translations and trigger new ones after item update
- **Functions to modify**:
  - `PUT` handler function (lines 458-810)
    - Add imports for content-translation module
    - Add logic to delete existing item_translations before update (after line 614)
    - Extract sourceLanguage from request body
    - Add translation queueing logic after item update (after line 639)
    - Include translationJobIds in response (lines 756-796)

### New Dependencies to Import

```typescript
// In both route files, add these imports at the top:
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

### Database Operations

#### Translation Deletion (PUT handler only)
```typescript
// Delete existing translations for this item before update
const { error: deleteTranslationsError } = await supabase
  .from('item_translations')
  .delete()
  .eq('item_id', item.id);

if (deleteTranslationsError) {
  console.error('Failed to delete existing translations:', deleteTranslationsError);
  // Continue with update - don't fail the main operation
}
```

#### Translation Queueing (Both handlers)
```typescript
// Queue translations for all target languages
let translationJobIds: string[] = [];
try {
  const sourceLanguage = body.sourceLanguage ||
    detectSourceLanguage(user, accountContext, undefined);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'item',
      entityId: newItem.id, // or updatedItem.id for PUT
      sourceLanguage,
      fields: [
        {
          fieldName: 'name',
          value: newItem.name,
          context: { contentType: 'item_name', domain: 'property_rental' },
          maxLength: 255
        },
        {
          fieldName: 'description',
          value: newItem.description || '',
          context: { contentType: 'item_description', domain: 'property_rental' }
        }
      ]
    },
    trigger: 'create' // or 'update' for PUT
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for item ${newItem.id}`);
  } else {
    console.error('Translation queueing failed:', translationResult.error);
  }
} catch (translationError) {
  console.error('Error queueing translations:', translationError);
  // Don't fail the item creation/update - translations can be retried later
}
```

### Existing Files (Read-Only Reference)
These files will be imported from but NOT modified:
- `/src/lib/content-translation/index.ts` - Module exports
- `/src/lib/content-translation/content-translation.ts` - queueContentTranslations function
- `/src/lib/content-translation/source-language.ts` - detectSourceLanguage function

## Technical Specifications

### Request Body Extension (POST/PUT)
```typescript
// Extended CreateItemRequest
interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: {...}[];
  articles?: {...}[];
  // NEW: Optional source language for translation
  sourceLanguage?: string;
}
```

### Response Extension
```typescript
// Extended ItemResponse
interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    // ... existing fields ...
    // NEW: Translation job tracking
    translationJobIds?: string[];
  };
  error?: string;
  accountContext?: {...};
}
```

### Translation Context (From Implementation Plan)
```typescript
const TRANSLATION_CONTEXTS = {
  item_name: {
    contentType: 'item_name' as const,
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate the name of a household item or appliance in a vacation rental context. Keep it concise and natural.'
  },
  item_description: {
    contentType: 'item_description' as const,
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate a description of a household item for vacation rental guests. Maintain helpful, friendly tone.'
  }
};
```

### Supported Languages
Per Epic 1 configuration:
- English (en) - default
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

Source language is excluded from target languages (5 translations per item).

## Success Validation Checklist

### Type Updates
- [ ] `CreateItemRequest` includes optional `sourceLanguage` field
- [ ] `UpdateItemRequest` includes optional `sourceLanguage` field
- [ ] `ItemResponse.data` includes optional `translationJobIds` field
- [ ] TypeScript compilation succeeds without errors

### POST Handler (/api/admin/items)
- [ ] Accepts `sourceLanguage` in request body
- [ ] Creates item successfully before queueing translations
- [ ] Calls `queueContentTranslations` after item creation
- [ ] Uses `detectSourceLanguage` when sourceLanguage not provided
- [ ] Includes `translationJobIds` in success response
- [ ] Item creation succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging
- [ ] Does not expose internal errors to client

### PUT Handler (/api/admin/items/[publicId])
- [ ] Accepts `sourceLanguage` in request body
- [ ] Deletes existing item_translations before update
- [ ] Translation deletion failure doesn't block update
- [ ] Updates item successfully before queueing translations
- [ ] Calls `queueContentTranslations` after item update
- [ ] Uses `detectSourceLanguage` when sourceLanguage not provided
- [ ] Includes `translationJobIds` in success response
- [ ] Item update succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging

### Database Verification
- [ ] item_translations records are deleted on item update
- [ ] translation_jobs records are created for each target language
- [ ] Job records have correct entity_type='item'
- [ ] Job records have correct entity_id matching item.id
- [ ] Job records have appropriate priority (100 for create, 50 for update)

## Error Handling Strategy

### Translation Failures Should NOT Block Item Operations
```typescript
// Pattern to follow:
try {
  // Translation queueing logic
} catch (translationError) {
  // Log error for debugging
  console.error('Translation queueing error:', translationError);
  // Continue with success response - item was saved
  // translationJobIds will be empty array
}
```

### Response Always Includes translationJobIds
```typescript
// Even on translation failure, include the field
const response = {
  success: true,
  data: {
    // ... item data ...
    translationJobIds: translationJobIds // May be empty array
  }
};
```

## Notes

### Backward Compatibility
- `sourceLanguage` is optional - existing clients continue to work
- `translationJobIds` is optional in response - existing clients can ignore it
- No breaking changes to existing API contracts

### Performance Considerations
- Translation queueing is fast (just inserts to job queue)
- Actual translation happens asynchronously via job processor
- API response time not significantly impacted

### Testing Approach
Per implementation plan Task 7.1:
- Unit tests for translation triggering logic
- Integration tests for item creation with translations
- Verify jobs are created in translation_jobs table
- Verify translations are deleted before update

## Dependencies
- Epic 1 Foundation: Translation tables, translation service (REQUIRED)
- Task 1.1: Content Translation Types (REQUIRED)
- Task 1.2: Content Translation Orchestrator (REQUIRED)
- Task 2.1: Source Language Detection (REQUIRED)
- Next.js 15.5.9, TypeScript 5.x (existing in project)
- Supabase client for database operations (existing in project)

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Non-blocking approach means main operations always succeed
  - Existing API contracts preserved with additive changes only
  - Well-established patterns from similar APIs
  - Translation can be retried via REQ-329 retry endpoint
  - Comprehensive error logging for debugging
  - No changes to authentication or authorization logic

## Acceptance Criteria Mapping (From PRD)

| PRD Criteria | Implementation |
|--------------|----------------|
| AC-1: New item triggers translation to 5 languages | POST handler calls queueContentTranslations |
| AC-1: Source language is recorded correctly | detectSourceLanguage utility + optional override |
| AC-2: Updated content re-triggers translation | PUT handler calls queueContentTranslations |
| AC-2: Old translations are replaced | PUT handler deletes existing item_translations |
| AC-2: Update doesn't block user action | try-catch wrapper, non-blocking approach |
