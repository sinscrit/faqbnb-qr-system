# Detailed Task Breakdown: REQ-E03-016 - Implement Link Translation Processor

**Generated:** 2026-01-20 19:15:00 UTC
**Last Modified:** 2026-01-20 19:15:00 UTC
**Request ID:** REQ-E03-016
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.4
**Size:** S (Small)
**Priority:** P1 - High
**Depends On:** REQ-E03-013 (Enhance Job Processor for Content-Specific Handling), REQ-E03-005 (Translation Storage Utilities)

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for creating the link translation processor. Each task is designed to be approximately 1 story point and can be executed sequentially by an AI coding agent or junior developer. This processor follows the same patterns established by the item translation processor (REQ-E03-014) and article translation processor (REQ-E03-015), but is simpler since it handles only ONE translatable field (title).

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] REQ-E03-001 (Content translation module structure) is complete
- [ ] REQ-E03-005 (Translation storage utilities) is complete - OR storeLinkTranslation can be reused from job-processor.ts
- [ ] REQ-E03-013 (Job processor entity routing) is complete
- [ ] REQ-E03-014 (Item translation processor) is complete - reference implementation pattern
- [ ] REQ-E03-015 (Article translation processor) is complete - reference implementation pattern
- [ ] Epic 1 translation service is operational (`/src/lib/translation-service/`)
- [ ] Epic 1 job queue infrastructure exists (`/src/lib/job-queue/`)
- [ ] Database tables exist: `item_links`, `link_translations`, `translation_jobs`

---

## Key Differences from Item/Article Processors

| Aspect | Item Processor | Article Processor | Link Processor |
|--------|----------------|-------------------|----------------|
| Table | `items` | `item_articles` | `item_links` |
| Translation Table | `item_translations` | `article_translations` | `link_translations` |
| Translatable Fields | name, description | title, description | **title only** |
| Non-translatable Fields | id, tags, media | id, media | **url, thumbnail_url, link_type** |
| Complexity | Medium (2 fields) | Medium (2 fields) | **Simple (1 field)** |

**CRITICAL:** The URL field must NEVER be translated - this preserves link functionality.

---

## Implementation Tasks

### Task 1: Create Link Processor File Structure

**File:** `/src/lib/content-translation/processors/link-processor.ts`

**Objective:** Create the link processor file with proper imports and type definitions.

**Steps:**

1. Verify the directory exists: `/src/lib/content-translation/processors/`
2. Create the file `link-processor.ts`
3. Add file header documentation with creation date and module purpose
4. Add the following imports:

```typescript
/**
 * Link Translation Processor
 * Part of REQ-E03-016: Implement Link Translation Processor
 *
 * Processes translation jobs for link entities. Retrieves link records,
 * translates ONLY the title field (never the URL), stores results,
 * and updates job status.
 *
 * This is the simplest content translation processor as links have only
 * ONE translatable field (title). URLs must be preserved unchanged to
 * maintain link functionality across all languages.
 *
 * @module content-translation/processors/link-processor
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
- [ ] File exists at `/src/lib/content-translation/processors/link-processor.ts`
- [ ] File contains proper header documentation explaining URL preservation
- [ ] All required imports are present and resolve without errors
- [ ] TypeScript compilation succeeds

---

### Task 2: Define Link Processor Types

**File:** `/src/lib/content-translation/processors/link-processor.ts`

**Objective:** Define TypeScript interfaces for the link processor's inputs, outputs, and internal data structures.

**Steps:**

1. Add the following type definitions after the imports:

```typescript
// ===========================================================================
// Type Definitions
// ===========================================================================

/**
 * Link content retrieved from the database for translation
 *
 * Note: URL, thumbnail_url, and link_type are intentionally NOT included
 * as they must never be translated.
 */
interface LinkData {
  id: string;
  title: string;
  source_language: SupportedLanguage | null;
  // The following fields exist in item_links but are NOT translatable:
  // url: string (preserved as-is across all languages)
  // thumbnail_url: string | null (preserved as-is)
  // link_type: string (preserved as-is)
}

