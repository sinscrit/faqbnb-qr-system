# Implementation Breakdown: REQ-E03-016 - Implement Link Translation Processor

**Document Generated:** 2026-01-20 16:45 UTC
**Last Modified:** 2026-01-20 16:45 UTC
**Request ID:** REQ-E03-016
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.4
**Size:** S (Small)
**Type:** NEW FEATURE

---

## 1. Overview

### 1.1 Summary

This task implements a specialized processor function that handles link translation jobs within the translation job queue infrastructure. The processor retrieves link records from the database, translates only the title field (explicitly excluding URLs), persists the translated title to the `link_translations` table using an UPSERT pattern, and manages job status throughout the workflow.

### 1.2 Business Context

Links in FAQBNB provide references to external resources (YouTube videos, PDFs, images) that help guests understand how to use property items. While the URL must remain unchanged to preserve functionality, the link title needs translation so international guests can understand what the linked resource contains before clicking.

### 1.3 Technical Context

This processor is part of the Epic 3 Translation Job Processing Enhancement (Phase 3) and follows patterns established by:
- REQ-E03-014: Item Translation Processor (translates name + description)
- REQ-E03-015: Article Translation Processor (translates title + description)

The key difference is that links have only ONE translatable field (`title`), making this the simplest of the content translation processors.

---

## 2. Dependencies

### 2.1 Upstream Dependencies

| Dependency | Type | Status | Description |
|------------|------|--------|-------------|
| Epic 1 Foundation | Epic | Required | Translation service, job queue infrastructure |
| REQ-E03-001 | Task | Required | Content translation module structure and types |
| REQ-E03-005 | Task | Required | Translation storage utilities (storeLinkTranslation) |
| REQ-E03-013 | Task | Required | Job processor routing dispatches to processLinkTranslation |

### 2.2 Downstream Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| REQ-E03-010 | Task | Links API modification triggers link translations |
| Epic 4 | Epic | Guest experience consumes translated link titles |
| Epic 5 | Epic | Owner management of link translations |

### 2.3 External Dependencies

| Dependency | Purpose |
|------------|---------|
| Supabase Admin Client | Database access for link retrieval and translation storage |
| Translation Service (Epic 1) | Performs the actual text translation via Claude/OpenAI |

---

## 3. Requirements Analysis

### 3.1 Functional Requirements

From REQ-E03-016 request specification:

1. **Data Retrieval**
   - Accept translation job specification with link ID, target language, and job metadata
   - Query database to retrieve link record by ID
   - Handle cases where link no longer exists or has been deleted
   - Return appropriate error status if link cannot be found

2. **Field Extraction and Translation**
   - Extract ONLY the title field from the link record
   - Explicitly EXCLUDE the URL field from translation (preserve link functionality)
   - Prepare translation request with only the title field
   - Submit to translation service with source/target language from job metadata
   - Handle translation service errors and timeouts

3. **Storage**
   - Receive translated title from translation service
   - Invoke link translation storage utility from REQ-E03-005
   - Pass link ID, target language, and translated title
   - Use UPSERT pattern for both new translations and updates
   - Record translation metadata (timestamp, source version)

4. **Job Status Management**
   - Mark job as completed upon successful storage
   - Record completion timestamp in job record
   - Mark job as failed with detailed error information on failure
   - Respect job retry policies and backoff intervals
   - Increment retry counters for transient failures

### 3.2 Non-Functional Requirements

- **Performance:** Process individual link translation jobs within 30 seconds
- **Reliability:** Handle transient failures with retry logic; permanent failures logged clearly
- **Observability:** Log all significant events (start, completion, errors) for troubleshooting
- **Type Safety:** Full TypeScript type definitions for all inputs and outputs

---

## 4. Technical Design

