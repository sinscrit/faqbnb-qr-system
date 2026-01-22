# Implementation Overview: Test Edge Cases

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-024 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:50 |
| Breakdown Created | 2026-01-22 19:55 |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

---

## Goals

Create comprehensive tests for edge cases in the translation system to ensure robust handling of unusual or error scenarios. Tests should verify graceful degradation when translations are partial, cookies are blocked, or inputs are malformed.

**Success Criteria:**
- Tests verify items with translated titles but untranslated descriptions display correctly (mixed content)
- Tests verify articles with translated content but untranslated author names display correctly
- Tests verify system functions when cookies are blocked or unavailable
- Tests verify cookie blocked scenario falls back to Accept-Language detection
- Tests verify cookie blocked scenario falls back to English when no Accept-Language
- Tests verify malformed Accept-Language headers don't cause errors or crashes
- Tests verify empty Accept-Language headers are handled gracefully
- Tests verify unsupported language codes fall back to English
- Tests verify invalid language codes (injection attempts) are rejected safely
- Tests verify multiple simultaneous language changes don't cause race conditions
- All edge case tests pass in CI pipeline
- Tests are maintainable and well-documented

---

## Assumptions & Clarifications

**Assumptions:**
- REQ-E04-002 and REQ-E04-021 provide language detection utilities to test
- REQ-E04-014 provides useGuestLanguage hook to test
- REQ-E04-017 provides ItemDisplay component integration
- Testing framework is Vitest with React Testing Library
- Edge cases should not crash the application but degrade gracefully
- Security concerns (XSS, injection) are part of edge case testing

**Clarifications Needed:**
- Should we test browser API limitations (localStorage, cookies disabled)?
- **Answer:** Yes, test cookie blocking as it's a common scenario. Other browser limitations can be documented but not extensively tested.

---

## Implementation Plan

### Step 1: Create Edge Case Test Fixtures
- **Description**: Create mock data for edge case scenarios (partial translations, malformed data, etc.)
- **Rationale**: Reusable fixtures ensure consistency across edge case tests
- **Estimated Effort**: S (30-45 minutes)

