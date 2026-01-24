/**
 * @fileoverview Translation Fetch Utilities for Epic 4 - Guest Experience
 *
 * This module provides utilities for fetching and merging translated content
 * from Epic 3 translation tables (item_translations, article_translations,
 * link_translations, tag_translations). It enables guest-facing pages to display
 * content in the guest's preferred language with graceful fallback to original content.
 *
 * @description
 * Key features:
 * - Fetches translations for items, articles, links, and tags
 * - Batch fetching with `.in()` for N+1 query prevention
 * - Field-by-field merge with fallback to original content
 * - Never throws errors - always returns result objects for graceful UI rendering
 * - Consistent error logging with [translations/fetch] prefix
 *
 * @since Epic 4 - Guest Experience
 * @see /src/types/l10n.ts - Type definitions
 * @see /src/lib/db-transforms.ts - Database transformation patterns
 * @see docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md - Implementation plan
 *
 * Last Modified: 2026-01-23 10:15
 */

import type { SupportedLanguage } from '@/types/l10n';
import { supabaseAdmin } from '@/lib/supabase';
import type { Item, ItemArticle, ItemLink } from '@/types';
import { dbItemToItem, dbArticleToArticle, dbLinkToLink } from '@/lib/db-transforms';

// =============================================================================
// Section 1: Type Definitions
// =============================================================================

/**
 * Generic result type for translation fetch operations.
 *
 * @description
 * All translation fetch functions return this wrapper type to enable
 * graceful error handling. Guest pages can always render content even
 * when translation fetching fails.
 *
 * @template T - The data type being returned
 * @since Epic 4 - Guest Experience
 */
export interface FetchTranslationResult<T> {
  /** Whether the fetch operation succeeded */
  success: boolean;
  /** The fetched data (undefined if success is false) */
  data?: T;
  /** Error message if success is false */
  error?: string;
  /** True when showing original content due to missing translation */
  isFallback: boolean;
}

/**
 * Metadata about the translation context for a fetched item.
 *
 * @description
 * Provides information about the translation state to help clients
 * understand what language is being displayed and whether it's a translation.
 *
 * @since Epic 4 - Guest Experience
 */
export interface TranslationMeta {
  /** The language originally requested by the guest */
  requestedLanguage: SupportedLanguage;
  /** The language actually being displayed (may differ if requested not available) */
  displayLanguage: SupportedLanguage;
  /** The original language the content was authored in */
  sourceLanguage: SupportedLanguage;
  /** Whether the displayed content is a translation (true) or original (false) */
  isTranslated: boolean;
}

/**
 * Translation data for an item (name and description only).
 *
 * @description
 * Represents the translatable fields from the item_translations table.
 * Used as an intermediate type before merging with the full Item object.
 *
 * @since Epic 4 - Guest Experience
 */
export interface ItemTranslationData {
  /** Translated item name */
  name: string;
  /** Translated item description (null if not translated) */
  description?: string | null;
}

/**
 * Translation data for an article (title and description only).
 *
 * @description
 * Represents the translatable fields from the article_translations table.
 * Used as an intermediate type before merging with the full ItemArticle object.
 *
 * @since Epic 4 - Guest Experience
 */
export interface ArticleTranslationData {
  /** Translated article title */
  title: string;
  /** Translated article description (null if not translated) */
  description?: string | null;
}

/**
 * Translation data for a link (title only).
 *
 * @description
 * Represents the translatable fields from the link_translations table.
 * Note: URLs are never translated as they are language-agnostic resources.
 *
 * @since Epic 4 - Guest Experience
 */
export interface LinkTranslationData {
  /** Translated link title */
  title: string;
}

/**
 * Translation data for a tag (label only).
 *
 * @description
 * Represents the translatable fields from the tag_translations table.
 * Tags use string keys (e.g., "appliance.dishwasher") instead of UUIDs.
 *
 * @since Epic 4 - Guest Experience
 */
export interface TagTranslationData {
  /** Translated tag display label */
  label: string;
}

// =============================================================================
// Section 2: Fetch Helper Functions
// =============================================================================

