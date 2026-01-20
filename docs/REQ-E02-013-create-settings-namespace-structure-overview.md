# REQ-E02-013: Create Settings Namespace Structure in Messages File - Implementation Overview

*Generated: 2026-01-20 20:30:00 UTC*
*Last Modified: 2026-01-20 20:30:00 UTC*

## Reference

- **Request**: REQ-E02-013 (Create Settings Namespace Structure in Messages File)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2G (Settings & Account)
- **Task ID**: 2G.1
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

## Summary

Create a well-organized `settings` namespace within the `/messages/en.json` file containing all UI strings related to account settings, preferences, profile management, security, privacy, notifications, and help features. This namespace serves as the foundation for translating the Settings & Account sub-epic (2G) components.

## Goals

1. Create a new `settings` namespace in `/messages/en.json` with comprehensive, categorized UI strings
2. Organize strings into logical subcategories (account, profile, preferences, security, notifications, help)
3. Follow the naming conventions established in Epic 1 and Plan-111
4. Ensure all strings are properly structured and accessible via `useTranslations('settings')`
5. Enable consistent terminology across settings-related components
6. Provide foundation for subsequent tasks (2G.2-2G.6) that will update component code

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |

### Existing Namespaces

The current `/messages/en.json` already contains:
- `common` - Shared UI strings
- `auth` - Authentication strings
- `dashboard` - Dashboard navigation and stats
- `items` - Item management strings
- `errors` - Error messages
- `language` - Language selection

### Target Structure (from Plan-111)

The implementation plan specifies creating a `settings` namespace with ~150 strings:

```json
{
  "settings": {
    "title": "Settings",
    "subtitle": "Manage your account settings",
    "sections": { ... },     // ~5 section labels
    "account": { ... },      // ~10 account settings strings
    "profile": { ... },      // ~10 profile settings strings
    "preferences": { ... },  // ~15 preferences strings
    "notifications": { ... }, // ~10 notification settings (future)
    "security": { ... },     // ~10 security settings (future)
    "help": { ... }          // ~20 help page strings
  }
}
```

### Current Settings-Related Components

Analysis of the codebase reveals these settings-related components:

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| DashboardSettingsPopover | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | ~10 |
| Help page | `/src/app/dashboard2/help/page.tsx` | ~100+ |
| AdvancedDashboardTools | `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` | ~5 |
| AccountAccessSummary | `/src/components/AccountAccessSummary.tsx` | ~20 |
| Potential account/profile pages | TBD | ~50 |

## Implementation Order

### Step 1: Analyze Existing Components

Review settings-related components to identify all hardcoded strings:
- Dashboard settings popover labels
- Help page content sections
- Account access summary labels
- Any profile/preferences components

### Step 2: Create Settings Namespace Structure

Add new `settings` namespace to `/messages/en.json`:

```json
{
  "settings": {
    "title": "Settings",
    "subtitle": "Manage your account settings",
    "sections": {
      "account": "Account",
      "profile": "Profile",
      "preferences": "Preferences",
      "notifications": "Notifications",
      "security": "Security"
    },
    ...
  }
}
```

### Step 3: Add Account Settings Strings

Add strings for account management:
- Email address labels
- Account deletion warnings
- Account status indicators

### Step 4: Add Profile Settings Strings

Add strings for profile management:
- Display name
- Profile photo
- Avatar upload/remove

### Step 5: Add Preferences Strings

Add strings for user preferences:
- Language selection
- Theme options
- Timezone settings
- Dashboard preferences (Advanced Tools, Portfolio View)

### Step 6: Add Help Page Strings

Add strings for the help/user guide page:
- Section titles and descriptions
- Step-by-step instruction labels
- Quick links
- Contact support

### Step 7: Validate and Sync Language Files

- Ensure valid JSON syntax
- Apply same structure to all 5 non-English language files (with English placeholders)

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file (source of truth)
- **Current State**: Contains `common`, `auth`, `dashboard`, `items`, `errors`, `language` namespaces
- **Modification Required**: Add new `settings` namespace with categorized subcategories
- **Changes**:
  - Add complete `settings` namespace structure
  - Include all subcategories: sections, account, profile, preferences, help
  - Implement variable interpolation for dynamic content where needed

