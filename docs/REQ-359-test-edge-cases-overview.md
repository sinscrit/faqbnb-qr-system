# REQ-359: Test Edge Cases in Translation and Localization System - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Testing & Polish
**Task ID:** 7.3
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## 1. Summary

This request focuses on validating that the localization system handles edge cases gracefully, ensuring production-ready resilience across partial translations, blocked cookies, malformed Accept-Language headers, and unsupported language codes. The implementation requires comprehensive test scenarios to verify graceful degradation and error handling.

### Edge Case Categories:
1. **Partial Translations** - Some fields translated, others missing
2. **Cookie Blocked** - Privacy settings prevent cookie storage
3. **Malformed Headers** - Invalid Accept-Language syntax
4. **Unsupported Languages** - Language codes outside supported list

---

## 2. Current State Analysis

### Existing Implementation

**`/src/lib/i18n/language-detection.ts`**:
- `parseAcceptLanguageHeader()` - Parses Accept-Language headers (lines 85-122)
- `detectUserLanguage()` - Main detection function with priority cascade (lines 176-214)
- Current behavior: Returns `DEFAULT_LOCALE` ('en') for invalid/unsupported codes
- Quality value parsing: Sets `quality: 0` for `NaN` values (line 104)
- Filters out wildcards and empty locales (line 108)

**`/src/lib/i18n/config.ts`**:
- `isSupportedLocale()` / `isValidLocale()` - Type guards for validation (lines 140-160)
- `normalizeLocale()` - Handles region codes (e.g., 'en-US' → 'en') (lines 168-185)
- Supported locales: `['en', 'fr', 'es', 'de', 'nl', 'it']`

**`/src/hooks/useLanguagePreference.ts`**:
- `getLanguageFromCookie()` - Cookie parsing with validation (lines 66-77)
- `getStoredLanguage()` - localStorage with try-catch (lines 85-97)
- `detectBrowserLanguage()` - navigator.language handling (lines 118-133)
- Error handling: Logs warnings but doesn't throw (lines 94, 108)

**`/src/contexts/LocaleContext.tsx`**:
- Handles initialization failures gracefully
- Falls back to DEFAULT_LOCALE on any error

### Gap Analysis

| Edge Case | Current Handling | Test Coverage | Required Action |
|-----------|------------------|---------------|-----------------|
| Partial translations (field-level) | Not implemented | ❌ None | ⚠️ Implement COALESCE logic & test |
| Cookie blocked by browser | Fallback to header detection | ❌ None | ✅ Add tests |
| Malformed Accept-Language | Filters invalid entries | ❌ None | ✅ Add tests |
| Unsupported language code | Falls back to default | ❌ None | ✅ Add tests |
| Empty string language code | Falls back to default | ❌ None | ✅ Add tests |
| null/undefined language | Falls back to default | ✅ Covered | ✅ Verify |
| localStorage unavailable | Try-catch fallback | ❌ None | ✅ Add tests |
| document.cookie unavailable (SSR) | typeof check | ❌ None | ✅ Add tests |

---

## 3. Implementation Approach

### 3.1 Test Categories

The implementation creates comprehensive tests organized by edge case type:

1. **Partial Translation Tests** - Validate field-level fallback behavior
2. **Storage Blocked Tests** - Cookie and localStorage unavailability
3. **Header Parsing Tests** - Malformed Accept-Language handling
4. **Validation Tests** - Unsupported/invalid language codes

### 3.2 Test Strategy

| Test Type | Location | Purpose |
|-----------|----------|---------|
| Unit Tests | `/src/lib/i18n/__tests__/edge-cases.test.ts` | Pure function validation |
| Hook Tests | `/src/hooks/__tests__/useLanguagePreference.edge-cases.test.ts` | Client-side edge cases |
| Integration Tests | `/src/lib/i18n/__tests__/language-detection.integration.test.ts` | Full cascade behavior |
| Manual E2E | `/docs/testing/L10N-Edge-Cases-Test-Results.md` | Browser behavior validation |

### 3.3 Edge Case Test Matrix

