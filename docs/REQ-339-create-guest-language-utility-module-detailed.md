# REQ-339: Create Guest Language Utility Module - Detailed Task Breakdown

**Request ID:** REQ-339
**Type:** NEW FEATURE
**Size:** M
**Phase:** 1 - Types and Utilities
**Task ID:** 1.2
**Created:** 2026-01-19
**Last Modified:** 2026-01-19

**Overview Document:** `/docs/REQ-339-create-guest-language-utility-module-overview.md`
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Request Source:** `/docs/gen_requests_epic4.md`

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for creating the guest language utility module at `/src/lib/i18n/guest-language.ts`. This module provides language detection and preference persistence specifically for unauthenticated guest users viewing public content (e.g., `/item/[publicId]` routes).

**Key Distinction from Existing Infrastructure:**
- Existing `language-detection.ts` focuses on authenticated users with middleware interception
- This new module focuses on **guest-facing pages** with:
  - Different cookie name (`FAQBNB_GUEST_LANG` vs `FAQBNB_LANG`)
  - URL parameter priority for shareable links (`?lang=fr`)
  - Client-side cookie functions using `document.cookie`
  - Exported `parseAcceptLanguage()` for reuse

---

## Prerequisites

### Required Dependencies (Must Be Complete)

| Dependency | Location | Status |
|------------|----------|--------|
| i18n config module | `/src/lib/i18n/config.ts` | Complete |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Complete |
| `isSupportedLocale()` function | `/src/lib/i18n/config.ts` | Complete |
| `normalizeLocale()` function | `/src/lib/i18n/config.ts` | Complete |
| `DEFAULT_LOCALE` constant | `/src/lib/i18n/config.ts` | Complete |

### Recommended Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| REQ-338 Localization Types File | `/src/types/l10n.ts` | In Progress |

**Note:** If REQ-338 is not complete, the existing `SupportedLocale` from `config.ts` can be used.

---

## Task Breakdown

### Task 1: Create File with Header Documentation
**Estimated Effort:** 5 minutes
**Complexity:** Low

#### 1.1 Create the new file

**Action:** Create `/src/lib/i18n/guest-language.ts`

**File Header Template:**
```typescript
/**
 * Guest Language Utility Module
 *
 * Provides language detection and preference persistence for
 * unauthenticated guest users viewing public content.
 *
 * This module differs from language-detection.ts by:
 * - Using a separate cookie name (FAQBNB_GUEST_LANG) for guest preferences
 * - Supporting URL parameter priority for shareable links
 * - Providing client-side cookie utilities via document.cookie
 * - Exporting parseAcceptLanguage() for external use
 *
 * REQ-339: Create Guest Language Utility Module
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 1, Task 1.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */
```

#### 1.2 Add imports

**Action:** Add required imports from config module

```typescript
import { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  type SupportedLocale,
} from './config';
```

**Verification:**
- [ ] File created at correct path
- [ ] Header documentation includes REQ-339 reference
- [ ] Imports compile without errors

---

### Task 2: Define and Export Constants
**Estimated Effort:** 5 minutes
**Complexity:** Low

#### 2.1 Define GUEST_LANGUAGE_COOKIE_NAME constant

**Action:** Add constant for guest language cookie name

```typescript
// =============================================================================
// Constants
// =============================================================================

/**
 * Cookie name for guest language preference.
 * Distinct from LOCALE_COOKIE_NAME (FAQBNB_LANG) used for authenticated users.
 * This separation allows guests to have independent language preferences
 * that don't conflict with authenticated user settings.
 */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
```

#### 2.2 Define GUEST_LANGUAGE_COOKIE_MAX_AGE constant

**Action:** Add constant for cookie expiration (1 year)

```typescript
/**
 * Cookie max age in seconds (1 year).
 * Provides long-term persistence so returning guests see their preferred language.
 * Matches the expiration used for authenticated user language cookies.
 */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 31,536,000 seconds
```

