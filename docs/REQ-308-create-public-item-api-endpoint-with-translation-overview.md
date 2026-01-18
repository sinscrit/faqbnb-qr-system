# REQ-308: Create Public Item API Endpoint with Translation Support

**Last Modified:** 2026-01-18 16:45:00 UTC
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.2
**Epic:** L10N Epic 4 - Guest Experience
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Create a new public API endpoint at `/src/app/api/public/items/[publicId]/route.ts` that serves item content with translation support. The endpoint accepts an optional `?lang=` query parameter, merges original content with available translations, and returns a `GuestContentResponse` format that includes comprehensive translation metadata.

---

## Current State Analysis

### Existing Public Item Endpoint

**Location:** `/src/app/api/items/[publicId]/route.ts`

The current public endpoint:
- Fetches item by `public_id` from the `items` table
- Retrieves associated `item_links` ordered by `display_order`
- Retrieves associated `item_articles` with nested links (REQ-151)
- Returns a success/error response in the standard format
- No translation support - all content returned in source language only

**Current Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "publicId": "uuid",
    "name": "Item Name",
    "description": "Item Description",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "articles": [...],
    "links": [...]
  }
}
```

### Missing Infrastructure

Based on codebase analysis, the following infrastructure from Epic 1/3 is assumed to be required:
- Translation tables: `item_translations`, `article_translations`, `link_translations`, `tag_translations`
- Localization types file: `/src/types/l10n.ts` (REQ-304)
- Translation fetch utilities: `/src/lib/translations/fetch-translations.ts` (REQ-307)
- Guest language utilities: `/src/lib/i18n/guest-language.ts` (REQ-305)

---

## Requirements

### Functional Requirements

1. **New Endpoint Path**: Create a separate endpoint under `/api/public/items/[publicId]` to maintain backward compatibility with the existing `/api/items/[publicId]` endpoint
2. **Language Query Parameter**: Accept optional `?lang=` parameter with supported language codes (en, fr, es, de, nl, it)
3. **Translation Merging**: Merge original content with translations, with translations taking precedence for available fields
4. **Fallback Behavior**: Return original content when requested translation is unavailable
5. **Translation Metadata**: Include comprehensive metadata about translation status, source/display languages, and available translations
6. **Response Format**: Return data in `GuestContentResponse` format as defined in the implementation plan

### Non-Functional Requirements

1. **Performance**: Response time should not significantly exceed the existing endpoint (target < 200ms including translation lookup)
2. **CORS**: Include appropriate CORS headers for client-side access from guest-facing domains
3. **Error Handling**: Follow existing patterns with proper HTTP status codes and error messages
4. **Security**: No authentication required (public endpoint); do not expose internal system details in errors

---

## Technical Approach

### Endpoint Design

```typescript
// GET /api/public/items/[publicId]?lang=fr
// Response: GuestContentResponse
```

### Request Flow

1. Extract `publicId` from URL path parameters
2. Extract optional `lang` query parameter (default to source language if not provided)
3. Validate `publicId` format (UUID validation)
4. Validate `lang` parameter against supported languages (if provided)
5. Fetch item from `items` table by `public_id`
6. If item not found, return 404
7. Fetch item's source language (from `source_language` column)
8. If `lang` differs from source language, fetch translation from `item_translations`
9. Fetch articles with translations from `item_articles` + `article_translations`
10. Fetch links with translations from `item_links` + `link_translations`
11. Fetch tags with translations from item tags + `tag_translations`
12. Merge original content with translations
13. Build and return `GuestContentResponse`

### Response Format

Following the `GuestContentResponse` interface from the implementation plan:

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
```

### Translation Merge Strategy

For each translatable entity (item, article, link):
1. Start with original content as base
2. If translation exists and status is 'completed':
   - Override translatable fields (name, title, description) with translated values
   - Preserve original content in `original*` fields for "View Original" feature
   - Set `isTranslated: true`
3. If no translation or translation pending/failed:
   - Return original content
   - Set `isTranslated: false`

---

## Implementation Tasks

