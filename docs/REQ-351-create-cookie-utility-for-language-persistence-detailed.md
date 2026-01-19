# REQ-351: Create Cookie Utility for Guest Language Persistence - Detailed Task Breakdown

**Created:** 2026-01-19 21:45 UTC
**Last Modified:** 2026-01-19 21:45 UTC
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 4 - Guest Language Hook
**Task ID:** 4.2
**Overview Document:** REQ-351-create-cookie-utility-for-language-persistence-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## Executive Summary

This document provides granular, actionable implementation tasks for creating a dedicated cookie utility module for guest language persistence. The module will manage the `FAQBNB_GUEST_LANG` cookie separately from the authenticated user cookie (`FAQBNB_LANG`), enabling unauthenticated guests who scan QR codes to have their language preference remembered across browser sessions.

---

## Prerequisites Verification

Before starting implementation, verify these dependencies are in place:

| Dependency | Location | Status Check |
|------------|----------|--------------|
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | `grep "SupportedLocale" src/lib/i18n/config.ts` |
| `isSupportedLocale` function | `/src/lib/i18n/config.ts` | `grep "isSupportedLocale" src/lib/i18n/config.ts` |
| `DEFAULT_LOCALE` constant | `/src/lib/i18n/config.ts` | `grep "DEFAULT_LOCALE" src/lib/i18n/config.ts` |
| i18n barrel exports | `/src/lib/i18n/index.ts` | File exists and exports config items |

---

## Task Breakdown

### Task 1: Add Guest Cookie Constants to Config Module

**File:** `/src/lib/i18n/config.ts`
**Story Points:** 0.5
**Estimated Time:** 10 minutes

#### 1.1 Add Guest Cookie Name Constant

**Location:** After line 53 (after `LOCALE_COOKIE_MAX_AGE` definition)

**Code to Add:**
```typescript
/**
 * Cookie name for storing GUEST language preference.
 * Separate from authenticated user cookie (FAQBNB_LANG) to avoid conflicts.
 * Used by guest QR code pages for language persistence without authentication.
 *
 * REQ-351: Create Cookie Utility for Guest Language Persistence
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
```

#### 1.2 Add Guest Cookie Max Age Constant

**Location:** Immediately after the constant added in 1.1

**Code to Add:**
```typescript
/**
 * Guest cookie max age in seconds (1 year = 365 days).
 * Long-term persistence ensures returning guests see their preferred language.
 *
 * REQ-351: Create Cookie Utility for Guest Language Persistence
 */
export const GUEST_LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

#### 1.3 Verification Steps
- [ ] Run `grep "GUEST_LOCALE_COOKIE_NAME" src/lib/i18n/config.ts` - should return the new constant
- [ ] Run `grep "GUEST_LOCALE_COOKIE_MAX_AGE" src/lib/i18n/config.ts` - should return the new constant
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

---

### Task 2: Create Guest Language Utility Module

**File:** `/src/lib/i18n/guest-language.ts` (NEW FILE)
**Story Points:** 2
**Estimated Time:** 30 minutes

#### 2.1 Create File with Module Header

**Create new file at:** `/src/lib/i18n/guest-language.ts`

**Code:**
```typescript
/**
 * Guest Language Utility Module
 *
 * Dedicated cookie management for unauthenticated guest users who access
 * content via QR codes. Provides secure, long-term language preference
 * persistence without requiring authentication.
 *
 * This module is separate from the authenticated user language utilities
 * (language-detection.ts) to maintain clean separation of concerns:
 * - Authenticated users: FAQBNB_LANG cookie, API persistence
 * - Guest users: FAQBNB_GUEST_LANG cookie, cookie-only persistence
 *
 * REQ-351: Create Cookie Utility for Guest Language Persistence
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 4, Task 4.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from './config';
```

#### 2.2 Add Client-Side Cookie Write Function

**Location:** After imports

**Code:**
```typescript
// =============================================================================
// Client-Side Cookie Utilities
// =============================================================================

/**
 * Set the guest language preference cookie (client-side).
 *
 * Cookie properties:
 * - Name: FAQBNB_GUEST_LANG
 * - Max-Age: 1 year (365 days)
 * - Path: / (site-wide availability)
 * - Secure: true in production (HTTPS-only)
 * - SameSite: Lax (balance security with cross-site QR navigation)
 * - HttpOnly: false (allows client-side language switcher access)
 *
 * @param language - Valid supported locale code to persist
 * @returns void
 * @throws Never throws - fails silently with console warning for invalid input
 *
 * @example
 * // In GuestLanguageSwitcher component
 * import { setGuestLanguageCookie } from '@/lib/i18n';
 *
 * const handleLanguageChange = (newLang: SupportedLocale) => {
 *   setGuestLanguageCookie(newLang);
 *   // Update UI state
 * };
 */