**Verification:**
- [ ] Constants exported correctly
- [ ] Cookie name differs from `LOCALE_COOKIE_NAME` in config.ts
- [ ] Max age equals 31,536,000 seconds (1 year)

---

### Task 3: Implement parseAcceptLanguage Function
**Estimated Effort:** 20 minutes
**Complexity:** Medium

#### 3.1 Add function signature and JSDoc

**Action:** Create the function with comprehensive documentation

```typescript
// =============================================================================
// Accept-Language Parser
// =============================================================================

/**
 * Parse Accept-Language header and return language codes sorted by preference.
 *
 * The Accept-Language header follows RFC 7231 format:
 * `Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5`
 *
 * This function extracts base language codes (not regional variants),
 * sorts them by quality value, and returns unique codes in preference order.
 *
 * @param header - The Accept-Language header value (may be null or empty)
 * @returns Array of base language codes sorted by quality weight (highest first)
 *
 * @example
 * // Standard header with quality values
 * parseAcceptLanguage('fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7')
 * // Returns: ['fr', 'en', 'de']
 *
 * @example
 * // Header without quality values (all default to 1.0)
 * parseAcceptLanguage('en, fr, de')
 * // Returns: ['en', 'fr', 'de']
 *
 * @example
 * // Null or empty header
 * parseAcceptLanguage(null)
 * // Returns: []
 *
 * @example
 * // Header with wildcard (filtered out)
 * parseAcceptLanguage('en, *;q=0.5')
 * // Returns: ['en']
 */
export function parseAcceptLanguage(header: string | null): string[] {
```

#### 3.2 Implement null/empty handling

**Action:** Add early return for null or empty input

```typescript
  // Handle null, undefined, or empty string
  if (!header || header.trim() === '') {
    return [];
  }
```

#### 3.3 Implement parsing logic

**Action:** Parse the header and extract language codes with quality values

```typescript
  // Interface for internal processing
  interface LanguageQuality {
    code: string;
    quality: number;
  }

  const languages: LanguageQuality[] = [];

  // Split by comma and process each entry
  const entries = header.split(',');

  for (const entry of entries) {
    try {
      const trimmed = entry.trim();
      if (!trimmed) continue;

      // Split on ;q= to separate language code from quality value
      const [codePart, qPart] = trimmed.split(';q=');

      // Extract base language code (e.g., 'fr' from 'fr-FR')
      const baseCode = codePart.split('-')[0]?.toLowerCase().trim();

      // Skip invalid entries: empty, whitespace-only, or wildcard
      if (!baseCode || baseCode === '*') continue;

      // Parse quality value, default to 1.0 if not specified
      let quality = 1.0;
      if (qPart !== undefined) {
        const parsed = parseFloat(qPart);
        quality = isNaN(parsed) ? 0 : Math.max(0, Math.min(1, parsed));
      }

      // Skip zero-quality entries
      if (quality <= 0) continue;

      languages.push({ code: baseCode, quality });
    } catch {
      // Skip malformed entries silently
      continue;
    }
  }
```

#### 3.4 Implement sorting and deduplication

**Action:** Sort by quality and remove duplicates

```typescript
  // Sort by quality value (highest first)
  languages.sort((a, b) => b.quality - a.quality);

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const result: string[] = [];

  for (const lang of languages) {
    if (!seen.has(lang.code)) {
      seen.add(lang.code);
      result.push(lang.code);
    }
  }

  return result;
}
```

**Verification:**
- [ ] Returns empty array for null/empty input
- [ ] Extracts base language codes correctly (fr-FR -> fr)
- [ ] Parses quality values correctly
- [ ] Sorts by quality descending
- [ ] Removes duplicates while preserving order
- [ ] Filters out wildcard (*) entries
- [ ] Handles malformed entries without throwing

