# REQ-307: Create Translation Fetch Utilities - Implementation Overview

**Last Modified:** 2026-01-18 15:30:00 UTC
**Request ID:** REQ-307
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.1
**PRD Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## 1. Summary

Create dedicated utility functions to fetch translated content from the database for guest-facing features. These utilities will provide standardized methods to retrieve items, articles, links, and tags with their corresponding translations based on a requested language code, with proper fallback behavior when translations are unavailable.

---

## 2. Background

### Current State
- Items, articles, and links are fetched without translation support
- The existing API at `/src/app/api/items/[publicId]/route.ts` returns content in its original language only
- No standardized pattern exists for fetching content with translation joins
- Developers must write custom queries to access translation tables

### Dependencies from Epic 1
- Translation tables: `item_translations`, `article_translations`, `link_translations`, `tag_translations`
- Each translation table has columns: `id`, `{entity}_id` (FK), `language`, `translation_status`, and translated fields

### Target State
- A centralized module providing typed functions for fetching translated content
- Consistent query patterns across all content types
- Graceful fallback to source content when translations don't exist
- Type-safe return values including both original and translated content

---

## 3. Technical Approach

### Architecture

```
/src/lib/translations/
├── index.ts                    # Barrel exports
├── fetch-translations.ts       # Main fetch utilities (this task)
└── translation-utils.ts        # Helper functions (Task 2.4)
```

### Query Strategy

All fetch functions will use LEFT JOIN patterns to ensure content is always returned, even when translations don't exist:

```typescript
// Pattern for single item fetch with translation
const { data } = await supabase
  .from('items')
  .select(`
    *,
    item_translations!left (
      id,
      name,
      description,
      translation_status
    )
  `)
  .eq('public_id', publicId)
  .eq('item_translations.language', language)
  .eq('item_translations.translation_status', 'completed')
  .single();
```

### Type Definitions

Functions will leverage types from `/src/types/l10n.ts` (REQ-304):

```typescript
import type {
  SupportedLanguage,
  TranslatedItem,
  TranslatedArticle,
  TranslatedLink,
  TranslatedTag
} from '@/types/l10n';
```

### Error Handling

- Return null/empty array for not-found scenarios (not throw)
- Log database errors but don't expose to callers
- Always return source content when translation is missing

---

## 4. Detailed Implementation

### 4.1 fetchTranslatedItem(publicId, language)

Fetches a single item by public ID with its translation for the specified language.

**Parameters:**
- `publicId: string` - The item's public identifier
- `language: SupportedLanguage` - Target language code

**Returns:** `Promise<TranslatedItem | null>`

**Query Logic:**
1. Fetch item by `public_id` from `items` table
2. LEFT JOIN `item_translations` where `language` matches and `translation_status = 'completed'`
3. If translation exists, merge translated fields (`name`, `description`)
4. If no translation, return original content with `isTranslated: false`

**Example Return:**
```typescript
{
  id: 'uuid',
  publicId: 'ABC123',
  name: 'Kühlschrank',           // Translated name
  description: 'Ein Kühlschrank...', // Translated description
  originalName: 'Refrigerator',   // Original for "View Original"
  originalDescription: 'A refrigerator...',
  displayLanguage: 'de',
  sourceLanguage: 'en',
  isTranslated: true,
  translationStatus: 'completed'
}
```

### 4.2 fetchItemTranslations(itemId, language)

Fetches only the translation record for an item (without joining the full item data).

**Parameters:**
- `itemId: string` - The item's internal UUID
- `language: SupportedLanguage` - Target language code

**Returns:** `Promise<ItemTranslation | null>`

**Use Case:** When you already have the item data and need just the translation overlay.

### 4.3 fetchArticleTranslations(articleIds, language)

Fetches translations for multiple articles in a single query.

**Parameters:**
- `articleIds: string[]` - Array of article UUIDs
- `language: SupportedLanguage` - Target language code

**Returns:** `Promise<Map<string, ArticleTranslation>>`

**Query Logic:**
1. Query `article_translations` with `article_id IN (...)` filter
2. Filter by language and `translation_status = 'completed'`
3. Return as Map keyed by `article_id` for O(1) lookup

