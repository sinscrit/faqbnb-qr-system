# REQ-064: Implement Search UI - Detailed Task Breakdown

**Document Created:** 2026-01-03 03:33:47
**Last Modified:** 2026-01-03 03:33:47
**Request Reference:** REQ-064 (Search Input Interface for Item Filtering)
**Overview Document:** `/docs/REQ-064-implement-search-ui-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.3

---

## Document Purpose

This document provides granular, actionable tasks for implementing the Search UI component as specified in REQ-064. Each task is sized to approximately 1 story point (a few hours of focused work) and includes verification steps.

---

## Prerequisites

Before starting implementation, verify the following:

- [ ] Phase 1 complete (Directory Structure & Types - Task 1.1)
- [ ] Task 2.1 complete (`useItemSearch` hook available)
- [ ] Task 2.2 complete (`ItemToolbar` component with `SearchPlaceholder`)
- [ ] Development environment running (`npm run dev`)

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/hooks/useDebounce.ts` | Debounce utility hook |
| `src/components/ItemManager/components/SearchInput.tsx` | Main search input component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/hooks/index.ts` | Add barrel export for useDebounce |
| `src/components/ItemManager/components/index.ts` | Add barrel export for SearchInput |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Replace SearchPlaceholder with SearchInput |
| `src/components/ItemManager/ItemManager.types.ts` | Add SearchInputProps type if not present |

---

## Task Breakdown

### Task 2.3.1: Create useDebounce Hook

**Estimated Effort:** 0.5 story points
**File:** `src/components/ItemManager/hooks/useDebounce.ts`

#### Description

Create a reusable debounce hook that delays value updates by a configurable amount of time. This prevents excessive search operations while the user is typing.

#### Implementation Steps

1. Create the file `src/components/ItemManager/hooks/useDebounce.ts`
2. Implement the `useDebounce<T>` generic hook:
   - Accept `value: T` and `delay: number` parameters
   - Use `useState` to store the debounced value
   - Use `useEffect` with `setTimeout` to update after delay
   - Clean up timeout on value change or unmount
   - Handle edge case where delay <= 0 (no debounce)
3. Export `DEFAULT_DEBOUNCE_MS` constant (300ms)
4. Add JSDoc documentation with usage example

#### Code Template

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
 * Default debounce delay for search inputs.
 * 300ms is a standard UX delay that feels responsive while reducing unnecessary operations.
 */
export const DEFAULT_DEBOUNCE_MS = 300;

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
```

#### Verification Steps

- [ ] File created at `src/components/ItemManager/hooks/useDebounce.ts`
- [ ] Hook exports `useDebounce` function and `DEFAULT_DEBOUNCE_MS` constant
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Manual test: Create test component that logs debounced value changes
- [ ] Verify delay behavior: Value updates after specified delay
- [ ] Verify cleanup: Rapid changes don't cause multiple updates
- [ ] Verify zero delay: Immediate update when delay is 0

#### Acceptance Criteria

- [x] Generic hook works with any value type
- [x] Delay is configurable with sensible default
- [x] Cleanup prevents memory leaks
- [x] Edge cases handled (delay <= 0)

---

### Task 2.3.2: Export useDebounce from Hooks Barrel

**Estimated Effort:** 0.25 story points
**File:** `src/components/ItemManager/hooks/index.ts`

#### Description

Add the useDebounce hook to the barrel export file for the hooks directory.

#### Implementation Steps

1. Open `src/components/ItemManager/hooks/index.ts`
2. Add export statement for useDebounce hook and constant

#### Code Change

```typescript
// Add to existing exports in hooks/index.ts
export { useDebounce, DEFAULT_DEBOUNCE_MS } from './useDebounce';
```

#### Verification Steps

- [ ] Export added to `src/components/ItemManager/hooks/index.ts`
- [ ] Can import from barrel: `import { useDebounce } from '../hooks'`
- [ ] TypeScript compiles without errors

#### Acceptance Criteria

- [x] useDebounce is exported from the hooks barrel file
- [x] DEFAULT_DEBOUNCE_MS is exported alongside

---

### Task 2.3.3: Create SearchInput Component Base Structure

**Estimated Effort:** 1 story point
**File:** `src/components/ItemManager/components/SearchInput.tsx`

