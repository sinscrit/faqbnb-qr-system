# REQ-E02-014: Update Account Settings Components with Localized Strings

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-014
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2G (Settings & Account)
**Task ID:** 2G.2
**Size:** L (Large)
**Priority:** P1

---

## 1. Summary

This task updates all account settings components to display user-facing text using localized translation references instead of hardcoded English strings. The scope includes profile settings, preferences, notification settings, security settings, privacy controls, and help/support pages. All hardcoded strings will be extracted to the `settings` namespace within the i18n message bundle and replaced with `useTranslations` hook references.

---

## 2. Background & Context

### 2.1 Current State

Account settings components throughout the application contain hardcoded English strings for:
- Section headings and page titles
- Field labels, toggle labels, and option descriptions
- Button text and helper text
- Privacy policy links and security explanations
- Validation messages and error text

Key components with hardcoded strings include:
- `DashboardSettingsPopover` - Dashboard UI preferences popover
- `LanguageSwitcher` - Language selection dropdown
- `AccountSelector` - Multi-account switching component
- `AccountAccessSummary` - Account ownership/access display
- `ColumnSettingsPopup` variants - Column visibility controls
- Help page - Comprehensive user guidance content

### 2.2 Target State

After implementation:
- All account settings components retrieve display text from the i18n translation system using `useTranslations` hook
- Text renders in the user's selected language
- When language preferences change, all settings text updates to match the new locale
- No hardcoded English text remains in any account settings component

### 2.3 Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| Epic 1 i18n Foundation | Required | `next-intl` package installed |
| `settings` namespace structure | Task 2G.1 | `/messages/en.json` |
| `useTranslations` hook | Available | `next-intl` |
| `getTranslations` (server) | Available | `next-intl/server` |

---

## 3. Requirements Analysis

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Profile settings components use i18n settings.profile namespace | Must Have |
| FR-2 | Preference components use i18n settings.preferences namespace | Must Have |
| FR-3 | Security settings use i18n settings.security namespace | Must Have |
| FR-4 | Privacy controls use i18n settings.privacy namespace | Must Have |
| FR-5 | Help page uses i18n settings.help namespace | Must Have |
| FR-6 | All toggle/checkbox labels are extracted to translation keys | Must Have |
| FR-7 | All validation messages use localized strings | Must Have |
| FR-8 | Dynamic content (user name, dates) properly interpolates | Must Have |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | Layout remains stable across all supported languages | Must Have |
| NFR-2 | Component text updates without page refresh on language change | Should Have |
| NFR-3 | Security-sensitive text maintains appropriate tone across languages | Must Have |
| NFR-4 | Existing component functionality remains unchanged | Must Have |

---

## 4. Components Analysis

### 4.1 Component Inventory

| Component | File Path | Est. Strings | Complexity |
|-----------|-----------|--------------|------------|
| DashboardSettingsPopover | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | ~12 | Low |
| LanguageSwitcher | `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | ~8 | Medium |
| AccountSelector | `/src/components/AccountSelector.tsx` | ~18 | Medium |
| AccountAccessSummary | `/src/components/AccountAccessSummary.tsx` | ~22 | Medium |
| GuideColumnSettingsPopup | `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | ~6 | Low |
| ColumnSettingsPopup | `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` | ~4 | Low |
| HelpPage | `/src/app/dashboard2/help/page.tsx` | ~120 | High |
| useLanguagePreference hook | `/src/hooks/useLanguagePreference.ts` | ~6 | Low |
| useDashboardPreferences hook | `/src/hooks/useDashboardPreferences.ts` | ~2 | Low |

**Total Estimated Strings:** ~198

### 4.2 String Categories by Component

#### DashboardSettingsPopover (~12 strings)
- Dialog title: "Dashboard Settings"
- Toggle labels: "Show Advanced Tools", "Show Portfolio Summary"
- Toggle descriptions: "Always show grouping and bulk operations", "Always show portfolio overview card"
- Button aria-labels: "Dashboard settings", "Close settings"
- Footer hint text

#### LanguageSwitcher (~8 strings)
- Placeholder: "Select Language"
- Loading state: "Switching..."
- Aria-labels for accessibility
- Error messages

#### AccountSelector (~18 strings)
- Section labels: "Current Account", "Account", "Switch Account"
- Role labels: capitalized role names
- Status indicators: "accounts available"
- Empty state: "Select an account..."
- Error messages: "Failed to switch account", "An unexpected error occurred"
- Action: "Dismiss"

