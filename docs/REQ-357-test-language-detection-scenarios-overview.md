# REQ-357: Test Language Detection Priority Scenarios - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Testing & Polish
**Task ID:** 7.1
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## 1. Summary

This request focuses on validating that the language detection system correctly applies priority rules across browser preferences, cookie storage, URL parameters, and fallback mechanisms. The implementation requires creating comprehensive test scenarios to ensure the priority chain works as designed for guest-facing content pages.

### Priority Order (Highest to Lowest):
1. **URL Parameter** (`?lang=de`) - Enables shareable localized links
2. **Cookie Preference** (`FAQBNB_LANG`) - Persists user choice across sessions
3. **Browser Accept-Language Header** - Automatic detection from browser settings
4. **Fallback to Original Content** - Default when no preference available

---

## 2. Current State Analysis

### Existing Implementation

The language detection system is partially implemented in:

**`/src/lib/i18n/language-detection.ts`** (Lines 176-214):
- `detectUserLanguage()` function implements a 4-level priority cascade
- Current priority: User DB preference → Cookie → Accept-Language → Default
- Missing: URL parameter support (highest priority for guest content)

**`/src/middleware.ts`** (Lines 123-163):
- Integrates language detection with middleware
- Sets `x-locale` response header
- Updates `FAQBNB_LANG` cookie when locale changes
- Current matcher does NOT include `/item/*` routes

**`/src/lib/i18n/config.ts`**:
- Defines supported locales: `['en', 'fr', 'es', 'de', 'nl', 'it']`
- Constants: `LOCALE_COOKIE_NAME = 'FAQBNB_LANG'`
- Type guards: `isSupportedLocale()`, `normalizeLocale()`

### Gap Analysis

| Scenario | Current Status | Required Action |
|----------|---------------|-----------------|
| Browser language detection | ✅ Implemented | ✅ Test only |
| Cookie preference override | ✅ Implemented | ✅ Test only |
| URL parameter override | ❌ Not implemented | ⚠️ Implement & Test |
| Fallback to original | ✅ Implemented | ✅ Test only |
| Guest routes in middleware | ❌ Not in matcher | ⚠️ Add `/item/*` |

---

## 3. Implementation Approach

### 3.1 Extend Language Detection for URL Parameters

Create a guest-specific language detection function that adds URL parameter support:

```typescript
// Priority for guest content pages:
// 1. URL parameter ?lang=de (highest - shareable links)
// 2. Cookie FAQBNB_LANG (persistence)
// 3. Accept-Language header (auto-detection)
// 4. Content's source language (fallback)
```

### 3.2 Test Strategy

The implementation uses a combination of:
1. **Unit Tests** - Test pure functions in isolation
2. **Integration Tests** - Test the full detection cascade
3. **Manual E2E Tests** - Validate browser/cookie behavior

### 3.3 Test Scenarios Matrix

