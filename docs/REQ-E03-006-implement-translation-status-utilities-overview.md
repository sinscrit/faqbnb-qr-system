# Implementation Overview: REQ-E03-006 - Implement Translation Status Utilities

**Request ID:** REQ-E03-006
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.6
**Type:** NEW FEATURE
**Size:** M
**Created:** 2026-01-19
**Last Modified:** 2026-01-19

---

## Summary

Implement utility functions that aggregate translation job status with stored translation records to report comprehensive translation status for individual content entities or batches of entities. These utilities provide a single query interface for determining whether content is fully translated, partially translated, in progress, or failed.

---

## Background & Context

### Current State

The codebase has a fully-implemented translation job queue module at `/src/lib/job-queue/` that tracks translation jobs through their lifecycle (queued, processing, completed, failed). Translation records are stored in entity-specific translation tables (`item_translations`, `article_translations`, `link_translations`, `tag_translations`). However, there is no unified mechanism to aggregate data from both sources to provide a complete translation status view.

### Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Translation job types | `/src/lib/job-queue/translation-jobs.types.ts` | Implemented |
| Job queue functions | `/src/lib/job-queue/translation-jobs.ts` | Implemented |
| `getJobsByEntity()` function | `/src/lib/job-queue/translation-jobs.ts:602` | Available for reuse |
| Translation storage utilities | `/src/lib/content-translation/storage/translation-storage.ts` | Task 1.5 (dependency) |
| Translation tables | Supabase database | Created in Epic 1 |

### Problem Statement

1. Information about translation jobs exists separately from stored translations
2. There is no way to answer questions like "Is this item fully translated?" or "Which articles have pending translations?"
3. Dashboard and UI components need aggregated status for displaying translation progress
4. Batch queries are needed for list views to avoid N+1 performance issues

### Solution Approach

Create two status aggregation functions in `/src/lib/content-translation/storage/translation-status.ts` that:
- Query both translation jobs and stored translations
- Aggregate status for each target language
- Calculate overall completion percentage
- Support efficient batch queries for list views
- Return type-safe status objects

---

## Technical Design

### Architecture Position

```
/src/lib/content-translation/
├── index.ts                          # Module exports
├── content-translation.types.ts      # Types
└── storage/
    ├── translation-storage.ts        # Task 1.5 (storage)
    └── translation-status.ts         # NEW - This task
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `supabaseAdmin` | `/src/lib/supabase.ts` | Database client with admin privileges |
| `getJobsByEntity` | `/src/lib/job-queue/translation-jobs.ts` | Fetch jobs for an entity |
| `SupportedLanguage` | `/src/lib/job-queue/translation-jobs.types.ts` | Type-safe language codes |
| `EntityType` | `/src/lib/job-queue/translation-jobs.types.ts` | Entity type enum |
| `TranslationJob` | `/src/lib/job-queue/translation-jobs.types.ts` | Job interface |
| `JobStatus` | `/src/lib/job-queue/translation-jobs.types.ts` | Job status type |

### Database Tables

| Table | Primary Key | Query Columns |
|-------|-------------|---------------|
| `translation_jobs` | `id` | `entity_type`, `entity_id`, `target_language`, `status`, `error_message` |
| `item_translations` | `id` | `item_id`, `language`, `translation_status`, `translated_at` |
| `article_translations` | `id` | `article_id`, `language`, `translation_status`, `translated_at` |
| `link_translations` | `id` | `link_id`, `language`, `translation_status`, `translated_at` |
| `tag_translations` | `id` | `tag_key`, `language` |

### All Target Languages

```typescript
const ALL_TARGET_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
```

---

## Interface Contracts

### Status Enumerations

```typescript
/**
 * Status for a specific language translation
 */
export type LanguageStatus =
  | 'not_started'   // No job created yet
  | 'pending'       // Job is queued
  | 'processing'    // Job is being processed
  | 'completed'     // Translation completed successfully
  | 'failed'        // Translation failed after retries
  | 'manual';       // Manually provided translation

/**
 * Overall translation status for an entity
 */
export type OverallStatus =
  | 'complete'      // All languages translated
  | 'partial'       // Some languages translated
  | 'pending'       // Translations in progress, none failed
  | 'failed';       // One or more translations failed
```

### Result Types

```typescript
/**
 * Translation status for a specific language
 */
export interface LanguageTranslationStatus {
  /** Status of this language's translation */
  status: LanguageStatus;
  /** Associated translation job, if any */
  job?: TranslationJob;
  /** Last error message if status is 'failed' */
  lastError?: string;
  /** Timestamp of last translation update */
  translatedAt?: string;
}

