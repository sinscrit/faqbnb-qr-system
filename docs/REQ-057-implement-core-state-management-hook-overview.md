# REQ-057: ItemManager Core State Management Hook - Implementation Overview

*Generated: 2026-01-03 17:30:00*
*Last Modified: 2026-01-03 17:30:00*

## Reference
- **Request**: REQ-057 (Item Manager State Management Hook)
- **Source**: docs/gen_requests.md
- **Implementation Plan**: docs/prd/item-capture-manager-implementation-plan.md
- **Type**: New Feature (Core Infrastructure)
- **Phase**: 1 - Foundation
- **Task ID**: 1.2
- **Size**: M

---

## Overview

This document provides a detailed implementation breakdown for the core state management hook (`useItemManagerState.ts`) that coordinates view modes, filtering, sorting, and multi-item selection across the ItemManager listing interface.

### Purpose

The `useItemManagerState` hook serves as the central state management system for the ItemManager component, providing:

- View mode toggling (grid/list layouts)
- Centralized filter and sort state management
- Multi-item selection state tracking
- UI panel states (preview modal, asset panel, filter panel)
- Inline editing state coordination
- Predictable reducer-based state transitions

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 1.1 - Directory Structure & Types | **Required** | `ItemManager.types.ts` must exist with all interfaces defined |
| ItemCapture component types | **Required** | `ItemRecord`, `MediaItem` types must be available |

### Dependents (Blocked by this task)

- Task 1.3 - Basic ItemManager Shell
- Task 1.4 - ItemCard Component
- Task 1.5 - ItemRow Component
- Task 1.6 - Grid and List Views
- All Phase 2-6 tasks

---

## Technical Approach

### Pattern Selection: useReducer + Local State

Based on the implementation plan and existing codebase patterns (particularly `src/components/ItemCapture/hooks/useItemCaptureState.ts`), this implementation will use React's `useReducer` pattern for predictable state management. This aligns with:

1. **PRD requirement**: "No global state" - component manages its own state
2. **Consistency**: Matches existing ItemCapture state management pattern
3. **Predictability**: Actions explicitly define allowed mutations
4. **Testability**: Reducer logic can be unit tested in isolation

### Existing Patterns to Follow

| Pattern | Source File | How to Apply |
|---------|-------------|--------------|
| Reducer-based state | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Use `useReducer` with discriminated union actions |
| Memoized callbacks | `src/components/ItemCapture/hooks/useItemCaptureState.ts:432-511` | Wrap dispatch calls in `useCallback` |
| Computed values | `src/components/ItemCapture/hooks/useItemCaptureState.ts:514-532` | Use `useMemo` for derived state |
| Section comments | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Use `// =============================================================================` pattern |
| Initial state factory | `src/components/ItemCapture/hooks/useItemCaptureState.ts:52-69` | Use factory function for fresh state |
| Hook return interface | `src/components/ItemCapture/hooks/useItemCaptureState.ts:382-422` | Define explicit return type interface |

---

## State Architecture

### State Interface (From Implementation Plan)

```typescript
// /src/components/ItemManager/hooks/useItemManagerState.ts

interface ItemManagerState {
  // View
  viewMode: 'grid' | 'list';

  // Search & Filter
  searchQuery: string;
  filters: FilterState;
  sortBy: SortOption;

  // Selection
  selectedIds: Set<string>;
  isSelectionMode: boolean;

  // UI
  previewItem: ItemRecord | null;
  assetPanelItem: ItemRecord | null;
  isFilterPanelOpen: boolean;

  // Inline edit
  editingItemId: string | null;
  editingField: 'title' | 'location' | 'tags' | null;
}
```

### Filter State Structure

```typescript
interface FilterState {
  search?: string;
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;
  tags?: string[];
  locations?: string[];
  propertyIds?: string[];
}
```

### Sort Options

```typescript
type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'location-asc';
```

### Action Types (From Implementation Plan)

```typescript
type ItemManagerAction =
  // View
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }

  // Search & Filter
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: SortOption }

  // Selection
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ITEM'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_SELECTION_MODE' }

  // Preview & Panels
  | { type: 'OPEN_PREVIEW'; payload: ItemRecord }
  | { type: 'CLOSE_PREVIEW' }
  | { type: 'OPEN_ASSET_PANEL'; payload: ItemRecord }
  | { type: 'CLOSE_ASSET_PANEL' }
  | { type: 'TOGGLE_FILTER_PANEL' }

  // Inline edit
  | { type: 'START_INLINE_EDIT'; payload: { itemId: string; field: 'title' | 'location' | 'tags' } }
  | { type: 'END_INLINE_EDIT' };
```

