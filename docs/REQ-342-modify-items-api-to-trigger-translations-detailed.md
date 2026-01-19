# REQ-342: Modify Items API to Trigger Translations - Detailed Task Breakdown

*Generated: 2026-01-19 15:00:00 UTC*
*Last Modified: 2026-01-19 15:00:00 UTC*

## Reference

- **Request ID**: REQ-342
- **Source Document**: docs/REQ-342-modify-items-api-to-trigger-translations-overview.md
- **Original Request**: REQ-266 in docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: Enhancement
- **Phase**: 2 - Modify Existing Content APIs
- **Task ID**: 2.2
- **Size**: M (Medium)

## Prerequisites

Before starting this task, ensure the following are completed:

| Prerequisite | Status | Description |
|--------------|--------|-------------|
| Task 1.1 | Required | Content Translation Module Structure (provides types) |
| Task 1.2 | Required | Content Translation Orchestrator (`queueContentTranslations`) |
| Task 2.1 | Required | Source Language Detection (`detectSourceLanguage`) |
| Epic 1 | Required | Translation tables, translation service, job queue |

---

## Task Breakdown

### Task 1: Update TypeScript Types in `/src/types/index.ts`

**Objective**: Add `sourceLanguage` field to request types and `translationJobIds` to response types.

**File**: `/src/types/index.ts`

**Estimated Story Points**: 1

#### Subtask 1.1: Add `sourceLanguage` to `CreateItemRequest`

**Location**: Lines 310-342 (around `CreateItemRequest` interface)

**Current Code**:
```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: {...}[];
  articles?: {...}[];
}
```

**Changes Required**:
```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: {...}[];
  articles?: {...}[];
  /**
   * Optional source language override for translation.
   * If not provided, detected from user/account preferences.
   * @example 'en', 'fr', 'es', 'de', 'nl', 'it'
   */
  sourceLanguage?: string;
}
```

**Validation Criteria**:
- [ ] `sourceLanguage` field is optional (marked with `?`)
- [ ] Field has JSDoc comment explaining its purpose
- [ ] Field accepts string type matching SupportedLanguage values

---

#### Subtask 1.2: Verify `UpdateItemRequest` Inherits `sourceLanguage`

**Location**: Lines 344-376 (`UpdateItemRequest` interface)

**Current Code**:
```typescript
export interface UpdateItemRequest extends CreateItemRequest {
  id: string;
  qrCodeUrl?: string;
  links: {...}[];
  articles?: {...}[];
}
```

**Analysis**: `UpdateItemRequest` extends `CreateItemRequest`, so it will automatically inherit the `sourceLanguage` field. No changes needed.

**Validation Criteria**:
- [ ] Verify `UpdateItemRequest extends CreateItemRequest` exists
- [ ] Confirm no duplicate `sourceLanguage` definition needed

---

#### Subtask 1.3: Add `translationJobIds` to `ItemResponse`

**Location**: Lines 125-175 (around `ItemResponse` interface)

**Current Code** (partial):
```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    // ... other fields
  };
  error?: string;
  accountContext?: {...};
}
```

**Changes Required**:
Add `translationJobIds` to the `data` object:
```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    // ... existing fields ...
    /**
     * IDs of translation jobs queued for this item.
     * Empty array if translation queueing failed or was skipped.
     */
    translationJobIds?: string[];
  };
  error?: string;
  accountContext?: {...};
}
```

**Validation Criteria**:
- [ ] `translationJobIds` field is optional (marked with `?`)
- [ ] Field is typed as `string[]`
- [ ] Field has JSDoc comment
- [ ] TypeScript compilation succeeds

---

### Task 2: Modify POST Handler in `/src/app/api/admin/items/route.ts`

**Objective**: Trigger translations after successful item creation.

**File**: `/src/app/api/admin/items/route.ts`

**Estimated Story Points**: 3

#### Subtask 2.1: Add Required Imports