### 4.4 fetchLinkTranslations(linkIds, language)

Fetches translations for multiple links in a single query.

**Parameters:**
- `linkIds: string[]` - Array of link UUIDs
- `language: SupportedLanguage` - Target language code

**Returns:** `Promise<Map<string, LinkTranslation>>`

**Note:** Only `title` is translated; `url` is never translated.

### 4.5 fetchTagTranslations(tagKeys, language)

Fetches translations for system tags by their keys.

**Parameters:**
- `tagKeys: string[]` - Array of tag keys (e.g., `['#room.kitchen', '#room.bathroom']`)
- `language: SupportedLanguage` - Target language code

**Returns:** `Promise<Map<string, TranslatedTag>>`

**Query Logic:**
1. Query `tag_translations` with `tag_key IN (...)` filter
2. Return Map keyed by `tag_key`

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File | Purpose |
|------|---------|
| `/src/lib/translations/fetch-translations.ts` | Main translation fetch utilities |
| `/src/lib/translations/index.ts` | Barrel exports for translation module |

### Files to MODIFY

| File | Modification |
|------|--------------|
| None | This task creates new files only |

### Functions to IMPLEMENT

| Function | Signature |
|----------|-----------|
| `fetchTranslatedItem` | `(publicId: string, language: SupportedLanguage) => Promise<TranslatedItem \| null>` |
| `fetchItemTranslations` | `(itemId: string, language: SupportedLanguage) => Promise<ItemTranslation \| null>` |
| `fetchArticleTranslations` | `(articleIds: string[], language: SupportedLanguage) => Promise<Map<string, ArticleTranslation>>` |
| `fetchLinkTranslations` | `(linkIds: string[], language: SupportedLanguage) => Promise<Map<string, LinkTranslation>>` |
| `fetchTagTranslations` | `(tagKeys: string[], language: SupportedLanguage) => Promise<Map<string, TranslatedTag>>` |

### Database Tables (READ ONLY)

| Table | Operations |
|-------|------------|
| `items` | SELECT with LEFT JOIN |
| `item_translations` | SELECT |
| `item_articles` | SELECT (if fetching full item) |
| `article_translations` | SELECT |
| `item_links` | SELECT (if fetching full item) |
| `link_translations` | SELECT |
| `tag_translations` | SELECT |

---

## 6. Implementation Pattern Reference

### Existing Query Pattern (from `/src/app/api/items/[publicId]/route.ts`)

```typescript
// Current item fetch pattern
const { data: item, error } = await supabase
  .from('items')
  .select('*')
  .eq('public_id', publicId)
  .single();

if (error) {
  console.error('Error fetching item:', error.message);
  return null;
}
```

### New Translation-Aware Pattern

```typescript
// New pattern with translation join
export async function fetchTranslatedItem(
  publicId: string,
  language: SupportedLanguage
): Promise<TranslatedItem | null> {
  const supabase = await createSupabaseServer();

  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      public_id,
      name,
      description,
      source_language,
      item_translations!left (
        id,
        name,
        description,
        language,
        translation_status
      )
    `)
    .eq('public_id', publicId)
    .single();

  if (error || !item) {
    if (error) console.error('Error fetching translated item:', error.message);
    return null;
  }

  // Find matching translation (filter client-side for more control)
  const translation = item.item_translations?.find(
    t => t.language === language && t.translation_status === 'completed'
  );

  return {
    id: item.id,
    publicId: item.public_id,
    name: translation?.name ?? item.name,
    description: translation?.description ?? item.description,
    originalName: item.name,
    originalDescription: item.description,
    sourceLanguage: item.source_language ?? 'en',
    displayLanguage: translation ? language : (item.source_language ?? 'en'),
    isTranslated: !!translation,
    translationStatus: translation?.translation_status
  };
}
```

### Bulk Fetch Pattern

```typescript
// Bulk fetch pattern for efficiency
export async function fetchArticleTranslations(
  articleIds: string[],
  language: SupportedLanguage
): Promise<Map<string, ArticleTranslation>> {
  if (articleIds.length === 0) return new Map();

  const supabase = await createSupabaseServer();

  const { data: translations, error } = await supabase
    .from('article_translations')
    .select('*')
    .in('article_id', articleIds)
    .eq('language', language)
    .eq('translation_status', 'completed');

  if (error) {
    console.error('Error fetching article translations:', error.message);
    return new Map();
  }

  const translationMap = new Map<string, ArticleTranslation>();
  for (const t of translations || []) {
    translationMap.set(t.article_id, {
      title: t.title,
      description: t.description,
      language: t.language,
      translationStatus: t.translation_status
    });
  }

  return translationMap;
}
```

---

## 7. Type Interface Requirements

### Required Types (from `/src/types/l10n.ts`)

```typescript
// These types should already exist from REQ-304
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface TranslatedItem {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  originalName: string;
  originalDescription: string | null;
  sourceLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  isTranslated: boolean;
  translationStatus?: 'completed' | 'pending' | 'failed';
}

