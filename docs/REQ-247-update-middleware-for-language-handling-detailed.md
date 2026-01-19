# REQ-247: Update Middleware for Language Handling - Detailed Task Breakdown

**Generated:** 2026-01-18 18:30:00 UTC
**Last Modified:** 2026-01-18 14:25:00 UTC
**Overview Document:** REQ-247-update-middleware-for-language-handling-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.2)
**Status:** Implementation Complete (Tasks 5.2.1-5.2.8 completed, manual testing tasks deferred)

---

## Document Purpose

This document breaks down the implementation overview into granular, actionable tasks suitable for an AI coding agent or junior developer. Each task represents approximately 1 story point of work (15-30 minutes) and includes explicit file paths, code patterns, and verification steps.

---

## Prerequisites

Before starting these tasks, verify:
- [x] Node.js and npm are available in the development environment
- [x] The project builds successfully with `npm run build`
- [x] REQ-246 (Language Detection Utility) has been implemented
- [x] The `/src/lib/i18n/` module exists with required exports
- [x] Access to the existing middleware.ts file

**Hard Dependencies:**
- REQ-246: Language Detection Utility must be implemented first
  - Required exports: `detectUserLanguage`, `setLocaleCookie`, `LOCALE_COOKIE_NAME`, `SupportedLocale`

**Soft Dependencies (gracefully handled if incomplete):**
- Phase 1, Task 1.3 (`users.preferred_language` column) - utility handles missing column gracefully

---

## Task Breakdown

### Task 5.2.1: Verify i18n Module Availability

**Objective:** Confirm the i18n module from REQ-246 exists and exports required functions

**Steps:**
1. Verify the i18n module directory exists:
   ```bash
   ls -la src/lib/i18n/
   ```
2. Verify the required exports are available:
   ```bash
   grep -n "export" src/lib/i18n/index.ts
   ```

**Expected Files:**
- `/src/lib/i18n/index.ts` - Barrel export file
- `/src/lib/i18n/config.ts` - Configuration constants
- `/src/lib/i18n/language-detection.ts` - Detection functions

**Required Exports to Verify:**
- `detectUserLanguage` - Main detection function
- `setLocaleCookie` - Cookie setting utility
- `LOCALE_COOKIE_NAME` - Cookie name constant
- `SupportedLocale` - Type definition

**Verification:**
```typescript
// Quick verification (paste in a scratch file or console)
import { detectUserLanguage, setLocaleCookie, LOCALE_COOKIE_NAME } from '@/lib/i18n';
console.log(typeof detectUserLanguage); // Should be 'function'
console.log(typeof setLocaleCookie); // Should be 'function'
console.log(LOCALE_COOKIE_NAME); // Should be 'FAQBNB_LANG'
```

**Acceptance Criteria:**
- [x] i18n directory exists at `/src/lib/i18n/`
- [x] `detectUserLanguage` function is exported
- [x] `setLocaleCookie` function is exported
- [x] `LOCALE_COOKIE_NAME` constant is exported
- [x] TypeScript imports resolve without errors

**Estimated Time:** 5 minutes

**Contingency:** If REQ-246 is not complete, stop here and implement REQ-246 first.

---

### Task 5.2.2: Add i18n Imports to Middleware

**Objective:** Add import statements for language detection utilities at the top of the middleware file

**File:** `/src/middleware.ts` (MODIFY)

**Current Import Section (lines 1-5):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'
```

**Modified Import Section:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n'
```

**Steps:**
1. Open `/src/middleware.ts`
2. Add the i18n import statement after the existing imports (after line 5)
3. Save the file
4. Verify TypeScript resolves the imports without errors

**Verification:**
```bash
# Check for TypeScript errors in the middleware file
npx tsc --noEmit src/middleware.ts
```

**Acceptance Criteria:**
- [x] Import statement added after line 5
- [x] Import includes `detectUserLanguage`, `setLocaleCookie`, `LOCALE_COOKIE_NAME`
- [x] TypeScript compiles without import errors
- [x] No duplicate import warnings

**Estimated Time:** 5 minutes

---

### Task 5.2.3: Create getUserLanguagePreference Helper Function

**Objective:** Add a helper function to fetch user's language preference from the database

**File:** `/src/middleware.ts` (MODIFY)

**Location:** Add before the `middleware` function (around line 7, after imports)

