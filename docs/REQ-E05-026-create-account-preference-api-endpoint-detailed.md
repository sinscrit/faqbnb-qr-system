# Detailed Task Breakdown: REQ-E05-026 - Account Language Preference API Endpoint

**Generated:** 2026-01-20 23:30:00 UTC
**Last Modified:** 2026-01-20 23:30:00 UTC
**Request Reference:** REQ-E05-026 (Epic 5 - Owner Translation Management)
**Overview Document:** REQ-E05-026-create-account-preference-api-endpoint-overview.md
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.2
**Size:** S (Small)
**Priority:** P2
**Estimated Effort:** ~2.5 hours

---

## Executive Summary

This document provides granular implementation tasks for creating a REST API endpoint that allows property owners to retrieve and update their account-level language preference settings. The endpoint enables account administrators to set a preferred dashboard interface language that persists across browser sessions and devices.

**Output:** A new API route at `/src/app/api/accounts/[accountId]/preferences/route.ts` with GET and PUT handlers.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete with `preferred_language` column on `accounts` table
- [ ] Database migration `20260118_add_preferred_language_columns.sql` has been applied
- [ ] Supabase server client is available at `/src/lib/supabase-server.ts`
- [ ] Existing patterns are available for reference:
  - `/src/app/api/user/language/route.ts` (language validation pattern)
  - `/src/app/api/admin/accounts/[accountId]/route.ts` (account access validation)

---

## Task Breakdown

### Task 6.2.1: Create Route File and Directory Structure

**Effort:** XS (15 minutes)
**Status:** [ ] Not Started

#### Description
Create the new API route directory structure and initial file with imports and type definitions.

#### Acceptance Criteria
- [ ] Directory `/src/app/api/accounts/[accountId]/preferences/` exists
- [ ] File `route.ts` is created in that directory
- [ ] All necessary imports are included
- [ ] Type definitions for request/response are defined

#### Implementation Steps

1. **Create directory structure:**
   ```
   /src/app/api/accounts/[accountId]/preferences/route.ts
   ```

2. **Add initial file content with imports:**
   ```typescript
   // /src/app/api/accounts/[accountId]/preferences/route.ts
   // REQ-E05-026: Account Language Preference API Endpoint
   // Phase: 6 - Language Preference Setting
   // Task ID: 6.2
   // Last Modified: 2026-01-20

   import { NextRequest, NextResponse } from 'next/server';
   import { createSupabaseServer } from '@/lib/supabase-server';
   ```

3. **Define constants and type guards:**
   ```typescript
   // Supported language codes (matches i18n configuration)
   const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
   type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

   /**
    * Type guard to check if a language code is supported
    */
   function isValidLanguage(code: string): code is SupportedLanguage {
     return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
   }
   ```

#### Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/app/api/accounts/[accountId]/preferences/route.ts` | Main API route file |

#### Verification
- [ ] File compiles without TypeScript errors
- [ ] Imports resolve correctly

---

### Task 6.2.2: Define TypeScript Types and Interfaces

**Effort:** XS (15 minutes)
**Status:** [ ] Not Started

#### Description
Add comprehensive type definitions for API request and response structures.

#### Acceptance Criteria
- [ ] Success response interface is defined
- [ ] Error response interface is defined
- [ ] Union type for API response is defined
- [ ] All types include JSDoc comments

#### Implementation Steps

1. **Add response interfaces:**
   ```typescript
   // Response interfaces
   interface SuccessResponse {
     /** Indicates successful operation */
     success: true;
     /** Response data payload */
     data: {
       /** Current preferred language code (ISO 639-1) */
       preferredLanguage: string;
       /** Timestamp of last update */
       updatedAt?: string;
       /** List of all supported language codes */
       supportedLanguages?: string[];
     };
   }

   interface ErrorResponse {
     /** Indicates failed operation */
     success: false;
     /** Human-readable error message */
     error: string;
     /** Machine-readable error code */
     code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_LANGUAGE' | 'INVALID_BODY' | 'UPDATE_FAILED' | 'INTERNAL_ERROR';
     /** List of supported languages (included for validation errors) */
     supportedLanguages?: string[];
   }

   type ApiResponse = SuccessResponse | ErrorResponse;
   ```

2. **Add request body interface:**
   ```typescript
   interface UpdatePreferencesRequest {
     /** New preferred language code (ISO 639-1) */
     preferredLanguage: string;
   }
   ```

#### Verification
- [ ] All types compile without errors
- [ ] IntelliSense shows correct type hints

