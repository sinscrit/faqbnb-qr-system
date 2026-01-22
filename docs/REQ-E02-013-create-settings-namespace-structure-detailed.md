# REQ-E02-013: Create `settings` Namespace Structure - Detailed Specification

**Generated:** 2026-01-22 20:45:00
**Last Modified:** 2026-01-22 20:45:00
**Request ID:** REQ-E02-013
**Epic:** Epic 2 - Localization (L10N)
**Sub-Epic:** 2G - Settings & Account
**Task:** 2G.1
**Type:** NAMESPACE CREATION
**Size:** M
**Estimated Effort:** 8 story points

---

## Reference Documents

- **Source Request**: `/docs/gen_requests_epic2.md#REQ-E02-013`
- **Overview Document**: `/docs/REQ-E02-013-create-settings-namespace-structure-overview.md`
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1114-1161)
- **Help Page Reference**: `/src/app/dashboard2/help/page.tsx` (content source for help namespace)
- **English Translation File**: `/messages/en.json`

---

## CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT

**Operate from the project root folder ONLY**
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

1. **DO NOT mark any task as completed in this document**
   - All checkboxes MUST remain `- [ ]` (unchecked)
   - The QA validation agent will verify completion
   - Marking tasks complete will cause pipeline tracking errors

2. **Subtask ID Format**
   - Use `**X.Y**` format (e.g., `**1.1**`, `**2.3**`)
   - This format enables automated progress tracking
   - Do not use alternative formats like `X.Y.` or `Task X.Y`

3. **JSON Syntax Rules**
   - Validate JSON after EACH file modification
   - Use proper comma placement (last item in object/array has NO comma)
   - Maintain consistent indentation (2 spaces)
   - UTF-8 encoding for all special characters
   - Escape double quotes inside strings with `\"`

4. **Namespace Organization**
   - Add `settings` namespace after `properties` namespace in en.json (after line ~3373)
   - Use clear sub-namespace structure with 7 main sections
   - Include comments to document each sub-namespace purpose
   - Maintain alphabetical ordering within sub-namespaces where logical

5. **ICU MessageFormat Requirements**
   - Use ICU plural format: `{count, plural, one {...} other {...}}`
   - Use variable interpolation: `{variableName}` for dynamic values
   - Never modify variable names in translations
   - Test plural forms with counts: 0, 1, 2, 5

6. **Non-English Files**
   - Copy exact structure from en.json
   - Use English text as placeholders (will be translated in Task 2G.6)
   - Maintain identical key structure across all 6 language files

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| JSON Validation | `node -e "JSON.parse(require('fs').readFileSync('messages/[lang].json', 'utf8'))"` |

**Note**: Replace `[lang]` with `en`, `fr`, `es`, `de`, `nl`, or `it` for validation.

---

## Overview

This task creates the comprehensive `settings` namespace structure with approximately **150 translation keys** organized into **7 sub-namespaces** covering account settings, user profile, preferences (language, theme, timezone), notifications, security, and extensive help/support content.

### Scope

**New Namespace**: `settings` (top-level, after `properties` namespace)

**Sub-namespaces to Create**:
1. `settings.sections` - Section navigation labels (6 keys)
2. `settings.account` - Account management (20 keys)
3. `settings.profile` - User profile information (15 keys)
4. `settings.preferences` - User preferences with language/theme options (25 keys)
5. `settings.notifications` - Notification settings (15 keys)
6. `settings.security` - Security settings with 2FA (15 keys)
7. `settings.help` - Help page content with 5 major sections (50+ keys)

**Total Keys**: ~150 across all sub-namespaces

**Files to Modify**: 6 translation files (en.json, fr.json, es.json, de.json, nl.json, it.json)

### Current State

- Small `dashboard.settings` namespace exists (9 keys for dashboard UI customization)
- Help page (`src/app/dashboard2/help/page.tsx`) contains ~50+ hardcoded strings
- No dedicated account settings, profile, or preferences pages exist yet
- No top-level `settings` namespace for general app settings

### Target State

- New top-level `settings` namespace with ~150 keys
- Clear separation between dashboard-specific and general settings
- All help page content mapped to translation keys
- Foundation ready for future settings pages (Tasks 2G.2-2G.5)
- Placeholder content in non-English files for translation in Task 2G.6

---

## Task Breakdown

### Task 1: Add Core Settings Structure and Sections Namespace (1 story point)

**Context**: Create the top-level `settings` namespace with title/subtitle and the `sections` sub-namespace for settings navigation labels. This establishes the foundation for all subsequent sub-namespaces.

**Files to Modify**:
- `/messages/en.json` - Add after `properties` namespace (line ~3373)
- `/messages/fr.json` - Add matching structure with English placeholders
- `/messages/es.json` - Add matching structure with English placeholders
- `/messages/de.json` - Add matching structure with English placeholders
- `/messages/nl.json` - Add matching structure with English placeholders
- `/messages/it.json` - Add matching structure with English placeholders

