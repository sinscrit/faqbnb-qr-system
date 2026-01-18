# REQ-317: Audit All API Error Handling and Messages - Implementation Overview

**Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-317
**Type:** ENHANCEMENT
**Size:** L (Large)
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.3

---

## Summary

Audit all API endpoint error handling patterns and error response messages across the application to ensure consistent, user-friendly, and internationalization-ready error communication. This task establishes a standardized error response schema, reviews all 48 API route files, and prepares API error messages for translation while maintaining appropriate security and debuggability.

---

## Business Context

### User Impact
- Users receive clear, understandable error messages when API requests fail
- Consistent error responses across all endpoints create a predictable error experience
- No exposure to technical details, stack traces, or internal system information
- When errors occur, users can report issues with meaningful context

### Business Value
- Standardized API error handling improves application security by preventing information leakage
- Consistent error responses reduce client-side error handling complexity and bugs
- Clear error messages reduce support costs by helping users understand and resolve issues
- Establishes quality standards for API error communication that scale across all endpoints

---

## Technical Context

### Current State Assessment

#### API Route Inventory (48 routes)

| Category | Count | Route Examples |
|----------|-------|----------------|
| **Authentication** | 8 | `/api/auth/login`, `/api/auth/register`, `/api/auth/validate-code`, `/api/auth/complete-oauth-registration`, `/api/auth/session`, `/api/auth/google/*` |
| **Admin - Items** | 4 | `/api/admin/items`, `/api/admin/items/[publicId]`, `/api/admin/items/[publicId]/analytics` |
| **Admin - Articles** | 2 | `/api/admin/articles`, `/api/admin/articles/[articleId]` |
| **Admin - Properties** | 2 | `/api/admin/properties`, `/api/admin/properties/[propertyId]` |
| **Admin - Access** | 5 | `/api/admin/access-requests`, `/api/admin/access-requests/[requestId]`, `/api/admin/grant-access`, `/api/admin/deny-access`, `/api/admin/check-sysadmin` |
| **Admin - Other** | 6 | `/api/admin/accounts`, `/api/admin/accounts/[accountId]`, `/api/admin/accounts/users`, `/api/admin/upload`, `/api/admin/generate-pdf`, `/api/admin/property-types`, `/api/admin/analytics/*` |
| **User** | 8 | `/api/user/properties/*`, `/api/user/stats`, `/api/user/activity`, `/api/user/dashboard/stats` |
| **Public** | 6 | `/api/items/[publicId]`, `/api/items/[publicId]/reactions`, `/api/reactions`, `/api/visits`, `/api/public/access-request`, `/api/url-metadata` |
| **Utility** | 3 | `/api/version`, `/api/access/redeem`, `/api/simple-auth/me`, `/api/mailing-list` |

#### Existing Error Handling Infrastructure

**Error Types (`/src/types/index.ts`):**
```typescript
enum ErrorCode {
  VALIDATION_FAILED
  USER_ALREADY_REGISTERED
  INVALID_ACCESS_CODE
  EMAIL_MISMATCH
  NETWORK_ERROR
  OAUTH_SESSION_EXPIRED
  OAUTH_REGISTRATION_CONFLICT
  OAUTH_AUTHENTICATION_FAILED
}
```

**Error Utilities (`/src/lib/error-utils.ts`):**
- `translateErrorMessage()` - Converts technical errors to user-friendly messages
- `classifyError()` - Categorizes errors by type and severity
- `shouldShowError()` - Determines if error should be displayed
- `getErrorDisplayDuration()` - Returns milliseconds to show error

**HTTP Error Mapping:**
```typescript
HTTP_ERROR_MAPPING: {
  400: { message: "Please check that all required fields...", actionable: true },
  401: { message: "Session expired - please sign in...", actionable: true },
  404: { message: "Invalid access code or email...", actionable: true },
  409: { message: "User already registered...", actionable: true },
  500: { message: "Something went wrong on our end...", actionable: false }
}
```

#### Current Error Patterns Observed

