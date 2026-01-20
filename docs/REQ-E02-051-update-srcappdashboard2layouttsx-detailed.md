# REQ-E02-051: Update Dashboard2 Layout Component - Detailed Task Breakdown

**Document Created:** 2026-01-20 21:30 UTC
**Last Modified:** 2026-01-20 21:30 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #51
**Overview Document:** docs/REQ-E02-051-update-srcappdashboard2layouttsx-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.3
**Estimated Size:** M (Medium)
**Story Points:** 3

---

## Executive Summary

This document provides granular implementation tasks for internationalizing the dashboard2 layout component (`/src/app/dashboard2/layout.tsx`). The component serves as the shared layout wrapper for all dashboard pages, containing navigation, header, and loading state strings that need to be translated. The implementation involves adding `useTranslations` hooks, moving the navigation items array inside the component, and replacing approximately 15 hardcoded strings with translation function calls.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 i18n foundation is complete (next-intl installed and configured)
- [ ] REQ-E02-049 (Dashboard namespace structure) is complete
- [ ] `NextIntlClientProvider` wraps the app in `/src/app/layout.tsx`
- [ ] `/messages/en.json` exists with `dashboard` namespace
- [ ] `/messages/en.json` has `auth.signOut` key available
- [ ] Development environment builds without errors

---

## Task Breakdown

### Task 1: Add useTranslations Import

**Status:** NOT STARTED
**Estimated Effort:** 5 minutes
**Complexity:** Low

**Objective:** Import the useTranslations hook from next-intl to enable translation functionality.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Line ~15-22):**
```typescript
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
import { PropertyProvider } from '@/contexts/PropertyContext';
import { PropertyDropdown } from '@/components/dashboard';
```

**Target State:**
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

**Acceptance Criteria:**
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Import placed in logical order with other hooks
- [ ] No TypeScript errors

---

### Task 2: Initialize Translation Hooks in Dashboard2LayoutContent

**Status:** NOT STARTED
**Estimated Effort:** 10 minutes
**Complexity:** Low

**Objective:** Initialize the translation hooks at the top of the Dashboard2LayoutContent function to access both `dashboard` and `auth` namespaces.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Line ~69-73):**
```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
```

**Target State:**
```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
```

**Acceptance Criteria:**
- [ ] `const t = useTranslations('dashboard');` added after existing hooks
- [ ] `const tAuth = useTranslations('auth');` added for logout button
- [ ] Hooks initialized before any conditional returns
- [ ] No TypeScript errors

**Implementation Notes:**
- Two namespaces are needed because logout uses the existing `auth.signOut` key
- Hooks must be called at the top level, before any early returns

---

### Task 3: Move Navigation Items Array Inside Component

**Status:** NOT STARTED
**Estimated Effort:** 15 minutes
**Complexity:** Medium

**Objective:** Move the `navigationItems` array from module scope into the Dashboard2LayoutContent function so it can use translation functions. The NavItem interface remains at module scope.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Lines ~39-67):**
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

**Target State:**

At module scope (keep existing location ~39):
```typescript
// Navigation items moved inside component for translation support
// REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
// Order: Dashboard → Items → Instructions → Properties
```

Inside Dashboard2LayoutContent function (after hook initializations):
```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');

  // Navigation items with translated labels
  // REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
  const navigationItems: NavItem[] = [
    {
      name: t('nav.dashboard'),
      mobileLabel: t('nav.dashboardMobile'),
      href: '/dashboard2',
      icon: LayoutDashboard,
    },
    {
      name: t('nav.items'),
      mobileLabel: t('nav.itemsMobile'),
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
```

**Acceptance Criteria:**
- [ ] Navigation items array moved inside Dashboard2LayoutContent function
- [ ] All four navigation items use translation keys
- [ ] NavItem interface remains at module scope (unchanged)
- [ ] href values remain unchanged (they are routes, not translatable)
- [ ] icon values remain unchanged
- [ ] Comments preserved and updated
- [ ] No TypeScript errors

