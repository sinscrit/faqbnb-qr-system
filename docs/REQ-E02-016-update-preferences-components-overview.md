# REQ-E02-016: Update Preferences Components with Localized Strings

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-016
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2G (Settings & Account)
**Task ID:** 2G.4
**Size:** M (Medium)
**Priority:** P1

---

## 1. Summary

This task updates all user preference components to display user-facing text using localized translation references instead of hardcoded English strings. The scope includes notification preferences, display preferences, language preferences, customization settings, and dashboard preferences. All hardcoded strings will be extracted to the `settings.preferences` namespace within the i18n message bundle and replaced with `useTranslations` hook references.

---

## 2. Background & Context

### 2.1 Current State

Preference components throughout the application contain hardcoded English strings for:
- Section headings and preference category labels
- Toggle labels and checkbox labels
- Option descriptions and helper text explaining each preference
- Dropdown labels and option text
- Loading states and switching indicators
- Impact warnings and informational messages about preference changes

Key components with hardcoded strings include:
- `DashboardSettingsPopover` - Dashboard UI preferences with toggle switches
- `LanguageSwitcher` - Language selection dropdown with locale options
- `useLanguagePreference` hook - Contains error messages and state indicators
- `LocaleContext` - Contains console log messages (not user-facing, but comments/errors)

### 2.2 Target State

After implementation:
- All preference components retrieve display text from the i18n translation system using `useTranslations` hook
- Toggle labels, option descriptions, and helper text render in the user's selected language
- When language preferences change, all preference text updates to match the new locale
- No hardcoded English text remains in any preference component
- Dropdown menus display correctly with translated option text
- Preference changes save correctly regardless of displayed language

### 2.3 Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| Epic 1 i18n Foundation | Required | `next-intl` package installed |
| Task 2G.1 `settings` namespace structure | Prerequisite | `/messages/en.json` |
| Task 2G.2 Account Settings (partial overlap) | Related | REQ-E02-014 |
| `useTranslations` hook | Available | `next-intl` |

---

## 3. Requirements Analysis

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Dashboard preferences components use i18n settings.preferences.dashboard namespace | Must Have |
| FR-2 | Language preference components use i18n settings.preferences.language namespace | Must Have |
| FR-3 | Display preference components use i18n settings.preferences.display namespace | Should Have |
| FR-4 | Notification preference components use i18n settings.preferences.notifications namespace | Should Have |
| FR-5 | All toggle/checkbox labels are extracted to translation keys | Must Have |
| FR-6 | All option descriptions and helper text are translated | Must Have |
| FR-7 | Loading states and status indicators are translated | Must Have |
| FR-8 | Dynamic content (language names, counts) properly interpolates | Must Have |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | Layout remains stable across all supported languages | Must Have |
| NFR-2 | Component text updates without page refresh on language change | Should Have |
| NFR-3 | Toggle states and option selections maintain proper functionality | Must Have |
| NFR-4 | Existing component functionality remains unchanged | Must Have |
| NFR-5 | Helper text maintains appropriate tone and clarity across languages | Must Have |

---

## 4. Components Analysis

### 4.1 Component Inventory

