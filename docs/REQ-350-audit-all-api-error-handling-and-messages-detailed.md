# REQ-350: Audit All API Error Handling and Messages - Detailed Task Breakdown

**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-350
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.3
**Size:** L (Large)
**Priority:** High (Foundation for API error i18n)
**Status:** Ready for Implementation

---

## Document References

- **Overview Document:** `/docs/REQ-350-audit-all-api-error-handling-and-messages-overview.md`
- **Requirements:** `/docs/gen_requests_epic2.md` (REQ-350)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Parent Epic:** L10N Epic 2 - Static UI Translation

---

## Executive Summary

This task involves a comprehensive audit of all 51 API route files to document error handling patterns, identify inconsistencies, catalog hardcoded error strings (~110 unique), and propose standardized translation keys following the `errors.api` namespace structure. The audit will produce actionable documentation enabling systematic migration of API error handling in subsequent implementation tasks.

---

## Pre-Implementation Checklist

- [ ] Verify `next-intl` is installed and configured (Epic 1 dependency)
- [ ] Confirm `/messages/en.json` exists with `errors` namespace stub
- [ ] Ensure Task 2J.1 (`errors` namespace structure) is complete or in parallel
- [ ] Review existing error handling patterns in `auth-server.ts`

---

## Task Breakdown

### Phase 1: API Route Discovery and Inventory

#### Task 1.1: Catalog All API Route Files
**Estimated Effort:** 30 minutes
**Files to Analyze:** All files in `/src/app/api/**/*.ts`

**Deliverable:** Complete inventory list organized by category

**Actions:**
1. Run glob pattern to list all API route files
2. Categorize each file by functional area
3. Count HTTP methods per route (GET, POST, PUT, DELETE, PATCH)
4. Document route hierarchy and dependencies

**Expected Output:**
```markdown
| Category | Route Path | File Location | HTTP Methods |
|----------|------------|---------------|--------------|
| Authentication | /api/auth/login | src/app/api/auth/login/route.ts | POST |
| Authentication | /api/auth/logout | src/app/api/auth/logout/route.ts | POST |
| ... | ... | ... | ... |
```

**API Route Categories (51 files identified):**

| Category | Files | Route Paths |
|----------|-------|-------------|
| **Authentication** | 8 | `/api/auth/login`, `/api/auth/logout`, `/api/auth/register`, `/api/auth/session`, `/api/auth/validate-code`, `/api/auth/complete-oauth-registration`, `/api/auth/google`, `/api/auth/google/callback` |
| **User Management** | 7 | `/api/user/properties/*`, `/api/user/stats`, `/api/user/activity`, `/api/user/dashboard/stats`, `/api/user/language` |
| **Item Operations** | 5 | `/api/admin/items`, `/api/admin/items/[publicId]`, `/api/admin/items/[publicId]/analytics`, `/api/items/[publicId]`, `/api/items/[publicId]/reactions` |
| **Article Operations** | 2 | `/api/admin/articles`, `/api/admin/articles/[articleId]` |
| **Property Operations** | 4 | `/api/admin/properties`, `/api/admin/properties/[propertyId]`, `/api/admin/property-types` |
| **Access Requests** | 5 | `/api/admin/access-requests`, `/api/admin/access-requests/[requestId]`, `/api/admin/access-requests/[requestId]/grant`, `/api/admin/grant-access`, `/api/admin/deny-access` |
| **Account Management** | 3 | `/api/admin/accounts`, `/api/admin/accounts/[accountId]`, `/api/admin/accounts/users` |
| **Analytics** | 3 | `/api/admin/analytics`, `/api/admin/analytics/reactions`, `/api/admin/users/analytics` |
| **Public Access** | 3 | `/api/public/access-request`, `/api/access/redeem`, `/api/mailing-list` |
| **Utility** | 7 | `/api/visits`, `/api/reactions`, `/api/url-metadata`, `/api/version`, `/api/simple-auth/me`, `/api/admin/upload`, `/api/admin/generate-pdf` |
| **Translation** | 1 | `/api/admin/translate` |
| **Sysadmin** | 2 | `/api/admin/check-sysadmin`, `/api/sentry-example-api` |

