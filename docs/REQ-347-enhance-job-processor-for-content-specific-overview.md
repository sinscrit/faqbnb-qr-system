# REQ-347: Enhance Job Processor for Content-Specific Translation Handling - Implementation Overview

**Generated:** 2026-01-19 11:30:00 UTC
**Last Modified:** 2026-01-19 11:30:00 UTC
**Request Reference:** REQ-347 in `/docs/gen_requests_epic3.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.1

---

## Summary

Enhance the existing translation job processor (`/src/lib/job-queue/translation-jobs.ts`) to route different content types through specialized translation handlers based on entity type. This enhancement enables content-aware job processing where items, articles, links, and tags each follow dedicated processing paths that understand their unique field structures, validation requirements, and post-processing needs. The routing mechanism supports extensibility for future content types without modifying core infrastructure.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **ORM/Client** | @supabase/supabase-js, @supabase/ssr |
| **Job Queue** | Custom implementation in `/src/lib/job-queue/` |
| **Translation Service** | `/src/lib/translation-service/` with Claude/OpenAI providers |

### Existing Implementation (Epic 1)

The job processor module from Epic 1 already handles translation jobs with:
- `fetchEntityContent()` - Fetches content based on entity type using switch statement
- `saveTranslation()` - Saves translations to appropriate tables using switch statement
- `processJob()` - Core processing function that calls fetch, translate, and save
- `TranslationJobProcessor` class - Orchestrates polling and job execution

**Current Location:** `/src/lib/job-queue/job-processor.ts`

### What Needs Enhancement

The current implementation processes all entity types through a generic flow. This task introduces:
1. **A dedicated `processTranslationJob()` router function** that dispatches to entity-specific handlers
2. **Four specialized processor functions** (`processItemTranslation`, `processArticleTranslation`, `processLinkTranslation`, `processTagTranslation`)
3. **Entity-specific business logic** for field handling, validation, and context

### Dependencies (Must Be Complete Before This Task)

| Task | File | Purpose |
|------|------|---------|
| Epic 1 Job Queue Module (REQ-243) | `/src/lib/job-queue/translation-jobs.ts` | Job fetching, locking, status updates |
| Epic 1 Job Processor (REQ-244) | `/src/lib/job-queue/job-processor.ts` | Base job processor with `fetchEntityContent()`, `saveTranslation()` |
| Epic 1 Translation Service (REQ-240) | `/src/lib/translation-service/` | `translateText()` function |
| Epic 3 Content Translation Module | `/src/lib/content-translation/` | Entity triggers and storage utilities |

---

## Architecture

### Module Structure

```
/src/lib/job-queue/
├── index.ts                        # Barrel exports (update)
├── translation-jobs.ts             # Job queue functions (existing)
├── translation-jobs.types.ts       # Type definitions (existing)
├── job-processor.ts                # MODIFY: Add content-specific handlers
└── content-processors/             # NEW: Entity-specific processors
    ├── index.ts                    # Processor exports
    ├── item-processor.ts           # Item translation logic
    ├── article-processor.ts        # Article translation logic
    ├── link-processor.ts           # Link translation logic
    └── tag-processor.ts            # Tag translation logic
```

### Processing Flow

```
                    ┌──────────────────────────────────┐
                    │         Job Processor            │
                    │    (existing from Epic 1)        │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │    processTranslationJob()       │
                    │        NEW ROUTER                │
                    └──────────────┬───────────────────┘
                                   │
        ┌──────────────────┬───────┴───────┬──────────────────┐
        │                  │               │                  │
        ▼                  ▼               ▼                  ▼
┌───────────────┐  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ processItem   │  │ processArticle│ │ processLink   │ │ processTag    │
│ Translation   │  │ Translation   │ │ Translation   │ │ Translation   │
│               │  │               │ │               │ │               │
│ - name        │  │ - title       │ │ - title only  │ │ - tag_key     │
│ - description │  │ - description │ │ (no URL)      │ │ - system flag │
└───────────────┘  └───────────────┘ └───────────────┘ └───────────────┘
        │                  │               │                  │
        └──────────────────┴───────┬───────┴──────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │      Common Result Handling      │
                    │  - Mark completed/failed         │
                    │  - Update job status             │
                    │  - Return result                 │
                    └──────────────────────────────────┘