1. **Pattern: Try-Catch with JSON Response** (All routes)
   ```typescript
   } catch (error) {
     console.error('API error:', error);
     return NextResponse.json(
       { success: false, error: 'Internal server error' },
       { status: 500 }
     );
   }
   ```

2. **Pattern: Authentication Validation** (Admin/User routes)
   ```typescript
   const authResult = await validateAdminAuth(request);
   if (authResult.error) return authResult.error;
   ```

3. **Pattern: Account Context Validation**
   ```typescript
   if (accountContext.error) return accountContext.error;
   // Returns 403 with code: 'FORBIDDEN'
   ```

4. **Pattern: Database Error Handling**
   ```typescript
   if (error.code === '23505') {
     return { error: 'An item with this public ID already exists', status: 409 };
   }
   ```

#### Issues Identified

| Issue | Severity | Examples |
|-------|----------|----------|
| **Inconsistent error messages** | Medium | Same scenario has different wording across routes |
| **Generic "Internal server error"** | Medium | ~30 catch blocks return generic message |
| **Missing error codes** | Low | Many responses lack `code` field for programmatic handling |
| **Hardcoded English strings** | Medium | All error messages are hardcoded, not translation-ready |
| **Inconsistent response format** | Low | Some routes use `error`, others use `message` |
| **Missing logging context** | Low | Some errors lack request context for debugging |

---

## Implementation Approach

### Phase 1: Define Standardized Error Schema

Create a standardized error response structure that all API routes will use:

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code (e.g., 'VALIDATION_FAILED')
    message: string;        // User-friendly message (translation key or fallback)
    translationKey?: string; // Translation key for i18n (e.g., 'errors.api.notFound')
    details?: {
      field?: string;       // For validation errors
      value?: unknown;      // For context (not sensitive data)
      params?: Record<string, unknown>; // For interpolation
    };
  };
  statusCode: number;
}
```

### Phase 2: Create Error Translation Mapping

Map all identified error scenarios to translation keys:

```typescript
// /src/lib/api-error-translations.ts
const API_ERROR_KEYS = {
  // Validation Errors (400)
  VALIDATION_FAILED: 'errors.api.validationFailed',
  MISSING_REQUIRED_FIELDS: 'errors.api.missingRequiredFields',
  INVALID_EMAIL_FORMAT: 'errors.form.email',
  INVALID_UUID_FORMAT: 'errors.api.invalidUuidFormat',
  INVALID_URL_FORMAT: 'errors.api.invalidUrlFormat',
  INVALID_LINK_TYPE: 'errors.api.invalidLinkType',

  // Authentication Errors (401)
  AUTHENTICATION_REQUIRED: 'errors.auth.required',
  INVALID_TOKEN: 'errors.auth.invalidToken',
  SESSION_EXPIRED: 'errors.auth.sessionExpired',
  INVALID_CREDENTIALS: 'errors.auth.invalidCredentials',

  // Authorization Errors (403)
  FORBIDDEN: 'errors.api.forbidden',
  ACCESS_DENIED: 'errors.auth.accessDenied',
  ACCOUNT_ACCESS_DENIED: 'errors.api.accountAccessDenied',
  SYSADMIN_REQUIRED: 'errors.api.sysadminRequired',

  // Not Found Errors (404)
  RESOURCE_NOT_FOUND: 'errors.api.notFound',
  ITEM_NOT_FOUND: 'errors.item.notFound',
  PROPERTY_NOT_FOUND: 'errors.property.notFound',
  ARTICLE_NOT_FOUND: 'errors.api.articleNotFound',
  ACCESS_CODE_NOT_FOUND: 'errors.api.accessCodeNotFound',

  // Conflict Errors (409)
  DUPLICATE_ENTRY: 'errors.api.conflict',
  USER_ALREADY_REGISTERED: 'errors.api.userAlreadyRegistered',
  ITEM_ALREADY_EXISTS: 'errors.api.itemAlreadyExists',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: 'errors.api.rateLimitExceeded',

  // Server Errors (500)
  INTERNAL_ERROR: 'errors.api.generic',
  DATABASE_ERROR: 'errors.api.serverError',
  ITEM_CREATION_FAILED: 'errors.item.createFailed',
  ARTICLE_CREATION_FAILED: 'errors.api.articleCreationFailed',
  FILE_UPLOAD_FAILED: 'errors.file.uploadFailed',
};
```

### Phase 3: Create Centralized Error Handler Utility

```typescript
// /src/lib/api-error-handler.ts
import { NextResponse } from 'next/server';

