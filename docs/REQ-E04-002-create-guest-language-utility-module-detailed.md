# REQ-E04-002: Create Guest Language Utility Module - Detailed Task Breakdown

**Document Created:** 2026-01-19 22:00 UTC
**Last Modified:** 2026-01-19 22:00 UTC
**Request ID:** REQ-E04-002
**Epic:** Epic 4 - Guest Experience
**Phase:** 1 - Types and Utilities
**Task ID:** 1.2
**Size:** M (Medium)
**Overview Document:** REQ-E04-002-create-guest-language-utility-module-overview.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating the guest language utility module. The module provides specialized language detection and persistence functions for unauthenticated guest users who scan QR codes. Unlike authenticated user language detection (which includes database preference lookup), guest detection uses a simpler cascade: URL parameter > Cookie > Accept-Language header > Default.

**Key Deliverables:**
- `/src/lib/i18n/guest-language.ts` - New module with 8 exported functions
- Updated `/src/lib/i18n/index.ts` - Export guest-language functions
- No modifications to existing functions (the existing `parseAcceptLanguageHeader` is private and we'll create a public version)

---

## Pre-Implementation Checklist

Before starting implementation, verify these dependencies are in place:

| Dependency | File | Status Check |
|------------|------|--------------|
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | `grep "export type SupportedLocale"` |
| `LOCALE_COOKIE_NAME` constant | `/src/lib/i18n/config.ts` | `grep "LOCALE_COOKIE_NAME"` |
| `LOCALE_COOKIE_MAX_AGE` constant | `/src/lib/i18n/config.ts` | `grep "LOCALE_COOKIE_MAX_AGE"` |
| `DEFAULT_LOCALE` constant | `/src/lib/i18n/config.ts` | `grep "DEFAULT_LOCALE"` |
| `isSupportedLocale` function | `/src/lib/i18n/config.ts` | `grep "isSupportedLocale"` |
| `normalizeLocale` function | `/src/lib/i18n/config.ts` | `grep "normalizeLocale"` |
| `next/server` package | `package.json` | Already installed (Next.js core) |

---

## Detailed Implementation Tasks

### Task 1: Create guest-language.ts File with Module Structure
**Estimated Effort:** 1 story point
**File:** `/src/lib/i18n/guest-language.ts` (NEW)

#### 1.1 Create the file with header documentation

Create the new file at `/src/lib/i18n/guest-language.ts` with:

```typescript
/**
 * Guest Language Detection and Persistence Utilities
 *
 * Provides specialized language detection for unauthenticated guests.
 * Unlike authenticated user detection (which includes database preference),
 * guest detection uses: URL parameter > Cookie > Accept-Language > Default.
 *
 * REQ-E04-002: Create Guest Language Detection and Persistence Utilities
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 1, Task 1.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SupportedLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
} from './config';
```

#### 1.2 Add type definitions section

Add the following type definitions after the imports:

```typescript
// =============================================================================
// Types
// =============================================================================

/**
 * Options for guest language detection.
 */
export interface DetectGuestLanguageOptions {
  /** URL parameter value (highest priority) */
  urlParam?: string | null;
  /** Skip cookie lookup */
  skipCookie?: boolean;
  /** Skip Accept-Language header parsing */
  skipHeader?: boolean;
}

/**
 * Result of guest language detection with metadata.
 * Use detectGuestLanguageWithMeta() to get this extended result.
 */
export interface GuestLanguageDetectionResult {
  /** The detected language */
  language: SupportedLocale;
  /** Source of the detection */
  source: 'url' | 'cookie' | 'header' | 'default';
}
```

**Verification:**
- File exists at `/src/lib/i18n/guest-language.ts`
- Imports compile without errors
- Types are exported

---

### Task 2: Implement parseAcceptLanguage Function
**Estimated Effort:** 1 story point
**File:** `/src/lib/i18n/guest-language.ts`

#### 2.1 Create the parseAcceptLanguage function

Add the following function after the type definitions:

```typescript
// =============================================================================
// Accept-Language Header Parsing
// =============================================================================

/**
 * Represents a parsed language preference with quality value.
 * Used internally for Accept-Language header parsing.
 */
interface LanguageQuality {
  /** Language code (e.g., 'en', 'fr') */
  locale: string;
  /** Quality value from 0.0 to 1.0 (default 1.0) */
  quality: number;
}

/**
 * Parses the Accept-Language header and returns language codes sorted by preference.
 *
 * The Accept-Language header follows RFC 7231 format:
 * Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
 *
 * @param header - The Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 *
 * @example
 * parseAcceptLanguage('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguage(null)
 * // Returns: []
 *
 * @example
 * parseAcceptLanguage('*')
 * // Returns: [] (wildcards filtered out)
 */
export function parseAcceptLanguage(header: string | null): string[] {
  if (!header) {
    return [];
  }

  const languages: LanguageQuality[] = header
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');

      // Extract primary language tag (e.g., 'fr' from 'fr-FR')
      const primaryCode = code?.split('-')[0]?.toLowerCase() || '';

      // Parse quality value, default to 1.0 if not specified
      const quality = qValue ? parseFloat(qValue) : 1.0;

      return {
        locale: primaryCode,
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

**Verification Test Cases:**
| Input | Expected Output |
|-------|-----------------|
| `null` | `[]` |
| `''` | `[]` |
| `'en'` | `['en']` |
| `'fr-FR, en;q=0.8'` | `['fr', 'en']` |
| `'en-US;q=0.9, fr;q=0.8, de'` | `['de', 'en', 'fr']` |
| `'*'` | `[]` |
| `'en, *;q=0.5'` | `['en']` |
| `'invalid;;q=abc'` | `[]` (graceful handling) |

---

### Task 3: Implement mapToSupportedLanguage Function
**Estimated Effort:** 0.5 story points
**File:** `/src/lib/i18n/guest-language.ts`

#### 3.1 Create the mapToSupportedLanguage function

Add after the parseAcceptLanguage function:

```typescript
// =============================================================================
// Language Mapping
// =============================================================================

/**
 * Maps a browser language code to a supported application language.
 * Handles regional variants and unsupported languages.
 *
 * @param code - Browser language code (e.g., 'en-US', 'pt-BR', 'zh-CN')
 * @returns The mapped supported locale, or DEFAULT_LOCALE if not supported
 *
 * @example
 * mapToSupportedLanguage('en-US')    // Returns: 'en'
 * mapToSupportedLanguage('fr-CA')    // Returns: 'fr'
 * mapToSupportedLanguage('pt-BR')    // Returns: 'en' (Portuguese not supported)
 * mapToSupportedLanguage('zh-CN')    // Returns: 'en' (Chinese not supported)
 * mapToSupportedLanguage('es')       // Returns: 'es'
 */
export function mapToSupportedLanguage(code: string): SupportedLocale {
  return normalizeLocale(code);
}
```

**Note:** This function is a thin wrapper around `normalizeLocale` from config.ts. It exists to:
1. Provide semantic clarity for guest-specific use cases
2. Allow future guest-specific mapping logic if needed
3. Match the API specified in the implementation plan

**Verification Test Cases:**
| Input | Expected Output |
|-------|-----------------|
| `'en'` | `'en'` |
| `'en-US'` | `'en'` |
| `'en-GB'` | `'en'` |
| `'fr'` | `'fr'` |
| `'fr-CA'` | `'fr'` |
| `'es-MX'` | `'es'` |
| `'de-AT'` | `'de'` |
| `'pt-BR'` | `'en'` (not supported, returns default) |
| `'zh-CN'` | `'en'` (not supported, returns default) |
| `''` | `'en'` |
| `null` (via normalizeLocale) | `'en'` |

---

### Task 4: Implement Cookie Utility Functions
**Estimated Effort:** 2 story points
**File:** `/src/lib/i18n/guest-language.ts`

#### 4.1 Implement getGuestLanguageFromCookie (server-side)

Add after the mapping functions:

```typescript
// =============================================================================
// Cookie Reading Utilities
// =============================================================================

/**
 * Reads the guest language preference from a cookie (server-side).
 *
 * @param request - The incoming Next.js request object
 * @returns The locale from cookie if valid and supported, or null
 *
 * @example
 * // In a server component or API route
 * const language = getGuestLanguageFromCookie(request);
 * if (language) {
 *   console.log('Guest prefers:', language);
 * }
 */
export function getGuestLanguageFromCookie(
  request: NextRequest
): SupportedLocale | null {
  const cookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}
```

#### 4.2 Implement getGuestLanguageFromCookieClient (client-side)

```typescript
/**
 * Reads the guest language preference from document.cookie (client-side).
 * Safe to call only in browser environment.
 *
 * @returns The locale from cookie if valid and supported, or null
 *
 * @example
 * // In a client component
 * 'use client';
 * const language = getGuestLanguageFromCookieClient();
 */
export function getGuestLanguageFromCookieClient(): SupportedLocale | null {
  if (typeof document === 'undefined') {
    // Not in browser environment
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LOCALE_COOKIE_NAME && value) {
      const decodedValue = decodeURIComponent(value);
      if (isSupportedLocale(decodedValue)) {
        return decodedValue;
      }
    }
  }

  return null;
}
```

#### 4.3 Implement setGuestLanguageCookie (server-side)

```typescript
// =============================================================================
// Cookie Setting Utilities
// =============================================================================

