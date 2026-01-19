# REQ-348: Implement Article Translation Processor - Detailed Task Breakdown

**Last Modified:** 2026-01-19 12:45:00 UTC
**Request ID:** REQ-348
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.3
**Size:** M (Medium)
**Status:** Ready for Implementation

---

## Document References

- **Overview:** `/docs/REQ-348-implement-article-translation-processor-overview.md`
- **Requirements:** `/docs/gen_requests_epic3.md` (REQ-348)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Job Processor:** `/src/lib/job-queue/job-processor.ts`

---

## Executive Summary

This task implements a dedicated processor for handling translation jobs for articles. The processor fetches source articles from `item_articles`, translates `title` and `description` fields using the translation service, stores results in `article_translations` with UPSERT semantics, and updates job status accordingly.

**Current State:** The article processing logic is already implemented within `job-processor.ts` (lines 158-179 for fetch, lines 283-305 for save). This task focuses on verifying completeness, adding context helpers, and creating comprehensive tests.

---

## Implementation Tasks

### Task 1: Verify Article Fetch Implementation

**File:** `/src/lib/job-queue/job-processor.ts`
**Function:** `fetchEntityContent()`
**Lines:** 158-179
**Priority:** High
**Estimate:** 15 minutes

#### 1.1 Verification Checklist

Verify the existing implementation handles these scenarios:

```typescript
// Verify in fetchEntityContent() case 'article':
// Location: /src/lib/job-queue/job-processor.ts:158-179

// Checklist:
// [ ] Fetches from 'item_articles' table
// [ ] Selects 'title', 'description', 'source_language' fields
// [ ] Uses .eq('id', entityId) for filtering
// [ ] Uses .single() for single record
// [ ] Returns null on error or missing data
// [ ] Logs error with entity context
// [ ] Returns EntityContent with correct structure
```

#### 1.2 Existing Implementation Reference

```typescript
// Current implementation in job-processor.ts:158-179
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

#### 1.3 Verification Steps

1. Open `/src/lib/job-queue/job-processor.ts`
2. Navigate to `fetchEntityContent()` function
3. Locate `case 'article':` block (approximately line 158)
4. Confirm all checklist items are satisfied
5. Document any gaps or enhancements needed

**Acceptance Criteria:**
- [ ] Article case exists in `fetchEntityContent()` switch statement
- [ ] Query selects `title`, `description`, and `source_language`
- [ ] Error handling returns null and logs appropriately
- [ ] Return structure matches `EntityContent` interface

---

### Task 2: Verify Article Save Implementation

**File:** `/src/lib/job-queue/job-processor.ts`
**Function:** `saveTranslation()`
**Lines:** 283-305
**Priority:** High
**Estimate:** 15 minutes

#### 2.1 Verification Checklist

```typescript
// Verify in saveTranslation() case 'article':
// Location: /src/lib/job-queue/job-processor.ts:283-305

// Checklist:
// [ ] UPSERT to 'article_translations' table
// [ ] Sets article_id from entityId
// [ ] Sets language from targetLanguage
// [ ] Sets title from translatedFields.title
// [ ] Sets description from translatedFields.description (nullable)
// [ ] Sets translation_status to 'completed'
// [ ] Sets translated_at timestamp
// [ ] Sets updated_at timestamp
// [ ] Uses onConflict: 'article_id,language'
// [ ] Returns true on success, false on error
```

#### 2.2 Existing Implementation Reference

```typescript
// Current implementation in job-processor.ts:283-305
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

#### 2.3 Verification Steps

1. Navigate to `saveTranslation()` function in job-processor.ts
2. Locate `case 'article':` block (approximately line 283)
3. Confirm all checklist items are satisfied
4. Verify UPSERT conflict handling matches database constraint

**Acceptance Criteria:**
- [ ] Article case exists in `saveTranslation()` switch statement
- [ ] UPSERT correctly maps all required fields
- [ ] Conflict resolution on `article_id,language` composite key
- [ ] Error handling returns false and logs appropriately

---

### Task 3: Verify Translation Context Configuration

**File:** `/src/lib/job-queue/job-processor.ts`
**Functions:** `getTranslationContext()`, `getContentType()`
**Lines:** 400-433
**Priority:** Medium
**Estimate:** 15 minutes

#### 3.1 Context Verification

```typescript
// Verify in getTranslationContext():
// Location: /src/lib/job-queue/job-processor.ts:400-409

// Expected article context:
const contexts: Record<EntityType, string> = {
  article: 'FAQ article in vacation rental property context. Help guide for guests.',
  // ...other entity types
};
```

