# REQ-343: Create Language Availability API Endpoint - Detailed Task Breakdown

**Document Created:** 2026-01-19 17:30:00 UTC
**Last Modified:** 2026-01-19 17:30:00 UTC
**Status:** Ready for Implementation
**Request Reference:** docs/gen_requests_epic4.md - Request #343
**Overview Document:** docs/REQ-343-create-language-availability-api-endpoint-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.3
**Size:** S (Small)
**Priority:** P2 - Medium
**Estimated Story Points:** 3

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for creating a public API endpoint that returns language availability information for items. The endpoint allows client applications to discover which language translations exist for a specific item before requesting translated content, enabling intelligent language switcher interfaces.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (i18n configuration exists)
- [ ] `item_translations` table exists with columns: `item_id`, `language`, `translation_status`, `translated_at`, `updated_at`
- [ ] `/src/lib/i18n/config.ts` exports: `locales`, `localeMetadata`, `SupportedLocale`
- [ ] `/src/lib/supabase.ts` exports: `supabase` client
- [ ] Existing route pattern reference: `/src/app/api/items/[publicId]/route.ts`

---

## Task Breakdown

### Task 1: Create Directory Structure
**Estimated Points:** 0.5
**Status:** Pending

Create the necessary directory structure for the new API route.

#### Steps:

1. **Create the parent directories**
   ```
   /src/app/api/public/items/[publicId]/languages/
   ```

2. **Verify path aligns with Next.js App Router conventions**
   - Confirm `[publicId]` is a dynamic segment
   - Ensure `languages` is a valid sub-route

#### Files to Create:
| Path | Type | Purpose |
|------|------|---------|
| `/src/app/api/public/items/[publicId]/languages/route.ts` | New File | Main API route handler |

#### Acceptance Criteria:
- [ ] Directory structure exists: `/src/app/api/public/items/[publicId]/languages/`
- [ ] `route.ts` file created with placeholder export

---

### Task 2: Define TypeScript Interfaces
**Estimated Points:** 0.5
**Status:** Pending

Define the response types for the endpoint within the route file.

#### Implementation:

```typescript
// Response types defined at the top of route.ts

/**
 * Details for a single language in the availability response
 */
interface LanguageDetail {
  /** ISO 639-1 language code */
  code: SupportedLocale;
  /** English name of the language */
  name: string;
  /** Native name of the language (e.g., "Français" for French) */
  nativeName: string;
  /** Optional flag emoji */
  flag?: string;
  /** Translation availability status */
  status: 'source' | 'available' | 'pending' | 'unavailable';
  /** ISO timestamp when translation was completed */
  translatedAt?: string | null;
  /** ISO timestamp when translation was last updated */
  updatedAt?: string | null;
}

/**
 * Complete response structure for language availability endpoint
 */
interface LanguageAvailabilityResponse {
  /** Original content language */
  sourceLanguage: SupportedLocale;
  /** Languages with completed translations */
  availableTranslations: SupportedLocale[];
  /** Languages with in-progress translations */
  pendingTranslations: SupportedLocale[];
  /** Languages without any translation */
  unavailableTranslations: SupportedLocale[];
  /** Full details for all supported languages */
  languages: LanguageDetail[];
}

/**
 * Error response structure
 */
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}
```

#### Acceptance Criteria:
- [ ] `LanguageDetail` interface defined with all required fields
- [ ] `LanguageAvailabilityResponse` interface defined
- [ ] `ErrorResponse` interface defined for error cases
- [ ] All fields have JSDoc comments

---

### Task 3: Implement GET Handler Skeleton
**Estimated Points:** 0.5
**Status:** Pending

Create the basic GET handler structure with proper Next.js patterns.

#### Implementation:

```typescript
// /src/app/api/public/items/[publicId]/languages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { locales, localeMetadata, SupportedLocale } from '@/lib/i18n/config';

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle OPTIONS preflight requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * GET /api/public/items/[publicId]/languages
 *
 * Returns available language translations for a specific item.
 * Allows clients to discover translation coverage before requesting content.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    // Implementation steps follow...

  } catch (error) {
    console.error('Language availability API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

#### Acceptance Criteria:
- [ ] GET handler exported with correct signature
- [ ] OPTIONS handler for CORS preflight
- [ ] CORS headers defined as constant
- [ ] Try-catch block wraps entire implementation
- [ ] Error logging in catch block

---

### Task 4: Implement PublicId Validation
**Estimated Points:** 0.5
**Status:** Pending

Add validation for the publicId parameter format.

#### Implementation:

```typescript
// Inside GET handler, after extracting publicId

