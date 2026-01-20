# REQ-E02-034: Audit All API Error Handling and Messages - Detailed Task Breakdown

*Generated: 2026-01-20 18:30:00 UTC*
*Last Modified: 2026-01-20 18:30:00 UTC*

## Reference

- **Request ID**: REQ-E02-034
- **Overview Document**: docs/REQ-E02-034-audit-all-api-error-handling-and-messages-overview.md
- **Source Requirements**: docs/gen_requests_epic2.md (Request #34)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Sub-Epic**: 2J - Error Messages & Validation
- **Task ID**: 2J.3
- **Size**: L (Large)
- **Estimated Effort**: 8-12 hours
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - Task 2J.1 (REQ-E02-032: Create Errors Namespace Structure)

---

## Executive Summary

This task performs a comprehensive audit of all 51 API route handlers throughout the FAQBNB backend to identify error messages and error responses that need internationalization. The audit catalogs every error response pattern, establishes consistent error handling approaches, designs centralized error utilities, and maps error messages to translation keys in the `errors` namespace.

**Key Finding**: The codebase has 51 API route files with an estimated 170+ error messages across varied patterns:
- Basic error response (most common)
- Error response with code
- Error response with details
- Validation error with array

This task is primarily **audit and design work** - actual migration of API routes will occur in subsequent tasks.

---

## Pre-Implementation Checklist

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] Task 2J.1 is complete (`errors` namespace structure exists in `/messages/en.json`)
- [ ] Access to all API route files in `/src/app/api/`
- [ ] Access to auth utilities in `/src/lib/auth-server.ts`
- [ ] Understanding of existing error patterns in the codebase

---

## Task Breakdown

### Phase 1: Create Audit Documentation Structure (Tasks 1-2)

---

### Task 1: Set Up Audit Documentation
**Effort**: 30 minutes
**Type**: Documentation

#### Purpose
Create a structured audit document to track all API error responses discovered during the audit.

#### Steps

1.1. **Create audit directory if it doesn't exist**
```bash
mkdir -p docs/audit
```

1.2. **Create the audit report template**

Create file: `/docs/audit/api-error-audit-report.md`

```markdown
# API Error Audit Report

*Generated: 2026-01-XX*
*Last Modified: 2026-01-XX*

## Overview

This document catalogs all error responses found in FAQBNB API routes for internationalization purposes.

## Summary Statistics

| Category | Route Count | Error Count |
|----------|-------------|-------------|
| Authentication | 8 | TBD |
| Item Management | 6 | TBD |
| Property Management | 7 | TBD |
| Article Management | 2 | TBD |
| Access Management | 7 | TBD |
| Upload & Media | 3 | TBD |
| Translation | 2 | TBD |
| Account & User | 7 | TBD |
| Analytics | 3 | TBD |
| Miscellaneous | 6 | TBD |
| **Total** | **51** | **TBD** |

## Error Pattern Analysis

### Pattern 1: Basic Error Response
`json
{ "success": false, "error": "Message text" }
`

### Pattern 2: Error Response with Code
`json
{ "success": false, "error": "Message text", "code": "ERROR_CODE" }
`

### Pattern 3: Error Response with Details
`json
{ "success": false, "error": "Message text", "details": "Additional info" }
`

### Pattern 4: Validation Error with Array
`json
{ "success": false, "error": "Validation failed", "details": ["field1", "field2"] }
`

## Detailed Audit by Category

[Categories will be filled in during audit tasks]
```

#### Acceptance Criteria
- [ ] Audit directory created at `/docs/audit/`
- [ ] Template file created with proper structure
- [ ] Categories match the API route inventory from overview document

---

### Task 2: Create Standard Error Response TypeScript Types
**Effort**: 30 minutes
**Type**: Implementation

#### Location
- **New File**: `/src/types/api-errors.ts`

#### Implementation

2.1. **Create the TypeScript types file**

