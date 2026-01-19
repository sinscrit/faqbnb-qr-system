# REQ-350: Implement Tag Translation Processor - Implementation Breakdown

**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-350
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.5

---

## Summary

Create a dedicated processor function `processTagTranslation` that handles translation jobs specifically for tags. This processor fetches the source tag by key (from the English tag_translations entry), translates its value to the target language, stores the result in the `tag_translations` table with `is_system_tag = false`, and updates the job status accordingly.

---

## Current State Analysis

### Existing Infrastructure

The codebase already has a robust job processing infrastructure from Epic 1:

1. **Job Processor Framework** (`src/lib/job-queue/job-processor.ts`):
   - `TranslationJobProcessor` class with polling-based job processing
   - Generic `processJob()` function that handles all entity types
   - `fetchEntityContent()` function that already fetches tag content (lines 226-248)
   - `saveTranslation()` function that already saves tag translations (lines 357-377)
   - Heartbeat mechanism for long-running jobs

2. **Translation Service** (`src/lib/translation-service/translation-service.ts`):
   - `translateText()` function for single translations
   - Provider fallback (Claude → OpenAI)
   - Rate limiting and retry logic built-in

3. **Database Tables**:
   - `tag_translations` table with columns:
     - `id` (uuid, PK)
     - `tag_key` (varchar, NOT NULL)
     - `language` (varchar, NOT NULL)
     - `translated_value` (varchar, NOT NULL)
     - `is_system_tag` (boolean, default false)
     - `created_at` (timestamp)
   - Unique constraint on `(tag_key, language)`

### Tag Translation Specifics

Unlike items, articles, and links, tags:
- Are stored in `tag_translations` (not a separate source table)
- Use `tag_key` as the identifier (not a UUID from another table)
- Source content comes from the English (`en`) translation entry
- User tags must be marked with `is_system_tag = false`
- System tags (pre-seeded in Epic 1) have `is_system_tag = true` and should NOT be re-translated

### Gap Analysis

The current `processJob()` function in `job-processor.ts` already handles tag translation via a generic switch statement. However, per the implementation plan (Task 3.5), we need to create a **dedicated** `processTagTranslation` function that:

1. Is explicitly separated for maintainability and testing
2. Can be called directly (not just through the generic processor)
3. Has clear error handling specific to tags
4. Properly sets `is_system_tag = false` for user-generated tags
5. Follows the explicit contract defined in the acceptance criteria

---

## Implementation Approach

### Recommended: Extract and Enhance

Extract the tag-specific logic from the generic `processJob()` into a dedicated `processTagTranslation()` function that can be:
- Called directly by the job processor
- Called independently for manual/retry operations
- Unit tested in isolation

This follows the same pattern established by the item (REQ-348) and link (REQ-349) translation processors.

---

## Technical Design

### Function Signature

```typescript
/**
 * Process a translation job for a tag entity
 *
 * @param jobId - The translation job ID
 * @param tagKey - The tag key identifier (from entityId)
 * @param sourceLanguage - Source language code (typically 'en')
 * @param targetLanguage - Target language code (e.g., 'fr')
 * @returns Processing result with success status and translated value
 */
export async function processTagTranslation(
  jobId: string,
  tagKey: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TagTranslationResult>
```

### Return Type

```typescript
export interface TagTranslationResult {
  success: boolean;
  jobId: string;
  tagKey: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: {
    translated_value: string;
  };
  errorMessage?: string;
  processingTimeMs: number;
}
```

### Process Flow

```
processTagTranslation(jobId, tagKey, sourceLang, targetLang)
    │
    ├── 1. Fetch tag from `tag_translations` table (English entry)
    │   └── SELECT tag_key, translated_value FROM tag_translations
    │       WHERE tag_key = ? AND language = 'en'
    │
    ├── 2. Validate tag exists
    │   └── If not found → markJobFailed(jobId, 'Tag not found: {tagKey}')
    │
    ├── 3. Translate `translated_value` field
    │   └── translateText(translated_value, sourceLang, targetLang, { contentType: 'tag' })
    │
    ├── 4. On translation failure → markJobFailed(jobId, errorMessage) → return
    │
    ├── 5. Store in tag_translations table (UPSERT)
    │   └── UPSERT tag_translations SET
    │       tag_key=?, language=?, translated_value=?, is_system_tag=false
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
| `src/lib/job-queue/job-processor.ts` | Main job processor module | Add `processTagTranslation()` function, add `TagTranslationResult` type, update `processJob()` to call dedicated processor |
| `src/lib/job-queue/index.ts` | Module exports | Add export for `processTagTranslation` and `TagTranslationResult` type |

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
| `tag_translations` | SELECT | Fetch source tag value (English entry) |
| `tag_translations` | UPSERT | Store translated content with `is_system_tag = false` |
| `translation_jobs` | UPDATE | Mark job completed/failed (via helper functions) |

---

## Detailed Implementation Tasks

### Task 1: Define TagTranslationResult Type
**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Add after existing type definitions (after `LinkContent` interface, ~line 128)

Add the `TagTranslationResult` interface for the processor's return type:

```typescript
/**
 * Result of processing a tag translation job
 */
