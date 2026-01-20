# REQ-E05-022: Create ManualEditWarningDialog Component - Detailed Task Breakdown

**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-022
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.1
**Size:** M (Medium)
**Overview Document:** REQ-E05-022-create-manualeditwarningdialog-component-overview.md

---

## Document Purpose

This document provides granular, implementation-ready tasks for creating the ManualEditWarningDialog component. Each task is designed to be approximately 1 story point and can be executed independently by a developer or AI coding agent.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 (Foundation) translation tables exist with `translation_status` column
- [ ] Epic 3 (Dynamic Content Translation) APIs are available
- [ ] `@radix-ui/react-dialog` package is installed
- [ ] `lucide-react` package is installed with `AlertTriangle`, `X`, `Loader2` icons
- [ ] `SUPPORTED_LOCALES` constant exists in `/src/components/LanguageSwitcher/constants.ts`
- [ ] `SupportedLanguage` type exists in `/src/types` or `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts`

---

## Task Breakdown

### Task 1: Create Directory Structure and Type Definitions

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.types.ts`

**Description:** Create the types file with all interface definitions for the ManualEditWarningDialog component.

**Implementation Steps:**

1. Create directory `/src/components/TranslationManagement/ManualEditWarning/` if it doesn't exist
2. Create the types file with the following content:

```typescript
// /src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.types.ts
// REQ-E05-022: ManualEditWarningDialog Type Definitions
// Created: 2026-01-20
// Last Modified: 2026-01-20

import type { SupportedLanguage } from '@/components/LanguageSwitcher/LanguageSwitcher.types';

/**
 * Props for the ManualEditWarningDialog component.
 * @see REQ-E05-022 - Manual Edit Preservation Warning Dialog
 */
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Entity being updated (article, item, or link) */
  entityType: 'article' | 'item' | 'link';

  /** Entity ID for the content being updated */
  entityId: string;

  /** Array of language codes with manual translation status */
  affectedLanguages: SupportedLanguage[];

  /** Callback when user chooses to keep manual edits */
  onKeepManual: () => void;

  /** Callback when user confirms re-translation (after secondary confirmation) */
  onRetranslate: () => void;

  /** Callback when dialog is cancelled (no action taken) */
  onCancel: () => void;

  /** Optional: Loading state during re-translate operation */
  loading?: boolean;

  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * Internal state for managing secondary confirmation
 */
export interface ManualEditWarningDialogState {
  /** Whether secondary confirmation is being shown */
  showSecondaryConfirmation: boolean;
}
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All JSDoc comments are present
- [ ] Import path for `SupportedLanguage` is correct

---

### Task 2: Create Base Dialog Structure with Radix UI

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Description:** Create the main component file with Radix UI Dialog structure, overlay, and basic content container.

**Implementation Steps:**

1. Create the component file with basic imports and structure:

```typescript
// /src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx
// REQ-E05-022: ManualEditWarningDialog Component
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES, getLocaleByCode } from '@/components/LanguageSwitcher/constants';
import type { ManualEditWarningDialogProps } from './ManualEditWarningDialog.types';

// =============================================================================
// Constants
// =============================================================================

/** Maximum languages to display before scrolling */
const MAX_VISIBLE_LANGUAGES = 6;

// =============================================================================
// Main Component
// =============================================================================

/**
 * Warning dialog for manual edit preservation when source content changes.
 *
 * Displays when property owners update source content that has existing manual
 * translations. Allows choosing between preserving manual edits or re-translating
 * all content (with secondary confirmation for destructive action).
 *
 * @example
 * <ManualEditWarningDialog
 *   isOpen={showWarning}
 *   entityType="article"
 *   entityId="abc123"
 *   affectedLanguages={['fr', 'es', 'de']}
 *   onKeepManual={handleKeepManual}
 *   onRetranslate={handleRetranslate}
 *   onCancel={() => setShowWarning(false)}
 * />
 */
export function ManualEditWarningDialog({
  isOpen,
  entityType,
  entityId,
  affectedLanguages,
  onKeepManual,
  onRetranslate,
  onCancel,
  loading = false,
  className,
}: ManualEditWarningDialogProps) {
  // Internal state for secondary confirmation
  const [showSecondaryConfirmation, setShowSecondaryConfirmation] = useState(false);

  // Ref for focus management
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Reset secondary confirmation when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setShowSecondaryConfirmation(false);
    }
  }, [isOpen]);

  // Handle escape key
  const handleEscapeKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !loading) {
      event.preventDefault();
      if (showSecondaryConfirmation) {
        setShowSecondaryConfirmation(false);
      } else {
        onCancel();
      }
    }
  }, [loading, showSecondaryConfirmation, onCancel]);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    if (loading) return;
    if (showSecondaryConfirmation) {
      setShowSecondaryConfirmation(false);
    } else {
      onCancel();
    }
  }, [loading, showSecondaryConfirmation, onCancel]);

  // Handle keep manual edits
  const handleKeepManual = useCallback(() => {
    if (loading) return;
    onKeepManual();
  }, [loading, onKeepManual]);

  // Handle re-translate click (shows secondary confirmation)
  const handleRetranslateClick = useCallback(() => {
    if (loading) return;
    setShowSecondaryConfirmation(true);
  }, [loading]);

  // Handle final re-translate confirmation
  const handleConfirmRetranslate = useCallback(() => {
    if (loading) return;
    onRetranslate();
  }, [loading, onRetranslate]);

  // Don't render if no affected languages
  if (affectedLanguages.length === 0) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && !loading && onCancel()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        {/* Content - Placeholder for Task 3 */}
        <Dialog.Content
          aria-labelledby="manual-edit-warning-title"
          aria-describedby="manual-edit-warning-description"
          onEscapeKeyDown={(e) => {
            if (loading) e.preventDefault();
          }}
          className={cn(
            // Base styles
            'fixed z-50 bg-white shadow-xl outline-none',
            'overflow-hidden flex flex-col',

            // Desktop: centered modal
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'max-w-lg w-[calc(100%-2rem)] max-h-[90vh]',
            'rounded-xl',

            // Mobile: slide-up drawer
            'max-md:left-0 max-md:right-0 max-md:top-auto max-md:bottom-0',
            'max-md:translate-x-0 max-md:translate-y-0',
            'max-md:max-w-none max-md:rounded-t-xl max-md:rounded-b-none',

            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95',
            'max-md:data-[state=closed]:slide-out-to-bottom max-md:data-[state=open]:slide-in-from-bottom',

            className
          )}
        >
          {/* Mobile drag handle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

          {/* Content will be added in subsequent tasks */}
          <div className="p-6">
            {/* Header - Task 3 */}
            {/* Warning message - Task 4 */}
            {/* Language list - Task 5 */}
            {/* Buttons - Task 6 */}
            {/* Secondary confirmation - Task 7 */}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ManualEditWarningDialog;
```

**Verification:**
- [ ] Component renders without errors when `isOpen={true}`
- [ ] Overlay appears with correct styling
- [ ] Dialog is centered on desktop viewports
- [ ] Dialog slides up from bottom on mobile viewports
- [ ] Pressing Escape calls `onCancel` when not loading

---

### Task 3: Implement Dialog Header with Warning Icon

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Description:** Add the header section with warning icon, title, close button, and affected language count.

**Implementation Steps:**

1. Replace the header placeholder with:

```typescript
{/* Header with warning icon */}
<div className="flex items-start gap-4 p-6 pb-4">
  {/* Warning icon */}
  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
    <AlertTriangle className="w-6 h-6 text-amber-500" aria-hidden="true" />
  </div>

  {/* Title and close button */}
  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-4">
      <Dialog.Title
        id="manual-edit-warning-title"
        className="text-lg font-semibold text-gray-900"
      >
        Manual Translations Will Be Affected
      </Dialog.Title>

      <Dialog.Close asChild>
        <button
          type="button"
          ref={cancelButtonRef}
          onClick={handleCancel}
          disabled={loading}
          className={cn(
            'p-1.5 rounded-full text-gray-400 transition-colors',
            'hover:text-gray-600 hover:bg-gray-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </Dialog.Close>
    </div>

    {/* Affected count subtitle */}
    <p className="mt-1 text-sm text-gray-500">
      {affectedLanguages.length} {affectedLanguages.length === 1 ? 'language' : 'languages'} with manual translations
    </p>
  </div>
</div>
```

**Verification:**
- [ ] Warning icon displays with amber background
- [ ] Title text is "Manual Translations Will Be Affected"
- [ ] Close button (X) is visible and positioned correctly
- [ ] Language count displays correctly (singular/plural)
- [ ] Close button triggers `onCancel` when clicked
- [ ] Close button is disabled when `loading={true}`

---

### Task 4: Implement Warning Message Section

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Description:** Add the description section explaining the warning to property owners.

**Implementation Steps:**

1. Add the description section after the header:

```typescript
{/* Warning description */}
<div className="px-6 pb-4">
  <Dialog.Description
    id="manual-edit-warning-description"
    className="text-sm text-gray-600 leading-relaxed"
  >
    You&apos;re updating content that has been manually translated.
    These translations may become outdated after your changes.
    Choose how to handle your existing manual translations:
  </Dialog.Description>
</div>
```

**Verification:**
- [ ] Description text is clearly visible
- [ ] Text explains the situation to property owners
- [ ] Proper escaping for apostrophe (`&apos;`)
- [ ] Text is associated with `aria-describedby`

---

### Task 5: Implement Affected Languages List

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Description:** Display the list of languages that have manual translations and will be affected.

**Implementation Steps:**

1. Add the language list section:

```typescript
{/* Affected languages list */}
<div className="px-6 pb-4">
  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
      Languages with manual translations:
    </p>
    <ul className="space-y-2" aria-label="Affected languages">
      {affectedLanguages.map((langCode) => {
        const locale = getLocaleByCode(langCode);
        if (!locale) return null;

        return (
          <li
            key={langCode}
            className="flex items-center gap-3 text-sm text-gray-700"
          >
            <span className="text-lg" aria-hidden="true">
              {locale.flag}
            </span>
            <span className="font-medium">
              {locale.nativeName}
            </span>
            <span className="text-gray-400">
              ({locale.name})
            </span>
          </li>
        );
      })}
    </ul>
  </div>
</div>
```

**Verification:**
- [ ] All affected languages display with flag emoji
- [ ] Native name displays (e.g., "Francais" not "French")
- [ ] English name displays in parentheses
- [ ] List scrolls when more than 6 languages
- [ ] Gray background distinguishes the list section

---

### Task 6: Implement Primary Action Buttons

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Description:** Add the Cancel, Keep Manual Edits, and Re-translate All buttons with proper styling.

**Implementation Steps:**

1. Add the action buttons section:

```typescript
{/* Action buttons */}
{!showSecondaryConfirmation && (
  <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-100">
    {/* Cancel button */}
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className={cn(
        'flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium rounded-lg',
        'text-gray-700 bg-gray-100',
        'hover:bg-gray-200 active:bg-gray-300',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      Cancel
    </button>

    {/* Keep Manual Edits button */}
    <button
      type="button"
      onClick={handleKeepManual}
      disabled={loading}
      className={cn(
        'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
        'text-gray-900 bg-white border border-gray-300',
        'hover:bg-gray-50 active:bg-gray-100',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <span className="block">Keep Manual Edits</span>
      <span className="block text-xs text-gray-500 font-normal mt-0.5">
        May need review later
      </span>
    </button>

    {/* Re-translate All button */}
    <button
      type="button"
      onClick={handleRetranslateClick}
      disabled={loading}
      className={cn(
        'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
        'text-white bg-amber-500',
        'hover:bg-amber-600 active:bg-amber-700',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex flex-col items-center justify-center'
      )}
    >
      <span className="block">Re-translate All</span>
      <span className="block text-xs text-amber-100 font-normal mt-0.5">
        Requires confirmation
      </span>
    </button>
  </div>
)}
```