**Target Structure:**

```json
{
  "settings": {
    "title": "Settings",
    "subtitle": "Manage your account settings",
    "sections": {
      "account": "Account",
      "profile": "Profile",
      "preferences": "Preferences",
      "notifications": "Notifications",
      "security": "Security"
    },
    "account": {
      "email": "Email Address",
      "emailDescription": "Your account email address",
      "changeEmail": "Change Email",
      "deleteAccount": "Delete Account",
      "deleteWarning": "This action is permanent and cannot be undone.",
      "accountAccess": "Account Access",
      "accountsOwned": "Accounts Owned",
      "accountsAccessed": "Accounts Accessed",
      "accountsYouOwn": "Accounts You Own",
      "accountsYouAccess": "Accounts You Access",
      "noOwnedAccounts": "No owned accounts",
      "noAccessibleAccounts": "No accessible accounts",
      "totalAccounts": "Total Accounts",
      "totalUsersWithAccess": "Total Users with Access",
      "owner": "Owner",
      "admin": "Admin",
      "member": "Member",
      "membersCount": "{count, plural, one {# member} other {# members}}",
      "createdOn": "Created {date}",
      "since": "Since {date}"
    },
    "profile": {
      "name": "Display Name",
      "namePlaceholder": "Enter your display name",
      "avatar": "Profile Photo",
      "uploadAvatar": "Upload Photo",
      "removeAvatar": "Remove Photo",
      "changeAvatar": "Change Photo",
      "avatarHint": "Recommended: Square image, at least 200x200 pixels"
    },
    "preferences": {
      "language": "Language",
      "languageDescription": "Choose your preferred language",
      "theme": "Theme",
      "themeDescription": "Choose your preferred color theme",
      "themeOptions": {
        "light": "Light",
        "dark": "Dark",
        "system": "System"
      },
      "timezone": "Timezone",
      "timezoneDescription": "Your local timezone for date and time display",
      "dashboard": "Dashboard Settings",
      "dashboardDescription": "Customize your dashboard experience",
      "showAdvancedTools": "Show Advanced Tools",
      "showAdvancedToolsDescription": "Always show grouping and bulk operations",
      "showPortfolioSummary": "Show Portfolio Summary",
      "showPortfolioSummaryDescription": "Always show portfolio overview card",
      "overrideHint": "These settings override automatic UI adaptation based on your property count."
    },
    "help": {
      "title": "Help & User Guide",
      "subtitle": "Learn how to use FAQBNB to create and manage your property items",
      "quickLinks": "Quick Links",
      "stillNeedHelp": "Still Need Help?",
      "stillNeedHelpDescription": "Can't find what you're looking for? Contact our support team for assistance.",
      "contactSupport": "Contact Support",
      "createItem": "Create Item",
      "tip": "Tip: {tip}",
      "sections": {
        "gettingStarted": {
          "title": "Getting Started",
          "description": "Learn the basics of setting up your FAQBNB account",
          "step1Title": "Create Your First Property",
          "step1Content": "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property.",
          "step1Tip": "You can add multiple properties to manage different locations.",
          "step2Title": "Add Items to Your Property",
          "step2Content": "Items are the appliances, amenities, or features guests interact with. Create items for things like coffee makers, thermostats, or TVs.",
          "step3Title": "Add Instructions for Each Item",
          "step3Content": "Each item can have multiple instruction articles: how to use, how to clean, troubleshooting tips, and more."
        },
        "propertyManagement": {
          "title": "Managing Properties",
          "description": "Set up and organize your rental properties",
          "addingProperty": "Adding a Property",
          "addingPropertyContent": "Click \"Add Property\" from the Properties page. Enter the property name, address, and optional description.",
          "addingPropertyTip": "Use descriptive names like \"Beach House\" or \"Downtown Apartment\" for easy identification.",
          "editingProperty": "Editing Property Details",
          "editingPropertyContent": "Click on any property card to edit its details, including name, address, and settings.",
          "propertyItems": "Property-Specific Items",
          "propertyItemsContent": "Items are automatically associated with the property you're currently viewing. Switch properties using the property selector."
        },
        "itemCreation": {
          "title": "Creating Items",
          "description": "Add and document the items in your property",
          "step1Title": "Start the Item Creation Wizard",
          "step1Content": "From the dashboard, click \"Create New Item\" to launch the step-by-step wizard.",
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
          "automaticGeneration": "Automatic QR Code Generation",
          "automaticGenerationContent": "QR codes are generated automatically when you save an item. Each item gets a unique QR code linked to its instruction page.",
          "printing": "Printing QR Codes",
          "printingContent": "From the Items page, select items and use \"Print QR Codes\" to generate printable labels for multiple items at once.",
          "placement": "QR Code Placement",
          "placementContent": "Place QR codes near the item where guests can easily scan them. Common locations: on the appliance, nearby wall, or inside cabinet doors.",
          "placementTip": "Use waterproof labels in kitchens and bathrooms.",
          "testing": "Testing QR Codes",
          "testingContent": "Always test your QR codes with a smartphone before placing them. Scan the code to verify it links to the correct instruction page."
        },
        "itemManagement": {
          "title": "Managing Items",
          "description": "Edit, organize, and maintain your item library",
          "viewingItems": "Viewing All Items",
          "viewingItemsContent": "The Items page shows all items across your properties. Use filters to narrow by property, room, or item type.",
          "editingItems": "Editing Items",
          "editingItemsContent": "Click on any item to edit its details, add new instruction articles, or update existing content.",
          "multipleInstructions": "Adding Multiple Instructions",
          "multipleInstructionsContent": "A single item can have multiple instruction articles. Add separate articles for cleaning, troubleshooting, or special features.",
          "bulkOperations": "Bulk Operations",
          "bulkOperationsContent": "Select multiple items to perform bulk actions like printing QR codes, moving to a different property, or deleting."
        }
      },
      "links": {
        "goToProperties": "Go to Properties",
        "createItem": "Create an Item",
        "manageProperties": "Manage Properties",
        "viewItems": "View Items"
      }
    },
    "navigation": {
      "settings": "Settings",
      "help": "Help",
      "account": "Account",
      "preferences": "Preferences"
    }
  }
}
```

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification Required**: Add same `settings` namespace structure (English placeholders initially)
- **Note**: Actual translations will be generated in Task 2G.6

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- Component files - Components will be updated in subsequent tasks (2G.2-2G.5)

