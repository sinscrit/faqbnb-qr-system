# REQ-310: Implementation Breakdown - Extract Loading State Messages for Internationalization

**Document Generated:** 2026-01-18T17:30:00
**Last Modified:** 2026-01-18T17:30:00
**Request Reference:** `/docs/gen_requests_epic2.md` - Request #310
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.7

---

## Overview

This document provides a technical implementation breakdown for extracting all hardcoded loading state messages from components across the application and replacing them with translation keys using the next-intl translation system. Loading state messages provide feedback to users during asynchronous operations and must be internationalized to support non-English users.

### Task Context from Implementation Plan

| Attribute | Value |
|-----------|-------|
| Sub-Epic | 2H - Common & Shared Components |
| Task ID | 2H.7 |
| Task Title | Extract loading state messages |
| Dependencies | Task 2H.1 (Create common namespace structure) |
| Estimated Strings | ~30 |
| Priority | Part of first sub-epic (foundation) |

### Scope

- Identify all hardcoded loading state messages across the codebase
- Add loading-related translation keys to the `common.status` namespace in `/messages/en.json`
- Update loading components to use `useTranslations` hook
- Update pages/components that display loading messages to use translation functions
- Maintain existing ARIA accessibility attributes with translated content

---

## Technical Context

### Existing Stack (from Implementation Plan)

| Technology | Version/Details |
|------------|-----------------|
| Framework | Next.js 15.5.9 with App Router |
| React | 19.1.0 |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x |
| i18n Framework | next-intl (from Epic 1) |
| Icons | Lucide React 0.525.0 |

### Dependencies from Epic 1

| Dependency | Location | Purpose |
|------------|----------|---------|
| next-intl package | `package.json` | i18n framework |
| IntlProvider | `/src/app/layout.tsx` | Provider wrapper |
| Translation files | `/messages/*.json` | Translation storage |
| useTranslations hook | next-intl | Client component translations |
| getTranslations | next-intl/server | Server component translations |

### Existing Loading Components

| Component | Location | Current Behavior |
|-----------|----------|------------------|
| LoadingState | `/src/components/ItemManager/components/shared/LoadingState.tsx` | Hardcoded ARIA label "Loading items" and sr-only text |
| LoadingIndicator | `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Configurable `label` prop (default: "Loading") |
| SkeletonBase | `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | Configurable `label` prop (default: "Loading content") |

---

## Current State Analysis

### Loading Messages Inventory

The following hardcoded loading messages have been identified across the codebase:

#### Loading State Components

| File | Current Message | Context |
|------|-----------------|---------|
| `LoadingState.tsx` | `"Loading items"` | ARIA label |
| `LoadingState.tsx` | `"Loading items, please wait..."` | Screen reader text |
| `LoadingIndicator.tsx` | `"Loading"` | Default label prop |
| `SkeletonBase.tsx` | `"Loading content"` | Default label prop |
| `SkeletonBase.tsx` | `"{label}, please wait..."` | Screen reader text pattern |

#### Page and Component Loading Messages

| File | Current Message | Context |
|------|-----------------|---------|
| `ItemForm.tsx` | `"Saving..."` | Save button loading state |
| `PropertySelector.tsx` | `"Loading properties..."` | Property dropdown loading |
| `AuthGuard.tsx` | `"Authenticating..."` | Auth verification |
| `AuthGuard.tsx` | `"Please wait while we verify your credentials"` | Auth description |
| `MailingListSignup.tsx` | `"Subscribing..."` | Subscription button |
| `UrlInputStep.tsx` | `"Fetching preview..."` | URL preview fetch |
| `InstructionEditor.tsx` | `"Saving..."` | Save button |
| `ItemsManagement.tsx` | `"Loading properties..."` | Properties dropdown |
| `PropertySection.tsx` | `"Loading properties"` | SkeletonBase label |
| `StatisticsCards.tsx` | `"Loading statistics"` | SkeletonBase label |
| `PortfolioSummary.tsx` | `"Loading portfolio summary"` | SkeletonBase label |
| `login/page.tsx` | `"Loading login page..."` | Suspense fallback |
| `LoginPageContent.tsx` | `"Completing authentication..."` | Auth completion |
| `LoginPageContent.tsx` | `"Loading authentication..."` | Auth loading |
| `register/page.tsx` | `"Loading registration page..."` | Suspense fallback |
| `RegistrationPageContent.tsx` | `"Please wait while we set up your account."` | Account setup |
| `dashboard2/print/page.tsx` | `"Loading properties..."` | Print page loading |
| `dashboard2/print/[propertyId]/page.tsx` | `"Loading..."` | Generic loading |
| `admin/items/[publicId]/edit/page.tsx` | `"Loading item..."` | Item edit page |
| `admin/items/[publicId]/edit/page.tsx` | `"Loading properties..."` | Properties loading |
| `admin/properties/[propertyId]/page.tsx` | `"Loading..."` | QR print loading |
| `DashboardLayout.tsx` | `"Loading permissions..."` | Permission check |
| `DashboardLayout.tsx` | `"Loading dashboard..."` | Dashboard loading |

