# REQ-348: Implement Item Translation Processor - Detailed Task Breakdown

**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-348
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.2

---

## Document Overview

This document provides a detailed, step-by-step task breakdown for implementing a dedicated `processItemTranslation` function. This processor handles translation jobs specifically for items by fetching the source item, translating its `name` and `description` fields, and storing results in the `item_translations` table.

**Source Documents:**
- Overview: `/docs/REQ-348-implement-item-translation-processor-overview.md`
- Requirements: `/docs/gen_requests_epic3.md` (REQ-348)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.2)

---

## Prerequisites

Before starting implementation, verify the following are complete:

- [x] Job queue infrastructure exists (`src/lib/job-queue/`)
- [x] Translation service is operational (`src/lib/translation-service/`)
- [x] `items` table exists with `name`, `description`, `source_language` columns
- [x] `item_translations` table exists with required columns
- [x] `translation_jobs` table exists with job tracking fields
- [x] `fetchEntityContent()` function exists (can be used for reference)
- [x] `saveTranslation()` function exists (can be used for reference)
- [x] `markJobCompleted()` and `markJobFailed()` helper functions exist

---

## Task Summary

| Task # | Description | Estimated Effort | File(s) |
|--------|-------------|------------------|---------|
| 1 | Define ItemTranslationResult type | 10 min | `src/lib/job-queue/job-processor.ts` |
| 2 | Implement processItemTranslation function | 45 min | `src/lib/job-queue/job-processor.ts` |
| 3 | Update processJob to delegate to dedicated processor | 15 min | `src/lib/job-queue/job-processor.ts` |
| 4 | Export new function and type | 5 min | `src/lib/job-queue/index.ts` |
| 5 | Write unit tests | 30 min | `src/lib/job-queue/__tests__/item-processor.test.ts` |
| **Total** | | **~1.75 hours** | |

---

## Detailed Tasks

### Task 1: Define ItemTranslationResult Type

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** After existing type definitions (approximately line 130, after `TagContent` interface)
**Estimated Effort:** 10 minutes

#### Description
Add a dedicated result type for the item translation processor. This provides a strongly-typed return value that includes item-specific translated fields and processing metadata.

#### Implementation Steps

1.1. **Add the ItemTranslationResult interface** after the existing `TagContent` interface (around line 132):

```typescript
/**
 * Result of processing an item translation job
 * Returned by processItemTranslation function
 */
export interface ItemTranslationResult {
  /** Whether the translation was successful */
  success: boolean;
  /** The job ID that was processed */
  jobId: string;
  /** The item ID that was translated */
  itemId: string;
  /** Target language the content was translated to */
  targetLanguage: SupportedLanguage;
  /** Translated field values (only present on success) */
  translatedFields?: {
    name: string;
    description: string | null;
  };
  /** Error message (only present on failure) */
  errorMessage?: string;
  /** Time taken to process in milliseconds */
  processingTimeMs: number;
}
```

#### Acceptance Criteria
- [ ] `ItemTranslationResult` interface is defined in `job-processor.ts`
- [ ] Interface includes `success`, `jobId`, `itemId`, `targetLanguage` required fields
- [ ] Interface includes optional `translatedFields` object with `name` and `description`
- [ ] Interface includes optional `errorMessage` field for failure cases
- [ ] Interface includes `processingTimeMs` for timing metrics
- [ ] TypeScript compiles without errors

---

### Task 2: Implement processItemTranslation Function

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** After `saveTranslation()` function (approximately line 388)
**Estimated Effort:** 45 minutes

#### Description
Create the dedicated `processItemTranslation` function that handles the complete translation workflow for items. This function should be callable directly (not just through the generic processor) for manual/retry operations and isolated testing.

#### Implementation Steps

2.1. **Add the function signature and JSDoc**:

```typescript
/**
 * Process a translation job for an item entity
 *
 * Dedicated processor for item translations that:
 * 1. Fetches the source item from the items table
 * 2. Translates name and description fields to target language
 * 3. Stores results in item_translations table (UPSERT)
 * 4. Updates job status to completed or failed
 *
 * @param jobId - The translation job ID for status updates
 * @param itemId - The item entity ID to translate
 * @param sourceLanguage - Source language code (e.g., 'en')
 * @param targetLanguage - Target language code (e.g., 'fr')
 * @returns Processing result with success status and translated fields
 *
 * @example
 * ```typescript
 * const result = await processItemTranslation(
 *   'job-123',
 *   'item-456',
 *   'en',
 *   'fr'
 * );
 * if (result.success) {
 *   console.log('Translated name:', result.translatedFields?.name);
 * }
 * ```
 */
export async function processItemTranslation(
  jobId: string,
  itemId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<ItemTranslationResult> {
  // Implementation follows
}
```

2.2. **Add timing and error handling wrapper**:

```typescript
export async function processItemTranslation(
  jobId: string,
  itemId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<ItemTranslationResult> {
  const startTime = Date.now();

  try {
    // Step 1: Fetch item from database
    // Step 2: Translate fields
    // Step 3: Store translation
    // Step 4: Mark job completed
    // Step 5: Return success result
  } catch (error) {
    // Handle errors and mark job failed
  }
}
```

2.3. **Implement Step 1 - Fetch item from database**:

```typescript
// Step 1: Fetch item from items table
const { data: item, error: fetchError } = await supabaseAdmin
  .from('items')
  .select('id, name, description, source_language')
  .eq('id', itemId)
  .single();

if (fetchError || !item) {
  const errorMessage = `Item not found: ${itemId}`;
  await markJobFailed(jobId, errorMessage);
  return {
    success: false,
    jobId,
    itemId,
    targetLanguage,
    errorMessage,
    processingTimeMs: Date.now() - startTime,
  };
}

// Use item's source_language if available, otherwise use provided
const effectiveSourceLanguage = (item.source_language as SupportedLanguage) || sourceLanguage;
```

2.4. **Implement Step 2 - Translate name and description fields**:

```typescript
// Step 2: Translate name and description
const context = {
  domainContext: 'Household item or appliance in vacation rental property. Name and usage instructions.',
};

let translatedName: string;
let translatedDescription: string | null = null;

try {
  // Translate name (required field)
  const nameResult = await translateText(item.name, effectiveSourceLanguage, targetLanguage, {
    context: {
      contentType: 'item_name',
      domainContext: context.domainContext,
    },
  });
  translatedName = nameResult.translatedText;

  // Translate description (optional field)
  if (item.description && item.description.trim() !== '') {
    const descResult = await translateText(item.description, effectiveSourceLanguage, targetLanguage, {
      context: {
        contentType: 'item_description',
        domainContext: context.domainContext,
      },
    });
    translatedDescription = descResult.translatedText;
  }
} catch (translationError) {
  const errorMessage = translationError instanceof Error
    ? translationError.message
    : 'Translation service failed';
  await markJobFailed(jobId, errorMessage);
  return {
    success: false,
    jobId,
    itemId,
    targetLanguage,
    errorMessage,
    processingTimeMs: Date.now() - startTime,
  };
}
```

2.5. **Implement Step 3 - Store translation in item_translations table**:

```typescript
// Step 3: Store in item_translations (UPSERT)
const now = new Date().toISOString();
const { error: saveError } = await supabaseAdmin
  .from('item_translations')
  .upsert(
    {
      item_id: itemId,
      language: targetLanguage,
      name: translatedName,
      description: translatedDescription,
      translation_status: 'completed',
      translated_at: now,
      updated_at: now,
    },
    {
      onConflict: 'item_id,language',
    }
  );

if (saveError) {
  const errorMessage = `Failed to store translation: ${saveError.message}`;
  await markJobFailed(jobId, errorMessage);
  return {
    success: false,
    jobId,
    itemId,
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
  itemId,
  targetLanguage,
  translatedFields: {
    name: translatedName,
    description: translatedDescription,
  },
  processingTimeMs: Date.now() - startTime,
};
```

