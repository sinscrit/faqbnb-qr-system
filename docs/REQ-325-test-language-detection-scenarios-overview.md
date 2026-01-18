# REQ-325: Test Language Detection Priority and Fallback Scenarios - Implementation Overview

**Document Created:** 2026-01-18 06:04 UTC
**Last Modified:** 2026-01-18 06:04 UTC
**Request ID:** REQ-325
**Phase:** 7 - Testing & Polish
**Task ID:** 7.1
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Summary

Create comprehensive test coverage for the language detection system to verify that detection examines sources in the correct priority order (URL parameter > Cookie > Browser headers > Default) and properly falls back to the default language when preferences are unavailable or invalid. This test suite ensures reliable and predictable language detection behavior across all guest-facing entry points and contexts.

---

## 2. Background & Context

### Current State
- Language detection utilities are defined in `/src/lib/i18n/guest-language.ts` (REQ-324)
- The middleware integration for language detection is defined in `/src/middleware.ts` (REQ-323)
- Guest language preference hook exists in `/src/hooks/useGuestLanguage.ts` (REQ-317)
- No systematic test coverage exists to verify the priority hierarchy and fallback behavior

### Dependencies
- **REQ-324:** Server-side language detection utility (`detectGuestLanguageFromRequest`)
- **REQ-323:** Middleware integration for guest language detection
- **REQ-317:** `useGuestLanguage` hook for client-side language state management
- **REQ-318:** Cookie utility for language persistence
- **Task 1.1:** Localization types from `/src/types/l10n.ts`

### Business Value
- Ensures the language detection system functions correctly under all conditions
- Validates that the preference priority hierarchy supports both explicit user choices and implicit detection
- Reduces support burden by catching edge cases before they reach production
- Creates confidence that language detection works reliably across different browsers, devices, and network conditions

---

## 3. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Test URL parameter detection with valid language codes | Must |
| FR-2 | Test URL parameter overrides cookie preference | Must |
| FR-3 | Test URL parameter overrides browser Accept-Language header | Must |
| FR-4 | Test cookie preference overrides browser Accept-Language header | Must |
| FR-5 | Test browser Accept-Language header detection when no URL/cookie exists | Must |
| FR-6 | Test fallback to default language when all detection sources are missing | Must |
| FR-7 | Test fallback to default language when all sources provide invalid codes | Must |
| FR-8 | Test malformed Accept-Language headers do not cause errors | Must |
| FR-9 | Test empty string values are treated as invalid | Must |
| FR-10 | Test unsupported language codes trigger fallback behavior | Must |
| FR-11 | Test same priority hierarchy in both middleware and client contexts | Should |
| FR-12 | Test cookie setting occurs when language detected from browser headers | Should |
| FR-13 | Test existing cookies are not overwritten when they match detected language | Should |

### Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | Tests must run in under 30 seconds total | Must |
| NFR-2 | Tests must use project's established Vitest patterns | Must |
| NFR-3 | Tests must provide clear failure messages for debugging | Should |
| NFR-4 | Test coverage must include all six supported languages | Must |

---

## 4. Technical Design

### 4.1 Test File Location

**Primary Test File:** `/src/lib/i18n/__tests__/guest-language.test.ts`

This file will contain comprehensive unit tests for the language detection utilities.

### 4.2 Testing Framework

The project uses **Vitest** with the following configuration:
- **Config file:** `/vitest.config.ts`
- **Setup file:** `/vitest.setup.ts`
- **Global imports:** `describe`, `it`, `expect`, `vi` (mocking)
- **Test environment:** jsdom

### 4.3 Mock Strategy

#### NextRequest Mocking

