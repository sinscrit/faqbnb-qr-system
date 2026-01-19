# REQ-341: Implement Translation Status Utilities - Detailed Implementation Tasks

**Generated:** 2026-01-19 (System Date)
**Last Modified:** 2026-01-19

**Reference Documents:**
- Requirements: `/docs/gen_requests_epic3.md` (REQ-264: Translation Status Utilities)
- Overview: `/docs/REQ-341-implement-translation-status-utilities-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 1.6)

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Summary

This document provides granular implementation tasks for REQ-341 (originally REQ-264), which implements translation status utilities that aggregate translation job queue status with stored translation records. The utilities provide comprehensive translation availability and completion status reporting for individual entities and batches.

---

## Prerequisites

Before starting implementation, verify these dependencies are in place:

1. **Translation tables exist** (Epic 1):
   - `item_translations`, `article_translations`, `link_translations`, `tag_translations`
   - `translation_jobs` table with job queue schema

2. **Job queue module exists** (REQ-243):
   - `/src/lib/job-queue/translation-jobs.ts` with `getJobsByEntity()` function
   - Types defined in `/src/lib/job-queue/translation-jobs.types.ts`

3. **Translation service types exist** (REQ-235):
   - `/src/lib/translation-service/translation-service.types.ts` with `getOtherLanguages()` function

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

---

## Task Breakdown

---

## 1. Create Directory Structure and Module File

**Context:** The content-translation module structure may or may not exist. We need to ensure the storage subdirectory exists and create the translation-status.ts file with proper module documentation.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts` (CREATE)
**Estimated effort:** 1 story point

- [ ] **1.1** Verify `/src/lib/content-translation/` directory exists; if not, create it along with `/src/lib/content-translation/storage/` subdirectory
  ```bash
  # From project root, verify or create directories
  mkdir -p src/lib/content-translation/storage
  ```

- [ ] **1.2** Create the file `/src/lib/content-translation/storage/translation-status.ts` with module header documentation:
  ```typescript
  /**
   * Translation Status Utilities
   * Part of REQ-341 (REQ-264): Implement Translation Status Utilities
   *
   * This module provides utility functions that aggregate translation job queue
   * status with stored translation records to report comprehensive translation
   * availability and completion status for individual entities and batches.
   *
   * @module content-translation/storage/translation-status
   * @created 2026-01-19
   */
  ```

- [ ] **1.3** Add required imports at the top of the file:
  ```typescript
  import { supabaseAdmin } from '@/lib/supabase';
  import type {
    EntityType,
    SupportedLanguage,
    TranslationJob,
    JobQueueResult,
  } from '@/lib/job-queue/translation-jobs.types';
  import { getJobsByEntity } from '@/lib/job-queue';
  import { getOtherLanguages, SUPPORTED_LANGUAGES } from '@/lib/translation-service/translation-service.types';
  ```

- [ ] **1.4** Verify the file compiles without errors by running:
  ```bash
  npx tsc --noEmit src/lib/content-translation/storage/translation-status.ts
  ```

**Acceptance Criteria:**
- Directory structure `/src/lib/content-translation/storage/` exists
- File `/src/lib/content-translation/storage/translation-status.ts` exists with proper imports
- File compiles without TypeScript errors

---

## 2. Define TypeScript Types and Interfaces

**Context:** The overview document specifies three main types: `LanguageTranslationStatus`, `TranslationStatusResult`, and `EntityIdentifier`. These types must match the interface contracts defined in the overview.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **2.1** Add the `LanguageTranslationStatus` interface after imports:
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
  ```

- [ ] **2.2** Add the `TranslationStatusResult` interface:
  ```typescript
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
    translations: Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
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

- [ ] **2.3** Add the `EntityIdentifier` interface for batch queries:
  ```typescript
  /**
   * Entity identifier for batch queries
   */
  export interface EntityIdentifier {
    type: EntityType;
    id: string;
  }
  ```

- [ ] **2.4** Add internal helper type for stored translation records:
  ```typescript
  /**
   * Internal type representing a stored translation record from any translation table
   */
  interface StoredTranslation {
    language: string;
    translation_status: string;
    translated_at?: string | null;
    reviewed_by?: string | null;
    created_at?: string | null;
  }
  ```

- [ ] **2.5** Verify types compile correctly:
  ```bash
  npx tsc --noEmit src/lib/content-translation/storage/translation-status.ts
  ```

**Acceptance Criteria:**
- All four interfaces are defined with proper JSDoc comments
- Types match the interface contracts from the overview document
- File compiles without TypeScript errors

---

## 3. Implement Entity Table Mapping Helper Functions

**Context:** Different entity types map to different database tables with different column names. These helper functions provide the mapping logic used by query functions.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **3.1** Add `getEntityTableName` helper function:
  ```typescript
  /**
   * Get the source entity table name for an entity type
   * @param entityType - The type of entity
   * @returns The database table name containing the source content
   */
  function getEntityTableName(entityType: EntityType): string {
    const mapping: Record<EntityType, string> = {
      item: 'items',
      article: 'item_articles',
      link: 'item_links',
      tag: 'tags',
    };
    return mapping[entityType];
  }
  ```

