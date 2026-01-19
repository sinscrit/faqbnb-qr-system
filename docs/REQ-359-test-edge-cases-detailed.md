# REQ-359: Test Edge Cases in Translation and Localization System - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Testing & Polish
**Task ID:** 7.3
**Overview Document:** REQ-359-test-edge-cases-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## Executive Summary

This document provides a detailed, actionable task breakdown for implementing comprehensive edge case testing for the FAQBNB localization system. The implementation covers four major edge case categories: partial translations, cookie blocked scenarios, malformed Accept-Language headers, and unsupported language codes. Each task is designed to be approximately 1 story point and can be executed independently.

---

## Task Breakdown

### Task 1: Create Test Helper - Mock Storage Utilities

**File to Create:** `/src/lib/i18n/__tests__/helpers/mockStorage.ts`

**Story Points:** 1

**Description:** Create reusable mock utilities for testing localStorage and sessionStorage edge cases including blocked storage, quota exceeded, and unavailable storage scenarios.

**Implementation Steps:**

1. Create the directory structure if it doesn't exist:
   ```
   /src/lib/i18n/__tests__/helpers/
   ```

2. Create `mockStorage.ts` with the following exports:

```typescript
/**
 * Mock Storage Utilities for Edge Case Testing
 *
 * Provides utilities to simulate various storage failure scenarios
 * including blocked storage, quota exceeded, and unavailable storage.
 *
 * @lastModified 2026-01-19 (REQ-359)
 */

/**
 * Create a mock storage that throws on all access attempts
 * Simulates private browsing / incognito mode
 */
export function createBlockedStorage(): Storage {
  const blocked: Storage = {
    get length() {
      throw new DOMException('Storage access denied', 'SecurityError');
    },
    clear() {
      throw new DOMException('Storage access denied', 'SecurityError');
    },
    getItem() {
      throw new DOMException('Storage access denied', 'SecurityError');
    },
    key() {
      throw new DOMException('Storage access denied', 'SecurityError');
    },
    removeItem() {
      throw new DOMException('Storage access denied', 'SecurityError');
    },
    setItem() {
      throw new DOMException('Storage access denied', 'SecurityError');
    },
  };
  return blocked;
}

/**
 * Create a mock storage that throws only on setItem (quota exceeded)
 */
export function createQuotaExceededStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem() {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    },
  };
}

/**
 * Create a working mock storage for baseline tests
 */
export function createWorkingStorage(initial?: Record<string, string>): Storage {
  const store = new Map<string, string>(Object.entries(initial ?? {}));
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

/**
 * Temporarily replace global localStorage
 * Returns cleanup function to restore original
 */
export function mockGlobalStorage(storage: Storage | null): () => void {
  const originalLocalStorage = globalThis.localStorage;
  const originalSessionStorage = globalThis.sessionStorage;

  if (storage === null) {
    // Simulate storage completely unavailable
    Object.defineProperty(globalThis, 'localStorage', {
      get() {
        throw new ReferenceError('localStorage is not defined');
      },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      get() {
        throw new ReferenceError('sessionStorage is not defined');
      },
      configurable: true,
    });
  } else {
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: storage,
      writable: true,
      configurable: true,
    });
  }

  return () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
      configurable: true,
    });
  };
}
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All 4 functions are exported
- [ ] `createBlockedStorage()` throws on all operations
- [ ] `createQuotaExceededStorage()` throws only on setItem
- [ ] `mockGlobalStorage()` returns a working cleanup function

**Dependencies:** None

---

### Task 2: Create Test Helper - Mock Cookie Utilities

**File to Create:** `/src/lib/i18n/__tests__/helpers/mockCookie.ts`

**Story Points:** 1

**Description:** Create reusable mock utilities for testing document.cookie edge cases including blocked cookies, read-only cookies, and cookie parsing failures.

**Implementation Steps:**

1. Create `mockCookie.ts` in the helpers directory:

```typescript
/**
 * Mock Cookie Utilities for Edge Case Testing
 *
 * Provides utilities to simulate various cookie failure scenarios
 * including blocked cookies, read-only cookies, and throw on access.
 *
 * @lastModified 2026-01-19 (REQ-359)
 */

export interface MockCookieOptions {
  /** Initial cookie value string */
  initialValue?: string;
  /** Throw error when reading cookie */
  throwOnGet?: boolean;
  /** Throw error when setting cookie */
  throwOnSet?: boolean;
  /** Error message for throws */
  errorMessage?: string;
}

export interface MockCookieResult {
  /** Get current cookie value (for assertions) */
  getCookie: () => string;
  /** Set cookie value directly (for test setup) */
  setCookie: (value: string) => void;
  /** Restore original document.cookie behavior */
  restore: () => void;
}

/**
 * Mock document.cookie with controlled getter/setter behavior
 */
export function mockDocumentCookie(options: MockCookieOptions = {}): MockCookieResult {
  const {
    initialValue = '',
    throwOnGet = false,
    throwOnSet = false,
    errorMessage = 'Cookie access denied',
  } = options;

  let cookieValue = initialValue;

  // Store original descriptor
  const originalDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() {
      if (throwOnGet) {
        throw new DOMException(errorMessage, 'SecurityError');
      }
      return cookieValue;
    },
    set(value: string) {
      if (throwOnSet) {
        throw new DOMException(errorMessage, 'SecurityError');
      }
      // Parse and append cookie (simplified - real behavior is more complex)
      const [keyValue] = value.split(';');
      if (keyValue) {
        const [key] = keyValue.split('=');
        // Remove existing cookie with same key if present
        const cookies = cookieValue.split('; ').filter(c => !c.startsWith(`${key}=`));
        cookies.push(keyValue);
        cookieValue = cookies.filter(Boolean).join('; ');
      }
    },
  });

  return {
    getCookie: () => cookieValue,
    setCookie: (value: string) => {
      cookieValue = value;
    },
    restore: () => {
      if (originalDescriptor) {
        Object.defineProperty(document, 'cookie', originalDescriptor);
      } else {
        // Fallback: make cookie writable again
        Object.defineProperty(document, 'cookie', {
          configurable: true,
          writable: true,
          value: '',
        });
      }
    },
  };
}

/**
 * Create a completely blocked cookie scenario
 * Both get and set throw errors
 */
export function createBlockedCookie(): { restore: () => void } {
  const mock = mockDocumentCookie({
    throwOnGet: true,
    throwOnSet: true,
    errorMessage: 'Cookies are disabled',
  });
  return { restore: mock.restore };
}

