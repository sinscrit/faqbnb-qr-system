# REQ-E02-015: Update Profile Components with Localized Strings - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Request ID:** REQ-E02-015
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 02:15 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2G (Settings & Account)
**Task ID:** 2G.3
**Size:** M (Medium)
**Priority:** P1
**Overview Document:** [REQ-E02-015-update-profile-components-overview.md](./REQ-E02-015-update-profile-components-overview.md)
**Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for localizing all profile-related components. The scope includes 3 main components (AccountSelector, AccountAccessSummary, UserDashboard) with approximately 85 hardcoded strings to be extracted to the `settings.profile` namespace.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 i18n foundation is complete (`next-intl` installed and configured)
- [ ] Task 2G.1 (Settings namespace structure) is complete
- [ ] `/messages/en.json` exists with `settings` namespace
- [ ] `useTranslations` hook is available from `next-intl`

---

## Task Breakdown

### Task 2G.3.1: Add Profile Namespace Structure to English Messages File

**File:** `/messages/en.json`
**Effort:** 0.5 SP
**Dependencies:** Task 2G.1 (Settings namespace exists)

#### Description
Add the complete `settings.profile` namespace structure to the English messages file with all translation keys needed for profile components.

#### Implementation Steps

1. Open `/messages/en.json`
2. Navigate to the `settings` namespace (created in Task 2G.1)
3. Add the `profile` namespace with the following structure:

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
        "members": "{count} {count, plural, one {member} other {members}}",
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

#### Acceptance Criteria
- [ ] `settings.profile` namespace exists in `/messages/en.json`
- [ ] All sub-namespaces are present: `accountSelector`, `accessSummary`, `dashboard`, `stats`, `quickActions`, `recentActivity`, `propertyOverview`, `roles`, `fields`
- [ ] All 85+ translation keys are defined
- [ ] Pluralization patterns use ICU format (`{count, plural, one {...} other {...}}`)
- [ ] Interpolation variables use correct format (`{variableName}`)
- [ ] JSON is valid (no syntax errors)

#### Verification
```bash
# Validate JSON syntax
node -e "require('./messages/en.json')"

# Verify keys exist
node -e "const m = require('./messages/en.json'); console.log(Object.keys(m.settings.profile))"
```

---

### Task 2G.3.2: Update AccountSelector Component

**File:** `/src/components/AccountSelector.tsx`
**Effort:** 1 SP
**Dependencies:** Task 2G.3.1

#### Description
Update the AccountSelector component and its sub-components (AccountDisplay, AccountInfo, CompactAccountSelector) to use i18n translations.

#### Current Hardcoded Strings (with line numbers)

| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 56 | `{userRole.charAt(0).toUpperCase() + userRole.slice(1)}` | `settings.profile.roles.{role}` |
| 136 | `"Current Account"` | `settings.profile.accountSelector.currentAccount` |
| 155 | `"Account"` | `settings.profile.accountSelector.title` |
| 178 | `"Select an account..."` | `settings.profile.accountSelector.selectAccount` |
| 201 | `"Switch Account"` | `settings.profile.accountSelector.switchAccount` |
| 219 | `{userAccounts.length} account{userAccounts.length !== 1 ? 's' : ''} available` | `settings.profile.accountSelector.accountsAvailable` |
| 95 | `'Failed to switch account'` | `settings.profile.accountSelector.switchFailed` |
| 108 | `'An unexpected error occurred'` | `settings.profile.accountSelector.unexpectedError` |
| 239 | `"Dismiss"` | `settings.profile.accountSelector.dismiss` |
| 285 | `"Current Account"` | `settings.profile.accountSelector.currentAccount` |
| 303 | `{userRole.charAt(0).toUpperCase() + userRole.slice(1)}` | `settings.profile.roles.{role}` |
| 306 | `{userAccounts.length} account{userAccounts.length !== 1 ? 's' : ''}` | `settings.profile.accountSelector.accountsAvailable` |

#### Implementation Steps

**Step 1: Add imports**
```typescript
// Add at top of file after existing imports
import { useTranslations } from 'next-intl';
```

**Step 2: Initialize translations in AccountDisplay function**
```typescript
function AccountDisplay({ account, userRole, isOwner, isSelected, onClick, showInfo = true }: AccountDisplayProps) {
  const t = useTranslations('settings.profile');
  const tRoles = useTranslations('settings.profile.roles');

  // ... existing code
```

