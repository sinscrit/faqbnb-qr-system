# REQ-E02-027: Extract Loading State Messages - Implementation Overview

*Generated: 2026-01-20 18:15:00 UTC*
*Last Modified: 2026-01-20 18:15:00 UTC*

## Reference

- **Request**: REQ-E02-027 (per pipeline numbering) / REQ-E02-007 (per gen_requests_epic2.md Task 2H.7)
- **Source**: docs/gen_requests_epic2.md - Request #7 (Task 2H.7)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.7
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-001 (Common Namespace Structure - must be completed first)

## Summary

Extract all hardcoded loading state messages displayed during data fetching, processing, or content loading. Replace them with references to localized translation keys from the i18n `common.loading` namespace. This task affects approximately 40+ locations across various components where loading messages, spinner text, skeleton placeholder labels, and processing status messages are displayed.

**Estimated Scope:**
- ~35 component/page files to modify
- ~30 distinct loading state strings
- ~30 new translation keys needed
- Categories: Generic, Authentication, Pages, Components, Media, Data Processing, ARIA labels

## Goals

1. Identify and catalog all loading state messages across the codebase (~40 locations)
2. Extract all hardcoded loading strings to the `common.loading` namespace
3. Replace hardcoded strings with `useTranslations()` hook references
4. Ensure loading states display translated text based on user's language preference
5. Maintain accessibility features (ARIA labels, screen reader text) with translated content
6. Follow consistent naming conventions for translation keys
7. Update reusable loading components to support translations

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed (v4.7.0) |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |
| Language detection | `/src/lib/i18n/language-detection.ts` | Configured |

### Existing Common Namespace

The `/messages/en.json` file contains a basic `common.loading` key:
```json
{
  "common": {
    "loading": "Loading..."
  }
}
```

This task expands this into a full `common.loading` sub-namespace with context-specific loading messages.

## Current Loading State Patterns in Codebase

### Pattern Analysis

The codebase uses four primary patterns for displaying loading states:

#### Pattern 1: Reusable LoadingIndicator Component

Location: `/src/components/SimpleDashboard/LoadingIndicator.tsx`

```tsx
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',  // <-- Default hardcoded label
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  return (
    <span role="status" aria-label={label}>
      <Loader2 className="animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
```

#### Pattern 2: LoadingState Component (ItemManager)

Location: `/src/components/ItemManager/components/shared/LoadingState.tsx`

```tsx
<div
  role="status"
  aria-label="Loading items"  // <-- Hardcoded aria-label
  aria-busy="true"
>
  <span className="sr-only">Loading items, please wait...</span>  // <-- Hardcoded sr text
  {/* Skeleton cards */}
</div>
```

#### Pattern 3: Inline Spinner with Message

```tsx
// Example: src/app/dashboard2/layout.tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
<p className="text-gray-600">Loading...</p>  // <-- Hardcoded message
```

#### Pattern 4: Button Loading State

```tsx
// Example: various form components
<button disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}  // <-- Hardcoded loading text
</button>
```

### Current Loading State Message Inventory

#### Generic Loading Messages (~8 strings)

| Location | Message |
|----------|---------|
| `/src/components/SimpleDashboard/LoadingIndicator.tsx:63` | "Loading" (default label) |
| `/src/components/ItemManager/components/shared/LoadingState.tsx:111,129` | "Loading items" (aria-label) |
| `/src/components/ItemManager/components/shared/LoadingState.tsx:116,138` | "Loading items, please wait..." (sr-only) |
| Various pages | "Loading..." (generic fallback) |

#### Page Loading Messages (~15 strings)

| Location | Message |
|----------|---------|
| `/src/app/user/analytics/page.tsx:30` | "Loading..." |
| `/src/app/user/page.tsx:30` | "Loading..." |
| `/src/app/register/complete/page.tsx:20` | "Loading..." |
| `/src/app/dashboard2/help/page.tsx:331` | "Loading..." |
| `/src/app/dashboard/instructions/page.tsx:35` | "Loading..." |
| `/src/app/admin/analytics/page.tsx:30` | "Loading..." |
| `/src/app/admin/page.tsx:30` | "Loading..." |
| `/src/app/dashboard2/layout.tsx:110` | "Loading..." |
| `/src/app/dashboard/properties/[propertyId]/page.tsx:282` | "Loading..." |
| `/src/app/admin/properties/[propertyId]/page.tsx:471` | "Loading..." |
| `/src/app/dashboard2/print/[propertyId]/page.tsx:18,109` | "Loading..." |

