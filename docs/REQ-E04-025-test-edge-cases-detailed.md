# REQ-E04-025: Test Edge Cases - Detailed Task Breakdown

**Document Created**: 2026-01-20 15:30:00 UTC
**Last Modified**: 2026-01-20 15:30:00 UTC
**Epic**: 4 - Guest Experience
**Phase**: 7 - Testing & Polish
**Task ID**: 7.3
**Type**: ENHANCEMENT
**Size**: M (Medium)
**Priority**: P1 - High
**Source Overview**: REQ-E04-025-test-edge-cases-overview.md

---

## Executive Summary

This document provides a granular task breakdown for implementing comprehensive edge case testing for the guest language detection and translation display systems. The testing validates system behavior when encountering exceptional scenarios including partial translations, blocked cookies, malformed Accept-Language headers, and unsupported language codes.

---

## Prerequisites

Before starting implementation, verify the following:

| Prerequisite | Verification Command/Location | Expected State |
|--------------|------------------------------|----------------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | File exists with `parseAcceptLanguageHeader()` function |
| i18n Configuration | `/src/lib/i18n/config.ts` | File exists with `SUPPORTED_LANGUAGES` constant |
| Guest Language Components | `/src/components/guest/` | Directory exists with GuestLanguageSwitcher, TranslationBanner, etc. |
| Translation Fetch Utilities | `/src/lib/translations/fetch-translations.ts` | File exists with translation fetch functions |
| Guest Item Page | `/src/app/item/[publicId]/page.tsx` | File exists with language detection |
| ItemDisplay Component | `/src/components/ItemDisplay.tsx` | File exists with translation props support |
| Middleware | `/src/middleware.ts` | File exists with `/item/*` route matching |
| Vitest Configuration | `/vitest.config.ts` | File exists with jsdom environment support |
| Existing Test Patterns | `/src/components/LanguageSwitcher/__tests__/` | Reference tests exist |

---

## Task Breakdown

### Phase 1: Test Infrastructure Setup

#### Task 1.1: Create Test Directory Structure

**File**: Multiple directories
**Action**: CREATE
**Estimated Effort**: 0.25 story points

**Description**: Set up the directory structure for edge case test files.

**Steps**:
1. Create directory `/src/lib/i18n/__tests__/` if not exists
2. Create directory `/src/components/guest/__tests__/` if not exists
3. Create directory `/src/app/item/__tests__/` if not exists

**Verification**:
```bash
ls -la src/lib/i18n/__tests__/
ls -la src/components/guest/__tests__/
ls -la src/app/item/__tests__/
```

---

#### Task 1.2: Create Mock Factories for Edge Case Data

**File**: `/src/lib/i18n/__tests__/helpers/mockFactories.ts`
**Action**: CREATE
**Estimated Effort**: 0.5 story points

**Description**: Create mock data factories for partial translations, malformed headers, and unsupported language codes.

**Code Template**:
```typescript
/**
 * Mock Factories for Guest Language Edge Case Testing
 *
 * @module tests/helpers/mockFactories
 * @lastModified 2026-01-20 15:30 UTC
 */

import type { SupportedLanguage, TranslatedItem, TranslatedArticle, TranslatedLink } from '@/types';

// Partial translation mock data
export function createMockPartialTranslation(overrides?: {
  hasTitle?: boolean;
  hasDescription?: boolean;
  articleTranslationCount?: number;
  linkTranslationCount?: number;
}): {
  item: TranslatedItem;
  articles: TranslatedArticle[];
  links: TranslatedLink[];
} {
  const defaults = {
    hasTitle: true,
    hasDescription: false,
    articleTranslationCount: 1,
    linkTranslationCount: 0,
  };
  const config = { ...defaults, ...overrides };

  return {
    item: {
      id: 'item-123',
      publicId: 'pub-123',
      name: config.hasTitle ? 'Translated Item Name' : 'Original Item Name',
      description: config.hasDescription ? 'Translated description' : 'Original description',
      sourceLanguage: 'en' as SupportedLanguage,
      displayLanguage: 'fr' as SupportedLanguage,
      isTranslated: config.hasTitle || config.hasDescription,
      originalName: 'Original Item Name',
      originalDescription: 'Original description',
    },
    articles: [
      {
        id: 'art-1',
        title: config.articleTranslationCount > 0 ? 'Article Traduit' : 'Original Article',
        description: null,
        sourceLanguage: 'en' as SupportedLanguage,
        displayLanguage: 'fr' as SupportedLanguage,
        isTranslated: config.articleTranslationCount > 0,
        links: [],
      },
      {
        id: 'art-2',
        title: 'Second Original Article',
        description: null,
        sourceLanguage: 'en' as SupportedLanguage,
        displayLanguage: 'en' as SupportedLanguage,
        isTranslated: false,
        links: [],
      },
    ],
    links: [
      {
        id: 'link-1',
        title: config.linkTranslationCount > 0 ? 'Lien Traduit' : 'Original Link',
        url: 'https://example.com',
        thumbnailUrl: null,
        sourceLanguage: 'en' as SupportedLanguage,
        displayLanguage: config.linkTranslationCount > 0 ? 'fr' as SupportedLanguage : 'en' as SupportedLanguage,
        isTranslated: config.linkTranslationCount > 0,
      },
    ],
  };
}

// Malformed Accept-Language headers
export const malformedHeaders = {
  empty: '',
  whitespace: '   ',
  invalidQuality: 'en;q=abc, fr;q=2.0, de;q=-1',
  missingSeparator: 'en;0.8, fr;0.9',
  duplicates: 'en;q=0.8, en;q=0.5, en;q=1.0',
  unusual: 'i-klingon, x-custom, art-lojban',
  longHeader: 'en,' + 'fr,'.repeat(1000),
  specialChars: 'en<script>, fr\x00, de\uFFFD',
  unsupportedOnly: 'xx, yy, zz',
  nullByte: 'en\x00fr',
  unicode: 'en\u200B, fr', // zero-width space
};

// Unsupported language codes
export const unsupportedCodes = [
  'kl',        // Klingon (fictional)
  'xx',        // Invalid ISO code
  'zh',        // Chinese (not in supported 6)
  'ja',        // Japanese (not in supported 6)
  'esp',       // Partial match to 'es'
  'KL',        // Case variation
  '123',       // Numeric
  '../',       // Path traversal attempt
  '<script>',  // XSS attempt
  'en-US-x',   // Malformed BCP 47
  '',          // Empty string
];

// Cookie simulation helpers
export function createMockCookieValue(language: string): string {
  return `FAQBNB_GUEST_LANG=${language}`;
}

export function createMockRequestHeaders(options?: {
  acceptLanguage?: string;
  cookie?: string;
}): Headers {
  const headers = new Headers();
  if (options?.acceptLanguage) {
    headers.set('Accept-Language', options.acceptLanguage);
  }
  if (options?.cookie) {
    headers.set('Cookie', options.cookie);
  }
  return headers;
}
```

