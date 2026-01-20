# Implementation Breakdown: REQ-E04-023 - Validate Language Detection Priority and Fallback Scenarios

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-023
**Epic:** Epic 4 - Guest Experience
**Phase:** 7 - Testing & Polish
**Task ID:** 7.1
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

---

## Summary

This task involves comprehensive testing and validation of the language detection priority chain across all guest-facing scenarios. The testing validates that browser Accept-Language headers, cookie preferences, URL parameters, and fallback logic work correctly in isolation and when combined, ensuring guests experience predictable and reliable language selection behavior.

---

## Current State Analysis

### Existing Language Detection Infrastructure

The codebase already has a mature language detection system in place:

| Component | Location | Status |
|-----------|----------|--------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | Exists - comprehensive implementation |
| Middleware Integration | `/src/middleware.ts` | Exists - handles authenticated users |
| Language Preference Hook | `/src/hooks/useLanguagePreference.ts` | Exists - client-side management |
| Cookie Constants | `FAQBNB_LANG` | Defined and used |
| Test Configuration | `/vitest.config.ts` | Exists - Vitest with jsdom |

### Language Detection Priority (Current Implementation)

From `/src/lib/i18n/language-detection.ts`:
1. User database preference (authenticated users)
2. Cookie value (`FAQBNB_LANG`)
3. Accept-Language HTTP header
4. Default locale (`'en'`)

### Guest-Specific Requirements

For guests (unauthenticated users), the priority should be:
1. URL parameter (`?lang=fr`) - highest priority for shareable links
2. Cookie value (`FAQBNB_GUEST_LANG`) - persistence across sessions
3. Accept-Language header - browser preference
4. Default (`'en'`) - fallback

---

## Test Scenarios to Implement

### Scenario Group 1: Browser Language Detection

| Test Case | Description | Priority |
|-----------|-------------|----------|
| TC-1.1 | Accept-Language header parsing extracts highest-priority supported language | P1 |
| TC-1.2 | Regional language variants (en-US, pt-BR) map to base supported languages | P1 |
| TC-1.3 | Multiple languages in Accept-Language evaluated in correct q-value order | P1 |
| TC-1.4 | Malformed Accept-Language headers handled gracefully without errors | P2 |
| TC-1.5 | Accept-Language with unsupported languages falls back to default | P1 |

### Scenario Group 2: Cookie Persistence

| Test Case | Description | Priority |
|-----------|-------------|----------|
| TC-2.1 | Language selection via switcher creates persistent cookie | P1 |
| TC-2.2 | Cookie has correct expiration period (1 year) | P2 |
| TC-2.3 | Cookie includes Secure and SameSite attributes | P2 |
| TC-2.4 | Returning guest with cookie sees content in cookie's language | P1 |
| TC-2.5 | Cookie overrides Accept-Language header when both present | P1 |
| TC-2.6 | Missing/corrupted cookie values trigger graceful fallback | P2 |

### Scenario Group 3: URL Parameter Override

| Test Case | Description | Priority |
|-----------|-------------|----------|
| TC-3.1 | URL with `?lang=es` displays content in specified language | P1 |
| TC-3.2 | URL parameter takes precedence over existing cookie | P1 |
| TC-3.3 | URL parameter takes precedence over Accept-Language header | P1 |
| TC-3.4 | Invalid language code in URL falls back to cookie/browser detection | P1 |
| TC-3.5 | Case-insensitive handling (`?lang=ES` and `?lang=es` both work) | P2 |

### Scenario Group 4: Translation Fallback

| Test Case | Description | Priority |
|-----------|-------------|----------|
| TC-4.1 | Requested language with no translation shows original content | P1 |
| TC-4.2 | MissingTranslationBanner appears when translation unavailable | P1 |
| TC-4.3 | Original content displays correctly during fallback | P1 |
| TC-4.4 | Translation metadata correctly indicates fallback status | P2 |
| TC-4.5 | Default to English when no language detected from any source | P1 |

### Scenario Group 5: Complete Priority Chain

| Test Case | Description | Priority |
|-----------|-------------|----------|
| TC-5.1 | Full priority chain: URL > Cookie > Accept-Language > Default | P1 |
| TC-5.2 | Each priority level correctly overrides lower levels | P1 |
| TC-5.3 | Priority chain works with all six supported languages | P2 |

---

## Implementation Tasks

### Task 1: Create Test Utilities for Language Detection

**File:** `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts`

Create reusable test utilities for language detection testing:

```typescript
// Mock factories
createMockNextRequest(options: {
  url?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}): NextRequest

// Language test data
const TEST_ACCEPT_LANGUAGE_HEADERS = {
  simple: 'en',
  withQuality: 'fr;q=0.9, en;q=0.8, de;q=0.7',
  regional: 'en-US,en;q=0.9',
  unsupported: 'ja,zh;q=0.9',
  malformed: 'invalid,,header;q=invalid',
};

// Assertion helpers
assertLanguageEquals(actual, expected, message?)
assertCookieSet(response, cookieName, expectedValue?)
```

### Task 2: Create Browser Language Detection Tests

**File:** `/src/lib/i18n/__tests__/guest-language-detection.test.ts`

```typescript
describe('Guest Language Detection - Accept-Language Header', () => {
  describe('TC-1.1: Basic header parsing', () => {
    it('extracts highest-priority supported language from simple header');
    it('extracts highest-priority from complex header with q-values');
  });

  describe('TC-1.2: Regional variant mapping', () => {
    it('maps en-US to en');
    it('maps pt-BR to pt (if supported)');
    it('maps zh-CN to zh (if supported)');
  });

  describe('TC-1.3: Quality value ordering', () => {
    it('respects q-values and selects highest-quality supported language');
    it('handles equal q-values correctly');
  });

  describe('TC-1.4: Malformed header handling', () => {
    it('handles malformed headers without throwing');
    it('falls back to default on parse error');
  });

  describe('TC-1.5: Unsupported language fallback', () => {
    it('falls back to default when no supported language in header');
  });
});
```

### Task 3: Create Cookie Persistence Tests

**File:** `/src/lib/i18n/__tests__/guest-language-cookie.test.ts`

```typescript
describe('Guest Language Detection - Cookie Persistence', () => {
  describe('TC-2.1: Cookie creation', () => {
    it('creates cookie when language selected via switcher');
    it('uses correct cookie name FAQBNB_GUEST_LANG');
  });

  describe('TC-2.2: Cookie expiration', () => {
    it('sets expiration to 1 year from creation');
  });

  describe('TC-2.3: Cookie security attributes', () => {
    it('sets Secure flag in production');
    it('sets SameSite=Lax');
    it('sets path to /');
  });

  describe('TC-2.4: Returning guest detection', () => {
    it('reads existing cookie and applies language');
    it('handles returning guest with valid cookie');
  });

  describe('TC-2.5: Cookie vs Accept-Language priority', () => {
    it('cookie preference overrides browser Accept-Language');
    it('cookie is used when both cookie and header present');
  });

  describe('TC-2.6: Cookie error handling', () => {
    it('handles missing cookie gracefully');
    it('handles corrupted/invalid cookie value gracefully');
  });
});
```

### Task 4: Create URL Parameter Tests

**File:** `/src/lib/i18n/__tests__/guest-language-url-param.test.ts`

```typescript
describe('Guest Language Detection - URL Parameter', () => {
  describe('TC-3.1: Basic URL parameter', () => {
    it('?lang=es displays content in Spanish');
    it('?lang=fr displays content in French');
    it('recognizes all six supported languages');
  });

  describe('TC-3.2: URL vs Cookie priority', () => {
    it('URL parameter overrides existing cookie preference');
    it('cookie value is updated when URL param differs');
  });

  describe('TC-3.3: URL vs Accept-Language priority', () => {
    it('URL parameter overrides Accept-Language header');
  });

  describe('TC-3.4: Invalid URL parameter handling', () => {
    it('invalid language code falls back to cookie');
    it('invalid language code falls back to browser when no cookie');
    it('unsupported language code falls back correctly');
  });

  describe('TC-3.5: Case insensitivity', () => {
    it('?lang=ES works same as ?lang=es');
    it('?lang=Fr works same as ?lang=fr');
  });
});
```

### Task 5: Create Translation Fallback Tests

**File:** `/src/lib/i18n/__tests__/guest-language-fallback.test.ts`

```typescript
describe('Guest Language Detection - Translation Fallback', () => {
  describe('TC-4.1: Missing translation fallback', () => {
    it('shows original content when requested translation unavailable');
    it('maintains content integrity during fallback');
  });

  describe('TC-4.2: MissingTranslationBanner display', () => {
    it('banner appears when translation unavailable');
    it('banner shows requested and displayed languages');
  });

  describe('TC-4.3: Original content display', () => {
    it('original content renders correctly during fallback');
    it('all fields show original values');
  });

  describe('TC-4.4: Translation metadata', () => {
    it('metadata indicates fallback status');
    it('metadata shows source language');
    it('metadata shows requested vs displayed language');
  });

  describe('TC-4.5: Default English fallback', () => {
    it('defaults to English when no detection source available');
    it('English is used as ultimate fallback');
  });
});
```