/**
 * Translated link fields ready for storage
 *
 * Only contains title - the sole translatable field for links
 */
interface TranslatedLinkFields {
  title: string;
}

/**
 * Result of processing a link translation job
 */
export interface LinkProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'link';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: TranslatedLinkFields;
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
- [ ] `LinkData` interface matches item_links table schema (id, title, source_language)
- [ ] `LinkData` explicitly documents that URL is not included
- [ ] `TranslatedLinkFields` interface contains only title
- [ ] `LinkProcessingResult` interface includes all required fields from overview document
- [ ] `ErrorClassification` type supports permanent vs transient distinction
- [ ] TypeScript compilation succeeds

---

### Task 3: Implement Error Classification Helper

**File:** `/src/lib/content-translation/processors/link-processor.ts`

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
 * - Link not found (deleted)
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
    return { type: 'permanent', message: `Link not found: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('invalid uuid') ||
    lowerMessage.includes('invalid id') ||
    lowerMessage.includes('malformed')
  ) {
    return { type: 'permanent', message: `Invalid link ID format: ${errorMessage}` };
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

### Task 4: Implement Fetch Link Helper Function

**File:** `/src/lib/content-translation/processors/link-processor.ts`

**Objective:** Create a helper function to retrieve link data from the `item_links` database table with proper error handling. CRITICAL: Only fetch the title field for translation - never the URL.

**Steps:**

1. Add the fetch link helper function:

```typescript
// ===========================================================================
// Data Fetching
// ===========================================================================

/**
 * Fetch link record from the database for translation
 *
 * IMPORTANT: Only fetches title and source_language fields.
 * The URL field is intentionally NOT fetched because:
 * 1. URLs must never be translated (would break the link)
 * 2. Not needed for translation processing
 * 3. Reduces data transfer
 *
 * @param linkId - UUID of the link to fetch
 * @returns Link data if found, null otherwise
 * @throws Error if database query fails
 */
async function fetchLinkForTranslation(linkId: string): Promise<LinkData | null> {
  console.log(`[LinkProcessor] Fetching link ${linkId} for translation`);

  const { data, error } = await supabaseAdmin
    .from('item_links')
    .select('id, title, source_language')
    // Note: URL is NOT selected - it must never be translated
    .eq('id', linkId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      console.warn(`[LinkProcessor] Link ${linkId} not found`);
      return null;
    }
    console.error(`[LinkProcessor] Database error fetching link ${linkId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    console.warn(`[LinkProcessor] Link ${linkId} returned empty data`);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    source_language: data.source_language as SupportedLanguage | null,
  };
}
```

**Acceptance Criteria:**
- [ ] Function queries item_links table with correct columns (id, title, source_language)
- [ ] Function explicitly does NOT select URL, thumbnail_url, or link_type
- [ ] Function uses `.single()` to fetch one record
- [ ] Function handles "not found" error code (PGRST116) by returning null
- [ ] Function throws on other database errors
- [ ] Function logs fetch attempts and results
- [ ] TypeScript compilation succeeds

---

### Task 5: Implement Translate Link Title Helper

**File:** `/src/lib/content-translation/processors/link-processor.ts`

**Objective:** Create a helper function that translates ONLY the title field using the translation service with link-specific context.

**Steps:**

1. Add the translation helper function:

```typescript
// ===========================================================================
// Translation Logic
// ===========================================================================

/**
 * Translation context for link title field
 *
 * Link titles in vacation rental context describe external resources:
 * - "How to use the dishwasher (YouTube video)"
 * - "WiFi Setup Guide PDF"
 * - "Appliance Manual"
 *
 * Titles should be concise but descriptive enough for guests to understand
 * what the link contains before clicking.
 */
const TITLE_CONTEXT: TranslationContext = {
  contentType: 'link_title',
  domainContext: 'Resource link title for vacation rental property instructions. External reference to video, PDF, or other media. Title should help guest understand the linked content.',
  maxLength: 255,
  tone: 'concise',
};

/**
 * Translate link title field
 *
 * NOTE: Only translates the title field. URLs are NEVER translated.
 *
 * @param link - Link data containing title to translate
 * @param sourceLanguage - Source language of the content
 * @param targetLanguage - Target language for translation
 * @returns Translated title
 * @throws Error if translation fails
 */
async function translateLinkTitle(
  link: LinkData,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslatedLinkFields> {
  console.log(`[LinkProcessor] Translating link ${link.id} title from ${sourceLanguage} to ${targetLanguage}`);

  // Validate title is not empty
  if (!link.title || link.title.trim() === '') {
    throw new Error('Link title is empty - cannot translate');
  }

  // Translate title (the only translatable field for links)
  const titleResult = await translateText(
    link.title,
    sourceLanguage,
    targetLanguage,
    { context: TITLE_CONTEXT }
  );

  console.log(`[LinkProcessor] Translated title: "${link.title}" -> "${titleResult.translatedText}"`);

  return {
    title: titleResult.translatedText,
  };
}
```

**Acceptance Criteria:**
- [ ] Function defines appropriate translation context for link title
- [ ] Context uses 'link_title' contentType, max 255 chars, concise tone
- [ ] Context includes domain-specific description for vacation rental link titles
- [ ] Function validates title is not empty before translating
- [ ] Function ONLY translates title (not URL or other fields)
- [ ] Function logs translation progress
- [ ] Function throws if title translation fails
- [ ] TypeScript compilation succeeds

---

### Task 6: Implement Store Link Translation Helper

**File:** `/src/lib/content-translation/processors/link-processor.ts`

**Objective:** Create a helper function to persist translated content to the link_translations table using UPSERT pattern.

**Steps:**

1. Add the storage helper function:

```typescript
// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Store translated link title in the database
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * Sets translation_status to 'completed' and records translated_at timestamp.
 *
 * NOTE: Only stores title translation. The link_translations table schema:
 * - link_id: UUID (foreign key to item_links)
 * - language: language code
 * - title: translated title
 * - translation_status: 'completed' | 'failed' | 'manual'
 * - translated_at: timestamp
 *
 * @param linkId - UUID of the link
 * @param language - Target language code
 * @param fields - Translated title
 * @returns true if storage succeeded, false otherwise
 */
async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  fields: TranslatedLinkFields
): Promise<boolean> {
  console.log(`[LinkProcessor] Storing translation for link ${linkId}, language ${language}`);

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('link_translations')
    .upsert(
      {
        link_id: linkId,
        language: language,
        title: fields.title,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
      },
      {
        onConflict: 'link_id,language',
      }
    );

  if (error) {
    console.error(`[LinkProcessor] Failed to store link translation:`, error);
    return false;
  }

  console.log(`[LinkProcessor] Successfully stored translation for link ${linkId} in ${language}`);
  return true;
}
```

**Acceptance Criteria:**
- [ ] Function uses UPSERT with onConflict on (link_id, language)
- [ ] Function sets translation_status to 'completed'
- [ ] Function records translated_at and updated_at timestamps
- [ ] Function stores only title (no URL or other fields)
- [ ] Function returns boolean success indicator
- [ ] Function logs storage attempts and results
- [ ] TypeScript compilation succeeds

---

### Task 7: Implement Main processLinkTranslation Function

**File:** `/src/lib/content-translation/processors/link-processor.ts`

**Objective:** Implement the main processor function that orchestrates the full link translation workflow.

**Steps:**

1. Add the main processor function:

```typescript
// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process a translation job for a link entity
 *
 * This function orchestrates the complete link translation workflow:
 * 1. Fetches the link record from the item_links table
 * 2. Validates the link exists and has a title to translate
 * 3. Translates ONLY the title field (URLs are never translated)
 * 4. Stores the translation in link_translations using UPSERT pattern
 * 5. Updates the job status to completed or failed
 *
 * KEY DIFFERENCE FROM ITEM/ARTICLE PROCESSORS:
 * Links have only ONE translatable field (title). The URL must be preserved
 * unchanged across all languages to maintain link functionality.
 *
 * Error Handling:
 * - Permanent errors (no retry): link not found, invalid ID, unsupported language
 * - Transient errors (retry eligible): rate limits, timeouts, service unavailable
 *
 * @param job - The translation job containing link ID, source/target languages, and metadata
 * @returns Processing result with success status, translated title or error details
 *
 * @example
 * ```typescript
 * const result = await processLinkTranslation({
 *   id: 'job-123',
 *   entityType: 'link',
 *   entityId: 'link-456',
 *   sourceLanguage: 'en',
 *   targetLanguage: 'fr',
 *   status: 'processing',
 *   attempts: 0,
 *   createdAt: '2026-01-20T12:00:00Z',
 * });
 *
 * if (result.success) {
 *   console.log('Translated title:', result.translatedFields?.title);
 * } else {
 *   console.error('Failed:', result.errorMessage, 'Retry:', result.errorType === 'transient');
 * }
 * ```
 */
export async function processLinkTranslation(
  job: TranslationJob
): Promise<LinkProcessingResult> {
  const startTime = Date.now();
  const { entityId: linkId, sourceLanguage, targetLanguage } = job;

  console.log(`[LinkProcessor] Starting job ${job.id} for link ${linkId} (${sourceLanguage} -> ${targetLanguage})`);

  try {
    // 1. Fetch link record (title only - URL is never fetched/translated)
    const link = await fetchLinkForTranslation(linkId);

    if (!link) {
      const error = new Error(`Link ${linkId} not found or deleted`);
      const classification = categorizeError(error, job);

      await markJobFailed(job.id, classification.message);

      return {
        jobId: job.id,
        success: false,
        entityType: 'link',
        entityId: linkId,
        targetLanguage,
        errorMessage: classification.message,
        errorType: classification.type,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 2. Determine effective source language
    // Priority: link's source_language > job's sourceLanguage > 'en' default
    const effectiveSourceLanguage = link.source_language || sourceLanguage || 'en';

    // 3. Translate title (the only translatable field for links)
    const translatedFields = await translateLinkTitle(
      link,
      effectiveSourceLanguage,
      targetLanguage
    );

    // 4. Store translation
    const stored = await storeLinkTranslation(linkId, targetLanguage, translatedFields);

    if (!stored) {
      throw new Error('Failed to store link translation in database');
    }

    // 5. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[LinkProcessor] Job ${job.id} completed successfully in ${Date.now() - startTime}ms`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'link',
      entityId: linkId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const classification = categorizeError(error, job);
    const errorMessage = classification.message;

    console.error(`[LinkProcessor] Job ${job.id} failed (${classification.type}):`, errorMessage);

    // Mark job as failed
    await markJobFailed(job.id, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'link',
      entityId: linkId,
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
- [ ] Function fetches link and handles not found case
- [ ] Function uses link's source_language if available, falls back to job's sourceLanguage or 'en'
- [ ] Function calls translateLinkTitle with correct parameters
- [ ] Function ONLY translates title (never URL)
- [ ] Function stores translation and verifies success
- [ ] Function marks job completed on success via markJobCompleted
- [ ] Function marks job failed on error via markJobFailed
- [ ] Function classifies errors and returns appropriate errorType
- [ ] Function logs all significant events (start, completion, errors)
- [ ] Function returns LinkProcessingResult with all required fields
- [ ] Function tracks processing time in milliseconds
- [ ] TypeScript compilation succeeds

---

### Task 8: Update Processors Barrel Export

**File:** `/src/lib/content-translation/processors/index.ts`

**Objective:** Add link processor exports to the barrel export file.

**Steps:**

1. Check if the file exists. If it exists, add the link processor exports. If not, create it.

2. Update the file `/src/lib/content-translation/processors/index.ts`:

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

export { processArticleTranslation } from './article-processor';
export type { ArticleProcessingResult } from './article-processor';

export { processLinkTranslation } from './link-processor';
export type { LinkProcessingResult } from './link-processor';

// Future processors will be exported here:
// export { processTagTranslation } from './tag-processor';
```

**Acceptance Criteria:**
- [ ] File exports processLinkTranslation function
- [ ] File exports LinkProcessingResult type
- [ ] Existing item and article processor exports remain unchanged
- [ ] Imports resolve correctly
- [ ] TypeScript compilation succeeds

---

### Task 9: Update Content Translation Module Export

**File:** `/src/lib/content-translation/index.ts`

**Objective:** Export the link processor functions from the main content-translation module.

**Steps:**

1. Update the file to include link processor exports:

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
export { processItemTranslation, processArticleTranslation, processLinkTranslation } from './processors';
export type { ItemProcessingResult, ArticleProcessingResult, LinkProcessingResult } from './processors';

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
- [ ] File exports processLinkTranslation
- [ ] File exports LinkProcessingResult type
- [ ] Existing exports remain unchanged
- [ ] Imports resolve correctly
- [ ] TypeScript compilation succeeds

---

### Task 10: Integrate with Job Processor Routing

**File:** `/src/lib/job-queue/job-processor.ts`

**Objective:** Update the job processor to route 'link' entity type jobs to the new processLinkTranslation function.

**Note:** The existing job-processor.ts already has generic handling for links in the `processJob` function via `fetchEntityContent` and `saveTranslation`. This task adds dedicated processor routing for consistency with item/article processors.

**Steps:**

1. Update the import at the top of the file to include the link processor:

```typescript
import { processItemTranslation, processArticleTranslation, processLinkTranslation } from '@/lib/content-translation/processors';
```

2. Locate the `processJob` function (around line 446)

3. Find the entity type routing section and add link routing after item and article:

If item and article routing were added per REQ-E03-014 and REQ-E03-015, extend it:

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

    if (entityType === 'article') {
      // Use dedicated article processor
      const result = await processArticleTranslation(job);

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

    if (entityType === 'link') {
      // Use dedicated link processor
      // Links only translate title field - URLs are never translated
      const result = await processLinkTranslation(job);

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

    // Fall back to generic processing for other entity types (tag)
    // 1. Fetch source content
    const content = await fetchEntityContent(entityType, entityId);
```

**Acceptance Criteria:**
- [ ] Import statement added for processLinkTranslation
- [ ] Entity type routing added for 'link'
- [ ] Link jobs routed to processLinkTranslation
- [ ] Comment documents that links only translate title (not URL)
- [ ] Other entity types continue using generic processing
- [ ] Heartbeat is properly stopped before returning
- [ ] Job processing result format maintained
- [ ] TypeScript compilation succeeds
- [ ] Existing tests still pass

---

### Task 11: Write Unit Tests for Error Classification

**File:** `/src/lib/content-translation/processors/__tests__/link-processor.test.ts`

**Objective:** Create unit tests for the categorizeError helper function and link processor.

**Steps:**

1. Create directory if needed: `/src/lib/content-translation/processors/__tests__/`
2. Create test file:

```typescript
/**
 * Unit Tests for Link Translation Processor
 * Tests for REQ-E03-016
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
import { processLinkTranslation } from '../link-processor';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('processLinkTranslation', () => {
  const mockJob: TranslationJob = {
    id: 'job-123',
    entityType: 'link',
    entityId: 'link-456',
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

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('not found');
    });

    it('should classify rate limit errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'link-456', title: 'Test Link', source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Rate limit exceeded'));

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Rate limit');
    });

    it('should classify timeout errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'link-456', title: 'Test Link', source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Request timed out'));

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Network error');
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file exists at correct location
- [ ] Tests mock all external dependencies
- [ ] Test verifies permanent error classification for "not found"
- [ ] Test verifies transient error classification for rate limits
- [ ] Test verifies transient error classification for timeouts
- [ ] Tests pass when run with vitest

---

### Task 12: Write Unit Tests for Successful Translation

**File:** `/src/lib/content-translation/processors/__tests__/link-processor.test.ts`

**Objective:** Add tests for successful link translation scenarios.

**Steps:**

1. Add to existing test file:

```typescript
describe('Successful Translation', () => {
  it('should successfully translate link title only', async () => {
    const mockLink = {
      id: 'link-456',
      title: 'How to use the dishwasher',
      source_language: 'en',
    };

    // Mock database fetch
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'item_links') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
            }),
          }),
        };
      }
      if (table === 'link_translations') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    // Mock translation service - should only be called ONCE (for title)
    vi.mocked(translateText).mockResolvedValueOnce({
      translatedText: 'Comment utiliser le lave-vaisselle',
      provider: 'claude',
    });

    vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

    const result = await processLinkTranslation(mockJob);

    expect(result.success).toBe(true);
    expect(result.entityType).toBe('link');
    expect(result.entityId).toBe('link-456');
    expect(result.targetLanguage).toBe('fr');
    expect(result.translatedFields).toEqual({
      title: 'Comment utiliser le lave-vaisselle',
    });
    expect(result.processingTimeMs).toBeGreaterThan(0);
    expect(markJobCompleted).toHaveBeenCalledWith('job-123');

    // CRITICAL: translateText should only be called ONCE (for title, never URL)
    expect(translateText).toHaveBeenCalledTimes(1);
  });

  it('should only call translation service once (for title only)', async () => {
    const mockLink = {
      id: 'link-456',
      title: 'Appliance Manual PDF',
      source_language: 'en',
    };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'item_links') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
            }),
          }),
        };
      }
      if (table === 'link_translations') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    vi.mocked(translateText).mockResolvedValueOnce({
      translatedText: 'Manuel PDF de l\'appareil',
      provider: 'claude',
    });

    vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

    await processLinkTranslation(mockJob);

    // Verify translateText was called exactly once
    // Links should NEVER translate more than the title
    expect(translateText).toHaveBeenCalledTimes(1);
    expect(translateText).toHaveBeenCalledWith(
      'Appliance Manual PDF',
      expect.any(String),
      'fr',
      expect.any(Object)
    );
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies successful translation of title
- [ ] Test verifies translateText is called exactly ONCE (not for URL)
- [ ] Test verifies markJobCompleted is called on success
- [ ] Test verifies result contains correct translated fields (title only)
- [ ] Test verifies processingTimeMs is populated
- [ ] Tests pass when run with vitest