```typescript
// /src/types/api-errors.ts

/**
 * Standard API error codes for consistent error handling
 */
export enum ApiErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',

  // File
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Rate Limiting
  RATE_LIMITED = 'RATE_LIMITED',

  // Method
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
}

/**
 * Error details can be a string, array of strings, or field-specific errors
 */
export type ErrorDetails = string | string[] | Record<string, string>;

/**
 * Standard error response format for all API endpoints
 */
export interface StandardErrorResponse {
  success: false;
  error: string;                    // User-friendly translated message
  code?: ApiErrorCode;              // Machine-readable error code
  details?: ErrorDetails;           // Additional context
  field?: string;                   // For field-specific validation errors
}

/**
 * Standard success response format
 */
export interface StandardSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Union type for all API responses
 */
export type StandardApiResponse<T = unknown> = StandardSuccessResponse<T> | StandardErrorResponse;

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(response: StandardApiResponse): response is StandardErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(response: StandardApiResponse<T>): response is StandardSuccessResponse<T> {
  return response.success === true;
}

/**
 * HTTP status code mapping for error codes
 */
export const ErrorCodeStatusMap: Record<ApiErrorCode, number> = {
  // Authentication (401)
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.SESSION_EXPIRED]: 401,
  [ApiErrorCode.INVALID_CREDENTIALS]: 401,

  // Authorization (403)
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.ACCESS_DENIED]: 403,

  // Validation (400)
  [ApiErrorCode.VALIDATION_FAILED]: 400,
  [ApiErrorCode.INVALID_INPUT]: 400,
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: 400,

  // Resources
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.ALREADY_EXISTS]: 409,

  // Server
  [ApiErrorCode.INTERNAL_ERROR]: 500,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.TIMEOUT]: 408,

  // File (400 category)
  [ApiErrorCode.FILE_TOO_LARGE]: 413,
  [ApiErrorCode.INVALID_FILE_TYPE]: 415,
  [ApiErrorCode.UPLOAD_FAILED]: 500,

  // Rate Limiting
  [ApiErrorCode.RATE_LIMITED]: 429,

  // Method
  [ApiErrorCode.METHOD_NOT_ALLOWED]: 405,
};

/**
 * Mapping from error codes to translation keys in errors namespace
 */
export const ErrorCodeTranslationKeyMap: Record<ApiErrorCode, string> = {
  // Authentication
  [ApiErrorCode.UNAUTHORIZED]: 'auth.sessionExpired',
  [ApiErrorCode.SESSION_EXPIRED]: 'auth.sessionExpired',
  [ApiErrorCode.INVALID_CREDENTIALS]: 'auth.invalidCredentials',

  // Authorization
  [ApiErrorCode.FORBIDDEN]: 'api.forbidden',
  [ApiErrorCode.ACCESS_DENIED]: 'auth.accessDenied',

  // Validation
  [ApiErrorCode.VALIDATION_FAILED]: 'api.badRequest',
  [ApiErrorCode.INVALID_INPUT]: 'api.badRequest',
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: 'form.required',

  // Resources
  [ApiErrorCode.NOT_FOUND]: 'api.notFound',
  [ApiErrorCode.CONFLICT]: 'api.conflict',
  [ApiErrorCode.ALREADY_EXISTS]: 'api.conflict',

  // Server
  [ApiErrorCode.INTERNAL_ERROR]: 'api.serverError',
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 'system.maintenance',
  [ApiErrorCode.TIMEOUT]: 'api.timeout',

  // File
  [ApiErrorCode.FILE_TOO_LARGE]: 'file.tooLarge',
  [ApiErrorCode.INVALID_FILE_TYPE]: 'file.invalidType',
  [ApiErrorCode.UPLOAD_FAILED]: 'file.uploadFailed',

  // Rate Limiting
  [ApiErrorCode.RATE_LIMITED]: 'system.rateLimit',

  // Method
  [ApiErrorCode.METHOD_NOT_ALLOWED]: 'api.methodNotAllowed',
};
```

2.2. **Export from types index**

Update `/src/types/index.ts` to include:
```typescript
export * from './api-errors';
```

#### Acceptance Criteria
- [ ] `ApiErrorCode` enum created with all standard error codes
- [ ] `StandardErrorResponse` interface defined
- [ ] Type guards created for response type checking
- [ ] Error code to status code mapping created
- [ ] Error code to translation key mapping created
- [ ] Types exported from index file

---

### Phase 2: Audit Authentication API Routes (Tasks 3-4)

---

### Task 3: Audit Authentication Routes - Part 1
**Effort**: 45 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/auth/login/route.ts`
2. `/src/app/api/auth/register/route.ts`
3. `/src/app/api/auth/logout/route.ts`
4. `/src/app/api/auth/session/route.ts`

#### Steps

3.1. **Audit login/route.ts**

Read the file and document all error responses:

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/login` | POST | Missing email/password | 400 | "Email and password are required" | Basic | `errors.form.required` |
| `/api/auth/login` | POST | Invalid email format | 400 | "Invalid email format" | Basic | `errors.form.email.invalid` |
| `/api/auth/login` | POST | Login failed | 401 | "Login failed - no data returned" | Basic | `errors.auth.loginFailed` |
| `/api/auth/login` | POST | Invalid credentials | 401 | "Invalid email or password" | Basic | `errors.auth.invalidCredentials` |
| `/api/auth/login` | POST | Server error | 500 | "Internal server error" | Basic | `errors.api.serverError` |

3.2. **Audit register/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/register` | POST | Rate limited | 429 | "Too many registration attempts..." | Basic | `errors.system.rateLimitRegistration` |
| `/api/auth/register` | POST | Invalid body | 400 | "Invalid request body" | Basic | `errors.api.badRequest` |
| `/api/auth/register` | POST | Missing fields | 400 | "Email and password are required" | Basic | `errors.form.required` |
| `/api/auth/register` | POST | Invalid access code | 400 | "Invalid access code" | Basic | `errors.auth.accessCodeInvalid` |
| `/api/auth/register` | POST | Invalid email | 400 | "Please enter a valid email address" | Basic | `errors.form.email.invalid` |
| `/api/auth/register` | POST | Weak password | 400 | "Password must be at least 8 characters..." | Basic | `errors.form.password.tooWeak` |
| `/api/auth/register` | POST | Mismatch | 400 | "Passwords do not match" | Basic | `errors.form.password.mismatch` |
| `/api/auth/register` | POST | Server error | 500 | "Registration failed" | With details | `errors.auth.registrationFailed` |

3.3. **Audit logout/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/logout` | POST | Logout failed | 500 | "Logout failed" | With details | `errors.auth.logoutFailed` |

3.4. **Audit session/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/session` | GET | No session | 401 | "No active session" | Basic | `errors.auth.noSession` |
| `/api/auth/session` | GET | Server error | 500 | "Failed to fetch session" | With details | `errors.api.serverError` |

3.5. **Update audit report with findings**

Add the documented errors to `/docs/audit/api-error-audit-report.md` under "Authentication Routes - Part 1"

#### Acceptance Criteria
- [ ] login/route.ts fully audited
- [ ] register/route.ts fully audited
- [ ] logout/route.ts fully audited
- [ ] session/route.ts fully audited
- [ ] All errors documented with translation key mappings
- [ ] Audit report updated with findings

---

### Task 4: Audit Authentication Routes - Part 2
**Effort**: 45 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/auth/validate-code/route.ts`
2. `/src/app/api/auth/complete-oauth-registration/route.ts`
3. `/src/app/api/auth/google/route.ts`
4. `/src/app/api/auth/google/callback/route.ts`

#### Steps

