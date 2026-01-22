# Create Guest Language Utility Module - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:25
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #2)
- Overview: docs/REQ-E04-002-create-guest-language-utility-module-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Define Guest Cookie Constants

**Context:** This task establishes the cookie configuration for guest language preferences. The guest cookie must be separate from the authenticated user cookie (`FAQBNB_LANG`) to prevent conflicts. The constants follow the same pattern as Epic 1's `LOCALE_COOKIE_NAME` and `LOCALE_COOKIE_MAX_AGE` in `/src/lib/i18n/config.ts`.

**Files to modify:**
- `/src/lib/i18n/guest-language.ts` (create new file)

**Estimated effort:** 1 story point

- [ ] **1.1** Create the file `/src/lib/i18n/guest-language.ts` with module-level JSDoc comment explaining this is for guest-facing language detection (Epic 4 - Guest Experience)
- [ ] **1.2** Add import statement: `import type { SupportedLanguage } from '@/types/l10n';` (from REQ-E04-001)
- [ ] **1.3** Add import statement: `import { NextRequest, NextResponse } from 'next/server';` for server-side types
- [ ] **1.4** Define constant `GUEST_LANG_COOKIE_NAME = 'FAQBNB_GUEST_LANG'` with JSDoc explaining this is separate from authenticated users' `FAQBNB_LANG` cookie
- [ ] **1.5** Define constant `GUEST_LANG_COOKIE_MAX_AGE = 365 * 24 * 60 * 60` (1 year in seconds) with JSDoc noting 1-year expiration for long-term preference persistence
- [ ] **1.6** Add JSDoc comment explaining the distinction: authenticated users use `FAQBNB_LANG` while guests use `FAQBNB_GUEST_LANG`
- [ ] **1.7** Run `npx tsc --noEmit` to verify the file compiles without errors

---

## 2. Create parseAcceptLanguage Function

**Context:** This function parses the RFC 7231 Accept-Language header format to extract language preferences with quality values. The implementation should follow the same pattern as Epic 1's `parseAcceptLanguageHeader()` in `/src/lib/i18n/language-detection.ts` (lines 85-122), but adapted for guest-specific use. The function must handle quality values (q=0.9), regional variants (en-US), and malformed input gracefully.

**Files to modify:**
- `/src/lib/i18n/guest-language.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **2.1** Define interface `LanguageQuality` with fields `locale: string` and `quality: number` for internal parsing
- [ ] **2.2** Create function `parseAcceptLanguage(header: string | null): string[]` with JSDoc explaining it parses RFC 7231 format
- [ ] **2.3** Return empty array `[]` if `header` is null or empty string
- [ ] **2.4** Split header by comma, then for each segment: extract language code and quality value (default q=1.0 if not specified)
- [ ] **2.5** Extract primary language tag: split by `-` and take first part, convert to lowercase (e.g., 'fr-FR' → 'fr', 'en-US' → 'en')
- [ ] **2.6** Parse quality value from `;q=X.X` format, defaulting to 1.0 if not present, and handle invalid quality values by setting to 0
- [ ] **2.7** Filter out wildcard `*`, empty locales, and entries with quality ≤ 0
- [ ] **2.8** Sort languages by quality value descending (highest quality first)
- [ ] **2.9** Remove duplicate language codes while preserving order, returning unique array of language codes
- [ ] **2.10** Add JSDoc `@example` showing: `parseAcceptLanguage('fr-FR, fr;q=0.9, en;q=0.8')` returns `['fr', 'en']`
- [ ] **2.11** Add JSDoc `@example` showing null input returns empty array
- [ ] **2.12** Run `npx tsc --noEmit` to verify function compiles correctly

---

## 3. Create mapToSupportedLanguage Function

**Context:** This function maps browser-specific language codes (including regional variants like 'en-US', 'fr-CA') to the application's supported base languages. It must be case-insensitive and return `null` for unsupported languages (like 'zh', 'ja', 'ar'). The function acts as a type guard to ensure only valid `SupportedLanguage` values are used throughout the application.

**Files to modify:**
- `/src/lib/i18n/guest-language.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **3.1** Import `SUPPORTED_LANGUAGES` constant from `@/types/l10n` to access the list of valid language codes
- [ ] **3.2** Create function `mapToSupportedLanguage(code: string): SupportedLanguage | null` with JSDoc explaining it maps browser codes to supported languages
- [ ] **3.3** Normalize input by converting to lowercase and trimming whitespace
- [ ] **3.4** Check for direct match: if `code` is directly in the supported languages list (e.g., 'en', 'fr', 'es', 'de', 'nl', 'it'), return it as-is
- [ ] **3.5** Handle regional variants: split by `-` or `_`, take the first part (base language), and check if that base is supported
- [ ] **3.6** If base language is supported, return it (e.g., 'en-US' → 'en', 'fr-CA' → 'fr', 'de-DE' → 'de')
- [ ] **3.7** If no match found (unsupported language like 'zh', 'ja', 'ar'), return `null`
- [ ] **3.8** Add type guard logic: validate the result is in `SUPPORTED_LANGUAGES` array before returning as `SupportedLanguage` type
- [ ] **3.9** Add JSDoc `@example` showing direct matches: 'en' → 'en', 'fr' → 'fr'
- [ ] **3.10** Add JSDoc `@example` showing regional variants: 'en-US' → 'en', 'fr-CA' → 'fr'
- [ ] **3.11** Add JSDoc `@example` showing case-insensitivity: 'EN-us' → 'en'
- [ ] **3.12** Add JSDoc `@example` showing unsupported: 'zh-CN' → null
- [ ] **3.13** Run `npx tsc --noEmit` to verify function signature and return type