| Test ID | Category | Input | Expected Behavior | Priority |
|---------|----------|-------|-------------------|----------|
| EC-001 | Partial Translation | Item with `name` translated, `description` null | Show translated name, original description | Critical |
| EC-002 | Partial Translation | Item with only `description` translated | Show original name, translated description | Critical |
| EC-003 | Partial Translation | Article with no links translated | Show translated article, original links | High |
| EC-004 | Partial Translation | Tags partially translated | Mixed translated/original tags | High |
| EC-005 | Cookie Blocked | `document.cookie = ""` throws | Fall through to Accept-Language | Critical |
| EC-006 | Cookie Blocked | Cookie cannot be set | URL param or header detection still works | Critical |
| EC-007 | Cookie Blocked | Cookie read returns undefined | Graceful fallback, no error | High |
| EC-008 | Malformed Header | `;;;` (only semicolons) | Returns empty array, use default | High |
| EC-009 | Malformed Header | `en;q=invalid` (non-numeric quality) | Treats as q=0, skips entry | Medium |
| EC-010 | Malformed Header | `en-US-EXTRA-REGION` (extra segments) | Extracts 'en' correctly | Medium |
| EC-011 | Malformed Header | `🎉🇫🇷;q=0.9` (emoji/unicode) | Filters out invalid, use next valid | Low |
| EC-012 | Malformed Header | `en,fr;q=2.5` (quality > 1) | Accept value as-is (browser sends it) | Low |
| EC-013 | Malformed Header | ` en , fr ` (extra whitespace) | Trims correctly, returns ['en', 'fr'] | Medium |
| EC-014 | Unsupported Lang | `zh` (Chinese) | Falls back to default 'en' | Critical |
| EC-015 | Unsupported Lang | `pt-BR` (Portuguese) | Falls back to default 'en' | Critical |
| EC-016 | Unsupported Lang | `?lang=ja` in URL | Ignores invalid, use next source | Critical |
| EC-017 | Unsupported Lang | Cookie value `zh-CN` | Ignores invalid, use Accept-Language | High |
| EC-018 | Invalid Lang | `?lang=` (empty string) | Treated as no param, use next source | High |
| EC-019 | Invalid Lang | `?lang=123` (numeric) | Invalid, fall through | Medium |
| EC-020 | Invalid Lang | `?lang=EN` (uppercase) | Normalize to lowercase, use 'en' | Medium |
| EC-021 | localStorage | Storage unavailable (incognito) | Graceful fallback to cookie/browser | High |
| EC-022 | localStorage | Storage quota exceeded | Catch error, continue without storage | Medium |
| EC-023 | SSR Context | typeof window === 'undefined' | Return default locale | Critical |
| EC-024 | SSR Context | typeof document === 'undefined' | Skip cookie operations | Critical |

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/__tests__/edge-cases.test.ts` | Edge case unit tests for i18n utilities |
| `/src/lib/i18n/__tests__/accept-language-parsing.test.ts` | Comprehensive Accept-Language header parsing tests |
| `/src/hooks/__tests__/useLanguagePreference.edge-cases.test.ts` | Edge case tests for language preference hook |
| `/src/lib/i18n/__tests__/helpers/mockStorage.ts` | Mock localStorage/sessionStorage utilities |
| `/src/lib/i18n/__tests__/helpers/mockCookie.ts` | Mock document.cookie utilities |
| `/docs/testing/L10N-Edge-Cases-Test-Results.md` | Manual E2E test results documentation |

### 4.2 Files to MODIFY

| File Path | Changes | Lines Affected |
|-----------|---------|----------------|
| `/src/lib/i18n/language-detection.ts` | Export `parseAcceptLanguageHeader` for testing | Line 85 (change to export) |
| `/src/lib/i18n/config.ts` | Add `normalizeLocaleCase()` for uppercase handling | ~10 new lines |
| `/vitest.config.ts` | Add edge case test coverage targets | 5-10 lines |

### 4.3 Functions to TEST (Existing)

```typescript
// /src/lib/i18n/language-detection.ts
parseAcceptLanguageHeader(acceptLanguage: string | null): string[]
getLocaleFromCookie(request: NextRequest, cookieName?: string): SupportedLocale | null
detectUserLanguage(request: NextRequest, user?: UserLocalePreference | null, options?: DetectLanguageOptions): SupportedLocale

