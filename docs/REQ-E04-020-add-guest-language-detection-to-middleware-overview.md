# REQ-E04-020: Add Guest Language Detection to Middleware - Implementation Overview

**Request ID:** REQ-E04-020
**Title:** Add Guest Language Detection to Middleware
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 6 - Middleware & Language Detection
**Task ID:** 6.1

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Add guest language detection to the Next.js middleware for `/item/*` routes. The middleware will detect the guest's preferred language from URL query parameters, cookies, and Accept-Language headers, then pass this information to downstream components via response headers and cookies. This centralizes language detection logic and eliminates code duplication across guest-facing pages without performing URL redirects.

---

## Context and Dependencies

### Implementation Plan Reference
- **Document:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Task Reference:** Phase 6: Middleware & Language Detection, Task 6.1
- **Relevant Task Details:**
  - Add `/item/*` routes to middleware matcher
  - Detect language and set header/cookie for downstream use
  - Do NOT redirect (language in query param, not path)

### Dependencies from Previous Epic 4 Tasks
| Dependency | Location | Status |
|------------|----------|--------|
| Localization Types | `/src/types/l10n.ts` | Required (REQ-E04-001) |
| Guest Language Utilities | `/src/lib/i18n/guest-language.ts` | Required (REQ-E04-002) |
| Cookie Persistence | `/src/lib/i18n/guest-language.ts` | Required (REQ-E04-015) |
| Updated Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Required (REQ-E04-016) |
| URL Parameter Support | `/src/app/item/[publicId]/page.tsx` | Required (REQ-E04-019) |

### Dependencies from Epic 1 (Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| i18n Configuration | `/src/lib/i18n/config.ts` | Available |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Available |
| `isSupportedLocale()` | `/src/lib/i18n/config.ts` | Available |
| `DEFAULT_LOCALE` constant | `/src/lib/i18n/config.ts` | Available |
| `LOCALE_COOKIE_NAME` | `/src/lib/i18n/config.ts` | Available (`FAQBNB_LANG`) |
| `LOCALE_COOKIE_MAX_AGE` | `/src/lib/i18n/config.ts` | Available (1 year) |
| `detectUserLanguage()` | `/src/lib/i18n/language-detection.ts` | Available (for authenticated users) |
| `setLocaleCookie()` | `/src/lib/i18n/language-detection.ts` | Available |

### Existing Middleware Patterns
| Pattern | Location | Relevance |
|---------|----------|-----------|
| Supabase client creation | `/src/middleware.ts` (lines 80-98) | Cookie handling pattern |
| Language detection for authenticated users | `/src/middleware.ts` (lines 123-163) | Detection cascade pattern |
| Route matching | `/src/middleware.ts` (lines 285-299) | Config matcher syntax |
| Header setting | `/src/middleware.ts` (line 144) | `x-locale` header pattern |
| Cookie optimization | `/src/middleware.ts` (lines 147-154) | Only update if changed |
| OAuth callback exemption | `/src/middleware.ts` (lines 50-64) | Early return pattern |
| QR print exemption | `/src/middleware.ts` (lines 100-105) | Route exemption pattern |

---

## Technical Specification

### Current Middleware Behavior

The existing middleware at `/src/middleware.ts`:
1. Handles OAuth callbacks and authentication
2. Creates Supabase server client with cookie handling
3. Detects language for **authenticated users** using priority cascade
4. Sets `x-locale` header and `FAQBNB_LANG` cookie
5. Protects admin/dashboard routes
6. Does NOT intercept `/item/*` routes (not in matcher)

### New Behavior for Guest Item Pages

For `/item/*` routes, the middleware will:
1. Extract language from URL query parameter (`?lang=xx`)
2. Fall back to guest language cookie (`FAQBNB_GUEST_LANG`)
3. Fall back to Accept-Language header parsing
4. Default to English if nothing detected
5. Set `x-guest-language` header for server components
6. Update guest language cookie for persistence
7. Allow request to proceed **without redirect**

### Language Detection Priority (Guests)

```
Priority 1: URL parameter (?lang=es) - Highest
    ↓
Priority 2: Cookie (FAQBNB_GUEST_LANG)
    ↓
Priority 3: Accept-Language header
    ↓
Priority 4: Default ('en')
```

### Header and Cookie Strategy