4.1. **Audit validate-code/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/validate-code` | GET/POST | Rate limited | 429 | "Too many validation attempts..." | Basic | `errors.system.rateLimitValidation` |
| `/api/auth/validate-code` | GET/POST | Missing params | 400 | "Both code and email parameters are required" | Basic | `errors.form.required` |
| `/api/auth/validate-code` | GET/POST | Invalid code format | 400 | "Invalid access code format" | Basic | `errors.auth.accessCodeFormat` |
| `/api/auth/validate-code` | GET/POST | Invalid email format | 400 | "Invalid email format" | Basic | `errors.form.email.invalid` |
| `/api/auth/validate-code` | GET/POST | Code not found | 404 | "Access code not found" | Basic | `errors.auth.accessCodeNotFound` |
| `/api/auth/validate-code` | GET/POST | Email mismatch | 400 | "Email does not match" | Basic | `errors.auth.emailMismatch` |

4.2. **Audit complete-oauth-registration/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/complete-oauth-registration` | POST | No pending session | 400 | "No pending OAuth registration" | Basic | `errors.auth.oauthNoPending` |
| `/api/auth/complete-oauth-registration` | POST | Invalid access code | 400 | "Invalid access code" | Basic | `errors.auth.accessCodeInvalid` |
| `/api/auth/complete-oauth-registration` | POST | Email mismatch | 400 | "Email does not match access request" | Basic | `errors.auth.emailMismatch` |
| `/api/auth/complete-oauth-registration` | POST | Server error | 500 | "Failed to complete registration" | With details | `errors.auth.registrationFailed` |

4.3. **Audit google/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/google` | GET | Config missing | 500 | "OAuth configuration error" | Basic | `errors.system.oauthConfigError` |
| `/api/auth/google` | GET | Server error | 500 | "Failed to initiate OAuth" | Basic | `errors.auth.oauthInitFailed` |

4.4. **Audit google/callback/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/auth/google/callback` | GET | Missing code | 400 | "Authorization code missing" | Basic | `errors.auth.oauthCodeMissing` |
| `/api/auth/google/callback` | GET | Token exchange failed | 401 | "Failed to exchange authorization code" | Basic | `errors.auth.oauthTokenExchangeFailed` |
| `/api/auth/google/callback` | GET | User info failed | 401 | "Failed to get user info" | Basic | `errors.auth.oauthUserInfoFailed` |
| `/api/auth/google/callback` | GET | Server error | 500 | "OAuth callback failed" | Basic | `errors.auth.oauthCallbackFailed` |

4.5. **Update audit report with findings**

#### Acceptance Criteria
- [ ] validate-code/route.ts fully audited
- [ ] complete-oauth-registration/route.ts fully audited
- [ ] google/route.ts fully audited
- [ ] google/callback/route.ts fully audited
- [ ] All errors documented with translation key mappings
- [ ] Audit report updated with findings

---

### Phase 3: Audit Item Management API Routes (Tasks 5-6)

---

### Task 5: Audit Item Management Routes - Admin
**Effort**: 45 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/admin/items/route.ts`
2. `/src/app/api/admin/items/[publicId]/route.ts`
3. `/src/app/api/admin/items/[publicId]/analytics/route.ts`

#### Steps

5.1. **Audit admin/items/route.ts (GET and POST)**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/items` | GET | Auth failed | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| `/api/admin/items` | GET | Account access denied | 403 | "Access denied to requested account" | With code | `errors.auth.accessDenied` |
| `/api/admin/items` | GET | Fetch failed | 500 | "Failed to fetch items" | With details | `errors.item.fetchFailed` |
| `/api/admin/items` | POST | Auth failed | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| `/api/admin/items` | POST | Missing fields | 400 | "Missing required fields" | Basic | `errors.form.required` |
| `/api/admin/items` | POST | Invalid publicId | 400 | "publicId must be a valid UUID" | Basic | `errors.item.publicIdFormat` |
| `/api/admin/items` | POST | Invalid links | 400 | "links must be an array" | Basic | `errors.item.linksInvalid` |
| `/api/admin/items` | POST | Invalid link type | 400 | "Invalid link type" | With details | `errors.item.linkTypeInvalid` |
| `/api/admin/items` | POST | Invalid URL | 400 | "Invalid URL" | With details | `errors.form.url.invalid` |
| `/api/admin/items` | POST | Duplicate | 409 | "An item with this public ID already exists" | With code | `errors.item.duplicatePublicId` |
| `/api/admin/items` | POST | Create failed | 500 | "Failed to create item" | With details | `errors.item.createFailed` |

5.2. **Audit admin/items/[publicId]/route.ts (GET, PUT, DELETE)**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/items/[publicId]` | GET | Auth failed | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| `/api/admin/items/[publicId]` | GET | Not found | 404 | "Item not found" | Basic | `errors.item.notFound` |
| `/api/admin/items/[publicId]` | GET | Fetch failed | 500 | "Failed to fetch item" | With details | `errors.item.fetchFailed` |
| `/api/admin/items/[publicId]` | PUT | Auth failed | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| `/api/admin/items/[publicId]` | PUT | Invalid body | 400 | "Invalid request body" | Basic | `errors.api.badRequest` |
| `/api/admin/items/[publicId]` | PUT | Not found | 404 | "Item not found" | Basic | `errors.item.notFound` |
| `/api/admin/items/[publicId]` | PUT | Update failed | 500 | "Failed to update item" | With details | `errors.item.updateFailed` |
| `/api/admin/items/[publicId]` | DELETE | Auth failed | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| `/api/admin/items/[publicId]` | DELETE | Not found | 404 | "Item not found" | Basic | `errors.item.notFound` |
| `/api/admin/items/[publicId]` | DELETE | Delete failed | 500 | "Failed to delete item" | With details | `errors.item.deleteFailed` |

5.3. **Audit admin/items/[publicId]/analytics/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/items/[publicId]/analytics` | GET | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/items/[publicId]/analytics` | GET | Fetch failed | 500 | "Failed to fetch analytics" | With details | `errors.analytics.fetchFailed` |

#### Acceptance Criteria
- [ ] admin/items/route.ts fully audited (GET + POST)
- [ ] admin/items/[publicId]/route.ts fully audited (GET + PUT + DELETE)
- [ ] admin/items/[publicId]/analytics/route.ts fully audited
- [ ] All errors documented with translation key mappings

---

### Task 6: Audit Item Management Routes - Public
**Effort**: 20 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/items/[publicId]/route.ts`
2. `/src/app/api/items/[publicId]/reactions/route.ts`

