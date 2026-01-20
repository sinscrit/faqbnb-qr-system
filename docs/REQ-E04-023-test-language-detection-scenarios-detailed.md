# Detailed Task Breakdown: REQ-E04-023 - Validate Language Detection Priority and Fallback Scenarios

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-023
**Epic:** Epic 4 - Guest Experience
**Phase:** 7 - Testing & Polish
**Task ID:** 7.1
**Overview Document:** docs/REQ-E04-023-test-language-detection-scenarios-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for REQ-E04-023: comprehensive testing of the language detection priority chain for guest-facing pages. The testing validates browser Accept-Language header parsing, cookie persistence, URL parameter handling, translation fallback logic, and the complete priority chain (URL > Cookie > Header > Default).

**Total Estimated Tasks:** 28 granular tasks
**Estimated Effort:** 18 hours (2-3 days)

---

## Prerequisites

Before implementing these tasks, verify the following are complete:

| Prerequisite | Location | Verification Method |
|--------------|----------|---------------------|
| Language detection utility | `/src/lib/i18n/language-detection.ts` | File exists with `detectUserLanguage()` |
| i18n config with supported locales | `/src/lib/i18n/config.ts` | Exports `SUPPORTED_LOCALES`, `isSupportedLocale()` |
| Guest language utility module | `/src/lib/i18n/guest-language.ts` | File exists with `detectGuestLanguage()` |
| Cookie utility functions | `/src/lib/i18n/guest-language.ts` | Exports `setGuestLanguageCookie()`, `getGuestLanguageCookie()` |
| GuestLanguageSwitcher component | `/src/components/guest/GuestLanguageSwitcher/` | Directory and component exist |
| TranslationBanner component | `/src/components/guest/TranslationBanner/` | Directory and component exist |
| MissingTranslationBanner component | `/src/components/guest/MissingTranslationBanner/` | Directory and component exist |
| Vitest configured | `/vitest.config.ts` | Test environment is jsdom |

---

## Task Breakdown

### TASK-001: Create Test Directory Structure

**Priority:** P0 (Blocker)
**Estimated Effort:** 10 minutes
**Dependencies:** None

**Description:**
Create the directory structure for language detection tests.

**Implementation Steps:**

1. Create test directories if they don't exist:
   - `/src/lib/i18n/__tests__/`
   - `/src/lib/i18n/__tests__/helpers/`
   - `/src/components/guest/__tests__/`
   - `/docs/testing/`

2. Verify directories are created successfully.

**Acceptance Criteria:**
- [ ] Directory `/src/lib/i18n/__tests__/` exists
- [ ] Directory `/src/lib/i18n/__tests__/helpers/` exists
- [ ] Directory `/src/components/guest/__tests__/` exists
- [ ] Directory `/docs/testing/` exists

**Files to Create:**
- Directories only (no files)

---

### TASK-002: Create Mock Request Factory Utility

**Priority:** P0 (Blocker)
**Estimated Effort:** 45 minutes
**Dependencies:** TASK-001

**Description:**
Create a reusable factory function to generate mock NextRequest objects for testing language detection scenarios.

**Implementation Steps:**

1. Create file `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts`

2. Implement `MockRequestOptions` interface:
   ```typescript
   interface MockRequestOptions {
     url?: string;
     queryParams?: Record<string, string>;
     cookies?: Record<string, string>;
     headers?: Record<string, string>;
   }
   ```

3. Implement `createMockNextRequest(options: MockRequestOptions): NextRequest` function:
   - Create URL object from options.url or default 'http://localhost:3000/item/test'
   - Add query params from options.queryParams to URL
   - Create Headers object from options.headers
   - Create mock request with NextRequest constructor
   - Mock cookies.get() method to return from options.cookies
   - Return configured mock request

4. Add JSDoc documentation for the function.

**Acceptance Criteria:**
- [ ] File `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts` exists
- [ ] `MockRequestOptions` interface is exported
- [ ] `createMockNextRequest()` function is exported
- [ ] Function handles URL query parameters correctly
- [ ] Function handles cookies correctly
- [ ] Function handles headers correctly
- [ ] Function has JSDoc documentation

**Files to Create:**
- `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts`

---

### TASK-003: Create Test Data Constants

**Priority:** P0 (Blocker)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-002

**Description:**
Create constants and test data for various Accept-Language header scenarios and edge cases.

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts`:

2. Create `TEST_ACCEPT_LANGUAGE_HEADERS` constant object:
   ```typescript
   export const TEST_ACCEPT_LANGUAGE_HEADERS = {
     simple: 'en',
     simpleSupported: 'fr',
     withQuality: 'fr;q=0.9, en;q=0.8, de;q=0.7',
     highQualityFirst: 'de;q=1.0, fr;q=0.9, es;q=0.5',
     regional: 'en-US,en;q=0.9',
     regionalSpanish: 'es-MX,es;q=0.9,en;q=0.8',
     regionalPortuguese: 'pt-BR,pt;q=0.9',
     unsupported: 'ja,zh;q=0.9',
     unsupportedWithFallback: 'ja,zh;q=0.9,en;q=0.5',
     malformed: 'invalid,,header;q=invalid',
     malformedQValue: 'en;q=notanumber',
     empty: '',
     wildcard: '*',
     wildcardWithLanguage: '*;q=0.5, fr;q=0.9',
     multipleSupported: 'es;q=0.9, de;q=0.8, fr;q=0.7, it;q=0.6',
   };
   ```

3. Create `TEST_COOKIE_VALUES` constant:
   ```typescript
   export const TEST_COOKIE_VALUES = {
     validFrench: 'fr',
     validSpanish: 'es',
     validGerman: 'de',
     invalid: 'xyz',
     empty: '',
     regional: 'en-US',
     malformed: ';;;',
   };
   ```

4. Create `GUEST_LANGUAGE_COOKIE_NAME` constant:
   ```typescript
   export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
   ```

5. Create `SUPPORTED_LANGUAGES` array for iteration tests:
   ```typescript
   export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
   ```

**Acceptance Criteria:**
- [ ] `TEST_ACCEPT_LANGUAGE_HEADERS` constant exported with all scenarios
- [ ] `TEST_COOKIE_VALUES` constant exported
- [ ] `GUEST_LANGUAGE_COOKIE_NAME` constant exported
- [ ] `SUPPORTED_LANGUAGES` constant exported
- [ ] All test data covers documented edge cases

**Files to Modify:**
- `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts`

---

### TASK-004: Create Assertion Helper Functions

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-003

**Description:**
Create custom assertion helpers for language detection tests to improve test readability.

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts`:

2. Implement `assertLanguageEquals()` helper:
   ```typescript
   export function assertLanguageEquals(
     actual: string,
     expected: string,
     message?: string
   ): void {
     const errorMsg = message || `Expected language '${expected}' but got '${actual}'`;
     expect(actual).toBe(expected);
   }
   ```

3. Implement `assertIsSupportedLanguage()` helper:
   ```typescript
   export function assertIsSupportedLanguage(
     language: string,
     message?: string
   ): void {
     const isSupported = SUPPORTED_LANGUAGES.includes(language as any);
     const errorMsg = message || `Language '${language}' is not a supported language`;
     expect(isSupported).toBe(true);
   }
   ```

4. Implement `assertCookieSet()` helper for response testing:
   ```typescript
   export function assertCookieSet(
     response: NextResponse,
     cookieName: string,
     expectedValue?: string
   ): void {
     const cookie = response.cookies.get(cookieName);
     expect(cookie).toBeDefined();
     if (expectedValue !== undefined) {
       expect(cookie?.value).toBe(expectedValue);
     }
   }
   ```

**Acceptance Criteria:**
- [ ] `assertLanguageEquals()` function exported
- [ ] `assertIsSupportedLanguage()` function exported
- [ ] `assertCookieSet()` function exported
- [ ] All helpers have TypeScript types
- [ ] All helpers have descriptive error messages

**Files to Modify:**
- `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts`

---

### TASK-005: Create Test Utilities Index Export

**Priority:** P1 (High)
**Estimated Effort:** 10 minutes
**Dependencies:** TASK-004

**Description:**
Create an index file to export all test utilities for easy importing.

**Implementation Steps:**

1. Create file `/src/lib/i18n/__tests__/helpers/index.ts`

2. Export all utilities from `languageTestUtils.ts`:
   ```typescript
   export * from './languageTestUtils';
   ```

**Acceptance Criteria:**
- [ ] File `/src/lib/i18n/__tests__/helpers/index.ts` exists
- [ ] All utilities are re-exported
- [ ] Import from helpers index works correctly

**Files to Create:**
- `/src/lib/i18n/__tests__/helpers/index.ts`

---

### TASK-006: Create Accept-Language Basic Parsing Tests

**Priority:** P1 (High)
**Estimated Effort:** 45 minutes
**Dependencies:** TASK-005

**Description:**
Create tests for basic Accept-Language header parsing functionality (TC-1.1).

**Implementation Steps:**

1. Create file `/src/lib/i18n/__tests__/guest-language-detection.test.ts`

2. Add imports:
   ```typescript
   import { describe, it, expect, beforeEach } from 'vitest';
   import {
     createMockNextRequest,
     TEST_ACCEPT_LANGUAGE_HEADERS,
     assertLanguageEquals,
   } from './helpers';
   // Import the function to test (adjust path as needed)
   import { detectGuestLanguage } from '../guest-language';
   ```

3. Implement test suite for TC-1.1:
   ```typescript
   describe('Guest Language Detection - Accept-Language Header', () => {
     describe('TC-1.1: Basic header parsing', () => {
       it('extracts language from simple Accept-Language header', async () => {
         const request = createMockNextRequest({
           headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.simpleSupported },
         });
         const detected = await detectGuestLanguage(request);
         assertLanguageEquals(detected, 'fr');
       });

       it('extracts highest-priority supported language from complex header', async () => {
         const request = createMockNextRequest({
           headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.withQuality },
         });
         const detected = await detectGuestLanguage(request);
         assertLanguageEquals(detected, 'fr');
       });

       it('returns default when Accept-Language is missing', async () => {
         const request = createMockNextRequest({});
         const detected = await detectGuestLanguage(request);
         assertLanguageEquals(detected, 'en');
       });

       it('returns default when Accept-Language is empty', async () => {
         const request = createMockNextRequest({
           headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.empty },
         });
         const detected = await detectGuestLanguage(request);
         assertLanguageEquals(detected, 'en');
       });
     });
   });
   ```

**Acceptance Criteria:**
- [ ] Test file `/src/lib/i18n/__tests__/guest-language-detection.test.ts` exists
- [ ] TC-1.1 test suite implemented with 4+ test cases
- [ ] Tests use helper utilities
- [ ] All tests pass or fail meaningfully

**Files to Create:**
- `/src/lib/i18n/__tests__/guest-language-detection.test.ts`

---

### TASK-007: Create Regional Variant Mapping Tests

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-006

**Description:**
Create tests for regional language variant mapping (TC-1.2).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-detection.test.ts`:

2. Implement TC-1.2 test suite:
   ```typescript
   describe('TC-1.2: Regional variant mapping', () => {
     it('maps en-US to en', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'en-US' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });

     it('maps en-GB to en', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'en-GB' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });

     it('maps es-MX to es', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'es-MX' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'es');
     });

     it('maps fr-CA to fr', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'fr-CA' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'fr');
     });

     it('maps de-AT to de', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'de-AT' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'de');
     });

     it('handles complex regional header with multiple languages', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.regionalSpanish },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'es');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-1.2 test suite implemented with 6+ test cases
- [ ] All major regional variants covered (US, GB, MX, CA, AT)
- [ ] Complex regional headers handled correctly
- [ ] All tests pass or fail meaningfully

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-detection.test.ts`

---

### TASK-008: Create Quality Value Ordering Tests

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-007

**Description:**
Create tests for Accept-Language quality value ordering (TC-1.3).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-detection.test.ts`:

2. Implement TC-1.3 test suite:
   ```typescript
   describe('TC-1.3: Quality value ordering', () => {
     it('respects q-values and selects highest-quality supported language', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'de;q=1.0, fr;q=0.9, es;q=0.5' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'de');
     });

     it('handles languages with equal q-values (order preserved)', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'fr;q=0.8, es;q=0.8' },
       });
       const detected = await detectGuestLanguage(request);
       // Should return first one when equal
       assertLanguageEquals(detected, 'fr');
     });

     it('defaults q-value to 1.0 when not specified', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'de, fr;q=0.9' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'de');
     });

     it('selects supported language over higher-q unsupported', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'ja;q=1.0, fr;q=0.5' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'fr');
     });

     it('handles multiple supported languages in q-value order', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.multipleSupported },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'es');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-1.3 test suite implemented with 5+ test cases
- [ ] Quality values are respected correctly
- [ ] Default q-value of 1.0 is handled
- [ ] Unsupported languages are skipped correctly

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-detection.test.ts`

