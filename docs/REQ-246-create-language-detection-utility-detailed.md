# REQ-246: Create Language Detection Utility - Detailed Task Breakdown

**Generated:** 2026-01-18 12:30:00 UTC
**Last Modified:** 2026-01-18 12:30:00 UTC
**Overview Document:** REQ-246-create-language-detection-utility-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.1)
**Status:** Ready for Implementation

---

## Document Purpose

This document breaks down the implementation overview into granular, actionable tasks suitable for an AI coding agent or junior developer. Each task represents approximately 1 story point of work (15-30 minutes) and includes explicit file paths, code patterns, and verification steps.

---

## Prerequisites

Before starting these tasks, verify:
- [ ] Node.js and npm are available in the development environment
- [ ] The project builds successfully with `npm run build`
- [ ] Access to the existing codebase patterns (middleware.ts, lib/session.ts)
- [ ] TypeScript strict mode is enabled in tsconfig.json

**Soft Dependencies (gracefully handled if incomplete):**
- Phase 1, Task 1.3 (preferred_language column on users table) - utility handles missing property gracefully

---

## Task Breakdown

### Task 5.1.1: Create i18n Directory Structure

**Objective:** Create the directory structure for the i18n module

**File Operations:**
- CREATE directory: `/src/lib/i18n/`

**Steps:**
1. Create the `/src/lib/i18n/` directory if it doesn't exist
2. Verify the directory is created

**Verification:**
```bash
ls -la src/lib/i18n/
```

**Estimated Time:** 5 minutes

---

### Task 5.1.2: Create i18n Configuration Module

**Objective:** Create the configuration file with locale constants and type definitions

**File:** `/src/lib/i18n/config.ts` (CREATE)

**Implementation:**

```typescript
/**
 * i18n Configuration
 * Defines supported locales and language-related constants
 *
 * @module lib/i18n/config
 */

/**
 * Array of all supported locale codes in the application.
 * Order determines display order in UI components.
 */
export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

/**
 * Type representing a valid supported locale code.
 * Derived from SUPPORTED_LOCALES array for type safety.
 */
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/**
 * The default locale used when no preference is detected.
 */
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Cookie name for storing user's language preference.
 * Used by both middleware and client-side components.
 */
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Maximum age for the locale cookie in seconds.
 * Set to 1 year for long-term persistence.
 */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Display names for each locale in both English and native language.
 * Used by LanguageSwitcher component for UI display.
 */
export const LOCALE_DISPLAY_NAMES: Record<SupportedLocale, { english: string; native: string }> = {
  en: { english: 'English', native: 'English' },
  fr: { english: 'French', native: 'Français' },
  es: { english: 'Spanish', native: 'Español' },
  de: { english: 'German', native: 'Deutsch' },
  nl: { english: 'Dutch', native: 'Nederlands' },
  it: { english: 'Italian', native: 'Italiano' },
};

/**
 * Type guard to check if a string is a supported locale.
 * Use this to validate user input or external data.
 *
 * @param locale - The string to check
 * @returns True if the locale is supported, false otherwise
 *
 * @example
 * const userLocale = 'fr';
 * if (isSupportedLocale(userLocale)) {
 *   // TypeScript knows userLocale is SupportedLocale here
 * }
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
```

**Verification:**
1. File compiles without TypeScript errors
2. Run: `npx tsc --noEmit src/lib/i18n/config.ts`
3. Verify exports are accessible:
   ```typescript
   import { SUPPORTED_LOCALES, isSupportedLocale } from '@/lib/i18n/config';
   console.log(SUPPORTED_LOCALES); // Should log ['en', 'fr', 'es', 'de', 'nl', 'it']
   console.log(isSupportedLocale('fr')); // Should log true
   console.log(isSupportedLocale('zh')); // Should log false
   ```

**Acceptance Criteria:**
- [ ] File exists at `/src/lib/i18n/config.ts`
- [ ] `SUPPORTED_LOCALES` array contains exactly 6 locales: 'en', 'fr', 'es', 'de', 'nl', 'it'
- [ ] `DEFAULT_LOCALE` is set to 'en'
- [ ] `LOCALE_COOKIE_NAME` is 'FAQBNB_LANG'
- [ ] `isSupportedLocale` type guard returns correct boolean values
- [ ] All exports have JSDoc documentation

