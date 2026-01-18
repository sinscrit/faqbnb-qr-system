# Implementation Breakdown: REQ-251 - User Language Preference Update Endpoint

**Generated:** 2026-01-18 19:30:00 UTC
**Last Modified:** 2026-01-18 19:30:00 UTC
**Request Reference:** REQ-251 - User Language Preference Update Endpoint
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.6)
**Epic:** L10N Epic 1 - Foundation
**Size:** S (Small)

---

## Overview

This document provides a detailed implementation breakdown for creating an API endpoint that allows authenticated users to update their preferred language setting. The endpoint will be a PUT route at `/api/user/language` that validates the submitted language code against supported languages and persists the preference to the user's profile in the database. This enables the language preference to persist across sessions and devices.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Server-side Supabase client | `/src/lib/supabase-server.ts` | Use `createSupabaseServer()` for authenticated database operations |
| User API route pattern | `/src/app/api/user/stats/route.ts` | Reference for authentication validation and response structure |
| API response format | `/src/app/api/user/properties/route.ts` | Reference for `{ success, data, error, code }` response pattern |
| Authentication validation | `/src/app/api/user/stats/route.ts:4-16` | Pattern for validating authenticated user via `supabase.auth.getUser()` |
| Error handling pattern | `/src/app/api/user/properties/route.ts:48-65` | Reference for returning proper HTTP status codes |

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `users` table | Database | Exists - users table in Supabase |
| `preferred_language` column | Database | Must be added (Phase 1, Task 1.3) |
| `createSupabaseServer` | Function | Exists - `/src/lib/supabase-server.ts` |
| `next/server` types | NPM | Exists - Next.js built-in |

### Integration Points

| Component | Integration Type | Notes |
|-----------|------------------|-------|
| `LocaleContext` (Task 5.5) | Consumer | Calls this endpoint to persist language changes for authenticated users |
| `LanguageSwitcher` (Task 5.3) | Indirect | May trigger this endpoint via LocaleContext |
| `useLanguagePreference` hook (Task 5.4) | Consumer | Calls this endpoint for database persistence |

---

## Requirements

### Functional Requirements

From REQ-251:
1. Authenticated users can submit a request to change their language preference
2. The submitted language preference is validated against supported languages
3. Successfully updated preferences are reflected immediately in subsequent requests
4. Unauthenticated requests are rejected with appropriate status code
5. Invalid language codes are rejected with clear error messaging
6. The preference persists across user sessions and devices

### Acceptance Criteria

- [ ] An authenticated user can submit a request to change their language preference
- [ ] The submitted language preference is validated against supported languages
- [ ] Successfully updated preferences are reflected immediately in subsequent requests
- [ ] Unauthenticated requests are rejected with appropriate status code (401)
- [ ] Invalid language codes are rejected with clear error messaging (400)
- [ ] The preference persists across user sessions and devices

### Supported Languages

| Code | English Name | Native Name |
|------|--------------|-------------|
| `en` | English | English |
| `fr` | French | Francais |
| `es` | Spanish | Espanol |
| `de` | German | Deutsch |
| `nl` | Dutch | Nederlands |
| `it` | Italian | Italiano |

---

## Architecture

### Endpoint Specification

| Attribute | Value |
|-----------|-------|
| **Route** | `/api/user/language` |
| **Method** | `PUT` |
| **Authentication** | Required (Supabase Auth) |
| **Content-Type** | `application/json` |

### Request Format

```typescript
interface LanguageUpdateRequest {
  language: string;  // Language code (e.g., 'en', 'fr', 'es', 'de', 'nl', 'it')
}
```

### Response Format

**Success (200):**
```typescript
interface LanguageUpdateSuccessResponse {
  success: true;
  data: {
    language: string;        // The updated language code
    updatedAt: string;       // ISO timestamp of the update
  };
}
```

**Error (400 - Invalid Language):**
```typescript
interface LanguageUpdateErrorResponse {
  success: false;
  error: string;             // Human-readable error message
  code: string;              // Machine-readable error code
  supportedLanguages?: string[];  // List of valid language codes
}
```

**Error (401 - Unauthorized):**
```typescript
interface UnauthorizedResponse {
  success: false;
  error: string;
  code: 'UNAUTHORIZED';
}
```

### Data Flow

```
Client Request (PUT /api/user/language)
       |
       v
Parse JSON body
       |
       v
Validate authentication
       |--- Fail --> Return 401 Unauthorized
       |
       v
Validate language code
       |--- Fail --> Return 400 Bad Request with supported languages
       |
       v
Update users table (preferred_language column)
       |--- Fail --> Return 500 Internal Server Error
       |
       v
Return 200 Success with updated data
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/user/language/route.ts` | PUT endpoint for updating user language preference |

### Existing Files to Modify