---

### TASK-009: Create Malformed Header Handling Tests

**Priority:** P2 (Medium)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-008

**Description:**
Create tests for malformed Accept-Language header handling (TC-1.4).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-detection.test.ts`:

2. Implement TC-1.4 test suite:
   ```typescript
   describe('TC-1.4: Malformed header handling', () => {
     it('handles malformed headers without throwing', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.malformed },
       });

       // Should not throw
       await expect(detectGuestLanguage(request)).resolves.toBeDefined();
     });

     it('falls back to default on malformed q-value', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.malformedQValue },
       });
       const detected = await detectGuestLanguage(request);
       // Should still detect 'en' from the header
       assertLanguageEquals(detected, 'en');
     });

     it('handles header with only commas', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': ',,,' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });

     it('handles header with whitespace only', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': '   ' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });

     it('handles wildcard Accept-Language', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.wildcard },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });

     it('handles wildcard with specific language', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.wildcardWithLanguage },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'fr');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-1.4 test suite implemented with 6+ test cases
- [ ] No exceptions thrown on malformed headers
- [ ] Graceful fallback to default language
- [ ] Wildcard handling tested

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-detection.test.ts`

---

### TASK-010: Create Unsupported Language Fallback Tests

**Priority:** P1 (High)
**Estimated Effort:** 20 minutes
**Dependencies:** TASK-009

**Description:**
Create tests for fallback when Accept-Language contains only unsupported languages (TC-1.5).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-detection.test.ts`:

2. Implement TC-1.5 test suite:
   ```typescript
   describe('TC-1.5: Unsupported language fallback', () => {
     it('falls back to default when no supported language in header', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.unsupported },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });

     it('finds supported language after unsupported ones', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': TEST_ACCEPT_LANGUAGE_HEADERS.unsupportedWithFallback },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });

     it('handles completely unknown language codes', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'xyz,abc,123' },
       });
       const detected = await detectGuestLanguage(request);
       assertLanguageEquals(detected, 'en');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-1.5 test suite implemented with 3+ test cases
- [ ] Fallback to default works correctly
- [ ] Mixed supported/unsupported headers handled

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-detection.test.ts`

---

### TASK-011: Create Cookie Creation Tests

**Priority:** P1 (High)
**Estimated Effort:** 45 minutes
**Dependencies:** TASK-005

**Description:**
Create tests for cookie creation and persistence (TC-2.1, TC-2.2, TC-2.3).

**Implementation Steps:**

1. Create file `/src/lib/i18n/__tests__/guest-language-cookie.test.ts`

2. Add imports and setup:
   ```typescript
   import { describe, it, expect, beforeEach, vi } from 'vitest';
   import {
     createMockNextRequest,
     TEST_COOKIE_VALUES,
     GUEST_LANGUAGE_COOKIE_NAME,
     SUPPORTED_LANGUAGES,
   } from './helpers';
   import { setGuestLanguageCookie, getGuestLanguageCookie } from '../guest-language';
   ```

3. Implement TC-2.1 (Cookie creation):
   ```typescript
   describe('Guest Language Detection - Cookie Persistence', () => {
     describe('TC-2.1: Cookie creation', () => {
       it('creates cookie with correct name', () => {
         // Test cookie setting logic
         const mockSetCookie = vi.fn();
         // Mock and verify cookie is set with FAQBNB_GUEST_LANG name
       });

       it('creates cookie with valid language value', () => {
         // Test each supported language can be set
         SUPPORTED_LANGUAGES.forEach((lang) => {
           // Verify cookie can be set with each language
         });
       });

       it('rejects invalid language codes', () => {
         // Test that invalid codes are not set
       });
     });
   });
   ```

4. Implement TC-2.2 (Cookie expiration):
   ```typescript
   describe('TC-2.2: Cookie expiration', () => {
     it('sets expiration to 1 year from creation', () => {
       // Verify maxAge is 365 * 24 * 60 * 60 (1 year in seconds)
     });
   });
   ```

5. Implement TC-2.3 (Cookie security):
   ```typescript
   describe('TC-2.3: Cookie security attributes', () => {
     it('sets Secure flag in production', () => {
       // Mock NODE_ENV=production and verify Secure is true
     });

     it('sets SameSite=Lax', () => {
       // Verify sameSite attribute is 'lax'
     });

     it('sets path to /', () => {
       // Verify path is '/'
     });
   });
   ```

**Acceptance Criteria:**
- [ ] Test file `/src/lib/i18n/__tests__/guest-language-cookie.test.ts` exists
- [ ] TC-2.1 tests cookie creation with correct name
- [ ] TC-2.2 tests 1-year expiration
- [ ] TC-2.3 tests Secure, SameSite, and path attributes
- [ ] All tests pass or fail meaningfully

**Files to Create:**
- `/src/lib/i18n/__tests__/guest-language-cookie.test.ts`

---

### TASK-012: Create Cookie Reading Tests

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-011

