# Implementation Breakdown: REQ-E05-026 - Account Language Preference API Endpoint

**Generated:** 2026-01-20 22:45:00 UTC
**Last Modified:** 2026-01-20 22:45:00 UTC
**Request Reference:** REQ-E05-026 (Epic 5 - Owner Translation Management)
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.2
**Size:** S (Small)
**Priority:** P2

---

## Overview

This task creates a REST API endpoint that allows property owners to retrieve and update their account-level language preference settings. The endpoint enables account administrators to set a preferred dashboard interface language that persists across browser sessions and devices.

**Key Deliverable:** A PUT endpoint at `/api/accounts/[accountId]/preferences` that updates the `preferredLanguage` column in the accounts table with proper authentication and authorization validation.

---

## Dependencies

### Epic Dependencies
| Epic | Status | Dependency Type |
|------|--------|-----------------|
| Epic 1 (Foundation) | Required | Database schema with `preferred_language` column on `accounts` table |

### Internal Dependencies
| Component | Location | Purpose |
|-----------|----------|---------|
| Database Migration | `/database/migrations/20260118_add_preferred_language_columns.sql` | Schema with `preferred_language` column on accounts |
| Supabase Server Client | `/src/lib/supabase-server.ts` | Server-side authentication and database access |
| Account Access Validation | Pattern from `/src/app/api/admin/accounts/[accountId]/route.ts` | Permission checking via `account_users` table |
| Language Constants | `/src/app/api/user/language/route.ts` | `SUPPORTED_LANGUAGES` constant and validation pattern |

### Pre-existing Patterns to Follow
| Pattern | Source File | Usage |
|---------|-------------|-------|
| Authentication flow | `/src/app/api/user/language/route.ts` | `createSupabaseServer()` + `getUser()` |
| Account access validation | `/src/app/api/admin/accounts/[accountId]/route.ts` | `account_users` table role check |
| Response structure | Both files above | `{ success: boolean, data?: T, error?: string, code?: string }` |
| Language validation | `/src/app/api/user/language/route.ts` | Type guard `isValidLanguage()` |

---

## Technical Approach

### Architecture Decision: Route Location

**Option A (Recommended):** `/src/app/api/accounts/[accountId]/preferences/route.ts`
- Clean RESTful path structure
- Separates account preferences from admin account management
- Matches the request specification

**Option B:** `/src/app/api/admin/accounts/[accountId]/preferences/route.ts`
- Groups with existing admin account routes
- May imply admin-only access (not the intent)

**Decision:** Use Option A to maintain clear separation and semantic correctness.

### Request/Response Contract

**GET /api/accounts/[accountId]/preferences**
```typescript
// Response
{
  success: true,
  data: {
    preferredLanguage: string;  // ISO 639-1 code: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
    supportedLanguages: string[];
    updatedAt: string;
  }
}
```

**PUT /api/accounts/[accountId]/preferences**
```typescript
// Request Body
{
  preferredLanguage: string;  // ISO 639-1 code
}

// Success Response
{
  success: true,
  data: {
    preferredLanguage: string;
    updatedAt: string;
  }
}

// Error Response
{
  success: false,
  error: string;
  code: string;  // 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_LANGUAGE' | 'UPDATE_FAILED'
  supportedLanguages?: string[];  // Included for validation errors
}
```

### Database Interaction

The `accounts` table already has the `preferred_language` column (from Epic 1 migration):
```sql
-- Existing column structure
preferred_language VARCHAR(5) DEFAULT 'en'
-- With constraint: CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'))
-- Index: idx_accounts_preferred_language
```

---

## Implementation Tasks

### Task 6.2.1: Create Route File Structure
**Effort:** XS (15 min)

Create the directory and route file:
- Path: `/src/app/api/accounts/[accountId]/preferences/route.ts`
- Include standard headers, imports, and type definitions

### Task 6.2.2: Implement GET Handler
**Effort:** S (30 min)

Steps:
1. Validate authentication using `createSupabaseServer()` + `getUser()`
2. Extract `accountId` from URL params
3. Validate user has access to account via `account_users` table
4. Query `accounts.preferred_language` where `id = accountId`
5. Return preference with supported languages list

### Task 6.2.3: Implement PUT Handler
**Effort:** S (45 min)

Steps:
1. Validate authentication using `createSupabaseServer()` + `getUser()`
2. Extract `accountId` from URL params
3. Parse and validate request body for `preferredLanguage` field
4. Validate language is one of supported languages using type guard
5. Validate user has owner/admin role in account via `account_users` table
6. Update `accounts.preferred_language` and `updated_at`
7. Return success response with updated values

### Task 6.2.4: Add TypeScript Types
**Effort:** XS (15 min)

Define request/response interfaces in the route file:
- `AccountPreferencesRequest`
- `AccountPreferencesResponse`
- Reuse `SUPPORTED_LANGUAGES` constant pattern

### Task 6.2.5: Error Handling & Logging
**Effort:** XS (15 min)

Implement consistent error handling:
- 401 for unauthenticated requests
- 403 for unauthorized account access
- 404 for invalid account IDs
- 400 for invalid language codes
- 500 for database errors
- Add `console.log` for key operations (matching existing patterns)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/accounts/[accountId]/preferences/route.ts` | Main API route with GET and PUT handlers |

### Existing Files (Reference Only - No Modification Required)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/lib/supabase-server.ts` | Import `createSupabaseServer()` |
| `/src/app/api/user/language/route.ts` | Pattern reference for language validation |
| `/src/app/api/admin/accounts/[accountId]/route.ts` | Pattern reference for account access validation |

