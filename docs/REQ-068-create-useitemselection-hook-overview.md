# REQ-068: Create useItemSelection Hook - Technical Implementation Overview

**Document Created:** 2026-01-03 10:30:00
**Last Modified:** 2026-01-03 10:30:00
**Request Reference:** REQ-068 (Multi-Item Selection and Bulk Action Support)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.1

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating the `useItemSelection` hook, the first task of Phase 3 in the ItemManager component implementation. This hook is the foundation for all multi-select functionality, enabling users to select multiple items for bulk operations.

### Scope

The `useItemSelection` hook will:
- Manage a selection Set of item IDs
- Provide select/deselect functionality for individual items
- Implement select-all functionality that respects current filters
- Provide clear selection functionality
- Manage selection mode toggle state

### Dependencies

- **Requires Phase 1 Completion:** This task depends on task 1.1 (Directory Structure & Types) being complete, as it needs the `ItemManager.types.ts` file with type definitions.
- **Parallel Work:** Can be developed in parallel with Phase 2 (Search, Filter & Sort) once Phase 1 is complete.
- **Downstream Dependencies:** Tasks 3.2-3.6 depend on this hook for selection functionality.

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Hook Pattern | useReducer for complex state, useState for simple | ItemCapture hooks |
| Memoization | useMemo for computed values, useCallback for functions | Established pattern |
| Utility | `cn()` from `src/lib/utils.ts` | Tailwind class merging |

### 2.2 Reference Patterns from Codebase

**Primary Pattern Reference:** `/src/components/ItemCapture/hooks/useItemCaptureState.ts`
- Uses discriminated union for action types
- Reducer-based state management
- Returns object with state + action methods
- Computed values via `useMemo`

**Selection Pattern from Implementation Plan:**
```typescript
// From ItemManagerState interface
interface ItemManagerState {
  // ...
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  // ...
}

// Selection actions from ItemManagerAction type
type ItemManagerAction =
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ITEM'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_SELECTION_MODE' };
```

### 2.3 Types from Implementation Plan

The following types and interfaces are relevant from the implementation plan:

```typescript
// ItemActions interface includes selection actions
export interface ItemActions {
  edit: () => void;
  delete: () => void;
  duplicate: () => void;
  manageAssets: () => void;
  select: () => void;
  deselect: () => void;
  isSelected: boolean;
}

// Config option for selection
export interface ItemManagerConfig {
  /** Enable multi-select and bulk operations (default: true) */
  enableBulkActions?: boolean;
  /** Maximum items that can be selected at once (default: 100) */
  maxBulkSelection?: number;
  // ...
}
```

---

## 3. Implementation Approach

### 3.1 Hook Architecture

The `useItemSelection` hook follows a standalone pattern that can be composed with `useItemManagerState` or used independently:

- Manages selection Set internally
- Accepts configuration for constraints (maxBulkSelection)
- Provides callback notifications for selection changes
- Returns computed values and action methods

```typescript
// Proposed hook signature
interface UseItemSelectionOptions {
  /** Maximum items that can be selected (default: 100) */
  maxSelection?: number;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Initial selected item IDs */
  initialSelection?: string[];
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

interface UseItemSelectionReturn {
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
}
```

### 3.2 State Management

The hook uses a reducer pattern for predictable state transitions:

```typescript
interface SelectionState {
  selectedIds: Set<string>;
  isSelectionMode: boolean;
}

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
```

### 3.3 Selection Logic

#### Individual Selection
```typescript
function selectItem(state: SelectionState, id: string, maxSelection: number): SelectionState {
  if (state.selectedIds.has(id)) return state;
  if (state.selectedIds.size >= maxSelection) return state;

  const newSelectedIds = new Set(state.selectedIds);
  newSelectedIds.add(id);

  return {
    ...state,
    selectedIds: newSelectedIds,
    // Auto-enter selection mode when first item selected
    isSelectionMode: true,
  };
}

function deselectItem(state: SelectionState, id: string): SelectionState {
  if (!state.selectedIds.has(id)) return state;

  const newSelectedIds = new Set(state.selectedIds);
  newSelectedIds.delete(id);

  return {
    ...state,
    selectedIds: newSelectedIds,
    // Auto-exit selection mode when last item deselected
    isSelectionMode: newSelectedIds.size > 0 ? state.isSelectionMode : false,
  };
}
```

