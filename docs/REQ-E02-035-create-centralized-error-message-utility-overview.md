# Implementation Breakdown: REQ-E02-035 - Create Centralized Error Message Utility

**Document Created:** 2026-01-20 21:15:00 UTC
**Last Modified:** 2026-01-20 21:15:00 UTC
**Request ID:** REQ-E02-035
**Phase:** 2J (Error Messages & Validation)
**Task:** 2J.4
**Size:** M (Medium)
**Priority:** P1 - Critical (Cross-cutting concern for entire application)

---

## 1. Overview

### Summary

Create a centralized error message utility module that provides a clean, consistent interface for retrieving translated error messages throughout the FAQBNB application. This utility will abstract away direct interaction with the next-intl translation system for error messages specifically, providing typed functions for different error categories (validation, authentication, API, form, file) with built-in fallback logic and interpolation support.

### Background

Currently, error messages are handled inconsistently across the codebase:
- `src/lib/error-utils.ts` contains a `translateErrorMessage()` function with hardcoded English messages
- API routes have scattered error strings directly in responses
- The `errors` namespace in translation files (`/messages/*.json`) contains ~16 error keys but is underutilized
- Each component independently constructs translation keys and handles fallbacks differently

### Business Value

- Establishes a maintainable, scalable pattern for error message management
- Reduces technical debt by centralizing error translation logic
- Ensures complete internationalization of error communication across all 6 languages
- Simplifies developer onboarding with a documented, type-safe interface
- Improves user experience with consistent, professional error messaging

### Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | ✅ Complete (Epic 1) |
| i18n configuration | `/src/lib/i18n/config.ts` | ✅ Complete (Epic 1) |
| Translation files | `/messages/*.json` | ✅ Complete (Epic 1) |
| ErrorCode enum | `/src/types/index.ts` | ✅ Exists |
| UserFriendlyError interface | `/src/types/index.ts` | ✅ Exists |
| `errors` namespace | `/messages/en.json` | ✅ Exists (needs expansion) |

---

## 2. Technical Context

### Existing Codebase Patterns

**Current Error Utilities (`src/lib/error-utils.ts`):**
```typescript
// Current implementation uses hardcoded English strings
export function translateErrorMessage(error: string, statusCode?: number): UserFriendlyError {
  // ...maps errors to hardcoded English messages
  return {
    code: ErrorCode.VALIDATION_FAILED,
    message: "Something went wrong - please try again",  // Hardcoded!
    actionable: true,
    nextSteps: "If the problem continues, please refresh..."
  };
}
```

**Current Error Types (`src/types/index.ts`):**
```typescript
export enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USER_ALREADY_REGISTERED = 'USER_ALREADY_REGISTERED',
  INVALID_ACCESS_CODE = 'INVALID_ACCESS_CODE',
  EMAIL_MISMATCH = 'EMAIL_MISMATCH',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OAUTH_SESSION_EXPIRED = 'OAUTH_SESSION_EXPIRED',
  OAUTH_REGISTRATION_CONFLICT = 'OAUTH_REGISTRATION_CONFLICT',
  OAUTH_AUTHENTICATION_FAILED = 'OAUTH_AUTHENTICATION_FAILED'
}

export interface UserFriendlyError {
  code: ErrorCode;
  message: string;
  actionable: boolean;
  nextSteps?: string;
}
```

**Current Translation Keys (`messages/en.json`):**
```json
{
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Invalid email address",
    "networkError": "Network error. Please try again.",
    "unauthorized": "You are not authorized to perform this action",
    "notFound": "The requested resource was not found",
    "serverError": "Server error. Please try again later.",
    "validationFailed": "Validation failed. Please check your input.",
    "sessionExpired": "Your session has expired. Please sign in again.",
    "tooManyRequests": "Too many requests. Please wait a moment.",
    "invalidCredentials": "Invalid email or password",
    "emailTaken": "This email is already registered",
    "passwordTooWeak": "Password must be at least 8 characters",
    "uploadFailed": "Upload failed. Please try again.",
    "fileTooLarge": "File is too large",
    "invalidFileType": "Invalid file type",
    "genericError": "Something went wrong. Please try again."
  }
}
```

### Integration Points

| Integration Point | Description |
|-------------------|-------------|
| `next-intl` hooks | `useTranslations('errors')` for client components |
| `next-intl/server` | `getTranslations('errors')` for server components/API routes |
| Existing error-utils | Maintain backward compatibility, eventually migrate |
| API routes | Used for translating error responses |
| React components | Used for form validation and UI error display |
| Zod schemas | Can provide translated validation messages |