export function createApiError(
  code: keyof typeof API_ERROR_KEYS,
  statusCode: number,
  details?: Record<string, unknown>
): NextResponse {
  const translationKey = API_ERROR_KEYS[code];

  // Fallback message for backwards compatibility
  const fallbackMessage = FALLBACK_MESSAGES[code];

  return NextResponse.json({
    success: false,
    error: {
      code,
      message: fallbackMessage,
      translationKey,
      ...(details && { details }),
    }
  }, { status: statusCode });
}

// Convenience functions
export const badRequest = (code: keyof typeof API_ERROR_KEYS, details?: any) =>
  createApiError(code, 400, details);

export const unauthorized = (code: keyof typeof API_ERROR_KEYS = 'AUTHENTICATION_REQUIRED') =>
  createApiError(code, 401);

export const forbidden = (code: keyof typeof API_ERROR_KEYS = 'FORBIDDEN') =>
  createApiError(code, 403);

export const notFound = (code: keyof typeof API_ERROR_KEYS = 'RESOURCE_NOT_FOUND') =>
  createApiError(code, 404);

export const conflict = (code: keyof typeof API_ERROR_KEYS, details?: any) =>
  createApiError(code, 409, details);

export const internalError = (code: keyof typeof API_ERROR_KEYS = 'INTERNAL_ERROR') =>
  createApiError(code, 500);
```

### Phase 4: Audit and Update API Routes

Systematically review and update each API route file to:
1. Use the standardized error handler
2. Add consistent error codes
3. Include translation keys
4. Ensure proper HTTP status code usage

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/api-error-handler.ts` | Centralized error handler utility |
| `/src/lib/api-error-translations.ts` | Error code to translation key mapping |

### Existing Files to Modify

#### Core Error Infrastructure
| File | Functions/Areas to Modify |
|------|---------------------------|
| `/src/types/index.ts` | Extend `ErrorCode` enum with new API error codes |
| `/src/lib/error-utils.ts` | Add API-specific error translation functions |

#### Authentication Routes (8 files)
| File | Modification Scope |
|------|-------------------|
| `/src/app/api/auth/login/route.ts` | Update POST error responses |
| `/src/app/api/auth/logout/route.ts` | Update error responses |
| `/src/app/api/auth/register/route.ts` | Update POST validation and error responses |
| `/src/app/api/auth/validate-code/route.ts` | Update POST error responses |
| `/src/app/api/auth/complete-oauth-registration/route.ts` | Update POST error responses |
| `/src/app/api/auth/session/route.ts` | Update GET error responses |
| `/src/app/api/auth/google/route.ts` | Update error responses |
| `/src/app/api/auth/google/callback/route.ts` | Update error responses |

#### Admin Routes (19 files)
| File | Modification Scope |
|------|-------------------|
| `/src/app/api/admin/items/route.ts` | Update GET/POST error responses |
| `/src/app/api/admin/items/[publicId]/route.ts` | Update GET/PUT/DELETE error responses |
| `/src/app/api/admin/items/[publicId]/analytics/route.ts` | Update GET error responses |
| `/src/app/api/admin/articles/route.ts` | Update GET/POST error responses |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Update GET/PUT/DELETE error responses |
| `/src/app/api/admin/properties/route.ts` | Update GET/POST error responses |
| `/src/app/api/admin/properties/[propertyId]/route.ts` | Update GET/PUT/DELETE error responses |
| `/src/app/api/admin/access-requests/route.ts` | Update GET/POST error responses |
| `/src/app/api/admin/access-requests/[requestId]/route.ts` | Update GET/PUT/DELETE error responses |
| `/src/app/api/admin/access-requests/[requestId]/grant/route.ts` | Update POST error responses |
| `/src/app/api/admin/grant-access/route.ts` | Update POST error responses |
| `/src/app/api/admin/deny-access/route.ts` | Update POST error responses |
| `/src/app/api/admin/check-sysadmin/route.ts` | Update GET error responses |
| `/src/app/api/admin/accounts/route.ts` | Update GET/POST error responses |
| `/src/app/api/admin/accounts/[accountId]/route.ts` | Update GET/PUT/DELETE error responses |
| `/src/app/api/admin/accounts/users/route.ts` | Update GET error responses |
| `/src/app/api/admin/upload/route.ts` | Update POST error responses |
| `/src/app/api/admin/generate-pdf/route.ts` | Update POST error responses |
| `/src/app/api/admin/property-types/route.ts` | Update GET error responses |
| `/src/app/api/admin/analytics/route.ts` | Update GET error responses |
| `/src/app/api/admin/analytics/reactions/route.ts` | Update GET error responses |
| `/src/app/api/admin/users/analytics/route.ts` | Update GET error responses |

