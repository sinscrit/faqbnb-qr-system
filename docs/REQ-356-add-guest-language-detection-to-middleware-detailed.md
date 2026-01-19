# REQ-356: Add Guest Language Detection to Middleware - Detailed Task Breakdown

**Document Created:** 2026-01-19 18:30:00 UTC
**Last Modified:** 2026-01-19 18:30:00 UTC
**Request Reference:** docs/gen_requests_epic4.md - Request #356
**Overview Document:** docs/REQ-356-add-guest-language-detection-to-middleware-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 6 - Middleware & Language Detection
**Task ID:** 6.1

---

## Executive Summary

This document breaks down the implementation of guest language detection in the middleware for `/item/*` routes. The middleware will detect guest language preferences from URL query parameters, cookies, and Accept-Language headers, then make this information available to downstream page components via response headers and cookies. The implementation must NOT redirect requests - guests receive their page directly with language context attached.

---

## Prerequisites Verification

Before starting implementation, verify these dependencies exist:

| Dependency | File Location | Expected Export | Status |
|------------|---------------|-----------------|--------|
| `detectUserLanguage()` | `/src/lib/i18n/language-detection.ts` | Function | Exists |
| `setLocaleCookie()` | `/src/lib/i18n/language-detection.ts` | Function | Exists |
| `isSupportedLocale()` | `/src/lib/i18n/config.ts` | Function | Exists |
| `LOCALE_COOKIE_NAME` | `/src/lib/i18n/config.ts` | Constant (`'FAQBNB_LANG'`) | Exists |
| `SupportedLocale` | `/src/lib/i18n/config.ts` | Type | Exists |

---

## Task Breakdown

### Task 1: Update Middleware Matcher Configuration

**Priority:** High
**Estimated Effort:** 1 story point (XS)
**Dependencies:** None

#### 1.1 Objective
Add `/item/:path*` pattern to the middleware matcher configuration so that middleware processes guest item page requests.

#### 1.2 File to Modify
- **File:** `/src/middleware.ts`
- **Section:** `config.matcher` array (lines 285-299)

#### 1.3 Current State
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
    '/register/:path*'
  ],
}
```

#### 1.4 Target State
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
    '/item/:path*',  // Guest language detection for item pages
  ],
}
```

#### 1.5 Acceptance Criteria
- [ ] `/item/:path*` pattern is added to the matcher array
- [ ] Pattern is placed at the end of the array with an explanatory comment
- [ ] No existing patterns are modified or removed
- [ ] Middleware is triggered for routes like `/item/abc123`, `/item/xyz/details`, etc.

#### 1.6 Testing Instructions
1. Visit `/item/test-id` in browser
2. Check console logs for `[MIDDLEWARE-DEBUG]` entries
3. Verify middleware processes the request (should see session check logs)

---

### Task 2: Add Guest Route Detection Logic

**Priority:** High
**Estimated Effort:** 2 story points (S)
**Dependencies:** Task 1

#### 2.1 Objective
Add logic to detect if the current request is a guest item route that requires special language handling.

#### 2.2 File to Modify
- **File:** `/src/middleware.ts`
- **Section:** After line 105 (after QR print exemption block), before the try block or at the beginning of the try block

#### 2.3 Implementation Details

Add a helper function and route detection logic:

```typescript
/**
 * Check if the request path is a guest-facing item route.
 * Guest routes receive special language detection handling.
 * @param pathname - The request URL pathname
 * @returns True if this is a guest item route
 */
function isGuestItemRoute(pathname: string): boolean {
  return pathname.startsWith('/item/');
}
```

#### 2.4 Placement in Middleware
The check should occur early in the middleware, after the response object is created but before session checks:

```typescript
// Inside middleware function, after res = NextResponse.next()

// Check if this is a guest item route
const isGuestRoute = isGuestItemRoute(req.nextUrl.pathname);
```

