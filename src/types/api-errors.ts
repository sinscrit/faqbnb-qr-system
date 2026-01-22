// /src/types/api-errors.ts
// Created: 2026-01-21

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
