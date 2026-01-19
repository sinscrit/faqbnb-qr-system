# REQ-353: Create BulkTranslationBar Component - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-353
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.1
**Size:** M (Medium)
**Overview Document:** [REQ-353-create-bulktranslationbar-component-overview.md](./REQ-353-create-bulktranslationbar-component-overview.md)

---

## Purpose

This document provides granular, step-by-step implementation tasks for creating the `BulkTranslationBar` component. Each task is designed to be approximately 1 story point, executable independently, and verifiable through specific acceptance criteria.

---

## Prerequisites

Before starting implementation, ensure:

1. **Epic 1 Foundation is complete:**
   - Translation tables exist: `article_translations`, `item_translations`, `link_translations`, `tag_translations`
   - Translation jobs table: `translation_jobs`
   - Translation service: `/src/lib/translation-service/`
   - Job queue: `/src/lib/job-queue/`

2. **Required types are available:**
   - `SupportedLanguage` type from `/src/lib/translation-service/translation-service.types.ts`
   - `SUPPORTED_LANGUAGES` constant from same file

3. **Directory structure exists or will be created:**
   - `/src/components/TranslationManagement/` folder

---

## Task Breakdown

### Task 1: Create TranslationManagement Directory Structure

**File:** `/src/components/TranslationManagement/`

**Objective:** Establish the folder structure for all translation management components.

**Steps:**

1.1. Create the base directory `/src/components/TranslationManagement/` if it doesn't exist

1.2. Create subdirectory `/src/components/TranslationManagement/BulkTranslationBar/`

1.3. Create empty placeholder files:
   - `/src/components/TranslationManagement/index.ts`
   - `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

**Verification:**
- [ ] Directory `/src/components/TranslationManagement/` exists
- [ ] Subdirectory `/src/components/TranslationManagement/BulkTranslationBar/` exists
- [ ] Both index.ts files are created (can be empty initially)

**Estimated Effort:** 0.5 SP

---

### Task 2: Create BulkTranslationBar Type Definitions

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts`

**Objective:** Define all TypeScript interfaces and types for the BulkTranslationBar component.

**Steps:**

2.1. Create the types file with proper header documentation:
```typescript
/**
 * BulkTranslationBar Type Definitions
 *
 * Types and interfaces for the bulk translation action bar component.
 * Part of REQ-353: Create BulkTranslationBar Component
 *
 * @module TranslationManagement/BulkTranslationBar/types
 * @created 2026-01-19
 */
```

2.2. Import required types:
```typescript
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

2.3. Define `SelectedTranslationItem` type:
```typescript
/**
 * Represents a selected item for bulk translation operations.
 */
export interface SelectedTranslationItem {
  /** Unique identifier of the entity */
  id: string;
  /** Type of the translatable entity */
  entityType: 'article' | 'item' | 'link';
}
```

2.4. Define `BulkTranslationProgress` interface:
```typescript
/**
 * Progress information during bulk translation operations.
 */
export interface BulkTranslationProgress {
  /** Number of items processed so far */
  current: number;
  /** Total number of items to process */
  total: number;
  /** Optional progress message for display */
  message?: string;
}
```

2.5. Define main `BulkTranslationBarProps` interface:
```typescript
/**
 * Props for the BulkTranslationBar component.
 */
export interface BulkTranslationBarProps {
  /** Number of items currently selected */
  selectedCount: number;

  /** Selected item IDs with their entity types */
  selectedItems: SelectedTranslationItem[];

  /** Callback to re-translate all selected items to all languages */
  onRetranslateAll: () => Promise<void>;

  /** Callback to re-translate selected items to specific languages */
  onRetranslateLanguages: (languages: SupportedLanguage[]) => Promise<void>;

  /** Callback to exit selection mode */
  onExitSelection: () => void;

  /** Whether a bulk operation is in progress */
  loading?: boolean;

