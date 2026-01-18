# REQ-244: Implement Job Processor - Detailed Task Breakdown

**Generated:** 2026-01-18 23:15:00 UTC
**Last Modified:** 2026-01-18 23:15:00 UTC
**Request Reference:** REQ-244 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-244-implement-job-processor-overview.md`
**Implementation Plan:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.2

---

## Executive Summary

This document breaks down the Translation Job Processor (REQ-244, Task 4.2) into granular, implementation-ready tasks. Each task is designed to be approximately 1 story point and can be executed independently with clear inputs, outputs, and acceptance criteria.

The job processor polls for queued translation jobs at configurable intervals, processes one job at a time using the translation service, and updates the appropriate translation tables upon completion. It integrates with the job queue module (REQ-243) for job management and the translation service (REQ-240) for AI-powered translations.

---

## Prerequisites

Before starting implementation, verify the following are complete:

| Prerequisite | Status | Verification |
|-------------|--------|--------------|
| REQ-243: Job Queue Module complete | Required | Import `fetchAndLockNextJob` from `@/lib/job-queue` works |
| REQ-240: Translation Service complete | Required | Import `translateText` from `@/lib/translation-service` works |
| Task 1.1: Translation tables exist | Required | `SELECT * FROM article_translations LIMIT 1;` |
| Task 1.2: source_language columns exist | Required | `SELECT source_language FROM items LIMIT 1;` |
| Supabase server client available | Required | `/src/lib/supabase-server.ts` exists |

---

## Task Breakdown

### Task 4.2.1: Create Type Definitions

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Create all TypeScript interfaces and types for the job processor module, including configuration, result types, and entity content structures.

**Implementation Steps:**

1. Create `job-processor.ts` file in `/src/lib/job-queue/`
2. Add imports for existing types from `translation-jobs.types.ts`
3. Define `JobProcessorConfig` interface:
   - `pollingIntervalMs: number` (default: 30000)
   - `maxConsecutiveErrors: number` (default: 5)
   - `errorPauseDurationMs: number` (default: 300000)
   - `workerId: string`
   - `lockTimeoutMinutes: number` (default: 5)
   - `enableLogging: boolean` (default: false in production)
4. Define `JobProcessingResult` interface:
   - `jobId: string`
   - `success: boolean`
   - `entityType: EntityType`
   - `entityId: string`
   - `targetLanguage: SupportedLanguage`
   - `translatedFields?: Record<string, string>`
   - `errorMessage?: string`
   - `processingTimeMs: number`
5. Define `ProcessingRunResult` interface:
   - `startedAt: string`
   - `completedAt: string`
   - `jobsProcessed: number`
   - `jobsSucceeded: number`
   - `jobsFailed: number`
   - `results: JobProcessingResult[]`
6. Define `ProcessorStats` interface:
   - `isRunning: boolean`
   - `totalJobsProcessed: number`
   - `totalJobsSucceeded: number`
   - `totalJobsFailed: number`
   - `consecutiveErrors: number`
   - `lastProcessedAt?: string`
   - `lastErrorMessage?: string`
7. Define `EntityContent` interface:
   - `entityType: EntityType`
   - `entityId: string`
   - `sourceLanguage: SupportedLanguage`
   - `fields: Record<string, string | null>`
8. Define entity-specific content interfaces:
   - `ArticleContent`: `title`, `description`
   - `ItemContent`: `name`, `description`
   - `LinkContent`: `title`
   - `TagContent`: `tag_key`, `value`
9. Add JSDoc comments to all interfaces

**Code Template:**

```typescript
/**
 * Translation Job Processor
 * Part of REQ-244: Background Job Processing
 *
 * Processes queued translation jobs from the job queue module.
 */

import type {
  TranslationJob,
  SupportedLanguage,
  EntityType,
} from './translation-jobs.types';

// ===========================================================================
// Configuration Types
// ===========================================================================

/**
 * Configuration for the job processor
 */
export interface JobProcessorConfig {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  pollingIntervalMs: number;
  /** Maximum consecutive errors before pausing (default: 5) */
  maxConsecutiveErrors: number;
  /** Pause duration after max errors in milliseconds (default: 300000 = 5 minutes) */
  errorPauseDurationMs: number;
  /** Worker identifier for job locking */
  workerId: string;
  /** Lock timeout in minutes (default: 5) */
  lockTimeoutMinutes: number;
  /** Enable detailed logging (default: false in production) */
  enableLogging: boolean;
}

// ===========================================================================
// Result Types
// ===========================================================================

/**
 * Result of processing a single job
 */
export interface JobProcessingResult {
  jobId: string;
  success: boolean;
  entityType: EntityType;
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: Record<string, string>;
  errorMessage?: string;
  processingTimeMs: number;
}

/**
 * Result of a processing run (may process multiple jobs)
 */
export interface ProcessingRunResult {
  startedAt: string;
  completedAt: string;
  jobsProcessed: number;
  jobsSucceeded: number;
  jobsFailed: number;
  results: JobProcessingResult[];
}

/**
 * Statistics about the job processor state
 */
