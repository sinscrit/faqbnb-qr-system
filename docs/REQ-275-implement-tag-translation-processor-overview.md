# REQ-275: Implement Tag Translation Processor - Overview

**Document Created:** 2026-01-18 12:00:00 UTC
**Last Modified:** 2026-01-18 12:00:00 UTC
**Request Reference:** `/docs/gen_requests_epic3.md` - Request #275
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.5
**Size:** S (Small)
**Priority:** P1 - High
**Depends On:** Epic 1 Foundation (Plan-110), REQ-263 (Translation Storage Utilities), REQ-271 (Job Processor Enhancement)

---

## Summary

Implement a specialized processor function that handles translation jobs for tags. The processor fetches tag data by key, translates the tag value using the translation service, stores the results in the `tag_translations` table with UPSERT logic while explicitly marking it as a user tag (`is_system_tag = false`), and updates the job status to track progress.

---

## Current Behavior

No dedicated processor exists to handle translation jobs specifically for tags. Translation jobs may be queued (via the tag translation trigger from REQ-262) but cannot be executed because there is no implementation that:
- Retrieves tag data from the database using the tag key
- Sends the tag value to the translation service
- Persists translated results back to the database with proper user tag identification
- Updates job status with proper error handling

---

## Expected Behavior

When a translation job for a tag is dequeued by the job processor:

1. **Fetch Source Content**: Retrieve the tag record from the database using the tag key from job metadata
2. **Extract Tag Value**: Extract the tag value field that requires translation
3. **Call Translation Service**: Translate the value from source language to target language using the Epic 1 translation service infrastructure
4. **Store Translation**: Persist translated content to `tag_translations` table using UPSERT pattern with `is_system_tag = false` to mark it as a user-created tag
5. **Update Job Status**: Mark job as `completed` on success, or `failed` with descriptive error message on failure

---

## Technical Context

### Dependencies from Epic 1 (Plan-110)

This task requires the following Epic 1 infrastructure to be implemented:

| Component | Location | Required For |
|-----------|----------|--------------|
| Translation service | `/src/lib/translation-service/` | `translateText()` function |
| Job queue | `/src/lib/job-queue/` | Job processing infrastructure |
| Translation tables | Database | `translation_jobs`, `tag_translations` |

### Dependencies from Epic 3 Phase 1

| Component | Task Reference | Required For |
|-----------|----------------|--------------|
| Translation storage utilities | REQ-263 | `storeTagTranslation()` function |
| Job processor enhancement | REQ-271 | `processTranslationJob()` routing |
| Tag translation trigger | REQ-262 | Creates jobs that this processor handles |

### Existing Patterns to Follow

| Pattern | Source Location | Usage |
|---------|-----------------|-------|
| Service interface pattern | `/src/lib/email-service.ts` | Interface + Mock + Production classes |
| Database access | `/src/app/api/admin/items/route.ts` | Supabase query patterns |
| Type definitions | `/src/types/index.ts` | TypeScript interface structure |
| Error handling | Email service | Graceful error handling with result objects |
| Item processor pattern | `/src/lib/content-translation/processors/item-processor.ts` | REQ-272 implementation pattern |
| Link processor pattern | `/src/lib/content-translation/processors/link-processor.ts` | REQ-274 implementation pattern |

### Database Schema Reference

The `tag_translations` table from the L10N migration (`/database/migrations/20260117_l10n_foundation.sql`):

```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL,
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tag_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  UNIQUE(tag_key, language)
);
```

**Critical**: The `is_system_tag` field must be explicitly set to `false` for user-created tag translations processed by this processor. System tags are pre-seeded in Epic 1 with `is_system_tag = true`.

### Tag Key as Entity ID

Unlike items, articles, and links which use UUIDs as entity identifiers, tags use the `tag_key` string as their entity ID in the `translation_jobs` table. This is because tags are identified by their key (e.g., "coffee-maker", "guest-favorite") rather than a UUID.

---

## Architecture

### Component Location

