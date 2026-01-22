# Create useGuestLanguage Hook - Detailed Implementation Tasks

**Generated:** 2026-01-22 23:12
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #14 - REQ-E04-014)
- Overview: docs/REQ-E04-014-create-useguestlanguage-hook-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

**Last Modified:** 2026-01-22 23:12

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

Create a custom React hook (`useGuestLanguage`) for managing guest user language state on the client side. This hook handles language preference persistence via cookies, supports toggling between translated and original content, and synchronizes with URL parameters for shareable links.

**Key Features:**
- Manages `currentLanguage` and `showOriginal` state
- Persists guest language preference to cookie (FAQBNB_GUEST_LANG)
- Handles language changes with cookie and URL updates
- Toggle between translation and original content (client-side)
- Syncs with URL parameter `?lang=` for shareable links
- Initializes from: URL param > Cookie > Accept-Language header > default
- Separate from authenticated user language management (useLanguagePreference)

**Size:** M (4-6 hours estimated effort)

---

## 1. Review Dependencies and Reference Files

**Context:** Before creating the hook, understand the existing patterns and dependencies that this hook will use or integrate with.

**Files to reference:** useLanguagePreference.ts (pattern reference), guest-language.ts utilities (REQ-E04-002), l10n.ts types (REQ-E04-001)

**Estimated effort:** 1 story point

- [ ] **1.1** Read `src/hooks/useLanguagePreference.ts` to understand the authenticated user language hook pattern
- [ ] **1.2** Note the state management approach (useState, useEffect, useCallback)
- [ ] **1.3** Note the cookie utilities pattern (setLanguageCookie, getLanguageFromCookie)
- [ ] **1.4** Identify key differences needed for guest hook (no database, URL sync, toggle original)
- [ ] **1.5** Read `src/lib/i18n/guest-language.ts` to verify available utilities (detectGuestLanguage, setGuestLanguageCookie)
- [ ] **1.6** Read `src/types/l10n.ts` to verify SupportedLanguage type is available
- [ ] **1.7** Check Next.js navigation hooks are available (useSearchParams, useRouter, usePathname)
- [ ] **1.8** Document the integration pattern for the new hook

---

## 2. Create Hook File Structure

**Context:** Create the new hook file with proper TypeScript structure, 'use client' directive, and organized sections.

**Files to modify:** Create `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **2.1** Create new file: `src/hooks/useGuestLanguage.ts`
- [ ] **2.2** Add 'use client' directive at the top (required for React hooks in Next.js 15)
- [ ] **2.3** Add file header comment with module description, Epic 4 context, and lastModified date (2026-01-22)
- [ ] **2.4** Add comprehensive JSDoc comment explaining hook purpose, features, and usage example
- [ ] **2.5** Import React hooks: `useState`, `useEffect`, `useCallback` from 'react'
- [ ] **2.6** Import Next.js navigation hooks: `useSearchParams`, `useRouter`, `usePathname` from 'next/navigation'
- [ ] **2.7** Import `SupportedLanguage` type from '@/types'
- [ ] **2.8** Import guest language utilities: `detectGuestLanguage`, `setGuestLanguageCookie`, `GUEST_LANGUAGE_COOKIE_NAME` from '@/lib/i18n/guest-language'
- [ ] **2.9** Verify all imports resolve correctly (no TypeScript errors)

---

## 3. Define Constants and Types

**Context:** Define hook constants and TypeScript interfaces for the hook return value.

**Files to modify:** `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Add constants section divider comment: `// =============================================================================`
- [ ] **3.2** Define `DEFAULT_LANGUAGE` constant: `const DEFAULT_LANGUAGE: SupportedLanguage = 'en';`
- [ ] **3.3** Define `LANG_URL_PARAM` constant: `const LANG_URL_PARAM = 'lang';`
- [ ] **3.4** Add Hook Return Interface section divider comment
- [ ] **3.5** Define `UseGuestLanguageReturn` interface with proper JSDoc comments for each property
- [ ] **3.6** Interface property: `currentLanguage: SupportedLanguage` - Current selected language for display
- [ ] **3.7** Interface property: `showOriginal: boolean` - Whether currently viewing original content (not translation)
- [ ] **3.8** Interface property: `setLanguage: (language: SupportedLanguage) => void` - Update the language preference
- [ ] **3.9** Interface property: `toggleOriginal: () => void` - Toggle between viewing translation and original content
- [ ] **3.10** Interface property: `isLoading: boolean` - Loading state during initial language detection
- [ ] **3.11** Interface property: `availableLanguages?: SupportedLanguage[]` - Available languages for this content (set by parent)
- [ ] **3.12** Interface property: `setAvailableLanguages: (languages: SupportedLanguage[]) => void` - Set available languages
- [ ] **3.13** Export the `UseGuestLanguageReturn` interface with `export interface`
- [ ] **3.14** Verify TypeScript validates all type definitions correctly

