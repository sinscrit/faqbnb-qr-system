# REQ-E02-014: Update Account Settings Components - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Request ID:** REQ-E02-014
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2G (Settings & Account)
**Task ID:** 2G.2
**Size:** L (Large)
**Priority:** P1
**Overview Document:** REQ-E02-014-update-account-settings-components-overview.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating all account settings components to use localized strings via the `next-intl` translation system. The scope covers 7 component files containing approximately 198 hardcoded strings across dashboard settings, language switching, account selection, account access summary, column settings, and help page components.

---

## Prerequisites

Before starting implementation:

- [ ] Epic 1 i18n Foundation is complete (`next-intl` package installed)
- [ ] Task 2G.1 (Create Settings Namespace Structure) is complete
- [ ] `/messages/en.json` contains the `settings` namespace structure
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] Development server is running for testing

---

## Task Inventory

| Task # | Component | Estimated Strings | Story Points | Priority |
|--------|-----------|-------------------|--------------|----------|
| 1 | DashboardSettingsPopover | 12 | 0.5 | P1 |
| 2 | LanguageSwitcher | 8 | 0.5 | P1 |
| 3 | AccountSelector (+ variants) | 18 | 1.0 | P1 |
| 4 | AccountAccessSummary | 22 | 1.0 | P1 |
| 5 | GuideColumnSettingsPopup | 6 | 0.25 | P1 |
| 6 | ColumnSettingsPopup | 4 | 0.25 | P1 |
| 7 | HelpPage | 120 | 3.0 | P1 |
| 8 | Add translations to message files | ~198 x 6 languages | 2.0 | P1 |
| 9 | Testing and verification | - | 1.0 | P1 |
| **Total** | | **~198** | **9.5 SP** | |

---

## Task 1: Update DashboardSettingsPopover Component

**File:** `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`
**Estimated Strings:** 12
**Story Points:** 0.5

### 1.1 Add Translation Import

**Location:** Lines 7-8 (after existing imports)

```typescript
// Add after line 8
import { useTranslations } from 'next-intl';
```

### 1.2 Initialize Translation Hook

**Location:** Inside `DashboardSettingsPopover` function, line 85

```typescript
// Add after line 85 (const [isOpen, setIsOpen] = useState(false);)
const t = useTranslations('settings.dashboard');
```

### 1.3 Replace Hardcoded Strings

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 149 | `"Dashboard settings"` (aria-label) | `ariaLabel` | `aria-label={t('ariaLabel')}` |
| 162 | `"Dashboard settings"` (aria-label) | `ariaLabel` | `aria-label={t('ariaLabel')}` |
| 167 | `"Dashboard Settings"` | `title` | `{t('title')}` |
| 173 | `"Close settings"` (aria-label) | `closeButton` | `aria-label={t('closeButton')}` |
| 185 | `"Show Advanced Tools"` | `toggleAdvancedTools` | `label={t('toggleAdvancedTools')}` |
| 186 | `"Always show grouping and bulk operations"` | `toggleAdvancedToolsDesc` | `description={t('toggleAdvancedToolsDesc')}` |
| 190 | `"Show Portfolio Summary"` | `togglePortfolioView` | `label={t('togglePortfolioView')}` |
| 191 | `"Always show portfolio overview card"` | `togglePortfolioViewDesc` | `description={t('togglePortfolioViewDesc')}` |
| 199-200 | `"These settings override..."` | `footerHint` | `{t('footerHint')}` |

### 1.4 Translation Keys Required

```json
{
  "settings": {
    "dashboard": {
      "title": "Dashboard Settings",
      "ariaLabel": "Dashboard settings",
      "closeButton": "Close settings",
      "toggleAdvancedTools": "Show Advanced Tools",
      "toggleAdvancedToolsDesc": "Always show grouping and bulk operations",
      "togglePortfolioView": "Show Portfolio Summary",
      "togglePortfolioViewDesc": "Always show portfolio overview card",
      "footerHint": "These settings override automatic UI adaptation based on your property count."
    }
  }
}
```

