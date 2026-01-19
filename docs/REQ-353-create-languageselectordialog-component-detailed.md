# REQ-353: Create LanguageSelectorDialog Component - Detailed Task Breakdown

**Generated:** 2026-01-19 23:55 UTC
**Last Modified:** 2026-01-19 23:55 UTC
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.2
**Overview Document:** docs/REQ-353-create-languageselectordialog-component-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Size:** S (Small)
**Estimated Tasks:** 7 granular tasks

---

## Executive Summary

This document provides granular, 1-story-point implementation tasks for creating the LanguageSelectorDialog component. This modal dialog allows property owners to select one or more target languages when performing bulk re-translation operations. The component follows established patterns from BulkTagDialog and uses the existing `useFocusTrap` hook for accessibility.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 Foundation complete (i18n config exists)
- [ ] `src/lib/i18n/config.ts` exports `locales`, `localeMetadata`, `SupportedLocale`
- [ ] `src/components/ItemManager/utils/a11yUtils.tsx` exports `useFocusTrap`
- [ ] `lucide-react` package installed (for icons)

---

## Task List

### Task 1: Create directory structure and types file

**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.types.ts`

**Description:** Create the BulkTranslationBar directory and define TypeScript interfaces for the LanguageSelectorDialog component.

**Implementation Steps:**

1. Create directory: `/src/components/TranslationManagement/BulkTranslationBar/`
2. Create the types file with proper header comment including lastModified timestamp
3. Import `SupportedLocale` from `@/lib/i18n/config`
4. Define and export `LanguageSelectorDialogProps` interface

**Code to Write:**

```typescript
/**
 * LanguageSelectorDialog Type Definitions
 *
 * Type definitions for the LanguageSelectorDialog component used in bulk
 * translation operations.
 *
 * @module TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.types
 * @see docs/REQ-353-create-languageselectordialog-component-detailed.md
 * @lastModified 2026-01-19
 */

import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Props for the LanguageSelectorDialog component.
 */
export interface LanguageSelectorDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Languages to exclude from selection (e.g., source language) */
  excludeLanguages?: SupportedLocale[];
  /** Pre-selected languages (for edit mode) */
  initialSelection?: SupportedLocale[];
  /** Callback when languages are confirmed */
  onConfirm: (selectedLanguages: SupportedLocale[]) => void;
  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;
  /** Loading state during operation */
  loading?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Optional additional CSS classes */
  className?: string;
}
```

**Verification:**
- [ ] File created at correct path
- [ ] Import resolves correctly
- [ ] TypeScript compilation passes

---

### Task 2: Create LanguageSelectorDialog component shell

**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Description:** Create the main component file with proper structure, imports, and state management setup.

**Implementation Steps:**

1. Add `'use client'` directive at top
2. Add module JSDoc header with lastModified timestamp
3. Import React hooks: `useState`, `useMemo`, `useCallback`, `useRef`, `useEffect`, `useId`
4. Import icons from `lucide-react`: `X`, `Check`, `Globe`, `Loader2`
5. Import `cn` from `@/lib/utils`
6. Import `useFocusTrap` from `@/components/ItemManager/utils/a11yUtils`
7. Import `locales`, `localeMetadata`, `SupportedLocale` from `@/lib/i18n/config`
8. Import types from `./LanguageSelectorDialog.types`
9. Define component function with props destructuring
10. Add state: `selectedLanguages` as `Set<SupportedLocale>`
11. Add refs: `dialogRef` for focus trap

**Code Structure:**

```typescript
'use client';