**Estimated Effort**: 1 story point (foundational structure creation)

**Subtasks**:
- [ ] **1.1** Read `/messages/en.json` to find the end of the `properties` namespace (around line 3373)
- [ ] **1.2** Add new `settings` namespace object after `properties` with opening brace
- [ ] **1.3** Add top-level keys: `"title": "Settings"` and `"subtitle": "Manage your account settings and preferences"`
- [ ] **1.4** Add `sections` sub-namespace object with opening brace
- [ ] **1.5** Add section navigation keys: `"account": "Account"`, `"profile": "Profile"`, `"preferences": "Preferences"`, `"notifications": "Notifications"`, `"security": "Security"`
- [ ] **1.6** Add accessibility key: `"navigationAriaLabel": "Settings navigation"`
- [ ] **1.7** Close `sections` sub-namespace with proper closing brace and comma
- [ ] **1.8** Validate JSON syntax for en.json: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))"`
- [ ] **1.9** Copy the exact `settings` structure (with title, subtitle, sections) to fr.json, es.json, de.json, nl.json, it.json (use English text as placeholders)
- [ ] **1.10** Validate JSON syntax for all 5 non-English files using the node command

**Acceptance Criteria**:
- `settings` namespace exists in all 6 language files
- `settings.title` and `settings.subtitle` keys present
- `settings.sections.*` namespace with 6 keys (account, profile, preferences, notifications, security, navigationAriaLabel)
- All 6 files pass JSON validation
- English content in en.json, English placeholders in other languages

