# REQ-E02-050: Update Dashboard2 Page Component for Internationalization - Implementation Breakdown

**Document Created:** 2026-01-20 19:15 UTC
**Last Modified:** 2026-01-20 19:15 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #50
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.2
**Estimated Size:** M (Medium)

---

## 1. Overview

### 1.1 Summary

Update the main dashboard page component (`/src/app/dashboard2/page.tsx`) to use internationalized strings from the `dashboard` translation namespace instead of hardcoded English text. This enables multilingual dashboard experiences for property owners and administrators.

### 1.2 Current State Analysis

The dashboard page component currently contains hardcoded English strings for:

| String Type | Current Text | Location in Component |
|-------------|--------------|----------------------|
| Welcome message | `"Welcome back, {firstName}!"` | Line 192 |
| Subtitle | `"Create and manage your QR code items"` | Line 193 |
| Welcome title | `"Welcome to FAQBNB!"` | Line 174 (EmptyStateCard) |
| Welcome description | `"Get started by adding your first property..."` | Line 175 (EmptyStateCard) |
| Action label | `"Add Your First Property"` | Line 176 (EmptyStateCard) |
| Success message | `"Property created successfully"` | Line 121 |

The component is a client component (`'use client'`) that serves as the landing page for the dashboard with quick access to create items and manage existing items.

### 1.3 Target State

All user-facing strings in the dashboard page will be retrieved from the `dashboard` translation namespace using the `useTranslations` hook from `next-intl`. The component will dynamically display text in the user's selected language.

### 1.4 Component Architecture

```
Dashboard2Page (Client Component)
├── Success Message Banner (conditional)
├── New User Welcome State (conditional)
│   └── EmptyStateCard (with translated props)
└── Main Dashboard Content (conditional)
    ├── Welcome Section (gradient banner)
    │   └── DashboardSettingsPopover
    ├── ProgressiveStatisticsSection
    ├── AdvancedDashboardTools
    └── ActionButtons
├── PropertyEditModal
└── AddPropertyModal
```

---

## 2. Analysis of Strings to Extract

### 2.1 Hardcoded Strings in Component

| Line | Current String | Proposed Translation Key | Notes |
|------|----------------|--------------------------|-------|
| 121 | `"Property created successfully"` | `dashboard.messages.propertyCreated` | Success toast message |
| 174 | `"Welcome to FAQBNB!"` | `dashboard.empty.newUserWelcome` | New user welcome title |
| 175 | `"Get started by adding your first property..."` | `dashboard.empty.newUserDescription` | New user description |
| 176 | `"Add Your First Property"` | `dashboard.empty.newUserAction` | CTA button label |
| 192 | `"Welcome back, {firstName}!"` | `dashboard.welcome` | Welcome header with interpolation |
| 193 | `"Create and manage your QR code items"` | `dashboard.subtitle` | Dashboard subtitle |

### 2.2 Translation Keys Required

Based on the component analysis and the namespace structure established in REQ-E02-049:

```json
{
  "dashboard": {
    "welcome": "Welcome back, {name}!",
    "subtitle": "Create and manage your QR code items",
    "empty": {
      "newUserWelcome": "Welcome to FAQBNB!",
      "newUserDescription": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
      "newUserAction": "Add Your First Property"
    },
    "messages": {
      "propertyCreated": "Property created successfully"
    }
  }
}
```

---

## 3. Implementation Tasks

### Task 3.1: Import useTranslations Hook

**Objective:** Add the necessary import for translation functionality

**Action:**
Add the `useTranslations` hook import from `next-intl`:

```typescript
// Add to existing imports
import { useTranslations } from 'next-intl';
```

### Task 3.2: Initialize Translation Hook

**Objective:** Initialize the translation hook in the component

**Action:**
Add the hook initialization near the top of the component function, after existing hooks:

```typescript
export default function Dashboard2Page() {
  const router = useRouter();
  const { user, getUserProperties, userProperties } = useAuth();
  const t = useTranslations('dashboard'); // Add this line
  // ... rest of hooks
```

### Task 3.3: Replace Welcome Section Strings

**Objective:** Internationalize the welcome header section

**Current Code (lines 183-194):**
```tsx
<div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
  {/* REQ-136: Settings Popover */}
  <div className="absolute top-4 right-4">
    <DashboardSettingsPopover
      preferences={preferences}
      onPreferenceChange={setPreference}
    />
  </div>
  <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
  <p className="text-white/80 text-lg">Create and manage your QR code items</p>
</div>
```

