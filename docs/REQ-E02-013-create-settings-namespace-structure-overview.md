# REQ-E02-013: Create `settings` Namespace Structure - Implementation Overview

**Request ID:** REQ-E02-013
**Title:** Create `settings` namespace structure
**Epic:** Epic 2 - L10N (Localization)
**Sub-Epic:** 2G - Settings & Account
**Task:** 2G.1
**Related Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Status:** PENDING
**Created:** 2026-01-22 20:38
**Last Modified:** 2026-01-22 20:38

---

## 1. Executive Summary

This task establishes the comprehensive `settings` namespace structure for user settings, account management, profile information, preferences, and help content. This namespace will organize approximately 150 translation keys across multiple sub-namespaces covering account settings, user profile, preferences (language, theme, timezone), notifications, security, and help/support features.

**Current State:**
- A partial `settings` namespace exists within `dashboard` namespace (lines 1027-1040 in messages/en.json)
- Currently contains only 9 keys for dashboard-specific settings (advanced tools, portfolio view toggles)
- DashboardSettingsPopover component uses `dashboard.settings.*` namespace
- Help page contains ~50+ hardcoded strings across extensive content
- No dedicated account settings, profile, or preferences pages currently exist

**Target State:**
- New top-level `settings` namespace with ~150 keys organized into 7 sub-namespaces
- Clear separation between dashboard-specific settings and general app settings
- Migration plan for existing `dashboard.settings.*` keys
- Foundation for future account settings, profile, and preferences UI
- Internationalized help page content

**Estimated Impact:**
- ~150 new translation keys across 6 languages
- Foundation for Sub-Epic 2G Tasks 2G.2-2G.6
- Enable user preference management across the application
- Support for future feature: language selection, theme preferences, etc.

---

## 2. Technical Context

### 2.1 Current Implementation

**Existing Settings Keys (dashboard.settings namespace):**
```json
"dashboard": {
  "settings": {
    "title": "Dashboard Settings",
    "advancedTools": {
      "label": "Show Advanced Tools",
      "description": "Always show grouping and bulk operations"
    },
    "portfolioView": {
      "label": "Show Portfolio Summary",
      "description": "Always show portfolio overview card"
    },
    "footer": "These settings override automatic UI adaptation based on your property count.",
    "close": "Close settings",
    "closeAriaLabel": "Close dashboard settings"
  }
}
```

**Location:** `/messages/en.json` lines 1027-1040

**Current Usage:**
- `src/components/SimpleDashboard/DashboardSettingsPopover.tsx` (line 86)
  - Uses `useTranslations('dashboard')`
  - References `t('settings.title')`, `t('settings.closeAriaLabel')`, `t('settings.advancedTools.label')`, etc.

**Help Page (Current State):**
- `src/app/dashboard2/help/page.tsx` (~440 lines)
- Contains extensive hardcoded English strings:
  - Page title: "Help & User Guide" (line 382)
  - Subtitle: "Learn how to use FAQBNB..." (line 386)
  - 5 major instruction sections with ~50+ total strings
  - Section titles: "Getting Started", "Managing Properties", "Creating Items", "QR Code Generation", "Managing Items"
  - Multiple steps per section with titles, content, tips, and link labels
  - Quick links section (line 403)
  - Footer: "Still Need Help?" section (lines 426-435)
- Currently uses only one translation: `t('common.loading.pages.help')` (line 333)

**User Layout (No Settings):**
- `src/app/user/layout.tsx` (~258 lines)
- Navigation includes: Dashboard, Items, Properties, Analytics
- No account settings, profile, or preferences pages exist yet
- Header shows user email and role badge (lines 188-196)
- Simple logout button (lines 200-205)

**Preferences System (Dashboard-specific):**
- `src/hooks/useDashboardPreferences.ts` (~171 lines)
- Manages localStorage preferences: `forceAdvancedTools`, `forcePortfolioView`
- Only used for dashboard display customization
- No integration with broader user account preferences

### 2.2 Target Namespace Structure

Based on the implementation plan (Plan-111-L10N-Epic2-Static-UI-Translation.md lines 1114-1161), the new `settings` namespace should include:

```typescript
{
  "settings": {
    // Top-level metadata
    "title": "Settings",
    "subtitle": "Manage your account settings",

    // Section navigation
    "sections": {
      "account": "Account",
      "profile": "Profile",
      "preferences": "Preferences",
      "notifications": "Notifications",
      "security": "Security"
    },

    // Account settings sub-namespace
    "account": {
      "email": "Email Address",
      "emailDescription": "Your account email address",
      "changeEmail": "Change Email",
      "deleteAccount": "Delete Account",
      "deleteWarning": "This action is permanent and cannot be undone."
    },

    // Profile sub-namespace
    "profile": {
      "name": "Display Name",
      "avatar": "Profile Photo",
      "uploadAvatar": "Upload Photo",
      "removeAvatar": "Remove Photo"
    },

    // Preferences sub-namespace
    "preferences": {
      "language": "Language",
      "languageDescription": "Choose your preferred language",
      "theme": "Theme",
      "themeOptions": {
        "light": "Light",
        "dark": "Dark",
        "system": "System"
      },
      "timezone": "Timezone"
    },

    // Help sub-namespace
    "help": {
      "title": "Help & Support",
      "gettingStarted": "Getting Started",
      "faq": "FAQ",
      "contact": "Contact Support",
      "documentation": "Documentation"
    }
  }
}
```