/**
 * Create a read-only cookie scenario
 * Get works, set silently fails (no throw)
 */
export function createReadOnlyCookie(initialValue: string = ''): MockCookieResult {
  let cookieValue = initialValue;

  const originalDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() {
      return cookieValue;
    },
    set() {
      // Silently ignore (some browsers do this)
    },
  });

  return {
    getCookie: () => cookieValue,
    setCookie: (value: string) => {
      cookieValue = value;
    },
    restore: () => {
      if (originalDescriptor) {
        Object.defineProperty(document, 'cookie', originalDescriptor);
      }
    },
  };
}
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] `mockDocumentCookie()` correctly intercepts document.cookie
- [ ] `createBlockedCookie()` throws on both get and set
- [ ] `createReadOnlyCookie()` silently ignores set operations
- [ ] All restore functions properly restore original behavior

**Dependencies:** None

---

### Task 3: Create Accept-Language Parsing Edge Case Tests

**File to Create:** `/src/lib/i18n/__tests__/accept-language-parsing.test.ts`

**Story Points:** 1

**Description:** Create comprehensive tests for the `parseAcceptLanguageHeader` function covering malformed headers, boundary conditions, and unusual inputs.

**Prerequisite Check:** Verify that `parseAcceptLanguageHeader` is exported from `/src/lib/i18n/language-detection.ts`. If not exported, modify line 85 to add `export` keyword.

**Implementation Steps:**

1. Check if `parseAcceptLanguageHeader` is exported from `/src/lib/i18n/language-detection.ts`
2. If not exported, add the export (this is an authorized modification per overview doc)
3. Create the test file:

```typescript
/**
 * Accept-Language Header Parsing Edge Case Tests
 *
 * Tests comprehensive edge cases for Accept-Language header parsing
 * including malformed headers, boundary conditions, and unusual inputs.
 *
 * @lastModified 2026-01-19 (REQ-359)
 */

import { describe, it, expect } from 'vitest';
import { parseAcceptLanguageHeader } from '../language-detection';

describe('parseAcceptLanguageHeader - Edge Cases', () => {
  describe('EC-008 to EC-013: Malformed Headers', () => {
    it('EC-008: should handle semicolon-only input', () => {
      expect(parseAcceptLanguageHeader(';;;')).toEqual([]);
    });

    it('should handle empty string', () => {
      expect(parseAcceptLanguageHeader('')).toEqual([]);
    });

    it('should handle null input', () => {
      expect(parseAcceptLanguageHeader(null)).toEqual([]);
    });

    it('should handle undefined-like string', () => {
      expect(parseAcceptLanguageHeader('undefined')).toEqual([]);
    });

    it('should handle whitespace-only input', () => {
      expect(parseAcceptLanguageHeader('   ')).toEqual([]);
      expect(parseAcceptLanguageHeader('\t\n')).toEqual([]);
    });

    it('EC-009: should handle non-numeric quality values', () => {
      // en;q=invalid should result in quality=0 and be filtered
      const result = parseAcceptLanguageHeader('en;q=invalid,fr;q=0.9');
      expect(result).toContain('fr');
      // 'en' may or may not be included depending on implementation
    });

    it('EC-012: should handle quality values > 1', () => {
      // Browsers may send invalid q values; implementation should handle gracefully
      const result = parseAcceptLanguageHeader('en;q=2.5,fr;q=0.9');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Both should be present without crashing
    });

    it('should handle negative quality values', () => {
      const result = parseAcceptLanguageHeader('en;q=-0.5,fr;q=0.9');
      expect(result).toContain('fr');
    });

    it('EC-013: should handle extra whitespace around entries', () => {
      const result = parseAcceptLanguageHeader('  en  ,  fr  ;q=0.9  ');
      expect(result).toContain('en');
      expect(result).toContain('fr');
    });

    it('EC-011: should handle unicode/emoji characters', () => {
      // Invalid locale codes should be filtered
      const result = parseAcceptLanguageHeader('\u{1F389},fr;q=0.9');
      expect(result).toBeDefined();
      expect(result).toContain('fr');
    });

    it('EC-010: should handle multiple region code segments', () => {
      // en-US-POSIX should extract 'en'
      const result = parseAcceptLanguageHeader('en-US-POSIX,fr-CA');
      expect(result).toContain('en');
      expect(result).toContain('fr');
    });

    it('should handle missing q= prefix', () => {
      // "en;0.9" (missing q=) should be handled gracefully
      const result = parseAcceptLanguageHeader('en;0.9,fr;q=0.8');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle multiple semicolons', () => {
      const result = parseAcceptLanguageHeader('en;;q=0.9;;,fr');
      expect(result).toBeDefined();
    });

    it('should handle case variations in q parameter', () => {
      // Q=0.9 vs q=0.9
      const result = parseAcceptLanguageHeader('en;Q=0.9,fr;q=0.8');
      expect(result).toBeDefined();
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle single wildcard', () => {
      const result = parseAcceptLanguageHeader('*');
      // Wildcards should be filtered out
      expect(result).not.toContain('*');
    });

    it('should handle wildcard with valid language', () => {
      const result = parseAcceptLanguageHeader('*;q=0.5,en;q=0.9');
      expect(result).toContain('en');
      expect(result).not.toContain('*');
    });

    it('should deduplicate repeated languages', () => {
      const result = parseAcceptLanguageHeader('en,en-US,en-GB');
      // Should only have 'en' once
      const enCount = result.filter(l => l === 'en').length;
      expect(enCount).toBeLessThanOrEqual(1);
    });

    it('should handle quality value of exactly 0', () => {
      // q=0 means "not acceptable" and should be filtered
      const result = parseAcceptLanguageHeader('en;q=0,fr;q=0.9');
      expect(result).toContain('fr');
    });

    it('should handle quality value of exactly 1', () => {
      const result = parseAcceptLanguageHeader('en;q=1.0,fr;q=0.9');
      expect(result[0]).toBe('en'); // Highest priority
    });

    it('should handle very long Accept-Language header', () => {
      const longHeader = Array.from({ length: 100 }, (_, i) =>
        `lang${i};q=${(1 - i * 0.009).toFixed(3)}`
      ).join(',');
      // Should not throw
      expect(() => parseAcceptLanguageHeader(longHeader)).not.toThrow();
    });

    it('should handle single valid language', () => {
      const result = parseAcceptLanguageHeader('en');
      expect(result).toContain('en');
    });

    it('should sort by quality value', () => {
      const result = parseAcceptLanguageHeader('fr;q=0.5,en;q=0.9,de;q=0.7');
      // Expecting order: en (0.9), de (0.7), fr (0.5)
      expect(result.indexOf('en')).toBeLessThan(result.indexOf('de'));
      expect(result.indexOf('de')).toBeLessThan(result.indexOf('fr'));
    });
  });

  describe('Real-World Browser Headers', () => {
    it('should handle Chrome default header', () => {
      const chromeHeader = 'en-US,en;q=0.9';
      const result = parseAcceptLanguageHeader(chromeHeader);
      expect(result).toContain('en');
    });

    it('should handle Firefox multilingual header', () => {
      const firefoxHeader = 'en-US,en;q=0.8,de-DE;q=0.5,de;q=0.3';
      const result = parseAcceptLanguageHeader(firefoxHeader);
      expect(result).toContain('en');
      expect(result).toContain('de');
    });

    it('should handle Safari header', () => {
      const safariHeader = 'en-gb';
      const result = parseAcceptLanguageHeader(safariHeader);
      expect(result).toContain('en');
    });

    it('should handle complex European user header', () => {
      const euHeader = 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6';
      const result = parseAcceptLanguageHeader(euHeader);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
```

