# Add Guest Language Detection to Middleware - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:38
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #20)
- Overview: docs/REQ-E04-020-add-guest-language-detection-to-middleware-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Goals and Context

### Purpose
Update the Next.js middleware to handle guest language detection for public item pages. The middleware should detect the guest's language preference from URL parameters, cookies, or Accept-Language headers and make it available to downstream server components via request headers without performing redirects.

### Success Criteria
- Middleware includes `/item/*` routes in the matcher configuration
- Guest language is detected from URL parameter, cookie, or Accept-Language header (in priority order)
- Detected language is set in a custom request header (`x-guest-language`) for server components to read
- Language cookie is set if no existing preference is found (for subsequent requests)
- No redirects are performed based on language selection
- Middleware passes through requests efficiently without blocking
- Existing middleware functionality (auth, user language detection) remains unaffected
- Performance impact is minimal (no database calls in middleware for guests)

### Acceptance Criteria from Requirements Document
- [ ] Middleware matcher includes `/item/:path*` pattern
- [ ] Middleware detects language from `?lang=` URL parameter as highest priority
- [ ] Middleware detects language from `FAQBNB_GUEST_LANG` cookie as second priority
- [ ] Middleware detects language from `Accept-Language` header as fallback
- [ ] Detected language is set in `x-guest-language` request header
- [ ] Cookie is set if no existing language preference found
- [ ] Middleware does NOT perform redirects for language selection
- [ ] Existing middleware functionality (auth, etc.) remains unaffected
- [ ] Performance impact is minimal (no database calls in middleware)

---

## Implementation Tasks

### Phase 1: Add Import Statements for Guest Language Utilities

#### Task 1.1: Import Guest Language Detection Functions
**Subtask ID:** **1.1**
**Context:** The middleware needs to use guest language utilities from the guest-language module created in REQ-E04-002 and REQ-E04-015.
**Files to modify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **1.1.1** Open file `/src/middleware.ts`
- [ ] **1.1.2** Locate the existing import section at the top of the file (lines 1-10)
- [ ] **1.1.3** After the existing i18n imports (around line 9), add new imports for guest language utilities:
  ```typescript
  import {
    detectGuestLanguage,
    setGuestLanguageCookie,
    GUEST_LANGUAGE_COOKIE_NAME,
  } from '@/lib/i18n/guest-language'
  import type { SupportedLanguage } from '@/types/l10n'
  ```
- [ ] **1.1.4** Verify the import paths match the actual file locations in the project
- [ ] **1.1.5** Run TypeScript check: `npm run typecheck`
- [ ] **1.1.6** Verify no import errors or type errors
- [ ] **1.1.7** Commit changes: "Add guest language utility imports to middleware"

**Verification:**
- TypeScript compilation succeeds
- Import paths resolve correctly
- Types are available for use in middleware
- No linting errors

**Notes:**
- These imports bring in the detectGuestLanguage function from REQ-E04-002
- setGuestLanguageCookie function from REQ-E04-015
- GUEST_LANGUAGE_COOKIE_NAME constant for consistency
- SupportedLanguage type for type safety

---

### Phase 2: Update Middleware Matcher Configuration