### 4.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    Job Processor Router                          │
│              (processTranslationJob switch)                      │
└────────────────────────┬─────────────────────────────────────────┘
                         │ entityType === 'link'
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│               processLinkTranslation(job)                        │
├──────────────────────────────────────────────────────────────────┤
│  1. Fetch link record from item_links table                      │
│  2. Extract title field only (exclude URL, thumbnail)            │
│  3. Call translateText() with link_title context                 │
│  4. Store in link_translations via UPSERT                        │
│  5. Update job status (completed/failed)                         │
└──────────────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ item_links│  │ Translation│  │link_trans-│
    │  (read)   │  │  Service   │  │ lations   │
    └───────────┘  └───────────┘  │  (write)  │
                                  └───────────┘
```

### 4.2 Data Flow

```
Translation Job (entityType: 'link')
    │
    ├── 1. Read link from item_links
    │       SELECT title, source_language
    │       FROM item_links WHERE id = ?
    │
    ├── 2. Validate link exists
    │       IF NOT FOUND → markJobFailed('Link not found')
    │
    ├── 3. Call Translation Service
    │       translateText({
    │         text: link.title,
    │         sourceLanguage: job.sourceLanguage,
    │         targetLanguage: job.targetLanguage,
    │         context: { contentType: 'link_title', ... }
    │       })
    │
    ├── 4. Handle Translation Result
    │       IF ERROR → retry or markJobFailed(error)
    │
    ├── 5. Store Translation
    │       UPSERT INTO link_translations
    │       (link_id, language, title, translation_status, translated_at)
    │
    └── 6. Update Job Status
            markJobCompleted() or markJobFailed()
```

### 4.3 Database Schema Reference

**Source Table: item_links**
```sql
CREATE TABLE item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id),
  article_id UUID REFERENCES item_articles(id),
  title TEXT NOT NULL,              -- TRANSLATABLE
  url TEXT NOT NULL,                -- NOT TRANSLATABLE
  link_type TEXT NOT NULL,          -- NOT TRANSLATABLE
  thumbnail_url TEXT,               -- NOT TRANSLATABLE
  source_language TEXT DEFAULT 'en', -- Source language for translation
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Target Table: link_translations**
```sql
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language TEXT NOT NULL,           -- ISO 639-1 code (fr, es, de, nl, it)
  title TEXT NOT NULL,              -- Translated title
  translation_status TEXT NOT NULL, -- 'completed', 'failed', 'manual'
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(link_id, language)         -- Composite unique constraint
);
```

### 4.4 Function Signature

```typescript
/**
 * Process a link translation job
 *
 * Fetches the link record, translates the title field only,
 * stores the translation, and updates job status.
 *
 * @param job - Translation job specification
 * @returns Promise<ProcessorResult> - Result with success flag and details
 */
export async function processLinkTranslation(
  job: TranslationJob
): Promise<ProcessorResult>;

interface ProcessorResult {
  success: boolean;
  translatedFields?: { title: string };
  error?: string;
}
```

### 4.5 Error Handling Strategy

| Error Type | Behavior | Retry? |
|------------|----------|--------|
| Link not found (deleted) | Mark job failed with 'Entity not found' | No |
| Database connection error | Log error, increment retry counter | Yes |
| Translation service timeout | Log error, increment retry counter | Yes |
| Translation service rate limit | Log error, increment retry counter with backoff | Yes |
| Invalid language code | Mark job failed with 'Unsupported language' | No |
| Storage UPSERT failure | Log error, increment retry counter | Yes |
| Unexpected exception | Log full stack trace, mark job failed | No |

### 4.6 Translation Context

```typescript
const LINK_TRANSLATION_CONTEXT: TranslationContext = {
  contentType: 'link_title',
  domainContext: 'Resource link title for vacation rental property instructions. External reference to video, PDF, or other media.',
  maxLength: 255,
  tone: 'concise',
};
```

---

## 5. Implementation Tasks

### Task 5.1: Create Link Translation Processor Function

**Location:** `/src/lib/job-queue/processors/link-processor.ts` (new file)
OR extend `/src/lib/job-queue/job-processor.ts`

