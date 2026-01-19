# REQ-350: Audit All API Error Handling and Messages - Implementation Overview

**Last Modified:** 2026-01-19 23:59 UTC
**Request ID:** REQ-350
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.3
**Size:** L
**Priority:** High (Foundation for API error i18n)

---

## Summary

This task involves auditing all API error handling code across the application to document current error patterns, identify inconsistencies, and prepare the groundwork for internationalizing API error messages. The audit will catalog all hardcoded error strings, analyze response structure variations, and propose standardized translation keys following the `errors.api` namespace structure.

---

## Current State Analysis

### Existing Error Handling Patterns

Analysis of the codebase reveals several inconsistent error handling patterns across 51+ API route files:

#### Pattern 1: Basic Error Response (Most Common)
```typescript
return NextResponse.json(
  { success: false, error: 'Hardcoded message' },
  { status: 400 }
);
```
**Files using this pattern:** `/api/auth/login`, `/api/auth/register`, `/api/admin/items`, etc.

#### Pattern 2: Error Response with Code
```typescript
return NextResponse.json(
  { success: false, error: 'Message', code: 'ERROR_CODE' },
  { status: 403 }
);
```
**Files using this pattern:** `/api/user/properties`, `/api/admin/access-requests`, `/api/admin/items`

#### Pattern 3: Error Response with Details
```typescript
return NextResponse.json(
  { success: false, error: 'Message', details: error.message },
  { status: 500 }
);
```
**Files using this pattern:** `/api/admin/items`, `/api/admin/access-requests`

#### Pattern 4: Auth Helper Error Responses
```typescript
// via validateAdminAuth() in /src/lib/auth-server.ts
return {
  error: NextResponse.json(
    { success: false, error: 'Message', code: 'CODE' },
    { status: 401 }
  )
};
```

### Current Error Response Inconsistencies

| Issue | Example | Impact |
|-------|---------|--------|
| Inconsistent field naming | Some use `error`, others `message`, `details` | Frontend must handle multiple formats |
| Missing error codes | Most validation errors lack machine-readable codes | Difficult to map to translations |
| Hardcoded English strings | All ~100+ error messages are English | No i18n support |
| Variable inclusion in messages | `Invalid QR code URL: ${body.qrCodeUrl}` | Cannot use simple translation lookup |
| Inconsistent status codes | Same error type returns different codes across endpoints | Unpredictable API behavior |

---

## Dependencies

### From Epic 1 (Foundation)
- `next-intl` package installed ✓
- Translation files structure (`/messages/*.json`) ✓
- `errors` namespace stub in `/messages/en.json` ✓

### From Task 2J.1 (Prerequisite)
- `errors` namespace structure must be created with API-specific keys
- This task builds upon that foundation

---

## Technical Approach

### Phase 1: API Route Inventory

Catalog all 51+ API route files by category:

| Category | Route Files | Estimated Error Strings |
|----------|-------------|------------------------|
| **Authentication** | 8 files | ~25 |
| **User Management** | 6 files | ~15 |
| **Item Operations** | 5 files | ~20 |
| **Article Operations** | 2 files | ~12 |
| **Property Operations** | 4 files | ~15 |
| **Access Requests** | 4 files | ~10 |
| **Admin/Analytics** | 6 files | ~8 |
| **Utility** | 6 files | ~5 |
| **Total** | ~41 unique routes | ~110 unique errors |

### Phase 2: Error Categorization

#### HTTP Status Code Mapping
| Status | Category | Example Keys |
|--------|----------|--------------|
| 400 | Validation Errors | `errors.api.validation.*` |
| 401 | Authentication Errors | `errors.api.auth.*` |
| 403 | Authorization Errors | `errors.api.forbidden.*` |
| 404 | Not Found Errors | `errors.api.notFound.*` |
| 409 | Conflict Errors | `errors.api.conflict.*` |
| 429 | Rate Limiting | `errors.api.rateLimit.*` |
| 500 | Server Errors | `errors.api.server.*` |
| 501 | Not Implemented | `errors.api.notImplemented` |

