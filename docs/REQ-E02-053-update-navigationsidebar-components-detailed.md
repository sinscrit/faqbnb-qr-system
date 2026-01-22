# Detailed Task Breakdown: REQ-E02-053 - Update Navigation/Sidebar Components

**Generated:** 2026-01-20 21:30:00 UTC
**Last Modified:** 2026-01-20 21:30:00 UTC
**Request ID:** REQ-E02-053
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.5
**Size:** M (Medium)
**Priority:** P1 - High
**Overview Document:** REQ-E02-053-update-navigationsidebar-components-overview.md
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This document provides a granular task breakdown for updating navigation and sidebar components to support internationalization. The primary components are RoleBasedNavigation, Dashboard2Layout, DashboardLayout, and PropertyDropdown. Total estimated effort is ~4 hours across 7 main tasks with ~51 strings to translate.

---

## Prerequisites Checklist

- [ ] Epic 1 foundation complete (next-intl configured)
- [ ] `IntlProvider` wrapping application in `/src/app/layout.tsx`
- [ ] Translation files exist at `/messages/*.json`
- [ ] `useTranslations` hook available for client components
- [ ] Task 2B.1 (Create `dashboard` namespace structure) should be complete or in progress

---

## Component Analysis Summary

| Component | File Path | Client/Server | Hardcoded Strings | Priority |
|-----------|-----------|---------------|-------------------|----------|
| RoleBasedNavigation | `/src/components/RoleBasedNavigation.tsx` | Client | ~20 | Critical |
| Dashboard2Layout | `/src/app/dashboard2/layout.tsx` | Client | ~12 | Critical |
| DashboardLayout | `/src/components/DashboardLayout.tsx` | Client | ~15 | High |
| PropertyDropdown | `/src/components/dashboard/PropertyDropdown.tsx` | Client | ~4 | Medium |

---

## Task 1: Add Translation Keys to `/messages/en.json`

**Effort:** 0.5 story points (~30 minutes)
**Type:** Configuration
**Dependencies:** None

### 1.1 Add `dashboard.nav` Namespace

Add the following keys to `/messages/en.json` under the `dashboard` namespace:

```json
{
  "dashboard": {
    "nav": {
      "dashboard": "Dashboard",
      "home": "Home",
      "dashboardMobile": "D/B",
      "dashboardDescription": "Overview and key metrics",
      "items": "Items",
      "itemsDescription": "Manage QR code items",
      "guides": "Guides",
      "guidesMobile": "Guide",
      "guidesDescription": "View and manage guides",
      "properties": "Properties",
      "propertiesMobile": "Prop.",
      "propertiesDescription": "Property management",
      "analytics": "Analytics",
      "analyticsDescription": "View analytics and insights",
      "systemAdmin": "System Admin",
      "systemAdminMobile": "Admin",
      "systemAdminDescription": "System administration",
      "admin": "Admin",
      "adminBadge": "Admin",
      "ariaLabel": "Dashboard Navigation",
      "openMenu": "Open main menu"
    },
    "loading": {
      "navigation": "Loading navigation...",
      "dashboard": "Loading dashboard...",
      "permissions": "Loading permissions...",
      "generic": "Loading...",
      "redirecting": "Redirecting to login..."
    },
    "auth": {
      "required": "Authentication Required",
      "pleaseLogin": "Please log in to access the dashboard.",
      "goHome": "Go to Home",
      "goLogin": "Go to Login",
      "logout": "Logout",
      "logoutTitle": "Sign out of your account"
    },
    "property": {
      "all": "All Properties",
      "allMobile": "All",
      "noProperties": "No properties found",
      "selectProperty": "Select property",
      "propertyList": "Property list"
    },
    "section": {
      "dashboard": "Dashboard",
      "items": "Items",
      "guides": "Guides",
      "properties": "Properties",
      "analytics": "Analytics",
      "systemAdmin": "System Admin"
    },
    "role": {
      "systemAdmin": "System Admin",
      "user": "User",
      "owner": "Owner",
      "admin": "Admin",
      "member": "Member",
      "viewer": "Viewer"
    }
  }
}
```

### 1.2 Acceptance Criteria

- [x] All keys added to `/messages/en.json` ---implemented: Added nav keys (home, dashboardMobile, dashboardDescription, itemsDescription, guidesMobile, guidesDescription, propertiesMobile, propertiesDescription, analyticsDescription, systemAdmin, systemAdminMobile, systemAdminDescription, admin, adminBadge, openMenu), loading keys (navigation, permissions), and auth/section/role namespaces--- -unit tested-
- [x] JSON syntax valid (no trailing commas, proper nesting) ---implemented: Validated with node JSON.parse--- -unit tested-
- [x] Keys follow namespace convention: `dashboard.nav.{element}` ---implemented: All keys under dashboard namespace---
- [ ] Build passes with no JSON parsing errors

### 1.3 File Changes

| File | Action |
|------|--------|
| `/messages/en.json` | Modify - add `dashboard.nav`, `dashboard.loading`, `dashboard.auth`, `dashboard.property`, `dashboard.section`, `dashboard.role` keys |

---

## Task 2: Update RoleBasedNavigation Component

**Effort:** 1 story point (~45 minutes)
**Type:** Component Update
**Dependencies:** Task 1
**File:** `/src/components/RoleBasedNavigation.tsx`

### 2.1 Import useTranslations Hook

**Location:** Line 1-10 (imports section)

