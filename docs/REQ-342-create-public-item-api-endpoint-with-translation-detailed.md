# REQ-342: Create Public Item API Endpoint with Translation Support - Detailed Task Breakdown

**Generated:** 2026-01-19 12:30:00 UTC
**Last Modified:** 2026-01-19 12:30:00 UTC
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.2
**Parent Document:** [REQ-342-create-public-item-api-endpoint-with-translation-overview.md](./REQ-342-create-public-item-api-endpoint-with-translation-overview.md)

---

## Summary

Create a new public API endpoint at `/api/public/items/[publicId]/route.ts` that returns item details with translated content merged based on the guest's language preference. This endpoint enables guest-facing pages to dynamically fetch localized item data through a REST API, supporting client-side language switching without full page reloads.

---

## Prerequisites

Before implementing this task, ensure the following are in place:

| Dependency | Location | Status |
|------------|----------|--------|
| Translation tables exist | `item_translations`, `article_translations`, `link_translations`, `tag_translations` | Required (from Epic 1) |
| i18n config module | `/src/lib/i18n/config.ts` | Required (from REQ-230) |
| `isSupportedLocale()` function | `/src/lib/i18n/config.ts` | Required |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Required |
| Supabase client | `/src/lib/supabase.ts` | Required |

---

## Task Breakdown

### Task 1: Create Directory Structure and API Route File

**File:** `/src/app/api/public/items/[publicId]/route.ts`

**Objective:** Set up the new API endpoint file with proper imports and GET handler skeleton.

**Steps:**
1. Create the directory structure `/src/app/api/public/items/[publicId]/` if it doesn't exist
2. Create `route.ts` with the following initial structure:

```typescript
/**
 * Public Item API Endpoint with Translation Support
 *
 * GET /api/public/items/[publicId]?lang=<language_code>
 *
 * Returns item details with translated content merged based on guest's
 * language preference. Supports client-side language switching for
 * guest-facing pages.
 *
 * REQ-342: Create Public Item API Endpoint with Translation Support
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 2, Task 2.2
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  isSupportedLocale,
  DEFAULT_LOCALE,
  type SupportedLocale
} from '@/lib/i18n/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  // Implementation follows in subsequent tasks
}
```

**Acceptance Criteria:**
- [ ] Directory structure exists at `/src/app/api/public/items/[publicId]/`
- [ ] `route.ts` file is created with proper imports
- [ ] File header includes JSDoc documentation with REQ reference
- [ ] TypeScript compiles without errors

---

### Task 2: Implement Request Parameter Parsing and Validation

**Objective:** Extract and validate `publicId` and `lang` parameters from the request.

**Steps:**
1. Extract `publicId` from URL params using `await params`
2. Extract `lang` from query parameters using `request.nextUrl.searchParams`
3. Validate `publicId` is present (not empty/null)
4. Validate `lang` using `isSupportedLocale()` if provided
5. Return 400 error for missing `publicId` or invalid `lang`

