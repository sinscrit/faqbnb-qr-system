# REQ-349: Implement Link Translation Processor - Detailed Task Breakdown

**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-349
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.4

---

## Document Overview

This document provides a detailed, step-by-step task breakdown for implementing a dedicated `processLinkTranslation` function. This processor handles translation jobs specifically for links by fetching the source link, translating its `title` field, and storing results in the `link_translations` table.

**Source Documents:**
- Overview: `/docs/REQ-349-implement-link-translation-processor-overview.md`
- Requirements: `/docs/gen_requests_epic3.md` (REQ-349)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.4)

---

## Prerequisites

Before starting implementation, verify the following are complete:

- [x] Job queue infrastructure exists (`src/lib/job-queue/`)
- [x] Translation service is operational (`src/lib/translation-service/`)
- [x] `item_links` table exists with `title`, `source_language` columns
- [x] `link_translations` table exists with required columns
- [x] `translation_jobs` table exists with job tracking fields
- [x] `fetchEntityContent()` function exists (can be used for reference)
- [x] `saveTranslation()` function exists (can be used for reference)
- [x] `markJobCompleted()` and `markJobFailed()` helper functions exist

---

## Task Summary

| Task # | Description | Estimated Effort | File(s) |
|--------|-------------|------------------|---------|
| 1 | Define LinkTranslationResult type | 10 min | `src/lib/job-queue/job-processor.ts` |
| 2 | Implement processLinkTranslation function | 30 min | `src/lib/job-queue/job-processor.ts` |
| 3 | Update processJob to delegate to dedicated processor | 10 min | `src/lib/job-queue/job-processor.ts` |
| 4 | Export new function and type | 5 min | `src/lib/job-queue/index.ts` |
| 5 | Write unit tests | 25 min | `src/lib/job-queue/__tests__/link-processor.test.ts` |
| **Total** | | **~1.5 hours** | |

---

## Detailed Tasks

### Task 1: Define LinkTranslationResult Type

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** After existing type definitions (approximately line 132, after `TagContent` interface or after `ItemTranslationResult` if REQ-348 is implemented)
**Estimated Effort:** 10 minutes

#### Description
Add a dedicated result type for the link translation processor. This provides a strongly-typed return value that includes link-specific translated fields and processing metadata. Links are simpler than items/articles as they only have a `title` field to translate (URLs are never translated).

#### Implementation Steps

1.1. **Add the LinkTranslationResult interface** after the existing content type definitions:

```typescript
/**
 * Result of processing a link translation job
 * Returned by processLinkTranslation function
 * Part of REQ-349: Implement Link Translation Processor
 */
export interface LinkTranslationResult {
  /** Whether the translation was successful */
  success: boolean;
  /** The job ID that was processed */
  jobId: string;
  /** The link ID that was translated */
  linkId: string;
  /** Target language the content was translated to */
  targetLanguage: SupportedLanguage;
  /** Translated field values (only present on success) */
  translatedFields?: {
    title: string;
  };
  /** Error message (only present on failure) */
  errorMessage?: string;
  /** Time taken to process in milliseconds */
  processingTimeMs: number;
}
```

#### Acceptance Criteria
- [ ] `LinkTranslationResult` interface is defined in `job-processor.ts`
- [ ] Interface includes `success`, `jobId`, `linkId`, `targetLanguage` required fields
- [ ] Interface includes optional `translatedFields` object with `title` only (not URL)
- [ ] Interface includes optional `errorMessage` field for failure cases
- [ ] Interface includes `processingTimeMs` for timing metrics
- [ ] TypeScript compiles without errors

---

### Task 2: Implement processLinkTranslation Function

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** After `saveTranslation()` function (or after `processItemTranslation` if REQ-348 is implemented)
**Estimated Effort:** 30 minutes

#### Description
Create the dedicated `processLinkTranslation` function that handles the complete translation workflow for links. This function should be callable directly (not just through the generic processor) for manual/retry operations and isolated testing.

Note: Links are simpler than items/articles - they only have a `title` field to translate. The URL field is NEVER translated as it points to external resources.

