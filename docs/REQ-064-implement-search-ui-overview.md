# REQ-064: Implement Search UI - Technical Implementation Overview

**Document Created:** 2026-01-03 11:45:00
**Last Modified:** 2026-01-03 11:45:00
**Request Reference:** REQ-064 (Search Input Interface for Item Filtering)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.3

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating the Search UI component, the third task of Phase 2 in the ItemManager component implementation. This component provides a responsive, accessible search input field with debounced updates and clear functionality.

### Scope

The Search UI component will:
- Provide a search input field with debounced query updates
- Include a clear button to reset the search
- Display a search icon with proper styling
- Integrate with the `useItemSearch` hook via ItemToolbar
- Support keyboard shortcuts and accessibility

### Dependencies

- **Requires Phase 1 Completion:** Task 1.1 (Directory Structure & Types) must be complete
- **Requires Task 2.1:** The `useItemSearch` hook must be available for search functionality
- **Requires Task 2.2:** The `ItemToolbar` component provides the container where SearchInput will be integrated
- **Parallel Work:** Can be developed in parallel with Task 2.4 (FilterPanel) and Task 2.5 (SortMenu)

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x with `cn()` utility | `src/lib/utils.ts` |
| Icons | Lucide React 0.525.0 | `package.json` |
| Component Pattern | Client components with 'use client' | Established pattern |

### 2.2 Reference Patterns from Codebase

**Primary Pattern Reference:** `/src/components/ItemsManagement.tsx` (lines 220-230)

The existing search input implementation:
```typescript
<div className="relative flex-1 max-w-md">
  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
  <input
    type="text"
    placeholder="Search items..."
    value={searchTerm}
    onChange={(e) => onSearchChange(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>
```

**Key Observations:**
- Search icon positioned absolutely on the left (w-5 h-5)
- Left padding (pl-10) accommodates the icon
- Focus ring uses blue-500 color
- Uses controlled input pattern

### 2.3 Debounce Implementation

The implementation plan specifies debounced updates to prevent excessive re-renders during typing. We will implement debouncing using a custom hook:

```typescript
// Debounce pattern - update search after user stops typing
const DEBOUNCE_DELAY_MS = 300; // 300ms is standard UX delay
```

### 2.4 Types from Implementation Plan

From `ItemManager.types.ts`:
```typescript
interface ItemManagerLabels {
  searchPlaceholder?: string;
  // ... other labels
}

interface ItemManagerClassNames {
  searchInput?: string;
  // ... other class names
}
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The `SearchInput` component is a controlled input that:
1. Accepts a value and onChange callback from parent (ItemToolbar)
2. Internally manages debounced updates
3. Shows a clear button when the input has a value
4. Provides visual feedback with icons and styling

```
┌─────────────────────────────────────────────────────────────────┐
│                        SearchInput                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  🔍  [ Search items...                              ] [✕]   ││
│  │  ↑                                                      ↑    ││
│  │  Search                                            Clear     ││
│  │  Icon                                              Button    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Props Interface

```typescript
/**
 * Props for SearchInput component.
 */
export interface SearchInputProps {
  /** Current search query value */
  value: string;
  /** Callback when search query changes (after debounce) */
  onChange: (query: string) => void;
  /** Placeholder text for input (default: "Search items...") */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the input element */
  inputClassName?: string;
  /** ID for the input element (for labels) */
  id?: string;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  /** Callback when input is focused */
  onFocus?: () => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
}
```

### 3.3 Debounce Hook

A lightweight custom debounce hook for the search input:

```typescript
/**
 * useDebounce Hook
 *
 * Returns a debounced value that only updates after the specified delay.
 * Used to prevent excessive search operations while typing.
 */
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes or component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 3.4 Component Structure

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '../hooks/useDebounce';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search items...',
  debounceMs = 300,
  disabled = false,
  className,
  inputClassName,
  id,
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchInputProps) {
  // Internal state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the local value
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Sync external value to local state when it changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Emit debounced changes to parent
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  // Handle input change with immediate local update
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  // Clear the search input
  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange(''); // Immediate clear (no debounce needed)
    inputRef.current?.focus();
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (localValue) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    }
  }, [localValue, handleClear]);

  const hasValue = localValue.length > 0;

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
          "text-gray-400 pointer-events-none",
          disabled && "opacity-50"
        )}
        aria-hidden="true"
      />

      {/* Input Field */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "w-full pl-10 pr-10 py-2 text-sm",
          "border border-gray-300 rounded-lg bg-white",
          "placeholder:text-gray-400",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
          inputClassName
        )}
        role="searchbox"
        aria-label={placeholder}
      />

      {/* Clear Button */}
      {hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1 rounded-md",
            "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/SearchInput.tsx` | Main search input component |