```typescript
import { NextRequest } from 'next/server'

function createMockNextRequest(options: {
  url?: string
  langParam?: string | null
  cookieValue?: string | null
  acceptLanguage?: string | null
}): NextRequest {
  const url = new URL(options.url || 'https://faqbnb.com/item/abc123')
  if (options.langParam) {
    url.searchParams.set('lang', options.langParam)
  }

  const request = new NextRequest(url)

  // Mock cookies
  if (options.cookieValue !== undefined) {
    vi.spyOn(request.cookies, 'get').mockReturnValue(
      options.cookieValue ? { value: options.cookieValue, name: 'FAQBNB_GUEST_LANG' } : undefined
    )
  }

  // Mock headers
  vi.spyOn(request.headers, 'get').mockImplementation((name: string) => {
    if (name.toLowerCase() === 'accept-language') {
      return options.acceptLanguage ?? null
    }
    return null
  })

  return request
}
```

#### Client-Side Document Cookie Mocking

```typescript
function mockDocumentCookie(value: string | null): void {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: value ? `FAQBNB_GUEST_LANG=${value}` : '',
  })
}
```

### 4.4 Test Categories

```
1. URL Parameter Detection Tests
   - Valid language codes
   - Invalid/unsupported language codes
   - Empty string parameter
   - Mixed case handling

2. Cookie Preference Tests
   - Valid cookie value
   - Invalid/expired cookie value
   - Missing cookie
   - Cookie takes precedence over browser headers

3. Accept-Language Header Tests
   - Single language
   - Multiple languages with quality weights
   - Regional variants (fr-CA, en-US)
   - Malformed headers
   - Unsupported languages only

4. Priority Hierarchy Tests
   - URL > Cookie verification
   - URL > Accept-Language verification
   - Cookie > Accept-Language verification
   - Full chain: URL > Cookie > Header > Default

5. Fallback Behavior Tests
   - All sources missing
   - All sources invalid
   - Graceful degradation

6. Edge Case Tests
   - Null/undefined values
   - Empty strings
   - Whitespace handling
   - Case sensitivity
   - Very long Accept-Language headers

7. Cookie Side Effect Tests
   - Cookie set when detected from headers
   - Cookie not overwritten when matching
```

### 4.5 Constants for Testing

```typescript
// Supported Languages for Testing
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const
const DEFAULT_LANGUAGE = 'en'
const COOKIE_NAME = 'FAQBNB_GUEST_LANG'

// Test Accept-Language Headers
const ACCEPT_LANGUAGE_SAMPLES = {
  french: 'fr-FR,fr;q=0.9,en;q=0.8',
  german: 'de-DE,de;q=0.9,en;q=0.8',
  spanishHighPriority: 'es;q=1.0,en;q=0.5',
  multipleMixed: 'fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  unsupportedOnly: 'zh-CN,ja;q=0.9,ko;q=0.8',
  malformed: 'invalid;;q=bad,fr',
  withRegionalVariants: 'en-GB,en-US;q=0.9,en;q=0.8',
}
```

---

## 5. Implementation Tasks

### Task 1: Create Test File Structure and Utilities
**Estimated Size:** S

Create the test file with mock utilities and helper functions.

**Acceptance Criteria:**
- [ ] Create `/src/lib/i18n/__tests__/guest-language.test.ts`
- [ ] Implement `createMockNextRequest` helper function
- [ ] Implement mock utilities for document.cookie
- [ ] Add test constants for supported languages and Accept-Language headers
- [ ] Verify file passes TypeScript compilation

---

### Task 2: Implement URL Parameter Detection Tests
**Estimated Size:** S

Create tests verifying URL parameter detection behavior.

**Acceptance Criteria:**
- [ ] Test returns valid language when URL param contains supported code
- [ ] Test each of the six supported languages via URL param
- [ ] Test URL parameter overrides cookie when both present
- [ ] Test URL parameter overrides Accept-Language header when both present
- [ ] Test invalid URL parameter falls through to cookie detection
- [ ] Test empty string URL parameter falls through to next source
- [ ] Test case-insensitive URL parameter handling (`FR` returns `fr`)

---

### Task 3: Implement Cookie Preference Tests
**Estimated Size:** S

Create tests verifying cookie-based language detection.