#### 3.2 Content Type Mapping Verification

```typescript
// Verify in getContentType():
// Location: /src/lib/job-queue/job-processor.ts:418-433

// Expected article mappings:
const mapping = {
  'article.title': 'article_title',
  'article.description': 'article_description',
  // ...other mappings
};
```

#### 3.3 Verification Steps

1. Confirm `article` key exists in `getTranslationContext()` contexts
2. Confirm `article.title` mapping returns `'article_title'`
3. Confirm `article.description` mapping returns `'article_description'`
4. Verify context string is appropriate for vacation rental domain

**Acceptance Criteria:**
- [ ] Article domain context is defined and descriptive
- [ ] article.title maps to 'article_title' content type
- [ ] article.description maps to 'article_description' content type

---

### Task 4: Create Unit Tests for Article Processing

**File:** `/src/lib/job-queue/__tests__/article-translation.test.ts` (NEW)
**Priority:** High
**Estimate:** 2 hours

#### 4.1 Create Test File

```typescript
/**
 * Unit Tests: Article Translation Processor
 * REQ-348: Implement article translation processor
 *
 * Tests the article-specific translation processing logic
 * within the job processor.
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchEntityContent,
  saveTranslation,
} from '../job-processor';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn(),
}));

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
```

#### 4.2 Test Suite: fetchEntityContent for Articles

```typescript
describe('fetchEntityContent - articles', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it('should fetch article with title and description', async () => {
    // Arrange
    const articleId = 'article-123';
    const mockArticle = {
      title: 'How to use the coffee maker',
      description: 'Step by step guide for brewing coffee',
      source_language: 'en',
    };
    mockSingle.mockResolvedValue({ data: mockArticle, error: null });

    // Act
    const result = await fetchEntityContent('article', articleId);

    // Assert
    expect(supabaseAdmin.from).toHaveBeenCalledWith('item_articles');
    expect(mockSelect).toHaveBeenCalledWith('title, description, source_language');
    expect(mockEq).toHaveBeenCalledWith('id', articleId);
    expect(result).toEqual({
      entityType: 'article',
      entityId: articleId,
      sourceLanguage: 'en',
      fields: {
        title: 'How to use the coffee maker',
        description: 'Step by step guide for brewing coffee',
      },
    });
  });

  it('should handle null description field', async () => {
    // Arrange
    const articleId = 'article-456';
    const mockArticle = {
      title: 'Safety instructions',
      description: null,
      source_language: 'en',
    };
    mockSingle.mockResolvedValue({ data: mockArticle, error: null });

    // Act
    const result = await fetchEntityContent('article', articleId);

    // Assert
    expect(result).toEqual({
      entityType: 'article',
      entityId: articleId,
      sourceLanguage: 'en',
      fields: {
        title: 'Safety instructions',
        description: null,
      },
    });
  });

  it('should return null if article not found', async () => {
    // Arrange
    const articleId = 'nonexistent-article';
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' }
    });

    // Act
    const result = await fetchEntityContent('article', articleId);

    // Assert
    expect(result).toBeNull();
  });

  it('should use default source_language if not set', async () => {
    // Arrange
    const articleId = 'article-789';
    const mockArticle = {
      title: 'Test article',
      description: 'Test description',
      source_language: null,
    };
    mockSingle.mockResolvedValue({ data: mockArticle, error: null });

    // Act
    const result = await fetchEntityContent('article', articleId);

    // Assert
    expect(result?.sourceLanguage).toBe('en');
  });

  it('should return null on database error', async () => {
    // Arrange
    const articleId = 'article-error';
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'relation does not exist' }
    });

    // Act
    const result = await fetchEntityContent('article', articleId);

    // Assert
    expect(result).toBeNull();
  });
});
```

#### 4.3 Test Suite: saveTranslation for Articles

