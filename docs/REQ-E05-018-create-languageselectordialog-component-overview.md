# Implementation Breakdown: REQ-E05-018 - Create LanguageSelectorDialog Component

**Request ID:** REQ-E05-018
**Title:** Language Selection Dialog for Targeted Bulk Operations
**Type:** NEW FEATURE
**Size:** S
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.2
**Epic:** L10N Epic 5 - Owner Translation Management
**Last Modified:** 2026-01-20

---

## Overview

### Summary
Property owners need a modal dialog that displays all supported languages as selectable checkboxes when performing bulk translation operations, enabling them to choose specific language subsets for re-translation rather than always processing all languages.

### User Impact
- Property owners can selectively refresh translations for specific languages when only those translations are outdated or problematic
- Reduce unnecessary translation API costs by avoiding re-translation of languages that don't require updates
- Efficiently manage translation priorities by processing high-priority languages first through targeted selection

### Business Value
- Optimizes translation resource utilization by enabling surgical updates to specific language subsets rather than forcing wasteful full re-translation
- Supports flexible translation workflows that adapt to budget constraints and priority languages
- Reduces overall translation costs while maintaining control over multilingual content quality

---

## Dependencies

### Epic Dependencies
| Epic | Dependency | Status |
|------|------------|--------|
| Epic 1 | Translation tables (`items_translation`, `articles_translation`, `links_translation`) | Required |
| Epic 1 | Translation jobs table | Required |
| Epic 1 | i18n framework (`next-intl`) | Required |
| Epic 1 | Language configuration (`SUPPORTED_LOCALES`, `SupportedLocale`) | Required |
| Epic 3 | Translation trigger system | Required |
| Epic 5 | BulkTranslationBar component (Phase 4.1) | Required |
| Epic 5 | Bulk Re-translate API endpoint (Phase 1.3) | Required |

### Codebase Dependencies
| File/Module | Purpose |
|-------------|---------|
| `@radix-ui/react-dialog` | Dialog primitive for modal |
| `/src/lib/i18n/config.ts` | `locales`, `localeMetadata`, `SupportedLocale` types |
| `/src/lib/utils.ts` | `cn()` utility for class merging |
| `/src/components/ItemManager/utils/a11yUtils.tsx` | `useFocusTrap` hook for accessibility |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared types |
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Parent component exports |

---

## Technical Context

### Existing Patterns to Follow

#### 1. Radix Dialog Pattern (`AddPropertyModal.tsx`)
```tsx
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root
  open={isOpen}
  onOpenChange={(open) => {
    if (!open && !isSubmitting) {
      onClose();
    }
  }}
>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 ..." />
    <Dialog.Content
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        'fixed z-50 bg-white shadow-lg outline-none',
        // Desktop: centered modal
        'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
        'md:max-w-[640px] md:w-[calc(100%-2rem)] md:max-h-[90vh]',
        'md:rounded-xl',
        // Mobile: slide-up drawer
        'max-md:inset-x-0 max-md:bottom-0',
        'max-md:max-h-[90vh] max-md:rounded-t-xl',
        // Animation
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        ...
      )}
    >
      <Dialog.Title />
      <Dialog.Description />
      ...
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

#### 2. Checkbox List Pattern (`BulkTagDialog.tsx`)
```tsx
// Custom checkbox toggle buttons (not native checkboxes)
{items.map(({ item, isSelected }) => (
  <button
    key={item}
    onClick={() => handleToggle(item)}
    disabled={loading}
    className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
      isSelected
        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200',
      loading && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span className={cn(
      'w-4 h-4 rounded flex items-center justify-center',
      isSelected ? 'bg-blue-500' : 'border border-gray-400'
    )}>
      {isSelected && <Check className="h-3 w-3 text-white" />}
    </span>
    <span>{item.name}</span>
  </button>
))}
```

#### 3. Language Configuration (`/src/lib/i18n/config.ts`)
```typescript
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = (typeof locales)[number];

export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
};
```

### UI Specifications

#### Color Palette
| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Primary Action | Blue | `bg-blue-600 hover:bg-blue-700` |
| Selected Checkbox Background | Blue | `bg-blue-500` |
| Selected Item Background | Light Blue | `bg-blue-100` |
| Selected Item Border | Blue | `border-blue-300` |
| Unselected Background | Gray | `bg-gray-100` |
| Check Icon | White | `text-white` |

#### Dimensions
| Element | Value |
|---------|-------|
| Dialog Max Width | 400px (compact) |
| Touch Target Height | min-h-[48px] |
| Checkbox Indicator Size | w-4 h-4 (16px) |
| Language Row Padding | px-3 py-1.5 |
| Border Radius (checkbox) | rounded (4px) |
| Border Radius (row) | rounded-full |

---

## Implementation Tasks

### Task 1: Create Component File Structure
**Effort:** XS (15 min)

Create the component file with proper documentation header and imports.

**File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

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
 * @lastModified 2026-01-20
 */

import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Check, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { locales, localeMetadata, type SupportedLocale } from '@/lib/i18n/config';
import { useFocusTrap } from '@/components/ItemManager/utils/a11yUtils';
```