#### Description

Create the main SearchInput component with all required props, controlled input pattern, and basic layout with search icon.

#### Implementation Steps

1. Create file `src/components/ItemManager/components/SearchInput.tsx`
2. Add 'use client' directive
3. Import dependencies: React hooks, Lucide icons, cn utility, useDebounce
4. Define `SearchInputProps` interface with all props from overview
5. Implement base component structure:
   - Container div with relative positioning
   - Search icon positioned absolutely on left
   - Input element with proper padding and styling
   - Controlled input with local state for immediate feedback
6. Add accessibility attributes: role="searchbox", aria-label

#### Props Interface

```typescript
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
```

#### Code Template

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

// ============================================================================
// Component
// ============================================================================

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

      {/* Clear button placeholder - implemented in next task */}
    </div>
  );
}
```

#### Verification Steps

- [ ] File created at `src/components/ItemManager/components/SearchInput.tsx`
- [ ] Component renders without errors
- [ ] Search icon displays on the left side of input
- [ ] Input accepts text and shows it immediately
- [ ] Disabled state applies correct styling
- [ ] TypeScript compiles without errors
- [ ] Focus state shows blue ring

#### Acceptance Criteria

- [x] Component structure matches design from overview
- [x] Controlled input with local state for immediate feedback
- [x] Debounced value emitted after delay
- [x] Search icon positioned correctly
- [x] Accessible with role="searchbox" and aria-label

---

### Task 2.3.4: Add Clear Button to SearchInput

**Estimated Effort:** 0.5 story points
**File:** `src/components/ItemManager/components/SearchInput.tsx`

#### Description

Add a clear button that appears when the input has a value. The button clears the search immediately (no debounce) and refocuses the input.

#### Implementation Steps

1. Add handleClear callback function:
   - Set localValue to empty string
   - Call onChange('') immediately (bypass debounce)
   - Refocus the input using inputRef
2. Render clear button conditionally (when hasValue && !disabled)
3. Position button absolutely on the right side
4. Style with proper hover/focus states
5. Add aria-label for accessibility

#### Code Addition

```typescript
// Add to SearchInput component

// Clear the search input
const handleClear = useCallback(() => {
  setLocalValue('');
  onChange(''); // Immediate clear (bypass debounce)
  inputRef.current?.focus();
}, [onChange]);

// ... in the return statement, after the input:

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
```

#### Verification Steps

- [ ] Clear button appears when input has text
- [ ] Clear button hidden when input is empty
- [ ] Clear button hidden when input is disabled
- [ ] Clicking clear button empties the input
- [ ] After clearing, input receives focus
- [ ] Clear action triggers onChange immediately (no delay)
- [ ] Button has proper hover/focus styling
- [ ] Touch target adequate for mobile (at least 24x24px with padding)

#### Acceptance Criteria

- [x] Clear button shows/hides based on input value
- [x] Clear provides immediate feedback (no debounce)
- [x] Input refocuses after clearing
- [x] Accessible with aria-label

---

### Task 2.3.5: Add Keyboard Shortcuts to SearchInput

**Estimated Effort:** 0.5 story points
**File:** `src/components/ItemManager/components/SearchInput.tsx`

#### Description

Add keyboard support for the Escape key: when pressed, clear the input if it has content, or blur the input if it's empty.

#### Implementation Steps

1. Add handleKeyDown callback function
2. Check for Escape key
3. If input has value: call handleClear
4. If input is empty: blur the input
5. Prevent default behavior on Escape

#### Code Addition

```typescript
// Add to SearchInput component

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

// ... add to input element:
<input
  // ... existing props
  onKeyDown={handleKeyDown}
  // ...