### Task 1: Create Public API Directory Structure
- Create `/src/app/api/public/` directory if not exists
- Create `/src/app/api/public/items/` directory
- Create `/src/app/api/public/items/[publicId]/` directory

### Task 2: Create Route Handler File
- Create `/src/app/api/public/items/[publicId]/route.ts`
- Export async GET function following Next.js 15 App Router conventions

### Task 3: Implement Query Parameter Handling
- Extract and validate `lang` parameter from `request.nextUrl.searchParams`
- Define default behavior when `lang` is omitted (use source language)
- Validate against `SupportedLanguage` type

### Task 4: Implement Item Fetching with Translation
- Fetch base item using existing pattern
- Join with `item_translations` table on matching language
- Use `COALESCE` or application-level merge for translation fallback
- Include `source_language` in item query

### Task 5: Implement Articles/Links/Tags Translation Fetching
- Leverage translation fetch utilities from `/src/lib/translations/fetch-translations.ts`
- Batch fetch translations for all articles in single query
- Batch fetch translations for all links in single query
- Handle tag translations

### Task 6: Implement Response Building
- Transform database results to `GuestContentResponse` format
- Calculate `translationMeta` based on actual availability
- Determine `availableTranslations` from translation tables

### Task 7: Implement Error Handling
- Handle 400 for invalid parameters
- Handle 404 for item not found
- Handle 500 for database errors
- Return appropriate CORS headers

### Task 8: Add CORS Headers
- Configure appropriate `Access-Control-Allow-Origin` headers
- Configure `Access-Control-Allow-Methods: GET`
- Configure `Access-Control-Allow-Headers` as needed

---

## Database Queries

### Primary Item Query with Translation

```sql
SELECT
  i.id,
  i.public_id,
  i.name as original_name,
  i.description as original_description,
  i.source_language,
  i.created_at,
  i.updated_at,
  i.tags,
  it.name as translated_name,
  it.description as translated_description,
  it.translation_status,
  CASE WHEN it.id IS NOT NULL AND it.translation_status = 'completed'
       THEN true ELSE false END as is_translated
FROM items i
LEFT JOIN item_translations it
  ON it.item_id = i.id
  AND it.language = :requestedLanguage
WHERE i.public_id = :publicId;
```

### Available Translations Query

```sql
SELECT DISTINCT language
FROM item_translations
WHERE item_id = :itemId
  AND translation_status = 'completed';
```

### Articles with Translations Query

```sql
SELECT
  a.id,
  a.purpose,
  a.title as original_title,
  a.description as original_description,
  a.display_order,
  at.title as translated_title,
  at.description as translated_description,
  at.translation_status,
  CASE WHEN at.id IS NOT NULL AND at.translation_status = 'completed'
       THEN true ELSE false END as is_translated
FROM item_articles a
LEFT JOIN article_translations at
  ON at.article_id = a.id
  AND at.language = :requestedLanguage
WHERE a.item_id = :itemId
ORDER BY a.display_order ASC;
```

---

## Dependencies

### Required from Epic 1 (Foundation)
| Dependency | File | Status |
|------------|------|--------|
| `SupportedLanguage` type | `/src/types/l10n.ts` | Required (REQ-304) |
| `GuestContentResponse` type | `/src/types/l10n.ts` | Required (REQ-304) |
| `TranslatedItem` type | `/src/types/l10n.ts` | Required (REQ-304) |
| `TranslatedArticle` type | `/src/types/l10n.ts` | Required (REQ-304) |
| `TranslatedLink` type | `/src/types/l10n.ts` | Required (REQ-304) |
| `TranslatedTag` type | `/src/types/l10n.ts` | Required (REQ-304) |
| Translation tables | Database migrations | Required from Epic 1 |

