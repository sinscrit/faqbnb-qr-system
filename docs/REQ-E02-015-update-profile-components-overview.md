# REQ-E02-015: Update Profile Components with Localized Strings

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-015
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 01:47 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2G (Settings & Account)
**Task ID:** 2G.3
**Size:** M (Medium)
**Priority:** P1

---

## 1. Summary

This task updates all profile-related components to display user-facing text using localized translation references instead of hardcoded English strings. The scope includes profile display components, account switching interfaces, user dashboard displays, and role/status indicators. All hardcoded strings will be extracted to the `settings.profile` namespace within the i18n message bundle and replaced with `useTranslations` hook references.

---

## 2. Background & Context

### 2.1 Current State

Profile components throughout the application contain hardcoded English strings for:
- User information labels (name, email, avatar)
- Account switching interface text
- Role badge labels (Owner, Admin, Member)
- Status indicators and account counts
- Welcome messages and greeting text
- Loading states and error messages
- Activity labels and recent action descriptions

Key components with hardcoded strings include:
- `AccountSelector` - Multi-account switching component with role display
- `AccountAccessSummary` - Account ownership/access display with stats
- `UserDashboard` - Main user dashboard with welcome message and activity feed

### 2.2 Target State

After implementation:
- All profile components retrieve display text from the i18n translation system using `useTranslations` hook
- Text renders in the user's selected language
- When language preferences change, all profile text updates to match the new locale
- Pluralization for account counts and member counts works correctly
- Role indicators maintain semantic clarity across all languages
- No hardcoded English text remains in any profile component

### 2.3 Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| Epic 1 i18n Foundation | Required | `next-intl` package installed |
| `settings` namespace structure | Task 2G.1 | `/messages/en.json` |
| Account settings translations | Task 2G.2 | `/messages/en.json` (partial overlap) |
| `useTranslations` hook | Available | `next-intl` |
| `getTranslations` (server) | Available | `next-intl/server` |

---

## 3. Requirements Analysis

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | AccountSelector uses i18n settings.profile.accountSelector namespace | Must Have |
| FR-2 | AccountAccessSummary uses i18n settings.profile.accessSummary namespace | Must Have |
| FR-3 | UserDashboard welcome messages use i18n settings.profile.dashboard namespace | Must Have |
| FR-4 | Profile field labels extracted to i18n settings.profile.fields namespace | Must Have |
| FR-5 | Role badge labels extracted to i18n settings.profile.roles namespace | Must Have |
| FR-6 | Account counts use ICU pluralization format | Must Have |
| FR-7 | Welcome messages interpolate user name correctly | Must Have |
| FR-8 | Error messages for profile/account operations are localized | Must Have |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | Layout remains stable across all supported languages | Must Have |
| NFR-2 | Component text updates without page refresh on language change | Should Have |
| NFR-3 | Role indicators maintain appropriate formality across languages | Must Have |
| NFR-4 | Crown emoji and role icons remain culturally neutral | Must Have |
| NFR-5 | Existing component functionality remains unchanged | Must Have |

---

## 4. Components Analysis

### 4.1 Component Inventory

| Component | File Path | Est. Strings | Complexity |
|-----------|-----------|--------------|------------|
| AccountSelector | `/src/components/AccountSelector.tsx` | ~18 | Medium |
| AccountAccessSummary | `/src/components/AccountAccessSummary.tsx` | ~22 | Medium |
| UserDashboard | `/src/components/UserDashboard.tsx` | ~45 | High |

**Total Estimated Strings:** ~85

### 4.2 String Categories by Component

#### AccountSelector (~18 strings)

**Section Labels:**
- `"Current Account"` (line 136)
- `"Account"` (line 155)
- `"Switch Account"` (line 201)

**Selection Interface:**
- `"Select an account..."` (line 178)
- `"{count} account(s) available"` (line 219) - needs pluralization

**Role Display:**
- Role capitalization logic (line 56) - needs translation keys for "Owner", "Admin", "Member"