// /src/lib/i18n/config.ts
isSupportedLocale(locale: string): locale is SupportedLocale
isValidLocale(locale: string): locale is SupportedLocale
normalizeLocale(locale: string | null | undefined): SupportedLocale

// /src/hooks/useLanguagePreference.ts
getLanguageFromCookie(): SupportedLanguage | null
getStoredLanguage(): SupportedLanguage | null
setStoredLanguage(language: SupportedLanguage): void
setLanguageCookie(language: SupportedLanguage): void
detectBrowserLanguage(): SupportedLanguage
isSupportedLanguage(value: unknown): value is SupportedLanguage
```

### 4.4 Functions to CREATE (Test Helpers)

```typescript
// /src/lib/i18n/__tests__/helpers/mockStorage.ts

/**
 * Create a mock localStorage that throws on access (simulating private browsing).
 */
export function createBlockedStorage(): Storage;

/**
 * Create a mock localStorage that throws on setItem (quota exceeded).
 */
export function createQuotaExceededStorage(): Storage;

/**
 * Temporarily replace global localStorage.
 * Returns cleanup function.
 */
export function mockGlobalStorage(storage: Storage | null): () => void;
```

```typescript
// /src/lib/i18n/__tests__/helpers/mockCookie.ts

/**
 * Mock document.cookie with controlled getter/setter behavior.
 */
export function mockDocumentCookie(options: {
  initialValue?: string;
  throwOnGet?: boolean;
  throwOnSet?: boolean;
}): {
  getCookie: () => string;
  restore: () => void;
};

/**
 * Create a blocked cookie scenario (throws on access).
 */
export function createBlockedCookie(): { restore: () => void };
```

---

## 5. Test Implementation Details

### 5.1 Accept-Language Parsing Edge Cases

```typescript
// /src/lib/i18n/__tests__/accept-language-parsing.test.ts

import { describe, it, expect } from 'vitest';
import { parseAcceptLanguageHeader } from '../language-detection';

describe('parseAcceptLanguageHeader - Edge Cases', () => {
  describe('malformed headers', () => {
    it('should handle semicolon-only input', () => {
      expect(parseAcceptLanguageHeader(';;;')).toEqual([]);
    });

    it('should handle empty string', () => {
      expect(parseAcceptLanguageHeader('')).toEqual([]);
    });

    it('should handle whitespace-only input', () => {
      expect(parseAcceptLanguageHeader('   ')).toEqual([]);
    });

    it('should handle non-numeric quality values', () => {
      // en;q=invalid should be filtered out (quality becomes NaN → 0)
      const result = parseAcceptLanguageHeader('en;q=invalid,fr;q=0.9');
      expect(result).toEqual(['fr']);
    });

    it('should handle quality values > 1', () => {
      // Browsers may send invalid q values; accept them as-is
      const result = parseAcceptLanguageHeader('en;q=2.5,fr;q=0.9');
      // en has higher q (2.5) so should come first
      expect(result[0]).toBe('en');
    });

    it('should handle negative quality values', () => {
      // Negative q should be filtered (q > 0 check)
      const result = parseAcceptLanguageHeader('en;q=-0.5,fr;q=0.9');
      expect(result).toEqual(['fr']);
    });

    it('should handle extra whitespace around entries', () => {
      const result = parseAcceptLanguageHeader('  en  ,  fr  ;q=0.9  ');
      expect(result).toEqual(['en', 'fr']);
    });

    it('should handle unicode/emoji characters', () => {
      // Invalid locale codes should be filtered
      const result = parseAcceptLanguageHeader('🎉,fr;q=0.9');
      expect(result).toEqual(['fr']);
    });

    it('should handle multiple region codes', () => {
      // en-US-POSIX should extract 'en'
      const result = parseAcceptLanguageHeader('en-US-POSIX,fr-CA');
      expect(result).toEqual(['en', 'fr']);
    });

    it('should handle missing q= prefix', () => {
      // "en;0.9" (missing q=) should default to q=1
      const result = parseAcceptLanguageHeader('en;0.9,fr;q=0.8');
      // Both should be present, en first (q=1)
      expect(result).toContain('en');
      expect(result).toContain('fr');
    });
  });

  describe('boundary conditions', () => {
    it('should handle single wildcard', () => {
      expect(parseAcceptLanguageHeader('*')).toEqual([]);
    });

    it('should handle wildcard with valid language', () => {
      const result = parseAcceptLanguageHeader('*;q=0.5,en;q=0.9');
      expect(result).toEqual(['en']);
      expect(result).not.toContain('*');
    });

    it('should deduplicate repeated languages', () => {
      const result = parseAcceptLanguageHeader('en,en-US,en-GB');
      expect(result).toEqual(['en']);
    });

    it('should handle quality value of exactly 0', () => {
      // q=0 means "not acceptable"
      const result = parseAcceptLanguageHeader('en;q=0,fr;q=0.9');
      expect(result).toEqual(['fr']);
    });

    it('should handle very long Accept-Language header', () => {
      const longHeader = Array.from({ length: 100 }, (_, i) =>
        `lang${i};q=${(1 - i * 0.01).toFixed(2)}`
      ).join(',');
      // Should not throw, should return array
      expect(() => parseAcceptLanguageHeader(longHeader)).not.toThrow();
    });
  });
});
```

### 5.2 Cookie Blocked Scenario Tests

```typescript
// /src/hooks/__tests__/useLanguagePreference.edge-cases.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createBlockedCookie, mockDocumentCookie } from '@/lib/i18n/__tests__/helpers/mockCookie';
import { mockGlobalStorage, createBlockedStorage } from '@/lib/i18n/__tests__/helpers/mockStorage';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, authState: 'UNAUTHENTICATED' }),
}));