**Step 3: Replace role capitalization logic (line 56)**
```typescript
// Before:
{userRole.charAt(0).toUpperCase() + userRole.slice(1)}

// After:
{tRoles(userRole as 'owner' | 'admin' | 'member')}
```

**Step 4: Initialize translations in AccountSelector function**
```typescript
export function AccountSelector({ ... }: AccountSelectorProps) {
  const t = useTranslations('settings.profile.accountSelector');
  // ... existing state hooks
```

**Step 5: Replace hardcoded strings in AccountSelector**

```typescript
// Line 95: Error message
setSwitchError(result.error || t('switchFailed'));

// Line 108: Unexpected error
setSwitchError(t('unexpectedError'));

// Line 136: Current Account label
<div className="text-xs font-medium text-gray-700 mb-2">{t('currentAccount')}</div>

// Line 155: Account label
<div className="text-xs font-medium text-gray-700 mb-2">{t('title')}</div>

// Line 178: Select placeholder
<span className="text-sm text-gray-500">{t('selectAccount')}</span>

// Line 201: Switch Account label
<div className="text-xs font-medium text-gray-700 mb-2 px-1">{t('switchAccount')}</div>

// Line 219: Account count (with pluralization)
<div className="text-xs text-gray-500 px-1">
  {t('accountsAvailable', { count: userAccounts.length })}
</div>

// Line 239: Dismiss button
{t('dismiss')}
```

**Step 6: Initialize translations in AccountInfo function**
```typescript
export function AccountInfo({ className = '' }: { className?: string }) {
  const t = useTranslations('settings.profile.accountSelector');
  const tRoles = useTranslations('settings.profile.roles');
  // ... existing code
```

**Step 7: Replace hardcoded strings in AccountInfo**
```typescript
// Line 285: Current Account label
<div className="text-xs font-medium text-gray-700 mb-2">{t('currentAccount')}</div>

// Line 303: Role display
{tRoles(userRole as 'owner' | 'admin' | 'member')}

// Line 306: Account count
<span className="text-xs text-gray-400">
  • {t('accountsAvailable', { count: userAccounts.length })}
</span>
```

#### Acceptance Criteria
- [ ] `useTranslations` hook imported from `next-intl`
- [ ] All hardcoded strings replaced with translation keys
- [ ] Role display uses `settings.profile.roles` namespace
- [ ] Account count uses ICU pluralization
- [ ] Error messages use translation keys
- [ ] No TypeScript errors
- [ ] Component renders correctly in English

#### Verification
```bash
# Check for remaining hardcoded strings
grep -n '"Current Account"' src/components/AccountSelector.tsx
grep -n '"Account"' src/components/AccountSelector.tsx
grep -n '"Switch Account"' src/components/AccountSelector.tsx
# Should return no results
```

---

### Task 2G.3.3: Update AccountAccessSummary Component

**File:** `/src/components/AccountAccessSummary.tsx`
**Effort:** 1 SP
**Dependencies:** Task 2G.3.1

#### Description
Update the AccountAccessSummary component to use i18n translations for all section headings, labels, and dynamic text.

#### Current Hardcoded Strings (with line numbers)

| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 58 | `"Account Access"` | `settings.profile.accessSummary.title` |
| 67 | `"Accounts Owned"` | `settings.profile.accessSummary.accountsOwned` |
| 72 | `"Accounts Accessed"` | `settings.profile.accessSummary.accountsAccessed` |
| 80 | `"Accounts You Own"` | `settings.profile.accessSummary.accountsYouOwn` |
| 86 | `"No owned accounts"` | `settings.profile.accessSummary.noOwnedAccounts` |
| 103 | `{account.memberCount} members` | `settings.profile.accessSummary.members` |
| 108 | `"Owner"` | `settings.profile.accessSummary.ownerBadge` |
| 111 | `Created {date}` | `settings.profile.accessSummary.created` |
| 124 | `"Accounts You Access"` | `settings.profile.accessSummary.accountsYouAccess` |
| 130 | `"No accessible accounts"` | `settings.profile.accessSummary.noAccessibleAccounts` |
| 143 | `by {account.ownerName}` | `settings.profile.accessSummary.by` |
| 148 | `{account.memberCount} members` | `settings.profile.accessSummary.members` |
| 159 | `{account.userRole}` | `settings.profile.roles.{role}` |
| 162 | `Since {date}` | `settings.profile.accessSummary.since` |
| 174 | `"Total Accounts:"` | `settings.profile.accessSummary.totalAccounts` |
| 178 | `"Total Users with Access:"` | `settings.profile.accessSummary.totalUsersWithAccess` |