**Error Messages:**
- `"Failed to switch account"` (line 95)
- `"An unexpected error occurred"` (line 108)

**Actions:**
- `"Dismiss"` (line 239)

**AccountInfo Component:**
- `"Current Account"` (line 285)
- `"{count} account(s)"` (line 306) - needs pluralization

#### AccountAccessSummary (~22 strings)

**Section Titles:**
- `"Account Access"` (line 58)

**Stats Labels:**
- `"Accounts Owned"` (line 67)
- `"Accounts Accessed"` (line 72)

**Section Headings:**
- `"Accounts You Own"` (line 80)
- `"Accounts You Access"` (line 124)

**Empty States:**
- `"No owned accounts"` (line 86)
- `"No accessible accounts"` (line 130)

**Status Badges:**
- `"Owner"` (line 108)
- Role display (line 159) - needs translation

**Member Counts:**
- `"{count} members"` (line 103) - needs pluralization

**Date Labels:**
- `"Created {date}"` (line 111)
- `"Since {date}"` (line 162)
- `"by {name}"` (line 143)

**Summary Labels:**
- `"Total Accounts:"` (line 174)
- `"Total Users with Access:"` (line 178)

#### UserDashboard (~45 strings)

**Page Header:**
- `"Dashboard"` (line 247)
- `"Welcome back, {name}!"` (line 249)
- `"Currently viewing: {property}"` (line 250)
- `"Refresh"` (line 259)

**Stats Cards:**
- `"Properties"` (line 165)
- `"Total properties"` (line 167)
- `"Items"` (line 173)
- `"{count} created recently"` (line 175)
- `"Total Views"` (line 180)
- `"{count} in last 7 days"` (line 182)
- `"Activity"` (line 189)
- `"Recent actions"` (line 191)

**Quick Actions:**
- `"New QR Code Item"` (line 132)
- `"Add a new QR code item"` (line 133)
- `"View All Items"` (line 139)
- `"Browse your items"` (line 140)
- `"Manage Properties"` (line 146)
- `"Add or edit properties"` (line 147)
- `"View Analytics"` (line 154)
- `"See your insights"` (line 155)
- `"Quick Actions"` (line 322)

**Recent Activity:**
- `"Recent Activity"` (line 349)
- `"No recent activity"` (line 366)
- `"Created "` (line 375)
- `"Updated "` (line 376)
- `"Viewed "` (line 377)

**Property Overview:**
- `"Your Properties"` (line 398)
- `"Items:"` (line 412)
- `"Views:"` (line 415)
- `"Last activity: {date}"` (line 420)

**Error State:**
- `"Dashboard Error"` (line 228)
- `"Retry"` (line 235)

**Loading State:**
- `"..."` (line 285) - loading indicator

---

## 5. Translation Namespace Structure

### 5.1 Proposed `settings.profile` Namespace

