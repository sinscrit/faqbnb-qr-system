# REQ-357: Test Language Detection Priority Scenarios - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Testing & Polish
**Task ID:** 7.1
**Overview Document:** REQ-357-test-language-detection-scenarios-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## Executive Summary

This document provides granular, actionable tasks for implementing REQ-357 - testing the language detection priority chain. The implementation validates that URL parameters, cookies, browser Accept-Language headers, and fallback mechanisms work correctly according to the defined priority order.

### Priority Order Under Test:
1. **URL Parameter** (`?lang=de`) - Highest priority, enables shareable links
2. **Cookie Preference** (`FAQBNB_LANG`) - Persists user choice across sessions
3. **Browser Accept-Language Header** - Automatic detection from browser settings
4. **Fallback to Original Content** - Default when no preference available

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation complete (i18n infrastructure exists)
- [ ] `/src/lib/i18n/config.ts` exists with `SUPPORTED_LOCALES`, `isSupportedLocale()`
- [ ] `/src/lib/i18n/language-detection.ts` exists with `detectUserLanguage()`
- [ ] Vitest configured in the project (`vitest.config.ts` exists)
- [ ] REQ-356 (middleware language detection) is complete or in progress

---

## Task Breakdown

### TASK 1: Export parseAcceptLanguageHeader Function

**File:** `/src/lib/i18n/language-detection.ts`
**Lines Affected:** ~85-122 (function definition), ~1-27 (exports)
**Estimated Effort:** 1 story point
**Dependencies:** None

#### Description
The `parseAcceptLanguageHeader` function is currently private (not exported). Export it so it can be tested in isolation and reused in guest language utilities.

#### Implementation Steps

**Step 1.1:** Locate the `parseAcceptLanguageHeader` function at line 85

```typescript
// Current (private function)
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[]
```

**Step 1.2:** Change from private function to exported function

```typescript
// Changed to exported function
export function parseAcceptLanguageHeader(acceptLanguage: string | null): string[]
```

**Step 1.3:** Update the module's barrel export in `/src/lib/i18n/index.ts`

Add to the exports:
```typescript
export { parseAcceptLanguageHeader } from './language-detection';
```

#### Verification
- [ ] `parseAcceptLanguageHeader` is exported from `language-detection.ts`
- [ ] Function is re-exported from `index.ts`
- [ ] TypeScript compilation succeeds
- [ ] No runtime errors on `npm run build`

---

### TASK 2: Create Mock Request Helper

**File:** `/src/lib/i18n/__tests__/helpers/mockRequest.ts` (NEW)
**Estimated Effort:** 2 story points
**Dependencies:** Task 1

#### Description
Create a reusable mock NextRequest factory for testing language detection functions. This helper simulates different combinations of cookies and Accept-Language headers.

#### Implementation Steps

**Step 2.1:** Create directory structure

```bash
mkdir -p src/lib/i18n/__tests__/helpers
```

**Step 2.2:** Create the mock request helper file

```typescript
/**
 * Mock Request Helper for Language Detection Tests
 *
 * REQ-357: Test Language Detection Priority Scenarios
 * Provides utilities for creating mock NextRequest objects with
 * configurable cookies and headers for testing.
 *
 * @module lib/i18n/__tests__/helpers/mockRequest
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME } from '../../config';

/**
 * Options for creating a mock NextRequest
 */
export interface MockRequestOptions {
  /** Language code to set in FAQBNB_LANG cookie */
  cookie?: string;
  /** Accept-Language header value */
  acceptLanguage?: string;
  /** URL for the request (defaults to https://faqbnb.com/item/test-id) */
  url?: string;
  /** URL query parameters */
  searchParams?: Record<string, string>;
}

/**
 * Creates a mock NextRequest object for testing language detection.
 *
 * @param options - Configuration options for the mock request
 * @returns A NextRequest object with the specified configuration
 *
 * @example
 * // Request with German cookie and French Accept-Language
 * const request = createMockRequest({
 *   cookie: 'de',
 *   acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.8'
 * });
 *
 * @example
 * // Request with URL parameter
 * const request = createMockRequest({
 *   searchParams: { lang: 'es' }
 * });
 */
export function createMockRequest(options: MockRequestOptions = {}): NextRequest {
  const baseUrl = options.url || 'https://faqbnb.com/item/test-id';

  // Build URL with search params if provided
  const url = new URL(baseUrl);
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  // Create headers
  const headers = new Headers();
  if (options.acceptLanguage) {
    headers.set('Accept-Language', options.acceptLanguage);
  }

  // Create the request
  const request = new NextRequest(url.toString(), { headers });

  // Mock the cookies if needed
  if (options.cookie !== undefined) {
    // Use Object.defineProperty to mock the cookies getter
    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) => {
          if (name === LOCALE_COOKIE_NAME && options.cookie) {
            return { value: options.cookie };
          }
          return undefined;
        },
        has: (name: string) => {
          return name === LOCALE_COOKIE_NAME && !!options.cookie;
        },
        getAll: () => {
          if (options.cookie) {
            return [{ name: LOCALE_COOKIE_NAME, value: options.cookie }];
          }
          return [];
        },
      },
      writable: false,
    });
  }

  return request;
}

/**
 * Creates a mock request with no language preferences set.
 * Useful for testing the default fallback behavior.
 */
export function createEmptyMockRequest(): NextRequest {
  return createMockRequest({});
}

/**
 * Creates a mock request that simulates a specific Accept-Language header scenario.
 *
 * @param scenario - Predefined scenario name
 * @returns Mock request configured for that scenario
 */
export function createMockRequestForScenario(
  scenario:
    | 'french_browser'
    | 'german_browser'
    | 'spanish_browser'
    | 'unsupported_browser'
    | 'multi_language'
    | 'malformed_header'
): NextRequest {
  const scenarios: Record<string, MockRequestOptions> = {
    french_browser: { acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.8' },
    german_browser: { acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8' },
    spanish_browser: { acceptLanguage: 'es-ES,es;q=0.9' },
    unsupported_browser: { acceptLanguage: 'zh-CN,ja;q=0.9' },
    multi_language: { acceptLanguage: 'fr-FR,es;q=0.9,de;q=0.8,en;q=0.7' },
    malformed_header: { acceptLanguage: ';;;invalid;;;' },
  };

  return createMockRequest(scenarios[scenario]);
}
```