#### Steps

6.1. **Audit items/[publicId]/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/items/[publicId]` | GET | Missing ID | 400 | "Public ID is required" | Basic | `errors.item.publicIdRequired` |
| `/api/items/[publicId]` | GET | Not found | 404 | "Item not found" | Basic | `errors.item.notFound` |
| `/api/items/[publicId]` | GET | Server error | 500 | "Internal server error" | Basic | `errors.api.serverError` |

6.2. **Audit items/[publicId]/reactions/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/items/[publicId]/reactions` | POST | Missing ID | 400 | "Public ID is required" | Basic | `errors.item.publicIdRequired` |
| `/api/items/[publicId]/reactions` | POST | Invalid reaction | 400 | "Invalid reaction type" | Basic | `errors.item.reactionInvalid` |
| `/api/items/[publicId]/reactions` | POST | Server error | 500 | "Failed to record reaction" | Basic | `errors.item.reactionFailed` |

#### Acceptance Criteria
- [ ] items/[publicId]/route.ts fully audited
- [ ] items/[publicId]/reactions/route.ts fully audited
- [ ] All errors documented with translation key mappings

---

### Phase 4: Audit Property Management API Routes (Task 7)

---

### Task 7: Audit Property Management Routes
**Effort**: 45 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/admin/properties/route.ts`
2. `/src/app/api/admin/properties/[propertyId]/route.ts`
3. `/src/app/api/user/properties/route.ts`
4. `/src/app/api/user/properties/[propertyId]/route.ts`
5. `/src/app/api/user/properties/[propertyId]/items/route.ts`
6. `/src/app/api/user/properties/summary/route.ts`
7. `/src/app/api/user/properties/default/route.ts`

#### Steps

7.1. **Audit admin/properties/route.ts (GET and POST)**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/properties` | GET | Auth failed | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| `/api/admin/properties` | GET | Fetch failed | 500 | "Failed to fetch properties" | With details | `errors.property.fetchFailed` |
| `/api/admin/properties` | POST | Auth failed | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| `/api/admin/properties` | POST | Missing nickname | 400 | "Property nickname is required" | Basic | `errors.property.nameRequired` |
| `/api/admin/properties` | POST | Missing type | 400 | "Property type is required" | Basic | `errors.property.typeRequired` |
| `/api/admin/properties` | POST | Validation failed | 400 | "Validation failed" | With details | `errors.api.badRequest` |
| `/api/admin/properties` | POST | Create failed | 500 | "Failed to create property" | With details | `errors.property.createFailed` |

7.2. **Audit admin/properties/[propertyId]/route.ts (GET, PUT, DELETE)**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/properties/[propertyId]` | GET | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/properties/[propertyId]` | GET | Not found | 404 | "Property not found" | Basic | `errors.property.notFound` |
| `/api/admin/properties/[propertyId]` | PUT | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/properties/[propertyId]` | PUT | Not found | 404 | "Property not found" | Basic | `errors.property.notFound` |
| `/api/admin/properties/[propertyId]` | PUT | Update failed | 500 | "Failed to update property" | With details | `errors.property.updateFailed` |
| `/api/admin/properties/[propertyId]` | DELETE | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/properties/[propertyId]` | DELETE | Not found | 404 | "Property not found" | Basic | `errors.property.notFound` |
| `/api/admin/properties/[propertyId]` | DELETE | Delete failed | 500 | "Failed to delete property" | With details | `errors.property.deleteFailed` |

7.3. **Audit remaining user property routes**

Document similar patterns for:
- `user/properties/route.ts`
- `user/properties/[propertyId]/route.ts`
- `user/properties/[propertyId]/items/route.ts`
- `user/properties/summary/route.ts`
- `user/properties/default/route.ts`

#### Acceptance Criteria
- [ ] All 7 property routes fully audited
- [ ] All errors documented with translation key mappings
- [ ] Audit report updated

---

### Phase 5: Audit Article, Access, Upload Routes (Tasks 8-10)

---

### Task 8: Audit Article Management Routes
**Effort**: 25 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/admin/articles/route.ts`
2. `/src/app/api/admin/articles/[articleId]/route.ts`

#### Steps

8.1. **Audit admin/articles/route.ts (GET and POST)**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/articles` | GET | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/articles` | GET | Fetch failed | 500 | "Failed to fetch articles" | With details | `errors.article.fetchFailed` |
| `/api/admin/articles` | POST | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/articles` | POST | Missing title | 400 | "Article title is required" | Basic | `errors.article.titleRequired` |
| `/api/admin/articles` | POST | Create failed | 500 | "Failed to create article" | With details | `errors.article.createFailed` |

8.2. **Audit admin/articles/[articleId]/route.ts (GET, PUT, DELETE)**

Document GET, PUT, DELETE error patterns.

#### Acceptance Criteria
- [ ] admin/articles/route.ts fully audited
- [ ] admin/articles/[articleId]/route.ts fully audited
- [ ] All errors documented with translation key mappings

---