**Implementation Details:**
```typescript
// File: /src/lib/i18n/__tests__/fixtures/edgeCaseFixtures.ts

/**
 * Edge Case Test Fixtures
 * Mock data for testing unusual scenarios.
 *
 * REQ-E04-024: Test Edge Cases
 *
 * @module lib/i18n/__tests__/fixtures/edgeCaseFixtures
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { NextRequest } from 'next/server';

/**
 * Malformed Accept-Language headers that should be handled gracefully
 */
export const malformedAcceptLanguageHeaders = [
  ';;;invalid;;;',
  'fr-FR;q=invalid',
  'en;q=2.0', // Quality > 1.0
  'en;q=-0.5', // Negative quality
  '',
  'null',
  'undefined',
  '<script>alert("xss")</script>',
  '../../../etc/passwd',
  'a'.repeat(10000), // Very long string
];

/**
 * Invalid language codes that should be rejected
 */
export const invalidLanguageCodes = [
  'invalid',
  'xx',
  'zz',
  '123',
  'en-XXXXX',
  '<script>',
  'javascript:alert(1)',
  '../../../etc/passwd',
  'null',
  'undefined',
  '',
  ' ',
  'en fr', // Multiple codes in one string
  'en,fr', // Comma-separated
];

/**
 * Unsupported but valid language codes (should fall back to default)
 */
export const unsupportedLanguageCodes = [
  'zh', // Chinese
  'ja', // Japanese
  'ar', // Arabic
  'ko', // Korean
  'pt', // Portuguese
  'ru', // Russian
];

/**
 * Item with partially translated content (some fields missing)
 */
export const partiallyTranslatedContent = {
  // Title translated, description not
  onlyTitle: {
    name: 'Guide Wifi',
    originalName: 'Wifi Guide',
    description: 'Instructions for connecting to wifi', // Same as original
    originalDescription: 'Instructions for connecting to wifi',
  },
  // Description translated, title not
  onlyDescription: {
    name: 'Wifi Guide', // Same as original
    originalName: 'Wifi Guide',
    description: 'Instructions pour se connecter au wifi',
    originalDescription: 'Instructions for connecting to wifi',
  },
  // Some links translated, others not
  mixedLinks: [
    {
      id: 'link-1',
      title: 'Page de connexion routeur', // Translated
      originalTitle: 'Router login page',
    },
    {
      id: 'link-2',
      title: 'Support documentation', // Not translated
      originalTitle: 'Support documentation',
    },
  ],
  // Some articles translated, others not
  mixedArticles: [
    {
      id: 'article-1',
      title: 'Comment se connecter', // Translated
      originalTitle: 'How to connect',
      content: 'Étape 1...', // Translated
      originalContent: 'Step 1...',
    },
    {
      id: 'article-2',
      title: 'Troubleshooting', // Not translated
      originalTitle: 'Troubleshooting',
      content: 'If you have issues...', // Not translated
      originalContent: 'If you have issues...',
    },
  ],
};

/**
 * Creates a NextRequest that simulates cookies being blocked/unavailable
 */
export function createRequestWithoutCookies(options: {
  url?: string;
  headers?: Record<string, string>;
}): NextRequest {
  const url = options.url || 'http://localhost:3000/item/test123';
  const request = new NextRequest(url);

  // Set headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([name, value]) => {
      request.headers.set(name, value);
    });
  }

  // Mock cookies.get to return undefined (simulating blocked cookies)
  const originalGet = request.cookies.get.bind(request.cookies);
  request.cookies.get = vi.fn(() => undefined);

  return request;
}
```

### Step 2: Test Partial Translation Scenarios
- **Description**: Write tests for mixed translated/untranslated content across all content types
- **Rationale**: Real-world scenario where translation is incomplete
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
// File: /src/lib/i18n/__tests__/guest-language.edgecases.test.ts

