/**
 * Link Translation Trigger
 * Part of REQ-E03-003: Implement Entity-Specific Translation Triggers
 *
 * This module provides the trigger function for queueing translations
 * of link content. Only the title field is translatable - URLs are
 * resource locators and should never be translated.
 *
 * @module content-translation/triggers/link-trigger
 * @created 2026-01-20
 */

import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

// ============================================================================
// Translation Context Constants
// ============================================================================

/**
 * Pre-defined translation contexts for link fields.
 * Note: Only title is translatable - URLs are never translated.
 */
const LINK_TRANSLATION_CONTEXTS = {
  title: {
    contentType: 'link_title' as const,
    domainContext: 'property_rental_media',
    maxLength: 255,
  },
} as const;

// ============================================================================
// Trigger Function
// ============================================================================

/**
 * Triggers translation for a link's translatable fields.
 *
 * Fetches the link from the database, extracts ONLY the title field,
 * and queues translation jobs for all target languages. URLs are
 * intentionally NOT translated as they are resource locators.
 *
 * @param linkId - UUID of the link to translate
 * @param sourceLanguage - The language code of the link's original content
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * // Trigger translations for a newly created link
 * const result = await triggerLinkTranslation('link-123', 'en');
 *
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 *   console.log('Job IDs:', result.jobIds);
 * } else {
 *   console.error('Failed to queue translations:', result.error);
 * }
 * ```
 *
 * @remarks
 * The url and thumbnail_url fields are intentionally NOT extracted for
 * translation. URLs are resource locators and should remain unchanged
 * across all languages.
 */
export async function triggerLinkTranslation(
  linkId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('LINK_TRIGGER: Starting link translation', {
      linkId,
      sourceLanguage,
    });

    // Fetch link from database - ONLY id and title (NOT url or thumbnail_url)
    const { data: link, error: fetchError } = await supabaseAdmin
      .from('item_links')
      .select('id, title')
      .eq('id', linkId)
      .single();

    // Handle fetch error
    if (fetchError) {
      console.error('LINK_TRIGGER: Database error fetching link', {
        linkId,
        error: fetchError.message,
      });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Failed to fetch link: ${fetchError.message}`,
      };
    }

    // Handle link not found
    if (!link) {
      console.error('LINK_TRIGGER: Link not found', { linkId });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Link not found: ${linkId}`,
      };
    }

    // Build translatable fields array
    const fields: TranslatableField[] = [];

    // Add title field if it has a value
    if (link.title && link.title.trim()) {
      fields.push({
        fieldName: 'title',
        value: link.title,
        context: {
          contentType: LINK_TRANSLATION_CONTEXTS.title.contentType,
          domainContext: LINK_TRANSLATION_CONTEXTS.title.domainContext,
        },
        maxLength: LINK_TRANSLATION_CONTEXTS.title.maxLength,
      });
    }

    // NOTE: url and thumbnail_url are NOT added - URLs should never be translated

    // If no fields to translate, return success with empty arrays
    if (fields.length === 0) {
      console.log('LINK_TRIGGER: No translatable fields found', { linkId });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // Queue translations via orchestrator
    console.log('LINK_TRIGGER: Queuing translations', {
      linkId,
      fieldCount: fields.length,
      fieldNames: fields.map((f) => f.fieldName),
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'link',
        entityId: linkId,
        sourceLanguage,
        fields,
      },
      trigger: 'create',
    });

    console.log('LINK_TRIGGER: Translation queuing complete', {
      linkId,
      success: result.success,
      jobCount: result.jobIds.length,
      queuedLanguages: result.queuedLanguages,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('LINK_TRIGGER: Exception in triggerLinkTranslation', {
      linkId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering link translation: ${errorMessage}`,
    };
  }
}
