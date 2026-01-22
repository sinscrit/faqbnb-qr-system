# Implementation Overview: Update Preferences Components

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-016 |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 21:46 |
| Sub-Epic | 2G - Settings & Account |
| Task | 2G.4 |
| T-shirt Size | Large |
| Estimated Effort | 12-16 hours |
| Status | PENDING |

---

## Executive Summary

This task implements internationalization for user preferences and security settings components in the FAQBNB application. The work involves creating new preferences and security settings pages that use the `settings.preferences.*`, `settings.notifications.*`, and `settings.security.*` namespaces established in Task 2G.1 (REQ-E02-013). This task covers language selection, theme preferences, timezone settings, notification preferences, and security features (2FA, active sessions).

**Current State:**
- LocaleContext exists (`/src/contexts/LocaleContext.tsx`) with full language switching functionality
- `setLocale()` function available for changing language (persists to database/localStorage)
- Supported languages: English, French, Spanish, German, Dutch, Italian
- `useDashboardPreferences` hook exists for dashboard-specific UI customization
- No dedicated preferences page or security settings page
- No theme switching functionality (light/dark mode)
- No timezone selection functionality
- No notification preferences UI
- No 2FA or session management UI
- Translation namespaces ready: `settings.preferences.*` (25 keys), `settings.notifications.*` (20 keys), `settings.security.*` (15 keys)

**Target State:**
- New preferences page at `/src/app/user/preferences/page.tsx`
- New security settings page at `/src/app/user/security/page.tsx` (optional - may combine with preferences)
- Language selector using LocaleContext's `setLocale()`
- Theme selector with light/dark/system modes
- Timezone selector (UI only for now)
- Notification preferences toggles
- 2FA enable/disable UI (UI only for now)
- Active sessions list and management (UI only for now)
- Use all translation keys from 3 namespaces (~60 keys total)

**Scope:**
- ~60 translation keys across 3 namespaces
- Create 1-2 new page components
- Create 5-7 section components
- Integrate with existing LocaleContext
- Create theme management system (localStorage-based)
- Client-side components using `useTranslations`

**Out of Scope:**
- Backend API for notification preferences (future work)
- Backend API for timezone storage (future work)
- Actual 2FA implementation (future work - only UI)
- Backend session management API (future work)
- Email notification delivery system (future work)
- Push notification system (future work)

---

## Goals

### Primary Objectives

1. **Create Preferences Page**
   - New page at `/src/app/user/preferences/page.tsx`
   - Language selector (integrates with LocaleContext)
   - Theme selector (light/dark/system)
   - Timezone selector (UI only)
   - Date/time format preferences
   - Use `settings.preferences.*` translations

2. **Implement Language Selector**
   - Dropdown showing all 6 supported languages
   - Current language highlighted
   - Change language using `setLocale()` from LocaleContext
   - Show success message: "Language updated to {language}"
   - Persist to database (authenticated users) or localStorage (guests)

3. **Implement Theme Selector**
   - Radio buttons or dropdown for theme options: Light, Dark, System
   - Apply theme immediately on selection
   - Persist to localStorage
   - Create ThemeProvider/useTheme hook
   - Add dark mode CSS classes to root element

4. **Implement Timezone Selector**
   - Dropdown with common timezones
   - Display current timezone (detect from browser)
   - Show success message: "Timezone updated to {timezone}"
   - UI only - no backend storage yet

5. **Create Notifications Settings Section**
   - Toggle switches for notification types:
     - Email notifications
     - Push notifications
     - Item updates
     - Property updates
     - System announcements
     - Weekly digest
   - Use `settings.notifications.*` translations
   - UI only - no backend storage yet

6. **Create Security Settings Page/Section**
   - Two-factor authentication toggle (UI only)
   - Active sessions list
   - "Revoke Session" buttons
   - "Revoke All Other Sessions" button
   - Use `settings.security.*` translations
   - UI only - no backend implementation yet

7. **Add Navigation Links**
   - Add "Preferences" link to user layout
   - Optionally add "Security" link (or combine with preferences)

### Success Criteria

- ✅ Preferences page accessible at `/user/preferences`
- ✅ Language selector working (changes app language)
- ✅ Theme selector working (switches light/dark mode)
- ✅ Timezone selector UI functional
- ✅ Notification toggles UI functional
- ✅ Security settings UI functional (2FA, sessions)
- ✅ All visible strings use translations
- ✅ Success messages displayed for changes
- ✅ No hardcoded English strings remain
- ✅ All interactive elements have aria-labels
- ✅ TypeScript compilation succeeds

---

## Technical Context

### Translation Namespaces

**1. `settings.preferences` (25 keys)** - From `/messages/en.json` lines 3440-3471:

```json
{
  "settings": {
    "preferences": {
      "title": "Preferences",
      "subtitle": "Customize your experience",
      "language": "Language",
      "languageDescription": "Choose your preferred language",
      "languageSelectorAriaLabel": "Select your preferred language",
      "languageUpdated": "Language updated to {language}",
      "supportedLanguages": {
        "en": "English",
        "fr": "Français",
        "es": "Español",
        "de": "Deutsch",
        "nl": "Nederlands",
        "it": "Italiano"
      },
      "theme": "Theme",
      "themeDescription": "Choose your preferred color theme",
      "themeSelectorAriaLabel": "Select your preferred theme",
      "themeUpdated": "Theme updated to {theme}",
      "themeOptions": {
        "light": "Light",
        "dark": "Dark",
        "system": "System"
      },
      "timezone": "Timezone",
      "timezoneDescription": "Set your timezone for accurate timestamps",
      "timezoneSelectorAriaLabel": "Select your timezone",
      "timezoneUpdated": "Timezone updated to {timezone}",
      "dateFormat": "Date Format",
      "timeFormat": "Time Format",
      "preferencesUpdated": "Preferences updated successfully"
    }
  }
}
```

