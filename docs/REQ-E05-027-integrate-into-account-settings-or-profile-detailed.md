# Integrate Language Preference into Account Settings - Detailed Implementation Tasks

**Generated:** 2026-01-23 12:00
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #27)
- Overview: docs/REQ-E05-027-integrate-into-account-settings-or-profile-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Account Settings Page File

**Context:** Next.js App Router uses file-system based routing. Creating `/src/app/dashboard2/settings/page.tsx` establishes the route at `/dashboard2/settings`. The page is a client component that fetches current preferences and integrates the LanguagePreferenceSection component.

**Files to modify:**
- `/src/app/dashboard2/settings/page.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **1.1** Create directory `/src/app/dashboard2/settings/` if it doesn't exist
- [ ] **1.2** Create file `/src/app/dashboard2/settings/page.tsx`
- [ ] **1.3** Add 'use client' directive at the top
- [ ] **1.4** Add JSDoc file header with REQ-E05-027 reference, Epic 5 Phase 6 Task 6.3, purpose description, route annotation (`@route /dashboard2/settings`), and creation date
- [ ] **1.5** Verify file structure follows Next.js conventions

---

## 2. Add Imports to Settings Page

**Context:** The page requires React hooks for state management, AuthContext for account ID, next-intl for translations, Lucide icons for UI, the LanguagePreferenceSection component, and language options helper.

**Files to modify:**
- `/src/app/dashboard2/settings/page.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Import `useEffect`, `useState` from 'react'
- [ ] **2.2** Import `useAuth` from '@/contexts/AuthContext'
- [ ] **2.3** Import `useTranslations` from 'next-intl'
- [ ] **2.4** Import `Loader2`, `Settings` icons from 'lucide-react'
- [ ] **2.5** Import `LanguagePreferenceSection` from '@/components/TranslationManagement/LanguagePreference'
- [ ] **2.6** Import `getLanguageOptions` from '@/lib/i18n'
- [ ] **2.7** Run type check: `npx tsc --noEmit` to verify imports resolve correctly

---

## 3. Define Component Structure and State

**Context:** The component needs state for current language preference, loading status, and error handling. It also needs to extract the accountId from AuthContext and initialize translations.

**Files to modify:**
- `/src/app/dashboard2/settings/page.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Define default export function `AccountSettingsPage`
- [ ] **3.2** Destructure `user` and `currentAccount` from `useAuth()` hook
- [ ] **3.3** Initialize translations: `const t = useTranslations('settings');`
- [ ] **3.4** Add state: `const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);`
- [ ] **3.5** Add state: `const [loading, setLoading] = useState(true);`
- [ ] **3.6** Add state: `const [error, setError] = useState<string | null>(null);`
- [ ] **3.7** Extract accountId: `const accountId = currentAccount?.id;`
- [ ] **3.8** Run type check: `npx tsc --noEmit`

---

## 4. Implement Fetch Preferences Effect

**Context:** On component mount, fetch the current language preference from the API endpoint. This populates the LanguagePreferenceSection with the user's saved preference.

**Files to modify:**
- `/src/app/dashboard2/settings/page.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Add `useEffect` hook with dependency array `[accountId]`
- [ ] **4.2** Define async function `fetchPreferences` inside the effect
- [ ] **4.3** Check if `!accountId` - if so, set error "No account ID available", set loading false, and return early
- [ ] **4.4** Wrap API call in try-catch block
- [ ] **4.5** Fetch from `/api/accounts/${accountId}/preferences` using GET method
- [ ] **4.6** Check if `!response.ok` and throw error "Failed to fetch preferences"
- [ ] **4.7** Parse JSON response: `const data = await response.json();`
- [ ] **4.8** If `data.success`, extract and set current language: `setCurrentLanguage(data.data.preferences.preferredLanguage);`
- [ ] **4.9** In catch block, set error with message and log to console
- [ ] **4.10** In finally block, set `setLoading(false)`
- [ ] **4.11** Call `fetchPreferences()` inside the effect
- [ ] **4.12** Run type check: `npx tsc --noEmit`

---

## 5. Implement Save Handler Function

**Context:** The save handler is passed as a callback to LanguagePreferenceSection. It sends a PUT request to update the preference and updates local state on success.

