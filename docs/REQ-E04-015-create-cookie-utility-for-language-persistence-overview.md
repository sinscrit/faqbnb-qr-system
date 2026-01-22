# Implementation Breakdown: REQ-E04-015 - Create Cookie Utility for Language Persistence

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-015 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #15 |
| **Original Request Date** | 2026-01-22 17:05 |
| **Breakdown Created** | 2026-01-22 19:25 |
| **T-shirt Size** | XS |
| **Estimated Effort** | 1-2 hours |
| **Status** | PENDING |

---

## Goals

Create cookie utility functions for guest language persistence within the `/src/lib/i18n/guest-language.ts` module. These utilities enable setting, getting, and clearing the `FAQBNB_GUEST_LANG` cookie with proper security configuration (1-year expiry, Secure, SameSite=Lax).

**Key Objectives**:
1. Set `FAQBNB_GUEST_LANG` cookie with guest language preference
2. Configure 1-year expiry (365 days)
3. Apply security flags: `Secure`, `SameSite=Lax`
4. Support both client-side (browser) and server-side (Next.js) contexts
5. Get guest language from cookie with validation
6. Clear guest language cookie when needed

---

## Implementation Plan

### 1. Define Cookie Constants

**Location**: `/src/lib/i18n/guest-language.ts`

**Approach**: Define configuration constants for the guest language cookie, following the pattern established by `useLanguagePreference.ts` and `LocaleContext.tsx`.

**Implementation Details**:

```typescript
/**
 * Guest Language Cookie Constants
 *
 * Separate from authenticated user cookie (FAQBNB_LANG) to prevent conflicts.
 * Used by guest users viewing shared item content with translations.
 *
 * @module lib/i18n/guest-language
 * @lastModified 2026-01-22
 */

/**
 * Cookie name for guest language preference
 * Separate from FAQBNB_LANG (authenticated users)
 */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Cookie expiration: 1 year in seconds
 * Balances persistence with privacy regulations
 */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * Cookie path: root
 * Makes cookie available across entire site
 */
export const GUEST_LANGUAGE_COOKIE_PATH = '/';

/**
 * SameSite policy: Lax
 * - Allows cookie on top-level navigation (shareable links work)
 * - Blocks cookie on cross-site POST requests (CSRF protection)
 */
export const GUEST_LANGUAGE_COOKIE_SAMESITE = 'Lax';
```

**Steps**:
1. Define `GUEST_LANGUAGE_COOKIE_NAME` = `'FAQBNB_GUEST_LANG'`
2. Define `GUEST_LANGUAGE_COOKIE_MAX_AGE` = `365 * 24 * 60 * 60` (1 year in seconds)
3. Define `GUEST_LANGUAGE_COOKIE_PATH` = `'/'`
4. Define `GUEST_LANGUAGE_COOKIE_SAMESITE` = `'Lax'`
5. Add JSDoc comments explaining each constant
6. Document distinction from `FAQBNB_LANG` (authenticated users)

### 2. Create setGuestLanguageCookie Function (Client-Side)

**Function**: `setGuestLanguageCookie(language: SupportedLanguage): void`

**Approach**: Set guest language cookie in browser context using `document.cookie`. Follow the pattern from `useLanguagePreference.ts` setLanguageCookie function.

**Implementation Details**:

```typescript
import type { SupportedLanguage } from '@/types';

/**
 * Set guest language preference cookie (client-side)
 *
 * Sets FAQBNB_GUEST_LANG cookie in browser with:
 * - 1 year expiration
 * - Secure flag (HTTPS only in production)
 * - SameSite=Lax (allows shareable links, prevents CSRF)
 * - Path=/ (available across entire site)
 *
 * @param language - Language code to persist
 *
 * @example
 * ```typescript
 * // User selects French
 * setGuestLanguageCookie('fr');
 * ```
 */
export function setGuestLanguageCookie(language: SupportedLanguage): void {
  if (typeof document === 'undefined') {
    console.warn('[guest-language] Cannot set cookie: document is undefined (SSR context)');
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + GUEST_LANGUAGE_COOKIE_MAX_AGE * 1000);

  // Build cookie string
  const cookieValue = `${GUEST_LANGUAGE_COOKIE_NAME}=${language}`;
  const cookiePath = `path=${GUEST_LANGUAGE_COOKIE_PATH}`;
  const cookieExpires = `expires=${expires.toUTCString()}`;
  const cookieSameSite = `SameSite=${GUEST_LANGUAGE_COOKIE_SAMESITE}`;

  // Secure flag: HTTPS only (omit in development for localhost)
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? 'Secure' : '';

  // Combine all parts
  const cookieParts = [
    cookieValue,
    cookiePath,
    cookieExpires,
    cookieSameSite,
    secureFlag,
  ].filter(Boolean);

  document.cookie = cookieParts.join('; ');

  console.log(`[guest-language] Cookie set: ${language}`);
}
```