#### 2.5 Acceptance Criteria
- [ ] Helper function `isGuestItemRoute()` is defined
- [ ] Function correctly identifies `/item/*` routes as guest routes
- [ ] Function returns false for all other routes (e.g., `/admin`, `/dashboard2`)
- [ ] Route detection happens early in middleware execution

#### 2.6 Testing Instructions
1. Add temporary console.log: `console.log('[MIDDLEWARE] isGuestRoute:', isGuestRoute, req.nextUrl.pathname)`
2. Visit `/item/test` - should log `isGuestRoute: true`
3. Visit `/admin` - should log `isGuestRoute: false`

---

### Task 3: Implement URL Query Parameter Language Detection

**Priority:** High
**Estimated Effort:** 2 story points (S)
**Dependencies:** Task 2

#### 3.1 Objective
For guest item routes, check for a `?lang=` URL query parameter first (highest priority for guests). This enables shareable links with language preferences.

#### 3.2 File to Modify
- **File:** `/src/middleware.ts`
- **Section:** Within the guest route handling block

#### 3.3 Implementation Details

```typescript
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type SupportedLocale,
} from '@/lib/i18n';

// Inside middleware, when isGuestRoute is true:

let guestDetectedLocale: SupportedLocale | null = null;

// Priority 1 for guests: URL query parameter
const langParam = req.nextUrl.searchParams.get('lang');
if (langParam && isSupportedLocale(langParam)) {
  guestDetectedLocale = langParam;
  console.log('[MIDDLEWARE-GUEST] Language from URL param:', guestDetectedLocale);
}
```

#### 3.4 Update Imports
Ensure the import statement includes `isSupportedLocale` and `type SupportedLocale`:

```typescript
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type SupportedLocale,
} from '@/lib/i18n'
```

#### 3.5 Acceptance Criteria
- [ ] URL query parameter `?lang=fr` is detected before other sources
- [ ] Language parameter is validated against supported locales
- [ ] Invalid language codes (e.g., `?lang=invalid`) do not crash and are ignored
- [ ] Empty or missing `?lang=` parameter continues to fallback detection
- [ ] Console logs the detected language source

#### 3.6 Testing Instructions
1. Visit `/item/test?lang=fr` - should detect French
2. Visit `/item/test?lang=de` - should detect German
3. Visit `/item/test?lang=invalid` - should NOT use 'invalid', should fallback
4. Visit `/item/test?lang=` - should fallback to other detection
5. Visit `/item/test` (no param) - should fallback to other detection

---

### Task 4: Implement Guest Language Detection Fallback

**Priority:** High
**Estimated Effort:** 2 story points (S)
**Dependencies:** Task 3

#### 4.1 Objective
When no valid URL parameter exists, fall back to the existing `detectUserLanguage()` function for cookie and Accept-Language header detection.

#### 4.2 File to Modify
- **File:** `/src/middleware.ts`
- **Section:** Within the guest route handling block, after URL param check

#### 4.3 Implementation Details

```typescript
// If no valid URL param, use existing detection (cookie > Accept-Language > default)
if (!guestDetectedLocale) {
  // Pass null for user - guests are not authenticated
  guestDetectedLocale = detectUserLanguage(req, null);
  console.log('[MIDDLEWARE-GUEST] Language from detection:', guestDetectedLocale);
}
```

#### 4.4 Acceptance Criteria
- [ ] When URL param is missing/invalid, detection falls back to `detectUserLanguage()`
- [ ] `detectUserLanguage()` is called with `null` for the user parameter
- [ ] Cookie preferences are respected (if `FAQBNB_LANG` cookie exists)
- [ ] Accept-Language header is used when no cookie exists
- [ ] Default 'en' is returned when no preference can be determined

#### 4.5 Testing Instructions
1. Clear cookies, set browser language to French
2. Visit `/item/test` (no `?lang=`) - should detect French from Accept-Language
3. Set `FAQBNB_LANG=de` cookie manually
4. Visit `/item/test` - should detect German from cookie
5. Visit `/item/test?lang=es` - should detect Spanish (URL overrides cookie)

---