  /** Progress information during bulk operations */
  progress?: BulkTranslationProgress;

  /** Whether any selected items have manual translation edits */
  hasManualEdits?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

2.6. Define internal `ActionButtonProps` interface:
```typescript
/**
 * Props for the internal ActionButton component.
 * @internal
 */
export interface ActionButtonProps {
  /** Icon component to render */
  icon: React.ElementType;
  /** Button label (hidden on mobile, visible on desktop) */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant affecting color styling */
  variant?: 'primary' | 'secondary' | 'destructive';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

2.7. Define `ManualEditConfirmation` type for dialog state:
```typescript
/**
 * State for manual edit confirmation dialog.
 */
export interface ManualEditConfirmationState {
  /** Whether the confirmation dialog is open */
  isOpen: boolean;
  /** Pending action to execute after confirmation */
  pendingAction: 'retranslateAll' | 'retranslateLanguages' | null;
  /** Languages to re-translate (for retranslateLanguages action) */
  pendingLanguages?: SupportedLanguage[];
}
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All interfaces are properly documented with JSDoc comments
- [ ] `SupportedLanguage` import resolves correctly
- [ ] Export all types from the file

**Estimated Effort:** 1 SP

---

### Task 3: Create Internal ActionButton Component

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` (internal component section)

**Objective:** Create a reusable internal button component matching the existing `BulkActionsBar` pattern.

**Steps:**

3.1. Create the main component file with imports:
```typescript
'use client';

/**
 * BulkTranslationBar Component
 *
 * A floating action bar for bulk translation operations on selected items.
 * Appears at the bottom of the viewport when items are selected.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @see docs/REQ-353-create-bulktranslationbar-component-overview.md
 * @created 2026-01-19
 */

import { useState } from 'react';
import { Check, Languages, Globe, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActionButtonProps, BulkTranslationBarProps } from './BulkTranslationBar.types';
```

3.2. Define variant styles constant:
```typescript
/**
 * Variant-based styling for action buttons.
 * Matches the BulkActionsBar styling from ItemManager.
 */
const variantStyles = {
  primary: 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};
```

3.3. Implement ActionButton internal component:
```typescript
/**
 * ActionButton - Reusable internal button component.
 *
 * Features:
 * - Minimum 44x44px touch target for accessibility
 * - Responsive label (hidden on mobile)
 * - Variant-based color styling
 * - Focus ring for keyboard navigation
 *
 * @internal
 */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        // Base styles
        'flex items-center justify-center gap-1.5',
        // Minimum touch target size (44x44px)
        'min-h-[44px] min-w-[44px]',
        // Padding for content
        'px-3 py-2',
        // Border radius
        'rounded-md',
        // Typography
        'text-sm font-medium',
        // Transitions
        'transition-colors duration-150',
        // Focus ring for keyboard navigation
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'focus:ring-[#FF385C] focus:ring-offset-white',
        // Variant styles
        variantStyles[variant],
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
```

**Verification:**
- [ ] ActionButton renders with correct styling for all three variants
- [ ] Labels hidden on mobile viewport (< 640px)
- [ ] Touch targets are at least 44x44 pixels
- [ ] Focus ring visible on keyboard focus
- [ ] Disabled state shows reduced opacity and cursor change

**Estimated Effort:** 1 SP

---

### Task 4: Implement BulkTranslationBar Main Component Structure

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Objective:** Create the main component structure with proper positioning, animation, and accessibility.

**Steps:**

4.1. Implement the main export function with conditional rendering:
```typescript
/**
 * BulkTranslationBar - Floating action bar for bulk translation operations.
 *
 * This component renders a fixed-position action bar at the bottom of the
 * viewport when items are selected. Provides quick access to bulk translation
 * operations and gracefully handles loading states.
 *
 * Features:
 * - Fixed positioning at viewport bottom
 * - iOS safe area support
 * - Slide-up animation on appear
 * - Responsive button layout (icons only on mobile)
 * - Loading state with spinner and progress
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <BulkTranslationBar
 *   selectedCount={5}
 *   selectedItems={selectedItems}
 *   onRetranslateAll={handleRetranslateAll}
 *   onRetranslateLanguages={handleRetranslateLanguages}
 *   onExitSelection={handleExitSelection}
 * />
 * ```
 */
export function BulkTranslationBar({
  selectedCount,
  selectedItems,
  onRetranslateAll,
  onRetranslateLanguages,
  onExitSelection,
  loading = false,
  progress,
  hasManualEdits = false,
  className,
}: BulkTranslationBarProps) {
  // Don't render if no items selected
  if (selectedCount === 0) {
    return null;
  }

  // Component implementation continues in next steps...
}
```

4.2. Add state for language selector dialog:
```typescript
  // State for language selector dialog (implemented in Task 4.2)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // State for manual edit confirmation dialog
  const [showManualEditWarning, setShowManualEditWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<'all' | 'languages' | null>(null);
  const [pendingLanguages, setPendingLanguages] = useState<SupportedLanguage[]>([]);
```

4.3. Implement the wrapper div with proper attributes:
```typescript
  return (
    <div
      role="toolbar"
      aria-label={`Bulk translation actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-40',
        // Background and border
        'bg-white border-t border-gray-200',
        // Shadow for elevation (matches BulkActionsBar)
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
        // Safe area padding for iOS
        'pb-[env(safe-area-inset-bottom)]',
        // Animation - slide up from bottom
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
    >
      {/* Content container with max width */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Inner content implemented in Task 5 */}
      </div>
    </div>
  );
```

**Verification:**
- [ ] Component does not render when `selectedCount === 0`
- [ ] Component is fixed at viewport bottom
- [ ] iOS safe area padding is applied
- [ ] Slide-up animation plays on mount
- [ ] `role="toolbar"` is present
- [ ] `aria-label` includes selection count

**Estimated Effort:** 1 SP

---

### Task 5: Implement Selection Indicator and Action Buttons Layout

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Objective:** Add the selection count indicator and action buttons with proper layout.

**Steps:**

5.1. Implement the flex container with three sections:
```typescript
<div className="flex items-center justify-between gap-2 sm:gap-3">
  {/* Left section: Selection count indicator */}
  {/* Center section: Action buttons */}
  {/* Right section: Cancel button */}
</div>
```

5.2. Implement the selection count indicator (left section):
```typescript
{/* Left section: Selection count indicator */}
<div className="flex items-center gap-2 min-w-0">
  <div
    className="flex items-center justify-center h-8 w-8 rounded-full bg-[#FFF0F3] flex-shrink-0"
    aria-hidden="true"
  >
    <Check className="h-4 w-4 text-[#FF385C]" />
  </div>
  <span className="text-sm font-medium text-gray-900 truncate">
    {selectedCount} selected
  </span>
  {/* Screen reader announcement */}
  <span className="sr-only">
    Currently {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected for translation
  </span>
</div>
```

5.3. Implement the action buttons section (center):
```typescript
{/* Center section: Action buttons */}
<div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
  {loading ? (
    <div className="flex items-center gap-2 text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="text-sm">
        {progress
          ? `Re-translating... ${progress.current}/${progress.total}`
          : 'Processing...'}
      </span>
    </div>
  ) : (
    <>
      {/* Re-translate All button */}
      <ActionButton
        icon={Languages}
        label="Re-translate All"
        onClick={handleRetranslateAll}
        variant="primary"
        disabled={loading}
      />

      {/* Re-translate Languages button */}
      <ActionButton
        icon={Globe}
        label="Languages..."
        onClick={() => setShowLanguageSelector(true)}
        variant="secondary"
        disabled={loading}
      />
    </>
  )}
</div>
```

5.4. Implement the cancel button section (right):
```typescript
{/* Right section: Cancel button with divider */}
<div className="flex items-center gap-2 sm:gap-3">
  {/* Vertical divider (hidden on mobile) */}
  <div
    className="hidden sm:block w-px h-6 bg-gray-200"
    aria-hidden="true"
  />

  {/* Cancel/Exit button */}
  <button
    type="button"
    onClick={onExitSelection}
    aria-label="Cancel selection"
    title="Cancel selection"
    disabled={loading}
    className={cn(
      'flex items-center justify-center',
      'min-h-[44px] min-w-[44px]',
      'px-2',
      'rounded-md',
      'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
      loading && 'opacity-50 cursor-not-allowed'
    )}
  >
    <X className="h-5 w-5" aria-hidden="true" />
    <span className="hidden sm:inline ml-1.5 text-sm font-medium">
      Cancel
    </span>
  </button>
</div>
```

**Verification:**
- [ ] Selection count displays correctly with pink background check icon
- [ ] "Re-translate All" button shows with Languages icon
- [ ] "Languages..." button shows with Globe icon
- [ ] Cancel button shows X icon with optional "Cancel" text on desktop
- [ ] Loading state shows spinner and progress text
- [ ] All buttons disabled during loading
- [ ] Responsive layout works on mobile and desktop

**Estimated Effort:** 1.5 SP

---

### Task 6: Implement Manual Edit Confirmation Handler

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Objective:** Add logic to warn users when re-translating items with manual edits.

**Steps:**

6.1. Create handler function for "Re-translate All":
```typescript
/**
 * Handle re-translate all action with manual edit check.
 */
const handleRetranslateAll = async () => {
  if (hasManualEdits) {
    // Show confirmation dialog before proceeding
    setPendingAction('all');
    setShowManualEditWarning(true);
    return;
  }

  // No manual edits, proceed directly
  await onRetranslateAll();
};
```

6.2. Create handler for language-specific re-translation:
```typescript
/**
 * Handle re-translate specific languages with manual edit check.
 */
const handleRetranslateLanguages = async (languages: SupportedLanguage[]) => {
  setShowLanguageSelector(false);

  if (hasManualEdits) {
    // Show confirmation dialog before proceeding
    setPendingAction('languages');
    setPendingLanguages(languages);
    setShowManualEditWarning(true);
    return;
  }

  // No manual edits, proceed directly
  await onRetranslateLanguages(languages);
};
```

6.3. Create confirmation dialog handler:
```typescript
/**
 * Handle confirmation of manual edit warning.
 * @param overwrite - Whether to overwrite manual edits
 */
const handleManualEditConfirm = async (overwrite: boolean) => {
  setShowManualEditWarning(false);

  if (!overwrite) {
    // User chose to keep manual edits, cancel operation
    setPendingAction(null);
    setPendingLanguages([]);
    return;
  }

  // User chose to overwrite, proceed with pending action
  if (pendingAction === 'all') {
    await onRetranslateAll();
  } else if (pendingAction === 'languages' && pendingLanguages.length > 0) {
    await onRetranslateLanguages(pendingLanguages);
  }

  setPendingAction(null);
  setPendingLanguages([]);
};
```

6.4. Add inline confirmation dialog (simple version, can be enhanced later):
```typescript
{/* Manual Edit Warning Dialog - Basic inline version */}
{showManualEditWarning && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="manual-edit-warning-title"
    aria-describedby="manual-edit-warning-desc"
  >
    <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 p-6">
      <h2
        id="manual-edit-warning-title"
        className="text-lg font-semibold text-gray-900 mb-2"
      >
        Manual Edits Detected
      </h2>
      <p
        id="manual-edit-warning-desc"
        className="text-sm text-gray-600 mb-4"
      >
        Some selected items have manually edited translations. Re-translating
        will overwrite these edits. What would you like to do?
      </p>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => handleManualEditConfirm(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleManualEditConfirm(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          Keep Manual Edits
        </button>
        <button
          type="button"
          onClick={() => handleManualEditConfirm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-[#FF385C] rounded-md hover:bg-[#E31C5F] focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          Re-translate All
        </button>
      </div>
    </div>
  </div>
)}
```

**Verification:**
- [ ] When `hasManualEdits` is false, actions proceed immediately
- [ ] When `hasManualEdits` is true, confirmation dialog appears
- [ ] "Cancel" closes dialog without action
- [ ] "Keep Manual Edits" closes dialog without action
- [ ] "Re-translate All" proceeds with re-translation
- [ ] Dialog has proper ARIA attributes for accessibility
- [ ] Focus is trapped within dialog when open

**Estimated Effort:** 1.5 SP

---

### Task 7: Create Barrel Export for BulkTranslationBar

**File:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

**Objective:** Create the public exports for the BulkTranslationBar module.

**Steps:**

7.1. Create the barrel export file:
```typescript
/**
 * BulkTranslationBar Module Exports
 *
 * Public exports for the BulkTranslationBar component and related types.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @created 2026-01-19
 */

// Component exports
export { BulkTranslationBar } from './BulkTranslationBar';
export { default } from './BulkTranslationBar';

// Type exports
export type {
  BulkTranslationBarProps,
  BulkTranslationProgress,
  SelectedTranslationItem,
  ManualEditConfirmationState,
} from './BulkTranslationBar.types';
```

7.2. Add default export to the main component file:
```typescript
// At the end of BulkTranslationBar.tsx
export default BulkTranslationBar;
```

**Verification:**
- [ ] Named export `BulkTranslationBar` is accessible
- [ ] Default export is accessible
- [ ] All type exports compile without errors
- [ ] Import from `@/components/TranslationManagement/BulkTranslationBar` works

**Estimated Effort:** 0.5 SP

---

### Task 8: Update TranslationManagement Index Exports

**File:** `/src/components/TranslationManagement/index.ts`

**Objective:** Add BulkTranslationBar to the main TranslationManagement barrel exports.

**Steps:**

8.1. Create or update the TranslationManagement index file:
```typescript
/**
 * TranslationManagement Module Exports
 *
 * Central export point for all translation management components.
 * Part of L10N Epic 5 - Owner Translation Management.
 *
 * @module TranslationManagement
 * @created 2026-01-19
 */

// BulkTranslationBar exports
export {
  BulkTranslationBar,
  default as BulkTranslationBarDefault,
} from './BulkTranslationBar';

export type {
  BulkTranslationBarProps,
  BulkTranslationProgress,
  SelectedTranslationItem,
} from './BulkTranslationBar';

// Future exports will be added here as components are created:
// - TranslationPreviewPanel
// - TranslationEditor
// - TranslationStatusWidget
// - TranslationStatusColumn
// - TranslationStatusFilter
// - LanguagePreference
// - ManualEditWarning
```

**Verification:**
- [ ] Import from `@/components/TranslationManagement` works
- [ ] `BulkTranslationBar` is accessible from the barrel export
- [ ] All exported types are accessible
- [ ] No circular dependency warnings

**Estimated Effort:** 0.5 SP

---

### Task 9: Add Unit Tests for BulkTranslationBar

**File:** `/src/components/TranslationManagement/BulkTranslationBar/__tests__/BulkTranslationBar.test.tsx`

**Objective:** Write comprehensive unit tests for the BulkTranslationBar component.

**Steps:**

9.1. Create the test file with proper setup:
```typescript
/**
 * BulkTranslationBar Unit Tests
 *
 * @module TranslationManagement/BulkTranslationBar/tests
 * @created 2026-01-19
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BulkTranslationBar } from '../BulkTranslationBar';
import type { BulkTranslationBarProps } from '../BulkTranslationBar.types';

// Default props for testing
const defaultProps: BulkTranslationBarProps = {
  selectedCount: 5,
  selectedItems: [
    { id: '1', entityType: 'article' },
    { id: '2', entityType: 'item' },
    { id: '3', entityType: 'link' },
    { id: '4', entityType: 'article' },
    { id: '5', entityType: 'item' },
  ],
  onRetranslateAll: vi.fn().mockResolvedValue(undefined),
  onRetranslateLanguages: vi.fn().mockResolvedValue(undefined),
  onExitSelection: vi.fn(),
};
```

9.2. Write rendering tests:
```typescript
describe('BulkTranslationBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('does not render when selectedCount is 0', () => {
      render(<BulkTranslationBar {...defaultProps} selectedCount={0} />);
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('renders with correct selection count', () => {
      render(<BulkTranslationBar {...defaultProps} />);
      expect(screen.getByText('5 selected')).toBeInTheDocument();
    });

    it('renders Re-translate All button', () => {
      render(<BulkTranslationBar {...defaultProps} />);
      expect(screen.getByRole('button', { name: /re-translate all/i })).toBeInTheDocument();
    });

    it('renders Languages button', () => {
      render(<BulkTranslationBar {...defaultProps} />);
      expect(screen.getByRole('button', { name: /languages/i })).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      render(<BulkTranslationBar {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<BulkTranslationBar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', expect.stringContaining('5 selected'));
    });
  });
});
```

9.3. Write action tests:
```typescript
describe('Actions', () => {
  it('calls onRetranslateAll when Re-translate All clicked', async () => {
    const onRetranslateAll = vi.fn().mockResolvedValue(undefined);
    render(<BulkTranslationBar {...defaultProps} onRetranslateAll={onRetranslateAll} />);

    fireEvent.click(screen.getByRole('button', { name: /re-translate all/i }));

    await waitFor(() => {
      expect(onRetranslateAll).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onExitSelection when Cancel clicked', () => {
    const onExitSelection = vi.fn();
    render(<BulkTranslationBar {...defaultProps} onExitSelection={onExitSelection} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onExitSelection).toHaveBeenCalledTimes(1);
  });
});
```

9.4. Write loading state tests:
```typescript
describe('Loading State', () => {
  it('shows spinner when loading is true', () => {
    render(<BulkTranslationBar {...defaultProps} loading={true} />);
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it('shows progress when provided', () => {
    render(
      <BulkTranslationBar
        {...defaultProps}
        loading={true}
        progress={{ current: 3, total: 5 }}
      />
    );
    expect(screen.getByText(/3\/5/)).toBeInTheDocument();
  });

  it('disables Cancel button during loading', () => {
    render(<BulkTranslationBar {...defaultProps} loading={true} />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
```

9.5. Write manual edit warning tests:
```typescript
describe('Manual Edit Warning', () => {
  it('shows warning dialog when hasManualEdits and Re-translate All clicked', async () => {
    render(<BulkTranslationBar {...defaultProps} hasManualEdits={true} />);

    fireEvent.click(screen.getByRole('button', { name: /re-translate all/i }));

    await waitFor(() => {
      expect(screen.getByText(/manual edits detected/i)).toBeInTheDocument();
    });
  });

  it('does not show warning when hasManualEdits is false', async () => {
    const onRetranslateAll = vi.fn().mockResolvedValue(undefined);
    render(
      <BulkTranslationBar
        {...defaultProps}
        hasManualEdits={false}
        onRetranslateAll={onRetranslateAll}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /re-translate all/i }));

    await waitFor(() => {
      expect(onRetranslateAll).toHaveBeenCalled();
    });
    expect(screen.queryByText(/manual edits detected/i)).not.toBeInTheDocument();
  });
});
```

**Verification:**
- [ ] All tests pass with `npm test`
- [ ] Test coverage is above 80% for the component
- [ ] Tests cover rendering, actions, loading states, and manual edit warning
- [ ] No console errors during test execution

**Estimated Effort:** 2 SP

---

### Task 10: Add Accessibility Tests

**File:** `/src/components/TranslationManagement/BulkTranslationBar/__tests__/BulkTranslationBar.a11y.test.tsx`

**Objective:** Write accessibility-focused tests for the component.

**Steps:**

10.1. Create accessibility test file:
```typescript
/**
 * BulkTranslationBar Accessibility Tests
 *
 * @module TranslationManagement/BulkTranslationBar/tests
 * @created 2026-01-19
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BulkTranslationBar } from '../BulkTranslationBar';

expect.extend(toHaveNoViolations);

const defaultProps = {
  selectedCount: 3,
  selectedItems: [
    { id: '1', entityType: 'article' as const },
    { id: '2', entityType: 'item' as const },
    { id: '3', entityType: 'link' as const },
  ],
  onRetranslateAll: vi.fn(),
  onRetranslateLanguages: vi.fn(),
  onExitSelection: vi.fn(),
};
```

10.2. Write ARIA attribute tests:
```typescript
describe('BulkTranslationBar Accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<BulkTranslationBar {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper role="toolbar" attribute', () => {
    render(<BulkTranslationBar {...defaultProps} />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('buttons have accessible names via aria-label', () => {
    render(<BulkTranslationBar {...defaultProps} />);

    const retranslateAllBtn = screen.getByRole('button', { name: /re-translate all/i });
    const languagesBtn = screen.getByRole('button', { name: /languages/i });
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });

    expect(retranslateAllBtn).toHaveAttribute('aria-label');
    expect(languagesBtn).toHaveAttribute('aria-label');
    expect(cancelBtn).toHaveAttribute('aria-label');
  });

  it('includes screen reader text for selection count', () => {
    render(<BulkTranslationBar {...defaultProps} />);
    expect(screen.getByText(/currently 3 items selected/i)).toHaveClass('sr-only');
  });
});
```

10.3. Write touch target size tests:
```typescript
describe('Touch Target Compliance', () => {
  it('all buttons have minimum 44px touch targets', () => {
    render(<BulkTranslationBar {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      const styles = window.getComputedStyle(button);
      const minHeight = parseInt(styles.minHeight, 10);
      const minWidth = parseInt(styles.minWidth, 10);

      // Check class contains min-h-[44px] and min-w-[44px]
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('min-w-[44px]');
    });
  });
});
```

10.4. Write keyboard navigation tests:
```typescript
describe('Keyboard Navigation', () => {
  it('buttons are focusable via keyboard', () => {
    render(<BulkTranslationBar {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  it('focus ring is visible on focus', () => {
    render(<BulkTranslationBar {...defaultProps} />);

    const button = screen.getByRole('button', { name: /re-translate all/i });
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-[#FF385C]');
  });
});
```

**Verification:**
- [ ] axe accessibility audit passes with no violations
- [ ] All buttons have proper ARIA labels
- [ ] Touch targets meet 44px minimum
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announces selection count

**Estimated Effort:** 1 SP

---

## Task Summary Table

| Task | Description | File(s) | SP | Dependencies |
|------|-------------|---------|-----|--------------|
| 1 | Create directory structure | `/src/components/TranslationManagement/` | 0.5 | None |
| 2 | Create type definitions | `BulkTranslationBar.types.ts` | 1 | Task 1 |
| 3 | Create ActionButton component | `BulkTranslationBar.tsx` | 1 | Task 2 |
| 4 | Implement main component structure | `BulkTranslationBar.tsx` | 1 | Task 3 |
| 5 | Implement layout and buttons | `BulkTranslationBar.tsx` | 1.5 | Task 4 |
| 6 | Implement manual edit confirmation | `BulkTranslationBar.tsx` | 1.5 | Task 5 |
| 7 | Create barrel export | `index.ts` | 0.5 | Task 6 |
| 8 | Update TranslationManagement exports | `TranslationManagement/index.ts` | 0.5 | Task 7 |
| 9 | Write unit tests | `__tests__/BulkTranslationBar.test.tsx` | 2 | Task 6 |
| 10 | Write accessibility tests | `__tests__/BulkTranslationBar.a11y.test.tsx` | 1 | Task 6 |

**Total Estimated Effort:** 10.5 SP

---

## Implementation Order

```
Task 1: Directory Structure
    └── Task 2: Type Definitions
            └── Task 3: ActionButton Component
                    └── Task 4: Main Component Structure
                            └── Task 5: Layout and Buttons
                                    └── Task 6: Manual Edit Confirmation
                                            ├── Task 7: Barrel Export
                                            │       └── Task 8: TranslationManagement Exports
                                            ├── Task 9: Unit Tests
                                            └── Task 10: Accessibility Tests
```

Tasks 7-10 can be completed in parallel after Task 6.

---

## Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/index.ts` | Main barrel exports |
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Component barrel exports |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Main component |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts` | Type definitions |
| `/src/components/TranslationManagement/BulkTranslationBar/__tests__/BulkTranslationBar.test.tsx` | Unit tests |
| `/src/components/TranslationManagement/BulkTranslationBar/__tests__/BulkTranslationBar.a11y.test.tsx` | Accessibility tests |

---

## Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|------------------|
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | UI pattern, styling reference |
| `/src/lib/translation-service/translation-service.types.ts` | SupportedLanguage type, SUPPORTED_LANGUAGES constant |
| `/src/lib/i18n/config.ts` | Locale metadata for language display |
| `/src/lib/utils.ts` | `cn()` utility for class merging |

---

## Acceptance Criteria Checklist

- [ ] Component renders when items are selected (`selectedCount > 0`)
- [ ] Component does not render when no items are selected (`selectedCount === 0`)
- [ ] "Re-translate All" button triggers `onRetranslateAll` callback
- [ ] "Languages..." button is present and functional (opens dialog in Task 4.2)
- [ ] Cancel button calls `onExitSelection` callback
- [ ] Loading state shows spinner and disables buttons
- [ ] Progress indicator shows `X/Y` format when progress prop provided
- [ ] Manual edit warning dialog shown when `hasManualEdits === true`
- [ ] Minimum 44px touch targets on all interactive elements
- [ ] Proper ARIA labels for accessibility (`role="toolbar"`, etc.)
- [ ] Responsive layout (icons-only on mobile < 640px)
- [ ] iOS safe area support (`pb-[env(safe-area-inset-bottom)]`)
- [ ] Slide-up animation on appear
- [ ] Focus ring visible on keyboard navigation
- [ ] All unit tests pass
- [ ] All accessibility tests pass
- [ ] TypeScript compiles without errors
- [ ] Build succeeds without warnings

---

## Notes for Implementer

1. **Follow existing patterns:** This component closely mirrors `BulkActionsBar.tsx`. Use it as the primary reference for styling and structure.

2. **Language Selector Dialog:** Task 4.2 will create the `LanguageSelectorDialog` component. For now, the "Languages..." button should set `showLanguageSelector` state but the dialog itself will be integrated separately.

3. **API Integration:** The actual API call to `/api/translations/retranslate` is handled by the parent component. This component only invokes callbacks.

4. **Testing:** Use vitest with `@testing-library/react`. If `jest-axe` is not installed, add it as a dev dependency or skip those specific tests initially.

5. **Animations:** The `animate-in` and `slide-in-from-bottom` classes come from Tailwind CSS animations. Ensure these are configured in `tailwind.config.ts`.

---

## References

- [REQ-353-create-bulktranslationbar-component-overview.md](./REQ-353-create-bulktranslationbar-component-overview.md)
- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Task 4.1
- [BulkActionsBar.tsx](/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx) - UI pattern reference
- [translation-service.types.ts](/src/lib/translation-service/translation-service.types.ts) - Type definitions
