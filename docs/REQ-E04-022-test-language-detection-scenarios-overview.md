# Implementation Overview: Test Language Detection Scenarios

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-022 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:40 |
| Breakdown Created | 2026-01-22 19:48 |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

---

## Goals

Create comprehensive automated tests for language detection scenarios to ensure the priority system works correctly across all detection methods. Tests should verify that URL parameters, cookies, and browser headers are processed in the correct order with proper fallback behavior.

**Success Criteria:**
- Browser Accept-Language header detection works correctly
- Cookie preference properly overrides browser language
- URL parameter properly overrides cookie preference
- Fallback to original/English works when no preference exists
- Edge cases are handled gracefully (malformed headers, invalid codes, etc.)
- Tests cover both client-side (useGuestLanguage hook) and server-side (detectGuestLanguage utility) detection
- Tests verify the complete priority cascade: URL > Cookie > Accept-Language > Default
- All tests pass in CI pipeline
- Tests are maintainable and well-documented
- Test coverage meets minimum threshold (>80% for language detection modules)

---

## Assumptions & Clarifications

**Assumptions:**
- REQ-E04-002 (Guest Language Utility) and REQ-E04-021 (Server-Side Detection) provide the functions to test
- REQ-E04-014 (useGuestLanguage hook) provides the client-side hook to test
- Testing framework is Vitest (as seen in existing test files)
- Testing utilities available: `@testing-library/react` for component tests
- Mock utilities available: `vitest` mocking capabilities
- Supported languages: en, fr, es, de, nl, it (from config)
- Default language is 'en'
- Guest cookie name is `FAQBNB_GUEST_LANG`

**Clarifications Needed:**
- Should we test middleware integration or only the utility functions?
- **Answer:** Focus on utility function tests. Middleware integration tests are separate (can be addressed in future tasks if needed).

---

## Implementation Plan

### Step 1: Create Test File Structure
- **Description**: Set up the test file structure for language detection tests with proper organization
- **Rationale**: Organized test files make it easy to locate and maintain tests. Follow existing patterns in the codebase.
- **Estimated Effort**: XS (15-20 minutes)

**Implementation Details:**
```
/src/lib/i18n/__tests__/
├── guest-language.test.ts           # Server-side detection tests (NEW)
├── guest-language.integration.test.ts  # Integration tests (NEW)
└── language-detection.test.ts       # Existing user detection tests (for reference)

/src/hooks/__tests__/
└── useGuestLanguage.test.ts         # Client-side hook tests (NEW)
```

### Step 2: Create Mock Utilities and Test Helpers
- **Description**: Create reusable mock functions and test helpers for simulating requests, cookies, and headers
- **Rationale**: Reduces duplication across tests. Makes tests more readable and maintainable.
- **Estimated Effort**: S (30-45 minutes)

