# Implementation Overview: Create Server-Side Language Detection Utility

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-021 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:35 |
| Breakdown Created | 2026-01-22 19:44 |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |

---

## Goals

Create server-side language detection functions that work with Next.js Request objects. These utilities enable server components and middleware to detect guest language preferences from cookies, headers, and URL parameters using Next.js-specific APIs.

**Success Criteria:**
- Server-side language detection function exists and works with `NextRequest` objects
- Function reads language preference from URL parameters (highest priority)
- Function reads language preference from cookies (second priority)
- Function reads and parses Accept-Language headers (third priority)
- Function returns validated `SupportedLanguage` type
- Function applies correct priority order: URL param > Cookie > Accept-Language > default
- Works efficiently in both edge runtime (middleware) and Node runtime (server components)
- Cookie management utilities exist for setting/getting guest language cookie
- All functions handle missing/malformed inputs gracefully
- Functions are properly typed and integrate with existing i18n types

---

## Assumptions & Clarifications

**Assumptions:**
- REQ-E04-001 (Create Localization Types File) provides `SupportedLanguage` type and validation utilities
- Guest language cookie name is `FAQBNB_GUEST_LANG` (different from authenticated user cookie `FAQBNB_LANG`)
- Guest cookie configuration follows same security standards as user cookie (Secure, SameSite=Lax, 1-year expiry)
- Server-side detection should reuse existing parsing logic from `/src/lib/i18n/language-detection.ts` where possible
- No database queries should be performed (guest detection is stateless)
- Function signature should be compatible with both middleware and server components

**Clarifications Needed:**
- Should we create a separate guest-language.ts file or extend the existing language-detection.ts?
- **Answer:** Create separate `/src/lib/i18n/guest-language.ts` file to keep guest and user logic separate and maintainable

---

## Implementation Plan

### Step 1: Create Guest Language Types and Constants
- **Description**: Define TypeScript types, interfaces, and constants specific to guest language detection in the new guest-language.ts file
- **Rationale**: Establishes type safety and configuration before implementing detection logic. Keeps guest-specific types separate from authenticated user types.
- **Estimated Effort**: XS (15-20 minutes)

**Implementation Details:**
```typescript
// File: /src/lib/i18n/guest-language.ts

/**
 * Guest Language Detection Utility
 * Server-side language detection for unauthenticated guest users.
 *
 * Priority Order:
 * 1. URL parameter (?lang=)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Accept-Language HTTP header
 * 4. Default locale ('en')
 *
 * REQ-E04-021: Create Server-Side Language Detection Utility
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 6, Task 6.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from './config';

// =============================================================================
// Constants
// =============================================================================

/**
 * Cookie name for storing guest language preference
 * Separate from authenticated user cookie (FAQBNB_LANG)
 */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Cookie max age in seconds (1 year)
 * Same as user language cookie for consistency
 */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * Query parameter name for language selection in URLs
 */
export const LANGUAGE_URL_PARAM = 'lang';
```

### Step 2: Implement URL Parameter Validation
- **Description**: Create a function to validate and extract language codes from URL query parameters
- **Rationale**: URL parameters are highest priority for shareable links. Must validate to prevent injection attacks.
- **Estimated Effort**: S (20-30 minutes)

**Implementation Details:**
```typescript
// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Validates and extracts a supported language code from a URL parameter value.
 * Returns null if the value is invalid, missing, or not a supported language.
 *
 * @param urlParam - The raw value from searchParams.get('lang')
 * @returns A validated SupportedLocale or null
 *
 * @example
 * validateLanguageParam('fr') // Returns: 'fr'
 * validateLanguageParam('FR') // Returns: 'fr' (normalized)
 * validateLanguageParam('invalid') // Returns: null
 * validateLanguageParam(null) // Returns: null
 */
function validateLanguageParam(
  urlParam: string | null | undefined
): SupportedLocale | null {
  if (!urlParam || typeof urlParam !== 'string') {
    return null;
  }

  // Normalize to lowercase and trim whitespace
  const normalized = urlParam.toLowerCase().trim();

  // Validate against supported locales
  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  return null;
}
```