#### Select All (Filtered Items)
```typescript
function selectAll(state: SelectionState, ids: string[], maxSelection: number): SelectionState {
  // Take up to maxSelection items
  const idsToSelect = ids.slice(0, maxSelection);

  return {
    ...state,
    selectedIds: new Set(idsToSelect),
    isSelectionMode: idsToSelect.length > 0,
  };
}
```

### 3.4 Memoization Strategy

```typescript
export function useItemSelection(options: UseItemSelectionOptions): UseItemSelectionReturn {
  const {
    maxSelection = 100,
    onSelectionChange,
    initialSelection = [],
    debug = false,
  } = options;

  const [state, dispatch] = useReducer(selectionReducer, {
    selectedIds: new Set(initialSelection),
    isSelectionMode: initialSelection.length > 0,
  });

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(Array.from(state.selectedIds));
  }, [state.selectedIds, onSelectionChange]);

  // Memoized computed values
  const selectedCount = state.selectedIds.size;
  const hasSelection = selectedCount > 0;
  const isMaxSelected = selectedCount >= maxSelection;
  const canSelectMore = selectedCount < maxSelection;

  // Memoized action creators
  const selectItem = useCallback((id: string) => {
    if (state.selectedIds.size < maxSelection) {
      dispatch({ type: 'SELECT_ITEM', payload: id });
    }
  }, [maxSelection, state.selectedIds.size]);

  // ... other memoized actions

  // Return stable object
  return useMemo(() => ({
    selectedIds: state.selectedIds,
    selectedCount,
    isSelectionMode: state.isSelectionMode,
    hasSelection,
    isMaxSelected,
    canSelectMore,
    selectItem,
    deselectItem,
    toggleItem,
    isSelected,
    selectAll,
    selectMultiple,
    deselectMultiple,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelectionMode,
    getSelectedItems,
  }), [/* dependencies */]);
}
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/hooks/useItemSelection.ts` | Main hook implementation |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/hooks/index.ts` | Add barrel export for useItemSelection |
| `src/components/ItemManager/ItemManager.types.ts` | Ensure selection-related types exist (may already exist from Phase 1) |

### 4.3 Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `useItemSelection` | `useItemSelection.ts` | Main hook function |
| `selectionReducer` | `useItemSelection.ts` | State reducer for selection actions |
| `createInitialState` | `useItemSelection.ts` | Factory for initial selection state |

---

## 5. Detailed Task Breakdown

### Task 3.1.1: Create Selection Types

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

**Types to Define:**

```typescript
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
```

### Task 3.1.2: Implement Selection Reducer

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

**Reducer Implementation:**

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
 * Handles all selection-related actions.
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

    case 'TOGGLE_ITEM': {
      const newSelectedIds = new Set(state.selectedIds);

      if (newSelectedIds.has(action.payload)) {
        newSelectedIds.delete(action.payload);
      } else if (newSelectedIds.size < maxSelection) {
        newSelectedIds.add(action.payload);
      } else {
        return state; // At max, can't add more
      }

      return {
        selectedIds: newSelectedIds,
        isSelectionMode: newSelectedIds.size > 0,
      };
    }

    case 'SELECT_ALL': {
      // Select up to maxSelection items
      const idsToSelect = action.payload.slice(0, maxSelection);
      return {
        selectedIds: new Set(idsToSelect),
        isSelectionMode: idsToSelect.length > 0,
      };
    }

    case 'SELECT_MULTIPLE': {
      const newSelectedIds = new Set(state.selectedIds);
      for (const id of action.payload) {
        if (newSelectedIds.size >= maxSelection) break;
        newSelectedIds.add(id);
      }
      return {
        selectedIds: newSelectedIds,
        isSelectionMode: newSelectedIds.size > 0,
      };
    }

    case 'DESELECT_MULTIPLE': {
      const newSelectedIds = new Set(state.selectedIds);
      for (const id of action.payload) {
        newSelectedIds.delete(id);
      }
      return {
        selectedIds: newSelectedIds,
        isSelectionMode: newSelectedIds.size > 0,
      };
    }

    case 'CLEAR_SELECTION':
      return {
        selectedIds: new Set(),
        isSelectionMode: false,
      };

    case 'ENTER_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: true,
      };

    case 'EXIT_SELECTION_MODE':
      return {
        selectedIds: new Set(),
        isSelectionMode: false,
      };

    case 'TOGGLE_SELECTION_MODE':
      if (state.isSelectionMode) {
        // Exiting mode clears selection
        return {
          selectedIds: new Set(),
          isSelectionMode: false,
        };
      }
      return {
        ...state,
        isSelectionMode: true,
      };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
```

