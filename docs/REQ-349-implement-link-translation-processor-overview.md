# REQ-349: Implement Link Translation Processor - Implementation Breakdown

**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-349
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.4

---

## Summary

Create a dedicated processor function `processLinkTranslation` that handles translation jobs specifically for links. This processor fetches the source link by ID, translates its `title` field to the target language, stores the results in the `link_translations` table, and updates the job status accordingly.

---

## Current State Analysis

### Existing Infrastructure

The codebase already has a robust job processing infrastructure from Epic 1:

1. **Job Processor Framework** (`src/lib/job-queue/job-processor.ts`):
   - `TranslationJobProcessor` class with polling-based job processing
   - Generic `processJob()` function that handles all entity types
   - `fetchEntityContent()` function that already fetches link content (lines 204-223)
   - `saveTranslation()` function that already saves link translations (lines 333-354)
   - Heartbeat mechanism for long-running jobs

2. **Translation Service** (`src/lib/translation-service/translation-service.ts`):
   - `translateText()` function for single translations
   - Provider fallback (Claude → OpenAI)
   - Rate limiting and retry logic built-in

3. **Database Tables**:
   - `item_links` table with `title`, `source_language` columns
   - `link_translations` table with `link_id`, `language`, `title`, `translation_status`, `translated_at` columns

### Gap Analysis

The current `processJob()` function in `job-processor.ts` already handles link translation via a generic switch statement. However, per the implementation plan (Task 3.4), we need to create a **dedicated** `processLinkTranslation` function that:

1. Is explicitly separated for maintainability and testing
2. Can be called directly (not just through the generic processor)
3. Has clear error handling specific to links
4. Follows the explicit contract defined in the acceptance criteria

---

## Implementation Approach

### Recommended: Extract and Enhance

Extract the link-specific logic from the generic `processJob()` into a dedicated `processLinkTranslation()` function that can be:
- Called directly by the job processor
- Called independently for manual/retry operations
- Unit tested in isolation

This follows the same pattern established by the item translation processor (REQ-348).

---

## Technical Design

### Function Signature

```typescript
/**
 * Process a translation job for a link entity
 *
 * @param jobId - The translation job ID
 * @param linkId - The link entity ID to translate
 * @param sourceLanguage - Source language code (e.g., 'en')
 * @param targetLanguage - Target language code (e.g., 'fr')
 * @returns Processing result with success status and translated fields
 */
export async function processLinkTranslation(
  jobId: string,
  linkId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<LinkTranslationResult>
```

### Return Type

```typescript
export interface LinkTranslationResult {
  success: boolean;
  jobId: string;
  linkId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: {
    title: string;
  };
  errorMessage?: string;
  processingTimeMs: number;
}
```

### Process Flow

```
processLinkTranslation(jobId, linkId, sourceLang, targetLang)
    │
    ├── 1. Fetch link from `item_links` table
    │   └── SELECT id, title, source_language FROM item_links WHERE id = ?
    │
    ├── 2. Validate link exists
    │   └── If not found → markJobFailed(jobId, 'Link not found: {linkId}')
    │
    ├── 3. Translate `title` field
    │   └── translateText(title, sourceLang, targetLang, { contentType: 'link_title' })
    │
    ├── 4. On translation failure → markJobFailed(jobId, errorMessage) → return
    │
    ├── 5. Store in link_translations table (UPSERT)
    │   └── UPSERT link_translations SET title=?, translation_status='completed'
    │
    ├── 6. On storage failure → markJobFailed(jobId, 'Failed to store translation')
    │
    └── 7. Mark job completed
        └── markJobCompleted(jobId)
```

---

## Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Purpose | Functions to Modify/Add |
|-----------|---------|------------------------|
| `src/lib/job-queue/job-processor.ts` | Main job processor module | Add `processLinkTranslation()` function, add `LinkTranslationResult` type, update `processJob()` to call dedicated processor |
| `src/lib/job-queue/index.ts` | Module exports | Add export for `processLinkTranslation` and `LinkTranslationResult` type |

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
| `item_links` | SELECT | Fetch link title |
| `link_translations` | UPSERT | Store translated content |
| `translation_jobs` | UPDATE | Mark job completed/failed (via helper functions) |

---

## Detailed Implementation Tasks

### Task 1: Define LinkTranslationResult Type
**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Add after existing type definitions (after `ItemContent` interface, ~line 123)

Add the `LinkTranslationResult` interface for the processor's return type:

```typescript
/**
 * Result of processing a link translation job
 */
export interface LinkTranslationResult {
  success: boolean;
  jobId: string;
  linkId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: {
    title: string;
  };
  errorMessage?: string;
  processingTimeMs: number;
}
```

### Task 2: Implement processLinkTranslation Function
**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Add after `saveTranslation()` function (~line 387)

Implement the dedicated processor with:
- Parameter validation
- Link fetching from database
- Translation of title field only (URLs are NOT translated)
- Storage to link_translations table
- Job status updates

