# REQ-E02-034: Audit All API Error Handling and Messages - Implementation Overview

*Generated: 2026-01-20 14:30:00 UTC*
*Last Modified: 2026-01-20 14:30:00 UTC*

## Reference

- **Request**: REQ-E02-034 (Audit All API Error Handling and Messages)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2J (Error Messages & Validation)
- **Task ID**: 2J.3
- **Size**: L (Large)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup), Task 2J.1 (Create errors namespace structure)

## Summary

Conduct a comprehensive audit of all API route handlers throughout the backend to identify error messages and error responses that need internationalization. This audit will catalog every error response pattern, establish consistent error handling approaches, and prepare error messages for translation by mapping them to keys in the `errors` namespace.

## Goals

1. Systematically review all 50+ API route handlers for error responses and error patterns
2. Document all identified error messages with their endpoints, conditions, status codes, and response structures
3. Identify inconsistencies in error handling patterns across similar endpoints
4. Create a migration plan that defines standard error response formats and error codes
5. Design centralized error handling utilities to standardize error responses
6. Map all error messages to appropriate keys in the `errors` namespace
7. Enable API responses to include localized error messages based on request language context

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 provides:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available for client components |
| getTranslations | next-intl/server | Available for server components |

### Existing Errors Namespace (from Task 2J.1)

After Task 2J.1 completes, `/messages/en.json` will contain a structured `errors` namespace:

```json
{
  "errors": {
    "form": { ... },       // Form validation messages
    "api": { ... },        // API error messages
    "network": { ... },    // Network error messages
    "auth": { ... },       // Authentication error messages
    "item": { ... },       // Item-related error messages
    "property": { ... },   // Property-related error messages
    "file": { ... },       // File upload error messages
    "system": { ... }      // System error messages
  }
}
```

### Current API Error Handling Patterns

The codebase currently has 50+ API routes with varied error handling patterns:

#### Pattern 1: Basic Error Response (Most Common)
```typescript
// Example from: /src/app/api/auth/login/route.ts
return NextResponse.json(
  { success: false, error: 'Email and password are required' },
  { status: 400 }
);
```

#### Pattern 2: Error Response with Code
```typescript
// Example from: /src/app/api/admin/items/route.ts
return NextResponse.json(
  {
    success: false,
    error: 'Access denied to requested account',
    code: 'FORBIDDEN'
  },
  { status: 403 }
);
```

#### Pattern 3: Error Response with Details
```typescript
// Example from: /src/app/api/admin/items/route.ts
return NextResponse.json(
  { success: false, error: 'Failed to fetch items', details: error.message },
  { status: 500 }
);
```

#### Pattern 4: Validation Error with Array
```typescript
// Example from: /src/app/api/admin/properties/route.ts
return NextResponse.json(
  { success: false, error: 'Validation failed', details: validationErrors },
  { status: 400 }
);
```

### Existing Authentication Validation

The `validateAdminAuth` function in `/src/lib/auth-server.ts` already returns structured error responses:

```typescript
return {
  error: NextResponse.json(
    {
      success: false,
      error: 'Invalid or expired token',
      code: 'UNAUTHORIZED'
    },
    { status: 401 }
  )
};
```

## API Route Inventory

### Authentication Routes (~8 routes, ~25 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Login | `/api/auth/login/route.ts` | POST | 5 |
| Register | `/api/auth/register/route.ts` | POST | ~6 |
| Logout | `/api/auth/logout/route.ts` | POST | ~2 |
| Session | `/api/auth/session/route.ts` | GET | ~3 |
| Validate Code | `/api/auth/validate-code/route.ts` | POST | ~4 |
| Complete OAuth | `/api/auth/complete-oauth-registration/route.ts` | POST | ~5 |
| Google OAuth | `/api/auth/google/route.ts` | GET | ~3 |
| Google Callback | `/api/auth/google/callback/route.ts` | GET | ~4 |

