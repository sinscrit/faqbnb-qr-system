# REQ-318: Create Centralized Error Message Utility - Implementation Overview

**Last Modified:** 2026-01-18 19:45:00 UTC
**Request ID:** REQ-318
**Type:** NEW FEATURE
**Size:** M
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.4
**Epic Reference:** L10N Epic 2 - Static UI Translation
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This task creates a centralized error message utility that standardizes error handling across both frontend and backend components while integrating with the i18n translation system. The utility will transform various error inputs (Error objects, API responses, validation failures) into standardized, localized error messages suitable for display to users.

---

## Current State Analysis

### Existing Error Handling Infrastructure

The codebase already has foundational error handling patterns that this utility will build upon and enhance:

| File | Purpose | Key Functions |
|------|---------|---------------|
| `/src/lib/error-utils.ts` | Error translation & classification | `translateErrorMessage()`, `classifyError()`, `shouldShowError()`, `getErrorDisplayDuration()` |
| `/src/lib/api.ts` | API client error handling | `ApiError` class, `getErrorMessageForStatus()`, `getErrorCodeForStatus()` |
| `/src/types/index.ts` | Type definitions | `ErrorCode` enum, `UserFriendlyError` interface, `HTTP_ERROR_MAPPING` |

### Existing Error Code Enum

```typescript
// From /src/types/index.ts
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
```

### Existing UserFriendlyError Interface

```typescript
// From /src/types/index.ts
export interface UserFriendlyError {
  code: ErrorCode;
  message: string;
  actionable: boolean;
  nextSteps?: string;
}
```

### Current Limitations

1. **No i18n integration** - All error messages are hardcoded in English
2. **Scattered error handling** - Different patterns in `error-utils.ts` vs `api.ts`
3. **Limited error categories** - Missing validation, permission, and file error types
4. **No server-side logging integration** - User-facing and debug info not properly separated
5. **No severity levels** - All errors treated equally regardless of impact
6. **Inconsistent error structure** - API errors and form validation errors have different shapes

---

## Technical Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Inputs                              │
│  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Error   │  │ ApiError  │  │Validation│  │ Error Code  │ │
│  │ Object  │  │           │  │ Results  │  │ String      │ │
│  └────┬────┘  └─────┬─────┘  └────┬─────┘  └──────┬──────┘ │
└───────┼─────────────┼─────────────┼───────────────┼────────┘
        │             │             │               │
        └─────────────┴──────┬──────┴───────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │        Error Message Utility            │
        │   /src/lib/i18n/error-messages.ts       │
        │                                         │
        │  • normalizeError()                     │
        │  • getErrorMessage()                    │
        │  • formatValidationError()              │
        │  • formatApiError()                     │
        │  • useErrorTranslations() hook          │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │        Translation Integration          │
        │                                         │
        │  errors namespace in /messages/en.json  │
        │  • errors.form.*                        │
        │  • errors.api.*                         │
        │  • errors.network.*                     │
        │  • errors.auth.*                        │
        │  • errors.permission.*                  │
        │  • errors.file.*                        │
        │  • errors.item.*                        │
        │  • errors.property.*                    │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │        Standardized Output              │
        │   StandardizedError                     │
        │  • code: string                         │
        │  • message: string (localized)          │
        │  • severity: 'error'|'warning'|'info'   │
        │  • actionable: boolean                  │
        │  • nextSteps?: string (localized)       │
        │  • field?: string (for validation)      │
        │  • details?: object (for logging)       │
        └─────────────────────────────────────────┘
```

### Standardized Error Interface

```typescript
// Enhanced interface building on UserFriendlyError
export interface StandardizedError {
  // Core identification
  code: string;                    // Error code for programmatic handling
  category: ErrorCategory;         // validation | api | network | auth | permission | file | business

  // User-facing content (localized)
  message: string;                 // User-friendly message
  severity: ErrorSeverity;         // error | warning | info
  actionable: boolean;             // Whether user can take action
  nextSteps?: string;              // Guidance for resolution (localized)

  // Context
  field?: string;                  // Field name for validation errors
  params?: Record<string, unknown>; // Parameters for message interpolation

  // Internal (for logging, not shown to user)
  details?: {
    originalError?: unknown;
    timestamp: string;
    requestId?: string;
    stack?: string;
  };
}

export type ErrorCategory =
  | 'validation'
  | 'api'
  | 'network'
  | 'auth'
  | 'permission'
  | 'file'
  | 'business';