```

### Entity-Specific Processing Details

| Entity Type | Source Table | Translation Table | Fields to Translate | Special Handling |
|-------------|--------------|-------------------|---------------------|------------------|
| `item` | `items` | `item_translations` | `name`, `description` | None |
| `article` | `item_articles` | `article_translations` | `title`, `description` | HTML/Markdown preservation |
| `link` | `item_links` | `link_translations` | `title` only | URLs never translated |
| `tag` | `tag_translations` (en) | `tag_translations` | `translated_value` | Check system tag flag |

---

## Integration Contract

### Core Interface: Translation Job Router

```typescript
// /src/lib/job-queue/job-processor.ts

import type { TranslationJob, JobProcessingResult } from './translation-jobs.types';

/**
 * Route translation job to appropriate content-specific handler
 *
 * @param job - The translation job to process
 * @returns Processing result with success/failure status
 */
export async function processTranslationJob(
  job: TranslationJob
): Promise<JobProcessingResult> {
  switch (job.entityType) {
    case 'item':
      return processItemTranslation(job);
    case 'article':
      return processArticleTranslation(job);
    case 'link':
      return processLinkTranslation(job);
    case 'tag':
      return processTagTranslation(job);
    default:
      // Log error and mark job as failed for unrecognized entity types
      console.error(`[JobProcessor] Unknown entity type: ${job.entityType}`);
      return {
        jobId: job.id,
        success: false,
        entityType: job.entityType,
        entityId: job.entityId,
        targetLanguage: job.targetLanguage,
        errorMessage: `Unrecognized entity type: ${job.entityType}`,
        processingTimeMs: 0,
      };
  }
}
```

### Entity Processor Interface

```typescript
// /src/lib/job-queue/content-processors/types.ts

import type { TranslationJob, SupportedLanguage, EntityType } from '../translation-jobs.types';

/**
 * Configuration for entity-specific translation processing
 */
export interface EntityProcessorConfig {
  /** Fields to translate for this entity type */
  translatableFields: string[];
  /** Translation context for quality optimization */
  translationContext: {
    contentType: string;
    domainContext: string;
  };
  /** Maximum field lengths (optional validation) */
  maxFieldLengths?: Record<string, number>;
  /** Whether to preserve HTML/Markdown formatting */
  preserveFormatting?: boolean;
}

/**
 * Content fetched from source table
 */
export interface FetchedContent {
  entityId: string;
  sourceLanguage: SupportedLanguage;
  fields: Record<string, string | null>;
}

/**
 * Result from an entity-specific processor
 */
export interface ProcessorResult {
  success: boolean;
  translatedFields?: Record<string, string>;
  errorMessage?: string;
}

/**
 * Entity processor function signature
 */
export type EntityProcessor = (
  job: TranslationJob
) => Promise<JobProcessingResult>;
```

### Item Processor Interface

```typescript
// /src/lib/job-queue/content-processors/item-processor.ts

import type { TranslationJob, JobProcessingResult } from '../translation-jobs.types';

/**
 * Process item translation job
 *
 * Handles translation of item `name` and `description` fields.
 * Uses item_name and item_description content types for optimal translation context.
 *
 * @param job - Translation job with entityType 'item'
 * @returns Processing result
 */
export async function processItemTranslation(
  job: TranslationJob
): Promise<JobProcessingResult>;
```

### Article Processor Interface

```typescript
// /src/lib/job-queue/content-processors/article-processor.ts

import type { TranslationJob, JobProcessingResult } from '../translation-jobs.types';

/**
 * Process article translation job
 *
 * Handles translation of article `title` and `description` fields.
 * May contain Markdown formatting that should be preserved.
 *
 * @param job - Translation job with entityType 'article'
 * @returns Processing result
 */
export async function processArticleTranslation(
  job: TranslationJob
): Promise<JobProcessingResult>;
```

### Link Processor Interface

```typescript
// /src/lib/job-queue/content-processors/link-processor.ts

import type { TranslationJob, JobProcessingResult } from '../translation-jobs.types';

/**
 * Process link translation job
 *
 * Handles translation of link `title` field only.
 * URLs are never translated.
 *
 * @param job - Translation job with entityType 'link'
 * @returns Processing result
 */