**Acceptance Criteria:**
- [ ] Test returns valid language from cookie when no URL param
- [ ] Test cookie preference overrides browser Accept-Language header
- [ ] Test invalid cookie value falls through to Accept-Language
- [ ] Test missing cookie falls through to Accept-Language detection
- [ ] Test each of the six supported languages via cookie
- [ ] Test expired/malformed cookie values are ignored

---

### Task 4: Implement Accept-Language Header Tests
**Estimated Size:** M

Create tests verifying Accept-Language header parsing and language detection.

**Acceptance Criteria:**
- [ ] Test parses single language without quality weight
- [ ] Test parses multiple languages and selects highest quality
- [ ] Test handles quality weights correctly (sorts by weight descending)
- [ ] Test maps regional variants to base language (fr-CA → fr)
- [ ] Test returns null when only unsupported languages in header
- [ ] Test handles malformed header entries gracefully
- [ ] Test handles null Accept-Language header
- [ ] Test handles whitespace around entries
- [ ] Test handles empty Accept-Language header

---

### Task 5: Implement Priority Hierarchy Tests
**Estimated Size:** M

Create tests verifying the complete detection priority chain.

**Acceptance Criteria:**
- [ ] Test URL param returns even when cookie has different language
- [ ] Test URL param returns even when Accept-Language has different language
- [ ] Test cookie returns when no URL param but Accept-Language differs
- [ ] Test complete chain: URL (invalid) → Cookie (valid) → returns cookie value
- [ ] Test complete chain: URL (missing) → Cookie (invalid) → Header (valid) → returns header value
- [ ] Test complete chain: All invalid → returns default (en)
- [ ] Test same priority behavior works in middleware context

---

### Task 6: Implement Fallback Behavior Tests
**Estimated Size:** S

Create tests verifying fallback to default language.

**Acceptance Criteria:**
- [ ] Test returns default ('en') when URL, cookie, and header all missing
- [ ] Test returns default when all sources provide unsupported codes
- [ ] Test returns default when all sources provide empty strings
- [ ] Test returns default when all sources provide null values
- [ ] Test graceful handling when request object properties are undefined

---

### Task 7: Implement Edge Case Tests
**Estimated Size:** S

Create tests for various edge cases and error conditions.

**Acceptance Criteria:**
- [ ] Test handling of null values in all detection sources
- [ ] Test handling of undefined values
- [ ] Test handling of empty string values
- [ ] Test whitespace-only values are treated as invalid
- [ ] Test case sensitivity (uppercase, mixed case codes)
- [ ] Test very long Accept-Language header with many entries
- [ ] Test missing request properties do not throw errors

---

### Task 8: Implement Cookie Side Effect Tests
**Estimated Size:** S

Create tests verifying cookie behavior during detection.

**Acceptance Criteria:**
- [ ] Test cookie is set when language detected from Accept-Language (no existing cookie)
- [ ] Test cookie is NOT overwritten when existing cookie matches detected language
- [ ] Test cookie setting uses correct name (`FAQBNB_GUEST_LANG`)
- [ ] Test cookie setting uses correct expiration (1 year)
- [ ] Test cookie setting uses correct path ('/')

---

## 6. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/__tests__/guest-language.test.ts` | Unit tests for language detection utilities |

### Files to Read (Dependencies)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Functions being tested |
| `/src/types/l10n.ts` | Type definitions for SupportedLanguage |
| `/vitest.config.ts` | Test configuration reference |
| `/vitest.setup.ts` | Test setup and global mocks |

### Functions to Test

| Function Name | Location | Test Coverage |
|---------------|----------|---------------|
| `detectGuestLanguageFromRequest` | `/src/lib/i18n/guest-language.ts` | Priority hierarchy, fallback behavior |
| `parseAcceptLanguageHeader` | `/src/lib/i18n/guest-language.ts` | Header parsing, quality weights |
| `mapToSupportedLanguage` | `/src/lib/i18n/guest-language.ts` | Regional variant mapping |
| `isSupportedLanguage` | `/src/lib/i18n/guest-language.ts` | Type guard validation |
| `setGuestLanguageCookie` | `/src/lib/i18n/guest-language.ts` | Cookie setting (if exists) |
| `getGuestLanguageCookie` | `/src/lib/i18n/guest-language.ts` | Cookie reading (if exists) |