export interface ProcessorStats {
  isRunning: boolean;
  totalJobsProcessed: number;
  totalJobsSucceeded: number;
  totalJobsFailed: number;
  consecutiveErrors: number;
  lastProcessedAt?: string;
  lastErrorMessage?: string;
}

// ===========================================================================
// Entity Content Types
// ===========================================================================

/**
 * Content fetched from source tables for translation
 */
export interface EntityContent {
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  fields: Record<string, string | null>;
}

/**
 * Article content structure
 */
export interface ArticleContent {
  title: string;
  description: string | null;
}

/**
 * Item content structure
 */
export interface ItemContent {
  name: string;
  description: string | null;
}

/**
 * Link content structure
 */
export interface LinkContent {
  title: string;
}

/**
 * Tag content structure
 */
export interface TagContent {
  tag_key: string;
  value: string;
}
```

**Acceptance Criteria:**
- [ ] File created at `/src/lib/job-queue/job-processor.ts`
- [ ] All 8 interface definitions present with complete fields
- [ ] Types align with job queue and translation service types
- [ ] JSDoc comments on all public interfaces
- [ ] TypeScript compiles without errors

**Estimated Effort:** Small (< 30 min)

---

### Task 4.2.2: Implement Entity Content Fetching

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement the `fetchEntityContent()` function to retrieve source content from the appropriate table based on entity type.

**Implementation Steps:**

1. Import `createSupabaseServer` from `/src/lib/supabase-server`
2. Implement `fetchEntityContent()` function:
   - Accept `entityType: EntityType` and `entityId: string` parameters
   - Use switch statement for each entity type
   - For `article`: Query `item_articles` table for `title`, `description`, `source_language`
   - For `item`: Query `items` table for `name`, `description`, `source_language`
   - For `link`: Query `item_links` table for `title`, `source_language`
   - For `tag`: Query `tag_translations` where `language = 'en'` for base value
   - Return `EntityContent | null`
3. Handle missing entities (return null)
4. Default `source_language` to 'en' if not set
5. Add error logging for database errors
6. Export function for testing

**Code Template:**

```typescript
import { createSupabaseServer } from '@/lib/supabase-server';

/**
 * Fetch content from source table based on entity type
 */
