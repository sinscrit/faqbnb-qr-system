# Detailed Task Breakdown: REQ-E04-004 - Create Translation Fetch Utilities

**Document Created:** 2026-01-19 22:00:00 UTC
**Last Modified:** 2026-01-19 22:00:00 UTC
**Request ID:** REQ-E04-004
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.1
**Size:** M (Medium)
**Overview Document:** REQ-E04-004-create-translation-fetch-utilities-overview.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating translation fetch utilities. These utilities will be the core data layer for serving translated content to guests, handling translation lookups, fallback logic, and batch retrieval for optimal performance.

---

## Prerequisites Checklist

Before starting implementation, verify the following dependencies are in place:

| Dependency | Location | Status Check |
|------------|----------|--------------|
| Supabase admin client | `/src/lib/supabase.ts` | `supabaseAdmin` export exists |
| i18n config with `SupportedLocale` | `/src/lib/i18n/config.ts` | `SupportedLocale` type exported |
| Translation tables | Database | `item_translations`, `article_translations`, `link_translations`, `tag_translations` tables exist |
| Items table with `source_language` | Database | `items` table has `source_language` column |

---

## Task Breakdown

### Task 2.1.1: Create Module Directory Structure

**Objective:** Set up the `/src/lib/translations/` module directory structure.

**Files to Create:**
- `/src/lib/translations/` (directory)

**Implementation Steps:**

1. **Create the translations directory**
   ```bash
   # The directory will be created when we create the first file
   ```

**Acceptance Criteria:**
- [ ] Directory `/src/lib/translations/` exists
- [ ] Ready for subsequent file creation

**Story Points:** 0.5 (trivial)

---

### Task 2.1.2: Define Type Definitions

**Objective:** Create TypeScript type definitions for translation fetch results.

**File to Create:** `/src/lib/translations/fetch-translations.types.ts`

**Implementation Steps:**

1. **Create the types file with the following content:**

```typescript
/**
 * Translation Fetch Utilities - Type Definitions
 *
 * Part of REQ-E04-004: Create Translation Fetch Utilities
 * Epic 4 - Guest Experience, Phase 2 - Translation Data Layer
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Generic result wrapper for consistent error handling across all fetch operations.
 * Follows the pattern established in translation-jobs.ts (JobQueueResult).
 */
export interface TranslationFetchResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The fetched data (undefined on failure) */
  data?: T;
  /** Error message (undefined on success) */
  error?: string;
}

/**
 * Translated item data with original content preserved for "View Original" feature.
 * Used by fetchTranslatedItem() when returning a complete item with translation applied.
 */
export interface TranslatedItemData {
  /** Core item data with translation applied */
  item: {
    /** Item UUID */
    id: string;
    /** Item public identifier (used in URLs) */
    publicId: string;
    /** Item name (translated or original) */
    name: string;
    /** Item description (translated or original) */
    description: string | null;
    /** Original language of the item content */
    sourceLanguage: SupportedLocale;
    /** Original name (only present if showing translation) */
    originalName?: string;
    /** Original description (only present if showing translation) */
    originalDescription?: string | null;
  };
  /** Whether the returned content is translated (vs original) */
  isTranslated: boolean;
  /** The language being displayed */
  displayLanguage: SupportedLocale;
  /** Translation status if translation exists */
  translationStatus?: 'completed' | 'pending' | 'failed';
}

/**
 * Item translation record from item_translations table.
 * camelCase mapping of snake_case database columns.
 */
export interface ItemTranslation {
  /** Translation record UUID */
  id: string;
  /** Foreign key to items.id */
  itemId: string;
  /** Target language code */
  language: SupportedLocale;
  /** Translated item name */
  name: string;
  /** Translated item description */
  description: string | null;
  /** Status: 'completed', 'pending', 'failed' */
  translationStatus: string;
  /** When translation was completed */
  translatedAt: string | null;
}

/**
 * Article translation record from article_translations table.
 * camelCase mapping of snake_case database columns.
 */
export interface ArticleTranslation {
  /** Translation record UUID */
  id: string;
  /** Foreign key to item_articles.id */
  articleId: string;
  /** Target language code */
  language: SupportedLocale;
  /** Translated article title */
  title: string;
  /** Translated article description */
  description: string | null;
  /** Status: 'completed', 'pending', 'failed' */
  translationStatus: string;
  /** When translation was completed */
  translatedAt: string | null;
}

/**
 * Link translation record from link_translations table.
 * camelCase mapping of snake_case database columns.
 */
export interface LinkTranslation {
  /** Translation record UUID */
  id: string;
  /** Foreign key to article_links.id */
  linkId: string;
  /** Target language code */
  language: SupportedLocale;
  /** Translated link title */
  title: string;
  /** Status: 'completed', 'pending', 'failed' */
  translationStatus: string;
  /** When translation was completed */
  translatedAt: string | null;
}

/**
 * Tag translation record from tag_translations table.
 * camelCase mapping of snake_case database columns.
 */
export interface TagTranslation {
  /** The tag key (e.g., "kitchen", "bathroom") */
  tagKey: string;
  /** Target language code */
  language: SupportedLocale;
  /** Translated tag value */
  translatedValue: string;
  /** Status: 'completed', 'pending', 'failed' */
  translationStatus: string;
  /** When translation was completed */
  translatedAt: string | null;
}
```