---

#### Task 1.2: Document Current Error Response Patterns
**Estimated Effort:** 1 hour
**Dependencies:** Task 1.1

**Deliverable:** Catalog of distinct error response patterns with code examples

**Actions:**
1. Read auth-server.ts for shared error handling utilities
2. Sample 5-10 representative API routes across categories
3. Identify and document each distinct error response pattern
4. Note pattern frequency and usage context

**Patterns to Document:**

| Pattern ID | Structure | Usage Location | Frequency |
|------------|-----------|----------------|-----------|
| P1 | `{ success: false, error: 'message' }` | Most routes | ~60% |
| P2 | `{ success: false, error: 'message', code: 'CODE' }` | Auth routes | ~25% |
| P3 | `{ success: false, error: 'message', details: '...' }` | Admin routes | ~10% |
| P4 | Auth helper wrapped response | Via validateAdminAuth() | ~5% |

**Code Example for Each Pattern:**
```typescript
// Pattern P1: Basic Error Response (Most Common)
return NextResponse.json(
  { success: false, error: 'Email and password are required' },
  { status: 400 }
);

// Pattern P2: Error Response with Code
return NextResponse.json(
  { success: false, error: 'Invalid or expired token', code: 'UNAUTHORIZED' },
  { status: 401 }
);

// Pattern P3: Error Response with Details
return NextResponse.json(
  { success: false, error: 'Failed to create item', details: error.message },
  { status: 500 }
);

// Pattern P4: Auth Helper Error Response (via validateAdminAuth)
return {
  error: NextResponse.json(
    { success: false, error: 'User not found in system', code: 'FORBIDDEN' },
    { status: 403 }
  )
};
```

---

### Phase 2: Error Message Extraction and Cataloging

#### Task 2.1: Extract Authentication Error Messages
**Estimated Effort:** 45 minutes
**Files to Audit:**
- `/src/lib/auth-server.ts`
- `/src/app/api/auth/login/route.ts`
- `/src/app/api/auth/logout/route.ts`
- `/src/app/api/auth/register/route.ts`
- `/src/app/api/auth/session/route.ts`
- `/src/app/api/auth/validate-code/route.ts`
- `/src/app/api/auth/complete-oauth-registration/route.ts`
- `/src/app/api/auth/google/route.ts`
- `/src/app/api/auth/google/callback/route.ts`

**Deliverable:** Table of all authentication error messages with proposed translation keys

**Actions:**
1. Read each file and identify all error response statements
2. Document: file path, line number, HTTP status, current message, triggering condition
3. Propose translation key following `errors.api.auth.*` pattern
4. Identify messages requiring parameter interpolation

**Expected Output Format:**
```markdown
| File | Line | Status | Current Message | Condition | Proposed Key | Params |
|------|------|--------|-----------------|-----------|--------------|--------|
| auth-server.ts | 40 | 401 | "Invalid or expired token" | User session not found | errors.api.auth.invalidToken | - |
| auth-server.ts | 54 | 401 | "User email not found in token" | No email in user data | errors.api.auth.noEmail | - |
| auth-server.ts | 122 | 403 | "User not found in system" | User validation failed | errors.api.forbidden.userNotFound | - |
| auth-server.ts | 159 | 500 | "Authentication validation failed" | Catch block | errors.api.server.authFailed | - |
```

---

