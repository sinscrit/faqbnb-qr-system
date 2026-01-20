# REQ-E02-013: Create Settings Namespace Structure in Messages File - Detailed Task Breakdown

*Generated: 2026-01-20 21:15:00 UTC*
*Last Modified: 2026-01-20 21:15:00 UTC*

## Reference

- **Request**: REQ-E02-013 (Create Settings Namespace Structure in Messages File)
- **Overview Document**: docs/REQ-E02-013-create-settings-namespace-structure-overview.md
- **Source**: docs/gen_requests_epic2.md (Request #13)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2G (Settings & Account)
- **Task ID**: 2G.1
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

---

## Document Purpose

This detailed task breakdown transforms the REQ-E02-013 overview into granular, actionable implementation tasks. Each task is designed to be a single, focused unit of work that can be completed independently while maintaining proper dependencies.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with existing namespaces (`common`, `auth`, `dashboard`, `items`, `errors`, `language`)
- [ ] All 6 language files exist: `en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] Application builds successfully with current translations

---

## Task Breakdown

### Task 1: Analyze Settings-Related Components and Extract Strings

**Task ID**: 2G.1.1
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path

#### Description
Systematically review all settings-related components to identify and catalog every hardcoded string that needs translation.

#### Target Components

| Component | Path | Purpose |
|-----------|------|---------|
| DashboardSettingsPopover | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | Dashboard preference toggles |
| AdvancedDashboardTools | `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` | Advanced tools section header |
| AccountAccessSummary | `/src/components/AccountAccessSummary.tsx` | Account access display |
| Help page | `/src/app/dashboard2/help/page.tsx` | User guide and instructions |

#### Identified Strings from DashboardSettingsPopover.tsx

| Line | String | Proposed Key |
|------|--------|--------------|
| 149 | `"Dashboard settings"` (aria-label) | `settings.preferences.ariaLabel` |
| 162 | `"Dashboard settings"` (dialog aria-label) | `settings.preferences.dialogAriaLabel` |
| 167 | `"Dashboard Settings"` | `settings.preferences.title` |
| 174 | `"Close settings"` (aria-label) | `settings.preferences.closeAriaLabel` |
| 185 | `"Show Advanced Tools"` | `settings.preferences.showAdvancedTools` |
| 186 | `"Always show grouping and bulk operations"` | `settings.preferences.showAdvancedToolsDescription` |
| 192 | `"Show Portfolio Summary"` | `settings.preferences.showPortfolioSummary` |
| 193 | `"Always show portfolio overview card"` | `settings.preferences.showPortfolioSummaryDescription` |
| 199-200 | `"These settings override automatic UI adaptation based on your property count."` | `settings.preferences.overrideHint` |

#### Identified Strings from AdvancedDashboardTools.tsx

| Line | String | Proposed Key |
|------|--------|--------------|
| 99 | `"Advanced Tools"` | `settings.preferences.advancedToolsTitle` |
| 116 | `"Advanced Tools"` (desktop) | `settings.preferences.advancedToolsTitle` |

#### Identified Strings from AccountAccessSummary.tsx

| Line | String | Proposed Key |
|------|--------|--------------|
| 58 | `"Account Access"` | `settings.account.accountAccess` |
| 67 | `"Accounts Owned"` | `settings.account.accountsOwned` |
| 72 | `"Accounts Accessed"` | `settings.account.accountsAccessed` |
| 80 | `"Accounts You Own"` | `settings.account.accountsYouOwn` |
| 86-87 | `"No owned accounts"` | `settings.account.noOwnedAccounts` |
| 103 | `"{count} members"` | `settings.account.membersCount` |
| 108 | `"Owner"` | `settings.account.owner` |
| 111 | `"Created {date}"` | `settings.account.createdOn` |
| 124 | `"Accounts You Access"` | `settings.account.accountsYouAccess` |
| 130-131 | `"No accessible accounts"` | `settings.account.noAccessibleAccounts` |
| 152-157 | `"admin"` / `"member"` (roles) | `settings.account.admin` / `settings.account.member` |
| 162 | `"Since {date}"` | `settings.account.since` |
| 174 | `"Total Accounts:"` | `settings.account.totalAccounts` |
| 178 | `"Total Users with Access:"` | `settings.account.totalUsersWithAccess` |

#### Identified Strings from Help page (/src/app/dashboard2/help/page.tsx)

**Page-level strings:**

| Line | String | Proposed Key |
|------|--------|--------------|
| 332 | `"Loading..."` | `common.loading` (use existing) |
| 341 | `"Authentication Required"` | `auth.authenticationRequired` |
| 342 | `"Please log in to access help."` | `auth.pleaseLogIn` |
| 345 | `"Go to Login"` | `auth.goToLogin` |
| 358 | `"Access Denied"` | `errors.accessDenied` |
| 359 | `"You do not have permission to view this page."` | `errors.noPermissionToView` |
| 364 | `"Back to Dashboard"` | `dashboard.backToDashboard` |
| 379-380 | `"Help & User Guide"` | `settings.help.title` |
| 383-384 | `"Learn how to use FAQBNB to create and manage your property items"` | `settings.help.subtitle` |
| 393 | `"Create Item"` | `items.createNew` (use existing) |
| 401 | `"Quick Links"` | `settings.help.quickLinks` |
| 424 | `"Still Need Help?"` | `settings.help.stillNeedHelp` |
| 425-426 | `"Can't find what you're looking for? Contact our support team for assistance."` | `settings.help.stillNeedHelpDescription` |
| 431 | `"Contact Support"` | `settings.help.contactSupport` |

**Section strings (INSTRUCTION_SECTIONS constant):**

Getting Started section:
| String | Proposed Key |
|--------|--------------|
| `"Getting Started"` | `settings.help.sections.gettingStarted.title` |
| `"Learn the basics of setting up your FAQBNB account"` | `settings.help.sections.gettingStarted.description` |
| `"Create Your First Property"` | `settings.help.sections.gettingStarted.step1Title` |
| `"After signing in, navigate to Properties..."` | `settings.help.sections.gettingStarted.step1Content` |
| `"You can add multiple properties to manage different locations."` | `settings.help.sections.gettingStarted.step1Tip` |
| `"Go to Properties"` | `settings.help.links.goToProperties` |
| `"Add Items to Your Property"` | `settings.help.sections.gettingStarted.step2Title` |
| `"Items are the appliances, amenities..."` | `settings.help.sections.gettingStarted.step2Content` |
| `"Create an Item"` | `settings.help.links.createItem` |
| `"Add Instructions for Each Item"` | `settings.help.sections.gettingStarted.step3Title` |
| `"Each item can have multiple instruction articles..."` | `settings.help.sections.gettingStarted.step3Content` |

Managing Properties section:
| String | Proposed Key |
|--------|--------------|
| `"Managing Properties"` | `settings.help.sections.propertyManagement.title` |
| `"Set up and organize your rental properties"` | `settings.help.sections.propertyManagement.description` |
| `"Adding a Property"` | `settings.help.sections.propertyManagement.addingProperty` |
| `"Click 'Add Property' from the Properties page..."` | `settings.help.sections.propertyManagement.addingPropertyContent` |
| `"Use descriptive names like 'Beach House'..."` | `settings.help.sections.propertyManagement.addingPropertyTip` |
| `"Manage Properties"` | `settings.help.links.manageProperties` |
| `"Editing Property Details"` | `settings.help.sections.propertyManagement.editingProperty` |
| `"Click on any property card to edit..."` | `settings.help.sections.propertyManagement.editingPropertyContent` |
| `"Property-Specific Items"` | `settings.help.sections.propertyManagement.propertyItems` |
| `"Items are automatically associated..."` | `settings.help.sections.propertyManagement.propertyItemsContent` |

Creating Items section:
| String | Proposed Key |
|--------|--------------|
| `"Creating Items"` | `settings.help.sections.itemCreation.title` |
| `"Add and document the items in your property"` | `settings.help.sections.itemCreation.description` |
| `"Start the Item Creation Wizard"` | `settings.help.sections.itemCreation.step1Title` |
| `"From the dashboard, click 'Create New Item'..."` | `settings.help.sections.itemCreation.step1Content` |
| `"Create Item"` | `settings.help.links.createItem` |
| `"Select Room and Item Type"` | `settings.help.sections.itemCreation.step2Title` |
| `"Choose where the item is located..."` | `settings.help.sections.itemCreation.step2Content` |
| `"Name Your Item"` | `settings.help.sections.itemCreation.step3Title` |
| `"Enter a clear, descriptive name..."` | `settings.help.sections.itemCreation.step3Content` |
| `"Choose Instruction Purpose"` | `settings.help.sections.itemCreation.step4Title` |
| `"Select what type of instructions..."` | `settings.help.sections.itemCreation.step4Content` |
| `"Add Content"` | `settings.help.sections.itemCreation.step5Title` |
| `"Add photos, videos, text instructions..."` | `settings.help.sections.itemCreation.step5Content` |
| `"Photos work best for step-by-step..."` | `settings.help.sections.itemCreation.step5Tip` |
| `"Review and Save"` | `settings.help.sections.itemCreation.step6Title` |
| `"Preview your item and its instructions..."` | `settings.help.sections.itemCreation.step6Content` |

QR Code Generation section:
| String | Proposed Key |
|--------|--------------|
| `"QR Code Generation"` | `settings.help.sections.qrCodes.title` |
| `"Generate and print QR codes for your items"` | `settings.help.sections.qrCodes.description` |
| `"Automatic QR Code Generation"` | `settings.help.sections.qrCodes.automaticGeneration` |
| `"QR codes are generated automatically..."` | `settings.help.sections.qrCodes.automaticGenerationContent` |
| `"Printing QR Codes"` | `settings.help.sections.qrCodes.printing` |
| `"From the Items page, select items..."` | `settings.help.sections.qrCodes.printingContent` |
| `"View Items"` | `settings.help.links.viewItems` |
| `"QR Code Placement"` | `settings.help.sections.qrCodes.placement` |
| `"Place QR codes near the item..."` | `settings.help.sections.qrCodes.placementContent` |
| `"Use waterproof labels..."` | `settings.help.sections.qrCodes.placementTip` |
| `"Testing QR Codes"` | `settings.help.sections.qrCodes.testing` |
| `"Always test your QR codes..."` | `settings.help.sections.qrCodes.testingContent` |

Managing Items section:
| String | Proposed Key |
|--------|--------------|
| `"Managing Items"` | `settings.help.sections.itemManagement.title` |
| `"Edit, organize, and maintain your item library"` | `settings.help.sections.itemManagement.description` |
| `"Viewing All Items"` | `settings.help.sections.itemManagement.viewingItems` |
| `"The Items page shows all items..."` | `settings.help.sections.itemManagement.viewingItemsContent` |
| `"View Items"` | `settings.help.links.viewItems` |
| `"Editing Items"` | `settings.help.sections.itemManagement.editingItems` |
| `"Click on any item to edit..."` | `settings.help.sections.itemManagement.editingItemsContent` |
| `"Adding Multiple Instructions"` | `settings.help.sections.itemManagement.multipleInstructions` |
| `"A single item can have multiple..."` | `settings.help.sections.itemManagement.multipleInstructionsContent` |
| `"Bulk Operations"` | `settings.help.sections.itemManagement.bulkOperations` |
| `"Select multiple items to perform..."` | `settings.help.sections.itemManagement.bulkOperationsContent` |

#### Acceptance Criteria for Task 1
- [ ] All hardcoded strings are identified and documented
- [ ] Each string has a proposed translation key following namespace.component.element.variant pattern
- [ ] Strings are categorized by component/section
- [ ] ICU format patterns identified for dynamic content (e.g., plural, dates)

---

### Task 2: Create Settings Namespace Base Structure

**Task ID**: 2G.1.2
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 1

#### Description
Add the `settings` namespace to `/messages/en.json` with the base structure including top-level keys and section labels.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Changes Required**:

Add the following structure after the existing `language` namespace:

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
    "navigation": {
      "settings": "Settings",
      "help": "Help",
      "account": "Account",
      "preferences": "Preferences"
    }
  }
}
```

#### Acceptance Criteria for Task 2
- [ ] `settings` namespace added to `/messages/en.json`
- [ ] Top-level `title` and `subtitle` keys present
- [ ] `sections` subcategory with 5 section labels
- [ ] `navigation` subcategory with 4 navigation labels
- [ ] JSON is valid (no syntax errors)
- [ ] Application builds successfully

---

### Task 3: Add Account Settings Strings

**Task ID**: 2G.1.3
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 2

#### Description
Add account-related strings to the `settings.account` subcategory, sourced from AccountAccessSummary component analysis.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings` namespace**:

```json
{
  "settings": {
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
    }
  }
}
```

#### ICU Format Notes

| Key | Pattern | Usage Example |
|-----|---------|---------------|
| `membersCount` | `{count, plural, one {# member} other {# members}}` | `t('membersCount', { count: 5 })` → "5 members" |
| `createdOn` | `Created {date}` | `t('createdOn', { date: '2026-01-15' })` → "Created 2026-01-15" |
| `since` | `Since {date}` | `t('since', { date: '2026-01-01' })` → "Since 2026-01-01" |

#### Acceptance Criteria for Task 3
- [ ] `settings.account` subcategory added with all 18 keys
- [ ] ICU pluralization syntax is correct for `membersCount`
- [ ] Variable interpolation syntax is correct for `createdOn` and `since`
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 4: Add Profile Settings Strings

**Task ID**: 2G.1.4
**Estimated Effort**: 0.5 story points
**Priority**: P2 - Standard
**Depends On**: Task 2

#### Description
Add profile-related strings to the `settings.profile` subcategory for future profile management features.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings` namespace**:

```json
{
  "settings": {
    "profile": {
      "name": "Display Name",
      "namePlaceholder": "Enter your display name",
      "avatar": "Profile Photo",
      "uploadAvatar": "Upload Photo",
      "removeAvatar": "Remove Photo",
      "changeAvatar": "Change Photo",
      "avatarHint": "Recommended: Square image, at least 200x200 pixels"
    }
  }
}
```

#### Acceptance Criteria for Task 4
- [ ] `settings.profile` subcategory added with all 7 keys
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 5: Add Preferences Settings Strings

**Task ID**: 2G.1.5
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 2

#### Description
Add preference-related strings to the `settings.preferences` subcategory, sourced from DashboardSettingsPopover component analysis.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings` namespace**:

```json
{
  "settings": {
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
      "title": "Dashboard Settings",
      "ariaLabel": "Dashboard settings",
      "dialogAriaLabel": "Dashboard settings",
      "closeAriaLabel": "Close settings",
      "dashboard": "Dashboard Settings",
      "dashboardDescription": "Customize your dashboard experience",
      "showAdvancedTools": "Show Advanced Tools",
      "showAdvancedToolsDescription": "Always show grouping and bulk operations",
      "showPortfolioSummary": "Show Portfolio Summary",
      "showPortfolioSummaryDescription": "Always show portfolio overview card",
      "overrideHint": "These settings override automatic UI adaptation based on your property count.",
      "advancedToolsTitle": "Advanced Tools"
    }
  }
}
```

#### Acceptance Criteria for Task 5
- [ ] `settings.preferences` subcategory added with all 19 keys
- [ ] Nested `themeOptions` structure is correct
- [ ] All aria-label strings included for accessibility
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 6: Add Help Page Strings - Base Structure

**Task ID**: 2G.1.6
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 2

#### Description
Add the help page base structure including page-level strings and common elements.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings` namespace**:

```json
{
  "settings": {
    "help": {
      "title": "Help & User Guide",
      "subtitle": "Learn how to use FAQBNB to create and manage your property items",
      "quickLinks": "Quick Links",
      "stillNeedHelp": "Still Need Help?",
      "stillNeedHelpDescription": "Can't find what you're looking for? Contact our support team for assistance.",
      "contactSupport": "Contact Support",
      "tip": "Tip: {tip}",
      "links": {
        "goToProperties": "Go to Properties",
        "createItem": "Create an Item",
        "manageProperties": "Manage Properties",
        "viewItems": "View Items"
      },
      "sections": {}
    }
  }
}
```

#### Acceptance Criteria for Task 6
- [ ] `settings.help` subcategory added with base structure
- [ ] Page-level strings present (title, subtitle, quickLinks, stillNeedHelp, contactSupport)
- [ ] `tip` string uses variable interpolation for dynamic tip content
- [ ] `links` subcategory for navigation links
- [ ] Empty `sections` object ready for section content
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 7: Add Help Page Strings - Getting Started Section

**Task ID**: 2G.1.7
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 6

#### Description
Add the Getting Started section strings to the help page namespace.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings.help.sections`**:

```json
{
  "settings": {
    "help": {
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
        }
      }
    }
  }
}
```

#### Acceptance Criteria for Task 7
- [ ] `gettingStarted` section added with 9 keys
- [ ] Step titles and content are complete
- [ ] Tip content for step 1 included
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 8: Add Help Page Strings - Property Management Section

**Task ID**: 2G.1.8
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 6

#### Description
Add the Property Management section strings to the help page namespace.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings.help.sections`**:

```json
{
  "settings": {
    "help": {
      "sections": {
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
        }
      }
    }
  }
}
```

#### Acceptance Criteria for Task 8
- [ ] `propertyManagement` section added with 9 keys
- [ ] All property management guidance content included
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 9: Add Help Page Strings - Item Creation Section

**Task ID**: 2G.1.9
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 6

#### Description
Add the Item Creation section strings to the help page namespace.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings.help.sections`**:

```json
{
  "settings": {
    "help": {
      "sections": {
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
        }
      }
    }
  }
}
```

#### Acceptance Criteria for Task 9
- [ ] `itemCreation` section added with 14 keys
- [ ] All 6 steps documented with titles and content
- [ ] Tip for step 5 included
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 10: Add Help Page Strings - QR Codes Section

**Task ID**: 2G.1.10
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 6

#### Description
Add the QR Code Generation section strings to the help page namespace.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings.help.sections`**:

```json
{
  "settings": {
    "help": {
      "sections": {
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
        }
      }
    }
  }
}
```

#### Acceptance Criteria for Task 10
- [ ] `qrCodes` section added with 10 keys
- [ ] All QR code guidance content included
- [ ] Tip for placement included
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 11: Add Help Page Strings - Item Management Section

**Task ID**: 2G.1.11
**Estimated Effort**: 1 story point
**Priority**: P1 - Critical Path
**Depends On**: Task 6

#### Description
Add the Item Management section strings to the help page namespace.

#### Implementation Details

**File to Modify**: `/messages/en.json`

**Add within `settings.help.sections`**:

```json
{
  "settings": {
    "help": {
      "sections": {
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
      }
    }
  }
}
```

#### Acceptance Criteria for Task 11
- [ ] `itemManagement` section added with 10 keys
- [ ] All item management guidance content included
- [ ] JSON is valid
- [ ] Application builds successfully

---

### Task 12: Sync Structure to Non-English Language Files

**Task ID**: 2G.1.12
**Estimated Effort**: 1 story point
**Priority**: P2 - Standard
**Depends On**: Tasks 2-11

#### Description
Add the same `settings` namespace structure to all 5 non-English language files with English placeholder values. Actual translations will be generated in Task 2G.6.

#### Files to Modify
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

#### Implementation Details

Copy the complete `settings` namespace from `en.json` to each non-English file. Values remain in English as placeholders until Task 2G.6 generates proper translations.

#### Acceptance Criteria for Task 12
- [ ] All 5 non-English files have identical `settings` namespace structure
- [ ] All keys match exactly between files
- [ ] All files are valid JSON
- [ ] Application builds successfully with each locale

---

### Task 13: Validate Complete Namespace Structure

**Task ID**: 2G.1.13
**Estimated Effort**: 0.5 story points
**Priority**: P1 - Critical Path
**Depends On**: Task 12

#### Description
Perform comprehensive validation of the complete `settings` namespace across all language files.

#### Validation Checklist

**Structure Validation**:
- [ ] `settings` namespace exists in all 6 language files
- [ ] `settings.title` and `settings.subtitle` exist
- [ ] `settings.sections` has 5 section labels
- [ ] `settings.account` has 18 strings
- [ ] `settings.profile` has 7 strings
- [ ] `settings.preferences` has 19 strings
- [ ] `settings.help` has base structure (7 keys)
- [ ] `settings.help.links` has 4 link labels
- [ ] `settings.help.sections.gettingStarted` has 9 strings
- [ ] `settings.help.sections.propertyManagement` has 9 strings
- [ ] `settings.help.sections.itemCreation` has 14 strings
- [ ] `settings.help.sections.qrCodes` has 10 strings
- [ ] `settings.help.sections.itemManagement` has 10 strings
- [ ] `settings.navigation` has 4 navigation labels

**ICU Format Validation**:
- [ ] `membersCount` has correct plural syntax
- [ ] `createdOn` has correct variable interpolation
- [ ] `since` has correct variable interpolation
- [ ] `tip` has correct variable interpolation
- [ ] No unterminated brackets or braces

**JSON Validation**:
- [ ] All 6 files are syntactically valid JSON
- [ ] No duplicate keys within namespaces
- [ ] Proper escaping of special characters (quotes)

**Integration Validation**:
- [ ] `npm run build` completes without errors
- [ ] `useTranslations('settings')` returns expected object
- [ ] Nested access works: `useTranslations('settings.help.sections.gettingStarted')`

#### Acceptance Criteria for Task 13
- [ ] All validation checklist items pass
- [ ] No JSON syntax errors
- [ ] Application builds and runs correctly

---

## String Count Summary

| Category | Key Count |
|----------|-----------|
| Top-level (title, subtitle) | 2 |
| Sections | 5 |
| Navigation | 4 |
| Account | 18 |
| Profile | 7 |
| Preferences | 19 |
| Help - base | 7 |
| Help - links | 4 |
| Help - gettingStarted | 9 |
| Help - propertyManagement | 9 |
| Help - itemCreation | 14 |
| Help - qrCodes | 10 |
| Help - itemManagement | 10 |
| **Total** | **118** |

---

## Complete Settings Namespace Structure

The final `/messages/en.json` `settings` namespace should have this structure:

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
    "navigation": {
      "settings": "Settings",
      "help": "Help",
      "account": "Account",
      "preferences": "Preferences"
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
      "title": "Dashboard Settings",
      "ariaLabel": "Dashboard settings",
      "dialogAriaLabel": "Dashboard settings",
      "closeAriaLabel": "Close settings",
      "dashboard": "Dashboard Settings",
      "dashboardDescription": "Customize your dashboard experience",
      "showAdvancedTools": "Show Advanced Tools",
      "showAdvancedToolsDescription": "Always show grouping and bulk operations",
      "showPortfolioSummary": "Show Portfolio Summary",
      "showPortfolioSummaryDescription": "Always show portfolio overview card",
      "overrideHint": "These settings override automatic UI adaptation based on your property count.",
      "advancedToolsTitle": "Advanced Tools"
    },
    "help": {
      "title": "Help & User Guide",
      "subtitle": "Learn how to use FAQBNB to create and manage your property items",
      "quickLinks": "Quick Links",
      "stillNeedHelp": "Still Need Help?",
      "stillNeedHelpDescription": "Can't find what you're looking for? Contact our support team for assistance.",
      "contactSupport": "Contact Support",
      "tip": "Tip: {tip}",
      "links": {
        "goToProperties": "Go to Properties",
        "createItem": "Create an Item",
        "manageProperties": "Manage Properties",
        "viewItems": "View Items"
      },
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
      }
    }
  }
}
```