| Component | File Path | Est. Strings | Complexity |
|-----------|-----------|--------------|------------|
| DashboardSettingsPopover | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | ~12 | Low |
| LanguageSwitcher | `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | ~10 | Medium |
| useLanguagePreference hook | `/src/hooks/useLanguagePreference.ts` | ~6 | Low |
| useDashboardPreferences hook | `/src/hooks/useDashboardPreferences.ts` | ~4 | Low |
| LocaleContext | `/src/contexts/LocaleContext.tsx` | ~8 | Low |

**Total Estimated Strings:** ~40

### 4.2 String Categories by Component

#### DashboardSettingsPopover (~12 strings)
Located at `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`

| String | Translation Key |
|--------|-----------------|
| `"Dashboard Settings"` | `settings.preferences.dashboard.title` |
| `"Dashboard settings"` (aria-label) | `settings.preferences.dashboard.ariaLabel` |
| `"Close settings"` | `settings.preferences.dashboard.closeButton` |
| `"Show Advanced Tools"` | `settings.preferences.dashboard.toggleAdvancedTools` |
| `"Always show grouping and bulk operations"` | `settings.preferences.dashboard.toggleAdvancedToolsDesc` |
| `"Show Portfolio Summary"` | `settings.preferences.dashboard.togglePortfolioView` |
| `"Always show portfolio overview card"` | `settings.preferences.dashboard.togglePortfolioViewDesc` |
| Footer hint text | `settings.preferences.dashboard.footerHint` |

#### LanguageSwitcher (~10 strings)
Located at `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`

| String | Translation Key |
|--------|-----------------|
| `"Select Language"` | `settings.preferences.language.selectPlaceholder` |
| `"Switching..."` | `settings.preferences.language.switching` |
| `"Select language. Current language: {language}"` (aria-label) | `settings.preferences.language.currentLanguageAria` |
| `"Language options"` (aria-label) | `settings.preferences.language.optionsAria` |
| Individual language names (already in SUPPORTED_LOCALES) | Use existing `language.{code}` keys |

#### useLanguagePreference Hook (~6 strings)
Located at `/src/hooks/useLanguagePreference.ts`

| String | Translation Key |
|--------|-----------------|
| `"Invalid language: {language}"` | `settings.preferences.language.invalidLanguage` |
| `"Failed to save language preference"` | `settings.preferences.language.saveFailed` |
| Console messages (not user-facing) | N/A - exclude from translation |

#### useDashboardPreferences Hook (~4 strings)
Located at `/src/hooks/useDashboardPreferences.ts`

This hook contains only console.warn messages which are not user-facing. No translation needed for this hook.

#### LocaleContext (~8 strings)
Located at `/src/contexts/LocaleContext.tsx`

| String | Translation Key |
|--------|-----------------|
| `"Unsupported locale: {locale}"` | `settings.preferences.language.unsupportedLocale` |
| `"Failed to change locale"` | `settings.preferences.language.changeFailed` |
| Console messages (not user-facing) | N/A - exclude from translation |

---

## 5. Translation Namespace Structure

### 5.1 Proposed `settings.preferences` Namespace

```json
{
  "settings": {
    "preferences": {
      "title": "Preferences",
      "subtitle": "Customize your experience",

      "dashboard": {
        "title": "Dashboard Settings",
        "ariaLabel": "Dashboard settings",
        "closeButton": "Close settings",
        "toggleAdvancedTools": "Show Advanced Tools",
        "toggleAdvancedToolsDesc": "Always show grouping and bulk operations",
        "togglePortfolioView": "Show Portfolio Summary",
        "togglePortfolioViewDesc": "Always show portfolio overview card",
        "footerHint": "These settings override automatic UI adaptation based on your property count."
      },

      "language": {
        "title": "Language",
        "description": "Choose your preferred language",
        "selectPlaceholder": "Select Language",
        "switching": "Switching...",
        "currentLanguageAria": "Select language. Current language: {language}",
        "optionsAria": "Language options",
        "invalidLanguage": "Invalid language: {language}",
        "saveFailed": "Failed to save language preference",
        "changeFailed": "Failed to change language",
        "unsupportedLocale": "Unsupported locale: {locale}",
        "changeSuccess": "Language changed successfully"
      },

      "display": {
        "title": "Display",
        "theme": "Theme",
        "themeLight": "Light",
        "themeDark": "Dark",
        "themeSystem": "System",
        "compactView": "Compact View",
        "compactViewDesc": "Show more items in a condensed layout"
      },

      "notifications": {
        "title": "Notifications",
        "emailNotifications": "Email Notifications",
        "emailNotificationsDesc": "Receive updates and alerts via email",
        "pushNotifications": "Push Notifications",
        "pushNotificationsDesc": "Receive instant notifications in your browser",
        "weeklyDigest": "Weekly Digest",
        "weeklyDigestDesc": "Receive a summary of activity each week"
      },

      "customization": {
        "title": "Customization",
        "showTips": "Show Tips",
        "showTipsDesc": "Display helpful tips throughout the application",
        "autoSave": "Auto-save",
        "autoSaveDesc": "Automatically save changes as you work",
        "defaultView": "Default View",
        "defaultViewDesc": "Choose your preferred starting view"
      }
    }
  }
}
```

---

## 6. Implementation Tasks

### Task 1: Update DashboardSettingsPopover Component
**File:** `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`
**Effort:** 0.5 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.preferences.dashboard')`
3. Replace hardcoded strings:
   - Line 166: `"Dashboard Settings"` -> `{t('title')}`
   - Line 149: `aria-label="Dashboard settings"` -> `aria-label={t('ariaLabel')}`
   - Line 174: `aria-label="Close settings"` -> `aria-label={t('closeButton')}`
   - Line 185: `label="Show Advanced Tools"` -> `label={t('toggleAdvancedTools')}`
   - Line 186: `description="Always show grouping..."` -> `description={t('toggleAdvancedToolsDesc')}`
   - Line 191: `label="Show Portfolio Summary"` -> `label={t('togglePortfolioView')}`
   - Line 192: `description="Always show portfolio..."` -> `description={t('togglePortfolioViewDesc')}`
   - Line 199-200: Footer hint text -> `{t('footerHint')}`

