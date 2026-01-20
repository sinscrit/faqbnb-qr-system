# REQ-E02-051: Update Dashboard2 Layout Component for Internationalization - Implementation Breakdown

**Document Created:** 2026-01-20 20:45 UTC
**Last Modified:** 2026-01-20 20:45 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #51
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.3
**Estimated Size:** M (Medium)

---

## 1. Overview

### 1.1 Summary

Update the dashboard2 layout component (`/src/app/dashboard2/layout.tsx`) to use internationalized strings from the `dashboard` translation namespace instead of hardcoded English text. This enables multilingual layout elements including navigation labels, header text, accessibility labels, and user action controls for the entire dashboard section.

### 1.2 Current State Analysis

The dashboard2 layout component currently contains hardcoded English strings for:

| String Type | Current Text | Location in Component |
|-------------|--------------|----------------------|
| Loading message | `"Loading dashboard..."` | Line 81 |
| Redirect message | `"Redirecting to login..."` | Line 98 |
| Generic loading | `"Loading..."` | Line 111 |
| App title | `"FAQBNB"` | Line 131 |
| Logo alt text | `"FAQBNB Logo"` | Line 127 |
| Navigation: Dashboard | `"Dashboard"` / `"D/B"` | Lines 45-46 |
| Navigation: Items | `"Items"` / `"Items"` | Lines 50-51 |
| Navigation: Guides | `"Guides"` / `"Guide"` | Lines 55-56 |
| Navigation: Properties | `"Properties"` / `"Prop."` | Lines 60-61 |
| Logout button | `"Logout"` | Line 147 |
| Logout aria-label | `"Logout"` | Line 144 |
| Select property aria-label | Referenced from PropertyDropdown | Line 89 |
| Dashboard navigation aria-label | `"Dashboard Navigation"` | Line 155 |

The component is a client component (`'use client'`) that serves as the shared layout wrapper for all dashboard2 pages, providing consistent header, navigation, and structural elements.

### 1.3 Target State

All user-facing strings in the dashboard layout will be retrieved from the `dashboard` translation namespace using the `useTranslations` hook from `next-intl`. The component will dynamically display navigation labels, loading messages, and UI elements in the user's selected language.

### 1.4 Component Architecture

```
Dashboard2Layout (Client Component)
├── AuthProvider (context wrapper)
│   └── PropertyProvider (context wrapper)
│       └── Dashboard2LayoutContent
│           ├── Loading States (conditional)
│           │   ├── Auth Loading State
│           │   ├── Redirect to Login State
│           │   └── Generic Loading State
│           └── Main Layout (when authenticated)
│               ├── Header
│               │   ├── Logo Link (with FAQBNB text)
│               │   ├── PropertyDropdown (center)
│               │   └── Logout Button
│               ├── Navigation Bar
│               │   └── Navigation Items (Dashboard, Items, Guides, Properties)
│               └── Main Content Area
│                   └── {children}
```

---

## 2. Analysis of Strings to Extract

### 2.1 Hardcoded Strings in Component

| Line | Current String | Proposed Translation Key | Notes |
|------|----------------|--------------------------|-------|
| 45 | `"Dashboard"` | `dashboard.nav.dashboard` | Desktop nav label |
| 46 | `"D/B"` | `dashboard.nav.dashboardMobile` | Mobile abbreviated label |
| 50 | `"Items"` | `dashboard.nav.items` | Nav label (same mobile/desktop) |
| 51 | `"Items"` | `dashboard.nav.itemsMobile` | Could reuse `dashboard.nav.items` |
| 55 | `"Guides"` | `dashboard.nav.guides` | Desktop nav label |
| 56 | `"Guide"` | `dashboard.nav.guidesMobile` | Mobile abbreviated label |
| 60 | `"Properties"` | `dashboard.nav.properties` | Desktop nav label |
| 61 | `"Prop."` | `dashboard.nav.propertiesMobile` | Mobile abbreviated label |
| 81 | `"Loading dashboard..."` | `dashboard.loading.dashboard` | Auth loading state |
| 98 | `"Redirecting to login..."` | `dashboard.loading.redirecting` | Redirect state message |
| 111 | `"Loading..."` | `dashboard.loading.generic` | Generic loading state |
| 127 | `"FAQBNB Logo"` | `dashboard.header.logoAlt` | Logo alt text |
| 131 | `"FAQBNB"` | `dashboard.header.title` | App title in header |
| 144 | `"Logout"` | `auth.signOut` | Already exists in auth namespace |
| 147 | `"Logout"` | `auth.signOut` | Reuse existing key |
| 155 | `"Dashboard Navigation"` | `dashboard.nav.ariaLabel` | Navigation aria-label |

