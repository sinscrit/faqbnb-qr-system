# REQ-366: Update Dashboard2 Layout Component for Internationalization

**Created:** 2026-01-19 19:15 UTC
**Last Modified:** 2026-01-19 19:15 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.3
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Overview

This document provides the implementation breakdown for internationalizing the `Dashboard2Layout` component (`/src/app/dashboard2/layout.tsx`). This is Task 2B.3 in the L10N Epic 2 implementation plan, which focuses on replacing all hardcoded English text strings with translation keys from the `dashboard` namespace using the next-intl framework.

The Dashboard2Layout component is the main layout wrapper for all authenticated dashboard pages and contains approximately 15-20 user-facing strings including navigation labels, loading messages, button text, and accessibility attributes.

---

## Current State Analysis

### Component Location
`/src/app/dashboard2/layout.tsx`

### Component Type
- **Client Component** (`'use client'` directive)
- Uses `useTranslations` hook from `next-intl` (not `getTranslations`)

### Existing Dependencies
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

### Hardcoded Strings Inventory

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 45 | `'Dashboard'` | `dashboard.nav.dashboard` | Navigation item name |
| 46 | `'D/B'` | `dashboard.nav.dashboardShort` | Mobile label for Dashboard |
| 51 | `'Items'` | `dashboard.nav.items` | Navigation item name |
| 52 | `'Items'` | `dashboard.nav.itemsShort` | Mobile label for Items |
| 56 | `'Guides'` | `dashboard.nav.guides` | Navigation item name |
| 57 | `'Guide'` | `dashboard.nav.guidesShort` | Mobile label for Guides |
| 61 | `'Properties'` | `dashboard.nav.properties` | Navigation item name |
| 62 | `'Prop.'` | `dashboard.nav.propertiesShort` | Mobile label for Properties |
| 81 | `'Loading dashboard...'` | `dashboard.loading.dashboard` | Loading state message |
| 98 | `'Redirecting to login...'` | `dashboard.loading.redirecting` | Redirect state message |
| 110 | `'Loading...'` | `common.loading` | Generic loading state (use common namespace) |
| 127 | `'FAQBNB Logo'` | `dashboard.logoAlt` | Image alt text (accessibility) |
| 131 | `'FAQBNB'` | N/A | Brand name - keep as-is |
| 145 | `'Logout'` | `auth.signOut` | Button text (use existing auth namespace) |
| 147 | `'Logout'` | `auth.signOut` | Mobile variant text |
| 144 | `'Logout'` | `auth.signOut` | aria-label for button |
| 155 | `'Dashboard Navigation'` | `dashboard.nav.ariaLabel` | Aria label for nav element |

---

## Implementation Approach

### Pattern Reference
Follow the pattern established in `LogoutButton.tsx`:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  return <h1>{t('nav.dashboard')}</h1>;
}
```

### Translation Namespace Structure
The `dashboard` namespace in `/messages/en.json` needs to be expanded with the following structure:

```json
{
  "dashboard": {
    "logoAlt": "FAQBNB Logo",
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
}
```

### Navigation Items Data Structure Update

The `navigationItems` array needs to be converted to use translation keys dynamically. There are two approaches:

**Option A: Keep navigation items static, translate at render time**
```typescript
const navigationItems: NavItem[] = [
  {
    nameKey: 'nav.dashboard',
    mobileKey: 'nav.dashboardShort',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  // ...
];

// In render:
<span className="hidden md:inline">{t(item.nameKey)}</span>
<span className="md:hidden">{t(item.mobileKey)}</span>
```

**Option B: Move navigation items inside component (recommended)**
Move the `navigationItems` definition inside `Dashboard2LayoutContent` to access the `t()` function directly.

**Recommendation:** Option B is cleaner and follows React patterns for translated content.

---

## Authorized Files and Functions for Modification

### Primary File
| File Path | Modification Scope |
|-----------|-------------------|
| `/src/app/dashboard2/layout.tsx` | Add import, replace all hardcoded strings with `t()` calls |

### Translation Files
| File Path | Modification Scope |
|-----------|-------------------|
| `/messages/en.json` | Add/update `dashboard.nav` and `dashboard.loading` namespace entries |
| `/messages/fr.json` | Add French translations for `dashboard` updates |
| `/messages/es.json` | Add Spanish translations for `dashboard` updates |
| `/messages/de.json` | Add German translations for `dashboard` updates |
| `/messages/nl.json` | Add Dutch translations for `dashboard` updates |
| `/messages/it.json` | Add Italian translations for `dashboard` updates |

### Functions to Modify
| Function/Component | Location | Changes |
|-------------------|----------|---------|
| `Dashboard2LayoutContent` | Lines 69-191 | Add `useTranslations` hooks, replace strings |
| `navigationItems` array | Lines 42-67 | Move inside component or convert to key-based |
| Loading state renders | Lines 77-85, 94-102, 105-114 | Replace hardcoded loading messages |
| Header section | Lines 119-152 | Replace logo alt, logout button text |
| Navigation render | Lines 154-183 | Replace nav aria-label and item labels |

---

## Implementation Tasks

### Task 1: Update Translation Files
**Estimate:** Small
**Description:** Add the required translation keys to all 6 language files.

**Steps:**
1. Open `/messages/en.json`
2. Expand the `dashboard` namespace with navigation and loading entries
3. Copy structure to other language files and translate

**English Translations (add to existing dashboard namespace):**
```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back",
    "logoAlt": "FAQBNB Logo",
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
}
```

### Task 2: Add useTranslations Import
**Estimate:** Trivial
**Description:** Add the next-intl import to Dashboard2Layout.

**Code Change (add to line 7):**
```typescript
import { useTranslations } from 'next-intl';
```

### Task 3: Initialize Translation Hooks
**Estimate:** Trivial
**Description:** Add translation hook initialization inside the Dashboard2LayoutContent component.

**Code Change (after line 73):**
```typescript
const t = useTranslations('dashboard');
const tAuth = useTranslations('auth');
const tCommon = useTranslations('common');
```

### Task 4: Move navigationItems Inside Component
**Estimate:** Small
**Description:** Move the navigationItems array inside Dashboard2LayoutContent to access translations.

**Location:** Lines 42-67

**Before:**
```typescript
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  // ...
];
```

**After (inside Dashboard2LayoutContent, after translation hooks):**
```typescript
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