**Implementation Details:**
```typescript
// File: /src/lib/i18n/__tests__/guest-language.test.ts

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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  detectGuestLanguage,
  getGuestLanguageFromCookie,
  validateLanguageParam,
  GUEST_LANGUAGE_COOKIE_NAME,
} from '../guest-language';

// =============================================================================
// Test Helpers
// =============================================================================

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

### Step 3: Test URL Parameter Detection (Priority 1)
- **Description**: Write tests verifying URL parameter has highest priority and proper validation
- **Rationale**: URL parameters enable shareable links. Must work correctly as highest priority.
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
// =============================================================================
// URL Parameter Tests (Priority 1)
// =============================================================================

describe('URL Parameter Detection', () => {
  describe('validateLanguageParam', () => {
    it('accepts valid lowercase language codes', () => {
      expect(validateLanguageParam('en')).toBe('en');
      expect(validateLanguageParam('fr')).toBe('fr');
      expect(validateLanguageParam('es')).toBe('es');
      expect(validateLanguageParam('de')).toBe('de');
      expect(validateLanguageParam('nl')).toBe('nl');
      expect(validateLanguageParam('it')).toBe('it');
    });

    it('normalizes uppercase to lowercase', () => {
      expect(validateLanguageParam('EN')).toBe('en');
      expect(validateLanguageParam('FR')).toBe('fr');
      expect(validateLanguageParam('Es')).toBe('es');
    });

    it('trims whitespace from input', () => {
      expect(validateLanguageParam('  fr  ')).toBe('fr');
      expect(validateLanguageParam('\ten\n')).toBe('en');
    });

    it('rejects unsupported language codes', () => {
      expect(validateLanguageParam('zh')).toBeNull();
      expect(validateLanguageParam('ja')).toBeNull();
      expect(validateLanguageParam('invalid')).toBeNull();
    });

    it('rejects malicious input', () => {
      expect(validateLanguageParam('<script>')).toBeNull();
      expect(validateLanguageParam('javascript:alert(1)')).toBeNull();
      expect(validateLanguageParam('../../../etc/passwd')).toBeNull();
    });

    it('handles null and undefined', () => {
      expect(validateLanguageParam(null)).toBeNull();
      expect(validateLanguageParam(undefined)).toBeNull();
    });

    it('handles empty string', () => {
      expect(validateLanguageParam('')).toBeNull();
    });

    it('handles non-string types gracefully', () => {
      expect(validateLanguageParam(123 as any)).toBeNull();
      expect(validateLanguageParam({} as any)).toBeNull();
      expect(validateLanguageParam([] as any)).toBeNull();
    });
  });

  describe('detectGuestLanguage - URL Priority', () => {
    it('uses URL parameter when valid', async () => {
      const request = createMockRequest({
        searchParams: { lang: 'fr' },
      });

      const result = await detectGuestLanguage('fr', request);
      expect(result).toBe('fr');
    });

    it('URL parameter overrides cookie', async () => {
      const request = createMockRequest({
        searchParams: { lang: 'fr' },
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
      });

      const result = await detectGuestLanguage('fr', request);
      expect(result).toBe('fr');
    });

    it('URL parameter overrides Accept-Language header', async () => {
      const request = createMockRequest({
        searchParams: { lang: 'fr' },
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = await detectGuestLanguage('fr', request);
      expect(result).toBe('fr');
    });

    it('falls through when URL parameter invalid', async () => {
      const request = createMockRequest({
        searchParams: { lang: 'invalid' },
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
      });

      const result = await detectGuestLanguage('invalid', request);
      expect(result).toBe('es'); // Falls back to cookie
    });

    it('handles array URL parameters (takes first)', async () => {
      const request = createMockRequest({});

      const result = await detectGuestLanguage(['fr', 'es'], request);
      expect(result).toBe('fr');
    });
  });
});
```

### Step 4: Test Cookie Detection (Priority 2)
- **Description**: Write tests verifying cookie preference overrides Accept-Language but not URL
- **Rationale**: Cookie persistence is second priority. Must work correctly for returning guests.
- **Estimated Effort**: M (45-60 minutes)

**Implementation Details:**
```typescript
// =============================================================================
// Cookie Tests (Priority 2)
// =============================================================================

describe('Cookie Detection', () => {
  describe('getGuestLanguageFromCookie', () => {
    it('reads valid language from cookie', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'fr' },
      });

      const result = getGuestLanguageFromCookie(request);
      expect(result).toBe('fr');
    });

    it('returns null for invalid cookie value', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'invalid' },
      });

      const result = getGuestLanguageFromCookie(request);
      expect(result).toBeNull();
    });

    it('returns null when cookie absent', () => {
      const request = createMockRequest({});

      const result = getGuestLanguageFromCookie(request);
      expect(result).toBeNull();
    });

    it('returns null for empty cookie value', () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: '' },
      });

      const result = getGuestLanguageFromCookie(request);
      expect(result).toBeNull();
    });
  });

  describe('detectGuestLanguage - Cookie Priority', () => {
    it('uses cookie when URL parameter absent', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
      });

      const result = await detectGuestLanguage(null, request);
      expect(result).toBe('es');
    });

    it('cookie overrides Accept-Language header', async () => {
      const request = createMockRequest({
        cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
        headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      });

      const result = await detectGuestLanguage(null, request);
      expect(result).toBe('es');
    });

    it('cookie does NOT override valid URL parameter', async () => {
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
      expect(result).toBe('de'); // Falls back to header
    });
  });
});
```