---

## Translation Namespace Structure

### Proposed `common.status` Namespace for Loading Messages

```json
{
  "common": {
    "status": {
      "loading": "Loading...",
      "loadingGeneric": "Loading",
      "loadingContent": "Loading content",
      "loadingPleaseWait": "{label}, please wait...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "processing": "Processing...",
      "authenticating": "Authenticating...",
      "subscribing": "Subscribing...",
      "fetchingPreview": "Fetching preview...",
      "loadingItems": "Loading items",
      "loadingItemsPleaseWait": "Loading items, please wait...",
      "loadingProperties": "Loading properties...",
      "loadingStatistics": "Loading statistics",
      "loadingPortfolioSummary": "Loading portfolio summary",
      "loadingLoginPage": "Loading login page...",
      "loadingRegistrationPage": "Loading registration page...",
      "loadingDashboard": "Loading dashboard...",
      "loadingPermissions": "Loading permissions...",
      "loadingItem": "Loading item...",
      "completingAuthentication": "Completing authentication...",
      "loadingAuthentication": "Loading authentication...",
      "settingUpAccount": "Please wait while we set up your account.",
      "verifyingCredentials": "Please wait while we verify your credentials"
    }
  }
}
```

---

## Implementation Tasks

### Task 2H.7.1: Add Loading Keys to Translation File

**File:** `/messages/en.json`

**Action:** Add the `common.status` section with all loading-related translation keys.

**Requirements:**
- Follow existing namespace conventions
- Use consistent key naming pattern: `loading{Resource}` for specific resources
- Support ICU message format for parameterized messages
- Ensure keys are organized alphabetically within the section

---

### Task 2H.7.2: Update LoadingState Component

**File:** `/src/components/ItemManager/components/shared/LoadingState.tsx`

**Current Code:**
```tsx
<div
  role="status"
  aria-label="Loading items"
  aria-busy="true"
  className={cn('animate-pulse space-y-2', className)}
>
  <span className="sr-only">Loading items, please wait...</span>
  ...
</div>
```

**Updated Code:**
```tsx
import { useTranslations } from 'next-intl';

export function LoadingState({
  viewMode = 'grid',
  itemCount,
  className,
}: LoadingStateProps) {
  const t = useTranslations('common.status');
  const count = itemCount ?? (viewMode === 'grid' ? DEFAULT_GRID_COUNT : DEFAULT_LIST_COUNT);

  return (
    <div
      role="status"
      aria-label={t('loadingItems')}
      aria-busy="true"
      className={cn('animate-pulse space-y-2', className)}
    >
      <span className="sr-only">{t('loadingItemsPleaseWait')}</span>
      ...
    </div>
  );
}
```

---

### Task 2H.7.3: Update LoadingIndicator Component

**File:** `/src/components/SimpleDashboard/LoadingIndicator.tsx`

**Current Code:**
```tsx
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  ...
  return (
    <span role="status" aria-label={label} ...>
      <span className="sr-only">{label}</span>
    </span>
  );
}
```

**Updated Code:**
```tsx
import { useTranslations } from 'next-intl';

export interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  /** Translation key for the loading label, or custom string */
  labelKey?: string;
  /** Direct label override (for backwards compatibility) */
  label?: string;
  color?: 'brand' | 'white' | 'muted';
  className?: string;
}

export function LoadingIndicator({
  size = 'md',
  labelKey,
  label,
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  const t = useTranslations('common.status');
  const displayLabel = label ?? (labelKey ? t(labelKey) : t('loadingGeneric'));
  ...
}
```

---

### Task 2H.7.4: Update SkeletonBase Component

**File:** `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx`

**Current Code:**
```tsx
export function SkeletonBase({
  children,
  label = 'Loading content',
  className,
}: SkeletonBaseProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} ...>
      <span className="sr-only">{label}, please wait...</span>
      {children}
    </div>
  );
}
```