---

## Usage Examples

### DashboardSettingsPopover Component

```typescript
'use client';
import { useTranslations } from 'next-intl';

function DashboardSettingsPopover({ preferences, onPreferenceChange }) {
  const t = useTranslations('settings.preferences');

  return (
    <div>
      <button aria-label={t('ariaLabel')}>...</button>
      <div role="dialog" aria-label={t('dialogAriaLabel')}>
        <h3>{t('title')}</h3>
        <button aria-label={t('closeAriaLabel')}>X</button>

        <ToggleSwitch
          label={t('showAdvancedTools')}
          description={t('showAdvancedToolsDescription')}
          checked={preferences.forceAdvancedTools}
          onChange={(v) => onPreferenceChange('forceAdvancedTools', v)}
        />
        <ToggleSwitch
          label={t('showPortfolioSummary')}
          description={t('showPortfolioSummaryDescription')}
          checked={preferences.forcePortfolioView}
          onChange={(v) => onPreferenceChange('forcePortfolioView', v)}
        />

        <p>{t('overrideHint')}</p>
      </div>
    </div>
  );
}
```

### AccountAccessSummary Component

```typescript
'use client';
import { useTranslations } from 'next-intl';

function AccountAccessSummary({ ownedAccounts, accessibleAccounts, summary }) {
  const t = useTranslations('settings.account');

  return (
    <div>
      <h3>{t('accountAccess')}</h3>

      <div>
        <p>{t('accountsOwned')}</p>
        <p>{summary.totalOwnedAccounts}</p>
      </div>
      <div>
        <p>{t('accountsAccessed')}</p>
        <p>{summary.totalAccessibleAccounts}</p>
      </div>

      <h4>{t('accountsYouOwn')}</h4>
      {ownedAccounts.length === 0 ? (
        <p>{t('noOwnedAccounts')}</p>
      ) : (
        ownedAccounts.map((account) => (
          <div key={account.id}>
            <span>{t('owner')}</span>
            <span>{t('membersCount', { count: account.memberCount })}</span>
            <span>{t('createdOn', { date: new Date(account.created_at).toLocaleDateString() })}</span>
          </div>
        ))
      )}

      <h4>{t('accountsYouAccess')}</h4>
      {accessibleAccounts.length === 0 ? (
        <p>{t('noAccessibleAccounts')}</p>
      ) : (
        accessibleAccounts.map((account) => (
          <div key={account.id}>
            <span>{account.userRole === 'admin' ? t('admin') : t('member')}</span>
            <span>{t('since', { date: new Date(account.created_at).toLocaleDateString() })}</span>
          </div>
        ))
      )}

      <div>
        <span>{t('totalAccounts')}:</span>
        <span>{summary.totalMemberAccounts}</span>
      </div>
      <div>
        <span>{t('totalUsersWithAccess')}:</span>
        <span>{summary.totalUsersWithAccess}</span>
      </div>
    </div>
  );
}
```