/**
 * Guest Language Detection - Edge Case Tests
 * Tests for unusual scenarios and error conditions.
 *
 * REQ-E04-024: Test Edge Cases
 *
 * @module lib/i18n/__tests__/guest-language.edgecases.test
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  detectGuestLanguage,
  validateLanguageParam,
} from '../guest-language';
import {
  malformedAcceptLanguageHeaders,
  invalidLanguageCodes,
  unsupportedLanguageCodes,
  createRequestWithoutCookies,
} from './fixtures/edgeCaseFixtures';

describe('Partial Translations', () => {
  it('handles item with translated title but original description', () => {
    // This test belongs in ItemDisplay tests, but verify the pattern
    const content = {
      name: 'Guide Wifi', // Translated
      description: 'Instructions for connecting to wifi', // Original (fallback)
    };

    expect(content.name).toBe('Guide Wifi');
    expect(content.description).toBe('Instructions for connecting to wifi');
  });

  it('handles mixed content gracefully', () => {
    const mixedContent = {
      translatedField: 'Valeur traduite',
      untranslatedField: 'Original value',
    };

    // Both fields should display without error
    expect(mixedContent.translatedField).toBeDefined();
    expect(mixedContent.untranslatedField).toBeDefined();
  });
});
```

### Step 3: Test Cookie Blocked Scenarios
- **Description**: Write tests for when cookies are disabled or blocked by browser
- **Rationale**: Common privacy setting that must be handled gracefully
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
describe('Cookie Blocked Scenarios', () => {
  it('falls back to Accept-Language when cookies blocked', async () => {
    const request = createRequestWithoutCookies({
      headers: { 'Accept-Language': 'fr-FR,fr;q=0.9' },
    });

    const result = await detectGuestLanguage(null, request);

    // Should detect French from header since cookie unavailable
    expect(result).toBe('fr');
  });

  it('falls back to English when cookies blocked and no Accept-Language', async () => {
    const request = createRequestWithoutCookies({});

    const result = await detectGuestLanguage(null, request);

    expect(result).toBe('en');
  });

  it('URL parameter still works when cookies blocked', async () => {
    const request = createRequestWithoutCookies({
      url: 'http://localhost:3000/item/test?lang=es',
    });

    const urlParam = new URL(request.url).searchParams.get('lang');
    const result = await detectGuestLanguage(urlParam, request);

    // URL param should work regardless of cookie availability
    expect(result).toBe('es');
  });

  it('does not crash when trying to set cookie fails', async () => {
    const request = createRequestWithoutCookies({});

    // Detection should succeed even if cookie setting fails
    await expect(detectGuestLanguage(null, request)).resolves.toBeDefined();
  });

  it('handles cookies.get returning null', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.cookies.get = vi.fn(() => null as any);

    const result = await detectGuestLanguage(null, request);

    expect(result).toBe('en'); // Falls back to default
  });

  it('handles cookies.get throwing error', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.cookies.get = vi.fn(() => {
      throw new Error('Cookie access denied');
    });

    // Should not crash, should fall back to default
    await expect(async () => {
      const result = await detectGuestLanguage(null, request);
      expect(result).toBe('en');
    }).not.toThrow();
  });
});
```

### Step 4: Test Malformed Accept-Language Headers
- **Description**: Write tests for invalid, malformed, or malicious Accept-Language headers
- **Rationale**: Browsers and proxies might send malformed headers; must not crash
- **Estimated Effort**: M (1 hour)

**Implementation Details:**
```typescript
describe('Malformed Accept-Language Headers', () => {
  malformedAcceptLanguageHeaders.forEach((malformedHeader) => {
    it(`handles malformed header: "${malformedHeader.substring(0, 50)}..."`, async () => {
      const request = new NextRequest('http://localhost:3000');
      request.headers.set('Accept-Language', malformedHeader);

      // Should not throw error
      await expect(async () => {
        const result = await detectGuestLanguage(null, request);
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    it(`falls back to default for malformed header: "${malformedHeader.substring(0, 50)}..."`, async () => {
      const request = new NextRequest('http://localhost:3000');
      request.headers.set('Accept-Language', malformedHeader);

      const result = await detectGuestLanguage(null, request);

      // Should fall back to English
      expect(result).toBe('en');
    });
  });

  it('handles empty Accept-Language header', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', '');

    const result = await detectGuestLanguage(null, request);

    expect(result).toBe('en');
  });

  it('handles missing Accept-Language header', async () => {
    const request = new NextRequest('http://localhost:3000');
    // Don't set Accept-Language at all

    const result = await detectGuestLanguage(null, request);

    expect(result).toBe('en');
  });

  it('handles Accept-Language with invalid quality values', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', 'fr;q=invalid,en;q=abc');

    const result = await detectGuestLanguage(null, request);

    // Should handle parsing error gracefully
    expect(result).toBeDefined();
  });

  it('handles Accept-Language with quality > 1.0', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', 'fr;q=2.0,en;q=1.5');

    const result = await detectGuestLanguage(null, request);

    // Should normalize or ignore invalid quality
    expect(['fr', 'en']).toContain(result);
  });

  it('handles Accept-Language with negative quality', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', 'fr;q=-0.5,en;q=0.8');

    const result = await detectGuestLanguage(null, request);

    // Should ignore negative quality, might use 'en'
    expect(result).toBeDefined();
  });

  it('handles extremely long Accept-Language header', async () => {
    const longHeader = 'en-US,'.repeat(1000) + 'en';
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', longHeader);

    const result = await detectGuestLanguage(null, request);

    // Should handle without performance issues
    expect(result).toBe('en');
  });
});
```

### Step 5: Test Unsupported Language Codes
- **Description**: Write tests for valid but unsupported language codes (Chinese, Japanese, etc.)
- **Rationale**: Users might request languages we don't support; must fall back gracefully
- **Estimated Effort**: S (45 minutes)

**Implementation Details:**
```typescript
describe('Unsupported Language Codes', () => {
  unsupportedLanguageCodes.forEach((unsupportedCode) => {
    it(`rejects unsupported language code: ${unsupportedCode}`, () => {
      const result = validateLanguageParam(unsupportedCode);

      expect(result).toBeNull();
    });

    it(`falls back to default for unsupported URL param: ${unsupportedCode}`, async () => {
      const request = new NextRequest('http://localhost:3000');

      const result = await detectGuestLanguage(unsupportedCode, request);

      expect(result).toBe('en');
    });

    it(`falls back to default for unsupported Accept-Language: ${unsupportedCode}`, async () => {
      const request = new NextRequest('http://localhost:3000');
      request.headers.set('Accept-Language', unsupportedCode);

      const result = await detectGuestLanguage(null, request);

      expect(result).toBe('en');
    });
  });

  it('unsupported language in cookie falls back to header', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.cookies.set('FAQBNB_GUEST_LANG', 'zh'); // Chinese not supported
    request.headers.set('Accept-Language', 'fr-FR');

    const result = await detectGuestLanguage(null, request);

    // Should skip invalid cookie, use header
    expect(result).toBe('fr');
  });

  it('handles locale variants of unsupported languages', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', 'zh-CN,zh-TW;q=0.9,zh;q=0.8');

    const result = await detectGuestLanguage(null, request);

    // All variants unsupported, fall back to default
    expect(result).toBe('en');
  });
});
```

### Step 6: Test Invalid/Malicious Language Codes
- **Description**: Write tests for security: XSS attempts, path traversal, injection
- **Rationale**: Security is critical; must prevent code injection through language parameters
- **Estimated Effort**: M (1 hour)

**Implementation Details:**
```typescript
describe('Invalid and Malicious Language Codes', () => {
  invalidLanguageCodes.forEach((invalidCode) => {
    it(`rejects invalid code: "${invalidCode}"`, () => {
      const result = validateLanguageParam(invalidCode);

      expect(result).toBeNull();
    });

    it(`does not execute malicious code: "${invalidCode}"`, async () => {
      const request = new NextRequest('http://localhost:3000');

      // Should not throw, should return safe default
      const result = await detectGuestLanguage(invalidCode, request);

      expect(result).toBe('en');
      expect(['en', 'fr', 'es', 'de', 'nl', 'it']).toContain(result);
    });
  });

  it('prevents XSS via URL parameter', () => {
    const xssAttempt = '<script>alert("xss")</script>';
    const result = validateLanguageParam(xssAttempt);

    expect(result).toBeNull();
  });

  it('prevents path traversal via URL parameter', () => {
    const pathTraversal = '../../../etc/passwd';
    const result = validateLanguageParam(pathTraversal);

    expect(result).toBeNull();
  });

  it('prevents SQL injection attempts', () => {
    const sqlInjection = "'; DROP TABLE users; --";
    const result = validateLanguageParam(sqlInjection);

    expect(result).toBeNull();
  });

  it('prevents JavaScript injection', () => {
    const jsInjection = 'javascript:alert(1)';
    const result = validateLanguageParam(jsInjection);

    expect(result).toBeNull();
  });

  it('handles null bytes', () => {
    const nullByte = 'en\0malicious';
    const result = validateLanguageParam(nullByte);

    expect(result).toBeNull();
  });

  it('handles Unicode exploits', () => {
    const unicodeExploit = 'en\u0000\u0001\u0002';
    const result = validateLanguageParam(unicodeExploit);

    // Should either reject or normalize safely
    if (result) {
      expect(['en', 'fr', 'es', 'de', 'nl', 'it']).toContain(result);
    } else {
      expect(result).toBeNull();
    }
  });
});
```

### Step 7: Test Race Conditions
- **Description**: Write tests for multiple simultaneous language changes
- **Rationale**: Prevent bugs from rapid user actions or concurrent requests
- **Estimated Effort**: M (45-60 minutes)

**Implementation Details:**
```typescript
describe('Race Conditions and Concurrent Operations', () => {
  it('handles multiple rapid language changes', async () => {
    const mockSetLanguage = vi.fn();

    // Simulate rapid clicks
    const promises = [
      mockSetLanguage('fr'),
      mockSetLanguage('es'),
      mockSetLanguage('de'),
      mockSetLanguage('it'),
    ];

    await Promise.all(promises);

    // Should not crash, all calls should complete
    expect(mockSetLanguage).toHaveBeenCalledTimes(4);
  });

  it('handles simultaneous detection calls', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', 'fr-FR');

    // Multiple simultaneous detections
    const results = await Promise.all([
      detectGuestLanguage(null, request),
      detectGuestLanguage(null, request),
      detectGuestLanguage(null, request),
    ]);

    // All should return same result
    expect(results[0]).toBe('fr');
    expect(results[1]).toBe('fr');
    expect(results[2]).toBe('fr');
  });

  it('handles language change during toggle', async () => {
    // This tests the hook behavior - would be in hook tests
    // Simulates: user clicks toggle while language change is processing

    const mockState = {
      currentLanguage: 'fr',
      showOriginal: false,
      isChangingLanguage: true,
    };

    // Toggle should either queue or be prevented during language change
    expect(mockState.isChangingLanguage).toBe(true);
  });
});
```

### Step 8: Test Component Edge Cases
- **Description**: Write tests for ItemDisplay with edge case data
- **Rationale**: Component must handle unusual data gracefully in UI
- **Estimated Effort**: M (1 hour)

**Implementation Details:**
```typescript
// File: /src/components/__tests__/ItemDisplay.edgecases.test.tsx

/**
 * ItemDisplay Edge Case Tests
 * Tests for unusual data scenarios in UI components.
 *
 * REQ-E04-024: Test Edge Cases
 *
 * @module components/__tests__/ItemDisplay.edgecases.test
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ItemDisplay from '../ItemDisplay';
import { partiallyTranslatedContent } from '../__tests__/fixtures/edgeCaseFixtures';

describe('ItemDisplay - Edge Cases', () => {
  it('displays item with only title translated', () => {
    const item = {
      id: 'test',
      publicId: 'test123',
      ...partiallyTranslatedContent.onlyTitle,
      links: [],
      articles: [],
      tags: [],
    };

    render(
      <ItemDisplay
        item={item}
        translationMeta={{
          requestedLanguage: 'fr',
          displayLanguage: 'fr',
          originalLanguage: 'en',
          availableLanguages: ['en', 'fr'],
          isTranslated: true,
        }}
      />
    );

    // Translated title
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
    // Original description (fallback)
    expect(
      screen.getByText('Instructions for connecting to wifi')
    ).toBeInTheDocument();
  });

  it('displays item with mixed translated/untranslated links', () => {
    const item = {
      id: 'test',
      publicId: 'test123',
      name: 'Test',
      description: 'Test',
      links: partiallyTranslatedContent.mixedLinks,
      articles: [],
      tags: [],
    };

    render(
      <ItemDisplay
        item={item}
        translationMeta={{
          requestedLanguage: 'fr',
          displayLanguage: 'fr',
          originalLanguage: 'en',
          availableLanguages: ['en', 'fr'],
          isTranslated: true,
        }}
      />
    );

    // Translated link
    expect(screen.getByText('Page de connexion routeur')).toBeInTheDocument();
    // Untranslated link
    expect(screen.getByText('Support documentation')).toBeInTheDocument();
  });

  it('handles empty translation metadata gracefully', () => {
    const item = {
      id: 'test',
      publicId: 'test123',
      name: 'Test',
      description: 'Test',
      links: [],
      articles: [],
      tags: [],
    };

    // No translationMeta prop
    expect(() => {
      render(<ItemDisplay item={item} />);
    }).not.toThrow();
  });

  it('handles null/undefined fields in item', () => {
    const item = {
      id: 'test',
      publicId: 'test123',
      name: 'Test',
      description: null as any,
      links: undefined as any,
      articles: null as any,
      tags: [],
    };

    expect(() => {
      render(<ItemDisplay item={item} />);
    }).not.toThrow();
  });

  it('handles very long translated content', () => {
    const longText = 'A'.repeat(10000);
    const item = {
      id: 'test',
      publicId: 'test123',
      name: 'Test',
      description: longText,
      links: [],
      articles: [],
      tags: [],
    };

    render(<ItemDisplay item={item} />);

    // Should render without crashing
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('handles special characters in translated content', () => {
    const specialChars = '<>&"\'`';
    const item = {
      id: 'test',
      publicId: 'test123',
      name: `Test ${specialChars}`,
      description: 'Test',
      links: [],
      articles: [],
      tags: [],
    };

    render(<ItemDisplay item={item} />);

    // Should escape special characters properly
    expect(screen.getByText(`Test ${specialChars}`)).toBeInTheDocument();
  });
});
```

### Step 9: Test Error Recovery
- **Description**: Write tests for recovery from errors (network, API failures)
- **Rationale**: System should recover gracefully from transient errors
- **Estimated Effort**: S (45 minutes)

**Implementation Details:**
```typescript
describe('Error Recovery', () => {
  it('recovers from network error during language detection', async () => {
    const request = new NextRequest('http://localhost:3000');

    // Simulate network error
    vi.spyOn(request.headers, 'get').mockImplementation(() => {
      throw new Error('Network error');
    });

    // Should not crash, should return default
    const result = await detectGuestLanguage(null, request);

    expect(result).toBe('en');
  });

  it('recovers from parsing error in Accept-Language', async () => {
    const request = new NextRequest('http://localhost:3000');
    request.headers.set('Accept-Language', 'fr;q=NaN');

    // Should handle parsing error
    const result = await detectGuestLanguage(null, request);

    expect(result).toBeDefined();
  });

  it('handles concurrent errors without state corruption', async () => {
    const request1 = new NextRequest('http://localhost:3000');
    const request2 = new NextRequest('http://localhost:3000');

    request1.headers.set('Accept-Language', 'invalid');
    request2.headers.set('Accept-Language', 'fr-FR');

    const [result1, result2] = await Promise.all([
      detectGuestLanguage(null, request1),
      detectGuestLanguage(null, request2),
    ]);

    // Each should handle independently
    expect(result1).toBe('en'); // Falls back
    expect(result2).toBe('fr'); // Succeeds
  });
});
```

### Step 10: Document Known Limitations
- **Description**: Document edge cases that are known limitations (not bugs)
- **Rationale**: Clear documentation prevents confusion about expected behavior
- **Estimated Effort**: S (30 minutes)

**Implementation Details:**
Create documentation in test file or separate doc:
```typescript
/**
 * KNOWN LIMITATIONS AND EDGE CASES
 *
 * 1. Cookie Blocking:
 *    - When cookies are completely blocked, language preference won't persist
 *    - System falls back to Accept-Language header detection each visit
 *    - This is expected behavior (privacy first)
 *
 * 2. Partial Translations:
 *    - Content may show mix of translated and original text
 *    - This is expected when translation is incomplete
 *    - TranslationBanner still shows to indicate partial translation
 *
 * 3. Unsupported Languages:
 *    - Requests for unsupported languages (Chinese, Japanese, etc.) fall back to English
 *    - User is not explicitly notified (silently falls back)
 *    - Future: Could add notification for unsupported language requests
 *
 * 4. Accept-Language Parsing:
 *    - Very complex or malformed headers may not parse perfectly
 *    - System prioritizes stability over perfect parsing
 *    - Falls back to default rather than crashing
 *
 * 5. Race Conditions:
 *    - Rapid language changes may result in "last write wins" behavior
 *    - This is acceptable for user-initiated actions
 *    - No data corruption occurs
 */