| `src/components/ItemManager/hooks/useDebounce.ts` | Debounce utility hook |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/index.ts` | Add barrel export for SearchInput |
| `src/components/ItemManager/hooks/index.ts` | Add barrel export for useDebounce |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Replace SearchPlaceholder with SearchInput component |
| `src/components/ItemManager/ItemManager.types.ts` | Add SearchInputProps type if not present |

### 4.3 Functions/Components to Implement

| Component/Function | File | Purpose |
|-------------------|------|---------|
| `SearchInput` | `SearchInput.tsx` | Main search input component |
| `useDebounce` | `useDebounce.ts` | Debounce utility hook |

### 4.4 Integration Points

The SearchInput will be integrated into `ItemToolbar.tsx`:

```typescript
// Replace SearchPlaceholder in ItemToolbar.tsx
import { SearchInput } from './SearchInput';

// In the component:
{enableSearch && (
  <div className={cn("flex-1 max-w-md", classNames.searchContainer)}>
    {renderSearch ? (
      renderSearch()
    ) : (
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={labels.searchPlaceholder ?? 'Search items...'}
        disabled={disabled}
      />
    )}
  </div>
)}
```

---

## 5. Detailed Task Breakdown

### Task 2.3.1: Create useDebounce Hook

**File:** `src/components/ItemManager/hooks/useDebounce.ts`

**Implementation:**

```typescript
/**
 * useDebounce Hook
 *
 * Returns a debounced value that only updates after the specified delay.
 * Useful for search inputs to prevent excessive API calls or re-renders.
 *
 * @module ItemManager/hooks/useDebounce
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Debounce a value by delaying updates.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating
 * @returns The debounced value
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   // This runs 300ms after the user stops typing
 *   performSearch(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Skip if delay is 0 or negative (no debounce)
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    // Set up timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes or component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Default debounce delay for search inputs.
 * 300ms is a standard UX delay that feels responsive while reducing unnecessary operations.
 */
export const DEFAULT_DEBOUNCE_MS = 300;
```

### Task 2.3.2: Create SearchInput Component

**File:** `src/components/ItemManager/components/SearchInput.tsx`

**Implementation:**

```typescript
/**
 * SearchInput Component
 *
 * A responsive search input with debounced updates, clear button,
 * and keyboard shortcuts. Designed for the ItemManager toolbar.
 *
 * @module ItemManager/components/SearchInput
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce, DEFAULT_DEBOUNCE_MS } from '../hooks/useDebounce';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for SearchInput component.
 */