#### User Routes (8 files)
| File | Modification Scope |
|------|-------------------|
| `/src/app/api/user/properties/route.ts` | Update GET/POST error responses |
| `/src/app/api/user/properties/[propertyId]/route.ts` | Update GET/PUT/DELETE error responses |
| `/src/app/api/user/properties/[propertyId]/items/route.ts` | Update GET error responses |
| `/src/app/api/user/properties/default/route.ts` | Update GET error responses |
| `/src/app/api/user/properties/summary/route.ts` | Update GET error responses |
| `/src/app/api/user/stats/route.ts` | Update GET error responses |
| `/src/app/api/user/activity/route.ts` | Update GET error responses |
| `/src/app/api/user/dashboard/stats/route.ts` | Update GET error responses |

#### Public Routes (7 files)
| File | Modification Scope |
|------|-------------------|
| `/src/app/api/items/[publicId]/route.ts` | Update GET error responses |
| `/src/app/api/items/[publicId]/reactions/route.ts` | Update GET/POST error responses |
| `/src/app/api/reactions/route.ts` | Update POST error responses |
| `/src/app/api/visits/route.ts` | Update POST error responses |
| `/src/app/api/public/access-request/route.ts` | Update POST error responses |
| `/src/app/api/url-metadata/route.ts` | Update GET error responses |
| `/src/app/api/mailing-list/route.ts` | Update POST error responses |

#### Utility Routes (4 files)
| File | Modification Scope |
|------|-------------------|
| `/src/app/api/version/route.ts` | Review (minimal changes expected) |
| `/src/app/api/access/redeem/route.ts` | Update POST error responses |
| `/src/app/api/simple-auth/me/route.ts` | Update GET error responses |
| `/src/app/api/sentry-example-api/route.ts` | No changes (testing only) |

---

## Error Categories Inventory

### Validation Errors (HTTP 400)

| Error Code | Translation Key | Current Message | Routes Affected |
|------------|-----------------|-----------------|-----------------|
| `MISSING_REQUIRED_FIELDS` | `errors.api.missingRequiredFields` | "Missing required fields: X, Y, Z" | Most POST routes |
| `INVALID_EMAIL_FORMAT` | `errors.form.email` | "Invalid email format" | `/api/auth/login`, `/api/auth/register` |
| `INVALID_PASSWORD` | `errors.form.password.tooWeak` | "Password must include..." | `/api/auth/register` |
| `INVALID_UUID_FORMAT` | `errors.api.invalidUuidFormat` | "publicId must be a valid UUID" | `/api/admin/items` |
| `INVALID_URL_FORMAT` | `errors.api.invalidUrlFormat` | "Invalid URL: {url}" | `/api/admin/items` |
| `INVALID_LINK_TYPE` | `errors.api.invalidLinkType` | "Invalid link type: {type}" | `/api/admin/items` |
| `INVALID_PURPOSE` | `errors.api.invalidPurpose` | "Invalid or missing article purpose" | `/api/admin/items`, `/api/admin/articles` |
| `LINKS_MUST_BE_ARRAY` | `errors.api.linksFormat` | "links must be an array" | `/api/admin/items` |
| `INVALID_PROPERTY_ID` | `errors.api.invalidPropertyId` | "Invalid property ID" | `/api/admin/items`, `/api/user/properties` |

