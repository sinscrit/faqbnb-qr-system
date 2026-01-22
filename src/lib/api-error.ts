// /src/lib/api-error.ts
// Created: 2026-01-21
// REQ-E02-034: Centralized API Error Response Utility

import { getTranslations } from 'next-intl/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  ApiErrorCode,
  StandardErrorResponse,
  ErrorCodeStatusMap,
  ErrorCodeTranslationKeyMap,
  ErrorDetails,
} from '@/types/api-errors';

/**
 * Supported languages for error message translation
 */
const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LOCALES[number];

/**
 * Parse Accept-Language header to extract preferred languages
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map(lang => {
      const [code, q] = lang.trim().split(';q=');
      return { code: code.split('-')[0], priority: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.code);
}

/**
 * Extract locale from request headers, cookies, or default
 */
function getLocaleFromRequest(request: NextRequest): SupportedLanguage {
  // Check custom header first (for frontend requests)
  const headerLocale = request.headers.get('x-locale');
  if (headerLocale && SUPPORTED_LOCALES.includes(headerLocale as SupportedLanguage)) {
    return headerLocale as SupportedLanguage;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const parsed = parseAcceptLanguage(acceptLanguage);
    for (const lang of parsed) {
      if (SUPPORTED_LOCALES.includes(lang as SupportedLanguage)) {
        return lang as SupportedLanguage;
      }
    }
  }

  // Check cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as SupportedLanguage)) {
    return cookieLocale as SupportedLanguage;
  }

  return 'en';
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status: number = ErrorCodeStatusMap[code],
    public details?: ErrorDetails,
    public field?: string
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

/**
 * Create a standardized, translated error response
 */
export async function createErrorResponse(
  request: NextRequest,
  code: ApiErrorCode,
  options?: {
    status?: number;
    details?: ErrorDetails;
    field?: string;
    params?: Record<string, string | number>;
  }
): Promise<NextResponse<StandardErrorResponse>> {
  const locale = getLocaleFromRequest(request);

  try {
    const t = await getTranslations({ locale, namespace: 'errors' });

    const translationKey = ErrorCodeTranslationKeyMap[code];
    const message = options?.params
      ? t(translationKey, options.params)
      : t(translationKey);

    const status = options?.status ?? ErrorCodeStatusMap[code];

    const responseBody: StandardErrorResponse = {
      success: false,
      error: message,
      code,
      ...(options?.details && { details: options.details }),
      ...(options?.field && { field: options.field }),
    };

    return NextResponse.json(responseBody, { status });
  } catch (translationError) {
    // Fallback if translation fails
    console.error('Translation error in createErrorResponse:', translationError);
    return createStaticErrorResponse(
      code,
      `Error: ${code}`,
      { status: options?.status, details: options?.details, field: options?.field }
    );
  }
}

/**
 * Create error response without translation (for non-request contexts)
 */
export function createStaticErrorResponse(
  code: ApiErrorCode,
  message: string,
  options?: {
    status?: number;
    details?: ErrorDetails;
    field?: string;
  }
): NextResponse<StandardErrorResponse> {
  const status = options?.status ?? ErrorCodeStatusMap[code];

  const responseBody: StandardErrorResponse = {
    success: false,
    error: message,
    code,
    ...(options?.details && { details: options.details }),
    ...(options?.field && { field: options.field }),
  };

  return NextResponse.json(responseBody, { status });
}

/**
 * Helper to create common error responses
 */
export const ApiErrors = {
  unauthorized: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.UNAUTHORIZED),

  sessionExpired: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.SESSION_EXPIRED),

  invalidCredentials: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.INVALID_CREDENTIALS),

  forbidden: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.FORBIDDEN),

  accessDenied: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.ACCESS_DENIED),

  notFound: (request: NextRequest, resource?: string) =>
    createErrorResponse(request, ApiErrorCode.NOT_FOUND, {
      params: resource ? { resource } : undefined,
    }),

  badRequest: (request: NextRequest, details?: ErrorDetails) =>
    createErrorResponse(request, ApiErrorCode.INVALID_INPUT, { details }),

  validationFailed: (request: NextRequest, details?: ErrorDetails) =>
    createErrorResponse(request, ApiErrorCode.VALIDATION_FAILED, { details }),

  missingRequiredField: (request: NextRequest, field: string) =>
    createErrorResponse(request, ApiErrorCode.MISSING_REQUIRED_FIELD, { field }),

  conflict: (request: NextRequest, details?: string) =>
    createErrorResponse(request, ApiErrorCode.CONFLICT, { details }),

  alreadyExists: (request: NextRequest, resource?: string) =>
    createErrorResponse(request, ApiErrorCode.ALREADY_EXISTS, {
      params: resource ? { resource } : undefined,
    }),

  serverError: (request: NextRequest, details?: string) =>
    createErrorResponse(request, ApiErrorCode.INTERNAL_ERROR, { details }),

  serviceUnavailable: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.SERVICE_UNAVAILABLE),

  timeout: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.TIMEOUT),

  rateLimited: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.RATE_LIMITED),

  methodNotAllowed: (request: NextRequest) =>
    createErrorResponse(request, ApiErrorCode.METHOD_NOT_ALLOWED),

  fileTooLarge: (request: NextRequest, maxSize?: string) =>
    createErrorResponse(request, ApiErrorCode.FILE_TOO_LARGE, {
      params: maxSize ? { maxSize } : undefined,
    }),

  invalidFileType: (request: NextRequest, allowedTypes?: string) =>
    createErrorResponse(request, ApiErrorCode.INVALID_FILE_TYPE, {
      params: allowedTypes ? { allowedTypes } : undefined,
    }),

  uploadFailed: (request: NextRequest, details?: string) =>
    createErrorResponse(request, ApiErrorCode.UPLOAD_FAILED, { details }),
};

/**
 * Utility to wrap async route handlers with error handling
 */
export function withErrorHandling<T>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return createErrorResponse(request, error.code, {
          status: error.status,
          details: error.details,
          field: error.field,
        });
      }

      console.error('Unhandled API error:', error);
      return ApiErrors.serverError(request,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}