#### Implementation Steps

**Step 1: Add imports**
```typescript
// Add at top of file after existing imports
import { useTranslations } from 'next-intl';
```

**Step 2: Initialize translations in component**
```typescript
export default function AccountAccessSummary({
  ownedAccounts,
  accessibleAccounts,
  summary,
  loading
}: AccountAccessSummaryProps) {
  const t = useTranslations('settings.profile.accessSummary');
  const tRoles = useTranslations('settings.profile.roles');

  // ... rest of component
```

**Step 3: Replace all hardcoded strings**

```typescript
// Line 58: Title
<h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>

// Line 67: Accounts Owned
<p className="text-xs text-blue-700">{t('accountsOwned')}</p>

// Line 72: Accounts Accessed
<p className="text-xs text-green-700">{t('accountsAccessed')}</p>

// Line 80: Section heading
{t('accountsYouOwn')}

// Line 86: Empty state
<p className="text-sm">{t('noOwnedAccounts')}</p>

// Line 103: Member count (with pluralization)
{t('members', { count: account.memberCount })}

// Line 108: Owner badge
{t('ownerBadge')}

// Line 111: Created date
{t('created', { date: new Date(account.created_at).toLocaleDateString() })}

// Line 124: Section heading
{t('accountsYouAccess')}

// Line 130: Empty state
<p className="text-sm">{t('noAccessibleAccounts')}</p>

// Line 143: Owner attribution
{t('by', { name: account.ownerName })}

// Line 148: Member count
{t('members', { count: account.memberCount })}

// Line 159: Role badge (needs translation)
{tRoles(account.userRole as 'owner' | 'admin' | 'member')}

// Line 162: Since date
{t('since', { date: new Date(account.created_at).toLocaleDateString() })}

// Line 174: Total accounts label
<span>{t('totalAccounts')}</span>

// Line 178: Total users label
<span>{t('totalUsersWithAccess')}</span>
```

#### Acceptance Criteria
- [ ] `useTranslations` hook imported from `next-intl`
- [ ] All 16+ hardcoded strings replaced
- [ ] Member count uses ICU pluralization
- [ ] Date interpolation works correctly
- [ ] Role badges use `settings.profile.roles` namespace
- [ ] No TypeScript errors
- [ ] Component renders correctly in English

#### Verification
```bash
# Check for remaining hardcoded strings
grep -n '"Account Access"' src/components/AccountAccessSummary.tsx
grep -n '"Accounts Owned"' src/components/AccountAccessSummary.tsx
grep -n '"members"' src/components/AccountAccessSummary.tsx
# Should return no results (except import statements)
```

---

### Task 2G.3.4: Update UserDashboard Component - Header and Error Section

**File:** `/src/components/UserDashboard.tsx`
**Effort:** 0.5 SP
**Dependencies:** Task 2G.3.1

#### Description
Update the header section and error state of UserDashboard with translations.

#### Current Hardcoded Strings

| Line | Current String | Translation Key |
|------|---------------|-----------------|
| 113 | `'Failed to load dashboard data'` | `settings.profile.dashboard.error.loadFailed` |
| 228 | `"Dashboard Error"` | `settings.profile.dashboard.error.title` |
| 235 | `"Retry"` | `settings.profile.dashboard.error.retry` |
| 247 | `"Dashboard"` | `settings.profile.dashboard.title` |
| 249 | `Welcome back, {name}!` | `settings.profile.dashboard.welcomeBack` |
| 250 | `Currently viewing: {property}` | `settings.profile.dashboard.currentlyViewing` |
| 259 | `"Refresh"` | `settings.profile.dashboard.refresh` |

#### Implementation Steps

**Step 1: Add imports**
```typescript
import { useTranslations } from 'next-intl';
```

**Step 2: Initialize translations in component**
```typescript
export function UserDashboard({ className = '' }: UserDashboardProps) {
  const t = useTranslations('settings.profile');
  // ... existing hooks
```

**Step 3: Update error handling (line 113)**
```typescript
setError(t('dashboard.error.loadFailed'));
```

