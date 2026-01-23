/**
 * Language Detection Tests - Server-Side
 * Tests for guest language detection priority cascade.
 *
 * REQ-E04-022: Test Language Detection Scenarios
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 7, Task 7.1
 *
 * @module lib/i18n/__tests__/guest-language.test
 * @created 2026-01-23
 * @lastModified 2026-01-23
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
  detectGuestLanguage,
  GUEST_LANG_COOKIE_NAME,
} from '../guest-language';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Creates a mock NextRequest with specified options.
 * Allows easy setup of URL params, cookies, and headers.
 */
function createMockRequest(options: {
  url?: string;
  searchParams?: Record<string, string>;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}): NextRequest {
  const baseUrl = options.url || 'http://localhost:3000/item/test123';

  // Build URL with search params
  const url = new URL(baseUrl);
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const request = new NextRequest(url.toString());

  // Set cookies
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([name, value]) => {
      request.cookies.set(name, value);
    });
  }

  // Set headers - need to create new request with headers since headers are readonly
  if (options.headers) {
    const headers = new Headers();
    Object.entries(options.headers).forEach(([name, value]) => {
      headers.set(name, value);
    });
    // Create a new request with headers
    const requestWithHeaders = new NextRequest(url.toString(), {
      headers,
    });
    // Copy cookies
    if (options.cookies) {
      Object.entries(options.cookies).forEach(([name, value]) => {
        requestWithHeaders.cookies.set(name, value);
      });
    }
    return requestWithHeaders;
  }

  return request;
}

/**
 * Creates a mock Accept-Language header with specified languages and quality values.
 */
function createAcceptLanguageHeader(
  languages: Array<{ code: string; quality?: number }>
): string {
  return languages
    .map((lang) => {
      if (lang.quality !== undefined && lang.quality !== 1.0) {
        return `${lang.code};q=${lang.quality}`;
      }
      return lang.code;
    })
    .join(', ');
}

// =============================================================================
// URL Parameter Tests (Priority 1)
// =============================================================================

describe('URL Parameter Detection', () => {
  describe('Valid Language Codes', () => {
    it('accepts valid lowercase language codes', () => {
      const request = createMockRequest({});

      expect(detectGuestLanguage(request, 'en')).toBe('en');
      expect(detectGuestLanguage(request, 'fr')).toBe('fr');
      expect(detectGuestLanguage(request, 'es')).toBe('es');
      expect(detectGuestLanguage(request, 'de')).toBe('de');
      expect(detectGuestLanguage(request, 'nl')).toBe('nl');
      expect(detectGuestLanguage(request, 'it')).toBe('it');
    });

    it('normalizes uppercase to lowercase', () => {
      const request = createMockRequest({});

      expect(detectGuestLanguage(request, 'EN')).toBe('en');
      expect(detectGuestLanguage(request, 'FR')).toBe('fr');
      expect(detectGuestLanguage(request, 'Es')).toBe('es');
    });

    it('trims whitespace from URL parameter', () => {
      const request = createMockRequest({});

      expect(detectGuestLanguage(request, '  fr  ')).toBe('fr');
      expect(detectGuestLanguage(request, '\ten\n')).toBe('en');
    });
  });

  describe('Invalid Language Codes', () => {
    it('rejects unsupported language codes', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
      });

      const result = detectGuestLanguage(request, 'zh');
      expect(result).toBe('es'); // Falls through to cookie
    });

    it('rejects malicious input (XSS prevention)', () => {
      const request = createMockRequest({});

      const result1 = detectGuestLanguage(request, '<script>alert("xss")</script>');
      expect(result1).toBe('en'); // Falls to default

      const result2 = detectGuestLanguage(request, 'javascript:alert(1)');
      expect(result2).toBe('en');

      const result3 = detectGuestLanguage(request, '../../../etc/passwd');
      expect(result3).toBe('en');
    });

    it('handles undefined', () => {
      const request = createMockRequest({});

      expect(detectGuestLanguage(request, undefined)).toBe('en');
    });

    it('handles empty string', () => {
      const request = createMockRequest({});

      expect(detectGuestLanguage(request, '')).toBe('en');
    });
  });
});