### Phase 3: Standardized Response Schema

Proposed standardized error response format:

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable: 'VALIDATION_ERROR', 'UNAUTHORIZED'
    messageKey: string;     // Translation key: 'errors.api.validation.required'
    message?: string;       // Fallback English text (development only)
    params?: Record<string, string | number>;  // For interpolation
    field?: string;         // For field-specific validation errors
  };
  debug?: {                 // Development only
    details?: string;
    stack?: string;
  };
}
```

---

## Detailed Audit Findings

### Authentication Errors (8 files)

| File | Current Message | HTTP | Proposed Key | Parameters |
|------|-----------------|------|--------------|------------|
| `/api/auth/login/route.ts:16` | "Email and password are required" | 400 | `errors.api.auth.credentialsRequired` | - |
| `/api/auth/login/route.ts:25` | "Invalid email format" | 400 | `errors.api.validation.invalidEmail` | - |
| `/api/auth/login/route.ts:38` | Dynamic from Supabase | 401 | `errors.api.auth.invalidCredentials` | - |
| `/api/auth/login/route.ts:45` | "Login failed - no data returned" | 500 | `errors.api.server.loginFailed` | - |
| `/api/auth/login/route.ts:68` | "Internal server error" | 500 | `errors.api.server.internal` | - |
| `/api/auth/register/route.ts:59` | "Too many registration attempts..." | 429 | `errors.api.rateLimit.registration` | `{minutes: 15}` |
| `/api/auth/register/route.ts:72` | "Invalid request body" | 400 | `errors.api.validation.invalidBody` | - |
| `/api/auth/register/route.ts:82` | "Email and password are required" | 400 | `errors.api.validation.required` | `{fields: "email, password"}` |
| `/api/auth/register/route.ts:127` | "Please enter a valid email address" | 400 | `errors.api.validation.invalidEmail` | - |
| `/api/auth/register/route.ts:138` | "Password must be at least 8 characters..." | 400 | `errors.api.validation.passwordRequirements` | - |
| `/api/auth/register/route.ts:147` | "Passwords do not match" | 400 | `errors.api.validation.passwordMismatch` | - |
| `/api/auth/register/route.ts:155` | "Full name must be at least 2 characters" | 400 | `errors.api.validation.nameTooShort` | `{min: 2}` |
| `/api/auth/register/route.ts:175` | "An account with this email already exists" | 409 | `errors.api.conflict.emailExists` | - |
| `/api/auth/register/route.ts:191` | "Registration failed - no data returned" | 500 | `errors.api.server.registrationFailed` | - |
| `/api/auth/register/route.ts:246` | "An unexpected error occurred..." | 500 | `errors.api.server.unexpected` | - |
| `/api/auth/register/route.ts:257-271` | "Method not allowed" | 405 | `errors.api.methodNotAllowed` | - |

### Auth Server Utility (`/lib/auth-server.ts`)

| Line | Current Message | HTTP | Proposed Key |
|------|-----------------|------|--------------|
| 40 | "Invalid or expired token" | 401 | `errors.api.auth.invalidToken` |
| 54 | "User email not found in token" | 401 | `errors.api.auth.noEmail` |
| 122 | "User not found in system" | 403 | `errors.api.forbidden.userNotFound` |
| 159 | "Authentication validation failed" | 500 | `errors.api.server.authFailed` |

### Item Operations (`/api/admin/items/route.ts`)

| Line | Current Message | HTTP | Proposed Key | Parameters |
|------|-----------------|------|--------------|------------|
| 30 | "Access denied to requested account" | 403 | `errors.api.forbidden.accountAccess` | - |
| 60 | "No account access found for user" | 403 | `errors.api.forbidden.noAccount` | - |
| 76 | "Failed to determine account context" | 500 | `errors.api.server.accountContext` | - |
| 165 | "Failed to fetch items" | 500 | `errors.api.server.fetchFailed` | `{resource: "items"}` |
| 261 | "Internal server error" | 500 | `errors.api.server.internal` | - |
| 297 | "Missing required fields: publicId, name, propertyId" | 400 | `errors.api.validation.missingFields` | `{fields: "..."}` |
| 306 | "publicId must be a valid UUID" | 400 | `errors.api.validation.invalidUuid` | `{field: "publicId"}` |
| 314 | "links must be an array" | 400 | `errors.api.validation.invalidType` | `{field: "links", expected: "array"}` |
| 325 | "Invalid QR code URL: {url}" | 400 | `errors.api.validation.invalidUrl` | `{field: "qrCodeUrl"}` |
| 336 | "Invalid link type: {type}" | 400 | `errors.api.validation.invalidLinkType` | `{value: "...", allowed: "..."}` |
| 346 | "Invalid URL: {url}" | 400 | `errors.api.validation.invalidUrl` | `{url: "..."}` |
| 363 | "Invalid or missing article purpose" | 400 | `errors.api.validation.invalidPurpose` | - |
| 391 | "Invalid property ID..." | 400 | `errors.api.validation.invalidProperty` | - |
| 399 | "Property does not belong to account" | 403 | `errors.api.forbidden.propertyAccess` | - |
| 424 | "An item with this public ID already exists" | 409 | `errors.api.conflict.itemExists` | - |
| 429 | "Failed to create item" | 500 | `errors.api.server.createFailed` | `{resource: "item"}` |
| 461 | "Failed to create article" | 500 | `errors.api.server.createFailed` | `{resource: "article"}` |
| 496 | "Failed to create links" | 500 | `errors.api.server.createFailed` | `{resource: "links"}` |
| 558 | "Internal server error" | 500 | `errors.api.server.internal` | - |

### User Properties (`/api/user/properties/route.ts`)

| Line | Current Message | HTTP | Proposed Key |
|------|-----------------|------|--------------|
| 23 | "Missing or invalid authorization header" | 401 | `errors.api.auth.missingAuth` |
| 35 | "Invalid session token" | 401 | `errors.api.auth.invalidSession` |
| 51 | "Invalid authorization token" | 401 | `errors.api.auth.invalidToken` |
| 62 | "Authentication validation failed" | 500 | `errors.api.server.authFailed` |
| 138 | "User not found" | 401 | `errors.api.auth.userNotFound` |
| 175 | "Failed to fetch properties" | 500 | `errors.api.server.fetchFailed` |
| 190 | "Internal server error" | 500 | `errors.api.server.internal` |
| 220 | "No account context available" | 400 | `errors.api.validation.noAccountContext` |
| 231 | "Property name is required" | 400 | `errors.api.validation.required` |
| 238 | "Property name must be 100 characters or less" | 400 | `errors.api.validation.maxLength` |
| 255 | "No property types configured" | 500 | `errors.api.server.configError` |
| 285 | "Failed to create property" | 500 | `errors.api.server.createFailed` |
| 301 | "Internal server error" | 500 | `errors.api.server.internal` |

### Access Requests (`/api/admin/access-requests/route.ts`)

| Line | Current Message | HTTP | Proposed Key |
|------|-----------------|------|--------------|
| 38 | "Access denied. This feature is restricted to system administrators." | 403 | `errors.api.forbidden.sysadminRequired` |
| 105 | "Access requests query failed" | 500 | `errors.api.server.queryFailed` |
| 155 | "Unexpected server error" | 500 | `errors.api.server.unexpected` |
| 167 | "POST not implemented in debug version" | 501 | `errors.api.notImplemented` |

### Articles (`/api/admin/articles/route.ts`)

| Line | Current Message | HTTP | Proposed Key |
|------|-----------------|------|--------------|
| 31 | "Access denied to requested account" | 403 | `errors.api.forbidden.accountAccess` |
| 54 | "No account access found for user" | 403 | `errors.api.forbidden.noAccount` |
| 66 | "Failed to determine account context" | 500 | `errors.api.server.accountContext` |
| 101 | "Missing required parameter: item_id or property_id" | 400 | `errors.api.validation.missingParam` |
| 119 | "Property not found" | 404 | `errors.api.notFound.property` |
| 128 | "Access denied to property" | 403 | `errors.api.forbidden.propertyAccess` |
| 141 | "Failed to fetch items" | 500 | `errors.api.server.fetchFailed` |
| 166 | "Failed to fetch articles" | 500 | `errors.api.server.fetchFailed` |
| 185 | "Item not found" | 404 | `errors.api.notFound.item` |
| 195 | "Access denied to item" | 403 | `errors.api.forbidden.itemAccess` |
| 209 | "Failed to fetch articles" | 500 | `errors.api.server.fetchFailed` |
| 269 | "Internal server error" | 500 | `errors.api.server.internal` |
| 302 | "Missing required field: itemId" | 400 | `errors.api.validation.required` |
| 308 | "Invalid or missing purpose" | 400 | `errors.api.validation.invalidPurpose` |
| 322 | "Item not found" | 404 | `errors.api.notFound.item` |
| 331 | "Access denied to item" | 403 | `errors.api.forbidden.itemAccess` |
| 369 | "Failed to create article" | 500 | `errors.api.server.createFailed` |
| 397 | "Internal server error" | 500 | `errors.api.server.internal` |

---

## Proposed Translation Keys Structure

### `errors.api` Namespace Addition to `/messages/en.json`

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

## Centralized Error Utility Recommendation

### Proposed: `/src/lib/api-errors.ts`

```typescript
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