2.7. **Complete implementation with full error handling**:

The complete function should look like this:

```typescript
export async function processItemTranslation(
  jobId: string,
  itemId: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<ItemTranslationResult> {
  const startTime = Date.now();

  try {
    // Step 1: Fetch item from items table
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('id, name, description, source_language')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) {
      const errorMessage = `Item not found: ${itemId}`;
      await markJobFailed(jobId, errorMessage);
      return {
        success: false,
        jobId,
        itemId,
        targetLanguage,
        errorMessage,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Use item's source_language if available, otherwise use provided
    const effectiveSourceLanguage = (item.source_language as SupportedLanguage) || sourceLanguage;

    const context = {
      domainContext: 'Household item or appliance in vacation rental property. Name and usage instructions.',
    };

    let translatedName: string;
    let translatedDescription: string | null = null;

    // Step 2: Translate name and description
    try {
      // Translate name (required field)
      const nameResult = await translateText(item.name, effectiveSourceLanguage, targetLanguage, {
        context: {
          contentType: 'item_name',
          domainContext: context.domainContext,
        },
      });
      translatedName = nameResult.translatedText;

      // Translate description (optional field)
      if (item.description && item.description.trim() !== '') {
        const descResult = await translateText(item.description, effectiveSourceLanguage, targetLanguage, {
          context: {
            contentType: 'item_description',
            domainContext: context.domainContext,
          },
        });
        translatedDescription = descResult.translatedText;
      }
    } catch (translationError) {
      const errorMessage = translationError instanceof Error
        ? translationError.message
        : 'Translation service failed';
      await markJobFailed(jobId, errorMessage);
      return {
        success: false,
        jobId,
        itemId,
        targetLanguage,
        errorMessage,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Step 3: Store in item_translations (UPSERT)
    const now = new Date().toISOString();
    const { error: saveError } = await supabaseAdmin
      .from('item_translations')
      .upsert(
        {
          item_id: itemId,
          language: targetLanguage,
          name: translatedName,
          description: translatedDescription,
          translation_status: 'completed',
          translated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'item_id,language',
        }
      );

    if (saveError) {
      const errorMessage = `Failed to store translation: ${saveError.message}`;
      await markJobFailed(jobId, errorMessage);
      return {
        success: false,
        jobId,
        itemId,
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
      itemId,
      targetLanguage,
      translatedFields: {
        name: translatedName,
        description: translatedDescription,
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error processing item translation';

    try {
      await markJobFailed(jobId, errorMessage);
    } catch {
      // Ignore failure to mark job failed
      console.error('[processItemTranslation] Failed to mark job as failed:', jobId);
    }

    return {
      success: false,
      jobId,
      itemId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

#### Acceptance Criteria
- [ ] `processItemTranslation` function accepts `jobId`, `itemId`, `sourceLanguage`, `targetLanguage` parameters
- [ ] Function fetches item from `items` table using provided `itemId`
- [ ] If item not found, job is marked failed with "Item not found: {itemId}" message
- [ ] Name field is translated using translation service with `item_name` content type
- [ ] Description field is translated (if non-null/non-empty) with `item_description` content type
- [ ] If translation fails, job is marked failed with translation error message
- [ ] Translated fields are stored in `item_translations` table using UPSERT
- [ ] UPSERT uses `onConflict: 'item_id,language'` to update existing records
- [ ] After successful storage, job is marked completed
- [ ] Function returns `ItemTranslationResult` with appropriate success/failure data
- [ ] `processingTimeMs` is accurately calculated in all return paths

---

### Task 3: Update processJob to Delegate to Dedicated Processor

**File:** `src/lib/job-queue/job-processor.ts`
**Location:** Inside `processJob()` function (approximately lines 446-542)
**Estimated Effort:** 15 minutes

#### Description
Update the existing generic `processJob()` function to delegate item translations to the new dedicated `processItemTranslation()` function. This maintains backward compatibility while enabling the dedicated processor.

#### Implementation Steps

3.1. **Locate the processJob function** (around line 446) and find the section handling item translations.

3.2. **Add entity type routing before the generic translation logic**:

Currently, the `processJob` function processes all entity types generically. Add a switch statement or early return at the beginning to route item translations to the dedicated processor:

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
      const result = await processItemTranslation(
        job.id,
        entityId,
        sourceLanguage,
        targetLanguage
      );

      // Map ItemTranslationResult to JobProcessingResult
      return {
        jobId: result.jobId,
        success: result.success,
        entityType: 'item',
        entityId: result.itemId,
        targetLanguage: result.targetLanguage,
        translatedFields: result.translatedFields ? {
          name: result.translatedFields.name,
          description: result.translatedFields.description ?? '',
        } : undefined,
        errorMessage: result.errorMessage,
        processingTimeMs: result.processingTimeMs,
      };
    }

    // Existing generic processing for other entity types follows...
    // (article, link, tag)
```