**JSON Structure**:
```json
{
  "settings": {
    "title": "Settings",
    "subtitle": "Manage your account settings and preferences",
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

---

### Task 2: Add Account Settings Sub-namespace (1 story point)

**Context**: Add the `settings.account` sub-namespace with ~20 keys for account management including email, password, delete account, sessions, and subscription management. Uses ICU format for pluralization and variable interpolation.

**Files to Modify**:
- All 6 translation files (en, fr, es, de, nl, it)

**Estimated Effort**: 1 story point (account management keys)

**Subtasks**:
- [ ] **2.1** In en.json, add `"account"` sub-namespace object after `settings.sections` (with proper comma after sections closing brace)
- [ ] **2.2** Add section metadata: `"title": "Account Settings"`, `"subtitle": "Manage your account information and preferences"`
- [ ] **2.3** Add email-related keys: `"email": "Email Address"`, `"emailDescription": "Your account email address"`, `"emailInputAriaLabel": "Email address input field"`
- [ ] **2.4** Add email action keys: `"changeEmail": "Change Email"`, `"changeEmailButtonAriaLabel": "Change email address"`, `"emailUpdated": "Email updated to {email}"`
- [ ] **2.5** Add password keys: `"currentPassword": "Current Password"`, `"newPassword": "New Password"`, `"confirmPassword": "Confirm Password"`, `"changePassword": "Change Password"`, `"passwordUpdated": "Password updated successfully"`
- [ ] **2.6** Add delete account keys: `"deleteAccount": "Delete Account"`, `"deleteAccountButtonAriaLabel": "Delete account permanently"`, `"deleteWarning": "This action is permanent and cannot be undone."`, `"deleteConfirmation": "Are you sure you want to delete your account?"`
- [ ] **2.7** Add session keys with ICU plural: `"sessionsActive": "{count, plural, one {# active session} other {# active sessions}}"`
- [ ] **2.8** Add timestamp keys with variable interpolation: `"lastLogin": "Last login: {date} at {time}"`, `"accountCreated": "Account created: {date}"`
- [ ] **2.9** Add subscription key: `"manageSubscription": "Manage Subscription"`
- [ ] **2.10** Close `account` sub-namespace with proper closing brace and comma
- [ ] **2.11** Validate JSON syntax for en.json
- [ ] **2.12** Copy the `account` sub-namespace structure to all 5 non-English files (English text as placeholders)
- [ ] **2.13** Validate JSON syntax for all non-English files

**Acceptance Criteria**:
- `settings.account.*` namespace with ~20 keys in all 6 files
- ICU plural format for `sessionsActive`
- Variable interpolation in `emailUpdated`, `lastLogin`, `accountCreated`
- All aria-labels present for interactive elements
- All 6 files pass JSON validation

**Key Count**: ~20 keys total

---

### Task 3: Add Profile Settings Sub-namespace (1 story point)

**Context**: Add the `settings.profile` sub-namespace with ~15 keys for user profile management including display name, bio, avatar upload/removal, and save actions.

**Files to Modify**:
- All 6 translation files

**Estimated Effort**: 1 story point (profile management keys)

**Subtasks**:
- [ ] **3.1** In en.json, add `"profile"` sub-namespace object after `settings.account` (with proper comma)
- [ ] **3.2** Add section metadata: `"title": "Profile"`, `"subtitle": "Manage your public profile information"`
- [ ] **3.3** Add display name keys: `"displayName": "Display Name"`, `"displayNamePlaceholder": "Enter your name"`, `"displayNameAriaLabel": "Display name input field"`
- [ ] **3.4** Add bio keys: `"bio": "Bio"`, `"bioPlaceholder": "Tell us about yourself"`, `"bioMaxLength": "Bio must be 500 characters or less"`
- [ ] **3.5** Add avatar keys: `"avatar": "Profile Photo"`, `"uploadAvatar": "Upload Photo"`, `"uploadAvatarAriaLabel": "Upload profile photo"`
- [ ] **3.6** Add avatar action keys: `"removeAvatar": "Remove Photo"`, `"removeAvatarAriaLabel": "Remove profile photo"`, `"avatarUpdated": "Profile photo updated"`, `"avatarRemoved": "Profile photo removed"`
- [ ] **3.7** Add save action keys: `"saveChanges": "Save Changes"`, `"savingChanges": "Saving..."`, `"profileUpdated": "Profile updated successfully"`
- [ ] **3.8** Close `profile` sub-namespace with proper closing brace and comma
- [ ] **3.9** Validate JSON syntax for en.json
- [ ] **3.10** Copy the `profile` sub-namespace structure to all 5 non-English files
- [ ] **3.11** Validate JSON syntax for all non-English files

**Acceptance Criteria**:
- `settings.profile.*` namespace with ~15 keys in all 6 files
- All form fields have labels, placeholders, and aria-labels
- Action button states included (save, saving)
- Success messages present
- All 6 files pass JSON validation

**Key Count**: ~15 keys total

---

### Task 4: Add Preferences Sub-namespace (2 story points)

**Context**: Add the `settings.preferences` sub-namespace with ~25 keys for user preferences including language selection (6 languages), theme options (light/dark/system), timezone, and date/time formats. This sub-namespace is larger due to language and theme option enumerations.

**Files to Modify**:
- All 6 translation files

**Estimated Effort**: 2 story points (complex sub-namespace with nested objects)

**Subtasks**:
- [ ] **4.1** In en.json, add `"preferences"` sub-namespace object after `settings.profile` (with proper comma)
- [ ] **4.2** Add section metadata: `"title": "Preferences"`, `"subtitle": "Customize your experience"`
- [ ] **4.3** Add language section keys: `"language": "Language"`, `"languageDescription": "Choose your preferred language"`, `"languageSelectorAriaLabel": "Select your preferred language"`, `"languageUpdated": "Language updated to {language}"`
- [ ] **4.4** Add `supportedLanguages` nested object with 6 keys: `"en": "English"`, `"fr": "Français"`, `"es": "Español"`, `"de": "Deutsch"`, `"nl": "Nederlands"`, `"it": "Italiano"`
- [ ] **4.5** Close `supportedLanguages` object with proper closing brace and comma
- [ ] **4.6** Add theme section keys: `"theme": "Theme"`, `"themeDescription": "Choose your preferred color theme"`, `"themeSelectorAriaLabel": "Select your preferred theme"`, `"themeUpdated": "Theme updated to {theme}"`
- [ ] **4.7** Add `themeOptions` nested object with 3 keys: `"light": "Light"`, `"dark": "Dark"`, `"system": "System"`
- [ ] **4.8** Close `themeOptions` object with proper closing brace and comma
- [ ] **4.9** Add timezone keys: `"timezone": "Timezone"`, `"timezoneDescription": "Set your timezone for accurate timestamps"`, `"timezoneSelectorAriaLabel": "Select your timezone"`, `"timezoneUpdated": "Timezone updated to {timezone}"`
- [ ] **4.10** Add format keys: `"dateFormat": "Date Format"`, `"timeFormat": "Time Format"`
- [ ] **4.11** Add success message: `"preferencesUpdated": "Preferences updated successfully"`
- [ ] **4.12** Close `preferences` sub-namespace with proper closing brace and comma
- [ ] **4.13** Validate JSON syntax for en.json
- [ ] **4.14** Copy the `preferences` sub-namespace structure to all 5 non-English files (keep language names in their native form: "Français", "Español", "Deutsch", "Nederlands", "Italiano")
- [ ] **4.15** Validate JSON syntax for all non-English files

**Acceptance Criteria**:
- `settings.preferences.*` namespace with ~25 keys in all 6 files
- `supportedLanguages` object with all 6 languages (native names)
- `themeOptions` object with 3 options (light/dark/system)
- Variable interpolation in update messages
- All 6 files pass JSON validation

**Key Count**: ~25 keys total (includes nested objects)

---

### Task 5: Add Notifications and Security Sub-namespaces (2 story points)

**Context**: Add two related sub-namespaces: `settings.notifications` (~15 keys) for notification preferences with ICU pluralization, and `settings.security` (~15 keys) for security settings including 2FA and session management.

**Files to Modify**:
- All 6 translation files

**Estimated Effort**: 2 story points (two medium-sized sub-namespaces)

**Subtasks**:
- [ ] **5.1** In en.json, add `"notifications"` sub-namespace object after `settings.preferences` (with proper comma)
- [ ] **5.2** Add notifications section metadata: `"title": "Notifications"`, `"subtitle": "Manage your notification preferences"`
- [ ] **5.3** Add notification type toggles: `"emailNotifications": "Email Notifications"`, `"emailNotificationsDescription": "Receive updates via email"`, `"pushNotifications": "Push Notifications"`, `"pushNotificationsDescription": "Receive push notifications in your browser"`
- [ ] **5.4** Add notification categories: `"itemUpdates": "Item Updates"`, `"itemUpdatesDescription": "Notify when items are updated"`, `"propertyUpdates": "Property Updates"`, `"propertyUpdatesDescription": "Notify when properties are updated"`
- [ ] **5.5** Add notification preferences: `"systemAnnouncements": "System Announcements"`, `"systemAnnouncementsDescription": "Important updates and announcements"`, `"weeklyDigest": "Weekly Digest"`, `"weeklyDigestDescription": "Receive a weekly summary of activity"`
- [ ] **5.6** Add notification count with ICU plural: `"unreadCount": "{count, plural, =0 {No unread notifications} one {# unread notification} other {# unread notifications}}"`
- [ ] **5.7** Add notification actions: `"markAllRead": "Mark All as Read"`, `"notificationsUpdated": "Notification preferences updated"`
- [ ] **5.8** Close `notifications` sub-namespace with proper closing brace and comma
- [ ] **5.9** Add `"security"` sub-namespace object after `notifications` (with proper comma)
- [ ] **5.10** Add security section metadata: `"title": "Security"`, `"subtitle": "Manage your security settings"`
- [ ] **5.11** Add 2FA keys: `"twoFactorAuth": "Two-Factor Authentication"`, `"twoFactorAuthDescription": "Add an extra layer of security"`, `"enable2FA": "Enable 2FA"`, `"disable2FA": "Disable 2FA"`, `"twoFactorEnabled": "Two-factor authentication enabled"`, `"twoFactorDisabled": "Two-factor authentication disabled"`
- [ ] **5.12** Add session management keys: `"activeSessions": "Active Sessions"`, `"activeSessionsDescription": "Manage your active login sessions"`, `"sessionsActive": "{count, plural, one {# active session} other {# active sessions}}"`
- [ ] **5.13** Add session action keys: `"revokeSession": "Revoke Session"`, `"revokeAllOther": "Revoke All Other Sessions"`, `"currentDevice": "Current Device"`, `"lastActive": "Last active: {date}"`
- [ ] **5.14** Add success message: `"securityUpdated": "Security settings updated"`
- [ ] **5.15** Close `security` sub-namespace with proper closing brace and comma
- [ ] **5.16** Validate JSON syntax for en.json
- [ ] **5.17** Copy both `notifications` and `security` sub-namespace structures to all 5 non-English files
- [ ] **5.18** Validate JSON syntax for all non-English files

**Acceptance Criteria**:
- `settings.notifications.*` namespace with ~15 keys in all 6 files
- `settings.security.*` namespace with ~15 keys in all 6 files
- ICU plural formats for `unreadCount` (notifications) and `sessionsActive` (security)
- Toggle states for boolean settings
- All 6 files pass JSON validation

**Key Count**: ~30 keys total (15 per sub-namespace)

---

### Task 6: Add Help Page Structure and Sections (1 story point)

**Context**: Add the `settings.help` sub-namespace foundation with page-level keys and section labels. This prepares for the extensive help content to be added in Task 7.

**Files to Modify**:
- All 6 translation files

**Estimated Effort**: 1 story point (foundation structure only)

**Subtasks**:
- [ ] **6.1** In en.json, add `"help"` sub-namespace object after `settings.security` (with proper comma)
- [ ] **6.2** Add `"page"` nested object for page-level strings
- [ ] **6.3** Add page metadata: `"title": "Help & User Guide"`, `"subtitle": "Learn how to use FAQBNB to create and manage your property items"`
- [ ] **6.4** Add page actions: `"createItemButton": "Create Item"`, `"quickLinksTitle": "Quick Links"`
- [ ] **6.5** Add page footer: `"footerTitle": "Still Need Help?"`, `"footerText": "Can't find what you're looking for? Contact our support team for assistance."`, `"contactButton": "Contact Support"`
- [ ] **6.6** Add accessibility: `"loadingAriaLabel": "Loading help content"`
- [ ] **6.7** Close `page` object with proper closing brace and comma
- [ ] **6.8** Add `"sections"` nested object for section navigation labels
- [ ] **6.9** Add 5 section labels: `"gettingStarted": "Getting Started"`, `"propertyManagement": "Managing Properties"`, `"itemCreation": "Creating Items"`, `"qrCodes": "QR Code Generation"`, `"itemManagement": "Managing Items"`
- [ ] **6.10** Close `sections` object with proper closing brace and comma (DO NOT close `help` namespace yet - Task 7 will add more)
- [ ] **6.11** Validate JSON syntax for en.json (ensure help namespace stays open with trailing comma)
- [ ] **6.12** Copy `help.page.*` and `help.sections.*` structure to all 5 non-English files
- [ ] **6.13** Validate JSON syntax for all non-English files

**Acceptance Criteria**:
- `settings.help.page.*` namespace with 7 keys
- `settings.help.sections.*` namespace with 5 section labels
- Help namespace remains OPEN (has trailing comma, not closed yet)
- All 6 files pass JSON validation
- Ready for Task 7 to add section content

**Key Count**: 12 keys (page-level and sections)

---

### Task 7: Add Help Section Content (2 story points)

**Context**: Add all 5 help section content blocks with detailed steps, tips, and link labels. This is the largest single sub-namespace with ~50 keys total. Content is extracted from `src/app/dashboard2/help/page.tsx` lines 76-234.

**Files to Modify**:
- All 6 translation files

**Estimated Effort**: 2 story points (extensive content mapping)

**Reference Source**: `/src/app/dashboard2/help/page.tsx`

**Subtasks**:
- [ ] **7.1** Read `/src/app/dashboard2/help/page.tsx` lines 76-104 for "Getting Started" content
- [ ] **7.2** In en.json `settings.help` namespace (after `sections` object), add `"gettingStarted"` object
- [ ] **7.3** Add getting started metadata: `"title": "Getting Started"`, `"description": "Learn the basics of setting up your FAQBNB account"`
- [ ] **7.4** Add getting started step 1: `"step1": { "title": "Create Your First Property", "content": "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property.", "tip": "You can add multiple properties to manage different locations.", "linkLabel": "Go to Properties" }`
- [ ] **7.5** Add getting started step 2: `"step2": { "title": "Add Items to Your Property", "content": "Items are the appliances, amenities, or features guests interact with. Create items for things like coffee makers, thermostats, or TVs.", "linkLabel": "Create an Item" }`
- [ ] **7.6** Add getting started step 3: `"step3": { "title": "Add Instructions for Each Item", "content": "Each item can have multiple instruction articles: how to use, how to clean, troubleshooting tips, and more." }`
- [ ] **7.7** Close `gettingStarted` object with proper closing brace and comma
- [ ] **7.8** Read help page lines 107-129 for "Property Management" content and add `"propertyManagement"` object with title, description, and 3 steps following the same pattern as gettingStarted
- [ ] **7.9** Close `propertyManagement` object with proper closing brace and comma
- [ ] **7.10** Read help page lines 132-173 for "Item Creation" content and add `"itemCreation"` object with title, description, and 6 steps (some steps have content only, no tip or linkLabel)
- [ ] **7.11** Close `itemCreation` object with proper closing brace and comma
- [ ] **7.12** Read help page lines 176-203 for "QR Codes" content and add `"qrCodes"` object with title, description, and 4 steps
- [ ] **7.13** Close `qrCodes` object with proper closing brace and comma
- [ ] **7.14** Read help page lines 206-233 for "Item Management" content and add `"itemManagement"` object with title, description, and 4 steps
- [ ] **7.15** Close `itemManagement` object with proper closing brace (NO comma - last item in help namespace)
- [ ] **7.16** Close `help` sub-namespace with proper closing brace (NO comma - last item in settings namespace)
- [ ] **7.17** Close `settings` top-level namespace with proper closing brace
- [ ] **7.18** Validate JSON syntax for en.json thoroughly
- [ ] **7.19** Copy all 5 help section content blocks to all 5 non-English files
- [ ] **7.20** Validate JSON syntax for all non-English files

**Acceptance Criteria**:
- All 5 help sections complete with ~50 content keys total:
  - `settings.help.gettingStarted.*` - 3 steps (~9 keys)
  - `settings.help.propertyManagement.*` - 3 steps (~9 keys)
  - `settings.help.itemCreation.*` - 6 steps (~14 keys)
  - `settings.help.qrCodes.*` - 4 steps (~10 keys)
  - `settings.help.itemManagement.*` - 4 steps (~10 keys)
- Each step has title and content at minimum
- Optional fields (tip, linkLabel) included where present in source
- All 6 files pass JSON validation
- `settings` namespace properly closed in all files

**Key Count**: ~50 keys (help section content)

**Content Extraction Example**:
From help page line 85-89:
```typescript
title: "Create Your First Property",
content: "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property.",
tip: "You can add multiple properties to manage different locations.",
linkLabel: "Go to Properties"
```

Becomes in en.json:
```json
"step1": {
  "title": "Create Your First Property",
  "content": "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property.",
  "tip": "You can add multiple properties to manage different locations.",
  "linkLabel": "Go to Properties"
}
```

---

### Task 8: Final Validation and Key Count Verification (1 story point)

**Context**: Perform comprehensive validation of all translation files to ensure JSON syntax correctness, key structure consistency across languages, proper key count (~150 total), and ICU format validity.

**Estimated Effort**: 1 story point (thorough validation)

**Subtasks**:
- [ ] **8.1** Run JSON syntax validation for all 6 files: `for lang in en fr es de nl it; do echo "Validating ${lang}.json..."; node -e "JSON.parse(require('fs').readFileSync('messages/${lang}.json', 'utf8'))" && echo "${lang}.json: ✓ PASSED" || echo "${lang}.json: ✗ FAILED"; done`
- [ ] **8.2** Create and run key count script to verify ~150 keys in settings namespace: `node -e "const en = require('./messages/en.json'); const countKeys = (obj) => { let count = 0; for (const key in obj) { if (typeof obj[key] === 'object' && obj[key] !== null) { count += countKeys(obj[key]); } else { count++; } } return count; }; const totalKeys = countKeys(en.settings); console.log('Total settings keys:', totalKeys); if (totalKeys >= 145 && totalKeys <= 155) { console.log('✓ Key count within expected range (145-155)'); } else { console.log('✗ Key count out of range:', totalKeys); }"`
- [ ] **8.3** Verify all 7 sub-namespaces exist in en.json: sections, account, profile, preferences, notifications, security, help
- [ ] **8.4** Create and run structure consistency check to verify all language files have matching key structure: `node -e "const getKeys = (obj, prefix = '') => { const keys = []; for (const key in obj) { const path = prefix ? prefix + '.' + key : key; if (typeof obj[key] === 'object' && obj[key] !== null) { keys.push(...getKeys(obj[key], path)); } else { keys.push(path); } } return keys.sort(); }; const langs = ['en', 'fr', 'es', 'de', 'nl', 'it']; const structures = {}; langs.forEach(lang => { const data = require('./messages/' + lang + '.json'); structures[lang] = getKeys(data.settings); }); const enKeys = structures.en; let allMatch = true; langs.forEach(lang => { if (structures[lang].length !== enKeys.length) { console.log(lang + ': ✗ Key count mismatch -', structures[lang].length, 'vs', enKeys.length); allMatch = false; } else { console.log(lang + ': ✓ Key count matches (' + structures[lang].length + ')'); } }); if (allMatch) { console.log('✓ All language files have matching structure'); } else { console.log('✗ Structure mismatch detected'); }"`
- [ ] **8.5** Manually verify ICU plural formats are correct: `sessionsActive`, `unreadCount` (both in notifications and security)
- [ ] **8.6** Manually verify variable interpolation syntax: `emailUpdated` ({email}), `lastLogin` ({date} {time}), `languageUpdated` ({language}), `themeUpdated` ({theme}), `timezoneUpdated` ({timezone}), `lastActive` ({date})
- [ ] **8.7** Verify help section content completeness by checking all 5 sections present: gettingStarted, propertyManagement, itemCreation, qrCodes, itemManagement
- [ ] **8.8** Verify step counts per section: gettingStarted (3), propertyManagement (3), itemCreation (6), qrCodes (4), itemManagement (4)
- [ ] **8.9** Check that all aria-label keys are present and properly named (ending with "AriaLabel")
- [ ] **8.10** Verify language names in `preferences.supportedLanguages` are in native form (Français, Español, Deutsch, Nederlands, Italiano)
- [ ] **8.11** Run TypeScript type check: `npm run typecheck` (should pass without errors)
- [ ] **8.12** Run linter: `npm run lint` (should pass without new errors)

**Acceptance Criteria**:
- All 6 JSON files pass syntax validation
- Total key count in `settings` namespace is between 145-155 keys
- All 6 language files have identical key structure
- All ICU plural formats valid and tested
- All variable interpolation syntax correct
- Help content completely mapped (50+ keys)
- All aria-labels present and named correctly
- TypeScript compilation succeeds
- Linter passes

---

## Authorized Files for Modification

This task authorizes modification of the following files:

### Translation Files (Modify)

1. **`/messages/en.json`**
   - **Lines to modify**: Add after line ~3373 (after `properties` namespace)
   - **Purpose**: Add complete `settings` namespace with ~150 keys in English
   - **Restrictions**: Add only, do not modify existing namespaces

2. **`/messages/fr.json`**
   - **Purpose**: Add `settings` namespace structure with English placeholders
   - **Restrictions**: Copy exact structure from en.json, use English text

3. **`/messages/es.json`**
   - **Purpose**: Add `settings` namespace structure with English placeholders
   - **Restrictions**: Copy exact structure from en.json, use English text

4. **`/messages/de.json`**
   - **Purpose**: Add `settings` namespace structure with English placeholders
   - **Restrictions**: Copy exact structure from en.json, use English text

5. **`/messages/nl.json`**
   - **Purpose**: Add `settings` namespace structure with English placeholders
   - **Restrictions**: Copy exact structure from en.json, use English text

6. **`/messages/it.json`**
   - **Purpose**: Add `settings` namespace structure with English placeholders
   - **Restrictions**: Copy exact structure from en.json, use English text

### Read-Only Files (Reference Only)

7. **`/src/app/dashboard2/help/page.tsx`**
   - **Purpose**: Source for help page content to map to translation keys
   - **Lines to reference**: 76-234 (help section content)
   - **Do not modify**: This file will be updated in Task 2G.5

8. **`/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`**
   - **Purpose**: Reference for existing `dashboard.settings` usage pattern
   - **Do not modify**: Uses separate `dashboard.settings.*` namespace

9. **`/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`**
   - **Purpose**: Reference specification for settings namespace
   - **Lines to reference**: 1114-1161

---

## Dependencies

### Prerequisites (Must Complete First)
- ✅ **Epic 1 Foundation**: next-intl setup complete - COMPLETED
- ✅ **Sub-Epics 2A-2F**: Provide namespace patterns to follow - COMPLETED

### Blocks (Requires This Task First)
- ⬜ **Task 2G.2**: Update account settings components (needs `settings.account.*`)
- ⬜ **Task 2G.3**: Update profile components (needs `settings.profile.*`)
- ⬜ **Task 2G.4**: Update preferences components (needs `settings.preferences.*`)
- ⬜ **Task 2G.5**: Update help page (needs `settings.help.*`)
- ⬜ **Task 2G.6**: Generate translations for 5 non-English languages (needs complete English source)

### Parallel Safety
- ✅ **Can run independently** of other ongoing tasks
- ✅ **No component modifications** in this task (only JSON files)
- ✅ **No code conflicts** - purely additive namespace creation

---

## Risk Assessment

### Risk 1: JSON Syntax Errors in Large Namespace
**Likelihood**: Medium
**Impact**: High (breaks translation system)
**Mitigation**:
- Validate JSON after each task
- Use automated validation scripts
- Test with multiple JSON validators
- Careful comma placement (last items have NO comma)

### Risk 2: Key Structure Mismatch Across Languages
**Likelihood**: Medium
**Impact**: High (translation system breaks for non-English users)
**Mitigation**:
- Copy-paste structure from en.json to other files
- Use automated structure comparison script
- Validate all files before completing task

### Risk 3: Incomplete Help Content Mapping
**Likelihood**: Medium
**Impact**: Medium (help page cannot be fully internationalized)
**Mitigation**:
- Cross-reference all hardcoded strings in help page
- Create mapping document during implementation
- Verify all 5 sections and all steps covered

### Risk 4: ICU Format Syntax Errors
**Likelihood**: Low
**Impact**: High (pluralization breaks, crashes component)
**Mitigation**:
- Follow established ICU patterns from existing namespaces
- Test plural forms manually with different counts
- Reference next-intl ICU documentation

### Risk 5: Missing Aria-Labels
**Likelihood**: Low
**Impact**: Medium (accessibility issues)
**Mitigation**:
- Checklist of all interactive elements
- Systematic review of all form fields, buttons, selectors
- Follow pattern: element name + "AriaLabel" suffix

---

## Testing Strategy

### JSON Validation Testing

**Test 1: Syntax Validation**
```bash
# Run for each language file
node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))"
# Should exit with code 0 (success)
```

**Test 2: Key Count Verification**
```bash
# Count total keys in settings namespace
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
console.log('Settings namespace keys:', countKeys(en.settings));
"
# Expected: 145-155 keys
```

**Test 3: Structure Consistency**
```bash
# Verify all languages have same structure
node -e "
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
  return keys.sort();
};
const en = require('./messages/en.json');
const fr = require('./messages/fr.json');
const enKeys = getKeys(en.settings);
const frKeys = getKeys(fr.settings);
console.log('EN keys:', enKeys.length);
console.log('FR keys:', frKeys.length);
console.log('Match:', enKeys.length === frKeys.length);
"
# Should show matching counts
```

### ICU Format Testing

**Test 4: Plural Forms**
Test in next-intl with different counts:
- `sessionsActive` with count=0, 1, 2, 5, 10
- `unreadCount` with count=0, 1, 2, 10
- Expected singular form for count=1, plural form for others

**Test 5: Variable Interpolation**
Test in next-intl with sample data:
- `emailUpdated` with email="user@example.com"
- `lastLogin` with date="2026-01-22" and time="10:45 AM"
- `languageUpdated` with language="Français"
- Variables should be replaced with actual values

### Content Completeness Testing

**Test 6: Help Section Coverage**
- Verify all 5 sections exist: gettingStarted, propertyManagement, itemCreation, qrCodes, itemManagement
- Verify step counts: 3, 3, 6, 4, 4 respectively
- Check all steps have title and content at minimum
- Verify optional fields (tip, linkLabel) present where source has them

**Test 7: Aria-Label Audit**
Checklist of all aria-labels:
- [ ] `sections.navigationAriaLabel`
- [ ] `account.emailInputAriaLabel`
- [ ] `account.changeEmailButtonAriaLabel`
- [ ] `account.deleteAccountButtonAriaLabel`
- [ ] `profile.displayNameAriaLabel`
- [ ] `profile.uploadAvatarAriaLabel`
- [ ] `profile.removeAvatarAriaLabel`
- [ ] `preferences.languageSelectorAriaLabel`
- [ ] `preferences.themeSelectorAriaLabel`
- [ ] `preferences.timezoneSelectorAriaLabel`
- [ ] `help.page.loadingAriaLabel`

---

## Out of Scope

This task focuses on namespace structure creation only. The following are explicitly out of scope:

- Creating settings UI pages (account, profile, preferences) - Task 2G.2-2G.4
- Updating help page component to use translation keys - Task 2G.5
- Translating namespace to non-English languages - Task 2G.6
- Implementing language switcher functionality
- Implementing theme switcher functionality
- Creating timezone selection UI
- Implementing notification system
- Implementing 2FA security features
- Creating user profile editing functionality
- Migrating `dashboard.settings.*` keys (keep separate - dashboard-specific)
- Creating new components or pages
- Modifying existing components
- Database schema changes
- API endpoint creation

---

## Success Criteria

This task is considered complete when:

1. ✅ All 8 numbered tasks completed successfully
2. ✅ New `settings` namespace exists in all 6 language files (en, fr, es, de, nl, it)
3. ✅ ~150 total keys across 7 sub-namespaces:
   - `settings.sections.*` (6 keys)
   - `settings.account.*` (~20 keys)
   - `settings.profile.*` (~15 keys)
   - `settings.preferences.*` (~25 keys)
   - `settings.notifications.*` (~15 keys)
   - `settings.security.*` (~15 keys)
   - `settings.help.*` (~50 keys)
4. ✅ All 6 JSON files pass syntax validation
5. ✅ All language files have identical key structure (verified by script)
6. ✅ English content in en.json, English placeholders in other 5 languages
7. ✅ All help page hardcoded strings mapped to translation keys (~50 keys)
8. ✅ ICU message format used correctly for pluralization (`sessionsActive`, `unreadCount`)
9. ✅ Variable interpolation used for dynamic content (`emailUpdated`, `lastLogin`, `languageUpdated`, etc.)
10. ✅ All interactive elements have aria-labels (11 aria-labels total)
11. ✅ Language names in native form (Français, Español, Deutsch, Nederlands, Italiano)
12. ✅ Theme options present (light, dark, system)
13. ✅ TypeScript compilation succeeds (`npm run typecheck`)
14. ✅ Linter passes (`npm run lint`)
15. ✅ All 5 help sections complete with correct step counts

---

## Notes

### Namespace Design Decisions

1. **Why Top-Level `settings` Namespace?**
   - General app settings distinct from `dashboard.settings` (UI customization)
   - Future settings pages will use this namespace
   - Help content logically grouped with account/profile settings

2. **Why 7 Sub-namespaces?**
   - Clear separation of concerns
   - Each sub-namespace corresponds to potential settings page
   - Easy to locate keys (all account keys in `settings.account.*`)

3. **Why Include Help in Settings?**
   - Help/Support typically found in Settings menu
   - Implementation plan includes help under Sub-Epic 2G
   - Logical grouping with account-related features

### Key Naming Conventions

- Use camelCase for all keys
- Nested objects for logical grouping
- Aria-labels end with "AriaLabel" suffix
- Action button states: action verb (e.g., "save") + past/present tense (e.g., "saving", "saved")
- Success messages: past tense (e.g., "updated", "created", "removed")

### ICU Format Patterns

**Pluralization**:
```json
"{count, plural, one {# item} other {# items}}"
"{count, plural, =0 {No items} one {# item} other {# items}}"
```

**Variable Interpolation**:
```json
"Updated to {value}"
"Last login: {date} at {time}"
```

### Future Extensions

Potential additions for future tasks:
- API keys management (`settings.apiKeys.*`)
- Webhook configuration (`settings.webhooks.*`)
- Billing/subscription (`settings.billing.*`)
- Team settings (`settings.team.*`)
- Integration settings (`settings.integrations.*`)

---

## Document Status

- [x] Specification complete
- [ ] Implementation complete (to be updated by implementing agent)
- [ ] QA validation complete (to be updated by QA agent)
- [ ] Deployed to production (to be updated after deployment)