## Technical Specifications

### Variable Interpolation Patterns

```json
{
  "settings": {
    "account": {
      "membersCount": "{count, plural, one {# member} other {# members}}",
      "createdOn": "Created {date}",
      "since": "Since {date}"
    },
    "help": {
      "tip": "Tip: {tip}"
    }
  }
}
```

**Usage in Components:**
```typescript
const t = useTranslations('settings.account');
t('membersCount', { count: 5 }); // "5 members"
t('membersCount', { count: 1 }); // "1 member"
t('createdOn', { date: '2026-01-15' }); // "Created 2026-01-15"
```

### Translation Key Naming Convention

Following Plan-111 convention:
```
{namespace}.{category}.{element}.{variant?}
```

Examples:
- `settings.title` - Settings page title
- `settings.sections.account` - Account section label
- `settings.account.email` - Email field label
- `settings.preferences.themeOptions.dark` - Dark theme option label
- `settings.help.sections.gettingStarted.title` - Getting Started section title

## Usage Patterns

### Client Component Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function DashboardSettingsPopover() {
  const t = useTranslations('settings.preferences');

  return (
    <div>
      <h3>{t('dashboard')}</h3>
      <label>{t('showAdvancedTools')}</label>
      <span>{t('showAdvancedToolsDescription')}</span>
      <p>{t('overrideHint')}</p>
    </div>
  );
}
```

### Help Page Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function HelpPage() {
  const t = useTranslations('settings.help');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <h2>{t('quickLinks')}</h2>

      {/* Section content */}
      <h3>{t('sections.gettingStarted.title')}</h3>
      <p>{t('sections.gettingStarted.description')}</p>
      <p>{t('sections.gettingStarted.step1Content')}</p>
      <span className="tip">{t('tip', { tip: t('sections.gettingStarted.step1Tip') })}</span>
    </div>
  );
}
```

