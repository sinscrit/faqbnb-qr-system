# Implementation Overview: REQ-E03-014 - Implement Item Translation Processor

**Generated:** 2026-01-20 00:15:00 UTC
**Last Modified:** 2026-01-20 00:15:00 UTC
**Request ID:** REQ-E03-014
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.2
**Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** REQ-E03-013 (Enhance Job Processor for Content-Specific Handling)

---

## Summary

Implement a specialized processor function that retrieves item records from the database, translates the `name` and `description` fields using the translation service, persists the translated content to the `item_translations` table, and updates the translation job status to reflect completion or failure.

---

## Current State Analysis

### Existing Infrastructure

The codebase already has a comprehensive translation infrastructure established in Epic 1:

1. **Translation Service** (`/src/lib/translation-service/`)
   - `translateText(text, sourceLanguage, targetLanguage, context?)` - Main translation function
   - Claude provider with vacation rental domain context
   - Rate limiting and retry logic built-in
   - Result pattern: `{ success, translatedText?, error? }`

2. **Job Queue** (`/src/lib/job-queue/`)
   - `fetchAndLockNextJob(options)` - Fetches and locks the next job
   - `markJobCompleted(jobId)` - Marks job as completed
   - `markJobFailed(jobId, errorMessage)` - Marks job as failed with error details
   - Database-backed with concurrent worker support

3. **Job Processor** (`/src/lib/job-queue/job-processor.ts`)
   - Generic processor that calls entity-specific handlers
   - `fetchEntityContent()` function already exists for fetching entity data
   - `saveTranslation()` function already exists for storing translations
   - **Current limitation**: No dedicated `processItemTranslation()` function that orchestrates the full workflow

4. **Database Schema**
   - `items` table: Contains `name`, `description`, `source_language` fields
   - `item_translations` table: Stores translated content with `item_id`, `language`, `name`, `description`, `translation_status`, `translated_at`
   - Unique constraint on `(item_id, language)` for upsert operations

### Gap Analysis

The existing `job-processor.ts` has generic infrastructure but lacks a dedicated, fully-featured item translation processor that:
- Validates item existence before processing
- Handles field-specific translation contexts
- Provides detailed error categorization (transient vs permanent)
- Integrates properly with the job lifecycle

---

## Technical Approach

### Workflow Overview

```
Job Dequeued (entityType: 'item')
    │
    ├── 1. Validate Job Metadata
    │       - Verify item_id format (UUID)
    │       - Verify target_language is supported
    │
    ├── 2. Fetch Item Record
    │       - Query items table by ID
    │       - Handle missing/deleted items (permanent failure)
    │       - Extract name, description, source_language
    │
    ├── 3. Prepare Translation Request
    │       - Build translation payloads for name and description
    │       - Include domain context for vacation rental items
    │       - Set appropriate max lengths
    │
    ├── 4. Execute Translation
    │       - Call translateText() for name field
    │       - Call translateText() for description field
    │       - Handle rate limits (transient, retry)
    │       - Handle API errors (categorize by type)
    │
    ├── 5. Store Translated Content
    │       - UPSERT into item_translations table
    │       - Set translation_status = 'completed'
    │       - Record translated_at timestamp
    │
    └── 6. Update Job Status
            - On success: markJobCompleted()
            - On transient failure: increment attempts, re-queue
            - On permanent failure: markJobFailed() with error details
```

### Integration Points

| Component | Location | Integration |
|-----------|----------|-------------|
| Translation Service | `/src/lib/translation-service/` | Use `translateText()` function |
| Job Queue | `/src/lib/job-queue/` | Use `markJobCompleted()`, `markJobFailed()` |
| Supabase Client | `/src/lib/supabase.ts` | Database queries for items and item_translations |
| Types | `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `TranslationContext` |

### Translation Context Configuration

For optimal translation quality, the item processor uses domain-aware context:

```typescript
// Name field context
const nameContext: TranslationContext = {
  contentType: 'item_name',
  domainContext: 'property_rental_appliances',
  maxLength: 255,
  tone: 'informative'
};

// Description field context
const descriptionContext: TranslationContext = {
  contentType: 'item_description',
  domainContext: 'property_rental_appliances',
  tone: 'helpful'
};
```

### Error Handling Strategy

| Error Type | Classification | Action |
|------------|----------------|--------|
| Item not found (deleted) | Permanent | Mark job failed, do not retry |
| Invalid UUID format | Permanent | Mark job failed, do not retry |
| Unsupported language | Permanent | Mark job failed, do not retry |
| Rate limit exceeded | Transient | Increment attempts, re-queue with backoff |
| Network timeout | Transient | Increment attempts, re-queue with backoff |
| Translation service unavailable | Transient | Increment attempts, re-queue with backoff |
| Database connection error | Transient | Increment attempts, re-queue with backoff |
| Max retries exceeded | Permanent | Mark job failed with final error |

---

## Implementation Details

### New Function Signature

```typescript
/**
 * Processes a translation job for an item entity.
 * Fetches the item, translates name and description fields,
 * stores results, and updates job status.
 *
 * @param job - The translation job to process
 * @returns Promise resolving to processing result
 */
