# REQ-368: Update Navigation and Sidebar Components - Detailed Task Breakdown

**Created:** 2026-01-19 12:15 UTC
**Last Modified:** 2026-01-19 12:15 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.5
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High
**Status:** Ready for Implementation

---

## Document Overview

This document provides granular, implementation-ready tasks for internationalizing all navigation and sidebar components in the FAQBNB application. Each task is designed to be approximately 1 story point and can be executed independently where dependencies allow.

**Related Documents:**
- Overview: [REQ-368-update-navigationsidebar-components-overview.md](./REQ-368-update-navigationsidebar-components-overview.md)
- Implementation Plan: [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- Requirements: [gen_requests_epic2.md](./gen_requests_epic2.md#req-368)

---

## Component Summary

| Component | File Path | Lines | Estimated Strings |
|-----------|-----------|-------|-------------------|
| RoleBasedNavigation | `/src/components/RoleBasedNavigation.tsx` | 406 | ~35 |
| DashboardLayout | `/src/components/DashboardLayout.tsx` | 408 | ~20 |
| AdminLayout | `/src/app/admin/layout.tsx` | 309 | ~15 |
| **Total** | | | **~70 strings** |

---

## Prerequisites

Before starting implementation:
- [x] Epic 1 Foundation complete (next-intl installed)
- [x] IntlProvider configured in `/src/app/layout.tsx`
- [x] Base translation files exist in `/messages/*.json`
- [x] `useTranslations` hook available from `next-intl`

---

## Task Breakdown

### Task 1: Extend Dashboard Namespace with Navigation Keys

**Estimate:** 1 story point
**Dependencies:** None
**File:** `/messages/en.json`

**Description:** Add navigation-specific translation keys to the existing `dashboard` namespace in the English translation file.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Locate the `dashboard` object (currently at line 57)
3. Add the following nested objects inside `dashboard`:

```json
{
  "dashboard": {
    // ... existing keys ...
    "loading": {
      "dashboard": "Loading dashboard...",
      "permissions": "Loading permissions...",
      "redirecting": "Redirecting to login..."
    },
    "auth": {
      "required": "Authentication Required",
      "loginRequired": "Please log in to access the dashboard."
    },
    "actions": {
      "goHome": "Go to Home",
      "goLogin": "Go to Login"
    },
    "role": {
      "systemAdmin": "System Admin",
      "user": "User",
      "owner": "Owner",
      "admin": "Admin",
      "member": "Member",
      "viewer": "Viewer"
    },
    "sections": {
      "dashboard": "Dashboard",
      "items": "Items",
      "guides": "Guides",
      "properties": "Properties",
      "analytics": "Analytics",
      "systemAdmin": "System Admin"
    },
    "nav": {
      "ariaLabel": "Dashboard Navigation",
      "loading": "Loading navigation...",
      "openMenu": "Open main menu",
      "home": "Home",
      "dashboard": "Dashboard",
      "dashboardShort": "D/B",
      "dashboardDescription": "Overview and key metrics",
      "items": "Items",
      "itemsShort": "Items",
      "itemsDescription": "Manage QR code items",
      "guides": "Guides",
      "guidesShort": "Guide",
      "guidesDescription": "View and manage guides",
      "properties": "Properties",
      "propertiesShort": "Prop.",
      "propertiesDescription": "Property management",
      "analytics": "Analytics",
      "analyticsShort": "Analytics",
      "analyticsDescription": "View analytics and insights",
      "systemAdmin": "System Admin",
      "adminShort": "Admin",
      "systemAdminDescription": "System administration",
      "adminBadge": "Admin"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All keys are properly nested under `dashboard`
- [ ] JSON is valid (no syntax errors)
- [ ] Keys follow the `namespace.area.element` naming convention

---

### Task 2: Create Admin Namespace in English Translation File

**Estimate:** 1 story point
**Dependencies:** None
**File:** `/messages/en.json`

**Description:** Add the `admin` namespace for admin-specific navigation strings.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Add a new top-level `admin` object after the `language` section:

```json
{
  "admin": {
    "title": "FAQBNB Admin",
    "loading": {
      "panel": "Loading admin panel..."
    },
    "auth": {
      "required": "Authentication Required",
      "loginRequired": "Please log in to access the admin panel."
    },
    "actions": {
      "goHome": "Go to Home",
      "goLogin": "Go to Login"
    },
    "role": {
      "admin": "Admin",
      "user": "User"
    },
    "nav": {
      "ariaLabel": "Admin Navigation",
      "dashboard": "Dashboard",
      "items": "Items",
      "properties": "Properties",
      "myProperties": "My Properties",
      "analytics": "Analytics",
      "accessRequests": "Access Requests",
      "backOffice": "Back Office"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `admin` namespace is properly structured
- [ ] JSON remains valid
- [ ] All admin navigation items have corresponding keys

---

### Task 3: Update RoleBasedNavigation - Add Translation Import and Hook

**Estimate:** 0.5 story point
**Dependencies:** Task 1
**File:** `/src/components/RoleBasedNavigation.tsx`

**Description:** Add the `useTranslations` import and hook initialization to the RoleBasedNavigation component.

**Implementation Steps:**

1. Open `/src/components/RoleBasedNavigation.tsx`
2. Add import after line 9 (after the permissions import):

```typescript
import { useTranslations } from 'next-intl';
```

3. Inside the `RoleBasedNavigation` function, after line 53 (after `const accountRole = getAccountRole();`), add:

```typescript
const t = useTranslations('dashboard');
```

**Code Changes:**

**Before (lines 1-10):**
```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Home, BarChart3, Crown, FileText } from 'lucide-react';
import { User, AccountRole } from '../types';
// REQ-023: Unified Route Architecture - Navigation Integration
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSection, PERMISSIONS, type PermissionKey } from '@/types/permissions';
```

**After:**
```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Home, BarChart3, Crown, FileText } from 'lucide-react';
import { User, AccountRole } from '../types';
// REQ-023: Unified Route Architecture - Navigation Integration
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSection, PERMISSIONS, type PermissionKey } from '@/types/permissions';
import { useTranslations } from 'next-intl';
```

**Before (around line 56):**
```typescript
  // Get current account role
  const accountRole = getAccountRole();
```

**After:**
```typescript
  // Get current account role
  const accountRole = getAccountRole();

  // L10N: Translation hook for dashboard namespace (REQ-368)
  const t = useTranslations('dashboard');
```

**Acceptance Criteria:**
- [ ] Import statement added correctly
- [ ] Hook is called inside the component function body
- [ ] No TypeScript errors
- [ ] Component still renders correctly

---

### Task 4: Update RoleBasedNavigation - Translate getNavigationItems Function

**Estimate:** 1 story point
**Dependencies:** Task 3
**File:** `/src/components/RoleBasedNavigation.tsx`

**Description:** Replace all hardcoded strings in the `getNavigationItems` function (lines 59-142) with translation keys.

**Implementation Steps:**

Replace the `getNavigationItems` function content. The function starts at line 59 and ends at line 142.

**Before (lines 64-74 - Dashboard item):**
```typescript
    if (dashboardPermissions.canAccessDashboard) {
      items.push({
        name: compactMode ? 'Home' : 'Dashboard',
        mobileName: 'D/B',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        description: 'Overview and key metrics',
        dashboardSection: DashboardSection.dashboard,
        requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
      });
    }
```

**After:**
```typescript
    if (dashboardPermissions.canAccessDashboard) {
      items.push({
        name: compactMode ? t('nav.home') : t('nav.dashboard'),
        mobileName: t('nav.dashboardShort'),
        href: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        description: t('nav.dashboardDescription'),
        dashboardSection: DashboardSection.dashboard,
        requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
      });
    }
```

**Before (lines 77-98 - Items and Guides):**
```typescript
    if (dashboardPermissions.canAccessItems) {
      items.push({
        name: 'Items',
        mobileName: 'Items',
        href: '/dashboard/items',
        icon: <Package className="h-5 w-5" />,
        description: 'Manage QR code items',
        dashboardSection: DashboardSection.items,
        requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
      });

      items.push({
        name: 'Guides',
        mobileName: 'Guide',
        href: '/dashboard/instructions',
        icon: <FileText className="h-5 w-5" />,
        description: 'View and manage guides',
        dashboardSection: DashboardSection.instructions,
        requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
      });
    }
```

**After:**
```typescript
    if (dashboardPermissions.canAccessItems) {
      items.push({
        name: t('nav.items'),
        mobileName: t('nav.itemsShort'),
        href: '/dashboard/items',
        icon: <Package className="h-5 w-5" />,
        description: t('nav.itemsDescription'),
        dashboardSection: DashboardSection.items,
        requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
      });

      items.push({
        name: t('nav.guides'),
        mobileName: t('nav.guidesShort'),
        href: '/dashboard/instructions',
        icon: <FileText className="h-5 w-5" />,
        description: t('nav.guidesDescription'),
        dashboardSection: DashboardSection.instructions,
        requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
      });
    }
```

**Before (lines 101-112 - Properties):**
```typescript
    if (dashboardPermissions.canAccessProperties) {
      items.push({
        name: 'Properties',
        mobileName: 'Prop.',
        href: '/dashboard/properties',
        icon: <Home className="h-5 w-5" />,
        description: 'Property management',
        dashboardSection: DashboardSection.properties,
        requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
      });
    }
```

**After:**
```typescript
    if (dashboardPermissions.canAccessProperties) {
      items.push({
        name: t('nav.properties'),
        mobileName: t('nav.propertiesShort'),
        href: '/dashboard/properties',
        icon: <Home className="h-5 w-5" />,
        description: t('nav.propertiesDescription'),
        dashboardSection: DashboardSection.properties,
        requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
      });
    }
```

**Before (lines 114-125 - Analytics):**
```typescript
    if (isAdmin && dashboardPermissions.canAccessAnalytics) {
      items.push({
        name: 'Analytics',
        mobileName: 'Analytics',
        href: '/dashboard/analytics',
        icon: <BarChart3 className="h-5 w-5" />,
        description: 'View analytics and insights',
        dashboardSection: DashboardSection.analytics,
        requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS]
      });
    }
```

**After:**
```typescript
    if (isAdmin && dashboardPermissions.canAccessAnalytics) {
      items.push({
        name: t('nav.analytics'),
        mobileName: t('nav.analyticsShort'),
        href: '/dashboard/analytics',
        icon: <BarChart3 className="h-5 w-5" />,
        description: t('nav.analyticsDescription'),
        dashboardSection: DashboardSection.analytics,
        requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS]
      });
    }
```

**Before (lines 127-139 - System Admin):**
```typescript
    if (showSystemAdminItems && dashboardPermissions.canAccessSystemAdmin && isAdmin) {
      items.push({
        name: compactMode ? 'Admin' : 'System Admin',
        mobileName: 'Admin',
        href: '/admin/system',
        icon: <Crown className="h-5 w-5" />,
        description: 'System administration',
        dashboardSection: DashboardSection.systemAdmin,
        systemAdminOnly: true,
        requiredPermissions: [PERMISSIONS.ACCESS_SYSTEM_ADMIN]
      });
    }
```

**After:**
```typescript
    if (showSystemAdminItems && dashboardPermissions.canAccessSystemAdmin && isAdmin) {
      items.push({
        name: compactMode ? t('nav.adminShort') : t('nav.systemAdmin'),
        mobileName: t('nav.adminShort'),
        href: '/admin/system',
        icon: <Crown className="h-5 w-5" />,
        description: t('nav.systemAdminDescription'),
        dashboardSection: DashboardSection.systemAdmin,
        systemAdminOnly: true,
        requiredPermissions: [PERMISSIONS.ACCESS_SYSTEM_ADMIN]
      });
    }
```

**Acceptance Criteria:**
- [ ] All 6 navigation items use translation keys
- [ ] `name`, `mobileName`, and `description` properties use `t()` calls
- [ ] No hardcoded English text remains in `getNavigationItems`

---

### Task 5: Update RoleBasedNavigation - Translate Loading State

**Estimate:** 0.5 story point
**Dependencies:** Task 3
**File:** `/src/components/RoleBasedNavigation.tsx`

**Description:** Replace the hardcoded loading text with a translation key.

**Implementation Steps:**

Locate lines 186-194 (loading state render).

**Before (line 191):**
```tsx
        <span className="ml-2 text-sm text-gray-600">Loading navigation...</span>
```

**After:**
```tsx
        <span className="ml-2 text-sm text-gray-600">{t('nav.loading')}</span>
```

**Acceptance Criteria:**
- [ ] Loading text uses translation key
- [ ] Loading spinner still displays correctly

---

### Task 6: Update RoleBasedNavigation - Translate Desktop Navigation UI

**Estimate:** 0.5 story point
**Dependencies:** Task 3
**File:** `/src/components/RoleBasedNavigation.tsx`

**Description:** Replace hardcoded text in the DesktopNavigation component, specifically the admin badge.

**Implementation Steps:**

Locate lines 217-220 (admin badge in desktop nav).

**Before (lines 217-220):**
```tsx
            {item.systemAdminOnly && (
              <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
```

**After:**
```tsx
            {item.systemAdminOnly && (
              <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                {t('nav.adminBadge')}
              </span>
            )}
```

**Acceptance Criteria:**
- [ ] Admin badge text uses translation key
- [ ] Badge styling unchanged

---

### Task 7: Update RoleBasedNavigation - Translate Mobile Navigation UI

**Estimate:** 0.5 story point
**Dependencies:** Task 3
**File:** `/src/components/RoleBasedNavigation.tsx`

**Description:** Replace hardcoded text in the MobileNavigation component, including screen reader text and admin badge.

**Implementation Steps:**

1. Locate line 237 (screen reader text):

**Before:**
```tsx
        <span className="sr-only">Open main menu</span>
```

**After:**
```tsx
        <span className="sr-only">{t('nav.openMenu')}</span>
```

2. Locate lines 286-289 (admin badge in mobile nav):

**Before:**
```tsx
                        {item.systemAdminOnly && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
```

**After:**
```tsx
                        {item.systemAdminOnly && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                            {t('nav.adminBadge')}
                          </span>
                        )}
```

**Acceptance Criteria:**
- [ ] Screen reader text uses translation key
- [ ] Mobile admin badge uses translation key
- [ ] Mobile menu still functions correctly

---

### Task 8: Update DashboardLayout - Add Translation Imports and Hooks

**Estimate:** 0.5 story point
**Dependencies:** Task 1
**File:** `/src/components/DashboardLayout.tsx`

**Description:** Add translation imports and hooks to the DashboardLayout component.

**Implementation Steps:**

1. Add import after line 11 (after the Property import):

```typescript
import { useTranslations } from 'next-intl';
```

2. Inside the `DashboardLayout` function, after line 41 (after the `useAccountContext` hook), add:

```typescript
  // L10N: Translation hooks for dashboard and auth namespaces (REQ-368)
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
```

**Acceptance Criteria:**
- [ ] Import statement added correctly
- [ ] Both hooks initialized inside component
- [ ] No TypeScript errors

---

### Task 9: Update DashboardLayout - Translate Loading States

**Estimate:** 0.5 story point
**Dependencies:** Task 8
**File:** `/src/components/DashboardLayout.tsx`

**Description:** Replace hardcoded loading text with translation keys.

**Implementation Steps:**

Locate lines 172-184 (loading state render).

**Before (lines 178-180):**
```tsx
          <p className="text-gray-600 text-lg">
            {permissionsLoading ? 'Loading permissions...' : 'Loading dashboard...'}
          </p>
```

**After:**
```tsx
          <p className="text-gray-600 text-lg">
            {permissionsLoading ? t('loading.permissions') : t('loading.dashboard')}
          </p>
```

**Acceptance Criteria:**
- [ ] Loading text uses translation keys
- [ ] Conditional rendering preserved

---

### Task 10: Update DashboardLayout - Translate Authentication Required Screen

**Estimate:** 0.5 story point
**Dependencies:** Task 8
**File:** `/src/components/DashboardLayout.tsx`

**Description:** Replace hardcoded authentication required text with translation keys.

**Implementation Steps:**

Locate lines 186-225 (authentication required UI).

**Before (lines 206-207):**
```tsx
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
```

**After:**
```tsx
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.required')}</h1>
          <p className="text-gray-600 mb-6">{t('auth.loginRequired')}</p>
```

**Before (lines 212-219 - buttons):**
```tsx
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
```

**After:**
```tsx
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('actions.goHome')}
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('actions.goLogin')}
            </button>
```

**Acceptance Criteria:**
- [ ] Title uses translation key
- [ ] Message uses translation key
- [ ] Both button labels use translation keys

---

### Task 11: Update DashboardLayout - Translate Section Indicators

**Estimate:** 0.5 story point
**Dependencies:** Task 8
**File:** `/src/components/DashboardLayout.tsx`

**Description:** Replace hardcoded dashboard section labels with translation keys.

**Implementation Steps:**

Locate lines 247-253 (section indicators).

**Before:**
```tsx
                      {currentDashboardSection === DashboardSection.dashboard && '📊 Dashboard'}
                      {currentDashboardSection === DashboardSection.items && '📦 Items'}
                      {currentDashboardSection === DashboardSection.instructions && '📄 Guides'}
                      {currentDashboardSection === DashboardSection.properties && '🏠 Properties'}
                      {currentDashboardSection === DashboardSection.analytics && '📈 Analytics'}
                      {currentDashboardSection === DashboardSection.systemAdmin && '👑 System Admin'}
```

**After:**
```tsx
                      {currentDashboardSection === DashboardSection.dashboard && `📊 ${t('sections.dashboard')}`}
                      {currentDashboardSection === DashboardSection.items && `📦 ${t('sections.items')}`}
                      {currentDashboardSection === DashboardSection.instructions && `📄 ${t('sections.guides')}`}
                      {currentDashboardSection === DashboardSection.properties && `🏠 ${t('sections.properties')}`}
                      {currentDashboardSection === DashboardSection.analytics && `📈 ${t('sections.analytics')}`}
                      {currentDashboardSection === DashboardSection.systemAdmin && `👑 ${t('sections.systemAdmin')}`}
```

**Acceptance Criteria:**
- [ ] All 6 section labels use translation keys
- [ ] Emojis are preserved (not translated)

---

### Task 12: Update DashboardLayout - Translate Role Badges

**Estimate:** 0.5 story point
**Dependencies:** Task 8
**File:** `/src/components/DashboardLayout.tsx`

**Description:** Replace hardcoded role labels with translation keys.

**Implementation Steps:**

1. Locate lines 259-260 (system admin/user badge):

**Before:**
```tsx
                    {isAdmin ? '👑 System Admin' : '👤 User'}
```

**After:**
```tsx
                    {isAdmin ? `👑 ${t('role.systemAdmin')}` : `👤 ${t('role.user')}`}
```

2. Locate lines 263-268 (account role badges):

**Before:**
```tsx
                    {accountRole === AccountRole.OWNER && '🏠 Owner'}
                    {accountRole === AccountRole.ADMIN && '⚙️ Admin'}
                    {accountRole === AccountRole.MEMBER && '👥 Member'}
                    {accountRole === AccountRole.VIEWER && '👁️ Viewer'}
```

**After:**
```tsx
                    {accountRole === AccountRole.OWNER && `🏠 ${t('role.owner')}`}
                    {accountRole === AccountRole.ADMIN && `⚙️ ${t('role.admin')}`}
                    {accountRole === AccountRole.MEMBER && `👥 ${t('role.member')}`}
                    {accountRole === AccountRole.VIEWER && `👁️ ${t('role.viewer')}`}
```

**Acceptance Criteria:**
- [ ] System admin badge uses translation
- [ ] User badge uses translation
- [ ] All 4 account role badges use translations
- [ ] Emojis preserved

---

### Task 13: Update DashboardLayout - Translate Logout Button

**Estimate:** 0.5 story point
**Dependencies:** Task 8
**File:** `/src/components/DashboardLayout.tsx`

**Description:** Replace hardcoded logout button text and tooltip with translation keys.

**Implementation Steps:**

Locate lines 293-299 (logout button).

**Before:**
```tsx
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
                title="Sign out of your account"
              >
                Logout
              </button>
```

**After:**
```tsx
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
                title={tAuth('confirmSignOutMessage')}
              >
                {tAuth('signOut')}
              </button>
```

**Note:** Uses existing `auth` namespace keys (`signOut` and `confirmSignOutMessage`) already present in `/messages/en.json`.

**Acceptance Criteria:**
- [ ] Logout button text uses `tAuth('signOut')`
- [ ] Button title attribute uses `tAuth('confirmSignOutMessage')`

---

### Task 14: Update AdminLayout - Add Translation Imports and Hooks

**Estimate:** 0.5 story point
**Dependencies:** Task 2
**File:** `/src/app/admin/layout.tsx`

**Description:** Add translation imports and hooks to the AdminLayoutContent component.

**Implementation Steps:**

1. Add import after line 9 (after the Property import):

```typescript
import { useTranslations } from 'next-intl';
```

2. Inside the `AdminLayoutContent` function, after line 26 (after `useState` for `isSysAdmin`), add:

```typescript
  // L10N: Translation hooks for admin and auth namespaces (REQ-368)
  const t = useTranslations('admin');
  const tAuth = useTranslations('auth');
```

**Acceptance Criteria:**
- [ ] Import statement added correctly
- [ ] Both hooks initialized inside AdminLayoutContent
- [ ] No TypeScript errors

---

### Task 15: Update AdminLayout - Translate getNavigationItems Function

**Estimate:** 1 story point
**Dependencies:** Task 14
**File:** `/src/app/admin/layout.tsx`

**Description:** Replace hardcoded navigation item names with translation keys.

**Implementation Steps:**

Locate lines 119-148 (getNavigationItems function).

**Before:**
```typescript
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/admin', icon: '📊' },
      { name: 'Items', href: '/admin/items', icon: '📦' },
    ];

    if (isAdmin) {
      const adminItems = [
        ...baseItems,
        { name: 'Properties', href: '/admin/properties', icon: '🏠' },
        { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
      ];

      if (isSysAdmin) {
        adminItems.push(
          { name: 'Access Requests', href: '/admin/access-requests', icon: '🔐' },
          { name: 'Back Office', href: '/admin/back-office', icon: '👑' }
        );
      }

      return adminItems;
    } else {
      return [
        ...baseItems,
        { name: 'My Properties', href: '/admin/properties', icon: '🏠' },
        { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
      ];
    }
  };
```

**After:**
```typescript
  const getNavigationItems = () => {
    const baseItems = [
      { name: t('nav.dashboard'), href: '/admin', icon: '📊' },
      { name: t('nav.items'), href: '/admin/items', icon: '📦' },
    ];

    if (isAdmin) {
      const adminItems = [
        ...baseItems,
        { name: t('nav.properties'), href: '/admin/properties', icon: '🏠' },
        { name: t('nav.analytics'), href: '/admin/analytics', icon: '📈' },
      ];

      if (isSysAdmin) {
        adminItems.push(
          { name: t('nav.accessRequests'), href: '/admin/access-requests', icon: '🔐' },
          { name: t('nav.backOffice'), href: '/admin/back-office', icon: '👑' }
        );
      }

      return adminItems;
    } else {
      return [
        ...baseItems,
        { name: t('nav.myProperties'), href: '/admin/properties', icon: '🏠' },
        { name: t('nav.analytics'), href: '/admin/analytics', icon: '📈' },
      ];
    }
  };
```

**Acceptance Criteria:**
- [ ] All 7 unique navigation items use translation keys
- [ ] Icons unchanged
- [ ] Conditional logic preserved

---

### Task 16: Update AdminLayout - Translate Loading State

**Estimate:** 0.5 story point
**Dependencies:** Task 14
**File:** `/src/app/admin/layout.tsx`

**Description:** Replace hardcoded loading text with translation key.

**Implementation Steps:**

Locate lines 156-164 (loading state).

**Before (line 161):**
```tsx
          <p className="text-gray-600 text-lg">Loading admin panel...</p>
```

**After:**
```tsx
          <p className="text-gray-600 text-lg">{t('loading.panel')}</p>
```

**Acceptance Criteria:**
- [ ] Loading text uses translation key

---

### Task 17: Update AdminLayout - Translate Authentication Required Screen

**Estimate:** 0.5 story point
**Dependencies:** Task 14
**File:** `/src/app/admin/layout.tsx`

**Description:** Replace hardcoded authentication required text with translation keys.

**Implementation Steps:**

Locate lines 169-220 (authentication required UI).

**Before (lines 187-188):**
```tsx
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin panel.</p>
```

**After:**
```tsx
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.required')}</h1>
          <p className="text-gray-600 mb-6">{t('auth.loginRequired')}</p>
```

**Before (lines 194-195 - Go to Home button):**
```tsx
            >
              Go to Home
            </button>
```

**After:**
```tsx
            >
              {t('actions.goHome')}
            </button>
```

**Before (lines 214-215 - Go to Login button):**
```tsx
            >
              Go to Login
            </button>
```

**After:**
```tsx
            >
              {t('actions.goLogin')}
            </button>
```

**Acceptance Criteria:**
- [ ] Auth required title uses translation key
- [ ] Auth required message uses translation key
- [ ] Both button labels use translation keys

---

### Task 18: Update AdminLayout - Translate Header and Role Badge

**Estimate:** 0.5 story point
**Dependencies:** Task 14
**File:** `/src/app/admin/layout.tsx`

**Description:** Replace hardcoded header title and role badge with translation keys.

**Implementation Steps:**

1. Locate line 232 (header title):

**Before:**
```tsx
                <h1 className="text-xl font-bold text-gray-900">FAQBNB Admin</h1>
```

**After:**
```tsx
                <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
```

2. Locate line 237 (role badge):

**Before:**
```tsx
                    {isAdmin ? '👑 Admin' : '👤 User'}
```

**After:**
```tsx
                    {isAdmin ? `👑 ${t('role.admin')}` : `👤 ${t('role.user')}`}
```

**Acceptance Criteria:**
- [ ] Header title uses translation key
- [ ] Role badge uses translation keys
- [ ] Emojis preserved

---

### Task 19: Update AdminLayout - Translate Logout Button and Nav Aria Label

**Estimate:** 0.5 story point
**Dependencies:** Task 14
**File:** `/src/app/admin/layout.tsx`

**Description:** Replace hardcoded logout button text and navigation aria-label.

**Implementation Steps:**

1. Locate lines 251-256 (logout button):

**Before (lines 254-255):**
```tsx
              >
                Logout
              </button>
```

**After:**
```tsx
              >
                {tAuth('signOut')}
              </button>
```

2. Locate line 265 (navigation aria-label):

**Before:**
```tsx
          <nav className="flex space-x-8" aria-label="Admin Navigation">
```

**After:**
```tsx
          <nav className="flex space-x-8" aria-label={t('nav.ariaLabel')}>
```

**Acceptance Criteria:**
- [ ] Logout button uses `tAuth('signOut')`
- [ ] Navigation aria-label uses translation key

---

### Task 20: Add Translations to Non-English Language Files

**Estimate:** 2 story points
**Dependencies:** Tasks 1, 2
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Description:** Add corresponding translations for all new keys to the 5 non-English language files.

**Implementation Steps:**

For each language file, add the same structure with translated values. Below are the translations to add:

**French (`/messages/fr.json`):**

```json
{
  "dashboard": {
    "loading": {
      "dashboard": "Chargement du tableau de bord...",
      "permissions": "Chargement des permissions...",
      "redirecting": "Redirection vers la connexion..."
    },
    "auth": {
      "required": "Authentification requise",
      "loginRequired": "Veuillez vous connecter pour accéder au tableau de bord."
    },
    "actions": {
      "goHome": "Aller à l'accueil",
      "goLogin": "Aller à la connexion"
    },
    "role": {
      "systemAdmin": "Administrateur système",
      "user": "Utilisateur",
      "owner": "Propriétaire",
      "admin": "Administrateur",
      "member": "Membre",
      "viewer": "Lecteur"
    },
    "sections": {
      "dashboard": "Tableau de bord",
      "items": "Articles",
      "guides": "Guides",
      "properties": "Propriétés",
      "analytics": "Analytique",
      "systemAdmin": "Admin système"
    },
    "nav": {
      "ariaLabel": "Navigation du tableau de bord",
      "loading": "Chargement de la navigation...",
      "openMenu": "Ouvrir le menu principal",
      "home": "Accueil",
      "dashboard": "Tableau de bord",
      "dashboardShort": "T/B",
      "dashboardDescription": "Aperçu et indicateurs clés",
      "items": "Articles",
      "itemsShort": "Art.",
      "itemsDescription": "Gérer les articles QR code",
      "guides": "Guides",
      "guidesShort": "Guide",
      "guidesDescription": "Consulter et gérer les guides",
      "properties": "Propriétés",
      "propertiesShort": "Prop.",
      "propertiesDescription": "Gestion des propriétés",
      "analytics": "Analytique",
      "analyticsShort": "Anal.",
      "analyticsDescription": "Voir les analyses et statistiques",
      "systemAdmin": "Admin système",
      "adminShort": "Admin",
      "systemAdminDescription": "Administration du système",
      "adminBadge": "Admin"
    }
  },
  "admin": {
    "title": "Admin FAQBNB",
    "loading": {
      "panel": "Chargement du panneau d'administration..."
    },
    "auth": {
      "required": "Authentification requise",
      "loginRequired": "Veuillez vous connecter pour accéder au panneau d'administration."
    },
    "actions": {
      "goHome": "Aller à l'accueil",
      "goLogin": "Aller à la connexion"
    },
    "role": {
      "admin": "Administrateur",
      "user": "Utilisateur"
    },
    "nav": {
      "ariaLabel": "Navigation Admin",
      "dashboard": "Tableau de bord",
      "items": "Articles",
      "properties": "Propriétés",
      "myProperties": "Mes propriétés",
      "analytics": "Analytique",
      "accessRequests": "Demandes d'accès",
      "backOffice": "Back Office"
    }
  }
}
```

**Spanish (`/messages/es.json`):**

```json
{
  "dashboard": {
    "loading": {
      "dashboard": "Cargando panel de control...",
      "permissions": "Cargando permisos...",
      "redirecting": "Redirigiendo al inicio de sesión..."
    },
    "auth": {
      "required": "Autenticación requerida",
      "loginRequired": "Por favor, inicie sesión para acceder al panel de control."
    },
    "actions": {
      "goHome": "Ir al inicio",
      "goLogin": "Ir al inicio de sesión"
    },
    "role": {
      "systemAdmin": "Administrador del sistema",
      "user": "Usuario",
      "owner": "Propietario",
      "admin": "Administrador",
      "member": "Miembro",
      "viewer": "Espectador"
    },
    "sections": {
      "dashboard": "Panel de control",
      "items": "Artículos",
      "guides": "Guías",
      "properties": "Propiedades",
      "analytics": "Analítica",
      "systemAdmin": "Admin del sistema"
    },
    "nav": {
      "ariaLabel": "Navegación del panel de control",
      "loading": "Cargando navegación...",
      "openMenu": "Abrir menú principal",
      "home": "Inicio",
      "dashboard": "Panel de control",
      "dashboardShort": "P/C",
      "dashboardDescription": "Resumen y métricas clave",
      "items": "Artículos",
      "itemsShort": "Art.",
      "itemsDescription": "Gestionar artículos con código QR",
      "guides": "Guías",
      "guidesShort": "Guía",
      "guidesDescription": "Ver y gestionar guías",
      "properties": "Propiedades",
      "propertiesShort": "Prop.",
      "propertiesDescription": "Gestión de propiedades",
      "analytics": "Analítica",
      "analyticsShort": "Anal.",
      "analyticsDescription": "Ver análisis e información",
      "systemAdmin": "Admin del sistema",
      "adminShort": "Admin",
      "systemAdminDescription": "Administración del sistema",
      "adminBadge": "Admin"
    }
  },
  "admin": {
    "title": "Admin FAQBNB",
    "loading": {
      "panel": "Cargando panel de administración..."
    },
    "auth": {
      "required": "Autenticación requerida",
      "loginRequired": "Por favor, inicie sesión para acceder al panel de administración."
    },
    "actions": {
      "goHome": "Ir al inicio",
      "goLogin": "Ir al inicio de sesión"
    },
    "role": {
      "admin": "Administrador",
      "user": "Usuario"
    },
    "nav": {
      "ariaLabel": "Navegación Admin",
      "dashboard": "Panel de control",
      "items": "Artículos",
      "properties": "Propiedades",
      "myProperties": "Mis propiedades",
      "analytics": "Analítica",
      "accessRequests": "Solicitudes de acceso",
      "backOffice": "Back Office"
    }
  }
}
```

**German (`/messages/de.json`):**

```json
{
  "dashboard": {
    "loading": {
      "dashboard": "Dashboard wird geladen...",
      "permissions": "Berechtigungen werden geladen...",
      "redirecting": "Weiterleitung zur Anmeldung..."
    },
    "auth": {
      "required": "Authentifizierung erforderlich",
      "loginRequired": "Bitte melden Sie sich an, um auf das Dashboard zuzugreifen."
    },
    "actions": {
      "goHome": "Zur Startseite",
      "goLogin": "Zur Anmeldung"
    },
    "role": {
      "systemAdmin": "Systemadministrator",
      "user": "Benutzer",
      "owner": "Eigentümer",
      "admin": "Administrator",
      "member": "Mitglied",
      "viewer": "Betrachter"
    },
    "sections": {
      "dashboard": "Dashboard",
      "items": "Elemente",
      "guides": "Anleitungen",
      "properties": "Immobilien",
      "analytics": "Analytik",
      "systemAdmin": "Systemadmin"
    },
    "nav": {
      "ariaLabel": "Dashboard-Navigation",
      "loading": "Navigation wird geladen...",
      "openMenu": "Hauptmenü öffnen",
      "home": "Startseite",
      "dashboard": "Dashboard",
      "dashboardShort": "D/B",
      "dashboardDescription": "Übersicht und Kennzahlen",
      "items": "Elemente",
      "itemsShort": "Elem.",
      "itemsDescription": "QR-Code-Elemente verwalten",
      "guides": "Anleitungen",
      "guidesShort": "Anleit.",
      "guidesDescription": "Anleitungen anzeigen und verwalten",
      "properties": "Immobilien",
      "propertiesShort": "Immo.",
      "propertiesDescription": "Immobilienverwaltung",
      "analytics": "Analytik",
      "analyticsShort": "Analytik",
      "analyticsDescription": "Analysen und Einblicke anzeigen",
      "systemAdmin": "Systemadmin",
      "adminShort": "Admin",
      "systemAdminDescription": "Systemadministration",
      "adminBadge": "Admin"
    }
  },
  "admin": {
    "title": "FAQBNB Admin",
    "loading": {
      "panel": "Admin-Panel wird geladen..."
    },
    "auth": {
      "required": "Authentifizierung erforderlich",
      "loginRequired": "Bitte melden Sie sich an, um auf das Admin-Panel zuzugreifen."
    },
    "actions": {
      "goHome": "Zur Startseite",
      "goLogin": "Zur Anmeldung"
    },
    "role": {
      "admin": "Administrator",
      "user": "Benutzer"
    },
    "nav": {
      "ariaLabel": "Admin-Navigation",
      "dashboard": "Dashboard",
      "items": "Elemente",
      "properties": "Immobilien",
      "myProperties": "Meine Immobilien",
      "analytics": "Analytik",
      "accessRequests": "Zugriffsanfragen",
      "backOffice": "Back Office"
    }
  }
}
```

**Dutch (`/messages/nl.json`):**

```json
{
  "dashboard": {
    "loading": {
      "dashboard": "Dashboard laden...",
      "permissions": "Rechten laden...",
      "redirecting": "Doorsturen naar inloggen..."
    },
    "auth": {
      "required": "Authenticatie vereist",
      "loginRequired": "Log in om toegang te krijgen tot het dashboard."
    },
    "actions": {
      "goHome": "Naar startpagina",
      "goLogin": "Naar inloggen"
    },
    "role": {
      "systemAdmin": "Systeembeheerder",
      "user": "Gebruiker",
      "owner": "Eigenaar",
      "admin": "Beheerder",
      "member": "Lid",
      "viewer": "Kijker"
    },
    "sections": {
      "dashboard": "Dashboard",
      "items": "Items",
      "guides": "Handleidingen",
      "properties": "Eigenschappen",
      "analytics": "Analytiek",
      "systemAdmin": "Systeembeheer"
    },
    "nav": {
      "ariaLabel": "Dashboard-navigatie",
      "loading": "Navigatie laden...",
      "openMenu": "Hoofdmenu openen",
      "home": "Startpagina",
      "dashboard": "Dashboard",
      "dashboardShort": "D/B",
      "dashboardDescription": "Overzicht en belangrijke statistieken",
      "items": "Items",
      "itemsShort": "Items",
      "itemsDescription": "QR-code items beheren",
      "guides": "Handleidingen",
      "guidesShort": "Handleid.",
      "guidesDescription": "Handleidingen bekijken en beheren",
      "properties": "Eigenschappen",
      "propertiesShort": "Eig.",
      "propertiesDescription": "Eigenschapbeheer",
      "analytics": "Analytiek",
      "analyticsShort": "Analytiek",
      "analyticsDescription": "Analyses en inzichten bekijken",
      "systemAdmin": "Systeembeheer",
      "adminShort": "Admin",
      "systemAdminDescription": "Systeembeheer",
      "adminBadge": "Admin"
    }
  },
  "admin": {
    "title": "FAQBNB Admin",
    "loading": {
      "panel": "Admin-paneel laden..."
    },
    "auth": {
      "required": "Authenticatie vereist",
      "loginRequired": "Log in om toegang te krijgen tot het admin-paneel."
    },
    "actions": {
      "goHome": "Naar startpagina",
      "goLogin": "Naar inloggen"
    },
    "role": {
      "admin": "Beheerder",
      "user": "Gebruiker"
    },
    "nav": {
      "ariaLabel": "Admin-navigatie",
      "dashboard": "Dashboard",
      "items": "Items",
      "properties": "Eigenschappen",
      "myProperties": "Mijn eigenschappen",
      "analytics": "Analytiek",
      "accessRequests": "Toegangsverzoeken",
      "backOffice": "Back Office"
    }
  }
}
```

**Italian (`/messages/it.json`):**

```json
{
  "dashboard": {
    "loading": {
      "dashboard": "Caricamento dashboard...",
      "permissions": "Caricamento permessi...",
      "redirecting": "Reindirizzamento al login..."
    },
    "auth": {
      "required": "Autenticazione richiesta",
      "loginRequired": "Effettua l'accesso per accedere alla dashboard."
    },
    "actions": {
      "goHome": "Vai alla home",
      "goLogin": "Vai al login"
    },
    "role": {
      "systemAdmin": "Amministratore di sistema",
      "user": "Utente",
      "owner": "Proprietario",
      "admin": "Amministratore",
      "member": "Membro",
      "viewer": "Osservatore"
    },
    "sections": {
      "dashboard": "Dashboard",
      "items": "Articoli",
      "guides": "Guide",
      "properties": "Proprietà",
      "analytics": "Analitica",
      "systemAdmin": "Admin sistema"
    },
    "nav": {
      "ariaLabel": "Navigazione dashboard",
      "loading": "Caricamento navigazione...",
      "openMenu": "Apri menu principale",
      "home": "Home",
      "dashboard": "Dashboard",
      "dashboardShort": "D/B",
      "dashboardDescription": "Panoramica e metriche chiave",
      "items": "Articoli",
      "itemsShort": "Art.",
      "itemsDescription": "Gestisci articoli con codice QR",
      "guides": "Guide",
      "guidesShort": "Guida",
      "guidesDescription": "Visualizza e gestisci le guide",
      "properties": "Proprietà",
      "propertiesShort": "Prop.",
      "propertiesDescription": "Gestione proprietà",
      "analytics": "Analitica",
      "analyticsShort": "Anal.",
      "analyticsDescription": "Visualizza analisi e approfondimenti",
      "systemAdmin": "Admin sistema",
      "adminShort": "Admin",
      "systemAdminDescription": "Amministrazione del sistema",
      "adminBadge": "Admin"
    }
  },
  "admin": {
    "title": "FAQBNB Admin",
    "loading": {
      "panel": "Caricamento pannello admin..."
    },
    "auth": {
      "required": "Autenticazione richiesta",
      "loginRequired": "Effettua l'accesso per accedere al pannello admin."
    },
    "actions": {
      "goHome": "Vai alla home",
      "goLogin": "Vai al login"
    },
    "role": {
      "admin": "Amministratore",
      "user": "Utente"
    },
    "nav": {
      "ariaLabel": "Navigazione Admin",
      "dashboard": "Dashboard",
      "items": "Articoli",
      "properties": "Proprietà",
      "myProperties": "Le mie proprietà",
      "analytics": "Analitica",
      "accessRequests": "Richieste di accesso",
      "backOffice": "Back Office"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 5 language files have the `dashboard.loading`, `dashboard.auth`, `dashboard.actions`, `dashboard.role`, `dashboard.sections`, `dashboard.nav` keys
- [ ] All 5 language files have the `admin` namespace with all required keys
- [ ] JSON is valid in all files
- [ ] Translations are contextually accurate

---

### Task 21: Add Comment for getNavigationItemsForUser Utility

**Estimate:** 0.25 story point
**Dependencies:** Task 4
**File:** `/src/components/RoleBasedNavigation.tsx`

**Description:** Add a TODO/deprecation comment to the standalone `getNavigationItemsForUser` utility function indicating it needs refactoring for i18n support.

**Implementation Steps:**

Locate line 314-315 (utility function).

**Before:**
```typescript
// Utility function to get navigation items (can be used independently) - REQ-023 enhanced
export function getNavigationItemsForUser(
```

**After:**
```typescript
// Utility function to get navigation items (can be used independently) - REQ-023 enhanced
// TODO (REQ-368): This utility function cannot use hooks and returns hardcoded English strings.
// For i18n support, either:
// 1. Deprecate this function and use getNavigationItems inside components only
// 2. Refactor to accept a translation function as a parameter: t: (key: string) => string
// Current usage should be audited and migrated to component-level translations.
export function getNavigationItemsForUser(
```

**Acceptance Criteria:**
- [ ] Comment added with clear explanation
- [ ] TODO includes REQ-368 reference
- [ ] Two refactoring options documented

---

## Testing Requirements

### Manual Testing Checklist

**After completing all tasks, verify:**

#### General Navigation
- [ ] Application starts without console errors
- [ ] No missing translation key warnings in browser console
- [ ] All navigation components render correctly in English

#### RoleBasedNavigation Component
- [ ] Dashboard, Items, Guides, Properties, Analytics menu items display translated text
- [ ] System Admin item displays translated text (when visible)
- [ ] Loading state shows translated "Loading navigation..." text
- [ ] Mobile menu button has translated aria-label for screen readers
- [ ] Mobile navigation item descriptions show translated tooltips
- [ ] Admin badge displays translated text in both desktop and mobile views

#### DashboardLayout Component
- [ ] Loading states show translated text
- [ ] Authentication required screen shows translated title, message, and buttons
- [ ] Dashboard section indicators show translated names with emojis
- [ ] Role badges show translated role names with emojis
- [ ] Logout button shows translated text

#### AdminLayout Component
- [ ] All navigation items display translated text
- [ ] Loading admin panel message shows translated
- [ ] Authentication required screen shows translated text
- [ ] Header title shows translated "FAQBNB Admin"
- [ ] Role badge shows translated admin/user text
- [ ] Logout button shows translated text
- [ ] Navigation aria-label uses translated value

#### Language Switching
- [ ] Switch to French and verify all navigation updates
- [ ] Switch to Spanish and verify all navigation updates
- [ ] Switch to German and verify all navigation updates
- [ ] Switch to Dutch and verify all navigation updates
- [ ] Switch to Italian and verify all navigation updates
- [ ] Switch back to English and verify restoration

#### Layout and Accessibility
- [ ] No text overflow in navigation items (especially German)
- [ ] Mobile abbreviated labels fit properly
- [ ] Admin badges don't break layout
- [ ] Screen reader announces navigation elements correctly
- [ ] Keyboard navigation works properly

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing translation keys at runtime | Build-time check enabled by next-intl; fallback to key name |
| Text overflow in navigation | Use abbreviated forms for mobile; test all languages |
| Utility function breaks external callers | Added TODO comment; audit usage before modifying |
| Performance impact from hooks | `useTranslations` is optimized for re-renders |

---

## Acceptance Criteria Summary (from REQ-368)

| Criterion | Implementing Tasks |
|-----------|-------------------|
| All navigation menu items use translation keys | Tasks 4, 15 |
| All sidebar section labels use translation keys | Task 11 |
| All navigation tooltips translated | Task 4 (descriptions) |
| Navigation icons remain visible and labeled | All tasks (icons untouched) |
| Active navigation states work correctly | Verified in testing |
| Collapsible navigation sections maintain functionality | Task 7 (MobileNavigation) |
| Navigation breadcrumbs display translated route names | N/A (not in current components) |
| No hardcoded English strings remain | All tasks |
| Language switching updates text without reload | Verified in testing |
| Translation keys follow naming convention | Tasks 1, 2 |

---

## Completion Checklist

- [ ] Task 1: Dashboard namespace extended with navigation keys
- [ ] Task 2: Admin namespace created
- [ ] Task 3: RoleBasedNavigation - import and hook added
- [ ] Task 4: RoleBasedNavigation - getNavigationItems translated
- [ ] Task 5: RoleBasedNavigation - loading state translated
- [ ] Task 6: RoleBasedNavigation - desktop nav translated
- [ ] Task 7: RoleBasedNavigation - mobile nav translated
- [ ] Task 8: DashboardLayout - import and hooks added
- [ ] Task 9: DashboardLayout - loading states translated
- [ ] Task 10: DashboardLayout - auth required screen translated
- [ ] Task 11: DashboardLayout - section indicators translated
- [ ] Task 12: DashboardLayout - role badges translated
- [ ] Task 13: DashboardLayout - logout button translated
- [ ] Task 14: AdminLayout - import and hooks added
- [ ] Task 15: AdminLayout - getNavigationItems translated
- [ ] Task 16: AdminLayout - loading state translated
- [ ] Task 17: AdminLayout - auth required screen translated
- [ ] Task 18: AdminLayout - header and role badge translated
- [ ] Task 19: AdminLayout - logout and aria-label translated
- [ ] Task 20: Non-English translations added to all 5 language files
- [ ] Task 21: TODO comment added for utility function
- [ ] All manual tests passed
- [ ] Build succeeds without errors
- [ ] No console warnings for missing translations

---

## References

- [Overview Document](./REQ-368-update-navigationsidebar-components-overview.md)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Requirements](./gen_requests_epic2.md#req-368)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2B.5*
*Total estimated effort: ~12 story points*
