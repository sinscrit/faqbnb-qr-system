# Implementation Overview: Add Guest Language Detection to Middleware

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-020 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:30 |
| Breakdown Created | 2026-01-22 19:41 |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |

---

## Goals

Update the Next.js middleware to handle guest language detection for public item pages. The middleware should detect the guest's language preference from URL parameters, cookies, or Accept-Language headers and make it available to downstream server components via request headers without performing redirects.

**Success Criteria:**
- Middleware includes `/item/*` routes in the matcher configuration
- Guest language is detected from URL parameter, cookie, or Accept-Language header (in priority order)
- Detected language is set in a custom request header (`x-guest-language`) for server components to read
- Language cookie is set if no existing preference is found (for subsequent requests)
- No redirects are performed based on language selection
- Middleware passes through requests efficiently without blocking
- Existing middleware functionality (auth, user language detection) remains unaffected
- Performance impact is minimal (no database calls in middleware for guests)

---

## Assumptions & Clarifications

**Assumptions:**
- REQ-E04-002 (Create Guest Language Utility Module) provides `detectGuestLanguage` utility function
- REQ-E04-001 (Create Localization Types File) provides `SupportedLanguage` type and validation
- Guest language detection should be separate from authenticated user language detection
- Guest cookie name is `FAQBNB_GUEST_LANG` (different from `FAQBNB_LANG` for authenticated users)
- Server components will read the `x-guest-language` header to get the detected language
- Language detection should be lightweight and not perform database queries

**Clarifications Needed:**
- Should middleware set the guest language cookie on EVERY request, or only when absent?
- **Answer:** Only set cookie if it doesn't exist (optimization to avoid unnecessary cookie writes)

---

## Implementation Plan

### Step 1: Add `/item/*` Route to Middleware Matcher
- **Description**: Update the middleware matcher configuration to include public item routes so middleware intercepts guest requests
- **Rationale**: Currently middleware only handles authenticated routes. Guest item pages need language detection but aren't in the matcher.
- **Estimated Effort**: XS (5-10 minutes)

**Implementation Details:**
```typescript
// Current matcher (lines 285-300):
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

// Updated matcher - ADD '/item/:path*':
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
    '/item/:path*'  // ADD THIS LINE
  ],
}
```

### Step 2: Import Guest Language Detection Utilities
- **Description**: Import the guest language detection function and related utilities at the top of the middleware file
- **Rationale**: Need to use `detectGuestLanguage` from the guest language utility module (REQ-E04-002)
- **Estimated Effort**: XS (5 minutes)

**Implementation Details:**
```typescript
// Add to existing imports section (~lines 1-10):
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n'

// ADD NEW IMPORTS:
import {
  detectGuestLanguage,
  setGuestLanguageCookie,
  GUEST_LANGUAGE_COOKIE_NAME,
  type SupportedLanguage,
} from '@/lib/i18n/guest-language'
```

### Step 3: Create Guest Language Detection Logic
- **Description**: Add guest language detection logic in the middleware function after the authentication checks but before the return statement
- **Rationale**: Guest detection should happen after checking for exempted routes (OAuth, QR print) but before the response is returned
- **Estimated Effort**: M (45-60 minutes)

**Implementation Details:**
```typescript
// Add after line 163 (after authenticated user language detection ends)
// and before protected route checks

// ============ GUEST LANGUAGE DETECTION ============
// Only detect guest language for public item pages
const isPublicItemRoute = req.nextUrl.pathname.startsWith('/item/');

if (isPublicItemRoute && !session?.user) {
  console.log('[MIDDLEWARE-I18N-GUEST] Detecting guest language for:', req.nextUrl.pathname);

  // Read URL parameter (highest priority)
  const urlLangParam = req.nextUrl.searchParams.get('lang');

  // Detect guest language using priority cascade
  const guestLanguage = await detectGuestLanguage(urlLangParam, req);

  // Set language in response header for server components
  res.headers.set('x-guest-language', guestLanguage);

  // Only set cookie if it doesn't already exist (optimization)
  const existingGuestCookie = req.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;
  if (!existingGuestCookie) {
    setGuestLanguageCookie(res, guestLanguage);
    console.log('[MIDDLEWARE-I18N-GUEST] Set guest language cookie:', guestLanguage);
  }

  console.log('[MIDDLEWARE-I18N-GUEST] Guest language detected:', {
    language: guestLanguage,
    source: urlLangParam ? 'url_param' :
            existingGuestCookie ? 'cookie' : 'detection',
    path: req.nextUrl.pathname,
  });
}
// ============ END GUEST LANGUAGE DETECTION ============
```