export function setGuestLanguageCookie(language: SupportedLocale): void {
  // Guard: Server-side rendering check
  if (typeof document === 'undefined') {
    console.warn(
      '[i18n] setGuestLanguageCookie called on server - use setGuestLanguageCookieOnResponse instead'
    );
    return;
  }

  // Guard: Validate language code
  if (!isSupportedLocale(language)) {
    console.warn('[i18n] Attempted to set invalid guest language:', language);
    return;
  }

  // Determine secure flag based on protocol
  const isSecure =
    typeof window !== 'undefined' && window.location.protocol === 'https:';

  // Calculate expiration date
  const expires = new Date();
  expires.setTime(expires.getTime() + GUEST_LOCALE_COOKIE_MAX_AGE * 1000);

  // Build cookie string with all attributes
  const cookieParts = [
    `${GUEST_LOCALE_COOKIE_NAME}=${language}`,
    'path=/',
    `expires=${expires.toUTCString()}`,
    'SameSite=Lax',
  ];

  // Add Secure flag only in HTTPS context
  if (isSecure) {
    cookieParts.push('Secure');
  }

  // Set the cookie
  document.cookie = cookieParts.join('; ');
  console.log('[i18n] Guest language cookie set:', language);
}
```

#### 2.3 Add Client-Side Cookie Read Function

**Location:** After `setGuestLanguageCookie`

**Code:**
```typescript
/**
 * Get the guest language preference from cookie (client-side).
 *
 * Reads and validates the FAQBNB_GUEST_LANG cookie value.
 * Returns null for missing, expired, or invalid cookie values.
 *
 * @returns The guest's preferred language if valid, null otherwise
 *
 * @example
 * // In useGuestLanguage hook
 * import { getGuestLanguageCookie } from '@/lib/i18n';
 *
 * useEffect(() => {
 *   const savedLang = getGuestLanguageCookie();
 *   if (savedLang) {
 *     setLanguage(savedLang);
 *   }
 * }, []);
 */
export function getGuestLanguageCookie(): SupportedLocale | null {
  // Guard: Server-side rendering check
  if (typeof document === 'undefined') {
    return null;
  }

  // Parse cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === GUEST_LOCALE_COOKIE_NAME) {
      const trimmedValue = value?.trim();
      // Validate against supported locales
      if (trimmedValue && isSupportedLocale(trimmedValue)) {
        return trimmedValue;
      }
    }
  }

  return null;
}
```

#### 2.4 Add Client-Side Cookie Clear Function

**Location:** After `getGuestLanguageCookie`

**Code:**
```typescript
/**
 * Clear the guest language preference cookie (client-side).
 *
 * Removes the FAQBNB_GUEST_LANG cookie by setting it to expire in the past.
 * Useful for resetting to default behavior or when user explicitly
 * wants to clear their preference.
 *
 * @returns void
 *
 * @example
 * // In settings or reset functionality
 * import { clearGuestLanguageCookie } from '@/lib/i18n';
 *
 * const handleResetPreferences = () => {
 *   clearGuestLanguageCookie();
 *   // Reload to detect language fresh
 * };
 */