**Steps**:
1. Check if running in browser context (`typeof document !== 'undefined'`)
2. Calculate expiration date (current time + 1 year)
3. Build cookie string with all attributes:
   - Name and value: `FAQBNB_GUEST_LANG=<language>`
   - Path: `path=/`
   - Expires: `expires=<UTC date>`
   - SameSite: `SameSite=Lax`
   - Secure: `Secure` (only in production)
4. Set cookie via `document.cookie`
5. Log success for debugging

### 3. Create getGuestLanguageCookie Function (Client-Side)

**Function**: `getGuestLanguageCookie(): SupportedLanguage | null`

**Approach**: Read and validate guest language cookie from browser. Follow the pattern from `useLanguagePreference.ts` getLanguageFromCookie function.

**Implementation Details**:

```typescript
/**
 * Get guest language preference from cookie (client-side)
 *
 * Reads FAQBNB_GUEST_LANG cookie and validates value.
 * Returns null if cookie not found or value is invalid.
 *
 * @returns Language code if valid cookie exists, null otherwise
 *
 * @example
 * ```typescript
 * const guestLang = getGuestLanguageCookie();
 * if (guestLang) {
 *   console.log('Guest prefers:', guestLang);
 * } else {
 *   console.log('No guest language preference');
 * }
 * ```
 */
export function getGuestLanguageCookie(): SupportedLanguage | null {
  if (typeof document === 'undefined') {
    console.warn('[guest-language] Cannot read cookie: document is undefined (SSR context)');
    return null;
  }

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');

    if (name === GUEST_LANGUAGE_COOKIE_NAME) {
      // Validate against SupportedLanguage type
      if (isSupportedLanguage(value)) {
        return value;
      } else {
        console.warn(`[guest-language] Invalid cookie value: ${value}`);
        return null;
      }
    }
  }

  return null;
}

/**
 * Type guard to validate SupportedLanguage
 */
function isSupportedLanguage(value: string): value is SupportedLanguage {
  const supportedLanguages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
  return supportedLanguages.includes(value as SupportedLanguage);
}
```

**Steps**:
1. Check if running in browser context
2. Split `document.cookie` by semicolon to get individual cookies
3. Find cookie with name `FAQBNB_GUEST_LANG`
4. Validate cookie value against `SupportedLanguage` type
5. Return validated language code or null
6. Include type guard helper function

### 4. Create clearGuestLanguageCookie Function (Client-Side)

**Function**: `clearGuestLanguageCookie(): void`

**Approach**: Remove guest language cookie by setting it to an expired date.

**Implementation Details**:

```typescript
/**
 * Clear guest language preference cookie (client-side)
 *
 * Removes FAQBNB_GUEST_LANG cookie by setting expired date.
 * Used when resetting guest preferences or privacy compliance.
 *
 * @example
 * ```typescript
 * // User clicks "Reset language preference"
 * clearGuestLanguageCookie();
 * ```
 */
export function clearGuestLanguageCookie(): void {
  if (typeof document === 'undefined') {
    console.warn('[guest-language] Cannot clear cookie: document is undefined (SSR context)');
    return;
  }

  // Set cookie with past expiration date
  const pastDate = new Date(0).toUTCString();

  document.cookie = `${GUEST_LANGUAGE_COOKIE_NAME}=; path=${GUEST_LANGUAGE_COOKIE_PATH}; expires=${pastDate}; SameSite=${GUEST_LANGUAGE_COOKIE_SAMESITE}`;

  console.log('[guest-language] Cookie cleared');
}
```