**Updated Code:**
```tsx
<div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
  {/* REQ-136: Settings Popover */}
  <div className="absolute top-4 right-4">
    <DashboardSettingsPopover
      preferences={preferences}
      onPreferenceChange={setPreference}
    />
  </div>
  <h1 className="text-3xl font-bold mb-2">{t('welcome', { name: firstName })}</h1>
  <p className="text-white/80 text-lg">{t('subtitle')}</p>
</div>
```

### Task 3.4: Replace New User Welcome State Strings

**Objective:** Internationalize the EmptyStateCard for new users

**Current Code (lines 171-179):**
```tsx
{isNewUser && !isLoading ? (
  <div className="bg-white rounded-xl shadow-sm">
    <EmptyStateCard
      icon={Home}
      title="Welcome to FAQBNB!"
      description="Get started by adding your first property. Then you can create QR codes to help guests find what they need."
      actionLabel="Add Your First Property"
      onAction={handleAddProperty}
      variant="welcome"
    />
  </div>
)
```

**Updated Code:**
```tsx
{isNewUser && !isLoading ? (
  <div className="bg-white rounded-xl shadow-sm">
    <EmptyStateCard
      icon={Home}
      title={t('empty.newUserWelcome')}
      description={t('empty.newUserDescription')}
      actionLabel={t('empty.newUserAction')}
      onAction={handleAddProperty}
      variant="welcome"
    />
  </div>
)
```

### Task 3.5: Replace Success Message String

**Objective:** Internationalize the property creation success message

**Current Code (line 121):**
```tsx
setSuccessMessage('Property created successfully');
```

**Updated Code:**
```tsx
setSuccessMessage(t('messages.propertyCreated'));
```

### Task 3.6: Verify Translation Keys Exist

**Objective:** Ensure all required translation keys are present in the namespace

**Action:**
Verify the following keys exist in `/messages/en.json` under the `dashboard` namespace:
- `dashboard.welcome`
- `dashboard.subtitle`
- `dashboard.empty.newUserWelcome`
- `dashboard.empty.newUserDescription`
- `dashboard.empty.newUserAction`
- `dashboard.messages.propertyCreated`

If any keys are missing from REQ-E02-049 implementation, add them.

---

## 4. Authorized Files and Functions for Modification

### 4.1 Primary File for Modification

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/src/app/dashboard2/page.tsx` | MODIFY | Add useTranslations hook and replace hardcoded strings |

### 4.2 Functions/Sections to Modify

| Function/Section | Line Range | Modification |
|------------------|------------|--------------|
| Imports | ~1-39 | Add `import { useTranslations } from 'next-intl';` |
| Dashboard2Page function | ~41 | Add `const t = useTranslations('dashboard');` |
| handlePropertyAdded callback | ~113-124 | Replace success message string |
| New user welcome JSX | ~171-179 | Replace EmptyStateCard props |
| Welcome section JSX | ~183-194 | Replace welcome text and subtitle |

### 4.3 Translation File Dependencies

| File Path | Status | Dependency Type |
|-----------|--------|-----------------|
| `/messages/en.json` | Required | Must have `dashboard.*` keys from REQ-E02-049 |
| `/messages/fr.json` | Required | Must have matching `dashboard.*` structure |
| `/messages/es.json` | Required | Must have matching `dashboard.*` structure |
| `/messages/de.json` | Required | Must have matching `dashboard.*` structure |
| `/messages/nl.json` | Required | Must have matching `dashboard.*` structure |
| `/messages/it.json` | Required | Must have matching `dashboard.*` structure |

### 4.4 Scope Boundaries

**In Scope:**
- Adding `useTranslations` import and hook initialization
- Replacing 6 hardcoded strings with translation function calls
- Using variable interpolation for `{name}` placeholder

**Out of Scope:**
- Modifying child components (ActionButtons, DashboardSettingsPopover, etc.)
- Modifying translation file structures (done in REQ-E02-049)
- Modifying modal components (PropertyEditModal, AddPropertyModal)
- Generating translations for non-English languages (Task 2B.7)

---

## 5. Dependencies

### 5.1 Prerequisites

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 Complete | Blocking | Assumed Complete | next-intl setup, IntlProvider |
| REQ-E02-049 Complete | Blocking | Required | Dashboard namespace structure |
| NextIntlClientProvider | Runtime | Available | Wraps app in layout.tsx |

### 5.2 Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 2B.1 (REQ-E02-049) | Create dashboard namespace structure | Provides translation keys |
| 2B.3 | Update dashboard2/layout.tsx | Sibling - also uses dashboard namespace |
| 2B.4 | Update SimpleDashboard components | Child components used in this page |
| 2B.7 | Generate translations | Will translate strings used here |

---

## 6. Acceptance Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| useTranslations hook imported from 'next-intl' | Check imports at top of file |
| Translation hook initialized with 'dashboard' namespace | Check `const t = useTranslations('dashboard')` exists |
| Welcome message uses `t('welcome', { name })` | Grep for welcome message, verify translation call |
| Subtitle uses `t('subtitle')` | Grep for subtitle, verify translation call |
| EmptyStateCard title prop uses translation | Verify `title={t('empty.newUserWelcome')}` |
| EmptyStateCard description prop uses translation | Verify `description={t('empty.newUserDescription')}` |
| EmptyStateCard actionLabel prop uses translation | Verify `actionLabel={t('empty.newUserAction')}` |
| Success message uses translation | Verify `t('messages.propertyCreated')` in handlePropertyAdded |
| No hardcoded user-facing English strings remain | Manual review of component JSX |
| Component renders correctly in English | Visual verification |
| Component renders correctly in other languages | Language switch verification |

---

## 7. Testing Approach

### 7.1 Unit Testing

1. Verify component mounts without errors
2. Verify translation hook is called with correct namespace
3. Verify interpolation works for welcome message with different names

### 7.2 Visual Testing

1. Load dashboard in English - verify all text displays correctly
2. Switch to French - verify translated strings appear
3. Switch to each supported language - verify no missing translation errors
4. Test new user state with empty properties
5. Test returning user state with existing properties

### 7.3 Integration Testing

1. Create a new property - verify success message is translated
2. Verify welcome message includes user's name correctly
3. Test responsive layout to ensure translated text fits

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
| Translation hook not available | Low | High | Verify IntlProvider wraps component tree |
| Variable interpolation fails | Low | Medium | Test with various name values |
| Text overflow with longer translations | Medium | Low | CSS already handles responsive text |
| Build errors | Low | High | Incremental changes, test after each |

---

## 9. Implementation Notes

### 9.1 Hook Initialization Pattern

Following the established pattern from `LogoutButton.tsx`:

```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Dashboard2Page() {
  const t = useTranslations('dashboard');
  // Component body
}
```

### 9.2 Variable Interpolation

The welcome message requires variable interpolation:

```typescript
// Translation key
"welcome": "Welcome back, {name}!"