**Estimated Time:** 15 minutes

---

### Task 5.1.3: Create Language Detection Types

**Objective:** Define TypeScript interfaces for the language detection function

**File:** `/src/lib/i18n/language-detection.ts` (CREATE - partial, types only)

**Implementation (types section at top of file):**

```typescript
/**
 * Language Detection Utility
 * Determines user's preferred locale using a prioritized cascade of sources.
 *
 * Priority Order:
 * 1. User database preference (authenticated users)
 * 2. Cookie (FAQBNB_LANG)
 * 3. Accept-Language HTTP header
 * 4. Default locale ('en')
 *
 * @module lib/i18n/language-detection
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from './config';

/**
 * Minimal user object interface for language detection.
 * Only requires the fields needed for locale detection.
 */
export interface UserLocalePreference {
  /** User's unique identifier */
  id: string;
  /** User's preferred language code, if set */
  preferred_language?: string | null;
}

/**
 * Options for customizing language detection behavior.
 */
export interface DetectLanguageOptions {
  /** Skip database lookup even if user is provided */
  skipDbLookup?: boolean;
  /** Custom cookie name override (defaults to FAQBNB_LANG) */
  cookieName?: string;
}

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
```

**Verification:**
1. File compiles without TypeScript errors
2. Types are properly exported and can be imported elsewhere

**Acceptance Criteria:**
- [ ] `UserLocalePreference` interface defined with id and optional preferred_language
- [ ] `DetectLanguageOptions` interface defined with optional fields
- [ ] `LanguageQuality` interface defined (internal use)
- [ ] All interfaces have JSDoc documentation

**Estimated Time:** 10 minutes

---

### Task 5.1.4: Implement Accept-Language Header Parser

**Objective:** Create a helper function to parse the Accept-Language HTTP header

**File:** `/src/lib/i18n/language-detection.ts` (ADD to existing file)

**Implementation (add after types):**

```typescript
/**
 * Parses the Accept-Language header and returns language codes sorted by preference.
 *
 * The Accept-Language header follows RFC 7231 format:
 * Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
 *
 * @param acceptLanguage - The Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 *
 * @example
 * parseAcceptLanguageHeader('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguageHeader(null)
 * // Returns: []
 */
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) {
    return [];
  }

  const languages: LanguageQuality[] = acceptLanguage
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');

      // Extract primary language tag (e.g., 'fr' from 'fr-FR')
      const primaryCode = code.split('-')[0].toLowerCase();

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

**Verification:**
Test cases to verify manually or via unit tests:
```typescript
// Test 1: Standard header with quality values
parseAcceptLanguageHeader('fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7')
// Expected: ['fr', 'en', 'de']

// Test 2: Regional variants extracted to primary language
parseAcceptLanguageHeader('en-US, en-GB;q=0.9, es-MX;q=0.8')
// Expected: ['en', 'es']

// Test 3: Null or empty input
parseAcceptLanguageHeader(null)
// Expected: []

// Test 4: Wildcard ignored
parseAcceptLanguageHeader('en, *;q=0.5')
// Expected: ['en']

// Test 5: Duplicate languages deduplicated
parseAcceptLanguageHeader('fr-FR, fr;q=0.9, fr-CA;q=0.8')
// Expected: ['fr']
```

**Acceptance Criteria:**
- [ ] Function parses comma-separated language tags
- [ ] Quality values (q=X.X) are extracted and used for sorting
- [ ] Regional variants (en-US) are reduced to primary language (en)
- [ ] Results are sorted by quality in descending order
- [ ] Duplicate languages are deduplicated
- [ ] Wildcard (*) entries are filtered out
- [ ] Null/empty input returns empty array
- [ ] Invalid quality values are handled gracefully

**Estimated Time:** 20 minutes

---

### Task 5.1.5: Implement Cookie Reading Helper

**Objective:** Create a helper function to read locale from cookie

**File:** `/src/lib/i18n/language-detection.ts` (ADD to existing file)

**Implementation (add after parseAcceptLanguageHeader):**

```typescript
/**
 * Reads the locale preference from a cookie.
 *
 * @param request - The incoming Next.js request object
 * @param cookieName - Cookie name to read (defaults to FAQBNB_LANG)
 * @returns The locale from cookie if valid and supported, or null
 *
 * @example
 * const locale = getLocaleFromCookie(request);
 * if (locale) {
 *   console.log('User prefers:', locale);
 * }
 */