### Step 5: Test Accept-Language Header Detection (Priority 3)
- **Description**: Write tests verifying Accept-Language header parsing and priority
- **Rationale**: Browser headers are third priority. Must parse correctly with quality values.
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
// =============================================================================
// Accept-Language Header Tests (Priority 3)
// =============================================================================

describe('Accept-Language Header Detection', () => {
  it('detects language from simple header', async () => {
    const request = createMockRequest({
      headers: { 'Accept-Language': 'fr-FR' },
    });

    const result = await detectGuestLanguage(null, request);
    expect(result).toBe('fr');
  });

  it('parses complex header with quality values', async () => {
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
          { code: 'fr', quality: 0.8 }, // Supported - should be selected
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

  it('header does NOT override URL parameter', async () => {
    const request = createMockRequest({
      headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
    });

    const result = await detectGuestLanguage('fr', request);
    expect(result).toBe('fr'); // URL wins
  });

  it('header does NOT override cookie', async () => {
    const request = createMockRequest({
      cookies: { [GUEST_LANGUAGE_COOKIE_NAME]: 'es' },
      headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
    });

    const result = await detectGuestLanguage(null, request);
    expect(result).toBe('es'); // Cookie wins
  });

  it('handles malformed Accept-Language header', async () => {
    const request = createMockRequest({
      headers: { 'Accept-Language': ';;;invalid;;;' },
    });

    const result = await detectGuestLanguage(null, request);
    expect(result).toBe('en'); // Falls back to default
  });

  it('handles empty Accept-Language header', async () => {
    const request = createMockRequest({
      headers: { 'Accept-Language': '' },
    });

    const result = await detectGuestLanguage(null, request);
    expect(result).toBe('en'); // Falls back to default
  });

  it('handles missing Accept-Language header', async () => {
    const request = createMockRequest({});

    const result = await detectGuestLanguage(null, request);
    expect(result).toBe('en'); // Falls back to default
  });
});
```

### Step 6: Test Default Fallback (Priority 4)
- **Description**: Write tests verifying fallback to English when all detection sources fail
- **Rationale**: System must always return a valid language. Default is final safety net.
- **Estimated Effort**: S (30 minutes)

**Implementation Details:**
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
      headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' }, // Chinese not supported
    });

    const result = await detectGuestLanguage(null, request);
    expect(result).toBe('en');
  });
});
```

### Step 7: Create Client-Side Hook Tests
- **Description**: Write tests for useGuestLanguage hook behavior
- **Rationale**: Client-side hook also needs priority cascade tests to ensure consistency
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
// File: /src/hooks/__tests__/useGuestLanguage.test.ts

/**
 * useGuestLanguage Hook Tests
 * Tests for client-side guest language state management.
 *
 * REQ-E04-022: Test Language Detection Scenarios
 * REQ-E04-014: Create useGuestLanguage Hook
 *
 * @module hooks/__tests__/useGuestLanguage.test
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGuestLanguage } from '../useGuestLanguage';
import * as guestLanguageUtils from '@/lib/i18n/guest-language';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock guest language utilities
vi.mock('@/lib/i18n/guest-language', () => ({
  setGuestLanguageCookie: vi.fn(),
  getGuestLanguageFromCookie: vi.fn(),
  GUEST_LANGUAGE_COOKIE_NAME: 'FAQBNB_GUEST_LANG',
}));

describe('useGuestLanguage', () => {
  const mockReplace = vi.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ replace: mockReplace });
    (useSearchParams as any).mockReturnValue(mockSearchParams);
  });

  afterEach(() => {
    mockSearchParams.delete('lang');
  });

  it('initializes with provided initial language', () => {
    const { result } = renderHook(() =>
      useGuestLanguage({
        initialLanguage: 'fr',
        sourceLanguage: 'en',
        availableTranslations: ['en', 'fr', 'es'],
      })
    );

    expect(result.current.currentLanguage).toBe('fr');
  });

  it('updates URL when language changes', () => {
    const { result } = renderHook(() =>
      useGuestLanguage({
        initialLanguage: 'en',
        sourceLanguage: 'en',
        availableTranslations: ['en', 'fr', 'es'],
      })
    );

    act(() => {
      result.current.setLanguage('fr');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('lang=fr'),
      expect.objectContaining({ scroll: false })
    );
  });

  it('sets cookie when language changes', () => {
    const { result } = renderHook(() =>
      useGuestLanguage({
        initialLanguage: 'en',
        sourceLanguage: 'en',
        availableTranslations: ['en', 'fr'],
      })
    );

    act(() => {
      result.current.setLanguage('fr');
    });

    expect(guestLanguageUtils.setGuestLanguageCookie).toHaveBeenCalledWith('fr');
  });

  // Add more client-side tests as needed
});
```

### Step 8: Create Integration Tests
- **Description**: Write integration tests combining multiple components of language detection
- **Rationale**: Verify end-to-end behavior beyond unit tests
- **Estimated Effort**: M (1 hour)

**Implementation Details:**
```typescript
// File: /src/lib/i18n/__tests__/guest-language.integration.test.ts

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

describe('Language Detection - Integration', () => {
  it('complete detection cycle with URL parameter', async () => {
    const req = new NextRequest('http://localhost:3000/item/abc?lang=fr');
    const urlParam = req.nextUrl.searchParams.get('lang');

    const detectedLang = await detectGuestLanguage(urlParam, req);

    expect(detectedLang).toBe('fr');
  });

  it('middleware-style usage pattern', async () => {
    const req = new NextRequest('http://localhost:3000/item/abc');
    req.headers.set('Accept-Language', 'es-ES,es;q=0.9');

    const res = NextResponse.next();
    const urlParam = req.nextUrl.searchParams.get('lang');
    const guestLang = await detectGuestLanguage(urlParam, req);

    setGuestLanguageCookie(res, guestLang);

    expect(guestLang).toBe('es');
    expect(res.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value).toBe('es');
  });

  it('priority cascade in realistic scenario', async () => {
    // Scenario: Returning guest with cookie, but clicks shareable link with different language
    const req = new NextRequest('http://localhost:3000/item/abc?lang=fr');
    req.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'es'); // Has Spanish preference
    req.headers.set('Accept-Language', 'de-DE,de;q=0.9'); // Browser is German

    const urlParam = req.nextUrl.searchParams.get('lang');
    const detectedLang = await detectGuestLanguage(urlParam, req);

    expect(detectedLang).toBe('fr'); // URL wins over all
  });
});
```

### Step 9: Add Test Coverage Reporting
- **Description**: Configure coverage thresholds and reporting for language detection modules
- **Rationale**: Ensures comprehensive test coverage is maintained
- **Estimated Effort**: XS (15-20 minutes)

**Implementation Details:**
Update `vitest.config.ts` (or create if doesn't exist):
```typescript
// Add or update coverage configuration
export default defineConfig({
  test: {
    coverage: {
      include: [
        'src/lib/i18n/guest-language.ts',
        'src/lib/i18n/language-detection.ts',
        'src/hooks/useGuestLanguage.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

### Step 10: Document Test Execution and CI Integration
- **Description**: Create documentation for running tests and verify CI integration
- **Rationale**: Ensures tests are run consistently in development and CI
- **Estimated Effort**: S (20-30 minutes)

**Implementation Details:**
- Verify tests run with `npm test`
- Verify tests run in CI pipeline (GitHub Actions)
- Document test commands in README or test documentation
- Ensure tests are non-flaky and deterministic

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Test Files
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/__tests__/guest-language.test.ts` | — | Create |
| `/src/lib/i18n/__tests__/guest-language.integration.test.ts` | — | Create |
| `/src/hooks/__tests__/useGuestLanguage.test.ts` | — | Create |

### Test File Contents
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/__tests__/guest-language.test.ts` | Test helpers | Create |
| `/src/lib/i18n/__tests__/guest-language.test.ts` | URL parameter tests | Create |
| `/src/lib/i18n/__tests__/guest-language.test.ts` | Cookie tests | Create |
| `/src/lib/i18n/__tests__/guest-language.test.ts` | Accept-Language tests | Create |
| `/src/lib/i18n/__tests__/guest-language.test.ts` | Default fallback tests | Create |
| `/src/hooks/__tests__/useGuestLanguage.test.ts` | Hook behavior tests | Create |
| `/src/lib/i18n/__tests__/guest-language.integration.test.ts` | Integration tests | Create |

### Configuration Files (Optional)
| File | Target | Type |
|------|--------|------|
| `vitest.config.ts` | Coverage thresholds | Modify |
| `package.json` | Test scripts (if needed) | Verify |

### Files Being Tested (No Modification)
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/guest-language.ts` | Functions under test | Test Only |
| `/src/hooks/useGuestLanguage.ts` | Hook under test | Test Only |
| `/src/lib/i18n/language-detection.ts` | Helper functions | Test Only |

---

## Dependencies

### Depends On (Completed First):
- **REQ-E04-002** (Task 1.2): Create Guest Language Utility Module - Provides functions to test
- **REQ-E04-014** (Task 4.1): Create useGuestLanguage Hook - Provides hook to test
- **REQ-E04-021** (Task 6.2): Create Server-Side Language Detection Utility - Provides `detectGuestLanguage` function

### Blocks (Requires This First):
- None - Testing task doesn't block other implementation work
- Tests can be written in parallel with implementation or after

### Parallel Safety:
- **Files touched**:
  - `/src/lib/i18n/__tests__/guest-language.test.ts` (new)
  - `/src/hooks/__tests__/useGuestLanguage.test.ts` (new)
  - Configuration files (minor changes)
- **Conflicts with**:
  - None - Test files don't conflict with implementation
- **Safe to parallelize with**:
  - All other Epic 4 tasks
  - Other testing tasks (REQ-E04-023, REQ-E04-024, REQ-E04-025, REQ-E04-026)

### External Dependencies:
- Vitest testing framework
- @testing-library/react for hook testing
- Next.js 15 APIs (NextRequest, NextResponse)
- Node.js test environment

---

## Risks and Considerations

### Risk: Test Flakiness with Async Operations

**Issue:** Async detection functions might cause flaky tests if not awaited properly.

**Mitigation:**
- Always use `await` with `detectGuestLanguage`
- Use `waitFor` from @testing-library for hook tests
- Set appropriate timeouts for async operations
- Run tests multiple times locally to verify stability

### Risk: Mock Complexity

**Issue:** Mocking Next.js APIs (NextRequest, cookies, headers) can be complex and fragile.

**Mitigation:**
- Use helper functions to create consistent mocks
- Document mock setup clearly in test comments
- Keep mocks simple and focused on tested behavior
- Consider using actual NextRequest instances instead of mocks where possible

### Risk: Test Coverage Gaps

**Issue:** Missing edge cases could lead to production bugs.

**Mitigation:**
- Use code coverage tools to identify untested branches
- Test matrix approach: every priority level × every input type
- Include malicious input tests (XSS, injection attempts)
- Test all error paths and fallbacks

### Risk: Tests Passing But Behavior Wrong

**Issue:** Tests might verify mocked behavior instead of actual behavior.

**Mitigation:**
- Include integration tests that use real NextRequest objects
- Manual testing checklist to complement automated tests
- Review test assertions carefully (testing right things)
- Use realistic test data (actual Accept-Language headers from browsers)

### Risk: CI Pipeline Compatibility

**Issue:** Tests might pass locally but fail in CI due to environment differences.

**Mitigation:**
- Use Node.js version matching CI in local development
- Avoid environment-specific dependencies
- Test in both development and production modes
- Mock external dependencies properly

---

## Testing Strategy

### Test Organization

**Unit Tests:**
- Individual function behavior (validateLanguageParam, getGuestLanguageFromCookie)
- Priority cascade for each level
- Edge cases and error handling

**Integration Tests:**
- Complete detection flow (URL → cookie → header → default)
- Realistic usage patterns (middleware-style, server component-style)
- Multiple sources present scenarios

**Coverage Goals:**
- Statements: >80%
- Branches: >80%
- Functions: >80%
- Lines: >80%

### Test Execution

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode (development)
npm test -- --watch

# Run specific test file
npm test guest-language.test.ts

# Run integration tests only
npm test integration.test.ts
```

### Manual Testing Checklist

After automated tests pass:
- [ ] Manual test with real browser Accept-Language headers
- [ ] Manual test with URL parameters in browser
- [ ] Manual test with cookies set via DevTools
- [ ] Verify console logs show correct detection source
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test with VPN/different locales
- [ ] Verify no errors in console during detection

---

## Out of Scope

The following are explicitly NOT part of this task:

1. **Content Display Tests** - Testing that translated content shows correctly (REQ-E04-023)
2. **Edge Case Tests** - Partial translations, cookie blocking (REQ-E04-024)
3. **Mobile Tests** - Mobile responsiveness testing (REQ-E04-025)
4. **Performance Tests** - Language detection speed validation (REQ-E04-026)
5. **Middleware Integration Tests** - Testing middleware as a whole (separate task)
6. **E2E Tests** - Full page load tests with Playwright/Cypress
7. **Visual Regression Tests** - Screenshot comparison tests
8. **Load Tests** - Concurrent request testing
9. **Accessibility Tests** - ARIA, keyboard navigation
10. **Browser Compatibility Tests** - Cross-browser automated testing

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Testing Framework | Vitest | Already in use, fast, good TypeScript support |
| Test Structure | Separate files per module | Maintainability, follows existing patterns |
| Mock Strategy | Helper functions for mocks | Reduces duplication, improves readability |
| Coverage Target | 80% minimum | Industry standard, catches most issues |
| Test Organization | Priority-based grouping | Matches priority cascade, logical structure |
| Integration Tests | Separate file | Clear separation of unit vs integration |
| Mock vs Real Objects | Real NextRequest when possible | More realistic, less fragile |
| Async Handling | Always await async functions | Prevents flaky tests |

---

## Notes

- **Testing Focus:** This is specifically focused on TESTING language detection, not implementing it
- **Test Quality:** Tests should be clear, maintainable, and deterministic
- **Documentation:** Each test should have clear names explaining what it tests
- **Coverage:** Aim for comprehensive coverage of priority cascade logic
- **Edge Cases:** Include tests for malformed input, security concerns
- **Performance:** Tests should run quickly (< 5 seconds total for all language detection tests)
- **CI Integration:** Tests must pass in CI before deployment
- **Maintainability:** Tests should be easy to update when requirements change

---

**Status:** PENDING

**Next Steps:**
1. Verify dependencies completed (REQ-E04-002, REQ-E04-014, REQ-E04-021)
2. Create test file structure
3. Implement test helper functions and mocks
4. Write URL parameter detection tests
5. Write cookie detection tests
6. Write Accept-Language header tests
7. Write default fallback tests
8. Write client-side hook tests
9. Write integration tests
10. Configure coverage thresholds
11. Run tests locally and verify all pass
12. Verify tests pass in CI pipeline
13. Review code coverage reports
14. Perform manual testing to complement automated tests
15. Document test execution commands
16. Commit changes following git conventions

---

*Document generated: 2026-01-22 19:48*