```
/src/lib/content-translation/
├── processors/
│   ├── item-processor.ts        # REQ-272
│   ├── article-processor.ts     # REQ-273
│   ├── link-processor.ts        # REQ-274
│   └── tag-processor.ts         # NEW: This implementation (REQ-275)
└── storage/
    └── translation-storage.ts   # REQ-263: Used for storeTagTranslation()

/src/lib/job-queue/
└── translation-jobs.ts          # Modified in REQ-271 to call tag-processor
```

### Data Flow

```
Translation Job (entity_type: 'tag')
    │
    ▼
processTranslationJob() [REQ-271]
    │
    ├── Examine entityType === 'tag'
    │
    ▼
processTagTranslation() [This REQ-275]
    │
    ├── 1. Extract tag key from job metadata
    │       - entity_id contains the tag_key (string, not UUID)
    │
    ├── 2. Resolve tag value to translate
    │       - Tag value is typically the tag key itself (human-readable)
    │       - Or query tag_translations for source language if exists
    │
    ├── 3. Call translation service
    │       translateText(tagValue, sourceLanguage, targetLanguage, context)
    │       Context: { contentType: 'tag', domain: 'property_rental_categorization' }
    │
    ├── 4. Store translation
    │       storeTagTranslation(tagKey, targetLanguage, translatedValue, false)
    │       Uses UPSERT: INSERT ... ON CONFLICT UPDATE
    │       ⚠️ is_system_tag MUST be set to false
    │
    └── 5. Update job status
            - Success: status = 'completed', completed_at = NOW()
            - Failure: status = 'failed', error_message = <details>
```

### Translation Context

For optimal translation quality, the processor should provide context:

```typescript
const TAG_TRANSLATION_CONTEXT = {
  contentType: 'tag',
  domain: 'property_rental_categorization',
  systemPrompt: 'Translate a category tag for household items. Single word or short phrase, suitable for filtering/searching.'
};
```

---

## Integration Contract

### Function Signature

```typescript
// /src/lib/content-translation/processors/tag-processor.ts

import { SupportedLanguage } from '@/lib/translation-service';

export interface TagTranslationJobData {
  /** Tag key (the entity ID for tags) */
  tagKey: string;
  /** Source language of the original tag value */
  sourceLanguage: SupportedLanguage;
  /** Target language to translate into */
  targetLanguage: SupportedLanguage;
  /** Job tracking identifier */
  jobId: string;
}

export interface TagTranslationResult {
  /** Whether the translation succeeded */
  success: boolean;
  /** The tag key that was translated */
  tagKey: string;
  /** The target language */
  targetLanguage: SupportedLanguage;
  /** The translated tag value (if successful) */
  translatedValue?: string;
  /** Error message (if failed) */
  error?: string;
  /** Final job status */
  jobStatus: 'completed' | 'failed';
}

/**
 * Process a single tag translation job
 *
 * This processor translates user-created tag values and stores them
 * with is_system_tag = false to distinguish from pre-seeded system tags.
 *
 * @param job - Translation job metadata from the job queue
 * @returns Translation result with status information
 */
export async function processTagTranslation(
  job: TagTranslationJobData
): Promise<TagTranslationResult>;
```

### Usage from Job Processor

```typescript
// In /src/lib/job-queue/translation-jobs.ts (REQ-271)

import { processTagTranslation } from '@/lib/content-translation/processors/tag-processor';

async function processTranslationJob(job: TranslationJob): Promise<void> {
  switch (job.entityType) {
    case 'item':
      // ... handled by item-processor
      break;
    case 'article':
      // ... handled by article-processor
      break;
    case 'link':
      // ... handled by link-processor
      break;
    case 'tag':
      const result = await processTagTranslation({
        tagKey: job.entityId,  // For tags, entityId is the tag_key string
        sourceLanguage: job.sourceLanguage,
        targetLanguage: job.targetLanguage,
        jobId: job.id
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      break;
  }
}
```

---

## Implementation Tasks

### Task 1: Create Tag Processor File Structure

**File:** `/src/lib/content-translation/processors/tag-processor.ts`

Create the processor module with proper TypeScript types and exports.

