# REQ-273: Implement Article Translation Processor - Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-273
**Type:** NEW FEATURE
**Size:** M
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.3
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## Summary

Implement a specialized processor function that fetches article data, translates `title` and `description` fields, stores the translated content in the `article_translations` table using UPSERT logic, and updates the translation job status appropriately.

---

## Background

### Current State
- No dedicated processor exists to handle translation jobs for articles
- Translation jobs can be queued (per Epic 1 infrastructure) but cannot be executed for article content
- The `item_articles` table exists with `title` and `description` fields that need translation
- Epic 1 foundation provides translation service infrastructure and job queue mechanisms

### Dependencies
- **Epic 1 Foundation (Plan-110):** Translation service, job queue infrastructure, translation tables
- **REQ-263:** Translation storage utilities (`storeArticleTranslation`)
- **REQ-259:** Content translation module types
- **REQ-271:** Job processor entity routing (routes `article` jobs to this processor)

---

## Technical Requirements

### Processor Function Signature

```typescript
/**
 * Process a translation job for an article entity.
 * Fetches article, translates title/description, stores result, updates job status.
 *
 * @param job - Translation job metadata
 * @returns Promise<void>
 */
export async function processArticleTranslation(job: ArticleTranslationJob): Promise<void>;
```

### Input Job Structure

```typescript
interface ArticleTranslationJob {
  id: string;                           // Job tracking identifier
  entityType: 'article';                // Always 'article' for this processor
  entityId: string;                     // UUID of the article to translate
  sourceLanguage: SupportedLanguage;    // e.g., 'en', 'fr'
  targetLanguage: SupportedLanguage;    // e.g., 'de', 'es'
  priority: number;                     // Job priority
  attempts: number;                     // Current attempt count
  status: 'processing';                 // Job should be in processing state
  createdAt: string;
  startedAt?: string;
}
```

### Processing Flow

1. **Fetch Article Data**
   - Query `item_articles` table by article ID
   - Extract `title` and `description` fields
   - Handle missing article gracefully (mark job failed)

2. **Translate Fields**
   - Call translation service with both fields
   - Use context: `{ contentType: 'article_title' | 'article_description', domain: 'property_rental_instructions' }`
   - Handle translation service errors

3. **Store Translation**
   - Use `storeArticleTranslation()` utility with UPSERT pattern
   - Store translated `title` and `description`
   - Associate with correct article ID and target language

4. **Update Job Status**
   - On success: Update job to `'completed'` with `completed_at` timestamp
   - On failure: Update job to `'failed'` with descriptive `error_message`

---

## Architecture

### File Structure

```
/src/lib/content-translation/
├── processors/
│   ├── index.ts                    # Export all processors
│   └── article-processor.ts        # NEW: Article translation processor
├── storage/
│   └── translation-storage.ts      # storeArticleTranslation() (REQ-263)
└── content-translation.types.ts    # Shared type definitions
```

### Integration Points

| Component | Location | Purpose |
|-----------|----------|---------|
| Job Router | `/src/lib/job-queue/translation-jobs.ts` | Routes `article` jobs to this processor |
| Translation Service | `/src/lib/translation-service/` | Provides `translateText()` function |
| Storage Utility | `/src/lib/content-translation/storage/translation-storage.ts` | `storeArticleTranslation()` UPSERT |
| Supabase Client | `/src/lib/supabase.ts` | Database access for article fetch |
| Job Status Update | `/src/lib/job-queue/` | Update job status on completion/failure |

### Database Tables

**Source Table: `item_articles`**
```sql
-- Existing table structure (from schema.sql)
CREATE TABLE item_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Destination Table: `article_translations`** (from Epic 1)
```sql
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES item_articles(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  translation_status VARCHAR(20) DEFAULT 'completed',
  translated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, language)
);
```

---

## Implementation Tasks

### Task 1: Create Article Processor File Structure
- Create `/src/lib/content-translation/processors/` directory if not exists
- Create `/src/lib/content-translation/processors/article-processor.ts`
- Create `/src/lib/content-translation/processors/index.ts` for exports

### Task 2: Implement `processArticleTranslation` Function
- Accept job metadata as parameter
- Implement article fetch with error handling
- Extract `title` and `description` fields
- Log processing start with article details

### Task 3: Integrate Translation Service Call
- Import `translateText` from translation service
- Translate `title` field with context `{ contentType: 'article_title', domain: 'property_rental_instructions' }`
- Translate `description` field with context `{ contentType: 'article_description', domain: 'property_rental_instructions' }`
- Handle null/empty description gracefully (skip translation if empty)

### Task 4: Store Translation Results
- Call `storeArticleTranslation(articleId, targetLanguage, { title, description })`
- UPSERT pattern handles both new translations and updates
- Log successful storage

### Task 5: Implement Job Status Updates
- On success: Update job to `'completed'`, set `completed_at`
- On article not found: Update job to `'failed'`, error: `"Article not found or inaccessible"`
- On translation error: Update job to `'failed'`, include error details from service
- On storage error: Update job to `'failed'`, error: `"Failed to persist translation"`

### Task 6: Add Comprehensive Error Handling
- Wrap in try/catch
- Log errors with job ID and article ID context
- Ensure job status is always updated (even on unexpected errors)
- Use descriptive error messages for debugging

### Task 7: Export and Register Processor
- Export from `/src/lib/content-translation/processors/index.ts`
- Register in job router switch statement (REQ-271)

---

## Acceptance Criteria

- [ ] A `processArticleTranslation` function accepts job metadata including article identifier, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source article record using the article identifier
- [ ] The function extracts the `title` and `description` fields from the retrieved article record
- [ ] The function calls the translation service to translate both `title` and `description` from source language to target language
- [ ] The function stores the translated `title` and `description` in the `article_translations` table using UPSERT logic
- [ ] The UPSERT operation associates the translation with the correct article identifier and target language code
- [ ] Upon successful translation and storage, the function updates the job status to `'completed'` in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to `'failed'` with error details indicating the article could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to `'failed'` with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to `'failed'` with error details indicating the translation could not be persisted
- [ ] The function is exported from `/src/lib/content-translation/processors/article-processor.ts`
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/processors/article-processor.ts` | Main processor implementation |
| `/src/lib/content-translation/processors/index.ts` | Barrel export for all processors |