**Step 4: Update error display section (lines 224-239)**
```typescript
if (error) {
  return (
    <div className={`p-6 ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">{t('dashboard.error.title')}</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('dashboard.error.retry')}
        </button>
      </div>
    </div>
  );
}
```

**Step 5: Update header section (lines 244-261)**
```typescript
{/* Header */}
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
    <p className="text-gray-600 mt-1">
      {t('dashboard.welcomeBack', { name: user?.fullName || user?.email })}
      {selectedProperty && ` ${t('dashboard.currentlyViewing', { property: selectedProperty.nickname })}`}
    </p>
  </div>
  <button
    onClick={handleRefresh}
    disabled={loading}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
    {t('dashboard.refresh')}
  </button>
</div>
```

#### Acceptance Criteria
- [ ] Header displays translated title
- [ ] Welcome message interpolates user name
- [ ] Property viewing message interpolates property name
- [ ] Refresh button is translated
- [ ] Error section displays translated messages
- [ ] Retry button is translated

---

### Task 2G.3.5: Update UserDashboard Component - Stats Cards

**File:** `/src/components/UserDashboard.tsx`
**Effort:** 0.5 SP
**Dependencies:** Task 2G.3.4

#### Description
Refactor the statsCards array to use translations for titles and subtitles.

#### Current Hardcoded Strings (lines 163-196)

| String | Translation Key |
|--------|-----------------|
| `'Properties'` | `settings.profile.stats.properties` |
| `'Total properties'` | `settings.profile.stats.totalProperties` |
| `'Items'` | `settings.profile.stats.items` |
| `'{count} created recently'` | `settings.profile.stats.createdRecently` |
| `'Total Views'` | `settings.profile.stats.totalViews` |
| `'{count} in last 7 days'` | `settings.profile.stats.last7DaysViews` |
| `'Activity'` | `settings.profile.stats.activity` |
| `'Recent actions'` | `settings.profile.stats.recentActions` |
| `'...'` | `settings.profile.stats.loading` |

#### Implementation Steps

**Step 1: Refactor statsCards to use translations**

```typescript
// Stats cards with navigation links - now using translations
const statsCards: StatsCard[] = [
  {
    title: t('stats.properties'),
    value: stats.totalProperties,
    subtitle: t('stats.totalProperties'),
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/properties'
  },
  {
    title: t('stats.items'),
    value: stats.totalItems,
    subtitle: t('stats.createdRecently', { count: stats.recentItems }),
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/items'
  },
  {
    title: t('stats.totalViews'),
    value: stats.totalViews,
    subtitle: t('stats.last7DaysViews', { count: stats.last7DaysViews }),
    icon: <Eye className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600',
    href: isAdmin ? '/dashboard/analytics' : undefined
  },
  {
    title: t('stats.activity'),
    value: recentActivity.length,
    subtitle: t('stats.recentActions'),
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-600'
  }
];
```

**Step 2: Update loading state display (line 285)**
```typescript
<span className="text-2xl font-bold text-gray-900">
  {loading ? t('stats.loading') : card.value}
