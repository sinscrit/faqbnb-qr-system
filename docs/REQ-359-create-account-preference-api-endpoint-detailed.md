# REQ-359: Create Account Language Preference API Endpoint - Detailed Task Breakdown

**Document Created:** 2026-01-19 15:30 UTC
**Last Modified:** 2026-01-19 15:30 UTC
**Request ID:** REQ-359
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.2
**Overview Document:** `/docs/REQ-359-create-account-preference-api-endpoint-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the Account Language Preference API endpoint. The endpoint allows property owners and account administrators to persist their preferred interface language to the database. This API is a critical backend component consumed by the LanguagePreferenceSection UI component (REQ-358).

**Estimated Effort:** 6 tasks (~1-2 story points total)
**Dependencies:** None blocking - all required infrastructure exists
**Output:** Single file creation at `/src/app/api/accounts/[accountId]/preferences/route.ts`

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] `accounts.preferred_language` column exists (confirmed in `/src/lib/supabase.ts:59`)
- [ ] `account_users` table exists for membership validation
- [ ] `createSupabaseServer` function available in `/src/lib/supabase-server.ts`
- [ ] `isValidLocale` and `SUPPORTED_LOCALES` exported from `/src/lib/i18n/config.ts`

---

## Task Breakdown

### Task 1: Create API Route Directory and File Structure

**Story Points:** 0.25
**Type:** Setup
**File to Create:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

#### Steps:

1.1. Create the directory structure:
```
/src/app/api/accounts/[accountId]/preferences/
```

1.2. Create the `route.ts` file with the following initial structure:

```typescript
// /src/app/api/accounts/[accountId]/preferences/route.ts
// REQ-359: Account Language Preference API Endpoint
// Epic: L10N Epic 5 - Owner Translation Management
// Phase: 6 - Language Preference Setting
// Task ID: 6.2
// Last Modified: 2026-01-19

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { SUPPORTED_LOCALES, isValidLocale, SupportedLocale } from '@/lib/i18n/config';

// TODO: Add response interfaces (Task 2)
// TODO: Add validation helper (Task 3)
// TODO: Add PUT handler (Task 4)
```

#### Acceptance Criteria:
- [ ] Directory `/src/app/api/accounts/[accountId]/preferences/` exists
- [ ] File `route.ts` exists with correct header comments
- [ ] All required imports are present and valid

---

### Task 2: Define TypeScript Interfaces for Request/Response Types

**Story Points:** 0.25
**Type:** Implementation
**File:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

#### Steps:

2.1. Add the request body interface:

```typescript
/**
 * Request body for updating account language preference
 */
interface UpdateAccountPreferencesRequest {
  preferredLanguage: string;
}
```

2.2. Add success response interface:

```typescript
/**
 * Successful response payload
 */
interface SuccessResponse {
  success: true;
  data: {
    accountId: string;
    preferredLanguage: string;
    updatedAt: string;
  };
}
```

2.3. Add error response interface:

```typescript
/**
 * Error response payload
 */
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  supportedLanguages?: string[];
}
```

2.4. Add union type for API responses:

```typescript
/**
 * Union type for all possible API responses
 */
type ApiResponse = SuccessResponse | ErrorResponse;
```

#### Acceptance Criteria:
- [ ] `UpdateAccountPreferencesRequest` interface defined
- [ ] `SuccessResponse` interface matches overview specification
- [ ] `ErrorResponse` interface includes code and optional supportedLanguages
- [ ] `ApiResponse` union type created for NextResponse typing

---

### Task 3: Implement Account Permission Validation Helper

**Story Points:** 0.5
**Type:** Implementation
**File:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

#### Steps:

3.1. Create the `validateAccountPermission` helper function following the pattern from `/src/app/api/admin/accounts/[accountId]/route.ts:62-80`:

```typescript
/**
 * Validates that a user has permission to modify account preferences.
 * User must have 'owner' or 'admin' role in the account_users table.
 *
 * @param supabase - Server-side Supabase client
 * @param userId - The authenticated user's ID
 * @param accountId - The account ID to check permission for
 * @returns Object with hasAccess (membership exists) and hasPermission (can modify)
 */