---

### Task 6.2.3: Implement Account Access Validation Helper

**Effort:** XS (15 minutes)
**Status:** [ ] Not Started

#### Description
Create helper functions for validating user access and permissions on accounts.

#### Acceptance Criteria
- [ ] `validateAccountAccess` function checks if user has ANY access to account
- [ ] `canModifyAccountPreferences` function checks if user can UPDATE preferences
- [ ] Functions return typed results for clarity
- [ ] Error handling is robust

#### Implementation Steps

1. **Add account access validation helper:**
   ```typescript
   /**
    * Validates that a user has access to the specified account
    * @param supabase - Supabase client instance
    * @param userId - Authenticated user's ID
    * @param accountId - Target account ID
    * @returns Object with hasAccess boolean and optional role
    */
   async function validateAccountAccess(
     supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
     userId: string,
     accountId: string
   ): Promise<{ hasAccess: boolean; role?: string }> {
     const { data, error } = await supabase
       .from('account_users')
       .select('role')
       .eq('account_id', accountId)
       .eq('user_id', userId)
       .single();

     if (error || !data) {
       return { hasAccess: false };
     }
     return { hasAccess: true, role: data.role };
   }
   ```

2. **Add permission check helper:**
   ```typescript
   /**
    * Checks if user has permission to modify account preferences
    * Only owners and admins can modify account-level preferences
    * @param role - User's role in the account
    * @returns boolean indicating permission
    */
   function canModifyAccountPreferences(role?: string): boolean {
     return role === 'owner' || role === 'admin';
   }
   ```

#### Pattern Reference
Based on existing pattern in `/src/app/api/admin/accounts/[accountId]/route.ts:41-79`

#### Verification
- [ ] Helper functions compile correctly
- [ ] Function signatures match expected usage

---

### Task 6.2.4: Implement GET Handler

**Effort:** S (30 minutes)
**Status:** [ ] Not Started

#### Description
Implement the GET handler to retrieve current account language preference.

#### Acceptance Criteria
- [ ] Returns 401 if user is not authenticated
- [ ] Returns 403 if user has no access to the account
- [ ] Returns 404 if account does not exist
- [ ] Returns 200 with preference data on success
- [ ] Response includes `supportedLanguages` array
- [ ] Console logging for audit purposes

#### Implementation Steps

1. **Add GET handler function:**
   ```typescript
   /**
    * GET /api/accounts/[accountId]/preferences
    * Retrieves the account's current language preference
    */
   export async function GET(
     request: NextRequest,
     { params }: { params: Promise<{ accountId: string }> }
   ): Promise<NextResponse<ApiResponse>> {
     try {
       const supabase = await createSupabaseServer();
       const { accountId } = await params;

       // Step 1: Validate authentication
       const { data: { user }, error: userError } = await supabase.auth.getUser();

       if (userError || !user) {
         console.log('[API] /api/accounts/[accountId]/preferences GET: Unauthorized request');
         return NextResponse.json(
           { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
           { status: 401 }
         );
       }

       // Step 2: Validate account access
       const { hasAccess } = await validateAccountAccess(supabase, user.id, accountId);

       if (!hasAccess) {
         console.log('[API] /api/accounts/[accountId]/preferences GET: Access denied', {
           userId: user.id,
           accountId
         });
         return NextResponse.json(
           { success: false, error: 'Access denied to this account', code: 'FORBIDDEN' },
           { status: 403 }
         );
       }

       // Step 3: Fetch account preferences
       const { data: account, error: fetchError } = await supabase
         .from('accounts')
         .select('preferred_language, updated_at')
         .eq('id', accountId)
         .single();

       if (fetchError) {
         if (fetchError.code === 'PGRST116') {
           // Row not found
           return NextResponse.json(
             { success: false, error: 'Account not found', code: 'NOT_FOUND' },
             { status: 404 }
           );
         }
         console.error('[API] /api/accounts/[accountId]/preferences GET: Database error:', fetchError);
         return NextResponse.json(
           { success: false, error: 'Failed to fetch preferences', code: 'INTERNAL_ERROR' },
           { status: 500 }
         );
       }

       // Step 4: Return success response
       console.log('[API] /api/accounts/[accountId]/preferences GET: Success', {
         accountId,
         preferredLanguage: account.preferred_language || 'en'
       });

       return NextResponse.json({
         success: true,
         data: {
           preferredLanguage: account.preferred_language || 'en',
           updatedAt: account.updated_at,
           supportedLanguages: [...SUPPORTED_LANGUAGES],
         },
       });

     } catch (error) {
       console.error('[API] /api/accounts/[accountId]/preferences GET: Unexpected error:', error);
       return NextResponse.json(
         { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
         { status: 500 }
       );
     }
   }
   ```