```json
{
  "settings": {
    "profile": {
      "accountSelector": {
        "currentAccount": "Current Account",
        "title": "Account",
        "switchAccount": "Switch Account",
        "selectAccount": "Select an account...",
        "accountsAvailable": "{count} {count, plural, one {account} other {accounts}} available",
        "switchFailed": "Failed to switch account",
        "unexpectedError": "An unexpected error occurred",
        "dismiss": "Dismiss"
      },

      "accessSummary": {
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

      "dashboard": {
        "title": "Dashboard",
        "welcomeBack": "Welcome back, {name}!",
        "currentlyViewing": "Currently viewing: {property}",
        "refresh": "Refresh",
        "error": {
          "title": "Dashboard Error",
          "retry": "Retry",
          "loadFailed": "Failed to load dashboard data"
        }
      },

      "stats": {
        "properties": "Properties",
        "totalProperties": "Total properties",
        "items": "Items",
        "createdRecently": "{count} created recently",
        "totalViews": "Total Views",
        "last7DaysViews": "{count} in last 7 days",
        "activity": "Activity",
        "recentActions": "Recent actions",
        "loading": "..."
      },

      "quickActions": {
        "title": "Quick Actions",
        "newItem": "New QR Code Item",
        "newItemDescription": "Add a new QR code item",
        "viewAllItems": "View All Items",
        "viewAllItemsDescription": "Browse your items",
        "manageProperties": "Manage Properties",
        "managePropertiesDescription": "Add or edit properties",
        "viewAnalytics": "View Analytics",
        "viewAnalyticsDescription": "See your insights"
      },

      "recentActivity": {
        "title": "Recent Activity",
        "noActivity": "No recent activity",
        "created": "Created {name}",
        "updated": "Updated {name}",
        "viewed": "Viewed {name}"
      },

      "propertyOverview": {
        "title": "Your Properties",
        "items": "Items:",
        "views": "Views:",
        "lastActivity": "Last activity: {date}"
      },

      "roles": {
        "owner": "Owner",
        "admin": "Admin",
        "member": "Member"
      },

      "fields": {
        "displayName": "Display Name",
        "email": "Email Address",
        "avatar": "Profile Photo"
      }
    }
  }
}
```

---

## 6. Implementation Tasks

### Task 1: Update AccountSelector Component
**File:** `/src/components/AccountSelector.tsx`
**Effort:** 1.5 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.profile')`
3. Replace hardcoded strings in `AccountSelector`:
   - `"Current Account"` (line 136) → `{t('accountSelector.currentAccount')}`
   - `"Account"` (line 155) → `{t('accountSelector.title')}`
   - `"Switch Account"` (line 201) → `{t('accountSelector.switchAccount')}`
   - `"Select an account..."` (line 178) → `{t('accountSelector.selectAccount')}`
   - Account count text (line 219) → `{t('accountSelector.accountsAvailable', { count: userAccounts.length })}`
   - `"Failed to switch account"` (line 95) → `t('accountSelector.switchFailed')`
   - `"An unexpected error occurred"` (line 108) → `t('accountSelector.unexpectedError')`
   - `"Dismiss"` (line 239) → `{t('accountSelector.dismiss')}`
4. Update `AccountDisplay` role capitalization (line 56) to use translation keys
5. Update `AccountInfo` component:
   - `"Current Account"` (line 285) → `{t('accountSelector.currentAccount')}`
   - Account count text (line 306) → `{t('accountSelector.accountsAvailable', { count: userAccounts.length })}`

### Task 2: Update AccountAccessSummary Component
**File:** `/src/components/AccountAccessSummary.tsx`
**Effort:** 1.5 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.profile.accessSummary')`
3. Replace all hardcoded strings:
   - `"Account Access"` → `{t('title')}`
   - `"Accounts Owned"` → `{t('accountsOwned')}`
   - `"Accounts Accessed"` → `{t('accountsAccessed')}`
   - `"Accounts You Own"` → `{t('accountsYouOwn')}`
   - `"Accounts You Access"` → `{t('accountsYouAccess')}`
   - `"No owned accounts"` → `{t('noOwnedAccounts')}`
   - `"No accessible accounts"` → `{t('noAccessibleAccounts')}`
   - `"Owner"` → `{t('ownerBadge')}`
   - `"{count} members"` → `{t('members', { count: account.memberCount })}`
   - Date formatting with interpolation for "Created" and "Since"
   - `"by {name}"` → `{t('by', { name: account.ownerName })}`
   - `"Total Accounts:"` → `{t('totalAccounts')}`
   - `"Total Users with Access:"` → `{t('totalUsersWithAccess')}`
4. Handle role translation using `settings.profile.roles` namespace

### Task 3: Update UserDashboard Component
**File:** `/src/components/UserDashboard.tsx`
**Effort:** 3 SP