**Estimated Key Counts by Sub-namespace:**
- `settings.sections.*` - 5 keys
- `settings.account.*` - ~20 keys (email, password, delete account, etc.)
- `settings.profile.*` - ~15 keys (name, avatar, bio, etc.)
- `settings.preferences.*` - ~25 keys (language, theme, timezone, etc.)
- `settings.notifications.*` - ~20 keys (email notifications, push, etc.)
- `settings.security.*` - ~15 keys (password, 2FA, sessions, etc.)
- `settings.help.*` - ~50 keys (help page content migration)
- **Total:** ~150 keys

### 2.3 Integration Points

**1. Dashboard Settings Migration:**
- Current: `dashboard.settings.*` (9 keys)
- Decision needed: Keep in `dashboard.settings.*` or move to `settings.dashboard.*`?
- Recommendation: Keep in `dashboard.settings.*` (dashboard-specific UI customization, not general account settings)

**2. Help Page Integration:**
- Current: `src/app/dashboard2/help/page.tsx` with hardcoded strings
- Target: Use `settings.help.*` namespace
- Content organization:
  - `settings.help.page.*` - Page-level strings (title, subtitle, footer)
  - `settings.help.sections.*` - Section metadata
  - `settings.help.gettingStarted.*` - Getting started content
  - `settings.help.propertyManagement.*` - Property management content
  - `settings.help.itemCreation.*` - Item creation content
  - `settings.help.qrCodes.*` - QR code content
  - `settings.help.itemManagement.*` - Item management content

**3. Future Settings Pages:**
- Account settings page (not yet created) - Will use `settings.account.*`
- Profile page (not yet created) - Will use `settings.profile.*`
- Preferences page (not yet created) - Will use `settings.preferences.*`

**4. Components to Update in Later Tasks:**
- Task 2G.2: Update account settings components
- Task 2G.3: Update profile components
- Task 2G.4: Update preferences components
- Task 2G.5: Update help page (src/app/dashboard2/help/page.tsx)
- Task 2G.6: Generate translations for 5 non-English languages

---

## 3. Detailed Requirements

### 3.1 Namespace Structure Creation

**Primary Objective:** Define comprehensive `settings` namespace with all sub-namespaces and translation keys organized logically for settings, account management, profile, preferences, and help content.

**Sub-namespaces to Create:**

1. **`settings.sections`** - Section navigation labels (5 keys)
2. **`settings.account`** - Account management (20 keys)
3. **`settings.profile`** - User profile information (15 keys)
4. **`settings.preferences`** - User preferences (25 keys)
5. **`settings.notifications`** - Notification settings (20 keys)
6. **`settings.security`** - Security settings (15 keys)
7. **`settings.help`** - Help & support content (50 keys)

**Total Estimated Keys:** ~150

### 3.2 Translation File Updates

**Files to Modify:**

1. **`/messages/en.json`** (Primary)
   - Add new `settings` namespace at appropriate location (after `properties` namespace)
   - Organize with clear sub-namespace structure
   - Include descriptive comments for each sub-namespace
   - Use ICU message format for pluralization where needed
   - Include aria-label and accessibility strings

2. **Non-English Translation Files** (Placeholder content for Task 2G.6)
   - `/messages/fr.json` - French placeholders
   - `/messages/es.json` - Spanish placeholders
   - `/messages/de.json` - German placeholders
   - `/messages/nl.json` - Dutch placeholders
   - `/messages/it.json` - Italian placeholders

   **Action:** Add `settings` namespace structure with English text as placeholders. These will be translated in Task 2G.6.

### 3.3 Help Page Content Mapping

**Current Hardcoded Strings to Map:**

From `src/app/dashboard2/help/page.tsx`:

**Page-Level:**
- Line 382: "Help & User Guide" → `settings.help.page.title`
- Line 386: "Learn how to use FAQBNB to create and manage your property items" → `settings.help.page.subtitle`
- Line 395: "Create Item" → `settings.help.page.createItemButton`
- Line 403: "Quick Links" → `settings.help.page.quickLinksTitle`
- Line 426: "Still Need Help?" → `settings.help.page.footerTitle`
- Line 428: "Can't find what you're looking for? Contact our support team for assistance." → `settings.help.page.footerText`
- Line 434: "Contact Support" → `settings.help.page.contactButton`

**Section: Getting Started (lines 78-104):**
- Title: "Getting Started" → `settings.help.gettingStarted.title`
- Description: "Learn the basics of setting up your FAQBNB account" → `settings.help.gettingStarted.description`
- Step 1 Title: "Create Your First Property" → `settings.help.gettingStarted.step1.title`
- Step 1 Content → `settings.help.gettingStarted.step1.content`
- Step 1 Tip → `settings.help.gettingStarted.step1.tip`
- Step 1 Link: "Go to Properties" → `settings.help.gettingStarted.step1.linkLabel`
- (Similar pattern for steps 2-3)

**Section: Property Management (lines 107-129):**
- Similar structure to Getting Started
- ~9 keys (title, description, 3 steps with title/content/tip/link)

**Section: Item Creation (lines 132-173):**
- 6 steps with detailed content
- ~19 keys (title, description, 6 steps × 3-4 fields each)

**Section: QR Codes (lines 176-203):**
- 4 steps
- ~13 keys (title, description, 4 steps with title/content/tip)

**Section: Item Management (lines 206-233):**
- 4 steps
- ~13 keys (title, description, 4 steps with title/content)

**Total Help Page Keys:** ~50-60 keys

### 3.4 ICU Message Format Requirements