### 2.2 Translation Keys Required

Based on the component analysis and alignment with the existing `dashboard` namespace structure:

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

Note: The `auth.signOut` key already exists in the `auth` namespace and should be reused.

---

## 3. Implementation Tasks

### Task 3.1: Import useTranslations Hook

**Objective:** Add the necessary import for translation functionality

**Action:**
Add the `useTranslations` hook import from `next-intl`:

```typescript
// Add to existing imports (around line 15)
import { useTranslations } from 'next-intl';
```

### Task 3.2: Initialize Translation Hooks

**Objective:** Initialize the translation hooks in the Dashboard2LayoutContent component

**Action:**
Add hook initializations near the top of the Dashboard2LayoutContent function:

```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authState, signOut } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const t = useTranslations('dashboard'); // Add this line
  const tAuth = useTranslations('auth');   // Add this line for logout
  // ... rest of hooks
```

### Task 3.3: Update Navigation Items Array

**Objective:** Internationalize the navigation item labels

**Note:** The `navigationItems` array is defined outside the component at module scope (lines 42-67). Since hooks cannot be called outside components, we need to restructure this to use translations.

**Approach Option A - Move array inside component:**

```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard');

  // Move navigation items inside component to use translations
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
  // ...
}
```

**Approach Option B - Use translation keys as data, translate in JSX:**

Keep the array structure with keys and translate in the render:

```typescript
// Keep at module scope with translation keys instead of strings
const navigationItems: NavItem[] = [
  {
    name: 'nav.dashboard',
    mobileLabel: 'nav.dashboardMobile',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  // ...
];

// In JSX, translate dynamically:
<span className="hidden md:inline">{t(item.name)}</span>
<span className="md:hidden">{t(item.mobileLabel || item.name)}</span>
```

**Recommended:** Option A (move array inside component) for cleaner code and type safety.

### Task 3.4: Replace Loading State Strings

**Objective:** Internationalize the loading and redirect messages

**Current Code (lines 76-85, auth loading state):**
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

**Updated Code:**
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

**Current Code (lines 93-102, redirect state):**
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

**Updated Code:**
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

**Current Code (lines 105-113, generic loading):**
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

**Updated Code:**
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

### Task 3.5: Replace Header Strings

**Objective:** Internationalize the header title and logo alt text

**Current Code (lines 123-132):**
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

**Updated Code:**
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

### Task 3.6: Replace Logout Button Strings

**Objective:** Internationalize the logout button using existing auth namespace

**Current Code (lines 141-148):**
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

**Updated Code:**
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

### Task 3.7: Replace Navigation Aria-Label

**Objective:** Internationalize the navigation accessibility label

**Current Code (line 155):**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label="Dashboard Navigation">
```

**Updated Code:**
```tsx
<nav className="bg-white border-b border-gray-200" aria-label={t('nav.ariaLabel')}>
```

### Task 3.8: Update Navigation Item Rendering

**Objective:** Use translated navigation labels in the render

**Current Code (lines 176-177):**
```tsx
<span className="hidden md:inline">{item.name}</span>
<span className="md:hidden">{item.mobileLabel || item.name}</span>
```

If using Approach A (moved array inside component), these lines remain unchanged since `item.name` and `item.mobileLabel` are already translated strings.

### Task 3.9: Verify Translation Keys Exist

**Objective:** Ensure all required translation keys are present in the namespace

**Action:**
Add the following keys to `/messages/en.json` under the `dashboard` namespace if not already present:

- `dashboard.header.title`
- `dashboard.header.logoAlt`
- `dashboard.nav.ariaLabel`
- `dashboard.nav.dashboard`
- `dashboard.nav.dashboardMobile`
- `dashboard.nav.items`
- `dashboard.nav.itemsMobile`
- `dashboard.nav.guides`
- `dashboard.nav.guidesMobile`
- `dashboard.nav.properties`
- `dashboard.nav.propertiesMobile`
- `dashboard.loading.dashboard`
- `dashboard.loading.redirecting`
- `dashboard.loading.generic`

---

## 4. Authorized Files and Functions for Modification

### 4.1 Primary File for Modification

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/src/app/dashboard2/layout.tsx` | MODIFY | Add useTranslations hooks and replace hardcoded strings |

### 4.2 Functions/Sections to Modify