</span>
```

#### Acceptance Criteria
- [ ] All 4 stats card titles are translated
- [ ] All subtitles use translations with interpolation
- [ ] Count values interpolate correctly
- [ ] Loading state shows translated text

---

### Task 2G.3.6: Update UserDashboard Component - Quick Actions

**File:** `/src/components/UserDashboard.tsx`
**Effort:** 0.5 SP
**Dependencies:** Task 2G.3.4

#### Description
Refactor the quickActions array to use translations.

#### Current Hardcoded Strings (lines 130-160)

| String | Translation Key |
|--------|-----------------|
| `'New QR Code Item'` | `settings.profile.quickActions.newItem` |
| `'Add a new QR code item'` | `settings.profile.quickActions.newItemDescription` |
| `'View All Items'` | `settings.profile.quickActions.viewAllItems` |
| `'Browse your items'` | `settings.profile.quickActions.viewAllItemsDescription` |
| `'Manage Properties'` | `settings.profile.quickActions.manageProperties` |
| `'Add or edit properties'` | `settings.profile.quickActions.managePropertiesDescription` |
| `'View Analytics'` | `settings.profile.quickActions.viewAnalytics` |
| `'See your insights'` | `settings.profile.quickActions.viewAnalyticsDescription` |
| `'Quick Actions'` | `settings.profile.quickActions.title` |

#### Implementation Steps

**Step 1: Refactor quickActions array**

```typescript
const quickActions = [
  {
    title: t('quickActions.newItem'),
    description: t('quickActions.newItemDescription'),
    href: '/dashboard/items/new',
    icon: <Plus className="w-5 h-5" />,
    color: 'bg-blue-600 hover:bg-blue-700',
    primary: true
  },
  {
    title: t('quickActions.viewAllItems'),
    description: t('quickActions.viewAllItemsDescription'),
    href: '/dashboard/items',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'bg-gray-600 hover:bg-gray-700'
  },
  {
    title: t('quickActions.manageProperties'),
    description: t('quickActions.managePropertiesDescription'),
    href: '/dashboard/properties',
    icon: <Building2 className="w-5 h-5" />,
    color: 'bg-green-600 hover:bg-green-700'
  },
  ...(isAdmin ? [{
    title: t('quickActions.viewAnalytics'),
    description: t('quickActions.viewAnalyticsDescription'),
    href: '/dashboard/analytics',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-purple-600 hover:bg-purple-700'
  }] : [])
];
```

**Step 2: Update section heading (line 322)**
```typescript
<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions.title')}</h3>
```

#### Acceptance Criteria
- [ ] Quick Actions section title is translated
- [ ] All 4 action button titles are translated
- [ ] All 4 action button descriptions are translated
- [ ] Analytics action only shows for admin users

---

### Task 2G.3.7: Update UserDashboard Component - Recent Activity Section

**File:** `/src/components/UserDashboard.tsx`
**Effort:** 0.5 SP
**Dependencies:** Task 2G.3.4

#### Description
Update the Recent Activity section with translations.

#### Current Hardcoded Strings (lines 345-391)

| Line | String | Translation Key |
|------|--------|-----------------|
| 349 | `"Recent Activity"` | `settings.profile.recentActivity.title` |
| 366 | `"No recent activity"` | `settings.profile.recentActivity.noActivity` |
| 375 | `'Created '` | `settings.profile.recentActivity.created` |
| 376 | `'Updated '` | `settings.profile.recentActivity.updated` |
| 377 | `'Viewed '` | `settings.profile.recentActivity.viewed` |

#### Implementation Steps

**Step 1: Update section heading (line 347-349)**
```typescript
<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
  <Activity className="w-5 h-5 mr-2" />
  {t('recentActivity.title')}
</h3>
```

**Step 2: Update empty state (line 366)**
```typescript
<p className="text-sm text-gray-500 italic">{t('recentActivity.noActivity')}</p>
```

**Step 3: Update activity action text (lines 374-378)**
```typescript
<p className="text-sm font-medium text-gray-900 truncate">
  {activity.action === 'created' && t('recentActivity.created', { name: activity.name })}
  {activity.action === 'updated' && t('recentActivity.updated', { name: activity.name })}
  {activity.action === 'viewed' && t('recentActivity.viewed', { name: activity.name })}
</p>
```

#### Acceptance Criteria
- [ ] Section title is translated
- [ ] Empty state message is translated
- [ ] Activity action labels are translated with name interpolation

---

### Task 2G.3.8: Update UserDashboard Component - Property Overview Section

**File:** `/src/components/UserDashboard.tsx`
**Effort:** 0.5 SP
**Dependencies:** Task 2G.3.4

#### Description
Update the Property Overview section with translations.

#### Current Hardcoded Strings (lines 395-427)

| Line | String | Translation Key |
|------|--------|-----------------|
| 398 | `"Your Properties"` | `settings.profile.propertyOverview.title` |
| 412 | `"Items:"` | `settings.profile.propertyOverview.items` |
| 416 | `"Views:"` | `settings.profile.propertyOverview.views` |
| 421 | `Last activity: {date}` | `settings.profile.propertyOverview.lastActivity` |

#### Implementation Steps

**Step 1: Update section heading (line 398)**
```typescript
<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('propertyOverview.title')}</h3>
```

**Step 2: Update property card labels (lines 411-422)**
```typescript
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{t('propertyOverview.items')}</span>
    <span className="font-medium">{property.itemCount}</span>
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{t('propertyOverview.views')}</span>
    <span className="font-medium">{property.totalViews}</span>
  </div>
  {property.lastActivity && (
    <div className="text-xs text-gray-500 mt-2">
      {t('propertyOverview.lastActivity', { date: new Date(property.lastActivity).toLocaleDateString() })}
    </div>
  )}