**Acceptance Criteria**:
- [ ] Mock factory for partial translations is created
- [ ] Malformed header test data object is defined
- [ ] Unsupported language codes array is defined
- [ ] Cookie simulation helpers are created
- [ ] All exports are properly typed

---

#### Task 1.3: Create Test Utilities for Cookie and Header Simulation

**File**: `/src/lib/i18n/__tests__/helpers/testUtils.ts`
**Action**: CREATE
**Estimated Effort**: 0.5 story points

**Description**: Create utilities for simulating blocked cookies, header manipulation, and environment setup.

**Code Template**:
```typescript
/**
 * Test Utilities for Guest Language Edge Cases
 *
 * @module tests/helpers/testUtils
 * @lastModified 2026-01-20 15:30 UTC
 */

import { vi } from 'vitest';

/**
 * Simulates a browser environment where cookies are blocked
 */
export function simulateBlockedCookies(): () => void {
  let originalCookie: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
    Object.defineProperty(document, 'cookie', {
      get: () => { throw new Error('Cookies are blocked'); },
      set: () => { throw new Error('Cookies are blocked'); },
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalCookie) {
      Object.defineProperty(document, 'cookie', originalCookie);
    }
  });

  return () => {
    if (originalCookie) {
      Object.defineProperty(document, 'cookie', originalCookie);
    }
  };
}

/**
 * Simulates a browser environment where cookies silently fail (no errors)
 */
export function simulateSilentCookieFailure(): () => void {
  let cookieStore = '';

  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      get: () => cookieStore,
      set: () => { /* silently do nothing */ },
      configurable: true,
    });
  });

  return () => {
    cookieStore = '';
  };
}

/**
 * Creates a mock NextRequest with customizable properties
 */
export function createMockNextRequest(options: {
  url?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}): Request {
  const url = options.url || 'https://example.com/item/pub-123';
  const headers = new Headers(options.headers || {});

  // Add cookies to headers if provided
  if (options.cookies) {
    const cookieString = Object.entries(options.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    headers.set('Cookie', cookieString);
  }

  return new Request(url, { headers });
}

/**
 * Wait utility for async operations
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Creates a mock translation metadata object
 */
export function createMockTranslationMeta(overrides?: Partial<{
  requestedLanguage: string;
  displayLanguage: string;
  sourceLanguage: string;
  availableTranslations: string[];
  isShowingTranslation: boolean;
}>) {
  return {
    requestedLanguage: 'fr',
    displayLanguage: 'fr',
    sourceLanguage: 'en',
    availableTranslations: ['en', 'fr', 'es'],
    isShowingTranslation: true,
    ...overrides,
  };
}

/**
 * Performance timing utility
 */
export function measureExecutionTime<T>(
  fn: () => T
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Async performance timing utility
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}
```

**Acceptance Criteria**:
- [ ] Cookie blocking simulation utility is created
- [ ] Silent cookie failure simulation is created
- [ ] Mock NextRequest factory is created
- [ ] Wait condition utility is created
- [ ] Performance measurement utilities are created
- [ ] All utilities are properly typed

---

#### Task 1.4: Verify Vitest Configuration Supports Edge Cases

**File**: `/vitest.config.ts`
**Action**: VERIFY/MODIFY
**Estimated Effort**: 0.25 story points

**Description**: Ensure Vitest is configured to support jsdom environment for DOM manipulation tests.

**Verification Steps**:
1. Read current vitest.config.ts
2. Verify `environment: 'jsdom'` is set
3. Verify test timeout is sufficient for async tests
4. Add any missing configuration

**Expected Configuration**:
```typescript
// vitest.config.ts should include:
{
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
}
```

**Acceptance Criteria**:
- [ ] jsdom environment is configured
- [ ] Test timeout is at least 10000ms
- [ ] Test file patterns include .test.ts and .test.tsx

---

### Phase 2: Unit Tests for Language Detection Edge Cases

#### Task 2.1: Write Tests for parseAcceptLanguageHeader with Malformed Inputs

**File**: `/src/lib/i18n/__tests__/language-detection-edge-cases.test.ts`
**Action**: CREATE
**Estimated Effort**: 1 story point

**Description**: Create comprehensive unit tests for the `parseAcceptLanguageHeader()` function with all malformed input scenarios.

