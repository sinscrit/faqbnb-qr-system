# Detailed Task Breakdown: REQ-E04-015 - Create Cookie Utility for Language Persistence

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-015
**Epic:** Epic 4 - Guest Experience
**Phase:** Phase 4 - Guest Language Hook
**Task ID:** 4.2
**Size:** S (Small)
**Estimated Story Points:** 2

---

## Executive Summary

This task creates a dedicated utility module for managing guest language preference cookies. The utilities provide both client-side and server-side functions for setting, getting, and clearing the `FAQBNB_GUEST_LANG` cookie with proper security settings (Secure, SameSite=Lax) and 1-year expiration. This is distinct from the authenticated user cookie (`FAQBNB_LANG`) and designed specifically for guest language persistence.

---

## Source Documents

| Document | Path | Relevance |
|----------|------|-----------|
| Overview | `/docs/REQ-E04-015-create-cookie-utility-for-language-persistence-overview.md` | Primary specification |
| Request | `/docs/gen_requests_epic4.md` (Request #15) | Acceptance criteria |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` | Phase 4, Task 4.2 |
| i18n Config | `/src/lib/i18n/config.ts` | Existing constants and types |
| Language Detection | `/src/lib/i18n/language-detection.ts` | Server-side cookie pattern |
| LocaleContext | `/src/contexts/LocaleContext.tsx` | Client-side cookie pattern |

---

## Prerequisites

### Required Dependencies (from Epic 1 Foundation)

| Dependency | Location | Status |
|------------|----------|--------|
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Available |
| `isSupportedLocale()` function | `/src/lib/i18n/config.ts` | Available |
| `locales` constant | `/src/lib/i18n/config.ts` | Available |
| `LOCALE_COOKIE_MAX_AGE` constant | `/src/lib/i18n/config.ts` | Available (can reuse pattern) |

### Verification Steps Before Implementation

1. Confirm `/src/lib/i18n/config.ts` exports `SupportedLocale` type
2. Confirm `/src/lib/i18n/config.ts` exports `isSupportedLocale()` function
3. Confirm `/src/lib/i18n/index.ts` has proper re-exports

---

## Task Breakdown

### Task 4.2.1: Add Guest Cookie Constants to i18n Config

**Priority:** P0 - Must Complete First
**Estimated Effort:** 10 minutes
**File:** `/src/lib/i18n/config.ts`

#### Description

Add guest-specific cookie configuration constants to the existing i18n config file. These constants define the cookie name and max age specifically for guest (unauthenticated) users.

#### Implementation Details

**Insert after line ~53 (after `LOCALE_COOKIE_MAX_AGE`):**

```typescript
/**
 * Cookie name for guest language preference
 * Separate from LOCALE_COOKIE_NAME which is for authenticated users
 *
 * REQ-E04-015: Create Cookie Utility for Language Persistence
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Guest cookie max age in seconds (1 year)
 * Same duration as authenticated user cookie for consistency
 *
 * REQ-E04-015: Create Cookie Utility for Language Persistence
 */
export const GUEST_LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 31536000 seconds
```

#### Acceptance Criteria

- [ ] `GUEST_LOCALE_COOKIE_NAME` constant is defined with value `'FAQBNB_GUEST_LANG'`
- [ ] `GUEST_LOCALE_COOKIE_MAX_AGE` constant is defined as `365 * 24 * 60 * 60` (1 year in seconds)
- [ ] Constants are exported from the module
- [ ] Constants include JSDoc comments referencing REQ-E04-015

#### Testing

```typescript
import { GUEST_LOCALE_COOKIE_NAME, GUEST_LOCALE_COOKIE_MAX_AGE } from '@/lib/i18n/config';

console.assert(GUEST_LOCALE_COOKIE_NAME === 'FAQBNB_GUEST_LANG');
console.assert(GUEST_LOCALE_COOKIE_MAX_AGE === 31536000);
```

---

### Task 4.2.2: Create Guest Language Utility Module

**Priority:** P0 - Core Implementation
**Estimated Effort:** 45 minutes
**File:** `/src/lib/i18n/guest-language.ts` (NEW FILE)

#### Description

Create a new utility module that provides both client-side and server-side functions for managing guest language cookies. This module is the primary deliverable for REQ-E04-015.

#### File Structure

```typescript
/**
 * Guest Language Cookie Utility Module
 *
 * Provides utilities for managing guest language preferences via cookies.
 * Designed for unauthenticated guest users viewing public content.
 *
 * Cookie Configuration:
 * - Name: FAQBNB_GUEST_LANG
 * - Expiry: 1 year (31536000 seconds)
 * - Secure: true (in production)
 * - SameSite: Lax
 * - Path: /
 * - HttpOnly: false (allows client-side access)
 *
 * REQ-E04-015: Create Cookie Utility for Language Persistence
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 4, Task 4.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
  isSupportedLocale,
  type SupportedLocale,
} from './config';
```

#### Implementation Details

The module should contain 5 functions organized into two categories:

**Client-Side Functions:**
1. `setGuestLanguageCookie(language: SupportedLocale): boolean`
2. `getGuestLanguageCookie(): SupportedLocale | null`
3. `clearGuestLanguageCookie(): void`

**Server-Side Functions:**
4. `setGuestLanguageCookieServer(response: NextResponse, language: SupportedLocale): void`
5. `getGuestLanguageCookieServer(request: NextRequest): SupportedLocale | null`

#### Acceptance Criteria

- [ ] File is created at `/src/lib/i18n/guest-language.ts`
- [ ] Module header includes proper JSDoc documentation
- [ ] All 5 functions are implemented
- [ ] Functions use `GUEST_LOCALE_COOKIE_NAME` from config
- [ ] Functions use `GUEST_LOCALE_COOKIE_MAX_AGE` from config
- [ ] All functions validate language codes using `isSupportedLocale()`

---

### Task 4.2.3: Implement Client-Side setGuestLanguageCookie Function

**Priority:** P0 - Core Implementation
**Estimated Effort:** 20 minutes
**File:** `/src/lib/i18n/guest-language.ts`

#### Description

Implement the client-side function to set the guest language cookie using `document.cookie`.

#### Implementation

```typescript
// =============================================================================
// Client-Side Cookie Functions
// =============================================================================

/**
 * Sets the guest language preference cookie (client-side).
 *
 * This function writes directly to document.cookie and should only be called
 * in browser contexts (not during SSR).
 *
 * Cookie Attributes:
 * - Secure: true in production, false in development
 * - SameSite: Lax (allows cross-site navigation, prevents CSRF)
 * - Path: / (available site-wide)
 * - Max-Age: 1 year
 *
 * @param language - The language code to set (must be a supported locale)
 * @returns true if cookie was set successfully, false otherwise
 *
 * @example
 * const success = setGuestLanguageCookie('fr');
 * if (!success) {
 *   console.warn('Could not save language preference');
 * }
 */
export function setGuestLanguageCookie(language: SupportedLocale): boolean {
  // Guard for SSR - document is not available on server
  if (typeof document === 'undefined') {
    console.warn('[guest-language] Cannot set cookie in SSR context');
    return false;
  }

  // Validate language code
  if (!isSupportedLocale(language)) {
    console.warn('[guest-language] Invalid language code:', language);
    return false;
  }

  try {
    // Only use Secure flag in production (HTTPS required)
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

    // Construct cookie string with all required attributes
    const cookieString = [
      `${GUEST_LOCALE_COOKIE_NAME}=${language}`,
      'path=/',
      `max-age=${GUEST_LOCALE_COOKIE_MAX_AGE}`,
      'SameSite=Lax',
      secure,
    ].filter(Boolean).join('; ');

    document.cookie = cookieString;

    console.log('[guest-language] Cookie set:', language);
    return true;
  } catch (error) {
    // Handle environments where cookies are disabled
    console.error('[guest-language] Failed to set cookie:', error);
    return false;
  }
}
```

#### Acceptance Criteria

- [ ] Function signature matches: `setGuestLanguageCookie(language: SupportedLocale): boolean`
- [ ] Returns `false` when `document` is undefined (SSR guard)
- [ ] Returns `false` when language code is invalid
- [ ] Returns `true` on successful cookie set
- [ ] Cookie includes `path=/` attribute
- [ ] Cookie includes `max-age` of 1 year
- [ ] Cookie includes `SameSite=Lax` attribute
- [ ] Cookie includes `Secure` flag only in production
- [ ] Errors are caught and logged without throwing

#### Testing Scenarios

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Valid language (client) | `'fr'` | `true`, cookie set |
| Invalid language | `'xyz'` | `false`, warning logged |
| SSR context | Any | `false`, warning logged |
| Cookies disabled | `'en'` | `false`, error logged |

---

### Task 4.2.4: Implement Client-Side getGuestLanguageCookie Function

**Priority:** P0 - Core Implementation
**Estimated Effort:** 15 minutes
**File:** `/src/lib/i18n/guest-language.ts`

#### Description

Implement the client-side function to read the guest language cookie from `document.cookie`.

#### Implementation

```typescript
/**
 * Retrieves the guest language preference from cookie (client-side).
 *
 * Parses document.cookie to find the FAQBNB_GUEST_LANG value and validates
 * it against supported locales.
 *
 * @returns The stored language code if valid, null otherwise
 *
 * @example
 * const savedLanguage = getGuestLanguageCookie();
 * if (savedLanguage) {
 *   setCurrentLanguage(savedLanguage);
 * }
 */
export function getGuestLanguageCookie(): SupportedLocale | null {
  // Guard for SSR - document is not available on server
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    // Parse all cookies
    const cookies = document.cookie.split(';');

    // Find our specific cookie
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');

      if (name === GUEST_LOCALE_COOKIE_NAME && value) {
        // Validate the value is a supported locale
        if (isSupportedLocale(value)) {
          return value;
        }

        // Cookie exists but has invalid value
        console.warn('[guest-language] Invalid cookie value:', value);
        return null;
      }
    }

    // Cookie not found
    return null;
  } catch (error) {
    console.error('[guest-language] Failed to read cookie:', error);
    return null;
  }
}
```

#### Acceptance Criteria

- [ ] Function signature matches: `getGuestLanguageCookie(): SupportedLocale | null`
- [ ] Returns `null` when `document` is undefined (SSR guard)
- [ ] Returns `null` when cookie does not exist
- [ ] Returns `null` when cookie value is invalid/not supported
- [ ] Returns valid `SupportedLocale` when cookie exists and is valid
- [ ] Handles malformed cookie strings gracefully

#### Testing Scenarios

| Scenario | Cookie State | Expected Output |
|----------|--------------|-----------------|
| Cookie exists with valid value | `FAQBNB_GUEST_LANG=fr` | `'fr'` |
| Cookie does not exist | No cookie | `null` |
| Cookie has invalid value | `FAQBNB_GUEST_LANG=xyz` | `null` |
| SSR context | Any | `null` |
| Malformed cookies | Corrupted string | `null` |

---

### Task 4.2.5: Implement Client-Side clearGuestLanguageCookie Function

**Priority:** P1 - Important
**Estimated Effort:** 10 minutes
**File:** `/src/lib/i18n/guest-language.ts`

#### Description

Implement the client-side function to clear/delete the guest language cookie.

#### Implementation

```typescript
/**
 * Clears the guest language preference cookie (client-side).
 *
 * Sets the cookie expiration to a past date to trigger browser deletion.
 * Safe to call even if the cookie doesn't exist.
 *
 * @example
 * // Clear preference when user explicitly wants to reset
 * clearGuestLanguageCookie();
 */
export function clearGuestLanguageCookie(): void {
  // Guard for SSR - document is not available on server
  if (typeof document === 'undefined') {
    return;
  }

  try {
    // Set expiry to past date to delete the cookie
    document.cookie = `${GUEST_LOCALE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    console.log('[guest-language] Cookie cleared');
  } catch (error) {
    console.error('[guest-language] Failed to clear cookie:', error);
  }
}
```

#### Acceptance Criteria

- [ ] Function signature matches: `clearGuestLanguageCookie(): void`
- [ ] Does nothing in SSR context (no errors)
- [ ] Sets cookie `max-age=0` to trigger deletion
- [ ] Maintains same `path=/` attribute for proper deletion scope
- [ ] Safe to call when cookie doesn't exist

---

### Task 4.2.6: Implement Server-Side setGuestLanguageCookieServer Function

**Priority:** P0 - Core Implementation
**Estimated Effort:** 15 minutes
**File:** `/src/lib/i18n/guest-language.ts`

#### Description

Implement the server-side function to set the guest language cookie on a Next.js response object.

#### Implementation

```typescript
// =============================================================================
// Server-Side Cookie Functions
// =============================================================================