### Task 3.1.3: Implement useItemSelection Hook

**File:** `src/components/ItemManager/hooks/useItemSelection.ts`

**Full Implementation:**

```typescript
/**
 * useItemSelection Hook
 *
 * Manages multi-item selection state for ItemManager.
 * Provides selection, deselection, select-all, and mode management.
 *
 * @module ItemManager/hooks/useItemSelection
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.1)
 */

'use client';

import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';

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
  /** Set of selected item IDs */
  selectedIds: Set<string>;
  /** Count of selected items */
  selectedCount: number;
  /** Whether selection mode is active */
  isSelectionMode: boolean;

  // Computed values
  /** Whether any items are selected */
  hasSelection: boolean;
  /** Whether maximum selection limit is reached */
  isMaxSelected: boolean;
  /** Whether more items can be selected */
  canSelectMore: boolean;

  // Item-level actions
  /** Select a single item by ID */
  selectItem: (id: string) => void;
  /** Deselect a single item by ID */
  deselectItem: (id: string) => void;
  /** Toggle selection state of a single item */
  toggleItem: (id: string) => void;
  /** Check if an item is selected */
  isSelected: (id: string) => boolean;

  // Bulk actions
  /** Select all provided IDs (respects maxSelection) */
  selectAll: (ids: string[]) => void;
  /** Add multiple items to selection */
  selectMultiple: (ids: string[]) => void;
  /** Remove multiple items from selection */
  deselectMultiple: (ids: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;

  // Mode control
  /** Enter selection mode (shows checkboxes) */
  enterSelectionMode: () => void;
  /** Exit selection mode and clear selection */
  exitSelectionMode: () => void;
  /** Toggle selection mode on/off */
  toggleSelectionMode: () => void;

  // Utilities
  /** Get array of selected items from provided items array */
  getSelectedItems: <T extends { id: string }>(items: T[]) => T[];
  /** Get array of selected IDs */
  getSelectedArray: () => string[];
}

/**
 * Hook for managing multi-item selection state.
 *
 * @example
 * const {
 *   selectedIds,
 *   selectedCount,
 *   isSelectionMode,
 *   selectItem,
 *   selectAll,
 *   clearSelection,
 * } = useItemSelection({
 *   maxSelection: 50,
 *   onSelectionChange: (ids) => console.log('Selected:', ids),
 * });
 */
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

  // Use wrapper reducer to inject maxSelection
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

  // Computed values
  const selectedCount = state.selectedIds.size;
  const hasSelection = selectedCount > 0;
  const isMaxSelected = selectedCount >= maxSelection;
  const canSelectMore = selectedCount < maxSelection;

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

  // Return stable object
  return useMemo(
    () => ({
      // State
      selectedIds: state.selectedIds,
      selectedCount,
      isSelectionMode: state.isSelectionMode,

      // Computed values
      hasSelection,
      isMaxSelected,
      canSelectMore,

      // Item-level actions
      selectItem,
      deselectItem,
      toggleItem,
      isSelected,

      // Bulk actions
      selectAll,
      selectMultiple,
      deselectMultiple,
      clearSelection,

      // Mode control
      enterSelectionMode,
      exitSelectionMode,
      toggleSelectionMode,

      // Utilities
      getSelectedItems,
      getSelectedArray,
    }),
    [
      state.selectedIds,
      state.isSelectionMode,
      selectedCount,
      hasSelection,
      isMaxSelected,
      canSelectMore,
      selectItem,
      deselectItem,
      toggleItem,
      isSelected,
      selectAll,
      selectMultiple,
      deselectMultiple,
      clearSelection,
      enterSelectionMode,
      exitSelectionMode,
      toggleSelectionMode,
      getSelectedItems,
      getSelectedArray,
    ]
  );
}

export default useItemSelection;
```

