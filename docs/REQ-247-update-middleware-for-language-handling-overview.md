# REQ-247: Update Middleware for Language Handling - Implementation Overview

**Generated:** 2026-01-18 17:45:00 UTC
**Last Modified:** 2026-01-18 17:45:00 UTC
**Request Reference:** Task 5.2 from Plan-110-L10N-Epic1-Foundation.md (Phase 5: Language Switching Infrastructure)
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Status:** Ready for Implementation

---

## 1. Request Summary

Update the existing Next.js middleware (`/src/middleware.ts`) to integrate language detection and cookie management for the localization system. The middleware will:

1. Detect the user's preferred language using the `detectUserLanguage` utility (created in REQ-246)
2. Read and validate the `FAQBNB_LANG` locale cookie
3. Set/refresh the locale cookie on responses to persist language preference
4. Make the detected locale available to downstream request handlers via response headers

This task is a dependency for the LanguageSwitcher component (Task 5.3) and completes the request-level language detection infrastructure.

---

## 2. Current State Analysis

### Existing Middleware Structure (`/src/middleware.ts`)

The current middleware handles:
- OAuth callback detection and logging
- Supabase session management using `createServerClient`
- Protected route access control (admin, user, dashboard routes)
- Back office system admin verification
- Orphaned auth user detection and redirect to `/register/complete`
- Authenticated user redirect from login page to dashboard

**Key Patterns:**

1. **Response Creation:**
   ```typescript
   const res = NextResponse.next()
   ```

2. **Cookie Handling:**
   ```typescript
   cookies: {
     get(name: string) { return req.cookies.get(name)?.value; },
     set(name: string, value: string, options: CookieOptions) {
       req.cookies.set({ name, value, ...options });
       res.cookies.set({ name, value, ...options });
     },
     remove(name: string, options: CookieOptions) { ... },
   }
   ```

3. **Route Matcher:**
   ```typescript
   export const config = {
     matcher: [
       '/admin/:path*', '/user/:path*', '/dashboard/:path*',
       '/dashboard2/:path*', '/login', '/auth/oauth/callback',
       '/register', '/register/:path*'
     ],
   }
   ```

### Dependencies Created in REQ-246

The language detection utility from REQ-246 provides:
- `detectUserLanguage(request, user?, options?)` - Main detection function
- `setLocaleCookie(response, locale)` - Cookie setting utility
- `LOCALE_COOKIE_NAME` - Cookie name constant (`FAQBNB_LANG`)
- `isSupportedLocale(locale)` - Validation function
- `SupportedLocale` - Type definition

**Note:** REQ-246 must be implemented first. If the i18n module doesn't exist yet, this task creates the necessary imports and the implementation will work once REQ-246 is complete.

---

## 3. Technical Approach

### Integration Points

The language handling will be integrated at the **start** of the middleware function, immediately after response creation. This ensures:

1. Language detection happens before any route-specific logic
2. The locale is available throughout the entire request lifecycle
3. Cookie persistence works regardless of which route is accessed

### Locale Header Strategy

The detected locale will be passed to server components via a custom response header:
```typescript
res.headers.set('x-locale', locale);
```

This allows:
- Server components to read the locale without direct cookie access
- `next-intl` integration to pick up the locale from headers
- Consistent locale availability across all rendering modes

### Cookie Persistence Logic

The middleware will:
1. Always read the existing locale cookie (if present)
2. Detect the "best" locale using the priority cascade
3. Set/refresh the cookie on every response to ensure persistence
4. Only set the cookie if the detected locale differs from the current cookie OR if no cookie exists

---

## 4. Implementation Tasks

### Task 5.2.1: Add i18n Imports to Middleware

**Action:** Add import statements for language detection utilities
**File:** `/src/middleware.ts` (line ~6, after existing imports)

```typescript
// Add after existing imports
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from '@/lib/i18n';
```

### Task 5.2.2: Create Language Detection Helper Function

**Action:** Add a helper function to fetch user's language preference from database
**File:** `/src/middleware.ts` (add before `middleware` function)

```typescript
/**
 * Fetch user's language preference from the database
 * Returns null if user not found or no preference set
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
      return null;
    }

    return user.preferred_language;
  } catch {
    console.log('[i18n] Error fetching user language preference');
    return null;
  }
}
```

### Task 5.2.3: Add Language Detection After Session Check

**Action:** Add language detection logic after successful session retrieval
**File:** `/src/middleware.ts` (insert after session check, around line ~82)

The language detection should occur after the session is established but before any route-specific logic:

```typescript
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

// Set/refresh the locale cookie
setLocaleCookie(res, detectedLocale);

console.log('[MIDDLEWARE-I18N] Language detected:', {
  locale: detectedLocale,
  source: userLocalePreference?.preferred_language ? 'user_db' :
          req.cookies.get(LOCALE_COOKIE_NAME)?.value ? 'cookie' : 'detection',
  userId: session?.user?.id,
  path: req.nextUrl.pathname,
});
```

### Task 5.2.4: Add Locale Routes to Matcher (Optional)

**Action:** Ensure middleware runs on routes that need language handling
**File:** `/src/middleware.ts` (config.matcher array)

The current matcher already includes all protected routes. For comprehensive language support, consider adding:

```typescript
export const config = {
  matcher: [
    // Existing routes...
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
    // Add for language support on public pages (optional)
    '/p/:path*',     // Public property pages
    '/item/:path*',  // Public item pages
  ],
}
```

**Note:** Adding public routes to the matcher is optional for this phase. The language cookie will still persist from protected route visits.

### Task 5.2.5: Handle Language-Only Cookie Updates

**Action:** Add optimization to skip redundant cookie writes
**File:** `/src/middleware.ts` (within language detection block)

```typescript
// Only update cookie if locale changed or cookie doesn't exist
const currentCookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
if (currentCookieLocale !== detectedLocale) {
  setLocaleCookie(res, detectedLocale);
  console.log('[MIDDLEWARE-I18N] Updated locale cookie:', {
    previous: currentCookieLocale,
    new: detectedLocale,
  });
}
```

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Section | Changes |
|-----------|---------|---------|
| `/src/middleware.ts` | Imports (line ~6) | Add i18n module imports |
| `/src/middleware.ts` | Before `middleware` function | Add `getUserLanguagePreference` helper |
| `/src/middleware.ts` | After session check (~line 82) | Add language detection block |
| `/src/middleware.ts` | `config.matcher` | Optionally expand route matcher |

### Functions to ADD

| Function | Location | Purpose |
|----------|----------|---------|
| `getUserLanguagePreference` | `/src/middleware.ts` | Fetch user's preferred_language from database |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/index.ts` | Understand exports from i18n module (from REQ-246) |
| `/src/lib/i18n/language-detection.ts` | Reference detection function signature |
| `/src/lib/i18n/config.ts` | Reference constants and types |

### Files NOT to Modify

- `/src/lib/i18n/*` - Created in REQ-246, read-only for this task
- Database schema - Phase 1 tasks, not this task
- `next.config.ts` - Phase 2 tasks (next-intl configuration)

---

## 6. Dependencies

### Internal Dependencies (from REQ-246)

| Import | Source | Usage |
|--------|--------|-------|
| `detectUserLanguage` | `@/lib/i18n` | Main language detection function |
| `setLocaleCookie` | `@/lib/i18n` | Set locale cookie on response |
| `LOCALE_COOKIE_NAME` | `@/lib/i18n` | Cookie name constant |
| `SupportedLocale` | `@/lib/i18n` | TypeScript type for locale codes |

### Existing Dependencies (already in middleware)

| Import | Source | Usage |
|--------|--------|-------|
| `createServerClient` | `@supabase/ssr` | Create Supabase client |
| `NextResponse` | `next/server` | Response manipulation |
| `NextRequest` | `next/server` | Request type |
| `Database` | `@/lib/supabase` | Database types |

### Database Dependencies

**Required Column:** `users.preferred_language` (VARCHAR(5), default 'en')
- Added in Phase 1, Task 1.3
- If column doesn't exist, the query will return null and fall back to cookie/header detection

---

## 7. Acceptance Criteria

From Plan-110 Task 5.2 and REQ-247:

- [ ] Middleware imports language detection utilities from `@/lib/i18n`
- [ ] User's language preference is detected from database (if authenticated)
- [ ] Language preference is read from `FAQBNB_LANG` cookie
- [ ] Accept-Language header is parsed as fallback
- [ ] Default locale ('en') is used when no preference found
- [ ] Detected locale is set in response header (`x-locale`)
- [ ] Locale cookie is set/refreshed on every response
- [ ] Cookie persists across browser sessions (maxAge: 1 year)
- [ ] Language detection doesn't break existing authentication flow
- [ ] Language detection doesn't impact OAuth callback handling
- [ ] Language detection logging aids debugging

### Additional Verification

- [ ] Middleware continues to function if i18n module is not yet implemented
- [ ] Session errors don't prevent language detection from falling back to cookie/header
- [ ] Performance impact is minimal (single DB query for authenticated users)
- [ ] Cookie is only written when value changes (optimization)

---

## 8. Testing Strategy

### Manual Testing Scenarios