None - this is a new endpoint.

### Files for Reference Only (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/user/stats/route.ts` | Reference for authentication pattern using `createSupabaseServer` |
| `/src/app/api/user/properties/route.ts` | Reference for response format and error handling |
| `/src/lib/supabase-server.ts` | Server-side Supabase client factory |
| `/src/lib/supabase.ts` | Database types (will need to reference once `preferred_language` is added) |

---

## Implementation Tasks

### Task 1: Create Directory and Route File

**Location:** `/src/app/api/user/language/route.ts`

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Supported language codes (same as in i18n config)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Check if a language code is supported
 */
function isValidLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
}

// Response interfaces
interface SuccessResponse {
  success: true;
  data: {
    language: string;
    updatedAt: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  supportedLanguages?: string[];
}

type ApiResponse = SuccessResponse | ErrorResponse;
```

**Acceptance Criteria:**
- [ ] File is created at correct path
- [ ] Imports are correctly configured
- [ ] SUPPORTED_LANGUAGES constant matches i18n configuration
- [ ] Type guard function is implemented
- [ ] Response interfaces are defined

---

### Task 2: Implement PUT Handler

**Location:** `/src/app/api/user/language/route.ts`

**Implementation:**
```typescript
/**
 * PUT /api/user/language
 * Update the authenticated user's preferred language
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createSupabaseServer();

    // Step 1: Validate authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[API] /api/user/language: Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Step 2: Parse and validate request body
    let body: { language?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', code: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { language } = body;

    // Step 3: Validate language parameter exists
    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: 'Language parameter is required',
          code: 'MISSING_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LANGUAGES],
        },
        { status: 400 }
      );
    }

    // Step 4: Validate language is supported
    const normalizedLanguage = language.toLowerCase().trim();
    if (!isValidLanguage(normalizedLanguage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Language "${language}" is not supported`,
          code: 'INVALID_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LANGUAGES],
        },
        { status: 400 }
      );
    }

    // Step 5: Update user's preferred language in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        preferred_language: normalizedLanguage,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[API] /api/user/language: Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update language preference', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Step 6: Return success response
    const updatedAt = new Date().toISOString();
    console.log('[API] /api/user/language: Language updated', {
      userId: user.id,
      language: normalizedLanguage,
      updatedAt
    });

    return NextResponse.json({
      success: true,
      data: {
        language: normalizedLanguage,
        updatedAt,
      },
    });

  } catch (error) {
    console.error('[API] /api/user/language: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 400 for missing language parameter
- [ ] Returns 400 for unsupported language codes with list of valid options
- [ ] Returns 500 for database errors
- [ ] Returns 200 with updated language and timestamp on success
- [ ] Normalizes language code (lowercase, trimmed)
- [ ] Logs relevant information for debugging

---

### Task 3: Add Optional GET Handler for Current Language

**Location:** `/src/app/api/user/language/route.ts`

**Implementation:**
```typescript
/**
 * GET /api/user/language
 * Get the authenticated user's current preferred language
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServer();

    // Validate authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get user's current language preference
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('[API] /api/user/language GET: Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch language preference', code: 'FETCH_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        language: userData?.preferred_language || 'en',
        supportedLanguages: [...SUPPORTED_LANGUAGES],
      },
    });

  } catch (error) {
    console.error('[API] /api/user/language GET: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns current language preference (or 'en' default)
- [ ] Includes list of supported languages in response
- [ ] Handles database errors gracefully

---

### Task 4: Complete Route File Assembly

**File:** `/src/app/api/user/language/route.ts`

**Complete Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Supported language codes (matches i18n configuration)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Check if a language code is supported
 */
function isValidLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
}

