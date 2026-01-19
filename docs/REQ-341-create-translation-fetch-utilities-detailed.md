# REQ-341: Create Translation Fetch Utilities Module - Detailed Task Breakdown

**Document Created:** 2026-01-19 03:15:00 UTC
**Last Modified:** 2026-01-19 03:15:00 UTC
**Request Reference:** REQ-341 in `docs/gen_requests_epic4.md`
**Overview Document:** `docs/REQ-341-create-translation-fetch-utilities-overview.md`
**Implementation Plan Reference:** `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.1

---

## Task Summary

Create a dedicated utility module at `/src/lib/translations/fetch-translations.ts` that provides five specialized functions for fetching translated content from the database. These utilities will retrieve translated items, articles, links, and tags based on guest language preferences, forming the data layer foundation for the guest-facing localization experience.

---

## Prerequisites Verification

Before starting implementation, verify:

| Prerequisite | Location | Status Check |
|--------------|----------|--------------|
| Translation tables exist | Database | Run `SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%_translations'` |
| Database types defined | `/src/lib/supabase.ts` (lines 270-634) | ✅ Verified - `item_translations`, `article_translations`, `link_translations`, `tag_translations` types exist |
| Supabase client available | `/src/lib/supabase.ts` | ✅ Verified - `supabase` and `supabaseAdmin` exports exist |
| i18n config exists | `/src/lib/i18n/config.ts` | ✅ Verified - `SupportedLocale`, `isValidLocale()`, `normalizeLocale()` available |
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | ✅ Verified - `SupportedLanguage`, translation record interfaces exist |

---

## Detailed Tasks

### Task 1: Create Directory Structure and Module File

**Objective:** Set up the translations module directory and main file with imports and type definitions.

**File to Create:** `/src/lib/translations/fetch-translations.ts`

**Implementation Steps:**

1.1. Create the directory `/src/lib/translations/` if it doesn't exist

1.2. Create `/src/lib/translations/fetch-translations.ts` with the following structure:
   - Import `supabase` from `@/lib/supabase`
   - Import `SupportedLocale` from `@/lib/i18n/config`
   - Define local type interfaces for return values

**Code Template:**
```typescript
/**
 * Translation Fetch Utilities Module
 *
 * Provides utility functions for retrieving translated content from the database.
 * These utilities are used by guest-facing pages to display localized content.
 *
 * REQ-341: Create Translation Fetch Utilities
 * Epic 4 - Guest Experience, Phase 2, Task 2.1
 *
 * @module translations/fetch-translations
 * @created 2026-01-19
 */

import { supabase } from '@/lib/supabase';
import { SupportedLocale, isValidLocale } from '@/lib/i18n/config';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Result returned when fetching an item with its translation.
 * Contains both original item data and translation metadata.
 */
export interface TranslatedItemResult {
  /** The item data (with translated fields if translation exists) */
  item: {
    id: string;
    publicId: string;
    name: string;
    description: string | null;
    sourceLanguage: SupportedLocale;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  /** Translation details if available */
  translation: {
    id: string;
    name: string;
    description: string | null;
    language: SupportedLocale;
    status: string;
    translatedAt: string | null;
  } | null;
  /** Whether content is translated */
  isTranslated: boolean;
  /** The language being displayed */
  displayLanguage: SupportedLocale;
  /** Original content (for toggle functionality) */
  originalContent: {
    name: string;
    description: string | null;
  } | null;
}

/**
 * Item translation data only (without full item).
 */
export interface ItemTranslationData {
  id: string;
  itemId: string;
  name: string;
  description: string | null;
  language: SupportedLocale;
  status: string;
  translatedAt: string | null;
}

/**
 * Article translation data.
 */
export interface ArticleTranslationData {
  id: string;
  articleId: string;
  title: string;
  description: string | null;
  language: SupportedLocale;
  status: string;
  translatedAt: string | null;
}

/**
 * Link translation data.
 */
export interface LinkTranslationData {
  id: string;
  linkId: string;
  title: string;
  language: SupportedLocale;
  status: string;
  translatedAt: string | null;
}

/**
 * Tag translation data.
 */
export interface TagTranslationData {
  key: string;
  translatedValue: string;
  language: SupportedLocale;
  isSystemTag: boolean;
}
```