export async function fetchEntityContent(
  entityType: EntityType,
  entityId: string
): Promise<EntityContent | null> {
  const supabase = createSupabaseServer();

  try {
    switch (entityType) {
      case 'article': {
        const { data, error } = await supabase
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

      case 'item': {
        const { data, error } = await supabase
          .from('items')
          .select('name, description, source_language')
          .eq('id', entityId)
          .single();

        if (error || !data) {
          console.error('[JobProcessor] Failed to fetch item:', error);
          return null;
        }

        return {
          entityType: 'item',
          entityId,
          sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
          fields: {
            name: data.name,
            description: data.description,
          },
        };
      }

      case 'link': {
        const { data, error } = await supabase
          .from('item_links')
          .select('title, source_language')
          .eq('id', entityId)
          .single();

        if (error || !data) {
          console.error('[JobProcessor] Failed to fetch link:', error);
          return null;
        }

        return {
          entityType: 'link',
          entityId,
          sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
          fields: {
            title: data.title,
          },
        };
      }

      case 'tag': {
        // Tags use the tag_key itself; value comes from English tag_translations
        const { data, error } = await supabase
          .from('tag_translations')
          .select('tag_key, translated_value')
          .eq('tag_key', entityId)
          .eq('language', 'en')
          .single();

        if (error || !data) {
          console.error('[JobProcessor] Failed to fetch tag:', error);
          return null;
        }

        return {
          entityType: 'tag',
          entityId,
          sourceLanguage: 'en',
          fields: {
            translated_value: data.translated_value,
          },
        };
      }

      default:
        console.error('[JobProcessor] Unknown entity type:', entityType);
        return null;
    }
  } catch (error) {
    console.error('[JobProcessor] Exception fetching entity content:', error);
    return null;
  }
}
```

**Acceptance Criteria:**
- [ ] Function correctly fetches content for `article` entity type
- [ ] Function correctly fetches content for `item` entity type
- [ ] Function correctly fetches content for `link` entity type
- [ ] Function correctly fetches content for `tag` entity type
- [ ] Returns null for non-existent entities
- [ ] Defaults source_language to 'en' when null
- [ ] Error logging present for database failures

**Estimated Effort:** Small (30-45 min)

---

### Task 4.2.3: Implement Translation Table Updates

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement the `saveTranslation()` function to save translated content to the appropriate translation table with upsert semantics.

**Implementation Steps:**

1. Implement `saveTranslation()` function:
   - Accept `entityType`, `entityId`, `targetLanguage`, `translatedFields` parameters
   - Use switch statement for each entity type
   - For `article`: Upsert to `article_translations` table
   - For `item`: Upsert to `item_translations` table
   - For `link`: Upsert to `link_translations` table
   - For `tag`: Upsert to `tag_translations` table
   - Set `translation_status` to 'completed'
   - Set `translated_at` to current timestamp
   - Use `onConflict` for idempotent updates
   - Return boolean success indicator
2. Handle database errors with logging
3. Export function for testing

**Code Template:**

```typescript
/**
 * Save translated content to the appropriate translation table
 */
export async function saveTranslation(
  entityType: EntityType,
  entityId: string,
  targetLanguage: SupportedLanguage,
  translatedFields: Record<string, string>
): Promise<boolean> {
  const supabase = createSupabaseServer();
  const now = new Date().toISOString();

  try {
    switch (entityType) {
      case 'article': {
        const { error } = await supabase
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

      case 'item': {
        const { error } = await supabase
          .from('item_translations')
          .upsert(
            {
              item_id: entityId,
              language: targetLanguage,
              name: translatedFields.name,
              description: translatedFields.description || null,
              translation_status: 'completed',
              translated_at: now,
              updated_at: now,
            },
            {
              onConflict: 'item_id,language',
            }
          );

        if (error) {
          console.error('[JobProcessor] Failed to save item translation:', error);
          return false;
        }
        return true;
      }

      case 'link': {
        const { error } = await supabase
          .from('link_translations')
          .upsert(
            {
              link_id: entityId,
              language: targetLanguage,
              title: translatedFields.title,
              translation_status: 'completed',
              translated_at: now,
              updated_at: now,
            },
            {
              onConflict: 'link_id,language',
            }
          );

        if (error) {
          console.error('[JobProcessor] Failed to save link translation:', error);
          return false;
        }
        return true;
      }

      case 'tag': {
        const { error } = await supabase
          .from('tag_translations')
          .upsert(
            {
              tag_key: entityId,
              language: targetLanguage,
              translated_value: translatedFields.translated_value,
              is_system_tag: false,
            },
            {
              onConflict: 'tag_key,language',
            }
          );

        if (error) {
          console.error('[JobProcessor] Failed to save tag translation:', error);
          return false;
        }
        return true;
      }

      default:
        console.error('[JobProcessor] Unknown entity type for save:', entityType);
        return false;
    }
  } catch (error) {
    console.error('[JobProcessor] Exception saving translation:', error);
    return false;
  }
}
```

**Acceptance Criteria:**
- [ ] Function correctly upserts to `article_translations` table
- [ ] Function correctly upserts to `item_translations` table
- [ ] Function correctly upserts to `link_translations` table
- [ ] Function correctly upserts to `tag_translations` table
- [ ] Uses `onConflict` for idempotent updates
- [ ] Sets `translation_status` to 'completed'
- [ ] Sets `translated_at` timestamp
- [ ] Returns boolean success indicator
- [ ] Error logging present for database failures

**Estimated Effort:** Small (30-45 min)

---

### Task 4.2.4: Implement Translation Context Helpers

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement helper functions `getTranslationContext()` and `getContentType()` to provide domain context and content type mapping for the translation service.

**Implementation Steps:**

1. Implement `getTranslationContext()`:
   - Accept `entityType: EntityType` parameter
   - Return domain context string for each entity type
   - Provide vacation rental property context
2. Implement `getContentType()`:
   - Accept `entityType: EntityType` and `fieldName: string` parameters
   - Map entity type + field name to content type
   - Return appropriate translation service content type

**Code Template:**

```typescript
/**
 * Get translation context based on entity type
 * Provides domain-specific context for better translation quality
 */
function getTranslationContext(entityType: EntityType): { domainContext: string } {
  const contexts: Record<EntityType, string> = {
    article: 'FAQ article in vacation rental property context. Help guide for guests.',
    item: 'Household item or appliance in vacation rental property. Name and usage instructions.',
    link: 'Resource link title for vacation rental property instructions. External reference.',
    tag: 'Category tag for organizing property items. Single word or short phrase.',
  };

  return { domainContext: contexts[entityType] };
}

/**
 * Map entity type and field to content type for translation
 */
function getContentType(
  entityType: EntityType,
  fieldName: string
): 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag' {
  const mapping: Record<string, 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag'> = {
    'article.title': 'article_title',
    'article.description': 'article_description',
    'item.name': 'item_name',
    'item.description': 'item_description',
    'link.title': 'link_title',
    'tag.translated_value': 'tag',
  };

  const key = `${entityType}.${fieldName}`;
  return mapping[key] || 'item_description';
}
```

**Acceptance Criteria:**
- [ ] `getTranslationContext()` returns appropriate context for all 4 entity types
- [ ] `getContentType()` correctly maps all entity type + field combinations
- [ ] Contexts are vacation rental property specific
- [ ] Default fallback provided for unknown combinations

**Estimated Effort:** Small (15-20 min)

---

### Task 4.2.5: Implement Single Job Processing Function

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement the core `processJob()` function that orchestrates fetching content, translating fields, saving results, and updating job status.

**Implementation Steps:**

1. Import `translateText` from translation service
2. Import `markJobCompleted`, `markJobFailed` from job queue
3. Implement `processJob()` function:
   - Accept `job: TranslationJob` and `config: JobProcessorConfig` parameters
   - Track start time for processing duration
   - Fetch entity content using `fetchEntityContent()`
   - Throw error if entity not found
   - Iterate over content fields
   - Skip null/empty fields
   - Call `translateText()` for each field with context
   - Save translations using `saveTranslation()`
   - Mark job completed on success
   - Mark job failed on error with error message
   - Return `JobProcessingResult`
4. Add try-catch for error handling
5. Add logging based on config.enableLogging

**Code Template:**

```typescript
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from './translation-jobs';

