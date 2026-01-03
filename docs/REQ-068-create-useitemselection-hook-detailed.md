# REQ-068: Create useItemSelection Hook - Detailed Task Breakdown

**Document Created:** 2026-01-03 12:45:00
**Last Modified:** 2026-01-03 12:45:00
**Request Reference:** REQ-068 (Multi-Item Selection and Bulk Action Support)
**Overview Document:** `/docs/REQ-068-create-useitemselection-hook-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.1

---

## Executive Summary

This document provides granular, actionable task specifications for implementing the `useItemSelection` hook. Each task is designed to be completed within approximately 1 story point (a few hours of focused work) and includes specific verification steps.

### Scope

- Create the `useItemSelection` hook with full selection management capabilities
- Define all TypeScript types and interfaces
- Implement reducer-based state management
- Add barrel exports for the hook
- Create comprehensive unit tests

### Prerequisites

- Phase 1 (Task 1.1 - Directory Structure & Types) must be complete
- `src/components/ItemManager/hooks/` directory must exist
- `src/components/ItemManager/ItemManager.types.ts` must exist

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/hooks/useItemSelection.ts` | Main hook implementation |
| `src/components/ItemManager/hooks/__tests__/useItemSelection.test.ts` | Unit tests |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/hooks/index.ts` | Add barrel export for useItemSelection |

---

## Task Breakdown

### Task 3.1.1: Create Selection Types and Interfaces

**Estimated Effort:** ~1 hour
**Dependencies:** Phase 1 complete (hooks directory exists)

#### Description

Define all TypeScript types and interfaces required for the useItemSelection hook at the top of the hook file. These types establish the contract for the hook's state, actions, options, and return value.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

Create the following types:

1. **SelectionState** - Internal state structure:
   - `selectedIds: Set<string>` - Set of selected item IDs for O(1) lookup
   - `isSelectionMode: boolean` - Whether selection mode is active

2. **SelectionAction** - Discriminated union of all possible actions:
   - `SELECT_ITEM` - Select single item by ID
   - `DESELECT_ITEM` - Deselect single item by ID
   - `TOGGLE_ITEM` - Toggle selection state of single item
   - `SELECT_ALL` - Replace selection with provided IDs
   - `SELECT_MULTIPLE` - Add multiple items to selection
   - `DESELECT_MULTIPLE` - Remove multiple items from selection
   - `CLEAR_SELECTION` - Clear all selections
   - `ENTER_SELECTION_MODE` - Activate selection mode
   - `EXIT_SELECTION_MODE` - Deactivate and clear selection
   - `TOGGLE_SELECTION_MODE` - Toggle selection mode on/off
   - `RESET` - Reset to initial state

3. **UseItemSelectionOptions** - Hook configuration:
   - `maxSelection?: number` - Maximum items (default: 100)
   - `onSelectionChange?: (selectedIds: string[]) => void` - Change callback
   - `initialSelection?: string[]` - Pre-selected IDs
   - `debug?: boolean` - Enable debug logging

4. **UseItemSelectionReturn** - Hook return type with all state and methods

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] All types are exported from the file
- [ ] `SelectionAction` covers all action types from overview
- [ ] `UseItemSelectionReturn` includes all methods from overview spec
- [ ] JSDoc comments are present on all exported interfaces

#### Code Template

```typescript
'use client';

/**
 * Selection state managed by the hook.
 */
interface SelectionState {
  /** Set of selected item IDs */
  selectedIds: Set<string>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
}

/**
 * Actions for selection state management.
 */