### Task 9: Audit Access Management Routes
**Effort**: 45 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/admin/access-requests/route.ts`
2. `/src/app/api/admin/access-requests/[requestId]/route.ts`
3. `/src/app/api/admin/access-requests/[requestId]/grant/route.ts`
4. `/src/app/api/admin/grant-access/route.ts`
5. `/src/app/api/admin/deny-access/route.ts`
6. `/src/app/api/access/redeem/route.ts`
7. `/src/app/api/public/access-request/route.ts`

#### Steps

9.1. **Document all error responses for each route**

Key error patterns expected:
- Access request not found
- Already processed
- Invalid email format
- Rate limiting
- Authorization failures

9.2. **Map to translation keys**

| Error Condition | Translation Key |
|-----------------|-----------------|
| Access request not found | `errors.access.notFound` |
| Already approved | `errors.access.alreadyApproved` |
| Already denied | `errors.access.alreadyDenied` |
| Invalid request | `errors.access.invalid` |
| Email required | `errors.form.email.required` |
| Grant failed | `errors.access.grantFailed` |
| Deny failed | `errors.access.denyFailed` |
| Redeem failed | `errors.access.redeemFailed` |

#### Acceptance Criteria
- [ ] All 7 access management routes fully audited
- [ ] All errors documented with translation key mappings
- [ ] Audit report updated

---

### Task 10: Audit Upload & Media Routes
**Effort**: 30 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/admin/upload/route.ts`
2. `/src/app/api/url-metadata/route.ts`
3. `/src/app/api/admin/generate-pdf/route.ts`

#### Steps

10.1. **Audit admin/upload/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/upload` | POST | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/upload` | POST | No file | 400 | "No file provided" | Basic | `errors.file.noFile` |
| `/api/admin/upload` | POST | File too large | 413 | "File too large" | Basic | `errors.file.tooLarge` |
| `/api/admin/upload` | POST | Invalid type | 415 | "Invalid file type" | Basic | `errors.file.invalidType` |
| `/api/admin/upload` | POST | Upload failed | 500 | "Upload failed" | With details | `errors.file.uploadFailed` |

10.2. **Audit url-metadata/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/url-metadata` | GET/POST | URL required | 400 | "URL is required" | Basic | `errors.form.url.required` |
| `/api/url-metadata` | GET/POST | URL too long | 400 | "URL exceeds limit" | Basic | `errors.form.url.tooLong` |
| `/api/url-metadata` | GET/POST | Blocked protocol | 400 | "Blocked protocol" | Basic | `errors.form.url.blockedProtocol` |
| `/api/url-metadata` | GET/POST | Private IP | 400 | "Private IP not allowed" | Basic | `errors.form.url.privateIP` |
| `/api/url-metadata` | GET/POST | Invalid URL | 400 | "Invalid URL format" | Basic | `errors.form.url.invalid` |
| `/api/url-metadata` | GET/POST | Fetch failed | 500 | "Failed to fetch metadata" | Basic | `errors.url.fetchFailed` |

10.3. **Audit admin/generate-pdf/route.ts**

| Endpoint | Method | Error Condition | HTTP Status | Current Message | Response Structure | Translation Key |
|----------|--------|-----------------|-------------|-----------------|-------------------|-----------------|
| `/api/admin/generate-pdf` | POST | Auth failed | 401 | "Unauthorized" | With code | `errors.auth.sessionExpired` |
| `/api/admin/generate-pdf` | POST | Missing data | 400 | "Missing required data" | Basic | `errors.form.required` |
| `/api/admin/generate-pdf` | POST | Generation failed | 500 | "PDF generation failed" | With details | `errors.pdf.generationFailed` |

#### Acceptance Criteria
- [ ] admin/upload/route.ts fully audited
- [ ] url-metadata/route.ts fully audited
- [ ] admin/generate-pdf/route.ts fully audited
- [ ] All errors documented with translation key mappings

---

### Phase 6: Audit Remaining Routes (Tasks 11-13)

---

### Task 11: Audit Translation & Language Routes
**Effort**: 20 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/admin/translate/route.ts`
2. `/src/app/api/user/language/route.ts`

#### Steps

Document all error responses for translation-related routes.

#### Acceptance Criteria
- [ ] Both translation routes fully audited
- [ ] All errors documented with translation key mappings

---

### Task 12: Audit Account & User Routes
**Effort**: 35 minutes
**Type**: Research/Documentation

#### Routes to Audit
1. `/src/app/api/admin/accounts/route.ts`
2. `/src/app/api/admin/accounts/[accountId]/route.ts`
3. `/src/app/api/admin/accounts/users/route.ts`
4. `/src/app/api/user/stats/route.ts`
5. `/src/app/api/user/activity/route.ts`
6. `/src/app/api/user/dashboard/stats/route.ts`
7. `/src/app/api/simple-auth/me/route.ts`

#### Steps

Document all error responses for each route.

#### Acceptance Criteria
- [ ] All 7 account/user routes fully audited
- [ ] All errors documented with translation key mappings

---

### Task 13: Audit Analytics & Miscellaneous Routes
**Effort**: 30 minutes
**Type**: Research/Documentation

#### Routes to Audit

**Analytics:**
1. `/src/app/api/admin/analytics/route.ts`
2. `/src/app/api/admin/analytics/reactions/route.ts`
3. `/src/app/api/admin/users/analytics/route.ts`

**Miscellaneous:**
4. `/src/app/api/visits/route.ts`
5. `/src/app/api/reactions/route.ts`
6. `/src/app/api/mailing-list/route.ts`
7. `/src/app/api/admin/property-types/route.ts`
8. `/src/app/api/admin/check-sysadmin/route.ts`
9. `/src/app/api/version/route.ts`

#### Steps

Document all error responses for each route.

#### Acceptance Criteria
- [ ] All analytics routes fully audited
- [ ] All miscellaneous routes fully audited
- [ ] All errors documented with translation key mappings

---

### Phase 7: Design Centralized Error Utilities (Tasks 14-15)

