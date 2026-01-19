# REQ-356: Add Guest Language Detection to Middleware - Implementation Overview

**Document Created:** 2026-01-19 17:00:00 UTC
**Last Modified:** 2026-01-19 17:00:00 UTC
**Request Reference:** docs/gen_requests_epic4.md - Request #356
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 6 - Middleware & Language Detection
**Task ID:** 6.1

---

## Summary

Enhance the existing middleware to detect guest language preferences for `/item/*` routes. The middleware will determine the guest's preferred language from URL query parameters, cookies, or Accept-Language headers, then make that language available to downstream page components via response headers and cookies. Critically, the middleware must NOT redirect requests - guests should receive their requested page directly with language context attached.

---

## Current State Analysis

### Existing Middleware (`/src/middleware.ts`)

The current middleware:
1. Handles OAuth callback detection (lines 50-64)
2. Creates Supabase server client for session management (lines 80-98)
3. Exempts QR print pages from authentication (lines 100-105)
4. **Already implements language detection for authenticated users** (lines 123-163):
   - Calls `detectUserLanguage()` from `@/lib/i18n`
   - Sets `x-locale` response header
   - Updates `FAQBNB_LANG` cookie when locale changes
   - Uses priority: User DB preference > Cookie > Accept-Language > Default
5. Handles protected route access control (lines 206-225)
6. Redirects authenticated users away from login page (lines 264-274)

### Middleware Matcher Configuration (lines 285-299)

Current matcher includes:
- `/admin/:path*` and `/admin`
- `/user/:path*` and `/user`
- `/dashboard/:path*` and `/dashboard`
- `/dashboard2/:path*` and `/dashboard2`
- `/login`
- `/auth/oauth/callback`
- `/register` and `/register/:path*`

**Missing:** `/item/*` routes are NOT in the matcher - these are guest-facing pages that need language detection.

### Existing i18n Infrastructure

From Epic 1 (Foundation), the following utilities already exist:

1. **`/src/lib/i18n/config.ts`**:
   - `LOCALE_COOKIE_NAME = 'FAQBNB_LANG'`
   - `LOCALE_COOKIE_MAX_AGE` (1 year)
   - `isSupportedLocale()` type guard
   - Supported locales: `['en', 'fr', 'es', 'de', 'nl', 'it']`

2. **`/src/lib/i18n/language-detection.ts`**:
   - `detectUserLanguage(request, user?, options?)` - main detection function
   - `setLocaleCookie(response, locale)` - cookie persistence
   - Priority cascade: User DB > Cookie > Accept-Language > Default

3. **`/src/lib/i18n/index.ts`**:
   - Barrel exports for all i18n utilities

---

## Requirements Analysis

From REQ-356 Acceptance Criteria:

| Criteria | Implementation Approach |
|----------|------------------------|
| Middleware matcher includes `/item/*` | Add `/item/:path*` to config.matcher array |
| URL query parameter highest priority | Check `req.nextUrl.searchParams.get('lang')` first |
| Cookie fallback | Use existing `detectUserLanguage()` with cookie support |
| Accept-Language fallback | Already handled by `detectUserLanguage()` |
| Default language fallback | Already handled by `detectUserLanguage()` (returns 'en') |
| Validate against supported codes | Use existing `isSupportedLocale()` |
| Invalid codes trigger fallback | Existing detection handles this |
| Set response header with language | Set `x-locale` header (already pattern used) |
| Update cookie with detected language | Use existing `setLocaleCookie()` |
| NO redirects | Ensure guest item routes return `NextResponse.next()` |
| Language detection before page component | Middleware runs before page by design |
| Preserve existing functionality | Add guest detection without modifying auth logic |

---

## Technical Approach

### Key Decision: Query Parameter Priority

The Plan-111 specifies this priority for guest language detection:
1. **URL parameter `?lang=fr`** (highest - enables shareable links)
2. **Cookie `FAQBNB_LANG`** (persistence)
3. **Accept-Language header** (auto-detection)
4. **Default 'en'** (fallback)