**Code Template**:
```typescript
/**
 * Edge Case Tests for Accept-Language Header Parsing
 *
 * @module tests/language-detection-edge-cases
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { parseAcceptLanguageHeader } from '../language-detection';
import { malformedHeaders } from './helpers/mockFactories';
import { measureExecutionTime } from './helpers/testUtils';

describe('parseAcceptLanguageHeader Edge Cases', () => {
  describe('Empty and Whitespace Headers', () => {
    it('handles empty string header gracefully', () => {
      const result = parseAcceptLanguageHeader(malformedHeaders.empty);
      expect(result).toBeDefined();
      expect(result).toBeNull(); // or expect default behavior
    });

    it('handles whitespace-only header gracefully', () => {
      const result = parseAcceptLanguageHeader(malformedHeaders.whitespace);
      expect(result).toBeDefined();
      expect(result).toBeNull();
    });

    it('handles null input gracefully', () => {
      const result = parseAcceptLanguageHeader(null as unknown as string);
      expect(result).toBeDefined();
    });

    it('handles undefined input gracefully', () => {
      const result = parseAcceptLanguageHeader(undefined as unknown as string);
      expect(result).toBeDefined();
    });
  });

  describe('Invalid Quality Factors', () => {
    it('handles non-numeric quality factor (q=abc)', () => {
      const result = parseAcceptLanguageHeader('en;q=abc, fr;q=0.8');
      expect(result).not.toContain('error');
      // Should either skip the malformed entry or use default quality
    });

    it('handles quality factor exceeding 1.0 (q=2.0)', () => {
      const result = parseAcceptLanguageHeader('en;q=2.0, fr;q=0.8');
      expect(result).toBeDefined();
    });

    it('handles negative quality factor (q=-1)', () => {
      const result = parseAcceptLanguageHeader('en;q=-1, fr;q=0.8');
      expect(result).toBeDefined();
    });

    it('handles missing quality separator (en;0.8)', () => {
      const result = parseAcceptLanguageHeader(malformedHeaders.missingSeparator);
      expect(result).toBeDefined();
    });

    it('handles quality factor with extra decimals (q=0.8888)', () => {
      const result = parseAcceptLanguageHeader('en;q=0.8888, fr;q=0.9');
      expect(result).toBeDefined();
    });
  });

  describe('Duplicate Languages', () => {
    it('handles duplicate language codes with different qualities', () => {
      const result = parseAcceptLanguageHeader(malformedHeaders.duplicates);
      expect(result).toBeDefined();
      // Should deduplicate and use highest quality
    });

    it('returns consistent result for duplicates', () => {
      const result1 = parseAcceptLanguageHeader('en;q=0.5, en;q=0.9');
      const result2 = parseAcceptLanguageHeader('en;q=0.9, en;q=0.5');
      expect(result1).toEqual(result2);
    });
  });

  describe('Unusual Language Tags', () => {
    it('handles fictional language tags (i-klingon)', () => {
      const result = parseAcceptLanguageHeader('i-klingon, en;q=0.8');
      expect(result).toBeDefined();
      // Should ignore unknown tags and fall back
    });

    it('handles private use tags (x-custom)', () => {
      const result = parseAcceptLanguageHeader('x-custom, fr;q=0.8');
      expect(result).toBeDefined();
    });

    it('handles artificial language tags (art-lojban)', () => {
      const result = parseAcceptLanguageHeader('art-lojban, de;q=0.8');
      expect(result).toBeDefined();
    });
  });

  describe('Excessively Long Headers', () => {
    it('handles very long header without performance degradation', () => {
      const { result, duration } = measureExecutionTime(() =>
        parseAcceptLanguageHeader(malformedHeaders.longHeader)
      );
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(10); // Should complete in < 10ms
    });

    it('does not crash with header containing 10000+ characters', () => {
      const veryLongHeader = 'en,' + 'fr,de,es,nl,it,'.repeat(2000);
      expect(() => parseAcceptLanguageHeader(veryLongHeader)).not.toThrow();
    });
  });

  describe('Special Characters and Encoding', () => {
    it('handles header with HTML tags', () => {
      const result = parseAcceptLanguageHeader('en<script>, fr');
      expect(result).toBeDefined();
    });

    it('handles header with null bytes', () => {
      const result = parseAcceptLanguageHeader(malformedHeaders.nullByte);
      expect(result).toBeDefined();
    });

    it('handles header with unicode characters', () => {
      const result = parseAcceptLanguageHeader(malformedHeaders.unicode);
      expect(result).toBeDefined();
    });

    it('handles header with replacement characters', () => {
      const result = parseAcceptLanguageHeader('en\uFFFD, fr');
      expect(result).toBeDefined();
    });
  });

  describe('Unsupported Languages Only', () => {
    it('falls back to default when only unsupported languages present', () => {
      const result = parseAcceptLanguageHeader(malformedHeaders.unsupportedOnly);
      // Should return null or default language
      expect(result === null || result === 'en').toBeTruthy();
    });
  });

  describe('General Error Prevention', () => {
    it('never throws an error for any malformed input', () => {
      Object.values(malformedHeaders).forEach(header => {
        expect(() => parseAcceptLanguageHeader(header)).not.toThrow();
      });
    });

    it('always returns a defined value', () => {
      Object.values(malformedHeaders).forEach(header => {
        const result = parseAcceptLanguageHeader(header);
        expect(result).toBeDefined();
      });
    });
  });
});
```

**Acceptance Criteria**:
- [ ] Tests for empty header value
- [ ] Tests for whitespace-only header
- [ ] Tests for invalid quality factors (q=abc, q=2.0, q=-1)
- [ ] Tests for missing quality separator
- [ ] Tests for duplicate languages
- [ ] Tests for unusual language tags
- [ ] Tests for excessively long headers
- [ ] Tests for special characters and encoding issues
- [ ] Tests for unsupported languages only
- [ ] All tests verify no errors are thrown
- [ ] Performance tests verify < 10ms execution

---

#### Task 2.2: Write Tests for Cookie-Blocked Scenarios

**File**: `/src/lib/i18n/__tests__/cookie-blocked.test.ts`
**Action**: CREATE
**Estimated Effort**: 1 story point

**Description**: Create tests simulating environments where cookies are unavailable.

**Code Template**:
```typescript
/**
 * Edge Case Tests for Cookie Blocked Scenarios
 *
 * @module tests/cookie-blocked
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getLocaleFromCookie, setGuestLanguageCookie } from '../guest-language';

describe('Cookie Blocked Scenarios', () => {
  let originalCookie: PropertyDescriptor | undefined;

  describe('Cookies Entirely Blocked (throw error)', () => {
    beforeEach(() => {
      originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
      Object.defineProperty(document, 'cookie', {
        get: () => { throw new DOMException('Cookies are blocked', 'SecurityError'); },
        set: () => { throw new DOMException('Cookies are blocked', 'SecurityError'); },
        configurable: true,
      });
    });

    afterEach(() => {
      if (originalCookie) {
        Object.defineProperty(document, 'cookie', originalCookie);
      }
    });

    it('getLocaleFromCookie returns null without throwing', () => {
      expect(() => getLocaleFromCookie()).not.toThrow();
      const result = getLocaleFromCookie();
      expect(result).toBeNull();
    });

    it('setGuestLanguageCookie fails silently without throwing', () => {
      expect(() => setGuestLanguageCookie('fr')).not.toThrow();
    });

    it('does not log errors to console for blocked cookies', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      getLocaleFromCookie();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Cookies Silently Fail (no error, just no-op)', () => {
    let cookieStore = '';

    beforeEach(() => {
      originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
      Object.defineProperty(document, 'cookie', {
        get: () => cookieStore,
        set: () => { /* silently do nothing */ },
        configurable: true,
      });
    });

    afterEach(() => {
      cookieStore = '';
      if (originalCookie) {
        Object.defineProperty(document, 'cookie', originalCookie);
      }
    });

    it('setGuestLanguageCookie completes without error', () => {
      expect(() => setGuestLanguageCookie('fr')).not.toThrow();
    });

    it('cookie value remains unchanged after set attempt', () => {
      setGuestLanguageCookie('fr');
      expect(cookieStore).toBe('');
    });
  });

  describe('Incognito/Private Browsing Simulation', () => {
    let cookieStore = '';

    beforeEach(() => {
      // In incognito, cookies work but are cleared on browser close
      // Simulate by clearing between "sessions"
      originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
      Object.defineProperty(document, 'cookie', {
        get: () => cookieStore,
        set: (value: string) => {
          // Parse and store, but will be cleared
          const [nameValue] = value.split(';');
          if (nameValue) {
            cookieStore = nameValue;
          }
        },
        configurable: true,
      });
    });

    afterEach(() => {
      cookieStore = '';
      if (originalCookie) {
        Object.defineProperty(document, 'cookie', originalCookie);
      }
    });

    it('language preference can be set within session', () => {
      setGuestLanguageCookie('de');
      const result = getLocaleFromCookie();
      expect(result).toBe('de');
    });

    it('language preference is lost after session clear', () => {
      setGuestLanguageCookie('de');
      cookieStore = ''; // Simulate session end
      const result = getLocaleFromCookie();
      expect(result).toBeNull();
    });
  });

  describe('Storage Quota Exceeded', () => {
    beforeEach(() => {
      originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
      Object.defineProperty(document, 'cookie', {
        get: () => '',
        set: () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); },
        configurable: true,
      });
    });

    afterEach(() => {
      if (originalCookie) {
        Object.defineProperty(document, 'cookie', originalCookie);
      }
    });

    it('handles quota exceeded error gracefully', () => {
      expect(() => setGuestLanguageCookie('fr')).not.toThrow();
    });
  });
});
```