### Item Management Routes (~6 routes, ~30 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Admin Items List/Create | `/api/admin/items/route.ts` | GET, POST | ~15 |
| Admin Item CRUD | `/api/admin/items/[publicId]/route.ts` | GET, PUT, DELETE | ~10 |
| Public Item | `/api/items/[publicId]/route.ts` | GET | ~3 |
| Item Reactions | `/api/items/[publicId]/reactions/route.ts` | POST | ~3 |
| Item Analytics | `/api/admin/items/[publicId]/analytics/route.ts` | GET | ~2 |

### Property Management Routes (~4 routes, ~20 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Admin Properties List/Create | `/api/admin/properties/route.ts` | GET, POST | ~12 |
| Admin Property CRUD | `/api/admin/properties/[propertyId]/route.ts` | GET, PUT, DELETE | ~8 |
| User Properties | `/api/user/properties/route.ts` | GET | ~3 |
| User Property Items | `/api/user/properties/[propertyId]/items/route.ts` | GET | ~3 |

### Article Management Routes (~3 routes, ~12 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Admin Articles List/Create | `/api/admin/articles/route.ts` | GET, POST | ~6 |
| Admin Article CRUD | `/api/admin/articles/[articleId]/route.ts` | GET, PUT, DELETE | ~6 |

### Access Management Routes (~6 routes, ~25 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Access Requests List | `/api/admin/access-requests/route.ts` | GET, POST | ~5 |
| Access Request CRUD | `/api/admin/access-requests/[requestId]/route.ts` | GET, PUT, DELETE | ~5 |
| Grant Access | `/api/admin/access-requests/[requestId]/grant/route.ts` | POST | ~4 |
| Redeem Access | `/api/access/redeem/route.ts` | GET, POST | ~10 |
| Public Access Request | `/api/public/access-request/route.ts` | POST | ~4 |

### Upload & Media Routes (~2 routes, ~10 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| File Upload | `/api/admin/upload/route.ts` | POST | ~5 |
| URL Metadata | `/api/url-metadata/route.ts` | GET | ~3 |
| PDF Generation | `/api/admin/generate-pdf/route.ts` | POST | ~4 |

### Translation Routes (~2 routes, ~8 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Translate Test | `/api/admin/translate/route.ts` | POST | ~8 |
| User Language | `/api/user/language/route.ts` | GET, PUT | ~3 |

### Account & User Routes (~8 routes, ~20 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Admin Accounts | `/api/admin/accounts/route.ts` | GET, POST | ~5 |
| Admin Account CRUD | `/api/admin/accounts/[accountId]/route.ts` | GET, PUT, DELETE | ~5 |
| Admin Account Users | `/api/admin/accounts/users/route.ts` | GET | ~3 |
| User Stats | `/api/user/stats/route.ts` | GET | ~2 |
| User Activity | `/api/user/activity/route.ts` | GET | ~2 |
| Dashboard Stats | `/api/user/dashboard/stats/route.ts` | GET | ~2 |
| Simple Auth Me | `/api/simple-auth/me/route.ts` | GET | ~3 |

### Analytics Routes (~3 routes, ~8 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Admin Analytics | `/api/admin/analytics/route.ts` | GET | ~3 |
| Reactions Analytics | `/api/admin/analytics/reactions/route.ts` | GET | ~2 |
| Users Analytics | `/api/admin/users/analytics/route.ts` | GET | ~2 |

### Miscellaneous Routes (~5 routes, ~10 error messages)

| Route | Location | HTTP Methods | Error Count |
|-------|----------|--------------|-------------|
| Visits | `/api/visits/route.ts` | POST | ~2 |
| Reactions | `/api/reactions/route.ts` | POST | ~2 |
| Mailing List | `/api/mailing-list/route.ts` | POST | ~3 |
| Property Types | `/api/admin/property-types/route.ts` | GET | ~2 |
| Check Sysadmin | `/api/admin/check-sysadmin/route.ts` | GET | ~2 |

### Total Estimated Error Messages: ~170

## Implementation Order

### Step 1: Create Audit Documentation Structure

