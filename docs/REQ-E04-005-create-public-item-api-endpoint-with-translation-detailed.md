# Detailed Task Breakdown: REQ-E04-005 - Create Public Item API Endpoint with Translation Support

**Document Created:** 2026-01-19 23:15:00 UTC
**Last Modified:** 2026-01-19 23:15:00 UTC
**Request ID:** REQ-E04-005
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.2
**Size:** M (Medium)
**Overview Document:** REQ-E04-005-create-public-item-api-endpoint-with-translation-overview.md

---

## Executive Summary

This task creates a new public API endpoint at `GET /api/public/items/[publicId]` that returns item details with all related content (articles, links, tags) translated into the guest's requested language. The endpoint accepts an optional `?lang=` query parameter, merges original content with translations, and returns a `GuestContentResponse` format including translation metadata.

---

## Prerequisites

Before starting implementation, verify:

| Prerequisite | Status Check | Location |
|--------------|--------------|----------|
| Language config exists | `isSupportedLocale()`, `SupportedLocale` type | `/src/lib/i18n/config.ts` |
| Translation tables exist | `item_translations`, `article_translations`, `link_translations`, `tag_translations` | Database (Supabase) |
| Supabase admin client | `supabaseAdmin` export | `/src/lib/supabase.ts` |
| Translation fetch utilities | `fetchItemTranslations()`, etc. | `/src/lib/translations/fetch-translations.ts` (REQ-E04-004) |

**Note:** If REQ-E04-004 (translation fetch utilities) is not complete, this task should create inline helper functions that can later be refactored to use the shared utilities.

---

## Task Breakdown

### Task 1: Create Directory Structure and Route File