describe('useLanguagePreference - Cookie Blocked Scenarios', () => {
  let restoreCookie: () => void;
  let restoreStorage: () => void;

  afterEach(() => {
    restoreCookie?.();
    restoreStorage?.();
    vi.clearAllMocks();
  });

  describe('when cookies are completely blocked', () => {
    beforeEach(() => {
      // Simulate cookie access throwing (some browsers in strict privacy mode)
      const mockCookie = mockDocumentCookie({ throwOnGet: true, throwOnSet: true });
      restoreCookie = mockCookie.restore;
    });

    it('should not throw error during initialization', async () => {
      // Import dynamically to get fresh module with mocked cookie
      const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');

      expect(() => {
        renderHook(() => useLanguagePreference());
      }).not.toThrow();
    });

    it('should fall back to browser language detection', async () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });

      const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
      const { result } = renderHook(() => useLanguagePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.language).toBe('fr');
    });

    it('should allow language change via URL parameter workaround', async () => {
      // Even with cookies blocked, language can be passed via URL
      // This tests that setLanguage doesn't crash
      const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
      const { result } = renderHook(() => useLanguagePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // setLanguage should not throw
      await expect(result.current.setLanguage('de')).resolves.not.toThrow();
    });
  });

  describe('when localStorage is blocked (private browsing)', () => {
    beforeEach(() => {
      restoreStorage = mockGlobalStorage(createBlockedStorage());
    });

    it('should not throw error during initialization', async () => {
      const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');

      expect(() => {
        renderHook(() => useLanguagePreference());
      }).not.toThrow();
    });

    it('should still function with cookie storage', async () => {
      const mockCookie = mockDocumentCookie({ initialValue: 'FAQBNB_LANG=es' });
      restoreCookie = mockCookie.restore;

      const { useLanguagePreference } = await import('@/hooks/useLanguagePreference');
      const { result } = renderHook(() => useLanguagePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.language).toBe('es');
    });
  });
});
```

### 5.3 Unsupported Language Code Tests

```typescript
// /src/lib/i18n/__tests__/edge-cases.test.ts

import { describe, it, expect } from 'vitest';
import {
  isSupportedLocale,
  normalizeLocale,
  DEFAULT_LOCALE,
} from '../config';