#### Task 2.2: Extract User Management Error Messages
**Estimated Effort:** 30 minutes
**Files to Audit:**
- `/src/app/api/user/properties/route.ts`
- `/src/app/api/user/properties/[propertyId]/route.ts`
- `/src/app/api/user/properties/[propertyId]/items/route.ts`
- `/src/app/api/user/properties/summary/route.ts`
- `/src/app/api/user/properties/default/route.ts`
- `/src/app/api/user/stats/route.ts`
- `/src/app/api/user/activity/route.ts`
- `/src/app/api/user/dashboard/stats/route.ts`
- `/src/app/api/user/language/route.ts`

**Deliverable:** Table of all user management error messages

**Actions:**
1. Audit each file for error responses
2. Focus on validation errors, auth errors, and resource not found scenarios
3. Document with proposed `errors.api.*` keys

---

#### Task 2.3: Extract Item Operation Error Messages
**Estimated Effort:** 45 minutes
**Files to Audit:**
- `/src/app/api/admin/items/route.ts` (largest file, ~50+ error points)
- `/src/app/api/admin/items/[publicId]/route.ts`
- `/src/app/api/admin/items/[publicId]/analytics/route.ts`
- `/src/app/api/items/[publicId]/route.ts`
- `/src/app/api/items/[publicId]/reactions/route.ts`

**Deliverable:** Table of all item operation error messages

**Key Error Categories:**
- Validation errors (missing fields, invalid UUIDs, invalid URLs)
- Authorization errors (account access, property access)
- Not found errors (item, property)
- Conflict errors (duplicate publicId)
- Server errors (create failed, fetch failed)

---

#### Task 2.4: Extract Article Operation Error Messages
**Estimated Effort:** 20 minutes
**Files to Audit:**
- `/src/app/api/admin/articles/route.ts`
- `/src/app/api/admin/articles/[articleId]/route.ts`

**Deliverable:** Table of all article operation error messages

---

#### Task 2.5: Extract Property Operation Error Messages
**Estimated Effort:** 20 minutes
**Files to Audit:**
- `/src/app/api/admin/properties/route.ts`
- `/src/app/api/admin/properties/[propertyId]/route.ts`
- `/src/app/api/admin/property-types/route.ts`

**Deliverable:** Table of all property operation error messages

---

#### Task 2.6: Extract Access Request Error Messages
**Estimated Effort:** 30 minutes
**Files to Audit:**
- `/src/app/api/admin/access-requests/route.ts`
- `/src/app/api/admin/access-requests/[requestId]/route.ts`
- `/src/app/api/admin/access-requests/[requestId]/grant/route.ts`
- `/src/app/api/admin/grant-access/route.ts`
- `/src/app/api/admin/deny-access/route.ts`
- `/src/app/api/public/access-request/route.ts`
- `/src/app/api/access/redeem/route.ts`

**Deliverable:** Table of all access request error messages

---

#### Task 2.7: Extract Account Management Error Messages
**Estimated Effort:** 20 minutes
**Files to Audit:**
- `/src/app/api/admin/accounts/route.ts`
- `/src/app/api/admin/accounts/[accountId]/route.ts`
- `/src/app/api/admin/accounts/users/route.ts`

**Deliverable:** Table of all account management error messages

---

#### Task 2.8: Extract Analytics Error Messages
**Estimated Effort:** 15 minutes
**Files to Audit:**
- `/src/app/api/admin/analytics/route.ts`
- `/src/app/api/admin/analytics/reactions/route.ts`
- `/src/app/api/admin/users/analytics/route.ts`

**Deliverable:** Table of all analytics error messages

---

#### Task 2.9: Extract Utility Route Error Messages
**Estimated Effort:** 20 minutes
**Files to Audit:**
- `/src/app/api/visits/route.ts`
- `/src/app/api/reactions/route.ts`
- `/src/app/api/url-metadata/route.ts`
- `/src/app/api/version/route.ts`
- `/src/app/api/simple-auth/me/route.ts`
- `/src/app/api/admin/upload/route.ts`
- `/src/app/api/admin/generate-pdf/route.ts`
- `/src/app/api/mailing-list/route.ts`
- `/src/app/api/admin/translate/route.ts`
- `/src/app/api/admin/check-sysadmin/route.ts`

