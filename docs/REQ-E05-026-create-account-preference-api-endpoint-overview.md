# REQ-E05-026: Create Account Preference API Endpoint - Implementation Breakdown

**Request ID**: REQ-E05-026
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 6 - Language Preference Setting
**Task**: Task 6.2 - Create account preference API endpoint
**Created**: 2026-01-22 20:25
**Status**: PENDING

---

## Goal

Create a secure API endpoint at `/api/accounts/[accountId]/preferences` that enables property owners to update their account preferences, specifically the `preferredLanguage` setting for translation management. The endpoint validates authentication, authorization, and input, then updates the account's `settings` JSONB column in the database while preserving existing settings.

---

## Implementation Plan

### Step 1: Create API Route File Structure

**File**: `/src/app/api/accounts/[accountId]/preferences/route.ts` (NEW)

**Rationale**: Next.js App Router convention for dynamic route with accountId parameter.

**Directory Structure**:
```
/src/app/api/accounts/
  [accountId]/
    preferences/
      route.ts    <- New file
```

**Estimated Effort**: 5 minutes (directory creation)

---

### Step 2: Define TypeScript Interfaces

**File**: `/src/app/api/accounts/[accountId]/preferences/route.ts` (in-file types)

**Rationale**: Define request/response schemas for type safety and API documentation.

**Implementation**:

```typescript
/**
 * Account Preferences API Endpoint
 *
 * REQ-E05-026: Create Account Preference API Endpoint
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.2
 *
 * Allows property owners to update account-level preferences such as
 * preferred language for translation management.
 *
 * @created 2026-01-22 20:25
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Request body schema for updating account preferences
 */
interface AccountPreferencesRequest {
  /** ISO 639-1 language code (e.g., 'en', 'fr', 'de') */
  preferredLanguage?: string;
  // Future preferences can be added here
}

/**
 * Success response schema
 */
interface AccountPreferencesResponse {
  success: true;
  data: {
    accountId: string;
    preferences: {
      preferredLanguage: string | null;
      // Other preferences
    };
    updatedAt: string;
  };
}

/**
 * Error response schema
 */
interface ErrorResponse {
  success: false;
  error: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Supported language codes - must match database check constraint
 * Source: /src/lib/i18n/config.ts locales array
 */
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
```

**Estimated Effort**: 15 minutes

---

### Step 3: Implement validateAccountAccess Helper

**File**: `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Rationale**: Reusable authorization check to ensure user is member of the account.

**Implementation**:

```typescript
// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate that a user has access to an account
 * Checks the account_users table for membership
 *
 * @param supabase - Supabase client instance
 * @param userId - Authenticated user ID
 * @param accountId - Account ID to check access for
 * @returns True if user is a member of the account
 */
async function validateAccountAccess(
  supabase: ReturnType<typeof createRouteHandlerClient<Database>>,
  userId: string,
  accountId: string
): Promise<boolean> {
  try {
    const { data: membership, error } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      console.warn(`Access denied for user ${userId} to account ${accountId}:`, error?.message);
      return false;
    }

    console.log(`Access granted for user ${userId} to account ${accountId} (role: ${membership.role})`);
    return true;
  } catch (error) {
    console.error('Error checking account access:', error);
    return false;
  }
}
```

**Key Decisions**:
- Uses `single()` since user can only have one role per account (enforced by primary key)
- Returns boolean for simple true/false check
- Logs access attempts for debugging and security audit trail

**Estimated Effort**: 30 minutes

---

### Step 4: Implement PUT Endpoint

**File**: `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Rationale**: PUT method for updating existing resource (account preferences).

**Implementation**:

```typescript
// ============================================================================
// PUT Endpoint
// ============================================================================

/**
 * PUT /api/accounts/[accountId]/preferences
 * Update account preferences (preferredLanguage, etc.)
 *
 * @param request - Next.js request object
 * @param params - Dynamic route parameters containing accountId
 * @returns JSON response with updated preferences or error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<AccountPreferencesResponse | ErrorResponse>> {
  try {
    // Initialize Supabase client with route handler context
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { accountId } = await params;

    console.log(`PUT /api/accounts/${accountId}/preferences - Starting...`);

    // ========================================================================
    // Step 1: Validate Authentication
    // ========================================================================
    const { data: authResult, error: authError } = await supabase.auth.getUser();
    if (authError || !authResult.user) {
      console.warn('Authentication failed:', authError?.message);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    console.log(`Authenticated user: ${userId}`);

    // ========================================================================
    // Step 2: Validate Authorization (Account Access)
    // ========================================================================
    const hasAccess = await validateAccountAccess(supabase, userId, accountId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this account' },
        { status: 403 }
      );
    }

    // ========================================================================
    // Step 3: Parse and Validate Request Body
    // ========================================================================
    const body: AccountPreferencesRequest = await request.json();
    const { preferredLanguage } = body;

    // Validate preferredLanguage if provided
    if (preferredLanguage !== undefined) {
      if (typeof preferredLanguage !== 'string') {
        return NextResponse.json(
          { success: false, error: 'preferredLanguage must be a string' },
          { status: 400 }
        );
      }

      if (!SUPPORTED_LANGUAGES.includes(preferredLanguage as any)) {
        return NextResponse.json(
          {
            success: false,
            error: `preferredLanguage must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    console.log(`Validated request body:`, { preferredLanguage });

    // ========================================================================
    // Step 4: Fetch Current Account Settings
    // ========================================================================
    const { data: currentAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('settings')
      .eq('id', accountId)
      .single();

    if (fetchError || !currentAccount) {
      console.error('Account not found:', fetchError?.message);
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // ========================================================================
    // Step 5: Merge New Preferences with Existing Settings
    // ========================================================================
    const currentSettings = (currentAccount.settings as Record<string, unknown>) || {};
    const updatedSettings = {
      ...currentSettings,
      ...(preferredLanguage !== undefined && { preferredLanguage }),
    };

    console.log(`Merging preferences:`, { currentSettings, updatedSettings });

    // ========================================================================
    // Step 6: Update Account Settings
    // ========================================================================
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .select('id, settings, updated_at')
      .single();

    if (updateError || !updatedAccount) {
      console.error('Failed to update account preferences:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    console.log(`Successfully updated preferences for account ${accountId}`);

    // ========================================================================
    // Step 7: Return Success Response
    // ========================================================================
    return NextResponse.json({
      success: true,
      data: {
        accountId: updatedAccount.id,
        preferences: {
          preferredLanguage:
            (updatedAccount.settings as Record<string, unknown>)?.preferredLanguage as string | null || null,
        },
        updatedAt: updatedAccount.updated_at,
      },
    });

  } catch (error) {
    console.error('Error in PUT /api/accounts/[accountId]/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Key Design Decisions**:
- Uses `createRouteHandlerClient` for proper Next.js App Router auth context
- Awaits `params` promise (Next.js 15 requirement for dynamic routes)
- Merges new settings with existing settings to preserve other preferences
- Updates `updated_at` timestamp automatically
- Returns only `preferredLanguage` in response (can be extended for other preferences)
- Comprehensive logging for debugging and monitoring
- Clear error messages for each failure scenario

**Estimated Effort**: 3-4 hours

---

### Step 5: Implement GET Endpoint (Optional)

**File**: `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Rationale**: Allow clients to fetch current preferences without querying accounts table directly.

**Implementation**:

```typescript
// ============================================================================
// GET Endpoint (Optional but Recommended)
// ============================================================================

/**
 * GET /api/accounts/[accountId]/preferences
 * Retrieve current account preferences
 *
 * @param request - Next.js request object
 * @param params - Dynamic route parameters containing accountId
 * @returns JSON response with current preferences or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<AccountPreferencesResponse | ErrorResponse>> {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { accountId } = await params;

    console.log(`GET /api/accounts/${accountId}/preferences - Starting...`);

    // Validate authentication
    const { data: authResult, error: authError } = await supabase.auth.getUser();
    if (authError || !authResult.user) {
      console.warn('Authentication failed:', authError?.message);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Validate authorization
    const hasAccess = await validateAccountAccess(supabase, userId, accountId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this account' },
        { status: 403 }
      );
    }

    // Fetch account preferences
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('id, settings, updated_at')
      .eq('id', accountId)
      .single();

    if (fetchError || !account) {
      console.error('Account not found:', fetchError?.message);
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        preferences: {
          preferredLanguage:
            (account.settings as Record<string, unknown>)?.preferredLanguage as string | null || null,
        },
        updatedAt: account.updated_at,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/accounts/[accountId]/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Estimated Effort**: 1-2 hours

---

### Step 6: Add Unit Tests

**File**: `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts` (NEW)

**Rationale**: Ensure endpoint behaves correctly under all scenarios.

**Test Cases**:
1. **Authentication Tests**:
   - Returns 401 when no auth token provided
   - Returns 401 when auth token is invalid/expired

2. **Authorization Tests**:
   - Returns 403 when user is not a member of the account
   - Allows access when user is account member (any role)

3. **Validation Tests**:
   - Returns 400 when preferredLanguage is not a string
   - Returns 400 when preferredLanguage is not a supported language
   - Accepts valid language codes (en, fr, es, de, nl, it)

4. **Business Logic Tests**:
   - Returns 404 when account doesn't exist
   - Successfully updates preferredLanguage in settings
   - Preserves other settings fields when updating
   - Updates updated_at timestamp
   - Returns correct response format

5. **GET Endpoint Tests**:
   - Returns current preferences for authenticated user
   - Returns null when no preferences set
   - Returns 401/403 for unauthorized access

6. **Edge Cases**:
   - Handles empty request body gracefully
   - Handles null settings column (account with no settings yet)
   - Handles malformed JSON request body

**Estimated Effort**: 3-4 hours

---

### Step 7: Add API Documentation

**File**: `/docs/api/accounts.md` (NEW or UPDATE existing)

**Rationale**: Document API contract for frontend developers and future maintainers.

**Content**:

```markdown
# Accounts API

## PUT /api/accounts/[accountId]/preferences

Update account-level preferences such as preferred language.

### Authentication
Required. User must be authenticated via Supabase Auth.

### Authorization
User must be a member of the account (checked via `account_users` table).

### Request

**Method:** PUT

**Path:** `/api/accounts/[accountId]/preferences`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (optional if using cookies)

**Body:**
```json
{
  "preferredLanguage": "fr"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `preferredLanguage` | string | No | ISO 639-1 language code. Valid values: `en`, `fr`, `es`, `de`, `nl`, `it` |

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "accountId": "uuid-here",
    "preferences": {
      "preferredLanguage": "fr"
    },
    "updatedAt": "2026-01-22T20:25:00.000Z"
  }
}
```

**Errors:**
| Status | Code | Message |
|--------|------|---------|
| 401 | Unauthorized | No valid authentication token |
| 403 | Access denied to this account | User is not a member of this account |
| 400 | preferredLanguage must be a string | Invalid data type |
| 400 | preferredLanguage must be one of: en, fr, es, de, nl, it | Unsupported language |
| 404 | Account not found | Account ID does not exist |
| 500 | Internal server error | Unexpected server error |

---

## GET /api/accounts/[accountId]/preferences

Retrieve current account preferences.

### Request

**Method:** GET

**Path:** `/api/accounts/[accountId]/preferences`

### Response

Same format as PUT success response.
```

**Estimated Effort**: 1 hour

---

### Step 8: Manual API Testing

**Rationale**: Verify endpoint behavior in real environment before integration.

**Test Scenarios**:

1. **Using curl or Postman**:
   ```bash
   # PUT with valid auth and language
   curl -X PUT 'http://localhost:3000/api/accounts/[account-id]/preferences' \
     -H 'Content-Type: application/json' \
     -d '{"preferredLanguage": "fr"}'

   # GET current preferences
   curl 'http://localhost:3000/api/accounts/[account-id]/preferences'

   # PUT with invalid language
   curl -X PUT 'http://localhost:3000/api/accounts/[account-id]/preferences' \
     -H 'Content-Type: application/json' \
     -d '{"preferredLanguage": "pt"}'
   ```

2. **Database Verification**:
   ```sql
   -- Check settings column after update
   SELECT id, settings, updated_at FROM accounts WHERE id = 'account-id';

   -- Verify merge behavior (existing settings preserved)
   -- Before: {"otherSetting": "value"}
   -- After:  {"otherSetting": "value", "preferredLanguage": "fr"}
   ```

3. **Integration Testing**:
   - Test with LanguagePreferenceSection component (REQ-E05-025)
   - Verify onSave callback works correctly
   - Check error handling in UI

**Estimated Effort**: 1-2 hours

---

## Authorized Files for Modification

### New Files to Create
1. `/src/app/api/accounts/[accountId]/preferences/route.ts` - Main API endpoint
2. `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts` - Unit tests
3. `/docs/api/accounts.md` - API documentation (or update existing)

### Existing Files to Modify
- None (this is a new endpoint with no dependencies on existing code)

### Files to Reference (No Changes)
- `/src/lib/supabase.ts` - Database type definitions
- `/src/lib/i18n/config.ts` - SUPPORTED_LOCALES constant (verify consistency)
- `/src/app/api/admin/accounts/[accountId]/route.ts` - Pattern reference for account access validation
- `/src/app/api/user/properties/[propertyId]/route.ts` - Pattern reference for user auth

---

## Dependencies

### Required (Must Exist First)
- **Supabase Auth**: `@supabase/auth-helpers-nextjs` package ✅ (installed)
- **Database Tables**:
  - `accounts` table with `settings` JSONB column ✅ (exists)
  - `account_users` table for authorization ✅ (exists)
- **Next.js 15**: App Router with route handlers ✅ (configured)
- **Epic 1 - L10N Foundation**: Language codes (`en`, `fr`, `es`, `de`, `nl`, `it`) ✅ (defined)

### Blocks (Requires This First)
- **REQ-E05-025**: LanguagePreferenceSection Component - Needs this API to persist preferences
- **REQ-E05-027**: Account Settings Integration - Needs this API for data loading/saving

### Parallel Safety
- **Files touched**: Only new files, no conflicts
- **Database modifications**: Updates `accounts.settings` and `accounts.updated_at` columns (safe, no schema changes)
- **Safe to parallelize with**: All other Epic 5 tasks except REQ-E05-027 (which depends on this)

### External Dependencies
- **Supabase Database**: Must be accessible and `accounts` table must exist
- **Authentication System**: Supabase Auth must be configured and working

---

## Technical Risks

### 1. JSONB Column Type Safety
**Risk**: TypeScript doesn't enforce structure of `settings` JSONB column, potential runtime type errors.

**Mitigation**:
- Cast settings to `Record<string, unknown>` and access with optional chaining
- Validate `preferredLanguage` type explicitly before using
- Consider creating a `AccountSettings` interface in types file for future type safety

**Example Enhancement**:
```typescript
// /src/types/account.ts
export interface AccountSettings {
  preferredLanguage?: string;
  // Future settings
  notificationsEnabled?: boolean;
  timezone?: string;
}
```

**Impact**: Low - Current implementation handles unknown types safely.

---

### 2. Race Conditions on Concurrent Updates
**Risk**: If two requests update preferences simultaneously, one update may be lost (last-write-wins).

**Mitigation**:
- Current implementation uses merge strategy (reads current, merges, writes)
- Database `updated_at` triggers handle timestamp updates
- For critical use cases, consider optimistic locking via `updated_at` comparison

**Example Optimistic Locking**:
```typescript
// Read current updated_at
const currentUpdatedAt = currentAccount.updated_at;

// Update with WHERE condition
const { error } = await supabase
  .from('accounts')
  .update({ settings: updatedSettings })
  .eq('id', accountId)
  .eq('updated_at', currentUpdatedAt); // Only update if unchanged

if (error) {
  return NextResponse.json(
    { success: false, error: 'Preferences were modified by another request. Please refresh and try again.' },
    { status: 409 } // Conflict
  );
}
```

**Impact**: Low - Language preference updates are infrequent and low-stakes.

---

### 3. Account Access Validation Performance
**Risk**: Extra database query for `account_users` check adds latency.

**Mitigation**:
- Query is indexed (primary key on `account_id, user_id`)
- Returns single row, very fast
- Could cache account membership in session token claims (future optimization)

**Impact**: Very Low - Typical query time < 5ms.

---

### 4. Missing Account Validation
**Risk**: accountId parameter may not be a valid UUID format.

**Mitigation**:
- Supabase will handle invalid UUID and return no results
- Returns 404 "Account not found" which is appropriate
- Could add explicit UUID validation for better error messages

**Enhancement**:
```typescript
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

if (!UUID_REGEX.test(accountId)) {
  return NextResponse.json(
    { success: false, error: 'Invalid account ID format' },
    { status: 400 }
  );
}
```

**Impact**: Very Low - Non-critical enhancement.

---

### 5. CORS for External Clients
**Risk**: If API is called from external domains, CORS headers may be needed.

**Mitigation**:
- Current implementation assumes same-origin requests (dashboard frontend)
- If needed, add CORS headers to response
- Next.js provides `next.config.js` CORS configuration

**Impact**: None - Dashboard is same-origin, no CORS needed.

---

## Out of Scope

### 1. User-Level Preferences vs Account-Level Preferences
This endpoint updates **account-level** preferences stored in the `accounts` table. Individual **user-level** preferences (e.g., personal UI preferences) are out of scope.

**Rationale**: Epic 5 spec focuses on account-level translation management settings. User-level preferences would require a different endpoint (`/api/user/preferences`) and different database storage (e.g., `users.settings` column).

**Future Consideration**: If users need personal language preferences separate from account defaults, create a parallel endpoint structure.

---

### 2. Preference Validation Against Property Settings
This endpoint does NOT validate that the preferred language is actually used by any properties in the account.

**Rationale**: Language preference is aspirational (what language the owner prefers to work in), not restrictive. Properties may or may not have translations in that language.

**Future Enhancement**: API could return a warning if no properties use the selected language.

---

### 3. Preference Change Notifications
This endpoint does NOT send notifications when preferences change (e.g., email notification, webhook trigger).

**Rationale**: Language preference change is a low-impact setting that doesn't require immediate notification.

**Future Enhancement**: Add audit logging or webhook triggers for preference changes if needed for compliance.

---

### 4. Batch Preference Updates
This endpoint updates preferences for one account at a time. Bulk updates across multiple accounts are out of scope.

**Rationale**: Use case doesn't require batch operations. Account admins manage one account at a time.

**Future Enhancement**: Create `/api/accounts/preferences/batch` endpoint if needed.

---

### 5. Preference History/Versioning
This endpoint does NOT track history of preference changes (who changed what, when).

**Rationale**: Not required for Epic 5 MVP. The `updated_at` timestamp provides basic change tracking.

**Future Enhancement**: Add `account_preference_history` table for audit trail if compliance requires it.

---

### 6. Default Preference Initialization
This endpoint does NOT automatically initialize preferences for new accounts. Accounts with no settings will have `settings: {}` or `settings: null`.

**Rationale**: Preferences are optional. The frontend handles null/missing preferences gracefully (defaults to English).

**Future Enhancement**: Create a database trigger or migration to initialize default preferences for new accounts.

---

## Notes

### Database Schema - accounts.settings Column
The `accounts` table already has a `settings` JSONB column:
```sql
settings JSONB DEFAULT '{}'::jsonb
```

No migration required. The endpoint uses this column to store:
```json
{
  "preferredLanguage": "fr",
  "otherFutureSetting": "value"
}
```

### Language Code Consistency
Must use ISO 639-1 codes: `en`, `fr`, `es`, `de`, `nl`, `it` (Italian, NOT Portuguese).
Source of truth: `/src/lib/i18n/config.ts:19`.

The endpoint's `SUPPORTED_LANGUAGES` constant must match this list exactly to ensure consistency across the application.

### Authorization Model
The endpoint allows ANY member of an account to update account preferences (owner, admin, member, viewer roles all have access).

**Rationale**: Language preference is a non-destructive setting. If stricter permissions are needed, modify `validateAccountAccess` to check for specific roles:

```typescript
// Only allow owner/admin to update preferences
const isAuthorized = membership.role === 'owner' || membership.role === 'admin';
if (!isAuthorized) {
  return false;
}
```

### Future Extensibility
The request body uses `AccountPreferencesRequest` interface which can be extended for additional preferences:

```typescript
interface AccountPreferencesRequest {
  preferredLanguage?: string;
  // Future additions:
  defaultTranslationStrategy?: 'auto' | 'manual';
  notificationFrequency?: 'realtime' | 'daily' | 'weekly';
  autoTranslateNewContent?: boolean;
}
```

The merge strategy ensures backward compatibility when adding new fields.

---

## Estimated Effort

**Total**: 10-14 hours

**Breakdown**:
- Step 1 (Directory structure): 5 minutes
- Step 2 (TypeScript interfaces): 15 minutes
- Step 3 (validateAccountAccess helper): 30 minutes
- Step 4 (PUT endpoint): 3-4 hours
- Step 5 (GET endpoint): 1-2 hours
- Step 6 (Unit tests): 3-4 hours
- Step 7 (API documentation): 1 hour
- Step 8 (Manual testing): 1-2 hours

**Confidence Level**: High - Standard CRUD API with clear requirements.

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ PUT endpoint created at `/api/accounts/[accountId]/preferences/route.ts`
2. ✅ Unauthenticated requests return HTTP 401 with clear error message
3. ✅ Requests for accounts user doesn't belong to return HTTP 403
4. ✅ Invalid `preferredLanguage` values return HTTP 400 with validation error
5. ✅ Non-existent account IDs return HTTP 404
6. ✅ Valid PUT request updates `settings.preferredLanguage` in database
7. ✅ Existing settings fields preserved when updating (merge, not replace)
8. ✅ Response includes `accountId`, `preferences` object, and `updatedAt` timestamp
9. ✅ GET endpoint returns current preferences for authenticated user
10. ✅ Language validation uses same list as database constraints and i18n config
11. ✅ No TypeScript compilation errors
12. ✅ No ESLint warnings
13. ✅ API follows existing route patterns (consistent error handling, response format)
14. ✅ All unit tests pass
15. ✅ Manual API testing scenarios complete successfully
16. ✅ API documentation created/updated
17. ✅ Integration with LanguagePreferenceSection component works correctly

---

**Document Status**: PENDING
**Last Updated**: 2026-01-22 20:25
**Author**: Technical Lead
**Review Status**: Awaiting Implementation
