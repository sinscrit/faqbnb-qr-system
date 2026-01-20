# REQ-E04-002: Create Guest Language Utility Module - Implementation Overview

**Document Created:** 2026-01-19 21:30 UTC
**Last Modified:** 2026-01-19 21:30 UTC
**Request ID:** REQ-E04-002
**Epic:** Epic 4 - Guest Experience
**Phase:** 1 - Types and Utilities
**Task ID:** 1.2
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Summary

Create a guest-specific language utility module at `/src/lib/i18n/guest-language.ts` that provides functions for detecting and persisting guest language preferences through cookies, URL parameters, and browser headers. This module enables seamless multilingual experiences for unauthenticated guests scanning QR codes.

---

## 2. Requirements Reference

### From Request REQ-E04-002

- Automatically detect guest language preferences from URL parameters, cookies, and browser headers
- Persist language choices in cookies for cross-session continuity
- Parse Accept-Language headers according to HTTP standards with quality value support
- Map browser-specific language codes (e.g., en-US, pt-BR) to application-supported languages
- Default to English when no language preference can be detected
- Handle edge cases: malformed headers, invalid language codes, missing data
- Support both server-side (NextRequest) and client-side (document.cookie) contexts

### From Implementation Plan (Plan-111, Task 1.2)

**File:** `/src/lib/i18n/guest-language.ts`

**Functions to implement:**
- `detectGuestLanguage(request, urlParam?)` - Detect language from cookie/header/URL
- `setGuestLanguageCookie(language)` - Persist language preference
- `parseAcceptLanguage(header)` - Parse Accept-Language header
- `mapToSupportedLanguage(code)` - Map browser codes to supported languages

---

## 3. Existing Codebase Analysis

### Existing Infrastructure (from Epic 1 Foundation)

The i18n module at `/src/lib/i18n/` already provides significant infrastructure:

| File | Relevant Exports | Usage |
|------|-----------------|-------|
| `config.ts` | `SupportedLocale`, `locales`, `DEFAULT_LOCALE`, `LOCALE_COOKIE_NAME`, `LOCALE_COOKIE_MAX_AGE`, `isSupportedLocale`, `normalizeLocale` | Type definitions, constants, validation |
| `language-detection.ts` | `detectUserLanguage()`, `setLocaleCookie()` | Server-side detection for authenticated users |
| `index.ts` | Centralized exports | Public API |

### Key Existing Functions to Leverage

1. **`isSupportedLocale(locale: string)`** - Type guard for validating locale codes
2. **`normalizeLocale(locale: string | null | undefined)`** - Maps regional codes to supported languages
3. **`setLocaleCookie(response, locale)`** - Server-side cookie setting via NextResponse

### Existing Accept-Language Parsing

The `language-detection.ts` file contains a private `parseAcceptLanguageHeader()` function that:
- Parses Accept-Language header format
- Extracts quality values
- Returns sorted array of language codes

**Gap:** This function is private and needs to be exported or a guest-specific version created.

### Cookie Configuration

```typescript
// From config.ts
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year
```

**Note:** The codebase uses a single cookie name `FAQBNB_LANG` for all users (not `FAQBNB_GUEST_LANG`). The guest-language module should use the same cookie for consistency.

---

## 4. Implementation Approach

### 4.1 Detection Priority Cascade

```
URL Parameter (?lang=fr) → Cookie (FAQBNB_LANG) → Accept-Language Header → Default ('en')
```

This is the guest-specific cascade that differs from the authenticated user cascade (which includes database preference).

### 4.2 Function Specifications

#### `detectGuestLanguage(request, urlParam?)`

```typescript
/**
 * Detects the guest's preferred language using priority cascade.
 * Unlike detectUserLanguage(), this skips database lookup.
 *
 * @param request - NextRequest object (for server-side)
 * @param urlParam - Optional language from URL query string (highest priority)
 * @returns The detected supported locale
 */
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale;
```

**Implementation:**
1. Check `urlParam` - if valid supported locale, return it
2. Read cookie using `request.cookies.get(LOCALE_COOKIE_NAME)`
3. Parse Accept-Language header
4. Return DEFAULT_LOCALE as fallback

#### `setGuestLanguageCookie(language)`

Two versions needed:

**Server-side (NextResponse):**
```typescript
export function setGuestLanguageCookie(
  response: NextResponse,
  language: SupportedLocale
): void;
```

**Client-side (document.cookie):**
```typescript
export function setGuestLanguageCookieClient(
  language: SupportedLocale
): void;
```

**Cookie attributes:**
- Name: `FAQBNB_LANG`
- Max-Age: 1 year (31,536,000 seconds)
- Path: `/`
- SameSite: `Lax`
- Secure: `true` in production
- HttpOnly: `false` (client-side access needed)

#### `parseAcceptLanguage(header)`

