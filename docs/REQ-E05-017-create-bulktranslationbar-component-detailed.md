# REQ-E05-017: Create BulkTranslationBar Component - Detailed Task Breakdown

**Document Created:** 2026-01-20 19:45 UTC
**Last Modified:** 2026-01-20 19:45 UTC
**Request ID:** REQ-E05-017
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.1
**Size:** M (Medium)
**Overview Document:** [REQ-E05-017-create-bulktranslationbar-component-overview.md](./REQ-E05-017-create-bulktranslationbar-component-overview.md)

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the BulkTranslationBar component. The component is a fixed-position action bar that appears when items are selected, providing bulk translation operations (re-translate all languages, re-translate specific languages) with visual progress feedback. This implementation follows the existing BulkActionsBar pattern from ItemManager.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (translation tables, translation service)
- [ ] Epic 3 Dynamic Content Translation is complete (translation triggers, job queue)
- [ ] REQ-E05-003 (Bulk Re-Translation API) is implemented and tested
- [ ] TranslationManagement directory exists or will be created
- [ ] Existing BulkActionsBar pattern has been reviewed

---

## Task Breakdown

### Task 1: Create Directory Structure and Barrel Exports
**Estimated Effort:** 0.25 story points
**Files to Create:**
- `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

#### Task 1.1: Create BulkTranslationBar Directory
**File:** N/A (directory creation)

**Steps:**
1. Create directory `/src/components/TranslationManagement/BulkTranslationBar/` if it doesn't exist
2. Verify TranslationManagement parent directory exists; create if needed

**Verification:**
- Directory structure exists at specified path

---

#### Task 1.2: Create Initial Barrel Export File
**File:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

**Implementation:**
```typescript
/**
 * BulkTranslationBar Component Exports
 *
 * Provides bulk translation operations for selected content items.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @see docs/REQ-E05-017-create-bulktranslationbar-component-overview.md
 * @lastModified 2026-01-20 (REQ-E05-017)
 */

// Components
export { BulkTranslationBar } from './BulkTranslationBar';
export { default } from './BulkTranslationBar';

// Types
export type {
  BulkTranslationBarProps,
  RetranslateOptions,
  BulkTranslationResult,
  TranslationProgress,
} from './BulkTranslationBar.types';

// Note: LanguageSelectorDialog will be added in REQ-E05-018 (Task 4.2)
```

**Verification:**
- File compiles without TypeScript errors
- Exports are properly structured (will have errors until types file is created)

---

### Task 2: Create Type Definitions
**Estimated Effort:** 0.5 story points
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts`

#### Task 2.1: Create Types File with All Interfaces