3.3. **Ensure heartbeat is stopped in the dedicated processor flow**:

Note that since `processItemTranslation` is now a standalone function, the heartbeat management should be handled at the `processJob` level:

```typescript
try {
  if (entityType === 'item') {
    const result = await processItemTranslation(
      job.id,
      entityId,
      sourceLanguage,
      targetLanguage
    );

    return {
      jobId: result.jobId,
      success: result.success,
      entityType: 'item',
      entityId: result.itemId,
      targetLanguage: result.targetLanguage,
      translatedFields: result.translatedFields ? {
        name: result.translatedFields.name,
        description: result.translatedFields.description ?? '',
      } : undefined,
      errorMessage: result.errorMessage,
      processingTimeMs: result.processingTimeMs,
    };
  }

  // Rest of generic processing...

} finally {
  stopHeartbeat();
}
```

#### Acceptance Criteria
- [ ] `processJob` function routes item translations to `processItemTranslation`
- [ ] Heartbeat is properly managed (started before, stopped after)
- [ ] `ItemTranslationResult` is correctly mapped to `JobProcessingResult`
- [ ] Other entity types (article, link, tag) continue to use generic processing
- [ ] All existing tests pass after modification

---

### Task 4: Export New Function and Type

**File:** `src/lib/job-queue/index.ts`
**Location:** Add to existing exports section
**Estimated Effort:** 5 minutes

#### Description
Export the new `processItemTranslation` function and `ItemTranslationResult` type from the job-queue module's public API.

#### Implementation Steps

4.1. **Add type export for ItemTranslationResult**:

In the type exports section (around line 56-66), add:

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
  ItemTranslationResult, // NEW: REQ-348
} from './job-processor';
```

4.2. **Add function export for processItemTranslation**:

In the function exports section (around line 43-53), add:

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
  processItemTranslation, // NEW: REQ-348
} from './job-processor';
```

#### Acceptance Criteria
- [ ] `ItemTranslationResult` type is exported from `@/lib/job-queue`
- [ ] `processItemTranslation` function is exported from `@/lib/job-queue`
- [ ] Module compiles without errors
- [ ] Consumers can import: `import { processItemTranslation, ItemTranslationResult } from '@/lib/job-queue'`

---

### Task 5: Write Unit Tests

**File:** `src/lib/job-queue/__tests__/item-processor.test.ts` (new file)
**Estimated Effort:** 30 minutes

#### Description
Create comprehensive unit tests for the `processItemTranslation` function covering happy paths, error cases, and edge cases.

#### Implementation Steps

5.1. **Create test file with imports and mocks**:

```typescript
/**
 * Unit tests for processItemTranslation
 * REQ-348: Implement Item Translation Processor
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processItemTranslation } from '../job-processor';
import type { ItemTranslationResult } from '../job-processor';

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
describe('processItemTranslation', () => {
  const mockJobId = 'job-test-123';
  const mockItemId = 'item-test-456';
  const mockSourceLang = 'en' as const;
  const mockTargetLang = 'fr' as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
```

5.3. **Add happy path test - item with name and description**:

```typescript
  describe('Happy Path', () => {
    it('should successfully translate item with name and description', async () => {
      // Mock item fetch
      const mockItem = {
        id: mockItemId,
        name: 'Coffee Maker',
        description: 'Press the power button to start',
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'items') {
          return { select: selectMock };
        }
        if (table === 'item_translations') {
          return { upsert: upsertMock };
        }
        return {};
      });

      // Mock translation
      (translateText as any)
        .mockResolvedValueOnce({ translatedText: 'Cafetière' })
        .mockResolvedValueOnce({ translatedText: 'Appuyez sur le bouton marche pour démarrer' });

      (markJobCompleted as any).mockResolvedValue(undefined);

      // Execute
      const result = await processItemTranslation(
        mockJobId,
        mockItemId,
        mockSourceLang,
        mockTargetLang
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.jobId).toBe(mockJobId);
      expect(result.itemId).toBe(mockItemId);
      expect(result.targetLanguage).toBe(mockTargetLang);
      expect(result.translatedFields?.name).toBe('Cafetière');
      expect(result.translatedFields?.description).toBe('Appuyez sur le bouton marche pour démarrer');
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(markJobCompleted).toHaveBeenCalledWith(mockJobId);
    });

    it('should successfully translate item with name only (null description)', async () => {
      const mockItem = {
        id: mockItemId,
        name: 'TV Remote',
        description: null,
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'items') return { select: selectMock };
        if (table === 'item_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValueOnce({ translatedText: 'Télécommande TV' });
      (markJobCompleted as any).mockResolvedValue(undefined);

      const result = await processItemTranslation(
        mockJobId,
        mockItemId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(true);
      expect(result.translatedFields?.name).toBe('Télécommande TV');
      expect(result.translatedFields?.description).toBeNull();
      // translateText should only be called once (for name)
      expect(translateText).toHaveBeenCalledTimes(1);
    });
  });
```

5.4. **Add error case tests**:

```typescript
  describe('Error Cases', () => {
    it('should fail when item is not found', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      });

      (supabaseAdmin.from as any).mockImplementation(() => ({ select: selectMock }));
      (markJobFailed as any).mockResolvedValue(undefined);

      const result = await processItemTranslation(
        mockJobId,
        mockItemId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Item not found');
      expect(result.errorMessage).toContain(mockItemId);
      expect(markJobFailed).toHaveBeenCalledWith(mockJobId, expect.stringContaining('Item not found'));
    });

    it('should fail when translation service fails', async () => {
      const mockItem = {
        id: mockItemId,
        name: 'Test Item',
        description: null,
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
        }),
      });

      (supabaseAdmin.from as any).mockImplementation(() => ({ select: selectMock }));
      (translateText as any).mockRejectedValue(new Error('API rate limit exceeded'));
      (markJobFailed as any).mockResolvedValue(undefined);

      const result = await processItemTranslation(
        mockJobId,
        mockItemId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('API rate limit exceeded');
      expect(markJobFailed).toHaveBeenCalledWith(mockJobId, 'API rate limit exceeded');
    });

    it('should fail when database storage fails', async () => {
      const mockItem = {
        id: mockItemId,
        name: 'Test Item',
        description: null,
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: { message: 'Database connection lost' } });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'items') return { select: selectMock };
        if (table === 'item_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValue({ translatedText: 'Translated' });
      (markJobFailed as any).mockResolvedValue(undefined);

      const result = await processItemTranslation(
        mockJobId,
        mockItemId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Failed to store translation');
      expect(markJobFailed).toHaveBeenCalled();
    });
  });
```

