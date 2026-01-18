# REQ-272: Implement Item Translation Processor - Overview

**Document Created:** 2026-01-18 04:15:00 UTC
**Last Modified:** 2026-01-18 04:15:00 UTC
**Request Reference:** `/docs/gen_requests_epic3.md` - Request #272
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.2
**Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** Epic 1 Foundation (Plan-110), REQ-263 (Translation Storage Utilities), REQ-271 (Job Processor Enhancement)

---

## Summary

Implement a specialized processor function that handles translation jobs for items. The processor fetches item data by ID, translates the `name` and `description` fields using the translation service, stores the results in the `item_translations` table with UPSERT logic, and updates the job status to track progress.

---

## Current Behavior

No dedicated processor exists to handle translation jobs specifically for items. Translation jobs may be queued but cannot be executed because there is no implementation that:
- Retrieves item data from the database
- Sends the appropriate fields to the translation service
- Persists translated results back to the database
- Updates job status with proper error handling

---

## Expected Behavior

When a translation job for an item is dequeued by the job processor:

1. **Fetch Source Content**: Retrieve the item record from the database using the item ID from job metadata
2. **Extract Fields**: Extract the `name` and `description` fields that require translation
3. **Call Translation Service**: Translate both fields from source language to target language using the Epic 1 translation service infrastructure
4. **Store Translations**: Persist translated content to `item_translations` table using UPSERT pattern (create if new, update if exists)
5. **Update Job Status**: Mark job as `completed` on success, or `failed` with descriptive error message on failure

---

## Technical Context

### Dependencies from Epic 1 (Plan-110)

This task requires the following Epic 1 infrastructure to be implemented:

| Component | Location | Required For |
|-----------|----------|--------------|
| Translation service | `/src/lib/translation-service/` | `translateText()` function |
| Job queue | `/src/lib/job-queue/` | Job processing infrastructure |
| Translation tables | Database | `translation_jobs`, `item_translations` |

### Dependencies from Epic 3 Phase 1

| Component | Task Reference | Required For |
|-----------|----------------|--------------|
| Translation storage utilities | REQ-263 | `storeItemTranslation()` function |
| Job processor enhancement | REQ-271 | `processTranslationJob()` routing |

### Existing Patterns to Follow

| Pattern | Source Location | Usage |
|---------|-----------------|-------|
| Service interface pattern | `/src/lib/email-service.ts` | Interface + Mock + Production classes |
| Database access | `/src/app/api/admin/items/route.ts` | Supabase query patterns |
| Type definitions | `/src/types/index.ts` | TypeScript interface structure |
| Error handling | Email service | Graceful error handling with result objects |

---

## Architecture

### Component Location

```
/src/lib/content-translation/
├── processors/
│   └── item-processor.ts          # NEW: This implementation
└── storage/
    └── translation-storage.ts     # REQ-263: Used for storeItemTranslation()

/src/lib/job-queue/
└── translation-jobs.ts            # Modified in REQ-271 to call item-processor
```

### Data Flow

```
Translation Job (entity_type: 'item')
    │
    ▼
processTranslationJob() [REQ-271]
    │
    ├── Examine entityType === 'item'
    │
    ▼
processItemTranslation() [This REQ-272]
    │
    ├── 1. Query database for item by ID
    │       SELECT id, name, description FROM items WHERE id = ?
    │
    ├── 2. Extract translatable fields
    │       - name (required, VARCHAR 255)
    │       - description (optional, TEXT)
    │
    ├── 3. Call translation service
    │       translateText(name, sourceLanguage, targetLanguage, context)
    │       translateText(description, sourceLanguage, targetLanguage, context)
    │
    ├── 4. Store translations
    │       storeItemTranslation(itemId, targetLanguage, { name, description })
    │       Uses UPSERT: INSERT ... ON CONFLICT UPDATE
    │
    └── 5. Update job status
            - Success: status = 'completed', completed_at = NOW()
            - Failure: status = 'failed', error_message = <details>
```

### Translation Context

For optimal translation quality, the processor should provide context:

```typescript
const ITEM_TRANSLATION_CONTEXTS = {
  name: {
    contentType: 'item_name',
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate the name of a household item or appliance in a vacation rental context. Keep it concise and natural.'
  },
  description: {
    contentType: 'item_description',
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate a description of a household item for vacation rental guests. Maintain helpful, friendly tone.'
  }
};
```

---

## Integration Contract

### Function Signature