### Required from Epic 4 Phase 2.1
| Dependency | File | Status |
|------------|------|--------|
| `fetchTranslatedItem()` | `/src/lib/translations/fetch-translations.ts` | Required (REQ-307) |
| `fetchArticleTranslations()` | `/src/lib/translations/fetch-translations.ts` | Required (REQ-307) |
| `fetchLinkTranslations()` | `/src/lib/translations/fetch-translations.ts` | Required (REQ-307) |
| `fetchTagTranslations()` | `/src/lib/translations/fetch-translations.ts` | Required (REQ-307) |

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/public/items/[publicId]/route.ts` | Main endpoint implementation |

### Files to Import From (Read-Only)

| File Path | Imports Needed |
|-----------|----------------|
| `/src/lib/supabase.ts` | `supabase` client |
| `/src/types/l10n.ts` | `SupportedLanguage`, `GuestContentResponse`, `TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, `TranslatedTag` |
| `/src/lib/translations/fetch-translations.ts` | Translation fetch utilities |

### Existing Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/app/api/items/[publicId]/route.ts` | Maintain backward compatibility - keep existing endpoint unchanged |

---

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Missing publicId | 400 | `{ success: false, error: "Public ID is required" }` |
| Invalid publicId format | 400 | `{ success: false, error: "Invalid public ID format" }` |
| Invalid language code | 400 | `{ success: false, error: "Unsupported language code" }` |
| Item not found | 404 | `{ success: false, error: "Item not found" }` |
| Database error | 500 | `{ success: false, error: "Internal server error" }` |

---

## Response Headers

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  'Access-Control-Allow-Origin': '*',  // Or specific domains in production
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

---

## Testing Scenarios

### Happy Path Tests
1. Fetch item without `lang` parameter - returns content in source language
2. Fetch item with `lang` matching source language - returns original content
3. Fetch item with `lang` different from source, translation available - returns translated content
4. Fetch item with `lang` different from source, translation unavailable - returns original with appropriate metadata

### Edge Case Tests
1. Invalid UUID format for publicId
2. Non-existent publicId
3. Invalid language code
4. Translation partially available (some fields translated, others not)
5. Translation in 'pending' or 'failed' status

### Performance Tests
1. Response time under load
2. Concurrent request handling
3. Database query optimization verification

---

## Acceptance Criteria

From REQ-308 acceptance criteria:

- [ ] GET endpoint exists at the public items route accepting a public item identifier in the URL path
- [ ] Endpoint accepts an optional language query parameter that defaults to a sensible value when omitted
- [ ] Item lookup occurs using the public identifier, not internal database IDs
- [ ] Translation fetch occurs only when a language parameter is provided and differs from the source language
- [ ] Response merges original content with translated content, with translations taking precedence for available fields
- [ ] Response includes metadata fields indicating translation status, source language, and target language
- [ ] Response follows the guest content response format for consistency with other public endpoints
- [ ] Endpoint returns appropriate HTTP status codes for not found, invalid parameters, and server errors
- [ ] Response includes proper CORS headers to allow client-side access from guest-facing domains
- [ ] Endpoint performance is optimized to minimize database queries and response time
- [ ] Error responses include helpful messages that don't expose internal system details

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation tables don't exist yet | High | High | Verify Epic 1 completion; create stub queries that gracefully handle missing tables |
| Performance degradation from extra joins | Medium | Medium | Use indexed columns; batch queries; implement caching |
| Type definitions not available | High | High | Create inline types if `/src/types/l10n.ts` not yet created |
| Breaking change to existing clients | Low | High | New endpoint path (`/api/public/`) preserves existing `/api/items/` endpoint |

---

## References

- **Request Source:** `/docs/gen_requests_epic4.md` - REQ-308
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 2.2
- **Existing Pattern:** `/src/app/api/items/[publicId]/route.ts`
- **Type Definitions:** `/src/types/index.ts`
- **Database Config:** `/src/lib/supabase.ts`

---

## Notes

1. This endpoint is intentionally separate from the existing `/api/items/[publicId]` to maintain backward compatibility and allow gradual migration.

2. The `GuestContentResponse` format includes both original and translated content to support the "View Original" toggle feature on the client side.

3. Performance should be carefully monitored - the additional translation joins and nested queries for articles/links could impact response time. Consider implementing query optimization or caching if needed.

4. CORS configuration should be reviewed for production deployment - currently set to allow all origins for development purposes.