#### Processing/Status Messages (~12 strings)

| Location | Message |
|----------|---------|
| `/src/components/PropertyForm.tsx:279` | "Updating...", "Creating..." |
| `/src/app/request-access/page.tsx:186` | "Submitting..." |
| `/src/components/InstructionEditor/InstructionEditor.tsx:258` | "Saving..." |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx:326` | "Saving..." |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx:271` | "Deleting..." |
| `/src/components/dashboard/DeleteItemDialog.tsx:148` | "Deleting..." |
| `/src/components/PropertiesManagement.tsx:562` | "Deleting..." |
| `/src/components/ItemForm.tsx:507` | "Saving..." |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx:550` | "Saving..." |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx:526` | "Creating..." |
| `/src/components/ItemCapture/editors/ImageRotator.tsx:496` | "Applying..." |
| `/src/components/ItemCapture/editors/ImageCropper.tsx:486` | "Applying..." |

#### Media Loading Messages (~4 strings)

| Location | Message |
|----------|---------|
| Media editors | "Loading video...", "Loading image...", "Loading PDF..." |
| `/src/components/ItemCapture/editors/ImageRotator.tsx:355` | "Processing rotation..." |

#### Authentication Loading Messages (~6 strings)

| Location | Message |
|----------|---------|
| `/src/components/AuthGuard.tsx:24` | "Authenticating..." |
| `/src/components/AuthGuard.tsx:30` | "Please wait while we verify your credentials" |
| Various auth flows | "Checking permissions..." |

#### ARIA Accessibility Labels (~8 strings)

| Location | Message |
|----------|---------|
| Various components | "Loading items", "Loading guides", "Loading editor" |
| Screen reader text | "Loading items, please wait..." |

## Translation Namespace Structure

### Namespace: `common.loading`

```json
{
  "common": {
    "loading": {
      "generic": {
        "loading": "Loading...",
        "pleaseWait": "Please wait...",
        "loadingData": "Loading data...",
        "processing": "Processing..."
      },
      "pages": {
        "dashboard": "Loading dashboard...",
        "adminPanel": "Loading admin panel...",
        "analytics": "Loading analytics...",
        "item": "Loading item...",
        "property": "Loading property..."
      },
      "components": {
        "items": "Loading items...",
        "properties": "Loading properties...",
        "guides": "Loading guides...",
        "qrCodes": "Loading QR codes..."
      },
      "media": {
        "video": "Loading video...",
        "image": "Loading image...",
        "pdf": "Loading PDF...",
        "preview": "Loading preview..."
      },
      "auth": {
        "authenticating": "Authenticating...",
        "checkingPermissions": "Checking permissions...",
        "verifyingCredentials": "Please wait while we verify your credentials",
        "completingAuth": "Completing authentication..."
      },
      "oauth": {
        "connectingGoogle": "Connecting to Google...",
        "completingGoogleSignIn": "Completing Google sign-in..."
      },
      "aria": {
        "loadingItems": "Loading items",
        "loadingItemsWait": "Loading items, please wait...",
        "loadingGuides": "Loading guides",
        "loadingEditor": "Loading editor",
        "loadingContentPreview": "Loading content preview"
      },
      "status": {
        "saving": "Saving...",
        "deleting": "Deleting...",
        "creating": "Creating...",
        "updating": "Updating...",
        "submitting": "Submitting...",
        "applying": "Applying...",
        "uploading": "Uploading...",
        "downloading": "Downloading...",
        "fetching": "Fetching data...",
        "processingRotation": "Processing rotation..."
      }
    }
  }
}
```

## Implementation Order

### Step 1: Expand Loading Namespace (Priority: High)

Expand the existing `common.loading` string in `/messages/en.json` into the full namespace structure.

### Step 2: Update Reusable Loading Components (Priority: High)

1. **`/src/components/SimpleDashboard/LoadingIndicator.tsx`**
2. **`/src/components/ItemManager/components/shared/LoadingState.tsx`**

### Step 3: Update Layout/Page Loading States (Priority: High)

3. **`/src/app/dashboard2/layout.tsx`**
4. **`/src/app/user/page.tsx`**
5. **`/src/app/admin/page.tsx`**
6. **`/src/app/dashboard2/help/page.tsx`**
7. **`/src/app/register/complete/page.tsx`**