**Implementation:**
```typescript
/**
 * Fetch user's language preference from the database.
 * Returns null if user not found, no preference set, or on error.
 *
 * @param supabase - Supabase client instance
 * @param userId - User's unique identifier
 * @returns User's preferred_language value or null
 */
async function getUserLanguagePreference(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string
): Promise<string | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', userId)
      .single();

    if (error || !user) {
      // Log only if it's not a "not found" error
      if (error && error.code !== 'PGRST116') {
        console.log('[i18n] Error fetching user language preference:', error.message);
      }
      return null;
    }

    return user.preferred_language ?? null;
  } catch (e) {
    console.log('[i18n] Exception fetching user language preference:', e);
    return null;
  }
}
```

**Steps:**
1. Open `/src/middleware.ts`
2. Add the function after the import statements, before `export async function middleware`
3. Ensure proper spacing (blank lines before and after the function)
4. Save the file

**Verification:**
```bash
# Verify TypeScript compiles without errors
npx tsc --noEmit src/middleware.ts
```

**Acceptance Criteria:**
- [x] Function `getUserLanguagePreference` added to middleware.ts
- [x] Function accepts `supabase` client and `userId` parameters
- [x] Function returns `Promise<string | null>`
- [x] Error handling logs issues but doesn't throw
- [x] TypeScript compiles without errors
- [x] Function has JSDoc documentation

**Estimated Time:** 10 minutes

---

### Task 5.2.4: Add Language Detection Block After Session Check

**Objective:** Integrate language detection logic after successful session retrieval

**File:** `/src/middleware.ts` (MODIFY)

**Location:** Insert after the session logging block (around line 82), before the session error check

**Current Code (lines 68-88):**
```typescript
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    console.log('[MIDDLEWARE-DEBUG] Session check for path:', req.nextUrl.pathname, {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      hasError: !!error,
      errorMessage: error?.message,
      timestamp: Date.now()
    });

    // If there's an error getting session, let the page handle it
    if (error) {
      console.log('🔄 Middleware: Session error, letting page handle:', error.message);
      return res;
    }
```

**Modified Code (insert after session logging, before error check):**
```typescript
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    console.log('[MIDDLEWARE-DEBUG] Session check for path:', req.nextUrl.pathname, {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      hasError: !!error,
      errorMessage: error?.message,
      timestamp: Date.now()
    });

    // ============ LANGUAGE DETECTION ============
    // Detect user's preferred language using priority cascade:
    // 1. User DB preference (if authenticated)
    // 2. FAQBNB_LANG cookie
    // 3. Accept-Language header
    // 4. Default ('en')

    let userLocalePreference: { id: string; preferred_language?: string | null } | null = null;

    if (session?.user) {
      // Fetch user's language preference from database
      const dbPreference = await getUserLanguagePreference(supabase, session.user.id);
      userLocalePreference = {
        id: session.user.id,
        preferred_language: dbPreference,
      };
    }

    const detectedLocale = detectUserLanguage(req, userLocalePreference);

    // Set locale in response header for server components
    res.headers.set('x-locale', detectedLocale);

    // Only update cookie if locale changed (optimization)
    const currentCookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (currentCookieLocale !== detectedLocale) {
      setLocaleCookie(res, detectedLocale);
      console.log('[MIDDLEWARE-I18N] Updated locale cookie:', {
        previous: currentCookieLocale || 'none',
        new: detectedLocale,
      });
    }

    console.log('[MIDDLEWARE-I18N] Language detected:', {
      locale: detectedLocale,
      source: userLocalePreference?.preferred_language ? 'user_db' :
              req.cookies.get(LOCALE_COOKIE_NAME)?.value ? 'cookie' : 'detection',
      userId: session?.user?.id || 'anonymous',
      path: req.nextUrl.pathname,
    });
    // ============ END LANGUAGE DETECTION ============

    // If there's an error getting session, let the page handle it
    if (error) {
      console.log('🔄 Middleware: Session error, letting page handle:', error.message);
      return res;
    }
```

**Steps:**
1. Open `/src/middleware.ts`
2. Locate the session logging block (lines 74-82)
3. Insert the language detection block after the session logging
4. Ensure the language detection block comes BEFORE the session error check
5. Save the file

**Verification:**
```bash
# Verify TypeScript compiles without errors
npx tsc --noEmit src/middleware.ts

# Verify build succeeds
npm run build
```

**Acceptance Criteria:**
- [x] Language detection block inserted after session logging
- [x] `userLocalePreference` is constructed from session user if authenticated
- [x] `detectUserLanguage` is called with request and user preference
- [x] `x-locale` header is set on response
- [x] Cookie is only updated when locale changes (optimization)
- [x] Logging shows locale detection source and result
- [x] TypeScript compiles without errors
- [x] Build succeeds