/**
 * Sets the guest language preference cookie (server-side via NextResponse).
 *
 * Cookie attributes:
 * - Name: FAQBNB_LANG
 * - Max-Age: 1 year (31,536,000 seconds)
 * - Path: /
 * - SameSite: Lax
 * - Secure: true in production
 * - HttpOnly: false (client-side access needed for language switcher)
 *
 * @param response - The Next.js response to modify
 * @param language - The locale to set (must be a supported locale)
 *
 * @example
 * // In middleware or API route
 * const response = NextResponse.next();
 * setGuestLanguageCookie(response, 'fr');
 * return response;
 */
export function setGuestLanguageCookie(
  response: NextResponse,
  language: SupportedLocale
): void {
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: language,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side access for language switcher
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
```

#### 4.4 Implement setGuestLanguageCookieClient (client-side)

```typescript
/**
 * Sets the guest language preference cookie (client-side via document.cookie).
 * Safe to call only in browser environment.
 *
 * Cookie attributes match server-side version:
 * - Max-Age: 1 year
 * - Path: /
 * - SameSite: Lax
 * - Secure: true if HTTPS
 *
 * @param language - The locale to set (must be a supported locale)
 *
 * @example
 * // In a client component
 * 'use client';
 * setGuestLanguageCookieClient('fr');
 */
export function setGuestLanguageCookieClient(language: SupportedLocale): void {
  if (typeof document === 'undefined') {
    console.warn('[i18n-guest] setGuestLanguageCookieClient called outside browser');
    return;
  }

  const isSecure = window.location.protocol === 'https:';
  const maxAge = LOCALE_COOKIE_MAX_AGE;
  const cookieValue = encodeURIComponent(language);

  let cookieString = `${LOCALE_COOKIE_NAME}=${cookieValue}; path=/; max-age=${maxAge}; samesite=lax`;

  if (isSecure) {
    cookieString += '; secure';
  }

  document.cookie = cookieString;
}
```

**Verification:**
- Server-side cookie reading works with NextRequest
- Client-side cookie reading works with document.cookie
- Server-side cookie setting works with NextResponse
- Client-side cookie setting creates properly formatted cookie string
- Invalid cookie values return null (not throw)

---

### Task 5: Implement detectGuestLanguage Function
**Estimated Effort:** 1 story point
**File:** `/src/lib/i18n/guest-language.ts`

#### 5.1 Create the main detection function

Add after the cookie utilities:

```typescript
// =============================================================================
// Main Detection Functions
// =============================================================================

/**
 * Detects the guest's preferred language using priority cascade.
 * Unlike detectUserLanguage(), this skips database lookup (guests have no account).
 *
 * Priority Order:
 * 1. URL parameter (for shareable links)
 * 2. Cookie (FAQBNB_LANG) - persisted preference
 * 3. Accept-Language header - browser preference
 * 4. Default locale ('en')
 *
 * @param request - NextRequest object (for server-side detection)
 * @param urlParam - Optional language from URL query string (highest priority)
 * @returns The detected supported locale (always valid)
 *
 * @example
 * // In server component page.tsx
 * const { lang } = await searchParams;
 * const language = detectGuestLanguage(request, lang);
 *
 * @example
 * // In middleware
 * const url = new URL(request.url);
 * const lang = url.searchParams.get('lang');
 * const language = detectGuestLanguage(request, lang);
 */
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
  // Priority 1: URL parameter
  if (urlParam) {
    const normalizedUrlParam = urlParam.toLowerCase().trim();
    if (isSupportedLocale(normalizedUrlParam)) {
      console.log('[i18n-guest] Language from URL param:', normalizedUrlParam);
      return normalizedUrlParam;
    }
    // URL param provided but not a supported locale - continue cascade
    console.log('[i18n-guest] URL param not supported, falling through:', urlParam);
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
    // Only use header language if it maps to a supported locale other than default,
    // OR if the header explicitly contains 'en'
    if (isSupportedLocale(lang) || mapped !== DEFAULT_LOCALE) {
      console.log('[i18n-guest] Language from Accept-Language header:', mapped);
      return mapped;
    }
  }

  // Priority 4: Default
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

**Verification Test Cases:**
| Scenario | URL Param | Cookie | Accept-Language | Expected |
|----------|-----------|--------|-----------------|----------|
| URL param present (valid) | `'fr'` | `'es'` | `'de'` | `'fr'` |
| URL param present (invalid) | `'xx'` | `'es'` | `'de'` | `'es'` |
| Cookie present, no URL | `null` | `'es'` | `'de'` | `'es'` |
| Header only | `null` | none | `'de, fr;q=0.8'` | `'de'` |
| No sources | `null` | none | `null` | `'en'` |
| Unsupported in header | `null` | none | `'zh-CN'` | `'en'` |

---

### Task 6: Implement detectGuestLanguageWithMeta Function
**Estimated Effort:** 1 story point
**File:** `/src/lib/i18n/guest-language.ts`

#### 6.1 Create the extended detection function with metadata

```typescript
/**
 * Detects guest language with full metadata about detection source.
 * Use this when you need to know where the language preference came from
 * (for analytics, debugging, or conditional UI).
 *
 * @param request - NextRequest object (for server-side detection)
 * @param options - Detection options including URL parameter
 * @returns Detection result with language and source metadata
 *
 * @example
 * const result = detectGuestLanguageWithMeta(request, { urlParam: lang });
 * console.log(`Using ${result.language} from ${result.source}`);
 * // "Using fr from url"
 */
export function detectGuestLanguageWithMeta(
  request: NextRequest,
  options?: DetectGuestLanguageOptions
): GuestLanguageDetectionResult {
  const { urlParam, skipCookie, skipHeader } = options || {};

  // Priority 1: URL parameter
  if (urlParam) {
    const normalizedUrlParam = urlParam.toLowerCase().trim();
    if (isSupportedLocale(normalizedUrlParam)) {
      return { language: normalizedUrlParam, source: 'url' };
    }
  }

  // Priority 2: Cookie (unless skipped)
  if (!skipCookie) {
    const cookieValue = getGuestLanguageFromCookie(request);
    if (cookieValue) {
      return { language: cookieValue, source: 'cookie' };
    }
  }

  // Priority 3: Accept-Language header (unless skipped)
  if (!skipHeader) {
    const acceptLanguage = request.headers.get('Accept-Language');
    const headerLanguages = parseAcceptLanguage(acceptLanguage);

    for (const lang of headerLanguages) {
      const mapped = mapToSupportedLanguage(lang);
      if (isSupportedLocale(lang) || mapped !== DEFAULT_LOCALE) {
        return { language: mapped, source: 'header' };
      }
    }
  }

  // Priority 4: Default
  return { language: DEFAULT_LOCALE, source: 'default' };
}
```

**Verification:**
- Returns correct `source` value for each detection path
- Respects `skipCookie` and `skipHeader` options
- Returns `'default'` source when no preference detected

---

### Task 7: Update index.ts with Exports
**Estimated Effort:** 0.5 story points
**File:** `/src/lib/i18n/index.ts`

#### 7.1 Add guest-language exports to index.ts

Add the following exports to `/src/lib/i18n/index.ts`:

```typescript
// Guest Language Detection exports (REQ-E04-002)
export {
  // Detection functions
  detectGuestLanguage,
  detectGuestLanguageWithMeta,
  // Cookie utilities
  getGuestLanguageFromCookie,
  getGuestLanguageFromCookieClient,
  setGuestLanguageCookie,
  setGuestLanguageCookieClient,
  // Helper functions
  parseAcceptLanguage,
  mapToSupportedLanguage,
  // Types
  type DetectGuestLanguageOptions,
  type GuestLanguageDetectionResult,
} from './guest-language';
```

**Location in file:** Add after the existing `language-detection` exports section.

**Verification:**
- All 8 functions are exported
- Both type definitions are exported
- Imports from `@/lib/i18n` resolve correctly:
  ```typescript
  import { detectGuestLanguage, setGuestLanguageCookieClient } from '@/lib/i18n';
  ```

---

### Task 8: Verify Build and Type Safety
**Estimated Effort:** 0.5 story points

#### 8.1 Run TypeScript compilation

```bash
npx tsc --noEmit
```

Expected: No errors related to guest-language module.

#### 8.2 Verify exports are accessible

Create a temporary test file or use the TypeScript compiler to verify:

```typescript
// Test import resolution
import {
  detectGuestLanguage,
  detectGuestLanguageWithMeta,
  getGuestLanguageFromCookie,
  getGuestLanguageFromCookieClient,
  setGuestLanguageCookie,
  setGuestLanguageCookieClient,
  parseAcceptLanguage,
  mapToSupportedLanguage,
  type DetectGuestLanguageOptions,
  type GuestLanguageDetectionResult,
} from '@/lib/i18n';
```

#### 8.3 Run build

```bash
npm run build
```

Expected: Build succeeds without errors.

---

## Complete Function Signatures Summary

| Function | Signature | Export |
|----------|-----------|--------|
| `detectGuestLanguage` | `(request: NextRequest, urlParam?: string \| null) => SupportedLocale` | Yes |
| `detectGuestLanguageWithMeta` | `(request: NextRequest, options?: DetectGuestLanguageOptions) => GuestLanguageDetectionResult` | Yes |
| `getGuestLanguageFromCookie` | `(request: NextRequest) => SupportedLocale \| null` | Yes |
| `getGuestLanguageFromCookieClient` | `() => SupportedLocale \| null` | Yes |
| `setGuestLanguageCookie` | `(response: NextResponse, language: SupportedLocale) => void` | Yes |
| `setGuestLanguageCookieClient` | `(language: SupportedLocale) => void` | Yes |
| `parseAcceptLanguage` | `(header: string \| null) => string[]` | Yes |
| `mapToSupportedLanguage` | `(code: string) => SupportedLocale` | Yes |

---

## Files Changed Summary

### New Files

| File | Purpose |
|------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest language detection and cookie utilities (8 functions, 2 types) |

### Modified Files

| File | Change |
|------|--------|
| `/src/lib/i18n/index.ts` | Add exports for guest-language module |

---

## Acceptance Criteria Verification

| Criteria from REQ-E04-002 | Implementation | Task |
|---------------------------|----------------|------|
| Detect language from URL parameters | `detectGuestLanguage` with `urlParam` | Task 5 |
| Fallback to cookie values | Priority 2 in detection cascade | Task 5 |
| Fallback to Accept-Language header | Priority 3 in detection cascade | Task 5 |
| Parse Accept-Language with quality values | `parseAcceptLanguage` function | Task 2 |
| Map browser codes to supported languages | `mapToSupportedLanguage` function | Task 3 |
| Persist language to cookie with expiration | `setGuestLanguageCookie*` functions | Task 4 |
| Cookie security attributes | Secure, SameSite=Lax, Path=/ | Task 4 |
| Default to English | `DEFAULT_LOCALE` fallback | Task 5 |
| Handle edge cases gracefully | Input validation throughout | All Tasks |
| Support server and client contexts | Separate server/client functions | Task 4 |

---

## Testing Notes

### Manual Testing Scenarios

1. **URL Parameter Detection**
   - Navigate to `/item/abc123?lang=fr`
   - Verify French is detected and logged

2. **Cookie Persistence**
   - Set language via `setGuestLanguageCookieClient('es')`
   - Refresh page without `?lang=` parameter
   - Verify Spanish is detected from cookie

3. **Accept-Language Detection**
   - Clear cookies
   - Set browser language to German
   - Navigate to `/item/abc123`
   - Verify German is detected

4. **Default Fallback**
   - Clear cookies
   - Mock Accept-Language header with unsupported language
   - Verify English is returned

### Edge Cases to Test

- Empty string URL parameter
- Malformed Accept-Language header (e.g., `;;;q=abc`)
- Cookie with invalid value
- Browser with cookies disabled
- SSR vs CSR consistency

---

## Implementation Order

Execute tasks in this order for optimal dependency management:

1. **Task 1** - Create file structure and imports
2. **Task 2** - Implement `parseAcceptLanguage` (no internal dependencies)
3. **Task 3** - Implement `mapToSupportedLanguage` (no internal dependencies)
4. **Task 4** - Implement cookie utilities (uses `isSupportedLocale` from config)
5. **Task 5** - Implement `detectGuestLanguage` (uses Tasks 2-4)
6. **Task 6** - Implement `detectGuestLanguageWithMeta` (uses Tasks 2-4)
7. **Task 7** - Update index.ts exports
8. **Task 8** - Verify build

---

## Post-Implementation Checklist

- [ ] All 8 functions implemented and exported
- [ ] Both type definitions implemented and exported
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] No circular import warnings
- [ ] Console logs use `[i18n-guest]` prefix for debugging
- [ ] JSDoc comments on all public functions
- [ ] File header includes @created, @lastModified, REQ reference

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Task 1.2*
*This detailed breakdown enables step-by-step implementation by an AI coding agent or junior developer.*