/**
 * LanguageSelectorDialog Component
 *
 * Modal dialog for selecting target languages for bulk translation operations.
 * Provides a checkbox list with Select All / Deselect All functionality.
 *
 * @module TranslationManagement/BulkTranslationBar/LanguageSelectorDialog
 * @see docs/REQ-353-create-languageselectordialog-component-detailed.md
 * @lastModified 2026-01-19
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useId,
} from 'react';
import { X, Check, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/components/ItemManager/utils/a11yUtils';
import { locales, localeMetadata, type SupportedLocale } from '@/lib/i18n/config';
import type { LanguageSelectorDialogProps } from './LanguageSelectorDialog.types';

// =============================================================================
// Main Component
// =============================================================================

export function LanguageSelectorDialog({
  isOpen,
  excludeLanguages = [],
  initialSelection = [],
  onConfirm,
  onCancel,
  loading = false,
  title = 'Select Languages',
  description = 'Select target languages for re-translation:',
  className,
}: LanguageSelectorDialogProps) {
  // Component implementation in subsequent tasks...
}

export default LanguageSelectorDialog;
```

**Verification:**
- [ ] All imports resolve correctly
- [ ] TypeScript compilation passes
- [ ] Component can be imported

---

### Task 3: Implement state management and computed values

**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Description:** Add state initialization, compute available languages, and implement selection logic.

**Implementation Steps:**

1. Add unique ID generation using `useId()` for accessibility
2. Create dialogRef and apply `useFocusTrap`
3. Initialize `selectedLanguages` state from `initialSelection` prop
4. Compute `availableLanguages` by filtering out `excludeLanguages`
5. Compute `isAllSelected` boolean
6. Compute `confirmDisabled` based on selection count
7. Add effect to sync `initialSelection` prop changes to state

**Code to Add:**

```typescript
// Inside component function:

// ---------------------------------------------------------------------------
// IDs for accessibility
// ---------------------------------------------------------------------------
const uniqueId = useId();
const titleId = `language-selector-title-${uniqueId}`;
const descId = `language-selector-desc-${uniqueId}`;

// ---------------------------------------------------------------------------
// Refs and Focus Trap
// ---------------------------------------------------------------------------
const dialogRef = useRef<HTMLDivElement>(null);
useFocusTrap(dialogRef, isOpen);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const [selectedLanguages, setSelectedLanguages] = useState<Set<SupportedLocale>>(
  () => new Set(initialSelection)
);

// ---------------------------------------------------------------------------
// Computed Values
// ---------------------------------------------------------------------------
const availableLanguages = useMemo(() => {
  return locales.filter(
    (locale) => !excludeLanguages.includes(locale)
  );
}, [excludeLanguages]);

const isAllSelected = useMemo(() => {
  return availableLanguages.length > 0 &&
    availableLanguages.every((locale) => selectedLanguages.has(locale));
}, [availableLanguages, selectedLanguages]);

const confirmDisabled = selectedLanguages.size === 0;

// ---------------------------------------------------------------------------
// Effects
// ---------------------------------------------------------------------------

// Sync initialSelection when dialog opens
useEffect(() => {
  if (isOpen) {
    setSelectedLanguages(new Set(initialSelection));
  }
}, [isOpen, initialSelection]);

// Prevent body scroll when dialog is open
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }
}, [isOpen]);

// Handle Escape key
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen && !loading) {
      onCancel();
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onCancel, loading]);
```

**Verification:**
- [ ] State initializes correctly from props
- [ ] Available languages exclude correctly
- [ ] isAllSelected computes correctly
- [ ] Effects run at appropriate times

---

### Task 4: Implement event handlers

**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Description:** Add all event handler functions for user interactions.

**Implementation Steps:**

1. Create `handleToggleLanguage` - toggle individual language selection
2. Create `handleSelectAll` - select all available languages
3. Create `handleDeselectAll` - clear all selections
4. Create `handleConfirm` - call onConfirm with selected languages array
5. Create `handleBackdropClick` - close dialog when clicking outside

**Code to Add:**

```typescript
// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

const handleToggleLanguage = useCallback((locale: SupportedLocale) => {
  setSelectedLanguages((prev) => {
    const next = new Set(prev);
    if (next.has(locale)) {
      next.delete(locale);
    } else {
      next.add(locale);
    }
    return next;
  });
}, []);

const handleSelectAll = useCallback(() => {
  setSelectedLanguages(new Set(availableLanguages));
}, [availableLanguages]);

const handleDeselectAll = useCallback(() => {
  setSelectedLanguages(new Set());
}, []);

const handleConfirm = useCallback(() => {
  onConfirm(Array.from(selectedLanguages));
}, [onConfirm, selectedLanguages]);

const handleBackdropClick = useCallback(
  (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  },
  [onCancel, loading]
);
```

**Verification:**
- [ ] Toggle adds/removes languages correctly
- [ ] Select All selects only available languages
- [ ] Deselect All clears selection
- [ ] Confirm returns array of selected languages
- [ ] Backdrop click only fires on backdrop element

---

### Task 5: Implement render JSX

**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

**Description:** Add the complete render JSX for the dialog including backdrop, header, body with checkbox list, and footer.

**Implementation Steps:**

1. Return `null` if `!isOpen`
2. Add backdrop div with `onClick={handleBackdropClick}`
3. Add dialog container with proper ARIA attributes
4. Add header with title, Globe icon, and close button (48px touch target)
5. Add description text
6. Add Select All / Deselect All toggle link
7. Add language checkbox list with flags and native names
8. Add footer with Cancel and Confirm buttons (48px touch targets)
9. Show selected count on Confirm button
10. Add loading spinner when loading

**Code to Add:**

```typescript
// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

if (!isOpen) {
  return null;
}

const selectedCount = selectedLanguages.size;

return (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={handleBackdropClick}
  >
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={cn(
        'bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden',
        'flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
        </div>
        <button
          onClick={onCancel}
          disabled={loading}
          className={cn(
            'flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors',
            'min-h-[48px] min-w-[48px]',
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            loading && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Close dialog"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        <p id={descId} className="text-sm text-gray-600 mb-4">
          {description}
        </p>

        {/* Select All / Deselect All Toggle */}
        <div className="mb-4">
          <button
            onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
            disabled={loading}
            className={cn(
              'text-sm font-medium text-blue-600 hover:text-blue-700',
              'focus:outline-none focus:underline',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Language Checkbox List */}
        <div className="space-y-2">
          {availableLanguages.map((locale) => {
            const metadata = localeMetadata[locale];
            const isSelected = selectedLanguages.has(locale);

            return (
              <button
                key={locale}
                onClick={() => handleToggleLanguage(locale)}
                disabled={loading}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  'min-h-[48px]',
                  'touch-manipulation [-webkit-tap-highlight-color:transparent]',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-300'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
                role="checkbox"
                aria-checked={isSelected}
              >
                {/* Checkbox indicator */}
                <span
                  className={cn(
                    'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                    isSelected
                      ? 'bg-blue-600'
                      : 'border-2 border-gray-400'
                  )}
                >
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-white" />
                  )}
                </span>

                {/* Flag */}
                <span className="text-xl flex-shrink-0" aria-hidden="true">
                  {metadata.flag}
                </span>

                {/* Language names */}
                <span className="flex-1 text-left">
                  <span className="font-medium text-gray-900">
                    {metadata.name}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({metadata.nativeName})
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty state if all languages excluded */}
        {availableLanguages.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No languages available for selection.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
        <button
          onClick={onCancel}
          disabled={loading}
          className={cn(
            'px-4 rounded-lg text-sm font-medium',
            'min-h-[48px]',
            'bg-white border border-gray-300 text-gray-700',
            'hover:bg-gray-50 active:bg-gray-100 transition-colors',
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            loading && 'opacity-50 cursor-not-allowed'
          )}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || confirmDisabled}
          className={cn(
            'px-4 rounded-lg text-sm font-medium text-white',
            'min-h-[48px]',
            'flex items-center gap-2 transition-colors',
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300',
            (loading || confirmDisabled) && 'cursor-not-allowed'
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirm{selectedCount > 0 && ` (${selectedCount} selected)`}
        </button>
      </div>
    </div>
  </div>
);
```

**Verification:**
- [ ] Dialog renders with correct structure
- [ ] All languages display with flags and names
- [ ] Checkboxes toggle correctly
- [ ] Select All / Deselect All works
- [ ] Buttons have 48px touch targets
- [ ] Loading state disables all interactions
- [ ] ARIA attributes present and correct

---

### Task 6: Create barrel exports

**Files:**
- `/src/components/TranslationManagement/BulkTranslationBar/index.ts`
- `/src/components/TranslationManagement/index.ts` (create if not exists)

**Description:** Create export files to expose the component and types publicly.

**Implementation Steps:**

1. Create BulkTranslationBar barrel export
2. Create or update TranslationManagement barrel export

**Code for `/src/components/TranslationManagement/BulkTranslationBar/index.ts`:**

```typescript
/**
 * BulkTranslationBar Module Exports
 *
 * Public exports for bulk translation operation components.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @lastModified 2026-01-19
 */

export { LanguageSelectorDialog, default as LanguageSelectorDialogDefault } from './LanguageSelectorDialog';
export type { LanguageSelectorDialogProps } from './LanguageSelectorDialog.types';
```

**Code for `/src/components/TranslationManagement/index.ts`:**

```typescript
/**
 * TranslationManagement Module Exports
 *
 * Public exports for translation management components.
 *
 * @module TranslationManagement
 * @lastModified 2026-01-19
 */

// BulkTranslationBar components
export {
  LanguageSelectorDialog,
  type LanguageSelectorDialogProps,
} from './BulkTranslationBar';
```

**Verification:**
- [ ] Component can be imported from `@/components/TranslationManagement`
- [ ] Types are accessible
- [ ] No circular dependencies

---

### Task 7: Verification and smoke test

**Description:** Verify all files are created correctly, imports resolve, and TypeScript compiles without errors.

**Implementation Steps:**

1. Run TypeScript compilation check: `npx tsc --noEmit`
2. Verify all new files exist at correct paths
3. Verify imports resolve correctly
4. Create a simple integration test scenario (manual or automated)

**Verification Checklist:**

```bash
# Check files exist
ls -la src/components/TranslationManagement/BulkTranslationBar/

# Should show:
# - LanguageSelectorDialog.tsx
# - LanguageSelectorDialog.types.ts
# - index.ts

ls -la src/components/TranslationManagement/

# Should show:
# - index.ts
# - BulkTranslationBar/

# TypeScript check
npx tsc --noEmit
```

**Integration Test (Manual):**

```tsx
// Test in a page or storybook
import { LanguageSelectorDialog } from '@/components/TranslationManagement';
import { useState } from 'react';

function TestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = (languages: SupportedLocale[]) => {
    console.log('Selected languages:', languages);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Open Language Selector
      </button>
      <LanguageSelectorDialog
        isOpen={isOpen}
        excludeLanguages={['en']}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
        loading={loading}
      />
    </div>
  );
}
```

**Final Verification:**
- [ ] TypeScript compiles without errors
- [ ] All files in correct locations
- [ ] Component renders correctly
- [ ] Focus trap works (Tab cycles within dialog)
- [ ] Escape key closes dialog
- [ ] Backdrop click closes dialog
- [ ] Select All / Deselect All works
- [ ] Individual checkbox toggle works
- [ ] Confirm button shows count
- [ ] Confirm button disabled when none selected
- [ ] Loading state disables all interactions
- [ ] excludeLanguages prop works correctly

---

## Complete File List

### New Files to Create

| # | File Path | Task |
|---|-----------|------|
| 1 | `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.types.ts` | Task 1 |
| 2 | `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Tasks 2-5 |
| 3 | `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Task 6 |
| 4 | `/src/components/TranslationManagement/index.ts` | Task 6 |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog structure pattern |
| `/src/components/ItemManager/utils/a11yUtils.tsx` | useFocusTrap hook |
| `/src/lib/i18n/config.ts` | Language configuration |
| `/src/lib/utils.ts` | cn utility |

---

## Acceptance Criteria

- [ ] LanguageSelectorDialog renders as a modal overlay
- [ ] Dialog displays all 6 supported languages with flags and native names
- [ ] Languages in `excludeLanguages` are not shown
- [ ] Select All/Deselect All toggles work correctly
- [ ] Individual language checkboxes can be toggled
- [ ] Confirm button shows count of selected languages
- [ ] Confirm button is disabled when no languages selected
- [ ] Cancel button and Escape key close the dialog
- [ ] Clicking backdrop closes the dialog
- [ ] Loading state disables all interactions and shows spinner
- [ ] Focus is trapped within the dialog when open
- [ ] Focus returns to trigger element when dialog closes
- [ ] All interactive elements meet 48px minimum touch target
- [ ] Component follows existing codebase patterns (BulkTagDialog)
- [ ] TypeScript types are properly defined and exported

---

## Dependencies

| Component/Module | Status | Notes |
|-----------------|--------|-------|
| `@/lib/i18n/config` | Required | Provides locales, localeMetadata |
| `@/components/ItemManager/utils/a11yUtils` | Required | Provides useFocusTrap |
| `lucide-react` | Required | Provides icons |
| `@/lib/utils` | Required | Provides cn utility |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| i18n config not available | Low | High | Verify Epic 1 completion before starting |
| Focus trap issues | Low | Medium | Use proven useFocusTrap hook from codebase |
| Styling inconsistency | Low | Low | Follow BulkTagDialog patterns exactly |

---

## References

- Overview Document: `/docs/REQ-353-create-languageselectordialog-component-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- BulkTagDialog Pattern: `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- Accessibility Utilities: `/src/components/ItemManager/utils/a11yUtils.tsx`
- i18n Configuration: `/src/lib/i18n/config.ts`

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
