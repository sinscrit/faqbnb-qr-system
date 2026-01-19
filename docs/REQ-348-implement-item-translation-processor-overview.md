# REQ-348: Implement Item Translation Processor - Implementation Breakdown

**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-348
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.2

---

## Summary

Create a dedicated processor function `processItemTranslation` that handles translation jobs specifically for items. This processor fetches the source item by ID, translates its `name` and `description` fields to the target language, stores the results in the `item_translations` table, and updates the job status accordingly.

---

## Current State Analysis

### Existing Infrastructure

The codebase already has a robust job processing infrastructure from Epic 1:

1. **Job Processor Framework** (`src/lib/job-queue/job-processor.ts`):
   - `TranslationJobProcessor` class with polling-based job processing
   - Generic `processJob()` function that handles all entity types
   - `fetchEntityContent()` function that already fetches item content
   - `saveTranslation()` function that already saves item translations
   - Heartbeat mechanism for long-running jobs

2. **Translation Service** (`src/lib/translation-service/translation-service.ts`):
   - `translateText()` function for single translations
   - Provider fallback (Claude → OpenAI)
   - Rate limiting and retry logic built-in

3. **Database Tables**:
   - `items` table with `name`, `description`, `source_language` columns
   - `item_translations` table with `item_id`, `language`, `name`, `description`, `translation_status`, `translated_at` columns

### Gap Analysis

The current `processJob()` function in `job-processor.ts` already handles item translation via a generic switch statement. However, per the implementation plan (Task 3.2), we need to create a **dedicated** `processItemTranslation` function that:

1. Is explicitly separated for maintainability and testing
2. Can be called directly (not just through the generic processor)
3. Has clear error handling specific to items
4. Follows the explicit contract defined in the acceptance criteria

---

## Implementation Approach

### Option A: Extract and Enhance (Recommended)

Extract the item-specific logic from the generic `processJob()` into a dedicated `processItemTranslation()` function that can be:
- Called directly by the job processor
- Called independently for manual/retry operations
- Unit tested in isolation

### Option B: Create Separate Module

Create a new file `src/lib/job-queue/processors/item-processor.ts` for the item translation processor, keeping entity processors separate.

**Recommendation:** Option A - Extract and enhance within the existing `job-processor.ts` to maintain cohesion with the current architecture while meeting the explicit processor requirements.

---

## Technical Design

### Function Signature

```typescript
/**
 * Process a translation job for an item entity
 *
 * @param jobId - The translation job ID
 * @param itemId - The item entity ID to translate
 * @param sourceLanguage - Source language code (e.g., 'en')
 * @param targetLanguage - Target language code (e.g., 'fr')
 * @returns Processing result with success status and translated fields
 */
export async function processItemTranslation(
  jobId: string,
  itemId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<ItemTranslationResult>
```

### Return Type

```typescript
export interface ItemTranslationResult {
  success: boolean;
  jobId: string;
  itemId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: {
    name: string;
    description: string | null;
  };
  errorMessage?: string;
  processingTimeMs: number;
}
```

### Process Flow

```
processItemTranslation(jobId, itemId, sourceLang, targetLang)
    │
    ├── 1. Fetch item from `items` table
    │   └── SELECT id, name, description, source_language FROM items WHERE id = ?
    │
    ├── 2. Validate item exists
    │   └── If not found → markJobFailed(jobId, 'Item not found: {itemId}')
    │
    ├── 3. Translate `name` field
    │   └── translateText(name, sourceLang, targetLang, { contentType: 'item_name' })
    │
    ├── 4. Translate `description` field (if non-null)
    │   └── translateText(description, sourceLang, targetLang, { contentType: 'item_description' })
    │
    ├── 5. On translation failure → markJobFailed(jobId, errorMessage) → return
    │
    ├── 6. Store in item_translations table (UPSERT)
    │   └── UPSERT item_translations SET name=?, description=?, translation_status='completed'
    │
    ├── 7. On storage failure → markJobFailed(jobId, 'Failed to store translation')
    │
    └── 8. Mark job completed
        └── markJobCompleted(jobId)
```

---

## Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Purpose | Functions to Modify/Add |
|-----------|---------|------------------------|
| `src/lib/job-queue/job-processor.ts` | Main job processor module | Add `processItemTranslation()` function, export it, integrate with existing `processJob()` |
| `src/lib/job-queue/index.ts` | Module exports | Add export for `processItemTranslation` and `ItemTranslationResult` type |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/translation-jobs.ts` | Use `markJobCompleted()`, `markJobFailed()` functions |
| `src/lib/job-queue/translation-jobs.types.ts` | Use `SupportedLanguage`, `TranslationJob` types |
| `src/lib/translation-service/translation-service.ts` | Use `translateText()` function |
| `src/lib/supabase.ts` | Use `supabaseAdmin` for database operations |

### Database Tables Accessed

| Table | Operation | Purpose |
|-------|-----------|---------|
| `items` | SELECT | Fetch item name and description |
| `item_translations` | UPSERT | Store translated content |
| `translation_jobs` | UPDATE | Mark job completed/failed (via helper functions) |

---

## Detailed Implementation Tasks

### Task 1: Define ItemTranslationResult Type
**File:** `src/lib/job-queue/job-processor.ts`
**Lines:** Add after existing type definitions (~line 87)

Add the `ItemTranslationResult` interface for the processor's return type.

### Task 2: Implement processItemTranslation Function
**File:** `src/lib/job-queue/job-processor.ts`
**Lines:** Add after `saveTranslation()` function (~line 387)

Implement the dedicated processor with:
- Parameter validation
- Item fetching from database
- Translation of name and description fields
- Storage to item_translations table
- Job status updates

### Task 3: Update processJob to Use Dedicated Processor
**File:** `src/lib/job-queue/job-processor.ts`
**Lines:** Modify `processJob()` function (~line 446-542)

Update the `case 'item':` branch to call `processItemTranslation()` instead of inline logic.

### Task 4: Export New Function and Type
**File:** `src/lib/job-queue/index.ts`
**Lines:** Add to existing exports (~line 43-66)

Add exports for:
- `processItemTranslation` function
- `ItemTranslationResult` type

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| processItemTranslation accepts job ID, item ID, source language, target language | Function signature includes all parameters |
| Function fetches item from items table | Uses `supabaseAdmin.from('items').select().eq('id', itemId)` |
| If item not found, job marked failed with error message | Calls `markJobFailed(jobId, 'Item not found: {itemId}')` |
| Name and description extracted from item | Extracts `data.name` and `data.description` from query result |
| Translation service invoked for both fields | Calls `translateText()` for name, conditionally for description |
| If translation fails, job marked failed with error | Catches translation errors, calls `markJobFailed()` |
| Translated fields stored in item_translations | Uses UPSERT with `onConflict: 'item_id,language'` |
| Existing translation updated (not duplicated) | UPSERT handles this automatically |
| Job marked completed after successful storage | Calls `markJobCompleted(jobId)` at end |

---

## Testing Strategy

### Unit Tests to Add

**File:** `src/lib/job-queue/__tests__/item-processor.test.ts` (new)

1. **Happy Path:**
   - Item exists with name and description → both translated and stored
   - Item exists with name only (null description) → name translated, null description stored

2. **Error Handling:**
   - Item not found → job marked failed with "Item not found" error
   - Translation service failure → job marked failed with translation error
   - Database storage failure → job marked failed with storage error

3. **Edge Cases:**
   - Empty description string → treated as null
   - Same source and target language → skip translation, copy original

### Integration Tests

Verify end-to-end flow in existing `job-processing.integration.test.ts`:
- Create item → queue translation job → process job → verify item_translations record

---

## Dependencies

### Required (Must be implemented first)
- ✅ Translation service (`src/lib/translation-service/`) - Already implemented
- ✅ Job queue infrastructure (`src/lib/job-queue/`) - Already implemented
- ✅ `item_translations` table - Already created in Epic 1

### Dependent on this (Will use after implemented)
- Task 3.1: Enhance job processor for content-specific handling (calls this function)
- API routes that need to manually retry item translations

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API timeout | Low | Medium | Existing retry logic handles this |
| Database connection failure | Low | High | Existing error handling, job re-queued on failure |
| Race condition on UPSERT | Very Low | Low | Database UNIQUE constraint prevents duplicates |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Define types | 15 min |
| Implement processItemTranslation | 45 min |
| Update processJob integration | 15 min |
| Add exports | 5 min |
| Write unit tests | 30 min |
| **Total** | ~2 hours |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.2)
- **Request Definition:** `/docs/gen_requests_epic3.md` (REQ-348)
- **Existing Job Processor:** `/src/lib/job-queue/job-processor.ts`
- **Database Schema:** `/database/migrations/20260117_l10n_foundation.sql`

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
