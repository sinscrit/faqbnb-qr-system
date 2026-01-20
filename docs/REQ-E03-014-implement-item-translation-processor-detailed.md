# Detailed Task Breakdown: REQ-E03-014 - Implement Item Translation Processor

**Generated:** 2026-01-20 12:30:00 UTC
**Last Modified:** 2026-01-20 12:30:00 UTC
**Request ID:** REQ-E03-014
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.2
**Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** REQ-E03-013 (Enhance Job Processor for Content-Specific Handling)

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for creating the item translation processor. Each task is designed to be approximately 1 story point and can be executed sequentially by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] REQ-E03-001 (Content translation module structure) is complete
- [ ] REQ-E03-005 (Translation storage utilities) is complete - OR storeItemTranslation can be reused from job-processor.ts
- [ ] REQ-E03-013 (Job processor entity routing) is complete
- [ ] Epic 1 translation service is operational (`/src/lib/translation-service/`)
- [ ] Epic 1 job queue infrastructure exists (`/src/lib/job-queue/`)
- [ ] Database tables exist: `items`, `item_translations`, `translation_jobs`

---

## Implementation Tasks

### Task 1: Create Item Processor File Structure

**File:** `/src/lib/content-translation/processors/item-processor.ts`

**Objective:** Create the item processor file with proper imports and type definitions.

**Steps:**

1. Create the directory if it doesn't exist: `/src/lib/content-translation/processors/`
2. Create the file `item-processor.ts`
3. Add file header documentation with creation date and module purpose
4. Add the following imports:

```typescript
/**
 * Item Translation Processor
 * Part of REQ-E03-014: Implement Item Translation Processor
 *
 * Processes translation jobs for item entities. Retrieves item records,
 * translates name and description fields, stores results, and updates job status.
 *
 * @module content-translation/processors/item-processor
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import type { TranslationJob, SupportedLanguage, EntityType } from '@/lib/job-queue/translation-jobs.types';
import type { TranslationContext } from '@/lib/translation-service/translation-service.types';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
```

**Acceptance Criteria:**
- [ ] File exists at `/src/lib/content-translation/processors/item-processor.ts`
- [ ] File contains proper header documentation
- [ ] All required imports are present and resolve without errors
- [ ] TypeScript compilation succeeds

---

### Task 2: Define Item Processor Types

**File:** `/src/lib/content-translation/processors/item-processor.ts`

**Objective:** Define TypeScript interfaces for the item processor's inputs, outputs, and internal data structures.

**Steps:**

1. Add the following type definitions after the imports:

```typescript
// ===========================================================================
// Type Definitions
// ===========================================================================

/**
 * Item content retrieved from the database for translation
 */
interface ItemData {
  id: string;
  name: string;
  description: string | null;
  source_language: SupportedLanguage | null;
}

/**
 * Translated item fields ready for storage
 */
interface TranslatedItemFields {
  name: string;
  description?: string;
}

/**
 * Result of processing an item translation job
 */
export interface ItemProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'item';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: TranslatedItemFields;
  errorMessage?: string;
  errorType?: 'permanent' | 'transient';
  processingTimeMs: number;
}

/**
 * Error classification for determining retry behavior
 */
type ErrorClassification = {
  type: 'permanent' | 'transient';
  message: string;
};
```

**Acceptance Criteria:**
- [ ] `ItemData` interface matches items table schema
- [ ] `TranslatedItemFields` interface covers name and optional description
- [ ] `ItemProcessingResult` interface includes all required fields from overview document
- [ ] `ErrorClassification` type supports permanent vs transient distinction
- [ ] TypeScript compilation succeeds

---

### Task 3: Implement Error Classification Helper

**File:** `/src/lib/content-translation/processors/item-processor.ts`

**Objective:** Create a helper function that categorizes errors as permanent (no retry) or transient (retry with backoff).

**Steps:**

1. Add the error classification function:

```typescript
// ===========================================================================
// Error Classification
// ===========================================================================

/**
 * Classify an error as permanent or transient for retry decisions
 *
 * Permanent errors (no retry):
 * - Item not found (deleted)
 * - Invalid UUID format
 * - Unsupported language
 * - Max retries exceeded
 *
 * Transient errors (retry with backoff):
 * - Rate limit exceeded
 * - Network timeout
 * - Translation service unavailable
 * - Database connection error
 *
 * @param error - The error to classify
 * @param job - The job being processed (to check attempts)
 * @returns Error classification with type and message
 */
function categorizeError(error: unknown, job: TranslationJob): ErrorClassification {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Permanent errors - do not retry
  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('deleted') ||
    lowerMessage.includes('does not exist')
  ) {
    return { type: 'permanent', message: `Item not found: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('invalid uuid') ||
    lowerMessage.includes('invalid id') ||
    lowerMessage.includes('malformed')
  ) {
    return { type: 'permanent', message: `Invalid item ID format: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('unsupported language') ||
    lowerMessage.includes('invalid language')
  ) {
    return { type: 'permanent', message: `Unsupported language: ${errorMessage}` };
  }

  // Check if max retries exceeded (default max: 3)
  const maxRetries = 3;
  if (job.attempts >= maxRetries) {
    return { type: 'permanent', message: `Max retries exceeded (${maxRetries}): ${errorMessage}` };
  }

  // Transient errors - can retry
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('429')
  ) {
    return { type: 'transient', message: `Rate limit exceeded: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('econnreset') ||
    lowerMessage.includes('network')
  ) {
    return { type: 'transient', message: `Network error: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('service unavailable') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('gateway')
  ) {
    return { type: 'transient', message: `Service unavailable: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('connection') ||
    lowerMessage.includes('database') ||
    lowerMessage.includes('supabase')
  ) {
    return { type: 'transient', message: `Database error: ${errorMessage}` };
  }

  // Default to transient for unknown errors (safer - allows retry)
  return { type: 'transient', message: errorMessage };
}
```

**Acceptance Criteria:**
- [ ] Function correctly identifies permanent errors (not found, invalid UUID, unsupported language)
- [ ] Function correctly identifies transient errors (rate limit, timeout, service unavailable)
- [ ] Function checks job attempts against max retry limit
- [ ] Function returns appropriate error messages
- [ ] TypeScript compilation succeeds

---

### Task 4: Implement Fetch Item Helper Function

**File:** `/src/lib/content-translation/processors/item-processor.ts`

**Objective:** Create a helper function to retrieve item data from the database with proper error handling.

**Steps:**

1. Add the fetch item helper function:

```typescript
// ===========================================================================
// Data Fetching
// ===========================================================================

/**
 * Fetch item record from the database for translation
 *
 * @param itemId - UUID of the item to fetch
 * @returns Item data if found, null otherwise
 * @throws Error if database query fails
 */
async function fetchItemForTranslation(itemId: string): Promise<ItemData | null> {
  console.log(`[ItemProcessor] Fetching item ${itemId} for translation`);

  const { data, error } = await supabaseAdmin
    .from('items')
    .select('id, name, description, source_language')
    .eq('id', itemId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      console.warn(`[ItemProcessor] Item ${itemId} not found`);
      return null;
    }
    console.error(`[ItemProcessor] Database error fetching item ${itemId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    console.warn(`[ItemProcessor] Item ${itemId} returned empty data`);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    source_language: data.source_language as SupportedLanguage | null,
  };
}
```

**Acceptance Criteria:**
- [ ] Function queries items table with correct columns (id, name, description, source_language)
- [ ] Function uses `.single()` to fetch one record
- [ ] Function handles "not found" error code (PGRST116) by returning null
- [ ] Function throws on other database errors
- [ ] Function logs fetch attempts and results
- [ ] TypeScript compilation succeeds

---

### Task 5: Implement Translate Item Fields Helper

**File:** `/src/lib/content-translation/processors/item-processor.ts`

**Objective:** Create a helper function that translates the name and description fields using the translation service with domain-specific context.

**Steps:**

1. Add the translation helper function:

```typescript
// ===========================================================================
// Translation Logic
// ===========================================================================

/**
 * Translation context for item name field
 */
const NAME_CONTEXT: TranslationContext = {
  contentType: 'item_name',
  domainContext: 'Household item or appliance name in a vacation rental property. Keep it concise and natural.',
  maxLength: 255,
  tone: 'concise',
};

/**
 * Translation context for item description field
 */
const DESCRIPTION_CONTEXT: TranslationContext = {
  contentType: 'item_description',
  domainContext: 'Description of a household item or appliance for vacation rental guests. Maintain helpful, friendly tone.',
  tone: 'friendly',
};

/**
 * Translate item name and description fields
 *
 * @param item - Item data to translate
 * @param sourceLanguage - Source language of the content
 * @param targetLanguage - Target language for translation
 * @returns Translated fields object
 * @throws Error if translation fails for required fields
 */
async function translateItemFields(
  item: ItemData,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslatedItemFields> {
  console.log(`[ItemProcessor] Translating item ${item.id} from ${sourceLanguage} to ${targetLanguage}`);

  const result: TranslatedItemFields = {
    name: '', // Will be populated below
  };

  // Translate name (required field)
  if (!item.name || item.name.trim() === '') {
    throw new Error('Item name is empty - cannot translate');
  }

  const nameResult = await translateText(
    item.name,
    sourceLanguage,
    targetLanguage,
    { context: NAME_CONTEXT }
  );
  result.name = nameResult.translatedText;
  console.log(`[ItemProcessor] Translated name: "${item.name}" -> "${result.name}"`);

  // Translate description (optional field)
  if (item.description && item.description.trim() !== '') {
    const descResult = await translateText(
      item.description,
      sourceLanguage,
      targetLanguage,
      { context: DESCRIPTION_CONTEXT }
    );
    result.description = descResult.translatedText;
    console.log(`[ItemProcessor] Translated description (${item.description.length} -> ${result.description.length} chars)`);
  } else {
    console.log(`[ItemProcessor] Skipping empty description`);
  }

  return result;
}
```

**Acceptance Criteria:**
- [ ] Function defines appropriate translation contexts for name and description fields
- [ ] Name context uses 'item_name' contentType, max 255 chars, concise tone
- [ ] Description context uses 'item_description' contentType, friendly tone
- [ ] Function validates name is not empty before translating
- [ ] Function handles null/empty description gracefully (skips translation)
- [ ] Function logs translation progress
- [ ] Function throws if required field translation fails
- [ ] TypeScript compilation succeeds

---

### Task 6: Implement Store Item Translation Helper

**File:** `/src/lib/content-translation/processors/item-processor.ts`

**Objective:** Create a helper function to persist translated content to the item_translations table using UPSERT pattern.

**Steps:**

1. Add the storage helper function:

```typescript
// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Store translated item content in the database
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * Sets translation_status to 'completed' and records translated_at timestamp.
 *
 * @param itemId - UUID of the item
 * @param language - Target language code
 * @param fields - Translated field values
 * @returns true if storage succeeded, false otherwise
 */
async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  fields: TranslatedItemFields
): Promise<boolean> {
  console.log(`[ItemProcessor] Storing translation for item ${itemId}, language ${language}`);

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('item_translations')
    .upsert(
      {
        item_id: itemId,
        language: language,
        name: fields.name,
        description: fields.description || null,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
      },
      {
        onConflict: 'item_id,language',
      }
    );

  if (error) {
    console.error(`[ItemProcessor] Failed to store item translation:`, error);
    return false;
  }

  console.log(`[ItemProcessor] Successfully stored translation for item ${itemId} in ${language}`);
  return true;
}
```

**Acceptance Criteria:**
- [ ] Function uses UPSERT with onConflict on (item_id, language)
- [ ] Function sets translation_status to 'completed'
- [ ] Function records translated_at and updated_at timestamps
- [ ] Function handles null description correctly
- [ ] Function returns boolean success indicator
- [ ] Function logs storage attempts and results
- [ ] TypeScript compilation succeeds

---

### Task 7: Implement Main processItemTranslation Function

**File:** `/src/lib/content-translation/processors/item-processor.ts`

**Objective:** Implement the main processor function that orchestrates the full item translation workflow.

**Steps:**

1. Add the main processor function:

```typescript
// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process a translation job for an item entity
 *
 * Workflow:
 * 1. Validate job metadata (item_id format, target_language)
 * 2. Fetch item record from database
 * 3. Translate name and description fields
 * 4. Store translated content to item_translations table
 * 5. Update job status (completed or failed)
 *
 * @param job - The translation job to process
 * @returns Processing result with success status and details
 */
export async function processItemTranslation(
  job: TranslationJob
): Promise<ItemProcessingResult> {
  const startTime = Date.now();
  const { entityId: itemId, sourceLanguage, targetLanguage } = job;

  console.log(`[ItemProcessor] Starting job ${job.id} for item ${itemId} (${sourceLanguage} -> ${targetLanguage})`);

  try {
    // 1. Fetch item record
    const item = await fetchItemForTranslation(itemId);

    if (!item) {
      const error = new Error(`Item ${itemId} not found or deleted`);
      const classification = categorizeError(error, job);

      await markJobFailed(job.id, classification.message);

      return {
        jobId: job.id,
        success: false,
        entityType: 'item',
        entityId: itemId,
        targetLanguage,
        errorMessage: classification.message,
        errorType: classification.type,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 2. Determine effective source language
    const effectiveSourceLanguage = item.source_language || sourceLanguage || 'en';

    // 3. Translate fields
    const translatedFields = await translateItemFields(
      item,
      effectiveSourceLanguage,
      targetLanguage
    );

    // 4. Store translation
    const stored = await storeItemTranslation(itemId, targetLanguage, translatedFields);

    if (!stored) {
      throw new Error('Failed to store translation in database');
    }

    // 5. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[ItemProcessor] Job ${job.id} completed successfully in ${Date.now() - startTime}ms`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'item',
      entityId: itemId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const classification = categorizeError(error, job);
    const errorMessage = classification.message;

    console.error(`[ItemProcessor] Job ${job.id} failed (${classification.type}):`, errorMessage);

    // Mark job as failed
    await markJobFailed(job.id, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'item',
      entityId: itemId,
      targetLanguage,
      errorMessage,
      errorType: classification.type,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Function accepts TranslationJob object
- [ ] Function fetches item and handles not found case
- [ ] Function uses item's source_language if available, falls back to job's sourceLanguage or 'en'
- [ ] Function calls translateItemFields with correct parameters
- [ ] Function stores translation and verifies success
- [ ] Function marks job completed on success via markJobCompleted
- [ ] Function marks job failed on error via markJobFailed
- [ ] Function classifies errors and returns appropriate errorType
- [ ] Function logs all significant events (start, completion, errors)
- [ ] Function returns ItemProcessingResult with all required fields
- [ ] Function tracks processing time in milliseconds
- [ ] TypeScript compilation succeeds

---

### Task 8: Create Processors Barrel Export

**File:** `/src/lib/content-translation/processors/index.ts`

**Objective:** Create a barrel export file for all processor functions.

**Steps:**

1. Create the file `/src/lib/content-translation/processors/index.ts`:

```typescript
/**
 * Content Translation Processors
 * Barrel export for all entity-specific translation processors
 *
 * @module content-translation/processors
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

export { processItemTranslation } from './item-processor';
export type { ItemProcessingResult } from './item-processor';

// Future processors will be exported here:
// export { processArticleTranslation } from './article-processor';
// export { processLinkTranslation } from './link-processor';
// export { processTagTranslation } from './tag-processor';
```

**Acceptance Criteria:**
- [ ] File exists at `/src/lib/content-translation/processors/index.ts`
- [ ] File exports processItemTranslation function
- [ ] File exports ItemProcessingResult type
- [ ] File includes comments for future processor exports
- [ ] Imports resolve correctly
- [ ] TypeScript compilation succeeds

---

### Task 9: Update Content Translation Module Export

**File:** `/src/lib/content-translation/index.ts`

**Objective:** Export the new processor functions from the main content-translation module.

**Steps:**

1. If the file doesn't exist, create it. Add or update with:

```typescript
/**
 * Content Translation Module
 * Central export point for all content translation functionality
 *
 * @module content-translation
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

// Processors
export { processItemTranslation } from './processors';
export type { ItemProcessingResult } from './processors';

// Re-export types if content-translation.types.ts exists
// export * from './content-translation.types';

// Re-export orchestrator if content-translation.ts exists
// export { queueContentTranslations } from './content-translation';

// Re-export triggers if they exist
// export * from './triggers';

// Re-export storage utilities if they exist
// export * from './storage';
```

**Acceptance Criteria:**
- [ ] File exists at `/src/lib/content-translation/index.ts`
- [ ] File exports processItemTranslation
- [ ] File exports ItemProcessingResult type
- [ ] Imports resolve correctly
- [ ] TypeScript compilation succeeds

---

### Task 10: Integrate with Job Processor Routing

**File:** `/src/lib/job-queue/job-processor.ts`

**Objective:** Update the job processor to route 'item' entity type jobs to the new processItemTranslation function.

**Steps:**

1. Add import at the top of the file (after existing imports):

```typescript
import { processItemTranslation } from '@/lib/content-translation/processors';
```

2. Locate the `processJob` function (around line 446)
3. The current implementation already handles items generically. We need to add a dedicated processor call.
4. **Option A:** If processJob should use dedicated processors, modify the function to check entity type:

Find this section in processJob (approximately lines 460-490):

```typescript
try {
    // 1. Fetch source content
    const content = await fetchEntityContent(entityType, entityId);
    // ... rest of generic processing
```

Replace with entity-type routing:

```typescript
try {
    // Route to entity-specific processor if available
    if (entityType === 'item') {
      // Use dedicated item processor
      const result = await processItemTranslation(job);

      // Stop heartbeat before returning
      stopHeartbeat();

      return {
        jobId: job.id,
        success: result.success,
        entityType,
        entityId,
        targetLanguage,
        translatedFields: result.translatedFields,
        errorMessage: result.errorMessage,
        processingTimeMs: result.processingTimeMs,
      };
    }

    // Fall back to generic processing for other entity types
    // 1. Fetch source content
    const content = await fetchEntityContent(entityType, entityId);
```

**Acceptance Criteria:**
- [ ] Import statement added for processItemTranslation
- [ ] Entity type routing added for 'item'
- [ ] Item jobs routed to processItemTranslation
- [ ] Other entity types continue using generic processing
- [ ] Heartbeat is properly stopped before returning
- [ ] Job processing result format maintained
- [ ] TypeScript compilation succeeds
- [ ] Existing tests still pass

---

### Task 11: Write Unit Tests for Error Classification

**File:** `/src/lib/content-translation/processors/__tests__/item-processor.test.ts`

**Objective:** Create unit tests for the categorizeError helper function.

**Steps:**

1. Create directory if needed: `/src/lib/content-translation/processors/__tests__/`
2. Create test file:

```typescript
/**
 * Unit Tests for Item Translation Processor
 * Tests for REQ-E03-014
 *
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn(),
}));

vi.mock('@/lib/job-queue/translation-jobs', () => ({
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
}));

// Import after mocks are set up
import { processItemTranslation } from '../item-processor';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('processItemTranslation', () => {
  const mockJob: TranslationJob = {
    id: 'job-123',
    entityType: 'item',
    entityId: 'item-456',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    status: 'processing',
    attempts: 0,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Classification', () => {
    it('should classify "not found" as permanent error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Row not found' },
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('not found');
    });

    it('should classify rate limit errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'item-456', name: 'Test Item', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Rate limit exceeded'));

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Rate limit');
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file exists at correct location
- [ ] Tests mock all external dependencies
- [ ] Test verifies permanent error classification for "not found"
- [ ] Test verifies transient error classification for rate limits
- [ ] Tests pass when run with vitest

---

### Task 12: Write Unit Tests for Successful Translation

**File:** `/src/lib/content-translation/processors/__tests__/item-processor.test.ts`

**Objective:** Add tests for successful item translation scenarios.

**Steps:**

1. Add to existing test file:

```typescript
describe('Successful Translation', () => {
  it('should successfully translate item name and description', async () => {
    const mockItem = {
      id: 'item-456',
      name: 'Coffee Maker',
      description: 'A programmable coffee machine',
      source_language: 'en',
    };

    // Mock database fetch
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
            }),
          }),
        };
      }
      if (table === 'item_translations') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    // Mock translation service
    vi.mocked(translateText)
      .mockResolvedValueOnce({ translatedText: 'Machine \u00e0 caf\u00e9', provider: 'claude' })
      .mockResolvedValueOnce({ translatedText: 'Une cafeti\u00e8re programmable', provider: 'claude' });

    vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

    const result = await processItemTranslation(mockJob);

    expect(result.success).toBe(true);
    expect(result.entityType).toBe('item');
    expect(result.entityId).toBe('item-456');
    expect(result.targetLanguage).toBe('fr');
    expect(result.translatedFields).toEqual({
      name: 'Machine \u00e0 caf\u00e9',
      description: 'Une cafeti\u00e8re programmable',
    });
    expect(result.processingTimeMs).toBeGreaterThan(0);
    expect(markJobCompleted).toHaveBeenCalledWith('job-123');
  });

  it('should handle items with null description', async () => {
    const mockItem = {
      id: 'item-456',
      name: 'Toaster',
      description: null,
      source_language: 'en',
    };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
            }),
          }),
        };
      }
      if (table === 'item_translations') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    vi.mocked(translateText).mockResolvedValueOnce({
      translatedText: 'Grille-pain',
      provider: 'claude',
    });

    vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

    const result = await processItemTranslation(mockJob);

    expect(result.success).toBe(true);
    expect(result.translatedFields?.name).toBe('Grille-pain');
    expect(result.translatedFields?.description).toBeUndefined();
    // translateText should only be called once (for name)
    expect(translateText).toHaveBeenCalledTimes(1);
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies successful translation of name and description
- [ ] Test verifies handling of null description
- [ ] Test verifies markJobCompleted is called on success
- [ ] Test verifies result contains correct translated fields
- [ ] Test verifies processingTimeMs is populated
- [ ] Tests pass when run with vitest