**Test Cases to Consider:**
1. `parseAcceptLanguage(null)` -> `[]`
2. `parseAcceptLanguage('')` -> `[]`
3. `parseAcceptLanguage('en')` -> `['en']`
4. `parseAcceptLanguage('fr-FR, fr;q=0.9, en;q=0.8')` -> `['fr', 'en']`
5. `parseAcceptLanguage('en, *;q=0.5')` -> `['en']`
6. `parseAcceptLanguage('de;q=0.5, fr;q=0.9, en')` -> `['en', 'fr', 'de']`
7. `parseAcceptLanguage('EN-US')` -> `['en']` (case insensitive)

---

### Task 4: Implement mapToSupportedLanguage Function
**Estimated Effort:** 15 minutes
**Complexity:** Low

#### 4.1 Add function signature and JSDoc

**Action:** Create the mapping function

```typescript
// =============================================================================
// Language Code Mapping
// =============================================================================

/**
 * Map a browser language code to a supported locale.
 *
 * This function handles:
 * 1. Exact matches (e.g., 'en' -> 'en')
 * 2. Regional variants (e.g., 'en-US' -> 'en', 'fr-CA' -> 'fr')
 * 3. Case normalization (e.g., 'EN' -> 'en')
 * 4. Unknown codes (returns default locale)
 *
 * @param code - The language code to map (any string)
 * @returns A valid SupportedLocale (never returns invalid values)
 *
 * @example
 * // Exact match
 * mapToSupportedLanguage('fr')
 * // Returns: 'fr'
 *
 * @example
 * // Regional variant
 * mapToSupportedLanguage('en-US')
 * // Returns: 'en'
 *
 * @example
 * // Unsupported language falls back to default
 * mapToSupportedLanguage('zh')
 * // Returns: 'en' (DEFAULT_LOCALE)
 *
 * @example
 * // Case insensitive
 * mapToSupportedLanguage('FR')
 * // Returns: 'fr'
 */
export function mapToSupportedLanguage(code: string): SupportedLocale {
```

#### 4.2 Implement mapping logic

**Action:** Implement the mapping with normalizeLocale()

```typescript
  // Handle null, undefined, or empty string
  if (!code || typeof code !== 'string') {
    return DEFAULT_LOCALE;
  }

  // Trim and convert to lowercase for case-insensitive matching
  const normalized = code.trim().toLowerCase();

  // Empty after trimming
  if (!normalized) {
    return DEFAULT_LOCALE;
  }

  // Use normalizeLocale which handles:
  // 1. Direct matching for supported locales
  // 2. Regional variant extraction (en-US -> en)
  // 3. Fallback to default locale
  return normalizeLocale(normalized);
}
```

**Verification:**
- [ ] Returns exact match for supported locales
- [ ] Maps regional variants to base codes
- [ ] Returns `DEFAULT_LOCALE` for unsupported codes
- [ ] Handles null/undefined/empty gracefully
- [ ] Case insensitive

**Test Cases to Consider:**
1. `mapToSupportedLanguage('en')` -> `'en'`
2. `mapToSupportedLanguage('fr')` -> `'fr'`
3. `mapToSupportedLanguage('en-US')` -> `'en'`
4. `mapToSupportedLanguage('fr-CA')` -> `'fr'`
5. `mapToSupportedLanguage('zh')` -> `'en'` (unsupported)
6. `mapToSupportedLanguage('')` -> `'en'`
7. `mapToSupportedLanguage('EN')` -> `'en'` (case)

---

### Task 5: Implement detectGuestLanguage Function
**Estimated Effort:** 25 minutes
**Complexity:** Medium

#### 5.1 Add function signature and JSDoc

**Action:** Create the main detection function