#### Pattern Reference
Based on existing pattern in `/src/app/api/user/language/route.ts:44-88`

#### Verification
- [ ] Handler compiles without errors
- [ ] Returns correct status codes for each scenario
- [ ] Logging statements are present for audit

---

### Task 6.2.5: Implement PUT Handler

**Effort:** S (45 minutes)
**Status:** [ ] Not Started

#### Description
Implement the PUT handler to update account language preference.

#### Acceptance Criteria
- [ ] Returns 401 if user is not authenticated
- [ ] Returns 403 if user doesn't have owner/admin role
- [ ] Returns 400 for missing or invalid language code
- [ ] Returns 404 if account does not exist
- [ ] Returns 200 with updated preference on success
- [ ] Updates `preferred_language` AND `updated_at` columns
- [ ] Console logging for all preference changes (audit trail)
- [ ] Error response includes `supportedLanguages` for invalid codes

#### Implementation Steps

1. **Add PUT handler function:**
   ```typescript
   /**
    * PUT /api/accounts/[accountId]/preferences
    * Updates the account's language preference
    */
   export async function PUT(
     request: NextRequest,
     { params }: { params: Promise<{ accountId: string }> }
   ): Promise<NextResponse<ApiResponse>> {
     try {
       const supabase = await createSupabaseServer();
       const { accountId } = await params;

       // Step 1: Validate authentication
       const { data: { user }, error: userError } = await supabase.auth.getUser();

       if (userError || !user) {
         console.log('[API] /api/accounts/[accountId]/preferences PUT: Unauthorized request');
         return NextResponse.json(
           { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
           { status: 401 }
         );
       }

       // Step 2: Parse request body
       let body: UpdatePreferencesRequest;
       try {
         body = await request.json();
       } catch {
         return NextResponse.json(
           { success: false, error: 'Invalid JSON body', code: 'INVALID_BODY' },
           { status: 400 }
         );
       }

       const { preferredLanguage } = body;

       // Step 3: Validate preferredLanguage parameter exists
       if (!preferredLanguage) {
         return NextResponse.json(
           {
             success: false,
             error: 'preferredLanguage parameter is required',
             code: 'INVALID_BODY',
             supportedLanguages: [...SUPPORTED_LANGUAGES],
           },
           { status: 400 }
         );
       }

       // Step 4: Normalize and validate language code
       const normalizedLanguage = preferredLanguage.toLowerCase().trim();
       if (!isValidLanguage(normalizedLanguage)) {
         return NextResponse.json(
           {
             success: false,
             error: `Language "${preferredLanguage}" is not supported`,
             code: 'INVALID_LANGUAGE',
             supportedLanguages: [...SUPPORTED_LANGUAGES],
           },
           { status: 400 }
         );
       }

       // Step 5: Validate account access AND modify permission
       const { hasAccess, role } = await validateAccountAccess(supabase, user.id, accountId);

       if (!hasAccess) {
         console.log('[API] /api/accounts/[accountId]/preferences PUT: Access denied', {
           userId: user.id,
           accountId
         });
         return NextResponse.json(
           { success: false, error: 'Access denied to this account', code: 'FORBIDDEN' },
           { status: 403 }
         );
       }

       if (!canModifyAccountPreferences(role)) {
         console.log('[API] /api/accounts/[accountId]/preferences PUT: Insufficient permissions', {
           userId: user.id,
           accountId,
           role
         });
         return NextResponse.json(
           { success: false, error: 'Insufficient permissions to modify account preferences', code: 'FORBIDDEN' },
           { status: 403 }
         );
       }

       // Step 6: Verify account exists
       const { data: existingAccount, error: checkError } = await supabase
         .from('accounts')
         .select('id')
         .eq('id', accountId)
         .single();

       if (checkError || !existingAccount) {
         return NextResponse.json(
           { success: false, error: 'Account not found', code: 'NOT_FOUND' },
           { status: 404 }
         );
       }

       // Step 7: Update account preferences
       const updatedAt = new Date().toISOString();
       const { error: updateError } = await supabase
         .from('accounts')
         .update({
           preferred_language: normalizedLanguage,
           updated_at: updatedAt
         })
         .eq('id', accountId);

       if (updateError) {
         console.error('[API] /api/accounts/[accountId]/preferences PUT: Update failed:', updateError);
         return NextResponse.json(
           { success: false, error: 'Failed to update language preference', code: 'UPDATE_FAILED' },
           { status: 500 }
         );
       }

       // Step 8: Return success response and log for audit
       console.log('[API] /api/accounts/[accountId]/preferences PUT: Preference updated', {
         userId: user.id,
         accountId,
         preferredLanguage: normalizedLanguage,
         updatedAt,
         updatedBy: role
       });

       return NextResponse.json({
         success: true,
         data: {
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

#### Pattern Reference
Based on existing patterns:
- `/src/app/api/user/language/route.ts:94-189` (language update flow)
- `/src/app/api/admin/accounts/[accountId]/route.ts:177-266` (account permission check)

#### Verification
- [ ] Handler compiles without errors
- [ ] All validation steps execute in correct order
- [ ] Logging captures userId, accountId, and new language value

---

### Task 6.2.6: Add Error Handling and Logging

**Effort:** XS (15 minutes)
**Status:** [ ] Not Started

#### Description
Review and enhance error handling throughout the route file.

#### Acceptance Criteria
- [ ] All database errors are caught and logged
- [ ] Error messages are user-friendly (no stack traces exposed)
- [ ] Console logs include contextual information
- [ ] All error codes are consistent with existing API patterns

#### Implementation Steps

1. **Review error handling patterns:**
   - Verify all `try-catch` blocks are in place
   - Ensure database errors log the actual error object
   - Confirm user-facing errors don't expose internal details

2. **Verify logging consistency:**
   - Format: `[API] /api/accounts/[accountId]/preferences {METHOD}: {message}`
   - Include relevant context: `userId`, `accountId`, action performed

3. **Error code mapping:**
   | HTTP Status | Error Code | Scenario |
   |-------------|------------|----------|
   | 401 | `UNAUTHORIZED` | No valid session/token |
   | 403 | `FORBIDDEN` | No access OR insufficient role |
   | 404 | `NOT_FOUND` | Account doesn't exist |
   | 400 | `INVALID_BODY` | Malformed JSON or missing field |
   | 400 | `INVALID_LANGUAGE` | Language code not supported |
   | 500 | `UPDATE_FAILED` | Database update failed |
   | 500 | `INTERNAL_ERROR` | Unexpected error |

#### Verification
- [ ] No sensitive information in error messages
- [ ] All error paths return appropriate status codes
- [ ] Logging is comprehensive for debugging

---

## Complete File Reference

### Final File: `/src/app/api/accounts/[accountId]/preferences/route.ts`

```typescript
// /src/app/api/accounts/[accountId]/preferences/route.ts
// REQ-E05-026: Account Language Preference API Endpoint
// Phase: 6 - Language Preference Setting
// Task ID: 6.2
// Last Modified: 2026-01-20

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
    preferredLanguage: string;
    updatedAt?: string;
    supportedLanguages?: string[];
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_LANGUAGE' | 'INVALID_BODY' | 'UPDATE_FAILED' | 'INTERNAL_ERROR';
  supportedLanguages?: string[];
}