**Required Translation Keys:**
| Key | English Value |
|-----|---------------|
| `dashboard.nav.dashboard` | `"Dashboard"` |
| `dashboard.nav.dashboardMobile` | `"D/B"` |
| `dashboard.nav.items` | `"Items"` |
| `dashboard.nav.itemsMobile` | `"Items"` |
| `dashboard.nav.guides` | `"Guides"` |
| `dashboard.nav.guidesMobile` | `"Guide"` |
| `dashboard.nav.properties` | `"Properties"` |
| `dashboard.nav.propertiesMobile` | `"Prop."` |

---

### Task 4: Update Auth Loading State Message

**Status:** NOT STARTED
**Estimated Effort:** 5 minutes
**Complexity:** Low

**Objective:** Replace the hardcoded "Loading dashboard..." message with a translation key.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Lines ~76-85):**
```tsx
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

**Target State:**
```tsx
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

**Acceptance Criteria:**
- [ ] Hardcoded string "Loading dashboard..." replaced with `{t('loading.dashboard')}`
- [ ] Curly braces used correctly for JSX expression
- [ ] No changes to surrounding elements or classes

**Required Translation Key:**
| Key | English Value |
|-----|---------------|
| `dashboard.loading.dashboard` | `"Loading dashboard..."` |

---

### Task 5: Update Redirect State Message

**Status:** NOT STARTED
**Estimated Effort:** 5 minutes
**Complexity:** Low

**Objective:** Replace the hardcoded "Redirecting to login..." message with a translation key.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Lines ~94-101):**
```tsx
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Redirecting to login...</p>
    </div>
  </div>
);
```

**Target State:**
```tsx
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
      <p className="text-gray-600 text-lg">{t('loading.redirecting')}</p>
    </div>
  </div>
);
```

**Acceptance Criteria:**
- [ ] Hardcoded string "Redirecting to login..." replaced with `{t('loading.redirecting')}`
- [ ] No changes to surrounding elements or classes

**Required Translation Key:**
| Key | English Value |
|-----|---------------|
| `dashboard.loading.redirecting` | `"Redirecting to login..."` |

---

### Task 6: Update Generic Loading State Message

**Status:** NOT STARTED
**Estimated Effort:** 5 minutes
**Complexity:** Low

**Objective:** Replace the hardcoded "Loading..." message in the generic loading state with a translation key.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Lines ~105-113):**
```tsx
if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
}
```

**Target State:**
```tsx
if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{t('loading.generic')}</p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Hardcoded string "Loading..." replaced with `{t('loading.generic')}`
- [ ] No changes to surrounding elements or classes

**Required Translation Key:**
| Key | English Value |
|-----|---------------|
| `dashboard.loading.generic` | `"Loading..."` |

---

### Task 7: Update Header Logo Alt Text and Title

**Status:** NOT STARTED
**Estimated Effort:** 10 minutes
**Complexity:** Low

**Objective:** Replace the hardcoded "FAQBNB Logo" alt text and "FAQBNB" title with translation keys.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Lines ~123-132):**
```tsx
<Link href="/dashboard2" className="flex items-center space-x-2">
  <Image
    src="/faqbnb_logoshort.png"
    alt="FAQBNB Logo"
    width={32}
    height={32}
    className="rounded-md"
  />
  <h1 className="text-xl font-bold text-gray-900 hidden sm:block">FAQBNB</h1>
</Link>
```

**Target State:**
```tsx
<Link href="/dashboard2" className="flex items-center space-x-2">
  <Image
    src="/faqbnb_logoshort.png"
    alt={t('header.logoAlt')}
    width={32}
    height={32}
    className="rounded-md"
  />
  <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{t('header.title')}</h1>