**Deliverable:** Table of all utility route error messages

---

### Phase 3: Error Analysis and Standardization Proposal

#### Task 3.1: Categorize Errors by HTTP Status Code
**Estimated Effort:** 30 minutes
**Dependencies:** Tasks 2.1-2.9

**Deliverable:** Error categorization matrix

**Actions:**
1. Group all extracted errors by HTTP status code
2. Identify appropriate `errors.api.*` namespace for each category
3. Ensure consistent status code usage across similar error types

**Error Category Mapping:**

| HTTP Status | Error Type | Namespace | Example Keys |
|-------------|------------|-----------|--------------|
| 400 | Validation Errors | `errors.api.validation.*` | `required`, `invalidEmail`, `invalidUuid`, `maxLength` |
| 401 | Authentication Errors | `errors.api.auth.*` | `invalidToken`, `credentialsRequired`, `sessionExpired` |
| 403 | Authorization Errors | `errors.api.forbidden.*` | `accountAccess`, `propertyAccess`, `sysadminRequired` |
| 404 | Not Found Errors | `errors.api.notFound.*` | `item`, `property`, `article`, `user` |
| 405 | Method Not Allowed | `errors.api.methodNotAllowed` | - |
| 409 | Conflict Errors | `errors.api.conflict.*` | `emailExists`, `itemExists`, `resourceExists` |
| 429 | Rate Limiting | `errors.api.rateLimit.*` | `generic`, `registration` |
| 500 | Server Errors | `errors.api.server.*` | `internal`, `fetchFailed`, `createFailed` |
| 501 | Not Implemented | `errors.api.notImplemented` | - |

---

#### Task 3.2: Identify Consistency Issues
**Estimated Effort:** 30 minutes
**Dependencies:** Tasks 2.1-2.9

**Deliverable:** List of inconsistencies with recommended fixes

**Issues to Identify:**
1. Same error type using different messages across endpoints
2. Inconsistent response field naming (`error` vs `message` vs `details`)
3. Missing error codes on some errors
4. Variable inclusion in messages (requiring interpolation)
5. Inconsistent HTTP status codes for similar errors

**Example Inconsistency Report:**

| Issue | Endpoints | Current State | Recommendation |
|-------|-----------|---------------|----------------|
| Different auth error messages | `/auth/login`, `/user/properties` | "Invalid credentials" vs "Invalid session token" | Standardize to `errors.api.auth.invalidToken` |
| Missing error code | `/admin/items` validation errors | No code field | Add `code: 'VALIDATION_ERROR'` |
| Variable in message | `/admin/items` | `"Invalid link type: ${type}"` | Use interpolation: `{value}` |

---

#### Task 3.3: Design Standardized Error Response Schema
**Estimated Effort:** 30 minutes
**Dependencies:** Tasks 3.1, 3.2

**Deliverable:** TypeScript interface for standardized error response

**Actions:**
1. Design schema that supports i18n requirements
2. Include backwards compatibility considerations
3. Define development vs production response differences

**Proposed Schema:**
```typescript
// /src/types/api-errors.ts

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'METHOD_NOT_ALLOWED'
  | 'NOT_IMPLEMENTED';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;           // Machine-readable code
    messageKey: string;           // Translation key: 'errors.api.validation.required'
    message?: string;             // Fallback English text (for backwards compat)
    params?: Record<string, string | number>;  // For interpolation
    field?: string;               // For field-specific validation errors
  };
  debug?: {                       // Development only
    details?: string;
    timestamp?: string;
  };
}
```

---

#### Task 3.4: Identify Dynamic Parameter Requirements
**Estimated Effort:** 20 minutes
**Dependencies:** Tasks 2.1-2.9

**Deliverable:** List of error messages requiring parameter interpolation