Create a comprehensive audit spreadsheet/document with the following columns:
- Endpoint path
- HTTP method
- Error condition
- HTTP status code
- Current error message text
- Response structure (basic/with-code/with-details)
- Proposed translation key
- Notes

### Step 2: Audit Authentication API Routes

Audit all authentication-related routes:
1. `/api/auth/login/route.ts`
2. `/api/auth/register/route.ts`
3. `/api/auth/logout/route.ts`
4. `/api/auth/session/route.ts`
5. `/api/auth/validate-code/route.ts`
6. `/api/auth/complete-oauth-registration/route.ts`
7. `/api/auth/google/route.ts`
8. `/api/auth/google/callback/route.ts`

### Step 3: Audit Item Management API Routes

Audit all item-related routes:
1. `/api/admin/items/route.ts`
2. `/api/admin/items/[publicId]/route.ts`
3. `/api/items/[publicId]/route.ts`
4. `/api/items/[publicId]/reactions/route.ts`
5. `/api/admin/items/[publicId]/analytics/route.ts`

### Step 4: Audit Property Management API Routes

Audit all property-related routes:
1. `/api/admin/properties/route.ts`
2. `/api/admin/properties/[propertyId]/route.ts`
3. `/api/user/properties/route.ts`
4. `/api/user/properties/[propertyId]/route.ts`
5. `/api/user/properties/[propertyId]/items/route.ts`
6. `/api/user/properties/summary/route.ts`
7. `/api/user/properties/default/route.ts`

### Step 5: Audit Article & Content API Routes

Audit all article-related routes:
1. `/api/admin/articles/route.ts`
2. `/api/admin/articles/[articleId]/route.ts`

### Step 6: Audit Access Management API Routes

Audit all access management routes:
1. `/api/admin/access-requests/route.ts`
2. `/api/admin/access-requests/[requestId]/route.ts`
3. `/api/admin/access-requests/[requestId]/grant/route.ts`
4. `/api/admin/grant-access/route.ts`
5. `/api/admin/deny-access/route.ts`
6. `/api/access/redeem/route.ts`
7. `/api/public/access-request/route.ts`

### Step 7: Audit Upload & Media API Routes

Audit all file handling routes:
1. `/api/admin/upload/route.ts`
2. `/api/url-metadata/route.ts`
3. `/api/admin/generate-pdf/route.ts`

### Step 8: Audit Translation & Language API Routes

Audit all translation-related routes:
1. `/api/admin/translate/route.ts`
2. `/api/user/language/route.ts`

### Step 9: Audit Account & User API Routes

Audit all account and user routes:
1. `/api/admin/accounts/route.ts`
2. `/api/admin/accounts/[accountId]/route.ts`
3. `/api/admin/accounts/users/route.ts`
4. `/api/user/stats/route.ts`
5. `/api/user/activity/route.ts`
6. `/api/user/dashboard/stats/route.ts`
7. `/api/simple-auth/me/route.ts`

### Step 10: Audit Analytics & Miscellaneous API Routes

Audit remaining routes:
1. `/api/admin/analytics/route.ts`
2. `/api/admin/analytics/reactions/route.ts`
3. `/api/admin/users/analytics/route.ts`
4. `/api/visits/route.ts`
5. `/api/reactions/route.ts`
6. `/api/mailing-list/route.ts`
7. `/api/admin/property-types/route.ts`
8. `/api/admin/check-sysadmin/route.ts`
9. `/api/version/route.ts`

### Step 11: Analyze Inconsistencies

Identify patterns where:
- Similar errors receive inconsistent treatment
- Different status codes are used for equivalent error conditions
- Response structures vary for similar error types
- Error messages have different levels of detail

### Step 12: Design Standard Error Response Format

Define a consistent error response structure:

```typescript
interface StandardErrorResponse {
  success: false;
  error: string;        // User-friendly message (translated)
  code?: string;        // Machine-readable error code
  details?: string | string[] | Record<string, string>;  // Additional context
  field?: string;       // For field-specific validation errors
}
```