```typescript
// Response header for server components to read
res.headers.set('x-guest-language', detectedLanguage);

// Cookie for guest preference persistence
// Name: FAQBNB_GUEST_LANG
// Expiry: 1 year
// Secure: true (production only)
// SameSite: Lax
// Path: /
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Separate guest cookie | `FAQBNB_GUEST_LANG` | Keep guest preferences separate from authenticated user preferences |
| No URL redirect | Pass-through with header | Language in query param, not path; QR codes already printed |
| Header name | `x-guest-language` | Distinct from `x-locale` used for authenticated users |
| Cookie update logic | Only if changed | Optimization to avoid unnecessary cookie writes |
| Invalid language handling | Silent fallback | Don't block page; gracefully degrade to next priority |

---

## Implementation Tasks

### Task 1: Update Middleware Matcher Configuration
**File:** `/src/middleware.ts`

Add `/item/*` routes to the matcher:
```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/dashboard/:path*',
    '/dashboard',
    '/dashboard2/:path*',
    '/dashboard2',
    '/login',
    '/auth/oauth/callback',
    '/register',
    '/register/:path*',
    '/item/:path*',  // NEW: Guest item pages
  ],
}
```

### Task 2: Define Guest Language Cookie Name Constant
**File:** `/src/lib/i18n/config.ts`

Add constant for guest-specific cookie (if not already defined):
```typescript
/**
 * Cookie name for storing GUEST language preference
 * Separate from authenticated user preference (FAQBNB_LANG)
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
```

### Task 3: Add Guest Language Detection Function
**File:** `/src/middleware.ts` or `/src/lib/i18n/language-detection.ts`

Create a function for guest-specific language detection:
```typescript
import {
  isSupportedLocale,
  DEFAULT_LOCALE,
  type SupportedLocale
} from '@/lib/i18n/config';

/**
 * Detect guest's preferred language from request
 * Priority: URL param > Cookie > Accept-Language > Default
 *
 * @param request - Next.js request object
 * @returns Detected supported locale
 */