/**
 * Process a single translation job
 */
async function processJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityType, entityId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch source content
    const content = await fetchEntityContent(entityType, entityId);

    if (!content) {
      throw new Error(`Entity not found: ${entityType}/${entityId}`);
    }

    // 2. Translate each field
    const translatedFields: Record<string, string> = {};
    const context = getTranslationContext(entityType);

    for (const [fieldName, fieldValue] of Object.entries(content.fields)) {
      if (fieldValue === null || fieldValue === '') {
        // Skip null/empty fields
        continue;
      }

      const contentType = getContentType(entityType, fieldName);

      const result = await translateText(fieldValue, sourceLanguage, targetLanguage, {
        context: {
          contentType,
          domainContext: context.domainContext,
        },
      });

      translatedFields[fieldName] = result.translatedText;
    }

    // 3. Save to translation table
    const saved = await saveTranslation(
      entityType,
      entityId,
      targetLanguage,
      translatedFields
    );

    if (!saved) {
      throw new Error('Failed to save translation to database');
    }

    // 4. Mark job completed
    await markJobCompleted(job.id);

    if (config.enableLogging) {
      console.log(`[JobProcessor] Job ${job.id} completed successfully`);
    }

    return {
      jobId: job.id,
      success: true,
      entityType,
      entityId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Mark job failed
    await markJobFailed(job.id, errorMessage);

    if (config.enableLogging) {
      console.error(`[JobProcessor] Job ${job.id} failed:`, errorMessage);
    }

    return {
      jobId: job.id,
      success: false,
      entityType,
      entityId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Function fetches entity content before translating
- [ ] Function skips null/empty fields
- [ ] Function translates each field with appropriate context
- [ ] Function saves translations to correct table
- [ ] Function marks job completed on success
- [ ] Function marks job failed on any error
- [ ] Function tracks and returns processing time
- [ ] Logging controlled by config.enableLogging

**Estimated Effort:** Medium (45-60 min)

---

### Task 4.2.6: Implement TranslationJobProcessor Class - Core Structure

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement the core `TranslationJobProcessor` class structure with constructor, configuration, and internal state management.

**Implementation Steps:**

1. Define `DEFAULT_CONFIG` constant with sensible defaults
2. Implement class constructor:
   - Accept optional `Partial<JobProcessorConfig>` parameter
   - Merge with defaults using spread operator
   - Initialize internal state variables
3. Add private instance variables:
   - `config: JobProcessorConfig`
   - `intervalId: NodeJS.Timeout | null`
   - `isProcessing: boolean`
   - `stats: ProcessorStats`
4. Implement private `log()` helper method for consistent logging
5. Read configuration from environment variables where appropriate

**Code Template:**

```typescript
// ===========================================================================
// Default Configuration
// ===========================================================================

/**
 * Default processor configuration
 */
const DEFAULT_CONFIG: JobProcessorConfig = {
  pollingIntervalMs: parseInt(process.env.TRANSLATION_JOB_INTERVAL_MS || '30000', 10),
  maxConsecutiveErrors: parseInt(process.env.TRANSLATION_JOB_MAX_ERRORS || '5', 10),
  errorPauseDurationMs: parseInt(process.env.TRANSLATION_JOB_ERROR_PAUSE_MS || '300000', 10),
  workerId: `processor-${process.pid}-${Date.now()}`,
  lockTimeoutMinutes: 5,
  enableLogging: process.env.NODE_ENV !== 'production',
};

// ===========================================================================
// TranslationJobProcessor Class
// ===========================================================================

/**
 * Translation Job Processor
 *
 * Polls for queued translation jobs and processes them sequentially.
 * Automatically pauses on repeated failures and resumes after cooldown.
 */
export class TranslationJobProcessor {
  private config: JobProcessorConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private stats: ProcessorStats = {
    isRunning: false,
    totalJobsProcessed: 0,
    totalJobsSucceeded: 0,
    totalJobsFailed: 0,
    consecutiveErrors: 0,
  };

  constructor(config: Partial<JobProcessorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log messages based on configuration
   */
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: unknown
  ): void {
    if (!this.config.enableLogging && level === 'debug') {
      return;
    }

    const prefix = '[JobProcessor]';
    const logData = data ? ` ${JSON.stringify(data)}` : '';

    switch (level) {
      case 'debug':
        console.debug(`${prefix} ${message}${logData}`);
        break;
      case 'info':
        console.info(`${prefix} ${message}${logData}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}${logData}`);
        break;
      case 'error':
        console.error(`${prefix} ${message}${logData}`);
        break;
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `DEFAULT_CONFIG` reads from environment variables with fallbacks
- [ ] Constructor merges config with defaults
- [ ] Worker ID is unique per process instance
- [ ] Internal state variables initialized correctly
- [ ] `log()` method respects `enableLogging` config
- [ ] Debug logs suppressed when logging disabled

**Estimated Effort:** Small (20-30 min)

---

### Task 4.2.7: Implement TranslationJobProcessor Class - Start/Stop Lifecycle

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement the `start()`, `stop()`, and `isRunning()` methods for processor lifecycle management.

**Implementation Steps:**

1. Implement `start()` method:
   - Check if already running (warn and return)
   - Set `stats.isRunning` to true
   - Log startup with config details
   - Run first processing cycle immediately
   - Set up interval for subsequent cycles
2. Implement `stop()` method:
   - Check if not running (return early)
   - Set `stats.isRunning` to false
   - Clear interval
   - Wait for current processing to complete (polling loop)
   - Log shutdown
   - Return Promise<void>
3. Implement `isRunning()` method:
   - Return `stats.isRunning` boolean

**Code Template:**

```typescript
// Add to TranslationJobProcessor class

/**
 * Start the processor polling loop
 */
start(): void {
  if (this.stats.isRunning) {
    this.log('warn', 'Already running');
    return;
  }

  this.stats.isRunning = true;
  this.log('info', 'Starting job processor', {
    pollingIntervalMs: this.config.pollingIntervalMs,
    workerId: this.config.workerId,
  });

  // Run immediately, then on interval
  this.runProcessingCycle();

  this.intervalId = setInterval(() => {
    this.runProcessingCycle();
  }, this.config.pollingIntervalMs);
}

/**
 * Stop the processor
 */
async stop(): Promise<void> {
  if (!this.stats.isRunning) {
    return;
  }

  this.stats.isRunning = false;

  if (this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  // Wait for current processing to complete
  while (this.isProcessing) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  this.log('info', 'Job processor stopped');
}

/**
 * Check if processor is running
 */
isRunning(): boolean {
  return this.stats.isRunning;
}
```

**Acceptance Criteria:**
- [ ] `start()` prevents double-start with warning
- [ ] `start()` logs configuration on startup
- [ ] `start()` runs first cycle immediately
- [ ] `start()` sets up interval for subsequent cycles
- [ ] `stop()` clears interval
- [ ] `stop()` waits for current processing to complete
- [ ] `stop()` is idempotent (can be called multiple times)
- [ ] `isRunning()` returns correct state

**Estimated Effort:** Small (20-30 min)

---

### Task 4.2.8: Implement TranslationJobProcessor Class - Processing Methods

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement `processNextJob()` and `runProcessingCycle()` methods for job processing logic.

**Implementation Steps:**

1. Import `fetchAndLockNextJob` from job queue
2. Implement `processNextJob()` method:
   - Call `fetchAndLockNextJob()` with worker ID and lock timeout
   - Return null if no jobs available
   - Call `processJob()` with locked job
   - Return `JobProcessingResult`
3. Implement `runProcessingCycle()` method:
   - Check if already processing (skip cycle)
   - Set `isProcessing` to true
   - Call `processNextJob()`
   - Update stats based on result
   - Handle consecutive errors and pausing
   - Set `isProcessing` to false in finally block
   - Return `ProcessingRunResult`
4. Implement private `pauseProcessing()` method:
   - Clear current interval
   - Wait for `errorPauseDurationMs`
   - Reset consecutive errors
   - Resume polling if still running

**Code Template:**

```typescript
import { fetchAndLockNextJob } from './translation-jobs';

// Add to TranslationJobProcessor class

/**
 * Process the next available job (manual trigger)
 */
async processNextJob(): Promise<JobProcessingResult | null> {
  const { data: job } = await fetchAndLockNextJob({
    workerId: this.config.workerId,
    lockTimeoutMinutes: this.config.lockTimeoutMinutes,
  });

  if (!job) {
    return null;
  }

  return processJob(job, this.config);
}

/**
 * Run a full processing cycle
 */
async runProcessingCycle(): Promise<ProcessingRunResult> {
  if (this.isProcessing) {
    this.log('debug', 'Skipping cycle - already processing');
    return {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      jobsProcessed: 0,
      jobsSucceeded: 0,
      jobsFailed: 0,
      results: [],
    };
  }

  this.isProcessing = true;
  const startedAt = new Date().toISOString();
  const results: JobProcessingResult[] = [];

  try {
    // Process one job per cycle (as specified in requirements)
    const result = await this.processNextJob();

    if (result) {
      results.push(result);
      this.stats.totalJobsProcessed++;
      this.stats.lastProcessedAt = new Date().toISOString();

      if (result.success) {
        this.stats.totalJobsSucceeded++;
        this.stats.consecutiveErrors = 0;
      } else {
        this.stats.totalJobsFailed++;
        this.stats.consecutiveErrors++;
        this.stats.lastErrorMessage = result.errorMessage;

        // Check if we need to pause
        if (this.stats.consecutiveErrors >= this.config.maxConsecutiveErrors) {
          this.log('warn', 'Max consecutive errors reached, pausing...', {
            consecutiveErrors: this.stats.consecutiveErrors,
            pauseDurationMs: this.config.errorPauseDurationMs,
          });

          await this.pauseProcessing();
        }
      }
    } else {
      this.log('debug', 'No jobs available');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.log('error', 'Processing cycle error:', errorMessage);
    this.stats.consecutiveErrors++;
    this.stats.lastErrorMessage = errorMessage;

  } finally {
    this.isProcessing = false;
  }

  const completedAt = new Date().toISOString();

  return {
    startedAt,
    completedAt,
    jobsProcessed: results.length,
    jobsSucceeded: results.filter(r => r.success).length,
    jobsFailed: results.filter(r => !r.success).length,
    results,
  };
}

/**
 * Pause processing for error cooldown
 */
private async pauseProcessing(): Promise<void> {
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  await new Promise(resolve =>
    setTimeout(resolve, this.config.errorPauseDurationMs)
  );

  // Reset consecutive errors and resume
  this.stats.consecutiveErrors = 0;

  if (this.stats.isRunning) {
    this.intervalId = setInterval(() => {
      this.runProcessingCycle();
    }, this.config.pollingIntervalMs);

    this.log('info', 'Resuming after error pause');
  }
}
```

**Acceptance Criteria:**
- [ ] `processNextJob()` returns null when no jobs available
- [ ] `processNextJob()` returns result when job processed
- [ ] `runProcessingCycle()` skips if already processing
- [ ] `runProcessingCycle()` updates stats correctly
- [ ] `runProcessingCycle()` resets consecutive errors on success
- [ ] `runProcessingCycle()` triggers pause on max errors
- [ ] `pauseProcessing()` waits configured duration
- [ ] `pauseProcessing()` resumes polling after pause

**Estimated Effort:** Medium (45-60 min)

---

### Task 4.2.9: Implement TranslationJobProcessor Class - Stats and Config

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement `getStats()`, `resetStats()`, and `updateConfig()` methods for monitoring and runtime configuration.

**Implementation Steps:**

1. Implement `getStats()` method:
   - Return copy of stats object (prevent mutation)
2. Implement `resetStats()` method:
   - Reset all counters to 0
   - Preserve `isRunning` state
   - Clear last error message and timestamp
3. Implement `updateConfig()` method:
   - Accept `Partial<JobProcessorConfig>` parameter
   - Merge with current config
   - If `pollingIntervalMs` changed and processor running:
     - Clear current interval
     - Set up new interval with new duration

**Code Template:**

```typescript
// Add to TranslationJobProcessor class

/**
 * Get processor statistics
 */
getStats(): ProcessorStats {
  return { ...this.stats };
}

/**
 * Reset statistics
 */
resetStats(): void {
  this.stats = {
    isRunning: this.stats.isRunning,
    totalJobsProcessed: 0,
    totalJobsSucceeded: 0,
    totalJobsFailed: 0,
    consecutiveErrors: 0,
  };
}

/**
 * Update configuration at runtime
 */
updateConfig(config: Partial<JobProcessorConfig>): void {
  this.config = { ...this.config, ...config };

  // Restart interval if polling interval changed and processor is running
  if (config.pollingIntervalMs && this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.runProcessingCycle();
    }, this.config.pollingIntervalMs);

    this.log('info', 'Polling interval updated', {
      pollingIntervalMs: this.config.pollingIntervalMs,
    });
  }
}
```

**Acceptance Criteria:**
- [ ] `getStats()` returns copy of stats (not reference)
- [ ] `resetStats()` resets all counters to 0
- [ ] `resetStats()` preserves `isRunning` state
- [ ] `updateConfig()` merges with existing config
- [ ] `updateConfig()` restarts interval if polling interval changed

**Estimated Effort:** Small (15-20 min)

---

### Task 4.2.10: Implement Factory and Singleton Functions

**File:** `/src/lib/job-queue/job-processor.ts`

**Description:** Implement factory function, singleton pattern, and convenience functions for global processor access.

**Implementation Steps:**

1. Implement `createJobProcessor()` factory function:
   - Accept optional config parameter
   - Return new `TranslationJobProcessor` instance
2. Implement singleton pattern:
   - Private module-level variable `globalProcessor`
   - `getJobProcessor()` - return or create singleton
   - `resetJobProcessor()` - stop and clear singleton (for testing)
3. Implement convenience functions:
   - `startJobProcessor()` - start global processor
   - `stopJobProcessor()` - stop global processor
4. Export all functions

**Code Template:**

```typescript
// ===========================================================================
// Factory Functions
// ===========================================================================

/**
 * Create a new job processor instance
 */
export function createJobProcessor(
  config?: Partial<JobProcessorConfig>
): TranslationJobProcessor {
  return new TranslationJobProcessor(config);
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let globalProcessor: TranslationJobProcessor | null = null;

/**
 * Get the global job processor instance
 *
 * Creates a singleton instance on first call. Use this for application-wide
 * background processing.
 */
export function getJobProcessor(): TranslationJobProcessor {
  if (!globalProcessor) {
    globalProcessor = createJobProcessor();
  }
  return globalProcessor;
}

/**
 * Reset the global processor (useful for testing)
 */
export async function resetJobProcessor(): Promise<void> {
  if (globalProcessor) {
    await globalProcessor.stop();
    globalProcessor = null;
  }
}

/**
 * Start the global job processor
 */
export function startJobProcessor(): void {
  getJobProcessor().start();
}

/**
 * Stop the global job processor
 */
export async function stopJobProcessor(): Promise<void> {
  if (globalProcessor) {
    await globalProcessor.stop();
  }
}
```

**Acceptance Criteria:**
- [ ] `createJobProcessor()` returns new instance each call
- [ ] `getJobProcessor()` returns same instance (singleton)
- [ ] `resetJobProcessor()` stops and clears singleton
- [ ] `startJobProcessor()` starts global processor
- [ ] `stopJobProcessor()` stops global processor
- [ ] All functions exported

**Estimated Effort:** Small (15-20 min)

---

### Task 4.2.11: Update Barrel Exports

**File:** `/src/lib/job-queue/index.ts`

**Description:** Update the barrel export file to include all job processor exports.

**Implementation Steps:**

1. Add function exports from `job-processor.ts`:
   - `TranslationJobProcessor` class
   - `createJobProcessor`
   - `getJobProcessor`
   - `resetJobProcessor`
   - `startJobProcessor`
   - `stopJobProcessor`
   - `fetchEntityContent`
   - `saveTranslation`
2. Add type exports from `job-processor.ts`:
   - `JobProcessorConfig`
   - `JobProcessingResult`
   - `ProcessingRunResult`
   - `ProcessorStats`
   - `EntityContent`

**Code Template:**

```typescript
// Add to existing /src/lib/job-queue/index.ts

// Job processor exports
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

// Job processor types
export type {
  JobProcessorConfig,
  JobProcessingResult,
  ProcessingRunResult,
  ProcessorStats,
  EntityContent,
} from './job-processor';
```

**Acceptance Criteria:**
- [ ] All job processor functions exported
- [ ] All job processor types exported with `export type`
- [ ] Import from `@/lib/job-queue` includes new exports
- [ ] No TypeScript errors

**Estimated Effort:** Small (10-15 min)

---

### Task 4.2.12: Add Environment Variable Documentation

**File:** `/.env.example`

**Description:** Add documentation for job processor configuration environment variables.

**Implementation Steps:**

1. Add section header for Translation Job Processor
2. Add `TRANSLATION_JOB_INTERVAL_MS` with default 30000
3. Add `TRANSLATION_JOB_MAX_ERRORS` with default 5
4. Add `TRANSLATION_JOB_ERROR_PAUSE_MS` with default 300000
5. Add comments explaining each variable

**Code Template:**

```bash
# =============================================================================
# Translation Job Processor Configuration
# =============================================================================

# Polling interval in milliseconds (default: 30000 = 30 seconds)
# How often the job processor checks for queued translation jobs
TRANSLATION_JOB_INTERVAL_MS=30000

# Maximum consecutive errors before pausing (default: 5)
# After this many failures in a row, the processor pauses to prevent tight error loops
TRANSLATION_JOB_MAX_ERRORS=5

# Pause duration after max errors in milliseconds (default: 300000 = 5 minutes)
# How long to wait before resuming after hitting max consecutive errors
TRANSLATION_JOB_ERROR_PAUSE_MS=300000
```

**Acceptance Criteria:**
- [ ] Section header clearly identifies purpose
- [ ] All three environment variables documented
- [ ] Default values specified in comments
- [ ] Variable naming consistent with codebase
- [ ] Comments explain behavior

**Estimated Effort:** Small (10 min)

---

## Implementation Order

Execute tasks in the following order for optimal dependency management:

1. **Task 4.2.1** - Create Type Definitions
2. **Task 4.2.2** - Implement Entity Content Fetching
3. **Task 4.2.3** - Implement Translation Table Updates
4. **Task 4.2.4** - Implement Translation Context Helpers
5. **Task 4.2.5** - Implement Single Job Processing Function
6. **Task 4.2.6** - Implement TranslationJobProcessor Class - Core Structure
7. **Task 4.2.7** - Implement TranslationJobProcessor Class - Start/Stop Lifecycle
8. **Task 4.2.8** - Implement TranslationJobProcessor Class - Processing Methods
9. **Task 4.2.9** - Implement TranslationJobProcessor Class - Stats and Config
10. **Task 4.2.10** - Implement Factory and Singleton Functions
11. **Task 4.2.11** - Update Barrel Exports
12. **Task 4.2.12** - Add Environment Variable Documentation

---

## Testing Checklist

After implementation, verify:

### Unit Tests

Create `/src/lib/job-queue/__tests__/job-processor.test.ts`:

- [ ] `fetchEntityContent()` fetches article content correctly
- [ ] `fetchEntityContent()` fetches item content correctly
- [ ] `fetchEntityContent()` fetches link content correctly
- [ ] `fetchEntityContent()` fetches tag content correctly
- [ ] `fetchEntityContent()` returns null for missing entities
- [ ] `saveTranslation()` saves article translation correctly
- [ ] `saveTranslation()` saves item translation correctly
- [ ] `saveTranslation()` saves link translation correctly
- [ ] `saveTranslation()` saves tag translation correctly
- [ ] `saveTranslation()` sets translation_status to 'completed'
- [ ] `getTranslationContext()` returns context for all entity types
- [ ] `getContentType()` maps all entity/field combinations

### Class Tests

- [ ] Constructor merges config with defaults
- [ ] `start()` prevents double-start
- [ ] `stop()` waits for current processing
- [ ] `processNextJob()` returns null when no jobs
- [ ] `runProcessingCycle()` updates stats correctly
- [ ] `runProcessingCycle()` triggers pause on max errors
- [ ] `getStats()` returns copy, not reference
- [ ] `resetStats()` preserves isRunning state
- [ ] Singleton pattern returns same instance

### Integration Tests

- [ ] Process real job from queue (with mock translation service)
- [ ] Verify translation table updates after processing
- [ ] Verify job status updates to 'completed'
- [ ] Verify job status updates to 'failed' on error
- [ ] Test concurrent processing prevention
- [ ] Test pause/resume on consecutive failures

### Manual Verification

- [ ] Import from `@/lib/job-queue` includes new exports
- [ ] Environment variables read correctly
- [ ] Logging appears when enabled
- [ ] Processor starts and polls correctly
- [ ] Processor stops gracefully

---

## Edge Cases to Handle

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Entity deleted after job created | `fetchEntityContent()` returns null, job marked failed |
| Empty/null fields to translate | Fields skipped, only non-empty translated |
| Translation service unavailable | Job marked failed, retry on next attempt |
| Database write failure | `saveTranslation()` returns false, job marked failed |
| Job already processed (lock conflict) | `fetchAndLockNextJob()` returns next available or null |
| Processor stopped mid-processing | Current job completes, then processor stops |
| All fields null/empty | Empty `translatedFields`, job still marked completed |
| Source language equals target | Job queue should prevent this; processor handles gracefully |

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `/src/lib/job-queue/job-processor.ts` | Create | Main job processor implementation |
| `/src/lib/job-queue/index.ts` | Modify | Add job processor exports |
| `/.env.example` | Modify | Add job processor configuration variables |

---

## Dependencies Created

This module creates the following dependencies for downstream tasks:

| Downstream Task | Dependency |
|----------------|------------|
| Task 4.3: API Route for Job Processing | Uses `getJobProcessor()`, `processNextJob()`, `runProcessingCycle()` |
| Task 4.4: Concurrency Control | Extends processor functionality, uses internal locking |
| Task 4.5: Job Status API | May query `getStats()` for processor status |

---

## Rollback Plan

If issues occur during implementation:

1. Delete `/src/lib/job-queue/job-processor.ts`
2. Remove job processor exports from `/src/lib/job-queue/index.ts`
3. Remove environment variables from `/.env.example`
4. No database changes required (uses existing tables)

---

## Acceptance Criteria Verification

| Criteria (from PRD) | Implementation Verification |
|-------------------------|----------------------------|
| System checks for queued translation jobs at configurable time interval | `pollingIntervalMs` config; `TRANSLATION_JOB_INTERVAL_MS` env var |
| Only one translation job is processed at a time | `processNextJob()` fetches single job; `isProcessing` flag prevents overlap |
| Translated content appears in correct location for content type | `saveTranslation()` writes to entity-specific tables |
| Job status updates to 'completed' on success | `markJobCompleted(job.id)` called after save |
| Job status updates to 'failed' with diagnostic info | `markJobFailed(job.id, errorMessage)` on any error |
| Processing interval can be configured without code changes | Environment variable `TRANSLATION_JOB_INTERVAL_MS` |
| System continues processing subsequent jobs after failure | `runProcessingCycle()` catches errors, continues polling |

---

## Usage Examples

### Starting Background Processing

```typescript
import { startJobProcessor, stopJobProcessor, getJobProcessor } from '@/lib/job-queue';

// Start processing (typically in app initialization)
startJobProcessor();

// Check stats periodically
const stats = getJobProcessor().getStats();
console.log(`Processed: ${stats.totalJobsProcessed}, Succeeded: ${stats.totalJobsSucceeded}`);

// Stop on shutdown
await stopJobProcessor();
```

### Manual Job Processing (API Route)

```typescript
import { getJobProcessor } from '@/lib/job-queue';

// Process next available job on demand
const result = await getJobProcessor().processNextJob();

if (result) {
  console.log(`Processed job ${result.jobId}: ${result.success ? 'success' : 'failed'}`);
}
```

### Custom Configuration

```typescript
import { createJobProcessor } from '@/lib/job-queue';

const processor = createJobProcessor({
  pollingIntervalMs: 60000, // 1 minute
  maxConsecutiveErrors: 10,
  enableLogging: true,
});

processor.start();
```

---

## References

- Overview Document: `/docs/REQ-244-implement-job-processor-overview.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (Phase 4, Task 4.2)
- Job Queue Module: REQ-243 (`/docs/REQ-243-create-translation-job-queue-module-detailed.md`)
- Translation Service: REQ-240 (`/docs/REQ-240-create-main-translation-service-wrapper-overview.md`)
- Database Types: `/src/lib/supabase.ts`
- Server-side Supabase: `/src/lib/supabase-server.ts`

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.2*