**2. `settings.notifications` (20 keys)** - From `/messages/en.json` lines 3472-3490:

```json
{
  "settings": {
    "notifications": {
      "title": "Notifications",
      "subtitle": "Manage your notification preferences",
      "emailNotifications": "Email Notifications",
      "emailNotificationsDescription": "Receive updates via email",
      "pushNotifications": "Push Notifications",
      "pushNotificationsDescription": "Receive push notifications in your browser",
      "itemUpdates": "Item Updates",
      "itemUpdatesDescription": "Notify when items are updated",
      "propertyUpdates": "Property Updates",
      "propertyUpdatesDescription": "Notify when properties are updated",
      "systemAnnouncements": "System Announcements",
      "systemAnnouncementsDescription": "Important updates and announcements",
      "weeklyDigest": "Weekly Digest",
      "weeklyDigestDescription": "Receive a weekly summary of activity",
      "unreadCount": "{count, plural, =0 {No unread notifications} one {# unread notification} other {# unread notifications}}",
      "markAllRead": "Mark All as Read",
      "notificationsUpdated": "Notification preferences updated"
    }
  }
}
```

**3. `settings.security` (15 keys)** - From `/messages/en.json` lines 3491-3508:

```json
{
  "settings": {
    "security": {
      "title": "Security",
      "subtitle": "Manage your security settings",
      "twoFactorAuth": "Two-Factor Authentication",
      "twoFactorAuthDescription": "Add an extra layer of security",
      "enable2FA": "Enable 2FA",
      "disable2FA": "Disable 2FA",
      "twoFactorEnabled": "Two-factor authentication enabled",
      "twoFactorDisabled": "Two-factor authentication disabled",
      "activeSessions": "Active Sessions",
      "activeSessionsDescription": "Manage your active login sessions",
      "sessionsActive": "{count, plural, one {# active session} other {# active sessions}}",
      "revokeSession": "Revoke Session",
      "revokeAllOther": "Revoke All Other Sessions",
      "currentDevice": "Current Device",
      "lastActive": "Last active: {date}",
      "securityUpdated": "Security settings updated"
    }
  }
}
```

**Total Keys:** ~60 across 3 namespaces

### Existing LocaleContext

**File:** `/src/contexts/LocaleContext.tsx` (REQ-250, created 2026-01-18)

**Key Features:**
- Type: `SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
- Supported locales with metadata: `SUPPORTED_LOCALES` array
- `setLocale(locale)` function - Changes language and persists
- Persistence: Database (authenticated users) or localStorage (guests)
- Cookie integration: Sets `FAQBNB_LANG` cookie
- Loading states and error handling

**Hook Usage:**
```tsx
import { useLocale } from '@/contexts/LocaleContext';

const { locale, setLocale, supportedLocales, getLocaleName } = useLocale();

// Change language
const result = await setLocale('fr');
console.log(result.success); // true
console.log(result.persistedTo); // 'database' or 'localStorage'
```

**Available Data:**
- `locale` - Current language code ('en', 'fr', etc.)
- `supportedLocales` - Array of LocaleOption objects
- `setLocale()` - Async function to change language
- `getLocaleName()` - Get language name (English or native)
- `isLocaleSupported()` - Check if language code is valid
- `persistenceMethod` - Where current locale is stored

### Existing Dashboard Preferences

**File:** `/src/hooks/useDashboardPreferences.ts`

**Current Features:**
- Dashboard-specific UI customization
- Preferences: `forceAdvancedTools`, `forcePortfolioView`
- localStorage-based persistence
- Used by DashboardSettingsPopover

**Note:** This is different from general user preferences - it's UI-specific customization for the dashboard view only.

### Theme System Requirements

**Need to Create:**
- ThemeProvider context
- useTheme hook
- Theme storage in localStorage (key: `faqbnb_theme`)
- Theme application to root HTML element
- CSS variables or Tailwind dark mode
- System theme detection (prefers-color-scheme media query)

**Implementation Pattern:**
```tsx
// ThemeContext.tsx
type Theme = 'light' | 'dark' | 'system';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    const effectiveTheme = getEffectiveTheme(theme);
    root.classList.toggle('dark', effectiveTheme === 'dark');
  }, [theme]);

  // ...
}
```

### Component Patterns to Follow

**Pattern 1: Preferences Page with Sections**
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function PreferencesPage() {
  const t = useTranslations('settings.preferences');
  const tNotif = useTranslations('settings.notifications');
  const tSec = useTranslations('settings.security');

  return (
    <div className="max-w-3xl mx-auto">
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>

      <LanguageSection />
      <ThemeSection />
      <TimezoneSection />
      <NotificationsSection />
      <SecuritySection />
    </div>
  );
}
```