5.5. **Add edge case tests**:

```typescript
  describe('Edge Cases', () => {
    it('should treat empty string description as null', async () => {
      const mockItem = {
        id: mockItemId,
        name: 'Item',
        description: '   ', // whitespace only
        source_language: 'en',
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'items') return { select: selectMock };
        if (table === 'item_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValueOnce({ translatedText: 'Élément' });
      (markJobCompleted as any).mockResolvedValue(undefined);

      const result = await processItemTranslation(
        mockJobId,
        mockItemId,
        mockSourceLang,
        mockTargetLang
      );

      expect(result.success).toBe(true);
      expect(result.translatedFields?.description).toBeNull();
      // Only name should be translated, not empty description
      expect(translateText).toHaveBeenCalledTimes(1);
    });

    it('should use item source_language over provided sourceLanguage', async () => {
      const mockItem = {
        id: mockItemId,
        name: 'Élément',
        description: null,
        source_language: 'fr', // Item is in French
      };

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
        }),
      });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      (supabaseAdmin.from as any).mockImplementation((table: string) => {
        if (table === 'items') return { select: selectMock };
        if (table === 'item_translations') return { upsert: upsertMock };
        return {};
      });

      (translateText as any).mockResolvedValueOnce({ translatedText: 'Element' });
      (markJobCompleted as any).mockResolvedValue(undefined);

      await processItemTranslation(
        mockJobId,
        mockItemId,
        'en' as const, // Provided English, but item is French
        'de' as const
      );

      // Should use 'fr' (item's language) not 'en' (provided)
      expect(translateText).toHaveBeenCalledWith(
        'Élément',
        'fr',
        'de',
        expect.any(Object)
      );
    });
  });
});
```

#### Acceptance Criteria
- [ ] Test file created at `src/lib/job-queue/__tests__/item-processor.test.ts`
- [ ] Happy path tests: item with name+description, item with name only
- [ ] Error tests: item not found, translation failure, storage failure
- [ ] Edge case tests: empty description, source language priority
- [ ] All tests pass with `npm run test`
- [ ] Test coverage for `processItemTranslation` is >= 90%

---

## Verification Checklist

After completing all tasks, verify the following:

### Functional Verification
- [ ] `processItemTranslation` can be imported from `@/lib/job-queue`
- [ ] Function successfully translates an item when called directly
- [ ] Function correctly handles missing items (marks job failed)
- [ ] Function correctly handles translation errors (marks job failed)
- [ ] Function correctly handles storage errors (marks job failed)
- [ ] UPSERT correctly updates existing translations

### Integration Verification
- [ ] Generic `processJob` correctly delegates item jobs to `processItemTranslation`
- [ ] `TranslationJobProcessor` class still works correctly
- [ ] Heartbeat mechanism still prevents lock timeouts
- [ ] All existing job processor tests pass

### Type Verification
- [ ] TypeScript compiles without errors
- [ ] `ItemTranslationResult` type is correct and complete
- [ ] No type errors in consumer code

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

1. **Immediate:** The generic processing path in `processJob` still exists for article, link, and tag entities, so those remain unaffected.

2. **Revert:** If needed, remove the entity type routing from `processJob` and revert to generic processing for items.

3. **Feature Flag:** Consider adding an environment variable `USE_DEDICATED_ITEM_PROCESSOR=true/false` to control routing.

---

## References

- **Overview Document:** `/docs/REQ-348-implement-item-translation-processor-overview.md`
- **Requirements:** `/docs/gen_requests_epic3.md` (REQ-348)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 3.2)
- **Job Processor Source:** `/src/lib/job-queue/job-processor.ts`
- **Translation Service:** `/src/lib/translation-service/translation-service.ts`

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
*Last Modified: 2026-01-19 UTC*
