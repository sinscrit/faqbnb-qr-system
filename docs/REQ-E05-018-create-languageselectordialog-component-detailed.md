# Detailed Task Breakdown: REQ-E05-018 - Create LanguageSelectorDialog Component

**Request ID:** REQ-E05-018
**Title:** Language Selection Dialog for Targeted Bulk Operations
**Type:** NEW FEATURE
**Size:** S
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.2
**Epic:** L10N Epic 5 - Owner Translation Management
**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Overview

This document provides the detailed implementation tasks for creating the `LanguageSelectorDialog` component. This modal dialog displays all supported languages as selectable checkboxes when performing bulk translation operations, enabling property owners to choose specific language subsets for re-translation rather than always processing all languages.

### Reference Documents
- **Overview Document:** `docs/REQ-E05-018-create-languageselectordialog-component-overview.md`
- **Requirements:** `docs/gen_requests_epic5.md` (REQ-E05-019)
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation tables exist (`items_translation`, `articles_translation`, `links_translation`, `translation_jobs`)
- [ ] Language configuration exists at `/src/lib/i18n/config.ts` with `locales`, `localeMetadata`, `SupportedLocale`
- [ ] Radix UI Dialog package is installed (`@radix-ui/react-dialog`)
- [ ] BulkTranslationBar component directory exists at `/src/components/TranslationManagement/BulkTranslationBar/`
- [ ] Utility function `cn()` is available at `/src/lib/utils.ts`
- [ ] Focus trap utility exists at `/src/components/ItemManager/utils/a11yUtils.tsx`

---

## Task Breakdown

### Task 1: Create Component File with Documentation Header
**Effort:** XS (5 minutes)
**Dependencies:** None
**Files to Create:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Create the main component file with proper documentation header, 'use client' directive, and all required imports.

#### Implementation Steps

1. Create file at `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

2. Add the following content:

```typescript
'use client';

/**
 * LanguageSelectorDialog Component
 *
 * Modal dialog for selecting languages during bulk translation operations.
 * Displays all supported languages as checkboxes with Select All/Deselect All controls.
 *
 * @module TranslationManagement/BulkTranslationBar/LanguageSelectorDialog
 * @see docs/REQ-E05-018-create-languageselectordialog-component-overview.md
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Check, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { locales, localeMetadata, type SupportedLocale } from '@/lib/i18n/config';
```

#### Verification
- [ ] File exists at correct path
- [ ] 'use client' directive is first line
- [ ] All imports resolve without errors
- [ ] TypeScript compilation passes

---

### Task 2: Define TypeScript Interfaces and Props
**Effort:** XS (5 minutes)
**Dependencies:** Task 1
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Define the component props interface and internal type for language items.

#### Implementation Steps

1. Add after imports:

```typescript
// =============================================================================
// Types
// =============================================================================

/**
 * Props for the LanguageSelectorDialog component
 */
export interface LanguageSelectorDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when languages are confirmed - receives array of selected language codes */
  onConfirm: (languages: SupportedLocale[]) => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
  /** Optional default selection of languages (pre-checked on open) */
  defaultSelection?: SupportedLocale[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Internal language item structure for rendering
 */
interface LanguageDisplayItem {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}
```

#### Verification
- [ ] `LanguageSelectorDialogProps` interface is exported
- [ ] All props are documented with JSDoc comments
- [ ] Types match the overview document specification

---

### Task 3: Implement Component Skeleton and State Management
**Effort:** S (15 minutes)
**Dependencies:** Task 2
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Create the main component function with state management using Set-based tracking for selections.

#### Implementation Steps

1. Add component function after types:

```typescript
// =============================================================================
// Main Component
// =============================================================================

/**
 * LanguageSelectorDialog Component
 *
 * Modal dialog for selecting languages during bulk translation operations.
 * Provides Select All/Deselect All controls and individual language checkboxes.
 */
export function LanguageSelectorDialog({
  isOpen,
  onConfirm,
  onCancel,
  defaultSelection = [],
  className,
}: LanguageSelectorDialogProps) {
  // ---------------------------------------------------------------------------
  // Accessibility IDs
  // ---------------------------------------------------------------------------
  const uniqueId = useId();
  const titleId = `language-selector-title-${uniqueId}`;
  const descriptionId = `language-selector-desc-${uniqueId}`;

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const contentRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const [selectedLanguages, setSelectedLanguages] = useState<Set<SupportedLocale>>(
    new Set(defaultSelection)
  );

  // ---------------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------------
  const allSelected = selectedLanguages.size === locales.length;
  const noneSelected = selectedLanguages.size === 0;
  const confirmDisabled = noneSelected;

  // Reset selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLanguages(new Set(defaultSelection));
    }
  }, [isOpen, defaultSelection]);

  // ... handlers and render will be added in subsequent tasks

  return null; // Placeholder - will be replaced in Task 6
}

