# Detailed Task Breakdown: REQ-251 - User Language Preference Update Endpoint

**Generated:** 2026-01-18 20:45:00 UTC
**Last Modified:** 2026-01-18 20:45:00 UTC
**Request Reference:** REQ-251 - User Language Preference Update Endpoint
**Overview Document:** REQ-251-add-language-preference-api-endpoint-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.6)
**Epic:** L10N Epic 1 - Foundation
**Phase:** 5 - Language Switching Infrastructure
**Task ID:** 5.6
**Size:** S (Small)
**Estimated Effort:** 1.5 hours

---

## Executive Summary

This task creates an API endpoint (`PUT /api/user/language`) that allows authenticated users to update their preferred language setting. The endpoint validates the submitted language code against the 6 supported languages (en, fr, es, de, nl, it), persists the preference to the user's profile in the database, and enables language preferences to persist across sessions and devices.

---

## Prerequisites

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| `users` table exists | ✅ Exists | Standard users table in Supabase |
| `preferred_language` column on users | ⚠️ Required | Must be added by Phase 1, Task 1.3 migration |
| `createSupabaseServer` function | ✅ Exists | `/src/lib/supabase-server.ts` |
| Supabase Auth configured | ✅ Exists | Authentication already working |

**Blocking Dependency:** The `preferred_language` column must be added to the `users` table (Task 1.3) before this endpoint will function. Without it, database updates will fail with a column not found error.

---

## Acceptance Criteria

From REQ-251:
- [ ] An authenticated user can submit a request to change their language preference
- [ ] The submitted language preference is validated against supported languages
- [ ] Successfully updated preferences are reflected immediately in subsequent requests
- [ ] Unauthenticated requests are rejected with appropriate status code (401)
- [ ] Invalid language codes are rejected with clear error messaging (400)
- [ ] The preference persists across user sessions and devices

---

## Technical Specification

### Endpoint Details

| Attribute | Value |
|-----------|-------|
| **Route** | `/api/user/language` |
| **Methods** | `GET`, `PUT` |
| **Authentication** | Required (Supabase Auth) |
| **Content-Type** | `application/json` |
| **File Location** | `/src/app/api/user/language/route.ts` |

### Supported Languages

| Code | English Name | Native Name |
|------|--------------|-------------|
| `en` | English | English |
| `fr` | French | Français |
| `es` | Spanish | Español |
| `de` | German | Deutsch |
| `nl` | Dutch | Nederlands |
| `it` | Italian | Italiano |

### Request/Response Contracts

#### PUT Request
```typescript
interface LanguageUpdateRequest {
  language: string;  // Language code (e.g., 'en', 'fr', 'es', 'de', 'nl', 'it')
}
```

#### GET Response (Success - 200)
```typescript
interface LanguageGetResponse {
  success: true;
  data: {
    language: string;           // Current language code
    supportedLanguages: string[]; // List of all supported codes
  };
}
```

#### PUT Response (Success - 200)
```typescript
interface LanguageUpdateSuccessResponse {
  success: true;
  data: {
    language: string;   // Updated language code
    updatedAt: string;  // ISO timestamp
  };
}
```

#### Error Response (400/401/500)
```typescript
interface LanguageErrorResponse {
  success: false;
  error: string;                 // Human-readable message
  code: string;                  // Machine-readable code
  supportedLanguages?: string[]; // Included for validation errors
}
```

### Error Code Reference

| HTTP Status | Error Code | Condition | Response Message |
|-------------|------------|-----------|------------------|
| 401 | `UNAUTHORIZED` | No valid authentication | "Authentication required" |
| 400 | `INVALID_BODY` | Malformed JSON | "Invalid JSON body" |
| 400 | `MISSING_LANGUAGE` | No language in body | "Language parameter is required" |
| 400 | `INVALID_LANGUAGE` | Unsupported language | "Language \"X\" is not supported" |
| 500 | `UPDATE_FAILED` | Database update error | "Failed to update language preference" |
| 500 | `FETCH_FAILED` | Database read error | "Failed to fetch language preference" |
| 500 | `INTERNAL_ERROR` | Unexpected error | "Internal server error" |

---

## Implementation Tasks

### Task 1: Create Route File Structure

**Story Points:** 0.5
**File:** `/src/app/api/user/language/route.ts`

**Description:** Create the new API route file with imports, constants, and type definitions.

**Implementation Steps:**

