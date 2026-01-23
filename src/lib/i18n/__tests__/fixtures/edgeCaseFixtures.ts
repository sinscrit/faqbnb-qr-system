/**
 * @fileoverview Edge Case Test Fixtures
 *
 * Provides reusable test data for edge case testing of the guest language
 * detection and translation system. Includes malformed inputs, security
 * test vectors, and unusual but valid scenarios.
 *
 * @module tests/fixtures/edgeCaseFixtures
 * @see REQ-E04-024 - Test edge cases
 * @created 2026-01-23
 * @modified 2026-01-23
 */

import { NextRequest } from 'next/server';
import { vi } from 'vitest';

// =============================================================================
// Malformed Accept-Language Headers
// =============================================================================

/**
 * Array of malformed Accept-Language header strings for testing parsing robustness.
 * Includes empty values, invalid syntax, security test vectors, and edge cases.
 */
export const malformedAcceptLanguageHeaders: string[] = [
  // Empty and null-like values
  '',
  '   ',
  '\t\n',

  // Invalid syntax
  'invalid',
  ';;;',
  ',,,',
  '***',
  'en;',
  ';en',
  'en;;fr',

  // Invalid quality values
  'fr-FR;q=invalid',
  'en;q=2.0',
  'en;q=-0.5',
  'fr;q=NaN',
  'en;q=Infinity',
  'de;q=abc',
  'es;q=1.0.0',

  // Security test vectors - XSS attempts
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',

  // Security test vectors - Path traversal
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32',

  // Security test vectors - SQL injection
  "'; DROP TABLE users; --",
  "1' OR '1'='1",

  // Very long string (potential DoS)
  'en-US,'.repeat(1000) + 'en',
  'A'.repeat(10000),

  // Note: Unicode and control character tests excluded because NextRequest
  // cannot set headers with non-ASCII or control characters. These edge cases
  // would be handled by the parseAcceptLanguage function directly.
  // Excluded: 'en\u0000fr', 'en\u0001\u0002\u0003', '日本語', '🇫🇷'
];

// =============================================================================
// Invalid Language Codes
// =============================================================================

/**
 * Array of invalid language codes for testing validator robustness.
 * These should all be rejected by the validator.
 */
export const invalidLanguageCodes: string[] = [
  // Completely invalid
  'invalid',
  'xx',
  'zz',
  '123',
  '',
  '   ',

  // Special characters
  '<script>',
  'javascript:alert(1)',
  "'; DROP TABLE users; --",
  '../../../etc/passwd',

  // Too long or too short
  'a',
  'aaaaaaaaaaa',

  // Numbers and symbols
  '12',
  '!@#',
  'en!',
  'en@fr',

  // Null bytes and control characters
  'en\0malicious',
  'en\x00fr',
  '\u0000',
  '\u0001',

  // Unicode exploits
  'en\u0000\u0001\u0002',
  '\uFFFE',
  '\uFFFF',
];

// =============================================================================
// Unsupported Language Codes
// =============================================================================

/**
 * Array of valid ISO 639-1 language codes that are NOT supported by our system.
 * These should be rejected even though they are technically valid codes.
 */
export const unsupportedLanguageCodes: string[] = [
  'zh', // Chinese
  'ja', // Japanese
  'ar', // Arabic
  'ko', // Korean
  'pt', // Portuguese
  'ru', // Russian
  'hi', // Hindi
  'bn', // Bengali
  'vi', // Vietnamese
  'tr', // Turkish
  'pl', // Polish
  'uk', // Ukrainian
  'th', // Thai
  'sv', // Swedish
  'fi', // Finnish
];

// =============================================================================
// Partially Translated Content
// =============================================================================

/**
 * Object containing various partially translated content scenarios.
 * Tests how the system handles incomplete translations.
 */