### Existing Files to Modify

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/job-queue/translation-jobs.ts` | `processTranslationJob()` | Add case for `'article'` entity type to route to `processArticleTranslation` |
| `/src/lib/content-translation/index.ts` | exports | Add export for processors module |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/storage/translation-storage.ts` | Use `storeArticleTranslation()` |
| `/src/lib/content-translation/content-translation.types.ts` | Import type definitions |
| `/src/lib/translation-service/translation-service.ts` | Use `translateText()` |
| `/src/lib/supabase.ts` | Database client access |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Reference pattern for article fetching |

---

## Code Examples

### Article Fetch Pattern (from existing codebase)

```typescript
// Reference: /src/app/api/admin/articles/[articleId]/route.ts
const { data: article, error: articleError } = await supabase
  .from('item_articles')
  .select(`
    id,
    title,
    description,
    purpose,
    item_id,
    created_at,
    updated_at
  `)
  .eq('id', articleId)
  .single();
```

### Translation Context Templates

```typescript
const ARTICLE_TRANSLATION_CONTEXTS = {
  title: {
    contentType: 'article_title' as const,
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate the title of an instruction article for vacation rental guests. Format: "[How to/Safety/etc] - [Item Name]"'
  },
  description: {
    contentType: 'article_description' as const,
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate instruction content for vacation rental guests. Keep instructions clear and actionable.'
  }
};
```

### Processor Implementation Skeleton

```typescript
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { storeArticleTranslation } from '../storage/translation-storage';
import { updateJobStatus } from '@/lib/job-queue';
import type { ArticleTranslationJob } from '../content-translation.types';

export async function processArticleTranslation(job: ArticleTranslationJob): Promise<void> {
  const { entityId: articleId, sourceLanguage, targetLanguage, id: jobId } = job;

  console.log(`[ArticleProcessor] Processing job ${jobId} for article ${articleId} (${sourceLanguage} -> ${targetLanguage})`);

  try {
    // 1. Fetch article
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('item_articles')
      .select('id, title, description')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      await updateJobStatus(jobId, 'failed', {
        error_message: 'Article not found or inaccessible'
      });
      return;
    }

    // 2. Translate fields
    const translatedTitle = await translateText({
      text: article.title,
      sourceLanguage,
      targetLanguage,
      context: { contentType: 'article_title', domain: 'property_rental_instructions' }
    });

    let translatedDescription: string | null = null;
    if (article.description) {
      translatedDescription = await translateText({
        text: article.description,
        sourceLanguage,
        targetLanguage,
        context: { contentType: 'article_description', domain: 'property_rental_instructions' }
      });
    }

    // 3. Store translation
    await storeArticleTranslation(articleId, targetLanguage, {
      title: translatedTitle,
      description: translatedDescription
    });

    // 4. Mark job completed
    await updateJobStatus(jobId, 'completed', {
      completed_at: new Date().toISOString()
    });

    console.log(`[ArticleProcessor] Successfully completed job ${jobId}`);

  } catch (error) {
    console.error(`[ArticleProcessor] Error processing job ${jobId}:`, error);
    await updateJobStatus(jobId, 'failed', {
      error_message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
```

---

## Testing Considerations

### Unit Tests
- Test successful article translation flow
- Test handling of missing article (404 scenario)
- Test handling of translation service errors
- Test handling of storage errors
- Test handling of null/empty description field

### Integration Tests
- Test full flow: queue job → process → verify stored translation
- Test UPSERT behavior (update existing translation)
- Test job status correctly updated in database

### Manual Testing
1. Create an article via API with title and description
2. Queue a translation job for the article
3. Trigger job processing
4. Verify translation appears in `article_translations` table
5. Verify job status is `'completed'`
6. Test error scenarios (delete article before processing)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation service unavailable | Medium | Medium | Retry logic with exponential backoff (Epic 1) |
| Article deleted mid-processing | Low | Low | Graceful handling with clear error message |
| Database constraint violations | Low | Medium | UPSERT pattern handles duplicates |
| Empty description field | Medium | Low | Skip translation for null/empty, only store title |

---

## Related Requests

| Request | Relationship |
|---------|--------------|
| REQ-271 | Depends on: Job processor routing |
| REQ-263 | Depends on: `storeArticleTranslation()` utility |
| REQ-272 | Parallel: Item translation processor (same pattern) |
| REQ-267 | Consumer: Articles API triggers translations that this processes |
| REQ-274 (future) | Parallel: Link translation processor (same pattern) |

---

## Glossary

| Term | Definition |
|------|------------|
| Article | A grouped set of content organized by purpose (e.g., how-to-use, troubleshooting) within an item |
| UPSERT | Database operation that inserts a new row or updates if it already exists |
| Job Queue | Async processing infrastructure for background translation tasks |
| Translation Context | Metadata passed to translation service to improve translation quality |

---

*Document created for FAQBNB L10N Epic 3 - Dynamic Content Translation*
*Phase 3: Translation Job Processing Enhancement - Task 3.3*