export interface ApiError {
  code: ApiErrorCode;
  messageKey: string;
  params?: Record<string, string | number>;
  field?: string;
}

export function createApiError(
  code: ApiErrorCode,
  messageKey: string,
  options?: {
    status?: number;
    params?: Record<string, string | number>;
    field?: string;
    debug?: string;
  }
): NextResponse {
  const statusMap: Record<ApiErrorCode, number> = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
  };

  const status = options?.status ?? statusMap[code];

  const response: any = {
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

// Convenience helpers
export const apiErrors = {
  validation: (messageKey: string, params?: Record<string, any>, field?: string) =>
    createApiError('VALIDATION_ERROR', messageKey, { params, field }),

  unauthorized: (messageKey = 'errors.api.auth.invalidToken') =>
    createApiError('UNAUTHORIZED', messageKey),

  forbidden: (messageKey = 'errors.api.forbidden.generic') =>
    createApiError('FORBIDDEN', messageKey),

  notFound: (resource: string) =>
    createApiError('NOT_FOUND', `errors.api.notFound.${resource}`),

  conflict: (messageKey: string, params?: Record<string, any>) =>
    createApiError('CONFLICT', messageKey, { params }),

  serverError: (debug?: string) =>
    createApiError('SERVER_ERROR', 'errors.api.server.internal', { debug }),
};
```

---

## Authorized Files and Functions for Modification

### Audit Documentation (This Task)
| File | Purpose | Action |
|------|---------|--------|
| `/docs/REQ-350-audit-*.md` | This overview document | CREATE |
| `/docs/api-error-audit-report.md` | Detailed findings (optional) | CREATE |

### Future Implementation (Subsequent Tasks)
| File | Functions/Sections | Action |
|------|-------------------|--------|
| `/src/lib/api-errors.ts` | New utility file | CREATE |
| `/messages/en.json` | `errors.api` namespace | EXTEND |
| `/messages/{fr,es,de,nl,it}.json` | `errors.api` namespace | EXTEND |
| `/src/lib/auth-server.ts` | `validateAdminAuth()` | MODIFY |
| `/src/app/api/auth/login/route.ts` | `POST` handler | MODIFY |
| `/src/app/api/auth/register/route.ts` | `POST`, `GET`, `PUT`, `DELETE` handlers | MODIFY |
| `/src/app/api/admin/items/route.ts` | `GET`, `POST` handlers, `getAccountContext()` | MODIFY |
| `/src/app/api/admin/articles/route.ts` | `GET`, `POST` handlers | MODIFY |
| `/src/app/api/user/properties/route.ts` | `GET`, `POST` handlers, `validateUserAuth()` | MODIFY |
| `/src/app/api/admin/access-requests/route.ts` | `GET` handler | MODIFY |
| All other `/src/app/api/**/*.ts` files | Error response statements | MODIFY |

---

## Implementation Checklist

### Phase 1: Documentation (This Task)
- [x] Catalog all API route files (51+ files identified)
- [x] Document current error handling patterns (4 patterns identified)
- [x] List all hardcoded error messages (~110 unique)
- [x] Categorize errors by HTTP status code
- [x] Propose standardized error response schema
- [x] Map each error to translation key
- [x] Identify errors with dynamic parameters
- [x] Document consistency issues
- [x] Propose centralized error utility

### Phase 2: Implementation (Future Tasks)
- [ ] Create `/src/lib/api-errors.ts` utility
- [ ] Extend `errors.api` namespace in translation files
- [ ] Migrate auth routes to use new utility
- [ ] Migrate admin routes to use new utility
- [ ] Migrate user routes to use new utility
- [ ] Generate translations for 5 non-English languages
- [ ] Update frontend error handling to use message keys
- [ ] Test error responses in all languages

---

## Before and After Examples

### Example 1: Login Validation Error

**Before:**
```typescript
return NextResponse.json(
  { success: false, error: 'Email and password are required' },
  { status: 400 }
);
```

**After:**
```typescript
return apiErrors.validation('errors.api.auth.credentialsRequired');

// Response:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "messageKey": "errors.api.auth.credentialsRequired"
  }
}
```

### Example 2: Item Not Found

**Before:**
```typescript
return NextResponse.json(
  { success: false, error: 'Item not found' },
  { status: 404 }
);
```

**After:**
```typescript
return apiErrors.notFound('item');

