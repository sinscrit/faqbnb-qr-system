# REQ-348: Implement Article Translation Processor - Implementation Breakdown

**Last Modified:** 2026-01-19 12:15:00 UTC
**Request ID:** REQ-348
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.3

---

## Summary

Create a dedicated processor function that handles translation jobs for articles. The processor fetches the source article by ID, translates its `title` and `description` fields using the translation service, stores the results in the `article_translations` table, and updates the job status accordingly.

---

## Current Behavior

Translation jobs for articles can be created and queued via the job queue module, but the job processor lacks specialized handling for article-type entities. The existing `job-processor.ts` already contains the foundational infrastructure including:

- `fetchEntityContent()` with a case for `'article'` that fetches from `item_articles`
- `saveTranslation()` with a case for `'article'` that upserts to `article_translations`
- Generic `processJob()` function that uses these helpers

The implementation is actually already present in `job-processor.ts:158-179` (fetch) and `job-processor.ts:283-305` (save). This task is about ensuring the article processing pathway is complete and properly documented.

---

## Expected Behavior

When a translation job with `entityType: 'article'` is dequeued:

1. **Fetch**: The processor fetches the article from `item_articles` table using the `entity_id`
2. **Validate**: If the article is not found, the job is marked as failed with an appropriate error message
3. **Extract**: The `title` and `description` fields are extracted from the retrieved article record
4. **Translate**: The translation service is invoked to translate both fields to the target language
5. **Store**: Translated content is stored in `article_translations` with UPSERT semantics (update if exists)
6. **Complete**: Job status is updated to `completed` with timestamp

---

## Technical Context

### Database Tables

**Source Table: `item_articles`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `item_id` | UUID | Foreign key to items |
| `purpose` | VARCHAR | Category: how_to_use, troubleshooting, etc. |
| `title` | VARCHAR | Auto-generated or custom title |
| `description` | TEXT | Optional detailed content |
| `source_language` | VARCHAR | Original language (default: 'en') |

**Target Table: `article_translations`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `article_id` | UUID | Foreign key to item_articles |
| `language` | VARCHAR | Target language code |
| `title` | VARCHAR | Translated title |
| `description` | TEXT | Translated description |
| `translation_status` | VARCHAR | pending, processing, completed, failed, manual |
| `translated_at` | TIMESTAMPTZ | When translation was completed |
| `reviewed_by` | UUID | User who manually reviewed (optional) |

**Job Queue Table: `translation_jobs`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `entity_type` | VARCHAR | 'article' for this processor |
| `entity_id` | UUID | The article_id |
| `source_language` | VARCHAR | Source language code |
| `target_language` | VARCHAR | Target language code |
| `status` | VARCHAR | queued, processing, completed, failed |
| `attempts` | INTEGER | Number of processing attempts |
| `error_message` | TEXT | Error details if failed |

### Existing Patterns

The implementation follows the established pattern in `job-processor.ts`:

```typescript
// Pattern: Entity content fetching (lines 158-179)
case 'article': {
  const { data, error } = await supabaseAdmin
    .from('item_articles')
    .select('title, description, source_language')
    .eq('id', entityId)
    .single();

  if (error || !data) {
    console.error('[JobProcessor] Failed to fetch article:', error);
    return null;
  }

  return {
    entityType: 'article',
    entityId,
    sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
    fields: {
      title: data.title,
      description: data.description,
    },
  };
}
```

```typescript
// Pattern: Translation storage (lines 283-305)
case 'article': {
  const { error } = await supabaseAdmin
    .from('article_translations')
    .upsert(
      {
        article_id: entityId,
        language: targetLanguage,
        title: translatedFields.title,
        description: translatedFields.description || null,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
      },
      {
        onConflict: 'article_id,language',
      }
    );

  if (error) {
    console.error('[JobProcessor] Failed to save article translation:', error);
    return false;
  }
  return true;
}
```

---

## Implementation Tasks

### Task 1: Verify Article Processing Implementation (Validation)
**Priority:** High
**Estimate:** 1 hour

Verify that the existing article processing code in `job-processor.ts` is complete and functional:

1. Confirm `fetchEntityContent()` properly handles `'article'` entity type
2. Confirm `saveTranslation()` properly handles `'article'` entity type
3. Verify translation context is appropriate for article content
4. Check that error handling follows the established pattern

### Task 2: Add Article-Specific Translation Context
**Priority:** Medium
**Estimate:** 30 minutes

Ensure the translation context helper provides appropriate context for article content:

```typescript
// In getTranslationContext()
article: 'FAQ article in vacation rental property context. Help guide for guests.',

// In getContentType()
'article.title': 'article_title',
'article.description': 'article_description',
```

### Task 3: Write Unit Tests for Article Processor
**Priority:** High
**Estimate:** 2 hours

Create comprehensive unit tests:

1. Test successful article translation with both title and description
2. Test article translation with null/empty description
3. Test article not found scenario (job marked as failed)
4. Test translation service failure scenario
5. Test database save failure scenario
6. Test UPSERT behavior (update existing translation)

### Task 4: Write Integration Test
**Priority:** Medium
**Estimate:** 1 hour

Create an integration test that:

1. Creates a test article in `item_articles`
2. Queues a translation job
3. Processes the job
4. Verifies the translation appears in `article_translations`
5. Verifies the job status is `completed`

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `src/lib/job-queue/job-processor.ts` | `fetchEntityContent()` case 'article' | Verify/Enhance |
| `src/lib/job-queue/job-processor.ts` | `saveTranslation()` case 'article' | Verify/Enhance |
| `src/lib/job-queue/job-processor.ts` | `getTranslationContext()` | Verify context strings |
| `src/lib/job-queue/job-processor.ts` | `getContentType()` | Verify content type mapping |

### Test Files (New)

| File | Purpose |
|------|---------|
| `src/lib/job-queue/__tests__/article-translation.test.ts` | Unit tests for article processing |
| `src/lib/job-queue/__tests__/article-translation.integration.test.ts` | Integration tests |

### Supporting Files (Read-Only Reference)

| File | Purpose |
|------|---------|
| `src/lib/job-queue/translation-jobs.ts` | Job queue functions |
| `src/lib/job-queue/translation-jobs.types.ts` | Type definitions |
| `src/lib/translation-service/index.ts` | Translation service exports |
| `src/lib/translation-service/translation-service.ts` | Main translation functions |

---

## Acceptance Criteria

- [ ] `processArticleTranslation` function accepts job ID, article ID, source language, and target language parameters (via existing `processJob`)
- [ ] Function fetches the article record from the `item_articles` table using the provided article ID
- [ ] If article is not found, job status is updated to `failed` with an appropriate error message
- [ ] `title` and `description` fields are extracted from the retrieved article record
- [ ] Translation service is invoked to translate both `title` and `description` to the target language
- [ ] If translation fails, job status is updated to `failed` with error details and processing stops
- [ ] Translated title and description are stored in `article_translations` table with `article_id`, `language`, and timestamp
- [ ] If an existing translation for the same article and language exists, it is updated rather than duplicated (UPSERT)
- [ ] After successful storage, job status is updated to `completed`

---

## Dependencies

### Required (From Epic 1)

- [x] `translation_jobs` table exists with proper schema
- [x] `article_translations` table exists with proper schema
- [x] `item_articles` table has `source_language` column
- [x] Translation service operational (`/src/lib/translation-service/`)
- [x] Job queue infrastructure in place (`/src/lib/job-queue/`)

### Internal Dependencies

- REQ-243: Translation Job Queue Module (completed)
- REQ-244: Job Processor (completed)
- REQ-245: Concurrency Control (completed)

---

## Data Flow

```
Translation Job (entity_type='article')
    │
    ▼
processJob() in job-processor.ts
    │
    ├── 1. fetchEntityContent('article', entityId)
    │       │
    │       └── SELECT title, description, source_language
    │           FROM item_articles WHERE id = entityId
    │
    ├── 2. For each field (title, description):
    │       │
    │       └── translateText(fieldValue, sourceLanguage, targetLanguage, {
    │             context: { contentType, domainContext }
    │           })
    │
    ├── 3. saveTranslation('article', entityId, targetLanguage, translatedFields)
    │       │
    │       └── UPSERT INTO article_translations
    │           (article_id, language, title, description, translation_status, translated_at)
    │
    └── 4. markJobCompleted(jobId)
            │
            └── UPDATE translation_jobs SET status='completed', completed_at=now()
```

---

## Error Handling

| Error Scenario | Handling |
|---------------|----------|
| Article not found | Mark job as `failed`, error: "Entity not found: article/{id}" |
| Translation API failure | Mark job as `failed`, increment `attempts`, retry if < 3 attempts |
| Database save failure | Mark job as `failed`, error: "Failed to save translation to database" |
| Rate limit exceeded | Automatic retry with exponential backoff |

---

## Testing Strategy

### Unit Tests

```typescript
describe('Article Translation Processor', () => {
  describe('fetchEntityContent for articles', () => {
    it('should fetch article with title and description');
    it('should handle null description');
    it('should return null if article not found');
    it('should use default source_language if not set');
  });

  describe('saveTranslation for articles', () => {
    it('should upsert translation to article_translations');
    it('should update existing translation');
    it('should handle null description');
    it('should set translation_status to completed');
  });

  describe('processJob for articles', () => {
    it('should process article translation end-to-end');
    it('should mark job failed if article not found');
    it('should mark job failed if translation service fails');
  });
});
```

### Integration Tests

```typescript
describe('Article Translation Integration', () => {
  it('should translate article and store in article_translations');
  it('should update job status to completed');
  it('should handle concurrent translation requests');
});
```

---

## Performance Considerations

- Article translations typically involve short text (title: ~100 chars, description: ~500 chars)
- Expected processing time: 2-5 seconds per article translation
- Batch translations for 5 languages: ~10-25 seconds total
- UPSERT pattern prevents duplicate translations efficiently

---

## Related Requests

| Request | Relationship |
|---------|--------------|
| REQ-343: Modify Articles API to trigger translations | Upstream trigger |
| REQ-347: Enhance job processor for content-specific handling | Parent task |
| REQ-349: Implement link translation processor | Sibling task |
| REQ-350: Implement tag translation processor | Sibling task |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- PRD: `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- Job Processor: `/src/lib/job-queue/job-processor.ts`
- Translation Service: `/src/lib/translation-service/`
- Database Schema: Supabase `article_translations` table

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3, Task 3.3: Implement article translation processor*
