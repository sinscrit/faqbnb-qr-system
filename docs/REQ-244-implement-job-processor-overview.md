# REQ-244: Implement Job Processor - Implementation Overview

**Generated:** 2026-01-18 22:45:00 UTC
**Last Modified:** 2026-01-18 22:45:00 UTC
**Request Reference:** REQ-244 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.2

---

## Summary

Implement a background job processor that polls for queued translation jobs at configurable intervals, processes one job at a time using the translation service, and updates the appropriate translation tables upon completion. The processor integrates with the job queue module (REQ-243) to fetch and lock jobs, uses the translation service (REQ-240) to perform actual translations, and writes results to the entity-specific translation tables (article_translations, item_translations, link_translations, tag_translations).

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **ORM/Client** | @supabase/supabase-js, @supabase/ssr |
| **Server Patterns** | createSupabaseServer() for server-side operations |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Job Queue Module | `/src/lib/job-queue/translation-jobs.ts` | Job fetching with locking, status updates |
| Translation Service | `/src/lib/translation-service/translation-service.ts` | AI translation with fallback and retry |
| Admin API Routes | `/src/app/api/admin/accounts/route.ts` | Auth validation, error handling patterns |
| Database Types | `/src/lib/supabase.ts` | TypeScript database type definitions |
| Server-side Supabase | `/src/lib/supabase-server.ts` | `createSupabaseServer()` for server components |

### Dependencies (Must Be Complete Before This Task)

| Task | File | Purpose |
|------|------|---------|
| REQ-243 (Task 4.1) | `/src/lib/job-queue/translation-jobs.ts` | Job queue module with `fetchAndLockNextJob()`, `markJobCompleted()`, `markJobFailed()` |
| REQ-240 (Task 3.6) | `/src/lib/translation-service/translation-service.ts` | `translateText()` function with provider fallback |
| Task 1.1 | Database migration | Translation tables: article_translations, item_translations, link_translations, tag_translations |

---

## Architecture

### Module Structure

```
/src/lib/job-queue/
├── index.ts                        # Barrel exports (update)
├── translation-jobs.ts             # Job queue module (existing)
├── translation-jobs.types.ts       # Type definitions (existing)
└── job-processor.ts                # NEW: Job processor implementation
```

### Database Tables Involved

The job processor reads from these source tables and writes to these translation tables:

| Entity Type | Source Table | Translation Table | Fields to Translate |
|-------------|--------------|-------------------|---------------------|
| `article` | `item_articles` | `article_translations` | `title`, `description` |
| `item` | `items` | `item_translations` | `name`, `description` |
| `link` | `item_links` | `link_translations` | `title` |
| `tag` | (tag_key) | `tag_translations` | `translated_value` |

### Processing Flow

```
                     ┌─────────────────────────────────────────┐
                     │           Job Processor                  │
                     └─────────────────┬───────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Fetch & Lock   │         │    Translate    │         │ Update Tables   │
│   Next Job      │───────▶ │  Source Content │───────▶ │  with Results   │
│  (job-queue)    │         │ (translation-   │         │   (Supabase)    │
│                 │         │    service)     │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                             │                             │
         │                             ▼                             │
         │                  ┌─────────────────┐                     │
         │                  │  On Failure:    │                     │
         │                  │ Mark Job Failed │◀────────────────────┘
         │                  │ (job-queue)     │
         │                  └─────────────────┘
         │                             │
         │                             ▼
         │                  ┌─────────────────┐
         └──────────────────│  On Success:    │
                            │ Mark Completed  │
                            │ (job-queue)     │
                            └─────────────────┘
```

---

## Integration Contract

### Core Interfaces

```typescript
// /src/lib/job-queue/job-processor.ts

import type { TranslationJob, SupportedLanguage, EntityType } from './translation-jobs.types';

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
```

### Entity Content Interfaces

```typescript
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
  value: string; // The English value to translate
}
```

### Module Functions

```typescript
// Job Processor Class
export class TranslationJobProcessor {
  constructor(config?: Partial<JobProcessorConfig>);

  // Lifecycle
  start(): void;
  stop(): Promise<void>;
  isRunning(): boolean;

  // Manual trigger
  processNextJob(): Promise<JobProcessingResult | null>;
  runProcessingCycle(): Promise<ProcessingRunResult>;

  // Stats and monitoring
  getStats(): ProcessorStats;
  resetStats(): void;
}

// Factory function
export function createJobProcessor(
  config?: Partial<JobProcessorConfig>
): TranslationJobProcessor;

// Singleton for background processing
export function getJobProcessor(): TranslationJobProcessor;
export function resetJobProcessor(): void;

// Content fetching (internal, exported for testing)
export async function fetchEntityContent(
  entityType: EntityType,
  entityId: string
): Promise<EntityContent | null>;

// Translation table updates (internal, exported for testing)
export async function saveTranslation(
  entityType: EntityType,
  entityId: string,
  targetLanguage: SupportedLanguage,
  translatedFields: Record<string, string>
): Promise<boolean>;
```