**Actions:**
1. Identify messages that include dynamic values (field names, counts, URLs)
2. Define parameter names for each
3. Document interpolation syntax for next-intl ICU format

**Example Parameters:**

| Translation Key | Parameters | Example Message |
|-----------------|------------|-----------------|
| `errors.api.validation.requiredField` | `{field}` | "{field} is required" |
| `errors.api.validation.maxLength` | `{field}`, `{max}` | "{field} must be {max} characters or less" |
| `errors.api.validation.invalidLinkType` | `{value}`, `{allowed}` | "Invalid link type: {value}. Must be one of: {allowed}" |
| `errors.api.rateLimit.registration` | `{minutes}` | "Too many registration attempts. Please try again in {minutes} minutes." |
| `errors.api.server.fetchFailed` | `{resource}` | "Failed to fetch {resource}" |
| `errors.api.server.createFailed` | `{resource}` | "Failed to create {resource}" |

---

### Phase 4: Documentation and Recommendations

#### Task 4.1: Compile Complete Error Audit Report
**Estimated Effort:** 1 hour
**Dependencies:** All Phase 2 and 3 tasks

**Deliverable:** Comprehensive audit document

**Document Sections:**
1. Executive Summary
2. API Route Inventory (51 files)
3. Current Error Handling Patterns (4 patterns)
4. Complete Error Message Catalog (~110 unique errors)
5. Error Categorization by Status Code
6. Identified Inconsistencies
7. Proposed Standardized Schema
8. Translation Key Mapping
9. Implementation Recommendations

---

#### Task 4.2: Create Translation Keys Structure
**Estimated Effort:** 30 minutes
**Dependencies:** Task 4.1

**Deliverable:** Complete `errors.api` namespace JSON structure

**Actions:**
1. Organize keys hierarchically by error category
2. Include all identified messages with English text
3. Ensure consistent naming convention

**JSON Structure:**
```json
{
  "errors": {
    "api": {
      "auth": {
        "credentialsRequired": "Email and password are required",
        "invalidCredentials": "Invalid email or password",
        "invalidToken": "Invalid or expired authentication token",
        "invalidSession": "Invalid session. Please sign in again.",
        "missingAuth": "Authentication required",
        "noEmail": "User email not found",
        "userNotFound": "User account not found",
        "sessionExpired": "Your session has expired. Please sign in again."
      },
      "validation": {
        "required": "This field is required",
        "requiredField": "{field} is required",
        "requiredFields": "Missing required fields: {fields}",
        "invalidEmail": "Please enter a valid email address",
        "invalidUrl": "Please enter a valid URL",
        "invalidUuid": "{field} must be a valid UUID",
        "invalidType": "{field} must be a {expected}",
        "invalidLinkType": "Invalid link type: {value}. Must be one of: {allowed}",
        "invalidPurpose": "Invalid or missing purpose",
        "invalidBody": "Invalid request body",
        "invalidProperty": "Invalid property ID or property not accessible",
        "maxLength": "{field} must be {max} characters or less",
        "minLength": "{field} must be at least {min} characters",
        "passwordRequirements": "Password must be at least 8 characters with at least one letter and one number",
        "passwordMismatch": "Passwords do not match",
        "nameTooShort": "Name must be at least {min} characters",
        "missingParam": "Missing required parameter: {param}",
        "noAccountContext": "No account context available"
      },
      "forbidden": {
        "generic": "You do not have permission to perform this action",
        "accountAccess": "Access denied to requested account",
        "noAccount": "No account access found for user",
        "propertyAccess": "Access denied to this property",
        "itemAccess": "Access denied to this item",
        "userNotFound": "User not found in system",
        "sysadminRequired": "This feature is restricted to system administrators"
      },
      "notFound": {
        "generic": "The requested resource was not found",
        "item": "Item not found",
        "property": "Property not found",
        "article": "Article not found",
        "user": "User not found"
      },
      "conflict": {
        "emailExists": "An account with this email address already exists",
        "itemExists": "An item with this identifier already exists",
        "resourceExists": "This {resource} already exists"
      },
      "rateLimit": {
        "generic": "Too many requests. Please try again later.",
        "registration": "Too many registration attempts. Please try again in {minutes} minutes."
      },
      "server": {
        "internal": "Internal server error. Please try again later.",
        "unexpected": "An unexpected error occurred. Please try again.",
        "fetchFailed": "Failed to fetch {resource}",
        "createFailed": "Failed to create {resource}",
        "updateFailed": "Failed to update {resource}",
        "deleteFailed": "Failed to delete {resource}",
        "queryFailed": "Database query failed",
        "loginFailed": "Login failed. Please try again.",
        "registrationFailed": "Registration failed. Please try again.",
        "authFailed": "Authentication validation failed",
        "accountContext": "Failed to determine account context",
        "configError": "Server configuration error"
      },
      "methodNotAllowed": "Method not allowed",
      "notImplemented": "This feature is not yet implemented"
    }
  }
}
```

