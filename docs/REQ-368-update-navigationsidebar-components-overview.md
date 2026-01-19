# REQ-368: Update Navigation and Sidebar Components for Internationalization

**Created:** 2026-01-19 11:41 UTC
**Last Modified:** 2026-01-19 11:41 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.5
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Overview

This document provides the implementation breakdown for internationalizing all navigation and sidebar components in the FAQBNB application. This is Task 2B.5 in the L10N Epic 2 implementation plan, which focuses on replacing all hardcoded English text strings with translation keys from the `dashboard` and `common` namespaces using the next-intl framework.

The navigation and sidebar components are critical UI elements that users interact with throughout the application. This task covers:
- `RoleBasedNavigation.tsx` - The main navigation component with permission-based menu items
- `DashboardLayout.tsx` - The legacy dashboard layout with embedded navigation
- `/src/app/admin/layout.tsx` - The admin area layout with its own navigation items

**Total Estimated Strings:** ~75-85 strings across all navigation components

---

## Current State Analysis

### Components to Update

| Component | File Path | Estimated Strings | Component Type |
|-----------|-----------|-------------------|----------------|
| RoleBasedNavigation | `/src/components/RoleBasedNavigation.tsx` | ~40 | Client Component |
| DashboardLayout | `/src/components/DashboardLayout.tsx` | ~25 | Client Component |
| AdminLayout | `/src/app/admin/layout.tsx` | ~20 | Client Component |

### RoleBasedNavigation Component Analysis

**Location:** `/src/components/RoleBasedNavigation.tsx`

**Existing Dependencies:**
```typescript
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Home, BarChart3, Crown, FileText } from 'lucide-react';
import { User, AccountRole } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSection, PERMISSIONS, type PermissionKey } from '@/types/permissions';
```

**Hardcoded Strings Inventory (RoleBasedNavigation):**

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 67 | `'Home'` | `dashboard.nav.home` | compactMode dashboard label |
| 67 | `'Dashboard'` | `dashboard.nav.dashboard` | Full dashboard label |
| 68 | `'D/B'` | `dashboard.nav.dashboardShort` | Mobile label |
| 70 | `'Overview and key metrics'` | `dashboard.nav.dashboardDescription` | Description/tooltip |
| 80 | `'Items'` | `dashboard.nav.items` | Items menu label |
| 81 | `'Items'` | `dashboard.nav.itemsShort` | Mobile label |
| 83 | `'Manage QR code items'` | `dashboard.nav.itemsDescription` | Description |
| 91 | `'Guides'` | `dashboard.nav.guides` | Guides menu label |
| 92 | `'Guide'` | `dashboard.nav.guidesShort` | Mobile label |
| 94 | `'View and manage guides'` | `dashboard.nav.guidesDescription` | Description |
| 105 | `'Properties'` | `dashboard.nav.properties` | Properties menu label |
| 106 | `'Prop.'` | `dashboard.nav.propertiesShort` | Mobile label |
| 108 | `'Property management'` | `dashboard.nav.propertiesDescription` | Description |
| 118 | `'Analytics'` | `dashboard.nav.analytics` | Analytics menu label |
| 119 | `'Analytics'` | `dashboard.nav.analyticsShort` | Mobile label |
| 121 | `'View analytics and insights'` | `dashboard.nav.analyticsDescription` | Description |
| 130 | `'Admin'` | `dashboard.nav.adminShort` | compactMode admin label |
| 130 | `'System Admin'` | `dashboard.nav.systemAdmin` | Full system admin label |
| 131 | `'Admin'` | `dashboard.nav.adminShort` | Mobile label |
| 133 | `'System administration'` | `dashboard.nav.systemAdminDescription` | Description |
| 191 | `'Loading navigation...'` | `dashboard.nav.loading` | Loading state |
| 237 | `'Open main menu'` | `dashboard.nav.openMenu` | Screen reader text |
| 219 | `'Admin'` | `dashboard.nav.adminBadge` | Admin badge label |
| 287-288 | `'Admin'` | `dashboard.nav.adminBadge` | Admin badge in mobile |

### DashboardLayout Component Analysis

**Location:** `/src/components/DashboardLayout.tsx`

