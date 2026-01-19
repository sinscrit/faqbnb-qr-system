# REQ-359: Create Account Language Preference API Endpoint - Implementation Overview

**Document Created:** 2026-01-19 14:45 UTC
**Last Modified:** 2026-01-19 14:45 UTC
**Request ID:** REQ-359
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.2
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## 1. Summary

Create a secure API endpoint at `/src/app/api/accounts/[accountId]/preferences/route.ts` that allows property owners and account administrators to update their account's preferred language setting. This endpoint validates account access, validates the language code against supported languages, and persists the preference to the database.

---

## 2. Dependencies

### 2.1 Epic 1 (Foundation) Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| `accounts.preferred_language` column | Database table | ✅ Available (see `src/lib/supabase.ts:59`) |
| TypeScript types for accounts | `/src/lib/supabase.ts` | ✅ Available |
| Supported language codes | `/src/lib/i18n/config.ts` | ✅ Available |

### 2.2 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `createSupabaseServer` | `/src/lib/supabase-server.ts` | Server-side Supabase client creation |
| `Account` type | `/src/types/index.ts` | Account interface definition |
| `locales` / `SUPPORTED_LOCALES` | `/src/lib/i18n/config.ts` | List of valid language codes |
| `isValidLocale` | `/src/lib/i18n/config.ts` | Type guard for language validation |

### 2.3 Related Request Dependencies

| Request | Description | Status |
|---------|-------------|--------|
| REQ-327 | LanguagePreferenceSection component | Required (consumer) |
| REQ-329 | Integration into account settings | Required (consumer) |
| REQ-251 | User language preference API | ✅ Complete (reference pattern) |

---

## 3. Technical Approach

### 3.1 API Design

The endpoint follows the existing API route patterns established in:
- `/src/app/api/admin/accounts/[accountId]/route.ts` - Account access validation pattern
- `/src/app/api/user/language/route.ts` - Language preference API pattern

**Endpoint Structure:**
```
PUT /api/accounts/[accountId]/preferences
```

**Request Body:**
```typescript
interface UpdateAccountPreferencesRequest {
  preferredLanguage: string;
}
```

**Response Types:**
```typescript
interface SuccessResponse {
  success: true;
  data: {
    accountId: string;
    preferredLanguage: string;
    updatedAt: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  supportedLanguages?: string[];
}
```

### 3.2 Authentication & Authorization Flow

1. **Authentication:** Verify user is authenticated via Supabase auth
2. **Account Access Validation:** Check `account_users` junction table to verify user has membership to the account
3. **Permission Check:** Verify user has `owner` or `admin` role for the account (can modify preferences)
4. **Validation:** Validate language code against `SUPPORTED_LOCALES`
5. **Update:** Persist to `accounts.preferred_language` column

### 3.3 Validation Rules

| Field | Validation | Error Response |
|-------|------------|----------------|
| `preferredLanguage` | Required | 400 - "Language parameter is required" |
| `preferredLanguage` | Must be in SUPPORTED_LOCALES | 400 - "Language is not supported" |
| `accountId` | Must exist | 404 - "Account not found" |
| User authentication | Must be authenticated | 401 - "Authentication required" |
| Account access | User must have account membership | 403 - "Access denied to this account" |
| Permission level | User must be owner or admin | 403 - "Insufficient permissions" |

---

## 4. Implementation Tasks

### Task 1: Create API Route File
**File:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

Create the new route file with:
- Import statements for Supabase server client, types, and i18n config
- PUT handler function with proper async/await pattern
- TypeScript interfaces for request/response types

### Task 2: Implement Authentication Validation
Reuse pattern from `/src/app/api/admin/accounts/[accountId]/route.ts`:
- Use `createSupabaseServer()` for server-side client
- Call `supabase.auth.getUser()` to verify authentication
- Return 401 if user is not authenticated

### Task 3: Implement Account Access Validation
Query `account_users` table to verify:
- User has membership to the specified account
- User has `owner` or `admin` role for modification permissions

### Task 4: Implement Language Validation
Use existing utilities from `/src/lib/i18n/config.ts`:
- Import `isValidLocale` or `SUPPORTED_LOCALES`
- Normalize input (lowercase, trim)
- Validate against supported languages
- Return 400 with list of supported languages if invalid

### Task 5: Implement Database Update
Update the `accounts` table:
- Set `preferred_language` to validated language code
- Set `updated_at` to current timestamp
- Return updated account preference data