```typescript
/**
 * Tag Translation Processor
 *
 * Handles translation of user-created tag values.
 * Stores translations with is_system_tag = false to distinguish from
 * pre-seeded system tags.
 *
 * @module content-translation/processors/tag-processor
 * @see docs/REQ-275-implement-tag-translation-processor-overview.md
 */

import { SupportedLanguage } from '@/lib/translation-service';

// Type definitions for tag translation processing
export interface TagTranslationJobData {
  tagKey: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  jobId: string;
}

export interface TagTranslationResult {
  success: boolean;
  tagKey: string;
  targetLanguage: SupportedLanguage;
  translatedValue?: string;
  error?: string;
  jobStatus: 'completed' | 'failed';
}

// Translation context for tags
const TAG_TRANSLATION_CONTEXT = {
  contentType: 'tag',
  domain: 'property_rental_categorization',
  systemPrompt: 'Translate a category tag for household items. Single word or short phrase, suitable for filtering/searching.'
};
```

### Task 2: Implement Tag Value Resolution

Resolve the tag value to translate. For user-created tags, the value to translate is typically the tag key itself (which is human-readable).

```typescript
/**
 * Resolves the tag value to translate
 *
 * For user-created tags, the tag key itself is the human-readable value
 * that needs translation (e.g., "coffee-maker" -> "machine à café").
 *
 * @param tagKey - The tag key identifier
 * @returns The value to translate
 */
function resolveTagValue(tagKey: string): string {
  // For user tags, the tag key is the human-readable value
  // Convert kebab-case to readable format if needed
  // e.g., "coffee-maker" stays as "coffee maker" for translation
  return tagKey.replace(/-/g, ' ');
}
```

### Task 3: Implement Tag Value Translation

Call the translation service for the tag value.

```typescript
async function translateTagValue(
  value: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<string> {
  const translatedValue = await translateText({
    text: value,
    sourceLanguage,
    targetLanguage,
    context: TAG_TRANSLATION_CONTEXT
  });

  return translatedValue;
}
```

### Task 4: Implement Translation Storage Integration

Call the storage utility (from REQ-263) to persist translations. **Explicitly mark as user tag.**

```typescript
// Uses storeTagTranslation from REQ-263
// CRITICAL: is_system_tag MUST be false for user-created tags
await storeTagTranslation(
  tagKey,
  targetLanguage,
  translatedValue,
  false  // is_system_tag = false
);
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
export async function processTagTranslation(
  job: TagTranslationJobData
): Promise<TagTranslationResult> {
  const { tagKey, sourceLanguage, targetLanguage, jobId } = job;

  try {
    // Step 1: Validate tag key
    if (!tagKey || tagKey.trim() === '') {
      await updateJobStatus(jobId, 'failed', `Invalid tag key: ${tagKey}`);
      return {
        success: false,
        tagKey,
        targetLanguage,
        error: `Invalid tag key: ${tagKey}`,
        jobStatus: 'failed'
      };
    }

    // Step 2: Resolve the tag value to translate
    const valueToTranslate = resolveTagValue(tagKey);

    // Step 3: Translate the tag value
    const translatedValue = await translateTagValue(
      valueToTranslate,
      sourceLanguage,
      targetLanguage
    );

    // Step 4: Store translation with is_system_tag = false
    await storeTagTranslation(
      tagKey,
      targetLanguage,
      translatedValue,
      false  // CRITICAL: User tags must be marked as non-system
    );

    // Step 5: Update job status
    await updateJobStatus(jobId, 'completed');

    return {
      success: true,
      tagKey,
      targetLanguage,
      translatedValue,
      jobStatus: 'completed'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';

    await updateJobStatus(jobId, 'failed', errorMessage);

    return {
      success: false,
      tagKey,
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
| `/src/lib/content-translation/processors/tag-processor.ts` | Main tag translation processor implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/content-translation/index.ts` | Export `processTagTranslation` function |
| `/src/lib/job-queue/translation-jobs.ts` | Import and call `processTagTranslation` for tag entity type (done in REQ-271) |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `processTagTranslation` | `tag-processor.ts` | Main orchestration function |
| `resolveTagValue` | `tag-processor.ts` | Tag value resolution helper |
| `translateTagValue` | `tag-processor.ts` | Translation service call helper |
| `updateJobStatus` | `tag-processor.ts` | Job queue status update |