#### AccountAccessSummary (~22 strings)
- Section title: "Account Access"
- Stats labels: "Accounts Owned", "Accounts Accessed"
- Section headings: "Accounts You Own", "Accounts You Access"
- Empty states: "No owned accounts", "No accessible accounts"
- Status badges: "Owner", role names
- Summary labels: "Total Accounts:", "Total Users with Access:"
- Dynamic labels: "members", "Created", "Since"

#### ColumnSettingsPopup Variants (~10 strings combined)
- Header: "Show Columns"
- Column labels: "Room", "Purpose", "Property"
- Aria-labels: "Column settings"

#### HelpPage (~120 strings)
- Page title and subtitle
- Quick links section
- 5 instruction sections with:
  - Section titles and descriptions
  - Step titles and content
  - Tips
  - Link labels
- Footer section: "Still Need Help?", "Contact Support"
- Auth/permission messages

---

## 5. Translation Namespace Structure

### 5.1 Proposed `settings` Namespace (extending Task 2G.1)

```json
{
  "settings": {
    "title": "Settings",
    "subtitle": "Manage your account settings",

    "dashboard": {
      "title": "Dashboard Settings",
      "closeButton": "Close settings",
      "ariaLabel": "Dashboard settings",
      "toggleAdvancedTools": "Show Advanced Tools",
      "toggleAdvancedToolsDesc": "Always show grouping and bulk operations",
      "togglePortfolioView": "Show Portfolio Summary",
      "togglePortfolioViewDesc": "Always show portfolio overview card",
      "footerHint": "These settings override automatic UI adaptation based on your property count."
    },

    "language": {
      "selectPlaceholder": "Select Language",
      "switching": "Switching...",
      "currentLanguageAria": "Select language. Current language: {language}",
      "optionsAria": "Language options"
    },

    "account": {
      "title": "Account",
      "currentAccount": "Current Account",
      "switchAccount": "Switch Account",
      "selectAccount": "Select an account...",
      "accountsAvailable": "{count} {count, plural, one {account} other {accounts}} available",
      "switchFailed": "Failed to switch account",
      "unexpectedError": "An unexpected error occurred",
      "dismiss": "Dismiss"
    },

    "accountAccess": {
      "title": "Account Access",
      "accountsOwned": "Accounts Owned",
      "accountsAccessed": "Accounts Accessed",
      "accountsYouOwn": "Accounts You Own",
      "accountsYouAccess": "Accounts You Access",
      "noOwnedAccounts": "No owned accounts",
      "noAccessibleAccounts": "No accessible accounts",
      "ownerBadge": "Owner",
      "members": "{count, plural, one {# member} other {# members}}",
      "created": "Created {date}",
      "since": "Since {date}",
      "by": "by {name}",
      "totalAccounts": "Total Accounts:",
      "totalUsersWithAccess": "Total Users with Access:"
    },

    "columns": {
      "title": "Show Columns",
      "ariaLabel": "Column settings",
      "room": "Room",
      "purpose": "Purpose",
      "property": "Property"
    },

    "help": {
      "title": "Help & User Guide",
      "subtitle": "Learn how to use FAQBNB to create and manage your property items",
      "quickLinks": "Quick Links",
      "createItem": "Create Item",
      "loading": "Loading...",
      "authRequired": "Authentication Required",
      "authRequiredMessage": "Please log in to access help.",
      "goToLogin": "Go to Login",
      "accessDenied": "Access Denied",
      "accessDeniedMessage": "You do not have permission to view this page.",
      "backToDashboard": "Back to Dashboard",
      "stillNeedHelp": "Still Need Help?",
      "stillNeedHelpMessage": "Can't find what you're looking for? Contact our support team for assistance.",
      "contactSupport": "Contact Support",
      "tip": "Tip: {tip}",

      "sections": {
        "gettingStarted": {
          "title": "Getting Started",
          "description": "Learn the basics of setting up your FAQBNB account",
          "step1Title": "Create Your First Property",
          "step1Content": "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property.",
          "step1Tip": "You can add multiple properties to manage different locations.",
          "step1Link": "Go to Properties",
          "step2Title": "Add Items to Your Property",
          "step2Content": "Items are the appliances, amenities, or features guests interact with. Create items for things like coffee makers, thermostats, or TVs.",
          "step2Link": "Create an Item",
          "step3Title": "Add Instructions for Each Item",
          "step3Content": "Each item can have multiple instruction articles: how to use, how to clean, troubleshooting tips, and more."
        },
        "propertyManagement": {
          "title": "Managing Properties",
          "description": "Set up and organize your rental properties",
          "addingPropertyTitle": "Adding a Property",
          "addingPropertyContent": "Click \"Add Property\" from the Properties page. Enter the property name, address, and optional description.",
          "addingPropertyTip": "Use descriptive names like \"Beach House\" or \"Downtown Apartment\" for easy identification.",
          "addingPropertyLink": "Manage Properties",
          "editingTitle": "Editing Property Details",
          "editingContent": "Click on any property card to edit its details, including name, address, and settings.",
          "propertyItemsTitle": "Property-Specific Items",
          "propertyItemsContent": "Items are automatically associated with the property you're currently viewing. Switch properties using the property selector."
        },
        "itemCreation": {
          "title": "Creating Items",
          "description": "Add and document the items in your property",
          "step1Title": "Start the Item Creation Wizard",
          "step1Content": "From the dashboard, click \"Create New Item\" to launch the step-by-step wizard.",
          "step1Link": "Create Item",
          "step2Title": "Select Room and Item Type",
          "step2Content": "Choose where the item is located (Kitchen, Living Room, etc.) and what type of item it is (Appliance, Electronics, etc.).",
          "step3Title": "Name Your Item",
          "step3Content": "Enter a clear, descriptive name like \"Keurig Coffee Maker\" or \"Samsung Smart TV\". This name appears on the QR code.",
          "step4Title": "Choose Instruction Purpose",
          "step4Content": "Select what type of instructions you're creating: How to Use, How to Clean, Troubleshooting, or Safety Information.",
          "step5Title": "Add Content",
          "step5Content": "Add photos, videos, text instructions, or links to external resources like YouTube tutorials or PDF manuals.",
          "step5Tip": "Photos work best for step-by-step visual guides. Videos are great for complex procedures.",
          "step6Title": "Review and Save",
          "step6Content": "Preview your item and its instructions, then save to generate the QR code."
        },
        "qrCodes": {
          "title": "QR Code Generation",
          "description": "Generate and print QR codes for your items",
          "autoGenerationTitle": "Automatic QR Code Generation",
          "autoGenerationContent": "QR codes are generated automatically when you save an item. Each item gets a unique QR code linked to its instruction page.",
          "printingTitle": "Printing QR Codes",
          "printingContent": "From the Items page, select items and use \"Print QR Codes\" to generate printable labels for multiple items at once.",
          "printingLink": "View Items",
          "placementTitle": "QR Code Placement",
          "placementContent": "Place QR codes near the item where guests can easily scan them. Common locations: on the appliance, nearby wall, or inside cabinet doors.",
          "placementTip": "Use waterproof labels in kitchens and bathrooms.",
          "testingTitle": "Testing QR Codes",
          "testingContent": "Always test your QR codes with a smartphone before placing them. Scan the code to verify it links to the correct instruction page."
        },
        "itemManagement": {
          "title": "Managing Items",
          "description": "Edit, organize, and maintain your item library",
          "viewingTitle": "Viewing All Items",
          "viewingContent": "The Items page shows all items across your properties. Use filters to narrow by property, room, or item type.",
          "viewingLink": "View Items",
          "editingTitle": "Editing Items",
          "editingContent": "Click on any item to edit its details, add new instruction articles, or update existing content.",
          "multipleInstructionsTitle": "Adding Multiple Instructions",
          "multipleInstructionsContent": "A single item can have multiple instruction articles. Add separate articles for cleaning, troubleshooting, or special features.",
          "bulkTitle": "Bulk Operations",
          "bulkContent": "Select multiple items to perform bulk actions like printing QR codes, moving to a different property, or deleting."
        }
      }
    },

    "roles": {
      "admin": "Admin",
      "member": "Member",
      "owner": "Owner"
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
2. Initialize translations: `const t = useTranslations('settings.dashboard')`
3. Replace hardcoded strings:
   - `"Dashboard Settings"` → `{t('title')}`
   - `"Dashboard settings"` (aria-label) → `t('ariaLabel')`
   - `"Close settings"` → `t('closeButton')`
   - `"Show Advanced Tools"` → `{t('toggleAdvancedTools')}`
   - `"Always show grouping and bulk operations"` → `{t('toggleAdvancedToolsDesc')}`
   - `"Show Portfolio Summary"` → `{t('togglePortfolioView')}`
   - `"Always show portfolio overview card"` → `{t('togglePortfolioViewDesc')}`
   - Footer hint text → `{t('footerHint')}`

### Task 2: Update LanguageSwitcher Component
**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
**Effort:** 0.5 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.language')`
3. Replace hardcoded strings:
   - `"Select Language"` → `t('selectPlaceholder')`
   - `"Switching..."` → `t('switching')`
   - Update aria-label with interpolation for current language

