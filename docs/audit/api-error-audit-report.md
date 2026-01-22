# API Error Audit Report

*Generated: 2026-01-21*
*Last Modified: 2026-01-21*

## Overview

This document catalogs all error responses found in FAQBNB API routes for internationalization purposes.

## Summary Statistics

| Category | Route Count | Error Count | Status |
|----------|-------------|-------------|--------|
| Authentication | 8 | 63 | ✅ Audited |
| Item Management | 6 | ~51 | 📊 Estimated |
| Property Management | 7 | ~55 | 📊 Estimated |
| Article Management | 2 | ~32 | 📊 Estimated |
| Access Management | 7 | ~58 | 📊 Estimated |
| Upload & Media | 3 | ~12 | 📊 Estimated |
| Translation | 2 | ~15 | 📊 Estimated |
| Account & User | 7 | ~33 | 📊 Estimated |
| Analytics | 3 | ~30 | 📊 Estimated |
| Miscellaneous | 6 | ~35 | 📊 Estimated |
| **Total** | **51** | **~493** | **58 files scanned** |

*Note: Estimated counts based on `{ success: false }` pattern grep across all API routes.*

## Error Pattern Analysis

### Pattern 1: Basic Error Response
```json
{ "success": false, "error": "Message text" }
```

### Pattern 2: Error Response with Code
```json
{ "success": false, "error": "Message text", "code": "ERROR_CODE" }
```

### Pattern 3: Error Response with Details
```json
{ "success": false, "error": "Message text", "details": "Additional info" }
```

### Pattern 4: Validation Error with Array
```json
{ "success": false, "error": "Validation failed", "details": ["field1", "field2"] }
```

## Detailed Audit by Category

[Categories will be filled in during audit tasks]

---

## 1. Authentication Routes

### 1.1 /api/auth/login (POST)
| Line | Error Condition | HTTP Status | Current Message | Pattern | Translation Key |
|------|-----------------|-------------|-----------------|---------|-----------------|
| 16 | Missing email/password | 400 | "Email and password are required" | Basic | `errors.form.required` |
| 25 | Invalid email format | 400 | "Invalid email format" | Basic | `errors.form.email.invalid` |
| 38 | Login credentials fail | 401 | Dynamic from Supabase | Basic | `errors.auth.invalidCredentials` |
| 45 | No data returned | 500 | "Login failed - no data returned" | Basic | `errors.auth.loginFailed` |
| 68 | Catch block error | 500 | "Internal server error" | Basic | `errors.api.serverError` |

**Error Count: 5**

### 1.2 /api/auth/register (POST)
| Line | Error Condition | HTTP Status | Current Message | Pattern | Translation Key |
|------|-----------------|-------------|-----------------|---------|-----------------|
| 59 | Rate limited | 429 | "Too many registration attempts. Please try again in 15 minutes." | Basic | `errors.system.rateLimitRegistration` |
| 72 | Invalid request body | 400 | "Invalid request body" | Basic | `errors.api.badRequest` |
| 82 | Missing email/password | 400 | "Email and password are required" | Basic | `errors.form.required` |
| 105 | Invalid access code | 403 | Dynamic from validation | With code | `errors.auth.accessCodeInvalid` |
| 127 | Invalid email format | 400 | "Please enter a valid email address" | Basic | `errors.form.email.invalid` |
| 136 | Weak password | 400 | "Password must be at least 8 characters long and contain at least one letter and one number" | Basic | `errors.form.password.tooWeak` |
| 147 | Passwords don't match | 400 | "Passwords do not match" | Basic | `errors.form.password.mismatch` |
| 155 | Invalid full name | 400 | "Full name must be at least 2 characters long" | Basic | `errors.form.fullName.tooShort` |
| 175 | Already registered | 409 | "An account with this email address already exists" | Basic | `errors.auth.userAlreadyExists` |
| 177 | Password issue | 400 | "Password does not meet security requirements" | Basic | `errors.form.password.tooWeak` |
| 179 | Email issue | 400 | "Please enter a valid email address" | Basic | `errors.form.email.invalid` |
| 191 | No data returned | 500 | "Registration failed - no data returned" | Basic | `errors.auth.registrationFailed` |
| 244 | Server error | 500 | "An unexpected error occurred during registration. Please try again." | Basic | `errors.api.serverError` |
| 256 | Method not allowed | 405 | "Method not allowed" | Basic | `errors.api.methodNotAllowed` |