type SelectionAction =
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ITEM'; payload: string }
  | { type: 'TOGGLE_ITEM'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'SELECT_MULTIPLE'; payload: string[] }
  | { type: 'DESELECT_MULTIPLE'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ENTER_SELECTION_MODE' }
  | { type: 'EXIT_SELECTION_MODE' }
  | { type: 'TOGGLE_SELECTION_MODE' }
  | { type: 'RESET' };

/**
 * Options for useItemSelection hook.
 */
export interface UseItemSelectionOptions {
  /** Maximum items that can be selected (default: 100) */
  maxSelection?: number;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Initial selected item IDs */
  initialSelection?: string[];
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Return type for useItemSelection hook.
 */
export interface UseItemSelectionReturn {
  // State
  selectedIds: Set<string>;
  selectedCount: number;
  isSelectionMode: boolean;

  // Computed values
  hasSelection: boolean;
  isMaxSelected: boolean;
  canSelectMore: boolean;

  // Item-level actions
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  isSelected: (id: string) => boolean;

  // Bulk actions
  selectAll: (ids: string[]) => void;
  selectMultiple: (ids: string[]) => void;
  deselectMultiple: (ids: string[]) => void;
  clearSelection: () => void;

  // Mode control
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleSelectionMode: () => void;

  // Utilities
  getSelectedItems: <T extends { id: string }>(items: T[]) => T[];
  getSelectedArray: () => string[];
}
```

---

### Task 3.1.2: Implement Selection Reducer

**Estimated Effort:** ~2 hours
**Dependencies:** Task 3.1.1 complete

#### Description

Implement the `selectionReducer` function and `createInitialState` factory function. The reducer handles all state transitions for selection operations, enforcing the maxSelection constraint and auto-managing selection mode based on selection state.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

Key behaviors to implement:

1. **SELECT_ITEM**:
   - No-op if already selected
   - No-op if at maxSelection limit
   - Add to Set and auto-enter selection mode

2. **DESELECT_ITEM**:
   - No-op if not selected
   - Remove from Set
   - Auto-exit selection mode when last item deselected

3. **TOGGLE_ITEM**:
   - If selected, deselect (respect auto-exit behavior)
   - If not selected, select (respect maxSelection limit)

4. **SELECT_ALL**:
   - Replace entire selection with provided IDs
   - Truncate to maxSelection limit
   - Enter selection mode if any items selected

5. **SELECT_MULTIPLE**:
   - Add items to existing selection
   - Stop when maxSelection reached

6. **DESELECT_MULTIPLE**:
   - Remove specified items from selection
   - Auto-exit mode if selection becomes empty

7. **CLEAR_SELECTION**:
   - Empty the selection Set
   - Exit selection mode

8. **ENTER_SELECTION_MODE**:
   - Set isSelectionMode to true
   - Preserve existing selection

9. **EXIT_SELECTION_MODE**:
   - Clear selection and set mode to false

10. **TOGGLE_SELECTION_MODE**:
    - If active, exit (clear selection)
    - If inactive, enter (preserve selection)

11. **RESET**:
    - Return to initial empty state

#### Verification Steps

- [ ] Reducer is a pure function (no side effects)
- [ ] Each action type returns a new state object (immutability)
- [ ] SELECT_ITEM respects maxSelection limit
- [ ] Auto-enter selection mode works on first selection
- [ ] Auto-exit selection mode works on last deselection
- [ ] SELECT_ALL truncates to maxSelection
- [ ] Unknown action type returns current state unchanged
- [ ] Set operations create new Set instances (immutability)

#### Code Template

```typescript
/**
 * Create initial selection state.
 */
function createInitialState(initialIds: string[] = []): SelectionState {
  return {
    selectedIds: new Set(initialIds),
    isSelectionMode: initialIds.length > 0,
  };
}

/**
 * Selection state reducer.
 * Handles all selection-related state transitions.
 */
function selectionReducer(
  state: SelectionState,
  action: SelectionAction,
  maxSelection: number = 100
): SelectionState {
  switch (action.type) {
    case 'SELECT_ITEM': {
      if (state.selectedIds.has(action.payload)) return state;
      if (state.selectedIds.size >= maxSelection) return state;

      const newSelectedIds = new Set(state.selectedIds);
      newSelectedIds.add(action.payload);

      return {
        selectedIds: newSelectedIds,
        isSelectionMode: true,
      };
    }

    case 'DESELECT_ITEM': {
      if (!state.selectedIds.has(action.payload)) return state;

      const newSelectedIds = new Set(state.selectedIds);
      newSelectedIds.delete(action.payload);

      return {
        selectedIds: newSelectedIds,
        isSelectionMode: newSelectedIds.size > 0,
      };
    }

    // ... implement remaining cases

    default:
      return state;
  }
}
```

---

### Task 3.1.3: Implement useItemSelection Hook Core

**Estimated Effort:** ~2 hours
**Dependencies:** Task 3.1.2 complete

#### Description

Implement the main `useItemSelection` hook function that composes the reducer, memoizes computed values, and creates stable callback references.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

Implementation requirements:

1. **Hook setup**:
   - Destructure options with defaults
   - Create debug logger with useCallback
   - Wrap reducer to inject maxSelection
   - Initialize state with useReducer

2. **Change notification**:
   - Use useEffect to notify parent via onSelectionChange
   - Track previous selection to detect actual changes
   - Use useRef to avoid infinite loops

3. **Computed values**:
   - `selectedCount`: state.selectedIds.size
   - `hasSelection`: selectedCount > 0
   - `isMaxSelected`: selectedCount >= maxSelection
   - `canSelectMore`: selectedCount < maxSelection

4. **Memoized callbacks**:
   - All action methods wrapped with useCallback
   - Include debug logging if enabled
   - Stable references for consumer components

5. **Return object**:
   - Wrap in useMemo for stable reference
   - Include all state, computed values, and methods

#### Verification Steps

- [ ] Hook compiles without TypeScript errors
- [ ] Hook is marked 'use client'
- [ ] All callbacks have stable references (useCallback)
- [ ] Return object has stable reference (useMemo)
- [ ] onSelectionChange only fires on actual changes
- [ ] Debug logging works when enabled
- [ ] Default options work correctly

#### Code Template

```typescript
import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';

export function useItemSelection(
  options: UseItemSelectionOptions = {}
): UseItemSelectionReturn {
  const {
    maxSelection = 100,
    onSelectionChange,
    initialSelection = [],
    debug = false,
  } = options;

  // Debug logger
  const log = useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log('[useItemSelection]', ...args);
      }
    },
    [debug]
  );

  // Wrapper reducer to inject maxSelection
  const reducerWithMax = useCallback(
    (state: SelectionState, action: SelectionAction) => {
      return selectionReducer(state, action, maxSelection);
    },
    [maxSelection]
  );

  const [state, dispatch] = useReducer(
    reducerWithMax,
    initialSelection,
    (initial) => createInitialState(initial)
  );

  // Track previous selection for change detection
  const prevSelectionRef = useRef<Set<string>>(state.selectedIds);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange && state.selectedIds !== prevSelectionRef.current) {
      log('Selection changed:', Array.from(state.selectedIds));
      onSelectionChange(Array.from(state.selectedIds));
      prevSelectionRef.current = state.selectedIds;
    }
  }, [state.selectedIds, onSelectionChange, log]);

  // ... computed values and callbacks

  return useMemo(() => ({
    // ... all properties
  }), [/* dependencies */]);
}