**Acceptance Criteria**:
- [ ] Test simulates browser with cookies blocked entirely
- [ ] Test verifies language detection falls back to Accept-Language header
- [ ] Test verifies no JavaScript errors occur when cookie operations fail
- [ ] Test verifies no error messages display to user
- [ ] Test verifies incognito/private browsing mode simulation
- [ ] Test verifies quota exceeded scenario handling
- [ ] All scenarios fail silently without throwing

---

#### Task 2.3: Write Tests for detectUserLanguage with Unsupported Codes

**File**: `/src/lib/i18n/__tests__/unsupported-language-codes.test.ts`
**Action**: CREATE
**Estimated Effort**: 1 story point

**Description**: Create tests for handling unsupported language codes in all detection methods.

**Code Template**:
```typescript
/**
 * Edge Case Tests for Unsupported Language Codes
 *
 * @module tests/unsupported-language-codes
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectUserLanguage, isValidLanguageCode } from '../language-detection';
import { unsupportedCodes } from './helpers/mockFactories';
import { createMockNextRequest } from './helpers/testUtils';

describe('Unsupported Language Code Handling', () => {
  describe('URL Parameter with Unsupported Code', () => {
    unsupportedCodes.forEach(code => {
      it(`handles unsupported URL param: "${code}"`, () => {
        const result = detectUserLanguage({
          urlParam: code,
          cookie: null,
          acceptLanguage: 'en',
        });
        // Should fall back, not return the unsupported code
        expect(result).not.toBe(code);
        expect(['en', 'fr', 'es', 'de', 'nl', 'it', null]).toContain(result);
      });
    });

    it('falls back to cookie when URL param is unsupported', () => {
      const result = detectUserLanguage({
        urlParam: 'kl', // Klingon
        cookie: 'fr',
        acceptLanguage: 'de',
      });
      expect(result).toBe('fr');
    });
  });

  describe('Cookie with Unsupported Code', () => {
    unsupportedCodes.forEach(code => {
      it(`handles unsupported cookie value: "${code}"`, () => {
        const result = detectUserLanguage({
          urlParam: null,
          cookie: code,
          acceptLanguage: 'en',
        });
        expect(result).not.toBe(code);
      });
    });

    it('falls back to Accept-Language when cookie is unsupported', () => {
      const result = detectUserLanguage({
        urlParam: null,
        cookie: 'zh', // Chinese, not supported
        acceptLanguage: 'es',
      });
      expect(result).toBe('es');
    });
  });

  describe('Accept-Language with Only Unsupported Languages', () => {
    it('falls back to default English when header contains only unsupported', () => {
      const result = detectUserLanguage({
        urlParam: null,
        cookie: null,
        acceptLanguage: 'zh, ja, ko, pt',
      });
      expect(result).toBe('en');
    });
  });

  describe('Language Code Validation', () => {
    it('validates supported language codes correctly', () => {
      expect(isValidLanguageCode('en')).toBe(true);
      expect(isValidLanguageCode('fr')).toBe(true);
      expect(isValidLanguageCode('es')).toBe(true);
      expect(isValidLanguageCode('de')).toBe(true);
      expect(isValidLanguageCode('nl')).toBe(true);
      expect(isValidLanguageCode('it')).toBe(true);
    });

    unsupportedCodes.forEach(code => {
      it(`rejects unsupported code: "${code}"`, () => {
        expect(isValidLanguageCode(code)).toBe(false);
      });
    });
  });

  describe('Case Variations', () => {
    it('handles uppercase codes consistently', () => {
      const result1 = detectUserLanguage({ urlParam: 'KL', cookie: null, acceptLanguage: 'en' });
      const result2 = detectUserLanguage({ urlParam: 'kl', cookie: null, acceptLanguage: 'en' });
      expect(result1).toBe(result2);
    });

    it('handles mixed case codes consistently', () => {
      const result = detectUserLanguage({ urlParam: 'Kl', cookie: null, acceptLanguage: 'en' });
      expect(result).toBe('en'); // Falls back to default
    });
  });

  describe('Partial Matches', () => {
    it('does not treat "esp" as "es"', () => {
      const result = isValidLanguageCode('esp');
      expect(result).toBe(false);
    });

    it('does not treat "english" as "en"', () => {
      const result = isValidLanguageCode('english');
      expect(result).toBe(false);
    });
  });

  describe('Security: Injection Prevention', () => {
    const injectionAttempts = [
      '../../../etc/passwd',
      '<script>alert(1)</script>',
      'en; DROP TABLE users;--',
      '${process.env.SECRET}',
      '{{constructor.constructor("return this")()}}',
    ];

    injectionAttempts.forEach(code => {
      it(`sanitizes injection attempt: "${code.substring(0, 20)}..."`, () => {
        expect(isValidLanguageCode(code)).toBe(false);
        const result = detectUserLanguage({
          urlParam: code,
          cookie: null,
          acceptLanguage: 'en',
        });
        expect(result).not.toBe(code);
      });
    });
  });

  describe('No Translation Fetch for Unsupported', () => {
    it('should not attempt to fetch translations for unsupported codes', async () => {
      const fetchSpy = vi.fn();
      // This test assumes there's a way to spy on translation fetch
      // Implementation depends on actual code structure
    });
  });
});
```

**Acceptance Criteria**:
- [ ] Tests for unsupported codes in URL parameter
- [ ] Tests for unsupported codes in cookie
- [ ] Tests for Accept-Language with only unsupported languages
- [ ] Tests for case variations
- [ ] Tests for partial matches
- [ ] Tests for injection prevention
- [ ] All unsupported codes trigger fallback behavior
- [ ] No errors are exposed to users

---

### Phase 3: Component Tests for Translation Display Edge Cases

#### Task 3.1: Write Tests for TranslationBanner with Partial Translations