```typescript
/**
 * Process a translation job for a link entity
 * Part of REQ-349: Implement Link Translation Processor
 *
 * Fetches the link by ID, translates its title field,
 * stores the result in link_translations table, and updates job status.
 *
 * @param jobId - The translation job ID
 * @param linkId - The link entity ID to translate
 * @param sourceLanguage - Source language code
 * @param targetLanguage - Target language code
 * @returns Processing result
 */
export async function processLinkTranslation(
  jobId: string,
  linkId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<LinkTranslationResult> {
  const startTime = Date.now();

  try {
    // 1. Fetch link from item_links table
    const { data: link, error: fetchError } = await supabaseAdmin
      .from('item_links')
      .select('id, title, source_language')
      .eq('id', linkId)
      .single();

    // 2. Validate link exists
    if (fetchError || !link) {
      const errorMessage = `Link not found: ${linkId}`;
      await markJobFailed(jobId, errorMessage);
      return {
        success: false,
        jobId,
        linkId,
        targetLanguage,
        errorMessage,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Use source_language from link if available, fallback to parameter
    const effectiveSourceLang = (link.source_language as SupportedLanguage) || sourceLanguage;

    // 3. Translate title field
    const translatedTitle = await translateText(
      link.title,
      effectiveSourceLang,
      targetLanguage,
      {
        context: {
          contentType: 'link_title',
          domainContext: 'Resource link title for vacation rental property instructions. External reference.',
        },
      }
    );

    // 4. Store in link_translations table
    const now = new Date().toISOString();
    const { error: saveError } = await supabaseAdmin
      .from('link_translations')
      .upsert(
        {
          link_id: linkId,
          language: targetLanguage,
          title: translatedTitle.translatedText,
          translation_status: 'completed',
          translated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'link_id,language',
        }
      );

    if (saveError) {
      const errorMessage = `Failed to store link translation: ${saveError.message}`;
      await markJobFailed(jobId, errorMessage);
      return {
        success: false,
        jobId,
        linkId,
        targetLanguage,
        errorMessage,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 5. Mark job completed
    await markJobCompleted(jobId);

    return {
      success: true,
      jobId,
      linkId,
      targetLanguage,
      translatedFields: {
        title: translatedTitle.translatedText,
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await markJobFailed(jobId, errorMessage);
    return {
      success: false,
      jobId,
      linkId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

### Task 3: Update processJob to Use Dedicated Processor
**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Modify `processJob()` function, `case 'link':` branch (~line 446-542)

Update the link case to call `processLinkTranslation()` instead of the inline logic, converting the result to the expected `JobProcessingResult` format.

### Task 4: Export New Function and Type
**File:** `src/lib/job-queue/index.ts`
**Location:** Add to existing exports

Add exports for:
- `processLinkTranslation` function
- `LinkTranslationResult` type

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| processLinkTranslation accepts job ID, link ID, source language, target language | Function signature includes all parameters |
| Function fetches link from item_links table | Uses `supabaseAdmin.from('item_links').select().eq('id', linkId)` |
| If link not found, job marked failed with error message | Calls `markJobFailed(jobId, 'Link not found: {linkId}')` |
| Title field extracted from link | Extracts `link.title` from query result |
| Translation service invoked for title field only | Calls `translateText()` for title only (URLs not translated) |
| If translation fails, job marked failed with error | Catches translation errors, calls `markJobFailed()` |
| Translated title stored in link_translations | Uses UPSERT with `onConflict: 'link_id,language'` |
| Existing translation updated (not duplicated) | UPSERT handles this automatically |
| Job marked completed after successful storage | Calls `markJobCompleted(jobId)` at end |

---

## Testing Strategy

### Unit Tests to Add

**File:** `src/lib/job-queue/__tests__/link-processor.test.ts` (new)

1. **Happy Path:**
   - Link exists with title → title translated and stored
   - Translation stored with correct language and status

2. **Error Handling:**
   - Link not found → job marked failed with "Link not found" error
   - Translation service failure → job marked failed with translation error
   - Database storage failure → job marked failed with storage error

3. **Edge Cases:**
   - Empty title string → should handle gracefully
   - Same source and target language → skip translation, copy original

### Integration Tests

Verify end-to-end flow in existing `job-processing.integration.test.ts`:
- Create link → queue translation job → process job → verify link_translations record

---

## Dependencies

### Required (Must be implemented first)
- ✅ Translation service (`src/lib/translation-service/`) - Already implemented
- ✅ Job queue infrastructure (`src/lib/job-queue/`) - Already implemented
- ✅ `link_translations` table - Already created in Epic 1
- ✅ `item_links.source_language` column - Already exists

### Dependent on this (Will use after implemented)
- Task 3.1: Enhance job processor for content-specific handling (calls this function)
- API routes that need to manually retry link translations

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
| Define types | 10 min |
| Implement processLinkTranslation | 30 min |
| Update processJob integration | 10 min |
| Add exports | 5 min |
| Write unit tests | 25 min |
| **Total** | ~1.5 hours |

---

## Key Differences from Item/Article Processors

| Aspect | Item Processor | Article Processor | Link Processor |
|--------|---------------|-------------------|----------------|
| Fields to translate | `name`, `description` | `title`, `description` | `title` only |
| Source table | `items` | `item_articles` | `item_links` |
| Target table | `item_translations` | `article_translations` | `link_translations` |
| Complexity | Medium (2 fields) | Medium (2 fields) | Simple (1 field) |

The link processor is the simplest of the entity processors since it only translates the `title` field. The URL itself is never translated as it points to external resources.

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.4)
- **Request Definition:** `/docs/gen_requests_epic3.md` (REQ-349)
- **Existing Job Processor:** `/src/lib/job-queue/job-processor.ts`
- **Similar Implementation:** REQ-348 Item Translation Processor
- **Database Schema:** `link_translations` table (L10N Epic 1)

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