---

## 4. Create Main Hook Function Signature

**Context:** Define the main hook function with proper JSDoc documentation explaining the priority cascade.

**Files to modify:** `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Add Main Hook section divider comment
- [ ] **4.2** Add comprehensive JSDoc comment explaining the hook's purpose
- [ ] **4.3** Document priority cascade in JSDoc: 1. URL parameter, 2. Cookie, 3. Accept-Language header, 4. Default
- [ ] **4.4** Document that language changes update both cookie and URL for shareability
- [ ] **4.5** Define function signature: `export function useGuestLanguage(): UseGuestLanguageReturn {`
- [ ] **4.6** Extract Next.js navigation hooks: `const searchParams = useSearchParams();`
- [ ] **4.7** Extract Next.js navigation hooks: `const router = useRouter();`
- [ ] **4.8** Extract Next.js navigation hooks: `const pathname = usePathname();`
- [ ] **4.9** Verify function structure is correct

---

## 5. Initialize Hook State

**Context:** Set up all state variables needed for the hook using React useState.

**Files to modify:** `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Add State section divider comment
- [ ] **5.2** Initialize `currentLanguage` state: `const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);`
- [ ] **5.3** Initialize `showOriginal` state: `const [showOriginal, setShowOriginal] = useState(false);`
- [ ] **5.4** Initialize `isLoading` state: `const [isLoading, setIsLoading] = useState(true);`
- [ ] **5.5** Initialize `availableLanguages` state: `const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[] | undefined>(undefined);`
- [ ] **5.6** Verify all state declarations use correct TypeScript types
- [ ] **5.7** Verify default values are appropriate (DEFAULT_LANGUAGE, false, true, undefined)

---

## 6. Implement Language Initialization Effect

**Context:** Create useEffect to initialize language on mount from URL parameter, cookie, or default.

**Files to modify:** `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Add Initialize Language on Mount section divider comment
- [ ] **6.2** Create `useEffect` hook with dependency on `searchParams`
- [ ] **6.3** Define inner `initializeLanguage` function inside useEffect
- [ ] **6.4** Set `isLoading` to `true` at start of initialization
- [ ] **6.5** Wrap initialization logic in try-catch block for error handling
- [ ] **6.6** Priority 1: Extract URL parameter using `searchParams?.get(LANG_URL_PARAM)`
- [ ] **6.7** If URL parameter exists, call `detectGuestLanguage(urlLang)` with the parameter
- [ ] **6.8** Set detected language from URL to state: `setCurrentLanguage(detectedLang)`
- [ ] **6.9** Ensure cookie matches URL parameter: `setGuestLanguageCookie(detectedLang)`
- [ ] **6.10** Priority 2-4: If no URL parameter, call `detectGuestLanguage()` without parameter (uses cookie > Accept-Language > default)
- [ ] **6.11** Set detected language to state
- [ ] **6.12** In catch block, log error with `console.error('[useGuestLanguage] Initialization error:', error)`
- [ ] **6.13** In catch block, fall back to DEFAULT_LANGUAGE: `setCurrentLanguage(DEFAULT_LANGUAGE)`
- [ ] **6.14** In finally block, set `isLoading` to `false`
- [ ] **6.15** Call `initializeLanguage()` inside the useEffect
- [ ] **6.16** Verify useEffect dependency array includes `[searchParams]`

---

## 7. Implement setLanguage Function

**Context:** Create the function to update language preference, updating both cookie and URL parameter.

**Files to modify:** `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Add Set Language Function section divider comment
- [ ] **7.2** Add JSDoc comment explaining the function updates both cookie and URL for shareability
- [ ] **7.3** Define `setLanguage` using `useCallback`: `const setLanguage = useCallback((newLanguage: SupportedLanguage) => {`
- [ ] **7.4** Update state: `setCurrentLanguage(newLanguage);`
- [ ] **7.5** Reset showOriginal when changing languages: `setShowOriginal(false);`
- [ ] **7.6** Update cookie: `setGuestLanguageCookie(newLanguage);`
- [ ] **7.7** Check if pathname exists before updating URL
- [ ] **7.8** Create URLSearchParams instance: `const params = new URLSearchParams(searchParams?.toString() || '');`
- [ ] **7.9** Set language parameter: `params.set(LANG_URL_PARAM, newLanguage);`
- [ ] **7.10** Update URL without navigation: `router.replace(\`\${pathname}?\${params.toString()}\`, { scroll: false });`
- [ ] **7.11** Add console log: `console.log('[useGuestLanguage] Language changed to:', newLanguage);`
- [ ] **7.12** Close useCallback with dependency array: `}, [pathname, searchParams, router]);`
- [ ] **7.13** Verify function signature matches UseGuestLanguageReturn interface

---

## 8. Implement toggleOriginal Function

**Context:** Create the function to toggle between translated content and original content (client-side toggle).

**Files to modify:** `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** Add Toggle Original Function section divider comment
- [ ] **8.2** Add JSDoc comment explaining this is a client-side toggle that doesn't refetch data
- [ ] **8.3** Define `toggleOriginal` using `useCallback`: `const toggleOriginal = useCallback(() => {`
- [ ] **8.4** Use functional state update: `setShowOriginal(prev => {`
- [ ] **8.5** Calculate new value: `const newValue = !prev;`
- [ ] **8.6** Add console log: `console.log('[useGuestLanguage] Toggle original:', newValue);`
- [ ] **8.7** Return new value: `return newValue;`
- [ ] **8.8** Close setShowOriginal functional update: `});`
- [ ] **8.9** Close useCallback with empty dependency array: `}, []);`
- [ ] **8.10** Verify function signature matches UseGuestLanguageReturn interface

---

## 9. Implement Hook Return Value

**Context:** Return all state and functions from the hook in the correct interface format.

**Files to modify:** `src/hooks/useGuestLanguage.ts`

**Estimated effort:** 1 story point

- [ ] **9.1** Add Return Hook Value section divider comment
- [ ] **9.2** Create return object with all required properties
- [ ] **9.3** Return `currentLanguage` state
- [ ] **9.4** Return `showOriginal` state
- [ ] **9.5** Return `setLanguage` function
- [ ] **9.6** Return `toggleOriginal` function
- [ ] **9.7** Return `isLoading` state
- [ ] **9.8** Return `availableLanguages` state
- [ ] **9.9** Return `setAvailableLanguages` function
- [ ] **9.10** Verify return object structure matches `UseGuestLanguageReturn` interface exactly
- [ ] **9.11** Add default export: `export default useGuestLanguage;`
- [ ] **9.12** Verify no TypeScript errors in the complete hook file

---

## 10. Update Hooks Barrel Export

**Context:** Add exports for the new hook to the central hooks barrel file for convenient imports.

**Files to modify:** `src/hooks/index.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Read existing `src/hooks/index.ts` to understand current structure
- [ ] **10.2** Locate the "Localization Hooks" section (after useCommonTranslations and useLanguagePreference exports)
- [ ] **10.3** Add empty line for spacing before new exports
- [ ] **10.4** Add comment: `// Epic 4: Guest Experience Hooks`
- [ ] **10.5** Add hook export: `export { useGuestLanguage } from './useGuestLanguage';`
- [ ] **10.6** Add type export: `export type { UseGuestLanguageReturn } from './useGuestLanguage';`
- [ ] **10.7** Verify exports are in the correct section (Localization Hooks)
- [ ] **10.8** Verify formatting is consistent with other exports in the file
- [ ] **10.9** Run TypeScript compiler to verify exports resolve correctly
- [ ] **10.10** Test import in a sample file: `import { useGuestLanguage } from '@/hooks';`

---

## 11. Verify Integration with Guest Language Utilities

**Context:** Ensure the hook correctly integrates with utilities from REQ-E04-002.

**Files to reference:** `src/lib/i18n/guest-language.ts` (read-only verification)

**Estimated effort:** 1 story point

- [ ] **11.1** Verify `detectGuestLanguage()` function exists in `src/lib/i18n/guest-language.ts`
- [ ] **11.2** Verify `detectGuestLanguage()` accepts optional parameter (for URL override)
- [ ] **11.3** Verify `detectGuestLanguage()` returns `SupportedLanguage` type
- [ ] **11.4** Verify `setGuestLanguageCookie()` function exists
- [ ] **11.5** Verify `setGuestLanguageCookie()` accepts `SupportedLanguage` parameter
- [ ] **11.6** Verify `GUEST_LANGUAGE_COOKIE_NAME` constant is exported
- [ ] **11.7** Verify hook imports match the actual exports from guest-language module
- [ ] **11.8** Test that hook initialization calls detectGuestLanguage correctly
- [ ] **11.9** Test that setLanguage calls setGuestLanguageCookie correctly
- [ ] **11.10** Verify no TypeScript errors related to utility function calls

---

## 12. Verify URL Parameter Synchronization

**Context:** Test that URL parameter updates work correctly without causing navigation.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **12.1** Verify `useSearchParams` is imported from 'next/navigation'
- [ ] **12.2** Verify `useRouter` is imported from 'next/navigation'
- [ ] **12.3** Verify `usePathname` is imported from 'next/navigation'
- [ ] **12.4** Verify URL parameter is read correctly: `searchParams?.get(LANG_URL_PARAM)`
- [ ] **12.5** Verify URLSearchParams is used to preserve other parameters: `new URLSearchParams(searchParams?.toString() || '')`
- [ ] **12.6** Verify `params.set(LANG_URL_PARAM, newLanguage)` is called correctly
- [ ] **12.7** Verify `router.replace()` is used (not `router.push()`) to avoid history entry
- [ ] **12.8** Verify `{ scroll: false }` option is passed to router.replace
- [ ] **12.9** Verify pathname is checked for existence before updating URL
- [ ] **12.10** Test that changing language updates URL parameter (manual browser test if needed)

---

## 13. Verify State Management Logic

**Context:** Ensure the two-state system (currentLanguage + showOriginal) works correctly.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **13.1** Verify `currentLanguage` state is initialized to DEFAULT_LANGUAGE
- [ ] **13.2** Verify `showOriginal` state is initialized to `false`
- [ ] **13.3** Verify `setLanguage` updates `currentLanguage` correctly
- [ ] **13.4** Verify `setLanguage` resets `showOriginal` to `false` (important for UX)
- [ ] **13.5** Verify `toggleOriginal` uses functional state update: `setShowOriginal(prev => !prev)`
- [ ] **13.6** Verify `toggleOriginal` does NOT change `currentLanguage`
- [ ] **13.7** Verify state changes are properly logged for debugging
- [ ] **13.8** Document the state interaction pattern in code comments if not already clear
- [ ] **13.9** Verify isLoading is set to true during initialization
- [ ] **13.10** Verify isLoading is set to false after initialization completes (in finally block)

---

## 14. Verify TypeScript Type Safety

**Context:** Ensure all types are correct and the hook is fully type-safe.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **14.1** Run TypeScript compiler: `npx tsc --noEmit`
- [ ] **14.2** Verify no errors related to `src/hooks/useGuestLanguage.ts`
- [ ] **14.3** Verify `UseGuestLanguageReturn` interface is properly exported
- [ ] **14.4** Verify hook function return type matches interface
- [ ] **14.5** Verify `SupportedLanguage` type is correctly imported from '@/types'
- [ ] **14.6** Verify `setLanguage` parameter type is `SupportedLanguage`
- [ ] **14.7** Verify `availableLanguages` state type is `SupportedLanguage[] | undefined`
- [ ] **14.8** Verify `setAvailableLanguages` parameter type is `SupportedLanguage[]`
- [ ] **14.9** Verify all useState hooks have correct generic types
- [ ] **14.10** Verify useCallback dependency arrays are correctly typed
- [ ] **14.11** Fix any TypeScript errors found
- [ ] **14.12** Re-run type check until all errors are resolved

---

## 15. Test Hook Initialization

**Context:** Verify the hook initializes correctly with different scenarios.

**Files to modify:** None (manual testing or create test file later)

**Estimated effort:** 1 story point

- [ ] **15.1** Test Scenario 1: Initialize with no URL parameter, no cookie (should use default 'en')
- [ ] **15.2** Test Scenario 2: Initialize with URL parameter `?lang=fr` (should use 'fr')
- [ ] **15.3** Test Scenario 3: Initialize with cookie set to 'es' (no URL param, should use 'es')
- [ ] **15.4** Test Scenario 4: Initialize with both URL param 'de' and cookie 'fr' (URL param should win, use 'de')
- [ ] **15.5** Test Scenario 5: Initialize with invalid URL parameter `?lang=invalid` (should fall back to cookie or default)
- [ ] **15.6** Verify `isLoading` is `true` initially
- [ ] **15.7** Verify `isLoading` becomes `false` after initialization completes
- [ ] **15.8** Verify `showOriginal` is initialized to `false`
- [ ] **15.9** Verify `availableLanguages` is initialized to `undefined`
- [ ] **15.10** Document test results and any issues found

---

## 16. Test setLanguage Function

**Context:** Verify the setLanguage function works correctly and updates all necessary state.

**Files to modify:** None (manual testing or create test file later)

**Estimated effort:** 1 story point

- [ ] **16.1** Test calling `setLanguage('fr')` updates `currentLanguage` to 'fr'
- [ ] **16.2** Test `setLanguage` resets `showOriginal` to `false`
- [ ] **16.3** Test `setLanguage` updates the cookie (check browser cookies)
- [ ] **16.4** Test `setLanguage` updates URL parameter to `?lang=fr`
- [ ] **16.5** Test `setLanguage` preserves other URL parameters (if any exist)
- [ ] **16.6** Test `setLanguage` does not cause page navigation (no scroll to top)
- [ ] **16.7** Test calling `setLanguage` multiple times in succession
- [ ] **16.8** Test `setLanguage` with all 6 supported languages (en, fr, es, de, nl, it)
- [ ] **16.9** Verify console log appears with correct language value
- [ ] **16.10** Document test results and any issues found

---

## 17. Test toggleOriginal Function

**Context:** Verify the toggleOriginal function works correctly for client-side content switching.

**Files to modify:** None (manual testing or create test file later)

**Estimated effort:** 1 story point

- [ ] **17.1** Test calling `toggleOriginal()` changes `showOriginal` from `false` to `true`
- [ ] **17.2** Test calling `toggleOriginal()` again changes `showOriginal` from `true` to `false`
- [ ] **17.3** Test `toggleOriginal` does NOT change `currentLanguage`
- [ ] **17.4** Test `toggleOriginal` does NOT update the URL parameter
- [ ] **17.5** Test `toggleOriginal` does NOT update the cookie
- [ ] **17.6** Test toggle state is reset when calling `setLanguage` (showOriginal becomes false)
- [ ] **17.7** Test toggling multiple times in succession
- [ ] **17.8** Verify console log appears with correct boolean value
- [ ] **17.9** Verify `toggleOriginal` is stable (doesn't cause re-renders of parent)
- [ ] **17.10** Document test results and any issues found

---

## 18. Test setAvailableLanguages Function

**Context:** Verify the setAvailableLanguages function updates state correctly.

**Files to modify:** None (manual testing or create test file later)

**Estimated effort:** 1 story point

- [ ] **18.1** Test calling `setAvailableLanguages(['en', 'fr', 'es'])` updates state correctly
- [ ] **18.2** Test `availableLanguages` is initially `undefined`
- [ ] **18.3** Test calling `setAvailableLanguages` with empty array `[]`
- [ ] **18.4** Test calling `setAvailableLanguages` with single language `['en']`
- [ ] **18.5** Test calling `setAvailableLanguages` with all 6 languages
- [ ] **18.6** Test calling `setAvailableLanguages` multiple times (should replace, not append)
- [ ] **18.7** Verify state update doesn't cause infinite render loops
- [ ] **18.8** Verify parent component can successfully pass available languages to hook
- [ ] **18.9** Document typical usage pattern for parent components
- [ ] **18.10** Document test results and any issues found

---

## 19. Test SSR/Hydration Compatibility

**Context:** Ensure the hook works correctly with Next.js server-side rendering and hydration.

**Files to modify:** None (verification and testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Verify hook uses 'use client' directive (required for client-side hooks)
- [ ] **19.2** Verify hook doesn't access `window` or `document` during initial render
- [ ] **19.3** Verify state initialization uses safe defaults (no client-only values)
- [ ] **19.4** Verify useEffect runs only on client (not during SSR)
- [ ] **19.5** Test hook in a server component context (should error - expected)
- [ ] **19.6** Test hook in a client component (should work correctly)
- [ ] **19.7** Check browser console for hydration mismatch warnings
- [ ] **19.8** Verify no "Text content did not match" errors appear
- [ ] **19.9** Verify hook initializes correctly after page hydration
- [ ] **19.10** Document any SSR considerations for developers using this hook

---

## 20. Verify Error Handling

**Context:** Ensure the hook handles errors gracefully without crashing.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **20.1** Verify initialization is wrapped in try-catch block
- [ ] **20.2** Verify errors are logged to console with `[useGuestLanguage]` prefix
- [ ] **20.3** Verify hook falls back to DEFAULT_LANGUAGE on error
- [ ] **20.4** Verify `isLoading` is set to `false` even if initialization fails (finally block)
- [ ] **20.5** Test with unavailable detectGuestLanguage function (mock error)
- [ ] **20.6** Test with unavailable setGuestLanguageCookie function (mock error)
- [ ] **20.7** Test with invalid searchParams (null or undefined)
- [ ] **20.8** Test with invalid pathname (null or undefined)
- [ ] **20.9** Verify hook doesn't crash parent component on error
- [ ] **20.10** Document error handling behavior for developers

---

## 21. Create Usage Documentation

**Context:** Document how developers should use this hook in their components.

**Files to modify:** Consider adding usage examples to hook JSDoc or separate documentation

**Estimated effort:** 1 story point

- [ ] **21.1** Document basic usage example in hook JSDoc (already included in overview template)
- [ ] **21.2** Document how parent component should handle `availableLanguages`
- [ ] **21.3** Document how parent component should refetch content when `currentLanguage` changes
- [ ] **21.4** Document how parent component should switch content when `showOriginal` changes
- [ ] **21.5** Document the two-state system rationale (currentLanguage + showOriginal)
- [ ] **21.6** Document priority cascade: URL param > Cookie > Accept-Language > default
- [ ] **21.7** Document that setLanguage resets showOriginal (important UX behavior)
- [ ] **21.8** Document integration with GuestLanguageSwitcher component
- [ ] **21.9** Document integration with TranslationBanner and MissingTranslationBanner components
- [ ] **21.10** Document integration with ViewOriginalToggle component
- [ ] **21.11** Provide example of complete parent component using all hook features
- [ ] **21.12** Document common pitfalls and how to avoid them

---

## 22. Verify Integration Points

**Context:** Ensure the hook is ready to integrate with other Epic 4 components.

**Files to reference:** Guest UI components (REQ-E04-008 through REQ-E04-012) and ItemDisplay (REQ-E04-017)

**Estimated effort:** 1 story point

- [ ] **22.1** Verify hook exports `currentLanguage` for GuestLanguageSwitcher component
- [ ] **22.2** Verify hook exports `setLanguage` for GuestLanguageSwitcher onLanguageChange
- [ ] **22.3** Verify hook exports `availableLanguages` for GuestLanguageSwitcher filtering
- [ ] **22.4** Verify hook exports `showOriginal` for TranslationBanner visibility logic
- [ ] **22.5** Verify hook exports `toggleOriginal` for TranslationBanner and ViewOriginalToggle
- [ ] **22.6** Verify hook exports `isLoading` for loading state display
- [ ] **22.7** Verify hook exports `setAvailableLanguages` for parent to set after data fetch
- [ ] **22.8** Document expected integration pattern for ItemDisplay component (REQ-E04-017)
- [ ] **22.9** Verify hook API matches what guest UI components expect to receive
- [ ] **22.10** Document any API mismatches and plan for resolution

---

## 23. Performance Verification

**Context:** Ensure the hook doesn't cause unnecessary re-renders or performance issues.

**Files to modify:** None (verification and optimization)

**Estimated effort:** 1 story point

- [ ] **23.1** Verify `setLanguage` uses `useCallback` with correct dependencies
- [ ] **23.2** Verify `toggleOriginal` uses `useCallback` with correct dependencies
- [ ] **23.3** Verify state updates don't cause infinite loops
- [ ] **23.4** Verify useEffect only runs when searchParams changes (not on every render)
- [ ] **23.5** Test hook with React DevTools Profiler to measure render performance
- [ ] **23.6** Verify parent component doesn't re-render unnecessarily when using hook
- [ ] **23.7** Verify URL updates with `router.replace` don't cause full page reloads
- [ ] **23.8** Test performance with rapid language changes (e.g., clicking switcher multiple times)
- [ ] **23.9** Verify cookie operations are fast (synchronous, not async)
- [ ] **23.10** Document any performance considerations for developers

---

## 24. Build and Lint Verification

**Context:** Ensure the hook passes all build and lint checks.

**Files to modify:** None (verification only)

**Estimated effort:** 1 story point

- [ ] **24.1** Run TypeScript compiler: `npx tsc --noEmit`
- [ ] **24.2** Verify no TypeScript errors in useGuestLanguage.ts
- [ ] **24.3** Verify no TypeScript errors in hooks/index.ts (barrel export)
- [ ] **24.4** Run linter: `npm run lint`
- [ ] **24.5** Verify no ESLint errors in useGuestLanguage.ts
- [ ] **24.6** Fix any lint warnings (unused imports, console.log, etc.)
- [ ] **24.7** Run build: `npm run build`
- [ ] **24.8** Verify build completes successfully
- [ ] **24.9** Verify hook is included in production bundle
- [ ] **24.10** Verify no build warnings related to the new hook

---

## 25. Final Integration Testing

**Context:** Test the complete hook in a realistic component scenario.

**Files to modify:** None (create temporary test component if needed)

**Estimated effort:** 1 story point

- [ ] **25.1** Create a simple test component that uses useGuestLanguage hook
- [ ] **25.2** Test component renders without errors
- [ ] **25.3** Test language switcher dropdown works correctly
- [ ] **25.4** Test changing language updates URL parameter
- [ ] **25.5** Test changing language updates cookie
- [ ] **25.6** Test showOriginal toggle works correctly
- [ ] **25.7** Test URL parameter persists on page refresh
- [ ] **25.8** Test cookie persists on page refresh
- [ ] **25.9** Test shareable link with `?lang=fr` parameter loads correct language
- [ ] **25.10** Test hook integrates smoothly with mock guest UI components
- [ ] **25.11** Verify no console errors or warnings during testing
- [ ] **25.12** Document test results and mark hook as ready for production use

---

## Success Criteria

The task is complete when all of the following are verified:

1. ✅ File `src/hooks/useGuestLanguage.ts` exists with complete implementation
2. ✅ Hook exports `UseGuestLanguageReturn` interface
3. ✅ Hook returns all required properties: currentLanguage, showOriginal, setLanguage, toggleOriginal, isLoading, availableLanguages, setAvailableLanguages
4. ✅ Hook initializes from URL parameter > Cookie > detectGuestLanguage > default
5. ✅ setLanguage updates currentLanguage, resets showOriginal, updates cookie, and updates URL
6. ✅ toggleOriginal toggles showOriginal state without affecting currentLanguage
7. ✅ setAvailableLanguages updates availableLanguages state
8. ✅ Hook uses 'use client' directive for Next.js 15 compatibility
9. ✅ Hook integrates with guest-language utilities (detectGuestLanguage, setGuestLanguageCookie)
10. ✅ Hook uses Next.js navigation hooks correctly (useSearchParams, useRouter, usePathname)
11. ✅ URL updates use router.replace with { scroll: false } (no navigation)
12. ✅ Error handling is in place with try-catch and fallback to default
13. ✅ TypeScript compilation passes with no errors
14. ✅ ESLint passes with no errors
15. ✅ Build completes successfully
16. ✅ Barrel export updated in `src/hooks/index.ts`
17. ✅ Hook is documented with comprehensive JSDoc comments
18. ✅ Usage examples are provided in documentation
19. ✅ SSR/hydration compatibility verified (no hydration errors)
20. ✅ Hook is ready for integration with guest UI components (REQ-E04-008 through REQ-E04-012) and ItemDisplay (REQ-E04-017)

---

## Dependencies

**Depends On (Must Be Completed First):**
- REQ-E04-001: Create Localization Types File (provides SupportedLanguage type)
- REQ-E04-002: Create Guest Language Utility Module (provides detectGuestLanguage, setGuestLanguageCookie)

**Blocks (Cannot Start Until This Completes):**
- REQ-E04-017: Update ItemDisplay Component (requires useGuestLanguage hook)
- Any future guest page implementations (require consistent language state management)

**Parallel Safe:**
- Can be implemented in parallel with REQ-E04-008 through REQ-E04-013 (Guest UI components)
- Components use this hook but don't depend on it during development

---

## Authorized Files and Functions for Modification

### New Files to Create
1. **`src/hooks/useGuestLanguage.ts`**
   - New custom React hook file
   - Exports: `useGuestLanguage` hook, `UseGuestLanguageReturn` interface

### Files to Modify
1. **`src/hooks/index.ts`**
   - Type: Barrel export file
   - Changes: Add useGuestLanguage and UseGuestLanguageReturn exports
   - Section: Localization Hooks (Epic 4: Guest Experience Hooks)

### Files to Reference (Read-Only)
1. **`src/hooks/useLanguagePreference.ts`**
   - Reference: Hook pattern, state management approach
   - Usage: Template for hook structure

2. **`src/lib/i18n/guest-language.ts`** (from REQ-E04-002)
   - Reference: detectGuestLanguage(), setGuestLanguageCookie()
   - Usage: Core utilities for language detection and persistence

3. **`src/types/l10n.ts`** (from REQ-E04-001)
   - Reference: SupportedLanguage type
   - Usage: Type for currentLanguage and availableLanguages

4. **`src/app/dashboard/items/page.tsx`**
   - Reference: useSearchParams and URL parameter pattern
   - Usage: Example of Next.js navigation hook usage

---

## Notes

**Hook Design Pattern:**
This hook follows the Custom Hook pattern with encapsulated state and logic. It's similar to useLanguagePreference but simpler (no database, client-only).

**Two-State System:**
- `currentLanguage`: Which language to display (user's preference)
- `showOriginal`: Whether to show original instead of translation (UI toggle)
- These are separate concerns requiring separate state

**Priority Cascade:**
1. URL parameter (`?lang=fr`) - Highest priority for shareable links
2. Cookie (FAQBNB_GUEST_LANG) - Persistent preference
3. Accept-Language header - Browser preference
4. Default (en) - Fallback

**Why Separate from useLanguagePreference:**
- Different user types (authenticated vs guest)
- Different persistence (database + cookie vs cookie only)
- Different features (URL sync, toggle original)
- Different complexity levels

**Integration Pattern:**
Parent components watch `currentLanguage` and refetch translated content when it changes. Parent components use `showOriginal` to switch between displaying translated content and original content without refetching.

---

**Last Modified:** 2026-01-22 23:12
