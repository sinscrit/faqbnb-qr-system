# Implementation Overview: REQ-327 - Test Edge Cases in Translation and Localization System

**Document Created:** 2026-01-18 06:35 UTC
**Last Modified:** 2026-01-18 06:35 UTC
**Request Reference:** REQ-327 from docs/gen_requests_epic4.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 7 - Testing & Polish
**Task ID:** 7.3 - Test edge cases
**Size:** M (Medium)
**Priority:** P2 - High

---

## Summary

Create comprehensive test coverage for edge cases and failure scenarios in the translation and localization system to ensure graceful degradation and reliable behavior under unexpected conditions. This includes testing scenarios such as partial translations, blocked cookies, malformed Accept-Language headers, and unsupported language codes.

---

## Context and Background

### Current Situation
Core translation functionality has been implemented and tested for standard happy-path scenarios, but edge cases and error conditions lack systematic test coverage. Without testing unusual situations such as partial translations, blocked cookies, malformed headers, and unsupported language codes, the system's resilience under real-world adverse conditions remains unverified.

### Expected Outcome
A comprehensive test suite validates all edge cases and failure scenarios throughout the translation system, ensuring guests experience reliable localization behavior even when browser configurations are unusual, privacy settings block cookies, or translation data is incomplete.

### Business Value
- Ensures the localization system functions reliably across real-world browser configurations and user environments
- Prevents user frustration and abandonment caused by broken localization in edge cases
- Reduces support burden by handling unusual scenarios gracefully
- Creates confidence that the translation system is production-ready and resilient

---

## Technical Context

### Testing Framework
- **Framework:** Vitest v4.0.16
- **Config Location:** `/vitest.config.ts`
- **Setup File:** `/vitest.setup.ts`
- **Test Environment:** jsdom
- **Coverage:** v8 provider with HTML reporter

### Key Testing Dependencies
```json
{
  "vitest": "^4.0.16",
  "@testing-library/react": "^16.3.1",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/user-event": "^14.6.1",
  "vitest-axe": "^0.1.0"
}
```

### L10N Configuration
- **Supported Languages:** en, fr, es, de, nl, it
- **Cookie Name:** `FAQBNB_GUEST_LANG`
- **Cookie Expiry:** 365 days
- **Language Priority:** URL param > Cookie > Accept-Language header > Default (en)

---

## Implementation Approach

### Test Categories

The edge case testing is organized into four main categories:

1. **Missing/Partial Translation Tests** - Handle incomplete translation data
2. **Cookie Blocked Scenario Tests** - Function when cookies are inaccessible
3. **Malformed Accept-Language Header Tests** - Parse invalid browser headers
4. **Unsupported Language Code Tests** - Handle invalid language inputs

---

## Detailed Task Breakdown

### Task 1: Create Test Utilities and Fixtures

**File:** `/src/lib/i18n/__tests__/test-utils.ts`

Create shared test utilities for L10N edge case testing:

```typescript
// Mock Accept-Language headers
export const ACCEPT_LANGUAGE_FIXTURES = {
  valid: {
    single: 'en',
    withRegion: 'en-US',
    multiple: 'fr,en;q=0.9,de;q=0.8',
    withQuality: 'es-ES;q=0.9,en;q=0.8',
  },
  malformed: {
    empty: '',
    whitespaceOnly: '   ',
    invalidFormat: 'not-a-language-code',
    missingQuality: 'en;q=',
    negativeQuality: 'en;q=-0.5',
    qualityOverOne: 'en;q=1.5',
    specialChars: '<script>alert("xss")</script>',
    veryLong: 'a'.repeat(10000),
    duplicates: 'en,en,en;q=0.9,en;q=0.8',
    semicolonOnly: ';;;',
    commaOnly: ',,,',
  },
  unsupported: {
    unsupportedSingle: 'zh',
    unsupportedWithSupported: 'zh,ja,ko',
    unsupportedRegional: 'pt-BR',
  },
};

// Mock translation data
export const TRANSLATION_FIXTURES = {
  complete: { name: 'Translated Name', description: 'Translated Description' },
  partial: { name: 'Translated Name', description: null },
  empty: { name: '', description: '' },
  null: null,
  undefined: undefined,
};

// Cookie mock helpers
export const createCookieMock = (blocked = false) => {...};
export const clearCookieMock = () => {...};
```

**Estimated Effort:** 1 task

---

### Task 2: Missing/Partial Translation Field Tests

**File:** `/src/lib/translations/__tests__/translation-edge-cases.test.ts`

Test display behavior when translation data is incomplete:

```typescript
describe('Missing Translation Edge Cases', () => {
  describe('partial translation scenarios', () => {
    it('should display original content for null translated fields', () => {...});
    it('should display original content for undefined translated fields', () => {...});
    it('should display original content for empty string translated fields', () => {...});
    it('should blend translated and original content seamlessly', () => {...});
    it('should maintain consistent styling for mixed content', () => {...});
  });

  describe('missing translation object', () => {
    it('should display all original content when translation is null', () => {...});
    it('should display all original content when translation is undefined', () => {...});
    it('should not show translation indicators when no translation exists', () => {...});
  });

  describe('database null value handling', () => {
    it('should handle null values returned from translation fetch', () => {...});
    it('should continue functioning when translation table query returns empty', () => {...});
  });
});
```

**Estimated Effort:** 1 task

---

### Task 3: Cookie Blocked Scenario Tests

**File:** `/src/lib/i18n/__tests__/cookie-blocked.test.ts`

Test language detection and persistence when cookies are inaccessible:

```typescript
describe('Cookie Blocked Scenarios', () => {
  describe('cookie access exceptions', () => {
    it('should gracefully return null when document.cookie throws', () => {...});
    it('should not crash when cookie setter throws SecurityError', () => {...});
    it('should catch and log DOMException for blocked cookies', () => {...});
  });

  describe('fallback behavior without cookies', () => {
    it('should fall back to URL parameter when cookie is blocked', () => {...});
    it('should fall back to Accept-Language when cookie and URL unavailable', () => {...});
    it('should use default language when all sources fail', () => {...});
  });

  describe('privacy browser scenarios', () => {
    it('should function correctly in incognito/private mode', () => {...});
    it('should handle third-party cookie blocking', () => {...});
  });

  describe('language preference persistence alternative', () => {
    it('should work with URL parameters as persistence mechanism', () => {...});
    it('should maintain language selection within session via state', () => {...});
  });
});
```

**Estimated Effort:** 1 task

---

### Task 4: Malformed Accept-Language Header Tests

**File:** `/src/lib/i18n/__tests__/accept-language-parser.test.ts`

Test parsing of malformed and edge-case Accept-Language headers:

```typescript
describe('Malformed Accept-Language Header Tests', () => {
  describe('empty and whitespace headers', () => {
    it('should return default language for empty string header', () => {...});
    it('should return default language for whitespace-only header', () => {...});
    it('should return default language for null header', () => {...});
    it('should return default language for undefined header', () => {...});
  });

  describe('invalid format headers', () => {
    it('should handle headers without valid language codes', () => {...});
    it('should handle headers with only special characters', () => {...});
    it('should handle XSS-like injection attempts gracefully', () => {...});
    it('should handle extremely long header values without performance issues', () => {...});
  });

  describe('malformed quality weights', () => {
    it('should handle missing quality value after q=', () => {...});
    it('should handle negative quality values', () => {...});
    it('should handle quality values greater than 1.0', () => {...});
    it('should handle non-numeric quality values', () => {...});
    it('should treat malformed weights as q=1.0', () => {...});
  });

  describe('duplicate and repeated entries', () => {
    it('should handle duplicate language codes', () => {...});
    it('should use highest quality when duplicates exist', () => {...});
    it('should handle many semicolons without crashing', () => {...});
    it('should handle many commas without crashing', () => {...});
  });

  describe('case sensitivity', () => {
    it('should normalize uppercase language codes to lowercase', () => {...});
    it('should handle mixed case region codes', () => {...});
    it('should match EN to en in supported languages', () => {...});
  });
});
```

**Estimated Effort:** 1 task

---

### Task 5: Unsupported Language Code Tests

**File:** `/src/lib/i18n/__tests__/unsupported-language.test.ts`

Test handling of unsupported or invalid language codes:

```typescript
describe('Unsupported Language Code Tests', () => {
  describe('URL parameter validation', () => {
    it('should fall back to cookie when URL param has unsupported code', () => {...});
    it('should fall back to header when URL param is invalid format', () => {...});
    it('should ignore URL param with script injection attempts', () => {...});
    it('should handle very long URL language parameter', () => {...});
  });

  describe('cookie value validation', () => {
    it('should fall back to header when cookie has unsupported code', () => {...});
    it('should handle corrupted cookie value', () => {...});
    it('should handle expired/stale language preference', () => {...});
  });

  describe('regional variant mapping', () => {
    it('should map en-US to en', () => {...});
    it('should map en-GB to en', () => {...});
    it('should map fr-CA to fr', () => {...});
    it('should map es-MX to es', () => {...});
    it('should map de-AT to de', () => {...});
    it('should map unsupported regional variant to base if supported', () => {...});
    it('should fall back to default for completely unsupported base language', () => {...});
  });

  describe('edge case language codes', () => {
    it('should handle empty string language code', () => {...});
    it('should handle whitespace-only language code', () => {...});
    it('should handle numeric language code', () => {...});
    it('should handle special character language code', () => {...});
    it('should handle null language code at any detection stage', () => {...});
    it('should handle undefined language code at any detection stage', () => {...});
  });

  describe('complete fallback chain', () => {
    it('should try all sources before defaulting to en', () => {...});
    it('should select first supported language from multi-language header', () => {...});
    it('should not crash when all sources provide invalid codes', () => {...});
  });
});
```