**Steps**:
1. Check if running in browser context
2. Set cookie with empty value and past expiration date (epoch 0)
3. Include path and SameSite for proper removal
4. Log success for debugging

### 5. Server-Side Cookie Utilities (Optional Enhancement)

**Note**: While the primary implementation focuses on client-side cookies (for useGuestLanguage hook), server-side utilities can be added for middleware/server components.

**Functions**:
- `setGuestLanguageCookieServer(response: NextResponse, language: SupportedLanguage)`
- `getGuestLanguageCookieServer(request: NextRequest): SupportedLanguage | null`

**Pattern** (from Next.js cookies API):
```typescript
import { NextRequest, NextResponse } from 'next/server';

// Server-side set
export function setGuestLanguageCookieServer(
  response: NextResponse,
  language: SupportedLanguage
): void {
  response.cookies.set({
    name: GUEST_LANGUAGE_COOKIE_NAME,
    value: language,
    path: GUEST_LANGUAGE_COOKIE_PATH,
    maxAge: GUEST_LANGUAGE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

// Server-side get
export function getGuestLanguageCookieServer(
  request: NextRequest
): SupportedLanguage | null {
  const cookieValue = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;

  if (cookieValue && isSupportedLanguage(cookieValue)) {
    return cookieValue;
  }

  return null;
}
```

**Steps**:
1. Use Next.js `response.cookies.set()` API
2. Use Next.js `request.cookies.get()` API
3. Same validation and configuration as client-side
4. Document as optional for server contexts

### 6. Add Comprehensive Documentation

**JSDoc Requirements**:
- Module-level comment explaining purpose
- Function-level comments with parameters and return types
- Usage examples for each function
- Security considerations documented
- Cross-reference with authenticated user cookies

**Example Module Header**:
```typescript
/**
 * Guest Language Cookie Utilities
 *
 * Manages language preference persistence for unauthenticated guest users.
 * Uses FAQBNB_GUEST_LANG cookie (separate from FAQBNB_LANG for authenticated users).
 *
 * Features:
 * - 1 year cookie expiration
 * - Secure flag (HTTPS only in production)
 * - SameSite=Lax (enables shareable links, prevents CSRF)
 * - Client-side and server-side support
 * - Type-safe validation against SupportedLanguage
 *
 * Security:
 * - Secure flag ensures HTTPS transmission in production
 * - SameSite=Lax prevents CSRF while allowing shareable links
 * - No sensitive data stored (only language code)
 * - Cookie accessible via JavaScript (HttpOnly not needed)
 *
 * @module lib/i18n/guest-language
 * @see REQ-E04-015 Cookie Utility for Language Persistence
 * @see REQ-E04-002 Guest Language Utility Module
 * @lastModified 2026-01-22
 */
```

---

## Authorized Files and Functions for Modification

### New File to Create (or Modify if exists from REQ-E04-002)

1. **`/src/lib/i18n/guest-language.ts`**
   - New functions (or add to existing file):
     - `GUEST_LANGUAGE_COOKIE_NAME` (constant)
     - `GUEST_LANGUAGE_COOKIE_MAX_AGE` (constant)
     - `GUEST_LANGUAGE_COOKIE_PATH` (constant)
     - `GUEST_LANGUAGE_COOKIE_SAMESITE` (constant)
     - `setGuestLanguageCookie()` (function)
     - `getGuestLanguageCookie()` (function)
     - `clearGuestLanguageCookie()` (function)
     - `isSupportedLanguage()` (helper function)
     - Optional: `setGuestLanguageCookieServer()`, `getGuestLanguageCookieServer()`

### Files to Reference (Read-Only)

1. **`/src/hooks/useLanguagePreference.ts`**
   - Reference: `setLanguageCookie()` (lines 55-61), `getLanguageFromCookie()` (lines 66-77)
   - Usage: Pattern for client-side cookie utilities

2. **`/src/contexts/LocaleContext.tsx`**
   - Reference: Cookie constants and setting pattern (line 150)
   - Usage: Consistent cookie configuration approach

3. **`/src/types/l10n.ts`** (from REQ-E04-001)
   - Reference: `SupportedLanguage` type
   - Usage: Type for cookie value validation