export default useItemSelection;
```

---

### Task 3.1.4: Implement Item-Level Action Methods

**Estimated Effort:** ~1 hour
**Dependencies:** Task 3.1.3 complete

#### Description

Implement all item-level action methods: `selectItem`, `deselectItem`, `toggleItem`, and `isSelected`. These are the primary methods consumers will use for individual item selection operations.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

Methods to implement:

1. **selectItem(id: string)**:
   - Dispatch SELECT_ITEM action
   - Log if debug enabled

2. **deselectItem(id: string)**:
   - Dispatch DESELECT_ITEM action
   - Log if debug enabled

3. **toggleItem(id: string)**:
   - Dispatch TOGGLE_ITEM action
   - Log if debug enabled

4. **isSelected(id: string)**:
   - Return boolean from state.selectedIds.has(id)
   - Must update when selectedIds changes

#### Verification Steps

- [ ] selectItem dispatches correct action
- [ ] deselectItem dispatches correct action
- [ ] toggleItem dispatches correct action
- [ ] isSelected returns correct boolean
- [ ] All methods are memoized with useCallback
- [ ] isSelected dependency includes state.selectedIds

#### Code Template

```typescript
// Item-level actions
const selectItem = useCallback(
  (id: string) => {
    log('selectItem:', id);
    dispatch({ type: 'SELECT_ITEM', payload: id });
  },
  [log]
);

const deselectItem = useCallback(
  (id: string) => {
    log('deselectItem:', id);
    dispatch({ type: 'DESELECT_ITEM', payload: id });
  },
  [log]
);

const toggleItem = useCallback(
  (id: string) => {
    log('toggleItem:', id);
    dispatch({ type: 'TOGGLE_ITEM', payload: id });
  },
  [log]
);