### Authentication Errors (HTTP 401)

| Error Code | Translation Key | Current Message | Routes Affected |
|------------|-----------------|-----------------|-----------------|
| `AUTHENTICATION_REQUIRED` | `errors.auth.required` | "Authentication required" | All admin/user routes |
| `INVALID_TOKEN` | `errors.auth.invalidToken` | "Invalid or expired token" | All authenticated routes |
| `INVALID_CREDENTIALS` | `errors.auth.invalidCredentials` | "Invalid email or password" | `/api/auth/login` |
| `SESSION_EXPIRED` | `errors.auth.sessionExpired` | "Your session has expired" | All authenticated routes |
| `OAUTH_SESSION_EXPIRED` | `errors.auth.oauthExpired` | "OAuth session expired" | `/api/auth/complete-oauth-registration` |

### Authorization Errors (HTTP 403)

| Error Code | Translation Key | Current Message | Routes Affected |
|------------|-----------------|-----------------|-----------------|
| `FORBIDDEN` | `errors.api.forbidden` | "Access denied" | Multiple routes |
| `ACCOUNT_ACCESS_DENIED` | `errors.api.accountAccessDenied` | "Access denied to requested account" | Account-filtered routes |
| `NO_ACCOUNT_ACCESS` | `errors.api.noAccountAccess` | "No account access found for user" | Account-filtered routes |
| `SYSADMIN_REQUIRED` | `errors.api.sysadminRequired` | "Sysadmin access required" | `/api/admin/check-sysadmin` |
| `PROPERTY_NOT_ACCESSIBLE` | `errors.api.propertyNotAccessible` | "Property not accessible within current account context" | `/api/admin/items`, `/api/user/properties` |

### Not Found Errors (HTTP 404)

| Error Code | Translation Key | Current Message | Routes Affected |
|------------|-----------------|-----------------|-----------------|
| `ITEM_NOT_FOUND` | `errors.item.notFound` | "Item not found" | `/api/items/[publicId]`, `/api/admin/items/[publicId]` |
| `PROPERTY_NOT_FOUND` | `errors.property.notFound` | "Property not found" | Property routes |
| `ARTICLE_NOT_FOUND` | `errors.api.articleNotFound` | "Article not found" | `/api/admin/articles/[articleId]` |
| `ACCESS_CODE_NOT_FOUND` | `errors.api.accessCodeNotFound` | "Invalid access code" | `/api/auth/validate-code`, `/api/access/redeem` |
| `USER_NOT_FOUND` | `errors.api.userNotFound` | "User not found" | Auth routes |

### Conflict Errors (HTTP 409)

| Error Code | Translation Key | Current Message | Routes Affected |
|------------|-----------------|-----------------|-----------------|
| `USER_ALREADY_REGISTERED` | `errors.api.userAlreadyRegistered` | "User already registered" | `/api/auth/register` |
| `DUPLICATE_PUBLIC_ID` | `errors.api.duplicatePublicId` | "An item with this public ID already exists" | `/api/admin/items` |
| `DUPLICATE_ENTRY` | `errors.api.conflict` | "Resource already exists" | Various POST routes |

### Rate Limit Errors (HTTP 429)

| Error Code | Translation Key | Current Message | Routes Affected |
|------------|-----------------|-----------------|-----------------|
| `RATE_LIMIT_EXCEEDED` | `errors.api.rateLimitExceeded` | "Too many attempts. Please try again later." | `/api/auth/register`, `/api/auth/validate-code` |

### Server Errors (HTTP 500)

