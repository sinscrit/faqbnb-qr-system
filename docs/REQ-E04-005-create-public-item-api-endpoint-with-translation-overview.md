# Implementation Overview: REQ-E04-005 - Create Public Item API Endpoint with Translation Support

**Document Created:** 2026-01-19 22:30:00 UTC
**Last Modified:** 2026-01-19 22:30:00 UTC
**Request ID:** REQ-E04-005
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.2
**Size:** M (Medium)

---

## Summary

Create a public API endpoint that returns item details with all related content translated into the guest's requested language. This endpoint accepts a public item ID in the URL path and an optional language query parameter, merges original content with translations, and returns a `GuestContentResponse` format with translation metadata.

---

## Current State Analysis

### What Exists

| Component | Status | Location |
|-----------|--------|----------|
| Existing item API route | EXISTS | `/src/app/api/items/[publicId]/route.ts` |
| Supabase client (browser + admin) | EXISTS | `/src/lib/supabase.ts` |
| Translation tables | EXISTS | `item_translations`, `article_translations`, `link_translations`, `tag_translations` |
| Language configuration | EXISTS | `/src/lib/i18n/config.ts` |
| Language detection utilities | EXISTS | `/src/lib/i18n/language-detection.ts` |
| Item page (server component) | EXISTS | `/src/app/item/[publicId]/page.tsx` |
| ItemDisplay component | EXISTS | `/src/components/ItemDisplay.tsx` |
| L10N types | EXISTS | `/src/contexts/LocaleContext.tsx` exports `SupportedLanguage` |
| Translation fetch utilities | PENDING | `/src/lib/translations/fetch-translations.ts` (Task 2.1 - REQ-E04-004) |
| **Public items API with translation** | **MISSING** | **To be created** |

### Existing API Pattern Reference