export type ErrorSeverity = 'error' | 'warning' | 'info';
```

---

## Implementation Tasks

### Task 1: Extend Error Types and Categories

**File:** `/src/types/index.ts`

Extend the existing `ErrorCode` enum with additional categories needed for comprehensive error handling:

```typescript
// Extended ErrorCode enum
export enum ErrorCode {
  // Existing codes
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USER_ALREADY_REGISTERED = 'USER_ALREADY_REGISTERED',
  INVALID_ACCESS_CODE = 'INVALID_ACCESS_CODE',
  EMAIL_MISMATCH = 'EMAIL_MISMATCH',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OAUTH_SESSION_EXPIRED = 'OAUTH_SESSION_EXPIRED',
  OAUTH_REGISTRATION_CONFLICT = 'OAUTH_REGISTRATION_CONFLICT',
  OAUTH_AUTHENTICATION_FAILED = 'OAUTH_AUTHENTICATION_FAILED',

  // New form validation codes
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  INVALID_FORMAT = 'INVALID_FORMAT',
  TOO_SHORT = 'TOO_SHORT',
  TOO_LONG = 'TOO_LONG',
  INVALID_URL = 'INVALID_URL',
  INVALID_PHONE = 'INVALID_PHONE',

  // API error codes
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',

  // File error codes
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Business logic codes
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_CREATE_FAILED = 'ITEM_CREATE_FAILED',
  ITEM_UPDATE_FAILED = 'ITEM_UPDATE_FAILED',
  ITEM_DELETE_FAILED = 'ITEM_DELETE_FAILED',
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',

