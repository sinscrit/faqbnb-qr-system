# REQ-E04-025: Test Edge Cases for Guest Language Detection and Display

**Document Created**: 2026-01-20 14:45:00 UTC
**Last Modified**: 2026-01-20 14:45:00 UTC
**Epic**: 4 - Guest Experience
**Phase**: 7 - Testing & Polish
**Task ID**: 7.3
**Type**: ENHANCEMENT
**Size**: M (Medium)
**Priority**: P1 - High

---

## Overview

This task covers comprehensive edge case testing to verify that the guest language detection and translation display systems handle exceptional scenarios gracefully. The testing validates system behavior when encountering partial translations, blocked cookies, malformed Accept-Language headers, and unsupported language codes.

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | Required |
| i18n Configuration | `/src/lib/i18n/config.ts` | Required |
| Guest Language Components | `/src/components/guest/` | Required |
| Translation Fetch Utilities | `/src/lib/translations/fetch-translations.ts` | Required |
| Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Required |
| ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Required |
| Middleware | `/src/middleware.ts` | Required |

### Related Requests

- REQ-E04-002: Create Guest Language Detection and Persistence Utilities
- REQ-E04-021: Create Server-Side Language Detection Utility
- REQ-E04-023: Validate Language Detection Priority and Fallback Scenarios
- REQ-E04-024: Validate Content Display Scenarios with Translation System

---

## Problem Statement

The guest localization infrastructure includes language detection utilities, cookie persistence, Accept-Language header parsing, and translation display components. Without explicit testing of edge cases, production guests may encounter failures or confusing behavior when their environment differs from standard assumptions.

### Current Behavior

- Language detection utilities parse Accept-Language headers via `parseAcceptLanguageHeader()` function in `/src/lib/i18n/language-detection.ts`
- Cookie persistence uses `FAQBNB_LANG` cookie with 1-year expiration
- Middleware detects language and sets `x-locale` header for downstream components
- Translation display components show banners for missing translations

### Edge Case Scenarios to Validate

1. **Partial Translations**: When translations exist for some fields but not others
2. **Blocked Cookies**: When browsers or privacy tools block cookies
3. **Malformed Headers**: When Accept-Language headers are invalid or unusual
4. **Unsupported Languages**: When language codes are not in the supported set

---

## Technical Approach

### Test Strategy

The edge case testing will follow the established Vitest testing patterns found in the codebase:

```typescript
// Test framework: Vitest with jsdom environment
// Pattern from: /src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
```

### Test Categories

#### 1. Partial Translation Tests

Tests verify system behavior when item content has mixed translation coverage:

| Test Case | Expected Behavior |
|-----------|-------------------|
| Translated title, original description | Display translated title, original description seamlessly |
| Mixed article translations | Display translated articles and original articles together |
| Partial link/tag translations | Display available translations with original fallback |
| TranslationBanner behavior | Show appropriate banner for partially translated content |
| View original toggle | Toggle ALL fields to original, not just partial fields |

#### 2. Cookie Blocked Scenario Tests

Tests simulate environments where cookies are unavailable:

| Test Case | Expected Behavior |
|-----------|-------------------|
| Cookies entirely blocked | Fall back to Accept-Language header detection |
| Incognito/private browsing | Language detection still functions |
| Cookie set operation fails | No JavaScript errors, graceful degradation |
| URL parameter with blocked cookies | URL parameter still functions |
| Repeated visits without cookies | Use Accept-Language each time |

#### 3. Malformed Accept-Language Header Tests

Tests validate robust header parsing:

| Test Case | Expected Behavior |
|-----------|-------------------|
| Empty header value | Skip to cookie/default fallback |
| Whitespace-only header | Handle as empty header |
| Invalid quality factors (`q=abc`, `q=2.0`) | Use default quality or skip entry |
| Missing quality separator | Parse language code, ignore malformed quality |
| Duplicate languages | Deduplicate, use highest quality |
| Unusual language tags (`i-klingon`, `x-custom`) | Ignore unknown tags |
| Excessively long header | Process without performance degradation |
| Special characters/encoding issues | Handle gracefully |
| Only unsupported languages | Fall back to default |

