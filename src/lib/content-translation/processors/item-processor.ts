/**
 * Item Translation Processor
 * Part of REQ-E03-014: Implement Item Translation Processor
 *
 * Processes translation jobs for item entities. Retrieves item records,
 * translates name and description fields, stores results, and updates job status.
 *
 * This processor is invoked by the job queue routing system when a translation
 * job with entityType='item' is dequeued. It provides:
 * - Error classification (permanent vs transient) for retry decisions
 * - Domain-specific translation contexts for item fields
 * - UPSERT-based storage to item_translations table
 * - Comprehensive logging for debugging
 *
 * @module content-translation/processors/item-processor
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import type { TranslationJob, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
import type { TranslationContext } from '@/lib/translation-service/translation-service.types';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';

// ===========================================================================
// Type Definitions
// ===========================================================================

/**
 * Item content retrieved from the database for translation
 */
interface ItemData {
  id: string;
  name: string;
  description: string | null;
  source_language: SupportedLanguage | null;
}

/**
 * Translated item fields ready for storage
 */
interface TranslatedItemFields {
  name: string;
  description?: string;
}

/**
 * Result of processing an item translation job
 */
export interface ItemProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'item';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: TranslatedItemFields;
  errorMessage?: string;
  errorType?: 'permanent' | 'transient';
  processingTimeMs: number;
}

/**
 * Error classification for determining retry behavior
 */
type ErrorClassification = {
  type: 'permanent' | 'transient';
  message: string;
};

// ===========================================================================
// Error Classification
// ===========================================================================

/**
 * Classify an error as permanent or transient for retry decisions
 *
 * Permanent errors (no retry):
 * - Item not found (deleted)
 * - Invalid UUID format
 * - Unsupported language
 * - Max retries exceeded
 *
 * Transient errors (retry with backoff):
 * - Rate limit exceeded
 * - Network timeout
 * - Translation service unavailable
 * - Database connection error
 *
 * @param error - The error to classify
 * @param job - The job being processed (to check attempts)
 * @returns Error classification with type and message
 */
