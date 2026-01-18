# REQ-257: Implement Translation Status Utilities - Implementation Overview

**Generated:** 2026-01-18 01:07:09 UTC
**Last Modified:** 2026-01-18 01:07:09 UTC
**Request Reference:** REQ-257 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.6

---

## Summary

Implement translation status utilities that provide comprehensive visibility into the translation state of content entities (items, articles, links, tags). The utilities aggregate data from both the translation jobs queue and stored translations to deliver a unified view of translation availability, pending jobs, and completion status per language. This module is essential for displaying translation progress to owners and for internal system monitoring.

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
| Job Queue Types | `/src/lib/job-queue/translation-jobs.types.ts` | EntityType, JobStatus types |
| Job Queue Functions | `/src/lib/job-queue/translation-jobs.ts` | getJobsByEntity() |
| Translation Service Types | `/src/lib/translation-service/translation-service.types.ts` | SupportedLanguage, TranslationStatus |
| Database Types | `/src/lib/supabase.ts` | TypeScript database type definitions |
| Server-side Supabase | `/src/lib/supabase-server.ts` | `createSupabaseServer()` for server components |

### Dependencies (From Epic 1 - Must Be Complete)

| Dependency | Location | Purpose |
|------------|----------|---------|
| Translation tables | Database | article_translations, item_translations, link_translations, tag_translations |
| translation_jobs table | Database | Job queue tracking |
| Job Queue Module | `/src/lib/job-queue/` | `getJobsByEntity()` function |
| Translation Service Types | `/src/lib/translation-service/` | `SupportedLanguage` type |

---

## Architecture

### Module Structure

```
/src/lib/content-translation/
├── index.ts                           # Barrel exports (update)
├── content-translation.ts             # Content translation orchestrator
├── content-translation.types.ts       # Type definitions (update)
├── triggers/
│   ├── item-trigger.ts
│   ├── article-trigger.ts
│   ├── link-trigger.ts
│   └── tag-trigger.ts
└── storage/
    ├── translation-storage.ts         # Storage utilities (from Task 1.5)
    └── translation-status.ts          # NEW: Status utilities (this task)
```

### Core Interfaces

```typescript
// /src/lib/content-translation/storage/translation-status.ts

import { SupportedLanguage } from '@/lib/translation-service';
import { EntityType, JobStatus } from '@/lib/job-queue';

/**
 * Supported languages excluding source language for translation targets
 */
export const TARGET_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/**
 * Status of a single language translation
 */
export interface LanguageTranslationStatus {
  /** Current status of this translation */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual' | 'not_started';
  /** When the translation was completed */
  translatedAt?: string;
  /** User who manually reviewed/edited (if manual) */
  reviewedBy?: string;
  /** Error message if failed */
  error?: string;
  /** Job ID if pending/processing */
  jobId?: string;
  /** Number of retry attempts */
  attempts?: number;
}

/**
 * Comprehensive translation status for an entity
 */
export interface TranslationStatusResult {
  /** Entity identifier */
  entityId: string;
  /** Type of entity */
  entityType: EntityType;
  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;
  /** Overall status across all languages */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed' | 'not_started';
  /** Per-language translation status */
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
  /** Summary counts for quick display */
  summary: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
    failed: number;
    manual: number;
    notStarted: number;
  };
  /** Languages that are fully translated */
  completedLanguages: SupportedLanguage[];
  /** Languages with pending jobs */
  pendingLanguages: SupportedLanguage[];
  /** Languages with failed translations */
  failedLanguages: SupportedLanguage[];
  /** When the most recent translation was completed */
  lastUpdatedAt?: string;
}

/**
 * Input for batch status queries
 */
export interface EntityReference {
  type: EntityType;
  id: string;
}
```

### Module Functions

