/**
 * Item Translation Trigger
 * Part of REQ-E03-003: Implement Entity-Specific Translation Triggers
 *
 * This module provides the trigger function for queueing translations
 * of item content (name and description fields) when items are created
 * or updated.
 *
 * @module content-translation/triggers/item-trigger
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
 * Pre-defined translation contexts for item fields.
 * These provide domain-specific guidance to the AI translation provider.
 */
const ITEM_TRANSLATION_CONTEXTS = {
  name: {
    contentType: 'item_name' as const,
    domainContext: 'property_rental_appliances',
    maxLength: 255,
  },
  description: {
    contentType: 'item_description' as const,
    domainContext: 'property_rental_appliances',
  },
} as const;

// ============================================================================
// Trigger Function
// ============================================================================

/**
 * Triggers translation for an item's translatable fields.
 *
 * Fetches the item from the database, extracts name and description fields,
 * and queues translation jobs for all target languages (excluding the source language).
 *
 * @param itemId - UUID of the item to translate
 * @param sourceLanguage - The language code of the item's original content
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * // Trigger translations for a newly created item
 * const result = await triggerItemTranslation('item-123', 'en');
 *
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 *   console.log('Job IDs:', result.jobIds);
 * } else {
 *   console.error('Failed to queue translations:', result.error);
 * }
 * ```
 */
export async function triggerItemTranslation(
  itemId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('ITEM_TRIGGER: Starting item translation', {
      itemId,
      sourceLanguage,
    });

    // Fetch item from database
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('id, name, description')
      .eq('id', itemId)
      .single();

    // Handle fetch error
    if (fetchError) {
      console.error('ITEM_TRIGGER: Database error fetching item', {
        itemId,
        error: fetchError.message,
      });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Failed to fetch item: ${fetchError.message}`,
      };
    }

    // Handle item not found
    if (!item) {
      console.error('ITEM_TRIGGER: Item not found', { itemId });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Item not found: ${itemId}`,
      };
    }

    // Build translatable fields array
    const fields: TranslatableField[] = [];

    // Add name field if it has a value
    if (item.name && item.name.trim()) {
      fields.push({
        fieldName: 'name',
        value: item.name,
        context: {
          contentType: ITEM_TRANSLATION_CONTEXTS.name.contentType,
          domainContext: ITEM_TRANSLATION_CONTEXTS.name.domainContext,
        },
        maxLength: ITEM_TRANSLATION_CONTEXTS.name.maxLength,
      });
    }

    // Add description field if it has a value
    if (item.description && item.description.trim()) {
      fields.push({
        fieldName: 'description',
        value: item.description,
        context: {
          contentType: ITEM_TRANSLATION_CONTEXTS.description.contentType,
          domainContext: ITEM_TRANSLATION_CONTEXTS.description.domainContext,
        },
      });
    }

    // If no fields to translate, return success with empty arrays
    if (fields.length === 0) {
      console.log('ITEM_TRIGGER: No translatable fields found', { itemId });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // Queue translations via orchestrator
    console.log('ITEM_TRIGGER: Queuing translations', {
      itemId,
      fieldCount: fields.length,
      fieldNames: fields.map((f) => f.fieldName),
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'item',
        entityId: itemId,
        sourceLanguage,
        fields,
      },
      trigger: 'create',
    });

    console.log('ITEM_TRIGGER: Translation queuing complete', {
      itemId,
      success: result.success,
      jobCount: result.jobIds.length,
      queuedLanguages: result.queuedLanguages,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('ITEM_TRIGGER: Exception in triggerItemTranslation', {
      itemId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering item translation: ${errorMessage}`,
    };
  }
}