function categorizeError(error: unknown, job: TranslationJob): ErrorClassification {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Permanent errors - do not retry
  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('deleted') ||
    lowerMessage.includes('does not exist')
  ) {
    return { type: 'permanent', message: `Item not found: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('invalid uuid') ||
    lowerMessage.includes('invalid id') ||
    lowerMessage.includes('malformed')
  ) {
    return { type: 'permanent', message: `Invalid item ID format: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('unsupported language') ||
    lowerMessage.includes('invalid language')
  ) {
    return { type: 'permanent', message: `Unsupported language: ${errorMessage}` };
  }

  // Check if max retries exceeded (default max: 3)
  const maxRetries = 3;
  if (job.attempts >= maxRetries) {
    return { type: 'permanent', message: `Max retries exceeded (${maxRetries}): ${errorMessage}` };
  }

  // Transient errors - can retry
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('429')
  ) {
    return { type: 'transient', message: `Rate limit exceeded: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('econnreset') ||
    lowerMessage.includes('network')
  ) {
    return { type: 'transient', message: `Network error: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('service unavailable') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('gateway')
  ) {
    return { type: 'transient', message: `Service unavailable: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('connection') ||
    lowerMessage.includes('database') ||
    lowerMessage.includes('supabase')
  ) {
    return { type: 'transient', message: `Database error: ${errorMessage}` };
  }

  // Default to transient for unknown errors (safer - allows retry)
  return { type: 'transient', message: errorMessage };
}

// ===========================================================================
// Data Fetching
// ===========================================================================

/**
 * Fetch item record from the database for translation
 *
 * @param itemId - UUID of the item to fetch
 * @returns Item data if found, null otherwise
 * @throws Error if database query fails
 */
async function fetchItemForTranslation(itemId: string): Promise<ItemData | null> {
  console.log(`[ItemProcessor] Fetching item ${itemId} for translation`);

  const { data, error } = await supabaseAdmin
    .from('items')
    .select('id, name, description, source_language')
    .eq('id', itemId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      console.warn(`[ItemProcessor] Item ${itemId} not found`);
      return null;
    }
    console.error(`[ItemProcessor] Database error fetching item ${itemId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    console.warn(`[ItemProcessor] Item ${itemId} returned empty data`);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    source_language: data.source_language as SupportedLanguage | null,
  };
}

// ===========================================================================
// Translation Logic
// ===========================================================================

/**
 * Translation context for item name field
 */
const NAME_CONTEXT: TranslationContext = {
  contentType: 'item_name',
  domainContext: 'Household item or appliance name in a vacation rental property. Keep it concise and natural.',
  maxLength: 255,
  tone: 'concise',
};

/**
 * Translation context for item description field
 */
const DESCRIPTION_CONTEXT: TranslationContext = {
  contentType: 'item_description',
  domainContext: 'Description of a household item or appliance for vacation rental guests. Maintain helpful, friendly tone.',
  tone: 'friendly',
};

/**
 * Translate item name and description fields
 *
 * @param item - Item data to translate
 * @param sourceLanguage - Source language of the content
 * @param targetLanguage - Target language for translation
 * @returns Translated fields object
 * @throws Error if translation fails for required fields
 */
async function translateItemFields(
  item: ItemData,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslatedItemFields> {
  console.log(`[ItemProcessor] Translating item ${item.id} from ${sourceLanguage} to ${targetLanguage}`);

  const result: TranslatedItemFields = {
    name: '', // Will be populated below
  };

  // Translate name (required field)
  if (!item.name || item.name.trim() === '') {
    throw new Error('Item name is empty - cannot translate');
  }

  const nameResult = await translateText(
    item.name,
    sourceLanguage,
    targetLanguage,
    { context: NAME_CONTEXT }
  );
  result.name = nameResult.translatedText;
  console.log(`[ItemProcessor] Translated name: "${item.name}" -> "${result.name}"`);

  // Translate description (optional field)
  if (item.description && item.description.trim() !== '') {
    const descResult = await translateText(
      item.description,
      sourceLanguage,
      targetLanguage,
      { context: DESCRIPTION_CONTEXT }
    );
    result.description = descResult.translatedText;
    console.log(`[ItemProcessor] Translated description (${item.description.length} -> ${result.description.length} chars)`);
  } else {
    console.log(`[ItemProcessor] Skipping empty description`);
  }

  return result;
}

// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Store translated item content in the database
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * Sets translation_status to 'completed' and records translated_at timestamp.
 *
 * @param itemId - UUID of the item
 * @param language - Target language code
 * @param fields - Translated field values
 * @returns true if storage succeeded, false otherwise
 */
async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  fields: TranslatedItemFields
): Promise<boolean> {
  console.log(`[ItemProcessor] Storing translation for item ${itemId}, language ${language}`);

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('item_translations')
    .upsert(
      {
        item_id: itemId,
        language: language,
        name: fields.name,
        description: fields.description || null,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
      },
      {
        onConflict: 'item_id,language',
      }
    );

  if (error) {
    console.error(`[ItemProcessor] Failed to store item translation:`, error);
    return false;
  }

  console.log(`[ItemProcessor] Successfully stored translation for item ${itemId} in ${language}`);
  return true;
}

// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process a translation job for an item entity.
 *
 * This function orchestrates the complete item translation workflow:
 * 1. Fetches the item record from the database
 * 2. Validates the item exists and has content to translate
 * 3. Translates name and description fields using the translation service
 * 4. Stores the translation using UPSERT pattern
 * 5. Updates the job status to completed or failed
 *
 * Error Handling:
 * - Permanent errors (no retry): item not found, invalid ID, unsupported language
 * - Transient errors (retry eligible): rate limits, timeouts, service unavailable
 *
 * @param job - The translation job containing item ID, source/target languages, and metadata
 * @returns Processing result with success status, translated fields or error details
 *
 * @example
 * ```typescript
 * const result = await processItemTranslation({
 *   id: 'job-123',
 *   entityType: 'item',
 *   entityId: 'item-456',
 *   sourceLanguage: 'en',
 *   targetLanguage: 'fr',
 *   status: 'processing',
 *   attempts: 0,
 *   createdAt: '2026-01-21T12:00:00Z',
 * });
 *
 * if (result.success) {
 *   console.log('Translated:', result.translatedFields);
 * } else {
 *   console.error('Failed:', result.errorMessage, 'Retry:', result.errorType === 'transient');
 * }
 * ```
 */
export async function processItemTranslation(
  job: TranslationJob
): Promise<ItemProcessingResult> {
  const startTime = Date.now();
  const { entityId: itemId, sourceLanguage, targetLanguage } = job;

  console.log(`[ItemProcessor] Starting job ${job.id} for item ${itemId} (${sourceLanguage} -> ${targetLanguage})`);

  try {
    // 1. Fetch item record
    const item = await fetchItemForTranslation(itemId);

    if (!item) {
      const error = new Error(`Item ${itemId} not found or deleted`);
      const classification = categorizeError(error, job);

      await markJobFailed(job.id, classification.message);

      return {
        jobId: job.id,
        success: false,
        entityType: 'item',
        entityId: itemId,
        targetLanguage,
        errorMessage: classification.message,
        errorType: classification.type,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 2. Determine effective source language
    const effectiveSourceLanguage = item.source_language || sourceLanguage || 'en';

    // 3. Translate fields
    const translatedFields = await translateItemFields(
      item,
      effectiveSourceLanguage,
      targetLanguage
    );

    // 4. Store translation
    const stored = await storeItemTranslation(itemId, targetLanguage, translatedFields);

    if (!stored) {
      throw new Error('Failed to store translation in database');
    }

    // 5. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[ItemProcessor] Job ${job.id} completed successfully in ${Date.now() - startTime}ms`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'item',
      entityId: itemId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const classification = categorizeError(error, job);
    const errorMessage = classification.message;

    console.error(`[ItemProcessor] Job ${job.id} failed (${classification.type}):`, errorMessage);

    // Mark job as failed
    await markJobFailed(job.id, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'item',
      entityId: itemId,
      targetLanguage,
      errorMessage,
      errorType: classification.type,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
