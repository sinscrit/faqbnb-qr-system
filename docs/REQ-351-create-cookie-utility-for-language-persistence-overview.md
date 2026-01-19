# REQ-351: Create Cookie Utility for Guest Language Persistence

**Created:** 2026-01-19 21:15 UTC
**Last Modified:** 2026-01-19 21:15 UTC
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 4 - Guest Language Hook
**Task ID:** 4.2
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## Summary

Create a dedicated utility module for managing guest language preference cookies with proper security settings and long-term persistence. This module will be specifically designed for unauthenticated guest users who scan QR codes and view content, enabling seamless language preference persistence across browser sessions without requiring authentication.

---

## Current Behavior

- The existing `language-detection.ts` module handles authenticated user language detection with cookie `FAQBNB_LANG`
- The `useLanguagePreference.ts` hook manages language persistence for both authenticated and guest users but combines multiple concerns
- No dedicated guest-specific cookie utility exists for the `FAQBNB_GUEST_LANG` cookie specified in the implementation plan
- Guest users cannot persist their language selection across sessions independently of the authenticated user flow
- The current middleware focuses on authenticated routes and doesn't specifically handle guest QR code access routes (`/item/*`)

---

## Expected Behavior

A utility module at `/src/lib/i18n/guest-language.ts` that provides:

1. **Write Function** (`setGuestLanguageCookie`):
   - Sets cookie named exactly `FAQBNB_GUEST_LANG`
   - 1-year expiry (365 days)
   - `Secure` flag for HTTPS-only transmission (production)
   - `SameSite=Lax` for cross-site compatibility while maintaining security
   - `Path=/` for site-wide availability

2. **Read Function** (`getGuestLanguageCookie`):
   - Reads the guest language preference from the cookie
   - Returns validated language code if cookie exists and is valid
   - Returns `null` if cookie doesn't exist, is expired, or contains invalid value

3. **Server-Side Detection** (`detectGuestLanguage`):
   - Priority: URL param > Cookie > Accept-Language header > default
   - Compatible with Next.js middleware and server components

---

## Technical Approach

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cookie Name | `FAQBNB_GUEST_LANG` | Separate from authenticated user cookie (`FAQBNB_LANG`) to avoid conflicts |
| Cookie Expiry | 1 year | Long-term persistence for returning guests |
| HttpOnly Flag | `false` | Client-side JavaScript needs access for language switcher |
| Secure Flag | Production-only | Allow local development over HTTP |
| SameSite | `Lax` | Balance security with cross-site navigation (QR code redirects) |

### Existing Patterns to Follow

1. **Config Module Pattern** (`/src/lib/i18n/config.ts`):
   - Export constants (`GUEST_LOCALE_COOKIE_NAME`, `GUEST_LOCALE_COOKIE_MAX_AGE`)
   - Use existing `SupportedLocale` type
   - Export through barrel file (`/src/lib/i18n/index.ts`)

2. **Language Detection Pattern** (`/src/lib/i18n/language-detection.ts`):
   - Function signature: `detectGuestLanguage(request: NextRequest, urlParam?: string): SupportedLocale`
   - Use `isSupportedLocale` type guard for validation
   - Consistent logging with `[i18n]` prefix

3. **Cookie Utility Pattern** (`/src/hooks/useLanguagePreference.ts`):
   - Client-side cookie setting pattern with `document.cookie`
   - Type-safe validation before setting

---

## Implementation Tasks

### Task 1: Add Guest Cookie Constants to Config (10 min)

**File:** `/src/lib/i18n/config.ts`

Add new constants for guest-specific cookie management:

```typescript
/**
 * Cookie name for storing GUEST language preference
 * Separate from authenticated user cookie (FAQBNB_LANG)
 * Used by guest QR code pages for language persistence
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Guest cookie max age in seconds (1 year)
 */
export const GUEST_LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

---

### Task 2: Create Guest Language Utility Module (30 min)

**File:** `/src/lib/i18n/guest-language.ts` (NEW)

```typescript
/**
 * Guest Language Utility Module
 *
 * Dedicated cookie management for unauthenticated guest users who access
 * content via QR codes. Provides secure, long-term language preference
 * persistence without requiring authentication.
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

// =============================================================================
// Client-Side Cookie Utilities
// =============================================================================

/**
 * Set the guest language preference cookie (client-side).
 *
 * Cookie properties:
 * - Name: FAQBNB_GUEST_LANG
 * - Max-Age: 1 year
 * - Path: / (site-wide)
 * - Secure: true in production
 * - SameSite: Lax
 *
 * @param language - Valid supported locale code
 * @returns void
 *
 * @example
 * setGuestLanguageCookie('fr');
 */