| Test ID | Scenario | URL Param | Cookie | Accept-Language | Expected Result |
|---------|----------|-----------|--------|-----------------|-----------------|
| T-001 | URL param only | `?lang=de` | None | en-US | de |
| T-002 | URL overrides cookie | `?lang=fr` | de | en-US | fr |
| T-003 | URL overrides all | `?lang=es` | de | fr-FR | es |
| T-004 | Cookie only | None | fr | en-US | fr |
| T-005 | Cookie overrides header | None | de | fr-FR | de |
| T-006 | Accept-Language only | None | None | es-ES | es |
| T-007 | Multi-language header | None | None | fr-FR,es;q=0.9,en;q=0.8 | fr |
| T-008 | Unsupported URL param | `?lang=zh` | fr | en-US | fr (fallback) |
| T-009 | Invalid URL param | `?lang=invalid` | None | de-DE | de |
| T-010 | Empty URL param | `?lang=` | fr | en-US | fr |
| T-011 | No preferences | None | None | None | en (default) |
| T-012 | Unsupported Accept-Language | None | None | zh-CN,ja;q=0.9 | en (default) |
| T-013 | Mixed valid/invalid header | None | None | zh-CN,fr;q=0.9 | fr |
| T-014 | Malformed Accept-Language | None | None | ;;;invalid;;; | en (default) |

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/__tests__/language-detection.test.ts` | Unit tests for language detection functions |
| `/src/lib/i18n/__tests__/guest-language.test.ts` | Tests for guest-specific language utilities |
| `/src/lib/i18n/__tests__/helpers/mockRequest.ts` | Mock NextRequest factory for tests |
| `/docs/testing/L10N-Language-Detection-Test-Results.md` | Test results documentation |

### 4.2 Files to MODIFY

| File Path | Changes | Lines Affected |
|-----------|---------|----------------|
| `/src/lib/i18n/language-detection.ts` | Add URL param support, export parseAcceptLanguageHeader | ~50 lines |
| `/src/lib/i18n/guest-language.ts` | Create guest language detection with URL priority | New file (~100 lines) |
| `/src/middleware.ts` | Add `/item/*` to matcher config | Lines 285-299 |
| `/src/lib/i18n/index.ts` | Export new guest language functions | ~5 lines |

### 4.3 Functions to CREATE

```typescript
// /src/lib/i18n/guest-language.ts

/**
 * Detect language for guest/public pages with URL param priority.
 * @param urlParam - Language from ?lang= query parameter
 * @param request - NextRequest for cookie/header detection
 * @param contentSourceLang - Original content language (fallback)
 */
export function detectGuestLanguage(
  urlParam: string | null,
  request: NextRequest,
  contentSourceLang?: SupportedLocale
): SupportedLocale;

/**
 * Extract language parameter from URL search params.
 * Validates and normalizes the value.
 */
export function getLanguageFromUrl(
  searchParams: URLSearchParams
): SupportedLocale | null;

/**
 * Get language preference sources for debugging/logging.
 */
export function getLanguageDetectionSource(
  urlParam: string | null,
  request: NextRequest,
  contentSourceLang?: SupportedLocale
): { locale: SupportedLocale; source: 'url' | 'cookie' | 'header' | 'content' | 'default' };
```

### 4.4 Functions to MODIFY

```typescript
// /src/lib/i18n/language-detection.ts

// Export parseAcceptLanguageHeader for testing
export function parseAcceptLanguageHeader(
  acceptLanguage: string | null
): string[];

// Current: private function
// Change: export for reuse in guest-language.ts
```

---

## 5. Test Implementation Details

### 5.1 Unit Test Structure

```typescript
// /src/lib/i18n/__tests__/language-detection.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectUserLanguage,
  parseAcceptLanguageHeader,
} from '../language-detection';
import { createMockRequest } from './helpers/mockRequest';

describe('parseAcceptLanguageHeader', () => {
  describe('valid headers', () => {
    it('should parse simple language code', () => {
      expect(parseAcceptLanguageHeader('en')).toEqual(['en']);
    });

    it('should parse language with region', () => {
      expect(parseAcceptLanguageHeader('en-US')).toEqual(['en']);
    });

    it('should parse multiple languages with quality values', () => {
      const result = parseAcceptLanguageHeader('fr-FR,fr;q=0.9,en;q=0.8,de;q=0.7');
      expect(result).toEqual(['fr', 'en', 'de']);
    });

    it('should sort by quality value descending', () => {
      const result = parseAcceptLanguageHeader('en;q=0.5,fr;q=0.9,de;q=0.7');
      expect(result).toEqual(['fr', 'de', 'en']);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for null input', () => {
      expect(parseAcceptLanguageHeader(null)).toEqual([]);
    });

    it('should filter out wildcard (*)', () => {
      const result = parseAcceptLanguageHeader('en,*;q=0.5');
      expect(result).not.toContain('*');
    });

    it('should handle malformed headers gracefully', () => {
      expect(parseAcceptLanguageHeader(';;;')).toEqual([]);
    });
  });
});

describe('detectUserLanguage', () => {
  describe('priority cascade', () => {
    // Tests for each priority level...
  });
});
```

### 5.2 Guest Language Detection Tests

```typescript
// /src/lib/i18n/__tests__/guest-language.test.ts

