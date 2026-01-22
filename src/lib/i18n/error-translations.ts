// /src/lib/i18n/error-translations.ts
/**
 * Centralized Error Translation Utility
 * REQ-E02-035: Create Centralized Error Message Utility
 *
 * Provides a clean, consistent interface for retrieving translated error messages
 * throughout the application. Abstracts away direct interaction with next-intl
 * for error messages specifically.
 *
 * @example Client-side usage:
 * ```tsx
 * function MyComponent() {
 *   const errors = useErrorTranslations();
 *   return <span>{errors.getFormError('required')}</span>;
 * }
 * ```
 *
 * @example Server-side usage:
 * ```ts
 * async function handler() {
 *   const errors = await getErrorTranslations();
 *   return { error: errors.getApiError('notFound') };
 * }
 * ```
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
// Import types directly from errors module to avoid barrel export side effects
// (Supabase client initialization fails in test environments without env vars)
import type {
  ErrorCategory,
  FormErrorKey,
  AuthErrorKey,
  ApiErrorKey,
  NetworkErrorKey,
  ItemErrorKey,
  PropertyErrorKey,
  FileErrorKey,
  ErrorParams,
} from '@/types/errors';

/**
 * ErrorCode enum - duplicated here to avoid @/types barrel import
 * which initializes Supabase client (fails in tests without env vars).
 *
 * KEEP IN SYNC with @/types/index.ts ErrorCode enum.
 */
export enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USER_ALREADY_REGISTERED = 'USER_ALREADY_REGISTERED',
  INVALID_ACCESS_CODE = 'INVALID_ACCESS_CODE',
  EMAIL_MISMATCH = 'EMAIL_MISMATCH',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OAUTH_SESSION_EXPIRED = 'OAUTH_SESSION_EXPIRED',
  OAUTH_REGISTRATION_CONFLICT = 'OAUTH_REGISTRATION_CONFLICT',
  OAUTH_AUTHENTICATION_FAILED = 'OAUTH_AUTHENTICATION_FAILED',
}

// Re-export types for convenience
export type {
  ErrorCategory,
  FormErrorKey,
  AuthErrorKey,
  ApiErrorKey,
  NetworkErrorKey,
  ItemErrorKey,
  PropertyErrorKey,
  FileErrorKey,
  ErrorParams,
};

/**
 * Return type for error translation utilities
 */
export interface ErrorTranslationUtils {
  /** Get a form validation error message */
  getFormError: (key: FormErrorKey, params?: ErrorParams) => string;
  /** Get an authentication error message */
  getAuthError: (key: AuthErrorKey, params?: ErrorParams) => string;
  /** Get an API error message */
  getApiError: (key: ApiErrorKey, params?: ErrorParams) => string;
  /** Get a network error message */
  getNetworkError: (key: NetworkErrorKey, params?: ErrorParams) => string;
  /** Get an item-specific error message */
  getItemError: (key: ItemErrorKey, params?: ErrorParams) => string;
  /** Get a property-specific error message */
  getPropertyError: (key: PropertyErrorKey, params?: ErrorParams) => string;
  /** Get a file error message */
  getFileError: (key: FileErrorKey, params?: ErrorParams) => string;
  /** Get any error by full key path with fallback */
  getError: (key: string, params?: ErrorParams) => string;
  /** Get the generic fallback error message */
  getGenericError: () => string;
  /** Get error by HTTP status code */
  getHttpError: (statusCode: number, params?: ErrorParams) => string;
  /** Get error by ErrorCode enum value */
  getErrorByCode: (code: ErrorCode, params?: ErrorParams) => string;
}

/**
 * Type for the translation function returned by next-intl
 */
type TranslationFunction = ReturnType<typeof useTranslations>;

/**
 * Client-side hook for error translations.
 * Use this in React components that need to display error messages.
 *
 * @returns Object with typed error retrieval functions
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const errors = useErrorTranslations();
 *
 *   const handleError = (error: string) => {
 *     if (error.includes('credentials')) {
 *       return errors.getAuthError('invalidCredentials');
 *     }
 *     return errors.getGenericError();
 *   };
 * }
 * ```
 */
export function useErrorTranslations(): ErrorTranslationUtils {
  const t = useTranslations('errors');

  return createErrorUtils(t);
}

/**
 * Server-side function for error translations.
 * Use this in API routes, server components, and server actions.
 *
 * @returns Promise resolving to object with typed error retrieval functions
 *
 * @example
 * ```ts
 * // In an API route
 * export async function POST(request: Request) {
 *   const errors = await getErrorTranslations();
 *
 *   if (!isValid) {
 *     return Response.json(
 *       { error: errors.getFormError('required') },
 *       { status: 400 }
 *     );
 *   }
 * }
 * ```
 */