### Step 3: Implement Cookie Reading Utility
- **Description**: Create a function to read the guest language cookie from NextRequest
- **Rationale**: Cookie is second priority in detection cascade. Needs to handle missing cookies gracefully.
- **Estimated Effort**: S (15-20 minutes)

**Implementation Details:**
```typescript
/**
 * Reads the guest language preference from a cookie.
 * Returns null if cookie doesn't exist or contains an invalid value.
 *
 * @param request - The incoming Next.js request object
 * @returns The guest language from cookie if valid and supported, or null
 *
 * @example
 * const guestLang = getGuestLanguageFromCookie(request);
 * if (guestLang) {
 *   console.log('Guest prefers:', guestLang);
 * }
 */
function getGuestLanguageFromCookie(
  request: NextRequest
): SupportedLocale | null {
  const cookieValue = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}
```

### Step 4: Reuse Accept-Language Parsing Logic
- **Description**: Import and reuse the existing Accept-Language header parsing function from language-detection.ts
- **Rationale**: Don't duplicate code. The existing parsing logic is already well-tested and handles edge cases.
- **Estimated Effort**: XS (10 minutes)

**Implementation Details:**
```typescript
// Import the existing parsing function (make it exportable if it isn't)
import { parseAcceptLanguageHeader } from './language-detection';

// OR if the function isn't exported, we can copy it (but exporting is preferred)
// This function already exists in language-detection.ts (lines 85-122)
// We should just export it and import here
```

**Note:** This requires modifying `/src/lib/i18n/language-detection.ts` to export the `parseAcceptLanguageHeader` function if it's currently private.

### Step 5: Implement Main Guest Language Detection Function
- **Description**: Create the primary detection function that applies the priority cascade
- **Rationale**: This is the core function used by middleware and server components
- **Estimated Effort**: M (30-40 minutes)

**Implementation Details:**
```typescript
// =============================================================================
// Main Detection Function
// =============================================================================

/**
 * Detects the guest's preferred language using a prioritized cascade.
 * Designed for server-side use in middleware and server components.
 *
 * Priority Order:
 * 1. URL parameter (?lang=)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Accept-Language header (first supported match)
 * 4. Default locale ('en')
 *
 * @param urlLangParam - The language value from URL searchParams (e.g., searchParams.get('lang'))
 * @param request - The incoming Next.js request object
 * @returns The detected locale code (always a supported locale)
 *
 * @example
 * // In middleware
 * const urlLang = req.nextUrl.searchParams.get('lang');
 * const guestLanguage = await detectGuestLanguage(urlLang, req);
 *
 * @example
 * // In server component
 * const searchParams = await props.searchParams;
 * const guestLanguage = await detectGuestLanguage(searchParams.lang, request);
 */
export async function detectGuestLanguage(
  urlLangParam: string | string[] | null | undefined,
  request: NextRequest
): Promise<SupportedLocale> {
  // Priority 1: URL parameter
  // Handle both string and string[] (Next.js can return array for duplicate params)
  const urlParam = Array.isArray(urlLangParam) ? urlLangParam[0] : urlLangParam;
  const urlLanguage = validateLanguageParam(urlParam);

  if (urlLanguage) {
    console.log('[i18n-guest] Language detected from URL parameter:', urlLanguage);
    return urlLanguage;
  }

  // Priority 2: Cookie value
  const cookieLanguage = getGuestLanguageFromCookie(request);
  if (cookieLanguage) {
    console.log('[i18n-guest] Language detected from cookie:', cookieLanguage);
    return cookieLanguage;
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    if (isSupportedLocale(locale)) {
      console.log('[i18n-guest] Language detected from Accept-Language header:', locale);
      return locale;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

**Note:** The function is marked as `async` for consistency with potential future enhancements, even though current implementation is synchronous.

### Step 6: Implement Cookie Setting Utility
- **Description**: Create a function to set the guest language cookie on NextResponse
- **Rationale**: Middleware and server actions need to persist guest language preferences
- **Estimated Effort**: S (20-30 minutes)

**Implementation Details:**
```typescript
// =============================================================================
// Cookie Management Utilities
// =============================================================================

