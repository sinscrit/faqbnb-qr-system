# REQ-341: Implement Translation Status Utilities - Technical Overview

**Created**: 2026-01-19
**Last Modified**: 2026-01-19
**Request Reference**: Epic 3 - Request #264 (Translation Status Utilities)
**Implementation Plan Reference**: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Task 1.6)
**Phase**: 1 - Content Translation Infrastructure
**Task ID**: 1.6
**Size**: M (Medium)

---

## Executive Summary

This task implements translation status utilities that aggregate translation job queue status with stored translation records to provide comprehensive translation availability and completion status reporting. The module provides both single-entity and batch query functions for efficient status lookups, enabling translation management UIs and status indicators throughout the application.

---

## Current State Analysis

### Existing Implementation

The codebase has relevant infrastructure in place:

**File**: `src/lib/job-queue/translation-jobs.ts`
- `getJobsByEntity(entityType, entityId)` - Retrieves all translation jobs for an entity
- `getJobsByStatus(status, limit)` - Retrieves jobs by status
- Returns `JobQueueResult<TranslationJob[]>` with job metadata

**File**: `src/lib/job-queue/translation-jobs.types.ts`
- `EntityType = 'article' | 'item' | 'link' | 'tag'`
- `JobStatus = 'queued' | 'processing' | 'completed' | 'failed'`
- `SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`

**File**: `src/lib/translation-service/translation-service.types.ts`
- `TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
- `TranslationStatusResult` interface defined (incomplete - needs enhancement)
- `SUPPORTED_LANGUAGES` constant array with language metadata

**File**: `src/lib/supabase.ts`
- Translation table types defined: `item_translations`, `article_translations`, `link_translations`, `tag_translations`
- Each table includes `translation_status`, `translated_at`, and language fields

### Gap Analysis

Per the implementation plan (Task 1.6), a dedicated status module should be created at `/src/lib/content-translation/storage/translation-status.ts` with:

1. **Aggregation logic** - Combine job queue status with stored translations
2. **Overall status calculation** - Determine `'complete' | 'partial' | 'pending' | 'failed'`
3. **Language-level status** - Per-language breakdown of translation state
4. **Batch query optimization** - Efficient multi-entity status retrieval
5. **Missing language detection** - Identify languages without translations or pending jobs

---

## Technical Approach

### Architecture Decision

Create a new status utilities module that:
1. Queries both `translation_jobs` table and entity-specific translation tables
2. Aggregates results into a unified `TranslationStatusResult` structure
3. Calculates overall status based on language coverage
4. Optimizes batch queries to minimize database round trips
5. Exports through the content-translation module index

### Module Structure

```
/src/lib/content-translation/
├── index.ts                      # Module exports (MODIFY)
└── storage/
    ├── translation-storage.ts    # Existing: Storage utilities (Task 1.5)
    └── translation-status.ts     # NEW: Status utilities
```

### Status Determination Logic

```
For each target language (5 languages excluding source):
  1. Check translation_jobs for entity:
     - If job exists with status='queued' or 'processing' → language status = 'pending'
     - If job exists with status='failed' → language status = 'failed'
     - If job exists with status='completed' → continue to step 2

  2. Check translation table (e.g., item_translations):
     - If translation exists with translation_status='completed' → 'completed'
     - If translation exists with translation_status='manual' → 'manual'
     - If translation exists with translation_status='failed' → 'failed'
     - If no translation exists → 'pending' (if job exists) or 'missing' (if no job)

Overall Status:
  - 'complete': All 5 target languages have 'completed' or 'manual' status
  - 'partial': At least one language 'completed'/'manual', at least one 'pending'/'failed'/'missing'
  - 'pending': All languages are 'pending' or have no jobs
  - 'failed': At least one language 'failed', none 'completed'/'manual'