### Task 6: Implement Error Handling
Consistent error response format:
- Structured error codes matching `/src/app/api/user/language/route.ts` pattern
- Logging for debugging purposes
- Graceful handling of database connection failures

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/accounts/[accountId]/preferences/route.ts` | Main API endpoint file |

### 5.2 Files to Reference (Read-Only Patterns)

| File Path | Pattern to Follow |
|-----------|-------------------|
| `/src/app/api/admin/accounts/[accountId]/route.ts` | Account access validation, PUT handler structure |
| `/src/app/api/user/language/route.ts` | Language preference API pattern, response types |
| `/src/lib/supabase-server.ts` | Server-side Supabase client creation |
| `/src/lib/i18n/config.ts` | Language validation utilities |

### 5.3 No Modifications Required

The following files already contain the necessary types and do not require modification:
- `/src/lib/supabase.ts` - Already has `preferred_language` in accounts type
- `/src/types/index.ts` - Account interface already exported

---

## 6. Code Structure

### 6.1 File Template

```typescript
// /src/app/api/accounts/[accountId]/preferences/route.ts
// REQ-359: Account Language Preference API Endpoint
// Phase: 6 - Language Preference Setting
// Task ID: 6.2
// Last Modified: 2026-01-19

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { SUPPORTED_LOCALES, isValidLocale, SupportedLocale } from '@/lib/i18n/config';

// Response interfaces
interface SuccessResponse {
  success: true;
  data: {
    accountId: string;
    preferredLanguage: string;
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

// Helper: Validate account access and permission
async function validateAccountPermission(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string,
  accountId: string
): Promise<{ hasAccess: boolean; hasPermission: boolean; error?: string }> {
  // Query account_users for membership and role
  const { data: membership, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .single();

  if (error || !membership) {
    return { hasAccess: false, hasPermission: false };
  }

  const hasPermission = membership.role === 'owner' || membership.role === 'admin';
  return { hasAccess: true, hasPermission };
}

/**
 * PUT /api/accounts/[accountId]/preferences
 * Update account's preferred language setting
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
      return NextResponse.json(
        { success: false, error: 'Access denied to this account', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to modify account preferences', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    // Step 3: Parse and validate request body
    let body: { preferredLanguage?: string };
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
      console.error('[API] /api/accounts/[accountId]/preferences PUT: Database update error:', updateError);
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

## 7. Testing Considerations

### 7.1 Manual Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Authenticated owner updates language | 200 OK with updated preference |
| Authenticated admin updates language | 200 OK with updated preference |
| Authenticated member attempts update | 403 Forbidden (insufficient permissions) |
| Unauthenticated request | 401 Unauthorized |
| User with no account membership | 403 Access Denied |
| Invalid language code | 400 Bad Request with supported languages list |
| Missing preferredLanguage field | 400 Bad Request |
| Non-existent accountId | 403 Access Denied (no membership found) |
| Database update failure | 500 Internal Server Error |

### 7.2 Integration Points to Verify

- LanguagePreferenceSection component can successfully call this endpoint
- Response format matches expected contract for frontend consumption
- Account settings page can display updated preference after save

---

## 8. Acceptance Criteria Mapping

| PRD Acceptance Criteria | Implementation |
|-------------------------|----------------|
| PUT endpoint exists at specified path | Task 1 |
| Endpoint accepts JSON with preferredLanguage | Task 3, Task 4 |
| Validates authenticated user has permission | Task 2, Task 3 |
| Returns 401 for unauthenticated | Task 2 |
| Returns 403 for unauthorized access | Task 3 |
| Returns 400 for missing/invalid language | Task 4 |
| Validates against supported languages | Task 4 |
| Updates accounts.preferred_language | Task 5 |
| Returns 200 OK with updated data | Task 5 |
| Returns 500 for database failures | Task 6 |
| Error responses include clear messages | All tasks |
| Logs significant errors | Task 6 |
| Follows existing API patterns | All tasks |
| TypeScript types properly defined | Task 1 |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| accounts table missing preferred_language column | Low | High | Column already exists per supabase.ts types |
| RLS policies blocking updates | Medium | Medium | Test with actual authenticated user; may need RLS policy update |
| Race condition on concurrent updates | Low | Low | Last-write-wins is acceptable for preferences |
| Client sending unsupported locale variant | Medium | Low | normalizeLocale handles edge cases |

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-359)
- **Pattern Reference - User Language API:** `/src/app/api/user/language/route.ts`
- **Pattern Reference - Account API:** `/src/app/api/admin/accounts/[accountId]/route.ts`
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Database Types:** `/src/lib/supabase.ts`

---

*Implementation Overview Document generated for FAQBNB L10N Epic 5 - REQ-359*