#### Verification
- [ ] File created at correct path
- [ ] TypeScript types are correct (no type errors)
- [ ] All functions are exported
- [ ] Helper works with NextRequest type

---

### TASK 3: Create Unit Tests for parseAcceptLanguageHeader

**File:** `/src/lib/i18n/__tests__/language-detection.test.ts` (NEW)
**Estimated Effort:** 3 story points
**Dependencies:** Tasks 1, 2

#### Description
Create comprehensive unit tests for the `parseAcceptLanguageHeader` function covering valid inputs, edge cases, and malformed headers.

#### Implementation Steps

**Step 3.1:** Create the test file

```typescript
/**
 * Unit Tests for Language Detection Module
 *
 * REQ-357: Test Language Detection Priority Scenarios
 * Tests the parseAcceptLanguageHeader function and language
 * detection priority cascade.
 *
 * @module lib/i18n/__tests__/language-detection.test
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseAcceptLanguageHeader,
  detectUserLanguage,
} from '../language-detection';
import { createMockRequest, createEmptyMockRequest } from './helpers/mockRequest';

describe('parseAcceptLanguageHeader', () => {
  describe('valid headers', () => {
    it('should parse simple language code', () => {
      const result = parseAcceptLanguageHeader('en');
      expect(result).toEqual(['en']);
    });

    it('should parse language with region and extract primary code', () => {
      const result = parseAcceptLanguageHeader('en-US');
      expect(result).toEqual(['en']);
    });

    it('should parse multiple languages without quality values', () => {
      const result = parseAcceptLanguageHeader('fr, en, de');
      expect(result).toEqual(['fr', 'en', 'de']);
    });

    it('should parse multiple languages with quality values', () => {
      const result = parseAcceptLanguageHeader('fr-FR,fr;q=0.9,en;q=0.8,de;q=0.7');
      expect(result).toEqual(['fr', 'en', 'de']);
    });

    it('should sort by quality value descending', () => {
      const result = parseAcceptLanguageHeader('en;q=0.5,fr;q=0.9,de;q=0.7');
      expect(result).toEqual(['fr', 'de', 'en']);
    });

    it('should handle quality values with different precisions', () => {
      const result = parseAcceptLanguageHeader('en;q=0.8,fr;q=0.85,de;q=0.80');
      expect(result).toEqual(['fr', 'en', 'de']);
    });

    it('should handle default quality (1.0) when not specified', () => {
      const result = parseAcceptLanguageHeader('fr,en;q=0.9');
      // 'fr' has implicit q=1.0, should come first
      expect(result[0]).toBe('fr');
      expect(result[1]).toBe('en');
    });

    it('should deduplicate repeated language codes', () => {
      const result = parseAcceptLanguageHeader('en-US,en-GB,en;q=0.5');
      // All normalize to 'en', should only appear once
      expect(result).toEqual(['en']);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for null input', () => {
      const result = parseAcceptLanguageHeader(null);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const result = parseAcceptLanguageHeader('');
      expect(result).toEqual([]);
    });

    it('should filter out wildcard (*)', () => {
      const result = parseAcceptLanguageHeader('en,*;q=0.5');
      expect(result).not.toContain('*');
      expect(result).toEqual(['en']);
    });

    it('should handle whitespace in header', () => {
      const result = parseAcceptLanguageHeader('  fr  ,  en  ;  q=0.8  ');
      expect(result).toContain('fr');
      expect(result).toContain('en');
    });

    it('should handle malformed headers gracefully - semicolons only', () => {
      const result = parseAcceptLanguageHeader(';;;');
      expect(result).toEqual([]);
    });

    it('should handle malformed headers gracefully - random text', () => {
      const result = parseAcceptLanguageHeader('invalid-header-format');
      // Should extract 'invalid' as primary code
      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should filter out entries with zero quality', () => {
      const result = parseAcceptLanguageHeader('en;q=0,fr;q=0.9');
      expect(result).not.toContain('en');
      expect(result).toEqual(['fr']);
    });

    it('should handle invalid quality values as zero', () => {
      const result = parseAcceptLanguageHeader('en;q=invalid,fr');
      // 'en' has invalid q, treated as 0; 'fr' has q=1.0
      expect(result[0]).toBe('fr');
    });

    it('should normalize uppercase language codes', () => {
      const result = parseAcceptLanguageHeader('EN-US,FR;q=0.9');
      expect(result).toEqual(['en', 'fr']);
    });
  });
});
```