  // Generic fallback
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

**Acceptance Criteria:**
- [ ] ErrorCode enum extended with all new error codes
- [ ] StandardizedError interface exported
- [ ] ErrorCategory and ErrorSeverity types exported
- [ ] No breaking changes to existing code

---

### Task 2: Create Error Messages Translation Namespace

**File:** `/messages/en.json` (create or extend existing)

Create the `errors` namespace structure following the plan from Plan-111:

```json
{
  "errors": {
    "form": {
      "required": "This field is required",
      "requiredField": "{field} is required",
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
      "badRequest": "Invalid request data",
      "notFound": "The requested resource was not found",
      "unauthorized": "Authentication required",
      "forbidden": "Access denied",
      "conflict": "This resource already exists",
      "rateLimited": "Too many requests. Please try again later.",
      "serverError": "Server error. Please try again later.",
      "serviceUnavailable": "Service temporarily unavailable",
      "timeout": "Request timed out. Please try again."
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
      "oauthExpired": "OAuth session expired. Please sign in with Google again.",
      "oauthConflict": "OAuth registration conflict. Account may already exist.",
      "oauthFailed": "OAuth authentication failed. Please try again."
    },
    "permission": {
      "denied": "You don't have permission to perform this action",
      "insufficientPrivileges": "Insufficient privileges for this operation"
    },
    "file": {
      "tooLarge": "File size exceeds {max}MB limit",
      "invalidType": "Invalid file type. Allowed: {types}",
      "uploadFailed": "File upload failed. Please try again."
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
    "nextSteps": {
      "tryAgain": "Please try again",
      "checkConnection": "Check your internet connection and retry",
      "contactSupport": "If the problem persists, please contact support",
      "refreshPage": "Try refreshing the page",
      "loginAgain": "Please sign in again",
      "goToLogin": "Click 'Go to Login' to access your account",
      "checkInput": "Review your input and fix any errors",
      "verifyEmail": "Verify your access code and email, or request a new invitation",
      "restartOauth": "Click 'Continue with Google' to restart the OAuth process"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] errors namespace created in en.json
- [ ] All error categories populated with messages
- [ ] Dynamic parameter placeholders use {param} format
- [ ] nextSteps section provides actionable guidance
- [ ] JSON structure is valid

---

### Task 3: Create Centralized Error Message Utility

**File:** `/src/lib/i18n/error-messages.ts` (new file)

```typescript
/**
 * Centralized Error Message Utility
 * REQ-318: Task 2J.4 - Create centralized error message utility
 *
 * Provides standardized error handling with i18n integration for both
 * frontend React components and backend API route handlers.
 *
 * Created: 2026-01-18
 */

import { useTranslations, useLocale } from 'next-intl';
import { ErrorCode, ApiError } from '@/types';
import type { StandardizedError, ErrorCategory, ErrorSeverity } from '@/types';

/**
 * Maps ErrorCode to translation key path
 */
const ERROR_CODE_TO_KEY: Record<string, string> = {
  // Form validation
  [ErrorCode.VALIDATION_FAILED]: 'form.invalidFormat',
  [ErrorCode.REQUIRED_FIELD]: 'form.required',
  [ErrorCode.INVALID_EMAIL]: 'form.email',
  [ErrorCode.INVALID_PASSWORD]: 'form.password.tooWeak',
  [ErrorCode.PASSWORD_MISMATCH]: 'form.password.mismatch',
  [ErrorCode.TOO_SHORT]: 'form.minLength',
  [ErrorCode.TOO_LONG]: 'form.maxLength',
  [ErrorCode.INVALID_URL]: 'form.invalidUrl',
  [ErrorCode.INVALID_PHONE]: 'form.invalidPhone',

  // API errors
  [ErrorCode.BAD_REQUEST]: 'api.badRequest',
  [ErrorCode.UNAUTHORIZED]: 'api.unauthorized',
  [ErrorCode.FORBIDDEN]: 'api.forbidden',
  [ErrorCode.NOT_FOUND]: 'api.notFound',
  [ErrorCode.CONFLICT]: 'api.conflict',
  [ErrorCode.RATE_LIMITED]: 'api.rateLimited',
  [ErrorCode.INTERNAL_ERROR]: 'api.serverError',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'api.serviceUnavailable',
  [ErrorCode.TIMEOUT]: 'api.timeout',

  // Network errors
  [ErrorCode.NETWORK_ERROR]: 'network.connectionFailed',

  // Auth errors
  [ErrorCode.USER_ALREADY_REGISTERED]: 'auth.accountLocked',
  [ErrorCode.INVALID_ACCESS_CODE]: 'auth.accessDenied',
  [ErrorCode.EMAIL_MISMATCH]: 'auth.invalidCredentials',
  [ErrorCode.OAUTH_SESSION_EXPIRED]: 'auth.oauthExpired',
  [ErrorCode.OAUTH_REGISTRATION_CONFLICT]: 'auth.oauthConflict',
  [ErrorCode.OAUTH_AUTHENTICATION_FAILED]: 'auth.oauthFailed',

  // File errors
  [ErrorCode.FILE_TOO_LARGE]: 'file.tooLarge',
  [ErrorCode.INVALID_FILE_TYPE]: 'file.invalidType',
  [ErrorCode.UPLOAD_FAILED]: 'file.uploadFailed',

  // Item errors
  [ErrorCode.ITEM_NOT_FOUND]: 'item.notFound',
  [ErrorCode.ITEM_CREATE_FAILED]: 'item.createFailed',
  [ErrorCode.ITEM_UPDATE_FAILED]: 'item.updateFailed',
  [ErrorCode.ITEM_DELETE_FAILED]: 'item.deleteFailed',
  [ErrorCode.DUPLICATE_NAME]: 'item.duplicateName',

  // Property errors
  [ErrorCode.PROPERTY_NOT_FOUND]: 'property.notFound',

  // Fallback
  [ErrorCode.UNKNOWN_ERROR]: 'api.generic'
};

/**
 * Maps HTTP status codes to error categories and codes
 */
const HTTP_STATUS_TO_ERROR: Record<number, { code: ErrorCode; category: ErrorCategory; severity: ErrorSeverity }> = {
  400: { code: ErrorCode.BAD_REQUEST, category: 'validation', severity: 'error' },
  401: { code: ErrorCode.UNAUTHORIZED, category: 'auth', severity: 'error' },
  403: { code: ErrorCode.FORBIDDEN, category: 'permission', severity: 'error' },
  404: { code: ErrorCode.NOT_FOUND, category: 'api', severity: 'warning' },
  409: { code: ErrorCode.CONFLICT, category: 'business', severity: 'error' },
  429: { code: ErrorCode.RATE_LIMITED, category: 'api', severity: 'warning' },
  500: { code: ErrorCode.INTERNAL_ERROR, category: 'api', severity: 'error' },
  502: { code: ErrorCode.SERVICE_UNAVAILABLE, category: 'network', severity: 'error' },
  503: { code: ErrorCode.SERVICE_UNAVAILABLE, category: 'network', severity: 'error' },
  504: { code: ErrorCode.TIMEOUT, category: 'network', severity: 'error' }
};

/**
 * Normalizes various error input types to a consistent ErrorCode
 */
export function normalizeErrorCode(error: unknown): ErrorCode {
  if (typeof error === 'string') {
    // Check if it's a valid ErrorCode
    if (Object.values(ErrorCode).includes(error as ErrorCode)) {
      return error as ErrorCode;
    }
    // Pattern matching for common error strings
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return ErrorCode.NETWORK_ERROR;
    }
    if (error.toLowerCase().includes('already registered') || error.toLowerCase().includes('exists')) {
      return ErrorCode.CONFLICT;
    }
    if (error.toLowerCase().includes('access code') || error.toLowerCase().includes('invalid code')) {
      return ErrorCode.INVALID_ACCESS_CODE;
    }
    return ErrorCode.UNKNOWN_ERROR;
  }

  if (error instanceof ApiError) {
    if (error.code && Object.values(ErrorCode).includes(error.code as ErrorCode)) {
      return error.code as ErrorCode;
    }
    if (error.status && HTTP_STATUS_TO_ERROR[error.status]) {
      return HTTP_STATUS_TO_ERROR[error.status].code;
    }
  }