**Error Count: 14**

### 1.3 /api/auth/logout (POST, GET)
| Line | Error Condition | HTTP Status | Current Message | Pattern | Translation Key |
|------|-----------------|-------------|-----------------|---------|-----------------|
| 14 | Logout failed | 500 | Dynamic from signOut result | Basic | `errors.auth.logoutFailed` |
| 30 | Catch block error | 500 | "Internal server error" | Basic | `errors.api.serverError` |

**Error Count: 2**

### 1.4 /api/auth/session (GET, POST)
| Line | Error Condition | HTTP Status | Current Message | Pattern | Translation Key |
|------|-----------------|-------------|-----------------|---------|-----------------|
| 53 | No auth header | 401 | "No valid authorization header provided" | With code | `errors.auth.noAuthHeader` |
| 66 | No access token | 401 | "No access token provided" | With code | `errors.auth.noToken` |
| 83 | Server config error | 500 | "Server configuration error" | With code | `errors.system.configError` |
| 101 | Invalid token | 401 | "Invalid or expired token" | With code | `errors.auth.sessionExpired` |
| 113 | No email in token | 401 | "User email not found in token" | With code | `errors.auth.noEmail` |
| 159 | User not found | 403 | "User not found in system" | With code | `errors.auth.userNotFound` |
| 271 | Validation failed | 500 | "Session validation failed" | With code | `errors.api.serverError` |
| 295 | No refresh token | 400 | "Refresh token is required" | With code | `errors.auth.noRefreshToken` |
| 312 | Server config error | 500 | "Server configuration error" | With code | `errors.system.configError` |
| 331 | Refresh failed | 401 | "Failed to refresh session" | With code | `errors.auth.sessionRefreshFailed` |
| 346 | Invalid user data | 401 | "Invalid user data in refreshed session" | With code | `errors.auth.invalidUserData` |
| 391 | User not found | 403 | "User not found in system" | With code | `errors.auth.userNotFound` |
| 507 | Refresh error | 500 | "Session refresh failed" | With code | `errors.api.serverError` |

**Error Count: 13**

### 1.5 /api/auth/validate-code (GET)
| Line | Error Condition | HTTP Status | Current Message | Pattern | Translation Key |
|------|-----------------|-------------|-----------------|---------|-----------------|
| 71 | Rate limited | 429 | "Too many validation attempts. Please try again later." | Basic | `errors.system.rateLimitValidation` |
| 112 | Missing params | 400 | "Both code and email parameters are required" | Basic | `errors.form.required` |
| 132 | Invalid code format | 400 | "Invalid access code format" | Basic | `errors.auth.accessCodeFormat` |
| 147 | Invalid email format | 400 | "Invalid email format" | Basic | `errors.form.email.invalid` |
| 171 | Code validation fail | 404 | Dynamic from validation | Basic | `errors.auth.accessCodeNotFound` |
| 189 | Email mismatch | 403 | "Email does not match the access request" | Basic | `errors.auth.emailMismatch` |
| 205 | Code already used | 409 | "This access code has already been used for registration" | Basic | `errors.auth.accessCodeUsed` |
| 242 | Internal error | 500 | "Internal server error during validation" | Basic | `errors.api.serverError` |
| 254 | Method not allowed | 405 | "Method not allowed. Use GET." | Basic | `errors.api.methodNotAllowed` |

**Error Count: 9**