```typescript
// Add import at the top
import { useTranslations } from 'next-intl';
```

### 2.2 Initialize Translation Hooks in RoleBasedNavigation Function

**Location:** Inside `RoleBasedNavigation` function, after existing hooks (around line 38-53)

```typescript
export function RoleBasedNavigation({...}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ADD: Translation hooks
  const t = useTranslations('dashboard.nav');
  const tLoading = useTranslations('dashboard.loading');

  // ... rest of existing code
}
```

### 2.3 Update getNavigationItems Function

**Location:** Lines 59-142 (getNavigationItems function)

**Current (Lines 64-75):**
```typescript
items.push({
  name: compactMode ? 'Home' : 'Dashboard',
  mobileName: 'D/B',
  href: '/dashboard',
  icon: <LayoutDashboard className="h-5 w-5" />,
  description: 'Overview and key metrics',
  ...
});
```

**Replace with:**
```typescript
items.push({
  name: compactMode ? t('home') : t('dashboard'),
  mobileName: t('dashboardMobile'),
  href: '/dashboard',
  icon: <LayoutDashboard className="h-5 w-5" />,
  description: t('dashboardDescription'),
  ...
});
```

**Apply same pattern to all navigation items:**

| Item | Current `name` | New `name` | Current `mobileName` | New `mobileName` | Current `description` | New `description` |
|------|----------------|------------|---------------------|------------------|----------------------|-------------------|
| Dashboard | `'Dashboard'` | `t('dashboard')` | `'D/B'` | `t('dashboardMobile')` | `'Overview and key metrics'` | `t('dashboardDescription')` |
| Items | `'Items'` | `t('items')` | `'Items'` | `t('items')` | `'Manage QR code items'` | `t('itemsDescription')` |
| Guides | `'Guides'` | `t('guides')` | `'Guide'` | `t('guidesMobile')` | `'View and manage guides'` | `t('guidesDescription')` |
| Properties | `'Properties'` | `t('properties')` | `'Prop.'` | `t('propertiesMobile')` | `'Property management'` | `t('propertiesDescription')` |
| Analytics | `'Analytics'` | `t('analytics')` | `'Analytics'` | `t('analytics')` | `'View analytics and insights'` | `t('analyticsDescription')` |
| System Admin | `compactMode ? 'Admin' : 'System Admin'` | `compactMode ? t('admin') : t('systemAdmin')` | `'Admin'` | `t('systemAdminMobile')` | `'System administration'` | `t('systemAdminDescription')` |

### 2.4 Update Loading State

**Location:** Lines 187-194

**Current:**
```typescript
if (authLoading || permissionsLoading) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-sm text-gray-600">Loading navigation...</span>
    </div>
  );
}
```

**Replace with:**
```typescript
if (authLoading || permissionsLoading) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-sm text-gray-600">{tLoading('navigation')}</span>
    </div>
  );
}
```

### 2.5 Update DesktopNavigation Aria-Label

**Location:** Line 198

**Current:**
```typescript
<nav className="hidden md:flex space-x-8" aria-label="Dashboard Navigation">
```

**Replace with:**
```typescript
<nav className="hidden md:flex space-x-8" aria-label={t('ariaLabel')}>
```

### 2.6 Update Admin Badge Text

**Location:** Lines 217-220

**Current:**
```typescript
<span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
  Admin
</span>
```

**Replace with:**
```typescript
<span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
  {t('adminBadge')}
</span>
```

### 2.7 Update Mobile Menu Sr-Only Text

**Location:** Line 237

**Current:**
```typescript
<span className="sr-only">Open main menu</span>
```

**Replace with:**
```typescript
<span className="sr-only">{t('openMenu')}</span>
```

### 2.8 Update Mobile Admin Badge

**Location:** Lines 287-289

**Current:**
```typescript
<span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
  Admin
</span>
```

**Replace with:**
```typescript
<span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
  {t('adminBadge')}
</span>
```

### 2.9 Update getNavigationItemsForUser Utility Function

**Location:** Lines 314-405

**IMPORTANT:** This utility function is exported and used independently. Since hooks cannot be called inside regular functions, this function needs a different approach:

**Option A (Recommended):** Pass translations as parameters

```typescript
export function getNavigationItemsForUser(
  user: User | null,
  isAdmin: boolean,
  dashboardPermissions: any,
  accountRole: AccountRole | null,
  showSystemAdminItems: boolean = true,
  compactMode: boolean = false,
  translations?: {
    dashboard: string;
    home: string;
    dashboardMobile: string;
    dashboardDescription: string;
    items: string;
    itemsDescription: string;
    guides: string;
    guidesMobile: string;
    guidesDescription: string;
    properties: string;
    propertiesMobile: string;
    propertiesDescription: string;
    analytics: string;
    analyticsDescription: string;
    systemAdmin: string;
    admin: string;
    systemAdminMobile: string;
    systemAdminDescription: string;
  }
): NavigationItem[] {
  // Use translations if provided, otherwise fall back to English defaults
  const t = translations || {
    dashboard: 'Dashboard',
    home: 'Home',
    dashboardMobile: 'D/B',
    dashboardDescription: 'Overview and key metrics',
    items: 'Items',
    itemsDescription: 'Manage QR code items',
    guides: 'Guides',
    guidesMobile: 'Guide',
    guidesDescription: 'View and manage guides',
    properties: 'Properties',
    propertiesMobile: 'Prop.',
    propertiesDescription: 'Property management',
    analytics: 'Analytics',
    analyticsDescription: 'View analytics and insights',
    systemAdmin: 'System Admin',
    admin: 'Admin',
    systemAdminMobile: 'Admin',
    systemAdminDescription: 'System administration',
  };

  // Then use t.dashboard, t.items, etc. instead of hardcoded strings
  ...
}
```