### Database Tables Involved

| Table | Operation | Purpose |
|-------|-----------|---------|
| `tag_translations` | UPSERT | Store translated tag value with `is_system_tag = false` |
| `translation_jobs` | UPDATE | Track processing status |

---

## Critical Implementation Notes

### User Tag Identification

**The `is_system_tag` field must ALWAYS be set to `false` when storing translations via this processor.** This is enforced at multiple levels:

1. **Function Level**: `storeTagTranslation()` is called with explicit `false` parameter
2. **Documentation**: Clear comments in code marking this as critical
3. **Validation**: The processor only handles user-created tags (system tags are pre-seeded in Epic 1)

```typescript
// Example logging for audit purposes
console.log(`[TagTranslation] Processing user tag "${tagKey}": storing with is_system_tag=false`);
```

### Why is_system_tag Matters

- **System tags** (`is_system_tag = true`): Pre-seeded in Epic 1 migration with complete translations for all 17 system tags (room, item type, and purpose tags)
- **User tags** (`is_system_tag = false`): Custom tags created by property owners, translated by this processor
- The distinction allows:
  - Efficient queries filtering by tag type
  - Different update/delete policies for system vs user content
  - Analytics on custom tag usage vs system tag adoption

### Tag Key as Entity ID

Unlike other entity types, tags use the `tag_key` string as their entity ID:

```typescript
// In translation_jobs table:
// entity_type = 'tag'
// entity_id = 'coffee-maker' (string, not UUID)
```

This is intentional because:
- Tags are identified globally by their key (not per-property or per-item)
- Tag translations are shared across the platform (cached for reuse)
- The tag_key provides a natural unique identifier

---

## Error Handling

### Error Categories

| Error Type | Cause | Action |
|------------|-------|--------|
| Invalid Tag Key | Empty or whitespace-only tag key | Mark job failed, log error |
| Translation Service Error | API failure, rate limit | Mark job failed, allow retry |
| Storage Error | Database constraint violation | Mark job failed, log details |
| Network Error | Connection issues | Mark job failed, allow retry |

### Retry Logic

Jobs that fail due to transient errors (translation service, network) should be eligible for retry. The job processor (REQ-271) handles retry logic with exponential backoff:

- Jobs with `attempts < 3` are reset to `queued` status
- Jobs with `attempts >= 3` are marked as `failed` permanently

---

## Acceptance Criteria

From REQ-275 in gen_requests_epic3.md:

- [ ] A `processTagTranslation` function accepts job metadata including tag key, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source tag record using the tag key
- [ ] The function extracts the tag value field from the retrieved tag record
- [ ] The function calls the translation service to translate the tag value from source language to target language
- [ ] The function stores the translated tag value in the `tag_translations` table using UPSERT logic
- [ ] The UPSERT operation associates the translation with the correct tag key and target language code
- [ ] The UPSERT operation explicitly sets `is_system_tag` to `false` to mark the translation as a user tag
- [ ] Upon successful translation and storage, the function updates the job status to 'completed' in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to 'failed' with error details indicating the tag could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to 'failed' with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to 'failed' with error details indicating the translation could not be persisted
- [ ] The function is exported from `/src/lib/content-translation/processors/tag-processor.ts`
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1

---

## User Impact

- **Property Owners**: Custom tags created in their preferred language are automatically translated for international guests without manual intervention
- **Guests**: See translated tag values in their preferred language, improving content discoverability and comprehension across language barriers
- **System**: Reliable processing of tag translation jobs with proper status tracking, user tag identification, and error handling

---

## Business Value

Enables automated multilingual tag delivery by implementing the core processing logic that bridges translation job queues with actual translation execution and storage. This ensures:

- User-generated tags reach international guests effectively
- Tags are properly distinguished from system tags for future features
- Property owners' custom categorization is multilingual-ready
- Reduced manual translation management for property owners