---

#### Task 4.3: Design Centralized Error Utility
**Estimated Effort:** 30 minutes
**Dependencies:** Task 3.3

**Deliverable:** Proposed `/src/lib/api-errors.ts` utility specification

**Utility Functions to Design:**
1. `createApiError()` - Generic error response creator
2. `apiErrors.validation()` - Validation error helper
3. `apiErrors.unauthorized()` - Authentication error helper
4. `apiErrors.forbidden()` - Authorization error helper
5. `apiErrors.notFound()` - Not found error helper
6. `apiErrors.conflict()` - Conflict error helper
7. `apiErrors.serverError()` - Server error helper

**Proposed Implementation:**
```typescript
// /src/lib/api-errors.ts
import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NOT_IMPLEMENTED';

export interface CreateApiErrorOptions {
  status?: number;
  params?: Record<string, string | number>;
  field?: string;
  debug?: string;
}

const STATUS_MAP: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};

export function createApiError(
  code: ApiErrorCode,
  messageKey: string,
  options?: CreateApiErrorOptions
): NextResponse {
  const status = options?.status ?? STATUS_MAP[code];

  const response: Record<string, unknown> = {
    success: false,
    error: {
      code,
      messageKey,
      ...(options?.params && { params: options.params }),
      ...(options?.field && { field: options.field }),
    },
  };

  if (process.env.NODE_ENV === 'development' && options?.debug) {
    response.debug = { details: options.debug };
  }

  return NextResponse.json(response, { status });
}

export const apiErrors = {
  validation: (messageKey: string, params?: Record<string, unknown>, field?: string) =>
    createApiError('VALIDATION_ERROR', messageKey, { params, field }),

  unauthorized: (messageKey = 'errors.api.auth.invalidToken') =>
    createApiError('UNAUTHORIZED', messageKey),

  forbidden: (messageKey = 'errors.api.forbidden.generic') =>
    createApiError('FORBIDDEN', messageKey),

  notFound: (resource: string) =>
    createApiError('NOT_FOUND', `errors.api.notFound.${resource}`),

  conflict: (messageKey: string, params?: Record<string, unknown>) =>
    createApiError('CONFLICT', messageKey, { params }),

  rateLimit: (messageKey = 'errors.api.rateLimit.generic', params?: Record<string, unknown>) =>
    createApiError('RATE_LIMITED', messageKey, { params }),

  serverError: (debug?: string) =>
    createApiError('SERVER_ERROR', 'errors.api.server.internal', { debug }),
};
```

---

#### Task 4.4: Create Before/After Examples
**Estimated Effort:** 20 minutes
**Dependencies:** Tasks 3.3, 4.3

**Deliverable:** Example transformations for each error category

**Examples:**