**Files to modify:**
- `/src/app/dashboard2/settings/page.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Define async function `handleSaveLanguagePreference` with parameter `languageCode: string`
- [ ] **5.2** Check if `!accountId` and throw error "No account ID available"
- [ ] **5.3** Make fetch call to `/api/accounts/${accountId}/preferences` with method PUT
- [ ] **5.4** Set headers: `{ 'Content-Type': 'application/json' }`
- [ ] **5.5** Set body: `JSON.stringify({ preferredLanguage: languageCode })`
- [ ] **5.6** Check if `!response.ok`, parse error data, and throw error with message from `data.error` or fallback
- [ ] **5.7** Parse success response: `const data = await response.json();`
- [ ] **5.8** If `data.success`, update local state: `setCurrentLanguage(data.data.preferences.preferredLanguage);`
- [ ] **5.9** Run type check: `npx tsc --noEmit`

---

## 6. Implement Loading State UI

**Context:** While preferences are being fetched, display a centered loading spinner to indicate activity. This provides visual feedback during the initial API call.

**Files to modify:**
- `/src/app/dashboard2/settings/page.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Add conditional check: `if (loading)`
- [ ] **6.2** Return a div with `className="flex items-center justify-center py-12"`
- [ ] **6.3** Inside div, add `Loader2` icon with `className="w-8 h-8 animate-spin text-[#FF385C]"`
- [ ] **6.4** Run type check: `npx tsc --noEmit`

---

## 7. Implement Main Page Structure

**Context:** The page layout includes a header with icon and title, optional error display, and the language preference section wrapped in a card. This follows the established dashboard styling patterns.

**Files to modify:**
- `/src/app/dashboard2/settings/page.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Return main container div with `className="max-w-2xl mx-auto px-4 py-8"`
- [ ] **7.2** Add page header section with `className="mb-8"`
- [ ] **7.3** Inside header, add flex div with Settings icon and h1 title using `t('title')`
- [ ] **7.4** Add description paragraph with `t('description')` and `className="text-gray-600"`
- [ ] **7.5** Add conditional error display: if `error` exists, show red alert box with error message
- [ ] **7.6** Add settings sections container with `className="space-y-8"`
- [ ] **7.7** Inside sections, add white card div with `className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"`
- [ ] **7.8** Inside card, render `LanguagePreferenceSection` component
- [ ] **7.9** Pass props to LanguagePreferenceSection: `currentLanguage={currentLanguage}`, `availableLanguages={getLanguageOptions()}`, `onSave={handleSaveLanguagePreference}`
- [ ] **7.10** Add comment noting future sections can be added to the container
- [ ] **7.11** Run type check: `npx tsc --noEmit`

---

## 8. Update Dashboard Navigation - Add Import

**Context:** The Settings icon needs to be imported from Lucide React to display in the navigation menu.

**Files to modify:**
- `/src/app/dashboard2/Dashboard2LayoutClient.tsx` (around line 20)

**Estimated effort:** 1 story point

- [ ] **8.1** Open `/src/app/dashboard2/Dashboard2LayoutClient.tsx`
- [ ] **8.2** Locate the import statement for Lucide React icons (around line 20)
- [ ] **8.3** Add `Settings` to the list of imported icons (keep alphabetical order if established)
- [ ] **8.4** Verify import statement: `import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package, Settings } from 'lucide-react';`
- [ ] **8.5** Run type check: `npx tsc --noEmit`

---

## 9. Update Dashboard Navigation - Add Menu Item

**Context:** Add Settings as the last item in the navigation menu. This makes the settings page accessible from the main dashboard navigation.

**Files to modify:**
- `/src/app/dashboard2/Dashboard2LayoutClient.tsx` (around line 76)

**Estimated effort:** 1 story point

- [ ] **9.1** Locate the `navigationItems` array definition in Dashboard2LayoutClient.tsx (around line 52-77)
- [ ] **9.2** Find the last navigation item (currently Properties)
- [ ] **9.3** After the Properties item, add a comma if needed
- [ ] **9.4** Add new object with properties: `name: t('nav.settings')`, `mobileLabel: t('nav.mobile.settings')`, `href: '/dashboard2/settings'`, `icon: Settings`
- [ ] **9.5** Verify object is properly formatted with correct commas
- [ ] **9.6** Run type check: `npx tsc --noEmit`

---

## 10. Add English Translation Keys

**Context:** English is the base language. All translation keys start here and are then translated to other languages.