import { describe, it, expect } from 'vitest';
import { detectGuestLanguage, getLanguageDetectionSource } from '../guest-language';
import { createMockRequest } from './helpers/mockRequest';

describe('detectGuestLanguage', () => {
  describe('URL parameter (highest priority)', () => {
    it('should use URL param when present and valid', () => {
      const request = createMockRequest({ cookie: 'fr', acceptLanguage: 'en' });
      expect(detectGuestLanguage('de', request)).toBe('de');
    });

    it('should skip invalid URL param and fall through', () => {
      const request = createMockRequest({ cookie: 'fr' });
      expect(detectGuestLanguage('zh', request)).toBe('fr');
    });
  });

  describe('cookie preference (second priority)', () => {
    it('should use cookie when no valid URL param', () => {
      const request = createMockRequest({ cookie: 'de', acceptLanguage: 'fr' });
      expect(detectGuestLanguage(null, request)).toBe('de');
    });
  });

  describe('Accept-Language header (third priority)', () => {
    it('should use header when no URL param or cookie', () => {
      const request = createMockRequest({ acceptLanguage: 'es-ES' });
      expect(detectGuestLanguage(null, request)).toBe('es');
    });
  });

  describe('fallback to content source language', () => {
    it('should use content source language as last resort', () => {
      const request = createMockRequest({});
      expect(detectGuestLanguage(null, request, 'it')).toBe('it');
    });
  });

  describe('default fallback', () => {
    it('should return default locale when all else fails', () => {
      const request = createMockRequest({});
      expect(detectGuestLanguage(null, request)).toBe('en');
    });
  });
});

describe('getLanguageDetectionSource', () => {
  it('should identify URL param as source', () => {
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
});
```

### 5.3 Mock Request Helper

```typescript
// /src/lib/i18n/__tests__/helpers/mockRequest.ts

import { NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME } from '../../config';

interface MockRequestOptions {
  cookie?: string;
  acceptLanguage?: string;
  url?: string;
}

export function createMockRequest(options: MockRequestOptions): NextRequest {
  const url = options.url || 'https://faqbnb.com/item/test-id';
  const headers = new Headers();

  if (options.acceptLanguage) {
    headers.set('Accept-Language', options.acceptLanguage);
  }

  const request = new NextRequest(url, { headers });

  if (options.cookie) {
    // Mock cookie
    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) => {
          if (name === LOCALE_COOKIE_NAME && options.cookie) {
            return { value: options.cookie };
          }
          return undefined;
        },
      },
    });
  }

  return request;
}
```

---

## 6. Manual E2E Test Protocol

### 6.1 Test Environment Setup

```markdown
**Prerequisites:**
- Clear all browser cookies for staging domain
- Browser language set to a known value (e.g., Spanish)
- Access to staging: https://faqbnb-staging.up.railway.app

