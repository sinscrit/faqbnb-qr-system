# REQ-366: Update Dashboard2 Layout Component for Internationalization - Detailed Task Breakdown

**Created:** 2026-01-19 21:30 UTC
**Last Modified:** 2026-01-19 21:30 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.3
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High
**Overview Document:** [REQ-366-update-srcappdashboard2layouttsx-overview.md](./REQ-366-update-srcappdashboard2layouttsx-overview.md)

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for internationalizing the `Dashboard2Layout` component located at `/src/app/dashboard2/layout.tsx`. This is Task 2B.3 in the L10N Epic 2 implementation plan. The task involves replacing approximately 14 hardcoded English text strings with translation keys from the `dashboard`, `auth`, and `common` namespaces using the next-intl framework.

**Total Estimated Tasks:** 10
**Component Type:** Client Component (`'use client'` directive)
**Translation Hook:** `useTranslations` from `next-intl`

---

## Prerequisites

Before starting this task, verify the following:

| Prerequisite | Status | Verification Command |
|--------------|--------|---------------------|
| Epic 1 Foundation complete | Required | Check `next-intl` in `package.json` |
| IntlProvider configured | Required | Verify `/src/app/layout.tsx` wraps app |
| Translation files exist | Required | Check `/messages/en.json` exists |
| Dashboard namespace exists | Required | Task 2B.1 should have created base structure |
| `auth.signOut` key exists | Required | Verify in `/messages/en.json` |
| `common.loading` key exists | Required | Verify in `/messages/en.json` |

---

## String Inventory

The following hardcoded strings must be extracted and translated:

| ID | Line | Current String | Translation Key | Namespace | Type |
|----|------|----------------|-----------------|-----------|------|
| S1 | 44 | `'Dashboard'` | `dashboard.nav.dashboard` | dashboard | Navigation label |
| S2 | 45 | `'D/B'` | `dashboard.nav.dashboardShort` | dashboard | Mobile nav label |
| S3 | 50 | `'Items'` | `dashboard.nav.items` | dashboard | Navigation label |
| S4 | 51 | `'Items'` | `dashboard.nav.itemsShort` | dashboard | Mobile nav label |
| S5 | 56 | `'Guides'` | `dashboard.nav.guides` | dashboard | Navigation label |
| S6 | 57 | `'Guide'` | `dashboard.nav.guidesShort` | dashboard | Mobile nav label |
| S7 | 61 | `'Properties'` | `dashboard.nav.properties` | dashboard | Navigation label |
| S8 | 62 | `'Prop.'` | `dashboard.nav.propertiesShort` | dashboard | Mobile nav label |
| S9 | 81 | `'Loading dashboard...'` | `dashboard.loading.dashboard` | dashboard | Loading state |
| S10 | 98 | `'Redirecting to login...'` | `dashboard.loading.redirecting` | dashboard | Redirect message |
| S11 | 110 | `'Loading...'` | `common.loading` | common | Generic loading |
| S12 | 126 | `'FAQBNB Logo'` | `dashboard.logoAlt` | dashboard | Image alt text |
| S13 | 144,147 | `'Logout'` | `auth.signOut` | auth | Button text/aria |
| S14 | 155 | `'Dashboard Navigation'` | `dashboard.nav.ariaLabel` | dashboard | Accessibility |

---

## Implementation Tasks

### Task 1: Expand Dashboard Namespace with Navigation Keys in English Translation File

**File:** `/messages/en.json`
**Estimate:** 1 story point
**Dependencies:** None

#### Description
Add the required navigation and loading translation keys to the `dashboard` namespace in the English translation file.

#### Step-by-Step Instructions

1. Open `/messages/en.json`
2. Locate the existing `dashboard` object (line 57)
3. Add the `nav`, `loading`, and `logoAlt` keys within the `dashboard` object

#### Code Changes

**Before (existing dashboard namespace):**
```json
"dashboard": {
  "title": "Dashboard",
  "welcome": "Welcome back",
  "properties": "Properties",
  "items": "Items",
  "analytics": "Analytics",
  "settings": "Settings",
  "recentActivity": "Recent Activity",
  "quickActions": "Quick Actions",
  "totalProperties": "Total Properties",
  "totalItems": "Total Items",
  "totalScans": "Total Scans",
  "activeUsers": "Active Users",
  "overview": "Overview",
  "createProperty": "Create Property",
  "createItem": "Create Item",
  "viewAll": "View All",
  "noActivity": "No recent activity"
}
```