function detectGuestLanguage(request: NextRequest): SupportedLocale {
  // Priority 1: URL parameter (?lang=xx)
  const urlLang = request.nextUrl.searchParams.get('lang');
  if (urlLang) {
    const normalized = urlLang.toLowerCase();
    if (isSupportedLocale(normalized)) {
      console.log('[i18n-guest] Language from URL param:', normalized);
      return normalized;
    }
    console.log('[i18n-guest] Invalid URL lang param, ignoring:', urlLang);
  }

  // Priority 2: Guest cookie
  const cookieLang = request.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;
  if (cookieLang && isSupportedLocale(cookieLang)) {
    console.log('[i18n-guest] Language from cookie:', cookieLang);
    return cookieLang;
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const parsed = parseAcceptLanguageHeader(acceptLanguage);
    for (const locale of parsed) {
      if (isSupportedLocale(locale)) {
        console.log('[i18n-guest] Language from Accept-Language:', locale);
        return locale;
      }
    }
  }

  // Priority 4: Default
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

### Task 4: Add Accept-Language Parser (if not accessible)
**File:** `/src/middleware.ts`

If the existing `parseAcceptLanguageHeader` is not exported, create a local version:
```typescript
/**
 * Parse Accept-Language header and return language codes sorted by preference
 * Example: "fr-FR, en;q=0.9, de;q=0.8" → ['fr', 'en', 'de']
 */
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) return [];

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');
      const primaryCode = code.split('-')[0].toLowerCase();
      const quality = qValue ? parseFloat(qValue) : 1.0;
      return { locale: primaryCode, quality: isNaN(quality) ? 0 : quality };
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
```

### Task 5: Add Guest Item Route Handler in Middleware
**File:** `/src/middleware.ts`

Add handling for `/item/*` routes after the early returns:
```typescript
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ... existing early returns for OAuth callback, QR print, etc.

  // ============ GUEST ITEM PAGE LANGUAGE DETECTION ============
  if (req.nextUrl.pathname.startsWith('/item/')) {
    console.log('[MIDDLEWARE-GUEST] Processing guest item page:', req.nextUrl.pathname);

    // Detect guest language
    const detectedLanguage = detectGuestLanguage(req);

    // Set header for server components to read
    res.headers.set('x-guest-language', detectedLanguage);

    // Update cookie if language changed (optimization)
    const currentCookieLocale = req.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;
    if (currentCookieLocale !== detectedLanguage) {
      setGuestLocaleCookie(res, detectedLanguage);
      console.log('[MIDDLEWARE-GUEST] Updated guest cookie:', {
        previous: currentCookieLocale || 'none',
        new: detectedLanguage,
      });
    }

    console.log('[MIDDLEWARE-GUEST] Language detection complete:', {
      detected: detectedLanguage,
      source: req.nextUrl.searchParams.get('lang') ? 'url_param' :
              currentCookieLocale ? 'cookie' : 'detection',
      path: req.nextUrl.pathname,
    });

    // Allow request to proceed WITHOUT redirect
    return res;
  }
  // ============ END GUEST ITEM PAGE LANGUAGE DETECTION ============

  // ... rest of existing middleware (Supabase client, auth checks, etc.)
}
```

### Task 6: Add Guest Cookie Setter Function
**File:** `/src/middleware.ts` or `/src/lib/i18n/language-detection.ts`

Create function to set guest language cookie:
```typescript
import { LOCALE_COOKIE_MAX_AGE } from '@/lib/i18n/config';

const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/**
 * Set guest language cookie on response
 */
function setGuestLocaleCookie(
  response: NextResponse,
  locale: SupportedLocale
): void {
  response.cookies.set({
    name: GUEST_LOCALE_COOKIE_NAME,
    value: locale,
    maxAge: LOCALE_COOKIE_MAX_AGE, // 1 year
    path: '/',
    httpOnly: false, // Allow client-side access for language switcher
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
```

### Task 7: Update i18n Index Exports (Optional)
**File:** `/src/lib/i18n/index.ts`

If adding new constants/functions to i18n module, update exports:
```typescript
export {
  // ... existing exports
  GUEST_LOCALE_COOKIE_NAME,
} from './config';
```

### Task 8: Add Type Definitions for Guest Language Header
**File:** `/src/types/l10n.ts` or inline in middleware

Define header name constant for consistency:
```typescript
/**
 * HTTP header name for guest language detection result
 * Set by middleware, read by server components
 */
export const GUEST_LANGUAGE_HEADER = 'x-guest-language';
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/middleware.ts` | Add `/item/*` to matcher, add guest language detection handler |
| `/src/lib/i18n/config.ts` | Add `GUEST_LOCALE_COOKIE_NAME` constant |
| `/src/lib/i18n/index.ts` | Export new constant |

### Existing Functions to Extend

| File | Function/Section | Modification |
|------|------------------|--------------|
| `/src/middleware.ts` | `middleware()` | Add guest item page handler before auth checks |
| `/src/middleware.ts` | `config.matcher` | Add `/item/:path*` pattern |

### New Functions to Add

| File | Function | Purpose |
|------|----------|---------|
| `/src/middleware.ts` | `detectGuestLanguage()` | Detect guest language with URL > Cookie > Header priority |
| `/src/middleware.ts` | `setGuestLocaleCookie()` | Set guest preference cookie on response |
| `/src/middleware.ts` | `parseAcceptLanguageHeader()` | Parse Accept-Language header (if not reusing existing) |

### New Constants to Add

| File | Constant | Value | Purpose |
|------|----------|-------|---------|
| `/src/lib/i18n/config.ts` | `GUEST_LOCALE_COOKIE_NAME` | `'FAQBNB_GUEST_LANG'` | Cookie name for guest language |
| `/src/middleware.ts` | `GUEST_LANGUAGE_HEADER` | `'x-guest-language'` | Response header name |

### External Dependencies to Import

| Import | From | Purpose |
|--------|------|---------|
| `isSupportedLocale` | `@/lib/i18n/config` | Validate language codes |
| `DEFAULT_LOCALE` | `@/lib/i18n/config` | Fallback language |
| `LOCALE_COOKIE_MAX_AGE` | `@/lib/i18n/config` | Cookie expiration (1 year) |
| `type SupportedLocale` | `@/lib/i18n/config` | TypeScript type for language codes |

---

## Data Flow

```
Guest visits: /item/ABC123?lang=es
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     Next.js Middleware                   │
    │     Path matches /item/*                 │
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     detectGuestLanguage(request)         │
    │                                          │
    │  1. Check URL param: ?lang=es ✓          │
    │     → Returns 'es' (priority 1)          │
    │                                          │
    │  (If no URL param, check cookie)         │
    │  (If no cookie, check Accept-Language)   │
    │  (If nothing, default to 'en')           │
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     Set Response Headers & Cookies       │
    │                                          │
    │  res.headers.set('x-guest-language', 'es')│
    │  res.cookies.set('FAQBNB_GUEST_LANG', 'es')│
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     Return NextResponse.next()           │
    │     (NO REDIRECT - language in param)    │
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │     Server Component (page.tsx)          │
    │                                          │
    │  Can read x-guest-language header        │
    │  OR re-detect from searchParams/cookies  │
    │  (Header provides optimization)          │
    └─────────────────────────────────────────┘
```

---

## Code Structure Reference

### Complete Middleware Guest Handler

```typescript
// /src/middleware.ts
// REQ-E04-020: Add guest language detection to middleware
// Last Modified: 2026-01-20

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n'
import {
  isSupportedLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  type SupportedLocale,
} from '@/lib/i18n/config';

// Guest-specific constants
const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
const GUEST_LANGUAGE_HEADER = 'x-guest-language';

/**
 * Parse Accept-Language header into sorted language codes
 */
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) return [];

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');
      const primaryCode = code.split('-')[0].toLowerCase();
      const quality = qValue ? parseFloat(qValue) : 1.0;
      return { locale: primaryCode, quality: isNaN(quality) ? 0 : quality };
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
 * Detect guest's preferred language
 * Priority: URL param > Cookie > Accept-Language > Default
 */
function detectGuestLanguage(request: NextRequest): SupportedLocale {
  // Priority 1: URL parameter (?lang=xx)
  const urlLang = request.nextUrl.searchParams.get('lang');
  if (urlLang) {
    const normalized = urlLang.toLowerCase();
    if (isSupportedLocale(normalized)) {
      return normalized;
    }
  }

  // Priority 2: Guest cookie
  const cookieLang = request.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;
  if (cookieLang && isSupportedLocale(cookieLang)) {
    return cookieLang;
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const parsed = parseAcceptLanguageHeader(acceptLanguage);
    for (const locale of parsed) {
      if (isSupportedLocale(locale)) {
        return locale;
      }
    }
  }

  // Priority 4: Default
  return DEFAULT_LOCALE;
}

/**
 * Set guest language cookie on response
 */
function setGuestLocaleCookie(
  response: NextResponse,
  locale: SupportedLocale
): void {
  response.cookies.set({
    name: GUEST_LOCALE_COOKIE_NAME,
    value: locale,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ============ OAUTH CALLBACK DETECTION (existing) ============
  if (req.nextUrl.pathname === '/auth/oauth/callback') {
    // ... existing OAuth handling
    return res;
  }

  // ============ GUEST ITEM PAGE LANGUAGE DETECTION (NEW) ============
  if (req.nextUrl.pathname.startsWith('/item/')) {
    const detectedLanguage = detectGuestLanguage(req);

    // Set header for server components
    res.headers.set(GUEST_LANGUAGE_HEADER, detectedLanguage);

    // Update cookie if changed
    const currentCookieLocale = req.cookies.get(GUEST_LOCALE_COOKIE_NAME)?.value;
    if (currentCookieLocale !== detectedLanguage) {
      setGuestLocaleCookie(res, detectedLanguage);
      console.log('[MIDDLEWARE-GUEST] Language:', {
        detected: detectedLanguage,
        path: req.nextUrl.pathname,
      });
    }

    // Allow request to proceed WITHOUT redirect
    return res;
  }
  // ============ END GUEST ITEM PAGE HANDLING ============

  // ... rest of existing middleware code
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/dashboard/:path*',
    '/dashboard',
    '/dashboard2/:path*',
    '/dashboard2',
    '/login',
    '/auth/oauth/callback',
    '/register',
    '/register/:path*',
    '/item/:path*',  // NEW: Guest item pages
  ],
}
```

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Middleware matcher includes `/item/*` | `'/item/:path*'` added to config.matcher |
| Middleware executes for all `/item/*` paths | Path check with `startsWith('/item/')` |
| Middleware checks URL query parameter | `request.nextUrl.searchParams.get('lang')` |
| URL param takes priority when valid | First priority in detection cascade |
| Fallback to cookie when no URL param | Second priority check |
| Fallback to Accept-Language when no cookie | Third priority with header parsing |
| Default to English when nothing detected | Returns `DEFAULT_LOCALE` ('en') |
| Validates language codes against supported list | `isSupportedLocale()` validation |
| Invalid codes ignored with fallback | Silent fallthrough to next priority |
| Sets custom response header | `res.headers.set('x-guest-language', ...)` |
| Header follows naming convention | `x-guest-language` or `x-faqbnb-lang` |
| Sets/updates guest language cookie | `setGuestLocaleCookie()` function |
| Cookie expiration 1 year | `LOCALE_COOKIE_MAX_AGE` (365 * 24 * 60 * 60) |
| Cookie path is `/` | `path: '/'` in cookie options |
| Cookie has Secure flag (production) | `secure: process.env.NODE_ENV === 'production'` |
| Cookie has SameSite=Lax | `sameSite: 'lax'` |
| NO URL redirects performed | Returns `res` (NextResponse.next()) |
| NO query parameters modified | URL unchanged |
| Language stays in query param format | Not moved to path |
| Request proceeds to page component | Early return with `res` |
| Errors handled gracefully | Try-catch with fallback to allow request |
| Follows Next.js 13+ middleware patterns | Uses NextRequest/NextResponse |
| TypeScript types properly defined | `SupportedLocale` type used |
| Performs efficiently | Cookie only updated if changed |
| No conflict with existing middleware | Separate code path before auth checks |

---

## Testing Considerations

### Unit Test Scenarios

1. **URL parameter detection:** `?lang=es` returns Spanish
2. **Case insensitivity:** `?lang=ES` normalizes and returns Spanish
3. **Invalid URL param fallback:** `?lang=xyz` falls to cookie/header
4. **Cookie detection:** Cookie value takes priority over header
5. **Accept-Language parsing:** Header `"fr-FR, en;q=0.9"` returns French
6. **Quality value sorting:** Lower quality values ranked lower
7. **Default fallback:** No language info returns English
8. **Header setting:** `x-guest-language` header contains detected value
9. **Cookie optimization:** Cookie only set when value changes

### Integration Test Scenarios

1. Visit `/item/ABC123?lang=fr` - header set to `fr`, cookie updated
2. Visit `/item/ABC123` with French cookie - header set to `fr`
3. Visit `/item/ABC123` with French browser - header set to `fr`
4. Visit `/item/ABC123` with no preferences - header set to `en`
5. Protected routes still require authentication
6. OAuth callbacks still work correctly

### Manual Test Scenarios

1. **URL parameter test:**
   - Visit `/item/ABC123?lang=es`
   - Check response headers for `x-guest-language: es`
   - Verify cookie `FAQBNB_GUEST_LANG=es` is set

2. **Cookie persistence test:**
   - Visit `/item/ABC123?lang=fr`
   - Navigate to `/item/XYZ789` (no lang param)
   - Verify French is detected from cookie

3. **Browser language test:**
   - Clear cookies
   - Set browser language to German
   - Visit `/item/ABC123`
   - Verify German is detected

4. **No redirect verification:**
   - Visit `/item/ABC123?lang=es`
   - URL should remain unchanged
   - No redirect should occur

5. **Protected route unaffected:**
   - Visit `/dashboard2` while unauthenticated
   - Should still redirect to login

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Middleware latency increase | Low | Medium | Guest detection is lightweight; no DB calls |
| Conflict with auth middleware | Medium | High | Guest handler returns early before auth checks |
| Cookie conflicts with user cookie | Low | Medium | Separate cookie names (GUEST vs standard) |
| Header not read by page | Medium | Medium | Page can still detect from searchParams/cookie |
| Invalid language causes error | Low | Low | All validation is silent with fallbacks |
| Performance regression | Low | Low | Cookie update optimization; minimal processing |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-020
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Middleware:** `/src/middleware.ts`
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Language Detection:** `/src/lib/i18n/language-detection.ts`
- **Guest Item Page:** `/src/app/item/[publicId]/page.tsx`
- **Related Tasks:**
  - REQ-E04-002 (Guest Language Utilities) - Detection functions
  - REQ-E04-015 (Cookie Utility) - Cookie persistence
  - REQ-E04-016 (Guest Item Page) - Page-level language handling
  - REQ-E04-019 (URL Parameters) - Shareable link support
- **Next.js Middleware Docs:** https://nextjs.org/docs/app/building-your-application/routing/middleware