```

---

## Database Schema Reference

### translation_jobs Table (Job Queue)
| Column | Type | Notes |
|--------|------|-------|
| id | string | Primary key |
| entity_type | string | 'item', 'article', 'link', 'tag' |
| entity_id | string | UUID of the entity |
| source_language | string | ISO 639-1 code |
| target_language | string | ISO 639-1 code |
| status | string | 'queued', 'processing', 'completed', 'failed' |
| attempts | number | Retry count |
| error_message | string | null | Error details |
| created_at | string | Job creation time |
| started_at | string | null | Processing start time |
| completed_at | string | null | Completion time |

**Unique Constraint**: `entity_type,entity_id,target_language`

### item_translations Table
| Column | Type | Notes |
|--------|------|-------|
| item_id | string | FK to items.id |
| language | string | ISO 639-1 code |
| translation_status | string | 'completed', 'manual', 'failed' |
| translated_at | string | null | Last translation time |
| updated_at | string | null | Last update time |

**Unique Constraint**: `item_id,language`

### article_translations Table
| Column | Type | Notes |
|--------|------|-------|
| article_id | string | FK to item_articles.id |
| language | string | ISO 639-1 code |
| translation_status | string | 'completed', 'manual', 'failed' |
| translated_at | string | null | Last translation time |
| reviewed_by | string | null | User ID for manual edits |
| updated_at | string | null | Last update time |

**Unique Constraint**: `article_id,language`

### link_translations Table
| Column | Type | Notes |
|--------|------|-------|
| link_id | string | FK to item_links.id |
| language | string | ISO 639-1 code |
| translation_status | string | 'completed', 'manual', 'failed' |
| translated_at | string | null | Last translation time |
| updated_at | string | null | Last update time |

**Unique Constraint**: `link_id,language`

### tag_translations Table
| Column | Type | Notes |
|--------|------|-------|
| tag_key | string | Tag identifier |
| language | string | ISO 639-1 code |
| is_system_tag | boolean | null | System vs user flag |
| created_at | string | null | Creation time |

**Unique Constraint**: `tag_key,language`

---

## Interface Contracts

### Translation Status Result Type

```typescript
/**
 * Status for a single language translation
 */
export interface LanguageTranslationStatus {
  /** Current status of this language's translation */
  status: 'pending' | 'completed' | 'failed' | 'manual' | 'missing';
  /** When the translation was last updated (ISO 8601) */
  translatedAt?: string;
  /** User who reviewed/edited the translation (for manual status) */
  reviewedBy?: string;
  /** Error message if failed */
  error?: string;
  /** Job ID if translation is pending or processing */
  jobId?: string;
}

/**
 * Comprehensive translation status for an entity
 */
export interface TranslationStatusResult {
  /** Entity identifier */
  entityId: string;
  /** Entity type */
  entityType: EntityType;
  /** Source language of the entity's content */
  sourceLanguage: SupportedLanguage;
  /** Overall translation status */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  /** Per-language status breakdown */
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
  /** Languages with completed or manual translations */
  completedLanguages: SupportedLanguage[];
  /** Languages with pending jobs (queued or processing) */
  pendingLanguages: SupportedLanguage[];
  /** Languages with failed translations */
  failedLanguages: SupportedLanguage[];
  /** Languages with no translation and no pending job */
  missingLanguages: SupportedLanguage[];
}
```

### Get Entity Translation Status

```typescript
/**
 * Get comprehensive translation status for a single entity
 *
 * Queries both translation_jobs and the appropriate translation table
 * to aggregate current status across all target languages.
 *
 * @param entityType - Type of entity ('item', 'article', 'link', 'tag')
 * @param entityId - UUID of the entity
 * @returns Promise resolving to TranslationStatusResult
 */
export async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<TranslationStatusResult>;
```

### Get Batch Translation Status

```typescript
/**
 * Entity identifier for batch queries
 */
export interface EntityIdentifier {
  type: EntityType;
  id: string;
}

/**
 * Get translation status for multiple entities in a single operation
 *
 * Optimizes database queries by batching lookups for the same entity type.
 * Returns results in the same order as the input array.
 *
 * @param entities - Array of entity type and ID pairs
 * @returns Promise resolving to array of TranslationStatusResult (same order as input)
 */