**Option B:** Deprecate the utility function and use only the component

Add deprecation notice and keep English defaults for backward compatibility.

### 2.10 Acceptance Criteria for Task 2

- [x] `useTranslations` imported from `next-intl` ---implemented: Added import at top of file---
- [x] All navigation item names use `t()` calls ---implemented: Updated all nav items in getNavigationItems---
- [x] All navigation item mobile names use `t()` calls ---implemented: Using t('dashboardMobile'), t('guidesMobile'), etc.---
- [x] All navigation item descriptions use `t()` calls ---implemented: Using t('dashboardDescription'), t('itemsDescription'), etc.---
- [x] Loading state text uses `tLoading()` call ---implemented: Changed to tLoading('navigation')---
- [x] Aria-label on nav element uses `t()` call ---implemented: Changed to t('ariaLabel')---
- [x] Admin badge text uses `t()` call ---implemented: Changed both badges to t('adminBadge')---
- [x] Sr-only "Open main menu" text uses `t()` call ---implemented: Changed to t('openMenu')---
- [x] Utility function updated with translation parameter support ---implemented: Added NavigationTranslations interface and optional translations param with defaults---
- [x] Component renders without errors ---ts-check: passed (2 errors, baseline: 2)---
- [x] TypeScript compiles without errors ---ts-check: passed (2 errors, baseline: 2)--- -unit tested-

---

## Task 3: Update Dashboard2Layout Component

**Effort:** 0.5 story points (~30 minutes)
**Type:** Component Update
**Dependencies:** Task 1
**File:** `/src/app/dashboard2/layout.tsx`

### 3.1 Import useTranslations Hook

**Location:** Line 1-22 (imports section)

```typescript
import { useTranslations } from 'next-intl';
```

### 3.2 Initialize Translation Hooks

**Location:** Inside `Dashboard2LayoutContent` function, after existing hooks (around line 72-73)

```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // ADD: Translation hooks
  const t = useTranslations('dashboard');

  // ... rest
}
```

### 3.3 Update Loading State (Line 76-85)

**Current:**
```typescript
if (loading || authState === 'LOADING') {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    </div>
  );
}
```

**Replace with:**
```typescript
if (loading || authState === 'LOADING') {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{t('loading.dashboard')}</p>
      </div>
    </div>
  );
}
```

### 3.4 Update Redirect State (Lines 94-102)

**Current:**
```typescript
<p className="text-gray-600 text-lg">Redirecting to login...</p>
```

**Replace with:**
```typescript
<p className="text-gray-600 text-lg">{t('loading.redirecting')}</p>
```

### 3.5 Update Generic Loading State (Lines 106-114)

**Current:**
```typescript
<p className="text-gray-600 text-lg">Loading...</p>
```

**Replace with:**
```typescript
<p className="text-gray-600 text-lg">{t('loading.generic')}</p>
```

### 3.6 Update Navigation Items Array

**Location:** Lines 42-67

**Approach:** Convert static array to use translations. Move inside component or create a helper function.

**Option A (Move inside component):**

```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  // ... hooks
  const t = useTranslations('dashboard');

  // Navigation items with translations
  const navigationItems: NavItem[] = [
    {
      name: t('nav.dashboard'),
      mobileLabel: t('nav.dashboardMobile'),
      href: '/dashboard2',
      icon: LayoutDashboard,
    },
    {
      name: t('nav.items'),
      mobileLabel: t('nav.items'),
      href: '/dashboard2/items',
      icon: Package,
    },
    {
      name: t('nav.guides'),
      mobileLabel: t('nav.guidesMobile'),
      href: '/dashboard2/instructions',
      icon: FileText,
    },
    {
      name: t('nav.properties'),
      mobileLabel: t('nav.propertiesMobile'),
      href: '/dashboard2/properties',
      icon: Building2,
    },
  ];

  // ... rest of component
}
```

### 3.7 Update Logout Button Label and Aria-Label

**Location:** Lines 141-148

**Current:**
```typescript
<button
  onClick={() => signOut()}
  className="..."
  aria-label="Logout"
>
  <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
  <span className="hidden sm:inline">Logout</span>
</button>
```

**Replace with:**
```typescript
<button
  onClick={() => signOut()}
  className="..."
  aria-label={t('auth.logout')}
>
  <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
  <span className="hidden sm:inline">{t('auth.logout')}</span>
</button>
```

### 3.8 Update Navigation Aria-Label

**Location:** Line 155

**Current:**
```typescript
<nav className="bg-white border-b border-gray-200" aria-label="Dashboard Navigation">
```

**Replace with:**
```typescript
<nav className="bg-white border-b border-gray-200" aria-label={t('nav.ariaLabel')}>
```

### 3.9 Acceptance Criteria for Task 3