  if (error instanceof Error) {
    return normalizeErrorCode(error.message);
  }

  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Determines error category from error code
 */
export function getErrorCategory(code: ErrorCode): ErrorCategory {
  if (code.startsWith('VALIDATION') || code.startsWith('REQUIRED') ||
      code.startsWith('INVALID') || code.startsWith('TOO_')) {
    return 'validation';
  }
  if (code.startsWith('OAUTH') || code.includes('AUTH') ||
      code === ErrorCode.USER_ALREADY_REGISTERED || code === ErrorCode.EMAIL_MISMATCH) {
    return 'auth';
  }
  if (code === ErrorCode.FORBIDDEN) {
    return 'permission';
  }
  if (code === ErrorCode.NETWORK_ERROR || code === ErrorCode.TIMEOUT ||
      code === ErrorCode.SERVICE_UNAVAILABLE) {
    return 'network';
  }
  if (code.startsWith('FILE_') || code === ErrorCode.UPLOAD_FAILED) {
    return 'file';
  }
  if (code.startsWith('ITEM_') || code.startsWith('PROPERTY_') ||
      code === ErrorCode.DUPLICATE_NAME) {
    return 'business';
  }
  return 'api';
}

/**
 * Determines error severity from error code
 */
export function getErrorSeverity(code: ErrorCode): ErrorSeverity {
  // Warning-level errors (user can recover easily)
  const warningCodes = [
    ErrorCode.NOT_FOUND,
    ErrorCode.RATE_LIMITED,
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.REQUIRED_FIELD
  ];

  if (warningCodes.includes(code)) {
    return 'warning';
  }

  return 'error';
}

/**
 * Determines if error is actionable by user
 */
export function isActionableError(code: ErrorCode): boolean {
  // Non-actionable errors (server-side issues user can't fix)
  const nonActionable = [
    ErrorCode.INTERNAL_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE
  ];

  return !nonActionable.includes(code);
}

/**
 * Gets the appropriate nextSteps translation key for an error
 */
export function getNextStepsKey(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.TIMEOUT:
      return 'nextSteps.checkConnection';
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.OAUTH_SESSION_EXPIRED:
      return 'nextSteps.loginAgain';
    case ErrorCode.USER_ALREADY_REGISTERED:
      return 'nextSteps.goToLogin';
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.BAD_REQUEST:
      return 'nextSteps.checkInput';
    case ErrorCode.INVALID_ACCESS_CODE:
    case ErrorCode.EMAIL_MISMATCH:
      return 'nextSteps.verifyEmail';
    case ErrorCode.OAUTH_REGISTRATION_CONFLICT:
    case ErrorCode.OAUTH_AUTHENTICATION_FAILED:
      return 'nextSteps.restartOauth';
    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.SERVICE_UNAVAILABLE:
      return 'nextSteps.contactSupport';
    default:
      return 'nextSteps.tryAgain';
  }
}

/**
 * React hook for error translations in client components
 * Returns helper functions for formatting errors with localization
 */
export function useErrorTranslations() {
  const t = useTranslations('errors');
  const locale = useLocale();

  /**
   * Formats any error into a StandardizedError with localized message
   */
  const formatError = (
    error: unknown,
    params?: Record<string, unknown>
  ): StandardizedError => {
    const code = normalizeErrorCode(error);
    const category = getErrorCategory(code);
    const severity = getErrorSeverity(code);
    const actionable = isActionableError(code);

    const translationKey = ERROR_CODE_TO_KEY[code] || 'api.generic';
    const nextStepsKey = getNextStepsKey(code);

    return {
      code,
      category,
      message: t(translationKey, params),
      severity,
      actionable,
      nextSteps: actionable ? t(nextStepsKey) : undefined,
      params,
      details: {
        originalError: error,
        timestamp: new Date().toISOString()
      }
    };
  };

  /**
   * Formats a form validation error
   */
  const formatValidationError = (
    field: string,
    errorType: 'required' | 'email' | 'minLength' | 'maxLength' | 'invalidFormat' | 'invalidUrl',
    params?: Record<string, unknown>
  ): StandardizedError => {
    const translationKey = `form.${errorType}`;

    return {
      code: ErrorCode.VALIDATION_FAILED,
      category: 'validation',
      message: t(translationKey, { field, ...params }),
      severity: 'warning',
      actionable: true,
      field,
      nextSteps: t('nextSteps.checkInput'),
      params: { field, ...params }
    };
  };

  /**
   * Formats an API error response
   */
  const formatApiError = (
    status: number,
    apiMessage?: string,
    apiCode?: string
  ): StandardizedError => {
    // Try to use API-provided code if valid
    if (apiCode && Object.values(ErrorCode).includes(apiCode as ErrorCode)) {
      return formatError(apiCode as ErrorCode);
    }

    // Fall back to HTTP status mapping
    const statusMapping = HTTP_STATUS_TO_ERROR[status];
    if (statusMapping) {
      return formatError(statusMapping.code);
    }

    // Unknown status - use generic error
    return formatError(ErrorCode.UNKNOWN_ERROR);
  };

  /**
   * Gets translated error message only
   */
  const getErrorMessage = (code: ErrorCode, params?: Record<string, unknown>): string => {
    const translationKey = ERROR_CODE_TO_KEY[code] || 'api.generic';
    return t(translationKey, params);
  };

  /**
   * Gets translated next steps only
   */
  const getNextSteps = (code: ErrorCode): string | undefined => {
    if (!isActionableError(code)) return undefined;
    return t(getNextStepsKey(code));
  };

  return {
    formatError,
    formatValidationError,
    formatApiError,
    getErrorMessage,
    getNextSteps,
    t // Expose raw translator for custom needs
  };
}