#### Verification
- [ ] All tests pass with `npm run test`
- [ ] Tests cover valid headers (at least 8 cases)
- [ ] Tests cover edge cases (at least 10 cases)
- [ ] No console.log statements pollute test output

---

### TASK 4: Create Unit Tests for detectUserLanguage Priority Cascade

**File:** `/src/lib/i18n/__tests__/language-detection.test.ts` (APPEND)
**Estimated Effort:** 3 story points
**Dependencies:** Tasks 1, 2, 3

#### Description
Add tests for the `detectUserLanguage` function to verify the priority cascade works correctly: User DB > Cookie > Accept-Language > Default.

#### Implementation Steps

**Step 4.1:** Add detectUserLanguage tests to the existing test file

```typescript
// Add to /src/lib/i18n/__tests__/language-detection.test.ts

describe('detectUserLanguage', () => {
  // Suppress console.log during tests
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('priority 1: user database preference', () => {
    it('should use user preference when set and valid', () => {
      const request = createMockRequest({ cookie: 'fr', acceptLanguage: 'es-ES' });
      const user = { id: 'test-user', preferred_language: 'de' };

      const result = detectUserLanguage(request, user);

      expect(result).toBe('de');
    });

    it('should skip invalid user preference and fall through', () => {
      const request = createMockRequest({ cookie: 'fr', acceptLanguage: 'es-ES' });
      const user = { id: 'test-user', preferred_language: 'zh' }; // Not supported

      const result = detectUserLanguage(request, user);

      expect(result).toBe('fr'); // Falls through to cookie
    });

    it('should skip null user preference', () => {
      const request = createMockRequest({ cookie: 'fr' });
      const user = { id: 'test-user', preferred_language: null };

      const result = detectUserLanguage(request, user);

      expect(result).toBe('fr');
    });

    it('should skip when skipDbLookup option is true', () => {
      const request = createMockRequest({ cookie: 'fr' });
      const user = { id: 'test-user', preferred_language: 'de' };

      const result = detectUserLanguage(request, user, { skipDbLookup: true });

      expect(result).toBe('fr'); // Skipped user pref, used cookie
    });
  });

  describe('priority 2: cookie preference', () => {
    it('should use cookie when no user preference', () => {
      const request = createMockRequest({ cookie: 'de', acceptLanguage: 'fr-FR' });

      const result = detectUserLanguage(request);

      expect(result).toBe('de');
    });

    it('should use cookie when user has no preference', () => {
      const request = createMockRequest({ cookie: 'es', acceptLanguage: 'en-US' });
      const user = { id: 'test-user' }; // No preferred_language

      const result = detectUserLanguage(request, user);

      expect(result).toBe('es');
    });

    it('should skip invalid cookie and fall through', () => {
      const request = createMockRequest({ cookie: 'invalid', acceptLanguage: 'fr-FR' });

      const result = detectUserLanguage(request);

      expect(result).toBe('fr');
    });
  });

  describe('priority 3: Accept-Language header', () => {
    it('should use first supported language from header', () => {
      const request = createMockRequest({ acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8' });

      const result = detectUserLanguage(request);

      expect(result).toBe('de');
    });

    it('should skip unsupported languages and use first supported', () => {
      const request = createMockRequest({ acceptLanguage: 'zh-CN,fr;q=0.9,en;q=0.8' });

      const result = detectUserLanguage(request);

      expect(result).toBe('fr'); // zh-CN not supported, falls through to fr
    });

    it('should handle multi-language header correctly', () => {
      const request = createMockRequest({
        acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.8,de;q=0.7,*;q=0.5',
      });

      const result = detectUserLanguage(request);

      expect(result).toBe('fr');
    });
  });

  describe('priority 4: default fallback', () => {
    it('should use default locale when no preferences available', () => {
      const request = createEmptyMockRequest();

      const result = detectUserLanguage(request);

      expect(result).toBe('en');
    });

    it('should use default when all preferences are unsupported', () => {
      const request = createMockRequest({ acceptLanguage: 'zh-CN,ja;q=0.9,ko;q=0.8' });

      const result = detectUserLanguage(request);

      expect(result).toBe('en');
    });

    it('should use default when header is malformed', () => {
      const request = createMockRequest({ acceptLanguage: ';;;invalid;;;' });

      const result = detectUserLanguage(request);

      expect(result).toBe('en');
    });
  });

  describe('complete priority chain', () => {
    it('should test full cascade: user > cookie > header > default', () => {
      // Test with all sources present
      const request = createMockRequest({
        cookie: 'fr',
        acceptLanguage: 'es-ES',
      });
      const user = { id: 'test-user', preferred_language: 'de' };

      // User pref wins
      expect(detectUserLanguage(request, user)).toBe('de');

      // Without user pref, cookie wins
      expect(detectUserLanguage(request)).toBe('fr');

      // Without cookie, header wins
      const requestNoCooke = createMockRequest({ acceptLanguage: 'es-ES' });
      expect(detectUserLanguage(requestNoCooke)).toBe('es');

      // Without header, default wins
      const requestEmpty = createEmptyMockRequest();
      expect(detectUserLanguage(requestEmpty)).toBe('en');
    });
  });
});
```

