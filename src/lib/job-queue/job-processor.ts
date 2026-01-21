/**
 * Translation Job Processor
 * Part of REQ-244: Background Job Processing
 *
 * Processes queued translation jobs from the job queue module.
 * Polls at configurable intervals, processes one job at a time,
 * and updates translation tables upon completion.
 *
 * @module job-queue/job-processor
 * @created 2026-01-18
 * @lastModified 2026-01-21
 */

/**
 * Entity-Specific Translation Processing Architecture (REQ-E03-013)
 *
 * This module implements content-aware translation job processing using a
 * routing pattern. When a translation job is dequeued:
 *
 * 1. The main router (processTranslationJob) examines job.entityType
 * 2. Based on the entity type, it dispatches to a specialized handler:
 *    - 'item' -> processItemTranslation
 *    - 'article' -> processArticleTranslation
 *    - 'link' -> processLinkTranslation
 *    - 'tag' -> processTagTranslation
 * 3. Each handler knows which fields to translate and how to store results
 * 4. The router manages heartbeat, job status updates, and error handling
 *
 * This architecture is easily extensible for future entity types by:
 * - Adding a new entity-specific processor function
 * - Adding a new case to the switch statement in processTranslationJob
 *
 * @see processTranslationJob - Main routing function
 * @see processItemTranslation - Item handler (name, description)
 * @see processArticleTranslation - Article handler (title, description)
 * @see processLinkTranslation - Link handler (title only)
 * @see processTagTranslation - Tag handler (translated_value)
 */

import type {
  TranslationJob,
  SupportedLanguage,
  EntityType,
} from './translation-jobs.types';
import { createLockHeartbeat, DEFAULT_HEARTBEAT_INTERVAL_MS } from './concurrency-control';

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
  /** Heartbeat interval in milliseconds (default: 60000 = 1 minute) */
  heartbeatIntervalMs?: number;
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

/**
 * Result of processing a specific entity type translation
 * Used by entity-specific processor functions
 * Part of REQ-E03-013: Content-specific job handling
 */
export interface EntityTranslationResult {
  /** Whether the translation processing succeeded */
  success: boolean;
  /** Map of field names to translated values (on success) */
  translatedFields?: Record<string, string>;
  /** Error message if processing failed */
  errorMessage?: string;
}

/**
 * Processor function signature for entity-specific handlers
 * Part of REQ-E03-013: Content-specific job handling
 */
export type EntityProcessorFn = (
  job: TranslationJob,
  config: JobProcessorConfig
) => Promise<EntityTranslationResult>;

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
  translated_value: string;
}

// ===========================================================================
// Imports for Implementation
// ===========================================================================

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { fetchAndLockNextJob, markJobCompleted, markJobFailed } from './translation-jobs';

// ===========================================================================
// Entity Content Fetching
// ===========================================================================

/**
 * Fetch content from source table based on entity type
 *
 * @param entityType - Type of entity to fetch
 * @param entityId - ID of the entity
 * @returns Entity content or null if not found
 */