**Example 1: Validation Error**
```typescript
// BEFORE
return NextResponse.json(
  { success: false, error: 'Email and password are required' },
  { status: 400 }
);

// AFTER
return apiErrors.validation('errors.api.auth.credentialsRequired');
// Response: { success: false, error: { code: 'VALIDATION_ERROR', messageKey: 'errors.api.auth.credentialsRequired' } }
```

**Example 2: Not Found Error**
```typescript
// BEFORE
return NextResponse.json(
  { success: false, error: 'Item not found' },
  { status: 404 }
);

// AFTER
return apiErrors.notFound('item');
// Response: { success: false, error: { code: 'NOT_FOUND', messageKey: 'errors.api.notFound.item' } }
```

**Example 3: Validation with Parameters**
```typescript
// BEFORE
return NextResponse.json(
  { success: false, error: `Invalid link type: ${type}. Must be one of: ${allowed.join(', ')}` },
  { status: 400 }
);

// AFTER
return apiErrors.validation(
  'errors.api.validation.invalidLinkType',
  { value: type, allowed: allowed.join(', ') },
  'linkType'
);
// Response: { success: false, error: { code: 'VALIDATION_ERROR', messageKey: 'errors.api.validation.invalidLinkType', params: { value: 'invalid', allowed: 'youtube, pdf, image' }, field: 'linkType' } }
```

---

#### Task 4.5: Document Frontend Integration Requirements
**Estimated Effort:** 20 minutes
**Dependencies:** Task 3.3

**Deliverable:** Frontend error handling update guide

**Actions:**
1. Identify how frontend currently handles API errors
2. Document required changes for i18n support
3. Propose error display component updates

**Frontend Integration Pattern:**
```typescript
// Frontend error handling with i18n
import { useTranslations } from 'next-intl';

function useApiErrorHandler() {
  const t = useTranslations('errors');

  return (error: ApiErrorResponse) => {
    const { code, messageKey, params } = error.error;

    // Look up translation with parameters
    const message = t(messageKey.replace('errors.', ''), params);

    // Handle field-specific errors
    if (error.error.field) {
      return { field: error.error.field, message };
    }

    return { message };
  };
}
```

---

#### Task 4.6: Prioritize Implementation Order
**Estimated Effort:** 15 minutes
**Dependencies:** Task 4.1

**Deliverable:** Prioritized implementation checklist

**Priority Criteria:**
1. User-facing frequency (high traffic endpoints first)
2. Error visibility (user-facing vs internal)
3. Complexity (simple errors before parameterized)

**Implementation Order:**
1. **P1 - Critical:** Authentication routes (login, register, session)
2. **P2 - High:** Item operations (most used admin feature)
3. **P3 - High:** User properties (user-facing errors)
4. **P4 - Medium:** Article and property operations
5. **P5 - Medium:** Access request handling
6. **P6 - Low:** Analytics and utility routes

---

### Phase 5: Verification and Handoff

#### Task 5.1: Verify Audit Completeness
**Estimated Effort:** 30 minutes
**Dependencies:** All Phase 4 tasks

**Deliverable:** Verification checklist signed off

**Verification Checklist:**
- [ ] All 51 API route files audited
- [ ] All ~110 unique error messages documented
- [ ] Each error has proposed translation key
- [ ] Parameterized messages identified with placeholders
- [ ] Inconsistencies documented with recommendations
- [ ] Standardized schema defined
- [ ] Centralized utility designed
- [ ] Before/after examples provided
- [ ] Implementation priority established

---

#### Task 5.2: Update Overview Document Status
**Estimated Effort:** 10 minutes
**Dependencies:** Task 5.1

**Deliverable:** Updated overview document with implementation checklist status

**Actions:**
1. Mark Phase 1 (Documentation) tasks as complete
2. Add cross-references to detailed findings
3. Update Last Modified timestamp

---

## Files to Create/Modify

### Files to Create