**Acceptance Criteria for Task 1:**
- [ ] Directory `/src/lib/translations/` exists
- [ ] File `/src/lib/translations/fetch-translations.ts` exists
- [ ] All type interfaces are defined with proper JSDoc comments
- [ ] Imports are correctly set up
- [ ] TypeScript compilation succeeds

---

### Task 2: Implement `fetchTranslatedItem` Function

**Objective:** Create function to fetch an item with its translation given a public identifier and language code.

**Function Signature:**
```typescript
export async function fetchTranslatedItem(
  publicId: string,
  language: SupportedLocale
): Promise<TranslatedItemResult>
```

**Implementation Steps:**

2.1. Add function with JSDoc documentation
2.2. Validate input parameters (publicId not empty, language is valid)
2.3. Fetch item by `public_id` from `items` table
2.4. If item found, fetch translation from `item_translations` where:
   - `item_id` matches
   - `language` matches target language
   - `translation_status = 'completed'`
2.5. Build and return `TranslatedItemResult` object with:
   - Merged content (translation takes precedence)
   - Original content preserved for toggle
   - Translation metadata

**Code Template:**
```typescript
/**
 * Fetches an item with its translation for a given language.
 *
 * Retrieves the item by public ID, then attempts to find a completed
 * translation for the requested language. Returns merged result with
 * translation metadata and original content for toggle functionality.
 *
 * @param publicId - The public identifier of the item
 * @param language - The target language code
 * @returns Promise resolving to TranslatedItemResult
 *
 * @example
 * const result = await fetchTranslatedItem('abc123', 'fr');
 * if (result.item) {
 *   console.log(result.item.name); // French name if translated
 *   console.log(result.isTranslated); // true if translation exists
 * }
 */
export async function fetchTranslatedItem(
  publicId: string,
  language: SupportedLocale
): Promise<TranslatedItemResult> {
  // Default result for error cases
  const defaultResult: TranslatedItemResult = {
    item: null,
    translation: null,
    isTranslated: false,
    displayLanguage: language,
    originalContent: null,
  };

  try {
    // Validate inputs
    if (!publicId || typeof publicId !== 'string') {
      console.error('[fetchTranslatedItem] Invalid publicId:', publicId);
      return defaultResult;
    }

    if (!isValidLocale(language)) {
      console.error('[fetchTranslatedItem] Invalid language:', language);
      return defaultResult;
    }

    // Fetch item by public_id
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      console.error('[fetchTranslatedItem] Item not found:', publicId, itemError);
      return defaultResult;
    }

    // Store original content for toggle
    const originalContent = {
      name: item.name,
      description: item.description,
    };

    // Check if target language is the source language
    const sourceLanguage = (item.source_language as SupportedLocale) || 'en';
    if (language === sourceLanguage) {
      // No translation needed, return original
      return {
        item: {
          id: item.id,
          publicId: item.public_id,
          name: item.name,
          description: item.description,
          sourceLanguage,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
        translation: null,
        isTranslated: false,
        displayLanguage: sourceLanguage,
        originalContent,
      };
    }

    // Fetch translation for target language
    const { data: translation, error: translationError } = await supabase
      .from('item_translations')
      .select('*')
      .eq('item_id', item.id)
      .eq('language', language)
      .eq('translation_status', 'completed')
      .single();

    if (translationError || !translation) {
      // No translation available, return original with metadata
      return {
        item: {
          id: item.id,
          publicId: item.public_id,
          name: item.name,
          description: item.description,
          sourceLanguage,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
        translation: null,
        isTranslated: false,
        displayLanguage: sourceLanguage,
        originalContent,
      };
    }

    // Return item with translation merged
    return {
      item: {
        id: item.id,
        publicId: item.public_id,
        name: translation.name,
        description: translation.description,
        sourceLanguage,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      },
      translation: {
        id: translation.id,
        name: translation.name,
        description: translation.description,
        language: translation.language as SupportedLocale,
        status: translation.translation_status,
        translatedAt: translation.translated_at,
      },
      isTranslated: true,
      displayLanguage: language,
      originalContent,
    };
  } catch (error) {
    console.error('[fetchTranslatedItem] Unexpected error:', error);
    return defaultResult;
  }
}
```

