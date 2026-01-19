/**
 * Test Helpers for Translation Service Tests
 *
 * Shared mock factories and utilities for translation service unit tests.
 *
 * @module translation-service/__tests__/test-helpers
 * @created 2026-01-18 (REQ-253)
 * @lastModified 2026-01-18 (REQ-253)
 */

import type {
  TranslationRequest,
  TranslationResponse,
  TranslationContext,
  SupportedLanguage,
  BatchTranslationRequest,
  BatchTranslationResponse,
  RateLimitStatus,
} from '../translation-service.types';

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Create a mock TranslationRequest for testing.
 */
export function createMockTranslationRequest(
  overrides: Partial<TranslationRequest> = {}
): TranslationRequest {
  return {
    text: 'Hello world',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    ...overrides,
  };
}

/**
 * Create a mock TranslationResponse for testing.
 */
export function createMockTranslationResponse(
  overrides: Partial<TranslationResponse> = {}
): TranslationResponse {
  return {
    translatedText: 'Bonjour le monde',
    provider: 'claude',
    confidence: 0.95,
    tokensUsed: 25,
    ...overrides,
  };
}

/**
 * Create a mock TranslationContext for testing.
 */
export function createMockTranslationContext(
  overrides: Partial<TranslationContext> = {}
): TranslationContext {
  return {
    contentType: 'item_name',
    domainContext: 'household appliance in rental property',
    maxLength: 255,
    ...overrides,
  };
}

/**
 * Create a mock BatchTranslationRequest for testing.
 */
export function createMockBatchTranslationRequest(
  overrides: Partial<BatchTranslationRequest> = {}
): BatchTranslationRequest {
  return {
    text: 'Hello world',
    sourceLanguage: 'en',
    targetLanguages: ['fr', 'es', 'de', 'nl', 'it'],
    ...overrides,
  };
}

/**
 * Create a mock BatchTranslationResponse for testing.
 */
export function createMockBatchTranslationResponse(
  overrides: Partial<BatchTranslationResponse> = {}
): BatchTranslationResponse {
  return {
    translations: {
      fr: 'Bonjour le monde',
      es: 'Hola mundo',
      de: 'Hallo Welt',
      nl: 'Hallo wereld',
      it: 'Ciao mondo',
    },
    provider: 'claude',
    totalTokensUsed: 125,
    totalDurationMs: 1500,
    ...overrides,
  };
}

/**
 * Create a mock RateLimitStatus for testing.
 */
export function createMockRateLimitStatus(
  overrides: Partial<RateLimitStatus> = {}
): RateLimitStatus {
  return {
    remaining: 60,
    limit: 60,
    resetInSeconds: 0,
    isLimited: false,
    ...overrides,
  };
}

// =============================================================================
// API Response Helpers
// =============================================================================

/**
 * Create a mock successful fetch Response.
 */
export function createMockApiResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as Response;
}

/**
 * Create a mock error Response.
 */
export function createMockErrorResponse(
  status: number,
  message: string
): Response {
  return {
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: { message } }),
    text: () => Promise.resolve(JSON.stringify({ error: { message } })),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as Response;
}

// =============================================================================
// Error Helpers
// =============================================================================

/**
 * Create a mock error for testing error scenarios.
 */
export function createMockError(
  message: string,
  code?: string
): Error & { code?: string } {
  const error = new Error(message) as Error & { code?: string };
  if (code) {
    error.code = code;
  }
  return error;
}

/**
 * Create a mock HTTP error with status code.
 */
export function createMockHttpError(
  message: string,
  status: number
): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

// =============================================================================
// Supported Languages List
// =============================================================================

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'en', 'fr', 'es', 'de', 'nl', 'it'
];

export const LANGUAGE_PAIRS: Array<{ source: SupportedLanguage; target: SupportedLanguage }> = [
  { source: 'en', target: 'fr' },
  { source: 'en', target: 'es' },
  { source: 'en', target: 'de' },
  { source: 'en', target: 'nl' },
  { source: 'en', target: 'it' },
  { source: 'fr', target: 'en' },
];

// =============================================================================
// Test Constants
// =============================================================================

export const TEST_TRANSLATION_TEXTS = {
  short: 'Hello',
  medium: 'Welcome to our vacation rental property',
  long: 'Please make sure to turn off all lights and appliances before leaving the property. The checkout time is 11:00 AM.',
};

export const TEST_CONTENT_TYPES: TranslationContext['contentType'][] = [
  'item_name',
  'item_description',
  'article_title',
  'article_description',
  'link_title',
  'tag',
];