**Verification:**
- [ ] Cancel button has gray styling
- [ ] Keep Manual Edits button has neutral/white styling with border
- [ ] Re-translate All button has amber/warning styling
- [ ] Helper text displays beneath each action button
- [ ] All buttons are disabled when `loading={true}`
- [ ] Buttons stack vertically on mobile, row on desktop
- [ ] Clicking Re-translate All sets `showSecondaryConfirmation` to true

---

### Task 7: Implement Secondary Confirmation for Re-translate

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Description:** Add the secondary confirmation UI that appears when user clicks Re-translate All.

**Implementation Steps:**

1. Add the secondary confirmation section (conditionally rendered):

```typescript
{/* Secondary confirmation for re-translate */}
{showSecondaryConfirmation && (
  <div className="p-6 pt-4 border-t border-gray-100">
    {/* Destructive warning message */}
    <div className="flex items-start gap-3 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-red-800">
          This action cannot be undone
        </p>
        <p className="text-sm text-red-600 mt-1">
          All {affectedLanguages.length} manual {affectedLanguages.length === 1 ? 'translation' : 'translations'} will
          be permanently replaced with new machine translations.
        </p>
      </div>
    </div>

    {/* Confirmation buttons */}
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Go back button */}
      <button
        type="button"
        onClick={() => setShowSecondaryConfirmation(false)}
        disabled={loading}
        className={cn(
          'flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium rounded-lg',
          'text-gray-700 bg-gray-100',
          'hover:bg-gray-200 active:bg-gray-300',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Go Back
      </button>

      {/* Confirm destructive action button */}
      <button
        type="button"
        onClick={handleConfirmRetranslate}
        disabled={loading}
        className={cn(
          'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
          'text-white bg-red-600',
          'hover:bg-red-700 active:bg-red-800',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'inline-flex items-center justify-center gap-2'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Re-translating...</span>
          </>
        ) : (
          <span>Yes, Re-translate All</span>
        )}
      </button>
    </div>
  </div>
)}
```

**Verification:**
- [ ] Secondary confirmation shows when Re-translate All is clicked
- [ ] Warning message has red destructive styling
- [ ] "Go Back" button returns to primary buttons
- [ ] "Yes, Re-translate All" button has red destructive styling
- [ ] Loading state shows spinner and "Re-translating..." text
- [ ] Escape key returns to primary buttons (not closing dialog)

---

### Task 8: Add Accessibility Attributes

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Description:** Ensure all accessibility requirements are met with proper ARIA attributes, focus management, and screen reader support.

**Implementation Steps:**

1. Verify and enhance accessibility attributes:

```typescript
// Add to Dialog.Content:
role="alertdialog"
aria-modal="true"
aria-labelledby="manual-edit-warning-title"
aria-describedby="manual-edit-warning-description"

// Add live region for status updates:
<div aria-live="polite" className="sr-only">
  {loading && 'Processing re-translation request...'}
  {showSecondaryConfirmation && 'Confirmation required. This action cannot be undone.'}
</div>

// Add to language list:
aria-label="Affected languages with manual translations"

// Ensure focus trap by NOT adding custom focus handlers (Radix handles this)

// Add tabIndex management for secondary confirmation:
// When secondary confirmation shows, first focusable element should receive focus
useEffect(() => {
  if (showSecondaryConfirmation) {
    // Focus will naturally move to first button in the confirmation section
  }
}, [showSecondaryConfirmation]);
```