### Task 2: Define Types and Props Interface
**Effort:** XS (10 min)

Define TypeScript interfaces for component props and internal state.

```typescript
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
  /** Optional default selection of languages */
  defaultSelection?: SupportedLocale[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Internal language item with selection state
 */
interface LanguageItem {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  isSelected: boolean;
}
```

### Task 3: Implement State Management
**Effort:** S (20 min)

Implement selection state with Set-based tracking, matching `BulkTagDialog` pattern.

```typescript
export function LanguageSelectorDialog({
  isOpen,
  onConfirm,
  onCancel,
  defaultSelection = [],
  className,
}: LanguageSelectorDialogProps) {
  // Accessibility IDs
  const uniqueId = useId();
  const titleId = `language-selector-title-${uniqueId}`;
  const descriptionId = `language-selector-desc-${uniqueId}`;

  // Focus trap ref
  const contentRef = useRef<HTMLDivElement>(null);

  // Selection state
  const [selectedLanguages, setSelectedLanguages] = useState<Set<SupportedLocale>>(
    new Set(defaultSelection)
  );

  // Reset selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLanguages(new Set(defaultSelection));
    }
  }, [isOpen, defaultSelection]);

  // Derived state
  const allSelected = selectedLanguages.size === locales.length;
  const noneSelected = selectedLanguages.size === 0;
  const confirmDisabled = noneSelected;
```

### Task 4: Implement Selection Handlers
**Effort:** S (20 min)

Implement toggle, select all, and deselect all handlers.

```typescript
  // Toggle individual language
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

  // Select all languages
  const handleSelectAll = useCallback(() => {
    setSelectedLanguages(new Set(locales));
  }, []);

  // Deselect all languages
  const handleDeselectAll = useCallback(() => {
    setSelectedLanguages(new Set());
  }, []);

  // Confirm selection
  const handleConfirm = useCallback(() => {
    onConfirm(Array.from(selectedLanguages));
  }, [selectedLanguages, onConfirm]);

  // Cancel/Close handler
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onCancel();
    }
  }, [onCancel]);
```

### Task 5: Implement Keyboard Handling
**Effort:** XS (15 min)

Add Escape key handling and focus trap integration.

```typescript
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isOpen]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);
```

### Task 6: Implement Dialog Structure with Radix
**Effort:** M (30 min)

Build the dialog structure following `AddPropertyModal` pattern.

```tsx
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

            // Desktop: centered modal (compact width for language selector)
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

          {/* Body with language list */}
          {/* ... Task 7 content */}

          {/* Footer */}
          {/* ... Task 8 content */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
```

### Task 7: Implement Language Checkbox List
**Effort:** M (30 min)

Build the language selection list with checkbox toggle buttons.