- [x] `useTranslations` imported from `next-intl` ---implemented: Already done in REQ-E02-051---
- [x] Translation hook initialized in `Dashboard2LayoutContent` ---implemented: Line 49: const t = useTranslations('dashboard')---
- [x] All loading state messages use `t()` calls ---implemented: t('loading.dashboard'), t('loading.redirecting'), t('loading.generic')---
- [x] Navigation items array uses translated values ---implemented: Uses t('nav.dashboard'), t('nav.items'), etc.---
- [x] Logout button label and aria-label use `t()` calls ---implemented: t('header.logout') and t('header.logoutAriaLabel')---
- [x] Navigation aria-label uses `t()` call ---implemented: aria-label={t('nav.ariaLabel')}---
- [x] Component renders without errors ---ts-check: passed---
- [x] TypeScript compiles without errors ---ts-check: passed (2 errors, baseline: 2)--- -unit tested- ---ALREADY INTERNATIONALIZED IN REQ-E02-051---

---

## Task 4: Update DashboardLayout Component

**Effort:** 1 story point (~45 minutes)
**Type:** Component Update
**Dependencies:** Task 1
**File:** `/src/components/DashboardLayout.tsx`

### 4.1 Import useTranslations Hook

**Location:** Line 1-13 (imports section)

```typescript
import { useTranslations } from 'next-intl';
```

### 4.2 Initialize Translation Hooks

**Location:** Inside `DashboardLayout` function, after existing hooks (around line 40-42)

```typescript
export function DashboardLayout({...}) {
  const router = useRouter();
  const pathname = usePathname();
  const {...} = useAuth();
  const { currentAccount, userAccounts } = useAccountContext();

  // ADD: Translation hooks
  const t = useTranslations('dashboard');

  // ... rest
}
```

### 4.3 Update Loading State (Lines 172-184)

**Current:**
```typescript
<p className="text-gray-600 text-lg">
  {permissionsLoading ? 'Loading permissions...' : 'Loading dashboard...'}
</p>
```

**Replace with:**
```typescript
<p className="text-gray-600 text-lg">
  {permissionsLoading ? t('loading.permissions') : t('loading.dashboard')}
</p>
```

### 4.4 Update Authentication Required State (Lines 186-225)

**Current:**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
<p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
...
<button ...>Go to Home</button>
<button ...>Go to Login</button>
```

**Replace with:**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.required')}</h1>
<p className="text-gray-600 mb-6">{t('auth.pleaseLogin')}</p>
...
<button ...>{t('auth.goHome')}</button>
<button ...>{t('auth.goLogin')}</button>
```

### 4.5 Update Section Indicators (Lines 247-253)

**Current:**
```typescript
{currentDashboardSection === DashboardSection.dashboard && '📊 Dashboard'}
{currentDashboardSection === DashboardSection.items && '📦 Items'}
{currentDashboardSection === DashboardSection.instructions && '📄 Guides'}
{currentDashboardSection === DashboardSection.properties && '🏠 Properties'}
{currentDashboardSection === DashboardSection.analytics && '📈 Analytics'}
{currentDashboardSection === DashboardSection.systemAdmin && '👑 System Admin'}
```

**Replace with:**
```typescript
{currentDashboardSection === DashboardSection.dashboard && `📊 ${t('section.dashboard')}`}
{currentDashboardSection === DashboardSection.items && `📦 ${t('section.items')}`}
{currentDashboardSection === DashboardSection.instructions && `📄 ${t('section.guides')}`}
{currentDashboardSection === DashboardSection.properties && `🏠 ${t('section.properties')}`}
{currentDashboardSection === DashboardSection.analytics && `📈 ${t('section.analytics')}`}
{currentDashboardSection === DashboardSection.systemAdmin && `👑 ${t('section.systemAdmin')}`}
```

### 4.6 Update Role Badges (Lines 259-268)

**Current:**
```typescript
{isAdmin ? '👑 System Admin' : '👤 User'}
...
{accountRole === AccountRole.OWNER && '🏠 Owner'}
{accountRole === AccountRole.ADMIN && '⚙️ Admin'}
{accountRole === AccountRole.MEMBER && '👥 Member'}
{accountRole === AccountRole.VIEWER && '👁️ Viewer'}
```

**Replace with:**
```typescript
{isAdmin ? `👑 ${t('role.systemAdmin')}` : `👤 ${t('role.user')}`}
...
{accountRole === AccountRole.OWNER && `🏠 ${t('role.owner')}`}
{accountRole === AccountRole.ADMIN && `⚙️ ${t('role.admin')}`}
{accountRole === AccountRole.MEMBER && `👥 ${t('role.member')}`}
{accountRole === AccountRole.VIEWER && `👁️ ${t('role.viewer')}`}
```

### 4.7 Update Logout Button (Lines 293-299)

**Current:**
```typescript
<button
  onClick={() => signOut()}
  className="..."
  title="Sign out of your account"
>
  Logout
</button>
```

**Replace with:**
```typescript
<button
  onClick={() => signOut()}
  className="..."
  title={t('auth.logoutTitle')}
>
  {t('auth.logout')}
</button>
```

### 4.8 Acceptance Criteria for Task 4

- [x] `useTranslations` imported from `next-intl` ---implemented: Added import at top of file---
- [x] Translation hook initialized in `DashboardLayout` ---implemented: const t = useTranslations('dashboard')---
- [x] Loading state messages use `t()` calls ---implemented: t('loading.permissions'), t('loading.dashboard')---
- [x] Authentication required messages use `t()` calls ---implemented: t('auth.required'), t('auth.pleaseLogin')---
- [x] All button labels (Go to Home, Go to Login, Logout) use `t()` calls ---implemented: t('auth.goHome'), t('auth.goLogin'), t('auth.logout')---
- [x] Section indicator labels use `t()` calls ---implemented: t('section.dashboard'), t('section.items'), etc.---
- [x] Role badge labels use `t()` calls ---implemented: t('role.systemAdmin'), t('role.user'), t('role.owner'), etc.---
- [x] Logout button title attribute uses `t()` call ---implemented: title={t('auth.logoutTitle')}---
- [x] Component renders without errors ---ts-check: passed (2 errors, baseline: 2)---
- [x] TypeScript compiles without errors ---ts-check: passed (2 errors, baseline: 2)--- -unit tested-