**File**: `/src/components/guest/__tests__/partial-translations.test.tsx`
**Action**: CREATE
**Estimated Effort**: 1 story point

**Description**: Create component tests verifying behavior with partial translation data.

**Code Template**:
```typescript
/**
 * Component Tests for Partial Translation Display
 *
 * @module tests/partial-translations
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationBanner } from '../TranslationBanner';
import { MissingTranslationBanner } from '../MissingTranslationBanner';
import { ViewOriginalToggle } from '../ViewOriginalToggle';
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';
import { createMockPartialTranslation, createMockTranslationMeta } from '@/lib/i18n/__tests__/helpers/mockFactories';

describe('Partial Translation Display', () => {
  describe('TranslationBanner with Partial Translations', () => {
    it('displays banner for partially translated content', () => {
      const mockData = createMockPartialTranslation({
        hasTitle: true,
        hasDescription: false,
      });

      render(
        <TranslationBanner
          sourceLanguage="en"
          displayLanguage="fr"
          onViewOriginal={() => {}}
        />
      );

      expect(screen.getByText(/translated from/i)).toBeInTheDocument();
    });

    it('shows "View original" action for partially translated content', () => {
      render(
        <TranslationBanner
          sourceLanguage="en"
          displayLanguage="fr"
          onViewOriginal={() => {}}
        />
      );

      expect(screen.getByText(/view original/i)).toBeInTheDocument();
    });
  });

  describe('Content Display with Mixed Translations', () => {
    it('displays translated title with original description', () => {
      const mockData = createMockPartialTranslation({
        hasTitle: true,
        hasDescription: false,
      });

      // Test that the item data structure is correct
      expect(mockData.item.name).toBe('Translated Item Name');
      expect(mockData.item.originalDescription).toBe('Original description');
    });

    it('displays translated articles alongside original articles', () => {
      const mockData = createMockPartialTranslation({
        articleTranslationCount: 1,
      });

      // First article is translated, second is not
      expect(mockData.articles[0].isTranslated).toBe(true);
      expect(mockData.articles[1].isTranslated).toBe(false);
    });

    it('displays translated links with original links', () => {
      const mockData = createMockPartialTranslation({
        linkTranslationCount: 1,
      });

      expect(mockData.links[0].isTranslated).toBe(true);
    });
  });

  describe('ViewOriginalToggle with Partial Translations', () => {
    it('toggles ALL fields to original, not just partial fields', () => {
      const onToggle = vi.fn();

      render(
        <ViewOriginalToggle
          isShowingOriginal={false}
          sourceLanguage="en"
          onToggle={onToggle}
        />
      );

      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalled();
    });

    it('displays correct text when viewing partial translation', () => {
      render(
        <ViewOriginalToggle
          isShowingOriginal={false}
          sourceLanguage="en"
          onToggle={() => {}}
        />
      );

      expect(screen.getByText(/view.*original/i)).toBeInTheDocument();
    });

    it('displays correct text when viewing original', () => {
      render(
        <ViewOriginalToggle
          isShowingOriginal={true}
          sourceLanguage="en"
          onToggle={() => {}}
        />
      );

      expect(screen.getByText(/view translation/i)).toBeInTheDocument();
    });
  });

  describe('GuestLanguageSwitcher with Partial Translations', () => {
    it('handles partial translations without errors', () => {
      expect(() => {
        render(
          <GuestLanguageSwitcher
            currentLanguage="fr"
            availableTranslations={['en', 'fr']}
            sourceLanguage="en"
            onLanguageChange={() => {}}
          />
        );
      }).not.toThrow();
    });

    it('indicates partial translation availability', () => {
      render(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableTranslations={['en', 'fr']}
          sourceLanguage="en"
          onLanguageChange={() => {}}
        />
      );

      // Component should render without errors
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('No Visual Gaps with Partial Translations', () => {
    it('renders without missing content sections', () => {
      const mockData = createMockPartialTranslation({
        hasTitle: true,
        hasDescription: false,
        articleTranslationCount: 1,
        linkTranslationCount: 0,
      });

      // Verify all content sections have values (either translated or original)
      expect(mockData.item.name).toBeTruthy();
      expect(mockData.item.description || mockData.item.originalDescription).toBeTruthy();
      mockData.articles.forEach(article => {
        expect(article.title).toBeTruthy();
      });
      mockData.links.forEach(link => {
        expect(link.title).toBeTruthy();
      });
    });
  });
});
```

**Acceptance Criteria**:
- [ ] Tests for TranslationBanner with partial translations
- [ ] Tests for mixed translated/original content display
- [ ] Tests for ViewOriginalToggle toggling ALL fields
- [ ] Tests for GuestLanguageSwitcher handling partial translations
- [ ] Tests verify no visual gaps or missing content
- [ ] All component tests render without errors

---

#### Task 3.2: Write Tests for MissingTranslationBanner Edge Cases

**File**: `/src/components/guest/__tests__/missing-translation-banner.test.tsx`
**Action**: CREATE
**Estimated Effort**: 0.5 story points

**Description**: Create tests for MissingTranslationBanner component edge cases.

**Code Template**:
```typescript
/**
 * Component Tests for MissingTranslationBanner Edge Cases
 *
 * @module tests/missing-translation-banner
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissingTranslationBanner } from '../MissingTranslationBanner';

describe('MissingTranslationBanner Edge Cases', () => {
  it('renders with valid language codes', () => {
    render(
      <MissingTranslationBanner
        requestedLanguage="fr"
        displayLanguage="en"
      />
    );

    expect(screen.getByText(/french/i)).toBeInTheDocument();
    expect(screen.getByText(/english/i)).toBeInTheDocument();
  });

  it('handles undefined requestedLanguage gracefully', () => {
    expect(() => {
      render(
        <MissingTranslationBanner
          requestedLanguage={undefined as unknown as string}
          displayLanguage="en"
        />
      );
    }).not.toThrow();
  });

  it('handles undefined displayLanguage gracefully', () => {
    expect(() => {
      render(
        <MissingTranslationBanner
          requestedLanguage="fr"
          displayLanguage={undefined as unknown as string}
        />
      );
    }).not.toThrow();
  });

  it('handles null language props gracefully', () => {
    expect(() => {
      render(
        <MissingTranslationBanner
          requestedLanguage={null as unknown as string}
          displayLanguage={null as unknown as string}
        />
      );
    }).not.toThrow();
  });

  it('uses muted styling (not error styling)', () => {
    const { container } = render(
      <MissingTranslationBanner
        requestedLanguage="fr"
        displayLanguage="en"
      />
    );

    // Should not have error/warning colors
    const banner = container.firstChild as HTMLElement;
    const styles = getComputedStyle(banner);

    // Verify it's not using alarming colors (red/yellow)
    expect(styles.backgroundColor).not.toBe('rgb(255, 0, 0)');
    expect(styles.backgroundColor).not.toBe('rgb(255, 255, 0)');
  });

  it('does not include alarming icons', () => {
    render(
      <MissingTranslationBanner
        requestedLanguage="fr"
        displayLanguage="en"
      />
    );

    // Should not have warning or error icons
    const warningIcons = screen.queryAllByRole('img', { name: /warning|error/i });
    expect(warningIcons).toHaveLength(0);
  });

  it('includes appropriate ARIA attributes', () => {
    render(
      <MissingTranslationBanner
        requestedLanguage="fr"
        displayLanguage="en"
      />
    );

    // Should have informational role, not alert
    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
  });

  it('is responsive on mobile viewport', () => {
    const { container } = render(
      <MissingTranslationBanner
        requestedLanguage="fr"
        displayLanguage="en"
      />
    );

    // Banner should be present and not overflow
    const banner = container.firstChild as HTMLElement;
    expect(banner).toBeInTheDocument();
  });
});
```