/**
 * Server-side error formatting (for API routes)
 * Does not use hooks - accepts locale parameter
 */
export function createServerErrorFormatter(locale: string = 'en') {
  // For server-side, we need to load translations differently
  // This is a simplified version - in production, use getTranslations from next-intl/server

  return {
    /**
     * Format error for API response (user-facing only)
     */
    formatForResponse: (
      error: unknown,
      params?: Record<string, unknown>
    ): { error: string; code: string; actionable: boolean } => {
      const code = normalizeErrorCode(error);
      const actionable = isActionableError(code);

      // In server context, return code and let client handle translation
      // Or use getTranslations for server-rendered messages
      return {
        error: code, // Client will translate
        code: code,
        actionable
      };
    },

    /**
     * Format error for logging (includes debug details)
     */
    formatForLogging: (
      error: unknown,
      context?: { requestId?: string; userId?: string; path?: string }
    ): object => {
      const code = normalizeErrorCode(error);
      const category = getErrorCategory(code);

      return {
        code,
        category,
        timestamp: new Date().toISOString(),
        ...context,
        originalError: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      };
    }
  };
}

/**
 * Type guard for StandardizedError
 */
export function isStandardizedError(error: unknown): error is StandardizedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'category' in error &&
    'severity' in error
  );
}

/**
 * Display duration in milliseconds for different error types
 */
export function getErrorDisplayDuration(code: ErrorCode): number {
  // Persistent (until user takes action)
  if ([
    ErrorCode.USER_ALREADY_REGISTERED,
    ErrorCode.INVALID_ACCESS_CODE,
    ErrorCode.OAUTH_SESSION_EXPIRED,
    ErrorCode.OAUTH_AUTHENTICATION_FAILED,
    ErrorCode.FORBIDDEN
  ].includes(code)) {
    return 0;
  }

  // Longer display for OAuth/complex errors
  if (code === ErrorCode.OAUTH_REGISTRATION_CONFLICT) {
    return 12000;
  }

  // Network errors
  if ([ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT].includes(code)) {
    return 10000;
  }

  // Validation errors
  if (getErrorCategory(code) === 'validation') {
    return 8000;
  }

  // Default
  return 6000;
}
```

**Acceptance Criteria:**
- [ ] File created at `/src/lib/i18n/error-messages.ts`
- [ ] `useErrorTranslations` hook exported for client components
- [ ] `createServerErrorFormatter` function exported for API routes
- [ ] `normalizeErrorCode` handles Error objects, ApiError, strings
- [ ] `formatError` returns StandardizedError with localized message
- [ ] `formatValidationError` handles field-specific validation
- [ ] `formatApiError` handles HTTP status codes
- [ ] Display duration function implemented
- [ ] Type guards included

---

### Task 4: Update Existing error-utils.ts for Integration

**File:** `/src/lib/error-utils.ts`

Refactor existing functions to use the new centralized utility while maintaining backward compatibility:

```typescript
/**
 * Error handling utilities - Updated for i18n integration
 * REQ-019: User-friendly error messages
 * REQ-318: Centralized error message utility integration
 *
 * Last Modified: 2026-01-18
 */

import { UserFriendlyError, ErrorCode, HTTP_ERROR_MAPPING } from '@/types';
import { normalizeErrorCode, getErrorCategory, getErrorSeverity, isActionableError, getNextStepsKey } from './i18n/error-messages';

// Re-export from centralized utility for backward compatibility
export { normalizeErrorCode, getErrorCategory, getErrorSeverity };

/**
 * Translates technical error messages to user-friendly format
 * @deprecated Use useErrorTranslations().formatError() for localized messages
 */
