# REQ-350: Implement Tag Translation Processor - Detailed Task Breakdown

**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-350
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.5
**Story Points:** 1 (each sub-task)

---

## Document Overview

This document provides granular, actionable implementation tasks for REQ-350: Implement Tag Translation Processor. Each task is designed to be approximately 1 story point and can be executed sequentially by an AI coding agent or developer.

---

## Prerequisites

Before starting implementation, verify the following:

- [ ] Epic 1 translation infrastructure is complete (`src/lib/job-queue/` exists)
- [ ] `tag_translations` table exists in the database with proper schema
- [ ] Translation service is operational (`src/lib/translation-service/`)
- [ ] Job queue functions are available (`markJobCompleted`, `markJobFailed`, etc.)

---

## Implementation Tasks

### Task 1: Define TagTranslationResult Interface

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Add after the `TagContent` interface (approximately line 132)
**Estimated Effort:** ~10 minutes

#### Description
Add a dedicated result type for the tag translation processor that provides structured return information including success status, translated value, and timing metrics.

#### Code to Add

```typescript
/**
 * Result of processing a tag translation job
 * Part of REQ-350: Implement Tag Translation Processor
 */
export interface TagTranslationResult {
  /** Whether the translation succeeded */
  success: boolean;
  /** The translation job ID */
  jobId: string;
  /** The tag key that was translated */
  tagKey: string;
  /** Target language for the translation */
  targetLanguage: SupportedLanguage;
  /** Translated fields (present on success) */
  translatedFields?: {
    translated_value: string;
  };
  /** Error message (present on failure) */
  errorMessage?: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}
```

#### Acceptance Criteria
- [ ] `TagTranslationResult` interface is defined in `job-processor.ts`
- [ ] Interface includes all required fields: `success`, `jobId`, `tagKey`, `targetLanguage`, `translatedFields`, `errorMessage`, `processingTimeMs`
- [ ] Interface includes JSDoc documentation
- [ ] TypeScript compiles without errors

#### Verification Command
```bash
npx tsc --noEmit
```

---

### Task 2: Implement processTagTranslation Function - Core Structure

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Add after the `saveTranslation` function (approximately line 387)
**Estimated Effort:** ~15 minutes

#### Description
Create the main `processTagTranslation` function with parameter validation and basic structure. This task focuses on the function signature, timing initialization, and error handling framework.

#### Code to Add

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
 * @param tagKey - The tag key identifier (e.g., "kitchen", "bathroom")
 * @param sourceLanguage - Source language code (typically 'en')
 * @param targetLanguage - Target language code (e.g., 'fr', 'de')
 * @returns Processing result with success status and translated value
 *
 * @example
 * ```typescript
 * const result = await processTagTranslation(
 *   'job-123',
 *   'kitchen',
 *   'en',
 *   'fr'
 * );
 * if (result.success) {
 *   console.log(`Translated: ${result.translatedFields?.translated_value}`);
 * }
 * ```
 */