2. **Verify types align with database schema:**
   - Cross-reference with `/src/lib/supabase.ts` lines 463-634
   - Ensure all column mappings match database types

**Acceptance Criteria:**
- [ ] File created at `/src/lib/translations/fetch-translations.types.ts`
- [ ] `TranslationFetchResult<T>` generic type defined
- [ ] `TranslatedItemData` type defined with original content preservation
- [ ] `ItemTranslation` type defined matching `item_translations` table
- [ ] `ArticleTranslation` type defined matching `article_translations` table
- [ ] `LinkTranslation` type defined matching `link_translations` table
- [ ] `TagTranslation` type defined matching `tag_translations` table
- [ ] All types import `SupportedLocale` from i18n config
- [ ] TypeScript compiles without errors

**Story Points:** 1

---

### Task 2.1.3: Implement Row-to-Type Mapping Functions

**Objective:** Create internal helper functions that map database rows (snake_case) to TypeScript types (camelCase).

**File to Create/Update:** `/src/lib/translations/fetch-translations.ts` (start)

**Implementation Steps:**

1. **Create the main file with imports and internal mapper functions:**

```typescript
/**
 * Translation Fetch Utilities
 *
 * Core data layer for fetching translated content for guests.
 * Handles translation lookups, fallback logic, and batch retrieval.
 *
 * Part of REQ-E04-004: Create Translation Fetch Utilities
 * Epic 4 - Guest Experience, Phase 2 - Translation Data Layer
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { SupportedLocale } from '@/lib/i18n/config';
import type {
  TranslationFetchResult,
  TranslatedItemData,
  ItemTranslation,
  ArticleTranslation,
  LinkTranslation,
  TagTranslation,
} from './fetch-translations.types';

// Re-export types for convenience
export type {
  TranslationFetchResult,
  TranslatedItemData,
  ItemTranslation,
  ArticleTranslation,
  LinkTranslation,
  TagTranslation,
};

/**
 * Maps a database row from item_translations to ItemTranslation type.
 * Converts snake_case columns to camelCase properties.
 *
 * @internal
 */
function mapItemTranslation(row: Record<string, unknown>): ItemTranslation {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    language: row.language as SupportedLocale,
    name: row.name as string,
    description: row.description as string | null,
    translationStatus: row.translation_status as string,
    translatedAt: row.translated_at as string | null,
  };
}

/**
 * Maps a database row from article_translations to ArticleTranslation type.
 * Converts snake_case columns to camelCase properties.
 *
 * @internal
 */
function mapArticleTranslation(row: Record<string, unknown>): ArticleTranslation {
  return {
    id: row.id as string,
    articleId: row.article_id as string,
    language: row.language as SupportedLocale,
    title: row.title as string,
    description: row.description as string | null,
    translationStatus: row.translation_status as string,
    translatedAt: row.translated_at as string | null,
  };
}

/**
 * Maps a database row from link_translations to LinkTranslation type.
 * Converts snake_case columns to camelCase properties.
 *
 * @internal
 */
function mapLinkTranslation(row: Record<string, unknown>): LinkTranslation {
  return {
    id: row.id as string,
    linkId: row.link_id as string,
    language: row.language as SupportedLocale,
    title: row.title as string,
    translationStatus: row.translation_status as string,
    translatedAt: row.translated_at as string | null,
  };
}

/**
 * Maps a database row from tag_translations to TagTranslation type.
 * Converts snake_case columns to camelCase properties.
 *
 * @internal
 */
function mapTagTranslation(row: Record<string, unknown>): TagTranslation {
  return {
    tagKey: row.tag_key as string,
    language: row.language as SupportedLocale,
    translatedValue: row.translated_value as string,
    translationStatus: row.translation_status as string,
    translatedAt: row.translated_at as string | null,
  };
}
```

