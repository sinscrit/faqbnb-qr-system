# REQ-351: Create Centralized Error Message Utility - Detailed Task Breakdown

## Document Metadata

| Field | Value |
|-------|-------|
| **Document Created** | 2026-01-19 |
| **Last Modified** | 2026-01-19 |
| **Request ID** | REQ-351 |
| **Epic** | Epic 2 - Static UI Translation |
| **Sub-Epic** | 2J - Error Messages & Validation |
| **Task ID** | 2J.4 |
| **Size** | M (Medium) |
| **Priority** | High (Cross-cutting concern) |
| **Overview Document** | REQ-351-create-centralized-error-message-utility-overview.md |
| **Implementation Plan** | Plan-111-L10N-Epic2-Static-UI-Translation.md |

---

## Summary

This document provides a granular, implementation-ready task breakdown for creating a centralized error message utility that integrates with the next-intl translation system. The utility will replace the existing `src/lib/error-utils.ts` approach with a fully internationalized solution, providing consistent error formatting and localization across all components and API endpoints.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] `next-intl` package is installed (Epic 1 complete)
- [x] Translation files exist at `/messages/*.json` (Epic 1 complete)
- [x] `useTranslations` hook is available from `next-intl`
- [x] `getTranslations` is available from `next-intl/server`
- [x] Existing `src/lib/i18n/index.ts` exports i18n utilities
- [x] Existing `src/lib/error-utils.ts` provides legacy error handling
- [x] `src/types/index.ts` contains `ErrorCode` enum and `UserFriendlyError` interface

---

## Task Breakdown

### Task 1: Create Error Code Constants Module

**File:** `/src/lib/i18n/error-codes.ts` (NEW)
**Estimated Effort:** 1 story point
**Dependencies:** None

#### 1.1 Create error-codes.ts file

Create a new file at `/src/lib/i18n/error-codes.ts` with the following structure:

```typescript
/**
 * Centralized Error Code Constants
 * REQ-351: Create Centralized Error Message Utility
 *
 * This module defines all error codes organized by domain category.
 * Error codes map directly to translation keys in the `errors` namespace.
 *
 * @module lib/i18n/error-codes
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */
```

#### 1.2 Define ERROR_CODES constant object

Create the `ERROR_CODES` constant with all categories:

**Form validation errors:**
- `FORM.REQUIRED` → `'form.required'`
- `FORM.EMAIL_INVALID` → `'form.email'`
- `FORM.PASSWORD_TOO_SHORT` → `'form.password.tooShort'`
- `FORM.PASSWORD_TOO_WEAK` → `'form.password.tooWeak'`
- `FORM.PASSWORD_MISMATCH` → `'form.password.mismatch'`
- `FORM.MAX_LENGTH` → `'form.maxLength'`
- `FORM.MIN_LENGTH` → `'form.minLength'`
- `FORM.INVALID_FORMAT` → `'form.invalidFormat'`
- `FORM.INVALID_URL` → `'form.invalidUrl'`
- `FORM.INVALID_PHONE` → `'form.invalidPhone'`

**API/HTTP errors:**
- `API.GENERIC` → `'api.generic'`
- `API.NOT_FOUND` → `'api.notFound'`
- `API.UNAUTHORIZED` → `'api.unauthorized'`
- `API.FORBIDDEN` → `'api.forbidden'`
- `API.CONFLICT` → `'api.conflict'`
- `API.SERVER_ERROR` → `'api.serverError'`
- `API.TIMEOUT` → `'api.timeout'`
- `API.BAD_REQUEST` → `'api.badRequest'`
- `API.TOO_MANY_REQUESTS` → `'api.tooManyRequests'`

**Network errors:**
- `NETWORK.OFFLINE` → `'network.offline'`
- `NETWORK.CONNECTION_FAILED` → `'network.connectionFailed'`
- `NETWORK.SLOW_CONNECTION` → `'network.slowConnection'`

**Authentication errors:**
- `AUTH.INVALID_CREDENTIALS` → `'auth.invalidCredentials'`
- `AUTH.EMAIL_NOT_VERIFIED` → `'auth.emailNotVerified'`
- `AUTH.SESSION_EXPIRED` → `'auth.sessionExpired'`
- `AUTH.ACCOUNT_LOCKED` → `'auth.accountLocked'`
- `AUTH.ACCESS_DENIED` → `'auth.accessDenied'`
- `AUTH.OAUTH_FAILED` → `'auth.oauthFailed'`
- `AUTH.OAUTH_SESSION_EXPIRED` → `'auth.oauthSessionExpired'`
- `AUTH.EMAIL_MISMATCH` → `'auth.emailMismatch'`

**Item-related errors:**
- `ITEM.NOT_FOUND` → `'item.notFound'`
- `ITEM.CREATE_FAILED` → `'item.createFailed'`
- `ITEM.UPDATE_FAILED` → `'item.updateFailed'`
- `ITEM.DELETE_FAILED` → `'item.deleteFailed'`
- `ITEM.DUPLICATE_NAME` → `'item.duplicateName'`

**Property-related errors:**
- `PROPERTY.NOT_FOUND` → `'property.notFound'`
- `PROPERTY.CREATE_FAILED` → `'property.createFailed'`
- `PROPERTY.UPDATE_FAILED` → `'property.updateFailed'`
- `PROPERTY.DELETE_FAILED` → `'property.deleteFailed'`

**File/upload errors:**
- `FILE.TOO_LARGE` → `'file.tooLarge'`
- `FILE.INVALID_TYPE` → `'file.invalidType'`
- `FILE.UPLOAD_FAILED` → `'file.uploadFailed'`

#### 1.3 Export TypeScript types

```typescript
export type ErrorCodeKey =
  | typeof ERROR_CODES.FORM[keyof typeof ERROR_CODES.FORM]
  | typeof ERROR_CODES.API[keyof typeof ERROR_CODES.API]
  | typeof ERROR_CODES.NETWORK[keyof typeof ERROR_CODES.NETWORK]
  | typeof ERROR_CODES.AUTH[keyof typeof ERROR_CODES.AUTH]
  | typeof ERROR_CODES.ITEM[keyof typeof ERROR_CODES.ITEM]
  | typeof ERROR_CODES.PROPERTY[keyof typeof ERROR_CODES.PROPERTY]
  | typeof ERROR_CODES.FILE[keyof typeof ERROR_CODES.FILE];
```