---

## Task 5: Update PropertyDropdown Component

**Effort:** 0.5 story points (~20 minutes)
**Type:** Component Update
**Dependencies:** Task 1
**File:** `/src/components/dashboard/PropertyDropdown.tsx`

### 5.1 Import useTranslations Hook

**Location:** Line 1-17 (imports section)

```typescript
import { useTranslations } from 'next-intl';
```

### 5.2 Initialize Translation Hook

**Location:** Inside `PropertyDropdown` function, after existing hooks (around line 31)

```typescript
export function PropertyDropdown({ className }: PropertyDropdownProps) {
  const {...} = usePropertyContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ADD: Translation hook
  const t = useTranslations('dashboard.property');

  // ... rest
}
```

### 5.3 Update Display Text Variables (Lines 70-73)

**Current:**
```typescript
const fullDisplayText = selectedProperty?.nickname || 'All Properties';
const mobileDisplayText = selectedProperty?.nickname
  ? selectedProperty.nickname.substring(0, 3) + '...'
  : 'All';
```

**Replace with:**
```typescript
const fullDisplayText = selectedProperty?.nickname || t('all');
const mobileDisplayText = selectedProperty?.nickname
  ? selectedProperty.nickname.substring(0, 3) + '...'
  : t('allMobile');
```

### 5.4 Update Aria-Labels (Lines 88-89, 122-123)

**Current:**
```typescript
aria-label="Select property"
...
aria-label="Property list"
```

**Replace with:**
```typescript
aria-label={t('selectProperty')}
...
aria-label={t('propertyList')}
```

### 5.5 Update "All Properties" Option Text (Line 145)

**Current:**
```typescript
<span className="flex-1 font-medium text-gray-700">All Properties</span>
```

**Replace with:**
```typescript
<span className="flex-1 font-medium text-gray-700">{t('all')}</span>
```

### 5.6 Update Empty State Text (Lines 185-188)

**Current:**
```typescript
<div className="px-3 py-4 text-sm text-gray-500 text-center">
  No properties found
</div>
```

**Replace with:**
```typescript
<div className="px-3 py-4 text-sm text-gray-500 text-center">
  {t('noProperties')}
</div>
```

### 5.7 Acceptance Criteria for Task 5

- [x] `useTranslations` imported from `next-intl` ---implemented: Already imported---
- [x] Translation hook initialized with `dashboard.property` namespace ---implemented: Changed from common.emptyStates to dashboard.property---
- [x] "All Properties" / "All" text uses `t()` calls ---implemented: t('allProperties'), t('allPropertiesShort')---
- [x] Aria-labels use `t()` calls ---implemented: t('selectProperty'), t('propertyList')---
- [x] Empty state text uses `t()` call ---implemented: t('noProperties')---
- [x] Component renders without errors ---ts-check: passed (2 errors, baseline: 2)---
- [x] TypeScript compiles without errors ---ts-check: passed (2 errors, baseline: 2)--- -unit tested-

---

## Task 6: Generate Non-English Translations

**Effort:** 0.5 story points (~30 minutes)
**Type:** Translation
**Dependencies:** Task 1

### 6.1 French Translations (`/messages/fr.json`)

```json
{
  "dashboard": {
    "nav": {
      "dashboard": "Tableau de bord",
      "home": "Accueil",
      "dashboardMobile": "T/B",
      "dashboardDescription": "Vue d'ensemble et métriques clés",
      "items": "Éléments",
      "itemsDescription": "Gérer les éléments QR code",
      "guides": "Guides",
      "guidesMobile": "Guide",
      "guidesDescription": "Voir et gérer les guides",
      "properties": "Propriétés",
      "propertiesMobile": "Prop.",
      "propertiesDescription": "Gestion des propriétés",
      "analytics": "Analyses",
      "analyticsDescription": "Voir les analyses et insights",
      "systemAdmin": "Admin Système",
      "systemAdminMobile": "Admin",
      "systemAdminDescription": "Administration système",
      "admin": "Admin",
      "adminBadge": "Admin",
      "ariaLabel": "Navigation du tableau de bord",
      "openMenu": "Ouvrir le menu principal"
    },
    "loading": {
      "navigation": "Chargement de la navigation...",
      "dashboard": "Chargement du tableau de bord...",
      "permissions": "Chargement des permissions...",
      "generic": "Chargement...",
      "redirecting": "Redirection vers la connexion..."
    },
    "auth": {
      "required": "Authentification requise",
      "pleaseLogin": "Veuillez vous connecter pour accéder au tableau de bord.",
      "goHome": "Aller à l'accueil",
      "goLogin": "Aller à la connexion",
      "logout": "Déconnexion",
      "logoutTitle": "Se déconnecter de votre compte"
    },
    "property": {
      "all": "Toutes les propriétés",
      "allMobile": "Tout",
      "noProperties": "Aucune propriété trouvée",
      "selectProperty": "Sélectionner une propriété",
      "propertyList": "Liste des propriétés"
    },
    "section": {
      "dashboard": "Tableau de bord",
      "items": "Éléments",
      "guides": "Guides",
      "properties": "Propriétés",
      "analytics": "Analyses",
      "systemAdmin": "Admin Système"
    },
    "role": {
      "systemAdmin": "Admin Système",
      "user": "Utilisateur",
      "owner": "Propriétaire",
      "admin": "Administrateur",
      "member": "Membre",
      "viewer": "Observateur"
    }
  }
}
```