### Task 5: Update Loading States
**Estimate:** Small
**Description:** Replace hardcoded loading messages with translation calls.

**Location 1:** Lines 77-85 (auth loading state)

**Before:**
```tsx
<p className="text-gray-600 text-lg">Loading dashboard...</p>
```

**After:**
```tsx
<p className="text-gray-600 text-lg">{t('loading.dashboard')}</p>
```

**Location 2:** Lines 94-102 (redirect state)

**Before:**
```tsx
<p className="text-gray-600 text-lg">Redirecting to login...</p>
```

**After:**
```tsx
<p className="text-gray-600 text-lg">{t('loading.redirecting')}</p>
```

**Location 3:** Lines 105-114 (generic loading state)

**Before:**
```tsx
<p className="text-gray-600 text-lg">Loading...</p>
```

**After:**
```tsx
<p className="text-gray-600 text-lg">{tCommon('loading')}</p>
```

### Task 6: Update Header Section
**Estimate:** Small
**Description:** Replace logo alt text and logout button text with translations.

**Location:** Lines 119-152

**Before:**
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

**Logout Button - Before:**
```tsx
<button
  onClick={() => signOut()}
  className="..."
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
  className="..."
  aria-label={tAuth('signOut')}
>
  <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
  <span className="hidden sm:inline">{tAuth('signOut')}</span>
</button>
```

### Task 7: Update Navigation Aria Label
**Estimate:** Trivial
**Description:** Replace hardcoded navigation aria-label with translation.

**Location:** Line 155

**Before:**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label="Dashboard Navigation">
```

**After:**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label={t('nav.ariaLabel')}>
```

---

## Dependencies

### Required Before Implementation
- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [ ] Task 2B.1: Create `dashboard` namespace structure (should be complete or done in parallel)
- [ ] Task 2B.2: Update Dashboard2 page (can run in parallel)

### Components This Affects
- All child pages within `/dashboard2/*` route inherit this layout

### Components That Depend on This
- `/src/app/dashboard2/page.tsx` - Uses this layout
- `/src/app/dashboard2/items/page.tsx` - Uses this layout
- `/src/app/dashboard2/properties/page.tsx` - Uses this layout
- `/src/app/dashboard2/instructions/page.tsx` - Uses this layout

### Child Components That May Need Updates
- `PropertyDropdown` - May have its own internal strings (separate task)

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Layout loads without errors in English (default)
- [ ] All navigation labels display correctly in each of the 6 languages
- [ ] Loading states show translated messages
- [ ] Redirect to login message appears translated
- [ ] Logo alt text is translated (verify in browser dev tools)
- [ ] Logout button shows translated text
- [ ] Navigation aria-label is translated (verify in accessibility tools)
- [ ] Mobile navigation labels display correctly
- [ ] No console errors related to missing translations
- [ ] Text does not overflow or break layout in longer languages (German, French)

### Navigation Testing
- [ ] Each navigation item renders translated label
- [ ] Mobile abbreviated labels render correctly
- [ ] Active state highlighting still works after translation
- [ ] Navigation functions correctly in all languages