const isSelected = useCallback(
  (id: string) => state.selectedIds.has(id),
  [state.selectedIds]
);
```

---

### Task 3.1.5: Implement Bulk Action Methods

**Estimated Effort:** ~1 hour
**Dependencies:** Task 3.1.3 complete

#### Description

Implement bulk action methods: `selectAll`, `selectMultiple`, `deselectMultiple`, and `clearSelection`. These enable efficient operations on multiple items at once.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

Methods to implement:

1. **selectAll(ids: string[])**:
   - Dispatch SELECT_ALL with provided IDs
   - Caller provides filtered item IDs
   - Log count if debug enabled

2. **selectMultiple(ids: string[])**:
   - Dispatch SELECT_MULTIPLE action
   - Adds to existing selection
   - Log count if debug enabled

3. **deselectMultiple(ids: string[])**:
   - Dispatch DESELECT_MULTIPLE action
   - Removes from existing selection
   - Log count if debug enabled

4. **clearSelection()**:
   - Dispatch CLEAR_SELECTION action
   - Log if debug enabled

#### Verification Steps

- [ ] selectAll dispatches with array payload
- [ ] selectMultiple dispatches with array payload
- [ ] deselectMultiple dispatches with array payload
- [ ] clearSelection dispatches correct action
- [ ] All methods are memoized with useCallback
- [ ] Debug logs show item counts

#### Code Template

```typescript
// Bulk actions
const selectAll = useCallback(
  (ids: string[]) => {
    log('selectAll:', ids.length, 'items');
    dispatch({ type: 'SELECT_ALL', payload: ids });
  },
  [log]
);

const selectMultiple = useCallback(
  (ids: string[]) => {
    log('selectMultiple:', ids.length, 'items');
    dispatch({ type: 'SELECT_MULTIPLE', payload: ids });
  },
  [log]
);

const deselectMultiple = useCallback(
  (ids: string[]) => {
    log('deselectMultiple:', ids.length, 'items');
    dispatch({ type: 'DESELECT_MULTIPLE', payload: ids });
  },
  [log]
);

const clearSelection = useCallback(() => {
  log('clearSelection');
  dispatch({ type: 'CLEAR_SELECTION' });
}, [log]);
```

---

### Task 3.1.6: Implement Mode Control and Utility Methods

**Estimated Effort:** ~1 hour
**Dependencies:** Task 3.1.3 complete

#### Description

Implement selection mode control methods and utility functions: `enterSelectionMode`, `exitSelectionMode`, `toggleSelectionMode`, `getSelectedItems`, and `getSelectedArray`.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

Methods to implement:

1. **enterSelectionMode()**:
   - Dispatch ENTER_SELECTION_MODE
   - Enables selection UI without selecting items

2. **exitSelectionMode()**:
   - Dispatch EXIT_SELECTION_MODE
   - Clears selection and disables mode

3. **toggleSelectionMode()**:
   - Dispatch TOGGLE_SELECTION_MODE
   - If active, exits (clears); if inactive, enters

4. **getSelectedItems<T extends { id: string }>(items: T[]): T[]**:
   - Filter provided items by selectedIds
   - Generic to work with any item type with id

5. **getSelectedArray(): string[]**:
   - Convert selectedIds Set to array
   - Convenience for external consumption

#### Verification Steps

- [ ] enterSelectionMode sets mode to true
- [ ] exitSelectionMode clears selection and mode
- [ ] toggleSelectionMode correctly toggles
- [ ] getSelectedItems filters correctly
- [ ] getSelectedItems preserves item type
- [ ] getSelectedArray returns string array
- [ ] All methods are memoized appropriately

#### Code Template

```typescript
// Mode control
const enterSelectionMode = useCallback(() => {
  log('enterSelectionMode');
  dispatch({ type: 'ENTER_SELECTION_MODE' });
}, [log]);

const exitSelectionMode = useCallback(() => {
  log('exitSelectionMode');
  dispatch({ type: 'EXIT_SELECTION_MODE' });
}, [log]);

const toggleSelectionMode = useCallback(() => {
  log('toggleSelectionMode');
  dispatch({ type: 'TOGGLE_SELECTION_MODE' });
}, [log]);

// Utilities
const getSelectedItems = useCallback(
  <T extends { id: string }>(items: T[]): T[] => {
    return items.filter((item) => state.selectedIds.has(item.id));
  },
  [state.selectedIds]
);