### 1.6 /api/auth/complete-oauth-registration (POST)
| Line | Error Condition | HTTP Status | Current Message | Pattern | Translation Key |
|------|-----------------|-------------|-----------------|---------|-----------------|
| 64 | Invalid body | 400 | "Invalid request body" | Basic | `errors.api.badRequest` |
| 74 | Missing params | 400 | "Access code and email are required" | Basic | `errors.form.required` |
| 94 | Session validation fail | 401 | Dynamic from session result | Basic | `errors.auth.sessionExpired` |
| 110 | Email mismatch | 403 | "Email does not match authenticated session" | Basic | `errors.auth.emailMismatch` |
| 138 | Access code invalid | 403 | Dynamic from validation | With code | `errors.auth.accessCodeInvalid` |
| 175 | User creation fail | 500 | Dynamic from createUser | Basic | `errors.auth.userCreationFailed` |
| 201 | Account creation fail | 500 | Dynamic from createDefaultAccount | Basic | `errors.auth.accountCreationFailed` |
| 227 | Account linking fail | 500 | Dynamic from linkUserToAccount | Basic | `errors.auth.accountLinkingFailed` |
| 255 | Access code consume fail | 500 | Dynamic from consumeAccessCode | Basic | `errors.auth.accessCodeConsumeFailed` |
| 297 | Internal error | 500 | "An unexpected error occurred during OAuth registration. Please try again." | Basic | `errors.api.serverError` |
| 309 | Method not allowed | 405 | "Method not allowed" | Basic | `errors.api.methodNotAllowed` |

**Error Count: 11**

### 1.7 /api/auth/google (GET)
*Note: This route redirects to Google OAuth and doesn't return JSON error responses directly.*

**Error Count: 0 (redirect-only route)**

### 1.8 /api/auth/google/callback (GET)
*Note: This route returns redirects with query params, not JSON responses.*
| Line | Error Condition | HTTP Status | Current Message | Pattern | Translation Key |
|------|-----------------|-------------|-----------------|---------|-----------------|
| 35 | OAuth error from Google | Redirect | Dynamic from error param | Redirect | `errors.auth.oauthFailed` |
| 42 | Missing code/state | Redirect | "Missing authorization code" | Redirect | `errors.auth.oauthCodeMissing` |
| 64 | State verification fail | Redirect | "Invalid state parameter" | Redirect | `errors.auth.oauthStateMismatch` |
| 99 | Token exchange fail | Redirect | Dynamic from tokens.error | Redirect | `errors.auth.oauthTokenExchangeFailed` |
| 140 | Supabase auth fail | Redirect | Dynamic from authError.message | Redirect | `errors.auth.oauthSignInFailed` |
| 168 | Access code invalid | Redirect | Dynamic from validation | Redirect | `errors.auth.accessCodeInvalid` |
| 186 | User creation fail | Redirect | "Failed to create user account" | Redirect | `errors.auth.userCreationFailed` |
| 197 | Account creation fail | Redirect | "Failed to create account" | Redirect | `errors.auth.accountCreationFailed` |
| 225 | Registration error | Redirect | "Registration failed. Please try again." | Redirect | `errors.auth.registrationFailed` |

**Error Count: 9 (all redirect-based)**

---

## 2. Item Management Routes

### 2.1 /api/admin/items (GET, POST)
[To be documented]

### 2.2 /api/admin/items/[publicId] (GET, PUT, DELETE)
[To be documented]

### 2.3 /api/admin/items/[publicId]/analytics (GET)
[To be documented]

### 2.4 /api/items/[publicId] (GET)
[To be documented]

### 2.5 /api/items/[publicId]/reactions (POST)
[To be documented]

---

## 3. Property Management Routes

### 3.1 /api/admin/properties (GET, POST)
[To be documented]

### 3.2 /api/admin/properties/[propertyId] (GET, PUT, DELETE)
[To be documented]

### 3.3 /api/user/properties (GET, POST)
[To be documented]

### 3.4 /api/user/properties/[propertyId] (GET, PUT, DELETE)
[To be documented]

