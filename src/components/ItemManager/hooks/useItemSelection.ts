/**
 * useItemSelection Hook
 *
 * Provides selection state management for ItemManager.
 * Uses reducer-based state management with Set for O(1) lookup performance.
 *
 * @module ItemManager/hooks/useItemSelection
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.1)
 * @lastModified 2026-01-04 (REQ-068)
 */

'use client';

import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';

// =============================================================================
// Types and Interfaces
// =============================================================================

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
  /** Set of selected item IDs */
  selectedIds: Set<string>;
  /** Number of selected items */
  selectedCount: number;
  /** Whether selection mode is active */
  isSelectionMode: boolean;

  // Computed values
  /** Whether any items are selected */
  hasSelection: boolean;
  /** Whether maximum selection limit has been reached */
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
  /** Replace selection with provided IDs */
  selectAll: (ids: string[]) => void;
  /** Add multiple items to selection */
  selectMultiple: (ids: string[]) => void;
  /** Remove multiple items from selection */
  deselectMultiple: (ids: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;

  // Mode control
  /** Enter selection mode without selecting items */
  enterSelectionMode: () => void;
  /** Exit selection mode and clear selection */
  exitSelectionMode: () => void;
  /** Toggle selection mode on/off */
  toggleSelectionMode: () => void;

  // Utilities
  /** Filter items to only selected ones */
  getSelectedItems: <T extends { id: string }>(items: T[]) => T[];
  /** Get array of selected IDs */
  getSelectedArray: () => string[];
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create initial selection state.
 */
function createInitialState(initialIds: string[] = []): SelectionState {
  return {
    selectedIds: new Set(initialIds),
    isSelectionMode: initialIds.length > 0,
  };
}

// =============================================================================
// Reducer
// =============================================================================

/**
 * Selection state reducer.
 * Handles all selection-related state transitions.
 *
 * @param state - Current selection state
 * @param action - Action to perform
 * @param maxSelection - Maximum number of items that can be selected
 * @returns New selection state
 */
function selectionReducer(
  state: SelectionState,
  action: SelectionAction,
  maxSelection: number = 100
): SelectionState {
  switch (action.type) {
    case 'SELECT_ITEM': {
      // No-op if already selected
      if (state.selectedIds.has(action.payload)) return state;
      // No-op if at max limit
      if (state.selectedIds.size >= maxSelection) return state;

      const newSelectedIds = new Set(state.selectedIds);
      newSelectedIds.add(action.payload);

      return {
        selectedIds: newSelectedIds,
        isSelectionMode: true, // Auto-enter selection mode
      };
    }

    case 'DESELECT_ITEM': {
      // No-op if not selected
      if (!state.selectedIds.has(action.payload)) return state;

      const newSelectedIds = new Set(state.selectedIds);
      newSelectedIds.delete(action.payload);

      return {
        selectedIds: newSelectedIds,
        isSelectionMode: newSelectedIds.size > 0, // Auto-exit if empty
      };
    }

    case 'TOGGLE_ITEM': {
      if (state.selectedIds.has(action.payload)) {
        // Deselect
        const newSelectedIds = new Set(state.selectedIds);
        newSelectedIds.delete(action.payload);

        return {
          selectedIds: newSelectedIds,
          isSelectionMode: newSelectedIds.size > 0,
        };
      } else {
        // Select (respect max limit)
        if (state.selectedIds.size >= maxSelection) return state;

        const newSelectedIds = new Set(state.selectedIds);
        newSelectedIds.add(action.payload);

        return {
          selectedIds: newSelectedIds,
          isSelectionMode: true,
        };
      }
    }

    case 'SELECT_ALL': {
      // Replace entire selection, truncate to max
      const idsToSelect = action.payload.slice(0, maxSelection);
      const newSelectedIds = new Set(idsToSelect);

      return {
        selectedIds: newSelectedIds,
        isSelectionMode: newSelectedIds.size > 0,
      };
    }

    case 'SELECT_MULTIPLE': {
      // Add to existing selection, stop at max
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
      // Remove specified items
      const newSelectedIds = new Set(state.selectedIds);

      for (const id of action.payload) {
        newSelectedIds.delete(id);
      }

      return {
        selectedIds: newSelectedIds,
        isSelectionMode: newSelectedIds.size > 0,
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        selectedIds: new Set(),
        isSelectionMode: false,
      };
    }

    case 'ENTER_SELECTION_MODE': {
      if (state.isSelectionMode) return state;

      return {
        ...state,
        isSelectionMode: true,
      };
    }

    case 'EXIT_SELECTION_MODE': {
      return {
        selectedIds: new Set(),
        isSelectionMode: false,
      };
    }

    case 'TOGGLE_SELECTION_MODE': {
      if (state.isSelectionMode) {
        // Exit and clear
        return {
          selectedIds: new Set(),
          isSelectionMode: false,
        };
      } else {
        // Enter (preserve any existing selection)
        return {
          ...state,
          isSelectionMode: true,
        };
      }
    }

    case 'RESET': {
      return createInitialState();
    }

    default:
      return state;
  }
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing item selection state.
 *
 * @param options - Configuration options for the hook
 * @returns Object containing selection state, computed values, and action methods
 *
 * @example
 * const {
 *   selectedIds,
 *   selectedCount,
 *   isSelectionMode,
 *   selectItem,
 *   toggleItem,
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

  // =============================================================================
  // Computed Values
  // =============================================================================

  const selectedCount = state.selectedIds.size;
  const hasSelection = selectedCount > 0;
  const isMaxSelected = selectedCount >= maxSelection;
  const canSelectMore = selectedCount < maxSelection;

  // =============================================================================
  // Item-Level Actions
  // =============================================================================

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

  // =============================================================================
  // Bulk Actions
  // =============================================================================

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

  // =============================================================================
  // Mode Control
  // =============================================================================

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

  // =============================================================================
  // Utilities
  // =============================================================================

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

  // =============================================================================
  // Return Value
  // =============================================================================

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
