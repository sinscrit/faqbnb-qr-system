# Update Preferences Components - Detailed Implementation Tasks

**Generated:** 2026-01-22 21:50
**Reference Documents:**
- Requirements: docs/gen_requests.md (Request #16)
- Overview: docs/REQ-E02-016-update-preferences-components-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md

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

## Task Summary

This task implements internationalization for user preferences and security settings, creating comprehensive settings pages using three translation namespaces: `settings.preferences.*` (25 keys), `settings.notifications.*` (20 keys), and `settings.security.*` (15 keys). The work includes language selection, theme switching, timezone preferences, notification toggles, and security features (2FA, session management).

**Current State:**
- LocaleContext exists with full language switching functionality (`setLocale()` function)
- No dedicated preferences or security settings pages
- No theme switching system (light/dark mode)
- Translation namespaces ready with ~60 keys total

**Target State:**
- New preferences page at `/src/app/user/preferences/page.tsx`
- Theme management system with light/dark/system modes
- Language selector integrated with LocaleContext
- Timezone, notification, and security settings UI
- Navigation links to preferences page

**Translation Keys:** ~60 keys across 3 namespaces (preferences, notifications, security)

**Story Points:** 12 points total across 12 tasks

**Dependencies:**
- REQ-E02-013 (Task 2G.1) MUST be completed first (creates settings namespace)
- REQ-250 (LocaleContext) already exists

---

## 1. Create Theme Context and Provider

**Context:** The application needs a theme management system for light/dark mode switching. This foundation enables theme preferences throughout the app.
**Files to modify:** `/src/contexts/ThemeContext.tsx` (create new)
**Estimated effort:** 1 story point

- [x] **1.1** Create new file `/src/contexts/ThemeContext.tsx`
- [x] **1.2** Add `'use client'` directive at top
- [x] **1.3** Import React: `createContext, useContext, useState, useEffect, ReactNode`
- [x] **1.4** Define type `Theme = 'light' | 'dark' | 'system'`
- [x] **1.5** Define type `EffectiveTheme = 'light' | 'dark'`
- [x] **1.6** Define `ThemeContextValue` interface with `theme`, `effectiveTheme`, and `setTheme` properties
- [x] **1.7** Create `ThemeContext` with `createContext<ThemeContextValue | undefined>(undefined)`
- [x] **1.8** Define constant `STORAGE_KEY = 'faqbnb_theme'`
- [x] **1.9** Create helper function `getSystemTheme(): EffectiveTheme` that checks `window.matchMedia('(prefers-color-scheme: dark)')`
- [x] **1.10** Create `ThemeProvider` component that accepts `children: ReactNode`
- [x] **1.11** Initialize state `theme` with default `'system'` and state `effectiveTheme` with default `'light'`
- [x] **1.12** Add useEffect to load theme from localStorage on mount
- [x] **1.13** Add useEffect to calculate effective theme based on theme state and system preference
- [x] **1.14** Add useEffect to apply effective theme to DOM (`document.documentElement.classList.toggle('dark', ...)`)
- [x] **1.15** Add useEffect to listen for system theme changes with `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`
- [x] **1.16** Create `setTheme` function that updates state and saves to localStorage
- [x] **1.17** Return ThemeContext.Provider with value object
- [x] **1.18** Export `useTheme()` hook that returns context with error handling
- [x] **1.19** Run `npx tsc --noEmit` to verify no errors

**Verification:**
- ThemeContext.tsx compiles without errors
- Types are properly defined
- Provider and hook exported correctly

---

## 2. Integrate ThemeProvider into App

**Context:** The ThemeProvider must wrap the application to make theme context available throughout the app.
**Files to modify:** `tailwind.config.js`, root layout file
**Estimated effort:** 1 story point

- [x] **2.1** Read `tailwind.config.js` file
- [x] **2.2** Locate the config object
- [x] **2.3** Add `darkMode: 'class'` property to enable class-based dark mode
- [x] **2.4** Save file and verify syntax
- [x] **2.5** Identify root layout file (likely `/src/app/layout.tsx` or similar)
- [x] **2.6** Read root layout file
- [x] **2.7** Import ThemeProvider: `import { ThemeProvider } from '@/contexts/ThemeContext'`
- [x] **2.8** Wrap existing content with `<ThemeProvider>` component (inside LocaleProvider if exists)
- [x] **2.9** Ensure ThemeProvider wraps all app content
- [x] **2.10** Run `npx tsc --noEmit` to verify no errors
- [x] **2.11** Test app still loads without errors

**Verification:**
- Tailwind config includes `darkMode: 'class'`
- ThemeProvider wraps app content
- No runtime errors on app load

---

## 3. Create Preferences Page Foundation

**Context:** Create the main preferences page that will host all settings sections.
**Files to modify:** `/src/app/user/preferences/page.tsx` (create new)
**Estimated effort:** 1 story point

- [x] **3.1** Create new file `/src/app/user/preferences/page.tsx`
- [x] **3.2** Add `'use client'` directive as first line
- [x] **3.3** Add file header comment: `// Last Modified: 2026-01-22 - REQ-E02-016: Create preferences page`
- [x] **3.4** Import `useTranslations` from 'next-intl'
- [x] **3.5** Create default export function `PreferencesPage`
- [x] **3.6** Initialize `useTranslations('settings.preferences')` hook as constant `t`
- [x] **3.7** Create page structure with `max-w-3xl mx-auto px-4 py-8` container
- [x] **3.8** Add header with `h1` using `t('title')` and `p` using `t('subtitle')`
- [x] **3.9** Add container div with `space-y-6` for sections
- [x] **3.10** Add placeholder comments for sections to be implemented
- [x] **3.11** Run `npx tsc --noEmit` to verify no TypeScript errors

**Verification:**
- Page accessible at `/user/preferences`
- Title shows "Preferences"
- Subtitle shows "Customize your experience"

---

## 4. Create Language Selector Section

**Context:** Integrate with existing LocaleContext to provide language switching functionality.
**Files to modify:** `/src/app/user/preferences/page.tsx`
**Estimated effort:** 1 story point

- [x] **4.1** Import `useLocale` from '@/contexts/LocaleContext'
- [x] **4.2** Import `useState` from 'react'
- [x] **4.3** Import `SupportedLanguage` type from LocaleContext if available
- [x] **4.4** Create component function `LanguageSection()` within the page file
- [x] **4.5** Initialize `useTranslations('settings.preferences')` hook
- [x] **4.6** Initialize `useLocale()` hook to extract `locale`, `setLocale`, `supportedLocales`, `getLocaleName`
- [x] **4.7** Create state `loading` initialized to false
- [x] **4.8** Create state `success` initialized to null (string | null)
- [x] **4.9** Create async `handleChange` function that accepts `newLocale` parameter
- [x] **4.10** In handleChange: set loading=true, call `await setLocale(newLocale)`
- [x] **4.11** On success: get language name with `getLocaleName(newLocale, true)` and show success message using `t('languageUpdated', { language })`
- [x] **4.12** Set loading=false in finally block
- [x] **4.13** Create section with `bg-white shadow rounded-lg p-6 mb-6` styling
- [x] **4.14** Add section title using `t('language')` and description using `t('languageDescription')`
- [x] **4.15** Create select dropdown with value={locale}, onChange={handleChange}, aria-label={t('languageSelectorAriaLabel')}
- [x] **4.16** Map over supportedLocales to create options with flag emoji and native name
- [x] **4.17** Display success message if exists (green background, border)
- [x] **4.18** Render LanguageSection in PreferencesPage
- [x] **4.19** Test language switching functionality

**Verification:**
- Dropdown shows all 6 languages with flags and native names
- Changing language updates app immediately
- Success message displays with selected language name
- Language persists after page reload

---

## 5. Create Theme Selector Section

**Context:** Allow users to select light, dark, or system theme preference.
**Files to modify:** `/src/app/user/preferences/page.tsx`
**Estimated effort:** 1 story point

- [x] **5.1** Import `useTheme` from '@/contexts/ThemeContext'
- [x] **5.2** Import `Theme` type from ThemeContext if exported
- [x] **5.3** Create component function `ThemeSection()` within the page file
- [x] **5.4** Initialize `useTranslations('settings.preferences')` hook
- [x] **5.5** Initialize `useTheme()` hook to extract `theme`, `setTheme`
- [x] **5.6** Create state `success` initialized to null (string | null)
- [x] **5.7** Create `handleThemeChange` function that accepts `newTheme: Theme` parameter
- [x] **5.8** In handleThemeChange: call `setTheme(newTheme)`, get theme name using `t('themeOptions.${newTheme}')`, show success message
- [x] **5.9** Define constant `themes: Theme[] = ['light', 'dark', 'system']`
- [x] **5.10** Create section with `bg-white shadow rounded-lg p-6 mb-6` styling
- [x] **5.11** Add section title using `t('theme')` and description using `t('themeDescription')`
- [x] **5.12** Create radio group div with role="radiogroup" and aria-label
- [x] **5.13** Map over themes array to create radio button labels
- [x] **5.14** Each radio: input type="radio", name="theme", checked={theme === themeOption}, onChange handler
- [x] **5.15** Display theme option name using `t('themeOptions.${themeOption}')`
- [x] **5.16** Style radio labels with border, padding, hover effects
- [x] **5.17** Display success message if exists
- [x] **5.18** Render ThemeSection in PreferencesPage after LanguageSection
- [x] **5.19** Test theme switching (light/dark/system)

**Verification:**
- Radio buttons show Light, Dark, System options
- Clicking option immediately applies theme
- Dark mode adds 'dark' class to document root
- System option follows OS preference
- Success message displays

---

## 6. Create Timezone Selector Section

**Context:** UI for timezone selection (no backend storage yet).
**Files to modify:** `/src/app/user/preferences/page.tsx`
**Estimated effort:** 1 story point

- [x] **6.1** Define constant `COMMON_TIMEZONES` array with timezone objects (value, label, offset)
- [x] **6.2** Include timezones: America/New_York, America/Chicago, America/Los_Angeles, Europe/London, Europe/Paris, Europe/Berlin, Asia/Tokyo, Asia/Shanghai, Australia/Sydney, Pacific/Auckland
- [x] **6.3** Create component function `TimezoneSection()` within the page file
- [x] **6.4** Initialize `useTranslations('settings.preferences')` hook
- [x] **6.5** Create state `timezone` initialized using `Intl.DateTimeFormat().resolvedOptions().timeZone`
- [x] **6.6** Create state `success` initialized to null
- [x] **6.7** Create `handleTimezoneChange` function that accepts timezone string
- [x] **6.8** In function: update timezone state, show success message using `t('timezoneUpdated', { timezone })`
- [x] **6.9** Create section with standard styling
- [x] **6.10** Add section title and description
- [x] **6.11** Create select dropdown with value={timezone}, onChange={handleTimezoneChange}, aria-label
- [x] **6.12** Map over COMMON_TIMEZONES to create options showing label and offset
- [x] **6.13** Display success message if exists
- [x] **6.14** Render TimezoneSection in PreferencesPage

**Verification:**
- Dropdown shows common timezones
- Current timezone auto-detected and selected
- Changing timezone shows success message
- (Note: No persistence - UI only)

---

## 7. Create Notification Preferences Section

**Context:** Toggle switches for various notification types.
**Files to modify:** `/src/app/user/preferences/page.tsx`
**Estimated effort:** 1 story point

- [x] **7.1** Create reusable component function `ToggleSwitch({ checked, onChange, label, description })` at top of file
- [x] **7.2** In ToggleSwitch: create flex container with label/description on left, switch button on right
- [x] **7.3** Add button with role="switch", aria-checked={checked}, onClick={() => onChange(!checked)}
- [x] **7.4** Style button with blue background when checked, gray when unchecked
- [x] **7.5** Add animated white circle that slides left/right based on checked state
- [x] **7.6** Create component function `NotificationsSection()` within the page file
- [x] **7.7** Initialize `useTranslations('settings.notifications')` hook
- [x] **7.8** Create state `preferences` as object with keys: emailNotifications, pushNotifications, itemUpdates, propertyUpdates, systemAnnouncements, weeklyDigest
- [x] **7.9** Initialize all preferences to sensible defaults (email=true, push=false, etc.)
- [x] **7.10** Create state `success` initialized to null
- [x] **7.11** Create `handleToggle` function that accepts key and toggles that preference
- [x] **7.12** In handleToggle: update preferences state, show success message `t('notificationsUpdated')`
- [x] **7.13** Create section with standard styling
- [x] **7.14** Add section title `t('title')` and subtitle `t('subtitle')`
- [x] **7.15** Create container div with `space-y-4`
- [x] **7.16** Map over Object.keys(preferences) to render ToggleSwitch for each
- [x] **7.17** Pass label=t(key), description=t(`${key}Description`), checked, onChange to each toggle
- [x] **7.18** Display success message if exists
- [x] **7.19** Render NotificationsSection in PreferencesPage

**Verification:**
- All 6 notification toggles display
- Clicking toggle switches between on/off
- Visual state updates immediately
- Success message shows after toggle
- Toggles have proper ARIA attributes

---

## 8. Create Security Settings Section

**Context:** 2FA toggle and active sessions management UI.
**Files to modify:** `/src/app/user/preferences/page.tsx`
**Estimated effort:** 1 story point

- [x] **8.1** Create component function `SecuritySection()` within the page file
- [x] **8.2** Initialize `useTranslations('settings.security')` hook
- [x] **8.3** Create state `twoFactorEnabled` initialized to false
- [x] **8.4** Create state `sessions` as array of mock session objects (id, device, location, lastActive, isCurrent)
- [x] **8.5** Create mock data: current session + 1-2 other sessions
- [x] **8.6** Create state `success` initialized to null
- [x] **8.7** Create `handleToggle2FA` function that toggles twoFactorEnabled and shows success message
- [x] **8.8** Use `t('twoFactorEnabled')` or `t('twoFactorDisabled')` based on new state
- [x] **8.9** Create `handleRevokeSession` function that removes session from array by id
- [x] **8.10** Create `handleRevokeAll` function that keeps only current session
- [x] **8.11** Create section with standard styling
- [x] **8.12** Add section title `t('title')`
- [x] **8.13** Create 2FA subsection with title, description, enable/disable button
- [x] **8.14** Button text: `t('enable2FA')` or `t('disable2FA')` based on state
- [x] **8.15** Button color: blue if disabled, red if enabled
- [x] **8.16** Create active sessions subsection with title, description
- [x] **8.17** Display session count using `t('sessionsActive', { count })`
- [x] **8.18** Map over sessions to create session cards
- [x] **8.19** Each card shows: device name, location, last active date, "Current Device" badge if isCurrent
- [x] **8.20** Add "Revoke Session" button for non-current sessions
- [x] **8.21** Add "Revoke All Other Sessions" button at bottom if sessions.length > 1
- [x] **8.22** Display success message if exists
- [x] **8.23** Render SecuritySection in PreferencesPage

**Verification:**
- 2FA toggle shows enable/disable button
- Clicking toggle shows appropriate success message
- Sessions list displays with mock data
- Current session shows badge and no revoke button
- Other sessions show revoke button
- Revoking session removes it from list
- "Revoke all" keeps only current session

---

## 9. Add Preferences Navigation Link

**Context:** Users need to discover and access the preferences page from the navigation menu.
**Files to modify:** `/src/app/user/layout.tsx`
**Estimated effort:** 1 story point

- [x] **9.1** Read `/src/app/user/layout.tsx` file
- [x] **9.2** Locate the `navigationItems` array or `getNavigationItems` function
- [x] **9.3** Verify `useTranslations` is imported
- [x] **9.4** Add new navigation item object after "Profile" and before "Account"
- [x] **9.5** Set properties: `name: t('settings.preferences.title')`, `href: '/user/preferences'`, `icon: '⚙️'`
- [x] **9.6** Ensure item is not inside admin-only conditional
- [x] **9.7** Run `npx tsc --noEmit` to verify no errors
- [x] **9.8** Test navigation appears and works

**Verification:**
- Navigation includes "Preferences" link with gear icon
- Link navigates to `/user/preferences`
- Active state highlights when on preferences page
- Link visible to all users (not admin-only)

---

## 10. Add Basic Dark Mode Styles

**Context:** Ensure core components have basic dark mode styling when theme is switched.
**Files to modify:** `/src/app/user/preferences/page.tsx` and potentially global CSS
**Estimated effort:** 1 story point

- [x] **10.1** Review existing Tailwind dark mode classes in preferences page
- [x] **10.2** Add `dark:bg-gray-800` to main container
- [x] **10.3** Add `dark:text-gray-100` to titles
- [x] **10.4** Add `dark:text-gray-300` to descriptions
- [x] **10.5** Update section backgrounds: `bg-white dark:bg-gray-900`
- [x] **10.6** Update borders: `border-gray-200 dark:border-gray-700`
- [x] **10.7** Update input/select backgrounds: `bg-white dark:bg-gray-800`
- [x] **10.8** Update text colors: `text-gray-900 dark:text-gray-100`
- [x] **10.9** Update success message backgrounds: `bg-green-50 dark:bg-green-900/20`
- [x] **10.10** Update toggle switch colors for dark mode
- [x] **10.11** Test page in light mode - verify appearance
- [x] **10.12** Switch to dark mode - verify all elements visible and styled
- [x] **10.13** Test all interactive elements work in both modes

**Verification:**
- Light mode looks clean and professional
- Dark mode has appropriate contrast
- All text readable in both modes
- Interactive elements clearly visible in both modes

---

## 11. Responsive Design and Polish

**Context:** Ensure preferences page works well on all device sizes.
**Files to modify:** `/src/app/user/preferences/page.tsx`
**Estimated effort:** 1 story point

- [x] **11.1** Verify page container uses responsive padding: `px-4 sm:px-6 lg:px-8`
- [x] **11.2** Verify max-width constraint: `max-w-3xl`
- [x] **11.3** Test section layouts on mobile (320px width) - verify vertical stacking
- [x] **11.4** Test toggle switches on mobile - ensure adequate touch targets (min 44px)
- [x] **11.5** Test dropdowns on mobile - verify full width and usability
- [x] **11.6** Test radio buttons on tablet (768px) - verify spacing
- [x] **11.7** Test on desktop (1280px) - verify centered layout
- [x] **11.8** Add responsive text sizes where needed: `text-sm sm:text-base`
- [x] **11.9** Verify focus states visible on all interactive elements
- [x] **11.10** Test tab navigation through all form elements
- [x] **11.11** Verify all ARIA labels present and correct

**Verification:**
- Mobile (320-767px): vertical layout, readable text, usable controls
- Tablet (768-1023px): appropriate spacing, larger touch targets
- Desktop (1024px+): centered layout, optimal spacing
- Keyboard navigation works smoothly
- Focus indicators clearly visible

---

## 12. Testing and Final Validation

**Context:** Comprehensive testing to verify all functionality works correctly.
**Files to modify:** N/A (testing only)
**Estimated effort:** 1 story point

- [x] **12.1** Run `npx tsc --noEmit` and verify 0 errors
- [x] **12.2** Run `npm run lint` and verify no new warnings
- [x] **12.3** Navigate to `/user/preferences` and verify page loads
- [x] **12.4** Verify page title "Preferences" and subtitle display
- [x] **12.5** Test language selector: switch between all 6 languages, verify app updates
- [x] **12.6** Verify language change persists after page reload
- [x] **12.7** Test theme selector: switch between light/dark/system
- [x] **12.8** Verify dark mode applies correct styling
- [x] **12.9** Verify system theme follows OS preference
- [x] **12.10** Verify theme persists after page reload
- [x] **12.11** Test timezone selector: change timezone, verify success message
- [x] **12.12** Test notification toggles: toggle each on/off
- [x] **12.13** Verify toggle visual states update correctly
- [x] **12.14** Test 2FA toggle: enable/disable, verify messages
- [x] **12.15** Test session management: revoke individual session
- [x] **12.16** Test "Revoke All Other Sessions" button
- [x] **12.17** Verify current session cannot be revoked
- [x] **12.18** Test keyboard navigation: tab through all elements
- [x] **12.19** Verify all ARIA labels announced correctly with screen reader
- [x] **12.20** Test responsive design on mobile, tablet, desktop
- [x] **12.21** Verify no console errors or warnings
- [x] **12.22** Verify all ~60 translation keys used from 3 namespaces
- [x] **12.23** Check for any hardcoded English strings

**Verification:**
- All functionality works as expected
- No TypeScript or console errors
- All translations display correctly
- Theme switching works smoothly
- Language switching persists correctly
- Responsive design works across devices
- Accessibility requirements met

---

## Translation Keys Reference

### Preferences Namespace (25 keys)

From `/messages/en.json` lines 3440-3471 (`settings.preferences.*`):

| Key | Value | Usage |
|-----|-------|-------|
| title | "Preferences" | Page title, navigation |
| subtitle | "Customize your experience" | Page subtitle |
| language | "Language" | Section title |
| languageDescription | "Choose your preferred language" | Section description |
| languageSelectorAriaLabel | "Select your preferred language" | Dropdown aria-label |
| languageUpdated | "Language updated to {language}" | Success message (ICU) |
| supportedLanguages.en | "English" | Language name |
| supportedLanguages.fr | "Français" | Language name |
| supportedLanguages.es | "Español" | Language name |
| supportedLanguages.de | "Deutsch" | Language name |
| supportedLanguages.nl | "Nederlands" | Language name |
| supportedLanguages.it | "Italiano" | Language name |
| theme | "Theme" | Section title |
| themeDescription | "Choose your preferred color theme" | Section description |
| themeSelectorAriaLabel | "Select your preferred theme" | Radio group aria-label |
| themeUpdated | "Theme updated to {theme}" | Success message (ICU) |
| themeOptions.light | "Light" | Theme option |
| themeOptions.dark | "Dark" | Theme option |
| themeOptions.system | "System" | Theme option |
| timezone | "Timezone" | Section title |
| timezoneDescription | "Set your timezone for accurate timestamps" | Section description |
| timezoneSelectorAriaLabel | "Select your timezone" | Dropdown aria-label |
| timezoneUpdated | "Timezone updated to {timezone}" | Success message (ICU) |
| dateFormat | "Date Format" | (Optional field) |
| timeFormat | "Time Format" | (Optional field) |
| preferencesUpdated | "Preferences updated successfully" | General success message |

### Notifications Namespace (20 keys)

From `/messages/en.json` lines 3472-3490 (`settings.notifications.*`):

| Key | Value | Usage |
|-----|-------|-------|
| title | "Notifications" | Section title |
| subtitle | "Manage your notification preferences" | Section subtitle |
| emailNotifications | "Email Notifications" | Toggle label |
| emailNotificationsDescription | "Receive updates via email" | Toggle description |
| pushNotifications | "Push Notifications" | Toggle label |
| pushNotificationsDescription | "Receive push notifications in your browser" | Toggle description |
| itemUpdates | "Item Updates" | Toggle label |
| itemUpdatesDescription | "Notify when items are updated" | Toggle description |
| propertyUpdates | "Property Updates" | Toggle label |
| propertyUpdatesDescription | "Notify when properties are updated" | Toggle description |
| systemAnnouncements | "System Announcements" | Toggle label |
| systemAnnouncementsDescription | "Important updates and announcements" | Toggle description |
| weeklyDigest | "Weekly Digest" | Toggle label |
| weeklyDigestDescription | "Receive a weekly summary of activity" | Toggle description |
| unreadCount | "{count, plural, =0 {No unread...} one {# unread...} other {# unread...}}" | Unread count (ICU plural) |
| markAllRead | "Mark All as Read" | Button text |
| notificationsUpdated | "Notification preferences updated" | Success message |

### Security Namespace (15 keys)

From `/messages/en.json` lines 3491-3508 (`settings.security.*`):

| Key | Value | Usage |
|-----|-------|-------|
| title | "Security" | Section title |
| subtitle | "Manage your security settings" | Section subtitle |
| twoFactorAuth | "Two-Factor Authentication" | Subsection title |
| twoFactorAuthDescription | "Add an extra layer of security" | Description |
| enable2FA | "Enable 2FA" | Button text |
| disable2FA | "Disable 2FA" | Button text |
| twoFactorEnabled | "Two-factor authentication enabled" | Success message |
| twoFactorDisabled | "Two-factor authentication disabled" | Success message |
| activeSessions | "Active Sessions" | Subsection title |
| activeSessionsDescription | "Manage your active login sessions" | Description |
| sessionsActive | "{count, plural, one {# active session} other {# active sessions}}" | Session count (ICU plural) |
| revokeSession | "Revoke Session" | Button text |
| revokeAllOther | "Revoke All Other Sessions" | Button text |
| currentDevice | "Current Device" | Badge text |
| lastActive | "Last active: {date}" | Session info (ICU) |
| securityUpdated | "Security settings updated" | Success message |

**Total:** ~60 keys across 3 namespaces

---

## Authorized Files for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `/src/contexts/ThemeContext.tsx` | Theme management context and provider |
| `/src/app/user/preferences/page.tsx` | Main preferences page with all sections |

### Existing Files to Modify

| File | Lines | Modification |
|------|-------|--------------|
| `tailwind.config.js` | Config object | Add `darkMode: 'class'` |
| Root layout file | TBD | Wrap with ThemeProvider |
| `/src/app/user/layout.tsx` | 92-99 | Add preferences navigation item |

### Translation Files (Reference Only)

| File | Lines | Purpose |
|------|-------|---------|
| `/messages/en.json` | 3440-3471 | Preferences translations (already exists) |
| `/messages/en.json` | 3472-3490 | Notifications translations (already exists) |
| `/messages/en.json` | 3491-3508 | Security translations (already exists) |

---

## Dependencies

**Must Complete First:**
- **REQ-E02-013 (Task 2G.1):** Create settings namespace structure
  - Provides: ~60 translation keys across 3 namespaces
- **REQ-250:** LocaleContext (already exists - created 2026-01-18)
  - Provides: `setLocale()` function, language switching functionality

**Blocks:**
- **REQ-E02-089 (Task 2G.6):** Generate translations for 5 non-English languages

**Conflicts:**
- Tasks 2G.2, 2G.3 - Also modify `/src/app/user/layout.tsx` navigation
- **Recommendation:** Run sequentially (2G.2 → 2G.3 → 2G.4)

**Safe to Parallelize With:**
- Task 2G.5 (Help page) - Different files

---

## Out of Scope

The following items are explicitly NOT included in this task:

### Backend Implementation
- Notification preferences API
- Timezone storage in database
- Two-factor authentication logic (TOTP, backup codes)
- Session management API
- Email/push notification delivery

### Advanced Features
- Custom theme colors
- Scheduled theme switching
- WebAuthn / passkeys
- Login history / audit log
- In-app notification center

### Translation Work
- French, Spanish, German, Dutch, Italian translations (Task 2G.6)

---

## Quality Checklist

Before marking this task complete, verify:

- [ ] All 12 numbered tasks completed
- [ ] All subtasks checked off
- [ ] TypeScript compilation succeeds
- [ ] No new lint warnings
- [ ] All ~60 translation keys used
- [ ] No hardcoded English strings
- [ ] Theme switching works (light/dark/system)
- [ ] Language switching works via LocaleContext
- [ ] Dark mode CSS applied
- [ ] Responsive design works
- [ ] All ARIA labels present
- [ ] No console errors

---

## Notes

### Design Decisions

1. **Theme Context:** Separate context for theme management enables clean separation from locale/language concerns.

2. **LocaleContext Integration:** Reuses existing language switching infrastructure rather than duplicating logic.

3. **UI-Only Features:** Focus on internationalization; backend APIs deferred to future work.

4. **Combined Page:** Preferences, notifications, and security on one page initially; can separate later if grows too large.

### Future Enhancements

- Backend APIs for all preferences
- Actual 2FA implementation (TOTP)
- Session management backend
- Custom theme colors
- Advanced accessibility settings

---

**Document End**

Last Modified: 2026-01-22 21:50:00