/**
 * Sets the guest language cookie on a Next.js response.
 * Use this to persist the guest's language preference across requests.
 *
 * Cookie configuration:
 * - Name: FAQBNB_GUEST_LANG
 * - Max Age: 1 year
 * - Secure: true (production only)
 * - HttpOnly: false (allow client-side access for language switcher)
 * - SameSite: Lax (CSRF protection)
 * - Path: / (available across entire site)
 *
 * @param response - The Next.js response to modify
 * @param language - The locale to set (must be a supported locale)
 *
 * @example
 * // In middleware
 * const res = NextResponse.next();
 * const guestLang = await detectGuestLanguage(urlParam, req);
 * setGuestLanguageCookie(res, guestLang);
 * return res;
 */
export function setGuestLanguageCookie(
  response: NextResponse,
  language: SupportedLocale
): void {
  response.cookies.set({
    name: GUEST_LANGUAGE_COOKIE_NAME,
    value: language,
    maxAge: GUEST_LANGUAGE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side access for language switcher
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

/**
 * Clears the guest language cookie from a Next.js response.
 * Use this when a guest wants to reset their language preference.
 *
 * @param response - The Next.js response to modify
 *
 * @example
 * // In API route
 * const res = NextResponse.json({ success: true });
 * clearGuestLanguageCookie(res);
 * return res;
 */
export function clearGuestLanguageCookie(response: NextResponse): void {
  response.cookies.delete(GUEST_LANGUAGE_COOKIE_NAME);
}
```

### Step 7: Export All Utilities from Module
- **Description**: Add proper exports at the end of the file with TSDoc comments
- **Rationale**: Clean module API makes it easy for other code to import these utilities
- **Estimated Effort**: XS (5-10 minutes)

**Implementation Details:**
```typescript
// =============================================================================
// Module Exports
// =============================================================================

// All exports are already defined inline above with 'export' keyword
// This section is just a reference of what's available:

/**
 * @exports detectGuestLanguage - Main detection function (async)
 * @exports setGuestLanguageCookie - Cookie setter utility
 * @exports clearGuestLanguageCookie - Cookie clearer utility
 * @exports validateLanguageParam - URL parameter validator (internal)
 * @exports GUEST_LANGUAGE_COOKIE_NAME - Cookie name constant
 * @exports GUEST_LANGUAGE_COOKIE_MAX_AGE - Cookie expiry constant
 * @exports LANGUAGE_URL_PARAM - URL param name constant
 */
```

### Step 8: Update i18n Index to Export Guest Utilities
- **Description**: Add guest language utilities to `/src/lib/i18n/index.ts` barrel exports
- **Rationale**: Provides convenient import path for consumers
- **Estimated Effort**: XS (5 minutes)

**Implementation Details:**
```typescript
// Add to /src/lib/i18n/index.ts:

// Guest Language Detection exports (REQ-E04-021)
export {
  detectGuestLanguage,
  setGuestLanguageCookie,
  clearGuestLanguageCookie,
  GUEST_LANGUAGE_COOKIE_NAME,
  GUEST_LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_URL_PARAM,
} from './guest-language';
```

### Step 9: Make Accept-Language Parser Exportable (if needed)
- **Description**: Export the `parseAcceptLanguageHeader` function from language-detection.ts if it's currently private
- **Rationale**: Allows guest-language.ts to reuse existing parsing logic
- **Estimated Effort**: XS (5 minutes)

**Implementation Details:**
```typescript
// In /src/lib/i18n/language-detection.ts
// Change line ~85 from:
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[]

// To:
export function parseAcceptLanguageHeader(acceptLanguage: string | null): string[]
```

**Alternative:** If keeping the function private is preferred, copy the implementation to guest-language.ts (but this duplicates code).

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New File Creation
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/guest-language.ts` | — | Create |

### New File Contents
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/guest-language.ts` | Constants section | Create |
| `/src/lib/i18n/guest-language.ts` | `validateLanguageParam()` | Create |
| `/src/lib/i18n/guest-language.ts` | `getGuestLanguageFromCookie()` | Create |
| `/src/lib/i18n/guest-language.ts` | `detectGuestLanguage()` | Create |
| `/src/lib/i18n/guest-language.ts` | `setGuestLanguageCookie()` | Create |
| `/src/lib/i18n/guest-language.ts` | `clearGuestLanguageCookie()` | Create |

### Existing File Modifications
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/language-detection.ts` | `parseAcceptLanguageHeader()` function (~line 85) | Export |
| `/src/lib/i18n/index.ts` | Module exports | Add |

### Type Dependencies (Verify Exist)
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/config.ts` | `SupportedLocale` type | Verify |
| `/src/lib/i18n/config.ts` | `SUPPORTED_LOCALES` constant | Verify |
| `/src/lib/i18n/config.ts` | `DEFAULT_LOCALE` constant | Verify |
| `/src/lib/i18n/config.ts` | `isSupportedLocale()` function | Verify |

---

## Dependencies

### Depends On (Completed First):
- **REQ-E04-001** (Task 1.1): Create Localization Types File - Provides `SupportedLanguage` type (NOTE: may already exist in config.ts)
- **Existing Infrastructure**: `/src/lib/i18n/config.ts` with locale types and validation
- **Existing Infrastructure**: `/src/lib/i18n/language-detection.ts` with Accept-Language parsing

### Blocks (Requires This First):
- **REQ-E04-002** (Task 1.2): Create Guest Language Utility Module - This IS that module (may be same task with different ID)
- **REQ-E04-015** (Task 4.2): Create Cookie Utility for Language Persistence - Cookie utilities are included here
- **REQ-E04-016** (Task 5.1): Update Guest Item Page Server Component - Needs `detectGuestLanguage` function
- **REQ-E04-020** (Task 6.1): Add Guest Language Detection to Middleware - Needs `detectGuestLanguage` and `setGuestLanguageCookie`

### Parallel Safety:
- **Files touched**:
  - `/src/lib/i18n/guest-language.ts` (new file)
  - `/src/lib/i18n/language-detection.ts` (minor export change)
  - `/src/lib/i18n/index.ts` (add exports)
- **Conflicts with**:
  - Any other tasks modifying language-detection.ts or i18n index
- **Safe to parallelize with**:
  - REQ-E04-017 through REQ-E04-019 (Client/server component updates)
  - REQ-E04-022 through REQ-E04-026 (Testing tasks)
  - Most other Epic 4 tasks (different files)

### External Dependencies:
- Next.js 15 server APIs: `NextRequest`, `NextResponse`
- TypeScript 5.x for type definitions
- Node.js or Edge runtime (function must work in both)

---

## Risks and Considerations

### Risk: Duplicate Logic with Existing Language Detection

**Issue:** The existing `language-detection.ts` file already has similar logic for authenticated users. Creating a separate file might lead to code duplication.

**Mitigation:**
- Reuse the `parseAcceptLanguageHeader` function by exporting it
- Document differences clearly: user detection queries DB, guest detection does not
- Consider refactoring common logic into shared utilities in the future
- For now, separation is acceptable for maintainability (guest vs user concerns)

### Risk: Function Signature Compatibility

**Issue:** The function needs to work in both middleware (has NextRequest directly) and server components (might not have NextRequest).

**Mitigation:**
- Design function signature to require NextRequest parameter explicitly
- In server components that don't have NextRequest, they can use `headers()` API instead
- Document that this function is specifically for contexts where NextRequest is available
- Consider creating a simpler version for pure server components if needed

### Risk: Edge Runtime Compatibility

**Issue:** Middleware runs in Edge runtime which has limitations compared to Node runtime.

**Mitigation:**
- Avoid Node.js-specific APIs (fs, path, etc.)
- Use only Web APIs and Next.js APIs (which work in both runtimes)
- Test in both middleware (Edge) and server components (Node)
- Current implementation uses only: `NextRequest`, `NextResponse`, string manipulation

### Risk: Type Mismatch with searchParams

**Issue:** Next.js searchParams can return `string | string[] | undefined`, which needs proper handling.

**Mitigation:**
- `validateLanguageParam` accepts `string | null | undefined`
- Main function extracts first element if array: `Array.isArray(urlLangParam) ? urlLangParam[0] : urlLangParam`
- Type signature explicitly shows: `urlLangParam: string | string[] | null | undefined`

### Risk: Cookie Security Configuration

**Issue:** Guest cookie must be secure but also accessible to client-side JavaScript (for language switcher).

**Mitigation:**
- Use `httpOnly: false` to allow client-side access (necessary for switcher)
- Set `secure: true` in production (HTTPS only)
- Use `sameSite: 'lax'` for CSRF protection
- Document this configuration clearly in code comments
- This matches the pattern of existing user language cookie

### Risk: Performance in Middleware

**Issue:** This function will run on every guest item page request in middleware. Must be fast.

**Mitigation:**
- No database queries (completely stateless)
- No external API calls
- Simple string operations and lookups
- Expected execution time: < 2ms
- Can add performance logging in development to monitor

---

## Testing Strategy

### Unit Tests

**Test file:** `/src/lib/i18n/__tests__/guest-language.test.ts`

```typescript
import { NextRequest } from 'next/server';
import {
  detectGuestLanguage,
  validateLanguageParam,
  getGuestLanguageFromCookie,
  GUEST_LANGUAGE_COOKIE_NAME,
} from '../guest-language';

describe('validateLanguageParam', () => {
  it('validates supported language codes', () => {
    expect(validateLanguageParam('en')).toBe('en');
    expect(validateLanguageParam('fr')).toBe('fr');
    expect(validateLanguageParam('es')).toBe('es');
  });

  it('normalizes uppercase to lowercase', () => {
    expect(validateLanguageParam('FR')).toBe('fr');
    expect(validateLanguageParam('Es')).toBe('es');
  });

  it('trims whitespace', () => {
    expect(validateLanguageParam('  fr  ')).toBe('fr');
  });

  it('rejects invalid language codes', () => {
    expect(validateLanguageParam('invalid')).toBeNull();
    expect(validateLanguageParam('zz')).toBeNull();
    expect(validateLanguageParam('<script>')).toBeNull();
  });

  it('handles null and undefined', () => {
    expect(validateLanguageParam(null)).toBeNull();
    expect(validateLanguageParam(undefined)).toBeNull();
  });
});

describe('getGuestLanguageFromCookie', () => {
  it('reads valid language from cookie', () => {
    const mockRequest = new NextRequest('http://localhost:3000');
    mockRequest.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'fr');

    expect(getGuestLanguageFromCookie(mockRequest)).toBe('fr');
  });

  it('returns null for invalid cookie value', () => {
    const mockRequest = new NextRequest('http://localhost:3000');
    mockRequest.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'invalid');

    expect(getGuestLanguageFromCookie(mockRequest)).toBeNull();
  });

  it('returns null when cookie absent', () => {
    const mockRequest = new NextRequest('http://localhost:3000');

    expect(getGuestLanguageFromCookie(mockRequest)).toBeNull();
  });
});

describe('detectGuestLanguage', () => {
  it('prioritizes URL parameter over cookie', async () => {
    const mockRequest = new NextRequest('http://localhost:3000');
    mockRequest.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'es');

    const result = await detectGuestLanguage('fr', mockRequest);
    expect(result).toBe('fr');
  });

  it('uses cookie when URL parameter absent', async () => {
    const mockRequest = new NextRequest('http://localhost:3000');
    mockRequest.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'es');

    const result = await detectGuestLanguage(null, mockRequest);
    expect(result).toBe('es');
  });

  it('uses Accept-Language when URL and cookie absent', async () => {
    const mockRequest = new NextRequest('http://localhost:3000', {
      headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
    });

    const result = await detectGuestLanguage(null, mockRequest);
    expect(result).toBe('de');
  });

  it('falls back to default when all sources absent', async () => {
    const mockRequest = new NextRequest('http://localhost:3000');

    const result = await detectGuestLanguage(null, mockRequest);
    expect(result).toBe('en');
  });

  it('handles array URL parameters', async () => {
    const mockRequest = new NextRequest('http://localhost:3000');

    const result = await detectGuestLanguage(['fr', 'es'], mockRequest);
    expect(result).toBe('fr'); // Uses first element
  });

  it('ignores invalid URL parameter and falls through', async () => {
    const mockRequest = new NextRequest('http://localhost:3000');
    mockRequest.cookies.set(GUEST_LANGUAGE_COOKIE_NAME, 'es');

    const result = await detectGuestLanguage('invalid', mockRequest);
    expect(result).toBe('es'); // Falls through to cookie
  });
});

