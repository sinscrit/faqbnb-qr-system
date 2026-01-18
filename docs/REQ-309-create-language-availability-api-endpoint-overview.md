# REQ-309: Create Language Availability API Endpoint for Items

**Last Modified:** 2026-01-18 17:30:00 UTC
**Request Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.3
**Epic:** L10N Epic 4 - Guest Experience
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Summary

Create a public API endpoint at `/src/app/api/public/items/[publicId]/languages/route.ts` that returns the list of languages for which translations are available for a specific item. This enables language switching interfaces to display only languages that have actual translations available, improving user experience and setting accurate expectations.

---

## Current State Analysis

### Existing Infrastructure

**Existing Public API Pattern:**
- `/src/app/api/public/access-request/route.ts` - Example of public API endpoint without authentication
- `/src/app/api/items/[publicId]/route.ts` - Existing item lookup by publicId pattern

**Codebase Patterns Observed:**
| Pattern | File | Description |
|---------|------|-------------|
| Dynamic route params | `/src/app/api/items/[publicId]/route.ts` | `params: Promise<{ publicId: string }>` pattern (Next.js 15) |
| Response format | All API routes | `{ success: boolean, data?: T, error?: string }` |
| Supabase queries | `/src/lib/supabase.ts` | Server-side Supabase client usage |
| Error handling | Various routes | Try-catch with appropriate HTTP status codes |

### Related Epic 4 Tasks

| Dependency | Status | Impact |
|------------|--------|--------|
| REQ-304: Localization types file (`/src/types/l10n.ts`) | Required | Provides `SupportedLanguage`, `LanguageAvailabilityResponse` types |
| REQ-307: Translation fetch utilities | Recommended | Could provide helper functions for translation queries |
| REQ-308: Public item API with translation support | Sibling task | Same directory structure, similar patterns |

### Database Context

**Translation Tables (from Epic 1 - assumed structure):**
- `item_translations` - Contains translations for item name/description
  - Columns: `id`, `item_id` (FK), `language`, `name`, `description`, `translation_status`, `created_at`, `updated_at`
- `translation_status` values: `'completed'`, `'pending'`, `'failed'`

**Items Table:**
- `source_language` column (from Epic 1 REQ-224) - Original language of the item content

---

## Requirements

### Functional Requirements

1. **Endpoint Path**: `GET /api/public/items/[publicId]/languages`
2. **Item Validation**: Verify item exists by `public_id` before querying translations
3. **Source Language**: Include the item's source language as always available
4. **Translation Discovery**: Query `item_translations` table for completed translations
5. **Response Format**: Return `LanguageAvailabilityResponse` format as defined in the implementation plan
6. **Status Categorization**: Categorize translations as available, pending, or unavailable

### Non-Functional Requirements

1. **Performance**: Query should be optimized to avoid fetching full translation content (metadata only)
2. **CORS**: Include appropriate headers for client-side access
3. **Public Access**: No authentication required
4. **Error Messages**: Safe error messages that don't expose internal details

---

## Technical Approach

### Endpoint Design

```typescript
// GET /api/public/items/[publicId]/languages
// Response: LanguageAvailabilityResponse
```

### Request Flow

1. Extract `publicId` from URL path parameters
2. Validate `publicId` format
3. Fetch item from `items` table by `public_id` to verify existence and get `source_language`
4. If item not found, return 404
5. Query `item_translations` for all translation records associated with this item
6. Categorize translations by status (completed, pending)
7. Determine unavailable languages (supported languages not in available or pending)
8. Build and return `LanguageAvailabilityResponse`

### Response Format

Following the `LanguageAvailabilityResponse` interface from the implementation plan:

```typescript
interface LanguageAvailabilityResponse {
  sourceLanguage: SupportedLanguage;
  availableTranslations: SupportedLanguage[];   // Completed translations
  pendingTranslations: SupportedLanguage[];     // In-progress translations
  unavailableTranslations: SupportedLanguage[]; // Not started
}
```

### Query Optimization

The endpoint should NOT fetch full translation content. Only query metadata:

```sql
SELECT DISTINCT
  language,
  translation_status,
  updated_at
FROM item_translations
WHERE item_id = :itemId;
```

---

## Implementation Tasks

### Task 1: Create Directory Structure
- Ensure `/src/app/api/public/items/[publicId]/languages/` directory exists
- This extends the structure created for REQ-308

### Task 2: Create Route Handler File
- Create `/src/app/api/public/items/[publicId]/languages/route.ts`
- Export async GET function following Next.js 15 App Router conventions

