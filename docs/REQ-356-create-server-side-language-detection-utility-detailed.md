# REQ-356: Create Server-Side Language Detection Utility - Detailed Task Breakdown

**Request ID:** REQ-356
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 6 - Middleware & Language Detection
**Task ID:** 6.2
**Created:** 2026-01-19
**Last Modified:** 2026-01-19

**Overview Document:** `/docs/REQ-356-create-server-side-language-detection-utility-overview.md`
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Request Source:** `/docs/gen_requests_epic4.md`

---

## Table of Contents

1. [Summary](#summary)
2. [Pre-Implementation Checklist](#pre-implementation-checklist)
3. [Task Breakdown](#task-breakdown)
4. [Verification Checklist](#verification-checklist)
5. [Rollback Plan](#rollback-plan)

---

## Summary

This task creates a server-side language detection utility specifically for guest (unauthenticated) users viewing public item content. The utility will be used by middleware to detect language preferences from URL parameters, cookies, and Accept-Language headers, enabling consistent language handling across guest-facing routes.

**Key Difference from Existing Code:**
- The existing `detectUserLanguage()` in `/src/lib/i18n/language-detection.ts` is designed for **authenticated users** with database lookup capability
- This new `detectGuestLanguageFromRequest()` is for **guest users** with:
  - URL parameter as highest priority (for shareable links with `?lang=fr`)
  - Guest-specific cookie (`FAQBNB_GUEST_LANG` instead of `FAQBNB_LANG`)
  - No database lookup (guests have no user record)
  - Simpler cascade: URL > Cookie > Accept-Language > default

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] **File `/src/lib/i18n/config.ts` exists** with:
  - `SupportedLocale` type
  - `DEFAULT_LOCALE` constant
  - `isSupportedLocale()` function
  - `normalizeLocale()` function
- [ ] **File `/src/lib/i18n/index.ts` exists** (barrel exports)
- [ ] **File `/src/lib/i18n/guest-language.ts` does NOT exist** (we will create it)

---

## Task Breakdown

### Task 6.2.1: Create Guest Language Constants

**File:** `/src/lib/i18n/guest-language.ts` (CREATE)

**Objective:** Define guest-specific constants for language cookie management.

**Implementation:**

```typescript
/**
 * Guest Language Utility Module - Server-Side Functions
 *
 * Provides server-side language detection for unauthenticated guest users
 * viewing public content via middleware and server components.
 *
 * Priority Order:
 * 1. URL parameter (?lang=fr)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Accept-Language header
 * 4. Default locale ('en')
 *
 * REQ-356: Create Server-Side Language Detection Utility
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 6, Task 6.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  type SupportedLocale,
} from './config';

// =============================================================================
// Constants
// =============================================================================

/**
 * Cookie name for guest language preference.
 * Separate from LOCALE_COOKIE_NAME (FAQBNB_LANG) used for authenticated users.
 */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Cookie max age in seconds (1 year).
 * Matches the authenticated user cookie duration.
 */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

**Verification:**
- [ ] File created at `/src/lib/i18n/guest-language.ts`
- [ ] Constants `GUEST_LANGUAGE_COOKIE_NAME` = `'FAQBNB_GUEST_LANG'`
- [ ] Constants `GUEST_LANGUAGE_COOKIE_MAX_AGE` = `31536000` (1 year in seconds)
- [ ] Imports from `./config` are valid

---

### Task 6.2.2: Implement Accept-Language Header Parser

**File:** `/src/lib/i18n/guest-language.ts` (APPEND)

**Objective:** Create a helper function to parse the Accept-Language header and extract language codes sorted by preference.

**Note:** This function exists internally in `language-detection.ts` but is not exported. We implement it here for module isolation.

**Implementation:**

```typescript
// =============================================================================
// Types
// =============================================================================

/**
 * Internal language preference type for parsing.
 * Represents a single language tag with its quality value.
 */
interface LanguageQuality {
  /** Language code (e.g., 'en', 'fr') */
  locale: string;
  /** Quality value from 0.0 to 1.0 (default 1.0) */
  quality: number;
}

// =============================================================================
// Accept-Language Parser
// =============================================================================

/**
 * Parse Accept-Language header and return language codes sorted by preference.
 *
 * The Accept-Language header follows RFC 7231 format:
 * Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
 *
 * @param header - The Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 *
 * @example
 * parseAcceptLanguageHeader('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguageHeader(null)
 * // Returns: []
 *
 * @example
 * parseAcceptLanguageHeader('de-DE, de;q=0.9, en-GB;q=0.8, en;q=0.7, fr;q=0.5')
 * // Returns: ['de', 'en', 'fr']
 */
function parseAcceptLanguageHeader(header: string | null): string[] {
  if (!header) {
    return [];
  }

  const languages: LanguageQuality[] = header
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');

      // Extract primary language tag (e.g., 'fr' from 'fr-FR')
      const primaryCode = code.split('-')[0]?.toLowerCase();

      // Parse quality value, default to 1.0 if not specified
      const quality = qValue ? parseFloat(qValue) : 1.0;

      return {
        locale: primaryCode || '',
        quality: isNaN(quality) ? 0 : quality,
      };
    })
    // Filter out invalid entries (empty locale or wildcard)
    .filter((lang) => lang.locale && lang.locale !== '*' && lang.quality > 0);

  // Sort by quality descending
  languages.sort((a, b) => b.quality - a.quality);

  // Return unique locales in preference order
  const seen = new Set<string>();
  return languages
    .map((l) => l.locale)
    .filter((locale) => {
      if (seen.has(locale)) return false;
      seen.add(locale);
      return true;
    });
}
```

**Verification:**
- [ ] `parseAcceptLanguageHeader(null)` returns `[]`
- [ ] `parseAcceptLanguageHeader('')` returns `[]`
- [ ] `parseAcceptLanguageHeader('fr')` returns `['fr']`
- [ ] `parseAcceptLanguageHeader('fr-FR')` returns `['fr']`
- [ ] `parseAcceptLanguageHeader('fr-FR, en;q=0.8')` returns `['fr', 'en']`
- [ ] `parseAcceptLanguageHeader('en;q=0.5, fr;q=0.9')` returns `['fr', 'en']`
- [ ] `parseAcceptLanguageHeader('*')` returns `[]`
- [ ] Duplicates are removed (only first occurrence kept)

---

### Task 6.2.3: Implement Main Detection Function

**File:** `/src/lib/i18n/guest-language.ts` (APPEND)

**Objective:** Implement `detectGuestLanguageFromRequest()` that reads language preferences from NextRequest using the priority cascade.

**Implementation:**

```typescript
// =============================================================================
// Server-Side Language Detection
// =============================================================================

/**
 * Detect guest's preferred language from NextRequest for middleware usage.
 *
 * This function is specifically designed for unauthenticated guest users
 * viewing public content (e.g., item pages via QR code scans).
 *
 * Priority Order:
 * 1. URL parameter (urlParam) - highest priority for shareable links
 * 2. Guest language cookie (FAQBNB_GUEST_LANG) - persistence
 * 3. Accept-Language header - browser detection
 * 4. Default locale ('en') - fallback
 *
 * @param request - The incoming Next.js request object
 * @param urlParam - Optional URL lang parameter from searchParams.get('lang')
 * @returns The detected locale code (always a supported locale)
 *
 * @example
 * // In middleware
 * const urlLang = req.nextUrl.searchParams.get('lang');
 * const locale = detectGuestLanguageFromRequest(req, urlLang);
 * res.headers.set('x-locale', locale);
 *
 * @example
 * // Without URL parameter
 * const locale = detectGuestLanguageFromRequest(req);
 *
 * @example
 * // Full middleware usage
 * if (req.nextUrl.pathname.startsWith('/item/')) {
 *   const urlLang = req.nextUrl.searchParams.get('lang');
 *   const detectedLocale = detectGuestLanguageFromRequest(req, urlLang);
 *   res.headers.set('x-locale', detectedLocale);
 *   // Update cookie if language changed from URL param
 *   if (urlLang && urlLang !== req.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value) {
 *     res.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, detectedLocale, {
 *       maxAge: GUEST_LANGUAGE_COOKIE_MAX_AGE,
 *       path: '/',
 *     });
 *   }
 * }
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
  // Priority 1: URL parameter (highest priority for shareable links)
  if (urlParam) {
    const normalizedParam = normalizeLocale(urlParam);
    if (isSupportedLocale(normalizedParam)) {
      console.log('[i18n-guest] Language detected from URL param:', normalizedParam);
      return normalizedParam;
    }
    console.log('[i18n-guest] Invalid URL param, falling through:', urlParam);
  }

  // Priority 2: Guest language cookie
  const cookieLocale = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLocale) {
    const normalizedCookie = normalizeLocale(cookieLocale);
    if (isSupportedLocale(normalizedCookie)) {
      console.log('[i18n-guest] Language detected from cookie:', normalizedCookie);
      return normalizedCookie;
    }
    console.log('[i18n-guest] Invalid cookie value, falling through:', cookieLocale);
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    const normalized = normalizeLocale(locale);
    if (isSupportedLocale(normalized)) {
      console.log('[i18n-guest] Language detected from Accept-Language:', normalized);
      return normalized;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

**Verification:**
- [ ] Function exported as `detectGuestLanguageFromRequest`
- [ ] Returns `SupportedLocale` type (never undefined/null)
- [ ] URL param `'fr'` takes priority over cookie `'de'`
- [ ] URL param `'invalid'` falls through to cookie
- [ ] Cookie `'de'` takes priority over Accept-Language header
- [ ] Invalid cookie falls through to Accept-Language
- [ ] Accept-Language `'es-MX'` normalizes to `'es'`
- [ ] Unsupported language in Accept-Language falls to next option
- [ ] Returns `'en'` when all sources empty/invalid
- [ ] All code paths log detection source

---

### Task 6.2.4: Update i18n Barrel Exports

**File:** `/src/lib/i18n/index.ts` (MODIFY)

**Objective:** Export the new guest language detection function and constants from the module's barrel file.

**Current State:**
```typescript
// Language Detection exports (REQ-246)
export {
  detectUserLanguage,
  setLocaleCookie,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from './language-detection';
```

**Implementation - Add at end of file:**

```typescript
// Guest Language Detection exports (REQ-356)
export {
  detectGuestLanguageFromRequest,
  GUEST_LANGUAGE_COOKIE_NAME,
  GUEST_LANGUAGE_COOKIE_MAX_AGE,
} from './guest-language';
```

**Verification:**
- [ ] New exports added to `/src/lib/i18n/index.ts`
- [ ] `detectGuestLanguageFromRequest` can be imported from `@/lib/i18n`
- [ ] `GUEST_LANGUAGE_COOKIE_NAME` can be imported from `@/lib/i18n`
- [ ] `GUEST_LANGUAGE_COOKIE_MAX_AGE` can be imported from `@/lib/i18n`
- [ ] No TypeScript compilation errors
- [ ] Existing exports remain unchanged

---

### Task 6.2.5: Verify Type Safety and Compilation

**Objective:** Ensure the implementation compiles correctly and maintains type safety.

**Actions:**

1. Run TypeScript compilation check:
   ```bash
   npx tsc --noEmit
   ```

2. Verify imports work correctly:
   ```typescript
   // Test import in any file
   import {
     detectGuestLanguageFromRequest,
     GUEST_LANGUAGE_COOKIE_NAME,
     GUEST_LANGUAGE_COOKIE_MAX_AGE,
   } from '@/lib/i18n';
   ```

3. Verify return type is always `SupportedLocale` (never `undefined | null`)

**Verification:**
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] Imports resolve correctly in VSCode/editor
- [ ] No implicit any types
- [ ] Return type is `SupportedLocale` (not `string`)

---

## Complete File: `/src/lib/i18n/guest-language.ts`

For reference, here is the complete file after all tasks:

```typescript
/**
 * Guest Language Utility Module - Server-Side Functions
 *
 * Provides server-side language detection for unauthenticated guest users
 * viewing public content via middleware and server components.
 *
 * Priority Order:
 * 1. URL parameter (?lang=fr)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Accept-Language header
 * 4. Default locale ('en')
 *
 * REQ-356: Create Server-Side Language Detection Utility
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 6, Task 6.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  type SupportedLocale,
} from './config';

// =============================================================================
// Constants
// =============================================================================

/**
 * Cookie name for guest language preference.
 * Separate from LOCALE_COOKIE_NAME (FAQBNB_LANG) used for authenticated users.
 */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Cookie max age in seconds (1 year).
 * Matches the authenticated user cookie duration.
 */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// =============================================================================
// Types
// =============================================================================

/**
 * Internal language preference type for parsing.
 * Represents a single language tag with its quality value.
 */
interface LanguageQuality {
  /** Language code (e.g., 'en', 'fr') */
  locale: string;
  /** Quality value from 0.0 to 1.0 (default 1.0) */
  quality: number;
}

// =============================================================================
// Accept-Language Parser
// =============================================================================

/**
 * Parse Accept-Language header and return language codes sorted by preference.
 *
 * The Accept-Language header follows RFC 7231 format:
 * Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
 *
 * @param header - The Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 *
 * @example
 * parseAcceptLanguageHeader('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguageHeader(null)
 * // Returns: []
 *
 * @example
 * parseAcceptLanguageHeader('de-DE, de;q=0.9, en-GB;q=0.8, en;q=0.7, fr;q=0.5')
 * // Returns: ['de', 'en', 'fr']
 */
function parseAcceptLanguageHeader(header: string | null): string[] {
  if (!header) {
    return [];
  }

  const languages: LanguageQuality[] = header
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');

      // Extract primary language tag (e.g., 'fr' from 'fr-FR')
      const primaryCode = code.split('-')[0]?.toLowerCase();

      // Parse quality value, default to 1.0 if not specified
      const quality = qValue ? parseFloat(qValue) : 1.0;

      return {
        locale: primaryCode || '',
        quality: isNaN(quality) ? 0 : quality,
      };
    })
    // Filter out invalid entries (empty locale or wildcard)
    .filter((lang) => lang.locale && lang.locale !== '*' && lang.quality > 0);

  // Sort by quality descending
  languages.sort((a, b) => b.quality - a.quality);

  // Return unique locales in preference order
  const seen = new Set<string>();
  return languages
    .map((l) => l.locale)
    .filter((locale) => {
      if (seen.has(locale)) return false;
      seen.add(locale);
      return true;
    });
}

