# REQ-274: Implement Link Translation Processor - Overview

**Document Created:** 2026-01-18 06:30:00 UTC
**Last Modified:** 2026-01-18 06:30:00 UTC
**Request Reference:** `/docs/gen_requests_epic3.md` - Request #274
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.4
**Size:** S (Small)
**Priority:** P1 - High
**Depends On:** Epic 1 Foundation (Plan-110), REQ-263 (Translation Storage Utilities), REQ-271 (Job Processor Enhancement)

---

## Summary

Implement a specialized processor function that handles translation jobs for links. The processor fetches link data by ID, translates **only the `title` field** (explicitly excluding the URL), stores the results in the `link_translations` table with UPSERT logic, and updates the job status to track progress. This ensures links remain functional across all languages while their human-readable titles are appropriately translated.

---

## Current Behavior

No dedicated processor exists to handle translation jobs specifically for links. Translation jobs may be queued but cannot be executed because there is no implementation that:
- Retrieves link data from the database
- Sends only the title field to the translation service (excluding URL)
- Persists translated results back to the database
- Updates job status with proper error handling

---

## Expected Behavior

When a translation job for a link is dequeued by the job processor:

1. **Fetch Source Content**: Retrieve the link record from the database using the link ID from job metadata
2. **Extract Title Field Only**: Extract only the `title` field for translation, explicitly excluding the `url` field from translation processing
3. **Call Translation Service**: Translate the title from source language to target language using the Epic 1 translation service infrastructure
4. **Store Translation**: Persist translated title to `link_translations` table using UPSERT pattern (create if new, update if exists), preserving the original URL unchanged
5. **Update Job Status**: Mark job as `completed` on success, or `failed` with descriptive error message on failure

---

## Technical Context

### Dependencies from Epic 1 (Plan-110)

This task requires the following Epic 1 infrastructure to be implemented:

| Component | Location | Required For |
|-----------|----------|--------------|
| Translation service | `/src/lib/translation-service/` | `translateText()` function |
| Job queue | `/src/lib/job-queue/` | Job processing infrastructure |
| Translation tables | Database | `translation_jobs`, `link_translations` |

### Dependencies from Epic 3 Phase 1

| Component | Task Reference | Required For |
|-----------|----------------|--------------|
| Translation storage utilities | REQ-263 | `storeLinkTranslation()` function |
| Job processor enhancement | REQ-271 | `processTranslationJob()` routing |

### Existing Patterns to Follow

| Pattern | Source Location | Usage |
|---------|-----------------|-------|
| Service interface pattern | `/src/lib/email-service.ts` | Interface + Mock + Production classes |
| Database access | `/src/app/api/admin/items/route.ts` | Supabase query patterns |
| Type definitions | `/src/types/index.ts` | TypeScript interface structure |
| Error handling | Email service | Graceful error handling with result objects |
| Item processor pattern | `/src/lib/content-translation/processors/item-processor.ts` | REQ-272 implementation pattern |
| Article processor pattern | `/src/lib/content-translation/processors/article-processor.ts` | REQ-273 implementation pattern |

### Database Schema Reference

The `item_links` table from `/src/lib/supabase.ts`:

```typescript
item_links: {
  Row: {
    id: string;
    item_id: string | null;
    article_id: string | null;
    link_type: string;
    title: string;           // TRANSLATABLE
    url: string;             // DO NOT TRANSLATE
    thumbnail_url: string | null;
    display_order: number | null;
    created_at: string | null;
  }
}
```

**Critical**: The `url` field must NEVER be sent to the translation service. Only the `title` field is translatable.

---

## Architecture

### Component Location

```
/src/lib/content-translation/
├── processors/
│   ├── item-processor.ts        # REQ-272
│   ├── article-processor.ts     # REQ-273
│   └── link-processor.ts        # NEW: This implementation (REQ-274)
└── storage/
    └── translation-storage.ts   # REQ-263: Used for storeLinkTranslation()

/src/lib/job-queue/
└── translation-jobs.ts          # Modified in REQ-271 to call link-processor
```

### Data Flow