/>
```

#### Verification Steps

- [ ] Press Escape with text: input clears
- [ ] Press Escape when empty: input loses focus
- [ ] Default Escape behavior prevented (doesn't close modals unintentionally)
- [ ] Keyboard navigation works with Tab key

#### Acceptance Criteria

- [x] Escape key clears input or blurs as appropriate
- [x] Keyboard accessible for power users
- [x] No interference with other keyboard shortcuts

---

### Task 2.3.6: Export SearchInput from Components Barrel

**Estimated Effort:** 0.25 story points
**File:** `src/components/ItemManager/components/index.ts`

#### Description

Add the SearchInput component and its props type to the barrel export file.

#### Implementation Steps

1. Open `src/components/ItemManager/components/index.ts`
2. Add export statements for SearchInput and SearchInputProps

#### Code Change

```typescript
// Add to existing exports in components/index.ts
export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';
```

#### Verification Steps

- [ ] Export added to `src/components/ItemManager/components/index.ts`
- [ ] Can import from barrel: `import { SearchInput } from '../components'`
- [ ] Can import type: `import type { SearchInputProps } from '../components'`
- [ ] TypeScript compiles without errors

#### Acceptance Criteria

- [x] SearchInput exported from components barrel
- [x] SearchInputProps type exported for external use

---

### Task 2.3.7: Integrate SearchInput into ItemToolbar

**Estimated Effort:** 0.5 story points
**File:** `src/components/ItemManager/components/ItemToolbar.tsx`

#### Description

Replace the SearchPlaceholder component in ItemToolbar with the actual SearchInput component.

#### Implementation Steps

1. Add import for SearchInput at top of file
2. Locate the SearchPlaceholder usage in the render
3. Replace with SearchInput component
4. Pass required props: value, onChange, placeholder, disabled
5. Apply className from classNames.searchContainer
6. Remove or comment out SearchPlaceholder function (keep for reference temporarily)

#### Code Changes

```typescript
// At top of ItemToolbar.tsx:
import { SearchInput } from './SearchInput';

// Replace SearchPlaceholder usage with:
{enableSearch && (
  <div className={cn("flex-1 max-w-md", classNames?.searchContainer)}>
    {renderSearch ? (
      renderSearch()
    ) : (
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={labels?.searchPlaceholder ?? 'Search items...'}
        disabled={false}
        className="w-full"
      />
    )}
  </div>
)}

