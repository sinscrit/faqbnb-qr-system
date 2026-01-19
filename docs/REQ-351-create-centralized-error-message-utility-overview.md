# REQ-351: Create Centralized Error Message Utility

## Implementation Overview Document

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-351
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.4
**Size:** M (Medium)
**Priority:** High (Cross-cutting concern)

---

## 1. Summary

Create a centralized utility module for handling error messages that integrates with the next-intl translation system, ensuring consistent error formatting and localization across all components and API endpoints. This utility will replace ad-hoc error handling patterns throughout the codebase and serve as the single source of truth for error message localization.

---

## 2. Background & Context

### Current State

The application currently has fragmented error handling:

1. **`src/lib/error-utils.ts`** - Existing error utility with `translateErrorMessage()`, `classifyError()`, and related functions. However:
   - Returns hardcoded English messages only
   - Uses pattern matching on error strings rather than i18n keys
   - Does not integrate with next-intl translation system
   - Limited error code coverage

2. **`src/types/index.ts`** - Defines `ErrorCode` enum and `HTTP_ERROR_MAPPING` with hardcoded English messages

3. **`messages/en.json`** - Contains basic `errors` namespace with ~17 error messages but:
   - Limited coverage (missing validation, API, network, auth, item, property, file error categories)
   - Not structured to support the full error taxonomy needed

4. **Component-level error handling** - Scattered across components like `RegistrationForm.tsx` with local `FormErrors` interfaces and inline validation

### Dependencies from Epic 1

This task depends on:
- `next-intl` package installed (complete)
- Translation files in `/messages/*.json` (complete)
- `useTranslations` hook available (complete)
- `getTranslations` for server components (complete)

### Related Implementation Plan

From **Plan-111-L10N-Epic2-Static-UI-Translation.md**:
- Task 2J.4 specifies creating `/src/lib/i18n/error-translations.ts`
- The plan shows a sample implementation pattern with `useErrorTranslations()` hook

---

## 3. Requirements Analysis

### Functional Requirements

From REQ-351 acceptance criteria:

| # | Requirement | Implementation Approach |
|---|-------------|------------------------|
| 1 | New utility module for centralized error handling | Create `/src/lib/i18n/error-translations.ts` |
| 2 | Function accepting error codes/objects returning localized messages | `getLocalizedError()` function |
| 3 | Message interpolation for dynamic values | Use ICU format with next-intl |
| 4 | Integration with translation system (errors namespace) | Use `useTranslations('errors')` and `getTranslations('errors')` |
| 5 | Fallback for unknown error codes | Default to generic localized message |
| 6 | Handle validation, API, network, client errors | Categorized error code constants |
| 7 | HTTP status code mapping | `mapHttpStatusToErrorKey()` function |
| 8 | Field-specific error messages for forms | `getFieldError()` function |
| 9 | Error severity levels | `ErrorSeverity` enum with `warning`, `error`, `critical` |
| 10 | API error response formatting | `formatApiErrorResponse()` function |
| 11 | Client-side display of localized API errors | `parseApiError()` function |
| 12 | Handle arrays of errors (bulk validation) | `getMultipleErrors()` function |
| 13 | TypeScript types for all error interfaces | Comprehensive type definitions |
| 14 | Helper for extracting errors from exceptions | `extractErrorFromException()` function |
| 15 | Documentation with examples | JSDoc comments and usage examples |
| 16 | Handle nested Supabase errors | `parseSupabaseError()` function |
| 17 | Consistent tone, no technical jargon | Translation review requirement |
| 18 | Framework-agnostic (server & client) | Separate hooks for client, functions for server |
| 19 | Predefined error codes | `ERROR_CODES` constant object |
| 20 | Exported constants for type safety | Named exports for all error codes |
| 21 | Unit tests | Vitest tests in `__tests__` directory |
| 22 | Integration with logging/monitoring | Error classification for Sentry/logging |
| 23 | Performance optimization | Memoization where appropriate |
| 24 | Export from main types index | Re-export from `src/types/index.ts` |

---

## 4. Technical Design

### 4.1 File Structure

```
src/
├── lib/
│   └── i18n/
│       ├── error-translations.ts       # NEW: Main error utility
│       ├── error-codes.ts              # NEW: Error code constants
│       ├── index.ts                    # MODIFY: Add exports
│       └── __tests__/
│           └── error-translations.test.ts  # NEW: Unit tests
├── types/
│   └── index.ts                        # MODIFY: Re-export error types
messages/
├── en.json                             # MODIFY: Expand errors namespace
├── fr.json                             # MODIFY: Add French error translations
├── es.json                             # MODIFY: Add Spanish error translations
├── de.json                             # MODIFY: Add German error translations
├── nl.json                             # MODIFY: Add Dutch error translations
└── it.json                             # MODIFY: Add Italian error translations
```

