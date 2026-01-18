# REQ-230: Create i18n Configuration Module - Detailed Task Breakdown

**Generated:** 2026-01-18 00:00:00 UTC
**Last Modified:** 2026-01-18 00:00:00 UTC
**Request Reference:** REQ-230 - Centralized Locale Configuration and Server-Side Locale Detection
**Overview Document:** REQ-230-create-i18n-configuration-module-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.2)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a detailed, step-by-step implementation guide for creating the i18n configuration module. The module establishes a centralized source of truth for locale configuration and implements server-side locale detection for the FAQBNB application.

**Total Tasks:** 11 granular tasks
**Estimated Complexity:** Small (S)
**Dependencies:** Task 2.1 (next-intl installation and messages directory)

---

## Pre-Implementation Checklist

Before starting implementation, verify these prerequisites:

- [ ] **Task 2.1 Complete:** next-intl package installed (`npm list next-intl`)
- [ ] **Messages Directory Exists:** `/messages/` directory with `en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
- [ ] **TypeScript Configured:** Project uses TypeScript with `@/` path alias
- [ ] **Current Branch:** Working on appropriate feature branch

---

## Task Breakdown

### Task 2.2.1: Create i18n Directory Structure

**Type:** Setup
**Complexity:** 1 point
**Files to Create:**
- `/src/lib/i18n/` (directory)

**Implementation Steps:**

1. Create the i18n module directory:
   ```bash
   mkdir -p src/lib/i18n
   ```

**Verification:**
```bash
ls -la src/lib/i18n/
# Expected: Empty directory exists
```

**Acceptance Criteria:**
- [ ] Directory `/src/lib/i18n/` exists
- [ ] Directory is empty (files created in subsequent tasks)

---

### Task 2.2.2: Create TypeScript Types for Locales

**Type:** Code
**Complexity:** 1 point
**File to Create:** `/src/lib/i18n/config.ts` (partial - types section)

**Implementation Steps:**

1. Create the config.ts file with the following type definitions at the top:

```typescript
/**
 * i18n Configuration Module
 *
 * Centralized locale configuration for the FAQBNB application.
 * Provides type-safe locale definitions and configuration constants.
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

/**
 * Supported locale codes as a const tuple
 * These are the language codes supported by the application.
 */
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

/**
 * Type representing a valid supported locale
 */
export type SupportedLocale = (typeof locales)[number];
```

**Verification:**
```bash
npx tsc --noEmit src/lib/i18n/config.ts
# Expected: No errors
```

**Acceptance Criteria:**
- [ ] `locales` const tuple exports 6 locale codes: 'en', 'fr', 'es', 'de', 'nl', 'it'
- [ ] `SupportedLocale` type is derived from `locales` tuple
- [ ] TypeScript compilation succeeds with no errors

---

### Task 2.2.3: Add Locale Constants and Configuration

**Type:** Code
**Complexity:** 1 point
**File to Modify:** `/src/lib/i18n/config.ts`

**Implementation Steps:**

1. Add the following constants after the type definitions:

```typescript
/**
 * Default locale used when no preference is detected
 */
export const defaultLocale: SupportedLocale = 'en';

/**
 * Cookie name for storing language preference
 * Used by middleware and LanguageSwitcher component
 */
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * i18n configuration object for next-intl
 * Used by getRequestConfig and IntlProvider
 */