---

## 7. Dependencies

### Import Dependencies

```typescript
// Testing framework
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Next.js types for mocking
import { NextRequest } from 'next/server'

// Functions to test
import {
  detectGuestLanguageFromRequest,
  parseAcceptLanguageHeader,
  mapToSupportedLanguage,
  isSupportedLanguage,
  GUEST_LANGUAGE_COOKIE_NAME,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGE_CODES,
} from '../guest-language'

// Types
import type { SupportedLanguage } from '@/types/l10n'
```

### Depends On (Tasks)

| Task | Description | Status |
|------|-------------|--------|
| REQ-324 (Task 6.2) | Create server-side language detection utility | Required |
| REQ-318 (Task 4.2) | Create cookie utility for language persistence | Required |
| Task 1.1 | Create localization types file | Required |

### Blocks (Tasks)

| Task | Description |
|------|-------------|
| Task 7.2 | Test content display scenarios |
| Task 7.3 | Test edge cases (builds on detection tests) |

---

## 8. Test Specifications

### 8.1 Test Suite: `detectGuestLanguageFromRequest`

```typescript
describe('detectGuestLanguageFromRequest', () => {
  describe('URL parameter detection', () => {
    it('returns URL parameter language when valid')
    it('returns URL parameter language for all six supported languages')
    it('overrides cookie preference when URL param present')
    it('overrides Accept-Language header when URL param present')
    it('ignores invalid URL parameter and checks cookie')
    it('ignores empty string URL parameter')
    it('handles case-insensitive URL parameter (FR → fr)')
  })

  describe('Cookie preference detection', () => {
    it('returns cookie language when URL param missing')
    it('returns cookie language for all six supported languages')
    it('overrides Accept-Language header when cookie present')
    it('ignores invalid cookie value and checks Accept-Language')
    it('ignores empty cookie value')
  })

  describe('Accept-Language header detection', () => {
    it('returns Accept-Language preference when URL and cookie missing')
    it('selects highest quality language from header')
    it('maps regional variants to base language')
    it('ignores unsupported languages in header')
    it('handles malformed Accept-Language header')
    it('handles null Accept-Language header')
  })

  describe('Fallback behavior', () => {
    it('returns default language when all sources missing')
    it('returns default language when all sources invalid')
    it('returns default (en) as final fallback')
  })

  describe('Edge cases', () => {
    it('handles missing request searchParams gracefully')
    it('handles missing request cookies gracefully')
    it('handles missing request headers gracefully')
    it('handles null values without throwing')
    it('handles undefined values without throwing')
  })
})
```

### 8.2 Test Suite: `parseAcceptLanguageHeader`

```typescript
describe('parseAcceptLanguageHeader', () => {
  it('parses single language without quality')
  it('parses multiple languages with quality weights')
  it('sorts by quality weight (highest first)')
  it('defaults quality to 1.0 when not specified')
  it('maps fr-CA regional variant to fr')
  it('maps en-US regional variant to en')
  it('maps de-AT regional variant to de')
  it('returns null for unsupported-only languages (zh-CN, ja)')
  it('returns null for null input')
  it('returns null for empty string input')
  it('handles malformed quality values (q=bad)')
  it('skips invalid entries and continues')
  it('handles whitespace around entries')
  it('handles very long header with many entries')
})
```

### 8.3 Test Suite: `mapToSupportedLanguage`

```typescript
describe('mapToSupportedLanguage', () => {
  it('returns exact match for each supported language')
  it('extracts base language from fr-CA → fr')
  it('extracts base language from en-GB → en')
  it('extracts base language from de-AT → de')
  it('extracts base language from es-MX → es')
  it('extracts base language from nl-BE → nl')
  it('extracts base language from it-CH → it')
  it('returns null for unsupported base language (pt-BR)')
  it('returns null for unsupported language (zh)')
  it('handles case-insensitively (FR → fr)')
  it('returns null for empty string')
  it('returns null for null/undefined')
})
```