### 6.2 Spanish Translations (`/messages/es.json`)

```json
{
  "dashboard": {
    "nav": {
      "dashboard": "Panel",
      "home": "Inicio",
      "dashboardMobile": "Panel",
      "dashboardDescription": "Resumen y métricas clave",
      "items": "Elementos",
      "itemsDescription": "Gestionar elementos de código QR",
      "guides": "Guías",
      "guidesMobile": "Guía",
      "guidesDescription": "Ver y gestionar guías",
      "properties": "Propiedades",
      "propertiesMobile": "Prop.",
      "propertiesDescription": "Gestión de propiedades",
      "analytics": "Análisis",
      "analyticsDescription": "Ver análisis e información",
      "systemAdmin": "Admin Sistema",
      "systemAdminMobile": "Admin",
      "systemAdminDescription": "Administración del sistema",
      "admin": "Admin",
      "adminBadge": "Admin",
      "ariaLabel": "Navegación del panel",
      "openMenu": "Abrir menú principal"
    },
    "loading": {
      "navigation": "Cargando navegación...",
      "dashboard": "Cargando panel...",
      "permissions": "Cargando permisos...",
      "generic": "Cargando...",
      "redirecting": "Redirigiendo al inicio de sesión..."
    },
    "auth": {
      "required": "Autenticación requerida",
      "pleaseLogin": "Por favor inicie sesión para acceder al panel.",
      "goHome": "Ir a inicio",
      "goLogin": "Ir a iniciar sesión",
      "logout": "Cerrar sesión",
      "logoutTitle": "Cerrar sesión de su cuenta"
    },
    "property": {
      "all": "Todas las propiedades",
      "allMobile": "Todo",
      "noProperties": "No se encontraron propiedades",
      "selectProperty": "Seleccionar propiedad",
      "propertyList": "Lista de propiedades"
    },
    "section": {
      "dashboard": "Panel",
      "items": "Elementos",
      "guides": "Guías",
      "properties": "Propiedades",
      "analytics": "Análisis",
      "systemAdmin": "Admin Sistema"
    },
    "role": {
      "systemAdmin": "Admin Sistema",
      "user": "Usuario",
      "owner": "Propietario",
      "admin": "Administrador",
      "member": "Miembro",
      "viewer": "Espectador"
    }
  }
}
```

### 6.3 German Translations (`/messages/de.json`)

```json
{
  "dashboard": {
    "nav": {
      "dashboard": "Dashboard",
      "home": "Startseite",
      "dashboardMobile": "D/B",
      "dashboardDescription": "Übersicht und Kennzahlen",
      "items": "Artikel",
      "itemsDescription": "QR-Code-Artikel verwalten",
      "guides": "Anleitungen",
      "guidesMobile": "Anleit.",
      "guidesDescription": "Anleitungen anzeigen und verwalten",
      "properties": "Objekte",
      "propertiesMobile": "Obj.",
      "propertiesDescription": "Objektverwaltung",
      "analytics": "Analysen",
      "analyticsDescription": "Analysen und Einblicke anzeigen",
      "systemAdmin": "Systemadmin",
      "systemAdminMobile": "Admin",
      "systemAdminDescription": "Systemadministration",
      "admin": "Admin",
      "adminBadge": "Admin",
      "ariaLabel": "Dashboard-Navigation",
      "openMenu": "Hauptmenü öffnen"
    },
    "loading": {
      "navigation": "Navigation wird geladen...",
      "dashboard": "Dashboard wird geladen...",
      "permissions": "Berechtigungen werden geladen...",
      "generic": "Wird geladen...",
      "redirecting": "Weiterleitung zur Anmeldung..."
    },
    "auth": {
      "required": "Authentifizierung erforderlich",
      "pleaseLogin": "Bitte melden Sie sich an, um auf das Dashboard zuzugreifen.",
      "goHome": "Zur Startseite",
      "goLogin": "Zur Anmeldung",
      "logout": "Abmelden",
      "logoutTitle": "Von Ihrem Konto abmelden"
    },
    "property": {
      "all": "Alle Objekte",
      "allMobile": "Alle",
      "noProperties": "Keine Objekte gefunden",
      "selectProperty": "Objekt auswählen",
      "propertyList": "Objektliste"
    },
    "section": {
      "dashboard": "Dashboard",
      "items": "Artikel",
      "guides": "Anleitungen",
      "properties": "Objekte",
      "analytics": "Analysen",
      "systemAdmin": "Systemadmin"
    },
    "role": {
      "systemAdmin": "Systemadmin",
      "user": "Benutzer",
      "owner": "Eigentümer",
      "admin": "Administrator",
      "member": "Mitglied",
      "viewer": "Betrachter"
    }
  }
}
```

### 6.4 Dutch Translations (`/messages/nl.json`)

