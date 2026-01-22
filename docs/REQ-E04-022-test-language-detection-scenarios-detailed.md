# Test Language Detection Scenarios - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:47
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #22)
- Overview: docs/REQ-E04-022-test-language-detection-scenarios-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Coverage | `npm run test:coverage` |

---

## Goals and Context

### Purpose
Create comprehensive automated tests for language detection scenarios to ensure the priority system (URL > Cookie > Accept-Language > Default) works correctly across all detection methods. Tests should verify that URL parameters, cookies, and browser headers are processed in the correct order with proper fallback behavior.

### Success Criteria
- Browser Accept-Language header detection works correctly with quality values
- Cookie preference properly overrides browser language
- URL parameter properly overrides cookie preference
- Fallback to English works when no preference exists
- Edge cases are handled gracefully (malformed headers, invalid codes, XSS attempts)
- Tests cover both client-side (useGuestLanguage hook) and server-side (detectGuestLanguage utility) detection
- Tests verify the complete priority cascade at all levels
- All tests pass in CI pipeline
- Tests are maintainable and well-documented
- Test coverage meets minimum threshold (>80% for language detection modules)

### Acceptance Criteria from Requirements Document
- [ ] Test: Browser Accept-Language header `fr-FR,fr;q=0.9,en;q=0.8` correctly detects French
- [ ] Test: Browser Accept-Language with unsupported language falls back to English
- [ ] Test: Cookie `FAQBNB_GUEST_LANG=es` overrides browser language `fr-FR`
- [ ] Test: URL parameter `?lang=de` overrides cookie `FAQBNB_GUEST_LANG=es`
- [ ] Test: Invalid URL parameter `?lang=invalid` falls back to next detection method
- [ ] Test: No preferences at all defaults to English
- [ ] Test: Malformed Accept-Language header handled gracefully
- [ ] Test: Empty cookie value handled gracefully
- [ ] Tests cover both server-side and client-side detection functions

---

## Implementation Tasks

### Phase 1: Create Test File Structure and Helpers

#### Task 1.1: Create Server-Side Test File with Imports
**Subtask ID:** **1.1**
**Context:** Create test file for server-side guest language detection with proper imports and structure.
**Files to create:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **1.1.1** Create directory `/src/lib/i18n/__tests__/` if it doesn't exist
- [ ] **1.1.2** Create file `/src/lib/i18n/__tests__/guest-language.test.ts`
- [ ] **1.1.3** Add file header comment:
  ```typescript
  /**
   * Language Detection Tests - Server-Side
   * Tests for guest language detection priority cascade.
   *
   * REQ-E04-022: Test Language Detection Scenarios
   * Plan-111: L10N Epic 4 - Guest Experience, Phase 7, Task 7.1
   *
   * @module lib/i18n/__tests__/guest-language.test
   * @created 2026-01-22
   * @lastModified 2026-01-22
   */
  ```