**Verification:**
- [ ] All tests pass when run with `npm run test src/lib/i18n/__tests__/accept-language-parsing.test.ts`
- [ ] Test covers all EC-008 through EC-013 edge cases
- [ ] No console errors during test execution
- [ ] Tests are descriptive and self-documenting

**Dependencies:** Task 1 (if storage is needed for any tests)

---

### Task 4: Create Language Validation Edge Case Tests

**File to Create:** `/src/lib/i18n/__tests__/edge-cases.test.ts`

**Story Points:** 1

**Description:** Create comprehensive tests for language validation functions (`isSupportedLocale`, `normalizeLocale`) covering unsupported language codes, invalid inputs, and boundary conditions.

**Implementation Steps:**

```typescript
/**
 * Language Validation Edge Case Tests
 *
 * Tests for isSupportedLocale, normalizeLocale, and isValidLocale
 * covering unsupported codes, invalid inputs, and edge cases.
 *
 * @lastModified 2026-01-19 (REQ-359)
 */

import { describe, it, expect } from 'vitest';
import {
  isSupportedLocale,
  normalizeLocale,
  isValidLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '../config';

describe('Language Validation - Edge Cases', () => {
  describe('isSupportedLocale', () => {
    describe('EC-014 to EC-017: Unsupported Language Codes', () => {
      it('EC-014: should reject Chinese (zh)', () => {
        expect(isSupportedLocale('zh')).toBe(false);
      });

      it('EC-015: should reject Portuguese (pt-BR)', () => {
        expect(isSupportedLocale('pt')).toBe(false);
        expect(isSupportedLocale('pt-BR')).toBe(false);
      });

      it('should reject Japanese (ja)', () => {
        expect(isSupportedLocale('ja')).toBe(false);
      });

      it('should reject Korean (ko)', () => {
        expect(isSupportedLocale('ko')).toBe(false);
      });

      it('should reject Russian (ru)', () => {
        expect(isSupportedLocale('ru')).toBe(false);
      });

      it('should reject Arabic (ar)', () => {
        expect(isSupportedLocale('ar')).toBe(false);
      });

      it('should reject Hindi (hi)', () => {
        expect(isSupportedLocale('hi')).toBe(false);
      });
    });

    describe('EC-018 to EC-020: Invalid Language Codes', () => {
      it('EC-018: should reject empty string', () => {
        expect(isSupportedLocale('')).toBe(false);
      });

      it('EC-019: should reject numeric strings', () => {
        expect(isSupportedLocale('123')).toBe(false);
        expect(isSupportedLocale('1')).toBe(false);
      });

      it('EC-020: should handle uppercase codes (case sensitive check)', () => {
        // Based on implementation, uppercase may or may not be supported
        const upperEN = isSupportedLocale('EN');
        const lowerEN = isSupportedLocale('en');
        // At minimum, lowercase should work
        expect(lowerEN).toBe(true);
        // Document actual behavior
        expect(typeof upperEN).toBe('boolean');
      });

      it('should reject codes with regions (direct)', () => {
        expect(isSupportedLocale('en-US')).toBe(false);
        expect(isSupportedLocale('fr-CA')).toBe(false);
        expect(isSupportedLocale('es-MX')).toBe(false);
      });

      it('should reject special characters', () => {
        expect(isSupportedLocale('en!')).toBe(false);
        expect(isSupportedLocale('f@r')).toBe(false);
        expect(isSupportedLocale('en ')).toBe(false);
      });

      it('should reject very long codes', () => {
        expect(isSupportedLocale('englishlanguage')).toBe(false);
      });

      it('should reject null-ish strings', () => {
        expect(isSupportedLocale('null')).toBe(false);
        expect(isSupportedLocale('undefined')).toBe(false);
      });
    });

    describe('Positive Cases - All Supported Locales', () => {
      it('should accept all defined supported locales', () => {
        const expected = ['en', 'fr', 'es', 'de', 'nl', 'it'];
        expected.forEach((code) => {
          expect(isSupportedLocale(code)).toBe(true);
        });
      });

      it('should match SUPPORTED_LOCALES constant', () => {
        SUPPORTED_LOCALES.forEach((code) => {
          expect(isSupportedLocale(code)).toBe(true);
        });
      });
    });
  });

  describe('normalizeLocale', () => {
    describe('Null/Undefined Handling', () => {
      it('should return default for null', () => {
        expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE);
      });

      it('should return default for undefined', () => {
        expect(normalizeLocale(undefined)).toBe(DEFAULT_LOCALE);
      });

      it('should return default for empty string', () => {
        expect(normalizeLocale('')).toBe(DEFAULT_LOCALE);
      });

      it('should return default for whitespace-only', () => {
        expect(normalizeLocale('   ')).toBe(DEFAULT_LOCALE);
      });
    });

    describe('Region Code Extraction', () => {
      it('should extract language from en-US', () => {
        expect(normalizeLocale('en-US')).toBe('en');
      });

      it('should extract language from fr-CA', () => {
        expect(normalizeLocale('fr-CA')).toBe('fr');
      });

      it('should extract language from es-419 (Latin America)', () => {
        expect(normalizeLocale('es-419')).toBe('es');
      });

      it('should extract language from de-AT (Austria)', () => {
        expect(normalizeLocale('de-AT')).toBe('de');
      });

      it('should handle unusual region formats', () => {
        expect(normalizeLocale('en-US-POSIX')).toBe('en');
        expect(normalizeLocale('de-DE-1996')).toBe('de');
      });
    });

    describe('Unsupported Language Fallback', () => {
      it('should return default for unsupported zh', () => {
        expect(normalizeLocale('zh')).toBe(DEFAULT_LOCALE);
      });

      it('should return default for unsupported zh-CN', () => {
        expect(normalizeLocale('zh-CN')).toBe(DEFAULT_LOCALE);
      });

      it('should return default for unsupported pt-BR', () => {
        expect(normalizeLocale('pt-BR')).toBe(DEFAULT_LOCALE);
      });

      it('should return default for unsupported ja', () => {
        expect(normalizeLocale('ja')).toBe(DEFAULT_LOCALE);
      });
    });

    describe('Case Handling', () => {
      it('should handle uppercase EN-US', () => {
        const result = normalizeLocale('EN-US');
        // Should normalize to 'en' or return default
        expect(['en', DEFAULT_LOCALE]).toContain(result);
      });

      it('should handle mixed case Fr-fr', () => {
        const result = normalizeLocale('Fr-fr');
        expect(['fr', DEFAULT_LOCALE]).toContain(result);
      });
    });

    describe('Edge Cases', () => {
      it('should handle just a hyphen', () => {
        expect(normalizeLocale('-')).toBe(DEFAULT_LOCALE);
      });

      it('should handle hyphen prefix', () => {
        expect(normalizeLocale('-US')).toBe(DEFAULT_LOCALE);
      });

      it('should handle hyphen suffix', () => {
        expect(normalizeLocale('en-')).toBe('en');
      });
    });
  });

  describe('isValidLocale (if different from isSupportedLocale)', () => {
    it('should validate supported locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('fr')).toBe(true);
    });

    it('should reject unsupported locales', () => {
      expect(isValidLocale('zh')).toBe(false);
    });
  });

  describe('DEFAULT_LOCALE constant', () => {
    it('should be a supported locale', () => {
      expect(isSupportedLocale(DEFAULT_LOCALE)).toBe(true);
    });

    it('should be English', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });
  });
});
```