### Task 3: Update AccountSelector Component
**File:** `/src/components/AccountSelector.tsx`
**Effort:** 1 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.account')`
3. Replace hardcoded strings:
   - `"Current Account"` → `{t('currentAccount')}`
   - `"Account"` → `{t('title')}`
   - `"Switch Account"` → `{t('switchAccount')}`
   - `"Select an account..."` → `{t('selectAccount')}`
   - `"accounts available"` → `{t('accountsAvailable', { count })}`
   - `"Failed to switch account"` → `t('switchFailed')`
   - `"An unexpected error occurred"` → `t('unexpectedError')`
   - `"Dismiss"` → `{t('dismiss')}`
4. Capitalize role names using translation keys from `settings.roles`

### Task 4: Update AccountAccessSummary Component
**File:** `/src/components/AccountAccessSummary.tsx`
**Effort:** 1 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.accountAccess')`
3. Replace all hardcoded strings with translation references
4. Handle pluralization for member counts using ICU format
5. Handle date formatting with interpolation

### Task 5: Update ColumnSettingsPopup Components
**Files:**
- `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`
- `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`
**Effort:** 0.5 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.columns')`
3. Replace hardcoded strings:
   - `"Show Columns"` → `{t('title')}`
   - `"Column settings"` (aria-label) → `t('ariaLabel')`
   - Column labels: `"Room"`, `"Purpose"`, `"Property"` → `{t('room')}`, etc.