**Implementation Steps:**

1. Create the `processLinkTranslation` function
2. Implement link record fetching from `item_links` table
3. Validate link exists and extract title field
4. Call translation service with link_title context
5. Store translation via UPSERT into `link_translations`
6. Update job status appropriately

**Estimated Lines of Code:** 80-120 lines

### Task 5.2: Integrate with Job Processor Router

**Location:** `/src/lib/job-queue/job-processor.ts`

**Implementation Steps:**

1. Import `processLinkTranslation` if separate file
2. Add case 'link' to the switch statement in `processTranslationJob`
3. Ensure proper logging with `[LinkProcessor]` prefix

**Estimated Lines of Code:** 5-10 lines (integration)

### Task 5.3: Add Unit Tests

**Location:** `/src/lib/job-queue/__tests__/link-processor.test.ts` (new file)

**Test Cases:**
- Successfully processes valid link translation job
- Handles missing link gracefully (marks failed)
- Handles translation service errors with retry
- Stores translation with correct UPSERT
- Updates job status on success
- Updates job status on failure
- Excludes URL from translation request
- Uses correct translation context

---

## 6. Authorized Files and Functions for Modification

### 6.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/processors/link-processor.ts` | Link translation processor implementation |
| `/src/lib/job-queue/__tests__/link-processor.test.ts` | Unit tests for link processor |

### 6.2 Files to Modify

| File Path | Function/Section | Change Description |
|-----------|------------------|---------------------|
| `/src/lib/job-queue/job-processor.ts` | `processTranslationJob()` | Add case for 'link' entity type routing |
| `/src/lib/job-queue/job-processor.ts` | `fetchEntityContent()` | Ensure link case exists (may already be implemented) |
| `/src/lib/job-queue/job-processor.ts` | `saveTranslation()` | Ensure link case exists (may already be implemented) |
| `/src/lib/job-queue/index.ts` | exports | Export `processLinkTranslation` if separate file |

### 6.3 Functions to Implement

| Function | Location | Description |
|----------|----------|-------------|
| `processLinkTranslation(job: TranslationJob)` | link-processor.ts | Main processor function |
| `fetchLinkContent(linkId: string)` | link-processor.ts | Fetch link from database |
| `translateLinkTitle(title: string, sourceLanguage, targetLanguage)` | link-processor.ts | Call translation service |
| `storeLinkTranslation(linkId, language, title)` | link-processor.ts | UPSERT translation record |

### 6.4 Functions to Use (Dependencies)

| Function | Location | Purpose |
|----------|----------|---------|
| `translateText()` | `/src/lib/translation-service` | Perform text translation |
| `markJobCompleted()` | `/src/lib/job-queue/translation-jobs.ts` | Update job status |
| `markJobFailed()` | `/src/lib/job-queue/translation-jobs.ts` | Update job status with error |
| `createSupabaseAdminClient()` | `/src/lib/supabase.ts` | Database access |

---

## 7. Acceptance Criteria Verification

| Criterion | Implementation | Verification Method |
|-----------|----------------|---------------------|
| Function accepts translation job with link ID | Function signature validation | Type checking |
| Queries database to retrieve link by ID | `fetchLinkContent()` with SELECT | Unit test + DB query log |
| Handles missing links with error status | Return `{ success: false, error: 'Link not found' }` | Unit test |
| Extracts only title field | Only `title` in translation request payload | Unit test + log verification |
| Excludes URL field | URL never passed to `translateText()` | Unit test assertion |
| Calls translation service correctly | `translateText()` with link_title context | Unit test mock verification |
| Handles translation errors with retry | Try-catch, increment retry counter | Unit test |
| Handles translation timeouts | Timeout catch, retry with backoff | Unit test |
| Receives translated title | Destructure `translatedText` from result | Unit test |
| Stores via UPSERT | `onConflict: 'link_id,language'` in upsert | Unit test + DB verification |
| Marks job completed on success | `markJobCompleted(jobId)` called | Unit test mock verification |
| Records completion timestamp | Job record updated with `completed_at` | Unit test |
| Marks job failed on error | `markJobFailed(jobId, errorMessage)` called | Unit test mock verification |
| Retry for transient errors | Increment `attempts`, re-queue | Unit test |
| No retry for permanent errors | Mark failed immediately | Unit test |
| Respects max retry limits | Check `attempts >= maxRetries` | Unit test |
| Logs significant events | Console.log with [LinkProcessor] prefix | Log output verification |
| TypeScript types defined | All params/returns typed | Type compilation |
| Exported from module | Export in index.ts | Import test |
| Integrates with job router | Case 'link' in switch | Integration test |