---

### Task 14: Design Centralized Error Response Utility
**Effort**: 45 minutes
**Type**: Design/Implementation

#### Location
- **New File**: `/src/lib/api-error.ts`

#### Implementation

14.1. **Create the centralized error utility**

```typescript
// /src/lib/api-error.ts

import { getTranslations } from 'next-intl/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  ApiErrorCode,
  StandardErrorResponse,
  ErrorCodeStatusMap,
  ErrorCodeTranslationKeyMap,
  ErrorDetails,
} from '@/types/api-errors';

/**
 * Supported languages for error message translation
 */
const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LOCALES[number];

/**
 * Parse Accept-Language header to extract preferred languages
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map(lang => {
      const [code, q] = lang.trim().split(';q=');
      return { code: code.split('-')[0], priority: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.code);
}

/**
 * Extract locale from request headers, cookies, or default
 */
function getLocaleFromRequest(request: NextRequest): SupportedLanguage {
  // Check custom header first (for frontend requests)
  const headerLocale = request.headers.get('x-locale');
  if (headerLocale && SUPPORTED_LOCALES.includes(headerLocale as SupportedLanguage)) {
    return headerLocale as SupportedLanguage;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const parsed = parseAcceptLanguage(acceptLanguage);
    for (const lang of parsed) {
      if (SUPPORTED_LOCALES.includes(lang as SupportedLanguage)) {
        return lang as SupportedLanguage;
      }
    }
  }

  // Check cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as SupportedLanguage)) {
    return cookieLocale as SupportedLanguage;
  }

  return 'en';
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status: number = ErrorCodeStatusMap[code],
    public details?: ErrorDetails,
    public field?: string
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

/**
 * Create a standardized, translated error response
 */
export async function createErrorResponse(
  request: NextRequest,
  code: ApiErrorCode,
  options?: {
    status?: number;
    details?: ErrorDetails;
    field?: string;
    params?: Record<string, string | number>;
  }
): Promise<NextResponse<StandardErrorResponse>> {
  const locale = getLocaleFromRequest(request);
  const t = await getTranslations({ locale, namespace: 'errors' });

  const translationKey = ErrorCodeTranslationKeyMap[code];
  const message = options?.params
    ? t(translationKey, options.params)
    : t(translationKey);

  const status = options?.status ?? ErrorCodeStatusMap[code];

  const responseBody: StandardErrorResponse = {
    success: false,
    error: message,
    code,
    ...(options?.details && { details: options.details }),
    ...(options?.field && { field: options.field }),
  };

  return NextResponse.json(responseBody, { status });
}

/**
 * Create error response without translation (for non-request contexts)
 */
export function createStaticErrorResponse(
  code: ApiErrorCode,
  message: string,
  options?: {
    status?: number;
    details?: ErrorDetails;
    field?: string;
  }
): NextResponse<StandardErrorResponse> {
  const status = options?.status ?? ErrorCodeStatusMap[code];

  const responseBody: StandardErrorResponse = {
    success: false,
    error: message,
    code,
    ...(options?.details && { details: options.details }),
    ...(options?.field && { field: options.field }),
  };

  return NextResponse.json(responseBody, { status });
}

/**
 * Helper to create common error responses
 */
export const ApiErrors = {
  unauthorized: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.UNAUTHORIZED),

  forbidden: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.FORBIDDEN),

  notFound: (request: NextRequest, resource?: string) =>
    createErrorResponse(request, ApiErrorCode.NOT_FOUND, {
      params: resource ? { resource } : undefined,
    }),

  badRequest: (request: NextRequest, details?: ErrorDetails) =>
    createErrorResponse(request, ApiErrorCode.INVALID_INPUT, { details }),

  validationFailed: (request: NextRequest, details?: ErrorDetails) =>
    createErrorResponse(request, ApiErrorCode.VALIDATION_FAILED, { details }),

  conflict: (request: NextRequest, details?: string) =>
    createErrorResponse(request, ApiErrorCode.CONFLICT, { details }),

  serverError: (request: NextRequest, details?: string) =>
    createErrorResponse(request, ApiErrorCode.INTERNAL_ERROR, { details }),

  rateLimited: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.RATE_LIMITED),
};
```

#### Acceptance Criteria
- [ ] `ApiError` class created for throwing typed errors
- [ ] `createErrorResponse` function created with translation support
- [ ] Locale detection from request implemented
- [ ] Helper functions for common error types created
- [ ] All functions properly typed

---

### Task 15: Update Errors Namespace with API Error Keys
**Effort**: 30 minutes
**Type**: Implementation

#### Location
- **File**: `/messages/en.json`

#### Implementation

15.1. **Add missing API error keys to errors namespace**

Ensure the following keys exist in the `errors` namespace:

```json
{
  "errors": {
    "api": {
      "generic": "Something went wrong. Please try again.",
      "badRequest": "Invalid request",
      "notFound": "The requested resource was not found",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "methodNotAllowed": "Method not allowed"
    },
    "auth": {
      "sessionExpired": "Your session has expired. Please sign in again.",
      "invalidCredentials": "Invalid email or password",
      "accessDenied": "Access denied",
      "loginFailed": "Login failed. Please try again.",
      "logoutFailed": "Logout failed",
      "noSession": "No active session",
      "registrationFailed": "Registration failed",
      "accessCodeInvalid": "Invalid access code",
      "accessCodeFormat": "Invalid access code format",
      "accessCodeNotFound": "Access code not found",
      "accessCodeUsed": "This access code has already been used",
      "accessCodeNotApproved": "Access code is not approved",
      "emailMismatch": "Email does not match the access request",
      "oauthNoPending": "No pending OAuth registration",
      "oauthInitFailed": "Failed to initiate OAuth",
      "oauthCodeMissing": "Authorization code missing",
      "oauthTokenExchangeFailed": "Failed to exchange authorization code",
      "oauthUserInfoFailed": "Failed to get user info",
      "oauthCallbackFailed": "OAuth callback failed"
    },
    "item": {
      "notFound": "Item not found",
      "fetchFailed": "Failed to fetch items",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "publicIdRequired": "Public ID is required",
      "publicIdFormat": "Public ID must be a valid UUID",
      "duplicatePublicId": "An item with this public ID already exists",
      "linksInvalid": "Links must be an array",
      "linkTypeInvalid": "Invalid link type",
      "reactionInvalid": "Invalid reaction type",
      "reactionFailed": "Failed to record reaction"
    },
    "property": {
      "notFound": "Property not found",
      "fetchFailed": "Failed to fetch properties",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property",
      "nameRequired": "Property nickname is required",
      "typeRequired": "Property type is required"
    },
    "article": {
      "notFound": "Article not found",
      "fetchFailed": "Failed to fetch articles",
      "createFailed": "Failed to create article",
      "updateFailed": "Failed to update article",
      "deleteFailed": "Failed to delete article",
      "titleRequired": "Article title is required"
    },
    "access": {
      "notFound": "Access request not found",
      "alreadyApproved": "Access request has already been approved",
      "alreadyDenied": "Access request has already been denied",
      "invalid": "Invalid access request",
      "grantFailed": "Failed to grant access",
      "denyFailed": "Failed to deny access",
      "redeemFailed": "Failed to redeem access code"
    },
    "file": {
      "noFile": "No file provided",
      "tooLarge": "File size exceeds {max} limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again."
    },
    "analytics": {
      "fetchFailed": "Failed to fetch analytics"
    },
    "url": {
      "fetchFailed": "Failed to fetch URL metadata"
    },
    "pdf": {
      "generationFailed": "PDF generation failed"
    },
    "system": {
      "rateLimit": "Too many requests. Please try again later.",
      "rateLimitRegistration": "Too many registration attempts. Please try again in 15 minutes.",
      "rateLimitValidation": "Too many validation attempts. Please try again later.",
      "maintenance": "Service temporarily unavailable",
      "oauthConfigError": "OAuth configuration error",
      "internalError": "Internal error"
    }
  }
}
```

15.2. **Copy structure to all language files**

Ensure the same structure exists in:
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

(Use English as placeholder - actual translations generated in Task 2J.7)

#### Acceptance Criteria
- [ ] All API error keys added to en.json
- [ ] Keys organized by domain (auth, item, property, etc.)
- [ ] Same structure exists in all 6 language files
- [ ] ICU format placeholders used where appropriate

---

### Phase 8: Finalize Documentation (Tasks 16-17)

---

### Task 16: Compile Final Audit Report
**Effort**: 45 minutes
**Type**: Documentation

#### Steps

16.1. **Consolidate all audit findings**

Complete the audit report with:
- Total error count per category
- Pattern analysis summary
- Inconsistencies identified
- Recommended standardization

16.2. **Create inconsistency analysis section**

Document where:
- Similar errors have different messages
- Status codes are used inconsistently
- Response structures vary for similar errors
- Error detail levels differ

16.3. **Create migration priority list**

Rank routes by:
1. User-facing criticality
2. Error frequency
3. Inconsistency level

#### Acceptance Criteria
- [ ] Audit report complete with all findings
- [ ] Inconsistencies documented
- [ ] Migration priority list created
- [ ] Recommendations included

---

### Task 17: Create Developer Guidelines
**Effort**: 30 minutes
**Type**: Documentation

#### Location
- **New File**: `/docs/guides/api-error-handling.md`

#### Implementation

Create a developer guide documenting:

1. How to use the centralized error utilities
2. Standard error response formats
3. Translation key naming conventions
4. Example implementations
5. Testing error responses

```markdown
# API Error Handling Guide

## Overview

This guide explains how to implement consistent, internationalized error handling in FAQBNB API routes.

## Using Centralized Error Utilities

### Import

```typescript
import { createErrorResponse, ApiErrors, ApiErrorCode } from '@/lib/api-error';
```

### Basic Usage

```typescript
// Using helper functions
return ApiErrors.unauthorized(request);
return ApiErrors.notFound(request, 'Item');
return ApiErrors.badRequest(request, 'Invalid input');

// Using createErrorResponse directly
return createErrorResponse(request, ApiErrorCode.VALIDATION_FAILED, {
  details: ['field1 is required', 'field2 is invalid'],
});
```

### With Parameters

```typescript
return createErrorResponse(request, ApiErrorCode.FILE_TOO_LARGE, {
  params: { max: '10MB' },
});
```

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "User-friendly translated message",
  "code": "ERROR_CODE",
  "details": "Optional additional context",
  "field": "optionalFieldName"
}
```

## Translation Key Convention

Keys follow the pattern: `errors.{domain}.{errorType}`

Examples:
- `errors.auth.sessionExpired`
- `errors.item.notFound`
- `errors.form.email.invalid`

## Testing

Test error responses by:
1. Setting `Accept-Language` header
2. Setting `x-locale` header
3. Verifying translated messages

## Migration Guide

When migrating existing routes:
1. Import error utilities
2. Replace `NextResponse.json({ success: false, error: "..." })` with `ApiErrors.*()` or `createErrorResponse()`
3. Ensure translation key exists in `/messages/*.json`
4. Test in multiple languages
```

#### Acceptance Criteria
- [ ] Developer guide created
- [ ] Usage examples included
- [ ] Migration steps documented
- [ ] Testing guidance provided

---

### Phase 9: Verification (Tasks 18-20)

---

### Task 18: Validate JSON Files
**Effort**: 10 minutes
**Type**: Verification

#### Steps

18.1. **Validate JSON syntax**

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/es.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/de.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/nl.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/it.json'))"
```