export async function getBatchTranslationStatus(
  entities: EntityIdentifier[]
): Promise<TranslationStatusResult[]>;
```

---

## Implementation Details

### Single Entity Status Query

```typescript
export async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<TranslationStatusResult> {
  // 1. Determine source language (from entity or default to 'en')
  const sourceLanguage = await getEntitySourceLanguage(entityType, entityId);

  // 2. Get target languages (all supported except source)
  const targetLanguages = getOtherLanguages(sourceLanguage);

  // 3. Query translation_jobs for this entity
  const jobsResult = await getJobsByEntity(entityType, entityId);
  const jobs = jobsResult.success ? jobsResult.data || [] : [];

  // 4. Query translation table for stored translations
  const translations = await getStoredTranslations(entityType, entityId);

  // 5. Aggregate status per language
  const languageStatuses: Record<SupportedLanguage, LanguageTranslationStatus> = {};

  for (const lang of targetLanguages) {
    const job = jobs.find(j => j.targetLanguage === lang);
    const stored = translations.find(t => t.language === lang);

    languageStatuses[lang] = calculateLanguageStatus(job, stored);
  }

  // 6. Calculate overall status
  const { overallStatus, completedLanguages, pendingLanguages, failedLanguages, missingLanguages } =
    calculateOverallStatus(languageStatuses);

  return {
    entityId,
    entityType,
    sourceLanguage,
    overallStatus,
    translations: languageStatuses,
    completedLanguages,
    pendingLanguages,
    failedLanguages,
    missingLanguages,
  };
}
```

### Batch Query Optimization

```typescript
export async function getBatchTranslationStatus(
  entities: EntityIdentifier[]
): Promise<TranslationStatusResult[]> {
  // Group entities by type for efficient batch queries
  const groupedByType = groupBy(entities, e => e.type);

  // Parallel queries per entity type
  const results = await Promise.all(
    Object.entries(groupedByType).map(async ([type, entityList]) => {
      const entityIds = entityList.map(e => e.id);

      // Batch query jobs for all entities of this type
      const jobs = await batchGetJobsByEntities(type as EntityType, entityIds);

      // Batch query translations for all entities of this type
      const translations = await batchGetStoredTranslations(type as EntityType, entityIds);

      // Process each entity
      return entityList.map(entity =>
        buildStatusFromData(entity.type, entity.id, jobs, translations)
      );
    })
  );

  // Flatten and reorder to match input order
  const flatResults = results.flat();
  return entities.map(entity =>
    flatResults.find(r => r.entityType === entity.type && r.entityId === entity.id)!
  );
}
```

### Helper Functions

```typescript
/**
 * Get source language for an entity from its source record
 */
async function getEntitySourceLanguage(
  entityType: EntityType,
  entityId: string
): Promise<SupportedLanguage> {
  const tableName = getEntityTableName(entityType);
  const sourceField = 'source_language';

  const { data } = await supabaseAdmin
    .from(tableName)
    .select(sourceField)
    .eq('id', entityId)
    .single();

  return (data?.source_language as SupportedLanguage) || 'en';
}

/**
 * Get stored translations for an entity
 */
async function getStoredTranslations(
  entityType: EntityType,
  entityId: string
): Promise<StoredTranslation[]> {
  const tableName = getTranslationTableName(entityType);
  const idColumn = getTranslationIdColumn(entityType);

  const { data } = await supabaseAdmin
    .from(tableName)
    .select('*')
    .eq(idColumn, entityId);

  return data || [];
}

/**
 * Calculate status for a single language based on job and stored translation
 */
function calculateLanguageStatus(
  job: TranslationJob | undefined,
  stored: StoredTranslation | undefined
): LanguageTranslationStatus {
  // Job is pending
  if (job && (job.status === 'queued' || job.status === 'processing')) {
    return {
      status: 'pending',
      jobId: job.id,
    };
  }

  // Has stored translation
  if (stored) {
    const status = stored.translation_status as LanguageTranslationStatus['status'];
    return {
      status: status === 'completed' || status === 'manual' ? status : 'failed',
      translatedAt: stored.translated_at || stored.created_at,
      reviewedBy: stored.reviewed_by,
    };
  }

  // Job failed and no stored translation
  if (job && job.status === 'failed') {
    return {
      status: 'failed',
      error: job.errorMessage || 'Translation failed',
      jobId: job.id,
    };
  }

  // No job and no translation
  return { status: 'missing' };
}

/**
 * Calculate overall status from language statuses
 */