#### 4. Unsupported Language Code Tests

Tests verify handling of invalid language codes:

| Test Case | Expected Behavior |
|-----------|-------------------|
| URL parameter with unsupported code | Trigger fallback to cookie detection |
| Cookie with unsupported code | Trigger fallback to Accept-Language |
| Accept-Language with unsupported only | Fall back to default (English) |
| No error messages to guest | Silent fallback behavior |
| Language switcher display | Only show supported languages |
| No translation fetch for unsupported | Prevent wasted API calls |
| Injection protection | Sanitize unsupported codes |

### Test Implementation Pattern

Based on existing patterns in `/src/components/LanguageSwitcher/__tests__/`:

```typescript
/**
 * Edge Case Tests for Guest Language Detection
 *
 * @module tests/guest-language-edge-cases
 * @vitest-environment jsdom
 * @lastModified 2026-01-20 14:45 UTC
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Guest Language Detection Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset cookie state
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
      configurable: true,
    });
  });

  describe('Partial Translations', () => {
    it('displays mixed translated and original fields', () => {
      // Test implementation
    });
  });

  describe('Cookie Blocked Scenario', () => {
    it('falls back to Accept-Language when cookies unavailable', () => {
      // Test implementation
    });
  });

  describe('Malformed Accept-Language Header', () => {
    it('handles empty header gracefully', () => {
      // Test implementation
    });
  });

  describe('Unsupported Language Code', () => {
    it('falls back gracefully for unsupported URL parameter', () => {
      // Test implementation
    });
  });
});
```

---

## Authorized Files and Functions for Modification

### Test Files (Create/Modify)

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/src/lib/i18n/__tests__/language-detection-edge-cases.test.ts` | CREATE | Unit tests for language detection edge cases |
| `/src/lib/i18n/__tests__/cookie-blocked.test.ts` | CREATE | Tests for cookie-blocked scenarios |
| `/src/components/guest/__tests__/partial-translations.test.tsx` | CREATE | Component tests for partial translation display |
| `/src/app/item/__tests__/guest-item-edge-cases.test.tsx` | CREATE | Integration tests for guest item page edge cases |

### Files to Read (Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/language-detection.ts` | Reference for detection logic |
| `/src/lib/i18n/config.ts` | Reference for supported locales |
| `/src/middleware.ts` | Reference for middleware language handling |
| `/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx` | Pattern reference |
| `/src/lib/job-queue/__tests__/helpers/testUtils.ts` | Test utility patterns |

### Existing Test Patterns to Follow

```typescript
// Cookie mocking pattern (from LanguageSwitcher tests)
Object.defineProperty(document, 'cookie', {
  get: () => cookieValue,
  set: (value) => { cookieValue = value; },
  configurable: true,
});

// Mock factory pattern (from mockFactories.ts)
export function createMockTranslationData(overrides?: Partial<TranslationData>): TranslationData {
  return {
    ...defaults,
    ...overrides,
  };
}

// Wait utility pattern (from testUtils.ts)
export async function waitForCondition(condition: () => boolean, timeout = 5000): Promise<void>
```

---

## Acceptance Criteria

### Missing Translation for Some Fields (Partial Translations)

- [ ] Test verifies system behavior when item has translated title but original description
- [ ] Test verifies system behavior when item has translated description but original title
- [ ] Test verifies articles display correctly when some articles have translations and others do not
- [ ] Test verifies link titles display correctly with mix of translated and untranslated links
- [ ] Test verifies tag names display correctly with partial tag translations
- [ ] Test verifies TranslationBanner displays appropriately for partially translated content
- [ ] Test verifies no visual gaps, missing content, or layout breaks occur with partial translations
- [ ] Test verifies translation metadata correctly reflects partial translation status
- [ ] Test verifies view original toggle switches ALL fields to original, not just partially translated fields
- [ ] Test verifies language switcher handles partial translations without errors

### Cookie Blocked Scenario