### Step 4: Update Component Loading States (Priority: Medium)

8. **`/src/app/dashboard/properties/[propertyId]/page.tsx`**
9. **`/src/app/admin/properties/[propertyId]/page.tsx`**
10. **`/src/app/dashboard2/print/[propertyId]/page.tsx`**
11. **`/src/app/dashboard/instructions/page.tsx`**

### Step 5: Update Status Messages (Priority: Medium)

12. **`/src/components/PropertyForm.tsx`** - "Updating...", "Creating..."
13. **`/src/components/InstructionEditor/InstructionEditor.tsx`** - "Saving..."
14. **`/src/app/dashboard2/items/[publicId]/edit/page.tsx`** - "Saving..."
15. **`/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`** - "Deleting..."
16. **`/src/components/dashboard/DeleteItemDialog.tsx`** - "Deleting..."
17. **`/src/components/PropertiesManagement.tsx`** - "Deleting..."
18. **`/src/components/ItemForm.tsx`** - "Saving..."
19. **`/src/components/SimpleDashboard/PropertyEditModal.tsx`** - "Saving..."
20. **`/src/components/SimpleDashboard/AddPropertyModal.tsx`** - "Creating..."
21. **`/src/app/request-access/page.tsx`** - "Submitting..."

### Step 6: Update Media Editor Messages (Priority: Medium)

22. **`/src/components/ItemCapture/editors/ImageRotator.tsx`** - "Applying...", "Processing rotation..."
23. **`/src/components/ItemCapture/editors/ImageCropper.tsx`** - "Applying..."

### Step 7: Update Authentication Components (Priority: Medium)

24. **`/src/components/AuthGuard.tsx`** - All authentication loading messages

## Authorized Files and Functions for Modification

### Translation Files to Modify

| File | Purpose | Modification |
|------|---------|--------------|
| `/messages/en.json` | English translations | Expand `common.loading` to full namespace |
| `/messages/fr.json` | French translations | Add same keys (translations in Task 2H.10) |
| `/messages/es.json` | Spanish translations | Add same keys (translations in Task 2H.10) |
| `/messages/de.json` | German translations | Add same keys (translations in Task 2H.10) |
| `/messages/nl.json` | Dutch translations | Add same keys (translations in Task 2H.10) |
| `/messages/it.json` | Italian translations | Add same keys (translations in Task 2H.10) |

### Reusable Loading Components

| File | Modifications |
|------|---------------|
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Add `useTranslations('common.loading')` hook; update default `label` prop to use `t('generic.loading')` |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | Add `useTranslations('common.loading')` hook; replace `aria-label` and sr-only text with translated strings |

### Layout/Page Components

| File | Modifications |
|------|---------------|
| `/src/app/dashboard2/layout.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/user/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/user/analytics/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/admin/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/admin/analytics/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/dashboard2/help/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/register/complete/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/dashboard/instructions/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/dashboard/properties/[propertyId]/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/admin/properties/[propertyId]/page.tsx` | Replace "Loading..." with `t('generic.loading')` |
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | Replace "Loading..." with `t('generic.loading')` |

### Form/Modal Components with Status Messages

| File | Modifications |
|------|---------------|
| `/src/components/PropertyForm.tsx` | Replace "Updating...", "Creating..." with `t('status.updating')`, `t('status.creating')` |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Replace "Saving..." with `t('status.saving')` |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Replace "Saving..." with `t('status.saving')` |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Replace "Deleting..." with `t('status.deleting')` |
| `/src/components/dashboard/DeleteItemDialog.tsx` | Replace "Deleting..." with `t('status.deleting')` |
| `/src/components/PropertiesManagement.tsx` | Replace "Deleting..." with `t('status.deleting')` |
| `/src/components/ItemForm.tsx` | Replace "Saving..." with `t('status.saving')` |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Replace "Saving..." with `t('status.saving')` |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Replace "Creating..." with `t('status.creating')` |
| `/src/app/request-access/page.tsx` | Replace "Submitting..." with `t('status.submitting')` |

### Media Editor Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | Replace "Applying...", "Processing rotation..." with translated strings |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Replace "Applying..." with `t('status.applying')` |

### Authentication Components

| File | Modifications |
|------|---------------|
| `/src/components/AuthGuard.tsx` | Replace "Authenticating...", "Please wait while we verify your credentials", "Checking permissions..." with translated strings |

### Files NOT to Modify