**Hardcoded Strings Inventory (DashboardLayout):**

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 24 | `'FAQBNB Dashboard'` | `dashboard.title` | Default title prop |
| 179 | `'Loading permissions...'` | `dashboard.loading.permissions` | Permission loading state |
| 179 | `'Loading dashboard...'` | `dashboard.loading.dashboard` | Dashboard loading state |
| 206 | `'Authentication Required'` | `dashboard.auth.required` | Auth required title |
| 207 | `'Please log in to access the dashboard.'` | `dashboard.auth.loginRequired` | Auth required message |
| 212 | `'Go to Home'` | `dashboard.actions.goHome` | Home button text |
| 218 | `'Go to Login'` | `dashboard.actions.goLogin` | Login button text |
| 237 | `'FAQBNB Dashboard'` | `dashboard.title` | Header title |
| 247-252 | Dashboard section labels | `dashboard.sections.*` | Section indicator labels |
| 259-260 | `'👑 System Admin'`, `'👤 User'` | `dashboard.role.systemAdmin`, `dashboard.role.user` | Role badges |
| 264-268 | Role labels | `dashboard.role.*` | Account role labels |
| 298 | `'Logout'` | `auth.signOut` | Logout button |
| 298 | `'Sign out of your account'` | `auth.signOutDescription` | Logout button title |

### AdminLayout Component Analysis

**Location:** `/src/app/admin/layout.tsx`

**Hardcoded Strings Inventory (AdminLayout):**

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 121 | `'Dashboard'` | `admin.nav.dashboard` | Navigation item |
| 122 | `'Items'` | `admin.nav.items` | Navigation item |
| 128 | `'Properties'` | `admin.nav.properties` | Navigation item |
| 129 | `'Analytics'` | `admin.nav.analytics` | Navigation item |
| 135 | `'Access Requests'` | `admin.nav.accessRequests` | Navigation item (sysadmin only) |
| 136 | `'Back Office'` | `admin.nav.backOffice` | Navigation item (sysadmin only) |
| 144 | `'My Properties'` | `admin.nav.myProperties` | Navigation item (non-admin) |
| 161 | `'Loading admin panel...'` | `admin.loading.panel` | Loading state |
| 187 | `'Authentication Required'` | `admin.auth.required` | Auth required title |
| 188 | `'Please log in to access the admin panel.'` | `admin.auth.loginRequired` | Auth required message |
| 192 | `'Go to Home'` | `admin.actions.goHome` | Home button |
| 213 | `'Go to Login'` | `admin.actions.goLogin` | Login button |
| 232 | `'FAQBNB Admin'` | `admin.title` | Header title |
| 237 | `'👑 Admin'` | `admin.role.admin` | Admin role badge |
| 237 | `'👤 User'` | `admin.role.user` | User role badge |
| 254 | `'Logout'` | `auth.signOut` | Logout button |

---

## Implementation Approach

