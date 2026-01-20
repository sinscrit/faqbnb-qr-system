# Implementation Overview: REQ-E03-017 - Implement Tag Translation Processor

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E03-017
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.5
**Status:** Ready for Implementation

---

## Summary

Implement a specialized processor function that retrieves tag records, translates the tag value, persists the translation as a user tag (with `is_system_tag = false`), and updates the job status. This processor will be integrated into the existing job processing infrastructure established in Epic 1 (REQ-244).

---

## Request Details

### Type
NEW FEATURE

### Size
S (Small)

### Priority
P1 - High (Core translation infrastructure)

### Dependencies
- **Epic 1 Foundation (Complete):**
  - Translation tables exist (`tag_translations`)
  - Translation service operational (`/src/lib/translation-service/`)
  - Job queue infrastructure in place (`/src/lib/job-queue/`)
  - System tags pre-seeded via `20260117_system_tag_translations.sql`

- **Epic 3 Prerequisites:**
  - REQ-E03-001: Content translation module structure
  - REQ-E03-005: Translation storage utilities (specifically `storeTagTranslation`)
  - REQ-E03-013: Enhanced job processor routing logic

---

## Current Behavior

The existing job processor in `/src/lib/job-queue/job-processor.ts` already handles tag translation via a switch statement within the `processJob` function. However, the implementation plan (Plan-111) calls for:
1. Explicit processor functions per entity type
2. Integration with the content-translation module's storage utilities
3. Explicit setting of `is_system_tag = false` for user-created tags

Currently:
- Tags are processed inline within the main `processJob` function
- Tag content is fetched from `tag_translations` table using English (`'en'`) as source
- Translations are saved via `saveTranslation` function with `is_system_tag: false`
- No dedicated processor function exists in the content-translation module

---

## Expected Behavior

A dedicated `processTagTranslation` function will be created that:

### 1. Data Retrieval
- Accepts a translation job specification containing tag key, target language, and job metadata
- Queries the `tag_translations` table to retrieve the tag record using the tag key
- Retrieves the English (`'en'`) translation as the source text
- Handles cases where the tag no longer exists or has been deleted
- Returns appropriate error status if the tag cannot be found

### 2. Field Extraction and Translation
- Extracts the `translated_value` field from the retrieved tag record
- Prepares a translation request payload containing the tag value
- Submits the translation request to the translation service with appropriate context:
  - `contentType: 'tag'`
  - `domainContext: 'Category tag for organizing property items. Single word or short phrase.'`
- Specifies the source language (`'en'`) and target language from the job metadata
- Handles translation service errors and timeouts appropriately

### 3. Storage
- Receives the translated tag value from the translation service
- Calls the tag translation storage utility (from REQ-E03-005) or uses direct UPSERT
- Passes the tag key, target language, and translated value
- **Explicitly sets `is_system_tag = false`** to indicate this is a user-created tag
- Uses the UPSERT pattern to handle both new translations and updates
- Records translation metadata including timestamp

### 4. Job Status Management
- Marks the translation job as completed upon successful storage
- Records completion timestamp in the job record
- For failures at any stage, marks the job as failed with detailed error information
- Respects job retry policies and backoff intervals
- Increments retry counters for transient failures (network, timeout, rate limit)
- Does not retry for permanent errors (invalid tag key, unsupported language)

---

## Technical Approach

### Option A: Extend Existing Job Processor (Recommended)

The existing `job-processor.ts` already handles tags within its switch statement. The recommended approach is to:

1. Extract the tag-specific logic into a dedicated `processTagTranslation` function
2. Export this function from the job-queue module
3. Optionally create a wrapper in the content-translation module that uses this processor

**Rationale:** Minimizes code duplication, maintains consistency with existing patterns, and leverages tested infrastructure.

### Option B: Create Separate Content-Translation Processor

Create an entirely new processor in `/src/lib/content-translation/processors/tag-processor.ts` that:
1. Handles the complete workflow independently
2. Calls storage utilities from REQ-E03-005
3. Is integrated into the job processor routing

**Rationale:** Better separation of concerns, aligns with the module structure in Plan-111.

### Recommendation: Hybrid Approach

1. **Keep existing functionality** in `job-processor.ts` for backward compatibility
2. **Create a dedicated function** `processTagTranslation` that can be called from either:
   - The existing job processor switch statement
   - The content-translation module for explicit invocation
3. **Export the processor** from both modules for flexibility

---

## Database Schema Reference

### `tag_translations` Table

```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,           -- Original tag identifier
  language VARCHAR(5) NOT NULL,            -- 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
  translated_value VARCHAR(255) NOT NULL,  -- Translated tag text
  is_system_tag BOOLEAN DEFAULT false,     -- true for pre-defined, false for user-created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tag_key, language)
);
```

