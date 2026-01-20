# REQ-E04-020: Add Guest Language Detection to Middleware - Detailed Task Breakdown

**Request ID:** REQ-E04-020
**Title:** Add Guest Language Detection to Middleware
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 6 - Middleware & Language Detection
**Task ID:** 6.1

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

**Overview Document:** REQ-E04-020-add-guest-language-detection-to-middleware-overview.md
**Implementation Plan:** Plan-111-L10N-Epic4-Guest-Experience.md
**Requirements:** gen_requests_epic4.md (Request #20)

---

## Summary

This document provides a detailed, step-by-step task breakdown for adding guest language detection to the Next.js middleware for `/item/*` routes. The implementation adds guest-specific language detection (URL param > Cookie > Accept-Language > Default) and sets response headers/cookies for downstream components without performing URL redirects.

---

## Prerequisites

### Required Dependencies (Must Be Complete)

| Dependency | Location | Status Check |
|------------|----------|--------------|
| i18n Configuration | `/src/lib/i18n/config.ts` | Verify `isSupportedLocale()`, `DEFAULT_LOCALE`, `LOCALE_COOKIE_MAX_AGE` exist |
| SupportedLocale type | `/src/lib/i18n/config.ts` | Verify type is exported |
| Existing middleware | `/src/middleware.ts` | Verify file exists and has expected structure |

### Files to Read Before Starting

1. `/src/middleware.ts` - Current middleware implementation (lines 1-300)
2. `/src/lib/i18n/config.ts` - i18n configuration (lines 1-207)
3. `/src/lib/i18n/index.ts` - i18n exports

---

## Task Breakdown

### Task 1: Add GUEST_LOCALE_COOKIE_NAME Constant to i18n Config

**File:** `/src/lib/i18n/config.ts`
**Estimated Effort:** 1 story point
**Dependencies:** None

#### Description
Add a constant for the guest-specific language cookie name, separate from the authenticated user cookie.

#### Implementation Steps

1. **Read the current file** to verify structure and find insertion point after `LOCALE_COOKIE_NAME`

2. **Add the guest cookie constant** after line 48 (after `LOCALE_COOKIE_NAME`):
```typescript
/**
 * Cookie name for storing GUEST language preference
 * Separate from authenticated user preference (FAQBNB_LANG)
 * Used by middleware and guest pages for anonymous visitors
 */
export const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] Constant is exported and accessible via `import { GUEST_LOCALE_COOKIE_NAME } from '@/lib/i18n/config'`
- [ ] Build succeeds: `npm run build`

#### Acceptance Criteria
- [ ] `GUEST_LOCALE_COOKIE_NAME` constant exists with value `'FAQBNB_GUEST_LANG'`
- [ ] Constant has JSDoc documentation
- [ ] No breaking changes to existing exports

---

### Task 2: Export Guest Cookie Constant from i18n Index

**File:** `/src/lib/i18n/index.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### Description
Export the new guest cookie constant from the i18n module barrel export.

#### Implementation Steps

1. **Read the current file** to understand existing exports

2. **Add export** for the new constant:
```typescript
export {
  // ... existing exports
  GUEST_LOCALE_COOKIE_NAME,
} from './config';
```

#### Verification Steps
- [ ] Import works: `import { GUEST_LOCALE_COOKIE_NAME } from '@/lib/i18n'`
- [ ] Build succeeds: `npm run build`

#### Acceptance Criteria
- [ ] `GUEST_LOCALE_COOKIE_NAME` is accessible from `@/lib/i18n`
- [ ] No breaking changes to existing imports

---

### Task 3: Add /item/* Routes to Middleware Matcher Configuration

**File:** `/src/middleware.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** None

#### Description
Add `/item/:path*` to the middleware matcher configuration so the middleware intercepts guest item page requests.

#### Implementation Steps

1. **Locate the config object** at the end of the file (around line 285-299)

2. **Add the item route pattern** to the matcher array:
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
    '/item/:path*',  // NEW: Guest item pages for language detection
  ],
}
```

#### Verification Steps
- [ ] Middleware executes when visiting `/item/test-public-id`
- [ ] Existing routes still work correctly (test `/dashboard2`, `/login`)
- [ ] Build succeeds: `npm run build`

#### Acceptance Criteria
- [ ] Pattern `/item/:path*` is in the matcher array
- [ ] Middleware executes for all `/item/*` paths
- [ ] No breaking changes to existing matcher behavior

---

### Task 4: Add Accept-Language Header Parser Function

**File:** `/src/middleware.ts`
**Estimated Effort:** 1 story point
**Dependencies:** None

#### Description
Add a helper function to parse the Accept-Language HTTP header and return sorted language codes by preference.

#### Implementation Steps

1. **Add the function** near the top of the file, after the imports (around line 12):

```typescript
/**
 * Parse Accept-Language header and return language codes sorted by preference
 * Handles format: "fr-FR, en;q=0.9, de;q=0.8" → ['fr', 'en', 'de']
 *
 * @param acceptLanguage - The Accept-Language header value
 * @returns Array of language codes sorted by quality value (highest first)
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

  // Deduplicate while preserving order
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

#### Verification Steps
- [ ] Function parses `"fr-FR, en;q=0.9, de;q=0.8"` → `['fr', 'en', 'de']`
- [ ] Function handles `"en-US"` → `['en']`
- [ ] Function handles empty/null input → `[]`
- [ ] Function handles `"*"` (wildcard) by filtering it out
- [ ] TypeScript compiles without errors

#### Acceptance Criteria
- [ ] Function exists and is correctly implemented
- [ ] Quality values are respected in sorting
- [ ] Regional codes (e.g., `fr-FR`) are normalized to base codes (`fr`)
- [ ] Duplicate codes are removed
- [ ] Edge cases handled gracefully

---

### Task 5: Add Guest Language Detection Function

**File:** `/src/middleware.ts`
**Estimated Effort:** 1.5 story points
**Dependencies:** Task 4

#### Description
Add a function to detect the guest's preferred language using the priority cascade: URL param > Cookie > Accept-Language > Default.

#### Implementation Steps

1. **Add required imports** at the top of the file (if not already present):
```typescript
import {
  isSupportedLocale,
  DEFAULT_LOCALE,
  type SupportedLocale,
} from '@/lib/i18n/config';
```

2. **Add the guest cookie constant** after imports:
```typescript
// Guest-specific constants
const GUEST_LOCALE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
const GUEST_LANGUAGE_HEADER = 'x-guest-language';
```

3. **Add the detection function** after `parseAcceptLanguageHeader`:

```typescript
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

#### Verification Steps
- [ ] URL param `?lang=es` returns `'es'`
- [ ] URL param `?lang=ES` (uppercase) returns `'es'`
- [ ] Invalid URL param `?lang=xyz` falls through to cookie/header
- [ ] Cookie `FAQBNB_GUEST_LANG=fr` returns `'fr'` when no URL param
- [ ] Accept-Language header `fr-FR` returns `'fr'` when no URL param or cookie
- [ ] Returns `'en'` when nothing detected
- [ ] TypeScript compiles without errors

#### Acceptance Criteria
- [ ] Function follows documented priority cascade
- [ ] Only returns valid `SupportedLocale` values
- [ ] Console logging provides debugging visibility
- [ ] Invalid inputs handled gracefully with fallback

---

### Task 6: Add Guest Cookie Setter Function

**File:** `/src/middleware.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 5

#### Description
Add a function to set the guest language cookie on the response with appropriate security settings.

#### Implementation Steps

1. **Add the import** for `LOCALE_COOKIE_MAX_AGE` if not already present:
```typescript
import {
  isSupportedLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  type SupportedLocale,
} from '@/lib/i18n/config';
```

2. **Add the cookie setter function** after `detectGuestLanguage`:

```typescript
/**
 * Set guest language cookie on response
 * Uses security settings appropriate for guest preferences
 *
 * @param response - Next.js response object
 * @param locale - The locale to set
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

#### Verification Steps
- [ ] Cookie is set with correct name `FAQBNB_GUEST_LANG`
- [ ] Cookie expiration is 1 year
- [ ] Cookie path is `/`
- [ ] Cookie has `Secure` flag in production
- [ ] Cookie has `SameSite=Lax`
- [ ] TypeScript compiles without errors

#### Acceptance Criteria
- [ ] Function correctly sets cookie with all required attributes
- [ ] Cookie is accessible to client-side JavaScript (`httpOnly: false`)
- [ ] Security attributes match specification

---

### Task 7: Add Guest Item Route Handler in Middleware

**File:** `/src/middleware.ts`
**Estimated Effort:** 2 story points
**Dependencies:** Tasks 3, 5, 6

#### Description
Add the main handler logic in the middleware function to process `/item/*` routes with guest language detection.

#### Implementation Steps

1. **Locate the insertion point** in the middleware function - after the OAuth callback handling (around line 64) and before the Supabase client creation (line 80)

2. **Add the guest item page handler**:

```typescript
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ============ OAUTH CALLBACK DETECTION (existing) ============
  if (req.nextUrl.pathname === '/auth/oauth/callback') {
    // ... existing OAuth handling stays here
    return res;
  }

  // Also log when users hit /register after OAuth (existing)
  if (req.nextUrl.pathname === '/register' && req.nextUrl.searchParams.get('oauth_success')) {
    // ... existing logging stays here
  }

  // ============ GUEST ITEM PAGE LANGUAGE DETECTION (NEW) ============
  if (req.nextUrl.pathname.startsWith('/item/')) {
    console.log('[MIDDLEWARE-GUEST] Processing guest item page:', req.nextUrl.pathname);

    try {
      // Detect guest language using priority cascade
      const detectedLanguage = detectGuestLanguage(req);

      // Set header for server components to read
      res.headers.set(GUEST_LANGUAGE_HEADER, detectedLanguage);

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
                currentCookieLocale ? 'cookie' : 'header_or_default',
        path: req.nextUrl.pathname,
      });

      // Allow request to proceed WITHOUT redirect
      return res;
    } catch (error) {
      // On error, still allow the request to proceed with default language
      console.error('[MIDDLEWARE-GUEST] Error in language detection, allowing request:', error);
      res.headers.set(GUEST_LANGUAGE_HEADER, DEFAULT_LOCALE);
      return res;
    }
  }
  // ============ END GUEST ITEM PAGE LANGUAGE DETECTION ============

  // Continue with existing middleware logic (Supabase client, auth checks, etc.)
  const supabase = createServerClient<Database>(
    // ... rest of existing code
```

#### Verification Steps
- [ ] `/item/abc123` triggers the guest handler and returns
- [ ] `/item/abc123?lang=fr` sets `x-guest-language: fr` header
- [ ] Cookie is set/updated correctly
- [ ] Protected routes (`/dashboard2`) still work (not affected by early return)
- [ ] OAuth callback still works
- [ ] No redirect occurs for `/item/*` routes
- [ ] Error handling allows request to proceed

#### Acceptance Criteria
- [ ] Handler executes for all `/item/*` paths
- [ ] Handler returns early without executing auth checks
- [ ] Header `x-guest-language` is set on response
- [ ] Cookie is only updated when value changes
- [ ] No URL redirects performed
- [ ] Errors don't block the request

---

### Task 8: Verify Build and Type Safety

**File:** All modified files
**Estimated Effort:** 0.5 story points
**Dependencies:** Tasks 1-7

#### Description
Run the build process and verify all TypeScript types are correct.

#### Implementation Steps

1. **Run TypeScript check**:
```bash
npm run type-check
# or if not available:
npx tsc --noEmit
```

2. **Run build**:
```bash
npm run build
```

3. **Check for any warnings or errors**

#### Verification Steps
- [ ] TypeScript compiles without errors
- [ ] Build completes successfully
- [ ] No new warnings introduced

#### Acceptance Criteria
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No new linting warnings

---

## Testing Scenarios

### Manual Testing Checklist

#### 1. URL Parameter Test
- [ ] Visit `/item/ABC123?lang=es`
- [ ] Check browser DevTools Network tab for response headers
- [ ] Verify `x-guest-language: es` header is present
- [ ] Verify cookie `FAQBNB_GUEST_LANG=es` is set
- [ ] URL should remain unchanged (no redirect)

#### 2. Cookie Persistence Test
- [ ] Visit `/item/ABC123?lang=fr` (sets French)
- [ ] Navigate to `/item/XYZ789` (no lang param)
- [ ] Verify French is detected from cookie (`x-guest-language: fr`)

#### 3. Browser Language Test
- [ ] Clear all cookies for the site
- [ ] Set browser language to German (de-DE)
- [ ] Visit `/item/ABC123` (no lang param)
- [ ] Verify German is detected (`x-guest-language: de`)

#### 4. Default Fallback Test
- [ ] Clear all cookies
- [ ] Set browser to unsupported language (e.g., Japanese)
- [ ] Visit `/item/ABC123`
- [ ] Verify English is used (`x-guest-language: en`)

#### 5. Invalid Language Parameter Test
- [ ] Visit `/item/ABC123?lang=xyz`
- [ ] Verify fallback to cookie/header/default occurs
- [ ] Invalid param should be silently ignored

#### 6. Protected Route Verification
- [ ] While logged out, visit `/dashboard2`
- [ ] Should still redirect to `/login` (not broken by new handler)

#### 7. Case Insensitivity Test
- [ ] Visit `/item/ABC123?lang=ES` (uppercase)
- [ ] Should work correctly and normalize to `es`

---

## Files Modified Summary

| File | Change Type | Lines Changed (Approx) |
|------|-------------|------------------------|
| `/src/lib/i18n/config.ts` | Add constant | +6 lines |
| `/src/lib/i18n/index.ts` | Add export | +1 line |
| `/src/middleware.ts` | Add handler + functions | +100 lines |

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate rollback**: Remove `/item/:path*` from middleware matcher
2. **Full rollback**: Revert the three modified files to their previous state
3. **Partial rollback**: Keep constants but disable handler with a feature flag:
```typescript
const GUEST_LANGUAGE_DETECTION_ENABLED = false;

if (GUEST_LANGUAGE_DETECTION_ENABLED && req.nextUrl.pathname.startsWith('/item/')) {
  // ... handler code
}
```

---

## Performance Considerations

| Concern | Impact | Mitigation |
|---------|--------|------------|
| Middleware latency | Low | Guest handler is lightweight; no DB calls, returns early |
| Cookie writes | Minimal | Only writes when value changes |
| Header parsing | Negligible | Simple string manipulation |

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Cookie tampering | Validation with `isSupportedLocale()` before use |
| XSS via lang param | Value is validated against whitelist, never rendered raw |
| CSRF | Cookie uses `SameSite=Lax` |
| Information disclosure | No sensitive data in header/cookie values |

---

## References

- **Overview Document:** `/docs/REQ-E04-020-add-guest-language-detection-to-middleware-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 6, Task 6.1)
- **Requirements:** `/docs/gen_requests_epic4.md` (Request #20)
- **Current Middleware:** `/src/middleware.ts`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Related Tasks:**
  - REQ-E04-002: Guest Language Utilities
  - REQ-E04-015: Cookie Utility for Language Persistence
  - REQ-E04-016: Update Guest Item Page
  - REQ-E04-019: URL Parameter Support

---

## Completion Checklist

- [ ] Task 1: Add GUEST_LOCALE_COOKIE_NAME constant
- [ ] Task 2: Export from i18n index
- [ ] Task 3: Add /item/* to middleware matcher
- [ ] Task 4: Add Accept-Language parser function
- [ ] Task 5: Add guest language detection function
- [ ] Task 6: Add guest cookie setter function
- [ ] Task 7: Add guest item route handler
- [ ] Task 8: Verify build and types
- [ ] All manual tests pass
- [ ] Code committed with descriptive message

---

*Document generated: 2026-01-20*
*Last modified: 2026-01-20*