The existing `detectUserLanguage()` does NOT check URL parameters (it checks User DB > Cookie > Accept-Language). For guest routes, we need to:
1. Extract `?lang=` query parameter first
2. If valid, use it and optionally update cookie
3. If invalid or missing, fall through to existing `detectUserLanguage()`

### Implementation Strategy

**Option A: Modify `detectUserLanguage()` to accept URL param**
- Pros: Single function handles all detection
- Cons: Changes existing interface used by authenticated routes

**Option B: Add guest-specific logic in middleware before calling `detectUserLanguage()`** *(Recommended)*
- Pros: No changes to existing detection function, clear separation
- Cons: Slight code duplication for URL param handling

We will use **Option B** - add inline logic in middleware for guest routes that checks URL params first, then delegates to existing infrastructure.

---

## Implementation Tasks

### Task 1: Update Middleware Matcher Configuration

**File:** `/src/middleware.ts` (lines 285-299)

Add `/item/:path*` to the matcher array so middleware processes guest item page requests.

**Change:**
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
    '/item/:path*',  // NEW: Guest language detection for item pages
  ],
}
```

### Task 2: Add Guest Language Detection Logic

**File:** `/src/middleware.ts` (after line 105, before language detection block)

Add logic to detect if the current route is a guest item route and handle URL query parameter detection.

**New logic flow:**
1. Check if path matches `/item/` pattern
2. If guest route:
   - Check for `?lang=` query parameter
   - Validate against supported locales
   - If valid, use as detected language
   - If invalid, fall through to normal detection
3. Proceed with existing language detection for non-URL-param cases
4. Set `x-locale` header and update cookie
5. Return response (NO redirect)

**Key considerations:**
- Guest routes should NOT require session
- Guest routes should NOT check for user records
- Guest routes should NOT redirect to login
- Language detection should work for anonymous users

### Task 3: Ensure Guest Routes Skip Authentication Checks

**File:** `/src/middleware.ts`

Ensure the protected route checks (lines 206-225) do NOT apply to `/item/*` routes. Currently, the `isProtectedRoute` check already excludes item routes since they don't start with `/admin`, `/user`, `/dashboard`, or `/dashboard2`.

**Verification needed:** Confirm item routes pass through without session requirements.

### Task 4: Add Request Header for Downstream Access

**File:** `/src/middleware.ts`

The existing code already sets `res.headers.set('x-locale', detectedLocale)` (line 144). This will work for guest routes as well. Page components can read this header via `headers()` from `next/headers`.

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Scope |
|-----------|-------------------|
| `/src/middleware.ts` | Add guest language detection, update matcher |

### Functions Authorized for Modification

| Function/Section | File | Modification |
|------------------|------|--------------|
| `middleware()` | `/src/middleware.ts` | Add guest route detection and URL param handling |
| `config.matcher` | `/src/middleware.ts` | Add `/item/:path*` pattern |

### Files Authorized for Reading (No Modification)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/index.ts` | Reference existing exports |
| `/src/lib/i18n/config.ts` | Reference locale configuration |
| `/src/lib/i18n/language-detection.ts` | Reference detection patterns |
| `/src/app/item/[publicId]/page.tsx` | Understand downstream consumer |

### Files NOT to Be Modified

| File Path | Reason |
|-----------|--------|
| `/src/lib/i18n/language-detection.ts` | Existing function works; add guest logic in middleware |
| `/src/lib/i18n/config.ts` | No changes needed |
| `/src/app/item/[publicId]/page.tsx` | Separate task (5.1) |

---

## Code Examples

### Guest Language Detection Block (New Code)

```typescript
// ============ GUEST LANGUAGE DETECTION FOR ITEM ROUTES ============
const isGuestItemRoute = req.nextUrl.pathname.startsWith('/item/');

if (isGuestItemRoute) {
  console.log('[MIDDLEWARE-GUEST] Processing guest item route:', req.nextUrl.pathname);

  // Check for ?lang= query parameter (highest priority for guests)
  const langParam = req.nextUrl.searchParams.get('lang');
  let guestDetectedLocale: SupportedLocale | null = null;

  if (langParam && isSupportedLocale(langParam)) {
    guestDetectedLocale = langParam;
    console.log('[MIDDLEWARE-GUEST] Language from URL param:', guestDetectedLocale);
  }

  // Fall back to cookie/header detection if no valid URL param
  if (!guestDetectedLocale) {
    guestDetectedLocale = detectUserLanguage(req, null); // No user for guest
    console.log('[MIDDLEWARE-GUEST] Language from detection:', guestDetectedLocale);
  }

  // Set locale header for downstream use
  res.headers.set('x-locale', guestDetectedLocale);

  // Update cookie if different from current
  const currentCookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (currentCookieLocale !== guestDetectedLocale) {
    setLocaleCookie(res, guestDetectedLocale);
    console.log('[MIDDLEWARE-GUEST] Updated locale cookie:', guestDetectedLocale);
  }

  // Return response directly - NO redirect for guest routes
  return res;
}
// ============ END GUEST LANGUAGE DETECTION ============
```

### Updated Imports

```typescript
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type SupportedLocale,
} from '@/lib/i18n';
```

---

## Testing Considerations

### Test Scenarios

1. **URL Parameter Priority**
   - Visit `/item/abc123?lang=fr` → Should detect French
   - Visit `/item/abc123?lang=invalid` → Should fall back to cookie/header/default

2. **Cookie Persistence**
   - Visit `/item/abc123?lang=de` → Cookie should be set to 'de'
   - Visit `/item/xyz456` (no param) → Should read 'de' from cookie

3. **Accept-Language Fallback**
   - Clear cookies, set browser to Spanish
   - Visit `/item/abc123` → Should detect Spanish

4. **Default Fallback**
   - Clear cookies, set browser to unsupported language (e.g., Japanese)
   - Visit `/item/abc123` → Should default to 'en'

5. **No Redirect Verification**
   - Visit `/item/abc123?lang=fr` → Should load directly (no 302/307)
   - Response URL should remain `/item/abc123?lang=fr`

6. **Header Availability**
   - Check that `x-locale` header is set on response
   - Page component can access via `headers().get('x-locale')`

7. **Existing Auth Routes Unaffected**
   - Visit `/admin` without session → Should still redirect to login
   - Visit `/dashboard2` with session → Should work normally

---

## Dependencies

### Required (Must Exist)

| Dependency | Location | Status |
|------------|----------|--------|
| `detectUserLanguage()` | `/src/lib/i18n/language-detection.ts` | Exists (Epic 1) |
| `setLocaleCookie()` | `/src/lib/i18n/language-detection.ts` | Exists (Epic 1) |
| `isSupportedLocale()` | `/src/lib/i18n/config.ts` | Exists (Epic 1) |
| `LOCALE_COOKIE_NAME` | `/src/lib/i18n/config.ts` | Exists (Epic 1) |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Exists (Epic 1) |

### Downstream Consumers (Future Tasks)

| Consumer | Task | Status |
|----------|------|--------|
| `/src/app/item/[publicId]/page.tsx` | Task 5.1 | Pending |
| `/src/components/ItemDisplay.tsx` | Task 5.2 | Pending |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing auth middleware | Low | High | Test all auth routes after changes |
| Performance impact from URL param parsing | Very Low | Low | URL param check is O(1), already parsed by Next.js |
| Cookie domain issues | Low | Medium | Use existing `setLocaleCookie()` which handles domain |
| Type import issues | Low | Low | Import `SupportedLocale` type alongside functions |

---

## Success Criteria

1. `/item/*` routes are processed by middleware
2. `?lang=` query parameter takes highest priority for language detection
3. Cookie and Accept-Language headers work as fallback
4. `x-locale` header is set on all item route responses
5. Cookie is updated when language changes
6. No redirects occur for guest item routes
7. All existing authenticated routes continue to work correctly
8. Language detection completes in <10ms (negligible overhead)

---

## References

- **Request:** docs/gen_requests_epic4.md (REQ-356)
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md (Task 6.1)
- **Existing Middleware:** /src/middleware.ts
- **i18n Configuration:** /src/lib/i18n/config.ts
- **Language Detection:** /src/lib/i18n/language-detection.ts
- **Item Page:** /src/app/item/[publicId]/page.tsx
