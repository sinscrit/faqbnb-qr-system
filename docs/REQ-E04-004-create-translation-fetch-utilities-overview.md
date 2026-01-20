# Implementation Overview: REQ-E04-004 - Create Translation Fetch Utilities

**Document Created:** 2026-01-19 21:45:00 UTC
**Last Modified:** 2026-01-19 21:45:00 UTC
**Request ID:** REQ-E04-004
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.1
**Size:** M (Medium)

---

## Summary

Create utility functions that retrieve translated content for items, articles, links, and tags in the guest's preferred language. These utilities will be the core data layer for serving translated content to guests, handling translation lookups, fallback logic, and batch retrieval for optimal performance.

---

## Current State Analysis

### What Exists

| Component | Status | Location |
|-----------|--------|----------|
| Supabase client (browser + admin) | EXISTS | `/src/lib/supabase.ts` |
| Translation tables schema | DEFINED | Database types in `/src/lib/supabase.ts` |
| Translation job queue | EXISTS | `/src/lib/job-queue/translation-jobs.ts` |
| Translation service | EXISTS | `/src/lib/translation-service/` |
| Language configuration | EXISTS | `/src/lib/i18n/config.ts` |
| Item fetch patterns | EXISTS | `/src/app/api/items/[publicId]/route.ts` |
| **Translation fetch utilities** | **MISSING** | **To be created** |

### Database Tables Available

From `/src/lib/supabase.ts`, the following translation tables are defined:

- **`item_translations`** - `id`, `item_id`, `language`, `name`, `description`, `translation_status`, `translated_at`
- **`article_translations`** - `id`, `article_id`, `language`, `title`, `description`, `translation_status`, `translated_at`
- **`link_translations`** - `id`, `link_id`, `language`, `title`, `translation_status`, `translated_at`
- **`tag_translations`** - `id`, `tag_key`, `language`, `translated_value`, `translation_status`, `translated_at`

Source tables have `source_language` field:
- **`items`** - Has `source_language` column
- **`item_articles`** - Has `source_language` column
- **`item_links`** - Has `source_language` column

---

## Implementation Requirements

### Functions to Implement

Based on the implementation plan Task 2.1:

| Function | Purpose | Parameters |
|----------|---------|------------|
| `fetchTranslatedItem` | Fetch complete item with translation applied | `publicId: string`, `language: SupportedLanguage` |
| `fetchItemTranslations` | Fetch only translation data for an item | `itemId: string`, `language: SupportedLanguage` |
| `fetchArticleTranslations` | Batch fetch article translations | `articleIds: string[]`, `language: SupportedLanguage` |
| `fetchLinkTranslations` | Batch fetch link translations | `linkIds: string[]`, `language: SupportedLanguage` |
| `fetchTagTranslations` | Batch fetch tag translations | `tagKeys: string[]`, `language: SupportedLanguage` |

### Type Definitions Required

```typescript
// Result wrapper for consistent error handling
export interface TranslationFetchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Translated item with original content preserved
export interface TranslatedItemData {
  item: {
    id: string;
    publicId: string;
    name: string;
    description: string | null;
    sourceLanguage: SupportedLanguage;
    originalName?: string;
    originalDescription?: string | null;
  };
  isTranslated: boolean;
  displayLanguage: SupportedLanguage;
  translationStatus?: 'completed' | 'pending' | 'failed';
}

// Individual translation records
export interface ItemTranslation {
  id: string;
  itemId: string;
  language: SupportedLanguage;
  name: string;
  description: string | null;
  translationStatus: string;
  translatedAt: string | null;
}

export interface ArticleTranslation {
  id: string;
  articleId: string;
  language: SupportedLanguage;
  title: string;
  description: string | null;
  translationStatus: string;
  translatedAt: string | null;
}

export interface LinkTranslation {
  id: string;
  linkId: string;
  language: SupportedLanguage;
  title: string;
  translationStatus: string;
  translatedAt: string | null;
}

export interface TagTranslation {
  tagKey: string;
  language: SupportedLanguage;
  translatedValue: string;
  translationStatus: string;
  translatedAt: string | null;
}
```

---

## Technical Approach

### 1. Module Structure

Create a new module at `/src/lib/translations/` with:

```
/src/lib/translations/
├── index.ts                    # Barrel exports
├── fetch-translations.ts       # Main fetch utility functions
└── fetch-translations.types.ts # Type definitions (optional, can inline)
```

### 2. Database Query Patterns

Follow existing patterns from `/src/lib/job-queue/translation-jobs.ts`:

**Pattern 1: Use `supabaseAdmin` for server-side operations**
```typescript
import { supabaseAdmin } from '@/lib/supabase';

const { data, error } = await supabaseAdmin
  .from('item_translations')
  .select('*')
  .eq('item_id', itemId)
  .eq('language', language)
  .eq('translation_status', 'completed')
  .single();
```