```typescript
// /src/lib/content-translation/processors/item-processor.ts

import { TranslationJob, JobStatus } from '@/lib/job-queue/translation-jobs.types';
import { SupportedLanguage } from '@/lib/translation-service';

export interface ItemTranslationJobData {
  itemId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  jobId: string;
}

export interface ItemTranslationResult {
  success: boolean;
  itemId: string;
  targetLanguage: SupportedLanguage;
  translatedName?: string;
  translatedDescription?: string;
  error?: string;
  jobStatus: JobStatus;
}

/**
 * Process a single item translation job
 *
 * @param job - Translation job metadata from the job queue
 * @returns Translation result with status information
 */
export async function processItemTranslation(
  job: ItemTranslationJobData
): Promise<ItemTranslationResult>;
```

### Usage from Job Processor

```typescript
// In /src/lib/job-queue/translation-jobs.ts (REQ-271)

import { processItemTranslation } from '@/lib/content-translation/processors/item-processor';

async function processTranslationJob(job: TranslationJob): Promise<void> {
  switch (job.entityType) {
    case 'item':
      const result = await processItemTranslation({
        itemId: job.entityId,
        sourceLanguage: job.sourceLanguage,
        targetLanguage: job.targetLanguage,
        jobId: job.id
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      break;
    // ... other entity types
  }
}
```

---

## Implementation Tasks

### Task 1: Create Item Processor File Structure

**File:** `/src/lib/content-translation/processors/item-processor.ts`

Create the processor module with proper TypeScript types and exports.

```typescript
// Type definitions for item translation processing
export interface ItemTranslationJobData {
  itemId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  jobId: string;
}

export interface ItemTranslationResult {
  success: boolean;
  itemId: string;
  targetLanguage: SupportedLanguage;
  translatedName?: string;
  translatedDescription?: string;
  error?: string;
  jobStatus: 'completed' | 'failed';
}
```

### Task 2: Implement Item Data Fetching

Fetch the source item record from the database.

```typescript
async function fetchItemById(itemId: string): Promise<{
  id: string;
  name: string;
  description: string | null;
} | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('items')
    .select('id, name, description')
    .eq('id', itemId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
```

### Task 3: Implement Field Translation

Call the translation service for each translatable field.

```typescript
async function translateItemFields(
  name: string,
  description: string | null,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<{
  translatedName: string;
  translatedDescription: string | null;
}> {
  const translatedName = await translateText({
    text: name,
    sourceLanguage,
    targetLanguage,
    context: ITEM_TRANSLATION_CONTEXTS.name
  });

  let translatedDescription: string | null = null;
  if (description) {
    translatedDescription = await translateText({
      text: description,
      sourceLanguage,
      targetLanguage,
      context: ITEM_TRANSLATION_CONTEXTS.description
    });
  }

  return { translatedName, translatedDescription };
}
```

### Task 4: Implement Translation Storage Integration

Call the storage utility (from REQ-263) to persist translations.

```typescript
// Uses storeItemTranslation from REQ-263
await storeItemTranslation(itemId, targetLanguage, {
  translated_name: translatedName,
  translated_description: translatedDescription,
  translation_status: 'completed',
  translated_at: new Date().toISOString()
});
```

### Task 5: Implement Job Status Updates

Update the translation job status in the queue.

```typescript
async function updateJobStatus(
  jobId: string,
  status: 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  const supabase = createSupabaseClient();

  const updateData = {
    status,
    ...(status === 'completed'
      ? { completed_at: new Date().toISOString() }
      : { error_message: errorMessage })
  };

  await supabase
    .from('translation_jobs')
    .update(updateData)
    .eq('id', jobId);
}
```

### Task 6: Implement Main Processor Function

Orchestrate the complete processing workflow with error handling.