/**
 * Fetches translation data for a single item.
 *
 * @description
 * Retrieves the translated name and description for an item from the
 * item_translations table. Only returns completed translations (ignores
 * pending or failed translations).
 *
 * @param itemId - The UUID of the item to fetch translation for
 * @param language - The target language to fetch
 * @returns The translation data, or null if no translation found
 *
 * @throws Never - returns null on error instead
 *
 * @example
 * ```typescript
 * const translation = await fetchItemTranslations('abc-123', 'fr');
 * if (translation) {
 *   console.log(translation.name); // "Cafetière"
 * }
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export async function fetchItemTranslations(
  itemId: string,
  language: SupportedLanguage
): Promise<ItemTranslationData | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('item_translations')
      .select('name, description')
      .eq('item_id', itemId)
      .eq('language', language)
      .eq('translation_status', 'completed')
      .single();

    // PGRST116 = no rows found - this is expected when translation doesn't exist
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error(
        `[translations/fetch] Error fetching item translation for item ${itemId} in language ${language}:`,
        error
      );
      return null;
    }

    return {
      name: data.name,
      description: data.description,
    };
  } catch (err) {
    console.error(
      `[translations/fetch] Unexpected error fetching item translation for item ${itemId} in language ${language}:`,
      err
    );
    return null;
  }
}

/**
 * Batch fetches translations for multiple articles.
 *
 * @description
 * Efficiently fetches translations for multiple articles in a single query
 * using Supabase's `.in()` method to avoid the N+1 query problem.
 * Returns a Map for O(1) lookup when merging translations with original articles.
 *
 * For batches larger than 100 items, splits into chunks and processes in parallel.
 *
 * @param articleIds - Array of article UUIDs to fetch translations for
 * @param language - The target language to fetch
 * @returns Map with article ID as key and translation data as value
 *
 * @throws Never - returns empty Map on error instead
 *
 * @example
 * ```typescript
 * const articleIds = articles.map(a => a.id);
 * const translations = await fetchArticleTranslations(articleIds, 'fr');
 *
 * articles.forEach(article => {
 *   const translation = translations.get(article.id);
 *   if (translation) {
 *     article.title = translation.title;
 *   }
 * });
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export async function fetchArticleTranslations(
  articleIds: string[],
  language: SupportedLanguage
): Promise<Map<string, ArticleTranslationData>> {
  // Early return for empty array
  if (articleIds.length === 0) {
    return new Map();
  }

  try {
    // Split into chunks of 100 for large batches
    if (articleIds.length > 100) {
      const chunks: string[][] = [];
      for (let i = 0; i < articleIds.length; i += 100) {
        chunks.push(articleIds.slice(i, i + 100));
      }

      const chunkResults = await Promise.all(
        chunks.map(chunk => fetchArticleTranslations(chunk, language))
      );

      // Merge all chunk results into single Map
      const mergedMap = new Map<string, ArticleTranslationData>();
      for (const chunkMap of chunkResults) {
        for (const [key, value] of chunkMap) {
          mergedMap.set(key, value);
        }
      }
      return mergedMap;
    }

    const { data, error } = await supabaseAdmin
      .from('article_translations')
      .select('article_id, title, description')
      .in('article_id', articleIds)
      .eq('language', language)
      .eq('translation_status', 'completed');

    if (error) {
      console.error(
        `[translations/fetch] Error fetching ${articleIds.length} article translations in language ${language}:`,
        error
      );
      return new Map();
    }

    // Transform results into Map for O(1) lookup
    const translationsMap = new Map<string, ArticleTranslationData>();
    for (const row of data || []) {
      translationsMap.set(row.article_id, {
        title: row.title,
        description: row.description,
      });
    }

    return translationsMap;
  } catch (err) {
    console.error(
      `[translations/fetch] Unexpected error fetching ${articleIds.length} article translations in language ${language}:`,
      err
    );
    return new Map();
  }
}

/**
 * Batch fetches translations for multiple links.
 *
 * @description
 * Efficiently fetches translations for multiple links in a single query.
 * Note: Only link titles are translatable - URLs remain unchanged.
 *
 * For batches larger than 100 items, splits into chunks and processes in parallel.
 *
 * @param linkIds - Array of link UUIDs to fetch translations for
 * @param language - The target language to fetch
 * @returns Map with link ID as key and translation data as value
 *
 * @throws Never - returns empty Map on error instead
 *
 * @since Epic 4 - Guest Experience
 */