### Task 3.1.4: Update Barrel Exports

**File:** `src/components/ItemManager/hooks/index.ts`

Add export:

```typescript
export { useItemSelection } from './useItemSelection';
export type { UseItemSelectionOptions, UseItemSelectionReturn } from './useItemSelection';
```

---

## 6. Testing Requirements

### 6.1 Unit Test Cases

Create tests in `src/components/ItemManager/hooks/__tests__/useItemSelection.test.ts`:

| Test Case | Description |
|-----------|-------------|
| Initial state is empty | No items selected, selection mode off |
| Initial selection respects initialSelection | Provided IDs are pre-selected |
| selectItem adds item to selection | Single item can be selected |
| selectItem auto-enters selection mode | First selection enables mode |
| selectItem respects maxSelection | Cannot select beyond limit |
| deselectItem removes item | Single item can be deselected |
| deselectItem auto-exits mode when empty | Last deselection exits mode |
| toggleItem toggles selection state | Selected becomes unselected and vice versa |
| isSelected returns correct state | Check function works correctly |
| selectAll selects all provided IDs | Bulk select works |
| selectAll respects maxSelection | Only maxSelection items selected |
| selectMultiple adds to existing selection | Additive bulk select |
| deselectMultiple removes from selection | Bulk deselect works |
| clearSelection empties selection | All items deselected |
| clearSelection exits selection mode | Mode is off after clear |
| enterSelectionMode enables mode | Mode toggle works |
| exitSelectionMode clears and disables | Exit clears selection |
| toggleSelectionMode toggles | Mode toggle works both ways |
| getSelectedItems filters correctly | Returns only selected items |
| onSelectionChange callback fires | Parent notified of changes |
| Duplicate selections ignored | Selecting same item twice is no-op |

### 6.2 Integration Test Scenarios

| Scenario | Description |
|----------|-------------|
| Select items then filter | Selection persists across filter changes |
| Select all on filtered list | Only visible items selected |
| Long-press triggers selection mode | Mobile entry point works |
| Bulk delete uses selection | Delete confirms correct items |

### 6.3 Performance Considerations

- Test with 500+ items to verify Set operations are efficient
- Ensure stable references prevent unnecessary re-renders
- Verify onSelectionChange doesn't fire on every render

---

## 7. Acceptance Criteria

From REQ-068:

- [x] Individual items can be toggled in and out of the selection independently
- [x] A "select all" action adds all currently visible (filtered) items to the selection
- [x] Selection can be cleared completely with a single action
- [x] Selection mode can be toggled on/off
- [x] Visual indication of selection is supported (via isSelected function)

### Additional Technical Criteria:

- [ ] Hook follows established patterns from ItemCapture hooks
- [ ] Uses Set for O(1) selection lookups
- [ ] Memoization prevents unnecessary re-computations
- [ ] Debug mode provides useful console output
- [ ] TypeScript types are comprehensive and exported
- [ ] maxSelection constraint is enforced

---