**Implementation:**
```typescript
/**
 * BulkTranslationBar Type Definitions
 *
 * TypeScript interfaces and types for the BulkTranslationBar component
 * and related bulk translation operations.
 *
 * @module TranslationManagement/BulkTranslationBar/types
 * @see docs/REQ-E05-017-create-bulktranslationbar-component-overview.md
 * @lastModified 2026-01-20 (REQ-E05-017)
 */

import type { SupportedLanguage } from '@/types/localization';

// =============================================================================
// Main Component Props
// =============================================================================

/**
 * Props for the BulkTranslationBar component.
 *
 * The action bar provides bulk translation operations for selected items,
 * including re-translate all and re-translate specific languages.
 */
export interface BulkTranslationBarProps {
  /** Number of selected items - bar hidden when 0 */
  selectedCount: number;

  /** Array of selected item IDs for bulk operations */
  selectedItemIds: string[];

  /** Entity type being managed (determines API endpoint) */
  entityType: 'item' | 'article' | 'link';

  /**
   * Callback when "Re-translate All" is clicked.
   * Queues translation jobs for all 6 supported languages.
   */
  onRetranslateAll: (options: RetranslateOptions) => Promise<void>;

  /**
   * Callback when specific languages are selected for re-translation.
   * Opens language selector dialog, then queues jobs for selected languages.
   */
  onRetranslateLanguages: (
    languages: SupportedLanguage[],
    options: RetranslateOptions
  ) => Promise<void>;

  /** Callback to exit selection mode and clear selection */
  onExitSelection: () => void;

  /** Optional callback when bulk operation completes */
  onComplete?: (result: BulkTranslationResult) => void;

  /** Whether any bulk operation is currently in progress */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Operation Options & Results
// =============================================================================

/**
 * Options for re-translation operations.
 */
export interface RetranslateOptions {
  /**
   * When true, skip items with manual translations (preserve human edits).
   * Default should be true to prevent accidental overwrites.
   */
  skipManualEdits: boolean;
}

/**
 * Result of a bulk translation operation.
 */
export interface BulkTranslationResult {
  /** Number of translation jobs successfully queued */
  jobsQueued: number;

  /** Number of translations skipped (e.g., manual edits preserved) */
  jobsSkipped: number;

  /** Whether the operation was successful overall */
  success: boolean;

  /** Error message if operation failed */
  error?: string;
}

// =============================================================================
// Progress Tracking
// =============================================================================

/**
 * Progress state during bulk operations.
 */
export interface TranslationProgress {
  /** Current state of the bulk operation */
  status: 'idle' | 'queuing' | 'completed' | 'error';

  /** Number of items processed so far */
  processedCount: number;

  /** Total number of items to process */
  totalCount: number;

  /** Error message if any */
  error?: string;
}

// =============================================================================
// Internal State Types
// =============================================================================

/**
 * Internal state for the BulkTranslationBar component.
 * Managed by component-level state.
 */
export interface BulkTranslationBarState {
  /** Whether the language selector dialog is open */
  isLanguageSelectorOpen: boolean;

  /** Whether to skip manual edits (checkbox state) */
  skipManualEdits: boolean;

  /** Current progress of bulk operation */
  progress: TranslationProgress;

  /** Auto-dismiss timer reference */
  autoDismissTimeout: ReturnType<typeof setTimeout> | null;
}

// =============================================================================
// Action Button Props (Internal)
// =============================================================================

/**
 * Props for internal ActionButton component.
 * Follows pattern from BulkActionsBar.tsx.
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

**Verification:**
- [ ] All interfaces compile without TypeScript errors
- [ ] JSDoc comments are complete and descriptive
- [ ] SupportedLanguage import resolves correctly
- [ ] Types match API contract from REQ-E05-003

---

### Task 3: Create Main BulkTranslationBar Component
**Estimated Effort:** 2 story points
**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

#### Task 3.1: Create Component File with Imports and Constants

**Implementation:**
```typescript
'use client';

/**
 * BulkTranslationBar Component
 *
 * A floating action bar that appears at the bottom of the viewport when items
 * are selected, providing bulk translation operations including re-translate all
 * languages and re-translate specific languages with visual progress feedback.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @see docs/REQ-E05-017-create-bulktranslationbar-component-overview.md
 * @lastModified 2026-01-20 (REQ-E05-017)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Check,
  X,
  Loader2,
  Languages,
  Globe,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  BulkTranslationBarProps,
  ActionButtonProps,
  TranslationProgress,
  RetranslateOptions,
} from './BulkTranslationBar.types';

// =============================================================================
// Constants
// =============================================================================

/** Auto-dismiss delay after successful completion (ms) */
const AUTO_DISMISS_DELAY = 2000;

/** Animation duration for slide-in (ms) */
const ANIMATION_DURATION = 300;

// =============================================================================
// Variant Styles (matches BulkActionsBar pattern)
// =============================================================================

const variantStyles = {
  primary: 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};
```

**Verification:**
- [ ] File structure follows BulkActionsBar.tsx pattern
- [ ] All imports resolve correctly
- [ ] Constants are appropriately defined

---

#### Task 3.2: Implement Internal ActionButton Component

**Add after constants section:**
```typescript
// =============================================================================
// Internal ActionButton Component
// =============================================================================

/**
 * ActionButton - Reusable internal button component with consistent styling
 * for all action buttons in the bulk translation bar.
 *
 * Features:
 * - Minimum 44x44px touch target for accessibility
 * - Responsive label (hidden on mobile)
 * - Variant-based color styling
 * - Focus ring for keyboard navigation
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
- [ ] ActionButton matches BulkActionsBar pattern exactly
- [ ] Touch targets meet 44x44px minimum
- [ ] Focus ring styling is consistent

---

#### Task 3.3: Implement Main Component Structure

**Add main component after ActionButton:**
```typescript
// =============================================================================
// Main BulkTranslationBar Component
// =============================================================================

/**
 * BulkTranslationBar - Floating action bar for bulk translation operations
 *
 * This component renders a fixed-position action bar at the bottom of the
 * viewport when items are selected. It provides quick access to bulk
 * translation operations and shows progress during operations.
 *
 * Features:
 * - Fixed positioning at viewport bottom
 * - iOS safe area support
 * - Slide-up animation on appear
 * - Responsive button layout (icons only on mobile)
 * - Loading and progress states
 * - Success/error states with auto-dismiss
 * - Accessible with proper ARIA attributes
 */