/**
 * Complete translation status result for an entity
 */
export interface TranslationStatusResult {
  /** Type of the entity */
  entityType: EntityType;
  /** ID of the entity */
  entityId: string;
  /** Source language of the content (null if unknown) */
  sourceLanguage: SupportedLanguage | null;
  /** Total number of target languages (5, excluding source) */
  totalLanguages: number;
  /** Count of completed translations */
  completedCount: number;
  /** Count of in-progress translations (pending + processing) */
  inProgressCount: number;
  /** Count of failed translations */
  failedCount: number;
  /** Count of not-started translations */
  notStartedCount: number;
  /** Completion percentage (0-100) */
  completionPercentage: number;
  /** Overall status across all languages */
  overallStatus: OverallStatus;
  /** Per-language status breakdown */
  byLanguage: Record<SupportedLanguage, LanguageTranslationStatus>;
  /** Timestamp of most recent translation update */
  lastUpdatedAt?: string;
}

/**
 * Result type for status operations
 */
export interface StatusQueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Function Signatures

```typescript
/**
 * Get complete translation status for a single entity
 *
 * @param entityType - Type of entity (item, article, link, tag)
 * @param entityId - UUID or key of the entity
 * @returns Status result with per-language breakdown and overall status
 *
 * @example
 * const result = await getEntityTranslationStatus('item', 'abc-123-uuid');
 * if (result.success && result.data) {
 *   console.log(`Completion: ${result.data.completionPercentage}%`);
 *   console.log(`Status: ${result.data.overallStatus}`);
 * }
 */
export async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<StatusQueryResult<TranslationStatusResult>>;

/**
 * Get translation status for multiple entities in a batch
 * Optimized for dashboard list views with efficient database queries
 *
 * @param entities - Array of entity specifications
 * @returns Array of status results in same order as input
 *
 * @example
 * const items = [
 *   { type: 'item', id: 'abc-123' },
 *   { type: 'item', id: 'def-456' },
 *   { type: 'article', id: 'ghi-789' },
 * ];
 * const result = await getBatchTranslationStatus(items);
 * if (result.success && result.data) {
 *   result.data.forEach((status, i) => {
 *     console.log(`${items[i].id}: ${status.overallStatus}`);
 *   });
 * }
 */
export async function getBatchTranslationStatus(
  entities: Array<{ type: EntityType; id: string }>
): Promise<StatusQueryResult<TranslationStatusResult[]>>;
```

---

## Implementation Details

### Status Determination Logic

The status for each language is determined by combining job status and translation record status:

```typescript
function determineLanguageStatus(
  job: TranslationJob | undefined,
  translationRecord: TranslationRecord | undefined
): LanguageStatus {
  // Priority 1: Check translation record first (source of truth)
  if (translationRecord) {
    if (translationRecord.translation_status === 'manual') {
      return 'manual';
    }
    if (translationRecord.translation_status === 'completed') {
      return 'completed';
    }
  }

  // Priority 2: Check job status
  if (!job) {
    return 'not_started';
  }

  switch (job.status) {
    case 'completed':
      // Job completed but no translation record - treat as completed
      // (record might exist, just not fetched yet)
      return 'completed';
    case 'processing':
      return 'processing';
    case 'queued':
      return 'pending';
    case 'failed':
      return 'failed';
    default:
      return 'not_started';
  }
}
```

### Overall Status Determination

```typescript
function determineOverallStatus(
  completedCount: number,
  failedCount: number,
  inProgressCount: number,
  totalLanguages: number
): OverallStatus {
  // All completed?
  if (completedCount >= totalLanguages) {
    return 'complete';
  }
  // Any failures?
  if (failedCount > 0) {
    return 'failed';
  }
  // Any completed?
  if (completedCount > 0) {
    return 'partial';
  }
  // Nothing completed, but in progress
  return 'pending';
}
```

### Single Entity Query Flow

```typescript
async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<StatusQueryResult<TranslationStatusResult>> {
  // 1. Fetch all translation jobs for this entity
  const jobsResult = await getJobsByEntity(entityType, entityId);

  // 2. Fetch all translation records for this entity
  const translations = await fetchTranslationRecords(entityType, entityId);

  // 3. Determine source language from jobs (first job's source)
  const sourceLanguage = jobsResult.data?.[0]?.sourceLanguage || null;

  // 4. For each target language, determine status
  const byLanguage: Record<SupportedLanguage, LanguageTranslationStatus> = {};
  const targetLanguages = getTargetLanguages(sourceLanguage);

  for (const lang of targetLanguages) {
    const job = jobsResult.data?.find(j => j.targetLanguage === lang);
    const translation = translations.find(t => t.language === lang);

    byLanguage[lang] = {
      status: determineLanguageStatus(job, translation),
      job: job,
      lastError: job?.errorMessage || undefined,
      translatedAt: translation?.translated_at || undefined,
    };
  }

  // 5. Aggregate counts and determine overall status
  // ...
}
```

