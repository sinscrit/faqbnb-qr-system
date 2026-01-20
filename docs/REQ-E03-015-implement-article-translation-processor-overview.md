# REQ-E03-015: Implement Article Translation Processor - Implementation Overview

**Document Created:** 2026-01-20 17:55 UTC
**Last Modified:** 2026-01-20 17:55 UTC
**Request ID:** REQ-E03-015
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.3
**Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** REQ-E03-013 (Enhance Job Processor for Content-Specific Handling), REQ-E03-005 (Translation Storage Utilities)

---

## 1. Summary

Implement a specialized processor function for article translation jobs that retrieves article records from the `item_articles` table, translates `title` and `description` fields using the translation service, persists results to the `article_translations` table, and manages job status throughout the workflow. This processor integrates with the job processor routing established in REQ-E03-013 and follows the same patterns as the item translation processor (REQ-E03-014).

---

## 2. Requirements Analysis

### 2.1 Source Request

From `docs/gen_requests_epic3.md` - Request #15:

> **REQ-E03-015: Implement Article Translation Processor**
>
> The system must provide a specialized processor function that retrieves article records, translates article fields, persists the translations, and updates job status.
>
> **Key Requirements:**
> - Accept translation job containing article ID, target language, and job metadata
> - Retrieve article record from database
> - Translate `title` and `description` fields
> - Store results in `article_translations` table
> - Update job status (completed/failed)
> - Handle errors with appropriate retry logic

### 2.2 Implementation Plan Reference

From `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`:

**Phase 3 - Task 3.3:**
```
- [ ] **Task 3.3:** Implement article translation processor
  - Fetch article by ID
  - Translate `title` and `description` fields
  - Store in `article_translations` table
  - Update job status
```

### 2.3 Acceptance Criteria

- [ ] Function accepts a translation job object containing article ID, target language, and job metadata
- [ ] Function queries the database to retrieve the article record by ID
- [ ] Function handles missing or deleted articles with appropriate error status
- [ ] Function extracts title and description fields from the article record
- [ ] Function prepares translation request with both fields in a single API call
- [ ] Function calls the translation service with source language, target language, and field data
- [ ] Function handles translation service errors with retry logic for transient failures
- [ ] Function handles translation service timeouts with appropriate error status
- [ ] Function receives translated title and description from the translation service response
- [ ] Function calls the article translation storage utility from REQ-E03-005
- [ ] Function passes article ID, target language, and translated fields to storage utility
- [ ] Function marks job as completed in the job queue upon successful storage
- [ ] Function records completion timestamp in the job record
- [ ] Function marks job as failed with error details when any stage fails
- [ ] Function increments retry counter for transient errors (network, timeout, rate limit)
- [ ] Function does not retry for permanent errors (invalid article ID, unsupported language)
- [ ] Function respects maximum retry limits defined in job configuration
- [ ] Function logs all significant events (start, completion, errors) for troubleshooting
- [ ] TypeScript types are properly defined for job objects, responses, and error states
- [ ] Function is exported from the content translation module
- [ ] Function integrates cleanly with the job processor routing logic from REQ-E03-013

---

## 3. Technical Context

### 3.1 Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Generic Job Processor | `/src/lib/job-queue/job-processor.ts` | Exists - has basic article handling |
| Translation Jobs Module | `/src/lib/job-queue/translation-jobs.ts` | Exists |
| Translation Service | `/src/lib/translation-service/translation-service.ts` | Exists |
| Job Types | `/src/lib/job-queue/translation-jobs.types.ts` | Exists |
| Database Types | `/src/lib/supabase.ts` | Exists |
| Article Translations Table | `article_translations` | Exists in database |

### 3.2 Database Schema

**Source Table: `item_articles`** (lines 316-359 in `/src/lib/supabase.ts`)
```typescript
item_articles: {
  Row: {
    id: string
    item_id: string
    purpose: string  // PurposeType
    title: string
    description: string | null
    display_order: number | null
    created_at: string | null
    updated_at: string | null
    source_language: string | null  // Added by Epic 1
  }
}
```

**Target Table: `article_translations`** (lines 360-414 in `/src/lib/supabase.ts`)
```typescript
article_translations: {
  Row: {
    id: string
    article_id: string      // FK to item_articles
    language: string        // Target language code
    title: string           // Translated title
    description: string | null
    translation_status: string  // 'completed', 'pending', 'failed', 'manual'
    translated_at: string | null
    reviewed_by: string | null
    created_at: string | null
    updated_at: string | null
  }
}
```

### 3.3 Translation Job Structure

From `/src/lib/job-queue/translation-jobs.types.ts`:
```typescript
export interface TranslationJob {
  id: string;
  entityType: EntityType;     // 'article' for article jobs
  entityId: string;           // Article ID (UUID)
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;          // 'queued' | 'processing' | 'completed' | 'failed'
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}
```