### Task 5: Set Response Header and Update Cookie for Guest Routes

**Priority:** High
**Estimated Effort:** 2 story points (S)
**Dependencies:** Task 4

#### 5.1 Objective
Set the `x-locale` response header and update the language cookie for guest item routes, then return the response without redirecting.

#### 5.2 File to Modify
- **File:** `/src/middleware.ts`
- **Section:** Within the guest route handling block, after language detection

#### 5.3 Implementation Details

```typescript
// Set locale header for downstream use
res.headers.set('x-locale', guestDetectedLocale);

// Update cookie if different from current
const currentCookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
if (currentCookieLocale !== guestDetectedLocale) {
  setLocaleCookie(res, guestDetectedLocale);
  console.log('[MIDDLEWARE-GUEST] Updated locale cookie:', guestDetectedLocale);
}

console.log('[MIDDLEWARE-GUEST] Processing complete:', {
  path: req.nextUrl.pathname,
  detectedLocale: guestDetectedLocale,
  source: langParam && isSupportedLocale(langParam) ? 'url_param' :
          currentCookieLocale ? 'cookie' : 'accept_language_or_default',
});

// Return response directly - NO redirect for guest routes
return res;
```

#### 5.4 Acceptance Criteria
- [ ] `x-locale` header is set on the response
- [ ] Header value matches the detected locale
- [ ] Cookie is set/updated when locale changes
- [ ] Cookie is NOT updated when it already matches detected locale (optimization)
- [ ] Response is returned directly without redirect (HTTP 200, not 302/307)
- [ ] Console logs include the detected locale and source

#### 5.5 Testing Instructions
1. Visit `/item/test?lang=fr`
2. Check Network tab - response should be 200, not 302/307
3. Check response headers - should include `x-locale: fr`
4. Check cookies - `FAQBNB_LANG` should be set to `fr`
5. Visit `/item/other` (no param) - should now detect French from cookie

---

### Task 6: Complete Guest Route Handling Block Integration

**Priority:** High
**Estimated Effort:** 2 story points (S)
**Dependencies:** Tasks 2-5

#### 6.1 Objective
Integrate all guest route handling logic into a cohesive block that executes early in the middleware and returns before any session checks.

#### 6.2 File to Modify
- **File:** `/src/middleware.ts`
- **Section:** After OAuth callback detection (line 64), before Supabase client creation (line 80)

#### 6.3 Complete Implementation Block

```typescript
// ============ GUEST LANGUAGE DETECTION FOR ITEM ROUTES ============
// Process guest item routes early, before session checks.
// Guest routes do NOT require authentication and should NOT redirect.
if (req.nextUrl.pathname.startsWith('/item/')) {
  console.log('[MIDDLEWARE-GUEST] Processing guest item route:', req.nextUrl.pathname);

  // Priority 1: Check for ?lang= query parameter (highest priority for guests)
  const langParam = req.nextUrl.searchParams.get('lang');
  let guestDetectedLocale: SupportedLocale | null = null;

  if (langParam && isSupportedLocale(langParam)) {
    guestDetectedLocale = langParam;
    console.log('[MIDDLEWARE-GUEST] Language from URL param:', guestDetectedLocale);
  }

  // Priority 2-4: Fall back to cookie/header detection if no valid URL param
  if (!guestDetectedLocale) {
    guestDetectedLocale = detectUserLanguage(req, null); // No user for guest
    console.log('[MIDDLEWARE-GUEST] Language from detection:', guestDetectedLocale);
  }

  // Set locale header for downstream use (page components read this)
  res.headers.set('x-locale', guestDetectedLocale);

  // Update cookie if different from current (persistence for future visits)
  const currentCookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (currentCookieLocale !== guestDetectedLocale) {
    setLocaleCookie(res, guestDetectedLocale);
    console.log('[MIDDLEWARE-GUEST] Updated locale cookie:', guestDetectedLocale);
  }

  console.log('[MIDDLEWARE-GUEST] Processing complete:', {
    path: req.nextUrl.pathname,
    detectedLocale: guestDetectedLocale,
    source: langParam && isSupportedLocale(langParam) ? 'url_param' :
            currentCookieLocale ? 'cookie' : 'accept_language_or_default',
    timestamp: Date.now(),
  });

  // Return response directly - NO redirect for guest routes
  return res;
}
// ============ END GUEST LANGUAGE DETECTION ============
```