---

## 3. Implementation Tasks

### Task 3.1: Create Centralized Error Translation Module

**File:** `/src/lib/i18n/error-translations.ts`

**Description:** Create the main error translation utility module with typed functions for each error category.

**Implementation Details:**

```typescript
// /src/lib/i18n/error-translations.ts

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// Error categories matching expanded errors namespace
export type ErrorCategory =
  | 'form'      // Form validation errors
  | 'auth'      // Authentication errors
  | 'api'       // API/server errors
  | 'network'   // Network/connection errors
  | 'item'      // Item-specific errors
  | 'property'  // Property-specific errors
  | 'file';     // File upload errors

// Error key types for type safety
export type FormErrorKey =
  | 'required'
  | 'email'
  | 'passwordRequired'
  | 'passwordTooShort'
  | 'passwordTooWeak'
  | 'passwordMismatch'
  | 'maxLength'
  | 'minLength'
  | 'invalidFormat'
  | 'invalidUrl'
  | 'invalidPhone';

export type AuthErrorKey =
  | 'invalidCredentials'
  | 'emailNotVerified'
  | 'sessionExpired'
  | 'accountLocked'
  | 'accessDenied'
  | 'emailTaken'
  | 'invalidAccessCode'
  | 'accessCodeExpired';

export type ApiErrorKey =
  | 'generic'
  | 'notFound'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'serverError'
  | 'timeout'
  | 'tooManyRequests';

export type NetworkErrorKey =
  | 'offline'
  | 'connectionFailed'
  | 'slowConnection';

export type FileErrorKey =
  | 'tooLarge'
  | 'invalidType'
  | 'uploadFailed';

// Interpolation parameters type
export type ErrorParams = Record<string, string | number>;

/**
 * Client-side hook for error translations
 * Use this in React components
 */
export function useErrorTranslations() {
  const t = useTranslations('errors');

  return {
    // Form validation errors
    getFormError: (key: FormErrorKey, params?: ErrorParams) =>
      t(`form.${key}`, params),

    // Authentication errors
    getAuthError: (key: AuthErrorKey, params?: ErrorParams) =>
      t(`auth.${key}`, params),

    // API errors
    getApiError: (key: ApiErrorKey, params?: ErrorParams) =>
      t(`api.${key}`, params),

    // Network errors
    getNetworkError: (key: NetworkErrorKey, params?: ErrorParams) =>
      t(`network.${key}`, params),

    // File errors
    getFileError: (key: FileErrorKey, params?: ErrorParams) =>
      t(`file.${key}`, params),

    // Generic error with fallback
    getError: (key: string, params?: ErrorParams) => {
      try {
        return t(key, params);
      } catch {
        return t('generic');
      }
    },

    // Get generic fallback error
    getGenericError: () => t('generic'),
  };
}

/**
 * Server-side function for error translations
 * Use this in API routes and server components
 */
export async function getErrorTranslations() {
  const t = await getTranslations('errors');

  return {
    getFormError: (key: FormErrorKey, params?: ErrorParams) =>
      t(`form.${key}`, params),

    getAuthError: (key: AuthErrorKey, params?: ErrorParams) =>
      t(`auth.${key}`, params),

    getApiError: (key: ApiErrorKey, params?: ErrorParams) =>
      t(`api.${key}`, params),

    getNetworkError: (key: NetworkErrorKey, params?: ErrorParams) =>
      t(`network.${key}`, params),

    getFileError: (key: FileErrorKey, params?: ErrorParams) =>
      t(`file.${key}`, params),

    getError: (key: string, params?: ErrorParams) => {
      try {
        return t(key, params);
      } catch {
        return t('generic');
      }
    },

    getGenericError: () => t('generic'),
  };
}

/**
 * Map HTTP status codes to translated error messages
 */
export function getHttpErrorKey(statusCode: number): ApiErrorKey {
  switch (statusCode) {
    case 400: return 'generic';
    case 401: return 'unauthorized';
    case 403: return 'forbidden';
    case 404: return 'notFound';
    case 409: return 'conflict';
    case 429: return 'tooManyRequests';
    case 500:
    default: return 'serverError';
  }
}

/**
 * Map ErrorCode enum to translation key path
 */
export function getErrorCodeKey(code: ErrorCode): string {
  const mapping: Record<ErrorCode, string> = {
    [ErrorCode.VALIDATION_FAILED]: 'form.required',
    [ErrorCode.USER_ALREADY_REGISTERED]: 'auth.emailTaken',
    [ErrorCode.INVALID_ACCESS_CODE]: 'auth.invalidAccessCode',
    [ErrorCode.EMAIL_MISMATCH]: 'auth.emailMismatch',
    [ErrorCode.NETWORK_ERROR]: 'network.connectionFailed',
    [ErrorCode.OAUTH_SESSION_EXPIRED]: 'auth.sessionExpired',
    [ErrorCode.OAUTH_REGISTRATION_CONFLICT]: 'auth.emailTaken',
    [ErrorCode.OAUTH_AUTHENTICATION_FAILED]: 'auth.invalidCredentials',
  };
  return mapping[code] || 'generic';
}
```