#### Verification
- [ ] Priority 1 (user DB) tests pass (4 cases)
- [ ] Priority 2 (cookie) tests pass (3 cases)
- [ ] Priority 3 (Accept-Language) tests pass (3 cases)
- [ ] Priority 4 (default) tests pass (3 cases)
- [ ] Complete cascade test passes

---

### TASK 5: Create Guest Language Detection Module

**File:** `/src/lib/i18n/guest-language.ts` (NEW)
**Estimated Effort:** 3 story points
**Dependencies:** Task 1

#### Description
Create a guest-specific language detection module that adds URL parameter support as the highest priority for guest-facing pages.

#### Implementation Steps

**Step 5.1:** Create the guest language detection module

```typescript
/**
 * Guest Language Detection Utilities
 *
 * Provides language detection specifically for guest/public pages
 * with URL parameter support for shareable localized links.
 *
 * Priority Order (Guest Pages):
 * 1. URL parameter (?lang=de) - Highest priority for sharing
 * 2. Cookie (FAQBNB_LANG) - Persists user choice
 * 3. Accept-Language header - Browser auto-detection
 * 4. Content source language - Original content language
 * 5. Default locale ('en') - Final fallback
 *
 * REQ-357: Test Language Detection Priority Scenarios
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type SupportedLocale,
} from './config';
import { parseAcceptLanguageHeader } from './language-detection';

/**
 * Source of the detected language for logging/debugging
 */
export type LanguageSource = 'url' | 'cookie' | 'header' | 'content' | 'default';

/**
 * Result of language detection with source information
 */
export interface LanguageDetectionResult {
  /** The detected locale code */
  locale: SupportedLocale;
  /** How the locale was determined */
  source: LanguageSource;
}

/**
 * Extracts and validates language parameter from URL search params.
 *
 * @param searchParams - URLSearchParams or raw string value
 * @returns Valid SupportedLocale or null if invalid/missing
 *
 * @example
 * getLanguageFromUrl(new URL('https://example.com/item/123?lang=de').searchParams)
 * // Returns: 'de'
 *
 * @example
 * getLanguageFromUrl(new URL('https://example.com/item/123?lang=invalid').searchParams)
 * // Returns: null
 */
export function getLanguageFromUrl(
  searchParams: URLSearchParams | string | null | undefined
): SupportedLocale | null {
  if (!searchParams) {
    return null;
  }

  let langValue: string | null;

  if (typeof searchParams === 'string') {
    langValue = searchParams;
  } else {
    langValue = searchParams.get('lang');
  }

  if (!langValue) {
    return null;
  }

  // Normalize and validate
  const normalized = langValue.trim().toLowerCase();

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  return null;
}

/**
 * Reads language preference from cookie.
 *
 * @param request - NextRequest object
 * @returns Valid SupportedLocale or null
 */
function getLanguageFromCookie(request: NextRequest): SupportedLocale | null {
  const cookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}

/**
 * Gets first supported language from Accept-Language header.
 *
 * @param request - NextRequest object
 * @returns Valid SupportedLocale or null
 */
function getLanguageFromHeader(request: NextRequest): SupportedLocale | null {
  const acceptLanguage = request.headers.get('Accept-Language');
  const parsed = parseAcceptLanguageHeader(acceptLanguage);

  for (const lang of parsed) {
    if (isSupportedLocale(lang)) {
      return lang;
    }
  }

  return null;
}

/**
 * Detects language for guest/public pages with URL parameter priority.
 *
 * This function implements the guest-specific priority chain:
 * 1. URL parameter - Enables shareable links with explicit language
 * 2. Cookie - Remembers guest's previous choice
 * 3. Accept-Language header - Automatic browser detection
 * 4. Content source language - Falls back to original content language
 * 5. Default - 'en' as final fallback
 *
 * @param urlParam - Language from ?lang= query parameter (can be null/undefined/raw string)
 * @param request - NextRequest for cookie/header detection
 * @param contentSourceLang - Original content language for fallback (optional)
 * @returns The determined locale
 *
 * @example
 * // URL param takes priority
 * detectGuestLanguage('de', request)
 * // Returns: 'de' (even if cookie is 'fr')
 *
 * @example
 * // Falls back through the chain
 * detectGuestLanguage(null, request, 'it')
 * // Returns cookie value, or header value, or 'it', or 'en'
 */
export function detectGuestLanguage(
  urlParam: string | null | undefined,
  request: NextRequest,
  contentSourceLang?: SupportedLocale
): SupportedLocale {
  // Priority 1: URL parameter
  const urlLang = getLanguageFromUrl(urlParam);
  if (urlLang) {
    return urlLang;
  }

  // Priority 2: Cookie
  const cookieLang = getLanguageFromCookie(request);
  if (cookieLang) {
    return cookieLang;
  }

  // Priority 3: Accept-Language header
  const headerLang = getLanguageFromHeader(request);
  if (headerLang) {
    return headerLang;
  }

  // Priority 4: Content source language
  if (contentSourceLang && isSupportedLocale(contentSourceLang)) {
    return contentSourceLang;
  }

  // Priority 5: Default
  return DEFAULT_LOCALE;
}

/**
 * Detects language and returns both the locale and its source.
 * Useful for debugging and logging which priority level determined the language.
 *
 * @param urlParam - Language from ?lang= query parameter
 * @param request - NextRequest for cookie/header detection
 * @param contentSourceLang - Original content language (optional)
 * @returns Object with locale and source
 *
 * @example
 * const { locale, source } = getLanguageDetectionSource('de', request);
 * // { locale: 'de', source: 'url' }
 */
export function getLanguageDetectionSource(
  urlParam: string | null | undefined,
  request: NextRequest,
  contentSourceLang?: SupportedLocale
): LanguageDetectionResult {
  // Priority 1: URL parameter
  const urlLang = getLanguageFromUrl(urlParam);
  if (urlLang) {
    return { locale: urlLang, source: 'url' };
  }

  // Priority 2: Cookie
  const cookieLang = getLanguageFromCookie(request);
  if (cookieLang) {
    return { locale: cookieLang, source: 'cookie' };
  }

  // Priority 3: Accept-Language header
  const headerLang = getLanguageFromHeader(request);
  if (headerLang) {
    return { locale: headerLang, source: 'header' };
  }

  // Priority 4: Content source language
  if (contentSourceLang && isSupportedLocale(contentSourceLang)) {
    return { locale: contentSourceLang, source: 'content' };
  }

  // Priority 5: Default
  return { locale: DEFAULT_LOCALE, source: 'default' };
}
```