// =============================================================================
// Server-Side Language Detection
// =============================================================================

/**
 * Detect guest's preferred language from NextRequest for middleware usage.
 *
 * This function is specifically designed for unauthenticated guest users
 * viewing public content (e.g., item pages via QR code scans).
 *
 * Priority Order:
 * 1. URL parameter (urlParam) - highest priority for shareable links
 * 2. Guest language cookie (FAQBNB_GUEST_LANG) - persistence
 * 3. Accept-Language header - browser detection
 * 4. Default locale ('en') - fallback
 *
 * @param request - The incoming Next.js request object
 * @param urlParam - Optional URL lang parameter from searchParams.get('lang')
 * @returns The detected locale code (always a supported locale)
 *
 * @example
 * // In middleware
 * const urlLang = req.nextUrl.searchParams.get('lang');
 * const locale = detectGuestLanguageFromRequest(req, urlLang);
 * res.headers.set('x-locale', locale);
 *
 * @example
 * // Without URL parameter
 * const locale = detectGuestLanguageFromRequest(req);
 *
 * @example
 * // Full middleware usage
 * if (req.nextUrl.pathname.startsWith('/item/')) {
 *   const urlLang = req.nextUrl.searchParams.get('lang');
 *   const detectedLocale = detectGuestLanguageFromRequest(req, urlLang);
 *   res.headers.set('x-locale', detectedLocale);
 *   // Update cookie if language changed from URL param
 *   if (urlLang && urlLang !== req.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value) {
 *     res.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, detectedLocale, {
 *       maxAge: GUEST_LANGUAGE_COOKIE_MAX_AGE,
 *       path: '/',
 *     });
 *   }
 * }
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
  // Priority 1: URL parameter (highest priority for shareable links)
  if (urlParam) {
    const normalizedParam = normalizeLocale(urlParam);
    if (isSupportedLocale(normalizedParam)) {
      console.log('[i18n-guest] Language detected from URL param:', normalizedParam);
      return normalizedParam;
    }
    console.log('[i18n-guest] Invalid URL param, falling through:', urlParam);
  }

  // Priority 2: Guest language cookie
  const cookieLocale = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLocale) {
    const normalizedCookie = normalizeLocale(cookieLocale);
    if (isSupportedLocale(normalizedCookie)) {
      console.log('[i18n-guest] Language detected from cookie:', normalizedCookie);
      return normalizedCookie;
    }
    console.log('[i18n-guest] Invalid cookie value, falling through:', cookieLocale);
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    const normalized = normalizeLocale(locale);
    if (isSupportedLocale(normalized)) {
      console.log('[i18n-guest] Language detected from Accept-Language:', normalized);
      return normalized;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

---

## Verification Checklist

### Functional Verification

| Test Scenario | Input | Expected Output | Status |
|---------------|-------|-----------------|--------|
| URL param valid | `urlParam='fr'` | `'fr'` | [ ] |
| URL param with region | `urlParam='fr-CA'` | `'fr'` | [ ] |
| URL param invalid | `urlParam='zh'` | Falls through to cookie | [ ] |
| Cookie valid | Cookie `FAQBNB_GUEST_LANG=de` | `'de'` | [ ] |
| Cookie invalid | Cookie `FAQBNB_GUEST_LANG=xyz` | Falls through to header | [ ] |
| Header valid | `Accept-Language: es-MX` | `'es'` | [ ] |
| Header multiple | `Accept-Language: zh;q=0.9, fr;q=0.8` | `'fr'` (zh unsupported) | [ ] |
| All empty | No URL, cookie, or header | `'en'` | [ ] |
| Priority URL > Cookie | URL `'fr'`, Cookie `'de'` | `'fr'` | [ ] |
| Priority Cookie > Header | Cookie `'de'`, Header `'es'` | `'de'` | [ ] |

### Technical Verification

- [ ] File `/src/lib/i18n/guest-language.ts` exists
- [ ] `GUEST_LANGUAGE_COOKIE_NAME` exported and equals `'FAQBNB_GUEST_LANG'`
- [ ] `GUEST_LANGUAGE_COOKIE_MAX_AGE` exported and equals `31536000`
- [ ] `detectGuestLanguageFromRequest` exported
- [ ] Function returns `SupportedLocale` type
- [ ] All imports from `./config` resolve correctly
- [ ] `/src/lib/i18n/index.ts` updated with new exports
- [ ] `npx tsc --noEmit` passes
- [ ] Build command `npm run build` succeeds

### Acceptance Criteria Mapping

| Acceptance Criteria | Task | Verified |
|---------------------|------|----------|
| Middleware reads language from URL query parameter with highest priority | Task 6.2.3 | [ ] |
| Middleware reads language preference from cookie when query parameter is absent | Task 6.2.3 | [ ] |
| Middleware parses Accept-Language header as fallback when cookie is not present | Task 6.2.2, 6.2.3 | [ ] |
| Middleware uses default language when no other preference indicators exist | Task 6.2.3 | [ ] |
| Detected language is validated against supported language codes list | Task 6.2.3 | [ ] |
| Invalid language codes trigger fallback to default language | Task 6.2.3 | [ ] |
| Page components can access detected language from request headers | Task 6.1 (separate) | [ ] |
| Solution works correctly for both initial page loads and client-side navigation | Task 6.2.3 | [ ] |

---

## Rollback Plan

If issues are discovered after implementation:

1. **Revert file creation:**
   ```bash
   git checkout HEAD~1 -- src/lib/i18n/guest-language.ts
   rm src/lib/i18n/guest-language.ts  # if file didn't exist before
   ```

2. **Revert index.ts changes:**
   ```bash
   git checkout HEAD~1 -- src/lib/i18n/index.ts
   ```

3. **Verify build:**
   ```bash
   npm run build
   ```

**Impact of Rollback:**
- Task 6.1 (middleware integration) will fail to find `detectGuestLanguageFromRequest`
- No impact on authenticated user language detection (separate function)
- No impact on existing functionality

---

## Dependencies

### Required Before This Task

- **Epic 1 Foundation** (completed) - Provides `/src/lib/i18n/config.ts` with types and utilities

### Tasks That Depend on This

- **REQ-356 Task 6.1:** Add Guest Language Detection to Middleware - Will import and call `detectGuestLanguageFromRequest()`
- **Phase 5 Tasks:** Guest page updates will use the detected language

---

## Notes for Implementation

1. **Logging:** Console logs use prefix `[i18n-guest]` to distinguish from authenticated user detection `[i18n]`

2. **Cookie Name:** We use `FAQBNB_GUEST_LANG` (not `FAQBNB_LANG`) to keep guest preferences separate from authenticated user preferences

3. **No Database Lookup:** Unlike `detectUserLanguage()`, this function never queries the database - guests have no user record

4. **URL Parameter Priority:** URL params have highest priority to enable shareable translated links (e.g., `?lang=fr`)

5. **Type Safety:** The return type is always `SupportedLocale`, never `string` or `undefined`

---

*Document generated for REQ-356: Create Server-Side Language Detection Utility*
*Plan-111: L10N Epic 4 - Guest Experience, Phase 6, Task 6.2*