### 1.5 Verification Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Popover opens and displays translated title
- [ ] Both toggle labels are translated
- [ ] Both toggle descriptions are translated
- [ ] Footer hint text is translated
- [ ] Aria-labels are translated for accessibility
- [ ] Toggle functionality still works correctly

---

## Task 2: Update LanguageSwitcher Component

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
**Estimated Strings:** 8
**Story Points:** 0.5

### 2.1 Add Translation Import

**Location:** Line 3 (after existing imports)

```typescript
// Add after line 8
import { useTranslations } from 'next-intl';
```

### 2.2 Initialize Translation Hook

**Location:** Inside `LanguageSwitcher` function, after state declarations (~line 50)

```typescript
// Add after line 49
const t = useTranslations('settings.language');
```

### 2.3 Replace Hardcoded Strings

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 289 | `"Select Language"` | `selectPlaceholder` | `t('selectPlaceholder')` |
| 343 | `"Switching..."` | `switching` | `{t('switching')}` |
| 334 | `"Select language. Current language: {name}"` | `currentLanguageAria` | `aria-label={t('currentLanguageAria', { language: currentLocaleData?.name || 'English' })}` |
| 370 | `"Language options"` | `optionsAria` | `aria-label={t('optionsAria')}` |

### 2.4 Update getDisplayText Function

**Location:** Lines 288-300

```typescript
const getDisplayText = () => {
  if (!currentLocaleData) return t('selectPlaceholder');

  if (variant === 'compact') {
    return showFlags && currentLocaleData.flag
      ? `${currentLocaleData.flag} ${currentLocaleData.code.toUpperCase()}`
      : currentLocaleData.code.toUpperCase();
  }

  return showNativeNames
    ? currentLocaleData.nativeName
    : currentLocaleData.name;
};
```

### 2.5 Translation Keys Required

```json
{
  "settings": {
    "language": {
      "selectPlaceholder": "Select Language",
      "switching": "Switching...",
      "currentLanguageAria": "Select language. Current language: {language}",
      "optionsAria": "Language options"
    }
  }
}
```

### 2.6 Verification Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Placeholder text shows translated value
- [ ] Loading state shows translated "Switching..." text
- [ ] Aria-labels are properly translated
- [ ] Language selection still works correctly
- [ ] Cookie persistence still works

---

## Task 3: Update AccountSelector Component

**File:** `/src/components/AccountSelector.tsx`
**Estimated Strings:** 18
**Story Points:** 1.0

### 3.1 Add Translation Import

**Location:** Line 2 (after existing imports)

```typescript
// Add after line 2
import { useTranslations } from 'next-intl';
```

### 3.2 Initialize Translation Hooks

**Location:** Inside each component that needs translations

```typescript
// In AccountSelector function (~line 76)
const t = useTranslations('settings.account');
const tRoles = useTranslations('settings.roles');

// In AccountInfo function (~line 273)
const t = useTranslations('settings.account');
const tRoles = useTranslations('settings.roles');
```

### 3.3 Replace Hardcoded Strings - AccountSelector

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 95 | `"Failed to switch account"` | `switchFailed` | `t('switchFailed')` |
| 108 | `"An unexpected error occurred"` | `unexpectedError` | `t('unexpectedError')` |
| 136 | `"Current Account"` | `currentAccount` | `{t('currentAccount')}` |
| 155 | `"Account"` | `title` | `{t('title')}` |
| 178 | `"Select an account..."` | `selectAccount` | `{t('selectAccount')}` |
| 201 | `"Switch Account"` | `switchAccount` | `{t('switchAccount')}` |
| 219 | `"{count} accounts available"` | `accountsAvailable` | `{t('accountsAvailable', { count: userAccounts.length })}` |
| 239 | `"Dismiss"` | `dismiss` | `{t('dismiss')}` |

