# REQ-351: Create TranslationStatusFilter Component - Detailed Task Breakdown

**Document Created:** 2026-01-19 14:30:00
**Last Modified:** 2026-01-19 14:30:00
**Request Reference:** REQ-318 (Create TranslationStatusFilter Component)
**Overview Document:** `docs/REQ-351-create-translationstatusfilter-component-overview.md`
**Implementation Plan Reference:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.3
**Estimated Story Points:** 3

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Prerequisites](#2-prerequisites)
3. [Task Breakdown](#3-task-breakdown)
4. [Implementation Details](#4-implementation-details)
5. [Testing Requirements](#5-testing-requirements)
6. [Acceptance Criteria Checklist](#6-acceptance-criteria-checklist)
7. [Files Changed Summary](#7-files-changed-summary)

---

## 1. Executive Summary

This document provides granular, actionable tasks for implementing the TranslationStatusFilter component. This dropdown filter enables property owners to filter content item lists by translation status, allowing quick focus on items requiring translation attention.

### Component Purpose

The TranslationStatusFilter is a controlled dropdown component that:
- Displays six filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- Follows the established LocationFilter pattern from the codebase
- Emits filter change events for parent component integration
- Provides full keyboard accessibility and ARIA support

### Key Patterns to Follow

| Pattern Source | Location | Relevance |
|----------------|----------|-----------|
| LocationFilter | `src/components/ItemManager/components/dialogs/LocationFilter.tsx` | Dropdown structure, click-outside handling |
| LanguageSwitcher | `src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Keyboard navigation (Arrow keys, Home, End) |
| cn() utility | `src/lib/utils.ts` | Tailwind class merging |

---

## 2. Prerequisites

### Required Before Starting

- [ ] Epic 1 (Foundation) translation tables exist in database
- [ ] Epic 3 (Dynamic Content Translation) status tracking is functional
- [ ] TranslationManagement folder structure may need to be created

### Dependencies

| Dependency | Status Check |
|------------|--------------|
| React 19.1.0 | `package.json` confirms version |
| Tailwind CSS 4.x | `package.json` confirms version |
| Lucide React | `package.json` confirms installation |
| `cn()` utility | `src/lib/utils.ts` exists |

---

## 3. Task Breakdown

### Task 3.3.1: Create TranslationManagement Directory Structure

**Priority:** HIGH (Blocking)
**Estimated Time:** 5 minutes
**Files to Create:**

```
src/components/TranslationManagement/
├── index.ts                              # Barrel exports (create if not exists)
├── TranslationManagement.types.ts        # Shared types (create if not exists)
└── TranslationStatusFilter/
    ├── index.ts                          # Component barrel exports
    ├── TranslationStatusFilter.tsx       # Main component
    └── __tests__/
        └── TranslationStatusFilter.test.tsx
```

**Actions:**
1. Check if `src/components/TranslationManagement/` exists
2. Create directory if it doesn't exist
3. Create `src/components/TranslationManagement/TranslationStatusFilter/` directory
4. Create `src/components/TranslationManagement/TranslationStatusFilter/__tests__/` directory

**Verification:**
- Directory structure exists
- No existing files are overwritten

---

### Task 3.3.2: Create TranslationStatusFilter Types

**Priority:** HIGH (Blocking)
**Estimated Time:** 10 minutes
**File:** `src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` (inline types)

**Type Definitions:**

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
```

**Verification:**
- Types compile without errors
- All filter values are covered

---

### Task 3.3.3: Implement TranslationStatusFilter Component

**Priority:** HIGH (Core Task)
**Estimated Time:** 45 minutes
**File:** `src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Implementation Checklist:**

#### 3.3.3a: Add File Header and Imports
```typescript
/**
 * TranslationStatusFilter Component
 *
 * Dropdown filter for filtering content item lists by translation status.
 *
 * @module TranslationManagement/TranslationStatusFilter
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md (Phase 3, Task 3.3)
 * @lastModified 2026-01-19
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
```

#### 3.3.3b: Define Constants
```typescript
const DEFAULT_LABELS: Record<TranslationFilterValue, string> = {
  all: 'All',
  fully_translated: 'Fully Translated',
  partially_translated: 'Partially Translated',
  pending: 'Pending',
  failed: 'Failed',
  manual: 'Manually Edited',
};

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'fully_translated', label: 'Fully Translated', icon: '✓', color: 'text-green-500' },
  { value: 'partially_translated', label: 'Partially Translated', icon: '◐', color: 'text-amber-500' },
  { value: 'pending', label: 'Pending', icon: '⏳', color: 'text-amber-500' },
  { value: 'failed', label: 'Failed', icon: '❌', color: 'text-red-500' },
  { value: 'manual', label: 'Manually Edited', icon: '✎', color: 'text-violet-500' },
];
```

#### 3.3.3c: Implement State and Refs
- `isOpen` (boolean): Dropdown visibility state
- `focusedIndex` (number): Currently focused option index (-1 when none)
- `containerRef`: Reference to container div for click-outside detection
- `buttonRef`: Reference to trigger button for focus management
- `optionsRef`: Array of refs for option buttons

#### 3.3.3d: Implement Click-Outside Effect
```typescript
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
```

#### 3.3.3e: Implement Keyboard Navigation Handler
- `ArrowDown`: Move to next option (wrap to first if at end)
- `ArrowUp`: Move to previous option (wrap to last if at beginning)
- `Enter`/`Space`: Select focused option
- `Escape`: Close dropdown
- `Tab`: Close dropdown
- `Home`: Jump to first option
- `End`: Jump to last option

#### 3.3.3f: Implement Selection Handler
```typescript
const handleSelect = useCallback(
  (optionValue: TranslationFilterValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  },
  [onChange]
);
```

#### 3.3.3g: Implement Toggle Handler
```typescript
const toggleDropdown = useCallback(() => {
  if (disabled) return;
  setIsOpen((prev) => {
    if (!prev) {
      const currentIndex = FILTER_OPTIONS.findIndex(opt => opt.value === value);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    } else {
      setFocusedIndex(-1);
    }
    return !prev;
  });
}, [disabled, value]);
```

#### 3.3.3h: Implement Trigger Button JSX
- Include Languages icon
- Display label prefix and current value
- Show ChevronDown with rotation animation when open
- Apply active state styling when filter is not 'all'
- Include ARIA attributes: `aria-expanded`, `aria-haspopup="listbox"`, `aria-label`, `aria-controls`

#### 3.3.3i: Implement Dropdown Menu JSX
- Use `role="listbox"` on the container
- Each option uses `role="option"` and `aria-selected`
- Include status icons with colors
- Show checkmark on selected option
- Apply focus/hover styling
- Ensure 44x44px minimum touch targets

**Verification:**
- Component renders without errors
- All keyboard navigation works
- Click-outside closes dropdown
- ARIA attributes are present

---

### Task 3.3.4: Create Barrel Export for TranslationStatusFilter

**Priority:** MEDIUM
**Estimated Time:** 5 minutes
**File:** `src/components/TranslationManagement/TranslationStatusFilter/index.ts`

**Content:**
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

**Verification:**
- Imports work from both direct path and index

---

### Task 3.3.5: Update TranslationManagement Index

**Priority:** MEDIUM
**Estimated Time:** 5 minutes
**File:** `src/components/TranslationManagement/index.ts`

**Action:** Add or create exports:
```typescript
// TranslationStatusFilter
export {
  TranslationStatusFilter,
  type TranslationStatusFilterProps,
  type TranslationFilterValue,
} from './TranslationStatusFilter';
```

**Verification:**
- Import from `@/components/TranslationManagement` works

---

### Task 3.3.6: Create Unit Tests

**Priority:** HIGH
**Estimated Time:** 30 minutes
**File:** `src/components/TranslationManagement/TranslationStatusFilter/__tests__/TranslationStatusFilter.test.tsx`

**Test Cases to Implement:**

| Test Case | Description | Priority |
|-----------|-------------|----------|
| `renders with default value` | Component shows "Translation Status: All" by default | HIGH |
| `renders with selected filter value` | Shows correct label for non-all values | HIGH |
| `opens dropdown on click` | Dropdown appears with all 6 options | HIGH |
| `selects option on click` | Calls onChange with correct value | HIGH |
| `closes dropdown after selection` | Dropdown closes when option is selected | HIGH |
| `navigates with arrow keys` | ArrowDown/ArrowUp moves focus | HIGH |
| `selects with Enter key` | Enter selects focused option | HIGH |
| `closes on Escape key` | Escape closes dropdown without selection | HIGH |
| `applies disabled state` | Button is disabled when prop is true | MEDIUM |
| `shows checkmark on selected option` | aria-selected is true for current value | MEDIUM |
| `uses custom labels` | Custom labels override defaults | MEDIUM |
| `uses custom label prefix` | labelPrefix prop changes the prefix text | LOW |
| `has proper ARIA attributes` | All accessibility attributes present | HIGH |

**Test Structure:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslationStatusFilter, TranslationFilterValue } from '../TranslationStatusFilter';

describe('TranslationStatusFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  // ... tests
});
```

**Verification:**
- All tests pass
- Coverage includes main functionality

---

### Task 3.3.7: Manual Testing

**Priority:** HIGH
**Estimated Time:** 15 minutes

**Manual Test Checklist:**

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Click trigger | Click the dropdown button | Dropdown opens with all 6 options |
| Select "Failed" | Click "Failed" option | Dropdown closes, button shows "Failed", onChange called with 'failed' |
| Select "All" | Click "All" option | Filter cleared, button shows "All" |
| Arrow Down navigation | Press ArrowDown repeatedly | Focus moves through all options, wraps to first |
| Arrow Up navigation | Press ArrowUp repeatedly | Focus moves backwards, wraps to last |
| Enter selection | Focus an option, press Enter | Option selected, dropdown closes |
| Escape key | Open dropdown, press Escape | Dropdown closes, no selection change |
| Tab key | Open dropdown, press Tab | Dropdown closes, focus moves to next element |
| Click outside | Open dropdown, click outside | Dropdown closes |
| Disabled state | Pass `disabled={true}` | Button appears grayed, no interaction |
| Active filter styling | Select any non-all filter | Button has blue styling to indicate active filter |
| Screen reader test | Navigate with screen reader | Announces current value and options |

---

## 4. Implementation Details

### File: TranslationStatusFilter.tsx

**Complete Implementation Reference:**

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

export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manual';

interface FilterOption {
  value: TranslationFilterValue;
  label: string;
  icon?: string;
  color?: string;
}

export interface TranslationStatusFilterProps {
  value: TranslationFilterValue;
  onChange: (value: TranslationFilterValue) => void;
  disabled?: boolean;
  className?: string;
  labelPrefix?: string;
  labels?: Partial<Record<TranslationFilterValue, string>>;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_LABELS: Record<TranslationFilterValue, string> = {
  all: 'All',
  fully_translated: 'Fully Translated',
  partially_translated: 'Partially Translated',
  pending: 'Pending',
  failed: 'Failed',
  manual: 'Manually Edited',
};

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

export function TranslationStatusFilter({
  value,
  onChange,
  disabled = false,
  className,
  labelPrefix = 'Translation Status',
  labels: customLabels = {},
}: TranslationStatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const mergedLabels: Record<TranslationFilterValue, string> = {
    ...DEFAULT_LABELS,
    ...customLabels,
  };

  const currentOption = FILTER_OPTIONS.find(opt => opt.value === value) || FILTER_OPTIONS[0];

  const getDisplayLabel = (filterValue: TranslationFilterValue): string => {
    return mergedLabels[filterValue] || DEFAULT_LABELS[filterValue];
  };

  // Click outside handler
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

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [focusedIndex]);

  const handleSelect = useCallback(
    (optionValue: TranslationFilterValue) => {
      onChange(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
      buttonRef.current?.focus();
    },
    [onChange]
  );

  const toggleDropdown = useCallback(() => {
    if (disabled) return;

    setIsOpen((prev) => {
      if (!prev) {
        const currentIndex = FILTER_OPTIONS.findIndex(opt => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      } else {
        setFocusedIndex(-1);
      }
      return !prev;
    });
  }, [disabled, value]);

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
          'min-h-[44px]',
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
                  'min-h-[44px]',
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

---

## 5. Testing Requirements

### Unit Test File

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

  it('highlights active filter with blue styling', () => {
    render(
      <TranslationStatusFilter value="failed" onChange={mockOnChange} />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('border-blue-300');
    expect(trigger).toHaveClass('bg-blue-50');
  });
});
```

### Running Tests

```bash
npm run test -- src/components/TranslationManagement/TranslationStatusFilter
```

---

## 6. Acceptance Criteria Checklist

### From REQ-318

| # | Criteria | Task Reference | Status |
|---|----------|----------------|--------|
| 1 | Component renders as a dropdown control positioned above content item lists | Task 3.3.3h | [ ] |
| 2 | Dropdown displays "Translation Status: All" as the default label when no filter is active | Task 3.3.3h | [ ] |
| 3 | Dropdown offers six filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited | Task 3.3.3b, 3.3.3i | [ ] |
| 4 | Selecting a filter option immediately updates the content list to show only matching items | Task 3.3.3f | [ ] |
| 5 | Dropdown label updates to reflect the currently selected filter option | Task 3.3.3h | [ ] |
| 6 | Selecting "All" removes any active filter and displays all content items | Task 3.3.3f | [ ] |
| 7 | Component emits filter change events that parent components can handle to update list data | Task 3.3.3f | [ ] |
| 8 | Component accepts current filter value as a prop to support controlled component pattern | Task 3.3.2 | [ ] |
| 9 | Dropdown is keyboard accessible with arrow key navigation through options | Task 3.3.3e | [ ] |
| 10 | Dropdown provides appropriate ARIA labels for screen readers | Task 3.3.3h, 3.3.3i | [ ] |
| 11 | Component styling is consistent with the overall design system | Task 3.3.3h, 3.3.3i | [ ] |
| 12 | Component is responsive and usable on tablet and desktop viewports | Task 3.3.3h, 3.3.3i | [ ] |

### Additional Technical Criteria

| # | Criteria | Task Reference | Status |
|---|----------|----------------|--------|
| 13 | Component follows established patterns from LocationFilter.tsx | Task 3.3.3 | [ ] |
| 14 | Uses proper TypeScript types for filter values | Task 3.3.2 | [ ] |
| 15 | Includes status icons for visual differentiation | Task 3.3.3b, 3.3.3i | [ ] |
| 16 | Touch targets meet 44x44px minimum size | Task 3.3.3h, 3.3.3i | [ ] |
| 17 | Click-outside closes dropdown | Task 3.3.3d | [ ] |
| 18 | Keyboard navigation includes Home/End keys | Task 3.3.3e | [ ] |
| 19 | All unit tests pass | Task 3.3.6 | [ ] |

---

## 7. Files Changed Summary

### New Files Created

| File | Purpose |
|------|---------|
| `src/components/TranslationManagement/TranslationStatusFilter/index.ts` | Barrel exports |
| `src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Main component |
| `src/components/TranslationManagement/TranslationStatusFilter/__tests__/TranslationStatusFilter.test.tsx` | Unit tests |

### Files Modified

| File | Change |
|------|--------|
| `src/components/TranslationManagement/index.ts` | Add TranslationStatusFilter export (create if doesn't exist) |

### File Structure After Implementation

```
src/components/TranslationManagement/
├── index.ts                                     # Updated with TranslationStatusFilter export
├── TranslationStatusFilter/
│   ├── index.ts                                 # NEW: Barrel exports
│   ├── TranslationStatusFilter.tsx              # NEW: Main component
│   └── __tests__/
│       └── TranslationStatusFilter.test.tsx     # NEW: Unit tests
└── ... (other components from previous tasks)
```

---

## Summary

This task breakdown provides a complete implementation guide for the TranslationStatusFilter component. Key points:

1. **Pattern Adherence**: Follows LocationFilter pattern for dropdown behavior
2. **Accessibility**: Full keyboard navigation and ARIA support
3. **Visual Consistency**: Status icons match PRD specifications
4. **Controlled Component**: Parent manages state via value/onChange props
5. **Test Coverage**: Comprehensive unit tests for all functionality

Implementation should proceed in order: directory setup → types → component → exports → tests → manual verification.