### Dependencies

**NPM Packages**:
- `next/server` (already installed) - NextRequest, NextResponse (for optional server-side utilities)
- `@/types` (from REQ-E04-001) - SupportedLanguage type

**No new dependencies required** - uses standard browser Cookie API and Next.js APIs

---

## Dependencies

### Depends On (Must Be Completed First)

- **REQ-E04-001**: Create Localization Types File
  - Provides: `SupportedLanguage` type
  - Required: Type validation for cookie values

### Blocks (Cannot Start Until This Completes)

- **REQ-E04-014**: Create useGuestLanguage Hook
  - Requires: `setGuestLanguageCookie()`, `getGuestLanguageCookie()`
  - Impact: Hook uses these utilities for state persistence

- **REQ-E04-002**: Create Guest Language Utility Module (if not completed)
  - Requires: Cookie utilities as part of the module
  - Impact: This task may be a subset of REQ-E04-002 Step 4

### Parallel Safety

✅ **Can be implemented in parallel with**:
- REQ-E04-008 through REQ-E04-013 (Guest UI components)
- Components don't directly use cookie utilities

**Relationship with REQ-E04-002**:
- If REQ-E04-002 creates the full `guest-language.ts` module, this task adds/enhances cookie utilities
- If REQ-E04-002 is not yet complete, this task can create the file with just cookie utilities
- Recommend coordinating with REQ-E04-002 to avoid duplicate work

**Files Touched**:
- `/src/lib/i18n/guest-language.ts` (new or modify existing)

### External Dependencies

- Browser Cookie API (`document.cookie`)
- Next.js Server Cookies API (optional, for server-side utilities)

---

## Risks and Considerations

### Technical Risks

1. **SSR/Client Hydration**
   - **Risk**: Cookie reading in SSR context causes hydration mismatch
   - **Mitigation**: Check `typeof document !== 'undefined'` before cookie operations
   - **Pattern**: Return null in SSR, read cookie in client useEffect

2. **Cookie Size Limit**
   - **Risk**: Cookies have 4KB limit per domain
   - **Mitigation**: Language code is tiny (2 chars), no concern
   - **Monitoring**: No action needed for this use case

3. **Secure Flag in Development**
   - **Risk**: Secure flag blocks cookie on localhost (HTTP)
   - **Mitigation**: Only apply Secure in production (`process.env.NODE_ENV === 'production'`)
   - **Testing**: Verify cookie works on localhost during development

4. **Cookie Validation**
   - **Risk**: Cookie might contain invalid language code
   - **Mitigation**: Validate with `isSupportedLanguage()` type guard
   - **Fallback**: Return null if invalid, let caller handle default

### Security Risks

1. **XSS Vulnerability**
   - **Risk**: Cookie accessible via JavaScript (no HttpOnly)
   - **Mitigation**: Cookie contains no sensitive data (only language code)
   - **Rationale**: HttpOnly not needed, language code is public information
   - **Note**: Different from authentication cookies which require HttpOnly

2. **CSRF Protection**
   - **Risk**: Cookie sent with cross-site requests
   - **Mitigation**: `SameSite=Lax` blocks cross-site POST while allowing navigation
   - **Benefit**: Shareable links work (top-level navigation preserves cookie)

3. **Privacy Regulations**
   - **Risk**: 1-year cookie may require consent under GDPR/CCPA
   - **Mitigation**: Language preference is functional, not tracking
   - **Classification**: Strictly necessary cookie (no consent required in most jurisdictions)
   - **Future**: Add to cookie notice if needed

### Integration Risks

1. **Overlap with REQ-E04-002**
   - **Risk**: Duplicate implementation if REQ-E04-002 already creates these functions
   - **Mitigation**: Check if REQ-E04-002 completed first, coordinate with implementation
   - **Resolution**: This task may be a focused breakdown of REQ-E04-002 Step 4

2. **Cookie Name Collision**
   - **Risk**: `FAQBNB_GUEST_LANG` might collide with other cookies
   - **Mitigation**: Prefix clearly indicates purpose, separate from `FAQBNB_LANG`
   - **Testing**: Verify both guest and authenticated cookies coexist

### Browser Compatibility Risks