### Account Access Summary Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function AccountAccessSummary({ memberCount }) {
  const t = useTranslations('settings.account');

  return (
    <div>
      <h3>{t('accountAccess')}</h3>
      <p>{t('accountsOwned')}</p>
      <p>{t('accountsAccessed')}</p>
      <span>{t('membersCount', { count: memberCount })}</span>
    </div>
  );
}
```

## Success Validation Checklist

### Structure Validation
- [ ] `settings` namespace exists in `/messages/en.json`
- [ ] `settings.sections` subcategory exists with 5 section labels
- [ ] `settings.account` subcategory exists with ~18 account-related strings
- [ ] `settings.profile` subcategory exists with ~7 profile-related strings
- [ ] `settings.preferences` subcategory exists with ~12 preference strings
- [ ] `settings.help` subcategory exists with comprehensive help content (~50+ strings)
- [ ] `settings.navigation` subcategory exists with ~4 navigation labels

### ICU Format Validation
- [ ] Pluralization patterns are syntactically correct (`{count, plural, one {...} other {...}}`)
- [ ] Variable interpolation patterns use correct `{variable}` syntax
- [ ] No unterminated brackets or braces

### JSON Validation
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files maintain consistent structure
- [ ] No duplicate keys within namespaces

### Integration Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Sample usage works: `useTranslations('settings')` returns correct strings
- [ ] Nested access works: `useTranslations('settings.help.sections.gettingStarted')` returns section strings

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Changes are additive (creating new namespace)
  - JSON files have no runtime execution risk
  - Easy to validate with JSON linting
  - Rollback is straightforward (remove namespace)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Malformed JSON syntax | Low | Medium | Validate with JSON linting before commit |
| Missing keys in non-English files | Medium | Low | Use English as fallback, structure will be synced |
| Key naming inconsistencies | Low | Low | Follow established Plan-111 conventions |
| Deeply nested structure issues | Low | Low | Keep nesting to max 4 levels |

## Future Integration Points

This namespace structure will be consumed by:

1. **Task 2G.2**: Account settings components update
2. **Task 2G.3**: Profile components update
3. **Task 2G.4**: Preferences components update
4. **Task 2G.5**: Help page update
5. **Task 2G.6**: Translation generation for non-English languages

## Component-to-Namespace Mapping

The following components will use the `settings` namespace:

| Component | Namespace Path | Strings Count |
|-----------|---------------|---------------|
| `DashboardSettingsPopover` | `settings.preferences` | ~8 |
| `AdvancedDashboardTools` | `settings.preferences.dashboard` | ~2 |
| `AccountAccessSummary` | `settings.account` | ~15 |
| Help page | `settings.help` | ~80 |
| Future account settings | `settings.account` | ~10 |
| Future profile settings | `settings.profile` | ~7 |

## Notes

### Alignment with Plan-111

This implementation follows the structure specified in Plan-111, Section "Sub-Epic 2G: Settings & Account", including:
- Same key hierarchy approach
- Same categorization by feature area
- Variable interpolation for dynamic content

### String Organization

The `settings` namespace is organized by functional area:
- **sections** - Navigation/tab labels for settings UI
- **account** - Account management and access control
- **profile** - User profile customization
- **preferences** - Application preferences (language, theme, dashboard)
- **help** - Comprehensive user guidance content
- **navigation** - Settings-related navigation labels

### Help Content Strategy

The help section contains the most strings (~80) because it includes:
- 5 main instruction sections
- Multiple steps per section
- Tips and descriptive content
- Action links and CTAs

This content is currently hardcoded in the Help page and will be migrated to translations in Task 2G.5.

### Estimated String Count Summary

| Category | Estimated Count |
|----------|-----------------|
| Top-level (title, subtitle) | 2 |
| Sections | 5 |
| Account | 18 |
| Profile | 7 |
| Preferences | 12 |
| Help | 80+ |
| Navigation | 4 |
| **Total** | **~130** |

---

*End of Implementation Overview*