**Estimated Effort:** 2-3 hours

---

### Task 3.2: Expand Errors Namespace in Translation Files

**Files:** `/messages/en.json`, `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Description:** Restructure and expand the `errors` namespace to support categorized error messages with interpolation.

**Implementation Details for `/messages/en.json`:**

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least {min} characters",
      "passwordTooWeak": "Password must include uppercase, lowercase, and numbers",
      "passwordMismatch": "Passwords do not match",
      "maxLength": "Maximum {max} characters allowed",
      "minLength": "Minimum {min} characters required",
      "invalidFormat": "Invalid format",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number"
    },
    "auth": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "sessionExpired": "Your session has expired. Please sign in again.",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied to this resource",
      "emailTaken": "This email is already registered",
      "emailMismatch": "Email does not match the access request",
      "invalidAccessCode": "Invalid access code",
      "accessCodeExpired": "Access code has expired"
    },
    "api": {
      "generic": "Something went wrong. Please try again.",
      "notFound": "The requested resource was not found",
      "unauthorized": "You are not authorized to perform this action",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "serverError": "Server error. Please try again later.",
      "timeout": "Request timed out. Please try again.",
      "tooManyRequests": "Too many requests. Please wait a moment."
    },
    "network": {
      "offline": "You appear to be offline. Please check your connection.",
      "connectionFailed": "Unable to connect to the server",
      "slowConnection": "Connection is slow. This may take a moment."
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
    },
    "generic": "Something went wrong. Please try again."
  }
}
```

**Estimated Effort:** 1-2 hours for English, then translation generation for other languages

---

### Task 3.3: Update Module Exports

**File:** `/src/lib/i18n/index.ts`

**Description:** Add exports for the new error translation utilities.

**Implementation Details:**

```typescript
// Add to existing exports in /src/lib/i18n/index.ts

// Error Translation exports (REQ-E02-035)
export {
  useErrorTranslations,
  getErrorTranslations,
  getHttpErrorKey,
  getErrorCodeKey,
  type ErrorCategory,
  type FormErrorKey,
  type AuthErrorKey,
  type ApiErrorKey,
  type NetworkErrorKey,
  type FileErrorKey,
  type ErrorParams,
} from './error-translations';
```

**Estimated Effort:** 15 minutes

---

### Task 3.4: Add Type Definitions

**File:** `/src/types/errors.ts` (new file)

**Description:** Create dedicated error type definitions that can be shared across the application.

**Implementation Details:**

```typescript
// /src/types/errors.ts

import { ErrorCode } from './index';

/**
 * Extended error code enum for domain-specific errors
 * Extends the base ErrorCode enum from types/index.ts
 */
export enum ExtendedErrorCode {
  // Form validation
  FORM_REQUIRED = 'FORM_REQUIRED',
  FORM_INVALID_EMAIL = 'FORM_INVALID_EMAIL',
  FORM_PASSWORD_TOO_SHORT = 'FORM_PASSWORD_TOO_SHORT',
  FORM_PASSWORD_MISMATCH = 'FORM_PASSWORD_MISMATCH',

  // Item operations
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_CREATE_FAILED = 'ITEM_CREATE_FAILED',
  ITEM_UPDATE_FAILED = 'ITEM_UPDATE_FAILED',
  ITEM_DELETE_FAILED = 'ITEM_DELETE_FAILED',

  // Property operations
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  PROPERTY_CREATE_FAILED = 'PROPERTY_CREATE_FAILED',

  // File operations
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE = 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
}

/**
 * Combined error codes (base + extended)
 */
export type AllErrorCodes = ErrorCode | ExtendedErrorCode;

/**
 * Translated error result with context
 */
export interface TranslatedError {
  /** The error code for programmatic handling */
  code: AllErrorCodes;
  /** The translated, user-friendly message */
  message: string;
  /** Whether the user can take action to resolve */
  actionable: boolean;
  /** Optional translated next steps */
  nextSteps?: string;
  /** Original error for debugging */
  originalError?: unknown;
}

/**
 * Error translation context for server-side usage
 */
export interface ErrorTranslationContext {
  /** Current locale for translation */
  locale: string;
  /** Additional context for error messages */
  context?: Record<string, unknown>;
}
```