export const partiallyTranslatedContent = {
  /**
   * Item with only the title translated (description remains original)
   */
  onlyTitle: {
    name: 'Guide Wifi', // Translated to French
    description: 'Instructions for connecting to wifi', // Original English
  },

  /**
   * Item with only the description translated (title remains original)
   */
  onlyDescription: {
    name: 'Wifi Guide', // Original English
    description: 'Instructions pour se connecter au wifi', // Translated to French
  },

  /**
   * Array of links with mixed translation states
   */
  mixedLinks: [
    {
      id: 'link-001',
      title: 'Page de connexion routeur', // Translated
      originalTitle: 'Router login page',
      linkType: 'text' as const,
      url: 'https://192.168.1.1',
      displayOrder: 0,
    },
    {
      id: 'link-002',
      title: 'Support documentation', // NOT translated (same as original)
      originalTitle: 'Support documentation',
      linkType: 'text' as const,
      url: 'https://example.com/support',
      displayOrder: 1,
    },
    {
      id: 'link-003',
      title: 'Video tutorial', // NOT translated
      originalTitle: 'Video tutorial',
      linkType: 'youtube' as const,
      url: 'https://youtube.com/watch?v=abc123',
      displayOrder: 2,
    },
  ],

  /**
   * Array of articles with mixed translation states
   */
  mixedArticles: [
    {
      id: 'article-001',
      purpose: 'how-to-use',
      title: 'Comment se connecter', // Translated
      originalTitle: 'How to connect',
      description: 'Étape 1: Ouvrez les paramètres', // Translated
      originalDescription: 'Step 1: Open settings',
      displayOrder: 0,
      links: [],
    },
    {
      id: 'article-002',
      purpose: 'troubleshooting',
      title: 'Troubleshooting', // NOT translated
      originalTitle: 'Troubleshooting',
      description: 'If you have issues, try these steps', // NOT translated
      originalDescription: 'If you have issues, try these steps',
      displayOrder: 1,
      links: [],
    },
  ],
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Options for creating a request without cookies
 */
export interface RequestWithoutCookiesOptions {
  /** URL for the request */
  url?: string;
  /** Headers to include (Accept-Language, etc.) */
  headers?: Record<string, string>;
}

/**
 * Creates a NextRequest instance that simulates cookies being blocked.
 * Useful for testing cookie-blocked scenarios (privacy mode, ad blockers).
 *
 * @param options - Options for the request
 * @returns NextRequest with mocked cookies.get returning undefined
 *
 * @example
 * ```ts
 * const request = createRequestWithoutCookies({
 *   url: 'http://localhost:3000/item/test',
 *   headers: { 'Accept-Language': 'fr-FR,fr;q=0.9' }
 * });
 * const lang = await detectGuestLanguage(null, request);
 * // lang will be 'fr' (from header since cookie unavailable)
 * ```
 */
export function createRequestWithoutCookies(
  options: RequestWithoutCookiesOptions = {}
): NextRequest {
  const {
    url = 'http://localhost:3000/item/test',
    headers = {},
  } = options;

  const request = new NextRequest(url, { headers });

  // Mock cookies.get to return undefined (simulating blocked cookies)
  const mockCookiesGet = vi.fn(() => undefined);
  Object.defineProperty(request.cookies, 'get', {
    value: mockCookiesGet,
    writable: true,
    configurable: true,
  });

  return request;
}

/**
 * Creates a basic item object for testing with minimal required fields.
 *
 * @param overrides - Optional overrides for item fields
 * @returns Item object suitable for ItemDisplay component
 */
export function createEdgeCaseItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-item-001',
    publicId: 'test-public-001',
    name: 'Test Item',
    description: 'Test description',
    qrCodeUrl: 'https://example.com/qr.png',
    links: [],
    articles: [],
    ...overrides,
  };
}

/**
 * Creates translation metadata for testing
 *
 * @param overrides - Optional overrides for metadata fields
 * @returns Translation metadata object
 */
export function createEdgeCaseTranslationMeta(overrides: Record<string, unknown> = {}) {
  return {
    isTranslated: true,
    requestedLanguage: 'fr',
    displayLanguage: 'fr',
    originalLanguage: 'en',
    availableLanguages: ['en', 'fr', 'es', 'de', 'nl', 'it'],
    ...overrides,
  };
}