#### Acceptance Criteria for Task 1
- [ ] File `/src/lib/i18n/error-codes.ts` exists
- [ ] `ERROR_CODES` constant is exported with all categories
- [ ] `ErrorCodeKey` type is exported
- [ ] All error codes follow the `category.specific` pattern
- [ ] File includes JSDoc documentation header

---

### Task 2: Create Main Error Translation Utility

**File:** `/src/lib/i18n/error-translations.ts` (NEW)
**Estimated Effort:** 3 story points
**Dependencies:** Task 1

#### 2.1 Create error-translations.ts file with imports

```typescript
/**
 * Error Translation Utility
 * REQ-351: Create Centralized Error Message Utility
 *
 * Provides centralized functions for translating error messages
 * using next-intl, with support for both client and server components.
 *
 * @module lib/i18n/error-translations
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ERROR_CODES, ErrorCodeKey } from './error-codes';
```

#### 2.2 Define ErrorSeverity type

```typescript
/**
 * Error severity levels for display treatment
 */
export type ErrorSeverity = 'warning' | 'error' | 'critical';
```

#### 2.3 Define LocalizedError interface

```typescript
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
```

#### 2.4 Define ApiErrorResponse interface

```typescript
/**
 * API error response format for consistent server responses
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
```

#### 2.5 Implement useErrorTranslations() hook

Create the client-side hook for error translations:

```typescript
/**
 * Client-side hook for error translations
 * @example
 * const { getError, getFieldError, getApiError } = useErrorTranslations();
 * const errorMsg = getError(ERROR_CODES.FORM.REQUIRED);
 */
export function useErrorTranslations() {
  const t = useTranslations('errors');

  return {
    /**
     * Get localized error message by error code
     */
    getError: (key: ErrorCodeKey | string, params?: Record<string, unknown>): string => {
      try {
        return t(key, params);
      } catch {
        return t('api.generic');
      }
    },

    /**
     * Get field-specific error message for form validation
     */
    getFieldError: (field: string, key: string, params?: Record<string, unknown>): string => {
      try {
        return t(`form.${key}`, { field, ...params });
      } catch {
        return t('form.required', { field });
      }
    },

    /**
     * Get API error message
     */
    getApiError: (key: string): string => {
      try {
        return t(`api.${key}`);
      } catch {
        return t('api.generic');
      }
    },

    /**
     * Get network error message
     */
    getNetworkError: (key: string): string => {
      try {
        return t(`network.${key}`);
      } catch {
        return t('network.connectionFailed');
      }
    },

    /**
     * Get authentication error message
     */
    getAuthError: (key: string): string => {
      try {
        return t(`auth.${key}`);
      } catch {
        return t('auth.invalidCredentials');
      }
    },

    /**
     * Get generic fallback error message
     */
    getFallbackError: (): string => t('api.generic'),

    /**
     * Get multiple error messages at once
     */
    getMultipleErrors: (keys: Array<{ key: ErrorCodeKey | string; params?: Record<string, unknown> }>): string[] => {
      return keys.map(({ key, params }) => {
        try {
          return t(key, params);
        } catch {
          return t('api.generic');
        }
      });
    },
  };
}
```

#### 2.6 Implement getErrorTranslations() for server components

```typescript
/**
 * Server-side error translation function
 * @example
 * const { getError } = await getErrorTranslations();
 * return NextResponse.json({ error: { message: getError(ERROR_CODES.API.NOT_FOUND) } }, { status: 404 });
 */
export async function getErrorTranslations() {
  const t = await getTranslations('errors');

  return {
    /**
     * Get localized error message by error code
     */
    getError: (key: ErrorCodeKey | string, params?: Record<string, unknown>): string => {
      try {
        return t(key, params);
      } catch {
        return t('api.generic');
      }
    },

    /**
     * Get generic fallback error message
     */
    getFallbackError: (): string => t('api.generic'),

    /**
     * Get multiple error messages at once
     */
    getMultipleErrors: (keys: Array<{ key: ErrorCodeKey | string; params?: Record<string, unknown> }>): string[] => {
      return keys.map(({ key, params }) => {
        try {
          return t(key, params);
        } catch {
          return t('api.generic');
        }
      });
    },
  };
}
```

#### 2.7 Implement mapHttpStatusToErrorKey()

```typescript
/**
 * Map HTTP status code to error translation key
 * @param status - HTTP status code
 * @returns Translation key for the error
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
```

#### 2.8 Implement classifyErrorSeverity()

```typescript
/**
 * Classify error severity based on error code
 * @param code - Error code string
 * @returns Error severity level
 */
export function classifyErrorSeverity(code: string): ErrorSeverity {
  // Network issues are warnings - transient and often self-resolving
  if (code.startsWith('network.') || code.includes('timeout') || code.includes('slowConnection')) {
    return 'warning';
  }

  // Server errors and critical failures
  if (code.includes('serverError') || code.includes('critical') || code.startsWith('api.server')) {
    return 'critical';
  }

  // Default to error
  return 'error';
}
```

#### 2.9 Implement parseSupabaseError()