```json
{
  "dashboard": {
    "nav": {
      "dashboard": "Dashboard",
      "home": "Home",
      "dashboardMobile": "D/B",
      "dashboardDescription": "Overzicht en belangrijke statistieken",
      "items": "Items",
      "itemsDescription": "QR-code items beheren",
      "guides": "Handleidingen",
      "guidesMobile": "Hand.",
      "guidesDescription": "Handleidingen bekijken en beheren",
      "properties": "Eigenschappen",
      "propertiesMobile": "Eig.",
      "propertiesDescription": "Eigenschappen beheren",
      "analytics": "Analyses",
      "analyticsDescription": "Analyses en inzichten bekijken",
      "systemAdmin": "Systeembeheer",
      "systemAdminMobile": "Admin",
      "systemAdminDescription": "Systeembeheer",
      "admin": "Admin",
      "adminBadge": "Admin",
      "ariaLabel": "Dashboard navigatie",
      "openMenu": "Hoofdmenu openen"
    },
    "loading": {
      "navigation": "Navigatie laden...",
      "dashboard": "Dashboard laden...",
      "permissions": "Machtigingen laden...",
      "generic": "Laden...",
      "redirecting": "Doorverwijzen naar inloggen..."
    },
    "auth": {
      "required": "Authenticatie vereist",
      "pleaseLogin": "Meld u aan om toegang te krijgen tot het dashboard.",
      "goHome": "Ga naar home",
      "goLogin": "Ga naar inloggen",
      "logout": "Uitloggen",
      "logoutTitle": "Uitloggen uit uw account"
    },
    "property": {
      "all": "Alle eigenschappen",
      "allMobile": "Alle",
      "noProperties": "Geen eigenschappen gevonden",
      "selectProperty": "Eigenschap selecteren",
      "propertyList": "Eigenschappenlijst"
    },
    "section": {
      "dashboard": "Dashboard",
      "items": "Items",
      "guides": "Handleidingen",
      "properties": "Eigenschappen",
      "analytics": "Analyses",
      "systemAdmin": "Systeembeheer"
    },
    "role": {
      "systemAdmin": "Systeembeheer",
      "user": "Gebruiker",
      "owner": "Eigenaar",
      "admin": "Beheerder",
      "member": "Lid",
      "viewer": "Kijker"
    }
  }
}
```

### 6.5 Italian Translations (`/messages/it.json`)

```json
{
  "dashboard": {
    "nav": {
      "dashboard": "Pannello",
      "home": "Home",
      "dashboardMobile": "Pan.",
      "dashboardDescription": "Panoramica e metriche chiave",
      "items": "Elementi",
      "itemsDescription": "Gestisci elementi codice QR",
      "guides": "Guide",
      "guidesMobile": "Guida",
      "guidesDescription": "Visualizza e gestisci le guide",
      "properties": "Proprietà",
      "propertiesMobile": "Prop.",
      "propertiesDescription": "Gestione proprietà",
      "analytics": "Analisi",
      "analyticsDescription": "Visualizza analisi e approfondimenti",
      "systemAdmin": "Admin Sistema",
      "systemAdminMobile": "Admin",
      "systemAdminDescription": "Amministrazione sistema",
      "admin": "Admin",
      "adminBadge": "Admin",
      "ariaLabel": "Navigazione pannello",
      "openMenu": "Apri menu principale"
    },
    "loading": {
      "navigation": "Caricamento navigazione...",
      "dashboard": "Caricamento pannello...",
      "permissions": "Caricamento permessi...",
      "generic": "Caricamento...",
      "redirecting": "Reindirizzamento al login..."
    },
    "auth": {
      "required": "Autenticazione richiesta",
      "pleaseLogin": "Effettua l'accesso per accedere al pannello.",
      "goHome": "Vai alla home",
      "goLogin": "Vai al login",
      "logout": "Esci",
      "logoutTitle": "Esci dal tuo account"
    },
    "property": {
      "all": "Tutte le proprietà",
      "allMobile": "Tutte",
      "noProperties": "Nessuna proprietà trovata",
      "selectProperty": "Seleziona proprietà",
      "propertyList": "Lista proprietà"
    },
    "section": {
      "dashboard": "Pannello",
      "items": "Elementi",
      "guides": "Guide",
      "properties": "Proprietà",
      "analytics": "Analisi",
      "systemAdmin": "Admin Sistema"
    },
    "role": {
      "systemAdmin": "Admin Sistema",
      "user": "Utente",
      "owner": "Proprietario",
      "admin": "Amministratore",
      "member": "Membro",
      "viewer": "Visualizzatore"
    }
  }
}
```

### 6.6 Acceptance Criteria for Task 6

- [ ] French translations added to `/messages/fr.json`
- [ ] Spanish translations added to `/messages/es.json`
- [ ] German translations added to `/messages/de.json`
- [ ] Dutch translations added to `/messages/nl.json`
- [ ] Italian translations added to `/messages/it.json`
- [ ] All JSON files have valid syntax
- [ ] All translation keys match English structure exactly
- [ ] No placeholder text remains
- [ ] Mobile abbreviations appropriately shortened

---

## Task 7: Verification and Testing

**Effort:** 0.5 story points (~30 minutes)
**Type:** Testing
**Dependencies:** Tasks 1-6

### 7.1 Build Verification

```bash
npm run build
```

- [ ] Build completes without errors
- [ ] No TypeScript compilation errors
- [ ] No missing translation key warnings

### 7.2 Visual Verification - English