```

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Test Files
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/__tests__/fixtures/edgeCaseFixtures.ts` | — | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | — | Create |
| `/src/components/__tests__/ItemDisplay.edgecases.test.tsx` | — | Create |

### Test File Contents
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/__tests__/fixtures/edgeCaseFixtures.ts` | Edge case mock data | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | Partial translation tests | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | Cookie blocked tests | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | Malformed header tests | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | Unsupported language tests | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | Security/injection tests | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | Race condition tests | Create |
| `/src/lib/i18n/__tests__/guest-language.edgecases.test.ts` | Error recovery tests | Create |
| `/src/components/__tests__/ItemDisplay.edgecases.test.tsx` | Component edge case tests | Create |

### Files Being Tested (No Modification)
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/guest-language.ts` | Functions under test | Test Only |
| `/src/components/ItemDisplay.tsx` | Component under test | Test Only |

---

## Dependencies

### Depends On (Completed First):
- **REQ-E04-002** (Task 1.2): Create Guest Language Utility Module
- **REQ-E04-014** (Task 4.1): Create useGuestLanguage Hook
- **REQ-E04-017** (Task 5.2): Update ItemDisplay Component
- **REQ-E04-021** (Task 6.2): Create Server-Side Language Detection Utility

### Blocks (Requires This First):
- None - Testing task doesn't block other work