export function setGuestLanguageCookie(language: SupportedLocale): void {
  if (typeof document === 'undefined') {
    console.warn('[i18n] setGuestLanguageCookie called on server - use setGuestLanguageCookieOnResponse instead');
    return;
  }

  if (!isSupportedLocale(language)) {
    console.warn('[i18n] Attempted to set invalid guest language:', language);
    return;
  }

  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const expires = new Date();
  expires.setTime(expires.getTime() + GUEST_LOCALE_COOKIE_MAX_AGE * 1000);

  const cookieParts = [
    `${GUEST_LOCALE_COOKIE_NAME}=${language}`,
    'path=/',
    `expires=${expires.toUTCString()}`,
    'SameSite=Lax',
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  document.cookie = cookieParts.join('; ');
  console.log('[i18n] Guest language cookie set:', language);
}

/**
 * Get the guest language preference from cookie (client-side).
 *
 * @returns The guest's preferred language if valid, null otherwise
 *
 * @example
 * const guestLang = getGuestLanguageCookie();
 * if (guestLang) {
 *   console.log('Guest prefers:', guestLang);
 * }
 */
export function getGuestLanguageCookie(): SupportedLocale | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === GUEST_LOCALE_COOKIE_NAME) {
      const trimmedValue = value?.trim();
      if (trimmedValue && isSupportedLocale(trimmedValue)) {
        return trimmedValue;
      }
    }
  }

  return null;
}

/**
 * Clear the guest language preference cookie (client-side).
 * Useful for resetting to default behavior.
 */
export function clearGuestLanguageCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${GUEST_LOCALE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  console.log('[i18n] Guest language cookie cleared');
}

// =============================================================================
// Server-Side Cookie Utilities (Next.js)
// =============================================================================

/**
 * Set the guest language cookie on a Next.js response (server-side).
 *
 * @param response - NextResponse to modify
 * @param language - Valid supported locale code
 *
 * @example
 * // In middleware or API route
 * const response = NextResponse.next();
 * setGuestLanguageCookieOnResponse(response, 'de');
 * return response;
 */