---

## Comparison with Other Processors

| Aspect | Item Processor (REQ-272) | Article Processor (REQ-273) | Link Processor (REQ-274) | Tag Processor (REQ-275) |
|--------|--------------------------|-----------------------------|-----------------------------|--------------------------|
| Fields to Translate | `name`, `description` | `title`, `description` | `title` only | `value` only |
| Entity ID Type | UUID | UUID | UUID | **String (tag_key)** |
| Special Handling | None | None | URL excluded | **`is_system_tag = false`** |
| Translation Contexts | 2 | 2 | 1 | 1 |
| Complexity | Medium | Medium | Small | **Small** |
| Storage Table | `item_translations` | `article_translations` | `link_translations` | `tag_translations` |

---

## Testing Strategy

### Unit Tests

```typescript
describe('processTagTranslation', () => {
  it('should successfully translate tag value', async () => {
    // Mock translation service, storage
    const result = await processTagTranslation({
      tagKey: 'coffee-maker',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(true);
    expect(result.translatedValue).toBeDefined();
    expect(result.jobStatus).toBe('completed');
  });

  it('should set is_system_tag to false', async () => {
    // Mock storeTagTranslation to capture arguments
    const storeTagTranslationMock = jest.fn();

    await processTagTranslation({
      tagKey: 'my-custom-tag',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    // Verify is_system_tag parameter is false
    expect(storeTagTranslationMock).toHaveBeenCalledWith(
      'my-custom-tag',
      'fr',
      expect.any(String),
      false  // is_system_tag MUST be false
    );
  });

  it('should handle invalid tag key error', async () => {
    const result = await processTagTranslation({
      tagKey: '',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid tag key');
    expect(result.jobStatus).toBe('failed');
  });

  it('should handle whitespace-only tag key', async () => {
    const result = await processTagTranslation({
      tagKey: '   ',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid tag key');
    expect(result.jobStatus).toBe('failed');
  });

  it('should handle translation service failure', async () => {
    // Mock translation service throwing error
    const result = await processTagTranslation({
      tagKey: 'test-tag',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(false);
    expect(result.jobStatus).toBe('failed');
  });

  it('should convert kebab-case to readable format for translation', async () => {
    // Verify "coffee-maker" becomes "coffee maker" before translation
    const translateTextMock = jest.fn();

    await processTagTranslation({
      tagKey: 'coffee-maker',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(translateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'coffee maker' })
    );
  });
});
```

### Integration Tests

- Test with actual database and mocked translation service
- Verify UPSERT behavior (create new, update existing)
- Verify job status updates in translation_jobs table
- Verify `is_system_tag = false` is stored correctly

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: File structure & types | 10 min | Low |
| Task 2: Tag value resolution | 5 min | Low |
| Task 3: Tag value translation | 10 min | Low |
| Task 4: Storage integration | 10 min | Low |
| Task 5: Job status updates | 10 min | Low |
| Task 6: Main processor function | 15 min | Low |
| Export and integration | 5 min | Low |
| **Total** | **~1 hour** | **Small** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| is_system_tag set incorrectly | Low | High | Explicit `false` parameter, code review, tests |
| Tag key format variations | Medium | Low | Normalize tag keys (lowercase, trim) |
| Translation service errors | Medium | Low | Retry mechanism in job processor |
| Empty tag value edge case | Low | Low | Validation before translation |
| Database constraint violations | Low | Low | UPSERT handles conflicts gracefully |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-275)
- Translation Storage: REQ-263 (`storeTagTranslation`)
- Job Processor: REQ-271 (`processTranslationJob` routing)
- Tag Trigger: REQ-262 (`triggerTagTranslation` creates jobs this processor handles)
- Item Processor Pattern: REQ-272 (`processItemTranslation`)
- Link Processor Pattern: REQ-274 (`processLinkTranslation`)
- Service Pattern: `/src/lib/email-service.ts`
- Database Migration: `/database/migrations/20260117_l10n_foundation.sql`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3, Task 3.5 - Implement Tag Translation Processor*