From `/src/app/api/items/[publicId]/route.ts`:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    // ... fetch item, articles, links
    return NextResponse.json({
      success: true,
      data: itemWithLinks,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database Schema Available

**Source tables with `source_language`:**
- `items` - `id`, `public_id`, `name`, `description`, `source_language`, `tags`
- `item_articles` - `id`, `item_id`, `title`, `description`, `source_language`, `purpose`, `display_order`
- `item_links` - `id`, `item_id`, `article_id`, `title`, `url`, `source_language`, `display_order`

**Translation tables:**
- `item_translations` - `item_id`, `language`, `name`, `description`, `translation_status`
- `article_translations` - `article_id`, `language`, `title`, `description`, `translation_status`
- `link_translations` - `link_id`, `language`, `title`, `translation_status`
- `tag_translations` - `tag_key`, `language`, `translated_value`

---

## Implementation Requirements

### Endpoint Specification

**Route:** `GET /api/public/items/[publicId]`

**Query Parameters:**
- `lang` (optional) - Target language code. Valid: `en`, `fr`, `es`, `de`, `nl`, `it`. Defaults to `en`.

**Response Format:** `GuestContentResponse` (defined in Implementation Plan)

### Response Type Definition

Based on the implementation plan, the response should match:

```typescript
interface GuestContentResponse {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  tags: TranslatedTag[];
  translationMeta: {
    requestedLanguage: SupportedLanguage;
    displayLanguage: SupportedLanguage;
    sourceLanguage: SupportedLanguage;
    availableTranslations: SupportedLanguage[];
    isShowingTranslation: boolean;
  };
}

interface TranslatedItem {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  sourceLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  isTranslated: boolean;
  translationStatus?: 'completed' | 'pending' | 'failed';
  originalName?: string;
  originalDescription?: string | null;
}

interface TranslatedArticle {
  id: string;
  title: string;
  description: string | null;
  purpose: string;
  displayOrder: number;
  sourceLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  isTranslated: boolean;
  originalTitle?: string;
  originalDescription?: string | null;
  links: TranslatedLink[];
}

interface TranslatedLink {
  id: string;
  title: string;
  url: string;
  linkType: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  sourceLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  isTranslated: boolean;
  originalTitle?: string;
}

interface TranslatedTag {
  key: string;
  displayValue: string;
  isTranslated: boolean;
}
```

---

## Technical Approach

### 1. Directory Structure

```
/src/app/api/public/items/[publicId]/
├── route.ts          # Main endpoint (this task)
└── languages/
    └── route.ts      # Language availability endpoint (Task 2.3)
```

### 2. Endpoint Logic Flow

```
Request: GET /api/public/items/abc123?lang=fr
                    │
                    ▼
        ┌─────────────────────────────┐
        │  1. Parse & Validate Input  │
        │  - Extract publicId         │
        │  - Get lang param (or 'en') │
        │  - Validate language code   │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │  2. Fetch Item (original)   │
        │  - Query items by public_id │
        │  - Return 404 if not found  │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │  3. Fetch Articles & Links  │
        │  - Get all articles for item│
        │  - Get all links per article│
        │  - Extract tag keys from    │
        │    item.tags array          │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │  4. Fetch Translations      │
        │  (if lang != source_lang)   │
        │  - fetchItemTranslations()  │
        │  - fetchArticleTranslations │
        │  - fetchLinkTranslations()  │
        │  - fetchTagTranslations()   │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │  5. Merge & Build Response  │
        │  - Apply translations       │
        │  - Preserve original fields │
        │  - Build translationMeta    │
        │  - Get available languages  │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │  6. Return GuestContent     │
        │  - Set cache headers        │
        │  - Return JSON response     │
        └─────────────────────────────┘
```

### 3. Language Validation

```typescript
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';

function validateLanguageParam(lang: string | null): SupportedLocale {
  if (!lang) {
    return 'en'; // Default to English
  }

  if (!isSupportedLocale(lang)) {
    throw new Error(`Invalid language code: ${lang}`);
  }

  return lang;
}
```

### 4. Fetching Available Translations

To populate `translationMeta.availableTranslations`, query each translation table to see which languages have completed translations:

```typescript
async function getAvailableTranslations(itemId: string): Promise<SupportedLocale[]> {
  const { data: itemTranslations } = await supabaseAdmin
    .from('item_translations')
    .select('language')
    .eq('item_id', itemId)
    .eq('translation_status', 'completed');

  // Return unique languages that have completed translations
  const languages = new Set<SupportedLocale>(
    (itemTranslations || []).map(t => t.language as SupportedLocale)
  );

  return Array.from(languages);
}
```

### 5. Merging Pattern

```typescript
function mergeItemWithTranslation(
  item: ItemRow,
  translation: ItemTranslation | null,
  requestedLanguage: SupportedLocale
): TranslatedItem {
  const isTranslated = !!translation && translation.translationStatus === 'completed';

  return {
    id: item.id,
    publicId: item.public_id,
    name: isTranslated ? translation.name : item.name,
    description: isTranslated ? translation.description : item.description,
    sourceLanguage: (item.source_language || 'en') as SupportedLocale,
    displayLanguage: isTranslated ? requestedLanguage : (item.source_language || 'en') as SupportedLocale,
    isTranslated,
    translationStatus: translation?.translationStatus,
    originalName: isTranslated ? item.name : undefined,
    originalDescription: isTranslated ? item.description : undefined,
  };
}
```

### 6. HTTP Response Headers

Set appropriate cache headers for public content:

```typescript
return NextResponse.json(response, {
  headers: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'Content-Type': 'application/json',
  },
});
```

---

## Dependencies

### Required from Prior Tasks

| Dependency | Source Task | Expected Location |
|------------|-------------|-------------------|
| Translation fetch utilities | REQ-E04-004 (Task 2.1) | `/src/lib/translations/fetch-translations.ts` |
| L10N types export | REQ-E04-001 (Task 1.1) | `/src/types/l10n.ts` or `/src/contexts/LocaleContext.tsx` |
| Language validation | Epic 1 Foundation | `/src/lib/i18n/config.ts` |

### Required Imports

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
import {
  fetchItemTranslations,
  fetchArticleTranslations,
  fetchLinkTranslations,
  fetchTagTranslations,
} from '@/lib/translations/fetch-translations';
```

### Used By Downstream Tasks

- `/src/app/item/[publicId]/page.tsx` (Task 5.1) - Will call this API for translated content
- `ItemDisplay.tsx` (Task 5.2) - Will consume `GuestContentResponse`
- Guest language components (Phase 3) - Will use `translationMeta`

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/public/items/[publicId]/route.ts` | Main public item API endpoint with translation support |

### New Functions to Create

| Function | File | Description |
|----------|------|-------------|
| `GET` | `route.ts` | Main endpoint handler |
| `validateLanguageParam` | `route.ts` | (internal) Validate and default language param |
| `getAvailableTranslations` | `route.ts` | (internal) Query available translation languages |
| `mergeItemWithTranslation` | `route.ts` | (internal) Merge item with translation data |
| `mergeArticleWithTranslation` | `route.ts` | (internal) Merge article with translation data |
| `mergeLinkWithTranslation` | `route.ts` | (internal) Merge link with translation data |
| `mergeTagWithTranslation` | `route.ts` | (internal) Merge tag with translation data |
| `buildGuestContentResponse` | `route.ts` | (internal) Assemble full response object |

### Types to Define (in route.ts or separate types file)

| Type | Description |
|------|-------------|
| `GuestContentResponse` | Full API response structure |
| `TranslatedItem` | Item with translation fields |
| `TranslatedArticle` | Article with translation fields |
| `TranslatedLink` | Link with translation fields |
| `TranslatedTag` | Tag with translation fields |
| `TranslationMeta` | Translation metadata object |

### Files NOT to Modify

- `/src/app/api/items/[publicId]/route.ts` - Existing endpoint for authenticated users
- `/src/lib/supabase.ts` - Database types already defined
- `/src/lib/i18n/config.ts` - Language config already exists
- `/src/lib/translations/fetch-translations.ts` - Created in prior task

---

## Error Handling

### HTTP Status Codes

| Status | Condition | Response Body |
|--------|-----------|---------------|
| 200 | Success | `GuestContentResponse` |
| 400 | Invalid language code | `{ success: false, error: "Invalid language code: xx" }` |
| 404 | Item not found | `{ success: false, error: "Item not found" }` |
| 500 | Database or server error | `{ success: false, error: "Internal server error" }` |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
}
```

---

## Acceptance Criteria Verification

| PRD Criteria | Implementation |
|--------------|----------------|
| GET endpoint exists at public items path with publicId parameter | `GET /api/public/items/[publicId]` |
| Accepts language query parameter | `?lang=` query parameter |
| Defaults to English when no language provided | `validateLanguageParam()` returns 'en' |
| Validates requested language is supported | `isSupportedLocale()` check |
| Returns 404 when item not found | Check item fetch result |
| Returns 400 for invalid language code | Validate before processing |
| Response includes complete item with articles, links, tags | `GuestContentResponse` structure |
| Original content merged with translations | `mergeXxxWithTranslation()` functions |
| Translation metadata included | `translationMeta` object |
| Fallback to original when translation missing | Merge logic preserves original |
| Response matches GuestContentResponse type | Type-checked response |
| Handles database errors gracefully | try/catch with error response |
| Proper HTTP headers for caching and content type | Cache-Control headers |
| Does not require authentication | No auth check in handler |

---

## Implementation Pseudocode

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const { searchParams } = new URL(request.url);
    const langParam = searchParams.get('lang');

    // 1. Validate language
    let requestedLanguage: SupportedLocale;
    try {
      requestedLanguage = validateLanguageParam(langParam);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 400 }
      );
    }

    // 2. Fetch item
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // 3. Fetch articles and links
    const { data: articles } = await supabaseAdmin
      .from('item_articles')
      .select('*')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });

    const articleIds = (articles || []).map(a => a.id);
    const linksData = await fetchLinksForArticles(item.id, articleIds);
    const tagKeys = item.tags || [];

    // 4. Fetch translations (if needed)
    const sourceLanguage = (item.source_language || 'en') as SupportedLocale;
    const needsTranslation = requestedLanguage !== sourceLanguage;

    let itemTranslation = null;
    let articleTranslationsMap = new Map();
    let linkTranslationsMap = new Map();
    let tagTranslationsMap = new Map();

    if (needsTranslation) {
      const itemTransResult = await fetchItemTranslations(item.id, requestedLanguage);
      itemTranslation = itemTransResult.data;

      if (articleIds.length > 0) {
        const artTransResult = await fetchArticleTranslations(articleIds, requestedLanguage);
        articleTranslationsMap = artTransResult.data || new Map();
      }

      const linkIds = linksData.map(l => l.id);
      if (linkIds.length > 0) {
        const linkTransResult = await fetchLinkTranslations(linkIds, requestedLanguage);
        linkTranslationsMap = linkTransResult.data || new Map();
      }

      if (tagKeys.length > 0) {
        const tagTransResult = await fetchTagTranslations(tagKeys, requestedLanguage);
        tagTranslationsMap = tagTransResult.data || new Map();
      }
    }

    // 5. Get available translations
    const availableTranslations = await getAvailableTranslations(item.id);

    // 6. Build response
    const translatedItem = mergeItemWithTranslation(item, itemTranslation, requestedLanguage);
    const translatedArticles = buildTranslatedArticles(
      articles || [],
      linksData,
      articleTranslationsMap,
      linkTranslationsMap,
      requestedLanguage
    );
    const translatedTags = buildTranslatedTags(tagKeys, tagTranslationsMap, requestedLanguage);

    const response: GuestContentResponse = {
      item: translatedItem,
      articles: translatedArticles,
      tags: translatedTags,
      translationMeta: {
        requestedLanguage,
        displayLanguage: translatedItem.displayLanguage,
        sourceLanguage,
        availableTranslations,
        isShowingTranslation: translatedItem.isTranslated,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('PUBLIC_ITEM_API: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Testing Considerations

### Test Scenarios

1. **Happy Path - With Translation**
   - Request: `GET /api/public/items/abc123?lang=fr`
   - Item exists, French translation exists and completed
   - Expected: Returns translated content, `isShowingTranslation: true`

2. **Happy Path - No Translation Needed**
   - Request: `GET /api/public/items/abc123?lang=en`
   - Item's `source_language` is `en`
   - Expected: Returns original content, `isShowingTranslation: false`

3. **Fallback - Translation Missing**
   - Request: `GET /api/public/items/abc123?lang=de`
   - Item exists, no German translation
   - Expected: Returns original content with `displayLanguage: 'en'`

4. **Default Language**
   - Request: `GET /api/public/items/abc123` (no lang param)
   - Expected: Uses English as default

5. **Invalid Language Code**
   - Request: `GET /api/public/items/abc123?lang=xx`
   - Expected: 400 error with message

6. **Item Not Found**
   - Request: `GET /api/public/items/nonexistent`
   - Expected: 404 error

7. **Partial Translations**
   - Item has French translation, some articles don't
   - Expected: Item shows French, untranslated articles show original

8. **Tag Translations**
   - Item has tags `["kitchen", "appliance"]`
   - Expected: `tags` array includes translated values where available

### Performance Validation

- Full endpoint response: < 200ms
- Cache headers properly set for CDN caching

---

## Console Logging Convention

Follow existing codebase patterns:

```typescript
console.log('PUBLIC_ITEM_API: Fetching item', { publicId, language: requestedLanguage });
console.log('PUBLIC_ITEM_API: Item found', { itemId: item.id, sourceLanguage });
console.log('PUBLIC_ITEM_API: Translations fetched', { hasItemTranslation: !!itemTranslation });
console.error('PUBLIC_ITEM_API: Database error', error);
console.error('PUBLIC_ITEM_API: Exception', error);
```

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 2.2)
- **Request:** `/docs/gen_requests_epic4.md` (REQ-E04-005)
- **Dependent Task:** `/docs/REQ-E04-004-create-translation-fetch-utilities-overview.md`
- **Existing Item API:** `/src/app/api/items/[publicId]/route.ts`
- **Language Config:** `/src/lib/i18n/config.ts`
- **Database Types:** Supabase MCP - translation tables schema

---

*Implementation overview generated for FAQBNB Localization Epic 4 - Guest Experience*