#### Implementation Steps

2.1. **Add the function signature and JSDoc**:

```typescript
/**
 * Process a translation job for a link entity
 *
 * Dedicated processor for link translations that:
 * 1. Fetches the source link from the item_links table
 * 2. Translates the title field to target language (URL is never translated)
 * 3. Stores results in link_translations table (UPSERT)
 * 4. Updates job status to completed or failed
 *
 * @param jobId - The translation job ID for status updates
 * @param linkId - The link entity ID to translate
 * @param sourceLanguage - Source language code (e.g., 'en')
 * @param targetLanguage - Target language code (e.g., 'fr')
 * @returns Processing result with success status and translated title
 *
 * @example
 * ```typescript
 * const result = await processLinkTranslation(
 *   'job-123',
 *   'link-456',
 *   'en',
 *   'fr'
 * );
 * if (result.success) {
 *   console.log('Translated title:', result.translatedFields?.title);
 * }
 * ```
 */
export async function processLinkTranslation(
  jobId: string,
  linkId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<LinkTranslationResult> {
  // Implementation follows
}
```

2.2. **Add timing and error handling wrapper**:

```typescript
export async function processLinkTranslation(
  jobId: string,
  linkId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<LinkTranslationResult> {
  const startTime = Date.now();

  try {
    // Step 1: Fetch link from database
    // Step 2: Translate title field
    // Step 3: Store translation
    // Step 4: Mark job completed
    // Step 5: Return success result
  } catch (error) {
    // Handle errors and mark job failed
  }
}
```

2.3. **Implement Step 1 - Fetch link from database**:

```typescript
// Step 1: Fetch link from item_links table
const { data: link, error: fetchError } = await supabaseAdmin
  .from('item_links')
  .select('id, title, source_language')
  .eq('id', linkId)
  .single();

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

// Use link's source_language if available, otherwise use provided
const effectiveSourceLanguage = (link.source_language as SupportedLanguage) || sourceLanguage;
```

2.4. **Implement Step 2 - Translate title field**:

```typescript
// Step 2: Translate title field
// Note: URLs are NEVER translated - only the title describing the link
let translatedTitle: string;

try {
  const titleResult = await translateText(link.title, effectiveSourceLanguage, targetLanguage, {
    context: {
      contentType: 'link_title',
      domainContext: 'Resource link title for vacation rental property instructions. External reference to video, PDF, or website.',
    },
  });
  translatedTitle = titleResult.translatedText;
} catch (translationError) {
  const errorMessage = translationError instanceof Error
    ? translationError.message
    : 'Translation service failed';
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
```

2.5. **Implement Step 3 - Store translation in link_translations table**:

```typescript
// Step 3: Store in link_translations (UPSERT)
const now = new Date().toISOString();
const { error: saveError } = await supabaseAdmin
  .from('link_translations')
  .upsert(
    {
      link_id: linkId,
      language: targetLanguage,
      title: translatedTitle,
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
```

2.6. **Implement Step 4 & 5 - Mark job completed and return success**:

```typescript
// Step 4: Mark job completed
await markJobCompleted(jobId);

// Step 5: Return success result
return {
  success: true,
  jobId,
  linkId,
  targetLanguage,
  translatedFields: {
    title: translatedTitle,
  },
  processingTimeMs: Date.now() - startTime,
};
```

2.7. **Complete implementation with full error handling**:

The complete function should look like this:

```typescript
export async function processLinkTranslation(
  jobId: string,
  linkId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<LinkTranslationResult> {
  const startTime = Date.now();

  try {
    // Step 1: Fetch link from item_links table
    const { data: link, error: fetchError } = await supabaseAdmin
      .from('item_links')
      .select('id, title, source_language')
      .eq('id', linkId)
      .single();

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

    // Use link's source_language if available, otherwise use provided
    const effectiveSourceLanguage = (link.source_language as SupportedLanguage) || sourceLanguage;

    // Step 2: Translate title field
    // Note: URLs are NEVER translated - only the title describing the link
    let translatedTitle: string;

    try {
      const titleResult = await translateText(link.title, effectiveSourceLanguage, targetLanguage, {
        context: {
          contentType: 'link_title',
          domainContext: 'Resource link title for vacation rental property instructions. External reference to video, PDF, or website.',
        },
      });
      translatedTitle = titleResult.translatedText;
    } catch (translationError) {
      const errorMessage = translationError instanceof Error
        ? translationError.message
        : 'Translation service failed';
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

    // Step 3: Store in link_translations (UPSERT)
    const now = new Date().toISOString();
    const { error: saveError } = await supabaseAdmin
      .from('link_translations')
      .upsert(
        {
          link_id: linkId,
          language: targetLanguage,
          title: translatedTitle,
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

    // Step 4: Mark job completed
    await markJobCompleted(jobId);

    // Step 5: Return success result
    return {
      success: true,
      jobId,
      linkId,
      targetLanguage,
      translatedFields: {
        title: translatedTitle,
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error processing link translation';

    try {
      await markJobFailed(jobId, errorMessage);
    } catch {
      // Ignore failure to mark job failed
      console.error('[processLinkTranslation] Failed to mark job as failed:', jobId);
    }

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

#### Acceptance Criteria
- [ ] `processLinkTranslation` function accepts `jobId`, `linkId`, `sourceLanguage`, `targetLanguage` parameters
- [ ] Function fetches link from `item_links` table using provided `linkId`
- [ ] If link not found, job is marked failed with "Link not found: {linkId}" message
- [ ] Title field is translated using translation service with `link_title` content type
- [ ] If translation fails, job is marked failed with translation error message
- [ ] Translated title is stored in `link_translations` table using UPSERT
- [ ] UPSERT uses `onConflict: 'link_id,language'` to update existing records
- [ ] After successful storage, job is marked completed
- [ ] Function returns `LinkTranslationResult` with appropriate success/failure data
- [ ] `processingTimeMs` is accurately calculated in all return paths

---

### Task 3: Update processJob to Delegate to Dedicated Processor

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Inside `processJob()` function, add routing for 'link' entity type
**Estimated Effort:** 10 minutes

#### Description
Update the existing generic `processJob()` function to delegate link translations to the new dedicated `processLinkTranslation()` function. This maintains backward compatibility while enabling the dedicated processor.

#### Implementation Steps

3.1. **Locate the processJob function** and find the section handling entity type routing.

3.2. **Add link entity type routing**:

If there's already a pattern established for item routing (from REQ-348), add the link routing similarly:

```typescript
async function processJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityType, entityId, sourceLanguage, targetLanguage } = job;

  // Start heartbeat to prevent lock timeout during processing
  const stopHeartbeat = createLockHeartbeat(
    job.id,
    config.workerId,
    config.heartbeatIntervalMs || DEFAULT_HEARTBEAT_INTERVAL_MS
  );

  try {
    // Route to dedicated processors based on entity type
    if (entityType === 'item') {
      // REQ-348: Item processor routing (if implemented)
      const result = await processItemTranslation(job.id, entityId, sourceLanguage, targetLanguage);
      return mapItemResultToJobResult(result);
    }

    if (entityType === 'link') {
      // REQ-349: Link processor routing
      const result = await processLinkTranslation(
        job.id,
        entityId,
        sourceLanguage,
        targetLanguage
      );

      // Map LinkTranslationResult to JobProcessingResult
      return {
        jobId: result.jobId,
        success: result.success,
        entityType: 'link',
        entityId: result.linkId,
        targetLanguage: result.targetLanguage,
        translatedFields: result.translatedFields ? {
          title: result.translatedFields.title,
        } : undefined,
        errorMessage: result.errorMessage,
        processingTimeMs: result.processingTimeMs,
      };
    }

    // Existing generic processing for other entity types (article, tag)
    // ...
  } finally {
    stopHeartbeat();
  }
}
```

3.3. **Ensure heartbeat is properly managed**:

The heartbeat should be started before processing and stopped in the finally block, which covers all entity types.

#### Acceptance Criteria
- [ ] `processJob` function routes link translations to `processLinkTranslation`
- [ ] Heartbeat is properly managed (started before, stopped after in finally block)
- [ ] `LinkTranslationResult` is correctly mapped to `JobProcessingResult`
- [ ] Other entity types (item, article, tag) continue to work correctly
- [ ] All existing tests pass after modification

---

### Task 4: Export New Function and Type

**File:** `src/lib/job-queue/index.ts`
**Location:** Add to existing exports section
**Estimated Effort:** 5 minutes

#### Description
Export the new `processLinkTranslation` function and `LinkTranslationResult` type from the job-queue module's public API.

#### Implementation Steps

4.1. **Add type export for LinkTranslationResult**:

In the type exports section, add:

```typescript
// Job processor types (REQ-244)
export type {
  JobProcessorConfig,
  JobProcessingResult,
  ProcessingRunResult,
  ProcessorStats,
  EntityContent,
  ArticleContent,
  ItemContent,
  LinkContent,
  TagContent,
  ItemTranslationResult, // REQ-348 (if implemented)
  LinkTranslationResult, // NEW: REQ-349
} from './job-processor';
```

4.2. **Add function export for processLinkTranslation**:

In the function exports section, add:

```typescript
// Job processor exports (REQ-244)
export {
  TranslationJobProcessor,
  createJobProcessor,
  getJobProcessor,
  resetJobProcessor,
  startJobProcessor,
  stopJobProcessor,
  fetchEntityContent,
  saveTranslation,
  processItemTranslation, // REQ-348 (if implemented)
  processLinkTranslation, // NEW: REQ-349
} from './job-processor';
```

#### Acceptance Criteria
- [ ] `LinkTranslationResult` type is exported from `@/lib/job-queue`
- [ ] `processLinkTranslation` function is exported from `@/lib/job-queue`
- [ ] Module compiles without errors
- [ ] Consumers can import: `import { processLinkTranslation, LinkTranslationResult } from '@/lib/job-queue'`

---

### Task 5: Write Unit Tests

**File:** `src/lib/job-queue/__tests__/link-processor.test.ts` (new file)
**Estimated Effort:** 25 minutes

#### Description
Create comprehensive unit tests for the `processLinkTranslation` function covering happy paths, error cases, and edge cases.

#### Implementation Steps

5.1. **Create test file with imports and mocks**:

```typescript
/**
 * Unit tests for processLinkTranslation
 * REQ-349: Implement Link Translation Processor
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processLinkTranslation } from '../job-processor';
import type { LinkTranslationResult } from '../job-processor';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn(),
}));

vi.mock('../translation-jobs', () => ({
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
}));

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '../translation-jobs';
```

5.2. **Add test setup and teardown**:

```typescript
describe('processLinkTranslation', () => {
  const mockJobId = 'job-test-123';
  const mockLinkId = 'link-test-456';
  const mockSourceLang = 'en' as const;
  const mockTargetLang = 'fr' as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
```

5.3. **Add happy path test - link with title**:

```typescript
  describe('Happy Path', () => {
    it('should successfully translate link title', async () => {
      // Mock link fetch
      const mockLink = {
        id: mockLinkId,
        title: 'How to operate the coffee maker - Video Guide',
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return { select: selectMock };
        }
        if (table === 'link_translations') {
          return { upsert: upsertMock };
        }
        return {};
      });

      // Mock translation
      (translateText as any).mockResolvedValueOnce({
        translatedText: 'Comment utiliser la cafetière - Guide vidéo',
      });

      (markJobCompleted as any).mockResolvedValue(undefined);

      // Execute
      const result = await processLinkTranslation(
        mockJobId,
        mockLinkId,
        mockSourceLang,
        mockTargetLang
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.jobId).toBe(mockJobId);
      expect(result.linkId).toBe(mockLinkId);
      expect(result.targetLanguage).toBe(mockTargetLang);
      expect(result.translatedFields?.title).toBe('Comment utiliser la cafetière - Guide vidéo');
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(markJobCompleted).toHaveBeenCalledWith(mockJobId);
    });

    it('should call translation service with correct context', async () => {
      const mockLink = {
        id: mockLinkId,
        title: 'Setup Guide PDF',
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'item_links') return { select: selectMock };
        if (table === 'link_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValueOnce({ translatedText: 'Guide d\'installation PDF' });
      (markJobCompleted as any).mockResolvedValue(undefined);

      await processLinkTranslation(mockJobId, mockLinkId, mockSourceLang, mockTargetLang);

      // Verify translation was called with correct parameters
      expect(translateText).toHaveBeenCalledWith(
        'Setup Guide PDF',
        'en',
        'fr',
        expect.objectContaining({
          context: expect.objectContaining({
            contentType: 'link_title',
          }),
        })
      );
    });
  });
```

5.4. **Add error case tests**:

```typescript
  describe('Error Cases', () => {
    it('should fail when link is not found', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      });

      (supabaseAdmin.from as any).mockImplementation(() => ({ select: selectMock }));
      (markJobFailed as any).mockResolvedValue(undefined);

      const result = await processLinkTranslation(
        mockJobId,
        mockLinkId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Link not found');
      expect(result.errorMessage).toContain(mockLinkId);
      expect(markJobFailed).toHaveBeenCalledWith(mockJobId, expect.stringContaining('Link not found'));
    });

    it('should fail when translation service fails', async () => {
      const mockLink = {
        id: mockLinkId,
        title: 'Test Link',
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      });

      (supabaseAdmin.from as any).mockImplementation(() => ({ select: selectMock }));
      (translateText as any).mockRejectedValue(new Error('API rate limit exceeded'));
      (markJobFailed as any).mockResolvedValue(undefined);

      const result = await processLinkTranslation(
        mockJobId,
        mockLinkId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('API rate limit exceeded');
      expect(markJobFailed).toHaveBeenCalledWith(mockJobId, 'API rate limit exceeded');
    });

    it('should fail when database storage fails', async () => {
      const mockLink = {
        id: mockLinkId,
        title: 'Test Link',
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: { message: 'Database connection lost' } });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'item_links') return { select: selectMock };
        if (table === 'link_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValue({ translatedText: 'Translated' });
      (markJobFailed as any).mockResolvedValue(undefined);

      const result = await processLinkTranslation(
        mockJobId,
        mockLinkId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Failed to store link translation');
      expect(markJobFailed).toHaveBeenCalled();
    });
  });
```

5.5. **Add edge case tests**:

```typescript
  describe('Edge Cases', () => {
    it('should use link source_language over provided sourceLanguage', async () => {
      const mockLink = {
        id: mockLinkId,
        title: 'Guide d\'utilisation', // French title
        source_language: 'fr', // Link is in French
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'item_links') return { select: selectMock };
        if (table === 'link_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValueOnce({ translatedText: 'User Guide' });
      (markJobCompleted as any).mockResolvedValue(undefined);

      await processLinkTranslation(
        mockJobId,
        mockLinkId,
        'en' as const, // Provided English, but link is French
        'de' as const
      );

      // Should use 'fr' (link's language) not 'en' (provided)
      expect(translateText).toHaveBeenCalledWith(
        'Guide d\'utilisation',
        'fr',
        'de',
        expect.any(Object)
      );
    });

    it('should fall back to provided sourceLanguage when link has no source_language', async () => {
      const mockLink = {
        id: mockLinkId,
        title: 'User Manual',
        source_language: null, // No source language set
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'item_links') return { select: selectMock };
        if (table === 'link_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValueOnce({ translatedText: 'Manuel utilisateur' });
      (markJobCompleted as any).mockResolvedValue(undefined);

      await processLinkTranslation(
        mockJobId,
        mockLinkId,
        'en' as const, // Should use this
        'fr' as const
      );

      // Should use 'en' (provided) since link has no source_language
      expect(translateText).toHaveBeenCalledWith(
        'User Manual',
        'en',
        'fr',
        expect.any(Object)
      );
    });

    it('should correctly store translation with UPSERT conflict handling', async () => {
      const mockLink = {
        id: mockLinkId,
        title: 'Video Tutorial',
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'item_links') return { select: selectMock };
        if (table === 'link_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValueOnce({ translatedText: 'Tutoriel vidéo' });
      (markJobCompleted as any).mockResolvedValue(undefined);

      await processLinkTranslation(mockJobId, mockLinkId, mockSourceLang, mockTargetLang);

      // Verify upsert was called with correct onConflict setting
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          link_id: mockLinkId,
          language: mockTargetLang,
          title: 'Tutoriel vidéo',
          translation_status: 'completed',
        }),
        expect.objectContaining({
          onConflict: 'link_id,language',
        })
      );
    });
  });
});
```

#### Acceptance Criteria
- [ ] Test file created at `src/lib/job-queue/__tests__/link-processor.test.ts`
- [ ] Happy path tests: link title translation with correct context
- [ ] Error tests: link not found, translation failure, storage failure
- [ ] Edge case tests: source language priority, null source_language fallback, UPSERT conflict handling
- [ ] All tests pass with `npm run test`
- [ ] Test coverage for `processLinkTranslation` is >= 90%

---

## Verification Checklist

After completing all tasks, verify the following:

### Functional Verification
- [ ] `processLinkTranslation` can be imported from `@/lib/job-queue`
- [ ] Function successfully translates a link when called directly
- [ ] Function correctly handles missing links (marks job failed)
- [ ] Function correctly handles translation errors (marks job failed)
- [ ] Function correctly handles storage errors (marks job failed)
- [ ] UPSERT correctly updates existing translations

### Integration Verification
- [ ] Generic `processJob` correctly delegates link jobs to `processLinkTranslation`
- [ ] `TranslationJobProcessor` class still works correctly
- [ ] Heartbeat mechanism still prevents lock timeouts
- [ ] All existing job processor tests pass

### Type Verification
- [ ] TypeScript compiles without errors
- [ ] `LinkTranslationResult` type is correct and complete
- [ ] No type errors in consumer code

---

## Key Differences from Item/Article Processors

| Aspect | Item Processor (REQ-348) | Article Processor (REQ-347) | Link Processor (REQ-349) |
|--------|-------------------------|----------------------------|--------------------------|
| Fields to translate | `name`, `description` | `title`, `description` | `title` only |
| Source table | `items` | `item_articles` | `item_links` |
| Target table | `item_translations` | `article_translations` | `link_translations` |
| Complexity | Medium (2 fields) | Medium (2 fields) | **Simple (1 field)** |

The link processor is the **simplest** of the entity processors since it only translates the `title` field. The URL itself is never translated as it points to external resources.

---

## Dependencies

### Upstream (Required Before Starting)
- REQ-243: Job queue module (COMPLETE)
- REQ-244: Job processor framework (COMPLETE)
- Translation service module (COMPLETE)

### Downstream (Will Use After Complete)
- REQ-347: Enhance job processor for content-specific handling (uses this processor)
- Translation status APIs (will call processor for retries)
- Manual translation override endpoints

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate:** The generic processing path in `processJob` still exists for other entity types, so those remain unaffected.

2. **Revert:** If needed, remove the entity type routing from `processJob` and revert to generic processing for links.

3. **Feature Flag:** Consider adding an environment variable `USE_DEDICATED_LINK_PROCESSOR=true/false` to control routing.

---

## References

- **Overview Document:** `/docs/REQ-349-implement-link-translation-processor-overview.md`
- **Requirements:** `/docs/gen_requests_epic3.md` (REQ-349)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.4)
- **Job Processor Source:** `/src/lib/job-queue/job-processor.ts`
- **Translation Service:** `/src/lib/translation-service/translation-service.ts`
- **Similar Implementation:** REQ-348 Item Translation Processor

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
*Last Modified: 2026-01-19 UTC*