**Updated Code:**
```tsx
import { useTranslations } from 'next-intl';

export interface SkeletonBaseProps {
  children: React.ReactNode;
  /** Translation key for the loading label */
  labelKey?: string;
  /** Direct label override (for backwards compatibility) */
  label?: string;
  className?: string;
}

export function SkeletonBase({
  children,
  labelKey,
  label,
  className,
}: SkeletonBaseProps) {
  const t = useTranslations('common.status');
  const displayLabel = label ?? (labelKey ? t(labelKey) : t('loadingContent'));

  return (
    <div role="status" aria-busy="true" aria-label={displayLabel} ...>
      <span className="sr-only">{t('loadingPleaseWait', { label: displayLabel })}</span>
      {children}
    </div>
  );
}
```

---

### Task 2H.7.5: Update SimpleDashboard Components

**Files to Update:**
- `/src/components/SimpleDashboard/PropertySection.tsx`
- `/src/components/SimpleDashboard/StatisticsCards.tsx`
- `/src/components/SimpleDashboard/PortfolioSummary.tsx`

**Pattern:**
```tsx
// Before
<SkeletonBase label="Loading properties">

// After
<SkeletonBase labelKey="loadingProperties">
```

---

### Task 2H.7.6: Update Form and Button Loading States

**Files to Update:**
- `/src/components/ItemForm.tsx` - "Saving..."
- `/src/components/InstructionEditor/InstructionEditor.tsx` - "Saving..."
- `/src/components/MailingListSignup.tsx` - "Subscribing..."
- `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` - "Fetching preview..."

**Pattern:**
```tsx
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common.status');

  return (
    <button disabled={loading}>
      {loading ? t('saving') : t('save')}
    </button>
  );
}
```

---

### Task 2H.7.7: Update Authentication Loading States

**Files to Update:**
- `/src/components/AuthGuard.tsx`
- `/src/app/login/LoginPageContent.tsx`
- `/src/app/register/RegistrationPageContent.tsx`

**Pattern:**
```tsx
import { useTranslations } from 'next-intl';

function AuthGuard() {
  const t = useTranslations('common.status');

  if (loading) {
    return (
      <div>
        <LoadingSpinner />
        <p>{t('authenticating')}</p>
        <p>{t('verifyingCredentials')}</p>
      </div>
    );
  }
}
```

---

### Task 2H.7.8: Update Page Suspense Fallbacks

**Files to Update:**
- `/src/app/login/page.tsx`
- `/src/app/register/page.tsx`

**Pattern:**
```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common.status');

  return (
    <Suspense fallback={<div>{t('loadingLoginPage')}</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
```

---

### Task 2H.7.9: Update Dashboard and Admin Loading States

**Files to Update:**
- `/src/app/dashboard2/print/page.tsx`
- `/src/app/dashboard2/print/[propertyId]/page.tsx`
- `/src/app/admin/items/[publicId]/edit/page.tsx`
- `/src/app/admin/properties/[propertyId]/page.tsx`
- `/src/app/dashboard2/DashboardLayout.tsx` (or similar layout component)

---

### Task 2H.7.10: Update Property and Item Selectors

**Files to Update:**
- `/src/components/PropertySelector.tsx`
- `/src/components/ItemsManagement.tsx`

---

## Authorized Files and Functions for Modification

### Translation Files

| File Path | Action |
|-----------|--------|
| `/messages/en.json` | Add `common.status` namespace with loading keys |
| `/messages/fr.json` | Add French translations for loading keys |
| `/messages/es.json` | Add Spanish translations for loading keys |
| `/messages/de.json` | Add German translations for loading keys |
| `/messages/nl.json` | Add Dutch translations for loading keys |
| `/messages/it.json` | Add Italian translations for loading keys |

### Loading State Components

| File Path | Modification |
|-----------|--------------|
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | Add useTranslations hook, replace hardcoded strings |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Add useTranslations hook, add labelKey prop |
| `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | Add useTranslations hook, add labelKey prop |

### SimpleDashboard Components

| File Path | Modification |
|-----------|--------------|
| `/src/components/SimpleDashboard/PropertySection.tsx` | Update SkeletonBase label to use labelKey |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Update SkeletonBase label to use labelKey |
| `/src/components/SimpleDashboard/PortfolioSummary.tsx` | Update SkeletonBase label to use labelKey |

### Form Components

| File Path | Modification |
|-----------|--------------|
| `/src/components/ItemForm.tsx` | Replace "Saving..." with translation |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Replace "Saving..." with translation |
| `/src/components/MailingListSignup.tsx` | Replace "Subscribing..." with translation |
| `/src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Replace "Fetching preview..." with translation |

### Authentication Components

| File Path | Modification |
|-----------|--------------|
| `/src/components/AuthGuard.tsx` | Replace auth loading messages with translations |
| `/src/app/login/page.tsx` | Replace Suspense fallback with translation |
| `/src/app/login/LoginPageContent.tsx` | Replace auth state messages with translations |
| `/src/app/register/page.tsx` | Replace Suspense fallback with translation |
| `/src/app/register/RegistrationPageContent.tsx` | Replace account setup message with translation |