```typescript
/**
 * Extract error information from Supabase error objects
 * @param error - Unknown error from Supabase
 * @returns Normalized error with code and optional message
 */
export function parseSupabaseError(error: unknown): { code: string; message?: string } {
  if (typeof error !== 'object' || error === null) {
    return { code: 'api.generic' };
  }

  const err = error as Record<string, unknown>;

  // Supabase auth errors have a 'code' property
  if ('code' in err && typeof err.code === 'string') {
    const supabaseCodeMap: Record<string, string> = {
      'invalid_credentials': 'auth.invalidCredentials',
      'user_not_found': 'auth.invalidCredentials',
      'email_not_confirmed': 'auth.emailNotVerified',
      'session_expired': 'auth.sessionExpired',
      'user_already_exists': 'api.conflict',
      'invalid_grant': 'auth.invalidCredentials',
      'email_exists': 'api.conflict',
      'phone_exists': 'api.conflict',
      'signup_disabled': 'auth.accessDenied',
      'user_banned': 'auth.accountLocked',
      'otp_expired': 'auth.sessionExpired',
      'same_password': 'form.password.mismatch',
      'weak_password': 'form.password.tooWeak',
    };

    return {
      code: supabaseCodeMap[err.code] || 'api.generic',
      message: typeof err.message === 'string' ? err.message : undefined,
    };
  }

  // Supabase database errors (PostgrestError)
  if ('details' in err || 'hint' in err || 'code' in err) {
    // Check for specific Postgres error codes
    const pgCode = err.code as string;
    if (pgCode === '23505') { // unique_violation
      return { code: 'api.conflict', message: String(err.message || '') };
    }
    if (pgCode === '23503') { // foreign_key_violation
      return { code: 'api.badRequest', message: String(err.message || '') };
    }
    if (pgCode === '42501') { // insufficient_privilege
      return { code: 'api.forbidden', message: String(err.message || '') };
    }

    return { code: 'api.serverError', message: String(err.message || '') };
  }

  // HTTP status code in error
  if ('status' in err && typeof err.status === 'number') {
    return { code: mapHttpStatusToErrorKey(err.status), message: String(err.message || '') };
  }

  return { code: 'api.generic' };
}
```

#### 2.10 Implement extractErrorFromException()

```typescript
/**
 * Extract error information from caught exceptions
 * @param error - Unknown caught error
 * @returns Normalized error with code and optional message
 */
export function extractErrorFromException(error: unknown): { code: string; message?: string } {
  // Handle Error objects
  if (error instanceof Error) {
    // Network/fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { code: 'network.connectionFailed' };
    }
    if (error.name === 'AbortError') {
      return { code: 'api.timeout' };
    }
    if (error.message.toLowerCase().includes('network')) {
      return { code: 'network.connectionFailed' };
    }
    if (error.message.toLowerCase().includes('offline')) {
      return { code: 'network.offline' };
    }

    return { code: 'api.generic', message: error.message };
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return { code: 'network.connectionFailed' };
    }
    return { code: 'api.generic', message: error };
  }

  // Try to parse as Supabase error
  return parseSupabaseError(error);
}
```

#### 2.11 Implement formatApiErrorResponse()

```typescript
/**
 * Format error for API response
 * @param code - Error code
 * @param message - Localized error message
 * @param options - Additional options
 * @returns Formatted API error response
 */
export function formatApiErrorResponse(
  code: string,
  message: string,
  options?: {
    field?: string;
    details?: Record<string, unknown>;
    additionalErrors?: Array<{ code: string; message: string; field?: string }>;
  }
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(options?.field && { field: options.field }),
      ...(options?.details && { details: options.details }),
    },
  };

  if (options?.additionalErrors && options.additionalErrors.length > 0) {
    response.errors = options.additionalErrors;
  }

  return response;
}
```

#### 2.12 Implement createLocalizedError()

```typescript
/**
 * Create a localized error object with full metadata
 * @param code - Error code
 * @param message - Localized message
 * @param options - Additional options
 * @returns LocalizedError object
 */
export function createLocalizedError(
  code: string,
  message: string,
  options?: {
    field?: string;
    params?: Record<string, unknown>;
    severity?: ErrorSeverity;
  }
): LocalizedError {
  return {
    code,
    message,
    severity: options?.severity || classifyErrorSeverity(code),
    ...(options?.field && { field: options.field }),
    ...(options?.params && { params: options.params }),
  };
}
```

#### Acceptance Criteria for Task 2
- [ ] File `/src/lib/i18n/error-translations.ts` exists
- [ ] `useErrorTranslations()` hook is exported and works in client components
- [ ] `getErrorTranslations()` function is exported and works in server components
- [ ] `mapHttpStatusToErrorKey()` maps all common HTTP status codes
- [ ] `classifyErrorSeverity()` returns appropriate severity levels
- [ ] `parseSupabaseError()` handles Supabase auth and database errors
- [ ] `extractErrorFromException()` handles Error objects, strings, and unknown errors
- [ ] `formatApiErrorResponse()` creates consistent API error responses
- [ ] `createLocalizedError()` creates full LocalizedError objects
- [ ] All functions include JSDoc documentation
- [ ] All types are exported

---

### Task 3: Expand Translation Files with Error Messages

**Files:** `/messages/*.json` (MODIFY)
**Estimated Effort:** 2 story points
**Dependencies:** None (can run parallel with Tasks 1-2)

#### 3.1 Update /messages/en.json with expanded errors namespace

Replace the existing `errors` section with the comprehensive structure:

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
      "oauthSessionExpired": "OAuth session expired. Please sign in again.",
      "emailMismatch": "Email does not match the access request"
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

#### 3.2 Update /messages/fr.json (French)