```typescript
// =============================================================================
// Language Detection
// =============================================================================

/**
 * Detect guest's preferred language from request context.
 *
 * Priority Order (highest to lowest):
 * 1. URL parameter (urlParam) - Enables shareable links like ?lang=fr
 * 2. Guest language cookie (FAQBNB_GUEST_LANG) - Persisted preference
 * 3. Accept-Language header - Browser preference
 * 4. Default locale ('en') - Fallback
 *
 * This function is designed for server-side use in:
 * - Server components (page.tsx)
 * - API routes
 * - Middleware
 *
 * @param request - The Next.js request object containing cookies and headers
 * @param urlParam - Optional language parameter from URL searchParams (e.g., 'fr')
 * @returns The detected locale code (always a valid SupportedLocale)
 *
 * @example
 * // In a server component
 * const lang = detectGuestLanguage(request, searchParams.lang);
 *
 * @example
 * // URL parameter takes priority
 * // URL: /item/abc123?lang=fr
 * // Cookie: FAQBNB_GUEST_LANG=de
 * // Accept-Language: en
 * detectGuestLanguage(request, 'fr')
 * // Returns: 'fr'
 *
 * @example
 * // Cookie used when no URL parameter
 * // Cookie: FAQBNB_GUEST_LANG=de
 * // Accept-Language: en
 * detectGuestLanguage(request, null)
 * // Returns: 'de'
 */
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
```

#### 5.2 Implement Priority 1: URL Parameter

**Action:** Check URL parameter first (enables shareable links)

```typescript
  // Priority 1: URL parameter (highest priority for shareable links)
  if (urlParam && typeof urlParam === 'string') {
    const trimmedParam = urlParam.trim().toLowerCase();
    if (trimmedParam && isSupportedLocale(trimmedParam)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[guest-language] Detected from URL param:', trimmedParam);
      }
      return trimmedParam;
    }
    // URL param provided but invalid - log and continue to next source
    if (process.env.NODE_ENV === 'development') {
      console.log('[guest-language] Invalid URL param, checking cookie:', urlParam);
    }
  }
```

#### 5.3 Implement Priority 2: Cookie

**Action:** Check guest language cookie

```typescript
  // Priority 2: Guest language cookie
  const cookieValue = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;
  if (cookieValue && typeof cookieValue === 'string') {
    const trimmedCookie = cookieValue.trim().toLowerCase();
    if (trimmedCookie && isSupportedLocale(trimmedCookie)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[guest-language] Detected from cookie:', trimmedCookie);
      }
      return trimmedCookie;
    }
    // Cookie exists but invalid - log and continue
    if (process.env.NODE_ENV === 'development') {
      console.log('[guest-language] Invalid cookie value, checking headers:', cookieValue);
    }
  }
```

#### 5.4 Implement Priority 3: Accept-Language Header

**Action:** Parse and check Accept-Language header

```typescript
  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguage(acceptLanguage);

  for (const locale of headerLocales) {
    if (isSupportedLocale(locale)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[guest-language] Detected from Accept-Language:', locale);
      }
      return locale;
    }
  }
```

#### 5.5 Implement Priority 4: Default Fallback

**Action:** Return default locale when all sources fail

```typescript
  // Priority 4: Default locale
  if (process.env.NODE_ENV === 'development') {
    console.log('[guest-language] Using default locale:', DEFAULT_LOCALE);
  }
  return DEFAULT_LOCALE;
}
```

**Verification:**
- [ ] URL parameter has highest priority
- [ ] Cookie checked when no valid URL param
- [ ] Accept-Language parsed when no valid cookie
- [ ] Returns DEFAULT_LOCALE as final fallback
- [ ] All sources validate against isSupportedLocale()
- [ ] Debug logging in development only

**Test Cases to Consider:**
1. URL param 'fr' -> 'fr' (regardless of cookie/header)
2. URL param invalid, cookie 'de' -> 'de'
3. No URL, no cookie, Accept-Language 'fr-FR' -> 'fr'
4. All sources invalid/missing -> 'en' (default)
5. URL param 'zh' (unsupported) falls through to cookie

---