### Help Page Component

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
      <a href="/dashboard2/properties">{t('sections.gettingStarted.title')}</a>
      <a href="/dashboard2/properties">{t('sections.propertyManagement.title')}</a>

      {/* Getting Started Section */}
      <section>
        <h2>{t('sections.gettingStarted.title')}</h2>
        <p>{t('sections.gettingStarted.description')}</p>

        <h3>{t('sections.gettingStarted.step1Title')}</h3>
        <p>{t('sections.gettingStarted.step1Content')}</p>
        <p className="tip">{t('tip', { tip: t('sections.gettingStarted.step1Tip') })}</p>
        <a href="/dashboard2/properties">{t('links.goToProperties')}</a>
      </section>

      {/* Still Need Help */}
      <div>
        <h2>{t('stillNeedHelp')}</h2>
        <p>{t('stillNeedHelpDescription')}</p>
        <a href="mailto:support@faqbnb.com">{t('contactSupport')}</a>
      </div>
    </div>
  );
}
```

---

## Dependencies and Relationships

### Task Dependencies Graph

```
Task 1 (Analyze)
    ↓
Task 2 (Base Structure)
    ↓
    ├── Task 3 (Account) ─────────────┐
    ├── Task 4 (Profile) ─────────────┤
    ├── Task 5 (Preferences) ─────────┤
    └── Task 6 (Help Base) ───────────┤
            ↓                         │
            ├── Task 7 (Getting Started)
            ├── Task 8 (Property Mgmt) ├── Task 12 (Sync Languages)
            ├── Task 9 (Item Creation)        ↓
            ├── Task 10 (QR Codes)      Task 13 (Validate)
            └── Task 11 (Item Mgmt)
```

### Parallel Execution Opportunities

Tasks 3, 4, 5, 6 can run in parallel after Task 2 completes.
Tasks 7, 8, 9, 10, 11 can run in parallel after Task 6 completes.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON syntax errors | Low | Medium | Validate JSON after each task |
| Missed strings during analysis | Medium | Low | Review component code during component updates (Tasks 2G.2-2G.5) |
| Key naming inconsistencies | Low | Low | Follow established conventions, review during validation |
| ICU format errors | Low | Medium | Test pluralization and interpolation patterns |

---

## Future Integration

This namespace structure will be consumed by:

1. **Task 2G.2**: DashboardSettingsPopover and AdvancedDashboardTools update
2. **Task 2G.3**: AccountAccessSummary and profile components update
3. **Task 2G.4**: Preferences and account settings components update
4. **Task 2G.5**: Help page update with complete translation coverage
5. **Task 2G.6**: Translation generation for 5 non-English languages

---

*End of Detailed Task Breakdown Document*