export async function fetchLinkTranslations(
  linkIds: string[],
  language: SupportedLanguage
): Promise<Map<string, LinkTranslationData>> {
  // Early return for empty array
  if (linkIds.length === 0) {
    return new Map();
  }

  try {
    // Split into chunks of 100 for large batches
    if (linkIds.length > 100) {
      const chunks: string[][] = [];
      for (let i = 0; i < linkIds.length; i += 100) {
        chunks.push(linkIds.slice(i, i + 100));
      }

      const chunkResults = await Promise.all(
        chunks.map(chunk => fetchLinkTranslations(chunk, language))
      );

      // Merge all chunk results into single Map
      const mergedMap = new Map<string, LinkTranslationData>();
      for (const chunkMap of chunkResults) {
        for (const [key, value] of chunkMap) {
          mergedMap.set(key, value);
        }
      }
      return mergedMap;
    }

    // Note: URLs are never translated, only titles
    const { data, error } = await supabaseAdmin
      .from('link_translations')
      .select('link_id, title')
      .in('link_id', linkIds)
      .eq('language', language)
      .eq('translation_status', 'completed');

    if (error) {
      console.error(
        `[translations/fetch] Error fetching ${linkIds.length} link translations in language ${language}:`,
        error
      );
      return new Map();
    }

    // Transform results into Map for O(1) lookup
    const translationsMap = new Map<string, LinkTranslationData>();
    for (const row of data || []) {
      translationsMap.set(row.link_id, {
        title: row.title,
      });
    }

    return translationsMap;
  } catch (err) {
    console.error(
      `[translations/fetch] Unexpected error fetching ${linkIds.length} link translations in language ${language}:`,
      err
    );
    return new Map();
  }
}

/**
 * Batch fetches translations for multiple tags.
 *
 * @description
 * Efficiently fetches translations for multiple tags in a single query.
 * Unlike other entities, tags use string keys (not UUIDs).
 *
 * Tag keys may include namespace prefixes for organization:
 * - System tags: "#room.kitchen", "#room.bathroom"
 * - Category tags: "appliance.dishwasher", "electronics.tv"
 * - User tags: "important", "needs-repair"
 *
 * For batches larger than 100 items, splits into chunks and processes in parallel.
 *
 * @param tagKeys - Array of tag key strings to fetch translations for
 * @param language - The target language to fetch
 * @returns Map with tag key as key and translation data as value
 *
 * @throws Never - returns empty Map on error instead
 *
 * @since Epic 4 - Guest Experience
 */
export async function fetchTagTranslations(
  tagKeys: string[],
  language: SupportedLanguage
): Promise<Map<string, TagTranslationData>> {
  // Early return for empty array
  if (tagKeys.length === 0) {
    return new Map();
  }

  try {
    // Split into chunks of 100 for large batches
    if (tagKeys.length > 100) {
      const chunks: string[][] = [];
      for (let i = 0; i < tagKeys.length; i += 100) {
        chunks.push(tagKeys.slice(i, i + 100));
      }

      const chunkResults = await Promise.all(
        chunks.map(chunk => fetchTagTranslations(chunk, language))
      );

      // Merge all chunk results into single Map
      const mergedMap = new Map<string, TagTranslationData>();
      for (const chunkMap of chunkResults) {
        for (const [key, value] of chunkMap) {
          mergedMap.set(key, value);
        }
      }
      return mergedMap;
    }

    // Note: tag_key is VARCHAR, not UUID
    const { data, error } = await supabaseAdmin
      .from('tag_translations')
      .select('tag_key, translated_value')
      .in('tag_key', tagKeys)
      .eq('language', language)
      .eq('translation_status', 'completed');

    if (error) {
      console.error(
        `[translations/fetch] Error fetching ${tagKeys.length} tag translations in language ${language}:`,
        error
      );
      return new Map();
    }

    // Transform results into Map for O(1) lookup
    const translationsMap = new Map<string, TagTranslationData>();
    for (const row of data || []) {
      translationsMap.set(row.tag_key, {
        label: row.translated_value,
      });
    }

    return translationsMap;
  } catch (err) {
    console.error(
      `[translations/fetch] Unexpected error fetching ${tagKeys.length} tag translations in language ${language}:`,
      err
    );
    return new Map();
  }
}