- [ ] **3.2** Add `getTranslationTableName` helper function:
  ```typescript
  /**
   * Get the translation table name for an entity type
   * @param entityType - The type of entity
   * @returns The database table name storing translations
   */
  function getTranslationTableName(entityType: EntityType): string {
    const mapping: Record<EntityType, string> = {
      item: 'item_translations',
      article: 'article_translations',
      link: 'link_translations',
      tag: 'tag_translations',
    };
    return mapping[entityType];
  }
  ```

- [ ] **3.3** Add `getTranslationIdColumn` helper function:
  ```typescript
  /**
   * Get the foreign key column name in the translation table
   * @param entityType - The type of entity
   * @returns The column name that references the source entity
   */
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

- [ ] **3.4** Add `isValidEntityType` validation helper:
  ```typescript
  /**
   * Validate that a string is a valid entity type
   * @param entityType - The string to validate
   * @returns true if valid entity type
   */
  function isValidEntityType(entityType: string): entityType is EntityType {
    return ['item', 'article', 'link', 'tag'].includes(entityType);
  }
  ```

- [ ] **3.5** Write unit test for mapping helpers in `/src/lib/content-translation/storage/__tests__/translation-status.test.ts`:
  ```typescript
  describe('Entity Table Mapping Helpers', () => {
    test('getEntityTableName returns correct table for each entity type', () => {
      expect(getEntityTableName('item')).toBe('items');
      expect(getEntityTableName('article')).toBe('item_articles');
      expect(getEntityTableName('link')).toBe('item_links');
      expect(getEntityTableName('tag')).toBe('tags');
    });
    // Add similar tests for getTranslationTableName and getTranslationIdColumn
  });
  ```

**Acceptance Criteria:**
- All mapping functions return correct values for each entity type
- `isValidEntityType` correctly validates entity type strings
- Unit tests pass for all mapping functions

---

## 4. Implement Source Language Query Helper

**Context:** Entities store their source language in different ways. Items, articles, and links have a `source_language` column. Tags default to 'en' as they don't have a source language column.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **4.1** Add `getEntitySourceLanguage` async helper function:
  ```typescript
  /**
   * Get source language for an entity from its source record
   * @param entityType - Type of entity
   * @param entityId - UUID of the entity
   * @returns Source language code, defaults to 'en' if not found
   */
  async function getEntitySourceLanguage(
    entityType: EntityType,
    entityId: string
  ): Promise<SupportedLanguage> {
    // Tags don't have source_language column, default to 'en'
    if (entityType === 'tag') {
      return 'en';
    }

    const tableName = getEntityTableName(entityType);

    try {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('source_language')
        .eq('id', entityId)
        .single();

      if (error || !data) {
        console.warn(`TRANSLATION_STATUS: Could not fetch source language for ${entityType}:${entityId}, defaulting to 'en'`);
        return 'en';
      }

      return (data.source_language as SupportedLanguage) || 'en';
    } catch (err) {
      console.error(`TRANSLATION_STATUS: Exception fetching source language`, err);
      return 'en';
    }
  }
  ```

- [ ] **4.2** Add logging constant at the top of the file after imports:
  ```typescript
  const LOG_PREFIX = 'TRANSLATION_STATUS:';
  ```

- [ ] **4.3** Write unit test for source language retrieval:
  ```typescript
  describe('getEntitySourceLanguage', () => {
    test('returns "en" for tag entity type without querying database', async () => {
      const result = await getEntitySourceLanguage('tag', 'any-tag-key');
      expect(result).toBe('en');
    });

    test('returns source_language from database for item entity', async () => {
      // Mock supabaseAdmin to return { source_language: 'fr' }
      // Test that result is 'fr'
    });

    test('returns "en" when entity not found', async () => {
      // Mock supabaseAdmin to return null
      // Test that result is 'en'
    });
  });
  ```

**Acceptance Criteria:**
- Function correctly returns 'en' for tag entities without database query
- Function queries correct table for other entity types
- Function returns 'en' as fallback when entity not found or source_language is null
- Error handling logs warnings but does not throw

---

## 5. Implement Stored Translations Query Helper

**Context:** This helper queries the appropriate translation table to get all stored translations for an entity. The query must handle different column names for different entity types.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **5.1** Add `getStoredTranslations` async helper function:
  ```typescript
  /**
   * Get stored translations for an entity from the translation table
   * @param entityType - Type of entity
   * @param entityId - UUID of the entity (or tag_key for tags)
   * @returns Array of stored translation records
   */
  async function getStoredTranslations(
    entityType: EntityType,
    entityId: string
  ): Promise<StoredTranslation[]> {
    const tableName = getTranslationTableName(entityType);
    const idColumn = getTranslationIdColumn(entityType);

    try {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('language, translation_status, translated_at, reviewed_by, created_at')
        .eq(idColumn, entityId);

      if (error) {
        console.error(`${LOG_PREFIX} Failed to get stored translations for ${entityType}:${entityId}`, error);
        return [];
      }

      return (data || []) as StoredTranslation[];
    } catch (err) {
      console.error(`${LOG_PREFIX} Exception getting stored translations`, err);
      return [];
    }
  }
  ```

- [ ] **5.2** Add `batchGetStoredTranslations` for optimized batch queries:
  ```typescript
  /**
   * Get stored translations for multiple entities of the same type
   * @param entityType - Type of entities
   * @param entityIds - Array of entity UUIDs (or tag_keys for tags)
   * @returns Map of entityId to array of stored translations
   */
  async function batchGetStoredTranslations(
    entityType: EntityType,
    entityIds: string[]
  ): Promise<Map<string, StoredTranslation[]>> {
    if (entityIds.length === 0) {
      return new Map();
    }

    const tableName = getTranslationTableName(entityType);
    const idColumn = getTranslationIdColumn(entityType);

    try {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select(`${idColumn}, language, translation_status, translated_at, reviewed_by, created_at`)
        .in(idColumn, entityIds);

      if (error) {
        console.error(`${LOG_PREFIX} Failed to batch get stored translations`, error);
        return new Map();
      }

      // Group results by entity ID
      const result = new Map<string, StoredTranslation[]>();
      for (const row of data || []) {
        const id = row[idColumn] as string;
        if (!result.has(id)) {
          result.set(id, []);
        }
        result.get(id)!.push({
          language: row.language,
          translation_status: row.translation_status,
          translated_at: row.translated_at,
          reviewed_by: row.reviewed_by,
          created_at: row.created_at,
        });
      }

      return result;
    } catch (err) {
      console.error(`${LOG_PREFIX} Exception batch getting stored translations`, err);
      return new Map();
    }
  }
  ```

- [ ] **5.3** Write unit tests for stored translation retrieval:
  ```typescript
  describe('getStoredTranslations', () => {
    test('queries correct table with correct ID column for items', async () => {
      // Verify query goes to item_translations with item_id
    });

    test('queries correct table with correct ID column for tags', async () => {
      // Verify query goes to tag_translations with tag_key
    });

    test('returns empty array on database error', async () => {
      // Mock error and verify empty array returned
    });
  });
  ```

**Acceptance Criteria:**
- Single entity query uses correct table and ID column for each entity type
- Batch query efficiently retrieves translations for multiple entities in one query
- Results are properly grouped by entity ID in batch queries
- Empty array returned on errors (graceful degradation)

---

## 6. Implement Batch Job Query Helper

**Context:** The batch status function needs to efficiently query jobs for multiple entities. This helper extends the existing `getJobsByEntity` to handle batch queries.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **6.1** Add `batchGetJobsByEntities` async helper function:
  ```typescript
  /**
   * Get translation jobs for multiple entities of the same type
   * @param entityType - Type of entities
   * @param entityIds - Array of entity UUIDs
   * @returns Map of entityId to array of translation jobs
   */
  async function batchGetJobsByEntities(
    entityType: EntityType,
    entityIds: string[]
  ): Promise<Map<string, TranslationJob[]>> {
    if (entityIds.length === 0) {
      return new Map();
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('translation_jobs')
        .select('*')
        .eq('entity_type', entityType)
        .in('entity_id', entityIds);

      if (error) {
        console.error(`${LOG_PREFIX} Failed to batch get jobs`, error);
        return new Map();
      }

      // Group results by entity ID
      const result = new Map<string, TranslationJob[]>();
      for (const row of data || []) {
        const id = row.entity_id;
        if (!result.has(id)) {
          result.set(id, []);
        }
        result.get(id)!.push({
          id: row.id,
          entityType: row.entity_type as EntityType,
          entityId: row.entity_id,
          sourceLanguage: row.source_language as SupportedLanguage,
          targetLanguage: row.target_language as SupportedLanguage,
          status: row.status as TranslationJob['status'],
          attempts: row.attempts ?? 0,
          errorMessage: row.error_message,
          createdAt: row.created_at,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          lockedBy: row.locked_by,
          lockedAt: row.locked_at,
        });
      }

      return result;
    } catch (err) {
      console.error(`${LOG_PREFIX} Exception batch getting jobs`, err);
      return new Map();
    }
  }
  ```

- [ ] **6.2** Write unit test for batch job retrieval:
  ```typescript
  describe('batchGetJobsByEntities', () => {
    test('returns empty map for empty entity IDs array', async () => {
      const result = await batchGetJobsByEntities('item', []);
      expect(result.size).toBe(0);
    });

    test('groups jobs correctly by entity ID', async () => {
      // Mock multiple jobs for different entities
      // Verify correct grouping
    });
  });
  ```

**Acceptance Criteria:**
- Function returns empty Map for empty input array
- Jobs are correctly mapped to TranslationJob interface
- Jobs are grouped by entity ID in the result Map
- Errors are logged but do not throw (returns empty Map)

---

## 7. Implement Language Status Calculation Helper

**Context:** This function determines the status of a single language translation by examining both the job queue status and stored translation record. The status priority is defined in the overview document.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **7.1** Add `calculateLanguageStatus` helper function:
  ```typescript
  /**
   * Calculate status for a single language based on job and stored translation
   * @param job - Translation job for this language (if exists)
   * @param stored - Stored translation record for this language (if exists)
   * @returns Language translation status
   */
  function calculateLanguageStatus(
    job: TranslationJob | undefined,
    stored: StoredTranslation | undefined
  ): LanguageTranslationStatus {
    // Priority 1: Job is pending or processing
    if (job && (job.status === 'queued' || job.status === 'processing')) {
      return {
        status: 'pending',
        jobId: job.id,
      };
    }

    // Priority 2: Has stored translation
    if (stored) {
      const status = stored.translation_status;
      if (status === 'completed') {
        return {
          status: 'completed',
          translatedAt: stored.translated_at || stored.created_at || undefined,
        };
      }
      if (status === 'manual') {
        return {
          status: 'manual',
          translatedAt: stored.translated_at || stored.created_at || undefined,
          reviewedBy: stored.reviewed_by || undefined,
        };
      }
      if (status === 'failed') {
        return {
          status: 'failed',
          translatedAt: stored.translated_at || stored.created_at || undefined,
        };
      }
      // Other stored statuses (pending, processing) treated as pending
      return {
        status: 'pending',
      };
    }

    // Priority 3: Job failed and no stored translation
    if (job && job.status === 'failed') {
      return {
        status: 'failed',
        error: job.errorMessage || 'Translation failed',
        jobId: job.id,
      };
    }

    // Priority 4: No job and no translation
    return { status: 'missing' };
  }
  ```

- [ ] **7.2** Write comprehensive unit tests for language status calculation:
  ```typescript
  describe('calculateLanguageStatus', () => {
    test('returns pending with jobId when job is queued', () => {
      const job = { id: 'job-1', status: 'queued' } as TranslationJob;
      const result = calculateLanguageStatus(job, undefined);
      expect(result.status).toBe('pending');
      expect(result.jobId).toBe('job-1');
    });

    test('returns pending with jobId when job is processing', () => {
      const job = { id: 'job-2', status: 'processing' } as TranslationJob;
      const result = calculateLanguageStatus(job, undefined);
      expect(result.status).toBe('pending');
      expect(result.jobId).toBe('job-2');
    });

    test('returns completed with timestamp when stored translation is completed', () => {
      const stored = { translation_status: 'completed', translated_at: '2026-01-19T10:00:00Z' } as StoredTranslation;
      const result = calculateLanguageStatus(undefined, stored);
      expect(result.status).toBe('completed');
      expect(result.translatedAt).toBe('2026-01-19T10:00:00Z');
    });

    test('returns manual with reviewedBy when stored translation is manual', () => {
      const stored = { translation_status: 'manual', reviewed_by: 'user-123', translated_at: '2026-01-19T11:00:00Z' } as StoredTranslation;
      const result = calculateLanguageStatus(undefined, stored);
      expect(result.status).toBe('manual');
      expect(result.reviewedBy).toBe('user-123');
    });

    test('returns failed with error when job failed and no stored translation', () => {
      const job = { id: 'job-3', status: 'failed', errorMessage: 'Rate limit exceeded' } as TranslationJob;
      const result = calculateLanguageStatus(job, undefined);
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Rate limit exceeded');
    });

    test('returns missing when no job and no stored translation', () => {
      const result = calculateLanguageStatus(undefined, undefined);
      expect(result.status).toBe('missing');
    });

    test('stored translation takes precedence over completed job', () => {
      const job = { id: 'job-4', status: 'completed' } as TranslationJob;
      const stored = { translation_status: 'completed', translated_at: '2026-01-19T12:00:00Z' } as StoredTranslation;
      const result = calculateLanguageStatus(job, stored);
      expect(result.status).toBe('completed');
      expect(result.translatedAt).toBe('2026-01-19T12:00:00Z');
    });
  });
  ```

**Acceptance Criteria:**
- Pending/processing jobs return 'pending' status with jobId
- Stored completed translations return 'completed' with timestamp
- Stored manual translations return 'manual' with reviewedBy
- Failed jobs without stored translation return 'failed' with error
- No job and no translation returns 'missing'
- All unit tests pass

---

## 8. Implement Overall Status Calculation Helper

**Context:** This function aggregates individual language statuses into overall status categories and arrays for the final result.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **8.1** Add `calculateOverallStatus` helper function:
  ```typescript
  /**
   * Calculate overall status from language statuses
   * @param languageStatuses - Map of language code to status
   * @returns Object with overall status and categorized language arrays
   */
  function calculateOverallStatus(
    languageStatuses: Partial<Record<SupportedLanguage, LanguageTranslationStatus>>
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
      const language = lang as SupportedLanguage;
      switch (status.status) {
        case 'completed':
        case 'manual':
          completed.push(language);
          break;
        case 'pending':
          pending.push(language);
          break;
        case 'failed':
          failed.push(language);
          break;
        case 'missing':
          missing.push(language);
          break;
      }
    }

    const totalTargets = Object.keys(languageStatuses).length;
    let overallStatus: TranslationStatusResult['overallStatus'];

    if (completed.length === totalTargets && totalTargets > 0) {
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

- [ ] **8.2** Write comprehensive unit tests for overall status calculation:
  ```typescript
  describe('calculateOverallStatus', () => {
    test('returns complete when all languages are completed', () => {
      const statuses = {
        fr: { status: 'completed' },
        es: { status: 'completed' },
        de: { status: 'manual' },
      } as Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
      const result = calculateOverallStatus(statuses);
      expect(result.overallStatus).toBe('complete');
      expect(result.completedLanguages).toEqual(['fr', 'es', 'de']);
    });

    test('returns partial when some languages completed and some pending', () => {
      const statuses = {
        fr: { status: 'completed' },
        es: { status: 'pending' },
        de: { status: 'missing' },
      } as Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
      const result = calculateOverallStatus(statuses);
      expect(result.overallStatus).toBe('partial');
    });

    test('returns pending when all languages are pending or missing', () => {
      const statuses = {
        fr: { status: 'pending' },
        es: { status: 'missing' },
      } as Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
      const result = calculateOverallStatus(statuses);
      expect(result.overallStatus).toBe('pending');
    });

    test('returns failed when some failed and none completed', () => {
      const statuses = {
        fr: { status: 'failed' },
        es: { status: 'failed' },
        de: { status: 'missing' },
      } as Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
      const result = calculateOverallStatus(statuses);
      expect(result.overallStatus).toBe('failed');
    });

    test('returns partial when some failed but some completed', () => {
      const statuses = {
        fr: { status: 'completed' },
        es: { status: 'failed' },
      } as Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
      const result = calculateOverallStatus(statuses);
      expect(result.overallStatus).toBe('partial');
    });
  });
  ```

**Acceptance Criteria:**
- 'complete' returned when all target languages have completed/manual status
- 'partial' returned when some completed and some pending/failed/missing
- 'pending' returned when none completed but some pending
- 'failed' returned when some failed and none completed
- Language arrays correctly categorize each language

---

## 9. Implement getEntityTranslationStatus Main Function

**Context:** This is the primary public function that aggregates job queue status with stored translations for a single entity.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **9.1** Add the `getEntityTranslationStatus` export function:
  ```typescript
  /**
   * Get comprehensive translation status for a single entity
   *
   * Queries both translation_jobs and the appropriate translation table
   * to aggregate current status across all target languages.
   *
   * @param entityType - Type of entity ('item', 'article', 'link', 'tag')
   * @param entityId - UUID of the entity (or tag_key for tags)
   * @returns Promise resolving to TranslationStatusResult
   * @throws Error if entityType is invalid
   */
  export async function getEntityTranslationStatus(
    entityType: EntityType,
    entityId: string
  ): Promise<TranslationStatusResult> {
    // Validate entity type
    if (!isValidEntityType(entityType)) {
      throw new Error(`Invalid entity type: ${entityType}. Must be 'item', 'article', 'link', or 'tag'.`);
    }

    console.log(`${LOG_PREFIX} Getting translation status for ${entityType}:${entityId}`);

    // 1. Determine source language
    const sourceLanguage = await getEntitySourceLanguage(entityType, entityId);

    // 2. Get target languages (all supported except source)
    const targetLanguages = getOtherLanguages(sourceLanguage);

    // 3. Query translation_jobs for this entity
    const jobsResult = await getJobsByEntity(entityType, entityId);
    const jobs = jobsResult.success ? jobsResult.data || [] : [];

    // 4. Query translation table for stored translations
    const storedTranslations = await getStoredTranslations(entityType, entityId);

    // 5. Aggregate status per language
    const languageStatuses: Partial<Record<SupportedLanguage, LanguageTranslationStatus>> = {};

    for (const lang of targetLanguages) {
      const job = jobs.find(j => j.targetLanguage === lang);
      const stored = storedTranslations.find(t => t.language === lang);
      languageStatuses[lang] = calculateLanguageStatus(job, stored);
    }

    // 6. Calculate overall status
    const {
      overallStatus,
      completedLanguages,
      pendingLanguages,
      failedLanguages,
      missingLanguages,
    } = calculateOverallStatus(languageStatuses);

    console.log(`${LOG_PREFIX} Status for ${entityType}:${entityId} - ${overallStatus}`, {
      completed: completedLanguages.length,
      pending: pendingLanguages.length,
      failed: failedLanguages.length,
      missing: missingLanguages.length,
    });

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

- [ ] **9.2** Write integration tests for `getEntityTranslationStatus`:
  ```typescript
  describe('getEntityTranslationStatus', () => {
    test('throws error for invalid entity type', async () => {
      await expect(getEntityTranslationStatus('invalid' as EntityType, 'test-id'))
        .rejects.toThrow('Invalid entity type');
    });

    test('returns complete status when all translations exist', async () => {
      // Set up mock data with completed translations for all languages
      const result = await getEntityTranslationStatus('item', 'item-with-all-translations');
      expect(result.overallStatus).toBe('complete');
      expect(result.completedLanguages.length).toBe(5); // All non-source languages
    });

    test('returns pending status when jobs are queued', async () => {
      // Set up mock data with queued jobs
      const result = await getEntityTranslationStatus('article', 'article-with-pending-jobs');
      expect(result.overallStatus).toBe('pending');
      expect(result.pendingLanguages.length).toBeGreaterThan(0);
    });

    test('returns partial status with mixed translations', async () => {
      // Set up mock data with some completed, some pending
      const result = await getEntityTranslationStatus('link', 'link-with-partial-translations');
      expect(result.overallStatus).toBe('partial');
    });
  });
  ```

**Acceptance Criteria:**
- Function validates entity type and throws descriptive error for invalid types
- Function correctly queries both job queue and translation tables
- Function returns properly structured TranslationStatusResult
- All acceptance criteria from REQ-264 requirements are met
- Integration tests pass

---

## 10. Implement getBatchTranslationStatus Function

**Context:** This function efficiently retrieves status for multiple entities by grouping queries by entity type and using batch queries.
**Files to modify:** `/src/lib/content-translation/storage/translation-status.ts`
**Estimated effort:** 1 story point

- [ ] **10.1** Add utility function to group entities by type:
  ```typescript
  /**
   * Group entities by their type for efficient batch processing
   * @param entities - Array of entity identifiers
   * @returns Map of entity type to array of entity IDs
   */
  function groupEntitiesByType(entities: EntityIdentifier[]): Map<EntityType, string[]> {
    const grouped = new Map<EntityType, string[]>();
    for (const entity of entities) {
      if (!grouped.has(entity.type)) {
        grouped.set(entity.type, []);
      }
      grouped.get(entity.type)!.push(entity.id);
    }
    return grouped;
  }
  ```

- [ ] **10.2** Add the `getBatchTranslationStatus` export function:
  ```typescript
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
  ): Promise<TranslationStatusResult[]> {
    // Handle empty input
    if (entities.length === 0) {
      return [];
    }

    console.log(`${LOG_PREFIX} Getting batch translation status for ${entities.length} entities`);

    // Validate all entity types
    for (const entity of entities) {
      if (!isValidEntityType(entity.type)) {
        throw new Error(`Invalid entity type: ${entity.type}. Must be 'item', 'article', 'link', or 'tag'.`);
      }
    }

    // Group entities by type for efficient batch queries
    const groupedByType = groupEntitiesByType(entities);

    // Process each entity type in parallel
    const resultsByKey = new Map<string, TranslationStatusResult>();

    await Promise.all(
      Array.from(groupedByType.entries()).map(async ([entityType, entityIds]) => {
        // Batch query jobs for all entities of this type
        const jobsMap = await batchGetJobsByEntities(entityType, entityIds);

        // Batch query translations for all entities of this type
        const translationsMap = await batchGetStoredTranslations(entityType, entityIds);

        // Process each entity
        for (const entityId of entityIds) {
          const jobs = jobsMap.get(entityId) || [];
          const storedTranslations = translationsMap.get(entityId) || [];

          // Determine source language (simplified for batch - default to 'en' for efficiency)
          // For more accurate results, could batch query source languages
          const sourceLanguage: SupportedLanguage = entityType === 'tag' ? 'en' : 'en';
          const targetLanguages = getOtherLanguages(sourceLanguage);

          // Aggregate status per language
          const languageStatuses: Partial<Record<SupportedLanguage, LanguageTranslationStatus>> = {};
          for (const lang of targetLanguages) {
            const job = jobs.find(j => j.targetLanguage === lang);
            const stored = storedTranslations.find(t => t.language === lang);
            languageStatuses[lang] = calculateLanguageStatus(job, stored);
          }

          // Calculate overall status
          const {
            overallStatus,
            completedLanguages,
            pendingLanguages,
            failedLanguages,
            missingLanguages,
          } = calculateOverallStatus(languageStatuses);

          // Store result with composite key
          const key = `${entityType}:${entityId}`;
          resultsByKey.set(key, {
            entityId,
            entityType,
            sourceLanguage,
            overallStatus,
            translations: languageStatuses,
            completedLanguages,
            pendingLanguages,
            failedLanguages,
            missingLanguages,
          });
        }
      })
    );

    // Return results in same order as input
    const results: TranslationStatusResult[] = entities.map(entity => {
      const key = `${entity.type}:${entity.id}`;
      const result = resultsByKey.get(key);
      if (!result) {
        // Return a "missing" result for entities that weren't found
        const targetLanguages = getOtherLanguages('en');
        const emptyStatuses: Partial<Record<SupportedLanguage, LanguageTranslationStatus>> = {};
        for (const lang of targetLanguages) {
          emptyStatuses[lang] = { status: 'missing' };
        }
        return {
          entityId: entity.id,
          entityType: entity.type,
          sourceLanguage: 'en' as SupportedLanguage,
          overallStatus: 'pending' as const,
          translations: emptyStatuses,
          completedLanguages: [],
          pendingLanguages: [],
          failedLanguages: [],
          missingLanguages: targetLanguages,
        };
      }
      return result;
    });

    console.log(`${LOG_PREFIX} Batch status complete for ${entities.length} entities`);

    return results;
  }
  ```

- [ ] **10.3** Write integration tests for `getBatchTranslationStatus`:
  ```typescript
  describe('getBatchTranslationStatus', () => {
    test('returns empty array for empty input', async () => {
      const result = await getBatchTranslationStatus([]);
      expect(result).toEqual([]);
    });

    test('throws error for invalid entity type in batch', async () => {
      const entities = [
        { type: 'item' as EntityType, id: 'item-1' },
        { type: 'invalid' as EntityType, id: 'invalid-1' },
      ];
      await expect(getBatchTranslationStatus(entities)).rejects.toThrow('Invalid entity type');
    });

    test('returns results in same order as input', async () => {
      const entities = [
        { type: 'item' as EntityType, id: 'item-a' },
        { type: 'article' as EntityType, id: 'article-b' },
        { type: 'item' as EntityType, id: 'item-c' },
      ];
      const results = await getBatchTranslationStatus(entities);
      expect(results.length).toBe(3);
      expect(results[0].entityId).toBe('item-a');
      expect(results[1].entityId).toBe('article-b');
      expect(results[2].entityId).toBe('item-c');
    });

    test('handles mixed entity types efficiently', async () => {
      const entities = [
        { type: 'item' as EntityType, id: 'item-1' },
        { type: 'article' as EntityType, id: 'article-1' },
        { type: 'link' as EntityType, id: 'link-1' },
        { type: 'tag' as EntityType, id: 'tag-key-1' },
      ];
      const results = await getBatchTranslationStatus(entities);
      expect(results.length).toBe(4);
      // Verify each result has the correct structure
      for (const result of results) {
        expect(result).toHaveProperty('entityId');
        expect(result).toHaveProperty('entityType');
        expect(result).toHaveProperty('overallStatus');
        expect(result).toHaveProperty('translations');
      }
    });
  });
  ```

**Acceptance Criteria:**
- Returns empty array for empty input
- Validates all entity types before processing
- Groups entities by type for efficient batch queries
- Returns results in same order as input array
- Handles entities not found in database (returns 'missing' status)
- All acceptance criteria from REQ-264 batch function requirements are met

---

## 11. Export Functions from Module Index

**Context:** The content-translation module index needs to export the new status utilities and types for use by other modules.
**Files to modify:** `/src/lib/content-translation/index.ts`
**Estimated effort:** 1 story point

- [ ] **11.1** Create or update `/src/lib/content-translation/index.ts` to export status utilities:
  ```typescript
  /**
   * Content Translation Module
   * Part of L10N Epic 3: Dynamic Content Translation
   *
   * This module provides utilities for translating user-generated content
   * including items, articles, links, and tags.
   *
   * @module content-translation
   */

  // Translation Status Utilities (REQ-341 / REQ-264)
  export {
    getEntityTranslationStatus,
    getBatchTranslationStatus,
  } from './storage/translation-status';

  // Translation Status Types (REQ-341 / REQ-264)
  export type {
    LanguageTranslationStatus,
    TranslationStatusResult,
    EntityIdentifier,
  } from './storage/translation-status';
  ```

- [ ] **11.2** If the index file already exists with other exports, add the new exports without removing existing ones

- [ ] **11.3** Verify exports work correctly by creating a test import:
  ```typescript
  // Test file to verify exports work
  import {
    getEntityTranslationStatus,
    getBatchTranslationStatus,
    LanguageTranslationStatus,
    TranslationStatusResult,
    EntityIdentifier,
  } from '@/lib/content-translation';
  ```

- [ ] **11.4** Run TypeScript compilation to verify no export errors:
  ```bash
  npx tsc --noEmit
  ```

**Acceptance Criteria:**
- All public functions are exported from module index
- All public types are exported from module index
- Imports work from `@/lib/content-translation` path alias
- TypeScript compilation succeeds with no errors

---

## 12. Write Integration Tests

**Context:** Integration tests verify the complete flow of the status utilities with database interaction.
**Files to modify:** `/src/lib/content-translation/storage/__tests__/translation-status.integration.test.ts` (CREATE)
**Estimated effort:** 1 story point

- [ ] **12.1** Create test file `/src/lib/content-translation/storage/__tests__/translation-status.integration.test.ts`:
  ```typescript
  /**
   * Integration Tests for Translation Status Utilities
   * REQ-341 (REQ-264): Implement Translation Status Utilities
   */
  import { describe, test, expect, beforeAll, afterAll } from 'vitest';
  import {
    getEntityTranslationStatus,
    getBatchTranslationStatus,
  } from '../translation-status';

  describe('Translation Status Utilities - Integration Tests', () => {
    // Setup test data before tests
    beforeAll(async () => {
      // Create test entities and translations in database
    });

    // Cleanup test data after tests
    afterAll(async () => {
      // Remove test entities and translations
    });

    describe('getEntityTranslationStatus', () => {
      test('returns correct status for entity with no translations', async () => {
        const result = await getEntityTranslationStatus('item', 'test-item-no-translations');
        expect(result.overallStatus).toBe('pending');
        expect(result.missingLanguages.length).toBe(5);
      });

      test('returns correct status for entity with partial translations', async () => {
        const result = await getEntityTranslationStatus('item', 'test-item-partial');
        expect(result.overallStatus).toBe('partial');
        expect(result.completedLanguages.length).toBeGreaterThan(0);
        expect(result.missingLanguages.length).toBeGreaterThan(0);
      });

      test('returns correct status for entity with all translations', async () => {
        const result = await getEntityTranslationStatus('item', 'test-item-complete');
        expect(result.overallStatus).toBe('complete');
        expect(result.completedLanguages.length).toBe(5);
      });
    });

    describe('getBatchTranslationStatus', () => {
      test('handles batch of 50+ entities within 2 seconds', async () => {
        const entities = Array.from({ length: 50 }, (_, i) => ({
          type: 'item' as const,
          id: `test-item-${i}`,
        }));

        const startTime = Date.now();
        const results = await getBatchTranslationStatus(entities);
        const duration = Date.now() - startTime;

        expect(results.length).toBe(50);
        expect(duration).toBeLessThan(2000);
      });
    });
  });
  ```

- [ ] **12.2** Run integration tests:
  ```bash
  npm run test -- src/lib/content-translation/storage/__tests__/translation-status.integration.test.ts
  ```

**Acceptance Criteria:**
- Integration tests cover all major scenarios
- Tests use real database connections (mocked or test database)
- Batch query performance test completes within 2 seconds for 50 entities
- All integration tests pass

---

## 13. Final Verification and Documentation

**Context:** Final verification ensures all acceptance criteria are met and the implementation is production-ready.
**Files to modify:** None (verification only)
**Estimated effort:** 1 story point

- [ ] **13.1** Run all unit tests:
  ```bash
  npm run test -- src/lib/content-translation/storage/__tests__/
  ```

- [ ] **13.2** Run TypeScript type checking:
  ```bash
  npx tsc --noEmit
  ```

- [ ] **13.3** Run linting:
  ```bash
  npm run lint -- src/lib/content-translation/
  ```

- [ ] **13.4** Verify all acceptance criteria from REQ-264:
  - [ ] `getEntityTranslationStatus` accepts entity type and entity identifier parameters
  - [ ] Function queries translation job queue to identify pending/in-progress jobs
  - [ ] Function queries appropriate translation storage table for completed translations
  - [ ] Returns `TranslationStatusResult` indicating completed, pending, and missing languages
  - [ ] `TranslationStatusResult` includes timestamp metadata for when translations were last updated
  - [ ] `getBatchTranslationStatus` accepts array of entity type and identifier pairs
  - [ ] Batch function returns array of `TranslationStatusResult` objects maintaining input order
  - [ ] Batch function optimizes database queries to minimize round trips
  - [ ] Both functions handle database query errors gracefully

- [ ] **13.5** Update module JSDoc with usage examples:
  ```typescript
  /**
   * @example
   * // Get status for a single item
   * const status = await getEntityTranslationStatus('item', 'item-uuid');
   * console.log(status.overallStatus); // 'complete' | 'partial' | 'pending' | 'failed'
   *
   * @example
   * // Get status for multiple entities
   * const statuses = await getBatchTranslationStatus([
   *   { type: 'item', id: 'item-1' },
   *   { type: 'article', id: 'article-1' },
   * ]);
   */
  ```

**Acceptance Criteria:**
- All unit tests pass
- All integration tests pass
- TypeScript compilation succeeds with no errors
- Linting passes with no errors
- All REQ-264 acceptance criteria verified
- Module documentation includes usage examples

---

## Dependencies Summary

### This Task Depends On:
- REQ-227: Translation table TypeScript types in `src/lib/supabase.ts`
- REQ-243: Job queue functions (`getJobsByEntity`) in `src/lib/job-queue/`
- REQ-235: Translation service types (`getOtherLanguages`) in `src/lib/translation-service/`
- Epic 1 (Plan-110): Translation tables must exist in database

### Tasks That Depend On This:
- Task 4.1 (REQ-328): Translation status API endpoint will use `getEntityTranslationStatus`
- Task 4.4 (REQ-331): Batch status endpoint will use `getBatchTranslationStatus`
- Epic 5: Owner translation management UI will consume status data

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Batch query performance degradation with many entities | Implement pagination, add query limits, monitor query execution time |
| Race conditions between job completion and status query | Status reflects point-in-time snapshot; document this behavior |
| Missing source_language column for tags | Default to 'en' for tags; documented in code |
| Type mismatches with existing code | Align with existing patterns in job-queue and translation-service modules |

---

## File Structure After Implementation

```
/src/lib/content-translation/
├── index.ts                              # Module exports (MODIFIED)
└── storage/
    ├── translation-status.ts             # NEW: Status utilities
    └── __tests__/
        ├── translation-status.test.ts    # NEW: Unit tests
        └── translation-status.integration.test.ts  # NEW: Integration tests
```

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task: 1.6 - Implement Translation Status Utilities*
*Request Reference: REQ-341 (originally REQ-264)*
