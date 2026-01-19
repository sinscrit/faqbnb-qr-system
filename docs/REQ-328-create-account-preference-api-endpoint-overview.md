# REQ-328: Create Account Language Preference API Endpoint - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.2

---

## 1. Summary

Create a PUT API endpoint at `/src/app/api/accounts/[accountId]/preferences/route.ts` that allows account administrators to update the preferred language for their account. The endpoint validates account ownership before persisting preference changes and returns the updated account object.

---

## 2. Request Reference

**From:** `/docs/gen_requests_epic5.md` - REQ-328

### Original Request

Account administrators should be able to update the preferred language for their account through a secure API endpoint that validates account ownership before persisting preference changes.

### Acceptance Criteria

- [ ] Endpoint accepts PUT requests with account identifier and preferred language value
- [ ] Endpoint validates the authenticated user has administrative access to the specified account
- [ ] Endpoint rejects unauthorized requests with appropriate authorization error response
- [ ] Endpoint validates submitted language code against list of supported languages
- [ ] Endpoint rejects invalid language codes with validation error listing supported options
- [ ] Endpoint updates the account's preferred_language field when validation passes
- [ ] Endpoint returns updated account object upon successful preference update
- [ ] Endpoint handles missing account identifiers with appropriate error response
- [ ] Endpoint handles non-existent account identifiers with not found error response
- [ ] Endpoint returns appropriate error responses when database update operations fail
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint enforces proper request authentication and session validation

---

## 3. Implementation Plan Reference

**From:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

### Task Context (Phase 6.2)

```
- [ ] **Task 6.2:** Create account preference API endpoint
  - File: `/src/app/api/accounts/[accountId]/preferences/route.ts`
  - PUT endpoint to update preferredLanguage
  - Validate account access
```

---

## 4. Technical Investigation

### 4.1 Existing Patterns Discovered

#### Account API Route Pattern

**Reference File:** `/src/app/api/admin/accounts/[accountId]/route.ts`

The codebase has an established pattern for account-related API endpoints:

1. **Authentication:** Uses `validateAdminAuth()` helper with `createRouteHandlerClient`
2. **Authorization:** Uses `validateAccountPermission()` to check owner/admin role
3. **Validation:** Validates required fields before database operations
4. **Response Format:** Returns `{ success: boolean, data?: object, error?: string }`

```typescript
// Authentication helper pattern (from existing code)
async function validateAdminAuth(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: authResult, error: authError } = await supabase.auth.getUser();
  // Returns { user, isAdmin } or { error: NextResponse }
}

// Authorization helper pattern (from existing code)
async function validateAccountPermission(userId: string, accountId: string): Promise<boolean> {
  const { data: membership } = await supabase
    .from('account_users')
    .select('role')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .single();
  return membership?.role === 'owner' || membership?.role === 'admin';
}
```

#### Database Schema

**Reference File:** `/src/lib/supabase.ts` (TypeScript types)

```typescript
// accounts table already has preferred_language column (from REQ-225)
accounts: {
  Row: {
    id: string
    owner_id: string
    name: string
    description: string | null
    settings: Json | null
    preferred_language: string | null  // REQ-225: Account default language preference
    created_at: string | null
    updated_at: string | null
  }
  Update: {
    preferred_language?: string | null
    // ... other fields
  }
}
```

**Reference File:** `/database/migrations/20260118_add_preferred_language_columns.sql`

```sql
-- Database constraint already exists
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'))
```

#### Supported Languages

**Supported language codes (6 languages):**
- `en` - English
- `fr` - French
- `es` - Spanish
- `de` - German
- `nl` - Dutch
- `it` - Italian

### 4.2 Key Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| `preferred_language` column in accounts | REQ-225 (Epic 1) | ✅ Available |
| Database CHECK constraint | Migration file | ✅ Available |
| TypeScript types | `/src/lib/supabase.ts` | ✅ Available |
| Auth helpers | Existing account routes | ✅ Available |
| Account permission validation | Existing account routes | ✅ Available |

---

## 5. Architecture & Design

### 5.1 File Structure

```
/src/app/api/accounts/
└── [accountId]/
    └── preferences/
        └── route.ts          # NEW: PUT endpoint for language preferences
```

**Note:** This creates a new non-admin API route structure. The existing `/api/admin/accounts/` routes are for admin operations, while this new `/api/accounts/` path is for regular account management by account owners/admins.

### 5.2 API Contract

#### Request