---

## 4. Create Cookie Utility Functions

**Context:** These functions handle reading, writing, and clearing the guest language cookie in both server-side (Next.js middleware/server components) and client-side (browser) contexts. The cookie configuration should match Epic 1's pattern in `/src/lib/i18n/language-detection.ts` (lines 235-249) with appropriate security flags: `Secure` for HTTPS, `SameSite=Lax` for CSRF protection, `httpOnly: false` to allow client-side access, and `Path=/` for site-wide availability.

**Files to modify:**
- `/src/lib/i18n/guest-language.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **4.1** Create function `getGuestLanguageCookie(request?: NextRequest): SupportedLanguage | null` with JSDoc explaining it reads the guest language cookie
- [ ] **4.2** In `getGuestLanguageCookie`, check if `request` is provided (server context): read from `request.cookies.get(GUEST_LANG_COOKIE_NAME)?.value`
- [ ] **4.3** In `getGuestLanguageCookie`, if no `request` (client context): check `typeof window !== 'undefined'`, parse `document.cookie` to find `GUEST_LANG_COOKIE_NAME`
- [ ] **4.4** In `getGuestLanguageCookie`, validate the cookie value using `mapToSupportedLanguage()` to ensure it's a valid supported language
- [ ] **4.5** In `getGuestLanguageCookie`, return the validated `SupportedLanguage` or `null` if cookie absent/invalid
- [ ] **4.6** Create function `setGuestLanguageCookie(language: SupportedLanguage, response?: NextResponse): void` with JSDoc
- [ ] **4.7** In `setGuestLanguageCookie`, if `response` is provided (server context): set cookie using `response.cookies.set()` with config: `name: GUEST_LANG_COOKIE_NAME`, `value: language`, `maxAge: GUEST_LANG_COOKIE_MAX_AGE`, `path: '/'`, `httpOnly: false`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`
- [ ] **4.8** In `setGuestLanguageCookie`, if no `response` (client context): check `typeof window !== 'undefined'`, set via `document.cookie` string with same config (format: `name=value; Path=/; Max-Age=X; SameSite=Lax; Secure`)
- [ ] **4.9** Create function `clearGuestLanguageCookie(response?: NextResponse): void` with JSDoc explaining it removes the guest language cookie
- [ ] **4.10** In `clearGuestLanguageCookie`, if `response` provided (server context): call `response.cookies.delete(GUEST_LANG_COOKIE_NAME)`
- [ ] **4.11** In `clearGuestLanguageCookie`, if no `response` (client context): set cookie with empty value and `Max-Age=0` to expire immediately
- [ ] **4.12** Add JSDoc `@param` tags explaining when to pass `response` (server) vs omit it (client)
- [ ] **4.13** Add JSDoc note that `httpOnly: false` is intentional to allow client-side language switcher access
- [ ] **4.14** Run `npx tsc --noEmit` to verify all function signatures compile

