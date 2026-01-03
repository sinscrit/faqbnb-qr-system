'use client';

/**
 * useItemManagerState - Core state management hook for ItemManager
 *
 * This hook manages view mode, filter/sort state, selection state,
 * and UI panel states for the ItemManager component.
 *
 * @module ItemManager/hooks/useItemManagerState
 * @see docs/REQ-057-implement-core-state-management-hook-overview.md
 * @lastModified 2026-01-03
 */

import { useReducer, useCallback, useMemo, useEffect } from 'react';
import type {
  ItemManagerState,
  ItemManagerAction,
  ItemManagerConfig,
  FilterState,
  SortOption,
} from '../ItemManager.types';
import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Constants
// =============================================================================

const SESSION_STORAGE_KEY = 'itemManager.viewMode';

// =============================================================================
// Initial State
// =============================================================================

/**
 * Factory function to create fresh initial state.
 * Used by reducer initialization and for testing.
 *
 * @param config - Optional configuration to customize initial state
 * @returns Fresh ItemManagerState object
 */
export const createInitialState = (config?: ItemManagerConfig): ItemManagerState => ({
  // View
  viewMode: config?.defaultView ?? 'grid',

  // Search & Filter
  searchQuery: '',
  filters: {},
  sortBy: 'created-desc',

  // Selection
  selectedIds: new Set<string>(),
  isSelectionMode: false,

  // UI
  previewItem: null,
  assetPanelItem: null,
  isFilterPanelOpen: false,

  // Inline edit
  editingItemId: null,
  editingField: null,
});

// =============================================================================
// Reducer
// =============================================================================

/**
 * Reducer function for ItemManager state transitions.
 * All state mutations go through this function for predictability.
 *
 * @param state - Current state
 * @param action - Action to process
 * @returns New state (or same state if action is invalid)
 */
export function itemManagerReducer(
  state: ItemManagerState,
  action: ItemManagerAction
): ItemManagerState {
  switch (action.type) {
    // =========================================================================
    // View Mode Actions
    // =========================================================================
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    // =========================================================================
    // Search & Filter Actions
    // =========================================================================
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'CLEAR_FILTERS':
      return { ...state, filters: {}, searchQuery: '' };

    case 'SET_SORT':
      return { ...state, sortBy: action.payload };

    // =========================================================================
    // Selection Actions
    // =========================================================================
    case 'SELECT_ITEM': {
      const newSet = new Set(state.selectedIds);
      newSet.add(action.payload);
      return { ...state, selectedIds: newSet, isSelectionMode: true };
    }

    case 'DESELECT_ITEM': {
      const newSet = new Set(state.selectedIds);
      newSet.delete(action.payload);
      return {
        ...state,
        selectedIds: newSet,
        isSelectionMode: newSet.size > 0,
      };
    }

    case 'SELECT_ALL':
      return {
        ...state,
        selectedIds: new Set(action.payload),
        isSelectionMode: action.payload.length > 0,
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedIds: new Set(),
        isSelectionMode: false,
      };

    case 'TOGGLE_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: !state.isSelectionMode,
        selectedIds: state.isSelectionMode ? new Set() : state.selectedIds,
      };

    // =========================================================================
    // UI Panel Actions
    // =========================================================================
    case 'OPEN_PREVIEW':
      return { ...state, previewItem: action.payload };

    case 'CLOSE_PREVIEW':
      return { ...state, previewItem: null };

    case 'OPEN_ASSET_PANEL':
      return { ...state, assetPanelItem: action.payload };

    case 'CLOSE_ASSET_PANEL':
      return { ...state, assetPanelItem: null };

    case 'TOGGLE_FILTER_PANEL':
      return { ...state, isFilterPanelOpen: !state.isFilterPanelOpen };

    // =========================================================================
    // Inline Edit Actions
    // =========================================================================
    case 'START_INLINE_EDIT':
      return {
        ...state,
        editingItemId: action.payload.itemId,
        editingField: action.payload.field,
      };

    case 'END_INLINE_EDIT':
      return {
        ...state,
        editingItemId: null,
        editingField: null,
      };

    default:
      return state;
  }
}

// =============================================================================
// Hook Return Type
// =============================================================================

/**
 * Return type for useItemManagerState hook.
 * Contains all state, actions, and computed values.
 */
export interface UseItemManagerStateReturn {
  // State
  state: ItemManagerState;

  // View actions
  setViewMode: (mode: 'grid' | 'list') => void;

  // Search & Filter actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setSort: (sort: SortOption) => void;

  // Selection actions
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItemSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelectionMode: () => void;

  // UI Panel actions
  openPreview: (item: ItemRecord) => void;
  closePreview: () => void;
  openAssetPanel: (item: ItemRecord) => void;
  closeAssetPanel: () => void;
  toggleFilterPanel: () => void;