export function translateErrorMessage(error: string, statusCode?: number): UserFriendlyError {
  // Extract status code from error message if not provided
  let extractedStatusCode = statusCode;

  if (!extractedStatusCode && error) {
    const statusMatch = error.match(/(\d{3})\s*(?:Conflict|Not Found|Error|Bad Request)/i);
    if (statusMatch) {
      extractedStatusCode = parseInt(statusMatch[1], 10);
    }
  }

  // Use new normalizeErrorCode for consistent code extraction
  const code = normalizeErrorCode(error);

  // Map HTTP status codes to user-friendly errors (legacy behavior)
  if (extractedStatusCode && HTTP_ERROR_MAPPING[extractedStatusCode]) {
    const mapping = HTTP_ERROR_MAPPING[extractedStatusCode];
    return {
      code,
      ...mapping
    };
  }

  // Legacy pattern matching preserved for backward compatibility
  // New code should use useErrorTranslations() hook
  if (error.toLowerCase().includes('email') && error.toLowerCase().includes('mismatch')) {
    return {
      code: ErrorCode.EMAIL_MISMATCH,
      message: "Email does not match the access request",
      actionable: true,
      nextSteps: "Please check that you're using the correct email address from your invitation"
    };
  }

  // ... (rest of existing pattern matching preserved)

  // Default fallback
  return {
    code: ErrorCode.VALIDATION_FAILED,
    message: "Something went wrong - please try again",
    actionable: true,
    nextSteps: "If the problem continues, please refresh the page or contact support"
  };
}

/**
 * Classifies errors by type and severity
 * Enhanced to use centralized category/severity logic
 */
export function classifyError(error: unknown): {
  type: 'validation' | 'network' | 'business',
  severity: 'low' | 'medium' | 'high'
} {
  const code = normalizeErrorCode(error);
  const category = getErrorCategory(code);
  const severity = getErrorSeverity(code);

  // Map new categories to legacy type names
  const typeMap: Record<string, 'validation' | 'network' | 'business'> = {
    'validation': 'validation',
    'network': 'network',
    'auth': 'business',
    'permission': 'business',
    'api': 'business',
    'file': 'validation',
    'business': 'business'
  };

  // Map new severity to legacy severity
  const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'info': 'low',
    'warning': 'low',
    'error': 'medium'
  };

  return {
    type: typeMap[category] || 'business',
    severity: severityMap[severity] || 'medium'
  };
}

/**
 * Determines if error should be shown to user
 */
export function shouldShowError(error: UserFriendlyError): boolean {
  return true; // Always show user-friendly errors
}

/**
 * Gets display duration for error messages
 * @deprecated Use getErrorDisplayDuration from error-messages.ts
 */
export function getErrorDisplayDuration(error: UserFriendlyError): number {
  // Import and delegate to new implementation
  const { getErrorDisplayDuration: newGetDuration } = require('./i18n/error-messages');
  return newGetDuration(error.code);
}
```

**Acceptance Criteria:**
- [ ] Existing functions maintain backward compatibility
- [ ] Deprecation warnings added to legacy functions
- [ ] Integration with new centralized utility
- [ ] No breaking changes for existing consumers

---

### Task 5: Create Unit Tests

**File:** `/src/lib/i18n/__tests__/error-messages.test.ts` (new file)

```typescript
/**
 * Unit tests for centralized error message utility
 * REQ-318: Task 2J.4
 */

import {
  normalizeErrorCode,
  getErrorCategory,
  getErrorSeverity,
  isActionableError,
  getNextStepsKey,
  getErrorDisplayDuration,
  createServerErrorFormatter,
  isStandardizedError
} from '../error-messages';
import { ErrorCode, ApiError } from '@/types';