18.2. **Verify key structure matches across files**

#### Acceptance Criteria
- [ ] All 6 language files are valid JSON
- [ ] No parse errors
- [ ] Key structures match

---

### Task 19: TypeScript Compilation Check
**Effort**: 15 minutes
**Type**: Verification

#### Steps

19.1. **Run TypeScript compiler**

```bash
npx tsc --noEmit
```

19.2. **Verify no type errors in new files**

Check:
- `/src/types/api-errors.ts`
- `/src/lib/api-error.ts`

#### Acceptance Criteria
- [ ] TypeScript compiles without errors
- [ ] All new types are properly defined
- [ ] No implicit any warnings

---

### Task 20: Build Verification
**Effort**: 15 minutes
**Type**: Verification

#### Steps

20.1. **Run development build**

```bash
npm run dev
```

20.2. **Run production build**

```bash
npm run build
```

#### Acceptance Criteria
- [ ] Development server starts without errors
- [ ] Production build completes successfully
- [ ] No warnings related to new files

---

## Complete Implementation Summary

### Files Created

| File | Purpose |
|------|---------|
| `/docs/audit/api-error-audit-report.md` | Comprehensive audit documentation |
| `/src/types/api-errors.ts` | TypeScript types for API errors |
| `/src/lib/api-error.ts` | Centralized error handling utilities |
| `/docs/guides/api-error-handling.md` | Developer guidelines |

### Files Modified

| File | Changes |
|------|---------|
| `/src/types/index.ts` | Export api-errors types |
| `/messages/en.json` | Add API error translation keys |
| `/messages/fr.json` | Sync structure with en.json |
| `/messages/es.json` | Sync structure with en.json |
| `/messages/de.json` | Sync structure with en.json |
| `/messages/nl.json` | Sync structure with en.json |
| `/messages/it.json` | Sync structure with en.json |

### Files Audited (Read-Only)

All 51 API route files were audited:
- 8 Authentication routes
- 6 Item Management routes
- 7 Property Management routes
- 2 Article Management routes
- 7 Access Management routes
- 3 Upload & Media routes
- 2 Translation routes
- 7 Account & User routes
- 3 Analytics routes
- 6 Miscellaneous routes

### Estimated Error Count

| Category | Estimated Errors |
|----------|------------------|
| Authentication | ~25 |
| Item Management | ~30 |
| Property Management | ~20 |
| Article Management | ~12 |
| Access Management | ~25 |
| Upload & Media | ~10 |
| Translation | ~8 |
| Account & User | ~20 |
| Analytics | ~8 |
| Miscellaneous | ~12 |
| **Total** | **~170** |

---

## Success Validation Checklist

### Audit Completeness
- [ ] All 51 API route files systematically reviewed
- [ ] Authentication routes (8) fully audited
- [ ] Item management routes (6) fully audited
- [ ] Property management routes (7) fully audited
- [ ] Article management routes (2) fully audited
- [ ] Access management routes (7) fully audited
- [ ] Upload routes (3) fully audited
- [ ] Translation routes (2) fully audited
- [ ] Account/User routes (7) fully audited
- [ ] Analytics routes (3) fully audited
- [ ] Miscellaneous routes (6) fully audited

### Documentation Completeness
- [ ] Audit report created with all findings
- [ ] Each error documented with endpoint, condition, status, message
- [ ] Inconsistencies clearly identified
- [ ] Migration plan included

### Design Completeness
- [ ] `StandardErrorResponse` interface defined
- [ ] `ApiErrorCode` enum created
- [ ] HTTP status code standards documented
- [ ] Error code to translation key mapping complete
- [ ] Centralized error utility designed
- [ ] Language detection approach documented

### Quality Validation
- [ ] All error codes have corresponding translation keys
- [ ] Status code usage consistent with HTTP standards
- [ ] TypeScript types compile correctly
- [ ] Application builds without errors
- [ ] Developer guidelines documented

---

## Dependencies

### Required (Already Installed from Epic 1)
- `next-intl` - i18n framework
- `next/server` - NextRequest, NextResponse
- TypeScript 5.x - Type checking

### Required from Previous Tasks
- Task 2J.1: Errors namespace structure in `/messages/en.json`

### No New Dependencies Required
This task is primarily audit and design work.

---

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - This task is primarily audit and design, no runtime changes
  - TypeScript types are additive
  - Utility functions are new, not modifying existing code
  - Documentation work has no runtime risk

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing routes in audit | Low | Low | Use glob to find all route files |
| Inconsistent patterns across routes | High | Medium | Document all patterns, prioritize standardization |
| Translation key gaps | Medium | Low | Cross-reference with errors namespace |
| Design doesn't cover all cases | Medium | Medium | Review design against audit findings |

---

## Future Integration Points

This audit informs:

1. **Task 2J.4**: Create centralized error message utility (implements the designed utilities)
2. **Subsequent API Updates**: Each route will be migrated to use centralized utilities
3. **Frontend Error Handling**: Standard error codes enable consistent frontend handling
4. **API Documentation**: Error codes and responses can be documented in API specs

---

## Notes

### Alignment with Plan-111

This implementation follows the structure specified in Plan-111, Section "Sub-Epic 2J: Error Messages & Validation", Task 2J.3.

### Audit Methodology

The audit follows a systematic approach:
1. Glob all `/src/app/api/**/route.ts` files
2. Search for `NextResponse.json` patterns with error indicators
3. Extract error message text, status codes, and response structures
4. Categorize by endpoint type
5. Identify patterns and inconsistencies
6. Map to translation keys

### Backward Compatibility

The design ensures backward compatibility:
- Error response structure maintains `success: false` and `error` fields
- New `code` and `details` fields are optional additions
- Existing API consumers will continue to work

---

*End of Detailed Task Breakdown*