### Task 3: Implement Item Lookup
- Fetch item by `public_id` to verify existence
- Extract `source_language` from item (default to 'en' if not set)
- Return 404 if item not found

### Task 4: Implement Translation Query
- Query `item_translations` table for item_id
- Select only `language`, `translation_status`, `updated_at` columns
- Group results by language

### Task 5: Categorize Languages
- Initialize `SUPPORTED_LANGUAGES` constant: `['en', 'fr', 'es', 'de', 'nl', 'it']`
- Source language is always "available"
- Translations with status 'completed' → `availableTranslations`
- Translations with status 'pending' → `pendingTranslations`
- Remaining supported languages → `unavailableTranslations`

### Task 6: Build Response
- Return `LanguageAvailabilityResponse` format
- Include source language in available list (even if no explicit translation record)

### Task 7: Add CORS Headers
- Match headers pattern from REQ-308

### Task 8: Implement Error Handling
- Handle 400 for invalid parameters
- Handle 404 for item not found
- Handle 500 for database errors

---

## Database Queries

### Item Lookup Query

```sql
SELECT
  id,
  public_id,
  source_language
FROM items
WHERE public_id = :publicId;
```

### Translation Availability Query

```sql
SELECT
  language,
  translation_status,
  MAX(updated_at) as last_updated
FROM item_translations
WHERE item_id = :itemId
GROUP BY language, translation_status;
```

**Note:** Using `GROUP BY` handles edge case where multiple translation records exist for same language (e.g., different versions).

### Supabase Query Pattern

```typescript
// Get item and verify existence
const { data: item, error: itemError } = await supabase
  .from('items')
  .select('id, public_id, source_language')
  .eq('public_id', publicId)
  .single();

// Get translation availability
const { data: translations, error: translationsError } = await supabase
  .from('item_translations')
  .select('language, translation_status, updated_at')
  .eq('item_id', item.id);
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/public/items/[publicId]/languages/route.ts` | Language availability endpoint implementation |

### Files to Import From (Read-Only)

| File Path | Imports Needed |
|-----------|----------------|
| `/src/lib/supabase.ts` | `supabase` client |
| `/src/types/l10n.ts` | `SupportedLanguage`, `LanguageAvailabilityResponse`, `SUPPORTED_LANGUAGES` |

### Database Tables (Read-Only)

| Table | Operations |
|-------|------------|
| `items` | SELECT (id, public_id, source_language) |
| `item_translations` | SELECT (language, translation_status, updated_at) |

### Functions to Implement

| Function | Location | Description |
|----------|----------|-------------|
| `GET` handler | `/src/app/api/public/items/[publicId]/languages/route.ts` | Main endpoint handler |

---

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Missing publicId | 400 | `{ success: false, error: "Public ID is required" }` |
| Invalid publicId format | 400 | `{ success: false, error: "Invalid public ID format" }` |
| Item not found | 404 | `{ success: false, error: "Item not found" }` |
| Database error | 500 | `{ success: false, error: "Internal server error" }` |

---

## Response Headers

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

---

## Example Responses

### Item with Multiple Translations Available

**Request:** `GET /api/public/items/ABC123/languages`

```json
{
  "success": true,
  "data": {
    "sourceLanguage": "en",
    "availableTranslations": ["en", "fr", "de"],
    "pendingTranslations": ["es"],
    "unavailableTranslations": ["nl", "it"]
  }
}
```

### Item with No Translations

**Request:** `GET /api/public/items/XYZ789/languages`

```json
{
  "success": true,
  "data": {
    "sourceLanguage": "en",
    "availableTranslations": ["en"],
    "pendingTranslations": [],
    "unavailableTranslations": ["fr", "es", "de", "nl", "it"]
  }
}
```

### Item Not Found

**Request:** `GET /api/public/items/INVALID/languages`

```json
{
  "success": false,
  "error": "Item not found"
}
```

---

## Testing Scenarios

### Happy Path Tests

1. **Item exists with completed translations** - Returns source + available translations
2. **Item exists with pending translations** - Returns correct categorization
3. **Item exists with no translations** - Returns only source language as available
4. **Item exists with all languages translated** - Full availability

### Edge Case Tests

1. **Invalid UUID format for publicId** - Returns 400
2. **Non-existent publicId** - Returns 404
3. **Item without `source_language` set** - Defaults to 'en'
4. **Translation table doesn't exist yet** - Graceful handling
5. **Multiple translation records for same language** - Uses latest/completed

### Performance Tests

1. **Query execution time** - Should be < 50ms
2. **No unnecessary data fetching** - Verify only metadata columns selected