**After (expanded dashboard namespace):**
```json
"dashboard": {
  "title": "Dashboard",
  "welcome": "Welcome back",
  "logoAlt": "FAQBNB Logo",
  "properties": "Properties",
  "items": "Items",
  "analytics": "Analytics",
  "settings": "Settings",
  "recentActivity": "Recent Activity",
  "quickActions": "Quick Actions",
  "totalProperties": "Total Properties",
  "totalItems": "Total Items",
  "totalScans": "Total Scans",
  "activeUsers": "Active Users",
  "overview": "Overview",
  "createProperty": "Create Property",
  "createItem": "Create Item",
  "viewAll": "View All",
  "noActivity": "No recent activity",
  "loading": {
    "dashboard": "Loading dashboard...",
    "redirecting": "Redirecting to login..."
  },
  "nav": {
    "ariaLabel": "Dashboard Navigation",
    "dashboard": "Dashboard",
    "dashboardShort": "D/B",
    "items": "Items",
    "itemsShort": "Items",
    "guides": "Guides",
    "guidesShort": "Guide",
    "properties": "Properties",
    "propertiesShort": "Prop."
  }
}
```

#### Acceptance Criteria for Task 1
- [ ] `dashboard.logoAlt` key exists
- [ ] `dashboard.loading.dashboard` key exists
- [ ] `dashboard.loading.redirecting` key exists
- [ ] `dashboard.nav.ariaLabel` key exists
- [ ] `dashboard.nav.dashboard` and `dashboard.nav.dashboardShort` keys exist
- [ ] `dashboard.nav.items` and `dashboard.nav.itemsShort` keys exist
- [ ] `dashboard.nav.guides` and `dashboard.nav.guidesShort` keys exist
- [ ] `dashboard.nav.properties` and `dashboard.nav.propertiesShort` keys exist
- [ ] JSON syntax is valid (no parsing errors)

---

### Task 2: Add Translations to Non-English Language Files

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimate:** 1 story point
**Dependencies:** Task 1

#### Description
Add the corresponding translations for the new dashboard keys to all 5 non-English language files.

#### Step-by-Step Instructions

For each non-English language file, add the same key structure with translated values.

#### French (`/messages/fr.json`)
```json
"dashboard": {
  "logoAlt": "Logo FAQBNB",
  "loading": {
    "dashboard": "Chargement du tableau de bord...",
    "redirecting": "Redirection vers la connexion..."
  },
  "nav": {
    "ariaLabel": "Navigation du tableau de bord",
    "dashboard": "Tableau de bord",
    "dashboardShort": "T/B",
    "items": "Articles",
    "itemsShort": "Art.",
    "guides": "Guides",
    "guidesShort": "Guide",
    "properties": "Propriétés",
    "propertiesShort": "Prop."
  }
}
```

#### Spanish (`/messages/es.json`)
```json
"dashboard": {
  "logoAlt": "Logo de FAQBNB",
  "loading": {
    "dashboard": "Cargando panel de control...",
    "redirecting": "Redirigiendo al inicio de sesión..."
  },
  "nav": {
    "ariaLabel": "Navegación del panel de control",
    "dashboard": "Panel",
    "dashboardShort": "Panel",
    "items": "Artículos",
    "itemsShort": "Art.",
    "guides": "Guías",
    "guidesShort": "Guía",
    "properties": "Propiedades",
    "propertiesShort": "Prop."
  }
}
```

#### German (`/messages/de.json`)
```json
"dashboard": {
  "logoAlt": "FAQBNB Logo",
  "loading": {
    "dashboard": "Dashboard wird geladen...",
    "redirecting": "Weiterleitung zur Anmeldung..."
  },
  "nav": {
    "ariaLabel": "Dashboard-Navigation",
    "dashboard": "Dashboard",
    "dashboardShort": "D/B",
    "items": "Elemente",
    "itemsShort": "Elem.",
    "guides": "Anleitungen",
    "guidesShort": "Anleit.",
    "properties": "Immobilien",
    "propertiesShort": "Immo."
  }
}
```