export const i18nConfig = {
  locales,
  defaultLocale,
  localePrefix: 'as-needed' as const,
} as const;
```

**Verification:**
```typescript
// Test in Node REPL or test file:
import { defaultLocale, LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE, i18nConfig } from '@/lib/i18n/config';
console.assert(defaultLocale === 'en', 'Default locale should be en');
console.assert(LOCALE_COOKIE_NAME === 'FAQBNB_LANG', 'Cookie name should be FAQBNB_LANG');
console.assert(LOCALE_COOKIE_MAX_AGE === 31536000, 'Max age should be 1 year in seconds');
console.assert(i18nConfig.locales.length === 6, 'Should have 6 locales');
```

**Acceptance Criteria:**
- [ ] `defaultLocale` is set to 'en'
- [ ] `LOCALE_COOKIE_NAME` is 'FAQBNB_LANG'
- [ ] `LOCALE_COOKIE_MAX_AGE` equals 365 * 24 * 60 * 60 (31536000 seconds)
- [ ] `i18nConfig` object contains locales, defaultLocale, and localePrefix

---

### Task 2.2.4: Add Locale Metadata Interface and Data

**Type:** Code
**Complexity:** 1 point
**File to Modify:** `/src/lib/i18n/config.ts`

**Implementation Steps:**

1. Add the LocaleMetadata interface and data:

```typescript
/**
 * Locale metadata including native names and optional flags
 */
export interface LocaleMetadata {
  /** ISO locale code */
  code: SupportedLocale;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Optional flag emoji */
  flag?: string;
}

/**
 * Complete locale metadata for all supported languages
 */
export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
};
```

**Verification:**
```typescript
import { localeMetadata, type SupportedLocale } from '@/lib/i18n/config';