**Placement Note:** Insert this block after line 163 (after the closing of authenticated user language detection) and before line 165 (session error check).

### Step 4: Handle Edge Cases for Guest Routes
- **Description**: Ensure middleware doesn't interfere with authenticated users accessing guest item pages
- **Rationale**: Authenticated users might share/view guest links. They should see the guest experience, not their user preferences.
- **Estimated Effort**: S (20-30 minutes)

**Implementation Details:**
```typescript
// Option 1: Separate logic completely (guests and authenticated users on /item/* use different detection)
const isPublicItemRoute = req.nextUrl.pathname.startsWith('/item/');

if (isPublicItemRoute) {
  // For public item routes, ALWAYS use guest language detection
  // even if user is authenticated (they're viewing a shared link)
  const urlLangParam = req.nextUrl.searchParams.get('lang');
  const guestLanguage = await detectGuestLanguage(urlLangParam, req);

  res.headers.set('x-guest-language', guestLanguage);

  const existingGuestCookie = req.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;
  if (!existingGuestCookie) {
    setGuestLanguageCookie(res, guestLanguage);
  }

  console.log('[MIDDLEWARE-I18N-GUEST] Guest language for item page:', {
    language: guestLanguage,
    isAuthenticated: !!session?.user,
    path: req.nextUrl.pathname,
  });
}
```

**Alternative Option 2:** Use authenticated user preference if they have one, otherwise guest detection. This decision should be made based on product requirements.

### Step 5: Performance Optimization
- **Description**: Ensure guest language detection doesn't perform expensive operations or block requests
- **Rationale**: Middleware runs on every matching request. Must be fast to avoid impacting user experience.
- **Estimated Effort**: XS (15 minutes)

**Checks to implement:**
- Confirm `detectGuestLanguage` doesn't make database calls (only reads cookies/headers)
- Verify cookie write is conditional (only when missing)
- Add timing logs in development to monitor performance
- Consider caching parsed Accept-Language headers if needed

**Implementation Details:**
```typescript
// Optional: Add performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  const startTime = performance.now();
  const guestLanguage = await detectGuestLanguage(urlLangParam, req);
  const endTime = performance.now();

  if (endTime - startTime > 10) {
    console.warn('[MIDDLEWARE-PERF] Guest language detection slow:', {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      path: req.nextUrl.pathname,
    });
  }
}
```

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Middleware Updates
| File | Target | Type |
|------|--------|------|
| `/src/middleware.ts` | Import statements (~lines 1-10) | Modify |
| `/src/middleware.ts` | `middleware` function (~line 46) | Modify |
| `/src/middleware.ts` | After line 163 (authenticated language detection) | Add new section |
| `/src/middleware.ts` | `config.matcher` array (~lines 286-299) | Modify |

### Specific Changes
| File | Target | Type |
|------|--------|------|
| `/src/middleware.ts` | Lines 6-10: Add guest language imports | Modify |
| `/src/middleware.ts` | Lines 163-164: Insert guest language detection logic | Add |
| `/src/middleware.ts` | Line ~298: Add `/item/:path*` to matcher | Add |