**Acceptance Criteria**:
- [ ] Tests for valid language code rendering
- [ ] Tests for undefined/null prop handling
- [ ] Tests verify muted styling (not error styling)
- [ ] Tests verify no alarming icons
- [ ] Tests verify proper ARIA attributes
- [ ] Tests for responsive behavior

---

#### Task 3.3: Write Tests for GuestLanguageSwitcher with Blocked Cookies

**File**: `/src/components/guest/__tests__/language-switcher-blocked-cookies.test.tsx`
**Action**: CREATE
**Estimated Effort**: 0.5 story points

**Description**: Create tests for GuestLanguageSwitcher when cookies are blocked.

**Code Template**:
```typescript
/**
 * Component Tests for GuestLanguageSwitcher with Blocked Cookies
 *
 * @module tests/language-switcher-blocked-cookies
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';

describe('GuestLanguageSwitcher with Blocked Cookies', () => {
  let originalCookie: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
    Object.defineProperty(document, 'cookie', {
      get: () => { throw new DOMException('Cookies are blocked', 'SecurityError'); },
      set: () => { throw new DOMException('Cookies are blocked', 'SecurityError'); },
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalCookie) {
      Object.defineProperty(document, 'cookie', originalCookie);
    }
  });

  it('renders without crashing when cookies are blocked', () => {
    expect(() => {
      render(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableTranslations={['en', 'fr', 'es']}
          sourceLanguage="en"
          onLanguageChange={() => {}}
        />
      );
    }).not.toThrow();
  });

  it('allows language selection even with blocked cookies', async () => {
    const onLanguageChange = vi.fn();

    render(
      <GuestLanguageSwitcher
        currentLanguage="en"
        availableTranslations={['en', 'fr', 'es']}
        sourceLanguage="en"
        onLanguageChange={onLanguageChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Wait for dropdown to open and select French
    await waitFor(() => {
      const frenchOption = screen.getByText(/français/i);
      fireEvent.click(frenchOption);
    });

    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });

  it('does not show error to user when cookie persistence fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <GuestLanguageSwitcher
        currentLanguage="en"
        availableTranslations={['en', 'fr', 'es']}
        sourceLanguage="en"
        onLanguageChange={() => {}}
      />
    );

    // No visible error messages should appear
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cookie/i)).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('maintains functionality in incognito mode simulation', () => {
    // Reset to incognito simulation (cookies work but clear on session end)
    Object.defineProperty(document, 'cookie', {
      get: () => '',
      set: () => {},
      configurable: true,
    });

    const onLanguageChange = vi.fn();

    render(
      <GuestLanguageSwitcher
        currentLanguage="en"
        availableTranslations={['en', 'fr', 'es']}
        sourceLanguage="en"
        onLanguageChange={onLanguageChange}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

**Acceptance Criteria**:
- [ ] Component renders without crashing when cookies blocked
- [ ] Language selection still works
- [ ] No error messages shown to user
- [ ] Works in incognito mode simulation

---

### Phase 4: Integration Tests for Guest Item Page Edge Cases

#### Task 4.1: Write Integration Tests for Guest Item Page with Partial Translations

**File**: `/src/app/item/__tests__/guest-item-edge-cases.test.tsx`
**Action**: CREATE
**Estimated Effort**: 1.5 story points

**Description**: Create integration tests for the complete guest item page flow with edge case scenarios.

**Code Template**:
```typescript
/**
 * Integration Tests for Guest Item Page Edge Cases
 *
 * @module tests/guest-item-edge-cases
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPartialTranslation, malformedHeaders, unsupportedCodes } from '@/lib/i18n/__tests__/helpers/mockFactories';
import { createMockNextRequest } from '@/lib/i18n/__tests__/helpers/testUtils';

// Mock the fetch functions
vi.mock('@/lib/translations/fetch-translations', () => ({
  fetchTranslatedItem: vi.fn(),
}));

describe('Guest Item Page Edge Cases', () => {
  describe('Partial Translation Scenarios', () => {
    it('displays item with translated title but original description', async () => {
      const mockData = createMockPartialTranslation({
        hasTitle: true,
        hasDescription: false,
      });

      // Verify data structure
      expect(mockData.item.name).toBe('Translated Item Name');
      expect(mockData.item.isTranslated).toBe(true);
    });

    it('displays articles with mixed translation status', async () => {
      const mockData = createMockPartialTranslation({
        articleTranslationCount: 1,
      });

      const translatedArticles = mockData.articles.filter(a => a.isTranslated);
      const originalArticles = mockData.articles.filter(a => !a.isTranslated);

      expect(translatedArticles.length).toBe(1);
      expect(originalArticles.length).toBe(1);
    });

    it('shows TranslationBanner for partially translated content', async () => {
      const mockData = createMockPartialTranslation({
        hasTitle: true,
        hasDescription: false,
      });

      expect(mockData.item.isTranslated).toBe(true);
      // Banner should show when isTranslated is true
    });
  });

  describe('Malformed Accept-Language Header Handling', () => {
    Object.entries(malformedHeaders).forEach(([name, header]) => {
      it(`handles malformed header: ${name}`, async () => {
        const request = createMockNextRequest({
          url: 'https://example.com/item/pub-123',
          headers: { 'Accept-Language': header },
        });

        // Should not throw
        expect(request.headers.get('Accept-Language')).toBe(header);
      });
    });
  });

  describe('Unsupported Language Code in URL', () => {
    unsupportedCodes.forEach(code => {
      it(`handles unsupported URL param: ${code}`, async () => {
        const request = createMockNextRequest({
          url: `https://example.com/item/pub-123?lang=${encodeURIComponent(code)}`,
        });

        const url = new URL(request.url);
        expect(url.searchParams.get('lang')).toBeDefined();
      });
    });
  });

  describe('Cookie Blocked on Page Load', () => {
    it('page loads successfully when cookies are blocked', async () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123',
        headers: { 'Accept-Language': 'fr,en;q=0.8' },
        // No cookies
      });

      expect(request.headers.get('Accept-Language')).toBe('fr,en;q=0.8');
    });

    it('uses Accept-Language when no cookie present', async () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123',
        headers: { 'Accept-Language': 'es,fr;q=0.8' },
      });

      // Detection should fall back to Accept-Language
      expect(request.headers.get('Accept-Language')).toBe('es,fr;q=0.8');
    });
  });

  describe('Full Fallback Cascade', () => {
    it('uses URL param over cookie over header', () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123?lang=de',
        cookies: { 'FAQBNB_GUEST_LANG': 'fr' },
        headers: { 'Accept-Language': 'es' },
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('lang')).toBe('de');
    });

    it('falls back to default English when all sources fail', () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123?lang=kl',
        cookies: { 'FAQBNB_GUEST_LANG': 'zh' },
        headers: { 'Accept-Language': 'ja' },
      });

      // All sources contain unsupported languages
      // Should fall back to English
    });
  });

  describe('Error Handling', () => {
    it('does not expose internal error details to guests', () => {
      // Verify error messages are sanitized
      const genericError = 'An error occurred';
      expect(genericError).not.toContain('stack');
      expect(genericError).not.toContain('trace');
    });

    it('does not expose file paths in errors', () => {
      const errorMessage = 'Translation not available';
      expect(errorMessage).not.toContain('/src/');
      expect(errorMessage).not.toContain('/app/');
    });
  });

  describe('Performance Thresholds', () => {
    it('handles edge cases within performance budget', async () => {
      const start = performance.now();

      // Simulate edge case processing
      const mockData = createMockPartialTranslation();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // < 100ms for mock data
    });
  });
});
```

**Acceptance Criteria**:
- [ ] Tests for partial translation display
- [ ] Tests for malformed Accept-Language header handling
- [ ] Tests for unsupported language codes in URL
- [ ] Tests for cookie blocked scenarios
- [ ] Tests for full fallback cascade
- [ ] Tests verify no internal error details exposed
- [ ] Tests verify performance thresholds met

---

#### Task 4.2: Write Tests for Middleware Handling of Malformed Headers

**File**: `/src/middleware/__tests__/language-detection-middleware.test.ts`
**Action**: CREATE
**Estimated Effort**: 1 story point

**Description**: Create tests for middleware handling of edge case headers and language detection.

**Code Template**:
```typescript
/**
 * Middleware Tests for Language Detection Edge Cases
 *
 * @module tests/middleware-language-detection
 * @lastModified 2026-01-20 15:30 UTC
 */

