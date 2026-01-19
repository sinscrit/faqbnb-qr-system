# REQ-341: Create Translation Fetch Utilities Module - Implementation Overview

**Document Created:** 2026-01-19 02:45:00 UTC
**Last Modified:** 2026-01-19 02:45:00 UTC
**Request Reference:** REQ-341 in `docs/gen_requests_epic4.md`
**Implementation Plan Reference:** `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.1

---

## Summary

Create a dedicated utility module that provides five specialized functions for fetching translated content from the database. These utilities will retrieve translated items, articles, links, and tags based on guest language preferences, forming the data layer foundation for the guest-facing localization experience.

---

## Request Details

**Type:** NEW FEATURE
**Size:** M (Medium)
**Priority:** P1 - High (Required for Epic 4 Guest Experience)

### Problem Statement

No standardized utilities exist for fetching translated content from translation tables. Each feature that needs to display localized content must write custom database queries, leading to:
- Inconsistent query patterns across the application
- Duplicated logic for translation retrieval
- Varying approaches to handling missing translations
- Potential performance issues from unoptimized queries

### Expected Outcome

A dedicated module at `/src/lib/translations/fetch-translations.ts` that provides:
1. `fetchTranslatedItem(publicId, language)` - Fetch item with translation
2. `fetchItemTranslations(itemId, language)` - Fetch item translations only
3. `fetchArticleTranslations(articleIds, language)` - Fetch article translations
4. `fetchLinkTranslations(linkIds, language)` - Fetch link translations
5. `fetchTagTranslations(tagKeys, language)` - Fetch tag translations

---

## Technical Context

### Existing Infrastructure

| Component | Location | Purpose |
|-----------|----------|---------|
| Supabase Client | `/src/lib/supabase.ts` | Database access (`supabase`, `supabaseAdmin`) |
| Database Types | `/src/lib/supabase.ts` (lines 274-684) | Translation table type definitions |
| Translation Types | `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, translation record interfaces |
| i18n Config | `/src/lib/i18n/config.ts` | `SupportedLocale`, `isValidLocale()`, `normalizeLocale()` |
| Item Fetch Pattern | `/src/app/api/items/[publicId]/route.ts` | Reference for query patterns |

### Database Schema (Translation Tables)