export interface TagTranslationResult {
  success: boolean;
  jobId: string;
  tagKey: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: {
    translated_value: string;
  };
  errorMessage?: string;
  processingTimeMs: number;
}
```

### Task 2: Implement processTagTranslation Function
**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Add after `saveTranslation()` function (~line 387)

Implement the dedicated processor with:
- Parameter validation
- Tag fetching from tag_translations table (English entry)
- Translation of translated_value field
- Storage to tag_translations table with `is_system_tag = false`
- Job status updates

```typescript
/**
 * Process a translation job for a tag entity
 * Part of REQ-350: Implement Tag Translation Processor
 *
 * Fetches the tag by key from the English translation entry,
 * translates its value, stores the result in tag_translations table
 * with is_system_tag=false, and updates job status.
 *
 * @param jobId - The translation job ID
 * @param tagKey - The tag key identifier
 * @param sourceLanguage - Source language code (typically 'en')
 * @param targetLanguage - Target language code
 * @returns Processing result
 */
export async function processTagTranslation(
  jobId: string,
  tagKey: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TagTranslationResult> {
  const startTime = Date.now();

  try {
    // 1. Fetch tag from tag_translations table (English entry as source)
    const { data: tag, error: fetchError } = await supabaseAdmin
      .from('tag_translations')
      .select('tag_key, translated_value')
      .eq('tag_key', tagKey)
      .eq('language', sourceLanguage)
      .single();

    // 2. Validate tag exists
    if (fetchError || !tag) {
      const errorMessage = `Tag not found: ${tagKey} (language: ${sourceLanguage})`;
      await markJobFailed(jobId, errorMessage);
      return {
        success: false,
        jobId,
        tagKey,
        targetLanguage,
        errorMessage,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 3. Translate translated_value field
    const translationResult = await translateText(
      tag.translated_value,
      sourceLanguage,
      targetLanguage,
      {
        context: {
          contentType: 'tag',
          domainContext: 'Category tag for organizing property items. Single word or short phrase.',
        },
      }
    );

    // 4. Store in tag_translations table (UPSERT)
    const { error: saveError } = await supabaseAdmin
      .from('tag_translations')
      .upsert(
        {
          tag_key: tagKey,
          language: targetLanguage,
          translated_value: translationResult.translatedText,
          is_system_tag: false,  // User tags are always non-system
        },
        {
          onConflict: 'tag_key,language',
        }
      );

    if (saveError) {
      const errorMessage = `Failed to store tag translation: ${saveError.message}`;
      await markJobFailed(jobId, errorMessage);
      return {
        success: false,
        jobId,
        tagKey,
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
      tagKey,
      targetLanguage,
      translatedFields: {
        translated_value: translationResult.translatedText,
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await markJobFailed(jobId, errorMessage);
    return {
      success: false,
      jobId,
      tagKey,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

### Task 3: Update processJob to Use Dedicated Processor
**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Modify `processJob()` function, `case 'tag':` branch (~line 446-542)

Update the tag case to call `processTagTranslation()` instead of the inline logic, converting the result to the expected `JobProcessingResult` format.

### Task 4: Export New Function and Type
**File:** `src/lib/job-queue/index.ts`
**Location:** Add to existing exports

Add exports for:
- `processTagTranslation` function
- `TagTranslationResult` type

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| processTagTranslation accepts job ID, tag ID, source language, target language | Function signature includes all parameters (tagKey serves as tag ID) |
| Function fetches tag from tags table using tag ID | Uses `supabaseAdmin.from('tag_translations').select().eq('tag_key', tagKey).eq('language', sourceLanguage)` |
| If tag not found, job marked failed with error message | Calls `markJobFailed(jobId, 'Tag not found: {tagKey}')` |
| Value field extracted from tag record | Extracts `tag.translated_value` from query result |
| Translation service invoked for tag value | Calls `translateText()` with `contentType: 'tag'` context |
| If translation fails, job marked failed with error | Catches translation errors, calls `markJobFailed()` |
| Translated value stored in tag_translations with is_system_tag=false | UPSERT with `is_system_tag: false` |
| Translation record includes timestamp fields | `created_at` is set by database default on insert |
| Existing translation updated (not duplicated) | UPSERT with `onConflict: 'tag_key,language'` handles this |
| Job marked completed after successful storage | Calls `markJobCompleted(jobId)` at end |

---

## Testing Strategy

### Unit Tests to Add

**File:** `src/lib/job-queue/__tests__/tag-processor.test.ts` (new)

1. **Happy Path:**
   - Tag exists with value → value translated and stored
   - Translation stored with `is_system_tag = false`
   - Job marked completed after successful storage

2. **Error Handling:**
   - Tag not found → job marked failed with "Tag not found" error
   - Translation service failure → job marked failed with translation error
   - Database storage failure → job marked failed with storage error

3. **Edge Cases:**
   - Empty translated_value string → should handle gracefully
   - Same source and target language → skip translation or copy original
   - Special characters in tag key → should handle URL-safe keys

### Integration Tests

Verify end-to-end flow in existing `job-processing.integration.test.ts`:
- Create tag entry (English) → queue translation job → process job → verify tag_translations record with `is_system_tag = false`

---

## Key Differences from Other Entity Processors

| Aspect | Item Processor | Article Processor | Link Processor | Tag Processor |
|--------|---------------|-------------------|----------------|---------------|
| Fields to translate | `name`, `description` | `title`, `description` | `title` only | `translated_value` only |
| Source table | `items` | `item_articles` | `item_links` | `tag_translations` (en) |
| Target table | `item_translations` | `article_translations` | `link_translations` | `tag_translations` |
| Entity ID | UUID (item_id) | UUID (article_id) | UUID (link_id) | String (tag_key) |
| Special handling | None | None | None | `is_system_tag = false` |
| Complexity | Medium (2 fields) | Medium (2 fields) | Simple (1 field) | Simple (1 field) |

### Tag-Specific Considerations

1. **Self-referential Table:** Unlike other entities, tags don't have a separate source table. The source value comes from the English entry in the same `tag_translations` table.

2. **User vs System Tags:** The processor explicitly sets `is_system_tag = false` because:
   - System tags are pre-seeded in Epic 1 with `is_system_tag = true`
   - Only user-created tags should flow through the translation job processor
   - This flag preserves the distinction for future features (e.g., preventing modification of system tags)

3. **Tag Key as Identifier:** Tags use `tag_key` (a string like "kitchen" or "bathroom") rather than a UUID, since tags are reusable across items and accounts.

---

## Dependencies

### Required (Must be implemented first)
- ✅ Translation service (`src/lib/translation-service/`) - Already implemented
- ✅ Job queue infrastructure (`src/lib/job-queue/`) - Already implemented
- ✅ `tag_translations` table - Already created in Epic 1
- ✅ System tags pre-seeded - Already done in Epic 1

### Dependent on this (Will use after implemented)
- Task 3.1: Enhance job processor for content-specific handling (calls this function)
- Task 2.5: Add tag translation on item save (triggers tag translation jobs)
- API routes that need to manually retry tag translations

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API timeout | Low | Medium | Existing retry logic handles this |
| Database connection failure | Low | High | Existing error handling, job re-queued on failure |
| Race condition on UPSERT | Very Low | Low | Database UNIQUE constraint prevents duplicates |
| System tag overwritten | Low | Medium | Should verify tag isn't system tag before processing; current design assumes job queue only receives user tags |
| Missing English source entry | Medium | Medium | Clear error message and job marked failed |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Define types | 10 min |
| Implement processTagTranslation | 30 min |
| Update processJob integration | 10 min |
| Add exports | 5 min |
| Write unit tests | 25 min |
| **Total** | ~1.5 hours |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.5)
- **Request Definition:** `/docs/gen_requests_epic3.md` (REQ-350)
- **Existing Job Processor:** `/src/lib/job-queue/job-processor.ts`
- **Similar Implementations:** REQ-348 Item Translation Processor, REQ-349 Link Translation Processor
- **Database Schema:** `tag_translations` table (L10N Epic 1)

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