### Task 2: Update LanguageSwitcher Component
**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
**Effort:** 1 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.preferences.language')`
3. Replace hardcoded strings:
   - Line 289: `return 'Select Language'` -> `return t('selectPlaceholder')`
   - Line 342: `<span>Switching...</span>` -> `<span>{t('switching')}</span>`
   - Line 334: Update aria-label with interpolation: `aria-label={t('currentLanguageAria', { language: currentLocaleData?.name || 'English' })}`
   - Line 370: `aria-label="Language options"` -> `aria-label={t('optionsAria')}`

**Note:** The language names in `SUPPORTED_LOCALES` can remain as-is since they are native language names that don't need translation (e.g., "Deutsch" is always "Deutsch").

### Task 3: Update useLanguagePreference Hook
**File:** `/src/hooks/useLanguagePreference.ts`
**Effort:** 0.5 SP

**Challenge:** This is a hook, not a component, so it cannot use `useTranslations` directly. Instead, error messages should be returned as translation keys that the consuming component can translate.

**Changes:**
1. Change error message approach to return translation keys instead of hardcoded strings:
   - Line 261: `setError(`Invalid language: ${newLanguage}`)` -> `setError('settings.preferences.language.invalidLanguage')`
   - Line 310: `setError(...)` -> Return structured error with key and params

**Alternative Approach:** Keep error messages as simple keys and let consuming components translate them:
```typescript
// In the hook
setError({ key: 'invalidLanguage', params: { language: newLanguage } });

// In consuming component
const t = useTranslations('settings.preferences.language');
const errorMessage = error ? t(error.key, error.params) : null;
```

**Recommended:** For simplicity, keep the current string approach but document that these errors should be caught and translated at the component level. The hook's errors are primarily for logging/debugging.

### Task 4: Update ToggleSwitch Sub-component
**File:** `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` (internal component)
**Effort:** Included in Task 1

The `ToggleSwitch` internal component already accepts `label` and `description` props, so translations are passed down from the parent. No changes needed to ToggleSwitch itself.

### Task 5: Add Translations to Message Files
**Files:** `/messages/{en,fr,es,de,nl,it}.json`
**Effort:** 1 SP

**Changes:**
1. Add `settings.preferences` namespace entries to English message file
2. Generate translations for all 5 non-English languages
3. Verify all interpolation variables are preserved correctly
4. Ensure character encoding is correct for non-Latin scripts

### Task 6: Testing and Verification
**Effort:** 0.5 SP

**Changes:**
1. Verify DashboardSettingsPopover displays translated labels in all 6 languages
2. Verify LanguageSwitcher shows translated placeholder and loading state
3. Test toggle states and functionality remain unchanged
4. Verify language switching works correctly with new translations
5. Test layout stability with longer translations (German, French)
6. Verify aria-labels and accessibility attributes are properly translated

---

## 7. Authorized Files and Functions for Modification

### 7.1 Components to Modify

| File Path | Functions/Components | Type of Change |
|-----------|---------------------|----------------|
| `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | `DashboardSettingsPopover` | Add useTranslations, replace strings |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | `LanguageSwitcher`, `getDisplayText` | Add useTranslations, replace strings |

### 7.2 Hooks to Review (Minimal Changes)

| File Path | Functions | Type of Change |
|-----------|-----------|----------------|
| `/src/hooks/useLanguagePreference.ts` | `useLanguagePreference` | Document error key approach |
| `/src/hooks/useDashboardPreferences.ts` | N/A | No changes (console-only messages) |

### 7.3 Context to Review (Minimal Changes)

| File Path | Functions | Type of Change |
|-----------|-----------|----------------|
| `/src/contexts/LocaleContext.tsx` | `LocaleProvider` | No changes needed (console-only messages) |

### 7.4 Translation Files to Modify

| File Path | Namespace | Type of Change |
|-----------|-----------|----------------|
| `/messages/en.json` | `settings.preferences` | Add new keys |
| `/messages/fr.json` | `settings.preferences` | Add new keys |
| `/messages/es.json` | `settings.preferences` | Add new keys |
| `/messages/de.json` | `settings.preferences` | Add new keys |
| `/messages/nl.json` | `settings.preferences` | Add new keys |
| `/messages/it.json` | `settings.preferences` | Add new keys |

### 7.5 Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/components/LanguageSwitcher/constants.ts` | Data/config, locale names should remain native |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Type definitions only |
| `/src/hooks/useDashboardPreferences.ts` | Only contains console warnings, no UI strings |

---

## 8. Technical Approach

### 8.1 Translation Pattern for Client Components