| Function/Section | Line Range | Modification |
|------------------|------------|--------------|
| Imports | ~1-23 | Add `import { useTranslations } from 'next-intl';` |
| navigationItems array | ~42-67 | Move inside Dashboard2LayoutContent function |
| Dashboard2LayoutContent function | ~69 | Add `const t = useTranslations('dashboard');` and `const tAuth = useTranslations('auth');` |
| Auth loading state JSX | ~76-85 | Replace loading message string |
| Redirect state JSX | ~93-102 | Replace redirect message string |
| Generic loading state JSX | ~105-113 | Replace loading message string |
| Header logo link JSX | ~123-132 | Replace alt text and title |
| Logout button JSX | ~141-148 | Replace aria-label and button text |
| Navigation bar JSX | ~155 | Replace aria-label |
| Navigation item rendering | ~176-177 | Use translated strings from array |

### 4.3 Translation File Dependencies

| File Path | Status | Dependency Type |
|-----------|--------|-----------------|
| `/messages/en.json` | Required | Must have `dashboard.nav.*`, `dashboard.header.*`, `dashboard.loading.*` keys |
| `/messages/fr.json` | Required | Must have matching structure |
| `/messages/es.json` | Required | Must have matching structure |
| `/messages/de.json` | Required | Must have matching structure |
| `/messages/nl.json` | Required | Must have matching structure |
| `/messages/it.json` | Required | Must have matching structure |

### 4.4 Scope Boundaries

**In Scope:**
- Adding `useTranslations` imports and hook initializations
- Moving `navigationItems` array inside component
- Replacing approximately 15 hardcoded strings with translation function calls
- Using existing `auth.signOut` key for logout button

**Out of Scope:**
- Modifying child components (PropertyDropdown - has separate scope)
- Modifying AuthProvider or PropertyProvider
- Modifying translation file structures (done in REQ-E02-049)
- Generating translations for non-English languages (Task 2B.7)
- Modifying the LogoutButton component (already internationalized per Epic 1)

---

## 5. Dependencies

### 5.1 Prerequisites

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 Complete | Blocking | Assumed Complete | next-intl setup, IntlProvider |
| REQ-E02-049 Complete | Blocking | Required | Dashboard namespace structure |
| NextIntlClientProvider | Runtime | Available | Wraps app in layout.tsx |
| Auth namespace exists | Blocking | Verified | `auth.signOut` key exists |

### 5.2 Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 2B.1 (REQ-E02-049) | Create dashboard namespace structure | Provides translation keys |
| 2B.2 (REQ-E02-050) | Update dashboard2/page.tsx | Sibling - also uses dashboard namespace |
| 2B.4 | Update SimpleDashboard components | Child components rendered within this layout |
| 2B.5 | Update navigation/sidebar components | PropertyDropdown used in this layout |
| 2B.7 | Generate translations | Will translate strings used here |

---

## 6. Acceptance Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| useTranslations hook imported from 'next-intl' | Check imports at top of file |
| Translation hooks initialized with 'dashboard' and 'auth' namespaces | Check `const t = useTranslations('dashboard')` and `const tAuth = useTranslations('auth')` |
| Navigation labels use translation keys | Verify each nav item uses `t('nav.*')` |
| Header title uses `t('header.title')` | Grep for header text |
| Logo alt text uses `t('header.logoAlt')` | Verify Image alt prop |
| Loading messages use translations | Verify all three loading states use `t('loading.*')` |
| Logout button uses `tAuth('signOut')` | Verify button text and aria-label |
| Navigation aria-label uses translation | Verify `aria-label={t('nav.ariaLabel')}` |
| No hardcoded user-facing English strings remain | Manual review of component JSX |
| Component renders correctly in English | Visual verification |
| Component renders correctly in other languages | Language switch verification |
| Layout state and functionality unchanged | Test navigation, auth flow |

---

## 7. Testing Approach

### 7.1 Unit Testing

1. Verify component mounts without errors
2. Verify translation hooks are called with correct namespaces
3. Verify navigation items render with translated text

### 7.2 Visual Testing

1. Load dashboard in English - verify all layout text displays correctly
2. Switch to French - verify translated strings appear for navigation and header
3. Switch to each supported language - verify no missing translation errors
4. Test loading states (can mock auth loading)
5. Test redirect state (can mock unauthorized state)

### 7.3 Integration Testing

1. Verify navigation works correctly in all languages
2. Verify logout button functions correctly with translated text
3. Verify PropertyDropdown integration remains functional
4. Test responsive layout - mobile labels should display correctly
5. Verify accessibility labels are translated (test with screen reader)