```json
{
  "errors": {
    "form": {
      "required": "Ce champ est obligatoire",
      "email": "Veuillez entrer une adresse email valide",
      "password": {
        "required": "Le mot de passe est obligatoire",
        "tooShort": "Le mot de passe doit contenir au moins {min} caractères",
        "tooWeak": "Le mot de passe doit inclure majuscules, minuscules et chiffres",
        "mismatch": "Les mots de passe ne correspondent pas"
      },
      "maxLength": "Maximum {max} caractères autorisés",
      "minLength": "Minimum {min} caractères requis",
      "invalidFormat": "Format invalide",
      "invalidUrl": "Veuillez entrer une URL valide",
      "invalidPhone": "Veuillez entrer un numéro de téléphone valide"
    },
    "api": {
      "generic": "Une erreur s'est produite. Veuillez réessayer.",
      "notFound": "La ressource demandée est introuvable",
      "unauthorized": "Vous n'êtes pas autorisé à effectuer cette action",
      "forbidden": "Accès refusé",
      "conflict": "Cette ressource existe déjà",
      "serverError": "Erreur serveur. Veuillez réessayer plus tard.",
      "timeout": "La requête a expiré. Veuillez réessayer.",
      "badRequest": "Requête invalide. Veuillez vérifier votre saisie.",
      "tooManyRequests": "Trop de requêtes. Veuillez patienter un moment."
    },
    "network": {
      "offline": "Vous semblez être hors ligne. Vérifiez votre connexion.",
      "connectionFailed": "Impossible de se connecter au serveur",
      "slowConnection": "La connexion est lente. Cela peut prendre un moment."
    },
    "auth": {
      "invalidCredentials": "Email ou mot de passe invalide",
      "emailNotVerified": "Veuillez vérifier votre adresse email",
      "sessionExpired": "Votre session a expiré. Veuillez vous reconnecter.",
      "accountLocked": "Le compte a été verrouillé. Contactez le support.",
      "accessDenied": "Accès refusé à cette ressource",
      "oauthFailed": "L'authentification OAuth a échoué. Veuillez réessayer.",
      "oauthSessionExpired": "Session OAuth expirée. Veuillez vous reconnecter.",
      "emailMismatch": "L'email ne correspond pas à la demande d'accès"
    },
    "item": {
      "notFound": "Élément introuvable",
      "createFailed": "Échec de la création de l'élément",
      "updateFailed": "Échec de la mise à jour de l'élément",
      "deleteFailed": "Échec de la suppression de l'élément",
      "duplicateName": "Un élément avec ce nom existe déjà"
    },
    "property": {
      "notFound": "Propriété introuvable",
      "createFailed": "Échec de la création de la propriété",
      "updateFailed": "Échec de la mise à jour de la propriété",
      "deleteFailed": "Échec de la suppression de la propriété"
    },
    "file": {
      "tooLarge": "La taille du fichier dépasse la limite de {max}Mo",
      "invalidType": "Type de fichier invalide. Autorisés : {types}",
      "uploadFailed": "Échec du téléchargement. Veuillez réessayer."
    }
  }
}
```

#### 3.3 Update /messages/es.json (Spanish)

```json
{
  "errors": {
    "form": {
      "required": "Este campo es obligatorio",
      "email": "Por favor ingresa una dirección de email válida",
      "password": {
        "required": "La contraseña es obligatoria",
        "tooShort": "La contraseña debe tener al menos {min} caracteres",
        "tooWeak": "La contraseña debe incluir mayúsculas, minúsculas y números",
        "mismatch": "Las contraseñas no coinciden"
      },
      "maxLength": "Máximo {max} caracteres permitidos",
      "minLength": "Mínimo {min} caracteres requeridos",
      "invalidFormat": "Formato inválido",
      "invalidUrl": "Por favor ingresa una URL válida",
      "invalidPhone": "Por favor ingresa un número de teléfono válido"
    },
    "api": {
      "generic": "Algo salió mal. Por favor intenta de nuevo.",
      "notFound": "El recurso solicitado no fue encontrado",
      "unauthorized": "No estás autorizado para realizar esta acción",
      "forbidden": "Acceso denegado",
      "conflict": "Este recurso ya existe",
      "serverError": "Error del servidor. Por favor intenta más tarde.",
      "timeout": "La solicitud expiró. Por favor intenta de nuevo.",
      "badRequest": "Solicitud inválida. Por favor verifica tu entrada.",
      "tooManyRequests": "Demasiadas solicitudes. Por favor espera un momento."
    },
    "network": {
      "offline": "Parece que estás sin conexión. Verifica tu conexión.",
      "connectionFailed": "No se puede conectar al servidor",
      "slowConnection": "La conexión es lenta. Esto puede tomar un momento."
    },
    "auth": {
      "invalidCredentials": "Email o contraseña inválidos",
      "emailNotVerified": "Por favor verifica tu dirección de email",
      "sessionExpired": "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
      "accountLocked": "La cuenta ha sido bloqueada. Contacta al soporte.",
      "accessDenied": "Acceso denegado a este recurso",
      "oauthFailed": "La autenticación OAuth falló. Por favor intenta de nuevo.",
      "oauthSessionExpired": "Sesión OAuth expirada. Por favor inicia sesión de nuevo.",
      "emailMismatch": "El email no coincide con la solicitud de acceso"
    },
    "item": {
      "notFound": "Elemento no encontrado",
      "createFailed": "Error al crear el elemento",
      "updateFailed": "Error al actualizar el elemento",
      "deleteFailed": "Error al eliminar el elemento",
      "duplicateName": "Ya existe un elemento con este nombre"
    },
    "property": {
      "notFound": "Propiedad no encontrada",
      "createFailed": "Error al crear la propiedad",
      "updateFailed": "Error al actualizar la propiedad",
      "deleteFailed": "Error al eliminar la propiedad"
    },
    "file": {
      "tooLarge": "El archivo excede el límite de {max}MB",
      "invalidType": "Tipo de archivo inválido. Permitidos: {types}",
      "uploadFailed": "Error al subir el archivo. Por favor intenta de nuevo."
    }
  }
}
```

#### 3.4 Update /messages/de.json (German)