```http
PUT /api/accounts/{accountId}/preferences
Content-Type: application/json
Authorization: Bearer {session_token}

{
  "preferredLanguage": "fr"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-account-id",
    "name": "Account Name",
    "preferred_language": "fr",
    "updated_at": "2026-01-18T12:00:00.000Z"
  },
  "message": "Language preference updated successfully"
}
```

#### Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Insufficient permissions to modify this account",
  "code": "FORBIDDEN"
}
```

**400 Bad Request (Invalid Language):**
```json
{
  "success": false,
  "error": "Invalid language code. Supported languages: en, fr, es, de, nl, it",
  "code": "INVALID_LANGUAGE"
}
```

**400 Bad Request (Missing Field):**
```json
{
  "success": false,
  "error": "preferredLanguage is required",
  "code": "MISSING_FIELD"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Account not found",
  "code": "NOT_FOUND"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to update language preference",
  "code": "UPDATE_FAILED"
}
```

### 5.3 Data Flow

```
Client Request (PUT /api/accounts/{accountId}/preferences)
    │
    ▼
┌───────────────────────────────────────┐
│ 1. Validate Authentication            │
│    - Get session from cookies         │
│    - Verify user exists               │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│ 2. Validate Account Permission        │
│    - Check account_users table        │
│    - Verify role is 'owner' or 'admin'│
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│ 3. Validate Request Body              │
│    - Check preferredLanguage exists   │
│    - Validate against supported list  │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│ 4. Update Database                    │
│    - Update accounts.preferred_language│
│    - Set updated_at timestamp         │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│ 5. Return Response                    │
│    - Return updated account object    │
│    - Include success message          │
└───────────────────────────────────────┘
```

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/accounts/[accountId]/preferences/route.ts` | PUT endpoint for updating account language preference |

### 6.2 Implementation Details

**File:** `/src/app/api/accounts/[accountId]/preferences/route.ts`

```typescript
// Key functions to implement:

// 1. PUT handler function
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse>

// 2. Helper: Validate authentication (can reuse pattern from admin routes)
async function validateAuth(request: NextRequest): Promise<AuthResult>

// 3. Helper: Validate account permission
async function validateAccountPermission(userId: string, accountId: string): Promise<boolean>

// 4. Constant: Supported languages
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// 5. Helper: Validate language code
function isValidLanguage(language: string): language is SupportedLanguage
```

### 6.3 Files That May Need Review (No Modification Required)

| File Path | Reason |
|-----------|--------|
| `/src/lib/supabase.ts` | Reference for Database types (already has preferred_language) |
| `/src/app/api/admin/accounts/[accountId]/route.ts` | Reference for authentication and permission patterns |

---

## 7. Implementation Checklist

### 7.1 Core Implementation

- [ ] Create directory structure `/src/app/api/accounts/[accountId]/preferences/`
- [ ] Create `route.ts` with PUT handler
- [ ] Implement authentication validation using `createRouteHandlerClient`
- [ ] Implement account permission check via `account_users` table
- [ ] Implement language validation against supported list
- [ ] Implement database update with proper error handling
- [ ] Return consistent response format

### 7.2 Validation Logic

- [ ] Validate request body contains `preferredLanguage` field
- [ ] Validate language code is a non-empty string
- [ ] Validate language code is in supported list: `['en', 'fr', 'es', 'de', 'nl', 'it']`
- [ ] Handle case-sensitivity (accept lowercase only)

### 7.3 Error Handling

- [ ] Handle missing/invalid authentication token (401)
- [ ] Handle unauthorized access to account (403)
- [ ] Handle invalid language code (400)
- [ ] Handle missing preferredLanguage field (400)
- [ ] Handle non-existent account (404)
- [ ] Handle database update failures (500)

### 7.4 Testing Scenarios

- [ ] Successful language preference update
- [ ] Unauthenticated request returns 401
- [ ] Request from non-member returns 403
- [ ] Request from member (non-owner/admin) returns 403
- [ ] Invalid language code returns 400
- [ ] Missing preferredLanguage field returns 400
- [ ] Non-existent account returns 404

---

## 8. Code Template