```
Translation Job (entity_type: 'link')
    │
    ▼
processTranslationJob() [REQ-271]
    │
    ├── Examine entityType === 'link'
    │
    ▼
processLinkTranslation() [This REQ-274]
    │
    ├── 1. Query database for link by ID
    │       SELECT id, title, url FROM item_links WHERE id = ?
    │
    ├── 2. Extract ONLY the title field
    │       - title (required, VARCHAR)
    │       - url (explicitly EXCLUDED from translation)
    │
    ├── 3. Call translation service (title only)
    │       translateText(title, sourceLanguage, targetLanguage, context)
    │       ⚠️ URL is NOT sent to translation service
    │
    ├── 4. Store translation
    │       storeLinkTranslation(linkId, targetLanguage, { title })
    │       Uses UPSERT: INSERT ... ON CONFLICT UPDATE
    │       Original URL preserved unchanged
    │
    └── 5. Update job status
            - Success: status = 'completed', completed_at = NOW()
            - Failure: status = 'failed', error_message = <details>
```

### Translation Context

For optimal translation quality, the processor should provide context:

```typescript
const LINK_TRANSLATION_CONTEXT = {
  title: {
    contentType: 'link_title',
    domain: 'property_rental_media',
    systemPrompt: 'Translate a media link title (video, PDF, etc.) for vacation rental guests. Keep it descriptive but concise.'
  }
};
```

---

## Integration Contract

### Function Signature

```typescript
// /src/lib/content-translation/processors/link-processor.ts

import { SupportedLanguage } from '@/lib/translation-service';

export interface LinkTranslationJobData {
  linkId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  jobId: string;
}

export interface LinkTranslationResult {
  success: boolean;
  linkId: string;
  targetLanguage: SupportedLanguage;
  translatedTitle?: string;
  error?: string;
  jobStatus: 'completed' | 'failed';
}

/**
 * Process a single link translation job
 *
 * IMPORTANT: This processor translates ONLY the title field.
 * The URL field is explicitly excluded from translation to preserve link integrity.
 *
 * @param job - Translation job metadata from the job queue
 * @returns Translation result with status information
 */
export async function processLinkTranslation(
  job: LinkTranslationJobData
): Promise<LinkTranslationResult>;
```

### Usage from Job Processor

```typescript
// In /src/lib/job-queue/translation-jobs.ts (REQ-271)

import { processLinkTranslation } from '@/lib/content-translation/processors/link-processor';

async function processTranslationJob(job: TranslationJob): Promise<void> {
  switch (job.entityType) {
    case 'item':
      // ... handled by item-processor
      break;
    case 'article':
      // ... handled by article-processor
      break;
    case 'link':
      const result = await processLinkTranslation({
        linkId: job.entityId,
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

### Task 1: Create Link Processor File Structure

**File:** `/src/lib/content-translation/processors/link-processor.ts`

Create the processor module with proper TypeScript types and exports.

```typescript
/**
 * Link Translation Processor
 *
 * Handles translation of link titles while explicitly preserving URLs unchanged.
 * URLs are never sent to the translation service.
 *
 * @module content-translation/processors/link-processor
 * @see docs/REQ-274-implement-link-translation-processor-overview.md
 */

import { SupportedLanguage } from '@/lib/translation-service';

// Type definitions for link translation processing
export interface LinkTranslationJobData {
  linkId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  jobId: string;
}

export interface LinkTranslationResult {
  success: boolean;
  linkId: string;
  targetLanguage: SupportedLanguage;
  translatedTitle?: string;
  error?: string;
  jobStatus: 'completed' | 'failed';
}

// Translation context for link titles
const LINK_TRANSLATION_CONTEXT = {
  contentType: 'link_title',
  domain: 'property_rental_media',
  systemPrompt: 'Translate a media link title (video, PDF, etc.) for vacation rental guests. Keep it descriptive but concise.'
};
```

### Task 2: Implement Link Data Fetching

Fetch the source link record from the database. **Explicitly select only the fields needed, not the URL for translation purposes.**

```typescript
interface LinkRecord {
  id: string;
  title: string;
  url: string;  // Fetched but NOT translated - kept for validation/logging only
}