---

### Task 13: Write Unit Tests for Job Failure Scenarios

**File:** `/src/lib/content-translation/processors/__tests__/link-processor.test.ts`

**Objective:** Add tests for job failure scenarios.

**Steps:**

1. Add to existing test file:

```typescript
describe('Job Failure Scenarios', () => {
  it('should mark job as failed when link does not exist', async () => {
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

    const result = await processLinkTranslation(mockJob);

    expect(result.success).toBe(false);
    expect(markJobFailed).toHaveBeenCalledWith('job-123', expect.stringContaining('not found'));
  });

  it('should mark job as failed when storage fails', async () => {
    const mockLink = {
      id: 'link-456',
      title: 'Test',
      source_language: 'en',
    };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'item_links') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
            }),
          }),
        };
      }
      if (table === 'link_translations') {
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

    const result = await processLinkTranslation(mockJob);

    expect(result.success).toBe(false);
    expect(markJobFailed).toHaveBeenCalled();
  });

  it('should not retry for permanent errors after max attempts', async () => {
    const jobWithMaxAttempts: TranslationJob = {
      ...mockJob,
      attempts: 3,
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'link-456', title: 'Test', source_language: 'en' },
            error: null,
          }),
        }),
      }),
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
    vi.mocked(translateText).mockRejectedValue(new Error('Some error'));
    vi.mocked(markJobFailed).mockResolvedValue({ success: true });

    const result = await processLinkTranslation(jobWithMaxAttempts);

    expect(result.success).toBe(false);
    expect(result.errorType).toBe('permanent');
    expect(result.errorMessage).toContain('Max retries exceeded');
  });

  it('should mark job as failed when link title is empty', async () => {
    const mockLink = {
      id: 'link-456',
      title: '',
      source_language: 'en',
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
        }),
      }),
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
    vi.mocked(markJobFailed).mockResolvedValue({ success: true });

    const result = await processLinkTranslation(mockJob);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('title is empty');
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies job is marked failed when link not found
- [ ] Test verifies job is marked failed when storage fails
- [ ] Test verifies max retries logic (permanent error after 3 attempts)
- [ ] Test verifies job is marked failed when title is empty
- [ ] Test verifies markJobFailed is called with appropriate error message
- [ ] Tests pass when run with vitest

---

### Task 14: Write Unit Tests for Translation Context and URL Exclusion

**File:** `/src/lib/content-translation/processors/__tests__/link-processor.test.ts`

**Objective:** Add tests to verify correct translation context is used and URL is NEVER included in translation.

**Steps:**

1. Add to existing test file:

```typescript
describe('Translation Context and URL Exclusion', () => {
  it('should use correct translation context for link title', async () => {
    const mockLink = {
      id: 'link-456',
      title: 'Video Tutorial',
      source_language: 'en',
    };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'item_links') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
            }),
          }),
        };
      }
      if (table === 'link_translations') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    vi.mocked(translateText).mockResolvedValueOnce({
      translatedText: 'Tutoriel vidéo',
      provider: 'claude',
    });

    vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

    await processLinkTranslation(mockJob);

    // Verify translateText was called with link_title context
    expect(translateText).toHaveBeenCalledWith(
      'Video Tutorial',
      'en',
      'fr',
      expect.objectContaining({
        context: expect.objectContaining({
          contentType: 'link_title',
          tone: 'concise',
        }),
      })
    );
  });

  it('should NEVER include URL in translation request', async () => {
    // This test verifies the critical requirement that URLs are never translated
    const mockLink = {
      id: 'link-456',
      title: 'Setup Guide',
      source_language: 'en',
      // Note: URL is not in the fetched data because we don't select it
    };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'item_links') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
            }),
          }),
        };
      }
      if (table === 'link_translations') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    vi.mocked(translateText).mockResolvedValueOnce({
      translatedText: 'Guide de configuration',
      provider: 'claude',
    });

    vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

    await processLinkTranslation(mockJob);

    // Verify translateText was ONLY called with the title
    // It should never receive a URL
    expect(translateText).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(translateText).mock.calls[0];
    expect(callArgs[0]).toBe('Setup Guide'); // Only title, no URL

    // Verify URL patterns are never passed to translation
    expect(callArgs[0]).not.toMatch(/^https?:\/\//);
    expect(callArgs[0]).not.toMatch(/\.com|\.org|\.net|\.io/);
  });

  it('should verify database query does not select URL field', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'link-456', title: 'Test', source_language: 'en' },
            error: null,
          }),
        }),
      }),
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

    vi.mocked(translateText).mockResolvedValueOnce({
      translatedText: 'Test',
      provider: 'claude',
    });
    vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

    await processLinkTranslation(mockJob);

    // Verify the select call does NOT include 'url' or 'thumbnail_url'
    const selectCall = mockFrom.mock.results[0].value.select;
    expect(selectCall).toHaveBeenCalled();
    const selectArg = selectCall.mock.calls[0][0];
    expect(selectArg).not.toContain('url');
    expect(selectArg).not.toContain('thumbnail_url');
    expect(selectArg).not.toContain('link_type');
    expect(selectArg).toContain('title');
    expect(selectArg).toContain('source_language');
  });
});
```

**Acceptance Criteria:**
- [ ] Test verifies link_title contentType is used for title
- [ ] Test verifies concise tone is used for title
- [ ] Test verifies URL is NEVER passed to translateText
- [ ] Test verifies database query does not select URL field
- [ ] Tests pass when run with vitest

---

### Task 15: Run Tests and Verify Implementation

**Objective:** Execute all tests and verify the implementation works correctly.

**Steps:**

1. Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

2. Run the specific test file:
```bash
npx vitest run src/lib/content-translation/processors/__tests__/link-processor.test.ts
```

3. If tests fail, debug and fix issues

4. Run all related tests:
```bash
npx vitest run src/lib/job-queue --reporter=verbose
npx vitest run src/lib/content-translation --reporter=verbose
```

5. Verify build succeeds:
```bash
npm run build
```

**Acceptance Criteria:**
- [ ] TypeScript compilation succeeds with no errors
- [ ] All unit tests pass
- [ ] No regressions in existing job-queue tests
- [ ] No regressions in existing content-translation tests
- [ ] Build completes successfully
- [ ] Code coverage is adequate for new functions

---

## Summary of Files Created/Modified

### Files Created

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/processors/link-processor.ts` | Main link translation processor |
| `/src/lib/content-translation/processors/__tests__/link-processor.test.ts` | Unit tests |