### Step 13: Create Error Code Enumeration

Define standard error codes:

```typescript
enum ApiErrorCode {
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
  RATE_LIMITED = 'RATE_LIMITED'
}
```

### Step 14: Map Error Messages to Translation Keys

Create mapping from error codes to translation keys:

| Error Code | Translation Key | HTTP Status |
|------------|-----------------|-------------|
| UNAUTHORIZED | `errors.auth.sessionExpired` | 401 |
| INVALID_CREDENTIALS | `errors.auth.invalidCredentials` | 401 |
| FORBIDDEN | `errors.api.forbidden` | 403 |
| ACCESS_DENIED | `errors.auth.accessDenied` | 403 |
| VALIDATION_FAILED | `errors.api.badRequest` | 400 |
| NOT_FOUND | `errors.api.notFound` | 404 |
| CONFLICT | `errors.api.conflict` | 409 |
| INTERNAL_ERROR | `errors.api.serverError` | 500 |
| SERVICE_UNAVAILABLE | `errors.system.maintenance` | 503 |
| TIMEOUT | `errors.api.timeout` | 408 |
| FILE_TOO_LARGE | `errors.file.tooLarge` | 400 |
| INVALID_FILE_TYPE | `errors.file.invalidType` | 400 |
| RATE_LIMITED | `errors.system.rateLimit` | 429 |

### Step 15: Design Centralized Error Utilities

Design utility functions for consistent error handling:

```typescript
// Proposed: /src/lib/api-error.ts

import { getTranslations } from 'next-intl/server';
import { NextRequest, NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status: number,
    public details?: string | string[],
    public field?: string
  ) {
    super(code);
  }
}

export async function createErrorResponse(
  request: NextRequest,
  code: ApiErrorCode,
  status: number,
  options?: {
    details?: string | string[];
    field?: string;
    params?: Record<string, string | number>;
  }
): Promise<NextResponse> {
  // Get language from request (header, cookie, or default)
  const locale = getLocaleFromRequest(request);
  const t = await getTranslations({ locale, namespace: 'errors' });

  // Map error code to translation key
  const translationKey = getTranslationKey(code);
  const message = options?.params
    ? t(translationKey, options.params)
    : t(translationKey);

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(options?.details && { details: options.details }),
      ...(options?.field && { field: options.field }),
    },
    { status }
  );
}
```

### Step 16: Document Audit Results

Create comprehensive audit documentation:
- List all error responses found
- Categorize by endpoint type
- Highlight inconsistencies
- Provide recommendations

## Authorized Files and Functions for Modification

### Files to Audit (Read-Only for This Task)

All 50+ API routes will be audited but NOT modified in this task:

#### Authentication Routes
- `/src/app/api/auth/login/route.ts`
- `/src/app/api/auth/register/route.ts`
- `/src/app/api/auth/logout/route.ts`
- `/src/app/api/auth/session/route.ts`
- `/src/app/api/auth/validate-code/route.ts`
- `/src/app/api/auth/complete-oauth-registration/route.ts`
- `/src/app/api/auth/google/route.ts`
- `/src/app/api/auth/google/callback/route.ts`

#### Item Routes
- `/src/app/api/admin/items/route.ts`
- `/src/app/api/admin/items/[publicId]/route.ts`
- `/src/app/api/items/[publicId]/route.ts`
- `/src/app/api/items/[publicId]/reactions/route.ts`
- `/src/app/api/admin/items/[publicId]/analytics/route.ts`

#### Property Routes
- `/src/app/api/admin/properties/route.ts`
- `/src/app/api/admin/properties/[propertyId]/route.ts`
- `/src/app/api/user/properties/route.ts`
- `/src/app/api/user/properties/[propertyId]/route.ts`
- `/src/app/api/user/properties/[propertyId]/items/route.ts`
- `/src/app/api/user/properties/summary/route.ts`
- `/src/app/api/user/properties/default/route.ts`