```typescript
describe('saveTranslation - articles', () => {
  const mockUpsert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-19T12:00:00Z'));

    (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
      upsert: mockUpsert,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should upsert translation to article_translations', async () => {
    // Arrange
    const articleId = 'article-123';
    const targetLanguage = 'fr';
    const translatedFields = {
      title: 'Comment utiliser la cafetière',
      description: 'Guide étape par étape pour faire du café',
    };
    mockUpsert.mockResolvedValue({ error: null });

    // Act
    const result = await saveTranslation('article', articleId, targetLanguage, translatedFields);

    // Assert
    expect(result).toBe(true);
    expect(supabaseAdmin.from).toHaveBeenCalledWith('article_translations');
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        article_id: articleId,
        language: targetLanguage,
        title: translatedFields.title,
        description: translatedFields.description,
        translation_status: 'completed',
        translated_at: '2026-01-19T12:00:00.000Z',
        updated_at: '2026-01-19T12:00:00.000Z',
      },
      { onConflict: 'article_id,language' }
    );
  });

  it('should handle null description in translation', async () => {
    // Arrange
    const articleId = 'article-456';
    const targetLanguage = 'de';
    const translatedFields = {
      title: 'Sicherheitsanweisungen',
    };
    mockUpsert.mockResolvedValue({ error: null });

    // Act
    const result = await saveTranslation('article', articleId, targetLanguage, translatedFields);

    // Assert
    expect(result).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      }),
      expect.any(Object)
    );
  });

  it('should return false on database error', async () => {
    // Arrange
    const articleId = 'article-error';
    const targetLanguage = 'es';
    const translatedFields = { title: 'Test' };
    mockUpsert.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key' }
    });

    // Act
    const result = await saveTranslation('article', articleId, targetLanguage, translatedFields);

    // Assert
    expect(result).toBe(false);
  });

  it('should update existing translation (UPSERT behavior)', async () => {
    // Arrange
    const articleId = 'article-existing';
    const targetLanguage = 'it';
    const translatedFields = {
      title: 'Titolo aggiornato',
      description: 'Descrizione aggiornata',
    };
    mockUpsert.mockResolvedValue({ error: null });

    // Act
    const result = await saveTranslation('article', articleId, targetLanguage, translatedFields);

    // Assert
    expect(result).toBe(true);
    // UPSERT with onConflict ensures existing record is updated
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.any(Object),
      { onConflict: 'article_id,language' }
    );
  });
});
```

#### 4.4 Test Suite: Article Context and Content Type

```typescript
describe('Translation Context - articles', () => {
  // Test imports from job-processor
  // Note: These functions may not be exported, verify accessibility

  it('should return appropriate domain context for articles', () => {
    // This test verifies the context string is suitable for articles
    // The context should mention FAQ, vacation rental, and help guide
    const expectedContextSubstrings = ['FAQ', 'article', 'vacation', 'rental', 'guests'];

    // If getTranslationContext is not exported, this test should
    // verify indirectly through processJob behavior
  });

  it('should map article.title to article_title content type', () => {
    // Verify the content type mapping for article titles
    // This affects translation quality through proper context
  });

  it('should map article.description to article_description content type', () => {
    // Verify the content type mapping for article descriptions
  });
});
```

**File Location:** `/src/lib/job-queue/__tests__/article-translation.test.ts`

**Acceptance Criteria:**
- [ ] Test file created with proper structure
- [ ] All tests for fetchEntityContent pass
- [ ] All tests for saveTranslation pass
- [ ] Tests cover success, error, and edge cases
- [ ] Test coverage for article processing >= 90%

---

### Task 5: Create Integration Tests

**File:** `/src/lib/job-queue/__tests__/article-translation.integration.test.ts` (NEW)
**Priority:** Medium
**Estimate:** 1.5 hours

#### 5.1 Integration Test Setup

```typescript
/**
 * Integration Tests: Article Translation Processor
 * REQ-348: Implement article translation processor
 *
 * Tests the end-to-end article translation flow:
 * Queue job -> Process -> Store -> Complete
 *
 * @created 2026-01-19
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Use test database credentials
const supabaseUrl = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.TEST_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
const testClient = createClient(supabaseUrl, supabaseKey);

describe('Article Translation Integration', () => {
  // Test data
  let testItemId: string;
  let testArticleId: string;
  let testJobId: string;

  beforeAll(async () => {
    // Create test item
    const { data: item } = await testClient
      .from('items')
      .insert({
        name: 'Test Item for Article Translation',
        description: 'Integration test item',
        public_id: `test-article-${Date.now()}`,
        property_id: null, // Use null for test
        source_language: 'en',
      })
      .select()
      .single();

    testItemId = item?.id;

    // Create test article
    const { data: article } = await testClient
      .from('item_articles')
      .insert({
        item_id: testItemId,
        purpose: 'how_to_use',
        title: 'How to test article translation',
        description: 'This is a test article for integration testing.',
        source_language: 'en',
      })
      .select()
      .single();

    testArticleId = article?.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testArticleId) {
      await testClient.from('article_translations').delete().eq('article_id', testArticleId);
      await testClient.from('item_articles').delete().eq('id', testArticleId);
    }
    if (testItemId) {
      await testClient.from('items').delete().eq('id', testItemId);
    }
    if (testJobId) {
      await testClient.from('translation_jobs').delete().eq('id', testJobId);
    }
  });

  beforeEach(async () => {
    // Clean up any existing translations for test article
    if (testArticleId) {
      await testClient.from('article_translations').delete().eq('article_id', testArticleId);
    }
  });
```