- Console.log messages (for developers only, not user-facing)
- Test files (`__tests__/*.tsx`, `/src/app/test/**`) - Testing handled separately
- API route files (`/src/app/api/*`) - Server-side, different translation approach
- Comments and documentation strings

## Technical Specifications

### Import Pattern for Client Components

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const tLoading = useTranslations('common.loading');

  if (isLoading) {
    return <div>{tLoading('generic.loading')}</div>;
  }

  return <div>Content</div>;
}
```

### LoadingIndicator Component Update Pattern

```tsx
// Before
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',  // Hardcoded default
  ...
}) {
  return <span className="sr-only">{label}</span>;
}

// After
import { useTranslations } from 'next-intl';

export function LoadingIndicator({
  size = 'md',
  label,  // Now optional
  ...
}) {
  const tLoading = useTranslations('common.loading');
  const effectiveLabel = label ?? tLoading('generic.loading');

  return <span className="sr-only">{effectiveLabel}</span>;
}
```

### Button Loading State Pattern

```tsx
// Before
<button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>

// After
<button disabled={loading}>
  {loading ? tLoading('status.saving') : tCommon('save')}
</button>
```

## Translation Key Naming Convention

Following Plan-111 convention:
```
common.loading.{category}.{variant}
```

### Categories:
- `generic` - Reusable generic loading messages
- `pages` - Page-specific loading messages
- `components` - Component-specific loading messages
- `media` - Media file loading messages
- `auth` - Authentication loading messages
- `oauth` - OAuth/external service loading messages
- `aria` - ARIA accessibility labels
- `status` - Status update messages (saving, deleting, etc.)

## Success Validation Checklist

### Code Validation
- [ ] All ~40 loading state locations have been identified and updated
- [ ] Each updated component imports `useTranslations` from 'next-intl'
- [ ] No hardcoded English loading text remains in modified components
- [ ] ARIA labels use translated content
- [ ] Screen reader text uses translated content

### Translation File Validation
- [ ] `/messages/en.json` contains complete `common.loading` namespace
- [ ] All 6 language files have identical key structures
- [ ] No duplicate keys within namespaces

### Functional Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Loading messages display correct translated text
- [ ] LoadingIndicator component uses translated default label
- [ ] LoadingState component uses translated aria-labels
- [ ] Page loading states display translated messages
- [ ] Loading states display translated text when locale is changed
- [ ] No console warnings about missing translation keys

### Accessibility Validation
- [ ] ARIA labels include translated content
- [ ] Screen readers correctly announce loading state content
- [ ] role="status" maintains proper behavior with translations
- [ ] aria-busy="true" continues to work correctly

## Dependencies

### Required (Already Completed)
- Epic 1: next-intl foundation must be in place
- REQ-E02-001: Common Namespace Structure must be complete

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2H.6 (Empty States): Some overlap with loading/empty state patterns
- Task 2H.5 (Toast Notifications): May share some status messages

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Straightforward string replacement in most cases
  - Two main reusable components cover many locations
  - No complex ICU format needed (no pluralization or interpolation)
  - Clear patterns established

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing loading state locations | Medium | Low | Use grep patterns to find all loading messages |
| Component already has useTranslations | Medium | Low | Check for existing imports, use aliased hook name (tLoading) |
| Server component needs translation | Low | Medium | Use getTranslations from next-intl/server |
| Default prop handling | Low | Low | Use null coalescing for defaults |

## Search Patterns for Discovery

Use these patterns to find all loading state locations:

```bash
# Find "Loading..." text patterns
grep -rn "Loading\.\.\." --include="*.tsx" src/ | grep -v test | grep -v console

# Find status messages
grep -rn "Saving\.\.\.|Deleting\.\.\.|Creating\.\.\.|Updating\.\.\." --include="*.tsx" src/

# Find "loading" in aria-label
grep -rn "aria-label=\"[Ll]oading" --include="*.tsx" src/

# Find "Please wait" patterns
grep -rn "Please wait\|please wait" --include="*.tsx" src/

# Find LoadingIndicator usage
grep -rn "LoadingIndicator\|LoadingState" --include="*.tsx" src/
```

## Estimated Effort

Based on Plan-111, this task is estimated at ~30 strings across ~40 locations. This represents approximately 4% of Sub-Epic 2H's overall ~800 strings. Due to the straightforward nature of the changes and reusable component patterns, this M-sized task should take approximately 0.5-1 day.

---

*End of Implementation Overview*