**Estimated Effort:** 1 task

---

### Task 6: Component Integration Edge Case Tests

**File:** `/src/components/guest/__tests__/translation-edge-cases.test.tsx`

Test component behavior with edge case translation data:

```typescript
describe('Guest Component Translation Edge Cases', () => {
  describe('TranslationBanner edge cases', () => {
    it('should handle unknown source language code gracefully', () => {...});
    it('should display fallback text when language name lookup fails', () => {...});
  });

  describe('MissingTranslationBanner edge cases', () => {
    it('should show correct message when both languages are same', () => {...});
    it('should handle very long language names without breaking layout', () => {...});
  });

  describe('GuestLanguageSwitcher edge cases', () => {
    it('should handle rapid language switching without race conditions', () => {...});
    it('should maintain selection state during async content update', () => {...});
    it('should handle click during loading state', () => {...});
  });

  describe('ViewOriginalToggle edge cases', () => {
    it('should work when original content is null', () => {...});
    it('should work when translated content is null', () => {...});
    it('should toggle correctly when both are empty strings', () => {...});
  });

  describe('useGuestLanguage hook edge cases', () => {
    it('should handle component unmount during async operation', () => {...});
    it('should handle rapid toggleOriginal calls', () => {...});
    it('should sync with URL parameter changes from browser back/forward', () => {...});
  });
});
```

**Estimated Effort:** 1 task

---

### Task 7: Server-Side Language Detection Edge Cases

**File:** `/src/lib/i18n/__tests__/server-language-detection.test.ts`

Test middleware and server component language detection edge cases:

```typescript
describe('Server-Side Language Detection Edge Cases', () => {
  describe('NextRequest object handling', () => {
    it('should handle request with missing cookies property', () => {...});
    it('should handle request with missing headers', () => {...});
    it('should handle request with missing searchParams', () => {...});
    it('should handle null NextRequest gracefully', () => {...});
  });

  describe('middleware processing', () => {
    it('should not block request when language detection fails', () => {...});
    it('should not set invalid language in X-Guest-Language header', () => {...});
    it('should complete quickly without timeout', () => {...});
    it('should handle concurrent requests with different languages', () => {...});
  });

  describe('server component context', () => {
    it('should work with cookies() function returning null', () => {...});
    it('should work with headers() function returning null', () => {...});
    it('should handle async searchParams correctly', () => {...});
  });
});
```

**Estimated Effort:** 1 task

---

### Task 8: Application Crash Prevention Tests

**File:** `/src/lib/i18n/__tests__/crash-prevention.test.ts`

Ensure no edge case causes application crashes:

```typescript
describe('Application Crash Prevention Tests', () => {
  describe('no white screen scenarios', () => {
    it('should render content when all translation systems fail', () => {...});
    it('should render fallback UI when language detection throws', () => {...});
    it('should not throw unhandled exception in any edge case', () => {...});
  });

  describe('error boundary integration', () => {
    it('should catch translation component errors', () => {...});
    it('should display meaningful error message to user', () => {...});
    it('should log error details for debugging', () => {...});
  });

  describe('graceful degradation', () => {
    it('should show original content when translation fetch fails', () => {...});
    it('should hide language switcher when languages cannot be determined', () => {...});
    it('should allow page navigation when L10N system is unavailable', () => {...});
  });

  describe('error recovery', () => {
    it('should allow retry after translation fetch failure', () => {...});
    it('should reset to working state after multiple failures', () => {...});
    it('should not enter infinite loop on repeated failures', () => {...});
  });
});
```

**Estimated Effort:** 1 task

---

## Authorized Files and Functions for Modification

### New Test Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/__tests__/test-utils.ts` | Shared test utilities and fixtures for L10N testing |
| `/src/lib/translations/__tests__/translation-edge-cases.test.ts` | Missing/partial translation tests |
| `/src/lib/i18n/__tests__/cookie-blocked.test.ts` | Cookie blocked scenario tests |
| `/src/lib/i18n/__tests__/accept-language-parser.test.ts` | Malformed header parsing tests |
| `/src/lib/i18n/__tests__/unsupported-language.test.ts` | Unsupported language code tests |
| `/src/components/guest/__tests__/translation-edge-cases.test.tsx` | Component integration edge case tests |
| `/src/lib/i18n/__tests__/server-language-detection.test.ts` | Server-side detection edge cases |
| `/src/lib/i18n/__tests__/crash-prevention.test.ts` | Application crash prevention tests |