**Description:**
Create tests for reading cookies and cookie vs header priority (TC-2.4, TC-2.5).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-cookie.test.ts`:

2. Implement TC-2.4 (Returning guest detection):
   ```typescript
   describe('TC-2.4: Returning guest detection', () => {
     it('reads existing cookie and applies language', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'fr' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('fr');
     });

     it('handles returning guest with valid French cookie', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: TEST_COOKIE_VALUES.validFrench },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('fr');
     });

     it('handles returning guest with valid Spanish cookie', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: TEST_COOKIE_VALUES.validSpanish },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('es');
     });
   });
   ```

3. Implement TC-2.5 (Cookie vs Accept-Language priority):
   ```typescript
   describe('TC-2.5: Cookie vs Accept-Language priority', () => {
     it('cookie preference overrides browser Accept-Language', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
         headers: { 'Accept-Language': 'de;q=1.0, fr;q=0.9' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('es');
     });

     it('cookie is used when both cookie and header present', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'it' },
         headers: { 'Accept-Language': 'en' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('it');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-2.4 tests verify returning guest cookie reading
- [ ] TC-2.5 tests verify cookie overrides Accept-Language
- [ ] Multiple language scenarios covered

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-cookie.test.ts`

---

### TASK-013: Create Cookie Error Handling Tests

**Priority:** P2 (Medium)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-012

**Description:**
Create tests for cookie error handling (TC-2.6).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-cookie.test.ts`:

2. Implement TC-2.6 (Cookie error handling):
   ```typescript
   describe('TC-2.6: Cookie error handling', () => {
     it('handles missing cookie gracefully', async () => {
       const request = createMockNextRequest({
         headers: { 'Accept-Language': 'fr' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('fr'); // Falls through to header
     });

     it('handles corrupted cookie value gracefully', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: TEST_COOKIE_VALUES.malformed },
         headers: { 'Accept-Language': 'de' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('de'); // Falls through to header
     });

     it('handles invalid language in cookie gracefully', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: TEST_COOKIE_VALUES.invalid },
         headers: { 'Accept-Language': 'es' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('es'); // Falls through to header
     });

     it('handles empty cookie value gracefully', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: TEST_COOKIE_VALUES.empty },
         headers: { 'Accept-Language': 'nl' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('nl'); // Falls through to header
     });

     it('handles regional code in cookie gracefully', async () => {
       const request = createMockNextRequest({
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: TEST_COOKIE_VALUES.regional },
       });
       const detected = await detectGuestLanguage(request);
       // Should either accept as 'en' or fall through
       expect(['en']).toContain(detected);
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-2.6 tests verify graceful handling of missing cookies
- [ ] Corrupted cookie values handled without errors
- [ ] Invalid language codes fall through to next priority
- [ ] Empty cookie values handled correctly

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-cookie.test.ts`

---

### TASK-014: Create Basic URL Parameter Tests

**Priority:** P1 (High)
**Estimated Effort:** 45 minutes
**Dependencies:** TASK-005

**Description:**
Create tests for basic URL parameter handling (TC-3.1).

**Implementation Steps:**

1. Create file `/src/lib/i18n/__tests__/guest-language-url-param.test.ts`

2. Add imports and setup:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import {
     createMockNextRequest,
     GUEST_LANGUAGE_COOKIE_NAME,
     SUPPORTED_LANGUAGES,
   } from './helpers';
   import { detectGuestLanguage } from '../guest-language';
   ```

3. Implement TC-3.1 (Basic URL parameter):
   ```typescript
   describe('Guest Language Detection - URL Parameter', () => {
     describe('TC-3.1: Basic URL parameter', () => {
       it('?lang=es displays content in Spanish', async () => {
         const request = createMockNextRequest({
           queryParams: { lang: 'es' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('es');
       });

       it('?lang=fr displays content in French', async () => {
         const request = createMockNextRequest({
           queryParams: { lang: 'fr' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('fr');
       });

       it.each(SUPPORTED_LANGUAGES)(
         'recognizes supported language %s from URL param',
         async (lang) => {
           const request = createMockNextRequest({
             queryParams: { lang },
           });
           const detected = await detectGuestLanguage(request);
           expect(detected).toBe(lang);
         }
       );
     });
   });
   ```

**Acceptance Criteria:**
- [ ] Test file `/src/lib/i18n/__tests__/guest-language-url-param.test.ts` exists
- [ ] TC-3.1 tests all six supported languages
- [ ] Parameterized test covers all languages
- [ ] Basic functionality verified

**Files to Create:**
- `/src/lib/i18n/__tests__/guest-language-url-param.test.ts`

---

### TASK-015: Create URL Parameter Priority Tests

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-014

**Description:**
Create tests for URL parameter priority over cookie and header (TC-3.2, TC-3.3).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-url-param.test.ts`:

2. Implement TC-3.2 (URL vs Cookie priority):
   ```typescript
   describe('TC-3.2: URL vs Cookie priority', () => {
     it('URL parameter overrides existing cookie preference', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'fr' },
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('fr');
     });

     it('URL de overrides cookie es', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'de' },
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('de');
     });
   });
   ```

3. Implement TC-3.3 (URL vs Accept-Language priority):
   ```typescript
   describe('TC-3.3: URL vs Accept-Language priority', () => {
     it('URL parameter overrides Accept-Language header', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'it' },
         headers: { 'Accept-Language': 'de;q=1.0, fr;q=0.9' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('it');
     });

     it('URL overrides both cookie and header', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'nl' },
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
         headers: { 'Accept-Language': 'de;q=1.0' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('nl');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-3.2 tests verify URL overrides cookie
- [ ] TC-3.3 tests verify URL overrides header
- [ ] Combined override scenario tested

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-url-param.test.ts`

---

### TASK-016: Create Invalid URL Parameter Tests

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-015

**Description:**
Create tests for invalid URL parameter handling (TC-3.4, TC-3.5).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-url-param.test.ts`:

2. Implement TC-3.4 (Invalid URL parameter handling):
   ```typescript
   describe('TC-3.4: Invalid URL parameter handling', () => {
     it('invalid language code falls back to cookie', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'xyz' },
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'fr' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('fr');
     });

     it('invalid language code falls back to browser when no cookie', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'invalid' },
         headers: { 'Accept-Language': 'es' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('es');
     });

     it('unsupported language code falls back correctly', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'ja' }, // Japanese not supported
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'de' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('de');
     });

     it('empty URL param falls back to cookie', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: '' },
         cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'it' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('it');
     });
   });
   ```

3. Implement TC-3.5 (Case insensitivity):
   ```typescript
   describe('TC-3.5: Case insensitivity', () => {
     it('?lang=ES works same as ?lang=es', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'ES' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('es');
     });

     it('?lang=Fr works same as ?lang=fr', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'Fr' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('fr');
     });

     it('?lang=DE works same as ?lang=de', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'DE' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('de');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-3.4 tests verify fallback on invalid codes
- [ ] TC-3.5 tests verify case-insensitive handling
- [ ] Empty parameter handled correctly

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-url-param.test.ts`

---

### TASK-017: Create Translation Fallback Tests - Missing Translation

**Priority:** P1 (High)
**Estimated Effort:** 45 minutes
**Dependencies:** TASK-005

**Description:**
Create tests for translation fallback when requested translation is unavailable (TC-4.1, TC-4.2, TC-4.3).

**Implementation Steps:**

1. Create file `/src/lib/i18n/__tests__/guest-language-fallback.test.ts`

2. Add imports and setup:
   ```typescript
   import { describe, it, expect, vi } from 'vitest';
   import {
     createMockNextRequest,
     SUPPORTED_LANGUAGES,
   } from './helpers';
   // Import translation-related utilities
   ```

3. Implement TC-4.1 (Missing translation fallback):
   ```typescript
   describe('Guest Language Detection - Translation Fallback', () => {
     describe('TC-4.1: Missing translation fallback', () => {
       it('shows original content when requested translation unavailable', async () => {
         // This tests the utility that merges translations
         // When translation is null/undefined, original should be returned
       });

       it('maintains content integrity during fallback', async () => {
         // Verify all fields are present from original
       });
     });
   });
   ```

4. Implement TC-4.2 (MissingTranslationBanner display):
   ```typescript
   describe('TC-4.2: MissingTranslationBanner display', () => {
     it('metadata indicates when translation is unavailable', () => {
       // Test translation metadata generation
     });

     it('metadata shows requested and displayed languages', () => {
       // Verify requestedLanguage and displayLanguage are set correctly
     });
   });
   ```

5. Implement TC-4.3 (Original content display):
   ```typescript
   describe('TC-4.3: Original content display', () => {
     it('original content renders correctly during fallback', () => {
       // Test mergeTranslation returns original when translation is null
     });

     it('all fields show original values', () => {
       // Verify each translatable field
     });
   });
   ```

**Acceptance Criteria:**
- [ ] Test file `/src/lib/i18n/__tests__/guest-language-fallback.test.ts` exists
- [ ] TC-4.1 tests verify original content shown when no translation
- [ ] TC-4.2 tests verify translation metadata is correct
- [ ] TC-4.3 tests verify original content integrity

**Files to Create:**
- `/src/lib/i18n/__tests__/guest-language-fallback.test.ts`

---

### TASK-018: Create Translation Metadata and Default Fallback Tests

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-017

**Description:**
Create tests for translation metadata and default English fallback (TC-4.4, TC-4.5).

**Implementation Steps:**

1. Add to `/src/lib/i18n/__tests__/guest-language-fallback.test.ts`:

2. Implement TC-4.4 (Translation metadata):
   ```typescript
   describe('TC-4.4: Translation metadata', () => {
     it('metadata indicates fallback status', () => {
       // Test that isShowingTranslation is false when falling back
     });

     it('metadata shows source language', () => {
       // Verify sourceLanguage is set correctly
     });

     it('metadata shows requested vs displayed language', () => {
       // Verify both requestedLanguage and displayLanguage
     });
   });
   ```

3. Implement TC-4.5 (Default English fallback):
   ```typescript
   describe('TC-4.5: Default English fallback', () => {
     it('defaults to English when no detection source available', async () => {
       const request = createMockNextRequest({});
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('en');
     });

     it('English is used as ultimate fallback', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: 'invalid' },
         cookies: { 'FAQBNB_GUEST_LANG': 'also-invalid' },
         headers: { 'Accept-Language': 'xyz,abc' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('en');
     });

     it('English fallback when all sources are empty', async () => {
       const request = createMockNextRequest({
         queryParams: { lang: '' },
         cookies: { 'FAQBNB_GUEST_LANG': '' },
         headers: { 'Accept-Language': '' },
       });
       const detected = await detectGuestLanguage(request);
       expect(detected).toBe('en');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TC-4.4 tests verify translation metadata correctness
- [ ] TC-4.5 tests verify English is ultimate fallback
- [ ] Edge cases with all invalid/empty sources tested

**Files to Modify:**
- `/src/lib/i18n/__tests__/guest-language-fallback.test.ts`

---

### TASK-019: Create Priority Chain Integration Tests

**Priority:** P1 (High)
**Estimated Effort:** 60 minutes
**Dependencies:** TASK-010, TASK-013, TASK-016, TASK-018

**Description:**
Create comprehensive integration tests for the complete priority chain (TC-5.1, TC-5.2, TC-5.3).

**Implementation Steps:**

1. Create file `/src/lib/i18n/__tests__/guest-language-priority-chain.test.ts`

2. Add imports:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import {
     createMockNextRequest,
     GUEST_LANGUAGE_COOKIE_NAME,
     SUPPORTED_LANGUAGES,
   } from './helpers';
   import { detectGuestLanguage } from '../guest-language';
   ```

3. Implement TC-5.1 (Full priority chain validation):
   ```typescript
   describe('Guest Language Detection - Complete Priority Chain', () => {
     describe('TC-5.1: Full priority chain validation', () => {
       it('URL > Cookie > Accept-Language > Default (all present)', async () => {
         const request = createMockNextRequest({
           queryParams: { lang: 'fr' },
           cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
           headers: { 'Accept-Language': 'de' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('fr'); // URL wins
       });

       it('Cookie > Accept-Language > Default (no URL)', async () => {
         const request = createMockNextRequest({
           cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
           headers: { 'Accept-Language': 'de' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('es'); // Cookie wins
       });

       it('Accept-Language > Default (no URL, no Cookie)', async () => {
         const request = createMockNextRequest({
           headers: { 'Accept-Language': 'de' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('de'); // Header wins
       });

       it('Default (nothing present)', async () => {
         const request = createMockNextRequest({});
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('en'); // Default
       });

       it('URL invalid > Cookie > Header (URL falls through)', async () => {
         const request = createMockNextRequest({
           queryParams: { lang: 'invalid' },
           cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'it' },
           headers: { 'Accept-Language': 'nl' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('it'); // Cookie wins after invalid URL
       });

       it('URL invalid > Cookie invalid > Header (both fall through)', async () => {
         const request = createMockNextRequest({
           queryParams: { lang: 'xyz' },
           cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'abc' },
           headers: { 'Accept-Language': 'fr' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe('fr'); // Header wins after both invalid
       });
     });
   });
   ```

4. Implement TC-5.2 (Override behavior):
   ```typescript
   describe('TC-5.2: Override behavior', () => {
     it('each level correctly overrides lower levels', async () => {
       // Test each transition point
       const scenarios = [
         { url: 'fr', cookie: 'es', header: 'de', expected: 'fr' },
         { url: null, cookie: 'es', header: 'de', expected: 'es' },
         { url: null, cookie: null, header: 'de', expected: 'de' },
         { url: null, cookie: null, header: null, expected: 'en' },
       ];

       for (const scenario of scenarios) {
         const request = createMockNextRequest({
           queryParams: scenario.url ? { lang: scenario.url } : undefined,
           cookies: scenario.cookie ? { [GUEST_LANGUAGE_COOKIE_NAME]: scenario.cookie } : undefined,
           headers: scenario.header ? { 'Accept-Language': scenario.header } : undefined,
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe(scenario.expected);
       }
     });
   });
   ```

5. Implement TC-5.3 (All supported languages):
   ```typescript
   describe('TC-5.3: All supported languages', () => {
     it.each(SUPPORTED_LANGUAGES)(
       'priority chain works for %s via URL',
       async (lang) => {
         const request = createMockNextRequest({
           queryParams: { lang },
           cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'en' },
           headers: { 'Accept-Language': 'en' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe(lang);
       }
     );

     it.each(SUPPORTED_LANGUAGES)(
       'priority chain works for %s via Cookie',
       async (lang) => {
         const request = createMockNextRequest({
           cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: lang },
           headers: { 'Accept-Language': 'en' },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe(lang);
       }
     );

     it.each(SUPPORTED_LANGUAGES)(
       'priority chain works for %s via Header',
       async (lang) => {
         const request = createMockNextRequest({
           headers: { 'Accept-Language': lang },
         });
         const detected = await detectGuestLanguage(request);
         expect(detected).toBe(lang);
       }
     );
   });
   ```

**Acceptance Criteria:**
- [ ] Test file `/src/lib/i18n/__tests__/guest-language-priority-chain.test.ts` exists
- [ ] TC-5.1 tests complete priority chain with all combinations
- [ ] TC-5.2 tests each override transition
- [ ] TC-5.3 tests all 6 languages through each priority level
- [ ] 18+ parameterized tests for all languages

**Files to Create:**
- `/src/lib/i18n/__tests__/guest-language-priority-chain.test.ts`

---

### TASK-020: Create Component Integration Test Setup

**Priority:** P2 (Medium)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-019

**Description:**
Create the setup file for component integration tests with necessary mocks.

**Implementation Steps:**

1. Create file `/src/components/guest/__tests__/setup.ts`

2. Add mock setup:
   ```typescript
   import { vi } from 'vitest';
   import '@testing-library/jest-dom';

   // Mock next/navigation
   vi.mock('next/navigation', () => ({
     useRouter: () => ({
       push: vi.fn(),
       replace: vi.fn(),
       prefetch: vi.fn(),
     }),
     useSearchParams: () => ({
       get: vi.fn(),
     }),
   }));

   // Mock cookies-next or cookie utilities
   vi.mock('cookies-next', () => ({
     getCookie: vi.fn(),
     setCookie: vi.fn(),
   }));
   ```

**Acceptance Criteria:**
- [ ] Setup file `/src/components/guest/__tests__/setup.ts` exists
- [ ] Next.js navigation mocked
- [ ] Cookie utilities mocked

**Files to Create:**
- `/src/components/guest/__tests__/setup.ts`

---

### TASK-021: Create GuestLanguageSwitcher Integration Tests

**Priority:** P2 (Medium)
**Estimated Effort:** 45 minutes
**Dependencies:** TASK-020

**Description:**
Create integration tests for the GuestLanguageSwitcher component.

**Implementation Steps:**

1. Create file `/src/components/guest/__tests__/language-detection-integration.test.tsx`

2. Add imports:
   ```typescript
   import { describe, it, expect, vi, beforeEach } from 'vitest';
   import { render, screen, fireEvent } from '@testing-library/react';
   import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';
   import './setup';
   ```

3. Implement GuestLanguageSwitcher tests:
   ```typescript
   describe('Language Detection - Component Integration', () => {
     describe('GuestLanguageSwitcher Integration', () => {
       const mockOnLanguageChange = vi.fn();

       beforeEach(() => {
         mockOnLanguageChange.mockClear();
       });

       it('selection triggers onLanguageChange callback', async () => {
         render(
           <GuestLanguageSwitcher
             currentLanguage="en"
             availableTranslations={['en', 'fr', 'es']}
             sourceLanguage="en"
             onLanguageChange={mockOnLanguageChange}
           />
         );

         // Open dropdown and select a language
         // Verify callback was called with correct language
       });

       it('shows available translations correctly', () => {
         render(
           <GuestLanguageSwitcher
             currentLanguage="en"
             availableTranslations={['en', 'fr', 'es']}
             sourceLanguage="en"
             onLanguageChange={mockOnLanguageChange}
           />
         );

         // Verify available languages are displayed
       });

       it('displays current language as selected', () => {
         render(
           <GuestLanguageSwitcher
             currentLanguage="fr"
             availableTranslations={['en', 'fr', 'es']}
             sourceLanguage="en"
             onLanguageChange={mockOnLanguageChange}
           />
         );

         // Verify French is shown as selected
       });
     });
   });
   ```

**Acceptance Criteria:**
- [ ] Test file `/src/components/guest/__tests__/language-detection-integration.test.tsx` exists
- [ ] GuestLanguageSwitcher callback tests implemented
- [ ] Available translations display tested
- [ ] Current selection display tested

**Files to Create:**
- `/src/components/guest/__tests__/language-detection-integration.test.tsx`

---

### TASK-022: Create TranslationBanner Integration Tests

**Priority:** P2 (Medium)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-021

**Description:**
Create integration tests for the TranslationBanner component.

**Implementation Steps:**

1. Add to `/src/components/guest/__tests__/language-detection-integration.test.tsx`:

2. Implement TranslationBanner tests:
   ```typescript
   describe('TranslationBanner Integration', () => {
     const mockOnViewOriginal = vi.fn();

     beforeEach(() => {
       mockOnViewOriginal.mockClear();
     });

     it('appears when showing translated content', () => {
       render(
         <TranslationBanner
           sourceLanguage="es"
           displayLanguage="en"
           onViewOriginal={mockOnViewOriginal}
         />
       );

       // Verify banner is visible
       expect(screen.getByRole('banner')).toBeInTheDocument();
     });

     it('displays source language information', () => {
       render(
         <TranslationBanner
           sourceLanguage="es"
           displayLanguage="en"
           onViewOriginal={mockOnViewOriginal}
         />
       );

       // Verify "Translated from Spanish" or similar is shown
     });

     it('View Original triggers callback', async () => {
       render(
         <TranslationBanner
           sourceLanguage="es"
           displayLanguage="en"
           onViewOriginal={mockOnViewOriginal}
         />
       );

       const viewOriginalButton = screen.getByText(/view original/i);
       fireEvent.click(viewOriginalButton);

       expect(mockOnViewOriginal).toHaveBeenCalled();
     });
   });
   ```

**Acceptance Criteria:**
- [ ] TranslationBanner visibility tested
- [ ] Source language display tested
- [ ] View Original callback tested

**Files to Modify:**
- `/src/components/guest/__tests__/language-detection-integration.test.tsx`

---

### TASK-023: Create MissingTranslationBanner Integration Tests

**Priority:** P2 (Medium)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-022

**Description:**
Create integration tests for the MissingTranslationBanner component.

**Implementation Steps:**

1. Add to `/src/components/guest/__tests__/language-detection-integration.test.tsx`:

2. Implement MissingTranslationBanner tests:
   ```typescript
   describe('MissingTranslationBanner Integration', () => {
     it('appears when translation unavailable', () => {
       render(
         <MissingTranslationBanner
           requestedLanguage="fr"
           displayLanguage="en"
         />
       );

       expect(screen.getByRole('status')).toBeInTheDocument();
     });

     it('shows correct fallback information', () => {
       render(
         <MissingTranslationBanner
           requestedLanguage="de"
           displayLanguage="en"
         />
       );

       // Verify it shows "German translation not available" or similar
       // Verify it shows "Showing content in English" or similar
     });

     it('does not show error styling', () => {
       render(
         <MissingTranslationBanner
           requestedLanguage="it"
           displayLanguage="en"
         />
       );

       const banner = screen.getByRole('status');
       // Verify muted/info styling, not error styling
       expect(banner).not.toHaveClass('error');
     });
   });
   ```

**Acceptance Criteria:**
- [ ] MissingTranslationBanner visibility tested
- [ ] Fallback information display tested
- [ ] Styling verified as non-alarming

**Files to Modify:**
- `/src/components/guest/__tests__/language-detection-integration.test.tsx`

---

### TASK-024: Update Vitest Configuration for New Test Paths

**Priority:** P1 (High)
**Estimated Effort:** 15 minutes
**Dependencies:** TASK-001

**Description:**
Update vitest.config.ts to include the new test paths and coverage for language detection.

**Implementation Steps:**

1. Open `/vitest.config.ts`

2. Update include patterns to ensure i18n tests are included:
   ```typescript
   include: [
     'src/**/*.test.ts',
     'src/**/*.test.tsx',
   ],
   ```

3. Update coverage include to add i18n coverage:
   ```typescript
   coverage: {
     include: [
       'src/components/ItemCreationWorkflow/**/*.ts',
       'src/components/ItemCreationWorkflow/**/*.tsx',
       'src/lib/job-queue/**/*.ts',
       'src/lib/translation-service/**/*.ts',
       'src/lib/i18n/**/*.ts',  // Add this line
       'src/components/guest/**/*.tsx',  // Add this line
     ],
   },
   ```

**Acceptance Criteria:**
- [ ] i18n test paths included in vitest config
- [ ] Coverage includes i18n modules
- [ ] Coverage includes guest components
- [ ] Configuration is valid (no syntax errors)

**Files to Modify:**
- `/vitest.config.ts`

---

### TASK-025: Create Test Results Template Document

**Priority:** P2 (Medium)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-001

**Description:**
Create a test results documentation template for recording test execution outcomes.

**Implementation Steps:**

1. Create file `/docs/testing/REQ-E04-023-test-results.md`

2. Add template content:
   ```markdown
   # Language Detection Test Results - REQ-E04-023

   **Document Created:** 2026-01-20
   **Last Updated:** [DATE]
   **Test Executor:** [NAME]
   **Test Environment:** [ENV]

   ## Test Execution Summary

   | Metric | Value |
   |--------|-------|
   | Total Test Cases | |
   | Passed | |
   | Failed | |
   | Skipped | |
   | Pass Rate | |
   | Execution Time | |

   ## Results by Scenario Group

   ### Group 1: Browser Language Detection (TC-1.x)

   | Test ID | Description | Status | Notes |
   |---------|-------------|--------|-------|
   | TC-1.1 | Basic header parsing | | |
   | TC-1.2 | Regional variant mapping | | |
   | TC-1.3 | Quality value ordering | | |
   | TC-1.4 | Malformed header handling | | |
   | TC-1.5 | Unsupported language fallback | | |

   ### Group 2: Cookie Persistence (TC-2.x)

   | Test ID | Description | Status | Notes |
   |---------|-------------|--------|-------|
   | TC-2.1 | Cookie creation | | |
   | TC-2.2 | Cookie expiration | | |
   | TC-2.3 | Cookie security attributes | | |
   | TC-2.4 | Returning guest detection | | |
   | TC-2.5 | Cookie vs Accept-Language priority | | |
   | TC-2.6 | Cookie error handling | | |

   ### Group 3: URL Parameter Override (TC-3.x)

   | Test ID | Description | Status | Notes |
   |---------|-------------|--------|-------|
   | TC-3.1 | Basic URL parameter | | |
   | TC-3.2 | URL vs Cookie priority | | |
   | TC-3.3 | URL vs Accept-Language priority | | |
   | TC-3.4 | Invalid URL parameter handling | | |
   | TC-3.5 | Case insensitivity | | |

   ### Group 4: Translation Fallback (TC-4.x)

   | Test ID | Description | Status | Notes |
   |---------|-------------|--------|-------|
   | TC-4.1 | Missing translation fallback | | |
   | TC-4.2 | MissingTranslationBanner display | | |
   | TC-4.3 | Original content display | | |
   | TC-4.4 | Translation metadata | | |
   | TC-4.5 | Default English fallback | | |

   ### Group 5: Complete Priority Chain (TC-5.x)

   | Test ID | Description | Status | Notes |
   |---------|-------------|--------|-------|
   | TC-5.1 | Full priority chain validation | | |
   | TC-5.2 | Override behavior | | |
   | TC-5.3 | All supported languages | | |

   ## Issues Found

   | Issue ID | Severity | Test ID | Description | Steps to Reproduce |
   |----------|----------|---------|-------------|-------------------|
   | | | | | |

   ## Notes and Observations

   [Add any additional notes from test execution]

   ## Sign-off

   - [ ] All P1 tests passing
   - [ ] All P2 tests passing or documented
   - [ ] Issues documented and prioritized
   - [ ] Test coverage meets target (>90%)
   ```

**Acceptance Criteria:**
- [ ] Template file `/docs/testing/REQ-E04-023-test-results.md` exists
- [ ] All test groups included
- [ ] Issues tracking section included
- [ ] Sign-off checklist included

**Files to Create:**
- `/docs/testing/REQ-E04-023-test-results.md`

---

### TASK-026: Run Initial Test Suite and Document Results

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-019, TASK-023, TASK-024

**Description:**
Execute the complete test suite and document initial results.

**Implementation Steps:**

1. Run all language detection tests:
   ```bash
   npx vitest run src/lib/i18n/__tests__/ --reporter=verbose
   ```

2. Run component integration tests:
   ```bash
   npx vitest run src/components/guest/__tests__/ --reporter=verbose
   ```

3. Generate coverage report:
   ```bash
   npx vitest run --coverage
   ```

4. Update `/docs/testing/REQ-E04-023-test-results.md` with:
   - Test execution date
   - Pass/fail counts
   - Coverage percentages
   - Any failures or issues found

**Acceptance Criteria:**
- [ ] All tests executed
- [ ] Coverage report generated
- [ ] Results documented in test results file
- [ ] Any failures noted with details

**Files to Modify:**
- `/docs/testing/REQ-E04-023-test-results.md`

---

### TASK-027: Fix Any Failing Tests and Document Issues

**Priority:** P1 (High)
**Estimated Effort:** 60 minutes
**Dependencies:** TASK-026

**Description:**
Review any failing tests, determine root cause, and either fix tests or document as implementation issues.

**Implementation Steps:**

1. Review each failing test from TASK-026

2. For each failure, determine:
   - Is this a test issue (incorrect expectation)?
   - Is this an implementation issue (bug in code)?

3. For test issues:
   - Update test to match correct behavior
   - Add comment explaining the fix

4. For implementation issues:
   - Document in test results with severity
   - Create ticket/issue for fix if needed
   - Mark test as `.skip` with explanation if blocking

5. Re-run tests to verify fixes

**Acceptance Criteria:**
- [ ] All test failures reviewed
- [ ] Test issues fixed
- [ ] Implementation issues documented
- [ ] Final test run shows all tests passing or documented as known issues

**Files to Modify:**
- Various test files as needed
- `/docs/testing/REQ-E04-023-test-results.md`

---

### TASK-028: Final Documentation and Acceptance Criteria Verification

**Priority:** P1 (High)
**Estimated Effort:** 30 minutes
**Dependencies:** TASK-027

**Description:**
Complete final documentation, verify all acceptance criteria are met, and sign off on the task.

**Implementation Steps:**

1. Review the acceptance criteria checklist from the overview document

2. For each criterion, verify:
   - Test case exists
   - Test passes
   - Document evidence in test results

3. Update test results document with:
   - Final pass/fail counts
   - Coverage metrics
   - Sign-off section

4. Update the "Last Modified" date on this detailed document

**Acceptance Criteria:**
- [ ] All 23 acceptance criteria from REQ-E04-023 verified
- [ ] Test coverage > 90% for language detection
- [ ] Zero critical/high severity issues remaining
- [ ] Test execution time < 30 seconds
- [ ] All documentation complete and accurate

**Files to Modify:**
- `/docs/testing/REQ-E04-023-test-results.md`
- This document (update Last Modified date)

---

## Summary of Files to Create

| File Path | Task |
|-----------|------|
| `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts` | TASK-002, TASK-003, TASK-004 |
| `/src/lib/i18n/__tests__/helpers/index.ts` | TASK-005 |
| `/src/lib/i18n/__tests__/guest-language-detection.test.ts` | TASK-006 through TASK-010 |
| `/src/lib/i18n/__tests__/guest-language-cookie.test.ts` | TASK-011 through TASK-013 |
| `/src/lib/i18n/__tests__/guest-language-url-param.test.ts` | TASK-014 through TASK-016 |
| `/src/lib/i18n/__tests__/guest-language-fallback.test.ts` | TASK-017, TASK-018 |
| `/src/lib/i18n/__tests__/guest-language-priority-chain.test.ts` | TASK-019 |
| `/src/components/guest/__tests__/setup.ts` | TASK-020 |
| `/src/components/guest/__tests__/language-detection-integration.test.tsx` | TASK-021 through TASK-023 |
| `/docs/testing/REQ-E04-023-test-results.md` | TASK-025 |

## Summary of Files to Modify

| File Path | Task |
|-----------|------|
| `/vitest.config.ts` | TASK-024 |

---

## Dependencies Graph

```
TASK-001 (Directory Structure)
    ├── TASK-002 (Mock Factory)
    │       └── TASK-003 (Test Data)
    │               └── TASK-004 (Assertions)
    │                       └── TASK-005 (Index Export)
    │                               ├── TASK-006 → TASK-007 → TASK-008 → TASK-009 → TASK-010 (Accept-Language)
    │                               ├── TASK-011 → TASK-012 → TASK-013 (Cookie)
    │                               ├── TASK-014 → TASK-015 → TASK-016 (URL Param)
    │                               └── TASK-017 → TASK-018 (Fallback)
    │                                       └── TASK-019 (Priority Chain)
    │                                               └── TASK-020 → TASK-021 → TASK-022 → TASK-023 (Components)
    ├── TASK-024 (Vitest Config)
    └── TASK-025 (Test Results Template)
            └── TASK-026 (Run Tests)
                    └── TASK-027 (Fix Issues)
                            └── TASK-028 (Final Documentation)
```

---

## Estimated Total Effort

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Setup & Utilities | TASK-001 to TASK-005 | 2.0 |
| Accept-Language Tests | TASK-006 to TASK-010 | 2.5 |
| Cookie Tests | TASK-011 to TASK-013 | 1.75 |
| URL Parameter Tests | TASK-014 to TASK-016 | 1.75 |
| Fallback Tests | TASK-017, TASK-018 | 1.25 |
| Priority Chain Tests | TASK-019 | 1.0 |
| Component Tests | TASK-020 to TASK-023 | 2.25 |
| Configuration & Documentation | TASK-024, TASK-025 | 0.75 |
| Execution & Fixes | TASK-026 to TASK-028 | 2.0 |
| **Total** | **28 tasks** | **~15-18 hours** |

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Test coverage | > 90% | Vitest coverage report |
| All priority chain scenarios | 100% passing | Test run results |
| All edge cases documented | 100% | Code review |
| Critical/high severity issues | 0 | Issue tracker |
| Test execution time | < 30 seconds | Test run timing |

---

## References

- Overview Document: `/docs/REQ-E04-023-test-language-detection-scenarios-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Document: `/docs/gen_requests_epic4.md` (REQ-E04-023)
- Existing Language Detection: `/src/lib/i18n/language-detection.ts`
- i18n Configuration: `/src/lib/i18n/config.ts`
- Test Configuration: `/vitest.config.ts`
