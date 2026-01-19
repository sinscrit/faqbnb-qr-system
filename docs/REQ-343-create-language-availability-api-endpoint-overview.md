# REQ-343: Create Language Availability API Endpoint for Public Items

**Document Created:** 2026-01-19 15:45:00 UTC
**Last Modified:** 2026-01-19 15:45:00 UTC
**Status:** Implementation Ready
**Request Reference:** docs/gen_requests_epic4.md - Request #343
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.3
**Size:** S (Small)
**Priority:** P2 - Medium

---

## Summary

Create a public API endpoint that returns all available language translations for a specific item, allowing client applications to discover translation coverage before requesting specific language versions. This enables intelligent language switcher interfaces that display accurate translation availability.

---

## Background and Context

### Current State
- The existing item API endpoint (`/api/items/[publicId]/route.ts`) returns item content in the original language only
- Client applications have no programmatic way to determine which language translations exist for an item
- Language switcher UIs cannot accurately display which translations are available without attempting to fetch each one individually
- Translation tables exist (`item_translations`, `article_translations`, `link_translations`) with language and status columns

### Why This Matters
- Guests need to know which languages have translations before selecting them
- Prevents user frustration from selecting languages that have no translations
- Enables intelligent language switching UI with availability indicators
- Provides transparency about translation coverage for content strategy decisions

### Dependencies
- **Database Tables:** `items`, `item_translations` (must exist - created in Epic 1)
- **Types:** `SupportedLocale` from `/src/lib/i18n/config.ts`, `LocaleMetadata` from same file
- **Existing Patterns:** Public API route pattern from `/api/items/[publicId]/route.ts`

---

## Technical Approach

### Architecture Decision
Create a dedicated sub-route under the public items endpoint following the established Next.js App Router pattern:
- **Route:** `GET /api/public/items/[publicId]/languages`
- **Response Type:** `LanguageAvailabilityResponse` as defined in the implementation plan

### Data Flow
```
Client Request → API Route → Validate publicId
                           ↓
                      Lookup Item (verify exists)
                           ↓
                      Query item_translations table
                           ↓
                      Build availability response
                           ↓
                      Return JSON with CORS headers
```

### Response Structure
```typescript
interface LanguageAvailabilityResponse {
  sourceLanguage: SupportedLocale;           // Original content language
  availableTranslations: SupportedLocale[];  // Completed translations
  pendingTranslations: SupportedLocale[];    // In-progress translations
  unavailableTranslations: SupportedLocale[];// No translation exists
  languages: {
    code: SupportedLocale;
    name: string;
    nativeName: string;
    flag?: string;
    status: 'source' | 'available' | 'pending' | 'unavailable';
    translatedAt?: string;  // ISO timestamp
    updatedAt?: string;     // ISO timestamp
  }[];
}
```

---

## Implementation Tasks

### Task 1: Create API Route File Structure
Create the new route file at the correct path within the Next.js App Router structure.

**File to Create:** `/src/app/api/public/items/[publicId]/languages/route.ts`

**Actions:**
1. Create directory structure `/src/app/api/public/items/[publicId]/languages/`
2. Create `route.ts` file with GET handler

### Task 2: Implement Item Validation Logic
Validate that the public item identifier exists before querying translations.

**Logic:**
1. Extract `publicId` from route params
2. Validate UUID format using existing regex pattern from codebase
3. Query `items` table for existence and get internal `id` and `source_language`
4. Return 404 if item not found with appropriate error message

### Task 3: Implement Translation Query
Query the `item_translations` table to get all translation records for the item.

**Database Query:**
```sql
SELECT
  language,
  translation_status,
  translated_at,
  updated_at
FROM item_translations
WHERE item_id = :itemId
ORDER BY language;
```

### Task 4: Build Response with Full Language List
Construct the response including all supported languages with their availability status.

**Logic:**
1. Import `locales`, `localeMetadata` from `/src/lib/i18n/config.ts`
2. Map all supported locales to include status information
3. Categorize each language as: `source`, `available`, `pending`, or `unavailable`
4. Include timestamps for translated languages

### Task 5: Add CORS Headers
Include proper CORS headers to allow client-side access from guest-facing domains.

**Headers to Include:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET`
- `Access-Control-Allow-Headers: Content-Type`

### Task 6: Add Error Handling
Implement comprehensive error handling for all failure scenarios.

**Error Cases:**
- Invalid publicId format → 400 Bad Request
- Item not found → 404 Not Found
- Database query failure → 500 Internal Server Error

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/public/items/[publicId]/languages/route.ts` | Main API route handler |

### Files to Reference (Read Only)

| File Path | Usage |
|-----------|-------|
| `/src/lib/supabase.ts` | Supabase client for database queries |
| `/src/lib/i18n/config.ts` | Locale constants and metadata |
| `/src/app/api/items/[publicId]/route.ts` | Reference pattern for route structure |
| `/src/app/api/items/[publicId]/reactions/route.ts` | Reference pattern for sub-routes |