function getLocaleFromCookie(
  request: NextRequest,
  cookieName: string = LOCALE_COOKIE_NAME
): SupportedLocale | null {
  const cookieValue = request.cookies.get(cookieName)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}
```

**Verification:**
```typescript
// Test with mock NextRequest containing FAQBNB_LANG=fr
// Expected: 'fr'

// Test with mock NextRequest containing FAQBNB_LANG=zh (unsupported)
// Expected: null

// Test with mock NextRequest with no cookie
// Expected: null
```

**Acceptance Criteria:**
- [ ] Function reads cookie value from NextRequest
- [ ] Returns the locale if it's a supported locale
- [ ] Returns null for unsupported locale values
- [ ] Returns null if cookie doesn't exist
- [ ] Supports custom cookie name override

**Estimated Time:** 10 minutes

---

### Task 5.1.6: Implement Main Detection Function

**Objective:** Implement the primary detectUserLanguage function with cascade logic

**File:** `/src/lib/i18n/language-detection.ts` (ADD to existing file)

**Implementation (add after helper functions):**

```typescript
/**
 * Detects the user's preferred language using a prioritized cascade.
 *
 * Priority Order:
 * 1. User database preference (if user provided and has preference)
 * 2. Cookie value (FAQBNB_LANG)
 * 3. Accept-Language header (first supported match)
 * 4. Default locale ('en')
 *
 * @param request - The incoming Next.js request object
 * @param user - Optional user object with potential language preference
 * @param options - Detection options for customization
 * @returns The detected locale code (always a supported locale)
 *
 * @example
 * // In middleware
 * const locale = detectUserLanguage(request, authenticatedUser);
 *
 * @example
 * // For unauthenticated request
 * const locale = detectUserLanguage(request);
 */