| File Path | Purpose | Size Est. |
|-----------|---------|-----------|
| `/docs/api-error-audit-report.md` | Comprehensive audit findings | ~3000 lines |

### Files to Review (Read-Only for Audit)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | Shared auth validation errors |
| `/src/app/api/**/*.ts` | All 51 API route files |
| `/messages/en.json` | Existing error translations |

### Files to Modify (Future Implementation)

| File Path | Change Type | Notes |
|-----------|-------------|-------|
| `/messages/en.json` | EXTEND | Add `errors.api` namespace (~80 keys) |
| `/messages/{fr,es,de,nl,it}.json` | EXTEND | Add `errors.api` translations |
| `/src/lib/api-errors.ts` | CREATE | Centralized error utility |
| `/src/types/api-errors.ts` | CREATE | TypeScript types for errors |

---

## Acceptance Criteria Mapping

| Criterion | Task | Verification Method |
|-----------|------|---------------------|
| All API route files identified and cataloged | 1.1 | Count matches 51 files |
| Error handling code reviewed and documented | 2.1-2.9 | All routes have error table |
| Hardcoded error strings identified with proposed keys | 2.1-2.9 | Each error has messageKey |
| Errors categorized by HTTP status code | 3.1 | Category matrix complete |
| Standardized error response schema proposed | 3.3 | TypeScript interface defined |
| Translation keys follow errors.api namespace | 4.2 | JSON structure verified |
| Dynamic values documented with placeholders | 3.4 | Parameter table complete |
| Consistency issues identified | 3.2 | Inconsistency report generated |
| Centralized error utility recommended | 4.3 | Utility spec provided |
| Before/after examples included | 4.4 | Examples for each category |
| Implementation priority established | 4.6 | Priority list created |
| Audit serves as implementation checklist | 5.1 | Verification checklist passed |

---

## Risk Mitigation

| Risk | Mitigation | Task |
|------|------------|------|
| Missing error scenarios | Sample multiple endpoints per category | 2.1-2.9 |
| Inconsistent key naming | Use strict naming convention, review before finalizing | 4.2 |
| Breaking frontend | Design backwards-compatible response structure | 3.3 |
| Exposing debug info | Environment checks in utility design | 4.3 |

---

## Dependencies

### Upstream Dependencies (Required Before Start)
- Epic 1: `next-intl` installed and configured
- Task 2J.1: `errors` namespace structure created (can run in parallel)

### Downstream Dependencies (Blocked By This Task)
- Task 2J.4: Create centralized error message utility
- Task 2J.5: Update Zod schemas to use translated messages
- Task 2J.7: Generate translations for 5 non-English languages
- All API route error handling migration tasks

---

## Estimated Total Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Discovery | 1.1-1.2 | 1.5 hours |
| Phase 2: Extraction | 2.1-2.9 | 4 hours |
| Phase 3: Analysis | 3.1-3.4 | 2 hours |
| Phase 4: Documentation | 4.1-4.6 | 3 hours |
| Phase 5: Verification | 5.1-5.2 | 40 minutes |
| **Total** | 19 tasks | **~11 hours** |

---

## Notes for Implementation Agent

1. **Read Before Modifying:** This is primarily an audit task. Read all API route files but do not modify them during this phase.

2. **Consistency is Key:** Use the exact translation key pattern `errors.api.{category}.{specificError}` throughout.

3. **Parameter Naming:** Use descriptive parameter names (`{field}`, `{resource}`, `{max}`) that match next-intl ICU format.

4. **Document Everything:** Every error message found should appear in the audit report, even if similar to others.

5. **Cross-Reference Line Numbers:** Include file paths and line numbers for easy future reference during implementation.

6. **Backwards Compatibility:** The proposed schema must support gradual migration without breaking existing frontend error handling.

---

## References

- [Overview Document](/docs/REQ-350-audit-all-api-error-handling-and-messages-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