**Acceptance Criteria:**
- [ ] File created at `/src/lib/translations/fetch-translations.ts`
- [ ] Imports `supabaseAdmin` from `/src/lib/supabase`
- [ ] Imports `SupportedLocale` from `/src/lib/i18n/config`
- [ ] Imports types from `./fetch-translations.types`
- [ ] Re-exports all types for convenience
- [ ] `mapItemTranslation()` function implemented
- [ ] `mapArticleTranslation()` function implemented
- [ ] `mapLinkTranslation()` function implemented
- [ ] `mapTagTranslation()` function implemented
- [ ] All mappers correctly convert snake_case to camelCase

**Story Points:** 1

---

### Task 2.1.4: Implement fetchItemTranslations Function

**Objective:** Implement function to fetch only the translation record for an item.

**File to Update:** `/src/lib/translations/fetch-translations.ts`

**Implementation Steps:**

1. **Add the fetchItemTranslations function:**

```typescript
/**
 * Fetches only the translation record for an item (not the full item).
 * Use this when the original item is already loaded and you need the translation data.
 *
 * Returns null (not error) when no translation exists - this is a valid state.
 * Only returns translations with status 'completed'.
 *
 * @param itemId - The item's UUID (not public_id)
 * @param language - Target language for translation
 * @returns Result with ItemTranslation or null if not found
 *
 * @example
 * const result = await fetchItemTranslations('uuid-123', 'fr');
 * if (result.success && result.data) {
 *   console.log('Translated name:', result.data.name);
 * }
 */
export async function fetchItemTranslations(
  itemId: string,
  language: SupportedLocale
): Promise<TranslationFetchResult<ItemTranslation | null>> {
  try {
    console.log('FETCH_TRANSLATIONS: Fetching item translation', { itemId, language });

    const { data, error } = await supabaseAdmin
      .from('item_translations')
      .select('*')
      .eq('item_id', itemId)
      .eq('language', language)
      .eq('translation_status', 'completed')
      .maybeSingle();

    if (error) {
      console.error('FETCH_TRANSLATIONS: Database error fetching item translation', error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    if (!data) {
      console.log('FETCH_TRANSLATIONS: No completed translation found', { itemId, language });
      return {
        success: true,
        data: null,
      };
    }

    console.log('FETCH_TRANSLATIONS: Item translation found', { itemId, language });
    return {
      success: true,
      data: mapItemTranslation(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('FETCH_TRANSLATIONS: Exception fetching item translation', error);
    return {
      success: false,
      error: `Exception: ${message}`,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Function `fetchItemTranslations` is exported
- [ ] Accepts `itemId: string` and `language: SupportedLocale` parameters
- [ ] Returns `TranslationFetchResult<ItemTranslation | null>`
- [ ] Queries `item_translations` table by `item_id` and `language`
- [ ] Filters to `translation_status = 'completed'`
- [ ] Uses `.maybeSingle()` to return null when not found (not error)
- [ ] Returns `{ success: true, data: null }` when no translation exists
- [ ] Logs operations with `FETCH_TRANSLATIONS:` prefix
- [ ] Handles database errors gracefully
- [ ] Handles exceptions gracefully

**Story Points:** 1

---

### Task 2.1.5: Implement fetchTranslatedItem Function

**Objective:** Implement function to fetch a complete item with translation applied.

**File to Update:** `/src/lib/translations/fetch-translations.ts`

**Implementation Steps:**

1. **Add the fetchTranslatedItem function:**

```typescript
/**
 * Fetches a complete item with translation applied for guest display.
 *
 * Logic:
 * 1. Fetch item by public_id from items table
 * 2. If item not found, return error
 * 3. If item's source_language equals requested language, return original (no translation needed)
 * 4. Fetch translation from item_translations where status = 'completed'
 * 5. Merge translation with original, preserving original for "View Original" feature
 *
 * @param publicId - The item's public identifier (used in URLs)
 * @param language - Target language for translation
 * @returns Result with TranslatedItemData including original content for "View Original"
 *
 * @example
 * const result = await fetchTranslatedItem('abc123', 'fr');
 * if (result.success && result.data) {
 *   const { item, isTranslated, displayLanguage } = result.data;
 *   // Display item.name (translated or original)
 *   // If isTranslated, item.originalName has original for "View Original"
 * }
 */