**Pattern 2: Join original content with translations**
```typescript
// Fetch item first
const { data: item } = await supabaseAdmin
  .from('items')
  .select('*')
  .eq('public_id', publicId)
  .single();

// Then fetch translation
const { data: translation } = await supabaseAdmin
  .from('item_translations')
  .select('*')
  .eq('item_id', item.id)
  .eq('language', language)
  .eq('translation_status', 'completed')
  .single();

// Merge with fallback
return {
  name: translation?.name ?? item.name,
  description: translation?.description ?? item.description,
  isTranslated: !!translation,
  originalName: translation ? item.name : undefined,
};
```

**Pattern 3: Batch fetch with `in` operator**
```typescript
const { data: translations } = await supabaseAdmin
  .from('article_translations')
  .select('*')
  .in('article_id', articleIds)
  .eq('language', language)
  .eq('translation_status', 'completed');

// Return as Map for efficient lookup
const translationMap = new Map(
  (translations || []).map(t => [t.article_id, t])
);
```

### 3. Error Handling Pattern

Follow the result object pattern used in job-queue:

```typescript
export async function fetchItemTranslations(
  itemId: string,
  language: SupportedLanguage
): Promise<TranslationFetchResult<ItemTranslation | null>> {
  try {
    console.log('FETCH_TRANSLATIONS: Fetching for item', { itemId, language });

    const { data, error } = await supabaseAdmin
      .from('item_translations')
      .select('*')
      .eq('item_id', itemId)
      .eq('language', language)
      .eq('translation_status', 'completed')
      .maybeSingle();

    if (error) {
      console.error('FETCH_TRANSLATIONS: Database error', error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data ? mapItemTranslation(data) : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('FETCH_TRANSLATIONS: Exception', error);
    return {
      success: false,
      error: `Exception: ${message}`,
    };
  }
}
```

### 4. Column Mapping

Map snake_case database columns to camelCase TypeScript properties:

```typescript
function mapItemTranslation(row: Record<string, unknown>): ItemTranslation {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    language: row.language as SupportedLanguage,
    name: row.name as string,
    description: row.description as string | null,
    translationStatus: row.translation_status as string,
    translatedAt: row.translated_at as string | null,
  };
}
```

---

## Function Specifications

### 1. `fetchTranslatedItem(publicId, language)`

**Purpose:** Fetch a complete item with translation applied, including fallback to original

**Input:**
- `publicId: string` - The item's public identifier
- `language: SupportedLanguage` - Target language for translation

**Output:**
```typescript
TranslationFetchResult<TranslatedItemData>
```

**Logic:**
1. Fetch item by `public_id` from `items` table
2. If item not found, return error
3. If item's `source_language` equals requested `language`, return original (no translation needed)
4. Fetch translation from `item_translations` where `translation_status = 'completed'`
5. Merge translation with original, preserving original content for "View Original" feature
6. Return merged result with translation metadata

### 2. `fetchItemTranslations(itemId, language)`

**Purpose:** Fetch only the translation record for an item (used when original is already loaded)

**Input:**
- `itemId: string` - The item's UUID
- `language: SupportedLanguage` - Target language

**Output:**
```typescript
TranslationFetchResult<ItemTranslation | null>
```

**Logic:**
1. Query `item_translations` table by `item_id` and `language`
2. Filter to `translation_status = 'completed'`
3. Return null if no translation found (not an error)

### 3. `fetchArticleTranslations(articleIds, language)`

**Purpose:** Batch fetch translations for multiple articles

**Input:**
- `articleIds: string[]` - Array of article UUIDs
- `language: SupportedLanguage` - Target language

**Output:**
```typescript
TranslationFetchResult<Map<string, ArticleTranslation>>
```

**Logic:**
1. If `articleIds` is empty, return empty Map
2. Query `article_translations` with `article_id IN (...)` and `language`
3. Filter to `translation_status = 'completed'`
4. Return as Map keyed by `articleId` for O(1) lookup

### 4. `fetchLinkTranslations(linkIds, language)`

**Purpose:** Batch fetch translations for multiple links

**Input:**
- `linkIds: string[]` - Array of link UUIDs
- `language: SupportedLanguage` - Target language

**Output:**
```typescript
TranslationFetchResult<Map<string, LinkTranslation>>
```

**Logic:** Same pattern as `fetchArticleTranslations`

### 5. `fetchTagTranslations(tagKeys, language)`

**Purpose:** Batch fetch translations for tag keys

**Input:**
- `tagKeys: string[]` - Array of tag keys (e.g., "kitchen", "bathroom")
- `language: SupportedLanguage` - Target language

**Output:**
```typescript
TranslationFetchResult<Map<string, TagTranslation>>
```

**Logic:**
1. If `tagKeys` is empty, return empty Map
2. Query `tag_translations` with `tag_key IN (...)` and `language`
3. Filter to `translation_status = 'completed'`
4. Return as Map keyed by `tagKey`

---

## Dependencies

### Required Imports

```typescript
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import type { SupportedLanguage } from '@/lib/i18n/config';
// or from '@/types' if l10n.ts exports are added
```

### Dependent on Epic 1 Foundation

- `/src/lib/i18n/config.ts` must export `SupportedLanguage` type
- `/src/types/l10n.ts` should be created (Task 1.1) before this task