**Files to modify:**
- `/messages/en.json`

**Estimated effort:** 1 story point

- [ ] **10.1** Open `/messages/en.json`
- [ ] **10.2** Locate or create the `"settings"` top-level namespace
- [ ] **10.3** Add key `"title": "Account Settings"`
- [ ] **10.4** Add key `"description": "Manage your account preferences and settings."`
- [ ] **10.5** Locate or create the `"dashboard"` namespace
- [ ] **10.6** Inside `"dashboard"`, locate or create `"nav"` object
- [ ] **10.7** Add key `"settings": "Settings"` to `"nav"` object
- [ ] **10.8** Inside `"dashboard"`, locate or create `"nav.mobile"` object (might be nested as `"nav": { "mobile": {} }`)
- [ ] **10.9** Add key `"settings": "Settings"` to `"nav.mobile"` object
- [ ] **10.10** Verify JSON syntax is valid
- [ ] **10.11** Run build to validate: `npm run build`

---

## 11. Add Spanish Translation Keys

**Context:** Spanish translations for the settings page UI text.

**Files to modify:**
- `/messages/es.json`

**Estimated effort:** 1 story point

- [ ] **11.1** Open `/messages/es.json`
- [ ] **11.2** Add to `"settings"` namespace: `"title": "Configuración de cuenta"`
- [ ] **11.3** Add to `"settings"` namespace: `"description": "Administre las preferencias y configuraciones de su cuenta."`
- [ ] **11.4** Add to `"dashboard"."nav"`: `"settings": "Configuración"`
- [ ] **11.5** Add to `"dashboard"."nav.mobile"`: `"settings": "Config."` (abbreviated for mobile)
- [ ] **11.6** Verify JSON syntax is valid

---

## 12. Add French Translation Keys

**Context:** French translations for the settings page UI text.

**Files to modify:**
- `/messages/fr.json`

**Estimated effort:** 1 story point

- [ ] **12.1** Open `/messages/fr.json`
- [ ] **12.2** Add to `"settings"`: `"title": "Paramètres du compte"`
- [ ] **12.3** Add to `"settings"`: `"description": "Gérez les préférences et les paramètres de votre compte."`
- [ ] **12.4** Add to `"dashboard"."nav"`: `"settings": "Paramètres"`
- [ ] **12.5** Add to `"dashboard"."nav.mobile"`: `"settings": "Param."`
- [ ] **12.6** Verify JSON syntax is valid

---

## 13. Add German Translation Keys

**Context:** German translations for the settings page UI text.

**Files to modify:**
- `/messages/de.json`

**Estimated effort:** 1 story point

- [ ] **13.1** Open `/messages/de.json`
- [ ] **13.2** Add to `"settings"`: `"title": "Kontoeinstellungen"`
- [ ] **13.3** Add to `"settings"`: `"description": "Verwalten Sie Ihre Kontopräferenzen und -einstellungen."`
- [ ] **13.4** Add to `"dashboard"."nav"`: `"settings": "Einstellungen"`
- [ ] **13.5** Add to `"dashboard"."nav.mobile"`: `"settings": "Einstell."`
- [ ] **13.6** Verify JSON syntax is valid

---

## 14. Add Italian Translation Keys

**Context:** Italian translations for the settings page UI text.

**Files to modify:**
- `/messages/it.json`

**Estimated effort:** 1 story point

- [ ] **14.1** Open `/messages/it.json`
- [ ] **14.2** Add to `"settings"`: `"title": "Impostazioni account"`
- [ ] **14.3** Add to `"settings"`: `"description": "Gestisci le preferenze e le impostazioni del tuo account."`
- [ ] **14.4** Add to `"dashboard"."nav"`: `"settings": "Impostazioni"`
- [ ] **14.5** Add to `"dashboard"."nav.mobile"`: `"settings": "Impost."`
- [ ] **14.6** Verify JSON syntax is valid

---

## 15. Add Dutch Translation Keys

**Context:** Dutch translations for the settings page UI text.

**Files to modify:**
- `/messages/nl.json`

**Estimated effort:** 1 story point

- [ ] **15.1** Open `/messages/nl.json`
- [ ] **15.2** Add to `"settings"`: `"title": "Accountinstellingen"`
- [ ] **15.3** Add to `"settings"`: `"description": "Beheer uw accountvoorkeuren en -instellingen."`
- [ ] **15.4** Add to `"dashboard"."nav"`: `"settings": "Instellingen"`
- [ ] **15.5** Add to `"dashboard"."nav.mobile"`: `"settings": "Instell."`
- [ ] **15.6** Verify JSON syntax is valid