#### Task 2.1: Add /item/* Route to Matcher Array
**Subtask ID:** **2.1**
**Context:** The middleware matcher configuration (lines 285-300) currently only includes authenticated routes. We need to add public item routes so the middleware can detect guest language preferences.
**Files to modify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **2.1.1** Locate the `export const config` section at the bottom of `/src/middleware.ts` (around lines 285-300)
- [ ] **2.1.2** Find the `matcher` array within the config object
- [ ] **2.1.3** Add `/item/:path*` to the end of the matcher array:
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
      '/item/:path*'  // ADD THIS LINE
    ],
  }
  ```
- [ ] **2.1.4** Add a comment explaining the addition:
  ```typescript
  '/item/:path*'  // Guest language detection for public item pages
  ```
- [ ] **2.1.5** Verify the matcher syntax is correct (Next.js path pattern format)
- [ ] **2.1.6** Run TypeScript check: `npm run typecheck`
- [ ] **2.1.7** Run lint check: `npm run lint`
- [ ] **2.1.8** Commit changes: "Add /item/* route to middleware matcher"

**Verification:**
- Matcher array includes `/item/:path*`
- Syntax is valid Next.js matcher pattern
- TypeScript and lint checks pass
- No duplicate routes in matcher

**Notes:**
- Next.js matcher uses `:path*` syntax for wildcard matching
- This enables middleware to intercept all `/item/[publicId]` requests
- Placement at end of array is intentional (no priority conflicts)
- QR print pages will be exempted via existing logic (line 105)

---

### Phase 3: Implement Guest Language Detection Logic

#### Task 3.1: Add Guest Language Detection Section After Authenticated User Logic
**Subtask ID:** **3.1**
**Context:** Guest language detection should occur after the authenticated user language detection block (which ends at line 163) but before session error checks and protected route validation. This ensures guests get language detection without interfering with auth flows.
**Files to modify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **3.1.1** Locate line 163 in `/src/middleware.ts` (end of authenticated user language detection block with comment "// ============ END LANGUAGE DETECTION ============")
- [ ] **3.1.2** After line 163 and before line 165 (session error check), insert a new section marker comment:
  ```typescript
  // ============ GUEST LANGUAGE DETECTION ============
  ```
- [ ] **3.1.3** Add route detection check:
  ```typescript
  // Only detect guest language for public item pages
  const isPublicItemRoute = req.nextUrl.pathname.startsWith('/item/');
  ```
- [ ] **3.1.4** Add conditional block for guest language detection:
  ```typescript
  if (isPublicItemRoute) {
    console.log('[MIDDLEWARE-I18N-GUEST] Detecting guest language for:', req.nextUrl.pathname);

    // Implementation will be added in next subtask
  }
  ```
- [ ] **3.1.5** Add closing section marker comment:
  ```typescript
  // ============ END GUEST LANGUAGE DETECTION ============
  ```
- [ ] **3.1.6** Verify the placement is correct (after line 163, before line 165)
- [ ] **3.1.7** Run TypeScript check: `npm run typecheck`
- [ ] **3.1.8** Commit changes: "Add guest language detection section skeleton"

**Verification:**
- New section is placed correctly in middleware flow
- Route detection logic is present
- Console logging is in place for debugging
- TypeScript compiles without errors
- Section markers are clear and consistent with existing style

**Notes:**
- This section runs for ALL requests to `/item/*`, regardless of authentication status
- Decision: Guest language detection applies even for authenticated users viewing shared links
- This ensures shareable links work consistently for all recipients

---

#### Task 3.2: Implement URL Parameter Extraction and Language Detection
**Subtask ID:** **3.2**
**Context:** Within the guest language detection block, we need to extract the URL parameter, call the detection function, and set the result in a custom header for server components to use.
**Files to modify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **3.2.1** Inside the `if (isPublicItemRoute)` block, extract the URL language parameter:
  ```typescript
  // Read URL parameter (highest priority in detection cascade)
  const urlLangParam = req.nextUrl.searchParams.get('lang');
  ```
- [ ] **3.2.2** Call the guest language detection function:
  ```typescript
  // Detect guest language using priority cascade: URL > Cookie > Accept-Language > Default
  const guestLanguage = await detectGuestLanguage(urlLangParam, req);
  ```
- [ ] **3.2.3** Set the detected language in a custom response header for server components:
  ```typescript
  // Set language in response header for server components to read
  res.headers.set('x-guest-language', guestLanguage);
  ```
- [ ] **3.2.4** Add logging for the detected language:
  ```typescript
  console.log('[MIDDLEWARE-I18N-GUEST] Guest language detected:', {
    language: guestLanguage,
    source: urlLangParam ? 'url_param' : 'detection',
    path: req.nextUrl.pathname,
  });
  ```
- [ ] **3.2.5** Verify detectGuestLanguage function signature matches usage
- [ ] **3.2.6** Run TypeScript check: `npm run typecheck`
- [ ] **3.2.7** Commit changes: "Implement URL parameter extraction and language detection"

**Verification:**
- URL parameter is extracted correctly from searchParams
- detectGuestLanguage is called with correct arguments
- Custom header `x-guest-language` is set on response
- Console logging provides debugging information
- TypeScript types are correct for all variables
- No compilation errors

**Notes:**
- detectGuestLanguage handles the full priority cascade internally
- URL parameter can be null (function handles this gracefully)
- Custom header `x-guest-language` follows convention (x- prefix for custom headers)
- Server components will read this header using Next.js headers() API

---

#### Task 3.3: Implement Conditional Cookie Setting for Guest Language
**Subtask ID:** **3.3**
**Context:** We need to set the guest language cookie to persist preferences across visits, but only if the cookie doesn't already exist (performance optimization to avoid unnecessary cookie writes).
**Files to modify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **3.3.1** After setting the response header, add logic to check for existing cookie:
  ```typescript
  // Only set cookie if it doesn't already exist (optimization)
  const existingGuestCookie = req.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;
  ```
- [ ] **3.3.2** Add conditional cookie setting:
  ```typescript
  if (!existingGuestCookie) {
    setGuestLanguageCookie(res, guestLanguage);
    console.log('[MIDDLEWARE-I18N-GUEST] Set guest language cookie:', guestLanguage);
  }
  ```
- [ ] **3.3.3** Update the logging from Task 3.2.4 to include cookie source information:
  ```typescript
  console.log('[MIDDLEWARE-I18N-GUEST] Guest language detected:', {
    language: guestLanguage,
    source: urlLangParam ? 'url_param' :
            existingGuestCookie ? 'cookie' : 'accept_language_or_default',
    path: req.nextUrl.pathname,
    cookieSet: !existingGuestCookie,
  });
  ```
- [ ] **3.3.4** Verify GUEST_LANGUAGE_COOKIE_NAME constant is imported correctly
- [ ] **3.3.5** Verify setGuestLanguageCookie function signature matches usage
- [ ] **3.3.6** Run TypeScript check: `npm run typecheck`
- [ ] **3.3.7** Commit changes: "Add conditional guest language cookie setting"

**Verification:**
- Existing cookie is checked before writing
- Cookie is only set when absent (optimization)
- setGuestLanguageCookie is called with correct arguments (response, language)
- Console logging shows whether cookie was set
- TypeScript types are correct
- No compilation errors

**Notes:**
- This optimization reduces unnecessary cookie writes on every request
- setGuestLanguageCookie function handles cookie attributes (Secure, SameSite, expiry)
- Cookie name GUEST_LANGUAGE_COOKIE_NAME ensures separation from user cookies
- Cookie is readable by client-side code (httpOnly: false) for language switcher

---

### Phase 4: Performance Optimization and Monitoring

#### Task 4.1: Add Development Performance Monitoring
**Subtask ID:** **4.1**
**Context:** Middleware runs on every matching request. We need to ensure guest language detection is fast and doesn't impact page load times. Add optional performance monitoring in development to catch any slowdowns.
**Files to modify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **4.1.1** Before calling detectGuestLanguage in the guest detection block, add performance timing for development:
  ```typescript
  // Performance monitoring in development
  let guestLanguage: SupportedLanguage;

  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    guestLanguage = await detectGuestLanguage(urlLangParam, req);
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 10) {
      console.warn('[MIDDLEWARE-PERF] Guest language detection slow:', {
        duration: `${duration.toFixed(2)}ms`,
        path: req.nextUrl.pathname,
      });
    }
  } else {
    guestLanguage = await detectGuestLanguage(urlLangParam, req);
  }
  ```
- [ ] **4.1.2** Verify performance.now() is available in middleware context
- [ ] **4.1.3** Add a comment explaining the 10ms threshold:
  ```typescript
  // Warn if detection takes > 10ms (target is < 5ms)
  ```
- [ ] **4.1.4** Run TypeScript check: `npm run typecheck`
- [ ] **4.1.5** Test in development mode: `npm run dev`
- [ ] **4.1.6** Verify no performance warnings appear for typical requests
- [ ] **4.1.7** Commit changes: "Add development performance monitoring for guest language detection"

**Verification:**
- Performance monitoring only runs in development (not production)
- Timing is accurate and uses performance.now()
- Warning threshold is set at 10ms
- No impact on production builds
- Console warnings are helpful and actionable
- TypeScript compiles without errors

**Notes:**
- Target performance: < 5ms for guest language detection
- Warning at 10ms gives early notice of potential issues
- Performance monitoring helps identify if detectGuestLanguage has problems
- Production builds skip this overhead entirely

---

### Phase 5: Testing and Verification

#### Task 5.1: Verify Dependencies Exist
**Subtask ID:** **5.1**
**Context:** The middleware depends on utilities and types from other tasks. Before testing, verify all dependencies are present and correctly implemented.
**Files to verify:** Multiple
**Estimated effort:** 1 story point

- [ ] **5.1.1** Verify `/src/lib/i18n/guest-language.ts` file exists
- [ ] **5.1.2** Verify `detectGuestLanguage()` function is exported from guest-language.ts
- [ ] **5.1.3** Verify function signature matches usage:
  ```typescript
  export async function detectGuestLanguage(
    urlParam: string | null,
    request: NextRequest
  ): Promise<SupportedLanguage>
  ```
- [ ] **5.1.4** Verify `setGuestLanguageCookie()` function is exported
- [ ] **5.1.5** Verify function signature matches usage:
  ```typescript
  export function setGuestLanguageCookie(
    response: NextResponse,
    language: SupportedLanguage
  ): void
  ```
- [ ] **5.1.6** Verify `GUEST_LANGUAGE_COOKIE_NAME` constant is exported
- [ ] **5.1.7** Verify `/src/types/l10n.ts` file exists with `SupportedLanguage` type
- [ ] **5.1.8** Run TypeScript check: `npm run typecheck`
- [ ] **5.1.9** If dependencies are missing, note which ones and verify prerequisite tasks (REQ-E04-001, REQ-E04-002, REQ-E04-015) are complete

**Verification:**
- All dependency files exist at expected paths
- All required functions are exported
- Function signatures match middleware usage
- SupportedLanguage type is defined correctly
- TypeScript compilation succeeds
- No import errors

**Notes:**
- If dependencies are missing, this task blocks implementation
- Prerequisites: REQ-E04-001 (types), REQ-E04-002 (detection), REQ-E04-015 (cookies)
- This verification ensures middleware can compile and run

---

#### Task 5.2: Manual Testing - Route Matching and Middleware Execution
**Subtask ID:** **5.2**
**Context:** Test that the middleware correctly intercepts `/item/*` routes and that guest language detection executes.
**Files to test:** Manual testing via browser
**Estimated effort:** 1 story point

- [ ] **5.2.1** Start development server: `npm run dev`
- [ ] **5.2.2** Navigate to a valid item page: `/item/[validPublicId]`
- [ ] **5.2.3** Check browser DevTools Console for middleware logs starting with `[MIDDLEWARE-I18N-GUEST]`
- [ ] **5.2.4** Verify log shows "Detecting guest language for: /item/[publicId]"
- [ ] **5.2.5** Verify log shows detected language and source
- [ ] **5.2.6** Test with URL parameter: `/item/[validPublicId]?lang=fr`
- [ ] **5.2.7** Verify log shows source as "url_param" and language as "fr"
- [ ] **5.2.8** Clear cookies and test without URL parameter
- [ ] **5.2.9** Verify middleware falls back to Accept-Language header or default
- [ ] **5.2.10** Test other routes (e.g., `/dashboard`) to ensure they still work and don't trigger guest detection

**Verification:**
- Middleware intercepts `/item/*` routes
- Console logs appear for guest language detection
- URL parameter is correctly extracted
- Fallback detection works when URL param is missing
- Other routes are unaffected by changes
- No errors in console

**Notes:**
- Valid publicId can be obtained from database or existing items
- Browser language settings affect Accept-Language header
- Different browsers may send different Accept-Language values

---

#### Task 5.3: Manual Testing - Header Propagation to Server Components
**Subtask ID:** **5.3**
**Context:** Verify that the `x-guest-language` header set by middleware is readable by server components.
**Files to test:** Manual testing via browser and server logs
**Estimated effort:** 1 story point

- [ ] **5.3.1** Ensure development server is running: `npm run dev`
- [ ] **5.3.2** Temporarily add logging to `/src/app/item/[publicId]/page.tsx` to read the header:
  ```typescript
  import { headers } from 'next/headers';

  // In page component:
  const headersList = await headers();
  const guestLang = headersList.get('x-guest-language');
  console.log('[PAGE] x-guest-language header:', guestLang);
  ```
- [ ] **5.3.3** Navigate to `/item/[validPublicId]?lang=fr`
- [ ] **5.3.4** Check server terminal logs for `[PAGE] x-guest-language header: fr`
- [ ] **5.3.5** Test with different language parameter: `?lang=es`
- [ ] **5.3.6** Verify server logs show `x-guest-language: es`
- [ ] **5.3.7** Test without URL parameter to verify fallback language is set in header
- [ ] **5.3.8** Remove temporary logging code from page.tsx
- [ ] **5.3.9** Verify header is NOT set for non-item routes (e.g., `/dashboard`)

**Verification:**
- Server components can read `x-guest-language` header
- Header value matches middleware detection
- Header is only set for `/item/*` routes
- Header works for all language codes
- Fallback language is correctly set in header

**Notes:**
- Next.js 15 headers() API is async (await required)
- Header propagation is a core Next.js feature (should work reliably)
- This test confirms the integration between middleware and server components

---

#### Task 5.4: Manual Testing - Cookie Persistence and Optimization
**Subtask ID:** **5.4**
**Context:** Test that the guest language cookie is set correctly and only when absent (optimization).
**Files to test:** Manual testing via browser DevTools
**Estimated effort:** 1 story point

- [ ] **5.4.1** Clear all cookies in browser DevTools
- [ ] **5.4.2** Navigate to `/item/[validPublicId]?lang=fr`
- [ ] **5.4.3** Open DevTools Application/Storage tab → Cookies
- [ ] **5.4.4** Verify `FAQBNB_GUEST_LANG` cookie exists with value `fr`
- [ ] **5.4.5** Check cookie attributes:
  - Domain: localhost or production domain
  - Path: /
  - Expires: ~1 year from now
  - SameSite: Lax
  - Secure: true (production only)
- [ ] **5.4.6** Navigate to another item page (same or different): `/item/[anotherPublicId]`
- [ ] **5.4.7** Check server logs to verify cookie was NOT overwritten (optimization working)
- [ ] **5.4.8** Verify log shows `cookieSet: false` in subsequent requests
- [ ] **5.4.9** Manually change cookie value to `es` in DevTools
- [ ] **5.4.10** Navigate to `/item/[validPublicId]`
- [ ] **5.4.11** Verify existing cookie value `es` is respected and NOT overwritten

**Verification:**
- Cookie is set on first visit with correct attributes
- Cookie is NOT overwritten on subsequent visits (optimization)
- Cookie persists across multiple item page visits
- Manually modified cookie is respected
- Cookie name is `FAQBNB_GUEST_LANG` (not user cookie)
- Cookie attributes are secure and appropriate

**Notes:**
- Cookie expiry should be ~365 days
- SameSite Lax allows cookie to be sent with navigation
- Secure flag should only be true in production (HTTPS)
- httpOnly should be false (client needs to read for language switcher)

---

#### Task 5.5: Manual Testing - Authenticated Users Viewing Guest Links
**Subtask ID:** **5.5**
**Context:** Test that authenticated users viewing `/item/*` routes still trigger guest language detection (for shareable link consistency).
**Files to test:** Manual testing via browser
**Estimated effort:** 1 story point

- [ ] **5.5.1** Log in as an authenticated user
- [ ] **5.5.2** Navigate to `/item/[validPublicId]?lang=fr`
- [ ] **5.5.3** Verify middleware logs show guest language detection executed
- [ ] **5.5.4** Verify `x-guest-language` header is set to `fr`
- [ ] **5.5.5** Check that user's personal language preference cookie (`FAQBNB_LANG`) is NOT affected
- [ ] **5.5.6** Navigate to user dashboard `/dashboard` or `/user`
- [ ] **5.5.7** Verify dashboard uses user's preferred language, not guest language
- [ ] **5.5.8** Return to item page: `/item/[validPublicId]?lang=es`
- [ ] **5.5.9** Verify guest language changes to Spanish for item page
- [ ] **5.5.10** Verify user language in dashboard remains unchanged

**Verification:**
- Authenticated users trigger guest language detection on `/item/*` routes
- Guest language cookie is separate from user language cookie
- User's preferred language is unaffected by guest language
- Dashboard and user pages use user language, not guest language
- Shareable links work consistently regardless of authentication status

**Notes:**
- This ensures shareable links work the same for everyone
- Guest language is scoped to `/item/*` routes only
- User language applies to authenticated areas (dashboard, admin, user pages)
- Two separate cookies prevent conflicts: FAQBNB_GUEST_LANG and FAQBNB_LANG

---

#### Task 5.6: Manual Testing - Edge Cases and Error Handling
**Subtask ID:** **5.6**
**Context:** Test edge cases to ensure middleware handles invalid inputs gracefully.
**Files to test:** Manual testing via browser
**Estimated effort:** 1 story point

- [ ] **5.6.1** Test invalid language code: `/item/[validPublicId]?lang=invalid`
- [ ] **5.6.2** Verify middleware falls back to cookie or Accept-Language (no error)
- [ ] **5.6.3** Test XSS attempt: `/item/[validPublicId]?lang=<script>alert('xss')</script>`
- [ ] **5.6.4** Verify no script execution and fallback to safe default
- [ ] **5.6.5** Test empty language parameter: `/item/[validPublicId]?lang=`
- [ ] **5.6.6** Verify fallback to cookie or Accept-Language
- [ ] **5.6.7** Disable cookies in browser settings
- [ ] **5.6.8** Navigate to `/item/[validPublicId]?lang=fr`
- [ ] **5.6.9** Verify URL parameter still works without cookie persistence
- [ ] **5.6.10** Test malformed Accept-Language header (if possible to simulate)
- [ ] **5.6.11** Verify fallback to default language (en)
- [ ] **5.6.12** Test QR print exemption still works: `/item/[validPublicId]/qr-print`
- [ ] **5.6.13** Verify QR print page loads without guest language detection interfering

**Verification:**
- Invalid language codes are handled gracefully
- XSS attempts are blocked (validation in detectGuestLanguage)
- Empty parameters don't cause errors
- Cookie-disabled browsers still work
- Malformed headers don't crash middleware
- QR print pages are still exempted
- No errors in console for any edge case

**Notes:**
- Validation happens in detectGuestLanguage function (REQ-E04-002)
- QR print exemption is in existing middleware code (line 105)
- Middleware should never throw errors; always return response

---

#### Task 5.7: Performance Testing - Middleware Execution Time
**Subtask ID:** **5.7**
**Context:** Verify that guest language detection meets performance targets (< 5ms detection time).
**Files to test:** Development server logs
**Estimated effort:** 1 story point

- [ ] **5.7.1** Ensure development server is running with performance monitoring enabled
- [ ] **5.7.2** Navigate to `/item/[validPublicId]` multiple times
- [ ] **5.7.3** Check server logs for `[MIDDLEWARE-PERF]` warnings
- [ ] **5.7.4** Verify NO warnings appear (detection should be < 10ms)
- [ ] **5.7.5** Test with URL parameter: `/item/[validPublicId]?lang=fr`
- [ ] **5.7.6** Verify performance is consistent with and without URL param
- [ ] **5.7.7** Test with existing cookie present
- [ ] **5.7.8** Verify performance with cookie (should be faster, < 2ms)
- [ ] **5.7.9** Check browser Network tab → Timing
- [ ] **5.7.10** Verify total middleware processing adds < 50ms to request time
- [ ] **5.7.11** If performance warnings appear, investigate detectGuestLanguage implementation

**Verification:**
- Guest language detection completes in < 5ms (typical)
- No performance warnings in development logs
- Cookie reads are fast (< 1ms)
- Accept-Language parsing is fast (< 2ms)
- Total middleware overhead is acceptable (< 50ms)
- Performance is consistent across multiple requests

**Notes:**
- Performance monitoring only runs in development
- Target: < 5ms for detection
- Warning threshold: 10ms
- If slow, check detectGuestLanguage implementation for DB calls or expensive operations
- Middleware must not block or slow down page loads

---

### Phase 6: Build Verification and Cleanup

#### Task 6.1: TypeScript Compilation Check
**Subtask ID:** **6.1**
**Context:** Ensure all middleware changes compile without TypeScript errors.
**Files to verify:** All modified TypeScript files
**Estimated effort:** 1 story point

- [ ] **6.1.1** Run TypeScript compiler: `npm run typecheck`
- [ ] **6.1.2** Review any type errors related to middleware changes
- [ ] **6.1.3** Fix type errors if any:
  - Verify import paths are correct
  - Verify function signatures match usage
  - Verify NextRequest and NextResponse types are correct
  - Verify SupportedLanguage type is used correctly
- [ ] **6.1.4** Re-run typecheck until no errors: `npm run typecheck`
- [ ] **6.1.5** Commit any type fixes: "Fix TypeScript errors in middleware guest language detection"

**Verification:**
- `npm run typecheck` completes with no errors
- All types are correctly inferred
- No use of `any` types introduced
- Import paths are correct
- Function signatures match their implementations

**Notes:**
- TypeScript errors must be fixed before merging
- All middleware functions should be properly typed
- No type assertions (`as`) should be needed if dependencies are correct

---

#### Task 6.2: ESLint Check
**Subtask ID:** **6.2**
**Context:** Ensure middleware changes follow project linting rules.
**Files to verify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **6.2.1** Run ESLint: `npm run lint`
- [ ] **6.2.2** Review any linting warnings or errors in middleware.ts
- [ ] **6.2.3** Fix linting issues:
  - Remove unused imports
  - Fix code style issues
  - Fix console.log statements if they violate rules
  - Ensure consistent formatting
- [ ] **6.2.4** Re-run lint check: `npm run lint`
- [ ] **6.2.5** Verify no errors or warnings for middleware.ts
- [ ] **6.2.6** Commit lint fixes if any: "Fix ESLint issues in middleware"

**Verification:**
- `npm run lint` completes with no errors for middleware.ts
- No unused imports
- Code style is consistent with project standards
- Console logging is appropriate (development only where needed)
- No linting warnings

**Notes:**
- Some console.log statements are intentional for debugging
- Performance monitoring console.warn is acceptable in development blocks
- ESLint rules may vary by project configuration

---

#### Task 6.3: Production Build Test
**Subtask ID:** **6.3**
**Context:** Verify that middleware changes don't break the production build.
**Files to verify:** Production build output
**Estimated effort:** 1 story point

- [ ] **6.3.1** Run production build: `npm run build`
- [ ] **6.3.2** Verify build completes successfully without errors
- [ ] **6.3.3** Check build output for middleware warnings:
  - No unused code warnings
  - No dynamic import warnings
  - No environment variable issues
- [ ] **6.3.4** If build fails, review error messages and fix issues
- [ ] **6.3.5** Re-run build until successful: `npm run build`
- [ ] **6.3.6** Start production server: `npm start`
- [ ] **6.3.7** Test item page in production mode: visit `/item/[validPublicId]`
- [ ] **6.3.8** Verify guest language detection works in production
- [ ] **6.3.9** Verify no development performance logs appear in production
- [ ] **6.3.10** Stop production server

**Verification:**
- Production build succeeds without errors
- No build warnings related to middleware
- Middleware works correctly in production mode
- Performance monitoring is disabled in production
- Cookies have Secure flag set in production
- No console logs in production (except essential errors)

**Notes:**
- Production build optimizes code and removes development checks
- Performance monitoring should only run in development
- Secure cookie flag should only be true in production (HTTPS)

---

#### Task 6.4: Code Comments and Documentation
**Subtask ID:** **6.4**
**Context:** Add clear comments to the middleware code for future maintainability.
**Files to modify:** `/src/middleware.ts`
**Estimated effort:** 1 story point

- [ ] **6.4.1** Review all added code in middleware.ts
- [ ] **6.4.2** Add explanatory comments for guest language detection section:
  ```typescript
  // ============ GUEST LANGUAGE DETECTION ============
  // Detect and persist guest language preferences for public item pages.
  // Priority: URL param > Cookie > Accept-Language header > Default (en)
  // Sets x-guest-language header for server components to read.
  // Only writes cookie if absent (optimization for repeat visitors).
  ```
- [ ] **6.4.3** Add comment explaining route check:
  ```typescript
  // Only detect guest language for public item pages (/item/*)
  // Applies to ALL visitors (guests and authenticated users) to ensure
  // shareable links work consistently regardless of recipient's auth status
  ```
- [ ] **6.4.4** Add comment for performance monitoring:
  ```typescript
  // Development performance monitoring - warn if detection > 10ms (target < 5ms)
  ```
- [ ] **6.4.5** Add comment for cookie optimization:
  ```typescript
  // Only set cookie if absent - optimization to avoid unnecessary writes on every request
  ```
- [ ] **6.4.6** Add comment to matcher array addition:
  ```typescript
  '/item/:path*'  // Guest language detection for public item pages (REQ-E04-020)
  ```
- [ ] **6.4.7** Verify comments are clear and helpful
- [ ] **6.4.8** Commit comment additions: "Add documentation comments for guest language detection"

**Verification:**
- All new code sections have explanatory comments
- Comments explain "why" not just "what"
- Complex logic is documented
- Section markers are consistent with existing style
- Comments reference relevant requirement IDs where appropriate

**Notes:**
- Good comments help future developers understand the code
- Performance targets should be documented (< 5ms)
- Priority cascade should be clearly explained
- Optimization rationale should be documented

---

#### Task 6.5: Final Integration Test
**Subtask ID:** **6.5**
**Context:** Perform a comprehensive end-to-end test of the entire guest language detection flow.
**Files to test:** Complete middleware integration
**Estimated effort:** 1 story point

- [ ] **6.5.1** Clear all browser cookies and cache
- [ ] **6.5.2** Navigate to `/item/[validPublicId]` (no URL param)
- [ ] **6.5.3** Verify language is detected from Accept-Language header
- [ ] **6.5.4** Verify cookie is set with detected language
- [ ] **6.5.5** Navigate to `/item/[validPublicId]?lang=fr`
- [ ] **6.5.6** Verify URL parameter overrides cookie
- [ ] **6.5.7** Verify display language changes to French
- [ ] **6.5.8** Remove URL parameter, navigate to `/item/[validPublicId]`
- [ ] **6.5.9** Verify French cookie persists
- [ ] **6.5.10** Navigate to `/dashboard` or other authenticated route
- [ ] **6.5.11** Verify guest language does NOT affect authenticated routes
- [ ] **6.5.12** Test full flow with authenticated user
- [ ] **6.5.13** Verify shareable links work for authenticated users
- [ ] **6.5.14** Verify no errors in console throughout entire flow

**Verification:**
- Complete flow works from start to finish
- Priority cascade functions correctly (URL > Cookie > Header > Default)
- Cookie persists across page loads
- Guest language is isolated to `/item/*` routes
- Authenticated routes are unaffected
- No errors at any stage
- User experience is smooth and predictable

**Notes:**
- This is the final verification before committing
- Tests the entire guest language detection system end-to-end
- Ensures all components work together correctly

---

#### Task 6.6: Final Commit and Summary
**Subtask ID:** **6.6**
**Context:** Create final commit with comprehensive message documenting all changes.
**Files to commit:** All modified files
**Estimated effort:** 1 story point

- [ ] **6.6.1** Review all changes: `git status`
- [ ] **6.6.2** Verify only middleware.ts was modified (as expected)
- [ ] **6.6.3** Review diff: `git diff src/middleware.ts`
- [ ] **6.6.4** Stage changes: `git add src/middleware.ts`
- [ ] **6.6.5** Create comprehensive commit message:
  ```bash
  git commit -m "$(cat <<'EOF'
  [REQ-E04-020] Add guest language detection to middleware

  Implemented guest language detection for public item pages:
  - Added /item/:path* to middleware matcher configuration
  - Imported guest language utilities (detectGuestLanguage, setGuestLanguageCookie)
  - Implemented guest language detection with priority cascade (URL > Cookie > Header > Default)
  - Set x-guest-language response header for server components to read
  - Added conditional cookie setting (only when absent) for optimization
  - Added development performance monitoring (warn if > 10ms)
  - Comprehensive testing (route matching, header propagation, cookie persistence, edge cases)
  - Verified no impact on existing authenticated routes
  - Performance target met: < 5ms detection time

  Changes:
  - src/middleware.ts: Added guest language imports, detection logic, matcher route

  Testing:
  - Manual testing: URL params, cookies, headers, authenticated users, edge cases
  - Performance testing: < 5ms detection confirmed
  - Build verification: TypeScript, ESLint, production build all pass

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  EOF
  )"
  ```
- [ ] **6.6.6** Verify commit was created: `git log -1`
- [ ] **6.6.7** Push to remote: `git push origin [branch-name]`

**Verification:**
- All changes are committed
- Commit message is comprehensive and descriptive
- Commit follows project conventions
- Changes are pushed to remote repository
- No uncommitted changes remain

**Notes:**
- Commit message should be detailed for future reference
- Include requirement ID in commit message
- List key changes and testing performed
- Follow project's commit message conventions

---

## Summary of Changes

### Files Modified
- `/src/middleware.ts` - Added guest language detection logic, imports, and matcher configuration

### Key Additions
1. **Imports**: Guest language utilities and types
2. **Matcher**: `/item/:path*` route added to config
3. **Detection Logic**: Guest language detection block after line 163
4. **Header**: `x-guest-language` set for server components
5. **Cookie**: Conditional setting when absent
6. **Performance**: Development monitoring for detection time

### Dependencies Required
- REQ-E04-001: `/src/types/l10n.ts` with `SupportedLanguage` type
- REQ-E04-002: `/src/lib/i18n/guest-language.ts` with `detectGuestLanguage` function
- REQ-E04-015: `setGuestLanguageCookie` function in guest-language.ts

### Integration Points
- Server components read `x-guest-language` header (REQ-E04-016)
- Client components use `FAQBNB_GUEST_LANG` cookie (REQ-E04-014)
- URL parameter handling works with shareable links (REQ-E04-019)

---

## Risk Mitigation

### Performance Risk
- **Mitigation**: Development monitoring warns if > 10ms
- **Target**: < 5ms detection time
- **Optimization**: Conditional cookie writes only when absent

### Security Risk
- **Mitigation**: Validation in detectGuestLanguage function
- **Cookie Security**: Separate guest cookie, SameSite=Lax, Secure in production

### Integration Risk
- **Mitigation**: Custom header `x-guest-language` for server components
- **Fallback**: Cookie provides backup if header doesn't propagate

### Route Conflict Risk
- **Mitigation**: QR print pages still exempted (existing logic at line 105)
- **Testing**: Verified no conflicts with authenticated routes

---

## Success Criteria Checklist

- [ ] Middleware includes `/item/*` routes in matcher configuration
- [ ] Guest language detected from URL param (highest priority)
- [ ] Guest language detected from cookie (second priority)
- [ ] Guest language detected from Accept-Language header (fallback)
- [ ] Detected language set in `x-guest-language` header
- [ ] Cookie set only when absent (optimization)
- [ ] No redirects performed based on language
- [ ] Existing auth functionality unaffected
- [ ] Performance impact < 5ms (target met)
- [ ] All tests pass (manual and build verification)
- [ ] TypeScript compilation succeeds
- [ ] Production build succeeds
- [ ] Code is documented with clear comments

---

**Document Status:** PENDING
**Last Modified:** 2026-01-22 23:38
**Total Tasks:** 6 phases, 18 main tasks, 110+ subtasks
**Estimated Effort:** 2-3 hours (S-sized task)