### Database Tables (Query Only)

| Table | Operations |
|-------|------------|
| `accounts` | SELECT, UPDATE (preferredLanguage, updated_at) |
| `account_users` | SELECT (for authorization check) |

---

## Validation Rules

### Input Validation

| Field | Rules |
|-------|-------|
| `accountId` | Required, UUID format, must exist in accounts table |
| `preferredLanguage` | Required for PUT, must be one of: `'en'`, `'fr'`, `'es'`, `'de'`, `'nl'`, `'it'` |

### Authorization Rules

| Check | Implementation |
|-------|----------------|
| Authentication | `supabase.auth.getUser()` must return valid user |
| Account Access | User must have entry in `account_users` where `account_id = accountId` |
| Modify Permission | User must have `role = 'owner'` OR `role = 'admin'` in `account_users` |

---

## Code Structure Reference

```typescript
// /src/app/api/accounts/[accountId]/preferences/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Supported language codes (matches i18n configuration)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

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
  code: string;
  supportedLanguages?: string[];
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Helper: Validate user has access to account
async function validateAccountAccess(
  supabase: any,
  userId: string,
  accountId: string
): Promise<{ hasAccess: boolean; role?: string }> {
  const { data, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return { hasAccess: false };
  return { hasAccess: true, role: data.role };
}

// Helper: Validate user can modify account (owner or admin)
function canModifyAccount(role?: string): boolean {
  return role === 'owner' || role === 'admin';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<ApiResponse>> {
  // Implementation: Auth -> Validate Access -> Fetch -> Return
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<ApiResponse>> {
  // Implementation: Auth -> Parse Body -> Validate Language ->
  // Validate Permission -> Update -> Return
}
```

---

## Testing Considerations

### Manual Testing Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| GET without auth | 401 Unauthorized |
| GET with auth, no account access | 403 Forbidden |
| GET with auth, valid access | 200 with preference data |
| PUT without auth | 401 Unauthorized |
| PUT with member role | 403 Forbidden (insufficient permission) |
| PUT with owner role, invalid language | 400 with supported languages list |
| PUT with admin role, valid language | 200 with updated preference |
| PUT with non-existent account | 404 Not Found |

### API Testing Commands

```bash
# GET current preference
curl -X GET "http://localhost:3000/api/accounts/{accountId}/preferences" \
  -H "Authorization: Bearer {token}"

# PUT update preference
curl -X PUT "http://localhost:3000/api/accounts/{accountId}/preferences" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"preferredLanguage": "es"}'
```

---

## Acceptance Criteria Checklist

From REQ-E05-027:

- [ ] PUT endpoint created at route: `/src/app/api/accounts/[accountId]/preferences/route.ts`
- [ ] Endpoint accepts accountId as path parameter extracted from URL
- [ ] Request body accepts preferredLanguage field containing ISO 639-1 language code
- [ ] Request body validates that preferredLanguage value is one of six supported languages: en, es, fr, de, it, pt (Note: codebase uses nl instead of pt)
- [ ] Endpoint validates that authenticated user has ownership access to the specified account
- [ ] Unauthorized access attempts return 403 Forbidden with clear error message
- [ ] Invalid account references return 404 Not Found with appropriate error message
- [ ] Invalid language codes return 400 Bad Request with validation error details
- [ ] Endpoint updates the preferredLanguage column in the accounts table
- [ ] Database update operation is atomic and handles concurrent updates safely
- [ ] Successful update returns 200 OK with complete updated account record in response body
- [ ] Response includes updated timestamp showing when preference was modified
- [ ] Endpoint handles database errors gracefully returning 500 Internal Server Error with logged details
- [ ] Endpoint supports GET method to retrieve current account preferences including preferredLanguage
- [ ] GET request validates account access before returning preference data
- [ ] Endpoint integrates with existing authentication middleware to identify requesting user
- [ ] Endpoint logs all preference update operations for audit purposes
- [ ] Endpoint follows existing API conventions for error response format and status codes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database column missing | Low | High | Column exists per migration 20260118 |
| Permission bypass | Low | High | Follow existing account access patterns |
| Invalid language persisted | Low | Medium | DB constraint + app validation |
| Concurrent update race | Low | Low | Single field atomic update |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 6.2.1: Create Route Structure | 15 min |
| Task 6.2.2: Implement GET Handler | 30 min |
| Task 6.2.3: Implement PUT Handler | 45 min |
| Task 6.2.4: Add TypeScript Types | 15 min |
| Task 6.2.5: Error Handling & Logging | 15 min |
| Manual Testing | 30 min |
| **Total** | **~2.5 hours** |

---

## References

- **Request:** `/docs/gen_requests_epic5.md` - REQ-E05-027
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` - Phase 6, Task 6.2
- **Similar Implementation:** `/src/app/api/user/language/route.ts` - User language preference endpoint
- **Account API Pattern:** `/src/app/api/admin/accounts/[accountId]/route.ts` - Account access validation
- **Database Migration:** `/database/migrations/20260118_add_preferred_language_columns.sql`

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