**Step 5.2:** Update barrel exports in `/src/lib/i18n/index.ts`

Add to exports:
```typescript
export {
  detectGuestLanguage,
  getLanguageFromUrl,
  getLanguageDetectionSource,
  type LanguageSource,
  type LanguageDetectionResult,
} from './guest-language';
```

#### Verification
- [ ] File created with all functions
- [ ] Types are exported
- [ ] Functions handle null/undefined inputs
- [ ] TypeScript compilation succeeds

---

### TASK 6: Create Unit Tests for Guest Language Detection

**File:** `/src/lib/i18n/__tests__/guest-language.test.ts` (NEW)
**Estimated Effort:** 4 story points
**Dependencies:** Tasks 2, 5

#### Description
Create comprehensive tests for the guest language detection module, covering all priority levels and the test scenarios defined in the overview document.

#### Implementation Steps

**Step 6.1:** Create the test file

```typescript
/**
 * Unit Tests for Guest Language Detection Module
 *
 * REQ-357: Test Language Detection Priority Scenarios
 * Tests URL parameter priority, cookie fallback, header detection,
 * and content source fallback for guest-facing pages.
 *
 * Test Scenarios (from REQ-357 Overview):
 * T-001 through T-014 covering all priority combinations
 *
 * @module lib/i18n/__tests__/guest-language.test
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectGuestLanguage,
  getLanguageFromUrl,
  getLanguageDetectionSource,
} from '../guest-language';
import { createMockRequest, createEmptyMockRequest } from './helpers/mockRequest';

describe('getLanguageFromUrl', () => {
  describe('valid URL parameters', () => {
    it('should extract language from URLSearchParams', () => {
      const params = new URLSearchParams('?lang=de');
      expect(getLanguageFromUrl(params)).toBe('de');
    });

    it('should extract language from string value', () => {
      expect(getLanguageFromUrl('fr')).toBe('fr');
    });

    it('should handle all supported languages', () => {
      const supported = ['en', 'fr', 'es', 'de', 'nl', 'it'];
      supported.forEach((lang) => {
        expect(getLanguageFromUrl(lang)).toBe(lang);
      });
    });

    it('should normalize uppercase language codes', () => {
      expect(getLanguageFromUrl('DE')).toBe('de');
      expect(getLanguageFromUrl('Fr')).toBe('fr');
    });

    it('should trim whitespace', () => {
      expect(getLanguageFromUrl('  de  ')).toBe('de');
    });
  });

  describe('invalid URL parameters', () => {
    it('should return null for null input', () => {
      expect(getLanguageFromUrl(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(getLanguageFromUrl(undefined)).toBeNull();
    });

    it('should return null for unsupported language', () => {
      expect(getLanguageFromUrl('zh')).toBeNull();
      expect(getLanguageFromUrl('ja')).toBeNull();
      expect(getLanguageFromUrl('ko')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getLanguageFromUrl('')).toBeNull();
    });

    it('should return null for invalid code', () => {
      expect(getLanguageFromUrl('invalid')).toBeNull();
      expect(getLanguageFromUrl('123')).toBeNull();
    });

    it('should return null for missing lang param', () => {
      const params = new URLSearchParams('?other=value');
      expect(getLanguageFromUrl(params)).toBeNull();
    });
  });
});

describe('detectGuestLanguage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('priority 1: URL parameter (highest)', () => {
    it('T-001: should use URL param when present and valid', () => {
      const request = createEmptyMockRequest();
      expect(detectGuestLanguage('de', request)).toBe('de');
    });

    it('T-002: should URL param override cookie', () => {
      const request = createMockRequest({ cookie: 'de', acceptLanguage: 'en-US' });
      expect(detectGuestLanguage('fr', request)).toBe('fr');
    });

    it('T-003: should URL param override all other sources', () => {
      const request = createMockRequest({ cookie: 'de', acceptLanguage: 'fr-FR' });
      expect(detectGuestLanguage('es', request, 'it')).toBe('es');
    });
  });

  describe('priority 2: cookie preference', () => {
    it('T-004: should use cookie when no URL param', () => {
      const request = createMockRequest({ cookie: 'fr', acceptLanguage: 'en-US' });
      expect(detectGuestLanguage(null, request)).toBe('fr');
    });

    it('T-005: should cookie override Accept-Language header', () => {
      const request = createMockRequest({ cookie: 'de', acceptLanguage: 'fr-FR' });
      expect(detectGuestLanguage(null, request)).toBe('de');
    });
  });

  describe('priority 3: Accept-Language header', () => {
    it('T-006: should use header when no URL param or cookie', () => {
      const request = createMockRequest({ acceptLanguage: 'es-ES' });
      expect(detectGuestLanguage(null, request)).toBe('es');
    });

    it('T-007: should use highest priority from multi-language header', () => {
      const request = createMockRequest({
        acceptLanguage: 'fr-FR,es;q=0.9,en;q=0.8',
      });
      expect(detectGuestLanguage(null, request)).toBe('fr');
    });
  });

  describe('fallback behavior', () => {
    it('T-008: should fallback to cookie for unsupported URL param', () => {
      const request = createMockRequest({ cookie: 'fr', acceptLanguage: 'en-US' });
      expect(detectGuestLanguage('zh', request)).toBe('fr');
    });

    it('T-009: should fallback to header for invalid URL param', () => {
      const request = createMockRequest({ acceptLanguage: 'de-DE' });
      expect(detectGuestLanguage('invalid', request)).toBe('de');
    });

    it('T-010: should fallback to cookie for empty URL param', () => {
      const request = createMockRequest({ cookie: 'fr', acceptLanguage: 'en-US' });
      expect(detectGuestLanguage('', request)).toBe('fr');
    });

    it('T-011: should use default when no preferences', () => {
      const request = createEmptyMockRequest();
      expect(detectGuestLanguage(null, request)).toBe('en');
    });

    it('T-012: should use default for unsupported Accept-Language', () => {
      const request = createMockRequest({ acceptLanguage: 'zh-CN,ja;q=0.9' });
      expect(detectGuestLanguage(null, request)).toBe('en');
    });

    it('T-013: should use first supported from mixed valid/invalid header', () => {
      const request = createMockRequest({ acceptLanguage: 'zh-CN,fr;q=0.9' });
      expect(detectGuestLanguage(null, request)).toBe('fr');
    });

    it('T-014: should use default for malformed Accept-Language', () => {
      const request = createMockRequest({ acceptLanguage: ';;;invalid;;;' });
      expect(detectGuestLanguage(null, request)).toBe('en');
    });
  });

  describe('content source language fallback', () => {
    it('should use content source language when no other preference', () => {
      const request = createEmptyMockRequest();
      expect(detectGuestLanguage(null, request, 'it')).toBe('it');
    });

    it('should content source language come after header', () => {
      const request = createMockRequest({ acceptLanguage: 'fr-FR' });
      expect(detectGuestLanguage(null, request, 'it')).toBe('fr');
    });

    it('should skip invalid content source language', () => {
      const request = createEmptyMockRequest();
      // @ts-expect-error - Testing invalid input
      expect(detectGuestLanguage(null, request, 'invalid')).toBe('en');
    });
  });
});

describe('getLanguageDetectionSource', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should identify URL parameter as source', () => {
    const request = createMockRequest({ cookie: 'fr' });
    const result = getLanguageDetectionSource('de', request);
    expect(result).toEqual({ locale: 'de', source: 'url' });
  });

  it('should identify cookie as source', () => {
    const request = createMockRequest({ cookie: 'fr' });
    const result = getLanguageDetectionSource(null, request);
    expect(result).toEqual({ locale: 'fr', source: 'cookie' });
  });

  it('should identify header as source', () => {
    const request = createMockRequest({ acceptLanguage: 'es-ES' });
    const result = getLanguageDetectionSource(null, request);
    expect(result).toEqual({ locale: 'es', source: 'header' });
  });

  it('should identify content as source', () => {
    const request = createEmptyMockRequest();
    const result = getLanguageDetectionSource(null, request, 'it');
    expect(result).toEqual({ locale: 'it', source: 'content' });
  });

  it('should identify default as source', () => {
    const request = createEmptyMockRequest();
    const result = getLanguageDetectionSource(null, request);
    expect(result).toEqual({ locale: 'en', source: 'default' });
  });
});
```