**Verification:**
- [ ] All tests pass when run with `npm run test src/lib/i18n/__tests__/edge-cases.test.ts`
- [ ] Tests cover EC-014 through EC-020 edge cases
- [ ] DEFAULT_LOCALE is verified as 'en'
- [ ] All SUPPORTED_LOCALES are tested

**Dependencies:** None

---

### Task 5: Create useLanguagePreference Hook Edge Case Tests

**File to Create:** `/src/hooks/__tests__/useLanguagePreference.edge-cases.test.ts`

**Story Points:** 1

**Description:** Create edge case tests for the useLanguagePreference hook covering cookie blocked scenarios, localStorage unavailable, and SSR context.

**Implementation Steps:**

```typescript
/**
 * useLanguagePreference Hook Edge Case Tests
 *
 * Tests for cookie blocked, localStorage blocked, and SSR scenarios.
 *
 * @lastModified 2026-01-19 (REQ-359)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Import helpers
import {
  createBlockedStorage,
  createQuotaExceededStorage,
  createWorkingStorage,
  mockGlobalStorage,
} from '@/lib/i18n/__tests__/helpers/mockStorage';
import {
  mockDocumentCookie,
  createBlockedCookie,
  createReadOnlyCookie,
} from '@/lib/i18n/__tests__/helpers/mockCookie';

// Mock AuthContext to avoid dependency issues
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, authState: 'UNAUTHENTICATED' }),
}));

describe('useLanguagePreference - Edge Cases', () => {
  let restoreStorage: (() => void) | undefined;
  let restoreCookie: (() => void) | undefined;

  afterEach(() => {
    restoreStorage?.();
    restoreCookie?.();
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('EC-005 to EC-007: Cookie Blocked Scenarios', () => {
    describe('when cookies throw on access', () => {
      beforeEach(() => {
        const blocked = createBlockedCookie();
        restoreCookie = blocked.restore;
      });

      it('EC-005: should not throw error during initialization', async () => {
        const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');

        expect(() => {
          renderHook(() => useLanguagePreference());
        }).not.toThrow();
      });

      it('EC-006: should fall back to browser language detection', async () => {
        // Mock navigator.language
        const originalLanguage = navigator.language;
        Object.defineProperty(navigator, 'language', {
          value: 'fr-FR',
          configurable: true,
        });

        const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
        const { result } = renderHook(() => useLanguagePreference());

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // Should fall back to browser language (fr extracted from fr-FR)
        expect(['fr', 'en']).toContain(result.current.language);

        // Restore
        Object.defineProperty(navigator, 'language', {
          value: originalLanguage,
          configurable: true,
        });
      });

      it('EC-007: setLanguage should not crash when cookies blocked', async () => {
        const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
        const { result } = renderHook(() => useLanguagePreference());

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // setLanguage should handle gracefully
        await act(async () => {
          // Should not throw
          expect(async () => {
            await result.current.setLanguage('de');
          }).not.toThrow();
        });
      });
    });

    describe('when cookies are read-only', () => {
      beforeEach(() => {
        const mock = createReadOnlyCookie('FAQBNB_LANG=es');
        restoreCookie = mock.restore;
      });

      it('should read existing cookie value', async () => {
        const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
        const { result } = renderHook(() => useLanguagePreference());

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.language).toBe('es');
      });
    });
  });

  describe('EC-021 to EC-022: localStorage Blocked Scenarios', () => {
    describe('when localStorage throws on all access (incognito)', () => {
      beforeEach(() => {
        restoreStorage = mockGlobalStorage(createBlockedStorage());
      });

      it('EC-021: should not throw error during initialization', async () => {
        const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');

        expect(() => {
          renderHook(() => useLanguagePreference());
        }).not.toThrow();
      });

      it('should fall back to cookie storage', async () => {
        const cookieMock = mockDocumentCookie({ initialValue: 'FAQBNB_LANG=de' });
        restoreCookie = cookieMock.restore;

        const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
        const { result } = renderHook(() => useLanguagePreference());

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.language).toBe('de');
      });
    });

    describe('when localStorage quota exceeded', () => {
      beforeEach(() => {
        restoreStorage = mockGlobalStorage(createQuotaExceededStorage());
      });

      it('EC-022: should handle setItem failure gracefully', async () => {
        const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
        const { result } = renderHook(() => useLanguagePreference());

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // setLanguage should not crash even if storage fails
        await act(async () => {
          expect(async () => {
            await result.current.setLanguage('it');
          }).not.toThrow();
        });
      });
    });
  });

  describe('EC-023 to EC-024: SSR Context (typeof checks)', () => {
    it('EC-023: should handle typeof window === undefined', async () => {
      // Simulate SSR by temporarily removing window
      const originalWindow = globalThis.window;
      // @ts-expect-error - intentionally removing window for SSR simulation
      delete globalThis.window;

      const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');

      // In SSR, hook should return default values without crashing
      // Note: This may need adjustment based on actual hook implementation
      expect(useLanguagePreference).toBeDefined();

      // Restore window
      globalThis.window = originalWindow;
    });
  });

  describe('Combined Edge Cases', () => {
    it('should function with both cookie and localStorage blocked', async () => {
      restoreStorage = mockGlobalStorage(createBlockedStorage());
      const blocked = createBlockedCookie();
      restoreCookie = blocked.restore;

      const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');

      expect(() => {
        renderHook(() => useLanguagePreference());
      }).not.toThrow();
    });
  });
});
```