function calculateOverallStatus(
  languageStatuses: Record<SupportedLanguage, LanguageTranslationStatus>
): {
  overallStatus: TranslationStatusResult['overallStatus'];
  completedLanguages: SupportedLanguage[];
  pendingLanguages: SupportedLanguage[];
  failedLanguages: SupportedLanguage[];
  missingLanguages: SupportedLanguage[];
} {
  const completed: SupportedLanguage[] = [];
  const pending: SupportedLanguage[] = [];
  const failed: SupportedLanguage[] = [];
  const missing: SupportedLanguage[] = [];

  for (const [lang, status] of Object.entries(languageStatuses)) {
    switch (status.status) {
      case 'completed':
      case 'manual':
        completed.push(lang as SupportedLanguage);
        break;
      case 'pending':
        pending.push(lang as SupportedLanguage);
        break;
      case 'failed':
        failed.push(lang as SupportedLanguage);
        break;
      case 'missing':
        missing.push(lang as SupportedLanguage);
        break;
    }
  }

  let overallStatus: TranslationStatusResult['overallStatus'];
  const totalTargets = Object.keys(languageStatuses).length;

  if (completed.length === totalTargets) {
    overallStatus = 'complete';
  } else if (completed.length > 0) {
    overallStatus = 'partial';
  } else if (failed.length > 0 && pending.length === 0) {
    overallStatus = 'failed';
  } else {
    overallStatus = 'pending';
  }

  return {
    overallStatus,
    completedLanguages: completed,
    pendingLanguages: pending,
    failedLanguages: failed,
    missingLanguages: missing,
  };
}
```

### Entity Table Mappings

```typescript
function getEntityTableName(entityType: EntityType): string {
  const mapping: Record<EntityType, string> = {
    item: 'items',
    article: 'item_articles',
    link: 'item_links',
    tag: 'tags', // Note: tags may not have source_language column
  };
  return mapping[entityType];
}

function getTranslationTableName(entityType: EntityType): string {
  const mapping: Record<EntityType, string> = {
    item: 'item_translations',
    article: 'article_translations',
    link: 'link_translations',
    tag: 'tag_translations',
  };
  return mapping[entityType];
}

function getTranslationIdColumn(entityType: EntityType): string {
  const mapping: Record<EntityType, string> = {
    item: 'item_id',
    article: 'article_id',
    link: 'link_id',
    tag: 'tag_key',
  };
  return mapping[entityType];
}
```

---

## Error Handling

Handle specific error scenarios:

1. **Entity not found** - Return status with all languages as 'missing'
2. **Database query errors** - Log and propagate error with meaningful message
3. **Invalid entity type** - Throw descriptive error early
4. **Empty batch request** - Return empty array immediately

```typescript
// Error handling example
if (!['item', 'article', 'link', 'tag'].includes(entityType)) {
  throw new Error(`Invalid entity type: ${entityType}. Must be 'item', 'article', 'link', or 'tag'.`);
}
```

---

## Dependencies

### Required Imports

```typescript
import { supabaseAdmin } from '@/lib/supabase';
import type {
  EntityType,
  SupportedLanguage,
  TranslationJob,
  JobQueueResult
} from '@/lib/job-queue/translation-jobs.types';
import { getJobsByEntity } from '@/lib/job-queue';
import { getOtherLanguages } from '@/lib/translation-service/translation-service.types';
```

### Dependency on Other Tasks

- **Epic 1 (Plan-110)**: Translation tables must exist in database
- **REQ-227**: Translation table TypeScript types in `src/lib/supabase.ts`
- **REQ-243**: Job queue functions (`getJobsByEntity`)
- **Task 1.5**: Translation storage utilities (sibling module)

### Downstream Dependencies

- **Task 4.1**: Translation status API endpoint will use `getEntityTranslationStatus`
- **Task 4.4**: Batch status endpoint will use `getBatchTranslationStatus`
- **Epic 5**: Owner translation management UI will consume status data

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/storage/translation-status.ts` | Translation status utilities module |

### Files to MODIFY

| File Path | Changes Required |
|-----------|------------------|
| `/src/lib/content-translation/index.ts` | Export status utilities and types |

### Functions to IMPLEMENT

