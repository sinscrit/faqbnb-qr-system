# REQ-318: Create Cookie Utility for Guest Language Persistence

**Document Type:** Implementation Breakdown (Tech Lead Overview)
**Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-318
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 4 - Guest Language Hook
**Task ID:** 4.2
**Size:** S (Small)
**Priority:** P1 - High

---

## Summary

Create a dedicated utility module at `/src/lib/i18n/guest-language.ts` for setting and retrieving the guest language preference cookie with proper security attributes and long-term persistence. The cookie named `FAQBNB_GUEST_LANG` will persist language preferences for unauthenticated guests for one year with Secure and SameSite=Lax attributes.

---

## Business Context

### Problem Statement
No standardized utility exists for managing the guest language preference cookie. Components and utilities that need to store or retrieve language preferences must implement cookie handling logic directly, leading to inconsistent cookie attributes, varying expiration times, and potential security vulnerabilities across different implementations.

### Expected Outcome
Guests' language preferences persist reliably across browser sessions for up to one year, eliminating the need to repeatedly select their preferred language on return visits. The long persistence period creates a seamless experience for regular users while security attributes protect against cross-site attacks.

### Dependencies
- **Epic 1 (Foundation):** This task depends on Epic 1 for the cookie name constant `FAQBNB_GUEST_LANG` definition
- **Task 4.1:** The `useGuestLanguage` hook (Task 4.1) will consume these cookie utilities

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | File | Notes |
|---------|------|-------|
| Client-side storage | `/src/lib/session.ts` | Uses `localStorage` with expiration timestamps, constants at module level, JSDoc documentation |
| Server-side cookies | `/src/lib/simple-auth-server.ts` | Uses `cookies()` from `next/headers` with `getAll()` method |
| Utility module structure | `/src/lib/room-utils.ts` | JSDoc with `@param`, `@returns`, `@example`; REQ reference in header |
| Cookie handling (Supabase) | `/src/lib/supabase-server.ts` | Uses `@supabase/ssr` createServerClient with cookie options |

### Technology Stack
- **Framework:** Next.js 15.5.9 with App Router
- **Language:** TypeScript 5.x (strict mode)
- **Cookie Access:** `document.cookie` for client-side (this is a client utility for browser context)

### Key Considerations
1. **Client-Side Only:** This utility is for client-side cookie management (browser context), not server-side
2. **Security Attributes:** Must set `Secure` (HTTPS only in production) and `SameSite=Lax`
3. **Long Expiry:** 365 days (1 year) for persistent guest experience
4. **Path:** Root path `/` for application-wide availability
5. **Cookie Name Constant:** Single source of truth to prevent typos

---

## Implementation Approach

### Directory Structure
```
/src/lib/
└── i18n/                              # NEW: i18n utilities directory
    └── guest-language.ts              # NEW: Guest language cookie utility
```

**Note:** The `/src/lib/i18n/` directory does not currently exist and must be created.

### Function Signatures

```typescript
// Constants
const FAQBNB_GUEST_LANG = 'FAQBNB_GUEST_LANG';
const COOKIE_EXPIRY_DAYS = 365;

/**
 * Sets the guest language preference cookie
 * @param languageCode - Language code to persist (e.g., 'en', 'fr', 'de')
 * @returns void
 */
export function setGuestLanguageCookie(languageCode: string): void;

/**
 * Retrieves the guest language preference from cookie
 * @returns Language code string if cookie exists, null otherwise
 */
export function getGuestLanguageCookie(): string | null;
```

### Cookie Attributes

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| `name` | `FAQBNB_GUEST_LANG` | Standardized name across application |
| `value` | Language code (e.g., 'fr') | Short, valid language codes |
| `expires` | 365 days from now | Long-term persistence for guest experience |
| `path` | `/` | Available across entire application |
| `Secure` | `true` | Only transmitted over HTTPS in production |
| `SameSite` | `Lax` | Protects against CSRF while allowing navigation |

---

## Acceptance Criteria

From REQ-318:

- [ ] Utility module exists at `/src/lib/i18n/guest-language.ts`
- [ ] Module exports a function named `setGuestLanguageCookie` that accepts a language code parameter
- [ ] `setGuestLanguageCookie` sets a cookie named `FAQBNB_GUEST_LANG` with the provided language code as the value
- [ ] Cookie expiration is set to 365 days (one year) from the current date
- [ ] Cookie path attribute is set to "/" to make it available across the entire application
- [ ] Cookie Secure attribute is set to true to ensure transmission only over HTTPS in production
- [ ] Cookie SameSite attribute is set to "Lax" to balance security with functionality for navigation scenarios
- [ ] Module exports a function named `getGuestLanguageCookie` that retrieves the current language preference
- [ ] `getGuestLanguageCookie` parses the document.cookie string to extract the FAQBNB_GUEST_LANG value
- [ ] `getGuestLanguageCookie` returns the language code string when the cookie exists
- [ ] `getGuestLanguageCookie` returns null when the cookie does not exist or is malformed
- [ ] Cookie name constant is defined once and reused across both functions to prevent typos
- [ ] Functions include proper TypeScript type definitions for parameters and return values
- [ ] Functions include JSDoc comments explaining parameters, return values, and usage examples
- [ ] Module handles edge cases such as setting cookies in environments where document.cookie is not available

---

## Ordered Implementation Tasks

### Task 1: Create i18n Directory
**Description:** Create the `/src/lib/i18n/` directory to house localization utilities.

**Actions:**
- Create directory at `/src/lib/i18n/`

---

### Task 2: Create Cookie Utility Module with Constants
**Description:** Create the `guest-language.ts` file with module header, constants, and type definitions.

**Actions:**
- Create file `/src/lib/i18n/guest-language.ts`
- Add module header documentation with REQ reference and creation date
- Define `FAQBNB_GUEST_LANG` constant
- Define `COOKIE_EXPIRY_DAYS` constant (365)
- Add helper function for environment detection (browser check)

**Code Pattern (from session.ts):**
```typescript
/**
 * Guest Language Cookie Utility
 * Created: 2026-01-18
 * REQ-318: Create Cookie Utility for Guest Language Persistence
 *
 * Manages language preferences for unauthenticated users using cookies.
 * Cookies persist across browser sessions for one year.
 */

// Constants for cookie management
const FAQBNB_GUEST_LANG = 'FAQBNB_GUEST_LANG';
const COOKIE_EXPIRY_DAYS = 365;
```

---

### Task 3: Implement Helper Function for Browser Detection
**Description:** Create a helper function to check if document.cookie is available (browser environment).

**Actions:**
- Add private function `isBrowserEnvironment()`
- Return false for SSR context (typeof document === 'undefined')
- Follow pattern from `isLocalStorageAvailable()` in session.ts

---

### Task 4: Implement setGuestLanguageCookie Function
**Description:** Implement the function to set the guest language cookie with all security attributes.

**Actions:**
- Add exported function `setGuestLanguageCookie(languageCode: string): void`
- Calculate expiry date (current date + 365 days)
- Build cookie string with: name, value, expires, path, Secure, SameSite
- Set cookie using `document.cookie`
- Add JSDoc documentation with `@param`, `@returns`, `@example`
- Handle edge case: return early if not in browser environment

---

### Task 5: Implement getGuestLanguageCookie Function
**Description:** Implement the function to retrieve and parse the guest language cookie.

**Actions:**
- Add exported function `getGuestLanguageCookie(): string | null`
- Parse `document.cookie` string to find FAQBNB_GUEST_LANG
- Return the value if found, null otherwise
- Handle edge cases: not in browser, cookie not found, malformed cookie
- Add JSDoc documentation with `@param`, `@returns`, `@example`

---

### Task 6: Add Utility Helper for Cookie Deletion (Optional Enhancement)
**Description:** Add a helper function to clear the language cookie if needed.

**Actions:**
- Add exported function `clearGuestLanguageCookie(): void`
- Set cookie with expired date to delete
- Useful for testing and potential "reset language" feature

---

### Task 7: Verify and Test
**Description:** Verify the module exports correctly and functions work as expected.

**Actions:**
- Ensure TypeScript compilation succeeds
- Verify exports are accessible via import
- Manual test in browser console (development mode)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest language cookie utility module |

### New Functions to Implement

| Function Name | Location | Purpose |
|---------------|----------|---------|
| `setGuestLanguageCookie(languageCode: string): void` | `/src/lib/i18n/guest-language.ts` | Set language preference cookie with 1-year expiry |
| `getGuestLanguageCookie(): string \| null` | `/src/lib/i18n/guest-language.ts` | Retrieve language preference from cookie |
| `clearGuestLanguageCookie(): void` | `/src/lib/i18n/guest-language.ts` | Optional: Clear the language cookie |
| `isBrowserEnvironment(): boolean` | `/src/lib/i18n/guest-language.ts` | Private helper to check for browser context |

### New Constants to Define