### Accessibility Verification
- [ ] Logo `alt` attribute contains translated text
- [ ] Navigation `aria-label` contains translated text
- [ ] Logout button `aria-label` contains translated text
- [ ] Screen reader announces translated navigation items correctly
- [ ] Keyboard navigation still works properly

### Language Switch Testing
- [ ] Switching language updates all translated strings immediately
- [ ] Navigation items update on language change
- [ ] Layout persists language preference across page navigations

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Build-time check with next-intl |
| Navigation items lose reactivity | Low | High | Ensure navigationItems array is inside component |
| Text overflow in mobile labels | Medium | Low | Keep mobile labels short, verify layout |
| Aria labels missing | Low | Medium | Test with screen reader |
| Breaking existing navigation | Low | High | Test all navigation routes after changes |

---

## Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| All hardcoded text strings identified and catalogued | String Inventory table above |
| Navigation labels use translation keys | Task 4 |
| Mobile navigation labels translated | Task 4 |
| Loading state messages use translation keys | Task 5 |
| Redirect message uses translation key | Task 5 |
| Logo alt text internationalized | Task 6 |
| Logout button text translated | Task 6 |
| Navigation aria-label translated | Task 7 |
| Component imports useTranslations | Task 2 |
| Layout functions correctly | Testing Requirements |
| Existing styling maintained | No CSS changes required |
| Accessibility attributes maintained | Tasks 6, 7 |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-366)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Translation Files](/messages/en.json)
- [Related Task: REQ-365 Dashboard2 Page](/docs/REQ-365-update-srcappdashboard2pagetsx-overview.md)

---

## Appendix: Complete String Extraction Map

```
Dashboard2Layout.tsx String Extraction

+---------------------------------------------------------------------+
| LOADING STATES (lines 77-114)                                        |
+---------------------------------------------------------------------+
| * "Loading dashboard..."       -> t('loading.dashboard')             |
| * "Redirecting to login..."    -> t('loading.redirecting')           |
| * "Loading..."                 -> tCommon('loading')                 |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| HEADER SECTION (lines 119-152)                                       |
+---------------------------------------------------------------------+
| * alt="FAQBNB Logo"            -> alt={t('logoAlt')}                 |
| * "FAQBNB"                     -> Keep as brand name                 |
| * aria-label="Logout"          -> aria-label={tAuth('signOut')}      |
| * "Logout"                     -> {tAuth('signOut')}                 |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| NAVIGATION ITEMS (lines 42-67, move to inside component)             |
+---------------------------------------------------------------------+
| * "Dashboard" / "D/B"          -> t('nav.dashboard') /               |
|                                   t('nav.dashboardShort')            |
| * "Items" / "Items"            -> t('nav.items') /                   |
|                                   t('nav.itemsShort')                |
| * "Guides" / "Guide"           -> t('nav.guides') /                  |
|                                   t('nav.guidesShort')               |
| * "Properties" / "Prop."       -> t('nav.properties') /              |
|                                   t('nav.propertiesShort')           |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
| NAVIGATION ELEMENT (line 155)                                        |
+---------------------------------------------------------------------+
| * aria-label="Dashboard Navigation"                                  |
|   -> aria-label={t('nav.ariaLabel')}                                 |
+---------------------------------------------------------------------+
```

---

## Appendix: Sample Translations

### French (`/messages/fr.json`)
```json
{
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
      "properties": "Proprietes",
      "propertiesShort": "Prop."
    }
  }
}
```

### German (`/messages/de.json`)
```json
{
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
}
```

### Spanish (`/messages/es.json`)
```json
{
  "dashboard": {
    "logoAlt": "Logo de FAQBNB",
    "loading": {
      "dashboard": "Cargando panel de control...",
      "redirecting": "Redirigiendo al inicio de sesion..."
    },
    "nav": {
      "ariaLabel": "Navegacion del panel de control",
      "dashboard": "Panel",
      "dashboardShort": "Panel",
      "items": "Articulos",
      "itemsShort": "Art.",
      "guides": "Guias",
      "guidesShort": "Guia",
      "properties": "Propiedades",
      "propertiesShort": "Prop."
    }
  }
}
```

### Dutch (`/messages/nl.json`)
```json
{
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
      "properties": "Eigenschappen",
      "propertiesShort": "Eig."
    }
  }
}
```

### Italian (`/messages/it.json`)
```json
{
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
      "properties": "Proprieta",
      "propertiesShort": "Prop."
    }
  }
}
```

---

## Appendix: Final Component Structure

After implementation, the Dashboard2LayoutContent function should have this structure:

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

  // Navigation items (now inside component to access translations)
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

  // ... rest of component logic
}
```

---

*Document generated for FAQBNB L10N Epic 2 - Task 2B.3*