export interface SearchInputProps {
  /** Current search query value (controlled) */
  value: string;
  /** Callback when search query changes (after debounce) */
  onChange: (query: string) => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the input element */
  inputClassName?: string;
  /** ID for the input element (for form labels) */
  id?: string;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  /** Callback when input is focused */
  onFocus?: () => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SearchInput - A debounced search input with clear button.
 *
 * Features:
 * - Debounced onChange to prevent excessive updates
 * - Clear button appears when input has value
 * - Search icon on the left
 * - Escape key to clear or blur
 * - Accessible with proper ARIA attributes
 *
 * @example
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search items..."
 * />
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search items...',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  disabled = false,
  className,
  inputClassName,
  id,
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchInputProps) {
  // Internal state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the local value
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Track if we need to emit changes (to avoid loops)
  const isInitialMount = useRef(true);

  // Sync external value to local state when prop changes
  useEffect(() => {
    // Only sync if value actually changed from external source
    if (value !== localValue) {
      setLocalValue(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Emit debounced changes to parent
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only emit if debounced value differs from external value
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  // Handle input change with immediate local update
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  // Clear the search input
  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange(''); // Immediate clear (bypass debounce)
    inputRef.current?.focus();
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (localValue) {
        // Clear if there's content
        handleClear();
      } else {
        // Blur if already empty
        inputRef.current?.blur();
      }
    }
  }, [localValue, handleClear]);

  const hasValue = localValue.length > 0;

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2",
          "w-5 h-5 text-gray-400",
          "pointer-events-none",
          disabled && "opacity-50"
        )}
        aria-hidden="true"
      />

      {/* Input Field */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          // Base styles
          "w-full text-sm bg-white",
          // Spacing for icons
          "pl-10",
          hasValue && !disabled ? "pr-10" : "pr-4",
          "py-2",
          // Border and rounding
          "border border-gray-300 rounded-lg",
          // Placeholder
          "placeholder:text-gray-400",
          // Transitions
          "transition-colors duration-150",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          // Disabled state
          disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
          // Custom class
          inputClassName
        )}
        role="searchbox"
        aria-label={placeholder}
      />

      {/* Clear Button - only visible when has value and not disabled */}
      {hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          tabIndex={-1} // Skip in tab order, accessible via Escape key
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1 rounded-md",
            "text-gray-400 hover:text-gray-600",
            "hover:bg-gray-100",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
```

### Task 2.3.3: Export from Barrel Files

**File:** `src/components/ItemManager/hooks/index.ts`

Add export:
```typescript
export { useDebounce, DEFAULT_DEBOUNCE_MS } from './useDebounce';
```

**File:** `src/components/ItemManager/components/index.ts`

Add export:
```typescript
export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';
```

### Task 2.3.4: Integrate into ItemToolbar

**File:** `src/components/ItemManager/components/ItemToolbar.tsx`

Replace the `SearchPlaceholder` component:

```typescript
// At top of file, add import:
import { SearchInput } from './SearchInput';

// In the component render, replace SearchPlaceholder usage:
{enableSearch && (
  <div className={cn("flex-1 max-w-md", classNames.searchContainer)}>
    {renderSearch ? (
      renderSearch()
    ) : (
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={labels.searchPlaceholder ?? 'Search items...'}
        disabled={false}
        className="w-full"
      />
    )}
  </div>
)}

// Remove the SearchPlaceholder function definition
```

---

## 6. Testing Requirements

### 6.1 Unit Test Cases

Create tests in `src/components/ItemManager/hooks/__tests__/useDebounce.test.ts`:

| Test Case | Description |
|-----------|-------------|
| Returns initial value immediately | Hook returns value on first render |
| Debounces value changes | Value doesn't update immediately on change |
| Updates after delay | Value updates after specified delay |
| Cancels on unmount | Pending update cancelled when component unmounts |
| Handles rapid changes | Only latest value emitted after delay |
| Zero delay bypasses debounce | Immediate update when delay is 0 |

Create tests in `src/components/ItemManager/components/__tests__/SearchInput.test.tsx`:

| Test Case | Description |
|-----------|-------------|
| Renders with placeholder | Input shows placeholder text |
| Shows search icon | Search icon is visible |
| Updates on typing | Local value updates immediately |
| Debounces onChange | Parent onChange called after delay |
| Clear button appears | Button shows when input has value |
| Clear button clears input | Clicking clears value immediately |
| Escape key clears | Pressing Escape clears input |
| Escape key blurs | Pressing Escape on empty input blurs |
| Disabled state | Input is disabled when prop set |
| Custom placeholder | Custom placeholder text rendered |

### 6.2 Manual Testing Checklist

| Test Case | Expected Behavior |
|-----------|-------------------|
| Type in search | Characters appear immediately |
| Stop typing | onChange fires after 300ms |
| Click clear button | Input clears, onChange fires with '' |
| Press Escape with text | Input clears |
| Press Escape when empty | Input loses focus |
| Tab navigation | Input can be focused via Tab |
| Screen reader | Announces "Search items..." on focus |
| Mobile touch | Clear button has adequate touch target |

### 6.3 Visual Testing

| Viewport | Expected Behavior |
|----------|-------------------|
| Mobile (< 640px) | Full width, stacked in toolbar |
| Tablet (640px - 1024px) | Flex-1 in row with other controls |
| Desktop (> 1024px) | Max-width constrained (max-w-md) |

---

## 7. Acceptance Criteria

From REQ-064:

- [ ] Search input with debounced updates - typing doesn't cause immediate re-renders
- [ ] Clear search button - visible when input has value
- [ ] Search icon and styling - consistent with existing design patterns
- [ ] Responsive - works on mobile and desktop
- [ ] Accessible - proper ARIA labels and keyboard support

### Additional Technical Criteria:

- [ ] Component follows established patterns from ItemsManagement.tsx
- [ ] Debounce delay is configurable (default 300ms)
- [ ] Clear button provides immediate feedback (no debounce on clear)
- [ ] Escape key provides keyboard shortcut for clearing
- [ ] Focus ring visible on keyboard navigation
- [ ] Touch targets meet 44x44px minimum size
- [ ] Component accepts className overrides for customization

---

## 8. Integration Notes

### 8.1 Data Flow

```
ItemManager (parent)
    │
    ├─── useItemManagerState
    │         │
    │         └─── state.searchQuery
    │
    ├─── ItemToolbar
    │         │
    │         └─── SearchInput
    │                  │
    │                  ├─── localValue (internal state)
    │                  │         │
    │                  │         └─── useDebounce(localValue, 300)
    │                  │                    │
    │                  │                    └─── debouncedValue
    │                  │
    │                  └─── onChange(debouncedValue)
    │                             │
    │                             └─── dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
    │
    └─── useItemSearch
              │
              └─── Uses state.searchQuery to filter items
```

### 8.2 Relationship to Other Phase 2 Tasks

| Task | Relationship |
|------|--------------|
| 2.1 (useItemSearch) | Consumes the search query to filter items |
| 2.2 (ItemToolbar) | Contains the SearchInput component |
| 2.4 (FilterPanel) | Parallel - both affect filtered results |
| 2.5 (SortMenu) | Parallel - operates on filtered results |
| 2.6 (Utilities) | May use shared constants |

### 8.3 Performance Considerations

1. **Debouncing**: 300ms delay prevents excessive re-renders
2. **Local State**: Immediate UI feedback while debouncing
3. **Stable Callbacks**: useCallback for all handlers
4. **Conditional Rendering**: Clear button only renders when needed

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Debounce timing feels slow | Low | Low | Make delay configurable; 300ms is standard |
| State sync issues | Medium | Medium | Clear precedence: external value syncs to local |
| Clear doesn't work | Low | Medium | Bypass debounce on clear; test thoroughly |
| Focus management bugs | Low | Low | Use inputRef.current?.focus() pattern |
| Mobile keyboard issues | Low | Low | Let browser handle native input behavior |

---

## 10. Appendix: File Structure After Implementation

```
src/components/ItemManager/
├── hooks/
│   ├── index.ts                    # Updated: add useDebounce export
│   ├── useDebounce.ts              # NEW: Debounce utility hook
│   ├── useItemSearch.ts            # (Created in Task 2.1)
│   ├── useItemManagerState.ts      # (Created in Phase 1)
│   └── __tests__/
│       ├── useDebounce.test.ts     # NEW: Unit tests
│       └── useItemSearch.test.ts   # (Created in Task 2.1)
├── components/
│   ├── index.ts                    # Updated: add SearchInput export
│   ├── SearchInput.tsx             # NEW: Search input component
│   ├── ItemToolbar.tsx             # Updated: integrate SearchInput
│   └── __tests__/
│       └── SearchInput.test.tsx    # NEW: Component tests
└── ItemManager.types.ts            # (Created in Phase 1)
```

---

## 11. References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.3
- [ItemsManagement](/src/components/ItemsManagement.tsx) - Search input pattern reference
- [ItemToolbar Overview](/docs/REQ-063-build-itemtoolbar-component-overview.md) - Container component
- [useItemSearch Overview](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Search hook documentation
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines

---

## 12. Appendix: Complete SearchInput Component

```typescript
/**
 * SearchInput Component - Complete Implementation
 *
 * @module ItemManager/components/SearchInput
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce, DEFAULT_DEBOUNCE_MS } from '../hooks/useDebounce';

export interface SearchInputProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search items...',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  disabled = false,
  className,
  inputClassName,
  id,
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(localValue, debounceMs);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (localValue) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    }
  }, [localValue, handleClear]);

  const hasValue = localValue.length > 0;

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2",
          "w-5 h-5 text-gray-400 pointer-events-none",
          disabled && "opacity-50"
        )}
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        id={id}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "w-full text-sm bg-white",
          "pl-10",
          hasValue && !disabled ? "pr-10" : "pr-4",
          "py-2",
          "border border-gray-300 rounded-lg",
          "placeholder:text-gray-400",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
          inputClassName
        )}
        role="searchbox"
        aria-label={placeholder}
      />

      {hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          tabIndex={-1}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1 rounded-md",
            "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
```
