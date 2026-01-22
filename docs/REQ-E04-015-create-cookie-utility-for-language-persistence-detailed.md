# Create Cookie Utility for Language Persistence - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:16
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #15 - REQ-E04-015)
- Overview: docs/REQ-E04-015-create-cookie-utility-for-language-persistence-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

**Last Modified:** 2026-01-22 23:16

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

Extend the guest language utility module (`src/lib/i18n/guest-language.ts`) with cookie management functions for persisting guest language preferences. These utilities enable setting, retrieving, and clearing the `FAQBNB_GUEST_LANG` cookie with proper security configuration (1-year expiry, Secure flag in production, SameSite=Lax).

**Key Features:**
- Set `FAQBNB_GUEST_LANG` cookie with guest language preference
- 1-year expiration (365 days) for persistent preference
- Security flags: `Secure` (HTTPS only in production), `SameSite=Lax` (CSRF protection)
- Support both client-side (document.cookie) and server-side (Next.js cookies API) contexts
- Get guest language from cookie with validation
- Clear guest language cookie when needed
- Type-safe validation against SupportedLanguage type

**Size:** XS (1-2 hours estimated effort)

---

## 1. Review Existing Guest Language Module

**Context:** Before adding cookie utilities, understand the existing module structure and identify where to add the new functions.

**Files to reference:** `src/lib/i18n/guest-language.ts` (from REQ-E04-002), `src/hooks/useLanguagePreference.ts` (pattern reference)

**Estimated effort:** 1 story point

- [ ] **1.1** Read `src/lib/i18n/guest-language.ts` to understand current module structure
- [ ] **1.2** Check if cookie constants or utilities already exist (from REQ-E04-002)
- [ ] **1.3** Identify where to add cookie utilities (after existing functions or in separate section)
- [ ] **1.4** Read `src/hooks/useLanguagePreference.ts` to understand cookie utility pattern
- [ ] **1.5** Note the pattern for `setLanguageCookie()` (lines 54-60)
- [ ] **1.6** Note the pattern for `getLanguageFromCookie()` (lines 65-76)
- [ ] **1.7** Verify `SupportedLanguage` type is imported from '@/types'
- [ ] **1.8** Document the planned structure for cookie utilities section

---

## 2. Define Cookie Constants

**Context:** Define configuration constants for the guest language cookie at the top of the module.

**Files to modify:** `src/lib/i18n/guest-language.ts`

**Estimated effort:** 1 story point

- [ ] **2.1** Add section divider comment: `// =============================================================================`
- [ ] **2.2** Add section title comment: `// Guest Language Cookie Constants`
- [ ] **2.3** Add closing divider: `// =============================================================================`
- [ ] **2.4** Add module-level JSDoc comment explaining cookie purpose and distinction from authenticated user cookie
- [ ] **2.5** Define `GUEST_LANGUAGE_COOKIE_NAME` constant: `export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';`
- [ ] **2.6** Add JSDoc comment explaining cookie name is separate from FAQBNB_LANG (authenticated users)
- [ ] **2.7** Define `GUEST_LANGUAGE_COOKIE_MAX_AGE` constant: `export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;`
- [ ] **2.8** Add JSDoc comment: "Cookie expiration: 1 year in seconds"
- [ ] **2.9** Define `GUEST_LANGUAGE_COOKIE_PATH` constant: `export const GUEST_LANGUAGE_COOKIE_PATH = '/';`
- [ ] **2.10** Add JSDoc comment: "Cookie path: root - makes cookie available across entire site"
- [ ] **2.11** Define `GUEST_LANGUAGE_COOKIE_SAMESITE` constant: `export const GUEST_LANGUAGE_COOKIE_SAMESITE = 'Lax';`
- [ ] **2.12** Add JSDoc comment explaining SameSite=Lax allows navigation (shareable links) but blocks CSRF
- [ ] **2.13** Verify all constants are exported with `export const`
- [ ] **2.14** Verify constants match overview specification exactly

---

## 3. Create Type Guard Helper Function

**Context:** Create a type guard to validate cookie values against the SupportedLanguage type.