### Dependencies (Verify Exist)
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/guest-language.ts` | `detectGuestLanguage()` function | Verify |
| `/src/lib/i18n/guest-language.ts` | `setGuestLanguageCookie()` function | Verify |
| `/src/lib/i18n/guest-language.ts` | `GUEST_LANGUAGE_COOKIE_NAME` constant | Verify |
| `/src/types/l10n.ts` | `SupportedLanguage` type | Verify |

---

## Dependencies

### Depends On (Completed First):
- **REQ-E04-001** (Task 1.1): Create Localization Types File - Provides `SupportedLanguage` type
- **REQ-E04-002** (Task 1.2): Create Guest Language Utility Module - Provides `detectGuestLanguage` function
- **REQ-E04-015** (Task 4.2): Create Cookie Utility for Language Persistence - Provides `setGuestLanguageCookie` function
- **Existing Infrastructure**: Current middleware implementation with auth and user language detection

### Blocks (Requires This First):
- **REQ-E04-016** (Task 5.1): Update Guest Item Page Server Component - Needs `x-guest-language` header set by middleware
- **REQ-E04-021** (Task 6.2): Create Server-Side Language Detection Utility - May use middleware header as a source

### Parallel Safety:
- **Files touched**:
  - `/src/middleware.ts`
- **Conflicts with**:
  - Any other tasks modifying middleware (unlikely in Epic 4)
  - Tasks changing middleware matcher configuration
- **Safe to parallelize with**:
  - REQ-E04-017 (Update ItemDisplay Component) - Different file
  - REQ-E04-018 (Update LinkCard Component) - Different file
  - REQ-E04-019 (Handle URL Parameter) - Complementary; this provides server-side, that handles client-side
  - REQ-E04-022 through REQ-E04-026 (Testing tasks) - No conflicts

### External Dependencies:
- Next.js middleware APIs: `NextRequest`, `NextResponse`, matcher configuration
- Supabase SSR client (already imported for auth)
- Performance APIs (`performance.now()` for optional monitoring)

---

## Risks and Considerations

### Risk: Middleware Matcher Ordering

**Issue:** Next.js matcher patterns are evaluated in order. Adding `/item/:path*` might affect how other routes are matched.

**Mitigation:**
- Place `/item/:path*` at the end of the matcher array
- Test that QR print pages (`/item/:publicId/qr-print`) still work correctly (they have explicit exemption)
- Verify no conflicts with authenticated routes

### Risk: Performance Impact on Every Guest Request

**Issue:** Middleware runs on EVERY request matching the pattern. Language detection adds latency to all guest item page loads.

**Mitigation:**
- Ensure `detectGuestLanguage` is lightweight (no DB calls)
- Only parse Accept-Language header when needed
- Cookie writes are conditional (only when missing)
- Monitor performance in development with timing logs
- Target: detection should complete in < 5ms

**Benchmark Goals:**
- Cookie read: < 1ms
- Header parse: < 2ms
- Total guest detection: < 5ms

### Risk: Cookie Security Configuration

**Issue:** Guest language cookie must be configured securely but also be readable by client-side code.

**Mitigation:**
- Use `httpOnly: false` to allow client-side language switcher access
- Set `secure: true` in production (HTTPS only)
- Use `sameSite: 'lax'` for CSRF protection
- Different cookie name (`FAQBNB_GUEST_LANG`) than authenticated users (`FAQBNB_LANG`)

### Risk: Header Propagation to Server Components

**Issue:** Custom headers set in middleware may not propagate correctly to all server components in Next.js 15.

**Mitigation:**
- Test that `headers().get('x-guest-language')` works in page.tsx
- Document the header name clearly for downstream consumers
- Consider also setting a cookie as backup (already planned)
- Next.js 15 supports this pattern, but verify in testing

### Risk: Authenticated Users Viewing Guest Links

**Issue:** If an authenticated user visits `/item/abc123?lang=fr`, should they see their user preference or the guest language?

**Decision Required:** Two options:
1. **Guest language always wins on `/item/*` routes** (recommended for shareable links)
2. **User preference takes priority, guest language as fallback**

**Recommendation:** Use guest language detection for ALL requests to `/item/*` routes, regardless of authentication status. This ensures shareable links work consistently.

**Implementation:**
```typescript
// Remove the !session?.user condition:
// BEFORE: if (isPublicItemRoute && !session?.user)
// AFTER: if (isPublicItemRoute)
```

### Risk: Middleware Execution Order

**Issue:** Guest language detection needs to happen in the right order relative to auth checks and existing user language detection.

**Mitigation:**
- Place guest detection AFTER OAuth callback exemption (line 64)
- Place guest detection AFTER QR print exemption (line 105)
- Place guest detection AFTER session retrieval (line 111)
- Place guest detection AFTER authenticated user language detection (line 163)
- Place guest detection BEFORE protected route checks (line 208)

**Correct placement:** Between lines 163-165 (after user language, before session error check)

---

## Testing Strategy

### Unit Tests

**Note:** Middleware is difficult to unit test directly. Focus on integration tests instead.

**Test file:** `/src/lib/i18n/__tests__/guest-language.test.ts`

Verify the utilities used by middleware:
```typescript
import { detectGuestLanguage, setGuestLanguageCookie } from '../guest-language';

describe('detectGuestLanguage', () => {
  it('prioritizes URL parameter over cookie', async () => {
    const mockRequest = {
      nextUrl: { searchParams: new URLSearchParams('lang=fr') },
      cookies: { get: () => ({ value: 'es' }) },
      headers: { get: () => null },
    } as any;

    const result = await detectGuestLanguage('fr', mockRequest);
    expect(result).toBe('fr');
  });

  it('falls back to cookie when URL param absent', async () => {
    const mockRequest = {
      nextUrl: { searchParams: new URLSearchParams() },
      cookies: { get: (name: string) => name === 'FAQBNB_GUEST_LANG' ? { value: 'es' } : null },
      headers: { get: () => null },
    } as any;

    const result = await detectGuestLanguage(null, mockRequest);
    expect(result).toBe('es');
  });
});
```

### Integration Tests

**Test file:** `/src/middleware/__tests__/guest-language-middleware.integration.test.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

describe('Middleware - Guest Language Detection', () => {
  it('sets x-guest-language header for guest item requests', async () => {
    const req = new NextRequest('http://localhost:3000/item/abc123?lang=fr');
    const res = await middleware(req);

    expect(res.headers.get('x-guest-language')).toBe('fr');
  });

  it('sets guest language cookie when absent', async () => {
    const req = new NextRequest('http://localhost:3000/item/abc123');
    req.headers.set('Accept-Language', 'es-ES,es;q=0.9');

    const res = await middleware(req);

    expect(res.cookies.get('FAQBNB_GUEST_LANG')?.value).toBe('es');
  });

  it('does not interfere with authenticated routes', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    // Mock session
    const res = await middleware(req);

    expect(res.headers.get('x-guest-language')).toBeNull();
  });
});
```

### Manual Testing Checklist

#### Guest Language Detection
- [ ] Visit `/item/abc123` without cookie or URL param → Uses Accept-Language header
- [ ] Visit `/item/abc123?lang=fr` → Detects French from URL
- [ ] Visit `/item/abc123` with `FAQBNB_GUEST_LANG=es` cookie → Uses Spanish from cookie
- [ ] Visit `/item/abc123?lang=fr` with `FAQBNB_GUEST_LANG=es` cookie → URL param wins (French)

#### Header Propagation
- [ ] Server component can read `headers().get('x-guest-language')`
- [ ] Header value matches detected language
- [ ] Header is NOT set for non-item routes

#### Cookie Management
- [ ] Cookie is set on first visit when absent
- [ ] Cookie is NOT overwritten on subsequent visits (optimization)
- [ ] Cookie has correct attributes (Secure in prod, SameSite=Lax, 1-year expiry)
- [ ] Cookie name is `FAQBNB_GUEST_LANG` (not `FAQBNB_LANG`)

#### Route Matching
- [ ] Middleware runs for `/item/abc123`
- [ ] Middleware runs for `/item/abc123?lang=fr`
- [ ] Middleware still handles `/admin/*` routes correctly
- [ ] QR print pages `/item/:id/qr-print` are still exempted

#### Authenticated Users
- [ ] Authenticated user visiting `/item/abc123?lang=fr` → Uses guest language (fr)
- [ ] Authenticated user language cookie (`FAQBNB_LANG`) is NOT affected
- [ ] User can access their dashboard with their preferred language intact

#### Performance
- [ ] Check browser Network tab: middleware processing time < 50ms
- [ ] Check server logs: guest language detection < 5ms
- [ ] No database queries in middleware for guest routes

#### Edge Cases
- [ ] Invalid language code `?lang=invalid` → Falls back to cookie/header
- [ ] Malformed Accept-Language header → Falls back to default (en)
- [ ] Missing cookie when cookies disabled → Uses header/default
- [ ] XSS attempt `?lang=<script>` → Validated and rejected

---

## Out of Scope

The following are explicitly NOT part of this task:

1. **Guest Language Utility Module** - Creating the `detectGuestLanguage` function (handled in REQ-E04-002)
2. **Server Component Updates** - Reading the header in page.tsx (handled in REQ-E04-016)
3. **Client-Side Language Switching** - useGuestLanguage hook implementation (handled in REQ-E04-014)
4. **Language Redirects** - Middleware does NOT redirect based on language
5. **Path-Based Language URLs** - No `/fr/item/abc123` routing (language is query param only)
6. **Database Queries** - No fetching user preferences or item data in middleware
7. **Language Validation** - Validation logic is in guest-language.ts utility (REQ-E04-002)
8. **Cookie Utility Functions** - setGuestLanguageCookie implementation (REQ-E04-015)
9. **Analytics/Tracking** - No logging of language usage statistics
10. **A/B Testing** - No language-based experimentation
11. **Geolocation** - No IP-based language detection
12. **Browser Preferences UI** - No middleware involvement in language switcher

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route Matching | Add `/item/:path*` to matcher | Enables middleware to intercept guest item page requests |
| Guest Detection Scope | ALL requests to `/item/*` | Ensures shareable links work even for authenticated users |
| Header Name | `x-guest-language` | Custom header, follows convention (x- prefix for custom) |
| Cookie Write Strategy | Conditional (only when absent) | Performance optimization; avoids unnecessary writes |
| Cookie Name | `FAQBNB_GUEST_LANG` | Separate from user cookie (`FAQBNB_LANG`) to avoid conflicts |
| Redirect Behavior | No redirects | Language is preference, not routing; maintains clean URLs |
| Priority Cascade | URL > Cookie > Header > Default | URL enables shareable links; cookie persists preference |
| Placement in Middleware | After auth, before protected checks | Logical flow; guest detection after session retrieval |
| Performance Target | < 5ms detection time | Middleware must be fast; no DB calls allowed |

---

## Notes

- **Minimal Scope:** This is a focused S-sized task (2-3 hours) adding guest language support to middleware
- **Performance Critical:** Middleware runs on every matching request; must be fast and efficient
- **Security:** Guest cookie is separate from user cookie to prevent confusion/conflicts
- **No Redirects:** Language is a preference, not a routing concern; URLs stay clean
- **Backward Compatible:** Existing middleware functionality for auth and user language remains unchanged
- **Integration Point:** Sets the stage for REQ-E04-016 (server component) to read the detected language
- **Testing Priority:** Focus on route matching, header propagation, and performance
- **Cookie Strategy:** Only write when missing (optimization for repeat visitors)

---

**Status:** PENDING

**Next Steps:**
1. Verify dependencies completed (REQ-E04-001, REQ-E04-002, REQ-E04-015)
2. Add `/item/:path*` to middleware matcher configuration
3. Import guest language utilities at top of middleware file
4. Insert guest language detection logic after line 163
5. Set `x-guest-language` header in response
6. Conditionally set guest language cookie
7. Add development logging for debugging
8. Write integration tests for middleware behavior
9. Perform manual testing with various scenarios
10. Monitor performance in development
11. Verify no impact on existing authenticated routes
12. Run typecheck and fix any type errors
13. Commit changes following git conventions

---

*Document generated: 2026-01-22 19:41*