### Used by Epic 4 Downstream

- `/src/app/api/public/items/[publicId]/route.ts` (Task 2.2)
- `/src/app/item/[publicId]/page.tsx` (Task 5.1)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translations/index.ts` | Barrel exports for translation utilities |
| `/src/lib/translations/fetch-translations.ts` | Main translation fetch functions |

### New Functions to Create

| Function | File | Description |
|----------|------|-------------|
| `fetchTranslatedItem` | `fetch-translations.ts` | Fetch item with translation applied |
| `fetchItemTranslations` | `fetch-translations.ts` | Fetch item translation record only |
| `fetchArticleTranslations` | `fetch-translations.ts` | Batch fetch article translations |
| `fetchLinkTranslations` | `fetch-translations.ts` | Batch fetch link translations |
| `fetchTagTranslations` | `fetch-translations.ts` | Batch fetch tag translations |
| `mapItemTranslation` | `fetch-translations.ts` | (internal) Map DB row to type |
| `mapArticleTranslation` | `fetch-translations.ts` | (internal) Map DB row to type |
| `mapLinkTranslation` | `fetch-translations.ts` | (internal) Map DB row to type |
| `mapTagTranslation` | `fetch-translations.ts` | (internal) Map DB row to type |

### Types to Define

| Type | Description |
|------|-------------|
| `TranslationFetchResult<T>` | Generic result wrapper with success/error |
| `TranslatedItemData` | Full item with translation metadata |
| `ItemTranslation` | Item translation record |
| `ArticleTranslation` | Article translation record |
| `LinkTranslation` | Link translation record |
| `TagTranslation` | Tag translation record |

### Files NOT to Modify

- `/src/lib/supabase.ts` - Database types already defined
- `/src/lib/job-queue/*` - Job queue is separate concern
- `/src/lib/translation-service/*` - Translation service is separate concern
- `/src/lib/i18n/config.ts` - Language config already exists

---

## Acceptance Criteria Verification

| PRD Criteria | Implementation |
|--------------|----------------|
| Utility function fetches complete item with translation for given publicId and language | `fetchTranslatedItem()` |
| Utility function fetches only translation data for specific item | `fetchItemTranslations()` |
| Batch-fetches article translations in single query | `fetchArticleTranslations()` with `IN` clause |
| Batch-fetches link translations in single query | `fetchLinkTranslations()` with `IN` clause |
| Batch-fetches tag translations in single query | `fetchTagTranslations()` with `IN` clause |
| Returns null/empty when content doesn't exist (no throwing) | All functions return `{ success: true, data: null/empty }` |
| Automatic fallback to original when translation missing | `fetchTranslatedItem()` merges with fallback |
| Consistently typed returns with TypeScript interfaces | All return types defined |
| Language codes match supported language types | Uses `SupportedLanguage` type |
| Functions exported from dedicated module | `/src/lib/translations/index.ts` |

---

## Testing Considerations

### Unit Test Scenarios

1. **fetchTranslatedItem**
   - Item exists with completed translation → returns translated content
   - Item exists without translation → returns original with `isTranslated: false`
   - Item exists with pending translation → returns original (only completed translations)
   - Item not found → returns error
   - Same source and target language → returns original (no translation needed)

2. **fetchItemTranslations**
   - Translation exists and completed → returns translation record
   - Translation exists but pending → returns null
   - No translation exists → returns null (not error)
   - Invalid itemId → returns null

3. **Batch functions (articles, links, tags)**
   - Empty input array → returns empty Map
   - Some IDs have translations → returns Map with only translated items
   - All IDs have translations → returns complete Map
   - No IDs have translations → returns empty Map

### Performance Validation

- Single translation fetch: < 50ms
- Batch fetch with 10 items: < 100ms
- Use database indexes on `item_id`, `language`, `translation_status`

---

## Implementation Notes

### Why `maybeSingle()` instead of `single()`

Use `.maybeSingle()` for translation lookups because a missing translation is a valid state (the content hasn't been translated yet), not an error condition. Using `.single()` would throw an error when no translation exists.

### Why Return Maps for Batch Operations

Returning `Map<string, Translation>` instead of arrays allows O(1) lookup when merging translations with original content:

```typescript
// Efficient lookup when processing articles
const translations = await fetchArticleTranslations(articleIds, language);
const translatedArticles = articles.map(article => ({
  ...article,
  title: translations.data?.get(article.id)?.title ?? article.title,
  isTranslated: translations.data?.has(article.id) ?? false,
}));
```

### Console Logging Convention

Follow the existing pattern with operation prefixes for easy log filtering:

```typescript
console.log('FETCH_TRANSLATIONS: Fetching item', { publicId, language });
console.error('FETCH_TRANSLATIONS: Database error', error);
```

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 2.1)
- **Request:** `/docs/gen_requests_epic4.md` (REQ-E04-004)
- **Existing Patterns:** `/src/lib/job-queue/translation-jobs.ts`
- **Database Types:** `/src/lib/supabase.ts` (lines 463-600)
- **Language Config:** `/src/lib/i18n/config.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 4 - Guest Experience*