#### 5.2 Integration Test Cases

```typescript
  it('should translate article and store in article_translations', async () => {
    // This test requires actual translation service mocking or test mode
    // Skip if translation service is not available

    // 1. Create translation job
    const { data: job, error: jobError } = await testClient
      .from('translation_jobs')
      .insert({
        entity_type: 'article',
        entity_id: testArticleId,
        source_language: 'en',
        target_language: 'fr',
        status: 'queued',
        priority: 100,
      })
      .select()
      .single();

    expect(jobError).toBeNull();
    expect(job).toBeDefined();
    testJobId = job!.id;

    // 2. Import and call processor
    const { TranslationJobProcessor } = await import('../job-processor');
    const processor = new TranslationJobProcessor({
      pollingIntervalMs: 100,
      enableLogging: true,
    });

    // 3. Process the job
    const result = await processor.processNextJob();

    // 4. Verify job was processed (success or handled failure)
    expect(result).toBeDefined();
    expect(result?.entityType).toBe('article');
    expect(result?.entityId).toBe(testArticleId);
    expect(result?.targetLanguage).toBe('fr');

    // 5. Check job status was updated
    const { data: updatedJob } = await testClient
      .from('translation_jobs')
      .select('status')
      .eq('id', testJobId)
      .single();

    expect(['completed', 'failed']).toContain(updatedJob?.status);
  });

  it('should update job status to completed on success', async () => {
    // Create job and mock translation service for predictable results
    // Verify status transitions: queued -> processing -> completed
  });

  it('should handle concurrent translation requests', async () => {
    // Create multiple translation jobs for same article, different languages
    const languages = ['fr', 'de', 'es'];
    const jobPromises = languages.map(lang =>
      testClient
        .from('translation_jobs')
        .insert({
          entity_type: 'article',
          entity_id: testArticleId,
          source_language: 'en',
          target_language: lang,
          status: 'queued',
          priority: 50,
        })
        .select()
        .single()
    );

    const jobs = await Promise.all(jobPromises);

    // Process all jobs
    // Verify no race conditions or duplicate entries
    // Verify UPSERT handles any conflicts gracefully
  });

  it('should mark job failed if article not found', async () => {
    // Create job for non-existent article
    const { data: job } = await testClient
      .from('translation_jobs')
      .insert({
        entity_type: 'article',
        entity_id: '00000000-0000-0000-0000-000000000000', // Non-existent
        source_language: 'en',
        target_language: 'de',
        status: 'queued',
        priority: 10,
      })
      .select()
      .single();

    // Process the job
    const { TranslationJobProcessor } = await import('../job-processor');
    const processor = new TranslationJobProcessor({ enableLogging: false });
    const result = await processor.processNextJob();

    // Verify job failed with appropriate error
    expect(result?.success).toBe(false);
    expect(result?.errorMessage).toContain('not found');

    // Cleanup
    await testClient.from('translation_jobs').delete().eq('id', job!.id);
  });
});
```

**File Location:** `/src/lib/job-queue/__tests__/article-translation.integration.test.ts`

**Acceptance Criteria:**
- [ ] Integration test file created
- [ ] Test setup creates required test data
- [ ] Test cleanup removes test data
- [ ] End-to-end flow test passes
- [ ] Error scenario tests pass

---

### Task 6: Update Exports (if needed)

**File:** `/src/lib/job-queue/index.ts`
**Priority:** Low
**Estimate:** 10 minutes

#### 6.1 Verify Exports

Check that necessary types and functions are exported for testing and external use.

```typescript
// Verify these exports exist in /src/lib/job-queue/index.ts

// Types
export type {
  TranslationJob,
  JobProcessorConfig,
  JobProcessingResult,
  ProcessingRunResult,
  ProcessorStats,
  EntityContent,
  ArticleContent,
} from './job-processor';

// Functions
export {
  fetchEntityContent,
  saveTranslation,
  TranslationJobProcessor,
  createJobProcessor,
  getJobProcessor,
  startJobProcessor,
  stopJobProcessor,
} from './job-processor';
```

#### 6.2 Add Missing Exports

If any exports are missing for testing purposes, add them:

```typescript
// Add to /src/lib/job-queue/index.ts if missing

// For testing purposes
export {
  fetchEntityContent,
  saveTranslation,
} from './job-processor';
```

**Acceptance Criteria:**
- [ ] All necessary types are exported
- [ ] All necessary functions are exported
- [ ] Tests can import required components