### Dashboard and Admin Pages

| File Path | Modification |
|-----------|--------------|
| `/src/app/dashboard2/print/page.tsx` | Replace loading message with translation |
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | Replace loading message with translation |
| `/src/app/admin/items/[publicId]/edit/page.tsx` | Replace loading messages with translations |
| `/src/app/admin/properties/[propertyId]/page.tsx` | Replace loading message with translation |
| `/src/app/dashboard2/layout.tsx` (or DashboardLayout) | Replace permission/dashboard loading with translations |

### Selector Components

| File Path | Modification |
|-----------|--------------|
| `/src/components/PropertySelector.tsx` | Replace "Loading properties..." with translation |
| `/src/components/ItemsManagement.tsx` | Replace "Loading properties..." with translation |

---

## Integration Contract

### Translation Pattern - Client Components

```typescript
// Client component pattern
import { useTranslations } from 'next-intl';

function LoadingComponent() {
  const t = useTranslations('common.status');

  return (
    <div role="status" aria-label={t('loadingItems')}>
      <span className="sr-only">{t('loadingItemsPleaseWait')}</span>
      {/* Skeleton content */}
    </div>
  );
}
```

### Translation Pattern - Server Components

```typescript
// Server component pattern
import { getTranslations } from 'next-intl/server';

async function ServerLoadingComponent() {
  const t = await getTranslations('common.status');

  return <div>{t('loading')}</div>;
}
```

### Translation Pattern - Parameterized Messages

```json
{
  "loadingPleaseWait": "{label}, please wait..."
}
```

```typescript
t('loadingPleaseWait', { label: 'Loading items' })
// Output: "Loading items, please wait..."
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| All loading state messages identified and catalogued | Inventory section documents 23+ loading messages |
| Generic loading messages extracted to common namespace | `common.status` namespace with standardized keys |
| Operation-specific loading messages use translation keys | Context-specific keys like `loadingProperties`, `saving` |
| Common loading scenarios share consistent keys | Reusable keys: `loading`, `saving`, `loadingGeneric` |
| Translation files include dedicated loading section | `common.status` namespace in all 6 language files |
| Loading messages maintain brevity and clarity | Concise messages matching original text |
| All loading state functionality unchanged | Only text replaced, behavior preserved |
| Components use shared translation keys | Common keys for identical scenarios |
| Dynamic parameters supported | ICU format for `loadingPleaseWait` |

---

## Testing Considerations

### Manual Testing Checklist

- [ ] LoadingState displays translated ARIA label
- [ ] LoadingState screen reader text is translated
- [ ] LoadingIndicator displays translated label
- [ ] SkeletonBase displays translated label and screen reader text
- [ ] PropertySection skeleton shows translated loading message
- [ ] StatisticsCards skeleton shows translated loading message
- [ ] PortfolioSummary skeleton shows translated loading message
- [ ] ItemForm save button shows translated "Saving..." when loading
- [ ] AuthGuard shows translated authentication messages
- [ ] Login page suspense fallback is translated
- [ ] Register page suspense fallback is translated
- [ ] Dashboard loading states are translated
- [ ] Print page loading messages are translated
- [ ] All loading messages appear correctly in all 6 languages

### Accessibility Testing

- [ ] Screen readers announce loading states correctly in each language
- [ ] ARIA labels are properly translated
- [ ] `aria-busy="true"` attribute preserved on all loading containers
- [ ] `role="status"` attribute preserved for live regions

---

## Dependencies

### Internal Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Task 2H.1 - Common namespace structure | Must be complete | Translation file structure |
| Epic 1 - next-intl setup | Must be complete | useTranslations hook availability |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| next-intl | (from Epic 1) | Translation hooks and functions |
| lucide-react | 0.525.0 | Loader2 icon in LoadingIndicator |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing loading messages in audit | Medium | Low | Grep search for "Loading", "Saving", "Please wait" patterns |
| ARIA accessibility regression | Low | High | Verify aria-label translations work with screen readers |
| Server vs Client component mismatch | Medium | Medium | Verify component type before choosing hook vs getTranslations |
| Key naming conflicts | Low | Low | Follow established naming conventions strictly |

---

## References

- Request: `/docs/gen_requests_epic2.md` - Request #310
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Existing Loading Components:
  - `/src/components/ItemManager/components/shared/LoadingState.tsx`
  - `/src/components/SimpleDashboard/LoadingIndicator.tsx`
  - `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx`
- next-intl Documentation: https://next-intl-docs.vercel.app/

---

*End of Document*
