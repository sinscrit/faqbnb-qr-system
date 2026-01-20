# REQ-E02-027: Extract Loading State Messages - Detailed Task Breakdown

*Generated: 2026-01-20 19:45:00 UTC*
*Last Modified: 2026-01-20 19:45:00 UTC*

## Reference Documents

- **Overview**: docs/REQ-E02-027-extract-loading-state-messages-overview.md
- **Request Source**: docs/gen_requests_epic2.md - REQ-E02-007 (Task 2H.7)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.7
- **Size**: M (Medium)
- **Estimated Effort**: 4-6 hours

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] REQ-E02-001 (Common Namespace Structure) is complete
- [ ] `/messages/en.json` exists and contains basic `common` namespace
- [ ] `useTranslations` hook is available from next-intl
- [ ] Current branch is ready for modifications

---

## Task Breakdown

### Task 1: Expand Loading Namespace in English Translation File (1 SP)

**File**: `/messages/en.json`

**Current State**:
```json
{
  "common": {
    "loading": "Loading..."
  }
}
```

**Target State**: Expand `common.loading` into a full sub-namespace structure.

#### Steps:

1.1. Open `/messages/en.json`

1.2. Replace the single `common.loading` string with the following nested structure:

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
        "property": "Loading property...",
        "instructions": "Loading instructions...",
        "help": "Loading help...",
        "print": "Loading print view..."
      },
      "auth": {
        "authenticating": "Authenticating...",
        "checkingPermissions": "Checking permissions...",
        "verifyingCredentials": "Please wait while we verify your credentials",
        "completingAuth": "Completing authentication..."
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
      },
      "media": {
        "video": "Loading video...",
        "image": "Loading image...",
        "pdf": "Loading PDF...",
        "preview": "Loading preview..."
      },
      "aria": {
        "loadingItems": "Loading items",
        "loadingItemsWait": "Loading items, please wait...",
        "loadingGuides": "Loading guides",
        "loadingEditor": "Loading editor",
        "loadingContentPreview": "Loading content preview"
      }
    }
  }
}
```

1.3. Verify JSON syntax is valid (no trailing commas, proper nesting)

1.4. Save the file

**Acceptance Criteria**:
- [ ] `common.loading` is now a nested object, not a simple string
- [ ] All categories (generic, pages, auth, status, media, aria) are present
- [ ] JSON is valid and parseable
- [ ] No duplicate keys

---

### Task 2: Add Loading Keys to Non-English Translation Files (1 SP)

**Files**:
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Note**: For this task, add the same English keys as placeholders. Actual translations will be generated in Task 2H.10.

#### Steps:

2.1. For each non-English translation file, add the identical `common.loading` structure from Task 1

2.2. Keep values in English as placeholders (translations come later in Task 2H.10)

2.3. Verify each file has valid JSON syntax

**Acceptance Criteria**:
- [ ] All 6 language files have identical key structure for `common.loading`
- [ ] All files remain valid JSON
- [ ] No missing keys in any language file

---

### Task 3: Update LoadingIndicator Component (1 SP)

**File**: `/src/components/SimpleDashboard/LoadingIndicator.tsx`

**Current Code** (line 60-86):
```tsx
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',  // <-- Hardcoded default
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  // ...
  return (
    <span role="status" aria-label={label}>
      <Loader2 className="animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
```

#### Steps:

3.1. Add import for useTranslations at the top of the file:
```tsx
import { useTranslations } from 'next-intl';
```

3.2. Ensure 'use client' directive is at the top (should already be there or add if missing)

3.3. Update the component to use translations:
```tsx
export function LoadingIndicator({
  size = 'md',
  label,  // Now optional, will use translation as default
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  const t = useTranslations('common.loading');
  const effectiveLabel = label ?? t('generic.loading');

  const sizeClass = sizeStyles[size];
  const colorClass = colorStyles[color];

  return (
    <span
      role="status"
      aria-label={effectiveLabel}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Loader2
        className={cn('animate-spin', sizeClass, colorClass)}
        aria-hidden="true"
      />
      <span className="sr-only">{effectiveLabel}</span>
    </span>
  );
}
```

3.4. Update the interface to make label optional:
```tsx
export interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  label?: string;  // Optional - defaults to translated string
  color?: 'brand' | 'white' | 'muted';
  className?: string;
}
```

3.5. Update JSDoc comment to reflect translation usage

**Acceptance Criteria**:
- [ ] Component imports useTranslations from next-intl
- [ ] Default label uses `t('generic.loading')`
- [ ] Explicit label prop still works when provided
- [ ] Component compiles without errors
- [ ] ARIA label uses translated text

---

### Task 4: Update LoadingState Component (ItemManager) (1 SP)

**File**: `/src/components/ItemManager/components/shared/LoadingState.tsx`

**Current Code** (hardcoded strings at lines 111, 116, 129, 138):
```tsx
<div role="status" aria-label="Loading items" aria-busy="true">
  <span className="sr-only">Loading items, please wait...</span>
```

#### Steps:

4.1. Add import for useTranslations at the top:
```tsx
import { useTranslations } from 'next-intl';
```

4.2. Update the component to use translations:
```tsx
export function LoadingState({
  viewMode = 'grid',
  itemCount,
  className,
}: LoadingStateProps) {
  const t = useTranslations('common.loading');
  const count = itemCount ?? (viewMode === 'grid' ? DEFAULT_GRID_COUNT : DEFAULT_LIST_COUNT);

  if (viewMode === 'list') {
    return (
      <div
        role="status"
        aria-label={t('aria.loadingItems')}
        aria-busy="true"
        className={cn('animate-pulse space-y-2', className)}
      >
        <span className="sr-only">{t('aria.loadingItemsWait')}</span>
        {Array.from({ length: count }).map((_, index) => (
          <ListSkeletonRow key={index} />
        ))}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      role="status"
      aria-label={t('aria.loadingItems')}
      aria-busy="true"
      className={cn(
        'animate-pulse grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      <span className="sr-only">{t('aria.loadingItemsWait')}</span>
      {Array.from({ length: count }).map((_, index) => (
        <GridSkeletonCard key={index} />
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Component imports useTranslations
- [ ] aria-label uses `t('aria.loadingItems')`
- [ ] sr-only text uses `t('aria.loadingItemsWait')`
- [ ] Both grid and list views updated
- [ ] Component compiles without errors

---

### Task 5: Update Dashboard Layout Loading State (1 SP)

**File**: `/src/app/dashboard2/layout.tsx`

**Current Code** (line 110):
```tsx
<p className="text-gray-600 text-lg">Loading...</p>
```

#### Steps:

5.1. Import useTranslations at the top of the file:
```tsx
import { useTranslations } from 'next-intl';
```

5.2. Add hook call inside the component:
```tsx
const t = useTranslations('common.loading');
```

5.3. Replace hardcoded string:
```tsx
<p className="text-gray-600 text-lg">{t('generic.loading')}</p>
```

**Acceptance Criteria**:
- [ ] Import added
- [ ] Hook called in component
- [ ] Hardcoded "Loading..." replaced with translation
- [ ] No build errors

---

### Task 6: Update Page Loading States (1 SP)

**Files to update**:
| File | Line | Current String |
|------|------|----------------|
| `/src/app/user/page.tsx` | 30 | "Loading..." |
| `/src/app/user/analytics/page.tsx` | 30 | "Loading..." |
| `/src/app/admin/page.tsx` | 30 | "Loading..." |
| `/src/app/admin/analytics/page.tsx` | 30 | "Loading..." |
| `/src/app/dashboard2/help/page.tsx` | 331 | "Loading..." |
| `/src/app/register/complete/page.tsx` | 20 | "Loading..." |
| `/src/app/dashboard/instructions/page.tsx` | 35 | "Loading..." |

#### Steps:

For each file:

6.1. Add import at top:
```tsx
import { useTranslations } from 'next-intl';
```

6.2. Add hook call in component (or use `getTranslations` for server components):
```tsx
// Client component
const t = useTranslations('common.loading');

// Server component
const t = await getTranslations('common.loading');
```

6.3. Replace hardcoded "Loading..." with:
```tsx
{t('generic.loading')}
```

**Acceptance Criteria**:
- [ ] All 7 files updated
- [ ] Each file imports translation hook appropriately
- [ ] Each hardcoded "Loading..." replaced
- [ ] All files compile without errors

---

### Task 7: Update Property Page Loading States (1 SP)

**Files to update**:
| File | Line | Current String |
|------|------|----------------|
| `/src/app/dashboard/properties/[propertyId]/page.tsx` | 282 | "Loading..." (in button) |
| `/src/app/admin/properties/[propertyId]/page.tsx` | 471 | "Loading..." (in button) |
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | 18, 109 | "Loading..." |

#### Steps:

For each file, follow the same pattern as Task 6:

7.1. Add useTranslations import
7.2. Add hook call
7.3. Replace hardcoded strings:
   - Line 282/471 buttons: `{isQRPrintLoading ? t('generic.loading') : 'Print QR Codes'}`
   - Print page: Update default message parameter and property name fallback

**Acceptance Criteria**:
- [ ] All 3 files updated
- [ ] Button loading states use translations
- [ ] Print page loading states use translations
- [ ] All files compile without errors

---

### Task 8: Update Status Messages in Form/Modal Components (2 SP)

**Files and strings to update**:

| File | Line | Current | Translation Key |
|------|------|---------|-----------------|
| `/src/components/PropertyForm.tsx` | 279 | "Updating...", "Creating..." | `status.updating`, `status.creating` |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | 258 | "Saving..." | `status.saving` |
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | 326 | "Saving..." | `status.saving` |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | 271 | "Deleting..." | `status.deleting` |
| `/src/components/dashboard/DeleteItemDialog.tsx` | 148 | "Deleting..." | `status.deleting` |
| `/src/components/PropertiesManagement.tsx` | 562 | "Deleting..." | `status.deleting` |
| `/src/components/ItemForm.tsx` | 507 | "Saving..." | `status.saving` |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | 550 | "Saving..." | `status.saving` |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | 526 | "Creating..." | `status.creating` |
| `/src/app/request-access/page.tsx` | 186 | "Submitting..." | `status.submitting` |

#### Steps:

For each file:

8.1. Add useTranslations import (if not already present)
8.2. Add hook call: `const tLoading = useTranslations('common.loading');`
8.3. Replace hardcoded status strings with appropriate translation keys

**Example for PropertyForm.tsx**:
```tsx
// Before
{property ? 'Updating...' : 'Creating...'}

// After
const tLoading = useTranslations('common.loading');
// ...
{property ? tLoading('status.updating') : tLoading('status.creating')}
```

**Acceptance Criteria**:
- [ ] All 10 files updated
- [ ] Each status message uses appropriate translation key
- [ ] Components handle both loading and non-loading states correctly
- [ ] All files compile without errors

---

### Task 9: Update Media Editor Loading Messages (1 SP)

**Files to update**:
| File | Line | Current | Translation Key |
|------|------|---------|-----------------|
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | 496 | "Applying..." | `status.applying` |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | 486 | "Applying..." | `status.applying` |

#### Steps:

9.1. For each file, add useTranslations import
9.2. Add hook call in component
9.3. Replace "Applying..." with `tLoading('status.applying')`

**Acceptance Criteria**:
- [ ] Both files updated
- [ ] "Applying..." replaced with translation
- [ ] Files compile without errors

---

### Task 10: Update AuthGuard Component (1 SP)

**File**: `/src/components/AuthGuard.tsx`

**Current hardcoded strings**:
| Line | String |
|------|--------|
| 24 | "Authenticating..." |
| 30 | "Please wait while we verify your credentials" |
| 159, 314, 361 | "Checking permissions..." |

#### Steps:

10.1. Add useTranslations import at top
10.2. Update LoadingSpinner component:

```tsx
function LoadingSpinner({ message }: { message?: string }) {
  const t = useTranslations('common.loading');
  const displayMessage = message ?? t('auth.authenticating');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="mt-4 text-gray-600">{displayMessage}</p>
      <p className="text-gray-500 text-sm mt-2">{t('auth.verifyingCredentials')}</p>
    </div>
  );
}
```

10.3. Update usages at lines 159, 314, 361:
```tsx
// Before
return fallback || <LoadingSpinner message="Checking permissions..." />;

// After
const t = useTranslations('common.loading');
return fallback || <LoadingSpinner message={t('auth.checkingPermissions')} />;
```

**Acceptance Criteria**:
- [ ] Import added
- [ ] LoadingSpinner uses translations
- [ ] All 3 "Checking permissions..." usages updated
- [ ] Verify credentials message translated
- [ ] Component compiles without errors

---

### Task 11: Update Additional ItemCapture Loading States (1 SP)

**Files to update**:
| File | Current | Translation Key |
|------|---------|-----------------|
| `/src/components/ItemCapture/components/steps/ReviewStep.tsx:744` | "Submitting..." | `status.submitting` |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx:552` | "Saving..." | `status.saving` |
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx:842` | "Saving..." | `status.saving` |
| `/src/components/ItemManager/components/shared/InlineEdit.tsx:401` | "Saving..." (sr-only) | `status.saving` |
| `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx:582` | "Saving..." | `status.saving` |
| `/src/components/ItemCapture/components/shared/PDFPlaceholder.tsx:156` | "Loading..." (sr-only) | `generic.loading` |

#### Steps:

For each file:
11.1. Add useTranslations import
11.2. Add hook call
11.3. Replace hardcoded string with translation key

**Acceptance Criteria**:
- [ ] All 6 files updated
- [ ] Each status message uses appropriate translation key
- [ ] Screen reader text properly translated
- [ ] All files compile without errors

---

### Task 12: Build Verification and Testing (1 SP)

#### Steps:

12.1. Run build command:
```bash
npm run build
```

12.2. Verify no TypeScript errors related to translations

12.3. Run the application locally:
```bash
npm run dev
```

12.4. Manually test loading states in key areas:
- Dashboard loading
- Item list loading (LoadingState component)
- Property form saving/creating
- Delete dialogs
- AuthGuard authentication states

12.5. Check browser console for missing translation key warnings

12.6. Verify screen reader text is properly translated (inspect ARIA labels)

**Acceptance Criteria**:
- [ ] `npm run build` completes without errors
- [ ] No console warnings about missing translation keys
- [ ] Loading states display translated text
- [ ] ARIA labels contain translated content
- [ ] LoadingIndicator default label is translated

---

## Summary Table

| Task | Description | Files | Story Points |
|------|-------------|-------|--------------|
| 1 | Expand Loading Namespace (en.json) | 1 | 1 |
| 2 | Add Keys to Non-English Files | 5 | 1 |
| 3 | Update LoadingIndicator | 1 | 1 |
| 4 | Update LoadingState (ItemManager) | 1 | 1 |
| 5 | Update Dashboard Layout | 1 | 1 |
| 6 | Update Page Loading States | 7 | 1 |
| 7 | Update Property Page Loading States | 3 | 1 |
| 8 | Update Status Messages (Forms/Modals) | 10 | 2 |
| 9 | Update Media Editor Messages | 2 | 1 |
| 10 | Update AuthGuard | 1 | 1 |
| 11 | Update Additional ItemCapture States | 6 | 1 |
| 12 | Build Verification | - | 1 |
| **Total** | | **~38 files** | **13 SP** |

---

## Files Modified Summary

### Translation Files (6 files)
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

### Reusable Loading Components (2 files)
- `/src/components/SimpleDashboard/LoadingIndicator.tsx`
- `/src/components/ItemManager/components/shared/LoadingState.tsx`

### Layout/Page Files (11 files)
- `/src/app/dashboard2/layout.tsx`
- `/src/app/user/page.tsx`
- `/src/app/user/analytics/page.tsx`
- `/src/app/admin/page.tsx`
- `/src/app/admin/analytics/page.tsx`
- `/src/app/dashboard2/help/page.tsx`
- `/src/app/register/complete/page.tsx`
- `/src/app/dashboard/instructions/page.tsx`
- `/src/app/dashboard/properties/[propertyId]/page.tsx`
- `/src/app/admin/properties/[propertyId]/page.tsx`
- `/src/app/dashboard2/print/[propertyId]/page.tsx`

### Form/Modal Components (10 files)
- `/src/components/PropertyForm.tsx`
- `/src/components/InstructionEditor/InstructionEditor.tsx`
- `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- `/src/components/dashboard/DeleteItemDialog.tsx`
- `/src/components/PropertiesManagement.tsx`
- `/src/components/ItemForm.tsx`
- `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- `/src/app/request-access/page.tsx`

### Media Editor Components (2 files)
- `/src/components/ItemCapture/editors/ImageRotator.tsx`
- `/src/components/ItemCapture/editors/ImageCropper.tsx`

### Authentication Component (1 file)
- `/src/components/AuthGuard.tsx`

### Additional Components (6 files)
- `/src/components/ItemCapture/components/steps/ReviewStep.tsx`
- `/src/components/ItemCapture/components/steps/TextEditorStep.tsx`
- `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
- `/src/components/ItemManager/components/shared/InlineEdit.tsx`
- `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
- `/src/components/ItemCapture/components/shared/PDFPlaceholder.tsx`

---

## Validation Checklist

### Code Quality
- [ ] All components import useTranslations from 'next-intl'
- [ ] No hardcoded English loading text remains in modified components
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors

### Translation Coverage
- [ ] All 6 language files have identical `common.loading` key structure
- [ ] English values are meaningful and appropriate
- [ ] No duplicate keys within namespaces

### Functionality
- [ ] LoadingIndicator displays translated default label
- [ ] LoadingState displays translated ARIA labels
- [ ] Page loading states show translated text
- [ ] Status messages (Saving, Deleting, etc.) are translated
- [ ] AuthGuard displays translated authentication messages

### Accessibility
- [ ] ARIA labels include translated content
- [ ] Screen reader text (`sr-only`) is translated
- [ ] `role="status"` elements have proper translated labels
- [ ] `aria-busy` behavior unchanged

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Component already uses useTranslations | Check for existing imports; use aliased hook name `tLoading` |
| Server component needs translation | Use `getTranslations` from 'next-intl/server' instead |
| Build breaks due to missing key | Verify key exists in en.json before using |
| Translation fallback issues | Test with locale switching |

---

## Notes for Implementation

1. **Hook Aliasing**: If a component already uses `useTranslations` for another namespace, use an alias:
   ```tsx
   const tCommon = useTranslations('common');
   const tLoading = useTranslations('common.loading');
   ```

2. **Server Components**: For server components (no 'use client' directive), use:
   ```tsx
   import { getTranslations } from 'next-intl/server';
   const t = await getTranslations('common.loading');
   ```

3. **Optional Props**: When updating components with default label props, make the prop optional and fall back to translation.

4. **Testing**: After implementation, test by temporarily changing locale in browser to verify translations load correctly.

---

*End of Detailed Task Breakdown*