```tsx
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
              >
                Deselect All
              </button>
            </div>

            {/* Language Checkbox List */}
            <div className="space-y-2">
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
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${metadata.name}`}
                  >
                    {/* Custom checkbox indicator */}
                    <span
                      className={cn(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
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

### Task 8: Implement Footer with Action Buttons
**Effort:** S (15 min)

Add Cancel and Confirm action buttons.

```tsx
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
                Re-translate {selectedLanguages.size > 0 ? `(${selectedLanguages.size})` : ''}
              </button>
            </div>
          </div>
```

### Task 9: Update Barrel Export
**Effort:** XS (5 min)

Add export to the BulkTranslationBar index file.

**File:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`

```typescript
export { BulkTranslationBar } from './BulkTranslationBar';
export type { BulkTranslationBarProps } from './BulkTranslationBar';

export { LanguageSelectorDialog } from './LanguageSelectorDialog';
export type { LanguageSelectorDialogProps } from './LanguageSelectorDialog';
```

### Task 10: Add Component Tests
**Effort:** M (30 min)

Create test file covering key functionality.

**File:** `/src/components/TranslationManagement/BulkTranslationBar/__tests__/LanguageSelectorDialog.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelectorDialog } from '../LanguageSelectorDialog';

describe('LanguageSelectorDialog', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all six supported languages', () => {
    render(<LanguageSelectorDialog {...defaultProps} />);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    // ... other languages
  });

  it('toggles language selection on click', () => {
    render(<LanguageSelectorDialog {...defaultProps} />);
    const englishButton = screen.getByRole('button', { name: /select english/i });
    fireEvent.click(englishButton);
    expect(englishButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onConfirm with selected languages', () => {
    render(<LanguageSelectorDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /select english/i }));
    fireEvent.click(screen.getByRole('button', { name: /select french/i }));
    fireEvent.click(screen.getByRole('button', { name: /re-translate/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(['en', 'fr']);
  });

  it('disables confirm when no languages selected', () => {
    render(<LanguageSelectorDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /re-translate/i })).toBeDisabled();
  });

  it('Select All selects all languages', () => {
    render(<LanguageSelectorDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));
    expect(screen.getByText('6 of 6 selected')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel clicked', () => {
    render(<LanguageSelectorDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});
```

---

## Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Main component |
| `/src/components/TranslationManagement/BulkTranslationBar/__tests__/LanguageSelectorDialog.test.tsx` | Unit tests |

### Files to Modify
| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Add export for LanguageSelectorDialog |

### Functions to Implement
| Function | Location | Purpose |
|----------|----------|---------|
| `LanguageSelectorDialog` | LanguageSelectorDialog.tsx | Main component |
| `handleToggleLanguage` | LanguageSelectorDialog.tsx | Toggle single language selection |
| `handleSelectAll` | LanguageSelectorDialog.tsx | Select all languages |
| `handleDeselectAll` | LanguageSelectorDialog.tsx | Deselect all languages |
| `handleConfirm` | LanguageSelectorDialog.tsx | Confirm and return selected languages |

---

## Acceptance Criteria Checklist

### Core Functionality
- [ ] Modal dialog uses Radix UI Dialog primitive for accessibility and focus management
- [ ] Dialog opens centered on viewport with overlay backdrop preventing interaction with underlying content
- [ ] Dialog header displays title "Select Languages for Re-translation"
- [ ] Checkbox list displays all six supported languages: English, Spanish, French, German, Italian, Dutch (Note: Portuguese not in current config - uses Dutch)
- [ ] Each language checkbox displays flag icon followed by language name label
- [ ] Each checkbox includes proper label association for accessibility

### Selection Controls
- [ ] "Select All" button checks all language checkboxes in single action
- [ ] "Deselect All" button unchecks all language checkboxes in single action
- [ ] Select All and Deselect All buttons are clearly positioned above or below checkbox list
- [ ] Confirm button is labeled "Re-translate Selected Languages" or similar action-oriented text
- [ ] Confirm button is disabled when no languages are selected
- [ ] Confirm button is enabled when one or more languages are selected
- [ ] Cancel button dismisses dialog without triggering any translation actions

### Callbacks and State
- [ ] Escape key triggers cancel action and closes dialog
- [ ] Confirming selection closes dialog and returns array of selected language codes to parent component
- [ ] Component accepts onConfirm callback function that receives array of selected language codes
- [ ] Component accepts onCancel callback function that executes when dialog is dismissed
- [ ] Component accepts optional defaultSelection prop to pre-select specific languages
- [ ] Dialog maintains checkbox state during the dialog session but resets when reopened

### Accessibility
- [ ] Component is fully keyboard accessible with proper tab order through all controls
- [ ] First interactive element (first checkbox or Select All button) receives focus when dialog opens
- [ ] Checkbox states can be toggled using Space key when focused
- [ ] Dialog returns focus to triggering element when closed
- [ ] Component includes appropriate ARIA labels and roles for screen reader accessibility

### Responsive Design
- [ ] Dialog adapts to mobile viewports maintaining full usability on small screens
- [ ] Checkbox list scrolls independently if language count exceeds viewport height
- [ ] Dialog prevents body scroll when open on mobile devices

### Visual Design
- [ ] Visual design matches application design system with consistent spacing and typography
- [ ] Language order remains consistent across all uses (alphabetical by English name)
- [ ] Component renders correctly in both light and dark theme contexts if themes are supported
- [ ] Component integrates seamlessly with BulkTranslationBar component

---

## Task Summary

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| 1 | Create component file structure | XS | None |
| 2 | Define types and props interface | XS | Task 1 |
| 3 | Implement state management | S | Task 2 |
| 4 | Implement selection handlers | S | Task 3 |
| 5 | Implement keyboard handling | XS | Task 3 |
| 6 | Implement dialog structure with Radix | M | Tasks 1-5 |
| 7 | Implement language checkbox list | M | Task 6 |
| 8 | Implement footer with action buttons | S | Task 6 |
| 9 | Update barrel export | XS | Task 7 |
| 10 | Add component tests | M | Tasks 1-8 |

**Total Estimated Effort:** ~3 hours

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Radix Dialog conflicts with existing modals | Low | Medium | Use unique z-index, test with other modals open |
| Focus trap interfering with dialog controls | Low | High | Use Radix built-in focus management over custom hook |
| Mobile scroll behavior issues | Medium | Medium | Test thoroughly on mobile devices, use `overflow: hidden` on body |
| Language configuration mismatch (6 vs PRD mentions PT) | Low | Low | Use actual config values (`locales` from i18n/config.ts) |

---

## Notes

- The PRD mentions Portuguese (PT) as a supported language, but the actual codebase configuration uses Dutch (NL) instead. This implementation follows the existing codebase configuration from `/src/lib/i18n/config.ts`.
- The component follows the established patterns from `BulkTagDialog.tsx` for checkbox-style selection UI.
- Integration with `BulkTranslationBar` will be completed as part of Phase 4.1 task.