#### Article Routes
- `/src/app/api/admin/articles/route.ts`
- `/src/app/api/admin/articles/[articleId]/route.ts`

#### Access Routes
- `/src/app/api/admin/access-requests/route.ts`
- `/src/app/api/admin/access-requests/[requestId]/route.ts`
- `/src/app/api/admin/access-requests/[requestId]/grant/route.ts`
- `/src/app/api/admin/grant-access/route.ts`
- `/src/app/api/admin/deny-access/route.ts`
- `/src/app/api/access/redeem/route.ts`
- `/src/app/api/public/access-request/route.ts`

#### Upload Routes
- `/src/app/api/admin/upload/route.ts`
- `/src/app/api/url-metadata/route.ts`
- `/src/app/api/admin/generate-pdf/route.ts`

#### Translation Routes
- `/src/app/api/admin/translate/route.ts`
- `/src/app/api/user/language/route.ts`

#### Account/User Routes
- `/src/app/api/admin/accounts/route.ts`
- `/src/app/api/admin/accounts/[accountId]/route.ts`
- `/src/app/api/admin/accounts/users/route.ts`
- `/src/app/api/user/stats/route.ts`
- `/src/app/api/user/activity/route.ts`
- `/src/app/api/user/dashboard/stats/route.ts`
- `/src/app/api/simple-auth/me/route.ts`

#### Analytics Routes
- `/src/app/api/admin/analytics/route.ts`
- `/src/app/api/admin/analytics/reactions/route.ts`
- `/src/app/api/admin/users/analytics/route.ts`

#### Miscellaneous Routes
- `/src/app/api/visits/route.ts`
- `/src/app/api/reactions/route.ts`
- `/src/app/api/mailing-list/route.ts`
- `/src/app/api/admin/property-types/route.ts`
- `/src/app/api/admin/check-sysadmin/route.ts`
- `/src/app/api/version/route.ts`

### Files to Create

#### `/docs/audit/api-error-audit-report.md`

- **Purpose**: Comprehensive audit report documenting all API error responses
- **Contents**:
  - Complete list of all error messages found
  - Error categorization by endpoint type
  - Inconsistencies identified
  - Recommendations for standardization
  - Migration plan for each endpoint

#### `/src/lib/api-error.ts`

- **Purpose**: Centralized error handling utilities (design only in this task)
- **Contents**:
  - `ApiErrorCode` enum
  - `ApiError` class
  - `createErrorResponse` function
  - Error code to translation key mapping
  - Locale detection from request

#### `/src/types/api-errors.ts`

- **Purpose**: TypeScript types for API errors
- **Contents**:
  - `StandardErrorResponse` interface
  - `ApiErrorCode` enum type
  - Error response type guards

### Files NOT to Modify (in this task)

- `/messages/en.json` - Will be updated in Task 2J.4
- `/src/lib/auth-server.ts` - Will be updated in Task 2J.4
- Any API route files - Will be updated after utilities are created
- `/src/lib/error-utils.ts` - Existing error utility, will integrate later

## Technical Specifications

### Standard Error Response Format

All API error responses should follow this structure:

```typescript
interface StandardErrorResponse {
  success: false;
  error: string;                    // Translated user-friendly message
  code?: ApiErrorCode;              // Machine-readable error code
  details?: ErrorDetails;           // Additional context
  field?: string;                   // For field-specific errors
}

type ErrorDetails = string | string[] | Record<string, string>;
```

### HTTP Status Code Standards