  // Inline edit actions
  startInlineEdit: (itemId: string, field: 'title' | 'location' | 'tags') => void;
  endInlineEdit: () => void;

  // Computed values
  selectedCount: number;
  hasSelection: boolean;
  hasFilters: boolean;
  isItemSelected: (id: string) => boolean;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Core state management hook for ItemManager component.
 *
 * Provides centralized state for view mode, filters, sorting, selection,
 * and UI panel states. Uses reducer pattern for predictable state updates.
 *
 * @param config - Optional configuration to customize behavior
 * @returns State, actions, and computed values
 *
 * @example
 * const { state, setViewMode, selectItem } = useItemManagerState({
 *   defaultView: 'list',
 *   maxBulkSelection: 50
 * });
 */
export function useItemManagerState(
  config?: ItemManagerConfig
): UseItemManagerStateReturn {
  const [state, dispatch] = useReducer(
    itemManagerReducer,
    config,
    createInitialState
  );

  // Restore view mode from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored === 'grid' || stored === 'list') {
        dispatch({ type: 'SET_VIEW_MODE', payload: stored });
      }
    }
  }, []);

  // View actions
  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    if (config?.allowViewToggle === false) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, mode);
    }
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, [config?.allowViewToggle]);

  // Search & Filter actions
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setFilters = useCallback((filters: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const setSort = useCallback((sort: SortOption) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  // Selection constraints
  const maxSelection = config?.maxBulkSelection ?? 100;

  // Selection actions
  const selectItem = useCallback((id: string) => {
    if (state.selectedIds.size >= maxSelection) return;
    dispatch({ type: 'SELECT_ITEM', payload: id });
  }, [state.selectedIds.size, maxSelection]);

  const deselectItem = useCallback((id: string) => {
    dispatch({ type: 'DESELECT_ITEM', payload: id });
  }, []);

  const toggleItemSelection = useCallback((id: string) => {
    if (state.selectedIds.has(id)) {
      dispatch({ type: 'DESELECT_ITEM', payload: id });
    } else if (state.selectedIds.size < maxSelection) {
      dispatch({ type: 'SELECT_ITEM', payload: id });
    }
  }, [state.selectedIds, maxSelection]);

  const selectAll = useCallback((ids: string[]) => {
    const limitedIds = ids.slice(0, maxSelection);
    dispatch({ type: 'SELECT_ALL', payload: limitedIds });
  }, [maxSelection]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const toggleSelectionMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_SELECTION_MODE' });
  }, []);

  // UI Panel actions
  const openPreview = useCallback((item: ItemRecord) => {
    dispatch({ type: 'OPEN_PREVIEW', payload: item });
  }, []);

  const closePreview = useCallback(() => {
    dispatch({ type: 'CLOSE_PREVIEW' });
  }, []);

  const openAssetPanel = useCallback((item: ItemRecord) => {
    dispatch({ type: 'OPEN_ASSET_PANEL', payload: item });
  }, []);

  const closeAssetPanel = useCallback(() => {
    dispatch({ type: 'CLOSE_ASSET_PANEL' });
  }, []);

  const toggleFilterPanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILTER_PANEL' });
  }, []);

  // Inline edit actions
  const startInlineEdit = useCallback(
    (itemId: string, field: 'title' | 'location' | 'tags') => {
      dispatch({ type: 'START_INLINE_EDIT', payload: { itemId, field } });
    },
    []
  );

  const endInlineEdit = useCallback(() => {
    dispatch({ type: 'END_INLINE_EDIT' });
  }, []);

  // Computed values
  const selectedCount = useMemo(
    () => state.selectedIds.size,
    [state.selectedIds]
  );

  const hasSelection = useMemo(
    () => state.selectedIds.size > 0,
    [state.selectedIds]
  );

  const hasFilters = useMemo(() => {
    const { filters, searchQuery } = state;
    return (
      searchQuery.trim().length > 0 ||
      (filters.contentTypes?.length ?? 0) > 0 ||
      (filters.tags?.length ?? 0) > 0 ||
      (filters.locations?.length ?? 0) > 0 ||
      (filters.propertyIds?.length ?? 0) > 0
    );
  }, [state.filters, state.searchQuery]);

  const isItemSelected = useCallback(
    (id: string) => state.selectedIds.has(id),
    [state.selectedIds]
  );

  return {
    state,
    setViewMode,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSort,
    selectItem,
    deselectItem,
    toggleItemSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    openPreview,
    closePreview,
    openAssetPanel,
    closeAssetPanel,
    toggleFilterPanel,
    startInlineEdit,
    endInlineEdit,
    selectedCount,
    hasSelection,
    hasFilters,
    isItemSelected,
  };
}

export default useItemManagerState;
