# Implementation Overview: REQ-E02-053 - Update Navigation/Sidebar Components

**Generated:** 2026-01-20 21:15:00 UTC
**Last Modified:** 2026-01-20 21:15:00 UTC
**Request ID:** REQ-E02-053
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.5
**Size:** M (Medium)
**Priority:** P1 - High

---

## Summary

Update navigation and sidebar components, including RoleBasedNavigation and layout navigation elements, to use internationalized strings from the dashboard translation namespace instead of hardcoded English text, enabling multilingual navigation throughout the application.

---

## Background & Context

### Current State

Navigation and sidebar components contain hardcoded English strings for:
- Navigation item labels (Dashboard, Items, Guides, Properties, Analytics, System Admin)
- Mobile abbreviated labels (D/B, Guide, Prop.)
- Item descriptions (Overview and key metrics, Manage QR code items, etc.)
- Loading state messages (Loading navigation..., Loading dashboard...)
- Authentication state messages (Redirecting to login..., Authentication Required)
- Section indicators and role badges
- Button labels (Logout)
- Empty states and error messages

### Epic 1 Foundation (Prerequisites)

This task depends on the completed Epic 1 foundation:
- `next-intl` package installed and configured
- `IntlProvider` wrapping the application in `/src/app/layout.tsx`
- Translation files exist at `/messages/{en,fr,es,de,nl,it}.json`
- `useTranslations` hook available for client components
- `getTranslations` available for server components

### Existing i18n Patterns