| Status Code | Usage | Error Codes |
|-------------|-------|-------------|
| 400 | Bad Request - Invalid input, validation failure | VALIDATION_FAILED, INVALID_INPUT, MISSING_REQUIRED_FIELD |
| 401 | Unauthorized - Authentication required/failed | UNAUTHORIZED, INVALID_CREDENTIALS, SESSION_EXPIRED |
| 403 | Forbidden - Authenticated but not authorized | FORBIDDEN, ACCESS_DENIED |
| 404 | Not Found - Resource doesn't exist | NOT_FOUND |
| 405 | Method Not Allowed | METHOD_NOT_ALLOWED |
| 408 | Request Timeout | TIMEOUT |
| 409 | Conflict - Resource already exists | CONFLICT, ALREADY_EXISTS |
| 413 | Payload Too Large | FILE_TOO_LARGE |
| 415 | Unsupported Media Type | INVALID_FILE_TYPE |
| 429 | Too Many Requests | RATE_LIMITED |
| 500 | Internal Server Error | INTERNAL_ERROR |
| 503 | Service Unavailable | SERVICE_UNAVAILABLE |

### Language Detection from Request

The error utility should detect language from:

1. `Accept-Language` header (highest priority for API clients)
2. `x-locale` custom header (for frontend requests)
3. Cookie value (for browser sessions)
4. Default to 'en' if none found

```typescript
function getLocaleFromRequest(request: NextRequest): SupportedLanguage {
  // Check custom header first
  const headerLocale = request.headers.get('x-locale');
  if (headerLocale && SUPPORTED_LOCALES.includes(headerLocale)) {
    return headerLocale as SupportedLanguage;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const parsed = parseAcceptLanguage(acceptLanguage);
    for (const lang of parsed) {
      if (SUPPORTED_LOCALES.includes(lang)) {
        return lang as SupportedLanguage;
      }
    }
  }

  // Check cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale as SupportedLanguage;
  }

  return 'en';
}
```

### Error Code to Translation Key Mapping

```typescript
const errorCodeToTranslationKey: Record<ApiErrorCode, string> = {
  // Auth
  UNAUTHORIZED: 'auth.sessionExpired',
  SESSION_EXPIRED: 'auth.sessionExpired',
  INVALID_CREDENTIALS: 'auth.invalidCredentials',

  // Authorization
  FORBIDDEN: 'api.forbidden',
  ACCESS_DENIED: 'auth.accessDenied',

  // Validation
  VALIDATION_FAILED: 'api.badRequest',
  INVALID_INPUT: 'api.badRequest',
  MISSING_REQUIRED_FIELD: 'form.required',

  // Resources
  NOT_FOUND: 'api.notFound',
  CONFLICT: 'api.conflict',
  ALREADY_EXISTS: 'api.conflict',

  // Server
  INTERNAL_ERROR: 'api.serverError',
  SERVICE_UNAVAILABLE: 'system.maintenance',
  TIMEOUT: 'api.timeout',

  // File
  FILE_TOO_LARGE: 'file.tooLarge',
  INVALID_FILE_TYPE: 'file.invalidType',
  UPLOAD_FAILED: 'file.uploadFailed',

  // Rate
  RATE_LIMITED: 'system.rateLimit',
};
```

## Usage Patterns

### Current Usage Pattern (Before)

```typescript
// Current pattern in /src/app/api/auth/login/route.ts
if (!body.email || !body.password) {
  return NextResponse.json(
    { success: false, error: 'Email and password are required' },
    { status: 400 }
  );
}
```

### Target Usage Pattern (After)

```typescript
// After implementing centralized utilities
import { createErrorResponse, ApiErrorCode } from '@/lib/api-error';

if (!body.email || !body.password) {
  return createErrorResponse(
    request,
    ApiErrorCode.MISSING_REQUIRED_FIELD,
    400,
    { details: 'Email and password are required' }
  );
}
```

### Frontend Error Handling Integration

Frontend applications consuming API errors can:

1. Display the translated `error` message directly to users
2. Use the `code` field for programmatic error handling
3. Use `details` for showing specific validation feedback
4. Use `field` for highlighting specific form fields

```typescript
// Frontend example
try {
  const response = await fetch('/api/auth/login', { ... });
  const data = await response.json();

  if (!data.success) {
    // Display translated error to user
    showToast(data.error);

    // Handle specific error codes
    if (data.code === 'SESSION_EXPIRED') {
      redirectToLogin();
    }

    // Highlight field if provided
    if (data.field) {
      highlightField(data.field);
    }
  }
} catch (error) {
  // Network error handling
}
```