### Batch Query Optimization

For batch queries, group entities by type to minimize database round-trips:

```typescript
async function getBatchTranslationStatus(
  entities: Array<{ type: EntityType; id: string }>
): Promise<StatusQueryResult<TranslationStatusResult[]>> {
  // Group entities by type
  const byType: Record<EntityType, string[]> = {
    item: [],
    article: [],
    link: [],
    tag: [],
  };

  entities.forEach(e => byType[e.type].push(e.id));

  // Batch fetch jobs for each type
  const [itemJobs, articleJobs, linkJobs, tagJobs] = await Promise.all([
    byType.item.length > 0
      ? fetchJobsForEntityIds('item', byType.item)
      : [],
    byType.article.length > 0
      ? fetchJobsForEntityIds('article', byType.article)
      : [],
    byType.link.length > 0
      ? fetchJobsForEntityIds('link', byType.link)
      : [],
    byType.tag.length > 0
      ? fetchJobsForEntityIds('tag', byType.tag)
      : [],
  ]);

  // Batch fetch translation records for each type
  // ... similar pattern ...

  // Map results back to input order
  return entities.map(e => buildStatusResult(e, jobs, translations));
}
```

### Database Query Patterns

**Fetching jobs for multiple entity IDs:**
```typescript
async function fetchJobsForEntityIds(
  entityType: EntityType,
  entityIds: string[]
): Promise<TranslationJob[]> {
  const { data, error } = await supabaseAdmin
    .from('translation_jobs')
    .select('*')
    .eq('entity_type', entityType)
    .in('entity_id', entityIds);

  if (error) {
    console.error('[TranslationStatus] Failed to fetch jobs:', error);
    return [];
  }

  return (data || []).map(mapRowToJob);
}
```

**Fetching translation records:**
```typescript
async function fetchItemTranslations(itemIds: string[]) {
  const { data, error } = await supabaseAdmin
    .from('item_translations')
    .select('item_id, language, translation_status, translated_at')
    .in('item_id', itemIds);

  if (error) {
    console.error('[TranslationStatus] Failed to fetch item translations:', error);
    return [];
  }

  return data || [];
}
```

---

## Authorized Files and Functions for Modification

### New Files (CREATE)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/storage/translation-status.ts` | Main status utilities module |

### Files to Modify (UPDATE)

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/content-translation/storage/index.ts` | Add exports | Export status functions from storage barrel |
| `/src/lib/content-translation/index.ts` | Add exports | Re-export status functions from main module barrel |
| `/src/lib/content-translation/content-translation.types.ts` | Add types | Add status-related type definitions |

### Functions to Create

| Function Name | File | Purpose |
|--------------|------|---------|
| `getEntityTranslationStatus` | translation-status.ts | Get status for a single entity |
| `getBatchTranslationStatus` | translation-status.ts | Get status for multiple entities |
| `determineLanguageStatus` | translation-status.ts | Internal helper for language status |
| `determineOverallStatus` | translation-status.ts | Internal helper for overall status |
| `fetchJobsForEntityIds` | translation-status.ts | Internal batch job fetcher |
| `fetchItemTranslations` | translation-status.ts | Internal item translation fetcher |
| `fetchArticleTranslations` | translation-status.ts | Internal article translation fetcher |
| `fetchLinkTranslations` | translation-status.ts | Internal link translation fetcher |
| `fetchTagTranslations` | translation-status.ts | Internal tag translation fetcher |
| `getTargetLanguages` | translation-status.ts | Get all languages except source |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/translation-jobs.ts` | Reference for `getJobsByEntity()` usage |
| `/src/lib/job-queue/translation-jobs.types.ts` | Types to import (TranslationJob, EntityType, etc.) |
| `/src/lib/supabase.ts` | Database client |
| `/src/lib/content-translation/storage/translation-storage.ts` | Peer module for reference patterns |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority |
|---|------|------|----------|
| 1 | Create translation-status.ts file with imports | XS | Required |
| 2 | Define TypeScript types (LanguageStatus, TranslationStatusResult, etc.) | S | Required |
| 3 | Implement `getTargetLanguages()` helper | XS | Required |
| 4 | Implement `determineLanguageStatus()` helper | S | Required |
| 5 | Implement `determineOverallStatus()` helper | S | Required |
| 6 | Implement translation record fetch functions (4 entity types) | M | Required |
| 7 | Implement `getEntityTranslationStatus()` function | M | Required |
| 8 | Implement batch job fetch function | S | Required |
| 9 | Implement `getBatchTranslationStatus()` function | M | Required |
| 10 | Update barrel exports | XS | Required |
| 11 | Verify TypeScript compilation | XS | Required |