// Response:
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "messageKey": "errors.api.notFound.item"
  }
}
```

### Example 3: Validation with Parameters

**Before:**
```typescript
return NextResponse.json(
  { success: false, error: `Invalid link type: ${link.linkType}. Must be one of: ${validLinkTypes.join(', ')}` },
  { status: 400 }
);
```

**After:**
```typescript
return apiErrors.validation(
  'errors.api.validation.invalidLinkType',
  { value: link.linkType, allowed: validLinkTypes.join(', ') },
  'linkType'
);

// Response:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "messageKey": "errors.api.validation.invalidLinkType",
    "params": {
      "value": "invalid_type",
      "allowed": "youtube, pdf, image, text, video"
    },
    "field": "linkType"
  }
}
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking frontend error handling | Medium | High | Ensure response structure is backwards compatible |
| Missing error scenarios | Medium | Low | Add fallback to generic error keys |
| Translation key typos | Low | Medium | TypeScript types for error keys |
| Exposing debug info in production | Low | High | Environment checks for debug fields |

---

## Technical Notes

1. **Backwards Compatibility**: The new error response structure includes the original `error` field content in the `messageKey` field, allowing gradual migration.

2. **Frontend Integration**: Frontend components should use the `messageKey` to look up translations via `useTranslations('errors')` hook.

3. **Development vs Production**: Debug information (stack traces, detailed error messages) should only be included in development builds.

4. **Zod Integration**: For routes using Zod validation, consider creating a utility that maps Zod errors to the standardized format.

5. **Third-Party Errors**: Supabase and other service errors should be mapped to appropriate user-facing message keys, not exposed directly.

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Translation Files](/messages/en.json)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- Sub-Epic 2J: Error Messages & Validation (Tasks 2J.1-2J.7)
