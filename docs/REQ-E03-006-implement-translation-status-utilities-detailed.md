# Detailed Task Breakdown: REQ-E03-006 - Implement Translation Status Utilities

**Request ID:** REQ-E03-006
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.6
**Type:** NEW FEATURE
**Size:** M
**Created:** 2026-01-20
**Last Modified:** 2026-01-21

---

## Document Purpose

This document provides granular, step-by-step implementation tasks for REQ-E03-006. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites

Before starting implementation, verify:

1. **Epic 1 Foundation Complete:**
   - [x] Translation tables exist (`item_translations`, `article_translations`, `link_translations`, `tag_translations`, `translation_jobs`)
   - [x] Job queue module exists at `/src/lib/job-queue/`
   - [x] `getJobsByEntity()` function available in `/src/lib/job-queue/translation-jobs.ts:602`

2. **Task 1.5 Dependency:**
   - [x] Translation storage utilities at `/src/lib/content-translation/storage/translation-storage.ts` (implemented)

3. **Required Imports Available:**
   - [x] `supabaseAdmin` from `/src/lib/supabase.ts`
   - [x] `TranslationJob`, `EntityType`, `SupportedLanguage`, `JobStatus` from `/src/lib/job-queue/translation-jobs.types.ts`
   - [x] `getJobsByEntity` from `/src/lib/job-queue/translation-jobs.ts`

---

## Task Breakdown

### Task 1: Create translation-status.ts file with imports and constants
**Size:** XS | **Priority:** Required | **Estimated:** 10 min

**Objective:** Create the new file with proper imports and constants.

**File to Create:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Create the directory structure if it doesn't exist:
   ```
   /src/lib/content-translation/
   └── storage/
       └── translation-status.ts
   ```

2. Add file header comment:
   ```typescript
   /**
    * Translation Status Utilities
    * Part of REQ-E03-006: Implement Translation Status Utilities
    * Epic 3 - Dynamic Content Translation
    *
    * Provides functions to aggregate translation job status with stored
    * translation records to report comprehensive translation status.
    */
   ```

3. Add imports:
   ```typescript
   import { supabaseAdmin } from '@/lib/supabase';
   import {
     TranslationJob,
     EntityType,
     SupportedLanguage,
     JobStatus,
   } from '@/lib/job-queue/translation-jobs.types';
   import { getJobsByEntity } from '@/lib/job-queue/translation-jobs';
   ```

4. Add constants:
   ```typescript
   /** All supported target languages for translation */
   const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

   /** Log prefix for consistent logging */
   const LOG_PREFIX = '[TranslationStatus]';
   ```

**Verification:**
- File exists at correct path
- No TypeScript errors on imports
- Build succeeds

---

### Task 2: Define TypeScript type definitions
**Size:** S | **Priority:** Required | **Estimated:** 15 min

**Objective:** Define all type interfaces for status utilities.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add `LanguageStatus` type (after constants):
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
   ```

2. Add `OverallStatus` type:
   ```typescript
   /**
    * Overall translation status for an entity
    */
   export type OverallStatus =
     | 'complete'      // All languages translated
     | 'partial'       // Some languages translated
     | 'pending'       // Translations in progress, none failed
     | 'failed';       // One or more translations failed
   ```

3. Add `LanguageTranslationStatus` interface:
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
   ```

4. Add `TranslationStatusResult` interface:
   ```typescript
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
     byLanguage: Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
     /** Timestamp of most recent translation update */
     lastUpdatedAt?: string;
   }
   ```

5. Add `StatusQueryResult` interface:
   ```typescript
   /**
    * Result type for status operations
    */
   export interface StatusQueryResult<T> {
     success: boolean;
     data?: T;
     error?: string;
   }
   ```

6. Add internal type for translation records:
   ```typescript
   /**
    * Internal type for translation record from database
    */
   interface TranslationRecord {
     language: SupportedLanguage;
     translation_status?: string;
     translated_at?: string;
   }
   ```

**Verification:**
- All types exported
- No TypeScript errors
- Build succeeds

---

### Task 3: Implement getTargetLanguages() helper
**Size:** XS | **Priority:** Required | **Estimated:** 5 min