**Acceptance Criteria for Task 2:**
- [ ] Function accepts `publicId` (string) and `language` (SupportedLocale) parameters
- [ ] Function validates input parameters before database query
- [ ] Function fetches item from `items` table by `public_id`
- [ ] Function fetches translation from `item_translations` for matching item_id, language, and completed status
- [ ] Function returns merged item data with translation taking precedence
- [ ] Function preserves original content in `originalContent` field for toggle
- [ ] Function returns appropriate metadata (`isTranslated`, `displayLanguage`)
- [ ] Function handles missing item gracefully (returns null item)
- [ ] Function handles missing translation gracefully (returns original content)
- [ ] Function handles database errors without crashing
- [ ] Function includes complete JSDoc documentation

---

### Task 3: Implement `fetchItemTranslations` Function

**Objective:** Create function to fetch only translation data for an item given its internal ID.

**Function Signature:**
```typescript
export async function fetchItemTranslations(
  itemId: string,
  language: SupportedLocale
): Promise<ItemTranslationData | null>
```

**Implementation Steps:**

3.1. Add function with JSDoc documentation
3.2. Validate input parameters
3.3. Query `item_translations` table for matching item_id and language
3.4. Return translation data or null if not found

**Code Template:**
```typescript
/**
 * Fetches only translation data for an item.
 *
 * Retrieves translation record without joining the full item content.
 * Useful when item data is already available and only translation is needed.
 *
 * @param itemId - The internal UUID of the item
 * @param language - The target language code
 * @returns Promise resolving to ItemTranslationData or null if not found
 *
 * @example
 * const translation = await fetchItemTranslations('uuid-123', 'de');
 * if (translation) {
 *   console.log(translation.name); // German name
 * }
 */
export async function fetchItemTranslations(
  itemId: string,
  language: SupportedLocale
): Promise<ItemTranslationData | null> {
  try {
    // Validate inputs
    if (!itemId || typeof itemId !== 'string') {
      console.error('[fetchItemTranslations] Invalid itemId:', itemId);
      return null;
    }

    if (!isValidLocale(language)) {
      console.error('[fetchItemTranslations] Invalid language:', language);
      return null;
    }

    // Fetch translation
    const { data: translation, error } = await supabase
      .from('item_translations')
      .select('*')
      .eq('item_id', itemId)
      .eq('language', language)
      .eq('translation_status', 'completed')
      .single();

    if (error || !translation) {
      // Not found or error - return null (not logged as error, this is expected)
      return null;
    }

    return {
      id: translation.id,
      itemId: translation.item_id,
      name: translation.name,
      description: translation.description,
      language: translation.language as SupportedLocale,
      status: translation.translation_status,
      translatedAt: translation.translated_at,
    };
  } catch (error) {
    console.error('[fetchItemTranslations] Unexpected error:', error);
    return null;
  }
}
```

**Acceptance Criteria for Task 3:**
- [ ] Function accepts `itemId` (string) and `language` (SupportedLocale) parameters
- [ ] Function validates input parameters
- [ ] Function queries `item_translations` table by item_id, language, and completed status
- [ ] Function returns translation data object when found
- [ ] Function returns null when no translation exists
- [ ] Function handles database errors without crashing
- [ ] Function includes complete JSDoc documentation

---

### Task 4: Implement `fetchArticleTranslations` Function

**Objective:** Create function to fetch translations for multiple articles in a single query.