**Estimated Time:** 20 minutes

---

### Task 5.2.5: Handle Session Error Edge Case for Language Detection

**Objective:** Ensure language detection still works when session check fails

**File:** `/src/middleware.ts` (MODIFY)

**Context:** The current implementation adds language detection after session check. We need to ensure that if there's a session error, language detection still runs (using cookie/header fallback).

**Current Error Handling (after language detection block):**
```typescript
    // If there's an error getting session, let the page handle it
    if (error) {
      console.log('🔄 Middleware: Session error, letting page handle:', error.message);
      return res;
    }
```

**Note:** The language detection block is already placed BEFORE this error return, which means:
- Language detection runs even if there's a session error
- The `x-locale` header and cookie will be set before returning
- This is the correct behavior - no code change needed

**Verification:**
Review the code flow to ensure:
1. Language detection block runs before `if (error) return res`
2. The response `res` has headers and cookies set before being returned
3. Both authenticated and unauthenticated paths set the locale

**Acceptance Criteria:**
- [x] Language detection runs regardless of session error
- [x] Cookie and header are set even when session fails
- [x] Anonymous users get language detection via cookie/header

**Estimated Time:** 5 minutes (verification only)

---

### Task 5.2.6: Update Route Matcher for Language Support (Optional)

**Objective:** Review and optionally expand the route matcher to include public pages

**File:** `/src/middleware.ts` (REVIEW/MODIFY)

**Current Matcher (lines 204-218):**
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

**Optional Enhanced Matcher (if public pages need language support):**
```typescript
export const config = {
  matcher: [
    // Existing protected routes
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
    // Public pages with language support (optional - Phase 5.7)
    // '/p/:path*',     // Public property pages
    // '/item/:path*',  // Public item pages
  ],
}
```

**Decision:**
- For this task (5.2), keep the current matcher unchanged
- Public page routes can be added in Task 5.7 (LanguageSwitcher integration)
- The locale cookie will still persist from protected route visits

**Acceptance Criteria:**
- [x] Reviewed current matcher configuration
- [x] Decision documented on whether to expand routes
- [x] No changes required for Phase 5.2 (changes deferred to 5.7)

**Estimated Time:** 5 minutes

---

### Task 5.2.7: Verify TypeScript Compilation

**Objective:** Ensure all middleware changes compile without errors

**Steps:**
1. Run TypeScript compiler check:
   ```bash
   npx tsc --noEmit
   ```
2. Fix any TypeScript errors in the middleware
3. Verify no import path issues

**Common Issues to Check:**
- [x] `detectUserLanguage` type signature matches usage
- [x] `setLocaleCookie` type signature matches usage
- [x] `LOCALE_COOKIE_NAME` is a string constant
- [x] `getUserLanguagePreference` return type is `Promise<string | null>`
- [x] `userLocalePreference` type matches `UserLocalePreference` interface

**Acceptance Criteria:**
- [x] `npx tsc --noEmit` completes without errors (Note: pre-existing external dependency errors exist)
- [x] All imports resolve correctly
- [x] No type mismatches in function calls

**Estimated Time:** 10 minutes

---

### Task 5.2.8: Build Verification

**Objective:** Verify the project builds successfully with middleware changes

**Steps:**
1. Run full project build:
   ```bash
   npm run build
   ```
2. Check for any build errors
3. Verify no warnings related to middleware changes

**Verification:**
```bash
npm run build 2>&1 | grep -i "middleware\|i18n\|error"
```

**Acceptance Criteria:**
- [x] `npm run build` completes successfully
- [x] No build errors related to middleware changes
- [x] No significant warnings introduced

**Estimated Time:** 5 minutes

---

### Task 5.2.9: Manual Testing - Anonymous User Cookie Detection

**Objective:** Verify language detection works for anonymous users

**Test Scenario 1: Default Language**
```
1. Clear all cookies in browser
2. Visit /login (or any matched route)
3. Open browser DevTools → Application → Cookies
4. Verify FAQBNB_LANG cookie is set to 'en'
5. Check Response Headers for 'x-locale: en'
```

**Test Scenario 2: Accept-Language Override**
```
1. Clear all cookies in browser
2. Open DevTools → Network tab
3. Right-click → Override headers (or use browser language settings)
4. Set Accept-Language to 'fr-FR, fr;q=0.9, en;q=0.8'
5. Visit /login
6. Verify FAQBNB_LANG cookie is set to 'fr'
7. Check Response Headers for 'x-locale: fr'
```