**Objective:** Create helper to get all languages except source.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add helper function:
   ```typescript
   /**
    * Get all target languages excluding the source language
    *
    * @param sourceLanguage - The source language to exclude
    * @returns Array of target languages
    */
   function getTargetLanguages(sourceLanguage: SupportedLanguage | null): SupportedLanguage[] {
     if (!sourceLanguage) {
       // If no source language, return all languages except 'en' (default source)
       return ALL_LANGUAGES.filter(lang => lang !== 'en');
     }
     return ALL_LANGUAGES.filter(lang => lang !== sourceLanguage);
   }
   ```

**Verification:**
- `getTargetLanguages('en')` returns `['fr', 'es', 'de', 'nl', 'it']`
- `getTargetLanguages('fr')` returns `['en', 'es', 'de', 'nl', 'it']`
- `getTargetLanguages(null)` returns `['fr', 'es', 'de', 'nl', 'it']`

---

### Task 4: Implement determineLanguageStatus() helper
**Size:** S | **Priority:** Required | **Estimated:** 15 min

**Objective:** Create helper that determines status for a single language.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add helper function:
   ```typescript
   /**
    * Determine the translation status for a specific language
    * Priority: translation record status > job status > not_started
    *
    * @param job - Translation job for this language (if any)
    * @param translationRecord - Stored translation record (if any)
    * @returns The determined language status
    */
   function determineLanguageStatus(
     job: TranslationJob | undefined,
     translationRecord: TranslationRecord | undefined
   ): LanguageStatus {
     // Priority 1: Check translation record first (source of truth for completed/manual)
     if (translationRecord) {
       const recordStatus = translationRecord.translation_status;
       if (recordStatus === 'manual') {
         return 'manual';
       }
       if (recordStatus === 'completed') {
         return 'completed';
       }
       // For other record statuses, defer to job status if available
     }

     // Priority 2: Check job status
     if (!job) {
       // No job and no completed record = not started
       return translationRecord ? 'completed' : 'not_started';
     }

     switch (job.status) {
       case 'completed':
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

**Verification:**
- Returns `'manual'` when record has `translation_status: 'manual'`
- Returns `'completed'` when record has `translation_status: 'completed'`
- Returns `'pending'` when job status is `'queued'`
- Returns `'processing'` when job status is `'processing'`
- Returns `'failed'` when job status is `'failed'`
- Returns `'not_started'` when no job and no record

---

### Task 5: Implement determineOverallStatus() helper
**Size:** S | **Priority:** Required | **Estimated:** 10 min

**Objective:** Create helper that determines overall status from counts.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add helper function:
   ```typescript
   /**
    * Determine the overall translation status based on language counts
    *
    * @param completedCount - Number of completed translations
    * @param failedCount - Number of failed translations
    * @param inProgressCount - Number of in-progress translations
    * @param totalLanguages - Total number of target languages
    * @returns The overall status
    */
   function determineOverallStatus(
     completedCount: number,
     failedCount: number,
     inProgressCount: number,
     totalLanguages: number
   ): OverallStatus {
     // All completed (including manual)?
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
     // Nothing completed, but in progress or not started
     return 'pending';
   }
   ```

**Verification:**
- Returns `'complete'` when `completedCount >= totalLanguages`
- Returns `'failed'` when `failedCount > 0`
- Returns `'partial'` when `completedCount > 0` and not complete
- Returns `'pending'` when no completions

---

### Task 6: Implement translation record fetch functions (4 entity types)
**Size:** M | **Priority:** Required | **Estimated:** 30 min

**Objective:** Create internal functions to fetch translation records from each entity-specific table.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add item translations fetch function:
   ```typescript
   /**
    * Fetch translation records for items
    * @internal
    */
   async function fetchItemTranslations(itemIds: string[]): Promise<TranslationRecord[]> {
     if (itemIds.length === 0) return [];

     const { data, error } = await supabaseAdmin
       .from('item_translations')
       .select('item_id, language, translation_status, translated_at')
       .in('item_id', itemIds);

     if (error) {
       console.error(`${LOG_PREFIX} Failed to fetch item translations:`, error);
       return [];
     }

     return (data || []).map(row => ({
       entityId: row.item_id,
       language: row.language as SupportedLanguage,
       translation_status: row.translation_status,
       translated_at: row.translated_at,
     }));
   }
   ```

2. Add article translations fetch function:
   ```typescript
   /**
    * Fetch translation records for articles
    * @internal
    */
   async function fetchArticleTranslations(articleIds: string[]): Promise<TranslationRecord[]> {
     if (articleIds.length === 0) return [];

     const { data, error } = await supabaseAdmin
       .from('article_translations')
       .select('article_id, language, translation_status, translated_at')
       .in('article_id', articleIds);

     if (error) {
       console.error(`${LOG_PREFIX} Failed to fetch article translations:`, error);
       return [];
     }

     return (data || []).map(row => ({
       entityId: row.article_id,
       language: row.language as SupportedLanguage,
       translation_status: row.translation_status,
       translated_at: row.translated_at,
     }));
   }
   ```

3. Add link translations fetch function:
   ```typescript
   /**
    * Fetch translation records for links
    * @internal
    */
   async function fetchLinkTranslations(linkIds: string[]): Promise<TranslationRecord[]> {
     if (linkIds.length === 0) return [];

     const { data, error } = await supabaseAdmin
       .from('link_translations')
       .select('link_id, language, translation_status, translated_at')
       .in('link_id', linkIds);

     if (error) {
       console.error(`${LOG_PREFIX} Failed to fetch link translations:`, error);
       return [];
     }

     return (data || []).map(row => ({
       entityId: row.link_id,
       language: row.language as SupportedLanguage,
       translation_status: row.translation_status,
       translated_at: row.translated_at,
     }));
   }
   ```

4. Add tag translations fetch function:
   ```typescript
   /**
    * Fetch translation records for tags
    * Note: tag_translations uses tag_key (string) not UUID
    * and doesn't have translation_status column
    * @internal
    */
   async function fetchTagTranslations(tagKeys: string[]): Promise<TranslationRecord[]> {
     if (tagKeys.length === 0) return [];

     const { data, error } = await supabaseAdmin
       .from('tag_translations')
       .select('tag_key, language, created_at')
       .in('tag_key', tagKeys);

     if (error) {
       console.error(`${LOG_PREFIX} Failed to fetch tag translations:`, error);
       return [];
     }

     // Tags don't have translation_status - presence means completed
     return (data || []).map(row => ({
       entityId: row.tag_key,
       language: row.language as SupportedLanguage,
       translation_status: 'completed', // Presence implies completed for tags
       translated_at: row.created_at,
     }));
   }
   ```

5. Update the TranslationRecord interface to include entityId:
   ```typescript
   /**
    * Internal type for translation record from database
    */
   interface TranslationRecord {
     entityId: string;
     language: SupportedLanguage;
     translation_status?: string;
     translated_at?: string;
   }
   ```

6. Add unified fetch function:
   ```typescript
   /**
    * Fetch translation records for a specific entity
    * Routes to the appropriate table based on entity type
    * @internal
    */
   async function fetchTranslationRecords(
     entityType: EntityType,
     entityIds: string[]
   ): Promise<TranslationRecord[]> {
     switch (entityType) {
       case 'item':
         return fetchItemTranslations(entityIds);
       case 'article':
         return fetchArticleTranslations(entityIds);
       case 'link':
         return fetchLinkTranslations(entityIds);
       case 'tag':
         return fetchTagTranslations(entityIds);
       default:
         console.warn(`${LOG_PREFIX} Unknown entity type: ${entityType}`);
         return [];
     }
   }
   ```

**Verification:**
- Each function returns correctly shaped data
- Empty array input returns empty array
- Database errors are logged but don't throw

---

### Task 7: Implement getEntityTranslationStatus() function
**Size:** M | **Priority:** Required | **Estimated:** 30 min

**Objective:** Implement the main single-entity status query function.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add the exported function:
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
   ): Promise<StatusQueryResult<TranslationStatusResult>> {
     try {
       console.log(`${LOG_PREFIX} Getting status for ${entityType}:${entityId}`);

       // 1. Fetch all translation jobs for this entity
       const jobsResult = await getJobsByEntity(entityType, entityId);
       const jobs = jobsResult.success ? jobsResult.data || [] : [];

       // 2. Fetch all translation records for this entity
       const translations = await fetchTranslationRecords(entityType, [entityId]);

       // 3. Determine source language from jobs (first job's source)
       const sourceLanguage = jobs.length > 0 ? jobs[0].sourceLanguage : null;

       // 4. Get target languages (all except source)
       const targetLanguages = getTargetLanguages(sourceLanguage);
       const totalLanguages = targetLanguages.length;

       // 5. Build per-language status
       const byLanguage: Partial<Record<SupportedLanguage, LanguageTranslationStatus>> = {};
       let completedCount = 0;
       let inProgressCount = 0;
       let failedCount = 0;
       let notStartedCount = 0;
       let lastUpdatedAt: string | undefined;

       for (const lang of targetLanguages) {
         const job = jobs.find(j => j.targetLanguage === lang);
         const translation = translations.find(t => t.language === lang);

         const status = determineLanguageStatus(job, translation);

         byLanguage[lang] = {
           status,
           job: job,
           lastError: job?.errorMessage || undefined,
           translatedAt: translation?.translated_at || undefined,
         };

         // Update counts
         switch (status) {
           case 'completed':
           case 'manual':
             completedCount++;
             break;
           case 'pending':
           case 'processing':
             inProgressCount++;
             break;
           case 'failed':
             failedCount++;
             break;
           default:
             notStartedCount++;
         }

         // Track most recent update
         if (translation?.translated_at) {
           if (!lastUpdatedAt || translation.translated_at > lastUpdatedAt) {
             lastUpdatedAt = translation.translated_at;
           }
         }
       }

       // 6. Calculate completion percentage
       const completionPercentage = totalLanguages > 0
         ? Math.round((completedCount / totalLanguages) * 100)
         : 0;

       // 7. Determine overall status
       const overallStatus = determineOverallStatus(
         completedCount,
         failedCount,
         inProgressCount,
         totalLanguages
       );

       const result: TranslationStatusResult = {
         entityType,
         entityId,
         sourceLanguage,
         totalLanguages,
         completedCount,
         inProgressCount,
         failedCount,
         notStartedCount,
         completionPercentage,
         overallStatus,
         byLanguage,
         lastUpdatedAt,
       };

       console.log(`${LOG_PREFIX} Status retrieved`, {
         entityType,
         entityId,
         overallStatus,
         completionPercentage,
       });

       return {
         success: true,
         data: result,
       };
     } catch (error) {
       const message = error instanceof Error ? error.message : 'Unknown error';
       console.error(`${LOG_PREFIX} Exception getting entity status:`, error);
       return {
         success: false,
         error: `Failed to get translation status: ${message}`,
       };
     }
   }
   ```