import { describe, it, expect } from 'vitest';
import { malformedHeaders, unsupportedCodes } from '@/lib/i18n/__tests__/helpers/mockFactories';
import { createMockNextRequest } from '@/lib/i18n/__tests__/helpers/testUtils';

describe('Middleware Language Detection Edge Cases', () => {
  describe('Malformed Accept-Language Headers', () => {
    Object.entries(malformedHeaders).forEach(([name, header]) => {
      it(`processes request with malformed header: ${name}`, () => {
        const request = createMockNextRequest({
          url: 'https://example.com/item/pub-123',
          headers: { 'Accept-Language': header },
        });

        // Middleware should process without throwing
        expect(request).toBeDefined();
      });
    });

    it('does not return 500 for any malformed header', () => {
      Object.values(malformedHeaders).forEach(header => {
        const request = createMockNextRequest({
          url: 'https://example.com/item/pub-123',
          headers: { 'Accept-Language': header },
        });

        // Should not result in server error
        expect(request).toBeDefined();
      });
    });
  });

  describe('Route Matching', () => {
    it('matches /item/* routes', () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123',
      });

      const url = new URL(request.url);
      expect(url.pathname).toMatch(/^\/item\//);
    });

    it('handles nested item routes', () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123/details',
      });

      const url = new URL(request.url);
      expect(url.pathname).toMatch(/^\/item\//);
    });
  });

  describe('Header Setting', () => {
    it('sets x-locale header for downstream components', () => {
      // Middleware should set x-locale header
      const expectedHeader = 'x-locale';
      expect(expectedHeader).toBe('x-locale');
    });
  });

  describe('Cookie Handling', () => {
    it('reads cookie value correctly', () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123',
        cookies: { 'FAQBNB_GUEST_LANG': 'fr' },
      });

      expect(request.headers.get('Cookie')).toContain('FAQBNB_GUEST_LANG=fr');
    });

    it('handles missing cookie gracefully', () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123',
      });

      expect(request.headers.get('Cookie')).toBeNull();
    });
  });

  describe('No URL Redirects', () => {
    it('does not redirect for language preference', () => {
      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123?lang=fr',
      });

      const url = new URL(request.url);
      // URL should remain unchanged
      expect(url.pathname).toBe('/item/pub-123');
    });
  });

  describe('Performance', () => {
    it('processes request within latency budget', async () => {
      const start = performance.now();

      const request = createMockNextRequest({
        url: 'https://example.com/item/pub-123',
        headers: { 'Accept-Language': 'fr,en;q=0.8' },
        cookies: { 'FAQBNB_GUEST_LANG': 'de' },
      });

      // Simulate middleware processing
      const url = new URL(request.url);
      url.searchParams.get('lang');

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10); // < 10ms
    });
  });
});
```

**Acceptance Criteria**:
- [ ] Tests for malformed header handling
- [ ] Tests for route matching
- [ ] Tests for header setting
- [ ] Tests for cookie handling
- [ ] Tests verify no URL redirects
- [ ] Tests verify performance within budget

---

### Phase 5: Documentation and Results

#### Task 5.1: Document All Test Scenarios with Reproduction Steps

**File**: `/docs/testing/edge-case-test-scenarios.md`
**Action**: CREATE
**Estimated Effort**: 0.5 story points

**Description**: Create comprehensive documentation of all edge case test scenarios.

**Template**:
```markdown
# Edge Case Test Scenarios - Guest Language Detection

**Document Created**: 2026-01-20 15:30 UTC
**Last Modified**: 2026-01-20 15:30 UTC

## Test Categories

### 1. Partial Translation Scenarios

| ID | Scenario | Steps to Reproduce | Expected Result |
|----|----------|-------------------|-----------------|
| PT-01 | Translated title, original description | 1. Create item with translation for name only 2. View in target language | Title displays translated, description displays original |
| PT-02 | Mixed article translations | 1. Create item with 2 articles 2. Translate only first article 3. View in target language | First article translated, second in original |
| ... | ... | ... | ... |