---

## 16. Write Unit Tests - Setup

**Context:** Create test file structure with necessary imports and mocks for testing the settings page component.

**Files to modify:**
- `/src/app/dashboard2/settings/__tests__/page.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **16.1** Create directory `/src/app/dashboard2/settings/__tests__/`
- [ ] **16.2** Create file `page.test.tsx`
- [ ] **16.3** Import testing utilities: `describe`, `it`, `expect`, `vi`, `beforeEach` from 'vitest'
- [ ] **16.4** Import `render`, `screen`, `waitFor`, `fireEvent` from '@testing-library/react'
- [ ] **16.5** Import `AccountSettingsPage` from '../page'
- [ ] **16.6** Mock `@/contexts/AuthContext` using `vi.mock()`
- [ ] **16.7** Mock `next-intl` useTranslations hook
- [ ] **16.8** Mock `@/components/TranslationManagement/LanguagePreference` component
- [ ] **16.9** Mock `@/lib/i18n` getLanguageOptions function
- [ ] **16.10** Mock global `fetch` function
- [ ] **16.11** Create helper to setup common test mocks (user, account, translations)

---

## 17. Write Unit Tests - Rendering

**Context:** Test that the page renders correctly with various states (loading, error, success).

**Files to modify:**
- `/src/app/dashboard2/settings/__tests__/page.test.tsx`

**Estimated effort:** 1 story point

- [ ] **17.1** Write test: "renders loading spinner during initial fetch" - verify Loader2 component appears
- [ ] **17.2** Write test: "renders page header with Settings icon and title" - verify heading text appears
- [ ] **17.3** Write test: "renders LanguagePreferenceSection component" - verify component is rendered
- [ ] **17.4** Write test: "displays error message when API fetch fails" - mock fetch to fail, assert error appears
- [ ] **17.5** Write test: "displays error when accountId is missing" - mock null currentAccount, assert error message
- [ ] **17.6** Run tests: `npm test` and verify rendering tests pass

---

## 18. Write Unit Tests - Data Fetching

**Context:** Test the API integration for fetching current preferences on component mount.

**Files to modify:**
- `/src/app/dashboard2/settings/__tests__/page.test.tsx`

**Estimated effort:** 1 story point

- [ ] **18.1** Write test: "fetches preferences from API on mount" - verify fetch called with correct URL
- [ ] **18.2** Write test: "pre-populates LanguagePreferenceSection with fetched preference" - mock API response, verify currentLanguage prop passed
- [ ] **18.3** Write test: "handles null preference from API" - mock API returning null, verify component handles gracefully
- [ ] **18.4** Write test: "does not fetch when accountId is missing" - mock null account, verify fetch not called
- [ ] **18.5** Run tests: `npm test` and verify data fetching tests pass

---

## 19. Write Unit Tests - Save Functionality

**Context:** Test the save handler integration with the API and state updates.

**Files to modify:**
- `/src/app/dashboard2/settings/__tests__/page.test.tsx`

**Estimated effort:** 1 story point

- [ ] **19.1** Write test: "calls PUT API when onSave triggered" - simulate save, verify fetch called with PUT method
- [ ] **19.2** Write test: "updates local state after successful save" - mock successful save, verify currentLanguage state updated
- [ ] **19.3** Write test: "throws error when save fails" - mock API error, verify error is thrown
- [ ] **19.4** Write test: "includes correct body in PUT request" - verify JSON body contains preferredLanguage
- [ ] **19.5** Run tests: `npm test` and verify save functionality tests pass

---

## 20. Verify TypeScript Compilation

**Context:** Ensure all new code compiles without errors and types are correctly defined.

**Files to modify:**
- None (verification)

**Estimated effort:** 1 story point

- [ ] **20.1** Run full type check: `npx tsc --noEmit` from project root
- [ ] **20.2** Fix any type errors in page.tsx
- [ ] **20.3** Fix any type errors in Dashboard2LayoutClient.tsx
- [ ] **20.4** Fix any type errors in test file
- [ ] **20.5** Verify no implicit 'any' types exist
- [ ] **20.6** Re-run type check and confirm zero errors

---

## 21. Run Linter and Fix Issues

**Context:** Ensure code quality and consistency with project ESLint configuration.

**Files to modify:**
- Various (as needed for lint fixes)

**Estimated effort:** 1 story point

- [ ] **21.1** Run linter: `npm run lint` from project root
- [ ] **21.2** Fix any ESLint warnings in page.tsx
- [ ] **21.3** Fix any ESLint warnings in Dashboard2LayoutClient.tsx
- [ ] **21.4** Fix any ESLint warnings in test file
- [ ] **21.5** Verify no unused imports exist
- [ ] **21.6** Verify no unused variables exist
- [ ] **21.7** Re-run linter and confirm zero warnings

---

## 22. Manual Testing - Navigation Access

**Context:** Verify users can navigate to the settings page from the dashboard menu.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **22.1** Start dev server: `npm run dev`
- [ ] **22.2** Log in to dashboard as a test user
- [ ] **22.3** Locate Settings link in navigation menu
- [ ] **22.4** Verify Settings icon appears correctly
- [ ] **22.5** Click Settings link and verify navigation to `/dashboard2/settings`
- [ ] **22.6** Verify URL shows `/dashboard2/settings` in address bar
- [ ] **22.7** On mobile view (< 640px), verify navigation shows abbreviated label

---

## 23. Manual Testing - Initial Load

**Context:** Test the page's initial loading behavior and data fetching.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **23.1** Navigate to `/dashboard2/settings`
- [ ] **23.2** Verify loading spinner appears briefly
- [ ] **23.3** Verify page header displays "Account Settings" title
- [ ] **23.4** Verify description text displays below title
- [ ] **23.5** Verify LanguagePreferenceSection component renders
- [ ] **23.6** Verify language dropdown shows current preference (or defaults to English)
- [ ] **23.7** Check browser network tab to confirm GET request to `/api/accounts/[accountId]/preferences`

---

## 24. Manual Testing - Language Save Flow

**Context:** Test the complete flow of changing and saving a language preference.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **24.1** On settings page, change language dropdown to French
- [ ] **24.2** Verify Save button becomes enabled
- [ ] **24.3** Click Save button
- [ ] **24.4** Verify "Saving..." text appears with spinner
- [ ] **24.5** Verify success message displays after save
- [ ] **24.6** Verify success message disappears after 3 seconds
- [ ] **24.7** Reload page and verify French remains selected (persistence)
- [ ] **24.8** Check network tab to confirm PUT request to `/api/accounts/[accountId]/preferences` with correct body

---

## 25. Manual Testing - Error Scenarios

**Context:** Test error handling when API calls fail or data is missing.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Simulate network offline mode in browser dev tools
- [ ] **25.2** Reload settings page
- [ ] **25.3** Verify error message displays in red alert box
- [ ] **25.4** Restore network connection
- [ ] **25.5** Reload page and verify normal operation resumes
- [ ] **25.6** Check console for appropriate error logging

---

## 26. Manual Testing - Internationalization

**Context:** Verify the settings page displays correctly in all supported languages.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **26.1** Change UI language to English and verify "Account Settings" appears
- [ ] **26.2** Change to Spanish and verify "Configuración de cuenta"
- [ ] **26.3** Change to French and verify "Paramètres du compte"
- [ ] **26.4** Change to German and verify "Kontoeinstellungen"
- [ ] **26.5** Change to Italian and verify "Impostazioni account"
- [ ] **26.6** Change to Dutch and verify "Accountinstellingen"
- [ ] **26.7** Verify navigation label updates in each language
- [ ] **26.8** Verify description text updates in each language

---

## 27. Manual Testing - Responsive Design

**Context:** Test the page layout on different screen sizes to ensure mobile compatibility.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **27.1** Open browser dev tools and toggle device toolbar
- [ ] **27.2** Test at mobile width (375px) - verify layout doesn't break
- [ ] **27.3** Verify language dropdown doesn't overflow on small screens
- [ ] **27.4** Verify Save button remains accessible on mobile
- [ ] **27.5** Test at tablet width (768px) - verify layout adjusts appropriately
- [ ] **27.6** Test at desktop width (1920px) - verify max-width constraint works
- [ ] **27.7** Verify navigation shows abbreviated labels on mobile

---

## 28. Manual Testing - Authentication

**Context:** Verify the page is protected and redirects unauthenticated users.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **28.1** Log out from the application
- [ ] **28.2** Attempt to navigate directly to `/dashboard2/settings` via URL
- [ ] **28.3** Verify redirect to login page occurs
- [ ] **28.4** Log in with valid credentials
- [ ] **28.5** Verify redirect to dashboard or settings page after login
- [ ] **28.6** Verify settings page loads correctly after authentication

---

## 29. Build Verification

**Context:** Ensure the page can be built for production without errors.

**Files to modify:**
- None (verification)

**Estimated effort:** 1 story point

- [ ] **29.1** Run production build: `npm run build` from project root
- [ ] **29.2** Verify build completes successfully without errors
- [ ] **29.3** Check build output for any warnings related to new page
- [ ] **29.4** Verify settings route is included in build output
- [ ] **29.5** Start production server: `npm start` (if applicable)
- [ ] **29.6** Navigate to `/dashboard2/settings` in production mode and verify functionality

---

## 30. Integration Testing with Dependencies

**Context:** Verify the page works correctly with the LanguagePreferenceSection component and API endpoint.

**Files to modify:**
- None (integration testing)

**Estimated effort:** 1 story point

- [ ] **30.1** Verify LanguagePreferenceSection component exists at expected path
- [ ] **30.2** Verify `getLanguageOptions()` function returns expected data
- [ ] **30.3** Verify GET `/api/accounts/[accountId]/preferences` endpoint is accessible
- [ ] **30.4** Verify PUT `/api/accounts/[accountId]/preferences` endpoint is accessible
- [ ] **30.5** Test complete flow: fetch current preference, display in component, change selection, save, verify update
- [ ] **30.6** Check that all three pieces (page, component, API) work together seamlessly

---

## Authorized Files for Modification

### New Files to Create
1. `/src/app/dashboard2/settings/page.tsx` - Main settings page component
2. `/src/app/dashboard2/settings/__tests__/page.test.tsx` - Unit/integration tests

### Existing Files to Modify
1. `/src/app/dashboard2/Dashboard2LayoutClient.tsx` (line ~20, ~76) - Add Settings import and navigation item
2. `/messages/en.json` - Add English translation keys
3. `/messages/es.json` - Add Spanish translation keys
4. `/messages/fr.json` - Add French translation keys
5. `/messages/de.json` - Add German translation keys
6. `/messages/it.json` - Add Italian translation keys
7. `/messages/nl.json` - Add Dutch translation keys

### Files to Reference (No Changes)
- `/src/contexts/AuthContext.tsx` - Access `currentAccount.id`
- `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` - Component to integrate
- `/src/lib/i18n/language-options.ts` - Use `getLanguageOptions()` helper
- `/src/app/api/accounts/[accountId]/preferences/route.ts` - API endpoint

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-025**: LanguagePreferenceSection Component ✅ (must exist)
- **REQ-E05-026**: Account Preference API Endpoint ✅ (must exist)
- **Epic 1 - L10N Foundation**: Language metadata and i18n configuration ✅ (exists)
- **AuthContext**: Must provide `currentAccount` with `id` property ✅ (exists)

### Blocks (Requires This First)
- None - This is the final integration task for Phase 6

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Account Settings page created at `/dashboard2/settings`
2. ✅ Page includes LanguagePreferenceSection component
3. ✅ Current language preference fetched from API on page load
4. ✅ Language selector pre-populated with user's current preference
5. ✅ Saving new preference calls PUT `/api/accounts/[accountId]/preferences`
6. ✅ Success/error feedback displays correctly after save attempt
7. ✅ Loading state displays while fetching initial preferences
8. ✅ Navigation link to Settings page added to dashboard
9. ✅ Translation keys added for settings page in all 6 locales
10. ✅ Page protected by authentication (redirects to login if not authenticated)
11. ✅ AuthContext provides accountId needed for API calls
12. ✅ No TypeScript compilation errors
13. ✅ No ESLint warnings
14. ✅ Page follows existing dashboard styling patterns
15. ✅ Mobile-responsive layout maintained
16. ✅ All unit tests pass
17. ✅ Manual QA scenarios complete successfully
18. ✅ Production build succeeds without errors

---

**Document Status**: PENDING
**Last Updated**: 2026-01-23 12:00
**Author**: Senior Developer (Task Breakdown Agent)
**Review Status**: Awaiting Implementation