---

## Implementation Order

### Step 1: Create Initial State Factory (15 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Create factory function `createInitialState(config?: ItemManagerConfig): ItemManagerState`
- [ ] Initialize view mode from `config.defaultView` or default to `'grid'`
- [ ] Initialize empty filter state
- [ ] Initialize default sort to `'created-desc'`
- [ ] Initialize empty selection state with `new Set<string>()`
- [ ] Initialize all UI states to null/false

**Initial State Template:**
```typescript
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
```

### Step 2: Implement View Mode Actions (15 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Handle `SET_VIEW_MODE` action
- [ ] Persist view mode to sessionStorage (per implementation plan decision)
- [ ] Create `setViewMode` callback in hook

**Acceptance Criteria:**
- View mode toggles between 'grid' and 'list'
- View mode persists within session
- Respects `config.allowViewToggle` flag (callback returns early if false)

### Step 3: Implement Filter/Sort State Actions (30 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Handle `SET_SEARCH_QUERY` action
- [ ] Handle `SET_FILTERS` action (merge with existing filters)
- [ ] Handle `CLEAR_FILTERS` action (reset to empty object)
- [ ] Handle `SET_SORT` action
- [ ] Create memoized callbacks: `setSearchQuery`, `setFilters`, `clearFilters`, `setSort`

**Filter Merge Logic:**
```typescript
case 'SET_FILTERS':
  return {
    ...state,
    filters: { ...state.filters, ...action.payload },
  };
```

**Acceptance Criteria:**
- Search query updates correctly
- Filters merge (don't replace) when partially updated
- Clear filters resets to empty object
- Sort changes correctly

### Step 4: Implement Selection State Actions (30 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Handle `SELECT_ITEM` action (add to Set)
- [ ] Handle `DESELECT_ITEM` action (remove from Set)
- [ ] Handle `SELECT_ALL` action (set from array of IDs)
- [ ] Handle `CLEAR_SELECTION` action
- [ ] Handle `TOGGLE_SELECTION_MODE` action
- [ ] Create callbacks: `selectItem`, `deselectItem`, `selectAll`, `clearSelection`, `toggleSelectionMode`
- [ ] Enforce `maxBulkSelection` constraint from config

**Set Operations (Immutable):**
```typescript
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
```

**Acceptance Criteria:**
- Single item selection works
- Deselection removes from set
- Select all populates set from array
- Clear selection empties set and exits selection mode
- Selection count respects `maxBulkSelection` (default: 100)

### Step 5: Implement UI Panel Actions (20 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Handle `OPEN_PREVIEW` action (store ItemRecord)
- [ ] Handle `CLOSE_PREVIEW` action (set to null)
- [ ] Handle `OPEN_ASSET_PANEL` action (store ItemRecord)
- [ ] Handle `CLOSE_ASSET_PANEL` action (set to null)
- [ ] Handle `TOGGLE_FILTER_PANEL` action
- [ ] Create callbacks: `openPreview`, `closePreview`, `openAssetPanel`, `closeAssetPanel`, `toggleFilterPanel`

**Acceptance Criteria:**
- Opening preview stores the item
- Closing preview clears the item
- Asset panel works independently from preview
- Filter panel toggles correctly

### Step 6: Implement Inline Edit Actions (15 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Handle `START_INLINE_EDIT` action
- [ ] Handle `END_INLINE_EDIT` action
- [ ] Create callbacks: `startInlineEdit`, `endInlineEdit`

**Acceptance Criteria:**
- Starting inline edit stores item ID and field
- Ending inline edit clears both values
- Only one field can be edited at a time

### Step 7: Create Hook Return Interface and Implementation (30 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Define `UseItemManagerStateReturn` interface
- [ ] Create `useItemManagerState(config?: ItemManagerConfig)` hook
- [ ] Initialize with `useReducer(itemManagerReducer, config, createInitialState)`
- [ ] Create all memoized action dispatchers with `useCallback`
- [ ] Add computed values with `useMemo`
- [ ] Export hook and return interface

**Hook Return Interface:**
```typescript
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
```

### Step 8: Add Computed Values (15 min)

**File:** `src/components/ItemManager/hooks/useItemManagerState.ts`

**Deliverables:**
- [ ] Add `selectedCount` computed value
- [ ] Add `hasSelection` computed value
- [ ] Add `hasFilters` computed value
- [ ] Add `isItemSelected` helper function

**Computed Values:**
```typescript
const selectedCount = useMemo(() => state.selectedIds.size, [state.selectedIds]);

const hasSelection = useMemo(() => state.selectedIds.size > 0, [state.selectedIds]);

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
```

---

## Authorized Files and Functions for Modification

### Files to Create

#### `/src/components/ItemManager/hooks/useItemManagerState.ts`
- **Purpose**: Core state management hook for ItemManager
- **Exports**:
  - `useItemManagerState(config?: ItemManagerConfig): UseItemManagerStateReturn`
  - `UseItemManagerStateReturn` interface
  - `createInitialState(config?: ItemManagerConfig): ItemManagerState` (for testing)
  - `itemManagerReducer(state, action): ItemManagerState` (for testing)
- **Functions**:
  - `createInitialState` - Factory for initial state
  - `itemManagerReducer` - Reducer function handling all actions
  - `useItemManagerState` - Main hook
- **Dependencies**:
  - `react` - `useReducer`, `useCallback`, `useMemo`
  - `../ItemManager.types` - All type imports

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/index.ts` | Add export for `useItemManagerState` hook |

### Existing Files (Read-Only Reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Pattern for reducer-based state hook |
| `src/components/ItemManager/ItemManager.types.ts` | Type imports (ItemManagerState, ItemManagerAction, FilterState, SortOption) |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord type import |

---

## Technical Specifications

### Session Storage for View Mode

Per implementation plan technical decision: "Session storage - Preserve view mode within session; no localStorage for privacy"

```typescript
const SESSION_STORAGE_KEY = 'itemManager.viewMode';

// On mount - restore view mode if available
useEffect(() => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored === 'grid' || stored === 'list') {
      dispatch({ type: 'SET_VIEW_MODE', payload: stored });
    }
  }
}, []);