---

## Implementation Tasks

### Task 4.2.1: Create Type Definitions

**File:** `/src/lib/job-queue/job-processor.ts`

Create all TypeScript interfaces and types for the job processor:

- `JobProcessorConfig` - Processor configuration
- `JobProcessingResult` - Single job result
- `ProcessingRunResult` - Batch processing result
- `ProcessorStats` - Processor statistics
- `EntityContent` - Generic content structure
- Entity-specific content interfaces (Article, Item, Link, Tag)

**Acceptance Criteria:**
- All types defined with proper constraints
- Types align with job queue and translation service types
- JSDoc comments for all interfaces

### Task 4.2.2: Implement Entity Content Fetching

**File:** `/src/lib/job-queue/job-processor.ts`

Implement function to fetch source content for each entity type:

```typescript
/**
 * Fetch content from source table based on entity type
 */
export async function fetchEntityContent(
  entityType: EntityType,
  entityId: string
): Promise<EntityContent | null> {
  const supabase = createSupabaseServer();

  switch (entityType) {
    case 'article': {
      const { data } = await supabase
        .from('item_articles')
        .select('title, description, source_language')
        .eq('id', entityId)
        .single();

      if (!data) return null;

      return {
        entityType: 'article',
        entityId,
        sourceLanguage: data.source_language || 'en',
        fields: {
          title: data.title,
          description: data.description,
        },
      };
    }

    case 'item': {
      const { data } = await supabase
        .from('items')
        .select('name, description, source_language')
        .eq('id', entityId)
        .single();

      if (!data) return null;

      return {
        entityType: 'item',
        entityId,
        sourceLanguage: data.source_language || 'en',
        fields: {
          name: data.name,
          description: data.description,
        },
      };
    }

    case 'link': {
      const { data } = await supabase
        .from('item_links')
        .select('title, source_language')
        .eq('id', entityId)
        .single();

      if (!data) return null;

      return {
        entityType: 'link',
        entityId,
        sourceLanguage: data.source_language || 'en',
        fields: {
          title: data.title,
        },
      };
    }

    case 'tag': {
      // Tags use the tag_key itself; value comes from English tag_translations
      const { data } = await supabase
        .from('tag_translations')
        .select('tag_key, translated_value')
        .eq('tag_key', entityId)
        .eq('language', 'en')
        .single();

      if (!data) return null;

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
      return null;
  }
}
```

**Acceptance Criteria:**
- Correctly fetches content for all 4 entity types
- Returns null for non-existent entities
- Handles source_language column (defaults to 'en')
- Proper error handling

### Task 4.2.3: Implement Translation Table Updates

**File:** `/src/lib/job-queue/job-processor.ts`

Implement function to save translations to the appropriate table:

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

  switch (entityType) {
    case 'article': {
      const { error } = await supabase
        .from('article_translations')
        .upsert({
          article_id: entityId,
          language: targetLanguage,
          title: translatedFields.title,
          description: translatedFields.description || null,
          translation_status: 'completed',
          translated_at: now,
          updated_at: now,
        }, {
          onConflict: 'article_id,language',
        });

      return !error;
    }

    case 'item': {
      const { error } = await supabase
        .from('item_translations')
        .upsert({
          item_id: entityId,
          language: targetLanguage,
          name: translatedFields.name,
          description: translatedFields.description || null,
          translation_status: 'completed',
          translated_at: now,
          updated_at: now,
        }, {
          onConflict: 'item_id,language',
        });

      return !error;
    }

    case 'link': {
      const { error } = await supabase
        .from('link_translations')
        .upsert({
          link_id: entityId,
          language: targetLanguage,
          title: translatedFields.title,
          translation_status: 'completed',
          translated_at: now,
          updated_at: now,
        }, {
          onConflict: 'link_id,language',
        });

      return !error;
    }

    case 'tag': {
      const { error } = await supabase
        .from('tag_translations')
        .upsert({
          tag_key: entityId,
          language: targetLanguage,
          translated_value: translatedFields.translated_value,
          is_system_tag: false, // User tags, not system
        }, {
          onConflict: 'tag_key,language',
        });

      return !error;
    }

    default:
      return false;
  }
}
```

**Acceptance Criteria:**
- Correctly upserts to all 4 translation tables
- Uses `onConflict` for idempotent updates
- Sets `translation_status` to 'completed'
- Sets `translated_at` timestamp
- Returns boolean success indicator

### Task 4.2.4: Implement Single Job Processing

**File:** `/src/lib/job-queue/job-processor.ts`

Implement the core job processing function:

```typescript
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

      const result = await translateText(
        fieldValue,
        sourceLanguage,
        targetLanguage,
        { context: { ...context, contentType: getContentType(entityType, fieldName) } }
      );

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