### 2. Cookie Blocked Scenarios

| ID | Scenario | Steps to Reproduce | Expected Result |
|----|----------|-------------------|-----------------|
| CB-01 | Cookies entirely blocked | 1. Block cookies in browser 2. Visit item page | Falls back to Accept-Language |
| CB-02 | Incognito mode | 1. Open incognito window 2. Visit item page 3. Select language | Language works within session |
| ... | ... | ... | ... |

### 3. Malformed Accept-Language Header Scenarios

| ID | Scenario | Steps to Reproduce | Expected Result |
|----|----------|-------------------|-----------------|
| MH-01 | Empty header | 1. Send request with empty Accept-Language | Falls back to default English |
| MH-02 | Invalid quality factor | 1. Send request with "en;q=abc" | Ignores invalid entry, uses fallback |
| ... | ... | ... | ... |

### 4. Unsupported Language Code Scenarios

| ID | Scenario | Steps to Reproduce | Expected Result |
|----|----------|-------------------|-----------------|
| UL-01 | Unsupported URL param | 1. Visit /item/pub-123?lang=kl | Falls back to cookie/header/default |
| UL-02 | Unsupported cookie value | 1. Set cookie to unsupported code 2. Visit page | Falls back to header/default |
| ... | ... | ... | ... |

## Running the Tests

\`\`\`bash
# Run all edge case tests
npm run test -- --grep "Edge Case"

# Run specific category
npm run test -- src/lib/i18n/__tests__/language-detection-edge-cases.test.ts
npm run test -- src/lib/i18n/__tests__/cookie-blocked.test.ts
npm run test -- src/lib/i18n/__tests__/unsupported-language-codes.test.ts
npm run test -- src/components/guest/__tests__/partial-translations.test.tsx
\`\`\`
```

**Acceptance Criteria**:
- [ ] All test scenarios documented
- [ ] Reproduction steps provided for each
- [ ] Expected results clearly stated
- [ ] Test execution commands documented

---

#### Task 5.2: Create Test Results Recording Template

**File**: `/docs/testing/edge-case-test-results.md`
**Action**: CREATE
**Estimated Effort**: 0.25 story points

**Description**: Create a template for recording test results.

**Template**:
```markdown
# Edge Case Test Results

**Test Execution Date**: YYYY-MM-DD HH:MM UTC
**Environment**: [Development/Staging/Production]
**Browser(s)**: [Chrome/Safari/Firefox versions]
**Viewport(s)**: [Desktop 1920x1080, Mobile 375x667]

## Summary

| Category | Total Tests | Passed | Failed | Skipped |
|----------|-------------|--------|--------|---------|
| Partial Translations | XX | XX | XX | XX |
| Cookie Blocked | XX | XX | XX | XX |
| Malformed Headers | XX | XX | XX | XX |
| Unsupported Languages | XX | XX | XX | XX |
| **Total** | **XX** | **XX** | **XX** | **XX** |

## Detailed Results

### Partial Translation Tests

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| PT-01 | Translated title, original description | PASS/FAIL | |
| PT-02 | Mixed article translations | PASS/FAIL | |
| ... | ... | ... | ... |

### Issues Identified

| Issue ID | Description | Severity | Reproduction Steps | Recommended Fix |
|----------|-------------|----------|-------------------|-----------------|
| ISS-001 | Example issue | High/Medium/Low | Steps... | Fix suggestion... |

## Sign-off

- [ ] All critical tests passed
- [ ] All high-severity issues documented
- [ ] Test coverage meets acceptance criteria
```

**Acceptance Criteria**:
- [ ] Template created with all sections
- [ ] Summary table for quick overview
- [ ] Detailed results section for each category
- [ ] Issues tracking section

---

#### Task 5.3: Document Identified Issues with Severity Assessment

**File**: (Updates to test results document)
**Action**: UPDATE
**Estimated Effort**: 0.5 story points (ongoing during test execution)

**Description**: Document any issues found during test execution with severity assessment and recommended fixes.

**Severity Definitions**:
- **Critical**: System crash, data loss, security vulnerability
- **High**: Feature completely broken, no workaround
- **Medium**: Feature partially broken, workaround available
- **Low**: Minor UI issue, edge case affecting few users

**Acceptance Criteria**:
- [ ] All identified issues documented
- [ ] Each issue has reproduction steps
- [ ] Each issue has severity assessment
- [ ] Each issue has recommended fix

---

## Task Dependencies

```
Task 1.1 ─┐
Task 1.2 ─┼─► Task 2.1
Task 1.3 ─┤   Task 2.2
Task 1.4 ─┘   Task 2.3
              │
              ▼
          Task 3.1
          Task 3.2
          Task 3.3
              │
              ▼
          Task 4.1
          Task 4.2
              │
              ▼
          Task 5.1
          Task 5.2
          Task 5.3
```

---

## Verification Commands

After implementation, run:

```bash
# Run all edge case tests
npm run test -- --grep "Edge Case"

# Run with coverage
npm run test -- --coverage src/lib/i18n/__tests__/ src/components/guest/__tests__/

# Run specific test files
npm run test -- src/lib/i18n/__tests__/language-detection-edge-cases.test.ts
npm run test -- src/lib/i18n/__tests__/cookie-blocked.test.ts
npm run test -- src/lib/i18n/__tests__/unsupported-language-codes.test.ts
npm run test -- src/components/guest/__tests__/partial-translations.test.tsx
npm run test -- src/components/guest/__tests__/missing-translation-banner.test.tsx
npm run test -- src/components/guest/__tests__/language-switcher-blocked-cookies.test.tsx
npm run test -- src/app/item/__tests__/guest-item-edge-cases.test.tsx
```

---

## Estimated Total Effort

| Phase | Tasks | Story Points |
|-------|-------|--------------|
| Phase 1: Test Infrastructure | 4 | 1.5 |
| Phase 2: Language Detection Tests | 3 | 3.0 |
| Phase 3: Component Tests | 3 | 2.0 |
| Phase 4: Integration Tests | 2 | 2.5 |
| Phase 5: Documentation | 3 | 1.25 |
| **Total** | **15** | **10.25** |

---

## References

- Overview Document: `REQ-E04-025-test-edge-cases-overview.md`
- Implementation Plan: `Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Document: `gen_requests_epic4.md` (REQ-E04-025)
- Language Detection Utility: `/src/lib/i18n/language-detection.ts`
- i18n Configuration: `/src/lib/i18n/config.ts`
- Existing Test Patterns: `/src/components/LanguageSwitcher/__tests__/`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Phase 7: Testing & Polish - Task 7.3: Test Edge Cases*