### Task 6: Implement setGuestLanguageCookie Function (Client-Side)
**Estimated Effort:** 20 minutes
**Complexity:** Medium

#### 6.1 Add function signature and JSDoc

**Action:** Create the client-side cookie setter

```typescript
// =============================================================================
// Cookie Persistence (Client-Side)
// =============================================================================

/**
 * Set the guest language preference cookie (client-side).
 *
 * This function is designed for use in client components and hooks
 * where `document.cookie` is available. It sets the cookie with:
 * - 1-year expiration for long-term persistence
 * - Path "/" for site-wide availability
 * - SameSite=Lax for navigation scenarios
 * - Secure flag in production
 *
 * Note: This function is for client-side use only. For server-side
 * cookie setting (in middleware or API routes), use NextResponse.cookies.set().
 *
 * @param language - The language code to persist (must be a valid SupportedLocale)
 * @throws {Error} If called in a server context where document is undefined
 *
 * @example
 * // In a client component or hook
 * 'use client';
 * import { setGuestLanguageCookie } from '@/lib/i18n/guest-language';
 *
 * function handleLanguageChange(lang: SupportedLocale) {
 *   setGuestLanguageCookie(lang);
 *   // Then trigger content refresh...
 * }
 */
export function setGuestLanguageCookie(language: SupportedLocale): void {
```

#### 6.2 Implement validation

**Action:** Validate the language parameter

```typescript
  // Validate input
  if (!language || !isSupportedLocale(language)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[guest-language] Invalid language for cookie:', language);
    }
    return;
  }
```

#### 6.3 Implement cookie setting

**Action:** Build and set the cookie string

```typescript
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[guest-language] setGuestLanguageCookie called in server context');
    }
    return;
  }

  // Build cookie string with all attributes
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieParts: string[] = [
    `${GUEST_LANGUAGE_COOKIE_NAME}=${language}`,
    `max-age=${GUEST_LANGUAGE_COOKIE_MAX_AGE}`,
    'path=/',
    'samesite=lax',
  ];

  // Add Secure flag in production (HTTPS only)
  if (isProduction) {
    cookieParts.push('secure');
  }

  // Set the cookie
  document.cookie = cookieParts.join('; ');

  if (process.env.NODE_ENV === 'development') {
    console.log('[guest-language] Cookie set:', language);
  }
}
```

**Verification:**
- [ ] Validates language parameter
- [ ] Checks for browser environment
- [ ] Sets correct cookie name
- [ ] Sets 1-year max-age
- [ ] Sets path to /
- [ ] Sets SameSite=Lax
- [ ] Adds Secure flag in production only
- [ ] Does not set HttpOnly (allows client-side reading)

---

### Task 7: Implement getGuestLanguageCookie Function (Client-Side)
**Estimated Effort:** 15 minutes
**Complexity:** Low

#### 7.1 Add function signature and JSDoc

**Action:** Create the client-side cookie getter

```typescript
/**
 * Get the guest language preference from cookie (client-side).
 *
 * This function reads the guest language cookie from `document.cookie`
 * and returns the value if it's a valid supported locale.
 *
 * Note: This function is for client-side use only. For server-side
 * cookie reading, use `request.cookies.get()` in your server component
 * or API route.
 *
 * @returns The stored language preference, or null if not set or invalid
 *
 * @example
 * // In a client component or hook
 * 'use client';
 * import { getGuestLanguageCookie } from '@/lib/i18n/guest-language';
 *
 * function useInitialLanguage() {
 *   const [language, setLanguage] = useState<SupportedLocale>(() => {
 *     const stored = getGuestLanguageCookie();
 *     return stored ?? 'en';
 *   });
 *   // ...
 * }
 */
export function getGuestLanguageCookie(): SupportedLocale | null {
```

#### 7.2 Implement cookie reading

**Action:** Parse document.cookie and extract the value