**Verification:**
- Returns success with data for valid entity
- Returns correct counts for each status type
- Returns correct completion percentage
- Returns error object on database failure
- Handles entities with no jobs gracefully

---

### Task 8: Implement batch job fetch function
**Size:** S | **Priority:** Required | **Estimated:** 15 min

**Objective:** Create function to fetch jobs for multiple entity IDs efficiently.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add batch job fetch function:
   ```typescript
   /**
    * Fetch translation jobs for multiple entity IDs of the same type
    * Uses IN clause for efficient batch query
    * @internal
    */
   async function fetchJobsForEntityIds(
     entityType: EntityType,
     entityIds: string[]
   ): Promise<TranslationJob[]> {
     if (entityIds.length === 0) return [];

     const { data, error } = await supabaseAdmin
       .from('translation_jobs')
       .select('*')
       .eq('entity_type', entityType)
       .in('entity_id', entityIds);

     if (error) {
       console.error(`${LOG_PREFIX} Failed to fetch jobs for ${entityType}s:`, error);
       return [];
     }

     // Map database rows to TranslationJob interface
     return (data || []).map(row => ({
       id: row.id,
       entityType: row.entity_type as EntityType,
       entityId: row.entity_id,
       sourceLanguage: row.source_language as SupportedLanguage,
       targetLanguage: row.target_language as SupportedLanguage,
       status: row.status as JobStatus,
       attempts: row.attempts ?? 0,
       errorMessage: row.error_message,
       createdAt: row.created_at,
       startedAt: row.started_at,
       completedAt: row.completed_at,
       lockedBy: row.locked_by,
       lockedAt: row.locked_at,
     }));
   }
   ```