</Link>
```

**Acceptance Criteria:**
- [ ] Image `alt` attribute uses `{t('header.logoAlt')}`
- [ ] h1 content uses `{t('header.title')}`
- [ ] No changes to other Image props or h1 classes

**Required Translation Keys:**
| Key | English Value |
|-----|---------------|
| `dashboard.header.logoAlt` | `"FAQBNB Logo"` |
| `dashboard.header.title` | `"FAQBNB"` |

---

### Task 8: Update Logout Button Text and Aria-Label

**Status:** NOT STARTED
**Estimated Effort:** 10 minutes
**Complexity:** Low

**Objective:** Replace the hardcoded "Logout" button text and aria-label with the existing `auth.signOut` translation key.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Lines ~141-148):**
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

**Target State:**
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

**Acceptance Criteria:**
- [ ] `aria-label` attribute uses `{tAuth('signOut')}`
- [ ] span content uses `{tAuth('signOut')}`
- [ ] Uses `tAuth` (auth namespace) not `t` (dashboard namespace)
- [ ] No changes to button classes or other attributes

**Required Translation Key:**
| Key | English Value | Notes |
|-----|---------------|-------|
| `auth.signOut` | `"Sign Out"` | Already exists in messages/en.json |

**Note:** The existing key value is "Sign Out" not "Logout" - this is an intentional update to use the standardized auth terminology across the app.

---

### Task 9: Update Navigation Aria-Label

**Status:** NOT STARTED
**Estimated Effort:** 5 minutes
**Complexity:** Low

**Objective:** Replace the hardcoded "Dashboard Navigation" aria-label on the nav element with a translation key.

**File:** `/src/app/dashboard2/layout.tsx`

**Current State (Line ~155):**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label="Dashboard Navigation">
```

**Target State:**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label={t('nav.ariaLabel')}>
```

**Acceptance Criteria:**
- [ ] `aria-label` attribute uses `{t('nav.ariaLabel')}`
- [ ] No changes to nav classes

**Required Translation Key:**
| Key | English Value |
|-----|---------------|
| `dashboard.nav.ariaLabel` | `"Dashboard Navigation"` |

---

### Task 10: Add Translation Keys to Messages File

**Status:** NOT STARTED
**Estimated Effort:** 15 minutes
**Complexity:** Low

**Objective:** Add all required translation keys to `/messages/en.json` under the `dashboard` namespace.

**File:** `/messages/en.json`

**Current Dashboard Namespace (Lines ~57-75):**
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

**Target State:**
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
  "noActivity": "No recent activity",
  "header": {
    "title": "FAQBNB",
    "logoAlt": "FAQBNB Logo"
  },
  "nav": {
    "ariaLabel": "Dashboard Navigation",
    "dashboard": "Dashboard",
    "dashboardMobile": "D/B",
    "items": "Items",
    "itemsMobile": "Items",
    "guides": "Guides",
    "guidesMobile": "Guide",
    "properties": "Properties",
    "propertiesMobile": "Prop."
  },
  "loading": {
    "dashboard": "Loading dashboard...",
    "redirecting": "Redirecting to login...",
    "generic": "Loading..."
  }
}
```

**Acceptance Criteria:**
- [ ] `header` object added with `title` and `logoAlt` keys
- [ ] `nav` object added with all navigation label keys
- [ ] `loading` object added with all loading state keys
- [ ] Valid JSON syntax (no trailing commas, proper nesting)
- [ ] Keys follow existing naming convention

**New Keys Summary:**
| Key Path | Value |
|----------|-------|
| `dashboard.header.title` | `"FAQBNB"` |
| `dashboard.header.logoAlt` | `"FAQBNB Logo"` |
| `dashboard.nav.ariaLabel` | `"Dashboard Navigation"` |
| `dashboard.nav.dashboard` | `"Dashboard"` |
| `dashboard.nav.dashboardMobile` | `"D/B"` |
| `dashboard.nav.items` | `"Items"` |
| `dashboard.nav.itemsMobile` | `"Items"` |
| `dashboard.nav.guides` | `"Guides"` |
| `dashboard.nav.guidesMobile` | `"Guide"` |
| `dashboard.nav.properties` | `"Properties"` |
| `dashboard.nav.propertiesMobile` | `"Prop."` |
| `dashboard.loading.dashboard` | `"Loading dashboard..."` |
| `dashboard.loading.redirecting` | `"Redirecting to login..."` |
| `dashboard.loading.generic` | `"Loading..."` |

---

### Task 11: Verify Build and Test

**Status:** NOT STARTED
**Estimated Effort:** 15 minutes
**Complexity:** Low

**Objective:** Verify the implementation compiles without errors and renders correctly.

**Steps:**

1. **Run TypeScript Check:**
   ```bash
   npx tsc --noEmit
   ```