### 3.4 Replace Role Capitalization

**Location:** Lines 56-57 (AccountDisplay), line 303-304 (AccountInfo)

Current code:
```typescript
{userRole.charAt(0).toUpperCase() + userRole.slice(1)}
```

Replace with:
```typescript
{tRoles(userRole.toLowerCase() as 'admin' | 'member' | 'owner')}
```

### 3.5 Replace Hardcoded Strings - AccountInfo

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 285 | `"Current Account"` | `currentAccount` | `{t('currentAccount')}` |
| 306 | `"{count} accounts"` | `accountsAvailable` | `{t('accountsAvailable', { count: userAccounts.length })}` |

### 3.6 Translation Keys Required

```json
{
  "settings": {
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
    "roles": {
      "admin": "Admin",
      "member": "Member",
      "owner": "Owner"
    }
  }
}
```

### 3.7 Verification Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Single account view shows translated "Current Account" label
- [ ] Multi-account dropdown shows translated "Account" label
- [ ] Empty state shows translated "Select an account..." text
- [ ] Account count uses correct pluralization
- [ ] Role names are translated and capitalized
- [ ] Error messages are translated
- [ ] Dismiss button text is translated
- [ ] Account switching still works correctly

---

## Task 4: Update AccountAccessSummary Component

**File:** `/src/components/AccountAccessSummary.tsx`
**Estimated Strings:** 22
**Story Points:** 1.0

### 4.1 Add Translation Import

**Location:** Line 2 (after existing imports)

```typescript
// Add after line 2
import { useTranslations } from 'next-intl';
```

### 4.2 Initialize Translation Hook

**Location:** Inside component function, after prop destructuring

```typescript
// Add after line 36
const t = useTranslations('settings.accountAccess');
```

### 4.3 Replace Hardcoded Strings

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 58 | `"Account Access"` | `title` | `{t('title')}` |
| 67 | `"Accounts Owned"` | `accountsOwned` | `{t('accountsOwned')}` |
| 72 | `"Accounts Accessed"` | `accountsAccessed` | `{t('accountsAccessed')}` |
| 80 | `"Accounts You Own"` | `accountsYouOwn` | `{t('accountsYouOwn')}` |
| 87 | `"No owned accounts"` | `noOwnedAccounts` | `{t('noOwnedAccounts')}` |
| 103 | `"{count} members"` | `members` | `{t('members', { count: account.memberCount })}` |
| 107-108 | `"Owner"` | `ownerBadge` | `{t('ownerBadge')}` |
| 111 | `"Created {date}"` | `created` | `{t('created', { date: ... })}` |
| 122-123 | `"Accounts You Access"` | `accountsYouAccess` | `{t('accountsYouAccess')}` |
| 130 | `"No accessible accounts"` | `noAccessibleAccounts` | `{t('noAccessibleAccounts')}` |
| 143 | `"by {name}"` | `by` | `{t('by', { name: account.ownerName })}` |
| 147 | `"{count} members"` | `members` | `{t('members', { count: account.memberCount })}` |
| 161 | `"Since {date}"` | `since` | `{t('since', { date: ... })}` |
| 174 | `"Total Accounts:"` | `totalAccounts` | `{t('totalAccounts')}` |
| 178 | `"Total Users with Access:"` | `totalUsersWithAccess` | `{t('totalUsersWithAccess')}` |

### 4.4 Handle Date Formatting

For date display, use proper date interpolation:

```typescript
// Replace:
Created {new Date(account.created_at).toLocaleDateString()}

// With:
{t('created', { date: new Date(account.created_at).toLocaleDateString() })}
```

### 4.5 Translation Keys Required

```json
{
  "settings": {
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
    }
  }
}
```

### 4.6 Verification Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Section title is translated
- [ ] Stats labels (Accounts Owned/Accessed) are translated
- [ ] Section headings are translated
- [ ] Empty states are translated
- [ ] Member counts use correct pluralization
- [ ] Date labels are translated with proper interpolation
- [ ] "by {name}" attribution is translated
- [ ] Role badges are translated
- [ ] Summary labels are translated