**Function Signature:**
```typescript
export async function fetchArticleTranslations(
  articleIds: string[],
  language: SupportedLocale
): Promise<Map<string, ArticleTranslationData>>
```

**Implementation Steps:**

4.1. Add function with JSDoc documentation
4.2. Validate input parameters (handle empty array)
4.3. Use `.in('article_id', articleIds)` for batch query
4.4. Filter by language and completed status
4.5. Convert result array to Map keyed by articleId for O(1) lookups
4.6. Handle partial results where some articles have translations and others don't

**Code Template:**
```typescript
/**
 * Fetches translations for multiple articles in a single query.
 *
 * Retrieves all translations for the specified article IDs in the target language.
 * Returns a Map for efficient O(1) lookups by article ID.
 * Articles without translations will not have entries in the returned Map.
 *
 * @param articleIds - Array of article UUIDs to fetch translations for
 * @param language - The target language code
 * @returns Promise resolving to Map<articleId, ArticleTranslationData>
 *
 * @example
 * const translations = await fetchArticleTranslations(['id1', 'id2', 'id3'], 'es');
 * const article1Translation = translations.get('id1'); // Spanish translation or undefined
 */
export async function fetchArticleTranslations(
  articleIds: string[],
  language: SupportedLocale
): Promise<Map<string, ArticleTranslationData>> {
  const result = new Map<string, ArticleTranslationData>();

  try {
    // Handle empty array
    if (!articleIds || articleIds.length === 0) {
      return result;
    }

    // Validate language
    if (!isValidLocale(language)) {
      console.error('[fetchArticleTranslations] Invalid language:', language);
      return result;
    }

    // Filter out invalid IDs
    const validIds = articleIds.filter(id => id && typeof id === 'string');
    if (validIds.length === 0) {
      return result;
    }

    // Batch query for all article translations
    const { data: translations, error } = await supabase
      .from('article_translations')
      .select('*')
      .in('article_id', validIds)
      .eq('language', language)
      .eq('translation_status', 'completed');

    if (error) {
      console.error('[fetchArticleTranslations] Query error:', error);
      return result;
    }

    // Convert to Map for O(1) lookups
    for (const translation of translations || []) {
      result.set(translation.article_id, {
        id: translation.id,
        articleId: translation.article_id,
        title: translation.title,
        description: translation.description,
        language: translation.language as SupportedLocale,
        status: translation.translation_status,
        translatedAt: translation.translated_at,
      });
    }

    return result;
  } catch (error) {
    console.error('[fetchArticleTranslations] Unexpected error:', error);
    return result;
  }
}
```