**Implementation:**

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    // Validate publicId
    if (!publicId || publicId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Public ID is required',
          code: 'MISSING_PUBLIC_ID'
        },
        { status: 400 }
      );
    }

    // Extract and validate language parameter
    const searchParams = request.nextUrl.searchParams;
    const langParam = searchParams.get('lang');

    let requestedLanguage: SupportedLocale | null = null;

    if (langParam) {
      if (!isSupportedLocale(langParam)) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported language code: '${langParam}'. Supported languages: en, fr, es, de, nl, it`,
            code: 'INVALID_LANGUAGE'
          },
          { status: 400 }
        );
      }
      requestedLanguage = langParam;
    }

    // Continue to item fetching...
  } catch (error) {
    // Error handling...
  }
}
```

**Acceptance Criteria:**
- [ ] `publicId` is extracted from URL params correctly
- [ ] `lang` query parameter is extracted from searchParams
- [ ] Missing `publicId` returns 400 with `MISSING_PUBLIC_ID` code
- [ ] Invalid language codes return 400 with `INVALID_LANGUAGE` code
- [ ] Error messages do not expose internal details
- [ ] Valid language codes pass validation via `isSupportedLocale()`

---

### Task 3: Implement Base Item Fetching

**Objective:** Fetch the base item data from the `items` table using `public_id`.

**Steps:**
1. Query `items` table with filter on `public_id`
2. Return 404 if item not found
3. Extract `source_language` from item record
4. Handle database errors with 500 response

**Implementation:**

```typescript
// Fetch base item from database
const { data: item, error: itemError } = await supabase
  .from('items')
  .select(`
    id,
    public_id,
    name,
    description,
    source_language,
    tags,
    created_at,
    updated_at
  `)
  .eq('public_id', publicId)
  .single();

if (itemError || !item) {
  if (itemError?.code === 'PGRST116') {
    // No rows returned
    return NextResponse.json(
      {
        success: false,
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      },
      { status: 404 }
    );
  }

  console.error('Error fetching item:', itemError);
  return NextResponse.json(
    {
      success: false,
      error: 'Error retrieving item data',
      code: 'DATABASE_ERROR'
    },
    { status: 500 }
  );
}

// Determine source language (default to 'en' if not set)
const sourceLanguage: SupportedLocale = (item.source_language as SupportedLocale) || DEFAULT_LOCALE;
```

**Acceptance Criteria:**
- [ ] Item is fetched using `public_id` filter
- [ ] Returns 404 with `ITEM_NOT_FOUND` code when item doesn't exist
- [ ] Returns 500 with generic message for database errors
- [ ] `source_language` is extracted from item or defaults to 'en'
- [ ] Query selects only necessary fields

---

### Task 4: Implement Item Translation Fetching

**Objective:** Fetch translation data from `item_translations` for the requested language.

**Steps:**
1. Only fetch translation if `requestedLanguage` is provided and differs from `sourceLanguage`
2. Query `item_translations` with `item_id` and `language` filters
3. Only include translations with `translation_status = 'completed'`
4. Handle case when no translation exists (return null/undefined)

**Implementation:**

```typescript
// Fetch item translation if language is requested and different from source
let itemTranslation: {
  name: string;
  description: string | null;
  translation_status: string;
} | null = null;

const shouldFetchTranslation = requestedLanguage && requestedLanguage !== sourceLanguage;

if (shouldFetchTranslation) {
  const { data: translation, error: translationError } = await supabase
    .from('item_translations')
    .select('name, description, translation_status')
    .eq('item_id', item.id)
    .eq('language', requestedLanguage)
    .eq('translation_status', 'completed')
    .maybeSingle();

  if (translationError) {
    console.error('Error fetching item translation:', translationError);
    // Don't fail - continue without translation
  } else {
    itemTranslation = translation;
  }
}
```

**Acceptance Criteria:**
- [ ] Translation is only fetched when `lang` differs from source language
- [ ] Query filters on `item_id`, `language`, and `translation_status = 'completed'`
- [ ] Translation errors are logged but don't fail the request
- [ ] Null/undefined handled when no translation exists
- [ ] Uses `maybeSingle()` to handle zero or one result

---

### Task 5: Implement Articles and Links Fetching with Translations

**Objective:** Fetch articles and their nested links with translation data.

**Steps:**
1. Fetch `item_articles` for the item, ordered by `display_order`
2. Fetch `item_links` for the item, including those associated with articles
3. Fetch article translations from `article_translations` if language requested
4. Fetch link translations from `link_translations` if language requested
5. Build nested structure with articles containing their links

**Implementation:**

```typescript
// Fetch articles for this item
const { data: articles, error: articlesError } = await supabase
  .from('item_articles')
  .select('id, purpose, title, description, display_order, source_language')
  .eq('item_id', item.id)
  .order('display_order', { ascending: true });

if (articlesError) {
  console.error('Error fetching articles:', articlesError);
  // Don't fail - continue without articles
}

// Fetch all links for this item (both article-attached and standalone)
const { data: links, error: linksError } = await supabase
  .from('item_links')
  .select('id, article_id, title, link_type, url, thumbnail_url, display_order, source_language')
  .eq('item_id', item.id)
  .order('display_order', { ascending: true });

if (linksError) {
  console.error('Error fetching links:', linksError);
  // Don't fail - continue without links
}

// Fetch translations if needed
let articleTranslationsMap = new Map<string, { title: string; description: string | null }>();
let linkTranslationsMap = new Map<string, { title: string }>();

if (shouldFetchTranslation && articles && articles.length > 0) {
  const articleIds = articles.map(a => a.id);

  const { data: articleTranslations } = await supabase
    .from('article_translations')
    .select('article_id, title, description')
    .in('article_id', articleIds)
    .eq('language', requestedLanguage!)
    .eq('translation_status', 'completed');

  if (articleTranslations) {
    articleTranslations.forEach(t => {
      articleTranslationsMap.set(t.article_id, { title: t.title, description: t.description });
    });
  }
}

if (shouldFetchTranslation && links && links.length > 0) {
  const linkIds = links.map(l => l.id);

  const { data: linkTranslations } = await supabase
    .from('link_translations')
    .select('link_id, title')
    .in('link_id', linkIds)
    .eq('language', requestedLanguage!)
    .eq('translation_status', 'completed');

  if (linkTranslations) {
    linkTranslations.forEach(t => {
      linkTranslationsMap.set(t.link_id, { title: t.title });
    });
  }
}
```

**Acceptance Criteria:**
- [ ] Articles are fetched ordered by `display_order`
- [ ] Links are fetched for the entire item
- [ ] Article translations fetched only for completed status
- [ ] Link translations fetched only for completed status
- [ ] Translation maps are built for efficient lookup
- [ ] Errors don't fail the request (graceful degradation)

---

### Task 6: Implement Content Merging Logic

**Objective:** Merge original content with translations, preserving original content for "View Original" functionality.

**Steps:**
1. Create merged item object with translated fields overriding originals
2. Preserve original content in separate fields (`originalName`, `originalDescription`)
3. Merge article content with translations
4. Merge link content with translations
5. Build articles array with nested links

**Implementation:**

```typescript
// Helper function to determine if content is translated
const isItemTranslated = itemTranslation !== null;

// Build merged item content
const mergedItem = {
  id: item.id,
  publicId: item.public_id,
  name: itemTranslation?.name || item.name,
  description: itemTranslation?.description ?? item.description,
  displayLanguage: isItemTranslated ? requestedLanguage! : sourceLanguage,
  sourceLanguage: sourceLanguage,
  isTranslated: isItemTranslated,
  translationStatus: isItemTranslated ? 'completed' : undefined,
  // Original content for "View Original" toggle
  originalName: isItemTranslated ? item.name : undefined,
  originalDescription: isItemTranslated ? item.description : undefined,
  tags: item.tags || [],
  createdAt: item.created_at,
  updatedAt: item.updated_at,
};

// Build articles with nested links and translations
const articlesWithLinks = (articles || []).map(article => {
  const articleTranslation = articleTranslationsMap.get(article.id);
  const isArticleTranslated = articleTranslation !== undefined;

  // Get links belonging to this article
  const articleLinks = (links || [])
    .filter(link => link.article_id === article.id)
    .map(link => {
      const linkTranslation = linkTranslationsMap.get(link.id);
      const isLinkTranslated = linkTranslation !== undefined;

      return {
        id: link.id,
        title: linkTranslation?.title || link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url,
        displayOrder: link.display_order || 0,
        isTranslated: isLinkTranslated,
        originalTitle: isLinkTranslated ? link.title : undefined,
      };
    });

  return {
    id: article.id,
    purpose: article.purpose,
    title: articleTranslation?.title || article.title,
    description: articleTranslation?.description ?? article.description,
    displayOrder: article.display_order || 0,
    isTranslated: isArticleTranslated,
    originalTitle: isArticleTranslated ? article.title : undefined,
    originalDescription: isArticleTranslated ? article.description : undefined,
    links: articleLinks,
  };
});

// Get standalone links (not attached to any article)
const standaloneLinks = (links || [])
  .filter(link => !link.article_id)
  .map(link => {
    const linkTranslation = linkTranslationsMap.get(link.id);
    const isLinkTranslated = linkTranslation !== undefined;

    return {
      id: link.id,
      title: linkTranslation?.title || link.title,
      linkType: link.link_type,
      url: link.url,
      thumbnailUrl: link.thumbnail_url,
      displayOrder: link.display_order || 0,
      isTranslated: isLinkTranslated,
      originalTitle: isLinkTranslated ? link.title : undefined,
    };
  });
```

**Acceptance Criteria:**
- [ ] Translated fields override original fields when translation exists
- [ ] Original content preserved in `original*` fields for toggle
- [ ] `isTranslated` flag correctly indicates translation status
- [ ] Links are nested within their parent articles
- [ ] Standalone links (no article) are handled separately
- [ ] Null/undefined descriptions handled correctly

---

### Task 7: Build Available Translations List

**Objective:** Determine which languages have completed translations for this item.

**Steps:**
1. Query `item_translations` for all completed translations of this item
2. Extract unique language codes
3. Include source language in available list
4. Sort for consistent ordering

**Implementation:**

```typescript
// Fetch available translations for this item
const { data: availableTranslationsData } = await supabase
  .from('item_translations')
  .select('language')
  .eq('item_id', item.id)
  .eq('translation_status', 'completed');

const availableTranslations: SupportedLocale[] = [
  sourceLanguage,
  ...(availableTranslationsData || [])
    .map(t => t.language as SupportedLocale)
    .filter(lang => lang !== sourceLanguage)
].sort();
```

**Acceptance Criteria:**
- [ ] All completed translations are queried
- [ ] Source language always included in list
- [ ] No duplicate languages in list
- [ ] Languages sorted for consistent ordering
- [ ] Type-safe `SupportedLocale` array returned

---

### Task 8: Build GuestContentResponse

**Objective:** Construct the final response object with all content and metadata.

**Steps:**
1. Build `translationMeta` object with all metadata fields
2. Assemble complete `GuestContentResponse` structure
3. Determine `displayLanguage` based on actual content shown
4. Set `isShowingTranslation` flag correctly

**Implementation:**

```typescript
// Determine what language is actually being displayed
const displayLanguage: SupportedLocale = isItemTranslated
  ? requestedLanguage!
  : sourceLanguage;

const isShowingTranslation = displayLanguage !== sourceLanguage;

// Build the complete response
const response = {
  success: true,
  data: {
    item: mergedItem,
    articles: articlesWithLinks,
    links: standaloneLinks,
    tags: (item.tags || []).map((tag: string) => ({
      key: tag,
      displayValue: tag, // Tag translations handled separately
      isTranslated: false,
    })),
    translationMeta: {
      requestedLanguage: requestedLanguage || sourceLanguage,
      displayLanguage: displayLanguage,
      sourceLanguage: sourceLanguage,
      availableTranslations: availableTranslations,
      isShowingTranslation: isShowingTranslation,
    },
  },
};
```

**Acceptance Criteria:**
- [ ] Response follows `GuestContentResponse` format
- [ ] `translationMeta` includes all required fields
- [ ] `requestedLanguage` reflects the `lang` parameter (or source if not specified)
- [ ] `displayLanguage` reflects what's actually shown
- [ ] `isShowingTranslation` is true only when translated content is displayed
- [ ] `availableTranslations` includes all languages with completed translations

---

### Task 9: Add CORS Headers and Return Response

**Objective:** Add appropriate CORS headers for client-side access and return the JSON response.

**Steps:**
1. Define CORS headers for cross-origin requests
2. Create response with headers attached
3. Include OPTIONS handler for preflight requests

**Implementation:**

```typescript
// CORS headers for public API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight
};

// Return successful response with CORS headers
return NextResponse.json(response, {
  status: 200,
  headers: corsHeaders,
});
```

**Add OPTIONS handler for preflight:**

```typescript
/**
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

**Acceptance Criteria:**
- [ ] CORS headers allow cross-origin access
- [ ] OPTIONS handler returns 204 for preflight requests
- [ ] `Access-Control-Max-Age` set for caching preflight results
- [ ] Response status is 200 for successful requests

---

### Task 10: Implement Comprehensive Error Handling

**Objective:** Handle all error scenarios with appropriate status codes and messages.

**Steps:**
1. Wrap entire handler in try-catch
2. Return 400 for validation errors (missing/invalid parameters)
3. Return 404 for item not found
4. Return 500 for unexpected server errors
5. Log errors without exposing details to client

**Implementation:**

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // All implementation from previous tasks...

  } catch (error) {
    // Log full error for debugging
    console.error('Public item API error:', error);

    // Return generic error to client
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while processing your request',
        code: 'INTERNAL_ERROR'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
        }
      }
    );
  }
}
```

**Error Response Summary:**

| Scenario | Status | Error Code | Message |
|----------|--------|------------|---------|
| Missing publicId | 400 | `MISSING_PUBLIC_ID` | "Public ID is required" |
| Invalid language | 400 | `INVALID_LANGUAGE` | "Unsupported language code: 'xx'..." |
| Item not found | 404 | `ITEM_NOT_FOUND` | "Item not found" |
| Database error | 500 | `DATABASE_ERROR` | "Error retrieving item data" |
| Unexpected error | 500 | `INTERNAL_ERROR` | "An unexpected error occurred..." |

**Acceptance Criteria:**
- [ ] All errors return proper status codes
- [ ] Error responses include `code` for programmatic handling
- [ ] Internal details never exposed to client
- [ ] Errors are logged server-side for debugging
- [ ] CORS headers included in error responses

---

## Complete Implementation

Below is the complete implementation incorporating all tasks:

```typescript
/**
 * Public Item API Endpoint with Translation Support
 *
 * GET /api/public/items/[publicId]?lang=<language_code>
 *
 * Returns item details with translated content merged based on guest's
 * language preference. Supports client-side language switching for
 * guest-facing pages.
 *
 * REQ-342: Create Public Item API Endpoint with Translation Support
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 2, Task 2.2
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  isSupportedLocale,
  DEFAULT_LOCALE,
  type SupportedLocale
} from '@/lib/i18n/config';

// CORS headers for public API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * GET /api/public/items/[publicId]
 *
 * Fetch item with translated content for guest viewing.
 *
 * @param request - NextRequest object
 * @param params - URL parameters containing publicId
 * @returns GuestContentResponse with merged translated content
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    // Task 2: Validate publicId
    if (!publicId || publicId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Public ID is required',
          code: 'MISSING_PUBLIC_ID'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Task 2: Extract and validate language parameter
    const searchParams = request.nextUrl.searchParams;
    const langParam = searchParams.get('lang');

    let requestedLanguage: SupportedLocale | null = null;

    if (langParam) {
      if (!isSupportedLocale(langParam)) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported language code: '${langParam}'. Supported languages: en, fr, es, de, nl, it`,
            code: 'INVALID_LANGUAGE'
          },
          { status: 400, headers: corsHeaders }
        );
      }
      requestedLanguage = langParam;
    }

    // Task 3: Fetch base item from database
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select(`
        id,
        public_id,
        name,
        description,
        source_language,
        tags,
        created_at,
        updated_at
      `)
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      if (itemError?.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Item not found',
            code: 'ITEM_NOT_FOUND'
          },
          { status: 404, headers: corsHeaders }
        );
      }

      console.error('Error fetching item:', itemError);
      return NextResponse.json(
        {
          success: false,
          error: 'Error retrieving item data',
          code: 'DATABASE_ERROR'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Determine source language
    const sourceLanguage: SupportedLocale =
      (item.source_language as SupportedLocale) || DEFAULT_LOCALE;

    const shouldFetchTranslation = requestedLanguage && requestedLanguage !== sourceLanguage;

    // Task 4: Fetch item translation if needed
    let itemTranslation: {
      name: string;
      description: string | null;
      translation_status: string;
    } | null = null;

    if (shouldFetchTranslation) {
      const { data: translation, error: translationError } = await supabase
        .from('item_translations')
        .select('name, description, translation_status')
        .eq('item_id', item.id)
        .eq('language', requestedLanguage!)
        .eq('translation_status', 'completed')
        .maybeSingle();

      if (translationError) {
        console.error('Error fetching item translation:', translationError);
      } else {
        itemTranslation = translation;
      }
    }

    // Task 5: Fetch articles for this item
    const { data: articles, error: articlesError } = await supabase
      .from('item_articles')
      .select('id, purpose, title, description, display_order, source_language')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
    }

    // Fetch all links for this item
    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('id, article_id, title, link_type, url, thumbnail_url, display_order, source_language')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Error fetching links:', linksError);
    }

    // Fetch translations if needed
    const articleTranslationsMap = new Map<string, { title: string; description: string | null }>();
    const linkTranslationsMap = new Map<string, { title: string }>();

    if (shouldFetchTranslation && articles && articles.length > 0) {
      const articleIds = articles.map(a => a.id);

      const { data: articleTranslations } = await supabase
        .from('article_translations')
        .select('article_id, title, description')
        .in('article_id', articleIds)
        .eq('language', requestedLanguage!)
        .eq('translation_status', 'completed');

      if (articleTranslations) {
        articleTranslations.forEach(t => {
          articleTranslationsMap.set(t.article_id, { title: t.title, description: t.description });
        });
      }
    }

    if (shouldFetchTranslation && links && links.length > 0) {
      const linkIds = links.map(l => l.id);

      const { data: linkTranslations } = await supabase
        .from('link_translations')
        .select('link_id, title')
        .in('link_id', linkIds)
        .eq('language', requestedLanguage!)
        .eq('translation_status', 'completed');

      if (linkTranslations) {
        linkTranslations.forEach(t => {
          linkTranslationsMap.set(t.link_id, { title: t.title });
        });
      }
    }

    // Task 6: Build merged content
    const isItemTranslated = itemTranslation !== null;

    const mergedItem = {
      id: item.id,
      publicId: item.public_id,
      name: itemTranslation?.name || item.name,
      description: itemTranslation?.description ?? item.description,
      displayLanguage: isItemTranslated ? requestedLanguage! : sourceLanguage,
      sourceLanguage: sourceLanguage,
      isTranslated: isItemTranslated,
      translationStatus: isItemTranslated ? 'completed' as const : undefined,
      originalName: isItemTranslated ? item.name : undefined,
      originalDescription: isItemTranslated ? item.description : undefined,
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };

    // Build articles with nested links and translations
    const articlesWithLinks = (articles || []).map(article => {
      const articleTranslation = articleTranslationsMap.get(article.id);
      const isArticleTranslated = articleTranslation !== undefined;

      const articleLinks = (links || [])
        .filter(link => link.article_id === article.id)
        .map(link => {
          const linkTranslation = linkTranslationsMap.get(link.id);
          const isLinkTranslated = linkTranslation !== undefined;

          return {
            id: link.id,
            title: linkTranslation?.title || link.title,
            linkType: link.link_type,
            url: link.url,
            thumbnailUrl: link.thumbnail_url,
            displayOrder: link.display_order || 0,
            isTranslated: isLinkTranslated,
            originalTitle: isLinkTranslated ? link.title : undefined,
          };
        });

      return {
        id: article.id,
        purpose: article.purpose,
        title: articleTranslation?.title || article.title,
        description: articleTranslation?.description ?? article.description,
        displayOrder: article.display_order || 0,
        isTranslated: isArticleTranslated,
        originalTitle: isArticleTranslated ? article.title : undefined,
        originalDescription: isArticleTranslated ? article.description : undefined,
        links: articleLinks,
      };
    });

    const standaloneLinks = (links || [])
      .filter(link => !link.article_id)
      .map(link => {
        const linkTranslation = linkTranslationsMap.get(link.id);
        const isLinkTranslated = linkTranslation !== undefined;

        return {
          id: link.id,
          title: linkTranslation?.title || link.title,
          linkType: link.link_type,
          url: link.url,
          thumbnailUrl: link.thumbnail_url,
          displayOrder: link.display_order || 0,
          isTranslated: isLinkTranslated,
          originalTitle: isLinkTranslated ? link.title : undefined,
        };
      });

    // Task 7: Get available translations
    const { data: availableTranslationsData } = await supabase
      .from('item_translations')
      .select('language')
      .eq('item_id', item.id)
      .eq('translation_status', 'completed');

    const availableTranslations: SupportedLocale[] = [
      sourceLanguage,
      ...(availableTranslationsData || [])
        .map(t => t.language as SupportedLocale)
        .filter(lang => lang !== sourceLanguage)
    ].sort();

    // Task 8: Build response
    const displayLanguage: SupportedLocale = isItemTranslated
      ? requestedLanguage!
      : sourceLanguage;

    const isShowingTranslation = displayLanguage !== sourceLanguage;

    const response = {
      success: true,
      data: {
        item: mergedItem,
        articles: articlesWithLinks,
        links: standaloneLinks,
        tags: (item.tags || []).map((tag: string) => ({
          key: tag,
          displayValue: tag,
          isTranslated: false,
        })),
        translationMeta: {
          requestedLanguage: requestedLanguage || sourceLanguage,
          displayLanguage: displayLanguage,
          sourceLanguage: sourceLanguage,
          availableTranslations: availableTranslations,
          isShowingTranslation: isShowingTranslation,
        },
      },
    };

    // Task 9: Return response with CORS headers
    return NextResponse.json(response, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    // Task 10: Handle unexpected errors
    console.error('Public item API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while processing your request',
        code: 'INTERNAL_ERROR'
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
```

---

## Testing Scenarios

### Unit Tests

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Valid request without lang | `/api/public/items/ABC123` | Item in source language, `isShowingTranslation: false` |
| Valid request with lang=fr | `/api/public/items/ABC123?lang=fr` | Item in French if translation exists |
| Valid request with unavailable translation | `/api/public/items/ABC123?lang=de` (no DE translation) | Item in source language, `isShowingTranslation: false` |
| Invalid language code | `/api/public/items/ABC123?lang=xx` | 400 with `INVALID_LANGUAGE` |
| Non-existent item | `/api/public/items/NOTEXIST` | 404 with `ITEM_NOT_FOUND` |
| Missing publicId | `/api/public/items/` | 404 (Next.js routing) |
| OPTIONS request | `OPTIONS /api/public/items/ABC123` | 204 with CORS headers |

### Integration Tests

1. **Happy Path - Translation Available:**
   - Create item with French translation
   - Request with `?lang=fr`
   - Verify French content is returned
   - Verify `originalName` contains English original

2. **Fallback - Translation Unavailable:**
   - Create item without German translation
   - Request with `?lang=de`
   - Verify English content is returned
   - Verify `isShowingTranslation: false`

3. **Available Translations:**
   - Create item with FR and ES translations
   - Request without lang param
   - Verify `availableTranslations` includes ['en', 'es', 'fr']

4. **Article and Link Translations:**
   - Create item with articles and links, all with translations
   - Request with translation language
   - Verify all nested content is translated

---

## Performance Considerations

| Optimization | Implementation |
|--------------|----------------|
| Query only necessary fields | All SELECTs specify explicit columns |
| Use indexed columns | Filters on `public_id`, `item_id`, `language`, `translation_status` |
| Batch translation queries | Use `IN` clause for articles and links |
| Avoid N+1 queries | Fetch all links once, filter in memory |
| Consider caching | Future enhancement: Redis cache for hot items |

**Target Performance:**
- Total response time: < 200ms
- Database queries: 7 max (item, articles, links, 4 translations)

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| No authentication | Public endpoint by design |
| SQL injection | Parameterized queries via Supabase |
| Information disclosure | Generic error messages, logging internal details |
| Input validation | `publicId` and `lang` validated before use |
| Rate limiting | Consider future enhancement |

---

## Files Summary

### Files to Create

| File Path | Description |
|-----------|-------------|
| `/src/app/api/public/items/[publicId]/route.ts` | Main API endpoint implementation |

### Files to Reference (Read-Only)

| File Path | Usage |
|-----------|-------|
| `/src/lib/supabase.ts` | Import `supabase` client |
| `/src/lib/i18n/config.ts` | Import `isSupportedLocale`, `DEFAULT_LOCALE`, `SupportedLocale` |
| `/src/app/api/items/[publicId]/route.ts` | Reference for existing patterns |

---

## Acceptance Criteria Checklist

- [ ] GET endpoint exists at `/api/public/items/[publicId]`
- [ ] Endpoint accepts optional `?lang=` query parameter
- [ ] Valid language codes return translated content when available
- [ ] Invalid/unsupported language codes return 400 with helpful error
- [ ] Missing item returns 404
- [ ] Response includes translation metadata (source, target, status)
- [ ] Original content preserved in response for "View Original" feature
- [ ] Available translations array populated correctly
- [ ] Articles and links include their translations
- [ ] Endpoint is publicly accessible (no authentication required)
- [ ] CORS headers allow client-side access
- [ ] Error responses don't expose internal system details
- [ ] Database queries are optimized with appropriate indexes
- [ ] OPTIONS handler returns 204 for preflight requests
- [ ] TypeScript compiles without errors
- [ ] All tests pass

---

## References

- **Overview Document:** [REQ-342-create-public-item-api-endpoint-with-translation-overview.md](./REQ-342-create-public-item-api-endpoint-with-translation-overview.md)
- **Implementation Plan:** [Plan-111-L10N-Epic4-Guest-Experience.md](./prd/Plan-111-L10N-Epic4-Guest-Experience.md)
- **Requirements:** [gen_requests_epic4.md](./gen_requests_epic4.md) - REQ-342
- **Existing Item API:** `/src/app/api/items/[publicId]/route.ts`
- **i18n Configuration:** `/src/lib/i18n/config.ts`

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience*