| Error Code | Translation Key | Current Message | Routes Affected |
|------------|-----------------|-----------------|-----------------|
| `INTERNAL_ERROR` | `errors.api.generic` | "Internal server error" | All routes (catch blocks) |
| `DATABASE_ERROR` | `errors.api.serverError` | "Failed to fetch X" | Database query routes |
| `ITEM_CREATION_FAILED` | `errors.item.createFailed` | "Failed to create item" | `/api/admin/items` POST |
| `ARTICLE_CREATION_FAILED` | `errors.api.articleCreationFailed` | "Failed to create article" | `/api/admin/articles` POST |
| `LINK_CREATION_FAILED` | `errors.api.linkCreationFailed` | "Failed to create links" | `/api/admin/items` POST |
| `FILE_UPLOAD_FAILED` | `errors.file.uploadFailed` | "File upload failed" | `/api/admin/upload` |
| `ACCOUNT_CONTEXT_ERROR` | `errors.api.accountContextError` | "Failed to determine account context" | Account-filtered routes |

---

## Dependencies

### Requires Before Starting
- None (this task creates the error infrastructure for other sub-epic tasks)

### Required By
- **Task 2J.4:** Create centralized error message utility (depends on audit findings)
- **Task 2J.5:** Update Zod schemas to use translated messages
- **Task 2J.6:** Update error boundaries with translations
- **Task 2J.7:** Generate translations for 5 non-English languages

### Epic 1 Dependencies
- `next-intl` package installed (for future translation integration)
- Translation files at `/messages/*.json` structure defined

---

## Acceptance Criteria

- [ ] All 48 API route files have been identified and their error handling patterns reviewed
- [ ] A standardized error response schema has been defined and documented
- [ ] Error code to translation key mapping has been created
- [ ] All unique error messages across routes have been catalogued
- [ ] HTTP status codes are documented with their consistent usage patterns
- [ ] Authentication errors (401) are mapped with appropriate error codes
- [ ] Permission errors (403) are mapped with clear access denied messages
- [ ] Resource not found errors (404) are mapped with helpful context
- [ ] Validation errors (400) are mapped with specific field-level details
- [ ] Server errors (500) are mapped with generic user-facing messages
- [ ] Rate limiting errors (429) are documented with guidance
- [ ] Error messages reference the `errors` namespace translation keys
- [ ] Database constraint violations are mapped to appropriate user-facing codes
- [ ] All error scenarios have server-side logging context documented

---

## Testing Strategy

### Manual Testing
1. Trigger each error scenario and verify response format
2. Verify HTTP status codes are correct for each error type
3. Verify error codes are consistent across similar scenarios
4. Verify no sensitive data is exposed in error responses

### Automated Testing Recommendations
- Add API integration tests for each error scenario
- Test that all error responses match the standardized schema
- Test rate limiting responses include proper `Retry-After` headers

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing client error handling | Medium | High | Maintain backward compatibility with `error` field |
| Missing error scenarios | Low | Medium | Comprehensive grep search for error patterns |
| Inconsistent implementation across routes | Medium | Medium | Create shared utility functions |
| Translation keys not matching frontend | Low | Medium | Coordinate with Sub-Epic 2H common namespace |

---

## Effort Estimate

| Activity | Estimate |
|----------|----------|
| Create error handler utilities | 2-3 hours |
| Create error code mapping | 1-2 hours |
| Audit and catalogue all routes | 3-4 hours |
| Update documentation | 1-2 hours |
| **Total** | **7-11 hours** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-317
- [Error Types](/src/types/index.ts) - `ErrorCode` enum, `HTTP_ERROR_MAPPING`
- [Error Utilities](/src/lib/error-utils.ts) - Existing error translation functions
- [Auth Server](/src/lib/auth-server.ts) - `validateAdminAuth` function

---

## Appendix: Route-by-Route Error Inventory

### Sample Audit Format

For each route file, document:

```
File: /src/app/api/auth/login/route.ts
Methods: POST
Current Error Scenarios:
  1. Missing email/password → 400, "Email and password are required"
  2. Invalid email format → 400, "Invalid email format"
  3. Login failed → 401, {dynamic from auth}
  4. No data returned → 500, "Login failed - no data returned"
  5. Catch block → 500, "Internal server error"

Recommended Updates:
  - Add error codes to all responses
  - Add translationKey field
  - Use centralized error handler
```

This format will be applied to all 48 route files during the detailed implementation phase.