**Pattern 2: Language Selector with LocaleContext**
```tsx
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslations } from 'next-intl';

function LanguageSelector() {
  const t = useTranslations('settings.preferences');
  const { locale, setLocale, supportedLocales } = useLocale();
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = async (newLocale: SupportedLanguage) => {
    setLoading(true);
    const result = await setLocale(newLocale);
    if (result.success) {
      // Show success message
      setSuccess(t('languageUpdated', { language: result.locale }));
    }
    setLoading(false);
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
      aria-label={t('languageSelectorAriaLabel')}
    >
      {supportedLocales.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

**Pattern 3: Toggle Switch Component**
```tsx
function NotificationToggle({ type, enabled, onChange }) {
  const t = useTranslations('settings.notifications');

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <label className="font-medium">{t(type)}</label>
        <p className="text-sm text-gray-600">{t(`${type}Description`)}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
```

---

## Implementation Plan

### Step 1: Create Theme Context and Provider
**Description:** Implement theme management system (light/dark/system modes)
**Rationale:** Foundation for theme switching feature
**Estimated Effort:** Medium (2-3 hours)

**Implementation Details:**
- Create new file: `/src/contexts/ThemeContext.tsx`
- Theme type: `'light' | 'dark' | 'system'`
- Detect system theme using `matchMedia('(prefers-color-scheme: dark)')`
- Store theme preference in localStorage (key: `faqbnb_theme`)
- Apply theme to root HTML element via `dark` class
- Listen for system theme changes
- Provide `useTheme()` hook

**Theme Context Structure:**
```tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('faqbnb_theme') as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange(); // Initial check

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply effective theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', effectiveTheme === 'dark');
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('faqbnb_theme', newTheme);

    // Calculate effective theme immediately
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEffectiveTheme(isDark ? 'dark' : 'light');
    } else {
      setEffectiveTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

**Integration:**
- Wrap app in ThemeProvider (add to root layout or app component)
- Update Tailwind config to enable dark mode: `darkMode: 'class'`

---

### Step 2: Create Preferences Page Component
**Description:** Main preferences page with all settings sections
**Rationale:** Foundation for all preference settings UI
**Estimated Effort:** Small (1-2 hours)

**Implementation Details:**
- Create new file: `/src/app/user/preferences/page.tsx`
- Client-side component (`'use client'`)
- Use multiple translation namespaces:
  - `useTranslations('settings.preferences')`
  - `useTranslations('settings.notifications')`
  - `useTranslations('settings.security')`
- Page structure:
  - Header with title and subtitle
  - Language section
  - Theme section
  - Timezone section
  - Notifications section (optional - may go on separate page)
  - Security section (optional - may go on separate page)
- Style with Tailwind CSS (match existing pages)

**Component Structure:**
```tsx
'use client';

import { useTranslations } from 'next-intl';
import LanguageSection from '@/components/settings/LanguageSection';
import ThemeSection from '@/components/settings/ThemeSection';
import TimezoneSection from '@/components/settings/TimezoneSection';

export default function PreferencesPage() {
  const t = useTranslations('settings.preferences');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <LanguageSection />
        <ThemeSection />
        <TimezoneSection />
      </div>
    </div>
  );
}
```

---

### Step 3: Implement Language Selector Section
**Description:** Language selection dropdown using LocaleContext
**Rationale:** Core preference feature, integrates with existing i18n system
**Estimated Effort:** Medium (2 hours)

**Implementation Details:**
- Create component: `LanguageSection` (inline or separate file)
- Use `useLocale()` hook from LocaleContext
- Dropdown or radio buttons showing all 6 languages
- Display language names in native form (Français, Español, etc.)
- Show current language as selected
- Handle language change:
  ```tsx
  const result = await setLocale(newLocale);
  if (result.success) {
    setSuccess(t('languageUpdated', { language: getLocaleName(newLocale, true) }));
  }
  ```
- Show loading state while changing
- Display success message with ICU format

**Component Structure:**
```tsx
function LanguageSection() {
  const t = useTranslations('settings.preferences');
  const { locale, setLocale, supportedLocales, getLocaleName } = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = async (newLocale: SupportedLanguage) => {
    setLoading(true);
    setSuccess(null);

    const result = await setLocale(newLocale);

    if (result.success) {
      const langName = getLocaleName(newLocale, true); // Use native name
      setSuccess(t('languageUpdated', { language: langName }));
      setTimeout(() => setSuccess(null), 3000);
    }

    setLoading(false);
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">{t('language')}</h2>
      <p className="text-sm text-gray-600 mb-4">{t('languageDescription')}</p>

      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as SupportedLanguage)}
        disabled={loading}
        aria-label={t('languageSelectorAriaLabel')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        {supportedLocales.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>

      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
    </section>
  );
}
```

**Key Translations:**
- `t('language')` - Section title
- `t('languageDescription')` - Description text
- `t('languageSelectorAriaLabel')` - Dropdown aria-label
- `t('languageUpdated', { language })` - Success message
- `t('supportedLanguages.{code}')` - Language names (if not using LocaleContext)

---

### Step 4: Implement Theme Selector Section
**Description:** Theme selection (light/dark/system) using ThemeContext
**Rationale:** Modern UX feature, accessibility benefit
**Estimated Effort:** Medium (2 hours)

**Implementation Details:**
- Create component: `ThemeSection`
- Use `useTheme()` hook from ThemeContext (Step 1)
- Radio buttons or dropdown for 3 options: Light, Dark, System
- Show current theme as selected
- Handle theme change:
  ```tsx
  setTheme(newTheme);
  setSuccess(t('themeUpdated', { theme: t(`themeOptions.${newTheme}`) }));
  ```
- Apply theme immediately (ThemeContext handles this)
- Display success message

**Component Structure:**
```tsx
function ThemeSection() {
  const t = useTranslations('settings.preferences');
  const { theme, setTheme } = useTheme();
  const [success, setSuccess] = useState<string | null>(null);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    const themeName = t(`themeOptions.${newTheme}`);
    setSuccess(t('themeUpdated', { theme: themeName }));
    setTimeout(() => setSuccess(null), 3000);
  };

  const themes: Theme[] = ['light', 'dark', 'system'];

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">{t('theme')}</h2>
      <p className="text-sm text-gray-600 mb-4">{t('themeDescription')}</p>

      <div className="space-y-2" role="radiogroup" aria-label={t('themeSelectorAriaLabel')}>
        {themes.map((themeOption) => (
          <label
            key={themeOption}
            className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="theme"
              value={themeOption}
              checked={theme === themeOption}
              onChange={() => handleThemeChange(themeOption)}
              className="mr-3"
            />
            <span>{t(`themeOptions.${themeOption}`)}</span>
          </label>
        ))}
      </div>

      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
    </section>
  );
}
```

**Key Translations:**
- `t('theme')` - Section title
- `t('themeDescription')` - Description text
- `t('themeSelectorAriaLabel')` - Radio group aria-label
- `t('themeOptions.light')` - "Light"
- `t('themeOptions.dark')` - "Dark"
- `t('themeOptions.system')` - "System"
- `t('themeUpdated', { theme })` - Success message

---

### Step 5: Implement Timezone Selector Section
**Description:** Timezone selection dropdown (UI only, no backend storage)
**Rationale:** User preference for time display
**Estimated Effort:** Medium (2 hours)

**Implementation Details:**
- Create component: `TimezoneSection`
- Detect current timezone using `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Dropdown with common timezones (or all IANA timezones)
- Show current timezone as selected
- Store selected timezone in component state (no persistence yet)
- Display success message on change
- UI only - no API call to save timezone

**Timezone List (Common Timezones):**
```tsx
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  // ... more timezones
];
```

**Component Structure:**
```tsx
function TimezoneSection() {
  const t = useTranslations('settings.preferences');
  const [timezone, setTimezone] = useState(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    // Future: API call to save timezone
    setSuccess(t('timezoneUpdated', { timezone: newTimezone }));
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">{t('timezone')}</h2>
      <p className="text-sm text-gray-600 mb-4">{t('timezoneDescription')}</p>

      <select
        value={timezone}
        onChange={(e) => handleTimezoneChange(e.target.value)}
        aria-label={t('timezoneSelectorAriaLabel')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>

      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
    </section>
  );
}
```

**Key Translations:**
- `t('timezone')` - Section title
- `t('timezoneDescription')` - Description text
- `t('timezoneSelectorAriaLabel')` - Dropdown aria-label
- `t('timezoneUpdated', { timezone })` - Success message

---

### Step 6: Implement Notification Preferences Section
**Description:** Toggle switches for notification types
**Rationale:** User control over notification delivery
**Estimated Effort:** Medium (2-3 hours)

**Implementation Details:**
- Create component: `NotificationsSection`
- Use `useTranslations('settings.notifications')`
- Toggle switches for each notification type:
  - Email notifications
  - Push notifications (future feature)
  - Item updates
  - Property updates
  - System announcements
  - Weekly digest
- Store state in local component state (no backend yet)
- Display success message on change
- Accessible toggle switches (role="switch", aria-checked)

**Component Structure:**
```tsx
function NotificationsSection() {
  const t = useTranslations('settings.notifications');
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    itemUpdates: true,
    propertyUpdates: true,
    systemAnnouncements: true,
    weeklyDigest: false,
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    // Future: API call to save preferences
    setSuccess(t('notificationsUpdated'));
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
      <p className="text-sm text-gray-600 mb-4">{t('subtitle')}</p>

      <div className="space-y-4">
        {(Object.keys(preferences) as Array<keyof typeof preferences>).map((key) => (
          <NotificationToggle
            key={key}
            label={t(key)}
            description={t(`${key}Description`)}
            checked={preferences[key]}
            onChange={() => handleToggle(key)}
          />
        ))}
      </div>

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
    </section>
  );
}

function NotificationToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
```

**Key Translations:**
- `t('title')` - "Notifications"
- `t('subtitle')` - Description
- `t('emailNotifications')` - Label
- `t('emailNotificationsDescription')` - Description
- (Similar for all notification types)
- `t('notificationsUpdated')` - Success message

---

### Step 7: Implement Security Settings Section
**Description:** 2FA toggle and active sessions management
**Rationale:** Security control for users
**Estimated Effort:** Medium (3 hours)

**Implementation Details:**
- Create component: `SecuritySection` (or separate page)
- Use `useTranslations('settings.security')`
- Two-factor authentication:
  - Toggle switch to enable/disable 2FA
  - UI only - no actual 2FA implementation yet
  - Show success messages
- Active sessions:
  - Mock session data (future: load from API)
  - List of sessions with device info, location, last active time
  - "Revoke Session" button for each session
  - "Revoke All Other Sessions" button
  - Show current session indicator

**Component Structure:**
```tsx
function SecuritySection() {
  const t = useTranslations('settings.security');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome on MacOS', location: 'San Francisco, CA', lastActive: '2026-01-22', isCurrent: true },
    { id: '2', device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2026-01-20', isCurrent: false },
  ]);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    const message = !twoFactorEnabled ? t('twoFactorEnabled') : t('twoFactorDisabled');
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSuccess(t('securityUpdated'));
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRevokeAll = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setSuccess(t('securityUpdated'));
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>

      {/* 2FA Section */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">{t('twoFactorAuth')}</h3>
        <p className="text-sm text-gray-600 mb-3">{t('twoFactorAuthDescription')}</p>
        <button
          onClick={handleToggle2FA}
          className={`px-4 py-2 rounded-md ${
            twoFactorEnabled ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          {twoFactorEnabled ? t('disable2FA') : t('enable2FA')}
        </button>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="font-medium mb-2">{t('activeSessions')}</h3>
        <p className="text-sm text-gray-600 mb-3">{t('activeSessionsDescription')}</p>
        <p className="text-sm text-gray-500 mb-4">
          {t('sessionsActive', { count: sessions.length })}
        </p>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <div className="font-medium">
                  {session.device}
                  {session.isCurrent && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                      {t('currentDevice')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{session.location}</div>
                <div className="text-sm text-gray-500">
                  {t('lastActive', { date: session.lastActive })}
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  {t('revokeSession')}
                </button>
              )}
            </div>
          ))}
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="mt-4 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            {t('revokeAllOther')}
          </button>
        )}
      </div>

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
    </section>
  );
}
```

**Key Translations:**
- `t('title')` - "Security"
- `t('twoFactorAuth')` - Section title
- `t('twoFactorAuthDescription')` - Description
- `t('enable2FA')` / `t('disable2FA')` - Button text
- `t('twoFactorEnabled')` / `t('twoFactorDisabled')` - Success messages
- `t('activeSessions')` - Section title
- `t('sessionsActive', { count })` - ICU plural
- `t('revokeSession')` - Button text
- `t('revokeAllOther')` - Button text
- `t('currentDevice')` - Badge text
- `t('lastActive', { date })` - ICU format

---

### Step 8: Add Navigation Links
**Description:** Add "Preferences" and optionally "Security" links to user layout
**Rationale:** Users need to discover settings pages
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
- Update file: `/src/app/user/layout.tsx`
- Add navigation items to `navigationItems` array
- Insert after "Profile", before "Admin Panel"
- Use appropriate icons (⚙️ for preferences, 🔒 for security)

**Code Change:**
```tsx
const navigationItems = [
  { name: 'Dashboard', href: '/user', icon: '📊' },
  { name: 'Items', href: '/user/items', icon: '📦' },
  { name: 'Properties', href: '/user/properties', icon: '🏠' },
  { name: 'Analytics', href: '/user/analytics', icon: '📈' },
  { name: t('settings.profile.title'), href: '/user/profile', icon: '👤' }, // From Task 2G.3
  { name: t('settings.preferences.title'), href: '/user/preferences', icon: '⚙️' }, // NEW
  { name: t('settings.account.title'), href: '/user/account', icon: '👤' }, // From Task 2G.2
  ...(isAdmin ? [{ name: 'Admin Panel', href: '/admin', icon: '👑' }] : [])
];
```

**Alternative:** Combine all settings under one "Settings" menu item that shows sub-navigation on the settings pages.

---

### Step 9: Integrate ThemeProvider into App
**Description:** Wrap app with ThemeProvider to enable theme switching
**Rationale:** Makes theme context available to all components
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
- Find root layout or app wrapper component
- Import and add ThemeProvider
- Ensure ThemeProvider wraps the entire app
- Update Tailwind config for dark mode

**Root Layout Update:**
```tsx
// src/app/layout.tsx or similar
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LocaleProvider } from '@/contexts/LocaleContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
```

**Tailwind Config Update:**
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
};
```

---

### Step 10: Testing and Validation
**Description:** Manual testing of all preferences and security features
**Rationale:** Ensure all functionality works correctly
**Estimated Effort:** Medium (2-3 hours)

**Testing Checklist:**
- [ ] Preferences page loads at `/user/preferences`
- [ ] All text displays in current language
- [ ] Language selector shows all 6 languages
- [ ] Changing language works (app language updates)
- [ ] Language change success message displays
- [ ] Language persists after page reload
- [ ] Theme selector shows 3 options (light/dark/system)
- [ ] Changing theme works (UI updates immediately)
- [ ] Theme persists after page reload
- [ ] System theme option follows OS preference
- [ ] Dark mode CSS applies correctly
- [ ] Timezone selector shows timezones
- [ ] Timezone change shows success message
- [ ] Notification toggles work (on/off)
- [ ] Notification preferences show success message
- [ ] Security section displays
- [ ] 2FA toggle works (shows success messages)
- [ ] Active sessions list displays
- [ ] Revoke session button works
- [ ] "Revoke all other sessions" works
- [ ] Navigation includes "Preferences" link
- [ ] Preferences link highlights when on page
- [ ] All aria-labels present
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds
- [ ] Page is responsive (mobile, tablet, desktop)

**Translation Validation:**
- [ ] All keys from 3 namespaces used (~60 keys)
- [ ] ICU format works (language names, session counts, dates)
- [ ] No hardcoded English strings remain

**Accessibility Testing:**
- [ ] Tab through all form elements
- [ ] Screen reader announces correctly
- [ ] Toggle switches have proper ARIA attributes
- [ ] All interactive elements have visible focus states

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create

| File | Purpose | Type |
|------|---------|------|
| `/src/contexts/ThemeContext.tsx` | Theme management context and provider | Create |
| `/src/app/user/preferences/page.tsx` | Main preferences page | Create |
| `/src/components/settings/LanguageSection.tsx` | Language selector component (optional separate file) | Create |
| `/src/components/settings/ThemeSection.tsx` | Theme selector component (optional) | Create |
| `/src/components/settings/TimezoneSection.tsx` | Timezone selector component (optional) | Create |
| `/src/components/settings/NotificationsSection.tsx` | Notification preferences component (optional) | Create |
| `/src/components/settings/SecuritySection.tsx` | Security settings component (optional) | Create |

**Note:** Section components can be inline in the page or separate files depending on complexity.

### Existing Files to Modify

#### User Layout (Navigation)

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `/src/app/user/layout.tsx` | 1-20 | Imports | Add `useTranslations` import (if not already present) |
| `/src/app/user/layout.tsx` | 92-99 | `navigationItems` array | Add preferences navigation item |

#### Root Layout (Theme Provider)

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `/src/app/layout.tsx` | TBD | Root component | Wrap with ThemeProvider |

#### Tailwind Configuration

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `tailwind.config.js` | TBD | Config object | Add `darkMode: 'class'` |

#### Translation Files (Reference Only)

| File | Lines | Purpose | Modification |
|------|-------|---------|--------------|
| `/messages/en.json` | 3440-3471 | Preferences translations | Reference (already created in Task 2G.1) |
| `/messages/en.json` | 3472-3490 | Notifications translations | Reference (already created) |
| `/messages/en.json` | 3491-3508 | Security translations | Reference (already created) |
| All non-English files | ~3440-3508 | Placeholders | Reference (translations in Task 2G.6) |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-013** (Task 2G.1): Create `settings` namespace structure
  - **Status:** MUST be completed first
  - **Provides:** Translation keys for preferences, notifications, security (~60 keys)
  - **Reason:** Cannot use translations that don't exist yet

- **REQ-250**: Create LocaleContext
  - **Status:** Completed (2026-01-18)
  - **Provides:** Language switching functionality, `setLocale()` function, supported locales list
  - **Reason:** Language selector depends on this context

- **Epic 1 - L10N Foundation**
  - **Status:** Completed
  - **Provides:** next-intl setup, useTranslations hook, translation file structure
  - **Reason:** Core i18n infrastructure required

### Blocks (Requires This First)

- **REQ-E02-089** (Task 2G.6): Generate translations for 5 non-English languages
  - **Status:** Blocked until this task completes
  - **Reason:** Need to see preferences UI in context before translating
  - **Files:** All non-English translation files

### Parallel Safety

**Files Modified by This Task:**
- `/src/contexts/ThemeContext.tsx` (new file)
- `/src/app/user/preferences/page.tsx` (new file)
- `/src/app/user/layout.tsx` (navigation array)
- `/src/app/layout.tsx` (ThemeProvider wrapper)
- `tailwind.config.js` (dark mode config)

**Conflicts With:**
- **Task 2G.2** (Account settings) - Also modifies `/src/app/user/layout.tsx` navigation
  - **Resolution:** Both add navigation items to same array
  - **Safe to parallelize:** NO (merge conflict likely)

- **Task 2G.3** (Profile) - Also modifies `/src/app/user/layout.tsx` navigation
  - **Resolution:** Both add navigation items to same array
  - **Safe to parallelize:** NO

- **Task 2G.5** (Help page) - Modifies `/src/app/dashboard2/help/page.tsx`
  - **Resolution:** Different files, no conflicts
  - **Safe to parallelize:** YES

**Recommended Execution Order:**
1. Task 2G.2 (Account settings) - First
2. Task 2G.3 (Profile) - Second
3. **Task 2G.4 (Preferences)** - Third ← This task
4. Task 2G.5 (Help page) - Can run in parallel with 2G.2-2G.4

**Safe to Parallelize With:**
- Task 2G.5 (Help page) - Different files

### External Dependencies

- **next-intl library** - Translation hook
- **React hooks** - useState, useEffect, useContext
- **LocaleContext** - Existing context for language switching
- **Tailwind CSS** - Styling and dark mode
- **Next.js App Router** - Page routing
- **Browser APIs:**
  - `localStorage` - Theme and preferences storage
  - `matchMedia` - System theme detection
  - `Intl.DateTimeFormat` - Timezone detection

---

## Risks and Considerations

### Potential Side Effects

1. **User Layout Navigation Conflicts**
   - **Risk:** Multiple tasks adding navigation items
   - **Mitigation:** Sequential execution (2G.2 → 2G.3 → 2G.4)
   - **Impact:** Medium (merge conflicts)

2. **Theme Switching Without Dark Mode CSS**
   - **Risk:** Dark mode enabled but no dark styles defined
   - **Mitigation:** Add basic dark mode styles to key components, OR disable theme selector until styles ready
   - **Impact:** High (poor UX)

3. **Language Change Causing Layout Shift**
   - **Risk:** Text length changes between languages cause layout issues
   - **Mitigation:** Test with longest language (German typically has long words), use flexible layouts
   - **Impact:** Medium (UI jank)

4. **Preferences Without Backend Storage**
   - **Risk:** Users expect preferences to persist server-side
   - **Mitigation:** Show clear messaging that some features are "coming soon", OR disable until backend ready
   - **Impact:** Medium (UX confusion)

5. **Security Features Without Implementation**
   - **Risk:** Users expect 2FA to actually secure their account
   - **Mitigation:** Show warning that feature is preview/demo only, OR hide until backend ready
   - **Impact:** High (security misunderstanding)

### Testing Requirements

1. **Language Switching Testing**
   - Test switching between all 6 languages
   - Verify persistence (reload page, check language maintained)
   - Test authenticated vs. guest user (database vs. localStorage)
   - Check LocaleContext integration

2. **Theme Switching Testing**
   - Test light mode appearance
   - Test dark mode appearance (if CSS ready)
   - Test system theme mode (change OS preference, verify app follows)
   - Test persistence (reload page, theme maintained)
   - Test theme class applied to root element

3. **Timezone Testing**
   - Test timezone detection (current timezone displays correctly)
   - Test timezone selection (dropdown shows common timezones)
   - Test success message display

4. **Notification Toggles Testing**
   - Test each toggle works (on/off)
   - Test visual states (enabled/disabled)
   - Test accessibility (role="switch", aria-checked)

5. **Security Testing**
   - Test 2FA toggle (on/off)
   - Test sessions list displays
   - Test revoke session button
   - Test "revoke all" button
   - Verify current session can't be revoked

6. **Responsive Design Testing**
   - Test on mobile (320px, 375px, 414px width)
   - Test on tablet (768px, 1024px width)
   - Test on desktop (1280px, 1920px width)
   - Verify sections stack appropriately
   - Test toggle switches on touch devices

### Open Questions

1. **Dark Mode CSS Coverage**
   - [ ] Do we have dark mode styles for existing components?
   - [ ] Should we implement dark mode CSS in this task or defer?
   - **Recommendation:** Basic dark mode styles for preferences page, defer full dark mode to future epic

2. **Separate Security Page or Combined?**
   - [ ] Should security settings be on separate page at `/user/security`?
   - [ ] Or combined with preferences page as sections?
   - **Recommendation:** Combined for now (fewer navigation items), separate later if grows large

3. **Notification Preferences Backend**
   - [ ] When will backend API for notification preferences be implemented?
   - [ ] Should we disable toggles or show them as preview?
   - **Recommendation:** Show toggles, add "Preview" or "Coming soon" badge

4. **2FA Implementation Timeline**
   - [ ] When will actual 2FA be implemented?
   - [ ] Should we hide 2FA section until backend ready?
   - **Recommendation:** Show section with clear "Preview" indicator, OR hide until backend ready

5. **Timezone Storage**
   - [ ] Where should timezone be stored? User table? Separate preferences table?
   - [ ] Should timezone affect date displays immediately?
   - **Recommendation:** UI only for now, database migration in future task

6. **Theme Persistence for Guests**
   - [ ] Should guest users' theme preference persist?
   - [ ] Use localStorage only or also cookies?
   - **Recommendation:** localStorage is sufficient for guests

---

## Out of Scope

The following items are explicitly **NOT** included in this task:

### Backend Implementation
- Notification preferences API endpoint
- Timezone storage in database
- Two-factor authentication logic (TOTP, backup codes)
- Session management API (active sessions list, revoke)
- Email notification delivery system
- Push notification system
- Security event logging

### Advanced Preference Features
- Custom date/time format selection
- Number format preferences (commas vs. periods)
- First day of week preference
- Calendar system preference (Gregorian, Hijri, etc.)
- Accessibility preferences (font size, motion reduction)

### Advanced Theme Features
- Custom color schemes
- Multiple theme variants (light blue, dark purple, etc.)
- Theme preview before applying
- Scheduled theme switching (auto dark mode at night)
- Per-component theme overrides

### Advanced Security Features
- Actual 2FA implementation (TOTP generation, QR codes, backup codes)
- WebAuthn / passkeys support
- Security keys (YubiKey, etc.)
- Trusted devices management
- Login history / audit log
- Suspicious activity detection
- Account recovery options

### Notification Features
- In-app notification center
- Notification delivery (email sending)
- Push notification registration
- Notification preferences per notification type
- Quiet hours / do not disturb
- Notification batching / digest

### Multi-Language Translation
- French translations - Task 2G.6
- Spanish translations - Task 2G.6
- German translations - Task 2G.6
- Dutch translations - Task 2G.6
- Italian translations - Task 2G.6

---

## Success Metrics

### Quantitative Metrics

1. **Translation Coverage**
   - Target: 100% of preferences strings use translations
   - Measurement: Manual inspection, no hardcoded strings

2. **Translation Key Usage**
   - Target: Use all ~60 keys from 3 namespaces
   - Measurement: Count keys referenced vs. available

3. **Theme Switching Performance**
   - Target: < 100ms to apply theme
   - Measurement: Measure time from setTheme() to DOM update

4. **Language Switching Performance**
   - Target: < 500ms to change language
   - Measurement: Time from setLocale() to UI update

5. **TypeScript Compilation**
   - Target: 0 compilation errors
   - Measurement: `npm run typecheck` exit code

### Qualitative Metrics

1. **Code Quality**
   - Consistent with existing patterns
   - Proper TypeScript typing
   - Clean, readable code
   - Follows project conventions

2. **User Experience**
   - Preferences intuitive to find and use
   - Immediate feedback on changes
   - Clear success messages
   - Settings persist correctly

3. **Accessibility**
   - Keyboard navigation smooth
   - Screen readers announce correctly
   - Toggle switches accessible
   - Visual focus indicators clear

4. **Design Consistency**
   - Styling matches existing pages
   - Component patterns follow conventions
   - Translation usage matches other components

---

## Notes and Context

### Design Rationale

1. **Why Create Theme System?**
   - Modern UX expectation
   - Accessibility benefit (dark mode easier on eyes)
   - Demonstrates advanced preference management
   - Foundation for future theming features

2. **Why Integrate with Existing LocaleContext?**
   - Avoid duplicating language switching logic
   - Leverage existing persistence (database + localStorage)
   - Consistent with existing i18n system
   - Reduces implementation complexity

3. **Why UI-Only for Some Features?**
   - Focus of Epic 2 is internationalization
   - Backend APIs can be added incrementally
   - Demonstrates translation patterns clearly
   - Allows frontend and backend development in parallel

4. **Why Combine Preferences and Security?**
   - Related settings (both user configuration)
   - Fewer navigation items (cleaner UI)
   - Can separate later if sections grow large
   - Common pattern in settings pages

### Historical Context

- **Epic 1 (L10N Foundation):** Established next-intl setup
- **REQ-250 (2026-01-18):** Created LocaleContext with language switching
- **Sub-Epics 2A-2F:** Translated 260+ components
- **Task 2G.1 (REQ-E02-013):** Created settings namespace with 150 keys
- **Tasks 2G.2-2G.3:** Created account and profile pages
- **Current Task (2G.4):** Preferences and security settings

### Future Considerations

1. **Backend Integration**
   - Preferences API: `/api/user/preferences` (GET, PUT)
   - Notification preferences API: `/api/user/notifications` (GET, PUT)
   - 2FA API: `/api/user/2fa` (POST enable/disable, GET status)
   - Sessions API: `/api/user/sessions` (GET list, DELETE revoke)

2. **Enhanced Features**
   - In-app notification center (bell icon in header)
   - Email digest preview (before enabling weekly digest)
   - 2FA setup wizard (QR code, backup codes)
   - Security recommendations (based on account age, activity)
   - Preference import/export (for account migration)

3. **Theme Enhancements**
   - Custom color accent selection
   - Multiple theme presets
   - Automatic theme switching (schedule)
   - High contrast mode (accessibility)
   - Theme sync across devices

4. **Advanced Preferences**
   - Regional settings (currency, units)
   - Accessibility settings (font size, motion)
   - Privacy settings (data collection, analytics)
   - API keys management (for developers)
   - Webhook configuration

### Related Documentation

- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md (lines 1099-1171)
- **Sub-Epic 2G Overview:** REQ-E02-013 (Task 2G.1)
- **Account Settings:** REQ-E02-014 (Task 2G.2)
- **Profile:** REQ-E02-015 (Task 2G.3)
- **LocaleContext:** REQ-250 (created 2026-01-18)
- **Translation Files:** `/messages/*.json`
- **User Layout:** `/src/app/user/layout.tsx`

---

## Appendix

### A. Complete Translation Keys Summary

**Preferences (25 keys):**
- title, subtitle
- language, languageDescription, languageSelectorAriaLabel, languageUpdated
- supportedLanguages.* (6 languages)
- theme, themeDescription, themeSelectorAriaLabel, themeUpdated
- themeOptions.* (3 options)
- timezone, timezoneDescription, timezoneSelectorAriaLabel, timezoneUpdated
- dateFormat, timeFormat
- preferencesUpdated

**Notifications (20 keys):**
- title, subtitle
- emailNotifications, emailNotificationsDescription
- pushNotifications, pushNotificationsDescription
- itemUpdates, itemUpdatesDescription
- propertyUpdates, propertyUpdatesDescription
- systemAnnouncements, systemAnnouncementsDescription
- weeklyDigest, weeklyDigestDescription
- unreadCount (ICU plural)
- markAllRead
- notificationsUpdated

**Security (15 keys):**
- title, subtitle
- twoFactorAuth, twoFactorAuthDescription
- enable2FA, disable2FA
- twoFactorEnabled, twoFactorDisabled
- activeSessions, activeSessionsDescription
- sessionsActive (ICU plural)
- revokeSession, revokeAllOther
- currentDevice
- lastActive (ICU format)
- securityUpdated

**Total:** ~60 keys

### B. Theme Context Implementation

**Full ThemeContext.tsx structure:**

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'faqbnb_theme';

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  // Calculate and apply effective theme
  useEffect(() => {
    const newEffective = theme === 'system' ? getSystemTheme() : theme;
    setEffectiveTheme(newEffective);

    // Apply to DOM
    const root = document.documentElement;
    root.classList.toggle('dark', newEffective === 'dark');
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### C. Common Timezones List

```typescript
export const COMMON_TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/4' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/5' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/6' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/7' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9/8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: 'UTC-10' },

  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/1' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 'UTC+1/2' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 'UTC+1/2' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: 'UTC+1/2' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)', offset: 'UTC+1/2' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)', offset: 'UTC+1/2' },

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Shanghai', label: 'China (CST)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 'UTC+9' },

  // Oceania
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 'UTC+11/10' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT/AEST)', offset: 'UTC+11/10' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)', offset: 'UTC+13/12' },
];
```

### D. Toggle Switch Component (Reusable)

```tsx
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, label, description, disabled }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        {description && <div className="text-sm text-gray-600">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
```

---

**End of Document**

---

*Document generated: 2026-01-22 21:46*