**Changes:**
1. Import `useTranslations` from `next-intl`
2. Initialize translations: `const t = useTranslations('settings.profile')`
3. Replace header section strings:
   - `"Dashboard"` → `{t('dashboard.title')}`
   - Welcome message with user name interpolation → `{t('dashboard.welcomeBack', { name: user?.fullName || user?.email })}`
   - Property viewing text → `{t('dashboard.currentlyViewing', { property: selectedProperty.nickname })}`
   - `"Refresh"` → `{t('dashboard.refresh')}`
4. Refactor `statsCards` array to use translations:
   - Create helper function or inline translations for card titles/subtitles
5. Refactor `quickActions` array to use translations
6. Update Recent Activity section:
   - `"Recent Activity"` → `{t('recentActivity.title')}`
   - `"No recent activity"` → `{t('recentActivity.noActivity')}`
   - Activity action text with interpolation
7. Update Property Overview section:
   - `"Your Properties"` → `{t('propertyOverview.title')}`
   - `"Items:"` → `{t('propertyOverview.items')}`
   - `"Views:"` → `{t('propertyOverview.views')}`
   - Last activity text with date interpolation
8. Update error state:
   - `"Dashboard Error"` → `{t('dashboard.error.title')}`
   - `"Retry"` → `{t('dashboard.error.retry')}`

### Task 4: Add Translations to Message Files
**Files:** `/messages/{en,fr,es,de,nl,it}.json`
**Effort:** 1.5 SP

**Changes:**
1. Add `settings.profile` namespace entries to English message file
2. Generate translations for all 5 non-English languages
3. Verify all interpolation variables are preserved
4. Ensure pluralization patterns are correct for each language
5. Verify character encoding is correct for non-Latin scripts

### Task 5: Testing and Verification
**Effort:** 1 SP

**Changes:**
1. Verify all components render correctly in all 6 languages
2. Test layout stability (no text overflow or truncation)
3. Verify account switching functionality preserved
4. Test language switching behavior
5. Verify pluralization works correctly for member/account counts
6. Test interpolation with dynamic values (user names, dates, counts)
7. Verify role badges display correctly in all languages

---

## 7. Authorized Files and Functions for Modification

### 7.1 Components to Modify

| File Path | Functions/Components | Type of Change |
|-----------|---------------------|----------------|
| `/src/components/AccountSelector.tsx` | `AccountSelector`, `AccountDisplay`, `AccountInfo`, `CompactAccountSelector` | Add translations |
| `/src/components/AccountAccessSummary.tsx` | `AccountAccessSummary` (default export) | Add translations |
| `/src/components/UserDashboard.tsx` | `UserDashboard`, `statsCards`, `quickActions`, error/activity rendering | Add translations |

### 7.2 Translation Files to Modify

| File Path | Namespace | Type of Change |
|-----------|-----------|----------------|
| `/messages/en.json` | `settings.profile` | Add new keys |
| `/messages/fr.json` | `settings.profile` | Add new keys |
| `/messages/es.json` | `settings.profile` | Add new keys |
| `/messages/de.json` | `settings.profile` | Add new keys |
| `/messages/nl.json` | `settings.profile` | Add new keys |
| `/messages/it.json` | `settings.profile` | Add new keys |

### 7.3 Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/contexts/AuthContext.tsx` | Logic-only context, no UI strings |
| `/src/types/index.ts` | Type definitions only |
| `/src/app/dashboard/page.tsx` | Uses UserDashboard component, not direct strings |

---

## 8. Technical Approach

### 8.1 Translation Pattern for Client Components

```typescript
// Example: AccountSelector.tsx
'use client';

import { useTranslations } from 'next-intl';

export function AccountSelector({ ... }) {
  const t = useTranslations('settings.profile');

  return (
    <div>
      <div className="text-xs font-medium text-gray-700 mb-2">
        {t('accountSelector.currentAccount')}
      </div>
      {/* ... */}
    </div>
  );
}
```

### 8.2 Role Translation Pattern