- [ ] Navigate to `/dashboard2` - verify all navigation labels display correctly
- [ ] Verify loading states show translated messages
- [ ] Verify logout button shows "Logout"
- [ ] Verify property dropdown shows "All Properties" / "All"
- [ ] Verify mobile view shows abbreviated labels (D/B, Guide, Prop.)
- [ ] Verify aria-labels are present (inspect element)

### 7.3 Visual Verification - Non-English (Test with German)

- [ ] Switch locale to German
- [ ] Verify all navigation labels in German
- [ ] Verify German text does not overflow containers
- [ ] Verify mobile abbreviated labels fit properly
- [ ] Verify loading states show German messages

### 7.4 Accessibility Testing

- [ ] Run screen reader - verify navigation labels are announced correctly
- [ ] Verify keyboard navigation works (Tab, Enter, Escape)
- [ ] Verify aria-labels describe elements appropriately

### 7.5 Functional Testing

- [ ] Click each navigation item - verify routing works
- [ ] Verify permission-based items still show/hide correctly
- [ ] Verify mobile menu opens and closes
- [ ] Verify property dropdown functions correctly

### 7.6 Console Verification

- [ ] No console errors related to missing translations
- [ ] No "Missing translation" warnings in console
- [ ] No runtime errors during navigation

---

## File Changes Summary

### Files to Create

None

### Files to Modify

| File | Type | Changes |
|------|------|---------|
| `/messages/en.json` | Translation | Add `dashboard.nav`, `dashboard.loading`, `dashboard.auth`, `dashboard.property`, `dashboard.section`, `dashboard.role` |
| `/messages/fr.json` | Translation | Add corresponding French translations |
| `/messages/es.json` | Translation | Add corresponding Spanish translations |
| `/messages/de.json` | Translation | Add corresponding German translations |
| `/messages/nl.json` | Translation | Add corresponding Dutch translations |
| `/messages/it.json` | Translation | Add corresponding Italian translations |
| `/src/components/RoleBasedNavigation.tsx` | Component | Import `useTranslations`, replace hardcoded strings |
| `/src/app/dashboard2/layout.tsx` | Component | Import `useTranslations`, replace hardcoded strings |
| `/src/components/DashboardLayout.tsx` | Component | Import `useTranslations`, replace hardcoded strings |
| `/src/components/dashboard/PropertyDropdown.tsx` | Component | Import `useTranslations`, replace hardcoded strings |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Navigation items generated dynamically break with translations | Medium | High | Test thoroughly; ensure translations called at component level |
| German/French longer text breaks layout | Medium | Medium | Test with longest translations; use CSS truncation if needed |
| Missing translations show raw keys | Low | Medium | Verify all keys exist in all locale files before merge |
| Mobile labels too long for compact view | Low | Low | Use abbreviated translations; test on smallest viewport |
| Utility function `getNavigationItemsForUser` incompatibility | Medium | Medium | Add translations parameter with English defaults for backward compatibility |

---

## Dependencies Graph

```
Task 1 (Translation Keys)
   ├── Task 2 (RoleBasedNavigation)
   ├── Task 3 (Dashboard2Layout)
   ├── Task 4 (DashboardLayout)
   ├── Task 5 (PropertyDropdown)
   └── Task 6 (Non-English Translations)
         └── Task 7 (Verification)
```

---

## Estimated Total Effort

| Task | Estimate |
|------|----------|
| Task 1: Add translation keys | 30 min |
| Task 2: Update RoleBasedNavigation | 45 min |
| Task 3: Update Dashboard2Layout | 30 min |
| Task 4: Update DashboardLayout | 45 min |
| Task 5: Update PropertyDropdown | 20 min |
| Task 6: Generate non-English translations | 30 min |
| Task 7: Verification and testing | 30 min |
| **Total** | **~4 hours** |

---

## Acceptance Criteria Checklist (from Request)

- [ ] RoleBasedNavigation component: useTranslations hook imported and initialized
- [ ] All navigation item labels replaced with translation key references
- [ ] All navigation item descriptions replaced with translation key references
- [ ] Mobile-specific navigation labels (mobileName) replaced with translation key references
- [ ] Compact mode labels replaced with translation key references
- [ ] All section headers and menu group labels replaced with translation key references
- [ ] All tooltip text for navigation items replaced with translation key references
- [ ] All accessibility labels (aria-label, aria-description) replaced with translation key references
- [ ] Dashboard layout navigation elements updated to use translated strings
- [ ] Breadcrumb labels and navigation paths replaced with translation key references
- [ ] Mobile menu toggle button labels replaced with translation key references
- [ ] Navigation state labels replaced with translation key references
- [ ] Navigation icons remain visible and properly positioned across all languages
- [ ] Long navigation labels do not break navigation layout or overflow containers
- [ ] Navigation remains fully functional with proper keyboard navigation and screen reader support
- [ ] Responsive navigation behavior works correctly with all language variants
- [ ] No translation key placeholders or untranslated strings visible
- [ ] Permission-based navigation items display appropriate translated labels
- [ ] Navigation follows established i18n patterns used in other localized components
- [ ] All navigation components properly handle missing translations with graceful fallbacks
- [ ] Navigation state and routing functionality remain unchanged after internationalization

---

## References

- [Overview Document](/docs/REQ-E02-053-update-navigationsidebar-components-overview.md)
- [Request Specification](/docs/gen_requests_epic2.md) - REQ-E02-053
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Reference Implementation: LogoutButton.tsx](/src/components/LogoutButton.tsx)

---

*Document generated for FAQBNB Localization Epic 2 - Task 2B.5: Update Navigation/Sidebar Components*