```typescript
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    // Parse cookies from document.cookie string
    // Format: "name1=value1; name2=value2; name3=value3"
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === GUEST_LANGUAGE_COOKIE_NAME && value) {
        const trimmedValue = value.trim().toLowerCase();
        if (isSupportedLocale(trimmedValue)) {
          return trimmedValue;
        }
      }
    }
  } catch {
    // Cookie access may fail in some contexts (e.g., sandboxed iframes)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[guest-language] Failed to read cookie');
    }
  }

  return null;
}
```

**Verification:**
- [ ] Returns null in server context
- [ ] Parses document.cookie correctly
- [ ] Validates value against isSupportedLocale()
- [ ] Returns null for invalid/missing values
- [ ] Handles cookie access errors gracefully

---

### Task 8: Update Index Exports
**Estimated Effort:** 5 minutes
**Complexity:** Low

#### 8.1 Update /src/lib/i18n/index.ts

**Action:** Add exports for the new guest-language module

**Add to existing file:**
```typescript
// Guest Language exports (REQ-339)
export {
  // Constants
  GUEST_LANGUAGE_COOKIE_NAME,
  GUEST_LANGUAGE_COOKIE_MAX_AGE,
  // Functions
  detectGuestLanguage,
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  parseAcceptLanguage,
  mapToSupportedLanguage,
} from './guest-language';
```

**Verification:**
- [ ] All 5 functions exported
- [ ] Both constants exported
- [ ] No export conflicts with existing exports
- [ ] TypeScript compilation succeeds

---

### Task 9: Final Verification and Testing
**Estimated Effort:** 15 minutes
**Complexity:** Low

#### 9.1 Verify TypeScript compilation

**Action:** Run TypeScript compiler check

```bash
npx tsc --noEmit
```

**Expected:** No errors related to guest-language.ts

#### 9.2 Verify imports work correctly

**Action:** Create a test import in a scratch file or verify in an existing file

```typescript
import {
  GUEST_LANGUAGE_COOKIE_NAME,
  GUEST_LANGUAGE_COOKIE_MAX_AGE,
  detectGuestLanguage,
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  parseAcceptLanguage,
  mapToSupportedLanguage,
} from '@/lib/i18n';
```

#### 9.3 Run existing tests

**Action:** Ensure no regressions

```bash
npm run test
```

---

## Complete File Structure

After completion, the file should have this structure:

```typescript
// /src/lib/i18n/guest-language.ts

/**
 * Guest Language Utility Module
 * [Header documentation]
 */

import { NextRequest } from 'next/server';
import { ... } from './config';

// =============================================================================
// Constants
// =============================================================================
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// =============================================================================
// Accept-Language Parser
// =============================================================================
export function parseAcceptLanguage(header: string | null): string[] { ... }

// =============================================================================
// Language Code Mapping
// =============================================================================
export function mapToSupportedLanguage(code: string): SupportedLocale { ... }

// =============================================================================
// Language Detection
// =============================================================================
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale { ... }

// =============================================================================
// Cookie Persistence (Client-Side)
// =============================================================================
export function setGuestLanguageCookie(language: SupportedLocale): void { ... }
export function getGuestLanguageCookie(): SupportedLocale | null { ... }
```

---

## Acceptance Criteria Checklist