// On view mode change - persist to session storage
const setViewMode = useCallback((mode: 'grid' | 'list') => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_STORAGE_KEY, mode);
  }
  dispatch({ type: 'SET_VIEW_MODE', payload: mode });
}, []);
```

### Set Immutability Pattern

JavaScript Sets are mutable, so every selection operation must create a new Set:

```typescript
// Add item
const newSet = new Set(state.selectedIds);
newSet.add(action.payload);
return { ...state, selectedIds: newSet };

// Remove item
const newSet = new Set(state.selectedIds);
newSet.delete(action.payload);
return { ...state, selectedIds: newSet };

// Select all
return { ...state, selectedIds: new Set(action.payload) };

// Clear
return { ...state, selectedIds: new Set() };
```

### Config Integration

The hook accepts optional config to customize behavior:

```typescript
export function useItemManagerState(config?: ItemManagerConfig): UseItemManagerStateReturn {
  const [state, dispatch] = useReducer(
    itemManagerReducer,
    config,
    createInitialState
  );

  // Respect config flags in callbacks
  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    if (config?.allowViewToggle === false) return;
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, [config?.allowViewToggle]);

  // ... other callbacks
}
```

---

## Success Validation Checklist

### State Management
- [ ] Initial state is created correctly with config defaults
- [ ] View mode toggles between 'grid' and 'list'
- [ ] View mode persists to sessionStorage
- [ ] Search query updates correctly
- [ ] Filters merge when partially updated
- [ ] Clear filters resets to empty object
- [ ] Sort changes correctly

### Selection
- [ ] Single item selection works (adds to Set)
- [ ] Deselection works (removes from Set)
- [ ] Select all populates Set from array
- [ ] Clear selection empties Set
- [ ] Selection mode auto-enables when items selected
- [ ] Selection mode auto-disables when selection cleared
- [ ] `maxBulkSelection` constraint is enforced

### UI Panels
- [ ] Preview opens and stores correct item
- [ ] Preview closes and clears item
- [ ] Asset panel opens and stores correct item
- [ ] Asset panel closes and clears item
- [ ] Filter panel toggles correctly

### Inline Edit
- [ ] Starting inline edit stores item ID and field
- [ ] Ending inline edit clears both values

### Hook Interface
- [ ] All callbacks are memoized with `useCallback`
- [ ] All computed values use `useMemo`
- [ ] Return type matches `UseItemManagerStateReturn` interface
- [ ] Hook exports correctly from barrel file

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused variables or imports
- [ ] No type mismatches

---

## Estimated Effort

| Step | Estimate | Complexity |
|------|----------|------------|
| Step 1: Initial State Factory | 15 min | Low |
| Step 2: View Mode Actions | 15 min | Low |
| Step 3: Filter/Sort Actions | 30 min | Medium |
| Step 4: Selection Actions | 30 min | Medium |
| Step 5: UI Panel Actions | 20 min | Low |
| Step 6: Inline Edit Actions | 15 min | Low |
| Step 7: Hook Implementation | 30 min | Medium |
| Step 8: Computed Values | 15 min | Low |
| **Total** | **~2.5-3 hours** | Medium |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Set immutability issues | Medium | Medium | Always create new Set for mutations |
| Session storage unavailable | Low | Low | Check `typeof window !== 'undefined'` |
| Config undefined access | Low | Medium | Use optional chaining and defaults |
| Large selection performance | Low | Medium | Set operations are O(1); enforce maxBulkSelection |

---

## Code Standards

### Naming Conventions
- Use camelCase for functions and variables
- Use PascalCase for types and interfaces
- Prefix action types with descriptive verbs (SET_, OPEN_, CLOSE_, TOGGLE_, etc.)

### Documentation
- JSDoc comments for exported functions and interfaces
- Section comments using `// =============================================================================` pattern
- Type annotations for all function parameters and returns