1. **Cookie API Support**
   - **Risk**: Very old browsers might not support cookies properly
   - **Mitigation**: Modern browser requirement is reasonable for this app
   - **Fallback**: App works without cookie (defaults to English)

2. **Third-Party Cookie Blocking**
   - **Risk**: Some browsers block third-party cookies by default
   - **Mitigation**: This is first-party cookie (same domain), not affected
   - **Note**: SameSite=Lax is first-party cookie behavior

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Language detection logic** - Handled by REQ-E04-002 (detectGuestLanguage)
2. ❌ **Accept-Language header parsing** - Handled by REQ-E04-002 (parseAcceptLanguage)
3. ❌ **React hook implementation** - Handled by REQ-E04-014 (useGuestLanguage)
4. ❌ **UI components** - Handled by REQ-E04-008 through REQ-E04-012
5. ❌ **Server middleware** - Cookie utilities only, not middleware logic
6. ❌ **Cookie consent banner** - Not required for functional cookies
7. ❌ **Analytics tracking** - No tracking of cookie usage
8. ❌ **Cookie encryption** - Language code is public, no encryption needed
9. ❌ **Multi-domain cookies** - Single domain only (domain attribute not set)
10. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Cookie Security Configuration

**Security Flags Explained**:

| Flag | Value | Purpose |
|------|-------|---------|
| `Secure` | true (production) | HTTPS transmission only |
| `SameSite` | Lax | CSRF protection + shareable links |
| `HttpOnly` | false | Allow JavaScript access (needed for client-side) |
| `Path` | / | Available across entire site |
| `Domain` | (not set) | Current domain only (first-party) |
| `MaxAge` | 31536000 | 1 year in seconds |