### Task 6: Create Priority Chain Integration Tests

**File:** `/src/lib/i18n/__tests__/guest-language-priority-chain.test.ts`

```typescript
describe('Guest Language Detection - Complete Priority Chain', () => {
  describe('TC-5.1: Full priority chain validation', () => {
    it('URL > Cookie > Accept-Language > Default', async () => {
      // Test with all sources present
      const request = createMockNextRequest({
        url: '?lang=fr',
        cookies: { FAQBNB_GUEST_LANG: 'es' },
        headers: { 'Accept-Language': 'de' },
      });

      const detected = await detectGuestLanguage(request);
      expect(detected).toBe('fr'); // URL wins
    });

    it('Cookie > Accept-Language > Default (no URL)', async () => {
      const request = createMockNextRequest({
        cookies: { FAQBNB_GUEST_LANG: 'es' },
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
  });

  describe('TC-5.2: Override behavior', () => {
    it('each level correctly overrides lower levels');
  });

  describe('TC-5.3: All supported languages', () => {
    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'])
      ('priority chain works for %s', (lang) => {
        // Test priority chain with each language
      });
  });
});
```

### Task 7: Create Component Integration Tests

**File:** `/src/components/guest/__tests__/language-detection-integration.test.tsx`

```typescript
describe('Language Detection - Component Integration', () => {
  describe('GuestLanguageSwitcher Integration', () => {
    it('selection updates cookie');
    it('selection updates displayed content');
    it('shows available translations correctly');
  });

  describe('TranslationBanner Integration', () => {
    it('appears when showing translated content');
    it('View Original toggles to source language');
  });

  describe('MissingTranslationBanner Integration', () => {
    it('appears when translation unavailable');
    it('shows correct fallback information');
  });
});
```

### Task 8: Document Test Results

**File:** `/docs/testing/REQ-E04-023-test-results.md`

Create a test results template that will be populated during test execution:

```markdown
# Language Detection Test Results

## Test Execution Summary
- Date: [DATE]
- Tester: [TESTER]
- Environment: [ENV]

## Results by Scenario Group

### Group 1: Browser Language Detection
| Test ID | Status | Notes |
|---------|--------|-------|
| TC-1.1  |        |       |
...

### Issues Found
| Issue ID | Severity | Description | Steps to Reproduce |
|----------|----------|-------------|-------------------|
...
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/__tests__/helpers/languageTestUtils.ts` | Test utilities and mock factories |
| `/src/lib/i18n/__tests__/guest-language-detection.test.ts` | Accept-Language header tests |
| `/src/lib/i18n/__tests__/guest-language-cookie.test.ts` | Cookie persistence tests |
| `/src/lib/i18n/__tests__/guest-language-url-param.test.ts` | URL parameter tests |
| `/src/lib/i18n/__tests__/guest-language-fallback.test.ts` | Fallback behavior tests |
| `/src/lib/i18n/__tests__/guest-language-priority-chain.test.ts` | Integration tests |
| `/src/components/guest/__tests__/language-detection-integration.test.tsx` | Component integration tests |
| `/docs/testing/REQ-E04-023-test-results.md` | Test results documentation |

### Files to Potentially Modify

| File Path | Authorized Modifications |
|-----------|-------------------------|
| `/src/lib/i18n/guest-language.ts` | Add exports for testability if needed |
| `/src/lib/i18n/language-detection.ts` | Add exports for testability if needed |
| `/vitest.config.ts` | Add test path patterns if needed |

### Functions to Test (Read-Only Reference)

| Function | Location | Purpose |
|----------|----------|---------|
| `detectUserLanguage()` | `/src/lib/i18n/language-detection.ts` | Main detection function |
| `parseAcceptLanguageHeader()` | `/src/lib/i18n/language-detection.ts` | Header parsing |
| `getLocaleFromCookie()` | `/src/lib/i18n/language-detection.ts` | Cookie reading |
| `setLocaleCookie()` | `/src/lib/i18n/language-detection.ts` | Cookie writing |
| `detectGuestLanguage()` | `/src/lib/i18n/guest-language.ts` | Guest-specific detection |
| `setGuestLanguageCookie()` | `/src/lib/i18n/guest-language.ts` | Guest cookie management |

---

## Dependencies

### Required Prior Implementation