---

## Task 5: Update GuideColumnSettingsPopup Component

**File:** `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`
**Estimated Strings:** 6
**Story Points:** 0.25

### 5.1 Add Translation Import

**Location:** Line 14 (after existing imports)

```typescript
// Add after line 15
import { useTranslations } from 'next-intl';
```

### 5.2 Initialize Translation Hook

**Location:** Inside component function

```typescript
// Add at start of GuideColumnSettingsPopup function (~line 52)
const t = useTranslations('settings.columns');
```

### 5.3 Update COLUMN_OPTIONS to Use Translations

The `COLUMN_OPTIONS` constant needs to be moved inside the component or converted to a function:

```typescript
// Replace lines 41-45 with a function inside the component:
const getColumnOptions = (): ColumnOption[] => [
  { key: 'room', label: t('room') },
  { key: 'purpose', label: t('purpose') },
  { key: 'property', label: t('property') },
];
```

### 5.4 Replace Hardcoded Strings

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 70 | `"Column settings"` (aria-label) | `ariaLabel` | `aria-label={t('ariaLabel')}` |
| 93 | `"Show Columns"` | `title` | `{t('title')}` |
| 41-45 | Column labels | `room`, `purpose`, `property` | See 5.3 above |

### 5.5 Translation Keys Required

```json
{
  "settings": {
    "columns": {
      "title": "Show Columns",
      "ariaLabel": "Column settings",
      "room": "Room",
      "purpose": "Purpose",
      "property": "Property"
    }
  }
}
```

### 5.6 Verification Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Header shows translated "Show Columns" text
- [ ] Aria-label is translated
- [ ] All column labels (Room, Purpose, Property) are translated
- [ ] Toggle functionality still works

---

## Task 6: Update ColumnSettingsPopup Component

**File:** `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`
**Estimated Strings:** 4
**Story Points:** 0.25

### 6.1 Add Translation Import

**Location:** Line 14 (after existing imports)

```typescript
// Add after line 15
import { useTranslations } from 'next-intl';
```

### 6.2 Initialize Translation Hook

**Location:** Inside component function

```typescript
// Add at start of ColumnSettingsPopup function (~line 50)
const t = useTranslations('settings.columns');
```

### 6.3 Update COLUMN_OPTIONS

```typescript
// Replace lines 41-43 with a function inside the component:
const getColumnOptions = (): ColumnOption[] => [
  { key: 'property', label: t('property') },
];
```

### 6.4 Replace Hardcoded Strings

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 69 | `"Column settings"` (aria-label) | `ariaLabel` | `aria-label={t('ariaLabel')}` |
| 91 | `"Show Columns"` | `title` | `{t('title')}` |
| 42 | `"Property"` | `property` | See 6.3 above |

### 6.5 Verification Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Header shows translated "Show Columns" text
- [ ] Aria-label is translated
- [ ] Property column label is translated
- [ ] Toggle functionality still works

---

## Task 7: Update HelpPage Component

**File:** `/src/app/dashboard2/help/page.tsx`
**Estimated Strings:** ~120
**Story Points:** 3.0

### 7.1 Add Translation Import

**Location:** Line 24 (after existing imports)

```typescript
// Add after line 40
import { useTranslations } from 'next-intl';
```

### 7.2 Refactor Component Structure

The HelpPage requires significant refactoring because `INSTRUCTION_SECTIONS` is a constant that can't use hooks. Create a custom hook:

**Location:** Add before line 75 (before INSTRUCTION_SECTIONS constant)