## Success Validation Checklist

### Audit Completeness
- [ ] All 50+ API routes have been systematically reviewed
- [ ] Authentication routes (8) fully audited
- [ ] Item management routes (6) fully audited
- [ ] Property management routes (7) fully audited
- [ ] Article management routes (2) fully audited
- [ ] Access management routes (7) fully audited
- [ ] Upload routes (3) fully audited
- [ ] Translation routes (2) fully audited
- [ ] Account/User routes (7) fully audited
- [ ] Analytics routes (3) fully audited
- [ ] Miscellaneous routes (5+) fully audited

### Documentation Completeness
- [ ] Audit report document created with all findings
- [ ] Each error message documented with endpoint, condition, status, and message text
- [ ] Inconsistencies clearly identified and documented
- [ ] Migration plan created for each endpoint category

### Design Completeness
- [ ] Standard error response format defined
- [ ] Error code enumeration designed
- [ ] HTTP status code standards documented
- [ ] Error code to translation key mapping complete
- [ ] Centralized error utility API designed
- [ ] Language detection approach documented

### Quality Validation
- [ ] All error codes have corresponding translation keys in errors namespace
- [ ] Status code usage is consistent with HTTP standards
- [ ] Error messages provide actionable guidance
- [ ] Design supports backward compatibility during migration

## Dependencies

### Required (Already Available)
- `next-intl` - i18n framework (installed in Epic 1)
- `next/server` - NextRequest, NextResponse
- TypeScript 5.x - Type checking

### Required from Previous Tasks
- Task 2J.1: Errors namespace structure in `/messages/en.json`

### No New Dependencies Required
This task is primarily audit and design work.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - This task is audit and design only, no code changes
  - All error patterns already exist in codebase
  - Design follows established patterns in existing code
  - No runtime risk from documentation work

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing API routes in audit | Low | Low | Use glob patterns to find all route files |
| Inconsistent error patterns | High | Medium | Document all patterns, prioritize standardization |
| Translation key gaps | Medium | Low | Cross-reference with errors namespace |
| Breaking changes during migration | Medium | High | Design for backward compatibility |

## Future Integration Points

This audit will inform:

1. **Task 2J.4**: Create centralized error message utility (implements the designed utilities)
2. **Task 2J.5**: Update Zod schemas to use translated messages
3. **Task 2J.6**: Update error boundaries with translations
4. **All API route updates**: Each route will be updated to use centralized utilities

## Notes

### Alignment with Plan-111

This implementation follows the structure specified in Plan-111, Section "Sub-Epic 2J: Error Messages & Validation", Task 2J.3.

### Audit Methodology

The audit follows a systematic approach:
1. Glob all `/src/app/api/**/route.ts` files
2. Search for `NextResponse.json` patterns with `success: false`
3. Extract error message text, status codes, and response structures
4. Categorize by endpoint type
5. Identify patterns and inconsistencies

### Error Message Inventory

Based on initial codebase review, common error messages include:

**Authentication Errors:**
- "Email and password are required"
- "Invalid email format"
- "Login failed - no data returned"
- "Invalid or expired token"
- "User email not found in token"
- "User not found in system"
- "Authentication validation failed"

**Authorization Errors:**
- "Access denied to requested account"
- "No account access found for user"
- "Insufficient permissions"
- "Admin access required"

**Validation Errors:**
- "Missing required fields"
- "publicId must be a valid UUID"
- "links must be an array"
- "Invalid link type"
- "Invalid URL"
- "Property nickname is required"
- "Property type is required"

**Resource Errors:**
- "Failed to fetch items"
- "Item not found"
- "Property not found"
- "Failed to create item/property/article"
- "An item with this public ID already exists"

**File Errors:**
- "No file provided"
- "Invalid file type"
- "File too large"
- "Upload failed"

**System Errors:**
- "Internal server error"
- "Method not allowed"
- "Service unavailable"

---

*End of Implementation Overview*
