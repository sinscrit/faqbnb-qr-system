# REQ-351: Create TranslationStatusFilter Component - Technical Implementation Overview

**Document Created:** 2026-01-19 12:00:00
**Last Modified:** 2026-01-19 12:00:00
**Request Reference:** REQ-318 (Create TranslationStatusFilter Component) / Pipeline Task 3.3
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.3

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating the TranslationStatusFilter component, part of Phase 3 (Dashboard Integration) in the Owner Translation Management epic. This component enables property owners to filter content item lists by translation status, quickly focusing on items that need translation attention.

### Scope

The TranslationStatusFilter component will:
- Provide a dropdown filter for filtering content lists by translation status
- Support six filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- Update the displayed label to reflect the currently selected filter
- Emit filter change events for parent components to handle list filtering
- Support controlled component pattern via props
- Provide keyboard accessibility and ARIA labels
- Follow existing filter component patterns from ItemManager

### Dependencies

- **Requires Epic 1 Completion:** Translation tables and status tracking must be in place
- **Requires Epic 3 Completion:** Translation status API endpoints (FR-6) must be available
- **Requires Task 3.1:** TranslationStatusWidget provides the dashboard context
- **Requires Task 3.2:** TranslationStatusColumn shows status in table rows (related pattern)
- **Parallel Work:** Can be developed in parallel with Task 3.4 (Dashboard integration)

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x with `cn()` utility | `src/lib/utils.ts` |
| Icons | Lucide React 0.525.0 | `package.json` |
| UI Primitives | Radix UI (dialog, dropdown) | `package.json` |
| i18n | next-intl with 6 supported locales | `src/lib/i18n/config.ts` |
| Component Pattern | Client components with 'use client' | Established pattern |

### 2.2 Reference Patterns from Codebase

**LocationFilter Pattern (Single-Select Dropdown):** `/src/components/ItemManager/components/dialogs/LocationFilter.tsx`

```typescript
export function LocationFilter({
  selectedLocation,
  availableLocations,
  onSelectionChange,
  disabled = false,
  className,
  label = 'Location',
  placeholder = 'Select location...',
}: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Click-outside handler, keyboard navigation, ARIA attributes
}
```

**LanguageSwitcher Pattern (Dropdown with Options):** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`

- Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape, Tab, Home, End)
- Click-outside handler via `useRef` and `useEffect`
- ARIA attributes: `aria-expanded`, `aria-haspopup="listbox"`, `aria-label`, `aria-selected`
- Focus management and visual feedback

**ContentTypeFilter Pattern (Chip Selection):** `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`

```typescript
const CONTENT_TYPE_OPTIONS = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'image', label: 'Photo', icon: '📷' },
  // ...
] as const;
```

### 2.3 Translation Status Types

From the Implementation Plan (`Plan-111`):

```typescript
// Translation status values from Epic 1 database schema
type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

// Filter options for the TranslationStatusFilter component
type TranslationFilterOption =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manual';
```

### 2.4 Visual Specifications (from PRD)

| Status | Icon | Color | Tailwind Class |
|--------|------|-------|----------------|
| Original | `●` | Blue | `text-blue-500` |
| Completed | `✓` | Green | `text-green-500` (#22C55E) |
| Manual | `✎` | Purple | `text-violet-500` (#8B5CF6) |
| Pending | `⏳` | Orange | `text-amber-500` (#F59E0B) |
| Failed | `❌` | Red | `text-red-500` (#EF4444) |

---

## 3. Implementation Approach

### 3.1 Component Architecture

The TranslationStatusFilter is a single-select dropdown following the LocationFilter pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                  TranslationStatusFilter                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  [Translation Status: All                            ▼]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Dropdown (when open):                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ✓ All                                                      ││
│  │    Fully Translated                                         ││
│  │    Partially Translated                                     ││
│  │    Pending                                                  ││
│  │    Failed                                                   ││
│  │    Manually Edited                                          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Filter Options with Visual Indicators:**

| Option | Value | Icon | Description |
|--------|-------|------|-------------|
| All | `all` | - | Shows all items regardless of translation status |
| Fully Translated | `fully_translated` | ✓ | Items with all languages completed |
| Partially Translated | `partially_translated` | ◐ | Items with some but not all languages |
| Pending | `pending` | ⏳ | Items with translations in progress |
| Failed | `failed` | ❌ | Items with at least one failed translation |
| Manually Edited | `manual` | ✎ | Items with manual translation overrides |

### 3.2 Props Interface

```typescript
/**
 * Translation status filter options
 */