---

## 5. Create detectGuestLanguage Function (Server-Side)

**Context:** This is the main server-side language detection function for middleware and server components. It implements a priority cascade: URL param (highest) → Cookie → Accept-Language header → Default ('en'). The implementation follows the same pattern as Epic 1's `detectUserLanguage()` in `/src/lib/i18n/language-detection.ts` (lines 176-214), but simplified for guest use (no database lookup). All detection steps should be logged with the `[i18n]` prefix for debugging consistency.

**Files to modify:**
- `/src/lib/i18n/guest-language.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **5.1** Create function `detectGuestLanguage(request: NextRequest, urlParam?: string): SupportedLanguage` with comprehensive JSDoc explaining the priority cascade
- [ ] **5.2** Implement Priority 1: Check `urlParam` parameter first - if provided and valid, map it via `mapToSupportedLanguage()` and return if successful
- [ ] **5.3** If no `urlParam` provided, check URL search params: `request.nextUrl.searchParams.get('lang')` and validate via `mapToSupportedLanguage()`
- [ ] **5.4** If URL parameter yields a valid language, log with `console.log('[i18n] Language detected from URL parameter:', language)` and return
- [ ] **5.5** Implement Priority 2: Call `getGuestLanguageCookie(request)` to check for persisted preference
- [ ] **5.6** If cookie returns a valid language, log with `console.log('[i18n] Language detected from guest cookie:', language)` and return
- [ ] **5.7** Implement Priority 3: Get Accept-Language header via `request.headers.get('Accept-Language')`
- [ ] **5.8** Parse Accept-Language header using `parseAcceptLanguage()` to get array of preferred languages
- [ ] **5.9** Iterate through parsed languages, check each with `mapToSupportedLanguage()`, return first supported match
- [ ] **5.10** If Accept-Language yields a match, log with `console.log('[i18n] Language detected from Accept-Language header:', language)` and return
- [ ] **5.11** Implement Priority 4: Default fallback - return 'en' as the default language
- [ ] **5.12** Log default fallback with `console.log('[i18n] Using default language for guest:', 'en')`
- [ ] **5.13** Add JSDoc `@example` demonstrating middleware usage with NextRequest
- [ ] **5.14** Add JSDoc `@example` demonstrating URL parameter override scenario
- [ ] **5.15** Add JSDoc `@returns` documentation stating this always returns a valid `SupportedLanguage`, never null
- [ ] **5.16** Run `npx tsc --noEmit` to verify function compiles and returns correct type

---

## 6. Create detectGuestLanguageClient Function (Client-Side)

**Context:** This function provides client-side language detection for React hooks and components. It implements a similar priority cascade adapted for the browser environment: URL param → Cookie → navigator.language → Default. The function must handle SSR safety by checking `typeof window !== 'undefined'` before accessing browser APIs. It enables client-side language switching without server round-trips.

**Files to modify:**
- `/src/lib/i18n/guest-language.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **6.1** Create function `detectGuestLanguageClient(urlParam?: string): SupportedLanguage` with JSDoc noting this is for client-side use only
- [ ] **6.2** Add SSR safety check: `if (typeof window === 'undefined') return 'en';` at the start of the function
- [ ] **6.3** Implement Priority 1: If `urlParam` provided, validate with `mapToSupportedLanguage()` and return if valid
- [ ] **6.4** If no `urlParam`, parse `window.location.search` using `URLSearchParams` to check for `?lang=` parameter
- [ ] **6.5** Validate URL parameter with `mapToSupportedLanguage()` and return if valid
- [ ] **6.6** Implement Priority 2: Call `getGuestLanguageCookie()` (without request parameter, triggers client mode)
- [ ] **6.7** If cookie returns a valid language, return it
- [ ] **6.8** Implement Priority 3: Check `navigator.language` as primary browser preference
- [ ] **6.9** Check `navigator.languages` array (if available) as fallback to `navigator.language`
- [ ] **6.10** Map browser language code(s) via `mapToSupportedLanguage()`, return first supported match
- [ ] **6.11** Implement Priority 4: Return 'en' as default if no preferences found
- [ ] **6.12** Add JSDoc note: "This function is safe to call during SSR but will return default 'en'. Use server-side detection in SSR contexts."
- [ ] **6.13** Add JSDoc `@example` showing usage in a React hook: `const [language, setLanguage] = useState(() => detectGuestLanguageClient());`
- [ ] **6.14** Run `npx tsc --noEmit` to verify SSR safety and return type

