/**
 * Content Translation Orchestrator
 * Part of REQ-E03-002: Implement Content Translation Orchestrator
 *
 * This module coordinates the creation of translation jobs for user-generated
 * content (items, articles, links, tags). When content is created or updated,
 * this orchestrator queues translation jobs for all target languages.
 *
 * @module content-translation
 * @created 2026-01-19
 */

import { createBatchTranslationJobs } from '@/lib/job-queue';
import {
  ALL_SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/lib/translation-service';
import type {
  QueueTranslationOptions,
  QueueTranslationResult,
  TranslationTrigger,
} from './content-translation.types';

/**
 * Calculates job priority based on the trigger type.
 *
 * Priority levels:
 * - 100: New content (create) - needs fastest translation
 * - 50: Updated content (update) - important but less urgent
 *
 * @param trigger - What triggered the translation ('create' or 'update')
 * @param customPriority - Optional priority override
 * @returns Numeric priority value (higher = more urgent)
 */
function calculatePriority(
  trigger: TranslationTrigger,
  customPriority?: number
): number {
  if (customPriority !== undefined) {
    return customPriority;
  }
  return trigger === 'create' ? 100 : 50;
}

/**
 * Determines which target languages need translation.
 *
 * Returns all supported languages except:
 * - The source language (content's original language)
 * - Any explicitly excluded languages
 *
 * @param sourceLanguage - The content's original language
 * @param excludeLanguages - Optional languages to skip
 * @returns Array of target language codes to translate to
 */
function getTargetLanguages(
  sourceLanguage: SupportedLanguage,
  excludeLanguages?: SupportedLanguage[]
): SupportedLanguage[] {
  const exclude = new Set<SupportedLanguage>([
    sourceLanguage,
    ...(excludeLanguages || []),
  ]);
  return ALL_SUPPORTED_LANGUAGES.filter((lang) => !exclude.has(lang));
}

/**
 * Queues content for translation to all active target languages.
 *
 * This function coordinates the creation of translation jobs for a piece of content.
 * It determines which languages need translation based on system configuration,
 * filters out the source language and any excluded languages, and creates
 * individual job records in the translation_jobs table.
 *
 * @param options - Queue translation options
 * @param options.content - Content to translate (entity type, ID, source language, fields)
 * @param options.trigger - What triggered this translation ('create' or 'update')
 * @param options.excludeLanguages - Languages to skip (optional)
 * @param options.priority - Custom priority override (optional)
 * @returns Result with job IDs, queued languages, and any error
 *
 * @example
 * // Queue translations for a new item
 * const result = await queueContentTranslations({
 *   content: {
 *     entityType: 'item',
 *     entityId: 'item-123',
 *     sourceLanguage: 'en',
 *     fields: [
 *       { fieldName: 'name', value: 'Coffee Maker', context: { contentType: 'item_name' } },
 *       { fieldName: 'description', value: 'Premium coffee machine', context: { contentType: 'item_description' } }
 *     ]
 *   },
 *   trigger: 'create'
 * });
 *
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 * }
 */
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult> {
  const { content, trigger, excludeLanguages, priority } = options;
  const { entityType, entityId, sourceLanguage, fields } = content;

  // Log operation start
  console.log('CONTENT_TRANSLATION: Queuing translations', {
    entityType,
    entityId,
    sourceLanguage,
    trigger,
    fieldCount: fields.length,
  });

  // Calculate priority based on trigger type
  const jobPriority = calculatePriority(trigger, priority);

  // Determine target languages
  const targetLanguages = getTargetLanguages(sourceLanguage, excludeLanguages);

  // Handle case with no target languages
  if (targetLanguages.length === 0) {
    console.log('CONTENT_TRANSLATION: No target languages to translate to', {
      entityType,
      entityId,
      sourceLanguage,
    });
    return {
      success: true,
      jobIds: [],
      queuedLanguages: [],
    };
  }

  try {
    // Create batch translation jobs
    console.log('CONTENT_TRANSLATION: Creating jobs for languages', {
      entityType,
      entityId,
      targetLanguages,
      priority: jobPriority,
    });

    const jobResult = await createBatchTranslationJobs({
      entityType,
      entityId,
      sourceLanguage,
      targetLanguages,
    });

    // Handle job queue errors
    if (!jobResult.success) {
      console.error('CONTENT_TRANSLATION: Failed to create jobs', {
        entityType,
        entityId,
        error: jobResult.error,
      });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: jobResult.error,
      };
    }

    // Extract job IDs and languages from result
    const jobs = jobResult.data || [];
    const jobIds = jobs.map((job) => job.id);
    const queuedLanguages = jobs.map((job) => job.targetLanguage as SupportedLanguage);

    console.log('CONTENT_TRANSLATION: Jobs queued successfully', {
      entityType,
      entityId,
      jobCount: jobIds.length,
      languages: queuedLanguages,
    });

    return {
      success: true,
      jobIds,
      queuedLanguages,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('CONTENT_TRANSLATION: Exception queuing translations', {
      entityType,
      entityId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception queuing translations: ${errorMessage}`,
    };
  }
}