**Test Scenario 3: Cookie Persistence**
```
1. Set FAQBNB_LANG cookie to 'de' manually in DevTools
2. Navigate to /dashboard2
3. Verify cookie remains 'de'
4. Verify Response Headers show 'x-locale: de'
```

**Expected Console Logs (server-side):**
```
[MIDDLEWARE-I18N] Language detected: { locale: 'en', source: 'detection', userId: 'anonymous', path: '/login' }
```

**Acceptance Criteria:**
- [ ] Anonymous user gets locale cookie set
- [ ] Accept-Language header is respected for first visit
- [ ] Cookie value persists across navigations
- [ ] x-locale header is set on responses
- [ ] Console logs show language detection info

**Estimated Time:** 15 minutes

---

### Task 5.2.10: Manual Testing - Authenticated User with Database Preference

**Objective:** Verify authenticated users get their database preference

**Prerequisites:**
- Test user exists in `users` table with `preferred_language` set

**Setup (if needed):**
```sql
-- Set a test user's preferred language
UPDATE users SET preferred_language = 'de' WHERE email = 'test@example.com';
```

**Test Scenario:**
```
1. Clear all cookies in browser
2. Log in as test user with preferred_language='de'
3. Navigate to /dashboard2
4. Verify FAQBNB_LANG cookie is set to 'de'
5. Check Response Headers for 'x-locale: de'
6. Check server console for: [MIDDLEWARE-I18N] Language detected: { locale: 'de', source: 'user_db', ... }
```

**Test Scenario 2: User Without Database Preference**
```
1. Ensure test user has preferred_language=NULL in database
2. Set FAQBNB_LANG cookie to 'es'
3. Log in as test user
4. Verify locale remains 'es' (cookie takes precedence over null DB value)
```

**Expected Console Logs (server-side):**
```
[MIDDLEWARE-I18N] Language detected: { locale: 'de', source: 'user_db', userId: 'xxx-xxx-xxx', path: '/dashboard2' }
```

**Acceptance Criteria:**
- [ ] Authenticated user's DB preference takes priority
- [ ] User with null preference falls back to cookie
- [ ] Locale is correctly logged as 'user_db' source
- [ ] Cookie is updated to match DB preference

**Estimated Time:** 15 minutes

---

### Task 5.2.11: Manual Testing - OAuth Flow Compatibility

**Objective:** Verify language detection doesn't break OAuth authentication

**Test Scenario:**
```
1. Clear all cookies
2. Navigate to /login
3. Click "Continue with Google" (or other OAuth provider)
4. Complete OAuth authentication
5. Verify redirect to /dashboard2 succeeds
6. Verify user is authenticated
7. Verify FAQBNB_LANG cookie exists
```

**Critical Check:**
- OAuth callback path `/auth/oauth/callback` is exempted from session check
- Language detection should NOT run on callback path (already returns early)

**Expected Behavior:**
- OAuth callback proceeds without language detection (early return)
- After redirect to protected route, language detection runs normally

**Acceptance Criteria:**
- [ ] OAuth login flow completes successfully
- [ ] No authentication errors during OAuth
- [ ] Language cookie is set after OAuth completion
- [ ] User lands on /dashboard2 correctly

**Estimated Time:** 10 minutes

---

### Task 5.2.12: Performance Verification

**Objective:** Verify language detection doesn't add significant latency

**Steps:**
1. Enable Network timing in DevTools
2. Navigate between pages and observe TTFB (Time to First Byte)
3. Compare with pre-change performance (if baseline available)

**Performance Budget:**
- Additional latency from language detection: < 50ms
- Database query for authenticated users: ~5-15ms typical

**Console Log Timestamps:**
Check that language detection doesn't block other middleware logic:
```
[MIDDLEWARE-DEBUG] Session check for path: /dashboard2 { timestamp: 1234567890123 }
[MIDDLEWARE-I18N] Language detected: { ... }
[MIDDLEWARE-DEBUG] Allowing request to proceed
```

**Acceptance Criteria:**
- [ ] TTFB remains reasonable (no major regression)
- [ ] Database query for language preference is fast
- [ ] Language detection doesn't block page rendering

**Estimated Time:** 10 minutes

---

## Complete File Summary

After completing all tasks, the following file should be modified:

| File Path | Status | Changes |
|-----------|--------|---------|
| `/src/middleware.ts` | MODIFY | Add imports, helper function, and language detection block |

**No new files created in this task.**

---

## Final Middleware Structure

After implementation, the middleware will have this structure:

```typescript
// Imports (including new i18n imports)
import { ... } from '@supabase/ssr'
import { ... } from 'next/server'
import { ... } from '@/lib/supabase'
import { detectUserLanguage, setLocaleCookie, LOCALE_COOKIE_NAME } from '@/lib/i18n'

// NEW: Helper function
async function getUserLanguagePreference(...) { ... }

// Main middleware function
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // OAuth callback exemption (unchanged)
  if (req.nextUrl.pathname === '/auth/oauth/callback') { ... }

  // Supabase client creation (unchanged)
  const supabase = createServerClient<Database>(...)

  // QR print page exemption (unchanged)
  if (req.nextUrl.pathname.includes('/qr-print')) { ... }

  try {
    // Session check (unchanged)
    const { data: { session }, error } = await supabase.auth.getSession()

    // Session logging (unchanged)
    console.log('[MIDDLEWARE-DEBUG] Session check...')

    // NEW: Language detection block
    let userLocalePreference = null
    if (session?.user) {
      const dbPreference = await getUserLanguagePreference(supabase, session.user.id)
      userLocalePreference = { id: session.user.id, preferred_language: dbPreference }
    }
    const detectedLocale = detectUserLanguage(req, userLocalePreference)
    res.headers.set('x-locale', detectedLocale)
    // ... cookie setting and logging ...

    // Session error handling (unchanged)
    if (error) { ... }

    // Admin back office protection (unchanged)
    // Protected routes access control (unchanged)
    // Orphaned auth user check (unchanged)
    // Login redirect for authenticated users (unchanged)

    return res
  } catch { ... }
}

// Route matcher config (unchanged)
export const config = { matcher: [...] }
```

---

## Integration Notes

### For Task 5.3 (LanguageSwitcher Component)

After completing this task:
- The `x-locale` response header will be available
- The `FAQBNB_LANG` cookie will be set
- The LanguageSwitcher can read the current locale from cookie

### For Task 5.4 (useLanguagePreference Hook)

After completing this task:
- Cookie can be read client-side to get current locale
- Hook can update cookie directly (without middleware)
- API call to update DB preference is separate (Task 5.6)

---

## Testing Checklist

### Automated Tests (if applicable)
- [ ] Unit tests for `getUserLanguagePreference` helper
- [ ] Integration test for middleware language detection

### Manual Testing Summary
- [ ] Anonymous user - default locale detection
- [ ] Anonymous user - Accept-Language header detection
- [ ] Anonymous user - cookie persistence
- [ ] Authenticated user - database preference
- [ ] Authenticated user - null preference fallback
- [ ] OAuth flow - no authentication breakage
- [ ] Performance - acceptable latency

---

## Edge Cases Covered

| Edge Case | Expected Behavior |
|-----------|-------------------|
| User with `preferred_language: null` | Falls back to cookie |
| User with unsupported locale in DB | Falls back to cookie |
| Invalid cookie value | Falls back to Accept-Language |
| No cookie, no supported language in header | Returns default 'en' |
| Session error during auth | Language detection still runs |
| Database query failure | Logs error, uses cookie fallback |
| OAuth callback path | Language detection skipped (early return) |
| QR print page path | Language detection skipped (early return) |

---

## Rollback Plan

If issues arise after deployment:

1. **Quick Rollback:** Remove the language detection block from middleware:
   - Remove imports: `import { detectUserLanguage, setLocaleCookie, LOCALE_COOKIE_NAME } from '@/lib/i18n'`
   - Remove `getUserLanguagePreference` helper function
   - Remove the language detection block (marked with comments)

2. **No Database Changes:** This task doesn't modify the database

3. **Cookie Persistence:** The `FAQBNB_LANG` cookie will remain on users' browsers but be ignored

**Rollback Time Estimate:** 5 minutes

---

## Success Metrics

Upon completion of all tasks:

1. **Functional Requirements Met:**
   - Middleware imports i18n utilities from `@/lib/i18n`
   - Language detection runs on every matched route
   - User DB preference is checked for authenticated users
   - Cookie is read/written correctly
   - `x-locale` header is set for server components

2. **Code Quality:**
   - TypeScript compiles without errors
   - Project builds successfully
   - JSDoc documentation on helper function
   - Clear logging for debugging

3. **Performance:**
   - No significant latency increase
   - Single additional DB query for authenticated users only

4. **Compatibility:**
   - Existing auth flow unchanged
   - OAuth callback handling unchanged
   - Protected route access control unchanged

---

## References

- [Overview Document](/docs/REQ-247-update-middleware-for-language-handling-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-246: Language Detection Utility](/docs/REQ-246-create-language-detection-utility-detailed.md)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation (Phase 5, Task 5.2)*