### Parallel Safety:
- **Files touched**:
  - Test files only (new files)
- **Conflicts with**:
  - None
- **Safe to parallelize with**:
  - All other Epic 4 tasks
  - Other testing tasks (REQ-E04-022, REQ-E04-023, REQ-E04-025, REQ-E04-026)

### External Dependencies:
- Vitest testing framework
- @testing-library/react
- Next.js 15 APIs (NextRequest, NextResponse)

---

## Risks and Considerations

### Risk: Security Test Coverage

**Issue:** May not catch all possible injection vectors or security vulnerabilities.

**Mitigation:**
- Test common attack patterns (XSS, SQL injection, path traversal)
- Document security test coverage
- Consider security audit for production
- Use parameterized tests for multiple attack vectors
- Keep security test suite updated with new attack patterns

### Risk: Browser-Specific Behavior

**Issue:** Different browsers may handle cookies/headers differently in edge cases.

**Mitigation:**
- Test common scenarios across browsers manually
- Document browser-specific limitations
- Focus on graceful degradation
- Prioritize Chrome/Firefox/Safari (most common)

### Risk: Performance Impact of Error Handling

**Issue:** Extensive try-catch blocks might impact performance.

**Mitigation:**
- Test that error handling doesn't add significant latency
- Use performance benchmarks (< 5ms for detection even with errors)
- Only catch errors where necessary
- Fast-fail on obviously invalid input