</div>
```

#### Acceptance Criteria
- [ ] Section title is translated
- [ ] "Items:" label is translated
- [ ] "Views:" label is translated
- [ ] Last activity text is translated with date interpolation

---

### Task 2G.3.9: Generate Translations for Non-English Languages

**Files:** `/messages/{fr,es,de,nl,it}.json`
**Effort:** 1.5 SP
**Dependencies:** Tasks 2G.3.1-2G.3.8 complete

#### Description
Generate translations for the `settings.profile` namespace in all 5 non-English languages.

#### Implementation Steps

**Step 1: French (`/messages/fr.json`)**
Add the following under the `settings` namespace:

```json
{
  "settings": {
    "profile": {
      "accountSelector": {
        "currentAccount": "Compte actuel",
        "title": "Compte",
        "switchAccount": "Changer de compte",
        "selectAccount": "Selectionner un compte...",
        "accountsAvailable": "{count} {count, plural, one {compte} other {comptes}} disponible(s)",
        "switchFailed": "Echec du changement de compte",
        "unexpectedError": "Une erreur inattendue s'est produite",
        "dismiss": "Fermer"
      },
      "accessSummary": {
        "title": "Acces au compte",
        "accountsOwned": "Comptes possedes",
        "accountsAccessed": "Comptes accessibles",
        "accountsYouOwn": "Vos comptes",
        "accountsYouAccess": "Comptes auxquels vous avez acces",
        "noOwnedAccounts": "Aucun compte possede",
        "noAccessibleAccounts": "Aucun compte accessible",
        "ownerBadge": "Proprietaire",
        "members": "{count} {count, plural, one {membre} other {membres}}",
        "created": "Cree le {date}",
        "since": "Depuis le {date}",
        "by": "par {name}",
        "totalAccounts": "Total des comptes :",
        "totalUsersWithAccess": "Utilisateurs avec acces :"
      },
      "dashboard": {
        "title": "Tableau de bord",
        "welcomeBack": "Bienvenue, {name} !",
        "currentlyViewing": "Affichage actuel : {property}",
        "refresh": "Actualiser",
        "error": {
          "title": "Erreur du tableau de bord",
          "retry": "Reessayer",
          "loadFailed": "Echec du chargement des donnees"
        }
      },
      "stats": {
        "properties": "Proprietes",
        "totalProperties": "Total des proprietes",
        "items": "Articles",
        "createdRecently": "{count} cree(s) recemment",
        "totalViews": "Vues totales",
        "last7DaysViews": "{count} ces 7 derniers jours",
        "activity": "Activite",
        "recentActions": "Actions recentes",
        "loading": "..."
      },
      "quickActions": {
        "title": "Actions rapides",
        "newItem": "Nouvel article QR Code",
        "newItemDescription": "Ajouter un nouvel article QR code",
        "viewAllItems": "Voir tous les articles",
        "viewAllItemsDescription": "Parcourir vos articles",
        "manageProperties": "Gerer les proprietes",
        "managePropertiesDescription": "Ajouter ou modifier des proprietes",
        "viewAnalytics": "Voir les analyses",
        "viewAnalyticsDescription": "Consulter vos statistiques"
      },
      "recentActivity": {
        "title": "Activite recente",
        "noActivity": "Aucune activite recente",
        "created": "Cree {name}",
        "updated": "Mis a jour {name}",
        "viewed": "Consulte {name}"
      },
      "propertyOverview": {
        "title": "Vos proprietes",
        "items": "Articles :",
        "views": "Vues :",
        "lastActivity": "Derniere activite : {date}"
      },
      "roles": {
        "owner": "Proprietaire",
        "admin": "Administrateur",
        "member": "Membre"
      },
      "fields": {
        "displayName": "Nom d'affichage",
        "email": "Adresse e-mail",
        "avatar": "Photo de profil"
      }
    }
  }
}
```

**Step 2-5:** Repeat for Spanish (es), German (de), Dutch (nl), and Italian (it) with appropriate translations.

#### Acceptance Criteria
- [ ] French translations complete
- [ ] Spanish translations complete
- [ ] German translations complete
- [ ] Dutch translations complete
- [ ] Italian translations complete
- [ ] All interpolation variables preserved (`{name}`, `{count}`, `{date}`, `{property}`)
- [ ] Pluralization patterns correct for each language
- [ ] No missing keys in any language file

---

### Task 2G.3.10: Testing and Verification

**Effort:** 1 SP
**Dependencies:** All previous tasks complete

#### Description
Verify all profile components render correctly in all 6 languages.

#### Testing Checklist

**Functional Testing:**
- [ ] AccountSelector displays correctly in all 6 languages
- [ ] AccountAccessSummary displays correctly in all 6 languages
- [ ] UserDashboard displays correctly in all 6 languages
- [ ] Role badges (Owner, Admin, Member) translate correctly
- [ ] Account counts pluralize correctly
- [ ] Member counts pluralize correctly
- [ ] Date interpolation works correctly
- [ ] User name interpolation works correctly

**Visual Testing:**
- [ ] No text overflow in AccountSelector dropdown
- [ ] No text truncation in AccountAccessSummary cards
- [ ] Stats cards maintain layout in all languages
- [ ] Quick action buttons don't break layout
- [ ] Recent activity section displays correctly

**Language Switching:**
- [ ] Switching language updates AccountSelector text
- [ ] Switching language updates AccountAccessSummary text
- [ ] Switching language updates UserDashboard text
- [ ] No page refresh required for updates

#### Verification Commands

```bash
# Run TypeScript check
npm run typecheck