export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manual';

/**
 * Props for TranslationStatusFilter component
 */
export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterValue;
  /** Callback when filter selection changes */
  onChange: (value: TranslationFilterValue) => void;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Custom class name for styling */
  className?: string;
  /** Label prefix shown in the dropdown trigger */
  labelPrefix?: string;
  /** Custom labels for internationalization */
  labels?: {
    all?: string;
    fullyTranslated?: string;
    partiallyTranslated?: string;
    pending?: string;
    failed?: string;
    manuallyEdited?: string;
  };
}
```

### 3.3 Component Structure

The TranslationStatusFilter is a self-contained component:

```
/src/components/TranslationManagement/TranslationStatusFilter/
├── index.ts                        # Barrel exports
├── TranslationStatusFilter.tsx     # Main component
├── TranslationStatusFilter.types.ts # Types (if needed, can be inline)
└── __tests__/
    └── TranslationStatusFilter.test.tsx
```

### 3.4 State Management

The component uses controlled component pattern:

```typescript
// Parent component manages filter state
const [statusFilter, setStatusFilter] = useState<TranslationFilterValue>('all');

// Filter is applied to fetch/display logic
const filteredItems = useMemo(() => {
  if (statusFilter === 'all') return items;

  return items.filter(item => {
    const status = calculateItemTranslationStatus(item.translations);
    return status === statusFilter;
  });
}, [items, statusFilter]);

// Component usage
<TranslationStatusFilter
  value={statusFilter}
  onChange={setStatusFilter}
/>
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/TranslationManagement/TranslationStatusFilter/index.ts` | Barrel exports for the component |
| `src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Main filter dropdown component |
| `src/components/TranslationManagement/TranslationStatusFilter/__tests__/TranslationStatusFilter.test.tsx` | Unit tests |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/TranslationManagement/index.ts` | Add barrel export for TranslationStatusFilter |
| `src/components/TranslationManagement/TranslationManagement.types.ts` | Add TranslationFilterValue type if not already present |

### 4.3 Functions/Components to Implement

| Component/Function | File | Purpose |
|-------------------|------|---------|
| `TranslationStatusFilter` | `TranslationStatusFilter.tsx` | Main dropdown filter component |
| `TRANSLATION_STATUS_OPTIONS` | `TranslationStatusFilter.tsx` | Constant array of filter options |
| `getFilterLabel` | `TranslationStatusFilter.tsx` | Helper to get display label for filter value |

### 4.4 Integration Points

The TranslationStatusFilter integrates with content list views:

```typescript
// In ItemGrid.tsx or Translation Management page
import { TranslationStatusFilter } from '@/components/TranslationManagement';

// Add filter above content list
<div className="flex items-center gap-4 mb-4">
  <TranslationStatusFilter
    value={statusFilter}
    onChange={setStatusFilter}
  />
  {/* Other filters */}
</div>

// Filter items based on selection
const filteredItems = useFilteredItems(items, { translationStatus: statusFilter });
```

---

## 5. Detailed Task Breakdown

### Task 3.3.1: Create TranslationStatusFilter Component

**File:** `src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Implementation:**