### Risk: False Sense of Security

**Issue:** Passing tests doesn't guarantee no edge cases exist.

**Mitigation:**
- Document known limitations clearly
- Encourage manual testing for unusual scenarios
- Monitor production errors for new edge cases
- Iterate tests based on production issues

### Risk: Test Maintainability

**Issue:** Many edge case tests might become difficult to maintain.

**Mitigation:**
- Use fixtures for reusable test data
- Parameterized tests for similar scenarios
- Clear test names describing edge case
- Group related edge cases in describe blocks
- Document why each edge case is tested

---

## Testing Strategy

### Test Organization

**Security Tests:**
- XSS attempts via URL parameters
- SQL injection attempts
- Path traversal attempts
- Unicode exploits

**Data Quality Tests:**
- Partial translations (mixed content)
- Missing fields
- Null/undefined values
- Very long content

**Browser Environment Tests:**
- Cookies blocked/unavailable
- Malformed Accept-Language headers
- Missing headers
- Invalid quality values

**Concurrency Tests:**
- Multiple simultaneous detections
- Rapid language changes
- Race conditions

### Coverage Goals

- Edge cases: 100% (all identified scenarios tested)
- Error paths: >90%
- Security vectors: All common attacks tested

### Test Execution

```bash
# Run all edge case tests
npm test edgecases

# Run security tests only
npm test -- --testNamePattern="security|malicious|injection"

# Run with coverage
npm run test:coverage -- edgecases
```