### Relevant Indexes
```sql
CREATE INDEX idx_tag_trans_key_lang ON tag_translations(tag_key, language);
CREATE INDEX idx_tag_trans_language ON tag_translations(language);
CREATE INDEX idx_tag_trans_system ON tag_translations(is_system_tag);
```

---

## Integration Contracts

### Input: TranslationJob Interface

```typescript
interface TranslationJob {
  id: string;
  entityType: 'tag';
  entityId: string;           // The tag_key
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}
```

### Output: JobProcessingResult Interface

```typescript
interface JobProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'tag';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: { translated_value: string };
  errorMessage?: string;
  processingTimeMs: number;
}
```

### Storage Function Signature

```typescript
async function storeTagTranslation(
  tagKey: string,
  language: SupportedLanguage,
  translatedValue: string,
  isSystemTag: boolean = false
): Promise<{ success: boolean; error?: string }>;
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification Type | Description |
|-----------|------------------|-------------|
| `/src/lib/job-queue/job-processor.ts` | MODIFY | Extract tag processing into dedicated function `processTagTranslation` |
| `/src/lib/job-queue/index.ts` | MODIFY | Export new `processTagTranslation` function |

### Files to Create (Optional - based on approach)

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/processors/tag-processor.ts` | Dedicated tag processor wrapper (if following content-translation module pattern) |
| `/src/lib/content-translation/processors/index.ts` | Barrel exports for processors |

### Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `processJob` | `job-processor.ts:446-542` | Extract tag case into separate function call |
| `saveTranslation` | `job-processor.ts:273-387` | Already handles tags correctly - no changes needed |
| `fetchEntityContent` | `job-processor.ts:152-258` | Already handles tags correctly - no changes needed |

### Functions to Create

| Function | File | Signature |
|----------|------|-----------|
| `processTagTranslation` | `job-processor.ts` | `async function processTagTranslation(job: TranslationJob, config: JobProcessorConfig): Promise<JobProcessingResult>` |

---

## Implementation Tasks

### Task 1: Extract Tag Translation Processor Function

**Location:** `/src/lib/job-queue/job-processor.ts`

Create a dedicated function that encapsulates tag-specific processing logic:

```typescript
/**
 * Process a tag translation job
 *
 * Specialized processor for tag entities that:
 * 1. Fetches the English source translation
 * 2. Translates to target language via translation service
 * 3. Stores result with is_system_tag = false
 * 4. Updates job status
 *
 * @param job - The translation job to process
 * @param config - Processor configuration
 * @returns Processing result with success/failure status
 */
export async function processTagTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult>
```

### Task 2: Update Job Processor Routing

**Location:** `/src/lib/job-queue/job-processor.ts:446`

Modify the `processJob` function to delegate tag processing:

```typescript
async function processJob(job: TranslationJob, config: JobProcessorConfig): Promise<JobProcessingResult> {
  // ... existing setup code ...

  // For tag entities, use dedicated processor
  if (job.entityType === 'tag') {
    return processTagTranslation(job, config);
  }

  // ... rest of existing processing logic ...
}
```

### Task 3: Export from Module Index

**Location:** `/src/lib/job-queue/index.ts`

Add export for the new function:

```typescript
export {
  // ... existing exports ...
  processTagTranslation,  // NEW: Tag-specific processor
} from './job-processor';
```

### Task 4: Verify is_system_tag Handling

Ensure the storage logic explicitly sets `is_system_tag: false`:

```typescript
// In saveTranslation or storeTagTranslation
case 'tag': {
  const { error } = await supabaseAdmin
    .from('tag_translations')
    .upsert({
      tag_key: entityId,
      language: targetLanguage,
      translated_value: translatedFields.translated_value,
      is_system_tag: false,  // CRITICAL: Always false for user translations
    }, {
      onConflict: 'tag_key,language',
    });
}
```

---

## Error Handling

### Transient Errors (Should Retry)
- Network timeouts
- Translation service rate limits
- Database connection issues
- Temporary service unavailability

### Permanent Errors (Should NOT Retry)
- Tag key not found in `tag_translations` table
- Invalid target language
- Translation service returns invalid response structure

### Error Logging Format

```typescript
console.error('[TagProcessor] Job failed:', {
  jobId: job.id,
  tagKey: job.entityId,
  targetLanguage: job.targetLanguage,
  error: errorMessage,
  attempts: job.attempts,
});
```

---

## Testing Requirements

### Unit Tests

1. **processTagTranslation with valid tag**
   - Mock: Tag exists in database, translation service returns valid result
   - Assert: Returns success with translated value, job marked completed