describe('Language Validation - Edge Cases', () => {
  describe('isSupportedLocale', () => {
    it('should reject unsupported language codes', () => {
      const unsupported = ['zh', 'ja', 'ko', 'pt', 'ru', 'ar', 'hi'];
      unsupported.forEach((code) => {
        expect(isSupportedLocale(code)).toBe(false);
      });
    });

    it('should reject empty string', () => {
      expect(isSupportedLocale('')).toBe(false);
    });

    it('should reject numeric strings', () => {
      expect(isSupportedLocale('123')).toBe(false);
    });

    it('should reject uppercase codes (case sensitive)', () => {
      expect(isSupportedLocale('EN')).toBe(false);
      expect(isSupportedLocale('FR')).toBe(false);
    });

    it('should reject codes with regions', () => {
      // Direct codes with regions are not in the supported list
      expect(isSupportedLocale('en-US')).toBe(false);
      expect(isSupportedLocale('fr-CA')).toBe(false);
    });

    it('should accept all supported locales', () => {
      const supported = ['en', 'fr', 'es', 'de', 'nl', 'it'];
      supported.forEach((code) => {
        expect(isSupportedLocale(code)).toBe(true);
      });
    });
  });

  describe('normalizeLocale', () => {
    it('should return default for null', () => {
      expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE);
    });

    it('should return default for undefined', () => {
      expect(normalizeLocale(undefined)).toBe(DEFAULT_LOCALE);
    });

    it('should return default for empty string', () => {
      expect(normalizeLocale('')).toBe(DEFAULT_LOCALE);
    });

    it('should extract language from region code', () => {
      expect(normalizeLocale('en-US')).toBe('en');
      expect(normalizeLocale('fr-CA')).toBe('fr');
      expect(normalizeLocale('es-419')).toBe('es');
    });

    it('should return default for unsupported language', () => {
      expect(normalizeLocale('zh')).toBe(DEFAULT_LOCALE);
      expect(normalizeLocale('zh-CN')).toBe(DEFAULT_LOCALE);
      expect(normalizeLocale('pt-BR')).toBe(DEFAULT_LOCALE);
    });

    it('should handle unusual region formats', () => {
      expect(normalizeLocale('en-US-POSIX')).toBe('en');
      expect(normalizeLocale('de-DE-1996')).toBe('de');
    });

    it('should handle lowercase conversion', () => {
      // normalizeLocale should handle uppercase
      expect(normalizeLocale('EN-US')).toBe('en');
    });
  });
});
```

### 5.4 Partial Translation Tests

```typescript
// /src/lib/translations/__tests__/partial-translations.test.ts

import { describe, it, expect } from 'vitest';