export function BulkTranslationBar({
  selectedCount,
  selectedItemIds,
  entityType,
  onRetranslateAll,
  onRetranslateLanguages,
  onExitSelection,
  onComplete,
  loading = false,
  className,
}: BulkTranslationBarProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [skipManualEdits, setSkipManualEdits] = useState(true); // Default: preserve manual edits
  const [progress, setProgress] = useState<TranslationProgress>({
    status: 'idle',
    processedCount: 0,
    totalCount: 0,
  });

  // Ref for auto-dismiss timer
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Don't render if no items selected
  // ---------------------------------------------------------------------------
  if (selectedCount === 0) {
    return null;
  }

  // ... (handlers and render will be added in next tasks)
}

export default BulkTranslationBar;
```

**Verification:**
- [ ] Component structure follows BulkActionsBar pattern
- [ ] State is properly initialized
- [ ] Null check for zero selection works correctly

---

#### Task 3.4: Implement Handler Functions

**Add handlers inside the component before the return statement:**
```typescript
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle "Re-translate All" button click.
   * Queues translation jobs for all 6 languages across all selected items.
   */
  const handleRetranslateAll = useCallback(async () => {
    const options: RetranslateOptions = { skipManualEdits };

    setProgress({
      status: 'queuing',
      processedCount: 0,
      totalCount: selectedCount,
    });

    try {
      await onRetranslateAll(options);

      setProgress({
        status: 'completed',
        processedCount: selectedCount,
        totalCount: selectedCount,
      });

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete({
          success: true,
          jobsQueued: selectedCount * 6, // 6 languages per item
          jobsSkipped: 0,
        });
      }

      // Auto-dismiss after success
      autoDismissRef.current = setTimeout(() => {
        onExitSelection();
      }, AUTO_DISMISS_DELAY);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      setProgress({
        status: 'error',
        processedCount: 0,
        totalCount: selectedCount,
        error: errorMessage,
      });

      if (onComplete) {
        onComplete({
          success: false,
          jobsQueued: 0,
          jobsSkipped: 0,
          error: errorMessage,
        });
      }
    }
  }, [selectedCount, skipManualEdits, onRetranslateAll, onComplete, onExitSelection]);

  /**
   * Handle language selector dialog open.
   */
  const handleOpenLanguageSelector = useCallback(() => {
    setIsLanguageSelectorOpen(true);
  }, []);

  /**
   * Handle language selector dialog close.
   */
  const handleCloseLanguageSelector = useCallback(() => {
    setIsLanguageSelectorOpen(false);
  }, []);

  /**
   * Handle checkbox toggle for "Skip Manual Edits" option.
   */
  const handleSkipManualEditsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSkipManualEdits(e.target.checked);
    },
    []
  );

  /**
   * Reset progress state (called when retrying after error).
   */
  const handleResetProgress = useCallback(() => {
    setProgress({
      status: 'idle',
      processedCount: 0,
      totalCount: 0,
    });
  }, []);