// Verify all 6 locales have metadata
const localeKeys: SupportedLocale[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
localeKeys.forEach(code => {
  console.assert(localeMetadata[code], `Metadata exists for ${code}`);
  console.assert(localeMetadata[code].code === code, `Code matches for ${code}`);
  console.assert(localeMetadata[code].name, `Name exists for ${code}`);
  console.assert(localeMetadata[code].nativeName, `Native name exists for ${code}`);
});
```

**Acceptance Criteria:**
- [ ] `LocaleMetadata` interface defines code, name, nativeName, and optional flag
- [ ] `localeMetadata` object contains entries for all 6 locales
- [ ] Each entry has correct code, English name, and native name
- [ ] Native names use proper characters (Français, Español, etc.)

---

### Task 2.2.5: Add Locale Utility Functions

**Type:** Code
**Complexity:** 1 point
**File to Modify:** `/src/lib/i18n/config.ts`

**Implementation Steps:**

1. Add the utility functions:

```typescript
/**
 * Type guard to check if a string is a valid supported locale
 * @param locale - The string to check
 * @returns True if the locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale);
}

/**
 * Normalize a locale code to a supported locale
 * Handles variations like 'en-US' -> 'en', 'fr-CA' -> 'fr'
 * @param locale - The locale string to normalize
 * @returns The normalized supported locale or default locale if not found
 */
export function normalizeLocale(locale: string | null | undefined): SupportedLocale {
  if (!locale) {
    return defaultLocale;
  }

  // Direct match
  if (isValidLocale(locale)) {
    return locale;
  }

  // Try extracting the language code (e.g., 'en-US' -> 'en')
  const languageCode = locale.split('-')[0]?.toLowerCase();
  if (languageCode && isValidLocale(languageCode)) {
    return languageCode;
  }

  return defaultLocale;
}

/**
 * Get locale metadata for a specific locale
 * @param locale - The locale code to get metadata for
 * @returns Locale metadata or undefined if not found
 */
export function getLocaleMetadata(locale: string): LocaleMetadata | undefined {
  if (isValidLocale(locale)) {
    return localeMetadata[locale];
  }
  return undefined;
}

/**
 * Get all supported locales as an array of LocaleMetadata
 * Useful for rendering language selectors
 * @returns Array of locale metadata
 */
export function getAllLocales(): LocaleMetadata[] {
  return locales.map((code) => localeMetadata[code]);
}
```

**Verification:**
```typescript
import { isValidLocale, normalizeLocale, getLocaleMetadata, getAllLocales } from '@/lib/i18n/config';

// Test isValidLocale
console.assert(isValidLocale('en') === true, 'en is valid');
console.assert(isValidLocale('fr') === true, 'fr is valid');
console.assert(isValidLocale('xx') === false, 'xx is invalid');
console.assert(isValidLocale('english') === false, 'english is invalid');

// Test normalizeLocale
console.assert(normalizeLocale('en') === 'en', 'en normalizes to en');
console.assert(normalizeLocale('en-US') === 'en', 'en-US normalizes to en');
console.assert(normalizeLocale('fr-CA') === 'fr', 'fr-CA normalizes to fr');
console.assert(normalizeLocale('de-AT') === 'de', 'de-AT normalizes to de');
console.assert(normalizeLocale('xx-YY') === 'en', 'xx-YY falls back to en');
console.assert(normalizeLocale(null) === 'en', 'null falls back to en');
console.assert(normalizeLocale(undefined) === 'en', 'undefined falls back to en');
console.assert(normalizeLocale('') === 'en', 'empty string falls back to en');

// Test getLocaleMetadata
console.assert(getLocaleMetadata('en')?.name === 'English', 'en metadata works');
console.assert(getLocaleMetadata('xx') === undefined, 'invalid locale returns undefined');

// Test getAllLocales
console.assert(getAllLocales().length === 6, 'getAllLocales returns 6 items');
```

**Acceptance Criteria:**
- [ ] `isValidLocale()` correctly validates supported locale codes
- [ ] `normalizeLocale()` handles locale variations (en-US -> en)
- [ ] `normalizeLocale()` returns default locale for null/undefined/invalid
- [ ] `getLocaleMetadata()` returns metadata for valid locales, undefined for invalid
- [ ] `getAllLocales()` returns array of all 6 LocaleMetadata objects

---

### Task 2.2.6: Create Accept-Language Parser Function

**Type:** Code
**Complexity:** 1 point
**File to Create:** `/src/lib/i18n/request.ts` (partial - parser function)

**Implementation Steps:**

1. Create the request.ts file with the Accept-Language parser:

```typescript
/**
 * Server-Side Locale Detection
 *
 * Provides the getRequestConfig function required by next-intl for
 * server-side locale detection and message loading.
 *
 * Detection Priority:
 * 1. FAQBNB_LANG cookie (persisted preference)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale ('en')
 *
 * Note: User database preference syncing is handled by middleware (Task 5.2)
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

import {
  defaultLocale,
  isValidLocale,
  normalizeLocale,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from './config';

/**
 * Parse Accept-Language header and find the best matching locale
 *
 * Parses the standard Accept-Language header format:
 * "en-US,en;q=0.9,fr;q=0.8" -> sorted by quality value
 *
 * @param acceptLanguage - The Accept-Language header value
 * @returns The best matching supported locale or null if none found
 */
export function parseAcceptLanguage(acceptLanguage: string | null): SupportedLocale | null {
  if (!acceptLanguage) {
    return null;
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fr;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .filter(({ quality }) => !isNaN(quality))
    .sort((a, b) => b.quality - a.quality);

  // Find the first matching supported locale
  for (const { code } of languages) {
    const normalized = normalizeLocale(code);
    // Check if the normalized locale is valid and different from default
    // or if we found a direct match in our supported locales
    const baseCode = code.split('-')[0]?.toLowerCase();
    if (isValidLocale(baseCode || '')) {
      return normalized;
    }
  }

  return null;
}
```

**Verification:**
```typescript
import { parseAcceptLanguage } from '@/lib/i18n/request';

// Test parseAcceptLanguage
console.assert(parseAcceptLanguage('en-US') === 'en', 'en-US parses to en');
console.assert(parseAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.8') === 'fr', 'fr-FR highest priority');
console.assert(parseAcceptLanguage('de,en-US;q=0.9') === 'de', 'de is first');
console.assert(parseAcceptLanguage('xx-YY') === null, 'Unknown locale returns null');
console.assert(parseAcceptLanguage(null) === null, 'null returns null');
console.assert(parseAcceptLanguage('') === null, 'empty string returns null');
```

**Acceptance Criteria:**
- [ ] `parseAcceptLanguage()` correctly parses Accept-Language header format
- [ ] Quality values (q=X.X) are respected for sorting
- [ ] Returns first matching supported locale
- [ ] Returns null for unsupported or empty input

---

### Task 2.2.7: Create Locale Detection Function

**Type:** Code
**Complexity:** 1 point
**File to Modify:** `/src/lib/i18n/request.ts`

**Implementation Steps:**

1. Add the detectLocale function after parseAcceptLanguage:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

/**
 * Detect the locale from the current request
 *
 * Priority order:
 * 1. Cookie (FAQBNB_LANG) - persisted preference
 * 2. Accept-Language header - browser preference
 * 3. Default locale - fallback
 *
 * Note: User database preference is not checked here as it requires
 * database access. The middleware (Task 5.2) will handle syncing
 * the user's database preference to the cookie.
 *
 * @returns The detected locale
 */
export async function detectLocale(): Promise<SupportedLocale> {
  // Priority 1: Check cookie for stored preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // Priority 2: Parse Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('Accept-Language');
  const browserLocale = parseAcceptLanguage(acceptLanguage);

  if (browserLocale) {
    return browserLocale;
  }

  // Priority 3: Return default locale
  return defaultLocale;
}

/**
 * Get the current locale from the request
 * Alias for detectLocale for semantic clarity
 */
export async function getCurrentLocale(): Promise<SupportedLocale> {
  return detectLocale();
}
```

**Verification:**
- Manual testing required as this uses Next.js server APIs
- Unit tests would require mocking `cookies()` and `headers()`

**Acceptance Criteria:**
- [ ] `detectLocale()` checks cookie first (priority 1)
- [ ] Falls back to Accept-Language header (priority 2)
- [ ] Falls back to default locale 'en' (priority 3)
- [ ] `getCurrentLocale()` alias exists and works

---

### Task 2.2.8: Create getRequestConfig for next-intl

**Type:** Code
**Complexity:** 1 point
**File to Modify:** `/src/lib/i18n/request.ts`

**Implementation Steps:**

1. Add the getRequestConfig export as the default:

```typescript
/**
 * next-intl request configuration
 *
 * This function is called by next-intl on each request to determine
 * the locale and load the appropriate messages.
 *
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#i18nts
 */
export default getRequestConfig(async () => {
  const locale = await detectLocale();

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
```

**Verification:**
```bash
# Verify TypeScript compilation
npx tsc --noEmit src/lib/i18n/request.ts
# Expected: No errors

# Verify message files exist for import
ls messages/
# Expected: en.json, fr.json, es.json, de.json, nl.json, it.json
```

**Acceptance Criteria:**
- [ ] Default export is `getRequestConfig()` function
- [ ] Calls `detectLocale()` to get current locale
- [ ] Dynamically imports messages from `/messages/{locale}.json`
- [ ] Returns object with `locale` and `messages` properties

---

### Task 2.2.9: Create Barrel Export File

**Type:** Code
**Complexity:** 1 point
**File to Create:** `/src/lib/i18n/index.ts`

**Implementation Steps:**

1. Create the index.ts barrel export file:

```typescript
/**
 * i18n Module Barrel Export
 *
 * Provides clean import paths for i18n utilities and configuration.
 *
 * Usage:
 *   import { locales, defaultLocale, isValidLocale } from '@/lib/i18n';
 *   import { detectLocale, getCurrentLocale } from '@/lib/i18n';
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

// Configuration exports (safe for client and server components)
export {
  locales,
  defaultLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  localeMetadata,
  i18nConfig,
  getLocaleMetadata,
  isValidLocale,
  normalizeLocale,
  getAllLocales,
  type SupportedLocale,
  type LocaleMetadata,
} from './config';

// Server-side detection exports
// Note: These are async functions and should only be used in Server Components
export { detectLocale, getCurrentLocale, parseAcceptLanguage } from './request';
```

**Verification:**
```typescript
// Test imports work
import {
  locales,
  defaultLocale,
  LOCALE_COOKIE_NAME,
  isValidLocale,
  normalizeLocale,
  getAllLocales,
  detectLocale,
  getCurrentLocale,
  type SupportedLocale,
} from '@/lib/i18n';

console.assert(locales.length === 6, 'locales exported');
console.assert(defaultLocale === 'en', 'defaultLocale exported');
console.assert(LOCALE_COOKIE_NAME === 'FAQBNB_LANG', 'LOCALE_COOKIE_NAME exported');
console.assert(typeof isValidLocale === 'function', 'isValidLocale exported');
console.assert(typeof normalizeLocale === 'function', 'normalizeLocale exported');
console.assert(typeof getAllLocales === 'function', 'getAllLocales exported');
console.assert(typeof detectLocale === 'function', 'detectLocale exported');
console.assert(typeof getCurrentLocale === 'function', 'getCurrentLocale exported');
```

**Acceptance Criteria:**
- [ ] All config exports re-exported from index.ts
- [ ] All request exports re-exported from index.ts
- [ ] Types (SupportedLocale, LocaleMetadata) are exported
- [ ] JSDoc comments document usage patterns

---

### Task 2.2.10: Verify TypeScript Compilation

**Type:** Verification
**Complexity:** 1 point
**Files to Verify:** All created files

**Implementation Steps:**

1. Run TypeScript compiler in check mode:
   ```bash
   npx tsc --noEmit
   ```

2. If errors exist, fix them before proceeding.

3. Verify path alias imports work:
   ```bash
   # Create a temporary test file
   cat > /tmp/test-i18n-imports.ts << 'EOF'
   import {
     locales,
     defaultLocale,
     isValidLocale,
     normalizeLocale,
     getAllLocales,
     LOCALE_COOKIE_NAME,
     type SupportedLocale,
   } from '@/lib/i18n';

   const locale: SupportedLocale = 'en';
   const valid: boolean = isValidLocale('fr');
   const normalized: SupportedLocale = normalizeLocale('en-US');
   const all = getAllLocales();

   console.log({ locales, defaultLocale, locale, valid, normalized, all, LOCALE_COOKIE_NAME });
   EOF
   ```

**Verification:**
```bash
npx tsc --noEmit
# Expected: 0 errors

npm run build
# Expected: Build completes successfully
```

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` reports 0 errors
- [ ] All imports resolve correctly with @/ path alias
- [ ] No circular dependency warnings

---

### Task 2.2.11: Build Verification and Final Checks

**Type:** Verification
**Complexity:** 1 point

**Implementation Steps:**

1. Run the full build:
   ```bash
   npm run build
   ```

2. Verify all files exist:
   ```bash
   ls -la src/lib/i18n/
   # Expected: config.ts, request.ts, index.ts
   ```

3. Run final verification checks:
   ```bash
   # Check file sizes are reasonable (not empty)
   wc -l src/lib/i18n/*.ts
   # Expected: Each file > 10 lines
   ```

**Verification Checklist:**
- [ ] `/src/lib/i18n/` directory exists
- [ ] `/src/lib/i18n/config.ts` exists and contains locale configuration
- [ ] `/src/lib/i18n/request.ts` exists and contains getRequestConfig
- [ ] `/src/lib/i18n/index.ts` exists and exports all items
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors

**Acceptance Criteria:**
- [ ] Build completes without errors
- [ ] All 3 files created in /src/lib/i18n/
- [ ] Files contain expected content (not empty)

---

## Complete File Contents

### File 1: /src/lib/i18n/config.ts

```typescript
/**
 * i18n Configuration Module
 *
 * Centralized locale configuration for the FAQBNB application.
 * Provides type-safe locale definitions and configuration constants.
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

/**
 * Supported locale codes as a const tuple
 * These are the language codes supported by the application.
 */
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

/**
 * Type representing a valid supported locale
 */
export type SupportedLocale = (typeof locales)[number];

/**
 * Default locale used when no preference is detected
 */
export const defaultLocale: SupportedLocale = 'en';

/**
 * Cookie name for storing language preference
 * Used by middleware and LanguageSwitcher component
 */
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * i18n configuration object for next-intl
 * Used by getRequestConfig and IntlProvider
 */
export const i18nConfig = {
  locales,
  defaultLocale,
  localePrefix: 'as-needed' as const,
} as const;

/**
 * Locale metadata including native names and optional flags
 */
export interface LocaleMetadata {
  /** ISO locale code */
  code: SupportedLocale;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Optional flag emoji */
  flag?: string;
}

/**
 * Complete locale metadata for all supported languages
 */
export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
};

/**
 * Type guard to check if a string is a valid supported locale
 * @param locale - The string to check
 * @returns True if the locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale);
}

/**
 * Normalize a locale code to a supported locale
 * Handles variations like 'en-US' -> 'en', 'fr-CA' -> 'fr'
 * @param locale - The locale string to normalize
 * @returns The normalized supported locale or default locale if not found
 */
export function normalizeLocale(locale: string | null | undefined): SupportedLocale {
  if (!locale) {
    return defaultLocale;
  }

  // Direct match
  if (isValidLocale(locale)) {
    return locale;
  }

  // Try extracting the language code (e.g., 'en-US' -> 'en')
  const languageCode = locale.split('-')[0]?.toLowerCase();
  if (languageCode && isValidLocale(languageCode)) {
    return languageCode;
  }

  return defaultLocale;
}

/**
 * Get locale metadata for a specific locale
 * @param locale - The locale code to get metadata for
 * @returns Locale metadata or undefined if not found
 */
export function getLocaleMetadata(locale: string): LocaleMetadata | undefined {
  if (isValidLocale(locale)) {
    return localeMetadata[locale];
  }
  return undefined;
}

/**
 * Get all supported locales as an array of LocaleMetadata
 * Useful for rendering language selectors
 * @returns Array of locale metadata
 */
export function getAllLocales(): LocaleMetadata[] {
  return locales.map((code) => localeMetadata[code]);
}
```

### File 2: /src/lib/i18n/request.ts

```typescript
/**
 * Server-Side Locale Detection
 *
 * Provides the getRequestConfig function required by next-intl for
 * server-side locale detection and message loading.
 *
 * Detection Priority:
 * 1. FAQBNB_LANG cookie (persisted preference)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale ('en')
 *
 * Note: User database preference syncing is handled by middleware (Task 5.2)
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import {
  defaultLocale,
  isValidLocale,
  normalizeLocale,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from './config';

/**
 * Parse Accept-Language header and find the best matching locale
 *
 * Parses the standard Accept-Language header format:
 * "en-US,en;q=0.9,fr;q=0.8" -> sorted by quality value
 *
 * @param acceptLanguage - The Accept-Language header value
 * @returns The best matching supported locale or null if none found
 */
export function parseAcceptLanguage(acceptLanguage: string | null): SupportedLocale | null {
  if (!acceptLanguage) {
    return null;
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fr;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .filter(({ quality }) => !isNaN(quality))
    .sort((a, b) => b.quality - a.quality);

  // Find the first matching supported locale
  for (const { code } of languages) {
    const baseCode = code.split('-')[0]?.toLowerCase();
    if (baseCode && isValidLocale(baseCode)) {
      return normalizeLocale(code);
    }
  }

  return null;
}

/**
 * Detect the locale from the current request
 *
 * Priority order:
 * 1. Cookie (FAQBNB_LANG) - persisted preference
 * 2. Accept-Language header - browser preference
 * 3. Default locale - fallback
 *
 * Note: User database preference is not checked here as it requires
 * database access. The middleware (Task 5.2) will handle syncing
 * the user's database preference to the cookie.
 *
 * @returns The detected locale
 */
export async function detectLocale(): Promise<SupportedLocale> {
  // Priority 1: Check cookie for stored preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // Priority 2: Parse Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('Accept-Language');
  const browserLocale = parseAcceptLanguage(acceptLanguage);

  if (browserLocale) {
    return browserLocale;
  }

  // Priority 3: Return default locale
  return defaultLocale;
}

/**
 * Get the current locale from the request
 * Alias for detectLocale for semantic clarity
 */
export async function getCurrentLocale(): Promise<SupportedLocale> {
  return detectLocale();
}

/**
 * next-intl request configuration
 *
 * This function is called by next-intl on each request to determine
 * the locale and load the appropriate messages.
 *
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#i18nts
 */
export default getRequestConfig(async () => {
  const locale = await detectLocale();

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
```

### File 3: /src/lib/i18n/index.ts

```typescript
/**
 * i18n Module Barrel Export
 *
 * Provides clean import paths for i18n utilities and configuration.
 *
 * Usage:
 *   import { locales, defaultLocale, isValidLocale } from '@/lib/i18n';
 *   import { detectLocale, getCurrentLocale } from '@/lib/i18n';
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

// Configuration exports (safe for client and server components)
export {
  locales,
  defaultLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  localeMetadata,
  i18nConfig,
  getLocaleMetadata,
  isValidLocale,
  normalizeLocale,
  getAllLocales,
  type SupportedLocale,
  type LocaleMetadata,
} from './config';

// Server-side detection exports
// Note: These are async functions and should only be used in Server Components
export { detectLocale, getCurrentLocale, parseAcceptLanguage } from './request';
```

---

## Implementation Order Summary

| Order | Task ID | Description | Dependencies |
|-------|---------|-------------|--------------|
| 1 | 2.2.1 | Create i18n directory | None |
| 2 | 2.2.2 | Create TypeScript types | 2.2.1 |
| 3 | 2.2.3 | Add locale constants | 2.2.2 |
| 4 | 2.2.4 | Add locale metadata | 2.2.3 |
| 5 | 2.2.5 | Add utility functions | 2.2.4 |
| 6 | 2.2.6 | Create Accept-Language parser | 2.2.5 |
| 7 | 2.2.7 | Create detectLocale function | 2.2.6 |
| 8 | 2.2.8 | Create getRequestConfig | 2.2.7 |
| 9 | 2.2.9 | Create barrel export file | 2.2.8 |
| 10 | 2.2.10 | TypeScript verification | 2.2.9 |
| 11 | 2.2.11 | Build verification | 2.2.10 |

---

## Acceptance Criteria Summary (from REQ-230)

| Criteria | Task(s) | Status |
|----------|---------|--------|
| Configuration module exists with all supported locale codes | 2.2.2, 2.2.3 | Pending |
| Default locale explicitly defined ('en') | 2.2.3 | Pending |
| Server-side request handling includes locale detection | 2.2.7, 2.2.8 | Pending |
| Locale detection considers user preferences (via cookie) | 2.2.7 | Pending |
| Falls back to Accept-Language headers | 2.2.6, 2.2.7 | Pending |
| Detected locale accessible throughout request pipeline | 2.2.8, 2.2.9 | Pending |
| Configuration importable across application | 2.2.9 | Pending |

---

## Post-Implementation Tasks

After completing Task 2.2, the following tasks become unblocked:

1. **Task 2.3:** Update next.config.ts for i18n - reference request.ts in plugin config
2. **Task 2.4:** Create IntlProvider wrapper - use config.ts locale configuration
3. **Task 5.1:** Create language detection utility - extend config.ts patterns
4. **Task 5.2:** Update middleware - use LOCALE_COOKIE_NAME constant
5. **Task 5.3:** Create LanguageSwitcher - use getAllLocales() function

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Message files not found | Verify /messages/ directory exists before starting |
| TypeScript path alias issues | Use existing @/lib/ pattern from codebase |
| next-intl API changes | Check next-intl documentation for App Router |
| Cookie access errors | Graceful fallback to Accept-Language/default |

---

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl App Router Setup](https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing)
- [REQ-230 Overview Document](./REQ-230-create-i18n-configuration-module-overview.md)
- [Implementation Plan](./prd/Plan-110-L10N-Epic1-Foundation.md)
- [PRD: L10N Epic 1](./prd/PRD_L10N_Epic1_Foundation.md)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.2*
*Generated by AI Assistant on 2026-01-18*