```json
{
  "errors": {
    "form": {
      "required": "Dieses Feld ist erforderlich",
      "email": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      "password": {
        "required": "Passwort ist erforderlich",
        "tooShort": "Das Passwort muss mindestens {min} Zeichen haben",
        "tooWeak": "Das Passwort muss Groß-, Kleinbuchstaben und Zahlen enthalten",
        "mismatch": "Die Passwörter stimmen nicht überein"
      },
      "maxLength": "Maximal {max} Zeichen erlaubt",
      "minLength": "Mindestens {min} Zeichen erforderlich",
      "invalidFormat": "Ungültiges Format",
      "invalidUrl": "Bitte geben Sie eine gültige URL ein",
      "invalidPhone": "Bitte geben Sie eine gültige Telefonnummer ein"
    },
    "api": {
      "generic": "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
      "notFound": "Die angeforderte Ressource wurde nicht gefunden",
      "unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzuführen",
      "forbidden": "Zugriff verweigert",
      "conflict": "Diese Ressource existiert bereits",
      "serverError": "Serverfehler. Bitte versuchen Sie es später erneut.",
      "timeout": "Zeitüberschreitung der Anfrage. Bitte versuchen Sie es erneut.",
      "badRequest": "Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingabe.",
      "tooManyRequests": "Zu viele Anfragen. Bitte warten Sie einen Moment."
    },
    "network": {
      "offline": "Sie scheinen offline zu sein. Überprüfen Sie Ihre Verbindung.",
      "connectionFailed": "Verbindung zum Server nicht möglich",
      "slowConnection": "Die Verbindung ist langsam. Dies kann einen Moment dauern."
    },
    "auth": {
      "invalidCredentials": "Ungültige E-Mail oder Passwort",
      "emailNotVerified": "Bitte bestätigen Sie Ihre E-Mail-Adresse",
      "sessionExpired": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      "accountLocked": "Das Konto wurde gesperrt. Kontaktieren Sie den Support.",
      "accessDenied": "Zugriff auf diese Ressource verweigert",
      "oauthFailed": "OAuth-Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      "oauthSessionExpired": "OAuth-Sitzung abgelaufen. Bitte melden Sie sich erneut an.",
      "emailMismatch": "Die E-Mail stimmt nicht mit der Zugriffsanfrage überein"
    },
    "item": {
      "notFound": "Element nicht gefunden",
      "createFailed": "Element konnte nicht erstellt werden",
      "updateFailed": "Element konnte nicht aktualisiert werden",
      "deleteFailed": "Element konnte nicht gelöscht werden",
      "duplicateName": "Ein Element mit diesem Namen existiert bereits"
    },
    "property": {
      "notFound": "Eigenschaft nicht gefunden",
      "createFailed": "Eigenschaft konnte nicht erstellt werden",
      "updateFailed": "Eigenschaft konnte nicht aktualisiert werden",
      "deleteFailed": "Eigenschaft konnte nicht gelöscht werden"
    },
    "file": {
      "tooLarge": "Dateigröße überschreitet das Limit von {max}MB",
      "invalidType": "Ungültiger Dateityp. Erlaubt: {types}",
      "uploadFailed": "Datei-Upload fehlgeschlagen. Bitte versuchen Sie es erneut."
    }
  }
}
```

#### 3.5 Update /messages/nl.json (Dutch)

```json
{
  "errors": {
    "form": {
      "required": "Dit veld is verplicht",
      "email": "Voer een geldig e-mailadres in",
      "password": {
        "required": "Wachtwoord is verplicht",
        "tooShort": "Wachtwoord moet minimaal {min} tekens bevatten",
        "tooWeak": "Wachtwoord moet hoofdletters, kleine letters en cijfers bevatten",
        "mismatch": "Wachtwoorden komen niet overeen"
      },
      "maxLength": "Maximaal {max} tekens toegestaan",
      "minLength": "Minimaal {min} tekens vereist",
      "invalidFormat": "Ongeldig formaat",
      "invalidUrl": "Voer een geldige URL in",
      "invalidPhone": "Voer een geldig telefoonnummer in"
    },
    "api": {
      "generic": "Er ging iets mis. Probeer het opnieuw.",
      "notFound": "De gevraagde bron is niet gevonden",
      "unauthorized": "U bent niet gemachtigd om deze actie uit te voeren",
      "forbidden": "Toegang geweigerd",
      "conflict": "Deze bron bestaat al",
      "serverError": "Serverfout. Probeer het later opnieuw.",
      "timeout": "Verzoek time-out. Probeer het opnieuw.",
      "badRequest": "Ongeldig verzoek. Controleer uw invoer.",
      "tooManyRequests": "Te veel verzoeken. Even geduld alstublieft."
    },
    "network": {
      "offline": "U lijkt offline te zijn. Controleer uw verbinding.",
      "connectionFailed": "Kan geen verbinding maken met de server",
      "slowConnection": "De verbinding is traag. Dit kan even duren."
    },
    "auth": {
      "invalidCredentials": "Ongeldige e-mail of wachtwoord",
      "emailNotVerified": "Verifieer uw e-mailadres",
      "sessionExpired": "Uw sessie is verlopen. Log opnieuw in.",
      "accountLocked": "Account is vergrendeld. Neem contact op met support.",
      "accessDenied": "Toegang tot deze bron geweigerd",
      "oauthFailed": "OAuth-authenticatie mislukt. Probeer het opnieuw.",
      "oauthSessionExpired": "OAuth-sessie verlopen. Log opnieuw in.",
      "emailMismatch": "E-mail komt niet overeen met de toegangsaanvraag"
    },
    "item": {
      "notFound": "Item niet gevonden",
      "createFailed": "Item aanmaken mislukt",
      "updateFailed": "Item bijwerken mislukt",
      "deleteFailed": "Item verwijderen mislukt",
      "duplicateName": "Er bestaat al een item met deze naam"
    },
    "property": {
      "notFound": "Eigendom niet gevonden",
      "createFailed": "Eigendom aanmaken mislukt",
      "updateFailed": "Eigendom bijwerken mislukt",
      "deleteFailed": "Eigendom verwijderen mislukt"
    },
    "file": {
      "tooLarge": "Bestandsgrootte overschrijdt limiet van {max}MB",
      "invalidType": "Ongeldig bestandstype. Toegestaan: {types}",
      "uploadFailed": "Bestand uploaden mislukt. Probeer het opnieuw."
    }
  }
}
```

#### 3.6 Update /messages/it.json (Italian)