**Files to modify:** `src/lib/i18n/guest-language.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Add section divider for helper functions
- [ ] **3.2** Add JSDoc comment explaining type guard purpose
- [ ] **3.3** Define `isSupportedLanguage` function signature: `function isSupportedLanguage(value: string): value is SupportedLanguage {`
- [ ] **3.4** Create array of supported languages: `const supportedLanguages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];`
- [ ] **3.5** Implement type guard logic: `return supportedLanguages.includes(value as SupportedLanguage);`
- [ ] **3.6** Close function with `}`
- [ ] **3.7** Verify function is NOT exported (internal helper only)
- [ ] **3.8** Verify TypeScript correctly narrows type with `value is SupportedLanguage` predicate
- [ ] **3.9** Test that function returns true for valid language codes
- [ ] **3.10** Test that function returns false for invalid strings

---

## 4. Implement setGuestLanguageCookie Function (Client-Side)

**Context:** Create the function to set the guest language cookie in the browser with all required security attributes.

**Files to modify:** `src/lib/i18n/guest-language.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Add section divider: `// =============================================================================`
- [ ] **4.2** Add section title: `// Client-Side Cookie Utilities`
- [ ] **4.3** Add closing divider: `// =============================================================================`
- [ ] **4.4** Add comprehensive JSDoc comment explaining function purpose, parameters, security attributes, and usage example
- [ ] **4.5** Define function signature: `export function setGuestLanguageCookie(language: SupportedLanguage): void {`
- [ ] **4.6** Add browser context check: `if (typeof document === 'undefined') {`
- [ ] **4.7** Add warning log: `console.warn('[guest-language] Cannot set cookie: document is undefined (SSR context)');`
- [ ] **4.8** Return early: `return;`
- [ ] **4.9** Calculate expiration date: `const expires = new Date();`
- [ ] **4.10** Set expiration time: `expires.setTime(expires.getTime() + GUEST_LANGUAGE_COOKIE_MAX_AGE * 1000);`
- [ ] **4.11** Build cookie value: `const cookieValue = \`\${GUEST_LANGUAGE_COOKIE_NAME}=\${language}\`;`
- [ ] **4.12** Build cookie path: `const cookiePath = \`path=\${GUEST_LANGUAGE_COOKIE_PATH}\`;`
- [ ] **4.13** Build cookie expires: `const cookieExpires = \`expires=\${expires.toUTCString()}\`;`
- [ ] **4.14** Build cookie SameSite: `const cookieSameSite = \`SameSite=\${GUEST_LANGUAGE_COOKIE_SAMESITE}\`;`
- [ ] **4.15** Check environment: `const isProduction = process.env.NODE_ENV === 'production';`
- [ ] **4.16** Conditionally set Secure flag: `const secureFlag = isProduction ? 'Secure' : '';`
- [ ] **4.17** Combine cookie parts: `const cookieParts = [cookieValue, cookiePath, cookieExpires, cookieSameSite, secureFlag].filter(Boolean);`
- [ ] **4.18** Set cookie: `document.cookie = cookieParts.join('; ');`
- [ ] **4.19** Add success log: `console.log(\`[guest-language] Cookie set: \${language}\`);`
- [ ] **4.20** Close function with `}`
- [ ] **4.21** Verify function is exported

---

## 5. Implement getGuestLanguageCookie Function (Client-Side)

**Context:** Create the function to read and validate the guest language cookie from the browser.