export function setGuestLanguageCookieOnResponse(
  response: NextResponse,
  language: SupportedLocale
): void {
  if (!isSupportedLocale(language)) {
    console.warn('[i18n] Attempted to set invalid guest language on response:', language);
    return;
  }

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

/**
 * Read the guest language cookie from a Next.js request (server-side).
 *
 * @param request - NextRequest to read from
 * @returns The guest's preferred language if valid, null otherwise
 */
export function getGuestLanguageFromRequest(request: NextRequest): SupportedLocale | null {
  const cookieValue = request.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}

// =============================================================================
// Guest Language Detection (Server-Side)
// =============================================================================

/**
 * Parse Accept-Language header and return language codes sorted by preference.
 *
 * @param acceptLanguage - Accept-Language header value
 * @returns Array of language codes sorted by quality (highest first)
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
      const primaryCode = code.split('-')[0].toLowerCase();
      const quality = qValue ? parseFloat(qValue) : 1.0;

      return {
        locale: primaryCode,
        quality: isNaN(quality) ? 0 : quality,
      };
    })
    .filter((lang) => lang.locale && lang.locale !== '*' && lang.quality > 0);

  languages.sort((a, b) => b.quality - a.quality);

  const seen = new Set<string>();
  return languages
    .map((l) => l.locale)
    .filter((locale) => {
      if (seen.has(locale)) return false;
      seen.add(locale);
      return true;
    });
}

/**
 * Detect guest's preferred language using prioritized cascade.
 *
 * Priority Order:
 * 1. URL parameter (?lang=fr) - for shareable links
 * 2. FAQBNB_GUEST_LANG cookie - persisted preference
 * 3. Accept-Language header - browser preference
 * 4. Default locale ('en')
 *
 * @param request - NextRequest object
 * @param urlParam - Optional URL parameter value (e.g., from ?lang=fr)
 * @returns Detected supported locale
 *
 * @example
 * // In page.tsx server component
 * const { lang } = await searchParams;
 * const guestLanguage = detectGuestLanguage(request, lang);
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

  // Priority 2: Guest cookie
  const cookieLocale = getGuestLanguageFromRequest(request);
  if (cookieLocale) {
    console.log('[i18n] Guest language from cookie:', cookieLocale);
    return cookieLocale;
  }

  // Priority 3: Accept-Language header
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

---

### Task 3: Update Barrel Exports (5 min)

**File:** `/src/lib/i18n/index.ts`

Add exports for the new guest language utilities:

```typescript
// Guest Language utilities (REQ-351)
export {
  // Client-side
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  clearGuestLanguageCookie,
  // Server-side
  setGuestLanguageCookieOnResponse,
  getGuestLanguageFromRequest,
  detectGuestLanguage,
} from './guest-language';
```

Also export the new constants from config:

```typescript
export {
  // ... existing exports
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
} from './config';
```

---

### Task 4: Add TypeScript Types (5 min)

**File:** `/src/lib/i18n/config.ts`

Ensure the config exports types needed for guest language utilities. The existing `SupportedLocale` type should be used.

---

## Authorized Files and Functions for Modification

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest language cookie utility module |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Add `GUEST_LOCALE_COOKIE_NAME` and `GUEST_LOCALE_COOKIE_MAX_AGE` constants |
| `/src/lib/i18n/index.ts` | Export guest language utilities and new constants |

### Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `setGuestLanguageCookie` | `guest-language.ts` | Client-side: Set guest language cookie |
| `getGuestLanguageCookie` | `guest-language.ts` | Client-side: Read guest language cookie |
| `clearGuestLanguageCookie` | `guest-language.ts` | Client-side: Clear guest language cookie |
| `setGuestLanguageCookieOnResponse` | `guest-language.ts` | Server-side: Set cookie on NextResponse |
| `getGuestLanguageFromRequest` | `guest-language.ts` | Server-side: Read cookie from NextRequest |
| `detectGuestLanguage` | `guest-language.ts` | Server-side: Full language detection cascade |

---

## Acceptance Criteria Checklist

- [ ] Cookie utility module exists at `/src/lib/i18n/guest-language.ts`
- [ ] Module exports `setGuestLanguageCookie` function for writing cookie
- [ ] Module exports `getGuestLanguageCookie` function for reading cookie
- [ ] Cookie is named exactly `FAQBNB_GUEST_LANG`
- [ ] Cookie expiration is set to one year from write date
- [ ] Cookie includes `Secure` flag in production (HTTPS-only)
- [ ] Cookie includes `SameSite=Lax` attribute
- [ ] Read function returns language code when cookie exists and is valid
- [ ] Read function returns null when cookie does not exist or is invalid
- [ ] Server-side utilities work with Next.js middleware/API routes
- [ ] `detectGuestLanguage` follows priority: URL param > Cookie > Accept-Language > default
- [ ] All utilities exported through `/src/lib/i18n/index.ts` barrel file

---

## Testing Considerations

### Unit Tests

1. `setGuestLanguageCookie`:
   - Sets cookie with correct name
   - Sets 1-year expiry
   - Validates language before setting
   - Logs on success

2. `getGuestLanguageCookie`:
   - Returns valid language from cookie
   - Returns null for missing cookie
   - Returns null for invalid language value

3. `detectGuestLanguage`:
   - URL param takes highest priority
   - Cookie overrides header when present
   - Accept-Language parsed correctly
   - Falls back to default

### Manual Testing

1. Open guest item page `/item/[publicId]`
2. Select a language using the language switcher
3. Verify cookie is set in browser DevTools (Application > Cookies)
4. Close browser and reopen
5. Verify language preference is remembered
6. Test with `?lang=fr` URL parameter overrides cookie

---

## Dependencies

### Required (Must be complete before implementation)

- Epic 1 Foundation: `/src/lib/i18n/config.ts` with `SupportedLocale` type and `isSupportedLocale` function

### Dependent on This Task

- Task 4.1: `useGuestLanguage` hook (will use these utilities)
- Task 5.1: Update guest item page (will use `detectGuestLanguage`)
- Task 6.1: Middleware update (will use server-side utilities)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cookie blocked by browser | Low | Low | Graceful degradation - re-detect on each visit |
| Conflict with existing FAQBNB_LANG cookie | Low | Medium | Using separate cookie name (FAQBNB_GUEST_LANG) |
| Secure flag breaks local development | Low | Low | Only enable Secure flag in production |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: Add constants to config | 10 min |
| Task 2: Create guest-language.ts module | 30 min |
| Task 3: Update barrel exports | 5 min |
| Task 4: TypeScript types verification | 5 min |
| **Total** | **50 min** |

**Confidence:** High - This is a straightforward utility following established patterns.

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 4, Task 4.2)
- **Existing Language Detection:** `/src/lib/i18n/language-detection.ts`
- **Existing Config:** `/src/lib/i18n/config.ts`
- **Existing Hook Pattern:** `/src/hooks/useLanguagePreference.ts`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-351)