**Verification:**
- Returns jobs for all entity IDs in single query
- Returns empty array for empty input
- Database errors are logged but don't throw

---

### Task 9: Implement getBatchTranslationStatus() function
**Size:** M | **Priority:** Required | **Estimated:** 40 min

**Objective:** Implement the batch status query function with optimized queries.

**File to Modify:** `/src/lib/content-translation/storage/translation-status.ts`

**Implementation Steps:**

1. Add the exported function:
   ```typescript
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
   ): Promise<StatusQueryResult<TranslationStatusResult[]>> {
     try {
       if (entities.length === 0) {
         return {
           success: true,
           data: [],
         };
       }

       console.log(`${LOG_PREFIX} Getting batch status for ${entities.length} entities`);

       // 1. Group entities by type for efficient batch queries
       const byType: Record<EntityType, string[]> = {
         item: [],
         article: [],
         link: [],
         tag: [],
       };

       entities.forEach(e => byType[e.type].push(e.id));

       // 2. Batch fetch jobs for each type (parallel)
       const [itemJobs, articleJobs, linkJobs, tagJobs] = await Promise.all([
         byType.item.length > 0 ? fetchJobsForEntityIds('item', byType.item) : [],
         byType.article.length > 0 ? fetchJobsForEntityIds('article', byType.article) : [],
         byType.link.length > 0 ? fetchJobsForEntityIds('link', byType.link) : [],
         byType.tag.length > 0 ? fetchJobsForEntityIds('tag', byType.tag) : [],
       ]);

       // 3. Batch fetch translation records for each type (parallel)
       const [itemTranslations, articleTranslations, linkTranslations, tagTranslations] = await Promise.all([
         byType.item.length > 0 ? fetchTranslationRecords('item', byType.item) : [],
         byType.article.length > 0 ? fetchTranslationRecords('article', byType.article) : [],
         byType.link.length > 0 ? fetchTranslationRecords('link', byType.link) : [],
         byType.tag.length > 0 ? fetchTranslationRecords('tag', byType.tag) : [],
       ]);

       // 4. Build lookup maps for efficient access
       const jobsByEntityKey = new Map<string, TranslationJob[]>();
       const translationsByEntityKey = new Map<string, TranslationRecord[]>();

       // Index jobs by entity key (type:id)
       [...itemJobs, ...articleJobs, ...linkJobs, ...tagJobs].forEach(job => {
         const key = `${job.entityType}:${job.entityId}`;
         const existing = jobsByEntityKey.get(key) || [];
         existing.push(job);
         jobsByEntityKey.set(key, existing);
       });

       // Index translations by entity key
       [...itemTranslations, ...articleTranslations, ...linkTranslations, ...tagTranslations].forEach(t => {
         // Need to determine entity type from the translation record's source
         // Since we know which array it came from, we can tag it
       });

       // Re-index with entity type information
       const addTranslationsToMap = (records: TranslationRecord[], entityType: EntityType) => {
         records.forEach(t => {
           const key = `${entityType}:${t.entityId}`;
           const existing = translationsByEntityKey.get(key) || [];
           existing.push(t);
           translationsByEntityKey.set(key, existing);
         });
       };

       addTranslationsToMap(itemTranslations, 'item');
       addTranslationsToMap(articleTranslations, 'article');
       addTranslationsToMap(linkTranslations, 'link');
       addTranslationsToMap(tagTranslations, 'tag');

       // 5. Build status results in same order as input
       const results: TranslationStatusResult[] = entities.map(entity => {
         const entityKey = `${entity.type}:${entity.id}`;
         const jobs = jobsByEntityKey.get(entityKey) || [];
         const translations = translationsByEntityKey.get(entityKey) || [];

         // Determine source language from jobs
         const sourceLanguage = jobs.length > 0 ? jobs[0].sourceLanguage : null;
         const targetLanguages = getTargetLanguages(sourceLanguage);
         const totalLanguages = targetLanguages.length;

         // Build per-language status
         const byLanguage: Partial<Record<SupportedLanguage, LanguageTranslationStatus>> = {};
         let completedCount = 0;
         let inProgressCount = 0;
         let failedCount = 0;
         let notStartedCount = 0;
         let lastUpdatedAt: string | undefined;

         for (const lang of targetLanguages) {
           const job = jobs.find(j => j.targetLanguage === lang);
           const translation = translations.find(t => t.language === lang);
           const status = determineLanguageStatus(job, translation);

           byLanguage[lang] = {
             status,
             job: job,
             lastError: job?.errorMessage || undefined,
             translatedAt: translation?.translated_at || undefined,
           };

           switch (status) {
             case 'completed':
             case 'manual':
               completedCount++;
               break;
             case 'pending':
             case 'processing':
               inProgressCount++;
               break;
             case 'failed':
               failedCount++;
               break;
             default:
               notStartedCount++;
           }

           if (translation?.translated_at) {
             if (!lastUpdatedAt || translation.translated_at > lastUpdatedAt) {
               lastUpdatedAt = translation.translated_at;
             }
           }
         }

         const completionPercentage = totalLanguages > 0
           ? Math.round((completedCount / totalLanguages) * 100)
           : 0;

         const overallStatus = determineOverallStatus(
           completedCount,
           failedCount,
           inProgressCount,
           totalLanguages
         );

         return {
           entityType: entity.type,
           entityId: entity.id,
           sourceLanguage,
           totalLanguages,
           completedCount,
           inProgressCount,
           failedCount,
           notStartedCount,
           completionPercentage,
           overallStatus,
           byLanguage,
           lastUpdatedAt,
         };
       });

       console.log(`${LOG_PREFIX} Batch status retrieved for ${results.length} entities`);

       return {
         success: true,
         data: results,
       };
     } catch (error) {
       const message = error instanceof Error ? error.message : 'Unknown error';
       console.error(`${LOG_PREFIX} Exception getting batch status:`, error);
       return {
         success: false,
         error: `Failed to get batch translation status: ${message}`,
       };
     }
   }
   ```