export async function processTagTranslation(
  jobId: string,
  tagKey: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TagTranslationResult> {
  const startTime = Date.now();

  // Validate inputs
  if (!jobId || !tagKey || !sourceLanguage || !targetLanguage) {
    const errorMessage = 'Missing required parameters for tag translation';
    console.error(`[TagProcessor] ${errorMessage}`, { jobId, tagKey, sourceLanguage, targetLanguage });
    return {
      success: false,
      jobId: jobId || 'unknown',
      tagKey: tagKey || 'unknown',
      targetLanguage: targetLanguage || 'en',
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }

  try {
    // Implementation continues in Task 3...
    // Placeholder for now - will be replaced
    throw new Error('Not implemented');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[TagProcessor] Job ${jobId} failed:`, errorMessage);

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

#### Acceptance Criteria
- [ ] Function signature matches the specification
- [ ] Parameter validation logs errors with context
- [ ] Error handling catches all exceptions and marks job as failed
- [ ] Processing time is calculated accurately
- [ ] JSDoc with example is present
- [ ] TypeScript compiles without errors

#### Verification Command
```bash
npx tsc --noEmit
```

---

### Task 3: Implement Tag Fetching Logic

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Inside `processTagTranslation` function, replace the placeholder try block
**Estimated Effort:** ~15 minutes

#### Description
Implement the logic to fetch the source tag from the `tag_translations` table using the English entry as the source content.

#### Code to Replace (in the try block)

Replace the placeholder:
```typescript
    // Implementation continues in Task 3...
    // Placeholder for now - will be replaced
    throw new Error('Not implemented');
```

With:
```typescript
    // Step 1: Fetch tag from tag_translations table (English entry as source)
    console.log(`[TagProcessor] Fetching tag: ${tagKey} (${sourceLanguage})`);

    const { data: tag, error: fetchError } = await supabaseAdmin
      .from('tag_translations')
      .select('tag_key, translated_value')
      .eq('tag_key', tagKey)
      .eq('language', sourceLanguage)
      .single();

    // Step 2: Validate tag exists
    if (fetchError || !tag) {
      const errorMessage = `Tag not found: ${tagKey} (language: ${sourceLanguage})`;
      console.error(`[TagProcessor] ${errorMessage}`, fetchError);

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

    // Validate tag has content to translate
    if (!tag.translated_value || tag.translated_value.trim() === '') {
      const errorMessage = `Tag has empty value: ${tagKey}`;
      console.error(`[TagProcessor] ${errorMessage}`);

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

    console.log(`[TagProcessor] Found tag: "${tag.translated_value}"`);

    // Step 3: Translate (continued in Task 4)
    // Placeholder
    throw new Error('Translation not implemented');
```

#### Acceptance Criteria
- [ ] Query uses `supabaseAdmin` to fetch from `tag_translations`
- [ ] Query filters by both `tag_key` and `language` (source language)
- [ ] Missing tag results in job marked as failed with descriptive error
- [ ] Empty tag value is handled as an error condition
- [ ] Logging provides sufficient context for debugging
- [ ] TypeScript compiles without errors

#### Verification Command
```bash
npx tsc --noEmit
```

---

### Task 4: Implement Translation Service Call

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Inside `processTagTranslation` function, replace the translation placeholder
**Estimated Effort:** ~15 minutes

#### Description
Implement the call to the translation service with appropriate context for tag content.

#### Code to Replace

Replace:
```typescript
    // Step 3: Translate (continued in Task 4)
    // Placeholder
    throw new Error('Translation not implemented');
```

With:
```typescript
    // Step 3: Translate the tag value
    console.log(`[TagProcessor] Translating "${tag.translated_value}" from ${sourceLanguage} to ${targetLanguage}`);

    let translationResult;
    try {
      translationResult = await translateText(
        tag.translated_value,
        sourceLanguage,
        targetLanguage,
        {
          context: {
            contentType: 'tag',
            domainContext: 'Category tag for organizing property items in vacation rental. Single word or short phrase.',
          },
        }
      );
    } catch (translationError) {
      const errorMessage = `Translation service error: ${translationError instanceof Error ? translationError.message : String(translationError)}`;
      console.error(`[TagProcessor] ${errorMessage}`);

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

    // Validate translation result
    if (!translationResult || !translationResult.translatedText) {
      const errorMessage = 'Translation service returned empty result';
      console.error(`[TagProcessor] ${errorMessage}`);

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

    console.log(`[TagProcessor] Translation result: "${translationResult.translatedText}"`);

    // Step 4: Store translation (continued in Task 5)
    // Placeholder
    throw new Error('Storage not implemented');
```

#### Acceptance Criteria
- [ ] `translateText` is called with correct parameters
- [ ] Context includes `contentType: 'tag'` and appropriate `domainContext`
- [ ] Translation errors are caught separately and handled gracefully
- [ ] Empty translation result is treated as an error
- [ ] Job is marked as failed if translation fails
- [ ] Logging tracks translation progress
- [ ] TypeScript compiles without errors

#### Verification Command
```bash
npx tsc --noEmit
```

---

### Task 5: Implement Translation Storage

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Inside `processTagTranslation` function, replace the storage placeholder
**Estimated Effort:** ~15 minutes

#### Description
Implement the UPSERT logic to store the translated tag value in the `tag_translations` table with `is_system_tag = false`.

#### Code to Replace

Replace:
```typescript
    // Step 4: Store translation (continued in Task 5)
    // Placeholder
    throw new Error('Storage not implemented');
```

With:
```typescript
    // Step 4: Store in tag_translations table (UPSERT)
    console.log(`[TagProcessor] Storing translation for ${tagKey}/${targetLanguage}`);

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
      console.error(`[TagProcessor] ${errorMessage}`, saveError);

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

    // Step 5: Mark job completed
    await markJobCompleted(jobId);

    const processingTimeMs = Date.now() - startTime;
    console.log(`[TagProcessor] Job ${jobId} completed in ${processingTimeMs}ms`);

    return {
      success: true,
      jobId,
      tagKey,
      targetLanguage,
      translatedFields: {
        translated_value: translationResult.translatedText,
      },
      processingTimeMs,
    };
```

#### Acceptance Criteria
- [ ] UPSERT uses correct table (`tag_translations`)
- [ ] UPSERT includes `is_system_tag: false` to mark as user tag
- [ ] `onConflict` handles duplicate key/language combinations
- [ ] Storage errors result in job marked as failed
- [ ] Successful storage results in job marked as completed
- [ ] Return value includes `translatedFields` with the translated value
- [ ] Processing time is calculated accurately
- [ ] TypeScript compiles without errors

#### Verification Command
```bash
npx tsc --noEmit
```

---

### Task 6: Export New Function and Type from Index

**File:** `src/lib/job-queue/index.ts`
**Location:** Add to existing exports
**Estimated Effort:** ~5 minutes

#### Description
Export the new `processTagTranslation` function and `TagTranslationResult` type from the module index for external consumption.

#### Code to Modify

Find the existing job processor function exports (around line 44):
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
} from './job-processor';
```

Replace with:
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
  // REQ-350: Tag Translation Processor
  processTagTranslation,
} from './job-processor';
```

Find the existing job processor type exports (around line 56):
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
} from './job-processor';
```

Replace with:
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
  // REQ-350: Tag Translation Processor
  TagTranslationResult,
} from './job-processor';
```

#### Acceptance Criteria
- [ ] `processTagTranslation` is exported from `index.ts`
- [ ] `TagTranslationResult` type is exported from `index.ts`
- [ ] Existing exports remain unchanged
- [ ] Module can be imported: `import { processTagTranslation, TagTranslationResult } from '@/lib/job-queue'`
- [ ] TypeScript compiles without errors

#### Verification Command
```bash
npx tsc --noEmit
```

---

### Task 7: Write Unit Tests - Happy Path

**File:** `src/lib/job-queue/__tests__/tag-processor.test.ts` (new file)
**Estimated Effort:** ~20 minutes

#### Description
Create unit tests for the `processTagTranslation` function covering the successful translation scenario.

#### Code to Add

```typescript
/**
 * Unit Tests for Tag Translation Processor
 * Part of REQ-350: Implement Tag Translation Processor
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processTagTranslation } from '../job-processor';
import type { TagTranslationResult } from '../job-processor';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '../translation-jobs';

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

describe('processTagTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Happy Path', () => {
    it('should successfully translate a tag and store the result', async () => {
      // Arrange
      const mockTag = {
        tag_key: 'kitchen',
        translated_value: 'Kitchen',
      };

      const mockTranslation = {
        translatedText: 'Cuisine',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      };

      // Mock fetch tag
      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockTag, error: null });

      // Mock upsert
      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'tag_translations') {
          return {
            select: selectMock,
            eq: eqMock,
            single: singleMock,
            upsert: upsertMock,
          } as any;
        }
        return {} as any;
      });

      selectMock.mockReturnValue({ eq: eqMock });
      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      vi.mocked(translateText).mockResolvedValue(mockTranslation as any);
      vi.mocked(markJobCompleted).mockResolvedValue();

      // Act
      const result: TagTranslationResult = await processTagTranslation(
        'job-123',
        'kitchen',
        'en',
        'fr'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.jobId).toBe('job-123');
      expect(result.tagKey).toBe('kitchen');
      expect(result.targetLanguage).toBe('fr');
      expect(result.translatedFields?.translated_value).toBe('Cuisine');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.errorMessage).toBeUndefined();

      // Verify translation was called
      expect(translateText).toHaveBeenCalledWith(
        'Kitchen',
        'en',
        'fr',
        expect.objectContaining({
          context: expect.objectContaining({
            contentType: 'tag',
          }),
        })
      );

      // Verify job was marked completed
      expect(markJobCompleted).toHaveBeenCalledWith('job-123');
      expect(markJobFailed).not.toHaveBeenCalled();
    });

    it('should set is_system_tag to false for user tags', async () => {
      // Arrange
      const mockTag = { tag_key: 'custom-tag', translated_value: 'Custom Tag' };

      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockTag, error: null });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        single: singleMock,
        upsert: upsertMock,
      } as any));

      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      vi.mocked(translateText).mockResolvedValue({
        translatedText: 'Etiqueta Personalizada',
      } as any);

      // Act
      await processTagTranslation('job-456', 'custom-tag', 'en', 'es');

      // Assert
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          is_system_tag: false,
        }),
        expect.any(Object)
      );
    });
  });
});
```

#### Acceptance Criteria
- [ ] Test file is created at correct location
- [ ] Happy path test verifies successful translation flow
- [ ] Test verifies `is_system_tag = false` is set
- [ ] Test verifies `markJobCompleted` is called on success
- [ ] All tests pass with `npm test`

#### Verification Command
```bash
npm test -- src/lib/job-queue/__tests__/tag-processor.test.ts
```

---

### Task 8: Write Unit Tests - Error Handling

**File:** `src/lib/job-queue/__tests__/tag-processor.test.ts`
**Location:** Add to existing test file
**Estimated Effort:** ~20 minutes

#### Description
Add unit tests for error scenarios including tag not found, translation failure, and storage failure.

#### Code to Add (append to existing test file)

```typescript
  describe('Error Handling', () => {
    it('should mark job as failed when tag is not found', async () => {
      // Arrange
      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Row not found' }
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        single: singleMock,
      } as any));

      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      // Act
      const result = await processTagTranslation('job-789', 'nonexistent', 'en', 'de');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Tag not found');
      expect(markJobFailed).toHaveBeenCalledWith('job-789', expect.stringContaining('Tag not found'));
      expect(markJobCompleted).not.toHaveBeenCalled();
    });

    it('should mark job as failed when translation service fails', async () => {
      // Arrange
      const mockTag = { tag_key: 'kitchen', translated_value: 'Kitchen' };

      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockTag, error: null });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        single: singleMock,
      } as any));

      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      vi.mocked(translateText).mockRejectedValue(new Error('API rate limit exceeded'));

      // Act
      const result = await processTagTranslation('job-abc', 'kitchen', 'en', 'it');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Translation service error');
      expect(markJobFailed).toHaveBeenCalledWith('job-abc', expect.stringContaining('API rate limit'));
    });

    it('should mark job as failed when database storage fails', async () => {
      // Arrange
      const mockTag = { tag_key: 'bathroom', translated_value: 'Bathroom' };

      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockTag, error: null });
      const upsertMock = vi.fn().mockResolvedValue({
        error: { message: 'Database connection failed' }
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        single: singleMock,
        upsert: upsertMock,
      } as any));

      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      vi.mocked(translateText).mockResolvedValue({
        translatedText: 'Salle de bain',
      } as any);

      // Act
      const result = await processTagTranslation('job-def', 'bathroom', 'en', 'fr');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Failed to store tag translation');
      expect(markJobFailed).toHaveBeenCalledWith('job-def', expect.stringContaining('Database connection'));
    });

    it('should handle empty tag value gracefully', async () => {
      // Arrange
      const mockTag = { tag_key: 'empty-tag', translated_value: '' };

      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockTag, error: null });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        single: singleMock,
      } as any));

      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      // Act
      const result = await processTagTranslation('job-empty', 'empty-tag', 'en', 'nl');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('empty value');
      expect(markJobFailed).toHaveBeenCalled();
    });

    it('should handle missing required parameters', async () => {
      // Act & Assert - missing jobId
      const result1 = await processTagTranslation('', 'kitchen', 'en', 'fr');
      expect(result1.success).toBe(false);
      expect(result1.errorMessage).toContain('Missing required parameters');

      // Act & Assert - missing tagKey
      const result2 = await processTagTranslation('job-123', '', 'en', 'fr');
      expect(result2.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in tag key', async () => {
      // Arrange
      const mockTag = { tag_key: 'coffee-maker', translated_value: 'Coffee Maker' };

      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockTag, error: null });
      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        single: singleMock,
        upsert: upsertMock,
      } as any));

      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      vi.mocked(translateText).mockResolvedValue({
        translatedText: 'Cafetière',
      } as any);

      // Act
      const result = await processTagTranslation('job-special', 'coffee-maker', 'en', 'fr');

      // Assert
      expect(result.success).toBe(true);
      expect(result.tagKey).toBe('coffee-maker');
    });

    it('should track processing time accurately', async () => {
      // Arrange
      const mockTag = { tag_key: 'test', translated_value: 'Test' };

      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockTag, error: null });
      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabaseAdmin.from).mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        single: singleMock,
        upsert: upsertMock,
      } as any));

      eqMock.mockImplementation(() => ({ eq: eqMock, single: singleMock }));

      // Add artificial delay
      vi.mocked(translateText).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { translatedText: 'Prueba' } as any;
      });

      // Act
      const result = await processTagTranslation('job-time', 'test', 'en', 'es');

      // Assert
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(50);
    });
  });
```

#### Acceptance Criteria
- [ ] Test covers tag not found scenario
- [ ] Test covers translation service failure
- [ ] Test covers database storage failure
- [ ] Test covers empty tag value
- [ ] Test covers missing parameters
- [ ] Test covers special characters in tag key
- [ ] Test verifies processing time tracking
- [ ] All tests pass with `npm test`

#### Verification Command
```bash
npm test -- src/lib/job-queue/__tests__/tag-processor.test.ts
```

---

### Task 9: Update processJob to Use Dedicated Processor (Optional Enhancement)

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** In the existing `processJob` function (around line 446)
**Estimated Effort:** ~10 minutes

#### Description
Optionally update the generic `processJob` function to delegate tag processing to the new `processTagTranslation` function for better separation of concerns.

**Note:** This is an optional enhancement. The existing generic `processJob` already handles tags via the switch statement. This task makes the code more modular and allows direct testing of the tag processor.

#### Code to Modify

In the `processJob` function, find the section that handles tags (currently using the generic `saveTranslation` function). The existing code already works, but for consistency with the architecture, you could modify it to call `processTagTranslation`.

However, since the current implementation already handles tags correctly through the generic flow, this task is **optional** and can be skipped if time is limited.

#### Acceptance Criteria
- [ ] (Optional) `processJob` delegates tag processing to `processTagTranslation`
- [ ] Existing functionality is preserved
- [ ] All existing tests continue to pass

---

## Post-Implementation Verification

### Build Verification
```bash
npm run build
```

### Test Verification
```bash
npm test -- src/lib/job-queue/__tests__/tag-processor.test.ts
```

### Type Check Verification
```bash
npx tsc --noEmit
```

### Manual Integration Test

1. Create a test tag in the `tag_translations` table (English):
```sql
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES ('test-tag-350', 'en', 'Test Tag', false);
```

2. Create a translation job:
```sql
INSERT INTO translation_jobs (entity_type, entity_id, source_language, target_language, status)
VALUES ('tag', 'test-tag-350', 'en', 'fr', 'queued');
```

3. Verify the processor handles it correctly by checking:
   - Job status changes to 'completed'
   - New entry in `tag_translations` with `language = 'fr'` and `is_system_tag = false`

---

## Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/job-queue/job-processor.ts` | MODIFY | Add `TagTranslationResult` type and `processTagTranslation` function |
| `src/lib/job-queue/index.ts` | MODIFY | Add exports for new function and type |
| `src/lib/job-queue/__tests__/tag-processor.test.ts` | CREATE | Unit tests for tag translation processor |

---

## Dependencies

### Internal Dependencies
- `src/lib/supabase.ts` - Database client
- `src/lib/translation-service/translation-service.ts` - `translateText` function
- `src/lib/job-queue/translation-jobs.ts` - `markJobCompleted`, `markJobFailed` functions

### Database Dependencies
- `tag_translations` table must exist with columns: `tag_key`, `language`, `translated_value`, `is_system_tag`
- Unique constraint on `(tag_key, language)` for UPSERT to work correctly

---

## References

- **Overview Document:** `/docs/REQ-350-implement-tag-translation-processor-overview.md`
- **Requirements:** `/docs/gen_requests_epic3.md` (REQ-350)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.5)
- **Similar Implementations:** REQ-348 Item Processor, REQ-349 Link Processor

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
*Last Modified: 2026-01-19 UTC*