**Location**: Top of file (lines 1-10)

**Current Imports**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemsListResponse, CreateItemRequest, ItemResponse } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
```

**Add These Imports**:
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

**Validation Criteria**:
- [ ] Import statement added after existing imports
- [ ] No TypeScript import errors
- [ ] Imports resolve correctly (after Tasks 1.1-2.1 are complete)

---

#### Subtask 2.2: Extract `sourceLanguage` from Request Body

**Location**: Inside POST handler, after body parsing

**Find the section where request body is parsed** (look for `const body = await request.json()` or similar).

**Add After Body Parsing**:
```typescript
// Extract optional source language from request
const { sourceLanguage: requestSourceLanguage, ...itemData } = body;
```

**Alternative** (if body is used directly):
```typescript
const sourceLanguage = body.sourceLanguage;
```

**Validation Criteria**:
- [ ] `sourceLanguage` extracted from request body
- [ ] Extraction doesn't break existing body processing

---

#### Subtask 2.3: Add Translation Queueing After Item Creation

**Location**: After successful item insert, before response return

**Find**: The section where item is successfully created and the response is prepared.

**Add Translation Logic** (insert BEFORE the response return):
```typescript
// Queue translations for the new item
let translationJobIds: string[] = [];
try {
  // Detect source language: override > user preference > account preference > 'en'
  const detectedSourceLanguage = requestSourceLanguage ||
    detectSourceLanguage(user, accountContext, undefined);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'item',
      entityId: newItem.id, // Use the actual created item's ID
      sourceLanguage: detectedSourceLanguage,
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
    trigger: 'create'
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for item ${newItem.id}`);
  } else {
    console.error('Translation queueing failed:', translationResult.error);
  }
} catch (translationError) {
  // Log error but don't fail the item creation
  console.error('Error queueing translations for item:', translationError);
  // translationJobIds remains empty array
}
```

**Validation Criteria**:
- [ ] Translation logic is wrapped in try-catch
- [ ] Translation failure does NOT prevent item creation success
- [ ] Logs are written for debugging
- [ ] `translationJobIds` is always defined (empty array on failure)

---

#### Subtask 2.4: Include `translationJobIds` in Response

**Location**: Success response return statement

**Find**: The return statement for successful item creation (looks like `return NextResponse.json({ success: true, data: {...} })`).

**Modify Response**:
```typescript
return NextResponse.json({
  success: true,
  data: {
    // ... existing item data ...
    translationJobIds, // Add this field
  },
  accountContext: {
    // ... existing account context ...
  }
});
```

**Validation Criteria**:
- [ ] `translationJobIds` included in response `data` object
- [ ] Response structure matches `ItemResponse` type
- [ ] Existing response data preserved

---

### Task 3: Modify PUT Handler in `/src/app/api/admin/items/[publicId]/route.ts`

**Objective**: Delete existing translations and queue new ones after item update.

**File**: `/src/app/api/admin/items/[publicId]/route.ts`

**Estimated Story Points**: 4

#### Subtask 3.1: Add Required Imports

**Location**: Top of file (lines 1-10)

**Current Imports**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateItemRequest, ItemResponse } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
```

**Add These Imports**:
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

**Validation Criteria**:
- [ ] Import statement added after existing imports
- [ ] No TypeScript import errors
- [ ] Imports resolve correctly

---

#### Subtask 3.2: Extract `sourceLanguage` from Request Body

**Location**: Inside PUT handler, after body parsing

**Add After Body Parsing**:
```typescript
const sourceLanguage = body.sourceLanguage;
```

**Validation Criteria**:
- [ ] `sourceLanguage` extracted from request body

---

#### Subtask 3.3: Delete Existing Translations Before Update

**Location**: Inside PUT handler, BEFORE the item update operation

**Find**: The section where the item update query is built/executed.

**Add BEFORE Item Update**:
```typescript
// Delete existing translations for this item before update
// This ensures stale translations are removed before new ones are queued
try {
  const { error: deleteTranslationsError } = await supabase
    .from('item_translations')
    .delete()
    .eq('item_id', existingItem.id); // Use the existing item's UUID

  if (deleteTranslationsError) {
    console.error('Failed to delete existing item translations:', deleteTranslationsError);
    // Continue with update - don't fail the main operation
  } else {
    console.log(`Deleted existing translations for item ${existingItem.id}`);
  }
} catch (deleteError) {
  console.error('Error deleting existing translations:', deleteError);
  // Continue with update - translation cleanup failure shouldn't block item update
}
```

**Important Notes**:
- `existingItem.id` should be the UUID of the item being updated
- The delete operation uses the `item_translations` table (from Epic 1)
- Failure to delete should NOT prevent item update

**Validation Criteria**:
- [ ] Delete operation targets `item_translations` table
- [ ] Delete uses correct item identifier (UUID, not publicId)
- [ ] Delete failure is logged but doesn't fail update
- [ ] Delete happens BEFORE item update

---

#### Subtask 3.4: Add Translation Queueing After Item Update

**Location**: After successful item update, before response return

**Find**: The section where item is successfully updated and response is prepared.

**Add Translation Logic**:
```typescript
// Queue translations for the updated item
let translationJobIds: string[] = [];
try {
  // Detect source language: override > user preference > account preference > 'en'
  const detectedSourceLanguage = sourceLanguage ||
    detectSourceLanguage(user, accountContext, undefined);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'item',
      entityId: updatedItem.id, // Use the updated item's ID
      sourceLanguage: detectedSourceLanguage,
      fields: [
        {
          fieldName: 'name',
          value: updatedItem.name,
          context: { contentType: 'item_name', domain: 'property_rental' },
          maxLength: 255
        },
        {
          fieldName: 'description',
          value: updatedItem.description || '',
          context: { contentType: 'item_description', domain: 'property_rental' }
        }
      ]
    },
    trigger: 'update' // Note: 'update' trigger for PUT operations
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for updated item ${updatedItem.id}`);
  } else {
    console.error('Translation queueing failed for item update:', translationResult.error);
  }
} catch (translationError) {
  console.error('Error queueing translations for item update:', translationError);
  // translationJobIds remains empty array
}
```