### Implementation Order

1. **Step 1**: Create file, add imports from job-queue and supabase
2. **Step 2**: Define all type interfaces in content-translation.types.ts or inline
3. **Step 3**: Implement helper functions (`getTargetLanguages`, `determineLanguageStatus`, `determineOverallStatus`)
4. **Step 4**: Implement individual translation record fetch functions
5. **Step 5**: Implement `getEntityTranslationStatus()` using helpers
6. **Step 6**: Test single entity function
7. **Step 7**: Implement batch fetch functions with IN clauses
8. **Step 8**: Implement `getBatchTranslationStatus()` with grouping logic
9. **Step 9**: Update barrel exports
10. **Step 10**: Verify build passes

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Single entity status function accepts entity type and entity ID parameters | `getEntityTranslationStatus(entityType, entityId)` signature |
| Single entity status function queries translation jobs table | Uses `getJobsByEntity()` from job-queue module |
| Single entity status function queries translations table | Implements `fetchXxxTranslations()` functions |
| Single entity status function combines job and translation data | `determineLanguageStatus()` helper |
| Single entity status function returns status enumeration per language | `byLanguage` field in result |
| Single entity status function calculates completion percentage | `completionPercentage` field in result |
| Batch status function accepts array of entity specifications | `Array<{ type: EntityType; id: string }>` parameter |
| Batch status function uses efficient database queries | `IN` clauses, grouped by entity type |
| Batch status function returns results in same order as input | Maps results back to input order |
| Batch status function handles large batches efficiently | Parallel queries per entity type |
| Both functions handle entities with no jobs gracefully | Returns `not_started` status |
| Both functions handle database errors gracefully | Returns error in result object |
| Status results include timestamp of last translation | `lastUpdatedAt` and per-language `translatedAt` |
| TypeScript types properly defined | All interfaces and types exported |
| All functions properly exported from module | Barrel exports in index.ts |

---

## Testing Considerations

### Unit Test Cases

1. **Status Determination**
   - `not_started`: No job, no translation
   - `pending`: Job queued, no translation
   - `processing`: Job processing
   - `completed`: Job completed with translation record
   - `failed`: Job failed with error message
   - `manual`: Translation record with manual status

2. **Overall Status**
   - `complete`: All 5 languages completed
   - `partial`: Some completed, none failed
   - `pending`: None completed, in progress
   - `failed`: At least one failed

3. **Edge Cases**
   - Entity with no jobs at all
   - Entity with jobs but no translation records
   - Entity with translation records but no jobs (manual imports)
   - Invalid entity ID (non-existent)

### Integration Test Cases

1. Create item -> queue translations -> check status shows pending
2. Process translations -> check status shows completed
3. Fail translation -> check status shows failed with error message
4. Batch query with mixed statuses -> verify correct results

### Performance Test Cases

1. Batch query with 50 entities -> verify single query per entity type
2. Batch query with 100+ entities -> verify acceptable response time

---

## Related Documentation

- **Request Document**: `/docs/gen_requests_epic3.md` (REQ-E03-006)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Job Queue Module**: `/src/lib/job-queue/translation-jobs.ts`
- **Storage Utilities**: `/docs/REQ-E03-005-implement-translation-storage-utilities-overview.md`

---

## Notes

1. **Relationship to Job Queue Module**: This module imports and uses `getJobsByEntity()` from the job queue module rather than duplicating the query logic. For batch operations, it implements custom batch queries with `IN` clauses for efficiency.

2. **Tag Translation Handling**: Unlike other entity types, `tag_translations` does not have a `translation_status` column. For tags, presence of a translation record indicates completion.

3. **Source Language Detection**: The source language is determined from the first translation job found for an entity. If no jobs exist, source language is returned as `null`.

4. **Future Enhancement**: The batch function could be enhanced with pagination support for very large batches (500+ entities) if needed.

5. **Integration with Status API**: Once implemented, this module will be consumed by Task 4.1 (Translation Status API Endpoint) to expose status information via REST API.