```typescript
// Example: DashboardSettingsPopover.tsx
'use client';

import { useTranslations } from 'next-intl';

export function DashboardSettingsPopover({ preferences, onPreferenceChange, className = '' }) {
  const t = useTranslations('settings.preferences.dashboard');

  return (
    <div className={`relative ${className}`}>
      <button
        aria-label={t('ariaLabel')}
        aria-expanded={isOpen}
        // ...
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div role="dialog" aria-label={t('ariaLabel')}>
          <div className="flex items-center justify-between">
            <h3>{t('title')}</h3>
            <button aria-label={t('closeButton')}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <ToggleSwitch
            id="forceAdvancedTools"
            checked={preferences.forceAdvancedTools}
            onChange={handleAdvancedToolsChange}
            label={t('toggleAdvancedTools')}
            description={t('toggleAdvancedToolsDesc')}
          />

          {/* ... */}

          <p className="text-xs">{t('footerHint')}</p>
        </div>
      )}
    </div>
  );
}
```

### 8.2 Interpolation Pattern for Dynamic Content

```typescript
// For language switcher aria-label with current language name
const t = useTranslations('settings.preferences.language');
const currentLanguageName = currentLocaleData?.name || 'English';

<button
  aria-label={t('currentLanguageAria', { language: currentLanguageName })}
  // ...
>
```

Translation key (ICU format):
```json
{
  "currentLanguageAria": "Select language. Current language: {language}"
}
```

### 8.3 Language Names Approach

The `SUPPORTED_LOCALES` array in `constants.ts` contains both English names and native names:
```typescript
{ code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
```

**Recommendation:** Keep native names untranslated since:
1. Users expect to see their language in its native form (e.g., "Deutsch" not "German")
2. The existing `language.{code}` keys in `/messages/en.json` can be used if English names are needed
3. This is consistent with how language switchers work in most applications

---

## 9. Acceptance Criteria

### 9.1 Functional Criteria

- [ ] DashboardSettingsPopover uses `useTranslations` hook
- [ ] LanguageSwitcher uses `useTranslations` hook
- [ ] All hardcoded strings are replaced with translation key references
- [ ] Components render correctly in all 6 supported languages
- [ ] Toggle states and functionality remain unchanged
- [ ] Language switching continues to work correctly
- [ ] Preference changes save correctly regardless of displayed language

### 9.2 Quality Criteria

- [ ] No hardcoded English text remains in any modified component
- [ ] All aria-labels and accessibility attributes are translated
- [ ] Layout remains stable with no text overflow in any language
- [ ] Existing component tests pass (if any)
- [ ] No TypeScript errors introduced
- [ ] Helper text and descriptions maintain clarity across all languages

### 9.3 Verification Checklist

- [ ] DashboardSettingsPopover displays translated toggle labels and descriptions
- [ ] DashboardSettingsPopover footer hint is translated
- [ ] LanguageSwitcher shows translated placeholder ("Select Language")
- [ ] LanguageSwitcher shows translated loading state ("Switching...")
- [ ] Language option names display correctly (native names)
- [ ] All aria-labels are translated for screen reader accessibility
- [ ] All message files contain complete `settings.preferences` namespace with no missing keys

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Toggle labels truncate in some languages | Medium | Low | Test all languages, adjust CSS max-width if needed |
| LanguageSwitcher dropdown width varies | Low | Low | Use min-width to ensure consistent layout |
| Missing translations cause fallback to English | Low | Low | Build-time validation, runtime fallback to English |
| Hook errors not translatable at component level | Medium | Low | Document pattern for handling hook errors |

---

## 11. Effort Estimate

| Task | Story Points | Confidence |
|------|--------------|------------|
| Task 1: DashboardSettingsPopover | 0.5 | High |
| Task 2: LanguageSwitcher | 1 | High |
| Task 3: useLanguagePreference review | 0.5 | High |
| Task 4: ToggleSwitch (included in Task 1) | 0 | N/A |
| Task 5: Translation files | 1 | High |
| Task 6: Testing | 0.5 | High |
| **Total** | **3.5 SP** | High |

---

## 12. Related Tasks

### 12.1 Overlap with Task 2G.2 (REQ-E02-014)

Task 2G.2 (Update Account Settings Components) includes `DashboardSettingsPopover` in its scope. To avoid duplication:
- This task (2G.4) focuses specifically on **preference-related** strings
- If 2G.2 is implemented first, this task can skip DashboardSettingsPopover updates
- If this task is implemented first, 2G.2 should skip DashboardSettingsPopover

**Recommendation:** Coordinate implementation order or mark DashboardSettingsPopover as owned by one task only.

### 12.2 Dependency on Task 2G.1 (REQ-E02-013)

Task 2G.1 creates the base `settings` namespace structure. This task extends that structure with the `settings.preferences` sub-namespace. Ensure 2G.1 is complete or implement the namespace structure as part of this task.

---

## 13. References

- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request: REQ-E02-016](/docs/gen_requests_epic2.md)
- [Task 2G.1: Create Settings Namespace Structure](/docs/REQ-E02-013-create-settings-namespace-structure-overview.md)
- [Task 2G.2: Update Account Settings Components](/docs/REQ-E02-014-update-account-settings-components-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