describe('URL Parameter Priority', () => {
  it('URL parameter overrides cookie', () => {
    const request = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
    });

    const result = detectGuestLanguage(request, 'fr');
    expect(result).toBe('fr'); // URL wins
  });

  it('URL parameter overrides Accept-Language header', () => {
    const request = createMockRequest({
      headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
    });

    const result = detectGuestLanguage(request, 'fr');
    expect(result).toBe('fr'); // URL wins
  });

  it('URL parameter overrides both cookie and header', () => {
    const request = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
      headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
    });

    const result = detectGuestLanguage(request, 'fr');
    expect(result).toBe('fr'); // URL wins over all
  });

  it('falls through when URL parameter invalid', () => {
    const request = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
    });

    const result = detectGuestLanguage(request, 'invalid');
    expect(result).toBe('es'); // Falls to cookie
  });
});

// =============================================================================
// Cookie Tests (Priority 2)
// =============================================================================

describe('Cookie Detection', () => {
  describe('Cookie Reading', () => {
    it('reads valid language from cookie', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'fr' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('fr');
    });

    it('validates cookie value against supported locales', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'invalid' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('en'); // Falls to default
    });

    it('handles missing cookie gracefully', () => {
      const request = createMockRequest({});

      const result = detectGuestLanguage(request);
      expect(result).toBe('en'); // Falls to default
    });

    it('handles empty cookie value', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: '' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('en'); // Falls to default
    });

    it('accepts all supported languages from cookie', () => {
      const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'];

      for (const lang of languages) {
        const request = createMockRequest({
          cookies: { [GUEST_LANG_COOKIE_NAME]: lang },
        });

        expect(detectGuestLanguage(request)).toBe(lang);
      }
    });
  });

  describe('Cookie Priority', () => {
    it('cookie overrides Accept-Language header', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('es'); // Cookie wins
    });

    it('URL parameter overrides cookie', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
      });

      const result = detectGuestLanguage(request, 'fr');
      expect(result).toBe('fr'); // URL wins
    });

    it('falls through when cookie invalid', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'invalid' },
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('de'); // Falls to header
    });
  });
});

// =============================================================================
// Accept-Language Header Tests (Priority 3)
// =============================================================================

describe('Accept-Language Header Detection', () => {
  describe('Header Parsing', () => {
    it('detects language from simple header', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'fr-FR' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('fr');
    });

    it('parses header with quality values', () => {
      const request = createMockRequest({
        headers: {
          'Accept-Language': createAcceptLanguageHeader([
            { code: 'fr-FR', quality: 0.9 },
            { code: 'en', quality: 0.8 },
            { code: 'de', quality: 0.7 },
          ]),
        },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('fr'); // Highest quality
    });

    it('uses first supported language from header', () => {
      const request = createMockRequest({
        headers: {
          'Accept-Language': createAcceptLanguageHeader([
            { code: 'zh-CN' }, // Unsupported
            { code: 'ja', quality: 0.9 }, // Unsupported
            { code: 'fr', quality: 0.8 }, // Supported - selected
            { code: 'en', quality: 0.7 },
          ]),
        },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('fr');
    });

    it('extracts primary language from locale codes', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'fr-CA,fr-FR;q=0.9' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('fr'); // Extracts 'fr' from 'fr-CA'
    });

    it('handles malformed Accept-Language header', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': ';;;invalid;;;' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('en'); // Falls to default
    });

    it('handles empty Accept-Language header', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': '' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('en'); // Falls to default
    });

    it('handles missing Accept-Language header', () => {
      const request = createMockRequest({});

      const result = detectGuestLanguage(request);
      expect(result).toBe('en'); // Falls to default
    });
  });

  describe('Header Priority', () => {
    it('URL parameter overrides header', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = detectGuestLanguage(request, 'fr');
      expect(result).toBe('fr'); // URL wins
    });

    it('cookie overrides header', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('es'); // Cookie wins
    });

    it('header used when URL and cookie absent', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('de');
    });
  });

  describe('Specific Acceptance Criteria Tests', () => {
    it('Accept-Language "fr-FR,fr;q=0.9,en;q=0.8" detects French', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('fr');
    });

    it('Accept-Language with unsupported language falls back to English', () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('en');
    });
  });
});