async function validateAccountPermission(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string,
  accountId: string
): Promise<{ hasAccess: boolean; hasPermission: boolean }> {
  try {
    const { data: membership, error } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      return { hasAccess: false, hasPermission: false };
    }

    // Only owner and admin roles can modify account preferences
    const hasPermission = membership.role === 'owner' || membership.role === 'admin';
    return { hasAccess: true, hasPermission };
  } catch (error) {
    console.error('[API] validateAccountPermission: Unexpected error:', error);
    return { hasAccess: false, hasPermission: false };
  }
}
```

#### Acceptance Criteria:
- [ ] Function queries `account_users` table correctly
- [ ] Returns `hasAccess: false` when no membership exists
- [ ] Returns `hasPermission: true` only for 'owner' or 'admin' roles
- [ ] Returns `hasPermission: false` for 'member' or other roles
- [ ] Handles database errors gracefully (returns false, doesn't throw)
- [ ] Logs errors for debugging

---

### Task 4: Implement PUT Handler with Authentication and Validation

**Story Points:** 0.75
**Type:** Implementation
**File:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

#### Steps:

4.1. Create the PUT handler function signature following Next.js 15 App Router pattern:

```typescript
/**
 * PUT /api/accounts/[accountId]/preferences
 * Update account's preferred language setting
 *
 * Authentication: Required (Supabase auth)
 * Authorization: User must be owner or admin of the account
 *
 * Request Body: { preferredLanguage: string }
 * Success Response (200): { success: true, data: { accountId, preferredLanguage, updatedAt } }
 * Error Responses: 400, 401, 403, 500
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<ApiResponse>> {
  // Implementation steps below
}
```

4.2. Implement Step 1 - Extract accountId and create Supabase client:

```typescript
try {
  const { accountId } = await params;
  const supabase = await createSupabaseServer();
```

4.3. Implement Step 2 - Validate authentication:

```typescript
  // Step 1: Validate authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log('[API] /api/accounts/[accountId]/preferences PUT: Unauthorized request');
    return NextResponse.json(
      { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
```

4.4. Implement Step 3 - Validate account access and permission:

```typescript
  // Step 2: Validate account access and permission
  const { hasAccess, hasPermission } = await validateAccountPermission(
    supabase,
    user.id,
    accountId
  );

  if (!hasAccess) {
    console.log('[API] /api/accounts/[accountId]/preferences PUT: Access denied', {
      userId: user.id,
      accountId
    });
    return NextResponse.json(
      { success: false, error: 'Access denied to this account', code: 'ACCESS_DENIED' },
      { status: 403 }
    );
  }

  if (!hasPermission) {
    console.log('[API] /api/accounts/[accountId]/preferences PUT: Insufficient permissions', {
      userId: user.id,
      accountId
    });
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to modify account preferences', code: 'INSUFFICIENT_PERMISSIONS' },
      { status: 403 }
    );
  }
```

4.5. Implement Step 4 - Parse and validate request body:

```typescript
  // Step 3: Parse and validate request body
  let body: UpdateAccountPreferencesRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body', code: 'INVALID_BODY' },
      { status: 400 }
    );
  }

  const { preferredLanguage } = body;

  if (!preferredLanguage) {
    return NextResponse.json(
      {
        success: false,
        error: 'preferredLanguage is required',
        code: 'MISSING_LANGUAGE',
        supportedLanguages: [...SUPPORTED_LOCALES],
      },
      { status: 400 }
    );
  }
```

4.6. Implement Step 5 - Validate language code:

```typescript
  // Step 4: Validate language code
  const normalizedLanguage = preferredLanguage.toLowerCase().trim();
  if (!isValidLocale(normalizedLanguage)) {
    return NextResponse.json(
      {
        success: false,
        error: `Language "${preferredLanguage}" is not supported`,
        code: 'INVALID_LANGUAGE',
        supportedLanguages: [...SUPPORTED_LOCALES],
      },
      { status: 400 }
    );
  }
```

#### Acceptance Criteria:
- [ ] PUT handler uses correct Next.js 15 params pattern (`params: Promise<{ accountId: string }>`)
- [ ] Returns 401 with code 'UNAUTHORIZED' when user is not authenticated
- [ ] Returns 403 with code 'ACCESS_DENIED' when user has no account membership
- [ ] Returns 403 with code 'INSUFFICIENT_PERMISSIONS' when user is not owner/admin
- [ ] Returns 400 with code 'INVALID_BODY' for malformed JSON
- [ ] Returns 400 with code 'MISSING_LANGUAGE' when preferredLanguage is missing
- [ ] Returns 400 with code 'INVALID_LANGUAGE' when language is not supported
- [ ] Error responses for invalid language include `supportedLanguages` array
- [ ] Language input is normalized (lowercase, trimmed)

---

### Task 5: Implement Database Update Logic

**Story Points:** 0.5
**Type:** Implementation
**File:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

#### Steps:

5.1. Add the database update step after language validation:

```typescript
  // Step 5: Update account preference
  const updatedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      preferred_language: normalizedLanguage,
      updated_at: updatedAt,
    })
    .eq('id', accountId);

  if (updateError) {
    console.error('[API] /api/accounts/[accountId]/preferences PUT: Database update error:', {
      accountId,
      userId: user.id,
      error: updateError.message,
      code: updateError.code
    });
    return NextResponse.json(
      { success: false, error: 'Failed to update account preference', code: 'UPDATE_FAILED' },
      { status: 500 }
    );
  }
```

5.2. Add the success response:

```typescript
  // Step 6: Return success response
  console.log('[API] /api/accounts/[accountId]/preferences PUT: Preference updated', {
    accountId,
    preferredLanguage: normalizedLanguage,
    updatedBy: user.id,
    updatedAt,
  });

  return NextResponse.json({
    success: true,
    data: {
      accountId,
      preferredLanguage: normalizedLanguage,
      updatedAt,
    },
  });
```

#### Acceptance Criteria:
- [ ] Updates `preferred_language` column in `accounts` table
- [ ] Updates `updated_at` timestamp
- [ ] Uses `.eq('id', accountId)` filter correctly
- [ ] Returns 500 with code 'UPDATE_FAILED' on database error
- [ ] Returns 200 with success response on successful update
- [ ] Success response includes accountId, preferredLanguage, and updatedAt
- [ ] Logs successful updates with relevant context

---

### Task 6: Implement Global Error Handler

**Story Points:** 0.25
**Type:** Implementation
**File:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

#### Steps:

6.1. Add the catch block at the end of the PUT handler:

```typescript
  } catch (error) {
    console.error('[API] /api/accounts/[accountId]/preferences PUT: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

#### Acceptance Criteria:
- [ ] Catch block handles any uncaught exceptions
- [ ] Returns 500 status with generic error message
- [ ] Returns structured error response with code 'INTERNAL_ERROR'
- [ ] Logs the full error for debugging
- [ ] Does not expose internal error details to client

---

## Complete Implementation Code

Below is the complete implementation for reference and verification:

```typescript
// /src/app/api/accounts/[accountId]/preferences/route.ts
// REQ-359: Account Language Preference API Endpoint
// Epic: L10N Epic 5 - Owner Translation Management
// Phase: 6 - Language Preference Setting
// Task ID: 6.2
// Last Modified: 2026-01-19

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { SUPPORTED_LOCALES, isValidLocale } from '@/lib/i18n/config';

// ============================================================
// Type Definitions
// ============================================================

/**
 * Request body for updating account language preference
 */