**Acceptance Criteria for Task 4:**
- [ ] Function accepts `articleIds` (string[]) and `language` (SupportedLocale) parameters
- [ ] Function handles empty arrays gracefully (returns empty Map)
- [ ] Function uses `.in()` filter for efficient batch query
- [ ] Function filters by language and completed status
- [ ] Function returns Map<string, ArticleTranslationData> for O(1) lookups
- [ ] Function handles partial results (some articles have translations, others don't)
- [ ] Function handles database errors without crashing
- [ ] Function includes complete JSDoc documentation

---

### Task 5: Implement `fetchLinkTranslations` Function

**Objective:** Create function to fetch translations for multiple links in a single query.

**Function Signature:**
```typescript
export async function fetchLinkTranslations(
  linkIds: string[],
  language: SupportedLocale
): Promise<Map<string, LinkTranslationData>>
```

**Implementation Steps:**

5.1. Add function with JSDoc documentation
5.2. Validate input parameters (handle empty array)
5.3. Use `.in('link_id', linkIds)` for batch query
5.4. Filter by language and completed status
5.5. Convert result array to Map keyed by linkId

**Code Template:**
```typescript
/**
 * Fetches translations for multiple links in a single query.
 *
 * Retrieves all translations for the specified link IDs in the target language.
 * Returns a Map for efficient O(1) lookups by link ID.
 * Links without translations will not have entries in the returned Map.
 *
 * @param linkIds - Array of link UUIDs to fetch translations for
 * @param language - The target language code
 * @returns Promise resolving to Map<linkId, LinkTranslationData>
 *
 * @example
 * const translations = await fetchLinkTranslations(['link1', 'link2'], 'fr');
 * const link1Translation = translations.get('link1'); // French title or undefined
 */
export async function fetchLinkTranslations(
  linkIds: string[],
  language: SupportedLocale
): Promise<Map<string, LinkTranslationData>> {
  const result = new Map<string, LinkTranslationData>();

  try {
    // Handle empty array
    if (!linkIds || linkIds.length === 0) {
      return result;
    }

    // Validate language
    if (!isValidLocale(language)) {
      console.error('[fetchLinkTranslations] Invalid language:', language);
      return result;
    }

    // Filter out invalid IDs
    const validIds = linkIds.filter(id => id && typeof id === 'string');
    if (validIds.length === 0) {
      return result;
    }

    // Batch query for all link translations
    const { data: translations, error } = await supabase
      .from('link_translations')
      .select('*')
      .in('link_id', validIds)
      .eq('language', language)
      .eq('translation_status', 'completed');

    if (error) {
      console.error('[fetchLinkTranslations] Query error:', error);
      return result;
    }

    // Convert to Map for O(1) lookups
    for (const translation of translations || []) {
      result.set(translation.link_id, {
        id: translation.id,
        linkId: translation.link_id,
        title: translation.title,
        language: translation.language as SupportedLocale,
        status: translation.translation_status,
        translatedAt: translation.translated_at,
      });
    }

    return result;
  } catch (error) {
    console.error('[fetchLinkTranslations] Unexpected error:', error);
    return result;
  }
}
```

**Acceptance Criteria for Task 5:**
- [ ] Function accepts `linkIds` (string[]) and `language` (SupportedLocale) parameters
- [ ] Function handles empty arrays gracefully (returns empty Map)
- [ ] Function uses `.in()` filter for efficient batch query
- [ ] Function filters by language and completed status
- [ ] Function returns Map<string, LinkTranslationData> for O(1) lookups
- [ ] Function handles partial results
- [ ] Function handles database errors without crashing
- [ ] Function includes complete JSDoc documentation

---

### Task 6: Implement `fetchTagTranslations` Function

**Objective:** Create function to fetch translations for multiple tags in a single query.

**Function Signature:**
```typescript
export async function fetchTagTranslations(
  tagKeys: string[],
  language: SupportedLocale
): Promise<Map<string, TagTranslationData>>
```

**Implementation Steps:**

6.1. Add function with JSDoc documentation
6.2. Validate input parameters (handle empty array)
6.3. Use `.in('tag_key', tagKeys)` for batch query
6.4. Filter by language only (tag_translations doesn't have translation_status)
6.5. Convert result array to Map keyed by tagKey

**Code Template:**
```typescript
/**
 * Fetches translations for multiple tags in a single query.
 *
 * Retrieves all translations for the specified tag keys in the target language.
 * Returns a Map for efficient O(1) lookups by tag key.
 * Tags without translations will not have entries in the returned Map.
 *
 * @param tagKeys - Array of tag keys to fetch translations for
 * @param language - The target language code
 * @returns Promise resolving to Map<tagKey, TagTranslationData>
 *
 * @example
 * const translations = await fetchTagTranslations(['wifi', 'parking'], 'it');
 * const wifiTranslation = translations.get('wifi'); // Italian translation or undefined
 */
export async function fetchTagTranslations(
  tagKeys: string[],
  language: SupportedLocale
): Promise<Map<string, TagTranslationData>> {
  const result = new Map<string, TagTranslationData>();

  try {
    // Handle empty array
    if (!tagKeys || tagKeys.length === 0) {
      return result;
    }

    // Validate language
    if (!isValidLocale(language)) {
      console.error('[fetchTagTranslations] Invalid language:', language);
      return result;
    }

    // Filter out invalid keys
    const validKeys = tagKeys.filter(key => key && typeof key === 'string');
    if (validKeys.length === 0) {
      return result;
    }

    // Batch query for all tag translations
    // Note: tag_translations doesn't have translation_status, just filter by language
    const { data: translations, error } = await supabase
      .from('tag_translations')
      .select('*')
      .in('tag_key', validKeys)
      .eq('language', language);

    if (error) {
      console.error('[fetchTagTranslations] Query error:', error);
      return result;
    }

    // Convert to Map for O(1) lookups
    for (const translation of translations || []) {
      result.set(translation.tag_key, {
        key: translation.tag_key,
        translatedValue: translation.translated_value,
        language: translation.language as SupportedLocale,
        isSystemTag: translation.is_system_tag || false,
      });
    }

    return result;
  } catch (error) {
    console.error('[fetchTagTranslations] Unexpected error:', error);
    return result;
  }
}
```

**Acceptance Criteria for Task 6:**
- [ ] Function accepts `tagKeys` (string[]) and `language` (SupportedLocale) parameters
- [ ] Function handles empty arrays gracefully (returns empty Map)
- [ ] Function uses `.in()` filter for efficient batch query
- [ ] Function filters by language (no status filter for tags)
- [ ] Function returns Map<string, TagTranslationData> for O(1) lookups
- [ ] Function handles partial results
- [ ] Function handles database errors without crashing
- [ ] Function includes complete JSDoc documentation

---

### Task 7: Create Barrel Export File

**Objective:** Create index.ts for clean module exports.

**File to Create:** `/src/lib/translations/index.ts`

**Implementation Steps:**

7.1. Create barrel export file
7.2. Export all functions from `fetch-translations.ts`
7.3. Export all types from `fetch-translations.ts`

**Code Template:**
```typescript
/**
 * Translation Utilities Module
 *
 * Barrel exports for translation-related utilities.
 * Import from '@/lib/translations' for cleaner imports.
 *
 * @module translations
 * @created 2026-01-19
 */

export {
  // Functions
  fetchTranslatedItem,
  fetchItemTranslations,
  fetchArticleTranslations,
  fetchLinkTranslations,
  fetchTagTranslations,
  // Types
  type TranslatedItemResult,
  type ItemTranslationData,
  type ArticleTranslationData,
  type LinkTranslationData,
  type TagTranslationData,
} from './fetch-translations';
```

**Acceptance Criteria for Task 7:**
- [ ] File `/src/lib/translations/index.ts` exists
- [ ] All functions are exported from barrel file
- [ ] All types are exported from barrel file
- [ ] Imports from `@/lib/translations` resolve correctly
- [ ] TypeScript compilation succeeds

---

### Task 8: Add Comprehensive Error Handling

**Objective:** Ensure all functions have robust error handling that prevents crashes.

**Implementation Steps:**

8.1. Review all functions for try-catch coverage
8.2. Ensure all database errors are logged with context
8.3. Ensure all functions return graceful fallbacks (null, empty maps)
8.4. Add input validation for all parameters
8.5. Never expose internal error details to callers

**Verification Checklist:**
- [ ] All functions wrapped in try-catch
- [ ] All errors logged with function name and context
- [ ] All functions return safe fallback values on error
- [ ] All input parameters validated before use
- [ ] No internal implementation details leaked in errors

---

## Database Query Patterns Reference

### Existing Pattern (from `/src/app/api/items/[publicId]/route.ts`):
```typescript
// Single item fetch with filter
const { data: item, error: itemError } = await supabase
  .from('items')
  .select('*')
  .eq('public_id', publicId)
  .single();

// Multiple items with ordering
const { data: links, error: linksError } = await supabase
  .from('item_links')
  .select('*')
  .eq('item_id', item.id)
  .order('display_order', { ascending: true });
```

### Translation Table Schemas (from `/src/lib/supabase.ts`):

**item_translations:**
- `id`, `item_id`, `language`, `name`, `description`, `translation_status`, `translated_at`, `created_at`, `updated_at`

**article_translations:**
- `id`, `article_id`, `language`, `title`, `description`, `translation_status`, `translated_at`, `reviewed_by`, `created_at`, `updated_at`

**link_translations:**
- `id`, `link_id`, `language`, `title`, `translation_status`, `translated_at`, `created_at`, `updated_at`

**tag_translations:**
- `id`, `tag_key`, `language`, `translated_value`, `is_system_tag`, `created_at`

---

## Testing Considerations

### Unit Tests to Create:

1. **Test fetchTranslatedItem:**
   - Test with valid publicId and language
   - Test with non-existent item
   - Test with item but no translation
   - Test with item and completed translation
   - Test with item and pending translation (should not return)
   - Test with invalid publicId
   - Test with invalid language

2. **Test fetchItemTranslations:**
   - Test with valid itemId and language
   - Test with non-existent item
   - Test with no translation
   - Test with completed translation
   - Test with invalid inputs

3. **Test fetchArticleTranslations:**
   - Test with empty array
   - Test with single ID
   - Test with multiple IDs
   - Test with partial translations (some exist, some don't)
   - Test with invalid IDs in array

4. **Test fetchLinkTranslations:**
   - Same scenarios as article translations

5. **Test fetchTagTranslations:**
   - Same scenarios as article translations
   - Note: No status filter for tags

### Integration Tests:

1. Test actual database queries with test data
2. Verify batch queries complete in < 200ms
3. Test with realistic data volumes

---

## Usage Example

```typescript
// In server component or API route
import {
  fetchTranslatedItem,
  fetchArticleTranslations,
  fetchLinkTranslations,
  fetchTagTranslations
} from '@/lib/translations';
import { SupportedLocale } from '@/lib/i18n/config';

export async function getGuestItemContent(publicId: string, language: SupportedLocale) {
  // Fetch item with translation
  const itemResult = await fetchTranslatedItem(publicId, language);

  if (!itemResult.item) {
    return null; // Item not found
  }

  // Fetch related content translations in parallel
  const articleIds = /* from item data */;
  const linkIds = /* from item data */;
  const tagKeys = /* from item data */;

  const [articleTranslations, linkTranslations, tagTranslations] = await Promise.all([
    fetchArticleTranslations(articleIds, language),
    fetchLinkTranslations(linkIds, language),
    fetchTagTranslations(tagKeys, language),
  ]);

  return {
    item: itemResult,
    articleTranslations,
    linkTranslations,
    tagTranslations,
  };
}
```

---

## Completion Checklist

### All Tasks Complete When:

- [ ] `/src/lib/translations/` directory exists
- [ ] `/src/lib/translations/fetch-translations.ts` exists with all 5 functions
- [ ] `/src/lib/translations/index.ts` barrel export exists
- [ ] All type interfaces defined with JSDoc
- [ ] `fetchTranslatedItem` implemented and tested
- [ ] `fetchItemTranslations` implemented and tested
- [ ] `fetchArticleTranslations` implemented and tested
- [ ] `fetchLinkTranslations` implemented and tested
- [ ] `fetchTagTranslations` implemented and tested
- [ ] All functions have proper error handling
- [ ] All functions have proper input validation
- [ ] TypeScript compilation succeeds without errors
- [ ] Build completes successfully (`npm run build`)
- [ ] No console errors in development

---

## Dependencies

### Will Be Used By (Task 2.2 and later):

| Consumer | File | Usage |
|----------|------|-------|
| Public Item API | `/src/app/api/public/items/[publicId]/route.ts` | Task 2.2 |
| Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Task 5.1 |
| ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Task 5.2 |

---

## References

- Request Definition: `docs/gen_requests_epic4.md` (REQ-341)
- Overview Document: `docs/REQ-341-create-translation-fetch-utilities-overview.md`
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 2.1)
- Database Types: `/src/lib/supabase.ts` (lines 270-634)
- i18n Config: `/src/lib/i18n/config.ts`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Query Pattern Reference: `/src/app/api/items/[publicId]/route.ts`