export async function processLinkTranslation(
  job: TranslationJob
): Promise<JobProcessingResult>;
```

### Tag Processor Interface

```typescript
// /src/lib/job-queue/content-processors/tag-processor.ts

import type { TranslationJob, JobProcessingResult } from '../translation-jobs.types';

/**
 * Process tag translation job
 *
 * Handles translation of tag `translated_value`.
 * Checks is_system_tag flag - system tags should already be seeded.
 * Tags are short category labels - single word or short phrase.
 *
 * @param job - Translation job with entityType 'tag'
 * @returns Processing result
 */
export async function processTagTranslation(
  job: TranslationJob
): Promise<JobProcessingResult>;
```

---

## Implementation Tasks

### Task 3.1.1: Create Content Processors Directory Structure

**Files to Create:**
- `/src/lib/job-queue/content-processors/index.ts`
- `/src/lib/job-queue/content-processors/types.ts`

Create the directory structure and type definitions for entity-specific processors.

**Implementation:**

```typescript
// /src/lib/job-queue/content-processors/types.ts

import type { TranslationJob, SupportedLanguage } from '../translation-jobs.types';
import type { JobProcessingResult } from '../job-processor';

export interface EntityProcessorConfig {
  translatableFields: string[];
  translationContext: {
    contentType: string;
    domainContext: string;
  };
  maxFieldLengths?: Record<string, number>;
  preserveFormatting?: boolean;
}

export interface FetchedContent {
  entityId: string;
  sourceLanguage: SupportedLanguage;
  fields: Record<string, string | null>;
}

export type EntityProcessor = (job: TranslationJob) => Promise<JobProcessingResult>;
```

**Acceptance Criteria:**
- Directory structure created
- Type definitions match existing patterns
- Types exported from index.ts

### Task 3.1.2: Implement Item Translation Processor

**File:** `/src/lib/job-queue/content-processors/item-processor.ts`

Implement specialized handler for item translations.

**Implementation:**

```typescript
/**
 * Item Translation Processor
 * Part of REQ-347: Content-Specific Translation Handling
 */

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '../translation-jobs';
import type { TranslationJob, SupportedLanguage } from '../translation-jobs.types';
import type { JobProcessingResult } from '../job-processor';

const ITEM_TRANSLATION_CONTEXT = {
  name: {
    contentType: 'item_name' as const,
    domainContext: 'Household item or appliance name in vacation rental property. Keep concise and natural.',
  },
  description: {
    contentType: 'item_description' as const,
    domainContext: 'Description of household item for vacation rental guests. Maintain helpful, friendly tone.',
  },
};

/**
 * Fetch item content from source table
 */
async function fetchItemContent(entityId: string): Promise<{
  sourceLanguage: SupportedLanguage;
  name: string;
  description: string | null;
} | null> {
  const { data, error } = await supabaseAdmin
    .from('items')
    .select('name, description, source_language')
    .eq('id', entityId)
    .single();

  if (error || !data) {
    console.error('[ItemProcessor] Failed to fetch item:', error);
    return null;
  }

  return {
    sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
    name: data.name,
    description: data.description,
  };
}

/**
 * Save item translation to translation table
 */