| Function | Location | Purpose |
|----------|----------|---------|
| `getEntityTranslationStatus` | translation-status.ts | Get status for single entity |
| `getBatchTranslationStatus` | translation-status.ts | Get status for multiple entities |
| `getEntitySourceLanguage` | translation-status.ts | Helper: get entity's source language |
| `getStoredTranslations` | translation-status.ts | Helper: query translation table |
| `batchGetJobsByEntities` | translation-status.ts | Helper: batch job query |
| `batchGetStoredTranslations` | translation-status.ts | Helper: batch translation query |
| `calculateLanguageStatus` | translation-status.ts | Helper: determine single language status |
| `calculateOverallStatus` | translation-status.ts | Helper: aggregate overall status |

### Types to DEFINE

| Type | Location | Purpose |
|------|----------|---------|
| `LanguageTranslationStatus` | translation-status.ts | Per-language status |
| `TranslationStatusResult` | translation-status.ts | Full entity status result |
| `EntityIdentifier` | translation-status.ts | Batch query input type |

---

## Testing Strategy

### Unit Tests

1. **getEntityTranslationStatus**
   - Entity with all translations complete → `overallStatus: 'complete'`
   - Entity with some translations pending → `overallStatus: 'partial'`
   - Entity with no translations and pending jobs → `overallStatus: 'pending'`
   - Entity with all translations failed → `overallStatus: 'failed'`
   - Entity with manual translations → properly categorized
   - Non-existent entity → returns 'missing' for all languages

2. **getBatchTranslationStatus**
   - Empty array input → returns empty array
   - Single entity → returns single-item array matching `getEntityTranslationStatus`
   - Multiple entities same type → efficient single batch query
   - Multiple entities mixed types → parallel queries per type
   - Results maintain input order

3. **calculateLanguageStatus**
   - Pending job → status 'pending' with jobId
   - Completed stored translation → status 'completed' with timestamp
   - Manual stored translation → status 'manual' with reviewedBy
   - Failed job, no translation → status 'failed' with error
   - No job, no translation → status 'missing'

4. **calculateOverallStatus**
   - All completed → 'complete'
   - Mixed completed/pending → 'partial'
   - All pending → 'pending'
   - All failed → 'failed'

### Integration Tests

1. End-to-end: Create item → queue translations → process some → check partial status
2. Batch query performance: 50 entities in single call completes within 2 seconds
3. Concurrent status queries do not interfere

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| getEntityTranslationStatus accepts entity type and entity identifier parameters | Function signature with `entityType: EntityType, entityId: string` |
| Function queries translation job queue to identify pending/in-progress jobs | Uses `getJobsByEntity` from job-queue module |
| Function queries appropriate translation storage table for completed translations | Uses entity-specific table queries |
| Returns TranslationStatusResult indicating completed, pending, and missing languages | Returns structured result with categorized language arrays |
| TranslationStatusResult includes timestamp metadata for when translations were last updated | Includes `translatedAt` in `LanguageTranslationStatus` |
| getBatchTranslationStatus accepts array of entity type and identifier pairs | Function signature with `entities: EntityIdentifier[]` |
| Batch function returns array of TranslationStatusResult objects maintaining input order | Reorders results to match input array |
| Batch function optimizes database queries to minimize round trips | Groups by entity type, uses `IN` queries |
| Both functions handle database query errors gracefully | Try-catch with descriptive error messages |
| Implementation is located at /src/lib/content-translation/storage/translation-status.ts | File location as specified |
| All status utility functions are properly exported | Exports via module index |
| Utilities integrate with both translation job queue and translation storage schemas | Uses job-queue types and translation table structures |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Batch query performance degradation with many entities | Medium | Medium | Implement pagination, add query limits |
| Race conditions between job completion and status query | Low | Low | Status reflects point-in-time snapshot |
| Inconsistent status when job completes but storage fails | Low | Medium | Job processor should be atomic |
| Missing source_language column for tags | Medium | Low | Default to 'en' for tags |
| Type mismatches with existing code | Low | Medium | Align with existing type patterns |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` (REQ-264: Translation Status Utilities)
- Job Queue Module: `/src/lib/job-queue/translation-jobs.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Database Types: `/src/lib/supabase.ts`
- Storage Utilities: `/src/lib/content-translation/storage/translation-storage.ts` (Task 1.5)