#### Verification
- [ ] All T-001 through T-014 test scenarios pass
- [ ] `getLanguageFromUrl` tests pass (12+ cases)
- [ ] `detectGuestLanguage` tests pass (17+ cases)
- [ ] `getLanguageDetectionSource` tests pass (5 cases)

---

### TASK 7: Update Middleware Matcher for Guest Routes

**File:** `/src/middleware.ts`
**Lines Affected:** 285-299 (config.matcher array)
**Estimated Effort:** 1 story point
**Dependencies:** None (can run in parallel)

#### Description
Add `/item/*` routes to the middleware matcher so language detection runs for guest-facing item pages.

#### Implementation Steps

**Step 7.1:** Locate the matcher config at line 285-300

```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/dashboard/:path*',
    '/dashboard',
    '/dashboard2/:path*',
    '/dashboard2',
    '/login',
    '/auth/oauth/callback',
    '/register',
    '/register/:path*'
  ],
}
```

**Step 7.2:** Add `/item/:path*` route to the matcher

```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/dashboard/:path*',
    '/dashboard',
    '/dashboard2/:path*',
    '/dashboard2',
    '/login',
    '/auth/oauth/callback',
    '/register',
    '/register/:path*',
    '/item/:path*',  // Added for guest language detection
  ],
}
```