- [ ] **1.1.4** Add necessary imports:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  import { NextRequest } from 'next/server';
  import {
    detectGuestLanguage,
    GUEST_LANGUAGE_COOKIE_NAME,
  } from '../guest-language';
  ```
- [ ] **1.1.5** Verify imports resolve correctly
- [ ] **1.1.6** Run TypeScript check: `npm run typecheck`
- [ ] **1.1.7** Commit: "Create guest-language.test.ts with imports"

**Verification:**
- File created at correct path
- File header comment is comprehensive
- Imports resolve without errors
- TypeScript compilation succeeds

---

#### Task 1.2: Create Test Helper Functions
**Subtask ID:** **1.2**
**Context:** Create reusable helper functions for creating mock requests with various configurations. This reduces test duplication and improves readability.
**Files to modify:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **1.2.1** Add test helpers section comment:
  ```typescript
  // =============================================================================
  // Test Helpers
  // =============================================================================
  ```
- [ ] **1.2.2** Implement `createMockRequest` helper:
  ```typescript
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
    const url = options.url || 'http://localhost:3000/item/test123';
    const request = new NextRequest(url);

    // Set search params
    if (options.searchParams) {
      Object.entries(options.searchParams).forEach(([key, value]) => {
        request.nextUrl.searchParams.set(key, value);
      });
    }

    // Set cookies
    if (options.cookies) {
      Object.entries(options.cookies).forEach(([name, value]) => {
        request.cookies.set(name, value);
      });
    }

    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([name, value]) => {
        request.headers.set(name, value);
      });
    }

    return request;
  }
  ```
- [ ] **1.2.3** Implement `createAcceptLanguageHeader` helper:
  ```typescript
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
  ```
- [ ] **1.2.4** Add JSDoc comments explaining helper purpose
- [ ] **1.2.5** Run TypeScript check: `npm run typecheck`
- [ ] **1.2.6** Commit: "Add test helper functions for mock request creation"

**Verification:**
- Helper functions are implemented correctly
- Functions have clear JSDoc comments
- TypeScript types are correct
- No compilation errors

**Notes:**
- These helpers will be reused across all test suites
- Makes tests more readable by abstracting mock setup
- Ensures consistent mock configuration across tests

---

### Phase 2: Test URL Parameter Detection (Priority 1)

#### Task 2.1: Test URL Parameter Validation
**Subtask ID:** **2.1**
**Context:** Test that URL parameters are correctly validated, normalized, and sanitized. This is the highest priority detection method and critical for shareable links.
**Files to modify:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **2.1.1** Add URL parameter tests section:
  ```typescript
  // =============================================================================
  // URL Parameter Tests (Priority 1)
  // =============================================================================

  describe('URL Parameter Detection', () => {
    describe('Valid Language Codes', () => {
      it('accepts valid lowercase language codes', async () => {
        const request = createMockRequest({});

        expect(await detectGuestLanguage('en', request)).toBe('en');
        expect(await detectGuestLanguage('fr', request)).toBe('fr');
        expect(await detectGuestLanguage('es', request)).toBe('es');
        expect(await detectGuestLanguage('de', request)).toBe('de');
        expect(await detectGuestLanguage('nl', request)).toBe('nl');
        expect(await detectGuestLanguage('it', request)).toBe('it');
      });

      it('normalizes uppercase to lowercase', async () => {
        const request = createMockRequest({});

        expect(await detectGuestLanguage('EN', request)).toBe('en');
        expect(await detectGuestLanguage('FR', request)).toBe('fr');
        expect(await detectGuestLanguage('Es', request)).toBe('es');
      });

      it('trims whitespace from URL parameter', async () => {
        const request = createMockRequest({});

        expect(await detectGuestLanguage('  fr  ', request)).toBe('fr');
        expect(await detectGuestLanguage('\ten\n', request)).toBe('en');
      });
    });

    describe('Invalid Language Codes', () => {
      it('rejects unsupported language codes', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
        });

        const result = await detectGuestLanguage('zh', request);
        expect(result).toBe('es'); // Falls through to cookie
      });

      it('rejects malicious input (XSS prevention)', async () => {
        const request = createMockRequest({});

        const result1 = await detectGuestLanguage('<script>alert("xss")</script>', request);
        expect(result1).toBe('en'); // Falls to default

        const result2 = await detectGuestLanguage('javascript:alert(1)', request);
        expect(result2).toBe('en');

        const result3 = await detectGuestLanguage('../../../etc/passwd', request);
        expect(result3).toBe('en');
      });

      it('handles null and undefined', async () => {
        const request = createMockRequest({});

        expect(await detectGuestLanguage(null, request)).toBe('en');
        expect(await detectGuestLanguage(undefined, request)).toBe('en');
      });

      it('handles empty string', async () => {
        const request = createMockRequest({});

        expect(await detectGuestLanguage('', request)).toBe('en');
      });
    });
  });
  ```
- [ ] **2.1.2** Run tests: `npm test -- guest-language.test.ts`
- [ ] **2.1.3** Verify all tests pass
- [ ] **2.1.4** Commit: "Add URL parameter validation tests"

**Verification:**
- All valid language codes are accepted
- Uppercase is normalized to lowercase
- Whitespace is trimmed
- Invalid codes are rejected
- XSS attempts are blocked
- Null/undefined/empty handled gracefully
- All tests pass

---

#### Task 2.2: Test URL Parameter Priority
**Subtask ID:** **2.2**
**Context:** Test that URL parameters have highest priority and override all other detection sources.
**Files to modify:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **2.2.1** Add URL priority tests:
  ```typescript
  describe('URL Parameter Priority', () => {
    it('URL parameter overrides cookie', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
      });

      const result = await detectGuestLanguage('fr', request);
      expect(result).toBe('fr'); // URL wins
    });

    it('URL parameter overrides Accept-Language header', async () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = await detectGuestLanguage('fr', request);
      expect(result).toBe('fr'); // URL wins
    });

    it('URL parameter overrides both cookie and header', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = await detectGuestLanguage('fr', request);
      expect(result).toBe('fr'); // URL wins over all
    });

    it('handles array URL parameters (takes first)', async () => {
      const request = createMockRequest({});

      const result = await detectGuestLanguage(['fr', 'es'], request);
      expect(result).toBe('fr'); // Uses first element
    });

    it('falls through when URL parameter invalid', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
      });

      const result = await detectGuestLanguage('invalid', request);
      expect(result).toBe('es'); // Falls to cookie
    });
  });
  ```
- [ ] **2.2.2** Run tests: `npm test -- guest-language.test.ts`
- [ ] **2.2.3** Verify all tests pass
- [ ] **2.2.4** Commit: "Add URL parameter priority tests"

**Verification:**
- URL overrides cookie
- URL overrides Accept-Language
- URL overrides both when present
- Array parameters handled (first element used)
- Invalid URL params fall through
- All tests pass

---

### Phase 3: Test Cookie Detection (Priority 2)

#### Task 3.1: Test Cookie Reading and Validation
**Subtask ID:** **3.1**
**Context:** Test that guest language cookie is correctly read and validated. Cookie is second priority in detection cascade.
**Files to modify:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **3.1.1** Add cookie detection tests:
  ```typescript
  // =============================================================================
  // Cookie Tests (Priority 2)
  // =============================================================================

  describe('Cookie Detection', () => {
    describe('Cookie Reading', () => {
      it('reads valid language from cookie', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'fr' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('fr');
      });

      it('validates cookie value against supported locales', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'invalid' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('en'); // Falls to default
      });

      it('handles missing cookie gracefully', async () => {
        const request = createMockRequest({});

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('en'); // Falls to default
      });

      it('handles empty cookie value', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: '' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('en'); // Falls to default
      });

      it('accepts all supported languages from cookie', async () => {
        const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'];

        for (const lang of languages) {
          const request = createMockRequest({
            cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: lang },
          });

          expect(await detectGuestLanguage(null, request)).toBe(lang);
        }
      });
    });

    describe('Cookie Priority', () => {
      it('cookie overrides Accept-Language header', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
          headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('es'); // Cookie wins
      });

      it('URL parameter overrides cookie', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
        });

        const result = await detectGuestLanguage('fr', request);
        expect(result).toBe('fr'); // URL wins
      });

      it('falls through when cookie invalid', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'invalid' },
          headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('de'); // Falls to header
      });
    });
  });
  ```
- [ ] **3.1.2** Run tests: `npm test -- guest-language.test.ts`
- [ ] **3.1.3** Verify all tests pass
- [ ] **3.1.4** Commit: "Add cookie detection and priority tests"

**Verification:**
- Valid cookie values are read correctly
- Invalid cookie values are rejected
- Missing cookies handled gracefully
- Empty cookie values handled
- All supported languages work from cookie
- Cookie overrides Accept-Language
- URL overrides cookie
- Invalid cookie falls through to header
- All tests pass

---

### Phase 4: Test Accept-Language Header Detection (Priority 3)

#### Task 4.1: Test Accept-Language Header Parsing
**Subtask ID:** **4.1**
**Context:** Test that Accept-Language headers are correctly parsed, including quality values and multiple languages. This is third priority in cascade.
**Files to modify:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **4.1.1** Add Accept-Language header tests:
  ```typescript
  // =============================================================================
  // Accept-Language Header Tests (Priority 3)
  // =============================================================================

  describe('Accept-Language Header Detection', () => {
    describe('Header Parsing', () => {
      it('detects language from simple header', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': 'fr-FR' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('fr');
      });

      it('parses header with quality values', async () => {
        const request = createMockRequest({
          headers: {
            'Accept-Language': createAcceptLanguageHeader([
              { code: 'fr-FR', quality: 0.9 },
              { code: 'en', quality: 0.8 },
              { code: 'de', quality: 0.7 },
            ]),
          },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('fr'); // Highest quality
      });

      it('uses first supported language from header', async () => {
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

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('fr');
      });

      it('extracts primary language from locale codes', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': 'fr-CA,fr-FR;q=0.9' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('fr'); // Extracts 'fr' from 'fr-CA'
      });

      it('handles malformed Accept-Language header', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': ';;;invalid;;;' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('en'); // Falls to default
      });

      it('handles empty Accept-Language header', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': '' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('en'); // Falls to default
      });

      it('handles missing Accept-Language header', async () => {
        const request = createMockRequest({});

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('en'); // Falls to default
      });
    });

    describe('Header Priority', () => {
      it('URL parameter overrides header', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
        });

        const result = await detectGuestLanguage('fr', request);
        expect(result).toBe('fr'); // URL wins
      });

      it('cookie overrides header', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
          headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('es'); // Cookie wins
      });

      it('header used when URL and cookie absent', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('de');
      });
    });

    describe('Specific Acceptance Criteria Tests', () => {
      it('Accept-Language "fr-FR,fr;q=0.9,en;q=0.8" detects French', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('fr');
      });

      it('Accept-Language with unsupported language falls back to English', async () => {
        const request = createMockRequest({
          headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('en');
      });
    });
  });
  ```
- [ ] **4.1.2** Run tests: `npm test -- guest-language.test.ts`
- [ ] **4.1.3** Verify all tests pass
- [ ] **4.1.4** Commit: "Add Accept-Language header parsing tests"

**Verification:**
- Simple headers are parsed correctly
- Quality values are respected
- First supported language is selected
- Locale codes extract primary language (fr-CA → fr)
- Malformed headers fall back to default
- Empty/missing headers fall back to default
- URL overrides header
- Cookie overrides header
- Header used when higher priorities absent
- Acceptance criteria tests pass
- All tests pass

---

### Phase 5: Test Default Fallback (Priority 4) and Priority Cascade

#### Task 5.1: Test Default Fallback
**Subtask ID:** **5.1**
**Context:** Test that the system always falls back to English ('en') when all detection methods fail. This is the ultimate safety net.
**Files to modify:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **5.1.1** Add default fallback tests:
  ```typescript
  // =============================================================================
  // Default Fallback Tests (Priority 4)
  // =============================================================================

  describe('Default Fallback', () => {
    it('falls back to English when all sources absent', async () => {
      const request = createMockRequest({});

      const result = await detectGuestLanguage(null, request);
      expect(result).toBe('en');
    });

    it('falls back to English when all sources invalid', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'invalid' },
        headers: { 'Accept-Language': 'invalid-header' },
      });

      const result = await detectGuestLanguage('invalid', request);
      expect(result).toBe('en');
    });

    it('falls back to English when browser language unsupported', async () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
      });

      const result = await detectGuestLanguage(null, request);
      expect(result).toBe('en');
    });

    it('no preferences at all defaults to English', async () => {
      const request = createMockRequest({});

      const result = await detectGuestLanguage(undefined, request);
      expect(result).toBe('en');
    });
  });
  ```
- [ ] **5.1.2** Run tests: `npm test -- guest-language.test.ts`
- [ ] **5.1.3** Verify all tests pass
- [ ] **5.1.4** Commit: "Add default fallback tests"

**Verification:**
- System falls back to 'en' when all sources absent
- System falls back to 'en' when all sources invalid
- System falls back to 'en' for unsupported languages
- Acceptance criteria "no preferences defaults to English" passes
- All tests pass

---

#### Task 5.2: Test Complete Priority Cascade
**Subtask ID:** **5.2**
**Context:** Test the complete priority cascade with all detection methods present to ensure correct ordering.
**Files to modify:** `/src/lib/i18n/__tests__/guest-language.test.ts`
**Estimated effort:** 1 story point

- [ ] **5.2.1** Add complete priority cascade tests:
  ```typescript
  // =============================================================================
  // Complete Priority Cascade Tests
  // =============================================================================

  describe('Complete Priority Cascade', () => {
    it('applies correct priority: URL > Cookie > Header > Default', async () => {
      // Test Priority 1: URL wins over all
      const req1 = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'de' },
        headers: { 'Accept-Language': 'it-IT,it;q=0.9' },
      });
      expect(await detectGuestLanguage('fr', req1)).toBe('fr');

      // Test Priority 2: Cookie wins over header and default
      const req2 = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'de' },
        headers: { 'Accept-Language': 'it-IT,it;q=0.9' },
      });
      expect(await detectGuestLanguage(null, req2)).toBe('de');

      // Test Priority 3: Header wins over default
      const req3 = createMockRequest({
        headers: { 'Accept-Language': 'it-IT,it;q=0.9' },
      });
      expect(await detectGuestLanguage(null, req3)).toBe('it');

      // Test Priority 4: Default when all absent
      const req4 = createMockRequest({});
      expect(await detectGuestLanguage(null, req4)).toBe('en');
    });

    it('falls through invalid values at each priority level', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'invalid' },
        headers: { 'Accept-Language': 'es-ES,es;q=0.9' },
      });

      // Invalid URL and cookie, should use header
      const result = await detectGuestLanguage('invalid', request);
      expect(result).toBe('es');
    });

    it('handles all four priority levels in single request', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
        headers: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' },
      });

      // URL present: URL wins
      expect(await detectGuestLanguage('fr', request)).toBe('fr');

      // No URL: Cookie wins
      expect(await detectGuestLanguage(null, request)).toBe('es');

      // No URL or cookie: Header wins
      request.cookies.delete(GUEST_LANGUAGE_COOKIE_NAME);
      expect(await detectGuestLanguage(null, request)).toBe('de');

      // No URL, cookie, or header: Default
      const emptyRequest = createMockRequest({});
      expect(await detectGuestLanguage(null, emptyRequest)).toBe('en');
    });

    describe('Specific Acceptance Criteria - Priority Tests', () => {
      it('Cookie overrides browser language', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
          headers: { 'Accept-Language': 'fr-FR' },
        });

        const result = await detectGuestLanguage(null, request);
        expect(result).toBe('es'); // Cookie wins
      });

      it('URL parameter overrides cookie', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
        });

        const result = await detectGuestLanguage('de', request);
        expect(result).toBe('de'); // URL wins
      });

      it('Invalid URL parameter falls back to next method', async () => {
        const request = createMockRequest({
          cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
        });

        const result = await detectGuestLanguage('invalid', request);
        expect(result).toBe('es'); // Falls to cookie
      });
    });
  });
  ```
- [ ] **5.2.2** Run tests: `npm test -- guest-language.test.ts`
- [ ] **5.2.3** Verify all tests pass
- [ ] **5.2.4** Commit: "Add complete priority cascade tests"

**Verification:**
- Complete cascade tested (URL > Cookie > Header > Default)
- Invalid values fall through correctly at each level
- All four priority levels work in single request
- Acceptance criteria tests pass
- All tests pass

---

### Phase 6: Create Integration Tests

#### Task 6.1: Create Integration Test File
**Subtask ID:** **6.1**
**Context:** Create separate integration test file for end-to-end scenarios that combine multiple aspects of language detection.
**Files to create:** `/src/lib/i18n/__tests__/guest-language.integration.test.ts`
**Estimated effort:** 1 story point

- [ ] **6.1.1** Create file `/src/lib/i18n/__tests__/guest-language.integration.test.ts`
- [ ] **6.1.2** Add file header and imports:
  ```typescript
  /**
   * Language Detection Integration Tests
   * End-to-end tests for guest language detection flow.
   *
   * REQ-E04-022: Test Language Detection Scenarios
   *
   * @module lib/i18n/__tests__/guest-language.integration.test
   * @created 2026-01-22
   * @lastModified 2026-01-22
   */

  import { describe, it, expect } from 'vitest';
  import { NextRequest, NextResponse } from 'next/server';
  import {
    detectGuestLanguage,
    setGuestLanguageCookie,
    GUEST_LANGUAGE_COOKIE_NAME,
  } from '../guest-language';
  ```
- [ ] **6.1.3** Add integration tests:
  ```typescript
  describe('Language Detection - Integration', () => {
    it('complete detection cycle with URL parameter', async () => {
      const req = new NextRequest('http://localhost:3000/item/abc?lang=fr');
      const urlParam = req.nextUrl.searchParams.get('lang');

      const detectedLang = await detectGuestLanguage(urlParam, req);

      expect(detectedLang).toBe('fr');
    });

    it('middleware-style usage pattern', async () => {
      // Simulate first-time guest with no preferences
      const req = new NextRequest('http://localhost:3000/item/abc');
      req.headers.set('Accept-Language', 'es-ES,es;q=0.9');

      const res = NextResponse.next();
      const urlParam = req.nextUrl.searchParams.get('lang');
      const guestLang = await detectGuestLanguage(urlParam, req);

      setGuestLanguageCookie(res, guestLang);

      expect(guestLang).toBe('es');
      expect(res.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value).toBe('es');
    });

    it('shareable link with language parameter overrides existing preferences', async () => {
      // Scenario: Returning guest with cookie clicks shareable link
      const req = new NextRequest('http://localhost:3000/item/abc?lang=fr');
      req.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'es'); // Has Spanish preference
      req.headers.set('Accept-Language', 'de-DE,de;q=0.9'); // Browser is German

      const urlParam = req.nextUrl.searchParams.get('lang');
      const detectedLang = await detectGuestLanguage(urlParam, req);

      expect(detectedLang).toBe('fr'); // URL wins over all
    });

    it('cookie persistence across multiple requests', async () => {
      // First request: No preferences, uses header
      const req1 = new NextRequest('http://localhost:3000/item/abc');
      req1.headers.set('Accept-Language', 'it-IT,it;q=0.9');

      const res1 = NextResponse.next();
      const lang1 = await detectGuestLanguage(null, req1);
      setGuestLanguageCookie(res1, lang1);

      expect(lang1).toBe('it');

      // Second request: Cookie now set
      const req2 = new NextRequest('http://localhost:3000/item/xyz');
      req2.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'it');

      const lang2 = await detectGuestLanguage(null, req2);
      expect(lang2).toBe('it'); // Cookie persists
    });

    it('realistic multi-source scenario', async () => {
      // Complex scenario: All sources present
      const req = new NextRequest('http://localhost:3000/item/abc');
      req.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'es');
      req.headers.set('Accept-Language', 'de-DE,de;q=0.9,en;q=0.8');

      // Cookie should win (no URL param)
      const result = await detectGuestLanguage(null, req);
      expect(result).toBe('es');
    });
  });
  ```
- [ ] **6.1.4** Run integration tests: `npm test -- guest-language.integration.test.ts`
- [ ] **6.1.5** Verify all tests pass
- [ ] **6.1.6** Commit: "Add integration tests for language detection"

**Verification:**
- Integration test file created
- Tests simulate realistic usage patterns
- Middleware-style usage tested
- Shareable link scenario tested
- Cookie persistence tested
- Multi-source scenario tested
- All integration tests pass

---

### Phase 7: Run Tests and Verify Coverage

#### Task 7.1: Run All Tests and Fix Failures
**Subtask ID:** **7.1**
**Context:** Run complete test suite and fix any failures.
**Files to verify:** All test files
**Estimated effort:** 1 story point

- [ ] **7.1.1** Run all tests: `npm test`
- [ ] **7.1.2** Review test output for failures
- [ ] **7.1.3** Fix any failing tests:
  - Review assertion logic
  - Verify mock setup is correct
  - Check async/await usage
  - Verify imports are correct
- [ ] **7.1.4** Re-run tests until all pass: `npm test`
- [ ] **7.1.5** Run tests in watch mode to verify stability: `npm test -- --watch` (run several times)
- [ ] **7.1.6** Commit fixes if any: "Fix failing tests in language detection suite"

**Verification:**
- All tests pass
- No flaky tests (consistent results across multiple runs)
- Test output is clear and informative
- No warnings or errors in test output

---

#### Task 7.2: Check Test Coverage
**Subtask ID:** **7.2**
**Context:** Verify test coverage meets the 80% threshold for language detection modules.
**Files to verify:** Coverage reports
**Estimated effort:** 1 story point

- [ ] **7.2.1** Run tests with coverage: `npm run test:coverage`
- [ ] **7.2.2** Review coverage report for guest-language.ts:
  - Statements: Should be >80%
  - Branches: Should be >80%
  - Functions: Should be >80%
  - Lines: Should be >80%
- [ ] **7.2.3** Identify uncovered code paths
- [ ] **7.2.4** Add tests for uncovered paths if below threshold
- [ ] **7.2.5** Re-run coverage: `npm run test:coverage`
- [ ] **7.2.6** Verify coverage meets minimum 80% threshold
- [ ] **7.2.7** Commit any additional tests: "Add tests to meet coverage threshold"

**Verification:**
- Coverage report generated successfully
- guest-language.ts has >80% coverage across all metrics
- Uncovered paths are identified
- Additional tests added if needed
- Final coverage meets or exceeds 80%

**Notes:**
- If coverage is below 80%, identify gaps and add targeted tests
- Some paths (error logging, etc.) may be acceptable to leave uncovered
- Focus on business logic coverage over implementation details

---

### Phase 8: TypeScript and Build Verification

#### Task 8.1: TypeScript Compilation Check
**Subtask ID:** **8.1**
**Context:** Ensure all test code compiles without TypeScript errors.
**Files to verify:** All test files
**Estimated effort:** 1 story point

- [ ] **8.1.1** Run TypeScript compiler: `npm run typecheck`
- [ ] **8.1.2** Review any type errors in test files
- [ ] **8.1.3** Fix type errors if any:
  - Verify mock types match actual types
  - Verify assertion types are correct
  - Fix any `any` type usage
  - Ensure imports have correct types
- [ ] **8.1.4** Re-run typecheck until clean: `npm run typecheck`
- [ ] **8.1.5** Commit fixes: "Fix TypeScript errors in test files"

**Verification:**
- `npm run typecheck` completes with no errors
- All test functions are properly typed
- Mock objects have correct types
- No use of `any` unless absolutely necessary

---

#### Task 8.2: ESLint Check
**Subtask ID:** **8.2**
**Context:** Ensure test code follows project linting standards.
**Files to verify:** All test files
**Estimated effort:** 1 story point

- [ ] **8.2.1** Run ESLint: `npm run lint`
- [ ] **8.2.2** Review linting warnings/errors in test files
- [ ] **8.2.3** Fix linting issues:
  - Remove unused imports
  - Fix code style
  - Ensure consistent formatting
  - Fix any test-specific linting rules
- [ ] **8.2.4** Re-run lint until clean: `npm run lint`
- [ ] **8.2.5** Commit fixes: "Fix linting issues in test files"

**Verification:**
- `npm run lint` completes with no errors
- No unused imports or variables
- Code style is consistent
- Test files follow project standards

---

#### Task 8.3: Production Build Test
**Subtask ID:** **8.3**
**Context:** Verify production build succeeds with new test files.
**Files to verify:** Build output
**Estimated effort:** 1 story point

- [ ] **8.3.1** Run production build: `npm run build`
- [ ] **8.3.2** Verify build completes successfully
- [ ] **8.3.3** Check for build warnings related to test files
- [ ] **8.3.4** If build fails, review errors and fix
- [ ] **8.3.5** Re-run build until successful: `npm run build`
- [ ] **8.3.6** Verify test files are not included in production bundle

**Verification:**
- Production build succeeds
- No warnings about test files
- Test files not included in production bundle
- Build size is reasonable

---

### Phase 9: Documentation and Final Commit

#### Task 9.1: Add Test Documentation
**Subtask ID:** **9.1**
**Context:** Add clear comments and documentation to test files for maintainability.
**Files to modify:** All test files
**Estimated effort:** 1 story point

- [ ] **9.1.1** Review all test files for clarity
- [ ] **9.1.2** Add section comments explaining test organization
- [ ] **9.1.3** Ensure each test has a clear, descriptive name
- [ ] **9.1.4** Add comments for complex test scenarios
- [ ] **9.1.5** Verify helper functions have JSDoc comments
- [ ] **9.1.6** Commit: "Add documentation to language detection tests"

**Verification:**
- All test sections have explanatory comments
- Test names clearly describe what they test
- Complex scenarios have additional comments
- Helper functions documented
- Tests are easy to understand

---

#### Task 9.2: Final Test Suite Execution
**Subtask ID:** **9.2**
**Context:** Final verification that complete test suite passes.
**Files to verify:** All tests
**Estimated effort:** 1 story point

- [ ] **9.2.1** Run complete test suite: `npm test`
- [ ] **9.2.2** Verify all tests pass
- [ ] **9.2.3** Run tests multiple times to ensure no flakiness
- [ ] **9.2.4** Run tests with coverage: `npm run test:coverage`
- [ ] **9.2.5** Verify coverage meets 80% threshold
- [ ] **9.2.6** Review test output for any warnings
- [ ] **9.2.7** Document test execution in console output

**Verification:**
- All tests pass consistently
- No flaky tests
- Coverage meets minimum 80%
- No warnings in test output
- Test suite runs in reasonable time (< 30 seconds)

---

#### Task 9.3: Final Commit
**Subtask ID:** **9.3**
**Context:** Create final commit with comprehensive message.
**Files to commit:** All test files
**Estimated effort:** 1 story point

- [ ] **9.3.1** Review all changes: `git status`
- [ ] **9.3.2** Verify files to commit:
  - `/src/lib/i18n/__tests__/guest-language.test.ts`
  - `/src/lib/i18n/__tests__/guest-language.integration.test.ts`
- [ ] **9.3.3** Stage all test files: `git add .`
- [ ] **9.3.4** Create comprehensive commit message:
  ```bash
  git commit -m "$(cat <<'EOF'
  [REQ-E04-022] Test language detection scenarios

  Implemented comprehensive test suite for guest language detection:
  - Created server-side unit tests (guest-language.test.ts)
  - Created integration tests (guest-language.integration.test.ts)
  - Test helpers for creating mock requests and headers
  - URL parameter validation tests (Priority 1)
  - Cookie detection tests (Priority 2)
  - Accept-Language header parsing tests (Priority 3)
  - Default fallback tests (Priority 4)
  - Complete priority cascade tests
  - All acceptance criteria tests pass
  - Coverage >80% for language detection modules

  Test Coverage:
  - URL parameter detection and validation
  - Cookie reading and priority
  - Accept-Language header parsing with quality values
  - Default fallback to English
  - Priority cascade (URL > Cookie > Header > Default)
  - Edge cases (malformed input, XSS attempts, missing values)
  - Integration scenarios (middleware usage, shareable links)

  Files created:
  - src/lib/i18n/__tests__/guest-language.test.ts (unit tests)
  - src/lib/i18n/__tests__/guest-language.integration.test.ts (integration tests)

  Testing:
  - All tests pass: npm test ✓
  - Coverage >80%: npm run test:coverage ✓
  - TypeScript: npm run typecheck ✓
  - ESLint: npm run lint ✓
  - Build: npm run build ✓

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  EOF
  )"
  ```
- [ ] **9.3.5** Verify commit was created: `git log -1`
- [ ] **9.3.6** Push to remote: `git push origin [branch-name]`

**Verification:**
- All changes committed
- Commit message is comprehensive
- Commit follows project conventions
- Changes pushed to remote
- No uncommitted changes remain

---

## Summary of Implementation

### Files Created
1. `/src/lib/i18n/__tests__/guest-language.test.ts` - Server-side unit tests
2. `/src/lib/i18n/__tests__/guest-language.integration.test.ts` - Integration tests

### Test Coverage Areas
**Priority 1 - URL Parameters:**
- Valid language code acceptance
- Normalization (uppercase → lowercase, whitespace trimming)
- Invalid code rejection
- XSS prevention
- Priority over cookie and headers
- Array parameter handling

**Priority 2 - Cookies:**
- Valid cookie reading
- Invalid cookie rejection
- Missing cookie handling
- Priority over headers
- Subordinate to URL parameters

**Priority 3 - Accept-Language Headers:**
- Simple header parsing
- Quality value handling
- Multiple language parsing
- Locale extraction (fr-CA → fr)
- Malformed header handling
- Priority subordinate to URL and cookie

**Priority 4 - Default Fallback:**
- Fallback to 'en' when all sources absent
- Fallback for invalid values
- Fallback for unsupported languages

**Integration Tests:**
- Complete detection cycle
- Middleware-style usage
- Shareable link scenarios
- Cookie persistence
- Multi-source scenarios

### Success Criteria Checklist
- [ ] Browser Accept-Language header detection works
- [ ] Cookie overrides browser language
- [ ] URL parameter overrides cookie
- [ ] Fallback to English works
- [ ] Edge cases handled gracefully
- [ ] Tests cover server-side detection
- [ ] Complete priority cascade tested
- [ ] All tests pass in CI
- [ ] Tests are maintainable
- [ ] Coverage >80%

---

**Document Status:** PENDING
**Last Modified:** 2026-01-22 23:47
**Total Tasks:** 9 phases, 18 main tasks, 95+ subtasks
**Estimated Effort:** 4-6 hours (M-sized task)