const getSelectedArray = useCallback(
  () => Array.from(state.selectedIds),
  [state.selectedIds]
);
```

---

### Task 3.1.7: Update Barrel Exports

**Estimated Effort:** ~15 minutes
**Dependencies:** Task 3.1.6 complete

#### Description

Add the useItemSelection hook and its types to the hooks barrel export file for clean imports.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/index.ts`

Add exports:

```typescript
export { useItemSelection } from './useItemSelection';
export type {
  UseItemSelectionOptions,
  UseItemSelectionReturn,
} from './useItemSelection';
```

#### Verification Steps

- [ ] Hook can be imported from '@/components/ItemManager/hooks'
- [ ] Types can be imported from '@/components/ItemManager/hooks'
- [ ] No circular dependency issues
- [ ] TypeScript compiles without errors

---

### Task 3.1.8: Create Unit Test File Structure

**Estimated Effort:** ~30 minutes
**Dependencies:** Task 3.1.7 complete

#### Description

Create the test file with proper setup, mock utilities, and test suite structure for useItemSelection.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/__tests__/useItemSelection.test.ts`

Setup requirements:

1. Import testing utilities (@testing-library/react-hooks or equivalent)
2. Import the hook and types
3. Create mock items with IDs for testing
4. Structure test suites by functionality:
   - Initial state tests
   - Item-level action tests
   - Bulk action tests
   - Mode control tests
   - Constraint tests (maxSelection)
   - Callback tests (onSelectionChange)

#### Verification Steps

- [ ] Test file is in correct directory
- [ ] Imports work correctly
- [ ] Test structure matches functionality groupings
- [ ] Mock data is reusable across tests

#### Code Template

```typescript
import { renderHook, act } from '@testing-library/react';
import { useItemSelection } from '../useItemSelection';
import type { UseItemSelectionOptions } from '../useItemSelection';

// Mock items for testing
const mockItems = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
  { id: '3', title: 'Item 3' },
  { id: '4', title: 'Item 4' },
  { id: '5', title: 'Item 5' },
];

const mockIds = mockItems.map((item) => item.id);

describe('useItemSelection', () => {
  describe('Initial State', () => {
    // Tests for initial state
  });

  describe('Item-Level Actions', () => {
    // Tests for selectItem, deselectItem, toggleItem, isSelected
  });

  describe('Bulk Actions', () => {
    // Tests for selectAll, selectMultiple, deselectMultiple, clearSelection
  });

  describe('Mode Control', () => {
    // Tests for enterSelectionMode, exitSelectionMode, toggleSelectionMode
  });

  describe('Constraints', () => {
    // Tests for maxSelection limit
  });

  describe('Callbacks', () => {
    // Tests for onSelectionChange
  });

  describe('Utilities', () => {
    // Tests for getSelectedItems, getSelectedArray
  });
});
```

---

### Task 3.1.9: Implement Initial State and Basic Tests

**Estimated Effort:** ~1 hour
**Dependencies:** Task 3.1.8 complete

#### Description

Implement tests for initial state behavior and basic functionality verification.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/__tests__/useItemSelection.test.ts`

Test cases:

1. **Default initial state**:
   - Empty selection (size 0)
   - Selection mode off
   - hasSelection is false
   - canSelectMore is true

2. **Initial selection via options**:
   - Provided IDs are pre-selected
   - Selection mode is on
   - hasSelection is true
   - selectedCount matches

3. **Custom maxSelection**:
   - isMaxSelected reflects custom limit
   - canSelectMore reflects custom limit

4. **Debug mode**:
   - Console logs appear when enabled
   - No logs when disabled

#### Verification Steps

- [ ] All initial state tests pass
- [ ] Tests use renderHook correctly
- [ ] Tests verify all computed values
- [ ] Tests are isolated (no shared state)

#### Code Template