```typescript
/**
 * Parses Accept-Language header and returns language codes sorted by preference.
 * Export of the parsing logic for guest-specific use.
 *
 * @param header - Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 */
export function parseAcceptLanguage(header: string | null): string[];
```

**Behavior:**
- Parse RFC 7231 format: `fr-FR, fr;q=0.9, en;q=0.8`
- Extract primary language code from regional variants
- Sort by quality value (default 1.0)
- Filter out wildcards and invalid entries

#### `mapToSupportedLanguage(code)`

```typescript
/**
 * Maps a browser language code to a supported application language.
 * Handles regional variants and unsupported languages.
 *
 * @param code - Browser language code (e.g., 'en-US', 'pt-BR', 'zh-CN')
 * @returns The mapped supported locale, or DEFAULT_LOCALE if not supported
 */
export function mapToSupportedLanguage(code: string): SupportedLocale;
```

**Implementation:**
- Can delegate to existing `normalizeLocale()` function
- Handles: `en-US` → `en`, `fr-CA` → `fr`, `pt-BR` → `en` (not supported)

### 4.3 Type Definitions

```typescript
/**
 * Options for guest language detection.
 */
export interface DetectGuestLanguageOptions {
  /** URL parameter value (highest priority) */
  urlParam?: string | null;
  /** Skip cookie lookup */
  skipCookie?: boolean;
  /** Skip Accept-Language header */
  skipHeader?: boolean;
}

/**
 * Result of guest language detection with metadata.
 */
export interface GuestLanguageDetectionResult {
  /** The detected language */
  language: SupportedLocale;
  /** Source of the detection */
  source: 'url' | 'cookie' | 'header' | 'default';
}
```

---

## 5. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest language detection and persistence utilities |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/i18n/index.ts` | Add exports for guest-language module |
| `/src/lib/i18n/language-detection.ts` | Export `parseAcceptLanguageHeader` (currently private) |

### Functions to Create

| Function | Signature | Location |
|----------|-----------|----------|
| `detectGuestLanguage` | `(request: NextRequest, urlParam?: string \| null) => SupportedLocale` | `guest-language.ts` |
| `detectGuestLanguageWithMeta` | `(request: NextRequest, options?: DetectGuestLanguageOptions) => GuestLanguageDetectionResult` | `guest-language.ts` |
| `setGuestLanguageCookie` | `(response: NextResponse, language: SupportedLocale) => void` | `guest-language.ts` |
| `setGuestLanguageCookieClient` | `(language: SupportedLocale) => void` | `guest-language.ts` |
| `parseAcceptLanguage` | `(header: string \| null) => string[]` | `guest-language.ts` |
| `mapToSupportedLanguage` | `(code: string) => SupportedLocale` | `guest-language.ts` |
| `getGuestLanguageFromCookie` | `(request: NextRequest) => SupportedLocale \| null` | `guest-language.ts` |
| `getGuestLanguageFromCookieClient` | `() => SupportedLocale \| null` | `guest-language.ts` |

### Functions to Modify

| Function | File | Change |
|----------|------|--------|
| N/A | N/A | No existing functions need modification |

### Exports to Add

In `/src/lib/i18n/index.ts`:
```typescript
export {
  detectGuestLanguage,
  detectGuestLanguageWithMeta,
  setGuestLanguageCookie,
  setGuestLanguageCookieClient,
  parseAcceptLanguage,
  mapToSupportedLanguage,
  getGuestLanguageFromCookie,
  getGuestLanguageFromCookieClient,
  type DetectGuestLanguageOptions,
  type GuestLanguageDetectionResult,
} from './guest-language';
```

---

## 6. Implementation Tasks

### Task 1: Create guest-language.ts module structure
- Create file at `/src/lib/i18n/guest-language.ts`
- Add JSDoc header with @created, @lastModified, reference to REQ-E04-002
- Import required types and constants from `./config`

### Task 2: Implement parseAcceptLanguage function
- Port logic from existing private function in `language-detection.ts`
- Export for use by guest language detection
- Handle edge cases: null input, malformed headers, empty values

### Task 3: Implement mapToSupportedLanguage function
- Wrap existing `normalizeLocale()` function
- Add logging for debugging language mapping
- Handle regional variants and unsupported codes

### Task 4: Implement cookie utility functions
- `getGuestLanguageFromCookie(request)` - Server-side cookie reading
- `getGuestLanguageFromCookieClient()` - Client-side cookie reading
- `setGuestLanguageCookie(response, language)` - Server-side cookie setting
- `setGuestLanguageCookieClient(language)` - Client-side cookie setting

### Task 5: Implement detectGuestLanguage function
- Implement priority cascade: URL → Cookie → Header → Default
- Log detection source for debugging
- Return SupportedLocale (always valid)

### Task 6: Implement detectGuestLanguageWithMeta function
- Extended version returning detection metadata
- Include source information for analytics/debugging