```json
{
  "errors": {
    "form": {
      "required": "Questo campo è obbligatorio",
      "email": "Inserisci un indirizzo email valido",
      "password": {
        "required": "La password è obbligatoria",
        "tooShort": "La password deve contenere almeno {min} caratteri",
        "tooWeak": "La password deve includere maiuscole, minuscole e numeri",
        "mismatch": "Le password non corrispondono"
      },
      "maxLength": "Massimo {max} caratteri consentiti",
      "minLength": "Minimo {min} caratteri richiesti",
      "invalidFormat": "Formato non valido",
      "invalidUrl": "Inserisci un URL valido",
      "invalidPhone": "Inserisci un numero di telefono valido"
    },
    "api": {
      "generic": "Qualcosa è andato storto. Riprova.",
      "notFound": "La risorsa richiesta non è stata trovata",
      "unauthorized": "Non sei autorizzato a eseguire questa azione",
      "forbidden": "Accesso negato",
      "conflict": "Questa risorsa esiste già",
      "serverError": "Errore del server. Riprova più tardi.",
      "timeout": "Richiesta scaduta. Riprova.",
      "badRequest": "Richiesta non valida. Controlla i dati inseriti.",
      "tooManyRequests": "Troppe richieste. Attendi un momento."
    },
    "network": {
      "offline": "Sembra che tu sia offline. Controlla la connessione.",
      "connectionFailed": "Impossibile connettersi al server",
      "slowConnection": "La connessione è lenta. Potrebbe richiedere un momento."
    },
    "auth": {
      "invalidCredentials": "Email o password non validi",
      "emailNotVerified": "Verifica il tuo indirizzo email",
      "sessionExpired": "La sessione è scaduta. Accedi di nuovo.",
      "accountLocked": "L'account è stato bloccato. Contatta l'assistenza.",
      "accessDenied": "Accesso negato a questa risorsa",
      "oauthFailed": "Autenticazione OAuth fallita. Riprova.",
      "oauthSessionExpired": "Sessione OAuth scaduta. Accedi di nuovo.",
      "emailMismatch": "L'email non corrisponde alla richiesta di accesso"
    },
    "item": {
      "notFound": "Elemento non trovato",
      "createFailed": "Creazione elemento fallita",
      "updateFailed": "Aggiornamento elemento fallito",
      "deleteFailed": "Eliminazione elemento fallita",
      "duplicateName": "Esiste già un elemento con questo nome"
    },
    "property": {
      "notFound": "Proprietà non trovata",
      "createFailed": "Creazione proprietà fallita",
      "updateFailed": "Aggiornamento proprietà fallito",
      "deleteFailed": "Eliminazione proprietà fallita"
    },
    "file": {
      "tooLarge": "Il file supera il limite di {max}MB",
      "invalidType": "Tipo di file non valido. Consentiti: {types}",
      "uploadFailed": "Caricamento file fallito. Riprova."
    }
  }
}
```

#### Acceptance Criteria for Task 3
- [ ] `/messages/en.json` contains expanded errors namespace with all categories
- [ ] `/messages/fr.json` contains French translations for all error messages
- [ ] `/messages/es.json` contains Spanish translations for all error messages
- [ ] `/messages/de.json` contains German translations for all error messages
- [ ] `/messages/nl.json` contains Dutch translations for all error messages
- [ ] `/messages/it.json` contains Italian translations for all error messages
- [ ] All translation files have identical key structures
- [ ] All interpolation variables ({min}, {max}, {types}) are preserved
- [ ] Error messages maintain consistent tone across languages

---

### Task 4: Update Module Exports

**Files:** `/src/lib/i18n/index.ts`, `/src/types/index.ts` (MODIFY)
**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1, 2

#### 4.1 Update /src/lib/i18n/index.ts

Add exports for the new error utilities:

```typescript
// Error Translation exports (REQ-351)
export {
  ERROR_CODES,
  type ErrorCodeKey,
} from './error-codes';

export {
  useErrorTranslations,
  getErrorTranslations,
  mapHttpStatusToErrorKey,
  classifyErrorSeverity,
  parseSupabaseError,
  extractErrorFromException,
  formatApiErrorResponse,
  createLocalizedError,
  type ErrorSeverity,
  type LocalizedError,
  type ApiErrorResponse,
} from './error-translations';
```

#### 4.2 Update /src/types/index.ts

Add re-exports at the end of the file:

```typescript
// REQ-351: Error Translation Types
// Re-exported from @/lib/i18n for convenience
export type {
  ErrorSeverity,
  LocalizedError,
  ApiErrorResponse,
} from '@/lib/i18n';

export { ERROR_CODES, type ErrorCodeKey } from '@/lib/i18n';
```

#### Acceptance Criteria for Task 4
- [ ] `/src/lib/i18n/index.ts` exports all error utilities and types
- [ ] `/src/types/index.ts` re-exports error types for convenience
- [ ] All exports can be imported from `@/lib/i18n`
- [ ] All types can be imported from `@/types`

---

### Task 5: Write Unit Tests

**File:** `/src/lib/i18n/__tests__/error-translations.test.ts` (NEW)
**Estimated Effort:** 2 story points
**Dependencies:** Tasks 1, 2, 3

#### 5.1 Create test file structure

```typescript
/**
 * Unit Tests for Error Translation Utility
 * REQ-351: Create Centralized Error Message Utility
 *
 * @module lib/i18n/__tests__/error-translations.test
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mapHttpStatusToErrorKey,
  classifyErrorSeverity,
  parseSupabaseError,
  extractErrorFromException,
  formatApiErrorResponse,
  createLocalizedError,
} from '../error-translations';
import { ERROR_CODES } from '../error-codes';
```

#### 5.2 Test mapHttpStatusToErrorKey()

```typescript
describe('mapHttpStatusToErrorKey', () => {
  it('should map 400 to api.badRequest', () => {
    expect(mapHttpStatusToErrorKey(400)).toBe('api.badRequest');
  });

  it('should map 401 to api.unauthorized', () => {
    expect(mapHttpStatusToErrorKey(401)).toBe('api.unauthorized');
  });

  it('should map 403 to api.forbidden', () => {
    expect(mapHttpStatusToErrorKey(403)).toBe('api.forbidden');
  });

  it('should map 404 to api.notFound', () => {
    expect(mapHttpStatusToErrorKey(404)).toBe('api.notFound');
  });

  it('should map 409 to api.conflict', () => {
    expect(mapHttpStatusToErrorKey(409)).toBe('api.conflict');
  });

  it('should map 429 to api.tooManyRequests', () => {
    expect(mapHttpStatusToErrorKey(429)).toBe('api.tooManyRequests');
  });

  it('should map 500, 502, 503 to api.serverError', () => {
    expect(mapHttpStatusToErrorKey(500)).toBe('api.serverError');
    expect(mapHttpStatusToErrorKey(502)).toBe('api.serverError');
    expect(mapHttpStatusToErrorKey(503)).toBe('api.serverError');
  });

  it('should map 504 to api.timeout', () => {
    expect(mapHttpStatusToErrorKey(504)).toBe('api.timeout');
  });

  it('should return api.generic for unknown status codes', () => {
    expect(mapHttpStatusToErrorKey(418)).toBe('api.generic');
    expect(mapHttpStatusToErrorKey(999)).toBe('api.generic');
  });
});
```

#### 5.3 Test classifyErrorSeverity()

