/**
 * Translation Status Utilities
 * Part of REQ-E03-006: Implement Translation Status Utilities
 * Epic 3 - Dynamic Content Translation
 *
 * Provides functions to aggregate translation job status with stored
 * translation records to report comprehensive translation status.
 *
 * @created 2026-01-21
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  TranslationJob,
  EntityType,
  SupportedLanguage,
  JobStatus,
} from '@/lib/job-queue/translation-jobs.types';
import { getJobsByEntity } from '@/lib/job-queue/translation-jobs';

// ============================================================================
// Constants
// ============================================================================

/** All supported target languages for translation */
const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/** Log prefix for consistent logging */
const LOG_PREFIX = '[TranslationStatus]';

// ============================================================================
// Type Definitions (Task 2)
// ============================================================================

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
  byLanguage: Partial<Record<SupportedLanguage, LanguageTranslationStatus>>;
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

/**
 * Internal type for translation record from database
 */
interface TranslationRecord {
  entityId: string;
  language: SupportedLanguage;
  translation_status?: string;
  translated_at?: string;
}

// ============================================================================
// Helper Functions (Tasks 3-5)
// ============================================================================

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

// ============================================================================
// Translation Record Fetch Functions (Task 6)
// ============================================================================

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
    translated_at: row.translated_at ?? undefined,
  }));
}

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
    translated_at: row.translated_at ?? undefined,
  }));
}

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
    translated_at: row.translated_at ?? undefined,
  }));
}

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
    translated_at: row.created_at ?? undefined,
  }));
}

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

// ============================================================================
// Batch Job Fetch Function (Task 8)
// ============================================================================

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
  // Note: Cast to any for priority field which may not be in generated Supabase types yet
  return (data || []).map(row => ({
    id: row.id,
    entityType: row.entity_type as EntityType,
    entityId: row.entity_id,
    sourceLanguage: row.source_language as SupportedLanguage,
    targetLanguage: row.target_language as SupportedLanguage,
    status: row.status as JobStatus,
    priority: (row as Record<string, unknown>).priority as number ?? 25,
    attempts: row.attempts ?? 0,
    errorMessage: row.error_message,
    createdAt: row.created_at ?? '',
    startedAt: row.started_at,
    completedAt: row.completed_at,
    lockedBy: row.locked_by,
    lockedAt: row.locked_at,
  }));
}

// ============================================================================
// Main Exported Functions (Tasks 7 and 9)
// ============================================================================

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

    // Re-index translations with entity type information
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