```typescript
/**
 * Get comprehensive translation status for a single entity
 *
 * Aggregates data from:
 * 1. Stored translations (article_translations, item_translations, etc.)
 * 2. Pending/in-progress translation jobs
 *
 * @param entityType - Type of entity ('item' | 'article' | 'link' | 'tag')
 * @param entityId - UUID of the entity
 * @returns Comprehensive translation status result
 */
export async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<TranslationStatusResult>;

/**
 * Get translation status for multiple entities in a single query
 *
 * Optimized for list views that need to display translation status
 * for many items at once.
 *
 * @param entities - Array of entity references
 * @returns Array of translation status results (same order as input)
 */
export async function getBatchTranslationStatus(
  entities: EntityReference[]
): Promise<TranslationStatusResult[]>;
```

---

## Integration Contract

### Usage Examples

```typescript
// Single entity status check
import { getEntityTranslationStatus } from '@/lib/content-translation';

const status = await getEntityTranslationStatus('item', 'uuid-of-item');

console.log(`Overall: ${status.overallStatus}`);
console.log(`Completed: ${status.summary.completed}/${status.summary.total}`);
console.log(`Pending languages: ${status.pendingLanguages.join(', ')}`);

// Check specific language
if (status.translations.fr.status === 'completed') {
  console.log(`French translated at: ${status.translations.fr.translatedAt}`);
}
```

```typescript
// Batch status for list view
import { getBatchTranslationStatus } from '@/lib/content-translation';

const items = [
  { type: 'item' as const, id: 'item-1' },
  { type: 'item' as const, id: 'item-2' },
  { type: 'article' as const, id: 'article-1' },
];

const statuses = await getBatchTranslationStatus(items);

statuses.forEach((status, index) => {
  console.log(`${items[index].type} ${items[index].id}: ${status.overallStatus}`);
});
```

```typescript
// API endpoint integration
// GET /api/translations/status/[entityType]/[entityId]/route.ts

import { getEntityTranslationStatus } from '@/lib/content-translation';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { entityType: string; entityId: string } }
) {
  const status = await getEntityTranslationStatus(
    params.entityType as EntityType,
    params.entityId
  );

  return NextResponse.json({
    success: true,
    data: status,
  });
}
```

---

## Implementation Tasks

### Task 1.6.1: Create Type Definitions

**File:** `/src/lib/content-translation/storage/translation-status.ts`

Define all TypeScript interfaces:

- `LanguageTranslationStatus` - Per-language status
- `TranslationStatusResult` - Full entity status
- `EntityReference` - Batch query input
- `TARGET_LANGUAGES` constant array

**Acceptance Criteria:**
- All types defined with proper constraints
- Types align with existing job queue and translation types
- JSDoc comments for all interfaces

### Task 1.6.2: Implement Source Language Detection

**File:** `/src/lib/content-translation/storage/translation-status.ts`

Create helper to fetch source language for an entity:

```typescript
/**
 * Get the source language for an entity from its source table
 */
async function getEntitySourceLanguage(
  entityType: EntityType,
  entityId: string
): Promise<SupportedLanguage> {
  const supabase = createSupabaseServer();

  switch (entityType) {
    case 'item': {
      const { data } = await supabase
        .from('items')
        .select('source_language')
        .eq('id', entityId)
        .single();
      return (data?.source_language as SupportedLanguage) || 'en';
    }
    case 'article': {
      const { data } = await supabase
        .from('item_articles')
        .select('source_language')
        .eq('id', entityId)
        .single();
      return (data?.source_language as SupportedLanguage) || 'en';
    }
    case 'link': {
      const { data } = await supabase
        .from('item_links')
        .select('source_language')
        .eq('id', entityId)
        .single();
      return (data?.source_language as SupportedLanguage) || 'en';
    }
    case 'tag':
      // Tags always use 'en' as source
      return 'en';
    default:
      return 'en';
  }
}
```

**Acceptance Criteria:**
- Returns correct source language for each entity type
- Defaults to 'en' if source_language is null
- Handles missing entities gracefully

### Task 1.6.3: Implement Stored Translation Fetching

**File:** `/src/lib/content-translation/storage/translation-status.ts`

Create helper to fetch existing translations from storage tables:

```typescript
/**
 * Fetch stored translations for an entity
 * Returns a map of language -> translation status
 */
async function getStoredTranslations(
  entityType: EntityType,
  entityId: string
): Promise<Map<SupportedLanguage, {
  status: 'completed' | 'manual';
  translatedAt?: string;
  reviewedBy?: string;
}>> {
  const supabase = createSupabaseServer();
  const results = new Map();

  const tableMap = {
    item: { table: 'item_translations', idColumn: 'item_id' },
    article: { table: 'article_translations', idColumn: 'article_id' },
    link: { table: 'link_translations', idColumn: 'link_id' },
    tag: { table: 'tag_translations', idColumn: 'tag_key' },
  };

  const config = tableMap[entityType];
  if (!config) return results;

  const { data, error } = await supabase
    .from(config.table)
    .select('language, translation_status, translated_at, reviewed_by')
    .eq(config.idColumn, entityId);

  if (error || !data) return results;

  for (const row of data) {
    results.set(row.language as SupportedLanguage, {
      status: row.translation_status === 'manual' ? 'manual' : 'completed',
      translatedAt: row.translated_at,
      reviewedBy: row.reviewed_by,
    });
  }

  return results;
}
```

**Acceptance Criteria:**
- Fetches from correct table based on entity type
- Returns properly typed map of language to status
- Handles database errors gracefully

### Task 1.6.4: Implement Job Status Fetching

**File:** `/src/lib/content-translation/storage/translation-status.ts`

Create helper to fetch pending/processing jobs:

```typescript
/**
 * Fetch active translation jobs for an entity
 * Returns a map of language -> job status
 */
async function getActiveJobs(
  entityType: EntityType,
  entityId: string
): Promise<Map<SupportedLanguage, {
  status: 'pending' | 'processing' | 'failed';
  jobId: string;
  error?: string;
  attempts: number;
}>> {
  const supabase = createSupabaseServer();
  const results = new Map();

  const { data, error } = await supabase
    .from('translation_jobs')
    .select('id, target_language, status, error_message, attempts')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .in('status', ['queued', 'processing', 'failed']);

  if (error || !data) return results;

  for (const job of data) {
    const jobStatus = job.status === 'queued' ? 'pending' : job.status;
    results.set(job.target_language as SupportedLanguage, {
      status: jobStatus as 'pending' | 'processing' | 'failed',
      jobId: job.id,
      error: job.error_message || undefined,
      attempts: job.attempts,
    });
  }

  return results;
}
```

**Acceptance Criteria:**
- Fetches jobs with status queued, processing, or failed
- Maps 'queued' status to 'pending' for UI consistency
- Includes error message and attempt count

### Task 1.6.5: Implement getEntityTranslationStatus Function

**File:** `/src/lib/content-translation/storage/translation-status.ts`

Implement the main status aggregation function:

```typescript
export async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<TranslationStatusResult> {
  // 1. Get source language
  const sourceLanguage = await getEntitySourceLanguage(entityType, entityId);

  // 2. Determine target languages (all except source)
  const targetLanguages = TARGET_LANGUAGES.filter(lang => lang !== sourceLanguage);

  // 3. Fetch stored translations and active jobs in parallel
  const [storedTranslations, activeJobs] = await Promise.all([
    getStoredTranslations(entityType, entityId),
    getActiveJobs(entityType, entityId),
  ]);

  // 4. Build per-language status
  const translations: Record<SupportedLanguage, LanguageTranslationStatus> = {} as any;
  const completedLanguages: SupportedLanguage[] = [];
  const pendingLanguages: SupportedLanguage[] = [];
  const failedLanguages: SupportedLanguage[] = [];
  let lastUpdatedAt: string | undefined;

  const summary = {
    total: targetLanguages.length,
    completed: 0,
    pending: 0,
    processing: 0,
    failed: 0,
    manual: 0,
    notStarted: 0,
  };

  for (const lang of TARGET_LANGUAGES) {
    if (lang === sourceLanguage) {
      // Source language doesn't need translation
      translations[lang] = { status: 'completed', translatedAt: undefined };
      continue;
    }

    const stored = storedTranslations.get(lang);
    const job = activeJobs.get(lang);

    if (stored) {
      // Has completed or manual translation
      translations[lang] = {
        status: stored.status,
        translatedAt: stored.translatedAt,
        reviewedBy: stored.reviewedBy,
      };
      completedLanguages.push(lang);
      if (stored.status === 'manual') {
        summary.manual++;
      } else {
        summary.completed++;
      }
      if (stored.translatedAt && (!lastUpdatedAt || stored.translatedAt > lastUpdatedAt)) {
        lastUpdatedAt = stored.translatedAt;
      }
    } else if (job) {
      // Has active job
      translations[lang] = {
        status: job.status,
        jobId: job.jobId,
        error: job.error,
        attempts: job.attempts,
      };
      if (job.status === 'failed') {
        failedLanguages.push(lang);
        summary.failed++;
      } else if (job.status === 'processing') {
        pendingLanguages.push(lang);
        summary.processing++;
      } else {
        pendingLanguages.push(lang);
        summary.pending++;
      }
    } else {
      // No translation and no job - not started
      translations[lang] = { status: 'not_started' };
      summary.notStarted++;
    }
  }

  // 5. Determine overall status
  let overallStatus: 'complete' | 'partial' | 'pending' | 'failed' | 'not_started';
  if (summary.completed + summary.manual === summary.total) {
    overallStatus = 'complete';
  } else if (summary.failed > 0 && summary.pending === 0 && summary.processing === 0) {
    overallStatus = 'failed';
  } else if (summary.pending > 0 || summary.processing > 0) {
    overallStatus = 'pending';
  } else if (summary.completed > 0 || summary.manual > 0) {
    overallStatus = 'partial';
  } else {
    overallStatus = 'not_started';
  }

  return {
    entityId,
    entityType,
    sourceLanguage,
    overallStatus,
    translations,
    summary,
    completedLanguages,
    pendingLanguages,
    failedLanguages,
    lastUpdatedAt,
  };
}
```

**Acceptance Criteria:**
- Correctly aggregates stored translations and job status
- Computes overall status based on language statuses
- Handles source language (excluded from targets)
- Returns comprehensive summary counts
- Tracks last updated timestamp

### Task 1.6.6: Implement getBatchTranslationStatus Function

**File:** `/src/lib/content-translation/storage/translation-status.ts`

Implement batch status retrieval for list views:

```typescript
export async function getBatchTranslationStatus(
  entities: EntityReference[]
): Promise<TranslationStatusResult[]> {
  if (entities.length === 0) {
    return [];
  }

  // For smaller batches, process sequentially to avoid overwhelming DB
  if (entities.length <= 5) {
    return Promise.all(
      entities.map(entity =>
        getEntityTranslationStatus(entity.type, entity.id)
      )
    );
  }

  // For larger batches, process in chunks of 5
  const results: TranslationStatusResult[] = [];
  const chunkSize = 5;

  for (let i = 0; i < entities.length; i += chunkSize) {
    const chunk = entities.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(entity =>
        getEntityTranslationStatus(entity.type, entity.id)
      )
    );
    results.push(...chunkResults);
  }

  return results;
}
```

**Note:** This is a simple implementation. For high-performance scenarios with very large lists (50+ items), consider implementing a single optimized query that fetches all data at once and processes it in memory.

**Acceptance Criteria:**
- Returns results in same order as input entities
- Handles empty input gracefully
- Uses chunked parallel processing for efficiency
- Maintains consistent result structure

### Task 1.6.7: Update Barrel Exports

**File:** `/src/lib/content-translation/index.ts` (modify)

Add exports for the translation status utilities:

```typescript
// Translation status utilities
export {
  getEntityTranslationStatus,
  getBatchTranslationStatus,
  TARGET_LANGUAGES,
} from './storage/translation-status';

// Types
export type {
  TranslationStatusResult,
  LanguageTranslationStatus,
  EntityReference,
} from './storage/translation-status';
```