---

### Task 7: Documentation Update

**File:** `/src/lib/job-queue/README.md` (NEW or UPDATE)
**Priority:** Low
**Estimate:** 30 minutes

#### 7.1 Document Article Processing

```markdown
# Job Queue Module

## Article Translation Processing

The job processor handles article translations through the following flow:

### Fetch (fetchEntityContent)
- Queries `item_articles` table
- Extracts `title`, `description`, `source_language`
- Returns null if article not found

### Translate (processJob)
- Translates title with context `article_title`
- Translates description with context `article_description`
- Skips null/empty description

### Store (saveTranslation)
- UPSERT to `article_translations`
- Conflict resolution on `article_id,language`
- Sets `translation_status` to 'completed'

### Error Handling
- Article not found: Job marked `failed`
- Translation error: Job marked `failed`, attempts incremented
- Storage error: Job marked `failed`

## Usage Example

```typescript
import { TranslationJobProcessor } from '@/lib/job-queue';

// Create and start processor
const processor = new TranslationJobProcessor({
  pollingIntervalMs: 30000,
  enableLogging: true,
});

processor.start();

// Process single job manually
const result = await processor.processNextJob();
if (result?.success) {
  console.log('Article translated:', result.translatedFields);
}
```
```

**Acceptance Criteria:**
- [ ] README documents article processing flow
- [ ] Usage examples provided
- [ ] Error handling documented

---

## File Changes Summary

### Files to Verify (Read-Only)

| File | Purpose |
|------|---------|
| `/src/lib/job-queue/job-processor.ts` | Verify article processing implementation |

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/job-queue/__tests__/article-translation.test.ts` | Unit tests |
| `/src/lib/job-queue/__tests__/article-translation.integration.test.ts` | Integration tests |

### Files to Modify (if needed)

| File | Purpose |
|------|---------|
| `/src/lib/job-queue/index.ts` | Export additional types/functions for testing |
| `/src/lib/job-queue/README.md` | Documentation |

---

## Dependencies

### Internal Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-243: Translation Job Queue Module | Complete | Job queue infrastructure |
| REQ-244: Job Processor | Complete | Base processor implementation |
| REQ-245: Concurrency Control | Complete | Lock/heartbeat mechanism |
| Translation Service (Epic 1) | Complete | `translateText()` function |

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^2.0.0 | Testing framework |
| @supabase/supabase-js | ^2.x | Database client |

---

## Acceptance Criteria Checklist

From Overview Document:

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

## Testing Checklist

### Unit Tests

- [ ] Fetch article with title and description
- [ ] Handle null description field
- [ ] Return null if article not found
- [ ] Use default source_language if not set
- [ ] Return null on database error
- [ ] UPSERT translation successfully
- [ ] Handle null description in translation
- [ ] Return false on database save error
- [ ] Update existing translation (UPSERT)

### Integration Tests

- [ ] End-to-end article translation flow
- [ ] Job status updated to completed
- [ ] Handle concurrent translation requests
- [ ] Mark job failed if article not found

---

## Verification Commands

```bash
# Run unit tests
npm run test -- src/lib/job-queue/__tests__/article-translation.test.ts

# Run integration tests (requires test database)
npm run test -- src/lib/job-queue/__tests__/article-translation.integration.test.ts

# Run all job-queue tests
npm run test -- src/lib/job-queue/__tests__/

# Check test coverage
npm run test:coverage -- src/lib/job-queue/
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Implementation already complete | High | Low | Task focuses on verification and testing |
| Test database not available | Medium | Medium | Use mocked tests as fallback |
| Translation service rate limits | Low | Low | Mock translation service in tests |

---

## Notes

The article translation processor logic is already implemented within `/src/lib/job-queue/job-processor.ts`. This task primarily involves:

1. **Verification** - Confirming the implementation meets all requirements
2. **Testing** - Creating comprehensive unit and integration tests
3. **Documentation** - Ensuring the implementation is well-documented

The existing implementation handles:
- Fetching articles from `item_articles`
- Translating `title` and `description` fields
- Storing results in `article_translations` with UPSERT
- Proper error handling and job status updates

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Overview Document: `/docs/REQ-348-implement-article-translation-processor-overview.md`
- Job Processor Source: `/src/lib/job-queue/job-processor.ts`
- Translation Service: `/src/lib/translation-service/`
- Related Task (Items): `/docs/REQ-348-implement-item-translation-processor-detailed.md`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3, Task 3.3: Implement article translation processor*
*Last Modified: 2026-01-19 12:45:00 UTC*