```typescript
// Before: Manual capitalization
<span className="text-xs text-gray-600">
  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
</span>

// After: Translation-based role display
const tRoles = useTranslations('settings.profile.roles');

<span className="text-xs text-gray-600">
  {tRoles(userRole as 'owner' | 'admin' | 'member')}
</span>
```

### 8.3 Pluralization Pattern

```typescript
// For member counts
t('accessSummary.members', { count: account.memberCount })

// Translation key (ICU format):
// "members": "{count, plural, one {# member} other {# members}}"
```

### 8.4 Date Interpolation Pattern

```typescript
// For dates
t('accessSummary.created', {
  date: new Date(account.created_at).toLocaleDateString()
})

// Translation key:
// "created": "Created {date}"
```

### 8.5 UserDashboard Refactoring Approach

```typescript
// Refactor statsCards to use translations
function useStatsCards(stats: UserStats, t: ReturnType<typeof useTranslations>) {
  return [
    {
      title: t('stats.properties'),
      value: stats.totalProperties,
      subtitle: t('stats.totalProperties'),
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
      href: '/dashboard/properties'
    },
    // ... more cards
  ];
}
```

---

## 9. Acceptance Criteria

### 9.1 Functional Criteria

- [ ] AccountSelector displays translated section labels and error messages
- [ ] AccountAccessSummary shows translated headings, stats labels, and empty states
- [ ] UserDashboard displays translated welcome message, stats, and quick actions
- [ ] Role badges (Owner, Admin, Member) display in user's selected language
- [ ] Member/account counts use proper pluralization for each language
- [ ] Date formatting works correctly with translated labels
- [ ] Dynamic content (names, counts) properly interpolates

### 9.2 Quality Criteria

- [ ] No hardcoded English text remains in any modified component
- [ ] Layout remains stable with no text overflow in any language
- [ ] Existing component functionality unchanged
- [ ] No TypeScript errors introduced
- [ ] Crown emoji and role icons remain appropriate across locales

### 9.3 Verification Checklist

- [ ] AccountSelector: "Current Account", "Switch Account" labels translated
- [ ] AccountSelector: Account count pluralization works in all languages
- [ ] AccountSelector: Error messages translated
- [ ] AccountAccessSummary: "Accounts Owned/Accessed" stats translated
- [ ] AccountAccessSummary: Member count pluralization works
- [ ] AccountAccessSummary: "Created/Since" date labels translated
- [ ] UserDashboard: Welcome message interpolates user name correctly
- [ ] UserDashboard: Stats card titles and subtitles translated
- [ ] UserDashboard: Quick action buttons translated
- [ ] UserDashboard: Recent activity section translated
- [ ] UserDashboard: Property overview labels translated
- [ ] All message files contain complete `settings.profile` namespace

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| UserDashboard has more strings than estimated | Medium | Low | Time-box extraction, iterate if needed |
| Layout breaks with longer translations (e.g., German) | Medium | Medium | Test all languages, adjust card widths if needed |
| Pluralization rules differ significantly by language | Low | Medium | Test all count scenarios, use ICU format correctly |
| Role translations lose semantic meaning | Low | Medium | Use formal/contextual role names per language |
| Date formatting varies by locale | Low | Low | Use locale-aware date formatting API |

---

## 11. Effort Estimate

| Task | Story Points | Confidence |
|------|--------------|------------|
| Task 1: AccountSelector | 1.5 | High |
| Task 2: AccountAccessSummary | 1.5 | High |
| Task 3: UserDashboard | 3 | Medium |
| Task 4: Translation files | 1.5 | High |
| Task 5: Testing | 1 | High |
| **Total** | **8.5 SP** | Medium |

---

## 12. References

- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request: REQ-E02-015](/docs/gen_requests_epic2.md)
- [Task 2G.1: Create Settings Namespace Structure](/docs/REQ-E02-013-create-settings-namespace-structure-overview.md)
- [Task 2G.2: Update Account Settings Components](/docs/REQ-E02-014-update-account-settings-components-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