---

## 8. Code Examples

### 8.1 Main Processor Function Pattern

```typescript
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import type { TranslationJob, SupportedLanguage } from '@/lib/translation-service/translation-service.types';

interface ProcessorResult {
  success: boolean;
  translatedFields?: { title: string };
  error?: string;
}

export async function processLinkTranslation(
  job: TranslationJob
): Promise<ProcessorResult> {
  const { entityId: linkId, sourceLanguage, targetLanguage, id: jobId } = job;

  console.log('[LinkProcessor] Starting link translation', {
    jobId,
    linkId,
    sourceLanguage,
    targetLanguage,
  });

  try {
    // 1. Fetch link record
    const { data: link, error: fetchError } = await supabaseAdmin
      .from('item_links')
      .select('title, source_language')
      .eq('id', linkId)
      .single();

    if (fetchError || !link) {
      console.error('[LinkProcessor] Link not found', { linkId, error: fetchError });
      await markJobFailed(jobId, 'Link not found or deleted');
      return { success: false, error: 'Link not found' };
    }

    // 2. Translate title field only (URL is never translated)
    const translationResult = await translateText(
      link.title,
      sourceLanguage,
      targetLanguage,
      {
        contentType: 'link_title',
        domainContext: 'Resource link title for vacation rental property instructions.',
        maxLength: 255,
      }
    );

    if (!translationResult.success) {
      console.error('[LinkProcessor] Translation failed', { error: translationResult.error });
      // Transient error - will be retried
      return { success: false, error: translationResult.error };
    }

    // 3. Store translation with UPSERT
    const now = new Date().toISOString();
    const { error: storeError } = await supabaseAdmin
      .from('link_translations')
      .upsert(
        {
          link_id: linkId,
          language: targetLanguage,
          title: translationResult.translatedText,
          translation_status: 'completed',
          translated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'link_id,language',
        }
      );

    if (storeError) {
      console.error('[LinkProcessor] Failed to store translation', { error: storeError });
      return { success: false, error: 'Failed to store translation' };
    }

    // 4. Mark job completed
    await markJobCompleted(jobId);

    console.log('[LinkProcessor] Successfully completed', {
      jobId,
      linkId,
      targetLanguage,
    });

    return {
      success: true,
      translatedFields: { title: translationResult.translatedText },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[LinkProcessor] Unexpected error', { jobId, linkId, error });
    await markJobFailed(jobId, errorMessage);
    return { success: false, error: errorMessage };
  }
}
```

### 8.2 Job Router Integration

```typescript
// In /src/lib/job-queue/job-processor.ts
async function processTranslationJob(job: TranslationJob): Promise<void> {
  switch (job.entityType) {
    case 'item':
      await processItemTranslation(job);
      break;
    case 'article':
      await processArticleTranslation(job);
      break;
    case 'link':
      await processLinkTranslation(job);  // Add this case
      break;
    case 'tag':
      await processTagTranslation(job);
      break;
    default:
      console.error('[JobProcessor] Unknown entity type', { entityType: job.entityType });
      await markJobFailed(job.id, `Unknown entity type: ${job.entityType}`);
  }
}
```