```

**Verification:**
- [ ] All handlers use useCallback for memoization
- [ ] Error handling is comprehensive
- [ ] Auto-dismiss timer is properly set

---

#### Task 3.5: Implement Render Method

**Add return statement with full JSX:**
```typescript
  // ---------------------------------------------------------------------------
  // Render Helper: Selection Count Indicator
  // ---------------------------------------------------------------------------
  const renderSelectionIndicator = () => (
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
      <span className="sr-only">
        Currently {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render Helper: Progress/Status Content
  // ---------------------------------------------------------------------------
  const renderStatusContent = () => {
    // Loading/Queuing state
    if (loading || progress.status === 'queuing') {
      return (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">
            {progress.processedCount > 0
              ? `Processing ${progress.processedCount} of ${progress.totalCount} items...`
              : 'Queuing translations...'}
          </span>
        </div>
      );
    }

    // Success state
    if (progress.status === 'completed') {
      const jobCount = progress.totalCount * 6; // 6 languages
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            {jobCount} translation job{jobCount !== 1 ? 's' : ''} queued
            successfully
          </span>
        </div>
      );
    }

    // Error state
    if (progress.status === 'error') {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">
            {progress.error || 'An error occurred'}
          </span>
          <button
            type="button"
            onClick={handleResetProgress}
            className="text-sm underline hover:no-underline ml-2"
          >
            Try again
          </button>
        </div>
      );
    }

    // Idle state - show action buttons
    return (
      <>
        {/* Re-translate All button */}
        <ActionButton
          icon={Globe}
          label="Re-translate All"
          onClick={handleRetranslateAll}
          variant="primary"
          disabled={loading}
        />

        {/* Re-translate Languages button */}
        <ActionButton
          icon={Languages}
          label="Re-translate..."
          onClick={handleOpenLanguageSelector}
          variant="secondary"
          disabled={loading}
        />

        {/* Skip Manual Edits checkbox */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer ml-2">
          <input
            type="checkbox"
            checked={skipManualEdits}
            onChange={handleSkipManualEditsChange}
            disabled={loading}
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-[#FF385C]',
              'focus:ring-[#FF385C] focus:ring-offset-0',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          />
          <span className="hidden md:inline">Skip Manual Edits</span>
          <span className="md:hidden">Skip Manual</span>
        </label>
      </>
    );
  };

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  return (
    <div
      role="toolbar"
      aria-label={`Bulk translation actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-40',
        // Background and border
        'bg-white border-t border-gray-200',
        // Shadow for elevation
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
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left section: Selection count indicator */}
          {renderSelectionIndicator()}

          {/* Center section: Actions or status */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {renderStatusContent()}
          </div>

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
              disabled={loading || progress.status === 'queuing'}
              className={cn(
                'flex items-center justify-center',
                'min-h-[44px] min-w-[44px]',
                'px-2',
                'rounded-md',
                'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
                (loading || progress.status === 'queuing') &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline ml-1.5 text-sm font-medium">
                Cancel
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Language Selector Dialog - placeholder for Task 4.2 */}
      {/* Will be integrated when LanguageSelectorDialog is implemented */}
    </div>
  );
```

**Verification:**
- [ ] Three-section layout matches BulkActionsBar pattern
- [ ] All states (idle, queuing, completed, error) render correctly
- [ ] Accessibility attributes are properly set
- [ ] Responsive design works on mobile/desktop

---

### Task 4: Update TranslationManagement Barrel Export
**Estimated Effort:** 0.25 story points
**File:** `/src/components/TranslationManagement/index.ts`

#### Task 4.1: Add BulkTranslationBar Exports

**If file exists, add:**
```typescript
// BulkTranslationBar (REQ-E05-017)
export { BulkTranslationBar } from './BulkTranslationBar';
export type {
  BulkTranslationBarProps,
  RetranslateOptions,
  BulkTranslationResult,
  TranslationProgress,
} from './BulkTranslationBar';
```

**If file doesn't exist, create:**
```typescript
/**
 * TranslationManagement Component Exports
 *
 * Components for managing translations of content items.
 *
 * @module TranslationManagement
 * @lastModified 2026-01-20 (REQ-E05-017)
 */

// BulkTranslationBar (REQ-E05-017)
export { BulkTranslationBar } from './BulkTranslationBar';
export type {
  BulkTranslationBarProps,
  RetranslateOptions,
  BulkTranslationResult,
  TranslationProgress,
} from './BulkTranslationBar';
```

**Verification:**
- [ ] Exports compile without errors
- [ ] BulkTranslationBar is importable from '@/components/TranslationManagement'

---

### Task 5: Create Test File
**Estimated Effort:** 1 story point
**File:** `/src/components/TranslationManagement/BulkTranslationBar/__tests__/BulkTranslationBar.test.tsx`

#### Task 5.1: Set Up Test File with Basic Tests

**Implementation:**
```typescript
/**
 * BulkTranslationBar Component Tests
 *
 * @module TranslationManagement/BulkTranslationBar/__tests__
 * @see docs/REQ-E05-017-create-bulktranslationbar-component-overview.md
 * @lastModified 2026-01-20 (REQ-E05-017)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkTranslationBar } from '../BulkTranslationBar';
import type { BulkTranslationBarProps } from '../BulkTranslationBar.types';

// =============================================================================
// Test Utilities
// =============================================================================

const defaultProps: BulkTranslationBarProps = {
  selectedCount: 3,
  selectedItemIds: ['item-1', 'item-2', 'item-3'],
  entityType: 'item',
  onRetranslateAll: jest.fn().mockResolvedValue(undefined),
  onRetranslateLanguages: jest.fn().mockResolvedValue(undefined),
  onExitSelection: jest.fn(),
};

const renderComponent = (props: Partial<BulkTranslationBarProps> = {}) => {
  return render(<BulkTranslationBar {...defaultProps} {...props} />);
};

// =============================================================================
// Test Suites
// =============================================================================

describe('BulkTranslationBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Rendering Tests
  // ---------------------------------------------------------------------------
  describe('Rendering', () => {
    it('renders correctly with selected items', () => {
      renderComponent();

      expect(screen.getByText('3 selected')).toBeInTheDocument();
      expect(screen.getByLabelText('Re-translate All')).toBeInTheDocument();
      expect(screen.getByLabelText('Re-translate...')).toBeInTheDocument();
    });

    it('does not render when selectedCount is 0', () => {
      const { container } = renderComponent({ selectedCount: 0 });

      expect(container.firstChild).toBeNull();
    });

    it('shows correct selection count', () => {
      renderComponent({ selectedCount: 5 });

      expect(screen.getByText('5 selected')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      renderComponent();

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute(
        'aria-label',
        'Bulk translation actions for 3 selected items'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Interaction Tests
  // ---------------------------------------------------------------------------
  describe('Interactions', () => {
    it('calls onRetranslateAll when Re-translate All is clicked', async () => {
      const onRetranslateAll = jest.fn().mockResolvedValue(undefined);
      renderComponent({ onRetranslateAll });

      await userEvent.click(screen.getByLabelText('Re-translate All'));

      expect(onRetranslateAll).toHaveBeenCalledWith({
        skipManualEdits: true, // Default value
      });
    });

    it('calls onExitSelection when Cancel is clicked', async () => {
      const onExitSelection = jest.fn();
      renderComponent({ onExitSelection });

      await userEvent.click(screen.getByLabelText('Cancel selection'));

      expect(onExitSelection).toHaveBeenCalled();
    });

    it('toggles skipManualEdits checkbox', async () => {
      renderComponent();

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked(); // Default is true

      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  // ---------------------------------------------------------------------------
  // Loading State Tests
  // ---------------------------------------------------------------------------
  describe('Loading State', () => {
    it('shows loading state during operation', async () => {
      const onRetranslateAll = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      renderComponent({ onRetranslateAll });

      await userEvent.click(screen.getByLabelText('Re-translate All'));

      expect(screen.getByText(/Queuing translations/)).toBeInTheDocument();
    });

    it('disables buttons during loading', async () => {
      renderComponent({ loading: true });

      expect(screen.getByLabelText('Re-translate All')).toBeDisabled();
      expect(screen.getByLabelText('Re-translate...')).toBeDisabled();
    });
  });

  // ---------------------------------------------------------------------------
  // Success/Error State Tests
  // ---------------------------------------------------------------------------
  describe('Success and Error States', () => {
    it('shows success message after successful operation', async () => {
      const onRetranslateAll = jest.fn().mockResolvedValue(undefined);
      renderComponent({ onRetranslateAll });

      await userEvent.click(screen.getByLabelText('Re-translate All'));

      await waitFor(() => {
        expect(
          screen.getByText(/translation jobs? queued successfully/)
        ).toBeInTheDocument();
      });
    });

    it('shows error message when operation fails', async () => {
      const onRetranslateAll = jest
        .fn()
        .mockRejectedValue(new Error('API Error'));
      renderComponent({ onRetranslateAll });

      await userEvent.click(screen.getByLabelText('Re-translate All'));

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('calls onComplete with result after operation', async () => {
      const onComplete = jest.fn();
      const onRetranslateAll = jest.fn().mockResolvedValue(undefined);
      renderComponent({ onRetranslateAll, onComplete, selectedCount: 2 });

      await userEvent.click(screen.getByLabelText('Re-translate All'));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith({
          success: true,
          jobsQueued: 12, // 2 items * 6 languages
          jobsSkipped: 0,
        });
      });
    });
  });
});
```

**Verification:**
- [ ] All tests pass
- [ ] Test coverage is comprehensive
- [ ] Tests follow existing test patterns in the project

---

## Implementation Order Summary

| Order | Task | Effort | Dependencies |
|-------|------|--------|--------------|
| 1 | Task 1: Directory & Barrel Exports | 0.25 SP | None |
| 2 | Task 2: Type Definitions | 0.5 SP | Task 1 |
| 3 | Task 3: Main Component | 2 SP | Task 2 |
| 4 | Task 4: TranslationManagement Barrel | 0.25 SP | Task 3 |
| 5 | Task 5: Tests | 1 SP | Task 3 |

**Total Estimated Effort:** 4 story points

---

## Acceptance Criteria Verification Checklist

### Functional Requirements
- [ ] Action bar appears at bottom of viewport when items are selected
- [ ] Action bar slides up with smooth animation (300ms)
- [ ] Action bar remains fixed at bottom during scrolling
- [ ] Selection count displays correctly (e.g., "3 items selected")
- [ ] "Re-translate All" button triggers translation for all 6 languages
- [ ] "Re-translate..." button placeholder exists (dialog in Task 4.2)
- [ ] "Skip Manual Edits" checkbox is present and checked by default
- [ ] Progress indicator shows during operations
- [ ] Success message shows jobs queued count
- [ ] Error message displays with retry option
- [ ] Cancel button dismisses bar and clears selection
- [ ] Auto-dismiss after 2 seconds on success

### Technical Requirements
- [ ] Component accepts all required props from interface
- [ ] Component handles API errors gracefully
- [ ] Component integrates with bulk re-translate API
- [ ] Loading state disables controls
- [ ] Works with filtered/sorted lists
- [ ] Returns null when selectedCount is 0

### Accessibility Requirements
- [ ] Fully keyboard accessible
- [ ] Proper ARIA labels and roles
- [ ] 44x44px minimum touch targets
- [ ] Focus ring styling matches patterns

### Visual Requirements
- [ ] Responsive on mobile viewports
- [ ] Z-index overlays content correctly
- [ ] Matches design system (Airbnb pink #FF385C)
- [ ] Responsive labels (icons only on mobile)

---

## Files Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx` | Main component |
| `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.types.ts` | Type definitions |
| `/src/components/TranslationManagement/BulkTranslationBar/__tests__/BulkTranslationBar.test.tsx` | Unit tests |

### Files to Modify

| File | Changes |
|------|---------|
| `/src/components/TranslationManagement/index.ts` | Add BulkTranslationBar exports |

### Files for Reference Only

| File | Reference Purpose |
|------|-------------------|
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Action bar pattern |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Dialog pattern |
| `/src/components/ItemManager/ItemManager.types.ts` | Type patterns |
| `/src/lib/utils.ts` | cn() utility |

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API not ready (REQ-E05-003) | Medium | High | Verify API endpoint exists before starting |
| LanguageSelectorDialog dependency | Low | Medium | Component works without it; placeholder comment |
| Inconsistent styling | Low | Low | Follow BulkActionsBar pattern exactly |
| Performance with large selections | Low | Medium | Consider batching if needed |

---

## Related Documents

- [Overview Document](./REQ-E05-017-create-bulktranslationbar-component-overview.md)
- [Epic 5 Implementation Plan](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [Gen Requests Epic 5](/docs/gen_requests_epic5.md) - REQ-E05-017, REQ-E05-018
- [BulkActionsBar Reference](/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx)

---

## Notes for Implementer

1. **Default "Skip Manual Edits"**: The checkbox should be **checked by default** (true) to prevent accidental overwriting of human-curated translations.

2. **Language Selector Dialog**: The component has a placeholder for LanguageSelectorDialog which will be implemented in REQ-E05-018 (Task 4.2). For now, the "Re-translate..." button will open this dialog once available.

3. **API Integration**: The component relies on REQ-E05-003 (Bulk Re-Translation API). Ensure the API endpoint is available and matches the expected interface.

4. **Progress Tracking**: The current implementation assumes optimistic progress tracking. If the API returns batch progress, update the progress state accordingly.

5. **Testing**: Run the full test suite after implementation to ensure no regressions in existing functionality.