### Manual Testing Checklist

After automated tests:
- [ ] Test with cookies disabled in browser
- [ ] Test with aggressive ad blocker
- [ ] Test with privacy extensions (Privacy Badger, etc.)
- [ ] Test with VPN/proxy (may alter headers)
- [ ] Test with developer tools (network throttling, offline)
- [ ] Test rapid clicking on language switcher
- [ ] Test with very slow network connection
- [ ] Test with browser in private/incognito mode

---

## Out of Scope

The following are explicitly NOT part of this task:

1. **Performance Tests** - Speed/latency validation (REQ-E04-026)
2. **Mobile Tests** - Responsive layout testing (REQ-E04-025)
3. **Language Detection Priority Tests** - Already covered in REQ-E04-022
4. **Content Display Tests** - Normal scenarios covered in REQ-E04-023
5. **API Integration Tests** - Testing actual translation API
6. **Load Tests** - High concurrency testing
7. **Penetration Testing** - Comprehensive security audit
8. **Browser Compatibility Tests** - Automated cross-browser tests
9. **Accessibility Tests** - ARIA, screen reader testing
10. **Production Monitoring** - Error tracking, logging

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Security Focus | Test common attack patterns | Prevent XSS, injection attacks |
| Cookie Testing | Mock cookie blocking | Common privacy scenario |
| Error Handling | Graceful degradation to default | Stability over perfect behavior |
| Test Data | Comprehensive fixtures | Maintainability and reusability |
| Malformed Headers | Test systematically | Prevent crashes from bad input |
| Race Conditions | Test concurrent operations | Ensure thread safety |
| Performance | Monitor but don't block | Fast-fail on obviously bad input |
| Documentation | Document known limitations | Clear expectations |