1. Create directory structure: `/src/app/api/user/language/`
2. Create `route.ts` file
3. Add imports for NextRequest, NextResponse, and createSupabaseServer
4. Define SUPPORTED_LANGUAGES constant matching i18n configuration
5. Define TypeScript interfaces for request/response types
6. Implement `isValidLanguage` type guard function

**Code to Implement:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Supported language codes (matches i18n configuration)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Type guard to check if a language code is supported
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
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Imports resolve correctly
- [ ] SUPPORTED_LANGUAGES matches the 6 supported locales

---

### Task 2: Implement GET Handler

**Story Points:** 0.5
**File:** `/src/app/api/user/language/route.ts`

**Description:** Implement GET endpoint to retrieve the authenticated user's current language preference.

**Implementation Steps:**

1. Create async GET function that accepts NextRequest
2. Create Supabase server client
3. Validate authentication using `supabase.auth.getUser()`
4. Return 401 if not authenticated
5. Query users table for preferred_language
6. Return current language (or 'en' default) with supported languages list

**Code to Implement:**

```typescript
/**
 * GET /api/user/language
 * Get the authenticated user's current preferred language
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

**Verification:**
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns current language preference or 'en' default
- [ ] Includes supportedLanguages array in response
- [ ] Handles database errors gracefully
- [ ] Logs errors with `[API]` prefix for filtering

---

### Task 3: Implement PUT Handler

**Story Points:** 1
**File:** `/src/app/api/user/language/route.ts`

**Description:** Implement PUT endpoint to update the authenticated user's language preference.

**Implementation Steps:**

1. Create async PUT function that accepts NextRequest
2. Create Supabase server client
3. Validate authentication using `supabase.auth.getUser()`
4. Parse and validate request JSON body
5. Validate language parameter exists
6. Normalize language code (lowercase, trim)
7. Validate language is in SUPPORTED_LANGUAGES
8. Update users table with new preferred_language
9. Return success response with updated language and timestamp

**Code to Implement:**

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
      console.log('[API] /api/user/language PUT: Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
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

    // Step 4: Normalize and validate language
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
      console.error('[API] /api/user/language PUT: Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update language preference', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Step 6: Return success response
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

**Verification:**
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 400 with INVALID_BODY for malformed JSON
- [ ] Returns 400 with MISSING_LANGUAGE for empty body
- [ ] Returns 400 with INVALID_LANGUAGE for unsupported codes
- [ ] Returns 500 for database errors
- [ ] Returns 200 with updated language and timestamp on success
- [ ] Normalizes language code (handles "FR", " fr ", etc.)
- [ ] Logs relevant information for debugging

---

### Task 4: Verify Build and TypeScript

**Story Points:** 0.25
**Files:** N/A (verification task)

**Description:** Ensure the new route compiles without errors and follows project patterns.

**Verification Steps:**

1. Run `npm run build` or `npx tsc --noEmit`
2. Verify no TypeScript errors in the new file
3. Verify imports resolve correctly
4. Check that the route follows existing patterns from `/src/app/api/user/stats/route.ts`

**Verification Checklist:**
- [ ] TypeScript compilation succeeds
- [ ] No linting errors
- [ ] Response format matches existing API patterns
- [ ] Authentication pattern matches `/src/app/api/user/stats/route.ts`

---

### Task 5: Manual Testing

**Story Points:** 0.5
**Files:** N/A (testing task)

**Description:** Manually test the endpoint to verify all acceptance criteria are met.

**Test Cases:**

#### Test 1: Unauthorized Access (GET)
```bash
curl -X GET http://localhost:3000/api/user/language
```
**Expected:** 401 with `{ success: false, error: "Authentication required", code: "UNAUTHORIZED" }`

#### Test 2: Unauthorized Access (PUT)
```bash
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -d '{"language": "fr"}'
```
**Expected:** 401 with `{ success: false, error: "Authentication required", code: "UNAUTHORIZED" }`

#### Test 3: Missing Language Parameter (authenticated)
```bash
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth_cookies>" \
  -d '{}'
```
**Expected:** 400 with `{ success: false, code: "MISSING_LANGUAGE", supportedLanguages: [...] }`

#### Test 4: Invalid Language Code (authenticated)
```bash
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth_cookies>" \
  -d '{"language": "xyz"}'