| Dependency | Location | Status |
|------------|----------|--------|
| Guest language utility module | `/src/lib/i18n/guest-language.ts` | Required (Epic 4, Task 1.2) |
| Cookie utility functions | `/src/lib/i18n/guest-language.ts` | Required (Epic 4, Task 4.2) |
| Server-side detection utility | `/src/lib/i18n/guest-language.ts` | Required (Epic 4, Task 6.2) |
| GuestLanguageSwitcher component | `/src/components/guest/GuestLanguageSwitcher/` | Required for integration tests |
| TranslationBanner component | `/src/components/guest/TranslationBanner/` | Required for integration tests |
| MissingTranslationBanner component | `/src/components/guest/MissingTranslationBanner/` | Required for integration tests |

### Test Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | existing | Test runner |
| @testing-library/react | existing | Component testing |
| jsdom | existing | Browser environment simulation |

---

## Acceptance Criteria Checklist

Based on REQ-E04-023 acceptance criteria:

- [ ] Test case verifies Accept-Language header parsing extracts the highest-priority supported language
- [ ] Test case verifies regional language variants in Accept-Language are mapped to base supported languages
- [ ] Test case verifies multiple languages in Accept-Language are evaluated in correct quality-value order
- [ ] Test case verifies that setting a language via the language switcher creates a persistent cookie
- [ ] Test case verifies the language cookie has correct expiration period of 1 year
- [ ] Test case verifies the cookie includes Secure and SameSite attributes as specified
- [ ] Test case verifies a returning guest with a language cookie sees content in the cookie's language
- [ ] Test case verifies the language cookie overrides Accept-Language header when both are present
- [ ] Test case verifies a URL with language parameter displays content in the specified language immediately
- [ ] Test case verifies URL parameter language takes precedence over existing cookie preference
- [ ] Test case verifies URL parameter language takes precedence over Accept-Language header
- [ ] Test case verifies URL parameter with invalid language code falls back to cookie or browser detection
- [ ] Test case verifies that requesting a language with no available translation shows original content
- [ ] Test case verifies MissingTranslationBanner appears when requested translation is unavailable
- [ ] Test case verifies original content displays correctly when translation fallback occurs
- [ ] Test case verifies translation metadata correctly indicates fallback status
- [ ] Test case verifies default to English occurs when no language can be detected from any source
- [ ] Test case verifies malformed Accept-Language headers do not cause errors and trigger fallback
- [ ] Test case verifies missing or corrupted cookie values do not cause errors and trigger fallback
- [ ] Test case verifies the complete priority chain: URL parameter > Cookie > Accept-Language > Default English
- [ ] All test cases are documented with steps to reproduce and expected outcomes
- [ ] Test results are recorded showing pass/fail status for each scenario
- [ ] Any identified issues are documented with reproduction steps and severity assessment

---

## Implementation Notes

### Testing Approach

1. **Unit Tests First**: Test individual functions (parseAcceptLanguageHeader, getLocaleFromCookie, etc.) in isolation
2. **Integration Tests**: Test the complete detection flow with mocked requests
3. **Component Tests**: Test UI components that interact with language detection
4. **Manual Verification**: Document manual testing steps for browser-specific scenarios

### Mock Strategy

For NextRequest mocking:
```typescript
function createMockNextRequest(options: MockRequestOptions): NextRequest {
  const url = new URL(options.url || 'http://localhost:3000/item/test');

  // Add query params if present
  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const headers = new Headers(options.headers || {});

  // Create mock request
  const request = new NextRequest(url, { headers });

  // Mock cookies
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([name, value]) => {
      request.cookies.set(name, value);
    });
  }

  return request;
}
```

### Edge Cases to Cover

1. Empty Accept-Language header
2. Accept-Language with only unsupported languages
3. Cookie with empty string value
4. Cookie with language code not in supported list
5. URL parameter with mixed case (FR, fr, Fr)
6. URL parameter with regional code (es-MX)
7. Multiple cookies set (legacy + new)
8. Browser with cookies disabled (localStorage fallback)

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Test utilities | 2 hours |
| Task 2: Accept-Language tests | 3 hours |
| Task 3: Cookie tests | 3 hours |
| Task 4: URL parameter tests | 2 hours |
| Task 5: Fallback tests | 2 hours |
| Task 6: Priority chain tests | 2 hours |
| Task 7: Component integration tests | 3 hours |
| Task 8: Documentation | 1 hour |
| **Total** | **18 hours (~2-3 days)** |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Test coverage for language detection | > 90% |
| All priority chain scenarios passing | 100% |
| All edge cases documented and tested | 100% |
| Zero critical/high severity issues | 0 |
| Test execution time | < 30 seconds |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Existing Language Detection: `/src/lib/i18n/language-detection.ts`
- Language Preference Hook: `/src/hooks/useLanguagePreference.ts`
- Test Configuration: `/vitest.config.ts`
- Request Document: `/docs/gen_requests_epic4.md` (REQ-E04-023)
