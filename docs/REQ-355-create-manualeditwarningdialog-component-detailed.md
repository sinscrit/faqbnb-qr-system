# REQ-355: Create ManualEditWarningDialog Component - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-355 (Originally REQ-325 in gen_requests)
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.1
**Type:** NEW FEATURE
**Size:** M (Medium)

---

## Overview

This document provides granular, implementation-ready tasks for creating the `ManualEditWarningDialog` component. This component warns property owners when source content has been updated and manual translations exist, allowing them to choose between preserving their manual edits or re-translating all affected languages.

---

## Prerequisites

Before starting implementation, verify these dependencies are in place:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| Radix Dialog | `@radix-ui/react-dialog` | `npm ls @radix-ui/react-dialog` |
| Lucide React | `lucide-react` | `npm ls lucide-react` |
| i18n Config | `/src/lib/i18n/config.ts` | Check `localeMetadata` export |
| Translation Types | `/src/lib/translation-service/translation-service.types.ts` | Check `SupportedLanguage` export |
| Utils | `/src/lib/utils.ts` | Check `cn()` function export |
| Translation Tables | Supabase | Tables with `translation_status = 'manual'` capability |

---

## Task Breakdown

### Task 1: Create Directory Structure (2 min)

**Objective:** Set up the folder structure for the ManualEditWarning component module.

**Steps:**
1. Create directory: `/src/components/TranslationManagement/ManualEditWarning/`
2. Create directory: `/src/components/TranslationManagement/ManualEditWarning/__tests__/`

**Commands:**
```bash
mkdir -p /src/components/TranslationManagement/ManualEditWarning/__tests__
```

**Verification:**
- [ ] Directory `/src/components/TranslationManagement/ManualEditWarning/` exists
- [ ] Directory `/src/components/TranslationManagement/ManualEditWarning/__tests__/` exists

---

### Task 2: Create Types Interface (5 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Objective:** Define the TypeScript props interface at the top of the component file.

**Implementation:**

```typescript
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

/**
 * Props for ManualEditWarningDialog component.
 * @see REQ-355 - Manual Edit Warning Dialog
 */
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Languages with manual edits that would be affected */
  affectedLanguages: SupportedLanguage[];

  /** Entity type being updated */
  entityType: 'article' | 'item' | 'link';

  /** Entity name for display context (optional) */
  entityName?: string;

  /** Callback when user chooses to keep manual edits */
  onKeepManualEdits: () => void;

  /** Callback when user chooses to re-translate all */
  onRetranslateAll: () => void;

  /** Callback when dialog is cancelled */
  onCancel: () => void;

  /** Loading state during action processing */
  isLoading?: boolean;
}
```

**Acceptance Criteria:**
- [ ] Interface exported from component file
- [ ] All props are properly typed with JSDoc comments
- [ ] `SupportedLanguage` type imported from translation-service types

---

### Task 3: Create Component Shell with Imports (5 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Objective:** Set up the component file with all necessary imports.

**Implementation:**

```typescript
'use client';

/**
 * ManualEditWarningDialog Component
 *
 * Displays a warning dialog when source content is updated and manual
 * translations exist. Allows users to choose between preserving manual
 * edits or re-translating all affected languages.
 *
 * @module TranslationManagement/ManualEditWarning/ManualEditWarningDialog
 * @see docs/REQ-355-create-manualeditwarningdialog-component-detailed.md
 * @lastModified 2026-01-19
 */

import { useCallback, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { localeMetadata, type SupportedLocale } from '@/lib/i18n/config';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// ... (interface from Task 2)

// ... (component implementation)
```

**Acceptance Criteria:**
- [ ] File has `'use client'` directive
- [ ] All imports are present and properly organized
- [ ] Module-level JSDoc comment with relevant references

---

### Task 4: Implement Dialog Structure with Radix (15 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Objective:** Implement the main dialog structure using Radix Dialog primitives.

**Implementation Pattern (reference `PropertyEditModal.tsx`):**