---

### Task 13: Write Unit Tests for Job Failure Scenarios

**File:** `/src/lib/content-translation/processors/__tests__/item-processor.test.ts`

**Objective:** Add tests for job failure scenarios.

**Steps:**

1. Add to existing test file:

```typescript
describe('Job Failure Scenarios', () => {
  it('should mark job as failed when item does not exist', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'Row not found' },
          }),
        }),
      }),
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
    vi.mocked(markJobFailed).mockResolvedValue({ success: true });

    const result = await processItemTranslation(mockJob);

    expect(result.success).toBe(false);
    expect(markJobFailed).toHaveBeenCalledWith('job-123', expect.stringContaining('not found'));
  });

  it('should mark job as failed when storage fails', async () => {
    const mockItem = {
      id: 'item-456',
      name: 'Test',
      description: null,
      source_language: 'en',
    };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
            }),
          }),
        };
      }
      if (table === 'item_translations') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
        };
      }
      return {};
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    vi.mocked(translateText).mockResolvedValueOnce({
      translatedText: 'Test traduit',
      provider: 'claude',
    });

    vi.mocked(markJobFailed).mockResolvedValue({ success: true });

    const result = await processItemTranslation(mockJob);

    expect(result.success).toBe(false);
    expect(markJobFailed).toHaveBeenCalled();
  });

  it('should not retry for permanent errors', async () => {
    const jobWithMaxAttempts: TranslationJob = {
      ...mockJob,
      attempts: 3,
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'item-456', name: 'Test', description: null, source_language: 'en' },
            error: null,
          }),
        }),
      }),
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
    vi.mocked(translateText).mockRejectedValue(new Error('Some error'));
    vi.mocked(markJobFailed).mockResolvedValue({ success: true });

    const result = await processItemTranslation(jobWithMaxAttempts);

    expect(result.success).toBe(false);
    expect(result.errorType).toBe('permanent');
    expect(result.errorMessage).toContain('Max retries exceeded');
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies job is marked failed when item not found
- [ ] Test verifies job is marked failed when storage fails
- [ ] Test verifies max retries logic (permanent error after 3 attempts)
- [ ] Test verifies markJobFailed is called with appropriate error message
- [ ] Tests pass when run with vitest

---

### Task 14: Run Tests and Verify Implementation

**Objective:** Execute all tests and verify the implementation works correctly.

**Steps:**

1. Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

2. Run the specific test file:
```bash
npx vitest run src/lib/content-translation/processors/__tests__/item-processor.test.ts
```

3. If tests fail, debug and fix issues

4. Run all related tests:
```bash
npx vitest run src/lib/job-queue --reporter=verbose
npx vitest run src/lib/content-translation --reporter=verbose
```

**Acceptance Criteria:**
- [ ] TypeScript compilation succeeds with no errors
- [ ] All unit tests pass
- [ ] No regressions in existing job-queue tests
- [ ] Code coverage is adequate for new functions

---

### Task 15: Update Documentation

**Objective:** Add inline documentation and update any relevant docs.

**Steps:**

1. Ensure all exported functions have JSDoc comments
2. Verify all type definitions have documentation
3. Add usage examples in comments if helpful

Example documentation to add/verify in `item-processor.ts`:

```typescript
/**
 * Process a translation job for an item entity.
 *
 * This function orchestrates the complete item translation workflow:
 * 1. Fetches the item record from the database
 * 2. Validates the item exists and has content to translate
 * 3. Translates name and description fields using the translation service
 * 4. Stores the translation using UPSERT pattern
 * 5. Updates the job status to completed or failed
 *
 * Error Handling:
 * - Permanent errors (no retry): item not found, invalid ID, unsupported language
 * - Transient errors (retry eligible): rate limits, timeouts, service unavailable
 *
 * @param job - The translation job containing item ID, source/target languages, and metadata
 * @returns Processing result with success status, translated fields or error details
 *
 * @example
 * ```typescript
 * const result = await processItemTranslation({
 *   id: 'job-123',
 *   entityType: 'item',
 *   entityId: 'item-456',
 *   sourceLanguage: 'en',
 *   targetLanguage: 'fr',
 *   status: 'processing',
 *   attempts: 0,
 *   createdAt: '2026-01-20T12:00:00Z',
 * });
 *
 * if (result.success) {
 *   console.log('Translated:', result.translatedFields);
 * } else {
 *   console.error('Failed:', result.errorMessage, 'Retry:', result.errorType === 'transient');
 * }
 * ```
 */
