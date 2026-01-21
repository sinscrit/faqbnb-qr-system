/**
 * Translation Storage Utilities
 * Part of REQ-E03-005: Implement Translation Storage Utilities
 *
 * Provides dedicated storage functions for persisting translated content
 * to the database using an UPSERT pattern for each entity type.
 *
 * @module content-translation/storage/translation-storage
 * @created 2026-01-21
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  SupportedLanguage,
  TranslationStatus,
  isSupportedLanguage,
} from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Result Types
// ============================================================================

/**
 * Standard result type for all storage operations.
 * Provides consistent success/error handling across storage functions.
 */
export interface TranslationStorageResult {
  /** Whether the storage operation succeeded */
  success: boolean;
  /** The database ID of the upserted translation record */
  translationId?: string;
  /** Error message if operation failed */
  error?: string;
}

// ============================================================================
// Input Data Types
// ============================================================================

/**
 * Data structure for storing item translations.
 * Used with storeItemTranslation function.
 */
export interface ItemTranslationData {
  /** Translated item name (required) */
  name: string;
  /** Translated item description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

/**
 * Data structure for storing article translations.
 * Used with storeArticleTranslation function.
 */
export interface ArticleTranslationData {
  /** Translated article title (required) */
  title: string;
  /** Translated article description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** User ID who reviewed/created manual translation (optional) */
  reviewedBy?: string;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

/**
 * Data structure for storing link translations.
 * Used with storeLinkTranslation function.
 */
export interface LinkTranslationData {
  /** Translated link title (required) */
  title: string;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Validation result for storage parameters.
 * @internal
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate common storage parameters.
 * Checks that entity ID is non-empty and language is valid.
 *
 * @param entityId - Entity identifier to validate
 * @param language - Language code to validate
 * @param idFieldName - Name of the ID field for error messages
 * @returns Validation result
 * @internal
 */
function validateStorageParams(
  entityId: string,
  language: string,
  idFieldName: string
): ValidationResult {
  // Check entity ID
  if (!entityId || entityId.trim() === '') {
    return {
      valid: false,
      error: `Missing required parameter: ${idFieldName} is required`,
    };
  }

  // Validate UUID format for entity IDs (except tags which use string keys)
  if (idFieldName !== 'tagKey') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(entityId)) {
      return {
        valid: false,
        error: `Invalid ${idFieldName} format: expected UUID`,
      };
    }
  }

  // Check language
  if (!isSupportedLanguage(language)) {
    return {
      valid: false,
      error: `Invalid language code: ${language}. Must be one of: en, fr, es, de, nl, it`,
    };
  }