```
**Expected:** 400 with `{ success: false, code: "INVALID_LANGUAGE", supportedLanguages: [...] }`

#### Test 5: Valid Language Update (authenticated)
```bash
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth_cookies>" \
  -d '{"language": "fr"}'
```
**Expected:** 200 with `{ success: true, data: { language: "fr", updatedAt: "..." } }`

#### Test 6: Case Insensitive Language (authenticated)
```bash
curl -X PUT http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth_cookies>" \
  -d '{"language": "FR"}'
```
**Expected:** 200 with `{ success: true, data: { language: "fr", ... } }` (normalized to lowercase)

#### Test 7: Get Updated Language (authenticated)
```bash
curl -X GET http://localhost:3000/api/user/language \
  -H "Cookie: <auth_cookies>"
```
**Expected:** 200 with `{ success: true, data: { language: "fr", supportedLanguages: [...] } }`

#### Test 8: Persistence Across Sessions
1. Update language to "es"
2. Log out
3. Log back in
4. GET language preference
**Expected:** Returns "es" (persisted in database)

**Verification Checklist:**
- [ ] All 8 test cases pass
- [ ] Error messages are clear and helpful
- [ ] supportedLanguages is included in validation errors
- [ ] Language preference persists across sessions

---

## Complete File Implementation

**File:** `/src/app/api/user/language/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Supported language codes (matches i18n configuration)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Type guard to check if a language code is supported
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
      console.log('[API] /api/user/language PUT: Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
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

    // Step 4: Normalize and validate language
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
      console.error('[API] /api/user/language PUT: Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update language preference', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Step 6: Return success response
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

---

## Files Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/user/language/route.ts` | PUT/GET endpoint for user language preference |

### Modified Files

None - this is a new endpoint.

### Reference Files (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/user/stats/route.ts` | Reference for authentication pattern |
| `/src/lib/supabase-server.ts` | Server-side Supabase client factory |

---

## Integration Points

| Component | Integration Type | Notes |
|-----------|------------------|-------|
| `useLanguagePreference` hook (Task 5.4) | Consumer | Calls PUT endpoint to persist preference |
| `LocaleContext` (Task 5.5) | Consumer | May call endpoint for authenticated users |
| `LanguageSwitcher` (Task 5.3) | Indirect | Triggers preference save via hook/context |

---

## Security Considerations

1. **Authentication Required:** All endpoints require valid Supabase session
2. **User Isolation:** Users can only update their own preference (enforced by `user.id` match)
3. **Input Validation:** Language codes validated against whitelist before database update
4. **SQL Injection Prevention:** Using Supabase SDK with parameterized queries
5. **No Sensitive Data Exposure:** Only returns language preference, no PII

---

## Rollback Plan

If issues are discovered after deployment:

1. Delete the route file: `rm /src/app/api/user/language/route.ts`
2. Remove the directory: `rmdir /src/app/api/user/language`
3. Redeploy

The endpoint is additive and has no side effects on existing functionality.

---

## Definition of Done

- [ ] Route file created at `/src/app/api/user/language/route.ts`
- [ ] GET handler returns current language preference
- [ ] PUT handler updates language preference
- [ ] All validation cases handled (401, 400, 500)
- [ ] TypeScript compiles without errors
- [ ] Manual testing passes all 8 test cases
- [ ] Code follows existing patterns from `/src/app/api/user/stats/route.ts`
- [ ] Logging includes `[API]` prefix for filtering

---

## Notes

1. **SUPPORTED_LANGUAGES Duplication:** The language codes are defined locally in this file. Once the i18n configuration module is created (Phase 2, Task 2.2), consider importing from a shared constants file to avoid duplication.

2. **Database Column Requirement:** This endpoint depends on the `preferred_language` column being added to the `users` table (Task 1.3). Until that migration is applied, the endpoint will fail with a database error.

3. **Response Pattern:** The `{ success, data, error, code }` response format matches the existing pattern used throughout the FAQBNB API.

4. **Unused Request Parameter:** The `request` parameter in GET is currently unused but kept for consistency with Next.js API route patterns and potential future use (e.g., reading headers).

---

## References

- Request Document: `/docs/gen_requests.md` (Request #251)
- Overview Document: `/docs/REQ-251-add-language-preference-api-endpoint-overview.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Existing User API Pattern: `/src/app/api/user/stats/route.ts`
- Server Supabase Client: `/src/lib/supabase-server.ts`

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 5, Task 5.6*