### 3.4 Existing Generic Implementation

The generic job processor in `/src/lib/job-queue/job-processor.ts` already handles articles through:

1. **Content Fetching** (lines 158-179):
```typescript
case 'article': {
  const { data, error } = await supabaseAdmin
    .from('item_articles')
    .select('title, description, source_language')
    .eq('id', entityId)
    .single();
  // Returns: { entityType, entityId, sourceLanguage, fields: { title, description } }
}
```

2. **Translation Storage** (lines 283-306):
```typescript
case 'article': {
  const { error } = await supabaseAdmin
    .from('article_translations')
    .upsert({
      article_id: entityId,
      language: targetLanguage,
      title: translatedFields.title,
      description: translatedFields.description || null,
      translation_status: 'completed',
      translated_at: now,
      updated_at: now,
    }, { onConflict: 'article_id,language' });
}
```

3. **Translation Context** (line 402):
```typescript
article: 'FAQ article in vacation rental property context. Help guide for guests.',
```

---

## 4. Proposed Implementation

### 4.1 Architecture Decision

**Option A: Extend Generic Processor** - Enhance the existing `processJob()` function in `job-processor.ts` with specialized article handling.

**Option B: Create Dedicated Processor** (Recommended) - Create a new specialized `processArticleTranslation()` function in `/src/lib/content-translation/processors/article-processor.ts` that provides:
- Enhanced error classification (permanent vs transient)
- Detailed logging for article-specific operations
- Better retry logic with exponential backoff
- Integration with storage utilities from REQ-E03-005
- Cleaner separation of concerns for maintainability

**Recommendation:** Option B aligns with the implementation plan which specifies creating dedicated processors per entity type and integrating with the routing logic from REQ-E03-013.

### 4.2 Processor Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│                    processArticleTranslation(job)                   │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ 1. VALIDATION                                                       │
│    - Verify job.entityType === 'article'                           │
│    - Validate job.entityId is valid UUID                           │
│    - Validate targetLanguage is supported                          │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ 2. FETCH ARTICLE                                                    │
│    - Query item_articles table by ID                               │
│    - Handle not found → permanent error (no retry)                 │
│    - Extract: title, description, source_language                  │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ 3. TRANSLATE FIELDS                                                 │
│    - Translate title (required)                                     │
│    - Translate description (if not null/empty)                     │
│    - Apply article-specific translation context                    │
│    - Handle rate limits → transient error (retry)                  │
│    - Handle timeouts → transient error (retry)                     │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ 4. STORE TRANSLATION                                                │
│    - Call storeArticleTranslation() from storage utilities         │
│    - UPSERT to article_translations table                          │
│    - Set translation_status = 'completed'                          │
│    - Record translated_at timestamp                                │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ 5. UPDATE JOB STATUS                                                │
│    - On success: markJobCompleted(job.id)                          │
│    - On failure: markJobFailed(job.id, errorMessage)               │
│    - Increment attempts for transient errors                       │
│    - Return processing result                                       │
└────────────────────────────────────────────────────────────────────┘
```

### 4.3 Error Classification Strategy

| Error Type | Classification | Action | Examples |
|------------|----------------|--------|----------|
| Article not found | Permanent | No retry, mark failed | UUID not in database |
| Invalid UUID format | Permanent | No retry, mark failed | Malformed ID |
| Unsupported language | Permanent | No retry, mark failed | Invalid language code |
| Max retries exceeded | Permanent | No retry, mark failed | attempts >= 3 |
| Rate limit exceeded | Transient | Retry with backoff | 429 response |
| Network timeout | Transient | Retry | Connection timeout |
| Service unavailable | Transient | Retry | 502, 503 response |
| Database connection error | Transient | Retry | Temporary DB issues |

### 4.4 Translation Context

```typescript
const ARTICLE_TITLE_CONTEXT: TranslationContext = {
  contentType: 'article_title',
  domainContext: 'Title of an instruction article for vacation rental guests. Should be clear and descriptive.',
  maxLength: 255,
  tone: 'concise',
};