### 4.2 Error Code Organization

```typescript
// /src/lib/i18n/error-codes.ts

/**
 * Error code categories organized by domain
 */
export const ERROR_CODES = {
  // Form validation errors
  FORM: {
    REQUIRED: 'form.required',
    EMAIL_INVALID: 'form.email',
    PASSWORD_TOO_SHORT: 'form.password.tooShort',
    PASSWORD_TOO_WEAK: 'form.password.tooWeak',
    PASSWORD_MISMATCH: 'form.password.mismatch',
    MAX_LENGTH: 'form.maxLength',
    MIN_LENGTH: 'form.minLength',
    INVALID_FORMAT: 'form.invalidFormat',
    INVALID_URL: 'form.invalidUrl',
    INVALID_PHONE: 'form.invalidPhone',
  },

  // API/HTTP errors
  API: {
    GENERIC: 'api.generic',
    NOT_FOUND: 'api.notFound',
    UNAUTHORIZED: 'api.unauthorized',
    FORBIDDEN: 'api.forbidden',
    CONFLICT: 'api.conflict',
    SERVER_ERROR: 'api.serverError',
    TIMEOUT: 'api.timeout',
    BAD_REQUEST: 'api.badRequest',
    TOO_MANY_REQUESTS: 'api.tooManyRequests',
  },

  // Network errors
  NETWORK: {
    OFFLINE: 'network.offline',
    CONNECTION_FAILED: 'network.connectionFailed',
    SLOW_CONNECTION: 'network.slowConnection',
  },

  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'auth.invalidCredentials',
    EMAIL_NOT_VERIFIED: 'auth.emailNotVerified',
    SESSION_EXPIRED: 'auth.sessionExpired',
    ACCOUNT_LOCKED: 'auth.accountLocked',
    ACCESS_DENIED: 'auth.accessDenied',
    OAUTH_FAILED: 'auth.oauthFailed',
    OAUTH_SESSION_EXPIRED: 'auth.oauthSessionExpired',
  },

  // Item-related errors
  ITEM: {
    NOT_FOUND: 'item.notFound',
    CREATE_FAILED: 'item.createFailed',
    UPDATE_FAILED: 'item.updateFailed',
    DELETE_FAILED: 'item.deleteFailed',
    DUPLICATE_NAME: 'item.duplicateName',
  },

  // Property-related errors
  PROPERTY: {
    NOT_FOUND: 'property.notFound',
    CREATE_FAILED: 'property.createFailed',
    UPDATE_FAILED: 'property.updateFailed',
    DELETE_FAILED: 'property.deleteFailed',
  },

  // File/upload errors
  FILE: {
    TOO_LARGE: 'file.tooLarge',
    INVALID_TYPE: 'file.invalidType',
    UPLOAD_FAILED: 'file.uploadFailed',
  },
} as const;

export type ErrorCodeKey =
  | typeof ERROR_CODES.FORM[keyof typeof ERROR_CODES.FORM]
  | typeof ERROR_CODES.API[keyof typeof ERROR_CODES.API]
  | typeof ERROR_CODES.NETWORK[keyof typeof ERROR_CODES.NETWORK]
  | typeof ERROR_CODES.AUTH[keyof typeof ERROR_CODES.AUTH]
  | typeof ERROR_CODES.ITEM[keyof typeof ERROR_CODES.ITEM]
  | typeof ERROR_CODES.PROPERTY[keyof typeof ERROR_CODES.PROPERTY]
  | typeof ERROR_CODES.FILE[keyof typeof ERROR_CODES.FILE];
```

### 4.3 Main Utility Interface