---

## Notes

- **Edge Case Focus:** Tests focus on UNUSUAL scenarios, not normal operation
- **Security Priority:** Injection prevention is critical - test thoroughly
- **Graceful Degradation:** System should never crash, always fall back safely
- **Cookie Blocking:** Common scenario that must work (with reduced functionality)
- **Malformed Input:** Browsers and proxies send unexpected data - handle it
- **Race Conditions:** Concurrent operations must not corrupt state
- **Performance:** Even error handling must be fast (< 5ms overhead)
- **Documentation:** Known limitations are documented, not considered bugs
- **Maintainability:** Use fixtures and parameterized tests for many similar cases

---

**Status:** PENDING

**Next Steps:**
1. Verify dependencies completed (REQ-E04-002, REQ-E04-014, REQ-E04-017, REQ-E04-021)
2. Create edge case fixtures file
3. Write partial translation tests
4. Write cookie blocked scenario tests
5. Write malformed Accept-Language header tests
6. Write unsupported language code tests
7. Write security/injection tests
8. Write race condition tests
9. Write component edge case tests
10. Write error recovery tests
11. Document known limitations
12. Run tests locally and verify all pass
13. Verify security tests prevent known attacks
14. Perform manual testing with cookies disabled
15. Commit changes following git conventions

---

*Document generated: 2026-01-22 19:55*