### Pattern Reference
Follow the established pattern from `LogoutButton.tsx` and `REQ-366` (Dashboard2Layout):

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');

  return <span>{t('nav.dashboard')}</span>;
}
```

### Translation Namespace Structure

The navigation strings will be organized in the `dashboard` and `admin` namespaces:

**Dashboard namespace (`/messages/en.json`):**
```json
{
  "dashboard": {
    "title": "FAQBNB Dashboard",
    "loading": {
      "dashboard": "Loading dashboard...",
      "permissions": "Loading permissions..."
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

**Admin namespace (`/messages/en.json`):**
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

---

## Authorized Files and Functions for Modification

### Primary Files

| File Path | Modification Scope |
|-----------|-------------------|
| `/src/components/RoleBasedNavigation.tsx` | Add import, replace all hardcoded strings with `t()` calls, modify `getNavigationItems()` function |
| `/src/components/DashboardLayout.tsx` | Add import, replace all hardcoded strings with `t()` calls |
| `/src/app/admin/layout.tsx` | Add import, replace `getNavigationItems()` function strings, update UI text |

### Translation Files

| File Path | Modification Scope |
|-----------|-------------------|
| `/messages/en.json` | Add/update `dashboard.nav`, `dashboard.sections`, `dashboard.role`, `admin` namespace entries |
| `/messages/fr.json` | Add French translations for all new keys |
| `/messages/es.json` | Add Spanish translations for all new keys |
| `/messages/de.json` | Add German translations for all new keys |
| `/messages/nl.json` | Add Dutch translations for all new keys |
| `/messages/it.json` | Add Italian translations for all new keys |

### Functions to Modify

| Function/Component | Location | Changes |
|-------------------|----------|---------|
| `RoleBasedNavigation` | `/src/components/RoleBasedNavigation.tsx` | Add `useTranslations` hook, refactor `getNavigationItems()` |
| `getNavigationItems` | `/src/components/RoleBasedNavigation.tsx:59-142` | Replace all hardcoded name, mobileName, description strings |
| `getNavigationItemsForUser` | `/src/components/RoleBasedNavigation.tsx:315-405` | Replace all hardcoded name, mobileName, description strings |
| `DesktopNavigation` | `/src/components/RoleBasedNavigation.tsx:197-226` | Replace admin badge text |
| `MobileNavigation` | `/src/components/RoleBasedNavigation.tsx:229-304` | Replace menu button aria-label, admin badge text |
| `DashboardLayout` | `/src/components/DashboardLayout.tsx:21-407` | Add hooks, replace loading states, auth messages, role labels |
| `AdminLayoutContent` | `/src/app/admin/layout.tsx:18-295` | Add hooks, replace `getNavigationItems()` strings, update UI |
| `getNavigationItems` (admin) | `/src/app/admin/layout.tsx:119-148` | Replace all navigation item names and icons |

---

## Implementation Tasks

### Task 1: Update Translation Files with Navigation Keys

**Estimate:** Small
**Description:** Add the required translation keys to all 6 language files.

**Steps:**
1. Open `/messages/en.json`
2. Expand the `dashboard` namespace with navigation, sections, and role entries
3. Add the `admin` namespace with navigation and role entries
4. Copy structure to other language files and translate

**English Translations (additions to existing namespace):**

```json
{
  "dashboard": {
    "title": "FAQBNB Dashboard",
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
  },
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

### Task 2: Update RoleBasedNavigation Component

**Estimate:** Medium
**Description:** Add translation hooks and refactor `getNavigationItems()` to use translation keys.

**Steps:**

1. **Add import (after line 5):**
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add translation hook (after line 53):**
```typescript
const t = useTranslations('dashboard');
```

3. **Refactor `getNavigationItems()` function (lines 59-142):**

**Before:**
```typescript
const getNavigationItems = (): NavigationItem[] => {
  if (!user || !dashboardPermissions || permissionsLoading) return [];

  const items: NavigationItem[] = [];

  if (dashboardPermissions.canAccessDashboard) {
    items.push({
      name: compactMode ? 'Home' : 'Dashboard',
      mobileName: 'D/B',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: 'Overview and key metrics',
      // ...
    });
  }
  // ... rest of items
};
```

**After:**
```typescript
const getNavigationItems = (): NavigationItem[] => {
  if (!user || !dashboardPermissions || permissionsLoading) return [];

  const items: NavigationItem[] = [];

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

  return items;
};
```

4. **Update loading state (lines 188-193):**

**Before:**
```tsx
<span className="ml-2 text-sm text-gray-600">Loading navigation...</span>
```

**After:**
```tsx
<span className="ml-2 text-sm text-gray-600">{t('nav.loading')}</span>
```

5. **Update screen reader text (line 237):**

**Before:**
```tsx
<span className="sr-only">Open main menu</span>
```

**After:**
```tsx
<span className="sr-only">{t('nav.openMenu')}</span>
```

6. **Update admin badges (lines 219, 287):**

**Before:**
```tsx
<span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
  Admin
</span>
```

**After:**
```tsx
<span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
  {t('nav.adminBadge')}
</span>
```

### Task 3: Update DashboardLayout Component

**Estimate:** Medium
**Description:** Add translation hooks and replace all hardcoded strings in DashboardLayout.

**Steps:**

1. **Add import (after line 9):**
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add translation hooks (inside DashboardLayout function, after line 41):**
```typescript
const t = useTranslations('dashboard');
const tAuth = useTranslations('auth');
const tCommon = useTranslations('common');
```

3. **Update loading states (lines 173-184):**

**Before:**
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

4. **Update authentication required UI (lines 186-225):**

**Before:**
```tsx
<h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
<p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
// ...
<button>Go to Home</button>
<button>Go to Login</button>
```

**After:**
```tsx
<h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.required')}</h1>
<p className="text-gray-600 mb-6">{t('auth.loginRequired')}</p>
// ...
<button>{t('actions.goHome')}</button>
<button>{t('actions.goLogin')}</button>
```

5. **Update dashboard section indicators (lines 247-253):**

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

6. **Update role badges (lines 259-268):**

**Before:**
```tsx
{isAdmin ? '👑 System Admin' : '👤 User'}
// ...
{accountRole === AccountRole.OWNER && '🏠 Owner'}
{accountRole === AccountRole.ADMIN && '⚙️ Admin'}
{accountRole === AccountRole.MEMBER && '👥 Member'}
{accountRole === AccountRole.VIEWER && '👁️ Viewer'}
```

**After:**
```tsx
{isAdmin ? `👑 ${t('role.systemAdmin')}` : `👤 ${t('role.user')}`}
// ...
{accountRole === AccountRole.OWNER && `🏠 ${t('role.owner')}`}
{accountRole === AccountRole.ADMIN && `⚙️ ${t('role.admin')}`}
{accountRole === AccountRole.MEMBER && `👥 ${t('role.member')}`}
{accountRole === AccountRole.VIEWER && `👁️ ${t('role.viewer')}`}
```

7. **Update logout button (lines 293-299):**

**Before:**
```tsx
<button
  onClick={() => signOut()}
  className="..."
  title="Sign out of your account"
>
  Logout
</button>
```

**After:**
```tsx
<button
  onClick={() => signOut()}
  className="..."
  title={tAuth('signOutDescription')}
>
  {tAuth('signOut')}
</button>
```

### Task 4: Update AdminLayout Component

**Estimate:** Medium
**Description:** Add translation hooks and replace all hardcoded strings in AdminLayout.

**Steps:**

1. **Add import (after line 7):**
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add translation hooks (inside AdminLayoutContent, after line 26):**
```typescript
const t = useTranslations('admin');
const tAuth = useTranslations('auth');
```

3. **Refactor getNavigationItems function (lines 119-148):**

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

4. **Update loading state (lines 157-164):**

**Before:**
```tsx
<p className="text-gray-600 text-lg">Loading admin panel...</p>
```

**After:**
```tsx
<p className="text-gray-600 text-lg">{t('loading.panel')}</p>
```

5. **Update authentication required UI (lines 169-221):**

**Before:**
```tsx
<h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
<p className="text-gray-600 mb-6">Please log in to access the admin panel.</p>
// ...
<button>Go to Home</button>
<button>Go to Login</button>
```

**After:**
```tsx
<h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.required')}</h1>
<p className="text-gray-600 mb-6">{t('auth.loginRequired')}</p>
// ...
<button>{t('actions.goHome')}</button>
<button>{t('actions.goLogin')}</button>
```

6. **Update header title (line 232):**

**Before:**
```tsx
<h1 className="text-xl font-bold text-gray-900">FAQBNB Admin</h1>
```

**After:**
```tsx
<h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
```

7. **Update role badge (lines 234-238):**

**Before:**
```tsx
{isAdmin ? '👑 Admin' : '👤 User'}
```

**After:**
```tsx
{isAdmin ? `👑 ${t('role.admin')}` : `👤 ${t('role.user')}`}
```

8. **Update logout button (lines 251-256):**

**Before:**
```tsx
<button
  onClick={() => signOut()}
  className="..."
>
  Logout
</button>
```

**After:**
```tsx
<button
  onClick={() => signOut()}
  className="..."
>
  {tAuth('signOut')}
</button>
```

9. **Update navigation aria-label (line 265):**

**Before:**
```tsx
<nav className="flex space-x-8" aria-label="Admin Navigation">
```

**After:**
```tsx
<nav className="flex space-x-8" aria-label={t('nav.ariaLabel')}>
```

### Task 5: Update getNavigationItemsForUser Utility Function

**Estimate:** Small
**Description:** Note that the standalone `getNavigationItemsForUser` function at lines 315-405 in RoleBasedNavigation.tsx cannot use hooks since it's not a React component. Two options:

**Option A (Recommended):** Deprecate this function and use `getNavigationItems` inside components only.

**Option B:** Convert it to accept a translation function as a parameter:
```typescript
export function getNavigationItemsForUser(
  user: User | null,
  isAdmin: boolean,
  dashboardPermissions: any,
  accountRole: AccountRole | null,
  t: (key: string) => string, // Add translation function parameter
  showSystemAdminItems: boolean = true,
  compactMode: boolean = false
): NavigationItem[] {
  // Use t() instead of hardcoded strings
}
```

**Recommendation:** For this task, add a comment noting this function needs refactoring, but focus on the component-level translations first.

### Task 6: Generate Translations for Non-English Languages

**Estimate:** Small
**Description:** Add translations for all navigation strings to the 5 non-English language files.

**Sample Translations:**

**French (`/messages/fr.json`):**
```json
{
  "dashboard": {
    "nav": {
      "ariaLabel": "Navigation du tableau de bord",
      "loading": "Chargement de la navigation...",
      "openMenu": "Ouvrir le menu principal",
      "home": "Accueil",
      "dashboard": "Tableau de bord",
      "dashboardShort": "T/B",
      "dashboardDescription": "Apercu et indicateurs cles",
      "items": "Articles",
      "itemsShort": "Art.",
      "itemsDescription": "Gerer les articles QR code",
      "guides": "Guides",
      "guidesShort": "Guide",
      "guidesDescription": "Consulter et gerer les guides",
      "properties": "Proprietes",
      "propertiesShort": "Prop.",
      "propertiesDescription": "Gestion des proprietes",
      "analytics": "Analytique",
      "analyticsShort": "Anal.",
      "analyticsDescription": "Voir les analyses et statistiques",
      "systemAdmin": "Administration systeme",
      "adminShort": "Admin",
      "systemAdminDescription": "Administration du systeme",
      "adminBadge": "Admin"
    }
  },
  "admin": {
    "title": "Admin FAQBNB",
    "nav": {
      "ariaLabel": "Navigation Admin",
      "dashboard": "Tableau de bord",
      "items": "Articles",
      "properties": "Proprietes",
      "myProperties": "Mes proprietes",
      "analytics": "Analytique",
      "accessRequests": "Demandes d'acces",
      "backOffice": "Back Office"
    }
  }
}
```

**German (`/messages/de.json`):**
```json
{
  "dashboard": {
    "nav": {
      "ariaLabel": "Dashboard-Navigation",
      "loading": "Navigation wird geladen...",
      "openMenu": "Hauptmenu offnen",
      "home": "Startseite",
      "dashboard": "Dashboard",
      "dashboardShort": "D/B",
      "dashboardDescription": "Ubersicht und Kennzahlen",
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
      "systemAdmin": "Systemverwaltung",
      "adminShort": "Admin",
      "systemAdminDescription": "Systemadministration",
      "adminBadge": "Admin"
    }
  },
  "admin": {
    "title": "FAQBNB Admin",
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

---

## Dependencies

### Required Before Implementation
- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [x] Task 2B.1: Create `dashboard` namespace structure (existing `dashboard` namespace in en.json)
- [ ] Task 2B.2: Update Dashboard2 page (can run in parallel)
- [ ] Task 2B.3: Update Dashboard2 layout (REQ-366, can run in parallel)
- [ ] Task 2B.4: Update SimpleDashboard components (REQ-367, can run in parallel)

### Components This Affects
- All pages using `RoleBasedNavigation` component
- All pages wrapped by `DashboardLayout`
- All pages within `/admin/*` route

### Related Components
- `LanguageSwitcher` - Already internationalized (used in layouts)
- `LogoutButton` - Already internationalized (pattern reference)
- `PropertyDropdown` - May need separate internationalization task

---

## Testing Requirements

### Manual Testing Checklist

**General Navigation Testing:**
- [ ] Navigation loads without errors in English (default)
- [ ] All navigation labels display correctly in each of the 6 languages
- [ ] Mobile navigation labels display correctly (abbreviated forms)
- [ ] Navigation descriptions/tooltips show translated text
- [ ] Admin badge text displays correctly when system admin items shown
- [ ] No console errors related to missing translations

**RoleBasedNavigation Specific:**
- [ ] Dashboard, Items, Guides, Properties, Analytics menu items render translated
- [ ] System Admin item renders translated (when visible)
- [ ] Loading state shows translated "Loading navigation..." text
- [ ] Mobile menu button has translated aria-label
- [ ] Navigation item descriptions show translated tooltips

**DashboardLayout Specific:**
- [ ] Loading dashboard/permissions messages show translated
- [ ] Authentication required screen shows translated text
- [ ] Role badges show translated role names
- [ ] Section indicators show translated section names
- [ ] Logout button shows translated text

**AdminLayout Specific:**
- [ ] Admin navigation items render translated
- [ ] Loading admin panel message shows translated
- [ ] Authentication required screen shows translated text
- [ ] Header title shows translated "FAQBNB Admin"
- [ ] Role badge shows translated admin/user text
- [ ] Logout button shows translated text

### Accessibility Verification
- [ ] Navigation `aria-label` contains translated text
- [ ] Mobile menu button has translated `sr-only` text
- [ ] All navigation items are announced correctly by screen readers
- [ ] Keyboard navigation still works properly after translation changes

### Language Switch Testing
- [ ] Switching language updates all navigation strings immediately
- [ ] Navigation items update on language change without page reload
- [ ] Active navigation state persists correctly across language changes
- [ ] Role badges update immediately on language switch

### Layout Testing
- [ ] Text does not overflow navigation items in longer languages (German, French)
- [ ] Mobile abbreviated labels fit properly in all languages
- [ ] Admin badge does not break layout with longer translations
- [ ] Tooltips/descriptions display properly with longer text

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Build-time check with next-intl, runtime fallback |
| Navigation items lose reactivity | Low | High | Keep getNavigationItems inside component |
| Text overflow in mobile labels | Medium | Low | Use abbreviated forms, test all languages |
| getNavigationItemsForUser utility breaks | Medium | Medium | Deprecate or refactor to accept t() parameter |
| Admin-only navigation breaks | Low | High | Test admin routes with both admin and non-admin users |
| Mobile menu accessibility | Low | Medium | Test with screen readers in all languages |
| Performance impact from hooks | Low | Low | useTranslations is optimized for re-renders |

---

## Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| All navigation menu items use translation keys | Tasks 2, 3, 4 |
| All sidebar section labels use translation keys | Tasks 2, 3, 4 |
| All navigation tooltips translated | Task 2 (descriptions) |
| Navigation icons remain visible and labeled | All tasks (icons untouched) |
| Active navigation states work correctly | Testing verification |
| Collapsible navigation sections maintain functionality | Task 2 (MobileNavigation) |
| Navigation breadcrumbs display translated route names | N/A (no breadcrumbs in current components) |
| No hardcoded English strings remain | All tasks |
| Language switching updates text without reload | Testing verification |
| Translation keys follow naming convention | Task 1 (namespace structure) |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-368)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Translation Files](/messages/en.json)
- [Related Task: REQ-366 Dashboard2 Layout](/docs/REQ-366-update-srcappdashboard2layouttsx-overview.md)
- [Related Task: REQ-367 SimpleDashboard Components](/docs/REQ-367-update-all-simpledashboard-components-overview.md)

---

## Appendix A: Complete String Extraction Map

```
RoleBasedNavigation.tsx String Extraction
=====================================================

+---------------------------------------------------------------------+
| getNavigationItems FUNCTION (lines 59-142)                          |
+---------------------------------------------------------------------+
| Dashboard item:                                                      |
| * name: 'Home'/'Dashboard'  -> t('nav.home')/t('nav.dashboard')     |
| * mobileName: 'D/B'         -> t('nav.dashboardShort')              |
| * description               -> t('nav.dashboardDescription')         |
|                                                                      |
| Items item:                                                          |
| * name: 'Items'             -> t('nav.items')                        |
| * mobileName: 'Items'       -> t('nav.itemsShort')                   |
| * description               -> t('nav.itemsDescription')             |
|                                                                      |
| Guides item:                                                         |
| * name: 'Guides'            -> t('nav.guides')                       |
| * mobileName: 'Guide'       -> t('nav.guidesShort')                  |
| * description               -> t('nav.guidesDescription')            |
|                                                                      |
| Properties item:                                                     |
| * name: 'Properties'        -> t('nav.properties')                   |
| * mobileName: 'Prop.'       -> t('nav.propertiesShort')              |
| * description               -> t('nav.propertiesDescription')        |
|                                                                      |
| Analytics item:                                                      |
| * name: 'Analytics'         -> t('nav.analytics')                    |
| * mobileName: 'Analytics'   -> t('nav.analyticsShort')               |
| * description               -> t('nav.analyticsDescription')         |
|                                                                      |
| System Admin item:                                                   |
| * name: 'Admin'/'System Admin' -> t('nav.adminShort')/               |
|                                  t('nav.systemAdmin')                |
| * mobileName: 'Admin'       -> t('nav.adminShort')                   |
| * description               -> t('nav.systemAdminDescription')       |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| LOADING STATE (lines 187-194)                                        |
+---------------------------------------------------------------------+
| * "Loading navigation..."   -> t('nav.loading')                      |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| DESKTOP NAVIGATION (lines 197-226)                                   |
+---------------------------------------------------------------------+
| * "Admin" badge             -> t('nav.adminBadge')                   |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| MOBILE NAVIGATION (lines 229-304)                                    |
+---------------------------------------------------------------------+
| * "Open main menu"          -> t('nav.openMenu')                     |
| * "Admin" badge             -> t('nav.adminBadge')                   |
+---------------------------------------------------------------------+


DashboardLayout.tsx String Extraction
=====================================================

+---------------------------------------------------------------------+
| LOADING STATES (lines 173-184)                                       |
+---------------------------------------------------------------------+
| * "Loading permissions..."  -> t('loading.permissions')              |
| * "Loading dashboard..."    -> t('loading.dashboard')                |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| AUTH REQUIRED UI (lines 186-225)                                     |
+---------------------------------------------------------------------+
| * "Authentication Required" -> t('auth.required')                    |
| * "Please log in..."        -> t('auth.loginRequired')               |
| * "Go to Home"              -> t('actions.goHome')                   |
| * "Go to Login"             -> t('actions.goLogin')                  |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| HEADER SECTION (lines 227-303)                                       |
+---------------------------------------------------------------------+
| * Title (default prop)      -> t('title')                            |
| * Section indicators        -> t('sections.*')                       |
| * Role badges               -> t('role.*')                           |
| * "Logout"                  -> tAuth('signOut')                      |
| * title="Sign out..."       -> tAuth('signOutDescription')           |
+---------------------------------------------------------------------+


AdminLayout.tsx String Extraction
=====================================================

+---------------------------------------------------------------------+
| getNavigationItems FUNCTION (lines 119-148)                          |
+---------------------------------------------------------------------+
| * 'Dashboard'               -> t('nav.dashboard')                    |
| * 'Items'                   -> t('nav.items')                        |
| * 'Properties'              -> t('nav.properties')                   |
| * 'My Properties'           -> t('nav.myProperties')                 |
| * 'Analytics'               -> t('nav.analytics')                    |
| * 'Access Requests'         -> t('nav.accessRequests')               |
| * 'Back Office'             -> t('nav.backOffice')                   |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| LOADING STATE (lines 157-164)                                        |
+---------------------------------------------------------------------+
| * "Loading admin panel..."  -> t('loading.panel')                    |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| AUTH REQUIRED UI (lines 169-221)                                     |
+---------------------------------------------------------------------+
| * "Authentication Required" -> t('auth.required')                    |
| * "Please log in..."        -> t('auth.loginRequired')               |
| * "Go to Home"              -> t('actions.goHome')                   |
| * "Go to Login"             -> t('actions.goLogin')                  |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| HEADER SECTION (lines 223-260)                                       |
+---------------------------------------------------------------------+
| * "FAQBNB Admin"            -> t('title')                            |
| * Role badge                -> t('role.*')                           |
| * "Logout"                  -> tAuth('signOut')                      |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| NAVIGATION (lines 262-284)                                           |
+---------------------------------------------------------------------+
| * aria-label                -> t('nav.ariaLabel')                    |
+---------------------------------------------------------------------+
```

---

## Appendix B: Navigation Item Structure Reference

After implementation, the navigation items should follow this translated pattern:

```typescript
// RoleBasedNavigation.tsx - Inside getNavigationItems()
const navigationItem: NavigationItem = {
  name: t('nav.dashboard'),           // Full name from translation
  mobileName: t('nav.dashboardShort'), // Abbreviated name for mobile
  href: '/dashboard',                  // Unchanged
  icon: <LayoutDashboard className="h-5 w-5" />, // Unchanged
  description: t('nav.dashboardDescription'), // Tooltip/description
  dashboardSection: DashboardSection.dashboard, // Unchanged
  requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD] // Unchanged
};
```

---

*Document generated for FAQBNB L10N Epic 2 - Task 2B.5*