```typescript
describe('Initial State', () => {
  it('should have empty selection by default', () => {
    const { result } = renderHook(() => useItemSelection());

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelectionMode).toBe(false);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canSelectMore).toBe(true);
    expect(result.current.isMaxSelected).toBe(false);
  });

  it('should respect initialSelection option', () => {
    const { result } = renderHook(() =>
      useItemSelection({ initialSelection: ['1', '2'] })
    );

    expect(result.current.selectedIds.size).toBe(2);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.isSelectionMode).toBe(true);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.isSelected('1')).toBe(true);
    expect(result.current.isSelected('2')).toBe(true);
    expect(result.current.isSelected('3')).toBe(false);
  });

  it('should use custom maxSelection', () => {
    const { result } = renderHook(() =>
      useItemSelection({ maxSelection: 3, initialSelection: ['1', '2', '3'] })
    );

    expect(result.current.isMaxSelected).toBe(true);
    expect(result.current.canSelectMore).toBe(false);
  });
});
```

---

### Task 3.1.10: Implement Item-Level Action Tests

**Estimated Effort:** ~1.5 hours
**Dependencies:** Task 3.1.9 complete

#### Description

Implement comprehensive tests for item-level selection actions.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/__tests__/useItemSelection.test.ts`

Test cases:

1. **selectItem**:
   - Adds item to selection
   - Auto-enters selection mode
   - No-op for already selected items
   - Respects maxSelection limit

2. **deselectItem**:
   - Removes item from selection
   - Auto-exits mode when empty
   - No-op for unselected items

3. **toggleItem**:
   - Selects unselected items
   - Deselects selected items
   - Respects maxSelection on select

4. **isSelected**:
   - Returns true for selected items
   - Returns false for unselected items
   - Updates when selection changes

#### Verification Steps

- [ ] All item-level action tests pass
- [ ] Tests use act() for state updates
- [ ] Edge cases are covered
- [ ] Auto-mode behavior is verified

#### Code Template

```typescript
describe('Item-Level Actions', () => {
  describe('selectItem', () => {
    it('should add item to selection', () => {
      const { result } = renderHook(() => useItemSelection());

      act(() => {
        result.current.selectItem('1');
      });

      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('should auto-enter selection mode', () => {
      const { result } = renderHook(() => useItemSelection());

      expect(result.current.isSelectionMode).toBe(false);

      act(() => {
        result.current.selectItem('1');
      });

      expect(result.current.isSelectionMode).toBe(true);
    });

    it('should not exceed maxSelection', () => {
      const { result } = renderHook(() =>
        useItemSelection({ maxSelection: 2 })
      );

      act(() => {
        result.current.selectItem('1');
        result.current.selectItem('2');
        result.current.selectItem('3');
      });

      expect(result.current.selectedCount).toBe(2);
      expect(result.current.isSelected('3')).toBe(false);
    });

    it('should ignore duplicate selections', () => {
      const { result } = renderHook(() => useItemSelection());

      act(() => {
        result.current.selectItem('1');
        result.current.selectItem('1');
      });

      expect(result.current.selectedCount).toBe(1);
    });
  });

  describe('deselectItem', () => {
    it('should remove item from selection', () => {
      const { result } = renderHook(() =>
        useItemSelection({ initialSelection: ['1', '2'] })
      );

      act(() => {
        result.current.deselectItem('1');
      });

      expect(result.current.isSelected('1')).toBe(false);
      expect(result.current.selectedCount).toBe(1);
    });

    it('should auto-exit selection mode when empty', () => {
      const { result } = renderHook(() =>
        useItemSelection({ initialSelection: ['1'] })
      );

      expect(result.current.isSelectionMode).toBe(true);

      act(() => {
        result.current.deselectItem('1');
      });

      expect(result.current.isSelectionMode).toBe(false);
    });
  });

  describe('toggleItem', () => {
    it('should select unselected items', () => {
      const { result } = renderHook(() => useItemSelection());

      act(() => {
        result.current.toggleItem('1');
      });

      expect(result.current.isSelected('1')).toBe(true);
    });

    it('should deselect selected items', () => {
      const { result } = renderHook(() =>
        useItemSelection({ initialSelection: ['1'] })
      );

      act(() => {
        result.current.toggleItem('1');
      });

      expect(result.current.isSelected('1')).toBe(false);
    });
  });
});
```

---

### Task 3.1.11: Implement Bulk Action and Constraint Tests

**Estimated Effort:** ~1.5 hours
**Dependencies:** Task 3.1.10 complete

#### Description

Implement tests for bulk actions and maxSelection constraint enforcement.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/__tests__/useItemSelection.test.ts`

Test cases:

1. **selectAll**:
   - Replaces entire selection
   - Respects maxSelection limit
   - Enters selection mode

2. **selectMultiple**:
   - Adds to existing selection
   - Stops at maxSelection limit

3. **deselectMultiple**:
   - Removes specified items
   - Handles items not in selection

4. **clearSelection**:
   - Empties selection
   - Exits selection mode

5. **Constraint enforcement**:
   - maxSelection is enforced across all operations
   - isMaxSelected and canSelectMore update correctly

#### Verification Steps

- [ ] All bulk action tests pass
- [ ] Constraint tests verify limit enforcement
- [ ] Edge cases handled (empty arrays, non-existent IDs)

#### Code Template

```typescript
describe('Bulk Actions', () => {
  describe('selectAll', () => {
    it('should replace current selection', () => {
      const { result } = renderHook(() =>
        useItemSelection({ initialSelection: ['1'] })
      );

      act(() => {
        result.current.selectAll(['2', '3']);
      });

      expect(result.current.isSelected('1')).toBe(false);
      expect(result.current.isSelected('2')).toBe(true);
      expect(result.current.isSelected('3')).toBe(true);
    });

    it('should respect maxSelection', () => {
      const { result } = renderHook(() =>
        useItemSelection({ maxSelection: 2 })
      );

      act(() => {
        result.current.selectAll(['1', '2', '3', '4']);
      });

      expect(result.current.selectedCount).toBe(2);
    });
  });

  describe('clearSelection', () => {
    it('should empty selection and exit mode', () => {
      const { result } = renderHook(() =>
        useItemSelection({ initialSelection: ['1', '2'] })
      );

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isSelectionMode).toBe(false);
    });
  });
});

describe('Constraints', () => {
  it('should enforce maxSelection across operations', () => {
    const { result } = renderHook(() =>
      useItemSelection({ maxSelection: 3 })
    );

    act(() => {
      result.current.selectMultiple(['1', '2']);
    });

    expect(result.current.canSelectMore).toBe(true);

    act(() => {
      result.current.selectItem('3');
    });

    expect(result.current.isMaxSelected).toBe(true);
    expect(result.current.canSelectMore).toBe(false);

    // Should not add more
    act(() => {
      result.current.selectItem('4');
    });

    expect(result.current.selectedCount).toBe(3);
  });
});
```

---

### Task 3.1.12: Implement Mode Control and Utility Tests

**Estimated Effort:** ~1 hour
**Dependencies:** Task 3.1.11 complete

#### Description

Implement tests for mode control methods, callback behavior, and utility functions.

#### Implementation Details

**File:** `src/components/ItemManager/hooks/__tests__/useItemSelection.test.ts`

Test cases:

1. **Mode control**:
   - enterSelectionMode activates mode
   - exitSelectionMode clears and deactivates
   - toggleSelectionMode toggles correctly

2. **Callbacks**:
   - onSelectionChange fires on changes
   - Callback receives array of selected IDs
   - Callback doesn't fire when selection unchanged

3. **Utilities**:
   - getSelectedItems filters correctly
   - getSelectedItems preserves item properties
   - getSelectedArray returns correct array

#### Verification Steps

- [ ] All mode control tests pass
- [ ] Callback tests verify correct behavior
- [ ] Utility tests verify filtering and conversion
- [ ] All tests are deterministic

#### Code Template

```typescript
describe('Mode Control', () => {
  describe('toggleSelectionMode', () => {
    it('should enter mode when off', () => {
      const { result } = renderHook(() => useItemSelection());

      act(() => {
        result.current.toggleSelectionMode();
      });

      expect(result.current.isSelectionMode).toBe(true);
    });

    it('should exit and clear when on', () => {
      const { result } = renderHook(() =>
        useItemSelection({ initialSelection: ['1', '2'] })
      );

      act(() => {
        result.current.toggleSelectionMode();
      });

      expect(result.current.isSelectionMode).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });
  });
});

describe('Callbacks', () => {
  it('should call onSelectionChange when selection changes', () => {
    const onSelectionChange = jest.fn();
    const { result } = renderHook(() =>
      useItemSelection({ onSelectionChange })
    );

    act(() => {
      result.current.selectItem('1');
    });

    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });
});

describe('Utilities', () => {
  it('getSelectedItems should filter items correctly', () => {
    const { result } = renderHook(() =>
      useItemSelection({ initialSelection: ['1', '3'] })
    );

    const items = [
      { id: '1', name: 'One' },
      { id: '2', name: 'Two' },
      { id: '3', name: 'Three' },
    ];

    const selected = result.current.getSelectedItems(items);

    expect(selected).toHaveLength(2);
    expect(selected[0].name).toBe('One');
    expect(selected[1].name).toBe('Three');
  });

  it('getSelectedArray should return array of IDs', () => {
    const { result } = renderHook(() =>
      useItemSelection({ initialSelection: ['1', '2'] })
    );

    const ids = result.current.getSelectedArray();

    expect(Array.isArray(ids)).toBe(true);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
  });
});
```

---

### Task 3.1.13: Final Integration Verification

**Estimated Effort:** ~30 minutes
**Dependencies:** All previous tasks complete

#### Description

Perform final verification that the hook integrates correctly with the ItemManager component ecosystem.

#### Implementation Details

Verification checklist:

1. **Import verification**:
   - Hook imports correctly from barrel export
   - Types import correctly

2. **TypeScript verification**:
   - Run `npm run type-check` or `npx tsc --noEmit`
   - No errors related to useItemSelection

3. **Test verification**:
   - Run hook tests: `npm test -- useItemSelection`
   - All tests pass

4. **Integration spot-check**:
   - Manually verify hook works in isolation
   - Check console for any warnings

#### Verification Steps

- [ ] `import { useItemSelection } from '@/components/ItemManager/hooks'` works
- [ ] `import type { UseItemSelectionOptions } from '@/components/ItemManager/hooks'` works
- [ ] TypeScript compilation succeeds
- [ ] All unit tests pass
- [ ] No console warnings or errors

---

## Acceptance Criteria Checklist

From REQ-068 requirements:

- [ ] Individual items can be toggled in and out of the selection independently
- [ ] A "select all" action adds all currently visible (filtered) items to the selection
- [ ] Selection can be cleared completely with a single action
- [ ] Selection mode can be explicitly toggled on or off
- [ ] Visual indication of selection is supported (via isSelected function)

From Technical Requirements:

- [ ] Hook follows established patterns from ItemCapture hooks
- [ ] Uses Set for O(1) selection lookups
- [ ] Memoization prevents unnecessary re-computations
- [ ] Debug mode provides useful console output
- [ ] TypeScript types are comprehensive and exported
- [ ] maxSelection constraint is enforced
- [ ] All unit tests pass

---

## Task Summary

| Task ID | Title | Est. Time | Dependencies |
|---------|-------|-----------|--------------|
| 3.1.1 | Create Selection Types and Interfaces | ~1 hour | Phase 1 |
| 3.1.2 | Implement Selection Reducer | ~2 hours | 3.1.1 |
| 3.1.3 | Implement useItemSelection Hook Core | ~2 hours | 3.1.2 |
| 3.1.4 | Implement Item-Level Action Methods | ~1 hour | 3.1.3 |
| 3.1.5 | Implement Bulk Action Methods | ~1 hour | 3.1.3 |
| 3.1.6 | Implement Mode Control and Utility Methods | ~1 hour | 3.1.3 |
| 3.1.7 | Update Barrel Exports | ~15 min | 3.1.6 |
| 3.1.8 | Create Unit Test File Structure | ~30 min | 3.1.7 |
| 3.1.9 | Implement Initial State and Basic Tests | ~1 hour | 3.1.8 |
| 3.1.10 | Implement Item-Level Action Tests | ~1.5 hours | 3.1.9 |
| 3.1.11 | Implement Bulk Action and Constraint Tests | ~1.5 hours | 3.1.10 |
| 3.1.12 | Implement Mode Control and Utility Tests | ~1 hour | 3.1.11 |
| 3.1.13 | Final Integration Verification | ~30 min | All |

**Total Estimated Time:** ~14 hours (approximately 2 days of focused work)

---

## References

- [REQ-068 Overview Document](/docs/REQ-068-create-useitemselection-hook-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.1
- [useItemCaptureState Pattern Reference](/src/components/ItemCapture/hooks/useItemCaptureState.ts)
- [REQ-068 in gen_requests.md](/docs/gen_requests.md)
