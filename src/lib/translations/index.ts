/**
 * @fileoverview Translations Module for Epic 4 - Guest Experience
 *
 * Provides utilities for fetching, merging, and displaying translated content from
 * Epic 3 translation tables (item_translations, article_translations,
 * link_translations, tag_translations).
 *
 * @module lib/translations
 * @since Epic 4 - Guest Experience
 *
 * @example
 * ```typescript
 * // Import translation utilities
 * import { fetchTranslatedItem } from '@/lib/translations';
 *
 * // Fetch translated item by public ID
 * const result = await fetchTranslatedItem('abc-123', 'fr');
 *
 * if (result.success) {
 *   console.log(result.data.name); // Translated name
 *   console.log(result.data.translationMeta.isTranslated); // true
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Import batch fetch utilities for custom use cases
 * import {
 *   fetchArticleTranslations,
 *   fetchLinkTranslations,
 *   mergeArticleTranslation
 * } from '@/lib/translations';
 *
 * // Batch fetch article translations
 * const articleIds = articles.map(a => a.id);
 * const translations = await fetchArticleTranslations(articleIds, 'de');
 *
 * // Merge translations with original articles
 * const translatedArticles = articles.map(article =>
 *   mergeArticleTranslation(article, translations.get(article.id))
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Import utility helpers for content manipulation and display
 * import {
 *   mergeTranslation,
 *   getDisplayLanguage,
 *   formatLanguageName,
 *   validateLanguageCode
 * } from '@/lib/translations';
 *
 * // Merge translation with original content
 * const merged = mergeTranslation(original, translation);
 *
 * // Determine best language to display
 * const displayLang = getDisplayLanguage('fr', ['en', 'fr'], 'en');
 *
 * // Format language name for UI
 * const langName = formatLanguageName('fr', true, true); // "🇫🇷 Français"
 * ```
 *
 * Last Modified: 2026-01-23 13:50
 */

// Translation fetch utilities (REQ-E04-004)
export * from './fetch-translations';

// Translation utility helpers (Epic 4 - Guest Experience)
export * from './translation-utils';