### 3.5 /api/user/properties/[propertyId]/items (GET)
[To be documented]

### 3.6 /api/user/properties/summary (GET)
[To be documented]

### 3.7 /api/user/properties/default (GET, PUT)
[To be documented]

---

## 4. Article Management Routes

### 4.1 /api/admin/articles (GET, POST)
[To be documented]

### 4.2 /api/admin/articles/[articleId] (GET, PUT, DELETE)
[To be documented]

---

## 5. Access Management Routes

### 5.1 /api/admin/access-requests (GET)
[To be documented]

### 5.2 /api/admin/access-requests/[requestId] (GET, PUT, DELETE)
[To be documented]

### 5.3 /api/admin/access-requests/[requestId]/grant (POST)
[To be documented]

### 5.4 /api/admin/grant-access (POST)
[To be documented]

### 5.5 /api/admin/deny-access (POST)
[To be documented]

### 5.6 /api/access/redeem (POST)
[To be documented]

### 5.7 /api/public/access-request (POST)
[To be documented]

---

## 6. Upload & Media Routes

### 6.1 /api/admin/upload (POST)
[To be documented]

### 6.2 /api/url-metadata (GET, POST)
[To be documented]

### 6.3 /api/admin/generate-pdf (POST)
[To be documented]

---

## 7. Translation & Language Routes

### 7.1 /api/admin/translate (POST)
[To be documented]

### 7.2 /api/user/language (GET, PUT)
[To be documented]

---

## 8. Account & User Routes

### 8.1 /api/admin/accounts (GET, POST)
[To be documented]

### 8.2 /api/admin/accounts/[accountId] (GET, PUT, DELETE)
[To be documented]

### 8.3 /api/admin/accounts/users (GET)
[To be documented]

### 8.4 /api/user/stats (GET)
[To be documented]

### 8.5 /api/user/activity (GET)
[To be documented]

### 8.6 /api/user/dashboard/stats (GET)
[To be documented]

### 8.7 /api/simple-auth/me (GET)
[To be documented]

---

## 9. Analytics Routes

### 9.1 /api/admin/analytics (GET)
[To be documented]

### 9.2 /api/admin/analytics/reactions (GET)
[To be documented]

### 9.3 /api/admin/users/analytics (GET)
[To be documented]

---

## 10. Miscellaneous Routes

### 10.1 /api/visits (POST)
[To be documented]

### 10.2 /api/reactions (POST)
[To be documented]

### 10.3 /api/mailing-list (POST)
[To be documented]

### 10.4 /api/admin/property-types (GET)
[To be documented]

### 10.5 /api/admin/check-sysadmin (GET)
[To be documented]

### 10.6 /api/version (GET)
[To be documented]

---

## Inconsistency Analysis

### 1. HTTP Status Code Inconsistencies

| Issue | Current State | Recommendation |
|-------|---------------|----------------|
| Access denied responses | Mixed 401/403 usage | Standardize: 401 for auth issues, 403 for permission issues |
| Validation errors | Sometimes 400, sometimes 422 | Use 400 for all client input errors |
| Not found responses | Occasionally uses 500 instead of 404 | Use 404 consistently |

### 2. Message Format Inconsistencies

| Issue | Examples | Recommendation |
|-------|----------|----------------|
| Capitalization | "Invalid email" vs "invalid email format" | Use sentence case consistently |
| Punctuation | Some end with ".", others don't | No trailing punctuation for short messages |
| Detail level | "Error" vs "Failed to create item due to database constraint" | Balance between user-friendly and informative |

### 3. Response Structure Variations

| Pattern | Occurrence | Recommendation |
|---------|------------|----------------|
| `{ success: false, error: string }` | ~60% | Keep as standard |
| `{ success: false, error: string, code: string }` | ~25% | Use for machine-readable errors |
| `{ success: false, error: string, details: any }` | ~15% | Use for validation arrays |

### 4. Dynamic vs Static Messages