/**
 * Sets the guest language preference cookie on a Next.js response (server-side).
 *
 * Use this in middleware or API routes to set the guest language cookie
 * on the outgoing response.
 *
 * @param response - The Next.js response object to modify
 * @param language - The language code to set (must be a supported locale)
 *
 * @example
 * // In middleware
 * export function middleware(request: NextRequest) {
 *   const response = NextResponse.next();
 *   setGuestLanguageCookieServer(response, 'fr');
 *   return response;
 * }
 */
export function setGuestLanguageCookieServer(
  response: NextResponse,
  language: SupportedLocale
): void {
  // Validate language code
  if (!isSupportedLocale(language)) {
    console.warn('[guest-language] Invalid language code for server cookie:', language);
    return;
  }

  response.cookies.set({
    name: GUEST_LOCALE_COOKIE_NAME,
    value: language,
    maxAge: GUEST_LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side JavaScript access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  console.log('[guest-language] Server cookie set:', language);
}
```

#### Acceptance Criteria

- [ ] Function signature matches: `setGuestLanguageCookieServer(response: NextResponse, language: SupportedLocale): void`
- [ ] Validates language code before setting
- [ ] Returns early (no-op) for invalid language codes
- [ ] Uses `response.cookies.set()` API correctly
- [ ] Sets `httpOnly: false` to allow client-side access
- [ ] Sets `secure: true` only in production
- [ ] Sets `sameSite: 'lax'`
- [ ] Sets `path: '/'`
- [ ] Sets correct `maxAge`

---

### Task 4.2.7: Implement Server-Side getGuestLanguageCookieServer Function

**Priority:** P0 - Core Implementation
**Estimated Effort:** 15 minutes
**File:** `/src/lib/i18n/guest-language.ts`

#### Description

Implement the server-side function to read the guest language cookie from a Next.js request object.

#### Implementation

```typescript
/**
 * Retrieves the guest language preference from a Next.js request (server-side).
 *
 * Use this in middleware, API routes, or server components to read the
 * guest's saved language preference.
 *
 * @param request - The Next.js request object to read cookies from
 * @returns The stored language code if valid, null otherwise
 *
 * @example
 * // In middleware
 * export function middleware(request: NextRequest) {
 *   const guestLang = getGuestLanguageCookieServer(request);
 *   if (guestLang) {
 *     // Use the guest's saved preference
 *   }
 * }
 */
export function getGuestLanguageCookieServer(
  request: NextRequest
): SupportedLocale | null {
  const cookieValue = request.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return null;
  }

  // Validate the value is a supported locale
  if (isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  console.warn('[guest-language] Invalid server cookie value:', cookieValue);
  return null;
}
```

#### Acceptance Criteria

- [ ] Function signature matches: `getGuestLanguageCookieServer(request: NextRequest): SupportedLocale | null`
- [ ] Returns `null` when cookie does not exist
- [ ] Returns `null` when cookie value is invalid/not supported
- [ ] Returns valid `SupportedLocale` when cookie exists and is valid
- [ ] Uses `request.cookies.get()` API correctly

---

### Task 4.2.8: Export Functions from i18n Index

**Priority:** P0 - Must Complete
**Estimated Effort:** 5 minutes
**File:** `/src/lib/i18n/index.ts`

#### Description

Add exports for the new guest language utilities to the centralized i18n module exports.

#### Implementation

**Add to `/src/lib/i18n/index.ts`:**

```typescript
// Guest language cookie utilities (REQ-E04-015)
export {
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  clearGuestLanguageCookie,
  setGuestLanguageCookieServer,
  getGuestLanguageCookieServer,
} from './guest-language';

// Also export the guest cookie constants
export {
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
} from './config';
```

#### Acceptance Criteria

- [ ] All 5 functions are exported from `/src/lib/i18n/index.ts`
- [ ] Guest cookie constants are exported from `/src/lib/i18n/index.ts`
- [ ] Imports work correctly: `import { setGuestLanguageCookie } from '@/lib/i18n'`
- [ ] No TypeScript compilation errors

---

## Complete Implementation Reference

### Full guest-language.ts File

```typescript
/**
 * Guest Language Cookie Utility Module
 *
 * Provides utilities for managing guest language preferences via cookies.
 * Designed for unauthenticated guest users viewing public content.
 *
 * Cookie Configuration:
 * - Name: FAQBNB_GUEST_LANG
 * - Expiry: 1 year (31536000 seconds)
 * - Secure: true (in production)
 * - SameSite: Lax
 * - Path: /
 * - HttpOnly: false (allows client-side access)
 *
 * REQ-E04-015: Create Cookie Utility for Language Persistence
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 4, Task 4.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  GUEST_LOCALE_COOKIE_NAME,
  GUEST_LOCALE_COOKIE_MAX_AGE,
  isSupportedLocale,
  type SupportedLocale,
} from './config';

// =============================================================================
// Client-Side Cookie Functions
// =============================================================================

/**
 * Sets the guest language preference cookie (client-side).
 *
 * This function writes directly to document.cookie and should only be called
 * in browser contexts (not during SSR).
 *
 * Cookie Attributes:
 * - Secure: true in production, false in development
 * - SameSite: Lax (allows cross-site navigation, prevents CSRF)
 * - Path: / (available site-wide)
 * - Max-Age: 1 year
 *
 * @param language - The language code to set (must be a supported locale)
 * @returns true if cookie was set successfully, false otherwise
 *
 * @example
 * const success = setGuestLanguageCookie('fr');
 * if (!success) {
 *   console.warn('Could not save language preference');
 * }
 */
export function setGuestLanguageCookie(language: SupportedLocale): boolean {
  // Guard for SSR - document is not available on server
  if (typeof document === 'undefined') {
    console.warn('[guest-language] Cannot set cookie in SSR context');
    return false;
  }

  // Validate language code
  if (!isSupportedLocale(language)) {
    console.warn('[guest-language] Invalid language code:', language);
    return false;
  }

  try {
    // Only use Secure flag in production (HTTPS required)
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

    // Construct cookie string with all required attributes
    const cookieString = [
      `${GUEST_LOCALE_COOKIE_NAME}=${language}`,
      'path=/',
      `max-age=${GUEST_LOCALE_COOKIE_MAX_AGE}`,
      'SameSite=Lax',
      secure,
    ].filter(Boolean).join('; ');

    document.cookie = cookieString;

    console.log('[guest-language] Cookie set:', language);
    return true;
  } catch (error) {
    // Handle environments where cookies are disabled
    console.error('[guest-language] Failed to set cookie:', error);
    return false;
  }
}

/**
 * Retrieves the guest language preference from cookie (client-side).
 *
 * Parses document.cookie to find the FAQBNB_GUEST_LANG value and validates
 * it against supported locales.
 *
 * @returns The stored language code if valid, null otherwise
 *
 * @example
 * const savedLanguage = getGuestLanguageCookie();
 * if (savedLanguage) {
 *   setCurrentLanguage(savedLanguage);
 * }
 */
export function getGuestLanguageCookie(): SupportedLocale | null {
  // Guard for SSR - document is not available on server
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    // Parse all cookies
    const cookies = document.cookie.split(';');

    // Find our specific cookie
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');

      if (name === GUEST_LOCALE_COOKIE_NAME && value) {
        // Validate the value is a supported locale
        if (isSupportedLocale(value)) {
          return value;
        }

        // Cookie exists but has invalid value
        console.warn('[guest-language] Invalid cookie value:', value);
        return null;
      }
    }

    // Cookie not found
    return null;
  } catch (error) {
    console.error('[guest-language] Failed to read cookie:', error);
    return null;
  }
}