/**
 * Get translation context based on entity type
 */
function getTranslationContext(entityType: EntityType): { domainContext: string } {
  const contexts: Record<EntityType, string> = {
    article: 'FAQ article in vacation rental property context',
    item: 'Household item or appliance in vacation rental property',
    link: 'Resource link title for vacation rental property instructions',
    tag: 'Category tag for organizing property items',
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
  const mapping: Record<string, any> = {
    'article.title': 'article_title',
    'article.description': 'article_description',
    'item.name': 'item_name',
    'item.description': 'item_description',
    'link.title': 'link_title',
    'tag.translated_value': 'tag',
  };

  return mapping[`${entityType}.${fieldName}`] || 'item_description';
}
```

**Acceptance Criteria:**
- Fetches content, translates fields, saves results
- Handles empty/null fields gracefully
- Marks job completed on success
- Marks job failed on any error
- Tracks processing time
- Returns detailed result object

### Task 4.2.5: Implement Job Processor Class

**File:** `/src/lib/job-queue/job-processor.ts`

Implement the main `TranslationJobProcessor` class:

```typescript
/**
 * Default processor configuration
 */
const DEFAULT_CONFIG: JobProcessorConfig = {
  pollingIntervalMs: parseInt(process.env.TRANSLATION_JOB_INTERVAL_MS || '30000', 10),
  maxConsecutiveErrors: 5,
  errorPauseDurationMs: 300000, // 5 minutes
  workerId: `processor-${process.pid}-${Date.now()}`,
  lockTimeoutMinutes: 5,
  enableLogging: process.env.NODE_ENV !== 'production',
};

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
   * Start the processor polling loop
   */
  start(): void {
    if (this.stats.isRunning) {
      console.warn('[JobProcessor] Already running');
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
    }
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
- Polls at configurable interval
- Processes one job at a time
- Tracks statistics
- Handles consecutive errors with pause/resume
- Supports start/stop lifecycle
- Thread-safe (prevents concurrent processing)

### Task 4.2.6: Implement Factory and Singleton Functions

**File:** `/src/lib/job-queue/job-processor.ts`

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
- Factory function creates new instances
- Singleton pattern for global processor
- Convenience functions for start/stop
- Reset function for testing

### Task 4.2.7: Update Barrel Exports

**File:** `/src/lib/job-queue/index.ts` (modify)

Add exports for the job processor:

```typescript
// Job processor
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

// Types
export type {
  JobProcessorConfig,
  JobProcessingResult,
  ProcessingRunResult,
  ProcessorStats,
  EntityContent,
} from './job-processor';
```

**Acceptance Criteria:**
- All public APIs exported
- Types exported separately
- Clean import path maintained

### Task 4.2.8: Add Environment Variable Support

**File:** `/.env.example` (modify)

Add documentation for job processor configuration:

```bash
# =============================================================================
# Translation Job Processor Configuration
# =============================================================================

# Polling interval in milliseconds (default: 30000 = 30 seconds)
TRANSLATION_JOB_INTERVAL_MS=30000

# Maximum consecutive errors before pausing (default: 5)
TRANSLATION_JOB_MAX_ERRORS=5

# Pause duration after max errors in milliseconds (default: 300000 = 5 minutes)
TRANSLATION_JOB_ERROR_PAUSE_MS=300000
```

**Acceptance Criteria:**
- All configurable options documented
- Default values specified
- Variable naming consistent with other translation env vars

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/job-processor.ts` | Main job processor implementation |

### Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/index.ts` | Add job processor exports |
| `/.env.example` | Add job processor configuration variables |

### Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `fetchEntityContent` | job-processor.ts | Fetch content from source tables |
| `saveTranslation` | job-processor.ts | Save to translation tables |
| `processJob` | job-processor.ts | Process single translation job |
| `getTranslationContext` | job-processor.ts | Get domain context for entity type |
| `getContentType` | job-processor.ts | Map entity/field to content type |
| `TranslationJobProcessor.start` | job-processor.ts | Start polling loop |
| `TranslationJobProcessor.stop` | job-processor.ts | Stop processor |
| `TranslationJobProcessor.processNextJob` | job-processor.ts | Manual job trigger |
| `TranslationJobProcessor.runProcessingCycle` | job-processor.ts | Full processing cycle |
| `TranslationJobProcessor.getStats` | job-processor.ts | Get statistics |
| `createJobProcessor` | job-processor.ts | Factory function |
| `getJobProcessor` | job-processor.ts | Singleton accessor |
| `resetJobProcessor` | job-processor.ts | Reset singleton |
| `startJobProcessor` | job-processor.ts | Convenience start |
| `stopJobProcessor` | job-processor.ts | Convenience stop |

### Files NOT to Modify

- `/src/lib/job-queue/translation-jobs.ts` - Already implemented (REQ-243)
- `/src/lib/job-queue/translation-jobs.types.ts` - Already implemented (REQ-243)
- `/src/lib/translation-service/*` - Already implemented (REQ-240)

---

## Dependencies

### Prerequisites (Must Be Completed First)

1. **REQ-243 (Task 4.1):** Job queue module
   - `fetchAndLockNextJob()` function
   - `markJobCompleted()` function
   - `markJobFailed()` function
   - `TranslationJob` type

2. **REQ-240 (Task 3.6):** Translation service wrapper
   - `translateText()` function
   - `TranslateOptions` type

3. **Task 1.1:** Database migration
   - `article_translations` table
   - `item_translations` table
   - `link_translations` table
   - `tag_translations` table
   - `source_language` column on source tables

### Downstream Dependencies (Tasks That Depend on This)

1. **Task 4.3:** API route for job processing (uses processor to trigger processing)
2. **Task 4.4:** Concurrency control (extends processor functionality)
3. **Task 4.5:** Job status API endpoint (may query processor stats)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Processing rate | One job per cycle | Prevents overwhelming translation APIs, matches requirements |
| Polling interval | Configurable, default 30s | Balance between responsiveness and resource usage |
| Error handling | Pause after consecutive failures | Prevents tight error loop, allows transient issues to resolve |
| Entity content fetching | Direct Supabase queries | Simple, efficient, follows existing patterns |
| Translation saving | Upsert with conflict handling | Idempotent updates, handles retries safely |
| Worker ID format | `processor-{pid}-{timestamp}` | Unique per process instance, aids debugging |

---

## Testing Considerations

### Unit Tests

Create `/src/lib/job-queue/__tests__/job-processor.test.ts`:

- `fetchEntityContent`: Test fetching each entity type
- `saveTranslation`: Test saving to each translation table
- `processJob`: Test success and failure paths
- `TranslationJobProcessor`: Test start/stop lifecycle
- Configuration: Test custom and default configs
- Stats tracking: Test counters and error handling
- Singleton: Test singleton pattern behavior

### Integration Tests

- Process real job from queue (with mock translation service)
- Verify translation table updates
- Verify job status updates
- Test concurrent processing prevention

### Edge Cases

- Entity not found (deleted after job created)
- Empty/null fields to translate
- Translation service unavailable
- Database write failure
- Job already processed (lock conflict)
- Processor stopped mid-processing

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API failures | Medium | Medium | Automatic retry in translation service; pause on consecutive failures |
| Database connection issues | Low | High | Graceful error handling; automatic retry on next cycle |
| Long-running translations | Low | Medium | Lock timeout handling; job re-queued if lock expires |
| Memory leaks | Low | Medium | Simple class structure; no accumulating state |
| Concurrent processors | Medium | Medium | Job locking prevents duplicate processing |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| 4.2.1: Type definitions | Small | High |
| 4.2.2: Content fetching | Small | High |
| 4.2.3: Translation saving | Small | High |
| 4.2.4: Job processing | Medium | Medium |
| 4.2.5: Processor class | Medium | Medium |
| 4.2.6: Factory functions | Small | High |
| 4.2.7: Barrel exports | Trivial | High |
| 4.2.8: Environment vars | Trivial | High |
| **Total** | **Medium** | High |

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

## Acceptance Criteria Verification

| Criteria (from REQ-244) | Implementation Verification |
|-------------------------|----------------------------|
| System checks for queued translation jobs at configurable time interval | `pollingIntervalMs` config; `TRANSLATION_JOB_INTERVAL_MS` env var |
| Only one translation job is processed at a time | `processNextJob()` fetches single job; `isProcessing` flag prevents overlap |
| Translated content appears in correct location for content type | `saveTranslation()` writes to entity-specific tables |
| Job status updates to 'completed' on success | `markJobCompleted(job.id)` called after save |
| Job status updates to 'failed' with diagnostic info | `markJobFailed(job.id, errorMessage)` on any error |
| Processing interval can be configured without code changes | Environment variable `TRANSLATION_JOB_INTERVAL_MS` |
| System continues processing subsequent jobs after failure | `runProcessingCycle()` catches errors, continues polling |

---

## References

- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (Phase 4, Task 4.2)
- Job Queue Module: REQ-243 (`/docs/REQ-243-create-translation-job-queue-module-overview.md`)
- Translation Service: REQ-240 (`/docs/REQ-240-create-main-translation-service-wrapper-overview.md`)
- Database Types: `/src/lib/supabase.ts`
- Server-side Supabase: `/src/lib/supabase-server.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.2*