**Verification:**
- Returns results in same order as input
- Groups queries by entity type (max 4 job queries + 4 translation queries)
- Handles empty input array
- Handles mixed entity types
- Returns error on exception

---

### Task 10: Update barrel exports
**Size:** XS | **Priority:** Required | **Estimated:** 10 min

**Objective:** Export status functions from module barrels.

**Implementation Steps:**

1. **Create or update `/src/lib/content-translation/storage/index.ts`:**
   ```typescript
   /**
    * Storage utilities for content translation
    * Exports from translation-storage.ts and translation-status.ts
    */

   // Status utilities (REQ-E03-006)
   export {
     getEntityTranslationStatus,
     getBatchTranslationStatus,
     type LanguageStatus,
     type OverallStatus,
     type LanguageTranslationStatus,
     type TranslationStatusResult,
     type StatusQueryResult,
   } from './translation-status';

   // Storage utilities (REQ-E03-005) - uncomment when implemented
   // export { ... } from './translation-storage';
   ```

2. **Create or update `/src/lib/content-translation/index.ts`:**
   ```typescript
   /**
    * Content Translation Module
    * Epic 3 - Dynamic Content Translation
    *
    * Provides utilities for managing content translations:
    * - Status queries (REQ-E03-006)
    * - Storage operations (REQ-E03-005)
    * - Translation orchestration (REQ-E03-002)
    * - Entity triggers (REQ-E03-003, REQ-E03-004)
    */

   // Storage utilities
   export * from './storage';

   // Types (to be added as more files are created)
   // export * from './content-translation.types';
   ```