### File Structure
```typescript
'use client';

/**
 * useItemManagerState - Core state management hook for ItemManager
 *
 * This hook manages view mode, filter/sort state, selection state,
 * and UI panel states for the ItemManager component.
 *
 * @module ItemManager/hooks/useItemManagerState
 * @see docs/REQ-057-implement-core-state-management-hook-overview.md
 */

// =============================================================================
// Imports
// =============================================================================

// =============================================================================
// Initial State
// =============================================================================

// =============================================================================
// Reducer
// =============================================================================

// =============================================================================
// Hook Return Type
// =============================================================================

// =============================================================================
// Main Hook
// =============================================================================

export default useItemManagerState;
```

---

## References

- **Implementation Plan:** `docs/prd/item-capture-manager-implementation-plan.md`
- **Request Definition:** `docs/gen_requests.md` - Request #057
- **Pattern Reference - State Hook:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`
- **Type Definitions:** `src/components/ItemManager/ItemManager.types.ts` (Task 1.1)
- **ItemRecord Type:** `src/components/ItemCapture/ItemCapture.types.ts`

---

## Appendix: Complete Hook Implementation Skeleton

```typescript
// src/components/ItemManager/hooks/useItemManagerState.ts
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

export function itemManagerReducer(
  state: ItemManagerState,
  action: ItemManagerAction
): ItemManagerState {
  switch (action.type) {
    // View actions
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    // Search & Filter actions
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'CLEAR_FILTERS':
      return { ...state, filters: {}, searchQuery: '' };

    case 'SET_SORT':
      return { ...state, sortBy: action.payload };

    // Selection actions
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

    // UI Panel actions
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

    // Inline edit actions
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

export function useItemManagerState(
  config?: ItemManagerConfig
): UseItemManagerStateReturn {
  const [state, dispatch] = useReducer(
    itemManagerReducer,
    config,
    createInitialState
  );

  // Restore view mode from session storage
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

  // Selection actions
  const maxSelection = config?.maxBulkSelection ?? 100;

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
  const startInlineEdit = useCallback((itemId: string, field: 'title' | 'location' | 'tags') => {
    dispatch({ type: 'START_INLINE_EDIT', payload: { itemId, field } });
  }, []);

  const endInlineEdit = useCallback(() => {
    dispatch({ type: 'END_INLINE_EDIT' });
  }, []);

  // Computed values
  const selectedCount = useMemo(() => state.selectedIds.size, [state.selectedIds]);

  const hasSelection = useMemo(() => state.selectedIds.size > 0, [state.selectedIds]);

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
```