#### Verification
- [ ] Middleware runs for `/item/[publicId]` routes
- [ ] Existing routes still work correctly
- [ ] No redirect loops for item pages
- [ ] Language cookie is set for guest visits

---

### TASK 8: Create Test Results Documentation

**File:** `/docs/testing/L10N-Language-Detection-Test-Results.md` (NEW)
**Estimated Effort:** 2 story points
**Dependencies:** Tasks 3, 4, 6

#### Description
Create a test results documentation file that records the outcomes of all unit tests and manual E2E tests.

#### Implementation Steps

**Step 8.1:** Create the directory and file

```bash
mkdir -p docs/testing
```

**Step 8.2:** Create the test results document

```markdown
# L10N Language Detection Test Results

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**REQ Reference:** REQ-357
**Test Type:** Unit Tests + Manual E2E

---

## Unit Test Results

### Test Run Information

| Field | Value |
|-------|-------|
| Test Framework | Vitest |
| Run Date | YYYY-MM-DD HH:MM |
| Run Command | `npm run test -- src/lib/i18n/__tests__/` |
| Total Tests | XX |
| Passed | XX |
| Failed | 0 |
| Skipped | 0 |

### parseAcceptLanguageHeader Tests

| Test Case | Status | Notes |
|-----------|--------|-------|
| Parse simple language code | PASS | |
| Parse language with region | PASS | |
| Parse multiple languages | PASS | |
| Sort by quality value | PASS | |
| Handle null input | PASS | |
| Handle empty string | PASS | |
| Filter wildcard | PASS | |
| Handle malformed headers | PASS | |

### detectUserLanguage Priority Tests

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| P1-001 | User DB preference (valid) | de | de | PASS |
| P1-002 | User DB preference (invalid) | fr | fr | PASS |
| P2-001 | Cookie (no user) | de | de | PASS |
| P2-002 | Cookie (invalid) | fr | fr | PASS |
| P3-001 | Accept-Language (supported) | de | de | PASS |
| P3-002 | Accept-Language (mixed) | fr | fr | PASS |
| P4-001 | Default (no prefs) | en | en | PASS |

### detectGuestLanguage Priority Tests

| Test ID | URL Param | Cookie | Accept-Language | Expected | Actual | Status |
|---------|-----------|--------|-----------------|----------|--------|--------|
| T-001 | `?lang=de` | None | en-US | de | de | PASS |
| T-002 | `?lang=fr` | de | en-US | fr | fr | PASS |
| T-003 | `?lang=es` | de | fr-FR | es | es | PASS |
| T-004 | None | fr | en-US | fr | fr | PASS |
| T-005 | None | de | fr-FR | de | de | PASS |
| T-006 | None | None | es-ES | es | es | PASS |
| T-007 | None | None | fr-FR,es;q=0.9 | fr | fr | PASS |
| T-008 | `?lang=zh` | fr | en-US | fr | fr | PASS |
| T-009 | `?lang=invalid` | None | de-DE | de | de | PASS |
| T-010 | `?lang=` | fr | en-US | fr | fr | PASS |
| T-011 | None | None | None | en | en | PASS |
| T-012 | None | None | zh-CN,ja;q=0.9 | en | en | PASS |
| T-013 | None | None | zh-CN,fr;q=0.9 | fr | fr | PASS |
| T-014 | None | None | ;;;invalid;;; | en | en | PASS |

---

## Manual E2E Test Results

### Test Environment

| Field | Value |
|-------|-------|
| Environment | Staging |
| URL | https://faqbnb-staging.up.railway.app |
| Test Date | YYYY-MM-DD |
| Tester | [Name] |
| Browser | Chrome XX.x |
| Test Item | /item/[TEST_PUBLIC_ID] |

### TC-357-1: Browser Language Detection Works

**Status:** [ ] PASS / [ ] FAIL

**Steps Performed:**
1. [ ] Cleared all cookies for staging domain
2. [ ] Set browser language to French (fr-FR)
3. [ ] Navigated to /item/[publicId]

**Results:**
- [ ] Page displayed in French
- [ ] FAQBNB_LANG cookie set to 'fr'
- [ ] Content shows translated text

**Notes:**

---

### TC-357-2: Cookie Preference Overrides Browser

**Status:** [ ] PASS / [ ] FAIL

**Steps Performed:**
1. [ ] Set browser language to Spanish (es-ES)
2. [ ] Set FAQBNB_LANG cookie to 'de'
3. [ ] Navigated to /item/[publicId]

**Results:**
- [ ] Page displayed in German (not Spanish)
- [ ] Language switcher shows German selected

**Verification:** `document.cookie.includes('FAQBNB_LANG=de')` = [ ] true

**Notes:**

---

### TC-357-3: URL Parameter Overrides Cookie

**Status:** [ ] PASS / [ ] FAIL

**Steps Performed:**
1. [ ] Set FAQBNB_LANG cookie to 'fr'
2. [ ] Set browser language to Spanish
3. [ ] Navigated to /item/[publicId]?lang=it

**Results:**
- [ ] Page displayed in Italian
- [ ] Cookie value unchanged (still 'fr')

**Notes:**

---

### TC-357-4: Fallback to Original Content Works

**Status:** [ ] PASS / [ ] FAIL

**Steps Performed:**
1. [ ] Cleared all cookies
2. [ ] Set browser language to unsupported (zh-CN)
3. [ ] Navigated to /item/[publicId]

**Results:**
- [ ] Page displayed in English (default)
- [ ] No error messages
- [ ] Content shows original language

**Notes:**

---

### TC-357-5: Invalid URL Parameter Handling

**Status:** [ ] PASS / [ ] FAIL

**Steps Performed:**
1. [ ] Set FAQBNB_LANG cookie to 'de'
2. [ ] Navigated to /item/[publicId]?lang=invalid

**Results:**
- [ ] Invalid parameter ignored
- [ ] Page displayed in German (from cookie)
- [ ] No error messages

**Notes:**

---

### TC-357-6: Priority Chain Complete Test

**Status:** [ ] PASS / [ ] FAIL

**Steps Performed:**

Part A - URL wins:
1. [ ] Set browser to Spanish
2. [ ] Set cookie to French
3. [ ] Navigate to ?lang=de
- [ ] Page shows German

Part B - Cookie wins:
4. [ ] Navigate without ?lang=
- [ ] Page shows French

Part C - Header wins:
5. [ ] Delete FAQBNB_LANG cookie
6. [ ] Refresh page
- [ ] Page shows Spanish

**Notes:**

---

## Summary

| Category | Passed | Failed | Total |
|----------|--------|--------|-------|
| Unit Tests - parseAcceptLanguageHeader | XX | 0 | XX |
| Unit Tests - detectUserLanguage | XX | 0 | XX |
| Unit Tests - detectGuestLanguage | XX | 0 | XX |
| Unit Tests - getLanguageDetectionSource | 5 | 0 | 5 |
| Manual E2E Tests | X | 0 | 6 |
| **TOTAL** | **XX** | **0** | **XX** |

---

## Issues Found

| Issue ID | Description | Severity | Status |
|----------|-------------|----------|--------|
| (none yet) | | | |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Reviewer | | | |

---

*Document generated for FAQBNB L10N Epic 4 - Testing & Polish*
```

