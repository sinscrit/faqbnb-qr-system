/**
 * Article Translation Processor
 * Part of REQ-E03-015: Implement Article Translation Processor
 *
 * Processes translation jobs for article entities. Retrieves article records,
 * translates title and description fields, stores results, and updates job status.
 *
 * This processor is invoked by the job queue routing system when a translation
 * job with entityType='article' is dequeued. It provides:
 * - Error classification (permanent vs transient) for retry decisions
 * - Domain-specific translation contexts for article fields
 * - UPSERT-based storage to article_translations table
 * - Comprehensive logging for debugging
 *
 * @module content-translation/processors/article-processor
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
 * Article content retrieved from the database for translation
 */
interface ArticleData {
  id: string;
  title: string;
  description: string | null;
  source_language: SupportedLanguage | null;
  updated_at: string | null; // For source_version_at tracking (REQ-E05-004)
}

/**
 * Translated article fields ready for storage
 */
interface TranslatedArticleFields {
  title: string;
  description?: string;
}

/**
 * Result of processing an article translation job
 */
export interface ArticleProcessingResult {
  jobId: string;
  success: boolean;
  entityType: 'article';
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: TranslatedArticleFields;
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
 * - Article not found (deleted)
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
    return { type: 'permanent', message: `Article not found: ${errorMessage}` };
  }

  if (
    lowerMessage.includes('invalid uuid') ||
    lowerMessage.includes('invalid id') ||
    lowerMessage.includes('malformed')
  ) {
    return { type: 'permanent', message: `Invalid article ID format: ${errorMessage}` };
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
 * Fetch article record from the database for translation
 *
 * Retrieves article data from the item_articles table including
 * title, description, and source_language fields.
 *
 * @param articleId - UUID of the article to fetch
 * @returns Article data if found, null otherwise
 * @throws Error if database query fails
 */
async function fetchArticleForTranslation(articleId: string): Promise<ArticleData | null> {
  console.log(`[ArticleProcessor] Fetching article ${articleId} for translation`);

  const { data, error } = await supabaseAdmin
    .from('item_articles')
    .select('id, title, description, source_language, updated_at')
    .eq('id', articleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      console.warn(`[ArticleProcessor] Article ${articleId} not found`);
      return null;
    }
    console.error(`[ArticleProcessor] Database error fetching article ${articleId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    console.warn(`[ArticleProcessor] Article ${articleId} returned empty data`);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    source_language: data.source_language as SupportedLanguage | null,
    updated_at: data.updated_at, // For source_version_at tracking (REQ-E05-004)
  };
}

// ===========================================================================
// Translation Logic
// ===========================================================================

/**
 * Translation context for article title field
 *
 * Article titles in vacation rental context are typically instruction titles
 * such as "How to use the Coffee Maker" or "WiFi Connection Guide"
 */
const TITLE_CONTEXT: TranslationContext = {
  contentType: 'article_title',
  domainContext: 'Title of an instruction article for vacation rental guests. Should be clear, descriptive, and action-oriented.',
  maxLength: 255,
  tone: 'concise',
};

/**
 * Translation context for article description field
 *
 * Article descriptions are help content explaining how to use appliances,
 * troubleshoot issues, or follow property rules.
 */
const DESCRIPTION_CONTEXT: TranslationContext = {
  contentType: 'article_description',
  domainContext: 'FAQ article content in vacation rental property context. Help guide for guests with instructions, troubleshooting, or property information. Maintain helpful and friendly tone.',
  tone: 'friendly',
};

/**
 * Translate article title and description fields
 *
 * @param article - Article data to translate
 * @param sourceLanguage - Source language of the content
 * @param targetLanguage - Target language for translation
 * @returns Translated fields object
 * @throws Error if translation fails for required fields
 */
async function translateArticleFields(
  article: ArticleData,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<TranslatedArticleFields> {
  console.log(`[ArticleProcessor] Translating article ${article.id} from ${sourceLanguage} to ${targetLanguage}`);

  const result: TranslatedArticleFields = {
    title: '', // Will be populated below
  };

  // Translate title (required field)
  if (!article.title || article.title.trim() === '') {
    throw new Error('Article title is empty - cannot translate');
  }

  const titleResult = await translateText(
    article.title,
    sourceLanguage,
    targetLanguage,
    { context: TITLE_CONTEXT }
  );
  result.title = titleResult.translatedText;
  console.log(`[ArticleProcessor] Translated title: "${article.title}" -> "${result.title}"`);

  // Translate description (optional field)
  if (article.description && article.description.trim() !== '') {
    const descResult = await translateText(
      article.description,
      sourceLanguage,
      targetLanguage,
      { context: DESCRIPTION_CONTEXT }
    );
    result.description = descResult.translatedText;
    console.log(`[ArticleProcessor] Translated description (${article.description.length} -> ${result.description.length} chars)`);
  } else {
    console.log(`[ArticleProcessor] Skipping empty description`);
  }

  return result;
}

// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Store translated article content in the database
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * Sets translation_status to 'completed' and records translated_at timestamp.
 * Also stores source_version_at for stale translation detection (REQ-E05-004).
 *
 * @param articleId - UUID of the article
 * @param language - Target language code
 * @param fields - Translated field values
 * @param sourceVersionAt - Source entity's updated_at timestamp for stale detection
 * @returns true if storage succeeded, false otherwise
 */
async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  fields: TranslatedArticleFields,
  sourceVersionAt: string | null
): Promise<boolean> {
  console.log(`[ArticleProcessor] Storing translation for article ${articleId}, language ${language}`);

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('article_translations')
    .upsert(
      {
        article_id: articleId,
        language: language,
        title: fields.title,
        description: fields.description || null,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
        source_version_at: sourceVersionAt, // REQ-E05-004: For stale translation detection
      },
      {
        onConflict: 'article_id,language',
      }
    );

  if (error) {
    console.error(`[ArticleProcessor] Failed to store article translation:`, error);
    return false;
  }

  console.log(`[ArticleProcessor] Successfully stored translation for article ${articleId} in ${language}`);
  return true;
}

// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process a translation job for an article entity.
 *
 * This function orchestrates the complete article translation workflow:
 * 1. Fetches the article record from the item_articles table
 * 2. Validates the article exists and has content to translate
 * 3. Translates title and description fields using the translation service
 * 4. Stores the translation in article_translations using UPSERT pattern
 * 5. Updates the job status to completed or failed
 *
 * Error Handling:
 * - Permanent errors (no retry): article not found, invalid ID, unsupported language
 * - Transient errors (retry eligible): rate limits, timeouts, service unavailable
 *
 * @param job - The translation job containing article ID, source/target languages, and metadata
 * @returns Processing result with success status, translated fields or error details
 *
 * @example
 * ```typescript
 * const result = await processArticleTranslation({
 *   id: 'job-123',
 *   entityType: 'article',
 *   entityId: 'article-456',
 *   sourceLanguage: 'en',
 *   targetLanguage: 'fr',
 *   status: 'processing',
 *   attempts: 0,
 *   createdAt: '2026-01-20T12:00:00Z',
 * });
 *
 * if (result.success) {
 *   console.log('Translated:', result.translatedFields);
 * } else {
 *   console.error('Failed:', result.errorMessage, 'Retry:', result.errorType === 'transient');
 * }
 * ```
 */
export async function processArticleTranslation(
  job: TranslationJob
): Promise<ArticleProcessingResult> {
  const startTime = Date.now();
  const { entityId: articleId, sourceLanguage, targetLanguage } = job;
  const semaphore = getTranslationSemaphore();

  console.log(`[ArticleProcessor] Starting job ${job.id} for article ${articleId} (${sourceLanguage} -> ${targetLanguage})`);

  try {
    // 1. Fetch article record (outside semaphore - DB query doesn't need rate limiting)
    const article = await fetchArticleForTranslation(articleId);

    if (!article) {
      const error = new Error(`Article ${articleId} not found or deleted`);
      const classification = categorizeError(error, job);

      await markJobFailed(job.id, classification.message);

      return {
        jobId: job.id,
        success: false,
        entityType: 'article',
        entityId: articleId,
        targetLanguage,
        errorMessage: classification.message,
        errorType: classification.type,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 2. Determine effective source language
    // Priority: article's source_language > job's sourceLanguage > 'en' default
    const effectiveSourceLanguage = article.source_language || sourceLanguage || 'en';

    // 3. Translate fields (with concurrency control)
    // Acquire semaphore slot before making translation API calls
    await semaphore.acquire();
    let translatedFields: TranslatedArticleFields;
    try {
      translatedFields = await translateArticleFields(
        article,
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
    // REQ-E05-004: Pass source updated_at for stale translation detection
    const stored = await storeArticleTranslation(articleId, targetLanguage, translatedFields, article.updated_at);

    if (!stored) {
      throw new Error('Failed to store translation in database');
    }

    // 5. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[ArticleProcessor] Job ${job.id} completed successfully in ${Date.now() - startTime}ms`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'article',
      entityId: articleId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const classification = categorizeError(error, job);
    const errorMessage = classification.message;

    console.error(`[ArticleProcessor] Job ${job.id} failed (${classification.type}):`, errorMessage);

    // Mark job as failed
    await markJobFailed(job.id, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'article',
      entityId: articleId,
      targetLanguage,
      errorMessage,
      errorType: classification.type,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
