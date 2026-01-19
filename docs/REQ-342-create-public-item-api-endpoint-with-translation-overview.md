# REQ-342: Create Public Item API Endpoint with Translation Support

**Generated:** 2026-01-19 03:15:00 UTC
**Last Modified:** 2026-01-19 03:15:00 UTC
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.2

---

## Summary

Create a new public API endpoint at `/api/public/items/[publicId]/route.ts` that returns item details with translated content merged based on the guest's language preference. The endpoint accepts an optional `?lang=` query parameter and returns a unified `GuestContentResponse` format that includes both content and translation metadata.

---

## Current Behavior

- The existing `/api/items/[publicId]/route.ts` endpoint returns item data with links and articles but does not support translations
- Guest-facing pages cannot dynamically fetch items with their translated content through a REST API
- No standardized public API exists for retrieving localized content
- Language preference is not considered when fetching item data

---

## Expected Behavior

When the new endpoint is called:

1. **Accept Parameters:**
   - URL path: `publicId` - The item's public identifier
   - Query parameter: `lang` (optional) - Target language code (e.g., `fr`, `es`, `de`)

2. **Processing:**
   - Validate the item exists using `public_id`
   - If `lang` parameter is provided and valid, fetch translations from `item_translations` table
   - Merge original content with translated content (translations take precedence)
   - Fetch and merge translations for related articles, links, and tags

3. **Response:**
   - Return a `GuestContentResponse` format containing:
     - Merged item content (translated fields override original)
     - Translation metadata (source language, target language, status)
     - Available translations indicator
     - Original content preserved for "View Original" functionality

4. **Error Handling:**
   - Return 404 if item not found
   - Return 400 for invalid language codes
   - Return original content with metadata when translation unavailable

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Public API Route | `/src/app/api/public/access-request/route.ts` | Pattern for public (unauthenticated) API endpoints |
| Item API Route | `/src/app/api/items/[publicId]/route.ts` | Current item fetching pattern with articles/links |
| Supabase Client | `/src/lib/supabase.ts` | Database client usage pattern |
| Translation Tables | `item_translations`, `article_translations`, `link_translations` | L10N table structure |
| i18n Config | `/src/lib/i18n/config.ts` | Language validation via `isSupportedLocale()` |
| Locale Types | `/src/contexts/LocaleContext.tsx` | `SupportedLanguage` type definition |

### Database Schema

The endpoint will read from these tables:

```sql
-- Primary content
items (id, public_id, name, description, source_language, ...)

-- Translations (from Epic 1)
item_translations (id, item_id, language, name, description, translation_status, ...)
article_translations (id, article_id, language, title, description, translation_status, ...)
link_translations (id, link_id, language, title, translation_status, ...)
tag_translations (id, tag_key, language, translated_value, ...)
```

### Response Type Interface

Based on the implementation plan at `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`:

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
  displayLanguage: SupportedLanguage;
  sourceLanguage: SupportedLanguage;
  isTranslated: boolean;
  translationStatus?: 'completed' | 'pending' | 'failed';
  originalName?: string;           // For "View Original" toggle
  originalDescription?: string;    // For "View Original" toggle
}
```

---

## Implementation Tasks

### Task 1: Create the API Route File

**File:** `/src/app/api/public/items/[publicId]/route.ts`

Create the GET endpoint with the following structure:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isSupportedLocale, DEFAULT_LOCALE, type SupportedLocale } from '@/lib/i18n';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  // Implementation
}
```

### Task 2: Implement Request Parameter Parsing

- Extract `publicId` from URL params
- Extract `lang` from query parameters via `request.nextUrl.searchParams`
- Validate `lang` using `isSupportedLocale()` from `/src/lib/i18n`
- Default to source language if no `lang` parameter provided

### Task 3: Implement Item Fetching

- Fetch base item from `items` table using `public_id`
- Return 404 if item not found
- Include `source_language` field from item record

### Task 4: Implement Translation Fetching

- Query `item_translations` for the requested language
- Only include translations with `translation_status = 'completed'`
- Handle case when no translation exists (return original with metadata)

### Task 5: Implement Content Merging