```typescript
describe('classifyErrorSeverity', () => {
  it('should return warning for network errors', () => {
    expect(classifyErrorSeverity('network.offline')).toBe('warning');
    expect(classifyErrorSeverity('network.connectionFailed')).toBe('warning');
    expect(classifyErrorSeverity('network.slowConnection')).toBe('warning');
  });

  it('should return warning for timeout errors', () => {
    expect(classifyErrorSeverity('api.timeout')).toBe('warning');
  });

  it('should return critical for server errors', () => {
    expect(classifyErrorSeverity('api.serverError')).toBe('critical');
  });

  it('should return error for other error types', () => {
    expect(classifyErrorSeverity('form.required')).toBe('error');
    expect(classifyErrorSeverity('auth.invalidCredentials')).toBe('error');
    expect(classifyErrorSeverity('api.notFound')).toBe('error');
  });
});
```

#### 5.4 Test parseSupabaseError()

```typescript
describe('parseSupabaseError', () => {
  it('should parse Supabase auth errors', () => {
    const error = { code: 'invalid_credentials', message: 'Invalid login' };
    expect(parseSupabaseError(error)).toEqual({
      code: 'auth.invalidCredentials',
      message: 'Invalid login',
    });
  });

  it('should parse email not confirmed error', () => {
    const error = { code: 'email_not_confirmed' };
    expect(parseSupabaseError(error)).toEqual({
      code: 'auth.emailNotVerified',
      message: undefined,
    });
  });

  it('should parse session expired error', () => {
    const error = { code: 'session_expired' };
    expect(parseSupabaseError(error)).toEqual({
      code: 'auth.sessionExpired',
      message: undefined,
    });
  });

  it('should parse user already exists error', () => {
    const error = { code: 'user_already_exists' };
    expect(parseSupabaseError(error)).toEqual({
      code: 'api.conflict',
      message: undefined,
    });
  });

  it('should handle Postgres unique violation', () => {
    const error = { code: '23505', message: 'duplicate key', details: 'Key exists' };
    expect(parseSupabaseError(error)).toEqual({
      code: 'api.conflict',
      message: 'duplicate key',
    });
  });

  it('should return api.generic for unknown errors', () => {
    expect(parseSupabaseError({ unknown: 'error' })).toEqual({ code: 'api.generic' });
    expect(parseSupabaseError(null)).toEqual({ code: 'api.generic' });
    expect(parseSupabaseError(undefined)).toEqual({ code: 'api.generic' });
  });
});
```

#### 5.5 Test extractErrorFromException()

```typescript
describe('extractErrorFromException', () => {
  it('should handle fetch TypeError', () => {
    const error = new TypeError('Failed to fetch');
    expect(extractErrorFromException(error)).toEqual({
      code: 'network.connectionFailed',
    });
  });

  it('should handle AbortError', () => {
    const error = new DOMException('Aborted', 'AbortError');
    expect(extractErrorFromException(error)).toEqual({
      code: 'api.timeout',
    });
  });

  it('should handle generic Error', () => {
    const error = new Error('Something went wrong');
    expect(extractErrorFromException(error)).toEqual({
      code: 'api.generic',
      message: 'Something went wrong',
    });
  });

  it('should handle string errors', () => {
    expect(extractErrorFromException('Network failure')).toEqual({
      code: 'network.connectionFailed',
    });
    expect(extractErrorFromException('Unknown error')).toEqual({
      code: 'api.generic',
      message: 'Unknown error',
    });
  });

  it('should delegate object errors to parseSupabaseError', () => {
    const error = { code: 'invalid_credentials' };
    expect(extractErrorFromException(error)).toEqual({
      code: 'auth.invalidCredentials',
      message: undefined,
    });
  });
});
```

#### 5.6 Test formatApiErrorResponse()

```typescript
describe('formatApiErrorResponse', () => {
  it('should create basic error response', () => {
    const result = formatApiErrorResponse('api.notFound', 'Resource not found');
    expect(result).toEqual({
      success: false,
      error: {
        code: 'api.notFound',
        message: 'Resource not found',
      },
    });
  });

  it('should include field when provided', () => {
    const result = formatApiErrorResponse('form.required', 'Field is required', {
      field: 'email',
    });
    expect(result.error.field).toBe('email');
  });

  it('should include details when provided', () => {
    const result = formatApiErrorResponse('api.badRequest', 'Invalid input', {
      details: { invalidFields: ['name', 'email'] },
    });
    expect(result.error.details).toEqual({ invalidFields: ['name', 'email'] });
  });

  it('should include additional errors array', () => {
    const result = formatApiErrorResponse('form.required', 'Validation failed', {
      additionalErrors: [
        { code: 'form.email', message: 'Invalid email', field: 'email' },
        { code: 'form.required', message: 'Required', field: 'name' },
      ],
    });
    expect(result.errors).toHaveLength(2);
  });
});
```

#### 5.7 Test createLocalizedError()

```typescript
describe('createLocalizedError', () => {
  it('should create localized error with auto severity', () => {
    const result = createLocalizedError('api.notFound', 'Not found');
    expect(result).toEqual({
      code: 'api.notFound',
      message: 'Not found',
      severity: 'error',
    });
  });

  it('should use warning severity for network errors', () => {
    const result = createLocalizedError('network.offline', 'You are offline');
    expect(result.severity).toBe('warning');
  });

  it('should include field when provided', () => {
    const result = createLocalizedError('form.required', 'Required', {
      field: 'username',
    });
    expect(result.field).toBe('username');
  });

  it('should include params when provided', () => {
    const result = createLocalizedError('form.minLength', 'Too short', {
      params: { min: 8 },
    });
    expect(result.params).toEqual({ min: 8 });
  });

  it('should allow severity override', () => {
    const result = createLocalizedError('api.notFound', 'Not found', {
      severity: 'critical',
    });
    expect(result.severity).toBe('critical');
  });
});
```

#### 5.8 Test ERROR_CODES constant