interface UpdateAccountPreferencesRequest {
  preferredLanguage: string;
}

/**
 * Successful response payload
 */
interface SuccessResponse {
  success: true;
  data: {
    accountId: string;
    preferredLanguage: string;
    updatedAt: string;
  };
}

/**
 * Error response payload
 */
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  supportedLanguages?: string[];
}

/**
 * Union type for all possible API responses
 */
type ApiResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Validates that a user has permission to modify account preferences.
 * User must have 'owner' or 'admin' role in the account_users table.
 *
 * @param supabase - Server-side Supabase client
 * @param userId - The authenticated user's ID
 * @param accountId - The account ID to check permission for
 * @returns Object with hasAccess (membership exists) and hasPermission (can modify)
 */
async function validateAccountPermission(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string,
  accountId: string
): Promise<{ hasAccess: boolean; hasPermission: boolean }> {
  try {
    const { data: membership, error } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      return { hasAccess: false, hasPermission: false };
    }

    // Only owner and admin roles can modify account preferences
    const hasPermission = membership.role === 'owner' || membership.role === 'admin';
    return { hasAccess: true, hasPermission };
  } catch (error) {
    console.error('[API] validateAccountPermission: Unexpected error:', error);
    return { hasAccess: false, hasPermission: false };
  }
}