| Constant | Value | Purpose |
|----------|-------|---------|
| `FAQBNB_GUEST_LANG` | `'FAQBNB_GUEST_LANG'` | Cookie name |
| `COOKIE_EXPIRY_DAYS` | `365` | Cookie expiration in days |

### Directories to Create

| Directory Path | Purpose |
|----------------|---------|
| `/src/lib/i18n/` | Container for i18n/localization utilities |

---

## Code Template

Based on existing patterns in the codebase (session.ts, room-utils.ts):

```typescript
/**
 * Guest Language Cookie Utility
 * Created: 2026-01-18
 * REQ-318: Create Cookie Utility for Guest Language Persistence
 *
 * Manages language preferences for unauthenticated guests using browser cookies.
 * Cookies persist across browser sessions for one year with proper security attributes.
 */

// Constants for cookie management
const FAQBNB_GUEST_LANG = 'FAQBNB_GUEST_LANG';
const COOKIE_EXPIRY_DAYS = 365;

/**
 * Checks if the current environment is a browser with cookie support
 * @returns True if document.cookie is available, false otherwise (SSR context)
 */
function isBrowserEnvironment(): boolean {
  return typeof document !== 'undefined' && typeof document.cookie === 'string';
}

/**
 * Sets the guest language preference cookie with security attributes
 *
 * @param languageCode - Language code to persist (e.g., 'en', 'fr', 'de', 'es', 'nl', 'it')
 * @returns void
 *
 * @example
 * // Set French as the preferred language
 * setGuestLanguageCookie('fr');
 *
 * @example
 * // Set German as the preferred language
 * setGuestLanguageCookie('de');
 */
export function setGuestLanguageCookie(languageCode: string): void {
  if (!isBrowserEnvironment()) {
    console.warn('Cannot set cookie: not in browser environment');
    return;
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

  const cookieValue = [
    `${FAQBNB_GUEST_LANG}=${encodeURIComponent(languageCode)}`,
    `expires=${expiryDate.toUTCString()}`,
    'path=/',
    'Secure',
    'SameSite=Lax',
  ].join('; ');

  document.cookie = cookieValue;
}

/**
 * Retrieves the guest language preference from cookie
 *
 * @returns Language code string if cookie exists, null if not found or not in browser
 *
 * @example
 * const lang = getGuestLanguageCookie();
 * if (lang) {
 *   console.log(`User prefers: ${lang}`);
 * } else {
 *   console.log('No language preference set');
 * }
 */
export function getGuestLanguageCookie(): string | null {
  if (!isBrowserEnvironment()) {
    return null;
  }

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === FAQBNB_GUEST_LANG && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Clears the guest language preference cookie
 * Useful for testing or implementing language reset functionality
 *
 * @example
 * // Clear the stored language preference
 * clearGuestLanguageCookie();
 */
export function clearGuestLanguageCookie(): void {
  if (!isBrowserEnvironment()) {
    return;
  }

  // Set cookie with past expiry date to delete it
  document.cookie = `${FAQBNB_GUEST_LANG}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=Lax`;
}
```

---

## Testing Considerations

### Manual Testing Steps
1. Open browser DevTools console
2. Call `setGuestLanguageCookie('fr')` - verify cookie appears in Application > Cookies
3. Refresh page - verify cookie persists
4. Call `getGuestLanguageCookie()` - verify returns 'fr'
5. Call `clearGuestLanguageCookie()` - verify cookie is removed
6. Call `getGuestLanguageCookie()` - verify returns null

### Edge Cases to Verify
- SSR context: Functions should not throw errors
- Empty language code: Cookie should still set (validation is caller's responsibility)
- Special characters in language code: Should be properly encoded/decoded
- Cookie already exists: Should overwrite with new value

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SSR context errors | Low | Medium | Browser environment check guards all functions |
| Cookie blocked by browser | Low | Low | Fallback to browser detection on each visit |
| Malformed cookie data | Low | Low | Return null if parsing fails |
| Security vulnerability | Low | High | Proper Secure and SameSite attributes |

---

## Related Documents

- **Request:** `/docs/gen_requests_epic4.md` - REQ-318
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Parent Task:** Phase 4, Task 4.1 - useGuestLanguage Hook (consumer of this utility)
- **Pattern Reference:** `/src/lib/session.ts` - Similar utility module structure

---

## Notes

- The `/src/lib/i18n/` directory structure aligns with the implementation plan's architecture
- This utility is client-side only; server-side cookie reading uses `cookies()` from `next/headers`
- The cookie name `FAQBNB_GUEST_LANG` is specified in Epic 1 Foundation as a standard constant
- Consider exporting the cookie name constant if other modules need to reference it