# Run linting
npm run lint

# Build project to verify no errors
npm run build

# Manual testing: Start dev server and test each language
npm run dev
# Visit each component and switch between languages
```

#### Acceptance Criteria
- [ ] All functional tests pass
- [ ] All visual tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Language switching works without page refresh

---

## Summary Table

| Task ID | Description | File(s) | Effort | Status |
|---------|-------------|---------|--------|--------|
| 2G.3.1 | Add profile namespace to en.json | `/messages/en.json` | 0.5 SP | Pending |
| 2G.3.2 | Update AccountSelector | `/src/components/AccountSelector.tsx` | 1 SP | Pending |
| 2G.3.3 | Update AccountAccessSummary | `/src/components/AccountAccessSummary.tsx` | 1 SP | Pending |
| 2G.3.4 | Update UserDashboard - Header/Error | `/src/components/UserDashboard.tsx` | 0.5 SP | Pending |
| 2G.3.5 | Update UserDashboard - Stats Cards | `/src/components/UserDashboard.tsx` | 0.5 SP | Pending |
| 2G.3.6 | Update UserDashboard - Quick Actions | `/src/components/UserDashboard.tsx` | 0.5 SP | Pending |
| 2G.3.7 | Update UserDashboard - Recent Activity | `/src/components/UserDashboard.tsx` | 0.5 SP | Pending |
| 2G.3.8 | Update UserDashboard - Property Overview | `/src/components/UserDashboard.tsx` | 0.5 SP | Pending |
| 2G.3.9 | Generate translations (5 languages) | `/messages/{fr,es,de,nl,it}.json` | 1.5 SP | Pending |
| 2G.3.10 | Testing and verification | All files | 1 SP | Pending |
| **Total** | | | **8 SP** | |

---

## Files Modified Summary

| File Path | Type of Change | Task |
|-----------|---------------|------|
| `/messages/en.json` | Add `settings.profile` namespace | 2G.3.1 |
| `/messages/fr.json` | Add `settings.profile` namespace | 2G.3.9 |
| `/messages/es.json` | Add `settings.profile` namespace | 2G.3.9 |
| `/messages/de.json` | Add `settings.profile` namespace | 2G.3.9 |
| `/messages/nl.json` | Add `settings.profile` namespace | 2G.3.9 |
| `/messages/it.json` | Add `settings.profile` namespace | 2G.3.9 |
| `/src/components/AccountSelector.tsx` | Add translations | 2G.3.2 |
| `/src/components/AccountAccessSummary.tsx` | Add translations | 2G.3.3 |
| `/src/components/UserDashboard.tsx` | Add translations | 2G.3.4-2G.3.8 |

---

## References

- [Overview Document: REQ-E02-015](./REQ-E02-015-update-profile-components-overview.md)
- [Implementation Plan: L10N Epic 2](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request: REQ-E02-015](./gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