// ============================================================
// API Route Handler
// ============================================================

/**
 * PUT /api/accounts/[accountId]/preferences
 * Update account's preferred language setting
 *
 * Authentication: Required (Supabase auth)
 * Authorization: User must be owner or admin of the account
 *
 * Request Body: { preferredLanguage: string }
 * Success Response (200): { success: true, data: { accountId, preferredLanguage, updatedAt } }
 * Error Responses: 400, 401, 403, 500
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { accountId } = await params;
    const supabase = await createSupabaseServer();

    // Step 1: Validate authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[API] /api/accounts/[accountId]/preferences PUT: Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Step 2: Validate account access and permission
    const { hasAccess, hasPermission } = await validateAccountPermission(
      supabase,
      user.id,
      accountId
    );

    if (!hasAccess) {
      console.log('[API] /api/accounts/[accountId]/preferences PUT: Access denied', {
        userId: user.id,
        accountId
      });
      return NextResponse.json(
        { success: false, error: 'Access denied to this account', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    if (!hasPermission) {
      console.log('[API] /api/accounts/[accountId]/preferences PUT: Insufficient permissions', {
        userId: user.id,
        accountId
      });
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to modify account preferences', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    // Step 3: Parse and validate request body
    let body: UpdateAccountPreferencesRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', code: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { preferredLanguage } = body;

    if (!preferredLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: 'preferredLanguage is required',
          code: 'MISSING_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LOCALES],
        },
        { status: 400 }
      );
    }

    // Step 4: Validate language code
    const normalizedLanguage = preferredLanguage.toLowerCase().trim();
    if (!isValidLocale(normalizedLanguage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Language "${preferredLanguage}" is not supported`,
          code: 'INVALID_LANGUAGE',
          supportedLanguages: [...SUPPORTED_LOCALES],
        },
        { status: 400 }
      );
    }

    // Step 5: Update account preference
    const updatedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        preferred_language: normalizedLanguage,
        updated_at: updatedAt,
      })
      .eq('id', accountId);

    if (updateError) {
      console.error('[API] /api/accounts/[accountId]/preferences PUT: Database update error:', {
        accountId,
        userId: user.id,
        error: updateError.message,
        code: updateError.code
      });
      return NextResponse.json(
        { success: false, error: 'Failed to update account preference', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Step 6: Return success response
    console.log('[API] /api/accounts/[accountId]/preferences PUT: Preference updated', {
      accountId,
      preferredLanguage: normalizedLanguage,
      updatedBy: user.id,
      updatedAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        accountId,
        preferredLanguage: normalizedLanguage,
        updatedAt,
      },
    });

  } catch (error) {
    console.error('[API] /api/accounts/[accountId]/preferences PUT: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

---

## Testing Guidance

### Manual Test Scenarios

| # | Scenario | Request | Expected Response |
|---|----------|---------|-------------------|
| 1 | Unauthenticated user | PUT without auth | 401, code: UNAUTHORIZED |
| 2 | User not in account | PUT with valid auth, wrong accountId | 403, code: ACCESS_DENIED |
| 3 | User is member (not owner/admin) | PUT as 'member' role | 403, code: INSUFFICIENT_PERMISSIONS |
| 4 | Owner updates preference | PUT with valid language | 200, success: true |
| 5 | Admin updates preference | PUT with valid language | 200, success: true |
| 6 | Missing preferredLanguage | PUT with empty body | 400, code: MISSING_LANGUAGE |
| 7 | Invalid JSON body | PUT with malformed JSON | 400, code: INVALID_BODY |
| 8 | Unsupported language | PUT with 'zz' language | 400, code: INVALID_LANGUAGE |
| 9 | Language with spaces | PUT with '  EN  ' | 200, normalizes to 'en' |
| 10 | Database error | Simulate DB failure | 500, code: UPDATE_FAILED |

### cURL Examples

```bash
# Test 1: Successful preference update
curl -X PUT http://localhost:3000/api/accounts/{accountId}/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth_cookie>" \
  -d '{"preferredLanguage": "fr"}'

# Test 2: Invalid language
curl -X PUT http://localhost:3000/api/accounts/{accountId}/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth_cookie>" \
  -d '{"preferredLanguage": "invalid"}'

# Test 3: Missing preferredLanguage
curl -X PUT http://localhost:3000/api/accounts/{accountId}/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth_cookie>" \
  -d '{}'
```

---

## Error Code Reference

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_BODY | Request body is not valid JSON |
| 400 | MISSING_LANGUAGE | preferredLanguage field is missing |
| 400 | INVALID_LANGUAGE | preferredLanguage is not a supported locale |
| 401 | UNAUTHORIZED | User is not authenticated |
| 403 | ACCESS_DENIED | User does not have membership to the account |
| 403 | INSUFFICIENT_PERMISSIONS | User is member but not owner/admin |
| 500 | UPDATE_FAILED | Database update operation failed |
| 500 | INTERNAL_ERROR | Unexpected server error |

---

## Files Modified/Created Summary

| Action | File Path | Purpose |
|--------|-----------|---------|
| CREATE | `/src/app/api/accounts/[accountId]/preferences/route.ts` | Main API endpoint |

**No modifications to existing files required.**

---

## Acceptance Criteria Mapping (from PRD)

| PRD Acceptance Criteria | Task |
|-------------------------|------|
| PUT endpoint exists at specified path | Task 1 |
| Endpoint accepts JSON with preferredLanguage | Task 4 |
| Validates authenticated user has permission | Tasks 3, 4 |
| Returns 401 for unauthenticated | Task 4 |
| Returns 403 for unauthorized access | Task 4 |
| Returns 400 for missing/invalid language | Task 4 |
| Validates against supported languages | Task 4 |
| Updates accounts.preferred_language | Task 5 |
| Returns 200 OK with updated data | Task 5 |
| Returns 500 for database failures | Tasks 5, 6 |
| Error responses include clear messages | All tasks |
| Logs significant errors | Tasks 5, 6 |
| Follows existing API patterns | All tasks |
| TypeScript types properly defined | Task 2 |

---

## Dependencies & Related Requests

| Request | Relationship | Status |
|---------|--------------|--------|
| REQ-358 | Consumer (LanguagePreferenceSection calls this API) | Pending |
| REQ-327 | Consumer integration | Pending |
| REQ-251 | Pattern reference (user language API) | Complete |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| RLS policy blocks account update | Test with authenticated user; RLS should allow updates via account membership |
| Race condition on concurrent updates | Last-write-wins is acceptable for preferences |
| Type mismatch with database | Use validated SupportedLocale type |

---

*Detailed Task Breakdown Document generated for FAQBNB L10N Epic 5 - REQ-359*
