/**
 * Tag Translation Trigger
 * Part of REQ-E03-004: Implement Tag Translation Trigger
 *
 * This module provides a specialized translation trigger for tag entities.
 * It handles the distinction between system tags (pre-seeded, skip translation)
 * and user-created tags (queue for translation).
 *
 * @module content-translation/triggers/tag-trigger
 * @created 2026-01-20
 */

import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import { TRANSLATION_CONTEXTS } from '../content-translation.types';
import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
import { getOtherLanguages } from '@/lib/translation-service';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a tag is a system tag (pre-seeded with translations).
 * System tags are seeded via /database/seeds/20260117_system_tag_translations.sql
 * and have is_system_tag = true in the database.
 *
 * @param tagKey - The tag identifier (e.g., 'kitchen', 'my-custom-tag')
 * @returns Promise resolving to true if this is a system tag
 */
async function isSystemTag(tagKey: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('is_system_tag')
    .eq('tag_key', tagKey)
    .eq('is_system_tag', true)
    .limit(1);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking system tag status', {
      tagKey,
      error: error.message,
    });
    return false; // Assume not system tag on error, will queue translation
  }

  return data !== null && data.length > 0;
}

/**
 * Gets languages that already have translations for a tag.
 *
 * @param tagKey - The tag identifier
 * @returns Promise resolving to array of language codes with existing translations
 */
async function getExistingTagTranslationLanguages(
  tagKey: string
): Promise<SupportedLanguage[]> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('language')
    .eq('tag_key', tagKey);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking existing translations', {
      tagKey,
      error: error.message,
    });
    return []; // Assume no translations exist on error
  }

  return (data || []).map(row => row.language as SupportedLanguage);
}

/**
 * Gets languages with pending or processing translation jobs for a tag.
 *
 * @param tagKey - The tag identifier
 * @returns Promise resolving to array of language codes with pending jobs
 */
async function getPendingTagJobLanguages(
  tagKey: string
): Promise<SupportedLanguage[]> {
  const { data, error } = await supabaseAdmin
    .from('translation_jobs')
    .select('target_language')
    .eq('entity_type', 'tag')
    .eq('entity_id', tagKey)
    .in('status', ['queued', 'processing']);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking pending jobs', {
      tagKey,
      error: error.message,
    });
    return []; // Assume no pending jobs on error
  }

  return (data || []).map(row => row.target_language as SupportedLanguage);
}

// ============================================================================
// Main Trigger Function
// ============================================================================

/**
 * Triggers translation for a tag's value across all target languages.
 *
 * This function handles the special case of tags:
 * 1. System tags (pre-seeded in database) are skipped - they already have translations
 * 2. User-created tags are checked for existing translations before queuing
 * 3. Only missing translations are queued to avoid redundant work
 *
 * @param tagKey - The tag identifier (e.g., 'coffee-maker', 'my-custom-tag')
 * @param sourceLanguage - The source language code (e.g., 'en', 'fr')
 * @returns Result with job IDs, queued languages, and any error or skip reason
 *
 * @example
 * // Trigger translation for a user-created tag
 * const result = await triggerTagTranslation('coffee-maker', 'en');
 * if (result.success) {
 *   if (result.jobIds.length === 0) {
 *     console.log('Tag already translated or is a system tag');
 *   } else {
 *     console.log(`Queued ${result.queuedLanguages.length} translations`);
 *   }
 * }
 *
 * @example
 * // System tag will be skipped
 * const result = await triggerTagTranslation('kitchen', 'en');
 * // result.success === true, result.jobIds === []
 */
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('TAG_TRIGGER: Triggering tag translation', {
      tagKey,
      sourceLanguage,
    });

    // 1. Check if this is a system tag (pre-seeded, skip translation)
    const systemTag = await isSystemTag(tagKey);
    if (systemTag) {
      console.log('TAG_TRIGGER: Skipping system tag (already seeded)', { tagKey });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        // Note: No error field - this is expected behavior for system tags
      };
    }

    // 2. Get all target languages (excluding source)
    const allTargetLanguages = getOtherLanguages(sourceLanguage);

    // 3. Check for existing translations
    const existingTranslations = await getExistingTagTranslationLanguages(tagKey);

    // 4. Check for pending/processing jobs
    const pendingJobs = await getPendingTagJobLanguages(tagKey);

    // 5. Determine which languages still need translation
    const coveredLanguages = new Set([
      ...existingTranslations,
      ...pendingJobs,
      sourceLanguage, // Source language doesn't need translation
    ]);

    const languagesToTranslate = allTargetLanguages.filter(
      lang => !coveredLanguages.has(lang)
    );

    console.log('TAG_TRIGGER: Translation coverage check', {
      tagKey,
      sourceLanguage,
      existingTranslations,
      pendingJobs,
      languagesToTranslate,
    });

    // 6. If all languages are covered, return success with empty arrays
    if (languagesToTranslate.length === 0) {
      console.log('TAG_TRIGGER: All translations exist or are pending', { tagKey });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // 7. Build translatable fields for the tag
    // Tags only have one translatable field: the tag value itself
    // The tag key is used as both the identifier and the value to translate
    const fields: TranslatableField[] = [
      {
        fieldName: 'translated_value',
        value: tagKey, // The tag key is what gets translated
        context: TRANSLATION_CONTEXTS.tag,
      },
    ];

    // 8. Queue translations via orchestrator
    console.log('TAG_TRIGGER: Queuing translations', {
      tagKey,
      languageCount: languagesToTranslate.length,
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'tag',
        entityId: tagKey, // Tag key is the entity ID
        sourceLanguage,
        fields,
      },
      trigger: 'create',
      excludeLanguages: [...existingTranslations, ...pendingJobs] as SupportedLanguage[],
    });

    console.log('TAG_TRIGGER: Translation queuing complete', {
      tagKey,
      success: result.success,
      jobCount: result.jobIds.length,
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('TAG_TRIGGER: Exception triggering tag translation', {
      tagKey,
      sourceLanguage,
      error: errorMessage,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering tag translation: ${errorMessage}`,
    };
  }
}