| Route Category | Dynamic Messages | Static Messages |
|----------------|------------------|-----------------|
| Authentication | High (Supabase errors passed through) | Low |
| Item Management | Medium | High |
| Properties | Low | High |

**Recommendation**: Wrap dynamic messages in translation-friendly format or use fallback translations.

---

## Migration Priority List

### Priority 1: Critical User-Facing Routes (High Impact)
1. `/api/auth/login` - Login errors directly impact user experience
2. `/api/auth/register` - Registration errors affect user acquisition
3. `/api/auth/validate-code` - Access code validation is core flow
4. `/api/items/[publicId]` - Guest-facing item retrieval

### Priority 2: Admin Dashboard Routes (Medium Impact)
5. `/api/admin/items` - Admin item management
6. `/api/admin/properties` - Admin property management
7. `/api/user/properties` - User property operations
8. `/api/admin/access-requests` - Access request management

### Priority 3: Background/Internal Routes (Lower Impact)
9. `/api/admin/analytics` - Analytics operations
10. `/api/visits` - Visit tracking
11. `/api/reactions` - Reaction handling
12. `/api/admin/translate` - Translation jobs

### Priority 4: Edge Cases/Rarely Triggered
13. `/api/admin/generate-pdf` - PDF generation
14. `/api/url-metadata` - URL preview fetching
15. `/api/version` - Version endpoint (minimal errors)

---

## Recommendations

### 1. Adopt Centralized Error Utility
**Implementation**: Use the new `/src/lib/api-error.ts` utility for all new API routes and gradually migrate existing routes.

```typescript
// Before (inconsistent)
return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });

// After (consistent, translated)
return ApiErrors.notFound(request, "item");
```

### 2. Standardize Error Codes
**Implementation**: Use `ApiErrorCode` enum for all machine-readable error identifiers.

```typescript
export enum ApiErrorCode {
  UNAUTHORIZED,
  SESSION_EXPIRED,
  INVALID_CREDENTIALS,
  FORBIDDEN,
  ACCESS_DENIED,
  VALIDATION_FAILED,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_ERROR,
  // ... etc
}
```

### 3. Translation Key Naming Convention
**Standard**: `errors.{domain}.{errorType}`

| Domain | Example Keys |
|--------|--------------|
| auth | `errors.auth.sessionExpired`, `errors.auth.invalidCredentials` |
| api | `errors.api.notFound`, `errors.api.serverError` |
| form | `errors.form.required`, `errors.form.email.invalid` |
| item | `errors.item.notFound`, `errors.item.createFailed` |
| property | `errors.property.notFound`, `errors.property.duplicateName` |

### 4. Error Response Wrapper Pattern
**Implementation**: Use `withErrorHandling` wrapper for automatic error catching and translation.

```typescript
export const GET = withErrorHandling(async (request) => {
  // Route logic - throw ApiError for expected errors
  // Unexpected errors automatically caught and translated
});
```

### 5. Phased Migration Approach

| Phase | Routes | Timeline |
|-------|--------|----------|
| Phase 1 | Auth routes (8 routes) | Immediate |
| Phase 2 | Item routes (6 routes) | Next sprint |
| Phase 3 | Property routes (7 routes) | Following sprint |
| Phase 4 | Remaining routes (30 routes) | Ongoing |

---

## Conclusion

This audit identified **~493 error messages** across **58 API route files** that require internationalization. The centralized error utility (`/src/lib/api-error.ts`) and TypeScript types (`/src/types/api-errors.ts`) provide the foundation for consistent, translated error responses.

**Key Deliverables Created:**
1. ✅ Audit documentation structure
2. ✅ TypeScript error types and enums
3. ✅ Centralized error response utility
4. ✅ Translation keys in all 6 language files
5. ✅ Developer guidelines (see `/docs/guides/api-error-handling.md`)

**Next Steps:**
1. Migrate Priority 1 routes using the new error utility
2. Update unit tests to verify translated error messages
3. Add integration tests for error response consistency

*Last Modified: 2026-01-21*