#### 6.4 Placement
The block should be placed:
1. **After** line 64 (OAuth callback return)
2. **Before** line 80 (Supabase client creation)

This ensures:
- OAuth callbacks are handled first (unchanged)
- Guest routes return early without session checks
- Existing auth routes continue through normal flow

#### 6.5 Updated Import Statement
Ensure the full import is at the top of the file:

```typescript
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type SupportedLocale,
} from '@/lib/i18n'
```

#### 6.6 Acceptance Criteria
- [ ] Guest route block is placed after OAuth callback handling
- [ ] Guest route block returns early before session checks
- [ ] All imports are properly included
- [ ] Block includes comprehensive console logging
- [ ] Block handles all language detection priorities correctly
- [ ] Existing middleware functionality for auth routes is preserved

---

### Task 7: Verify Existing Auth Routes Are Unaffected

**Priority:** High
**Estimated Effort:** 1 story point (XS)
**Dependencies:** Task 6

#### 7.1 Objective
Ensure all existing authenticated route handling continues to work correctly after the guest route changes.

#### 7.2 Test Cases

| Route | Expected Behavior |
|-------|-------------------|
| `/admin` (no session) | Redirect to `/login` |
| `/admin` (with session) | Allow access |
| `/dashboard2` (no session) | Redirect to `/login` |
| `/dashboard2` (with session) | Allow access |
| `/login` (no session) | Allow access |
| `/login` (with session) | Redirect to `/dashboard2` |
| `/register` | Allow access |
| `/register/complete` | Allow access (special handling) |
| `/auth/oauth/callback` | Allow access (OAuth flow) |
| `/admin/back-office` (no admin) | Redirect to `/admin` |

#### 7.3 Acceptance Criteria
- [ ] All protected routes still redirect unauthenticated users to login
- [ ] All protected routes still allow authenticated users
- [ ] Login page still redirects authenticated users to dashboard
- [ ] OAuth callback still passes through
- [ ] Back office admin checks still work
- [ ] QR print page exemption still works
- [ ] Language detection for authenticated users still works

#### 7.4 Testing Instructions
1. Clear all cookies and session
2. Visit `/admin` - should redirect to `/login`
3. Login with valid credentials
4. Visit `/admin` - should allow access
5. Visit `/login` - should redirect to `/dashboard2`
6. Logout
7. Visit `/item/test` - should NOT redirect to login
8. Check console for both guest and auth route logging

---

### Task 8: Add TypeScript Type Safety Enhancements

**Priority:** Medium
**Estimated Effort:** 1 story point (XS)
**Dependencies:** Task 6

#### 8.1 Objective
Ensure all new code has proper TypeScript types and no type errors.

#### 8.2 Type Checks

1. **URL Parameter Type Safety:**
```typescript
const langParam = req.nextUrl.searchParams.get('lang'); // string | null
```

2. **Locale Type Safety:**
```typescript
let guestDetectedLocale: SupportedLocale | null = null;
if (langParam && isSupportedLocale(langParam)) {
  guestDetectedLocale = langParam; // TypeScript knows this is SupportedLocale
}
```

3. **Function Return Type:**
The `middleware` function already returns `Promise<NextResponse>` - ensure guest route block also returns `res`.

#### 8.3 Acceptance Criteria
- [ ] No TypeScript errors in `/src/middleware.ts`
- [ ] `SupportedLocale` type is properly imported
- [ ] Type guard `isSupportedLocale()` is used for type narrowing
- [ ] All variables have explicit or inferred types

#### 8.4 Verification
Run: `npx tsc --noEmit` to check for type errors

---

## Complete Code Changes Summary