**Test Data:**
- Item with publicId: [TEST_ITEM_PUBLIC_ID]
- Item must have translations in multiple languages
```

### 6.2 Test Cases

#### TC-357-1: Browser Language Detection Works

**Priority:** Critical
**Scenario:** First-time visitor with no cookie

**Steps:**
1. Clear all cookies for the staging domain
2. Set browser language preference to French (`fr-FR`)
3. Navigate to `/item/[publicId]` (no `?lang=` parameter)

**Expected Results:**
- [ ] Page displays in French
- [ ] `FAQBNB_LANG` cookie is set to `fr`
- [ ] Content shows translated text (if available)

**Pass/Fail:** ______

---

#### TC-357-2: Cookie Preference Overrides Browser

**Priority:** Critical
**Scenario:** User changed language previously

**Steps:**
1. Set browser language to Spanish (`es-ES`)
2. Set `FAQBNB_LANG` cookie to `de` (German)
3. Navigate to `/item/[publicId]`

**Expected Results:**
- [ ] Page displays in German (not Spanish)
- [ ] Language switcher shows German selected
- [ ] Browser Accept-Language is ignored

**Verification:**
```javascript
// In browser console
document.cookie.includes('FAQBNB_LANG=de') // true
```

**Pass/Fail:** ______

---

#### TC-357-3: URL Parameter Overrides Cookie

**Priority:** Critical
**Scenario:** Shareable link with explicit language

**Steps:**
1. Set `FAQBNB_LANG` cookie to `fr` (French)
2. Set browser language to Spanish
3. Navigate to `/item/[publicId]?lang=it` (Italian URL param)

**Expected Results:**
- [ ] Page displays in Italian
- [ ] Language was determined from URL parameter
- [ ] Cookie value is NOT changed (still `fr`)

**Pass/Fail:** ______

---

#### TC-357-4: Fallback to Original Content Works

**Priority:** High
**Scenario:** Unsupported or missing language

**Steps:**
1. Clear all cookies
2. Set browser language to an unsupported language (`zh-CN`)
3. Navigate to `/item/[publicId]`

**Expected Results:**
- [ ] Page displays in English (default fallback)
- [ ] No error messages displayed
- [ ] Content shows original (source) language

**Pass/Fail:** ______

---

#### TC-357-5: Invalid URL Parameter Handling

**Priority:** Medium
**Scenario:** Malformed or invalid language code in URL

**Steps:**
1. Set `FAQBNB_LANG` cookie to `de`
2. Navigate to `/item/[publicId]?lang=invalid`

**Expected Results:**
- [ ] Invalid parameter is ignored
- [ ] Page displays in German (from cookie)
- [ ] No error messages or crashes

**Pass/Fail:** ______

---

#### TC-357-6: Priority Chain Complete Test

**Priority:** Critical
**Scenario:** All preference sources present

**Steps:**
1. Set browser language to Spanish (`es-ES`)
2. Set `FAQBNB_LANG` cookie to French (`fr`)
3. Navigate to `/item/[publicId]?lang=de`

**Expected Results:**
- [ ] Page displays in German (URL param wins)
- [ ] Verify URL > Cookie > Header priority

**Then remove URL param:**
4. Navigate to `/item/[publicId]` (no `?lang=`)

**Expected Results:**
- [ ] Page displays in French (cookie wins over header)

**Then remove cookie:**
5. Delete `FAQBNB_LANG` cookie
6. Refresh page

**Expected Results:**
- [ ] Page displays in Spanish (header wins)

**Pass/Fail:** ______

---

## 7. Dependencies

### Required Before Testing
- [ ] Epic 1 Foundation complete (REQ-223 through REQ-256)
- [ ] Epic 4 Phase 1 tasks complete (guest language utilities)
- [ ] Translation tables populated with test data
- [ ] Guest item page (`/item/[publicId]`) updated with language support

### Dependencies on Other REQs
| REQ | Description | Status |
|-----|-------------|--------|
| REQ-345 | GuestLanguageSwitcher component | Required |
| REQ-350 | useGuestLanguage hook | Required |
| REQ-351 | Cookie utility for language persistence | Required |
| REQ-352 | Update guest item page | Required |
| REQ-356 | Add guest language detection to middleware | Required |

---

## 8. Acceptance Criteria Checklist

- [ ] Browser language detection correctly identifies preferred language from Accept-Language header when no other preferences exist
- [ ] Cookie-stored language preference overrides browser settings when present
- [ ] URL parameter (e.g., `?lang=de`) overrides both cookie and browser preferences
- [ ] System falls back to original content language when no preference is available or detected language has no translation
- [ ] All test scenarios documented with expected inputs and outputs
- [ ] Edge cases validated (invalid language codes, missing translations, conflicting preferences)

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| URL param support not yet implemented | Medium | High | Implement in REQ-345/356 first |
| Test environment missing translations | Medium | Medium | Seed test data before testing |
| Cookie blocked by browser | Low | Low | Graceful fallback to header |
| Accept-Language parsing edge cases | Medium | Low | Comprehensive unit tests |

---

## 10. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-357)
- Existing Language Detection: `/src/lib/i18n/language-detection.ts`
- Middleware: `/src/middleware.ts`
- L10N E2E Test Protocol: `/docs/testing/L10N-E2E-Test-Protocol.md`
- Test Utilities Pattern: `/src/lib/job-queue/__tests__/helpers/testUtils.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 7: Testing & Polish*