**Pluralization Examples:**

```json
{
  "settings": {
    "account": {
      "sessionsActive": "{count, plural, one {# active session} other {# active sessions}}"
    },
    "notifications": {
      "unreadCount": "{count, plural, =0 {No unread notifications} one {# unread notification} other {# unread notifications}}"
    }
  }
}
```

**Variable Interpolation Examples:**

```json
{
  "settings": {
    "account": {
      "emailUpdated": "Email updated to {email}",
      "lastLogin": "Last login: {date} at {time}"
    },
    "profile": {
      "welcomeMessage": "Welcome, {name}!"
    }
  }
}
```

### 3.5 Accessibility Strings

All interactive elements need aria-labels and screen-reader text:

```json
{
  "settings": {
    "sections": {
      "navigationAriaLabel": "Settings navigation"
    },
    "account": {
      "emailInputAriaLabel": "Email address input field",
      "changeEmailButtonAriaLabel": "Change email address",
      "deleteAccountButtonAriaLabel": "Delete account permanently"
    },
    "preferences": {
      "languageSelectorAriaLabel": "Select your preferred language",
      "themeSelectorAriaLabel": "Select your preferred theme"
    }
  }
}
```

---

## 4. Implementation Plan

### 4.1 File Changes

**Files to Create:**
- None (namespace only)

**Files to Modify:**

1. **`/messages/en.json`**
   - Add new `settings` namespace after `properties` namespace (after line ~3373)
   - Estimated size: ~150 keys across 7 sub-namespaces
   - Include all keys from implementation plan plus help page content

2. **`/messages/fr.json`**
   - Add `settings` namespace structure with English placeholders
   - Same structure as en.json

3. **`/messages/es.json`**
   - Add `settings` namespace structure with English placeholders
   - Same structure as en.json

4. **`/messages/de.json`**
   - Add `settings` namespace structure with English placeholders
   - Same structure as en.json

5. **`/messages/nl.json`**
   - Add `settings` namespace structure with English placeholders
   - Same structure as en.json

6. **`/messages/it.json`**
   - Add `settings` namespace structure with English placeholders
   - Same structure as en.json

### 4.2 Testing Strategy

**Validation Steps:**

1. **JSON Syntax Validation**
   ```bash
   # Validate all translation files
   node -e "require('./messages/en.json')"
   node -e "require('./messages/fr.json')"
   node -e "require('./messages/es.json')"
   node -e "require('./messages/de.json')"
   node -e "require('./messages/nl.json')"
   node -e "require('./messages/it.json')"
   ```

2. **Structure Verification**
   - Verify all 7 sub-namespaces exist in en.json
   - Verify all non-English files have matching structure
   - Check that key count is ~150 keys total

3. **Key Naming Consistency**
   - All keys use camelCase convention
   - Nested structure follows logical hierarchy
   - Aria-label keys consistently named (e.g., `*AriaLabel`)

4. **ICU Format Validation**
   - Test plural forms with different counts (0, 1, 2, 5)
   - Test variable interpolation with sample data
   - Verify nested ICU messages work correctly

5. **Content Completeness**
   - All help page sections mapped to translation keys
   - All account settings fields covered
   - All preference options included

### 4.3 Risk Assessment

**Low Risk:**
- ✅ Creating new namespace doesn't affect existing code
- ✅ Non-English files are placeholders (will be translated in Task 2G.6)
- ✅ No component changes in this task

**Medium Risk:**
- ⚠️ Large number of keys (~150) increases chance of typos
- ⚠️ Help page content is extensive, mapping must be accurate
- ⚠️ Need to maintain consistency with existing namespace patterns

**Mitigation:**
- Use JSON validator to catch syntax errors
- Create detailed mapping document for help page content
- Follow established patterns from `properties` namespace
- Review with reference to Plan-111 specification

---

## 5. Implementation Tasks

### Task 2G.1.1: Design Complete Settings Namespace Structure (30 min)
**Priority:** HIGH
**Description:** Create comprehensive outline of all settings namespace keys based on implementation plan and help page content analysis.

**Steps:**
1. Review Plan-111 settings namespace specification (lines 1114-1161)
2. Analyze help page content (src/app/dashboard2/help/page.tsx) to identify all hardcoded strings
3. Create detailed key mapping for all 7 sub-namespaces:
   - `settings.sections.*` (5 keys)
   - `settings.account.*` (20 keys)
   - `settings.profile.*` (15 keys)
   - `settings.preferences.*` (25 keys)
   - `settings.notifications.*` (20 keys)
   - `settings.security.*` (15 keys)
   - `settings.help.*` (50 keys)
4. Document ICU message format requirements for plurals and variables
5. Identify all required aria-label and accessibility strings
6. Create help page content mapping document (string → key mapping)

**Acceptance Criteria:**
- Complete outline with ~150 keys organized into 7 sub-namespaces
- Help page mapping document created
- ICU format requirements documented
- All accessibility strings identified

**Dependencies:** None
**Parallel Safe:** Yes

---

### Task 2G.1.2: Implement `settings.sections` Sub-namespace (15 min)
**Priority:** HIGH
**Description:** Add section navigation labels for settings UI.