export async function fetchTranslatedItem(
  publicId: string,
  language: SupportedLocale
): Promise<TranslationFetchResult<TranslatedItemData>> {
  try {
    console.log('FETCH_TRANSLATIONS: Fetching translated item', { publicId, language });

    // Step 1: Fetch the item by public_id
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('id, public_id, name, description, source_language')
      .eq('public_id', publicId)
      .single();

    if (itemError) {
      console.error('FETCH_TRANSLATIONS: Database error fetching item', itemError);
      return {
        success: false,
        error: `Item not found: ${itemError.message}`,
      };
    }

    if (!item) {
      console.log('FETCH_TRANSLATIONS: Item not found', { publicId });
      return {
        success: false,
        error: 'Item not found',
      };
    }

    const sourceLanguage = (item.source_language || 'en') as SupportedLocale;

    // Step 2: If source language equals requested language, return original
    if (sourceLanguage === language) {
      console.log('FETCH_TRANSLATIONS: Source matches requested language, returning original', {
        publicId,
        language,
      });
      return {
        success: true,
        data: {
          item: {
            id: item.id,
            publicId: item.public_id,
            name: item.name,
            description: item.description,
            sourceLanguage,
          },
          isTranslated: false,
          displayLanguage: sourceLanguage,
        },
      };
    }

    // Step 3: Fetch translation
    const { data: translation, error: translationError } = await supabaseAdmin
      .from('item_translations')
      .select('*')
      .eq('item_id', item.id)
      .eq('language', language)
      .maybeSingle();

    if (translationError) {
      console.error('FETCH_TRANSLATIONS: Database error fetching translation', translationError);
      // Return original content on translation error (graceful degradation)
      return {
        success: true,
        data: {
          item: {
            id: item.id,
            publicId: item.public_id,
            name: item.name,
            description: item.description,
            sourceLanguage,
          },
          isTranslated: false,
          displayLanguage: sourceLanguage,
        },
      };
    }

    // Step 4: Return merged result
    if (translation && translation.translation_status === 'completed') {
      console.log('FETCH_TRANSLATIONS: Translation found, returning merged content', {
        publicId,
        language,
      });
      return {
        success: true,
        data: {
          item: {
            id: item.id,
            publicId: item.public_id,
            name: translation.name,
            description: translation.description,
            sourceLanguage,
            originalName: item.name,
            originalDescription: item.description,
          },
          isTranslated: true,
          displayLanguage: language,
          translationStatus: 'completed',
        },
      };
    }

    // Step 5: Translation exists but not completed, return original with status
    if (translation) {
      console.log('FETCH_TRANSLATIONS: Translation exists but not completed', {
        publicId,
        language,
        status: translation.translation_status,
      });
      return {
        success: true,
        data: {
          item: {
            id: item.id,
            publicId: item.public_id,
            name: item.name,
            description: item.description,
            sourceLanguage,
          },
          isTranslated: false,
          displayLanguage: sourceLanguage,
          translationStatus: translation.translation_status as 'pending' | 'failed',
        },
      };
    }

    // Step 6: No translation at all, return original
    console.log('FETCH_TRANSLATIONS: No translation found, returning original', {
      publicId,
      language,
    });
    return {
      success: true,
      data: {
        item: {
          id: item.id,
          publicId: item.public_id,
          name: item.name,
          description: item.description,
          sourceLanguage,
        },
        isTranslated: false,
        displayLanguage: sourceLanguage,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('FETCH_TRANSLATIONS: Exception fetching translated item', error);
    return {
      success: false,
      error: `Exception: ${message}`,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Function `fetchTranslatedItem` is exported
- [ ] Accepts `publicId: string` and `language: SupportedLocale` parameters
- [ ] Returns `TranslationFetchResult<TranslatedItemData>`
- [ ] Fetches item from `items` table by `public_id`
- [ ] Returns error if item not found
- [ ] Returns original when source_language equals requested language
- [ ] Fetches translation from `item_translations` table
- [ ] Returns merged content with `originalName` and `originalDescription` when translated
- [ ] Sets `isTranslated: true` only when showing translated content
- [ ] Handles pending/failed translation status by returning original
- [ ] Gracefully falls back to original on translation fetch errors
- [ ] Logs all operations with `FETCH_TRANSLATIONS:` prefix

**Story Points:** 2

---

### Task 2.1.6: Implement fetchArticleTranslations Function

**Objective:** Implement batch function to fetch translations for multiple articles.

**File to Update:** `/src/lib/translations/fetch-translations.ts`

**Implementation Steps:**

1. **Add the fetchArticleTranslations function:**

```typescript
/**
 * Batch fetches article translations for multiple articles in a single query.
 * Returns a Map keyed by articleId for O(1) lookup when merging with original content.
 *
 * Only returns translations with status 'completed'.
 *
 * @param articleIds - Array of article UUIDs
 * @param language - Target language for translations
 * @returns Result with Map<articleId, ArticleTranslation>
 *
 * @example
 * const result = await fetchArticleTranslations(['id1', 'id2', 'id3'], 'fr');
 * if (result.success) {
 *   const translation = result.data?.get('id1');
 *   if (translation) {
 *     console.log('Translated title:', translation.title);
 *   }
 * }
 */
export async function fetchArticleTranslations(
  articleIds: string[],
  language: SupportedLocale
): Promise<TranslationFetchResult<Map<string, ArticleTranslation>>> {
  try {
    // Return empty Map for empty input (valid case)
    if (articleIds.length === 0) {
      console.log('FETCH_TRANSLATIONS: No article IDs provided, returning empty map');
      return {
        success: true,
        data: new Map(),
      };
    }

    console.log('FETCH_TRANSLATIONS: Fetching article translations', {
      count: articleIds.length,
      language,
    });

    const { data, error } = await supabaseAdmin
      .from('article_translations')
      .select('*')
      .in('article_id', articleIds)
      .eq('language', language)
      .eq('translation_status', 'completed');

    if (error) {
      console.error('FETCH_TRANSLATIONS: Database error fetching article translations', error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    // Build Map for O(1) lookup
    const translationMap = new Map<string, ArticleTranslation>();
    (data || []).forEach((row) => {
      const translation = mapArticleTranslation(row);
      translationMap.set(translation.articleId, translation);
    });

    console.log('FETCH_TRANSLATIONS: Article translations fetched', {
      requested: articleIds.length,
      found: translationMap.size,
      language,
    });

    return {
      success: true,
      data: translationMap,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('FETCH_TRANSLATIONS: Exception fetching article translations', error);
    return {
      success: false,
      error: `Exception: ${message}`,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Function `fetchArticleTranslations` is exported
- [ ] Accepts `articleIds: string[]` and `language: SupportedLocale` parameters
- [ ] Returns `TranslationFetchResult<Map<string, ArticleTranslation>>`
- [ ] Returns empty Map when `articleIds` is empty (not error)
- [ ] Uses `.in('article_id', articleIds)` for single batch query
- [ ] Filters to `translation_status = 'completed'`
- [ ] Returns Map keyed by `articleId` for O(1) lookup
- [ ] Logs requested count vs found count
- [ ] Handles database errors gracefully

**Story Points:** 1

---

### Task 2.1.7: Implement fetchLinkTranslations Function

**Objective:** Implement batch function to fetch translations for multiple links.

**File to Update:** `/src/lib/translations/fetch-translations.ts`

**Implementation Steps:**

1. **Add the fetchLinkTranslations function:**

```typescript
/**
 * Batch fetches link translations for multiple links in a single query.
 * Returns a Map keyed by linkId for O(1) lookup when merging with original content.
 *
 * Only returns translations with status 'completed'.
 * Note: URLs are never translated, only the link title.
 *
 * @param linkIds - Array of link UUIDs
 * @param language - Target language for translations
 * @returns Result with Map<linkId, LinkTranslation>
 *
 * @example
 * const result = await fetchLinkTranslations(['id1', 'id2'], 'fr');
 * if (result.success) {
 *   const translation = result.data?.get('id1');
 *   if (translation) {
 *     console.log('Translated title:', translation.title);
 *   }
 * }
 */
export async function fetchLinkTranslations(
  linkIds: string[],
  language: SupportedLocale
): Promise<TranslationFetchResult<Map<string, LinkTranslation>>> {
  try {
    // Return empty Map for empty input (valid case)
    if (linkIds.length === 0) {
      console.log('FETCH_TRANSLATIONS: No link IDs provided, returning empty map');
      return {
        success: true,
        data: new Map(),
      };
    }

    console.log('FETCH_TRANSLATIONS: Fetching link translations', {
      count: linkIds.length,
      language,
    });

    const { data, error } = await supabaseAdmin
      .from('link_translations')
      .select('*')
      .in('link_id', linkIds)
      .eq('language', language)
      .eq('translation_status', 'completed');

    if (error) {
      console.error('FETCH_TRANSLATIONS: Database error fetching link translations', error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    // Build Map for O(1) lookup
    const translationMap = new Map<string, LinkTranslation>();
    (data || []).forEach((row) => {
      const translation = mapLinkTranslation(row);
      translationMap.set(translation.linkId, translation);
    });

    console.log('FETCH_TRANSLATIONS: Link translations fetched', {
      requested: linkIds.length,
      found: translationMap.size,
      language,
    });

    return {
      success: true,
      data: translationMap,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('FETCH_TRANSLATIONS: Exception fetching link translations', error);
    return {
      success: false,
      error: `Exception: ${message}`,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Function `fetchLinkTranslations` is exported
- [ ] Accepts `linkIds: string[]` and `language: SupportedLocale` parameters
- [ ] Returns `TranslationFetchResult<Map<string, LinkTranslation>>`
- [ ] Returns empty Map when `linkIds` is empty (not error)
- [ ] Uses `.in('link_id', linkIds)` for single batch query
- [ ] Filters to `translation_status = 'completed'`
- [ ] Returns Map keyed by `linkId` for O(1) lookup
- [ ] Handles database errors gracefully

**Story Points:** 1

---

### Task 2.1.8: Implement fetchTagTranslations Function

**Objective:** Implement batch function to fetch translations for tag keys.

**File to Update:** `/src/lib/translations/fetch-translations.ts`

**Implementation Steps:**

1. **Add the fetchTagTranslations function:**

```typescript
/**
 * Batch fetches tag translations for multiple tag keys in a single query.
 * Returns a Map keyed by tagKey for O(1) lookup when displaying tags.
 *
 * Note: tag_translations uses tag_key (string) instead of UUID as identifier.
 * Only returns translations with status 'completed' (or similar field).
 *
 * @param tagKeys - Array of tag keys (e.g., ["kitchen", "bathroom", "bedroom"])
 * @param language - Target language for translations
 * @returns Result with Map<tagKey, TagTranslation>
 *
 * @example
 * const result = await fetchTagTranslations(['kitchen', 'bathroom'], 'fr');
 * if (result.success) {
 *   const translation = result.data?.get('kitchen');
 *   if (translation) {
 *     console.log('Translated tag:', translation.translatedValue); // "Cuisine"
 *   }
 * }
 */
export async function fetchTagTranslations(
  tagKeys: string[],
  language: SupportedLocale
): Promise<TranslationFetchResult<Map<string, TagTranslation>>> {
  try {
    // Return empty Map for empty input (valid case)
    if (tagKeys.length === 0) {
      console.log('FETCH_TRANSLATIONS: No tag keys provided, returning empty map');
      return {
        success: true,
        data: new Map(),
      };
    }

    console.log('FETCH_TRANSLATIONS: Fetching tag translations', {
      count: tagKeys.length,
      language,
    });

    const { data, error } = await supabaseAdmin
      .from('tag_translations')
      .select('*')
      .in('tag_key', tagKeys)
      .eq('language', language);

    if (error) {
      console.error('FETCH_TRANSLATIONS: Database error fetching tag translations', error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    // Build Map for O(1) lookup
    const translationMap = new Map<string, TagTranslation>();
    (data || []).forEach((row) => {
      const translation = mapTagTranslation(row);
      translationMap.set(translation.tagKey, translation);
    });

    console.log('FETCH_TRANSLATIONS: Tag translations fetched', {
      requested: tagKeys.length,
      found: translationMap.size,
      language,
    });

    return {
      success: true,
      data: translationMap,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('FETCH_TRANSLATIONS: Exception fetching tag translations', error);
    return {
      success: false,
      error: `Exception: ${message}`,
    };
  }
}
```

**Note:** The `tag_translations` table schema (from `/src/lib/supabase.ts` lines 607-634) does not have a `translation_status` column. Adjust query if schema differs.

**Acceptance Criteria:**
- [ ] Function `fetchTagTranslations` is exported
- [ ] Accepts `tagKeys: string[]` and `language: SupportedLocale` parameters
- [ ] Returns `TranslationFetchResult<Map<string, TagTranslation>>`
- [ ] Returns empty Map when `tagKeys` is empty (not error)
- [ ] Uses `.in('tag_key', tagKeys)` for single batch query
- [ ] Returns Map keyed by `tagKey` for O(1) lookup
- [ ] Handles database errors gracefully

**Story Points:** 1

---

### Task 2.1.9: Create Barrel Exports

**Objective:** Create index.ts file for clean module exports.

**File to Create:** `/src/lib/translations/index.ts`

**Implementation Steps:**

1. **Create the barrel exports file:**

```typescript
/**
 * Translation Utilities Module
 *
 * Provides utilities for fetching translated content from the database.
 * Part of Epic 4 - Guest Experience.
 *
 * @module translations
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// Export all functions and types from fetch-translations
export {
  // Functions
  fetchTranslatedItem,
  fetchItemTranslations,
  fetchArticleTranslations,
  fetchLinkTranslations,
  fetchTagTranslations,
  // Types (re-exported from fetch-translations.types.ts)
  type TranslationFetchResult,
  type TranslatedItemData,
  type ItemTranslation,
  type ArticleTranslation,
  type LinkTranslation,
  type TagTranslation,
} from './fetch-translations';
```

**Acceptance Criteria:**
- [ ] File created at `/src/lib/translations/index.ts`
- [ ] Exports all 5 fetch functions
- [ ] Exports all 6 types
- [ ] Clean import path: `import { fetchTranslatedItem } from '@/lib/translations'`

**Story Points:** 0.5

---

### Task 2.1.10: Verification and Build Check

**Objective:** Verify implementation compiles and all exports are correct.

**Implementation Steps:**

1. **Run TypeScript compilation check:**
   ```bash
   npx tsc --noEmit
   ```

2. **Verify imports work from expected paths:**
   - Create a test import in a temporary file or existing test file:
   ```typescript
   import {
     fetchTranslatedItem,
     fetchItemTranslations,
     fetchArticleTranslations,
     fetchLinkTranslations,
     fetchTagTranslations,
     type TranslationFetchResult,
     type TranslatedItemData,
   } from '@/lib/translations';
   ```

3. **Run build to ensure no issues:**
   ```bash
   npm run build
   ```

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` passes without errors
- [ ] `npm run build` succeeds
- [ ] All functions are importable from `@/lib/translations`
- [ ] All types are importable from `@/lib/translations`
- [ ] No circular dependency warnings

**Story Points:** 0.5

---

## Summary of Files

### Files to Create

| File Path | Description |
|-----------|-------------|
| `/src/lib/translations/index.ts` | Barrel exports for module |
| `/src/lib/translations/fetch-translations.ts` | Main fetch utility functions |
| `/src/lib/translations/fetch-translations.types.ts` | Type definitions |

### Functions to Implement

| Function | Purpose | Complexity |
|----------|---------|------------|
| `fetchTranslatedItem` | Fetch complete item with translation | High |
| `fetchItemTranslations` | Fetch only translation record | Low |
| `fetchArticleTranslations` | Batch fetch article translations | Medium |
| `fetchLinkTranslations` | Batch fetch link translations | Medium |
| `fetchTagTranslations` | Batch fetch tag translations | Medium |
| `mapItemTranslation` | (internal) Row to type mapper | Low |
| `mapArticleTranslation` | (internal) Row to type mapper | Low |
| `mapLinkTranslation` | (internal) Row to type mapper | Low |
| `mapTagTranslation` | (internal) Row to type mapper | Low |

---

## Total Story Points

| Task | Story Points |
|------|--------------|
| 2.1.1: Create Module Directory | 0.5 |
| 2.1.2: Define Type Definitions | 1 |
| 2.1.3: Implement Mapping Functions | 1 |
| 2.1.4: Implement fetchItemTranslations | 1 |
| 2.1.5: Implement fetchTranslatedItem | 2 |
| 2.1.6: Implement fetchArticleTranslations | 1 |
| 2.1.7: Implement fetchLinkTranslations | 1 |
| 2.1.8: Implement fetchTagTranslations | 1 |
| 2.1.9: Create Barrel Exports | 0.5 |
| 2.1.10: Verification and Build Check | 0.5 |
| **Total** | **9.5** |

---

## Verification Checklist (PRD Acceptance Criteria)

| PRD Criteria | Task | Status |
|--------------|------|--------|
| Utility function fetches complete item with translation for given publicId and language | 2.1.5 | [ ] |
| Utility function fetches only translation data for specific item | 2.1.4 | [ ] |
| Batch-fetches article translations in single query | 2.1.6 | [ ] |
| Batch-fetches link translations in single query | 2.1.7 | [ ] |
| Batch-fetches tag translations in single query | 2.1.8 | [ ] |
| Returns null/empty when content doesn't exist (no throwing) | 2.1.4-2.1.8 | [ ] |
| Automatic fallback to original when translation missing | 2.1.5 | [ ] |
| Consistently typed returns with TypeScript interfaces | 2.1.2 | [ ] |
| Language codes match supported language types | All | [ ] |
| Functions exported from dedicated module | 2.1.9 | [ ] |

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 2.1)
- **Overview:** `/docs/REQ-E04-004-create-translation-fetch-utilities-overview.md`
- **Request:** `/docs/gen_requests_epic4.md` (REQ-E04-004)
- **Existing Patterns:** `/src/lib/job-queue/translation-jobs.ts`
- **Database Types:** `/src/lib/supabase.ts` (lines 463-650)
- **Language Config:** `/src/lib/i18n/config.ts`

---

*Detailed task breakdown generated for FAQBNB Localization Epic 4 - Guest Experience*