const ARTICLE_DESCRIPTION_CONTEXT: TranslationContext = {
  contentType: 'article_description',
  domainContext: 'FAQ article content in vacation rental property context. Help guide for guests with instructions or troubleshooting.',
  tone: 'friendly',
};
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/processors/article-processor.ts` | Main article translation processor implementation |
| `/src/lib/content-translation/processors/article-processor.types.ts` | Type definitions for article processor |
| `/src/lib/content-translation/processors/__tests__/article-processor.test.ts` | Unit tests for article processor |

### 5.2 Files to Modify

| File Path | Changes Required | Lines Affected |
|-----------|------------------|----------------|
| `/src/lib/content-translation/index.ts` | Add export for article processor | Add new export |
| `/src/lib/job-queue/job-processor.ts` | Integrate with specialized article processor (optional, based on routing strategy) | Lines 446-542 (processJob function) |

### 5.3 Functions to Implement

**New Functions:**

| Function | Location | Signature |
|----------|----------|-----------|
| `processArticleTranslation` | `article-processor.ts` | `(job: TranslationJob) => Promise<ArticleProcessingResult>` |
| `fetchArticleForTranslation` | `article-processor.ts` | `(articleId: string) => Promise<ArticleContent \| null>` |
| `translateArticleFields` | `article-processor.ts` | `(content: ArticleContent, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage) => Promise<TranslatedArticleFields>` |
| `classifyArticleError` | `article-processor.ts` | `(error: unknown, job: TranslationJob) => ErrorClassification` |

**Existing Functions to Use:**

| Function | Location | Usage |
|----------|----------|-------|
| `translateText` | `/src/lib/translation-service/translation-service.ts` | Call translation API |
| `markJobCompleted` | `/src/lib/job-queue/translation-jobs.ts` | Mark job as completed |
| `markJobFailed` | `/src/lib/job-queue/translation-jobs.ts` | Mark job as failed |
| `storeArticleTranslation` | `/src/lib/content-translation/storage/translation-storage.ts` | UPSERT to translations table (from REQ-E03-005) |
| `createLockHeartbeat` | `/src/lib/job-queue/concurrency-control.ts` | Prevent lock timeout during processing |

---

## 6. Type Definitions

### 6.1 Article Processor Types

```typescript
// /src/lib/content-translation/processors/article-processor.types.ts

import type { TranslationJob, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

/**
 * Article content fetched from database for translation
 */
export interface ArticleContent {
  id: string;
  title: string;
  description: string | null;
  sourceLanguage: SupportedLanguage;
}

/**
 * Translated article fields after translation service call
 */
export interface TranslatedArticleFields {
  title: string;
  description?: string | null;
}

/**
 * Result of processing an article translation job
 */
export interface ArticleProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'article';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: TranslatedArticleFields;
  errorMessage?: string;
  errorType?: 'permanent' | 'transient';
  processingTimeMs: number;
}

/**
 * Error classification for retry decisions
 */
export interface ErrorClassification {
  type: 'permanent' | 'transient';
  message: string;
  shouldRetry: boolean;
}
```

---

## 7. Implementation Details

### 7.1 Main Processor Function

```typescript
/**
 * Process a single article translation job
 *
 * @param job - The translation job to process
 * @returns Processing result with success/failure and translated content
 */