**Validation Criteria**:
- [ ] Translation logic wrapped in try-catch
- [ ] Trigger type is `'update'` (not `'create'`)
- [ ] Translation failure does NOT prevent update success
- [ ] Logs distinguish update operations

---

#### Subtask 3.5: Include `translationJobIds` in Response

**Location**: Success response return statement in PUT handler

**Modify Response**:
```typescript
return NextResponse.json({
  success: true,
  data: {
    // ... existing updated item data ...
    translationJobIds, // Add this field
  },
  accountContext: {
    // ... existing account context ...
  }
});
```

**Validation Criteria**:
- [ ] `translationJobIds` included in response
- [ ] Response structure matches `ItemResponse` type

---

### Task 4: Verification and Testing

**Objective**: Ensure all changes work correctly and don't break existing functionality.

**Estimated Story Points**: 2

#### Subtask 4.1: TypeScript Compilation Check

**Command**:
```bash
npm run build
```

**Validation Criteria**:
- [ ] No TypeScript compilation errors
- [ ] No type mismatches in modified files
- [ ] Build completes successfully

---

#### Subtask 4.2: Unit Test - POST Handler Translation Triggering

**Test File**: Create or extend test file for items API

**Test Cases**:
```typescript
describe('POST /api/admin/items - Translation Triggering', () => {
  it('should queue translation jobs after item creation', async () => {
    // Create item with sourceLanguage
    // Verify translationJobIds in response
  });

  it('should detect source language when not provided', async () => {
    // Create item without sourceLanguage
    // Verify translation uses detected language
  });

  it('should succeed even if translation queueing fails', async () => {
    // Mock queueContentTranslations to throw
    // Verify item creation succeeds
    // Verify translationJobIds is empty array
  });
});
```