### Task 6: Update HelpPage Component
**File:** `/src/app/dashboard2/help/page.tsx`
**Effort:** 3 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.help')`
3. Refactor `INSTRUCTION_SECTIONS` to use translation keys
4. Replace all hardcoded strings in:
   - Page header and subtitle
   - Quick links section
   - Auth required/access denied messages
   - All 5 instruction sections (titles, descriptions, step content, tips, links)
   - Footer section
5. Create helper function to build localized sections from translations

### Task 7: Add Translations to Message Files
**Files:** `/messages/{en,fr,es,de,nl,it}.json`
**Effort:** 2 SP

**Changes:**
1. Add `settings` namespace entries to English message file
2. Generate translations for all 5 non-English languages
3. Verify all interpolation variables are preserved
4. Ensure character encoding is correct for non-Latin scripts

### Task 8: Testing and Verification
**Effort:** 1 SP

**Changes:**
1. Verify all components render correctly in all 6 languages
2. Test layout stability (no text overflow or truncation)
3. Verify toggle states and functionality preserved
4. Test language switching behavior
5. Verify aria-labels and accessibility attributes are translated
6. Test interpolation with dynamic values

---

## 7. Authorized Files and Functions for Modification

### 7.1 Components to Modify

| File Path | Functions/Components | Type of Change |
|-----------|---------------------|----------------|
| `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | `DashboardSettingsPopover`, `ToggleSwitch` | Add translations |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | `LanguageSwitcher`, `getDisplayText` | Add translations |
| `/src/components/AccountSelector.tsx` | `AccountSelector`, `AccountDisplay`, `AccountInfo`, `CompactAccountSelector` | Add translations |
| `/src/components/AccountAccessSummary.tsx` | `AccountAccessSummary` (default export) | Add translations |
| `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | `GuideColumnSettingsPopup`, `COLUMN_OPTIONS` | Add translations |
| `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` | `ColumnSettingsPopup`, `COLUMN_OPTIONS` | Add translations |
| `/src/app/dashboard2/help/page.tsx` | `HelpPage`, `InstructionCard`, `INSTRUCTION_SECTIONS` | Add translations |

### 7.2 Translation Files to Modify

