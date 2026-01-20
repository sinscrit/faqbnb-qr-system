# REQ-E04-006: Create Language Availability API Endpoint - Implementation Overview

**Generated:** 2026-01-19 22:45:00 UTC
**Request ID:** REQ-E04-006
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.3
**Size:** S (Small)
**Priority:** P1 - High

---

## Summary

Create a public API endpoint that returns the list of available translation languages for a specific item. This endpoint enables guest-facing language switcher components to display accurate availability indicators, improving the user experience when browsing multilingual content.

---

## Background

### Current Behavior
No endpoint exists to query which languages are available for a given item. Guests and clients cannot discover which translations exist before requesting content, forcing them to either request each language speculatively or display language options without knowing availability.

### Expected Behavior
A GET endpoint accepts a public item ID and returns a structured response listing all languages for which complete or partial translations exist. The response indicates the translation completeness for each available language, including metadata about what content types are translated (items, articles, links, tags). The endpoint performs efficiently by querying translation status without loading full content.

### User Impact
Guests see only language options that have actual translations available, avoiding frustration from selecting languages with no content. Language switcher components can display accurate availability indicators, improving the user experience when browsing multilingual content.

### Business Value
Enables dynamic language selection interfaces that adapt to actual translation availability, improving guest satisfaction and reducing support burden from missing translations. Provides a lightweight endpoint for building responsive, translation-aware UI components.

---

## Technical Context

### Existing Patterns

The codebase follows established patterns for API routes:

**Response Format:**
```typescript
// Success response
{ success: true, data: { /* response data */ } }

// Error response
{ success: false, error: string, code?: string }
```

**Error Handling Patterns:**
| Status | Pattern |
|--------|---------|
| 400 | Invalid/missing parameters |
| 404 | Item not found |
| 500 | Internal server error |

**Reference Files:**
- `/src/app/api/items/[publicId]/route.ts` - Existing public item endpoint pattern
- `/src/lib/translation-service/translation-service.types.ts` - Translation type definitions

### Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| Translation Tables | `item_translations`, `article_translations`, `link_translations`, `tag_translations` | Required from Epic 1 |
| SupportedLanguage type | `/src/lib/translation-service/translation-service.types.ts` | Available |
| TranslationStatus type | `/src/lib/translation-service/translation-service.types.ts` | Available |
| Supabase client | `/src/lib/supabase.ts` | Available |

### Supported Languages
The system supports 6 languages (defined in `translation-service.types.ts`):
- `en` (English)
- `fr` (French)
- `es` (Spanish)
- `de` (German)
- `nl` (Dutch)
- `it` (Italian)

---

## Implementation Approach

### File Location
`/src/app/api/public/items/[publicId]/languages/route.ts`

### API Contract

**Endpoint:** `GET /api/public/items/[publicId]/languages`

**Path Parameters:**
- `publicId` (string, required): The public ID of the item

**Response Type: `LanguageAvailabilityResponse`**

```typescript
interface LanguageAvailabilityResponse {
  /** Source/original language of the item */
  sourceLanguage: SupportedLanguage;
  /** Languages with completed translations */
  availableTranslations: SupportedLanguage[];
  /** Languages with pending/processing translations */
  pendingTranslations: SupportedLanguage[];
  /** Languages with no translations or failed translations */
  unavailableTranslations: SupportedLanguage[];
  /** Detailed breakdown per language */
  languageDetails?: {
    [key in SupportedLanguage]?: {
      /** Overall status for this language */
      status: 'available' | 'partial' | 'pending' | 'unavailable';
      /** Number of translated articles */
      articlesTranslated: number;
      /** Total number of articles */
      totalArticles: number;
      /** Number of translated links */
      linksTranslated: number;
      /** Total number of links */
      totalLinks: number;
      /** Whether item name/description is translated */
      itemTranslated: boolean;
      /** Tags translation count */
      tagsTranslated: number;
      /** Total tags count */
      totalTags: number;
    };
  };
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sourceLanguage": "en",
    "availableTranslations": ["fr", "es", "de"],
    "pendingTranslations": ["it"],
    "unavailableTranslations": ["nl"],
    "languageDetails": {
      "fr": {
        "status": "available",
        "articlesTranslated": 3,
        "totalArticles": 3,
        "linksTranslated": 5,
        "totalLinks": 5,
        "itemTranslated": true,
        "tagsTranslated": 4,
        "totalTags": 4
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid publicId
- `404 Not Found`: Item does not exist
- `500 Internal Server Error`: Database or server errors

### Implementation Steps

1. **Create the route file** at `/src/app/api/public/items/[publicId]/languages/route.ts`

2. **Extract and validate publicId** from path parameters

3. **Verify item exists** by querying the `items` table with the public_id

4. **Query translation status** across all translation tables:
   - `item_translations`: Check for item name/description translations
   - `article_translations`: Count translated articles per language
   - `link_translations`: Count translated links per language
   - `tag_translations`: Count translated tags per language

5. **Aggregate results** by language:
   - Categorize as `available` if all content types are translated
   - Categorize as `partial` if some content is translated
   - Categorize as `pending` if translations are in progress
   - Categorize as `unavailable` if no translations exist

6. **Return structured response** following the `LanguageAvailabilityResponse` format

### Database Query Strategy

Use efficient aggregate queries to count translation status per language without loading full content:

```sql
-- Get item translations status per language
SELECT language, translation_status
FROM item_translations
WHERE item_id = :itemId;