### Database Tables (Read Only)

| Table | Columns Used |
|-------|-------------|
| `items` | `id`, `public_id`, `source_language`, `name` |
| `item_translations` | `item_id`, `language`, `translation_status`, `translated_at`, `updated_at` |

### Functions/Utilities to Import

| Source | Import |
|--------|--------|
| `next/server` | `NextRequest`, `NextResponse` |
| `@/lib/supabase` | `supabase` |
| `@/lib/i18n/config` | `locales`, `localeMetadata`, `SupportedLocale` |

---

## Code Implementation Specification

### Route Handler Structure

```typescript
// /src/app/api/public/items/[publicId]/languages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { locales, localeMetadata, SupportedLocale } from '@/lib/i18n/config';

// Response types
interface LanguageDetail {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag?: string;
  status: 'source' | 'available' | 'pending' | 'unavailable';
  translatedAt?: string | null;
  updatedAt?: string | null;
}

interface LanguageAvailabilityResponse {
  sourceLanguage: SupportedLocale;
  availableTranslations: SupportedLocale[];
  pendingTranslations: SupportedLocale[];
  unavailableTranslations: SupportedLocale[];
  languages: LanguageDetail[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  // Implementation here
}
```

### Validation Logic

```typescript
const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

if (!uuidRegex.test(publicId)) {
  return NextResponse.json(
    { success: false, error: 'Invalid publicId format', code: 'INVALID_PUBLIC_ID' },
    { status: 400 }
  );
}
```

### Response Building Logic

```typescript
// Build language details for all supported locales
const languageDetails: LanguageDetail[] = locales.map((code) => {
  const metadata = localeMetadata[code];
  const translation = translationMap.get(code);

  let status: LanguageDetail['status'];
  if (code === sourceLanguage) {
    status = 'source';
  } else if (translation?.translation_status === 'completed') {
    status = 'available';
  } else if (translation?.translation_status === 'pending') {
    status = 'pending';
  } else {
    status = 'unavailable';
  }

  return {
    code,
    name: metadata.name,
    nativeName: metadata.nativeName,
    flag: metadata.flag,
    status,
    translatedAt: translation?.translated_at || null,
    updatedAt: translation?.updated_at || null,
  };
});
```

---

## Testing Considerations

### Test Scenarios

1. **Valid item with translations**
   - Item exists with multiple completed translations
   - Response includes all languages with correct status

2. **Valid item with no translations**
   - Item exists but has no translation records
   - Response shows only source language as available

3. **Valid item with mixed translation status**
   - Some translations completed, some pending
   - Correct categorization in response arrays

4. **Invalid publicId format**
   - Returns 400 with appropriate error

5. **Non-existent item**
   - Returns 404 with appropriate error

6. **Database error**
   - Graceful error handling with 500 response

### Performance Expectations
- Query should complete in under 50ms (metadata only, no content fetch)
- Single database round trip for translations query

---

## Acceptance Criteria Checklist

- [ ] GET endpoint exists at `/api/public/items/[publicId]/languages`
- [ ] Endpoint accepts a public item identifier as URL path parameter
- [ ] Item lookup validates that public identifier exists before querying translations
- [ ] Endpoint returns 404 status code with appropriate error message when item not found
- [ ] Query retrieves all translation records from item_translations table
- [ ] Response includes item's source language as part of available languages list
- [ ] Response follows LanguageAvailabilityResponse format with consistent structure
- [ ] Each language entry includes language code as string value
- [ ] Each language entry includes human-readable language name for display
- [ ] Translation status metadata indicates whether translations are complete, partial, or pending
- [ ] Response includes timestamps showing when each translation was last updated
- [ ] Database query checks only translation metadata without fetching full content
- [ ] Query is optimized with appropriate filters
- [ ] Endpoint handles items with no translations gracefully
- [ ] Endpoint returns 400 status code when publicId format is invalid
- [ ] Endpoint returns appropriate HTTP status codes for server errors
- [ ] Response includes proper CORS headers for client-side access
- [ ] Error responses include helpful messages without exposing internal details
- [ ] All error scenarios handled gracefully without exposing stack traces

---

## Related Documents

- [gen_requests_epic4.md](./gen_requests_epic4.md) - Request #343
- [Plan-111-L10N-Epic4-Guest-Experience.md](./prd/Plan-111-L10N-Epic4-Guest-Experience.md) - Full implementation plan
- [REQ-342: Create Public Item API Endpoint with Translation Support](./REQ-342-create-public-item-api-endpoint-with-translation-overview.md) - Related item content endpoint
- [src/lib/i18n/config.ts](../src/lib/i18n/config.ts) - Locale configuration

---

## Notes

- This endpoint is read-only and queries translation metadata only
- No authentication required (public endpoint for guest access)
- The source language is determined from the `items.source_language` column
- If `source_language` is null on the item, default to 'en' (English)
- Translation status values expected: 'completed', 'pending', 'failed'
- Only 'completed' status translations should be marked as 'available'