- [ ] Test simulates browser with cookies blocked entirely
- [ ] Test verifies language detection falls back to Accept-Language header when cookies unavailable
- [ ] Test verifies URL language parameter still functions when cookies are blocked
- [ ] Test verifies no JavaScript errors occur when cookie set operations fail
- [ ] Test verifies no error messages display to user when cookies are unavailable
- [ ] Test verifies language switcher remains functional in incognito/private browsing mode
- [ ] Test verifies repeated visits without cookies use Accept-Language detection each time
- [ ] Test verifies the system does not crash or hang when attempting to read blocked cookies
- [ ] Test verifies appropriate graceful degradation is logged (if applicable) but not shown to user
- [ ] Test verifies guest can still manually select language via URL parameter when cookies blocked

### Malformed Accept-Language Header

- [ ] Test verifies handling of empty Accept-Language header value
- [ ] Test verifies handling of Accept-Language header with only whitespace
- [ ] Test verifies handling of Accept-Language header with invalid quality factor (e.g., `q=abc`, `q=2.0`, `q=-1`)
- [ ] Test verifies handling of Accept-Language header with missing quality separator (e.g., `"en;0.8"` instead of `"en;q=0.8"`)
- [ ] Test verifies handling of Accept-Language header with duplicate languages
- [ ] Test verifies handling of Accept-Language header with unusual but valid language tags (e.g., `"i-klingon"`, `"x-custom"`)
- [ ] Test verifies handling of Accept-Language header exceeding typical length (very long header string)
- [ ] Test verifies handling of Accept-Language header with special characters or encoding issues
- [ ] Test verifies handling of Accept-Language header with only unsupported languages listed
- [ ] Test verifies all malformed header scenarios fall back gracefully to default English without errors
- [ ] Test verifies no server errors or 500 responses occur from malformed headers
- [ ] Test verifies malformed headers do not cause excessive logging or performance degradation

### Unsupported Language Code

- [ ] Test verifies behavior when URL parameter contains unsupported language code (e.g., `?lang=kl` for Klingon)
- [ ] Test verifies behavior when cookie contains an unsupported language code value
- [ ] Test verifies behavior when Accept-Language header contains only unsupported languages
- [ ] Test verifies unsupported language codes in URL parameter trigger fallback to cookie detection
- [ ] Test verifies unsupported language codes in cookie trigger fallback to Accept-Language detection
- [ ] Test verifies unsupported languages in Accept-Language trigger fallback to default English
- [ ] Test verifies no error messages display to guest when unsupported language is requested
- [ ] Test verifies language switcher does not display unsupported languages as options
- [ ] Test verifies system does not attempt to fetch translations for unsupported language codes
- [ ] Test verifies unsupported language codes are sanitized and do not pose injection risks
- [ ] Test verifies case variations of unsupported codes (e.g., `"KL"`, `"Kl"`, `"kL"`) are handled consistently
- [ ] Test verifies partial matches to supported languages are handled appropriately (e.g., `"esp"` vs `"es"`)

### General Edge Case Validation

- [ ] All edge case scenarios are tested on both desktop and mobile viewports
- [ ] All edge case scenarios are tested in at least two major browsers (Chrome, Safari or Firefox)
- [ ] Error handling does not expose internal system details or stack traces to guests
- [ ] System maintains performance within acceptable thresholds during edge case handling
- [ ] All test cases are documented with clear reproduction steps and expected outcomes
- [ ] Test results are recorded with pass/fail status and any observed deviations from expected behavior
- [ ] Any identified issues are documented with reproduction steps, severity assessment, and recommended fixes

---

## Test Data Requirements

### Partial Translation Test Data

```typescript
// Mock item with partial translations
const mockPartialTranslation = {
  item: {
    id: 'item-123',
    publicId: 'pub-123',
    name: 'Translated Item Name',  // Translated
    description: null,  // Original (no translation)
    sourceLanguage: 'en',
    isTranslated: true,
  },
  articles: [
    { id: 'art-1', title: 'Translated Title', isTranslated: true },
    { id: 'art-2', title: 'Original Title', isTranslated: false },
  ],
  links: [
    { id: 'link-1', title: 'Lien Traduit', isTranslated: true },
    { id: 'link-2', title: 'Original Link', isTranslated: false },
  ],
};
```