```typescript
// Custom hook to build translated instruction sections
function useInstructionSections() {
  const t = useTranslations('settings.help.sections');

  return [
    {
      id: 'getting-started',
      title: t('gettingStarted.title'),
      icon: PlusCircle,
      description: t('gettingStarted.description'),
      steps: [
        {
          step: 1,
          title: t('gettingStarted.step1Title'),
          content: t('gettingStarted.step1Content'),
          tip: t('gettingStarted.step1Tip'),
          link: { href: '/dashboard2/properties', label: t('gettingStarted.step1Link') },
        },
        {
          step: 2,
          title: t('gettingStarted.step2Title'),
          content: t('gettingStarted.step2Content'),
          link: { href: '/dashboard2/create', label: t('gettingStarted.step2Link') },
        },
        {
          step: 3,
          title: t('gettingStarted.step3Title'),
          content: t('gettingStarted.step3Content'),
        },
      ],
    },
    {
      id: 'property-management',
      title: t('propertyManagement.title'),
      icon: Building2,
      description: t('propertyManagement.description'),
      steps: [
        {
          title: t('propertyManagement.addingPropertyTitle'),
          content: t('propertyManagement.addingPropertyContent'),
          tip: t('propertyManagement.addingPropertyTip'),
          link: { href: '/dashboard2/properties', label: t('propertyManagement.addingPropertyLink') },
        },
        {
          title: t('propertyManagement.editingTitle'),
          content: t('propertyManagement.editingContent'),
        },
        {
          title: t('propertyManagement.propertyItemsTitle'),
          content: t('propertyManagement.propertyItemsContent'),
        },
      ],
    },
    {
      id: 'item-creation',
      title: t('itemCreation.title'),
      icon: Package,
      description: t('itemCreation.description'),
      steps: [
        {
          step: 1,
          title: t('itemCreation.step1Title'),
          content: t('itemCreation.step1Content'),
          link: { href: '/dashboard2/create', label: t('itemCreation.step1Link') },
        },
        {
          step: 2,
          title: t('itemCreation.step2Title'),
          content: t('itemCreation.step2Content'),
        },
        {
          step: 3,
          title: t('itemCreation.step3Title'),
          content: t('itemCreation.step3Content'),
        },
        {
          step: 4,
          title: t('itemCreation.step4Title'),
          content: t('itemCreation.step4Content'),
        },
        {
          step: 5,
          title: t('itemCreation.step5Title'),
          content: t('itemCreation.step5Content'),
          tip: t('itemCreation.step5Tip'),
        },
        {
          step: 6,
          title: t('itemCreation.step6Title'),
          content: t('itemCreation.step6Content'),
        },
      ],
    },
    {
      id: 'qr-codes',
      title: t('qrCodes.title'),
      icon: QrCode,
      description: t('qrCodes.description'),
      steps: [
        {
          title: t('qrCodes.autoGenerationTitle'),
          content: t('qrCodes.autoGenerationContent'),
        },
        {
          title: t('qrCodes.printingTitle'),
          content: t('qrCodes.printingContent'),
          link: { href: '/dashboard2/items', label: t('qrCodes.printingLink') },
        },
        {
          title: t('qrCodes.placementTitle'),
          content: t('qrCodes.placementContent'),
          tip: t('qrCodes.placementTip'),
        },
        {
          title: t('qrCodes.testingTitle'),
          content: t('qrCodes.testingContent'),
        },
      ],
    },
    {
      id: 'item-management',
      title: t('itemManagement.title'),
      icon: Settings,
      description: t('itemManagement.description'),
      steps: [
        {
          title: t('itemManagement.viewingTitle'),
          content: t('itemManagement.viewingContent'),
          link: { href: '/dashboard2/items', label: t('itemManagement.viewingLink') },
        },
        {
          title: t('itemManagement.editingTitle'),
          content: t('itemManagement.editingContent'),
        },
        {
          title: t('itemManagement.multipleInstructionsTitle'),
          content: t('itemManagement.multipleInstructionsContent'),
        },
        {
          title: t('itemManagement.bulkTitle'),
          content: t('itemManagement.bulkContent'),
        },
      ],
    },
  ];
}
```