// Internal types for this module
export interface ItemTranslation {
  name: string;
  description: string | null;
  language: SupportedLanguage;
  translationStatus: 'completed' | 'pending' | 'failed';
}

export interface ArticleTranslation {
  title: string;
  description: string | null;
  language: SupportedLanguage;
  translationStatus: 'completed' | 'pending' | 'failed';
}

export interface LinkTranslation {
  title: string;
  language: SupportedLanguage;
  translationStatus: 'completed' | 'pending' | 'failed';
}

export interface TranslatedTag {
  key: string;
  displayValue: string;
  isTranslated: boolean;
}
```

---

## 8. Testing Considerations

### Test Scenarios

1. **Item with completed translation** - Returns translated content
2. **Item with no translation** - Returns original content with `isTranslated: false`
3. **Item with pending translation** - Returns original content (pending not shown)
4. **Invalid publicId** - Returns `null`
5. **Empty articleIds array** - Returns empty Map
6. **Bulk fetch with partial translations** - Map contains only existing translations
7. **Unsupported language code** - Returns original content

### Performance Considerations

- Use batch queries for multiple entities (IN clause)
- Index on `(item_id, language)` in translation tables
- Consider caching frequently accessed translations
- Avoid N+1 queries by fetching translations in bulk

---

## 9. Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| Translation tables exist | Epic 1 (REQ-223) | Must verify |
| `source_language` column on items | Epic 1 (REQ-224) | Must verify |
| Types file (`/src/types/l10n.ts`) | REQ-304 | Must verify |
| Server Supabase client | Existing | Available |

### Verification Steps

Before implementing, verify:
1. Translation tables exist in database
2. `items.source_language` column exists
3. L10n types are exported from `/src/types/l10n.ts`

---

## 10. Acceptance Criteria

From REQ-307:

- [ ] Function exists to fetch a single item with its translation given a public ID and language code
- [ ] Function exists to fetch only translation data for an item given its internal ID and language code
- [ ] Function exists to fetch translations for multiple articles given a list of article IDs and language code
- [ ] Function exists to fetch translations for multiple links given a list of link IDs and language code
- [ ] Function exists to fetch translations for multiple tags given a list of tag keys and language code
- [ ] All functions properly join translation tables with source content tables using appropriate foreign key relationships
- [ ] Functions gracefully handle cases where translations do not exist for the requested language
- [ ] Return values include both source content and translation data in a predictable structure
- [ ] Functions use proper type definitions for parameters and return values
- [ ] Database queries are optimized to minimize round trips and use appropriate indexes

---

## 11. Implementation Checklist

### Pre-Implementation
- [ ] Verify translation tables exist in database
- [ ] Verify L10n types are available
- [ ] Create `/src/lib/translations/` directory structure

### Implementation
- [ ] Create `fetch-translations.ts` with all five functions
- [ ] Create `index.ts` barrel exports
- [ ] Add JSDoc comments to all exported functions
- [ ] Handle all error cases gracefully

### Post-Implementation
- [ ] Test each function with sample data
- [ ] Verify type safety compiles without errors
- [ ] Build passes: `npm run build`

---

## 12. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Document: `/docs/gen_requests_epic4.md` (REQ-307)
- Existing Item API: `/src/app/api/items/[publicId]/route.ts`
- Supabase Client: `/src/lib/supabase-server.ts`
- Type Patterns: `/src/types/index.ts`