**Verification:**
- Import works: `import { getEntityTranslationStatus } from '@/lib/content-translation'`
- Import works: `import { getBatchTranslationStatus } from '@/lib/content-translation/storage'`
- All types are accessible
- Build succeeds

---

### Task 11: Verify TypeScript compilation
**Size:** XS | **Priority:** Required | **Estimated:** 5 min

**Objective:** Ensure all code compiles without errors.

**Implementation Steps:**

1. Run TypeScript compiler:
   ```bash
   npx tsc --noEmit
   ```

2. Fix any type errors that arise

3. Run build:
   ```bash
   npm run build
   ```

4. Verify no errors related to the new files

**Verification:**
- `tsc --noEmit` exits with code 0
- `npm run build` succeeds
- No type errors in new files

---

## Acceptance Criteria Verification Checklist

| Acceptance Criteria | Task | Verified |
|---------------------|------|----------|
| Single entity status function accepts entity type and entity ID parameters | Task 7 | [x] |
| Single entity status function queries translation jobs table | Task 7 | [x] |
| Single entity status function queries translations table | Task 6, 7 | [x] |
| Single entity status function combines job and translation data | Task 4, 7 | [x] |
| Single entity status function returns status enumeration per language | Task 7 | [x] |
| Single entity status function calculates completion percentage | Task 7 | [x] |
| Batch status function accepts array of entity specifications | Task 9 | [x] |
| Batch status function uses efficient database queries | Task 8, 9 | [x] |
| Batch status function returns results in same order as input | Task 9 | [x] |
| Batch status function handles large batches efficiently | Task 9 | [x] |
| Both functions handle entities with no jobs gracefully | Task 7, 9 | [x] |
| Both functions handle database errors gracefully | Task 7, 9 | [x] |
| Status results include timestamp of last translation | Task 7, 9 | [x] |
| TypeScript types properly defined | Task 2 | [x] |
| All functions properly exported from module | Task 10 | [x] |