### 7.4 Build Verification

```bash
npm run build
# Should complete without errors
# No TypeScript errors related to translation function
```

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Verify keys exist before implementation |
| Translation hook not available in loading states | Medium | High | Loading states render before auth; verify IntlProvider wraps entire tree |
| Navigation array restructure breaks functionality | Low | Medium | Keep same NavItem interface, test navigation |
| Mobile labels truncated incorrectly in other languages | Medium | Low | Test in all languages, CSS handles overflow |
| Build errors | Low | High | Incremental changes, test after each |

---

## 9. Implementation Notes

### 9.1 Hook Initialization Pattern

Following the established pattern from `LogoutButton.tsx`:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  // Component body
}
```

### 9.2 Multiple Namespace Usage

This component requires two namespaces:
- `dashboard` - for navigation, header, and loading strings
- `auth` - for logout button (reusing existing key)

```typescript
const t = useTranslations('dashboard');
const tAuth = useTranslations('auth');

// Usage
t('nav.dashboard')     // Dashboard navigation
tAuth('signOut')       // Logout button
```

### 9.3 Navigation Items Inside Component

Moving the navigation items array inside the component function:

```typescript
function Dashboard2LayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard');

  const navigationItems: NavItem[] = [
    {
      name: t('nav.dashboard'),
      mobileLabel: t('nav.dashboardMobile'),
      href: '/dashboard2',
      icon: LayoutDashboard,
    },
    // ... other items
  ];

  // Rest of component
}
```

**Important:** The `NavItem` interface definition (lines 28-37) should remain at module scope.

### 9.4 Accessibility Considerations

Ensure all aria-labels are translated:
- `aria-label={t('nav.ariaLabel')}` on `<nav>` element
- `aria-label={tAuth('signOut')}` on logout button

---

## 10. Code Change Summary

### 10.1 Before (Current State)

```typescript
// Line 15 - no next-intl import

// Lines 42-67 - Navigation items at module scope with hardcoded strings
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  // ...
];

// Line 81 - hardcoded loading message
<p className="text-gray-600 text-lg">Loading dashboard...</p>

// Line 98 - hardcoded redirect message
<p className="text-gray-600 text-lg">Redirecting to login...</p>

// Line 111 - hardcoded generic loading
<p className="text-gray-600 text-lg">Loading...</p>

// Lines 127-131 - hardcoded header
<Image src="/faqbnb_logoshort.png" alt="FAQBNB Logo" ... />
<h1 ...>FAQBNB</h1>

// Lines 144, 147 - hardcoded logout
aria-label="Logout"
<span className="hidden sm:inline">Logout</span>

// Line 155 - hardcoded nav aria-label
aria-label="Dashboard Navigation"
```

### 10.2 After (Target State)

```typescript
// Line 15 - add import
import { useTranslations } from 'next-intl';

// Inside Dashboard2LayoutContent function
const t = useTranslations('dashboard');
const tAuth = useTranslations('auth');

// Navigation items moved inside component with translations
const navigationItems: NavItem[] = [
  {
    name: t('nav.dashboard'),
    mobileLabel: t('nav.dashboardMobile'),
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  // ...
];

// Loading states with translations
<p className="text-gray-600 text-lg">{t('loading.dashboard')}</p>
<p className="text-gray-600 text-lg">{t('loading.redirecting')}</p>
<p className="text-gray-600 text-lg">{t('loading.generic')}</p>

// Header with translations
<Image src="/faqbnb_logoshort.png" alt={t('header.logoAlt')} ... />
<h1 ...>{t('header.title')}</h1>

// Logout with translations
aria-label={tAuth('signOut')}
<span className="hidden sm:inline">{tAuth('signOut')}</span>

// Nav with translated aria-label
aria-label={t('nav.ariaLabel')}
```

---

## 11. Translation Keys to Add

The following keys need to be added to `/messages/en.json` (and corresponding files for other languages):

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

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-049: Dashboard Namespace Structure](/docs/REQ-E02-049-create-dashboard-namespace-structure-overview.md)
- [REQ-E02-050: Dashboard2 Page Internationalization](/docs/REQ-E02-050-update-srcappdashboard2pagetsx-overview.md)
- [LogoutButton.tsx - Translation Pattern Reference](/src/components/LogoutButton.tsx)
- [next-intl useTranslations Hook](https://next-intl-docs.vercel.app/docs/usage/messages#usetranslations)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2B: Dashboard & Navigation*