| # | Criteria | Task(s) | Status |
|---|----------|---------|--------|
| 1 | Module exists at `/src/lib/i18n/guest-language.ts` | Task 1 | [ ] |
| 2 | `detectGuestLanguage` accepts request and optional URL param | Task 5 | [ ] |
| 3 | Detection examines URL parameter first | Task 5.2 | [ ] |
| 4 | Detection reads cookie when no URL param | Task 5.3 | [ ] |
| 5 | Detection parses Accept-Language header | Task 5.4 | [ ] |
| 6 | Detection returns default when all fail | Task 5.5 | [ ] |
| 7 | `setGuestLanguageCookie` accepts language code | Task 6 | [ ] |
| 8 | Cookie set with 1-year expiration | Task 6.3 | [ ] |
| 9 | Cookie includes Secure and SameSite attributes | Task 6.3 | [ ] |
| 10 | Cookie path is "/" | Task 6.3 | [ ] |
| 11 | `parseAcceptLanguage` accepts header string | Task 3 | [ ] |
| 12 | Parsing extracts codes with quality weights | Task 3.3 | [ ] |
| 13 | Parsing returns sorted by quality | Task 3.4 | [ ] |
| 14 | Parsing handles malformed headers | Task 3.3 | [ ] |
| 15 | `mapToSupportedLanguage` accepts any code | Task 4 | [ ] |
| 16 | Mapping returns exact match | Task 4.2 | [ ] |
| 17 | Mapping handles regional variants | Task 4.2 | [ ] |
| 18 | Mapping returns default when no match | Task 4.2 | [ ] |
| 19 | All functions have TypeScript types | Tasks 3-7 | [ ] |
| 20 | All functions have JSDoc comments | Tasks 3-7 | [ ] |
| 21 | Module exports cookie name constant | Task 2 | [ ] |
| 22 | Functions handle null/empty/undefined | Tasks 3-7 | [ ] |
| 23 | Exports added to index.ts | Task 8 | [ ] |

---

## Implementation Order Summary

| Order | Task | Description | Depends On |
|-------|------|-------------|------------|
| 1 | Task 1 | Create file with header and imports | - |
| 2 | Task 2 | Define and export constants | Task 1 |
| 3 | Task 3 | Implement `parseAcceptLanguage()` | Task 1 |
| 4 | Task 4 | Implement `mapToSupportedLanguage()` | Task 1 |
| 5 | Task 5 | Implement `detectGuestLanguage()` | Tasks 2, 3 |
| 6 | Task 6 | Implement `setGuestLanguageCookie()` | Task 2 |
| 7 | Task 7 | Implement `getGuestLanguageCookie()` | Task 2 |
| 8 | Task 8 | Update index.ts exports | Tasks 2-7 |
| 9 | Task 9 | Final verification | Task 8 |

---

## Testing Guidance

### Unit Test File Location
`/src/lib/i18n/__tests__/guest-language.test.ts` (if test file needed)

### Key Test Scenarios

**parseAcceptLanguage:**
- Null/empty input returns `[]`
- Single language without quality
- Multiple languages with qualities sorted
- Malformed entries skipped
- Wildcard filtered out
- Regional variants extracted to base code
- Duplicate codes deduplicated

**mapToSupportedLanguage:**
- Exact match supported codes
- Regional variants mapped (en-US -> en)
- Unsupported codes return default
- Case insensitivity (FR -> fr)
- Empty/null returns default

**detectGuestLanguage:**
- URL param takes priority over all
- Cookie used when no URL param
- Header used when no URL/cookie
- Default returned when all fail
- Invalid values in each source handled

**setGuestLanguageCookie:**
- Cookie set with correct name
- Cookie set with correct attributes
- Invalid locale handled gracefully
- Server context handled (no throw)

**getGuestLanguageCookie:**
- Returns valid stored value
- Returns null for missing cookie
- Returns null for invalid value
- Server context returns null

---

## Downstream Dependencies

This module will be consumed by:

1. **Guest Item Page** (`/src/app/item/[publicId]/page.tsx`) - REQ-319
2. **useGuestLanguage Hook** (`/src/hooks/useGuestLanguage.ts`) - REQ-317
3. **Middleware** (`/src/middleware.ts`) - REQ-323
4. **GuestLanguageSwitcher Component** - REQ-311

---

## References

- Overview Document: `/docs/REQ-339-create-guest-language-utility-module-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md`
- Existing i18n Config: `/src/lib/i18n/config.ts`
- Existing Language Detection: `/src/lib/i18n/language-detection.ts`