---

## 7. Add Comprehensive JSDoc and Type Documentation

**Context:** Comprehensive documentation ensures developers understand how to use the module correctly and provides IntelliSense support in IDEs. Each function should have complete JSDoc with description, parameters, return types, examples, and notes about Epic 4 context. The module-level documentation should explain the relationship to Epic 1's authenticated user language detection and why a separate guest module is needed.

**Files to modify:**
- `/src/lib/i18n/guest-language.ts` (enhance documentation throughout)

**Estimated effort:** 1 story point

- [ ] **7.1** Enhance module-level JSDoc at top of file with detailed description: "Guest Language Detection Utility for Epic 4 - Guest Experience. Handles language detection for unauthenticated users viewing shared items."
- [ ] **7.2** Add module-level note explaining distinction: "Authenticated users use `/src/lib/i18n/language-detection.ts` and `FAQBNB_LANG` cookie. Guests use this module and `FAQBNB_GUEST_LANG` cookie to avoid conflicts."
- [ ] **7.3** Add `@module lib/i18n/guest-language` tag to module documentation
- [ ] **7.4** Add `@since Epic 4 - Guest Experience` tag to module documentation
- [ ] **7.5** Review each constant (`GUEST_LANG_COOKIE_NAME`, `GUEST_LANG_COOKIE_MAX_AGE`) and ensure JSDoc explains purpose and configuration rationale
- [ ] **7.6** Review `parseAcceptLanguage()` JSDoc: ensure `@description`, `@param`, `@returns`, and `@example` tags are complete and accurate
- [ ] **7.7** Review `mapToSupportedLanguage()` JSDoc: document all mapping cases (direct, regional variants, unsupported) with examples
- [ ] **7.8** Review cookie utility functions JSDoc: document server vs client context usage clearly with `@param` and notes
- [ ] **7.9** Review `detectGuestLanguage()` JSDoc: document complete priority cascade, all parameters, return guarantees, and provide usage examples
- [ ] **7.10** Review `detectGuestLanguageClient()` JSDoc: emphasize client-side usage, SSR safety, and when to use vs server version
- [ ] **7.11** Add `@see` cross-reference in module doc: "For authenticated user language detection, see `/src/lib/i18n/language-detection.ts`"
- [ ] **7.12** Add edge case documentation: note that malformed headers, blocked cookies, and unsupported languages all fail gracefully to default 'en'
- [ ] **7.13** Run `npx tsc --noEmit` to ensure documentation doesn't break type checking

---

## 8. Create Export Barrel and Integration

**Context:** Following the pattern in Epic 1, the i18n module uses a barrel export file (`/src/lib/i18n/index.ts`) to provide clean import paths. Guest language utilities should be exported alongside existing Epic 1 utilities for consistency. Verify no circular dependencies are introduced between the new guest-language module and existing modules (config, language-detection, etc.).

**Files to modify:**
- `/src/lib/i18n/index.ts` (add export statement)

**Estimated effort:** 1 story point

- [ ] **8.1** Open `/src/lib/i18n/index.ts` and add `export * from './guest-language';` at an appropriate location (suggest after existing language-detection export)
- [ ] **8.2** Add a comment above the export: `// Guest language detection utilities (Epic 4 - Guest Experience)`
- [ ] **8.3** Verify the file structure: ensure exports are grouped logically (config first, then detection utilities, then guest utilities, etc.)
- [ ] **8.4** Run `npx tsc --noEmit` to check for circular dependency errors or import conflicts
- [ ] **8.5** Create a temporary test file to verify imports work: `import { detectGuestLanguage, GUEST_LANG_COOKIE_NAME } from '@/lib/i18n';`
- [ ] **8.6** Verify the test import compiles successfully by running `npx tsc --noEmit`
- [ ] **8.7** Check that existing Epic 1 exports still work: `import { detectUserLanguage, LOCALE_COOKIE_NAME } from '@/lib/i18n';`
- [ ] **8.8** Delete the temporary test file after verification
- [ ] **8.9** Run full TypeScript build to ensure no module resolution issues: `npx tsc --noEmit`