2. **Run Build:**
   ```bash
   npm run build
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Visual Verification:**
   - Navigate to `/dashboard2`
   - Verify loading states display correctly (may need to simulate by throttling network)
   - Verify header logo alt text (inspect element)
   - Verify header title "FAQBNB" displays
   - Verify navigation labels display correctly
   - Verify mobile navigation labels (resize browser or use devtools)
   - Verify logout button displays "Sign Out"
   - Verify navigation aria-label (inspect element)

**Acceptance Criteria:**
- [ ] TypeScript compilation succeeds with no errors
- [ ] Production build completes successfully
- [ ] All translated strings render in English
- [ ] No "missing translation" warnings in console
- [ ] Navigation functions correctly (can click between pages)
- [ ] Logout functionality works
- [ ] Loading states display when appropriate
- [ ] Responsive behavior maintained (mobile labels show on small screens)

---

## Complete Translation Keys Reference

### Keys to Add to `/messages/en.json`

```json
{
  "dashboard": {
    "header": {
      "title": "FAQBNB",
      "logoAlt": "FAQBNB Logo"
    },
    "nav": {
      "ariaLabel": "Dashboard Navigation",
      "dashboard": "Dashboard",
      "dashboardMobile": "D/B",
      "items": "Items",
      "itemsMobile": "Items",
      "guides": "Guides",
      "guidesMobile": "Guide",
      "properties": "Properties",
      "propertiesMobile": "Prop."
    },
    "loading": {
      "dashboard": "Loading dashboard...",
      "redirecting": "Redirecting to login...",
      "generic": "Loading..."
    }
  }
}
```

### Existing Key Used (No Changes Needed)

| Key | Current Value |
|-----|---------------|
| `auth.signOut` | `"Sign Out"` |

---

## Implementation Order

Execute tasks in the following order to minimize risk:

1. **Task 10** - Add translation keys to messages file first
2. **Task 1** - Add import
3. **Task 2** - Initialize hooks
4. **Task 3** - Move navigation items (most complex, test after)
5. **Tasks 4-6** - Update loading states (simple replacements)
6. **Task 7** - Update header
7. **Task 8** - Update logout button
8. **Task 9** - Update nav aria-label
9. **Task 11** - Verify and test

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Translation hook not available in loading states | Hooks are initialized before conditional returns; verify IntlProvider wraps entire app |
| Navigation breaks after restructure | Test navigation immediately after Task 3; rollback if issues |
| Missing translation keys | Add keys (Task 10) before component changes |
| Build failures | Run TypeScript check after each major change |

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `/src/app/dashboard2/layout.tsx` | Add import, initialize hooks, move array, replace ~15 strings |
| `/messages/en.json` | Add 14 new translation keys under `dashboard` namespace |

---

## Dependencies

### Blocking Dependencies (Must Complete First)
- REQ-E02-049: Create dashboard namespace structure (provides base namespace)
- Epic 1: i18n foundation (provides next-intl framework)

### Related Tasks (Can Run in Parallel)
- REQ-E02-050: Update dashboard2/page.tsx (sibling component)

### Downstream Tasks (Depend on This)
- Task 2B.7: Generate translations for non-English languages

---

## Acceptance Criteria Verification Checklist

From Request #51:

- [ ] useTranslations hook imported from next-intl and initialized with 'dashboard' namespace
- [ ] All hardcoded navigation labels replaced with translation key references
- [ ] All header text and titles replaced with translation key references
- [ ] All accessibility labels (aria-label) replaced with translation key references
- [ ] All user menu items replaced with translation key references (Logout)
- [ ] Component remains fully responsive with no layout breaks
- [ ] No translation key placeholders or untranslated strings visible
- [ ] Layout follows established i18n patterns
- [ ] Layout state and functionality remain unchanged after internationalization

---

## Notes for Implementation Agent

1. **Hook Placement:** The `useTranslations` hooks must be called at the top level of the function component, before any conditional returns. This is a React hooks rule.

2. **Namespace Usage:** This component uses TWO namespaces:
   - `dashboard` for navigation, header, and loading strings
   - `auth` for the logout button (reusing existing key)

3. **NavItem Interface:** Keep the `NavItem` interface at module scope. Only move the `navigationItems` array inside the component.

4. **Testing Loading States:** To test loading states visually:
   - Open DevTools Network tab
   - Set throttling to "Slow 3G"
   - Refresh the page to see loading states

5. **Mobile Testing:** Use browser DevTools device mode or resize window to test mobile navigation labels.

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2B: Dashboard & Navigation*
*Task ID: 2B.3 - Update Dashboard2 Layout Component*