## 8. Integration Notes

### 8.1 Usage in ItemManager

The hook will be used in `ItemManager.tsx`:

```typescript
function ItemManager({ items, config, onSelectionChange, ...props }: ItemManagerProps) {
  const { filteredItems } = useItemSearch({ items, ... });

  const {
    selectedIds,
    selectedCount,
    isSelectionMode,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
  } = useItemSelection({
    maxSelection: config?.maxBulkSelection ?? 100,
    onSelectionChange,
  });

  // Handle select all for filtered items
  const handleSelectAll = () => {
    selectAll(filteredItems.map(item => item.id));
  };

  return (
    <div>
      <ItemToolbar
        selectedCount={selectedCount}
        isSelectionMode={isSelectionMode}
        onSelectAll={handleSelectAll}
        onClearSelection={clearSelection}
      />
      <ItemGrid
        items={filteredItems}
        isSelectionMode={isSelectionMode}
        isSelected={isSelected}
        onToggleItem={toggleItem}
      />
      {hasSelection && (
        <BulkActionsBar selectedCount={selectedCount} />
      )}
    </div>
  );
}
```

### 8.2 Usage in ItemCard/ItemRow

```typescript
function ItemCard({ item, isSelectionMode, isSelected, onToggle }: ItemCardProps) {
  return (
    <div className={cn(
      'item-card',
      isSelected && 'ring-2 ring-blue-500 bg-blue-50'
    )}>
      {isSelectionMode && (
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(item.id)}
        />
      )}
      {/* ... card content */}
    </div>
  );
}
```

### 8.3 Relationship to Other Phase 3 Tasks

- **Task 3.2 (Selection UI):** Consumes `isSelectionMode`, `isSelected`, `toggleItem`
- **Task 3.3 (BulkActionsBar):** Uses `selectedCount`, `hasSelection`, `clearSelection`
- **Task 3.4 (ConfirmDeleteDialog):** Gets selected IDs via `getSelectedArray()`
- **Task 3.5 (BulkTagDialog):** Gets selected items via `getSelectedItems(items)`
- **Task 3.6 (BulkMoveDialog):** Gets selected items via `getSelectedItems(items)`

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with large selection | Low | Medium | Set provides O(1) operations |
| Selection/filter sync issues | Medium | Medium | Clear documentation that selectAll takes filtered IDs |
| Memory leak with stale selections | Low | Low | Clear selection on unmount if needed |
| Race conditions with rapid selection | Low | Low | Reducer ensures sequential processing |

---

## 10. Appendix: File Structure After Implementation

```
src/components/ItemManager/
├── hooks/
│   ├── index.ts                    # Barrel exports
│   ├── useItemManagerState.ts      # (Created in Phase 1)
│   ├── useItemSearch.ts            # (Created in Phase 2)
│   ├── useItemSelection.ts         # NEW: Selection hook
│   └── __tests__/
│       ├── useItemSearch.test.ts   # (Created in Phase 2)
│       └── useItemSelection.test.ts # NEW: Unit tests
├── utils/
│   ├── filterUtils.ts              # (Created in Phase 2)
│   ├── sortUtils.ts                # (Created in Phase 2)
│   └── constants.ts                # (Created in Phase 1)
└── ItemManager.types.ts            # (Created in Phase 1)
```

---

## 11. Mobile Considerations

### Long-press to Enter Selection Mode

The hook supports mobile long-press entry to selection mode:

```typescript
// In ItemCard component
function ItemCard({ item, onLongPress, ... }) {
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress?.(item.id);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* ... */}
    </div>
  );
}

// In ItemManager
const handleLongPress = (id: string) => {
  enterSelectionMode();
  selectItem(id);
};
```

---

## 12. References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.1
- [useItemCaptureState](/src/components/ItemCapture/hooks/useItemCaptureState.ts) - Pattern reference
- [REQ-062 Overview](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Similar hook documentation
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - ItemRecord, MediaItem types