// Test the merging logic for partial translations
describe('Partial Translation Handling', () => {
  // Define merge function behavior (implementation depends on actual code)
  const mergeWithFallback = <T extends Record<string, unknown>>(
    original: T,
    translation: Partial<T> | null
  ): T => {
    if (!translation) return original;
    return {
      ...original,
      ...Object.fromEntries(
        Object.entries(translation).filter(([, v]) => v != null && v !== '')
      ),
    };
  };

  describe('item field merging', () => {
    const originalItem = {
      name: 'Coffee Machine',
      description: 'How to use the coffee machine',
      sourceLanguage: 'en',
    };

    it('should use translated name when available, original description when not', () => {
      const partialTranslation = {
        name: 'Machine à café',
        description: null, // Not translated
      };

      const result = mergeWithFallback(originalItem, partialTranslation);

      expect(result.name).toBe('Machine à café');
      expect(result.description).toBe('How to use the coffee machine');
    });

    it('should use original name when null, translated description when available', () => {
      const partialTranslation = {
        name: null,
        description: 'Comment utiliser la machine à café',
      };

      const result = mergeWithFallback(originalItem, partialTranslation);

      expect(result.name).toBe('Coffee Machine');
      expect(result.description).toBe('Comment utiliser la machine à café');
    });

    it('should use all original fields when translation is null', () => {
      const result = mergeWithFallback(originalItem, null);

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

      expect(result.name).toBe('Coffee Machine'); // Original used
      expect(result.description).toBe('Translated description');
    });
  });

  describe('article field merging', () => {
    const originalArticle = {
      title: 'WiFi Setup',
      description: 'How to connect to WiFi',
      links: [
        { id: '1', title: 'Router Manual', url: 'https://example.com' },
        { id: '2', title: 'Password Info', url: 'https://example.com/pw' },
      ],
    };

    it('should merge article fields independently of links', () => {
      const partialTranslation = {
        title: 'Configuration WiFi',
        description: null, // Not translated
        // links are translated separately
      };

      const result = mergeWithFallback(originalArticle, partialTranslation);

      expect(result.title).toBe('Configuration WiFi');
      expect(result.description).toBe('How to connect to WiFi');
      expect(result.links).toEqual(originalArticle.links); // Unchanged
    });
  });

  describe('tag translation', () => {
    it('should show translated tags with original fallback', () => {
      const tags = [
        { key: 'kitchen', displayValue: 'Kitchen', isTranslated: false },
        { key: 'appliance', displayValue: 'Électroménager', isTranslated: true },
        { key: 'coffee', displayValue: 'Coffee', isTranslated: false },
      ];

      // Verify mixed state is correctly represented
      const translatedCount = tags.filter((t) => t.isTranslated).length;
      const originalCount = tags.filter((t) => !t.isTranslated).length;

      expect(translatedCount).toBe(1);
      expect(originalCount).toBe(2);
    });
  });
});
```

---

## 6. Manual E2E Test Protocol

### 6.1 Test Environment Setup

**Prerequisites:**
- Access to staging: https://faqbnb-staging.up.railway.app
- Browser DevTools available
- Ability to modify browser cookies and language settings
- Privacy/incognito mode available

**Test Data Required:**
- Item with `publicId`: `[TEST_ITEM_ID]`
- Item must have partial translations (some fields translated, others not)

### 6.2 Test Cases

#### TC-359-1: Missing Translation for Some Fields

**Priority:** Critical
**Scenario:** Item has partial translations

**Setup:**
- Item with name translated to French, description NOT translated
- Navigate to `/item/[publicId]?lang=fr`

**Steps:**
1. Open DevTools Network tab
2. Navigate to item page with `?lang=fr`
3. Inspect the displayed content

**Expected Results:**
- [ ] Name displays in French (translated)
- [ ] Description displays in English (original)
- [ ] No error messages or blank spaces
- [ ] Translation banner may show "partially translated" indicator
- [ ] UI layout remains intact

**Console Check:**
```javascript
// No errors related to missing translations
// Console should be clean
```

**Pass/Fail:** ______

---

#### TC-359-2: Cookie Blocked Scenario

**Priority:** Critical
**Scenario:** User has strict privacy settings blocking cookies

**Setup:**
1. Open browser in strict privacy mode or use extension to block cookies
2. Verify cookies are blocked: `document.cookie` returns empty or throws

**Steps:**
1. Navigate to `/item/[publicId]`
2. Change language via language switcher (if available)
3. Refresh the page
4. Navigate away and return to the page

**Expected Results:**
- [ ] Page loads without errors
- [ ] Language detection falls back to Accept-Language header
- [ ] No JavaScript errors in console
- [ ] Language switcher updates display language
- [ ] Language preference may not persist after refresh (expected)
- [ ] URL parameter `?lang=de` still works as override

**Console Check:**
```javascript
// Should see warning log, not error
// "[useLanguagePreference] Cookie access blocked, using fallback"
```

**Pass/Fail:** ______

---

#### TC-359-3: Malformed Accept-Language Header

**Priority:** High
**Scenario:** Browser sends unusual Accept-Language header

**Setup:**
Using DevTools or Modify Header extension, set Accept-Language to malformed values.

**Test A - Empty value:**
```
Accept-Language: (empty)
```

**Steps:**
1. Set malformed Accept-Language header
2. Clear cookies
3. Navigate to `/item/[publicId]`

**Expected Results:**
- [ ] Page loads in default language (English)
- [ ] No error messages displayed
- [ ] No console errors

**Test B - Gibberish:**
```
Accept-Language: ;;;invalid;;;
```

**Expected Results:**
- [ ] Page loads in default language (English)
- [ ] Parser handles gracefully

**Test C - Unsupported languages only:**
```
Accept-Language: zh-CN,ja;q=0.9,ko;q=0.8
```

**Expected Results:**
- [ ] Page loads in default language (English)
- [ ] None of the unsupported languages are used

**Pass/Fail:** ______

---

#### TC-359-4: Unsupported Language Code

**Priority:** Critical
**Scenario:** User requests unsupported language

**Test A - Via URL parameter:**
```
/item/[publicId]?lang=zh
```

**Steps:**
1. Navigate to URL with unsupported language code
2. Check displayed content

**Expected Results:**
- [ ] Invalid parameter ignored
- [ ] Falls back to cookie or Accept-Language
- [ ] No error displayed to user
- [ ] URL parameter may be removed or kept (acceptable either way)

**Test B - Via cookie manipulation:**
```javascript
document.cookie = 'FAQBNB_LANG=pt-BR; path=/'
```

**Steps:**
1. Set cookie to unsupported language
2. Refresh page

**Expected Results:**
- [ ] Cookie value ignored (not supported)
- [ ] Falls back to Accept-Language header
- [ ] Cookie may be overwritten with detected language

**Test C - Mixed valid/invalid in Accept-Language:**
```
Accept-Language: zh-CN,fr;q=0.9,ko;q=0.8
```

**Expected Results:**
- [ ] French (fr) is used (first supported language)
- [ ] Chinese and Korean ignored

**Pass/Fail:** ______

---

#### TC-359-5: Empty and Null Edge Cases

**Priority:** Medium
**Scenario:** Various null/empty inputs

**Test A - Empty URL param:**
```
/item/[publicId]?lang=
```

**Expected Results:**
- [ ] Treated as no parameter
- [ ] Falls through to cookie/header

**Test B - URL param with spaces:**
```
/item/[publicId]?lang=%20%20
```

**Expected Results:**
- [ ] Invalid, falls through
- [ ] No crash or error

**Test C - Case sensitivity:**
```
/item/[publicId]?lang=FR
```

**Expected Results:**
- [ ] Either normalized to 'fr' and accepted, OR
- [ ] Rejected as invalid (both acceptable)
- [ ] Documented behavior consistent

**Pass/Fail:** ______

---

## 7. Dependencies

### Required Before Testing
- [ ] Epic 1 Foundation complete
- [ ] Epic 4 Phase 1-5 tasks complete (guest components)
- [ ] Translation tables populated with partial test data
- [ ] REQ-357 (basic detection tests) complete
- [ ] REQ-358 (content display tests) complete

### Dependencies on Other REQs

| REQ | Description | Required For |
|-----|-------------|--------------|
| REQ-350 | useGuestLanguage hook | Cookie blocked tests |
| REQ-351 | Cookie utility | Cookie edge case tests |
| REQ-356 | Middleware language detection | Header parsing tests |
| REQ-357 | Language detection tests | Foundation for edge cases |
| REQ-358 | Content display tests | Partial translation tests |

---

## 8. Acceptance Criteria Checklist

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

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Partial translation merge logic not implemented | Medium | High | Verify COALESCE pattern in Epic 3 queries |
| Cookie access varies by browser | Medium | Medium | Test in Chrome, Firefox, Safari |
| SSR context detection issues | Low | Medium | Comprehensive typeof checks |
| Performance impact from extra validation | Low | Low | Type guards are O(1) operations |
| Test data missing partial translations | Medium | Medium | Create specific test seed data |

---

## 10. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-359)
- Language Detection Module: `/src/lib/i18n/language-detection.ts`
- Config Module: `/src/lib/i18n/config.ts`
- Language Preference Hook: `/src/hooks/useLanguagePreference.ts`
- Locale Context: `/src/contexts/LocaleContext.tsx`
- Existing Test Patterns: `/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`
- Test Utilities: `/src/lib/job-queue/__tests__/helpers/testUtils.ts`
- Related Test Doc: `/docs/REQ-357-test-language-detection-scenarios-overview.md`
- Vitest Config: `/vitest.config.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 7: Testing & Polish*