**Implementation:**
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
      "security": "Security",
      "navigationAriaLabel": "Settings navigation"
    }
  }
}
```

**Files to Modify:**
- `/messages/en.json` - Add `settings.sections.*` keys (after `properties` namespace)
- `/messages/fr.json` - Add structure with English placeholders
- `/messages/es.json` - Add structure with English placeholders
- `/messages/de.json` - Add structure with English placeholders
- `/messages/nl.json` - Add structure with English placeholders
- `/messages/it.json` - Add structure with English placeholders

**Validation:**
- Verify JSON syntax with `node -e "require('./messages/en.json')"`
- Confirm 6 keys added to sections sub-namespace
- Check all 6 language files updated

**Acceptance Criteria:**
- `settings.sections.*` namespace exists in all language files
- 6 keys total: account, profile, preferences, notifications, security, navigationAriaLabel
- English content in en.json, placeholders in other languages
- Valid JSON syntax in all files

**Dependencies:** Task 2G.1.1
**Parallel Safe:** No (sequential after 2G.1.1)

---

### Task 2G.1.3: Implement `settings.account` Sub-namespace (30 min)
**Priority:** HIGH
**Description:** Add account management translation keys.

**Implementation:**
```json
{
  "settings": {
    "account": {
      "title": "Account Settings",
      "subtitle": "Manage your account information and preferences",
      "email": "Email Address",
      "emailDescription": "Your account email address",
      "emailInputAriaLabel": "Email address input field",
      "changeEmail": "Change Email",
      "changeEmailButtonAriaLabel": "Change email address",
      "emailUpdated": "Email updated to {email}",
      "currentPassword": "Current Password",
      "newPassword": "New Password",
      "confirmPassword": "Confirm Password",
      "changePassword": "Change Password",
      "passwordUpdated": "Password updated successfully",
      "deleteAccount": "Delete Account",
      "deleteAccountButtonAriaLabel": "Delete account permanently",
      "deleteWarning": "This action is permanent and cannot be undone.",
      "deleteConfirmation": "Are you sure you want to delete your account?",
      "sessionsActive": "{count, plural, one {# active session} other {# active sessions}}",
      "lastLogin": "Last login: {date} at {time}",
      "accountCreated": "Account created: {date}",
      "manageSubscription": "Manage Subscription"
    }
  }
}
```

**Files to Modify:**
- `/messages/en.json` - Add `settings.account.*` keys
- `/messages/fr.json` - Add structure with English placeholders
- `/messages/es.json` - Add structure with English placeholders
- `/messages/de.json` - Add structure with English placeholders
- `/messages/nl.json` - Add structure with English placeholders
- `/messages/it.json` - Add structure with English placeholders

**Validation:**
- Verify JSON syntax
- Confirm ~20 keys in account sub-namespace
- Test plural forms: `sessionsActive` with count=1 and count=5
- Test variable interpolation: `emailUpdated` with sample email

**Acceptance Criteria:**
- `settings.account.*` namespace with ~20 keys
- ICU plural format for `sessionsActive`
- Variable interpolation for `emailUpdated`, `lastLogin`, `accountCreated`
- Aria-labels for all interactive elements
- All 6 language files updated

**Dependencies:** Task 2G.1.2
**Parallel Safe:** No (sequential)

---

### Task 2G.1.4: Implement `settings.profile` Sub-namespace (20 min)
**Priority:** HIGH
**Description:** Add user profile management translation keys.

**Implementation:**
```json
{
  "settings": {
    "profile": {
      "title": "Profile",
      "subtitle": "Manage your public profile information",
      "displayName": "Display Name",
      "displayNamePlaceholder": "Enter your name",
      "displayNameAriaLabel": "Display name input field",
      "bio": "Bio",
      "bioPlaceholder": "Tell us about yourself",
      "bioMaxLength": "Bio must be 500 characters or less",
      "avatar": "Profile Photo",
      "uploadAvatar": "Upload Photo",
      "uploadAvatarAriaLabel": "Upload profile photo",
      "removeAvatar": "Remove Photo",
      "removeAvatarAriaLabel": "Remove profile photo",
      "avatarUpdated": "Profile photo updated",
      "avatarRemoved": "Profile photo removed",
      "saveChanges": "Save Changes",
      "savingChanges": "Saving...",
      "profileUpdated": "Profile updated successfully"
    }
  }
}
```

**Files to Modify:**
- All 6 translation files (en, fr, es, de, nl, it)

**Validation:**
- ~15 keys in profile sub-namespace
- Aria-labels present
- Action button states (save, saving)

**Acceptance Criteria:**
- `settings.profile.*` namespace with ~15 keys
- All interactive elements have aria-labels
- Success/error message strings included
- All 6 language files updated

**Dependencies:** Task 2G.1.3
**Parallel Safe:** No (sequential)

---

### Task 2G.1.5: Implement `settings.preferences` Sub-namespace (25 min)
**Priority:** HIGH
**Description:** Add user preferences (language, theme, timezone) translation keys.

**Implementation:**
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

**Files to Modify:**
- All 6 translation files

**Validation:**
- ~25 keys in preferences sub-namespace
- Language names in each language's native form
- Theme options present
- Variable interpolation for update messages

**Acceptance Criteria:**
- `settings.preferences.*` namespace with ~25 keys
- Language list with 6 supported languages
- Theme options (light/dark/system)
- Timezone support strings
- All 6 language files updated

**Dependencies:** Task 2G.1.4
**Parallel Safe:** No (sequential)

---

### Task 2G.1.6: Implement `settings.notifications` and `settings.security` Sub-namespaces (30 min)
**Priority:** MEDIUM
**Description:** Add notification and security settings translation keys.

**Implementation:**
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
    },
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

**Files to Modify:**
- All 6 translation files

**Validation:**
- ~20 keys in notifications sub-namespace
- ~15 keys in security sub-namespace
- Plural forms for unread counts and active sessions
- Toggle states for boolean settings

**Acceptance Criteria:**
- `settings.notifications.*` namespace with ~20 keys
- `settings.security.*` namespace with ~15 keys
- ICU plural formats for counts
- All 6 language files updated

**Dependencies:** Task 2G.1.5
**Parallel Safe:** No (sequential)

---

### Task 2G.1.7: Implement `settings.help` Sub-namespace - Core Structure (30 min)
**Priority:** HIGH
**Description:** Add help page core structure and page-level keys.

**Implementation:**
```json
{
  "settings": {
    "help": {
      "page": {
        "title": "Help & User Guide",
        "subtitle": "Learn how to use FAQBNB to create and manage your property items",
        "createItemButton": "Create Item",
        "quickLinksTitle": "Quick Links",
        "footerTitle": "Still Need Help?",
        "footerText": "Can't find what you're looking for? Contact our support team for assistance.",
        "contactButton": "Contact Support",
        "loadingAriaLabel": "Loading help content"
      },
      "sections": {
        "gettingStarted": "Getting Started",
        "propertyManagement": "Managing Properties",
        "itemCreation": "Creating Items",
        "qrCodes": "QR Code Generation",
        "itemManagement": "Managing Items"
      }
    }
  }
}
```

**Files to Modify:**
- All 6 translation files

**Validation:**
- Verify 7 page-level keys
- Verify 5 section labels
- Check all language files have structure

**Acceptance Criteria:**
- `settings.help.page.*` namespace with 7 keys
- `settings.help.sections.*` namespace with 5 keys
- All 6 language files updated

**Dependencies:** Task 2G.1.6
**Parallel Safe:** No (sequential)

---

### Task 2G.1.8: Implement `settings.help` Sub-namespace - Content Keys (45 min)
**Priority:** HIGH
**Description:** Add all help section content keys (Getting Started, Property Management, Item Creation, QR Codes, Item Management).

**Content Mapping:**

For each of 5 sections, include:
- `title` - Section title
- `description` - Section description
- `step{N}.title` - Step title
- `step{N}.content` - Step content
- `step{N}.tip` - Step tip (optional)
- `step{N}.linkLabel` - Link label (optional)

**Example Structure:**
```json
{
  "settings": {
    "help": {
      "gettingStarted": {
        "title": "Getting Started",
        "description": "Learn the basics of setting up your FAQBNB account",
        "step1": {
          "title": "Create Your First Property",
          "content": "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property.",
          "tip": "You can add multiple properties to manage different locations.",
          "linkLabel": "Go to Properties"
        },
        "step2": {
          "title": "Add Items to Your Property",
          "content": "Items are the appliances, amenities, or features guests interact with. Create items for things like coffee makers, thermostats, or TVs.",
          "linkLabel": "Create an Item"
        },
        "step3": {
          "title": "Add Instructions for Each Item",
          "content": "Each item can have multiple instruction articles: how to use, how to clean, troubleshooting tips, and more."
        }
      },
      "propertyManagement": {
        // Similar structure with 3 steps
      },
      "itemCreation": {
        // 6 steps
      },
      "qrCodes": {
        // 4 steps
      },
      "itemManagement": {
        // 4 steps
      }
    }
  }
}
```

**Files to Modify:**
- All 6 translation files

**Reference:**
- Source content: `src/app/dashboard2/help/page.tsx` lines 76-234

**Validation:**
- Verify all 5 sections implemented
- Check step counts:
  - Getting Started: 3 steps
  - Property Management: 3 steps
  - Item Creation: 6 steps
  - QR Codes: 4 steps
  - Item Management: 4 steps
- Total: ~50 content keys

**Acceptance Criteria:**
- All 5 help sections with complete content
- ~50 keys total in help content namespaces
- All tips and link labels included
- All 6 language files updated

**Dependencies:** Task 2G.1.7
**Parallel Safe:** No (sequential)

---

### Task 2G.1.9: Final Validation and Testing (30 min)
**Priority:** HIGH
**Description:** Validate all translation files for syntax, structure, and completeness.

**Validation Steps:**

1. **JSON Syntax Validation:**
```bash
for lang in en fr es de nl it; do
  echo "Validating messages/${lang}.json..."
  node -e "require('./messages/${lang}.json')"