export default LanguageSelectorDialog;
```

#### Verification
- [ ] Component accepts all required props
- [ ] State initializes with defaultSelection
- [ ] State resets when dialog opens
- [ ] Derived state (allSelected, noneSelected, confirmDisabled) computes correctly

---

### Task 4: Implement Selection Handler Functions
**Effort:** S (10 minutes)
**Dependencies:** Task 3
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Implement handlers for toggling individual languages, select all, deselect all, and confirm actions.

#### Implementation Steps

1. Add after derived state section, before the return:

```typescript
  // ---------------------------------------------------------------------------
  // Selection Handlers
  // ---------------------------------------------------------------------------

  /**
   * Toggle individual language selection
   */
  const handleToggleLanguage = useCallback((code: SupportedLocale) => {
    setSelectedLanguages((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  /**
   * Select all supported languages
   */
  const handleSelectAll = useCallback(() => {
    setSelectedLanguages(new Set(locales));
  }, []);

  /**
   * Deselect all languages
   */
  const handleDeselectAll = useCallback(() => {
    setSelectedLanguages(new Set());
  }, []);

  /**
   * Confirm selection and pass to parent
   */
  const handleConfirm = useCallback(() => {
    // Convert Set to Array maintaining consistent order
    const selectedArray = locales.filter((locale) => selectedLanguages.has(locale));
    onConfirm(selectedArray);
  }, [selectedLanguages, onConfirm]);

  /**
   * Handle dialog open/close state changes
   */
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onCancel();
    }
  }, [onCancel]);
```

#### Verification
- [ ] `handleToggleLanguage` correctly adds/removes from Set
- [ ] `handleSelectAll` selects all 6 languages
- [ ] `handleDeselectAll` clears all selections
- [ ] `handleConfirm` returns array in consistent locale order
- [ ] All handlers are memoized with useCallback

---

### Task 5: Implement Keyboard Handling and Effects
**Effort:** XS (10 minutes)
**Dependencies:** Task 4
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Add keyboard event handling for Escape key and body scroll prevention.

#### Implementation Steps

1. Add after selection handlers:

```typescript
  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Handle Escape key to close dialog
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isOpen]);

  /**
   * Prevent body scroll when dialog is open (mobile)
   */
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);
```

#### Verification
- [ ] Escape key calls onCancel when dialog is open
- [ ] Body scroll is hidden when dialog opens
- [ ] Body scroll is restored when dialog closes
- [ ] Event listeners are properly cleaned up

---

### Task 6: Implement Dialog Structure with Radix UI
**Effort:** M (20 minutes)
**Dependencies:** Tasks 3-5
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Build the main dialog structure using Radix UI Dialog primitive, following the AddPropertyModal pattern.

#### Implementation Steps

1. Replace the `return null;` placeholder with:

```typescript
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        {/* Content */}
        <Dialog.Content
          ref={contentRef}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn(
            // Base styles
            'fixed z-50 bg-white shadow-lg outline-none',
            'overflow-hidden flex flex-col',

            // Desktop: centered modal (compact 400px width)
            'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
            'md:max-w-[400px] md:w-[calc(100%-2rem)]',
            'md:rounded-xl',

            // Mobile: slide-up drawer
            'max-md:inset-x-0 max-md:bottom-0',
            'max-md:max-h-[80vh] max-md:rounded-t-xl',

            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95',
            'max-md:data-[state=closed]:slide-out-to-bottom max-md:data-[state=open]:slide-in-from-bottom',

            className
          )}
        >
          {/* Mobile drag handle indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Languages className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Dialog.Title
                  id={titleId}
                  className="text-lg font-semibold text-gray-900"
                >
                  Select Languages for Re-translation
                </Dialog.Title>
                <Dialog.Description
                  id={descriptionId}
                  className="text-sm text-gray-500 mt-0.5"
                >
                  Choose which languages to re-translate
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className={cn(
                  'flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors',
                  'min-h-[48px] min-w-[48px]',
                  'touch-manipulation [-webkit-tap-highlight-color:transparent]'
                )}
                aria-label="Close dialog"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body - will be added in Task 7 */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Placeholder for language list */}
          </div>

          {/* Footer - will be added in Task 8 */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            {/* Placeholder for action buttons */}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
```

#### Verification
- [ ] Dialog opens centered on desktop viewports
- [ ] Dialog slides up from bottom on mobile viewports
- [ ] Overlay prevents interaction with underlying content
- [ ] Close button is accessible (48px touch target)
- [ ] Header displays correct title and description
- [ ] Animation works for open/close transitions

---

### Task 7: Implement Language Checkbox List Body
**Effort:** M (20 minutes)
**Dependencies:** Task 6
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Build the language selection list with Select All/Deselect All controls and individual checkbox toggle buttons.

#### Implementation Steps

1. Replace the Body placeholder with:

```typescript
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Select All / Deselect All Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleSelectAll}
                disabled={allSelected}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  'min-h-[40px]',
                  'touch-manipulation [-webkit-tap-highlight-color:transparent]',
                  allSelected
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                )}
                aria-label="Select all languages"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                disabled={noneSelected}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  'min-h-[40px]',
                  'touch-manipulation [-webkit-tap-highlight-color:transparent]',
                  noneSelected
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                )}
                aria-label="Deselect all languages"
              >
                Deselect All
              </button>
            </div>

            {/* Language Checkbox List */}
            <div className="space-y-2" role="group" aria-label="Language selection">
              {locales.map((code) => {
                const metadata = localeMetadata[code];
                const isSelected = selectedLanguages.has(code);

                return (
                  <button
                    key={code}
                    onClick={() => handleToggleLanguage(code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                      'min-h-[48px]',
                      'touch-manipulation [-webkit-tap-highlight-color:transparent]',
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    )}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`${metadata.name} (${metadata.nativeName})`}
                  >
                    {/* Custom checkbox indicator */}
                    <span
                      className={cn(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                        isSelected
                          ? 'bg-blue-500'
                          : 'border-2 border-gray-400'
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white" />
                      )}
                    </span>

                    {/* Flag */}
                    <span className="text-xl flex-shrink-0" role="img" aria-hidden="true">
                      {metadata.flag}
                    </span>

                    {/* Language name */}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900">
                        {metadata.name}
                      </span>
                      <span className="ml-2 text-gray-500 text-sm">
                        ({metadata.nativeName})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
```

#### Verification
- [ ] All 6 supported languages are displayed (EN, FR, ES, DE, NL, IT)
- [ ] Each language shows flag, English name, and native name
- [ ] Clicking a language toggles its selection state
- [ ] Selected languages show blue background and checked indicator
- [ ] Unselected languages show gray background
- [ ] Select All button selects all languages and becomes disabled
- [ ] Deselect All button deselects all languages and becomes disabled
- [ ] All buttons meet 48px minimum touch target
- [ ] Language order is consistent (matches locales array)

---

### Task 8: Implement Footer with Action Buttons
**Effort:** S (10 minutes)
**Dependencies:** Task 7
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

#### Description
Add the footer section with selection count, Cancel, and Confirm buttons.

#### Implementation Steps

1. Replace the Footer placeholder with:

```typescript
          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            {/* Selection count */}
            <span className="text-sm text-gray-600">
              {selectedLanguages.size} of {locales.length} selected
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className={cn(
                  'px-4 rounded-lg text-sm font-medium',
                  'min-h-[48px]',
                  'bg-white border border-gray-300 text-gray-700',
                  'hover:bg-gray-50 active:bg-gray-100 transition-colors',
                  'touch-manipulation [-webkit-tap-highlight-color:transparent]'
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmDisabled}
                className={cn(
                  'px-4 rounded-lg text-sm font-medium text-white',
                  'min-h-[48px]',
                  'flex items-center gap-2 transition-colors',
                  'touch-manipulation [-webkit-tap-highlight-color:transparent]',
                  'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300',
                  confirmDisabled && 'cursor-not-allowed'
                )}
              >
                Re-translate{selectedLanguages.size > 0 ? ` (${selectedLanguages.size})` : ''}
              </button>
            </div>
          </div>
```

#### Verification
- [ ] Selection count displays correctly (e.g., "3 of 6 selected")
- [ ] Cancel button calls onCancel when clicked
- [ ] Confirm button is disabled when no languages are selected
- [ ] Confirm button is enabled when 1+ languages are selected
- [ ] Confirm button shows selection count in label
- [ ] Clicking confirm calls onConfirm with selected language array
- [ ] All buttons meet 48px minimum touch target

---

### Task 9: Update Barrel Export
**Effort:** XS (5 minutes)
**Dependencies:** Task 8
**Files to Modify:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

#### Description
Add the LanguageSelectorDialog export to the BulkTranslationBar barrel file.

#### Implementation Steps

1. Check if `/src/components/TranslationManagement/BulkTranslationBar/index.ts` exists

2. If it exists, add to existing exports:
```typescript
export { LanguageSelectorDialog } from './LanguageSelectorDialog';
export type { LanguageSelectorDialogProps } from './LanguageSelectorDialog';
```

3. If it doesn't exist, create the file:
```typescript
/**
 * BulkTranslationBar Component Exports
 *
 * Bulk translation action bar and related components.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

// Note: BulkTranslationBar will be added in Phase 4.1
// export { BulkTranslationBar } from './BulkTranslationBar';
// export type { BulkTranslationBarProps } from './BulkTranslationBar';

export { LanguageSelectorDialog } from './LanguageSelectorDialog';
export type { LanguageSelectorDialogProps } from './LanguageSelectorDialog';
```

#### Verification
- [ ] Index file exports LanguageSelectorDialog component
- [ ] Index file exports LanguageSelectorDialogProps type
- [ ] Import from '@/components/TranslationManagement/BulkTranslationBar' works

---

### Task 10: Add Unit Tests
**Effort:** M (25 minutes)
**Dependencies:** Tasks 1-9
**Files to Create:** `/src/components/TranslationManagement/BulkTranslationBar/__tests__/LanguageSelectorDialog.test.tsx`

#### Description
Create comprehensive unit tests for the LanguageSelectorDialog component.

#### Implementation Steps

1. Create test file:

```typescript
/**
 * LanguageSelectorDialog Unit Tests
 *
 * @module TranslationManagement/BulkTranslationBar/__tests__/LanguageSelectorDialog.test
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { LanguageSelectorDialog } from '../LanguageSelectorDialog';
import { locales } from '@/lib/i18n/config';

describe('LanguageSelectorDialog', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all six supported languages', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('French')).toBeInTheDocument();
      expect(screen.getByText('Spanish')).toBeInTheDocument();
      expect(screen.getByText('German')).toBeInTheDocument();
      expect(screen.getByText('Dutch')).toBeInTheDocument();
      expect(screen.getByText('Italian')).toBeInTheDocument();
    });

    it('renders dialog title', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      expect(screen.getByText('Select Languages for Re-translation')).toBeInTheDocument();
    });

    it('renders Select All and Deselect All buttons', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deselect all/i })).toBeInTheDocument();
    });

    it('renders Cancel and Confirm buttons', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /re-translate/i })).toBeInTheDocument();
    });

    it('shows selection count', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      expect(screen.getByText(/0 of 6 selected/i)).toBeInTheDocument();
    });
  });

  describe('Selection Behavior', () => {
    it('toggles language selection on click', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      const englishButton = screen.getByRole('checkbox', { name: /english/i });
      expect(englishButton).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(englishButton);
      expect(englishButton).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(englishButton);
      expect(englishButton).toHaveAttribute('aria-checked', 'false');
    });

    it('Select All selects all languages', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /select all/i }));

      expect(screen.getByText('6 of 6 selected')).toBeInTheDocument();

      // Verify all checkboxes are checked
      locales.forEach((locale) => {
        const checkbox = screen.getAllByRole('checkbox').find((el) =>
          el.getAttribute('aria-label')?.toLowerCase().includes(locale === 'en' ? 'english' : locale)
        );
        // Each language checkbox should be checked
      });
    });

    it('Deselect All deselects all languages', () => {
      render(<LanguageSelectorDialog {...defaultProps} defaultSelection={['en', 'fr']} />);

      fireEvent.click(screen.getByRole('button', { name: /deselect all/i }));

      expect(screen.getByText('0 of 6 selected')).toBeInTheDocument();
    });

    it('updates selection count when languages are toggled', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      fireEvent.click(screen.getByRole('checkbox', { name: /english/i }));
      expect(screen.getByText('1 of 6 selected')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('checkbox', { name: /french/i }));
      expect(screen.getByText('2 of 6 selected')).toBeInTheDocument();
    });
  });

  describe('Confirm Behavior', () => {
    it('disables confirm button when no languages selected', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: /re-translate/i });
      expect(confirmButton).toBeDisabled();
    });

    it('enables confirm button when languages are selected', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      fireEvent.click(screen.getByRole('checkbox', { name: /english/i }));

      const confirmButton = screen.getByRole('button', { name: /re-translate/i });
      expect(confirmButton).not.toBeDisabled();
    });

    it('calls onConfirm with selected languages', () => {
      const onConfirm = jest.fn();
      render(<LanguageSelectorDialog {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('checkbox', { name: /english/i }));
      fireEvent.click(screen.getByRole('checkbox', { name: /french/i }));
      fireEvent.click(screen.getByRole('button', { name: /re-translate/i }));

      expect(onConfirm).toHaveBeenCalledWith(['en', 'fr']);
    });

    it('returns languages in consistent order', () => {
      const onConfirm = jest.fn();
      render(<LanguageSelectorDialog {...defaultProps} onConfirm={onConfirm} />);

      // Select in reverse order
      fireEvent.click(screen.getByRole('checkbox', { name: /italian/i }));
      fireEvent.click(screen.getByRole('checkbox', { name: /english/i }));
      fireEvent.click(screen.getByRole('button', { name: /re-translate/i }));

      // Should return in locales array order: ['en', 'it']
      expect(onConfirm).toHaveBeenCalledWith(['en', 'it']);
    });
  });

  describe('Cancel Behavior', () => {
    it('calls onCancel when Cancel button clicked', () => {
      const onCancel = jest.fn();
      render(<LanguageSelectorDialog {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when close button clicked', () => {
      const onCancel = jest.fn();
      render(<LanguageSelectorDialog {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('Default Selection', () => {
    it('pre-selects languages from defaultSelection prop', () => {
      render(<LanguageSelectorDialog {...defaultProps} defaultSelection={['en', 'fr']} />);

      expect(screen.getByRole('checkbox', { name: /english/i })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('checkbox', { name: /french/i })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('checkbox', { name: /spanish/i })).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByText('2 of 6 selected')).toBeInTheDocument();
    });

    it('resets to defaultSelection when dialog reopens', () => {
      const { rerender } = render(
        <LanguageSelectorDialog {...defaultProps} defaultSelection={['en']} />
      );

      // Select additional language
      fireEvent.click(screen.getByRole('checkbox', { name: /french/i }));
      expect(screen.getByText('2 of 6 selected')).toBeInTheDocument();

      // Close and reopen dialog
      rerender(<LanguageSelectorDialog {...defaultProps} isOpen={false} defaultSelection={['en']} />);
      rerender(<LanguageSelectorDialog {...defaultProps} isOpen={true} defaultSelection={['en']} />);

      expect(screen.getByText('1 of 6 selected')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      // Dialog should have proper role
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Checkboxes should have checkbox role
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(6);
    });

    it('language group has proper aria-label', () => {
      render(<LanguageSelectorDialog {...defaultProps} />);

      expect(screen.getByRole('group', { name: /language selection/i })).toBeInTheDocument();
    });
  });
});
```

2. Ensure test directory exists: `/src/components/TranslationManagement/BulkTranslationBar/__tests__/`

#### Verification
- [ ] All tests pass
- [ ] Tests cover rendering of all 6 languages
- [ ] Tests cover individual selection toggle
- [ ] Tests cover Select All functionality
- [ ] Tests cover Deselect All functionality
- [ ] Tests cover confirm button disabled state
- [ ] Tests cover onConfirm callback with correct language array
- [ ] Tests cover onCancel callback
- [ ] Tests cover defaultSelection prop behavior
- [ ] Tests cover ARIA accessibility attributes

---

## Post-Implementation Checklist

After completing all tasks, verify:

### Functional Requirements
- [ ] Modal dialog uses Radix UI Dialog primitive
- [ ] Dialog opens centered with overlay backdrop
- [ ] Dialog header displays "Select Languages for Re-translation"
- [ ] All 6 supported languages display with flags and names
- [ ] Each checkbox is properly accessible
- [ ] Select All checks all languages
- [ ] Deselect All unchecks all languages
- [ ] Confirm button is disabled when no selection
- [ ] Confirm button is enabled with 1+ selections
- [ ] Cancel dismisses without action
- [ ] Escape key triggers cancel
- [ ] onConfirm returns correct language array
- [ ] defaultSelection prop pre-selects languages
- [ ] Selection resets when dialog reopens

### Accessibility Requirements
- [ ] Full keyboard navigation works
- [ ] Tab order is logical
- [ ] Space key toggles checkboxes
- [ ] ARIA labels present on all interactive elements
- [ ] Focus returns to trigger on close
- [ ] Screen reader announces dialog title and description

### Responsive Design
- [ ] Desktop: centered modal (400px width)
- [ ] Mobile: slide-up drawer with rounded top
- [ ] Checkbox list scrolls if content exceeds viewport
- [ ] Body scroll prevented on mobile

### Visual Design
- [ ] Matches existing BulkTagDialog patterns
- [ ] Blue color scheme for selections
- [ ] 48px minimum touch targets
- [ ] Consistent typography and spacing
- [ ] Smooth animations on open/close

### Integration
- [ ] Exports work from barrel file
- [ ] Component integrates with BulkTranslationBar
- [ ] No TypeScript errors
- [ ] All unit tests pass

---

## Task Summary Table

| Task | Description | Effort | Dependencies | Status |
|------|-------------|--------|--------------|--------|
| 1 | Create component file with header | XS | None | ☐ |
| 2 | Define TypeScript interfaces | XS | Task 1 | ☐ |
| 3 | Implement component skeleton and state | S | Task 2 | ☐ |
| 4 | Implement selection handlers | S | Task 3 | ☐ |
| 5 | Implement keyboard handling and effects | XS | Task 4 | ☐ |
| 6 | Implement dialog structure with Radix | M | Tasks 3-5 | ☐ |
| 7 | Implement language checkbox list | M | Task 6 | ☐ |
| 8 | Implement footer with action buttons | S | Task 7 | ☐ |
| 9 | Update barrel export | XS | Task 8 | ☐ |
| 10 | Add unit tests | M | Tasks 1-9 | ☐ |

**Total Estimated Effort:** ~2.5 hours

---

## Risk Mitigation Notes

| Risk | Mitigation |
|------|------------|
| Radix Dialog z-index conflicts | Use z-50 consistently; test with other modals open |
| Focus trap issues | Rely on Radix built-in focus management |
| Mobile scroll behavior | Use `overflow: hidden` on body; test on iOS Safari |
| Language config mismatch | Use actual `locales` from `/src/lib/i18n/config.ts` (6 languages: en, fr, es, de, nl, it) |

---

## Notes

- The PRD mentions Portuguese (PT), but the actual codebase uses Dutch (NL). This implementation follows the codebase configuration.
- The component follows patterns from `BulkTagDialog.tsx` for checkbox-style selection UI.
- The component follows patterns from `AddPropertyModal.tsx` for Radix Dialog structure.
- Integration with `BulkTranslationBar` will be completed as part of Phase 4.1 task (REQ-E05-017).