```typescript
export async function processItemTranslation(
  job: ItemTranslationJobData
): Promise<ItemTranslationResult> {
  const { itemId, sourceLanguage, targetLanguage, jobId } = job;

  try {
    // Step 1: Fetch item
    const item = await fetchItemById(itemId);
    if (!item) {
      await updateJobStatus(jobId, 'failed', `Item not found: ${itemId}`);
      return {
        success: false,
        itemId,
        targetLanguage,
        error: `Item not found: ${itemId}`,
        jobStatus: 'failed'
      };
    }

    // Step 2: Translate fields
    const { translatedName, translatedDescription } = await translateItemFields(
      item.name,
      item.description,
      sourceLanguage,
      targetLanguage
    );

    // Step 3: Store translation
    await storeItemTranslation(itemId, targetLanguage, {
      translated_name: translatedName,
      translated_description: translatedDescription
    });

    // Step 4: Update job status
    await updateJobStatus(jobId, 'completed');

    return {
      success: true,
      itemId,
      targetLanguage,
      translatedName,
      translatedDescription,
      jobStatus: 'completed'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';

    await updateJobStatus(jobId, 'failed', errorMessage);

    return {
      success: false,
      itemId,
      targetLanguage,
      error: errorMessage,
      jobStatus: 'failed'
    };
  }
}
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/processors/item-processor.ts` | Main item translation processor implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/content-translation/index.ts` | Export `processItemTranslation` function |
| `/src/lib/job-queue/translation-jobs.ts` | Import and call `processItemTranslation` for item entity type (done in REQ-271) |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `processItemTranslation` | `item-processor.ts` | Main orchestration function |
| `fetchItemById` | `item-processor.ts` | Database query helper |
| `translateItemFields` | `item-processor.ts` | Field translation helper |
| `updateJobStatus` | `item-processor.ts` | Job queue status update |

### Database Tables Involved

| Table | Operation | Purpose |
|-------|-----------|---------|
| `items` | SELECT | Fetch source content |
| `item_translations` | UPSERT | Store translated content |
| `translation_jobs` | UPDATE | Track processing status |

---

## Error Handling

### Error Categories

| Error Type | Cause | Action |
|------------|-------|--------|
| Item Not Found | Invalid itemId in job | Mark job failed, log error |
| Translation Service Error | API failure, rate limit | Mark job failed, allow retry |
| Storage Error | Database constraint violation | Mark job failed, log details |
| Network Error | Connection issues | Mark job failed, allow retry |

### Retry Logic

Jobs that fail due to transient errors (translation service, network) should be eligible for retry. The job processor (REQ-271) handles retry logic with exponential backoff:

- Jobs with `attempts < 3` are reset to `queued` status
- Jobs with `attempts >= 3` are marked as `failed` permanently

---

## Acceptance Criteria

From REQ-272 in gen_requests_epic3.md:

- [ ] A `processItemTranslation` function accepts job metadata including item identifier, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source item record using the item identifier
- [ ] The function extracts the `name` and `description` fields from the retrieved item record
- [ ] The function calls the translation service to translate both `name` and `description` from source language to target language
- [ ] The function stores the translated `name` and `description` in the `item_translations` table using UPSERT logic
- [ ] The UPSERT operation associates the translation with the correct item identifier and target language code
- [ ] Upon successful translation and storage, the function updates the job status to 'completed' in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to 'failed' with error details indicating the item could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to 'failed' with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to 'failed' with error details indicating the translation could not be persisted
- [ ] The function is exported from `/src/lib/content-translation/processors/item-processor.ts`
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1

---

## User Impact

- **Property Owners**: Item content is automatically translated and made available to international guests without manual intervention
- **Guests**: See translated item names and descriptions in their preferred language, improving comprehension and trust
- **System**: Reliable processing of translation jobs with proper status tracking and error handling

---

## Business Value

Enables automated multilingual item content delivery by implementing the core processing logic that bridges translation job queues with actual translation execution and storage. This ensures translation investment produces visible results for international guests and enables the platform to serve a global audience effectively.

---

## Testing Strategy

### Unit Tests

```typescript
describe('processItemTranslation', () => {
  it('should successfully translate item name and description', async () => {
    // Mock item fetch, translation service, storage
    const result = await processItemTranslation({
      itemId: 'test-item-id',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(true);
    expect(result.translatedName).toBeDefined();
    expect(result.jobStatus).toBe('completed');
  });

  it('should handle item not found error', async () => {
    // Mock item fetch returning null
    const result = await processItemTranslation({
      itemId: 'non-existent-id',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
    expect(result.jobStatus).toBe('failed');
  });

  it('should handle translation service failure', async () => {
    // Mock translation service throwing error
    const result = await processItemTranslation({...});

    expect(result.success).toBe(false);
    expect(result.jobStatus).toBe('failed');
  });
});
```

### Integration Tests

- Test with actual database and mocked translation service
- Verify UPSERT behavior (create new, update existing)
- Verify job status updates in translation_jobs table

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-272)
- Translation Storage: REQ-263 (`storeItemTranslation`)
- Job Processor: REQ-271 (`processTranslationJob` routing)
- Service Pattern: `/src/lib/email-service.ts`
- Item API Pattern: `/src/app/api/admin/items/route.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3, Task 3.2 - Implement Item Translation Processor*