**item_translations**
```typescript
{
  id: string;
  item_id: string;
  language: string;
  name: string;
  description: string | null;
  translation_status: string;
  translated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

**article_translations**
```typescript
{
  id: string;
  article_id: string;
  language: string;
  title: string;
  description: string | null;
  translation_status: string;
  translated_at: string | null;
  reviewed_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

**link_translations**
```typescript
{
  id: string;
  link_id: string;
  language: string;
  title: string;
  translation_status: string;
  translated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

**tag_translations**
```typescript
{
  id: string;
  tag_key: string;
  language: string;
  translated_value: string;
  is_system_tag: boolean | null;
  created_at: string | null;
}
```

### Existing Query Patterns

From `/src/app/api/items/[publicId]/route.ts`:
```typescript
// Single item fetch with filter
const { data: item, error: itemError } = await supabase
  .from('items')
  .select('*')
  .eq('public_id', publicId)
  .single();

// Related table fetch with ordering
const { data: links, error: linksError } = await supabase
  .from('item_links')
  .select('*')
  .eq('item_id', item.id)
  .order('display_order', { ascending: true });
```

From `/src/lib/job-queue/translation-jobs.ts`:
```typescript
// Query with upsert and conflict handling
const { data, error } = await supabaseAdmin
  .from('translation_jobs')
  .upsert(/* ... */)
  .select()
  .single();
```

---

## Implementation Approach

### Function Signatures

```typescript
// /src/lib/translations/fetch-translations.ts

import { SupportedLocale } from '@/lib/i18n/config';

/**
 * Fetches an item with its translation for a given language
 * @param publicId - The public identifier of the item
 * @param language - The target language code
 * @returns Item data merged with translation, or original if no translation exists
 */
export async function fetchTranslatedItem(
  publicId: string,
  language: SupportedLocale
): Promise<TranslatedItemResult>;

/**
 * Fetches only translation data for an item
 * @param itemId - The internal UUID of the item
 * @param language - The target language code
 * @returns Translation data or null if not found
 */
export async function fetchItemTranslations(
  itemId: string,
  language: SupportedLocale
): Promise<ItemTranslationData | null>;

/**
 * Fetches translations for multiple articles in a single query
 * @param articleIds - Array of article UUIDs
 * @param language - The target language code
 * @returns Map of articleId to translation data
 */
export async function fetchArticleTranslations(
  articleIds: string[],
  language: SupportedLocale
): Promise<Map<string, ArticleTranslationData>>;

/**
 * Fetches translations for multiple links in a single query
 * @param linkIds - Array of link UUIDs
 * @param language - The target language code
 * @returns Map of linkId to translation data
 */
export async function fetchLinkTranslations(
  linkIds: string[],
  language: SupportedLocale
): Promise<Map<string, LinkTranslationData>>;

/**
 * Fetches translations for multiple tags in a single query
 * @param tagKeys - Array of tag keys
 * @param language - The target language code
 * @returns Map of tagKey to translated value
 */
export async function fetchTagTranslations(
  tagKeys: string[],
  language: SupportedLocale
): Promise<Map<string, TagTranslationData>>;
```

### Return Type Definitions

```typescript
// Types to be defined in the module or in /src/types/l10n.ts

export interface TranslatedItemResult {
  item: {
    id: string;
    publicId: string;
    name: string;
    description: string | null;
    sourceLanguage: SupportedLocale;
    // ... other item fields
  };
  translation: {
    name: string;
    description: string | null;
    language: SupportedLocale;
    status: string;
    translatedAt: string | null;
  } | null;
  isTranslated: boolean;
  displayLanguage: SupportedLocale;
}

export interface ItemTranslationData {
  id: string;
  name: string;
  description: string | null;
  language: SupportedLocale;
  status: string;
  translatedAt: string | null;
}

export interface ArticleTranslationData {
  id: string;
  title: string;
  description: string | null;
  language: SupportedLocale;
  status: string;
  translatedAt: string | null;
}

export interface LinkTranslationData {
  id: string;
  title: string;
  language: SupportedLocale;
  status: string;
  translatedAt: string | null;
}

export interface TagTranslationData {
  key: string;
  translatedValue: string;
  language: SupportedLocale;
  isSystemTag: boolean;
}
```

### Query Optimization Strategies

1. **Single Query for Item + Translation:**
   - Use LEFT JOIN pattern to fetch item and translation in one query
   - Only fetch completed translations (`translation_status = 'completed'`)

2. **Batch Queries for Collections:**
   - Use `.in()` filter to fetch multiple translations in single query
   - Return as Map for O(1) lookup by ID

3. **Graceful Fallback:**
   - Return original content when translation doesn't exist
   - Include metadata indicating translation status

---

## Implementation Tasks

### Task 1: Create Module File and Type Definitions
- Create `/src/lib/translations/fetch-translations.ts`
- Define local type interfaces for return values
- Import dependencies: `supabase` client, `SupportedLocale` type
- Set up module structure with JSDoc comments

### Task 2: Implement `fetchTranslatedItem`
- Query `items` table by `public_id`
- LEFT JOIN with `item_translations` for target language
- Filter translations to `translation_status = 'completed'`
- Return merged result with translation metadata

### Task 3: Implement `fetchItemTranslations`
- Query `item_translations` by `item_id` and `language`
- Return translation data or null
- Handle edge cases (not found, invalid language)

### Task 4: Implement `fetchArticleTranslations`
- Query `article_translations` with `.in('article_id', articleIds)`
- Filter by language and completed status
- Convert result array to Map<articleId, translation>
- Handle empty arrays and missing translations

### Task 5: Implement `fetchLinkTranslations`
- Query `link_translations` with `.in('link_id', linkIds)`
- Filter by language and completed status
- Convert result array to Map<linkId, translation>
- Handle empty arrays and missing translations

### Task 6: Implement `fetchTagTranslations`
- Query `tag_translations` with `.in('tag_key', tagKeys)`
- Filter by language
- Convert result array to Map<tagKey, translation>
- Handle empty arrays and missing translations

### Task 7: Create Barrel Export
- Create `/src/lib/translations/index.ts`
- Export all functions from `fetch-translations.ts`

### Task 8: Add Error Handling
- Wrap all queries with try-catch
- Log errors with context (function name, parameters)
- Return graceful fallbacks (null, empty maps)
- Don't expose internal errors to callers

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translations/fetch-translations.ts` | Main module with all fetch functions |
| `/src/lib/translations/index.ts` | Barrel exports for the module |

### Files to Potentially Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `/src/lib/translations/translation-utils.ts` | May need to import types | If utility types are shared |
| `/src/types/l10n.ts` | May add return type interfaces | If types should be centralized |

### Functions to Implement

| Function | Parameters | Return Type |
|----------|------------|-------------|
| `fetchTranslatedItem` | `publicId: string, language: SupportedLocale` | `Promise<TranslatedItemResult>` |
| `fetchItemTranslations` | `itemId: string, language: SupportedLocale` | `Promise<ItemTranslationData \| null>` |
| `fetchArticleTranslations` | `articleIds: string[], language: SupportedLocale` | `Promise<Map<string, ArticleTranslationData>>` |
| `fetchLinkTranslations` | `linkIds: string[], language: SupportedLocale` | `Promise<Map<string, LinkTranslationData>>` |
| `fetchTagTranslations` | `tagKeys: string[], language: SupportedLocale` | `Promise<Map<string, TagTranslationData>>` |

---

## Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| Translation tables exist | Epic 1 Migration | ✅ Verified in database types |
| Supabase client configured | `/src/lib/supabase.ts` | ✅ Verified |
| Language config exists | `/src/lib/i18n/config.ts` | ✅ Verified |
| Translation types defined | `/src/lib/translation-service/translation-service.types.ts` | ✅ Verified |

### Will Be Used By

| Consumer | File | Usage |
|----------|------|-------|
| Public Item API | `/src/app/api/public/items/[publicId]/route.ts` | Task 2.2 |
| Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Task 5.1 |
| ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Task 5.2 |

---

## Acceptance Criteria

- [ ] Module exists at `/src/lib/translations/fetch-translations.ts`
- [ ] `fetchTranslatedItem` function accepts a public item ID and language code as parameters
- [ ] `fetchTranslatedItem` joins item content tables with item translation tables using appropriate foreign keys
- [ ] `fetchTranslatedItem` returns both original item data and translation data in a structured response object
- [ ] `fetchTranslatedItem` handles missing translations by returning original content with metadata indicating no translation exists
- [ ] `fetchItemTranslations` function accepts an internal item ID and language code as parameters
- [ ] `fetchItemTranslations` retrieves only translation data without joining full item content
- [ ] `fetchItemTranslations` returns null or empty object when no translation exists for the specified language
- [ ] `fetchArticleTranslations` function accepts an array of article IDs and a language code
- [ ] `fetchArticleTranslations` retrieves translations for all specified articles in a single database query
- [ ] `fetchArticleTranslations` returns a collection mapping article IDs to their translation data
- [ ] `fetchArticleTranslations` handles partial results where some articles have translations and others do not
- [ ] `fetchLinkTranslations` function accepts an array of link IDs and a language code
- [ ] `fetchLinkTranslations` retrieves translations for all specified links in a single database query
- [ ] `fetchLinkTranslations` returns a collection mapping link IDs to their translation data
- [ ] `fetchTagTranslations` function accepts an array of tag keys and a language code
- [ ] `fetchTagTranslations` retrieves translations for all specified tags in a single database query
- [ ] `fetchTagTranslations` returns a collection mapping tag keys to their translation data
- [ ] All functions use proper TypeScript type definitions for parameters and return values
- [ ] All functions include proper error handling that prevents database errors from crashing the application
- [ ] Database queries are optimized with appropriate joins, filters, and index usage
- [ ] Functions minimize database round trips by fetching related data in single queries where possible
- [ ] All functions include JSDoc comments explaining parameters, return values, and usage examples
- [ ] Functions work correctly with Supabase client and follow established database access patterns in the project

---

## Example Usage

```typescript
// In server component or API route
import {
  fetchTranslatedItem,
  fetchArticleTranslations,
  fetchLinkTranslations,
  fetchTagTranslations
} from '@/lib/translations';

export async function getGuestItemContent(publicId: string, language: SupportedLocale) {
  // Fetch item with translation
  const itemResult = await fetchTranslatedItem(publicId, language);

  if (!itemResult.item) {
    return null; // Item not found
  }

  // Fetch related content translations
  const articleIds = /* from item data */;
  const linkIds = /* from item data */;
  const tagKeys = itemResult.item.tags;

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

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation tables empty (Epic 3 not complete) | Medium | Low | Functions return original content gracefully |
| Query performance with large datasets | Low | Medium | Use indexed columns (`item_id`, `language`), optimize with batch queries |
| Database connection errors | Low | High | Wrap all queries with try-catch, return fallback values |
| Type mismatches with database | Low | Medium | Use generated Database types from supabase.ts |

---

## Testing Considerations

1. **Unit Tests:**
   - Test each function with mock Supabase client
   - Test handling of missing translations
   - Test handling of empty arrays
   - Test error scenarios

2. **Integration Tests:**
   - Test actual database queries
   - Test with items that have/don't have translations
   - Test batch queries with mixed results

3. **Performance Tests:**
   - Verify batch queries complete < 200ms
   - Test with realistic data volumes

---

## References

- Request Definition: `docs/gen_requests_epic4.md` (REQ-341)
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 2.1)
- Database Types: `/src/lib/supabase.ts` (lines 274-684)
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Query Pattern Reference: `/src/app/api/items/[publicId]/route.ts`