**Estimated Effort:** 30 minutes

---

### Task 3.5: Create Integration Helper for Existing error-utils.ts

**File:** `/src/lib/error-utils.ts` (update)

**Description:** Add a bridge function to integrate the new translation utility with existing error handling while maintaining backward compatibility.

**Implementation Details:**

Add at the end of the existing file:

```typescript
// --- REQ-E02-035: Integration with centralized error translations ---

import { getErrorCodeKey } from '@/lib/i18n/error-translations';

/**
 * Translate error using the new centralized utility (client-side)
 * Use this in components with useErrorTranslations hook
 *
 * @param error - Original error or error message
 * @param errorUtils - Result from useErrorTranslations() hook
 * @returns Translated error message
 */
export function translateWithI18n(
  error: string | Error,
  errorUtils: ReturnType<typeof import('@/lib/i18n/error-translations').useErrorTranslations>
): string {
  const errorStr = typeof error === 'string' ? error : error.message;
  const friendlyError = translateErrorMessage(errorStr);

  // Get translation key from error code
  const translationKey = getErrorCodeKey(friendlyError.code);

  // Return translated message
  return errorUtils.getError(translationKey);
}

/**
 * Get a UserFriendlyError with translated message (client-side)
 *
 * @param error - Original error or error message
 * @param statusCode - Optional HTTP status code
 * @param errorUtils - Result from useErrorTranslations() hook
 * @returns UserFriendlyError with translated message
 */
export function getTranslatedError(
  error: string | Error,
  statusCode: number | undefined,
  errorUtils: ReturnType<typeof import('@/lib/i18n/error-translations').useErrorTranslations>
): UserFriendlyError {
  const errorStr = typeof error === 'string' ? error : error.message;
  const friendlyError = translateErrorMessage(errorStr, statusCode);

  // Get translation key and translate
  const translationKey = getErrorCodeKey(friendlyError.code);

  return {
    ...friendlyError,
    message: errorUtils.getError(translationKey),
  };
}
```

**Estimated Effort:** 1 hour

---

### Task 3.6: Generate Translations for Non-English Languages

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Description:** Generate the expanded `errors` namespace translations for all 5 non-English languages.

**Estimated Effort:** 1-2 hours (using AI translation or translation service)

---

### Task 3.7: Create Unit Tests

**File:** `/src/lib/i18n/__tests__/error-translations.test.ts` (new file)

**Description:** Create unit tests for the error translation utility.

**Test Cases:**
- Verify each error category function returns correct translation keys
- Test interpolation with dynamic values (min, max, types, etc.)
- Test fallback behavior when translation is missing
- Test HTTP status code mapping
- Test ErrorCode enum mapping
- Verify server-side and client-side versions produce same results

**Estimated Effort:** 2 hours

---

### Task 3.8: Create Documentation

**File:** `/docs/i18n/error-translations.md` (new file)

**Description:** Create documentation explaining how to use the error translation utility.

**Contents:**
- Overview and purpose
- Installation/import instructions
- Usage examples for client components
- Usage examples for server components/API routes
- Integration with existing error handling
- Migration guide from hardcoded strings
- Available error categories and keys
- Interpolation examples

**Estimated Effort:** 1 hour

---

## 4. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/error-translations.ts` | Main error translation utility module |
| `/src/types/errors.ts` | Extended error type definitions |
| `/src/lib/i18n/__tests__/error-translations.test.ts` | Unit tests |
| `/docs/i18n/error-translations.md` | Documentation |

### Existing Files to Modify

| File Path | Modifications |
|-----------|---------------|
| `/src/lib/i18n/index.ts` | Add exports for error translation utilities |
| `/src/lib/error-utils.ts` | Add integration helpers (backward compatible) |
| `/messages/en.json` | Expand `errors` namespace with categories |
| `/messages/fr.json` | Add translated error messages |
| `/messages/es.json` | Add translated error messages |
| `/messages/de.json` | Add translated error messages |
| `/messages/nl.json` | Add translated error messages |
| `/messages/it.json` | Add translated error messages |
| `/src/types/index.ts` | Export new error types |

### Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `useErrorTranslations()` | `/src/lib/i18n/error-translations.ts` | Client-side hook for error translations |
| `getErrorTranslations()` | `/src/lib/i18n/error-translations.ts` | Server-side async function for error translations |
| `getHttpErrorKey()` | `/src/lib/i18n/error-translations.ts` | Map HTTP status to translation key |
| `getErrorCodeKey()` | `/src/lib/i18n/error-translations.ts` | Map ErrorCode enum to translation key |
| `translateWithI18n()` | `/src/lib/error-utils.ts` | Integration helper for client components |
| `getTranslatedError()` | `/src/lib/error-utils.ts` | Get translated UserFriendlyError |

---

## 5. Acceptance Criteria Verification

| Acceptance Criteria | Task | Verification |
|---------------------|------|--------------|
| Centralized utility module with clear API | 3.1 | Module exports typed functions for each error category |
| Functions for retrieving errors by type/code | 3.1 | `getFormError`, `getAuthError`, `getApiError`, etc. |
| Validation error support | 3.1, 3.2 | `form.*` namespace with required, email, password, etc. |
| Authentication error support | 3.1, 3.2 | `auth.*` namespace with credentials, session, access |
| API error support | 3.1, 3.2 | `api.*` namespace with 400-500 status errors |
| Form submission error support | 3.1, 3.2 | Covered in `api.*` and `form.*` namespaces |
| Auto translation key construction | 3.1 | Functions construct keys automatically |
| Built-in fallback logic | 3.1 | `getError()` falls back to `generic` |
| Localized fallbacks | 3.2 | All fallbacks use translated strings |
| Interpolation support | 3.1, 3.2 | Params support for `{min}`, `{max}`, `{types}` |
| Pluralization support | 3.2 | ICU format available in translation strings |
| Client-side integration | 3.1 | `useErrorTranslations()` hook |
| Server-side integration | 3.1 | `getErrorTranslations()` async function |
| Automatic locale detection | 3.1 | Leverages next-intl context |
| Type definitions | 3.1, 3.4 | Full TypeScript types for all functions |
| Documentation | 3.8 | Complete usage guide with examples |
| Unit tests | 3.7 | Tests for all error types and fallbacks |
| Migration guide | 3.8 | Included in documentation |

---

## 6. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hook-based client API | `useErrorTranslations()` | Follows React patterns, integrates with next-intl |
| Async server API | `getErrorTranslations()` | Matches next-intl server pattern |
| Categorized namespaces | `errors.form.*`, `errors.auth.*` | Organized structure, easier maintenance |
| Typed key parameters | Union types for each category | Type safety, autocomplete support |
| Backward compatibility | Integration helpers | Gradual migration without breaking changes |
| Fallback strategy | Return `generic` error | Always shows localized message |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing error handling | Low | High | Integration helpers maintain backward compatibility |
| Missing translations at runtime | Medium | Medium | Built-in fallback to generic error message |
| Type mismatches | Low | Low | Full TypeScript coverage with strict types |
| Performance overhead | Low | Low | Translations loaded once, cached by next-intl |
| Complex migration | Medium | Medium | Incremental adoption supported |

---

## 8. Implementation Order

1. **Task 3.1:** Create error translation module (core functionality)
2. **Task 3.4:** Add type definitions (supports Task 3.1)
3. **Task 3.2:** Expand translation files (provides translations)
4. **Task 3.3:** Update module exports (makes available)
5. **Task 3.5:** Create integration helpers (backward compatibility)
6. **Task 3.6:** Generate non-English translations (i18n completion)
7. **Task 3.7:** Create unit tests (quality assurance)
8. **Task 3.8:** Create documentation (developer guidance)

---

## 9. Estimated Total Effort

| Task | Estimate |
|------|----------|
| Task 3.1: Error translation module | 2-3 hours |
| Task 3.2: Expand translation files | 1-2 hours |
| Task 3.3: Update exports | 15 minutes |
| Task 3.4: Type definitions | 30 minutes |
| Task 3.5: Integration helpers | 1 hour |
| Task 3.6: Generate translations | 1-2 hours |
| Task 3.7: Unit tests | 2 hours |
| Task 3.8: Documentation | 1 hour |
| **Total** | **9-12 hours** |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2J, Task 2J.4
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - i18n infrastructure
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - Translation framework
- [Existing Error Utils](/src/lib/error-utils.ts) - Current implementation
- [Error Types](/src/types/index.ts) - ErrorCode enum, UserFriendlyError interface