Reference implementation in `LogoutButton.tsx` demonstrates the pattern:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  return <button>{t('signOut')}</button>;
}
```

---

## Implementation Scope

### Components to Update

| Component | File Path | Estimated Strings | Priority |
|-----------|-----------|-------------------|----------|
| RoleBasedNavigation | `/src/components/RoleBasedNavigation.tsx` | ~20 | Critical |
| Dashboard2Layout | `/src/app/dashboard2/layout.tsx` | ~12 | Critical |
| DashboardLayout | `/src/components/DashboardLayout.tsx` | ~15 | High |
| PropertyDropdown | `/src/components/dashboard/PropertyDropdown.tsx` | ~4 | Medium |

**Total Estimated Strings:** ~51

### String Categories

1. **Navigation Item Labels** (~8 strings)
   - Dashboard, Items, Guides, Properties, Analytics, System Admin, Home, Admin

2. **Mobile Navigation Labels** (~6 strings)
   - D/B, Items, Guide, Prop., Analytics, Admin

3. **Navigation Item Descriptions** (~6 strings)
   - Overview and key metrics
   - Manage QR code items
   - View and manage guides
   - Property management
   - View analytics and insights
   - System administration

4. **Loading States** (~5 strings)
   - Loading navigation...
   - Loading dashboard...
   - Loading permissions...
   - Loading...
   - Redirecting to login...

5. **Authentication Messages** (~4 strings)
   - Authentication Required
   - Please log in to access the dashboard.
   - Go to Home
   - Go to Login

6. **Button Labels** (~2 strings)
   - Logout
   - Open main menu (sr-only)

7. **Property Dropdown** (~4 strings)
   - All Properties
   - All
   - No properties found
   - Select property (aria-label)

8. **Section Indicators & Role Badges** (~12 strings)
   - Dashboard, Items, Guides, Properties, Analytics, System Admin (section labels)
   - System Admin, User, Owner, Admin, Member, Viewer (role badges)

9. **Accessibility Labels** (~4 strings)
   - Dashboard Navigation (aria-label)
   - Property list (aria-label)
   - Select property (aria-label)
   - Sign out of your account (title)

---

## Technical Approach

### 1. Translation Namespace Structure

Extend the existing `dashboard` namespace in `/messages/en.json`:

```json
{
  "dashboard": {
    "nav": {
      "dashboard": "Dashboard",
      "dashboardMobile": "D/B",
      "dashboardDescription": "Overview and key metrics",
      "home": "Home",
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

### 2. Component Update Pattern

#### RoleBasedNavigation.tsx

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function RoleBasedNavigation({ ... }) {
  const t = useTranslations('dashboard.nav');
  const tLoading = useTranslations('dashboard.loading');

  const getNavigationItems = (): NavigationItem[] => {
    // ...
    items.push({
      name: compactMode ? t('home') : t('dashboard'),
      mobileName: t('dashboardMobile'),
      description: t('dashboardDescription'),
      // ... rest unchanged
    });
    // ...
  };

  if (authLoading || permissionsLoading) {
    return (
      <div className={...}>
        <span className="ml-2 text-sm text-gray-600">{tLoading('navigation')}</span>
      </div>
    );
  }
  // ...
}
```

#### Dashboard2Layout.tsx

```typescript
'use client';

import { useTranslations } from 'next-intl';

function Dashboard2LayoutContent({ children }) {
  const t = useTranslations('dashboard');

  // Create navigation items with translations
  const navigationItems: NavItem[] = [
    {
      name: t('nav.dashboard'),
      mobileLabel: t('nav.dashboardMobile'),
      href: '/dashboard2',
      icon: LayoutDashboard,
    },
    // ... other items
  ];

  if (loading || authState === 'LOADING') {
    return (
      <div className="...">
        <p className="...">{t('loading.dashboard')}</p>
      </div>
    );
  }
  // ...
}
```

### 3. Handling Dynamic Navigation Items

The navigation items are generated dynamically based on permissions. The translation hook must be called at the component level (not inside the item generator function for server components):

```typescript
// Store translation keys instead of translated strings
const navConfig = [
  { nameKey: 'dashboard', mobileKey: 'dashboardMobile', descKey: 'dashboardDescription', ... },
  { nameKey: 'items', mobileKey: 'items', descKey: 'itemsDescription', ... },
];

// Resolve translations in render
{navConfig.map(item => (
  <NavItem
    name={t(`nav.${item.nameKey}`)}
    mobileName={t(`nav.${item.mobileKey}`)}
    description={t(`nav.${item.descKey}`)}
    {...item}
  />
))}
```

### 4. Server vs Client Component Considerations

All identified navigation components are client components (`'use client'`), so they will use `useTranslations` hook. If any server components need translation, use `getTranslations` from `next-intl/server`.

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Type | Functions/Sections to Modify |
|------|------|------------------------------|
| `/src/components/RoleBasedNavigation.tsx` | Client | `RoleBasedNavigation`, `getNavigationItems`, `getNavigationItemsForUser`, `DesktopNavigation`, `MobileNavigation` |
| `/src/app/dashboard2/layout.tsx` | Client | `navigationItems` array, `Dashboard2LayoutContent` |
| `/src/components/DashboardLayout.tsx` | Client | `DashboardLayout`, loading states, auth states, section indicators, role badges |
| `/src/components/dashboard/PropertyDropdown.tsx` | Client | `PropertyDropdown`, display text, aria labels, empty state |

### Translation Files

| File | Sections to Modify |
|------|-------------------|
| `/messages/en.json` | Add `dashboard.nav`, extend `dashboard.loading`, add `dashboard.auth`, add `dashboard.property`, add `dashboard.section`, add `dashboard.role` |
| `/messages/fr.json` | Mirror structure with French translations |
| `/messages/es.json` | Mirror structure with Spanish translations |
| `/messages/de.json` | Mirror structure with German translations |
| `/messages/nl.json` | Mirror structure with Dutch translations |
| `/messages/it.json` | Mirror structure with Italian translations |

### Types (if needed)

| File | Changes |
|------|---------|
| `/src/components/RoleBasedNavigation.tsx` | `NavigationItem` interface unchanged (name/mobileName/description remain strings) |

---

## Implementation Tasks

### Task 1: Update Translation Files
- [ ] Add `dashboard.nav` namespace with all navigation labels
- [ ] Add `dashboard.loading` entries for loading states
- [ ] Add `dashboard.auth` entries for authentication messages
- [ ] Add `dashboard.property` entries for property dropdown
- [ ] Add `dashboard.section` entries for section indicators
- [ ] Add `dashboard.role` entries for role badges

### Task 2: Update RoleBasedNavigation Component
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translations with `dashboard.nav` and `dashboard.loading` namespaces
- [ ] Replace hardcoded navigation item names with `t('...')` calls
- [ ] Replace hardcoded mobile labels with `t('...')` calls
- [ ] Replace hardcoded descriptions with `t('...')` calls
- [ ] Replace loading state text with `t('...')` calls
- [ ] Update `getNavigationItemsForUser` utility function
- [ ] Update aria-labels with translations

### Task 3: Update Dashboard2Layout Component
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translations with appropriate namespaces
- [ ] Replace hardcoded `navigationItems` array with translated values
- [ ] Replace loading state messages with translations
- [ ] Replace auth redirect message with translation
- [ ] Replace "Logout" button label with translation
- [ ] Update aria-label on navigation element

### Task 4: Update DashboardLayout Component
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translations with appropriate namespaces
- [ ] Replace loading state messages with translations
- [ ] Replace authentication required messages with translations
- [ ] Replace button labels (Go to Home, Go to Login, Logout) with translations
- [ ] Replace section indicator labels with translations
- [ ] Replace role badge labels with translations

### Task 5: Update PropertyDropdown Component
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize translations with `dashboard.property` namespace
- [ ] Replace "All Properties" / "All" with translations
- [ ] Replace "No properties found" empty state with translation
- [ ] Replace aria-labels with translations

### Task 6: Generate Non-English Translations
- [ ] Generate French translations for all new keys
- [ ] Generate Spanish translations for all new keys
- [ ] Generate German translations for all new keys
- [ ] Generate Dutch translations for all new keys
- [ ] Generate Italian translations for all new keys

### Task 7: Verification
- [ ] Verify all hardcoded strings removed from components
- [ ] Test navigation in English locale
- [ ] Test navigation in at least one non-English locale
- [ ] Verify mobile labels display correctly
- [ ] Verify aria-labels are translated
- [ ] Verify loading states display correct messages
- [ ] Verify no console errors related to missing translations

---

## Testing Considerations

### Functional Testing
1. Navigate through all dashboard sections in English
2. Switch locale and verify all navigation labels update
3. Test mobile view abbreviated labels
4. Test loading states during permission checks
5. Test authentication error state messages
6. Test property dropdown with 0, 1, and multiple properties

### Accessibility Testing
1. Screen reader announces correct translated labels
2. Aria-labels correctly reflect current locale
3. Keyboard navigation works correctly with translated content

### Layout Testing
1. German translations (typically longer) do not break navigation layout
2. Mobile abbreviated labels fit in compact view
3. Property dropdown handles long property names in all languages

---

## Dependencies

### Prerequisites
- Epic 1 foundation complete (next-intl configured)
- `IntlProvider` wrapping application
- Translation files exist at `/messages/*.json`

### Related Tasks
- Task 2B.1: Create `dashboard` namespace structure (should be complete)
- Task 2B.2-2B.4: Other dashboard components (can run in parallel)
- Task 2B.6: Update page metadata with translations (after this task)
- Task 2B.7: Generate translations for 5 non-English languages (after this task)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Navigation items generated dynamically break with translations | Medium | High | Test thoroughly; ensure translations called at component level |
| German/French longer text breaks layout | Medium | Medium | Design with 40% text expansion buffer; use truncation if needed |
| Missing translations show raw keys | Low | Medium | Verify all keys exist in all locale files before merge |
| Mobile labels too long for compact view | Low | Low | Use abbreviated translations; test on smallest viewport |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Update translation files | 30 min |
| Update RoleBasedNavigation | 45 min |
| Update Dashboard2Layout | 30 min |
| Update DashboardLayout | 45 min |
| Update PropertyDropdown | 20 min |
| Generate non-English translations | 30 min |
| Testing & verification | 30 min |
| **Total** | **~4 hours** |

---

## References

- [PRD: Localization Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request: REQ-E02-053](/docs/gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Reference Implementation: LogoutButton.tsx](/src/components/LogoutButton.tsx)

---

## Acceptance Criteria Checklist

From the request specification:

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