async function fetchLinkById(linkId: string): Promise<LinkRecord | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('item_links')
    .select('id, title, url')  // url fetched for integrity, but NOT translated
    .eq('id', linkId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
```

### Task 3: Implement Title Translation

Call the translation service for the title field only. **URL is explicitly excluded.**

```typescript
async function translateLinkTitle(
  title: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<string> {
  // ONLY translate the title - URL is never translated
  const translatedTitle = await translateText({
    text: title,
    sourceLanguage,
    targetLanguage,
    context: LINK_TRANSLATION_CONTEXT
  });

  return translatedTitle;
}
```

### Task 4: Implement Translation Storage Integration

Call the storage utility (from REQ-263) to persist translations. Store only the translated title.

```typescript
// Uses storeLinkTranslation from REQ-263
// Note: Only title is stored - URL remains unchanged in the original item_links table
await storeLinkTranslation(linkId, targetLanguage, {
  translated_title: translatedTitle,
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

Orchestrate the complete processing workflow with error handling. **Include explicit validation that URL is not translated.**

```typescript
export async function processLinkTranslation(
  job: LinkTranslationJobData
): Promise<LinkTranslationResult> {
  const { linkId, sourceLanguage, targetLanguage, jobId } = job;

  try {
    // Step 1: Fetch link
    const link = await fetchLinkById(linkId);
    if (!link) {
      await updateJobStatus(jobId, 'failed', `Link not found: ${linkId}`);
      return {
        success: false,
        linkId,
        targetLanguage,
        error: `Link not found: ${linkId}`,
        jobStatus: 'failed'
      };
    }

    // Step 2: Validate - ensure we have a title to translate
    if (!link.title || link.title.trim() === '') {
      await updateJobStatus(jobId, 'failed', `Link has no title to translate: ${linkId}`);
      return {
        success: false,
        linkId,
        targetLanguage,
        error: `Link has no title to translate: ${linkId}`,
        jobStatus: 'failed'
      };
    }

    // Step 3: Translate ONLY the title (URL is explicitly NOT translated)
    const translatedTitle = await translateLinkTitle(
      link.title,
      sourceLanguage,
      targetLanguage
    );

    // Step 4: Store translation (title only, URL preserved in original table)
    await storeLinkTranslation(linkId, targetLanguage, {
      translated_title: translatedTitle
    });

    // Step 5: Update job status
    await updateJobStatus(jobId, 'completed');

    return {
      success: true,
      linkId,
      targetLanguage,
      translatedTitle,
      jobStatus: 'completed'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';

    await updateJobStatus(jobId, 'failed', errorMessage);

    return {
      success: false,
      linkId,
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
| `/src/lib/content-translation/processors/link-processor.ts` | Main link translation processor implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/content-translation/index.ts` | Export `processLinkTranslation` function |
| `/src/lib/job-queue/translation-jobs.ts` | Import and call `processLinkTranslation` for link entity type (done in REQ-271) |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `processLinkTranslation` | `link-processor.ts` | Main orchestration function |
| `fetchLinkById` | `link-processor.ts` | Database query helper |
| `translateLinkTitle` | `link-processor.ts` | Title-only translation helper |
| `updateJobStatus` | `link-processor.ts` | Job queue status update |

### Database Tables Involved

| Table | Operation | Purpose |
|-------|-----------|---------|
| `item_links` | SELECT | Fetch source link record (title and url) |
| `link_translations` | UPSERT | Store translated title only |
| `translation_jobs` | UPDATE | Track processing status |

---

## Critical Implementation Notes

### URL Protection

**The URL field must NEVER be translated.** This is enforced at multiple levels:

1. **Function Level**: `translateLinkTitle()` only accepts and translates the title parameter
2. **Storage Level**: `storeLinkTranslation()` only stores the translated title
3. **Validation**: The processor should explicitly log that URL was excluded from translation

```typescript
// Example logging for audit purposes
console.log(`[LinkTranslation] Processing link ${linkId}: translating title only, URL preserved`);
```

### Why URL Exclusion Matters

- URLs contain machine-readable addresses that must remain unchanged
- Translating URLs would break external links
- YouTube video IDs, PDF paths, etc. would become invalid
- Guests need working links regardless of their language preference

---

## Error Handling

### Error Categories

| Error Type | Cause | Action |
|------------|-------|--------|
| Link Not Found | Invalid linkId in job | Mark job failed, log error |
| Empty Title | Link has no title | Mark job failed, log error |
| Translation Service Error | API failure, rate limit | Mark job failed, allow retry |
| Storage Error | Database constraint violation | Mark job failed, log details |
| Network Error | Connection issues | Mark job failed, allow retry |

### Retry Logic

Jobs that fail due to transient errors (translation service, network) should be eligible for retry. The job processor (REQ-271) handles retry logic with exponential backoff:

- Jobs with `attempts < 3` are reset to `queued` status
- Jobs with `attempts >= 3` are marked as `failed` permanently

---

## Acceptance Criteria

From REQ-274 in gen_requests_epic3.md:

- [ ] A `processLinkTranslation` function accepts job metadata including link identifier, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source link record using the link identifier
- [ ] The function extracts only the `title` field from the retrieved link record and explicitly excludes the URL field
- [ ] The function calls the translation service to translate only the `title` field from source language to target language
- [ ] The function stores only the translated title in the `link_translations` table using UPSERT logic with the original URL preserved unchanged
- [ ] The UPSERT operation associates the translation with the correct link identifier and target language code
- [ ] Upon successful translation and storage, the function updates the job status to 'completed' in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to 'failed' with error details indicating the link could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to 'failed' with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to 'failed' with error details indicating the translation could not be persisted
- [ ] The function is exported from `/src/lib/content-translation/processors/link-processor.ts`
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1
- [ ] The processor explicitly validates that URL fields are never sent to the translation service

---

## User Impact

- **Property Owners**: Link titles are automatically translated without manual intervention, while the actual links continue to work
- **Guests**: See translated link titles that describe the destination (e.g., "How to use the coffee machine" in French), while clicking takes them to the correct URL
- **System**: Reliable processing of link translation jobs with proper status tracking and explicit URL protection

---

## Business Value

Enables automated multilingual link title delivery by implementing the core processing logic that bridges translation job queues with actual translation execution and storage. This ensures:

- Links remain functional across all languages
- International guests understand what each link represents
- No broken links due to URL translation errors
- Property owners don't need to manually manage link translations

---

## Comparison with Item/Article Processors

| Aspect | Item Processor (REQ-272) | Article Processor (REQ-273) | Link Processor (REQ-274) |
|--------|--------------------------|-----------------------------|-----------------------------|
| Fields to Translate | `name`, `description` | `title`, `description` | `title` only |
| Protected Fields | None | None | **`url` - NEVER translate** |
| Translation Contexts | 2 | 2 | 1 |
| Complexity | Medium | Medium | **Small** |
| Storage Table | `item_translations` | `article_translations` | `link_translations` |

---

## Testing Strategy

### Unit Tests

```typescript
describe('processLinkTranslation', () => {
  it('should successfully translate link title only', async () => {
    // Mock link fetch, translation service, storage
    const result = await processLinkTranslation({
      linkId: 'test-link-id',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(true);
    expect(result.translatedTitle).toBeDefined();
    expect(result.jobStatus).toBe('completed');
  });

  it('should NOT translate URL', async () => {
    // Verify that translateText is only called for title, not URL
    const translateTextMock = jest.fn();

    await processLinkTranslation({...});

    // Should only be called once (for title)
    expect(translateTextMock).toHaveBeenCalledTimes(1);
    // Should be called with title, not URL
    expect(translateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Original Title' })
    );
    expect(translateTextMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('http') })
    );
  });

  it('should handle link not found error', async () => {
    // Mock link fetch returning null
    const result = await processLinkTranslation({
      linkId: 'non-existent-id',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
    expect(result.jobStatus).toBe('failed');
  });

  it('should handle empty title', async () => {
    // Mock link with empty title
    const result = await processLinkTranslation({
      linkId: 'link-with-empty-title',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      jobId: 'test-job-id'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('no title');
    expect(result.jobStatus).toBe('failed');
  });

  it('should handle translation service failure', async () => {
    // Mock translation service throwing error
    const result = await processLinkTranslation({...});

    expect(result.success).toBe(false);
    expect(result.jobStatus).toBe('failed');
  });
});
```

### Integration Tests

- Test with actual database and mocked translation service
- Verify UPSERT behavior (create new, update existing)
- Verify job status updates in translation_jobs table
- Verify URL is never modified or stored in translation tables

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: File structure & types | 10 min | Low |
| Task 2: Link data fetching | 10 min | Low |
| Task 3: Title translation | 10 min | Low |
| Task 4: Storage integration | 10 min | Low |
| Task 5: Job status updates | 10 min | Low |
| Task 6: Main processor function | 20 min | Low |
| Export and integration | 10 min | Low |
| **Total** | **~1.5 hours** | **Small** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| URL accidentally translated | Low | Critical | Multiple validation layers, explicit exclusion |
| Link not found errors | Medium | Low | Graceful error handling, clear error messages |
| Translation service errors | Medium | Low | Retry mechanism in job processor |
| Empty title edge case | Low | Low | Validation before translation |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-274)
- Translation Storage: REQ-263 (`storeLinkTranslation`)
- Job Processor: REQ-271 (`processTranslationJob` routing)
- Item Processor Pattern: REQ-272 (`processItemTranslation`)
- Article Processor Pattern: REQ-273 (`processArticleTranslation`)
- Service Pattern: `/src/lib/email-service.ts`
- Database Types: `/src/lib/supabase.ts` (`item_links` table)

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3, Task 3.4 - Implement Link Translation Processor*