// =============================================================================
// Default Fallback Tests (Priority 4)
// =============================================================================

describe('Default Fallback', () => {
  it('falls back to English when all sources absent', () => {
    const request = createMockRequest({});

    const result = detectGuestLanguage(request);
    expect(result).toBe('en');
  });

  it('falls back to English when all sources invalid', () => {
    const request = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'invalid' },
      headers: { 'Accept-Language': 'invalid-header' },
    });

    const result = detectGuestLanguage(request, 'invalid');
    expect(result).toBe('en');
  });

  it('falls back to English when browser language unsupported', () => {
    const request = createMockRequest({
      headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
    });

    const result = detectGuestLanguage(request);
    expect(result).toBe('en');
  });

  it('no preferences at all defaults to English', () => {
    const request = createMockRequest({});

    const result = detectGuestLanguage(request, undefined);
    expect(result).toBe('en');
  });
});

// =============================================================================
// Complete Priority Cascade Tests
// =============================================================================

describe('Complete Priority Cascade', () => {
  it('applies correct priority: URL > Cookie > Header > Default', () => {
    // Test Priority 1: URL wins over all
    const req1 = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'de' },
      headers: { 'Accept-Language': 'it-IT,it;q=0.9' },
    });
    expect(detectGuestLanguage(req1, 'fr')).toBe('fr');

    // Test Priority 2: Cookie wins over header and default
    const req2 = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'de' },
      headers: { 'Accept-Language': 'it-IT,it;q=0.9' },
    });
    expect(detectGuestLanguage(req2)).toBe('de');

    // Test Priority 3: Header wins over default
    const req3 = createMockRequest({
      headers: { 'Accept-Language': 'it-IT,it;q=0.9' },
    });
    expect(detectGuestLanguage(req3)).toBe('it');

    // Test Priority 4: Default when all absent
    const req4 = createMockRequest({});
    expect(detectGuestLanguage(req4)).toBe('en');
  });

  it('falls through invalid values at each priority level', () => {
    const request = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'invalid' },
      headers: { 'Accept-Language': 'es-ES,es;q=0.9' },
    });

    // Invalid URL and cookie, should use header
    const result = detectGuestLanguage(request, 'invalid');
    expect(result).toBe('es');
  });

  it('handles all four priority levels correctly', () => {
    // URL present: URL wins
    const req1 = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
      headers: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' },
    });
    expect(detectGuestLanguage(req1, 'fr')).toBe('fr');

    // No URL: Cookie wins
    const req2 = createMockRequest({
      cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
      headers: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' },
    });
    expect(detectGuestLanguage(req2)).toBe('es');

    // No URL or cookie: Header wins
    const req3 = createMockRequest({
      headers: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' },
    });
    expect(detectGuestLanguage(req3)).toBe('de');

    // No URL, cookie, or header: Default
    const req4 = createMockRequest({});
    expect(detectGuestLanguage(req4)).toBe('en');
  });

  describe('Specific Acceptance Criteria - Priority Tests', () => {
    it('Cookie overrides browser language', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
        headers: { 'Accept-Language': 'fr-FR' },
      });

      const result = detectGuestLanguage(request);
      expect(result).toBe('es'); // Cookie wins
    });

    it('URL parameter overrides cookie', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
      });

      const result = detectGuestLanguage(request, 'de');
      expect(result).toBe('de'); // URL wins
    });

    it('Invalid URL parameter falls back to next method', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANG_COOKIE_NAME]: 'es' },
      });

      const result = detectGuestLanguage(request, 'invalid');
      expect(result).toBe('es'); // Falls to cookie
    });
  });
});