**Effort:** XS (15 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 1.1 Create the directory structure

Create the necessary directories for the public API endpoint:

```
/src/app/api/public/items/[publicId]/route.ts
```

#### 1.2 Create the initial route file with imports

```typescript
/**
 * Public Item API Endpoint with Translation Support
 *
 * REQ-E04-005: Create public item API endpoint with translation support
 * Epic 4 - Guest Experience, Phase 2, Task 2.2
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  isSupportedLocale,
  type SupportedLocale,
  defaultLocale
} from '@/lib/i18n/config';
```

#### Acceptance Criteria for Task 1
- [ ] Directory `/src/app/api/public/items/[publicId]/` exists
- [ ] File `route.ts` is created with proper header comment and imports
- [ ] No TypeScript compilation errors

---

### Task 2: Define Response Type Interfaces

**Effort:** S (30 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 2.1 Define TranslatedItem interface

```typescript
interface TranslatedItem {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  sourceLanguage: SupportedLocale;
  displayLanguage: SupportedLocale;
  isTranslated: boolean;
  translationStatus?: 'completed' | 'pending' | 'failed';
  originalName?: string;
  originalDescription?: string | null;
}
```

#### 2.2 Define TranslatedArticle interface

```typescript
interface TranslatedArticle {
  id: string;
  title: string;
  description: string | null;
  purpose: string;
  displayOrder: number;
  sourceLanguage: SupportedLocale;
  displayLanguage: SupportedLocale;
  isTranslated: boolean;
  originalTitle?: string;
  originalDescription?: string | null;
  links: TranslatedLink[];
}
```

#### 2.3 Define TranslatedLink interface

```typescript
interface TranslatedLink {
  id: string;
  title: string;
  url: string;
  linkType: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  sourceLanguage: SupportedLocale;
  displayLanguage: SupportedLocale;
  isTranslated: boolean;
  originalTitle?: string;
}
```

#### 2.4 Define TranslatedTag interface

```typescript
interface TranslatedTag {
  key: string;
  displayValue: string;
  isTranslated: boolean;
}
```

#### 2.5 Define TranslationMeta interface

```typescript
interface TranslationMeta {
  requestedLanguage: SupportedLocale;
  displayLanguage: SupportedLocale;
  sourceLanguage: SupportedLocale;
  availableTranslations: SupportedLocale[];
  isShowingTranslation: boolean;
}
```

#### 2.6 Define GuestContentResponse interface

```typescript
interface GuestContentResponse {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  tags: TranslatedTag[];
  translationMeta: TranslationMeta;
}
```

#### 2.7 Define ErrorResponse interface

```typescript
interface ErrorResponse {
  success: false;
  error: string;
}
```

#### Acceptance Criteria for Task 2
- [ ] All 7 interfaces are defined in the route file
- [ ] Interfaces match the specification in the Implementation Plan
- [ ] TypeScript compilation succeeds
- [ ] Types use `SupportedLocale` from i18n config

---

### Task 3: Implement Language Validation Helper

**Effort:** XS (15 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 3.1 Create validateLanguageParam function

```typescript
/**
 * Validates and normalizes the language query parameter
 * @param lang - The raw language parameter from the query string
 * @returns A valid SupportedLocale
 * @throws Error if the language code is invalid
 */
function validateLanguageParam(lang: string | null): SupportedLocale {
  // Default to English if no language specified
  if (!lang) {
    return defaultLocale;
  }

  // Validate against supported locales
  if (!isSupportedLocale(lang)) {
    throw new Error(`Invalid language code: ${lang}`);
  }

  return lang;
}
```

#### Acceptance Criteria for Task 3
- [ ] Function returns `defaultLocale` ('en') when lang is null/undefined
- [ ] Function returns the locale when valid
- [ ] Function throws Error with message when invalid locale provided
- [ ] Error message includes the invalid code for debugging

---

### Task 4: Implement Available Translations Query

**Effort:** S (20 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 4.1 Create getAvailableTranslations function

```typescript
/**
 * Fetches the list of languages that have completed translations for an item
 * @param itemId - The internal item ID (UUID)
 * @returns Array of language codes with completed translations
 */
async function getAvailableTranslations(itemId: string): Promise<SupportedLocale[]> {
  const { data: itemTranslations, error } = await supabaseAdmin
    .from('item_translations')
    .select('language')
    .eq('item_id', itemId)
    .eq('translation_status', 'completed');

  if (error) {
    console.error('PUBLIC_ITEM_API: Error fetching available translations', error);
    return [];
  }

  // Extract unique language codes
  const languages = new Set<SupportedLocale>();
  (itemTranslations || []).forEach(t => {
    if (isSupportedLocale(t.language)) {
      languages.add(t.language);
    }
  });

  return Array.from(languages);
}
```

#### Acceptance Criteria for Task 4
- [ ] Function queries `item_translations` table
- [ ] Only returns languages with `translation_status = 'completed'`
- [ ] Returns empty array on error (graceful degradation)
- [ ] Validates language codes before adding to result
- [ ] Logs errors for debugging

---

### Task 5: Implement Translation Merge Functions

**Effort:** M (45 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 5.1 Create mergeItemWithTranslation function

```typescript
/**
 * Merges an item row with its translation data
 * @param item - The original item from the database
 * @param translation - The translation record (or null if none)
 * @param requestedLanguage - The language that was requested
 * @returns TranslatedItem with merged content
 */
function mergeItemWithTranslation(
  item: {
    id: string;
    public_id: string;
    name: string;
    description: string | null;
    source_language: string | null;
    tags?: string[] | null;
  },
  translation: {
    name: string;
    description: string | null;
    translation_status: string;
  } | null,
  requestedLanguage: SupportedLocale
): TranslatedItem {
  const sourceLanguage = (item.source_language || 'en') as SupportedLocale;
  const isTranslated = !!translation && translation.translation_status === 'completed';

  return {
    id: item.id,
    publicId: item.public_id,
    name: isTranslated ? translation.name : item.name,
    description: isTranslated ? translation.description : item.description,
    sourceLanguage,
    displayLanguage: isTranslated ? requestedLanguage : sourceLanguage,
    isTranslated,
    translationStatus: translation?.translation_status as 'completed' | 'pending' | 'failed' | undefined,
    originalName: isTranslated ? item.name : undefined,
    originalDescription: isTranslated ? item.description : undefined,
  };
}
```

#### 5.2 Create mergeArticleWithTranslation function

```typescript
/**
 * Merges an article row with its translation data
 */
function mergeArticleWithTranslation(
  article: {
    id: string;
    title: string;
    description: string | null;
    purpose: string;
    display_order: number | null;
    source_language: string | null;
  },
  translation: {
    title: string;
    description: string | null;
    translation_status: string;
  } | null,
  requestedLanguage: SupportedLocale,
  translatedLinks: TranslatedLink[]
): TranslatedArticle {
  const sourceLanguage = (article.source_language || 'en') as SupportedLocale;
  const isTranslated = !!translation && translation.translation_status === 'completed';

  return {
    id: article.id,
    title: isTranslated ? translation.title : article.title,
    description: isTranslated ? translation.description : article.description,
    purpose: article.purpose,
    displayOrder: article.display_order || 0,
    sourceLanguage,
    displayLanguage: isTranslated ? requestedLanguage : sourceLanguage,
    isTranslated,
    originalTitle: isTranslated ? article.title : undefined,
    originalDescription: isTranslated ? article.description : undefined,
    links: translatedLinks,
  };
}
```

#### 5.3 Create mergeLinkWithTranslation function

```typescript
/**
 * Merges a link row with its translation data
 */
function mergeLinkWithTranslation(
  link: {
    id: string;
    title: string;
    url: string;
    link_type: string;
    thumbnail_url: string | null;
    display_order: number | null;
    source_language: string | null;
  },
  translation: {
    title: string;
    translation_status: string;
  } | null,
  requestedLanguage: SupportedLocale
): TranslatedLink {
  const sourceLanguage = (link.source_language || 'en') as SupportedLocale;
  const isTranslated = !!translation && translation.translation_status === 'completed';

  return {
    id: link.id,
    title: isTranslated ? translation.title : link.title,
    url: link.url, // URLs are never translated
    linkType: link.link_type,
    thumbnailUrl: link.thumbnail_url,
    displayOrder: link.display_order || 0,
    sourceLanguage,
    displayLanguage: isTranslated ? requestedLanguage : sourceLanguage,
    isTranslated,
    originalTitle: isTranslated ? link.title : undefined,
  };
}
```

#### 5.4 Create mergeTagWithTranslation function

```typescript
/**
 * Merges a tag key with its translation data
 */
function mergeTagWithTranslation(
  tagKey: string,
  translation: {
    translated_value: string;
  } | null
): TranslatedTag {
  return {
    key: tagKey,
    displayValue: translation?.translated_value || tagKey,
    isTranslated: !!translation,
  };
}
```

#### Acceptance Criteria for Task 5
- [ ] All 4 merge functions are implemented
- [ ] Functions preserve original content in `originalX` fields when translated
- [ ] Functions fall back to original content when translation is missing or not completed
- [ ] `displayLanguage` reflects actual displayed content language
- [ ] `isTranslated` accurately indicates if translation is shown
- [ ] URLs are never modified (only title translated for links)

---

### Task 6: Implement Main GET Handler - Part 1 (Request Parsing)

**Effort:** S (20 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 6.1 Implement GET handler with request parsing and validation

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Extract route params and query params
    const { publicId } = await params;
    const { searchParams } = new URL(request.url);
    const langParam = searchParams.get('lang');

    console.log('PUBLIC_ITEM_API: Request received', { publicId, lang: langParam });

    // Validate public ID
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate language parameter
    let requestedLanguage: SupportedLocale;
    try {
      requestedLanguage = validateLanguageParam(langParam);
    } catch (e) {
      const error = e as Error;
      return NextResponse.json(
        { success: false, error: error.message } as ErrorResponse,
        { status: 400 }
      );
    }

    console.log('PUBLIC_ITEM_API: Validated params', { publicId, requestedLanguage });

    // ... continue in Task 7
```

#### Acceptance Criteria for Task 6
- [ ] Extracts `publicId` from route params correctly
- [ ] Extracts `lang` from query params correctly
- [ ] Returns 400 for missing publicId
- [ ] Returns 400 for invalid language code
- [ ] Logs request parameters for debugging

---

### Task 7: Implement Main GET Handler - Part 2 (Fetch Item Data)

**Effort:** M (30 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 7.1 Fetch item by public_id

```typescript
    // Fetch item by public_id
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('id, public_id, name, description, source_language, tags')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      console.log('PUBLIC_ITEM_API: Item not found', { publicId, error: itemError });
      return NextResponse.json(
        { success: false, error: 'Item not found' } as ErrorResponse,
        { status: 404 }
      );
    }

    console.log('PUBLIC_ITEM_API: Item found', {
      itemId: item.id,
      sourceLanguage: item.source_language
    });
```

#### 7.2 Fetch articles for the item

```typescript
    // Fetch articles for this item
    const { data: articles, error: articlesError } = await supabaseAdmin
      .from('item_articles')
      .select('id, title, description, purpose, display_order, source_language')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });

    if (articlesError) {
      console.error('PUBLIC_ITEM_API: Error fetching articles', articlesError);
      // Continue without articles - graceful degradation
    }

    const articlesList = articles || [];
    const articleIds = articlesList.map(a => a.id);
```

#### 7.3 Fetch links for articles

```typescript
    // Fetch all links for the item (both direct links and article links)
    const { data: links, error: linksError } = await supabaseAdmin
      .from('item_links')
      .select('id, title, url, link_type, thumbnail_url, display_order, source_language, article_id')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('PUBLIC_ITEM_API: Error fetching links', linksError);
      // Continue without links - graceful degradation
    }

    const linksList = links || [];
    const linkIds = linksList.map(l => l.id);
    const tagKeys = (item.tags as string[] | null) || [];
```

#### Acceptance Criteria for Task 7
- [ ] Item fetched by `public_id` (not `id`)
- [ ] Returns 404 when item not found
- [ ] Articles fetched and ordered by `display_order`
- [ ] Links fetched for the item
- [ ] Tag keys extracted from item
- [ ] Graceful handling of article/link fetch errors

---

### Task 8: Implement Main GET Handler - Part 3 (Fetch Translations)

**Effort:** M (40 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 8.1 Determine if translations are needed

```typescript
    // Determine if we need to fetch translations
    const sourceLanguage = (item.source_language || 'en') as SupportedLocale;
    const needsTranslation = requestedLanguage !== sourceLanguage;

    console.log('PUBLIC_ITEM_API: Translation check', {
      sourceLanguage,
      requestedLanguage,
      needsTranslation
    });
```

#### 8.2 Fetch item translation

```typescript
    // Initialize translation maps
    let itemTranslation: { name: string; description: string | null; translation_status: string } | null = null;
    const articleTranslationsMap = new Map<string, { title: string; description: string | null; translation_status: string }>();
    const linkTranslationsMap = new Map<string, { title: string; translation_status: string }>();
    const tagTranslationsMap = new Map<string, { translated_value: string }>();

    if (needsTranslation) {
      // Fetch item translation
      const { data: itemTrans } = await supabaseAdmin
        .from('item_translations')
        .select('name, description, translation_status')
        .eq('item_id', item.id)
        .eq('language', requestedLanguage)
        .single();

      itemTranslation = itemTrans || null;
```

#### 8.3 Fetch article translations

```typescript
      // Fetch article translations
      if (articleIds.length > 0) {
        const { data: articleTrans } = await supabaseAdmin
          .from('article_translations')
          .select('article_id, title, description, translation_status')
          .in('article_id', articleIds)
          .eq('language', requestedLanguage);

        (articleTrans || []).forEach(t => {
          articleTranslationsMap.set(t.article_id, {
            title: t.title,
            description: t.description,
            translation_status: t.translation_status,
          });
        });
      }
```

#### 8.4 Fetch link translations

```typescript
      // Fetch link translations
      if (linkIds.length > 0) {
        const { data: linkTrans } = await supabaseAdmin
          .from('link_translations')
          .select('link_id, title, translation_status')
          .in('link_id', linkIds)
          .eq('language', requestedLanguage);

        (linkTrans || []).forEach(t => {
          linkTranslationsMap.set(t.link_id, {
            title: t.title,
            translation_status: t.translation_status,
          });
        });
      }
```

#### 8.5 Fetch tag translations

```typescript
      // Fetch tag translations
      if (tagKeys.length > 0) {
        const { data: tagTrans } = await supabaseAdmin
          .from('tag_translations')
          .select('tag_key, translated_value')
          .in('tag_key', tagKeys)
          .eq('language', requestedLanguage);

        (tagTrans || []).forEach(t => {
          tagTranslationsMap.set(t.tag_key, {
            translated_value: t.translated_value,
          });
        });
      }

      console.log('PUBLIC_ITEM_API: Translations fetched', {
        hasItemTranslation: !!itemTranslation,
        articleTranslations: articleTranslationsMap.size,
        linkTranslations: linkTranslationsMap.size,
        tagTranslations: tagTranslationsMap.size,
      });
    }
```

#### Acceptance Criteria for Task 8
- [ ] Translation fetch skipped when `requestedLanguage === sourceLanguage`
- [ ] Item translation fetched for the specific language
- [ ] Article translations batch-fetched using `in()` query
- [ ] Link translations batch-fetched using `in()` query
- [ ] Tag translations batch-fetched using `in()` query
- [ ] Translations stored in Maps for O(1) lookup
- [ ] Debug logging shows translation counts

---

### Task 9: Implement Main GET Handler - Part 4 (Build Response)

**Effort:** M (35 minutes)
**File:** `/src/app/api/public/items/[publicId]/route.ts`

#### 9.1 Get available translations

```typescript
    // Get list of available translation languages
    const availableTranslations = await getAvailableTranslations(item.id);
```

#### 9.2 Merge item with translation

```typescript
    // Build translated item
    const translatedItem = mergeItemWithTranslation(
      item,
      itemTranslation,
      requestedLanguage
    );
```

#### 9.3 Build translated articles with nested links

```typescript
    // Build translated articles with nested links
    const translatedArticles: TranslatedArticle[] = articlesList.map(article => {
      // Get links for this article
      const articleLinks = linksList.filter(l => l.article_id === article.id);

      // Merge each link with its translation
      const translatedLinks = articleLinks.map(link =>
        mergeLinkWithTranslation(
          link,
          linkTranslationsMap.get(link.id) || null,
          requestedLanguage
        )
      );

      // Merge article with its translation
      return mergeArticleWithTranslation(
        article,
        articleTranslationsMap.get(article.id) || null,
        requestedLanguage,
        translatedLinks
      );
    });
```

#### 9.4 Build translated tags

```typescript
    // Build translated tags
    const translatedTags: TranslatedTag[] = tagKeys.map(key =>
      mergeTagWithTranslation(
        key,
        tagTranslationsMap.get(key) || null
      )
    );
```

#### 9.5 Build translation metadata

```typescript
    // Build translation metadata
    const translationMeta: TranslationMeta = {
      requestedLanguage,
      displayLanguage: translatedItem.displayLanguage,
      sourceLanguage,
      availableTranslations,
      isShowingTranslation: translatedItem.isTranslated,
    };
```

#### 9.6 Assemble and return response

```typescript
    // Assemble final response
    const response: GuestContentResponse = {
      item: translatedItem,
      articles: translatedArticles,
      tags: translatedTags,
      translationMeta,
    };

    console.log('PUBLIC_ITEM_API: Response built', {
      itemId: item.id,
      isShowingTranslation: translationMeta.isShowingTranslation,
      articlesCount: translatedArticles.length,
      tagsCount: translatedTags.length,
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('PUBLIC_ITEM_API: Unexpected error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
```

#### Acceptance Criteria for Task 9
- [ ] Available translations fetched for metadata
- [ ] Item merged with translation
- [ ] Articles merged with translations including nested links
- [ ] Tags merged with translations
- [ ] Translation metadata accurately reflects display state
- [ ] Response matches `GuestContentResponse` type
- [ ] Cache headers set for CDN optimization
- [ ] Error handling wraps entire function

---

### Task 10: Manual Testing and Verification

**Effort:** M (30 minutes)

#### 10.1 Test with existing item (no translation)

```bash
# Test default language (English)
curl http://localhost:3000/api/public/items/{existing-public-id}

# Expected: Returns original content, isShowingTranslation: false
```

#### 10.2 Test with invalid language

```bash
# Test invalid language code
curl http://localhost:3000/api/public/items/{existing-public-id}?lang=xx

# Expected: 400 error with "Invalid language code: xx"
```

#### 10.3 Test with non-existent item

```bash
# Test non-existent item
curl http://localhost:3000/api/public/items/nonexistent-id

# Expected: 404 error with "Item not found"
```

#### 10.4 Test with valid language (fallback)

```bash
# Test requesting French when no translation exists
curl http://localhost:3000/api/public/items/{existing-public-id}?lang=fr

# Expected: Returns original content with displayLanguage matching source
```

#### 10.5 Verify response structure

Ensure the response matches this structure:

```json
{
  "item": {
    "id": "uuid",
    "publicId": "string",
    "name": "string",
    "description": "string|null",
    "sourceLanguage": "en",
    "displayLanguage": "en",
    "isTranslated": false
  },
  "articles": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string|null",
      "purpose": "string",
      "displayOrder": 0,
      "sourceLanguage": "en",
      "displayLanguage": "en",
      "isTranslated": false,
      "links": []
    }
  ],
  "tags": [
    {
      "key": "string",
      "displayValue": "string",
      "isTranslated": false
    }
  ],
  "translationMeta": {
    "requestedLanguage": "en",
    "displayLanguage": "en",
    "sourceLanguage": "en",
    "availableTranslations": [],
    "isShowingTranslation": false
  }
}
```

#### Acceptance Criteria for Task 10
- [ ] GET without lang returns English content
- [ ] GET with invalid lang returns 400
- [ ] GET with non-existent publicId returns 404
- [ ] GET with valid lang but no translation returns original content
- [ ] Response structure matches GuestContentResponse type
- [ ] Cache-Control header present in response
- [ ] Content-Type is application/json

---

## Complete Implementation File

The complete file structure after all tasks:

```
/src/app/api/public/items/[publicId]/
└── route.ts  (~250-300 lines)
```

---

## Dependencies Summary

### Uses (Imports From)
| Module | Import | Purpose |
|--------|--------|---------|
| `next/server` | `NextRequest`, `NextResponse` | HTTP handling |
| `@/lib/supabase` | `supabaseAdmin` | Database access |
| `@/lib/i18n/config` | `isSupportedLocale`, `SupportedLocale`, `defaultLocale` | Language validation |

### Used By (Downstream)
| Consumer | Purpose |
|----------|---------|
| `/src/app/item/[publicId]/page.tsx` | Server component fetches translated content |
| `ItemDisplay.tsx` | Client component renders translated content |
| Guest language components | Use `translationMeta` for UI decisions |

---

## Estimated Total Effort

| Task | Effort | Time Estimate |
|------|--------|---------------|
| Task 1: Directory Structure | XS | 15 min |
| Task 2: Type Definitions | S | 30 min |
| Task 3: Language Validation | XS | 15 min |
| Task 4: Available Translations | S | 20 min |
| Task 5: Merge Functions | M | 45 min |
| Task 6: GET Handler Part 1 | S | 20 min |
| Task 7: GET Handler Part 2 | M | 30 min |
| Task 8: GET Handler Part 3 | M | 40 min |
| Task 9: GET Handler Part 4 | M | 35 min |
| Task 10: Testing | M | 30 min |
| **Total** | **M** | **~4.5 hours** |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| REQ-E04-004 not complete | Inline helper functions provided; can refactor later |
| Translation tables empty | Graceful fallback to original content |
| Performance with many articles/links | Batch queries using `in()` operator |
| TypeScript type mismatches | All types explicitly defined in file |

---

## Console Logging Summary

All console logs follow the `PUBLIC_ITEM_API:` prefix pattern:

```
PUBLIC_ITEM_API: Request received { publicId, lang }
PUBLIC_ITEM_API: Validated params { publicId, requestedLanguage }
PUBLIC_ITEM_API: Item not found { publicId, error }
PUBLIC_ITEM_API: Item found { itemId, sourceLanguage }
PUBLIC_ITEM_API: Error fetching articles { error }
PUBLIC_ITEM_API: Error fetching links { error }
PUBLIC_ITEM_API: Translation check { sourceLanguage, requestedLanguage, needsTranslation }
PUBLIC_ITEM_API: Translations fetched { counts }
PUBLIC_ITEM_API: Error fetching available translations { error }
PUBLIC_ITEM_API: Response built { itemId, isShowingTranslation, counts }
PUBLIC_ITEM_API: Unexpected error { error }
```

---

## References

- **Overview Document:** `/docs/REQ-E04-005-create-public-item-api-endpoint-with-translation-overview.md`
- **Request:** `/docs/gen_requests_epic4.md` (REQ-E04-005)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 2.2)
- **Existing Item API Pattern:** `/src/app/api/items/[publicId]/route.ts`
- **Language Config:** `/src/lib/i18n/config.ts`
- **Database Types:** `/src/lib/supabase.ts`

---

*Detailed task breakdown generated for FAQBNB Localization Epic 4 - Guest Experience*