  return { valid: true };
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Store item translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 *
 * @param itemId - UUID of the item to translate
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param data - Translation data object containing name and optional description
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeItemTranslation(
 *   'item-uuid-123',
 *   'fr',
 *   { name: 'Cafetière', description: 'Machine à café automatique' }
 * );
 * if (result.success) {
 *   console.log('Stored translation:', result.translationId);
 * }
 * ```
 */
export async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  data: ItemTranslationData
): Promise<TranslationStorageResult> {
  // Validate required parameters
  const validation = validateStorageParams(itemId, language, 'itemId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate required field
  if (!data.name || data.name.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: name is required for item translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('item_translations')
      .upsert(
        {
          item_id: itemId,
          language: language,
          name: data.name,
          description: data.description || null,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'item_id,language',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store item translation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing item translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Store article translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 *
 * @param articleId - UUID of the article to translate
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param data - Translation data object containing title and optional description
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeArticleTranslation(
 *   'article-uuid-456',
 *   'es',
 *   {
 *     title: 'Cómo usar la cafetera',
 *     description: 'Instrucciones paso a paso',
 *     status: 'manual',
 *     reviewedBy: 'user-uuid-789'
 *   }
 * );
 * ```
 */
export async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  data: ArticleTranslationData
): Promise<TranslationStorageResult> {
  // Validate required parameters
  const validation = validateStorageParams(articleId, language, 'articleId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate required field
  if (!data.title || data.title.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: title is required for article translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('article_translations')
      .upsert(
        {
          article_id: articleId,
          language: language,
          title: data.title,
          description: data.description || null,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
          reviewed_by: data.reviewedBy || null,
        },
        {
          onConflict: 'article_id,language',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store article translation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing article translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Store link translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 * Note: Only the title is translated; URLs remain unchanged.
 *
 * @param linkId - UUID of the link to translate
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param data - Translation data object containing title
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeLinkTranslation(
 *   'link-uuid-321',
 *   'de',
 *   { title: 'Bedienungsanleitung PDF' }
 * );
 * ```
 */
export async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  data: LinkTranslationData
): Promise<TranslationStorageResult> {
  // Validate required parameters
  const validation = validateStorageParams(linkId, language, 'linkId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate required field
  if (!data.title || data.title.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: title is required for link translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('link_translations')
      .upsert(
        {
          link_id: linkId,
          language: language,
          title: data.title,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'link_id,language',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store link translation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing link translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Store tag translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 * Tags use a string key identifier rather than UUID.
 *
 * @param tagKey - Tag key identifier (string, not UUID)
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param value - Translated tag value
 * @param isSystemTag - Whether this is a system-defined tag (default: false)
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * // User-created tag
 * const result = await storeTagTranslation(
 *   'coffee-maker',
 *   'it',
 *   'macchina del caffè',
 *   false
 * );
 *
 * // System tag (typically seeded during initialization)
 * const systemResult = await storeTagTranslation(
 *   'kitchen',
 *   'fr',
 *   'cuisine',
 *   true
 * );
 * ```
 */
export async function storeTagTranslation(
  tagKey: string,
  language: SupportedLanguage,
  value: string,
  isSystemTag: boolean = false
): Promise<TranslationStorageResult> {
  // Validate required parameters
  if (!tagKey || tagKey.trim() === '') {
    return {
      success: false,
      error: 'Missing required parameter: tagKey is required',
    };
  }

  if (!isSupportedLanguage(language)) {
    return {
      success: false,
      error: `Invalid language code: ${language}. Must be one of: en, fr, es, de, nl, it`,
    };
  }

  // Validate required field
  if (!value || value.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: value is required for tag translation',
    };
  }

  try {
    const { data: result, error } = await supabaseAdmin
      .from('tag_translations')
      .upsert(
        {
          tag_key: tagKey,
          language: language,
          translated_value: value,
          is_system_tag: isSystemTag,
        },
        {
          onConflict: 'tag_key,language',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store tag translation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing tag translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================================================
// Deletion Utilities
// ============================================================================

/**
 * Deletes all translations for a given entity.
 * Used when content is updated and translations need to be re-queued.
 *
 * @param entityType - The type of entity ('item', 'article', or 'link')
 * @param entityId - The ID of the entity whose translations should be deleted
 * @returns Result indicating success/failure of the deletion
 *
 * @example
 * ```typescript
 * // Delete all translations for an article before re-translating
 * await deleteEntityTranslations('article', 'abc-123');
 * ```
 */
export async function deleteEntityTranslations(
  entityType: 'item' | 'article' | 'link',
  entityId: string
): Promise<TranslationStorageResult> {
  // Validate required parameters
  if (!entityType) {
    return {
      success: false,
      error: 'Missing required parameter: entityType is required',
    };
  }

  if (!entityId || entityId.trim() === '') {
    return {
      success: false,
      error: 'Missing required parameter: entityId is required',
    };
  }

  try {
    let error: any = null;

    // Use typed table access based on entity type
    switch (entityType) {
      case 'item':
        ({ error } = await supabaseAdmin
          .from('item_translations')
          .delete()
          .eq('item_id', entityId));
        break;
      case 'article':
        ({ error } = await supabaseAdmin
          .from('article_translations')
          .delete()
          .eq('article_id', entityId));
        break;
      case 'link':
        ({ error } = await supabaseAdmin
          .from('link_translations')
          .delete()
          .eq('link_id', entityId));
        break;
      default:
        return {
          success: false,
          error: `Invalid entity type: ${entityType}. Must be one of: item, article, link`,
        };
    }

    if (error) {
      console.error(`[TranslationStorage] Failed to delete ${entityType} translations:`, error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[TranslationStorage] Successfully deleted translations for ${entityType}:`, entityId);
    return {
      success: true,
    };
  } catch (error) {
    console.error(`[TranslationStorage] Exception deleting ${entityType} translations:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