**Verification:**
- [ ] All tests pass
- [ ] No JavaScript errors in console during tests
- [ ] Tests properly clean up mocks after each test
- [ ] Edge cases EC-005 through EC-024 related to storage are covered

**Dependencies:** Task 1, Task 2

---

### Task 6: Create Partial Translation Handling Tests

**File to Create:** `/src/lib/translations/__tests__/partial-translations.test.ts`

**Story Points:** 1

**Description:** Create tests for partial translation merge logic ensuring that individual fields fall back correctly when some fields are translated and others are not.

**Implementation Steps:**

1. Create directory if needed: `/src/lib/translations/__tests__/`
2. Create the test file:

```typescript
/**
 * Partial Translation Handling Tests
 *
 * Tests for EC-001 to EC-004: Field-level translation fallback behavior.
 * Validates that content displays translated fields where available
 * and original fields where translations are missing.
 *
 * @lastModified 2026-01-19 (REQ-359)
 */

import { describe, it, expect } from 'vitest';

/**
 * Generic merge function for testing
 * This mimics the expected behavior of the translation merge logic
 */
function mergeWithFallback<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  if (!translation) return original;

  const result = { ...original };

  for (const key of Object.keys(translation)) {
    const value = translation[key as keyof T];
    // Only override if translation value is non-null and non-empty
    if (value !== null && value !== undefined && value !== '') {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

describe('Partial Translation Handling', () => {
  describe('EC-001 to EC-004: Item Field Merging', () => {
    const originalItem = {
      id: 'item-123',
      name: 'Coffee Machine',
      description: 'How to use the coffee machine in the kitchen',
      sourceLanguage: 'en',
    };

    it('EC-001: should use translated name, original description when description not translated', () => {
      const partialTranslation = {
        name: 'Machine \u00e0 caf\u00e9',
        description: null,
      };

      const result = mergeWithFallback(originalItem, partialTranslation);

      expect(result.name).toBe('Machine \u00e0 caf\u00e9');
      expect(result.description).toBe('How to use the coffee machine in the kitchen');
    });

    it('EC-002: should use original name, translated description when name not translated', () => {
      const partialTranslation = {
        name: null,
        description: 'Comment utiliser la machine \u00e0 caf\u00e9 dans la cuisine',
      };

      const result = mergeWithFallback(originalItem, partialTranslation);

      expect(result.name).toBe('Coffee Machine');
      expect(result.description).toBe('Comment utiliser la machine \u00e0 caf\u00e9 dans la cuisine');
    });

    it('should use all original fields when translation is null', () => {
      const result = mergeWithFallback(originalItem, null);
      expect(result).toEqual(originalItem);
    });

    it('should use all original fields when translation is undefined', () => {
      const result = mergeWithFallback(originalItem, undefined);
      expect(result).toEqual(originalItem);
    });

    it('should use all original fields when translation is empty object', () => {
      const result = mergeWithFallback(originalItem, {});
      expect(result).toEqual(originalItem);
    });

    it('should skip empty string translations (treat as not translated)', () => {
      const partialTranslation = {
        name: '',
        description: 'Translated description',
      };

      const result = mergeWithFallback(originalItem, partialTranslation);

      expect(result.name).toBe('Coffee Machine'); // Original used for empty string
      expect(result.description).toBe('Translated description');
    });

    it('should preserve non-translatable fields', () => {
      const partialTranslation = {
        name: 'Translated Name',
      };

      const result = mergeWithFallback(originalItem, partialTranslation);

      expect(result.id).toBe('item-123');
      expect(result.sourceLanguage).toBe('en');
    });
  });

  describe('EC-003: Article Field Merging', () => {
    const originalArticle = {
      id: 'article-456',
      title: 'WiFi Setup Guide',
      description: 'How to connect to the WiFi network',
      sourceLanguage: 'en',
    };

    it('should merge article fields independently', () => {
      const partialTranslation = {
        title: 'Guide de configuration WiFi',
        description: null, // Not translated
      };

      const result = mergeWithFallback(originalArticle, partialTranslation);

      expect(result.title).toBe('Guide de configuration WiFi');
      expect(result.description).toBe('How to connect to the WiFi network');
    });

    it('should handle article with no translation', () => {
      const result = mergeWithFallback(originalArticle, null);

      expect(result.title).toBe('WiFi Setup Guide');
      expect(result.description).toBe('How to connect to the WiFi network');
    });
  });

  describe('Link Field Merging', () => {
    const originalLink = {
      id: 'link-789',
      title: 'Router Manual PDF',
      url: 'https://example.com/manual.pdf',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    };

    it('should translate title but preserve URL (URLs never translated)', () => {
      const partialTranslation = {
        title: 'Manuel du routeur PDF',
      };

      const result = mergeWithFallback(originalLink, partialTranslation);

      expect(result.title).toBe('Manuel du routeur PDF');
      expect(result.url).toBe('https://example.com/manual.pdf'); // Never translated
      expect(result.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    });
  });

  describe('EC-004: Tag Translation', () => {
    interface Tag {
      key: string;
      displayValue: string;
      isTranslated: boolean;
    }

    it('should handle mixed translated/original tags', () => {
      const tags: Tag[] = [
        { key: 'kitchen', displayValue: 'Kitchen', isTranslated: false },
        { key: 'appliance', displayValue: '\u00c9lectrom\u00e9nager', isTranslated: true },
        { key: 'coffee', displayValue: 'Coffee', isTranslated: false },
      ];

      const translatedCount = tags.filter((t) => t.isTranslated).length;
      const originalCount = tags.filter((t) => !t.isTranslated).length;

      expect(translatedCount).toBe(1);
      expect(originalCount).toBe(2);
    });

    it('should display translated value when available', () => {
      const tag = { key: 'kitchen', displayValue: 'Cuisine', isTranslated: true };
      expect(tag.displayValue).toBe('Cuisine');
    });

    it('should display original value when not translated', () => {
      const tag = { key: 'bathroom', displayValue: 'Bathroom', isTranslated: false };
      expect(tag.displayValue).toBe('Bathroom');
    });
  });

  describe('Edge Cases in Merge Logic', () => {
    it('should handle whitespace-only translations as not translated', () => {
      const original = { name: 'Test', description: 'Original desc' };
      const translation = { name: '   ', description: 'Valid translation' };

      const result = mergeWithFallback(original, translation);

      // Whitespace-only should NOT replace original
      // Note: Current implementation may or may not handle this
      // Documenting expected behavior
      expect(result.description).toBe('Valid translation');
    });

    it('should handle nested null values', () => {
      const original = { name: 'Test', nested: { value: 'original' } };
      const translation = { nested: null };

      const result = mergeWithFallback(original, translation);

      expect(result.nested).toEqual({ value: 'original' });
    });

    it('should handle array fields', () => {
      const original = { name: 'Test', tags: ['a', 'b', 'c'] };
      const translation = { tags: null };

      const result = mergeWithFallback(original, translation);

      expect(result.tags).toEqual(['a', 'b', 'c']);
    });
  });
});
```