export function detectUserLanguage(
  request: NextRequest,
  user?: UserLocalePreference | null,
  options?: DetectLanguageOptions
): SupportedLocale {
  const cookieName = options?.cookieName ?? LOCALE_COOKIE_NAME;

  // Priority 1: User database preference
  if (!options?.skipDbLookup && user?.preferred_language) {
    if (isSupportedLocale(user.preferred_language)) {
      console.log('[i18n] Language detected from user preference:', user.preferred_language);
      return user.preferred_language;
    }
    // User has preference but it's not a supported locale - log and continue
    console.log('[i18n] User preference not supported, falling through:', user.preferred_language);
  }

  // Priority 2: Cookie value
  const cookieLocale = getLocaleFromCookie(request, cookieName);
  if (cookieLocale) {
    console.log('[i18n] Language detected from cookie:', cookieLocale);
    return cookieLocale;
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    if (isSupportedLocale(locale)) {
      console.log('[i18n] Language detected from Accept-Language header:', locale);
      return locale;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

**Verification:**
Test scenarios:
```typescript
// Scenario 1: User with French preference
// Input: user = { id: '123', preferred_language: 'fr' }, cookie = 'de', header = 'en'
// Expected: 'fr' (user preference wins)

// Scenario 2: User with null preference, cookie set
// Input: user = { id: '123', preferred_language: null }, cookie = 'de', header = 'en'
// Expected: 'de' (cookie wins when no user preference)

// Scenario 3: No user, no cookie, German in header
// Input: user = null, cookie = null, header = 'de-DE, en;q=0.8'
// Expected: 'de' (first supported from header)

// Scenario 4: No user, no cookie, unsupported languages in header
// Input: user = null, cookie = null, header = 'zh-CN, ja;q=0.9'
// Expected: 'en' (default fallback)

// Scenario 5: User with unsupported language preference
// Input: user = { id: '123', preferred_language: 'zh' }, cookie = 'fr', header = 'en'
// Expected: 'fr' (cookie wins when user preference unsupported)
```

**Acceptance Criteria:**
- [ ] Function accepts NextRequest and optional user object
- [ ] Priority 1: User database preference is checked first (when user is provided)
- [ ] Priority 2: Cookie (FAQBNB_LANG) is checked second
- [ ] Priority 3: Accept-Language header is parsed and first supported match is used
- [ ] Priority 4: Default locale ('en') is returned if no other source matches
- [ ] Only supported locales are returned (never an invalid locale)
- [ ] Invalid/unsupported locales from any source are ignored
- [ ] Console logging indicates detection source for debugging
- [ ] Function is exported from the module
- [ ] skipDbLookup option works correctly

**Estimated Time:** 20 minutes

---

### Task 5.1.7: Implement Cookie Setting Utility

**Objective:** Create a helper function to set the locale cookie on a response

**File:** `/src/lib/i18n/language-detection.ts` (ADD to existing file)

**Implementation (add after detectUserLanguage):**

```typescript
/**
 * Sets the locale cookie on a Next.js response.
 * Use this to persist the user's language preference across requests.
 *
 * @param response - The Next.js response to modify
 * @param locale - The locale to set (must be a supported locale)
 * @param cookieName - Cookie name to use (defaults to FAQBNB_LANG)
 *
 * @example
 * // In middleware
 * const res = NextResponse.next();
 * const locale = detectUserLanguage(req, user);
 * setLocaleCookie(res, locale);
 * return res;
 */
export function setLocaleCookie(
  response: NextResponse,
  locale: SupportedLocale,
  cookieName: string = LOCALE_COOKIE_NAME
): void {
  response.cookies.set({
    name: cookieName,
    value: locale,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side access for language switcher
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
```

**Verification:**
```typescript
// Verify cookie is set with correct options
const res = NextResponse.next();
setLocaleCookie(res, 'fr');
// Cookie should be set with:
// - name: 'FAQBNB_LANG'
// - value: 'fr'
// - maxAge: 31536000 (1 year)
// - path: '/'
// - httpOnly: false
// - secure: depends on NODE_ENV
// - sameSite: 'lax'
```

**Acceptance Criteria:**
- [ ] Function sets cookie on NextResponse object
- [ ] Cookie uses correct name (FAQBNB_LANG by default)
- [ ] Cookie max age is 1 year
- [ ] Cookie path is root (/)
- [ ] Cookie is NOT httpOnly (allows client-side access)
- [ ] Cookie is secure in production
- [ ] Cookie sameSite is 'lax'
- [ ] Function is exported from the module

**Estimated Time:** 10 minutes

---

### Task 5.1.8: Create Module Barrel Export

**Objective:** Create index.ts to provide clean import paths

**File:** `/src/lib/i18n/index.ts` (CREATE)

**Implementation:**

```typescript
/**
 * i18n Module Exports
 * Centralized exports for internationalization utilities.
 *
 * @module lib/i18n
 *
 * @example
 * import {
 *   detectUserLanguage,
 *   setLocaleCookie,
 *   SUPPORTED_LOCALES,
 *   DEFAULT_LOCALE,
 *   isSupportedLocale,
 *   type SupportedLocale,
 * } from '@/lib/i18n';
 */

// Configuration exports
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_DISPLAY_NAMES,
  isSupportedLocale,
  type SupportedLocale,
} from './config';

// Language Detection exports
export {
  detectUserLanguage,
  setLocaleCookie,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from './language-detection';
```

**Verification:**
```typescript
// Verify all exports are accessible from the barrel export
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_DISPLAY_NAMES,
  isSupportedLocale,
  detectUserLanguage,
  setLocaleCookie,
  type SupportedLocale,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from '@/lib/i18n';

// All should be defined
console.log(SUPPORTED_LOCALES); // ['en', 'fr', 'es', 'de', 'nl', 'it']
console.log(DEFAULT_LOCALE); // 'en'
console.log(typeof detectUserLanguage); // 'function'
console.log(typeof setLocaleCookie); // 'function'
```

**Acceptance Criteria:**
- [ ] File exists at `/src/lib/i18n/index.ts`
- [ ] All config exports are re-exported
- [ ] All language-detection exports are re-exported
- [ ] Types are re-exported using `type` keyword
- [ ] File has module-level JSDoc documentation

**Estimated Time:** 5 minutes

---

### Task 5.1.9: Verify TypeScript Compilation

**Objective:** Ensure all files compile without errors

**Steps:**
1. Run TypeScript compiler check:
   ```bash
   npx tsc --noEmit
   ```
2. Fix any TypeScript errors that appear
3. Verify no import path issues

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` completes without errors
- [ ] All imports resolve correctly
- [ ] No unused variable warnings (if strict mode enabled)

**Estimated Time:** 10 minutes

---

### Task 5.1.10: Build Verification

**Objective:** Verify the project builds successfully with new code

**Steps:**
1. Run full project build:
   ```bash
   npm run build
   ```
2. Check for any build errors
3. Verify no warnings related to the new i18n module

**Acceptance Criteria:**
- [ ] `npm run build` completes successfully
- [ ] No build errors related to new files
- [ ] No significant warnings introduced

**Estimated Time:** 5 minutes

---

## Complete File Listing

After completing all tasks, the following files should exist:

| File Path | Status | Description |
|-----------|--------|-------------|
| `/src/lib/i18n/config.ts` | CREATE | Locale configuration constants |
| `/src/lib/i18n/language-detection.ts` | CREATE | Language detection functions |
| `/src/lib/i18n/index.ts` | CREATE | Module barrel exports |

---

## Integration Notes

### For Task 5.2 (Middleware Integration)

After completing this task, the middleware can integrate language detection like this:

```typescript
// /src/middleware.ts (Task 5.2 - separate task)
import { detectUserLanguage, setLocaleCookie } from '@/lib/i18n';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ... existing auth code ...

  // Language detection (add after session check)
  const userPreference = session?.user ? {
    id: session.user.id,
    preferred_language: session.user.user_metadata?.preferred_language
  } : null;

  const locale = detectUserLanguage(req, userPreference);
  setLocaleCookie(res, locale);

  // Optionally set header for server components
  res.headers.set('x-locale', locale);

  return res;
}
```

### For LanguageSwitcher Component (Task 5.3)

The component will use these exports:
```typescript
import {
  SUPPORTED_LOCALES,
  LOCALE_DISPLAY_NAMES,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from '@/lib/i18n';
```

---

## Testing Checklist

### Manual Testing

- [ ] Import `detectUserLanguage` works from `@/lib/i18n`
- [ ] Import `setLocaleCookie` works from `@/lib/i18n`
- [ ] All type exports work correctly
- [ ] `isSupportedLocale` returns true for valid locales
- [ ] `isSupportedLocale` returns false for invalid locales
- [ ] Accept-Language parsing handles edge cases

### Edge Cases to Verify

- [ ] User with `preferred_language: null` → falls through to cookie
- [ ] User with `preferred_language: undefined` → falls through to cookie
- [ ] User with unsupported locale → falls through to cookie
- [ ] Cookie with unsupported locale → falls through to header
- [ ] Empty Accept-Language header → falls through to default
- [ ] Accept-Language with only unsupported languages → returns default
- [ ] Accept-Language with wildcard (*) → wildcard is ignored
- [ ] Malformed Accept-Language header → handled gracefully

---

## Success Metrics

Upon completion of all tasks:

1. **Functional Requirements Met:**
   - `detectUserLanguage` function exists and is exported
   - Function accepts `NextRequest` and optional user object
   - Priority cascade works as specified

2. **Code Quality:**
   - All files compile without TypeScript errors
   - Project builds successfully
   - JSDoc documentation on all public exports
   - Clean import paths via barrel export

3. **Maintainability:**
   - Clear separation between config and detection logic
   - Types are well-defined and exported
   - Console logging aids debugging

---

## References

- [Overview Document](/docs/REQ-246-create-language-detection-utility-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [RFC 7231 - Accept-Language](https://tools.ietf.org/html/rfc7231#section-5.3.5)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation (Phase 5, Task 5.1)*