### Existing Files That May Need Modification

| File Path | Potential Changes |
|-----------|-------------------|
| `/src/lib/i18n/guest-language.ts` | May need error handling improvements discovered during testing |
| `/src/lib/translations/fetch-translations.ts` | May need null safety improvements |
| `/src/lib/translations/translation-utils.ts` | May need edge case handling |
| `/src/hooks/useGuestLanguage.ts` | May need cleanup and error handling improvements |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | May need loading state handling |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | May need fallback text handling |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | May need edge case rendering |

---

## Testing Strategy

### Test Execution Order

1. Run test utilities and fixtures first to ensure test infrastructure works
2. Run unit tests for parsing functions (Accept-Language, language mapping)
3. Run cookie handling tests in isolated environment
4. Run component tests with mocked dependencies
5. Run integration tests with full component tree
6. Run crash prevention tests as final validation

### Mock Requirements

```typescript
// Required mocks for test setup
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock document.cookie for cookie tests
Object.defineProperty(document, 'cookie', {
  get: vi.fn(),
  set: vi.fn(),
  configurable: true,
});
```

### Coverage Requirements

- All edge case scenarios must have at least one test
- Error paths must be exercised
- Fallback chains must be tested end-to-end
- No unhandled exceptions in any scenario

---

## Dependencies

### From Epic 1 (Foundation)
- L10N types (`/src/types/l10n.ts`)
- Language configuration (`/src/lib/i18n/config.ts`)
- Supported languages constant

### From Epic 4 (Guest Experience)
- Guest language detection utility (`/src/lib/i18n/guest-language.ts`)
- Translation fetch utilities (`/src/lib/translations/fetch-translations.ts`)
- Guest UI components (`/src/components/guest/`)
- useGuestLanguage hook (`/src/hooks/useGuestLanguage.ts`)

---

## Acceptance Criteria from REQ-327

- [ ] Test verifies display behavior when item translation has some fields translated but others remain null or empty
- [ ] Test verifies that missing translated fields fall back to displaying original content for those specific fields
- [ ] Test verifies mixed content scenarios maintain consistent styling and layout without visual breaks
- [ ] Test verifies language detection functions correctly when document.cookie is blocked or inaccessible
- [ ] Test verifies cookie detection gracefully returns null when cookie access throws exceptions
- [ ] Test verifies language preferences persist through URL parameters when cookies are blocked
- [ ] Test verifies the system continues functioning without cookie persistence in privacy-focused browsers
- [ ] Test verifies malformed Accept-Language headers do not cause exceptions or application crashes
- [ ] Test verifies Accept-Language parser handles missing quality weights correctly
- [ ] Test verifies Accept-Language parser handles duplicate language codes without errors
- [ ] Test verifies Accept-Language parser handles extremely long header values without performance issues
- [ ] Test verifies unsupported language codes in URL parameters trigger fallback to cookie detection
- [ ] Test verifies unsupported language codes in cookies trigger fallback to Accept-Language header detection
- [ ] Test verifies completely invalid language codes in all sources fall back to default language
- [ ] Test verifies language codes with incorrect casing are normalized and matched correctly
- [ ] Test verifies regional language variants that are not supported map to base language codes appropriately
- [ ] Test verifies empty string language preferences are treated as missing and trigger fallback
- [ ] Test verifies whitespace-only language values are treated as invalid and trigger fallback
- [ ] Test verifies null and undefined language values at any detection stage trigger appropriate fallback
- [ ] Test verifies translation fetch continues to function when database returns unexpected null values
- [ ] Test suite covers error scenarios without relying on mock implementations that hide real error conditions
- [ ] Tests validate error handling across both client-side and server-side language detection utilities
- [ ] Tests confirm that no edge case scenario results in blank pages, white screens, or application crashes

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| L10N code not yet implemented | Medium | High | Review prerequisite REQs (304-326) status before starting |
| Mocking hides real issues | Medium | Medium | Use minimal mocking; prefer actual implementations where possible |
| Browser-specific edge cases | Low | Medium | Test in multiple browser environments during integration |
| Race conditions hard to reproduce | Medium | Medium | Use fake timers and controlled async execution |

---

## References

- Request Document: `/docs/gen_requests_epic4.md` (REQ-327)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Test Configuration: `/vitest.config.ts`, `/vitest.setup.ts`
- Existing Test Patterns: `/src/components/ItemCreationWorkflow/__tests__/`

---

*Document generated for REQ-327 - Test Edge Cases in Translation and Localization System*