async function saveItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  translatedFields: { name: string; description?: string | null }
): Promise<boolean> {
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('item_translations')
    .upsert(
      {
        item_id: itemId,
        language,
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
    console.error('[ItemProcessor] Failed to save translation:', error);
    return false;
  }

  return true;
}

/**
 * Process item translation job
 */
export async function processItemTranslation(
  job: TranslationJob
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch item content
    const content = await fetchItemContent(entityId);
    if (!content) {
      throw new Error(`Item not found: ${entityId}`);
    }

    // 2. Translate fields
    const translatedFields: { name: string; description?: string | null } = {
      name: '',
    };

    // Translate name (required)
    const nameResult = await translateText(
      content.name,
      content.sourceLanguage,
      targetLanguage,
      {
        context: ITEM_TRANSLATION_CONTEXT.name,
      }
    );
    translatedFields.name = nameResult.translatedText;

    // Translate description (optional)
    if (content.description && content.description.trim() !== '') {
      const descResult = await translateText(
        content.description,
        content.sourceLanguage,
        targetLanguage,
        {
          context: ITEM_TRANSLATION_CONTEXT.description,
        }
      );
      translatedFields.description = descResult.translatedText;
    }

    // 3. Save translation
    const saved = await saveItemTranslation(entityId, targetLanguage, translatedFields);
    if (!saved) {
      throw new Error('Failed to save item translation');
    }

    // 4. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[ItemProcessor] Job ${job.id} completed: ${entityId} -> ${targetLanguage}`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'item',
      entityId,
      targetLanguage,
      translatedFields: {
        name: translatedFields.name,
        ...(translatedFields.description && { description: translatedFields.description }),
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await markJobFailed(job.id, errorMessage);

    console.error(`[ItemProcessor] Job ${job.id} failed:`, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'item',
      entityId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- Fetches item from `items` table
- Translates `name` and `description` fields with appropriate context
- Stores in `item_translations` table with UPSERT
- Marks job completed on success, failed on error
- Returns detailed `JobProcessingResult`

### Task 3.1.3: Implement Article Translation Processor

**File:** `/src/lib/job-queue/content-processors/article-processor.ts`

Implement specialized handler for article translations with Markdown preservation.

**Acceptance Criteria:**
- Fetches article from `item_articles` table
- Translates `title` and `description` fields
- Preserves Markdown/HTML formatting in description
- Stores in `article_translations` table
- Marks job completed/failed appropriately

### Task 3.1.4: Implement Link Translation Processor

**File:** `/src/lib/job-queue/content-processors/link-processor.ts`

Implement specialized handler for link translations (title only).

**Acceptance Criteria:**
- Fetches link from `item_links` table
- Translates only `title` field (URLs are not translated)
- Stores in `link_translations` table
- Marks job completed/failed appropriately

### Task 3.1.5: Implement Tag Translation Processor

**File:** `/src/lib/job-queue/content-processors/tag-processor.ts`

Implement specialized handler for tag translations with system tag awareness.

**Acceptance Criteria:**
- Fetches tag from `tag_translations` (English source)
- Checks `is_system_tag` flag (system tags should be pre-seeded)
- Translates `translated_value` field
- Stores in `tag_translations` table with `is_system_tag: false`
- Marks job completed/failed appropriately

### Task 3.1.6: Create Router Function in Job Processor

**File:** `/src/lib/job-queue/job-processor.ts` (modify)

Add the `processTranslationJob()` router function and integrate with existing `processJob()`.

**Implementation:**

```typescript
// Add imports at top of file
import {
  processItemTranslation,
  processArticleTranslation,
  processLinkTranslation,
  processTagTranslation,
} from './content-processors';

/**
 * Route translation job to content-specific handler
 *
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * @param job - The translation job to process
 * @returns Processing result
 */
export async function processTranslationJob(
  job: TranslationJob
): Promise<JobProcessingResult> {
  switch (job.entityType) {
    case 'item':
      return processItemTranslation(job);
    case 'article':
      return processArticleTranslation(job);
    case 'link':
      return processLinkTranslation(job);
    case 'tag':
      return processTagTranslation(job);
    default:
      console.error(`[JobProcessor] Unknown entity type: ${job.entityType}`);
      return {
        jobId: job.id,
        success: false,
        entityType: job.entityType,
        entityId: job.entityId,
        targetLanguage: job.targetLanguage,
        errorMessage: `Unrecognized entity type: ${job.entityType}`,
        processingTimeMs: 0,
      };
  }
}
```

**Acceptance Criteria:**
- Router function correctly dispatches to entity-specific handlers
- Handles unknown entity types gracefully (logs error, marks job failed)
- Existing `processJob()` function refactored to use new router
- All existing tests continue to pass

### Task 3.1.7: Update Barrel Exports

**File:** `/src/lib/job-queue/index.ts` (modify)

Add exports for new content processors.

**Implementation:**

```typescript
// Content processors (REQ-347)
export {
  processTranslationJob,
  processItemTranslation,
  processArticleTranslation,
  processLinkTranslation,
  processTagTranslation,
} from './content-processors';

export type {
  EntityProcessorConfig,
  FetchedContent,
  EntityProcessor,
} from './content-processors/types';
```

**Acceptance Criteria:**
- All processor functions exported
- Type definitions exported
- Clean import path maintained

### Task 3.1.8: Update Existing processJob Function

**File:** `/src/lib/job-queue/job-processor.ts` (modify)

Refactor the existing `processJob()` function to use the new router.

**Implementation:**

Replace the existing switch statement in `processJob()` with a call to `processTranslationJob()`:

```typescript
async function processJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  const startTime = Date.now();

  // Start heartbeat to prevent lock timeout during processing
  const stopHeartbeat = createLockHeartbeat(
    job.id,
    config.workerId,
    config.heartbeatIntervalMs || DEFAULT_HEARTBEAT_INTERVAL_MS
  );

  try {
    // Delegate to content-specific processor
    const result = await processTranslationJob(job);

    if (config.enableLogging) {
      const status = result.success ? 'completed' : 'failed';
      console.log(`[JobProcessor] Job ${job.id} ${status}`);
    }

    return result;

  } finally {
    stopHeartbeat();
  }
}
```

**Acceptance Criteria:**
- `processJob()` delegates to `processTranslationJob()`
- Heartbeat functionality preserved
- Logging behavior preserved
- Backward compatible with existing callers

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/content-processors/index.ts` | Barrel exports for processors |
| `/src/lib/job-queue/content-processors/types.ts` | Type definitions for processors |
| `/src/lib/job-queue/content-processors/item-processor.ts` | Item translation handler |
| `/src/lib/job-queue/content-processors/article-processor.ts` | Article translation handler |
| `/src/lib/job-queue/content-processors/link-processor.ts` | Link translation handler |
| `/src/lib/job-queue/content-processors/tag-processor.ts` | Tag translation handler |

### Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/job-processor.ts` | Add `processTranslationJob()` router, refactor `processJob()` |
| `/src/lib/job-queue/index.ts` | Add content processor exports |

### Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `processTranslationJob` | job-processor.ts | Route jobs to entity-specific handlers |
| `processItemTranslation` | item-processor.ts | Handle item translations |
| `processArticleTranslation` | article-processor.ts | Handle article translations |
| `processLinkTranslation` | link-processor.ts | Handle link translations |
| `processTagTranslation` | tag-processor.ts | Handle tag translations |

### Functions to Modify

| Function | File | Modification |
|----------|------|--------------|
| `processJob` | job-processor.ts | Delegate to `processTranslationJob()` |

### Files NOT to Modify

- `/src/lib/job-queue/translation-jobs.ts` - Job queue functions remain unchanged
- `/src/lib/job-queue/translation-jobs.types.ts` - Types already support entity routing
- `/src/lib/job-queue/concurrency-control.ts` - Concurrency control unchanged
- `/src/lib/translation-service/*` - Translation service unchanged

---

## Dependencies

### Prerequisites (Must Be Completed First)

1. **Epic 1 Job Queue Module (REQ-243):**
   - `fetchAndLockNextJob()` function
   - `markJobCompleted()` function
   - `markJobFailed()` function
   - `TranslationJob` type with `entityType` field

2. **Epic 1 Job Processor (REQ-244):**
   - `fetchEntityContent()` function (can be refactored or replaced)
   - `saveTranslation()` function (can be refactored or replaced)
   - `TranslationJobProcessor` class
   - `JobProcessingResult` type

3. **Epic 1 Translation Service (REQ-240):**
   - `translateText()` function
   - Content type support in translation context

4. **Database Tables (Epic 1):**
   - `items`, `item_articles`, `item_links` source tables
   - `item_translations`, `article_translations`, `link_translations`, `tag_translations` translation tables
   - `source_language` column on source tables

### Downstream Dependencies (Tasks That Depend on This)

1. **Task 3.2:** Implement item translation processor (extends this)
2. **Task 3.3:** Implement article translation processor (extends this)
3. **Task 3.4:** Implement link translation processor (extends this)
4. **Task 3.5:** Implement tag translation processor (extends this)
5. **Phase 4:** Translation Status & Management APIs (uses processor results)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Processor organization | Separate files per entity | Clear separation of concerns, easier testing, independent evolution |
| Router pattern | Switch statement | Simple, explicit, type-safe with exhaustive checking |
| Error handling | Per-processor with shared result type | Consistent error reporting, entity-specific error messages |
| Context configuration | Per-processor constants | Optimized translation quality per content type |
| Backward compatibility | Refactor existing code | Existing tests and callers continue to work |

---

## Testing Considerations

### Unit Tests

Create `/src/lib/job-queue/content-processors/__tests__/` directory:

- `processTranslationJob.test.ts` - Router dispatches correctly
- `item-processor.test.ts` - Item processing logic
- `article-processor.test.ts` - Article processing with formatting
- `link-processor.test.ts` - Link processing (title only)
- `tag-processor.test.ts` - Tag processing with system tag check

### Test Cases

| Test | Description |
|------|-------------|
| Routes item job correctly | `processTranslationJob` calls `processItemTranslation` for item jobs |
| Routes article job correctly | `processTranslationJob` calls `processArticleTranslation` for article jobs |
| Routes link job correctly | `processTranslationJob` calls `processLinkTranslation` for link jobs |
| Routes tag job correctly | `processTranslationJob` calls `processTagTranslation` for tag jobs |
| Handles unknown entity type | Returns failed result with error message |
| Item processor fetches content | Correctly queries `items` table |
| Item processor translates fields | Calls translation service with proper context |
| Item processor saves translation | UPSERT to `item_translations` |
| Existing tests pass | No regressions in job-processor tests |

### Integration Tests

- End-to-end: Create job -> Process -> Verify translation saved
- Multi-entity: Process jobs for all 4 entity types
- Error recovery: Entity not found, translation service failure

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing behavior | Medium | High | Comprehensive test coverage before refactoring |
| Inconsistent error handling | Low | Medium | Shared result type, consistent logging |
| Context configuration drift | Low | Low | Centralized constants per processor |
| Performance regression | Low | Medium | Benchmark before/after, profile if needed |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| 3.1.1: Directory structure and types | Small | High |
| 3.1.2: Item processor | Small | High |
| 3.1.3: Article processor | Small | High |
| 3.1.4: Link processor | Small | High |
| 3.1.5: Tag processor | Small | Medium |
| 3.1.6: Router function | Small | High |
| 3.1.7: Barrel exports | Trivial | High |
| 3.1.8: Refactor processJob | Small | Medium |
| **Total** | **Medium** | High |

---

## Usage Examples

### Processing Jobs (No Change for Callers)

```typescript
import { getJobProcessor } from '@/lib/job-queue';

// Existing code continues to work unchanged
const result = await getJobProcessor().processNextJob();

if (result) {
  console.log(`Processed ${result.entityType}: ${result.success ? 'success' : 'failed'}`);
}
```

### Direct Processor Access (New)

```typescript
import { processTranslationJob } from '@/lib/job-queue';

// Direct routing (useful for testing or custom workflows)
const result = await processTranslationJob(job);
```

### Entity-Specific Processing (New)

```typescript
import { processItemTranslation } from '@/lib/job-queue';

// Process single item job directly
const result = await processItemTranslation(itemJob);
```

---

## Acceptance Criteria Verification

| Criteria (from REQ-347) | Implementation Verification |
|-------------------------|----------------------------|
| processTranslationJob function accepts TranslationJob with entityType field | Router function signature accepts `TranslationJob` |
| Switch statement dispatches based on entityType | `switch (job.entityType)` in router |
| processItemTranslation handler exists for entityType 'item' | Implemented in `item-processor.ts` |
| processArticleTranslation handler exists for entityType 'article' | Implemented in `article-processor.ts` |
| processLinkTranslation handler exists for entityType 'link' | Implemented in `link-processor.ts` |
| processTagTranslation handler exists for entityType 'tag' | Implemented in `tag-processor.ts` |
| Each handler retrieves content from appropriate table | Direct Supabase queries per processor |
| Each handler invokes translation service with appropriate params | Content-type specific context |
| Each handler stores results in corresponding translation table | UPSERT to entity-specific table |
| Unrecognized entityType logs error and marks job failed | Default case in switch handles this |
| Existing tests remain passing | Refactor preserves backward compatibility |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.1)
- Epic 1 Job Processor: REQ-244 (`/docs/REQ-244-implement-job-processor-overview.md`)
- Job Queue Module: REQ-243 (`/docs/REQ-243-create-translation-job-queue-module-overview.md`)
- Translation Service: REQ-240 (`/docs/REQ-240-create-main-translation-service-wrapper-overview.md`)
- Existing Job Processor: `/src/lib/job-queue/job-processor.ts`
- Existing Types: `/src/lib/job-queue/translation-jobs.types.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 3, Task 3.1*