-- Get article translations count per language
SELECT language,
       COUNT(*) FILTER (WHERE translation_status = 'completed') as completed_count,
       COUNT(*) FILTER (WHERE translation_status IN ('pending', 'processing')) as pending_count
FROM article_translations
WHERE article_id IN (SELECT id FROM item_articles WHERE item_id = :itemId)
GROUP BY language;

-- Similar queries for links and tags
```

### Caching Considerations

The endpoint should include appropriate cache headers since translation availability changes infrequently:
```typescript
headers: {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/public/items/[publicId]/languages/route.ts` | Main API route handler |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/lib/translation-service/translation-service.types.ts` | Add `LanguageAvailabilityResponse` interface |

### Database Tables Accessed (Read-Only)

| Table | Purpose |
|-------|---------|
| `items` | Verify item exists, get source language |
| `item_translations` | Check item name/description translations |
| `item_articles` | Get article IDs for the item |
| `article_translations` | Check article translations |
| `item_links` | Get link IDs for the item |
| `link_translations` | Check link translations |
| `tag_translations` | Check tag translations for item tags |

---

## Acceptance Criteria

- [ ] A GET endpoint exists at `/api/public/items/[publicId]/languages`
- [ ] The endpoint returns a list of language codes for which at least one translation exists
- [ ] The response includes translation completeness indicators for each language
- [ ] The response indicates which content types are translated (items, articles, links, tags)
- [ ] The response format matches the `LanguageAvailabilityResponse` type structure
- [ ] The endpoint returns a 404 status when the item does not exist or is not accessible
- [ ] The endpoint performs efficiently without loading full translated content
- [ ] The endpoint does not require authentication for public items
- [ ] Response includes proper HTTP headers for caching and content type
- [ ] The endpoint handles database errors gracefully and returns appropriate error responses

---

## Testing Scenarios

### Happy Path
1. Request languages for an item with multiple translations
2. Verify response includes correct available/pending/unavailable categorization
3. Verify language details show accurate counts

### Edge Cases
1. Item with no translations - should return empty `availableTranslations`
2. Item with partial translations - should categorize correctly
3. Item with pending translations - should appear in `pendingTranslations`
4. Non-existent item - should return 404
5. Item with no articles/links - should handle zero counts gracefully

### Error Cases
1. Invalid/missing publicId - should return 400
2. Database connection failure - should return 500 with appropriate message

---

## Dependencies and Blockers

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation complete | Required | Translation tables must exist |
| Translation types available | Available | Types defined in translation-service.types.ts |
| Items API pattern | Available | Can follow existing /api/items/[publicId]/route.ts |

---

## Estimated Effort

**Size:** Small (S)
**Complexity:** Low-Medium

The implementation is straightforward as it follows existing API patterns and only requires read operations on existing translation tables.

---

## References

- **Request Document:** `/docs/gen_requests_epic4.md` - REQ-E04-006
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 2.3
- **Existing Item API:** `/src/app/api/items/[publicId]/route.ts`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Supabase Client:** `/src/lib/supabase.ts`