### 7.3 Update HelpPage Component

**Location:** Inside `HelpPage` function

```typescript
export default function HelpPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);
  const t = useTranslations('settings.help');

  // Get translated instruction sections
  const instructionSections = useInstructionSections();

  const canViewItems = useCanAccess('view_items');
  // ... rest of component
```

### 7.4 Replace Page-Level Strings

| Line | Current String | Translation Key | New Code |
|------|---------------|-----------------|----------|
| 331 | `"Loading..."` | `loading` | `{t('loading')}` |
| 341 | `"Authentication Required"` | `authRequired` | `{t('authRequired')}` |
| 342 | `"Please log in to access help."` | `authRequiredMessage` | `{t('authRequiredMessage')}` |
| 346 | `"Go to Login"` | `goToLogin` | `{t('goToLogin')}` |
| 358 | `"Access Denied"` | `accessDenied` | `{t('accessDenied')}` |
| 359 | `"You do not have permission..."` | `accessDeniedMessage` | `{t('accessDeniedMessage')}` |
| 363 | `"Back to Dashboard"` | `backToDashboard` | `{t('backToDashboard')}` |
| 379 | `"Help & User Guide"` | `title` | `{t('title')}` |
| 383-384 | `"Learn how to use FAQBNB..."` | `subtitle` | `{t('subtitle')}` |
| 393 | `"Create Item"` | `createItem` | `{t('createItem')}` |
| 401 | `"Quick Links"` | `quickLinks` | `{t('quickLinks')}` |
| 424 | `"Still Need Help?"` | `stillNeedHelp` | `{t('stillNeedHelp')}` |
| 425-426 | `"Can't find what you're looking for?..."` | `stillNeedHelpMessage` | `{t('stillNeedHelpMessage')}` |
| 431 | `"Contact Support"` | `contactSupport` | `{t('contactSupport')}` |

### 7.5 Update InstructionCard Tip Display

**Location:** Line 290-293

```typescript
// Replace:
<span>Tip: {step.tip}</span>

// With:
<span>{t('tip', { tip: step.tip })}</span>
```

### 7.6 Replace INSTRUCTION_SECTIONS Reference

**Location:** Lines 403, 417

```typescript
// Replace INSTRUCTION_SECTIONS with instructionSections
{instructionSections.map((section) => (
  // ...
))}
```

### 7.7 Remove Static INSTRUCTION_SECTIONS Constant

Delete lines 75-233 (the `INSTRUCTION_SECTIONS` constant) as it's now generated by the hook.

### 7.8 Translation Keys Required (Help Page)

```json
{
  "settings": {
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
    }
  }
}
```

### 7.9 Verification Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Page title is translated
- [ ] Page subtitle is translated
- [ ] Quick links section header is translated
- [ ] Create Item button is translated
- [ ] All 5 instruction sections are translated:
  - [ ] Getting Started (title, description, 3 steps with tips/links)
  - [ ] Managing Properties (title, description, 3 steps)
  - [ ] Creating Items (title, description, 6 steps with tips/links)
  - [ ] QR Code Generation (title, description, 4 steps with tips/links)
  - [ ] Managing Items (title, description, 4 steps with links)
- [ ] Auth required message is translated
- [ ] Access denied message is translated
- [ ] Loading state is translated
- [ ] "Still Need Help?" section is translated
- [ ] Tips display with correct format ("Tip: {tip}")
- [ ] All links work correctly
- [ ] Accordion expand/collapse still works

---

## Task 8: Add Translations to Message Files

**Files:** `/messages/{en,fr,es,de,nl,it}.json`
**Story Points:** 2.0

### 8.1 Add English Translations

Add all translation keys from Tasks 1-7 to `/messages/en.json` under the `settings` namespace.

### 8.2 Generate Non-English Translations

For each language file, translate all `settings` namespace keys:

**Languages:**
- French (`/messages/fr.json`)
- Spanish (`/messages/es.json`)
- German (`/messages/de.json`)
- Dutch (`/messages/nl.json`)
- Italian (`/messages/it.json`)

### 8.3 Translation Guidelines

1. **Preserve interpolation variables:** `{count}`, `{name}`, `{date}`, `{language}`, `{tip}` must remain unchanged
2. **Preserve ICU plural format:** `{count, plural, one {# member} other {# members}}`
3. **Maintain consistent terminology:** Use same terms for "Account", "Property", etc. throughout
4. **Respect language conventions:** Formal vs informal address where applicable
5. **Handle special characters:** Ensure proper encoding for accented characters

### 8.4 Verification Checklist

- [ ] English translations complete and validated
- [ ] French translations complete
- [ ] Spanish translations complete
- [ ] German translations complete
- [ ] Dutch translations complete
- [ ] Italian translations complete
- [ ] All interpolation variables preserved
- [ ] All plural forms correct
- [ ] No missing keys in any language
- [ ] Character encoding correct

---

## Task 9: Testing and Verification

**Story Points:** 1.0

### 9.1 Component Testing

For each component, verify in all 6 languages:

| Component | Test URL/Location | Status |
|-----------|-------------------|--------|
| DashboardSettingsPopover | Dashboard page, settings gear icon | [ ] |
| LanguageSwitcher | Any page with language switcher | [ ] |
| AccountSelector | Dashboard sidebar | [ ] |
| AccountAccessSummary | Account page | [ ] |
| GuideColumnSettingsPopup | Instructions table | [ ] |
| ColumnSettingsPopup | Items list | [ ] |
| HelpPage | `/dashboard2/help` | [ ] |

### 9.2 Language Switch Testing

1. Start in English
2. Change to each language and verify:
   - [ ] All components update immediately
   - [ ] No hardcoded English remains visible
   - [ ] Layout doesn't break with longer text
   - [ ] Plurals work correctly (1 account vs 2 accounts)

### 9.3 Functional Testing

- [ ] DashboardSettingsPopover toggles still work
- [ ] LanguageSwitcher still changes language
- [ ] AccountSelector account switching works
- [ ] Column settings toggles work
- [ ] Help page accordions expand/collapse
- [ ] All navigation links work

### 9.4 Accessibility Testing

- [ ] All aria-labels are translated
- [ ] Screen reader announces translated text
- [ ] Keyboard navigation still works

### 9.5 Build Verification

```bash
npm run build
npm run lint
```

- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No lint warnings related to translations

---

## Implementation Order Recommendation

Execute tasks in this order to minimize dependencies:

1. **Task 1:** DashboardSettingsPopover (simple, isolated)
2. **Task 5:** GuideColumnSettingsPopup (simple, can share translations)
3. **Task 6:** ColumnSettingsPopup (simple, shares translations with Task 5)
4. **Task 2:** LanguageSwitcher (medium complexity)
5. **Task 3:** AccountSelector (medium complexity)
6. **Task 4:** AccountAccessSummary (medium complexity)
7. **Task 7:** HelpPage (most complex, requires refactoring)
8. **Task 8:** Message files (depends on all component tasks)
9. **Task 9:** Testing (depends on all tasks)

---

## Rollback Plan

If issues are discovered after deployment:

1. All changes should be in a single feature branch
2. Translation keys can be added without breaking existing functionality (fallback to key name)
3. Component changes can be reverted independently
4. Message file changes are additive only

---

## Success Criteria

- [ ] All 7 components use `useTranslations` hook
- [ ] ~198 hardcoded strings replaced with translation references
- [ ] All 6 message files contain complete `settings` namespace
- [ ] Components render correctly in all 6 languages
- [ ] No TypeScript errors
- [ ] All functionality preserved
- [ ] Accessibility attributes translated
- [ ] Build passes

---

## References

- [Overview Document](/docs/REQ-E02-014-update-account-settings-components-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-e02-014)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