Create merge logic that:
- Uses translated `name` if available, otherwise original
- Uses translated `description` if available, otherwise original
- Preserves original content in separate fields for "View Original" functionality

### Task 6: Implement Article/Link Translation Fetching

- Fetch `item_articles` with translations from `article_translations`
- Fetch `item_links` with translations from `link_translations`
- Apply same merge strategy as item content

### Task 7: Build GuestContentResponse

Construct the response object with:
- Merged item content
- Merged articles with nested translated links
- Translation metadata including:
  - `requestedLanguage`: The language parameter received
  - `displayLanguage`: The language actually being shown
  - `sourceLanguage`: The item's original language
  - `availableTranslations`: Array of languages with completed translations
  - `isShowingTranslation`: Boolean indicating if translated content is displayed

### Task 8: Add CORS Headers

Include appropriate CORS headers for client-side access:

```typescript
const headers = {
  'Access-Control-Allow-Origin': '*',  // Or specific domain
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### Task 9: Implement Error Handling

- 400 for missing/invalid `publicId`
- 400 for unsupported language code (with helpful message)
- 404 for item not found
- 500 for database errors (with generic message, log details)

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/public/items/[publicId]/route.ts` | Main API endpoint implementation |

### Files to Potentially Modify

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | May need to export new response types if not already defined |

### Dependencies (Read-Only Reference)

| File Path | Usage |
|-----------|-------|
| `/src/lib/supabase.ts` | Import `supabase` client |
| `/src/lib/i18n/config.ts` | Import `isSupportedLocale`, `DEFAULT_LOCALE`, `SupportedLocale` |
| `/src/contexts/LocaleContext.tsx` | Reference `SupportedLanguage` type (re-exported in types/index.ts) |

### Database Tables (Read-Only)

| Table | Access |
|-------|--------|
| `items` | SELECT with filter on `public_id` |
| `item_translations` | SELECT with filter on `item_id` and `language` |
| `item_articles` | SELECT with filter on `item_id` |
| `article_translations` | SELECT with filter on `article_id` and `language` |
| `item_links` | SELECT with filter on `item_id` and `article_id` |
| `link_translations` | SELECT with filter on `link_id` and `language` |

---

## Acceptance Criteria

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

---

## Testing Scenarios

### Happy Path

1. Request item with valid `publicId` and valid `lang=fr`
2. Item exists with French translation
3. Response contains merged French content with metadata

### Translation Unavailable

1. Request item with valid `publicId` and `lang=de`
2. Item exists but no German translation
3. Response contains original content with `isShowingTranslation: false`

### Invalid Language

1. Request item with `lang=xx` (invalid code)
2. Response is 400 with error message

### Item Not Found

1. Request with non-existent `publicId`
2. Response is 404

### No Language Parameter

1. Request item without `lang` parameter
2. Response contains original content in source language

---

## Performance Considerations

- Use single database round-trip where possible via Supabase joins
- Query only necessary fields to reduce payload
- Consider caching strategy for frequently accessed items
- Translation lookup should use indexed columns (`item_id`, `language`)

---

## Security Considerations

- No authentication required (public endpoint)
- Validate `publicId` format before database query
- Sanitize error messages to avoid exposing internal details
- Rate limiting may be considered for future enhancement

---

## Dependencies

### Required Before Implementation

- Translation tables must exist (`item_translations`, `article_translations`, `link_translations`)
- i18n config module must be available (`/src/lib/i18n/config.ts`)
- `SupportedLanguage` type must be defined

### Will Be Used By

- Guest item page server component (`/src/app/item/[publicId]/page.tsx`)
- Client-side language switching functionality
- Future mobile applications or third-party integrations

---

## References

- **Request Document:** `/docs/gen_requests_epic4.md` - REQ-342
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Existing Item API:** `/src/app/api/items/[publicId]/route.ts`
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Database Types:** `/src/lib/supabase.ts`

---

## Estimated Effort

**Size:** M (Medium) - 2-4 hours

- Task 1-2 (Setup & Params): 30 minutes
- Task 3-4 (Fetching): 45 minutes
- Task 5-6 (Merging): 45 minutes
- Task 7-9 (Response & Errors): 45 minutes
- Testing & Validation: 30-60 minutes