// UUID v4 validation regex
const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

// Validate publicId is present
if (!publicId) {
  return NextResponse.json(
    {
      success: false,
      error: 'Public ID is required',
      code: 'MISSING_PUBLIC_ID'
    },
    { status: 400, headers: corsHeaders }
  );
}

// Validate publicId format
if (!uuidRegex.test(publicId)) {
  return NextResponse.json(
    {
      success: false,
      error: 'Invalid public ID format. Expected UUID.',
      code: 'INVALID_PUBLIC_ID'
    },
    { status: 400, headers: corsHeaders }
  );
}
```

#### Acceptance Criteria:
- [ ] Validates publicId is not null/undefined
- [ ] Validates publicId matches UUID format
- [ ] Returns 400 status for missing publicId
- [ ] Returns 400 status for invalid format
- [ ] Error responses include descriptive error codes

---

### Task 5: Implement Item Lookup
**Estimated Points:** 0.5
**Status:** Pending

Query the items table to verify the item exists and retrieve source language.

#### Implementation:

```typescript
// After publicId validation

// Fetch item to verify existence and get source language
const { data: item, error: itemError } = await supabase
  .from('items')
  .select('id, public_id, source_language, name')
  .eq('public_id', publicId)
  .single();

if (itemError || !item) {
  return NextResponse.json(
    {
      success: false,
      error: 'Item not found',
      code: 'ITEM_NOT_FOUND'
    },
    { status: 404, headers: corsHeaders }
  );
}

// Determine source language (default to 'en' if not set)
const sourceLanguage = (item.source_language as SupportedLocale) || 'en';
const itemId = item.id;
```

#### Acceptance Criteria:
- [ ] Queries `items` table by `public_id`
- [ ] Selects only required columns: `id`, `public_id`, `source_language`, `name`
- [ ] Returns 404 when item not found
- [ ] Extracts `source_language` with fallback to 'en'
- [ ] Stores internal `id` for translation query

---

### Task 6: Implement Translation Query
**Estimated Points:** 0.5
**Status:** Pending

Query the item_translations table to get all translation records for the item.

#### Implementation:

```typescript
// After item lookup

// Fetch all translation records for this item
const { data: translations, error: translationsError } = await supabase
  .from('item_translations')
  .select('language, translation_status, translated_at, updated_at')
  .eq('item_id', itemId)
  .order('language', { ascending: true });

if (translationsError) {
  console.error('Error fetching translations:', translationsError);
  return NextResponse.json(
    {
      success: false,
      error: 'Error fetching translation data',
      code: 'TRANSLATION_FETCH_ERROR'
    },
    { status: 500, headers: corsHeaders }
  );
}

// Create a map for quick lookup
const translationMap = new Map<SupportedLocale, {
  translation_status: string;
  translated_at: string | null;
  updated_at: string | null;
}>();

(translations || []).forEach((t) => {
  translationMap.set(t.language as SupportedLocale, {
    translation_status: t.translation_status,
    translated_at: t.translated_at,
    updated_at: t.updated_at,
  });
});
```

#### Acceptance Criteria:
- [ ] Queries `item_translations` by `item_id`
- [ ] Selects only metadata columns (no content)
- [ ] Orders results by language
- [ ] Creates Map for O(1) lookup
- [ ] Handles empty translations array gracefully
- [ ] Returns 500 on database error

---

### Task 7: Build Response Structure
**Estimated Points:** 1
**Status:** Pending

Construct the complete response with all language details and categorizations.

#### Implementation:

```typescript
// After translation query

// Categorize languages
const availableTranslations: SupportedLocale[] = [];
const pendingTranslations: SupportedLocale[] = [];
const unavailableTranslations: SupportedLocale[] = [];