type ApiResponse = SuccessResponse | ErrorResponse;

interface UpdatePreferencesRequest {
  preferredLanguage: string;
}

/**
 * Validates that a user has access to the specified account
 */
async function validateAccountAccess(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string,
  accountId: string
): Promise<{ hasAccess: boolean; role?: string }> {
  const { data, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { hasAccess: false };
  }
  return { hasAccess: true, role: data.role };
}

/**
 * Checks if user has permission to modify account preferences
 */
function canModifyAccountPreferences(role?: string): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * GET /api/accounts/[accountId]/preferences
 * Retrieves the account's current language preference
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<ApiResponse>> {
  // Implementation from Task 6.2.4
}

/**
 * PUT /api/accounts/[accountId]/preferences
 * Updates the account's language preference
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<ApiResponse>> {
  // Implementation from Task 6.2.5
}
```

---

## Testing Guide

### Manual Testing Scenarios

| # | Scenario | Method | Expected Result | Status |
|---|----------|--------|-----------------|--------|
| 1 | GET without auth | GET | 401 Unauthorized | [ ] |
| 2 | GET with auth, no account access | GET | 403 Forbidden | [ ] |
| 3 | GET with auth, valid access | GET | 200 with preference data | [ ] |
| 4 | GET non-existent account | GET | 404 Not Found | [ ] |
| 5 | PUT without auth | PUT | 401 Unauthorized | [ ] |
| 6 | PUT with member role | PUT | 403 Forbidden | [ ] |
| 7 | PUT with owner role, invalid language | PUT | 400 with supported list | [ ] |
| 8 | PUT with admin role, valid language | PUT | 200 with updated preference | [ ] |
| 9 | PUT with owner role, valid language | PUT | 200 with updated preference | [ ] |
| 10 | PUT non-existent account | PUT | 404 Not Found | [ ] |
| 11 | PUT malformed JSON body | PUT | 400 Invalid body | [ ] |
| 12 | PUT missing preferredLanguage field | PUT | 400 Invalid body | [ ] |

### API Testing Commands

```bash
# Test 1: GET without authentication (should return 401)
curl -X GET "http://localhost:3000/api/accounts/{accountId}/preferences"

# Test 3: GET with valid authentication
curl -X GET "http://localhost:3000/api/accounts/{accountId}/preferences" \
  -H "Cookie: sb-access-token={token}"

# Test 8: PUT with valid language
curl -X PUT "http://localhost:3000/api/accounts/{accountId}/preferences" \
  -H "Cookie: sb-access-token={token}" \
  -H "Content-Type: application/json" \
  -d '{"preferredLanguage": "es"}'

# Test 7: PUT with invalid language
curl -X PUT "http://localhost:3000/api/accounts/{accountId}/preferences" \
  -H "Cookie: sb-access-token={token}" \
  -H "Content-Type: application/json" \
  -d '{"preferredLanguage": "xyz"}'
```

### Database Verification

```sql
-- Verify preference was updated
SELECT id, name, preferred_language, updated_at
FROM accounts
WHERE id = '{accountId}';

-- Check account_users for permission testing
SELECT au.user_id, au.role, u.email
FROM account_users au
JOIN auth.users u ON au.user_id = u.id
WHERE au.account_id = '{accountId}';
```

---

## Acceptance Criteria Verification

From REQ-E05-027:

| Criterion | Implementation Task | Verified |
|-----------|---------------------|----------|
| PUT endpoint created at route | Task 6.2.1 | [ ] |
| Endpoint accepts accountId as path parameter | Task 6.2.4, 6.2.5 | [ ] |
| Request body accepts preferredLanguage field | Task 6.2.5 | [ ] |
| Validates preferredLanguage is supported | Task 6.2.5 | [ ] |
| Validates user has ownership access | Task 6.2.5 | [ ] |
| Unauthorized returns 403 Forbidden | Task 6.2.5 | [ ] |
| Invalid account returns 404 Not Found | Task 6.2.4, 6.2.5 | [ ] |
| Invalid language returns 400 Bad Request | Task 6.2.5 | [ ] |
| Updates preferredLanguage column | Task 6.2.5 | [ ] |
| Atomic database update | Task 6.2.5 | [ ] |
| Returns 200 OK with updated record | Task 6.2.5 | [ ] |
| Response includes updated timestamp | Task 6.2.5 | [ ] |
| Handles database errors gracefully | Task 6.2.6 | [ ] |
| GET method retrieves preferences | Task 6.2.4 | [ ] |
| GET validates account access | Task 6.2.4 | [ ] |
| Integrates with auth middleware | Task 6.2.4, 6.2.5 | [ ] |
| Logs preference updates | Task 6.2.6 | [ ] |
| Follows existing API conventions | Task 6.2.2 | [ ] |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Database column missing | Verify migration applied before implementation |
| Permission bypass | Use established `account_users` table pattern |
| Invalid language persisted | Both application AND database constraint validation |
| Concurrent update race | Single field atomic UPDATE operation |

---

## Dependencies on Other Tasks

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 6.1: LanguagePreferenceSection UI | Not Required | API can be built independently |
| Task 6.3: Settings Integration | Not Required | This endpoint supports UI integration |
| Epic 1: Database Migration | Required | Must have `preferred_language` column |

---

## References

- **Request Document:** `/docs/gen_requests_epic5.md` - REQ-E05-027
- **Overview Document:** `/docs/REQ-E05-026-create-account-preference-api-endpoint-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` - Phase 6, Task 6.2
- **Pattern Reference - Language API:** `/src/app/api/user/language/route.ts`
- **Pattern Reference - Account API:** `/src/app/api/admin/accounts/[accountId]/route.ts`
- **Database Migration:** `20260118_add_preferred_language_columns.sql`

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Implementation ready for execution by AI coding agent or developer*