**Acceptance Criteria:**
- All public APIs exported
- Types exported separately
- Clean import path: `import { ... } from '@/lib/content-translation'`

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/storage/translation-status.ts` | Translation status utilities implementation |

### Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/content-translation/index.ts` | Add translation status exports |
| `/src/lib/content-translation/content-translation.types.ts` | Add/verify status-related types |

### Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `getEntityTranslationStatus` | translation-status.ts | Get status for single entity |
| `getBatchTranslationStatus` | translation-status.ts | Get status for multiple entities |
| `getEntitySourceLanguage` | translation-status.ts | Helper: fetch source language |
| `getStoredTranslations` | translation-status.ts | Helper: fetch completed translations |
| `getActiveJobs` | translation-status.ts | Helper: fetch pending/failed jobs |

---

## Dependencies

### Prerequisites (Must Be Completed First)

1. **Task 1.1 (Epic 3):** Content translation module structure
   - Module directory structure exists
   - Type definitions file exists

2. **Task 1.5 (Epic 3):** Translation storage utilities
   - `/src/lib/content-translation/storage/translation-storage.ts` exists

3. **Epic 1 Complete:**
   - Translation tables exist (article_translations, item_translations, link_translations, tag_translations)
   - translation_jobs table exists
   - Job queue module exists (`/src/lib/job-queue/`)

### Downstream Dependencies (Tasks That Depend on This)

1. **Phase 4 (Epic 3):** Translation Status & Management APIs
   - Task 4.1: Translation status API endpoint
   - Task 4.4: Batch status endpoint for list views

2. **Epic 5:** Owner Translation Management
   - Translation status display in UI

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Source language handling | Excluded from targets | Source language doesn't need translation |
| Status aggregation | Prioritize stored > jobs | Completed translations take precedence |
| Batch processing | Chunked parallel | Balance between speed and DB load |
| Overall status logic | Sequential checks | Clear priority: complete > failed > pending > partial |
| 'queued' mapping | Map to 'pending' | Simpler UI terminology |

---

## Testing Considerations

### Unit Tests

Create `/src/lib/content-translation/storage/__tests__/translation-status.test.ts`:

- `getEntityTranslationStatus`:
  - Returns correct status when all translations complete
  - Returns 'pending' when jobs are queued
  - Returns 'partial' when some translations exist
  - Returns 'failed' when jobs have failed
  - Returns 'not_started' when no translations or jobs exist
  - Excludes source language from targets
  - Calculates summary counts correctly

- `getBatchTranslationStatus`:
  - Returns results in same order as input
  - Handles empty array input
  - Handles mixed entity types
  - Processes large batches in chunks

### Integration Tests

- Verify correct data fetched from translation tables
- Verify correct data fetched from translation_jobs table
- Test with real database records

### Edge Cases

- Entity has no translations and no jobs (brand new)
- Entity has some completed, some pending, some failed
- Entity has only manual translations
- Entity doesn't exist in source table
- Tag entity (uses tag_key instead of id)
- Source language is not 'en'

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance on large batches | Medium | Medium | Chunked processing, consider single query optimization |
| Race conditions with job updates | Low | Low | Read-only operation, eventual consistency acceptable |
| Missing source language column | Low | Medium | Default to 'en', log warning |
| Type mismatches | Low | Medium | Strict TypeScript types, validate at boundaries |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| 1.6.1: Type definitions | Small | High |
| 1.6.2: Source language detection | Small | High |
| 1.6.3: Stored translation fetching | Small | High |
| 1.6.4: Job status fetching | Small | High |
| 1.6.5: Main status function | Medium | High |
| 1.6.6: Batch status function | Small | High |
| 1.6.7: Barrel exports | Trivial | High |
| **Total** | **Small-Medium** | High |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 1, Task 1.6)
- Epic 1 Foundation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Job Queue Module: REQ-243 (`/docs/REQ-243-create-translation-job-queue-module-overview.md`)
- Job Processor: REQ-244 (`/docs/REQ-244-implement-job-processor-overview.md`)
- Database Types: `/src/lib/supabase.ts`
- Server-side Supabase: `/src/lib/supabase-server.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.6*