// =============================================================================
// Section 3: Translation Merge Helper Functions
// =============================================================================

/**
 * Merges item translation data with the original item.
 *
 * @description
 * Overlays translated fields onto the original item, preserving original
 * fields when the translation field is null or undefined.
 *
 * Merge semantics:
 * - null translation: return original item unchanged
 * - null/undefined translation field: preserve original field
 * - non-null translation field: override original field
 *
 * @param item - The original item object
 * @param translation - The translation data, or null if no translation exists
 * @returns The item with translations applied
 *
 * @since Epic 4 - Guest Experience
 */
export function mergeItemTranslation(
  item: Item,
  translation: ItemTranslationData | null
): Item {
  if (translation === null) {
    return item;
  }

  return {
    ...item,
    name: translation.name || item.name,
    description: translation.description !== undefined
      ? translation.description
      : item.description,
  };
}

/**
 * Merges article translation data with the original article.
 *
 * @description
 * Overlays translated fields onto the original article, preserving original
 * fields when the translation field is null or undefined.
 *
 * @param article - The original article object
 * @param translation - The translation data, or undefined if no translation exists
 * @returns The article with translations applied
 *
 * @since Epic 4 - Guest Experience
 */
export function mergeArticleTranslation(
  article: ItemArticle,
  translation: ArticleTranslationData | undefined
): ItemArticle {
  if (translation === undefined) {
    return article;
  }

  return {
    ...article,
    title: translation.title || article.title,
    description: translation.description !== undefined
      ? translation.description
      : article.description,
  };
}

/**
 * Merges link translation data with the original link.
 *
 * @description
 * Overlays translated title onto the original link, preserving original
 * title when the translation field is null or undefined.
 *
 * @param link - The original link object
 * @param translation - The translation data, or undefined if no translation exists
 * @returns The link with translations applied
 *
 * @since Epic 4 - Guest Experience
 */
export function mergeLinkTranslation(
  link: ItemLink,
  translation: LinkTranslationData | undefined
): ItemLink {
  if (translation === undefined) {
    return link;
  }

  // URL is never translated, only title
  return {
    ...link,
    title: translation.title || link.title,
  };
}

// =============================================================================
// Section 4: Main Entry Point Function
// =============================================================================

/** Extended Item type with nested articles and links for fetch result */
interface ItemWithRelations extends Item {
  articles?: ItemArticle[];
  links?: ItemLink[];
  sourceLanguage?: SupportedLanguage;
}

/** Return type for fetchTranslatedItem */
type TranslatedItemResult = ItemWithRelations & { translationMeta: TranslationMeta };