2. Add these ARIA attributes to existing elements:

```typescript
// On the language list container:
role="list"

// On each language item:
role="listitem"

// On action buttons, add aria-describedby for helper text:
<span id="keep-manual-helper" className="sr-only">
  Preserves existing translations but they may need manual review later
</span>
<button aria-describedby="keep-manual-helper" ...>

<span id="retranslate-helper" className="sr-only">
  Queues new translation jobs for all affected languages, discarding manual work
</span>
<button aria-describedby="retranslate-helper" ...>
```

**Verification:**
- [ ] Screen reader announces dialog title and description
- [ ] Focus is trapped within dialog
- [ ] Tab order is logical through all controls
- [ ] Escape key dismisses dialog (when not in loading state)
- [ ] Status changes announced via live region
- [ ] Language list properly labeled for screen readers

---

### Task 9: Create Barrel Export File

**File:** `/src/components/TranslationManagement/ManualEditWarning/index.ts`

**Description:** Create the barrel export file for the ManualEditWarning module.

**Implementation Steps:**

1. Create the index file:

```typescript
// /src/components/TranslationManagement/ManualEditWarning/index.ts
// REQ-E05-022: ManualEditWarning Module Exports
// Created: 2026-01-20
// Last Modified: 2026-01-20

export { ManualEditWarningDialog, default } from './ManualEditWarningDialog';
export type { ManualEditWarningDialogProps } from './ManualEditWarningDialog.types';
```

**Verification:**
- [ ] Named export `ManualEditWarningDialog` works
- [ ] Default export works
- [ ] Type export `ManualEditWarningDialogProps` works

---

### Task 10: Update TranslationManagement Barrel Exports

**File:** `/src/components/TranslationManagement/index.ts`

**Description:** Update or create the TranslationManagement barrel export to include ManualEditWarning.

**Implementation Steps:**

1. If file doesn't exist, create it:

```typescript
// /src/components/TranslationManagement/index.ts
// REQ-E05-022: TranslationManagement Module Exports
// Created: 2026-01-20
// Last Modified: 2026-01-20

// ManualEditWarning (REQ-E05-022)
export { ManualEditWarningDialog } from './ManualEditWarning';
export type { ManualEditWarningDialogProps } from './ManualEditWarning';

// Future exports will be added here as Epic 5 progresses
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export { TranslationEditor } from './TranslationEditor';
// etc.
```

2. If file exists, add the exports:

```typescript
// Add to existing exports:
export { ManualEditWarningDialog } from './ManualEditWarning';
export type { ManualEditWarningDialogProps } from './ManualEditWarning';
```

**Verification:**
- [ ] Can import from `@/components/TranslationManagement`
- [ ] TypeScript compilation succeeds
- [ ] No circular dependency errors

---

### Task 11: Create Unit Tests

**File:** `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx`

**Description:** Create comprehensive unit tests for the ManualEditWarningDialog component.

**Implementation Steps:**

1. Create the test file:

```typescript
// /src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx
// REQ-E05-022: ManualEditWarningDialog Unit Tests
// Created: 2026-01-20
// Last Modified: 2026-01-20

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualEditWarningDialog } from '../ManualEditWarningDialog';
import type { ManualEditWarningDialogProps } from '../ManualEditWarningDialog.types';

// Default props for testing
const defaultProps: ManualEditWarningDialogProps = {
  isOpen: true,
  entityType: 'article',
  entityId: 'test-123',
  affectedLanguages: ['fr', 'es', 'de'],
  onKeepManual: jest.fn(),
  onRetranslate: jest.fn(),
  onCancel: jest.fn(),
};

describe('ManualEditWarningDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ManualEditWarningDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('returns null when affectedLanguages is empty', () => {
      render(<ManualEditWarningDialog {...defaultProps} affectedLanguages={[]} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('displays correct title', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);
      expect(screen.getByText('Manual Translations Will Be Affected')).toBeInTheDocument();
    });

    it('displays affected language count', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);
      expect(screen.getByText('3 languages with manual translations')).toBeInTheDocument();
    });

    it('displays singular language text for one language', () => {
      render(<ManualEditWarningDialog {...defaultProps} affectedLanguages={['fr']} />);
      expect(screen.getByText('1 language with manual translations')).toBeInTheDocument();
    });

    it('displays all affected languages with flags', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);
      expect(screen.getByText('Francais')).toBeInTheDocument();
      expect(screen.getByText('Espanol')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onKeepManual when Keep Manual Edits is clicked', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /keep manual edits/i }));

      expect(defaultProps.onKeepManual).toHaveBeenCalledTimes(1);
    });

    it('shows secondary confirmation when Re-translate All is clicked', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /re-translate all/i }));

      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /yes, re-translate all/i })).toBeInTheDocument();
    });

    it('calls onRetranslate when secondary confirmation is accepted', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /re-translate all/i }));
      await user.click(screen.getByRole('button', { name: /yes, re-translate all/i }));

      expect(defaultProps.onRetranslate).toHaveBeenCalledTimes(1);
    });

    it('returns to primary buttons when Go Back is clicked', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /re-translate all/i }));
      await user.click(screen.getByRole('button', { name: /go back/i }));

      expect(screen.queryByText('This action cannot be undone')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /re-translate all/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables all buttons when loading', () => {
      render(<ManualEditWarningDialog {...defaultProps} loading={true} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /keep manual edits/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /re-translate all/i })).toBeDisabled();
    });

    it('shows loading spinner during re-translate', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ManualEditWarningDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /re-translate all/i }));
      rerender(<ManualEditWarningDialog {...defaultProps} loading={true} />);

      expect(screen.getByText('Re-translating...')).toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('closes dialog when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('returns to primary buttons when Escape is pressed in secondary confirmation', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /re-translate all/i }));
      await user.keyboard('{Escape}');

      // Should still be in dialog, just back to primary view
      expect(screen.queryByText('This action cannot be undone')).not.toBeInTheDocument();
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not close dialog when Escape is pressed during loading', async () => {
      const user = userEvent.setup();
      render(<ManualEditWarningDialog {...defaultProps} loading={true} />);

      await user.keyboard('{Escape}');

      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'manual-edit-warning-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'manual-edit-warning-description');
    });

    it('language list is properly labeled', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);

      expect(screen.getByRole('list', { name: /affected languages/i })).toBeInTheDocument();
    });
  });
});
```

**Verification:**
- [ ] All tests pass
- [ ] Coverage meets project standards (>80%)
- [ ] Tests cover all acceptance criteria

---

### Task 12: Integration Verification

**Description:** Verify the component integrates correctly with the application.

**Verification Steps:**

1. **Import Test:**
   ```typescript
   import { ManualEditWarningDialog } from '@/components/TranslationManagement';
   ```

2. **Basic Render Test:**
   ```typescript
   <ManualEditWarningDialog
     isOpen={true}
     entityType="article"
     entityId="test-123"
     affectedLanguages={['fr', 'es', 'de']}
     onKeepManual={() => console.log('Keep manual')}
     onRetranslate={() => console.log('Re-translate')}
     onCancel={() => console.log('Cancel')}
   />
   ```

3. **Build Verification:**
   ```bash
   npm run build
   # Should complete without errors
   ```

4. **Type Check:**
   ```bash
   npx tsc --noEmit
   # Should complete without errors
   ```

**Verification:**
- [ ] Component imports successfully
- [ ] Component renders in browser
- [ ] Build completes without errors
- [ ] TypeScript compilation passes
- [ ] No console errors or warnings

---

## Acceptance Criteria Checklist

Based on REQ-E05-023 from gen_requests_epic5.md:

### Dialog Structure
- [ ] Dialog uses Radix UI Dialog primitive for accessibility and focus management
- [ ] Dialog displays when source content update is detected for entity with manual translations
- [ ] Dialog opens centered on viewport with overlay backdrop preventing interaction

### Warning Message
- [ ] Warning message clearly explains that source content has changed and manual translations may become outdated
- [ ] Warning icon displays at top of dialog to emphasize importance of decision
- [ ] Dialog displays count of affected languages in heading (e.g., "3 manual translations will be affected")

### Language List
- [ ] Language list displays all languages that currently have manual translation status
- [ ] Each listed language displays flag icon and language name for easy recognition
- [ ] Language list scrolls independently if affected language count exceeds viewport height

### Action Buttons
- [ ] "Keep Manual Edits" button preserves all existing manual translations without modification
- [ ] "Keep Manual Edits" button includes helper text explaining that manual review may be needed later
- [ ] "Keep Manual Edits" button uses secondary or neutral styling (gray or white)
- [ ] "Re-translate All" button queues new translation jobs for all listed manual languages
- [ ] "Re-translate All" button displays additional confirmation message emphasizing that manual work will be discarded
- [ ] "Re-translate All" action shows secondary confirmation dialog before proceeding with destructive action
- [ ] "Re-translate All" button uses warning styling (orange or yellow) to indicate caution
- [ ] Both action buttons are clearly labeled with action-oriented text describing outcome

### Cancel Behavior
- [ ] Dialog includes "Cancel" option that dismisses dialog without saving source content changes
- [ ] Cancel action returns user to content edit view to reconsider changes
- [ ] Escape key triggers cancel action and closes dialog

### Props Interface
- [ ] Component accepts entity reference (entityType, entityId) as required props
- [ ] Component accepts array of affected language codes as required prop
- [ ] Component accepts onKeepManual callback function executed when user chooses to preserve edits
- [ ] Component accepts onRetranslate callback function executed when user confirms re-translation
- [ ] Component accepts onCancel callback function executed when dialog is dismissed

### Accessibility
- [ ] Dialog maintains focus trap preventing interaction with content behind overlay
- [ ] First interactive element receives focus when dialog opens
- [ ] Dialog returns focus to triggering element when closed
- [ ] Component is fully keyboard accessible with logical tab order through all controls
- [ ] Component includes appropriate ARIA labels and roles for screen reader accessibility

### Visual Design
- [ ] Visual hierarchy makes consequences of each action clear through layout and typography
- [ ] Dialog styling matches application design system with consistent spacing and colors
- [ ] Dialog adapts to mobile viewports maintaining full usability on small screens

### Theme Support
- [ ] Component renders correctly in both light and dark theme contexts if themes are supported
- [ ] Dialog prevents body scroll when open on mobile devices

### Integration
- [ ] Component integrates with content save workflows in item, article, and link editors

---

## File Summary

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.types.ts` | Create | Type definitions |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Create | Main component |
| `/src/components/TranslationManagement/ManualEditWarning/index.ts` | Create | Barrel exports |
| `/src/components/TranslationManagement/index.ts` | Create/Modify | Module exports |
| `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx` | Create | Unit tests |

---

## Dependencies

### Required Packages (already installed)
- `@radix-ui/react-dialog`
- `lucide-react`

### Required Project Files
- `/src/lib/utils.ts` (for `cn` utility)
- `/src/components/LanguageSwitcher/constants.ts` (for `SUPPORTED_LOCALES`, `getLocaleByCode`)
- `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` (for `SupportedLanguage` type)

---

## References

- Overview Document: `/docs/REQ-E05-022-create-manualeditwarningdialog-component-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Definition: `/docs/gen_requests_epic5.md` (REQ-E05-023)
- Pattern Reference: `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- Radix Dialog Reference: `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- Language Constants: `/src/components/LanguageSwitcher/constants.ts`
- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)