// Usage
t('welcome', { name: firstName })
```

Note: The variable name in the translation file is `{name}` but the component uses `firstName`. The mapping happens in the `t()` call.

### 9.3 Nested Namespace Access

For nested keys, use dot notation:

```typescript
t('empty.newUserWelcome')  // Accesses dashboard.empty.newUserWelcome
t('messages.propertyCreated')  // Accesses dashboard.messages.propertyCreated
```

### 9.4 EmptyStateCard Props

The EmptyStateCard component accepts string props for `title`, `description`, and `actionLabel`. These are passed as translation function results:

```tsx
<EmptyStateCard
  title={t('empty.newUserWelcome')}
  description={t('empty.newUserDescription')}
  actionLabel={t('empty.newUserAction')}
/>
```

---

## 10. Code Change Summary

### 10.1 Before (Current State)

```typescript
// Line 7 - no next-intl import

// Line 41 - no translation hook

// Line 121
setSuccessMessage('Property created successfully');

// Lines 174-176
<EmptyStateCard
  icon={Home}
  title="Welcome to FAQBNB!"
  description="Get started by adding your first property. Then you can create QR codes to help guests find what they need."
  actionLabel="Add Your First Property"
  ...
/>

// Lines 192-193
<h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
<p className="text-white/80 text-lg">Create and manage your QR code items</p>
```

### 10.2 After (Target State)

```typescript
// Line 7 - add import
import { useTranslations } from 'next-intl';

// Line 42 - add hook
const t = useTranslations('dashboard');

// Line 121
setSuccessMessage(t('messages.propertyCreated'));

// Lines 174-176
<EmptyStateCard
  icon={Home}
  title={t('empty.newUserWelcome')}
  description={t('empty.newUserDescription')}
  actionLabel={t('empty.newUserAction')}
  ...
/>

// Lines 192-193
<h1 className="text-3xl font-bold mb-2">{t('welcome', { name: firstName })}</h1>
<p className="text-white/80 text-lg">{t('subtitle')}</p>
```

---

## 11. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-E02-049: Dashboard Namespace Structure](/docs/REQ-E02-049-create-dashboard-namespace-structure-overview.md)
- [LogoutButton.tsx - Translation Pattern Reference](/src/components/LogoutButton.tsx)
- [next-intl useTranslations Hook](https://next-intl-docs.vercel.app/docs/usage/messages#usetranslations)
- [ICU Message Format Variables](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2B: Dashboard & Navigation*