```typescript
/**
 * TranslationStatusFilter Component
 *
 * Dropdown filter for filtering content item lists by translation status.
 * Supports six filter options: All, Fully Translated, Partially Translated,
 * Pending, Failed, Manually Edited.
 *
 * @module TranslationManagement/TranslationStatusFilter
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md (Phase 3, Task 3.3)
 * @lastModified 2026-01-19
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Translation status filter options
 */
export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manual';

/**
 * Filter option configuration
 */
interface FilterOption {
  value: TranslationFilterValue;
  label: string;
  icon?: string;
  color?: string;
}

/**
 * Props for TranslationStatusFilter component
 */
export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterValue;
  /** Callback when filter selection changes */
  onChange: (value: TranslationFilterValue) => void;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Custom class name for styling */
  className?: string;
  /** Label prefix shown in the dropdown trigger */
  labelPrefix?: string;
  /** Custom labels for internationalization */
  labels?: Partial<Record<TranslationFilterValue, string>>;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default labels for filter options
 */
const DEFAULT_LABELS: Record<TranslationFilterValue, string> = {
  all: 'All',
  fully_translated: 'Fully Translated',
  partially_translated: 'Partially Translated',
  pending: 'Pending',
  failed: 'Failed',
  manual: 'Manually Edited',
};

/**
 * Filter options with visual indicators
 */
const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'fully_translated', label: 'Fully Translated', icon: '✓', color: 'text-green-500' },
  { value: 'partially_translated', label: 'Partially Translated', icon: '◐', color: 'text-amber-500' },
  { value: 'pending', label: 'Pending', icon: '⏳', color: 'text-amber-500' },
  { value: 'failed', label: 'Failed', icon: '❌', color: 'text-red-500' },
  { value: 'manual', label: 'Manually Edited', icon: '✎', color: 'text-violet-500' },
];

// =============================================================================
// Component
// =============================================================================

/**
 * TranslationStatusFilter - Dropdown filter for translation status
 *
 * Features:
 * - Single-select dropdown with clear visual feedback
 * - Six filter options covering all translation states
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click-outside to close
 * - Accessible with ARIA attributes
 * - Controlled component pattern
 *
 * @example
 * const [filter, setFilter] = useState<TranslationFilterValue>('all');
 *
 * <TranslationStatusFilter
 *   value={filter}
 *   onChange={setFilter}
 * />
 */
export function TranslationStatusFilter({
  value,
  onChange,
  disabled = false,
  className,
  labelPrefix = 'Translation Status',
  labels: customLabels = {},
}: TranslationStatusFilterProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  /**
   * Merge default labels with custom labels
   */
  const mergedLabels: Record<TranslationFilterValue, string> = {
    ...DEFAULT_LABELS,
    ...customLabels,
  };

  /**
   * Get the current filter option
   */
  const currentOption = FILTER_OPTIONS.find(opt => opt.value === value) || FILTER_OPTIONS[0];

  /**
   * Get display label for the current value
   */
  const getDisplayLabel = (filterValue: TranslationFilterValue): string => {
    return mergedLabels[filterValue] || DEFAULT_LABELS[filterValue];
  };

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Scroll focused option into view
   */
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [focusedIndex]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle option selection
   */
  const handleSelect = useCallback(
    (optionValue: TranslationFilterValue) => {
      onChange(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
      buttonRef.current?.focus();
    },
    [onChange]
  );

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = useCallback(() => {
    if (disabled) return;

    setIsOpen((prev) => {
      if (!prev) {
        // When opening, focus on current selection
        const currentIndex = FILTER_OPTIONS.findIndex(opt => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      } else {
        setFocusedIndex(-1);
      }
      return !prev;
    });
  }, [disabled, value]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const totalOptions = FILTER_OPTIONS.length;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) => (prev + 1) % totalOptions);
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(totalOptions - 1);
          } else {
            setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else if (focusedIndex >= 0) {
            const selectedOption = FILTER_OPTIONS[focusedIndex];
            if (selectedOption) {
              handleSelect(selectedOption.value);
            }
          }
          break;

        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;

        case 'Tab':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;

        case 'Home':
          event.preventDefault();
          if (isOpen) {
            setFocusedIndex(0);
          }
          break;

        case 'End':
          event.preventDefault();
          if (isOpen) {
            setFocusedIndex(totalOptions - 1);
          }
          break;
      }
    },
    [isOpen, focusedIndex, handleSelect]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Dropdown Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${labelPrefix}: ${getDisplayLabel(value)}`}
        aria-controls="translation-status-listbox"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
          'min-h-[44px]', // Touch target
          'bg-white text-left',
          'border border-gray-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          'touch-manipulation [-webkit-tap-highlight-color:transparent]',
          value !== 'all'
            ? 'border-blue-300 bg-blue-50'
            : 'hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-blue-500 border-transparent'
        )}
      >
        <Languages className="h-4 w-4 text-gray-500 flex-shrink-0" />

        <span className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-gray-600">{labelPrefix}:</span>
          <span className={cn(
            'font-medium truncate',
            value !== 'all' ? 'text-blue-700' : 'text-gray-900'
          )}>
            {getDisplayLabel(value)}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="translation-status-listbox"
          role="listbox"
          aria-label="Translation status options"
          aria-activedescendant={
            focusedIndex >= 0
              ? `translation-status-option-${FILTER_OPTIONS[focusedIndex]?.value}`
              : undefined
          }
          className={cn(
            'absolute z-50 mt-1 w-full min-w-[220px] bg-white rounded-lg shadow-lg',
            'border border-gray-200 max-h-60 overflow-y-auto',
            'py-1'
          )}
        >
          {FILTER_OPTIONS.map((option, index) => {
            const isSelected = value === option.value;
            const isFocused = focusedIndex === index;

            return (
              <button
                key={option.value}
                ref={(el) => {
                  optionsRef.current[index] = el;
                }}
                id={`translation-status-option-${option.value}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left',
                  'min-h-[44px]', // Touch target
                  'transition-colors focus:outline-none',
                  isFocused ? 'bg-blue-50' : '',
                  isSelected && !isFocused ? 'bg-gray-50' : '',
                  !isFocused && !isSelected ? 'hover:bg-gray-50' : ''
                )}
              >
                {/* Status Icon */}
                {option.icon && (
                  <span
                    className={cn('flex-shrink-0 w-5 text-center', option.color)}
                    aria-hidden="true"
                  >
                    {option.icon}
                  </span>
                )}
                {!option.icon && <span className="w-5 flex-shrink-0" />}

                {/* Label */}
                <span
                  className={cn(
                    'flex-1',
                    isSelected ? 'font-medium text-blue-700' : 'text-gray-700'
                  )}
                >
                  {getDisplayLabel(option.value)}
                </span>

                {/* Selection Checkmark */}
                {isSelected && (
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TranslationStatusFilter;
```

### Task 3.3.2: Create Barrel Export File

**File:** `src/components/TranslationManagement/TranslationStatusFilter/index.ts`

```typescript
/**
 * TranslationStatusFilter barrel exports
 * @module TranslationManagement/TranslationStatusFilter
 */

export { TranslationStatusFilter, default } from './TranslationStatusFilter';
export type {
  TranslationStatusFilterProps,
  TranslationFilterValue,
} from './TranslationStatusFilter';
```

### Task 3.3.3: Update TranslationManagement Index

**File:** `src/components/TranslationManagement/index.ts`

Add export:

```typescript
// TranslationStatusFilter
export {
  TranslationStatusFilter,
  type TranslationStatusFilterProps,
  type TranslationFilterValue,
} from './TranslationStatusFilter';
```

### Task 3.3.4: Create Unit Tests

**File:** `src/components/TranslationManagement/TranslationStatusFilter/__tests__/TranslationStatusFilter.test.tsx`

```typescript
/**
 * TranslationStatusFilter Component Tests
 * @module TranslationManagement/TranslationStatusFilter/__tests__
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslationStatusFilter, TranslationFilterValue } from '../TranslationStatusFilter';

describe('TranslationStatusFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default value', () => {
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Translation Status:');
    expect(screen.getByRole('button')).toHaveTextContent('All');
  });

  it('renders with selected filter value', () => {
    render(
      <TranslationStatusFilter value="fully_translated" onChange={mockOnChange} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Fully Translated');
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} />
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(6);
  });

  it('selects option on click', async () => {
    const user = userEvent.setup();
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Failed'));

    expect(mockOnChange).toHaveBeenCalledWith('failed');
  });

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup();
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Pending'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} />
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Arrow down to next option
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith('fully_translated');
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} />
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('applies disabled state', () => {
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} disabled />
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows checkmark on selected option', async () => {
    const user = userEvent.setup();
    render(
      <TranslationStatusFilter value="pending" onChange={mockOnChange} />
    );

    await user.click(screen.getByRole('button'));

    const pendingOption = screen.getByRole('option', { name: /pending/i });
    expect(pendingOption).toHaveAttribute('aria-selected', 'true');
  });

  it('uses custom labels when provided', () => {
    render(
      <TranslationStatusFilter
        value="fully_translated"
        onChange={mockOnChange}
        labels={{ fully_translated: 'Complete' }}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Complete');
  });

  it('uses custom label prefix', () => {
    render(
      <TranslationStatusFilter
        value="all"
        onChange={mockOnChange}
        labelPrefix="Filter"
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Filter:');
  });

  it('has proper ARIA attributes', () => {
    render(
      <TranslationStatusFilter value="all" onChange={mockOnChange} />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  });
});
```

---

## 6. Testing Requirements

### 6.1 Unit Test Cases

| Component | Test Case | Description |
|-----------|-----------|-------------|
| TranslationStatusFilter | Renders all options | All 6 filter options displayed in dropdown |
| TranslationStatusFilter | Shows selected value | Trigger button shows current selection |
| TranslationStatusFilter | Toggle dropdown | Click opens/closes dropdown |
| TranslationStatusFilter | Select option | Clicking option calls onChange |
| TranslationStatusFilter | Keyboard navigation | Arrow keys move focus |
| TranslationStatusFilter | Enter selects | Enter key selects focused option |
| TranslationStatusFilter | Escape closes | Escape key closes dropdown |
| TranslationStatusFilter | Click outside closes | Clicking outside closes dropdown |
| TranslationStatusFilter | Disabled state | Disabled prop prevents interaction |
| TranslationStatusFilter | Custom labels | Custom labels override defaults |
| TranslationStatusFilter | ARIA attributes | Proper accessibility attributes |
| TranslationStatusFilter | Visual indicators | Status icons display correctly |

### 6.2 Manual Testing Checklist

| Test Case | Expected Behavior |
|-----------|-------------------|
| Click trigger | Dropdown opens with all options |
| Select "Failed" | Dropdown closes, button shows "Failed", onChange called |
| Select "All" | Filter cleared, button shows "All" |
| Arrow Down | Focus moves to next option |
| Arrow Up | Focus moves to previous option |
| Enter on focused | Option selected |
| Tab | Dropdown closes, focus moves to next element |
| Escape | Dropdown closes |
| Click outside | Dropdown closes |
| Disabled state | Button is grayed out, no interaction |
| Screen reader | Announces current value and options |

### 6.3 Visual Testing

| Viewport | Expected Behavior |
|----------|-------------------|
| Mobile (< 640px) | Full-width dropdown, touch-friendly sizing |
| Tablet (640px - 1024px) | Standard dropdown width |
| Desktop (> 1024px) | Standard dropdown width |

---

## 7. Acceptance Criteria

From REQ-318:

- [x] Component renders as a dropdown control positioned above content item lists
- [x] Dropdown displays "Translation Status: All" as the default label when no filter is active
- [x] Dropdown offers six filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- [x] Selecting a filter option immediately updates the content list to show only matching items (via onChange callback)
- [x] Dropdown label updates to reflect the currently selected filter option
- [x] Selecting "All" removes any active filter and displays all content items
- [x] Component emits filter change events that parent components can handle to update list data
- [x] Component accepts current filter value as a prop to support controlled component pattern
- [x] Dropdown is keyboard accessible with arrow key navigation through options
- [x] Dropdown provides appropriate ARIA labels for screen readers
- [x] Component styling is consistent with the overall design system
- [x] Component is responsive and usable on tablet and desktop viewports

### Additional Technical Criteria:

- [x] Component follows established patterns from LocationFilter.tsx
- [x] Uses proper TypeScript types for filter values
- [x] Includes status icons for visual differentiation
- [x] Touch targets meet 44x44px minimum size
- [x] Click-outside closes dropdown
- [x] Keyboard navigation includes Home/End keys

---

## 8. Integration Notes

### 8.1 Data Flow

```
Content List Page (parent)
    │
    ├─── statusFilter state (TranslationFilterValue)
    │
    ├─── TranslationStatusFilter
    │         │
    │         └─── onChange → setStatusFilter
    │
    └─── Filtered Items Display
              │
              └─── Uses statusFilter to filter/fetch items
```

### 8.2 Usage with Translation Status API

```typescript
// In a content list page
import { TranslationStatusFilter, TranslationFilterValue } from '@/components/TranslationManagement';

export default function TranslationManagementPage() {
  const [statusFilter, setStatusFilter] = useState<TranslationFilterValue>('all');

  // Fetch items with filter
  const { data: items, isLoading } = useQuery({
    queryKey: ['items', propertyId, statusFilter],
    queryFn: () => fetchItems({ propertyId, translationStatus: statusFilter }),
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <TranslationStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <ItemList items={items} isLoading={isLoading} />
    </div>
  );
}
```

### 8.3 Integration with FilterPanel

The TranslationStatusFilter can be integrated into existing FilterPanel:

```typescript
// In FilterPanel.tsx (future enhancement)
<TranslationStatusFilter
  value={filters.translationStatus || 'all'}
  onChange={(value) => onFiltersChange({
    ...filters,
    translationStatus: value === 'all' ? undefined : value,
  })}
  disabled={disabled}
  className={classNames?.section}
/>
```

### 8.4 Relationship to Other Phase 3 Tasks

| Task | Relationship |
|------|--------------|
| 3.1 (TranslationStatusWidget) | Uses same status categories for summary display |
| 3.2 (TranslationStatusColumn) | Shows per-item status that filter acts upon |
| 3.4 (Dashboard Integration) | Filter used in dashboard page |
| 3.5 (Items List Integration) | Filter integrated into ItemGrid |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation status API not ready | Medium | High | Mock API responses for development; feature flag |
| Status calculation complexity | Low | Medium | Define clear rules for status aggregation |
| Mobile dropdown positioning | Low | Low | Use fixed positioning when near bottom |
| Performance with large lists | Low | Medium | Debounce filter changes; server-side filtering |
| Inconsistent status icons across components | Low | Low | Define constants in shared types file |

---

## 10. File Structure After Implementation

```
src/components/TranslationManagement/
├── index.ts                                    # Updated: add TranslationStatusFilter export
├── TranslationManagement.types.ts              # Shared types
│
├── TranslationStatusFilter/
│   ├── index.ts                                # NEW: Barrel exports
│   ├── TranslationStatusFilter.tsx             # NEW: Main component
│   └── __tests__/
│       └── TranslationStatusFilter.test.tsx    # NEW: Unit tests
│
├── TranslationPreviewPanel/                    # (From Task 2.2)
│   └── ...
│
├── TranslationStatusWidget/                    # (From Task 3.1)
│   └── ...
│
├── TranslationStatusColumn/                    # (From Task 3.2)
│   └── ...
│
└── ...
```

---

## 11. References

- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Phase 3, Task 3.3
- [LocationFilter](/src/components/ItemManager/components/dialogs/LocationFilter.tsx) - Dropdown pattern reference
- [LanguageSwitcher](/src/components/LanguageSwitcher/LanguageSwitcher.tsx) - Keyboard navigation pattern
- [ContentTypeFilter](/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx) - Filter option pattern
- [FilterPanel Overview](/docs/REQ-065-implement-filterpanel-overview.md) - Filter integration context
- [i18n Config](/src/lib/i18n/config.ts) - Supported locales reference
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
