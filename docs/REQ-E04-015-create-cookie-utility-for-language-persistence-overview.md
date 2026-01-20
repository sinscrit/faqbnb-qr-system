# Implementation Overview: REQ-E04-015 - Create Cookie Utility for Language Persistence

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-015
**Epic:** Epic 4 - Guest Experience
**Phase:** Phase 4 - Guest Language Hook
**Task ID:** 4.2
**Size:** S (Small)

---

## Summary

Create a dedicated utility function that sets and manages the guest language preference cookie (`FAQBNB_GUEST_LANG`) with appropriate security settings (Secure, SameSite=Lax) and 1-year expiration. This utility standardizes cookie handling for guest language persistence across the application.

---

## Background & Context

### Current State

The codebase already has several cookie utilities for language handling:

1. **Server-side cookie setting** in `/src/lib/i18n/language-detection.ts`:
   - `setLocaleCookie()` function for NextResponse cookies
   - Uses `FAQBNB_LANG` cookie name (for authenticated users)
   - 1-year expiration with Secure and SameSite=Lax

2. **Client-side cookie setting** in `/src/contexts/LocaleContext.tsx`:
   - Direct `document.cookie` manipulation
   - Uses `FAQBNB_LANG` cookie name
   - Primarily for authenticated users within LocaleContext

### Gap Analysis

The existing utilities use `FAQBNB_LANG` cookie and are tightly coupled with authenticated user flows. For the guest experience, we need:

1. A dedicated **guest-specific cookie** (`FAQBNB_GUEST_LANG`) that operates independently
2. **Client-side utilities** that work in the `useGuestLanguage` hook context
3. Functions that work in **both server-side and client-side** contexts
4. **Type-safe validation** ensuring only supported language codes are stored

---

## Requirements from Request #15

From REQ-E04-015:

- [ ] A utility function accepts a language code parameter and sets a cookie named `FAQBNB_GUEST_LANG`
- [ ] The cookie expiration is set to exactly 1 year from the time of setting
- [ ] The cookie includes the Secure flag to ensure HTTPS-only transmission
- [ ] The cookie includes SameSite=Lax to allow cross-site navigation while preventing CSRF attacks
- [ ] The cookie path is set to `/` to ensure availability across the entire application
- [ ] A companion function retrieves the current value of the language cookie
- [ ] The retrieval function returns null or undefined when the cookie does not exist
- [ ] Both functions validate that the language code matches supported language types before setting
- [ ] Invalid language codes are rejected and the cookie is not set or is cleared
- [ ] The utility handles environments where cookies are disabled gracefully without throwing errors
- [ ] The functions work correctly in both server-side and client-side contexts
- [ ] The utility is exported from the guest language module or a dedicated cookie utilities module
- [ ] TypeScript types ensure only valid language codes can be passed to the set function
- [ ] The implementation follows Next.js best practices for cookie handling

---

## Implementation Plan

### Task Breakdown

#### Task 4.2.1: Add Guest Cookie Constants to i18n Config

**File:** `/src/lib/i18n/config.ts`

Add guest-specific cookie configuration constants alongside existing ones:

```typescript
/**
 * Cookie name for guest language preference
 * Separate from LOCALE_COOKIE_NAME (authenticated users)
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Guest cookie max age in seconds (1 year)
 * Same duration as authenticated user cookie
 */
export const GUEST_LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

#### Task 4.2.2: Create Guest Language Utility Module

**File:** `/src/lib/i18n/guest-language.ts` (NEW)

Create a comprehensive utility module with both client-side and server-side cookie functions:

```typescript
/**
 * Guest Language Utility Module
 *
 * Provides utilities for managing guest language preferences including:
 * - Cookie-based persistence for guest users (no authentication required)
 * - Browser language detection for initial preference
 * - URL parameter handling for shareable links
 *
 * Cookie Configuration:
 * - Name: FAQBNB_GUEST_LANG
 * - Expiry: 1 year
 * - Secure: true (in production)
 * - SameSite: Lax
 * - Path: /
 *
 * REQ-E04-015: Create Cookie Utility for Language Persistence
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 4, Task 4.2
 */