describe('setGuestLanguageCookie', () => {
  it('sets cookie with correct configuration', () => {
    const mockResponse = NextResponse.next();
    setGuestLanguageCookie(mockResponse, 'fr');

    const cookie = mockResponse.cookies.get(GUEST_LANGUAGE_COOKIE_NAME);
    expect(cookie?.value).toBe('fr');
  });
});
```

### Integration Tests

**Test file:** `/src/lib/i18n/__tests__/guest-language.integration.test.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { detectGuestLanguage, setGuestLanguageCookie } from '../guest-language';

describe('Guest Language Detection - Integration', () => {
  it('full detection cycle with URL parameter', async () => {
    const req = new NextRequest('http://localhost:3000/item/abc?lang=fr');
    const urlParam = req.nextUrl.searchParams.get('lang');

    const detectedLang = await detectGuestLanguage(urlParam, req);

    expect(detectedLang).toBe('fr');
  });

  it('middleware-style usage', async () => {
    const req = new NextRequest('http://localhost:3000/item/abc');
    req.headers.set('Accept-Language', 'es-ES,es;q=0.9');

    const res = NextResponse.next();
    const urlParam = req.nextUrl.searchParams.get('lang');
    const guestLang = await detectGuestLanguage(urlParam, req);

    setGuestLanguageCookie(res, guestLang);

    expect(guestLang).toBe('es');
    expect(res.cookies.get('FAQBNB_GUEST_LANG')?.value).toBe('es');
  });
});
```

### Manual Testing Checklist

#### Basic Detection
- [ ] URL parameter `?lang=fr` returns 'fr'
- [ ] Cookie `FAQBNB_GUEST_LANG=es` returns 'es'
- [ ] Accept-Language header `de-DE` returns 'de'
- [ ] No preferences returns 'en' (default)

#### Priority Cascade
- [ ] URL param overrides cookie
- [ ] URL param overrides Accept-Language
- [ ] Cookie overrides Accept-Language
- [ ] Cookie overrides default

#### Edge Cases
- [ ] Invalid URL param `?lang=invalid` falls through to next priority
- [ ] Invalid cookie value falls through to Accept-Language
- [ ] Malformed Accept-Language header falls back to default
- [ ] Case insensitive: `?lang=FR` works (normalized to 'fr')
- [ ] Whitespace handling: `?lang= fr ` works (trimmed to 'fr')

#### Cookie Management
- [ ] Cookie set with correct name `FAQBNB_GUEST_LANG`
- [ ] Cookie has 1-year expiry
- [ ] Cookie has `secure: true` in production
- [ ] Cookie has `httpOnly: false` (client accessible)
- [ ] Cookie has `sameSite: 'lax'`
- [ ] Cookie clear function removes cookie

#### Runtime Compatibility
- [ ] Function works in Edge runtime (middleware)
- [ ] Function works in Node runtime (server components)
- [ ] No runtime-specific errors
- [ ] Performance acceptable in both runtimes (< 5ms)

---

## Out of Scope

The following are explicitly NOT part of this task:

1. **Client-Side Detection** - Client-side hooks for language detection (handled in REQ-E04-014)
2. **Database Queries** - Fetching user preferences from database (this is for guests only)
3. **Translation Fetching** - Loading translated content (handled in REQ-E04-004)
4. **Language Switcher UI** - React components for language selection (handled in REQ-E04-008)
5. **Middleware Integration** - Actually using these utilities in middleware (handled in REQ-E04-020)
6. **Server Component Integration** - Using these utilities in page.tsx (handled in REQ-E04-016)
7. **URL Parameter Updates** - Client-side URL manipulation (handled in REQ-E04-019)
8. **Geolocation Detection** - IP-based language inference
9. **Machine Learning** - Advanced language preference prediction
10. **Analytics** - Tracking language detection sources
11. **A/B Testing** - Language-based experimentation
12. **Browser Storage** - localStorage or sessionStorage (only cookies)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| File Location | `/src/lib/i18n/guest-language.ts` | Separate file keeps guest and user logic maintainable |
| Cookie Name | `FAQBNB_GUEST_LANG` | Different from user cookie prevents conflicts |
| Function Signature | Requires NextRequest parameter | Works in contexts where NextRequest available (middleware, some server actions) |
| Accept-Language Parsing | Reuse existing function | Avoid duplication; export from language-detection.ts |
| Priority Order | URL > Cookie > Header > Default | Matches product requirements for shareable links |
| Type Safety | Strict typing with SupportedLocale | Prevents invalid language codes at compile time |
| Runtime Compatibility | Use only Web APIs | Works in both Edge and Node runtimes |
| Cookie HttpOnly | false | Allows client-side language switcher access |
| Cookie Security | Secure in production, SameSite Lax | Standard security configuration |
| Async Function | Mark as async | Future-proof for potential async operations |

---

## Notes

- **Minimal Scope:** This is a focused S-sized task (2-3 hours) creating server-side utilities
- **Reuse Existing Code:** Leverages existing Accept-Language parsing logic
- **Type Safety:** Strict TypeScript types prevent invalid language codes
- **Runtime Agnostic:** Works in both Edge (middleware) and Node (server components) runtimes
- **No Side Effects:** Pure functions with no database queries or external API calls
- **Performance:** Target execution time < 2ms for detection cycle
- **Security:** Cookie configuration follows security best practices
- **Maintainability:** Separate file for guest logic keeps concerns separated
- **Testing Priority:** Focus on priority cascade, validation, and edge cases

---

**Status:** PENDING

**Next Steps:**
1. Verify dependencies exist (`SupportedLocale` type, validation functions)
2. Create `/src/lib/i18n/guest-language.ts` file
3. Implement constants and type definitions
4. Implement `validateLanguageParam` function
5. Implement `getGuestLanguageFromCookie` function
6. Export `parseAcceptLanguageHeader` from language-detection.ts
7. Implement `detectGuestLanguage` main function
8. Implement `setGuestLanguageCookie` and `clearGuestLanguageCookie` functions
9. Add exports to `/src/lib/i18n/index.ts`
10. Write comprehensive unit tests
11. Write integration tests
12. Test in both Edge and Node runtimes
13. Perform manual testing with various inputs
14. Run typecheck and fix any type errors
15. Commit changes following git conventions

---

*Document generated: 2026-01-22 19:44*