```typescript
// /src/app/api/accounts/[accountId]/preferences/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

// Supported languages (must match database CHECK constraint)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

function isValidLanguage(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

// Helper function to validate authentication
async function validateAuth() {
  const supabaseClient = createRouteHandlerClient<Database>({ cookies });
  const { data: authResult, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !authResult.user) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user: authResult.user, error: null };
}

// Helper function to check if user is account owner or admin
async function validateAccountPermission(userId: string, accountId: string): Promise<boolean> {
  const { data: membership, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .single();

  if (error || !membership) {
    return false;
  }

  return membership.role === 'owner' || membership.role === 'admin';
}

// PUT /api/accounts/[accountId]/preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    // 1. Validate authentication
    const authResult = await validateAuth();
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { accountId } = await params;
    const userId = authResult.user.id;

    // 2. Validate account permission
    const hasPermission = await validateAccountPermission(userId, accountId);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to modify this account', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { preferredLanguage } = body;

    if (!preferredLanguage) {
      return NextResponse.json(
        { success: false, error: 'preferredLanguage is required', code: 'MISSING_FIELD' },
        { status: 400 }
      );
    }

    if (!isValidLanguage(preferredLanguage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid language code. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`,
          code: 'INVALID_LANGUAGE'
        },
        { status: 400 }
      );
    }

    // 4. Update account preference
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({
        preferred_language: preferredLanguage,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select('id, name, preferred_language, updated_at')
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Account not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
      console.error('Error updating account preference:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update language preference', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Language preference updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/accounts/[accountId]/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

---

## 9. Dependencies

### 9.1 Epic Dependencies

| Epic | Dependency | Status |
|------|------------|--------|
| Epic 1 | `preferred_language` column in accounts table | ✅ Implemented (REQ-225) |
| Epic 1 | Database CHECK constraint for valid languages | ✅ Implemented |
| Epic 1 | TypeScript types for accounts table | ✅ Implemented |

### 9.2 Task Dependencies (Within Epic 5)

| Task | Dependency | Status |
|------|------------|--------|
| 6.1 | LanguagePreferenceSection component (consumes this API) | Pending |
| 6.3 | Integration into account settings (uses this API) | Pending |

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database constraint mismatch | Low | High | Validate against SUPPORTED_LANGUAGES constant matching DB constraint |
| Permission bypass | Low | Critical | Reuse proven `validateAccountPermission` pattern |
| Race conditions on update | Low | Low | Single field update, atomic operation |
| Missing account edge case | Low | Medium | Explicit check for account existence before update |

---

## 11. Testing Strategy

### 11.1 Unit Tests (if applicable)

- `isValidLanguage()` function with valid and invalid inputs
- Request body parsing edge cases

### 11.2 Integration Tests

```typescript
// Test scenarios to cover:

// Success case
test('should update language preference for account owner', async () => {
  // Setup: Authenticated user who is account owner
  // Action: PUT /api/accounts/{accountId}/preferences with { preferredLanguage: 'fr' }
  // Assert: 200 OK, preferred_language updated to 'fr'
});

// Auth failure
test('should return 401 for unauthenticated request', async () => {
  // Setup: No auth token
  // Action: PUT /api/accounts/{accountId}/preferences
  // Assert: 401 Unauthorized
});

// Permission failure
test('should return 403 for non-owner/non-admin user', async () => {
  // Setup: Authenticated user who is regular member of account
  // Action: PUT /api/accounts/{accountId}/preferences
  // Assert: 403 Forbidden
});

// Validation failure
test('should return 400 for invalid language code', async () => {
  // Setup: Authenticated account owner
  // Action: PUT with { preferredLanguage: 'xx' }
  // Assert: 400 Bad Request with supported languages list
});
```

---

## 12. Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Accepts PUT with account ID and language | Route structure: `/api/accounts/[accountId]/preferences` |
| Validates admin access | `validateAccountPermission()` checks owner/admin role |
| Rejects unauthorized requests | 403 response with FORBIDDEN code |
| Validates language code | `isValidLanguage()` against SUPPORTED_LANGUAGES |
| Rejects invalid codes | 400 response listing supported options |
| Updates preferred_language | Supabase update on accounts table |
| Returns updated account | Select after update, return in response |
| Handles missing account ID | Dynamic route param, validated implicitly |
| Handles non-existent account | 404 response with NOT_FOUND code |
| Handles DB failures | 500 response with UPDATE_FAILED code |
| Consistent response format | `{ success, data?, error?, code?, message? }` |
| Proper authentication | Session validation via `createRouteHandlerClient` |

---

## 13. References

- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-328)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference:** `/src/app/api/admin/accounts/[accountId]/route.ts`
- **Database Types:** `/src/lib/supabase.ts`
- **Migration (language constraint):** `/database/migrations/20260118_add_preferred_language_columns.sql`

---

*Document generated for FAQBNB Localization Epic 5 - Task 6.2*