export async function getErrorTranslations(): Promise<ErrorTranslationUtils> {
  const t = await getTranslations('errors');

  return createErrorUtils(t);
}

/**
 * Creates error utility functions from a translation function.
 * Shared implementation for both client and server versions.
 */
function createErrorUtils(
  t: TranslationFunction
): ErrorTranslationUtils {
  /**
   * Safe translation with fallback to generic error
   */
  const safeTranslate = (key: string, params?: ErrorParams): string => {
    try {
      // Cast params to the expected type for next-intl
      return t(key as Parameters<typeof t>[0], params as Parameters<typeof t>[1]);
    } catch {
      // Fallback to generic error if key not found
      try {
        return t('generic' as Parameters<typeof t>[0]);
      } catch {
        // Ultimate fallback if even generic is missing
        return 'Something went wrong. Please try again.';
      }
    }
  };

  return {
    getFormError: (key: FormErrorKey, params?: ErrorParams) =>
      safeTranslate(`form.${key}`, params),

    getAuthError: (key: AuthErrorKey, params?: ErrorParams) =>
      safeTranslate(`auth.${key}`, params),

    getApiError: (key: ApiErrorKey, params?: ErrorParams) =>
      safeTranslate(`api.${key}`, params),

    getNetworkError: (key: NetworkErrorKey, params?: ErrorParams) =>
      safeTranslate(`network.${key}`, params),

    getItemError: (key: ItemErrorKey, params?: ErrorParams) =>
      safeTranslate(`item.${key}`, params),

    getPropertyError: (key: PropertyErrorKey, params?: ErrorParams) =>
      safeTranslate(`property.${key}`, params),

    getFileError: (key: FileErrorKey, params?: ErrorParams) =>
      safeTranslate(`file.${key}`, params),

    getError: (key: string, params?: ErrorParams) =>
      safeTranslate(key, params),

    getGenericError: () => safeTranslate('generic'),

    getHttpError: (statusCode: number, params?: ErrorParams) => {
      const key = getHttpErrorKey(statusCode);
      return safeTranslate(`api.${key}`, params);
    },

    getErrorByCode: (code: ErrorCode, params?: ErrorParams) => {
      const key = getErrorCodeKey(code);
      return safeTranslate(key, params);
    },
  };
}

/**
 * Maps HTTP status codes to API error keys.
 * Use this to translate HTTP errors to user-friendly messages.
 *
 * @param statusCode - HTTP status code (e.g., 404, 500)
 * @returns The corresponding API error key
 *
 * @example
 * ```ts
 * const key = getHttpErrorKey(404); // Returns 'notFound'
 * const message = errors.getApiError(key);
 * ```
 */
export function getHttpErrorKey(statusCode: number): ApiErrorKey {
  switch (statusCode) {
    case 400:
      return 'generic';
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'notFound';
    case 409:
      return 'conflict';
    case 429:
      return 'tooManyRequests';
    case 408:
    case 504:
      return 'timeout';
    case 500:
    case 502:
    case 503:
    default:
      return 'serverError';
  }
}

/**
 * Maps ErrorCode enum values to translation key paths.
 * Use this to bridge existing error handling with the translation system.
 *
 * @param code - ErrorCode enum value
 * @returns The corresponding translation key path
 *
 * @example
 * ```ts
 * const key = getErrorCodeKey(ErrorCode.INVALID_ACCESS_CODE);
 * // Returns 'auth.invalidAccessCode'
 * ```
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

/**
 * Determines the error category from an error code.
 * Useful for routing errors to appropriate handlers.
 *
 * @param code - ErrorCode enum value
 * @returns The error category
 */
export function getErrorCategory(code: ErrorCode): ErrorCategory {
  switch (code) {
    case ErrorCode.VALIDATION_FAILED:
      return 'form';
    case ErrorCode.USER_ALREADY_REGISTERED:
    case ErrorCode.INVALID_ACCESS_CODE:
    case ErrorCode.EMAIL_MISMATCH:
    case ErrorCode.OAUTH_SESSION_EXPIRED:
    case ErrorCode.OAUTH_REGISTRATION_CONFLICT:
    case ErrorCode.OAUTH_AUTHENTICATION_FAILED:
      return 'auth';
    case ErrorCode.NETWORK_ERROR:
      return 'network';
    default:
      return 'api';
  }
}