```typescript
export function ManualEditWarningDialog({
  isOpen,
  affectedLanguages,
  entityType,
  entityName,
  onKeepManualEdits,
  onCancel,
  onRetranslateAll,
  isLoading = false,
}: ManualEditWarningDialogProps) {
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  // Focus primary action on open
  useEffect(() => {
    if (isOpen && keepButtonRef.current) {
      // Small delay to ensure dialog animation completes
      const timer = setTimeout(() => {
        keepButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Early return if no affected languages
  if (affectedLanguages.length === 0) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 bg-black/50 z-50',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'z-50 w-full max-w-md mx-4',
            'bg-white rounded-xl shadow-xl',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'focus:outline-none'
          )}
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isLoading) e.preventDefault();
          }}
          aria-describedby="manual-edit-warning-description"
        >
          {/* Content goes here (Tasks 5-8) */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Acceptance Criteria:**
- [ ] Uses Radix Dialog.Root, Portal, Overlay, Content
- [ ] Animation classes applied (`animate-in`, `fade-in`, `zoom-in-95`)
- [ ] Escape key and outside click handled with loading state check
- [ ] Focus management ref set up
- [ ] Early return if no affected languages

---

### Task 5: Implement Warning Header Section (10 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Objective:** Create the header with warning icon and title.

**Implementation (inside Dialog.Content):**

```typescript
{/* Header with Warning Icon */}
<div className="flex items-start gap-4 p-6 pb-4">
  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
    <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
  </div>
  <div className="flex-1 pr-8">
    <Dialog.Title className="text-lg font-semibold text-gray-900">
      Manual Translations Exist
    </Dialog.Title>
    <Dialog.Description
      id="manual-edit-warning-description"
      className="mt-2 text-sm text-gray-600"
    >
      {entityName ? (
        <>
          The source content for <span className="font-medium">&quot;{entityName}&quot;</span> has been updated.
        </>
      ) : (
        <>The source {entityType} content has been updated.</>
      )}{' '}
      The following {affectedLanguages.length === 1 ? 'language has' : 'languages have'} manual edits that may no longer match:
    </Dialog.Description>
  </div>

  {/* Close button */}
  <Dialog.Close asChild>
    <button
      type="button"
      disabled={isLoading}
      className={cn(
        'absolute top-4 right-4 p-2 rounded-lg',
        'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
      aria-label="Close dialog"
    >
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  </Dialog.Close>
</div>
```

**Acceptance Criteria:**
- [ ] Amber/yellow warning icon displayed (`AlertTriangle`)
- [ ] Title clearly indicates manual translations exist
- [ ] Description mentions entity name if provided
- [ ] Pluralization handled correctly (language/languages, has/have)
- [ ] Close button in top-right corner

---

### Task 6: Implement Affected Languages List (10 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Objective:** Display list of affected languages with flags and names.

**Implementation (inside Dialog.Content, after header):**

```typescript
{/* Affected Languages List */}
<div className="px-6 pb-4">
  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
    <ul className="space-y-2" aria-label="Languages with manual edits">
      {affectedLanguages.map((langCode) => {
        const metadata = localeMetadata[langCode as SupportedLocale];
        if (!metadata) return null;

        return (
          <li
            key={langCode}
            className="flex items-center gap-3 text-sm text-gray-700"
          >
            <span className="text-lg" aria-hidden="true">
              {metadata.flag || '🌐'}
            </span>
            <span className="flex-1">
              {metadata.name}
              {metadata.nativeName !== metadata.name && (
                <span className="text-gray-500 ml-1">
                  ({metadata.nativeName})
                </span>
              )}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
              Manual
            </span>
          </li>
        );
      })}
    </ul>
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Each language shows flag emoji from `localeMetadata`
- [ ] Language name displayed (English and native if different)
- [ ] "Manual" badge indicator in purple (violet-500)
- [ ] List is scrollable if many languages (`max-h-48 overflow-y-auto`)
- [ ] Proper ARIA label on list

---

### Task 7: Implement Action Buttons (15 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Objective:** Create the three action buttons with proper styling and behavior.

**Implementation (inside Dialog.Content, after languages list):**

```typescript
{/* Re-translate Warning */}
<div className="px-6 pb-4">
  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
    <p className="text-red-700">
      <strong>Warning:</strong> Choosing &quot;Re-translate All&quot; will permanently replace
      your manual edits with new automated translations.
    </p>
  </div>
</div>

{/* Action Buttons */}
<div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-100">
  {/* Cancel Button */}
  <button
    type="button"
    onClick={onCancel}
    disabled={isLoading}
    className={cn(
      'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
      'text-gray-700 bg-gray-100',
      'hover:bg-gray-200 active:bg-gray-300',
      'transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    Cancel
  </button>

  {/* Re-translate All Button (Destructive) */}
  <button
    type="button"
    onClick={onRetranslateAll}
    disabled={isLoading}
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
    {isLoading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>Processing...</span>
      </>
    ) : (
      'Re-translate All'
    )}
  </button>

  {/* Keep Manual Edits Button (Primary) */}
  <button
    ref={keepButtonRef}
    type="button"
    onClick={onKeepManualEdits}
    disabled={isLoading}
    className={cn(
      'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
      'text-white',
      'bg-gradient-to-r from-[#FF385C] to-[#E31C5F]',
      'hover:from-[#E31C5F] hover:to-[#C91350]',
      'active:from-[#C91350] active:to-[#B01145]',
      'transition-all duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'inline-flex items-center justify-center gap-2'
    )}
  >
    {isLoading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>Saving...</span>
      </>
    ) : (
      'Keep Manual Edits'
    )}
  </button>
</div>
```

**Acceptance Criteria:**
- [ ] Cancel button uses secondary styling (gray background)
- [ ] Re-translate All button uses destructive styling (red background)
- [ ] Keep Manual Edits button uses primary styling (Airbnb pink gradient)
- [ ] Prominent warning box above buttons for re-translate option
- [ ] Loading state shows spinner and disables all buttons
- [ ] Buttons stack vertically on small screens (`flex-col sm:flex-row`)
- [ ] Primary action (Keep) receives initial focus

---

### Task 8: Add Keyboard Accessibility (5 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Objective:** Ensure full keyboard navigation and accessibility.

**Implementation Notes:**

1. Radix Dialog handles most accessibility automatically:
   - Focus trap within dialog
   - Escape key to close (already handled with loading check)
   - Portal for proper DOM placement
   - ARIA attributes

2. Additional accessibility already included:
   - `aria-label` on close button
   - `aria-hidden` on decorative icons
   - `aria-describedby` on Dialog.Content
   - `aria-label` on languages list

3. Verify tab order:
   - First focusable: Close button (X)
   - Language list items (not focusable, display only)
   - Cancel button
   - Re-translate All button
   - Keep Manual Edits button (initial focus via `ref`)

**Acceptance Criteria:**
- [ ] Tab key navigates through all interactive elements
- [ ] Escape key closes dialog (when not loading)
- [ ] Focus trapped within dialog
- [ ] Screen reader announces dialog title and description
- [ ] All buttons have visible focus indicators

---

### Task 9: Create Barrel Export (3 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/index.ts`

**Objective:** Create barrel export file for the ManualEditWarning module.

**Implementation:**

```typescript
/**
 * ManualEditWarning Module Exports
 *
 * @module TranslationManagement/ManualEditWarning
 * @lastModified 2026-01-19
 */

export { ManualEditWarningDialog } from './ManualEditWarningDialog';
export type { ManualEditWarningDialogProps } from './ManualEditWarningDialog';
```

**Acceptance Criteria:**
- [ ] Component exported
- [ ] Props type exported
- [ ] Module-level JSDoc comment

---

### Task 10: Update Parent Index Exports (5 min)

**File:** `/src/components/TranslationManagement/index.ts`

**Objective:** Create or update the parent barrel export to include ManualEditWarning.

**Implementation (create file if not exists):**

```typescript
/**
 * TranslationManagement Module Exports
 *
 * Central export point for all translation management components.
 * Epic 5 - Owner Translation Management
 *
 * @module TranslationManagement
 * @lastModified 2026-01-19
 */

// ManualEditWarning (REQ-355)
export {
  ManualEditWarningDialog,
  type ManualEditWarningDialogProps,
} from './ManualEditWarning';

// Future exports for other translation management components:
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export { TranslationEditor } from './TranslationEditor';
// export { TranslationStatusWidget } from './TranslationStatusWidget';
```

**Acceptance Criteria:**
- [ ] File exists at `/src/components/TranslationManagement/index.ts`
- [ ] ManualEditWarning exports included
- [ ] Prepared for future component exports

---

### Task 11: Write Unit Tests - Rendering (10 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx`

**Objective:** Test dialog rendering states.

**Implementation:**

```typescript
/**
 * ManualEditWarningDialog Unit Tests
 *
 * @module TranslationManagement/ManualEditWarning/__tests__
 * @lastModified 2026-01-19
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ManualEditWarningDialog } from '../ManualEditWarningDialog';

// Mock callbacks
const mockOnKeepManualEdits = vi.fn();
const mockOnRetranslateAll = vi.fn();
const mockOnCancel = vi.fn();

const defaultProps = {
  isOpen: true,
  affectedLanguages: ['fr', 'es', 'de'] as const,
  entityType: 'article' as const,
  entityName: 'Test Article',
  onKeepManualEdits: mockOnKeepManualEdits,
  onRetranslateAll: mockOnRetranslateAll,
  onCancel: mockOnCancel,
  isLoading: false,
};

describe('ManualEditWarningDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Manual Translations Exist')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ManualEditWarningDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render when affectedLanguages is empty', () => {
      render(<ManualEditWarningDialog {...defaultProps} affectedLanguages={[]} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays entity name when provided', () => {
      render(<ManualEditWarningDialog {...defaultProps} />);

      expect(screen.getByText(/Test Article/)).toBeInTheDocument();
    });

    it('handles missing entity name gracefully', () => {
      render(<ManualEditWarningDialog {...defaultProps} entityName={undefined} />);

      expect(screen.getByText(/source article content/)).toBeInTheDocument();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created with proper imports
- [ ] Tests rendering when open/closed
- [ ] Tests empty languages array handling
- [ ] Tests entity name display

---

### Task 12: Write Unit Tests - Languages Display (10 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx`

**Objective:** Test affected languages list display.

**Implementation (add to test file):**

```typescript
describe('Affected Languages Display', () => {
  it('displays all affected languages with flags', () => {
    render(<ManualEditWarningDialog {...defaultProps} />);

    // Check language names appear
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
  });

  it('displays Manual badge for each language', () => {
    render(<ManualEditWarningDialog {...defaultProps} />);

    const manualBadges = screen.getAllByText('Manual');
    expect(manualBadges).toHaveLength(3);
  });

  it('uses correct pluralization for single language', () => {
    render(
      <ManualEditWarningDialog
        {...defaultProps}
        affectedLanguages={['fr']}
      />
    );

    expect(screen.getByText(/language has manual edits/)).toBeInTheDocument();
  });

  it('uses correct pluralization for multiple languages', () => {
    render(<ManualEditWarningDialog {...defaultProps} />);

    expect(screen.getByText(/languages have manual edits/)).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests language flags and names display
- [ ] Tests Manual badge appears for each language
- [ ] Tests singular/plural text handling

---

### Task 13: Write Unit Tests - Callbacks (10 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx`

**Objective:** Test callback invocations on user actions.

**Implementation (add to test file):**

```typescript
describe('Callback Handling', () => {
  it('calls onKeepManualEdits when Keep button clicked', async () => {
    const user = userEvent.setup();
    render(<ManualEditWarningDialog {...defaultProps} />);

    const keepButton = screen.getByRole('button', { name: /keep manual edits/i });
    await user.click(keepButton);

    expect(mockOnKeepManualEdits).toHaveBeenCalledTimes(1);
  });

  it('calls onRetranslateAll when Re-translate button clicked', async () => {
    const user = userEvent.setup();
    render(<ManualEditWarningDialog {...defaultProps} />);

    const retranslateButton = screen.getByRole('button', { name: /re-translate all/i });
    await user.click(retranslateButton);

    expect(mockOnRetranslateAll).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button clicked', async () => {
    const user = userEvent.setup();
    render(<ManualEditWarningDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when close button clicked', async () => {
    const user = userEvent.setup();
    render(<ManualEditWarningDialog {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    await user.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Escape key pressed', async () => {
    const user = userEvent.setup();
    render(<ManualEditWarningDialog {...defaultProps} />);

    await user.keyboard('{Escape}');

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
```

**Acceptance Criteria:**
- [ ] Tests onKeepManualEdits callback
- [ ] Tests onRetranslateAll callback
- [ ] Tests onCancel callback (button + close + escape)

---

### Task 14: Write Unit Tests - Loading State (5 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx`

**Objective:** Test loading state behavior.

**Implementation (add to test file):**

```typescript
describe('Loading State', () => {
  it('disables all buttons when loading', () => {
    render(<ManualEditWarningDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeDisabled();
  });

  it('shows loading spinner on primary button', () => {
    render(<ManualEditWarningDialog {...defaultProps} isLoading={true} />);

    // The loading spinner has animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not close on Escape when loading', async () => {
    const user = userEvent.setup();
    render(<ManualEditWarningDialog {...defaultProps} isLoading={true} />);

    await user.keyboard('{Escape}');

    expect(mockOnCancel).not.toHaveBeenCalled();
  });
});
```

**Acceptance Criteria:**
- [ ] Tests buttons disabled during loading
- [ ] Tests loading spinner visibility
- [ ] Tests escape key blocked during loading

---

### Task 15: Verify Build and TypeScript (5 min)

**Objective:** Ensure component compiles without errors.

**Commands:**
```bash
# Type check
npx tsc --noEmit

# Build check
npm run build

# Run component tests
npm run test -- ManualEditWarningDialog
```

**Acceptance Criteria:**
- [ ] No TypeScript compilation errors
- [ ] No build errors
- [ ] All unit tests pass

---

## Complete Component File

For reference, here is the complete assembled component:

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

```typescript
'use client';

/**
 * ManualEditWarningDialog Component
 *
 * Displays a warning dialog when source content is updated and manual
 * translations exist. Allows users to choose between preserving manual
 * edits or re-translating all affected languages.
 *
 * @module TranslationManagement/ManualEditWarning/ManualEditWarningDialog
 * @see docs/REQ-355-create-manualeditwarningdialog-component-detailed.md
 * @lastModified 2026-01-19
 */

import { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { localeMetadata, type SupportedLocale } from '@/lib/i18n/config';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for ManualEditWarningDialog component.
 * @see REQ-355 - Manual Edit Warning Dialog
 */
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Languages with manual edits that would be affected */
  affectedLanguages: SupportedLanguage[];
  /** Entity type being updated */
  entityType: 'article' | 'item' | 'link';
  /** Entity name for display context (optional) */
  entityName?: string;
  /** Callback when user chooses to keep manual edits */
  onKeepManualEdits: () => void;
  /** Callback when user chooses to re-translate all */
  onRetranslateAll: () => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
  /** Loading state during action processing */
  isLoading?: boolean;
}

// =============================================================================
// Component
// =============================================================================

/**
 * ManualEditWarningDialog - Warning dialog for manual translation preservation.
 *
 * Displays when source content is updated and manual translations exist,
 * giving users the choice to keep their manual edits or re-translate all.
 *
 * @example
 * <ManualEditWarningDialog
 *   isOpen={showWarning}
 *   affectedLanguages={['fr', 'es']}
 *   entityType="article"
 *   entityName="How to Use the Dishwasher"
 *   onKeepManualEdits={handleKeepEdits}
 *   onRetranslateAll={handleRetranslate}
 *   onCancel={() => setShowWarning(false)}
 *   isLoading={isSaving}
 * />
 */
export function ManualEditWarningDialog({
  isOpen,
  affectedLanguages,
  entityType,
  entityName,
  onKeepManualEdits,
  onRetranslateAll,
  onCancel,
  isLoading = false,
}: ManualEditWarningDialogProps) {
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  // Focus primary action on open
  useEffect(() => {
    if (isOpen && keepButtonRef.current) {
      const timer = setTimeout(() => {
        keepButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Early return if no affected languages
  if (affectedLanguages.length === 0) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 bg-black/50 z-50',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'z-50 w-full max-w-md mx-4',
            'bg-white rounded-xl shadow-xl',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'focus:outline-none'
          )}
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isLoading) e.preventDefault();
          }}
          aria-describedby="manual-edit-warning-description"
        >
          {/* Header with Warning Icon */}
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
            </div>
            <div className="flex-1 pr-8">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Manual Translations Exist
              </Dialog.Title>
              <Dialog.Description
                id="manual-edit-warning-description"
                className="mt-2 text-sm text-gray-600"
              >
                {entityName ? (
                  <>
                    The source content for <span className="font-medium">&quot;{entityName}&quot;</span> has been updated.
                  </>
                ) : (
                  <>The source {entityType} content has been updated.</>
                )}{' '}
                The following {affectedLanguages.length === 1 ? 'language has' : 'languages have'} manual edits that may no longer match:
              </Dialog.Description>
            </div>

            {/* Close button */}
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={isLoading}
                className={cn(
                  'absolute top-4 right-4 p-2 rounded-lg',
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Affected Languages List */}
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <ul className="space-y-2" aria-label="Languages with manual edits">
                {affectedLanguages.map((langCode) => {
                  const metadata = localeMetadata[langCode as SupportedLocale];
                  if (!metadata) return null;

                  return (
                    <li
                      key={langCode}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <span className="text-lg" aria-hidden="true">
                        {metadata.flag || '🌐'}
                      </span>
                      <span className="flex-1">
                        {metadata.name}
                        {metadata.nativeName !== metadata.name && (
                          <span className="text-gray-500 ml-1">
                            ({metadata.nativeName})
                          </span>
                        )}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
                        Manual
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Re-translate Warning */}
          <div className="px-6 pb-4">
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-red-700">
                <strong>Warning:</strong> Choosing &quot;Re-translate All&quot; will permanently replace
                your manual edits with new automated translations.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-100">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
                'text-gray-700 bg-gray-100',
                'hover:bg-gray-200 active:bg-gray-300',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Cancel
            </button>

            {/* Re-translate All Button (Destructive) */}
            <button
              type="button"
              onClick={onRetranslateAll}
              disabled={isLoading}
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
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Processing...</span>
                </>
              ) : (
                'Re-translate All'
              )}
            </button>

            {/* Keep Manual Edits Button (Primary) */}
            <button
              ref={keepButtonRef}
              type="button"
              onClick={onKeepManualEdits}
              disabled={isLoading}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
                'text-white',
                'bg-gradient-to-r from-[#FF385C] to-[#E31C5F]',
                'hover:from-[#E31C5F] hover:to-[#C91350]',
                'active:from-[#C91350] active:to-[#B01145]',
                'transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'inline-flex items-center justify-center gap-2'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                'Keep Manual Edits'
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ManualEditWarningDialog;
```

---

## Verification Checklist

After completing all tasks, verify:

| Item | Status |
|------|--------|
| Component renders when isOpen=true | [ ] |
| Component hidden when isOpen=false | [ ] |
| Component hidden when affectedLanguages empty | [ ] |
| All affected languages display with flags | [ ] |
| onKeepManualEdits fires on button click | [ ] |
| onRetranslateAll fires on button click | [ ] |
| onCancel fires on Cancel/Close/Escape | [ ] |
| Loading state disables all buttons | [ ] |
| Loading state shows spinner | [ ] |
| Escape blocked during loading | [ ] |
| Tab navigation works correctly | [ ] |
| Focus trapping works | [ ] |
| Screen reader announces dialog properly | [ ] |
| TypeScript compiles without errors | [ ] |
| All unit tests pass | [ ] |

---

## References

- **Overview Document:** `/docs/REQ-355-create-manualeditwarningdialog-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-325)
- **Pattern References:**
  - `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
  - `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
- **Radix Dialog:** https://www.radix-ui.com/primitives/docs/components/dialog

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