export async function fetchEntityContent(
  entityType: EntityType,
  entityId: string
): Promise<EntityContent | null> {
  try {
    switch (entityType) {
      case 'article': {
        const { data, error } = await supabaseAdmin
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
        const { data, error } = await supabaseAdmin
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
        const { data, error } = await supabaseAdmin
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
        const { data, error } = await supabaseAdmin
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

// ===========================================================================
// Translation Table Updates
// ===========================================================================

/**
 * Save translated content to the appropriate translation table
 *
 * @param entityType - Type of entity being translated
 * @param entityId - ID of the entity
 * @param targetLanguage - Target language for translation
 * @param translatedFields - Translated field values
 * @returns Boolean indicating success
 */
export async function saveTranslation(
  entityType: EntityType,
  entityId: string,
  targetLanguage: SupportedLanguage,
  translatedFields: Record<string, string>
): Promise<boolean> {
  const now = new Date().toISOString();

  try {
    switch (entityType) {
      case 'article': {
        const { error } = await supabaseAdmin
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
        const { error } = await supabaseAdmin
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
        const { error } = await supabaseAdmin
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
        const { error } = await supabaseAdmin
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

// ===========================================================================
// Translation Context Helpers
// ===========================================================================

/**
 * Get translation context based on entity type
 * Provides domain-specific context for better translation quality
 *
 * @param entityType - Type of entity being translated
 * @returns Domain context object
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
 *
 * @param entityType - Type of entity
 * @param fieldName - Name of the field being translated
 * @returns Content type for translation service
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

// ===========================================================================
// Entity-Specific Processors (REQ-E03-013)
// ===========================================================================

/**
 * Process item translation job
 * Fetches item, translates name and description, stores results
 * Part of REQ-E03-013: Content-specific job handling
 *
 * @param job - Translation job with entityType='item'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
async function processItemTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult> {
  const { entityId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch item content
    const content = await fetchEntityContent('item', entityId);
    if (!content) {
      return {
        success: false,
        errorMessage: `Item not found: ${entityId}`,
      };
    }

    // 2. Translate fields with appropriate context
    const translatedFields: Record<string, string> = {};
    const context = getTranslationContext('item');

    // Translate name (required field)
    if (content.fields.name) {
      const result = await translateText(
        content.fields.name,
        sourceLanguage,
        targetLanguage,
        {
          context: {
            contentType: getContentType('item', 'name'),
            domainContext: context.domainContext,
          },
        }
      );
      translatedFields.name = result.translatedText;
    }

    // Translate description (optional field)
    if (content.fields.description) {
      const result = await translateText(
        content.fields.description,
        sourceLanguage,
        targetLanguage,
        {
          context: {
            contentType: getContentType('item', 'description'),
            domainContext: context.domainContext,
          },
        }
      );
      translatedFields.description = result.translatedText;
    }

    // 3. Store translation
    const saved = await saveTranslation('item', entityId, targetLanguage, translatedFields);
    if (!saved) {
      return {
        success: false,
        errorMessage: 'Failed to save item translation to database',
      };
    }

    if (config.enableLogging) {
      console.log(`[JobProcessor] Item ${entityId} translated to ${targetLanguage}`);
    }

    return {
      success: true,
      translatedFields,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorMessage,
    };
  }
}

/**
 * Process article translation job
 * Fetches article, translates title and description, stores results
 * Part of REQ-E03-013: Content-specific job handling
 *
 * @param job - Translation job with entityType='article'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
async function processArticleTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult> {
  const { entityId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch article content
    const content = await fetchEntityContent('article', entityId);
    if (!content) {
      return {
        success: false,
        errorMessage: `Article not found: ${entityId}`,
      };
    }

    // 2. Translate fields with appropriate context
    const translatedFields: Record<string, string> = {};
    const context = getTranslationContext('article');

    // Translate title (required field)
    if (content.fields.title) {
      const result = await translateText(
        content.fields.title,
        sourceLanguage,
        targetLanguage,
        {
          context: {
            contentType: getContentType('article', 'title'),
            domainContext: context.domainContext,
          },
        }
      );
      translatedFields.title = result.translatedText;
    }

    // Translate description (optional field)
    if (content.fields.description) {
      const result = await translateText(
        content.fields.description,
        sourceLanguage,
        targetLanguage,
        {
          context: {
            contentType: getContentType('article', 'description'),
            domainContext: context.domainContext,
          },
        }
      );
      translatedFields.description = result.translatedText;
    }

    // 3. Store translation
    const saved = await saveTranslation('article', entityId, targetLanguage, translatedFields);
    if (!saved) {
      return {
        success: false,
        errorMessage: 'Failed to save article translation to database',
      };
    }

    if (config.enableLogging) {
      console.log(`[JobProcessor] Article ${entityId} translated to ${targetLanguage}`);
    }

    return {
      success: true,
      translatedFields,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorMessage,
    };
  }
}

/**
 * Process link translation job
 * Fetches link, translates title only (URLs never translated), stores results
 * Part of REQ-E03-013: Content-specific job handling
 *
 * @param job - Translation job with entityType='link'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
async function processLinkTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult> {
  const { entityId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch link content
    const content = await fetchEntityContent('link', entityId);
    if (!content) {
      return {
        success: false,
        errorMessage: `Link not found: ${entityId}`,
      };
    }

    // 2. Translate title only (URLs are never translated)
    const translatedFields: Record<string, string> = {};
    const context = getTranslationContext('link');

    // Translate title (only translatable field for links)
    if (content.fields.title) {
      const result = await translateText(
        content.fields.title,
        sourceLanguage,
        targetLanguage,
        {
          context: {
            contentType: getContentType('link', 'title'),
            domainContext: context.domainContext,
          },
        }
      );
      translatedFields.title = result.translatedText;
    }

    // 3. Store translation
    const saved = await saveTranslation('link', entityId, targetLanguage, translatedFields);
    if (!saved) {
      return {
        success: false,
        errorMessage: 'Failed to save link translation to database',
      };
    }

    if (config.enableLogging) {
      console.log(`[JobProcessor] Link ${entityId} translated to ${targetLanguage}`);
    }

    return {
      success: true,
      translatedFields,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorMessage,
    };
  }
}

/**
 * Process tag translation job
 * Fetches tag, translates value, stores results
 * Part of REQ-E03-013: Content-specific job handling
 *
 * @param job - Translation job with entityType='tag'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
async function processTagTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult> {
  const { entityId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch tag content (entityId is the tag_key)
    const content = await fetchEntityContent('tag', entityId);
    if (!content) {
      return {
        success: false,
        errorMessage: `Tag not found: ${entityId}`,
      };
    }

    // 2. Translate tag value
    const translatedFields: Record<string, string> = {};
    const context = getTranslationContext('tag');

    // Translate tag value
    if (content.fields.translated_value) {
      const result = await translateText(
        content.fields.translated_value,
        sourceLanguage,
        targetLanguage,
        {
          context: {
            contentType: getContentType('tag', 'translated_value'),
            domainContext: context.domainContext,
          },
        }
      );
      translatedFields.translated_value = result.translatedText;
    }

    // 3. Store translation
    const saved = await saveTranslation('tag', entityId, targetLanguage, translatedFields);
    if (!saved) {
      return {
        success: false,
        errorMessage: 'Failed to save tag translation to database',
      };
    }

    if (config.enableLogging) {
      console.log(`[JobProcessor] Tag ${entityId} translated to ${targetLanguage}`);
    }

    return {
      success: true,
      translatedFields,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorMessage,
    };
  }
}

// ===========================================================================
// Main Routing Function (REQ-E03-013)
// ===========================================================================

/**
 * Route translation job to appropriate entity-specific processor
 *
 * This is the main entry point for content-aware translation processing.
 * It examines the job's entityType and dispatches to the appropriate
 * specialized handler (processItemTranslation, processArticleTranslation, etc.)
 *
 * Part of REQ-E03-013: Content-specific job handling
 *
 * Routing logic:
 * - 'item' -> processItemTranslation (translates name, description)
 * - 'article' -> processArticleTranslation (translates title, description)
 * - 'link' -> processLinkTranslation (translates title only)
 * - 'tag' -> processTagTranslation (translates tag value)
 * - unknown -> returns error without processing
 *
 * @param job - Translation job to process
 * @param config - Processor configuration
 * @returns Job processing result with success/failure and translated fields
 */
async function processTranslationJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityType, entityId, targetLanguage } = job;

  // Start heartbeat to prevent lock timeout during processing
  const stopHeartbeat = createLockHeartbeat(
    job.id,
    config.workerId,
    config.heartbeatIntervalMs || DEFAULT_HEARTBEAT_INTERVAL_MS
  );

  try {
    let result: EntityTranslationResult;

    // Route to entity-specific processor based on entityType
    switch (job.entityType) {
      case 'item':
        result = await processItemTranslation(job, config);
        break;

      case 'article':
        result = await processArticleTranslation(job, config);
        break;

      case 'link':
        result = await processLinkTranslation(job, config);
        break;

      case 'tag':
        result = await processTagTranslation(job, config);
        break;

      default:
        // Handle unknown entity types gracefully with error logging
        console.error(`[JobProcessor] Unknown entity type: ${entityType}`);
        await markJobFailed(job.id, `Unknown entity type: ${entityType}`);
        return {
          jobId: job.id,
          success: false,
          entityType,
          entityId,
          targetLanguage,
          errorMessage: `Unknown entity type: ${entityType}`,
          processingTimeMs: Date.now() - startTime,
        };
    }

    // Handle processor result
    if (result.success) {
      await markJobCompleted(job.id);

      if (config.enableLogging) {
        console.log(`[JobProcessor] Job ${job.id} completed successfully via ${entityType} processor`);
      }

      return {
        jobId: job.id,
        success: true,
        entityType,
        entityId,
        targetLanguage,
        translatedFields: result.translatedFields,
        processingTimeMs: Date.now() - startTime,
      };
    } else {
      await markJobFailed(job.id, result.errorMessage || 'Unknown error');

      if (config.enableLogging) {
        console.error(`[JobProcessor] Job ${job.id} failed:`, result.errorMessage);
      }

      return {
        jobId: job.id,
        success: false,
        entityType,
        entityId,
        targetLanguage,
        errorMessage: result.errorMessage,
        processingTimeMs: Date.now() - startTime,
      };
    }
  } catch (error) {
    // Handle unexpected errors during routing/processing
    const errorMessage = error instanceof Error ? error.message : String(error);
    await markJobFailed(job.id, errorMessage);

    if (config.enableLogging) {
      console.error(`[JobProcessor] Unexpected error in job ${job.id}:`, errorMessage);
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
  } finally {
    // Always stop heartbeat when done (success or failure)
    stopHeartbeat();
  }
}

// ===========================================================================
// Single Job Processing (Delegating)
// ===========================================================================

/**
 * Process a single translation job
 *
 * This function delegates to processTranslationJob which routes to
 * entity-specific handlers based on job.entityType.
 *
 * @param job - The translation job to process
 * @param config - Processor configuration
 * @returns Processing result
 */
async function processJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  // Delegate to the new routing function (REQ-E03-013)
  return processTranslationJob(job, config);
}

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
 *
 * @example
 * ```typescript
 * const processor = new TranslationJobProcessor({
 *   pollingIntervalMs: 60000, // 1 minute
 *   enableLogging: true,
 * });
 *
 * processor.start();
 *
 * // Later, when shutting down
 * await processor.stop();
 * ```
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

  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================

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

  // ===========================================================================
  // Processing Methods
  // ===========================================================================

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

  // ===========================================================================
  // Stats and Config Methods
  // ===========================================================================

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
}

// ===========================================================================
// Factory Functions
// ===========================================================================

/**
 * Create a new job processor instance
 *
 * @param config - Optional configuration overrides
 * @returns New TranslationJobProcessor instance
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
 *
 * @returns Global TranslationJobProcessor instance
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
