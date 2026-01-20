/**
 * Article Translation Trigger
 * Part of REQ-E03-003: Implement Entity-Specific Translation Triggers
 *
 * This module provides the trigger function for queueing translations
 * of article content (title and description fields) when articles are
 * created or updated.
 *
 * @module content-translation/triggers/article-trigger
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
 * Pre-defined translation contexts for article fields.
 * These provide domain-specific guidance to the AI translation provider.
 */
const ARTICLE_TRANSLATION_CONTEXTS = {
  title: {
    contentType: 'article_title' as const,
    domainContext: 'property_rental_instructions',
    maxLength: 255,
  },
  description: {
    contentType: 'article_description' as const,
    domainContext: 'property_rental_instructions',
  },
} as const;

// ============================================================================
// Trigger Function
// ============================================================================

/**
 * Triggers translation for an article's translatable fields.
 *
 * Fetches the article from the database, extracts title and description fields,
 * and queues translation jobs for all target languages (excluding the source language).
 *
 * @param articleId - UUID of the article to translate
 * @param sourceLanguage - The language code of the article's original content
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * // Trigger translations for a newly created article
 * const result = await triggerArticleTranslation('article-123', 'en');
 *
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 *   console.log('Job IDs:', result.jobIds);
 * } else {
 *   console.error('Failed to queue translations:', result.error);
 * }
 * ```
 */
export async function triggerArticleTranslation(
  articleId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('ARTICLE_TRIGGER: Starting article translation', {
      articleId,
      sourceLanguage,
    });

    // Fetch article from database
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('item_articles')
      .select('id, title, description')
      .eq('id', articleId)
      .single();

    // Handle fetch error
    if (fetchError) {
      console.error('ARTICLE_TRIGGER: Database error fetching article', {
        articleId,
        error: fetchError.message,
      });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Failed to fetch article: ${fetchError.message}`,
      };
    }

    // Handle article not found
    if (!article) {
      console.error('ARTICLE_TRIGGER: Article not found', { articleId });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Article not found: ${articleId}`,
      };
    }

    // Build translatable fields array
    const fields: TranslatableField[] = [];

    // Add title field if it has a value
    if (article.title && article.title.trim()) {
      fields.push({
        fieldName: 'title',
        value: article.title,
        context: {
          contentType: ARTICLE_TRANSLATION_CONTEXTS.title.contentType,
          domainContext: ARTICLE_TRANSLATION_CONTEXTS.title.domainContext,
        },
        maxLength: ARTICLE_TRANSLATION_CONTEXTS.title.maxLength,
      });
    }

    // Add description field if it has a value
    if (article.description && article.description.trim()) {
      fields.push({
        fieldName: 'description',
        value: article.description,
        context: {
          contentType: ARTICLE_TRANSLATION_CONTEXTS.description.contentType,
          domainContext: ARTICLE_TRANSLATION_CONTEXTS.description.domainContext,
        },
      });
    }

    // If no fields to translate, return success with empty arrays
    if (fields.length === 0) {
      console.log('ARTICLE_TRIGGER: No translatable fields found', { articleId });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // Queue translations via orchestrator
    console.log('ARTICLE_TRIGGER: Queuing translations', {
      articleId,
      fieldCount: fields.length,
      fieldNames: fields.map((f) => f.fieldName),
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'article',
        entityId: articleId,
        sourceLanguage,
        fields,
      },
      trigger: 'create',
    });

    console.log('ARTICLE_TRIGGER: Translation queuing complete', {
      articleId,
      success: result.success,
      jobCount: result.jobIds.length,
      queuedLanguages: result.queuedLanguages,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('ARTICLE_TRIGGER: Exception in triggerArticleTranslation', {
      articleId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering article translation: ${errorMessage}`,
    };
  }
}