#### Dutch (`/messages/nl.json`)
```json
"dashboard": {
  "logoAlt": "FAQBNB Logo",
  "loading": {
    "dashboard": "Dashboard laden...",
    "redirecting": "Doorsturen naar login..."
  },
  "nav": {
    "ariaLabel": "Dashboard Navigatie",
    "dashboard": "Dashboard",
    "dashboardShort": "D/B",
    "items": "Items",
    "itemsShort": "Items",
    "guides": "Gidsen",
    "guidesShort": "Gids",
    "properties": "Accommodaties",
    "propertiesShort": "Acc."
  }
}
```

#### Italian (`/messages/it.json`)
```json
"dashboard": {
  "logoAlt": "Logo FAQBNB",
  "loading": {
    "dashboard": "Caricamento dashboard...",
    "redirecting": "Reindirizzamento al login..."
  },
  "nav": {
    "ariaLabel": "Navigazione Dashboard",
    "dashboard": "Dashboard",
    "dashboardShort": "D/B",
    "items": "Elementi",
    "itemsShort": "Elem.",
    "guides": "Guide",
    "guidesShort": "Guida",
    "properties": "Proprietà",
    "propertiesShort": "Prop."
  }
}
```

#### Acceptance Criteria for Task 2
- [ ] All 5 non-English files contain the new dashboard.nav keys
- [ ] All 5 non-English files contain the new dashboard.loading keys
- [ ] All 5 non-English files contain the dashboard.logoAlt key
- [ ] JSON syntax is valid in all files
- [ ] Key structure matches exactly across all 6 language files

---

### Task 3: Add useTranslations Import to Dashboard2Layout

**File:** `/src/app/dashboard2/layout.tsx`
**Estimate:** 0.5 story points
**Dependencies:** None

#### Description
Add the `useTranslations` import from `next-intl` to the component imports.

#### Step-by-Step Instructions

1. Open `/src/app/dashboard2/layout.tsx`
2. Locate the imports section (lines 15-22)
3. Add the `useTranslations` import after the Next.js imports

#### Code Changes

**Location:** After line 18 (after `import Link from 'next/link';`)

**Add this line:**
```typescript
import { useTranslations } from 'next-intl';
```

**Result (lines 15-23):**
```typescript
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
import { PropertyProvider } from '@/contexts/PropertyContext';
import { PropertyDropdown } from '@/components/dashboard';
```

#### Acceptance Criteria for Task 3
- [ ] `useTranslations` is imported from `next-intl`
- [ ] Import is placed with other React/Next.js imports
- [ ] No TypeScript errors on the import statement
- [ ] No duplicate imports

---

### Task 4: Initialize Translation Hooks in Dashboard2LayoutContent Component

**File:** `/src/app/dashboard2/layout.tsx`
**Estimate:** 0.5 story points
**Dependencies:** Task 3

#### Description
Initialize the `useTranslations` hooks with the `dashboard`, `auth`, and `common` namespaces inside the `Dashboard2LayoutContent` component.

#### Step-by-Step Instructions

1. Open `/src/app/dashboard2/layout.tsx`
2. Locate the beginning of the `Dashboard2LayoutContent` function (line 69)
3. Add the translation hook initializations after the existing hooks (after line 73)

#### Code Changes

**Location:** After line 73 (after `const [hasRedirected, setHasRedirected] = useState(false);`)

**Add these lines:**
```typescript
const t = useTranslations('dashboard');
const tAuth = useTranslations('auth');
const tCommon = useTranslations('common');
```

**Result (lines 69-78):**
```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Translation hooks
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
```

#### Acceptance Criteria for Task 4
- [ ] `useTranslations` hook is initialized with `'dashboard'` namespace as `t`
- [ ] `useTranslations` hook is initialized with `'auth'` namespace as `tAuth`
- [ ] `useTranslations` hook is initialized with `'common'` namespace as `tCommon`
- [ ] Hooks are placed near the top of the component with other hooks
- [ ] No TypeScript errors

---

### Task 5: Move navigationItems Array Inside Component

**File:** `/src/app/dashboard2/layout.tsx`
**Estimate:** 1 story point
**Dependencies:** Task 4

#### Description
Move the `navigationItems` array from module scope (lines 42-67) to inside the `Dashboard2LayoutContent` function so it can access the translation function.

#### Step-by-Step Instructions