export function clearGuestLanguageCookie(): void {
  // Guard: Server-side rendering check
  if (typeof document === 'undefined') {
    return;
  }

  // Set cookie with past expiration to delete it
  document.cookie = `${GUEST_LOCALE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  console.log('[i18n] Guest language cookie cleared');
}
```

#### 2.5 Add Server-Side Cookie Write Function

**Location:** After client-side utilities section

**Code:**
```typescript
// =============================================================================
// Server-Side Cookie Utilities (Next.js)
// =============================================================================

/**
 * Set the guest language cookie on a Next.js response (server-side).
 *
 * Use this in middleware or API routes to persist guest language preference
 * when detected from URL parameters or Accept-Language headers.
 *
 * @param response - NextResponse object to modify
 * @param language - Valid supported locale code to set
 * @returns void
 *
 * @example
 * // In middleware.ts
 * import { setGuestLanguageCookieOnResponse, detectGuestLanguage } from '@/lib/i18n';
 *
 * export function middleware(request: NextRequest) {
 *   const response = NextResponse.next();
 *   const lang = detectGuestLanguage(request, request.nextUrl.searchParams.get('lang'));
 *   setGuestLanguageCookieOnResponse(response, lang);
 *   return response;
 * }
 */
export function setGuestLanguageCookieOnResponse(
  response: NextResponse,
  language: SupportedLocale
): void {
  // Guard: Validate language code
  if (!isSupportedLocale(language)) {
    console.warn(
      '[i18n] Attempted to set invalid guest language on response:',
      language
    );
    return;
  }

  // Set cookie using Next.js cookies API
  response.cookies.set({
    name: GUEST_LOCALE_COOKIE_NAME,
    value: language,
    maxAge: GUEST_LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side access for language switcher
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  console.log('[i18n] Guest language cookie set on response:', language);
}
```

#### 2.6 Add Server-Side Cookie Read Function

**Location:** After `setGuestLanguageCookieOnResponse`

**Code:**
```typescript
/**
 * Read the guest language cookie from a Next.js request (server-side).
 *
 * Use this in server components or middleware to retrieve the guest's
 * persisted language preference.
 *
 * @param request - NextRequest object to read from
 * @returns The guest's preferred language if valid, null otherwise
 *
 * @example
 * // In server component
 * import { getGuestLanguageFromRequest } from '@/lib/i18n';
 *
 * export default async function Page({ request }: { request: NextRequest }) {
 *   const guestLang = getGuestLanguageFromRequest(request);
 *   // Use guestLang for content fetching
 * }
 */
export function getGuestLanguageFromRequest(
  request: NextRequest
): SupportedLocale | null {
  const cookieValue = request.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}
```

#### 2.7 Add Accept-Language Header Parser Helper

**Location:** After server-side utilities section

**Code:**
```typescript
// =============================================================================
// Guest Language Detection (Server-Side)
// =============================================================================

/**
 * Parse Accept-Language header and return language codes sorted by preference.
 *
 * Handles RFC 7231 Accept-Language header format:
 * Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
 *
 * @param acceptLanguage - Accept-Language header value (may be null)
 * @returns Array of primary language codes sorted by quality (highest first)
 *
 * @internal
 */
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) {
    return [];
  }

  interface LanguageQuality {
    locale: string;
    quality: number;
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

#### 2.8 Add Main Detection Function

**Location:** After `parseAcceptLanguageHeader`

**Code:**
```typescript
/**
 * Detect guest's preferred language using prioritized cascade.
 *
 * Priority Order:
 * 1. URL parameter (?lang=fr) - enables shareable translated links
 * 2. FAQBNB_GUEST_LANG cookie - persisted preference from previous visit
 * 3. Accept-Language header - browser/OS language preference
 * 4. Default locale ('en') - fallback when no preference detected
 *
 * This function is designed specifically for guest (unauthenticated) users
 * accessing content via QR codes. For authenticated users, use the
 * `detectUserLanguage` function from language-detection.ts instead.
 *
 * @param request - NextRequest object (for cookie and header access)
 * @param urlParam - Optional URL parameter value (e.g., from ?lang=fr)
 * @returns Detected supported locale (always returns a valid locale)
 *
 * @example
 * // In page.tsx server component
 * import { detectGuestLanguage } from '@/lib/i18n';
 *
 * export default async function ItemPage({
 *   params,
 *   searchParams
 * }: {
 *   params: Promise<{ publicId: string }>;
 *   searchParams: Promise<{ lang?: string }>;
 * }) {
 *   const { lang } = await searchParams;
 *   const guestLanguage = detectGuestLanguage(request, lang);
 *   // Fetch translated content using guestLanguage
 * }
 *
 * @example
 * // In middleware.ts
 * import { detectGuestLanguage } from '@/lib/i18n';
 *
 * export function middleware(request: NextRequest) {
 *   const langParam = request.nextUrl.searchParams.get('lang');
 *   const guestLang = detectGuestLanguage(request, langParam);
 *   // Use guestLang for response handling
 * }
 */
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
  // Priority 1: URL parameter (enables shareable translated links)
  if (urlParam && isSupportedLocale(urlParam)) {
    console.log('[i18n] Guest language from URL param:', urlParam);
    return urlParam;
  }

  // Priority 2: Guest cookie (persisted preference)
  const cookieLocale = getGuestLanguageFromRequest(request);
  if (cookieLocale) {
    console.log('[i18n] Guest language from cookie:', cookieLocale);
    return cookieLocale;
  }

  // Priority 3: Accept-Language header (browser preference)
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    if (isSupportedLocale(locale)) {
      console.log('[i18n] Guest language from Accept-Language:', locale);
      return locale;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n] Using default locale for guest:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

#### 2.9 Verification Steps
- [ ] File exists at `/src/lib/i18n/guest-language.ts`
- [ ] Run `npx tsc --noEmit` - no TypeScript errors
- [ ] Run `grep "FAQBNB_GUEST_LANG" src/lib/i18n/guest-language.ts` - should return uses of constant
- [ ] Module exports 6 functions: `setGuestLanguageCookie`, `getGuestLanguageCookie`, `clearGuestLanguageCookie`, `setGuestLanguageCookieOnResponse`, `getGuestLanguageFromRequest`, `detectGuestLanguage`

---

### Task 3: Update Barrel Exports in Index File

**File:** `/src/lib/i18n/index.ts`
**Story Points:** 0.5
**Estimated Time:** 5 minutes

#### 3.1 Add Guest Cookie Constants Export

**Location:** Inside the config exports block (around line 20-40)

**Add to existing export block from './config':**
```typescript
export {
  // ... existing exports ...
  // Guest Cookie constants (REQ-351)
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
} from './config';
```

#### 3.2 Add Guest Language Module Exports

**Location:** After the language-detection exports (end of file)

**Code to Add:**
```typescript
// Guest Language utilities (REQ-351: Cookie Utility for Guest Language Persistence)
export {
  // Client-side utilities
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  clearGuestLanguageCookie,
  // Server-side utilities
  setGuestLanguageCookieOnResponse,
  getGuestLanguageFromRequest,
  // Detection function
  detectGuestLanguage,
} from './guest-language';
```

#### 3.3 Verification Steps
- [ ] Run `grep "guest-language" src/lib/i18n/index.ts` - should show import
- [ ] Run `grep "GUEST_LOCALE_COOKIE" src/lib/i18n/index.ts` - should show exports
- [ ] Run `npx tsc --noEmit` - no TypeScript errors
- [ ] Test import: Create temp file with `import { setGuestLanguageCookie, detectGuestLanguage } from '@/lib/i18n';`

---

### Task 4: Verify TypeScript Types and Module Compatibility

**Story Points:** 0.5
**Estimated Time:** 5 minutes

#### 4.1 Verify Type Exports

Run the following verification commands:

```bash
# Verify SupportedLocale type is accessible
grep -n "type SupportedLocale" src/lib/i18n/config.ts

# Verify isSupportedLocale function is exported
grep -n "export function isSupportedLocale" src/lib/i18n/config.ts

# Verify all guest-language functions have proper return types
grep -n "): SupportedLocale" src/lib/i18n/guest-language.ts
grep -n "): void" src/lib/i18n/guest-language.ts
```

#### 4.2 Run TypeScript Compilation Check

```bash
npx tsc --noEmit
```

Expected: No errors

#### 4.3 Test Module Resolution

Create a temporary test file to verify imports work:

```typescript
// temp-test-imports.ts (delete after verification)
import {
  // Constants
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
  // Client-side
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  clearGuestLanguageCookie,
  // Server-side
  setGuestLanguageCookieOnResponse,
  getGuestLanguageFromRequest,
  detectGuestLanguage,
  // Types
  type SupportedLocale,
} from '@/lib/i18n';

// Verify types work
const locale: SupportedLocale = 'fr';
console.log(GUEST_LOCALE_COOKIE_NAME, GUEST_LOCALE_COOKIE_MAX_AGE, locale);
```

Run: `npx tsc temp-test-imports.ts --noEmit`

Delete temp file after verification.

---

## Complete File Listings

### File 1: `/src/lib/i18n/config.ts` (Additions Only)

Add after line 53 (after `LOCALE_COOKIE_MAX_AGE`):

```typescript
/**
 * Cookie name for storing GUEST language preference.
 * Separate from authenticated user cookie (FAQBNB_LANG) to avoid conflicts.
 * Used by guest QR code pages for language persistence without authentication.
 *
 * REQ-351: Create Cookie Utility for Guest Language Persistence
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Guest cookie max age in seconds (1 year = 365 days).
 * Long-term persistence ensures returning guests see their preferred language.
 *
 * REQ-351: Create Cookie Utility for Guest Language Persistence
 */
export const GUEST_LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

### File 2: `/src/lib/i18n/index.ts` (Full Updated File)

```typescript
/**
 * i18n Module Exports
 * Centralized exports for internationalization utilities.
 *
 * Usage:
 *   import { locales, defaultLocale, isValidLocale } from '@/lib/i18n';
 *   import { detectUserLanguage, setLocaleCookie } from '@/lib/i18n';
 *   import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from '@/lib/i18n';
 *   import { setGuestLanguageCookie, detectGuestLanguage } from '@/lib/i18n';
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * REQ-246: Create Language Detection Utility
 * REQ-351: Create Cookie Utility for Guest Language Persistence
 * Plan-110: L10N Epic 1 - Foundation
 * Plan-111: L10N Epic 4 - Guest Experience
 *
 * @module lib/i18n
 * @created 2026-01-18
 * @lastModified 2026-01-19
 */

// Configuration exports (safe for client and server components)
export {
  // Original exports
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
  // REQ-246 aliases for language detection
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_DISPLAY_NAMES,
  isSupportedLocale,
  // REQ-351: Guest cookie constants
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
  // Types
  type SupportedLocale,
  type LocaleMetadata,
} from './config';

// Language Detection exports (REQ-246)
export {
  detectUserLanguage,
  setLocaleCookie,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from './language-detection';

// Guest Language utilities (REQ-351: Cookie Utility for Guest Language Persistence)
export {
  // Client-side utilities
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  clearGuestLanguageCookie,
  // Server-side utilities
  setGuestLanguageCookieOnResponse,
  getGuestLanguageFromRequest,
  // Detection function
  detectGuestLanguage,
} from './guest-language';
```

---

## Acceptance Criteria Verification

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | Cookie utility module exists at `/src/lib/i18n/guest-language.ts` | `ls -la src/lib/i18n/guest-language.ts` |
| 2 | Module exports `setGuestLanguageCookie` function | `grep "export function setGuestLanguageCookie" src/lib/i18n/guest-language.ts` |
| 3 | Module exports `getGuestLanguageCookie` function | `grep "export function getGuestLanguageCookie" src/lib/i18n/guest-language.ts` |
| 4 | Cookie is named exactly `FAQBNB_GUEST_LANG` | `grep "FAQBNB_GUEST_LANG" src/lib/i18n/config.ts` |
| 5 | Cookie expiration is 1 year | `grep "365 * 24 * 60 * 60" src/lib/i18n/config.ts` |
| 6 | Cookie includes `Secure` flag in production | `grep "secure:" src/lib/i18n/guest-language.ts` |
| 7 | Cookie includes `SameSite=Lax` | `grep "sameSite.*lax" src/lib/i18n/guest-language.ts` |
| 8 | Read function returns language code when valid | Unit test |
| 9 | Read function returns null when invalid/missing | Unit test |
| 10 | Server-side utilities work with Next.js | `grep "NextRequest" src/lib/i18n/guest-language.ts` |
| 11 | `detectGuestLanguage` follows priority order | Code review: URL > Cookie > Header > default |
| 12 | All utilities exported through barrel file | `grep "guest-language" src/lib/i18n/index.ts` |

---

## Testing Plan

### Unit Test Cases

Create test file at `/src/lib/i18n/__tests__/guest-language.test.ts`:

```typescript
// Test file structure (implementation in separate testing task)
describe('Guest Language Cookie Utilities', () => {
  describe('setGuestLanguageCookie', () => {
    it('should set cookie with correct name');
    it('should set 1-year expiry');
    it('should validate language before setting');
    it('should warn when called on server');
    it('should include Secure flag in HTTPS');
    it('should include SameSite=Lax');
  });

  describe('getGuestLanguageCookie', () => {
    it('should return valid language from cookie');
    it('should return null for missing cookie');
    it('should return null for invalid language value');
    it('should return null on server');
  });

  describe('clearGuestLanguageCookie', () => {
    it('should remove the cookie');
    it('should handle already-cleared cookie');
  });

  describe('detectGuestLanguage', () => {
    it('should prioritize URL param over cookie');
    it('should prioritize cookie over Accept-Language');
    it('should parse Accept-Language correctly');
    it('should fall back to default locale');
    it('should handle malformed Accept-Language');
  });
});
```

### Manual Testing Checklist

1. **Cookie Write Test:**
   - [ ] Open browser DevTools > Application > Cookies
   - [ ] Call `setGuestLanguageCookie('fr')` from console
   - [ ] Verify `FAQBNB_GUEST_LANG` cookie appears
   - [ ] Verify cookie value is `fr`
   - [ ] Verify expiration is ~1 year from now
   - [ ] Verify path is `/`

2. **Cookie Read Test:**
   - [ ] With cookie set, call `getGuestLanguageCookie()` from console
   - [ ] Verify return value matches cookie
   - [ ] Clear cookie manually
   - [ ] Verify `getGuestLanguageCookie()` returns `null`

3. **Cookie Clear Test:**
   - [ ] Set cookie using `setGuestLanguageCookie('de')`
   - [ ] Call `clearGuestLanguageCookie()`
   - [ ] Verify cookie is removed from DevTools

4. **Cross-Session Persistence Test:**
   - [ ] Set language preference
   - [ ] Close browser completely
   - [ ] Reopen and navigate to guest page
   - [ ] Verify language preference is remembered

---

## Implementation Order

Execute tasks in this order:

1. **Task 1:** Add constants to config (Task 1.1, 1.2, 1.3)
2. **Task 2:** Create guest-language.ts module (Tasks 2.1-2.9)
3. **Task 3:** Update barrel exports (Tasks 3.1, 3.2, 3.3)
4. **Task 4:** Verify TypeScript and module compatibility (Tasks 4.1-4.3)

---

## Dependencies and Downstream Impact

### This Task Depends On:
- Epic 1 Foundation: i18n config module with `SupportedLocale` type

### Tasks That Depend On This:
| Task | File | How It Uses This Module |
|------|------|-------------------------|
| Task 4.1: useGuestLanguage hook | `/src/hooks/useGuestLanguage.ts` | Uses `setGuestLanguageCookie`, `getGuestLanguageCookie` |
| Task 5.1: Update guest item page | `/src/app/item/[publicId]/page.tsx` | Uses `detectGuestLanguage` |
| Task 6.1: Middleware update | `/src/middleware.ts` | Uses `detectGuestLanguage`, `setGuestLanguageCookieOnResponse` |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cookie blocked by browser privacy settings | Low | Low | Graceful degradation - re-detect on each visit |
| Cookie name conflict with existing `FAQBNB_LANG` | None | N/A | Using separate name `FAQBNB_GUEST_LANG` |
| Secure flag breaks local development | Low | Low | Only enable Secure in production |
| Invalid locale stored in cookie | Low | Low | Validation on read returns null |

---

## References

- **Overview Document:** `docs/REQ-351-create-cookie-utility-for-language-persistence-overview.md`
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 4, Task 4.2)
- **Requirements:** `docs/gen_requests_epic4.md` (Request #351)
- **Existing Pattern:** `src/lib/i18n/language-detection.ts` (authenticated user detection)
- **Existing Pattern:** `src/hooks/useLanguagePreference.ts` (client-side cookie handling)
- **Epic 1 Config:** `src/lib/i18n/config.ts` (locale types and constants)