done
```

2. **Key Count Verification:**
```bash
# Check that settings namespace has ~150 keys
node -e "
const en = require('./messages/en.json');
const countKeys = (obj) => {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
};
console.log('Settings namespace key count:', countKeys(en.settings));
"
```

3. **Structure Consistency Check:**
```bash
# Verify all language files have matching structure
node -e "
const en = require('./messages/en.json');
const fr = require('./messages/fr.json');
const getKeys = (obj, prefix = '') => {
  const keys = [];
  for (const key in obj) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys;
};
const enKeys = getKeys(en.settings);
const frKeys = getKeys(fr.settings);
console.log('EN keys:', enKeys.length);
console.log('FR keys:', frKeys.length);
console.log('Match:', enKeys.length === frKeys.length);
"
```

4. **ICU Format Testing:**
- Test plural forms manually in next-intl
- Test variable interpolation manually

5. **Content Review:**
- Verify all help page strings mapped correctly
- Check all aria-labels present
- Confirm all sub-namespaces complete

**Acceptance Criteria:**
- All 6 language files pass JSON syntax validation
- `settings` namespace has ~150 keys total
- All language files have matching structure
- No duplicate keys
- All ICU message formats valid
- Help page content completely mapped

**Dependencies:** Task 2G.1.8
**Parallel Safe:** No (sequential - must be last)

---

## 6. Authorized Files and Functions for Modification

### Files Authorized for Modification:

1. **`/messages/en.json`**
   - **Purpose:** Add new `settings` namespace with ~150 keys
   - **Location:** After `properties` namespace (after line ~3373)
   - **Modifications:** Add complete settings namespace structure

2. **`/messages/fr.json`**
   - **Purpose:** Add `settings` namespace structure with placeholders
   - **Modifications:** Same structure as en.json, English placeholders

3. **`/messages/es.json`**
   - **Purpose:** Add `settings` namespace structure with placeholders
   - **Modifications:** Same structure as en.json, English placeholders

4. **`/messages/de.json`**
   - **Purpose:** Add `settings` namespace structure with placeholders
   - **Modifications:** Same structure as en.json, English placeholders

5. **`/messages/nl.json`**
   - **Purpose:** Add `settings` namespace structure with placeholders
   - **Modifications:** Same structure as en.json, English placeholders

6. **`/messages/it.json`**
   - **Purpose:** Add `settings` namespace structure with placeholders
   - **Modifications:** Same structure as en.json, English placeholders

### Files Referenced (No Modifications):

1. **`src/app/dashboard2/help/page.tsx`**
   - **Purpose:** Reference for help page content mapping
   - **Used For:** Extracting hardcoded strings to map to translation keys
   - **No modifications in this task** (will be modified in Task 2G.5)

2. **`src/components/SimpleDashboard/DashboardSettingsPopover.tsx`**
   - **Purpose:** Reference for existing settings usage pattern
   - **No modifications** (uses `dashboard.settings.*`, not general `settings.*`)

3. **`docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`**
   - **Purpose:** Reference specification for settings namespace structure
   - **Lines:** 1114-1161 (Sub-Epic 2G specification)

### Functions/Sections Authorized for Modification:

**None** - This task only creates namespace structure in JSON translation files. No TypeScript/JavaScript code modifications.

---

## 7. Acceptance Criteria

### Must Have:
- ✅ New `settings` namespace exists in all 6 language files (en, fr, es, de, nl, it)
- ✅ ~150 total keys across 7 sub-namespaces:
  - `settings.sections.*` (6 keys)
  - `settings.account.*` (20 keys)
  - `settings.profile.*` (15 keys)
  - `settings.preferences.*` (25 keys)
  - `settings.notifications.*` (20 keys)
  - `settings.security.*` (15 keys)
  - `settings.help.*` (50 keys)
- ✅ All JSON files pass syntax validation
- ✅ All language files have matching key structure
- ✅ English content in en.json, placeholders in other languages
- ✅ All help page hardcoded strings mapped to translation keys
- ✅ ICU message format used for pluralization (sessionsActive, unreadCount)
- ✅ Variable interpolation used for dynamic content (emailUpdated, lastLogin, etc.)
- ✅ All interactive elements have aria-labels

### Should Have:
- ✅ Clear comments in JSON files indicating sub-namespace purpose
- ✅ Consistent key naming (camelCase, logical hierarchy)
- ✅ Help content mapping document created for reference
- ✅ Settings namespace organized for easy future extension

### Nice to Have:
- ✅ Key usage examples in code comments
- ✅ Documentation of ICU format patterns used

---

## 8. Dependencies and Risks

### Dependencies:

**Upstream Dependencies:**
- ✅ Epic 1 L10N foundation (next-intl configuration) - COMPLETED
- ✅ Sub-Epic 2A-2F namespaces - COMPLETED (provides patterns to follow)

**Downstream Dependencies:**
- ⬜ Task 2G.2: Update account settings components (needs `settings.account.*`)
- ⬜ Task 2G.3: Update profile components (needs `settings.profile.*`)
- ⬜ Task 2G.4: Update preferences components (needs `settings.preferences.*`)
- ⬜ Task 2G.5: Update help page (needs `settings.help.*`)
- ⬜ Task 2G.6: Generate translations (needs complete English source)

### Risks and Mitigation:

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Large namespace (~150 keys) increases error chance | Medium | Medium | Use JSON validator after each sub-task, automated testing script |
| Help page content mapping may be incomplete | High | Medium | Create detailed mapping document, cross-reference all hardcoded strings |
| Non-English files may have structure mismatches | Medium | Low | Use automated structure comparison script, copy-paste en.json structure |
| ICU message format syntax errors | Low | Low | Test ICU formats manually with next-intl, reference existing patterns |
| Key naming inconsistencies | Low | Low | Follow established patterns from properties namespace, use camelCase consistently |
| Missing aria-labels for accessibility | Medium | Medium | Checklist of all interactive elements, systematic review |

### Blockers:

**None** - This task is purely additive (creates new namespace without modifying existing code).

---

## 9. Open Questions

### Design Decisions Needed:

1. **Dashboard Settings Migration:**
   - Current: `dashboard.settings.*` (9 keys for dashboard-specific UI customization)
   - Question: Should these stay in `dashboard.settings.*` or move to new `settings.*`?
   - **Recommendation:** Keep in `dashboard.settings.*` (dashboard-specific, not general account settings)
   - **Rationale:** Conceptually different - dashboard settings are UI customization, not account preferences

2. **Help Page Section Depth:**
   - Question: Should help content use deeper nesting (e.g., `settings.help.sections.gettingStarted.*`) or flatter structure (`settings.help.gettingStarted.*`)?
   - **Recommendation:** Flatter structure (`settings.help.gettingStarted.*`)
   - **Rationale:** Easier to access, matches pattern from other namespaces, avoids excessive nesting

3. **Notification Types:**
   - Question: What notification types should be included in `settings.notifications.*`?
   - **Recommendation:** Start with basic types (email, push, item updates, property updates, system announcements, weekly digest)
   - **Rationale:** Covers common use cases, can be extended later

4. **Security Features:**
   - Question: What security features should be included in initial namespace?
   - **Recommendation:** 2FA toggles, active sessions, password change
   - **Rationale:** Core security features, can add API keys, webhooks, etc. later

### Technical Clarifications Needed:

**None** - Requirements are clear from implementation plan and existing patterns.

---

## 10. Success Metrics

### Quantitative Metrics:

1. **Namespace Completeness:**
   - Target: ~150 keys across 7 sub-namespaces
   - Measurement: Automated key count script

2. **File Consistency:**
   - Target: 100% structure match across 6 language files
   - Measurement: Automated structure comparison

3. **JSON Validity:**
   - Target: 100% of files pass validation
   - Measurement: `node -e "require('./messages/{lang}.json')"` exit code

4. **Help Content Coverage:**
   - Target: 100% of help page hardcoded strings mapped
   - Measurement: Manual review against help page source

### Qualitative Metrics:

1. **Code Quality:**
   - Clear, logical namespace organization
   - Consistent key naming conventions
   - Proper ICU message format usage

2. **Documentation Quality:**
   - Help content mapping document is comprehensive
   - Code comments explain sub-namespace purposes
   - Usage patterns documented

3. **Maintainability:**
   - Easy to add new settings keys
   - Clear separation between sub-namespaces
   - Follows established patterns from previous sub-epics

---

## 11. Notes and Context

### Design Rationale:

1. **Why 7 Sub-namespaces?**
   - Logical separation of concerns (account, profile, preferences, notifications, security, help, sections)
   - Each sub-namespace corresponds to a potential settings page/section
   - Makes it easy to find keys (e.g., all account-related keys in `settings.account.*`)

2. **Why Separate `settings` from `dashboard.settings`?**
   - `dashboard.settings.*` is UI customization specific to dashboard display
   - New `settings.*` namespace is for user account, profile, preferences (persistent user data)
   - Conceptual separation improves clarity and maintainability

3. **Why Include Help Content in Settings Namespace?**
   - Help/Support is typically found in Settings or Account menus in most applications
   - Logical grouping with other account-related features
   - Implementation plan (Plan-111) includes help under Sub-Epic 2G (Settings & Account)

### Historical Context:

- **Previous Work:** Sub-Epics 2A-2F completed (authentication, items, properties, etc.)
- **Pattern Established:** Each sub-epic creates namespace structure first, then updates components
- **Lessons Learned:** Large namespaces benefit from incremental creation and validation

### Future Considerations:

1. **Settings UI Implementation:**
   - Account settings page (Task 2G.2)
   - Profile page (Task 2G.3)
   - Preferences page (Task 2G.4)
   - Navigation/routing for settings pages

2. **Feature Extensions:**
   - Additional notification types (SMS, Slack, etc.)
   - API keys management (for developers)
   - Webhook configuration
   - Billing/subscription settings
   - Team/organization settings (future multi-tenancy)

3. **Integration Points:**
   - User profile data from Supabase `users` table
   - Preferences stored in localStorage or database
   - Notification preferences in user preferences table
   - Help content could be CMS-driven in future

### Related Documentation:

- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md (lines 1099-1171)
- **Sub-Epic 2G Specification:** Lines 1099-1171 in Plan-111
- **Help Page Source:** src/app/dashboard2/help/page.tsx
- **Dashboard Settings Reference:** src/components/SimpleDashboard/DashboardSettingsPopover.tsx

---

## 12. Appendix

### A. Complete Namespace Structure Outline

```typescript
{
  "settings": {
    // Top-level (2 keys)
    "title": string,
    "subtitle": string,

    // Section navigation (6 keys)
    "sections": {
      "account": string,
      "profile": string,
      "preferences": string,
      "notifications": string,
      "security": string,
      "navigationAriaLabel": string
    },

    // Account settings (20 keys)
    "account": {
      "title": string,
      "subtitle": string,
      "email": string,
      "emailDescription": string,
      "emailInputAriaLabel": string,
      "changeEmail": string,
      "changeEmailButtonAriaLabel": string,
      "emailUpdated": string, // ICU: {email}
      "currentPassword": string,
      "newPassword": string,
      "confirmPassword": string,
      "changePassword": string,
      "passwordUpdated": string,
      "deleteAccount": string,
      "deleteAccountButtonAriaLabel": string,
      "deleteWarning": string,
      "deleteConfirmation": string,
      "sessionsActive": string, // ICU plural: {count}
      "lastLogin": string, // ICU: {date} {time}
      "accountCreated": string, // ICU: {date}
      "manageSubscription": string
    },

    // Profile settings (15 keys)
    "profile": {
      "title": string,
      "subtitle": string,
      "displayName": string,
      "displayNamePlaceholder": string,
      "displayNameAriaLabel": string,
      "bio": string,
      "bioPlaceholder": string,
      "bioMaxLength": string,
      "avatar": string,
      "uploadAvatar": string,
      "uploadAvatarAriaLabel": string,
      "removeAvatar": string,
      "removeAvatarAriaLabel": string,
      "avatarUpdated": string,
      "avatarRemoved": string,
      "saveChanges": string,
      "savingChanges": string,
      "profileUpdated": string
    },

    // Preferences (25 keys)
    "preferences": {
      "title": string,
      "subtitle": string,
      "language": string,
      "languageDescription": string,
      "languageSelectorAriaLabel": string,
      "languageUpdated": string, // ICU: {language}
      "supportedLanguages": {
        "en": string,
        "fr": string,
        "es": string,
        "de": string,
        "nl": string,
        "it": string
      },
      "theme": string,
      "themeDescription": string,
      "themeSelectorAriaLabel": string,
      "themeUpdated": string, // ICU: {theme}
      "themeOptions": {
        "light": string,
        "dark": string,
        "system": string
      },
      "timezone": string,
      "timezoneDescription": string,
      "timezoneSelectorAriaLabel": string,
      "timezoneUpdated": string, // ICU: {timezone}
      "dateFormat": string,
      "timeFormat": string,
      "preferencesUpdated": string
    },

    // Notifications (20 keys)
    "notifications": {
      "title": string,
      "subtitle": string,
      "emailNotifications": string,
      "emailNotificationsDescription": string,
      "pushNotifications": string,
      "pushNotificationsDescription": string,
      "itemUpdates": string,
      "itemUpdatesDescription": string,
      "propertyUpdates": string,
      "propertyUpdatesDescription": string,
      "systemAnnouncements": string,
      "systemAnnouncementsDescription": string,
      "weeklyDigest": string,
      "weeklyDigestDescription": string,
      "unreadCount": string, // ICU plural: {count}
      "markAllRead": string,
      "notificationsUpdated": string
    },

    // Security (15 keys)
    "security": {
      "title": string,
      "subtitle": string,
      "twoFactorAuth": string,
      "twoFactorAuthDescription": string,
      "enable2FA": string,
      "disable2FA": string,
      "twoFactorEnabled": string,
      "twoFactorDisabled": string,
      "activeSessions": string,
      "activeSessionsDescription": string,
      "sessionsActive": string, // ICU plural: {count}
      "revokeSession": string,
      "revokeAllOther": string,
      "currentDevice": string,
      "lastActive": string, // ICU: {date}
      "securityUpdated": string
    },

    // Help & Support (50+ keys)
    "help": {
      "page": {
        "title": string,
        "subtitle": string,
        "createItemButton": string,
        "quickLinksTitle": string,
        "footerTitle": string,
        "footerText": string,
        "contactButton": string,
        "loadingAriaLabel": string
      },
      "sections": {
        "gettingStarted": string,
        "propertyManagement": string,
        "itemCreation": string,
        "qrCodes": string,
        "itemManagement": string
      },
      "gettingStarted": {
        "title": string,
        "description": string,
        "step1": { title, content, tip, linkLabel },
        "step2": { title, content, linkLabel },
        "step3": { title, content }
      },
      "propertyManagement": {
        "title": string,
        "description": string,
        // 3 steps
      },
      "itemCreation": {
        "title": string,
        "description": string,
        // 6 steps
      },
      "qrCodes": {
        "title": string,
        "description": string,
        // 4 steps
      },
      "itemManagement": {
        "title": string,
        "description": string,
        // 4 steps
      }
    }
  }
}
```

**Total Estimated Keys:** ~150

---

### B. ICU Message Format Examples

**Pluralization:**
```json
{
  "sessionsActive": "{count, plural, one {# active session} other {# active sessions}}",
  "unreadCount": "{count, plural, =0 {No unread notifications} one {# unread notification} other {# unread notifications}}"
}
```

**Variable Interpolation:**
```json
{
  "emailUpdated": "Email updated to {email}",
  "lastLogin": "Last login: {date} at {time}",
  "languageUpdated": "Language updated to {language}"
}
```

**Nested ICU:**
```json
{
  "itemSummary": "You have {itemCount, plural, one {# item} other {# items}} in {propertyCount, plural, one {# property} other {# properties}}"
}
```

---

### C. Help Page Content Mapping Reference

| Help Page Line | Hardcoded String | Translation Key |
|----------------|------------------|-----------------|
| 382 | "Help & User Guide" | `settings.help.page.title` |
| 386 | "Learn how to use FAQBNB..." | `settings.help.page.subtitle` |
| 395 | "Create Item" | `settings.help.page.createItemButton` |
| 403 | "Quick Links" | `settings.help.page.quickLinksTitle` |
| 79 | "Getting Started" | `settings.help.sections.gettingStarted` |
| 108 | "Managing Properties" | `settings.help.sections.propertyManagement` |
| 133 | "Creating Items" | `settings.help.sections.itemCreation` |
| 177 | "QR Code Generation" | `settings.help.sections.qrCodes` |
| 207 | "Managing Items" | `settings.help.sections.itemManagement` |
| 82 | "Learn the basics..." | `settings.help.gettingStarted.description` |
| 85 | "Create Your First Property" | `settings.help.gettingStarted.step1.title` |
| 86-87 | "After signing in..." | `settings.help.gettingStarted.step1.content` |
| 88 | "You can add multiple..." | `settings.help.gettingStarted.step1.tip` |
| 89 | "Go to Properties" | `settings.help.gettingStarted.step1.linkLabel` |
| ... | (Continue for all sections) | ... |

**Total Mappings:** ~50-60 strings from help page

---

**End of Document**