1. Cut the `navigationItems` array definition (lines 42-67)
2. Paste it inside `Dashboard2LayoutContent`, after the translation hooks
3. Update the array values to use translation function calls
4. Keep the `NavItem` interface at module scope (it doesn't need to move)

#### Code Changes

**Remove from module scope (lines 39-67):**
```typescript
// Navigation items for the dashboard
// REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
// Order: Dashboard → Items → Instructions → Properties
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

**Add inside Dashboard2LayoutContent (after translation hooks):**
```typescript
// Navigation items for the dashboard (moved inside component for translation access)
// REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
// Order: Dashboard → Items → Instructions → Properties
const navigationItems: NavItem[] = [
  {
    name: t('nav.dashboard'),
    mobileLabel: t('nav.dashboardShort'),
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: t('nav.items'),
    mobileLabel: t('nav.itemsShort'),
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: t('nav.guides'),
    mobileLabel: t('nav.guidesShort'),
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: t('nav.properties'),
    mobileLabel: t('nav.propertiesShort'),
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

**Full context (lines 69-108 after change):**
```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Translation hooks
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  // Navigation items for the dashboard (moved inside component for translation access)
  // REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
  // Order: Dashboard → Items → Instructions → Properties
  const navigationItems: NavItem[] = [
    {
      name: t('nav.dashboard'),
      mobileLabel: t('nav.dashboardShort'),
      href: '/dashboard2',
      icon: LayoutDashboard,
    },
    {
      name: t('nav.items'),
      mobileLabel: t('nav.itemsShort'),
      href: '/dashboard2/items',
      icon: Package,
    },
    {
      name: t('nav.guides'),
      mobileLabel: t('nav.guidesShort'),
      href: '/dashboard2/instructions',
      icon: FileText,
    },
    {
      name: t('nav.properties'),
      mobileLabel: t('nav.propertiesShort'),
      href: '/dashboard2/properties',
      icon: Building2,
    },
  ];

  // Show loading spinner while auth is initializing...
```

#### Acceptance Criteria for Task 5
- [ ] `navigationItems` array is now inside `Dashboard2LayoutContent`
- [ ] `NavItem` interface remains at module scope
- [ ] All 4 navigation items use `t('nav.xxx')` for name
- [ ] All 4 navigation items use `t('nav.xxxShort')` for mobileLabel
- [ ] Navigation still renders correctly
- [ ] Active state highlighting still works
- [ ] No TypeScript errors

---

### Task 6: Update Loading State Messages

**File:** `/src/app/dashboard2/layout.tsx`
**Estimate:** 0.5 story points
**Dependencies:** Task 4

#### Description
Replace the three hardcoded loading state messages with translation function calls.

#### Step-by-Step Instructions

1. Locate the first loading state (auth loading, around line 81)
2. Locate the second loading state (redirect, around line 98)
3. Locate the third loading state (generic, around line 110)
4. Replace each hardcoded string with the appropriate translation call

#### Code Changes

**Loading State 1 - Auth Loading (line 81):**

**Before:**
```tsx
<p className="text-gray-600 text-lg">Loading dashboard...</p>
```

**After:**
```tsx
<p className="text-gray-600 text-lg">{t('loading.dashboard')}</p>
```

**Loading State 2 - Redirect (line 98):**

**Before:**
```tsx
<p className="text-gray-600 text-lg">Redirecting to login...</p>
```

**After:**
```tsx
<p className="text-gray-600 text-lg">{t('loading.redirecting')}</p>
```

**Loading State 3 - Generic (line 110):**

**Before:**
```tsx
<p className="text-gray-600 text-lg">Loading...</p>
```

**After:**
```tsx
<p className="text-gray-600 text-lg">{tCommon('loading')}</p>
```

#### Acceptance Criteria for Task 6
- [ ] First loading message uses `t('loading.dashboard')`
- [ ] Second loading message uses `t('loading.redirecting')`
- [ ] Third loading message uses `tCommon('loading')`
- [ ] All loading states render correctly
- [ ] No hardcoded English loading strings remain

---

### Task 7: Update Logo Alt Text

**File:** `/src/app/dashboard2/layout.tsx`
**Estimate:** 0.5 story points
**Dependencies:** Task 4

#### Description
Replace the hardcoded logo alt text with a translation function call.

#### Step-by-Step Instructions

1. Locate the Image component for the logo (around line 124-130)
2. Replace the hardcoded `alt` attribute with the translation call

#### Code Changes

**Before (lines 124-130):**
```tsx
<Image
  src="/faqbnb_logoshort.png"
  alt="FAQBNB Logo"
  width={32}
  height={32}
  className="rounded-md"
/>
```

**After:**
```tsx
<Image
  src="/faqbnb_logoshort.png"
  alt={t('logoAlt')}
  width={32}
  height={32}
  className="rounded-md"
/>
```

#### Acceptance Criteria for Task 7
- [ ] Logo `alt` attribute uses `t('logoAlt')`
- [ ] Logo renders correctly
- [ ] Alt text is properly translated for accessibility

---

### Task 8: Update Logout Button

**File:** `/src/app/dashboard2/layout.tsx`
**Estimate:** 0.5 story points
**Dependencies:** Task 4

#### Description
Replace the hardcoded logout button text and aria-label with translation function calls using the `auth` namespace.

#### Step-by-Step Instructions

1. Locate the logout button (around lines 141-148)
2. Replace the `aria-label` attribute with translation call
3. Replace the button text span with translation call

#### Code Changes

**Before (lines 141-148):**
```tsx
<button
  onClick={() => signOut()}
  className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 p-1.5 sm:px-3 sm:py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
  aria-label="Logout"
>
  <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
  <span className="hidden sm:inline">Logout</span>
</button>
```

**After:**
```tsx
<button
  onClick={() => signOut()}
  className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 p-1.5 sm:px-3 sm:py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
  aria-label={tAuth('signOut')}
>
  <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
  <span className="hidden sm:inline">{tAuth('signOut')}</span>
</button>
```

**Note:** The existing `auth.signOut` key in `/messages/en.json` has value `"Sign Out"` (line 39). This matches the expected behavior. The current component uses "Logout" but "Sign Out" is acceptable and consistent with other auth translations.

#### Acceptance Criteria for Task 8
- [ ] Logout button `aria-label` uses `tAuth('signOut')`
- [ ] Logout button visible text uses `tAuth('signOut')`
- [ ] Button functions correctly (triggers signOut)
- [ ] Screen readers announce the translated text

---

### Task 9: Update Navigation Aria Label

**File:** `/src/app/dashboard2/layout.tsx`
**Estimate:** 0.5 story points
**Dependencies:** Task 4

#### Description
Replace the hardcoded navigation `aria-label` with a translation function call.

#### Step-by-Step Instructions

1. Locate the nav element (around line 155)
2. Replace the `aria-label` attribute with the translation call

#### Code Changes

**Before (line 155):**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label="Dashboard Navigation">
```

**After:**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label={t('nav.ariaLabel')}>
```

#### Acceptance Criteria for Task 9
- [ ] Navigation `aria-label` uses `t('nav.ariaLabel')`
- [ ] Screen readers announce the translated navigation label
- [ ] Navigation renders and functions correctly

---

### Task 10: Verification and Testing

**File:** N/A (Testing)
**Estimate:** 1 story point
**Dependencies:** Tasks 1-9

#### Description
Verify all translations work correctly across all supported languages and ensure no regressions.

#### Testing Checklist

**Functional Testing:**
- [ ] Navigate to `/dashboard2` while logged in
- [ ] Verify all navigation labels display correctly
- [ ] Verify mobile navigation labels display correctly (resize browser)
- [ ] Verify loading states display translated messages
- [ ] Verify logout button text displays correctly
- [ ] Click logout button to confirm functionality
- [ ] Verify logo alt text is translated (inspect in dev tools)

**Language Testing (repeat for each language):**

| Language | URL Pattern | Expected Behavior |
|----------|-------------|-------------------|
| English | `/en/dashboard2` or default | All text in English |
| French | `/fr/dashboard2` | All text in French |
| Spanish | `/es/dashboard2` | All text in Spanish |
| German | `/de/dashboard2` | All text in German |
| Dutch | `/nl/dashboard2` | All text in Dutch |
| Italian | `/it/dashboard2` | All text in Italian |

**Navigation Testing:**
- [ ] Dashboard navigation item shows translated text (desktop)
- [ ] Dashboard navigation item shows abbreviated text (mobile)
- [ ] Items navigation item shows translated text (desktop)
- [ ] Items navigation item shows abbreviated text (mobile)
- [ ] Guides navigation item shows translated text (desktop)
- [ ] Guides navigation item shows abbreviated text (mobile)
- [ ] Properties navigation item shows translated text (desktop)
- [ ] Properties navigation item shows abbreviated text (mobile)
- [ ] Active state highlighting works on current page
- [ ] Navigation routing still works (click each item)

**Browser Console Verification:**
- [ ] No missing translation key warnings
- [ ] No React errors or warnings
- [ ] No TypeScript runtime errors

**Visual Regression Testing:**
- [ ] Navigation labels fit within their containers in all languages
- [ ] German text (longest) doesn't overflow
- [ ] Mobile abbreviated labels remain short enough
- [ ] Loading messages display correctly
- [ ] Logout button maintains layout
- [ ] Header spacing is preserved

**Accessibility Testing:**
- [ ] Logo `alt` attribute contains translated text
- [ ] Navigation `aria-label` contains translated text
- [ ] Logout button `aria-label` contains translated text
- [ ] Screen reader announces translated navigation items
- [ ] Keyboard navigation still works properly

#### Acceptance Criteria for Task 10
- [ ] All 6 languages display correct translations
- [ ] No console errors or warnings
- [ ] Layout doesn't break with longer text
- [ ] All interactive elements remain functional
- [ ] Accessibility features are preserved
- [ ] Navigation routing works in all languages

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `/messages/en.json` | Add `dashboard.loading`, `dashboard.nav`, `dashboard.logoAlt` keys |
| `/messages/fr.json` | Add French translations for new dashboard keys |
| `/messages/es.json` | Add Spanish translations for new dashboard keys |
| `/messages/de.json` | Add German translations for new dashboard keys |
| `/messages/nl.json` | Add Dutch translations for new dashboard keys |
| `/messages/it.json` | Add Italian translations for new dashboard keys |
| `/src/app/dashboard2/layout.tsx` | Add import, initialize hooks, move navigationItems, replace 14 strings |

---

## Code Diff Preview

### Final Component Structure (key sections)

```typescript
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
import { PropertyProvider } from '@/contexts/PropertyContext';
import { PropertyDropdown } from '@/components/dashboard';

interface NavItem {
  name: string;
  mobileLabel?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Translation hooks
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  // Navigation items (inside component for translation access)
  const navigationItems: NavItem[] = [
    {
      name: t('nav.dashboard'),
      mobileLabel: t('nav.dashboardShort'),
      href: '/dashboard2',
      icon: LayoutDashboard,
    },
    {
      name: t('nav.items'),
      mobileLabel: t('nav.itemsShort'),
      href: '/dashboard2/items',
      icon: Package,
    },
    {
      name: t('nav.guides'),
      mobileLabel: t('nav.guidesShort'),
      href: '/dashboard2/instructions',
      icon: FileText,
    },
    {
      name: t('nav.properties'),
      mobileLabel: t('nav.propertiesShort'),
      href: '/dashboard2/properties',
      icon: Building2,
    },
  ];

  // Loading state
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

  // ... remaining component with translated strings
}
```

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation key typo | Medium | High | Copy-paste keys, TypeScript checking |
| JSON syntax error | Medium | High | Validate JSON after each edit |
| Navigation breaks after refactor | Medium | High | Test all navigation routes thoroughly |
| Mobile labels too long | Medium | Low | Keep short abbreviations, verify layout |
| Layout break in German | Medium | Low | Test with longest translations |
| navigationItems loses reactivity | Low | High | Verify inside component with hooks |

---

## Rollback Plan

If issues are discovered after deployment:

1. Revert component changes (restore hardcoded strings, move navigationItems back)
2. Revert translation file changes (remove new dashboard.nav and dashboard.loading keys)
3. The application will fall back to English-only display

---

## Definition of Done

- [ ] All 10 tasks completed
- [ ] All acceptance criteria met
- [ ] Code review passed
- [ ] TypeScript compilation successful
- [ ] All 6 languages tested
- [ ] No console errors or warnings
- [ ] No visual regressions
- [ ] Navigation functions correctly
- [ ] Accessibility preserved
- [ ] Documentation updated (this file marked complete)

---

## References

- [Overview Document](./REQ-366-update-srcappdashboard2layouttsx-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-366)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Reference Implementation: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [Related Task: REQ-365 Dashboard2 Page](./REQ-365-update-srcappdashboard2pagetsx-detailed.md)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2B.3*
*Total Estimated Effort: 7 story points*