export async function processArticleTranslation(
  job: TranslationJob
): Promise<ArticleProcessingResult> {
  const startTime = Date.now();
  const { entityId: articleId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch article content
    const article = await fetchArticleForTranslation(articleId);
    if (!article) {
      throw new PermanentError(`Article not found: ${articleId}`);
    }

    // 2. Translate fields
    const translatedFields = await translateArticleFields(
      article,
      sourceLanguage,
      targetLanguage
    );

    // 3. Store translation
    const saved = await storeArticleTranslation(
      articleId,
      targetLanguage,
      translatedFields
    );
    if (!saved) {
      throw new Error('Failed to save article translation to database');
    }

    // 4. Mark job completed
    await markJobCompleted(job.id);

    return {
      jobId: job.id,
      success: true,
      entityType: 'article',
      entityId: articleId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const classification = classifyArticleError(error, job);

    await markJobFailed(job.id, classification.message);

    return {
      jobId: job.id,
      success: false,
      entityType: 'article',
      entityId: articleId,
      targetLanguage,
      errorMessage: classification.message,
      errorType: classification.type,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

### 7.2 Article Fetch Function

```typescript
/**
 * Fetch article content from database for translation
 *
 * @param articleId - UUID of the article
 * @returns Article content or null if not found
 */
async function fetchArticleForTranslation(
  articleId: string
): Promise<ArticleContent | null> {
  const { data, error } = await supabaseAdmin
    .from('item_articles')
    .select('id, title, description, source_language')
    .eq('id', articleId)
    .single();

  if (error || !data) {
    console.error('[ArticleProcessor] Failed to fetch article:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
  };
}
```

### 7.3 Translation Function

```typescript
/**
 * Translate article title and description fields
 *
 * @param article - Article content to translate
 * @param sourceLanguage - Source language code
 * @param targetLanguage - Target language code
 * @returns Translated fields
 */
async function translateArticleFields(
  article: ArticleContent,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslatedArticleFields> {
  // Translate title (required)
  const titleResult = await translateText(
    article.title,
    sourceLanguage,
    targetLanguage,
    { context: ARTICLE_TITLE_CONTEXT }
  );

  // Translate description (optional)
  let translatedDescription: string | null = null;
  if (article.description && article.description.trim() !== '') {
    const descResult = await translateText(
      article.description,
      sourceLanguage,
      targetLanguage,
      { context: ARTICLE_DESCRIPTION_CONTEXT }
    );
    translatedDescription = descResult.translatedText;
  }

  return {
    title: titleResult.translatedText,
    description: translatedDescription,
  };
}
```

---

## 8. Integration Points

### 8.1 Job Processor Routing (REQ-E03-013)

The article processor integrates with the job processor routing:

```typescript
// In job-processor.ts processJob() or enhanced routing
switch (job.entityType) {
  case 'item':
    return await processItemTranslation(job);
  case 'article':
    return await processArticleTranslation(job);  // <-- Integration point
  case 'link':
    return await processLinkTranslation(job);
  case 'tag':
    return await processTagTranslation(job);
}
```

### 8.2 Storage Utilities (REQ-E03-005)

Uses the `storeArticleTranslation()` function from REQ-E03-005:

```typescript
import { storeArticleTranslation } from '@/lib/content-translation/storage/translation-storage';

// In processArticleTranslation:
const saved = await storeArticleTranslation(
  articleId,
  targetLanguage,
  {
    title: translatedFields.title,
    description: translatedFields.description,
  }
);
```

### 8.3 Translation Service

Uses existing translation service from Epic 1:

```typescript
import { translateText } from '@/lib/translation-service';
```

### 8.4 Job Queue Functions

Uses existing job queue functions:

```typescript
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import { createLockHeartbeat } from '@/lib/job-queue/concurrency-control';
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

| Test Case | Description |
|-----------|-------------|
| `should process article with title and description` | Full successful processing |
| `should process article with title only (null description)` | Handle null description |
| `should handle article not found` | Return permanent error |
| `should handle translation service timeout` | Classify as transient |
| `should handle rate limit errors` | Classify as transient, allow retry |
| `should mark job completed on success` | Verify job status update |
| `should mark job failed on error` | Verify error handling |
| `should not retry permanent errors` | Verify error classification |
| `should use correct translation context for title` | Verify context usage |
| `should use correct translation context for description` | Verify context usage |

### 9.2 Integration Tests

| Test Case | Description |
|-----------|-------------|
| `should save translation to article_translations table` | Database integration |
| `should handle concurrent processing` | Concurrency control |
| `should integrate with job processor routing` | End-to-end processing |

---

## 10. Dependencies

### 10.1 Prerequisites

- [x] REQ-E03-005: Translation Storage Utilities - must provide `storeArticleTranslation()`
- [x] REQ-E03-013: Enhanced Job Processor Routing - must support article entity type
- [x] Epic 1 Translation Service - must be operational
- [x] Epic 1 Job Queue Infrastructure - must be operational
- [x] Database tables: `item_articles`, `article_translations`, `translation_jobs`

### 10.2 Downstream Dependents

- REQ-E03-009: Modify Articles API - triggers article translation jobs that this processor handles
- Epic 4 Guest Experience - consumes translated articles

---

## 11. Effort Estimate

| Task | Estimate |
|------|----------|
| Create article-processor.ts with main function | 2 hours |
| Implement error classification logic | 1 hour |
| Add translation context definitions | 30 minutes |
| Integrate with job processor routing | 1 hour |
| Write unit tests | 2 hours |
| Write integration tests | 1.5 hours |
| Documentation and code review | 1 hour |
| **Total** | **9 hours** |

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API rate limiting | Medium | Low | Retry with exponential backoff |
| Article deleted during processing | Low | Low | Handle not found gracefully |
| Database connection issues | Low | Medium | Transient error classification with retry |
| Translation quality issues | Medium | Medium | Rich context, allow manual override (Epic 5) |
| Long descriptions timeout | Low | Low | Monitor, consider chunking in future |

---

## 13. Open Questions

1. **Q:** Should we batch translate title and description in a single API call?
   **A:** Current implementation makes separate calls with field-specific context for better quality. Can optimize later if needed.

2. **Q:** What is the maximum description length we should handle?
   **A:** No explicit limit in schema. Translation service handles gracefully. Monitor in production.

3. **Q:** Should we preserve HTML formatting in descriptions?
   **A:** Descriptions are plain text in current schema. If HTML added later, update translation context.

---

## 14. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` (REQ-E03-015)
- Generic Job Processor: `/src/lib/job-queue/job-processor.ts`
- Translation Service: `/src/lib/translation-service/translation-service.ts`
- Database Types: `/src/lib/supabase.ts` (lines 316-414)
- Job Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Item Processor (Reference Pattern): REQ-E03-014

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 3.3: Implement Article Translation Processor*