**Validation Criteria**:
- [ ] Item creation succeeds with translations queued
- [ ] Item creation succeeds without translations (graceful degradation)
- [ ] Response includes `translationJobIds`

---

#### Subtask 4.3: Unit Test - PUT Handler Translation Triggering

**Test Cases**:
```typescript
describe('PUT /api/admin/items/[publicId] - Translation Triggering', () => {
  it('should delete existing translations before update', async () => {
    // Update item
    // Verify old translations deleted from item_translations
  });

  it('should queue new translation jobs after update', async () => {
    // Update item
    // Verify translationJobIds in response
  });

  it('should succeed even if translation deletion fails', async () => {
    // Mock delete to fail
    // Verify item update succeeds
  });

  it('should succeed even if translation queueing fails', async () => {
    // Mock queueContentTranslations to throw
    // Verify item update succeeds
  });
});
```

**Validation Criteria**:
- [ ] Item update deletes old translations
- [ ] Item update queues new translations
- [ ] Item update succeeds even with translation failures

---

#### Subtask 4.4: Database Verification

**SQL Queries to Verify**:
```sql
-- After item creation, verify translation_jobs created
SELECT * FROM translation_jobs
WHERE entity_type = 'item'
AND entity_id = '<new_item_uuid>'
ORDER BY created_at DESC;

-- Should see 5 jobs (one for each target language)
-- Each should have status = 'queued', priority = 100

-- After item update, verify old translations deleted
SELECT * FROM item_translations
WHERE item_id = '<updated_item_uuid>';
-- Should be empty immediately after update

-- After item update, verify new jobs queued
SELECT * FROM translation_jobs
WHERE entity_type = 'item'
AND entity_id = '<updated_item_uuid>'
AND status = 'queued';
-- Should see 5 new jobs with priority = 50
```

**Validation Criteria**:
- [ ] 5 translation jobs created per item (one per target language)
- [ ] Jobs have correct `entity_type='item'`
- [ ] Jobs have correct priority (100 for create, 50 for update)
- [ ] Old translations deleted on update

---

## Success Validation Checklist

### Type Updates
- [ ] `CreateItemRequest` includes optional `sourceLanguage?: string` field
- [ ] `UpdateItemRequest` inherits `sourceLanguage` from `CreateItemRequest`
- [ ] `ItemResponse.data` includes optional `translationJobIds?: string[]` field
- [ ] TypeScript compilation succeeds without errors

### POST Handler (`/api/admin/items`)
- [ ] Accepts `sourceLanguage` in request body
- [ ] Creates item successfully before queueing translations
- [ ] Calls `queueContentTranslations` after item creation
- [ ] Uses `detectSourceLanguage` when `sourceLanguage` not provided
- [ ] Includes `translationJobIds` in success response
- [ ] Item creation succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging
- [ ] Does not expose internal errors to client

### PUT Handler (`/api/admin/items/[publicId]`)
- [ ] Accepts `sourceLanguage` in request body
- [ ] Deletes existing `item_translations` before update
- [ ] Translation deletion failure doesn't block update
- [ ] Updates item successfully before queueing translations
- [ ] Calls `queueContentTranslations` after item update
- [ ] Uses `detectSourceLanguage` when `sourceLanguage` not provided
- [ ] Includes `translationJobIds` in success response
- [ ] Item update succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging

### Database Verification
- [ ] `item_translations` records are deleted on item update
- [ ] `translation_jobs` records are created for each target language
- [ ] Job records have correct `entity_type='item'`
- [ ] Job records have correct `entity_id` matching `item.id`
- [ ] Job records have appropriate priority (100 for create, 50 for update)

---

## Error Handling Patterns