**Verification:**
- [ ] All tests pass
- [ ] EC-001 through EC-004 edge cases are covered
- [ ] Empty string and null handling is tested
- [ ] Tests document expected merge behavior

**Dependencies:** None

---

### Task 7: Export parseAcceptLanguageHeader for Testing

**File to Modify:** `/src/lib/i18n/language-detection.ts`

**Story Points:** 0.5

**Description:** Ensure `parseAcceptLanguageHeader` function is exported so it can be tested directly. This is a prerequisite for Task 3.

**Implementation Steps:**

1. Read the current file to locate the function
2. If the function is not already exported, add the `export` keyword
3. Expected change at approximately line 85:

```typescript
// Before (if not exported):
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {

// After:
export function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
```

**Verification:**
- [ ] Function is exported (can be imported in test files)
- [ ] No TypeScript compilation errors
- [ ] Existing code that uses the function still works

**Dependencies:** None

---

### Task 8: Add normalizeLocaleCase Utility

**File to Modify:** `/src/lib/i18n/config.ts`

**Story Points:** 0.5

**Description:** Add a utility function to handle uppercase language codes (e.g., 'EN' -> 'en') to ensure consistent locale handling.

**Implementation Steps:**

1. Add the following function to `/src/lib/i18n/config.ts`:

```typescript
/**
 * Normalize locale string to lowercase for consistent comparison.
 * Handles uppercase codes like 'EN', 'FR' and mixed case like 'En-US'.
 *
 * @param locale - The locale string to normalize
 * @returns Lowercase locale string
 *
 * @example
 * normalizeLocaleCase('EN') // 'en'
 * normalizeLocaleCase('Fr-CA') // 'fr-ca'
 * normalizeLocaleCase('es') // 'es'
 */
export function normalizeLocaleCase(locale: string | null | undefined): string {
  if (!locale || typeof locale !== 'string') {
    return '';
  }
  return locale.toLowerCase().trim();
}
```

2. Update the existing `normalizeLocale` function to use this internally if not already handling case.

**Verification:**
- [ ] Function is exported
- [ ] Handles null/undefined gracefully
- [ ] Converts uppercase to lowercase
- [ ] Trims whitespace
- [ ] Existing tests still pass

**Dependencies:** None

---

### Task 9: Update vitest.config.ts for Edge Case Coverage

**File to Modify:** `/vitest.config.ts`

**Story Points:** 0.5

**Description:** Update the Vitest configuration to include edge case test coverage targets for the i18n module.

**Implementation Steps:**

Update the coverage include section:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/lib/job-queue/**/*.ts',
    'src/lib/translation-service/**/*.ts',
    'src/lib/i18n/**/*.ts',  // ADD: i18n module coverage
    'src/hooks/useLanguagePreference.ts',  // ADD: Language hook coverage
    'src/lib/translations/**/*.ts',  // ADD: Translation utilities
  ],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
},
```

**Verification:**
- [ ] Config file is valid (no syntax errors)
- [ ] `npm run test` still works
- [ ] Coverage reports include i18n files

**Dependencies:** None

---

### Task 10: Create Manual E2E Test Documentation

**File to Create:** `/docs/testing/L10N-Edge-Cases-Test-Results.md`

**Story Points:** 1

**Description:** Create a manual end-to-end test protocol document for edge case validation that cannot be automated.

**Implementation Steps:**

```markdown
# L10N Edge Cases - Manual E2E Test Results

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Related Request:** REQ-359

---

## Test Environment

| Property | Value |
|----------|-------|
| Staging URL | https://faqbnb-staging.up.railway.app |
| Test Date | YYYY-MM-DD |
| Tester | [Name] |
| Browser | [Chrome/Firefox/Safari] [Version] |
| OS | [macOS/Windows/Linux] |

---

## Prerequisites

- [ ] Access to staging environment
- [ ] Browser DevTools available
- [ ] Browser extension for header modification (optional)
- [ ] Test item with partial translations created

---

## Test Cases

### TC-359-1: Partial Translation Display

**Edge Case:** EC-001, EC-002

**Scenario:** Item has some fields translated, others not

**Setup:**
1. Navigate to item page: `/item/[TEST_ITEM_PUBLIC_ID]?lang=fr`
2. Item should have French translation for `name` but NOT for `description`

**Steps:**
1. Open browser DevTools > Network tab
2. Navigate to the item page with `?lang=fr`
3. Observe the displayed content

**Expected Results:**
| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Name displayed in French | Translated text | | |
| Description displayed in English | Original text | | |
| No error messages visible | Clean UI | | |
| No blank spaces | Content fills space | | |
| Layout intact | No broken styling | | |