```

**Functions to implement:**

1. **`setGuestLanguageCookie(language: SupportedLocale): boolean`** (Client-side)
   - Sets the guest language cookie using `document.cookie`
   - Returns `true` on success, `false` if cookies are disabled
   - Validates language code before setting

2. **`getGuestLanguageCookie(): SupportedLocale | null`** (Client-side)
   - Reads and parses the guest language cookie
   - Validates the value against supported locales
   - Returns `null` if not set or invalid

3. **`clearGuestLanguageCookie(): void`** (Client-side)
   - Clears the guest language cookie by setting expiry in the past

4. **`setGuestLanguageCookieServer(response: NextResponse, language: SupportedLocale): void`** (Server-side)
   - Sets the cookie on a Next.js response object
   - Mirrors server-side pattern from `setLocaleCookie()`

5. **`getGuestLanguageCookieServer(request: NextRequest): SupportedLocale | null`** (Server-side)
   - Reads the cookie from a Next.js request object
   - Validates and returns the language code

#### Task 4.2.3: Implement Client-Side Cookie Functions

Implement using the established pattern from `LocaleContext.tsx`:

```typescript
// Client-side cookie setting
export function setGuestLanguageCookie(language: SupportedLocale): boolean {
  // Guard for SSR
  if (typeof document === 'undefined') {
    return false;
  }

  // Validate language
  if (!isSupportedLocale(language)) {
    console.warn('[guest-language] Invalid language code:', language);
    return false;
  }

  try {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    document.cookie = `${GUEST_LOCALE_COOKIE_NAME}=${language}; path=/; max-age=${GUEST_LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    return true;
  } catch (error) {
    console.error('[guest-language] Failed to set cookie:', error);
    return false;
  }
}
```

#### Task 4.2.4: Implement Server-Side Cookie Functions

Follow the pattern from `language-detection.ts`:

```typescript
// Server-side cookie setting
export function setGuestLanguageCookieServer(
  response: NextResponse,
  language: SupportedLocale
): void {
  if (!isSupportedLocale(language)) {
    console.warn('[guest-language] Invalid language code for server cookie:', language);
    return;
  }

  response.cookies.set({
    name: GUEST_LOCALE_COOKIE_NAME,
    value: language,
    maxAge: GUEST_LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
```

#### Task 4.2.5: Export from i18n Index

**File:** `/src/lib/i18n/index.ts`

Add exports for the new guest language utilities:

```typescript
// Guest language utilities
export {
  setGuestLanguageCookie,
  getGuestLanguageCookie,
  clearGuestLanguageCookie,
  setGuestLanguageCookieServer,
  getGuestLanguageCookieServer,
} from './guest-language';
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest language cookie utilities module |

### Files to Modify

| File Path | Changes | Functions Affected |
|-----------|---------|-------------------|
| `/src/lib/i18n/config.ts` | Add guest cookie constants | N/A (add constants only) |
| `/src/lib/i18n/index.ts` | Export guest language utilities | N/A (add exports only) |

### Authorized Functions to Create

| File | Function | Description |
|------|----------|-------------|
| `guest-language.ts` | `setGuestLanguageCookie(language)` | Client-side: Set guest language cookie |
| `guest-language.ts` | `getGuestLanguageCookie()` | Client-side: Get guest language cookie |
| `guest-language.ts` | `clearGuestLanguageCookie()` | Client-side: Clear guest language cookie |
| `guest-language.ts` | `setGuestLanguageCookieServer(response, language)` | Server-side: Set guest language cookie |
| `guest-language.ts` | `getGuestLanguageCookieServer(request)` | Server-side: Get guest language cookie |

### Constants to Add (in config.ts)

| Constant | Value | Purpose |
|----------|-------|---------|
| `GUEST_LOCALE_COOKIE_NAME` | `'FAQBNB_GUEST_LANG'` | Cookie name for guest language |
| `GUEST_LOCALE_COOKIE_MAX_AGE` | `365 * 24 * 60 * 60` | 1 year in seconds |

---

## Technical Specifications

### Cookie Attributes

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| **Name** | `FAQBNB_GUEST_LANG` | Distinct from authenticated user cookie |
| **Max-Age** | `31536000` (1 year) | Long persistence for returning guests |
| **Path** | `/` | Available across entire application |
| **Secure** | `true` (production) | HTTPS-only transmission |
| **SameSite** | `Lax` | Allow cross-site navigation, prevent CSRF |
| **HttpOnly** | `false` | Allow client-side JavaScript access |

### Type Safety

All functions use `SupportedLocale` type from `/src/lib/i18n/config.ts`:

```typescript
type SupportedLocale = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Cookies disabled | Return `false` from setter, `null` from getter |
| Invalid language code | Reject with `false`, log warning |
| SSR context (no document) | Return `false` gracefully |
| Malformed cookie value | Return `null` from getter |

---

## Dependencies

### Required from Epic 1 (Foundation)

| Dependency | Location | Status |
|------------|----------|--------|
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Available |
| `isSupportedLocale()` function | `/src/lib/i18n/config.ts` | Available |
| `locales` constant | `/src/lib/i18n/config.ts` | Available |

### Next.js APIs Used

| API | Usage |
|-----|-------|
| `NextRequest.cookies` | Server-side cookie reading |
| `NextResponse.cookies.set()` | Server-side cookie writing |
| `document.cookie` | Client-side cookie access |

---

## Usage Examples

### Client-Side Usage (in useGuestLanguage hook)

```typescript
import { setGuestLanguageCookie, getGuestLanguageCookie } from '@/lib/i18n';

// Read existing preference
const savedLanguage = getGuestLanguageCookie();

// Save new preference
const success = setGuestLanguageCookie('fr');
if (!success) {
  console.warn('Could not save language preference');
}
```

### Server-Side Usage (in middleware or API routes)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  getGuestLanguageCookieServer,
  setGuestLanguageCookieServer
} from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Read guest language
  const guestLang = getGuestLanguageCookieServer(request);

  // Update if needed
  if (!guestLang) {
    setGuestLanguageCookieServer(response, 'en');
  }

  return response;
}
```

---

## Testing Considerations

### Unit Tests

1. **`setGuestLanguageCookie`**
   - Sets cookie with valid language code
   - Returns `false` for invalid language
   - Returns `false` in SSR context
   - Handles cookie disabled scenario

2. **`getGuestLanguageCookie`**
   - Returns language when cookie exists
   - Returns `null` when cookie missing
   - Returns `null` for invalid/malformed values
   - Handles SSR context gracefully

3. **Server-side functions**
   - Properly sets cookie attributes on NextResponse
   - Reads cookie from NextRequest correctly
   - Validates language codes

### Integration Tests

1. Cookie persists across page navigations
2. Cookie survives browser restart (within expiry)
3. Works with URL parameter override

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cookies disabled by user | Low | Medium | Graceful fallback; detect on each visit |
| Cookie collision with FAQBNB_LANG | Low | Low | Distinct cookie names with clear purpose |
| Third-party cookie blocking | Medium | Low | Same-site cookie; first-party context |

---

## Acceptance Checklist

- [ ] Guest cookie name `FAQBNB_GUEST_LANG` is used consistently
- [ ] Cookie expiration is exactly 1 year (31536000 seconds)
- [ ] Secure flag present in production
- [ ] SameSite=Lax attribute set
- [ ] Path is set to `/`
- [ ] Client-side getter returns null for missing/invalid cookies
- [ ] Server-side functions work with Next.js request/response
- [ ] Invalid language codes are rejected
- [ ] TypeScript types enforce valid language codes
- [ ] Utilities exported from `/src/lib/i18n/index.ts`
- [ ] No errors thrown when cookies are disabled

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-015
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Phase 4, Task 4.2
- **Related Request:** REQ-E04-014 (useGuestLanguage hook - will consume this utility)
- **Existing Pattern:** `/src/lib/i18n/language-detection.ts` - `setLocaleCookie()`
- **Existing Pattern:** `/src/contexts/LocaleContext.tsx` - Client-side cookie handling