### Malformed Header Test Data

```typescript
const malformedHeaders = {
  empty: '',
  whitespace: '   ',
  invalidQuality: 'en;q=abc, fr;q=2.0, de;q=-1',
  missingSeparator: 'en;0.8, fr;0.9',
  duplicates: 'en;q=0.8, en;q=0.5, en;q=1.0',
  unusual: 'i-klingon, x-custom, art-lojban',
  longHeader: 'en,' + 'fr,'.repeat(1000),
  specialChars: 'en<script>, fr\x00, de\uFFFD',
  unsupportedOnly: 'xx, yy, zz',
};
```

### Unsupported Language Codes Test Data

```typescript
const unsupportedCodes = [
  'kl',     // Klingon (fictional)
  'xx',     // Invalid ISO code
  'zh',     // Chinese (not in supported 6)
  'ja',     // Japanese (not in supported 6)
  'esp',    // Partial match to 'es'
  'KL',     // Case variation
  '123',    // Numeric
  '../',    // Path traversal attempt
  '<script>',  // XSS attempt
];
```

---

## Implementation Checklist

### Phase 1: Test Infrastructure Setup

1. [ ] Create test directory structure if not exists
2. [ ] Set up mock factories for edge case data
3. [ ] Create test utilities for cookie/header simulation
4. [ ] Verify Vitest configuration supports edge case scenarios

### Phase 2: Unit Tests for Language Detection

1. [ ] Write tests for `parseAcceptLanguageHeader()` with malformed inputs
2. [ ] Write tests for `getLocaleFromCookie()` with unavailable cookies
3. [ ] Write tests for `detectUserLanguage()` with unsupported codes
4. [ ] Write tests for cookie setting with blocked storage

### Phase 3: Component Tests for Translation Display

1. [ ] Write tests for TranslationBanner with partial translations
2. [ ] Write tests for MissingTranslationBanner with edge cases
3. [ ] Write tests for GuestLanguageSwitcher with blocked cookies
4. [ ] Write tests for ViewOriginalToggle with partial data

### Phase 4: Integration Tests

1. [ ] Write tests for guest item page with partial translations
2. [ ] Write tests for full page flow with blocked cookies
3. [ ] Write tests for middleware handling of malformed headers
4. [ ] Write tests for end-to-end language fallback cascade

### Phase 5: Documentation and Results

1. [ ] Document all test scenarios with reproduction steps
2. [ ] Record pass/fail results for each test case
3. [ ] Document any identified issues with severity
4. [ ] Create summary report of edge case coverage

---

## Performance Considerations

- Edge case handling should not introduce latency > 10ms
- Malformed header parsing should complete in < 1ms
- Cookie fallback should not cause visible UI delay
- Error logging should not impact response times

---

## Security Considerations

- Unsupported language codes must be sanitized to prevent injection
- Error messages must not expose internal paths or configurations
- Cookie handling must follow existing security patterns (SameSite=Lax, Secure in production)
- URL parameters must be validated before use

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Language Detection Utility: `/src/lib/i18n/language-detection.ts`
- i18n Configuration: `/src/lib/i18n/config.ts`
- Existing Test Patterns: `/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`
- Test Utilities Reference: `/src/lib/job-queue/__tests__/helpers/testUtils.ts`
- Vitest Configuration: `/vitest.config.ts`

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Some edge cases not discoverable | Medium | Low | Comprehensive test matrix |
| Test environment differs from production | Medium | Medium | Test in production-like environment |
| Cookie simulation incomplete | Low | Medium | Use established mocking patterns |
| Performance regression from tests | Low | Low | Run tests in isolation |
| False positives in edge case detection | Low | Medium | Manual verification of failures |

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
*Phase 7: Testing & Polish - Task 7.3: Test Edge Cases*