---

## File Summary

### Files to Create

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/storage/translation-status.ts` | Main status utilities module |
| `/src/lib/content-translation/storage/index.ts` | Storage barrel exports |
| `/src/lib/content-translation/index.ts` | Module barrel exports |

### Files to Modify

None (all files are new)

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/translation-jobs.ts` | Reference for `getJobsByEntity()` usage |
| `/src/lib/job-queue/translation-jobs.types.ts` | Types to import |
| `/src/lib/supabase.ts` | Database client |

---

## Testing Recommendations

After implementation, manually verify:

1. **Single Entity - No Jobs:**
   ```typescript
   const result = await getEntityTranslationStatus('item', 'non-existent-uuid');
   // Should return success with all languages as 'not_started'
   ```

2. **Single Entity - With Jobs:**
   ```typescript
   // After creating translation jobs
   const result = await getEntityTranslationStatus('item', 'valid-item-uuid');
   // Should show correct status per language
   ```

3. **Batch Query:**
   ```typescript
   const result = await getBatchTranslationStatus([
     { type: 'item', id: 'item-1' },
     { type: 'article', id: 'article-1' },
   ]);
   // Should return 2 results in same order
   ```

---

## Notes for Implementer

1. **Tag Translation Special Case:** The `tag_translations` table doesn't have a `translation_status` column. Presence of a record indicates completion.

2. **Source Language Detection:** Source language is determined from the first job found. If no jobs exist, source language is `null` and we default to excluding 'en' from targets.

3. **Performance Consideration:** The batch function performs at most 8 database queries regardless of batch size (4 for jobs + 4 for translations, one per entity type).

4. **Future Enhancement:** Consider adding pagination for very large batches (500+ entities) if needed.

---

## Implementation Status

**Status:** COMPLETED ✓
**Completed Date:** 2026-01-21
**Verified By:** AI Agent

### Tasks Completed

- [x] Task 1: Create translation-status.ts file with imports and constants
- [x] Task 2: Define TypeScript type definitions
- [x] Task 3: Implement getTargetLanguages() helper
- [x] Task 4: Implement determineLanguageStatus() helper
- [x] Task 5: Implement determineOverallStatus() helper
- [x] Task 6: Implement translation record fetch functions (4 entity types)
- [x] Task 7: Implement getEntityTranslationStatus() function
- [x] Task 8: Implement batch job fetch function
- [x] Task 9: Implement getBatchTranslationStatus() function
- [x] Task 10: Update barrel exports
- [x] Task 11: Verify TypeScript compilation

### Files Created/Modified

| File | Status |
|------|--------|
| `/src/lib/content-translation/storage/translation-status.ts` | Created |
| `/src/lib/content-translation/storage/index.ts` | Updated |
| `/src/lib/content-translation/index.ts` | Updated |

### Verification Results

- TypeScript compilation: PASSED (no errors in new translation files)
- Build: PASSED (compiled successfully)
- All acceptance criteria verified

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 1.6: Implement Translation Status Utilities*