---

## 9. Testing Strategy

### 9.1 Unit Test Cases

```typescript
describe('processLinkTranslation', () => {
  it('should successfully translate a link title', async () => {
    // Setup: Mock link exists, translation succeeds
    // Act: Call processLinkTranslation(job)
    // Assert: Translation stored, job marked completed
  });

  it('should return error for non-existent link', async () => {
    // Setup: Mock link not found
    // Act: Call processLinkTranslation(job)
    // Assert: Returns { success: false, error: 'Link not found' }
  });

  it('should never include URL in translation request', async () => {
    // Setup: Mock link with URL
    // Act: Call processLinkTranslation(job)
    // Assert: translateText only called with title, not URL
  });

  it('should use UPSERT pattern for storage', async () => {
    // Setup: Translation already exists for this link/language
    // Act: Call processLinkTranslation(job)
    // Assert: Existing translation updated, not duplicated
  });

  it('should handle translation service timeout', async () => {
    // Setup: Mock translateText throws timeout error
    // Act: Call processLinkTranslation(job)
    // Assert: Returns { success: false }, retry eligible
  });
});
```

### 9.2 Integration Test Cases

- Create link via API, verify translation job created
- Process link translation job, verify translation stored
- Update link, verify old translations cleared and new job queued
- Fetch link with translations, verify correct language returned

---

## 10. Rollback Plan

If issues arise after deployment:

1. **Feature Flag:** Disable link translation processing by adding early return in `processLinkTranslation`
2. **Job Queue:** Pause link jobs by filtering entityType in job picker
3. **Database:** No schema rollback needed (additive changes only)
4. **Cleanup:** Mark all 'link' jobs as failed if complete rollback needed

---

## 11. Monitoring & Observability

### 11.1 Logs to Monitor

```
[LinkProcessor] Starting link translation
[LinkProcessor] Successfully completed
[LinkProcessor] Link not found
[LinkProcessor] Translation failed
[LinkProcessor] Failed to store translation
[LinkProcessor] Unexpected error
```

### 11.2 Metrics to Track

| Metric | Description |
|--------|-------------|
| `link_translations_processed` | Total link translations completed |
| `link_translations_failed` | Link translations that failed |
| `link_translation_duration_ms` | Time to process single link translation |
| `link_not_found_errors` | Links deleted before translation processed |

---

## 12. References

- **Request:** REQ-E03-016 in `/docs/gen_requests_epic3.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Related Processors:** REQ-E03-014 (Item), REQ-E03-015 (Article)
- **Storage Utilities:** REQ-E03-005
- **Job Queue Infrastructure:** Epic 1 Foundation

---

## 13. Appendix

### A. Link vs Item/Article Comparison

| Aspect | Item | Article | Link |
|--------|------|---------|------|
| Translatable Fields | name, description | title, description | title only |
| Non-translatable Fields | id, tags, media | id, media | url, thumbnail_url, link_type |
| Translation Table | item_translations | article_translations | link_translations |
| Complexity | Medium (2 fields) | Medium (2 fields) | Simple (1 field) |

### B. Sample Translation Job for Link

```json
{
  "id": "job-link-abc-123",
  "entityType": "link",
  "entityId": "link-xyz-789",
  "sourceLanguage": "en",
  "targetLanguage": "fr",
  "status": "queued",
  "priority": 50,
  "attempts": 0,
  "createdAt": "2026-01-20T16:00:00Z"
}
```

### C. Sample Translation Storage Record

```json
{
  "id": "trans-link-456",
  "link_id": "link-xyz-789",
  "language": "fr",
  "title": "Comment utiliser le lave-vaisselle",
  "translation_status": "completed",
  "translated_at": "2026-01-20T16:00:05Z",
  "created_at": "2026-01-20T16:00:05Z",
  "updated_at": "2026-01-20T16:00:05Z"
}
```

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 3.4: Implement Link Translation Processor*