// Build detailed language information for all supported locales
const languageDetails: LanguageDetail[] = locales.map((code) => {
  const metadata = localeMetadata[code];
  const translation = translationMap.get(code);

  let status: LanguageDetail['status'];

  if (code === sourceLanguage) {
    // Source language is always "available" as the original
    status = 'source';
    availableTranslations.push(code);
  } else if (translation?.translation_status === 'completed') {
    status = 'available';
    availableTranslations.push(code);
  } else if (translation?.translation_status === 'pending' ||
             translation?.translation_status === 'processing') {
    status = 'pending';
    pendingTranslations.push(code);
  } else {
    status = 'unavailable';
    unavailableTranslations.push(code);
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

// Construct final response
const response: LanguageAvailabilityResponse = {
  sourceLanguage,
  availableTranslations,
  pendingTranslations,
  unavailableTranslations,
  languages: languageDetails,
};

return NextResponse.json(response, {
  status: 200,
  headers: corsHeaders
});
```

#### Acceptance Criteria:
- [ ] Maps all supported locales to language details
- [ ] Correctly categorizes source language as 'source'
- [ ] Correctly categorizes 'completed' translations as 'available'
- [ ] Correctly categorizes 'pending'/'processing' as 'pending'
- [ ] Correctly categorizes missing/failed translations as 'unavailable'
- [ ] Includes locale metadata (name, nativeName, flag)
- [ ] Includes timestamps when available
- [ ] Returns 200 status on success

---

### Task 8: Add Error Handling Edge Cases
**Estimated Points:** 0.5
**Status:** Pending

Ensure all edge cases are handled gracefully.

#### Edge Cases to Handle:

1. **Item with no translations**
   - Only source language appears in `availableTranslations`
   - All other languages in `unavailableTranslations`

2. **Item with partial translations**
   - Mix of available, pending, unavailable

3. **Item with failed translations**
   - Failed status treated as 'unavailable'

4. **Source language is null in database**
   - Default to 'en'

5. **Database connection issues**
   - Return 500 with generic error message

#### Implementation:

```typescript
// Handle 'failed' status explicitly in the categorization
} else if (translation?.translation_status === 'failed') {
  status = 'unavailable';
  unavailableTranslations.push(code);
}
```

#### Acceptance Criteria:
- [ ] Items with no translations return valid response
- [ ] Failed translations categorized as unavailable
- [ ] Null source_language defaults to 'en'
- [ ] Database errors return 500 without stack traces
- [ ] No empty arrays cause runtime errors

---

## Complete Implementation Code

Below is the complete implementation for reference:

```typescript
// /src/app/api/public/items/[publicId]/languages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { locales, localeMetadata, SupportedLocale } from '@/lib/i18n/config';

// ============================================================================
// Types
// ============================================================================

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

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}

// ============================================================================
// Constants
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * Handle OPTIONS preflight requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * GET /api/public/items/[publicId]/languages
 *
 * Returns available language translations for a specific item.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing publicId
 * @returns LanguageAvailabilityResponse or ErrorResponse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
): Promise<NextResponse<LanguageAvailabilityResponse | ErrorResponse>> {
  try {
    const { publicId } = await params;

    // -------------------------------------------------------------------------
    // Validate publicId
    // -------------------------------------------------------------------------

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required', code: 'MISSING_PUBLIC_ID' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!UUID_REGEX.test(publicId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid public ID format. Expected UUID.', code: 'INVALID_PUBLIC_ID' },
        { status: 400, headers: corsHeaders }
      );
    }

    // -------------------------------------------------------------------------
    // Fetch item to verify existence and get source language
    // -------------------------------------------------------------------------

    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, public_id, source_language, name')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found', code: 'ITEM_NOT_FOUND' },
        { status: 404, headers: corsHeaders }
      );
    }

    const sourceLanguage = (item.source_language as SupportedLocale) || 'en';
    const itemId = item.id;

    // -------------------------------------------------------------------------
    // Fetch all translation records for this item
    // -------------------------------------------------------------------------

    const { data: translations, error: translationsError } = await supabase
      .from('item_translations')
      .select('language, translation_status, translated_at, updated_at')
      .eq('item_id', itemId)
      .order('language', { ascending: true });

    if (translationsError) {
      console.error('Error fetching translations:', translationsError);
      return NextResponse.json(
        { success: false, error: 'Error fetching translation data', code: 'TRANSLATION_FETCH_ERROR' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Create a map for O(1) lookup
    const translationMap = new Map<SupportedLocale, {
      translation_status: string;
      translated_at: string | null;
      updated_at: string | null;
    }>();

    (translations || []).forEach((t) => {
      translationMap.set(t.language as SupportedLocale, {
        translation_status: t.translation_status,
        translated_at: t.translated_at,
        updated_at: t.updated_at,
      });
    });

    // -------------------------------------------------------------------------
    // Build response
    // -------------------------------------------------------------------------

    const availableTranslations: SupportedLocale[] = [];
    const pendingTranslations: SupportedLocale[] = [];
    const unavailableTranslations: SupportedLocale[] = [];

    const languageDetails: LanguageDetail[] = locales.map((code) => {
      const metadata = localeMetadata[code];
      const translation = translationMap.get(code);

      let status: LanguageDetail['status'];

      if (code === sourceLanguage) {
        status = 'source';
        availableTranslations.push(code);
      } else if (translation?.translation_status === 'completed') {
        status = 'available';
        availableTranslations.push(code);
      } else if (
        translation?.translation_status === 'pending' ||
        translation?.translation_status === 'processing'
      ) {
        status = 'pending';
        pendingTranslations.push(code);
      } else {
        // Covers: 'failed', 'manual' (not completed), or no translation record
        status = 'unavailable';
        unavailableTranslations.push(code);
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

    const response: LanguageAvailabilityResponse = {
      sourceLanguage,
      availableTranslations,
      pendingTranslations,
      unavailableTranslations,
      languages: languageDetails,
    };

    return NextResponse.json(response, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Language availability API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

---

## Testing Plan

### Manual Testing Scenarios

| Scenario | Test Steps | Expected Result |
|----------|------------|-----------------|
| Valid item with translations | `GET /api/public/items/{validId}/languages` | 200, shows available languages |
| Valid item with no translations | `GET /api/public/items/{newItemId}/languages` | 200, only source in available |
| Invalid UUID format | `GET /api/public/items/not-a-uuid/languages` | 400, INVALID_PUBLIC_ID |
| Missing publicId | `GET /api/public/items//languages` | 400 or 404 |
| Non-existent item | `GET /api/public/items/{randomUuid}/languages` | 404, ITEM_NOT_FOUND |
| CORS preflight | `OPTIONS /api/public/items/{id}/languages` | 204 with CORS headers |

### Sample Test Requests

```bash
# Test with valid item
curl -X GET "http://localhost:3000/api/public/items/550e8400-e29b-41d4-a716-446655440000/languages"

# Test CORS preflight
curl -X OPTIONS "http://localhost:3000/api/public/items/550e8400-e29b-41d4-a716-446655440000/languages"

# Test invalid UUID
curl -X GET "http://localhost:3000/api/public/items/invalid-id/languages"

# Test non-existent item
curl -X GET "http://localhost:3000/api/public/items/00000000-0000-0000-0000-000000000000/languages"
```

### Expected Response Examples

**Success Response (Item with translations):**
```json
{
  "sourceLanguage": "en",
  "availableTranslations": ["en", "fr", "es"],
  "pendingTranslations": ["de"],
  "unavailableTranslations": ["nl", "it"],
  "languages": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "flag": "🇬🇧",
      "status": "source",
      "translatedAt": null,
      "updatedAt": null
    },
    {
      "code": "fr",
      "name": "French",
      "nativeName": "Français",
      "flag": "🇫🇷",
      "status": "available",
      "translatedAt": "2026-01-19T12:00:00Z",
      "updatedAt": "2026-01-19T12:00:00Z"
    }
    // ... other languages
  ]
}
```

**Error Response (Not Found):**
```json
{
  "success": false,
  "error": "Item not found",
  "code": "ITEM_NOT_FOUND"
}
```

---

## Performance Considerations

- **Database Query Optimization**:
  - Single query for item lookup (indexed by `public_id`)
  - Single query for translations (indexed by `item_id`)
  - No content columns fetched (metadata only)

- **Expected Performance**:
  - Target: < 50ms response time
  - Two database round trips maximum
  - No heavy computation

- **Caching Opportunities** (future enhancement):
  - Response could be cached with short TTL
  - Cache invalidation on translation status changes

---

## Security Considerations

- **Public Endpoint**: No authentication required (guest access)
- **Input Validation**: UUID format validated before database query
- **Error Messages**: Generic messages, no internal details exposed
- **CORS**: Open CORS policy for client-side access
- **SQL Injection**: Prevented by Supabase parameterized queries

---

## Acceptance Criteria Checklist

### Functional Requirements
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

### Technical Requirements
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

- [REQ-343 Overview](./REQ-343-create-language-availability-api-endpoint-overview.md)
- [Gen Requests Epic 4](./gen_requests_epic4.md) - Request #343
- [Implementation Plan](./prd/Plan-111-L10N-Epic4-Guest-Experience.md) - Phase 2, Task 2.3
- [REQ-342: Create Public Item API Endpoint](./REQ-342-create-public-item-api-endpoint-with-translation-overview.md) - Related endpoint

---

## Change Log

| Date | Author | Description |
|------|--------|-------------|
| 2026-01-19 | AI Assistant | Initial document creation |