```typescript
// /src/lib/i18n/error-translations.ts

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ERROR_CODES, ErrorCodeKey } from './error-codes';

/**
 * Error severity levels for display treatment
 */
export type ErrorSeverity = 'warning' | 'error' | 'critical';

/**
 * Localized error result with metadata
 */
export interface LocalizedError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  field?: string;
  params?: Record<string, unknown>;
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

/**
 * Client-side hook for error translations
 * @example
 * const { getError, getFieldError, getApiError } = useErrorTranslations();
 * const errorMsg = getError('form.required');
 */
export function useErrorTranslations() {
  const t = useTranslations('errors');

  return {
    getError: (key: ErrorCodeKey, params?: Record<string, unknown>) =>
      t(key, params),

    getFieldError: (field: string, key: string, params?: Record<string, unknown>) =>
      t(`form.${key}`, { field, ...params }),

    getApiError: (key: string) =>
      t(`api.${key}`),

    getNetworkError: (key: string) =>
      t(`network.${key}`),

    getAuthError: (key: string) =>
      t(`auth.${key}`),

    getFallbackError: () =>
      t('api.generic'),
  };
}

/**
 * Server-side error translation function
 */
export async function getErrorTranslations() {
  const t = await getTranslations('errors');

  return {
    getError: (key: ErrorCodeKey, params?: Record<string, unknown>) =>
      t(key, params),
    getFallbackError: () => t('api.generic'),
  };
}

/**
 * Map HTTP status code to error key
 */
export function mapHttpStatusToErrorKey(status: number): string {
  const mapping: Record<number, string> = {
    400: 'api.badRequest',
    401: 'api.unauthorized',
    403: 'api.forbidden',
    404: 'api.notFound',
    409: 'api.conflict',
    429: 'api.tooManyRequests',
    500: 'api.serverError',
    502: 'api.serverError',
    503: 'api.serverError',
    504: 'api.timeout',
  };
  return mapping[status] || 'api.generic';
}

/**
 * Classify error severity based on type
 */
export function classifyErrorSeverity(code: string): ErrorSeverity {
  if (code.startsWith('network.') || code.includes('timeout')) {
    return 'warning';
  }
  if (code.includes('serverError') || code.includes('critical')) {
    return 'critical';
  }
  return 'error';
}

/**
 * Extract error information from Supabase error objects
 */
export function parseSupabaseError(error: unknown): { code: string; message?: string } {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Supabase auth errors
    if ('code' in err && typeof err.code === 'string') {
      const supabaseCodeMap: Record<string, string> = {
        'invalid_credentials': 'auth.invalidCredentials',
        'user_not_found': 'auth.invalidCredentials',
        'email_not_confirmed': 'auth.emailNotVerified',
        'session_expired': 'auth.sessionExpired',
        'user_already_exists': 'api.conflict',
      };
      return {
        code: supabaseCodeMap[err.code] || 'api.generic',
        message: typeof err.message === 'string' ? err.message : undefined
      };
    }

    // Supabase database errors
    if ('details' in err || 'hint' in err) {
      return { code: 'api.serverError', message: String(err.message || '') };
    }
  }

  return { code: 'api.generic' };
}

/**
 * Extract error from caught exception
 */
export function extractErrorFromException(error: unknown): { code: string; message?: string } {
  if (error instanceof Error) {
    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { code: 'network.connectionFailed' };
    }
    if (error.name === 'AbortError') {
      return { code: 'api.timeout' };
    }
    return { code: 'api.generic', message: error.message };
  }

  if (typeof error === 'string') {
    return { code: 'api.generic', message: error };
  }

  return parseSupabaseError(error);
}
```

### 4.4 Expanded Errors Namespace