1. **Anonymous User - Cookie Detection:**
   ```
   1. Clear all cookies
   2. Visit /login
   3. Verify FAQBNB_LANG cookie is set to 'en' (or Accept-Language match)
   4. Check response headers contain x-locale
   ```

2. **Anonymous User - Accept-Language:**
   ```
   1. Clear all cookies
   2. Set browser language to French (Accept-Language: fr-FR)
   3. Visit /login
   4. Verify FAQBNB_LANG cookie is set to 'fr'
   ```

3. **Authenticated User - Database Preference:**
   ```
   1. Log in as user with preferred_language='de' in database
   2. Visit /dashboard2
   3. Verify x-locale header is 'de'
   4. Verify FAQBNB_LANG cookie is 'de'
   ```

4. **Cookie Persistence:**
   ```
   1. Set FAQBNB_LANG cookie to 'es' manually
   2. Visit any matched route
   3. Verify cookie value remains 'es'
   4. Verify x-locale header is 'es'
   ```

5. **OAuth Flow Unaffected:**
   ```
   1. Initiate OAuth login
   2. Complete OAuth callback
   3. Verify authentication completes successfully
   4. Verify language cookie is set after redirect
   ```

### Edge Cases

- User with `preferred_language: null` in database → falls back to cookie
- Invalid cookie value (e.g., 'zh') → falls back to Accept-Language or default
- Session error during auth → language detection continues with cookie/header
- Database query failure → logs error, uses cookie/header fallback

---

## 9. Code Integration Example

### Complete Modified Middleware Section

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

/**
 * Fetch user's language preference from the database
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
      return null;
    }

    return user.preferred_language;
  } catch {
    console.log('[i18n] Error fetching user language preference');
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ... existing OAuth callback detection ...

  // ... existing Supabase client creation ...

  // ... existing QR print page exemption ...

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    // ... existing session logging ...

    // ============ LANGUAGE DETECTION ============
    let userLocalePreference = null;

    if (session?.user) {
      const dbPreference = await getUserLanguagePreference(supabase, session.user.id);
      userLocalePreference = {
        id: session.user.id,
        preferred_language: dbPreference,
      };
    }

    const detectedLocale = detectUserLanguage(req, userLocalePreference);
    res.headers.set('x-locale', detectedLocale);

    // Only update cookie if changed
    const currentCookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (currentCookieLocale !== detectedLocale) {
      setLocaleCookie(res, detectedLocale);
    }

    console.log('[MIDDLEWARE-I18N] Language:', detectedLocale);

    // ... rest of existing middleware logic ...
  }
}
```

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-246 not complete (i18n module missing) | Medium | Medium | Add graceful fallback or implement after REQ-246 |
| Database column missing (preferred_language) | Low | Low | Query returns null, detection continues with cookie |
| Performance impact from extra DB query | Low | Low | Query is simple SELECT, indexed on user ID |
| Cookie conflicts with existing auth cookies | Low | Medium | Using unique cookie name (FAQBNB_LANG) |
| Breaking existing middleware flow | Low | High | Insert language detection without modifying existing logic |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Add i18n imports | 5 min |
| Create `getUserLanguagePreference` helper | 10 min |
| Add language detection block | 15 min |
| Add cookie optimization | 5 min |
| Testing and verification | 20 min |
| **Total** | **~55 min (1 hour)** |

---

## 12. Next Steps After Implementation

After completing Task 5.2 (this task):

1. **Task 5.3:** Create LanguageSwitcher component
2. **Task 5.4:** Create useLanguagePreference hook
3. **Task 5.5:** Create LocaleContext (optional enhancement)
4. **Task 5.6:** Add language preference API endpoint
5. **Task 5.7:** Integrate LanguageSwitcher into navigation

---

## 13. Rollback Plan

If issues arise after deployment:

1. Remove the language detection block from middleware
2. Remove the `getUserLanguagePreference` helper function
3. Remove the i18n imports
4. The FAQBNB_LANG cookie will remain on users' browsers but be ignored

No database changes or configuration changes required for rollback.

---

## References

- [Plan-110-L10N-Epic1-Foundation.md](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Full implementation plan
- [REQ-246-create-language-detection-utility-overview.md](/docs/REQ-246-create-language-detection-utility-overview.md) - Language detection utility (prerequisite)
- [PRD_L10N_Epic1_Foundation.md](/docs/prd/PRD_L10N_Epic1_Foundation.md) - Product requirements
- [next-intl Middleware](https://next-intl-docs.vercel.app/docs/routing/middleware) - Reference for i18n middleware patterns

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation (Phase 5, Task 5.2)*