### 8.4 Test Suite: `isSupportedLanguage`

```typescript
describe('isSupportedLanguage', () => {
  it('returns true for "en"')
  it('returns true for "fr"')
  it('returns true for "es"')
  it('returns true for "de"')
  it('returns true for "nl"')
  it('returns true for "it"')
  it('returns false for "zh"')
  it('returns false for "ja"')
  it('returns false for "pt"')
  it('returns false for null')
  it('returns false for undefined')
  it('returns false for empty string')
  it('handles case-insensitively (returns true for "EN")')
  it('handles whitespace (returns false for " en ")')
})
```

---

## 9. Test Data Matrices

### 9.1 URL Parameter Test Cases

| Test ID | URL Param | Cookie | Accept-Language | Expected Result |
|---------|-----------|--------|-----------------|-----------------|
| URL-1 | `fr` | - | - | `fr` |
| URL-2 | `de` | `fr` | `es` | `de` |
| URL-3 | `invalid` | `fr` | - | `fr` (cookie) |
| URL-4 | `` (empty) | `fr` | - | `fr` (cookie) |
| URL-5 | `FR` | - | - | `fr` (lowercase) |
| URL-6 | `zh` | `fr` | - | `fr` (unsupported fallback) |

### 9.2 Cookie Test Cases

| Test ID | Cookie | Accept-Language | Expected Result |
|---------|--------|-----------------|-----------------|
| COOKIE-1 | `es` | - | `es` |
| COOKIE-2 | `nl` | `de` | `nl` (cookie priority) |
| COOKIE-3 | `invalid` | `it` | `it` (header) |
| COOKIE-4 | `` (empty) | `fr` | `fr` (header) |
| COOKIE-5 | `ES` | - | `es` (lowercase) |

### 9.3 Accept-Language Test Cases

| Test ID | Accept-Language Header | Expected Result |
|---------|------------------------|-----------------|
| AL-1 | `fr` | `fr` |
| AL-2 | `fr-CA,fr;q=0.9,en;q=0.8` | `fr` |
| AL-3 | `en;q=0.5,de;q=0.9` | `de` (higher quality) |
| AL-4 | `zh-CN,ja;q=0.9` | `en` (default) |
| AL-5 | `invalid;;q=bad,fr` | `fr` (skips invalid) |
| AL-6 | `` (empty) | `en` (default) |
| AL-7 | null | `en` (default) |

### 9.4 Full Priority Chain Test Cases

| Test ID | URL | Cookie | Accept-Language | Expected | Reason |
|---------|-----|--------|-----------------|----------|--------|
| CHAIN-1 | `fr` | `de` | `es` | `fr` | URL highest priority |
| CHAIN-2 | - | `de` | `es` | `de` | Cookie > Header |
| CHAIN-3 | - | - | `es` | `es` | Header fallback |
| CHAIN-4 | - | - | - | `en` | Default fallback |
| CHAIN-5 | `invalid` | `invalid` | `invalid` | `en` | All invalid → default |

---

## 10. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Test execution time | Use mocks to avoid real network/cookie operations |
| Test isolation | Reset mocks in `beforeEach`/`afterEach` hooks |
| Mock overhead | Create reusable mock factories |

**Target Performance:** All tests complete in under 30 seconds

---

## 11. Edge Cases to Cover

| Edge Case | Test Scenario | Expected Behavior |
|-----------|---------------|-------------------|
| Empty strings | URL param = `''` | Falls through to next source |
| Whitespace values | Cookie = `'  '` | Treated as invalid |
| Mixed case | URL param = `'FR'` | Normalized to `'fr'` |
| Malformed header | `'invalid;;q=bad'` | Skips invalid, continues |
| Very long header | 50+ languages | Processes until first match |
| Missing properties | `request.cookies` undefined | Returns default gracefully |
| Non-string values | Type coercion issues | Handles without throwing |
| Regional variants | `'en-GB'`, `'fr-CA'` | Maps to base language |
| Unsupported base | `'zh-CN'`, `'pt-BR'` | Returns null, fallback |