**Why These Values**:
- **Secure=true**: Prevents cookie interception on HTTP
- **SameSite=Lax**: Balances security (CSRF protection) with functionality (shareable links)
- **HttpOnly=false**: Required for client-side JavaScript access
- **Path=/**: Guest can view items across entire site
- **No Domain**: First-party cookie, no subdomain sharing needed
- **MaxAge=1 year**: Long enough for persistent preference, not forever

### SameSite=Lax Behavior

**What SameSite=Lax Allows**:
```
✅ Top-level navigation (clicking link from email, bookmark)
✅ GET requests from same site
✅ JavaScript reading/writing (document.cookie)
❌ Cross-site POST requests (CSRF protection)
❌ Cross-site iframe embedding
```

**Example Scenarios**:
```typescript
// User shares link: https://faqbnb.com/items/abc123?lang=fr
// Recipient clicks link → Cookie sent with request ✅
// Recipient sees French content immediately

// Malicious site tries CSRF POST to faqbnb.com
// Cookie NOT sent → Request fails ✅
```

### Cookie String Format

**Client-Side Cookie String**:
```
FAQBNB_GUEST_LANG=fr; path=/; expires=Wed, 22 Jan 2027 19:25:00 GMT; SameSite=Lax; Secure
```

**Components**:
1. `FAQBNB_GUEST_LANG=fr` - Name and value
2. `path=/` - Available across entire site
3. `expires=<date>` - Absolute expiration date (1 year from now)
4. `SameSite=Lax` - Security policy
5. `Secure` - HTTPS only (production)

### Type Guard Pattern

**Why Type Guard**:
```typescript
// Without type guard:
const cookieValue = getCookie(); // string | undefined
const lang: SupportedLanguage = cookieValue; // ❌ Type error

// With type guard:
const cookieValue = getCookie();
if (isSupportedLanguage(cookieValue)) {
  const lang: SupportedLanguage = cookieValue; // ✅ Type safe
}
```

**Implementation**:
```typescript
function isSupportedLanguage(value: string): value is SupportedLanguage {
  return ['en', 'fr', 'es', 'de', 'nl', 'it'].includes(value as SupportedLanguage);
}
```

### Development vs Production

**Cookie Behavior Differences**:

| Environment | Secure Flag | URL | Result |
|-------------|-------------|-----|--------|
| Development | false | http://localhost:3000 | ✅ Cookie set |
| Development | true | http://localhost:3000 | ❌ Cookie blocked |
| Production | true | https://faqbnb.com | ✅ Cookie set |
| Production | false | https://faqbnb.com | ⚠️ Insecure |

**Conditional Secure Flag**:
```typescript
const isProduction = process.env.NODE_ENV === 'production';
const secureFlag = isProduction ? 'Secure' : '';
```

### Server-Side vs Client-Side

**When to Use Each**:

| Context | API | Use Case |
|---------|-----|----------|
| **Client-Side** | `document.cookie` | React components, hooks (useGuestLanguage) |
| **Server-Side** | `request.cookies` | Middleware, server components, API routes |

**Client-Side Example** (useGuestLanguage hook):
```typescript
// Set cookie when user changes language
setGuestLanguageCookie('fr');

// Read cookie on mount
const savedLang = getGuestLanguageCookie();
```

**Server-Side Example** (middleware):
```typescript
// Read cookie from request
const guestLang = getGuestLanguageCookieServer(request);

// Set cookie on response
setGuestLanguageCookieServer(response, 'es');
```

### Cookie Expiration Strategy

**Why 1 Year**:
- Long enough for persistent preference across visits
- Not forever (respects privacy, allows preference evolution)
- Standard industry practice for functional cookies
- Aligns with authenticated user cookie (`useLanguagePreference`)

**Alternatives Considered**:
- **Session cookie** (no expiry): Lost on browser close, poor UX ❌
- **30 days**: Too short, users revisit items occasionally ❌
- **1 year**: Balances persistence and privacy ✅
- **Indefinite** (10 years): Privacy concerns, overkill ❌

### Error Handling

**Graceful Degradation**:
```typescript
// Cookie utilities never throw, always return null on failure
const lang = getGuestLanguageCookie();
if (!lang) {
  // Caller handles default (usually 'en')
  return 'en';
}
```

**SSR Safety**:
```typescript
// Client-only functions check document existence
if (typeof document === 'undefined') {
  console.warn('[guest-language] SSR context, cannot access cookie');
  return null; // Caller handles gracefully
}
```

### Testing Strategy

**Manual Testing Checklist**:
- [ ] Set cookie with `setGuestLanguageCookie('fr')`
- [ ] Verify cookie exists in browser DevTools (Application > Cookies)
- [ ] Verify cookie has correct attributes (Path=/, SameSite=Lax, Secure in prod)
- [ ] Verify cookie expiration is ~1 year from now
- [ ] Read cookie with `getGuestLanguageCookie()` returns 'fr'
- [ ] Clear cookie with `clearGuestLanguageCookie()`
- [ ] Verify cookie removed from browser
- [ ] Test invalid language code in cookie returns null
- [ ] Test SSR context (server component) doesn't crash
- [ ] Test development (localhost) sets cookie without Secure
- [ ] Test production (HTTPS) sets cookie with Secure

**Unit Tests** (to be created):
```typescript
describe('Guest Language Cookie Utilities', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  });

  it('sets guest language cookie', () => {
    setGuestLanguageCookie('fr');
    expect(document.cookie).toContain('FAQBNB_GUEST_LANG=fr');
  });

  it('gets guest language cookie', () => {
    setGuestLanguageCookie('es');
    const result = getGuestLanguageCookie();
    expect(result).toBe('es');
  });

  it('returns null when cookie not set', () => {
    const result = getGuestLanguageCookie();
    expect(result).toBeNull();
  });

  it('returns null for invalid language code', () => {
    document.cookie = 'FAQBNB_GUEST_LANG=invalid';
    const result = getGuestLanguageCookie();
    expect(result).toBeNull();
  });

  it('clears guest language cookie', () => {
    setGuestLanguageCookie('de');
    clearGuestLanguageCookie();
    const result = getGuestLanguageCookie();
    expect(result).toBeNull();
  });

  it('handles SSR context gracefully', () => {
    // Mock SSR environment
    const originalDocument = global.document;
    delete (global as any).document;

    expect(() => setGuestLanguageCookie('nl')).not.toThrow();
    expect(() => getGuestLanguageCookie()).not.toThrow();
    expect(() => clearGuestLanguageCookie()).not.toThrow();

    global.document = originalDocument;
  });
});
```

---

**Last Modified**: 2026-01-22 19:25