### Translation Failures Should NOT Block Item Operations

**Pattern**:
```typescript
let translationJobIds: string[] = [];
try {
  // Translation queueing logic
  const result = await queueContentTranslations({...});
  if (result.success) {
    translationJobIds = result.jobIds;
  } else {
    console.error('Translation queueing failed:', result.error);
  }
} catch (translationError) {
  console.error('Translation queueing error:', translationError);
  // Continue - item operation succeeded
}

// Response always includes translationJobIds (may be empty)
return NextResponse.json({
  success: true,
  data: { ...itemData, translationJobIds }
});
```

### Translation Deletion Failures Should NOT Block Updates

**Pattern**:
```typescript
try {
  const { error } = await supabase
    .from('item_translations')
    .delete()
    .eq('item_id', item.id);

  if (error) {
    console.error('Translation deletion failed:', error);
    // Continue with update
  }
} catch (deleteError) {
  console.error('Translation deletion error:', deleteError);
  // Continue with update
}

// Proceed with item update regardless of deletion result
```

---

## Dependencies

### Required Imports (both route files)

```typescript
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

### Database Tables Used

| Table | Operation | Purpose |
|-------|-----------|---------|
| `items` | INSERT/UPDATE | Core item CRUD (existing) |
| `item_translations` | DELETE | Remove stale translations on update |
| `translation_jobs` | INSERT | Queue translation work (via orchestrator) |

### Functions From Dependencies

| Function | Source | Purpose |
|----------|--------|---------|
| `queueContentTranslations` | `@/lib/content-translation` | Queue translations for all target languages |
| `detectSourceLanguage` | `@/lib/content-translation` | Determine source language from user/account |

---

## Rollback Plan

If issues are discovered:

1. **Revert Type Changes**: Remove `sourceLanguage` from request types and `translationJobIds` from response types
2. **Revert POST Handler**: Remove translation-related imports and logic
3. **Revert PUT Handler**: Remove translation deletion and queueing logic
4. **Verify**: Ensure existing item CRUD functionality works as before

The non-blocking design ensures that even partial failures don't impact core functionality.

---

## Notes

### Backward Compatibility
- `sourceLanguage` is optional - existing clients continue to work without changes
- `translationJobIds` is optional in response - existing clients can ignore it
- No breaking changes to existing API contracts

### Performance Considerations
- Translation queueing is fast (database inserts only)
- Actual translation happens asynchronously via job processor
- API response time not significantly impacted

### Related Tasks
- **Task 2.5** (Tag Translation on Item Save): Will extend these changes to handle tag translations
- **Task 3.2** (Item Translation Processor): Will process the jobs queued by this task

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation |
|--------------|----------------|
| AC-1: New item triggers translation to 5 languages | POST handler calls `queueContentTranslations` |
| AC-1: Source language is recorded correctly | `detectSourceLanguage` utility + optional override |
| AC-2: Updated content re-triggers translation | PUT handler calls `queueContentTranslations` |
| AC-2: Old translations are replaced | PUT handler deletes existing `item_translations` |
| AC-2: Update doesn't block user action | try-catch wrapper, non-blocking approach |

---

## File Summary

### Files to Modify

| File | Changes |
|------|---------|
| `/src/types/index.ts` | Add `sourceLanguage` to `CreateItemRequest`, `translationJobIds` to `ItemResponse` |
| `/src/app/api/admin/items/route.ts` | Add imports, extract sourceLanguage, queue translations after create |
| `/src/app/api/admin/items/[publicId]/route.ts` | Add imports, delete old translations, queue new translations after update |

### Files to Create

None - this task modifies existing files only.

### Files Referenced (Read-Only)

| File | Purpose |
|------|---------|
| `/src/lib/content-translation/index.ts` | Import orchestrator and utilities |
| `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` function |
| `/src/lib/content-translation/source-language.ts` | `detectSourceLanguage` function |