describe('normalizeErrorCode', () => {
  it('should return valid ErrorCode from string', () => {
    expect(normalizeErrorCode('VALIDATION_FAILED')).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('should detect network errors from message', () => {
    expect(normalizeErrorCode('Network request failed')).toBe(ErrorCode.NETWORK_ERROR);
    expect(normalizeErrorCode('fetch error')).toBe(ErrorCode.NETWORK_ERROR);
  });

  it('should handle ApiError instances', () => {
    const error = new ApiError('Not found', 404, 'NOT_FOUND');
    expect(normalizeErrorCode(error)).toBe(ErrorCode.NOT_FOUND);
  });

  it('should handle Error objects', () => {
    const error = new Error('User already registered');
    expect(normalizeErrorCode(error)).toBe(ErrorCode.CONFLICT);
  });

  it('should return UNKNOWN_ERROR for unrecognized errors', () => {
    expect(normalizeErrorCode(null)).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(normalizeErrorCode({})).toBe(ErrorCode.UNKNOWN_ERROR);
  });
});

describe('getErrorCategory', () => {
  it('should categorize validation errors', () => {
    expect(getErrorCategory(ErrorCode.VALIDATION_FAILED)).toBe('validation');
    expect(getErrorCategory(ErrorCode.REQUIRED_FIELD)).toBe('validation');
  });

  it('should categorize auth errors', () => {
    expect(getErrorCategory(ErrorCode.UNAUTHORIZED)).toBe('auth');
    expect(getErrorCategory(ErrorCode.OAUTH_SESSION_EXPIRED)).toBe('auth');
  });

  it('should categorize network errors', () => {
    expect(getErrorCategory(ErrorCode.NETWORK_ERROR)).toBe('network');
    expect(getErrorCategory(ErrorCode.TIMEOUT)).toBe('network');
  });
});

describe('getErrorSeverity', () => {
  it('should return warning for recoverable errors', () => {
    expect(getErrorSeverity(ErrorCode.NOT_FOUND)).toBe('warning');
    expect(getErrorSeverity(ErrorCode.RATE_LIMITED)).toBe('warning');
  });

  it('should return error for serious issues', () => {
    expect(getErrorSeverity(ErrorCode.INTERNAL_ERROR)).toBe('error');
    expect(getErrorSeverity(ErrorCode.FORBIDDEN)).toBe('error');
  });
});

describe('isActionableError', () => {
  it('should return false for server errors', () => {
    expect(isActionableError(ErrorCode.INTERNAL_ERROR)).toBe(false);
    expect(isActionableError(ErrorCode.SERVICE_UNAVAILABLE)).toBe(false);
  });

  it('should return true for user-recoverable errors', () => {
    expect(isActionableError(ErrorCode.VALIDATION_FAILED)).toBe(true);
    expect(isActionableError(ErrorCode.NETWORK_ERROR)).toBe(true);
  });
});

describe('getNextStepsKey', () => {
  it('should return appropriate next steps for error types', () => {
    expect(getNextStepsKey(ErrorCode.NETWORK_ERROR)).toBe('nextSteps.checkConnection');
    expect(getNextStepsKey(ErrorCode.UNAUTHORIZED)).toBe('nextSteps.loginAgain');
    expect(getNextStepsKey(ErrorCode.VALIDATION_FAILED)).toBe('nextSteps.checkInput');
  });
});

describe('getErrorDisplayDuration', () => {
  it('should return 0 for persistent errors', () => {
    expect(getErrorDisplayDuration(ErrorCode.USER_ALREADY_REGISTERED)).toBe(0);
    expect(getErrorDisplayDuration(ErrorCode.FORBIDDEN)).toBe(0);
  });

  it('should return appropriate duration for other errors', () => {
    expect(getErrorDisplayDuration(ErrorCode.NETWORK_ERROR)).toBe(10000);
    expect(getErrorDisplayDuration(ErrorCode.OAUTH_REGISTRATION_CONFLICT)).toBe(12000);
  });
});

describe('createServerErrorFormatter', () => {
  const formatter = createServerErrorFormatter('en');

  it('should format error for response', () => {
    const result = formatter.formatForResponse('VALIDATION_FAILED');
    expect(result.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(result.actionable).toBe(true);
  });

  it('should format error for logging with context', () => {
    const result = formatter.formatForLogging(new Error('Test error'), {
      requestId: 'req-123',
      userId: 'user-456'
    });
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('requestId', 'req-123');
    expect(result).toHaveProperty('originalError');
  });
});

describe('isStandardizedError', () => {
  it('should return true for valid StandardizedError', () => {
    const error = {
      code: ErrorCode.VALIDATION_FAILED,
      message: 'Test',
      category: 'validation',
      severity: 'error',
      actionable: true
    };
    expect(isStandardizedError(error)).toBe(true);
  });

  it('should return false for non-StandardizedError', () => {
    expect(isStandardizedError({ message: 'just a message' })).toBe(false);
    expect(isStandardizedError(null)).toBe(false);
    expect(isStandardizedError('string')).toBe(false);
  });
});
```

**Acceptance Criteria:**
- [ ] Tests cover all exported functions
- [ ] Tests for error normalization from various inputs
- [ ] Tests for category/severity determination
- [ ] Tests for server-side formatter
- [ ] All tests pass

---

### Task 6: Create Documentation

**File:** `/docs/i18n/error-handling.md` (new file)

```markdown
# Error Handling with Internationalization

**Last Modified:** 2026-01-18
**REQ:** REQ-318 - Centralized Error Message Utility

## Overview

The centralized error message utility provides standardized error handling with full internationalization support. It transforms various error inputs into localized, user-friendly messages.

## Quick Start

### Client Components (React)

```tsx
import { useErrorTranslations } from '@/lib/i18n/error-messages';

function MyComponent() {
  const { formatError, formatValidationError } = useErrorTranslations();

  const handleSubmit = async () => {
    try {
      await api.submit(data);
    } catch (error) {
      // Automatically localized error
      const standardError = formatError(error);
      setError(standardError.message);

      if (standardError.nextSteps) {
        setHelpText(standardError.nextSteps);
      }
    }
  };

  const validateField = (value: string) => {
    if (!value) {
      return formatValidationError('email', 'required');
    }
    return null;
  };
}
```

### API Routes (Server-side)

```typescript
import { createServerErrorFormatter } from '@/lib/i18n/error-messages';

export async function POST(request: Request) {
  const formatter = createServerErrorFormatter('en');

  try {
    // ... operation
  } catch (error) {
    // Log full details
    console.error(formatter.formatForLogging(error, {
      path: '/api/items',
      requestId: request.headers.get('x-request-id')
    }));

    // Return sanitized response
    return NextResponse.json(
      formatter.formatForResponse(error),
      { status: 500 }
    );
  }
}
```

## Error Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `validation` | Form/input validation errors | Required field, invalid email |
| `api` | API response errors | Bad request, not found |
| `network` | Connection issues | Offline, timeout |
| `auth` | Authentication errors | Invalid credentials, session expired |
| `permission` | Authorization errors | Access denied, forbidden |
| `file` | File operation errors | Too large, invalid type |
| `business` | Business logic errors | Duplicate name, item not found |

## Adding Translation Keys

Add new error messages to `/messages/en.json`:

```json
{
  "errors": {
    "custom": {
      "newError": "Your new error message with {param}"
    }
  }
}
```

Then update `ERROR_CODE_TO_KEY` mapping in `/src/lib/i18n/error-messages.ts`.

## Migration from Legacy

Replace calls to `translateErrorMessage()` with `useErrorTranslations().formatError()`:

```tsx
// Before
const friendly = translateErrorMessage(error);
setError(friendly.message);

// After
const { formatError } = useErrorTranslations();
const friendly = formatError(error);
setError(friendly.message);
```
```

**Acceptance Criteria:**
- [ ] Documentation created with usage examples
- [ ] Quick start guide for client and server usage
- [ ] Migration guide from legacy functions
- [ ] Error category reference table

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/error-messages.ts` | Main centralized error utility |
| `/src/lib/i18n/__tests__/error-messages.test.ts` | Unit tests |
| `/messages/en.json` | English translations (create or extend) |
| `/docs/i18n/error-handling.md` | Developer documentation |

### Files to Modify

| File Path | Functions/Sections to Modify | Change Type |
|-----------|------------------------------|-------------|
| `/src/types/index.ts` | `ErrorCode` enum (extend), add `StandardizedError`, `ErrorCategory`, `ErrorSeverity` | Extension |
| `/src/lib/error-utils.ts` | `translateErrorMessage()`, `classifyError()`, `getErrorDisplayDuration()` | Refactor + Deprecation |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/lib/api.ts` | Keep ApiError class unchanged; consumers will use new utility |
| `/src/app/api/*` | Will be updated in Task 2J.3 (audit API error handling) |
| Component files | Will be updated as part of sub-epic 2J completion |

---

## Dependencies

### Must Complete Before This Task

| Task | Description | Status |
|------|-------------|--------|
| 2H.1 | Create `common` namespace structure | Required |
| 2J.1 | Create `errors` namespace structure | Required |

### Depends on This Task

| Task | Description |
|------|-------------|
| 2J.5 | Update Zod schemas to use translated messages |
| 2J.6 | Update error boundaries with translations |
| 2J.7 | Generate translations for 5 non-English languages |

---

## Testing Strategy

### Unit Tests
- Test all exported functions independently
- Test error normalization from various input types
- Test category/severity mapping logic

### Integration Tests
- Test `useErrorTranslations` hook in React component context
- Test server-side formatter with mock translations

### Manual Testing
- Verify error messages display correctly in UI
- Test language switching shows correct translations
- Verify error display durations work as expected

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing error handling | Medium | High | Maintain backward compatibility, deprecate gradually |
| Translation keys missing | Low | Medium | Build-time check, runtime fallback to English |
| Performance overhead | Low | Low | Memoize translations, lazy load error namespace |

---

## Rollback Plan

If issues arise:
1. Revert `/src/lib/i18n/error-messages.ts` changes
2. Remove deprecation notices from `error-utils.ts`
3. Keep existing error handling working
4. Error namespace can remain for future use

---

## Acceptance Criteria Summary

- [ ] `useErrorTranslations` hook works in client components
- [ ] `createServerErrorFormatter` works in API routes
- [ ] All error codes map to translation keys
- [ ] Backward compatibility maintained
- [ ] Unit tests pass
- [ ] Documentation complete
- [ ] No TypeScript errors
- [ ] Build succeeds

---

## References

- [Plan-111: L10N Epic 2 Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-019: Error Handling Foundation](/docs/req/REQ-019-error-handling.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