// Optionally remove or mark SearchPlaceholder as deprecated:
// /** @deprecated Use SearchInput instead */
// function SearchPlaceholder(...) { ... }
```

#### Verification Steps

- [ ] SearchInput component imported correctly
- [ ] SearchPlaceholder replaced with SearchInput
- [ ] Search input renders in toolbar
- [ ] Typing in search updates the value
- [ ] Debounce delay observed (300ms before onSearchChange fires)
- [ ] Clear button works
- [ ] Escape key works
- [ ] Custom placeholder text supported via labels prop
- [ ] renderSearch override still works if provided

#### Acceptance Criteria

- [x] SearchInput integrated into ItemToolbar
- [x] All SearchInput features work within toolbar context
- [x] Render override (renderSearch) still functional
- [x] Labels customization works

---

### Task 2.3.8: Add SearchInputProps to Types File (if needed)

**Estimated Effort:** 0.25 story points
**File:** `src/components/ItemManager/ItemManager.types.ts`

#### Description

Ensure SearchInputProps is either exported from the types file or properly exported from the component. This task may be skipped if the props are already accessible.

#### Implementation Steps

1. Check if SearchInputProps needs to be re-exported from ItemManager.types.ts
2. If separate type file preferred, add type definition
3. Otherwise, verify export from SearchInput.tsx is sufficient

#### Code Change (if needed)

```typescript
// In ItemManager.types.ts (if re-exporting)
export type { SearchInputProps } from './components/SearchInput';
```

#### Verification Steps

- [ ] SearchInputProps type accessible from appropriate location
- [ ] External consumers can import the type
- [ ] TypeScript compiles without errors

#### Acceptance Criteria

- [x] Type is accessible for external component customization
- [x] Consistent with project type export patterns

---

### Task 2.3.9: Create Manual Test Page for SearchInput

**Estimated Effort:** 0.5 story points
**File:** `src/app/test/item-manager/page.tsx` (modify existing) or create test section

#### Description

Add test cases for SearchInput to the ItemManager test harness page to verify all functionality.

#### Implementation Steps

1. Locate or create test page for ItemManager
2. Add standalone SearchInput test section
3. Create test cases:
   - Basic search input
   - With custom placeholder
   - Disabled state
   - With autoFocus
4. Add console logging to observe debounce behavior
5. Include visual verification notes

#### Test Cases

```typescript
// Test section for SearchInput
<section className="mb-8">
  <h2 className="text-xl font-semibold mb-4">Search Input Tests</h2>

  {/* Test 1: Basic usage */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Basic Search</h3>
    <SearchInput
      value={searchQuery}
      onChange={(query) => {
        console.log('Search query changed:', query);
        setSearchQuery(query);
      }}
    />
  </div>

  {/* Test 2: Custom placeholder */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Custom Placeholder</h3>
    <SearchInput
      value=""
      onChange={() => {}}
      placeholder="Find your items..."
    />
  </div>

  {/* Test 3: Disabled */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Disabled State</h3>
    <SearchInput
      value="Cannot edit"
      onChange={() => {}}
      disabled
    />
  </div>

  {/* Test 4: Debounce verification */}
  <div className="mb-4">
    <h3 className="text-sm font-medium mb-2">Debounce Test (watch console)</h3>
    <SearchInput
      value={debounceTest}
      onChange={(query) => {
        console.log(`[${new Date().toISOString()}] Debounced value:`, query);
        setDebounceTest(query);
      }}
      debounceMs={500}
    />
    <p className="text-xs text-gray-500 mt-1">Type quickly - onChange should fire 500ms after last keystroke</p>
  </div>
</section>
```

#### Verification Steps

- [ ] Test page renders SearchInput component
- [ ] Basic search input works correctly
- [ ] Custom placeholder displays
- [ ] Disabled state prevents input
- [ ] Console shows debounced values with correct timing
- [ ] Clear button works in all test cases
- [ ] Escape key works as expected

#### Acceptance Criteria

- [x] Test page provides visual verification
- [x] Console logging helps verify debounce timing
- [x] All major features testable in isolation

---

### Task 2.3.10: Write Unit Tests for useDebounce Hook

**Estimated Effort:** 0.75 story points
**File:** `src/components/ItemManager/hooks/__tests__/useDebounce.test.ts`

#### Description

Create unit tests for the useDebounce hook to verify all behaviors.

#### Test Cases

| Test Case | Description |
|-----------|-------------|
| Returns initial value immediately | Hook returns value on first render |
| Debounces value changes | Value doesn't update immediately on change |
| Updates after delay | Value updates after specified delay |
| Cancels on unmount | Pending update cancelled when component unmounts |
| Handles rapid changes | Only latest value emitted after delay |
| Zero delay bypasses debounce | Immediate update when delay is 0 |

#### Implementation Steps

1. Create test file at `src/components/ItemManager/hooks/__tests__/useDebounce.test.ts`
2. Import testing utilities and useDebounce hook
3. Implement test cases using Jest and React Testing Library
4. Use fake timers for timing-related tests

#### Code Template

```typescript
/**
 * Tests for useDebounce hook
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('does not update value immediately on change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('only emits latest value after rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => { jest.advanceTimersByTime(100); });

    rerender({ value: 'abc' });
    act(() => { jest.advanceTimersByTime(100); });

    rerender({ value: 'abcd' });
    act(() => { jest.advanceTimersByTime(300); });

    expect(result.current).toBe('abcd');
  });

  it('updates immediately when delay is 0', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('updated');
  });

  it('cancels pending update on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    // Should not throw or cause memory leaks
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Value should still be 'initial' (last rendered value)
    expect(result.current).toBe('initial');
  });
});
```

#### Verification Steps

- [ ] Test file created at correct location
- [ ] All test cases pass: `npm test -- useDebounce`
- [ ] Fake timers used correctly for timing tests
- [ ] Edge cases covered (zero delay, rapid changes, unmount)

#### Acceptance Criteria

- [x] All specified test cases implemented
- [x] Tests pass consistently
- [x] Good coverage of edge cases

---

### Task 2.3.11: Write Unit Tests for SearchInput Component

**Estimated Effort:** 1 story point
**File:** `src/components/ItemManager/components/__tests__/SearchInput.test.tsx`

#### Description

Create unit tests for the SearchInput component to verify rendering, interactions, and accessibility.

#### Test Cases

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

#### Implementation Steps

1. Create test file at `src/components/ItemManager/components/__tests__/SearchInput.test.tsx`
2. Import testing utilities, SearchInput, and required mocks
3. Implement test cases using React Testing Library
4. Use fake timers for debounce tests
5. Test accessibility attributes

#### Code Template

```typescript
/**
 * Tests for SearchInput component
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Find items" />);
    expect(screen.getByPlaceholderText('Find items')).toBeInTheDocument();
  });

  it('shows search icon', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    // Search icon should be present (aria-hidden)
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('updates local value immediately on typing', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchInput value="" onChange={() => {}} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');

    expect(input).toHaveValue('test');
  });

  it('debounces onChange callback', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SearchInput value="" onChange={onChange} debounceMs={300} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');

    // onChange should not be called yet
    expect(onChange).not.toHaveBeenCalled();

    // Advance timers past debounce delay
    jest.advanceTimersByTime(300);

    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when input has value', () => {
    render(<SearchInput value="test" onChange={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('hides clear button when input is empty', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('clears input immediately when clear button clicked', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    // Should call onChange immediately with empty string
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('clears input on Escape key', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');
    await user.keyboard('{Escape}');

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('blurs input on Escape when empty', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SearchInput value="" onChange={() => {}} />);

    const input = screen.getByRole('searchbox');
    input.focus();
    expect(input).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(input).not.toHaveFocus();
  });

  it('disables input when disabled prop is true', () => {
    render(<SearchInput value="" onChange={() => {}} disabled />);
    expect(screen.getByRole('searchbox')).toBeDisabled();
  });

  it('hides clear button when disabled', () => {
    render(<SearchInput value="test" onChange={() => {}} disabled />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search" />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search');
  });
});
```

#### Verification Steps

- [ ] Test file created at correct location
- [ ] All test cases pass: `npm test -- SearchInput`
- [ ] User interactions tested with userEvent
- [ ] Accessibility attributes verified
- [ ] Debounce behavior tested with fake timers

#### Acceptance Criteria

- [x] All specified test cases implemented
- [x] Tests pass consistently
- [x] Accessibility tested
- [x] Debounce behavior verified

---

## Summary

### Total Tasks: 11

| Task | Description | Effort |
|------|-------------|--------|
| 2.3.1 | Create useDebounce Hook | 0.5 |
| 2.3.2 | Export useDebounce from Barrel | 0.25 |
| 2.3.3 | Create SearchInput Base Structure | 1.0 |
| 2.3.4 | Add Clear Button | 0.5 |
| 2.3.5 | Add Keyboard Shortcuts | 0.5 |
| 2.3.6 | Export SearchInput from Barrel | 0.25 |
| 2.3.7 | Integrate into ItemToolbar | 0.5 |
| 2.3.8 | Add Type Exports | 0.25 |
| 2.3.9 | Create Manual Test Page | 0.5 |
| 2.3.10 | Write useDebounce Unit Tests | 0.75 |
| 2.3.11 | Write SearchInput Unit Tests | 1.0 |
| **Total** | | **6.0 story points** |

### Execution Order

1. Task 2.3.1 (useDebounce) - Foundation
2. Task 2.3.2 (Export hook) - Enable imports
3. Task 2.3.3 (SearchInput base) - Main component
4. Task 2.3.4 (Clear button) - Feature
5. Task 2.3.5 (Keyboard shortcuts) - Feature
6. Task 2.3.6 (Export component) - Enable imports
7. Task 2.3.7 (Integration) - Connect to toolbar
8. Task 2.3.8 (Types) - Finalize exports
9. Task 2.3.9 (Test page) - Manual verification
10. Task 2.3.10 (Hook tests) - Automated testing
11. Task 2.3.11 (Component tests) - Automated testing

---

## Acceptance Criteria Checklist

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
- [ ] Touch targets meet 44x44px minimum size (clear button with padding)
- [ ] Component accepts className overrides for customization

---

## References

- [REQ-064 Overview](/docs/REQ-064-implement-search-ui-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.3
- [ItemsManagement](/src/components/ItemsManagement.tsx) - Search input pattern reference
- [ItemToolbar Overview](/docs/REQ-063-build-itemtoolbar-component-overview.md) - Container component
- [useItemSearch Overview](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Search hook documentation
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
