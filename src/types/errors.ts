// /src/types/errors.ts
/**
 * Extended Error Type Definitions for Centralized Error Translation
 * REQ-E02-035: Create Centralized Error Message Utility
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { ErrorCode } from './index';

/**
 * Extended error codes for domain-specific errors
 * Complements the base ErrorCode enum from types/index.ts
 */
export enum ExtendedErrorCode {
  // Form validation
  FORM_REQUIRED = 'FORM_REQUIRED',
  FORM_INVALID_EMAIL = 'FORM_INVALID_EMAIL',
  FORM_PASSWORD_TOO_SHORT = 'FORM_PASSWORD_TOO_SHORT',
  FORM_PASSWORD_MISMATCH = 'FORM_PASSWORD_MISMATCH',
  FORM_MAX_LENGTH = 'FORM_MAX_LENGTH',
  FORM_MIN_LENGTH = 'FORM_MIN_LENGTH',
  FORM_INVALID_FORMAT = 'FORM_INVALID_FORMAT',
  FORM_INVALID_URL = 'FORM_INVALID_URL',
  FORM_INVALID_PHONE = 'FORM_INVALID_PHONE',

  // Item operations
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_CREATE_FAILED = 'ITEM_CREATE_FAILED',
  ITEM_UPDATE_FAILED = 'ITEM_UPDATE_FAILED',
  ITEM_DELETE_FAILED = 'ITEM_DELETE_FAILED',
  ITEM_DUPLICATE_NAME = 'ITEM_DUPLICATE_NAME',

  // Property operations
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  PROPERTY_CREATE_FAILED = 'PROPERTY_CREATE_FAILED',
  PROPERTY_UPDATE_FAILED = 'PROPERTY_UPDATE_FAILED',
  PROPERTY_DELETE_FAILED = 'PROPERTY_DELETE_FAILED',

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
 * Error categories matching the expanded errors namespace structure
 */
export type ErrorCategory =
  | 'form'      // Form validation errors
  | 'auth'      // Authentication errors
  | 'api'       // API/server errors
  | 'network'   // Network/connection errors
  | 'item'      // Item-specific errors
  | 'property'  // Property-specific errors
  | 'file';     // File upload errors

/**
 * Typed keys for form validation errors
 */
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

/**
 * Typed keys for authentication errors
 */
export type AuthErrorKey =
  | 'invalidCredentials'
  | 'emailNotVerified'
  | 'sessionExpired'
  | 'accountLocked'
  | 'accessDenied'
  | 'emailTaken'
  | 'emailMismatch'
  | 'invalidAccessCode'
  | 'accessCodeExpired';

/**
 * Typed keys for API errors
 */
export type ApiErrorKey =
  | 'generic'
  | 'notFound'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'serverError'
  | 'timeout'
  | 'tooManyRequests';

/**
 * Typed keys for network errors
 */
export type NetworkErrorKey =
  | 'offline'
  | 'connectionFailed'
  | 'slowConnection';

/**
 * Typed keys for item-specific errors
 */
export type ItemErrorKey =
  | 'notFound'
  | 'createFailed'
  | 'updateFailed'
  | 'deleteFailed'
  | 'duplicateName';

/**
 * Typed keys for property-specific errors
 */
export type PropertyErrorKey =
  | 'notFound'
  | 'createFailed'
  | 'updateFailed'
  | 'deleteFailed';

/**
 * Typed keys for file errors
 */
export type FileErrorKey =
  | 'tooLarge'
  | 'invalidType'
  | 'uploadFailed';

/**
 * Interpolation parameters for error messages
 * Supports dynamic values like field names, limits, etc.
 */
export type ErrorParams = Record<string, string | number>;

/**
 * Translated error result with full context
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
  /** Original error for debugging (dev only) */
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