// Response interfaces
interface SuccessResponse {
  success: true;
  data: {
    language: string;
    updatedAt?: string;
    supportedLanguages?: string[];
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  supportedLanguages?: string[];
}

type ApiResponse = SuccessResponse | ErrorResponse;

/**
 * GET /api/user/language
 * Get the authenticated user's current preferred language
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('[API] /api/user/language GET: Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch language preference', code: 'FETCH_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        language: userData?.preferred_language || 'en',
        supportedLanguages: [...SUPPORTED_LANGUAGES],
      },
    });

  } catch (error) {
    console.error('[API] /api/user/language GET: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/language
 * Update the authenticated user's preferred language
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createSupabaseServer();

    // Validate authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[API] /api/user/language PUT: Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse request body
    let body: { language?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', code: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { language } = body;

    // Validate language parameter exists
    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: 'Language parameter is required',
          code: 'MISSING_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LANGUAGES],
        },
        { status: 400 }
      );
    }

    // Validate language is supported
    const normalizedLanguage = language.toLowerCase().trim();
    if (!isValidLanguage(normalizedLanguage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Language "${language}" is not supported`,
          code: 'INVALID_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LANGUAGES],
        },
        { status: 400 }
      );
    }

    // Update user's preferred language in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        preferred_language: normalizedLanguage,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[API] /api/user/language PUT: Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update language preference', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Return success response
    const updatedAt = new Date().toISOString();
    console.log('[API] /api/user/language PUT: Language updated', {
      userId: user.id,
      language: normalizedLanguage,
      updatedAt
    });

    return NextResponse.json({
      success: true,
      data: {
        language: normalizedLanguage,
        updatedAt,
      },
    });

  } catch (error) {
    console.error('[API] /api/user/language PUT: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] File compiles without TypeScript errors
- [ ] Both GET and PUT handlers are exported
- [ ] Follows existing API patterns in the codebase
- [ ] Uses server-side Supabase client for authentication

---

## Error Handling

| Scenario | HTTP Status | Error Code | Response |
|----------|-------------|------------|----------|
| No authentication | 401 | `UNAUTHORIZED` | "Authentication required" |
| Invalid JSON body | 400 | `INVALID_BODY` | "Invalid JSON body" |
| Missing language parameter | 400 | `MISSING_LANGUAGE` | "Language parameter is required" + supported list |
| Unsupported language | 400 | `INVALID_LANGUAGE` | "Language X is not supported" + supported list |
| Database update failure | 500 | `UPDATE_FAILED` | "Failed to update language preference" |
| Database fetch failure | 500 | `FETCH_FAILED` | "Failed to fetch language preference" |
| Unexpected error | 500 | `INTERNAL_ERROR` | "Internal server error" |

---

## Testing Considerations

### Manual Testing

1. **Authentication Test:**
   - Call PUT without auth header -> Expect 401
   - Call GET without auth header -> Expect 401

2. **Validation Test:**
   - PUT with empty body -> Expect 400 with MISSING_LANGUAGE
   - PUT with `{ language: "xyz" }` -> Expect 400 with INVALID_LANGUAGE
   - PUT with `{ language: "FR" }` -> Expect 200 (case-insensitive)

3. **Success Test:**
   - PUT with `{ language: "fr" }` -> Expect 200
   - GET after PUT -> Expect language to be "fr"

4. **Persistence Test:**
   - Log out and log back in
   - GET -> Expect language to still be "fr"

### cURL Examples

```bash
# Test unauthorized access
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -d '{"language": "fr"}'
# Expected: 401 Unauthorized

# Test missing language
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{}'
# Expected: 400 Missing language

# Test invalid language
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"language": "xyz"}'
# Expected: 400 Invalid language

# Test valid update
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"language": "fr"}'
# Expected: 200 Success

# Test get current language
curl -X GET http://localhost:3000/api/user/language \
  -H "Authorization: Bearer <token>"
# Expected: 200 with current language
```

---

## Dependencies on Other Tasks

| Task | Dependency Type | Notes |
|------|-----------------|-------|
| Task 1.3 (preferred_language column) | **Required** | Database column must exist before this endpoint works |
| Task 1.5 (TypeScript database types) | Recommended | Types should include preferred_language for type safety |

### Pre-requisite Database Migration

The `preferred_language` column must be added to the `users` table before this endpoint can function:

```sql
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
```

This is covered by Phase 1, Task 1.3 of the implementation plan.

---

## Security Considerations

1. **Authentication Required:** All endpoints require valid Supabase authentication
2. **User Isolation:** Users can only update their own language preference (enforced by user.id match)
3. **Input Validation:** Language codes are validated against whitelist before database update
4. **No SQL Injection:** Using Supabase SDK with parameterized queries

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Create route file with imports and types | 15 minutes |
| Implement PUT handler | 30 minutes |
| Implement GET handler | 15 minutes |
| Testing and fixes | 30 minutes |
| **Total** | **1.5 hours** |

---

## Notes

1. **SUPPORTED_LANGUAGES Constant:** The language codes are duplicated here from the i18n configuration. Consider importing from a shared constants file (`/src/lib/i18n/config.ts`) once that file is created in Phase 2.

2. **Database Column Requirement:** This endpoint will fail with a database error until Task 1.3 (add preferred_language column) is completed. The error message will indicate the column doesn't exist.

3. **Response Format Consistency:** The response format follows the existing pattern used in `/api/user/properties` with `{ success, data, error, code }` structure.

4. **Logging:** Debug logs are prefixed with `[API]` and include the endpoint path for easy filtering in logs.

---

## References

- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Existing User API: `/src/app/api/user/stats/route.ts`
- Server Supabase Client: `/src/lib/supabase-server.ts`
- Database Types: `/src/lib/supabase.ts`
- LocaleContext (Consumer): `/src/contexts/LocaleContext.tsx` (Task 5.5)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Task 5.6*