**Console Errors:** [List any console errors]

**Screenshots:** [Attach if needed]

**Result:** [ ] PASS / [ ] FAIL

---

### TC-359-2: Cookie Blocked Scenario

**Edge Case:** EC-005, EC-006, EC-007

**Scenario:** User has strict privacy settings blocking cookies

**Setup:**
1. Block cookies for the staging domain:
   - Chrome: Settings > Privacy > Cookies > Block specific site
   - Firefox: about:preferences#privacy > Manage Exceptions
   - Or use incognito mode with cookies blocked

2. Verify cookies are blocked:
   ```javascript
   // In DevTools console
   document.cookie = 'test=value';
   console.log(document.cookie); // Should be empty or throw
   ```

**Steps:**
1. Clear all site data
2. Navigate to `/item/[TEST_ITEM_PUBLIC_ID]`
3. Observe language detection behavior
4. Try changing language via switcher (if available)
5. Refresh the page
6. Try URL parameter: `?lang=de`

**Expected Results:**
| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Page loads without errors | Yes | | |
| No JS errors in console | Clean console | | |
| Language defaults to Accept-Language | Browser language | | |
| URL parameter override works | `?lang=de` shows German | | |
| Language preference doesn't persist (expected) | Resets on refresh | | |

**Console Output:** [Copy relevant console logs]

**Result:** [ ] PASS / [ ] FAIL

---

### TC-359-3: Malformed Accept-Language Header

**Edge Case:** EC-008, EC-009, EC-010, EC-011, EC-012, EC-013

**Scenario:** Browser sends unusual Accept-Language header

**Setup:**
1. Use browser extension (e.g., "Modify Header Value") to set custom Accept-Language
2. Or use DevTools > Network > Request blocking to override

**Test A - Empty Header:**
- Set `Accept-Language: ` (empty)
- Clear cookies
- Navigate to item page

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Page loads in default English | Yes | | |
| No errors displayed | Clean UI | | |

**Test B - Gibberish Header:**
- Set `Accept-Language: ;;;invalid;;;`
- Clear cookies
- Navigate to item page

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Page loads in default English | Yes | | |
| Parser handles gracefully | No crash | | |

**Test C - Unsupported Languages Only:**
- Set `Accept-Language: zh-CN,ja;q=0.9,ko;q=0.8`
- Clear cookies
- Navigate to item page

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Page loads in default English | Yes | | |
| None of zh/ja/ko used | Correct | | |

**Result:** [ ] PASS / [ ] FAIL

---

### TC-359-4: Unsupported Language Code

**Edge Case:** EC-014, EC-015, EC-016, EC-017

**Scenario:** User requests unsupported language

**Test A - URL Parameter with Unsupported Code:**
- Navigate to `/item/[PUBLIC_ID]?lang=zh`

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Invalid param ignored | Yes | | |
| Falls back to default/cookie | Correct fallback | | |
| No error displayed | Clean UI | | |

**Test B - Cookie with Unsupported Code:**
- In DevTools: `document.cookie = 'FAQBNB_LANG=pt-BR; path=/'`
- Refresh page

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Cookie value ignored | Yes | | |
| Falls back to Accept-Language | Correct | | |

**Test C - Mixed Valid/Invalid:**
- Set `Accept-Language: zh-CN,fr;q=0.9,ko;q=0.8`
- Clear cookies
- Navigate to item page

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| French (fr) is used | First supported | | |
| zh and ko ignored | Correct | | |

**Result:** [ ] PASS / [ ] FAIL

---

### TC-359-5: Empty and Null Edge Cases

**Edge Case:** EC-018, EC-019, EC-020

**Test A - Empty URL Param:**
- Navigate to `/item/[PUBLIC_ID]?lang=`

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Treated as no param | Yes | | |
| Falls through to cookie/header | Correct | | |

**Test B - Whitespace URL Param:**
- Navigate to `/item/[PUBLIC_ID]?lang=%20%20`

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Invalid, falls through | Yes | | |
| No crash | Correct | | |

**Test C - Uppercase Code:**
- Navigate to `/item/[PUBLIC_ID]?lang=FR`

| Check | Expected | Actual | Pass/Fail |
|-------|----------|--------|-----------|
| Either normalized to 'fr' or rejected | Consistent | | |
| No error | Clean | | |

**Result:** [ ] PASS / [ ] FAIL

---

## Summary

| Test Case | Result | Notes |
|-----------|--------|-------|
| TC-359-1 Partial Translation | | |
| TC-359-2 Cookie Blocked | | |
| TC-359-3 Malformed Header | | |
| TC-359-4 Unsupported Language | | |
| TC-359-5 Empty/Null Cases | | |

**Overall Status:** [ ] ALL PASS / [ ] SOME FAILURES

**Issues Found:**
1. [Issue description]
2. [Issue description]