### Task 7: Update index.ts with exports
- Add all new exports from guest-language.ts
- Maintain alphabetical ordering of exports

### Task 8: Add unit test considerations
- Document test cases for each function
- Edge cases: null values, malformed input, unsupported languages

---

## 7. Dependencies

### Internal Dependencies (from Epic 1)

| Dependency | Status | Location |
|------------|--------|----------|
| `SupportedLocale` type | ✅ Available | `/src/lib/i18n/config.ts` |
| `LOCALE_COOKIE_NAME` constant | ✅ Available | `/src/lib/i18n/config.ts` |
| `LOCALE_COOKIE_MAX_AGE` constant | ✅ Available | `/src/lib/i18n/config.ts` |
| `DEFAULT_LOCALE` constant | ✅ Available | `/src/lib/i18n/config.ts` |
| `isSupportedLocale` function | ✅ Available | `/src/lib/i18n/config.ts` |
| `normalizeLocale` function | ✅ Available | `/src/lib/i18n/config.ts` |

### External Dependencies

| Package | Usage | Status |
|---------|-------|--------|
| `next/server` | NextRequest, NextResponse types | ✅ Already installed |

---

## 8. Testing Considerations

### Unit Test Cases

| Function | Test Case | Expected Result |
|----------|-----------|-----------------|
| `parseAcceptLanguage` | `null` input | Empty array `[]` |
| `parseAcceptLanguage` | `'fr-FR, en;q=0.8'` | `['fr', 'en']` |
| `parseAcceptLanguage` | `'*'` (wildcard only) | Empty array `[]` |
| `parseAcceptLanguage` | Malformed header | Graceful handling, partial results |
| `mapToSupportedLanguage` | `'en-US'` | `'en'` |
| `mapToSupportedLanguage` | `'zh-CN'` (unsupported) | `'en'` (default) |
| `mapToSupportedLanguage` | `'fr'` | `'fr'` |
| `detectGuestLanguage` | URL param present | URL param value |
| `detectGuestLanguage` | Cookie present, no URL | Cookie value |
| `detectGuestLanguage` | Header only | Header first match |
| `detectGuestLanguage` | No sources | `'en'` (default) |
| `setGuestLanguageCookieClient` | Valid language | Cookie set with correct attributes |
| `getGuestLanguageFromCookieClient` | Cookie present | Parsed value |
| `getGuestLanguageFromCookieClient` | No cookie | `null` |

### Integration Test Cases

- Full detection cascade in middleware context
- Cookie persistence across page loads
- URL parameter override of cookie

---

## 9. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| Detect language from URL parameters | `detectGuestLanguage` with `urlParam` argument |
| Fallback to cookie values | Priority 2 in cascade |
| Fallback to Accept-Language header parsing | Priority 3 in cascade |
| Parse Accept-Language with quality values | `parseAcceptLanguage` function |
| Map browser codes to supported languages | `mapToSupportedLanguage` function |
| Persist language to cookie with expiration | `setGuestLanguageCookie*` functions |
| Cookie security attributes | Secure, SameSite=Lax, proper path |
| Default to English | `DEFAULT_LOCALE` fallback |
| Handle edge cases gracefully | Input validation throughout |
| Support server and client contexts | Separate server/client functions |

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cookie blocked by browser | Low | Re-detect on each visit; functional but not persistent |
| Malformed Accept-Language header | Low | Graceful parsing with fallback |
| Circular import issues | Low | Import only from config.ts, not index.ts |
| SSR hydration mismatch | Medium | Use consistent cookie reading between server/client |

---

## 11. Code Example

```typescript
// /src/lib/i18n/guest-language.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  SupportedLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
} from './config';

/**
 * Detects guest language with full priority cascade.
 */
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
  // Priority 1: URL parameter
  if (urlParam && isSupportedLocale(urlParam)) {
    console.log('[i18n-guest] Language from URL param:', urlParam);
    return urlParam;
  }

  // Priority 2: Cookie
  const cookieValue = getGuestLanguageFromCookie(request);
  if (cookieValue) {
    console.log('[i18n-guest] Language from cookie:', cookieValue);
    return cookieValue;
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLanguages = parseAcceptLanguage(acceptLanguage);
  for (const lang of headerLanguages) {
    const mapped = mapToSupportedLanguage(lang);
    if (mapped !== DEFAULT_LOCALE || lang === 'en') {
      console.log('[i18n-guest] Language from header:', mapped);
      return mapped;
    }
  }

  // Priority 4: Default
  console.log('[i18n-guest] Using default:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

---

## 12. References

- **Request Document:** `/docs/gen_requests_epic4.md` - REQ-E04-002
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Existing i18n Module:** `/src/lib/i18n/`
- **Epic 1 Language Detection:** `/src/lib/i18n/language-detection.ts`
- **Epic 1 Config:** `/src/lib/i18n/config.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Task 1.2*