/**
 * Fetches an item by public ID with all translations merged.
 *
 * @description
 * This is the primary entry point for guest item pages. It:
 * 1. Fetches the item by public_id (guest-facing identifier)
 * 2. Includes nested articles and links
 * 3. Fetches all translations in parallel (item, articles, links, tags)
 * 4. Merges translations field-by-field
 * 5. Returns comprehensive result with translation metadata
 *
 * Error handling:
 * - Item not found: returns `success: false` with error
 * - Translation unavailable: returns `success: true` with `isFallback: true`
 * - Database error: logs and returns fallback content
 *
 * @param publicId - The public-facing identifier of the item (from QR code)
 * @param language - The target language to fetch translations for
 * @param options - Optional configuration
 * @param options.debug - Enable detailed merge logging for troubleshooting
 * @returns Result object with translated item data and metadata
 *
 * @throws Never - returns error in result object instead
 *
 * @example
 * ```typescript
 * // In a server component
 * const result = await fetchTranslatedItem('abc-123', 'fr');
 *
 * if (!result.success) {
 *   return <NotFound />;
 * }
 *
 * const { data } = result;
 * console.log(data.name); // Translated name or original fallback
 * console.log(data.translationMeta.isTranslated); // true if showing translation
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export async function fetchTranslatedItem(
  publicId: string,
  language: SupportedLanguage,
  options?: { debug?: boolean }
): Promise<FetchTranslationResult<TranslatedItemResult>> {
  const debug = options?.debug ?? false;

  try {
    // Fetch item first
    const { data: dbData, error: itemError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('public_id', publicId)
      .single();

    // Handle item not found
    if (itemError) {
      if (itemError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Item not found',
          isFallback: false,
        };
      }

      console.error('[translations/fetch] Error fetching item:', itemError);
      return {
        success: false,
        error: 'Failed to fetch item',
        isFallback: false,
      };
    }

    // Transform database row to TypeScript types
    const item = dbItemToItem(dbData);

    // Get source language from item (Epic 3 schema, default 'en')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceLanguage: SupportedLanguage = ((dbData as any).source_language as SupportedLanguage) || 'en';

    // Fetch articles and links in parallel
    const [articlesResult, linksResult] = await Promise.all([
      supabaseAdmin
        .from('item_articles')
        .select('*')
        .eq('item_id', item.id)
        .order('display_order', { ascending: true }),
      supabaseAdmin
        .from('item_links')
        .select('*')
        .eq('item_id', item.id)
        .order('display_order', { ascending: true }),
    ]);

    // Transform nested articles
    const articles: ItemArticle[] = (articlesResult.data || []).map(dbArticle =>
      dbArticleToArticle(dbArticle)
    );

    // Transform nested links
    const links: ItemLink[] = (linksResult.data || []).map(dbLink =>
      dbLinkToLink(dbLink)
    );

    // Extract IDs for batch queries
    const articleIds = articles.map(a => a.id);
    const linkIds = links.map(l => l.id);
    const tagKeys = item.tags || [];

    // Fetch all translations in parallel
    const [itemTranslation, articleTranslations, linkTranslations, tagTranslations] =
      await Promise.all([
        fetchItemTranslations(item.id, language),
        fetchArticleTranslations(articleIds, language),
        fetchLinkTranslations(linkIds, language),
        fetchTagTranslations(tagKeys, language),
      ]);

    // Determine if translation is available
    const isTranslated = itemTranslation !== null;

    // Log fallback if no translation available
    if (!isTranslated && language !== sourceLanguage) {
      console.info(
        `[translations/fetch] Translation not available for item ${publicId} in ${language}, using original content`
      );
    }

    // Merge item translation
    const mergedItem = mergeItemTranslation(item, itemTranslation);

    // Merge article translations
    const mergedArticles = articles.map(article =>
      mergeArticleTranslation(article, articleTranslations.get(article.id))
    );

    // Merge link translations
    const mergedLinks = links.map(link =>
      mergeLinkTranslation(link, linkTranslations.get(link.id))
    );

    // Debug logging
    if (debug) {
      console.log(
        `[translations/fetch] Merged item translation: {name translated: ${itemTranslation?.name ? 'yes' : 'no'}, description translated: ${itemTranslation?.description !== undefined ? 'yes' : 'no'}}`
      );
      console.log(
        `[translations/fetch] Merged ${articleTranslations.size} article translations, ${linkTranslations.size} link translations, ${tagTranslations.size} tag translations`
      );
    }

    // Build translation metadata
    const translationMeta: TranslationMeta = {
      requestedLanguage: language,
      displayLanguage: isTranslated ? language : sourceLanguage,
      sourceLanguage,
      isTranslated,
    };

    // Build result object
    const result: TranslatedItemResult = {
      ...mergedItem,
      articles: mergedArticles,
      links: mergedLinks,
      sourceLanguage,
      translationMeta,
    };

    return {
      success: true,
      data: result,
      isFallback: !isTranslated,
    };
  } catch (err) {
    console.error('[translations/fetch] Unexpected error in fetchTranslatedItem:', err);
    return {
      success: false,
      error: 'Internal error',
      isFallback: false,
    };
  }
}