---

## 12. Code Example

```typescript
// /src/lib/i18n/__tests__/guest-language.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  detectGuestLanguageFromRequest,
  parseAcceptLanguageHeader,
  mapToSupportedLanguage,
  isSupportedLanguage,
  GUEST_LANGUAGE_COOKIE_NAME,
  DEFAULT_LANGUAGE,
} from '../guest-language'

// Helper to create mock NextRequest
function createMockRequest(options: {
  langParam?: string | null
  cookieValue?: string | null
  acceptLanguage?: string | null
}): NextRequest {
  const url = new URL('https://faqbnb.com/item/test123')
  if (options.langParam) {
    url.searchParams.set('lang', options.langParam)
  }

  const request = new NextRequest(url)

  // Mock cookies.get
  vi.spyOn(request.cookies, 'get').mockReturnValue(
    options.cookieValue
      ? { value: options.cookieValue, name: GUEST_LANGUAGE_COOKIE_NAME }
      : undefined
  )

  // Mock headers.get
  vi.spyOn(request.headers, 'get').mockImplementation((name: string) => {
    if (name.toLowerCase() === 'accept-language') {
      return options.acceptLanguage ?? null
    }
    return null
  })

  return request
}

describe('detectGuestLanguageFromRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('URL parameter detection', () => {
    it('returns URL parameter language when valid', () => {
      const request = createMockRequest({ langParam: 'fr' })
      expect(detectGuestLanguageFromRequest(request)).toBe('fr')
    })

    it('URL parameter overrides cookie preference', () => {
      const request = createMockRequest({
        langParam: 'de',
        cookieValue: 'fr',
        acceptLanguage: 'es',
      })
      expect(detectGuestLanguageFromRequest(request)).toBe('de')
    })

    it('ignores invalid URL parameter and uses cookie', () => {
      const request = createMockRequest({
        langParam: 'invalid',
        cookieValue: 'fr',
      })
      expect(detectGuestLanguageFromRequest(request)).toBe('fr')
    })
  })

  describe('Cookie preference detection', () => {
    it('returns cookie language when URL param missing', () => {
      const request = createMockRequest({ cookieValue: 'es' })
      expect(detectGuestLanguageFromRequest(request)).toBe('es')
    })

    it('cookie overrides Accept-Language header', () => {
      const request = createMockRequest({
        cookieValue: 'nl',
        acceptLanguage: 'de',
      })
      expect(detectGuestLanguageFromRequest(request)).toBe('nl')
    })
  })

  describe('Accept-Language header detection', () => {
    it('returns Accept-Language preference when URL and cookie missing', () => {
      const request = createMockRequest({ acceptLanguage: 'it' })
      expect(detectGuestLanguageFromRequest(request)).toBe('it')
    })

    it('selects highest quality language from header', () => {
      const request = createMockRequest({
        acceptLanguage: 'en;q=0.5,de;q=0.9',
      })
      expect(detectGuestLanguageFromRequest(request)).toBe('de')
    })
  })

  describe('Fallback behavior', () => {
    it('returns default language when all sources missing', () => {
      const request = createMockRequest({})
      expect(detectGuestLanguageFromRequest(request)).toBe(DEFAULT_LANGUAGE)
    })

    it('returns default language when all sources invalid', () => {
      const request = createMockRequest({
        langParam: 'invalid',
        cookieValue: 'bad',
        acceptLanguage: 'zh-CN',
      })
      expect(detectGuestLanguageFromRequest(request)).toBe(DEFAULT_LANGUAGE)
    })
  })
})

describe('parseAcceptLanguageHeader', () => {
  it('parses single language without quality', () => {
    expect(parseAcceptLanguageHeader('fr')).toBe('fr')
  })

  it('returns highest quality supported language', () => {
    expect(parseAcceptLanguageHeader('en;q=0.5,de;q=0.9')).toBe('de')
  })

  it('maps regional variants to base language', () => {
    expect(parseAcceptLanguageHeader('fr-CA')).toBe('fr')
  })

  it('returns null for unsupported languages only', () => {
    expect(parseAcceptLanguageHeader('zh-CN,ja;q=0.9')).toBeNull()
  })

  it('returns null for null input', () => {
    expect(parseAcceptLanguageHeader(null)).toBeNull()
  })

  it('handles malformed entries gracefully', () => {
    expect(parseAcceptLanguageHeader('invalid;;q=bad,fr')).toBe('fr')
  })
})

describe('mapToSupportedLanguage', () => {
  it.each(['en', 'fr', 'es', 'de', 'nl', 'it'])(
    'returns exact match for %s',
    (lang) => {
      expect(mapToSupportedLanguage(lang)).toBe(lang)
    }
  )

  it('extracts base language from regional variant', () => {
    expect(mapToSupportedLanguage('fr-CA')).toBe('fr')
    expect(mapToSupportedLanguage('en-GB')).toBe('en')
    expect(mapToSupportedLanguage('de-AT')).toBe('de')
  })

  it('returns null for unsupported base language', () => {
    expect(mapToSupportedLanguage('pt-BR')).toBeNull()
    expect(mapToSupportedLanguage('zh-CN')).toBeNull()
  })
})

describe('isSupportedLanguage', () => {
  it.each(['en', 'fr', 'es', 'de', 'nl', 'it'])(
    'returns true for %s',
    (lang) => {
      expect(isSupportedLanguage(lang)).toBe(true)
    }
  )

  it('returns false for unsupported language', () => {
    expect(isSupportedLanguage('zh')).toBe(false)
    expect(isSupportedLanguage('pt')).toBe(false)
  })

  it('returns false for null/undefined', () => {
    expect(isSupportedLanguage(null)).toBe(false)
    expect(isSupportedLanguage(undefined)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isSupportedLanguage('')).toBe(false)
  })
})
```

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Language detection utility not complete | Medium | High | Verify REQ-324 completion before starting tests |
| NextRequest mocking complexity | Medium | Medium | Use established mocking patterns from project |
| Edge cases missed | Low | Medium | Use test data matrices to ensure coverage |
| Test flakiness | Low | Low | Ensure proper mock isolation and cleanup |