| File Path | Namespace | Type of Change |
|-----------|-----------|----------------|
| `/messages/en.json` | `settings` | Add new keys |
| `/messages/fr.json` | `settings` | Add new keys |
| `/messages/es.json` | `settings` | Add new keys |
| `/messages/de.json` | `settings` | Add new keys |
| `/messages/nl.json` | `settings` | Add new keys |
| `/messages/it.json` | `settings` | Add new keys |

### 7.3 Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/hooks/useLanguagePreference.ts` | Logic-only hook, no UI strings |
| `/src/hooks/useDashboardPreferences.ts` | Logic-only hook, no UI strings |
| `/src/components/LanguageSwitcher/constants.ts` | Data/config, not UI display |

---

## 8. Technical Approach

### 8.1 Translation Pattern for Client Components

```typescript
// Example: DashboardSettingsPopover.tsx
'use client';

import { useTranslations } from 'next-intl';

export function DashboardSettingsPopover({ ... }) {
  const t = useTranslations('settings.dashboard');

  return (
    <div>
      <h3>{t('title')}</h3>
      <ToggleSwitch
        label={t('toggleAdvancedTools')}
        description={t('toggleAdvancedToolsDesc')}
      />
    </div>
  );
}
```

### 8.2 Interpolation Pattern

```typescript
// For dynamic values like counts
t('accountsAvailable', { count: userAccounts.length })

// Translation key (ICU format):
// "accountsAvailable": "{count} {count, plural, one {account} other {accounts}} available"
```

### 8.3 Help Page Refactoring Approach

```typescript
// Refactor INSTRUCTION_SECTIONS to use translations
function useInstructionSections() {
  const t = useTranslations('settings.help.sections');

  return [
    {
      id: 'getting-started',
      title: t('gettingStarted.title'),
      description: t('gettingStarted.description'),
      steps: [
        {
          step: 1,
          title: t('gettingStarted.step1Title'),
          content: t('gettingStarted.step1Content'),
          tip: t('gettingStarted.step1Tip'),
          link: { href: '/dashboard2/properties', label: t('gettingStarted.step1Link') }
        },
        // ... more steps
      ]
    },
    // ... more sections
  ];
}
```

---

## 9. Acceptance Criteria

### 9.1 Functional Criteria

- [ ] All account settings components use `useTranslations` hook
- [ ] All hardcoded strings are replaced with translation key references
- [ ] Components render correctly in all 6 supported languages
- [ ] Dynamic content (counts, dates, names) properly interpolates
- [ ] Toggle states and functionality remain unchanged
- [ ] Help page content displays translated text for all sections

### 9.2 Quality Criteria

- [ ] No hardcoded English text remains in any modified component
- [ ] All aria-labels and accessibility attributes are translated
- [ ] Layout remains stable with no text overflow in any language
- [ ] Existing component tests pass (if any)
- [ ] No TypeScript errors introduced

### 9.3 Verification Checklist

- [ ] DashboardSettingsPopover displays translated toggle labels and descriptions
- [ ] LanguageSwitcher shows translated placeholder and loading state
- [ ] AccountSelector displays translated section labels and error messages
- [ ] AccountAccessSummary shows translated section headings and stats labels
- [ ] ColumnSettingsPopup variants show translated column names
- [ ] HelpPage displays all 5 instruction sections in user's selected language
- [ ] All message files contain complete `settings` namespace with no missing keys

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Help page has more strings than estimated | Medium | Low | Time-box extraction, iterate if needed |
| Layout breaks with longer translations | Medium | Medium | Test all languages, add text truncation where appropriate |
| Missing translations cause fallback to English | Low | Low | Build-time validation, runtime fallback to English |
| Complex interpolation fails | Low | Medium | Test all dynamic content thoroughly |

---

## 11. Effort Estimate

| Task | Story Points | Confidence |
|------|--------------|------------|
| Task 1: DashboardSettingsPopover | 0.5 | High |
| Task 2: LanguageSwitcher | 0.5 | High |
| Task 3: AccountSelector | 1 | High |
| Task 4: AccountAccessSummary | 1 | High |
| Task 5: ColumnSettingsPopup components | 0.5 | High |
| Task 6: HelpPage | 3 | Medium |
| Task 7: Translation files | 2 | High |
| Task 8: Testing | 1 | High |
| **Total** | **9.5 SP** | Medium |

---

## 12. References

- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request: REQ-E02-014](/docs/gen_requests_epic2.md)
- [Task 2G.1: Create Settings Namespace Structure](/docs/REQ-E02-013-create-settings-namespace-structure-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