#### Verification
- [ ] Document created with all test case templates
- [ ] All T-001 through T-014 scenarios documented
- [ ] Manual E2E test cases TC-357-1 through TC-357-6 documented
- [ ] Summary table structure in place

---

## Implementation Order

The tasks should be implemented in the following order:

```
TASK 1: Export parseAcceptLanguageHeader
    ↓
TASK 2: Create Mock Request Helper
    ↓
    ├── TASK 3: Unit Tests for parseAcceptLanguageHeader
    │       ↓
    │   TASK 4: Unit Tests for detectUserLanguage
    │
    └── TASK 5: Create Guest Language Detection Module
            ↓
        TASK 6: Unit Tests for Guest Language Detection
            ↓
        TASK 7: Update Middleware Matcher (can run in parallel with 5-6)
            ↓
        TASK 8: Create Test Results Documentation
```

**Parallelizable Tasks:**
- Task 7 can run in parallel with Tasks 5-6
- Tasks 3-4 can run after Task 2 completes
- Tasks 5-6 can run after Task 1 completes

---

## Definition of Done

A task is considered complete when:

1. [ ] All code changes are implemented per specification
2. [ ] TypeScript compilation succeeds (`npm run build`)
3. [ ] Unit tests pass (`npm run test`)
4. [ ] No ESLint errors (`npm run lint`)
5. [ ] Code follows existing patterns in the codebase
6. [ ] Changes are committed with appropriate message

---

## Acceptance Criteria Verification

| Criteria | Task(s) | Verified |
|----------|---------|----------|
| Browser language detection correctly identifies preferred language from Accept-Language header | Tasks 3, 4, 6 | [ ] |
| Cookie-stored language preference overrides browser settings when present | Tasks 4, 6 | [ ] |
| URL parameter (e.g., ?lang=de) overrides both cookie and browser preferences | Tasks 5, 6 | [ ] |
| System falls back to original content language when no preference available | Tasks 5, 6 | [ ] |
| All test scenarios documented with expected inputs and outputs | Task 8 | [ ] |
| Edge cases validated (invalid language codes, missing translations, conflicting preferences) | Tasks 3, 4, 6 | [ ] |

---

## References

- Overview Document: `/docs/REQ-357-test-language-detection-scenarios-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-357)
- Language Detection Module: `/src/lib/i18n/language-detection.ts`
- i18n Config: `/src/lib/i18n/config.ts`
- Middleware: `/src/middleware.ts`
- Vitest Config: `/vitest.config.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 7: Testing & Polish*