---

## Verification Checklist

After completing all tasks, verify the following acceptance criteria:

- [ ] File `/src/lib/i18n/guest-language.ts` exists with all required functions
- [ ] Constants `GUEST_LANG_COOKIE_NAME` and `GUEST_LANG_COOKIE_MAX_AGE` are defined and documented
- [ ] `parseAcceptLanguage(header)` correctly parses RFC 7231 format with quality values
- [ ] `mapToSupportedLanguage(code)` maps browser codes (en-US, fr-CA, etc.) to base supported languages
- [ ] `mapToSupportedLanguage()` returns `null` for unsupported languages (zh, ja, ar, etc.)
- [ ] `getGuestLanguageCookie()` works in both server context (with NextRequest) and client context (browser)
- [ ] `setGuestLanguageCookie()` works in both server context (with NextResponse) and client context (browser)
- [ ] Cookie configuration includes: `Secure`, `SameSite=Lax`, `httpOnly: false`, `Path=/`, `MaxAge: 1 year`
- [ ] `clearGuestLanguageCookie()` properly removes the cookie in both contexts
- [ ] `detectGuestLanguage(request, urlParam?)` implements priority: URL > Cookie > Accept-Language > Default
- [ ] `detectGuestLanguage()` logs detection source with `[i18n]` prefix for debugging
- [ ] `detectGuestLanguageClient(urlParam?)` implements client-side priority cascade
- [ ] `detectGuestLanguageClient()` is SSR-safe with `typeof window !== 'undefined'` check
- [ ] All functions are properly typed using `SupportedLanguage` type from `/src/types/l10n.ts`
- [ ] All functions have comprehensive JSDoc with description, parameters, returns, and examples
- [ ] Module exports through `/src/lib/i18n/index.ts` barrel file
- [ ] Functions can be imported via `@/lib/i18n` path
- [ ] `npx tsc --noEmit` runs without errors
- [ ] `npm run build` completes successfully
- [ ] No circular dependency issues introduced

---

## Notes for Implementation Agent

**Pattern Consistency:**
This module should follow the exact same patterns as Epic 1's `/src/lib/i18n/language-detection.ts`. Reference that file (lines 85-249) for Accept-Language parsing, cookie handling, and logging patterns. The main difference is that guest detection has no database lookup (Priority 1 in authenticated users).

**Cookie Separation:**
The separate cookie names (`FAQBNB_LANG` vs `FAQBNB_GUEST_LANG`) are intentional to prevent conflicts. When a guest later authenticates, their guest cookie should not interfere with their account preference.

**Type Safety:**
All functions that return language codes must return `SupportedLanguage`, never plain `string`. Use `mapToSupportedLanguage()` as a type guard to validate inputs before returning typed values.

**SSR Safety:**
The client-side function must check `typeof window !== 'undefined'` before accessing browser APIs. During SSR, it should return the default 'en' value rather than throwing errors.

**Logging Pattern:**
Follow Epic 1's logging convention: all language detection logs use the `[i18n]` prefix for easy filtering and debugging.

**Testing Strategy:**
While unit tests are not required in this task (they will be created in REQ-E04-022), ensure the implementation is testable by:
1. Keeping functions pure (no hidden state)
2. Making external dependencies (cookies, headers) injectable via parameters
3. Handling all edge cases gracefully (return default, don't throw)

**Epic 1 Dependencies:**
This module imports `SupportedLanguage` from `/src/types/l10n.ts` (REQ-E04-001). If REQ-E04-001 is not complete, you may need to temporarily use Epic 1's `SupportedLocale` type from `/src/lib/i18n/config.ts` as a placeholder, but this is NOT recommended - wait for REQ-E04-001 completion.

---

*Document generated: 2026-01-22 22:25*
*Epic: 4 - Guest Experience*
*Task: Phase 1, Task 1.2 - Create guest language utility module*