---

## 14. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Definition:** `/docs/gen_requests_epic4.md` - REQ-325
- **Language Detection Utility:** `/src/lib/i18n/guest-language.ts` (REQ-324)
- **Vitest Configuration:** `/vitest.config.ts`
- **Vitest Setup:** `/vitest.setup.ts`
- **Example Test Pattern:** `/src/lib/__tests__/room-utils.test.ts`

---

## 15. Checklist for Implementation

- [ ] Verify `/src/lib/i18n/guest-language.ts` exists with required functions
- [ ] Create `/src/lib/i18n/__tests__/` directory if it doesn't exist
- [ ] Create `/src/lib/i18n/__tests__/guest-language.test.ts`
- [ ] Implement mock helper functions (`createMockRequest`, etc.)
- [ ] Implement `detectGuestLanguageFromRequest` test suite
- [ ] Implement `parseAcceptLanguageHeader` test suite
- [ ] Implement `mapToSupportedLanguage` test suite
- [ ] Implement `isSupportedLanguage` test suite
- [ ] Implement priority hierarchy tests
- [ ] Implement fallback behavior tests
- [ ] Implement edge case tests
- [ ] Run full test suite with `npm run test`
- [ ] Verify all tests pass
- [ ] Verify test execution time is under 30 seconds
- [ ] Review test coverage for completeness

---

*Document generated for FAQBNB L10N Epic 4 - Phase 7, Task 7.1*