### Files Modified

| File Path | Changes |
|-----------|---------|
| `/src/lib/content-translation/processors/index.ts` | Add export for link processor |
| `/src/lib/content-translation/index.ts` | Add export for link processor |
| `/src/lib/job-queue/job-processor.ts` | Add import and routing for link processor |

---

## Verification Checklist

Before marking this task complete, verify:

- [ ] All 15 tasks are completed
- [ ] TypeScript compilation passes
- [ ] All unit tests pass
- [ ] Link translation jobs route to new processor
- [ ] Successful translations are stored in link_translations
- [ ] Failed jobs are properly marked with error details
- [ ] Error classification works correctly (permanent vs transient)
- [ ] URL is NEVER included in translation (critical requirement)
- [ ] Only title field is translated (single field processor)
- [ ] Logging provides adequate visibility for debugging
- [ ] Code follows existing patterns in the codebase (same as item/article-processor)
- [ ] No regressions in existing functionality

---

## Critical Implementation Notes

### URL Preservation

**CRITICAL REQUIREMENT:** The URL field must NEVER be translated. This is enforced at multiple levels:

1. **Database Query:** The `fetchLinkForTranslation` function only selects `id, title, source_language` - URL is not selected
2. **Type Definition:** The `LinkData` interface does not include URL
3. **Translation Function:** Only accepts title for translation
4. **Tests:** Verify URL is never passed to translation service