### File: `/src/middleware.ts`

#### Import Changes (Line ~6-10)
```typescript
// Change from:
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n'

// To:
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type SupportedLocale,
} from '@/lib/i18n'
```

#### Guest Route Block (Insert after line 64, before line 66)
Insert the complete guest language detection block as shown in Task 6.3.

#### Matcher Configuration (Line ~285-299)
Add `/item/:path*` to the end of the matcher array as shown in Task 1.4.

---

## Testing Plan

### Unit Testing
No dedicated unit tests required - this is middleware configuration.

### Integration Testing

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| GT-001 | URL param detection | Visit `/item/test?lang=fr` | French detected, header/cookie set |
| GT-002 | Invalid URL param | Visit `/item/test?lang=xyz` | Fallback to cookie/header/default |
| GT-003 | Cookie detection | Set `FAQBNB_LANG=de`, visit `/item/test` | German detected |
| GT-004 | Accept-Language detection | Clear cookies, browser=es, visit `/item/test` | Spanish detected |
| GT-005 | Default fallback | Clear all, browser=ja (unsupported), visit `/item/test` | English detected |
| GT-006 | URL overrides cookie | Set cookie=de, visit `/item/test?lang=fr` | French detected |
| GT-007 | No redirect | Visit `/item/test?lang=fr` | HTTP 200, not 302/307 |
| GT-008 | Header set | Visit `/item/test?lang=it` | `x-locale: it` in response headers |
| GT-009 | Auth routes unaffected | Visit `/admin` without session | Redirect to `/login` |
| GT-010 | Perf: fast detection | Time `/item/test` requests | <10ms middleware processing |

### Manual Testing Checklist
- [ ] Visit `/item/abc123?lang=fr` - French language context
- [ ] Visit `/item/abc123?lang=de` - German language context
- [ ] Visit `/item/abc123?lang=invalid` - Falls back gracefully
- [ ] Visit `/item/abc123` with no param, no cookie - Uses Accept-Language
- [ ] Visit `/item/abc123` with cookie set - Uses cookie
- [ ] Verify `/admin` still requires auth
- [ ] Verify `/dashboard2` still requires auth
- [ ] Verify console logs appear for guest routes
- [ ] Verify response headers include `x-locale`

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate Rollback:** Remove `/item/:path*` from the matcher array
2. **Quick Fix:** Comment out the guest route handling block
3. **Full Rollback:** Revert to previous middleware.ts version

The changes are isolated and do not affect existing auth functionality, making rollback straightforward.

---

## Performance Considerations

| Concern | Mitigation |
|---------|------------|
| URL param parsing | Native URLSearchParams, already parsed by Next.js - O(1) |
| isSupportedLocale check | Simple array.includes() - O(1) |
| Cookie read | Native Next.js cookie API - fast |
| Early return for guest routes | Skips session checks entirely - improves performance |
| No database queries | Guest routes don't query user table |

**Expected overhead:** <5ms per request for guest item routes.

---

## Success Criteria Summary

1. [ ] `/item/*` routes are processed by middleware
2. [ ] `?lang=` query parameter has highest priority
3. [ ] Cookie `FAQBNB_LANG` works as fallback
4. [ ] Accept-Language header works as fallback
5. [ ] Default 'en' used when no preference detected
6. [ ] `x-locale` header is set on all item route responses
7. [ ] Cookie is updated when language changes
8. [ ] No redirects for guest routes (HTTP 200)
9. [ ] All authenticated routes continue working
10. [ ] No TypeScript errors
11. [ ] Console logging for debugging

---

## References

- **Request:** docs/gen_requests_epic4.md (REQ-356)
- **Overview:** docs/REQ-356-add-guest-language-detection-to-middleware-overview.md
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md (Task 6.1)
- **Middleware:** /src/middleware.ts
- **i18n Config:** /src/lib/i18n/config.ts
- **Language Detection:** /src/lib/i18n/language-detection.ts
- **i18n Exports:** /src/lib/i18n/index.ts