/**
 * Clears the guest language preference cookie (client-side).
 *
 * Sets the cookie expiration to a past date to trigger browser deletion.
 * Safe to call even if the cookie doesn't exist.
 *
 * @example
 * // Clear preference when user explicitly wants to reset
 * clearGuestLanguageCookie();
 */
export function clearGuestLanguageCookie(): void {
  // Guard for SSR - document is not available on server
  if (typeof document === 'undefined') {
    return;
  }

  try {
    // Set expiry to past date to delete the cookie
    document.cookie = `${GUEST_LOCALE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    console.log('[guest-language] Cookie cleared');
  } catch (error) {
    console.error('[guest-language] Failed to clear cookie:', error);
  }
}

// =============================================================================
// Server-Side Cookie Functions
// =============================================================================

/**
 * Sets the guest language preference cookie on a Next.js response (server-side).
 *
 * Use this in middleware or API routes to set the guest language cookie
 * on the outgoing response.
 *
 * @param response - The Next.js response object to modify
 * @param language - The language code to set (must be a supported locale)
 *
 * @example
 * // In middleware
 * export function middleware(request: NextRequest) {
 *   const response = NextResponse.next();
 *   setGuestLanguageCookieServer(response, 'fr');
 *   return response;
 * }
 */
export function setGuestLanguageCookieServer(
  response: NextResponse,
  language: SupportedLocale
): void {
  // Validate language code
  if (!isSupportedLocale(language)) {
    console.warn('[guest-language] Invalid language code for server cookie:', language);
    return;
  }

  response.cookies.set({
    name: GUEST_LOCALE_COOKIE_NAME,
    value: language,
    maxAge: GUEST_LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side JavaScript access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  console.log('[guest-language] Server cookie set:', language);
}

/**
 * Retrieves the guest language preference from a Next.js request (server-side).
 *
 * Use this in middleware, API routes, or server components to read the
 * guest's saved language preference.
 *
 * @param request - The Next.js request object to read cookies from
 * @returns The stored language code if valid, null otherwise
 *
 * @example
 * // In middleware
 * export function middleware(request: NextRequest) {
 *   const guestLang = getGuestLanguageCookieServer(request);
 *   if (guestLang) {
 *     // Use the guest's saved preference
 *   }
 * }
 */
export function getGuestLanguageCookieServer(
  request: NextRequest
): SupportedLocale | null {
  const cookieValue = request.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return null;
  }

  // Validate the value is a supported locale
  if (isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  console.warn('[guest-language] Invalid server cookie value:', cookieValue);
  return null;
}
```

---

## File Changes Summary

### New Files

| File | Lines | Purpose |
|------|-------|---------|
| `/src/lib/i18n/guest-language.ts` | ~180 | Guest cookie utility functions |

### Modified Files

| File | Changes |
|------|---------|
| `/src/lib/i18n/config.ts` | Add `GUEST_LOCALE_COOKIE_NAME` and `GUEST_LOCALE_COOKIE_MAX_AGE` constants |
| `/src/lib/i18n/index.ts` | Export guest language utilities and constants |

---

## Technical Specifications

### Cookie Attributes

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| **Name** | `FAQBNB_GUEST_LANG` | Distinct from authenticated user cookie (`FAQBNB_LANG`) |
| **Max-Age** | `31536000` (1 year) | Long persistence for returning guests |
| **Path** | `/` | Available across entire application |
| **Secure** | `true` (production only) | HTTPS-only transmission in production |
| **SameSite** | `Lax` | Allow cross-site navigation, prevent CSRF |
| **HttpOnly** | `false` | Allow client-side JavaScript access |

### Type Safety

All functions use the `SupportedLocale` type from `/src/lib/i18n/config.ts`:

```typescript
type SupportedLocale = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

### Error Handling Matrix

| Scenario | Client Function Behavior | Server Function Behavior |
|----------|--------------------------|--------------------------|
| Cookies disabled | Return `false` (setter) / `null` (getter) | N/A |
| Invalid language code | Return `false`, log warning | No-op, log warning |
| SSR context (no document) | Return `false` / `null` | N/A (designed for server) |
| Malformed cookie value | Return `null`, log warning | Return `null`, log warning |
| Request/Response missing | N/A | TypeScript prevents |

---

## Testing Requirements

### Unit Tests

#### Test: setGuestLanguageCookie

```typescript
describe('setGuestLanguageCookie', () => {
  it('sets cookie with valid language code', () => {
    const result = setGuestLanguageCookie('fr');
    expect(result).toBe(true);
    expect(document.cookie).toContain('FAQBNB_GUEST_LANG=fr');
  });

  it('returns false for invalid language code', () => {
    const result = setGuestLanguageCookie('xyz' as any);
    expect(result).toBe(false);
  });

  it('returns false in SSR context', () => {
    // Mock document as undefined
    const result = setGuestLanguageCookie('fr');
    expect(result).toBe(false);
  });

  it('includes proper cookie attributes', () => {
    setGuestLanguageCookie('fr');
    expect(document.cookie).toContain('path=/');
    expect(document.cookie).toContain('SameSite=Lax');
  });
});
```

#### Test: getGuestLanguageCookie

```typescript
describe('getGuestLanguageCookie', () => {
  it('returns language when cookie exists with valid value', () => {
    document.cookie = 'FAQBNB_GUEST_LANG=fr';
    const result = getGuestLanguageCookie();
    expect(result).toBe('fr');
  });

  it('returns null when cookie does not exist', () => {
    const result = getGuestLanguageCookie();
    expect(result).toBeNull();
  });

  it('returns null when cookie has invalid value', () => {
    document.cookie = 'FAQBNB_GUEST_LANG=invalid';
    const result = getGuestLanguageCookie();
    expect(result).toBeNull();
  });
});
```

#### Test: Server-Side Functions

```typescript
describe('setGuestLanguageCookieServer', () => {
  it('sets cookie on NextResponse', () => {
    const response = NextResponse.next();
    setGuestLanguageCookieServer(response, 'fr');
    const cookie = response.cookies.get('FAQBNB_GUEST_LANG');
    expect(cookie?.value).toBe('fr');
  });

  it('does not set cookie for invalid language', () => {
    const response = NextResponse.next();
    setGuestLanguageCookieServer(response, 'xyz' as any);
    const cookie = response.cookies.get('FAQBNB_GUEST_LANG');
    expect(cookie).toBeUndefined();
  });
});

describe('getGuestLanguageCookieServer', () => {
  it('returns language from request cookie', () => {
    const request = new NextRequest('https://example.com', {
      headers: { Cookie: 'FAQBNB_GUEST_LANG=es' },
    });
    const result = getGuestLanguageCookieServer(request);
    expect(result).toBe('es');
  });

  it('returns null when cookie not present', () => {
    const request = new NextRequest('https://example.com');
    const result = getGuestLanguageCookieServer(request);
    expect(result).toBeNull();
  });
});
```

### Integration Tests

1. **Cookie persistence across page navigations**
   - Set language, navigate, verify cookie persists

2. **Cookie survives browser restart** (within expiry)
   - Set language, close/reopen, verify value retained

3. **Works with useGuestLanguage hook** (when implemented)
   - Hook uses these utilities correctly

---

## Implementation Order

| Order | Task | Dependency | Blocker? |
|-------|------|------------|----------|
| 1 | Task 4.2.1: Add guest cookie constants | None | Yes |
| 2 | Task 4.2.2: Create module file with imports | Task 4.2.1 | Yes |
| 3 | Task 4.2.3: Implement setGuestLanguageCookie | Task 4.2.2 | No |
| 4 | Task 4.2.4: Implement getGuestLanguageCookie | Task 4.2.2 | No |
| 5 | Task 4.2.5: Implement clearGuestLanguageCookie | Task 4.2.2 | No |
| 6 | Task 4.2.6: Implement setGuestLanguageCookieServer | Task 4.2.2 | No |
| 7 | Task 4.2.7: Implement getGuestLanguageCookieServer | Task 4.2.2 | No |
| 8 | Task 4.2.8: Export from i18n index | Tasks 4.2.3-4.2.7 | Yes |

**Note:** Tasks 3-7 can be implemented in parallel after Task 2 is complete.

---

## Acceptance Checklist (from REQ-E04-015)

- [ ] A utility function accepts a language code parameter and sets a cookie named `FAQBNB_GUEST_LANG`
- [ ] The cookie expiration is set to exactly 1 year from the time of setting
- [ ] The cookie includes the Secure flag to ensure HTTPS-only transmission (production)
- [ ] The cookie includes SameSite=Lax to allow cross-site navigation while preventing CSRF
- [ ] The cookie path is set to `/` to ensure availability across the entire application
- [ ] A companion function retrieves the current value of the language cookie
- [ ] The retrieval function returns null when the cookie does not exist
- [ ] Both functions validate that the language code matches supported language types before setting
- [ ] Invalid language codes are rejected and the cookie is not set
- [ ] The utility handles environments where cookies are disabled gracefully without throwing errors
- [ ] The functions work correctly in both server-side and client-side contexts
- [ ] The utility is exported from the i18n module
- [ ] TypeScript types ensure only valid language codes can be passed to the set function
- [ ] The implementation follows Next.js best practices for cookie handling

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cookies disabled by user | Low | Medium | Graceful fallback; return false/null |
| Cookie collision with FAQBNB_LANG | Low | Low | Distinct cookie names; clear documentation |
| Third-party cookie blocking | Medium | Low | Same-site cookie; first-party context |
| TypeScript config issues | Low | Medium | Verify imports work before merging |

---

## Related Requests

| Request ID | Title | Relationship |
|------------|-------|--------------|
| REQ-E04-014 | Create useGuestLanguage hook | Consumer of this utility |
| REQ-E04-002 | Create Guest Language Detection Utilities | Related detection logic |
| REQ-230 | Centralized Locale Configuration | Foundation dependency |

---

## References

- **Overview Document:** `/docs/REQ-E04-015-create-cookie-utility-for-language-persistence-overview.md`
- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-015
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Phase 4, Task 4.2
- **Existing Pattern (Server):** `/src/lib/i18n/language-detection.ts:235-249` - `setLocaleCookie()`
- **Existing Pattern (Client):** `/src/contexts/LocaleContext.tsx:148-151` - `setLocaleCookie()`