If a URL were translated, it would break the link functionality - guests would click on a non-existent or incorrect URL.

### Single Field Simplicity

Unlike item (name, description) and article (title, description) processors, the link processor handles only ONE field:

- **Item:** 2 fields (name, description)
- **Article:** 2 fields (title, description)
- **Link:** 1 field (title only)

This makes the link processor the simplest of the content translation processors.

---

## Integration Points

### With Job Processor (REQ-E03-013)

The link processor integrates with the enhanced job processor routing:

```typescript
// In job-processor.ts
if (entityType === 'link') {
  const result = await processLinkTranslation(job);
  // ... handle result
}
```

### With Storage Utilities (REQ-E03-005)

The processor uses the UPSERT pattern for storage, following the same approach as the generic saveTranslation function. If a dedicated storeLinkTranslation utility exists from REQ-E03-005, it can be used instead of the inline implementation.

### With Translation Service (Epic 1)

Uses the existing translateText function from Epic 1 with link-specific translation context (link_title).

### With Job Queue (Epic 1)

Uses existing markJobCompleted and markJobFailed functions from Epic 1 job queue infrastructure.

---

## References

- **Overview Document:** `/docs/REQ-E03-016-implement-link-translation-processor-overview.md`
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-016)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.4)
- **Item Processor (Reference Pattern):** `/docs/REQ-E03-014-implement-item-translation-processor-detailed.md`
- **Article Processor (Reference Pattern):** `/docs/REQ-E03-015-implement-article-translation-processor-detailed.md`
- **Job Processor:** `/src/lib/job-queue/job-processor.ts`
- **Translation Service:** `/src/lib/translation-service/`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Job Queue Types:** `/src/lib/job-queue/translation-jobs.types.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 3.4: Implement Link Translation Processor*