```

**Acceptance Criteria:**
- [ ] All exported functions have JSDoc documentation
- [ ] Documentation includes parameter descriptions
- [ ] Documentation includes return value description
- [ ] Documentation includes usage example
- [ ] Error handling behavior is documented

---

## Summary of Files Created/Modified

### Files Created

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/processors/item-processor.ts` | Main item translation processor |
| `/src/lib/content-translation/processors/index.ts` | Barrel export for processors |
| `/src/lib/content-translation/processors/__tests__/item-processor.test.ts` | Unit tests |
| `/src/lib/content-translation/index.ts` | Module export (if not exists) |

### Files Modified

| File Path | Changes |
|-----------|---------|
| `/src/lib/job-queue/job-processor.ts` | Add import and routing for item processor |

---

## Verification Checklist

Before marking this task complete, verify:

- [ ] All 15 tasks are completed
- [ ] TypeScript compilation passes
- [ ] All unit tests pass
- [ ] Item translation jobs route to new processor
- [ ] Successful translations are stored in item_translations
- [ ] Failed jobs are properly marked with error details
- [ ] Error classification works correctly (permanent vs transient)
- [ ] Logging provides adequate visibility for debugging
- [ ] Code follows existing patterns in the codebase
- [ ] No regressions in existing functionality

---

## References

- **Overview Document:** `/docs/REQ-E03-014-implement-item-translation-processor-overview.md`
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-014)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.2)
- **Job Processor:** `/src/lib/job-queue/job-processor.ts`
- **Translation Service:** `/src/lib/translation-service/`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Job Queue Types:** `/src/lib/job-queue/translation-jobs.types.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