export async function processItemTranslation(
  job: TranslationJob
): Promise<JobProcessingResult>
```

### Return Type Structure

```typescript
interface JobProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'item';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: {
    name: string;
    description?: string;
  };
  errorMessage?: string;
  errorType?: 'permanent' | 'transient';
  processingTimeMs: number;
}
```

### Database Queries

**Fetch Item:**
```sql
SELECT id, name, description, source_language
FROM items
WHERE id = $1;
```

**Store Translation (UPSERT):**
```sql
INSERT INTO item_translations (
  id, item_id, language, name, description,
  translation_status, translated_at, created_at, updated_at
)
VALUES (
  gen_random_uuid(), $1, $2, $3, $4,
  'completed', NOW(), NOW(), NOW()
)
ON CONFLICT (item_id, language)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  translation_status = 'completed',
  translated_at = NOW(),
  updated_at = NOW();
```

---

## Acceptance Criteria

- [ ] Function accepts a translation job object containing item ID, target language, and job metadata
- [ ] Function queries the database to retrieve the item record by ID
- [ ] Function handles missing or deleted items with appropriate error status (permanent failure)
- [ ] Function extracts name and description fields from the item record
- [ ] Function prepares translation request with both fields using domain-specific context
- [ ] Function calls the translation service with source language, target language, and field data
- [ ] Function handles translation service errors with retry logic for transient failures
- [ ] Function handles translation service timeouts with appropriate error status
- [ ] Function receives translated name and description from the translation service response
- [ ] Function stores translated content using UPSERT pattern into item_translations table
- [ ] Function sets translation_status to 'completed' and records translated_at timestamp
- [ ] Function marks job as completed in the job queue upon successful storage
- [ ] Function marks job as failed with error details when any stage fails
- [ ] Function increments retry counter for transient errors (network, timeout, rate limit)
- [ ] Function does not retry for permanent errors (invalid item ID, unsupported language)
- [ ] Function respects maximum retry limits defined in job configuration (default: 3)
- [ ] Function logs all significant events (start, completion, errors) for troubleshooting
- [ ] TypeScript types are properly defined for job objects, responses, and error states
- [ ] Function is exported from the content translation module
- [ ] Function integrates cleanly with the job processor routing logic from REQ-E03-013

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/processors/item-processor.ts` | Main item translation processor function |
| `/src/lib/content-translation/processors/index.ts` | Barrel export for all processors |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/lib/job-queue/job-processor.ts` | Add import and routing to `processItemTranslation()` in the entity type switch |
| `/src/lib/content-translation/index.ts` | Export the new processor functions |

### Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `processItemTranslation(job)` | `item-processor.ts` | Main processor function |
| `fetchItemForTranslation(itemId)` | `item-processor.ts` | Helper to fetch item with validation |
| `translateItemFields(item, targetLang)` | `item-processor.ts` | Helper to translate name and description |
| `storeItemTranslation(itemId, lang, data)` | `item-processor.ts` | Helper to UPSERT translation record |
| `categorizeError(error)` | `item-processor.ts` | Helper to classify errors as transient/permanent |

### Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `processTranslationJob(job)` | `job-processor.ts` | Add case for 'item' entity type routing to new processor |

### Database Tables Used

| Table | Operation | Purpose |
|-------|-----------|---------|
| `items` | SELECT | Fetch item record for translation |
| `item_translations` | UPSERT | Store translated content |
| `translation_jobs` | UPDATE | Update job status (via job queue functions) |

---

## Dependencies

### Required Prerequisites (Must Be Complete)

| Dependency | Status | Description |
|------------|--------|-------------|
| REQ-E03-001 | Required | Content translation module structure |
| REQ-E03-005 | Required | Translation storage utilities (may reuse or create new) |
| REQ-E03-013 | Required | Job processor enhancement with entity routing |
| Epic 1 Translation Service | Required | Core `translateText()` function |
| Epic 1 Job Queue | Required | Job management functions |

### Downstream Dependencies (Will Use This)

| Dependency | Description |
|------------|-------------|
| REQ-E03-008 | Items API triggers translation jobs that this processor handles |
| REQ-E03-015-016 | Article and link processors follow same pattern |

---

## Testing Strategy

### Unit Tests

```typescript
describe('processItemTranslation', () => {
  it('should successfully translate item name and description');
  it('should handle items with null description');
  it('should mark job as failed when item does not exist');
  it('should retry on rate limit errors');
  it('should not retry on permanent errors');
  it('should respect max retry limit');
  it('should use correct translation context for each field');
  it('should store translation with completed status');
  it('should update job completion timestamp');
});
```

### Integration Tests

```typescript
describe('Item Translation Integration', () => {
  it('should process queued item translation job end-to-end');
  it('should update item_translations table with correct data');
  it('should handle concurrent processing of same item');
  it('should recover from transient database errors');
});
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API rate limits | Medium | Low | Built-in retry with backoff |
| Item deleted during processing | Low | Low | Check existence, mark job failed gracefully |
| Database deadlock on upsert | Low | Medium | Use proper conflict resolution, retry |
| Memory issues with large descriptions | Low | Low | Stream large content if needed |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Implement `processItemTranslation()` function | 2-3 hours |
| Add helper functions | 1-2 hours |
| Integrate with job processor routing | 30 minutes |
| Write unit tests | 1-2 hours |
| Write integration tests | 1-2 hours |
| Documentation | 30 minutes |
| **Total** | **6-10 hours** |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.2)
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-014)
- **Translation Service Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Job Queue Types:** `/src/lib/job-queue/translation-jobs.types.ts`
- **Job Processor:** `/src/lib/job-queue/job-processor.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