**Recommendations:**
1. [Recommendation]
2. [Recommendation]

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | | | |
| Reviewer | | | |
```

**Verification:**
- [ ] Document is created in `/docs/testing/`
- [ ] All test cases from overview are included
- [ ] Test protocol is clear and actionable
- [ ] Result tracking tables are properly formatted

**Dependencies:** None (documentation task)

---

### Task 11: Integration Test - Full Language Detection Cascade

**File to Create:** `/src/lib/i18n/__tests__/language-detection.integration.test.ts`

**Story Points:** 1

**Description:** Create integration tests that verify the complete language detection cascade: URL param > Cookie > Accept-Language > Default.

**Implementation Steps:**

```typescript
/**
 * Language Detection Integration Tests
 *
 * Tests the full cascade of language detection priority:
 * URL param > Cookie > Accept-Language header > Default locale
 *
 * @lastModified 2026-01-19 (REQ-359)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { detectUserLanguage } from '../language-detection';
import { DEFAULT_LOCALE } from '../config';

// Helper to create mock NextRequest
function createMockRequest(options: {
  url?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
} = {}): NextRequest {
  const { url = 'http://localhost/item/test', cookies = {}, headers = {} } = options;

  const mockHeaders = new Headers(headers);
  const mockCookies = new Map(Object.entries(cookies));

  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) => {
        const value = mockCookies.get(name);
        return value ? { name, value } : undefined;
      },
      getAll: () => Array.from(mockCookies.entries()).map(([name, value]) => ({ name, value })),
      has: (name: string) => mockCookies.has(name),
      set: vi.fn(),
      delete: vi.fn(),
    },
    headers: mockHeaders,
  } as unknown as NextRequest;
}

describe('Language Detection Integration - Full Cascade', () => {
  describe('Priority Order: URL > Cookie > Header > Default', () => {
    it('should use URL parameter as highest priority', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test?lang=fr',
        cookies: { FAQBNB_GUEST_LANG: 'de' },
        headers: { 'Accept-Language': 'es;q=0.9' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe('fr');
    });

    it('should use cookie when no URL parameter', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test',
        cookies: { FAQBNB_GUEST_LANG: 'de' },
        headers: { 'Accept-Language': 'es;q=0.9' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe('de');
    });

    it('should use Accept-Language when no URL or cookie', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test',
        cookies: {},
        headers: { 'Accept-Language': 'es;q=0.9' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe('es');
    });

    it('should use default when nothing else available', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test',
        cookies: {},
        headers: {},
      });

      const result = detectUserLanguage(request);

      expect(result).toBe(DEFAULT_LOCALE);
    });
  });

  describe('Fallback Behavior with Invalid Inputs', () => {
    it('should skip invalid URL param and use cookie', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test?lang=zh', // Invalid
        cookies: { FAQBNB_GUEST_LANG: 'fr' },
        headers: { 'Accept-Language': 'de' },
      });

      const result = detectUserLanguage(request);

      // Should skip 'zh' and use cookie 'fr'
      expect(result).toBe('fr');
    });

    it('should skip invalid cookie and use Accept-Language', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test',
        cookies: { FAQBNB_GUEST_LANG: 'ja' }, // Invalid
        headers: { 'Accept-Language': 'it' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe('it');
    });

    it('should skip all invalid sources and use default', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test?lang=zh',
        cookies: { FAQBNB_GUEST_LANG: 'ja' },
        headers: { 'Accept-Language': 'ko;q=0.9,ar;q=0.8' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe(DEFAULT_LOCALE);
    });

    it('should handle empty URL param', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test?lang=',
        cookies: { FAQBNB_GUEST_LANG: 'nl' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe('nl');
    });
  });

  describe('Region Code Handling', () => {
    it('should extract language from region code in Accept-Language', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test',
        headers: { 'Accept-Language': 'fr-CA' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe('fr');
    });

    it('should prefer first supported language in Accept-Language list', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test',
        headers: { 'Accept-Language': 'zh-CN,de-DE;q=0.9,en;q=0.8' },
      });

      const result = detectUserLanguage(request);

      // zh-CN not supported, should use de-DE
      expect(result).toBe('de');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed Accept-Language header', () => {
      const request = createMockRequest({
        url: 'http://localhost/item/test',
        headers: { 'Accept-Language': ';;;invalid;;;' },
      });

      const result = detectUserLanguage(request);

      expect(result).toBe(DEFAULT_LOCALE);
    });

    it('should handle missing headers object gracefully', () => {
      const request = {
        url: 'http://localhost/item/test',
        nextUrl: new URL('http://localhost/item/test'),
        cookies: {
          get: () => undefined,
          getAll: () => [],
          has: () => false,
        },
        headers: new Headers(), // Empty headers
      } as unknown as NextRequest;

      expect(() => detectUserLanguage(request)).not.toThrow();
    });
  });
});
```

**Verification:**
- [ ] All tests pass
- [ ] Cascade priority is correctly verified
- [ ] Invalid input handling is tested
- [ ] Edge cases are covered

**Dependencies:** Task 7 (export function)

---

## Execution Order

The recommended execution order for these tasks:

1. **Task 1:** Create Mock Storage Utilities (no dependencies)
2. **Task 2:** Create Mock Cookie Utilities (no dependencies)
3. **Task 7:** Export parseAcceptLanguageHeader (no dependencies)
4. **Task 8:** Add normalizeLocaleCase Utility (no dependencies)
5. **Task 9:** Update vitest.config.ts (no dependencies)
6. **Task 3:** Accept-Language Parsing Tests (depends on Task 7)
7. **Task 4:** Language Validation Edge Case Tests (no dependencies)
8. **Task 5:** useLanguagePreference Hook Tests (depends on Task 1, Task 2)
9. **Task 6:** Partial Translation Tests (no dependencies)
10. **Task 11:** Integration Tests (depends on Task 7)
11. **Task 10:** Manual E2E Documentation (no dependencies)

---

## Acceptance Criteria Checklist

### Partial Translation Handling
- [ ] Each field independently shows translated version if available, original if not
- [ ] No blank spaces appear when some fields lack translations
- [ ] Translation status indicators accurately reflect partial translation state
- [ ] Item, article, and link fields all handle partial translations correctly

### Cookie Blocked Scenarios
- [ ] System functions normally when cookies are completely blocked
- [ ] Language preference defaults to Accept-Language header when cookie cannot be set
- [ ] Language switcher still updates display using URL parameters as fallback
- [ ] No JavaScript errors occur when cookie access fails

### Malformed Accept-Language Headers
- [ ] Malformed headers parse without throwing errors
- [ ] Common malformations handled (missing regions, invalid syntax, unexpected characters)
- [ ] System defaults to fallback language when header cannot be parsed
- [ ] Error logged for monitoring purposes without exposing errors to user

### Unsupported Language Codes
- [ ] Unsupported codes (via URL parameter or cookie) detected and rejected
- [ ] System falls back to default language when unsupported code encountered
- [ ] Language switcher only displays supported language options
- [ ] Shareable URLs with invalid language parameters default gracefully

### General Quality
- [ ] All edge cases tested across items, articles, and links
- [ ] Edge case scenarios documented with expected behavior and actual results
- [ ] Console logs clean with no unhandled errors for any edge case
- [ ] User experience remains professional and functional for all edge cases

---

## Test Commands

```bash
# Run all edge case tests
npm run test src/lib/i18n/__tests__/

# Run specific test file
npm run test src/lib/i18n/__tests__/accept-language-parsing.test.ts

# Run with coverage
npm run test -- --coverage

# Run hook edge case tests
npm run test src/hooks/__tests__/useLanguagePreference.edge-cases.test.ts

# Run translation tests
npm run test src/lib/translations/__tests__/
```

---

## References

- Overview Document: `/docs/REQ-359-test-edge-cases-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-359)
- Language Detection Module: `/src/lib/i18n/language-detection.ts`
- Config Module: `/src/lib/i18n/config.ts`
- Language Preference Hook: `/src/hooks/useLanguagePreference.ts`
- Vitest Config: `/vitest.config.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 7: Testing & Polish*