---

## Dependencies

### Required Before Implementation

| Dependency | Source | Status | Fallback |
|------------|--------|--------|----------|
| `item_translations` table | Epic 1 (REQ-223) | Verify exists | Return only source language |
| `source_language` column | Epic 1 (REQ-224) | Verify exists | Default to 'en' |
| `SupportedLanguage` type | REQ-304 | Verify exists | Define inline |
| `LanguageAvailabilityResponse` type | REQ-304 | Verify exists | Define inline |
| `SUPPORTED_LANGUAGES` constant | REQ-304 | Verify exists | Define inline |

### Verification Steps Before Implementation

1. Check if `item_translations` table exists in database
2. Check if `items.source_language` column exists
3. Check if `/src/types/l10n.ts` exists with required exports
4. Check if `/src/app/api/public/items/[publicId]/` directory exists (from REQ-308)

---

## Acceptance Criteria

From REQ-309 in gen_requests_epic4.md:

- [ ] GET endpoint exists at the item languages route accepting a public item identifier in the URL path
- [ ] Item lookup occurs using the public identifier and verifies the item exists before querying translations
- [ ] Query retrieves all translation records associated with the item from the appropriate translation table
- [ ] Response includes the item's source language as part of the available languages list
- [ ] Response follows the LanguageAvailabilityResponse format with consistent structure
- [ ] Each language entry includes the language code and human-readable language name
- [ ] Translation status metadata indicates whether translations are complete, partial, or outdated
- [ ] Response includes timestamps for when each translation was last updated
- [ ] Endpoint returns appropriate HTTP status codes for not found items and server errors
- [ ] Response includes proper CORS headers to allow client-side access from guest-facing domains
- [ ] Query is optimized to check translation existence without fetching full content data
- [ ] Endpoint handles items with no translations gracefully, returning only the source language

---

## Implementation Checklist

### Pre-Implementation
- [ ] Verify `item_translations` table exists in database
- [ ] Verify `items.source_language` column exists
- [ ] Verify L10n types are available (or plan inline definitions)
- [ ] Verify `/src/app/api/public/items/[publicId]/` directory exists

### Implementation
- [ ] Create `/src/app/api/public/items/[publicId]/languages/route.ts`
- [ ] Implement GET handler with Next.js 15 patterns
- [ ] Add item existence validation
- [ ] Add translation metadata query
- [ ] Add language categorization logic
- [ ] Add CORS headers
- [ ] Add comprehensive error handling

### Post-Implementation
- [ ] Test with valid publicId (with translations)
- [ ] Test with valid publicId (without translations)
- [ ] Test with invalid publicId
- [ ] Test with non-existent publicId
- [ ] Verify build passes: `npm run build`
- [ ] Verify type checking: `npm run type-check` (if available)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation tables don't exist | High | High | Gracefully return source language only |
| `source_language` column missing | High | Medium | Default to 'en' |
| L10n types not available | High | Medium | Define inline types as fallback |
| Performance degradation | Low | Medium | Query only metadata columns |
| CORS configuration issues | Low | Medium | Follow REQ-308 pattern |

---

## Code Pattern Reference

### Route Handler Structure (from existing patterns)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Implementation here...

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## References

- **Request Source:** `/docs/gen_requests_epic4.md` - REQ-309
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 2.3
- **Sibling Task:** REQ-308 (Public Item API with Translation Support)
- **Type Definitions:** REQ-304 (Localization Types File)
- **Existing Pattern:** `/src/app/api/items/[publicId]/route.ts`
- **Public API Pattern:** `/src/app/api/public/access-request/route.ts`

---

## Notes

1. **Graceful Degradation:** If translation infrastructure (tables/columns) from Epic 1 is not yet available, the endpoint should still function by returning only the source language as available.

2. **Caching Consideration:** The response is suitable for caching (Cache-Control header) as translation availability changes infrequently. Consider implementing a cache invalidation strategy when translations are added/updated.

3. **Extended Response Option:** The acceptance criteria mention "language name" and "timestamps" which could enhance the response:
   ```typescript
   interface ExtendedLanguageAvailability {
     code: SupportedLanguage;
     name: string;           // "French"
     nativeName: string;     // "Français"
     status: 'available' | 'pending' | 'unavailable';
     lastUpdated?: string;   // ISO timestamp
   }
   ```
   This could be implemented as an optional `?detailed=true` query parameter.

4. **Relationship to Language Switcher:** This endpoint is designed to power the `GuestLanguageSwitcher` component (Phase 3), providing data for which language options to display and how to visually indicate availability.