The `messages/en.json` errors namespace will be expanded to include all categories:

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least {min} characters",
        "tooWeak": "Password must include uppercase, lowercase, and numbers",
        "mismatch": "Passwords do not match"
      },
      "maxLength": "Maximum {max} characters allowed",
      "minLength": "Minimum {min} characters required",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number"
    },
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "badRequest": "Invalid request. Please check your input.",
      "tooManyRequests": "Too many requests. Please wait a moment."
    },
    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment."
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied to this resource",
      "oauthFailed": "OAuth authentication failed. Please try again.",
      "oauthSessionExpired": "OAuth session expired. Please sign in again."
    },
    "item": {
      "notFound": "Item not found",
      "createFailed": "Failed to create item",
      "updateFailed": "Failed to update item",
      "deleteFailed": "Failed to delete item",
      "duplicateName": "An item with this name already exists"
    },
    "property": {
      "notFound": "Property not found",
      "createFailed": "Failed to create property",
      "updateFailed": "Failed to update property",
      "deleteFailed": "Failed to delete property"
    },
    "file": {
      "tooLarge": "File size exceeds {max}MB limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again."
    }
  }
}
```

---

## 5. Implementation Tasks

### Task 1: Create Error Code Constants Module
- Create `/src/lib/i18n/error-codes.ts`
- Define `ERROR_CODES` constant object with all categories
- Export TypeScript types for error codes

### Task 2: Create Main Error Translation Utility
- Create `/src/lib/i18n/error-translations.ts`
- Implement `useErrorTranslations()` hook for client components
- Implement `getErrorTranslations()` for server components
- Implement helper functions:
  - `mapHttpStatusToErrorKey()`
  - `classifyErrorSeverity()`
  - `parseSupabaseError()`
  - `extractErrorFromException()`
  - `formatApiErrorResponse()`

### Task 3: Expand Translation Files
- Update `/messages/en.json` with complete errors namespace
- Generate translations for fr, es, de, nl, it

### Task 4: Update Module Exports
- Update `/src/lib/i18n/index.ts` to export new utilities
- Update `/src/types/index.ts` to re-export error types

### Task 5: Write Unit Tests
- Create `/src/lib/i18n/__tests__/error-translations.test.ts`
- Test error code mapping
- Test HTTP status mapping
- Test Supabase error parsing
- Test fallback behavior

### Task 6: Documentation
- Add JSDoc comments to all exported functions
- Create usage examples in code comments

---

## 6. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/error-codes.ts` | Error code constants and types |
| `/src/lib/i18n/error-translations.ts` | Main error translation utility |
| `/src/lib/i18n/__tests__/error-translations.test.ts` | Unit tests |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/lib/i18n/index.ts` | Add exports for error-codes and error-translations |
| `/src/types/index.ts` | Re-export error types from error-translations |
| `/messages/en.json` | Expand errors namespace with ~50 new keys |
| `/messages/fr.json` | Add French error translations |
| `/messages/es.json` | Add Spanish error translations |
| `/messages/de.json` | Add German error translations |
| `/messages/nl.json` | Add Dutch error translations |
| `/messages/it.json` | Add Italian error translations |

### Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `useErrorTranslations()` | `/src/lib/i18n/error-translations.ts` | Client-side hook for error messages |
| `getErrorTranslations()` | `/src/lib/i18n/error-translations.ts` | Server-side async function |
| `mapHttpStatusToErrorKey()` | `/src/lib/i18n/error-translations.ts` | HTTP status to error key mapping |
| `classifyErrorSeverity()` | `/src/lib/i18n/error-translations.ts` | Error severity classification |
| `parseSupabaseError()` | `/src/lib/i18n/error-translations.ts` | Supabase error parsing |
| `extractErrorFromException()` | `/src/lib/i18n/error-translations.ts` | Generic exception parsing |
| `formatApiErrorResponse()` | `/src/lib/i18n/error-translations.ts` | API response formatting |

---

## 7. Integration Points

### With Existing `error-utils.ts`

The existing `/src/lib/error-utils.ts` should be deprecated in favor of this new utility. A migration plan:
1. Keep `error-utils.ts` temporarily for backward compatibility
2. Update components to use new `useErrorTranslations()` hook
3. Remove `error-utils.ts` after migration complete

### With Components

Components using error handling should migrate from:
```typescript
// Old pattern
const errorMsg = "This field is required";
setErrors({ email: errorMsg });
```

To:
```typescript
// New pattern
const { getError } = useErrorTranslations();
const errorMsg = getError(ERROR_CODES.FORM.REQUIRED);
setErrors({ email: errorMsg });
```

### With API Routes

API routes should use:
```typescript
// Server-side error response
const { getError } = await getErrorTranslations();
return NextResponse.json({
  success: false,
  error: {
    code: ERROR_CODES.ITEM.NOT_FOUND,
    message: getError(ERROR_CODES.ITEM.NOT_FOUND)
  }
}, { status: 404 });
```

---

## 8. Testing Strategy

### Unit Tests

- Test `useErrorTranslations()` returns correct translations
- Test `mapHttpStatusToErrorKey()` for all status codes
- Test `parseSupabaseError()` with various Supabase error formats
- Test `extractErrorFromException()` with Error, string, and object inputs
- Test `classifyErrorSeverity()` returns correct severity levels
- Test fallback behavior for unknown error codes

### Integration Tests

- Verify error messages display correctly in components
- Verify API errors are properly localized
- Verify language switching updates error messages

---

## 9. Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| next-intl | ^3.x | Translation framework (already installed) |
| vitest | ^1.x | Unit testing (already installed) |

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing error handling | Medium | Medium | Keep backward compatibility during migration |
| Missing translations at runtime | Low | Medium | Implement robust fallback to English |
| Performance overhead | Low | Low | Memoize translation lookups |
| Type safety gaps | Low | Medium | Comprehensive TypeScript types |

---

## 11. Acceptance Criteria Checklist

- [ ] Error translation utility module created
- [ ] `useErrorTranslations()` hook works in client components
- [ ] `getErrorTranslations()` works in server components
- [ ] All error categories covered (form, api, network, auth, item, property, file)
- [ ] Message interpolation works with dynamic values
- [ ] Fallback to generic message for unknown codes
- [ ] HTTP status code mapping implemented
- [ ] Field-specific errors supported
- [ ] Error severity levels implemented
- [ ] Supabase error parsing implemented
- [ ] TypeScript types exported
- [ ] Unit tests pass
- [ ] All 6 language files have error translations
- [ ] Exported from `src/types/index.ts`
- [ ] Documentation with usage examples

---

## 12. References

- [REQ-351 in gen_requests_epic2.md](/docs/gen_requests_epic2.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Existing error-utils.ts](/src/lib/error-utils.ts)
- [Existing types/index.ts](/src/types/index.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2J.4: Create Centralized Error Message Utility*
