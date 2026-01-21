/**
 * Link Translation Processor
 * Part of REQ-E03-016: Implement Link Translation Processor
 *
 * Processes translation jobs for link entities. Retrieves link records,
 * translates ONLY the title field (never the URL), stores results,
 * and updates job status.
 *
 * This is the simplest content translation processor as links have only
 * ONE translatable field (title). URLs must be preserved unchanged to
 * maintain link functionality across all languages.
 *
 * @module content-translation/processors/link-processor
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import type { TranslationJob, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
import type { TranslationContext } from '@/lib/translation-service/translation-service.types';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import {
  getTranslationSemaphore,
  isRateLimitError,
} from '@/lib/job-queue';

// ===========================================================================
// Type Definitions
// ===========================================================================

/**
 * Link content retrieved from the database for translation
 *
 * Note: URL, thumbnail_url, and link_type are intentionally NOT included
 * as they must never be translated.
 */
interface LinkData {
  id: string;
  title: string;
  source_language: SupportedLanguage | null;
  // The following fields exist in item_links but are NOT translatable:
  // url: string (preserved as-is across all languages)
  // thumbnail_url: string | null (preserved as-is)
  // link_type: string (preserved as-is)
}

/**
 * Translated link fields ready for storage
 *
 * Only contains title - the sole translatable field for links
 */
interface TranslatedLinkFields {
  title: string;
}

/**
 * Result of processing a link translation job
 */
export interface LinkProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'link';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: TranslatedLinkFields;
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
 * - Link not found (deleted)
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
    return { type: 'permanent', message: `Link not found: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('invalid uuid') ||
    lowerMessage.includes('invalid id') ||
    lowerMessage.includes('malformed')
  ) {
    return { type: 'permanent', message: `Invalid link ID format: ${errorMessage}` };
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
 * Fetch link record from the database for translation
 *
 * IMPORTANT: Only fetches title and source_language fields.
 * The URL field is intentionally NOT fetched because:
 * 1. URLs must never be translated (would break the link)
 * 2. Not needed for translation processing
 * 3. Reduces data transfer
 *
 * @param linkId - UUID of the link to fetch
 * @returns Link data if found, null otherwise
 * @throws Error if database query fails
 */
async function fetchLinkForTranslation(linkId: string): Promise<LinkData | null> {
  console.log(`[LinkProcessor] Fetching link ${linkId} for translation`);

  const { data, error } = await supabaseAdmin
    .from('item_links')
    .select('id, title, source_language')
    // Note: URL is NOT selected - it must never be translated
    .eq('id', linkId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      console.warn(`[LinkProcessor] Link ${linkId} not found`);
      return null;
    }
    console.error(`[LinkProcessor] Database error fetching link ${linkId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    console.warn(`[LinkProcessor] Link ${linkId} returned empty data`);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    source_language: data.source_language as SupportedLanguage | null,
  };
}

// ===========================================================================
// Translation Logic
// ===========================================================================

/**
 * Translation context for link title field
 *
 * Link titles in vacation rental context describe external resources:
 * - "How to use the dishwasher (YouTube video)"
 * - "WiFi Setup Guide PDF"
 * - "Appliance Manual"
 *
 * Titles should be concise but descriptive enough for guests to understand
 * what the link contains before clicking.
 */
const TITLE_CONTEXT: TranslationContext = {
  contentType: 'link_title',
  domainContext: 'Resource link title for vacation rental property instructions. External reference to video, PDF, or other media. Title should help guest understand the linked content.',
  maxLength: 255,
  tone: 'concise',
};

/**
 * Translate link title field
 *
 * NOTE: Only translates the title field. URLs are NEVER translated.
 *
 * @param link - Link data containing title to translate
 * @param sourceLanguage - Source language of the content
 * @param targetLanguage - Target language for translation
 * @returns Translated title
 * @throws Error if translation fails
 */
async function translateLinkTitle(
  link: LinkData,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslatedLinkFields> {
  console.log(`[LinkProcessor] Translating link ${link.id} title from ${sourceLanguage} to ${targetLanguage}`);

  // Validate title is not empty
  if (!link.title || link.title.trim() === '') {
    throw new Error('Link title is empty - cannot translate');
  }

  // Translate title (the only translatable field for links)
  const titleResult = await translateText(
    link.title,
    sourceLanguage,
    targetLanguage,
    { context: TITLE_CONTEXT }
  );

  console.log(`[LinkProcessor] Translated title: "${link.title}" -> "${titleResult.translatedText}"`);

  return {
    title: titleResult.translatedText,
  };
}

// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Store translated link title in the database
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * Sets translation_status to 'completed' and records translated_at timestamp.
 *
 * NOTE: Only stores title translation. The link_translations table schema:
 * - link_id: UUID (foreign key to item_links)
 * - language: language code
 * - title: translated title
 * - translation_status: 'completed' | 'failed' | 'manual'
 * - translated_at: timestamp
 *
 * @param linkId - UUID of the link
 * @param language - Target language code
 * @param fields - Translated title
 * @returns true if storage succeeded, false otherwise
 */
async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  fields: TranslatedLinkFields
): Promise<boolean> {
  console.log(`[LinkProcessor] Storing translation for link ${linkId}, language ${language}`);

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('link_translations')
    .upsert(
      {
        link_id: linkId,
        language: language,
        title: fields.title,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
      },
      {
        onConflict: 'link_id,language',
      }
    );

  if (error) {
    console.error(`[LinkProcessor] Failed to store link translation:`, error);
    return false;
  }

  console.log(`[LinkProcessor] Successfully stored translation for link ${linkId} in ${language}`);
  return true;
}

// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process a translation job for a link entity
 *
 * This function orchestrates the complete link translation workflow:
 * 1. Fetches the link record from the item_links table
 * 2. Validates the link exists and has a title to translate
 * 3. Translates ONLY the title field (URLs are never translated)
 * 4. Stores the translation in link_translations using UPSERT pattern
 * 5. Updates the job status to completed or failed
 *
 * KEY DIFFERENCE FROM ITEM/ARTICLE PROCESSORS:
 * Links have only ONE translatable field (title). The URL must be preserved
 * unchanged across all languages to maintain link functionality.
 *
 * Error Handling:
 * - Permanent errors (no retry): link not found, invalid ID, unsupported language
 * - Transient errors (retry eligible): rate limits, timeouts, service unavailable
 *
 * @param job - The translation job containing link ID, source/target languages, and metadata
 * @returns Processing result with success status, translated title or error details
 *
 * @example
 * ```typescript
 * const result = await processLinkTranslation({
 *   id: 'job-123',
 *   entityType: 'link',
 *   entityId: 'link-456',
 *   sourceLanguage: 'en',
 *   targetLanguage: 'fr',
 *   status: 'processing',
 *   attempts: 0,
 *   createdAt: '2026-01-20T12:00:00Z',
 * });
 *
 * if (result.success) {
 *   console.log('Translated title:', result.translatedFields?.title);
 * } else {
 *   console.error('Failed:', result.errorMessage, 'Retry:', result.errorType === 'transient');
 * }
 * ```
 */
export async function processLinkTranslation(
  job: TranslationJob
): Promise<LinkProcessingResult> {
  const startTime = Date.now();
  const { entityId: linkId, sourceLanguage, targetLanguage } = job;
  const semaphore = getTranslationSemaphore();

  console.log(`[LinkProcessor] Starting job ${job.id} for link ${linkId} (${sourceLanguage} -> ${targetLanguage})`);

  try {
    // 1. Fetch link record (outside semaphore - DB query doesn't need rate limiting)
    const link = await fetchLinkForTranslation(linkId);

    if (!link) {
      const error = new Error(`Link ${linkId} not found or deleted`);
      const classification = categorizeError(error, job);

      await markJobFailed(job.id, classification.message);

      return {
        jobId: job.id,
        success: false,
        entityType: 'link',
        entityId: linkId,
        targetLanguage,
        errorMessage: classification.message,
        errorType: classification.type,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 2. Determine effective source language
    // Priority: link's source_language > job's sourceLanguage > 'en' default
    const effectiveSourceLanguage = link.source_language || sourceLanguage || 'en';

    // 3. Translate title (with concurrency control)
    // Acquire semaphore slot before making translation API calls
    await semaphore.acquire();
    let translatedFields: TranslatedLinkFields;
    try {
      translatedFields = await translateLinkTitle(
        link,
        effectiveSourceLanguage,
        targetLanguage
      );
      // Notify success to reset rate limit counter
      semaphore.notifySuccess();
    } catch (translationError) {
      // Check for rate limit error and notify semaphore
      if (isRateLimitError(translationError)) {
        semaphore.notifyRateLimit();
      }
      throw translationError;
    } finally {
      // ALWAYS release slot
      semaphore.release();
    }

    // 4. Store translation (outside semaphore - DB operation doesn't need rate limiting)
    const stored = await storeLinkTranslation(linkId, targetLanguage, translatedFields);

    if (!stored) {
      throw new Error('Failed to store link translation in database');
    }

    // 5. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[LinkProcessor] Job ${job.id} completed successfully in ${Date.now() - startTime}ms`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'link',
      entityId: linkId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const classification = categorizeError(error, job);
    const errorMessage = classification.message;

    console.error(`[LinkProcessor] Job ${job.id} failed (${classification.type}):`, errorMessage);

    // Mark job as failed
    await markJobFailed(job.id, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'link',
      entityId: linkId,
      targetLanguage,
      errorMessage,
      errorType: classification.type,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