**Files to modify:** `src/lib/i18n/guest-language.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Add comprehensive JSDoc comment explaining function purpose, return value, and usage example
- [ ] **5.2** Define function signature: `export function getGuestLanguageCookie(): SupportedLanguage | null {`
- [ ] **5.3** Add browser context check: `if (typeof document === 'undefined') {`
- [ ] **5.4** Add warning log: `console.warn('[guest-language] Cannot read cookie: document is undefined (SSR context)');`
- [ ] **5.5** Return null: `return null;`
- [ ] **5.6** Split cookies: `const cookies = document.cookie.split(';');`
- [ ] **5.7** Start for loop: `for (const cookie of cookies) {`
- [ ] **5.8** Parse cookie name and value: `const [name, value] = cookie.trim().split('=');`
- [ ] **5.9** Check if cookie name matches: `if (name === GUEST_LANGUAGE_COOKIE_NAME) {`
- [ ] **5.10** Validate value: `if (isSupportedLanguage(value)) {`
- [ ] **5.11** Return validated value: `return value;`
- [ ] **5.12** Handle invalid value: `} else {`
- [ ] **5.13** Log warning: `console.warn(\`[guest-language] Invalid cookie value: \${value}\`);`
- [ ] **5.14** Return null: `return null;`
- [ ] **5.15** Close validation block: `}`
- [ ] **5.16** Close name check block: `}`
- [ ] **5.17** Close for loop: `}`
- [ ] **5.18** Return null if cookie not found: `return null;`
- [ ] **5.19** Close function with `}`
- [ ] **5.20** Verify function is exported

---

## 6. Implement clearGuestLanguageCookie Function (Client-Side)

**Context:** Create the function to remove the guest language cookie by setting an expired date.

**Files to modify:** `src/lib/i18n/guest-language.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Add comprehensive JSDoc comment explaining function purpose and usage example
- [ ] **6.2** Define function signature: `export function clearGuestLanguageCookie(): void {`
- [ ] **6.3** Add browser context check: `if (typeof document === 'undefined') {`
- [ ] **6.4** Add warning log: `console.warn('[guest-language] Cannot clear cookie: document is undefined (SSR context)');`
- [ ] **6.5** Return early: `return;`
- [ ] **6.6** Create past date: `const pastDate = new Date(0).toUTCString();`
- [ ] **6.7** Build cookie string with empty value and past expiration
- [ ] **6.8** Set cookie: `document.cookie = \`\${GUEST_LANGUAGE_COOKIE_NAME}=; path=\${GUEST_LANGUAGE_COOKIE_PATH}; expires=\${pastDate}; SameSite=\${GUEST_LANGUAGE_COOKIE_SAMESITE}\`;`
- [ ] **6.9** Add success log: `console.log('[guest-language] Cookie cleared');`
- [ ] **6.10** Close function with `}`
- [ ] **6.11** Verify function is exported

---

## 7. Add Server-Side Cookie Utilities (Optional)

**Context:** Add optional server-side cookie utilities for Next.js middleware and server components.

**Files to modify:** `src/lib/i18n/guest-language.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Add section divider: `// =============================================================================`
- [ ] **7.2** Add section title: `// Server-Side Cookie Utilities (Optional)`
- [ ] **7.3** Add closing divider: `// =============================================================================`
- [ ] **7.4** Import Next.js types: `import { NextRequest, NextResponse } from 'next/server';`
- [ ] **7.5** Add JSDoc comment for setGuestLanguageCookieServer explaining server-side usage
- [ ] **7.6** Define function signature: `export function setGuestLanguageCookieServer(response: NextResponse, language: SupportedLanguage): void {`
- [ ] **7.7** Use Next.js cookies API: `response.cookies.set({`
- [ ] **7.8** Set name: `name: GUEST_LANGUAGE_COOKIE_NAME,`
- [ ] **7.9** Set value: `value: language,`
- [ ] **7.10** Set path: `path: GUEST_LANGUAGE_COOKIE_PATH,`
- [ ] **7.11** Set maxAge: `maxAge: GUEST_LANGUAGE_COOKIE_MAX_AGE,`
- [ ] **7.12** Set sameSite: `sameSite: 'lax',`
- [ ] **7.13** Set secure: `secure: process.env.NODE_ENV === 'production',`
- [ ] **7.14** Close cookies.set call: `});`
- [ ] **7.15** Close function: `}`
- [ ] **7.16** Add JSDoc comment for getGuestLanguageCookieServer
- [ ] **7.17** Define function signature: `export function getGuestLanguageCookieServer(request: NextRequest): SupportedLanguage | null {`
- [ ] **7.18** Get cookie value: `const cookieValue = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;`
- [ ] **7.19** Validate and return: `if (cookieValue && isSupportedLanguage(cookieValue)) { return cookieValue; }`
- [ ] **7.20** Return null if invalid: `return null;`
- [ ] **7.21** Close function: `}`

---

## 8. Add Module-Level Documentation

**Context:** Add comprehensive module-level JSDoc explaining the cookie utilities, security configuration, and usage patterns.

**Files to modify:** `src/lib/i18n/guest-language.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** Add module header comment at the top of the cookie utilities section
- [ ] **8.2** Document purpose: "Guest Language Cookie Utilities"
- [ ] **8.3** Document that it manages language preference persistence for unauthenticated guests
- [ ] **8.4** Document cookie name: FAQBNB_GUEST_LANG (separate from FAQBNB_LANG)
- [ ] **8.5** Document features: 1-year expiration, Secure flag, SameSite=Lax
- [ ] **8.6** Document client-side and server-side support
- [ ] **8.7** Document type-safe validation against SupportedLanguage
- [ ] **8.8** Add Security section explaining Secure flag (HTTPS in production)
- [ ] **8.9** Explain SameSite=Lax (prevents CSRF, allows shareable links)
- [ ] **8.10** Explain no sensitive data stored (only language code)
- [ ] **8.11** Explain cookie accessible via JavaScript (HttpOnly not needed)
- [ ] **8.12** Add @module tag: `@module lib/i18n/guest-language`
- [ ] **8.13** Add @see references to REQ-E04-015 and REQ-E04-002
- [ ] **8.14** Add @lastModified tag with current date (2026-01-22)

---

## 9. Verify TypeScript Type Safety

**Context:** Ensure all functions are properly typed and TypeScript compilation passes.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **9.1** Run TypeScript compiler: `npx tsc --noEmit`
- [ ] **9.2** Verify no errors related to `src/lib/i18n/guest-language.ts`
- [ ] **9.3** Verify `SupportedLanguage` type is correctly imported from '@/types'
- [ ] **9.4** Verify all exported functions have explicit return types
- [ ] **9.5** Verify `setGuestLanguageCookie` parameter type is `SupportedLanguage`
- [ ] **9.6** Verify `getGuestLanguageCookie` return type is `SupportedLanguage | null`
- [ ] **9.7** Verify `clearGuestLanguageCookie` return type is `void`
- [ ] **9.8** Verify `isSupportedLanguage` type guard predicate is correct: `value is SupportedLanguage`
- [ ] **9.9** Verify server-side functions use correct Next.js types (NextRequest, NextResponse)
- [ ] **9.10** Fix any TypeScript errors found
- [ ] **9.11** Re-run type check until all errors are resolved

---

## 10. Test Cookie Setting

**Context:** Manually test that cookies are set correctly with all required attributes.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **10.1** Test calling `setGuestLanguageCookie('fr')` in browser console
- [ ] **10.2** Open browser DevTools > Application > Cookies
- [ ] **10.3** Verify cookie named `FAQBNB_GUEST_LANG` exists
- [ ] **10.4** Verify cookie value is `'fr'`
- [ ] **10.5** Verify cookie Path is `/`
- [ ] **10.6** Verify cookie SameSite is `Lax`
- [ ] **10.7** Verify cookie Expires is approximately 1 year from now (365 days)
- [ ] **10.8** In production environment, verify Secure flag is set
- [ ] **10.9** In development environment (localhost), verify Secure flag is NOT set
- [ ] **10.10** Test setting cookie with all 6 languages (en, fr, es, de, nl, it)
- [ ] **10.11** Verify console log appears: "[guest-language] Cookie set: <language>"
- [ ] **10.12** Document test results

---

## 11. Test Cookie Reading

**Context:** Manually test that cookies are read correctly and validated.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **11.1** Set cookie using `setGuestLanguageCookie('es')`
- [ ] **11.2** Call `getGuestLanguageCookie()` in browser console
- [ ] **11.3** Verify function returns `'es'`
- [ ] **11.4** Manually set invalid cookie value in DevTools: `FAQBNB_GUEST_LANG=invalid`
- [ ] **11.5** Call `getGuestLanguageCookie()` again
- [ ] **11.6** Verify function returns `null`
- [ ] **11.7** Verify console warning appears: "Invalid cookie value: invalid"
- [ ] **11.8** Clear all cookies in DevTools
- [ ] **11.9** Call `getGuestLanguageCookie()` with no cookie present
- [ ] **11.10** Verify function returns `null` (no error)
- [ ] **11.11** Document test results

---

## 12. Test Cookie Clearing

**Context:** Manually test that cookies are properly removed.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **12.1** Set cookie using `setGuestLanguageCookie('de')`
- [ ] **12.2** Verify cookie exists in browser DevTools
- [ ] **12.3** Call `clearGuestLanguageCookie()` in browser console
- [ ] **12.4** Verify console log appears: "[guest-language] Cookie cleared"
- [ ] **12.5** Refresh DevTools Cookies view
- [ ] **12.6** Verify `FAQBNB_GUEST_LANG` cookie is no longer present
- [ ] **12.7** Call `getGuestLanguageCookie()`
- [ ] **12.8** Verify function returns `null`
- [ ] **12.9** Verify clearing non-existent cookie doesn't cause errors
- [ ] **12.10** Document test results

---

## 13. Test SSR Context Handling

**Context:** Verify that cookie utilities handle server-side rendering gracefully without crashing.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **13.1** Verify all client-side functions check `typeof document !== 'undefined'`
- [ ] **13.2** Verify functions return early with null/void when in SSR context
- [ ] **13.3** Verify console warnings are logged in SSR context
- [ ] **13.4** Create a simple server component that calls cookie utilities
- [ ] **13.5** Verify server component doesn't crash during SSR
- [ ] **13.6** Verify appropriate warnings appear in server logs
- [ ] **13.7** Verify client-side functions work correctly after hydration
- [ ] **13.8** Test useEffect pattern: call cookie utilities inside useEffect (client-only)
- [ ] **13.9** Verify no hydration mismatch warnings in browser console
- [ ] **13.10** Document SSR safety verification results

---

## 14. Test Server-Side Cookie Utilities (Optional)

**Context:** If server-side utilities were implemented, test them in a Next.js server context.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **14.1** Create a test API route at `src/app/api/test-guest-cookie/route.ts`
- [ ] **14.2** Import server-side utilities: `import { setGuestLanguageCookieServer, getGuestLanguageCookieServer } from '@/lib/i18n/guest-language';`
- [ ] **14.3** Implement GET handler to read cookie from request
- [ ] **14.4** Implement POST handler to set cookie on response
- [ ] **14.5** Test GET request to API route
- [ ] **14.6** Verify `getGuestLanguageCookieServer` reads cookie correctly
- [ ] **14.7** Test POST request to API route with language parameter
- [ ] **14.8** Verify `setGuestLanguageCookieServer` sets cookie on response
- [ ] **14.9** Verify cookie appears in browser DevTools after POST
- [ ] **14.10** Verify cookie has correct attributes (Path, SameSite, Secure, MaxAge)
- [ ] **14.11** Delete test API route after verification
- [ ] **14.12** Document server-side utility test results

---

## 15. Test Cookie Persistence

**Context:** Verify cookies persist across page refreshes and browser sessions.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **15.1** Set cookie using `setGuestLanguageCookie('nl')`
- [ ] **15.2** Verify cookie value using `getGuestLanguageCookie()` returns `'nl'`
- [ ] **15.3** Refresh the page (F5 or Cmd+R)
- [ ] **15.4** Call `getGuestLanguageCookie()` again
- [ ] **15.5** Verify cookie value is still `'nl'` (persists across refresh)
- [ ] **15.6** Close the browser tab
- [ ] **15.7** Reopen the same URL in a new tab
- [ ] **15.8** Call `getGuestLanguageCookie()` again
- [ ] **15.9** Verify cookie value is still `'nl'` (persists across sessions)
- [ ] **15.10** Wait 1 minute and verify cookie still exists (not a session cookie)
- [ ] **15.11** Check cookie expiration date is approximately 1 year in the future
- [ ] **15.12** Document persistence test results

---

## 16. Test Security Configuration

**Context:** Verify cookies have correct security attributes in different environments.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **16.1** In development (localhost), set cookie using `setGuestLanguageCookie('it')`
- [ ] **16.2** Open DevTools > Application > Cookies
- [ ] **16.3** Verify cookie does NOT have Secure flag (allows HTTP in development)
- [ ] **16.4** Verify cookie has SameSite=Lax
- [ ] **16.5** Verify cookie has Path=/
- [ ] **16.6** In production environment (if available), set cookie
- [ ] **16.7** Verify cookie HAS Secure flag (HTTPS only)
- [ ] **16.8** Verify cookie has SameSite=Lax
- [ ] **16.9** Test that cookie is NOT sent over HTTP in production (should be blocked)
- [ ] **16.10** Verify HttpOnly is NOT set (cookie accessible via JavaScript)
- [ ] **16.11** Document security configuration test results

---

## 17. Test Type Validation

**Context:** Verify the type guard correctly validates language codes.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **17.1** Test `isSupportedLanguage('en')` returns `true`
- [ ] **17.2** Test `isSupportedLanguage('fr')` returns `true`
- [ ] **17.3** Test `isSupportedLanguage('es')` returns `true`
- [ ] **17.4** Test `isSupportedLanguage('de')` returns `true`
- [ ] **17.5** Test `isSupportedLanguage('nl')` returns `true`
- [ ] **17.6** Test `isSupportedLanguage('it')` returns `true`
- [ ] **17.7** Test `isSupportedLanguage('invalid')` returns `false`
- [ ] **17.8** Test `isSupportedLanguage('EN')` returns `false` (case-sensitive)
- [ ] **17.9** Test `isSupportedLanguage('zh')` returns `false` (unsupported language)
- [ ] **17.10** Test `isSupportedLanguage('')` returns `false` (empty string)
- [ ] **17.11** Verify TypeScript correctly narrows type when type guard returns true
- [ ] **17.12** Document type validation test results

---

## 18. Verify Integration with Existing Code

**Context:** Ensure cookie utilities integrate smoothly with other Epic 4 components.

**Files to reference:** `src/lib/i18n/guest-language.ts` (REQ-E04-002), `src/hooks/useGuestLanguage.ts` (REQ-E04-014)

**Estimated effort:** 1 story point

- [ ] **18.1** Verify `setGuestLanguageCookie` is exported from guest-language module
- [ ] **18.2** Verify `getGuestLanguageCookie` is exported from guest-language module
- [ ] **18.3** Verify `clearGuestLanguageCookie` is exported from guest-language module
- [ ] **18.4** Verify constants are exported for external use if needed
- [ ] **18.5** Check if `detectGuestLanguage` from REQ-E04-002 uses `getGuestLanguageCookie`
- [ ] **18.6** Verify useGuestLanguage hook (REQ-E04-014) can import these utilities
- [ ] **18.7** Test import statement: `import { setGuestLanguageCookie, getGuestLanguageCookie } from '@/lib/i18n/guest-language';`
- [ ] **18.8** Verify no circular dependencies exist
- [ ] **18.9** Verify exports match what other modules expect
- [ ] **18.10** Document integration verification results

---

## 19. Test Cookie with Shareable Links

**Context:** Verify SameSite=Lax allows cookies on top-level navigation (critical for shareable links).

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Set cookie using `setGuestLanguageCookie('fr')`
- [ ] **19.2** Copy current page URL with language parameter: `?lang=fr`
- [ ] **19.3** Open URL in a new browser tab (simulates clicking shared link)
- [ ] **19.4** Verify cookie is sent with the request (check DevTools Network tab)
- [ ] **19.5** Verify `getGuestLanguageCookie()` returns `'fr'` in new tab
- [ ] **19.6** Test with incognito/private window (no existing cookie)
- [ ] **19.7** Paste URL with `?lang=es` parameter
- [ ] **19.8** Verify page initializes with Spanish from URL parameter
- [ ] **19.9** Verify cookie is set after initialization
- [ ] **19.10** Refresh page and verify cookie persists
- [ ] **19.11** Document shareable link test results

---

## 20. Verify No Cookie Name Collisions

**Context:** Ensure `FAQBNB_GUEST_LANG` cookie doesn't collide with other application cookies.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **20.1** List all cookies used in the application
- [ ] **20.2** Verify `FAQBNB_GUEST_LANG` is unique (no other cookie with same name)
- [ ] **20.3** Verify `FAQBNB_LANG` (authenticated user cookie) is separate
- [ ] **20.4** Test setting both cookies simultaneously
- [ ] **20.5** Verify both cookies coexist without conflict
- [ ] **20.6** Verify `getGuestLanguageCookie()` only reads `FAQBNB_GUEST_LANG`
- [ ] **20.7** Verify authenticated cookie utilities don't affect guest cookie
- [ ] **20.8** Document cookie naming and separation strategy
- [ ] **20.9** Verify cookie prefix `FAQBNB_` clearly indicates application ownership
- [ ] **20.10** Document cookie collision prevention verification

---

## 21. Test Error Handling and Edge Cases

**Context:** Verify functions handle edge cases gracefully without crashing.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Test calling `setGuestLanguageCookie` with valid language codes
- [ ] **21.2** Test calling `getGuestLanguageCookie` when no cookie exists (should return null)
- [ ] **21.3** Test calling `getGuestLanguageCookie` with malformed cookies in browser
- [ ] **21.4** Test calling `clearGuestLanguageCookie` when no cookie exists (should not error)
- [ ] **21.5** Test setting cookie when cookies are disabled in browser
- [ ] **21.6** Verify graceful degradation (function doesn't throw, logs warning)
- [ ] **21.7** Test with very long cookie value (should still work or validate)
- [ ] **21.8** Test with special characters in cookie value (should validate or reject)
- [ ] **21.9** Test calling functions in rapid succession (no race conditions)
- [ ] **21.10** Verify all edge cases are handled without exceptions
- [ ] **21.11** Document error handling test results

---

## 22. Verify Documentation Completeness

**Context:** Ensure all functions are properly documented with JSDoc comments and usage examples.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **22.1** Verify module-level JSDoc comment is comprehensive
- [ ] **22.2** Verify all constants have JSDoc comments explaining purpose
- [ ] **22.3** Verify `setGuestLanguageCookie` has JSDoc with @param and @example
- [ ] **22.4** Verify `getGuestLanguageCookie` has JSDoc with @returns and @example
- [ ] **22.5** Verify `clearGuestLanguageCookie` has JSDoc with @example
- [ ] **22.6** Verify server-side utilities have JSDoc documentation
- [ ] **22.7** Verify security considerations are documented
- [ ] **22.8** Verify distinction from authenticated user cookies is explained
- [ ] **22.9** Verify SameSite=Lax behavior is documented
- [ ] **22.10** Verify usage examples are clear and accurate
- [ ] **22.11** Verify @see references include REQ-E04-015 and REQ-E04-002
- [ ] **22.12** Verify @lastModified date is current (2026-01-22)

---

## 23. ESLint and Code Quality Verification

**Context:** Ensure code passes linting and follows project conventions.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **23.1** Run ESLint: `npm run lint`
- [ ] **23.2** Verify no errors in `src/lib/i18n/guest-language.ts`
- [ ] **23.3** Fix any linting errors found
- [ ] **23.4** Verify consistent use of single vs double quotes (project convention)
- [ ] **23.5** Verify consistent semicolon usage (project convention)
- [ ] **23.6** Verify proper spacing and indentation
- [ ] **23.7** Verify no unused imports
- [ ] **23.8** Verify no console.log statements (only console.warn for warnings)
- [ ] **23.9** Verify function naming follows camelCase convention
- [ ] **23.10** Verify constant naming follows SCREAMING_SNAKE_CASE convention
- [ ] **23.11** Re-run lint after fixes
- [ ] **23.12** Document code quality verification results

---

## 24. Build Verification

**Context:** Ensure the module builds correctly and cookie utilities are included in production bundle.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **24.1** Run build command: `npm run build`
- [ ] **24.2** Verify build completes successfully
- [ ] **24.3** Verify no build errors related to guest-language module
- [ ] **24.4** Verify no build warnings about cookie utilities
- [ ] **24.5** Check build output for guest-language module inclusion
- [ ] **24.6** Verify cookie utilities are properly tree-shaken (dead code eliminated)
- [ ] **24.7** Verify constants are inlined or properly bundled
- [ ] **24.8** Test production build locally
- [ ] **24.9** Verify cookie utilities work in production mode
- [ ] **24.10** Verify Secure flag is properly set in production build
- [ ] **24.11** Document build verification results

---

## 25. Final Integration Testing

**Context:** Perform end-to-end testing of cookie utilities in realistic scenarios.

**Files to modify:** None (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Scenario: New guest visits site (no cookie)
- [ ] **25.2** Verify `getGuestLanguageCookie()` returns null
- [ ] **25.3** Guest selects French language
- [ ] **25.4** Call `setGuestLanguageCookie('fr')`
- [ ] **25.5** Verify cookie is set correctly
- [ ] **25.6** Guest refreshes page
- [ ] **25.7** Verify cookie persists and returns 'fr'
- [ ] **25.8** Guest shares link with `?lang=es` parameter
- [ ] **25.9** Recipient clicks link and cookie is updated to 'es'
- [ ] **25.10** Recipient's preference persists across visits
- [ ] **25.11** Guest clears preferences
- [ ] **25.12** Call `clearGuestLanguageCookie()`
- [ ] **25.13** Verify cookie is removed
- [ ] **25.14** Guest starts fresh with no preference
- [ ] **25.15** Verify all scenarios work as expected
- [ ] **25.16** Document final integration test results

---

## Success Criteria

The task is complete when all of the following are verified:

1. ✅ File `src/lib/i18n/guest-language.ts` contains cookie utility functions
2. ✅ Constants defined: `GUEST_LANGUAGE_COOKIE_NAME`, `GUEST_LANGUAGE_COOKIE_MAX_AGE`, `GUEST_LANGUAGE_COOKIE_PATH`, `GUEST_LANGUAGE_COOKIE_SAMESITE`
3. ✅ Client-side functions implemented: `setGuestLanguageCookie`, `getGuestLanguageCookie`, `clearGuestLanguageCookie`
4. ✅ Type guard function `isSupportedLanguage` validates cookie values
5. ✅ Cookie name is `FAQBNB_GUEST_LANG` (separate from `FAQBNB_LANG`)
6. ✅ Cookie expiration is 1 year (365 days)
7. ✅ Cookie has `Secure` flag in production (HTTPS only)
8. ✅ Cookie uses `SameSite=Lax` attribute
9. ✅ Cookie has `Path=/` attribute
10. ✅ Functions handle SSR context gracefully (check `typeof document !== 'undefined'`)
11. ✅ Functions validate cookie values against `SupportedLanguage` type
12. ✅ Invalid cookie values return null (not errors)
13. ✅ Optional server-side utilities implemented (if needed)
14. ✅ All functions have comprehensive JSDoc documentation
15. ✅ Module-level documentation explains security configuration
16. ✅ TypeScript compilation passes with no errors
17. ✅ ESLint passes with no errors
18. ✅ Build completes successfully
19. ✅ Manual testing confirms cookies work correctly
20. ✅ Cookie persistence verified across page refreshes and sessions
21. ✅ Security attributes verified in development and production
22. ✅ Shareable links work correctly with SameSite=Lax
23. ✅ No cookie name collisions with other application cookies
24. ✅ Integration with REQ-E04-002 and REQ-E04-014 verified
25. ✅ Ready for use by useGuestLanguage hook (REQ-E04-014)

---

## Dependencies

**Depends On (Must Be Completed First):**
- REQ-E04-001: Create Localization Types File (provides SupportedLanguage type)
- REQ-E04-002: Create Guest Language Utility Module (provides base module structure)

**Blocks (Cannot Start Until This Completes):**
- REQ-E04-014: Create useGuestLanguage Hook (requires cookie utilities)

**Parallel Safe:**
- Can be implemented in parallel with REQ-E04-008 through REQ-E04-013 (Guest UI components)
- Components don't directly use cookie utilities

**Relationship with REQ-E04-002:**
- This task may be part of REQ-E04-002 Step 4 (cookie utilities)
- If REQ-E04-002 already created the module, this task adds/enhances cookie functionality
- Coordinate to avoid duplicate implementation

---

## Authorized Files and Functions for Modification

### Files to Create or Modify

1. **`src/lib/i18n/guest-language.ts`**
   - If file exists from REQ-E04-002, add cookie utilities to existing module
   - If file doesn't exist, create new module with cookie utilities
   - New constants:
     - `GUEST_LANGUAGE_COOKIE_NAME`
     - `GUEST_LANGUAGE_COOKIE_MAX_AGE`
     - `GUEST_LANGUAGE_COOKIE_PATH`
     - `GUEST_LANGUAGE_COOKIE_SAMESITE`
   - New functions:
     - `setGuestLanguageCookie(language: SupportedLanguage): void`
     - `getGuestLanguageCookie(): SupportedLanguage | null`
     - `clearGuestLanguageCookie(): void`
     - `isSupportedLanguage(value: string): value is SupportedLanguage` (helper)
   - Optional server-side functions:
     - `setGuestLanguageCookieServer(response: NextResponse, language: SupportedLanguage): void`
     - `getGuestLanguageCookieServer(request: NextRequest): SupportedLanguage | null`

### Files to Reference (Read-Only)

1. **`src/hooks/useLanguagePreference.ts`**
   - Reference: `setLanguageCookie()` (lines 54-60)
   - Reference: `getLanguageFromCookie()` (lines 65-76)
   - Usage: Pattern for client-side cookie utilities

2. **`src/contexts/LocaleContext.tsx`**
   - Reference: Cookie constants and setting pattern (line 150)
   - Usage: Consistent cookie configuration approach

3. **`src/types/l10n.ts`** (from REQ-E04-001)
   - Reference: `SupportedLanguage` type
   - Usage: Type for cookie value validation

### Dependencies

**NPM Packages:**
- `next/server` (already installed) - NextRequest, NextResponse types
- `@/types` (from REQ-E04-001) - SupportedLanguage type

**No new dependencies required** - uses standard browser Cookie API and Next.js APIs

---

## Notes

**Cookie Security Configuration:**

| Attribute | Value | Purpose |
|-----------|-------|---------|
| Name | FAQBNB_GUEST_LANG | Separate from authenticated user cookie |
| MaxAge | 31536000 (1 year) | Long-term preference persistence |
| Path | / | Available across entire site |
| SameSite | Lax | CSRF protection + shareable links |
| Secure | true (production only) | HTTPS transmission in production |
| HttpOnly | false | Allow JavaScript access (needed for client-side) |

**Why SameSite=Lax:**
- ✅ Allows cookie on top-level navigation (shareable links work)
- ✅ Allows GET requests from same site
- ✅ Allows JavaScript reading/writing (document.cookie)
- ❌ Blocks cross-site POST requests (CSRF protection)
- ❌ Blocks cross-site iframe embedding

**Development vs Production:**
- **Development (localhost)**: Secure flag is false (allows HTTP)
- **Production (HTTPS)**: Secure flag is true (HTTPS only)
- Conditional: `const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure' : '';`

**Cookie String Format:**
```
FAQBNB_GUEST_LANG=fr; path=/; expires=Wed, 22 Jan 2027 23:16:00 GMT; SameSite=Lax; Secure
```

**Type Guard Pattern:**
```typescript
function isSupportedLanguage(value: string): value is SupportedLanguage {
  return ['en', 'fr', 'es', 'de', 'nl', 'it'].includes(value as SupportedLanguage);
}
```

**Error Handling:**
- Cookie utilities never throw exceptions
- Return null on failure (getGuestLanguageCookie)
- Log warnings for SSR context or invalid values
- Graceful degradation when cookies are disabled

**Relationship with REQ-E04-002:**
This task focuses specifically on cookie utilities within the guest-language module. If REQ-E04-002 already created the module with detectGuestLanguage and parseAcceptLanguage, this task adds the cookie management functions. Coordinate to avoid duplicate work.

---

**Last Modified:** 2026-01-22 23:16