```typescript
describe('ERROR_CODES', () => {
  it('should have form error codes', () => {
    expect(ERROR_CODES.FORM.REQUIRED).toBe('form.required');
    expect(ERROR_CODES.FORM.EMAIL_INVALID).toBe('form.email');
    expect(ERROR_CODES.FORM.PASSWORD_TOO_SHORT).toBe('form.password.tooShort');
  });

  it('should have API error codes', () => {
    expect(ERROR_CODES.API.GENERIC).toBe('api.generic');
    expect(ERROR_CODES.API.NOT_FOUND).toBe('api.notFound');
    expect(ERROR_CODES.API.UNAUTHORIZED).toBe('api.unauthorized');
  });

  it('should have network error codes', () => {
    expect(ERROR_CODES.NETWORK.OFFLINE).toBe('network.offline');
    expect(ERROR_CODES.NETWORK.CONNECTION_FAILED).toBe('network.connectionFailed');
  });

  it('should have auth error codes', () => {
    expect(ERROR_CODES.AUTH.INVALID_CREDENTIALS).toBe('auth.invalidCredentials');
    expect(ERROR_CODES.AUTH.SESSION_EXPIRED).toBe('auth.sessionExpired');
  });

  it('should have item error codes', () => {
    expect(ERROR_CODES.ITEM.NOT_FOUND).toBe('item.notFound');
    expect(ERROR_CODES.ITEM.CREATE_FAILED).toBe('item.createFailed');
  });

  it('should have property error codes', () => {
    expect(ERROR_CODES.PROPERTY.NOT_FOUND).toBe('property.notFound');
  });

  it('should have file error codes', () => {
    expect(ERROR_CODES.FILE.TOO_LARGE).toBe('file.tooLarge');
    expect(ERROR_CODES.FILE.INVALID_TYPE).toBe('file.invalidType');
  });
});
```

#### Acceptance Criteria for Task 5
- [ ] Test file `/src/lib/i18n/__tests__/error-translations.test.ts` exists
- [ ] Tests cover `mapHttpStatusToErrorKey()` for all mapped status codes
- [ ] Tests cover `classifyErrorSeverity()` for all severity levels
- [ ] Tests cover `parseSupabaseError()` for auth and database errors
- [ ] Tests cover `extractErrorFromException()` for Error, string, and object inputs
- [ ] Tests cover `formatApiErrorResponse()` with all options
- [ ] Tests cover `createLocalizedError()` with all options
- [ ] Tests cover `ERROR_CODES` constant structure
- [ ] All tests pass with `npm run test`

---

### Task 6: Create Test Directory (if needed)

**File:** `/src/lib/i18n/__tests__/` (NEW directory if doesn't exist)
**Estimated Effort:** 0.5 story points
**Dependencies:** None

#### 6.1 Ensure __tests__ directory exists

Create the directory if it doesn't exist:
```bash
mkdir -p src/lib/i18n/__tests__
```

#### Acceptance Criteria for Task 6
- [ ] Directory `/src/lib/i18n/__tests__/` exists

---

## Implementation Order

Execute tasks in this order for optimal workflow:

1. **Task 6** - Create test directory (if needed)
2. **Task 1** - Create error code constants module
3. **Task 3** - Expand translation files (can run parallel with Task 1)
4. **Task 2** - Create main error translation utility
5. **Task 4** - Update module exports
6. **Task 5** - Write unit tests

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `/src/lib/i18n/error-codes.ts` | Error code constants and types |
| `/src/lib/i18n/error-translations.ts` | Main error translation utility |
| `/src/lib/i18n/__tests__/error-translations.test.ts` | Unit tests |

### Modified Files

| File | Changes |
|------|---------|
| `/src/lib/i18n/index.ts` | Add exports for error-codes and error-translations |
| `/src/types/index.ts` | Re-export error types |
| `/messages/en.json` | Expand errors namespace (~50 new keys) |
| `/messages/fr.json` | Add French error translations |
| `/messages/es.json` | Add Spanish error translations |
| `/messages/de.json` | Add German error translations |
| `/messages/nl.json` | Add Dutch error translations |
| `/messages/it.json` | Add Italian error translations |

---

## Verification Checklist

After implementation, verify:

- [ ] `npm run build` succeeds without errors
- [ ] `npm run test` passes all tests
- [ ] All error codes in `ERROR_CODES` have corresponding translations in all 6 languages
- [ ] `useErrorTranslations()` works in a client component
- [ ] `getErrorTranslations()` works in a server component/API route
- [ ] `mapHttpStatusToErrorKey()` correctly maps all documented HTTP status codes
- [ ] `parseSupabaseError()` correctly extracts Supabase error codes
- [ ] `extractErrorFromException()` handles Error objects, strings, and Supabase errors
- [ ] `formatApiErrorResponse()` creates valid API error response structures
- [ ] All exports are accessible from `@/lib/i18n`
- [ ] Error types are accessible from `@/types`

---

## Usage Examples

### Client Component Usage

```typescript
'use client';

import { useErrorTranslations, ERROR_CODES } from '@/lib/i18n';

function MyForm() {
  const { getError, getFieldError } = useErrorTranslations();

  const handleValidation = (values: FormValues) => {
    if (!values.email) {
      return { email: getError(ERROR_CODES.FORM.REQUIRED) };
    }
    if (!isValidEmail(values.email)) {
      return { email: getError(ERROR_CODES.FORM.EMAIL_INVALID) };
    }
    return null;
  };

  const handleApiError = (error: unknown) => {
    const { code } = extractErrorFromException(error);
    toast.error(getError(code));
  };

  // ...
}
```

### Server Component/API Route Usage

```typescript
import { NextResponse } from 'next/server';
import { getErrorTranslations, formatApiErrorResponse, ERROR_CODES } from '@/lib/i18n';

export async function GET(request: Request) {
  const { getError } = await getErrorTranslations();

  const item = await findItem(id);
  if (!item) {
    return NextResponse.json(
      formatApiErrorResponse(
        ERROR_CODES.ITEM.NOT_FOUND,
        getError(ERROR_CODES.ITEM.NOT_FOUND)
      ),
      { status: 404 }
    );
  }

  // ...
}
```

---

## References

- [REQ-351 Overview Document](./REQ-351-create-centralized-error-message-utility-overview.md)
- [REQ-351 in gen_requests_epic2.md](./gen_requests_epic2.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Existing error-utils.ts](/src/lib/error-utils.ts)
- [Existing types/index.ts](/src/types/index.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2J.4: Create Centralized Error Message Utility*