2. **processTagTranslation with missing tag**
   - Mock: Tag not found in database
   - Assert: Returns failure with appropriate error message

3. **processTagTranslation with translation service error**
   - Mock: Translation service throws error
   - Assert: Returns failure, error message captured, job marked failed

4. **processTagTranslation verifies is_system_tag = false**
   - Mock: Successful translation
   - Assert: UPSERT called with `is_system_tag: false`

### Integration Tests

1. **End-to-end tag translation flow**
   - Create a tag translation job
   - Process via job processor
   - Verify translation stored in database with correct values

2. **Retry behavior for transient errors**
   - Simulate network error
   - Verify job is re-queued (not marked permanently failed)

---

## Acceptance Criteria

- [ ] Function accepts a translation job object containing tag key, target language, and job metadata
- [ ] Function queries the database to retrieve the tag record by key
- [ ] Function handles missing or deleted tags with appropriate error status
- [ ] Function extracts the tag value from the tag record
- [ ] Function prepares translation request with the tag value
- [ ] Function calls the translation service with source language, target language, and tag value
- [ ] Function handles translation service errors with retry logic for transient failures
- [ ] Function handles translation service timeouts with appropriate error status
- [ ] Function receives translated tag value from the translation service response
- [ ] Function calls the tag translation storage utility from REQ-E03-005
- [ ] Function passes tag key, target language, and translated value to storage utility
- [ ] Function explicitly sets `is_system_tag` parameter to `false` when storing translation
- [ ] Function marks job as completed in the job queue upon successful storage
- [ ] Function records completion timestamp in the job record
- [ ] Function marks job as failed with error details when any stage fails
- [ ] Function increments retry counter for transient errors (network, timeout, rate limit)
- [ ] Function does not retry for permanent errors (invalid tag key, unsupported language)
- [ ] Function respects maximum retry limits defined in job configuration
- [ ] Function logs all significant events (start, completion, errors) for troubleshooting
- [ ] TypeScript types are properly defined for job objects, responses, and error states
- [ ] Function is exported from the content translation module
- [ ] Function integrates cleanly with the job processor routing logic from REQ-E03-013

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing tag processing | Low | High | Extract logic carefully, maintain existing switch case as fallback |
| Translation service downtime | Medium | Medium | Retry logic with exponential backoff |
| Duplicate translations (race condition) | Low | Low | UPSERT pattern prevents duplicates via UNIQUE constraint |
| Memory issues with large tag batches | Low | Low | Process one job at a time, existing concurrency controls |

---

## Performance Considerations

- Tag translations are typically single words or short phrases (< 255 chars)
- Translation should complete in < 5 seconds under normal conditions
- Use heartbeat mechanism to prevent lock timeout during processing
- Leverage existing indexes for efficient lookups

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.5)
- **Request Source:** `/docs/gen_requests_epic3.md` (REQ-E03-017)
- **Existing Job Processor:** `/src/lib/job-queue/job-processor.ts`
- **Translation Service:** `/src/lib/translation-service/`
- **Database Migration:** `/database/migrations/20260117_l10n_foundation.sql`
- **System Tags Seed:** `/database/seeds/20260117_system_tag_translations.sql`

---

## Appendix: Existing Code Patterns

### Tag Content Fetching (job-processor.ts:226-248)
```typescript
case 'tag': {
  // Tags use the tag_key itself; value comes from English tag_translations
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('tag_key, translated_value')
    .eq('tag_key', entityId)
    .eq('language', 'en')
    .single();

  if (error || !data) {
    console.error('[JobProcessor] Failed to fetch tag:', error);
    return null;
  }

  return {
    entityType: 'tag',
    entityId,
    sourceLanguage: 'en',
    fields: {
      translated_value: data.translated_value,
    },
  };
}
```

### Tag Storage (job-processor.ts:357-377)
```typescript
case 'tag': {
  const { error } = await supabaseAdmin
    .from('tag_translations')
    .upsert(
      {
        tag_key: entityId,
        language: targetLanguage,
        translated_value: translatedFields.translated_value,
        is_system_tag: false,
      },
      {
        onConflict: 'tag_key,language',
      }
    );

  if (error) {
    console.error('[JobProcessor] Failed to save tag translation:', error);
    return false;
  }
  return true;
}
```

### Translation Context (job-processor.ts:400-409)
```typescript
function getTranslationContext(entityType: EntityType): { domainContext: string } {
  const contexts: Record<EntityType, string> = {
    tag: 'Category tag for organizing property items. Single word or short phrase.',
    // ... other entities
  };
  return { domainContext: contexts[entityType] };
}
```
