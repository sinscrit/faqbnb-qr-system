# REQ-057: Build Basic ItemManager Shell - Detailed Task Breakdown

**Generated:** 2026-01-03 02:37:08
**Last Modified:** 2026-01-03 13:59:00
**Status:** COMPLETED
**Overview Document:** `docs/REQ-057-build-basic-itemmanager-shell-overview.md`
**Implementation Plan:** `docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.3

---

## Executive Summary

This document provides granular, actionable tasks for implementing the basic `ItemManager.tsx` shell component. Each task is designed to be approximately 1 story point (a few hours of focused work) and includes specific verification steps.

### Prerequisites

Before starting these tasks, ensure:
- [x] Task 1.1 (Directory Structure & Types) is complete - `src/components/ItemManager/ItemManager.types.ts` exists
- [x] Task 1.2 (State Management Hook) is complete - `src/components/ItemManager/hooks/useItemManagerState.ts` exists
- [x] Project builds successfully with `npm run build`

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/ItemManager.tsx` | Main orchestrator component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/index.ts` | Add `ItemManager` component export |

### Read-Only Reference Files

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/ItemCapture.tsx` | Pattern for component structure |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Layout pattern reference |
| `src/components/ItemManager/hooks/useItemManagerState.ts` | State hook to consume |
| `src/components/ItemManager/ItemManager.types.ts` | Type definitions |
| `src/lib/utils.ts` | `cn()` utility function |

---

## Task Breakdown

### Task 1.3.1: Create ItemManager Component File with Header and Imports

**Estimated Effort:** ~30 minutes
**Story Points:** 0.5

#### Description

Create the `ItemManager.tsx` file with the `'use client'` directive, module documentation, and organized imports following the existing ItemCapture pattern.

#### Implementation Steps

1. **Create the file** at `src/components/ItemManager/ItemManager.tsx`

2. **Add the `'use client'` directive** at the very first line

3. **Add module documentation** with JSDoc comments including:
   - Module description
   - `@module ItemManager/ItemManager`
   - `@see docs/prd/item-capture-manager-implementation-plan.md`
   - `@see docs/REQ-057-build-basic-itemmanager-shell-overview.md`
   - `@lastModified` with current date

4. **Organize imports in sections** (follow ItemCapture.tsx:11-34 pattern):
   - React utilities (`useCallback`, `useMemo`, `useEffect`)
   - Project utilities (`cn` from `@/lib/utils`)
   - Local hooks (`useItemManagerState` from `./hooks/useItemManagerState`)
   - Types from `./ItemManager.types`
   - Types from `@/components/ItemCapture` (`ItemRecord`)

#### Code Template

```typescript
'use client';

/**
 * ItemManager Component
 *
 * Main orchestrating component for browsing, organizing, searching,
 * filtering, and managing instructional content items.
 *
 * @module ItemManager/ItemManager
 * @see docs/prd/item-capture-manager-implementation-plan.md
 * @see docs/REQ-057-build-basic-itemmanager-shell-overview.md
 * @lastModified 2026-01-03
 */

import { useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useItemManagerState } from './hooks/useItemManagerState';
import type {
  ItemManagerProps,
  ItemManagerConfig,
  ItemActions,
} from './ItemManager.types';
import type { ItemRecord } from '@/components/ItemCapture';
```

#### Verification Steps

- [ ] File exists at `src/components/ItemManager/ItemManager.tsx`
- [ ] `'use client'` is the first line of the file
- [ ] JSDoc comment includes `@module`, `@see`, and `@lastModified` tags
- [ ] All imports use correct paths
- [ ] No TypeScript errors on imports (run `npx tsc --noEmit`)

#### Acceptance Criteria

- File structure matches the ItemCapture component pattern
- All required imports are present and correctly typed
- File compiles without TypeScript errors

---

### Task 1.3.2: Implement Default Configuration Constants

**Estimated Effort:** ~30 minutes
**Story Points:** 0.5

#### Description

Create the `DEFAULT_CONFIG` constant and `mergeConfig` helper function that provides all default values from the implementation plan (Appendix C).

#### Implementation Steps

1. **Add a section separator comment** for Constants

2. **Define `DEFAULT_CONFIG`** constant with type `Required<ItemManagerConfig>`:
   - `defaultView: 'grid'`
   - `allowViewToggle: true`
   - `enableBulkActions: true`
   - `enableInlineEdit: true`
   - `enableAssetManagement: true`
   - `enableDuplicate: false`
   - `enableSearch: true`
   - `enableFilters: true`
   - `enableSort: true`
   - `multiPropertyMode: false`
   - `maxBulkSelection: 100`
   - `labels` object with all default strings

3. **Add a section separator comment** for Helper Functions

4. **Create `mergeConfig` function** that:
   - Accepts optional `ItemManagerConfig`
   - Returns `Required<ItemManagerConfig>`
   - Performs shallow merge for top-level properties
   - Performs separate merge for nested `labels` object

#### Code Template

```typescript
// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CONFIG: Required<ItemManagerConfig> = {
  defaultView: 'grid',
  allowViewToggle: true,
  enableBulkActions: true,
  enableInlineEdit: true,
  enableAssetManagement: true,
  enableDuplicate: false,
  enableSearch: true,
  enableFilters: true,
  enableSort: true,
  multiPropertyMode: false,
  maxBulkSelection: 100,
  labels: {
    searchPlaceholder: 'Search items...',
    emptyStateTitle: 'No items yet',
    emptyStateDescription: 'Create your first item to get started',
    deleteConfirmTitle: 'Delete Item',
    deleteConfirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

const mergeConfig = (config?: ItemManagerConfig): Required<ItemManagerConfig> => ({
  ...DEFAULT_CONFIG,
  ...config,
  labels: {
    ...DEFAULT_CONFIG.labels,
    ...config?.labels,
  },
});
```

#### Verification Steps

- [ ] `DEFAULT_CONFIG` is typed as `Required<ItemManagerConfig>`
- [ ] All config fields from implementation plan Appendix C are present
- [ ] `mergeConfig` function handles undefined input gracefully
- [ ] Labels nested object is correctly merged (not replaced)
- [ ] TypeScript compilation succeeds

#### Acceptance Criteria

- Default configuration matches implementation plan specification
- Config merging preserves user overrides while providing defaults
- Nested labels object merges correctly (not full replacement)

---

### Task 1.3.3: Create Component Function Signature with Props Destructuring

**Estimated Effort:** ~45 minutes
**Story Points:** 0.5

#### Description

Define the main `ItemManager` component function with full props destructuring, config merging, and multi-property mode auto-enable logic.

#### Implementation Steps

1. **Add a section separator comment** for Main Component

2. **Define the exported component function** with all props destructured:
   - Required data: `items`
   - Optional data: `properties`, `loading`, `error`
   - Required callbacks: `onEditItem`, `onDeleteItems`, `onUpdateItem`
   - Optional callbacks: `onAddAssets`, `onRemoveAssets`, `onReorderAssets`, `onDuplicateItem`, `onSelectionChange`
   - Configuration: `config: userConfig`
   - Render props: `renderItem`, `renderEmptyState`, `renderLoadingState`, `renderErrorState`, `renderToolbar`, `renderItemPreview`, `renderConfirmDialog`
   - Styling: `classNames`

3. **Add default values** for optional props:
   - `loading = false`
   - `error = null`

4. **Implement config merging** using `useMemo`:
   - Create `config` by calling `mergeConfig(userConfig)`
   - Dependency array: `[userConfig]`

5. **Implement multi-property mode auto-enable**:
   - Create `effectiveConfig` using `useMemo`
   - Set `multiPropertyMode` to true if `properties` array is provided and non-empty
   - Dependency array: `[config, properties]`

#### Code Template

```typescript
// =============================================================================
// Main Component
// =============================================================================

export function ItemManager({
  items,
  properties,
  loading = false,
  error = null,
  onEditItem,
  onDeleteItems,
  onUpdateItem,
  onAddAssets,
  onRemoveAssets,
  onReorderAssets,
  onDuplicateItem,
  onSelectionChange,
  config: userConfig,
  renderItem,
  renderEmptyState,
  renderLoadingState,
  renderErrorState,
  renderToolbar,
  renderItemPreview,
  renderConfirmDialog,
  classNames,
}: ItemManagerProps) {
  // -------------------------------------------------------------------------
  // Config Merging
  // -------------------------------------------------------------------------

  const config = useMemo(() => mergeConfig(userConfig), [userConfig]);

  const effectiveConfig = useMemo(() => ({
    ...config,
    multiPropertyMode: config.multiPropertyMode || (properties && properties.length > 0),
  }), [config, properties]);

  // Component implementation continues...
  return null; // Placeholder - replaced in Task 1.3.5
}
```

#### Verification Steps

- [ ] Component is exported as named export (`export function ItemManager`)
- [ ] All props from `ItemManagerProps` interface are destructured
- [ ] Default values are set for `loading` and `error`
- [ ] Config merging uses `useMemo` for memoization
- [ ] Multi-property mode auto-enables when `properties` prop is provided
- [ ] TypeScript compilation succeeds with full type checking

#### Acceptance Criteria

- Component signature matches the `ItemManagerProps` interface exactly
- Config merging is properly memoized
- Multi-property mode correctly auto-enables based on `properties` prop

---

### Task 1.3.4: Integrate State Management Hook and Create Action Helpers

**Estimated Effort:** ~1 hour
**Story Points:** 1

#### Description

Call the `useItemManagerState` hook, destructure all state and dispatchers, create the debug logging helper, and implement the `createItemActions` factory function.

#### Implementation Steps

1. **Add State Management section** after Config Merging

2. **Call `useItemManagerState` hook** with `effectiveConfig`:
   - Destructure `state` object
   - Destructure all action dispatchers: `setViewMode`, `setSearchQuery`, `setFilters`, `clearFilters`, `setSort`, `selectItem`, `deselectItem`, `toggleItemSelection`, `selectAll`, `clearSelection`, `toggleSelectionMode`, `openPreview`, `closePreview`, `openAssetPanel`, `closeAssetPanel`, `toggleFilterPanel`, `startInlineEdit`, `endInlineEdit`
   - Destructure computed values: `selectedCount`, `hasSelection`, `hasFilters`, `isItemSelected`

3. **Add Debug Helper section**

4. **Create `debugLog` function** using `useCallback`:
   - Log messages prefixed with `[ItemManager]`
   - Only log in development environment
   - Empty dependency array (no reactive dependencies needed)

5. **Add Item Actions Factory section**

6. **Create `createItemActions` function** using `useCallback`:
   - Accept `ItemRecord` as parameter
   - Return `ItemActions` interface object with all action methods
   - Connect each action to the appropriate parent callback or state dispatcher
   - Include `isSelected` computed property

#### Code Template

```typescript
  // -------------------------------------------------------------------------
  // State Management
  // -------------------------------------------------------------------------

  const {
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
  } = useItemManagerState(effectiveConfig);

  // -------------------------------------------------------------------------
  // Debug Helper
  // -------------------------------------------------------------------------

  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (process.env.NODE_ENV === 'development') {
        // Uncomment for debug: console.log('[ItemManager]', ...args);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // Item Actions Factory
  // -------------------------------------------------------------------------

  const createItemActions = useCallback(
    (item: ItemRecord): ItemActions => ({
      edit: () => {
        debugLog('Edit item:', item.id);
        onEditItem(item);
      },
      delete: () => {
        debugLog('Delete item:', item.id);
        onDeleteItems([item.id]);
      },
      duplicate: () => {
        debugLog('Duplicate item:', item.id);
        onDuplicateItem?.(item);
      },
      manageAssets: () => {
        debugLog('Manage assets for:', item.id);
        if (effectiveConfig.enableAssetManagement) {
          openAssetPanel(item);
        }
      },
      select: () => {
        debugLog('Select item:', item.id);
        selectItem(item.id);
      },
      deselect: () => {
        debugLog('Deselect item:', item.id);
        deselectItem(item.id);
      },
      isSelected: isItemSelected(item.id),
    }),
    [
      debugLog,
      onEditItem,
      onDeleteItems,
      onDuplicateItem,
      effectiveConfig.enableAssetManagement,
      openAssetPanel,
      selectItem,
      deselectItem,
      isItemSelected,
    ]
  );
```

#### Verification Steps

- [ ] `useItemManagerState` hook is called with `effectiveConfig`
- [ ] All state values and dispatchers from hook are destructured
- [ ] `debugLog` function uses `useCallback` with empty dependency array
- [ ] `createItemActions` returns object conforming to `ItemActions` interface
- [ ] All dependencies in `useCallback` arrays are correct
- [ ] Optional callbacks use optional chaining (`onDuplicateItem?.(item)`)
- [ ] TypeScript compilation succeeds

#### Acceptance Criteria

- State hook is properly initialized with config
- All state and actions are accessible within component
- Action factory creates correct `ItemActions` objects for any item
- Debug logging is only active in development mode

---

### Task 1.3.5: Implement Selection Change Effect

**Estimated Effort:** ~20 minutes
**Story Points:** 0.25

#### Description

Add a `useEffect` hook to notify the parent component when the selection state changes via the `onSelectionChange` callback.

#### Implementation Steps

1. **Add Effects section** after Item Actions Factory

2. **Create useEffect** for selection change notification:
   - Check if `onSelectionChange` callback exists
   - Convert `state.selectedIds` Set to array
   - Call `onSelectionChange` with the array
   - Add debug logging for selection changes
   - Dependencies: `[state.selectedIds, onSelectionChange, debugLog]`

#### Code Template

```typescript
  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedArray = Array.from(state.selectedIds);
      debugLog('Selection changed:', selectedArray);
      onSelectionChange(selectedArray);
    }
  }, [state.selectedIds, onSelectionChange, debugLog]);
```

#### Verification Steps

- [ ] `useEffect` only fires when `state.selectedIds` changes
- [ ] `onSelectionChange` is only called when the callback exists
- [ ] Set is converted to array using `Array.from()`
- [ ] Dependency array includes all reactive values
- [ ] TypeScript compilation succeeds

#### Acceptance Criteria

- Parent is notified whenever selection changes
- No effect runs if `onSelectionChange` prop is not provided
- Selection IDs are passed as an array (not a Set)

---

### Task 1.3.6: Implement Content Rendering Function

**Estimated Effort:** ~1 hour
**Story Points:** 1

#### Description

Create the memoized `renderContent` function that handles loading, error, empty, and items display states with support for custom render props.

#### Implementation Steps

1. **Add Render Functions section** after Effects

2. **Create `renderContent` using `useMemo`**:

3. **Implement loading state handling**:
   - Check if `loading` is true
   - If `renderLoadingState` prop exists, call and return it
   - Otherwise, return default loading UI with className override support

4. **Implement error state handling**:
   - Check if `error` is not null
   - If `renderErrorState` prop exists, call with error and return
   - Otherwise, return default error UI showing `error.message`

5. **Implement empty state handling**:
   - Check if `items.length === 0`
   - If `renderEmptyState` prop exists, call and return it
   - Otherwise, return default empty state using labels from config

6. **Implement items display placeholder**:
   - Return placeholder div with item count and view mode info
   - Apply appropriate className based on `state.viewMode`
   - Include placeholder text for future Grid/List components

7. **Set dependency array** including all reactive values used in the function

#### Code Template

```typescript
  // -------------------------------------------------------------------------
  // Render Functions
  // -------------------------------------------------------------------------

  const renderContent = useMemo(() => {
    // Loading state
    if (loading) {
      if (renderLoadingState) {
        return renderLoadingState();
      }
      return (
        <div className={cn('flex items-center justify-center py-12', classNames?.loadingState)}>
          <div className="text-gray-500">Loading items...</div>
        </div>
      );
    }

    // Error state
    if (error) {
      if (renderErrorState) {
        return renderErrorState(error);
      }
      return (
        <div className={cn('flex items-center justify-center py-12', classNames?.emptyState)}>
          <div className="text-red-500">Error: {error.message}</div>
        </div>
      );
    }

    // Empty state
    if (items.length === 0) {
      if (renderEmptyState) {
        return renderEmptyState();
      }
      return (
        <div className={cn('flex flex-col items-center justify-center py-12', classNames?.emptyState)}>
          <div className="text-lg font-medium text-gray-900">
            {effectiveConfig.labels.emptyStateTitle}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {effectiveConfig.labels.emptyStateDescription}
          </div>
        </div>
      );
    }

    // Items display placeholder (Grid/List views implemented in Task 1.6)
    return (
      <div className={cn(
        'flex-1 p-4',
        state.viewMode === 'grid' ? classNames?.itemGrid : classNames?.itemList
      )}>
        <div className="text-gray-500 text-center border-2 border-dashed border-gray-200 rounded-lg py-8">
          <div className="font-medium">{items.length} items</div>
          <div className="text-sm mt-1">View mode: {state.viewMode}</div>
          <div className="text-xs mt-2 text-gray-400">
            Grid/List components will be added in Tasks 1.4-1.6
          </div>
        </div>
      </div>
    );
  }, [
    loading,
    error,
    items,
    state.viewMode,
    effectiveConfig.labels,
    renderLoadingState,
    renderErrorState,
    renderEmptyState,
    classNames,
  ]);
```

#### Verification Steps

- [ ] Loading state renders correctly when `loading=true`
- [ ] Custom `renderLoadingState` is used when provided
- [ ] Error state renders correctly when `error` is not null
- [ ] Custom `renderErrorState` is used when provided
- [ ] Empty state renders correctly when `items.length === 0`
- [ ] Custom `renderEmptyState` is used when provided
- [ ] Items placeholder renders correct count and view mode
- [ ] All className overrides are applied via `cn()` utility
- [ ] `useMemo` dependency array includes all reactive values

#### Acceptance Criteria

- All four states (loading, error, empty, items) render appropriately
- Custom render props override default rendering when provided
- className overrides are applied to all sections
- Content is memoized for performance

---

### Task 1.3.7: Implement Main Layout JSX Structure

**Estimated Effort:** ~1.5 hours
**Story Points:** 1.5

#### Description

Create the main JSX return statement with the complete layout structure including toolbar area, content area, bulk actions bar, preview modal placeholder, and asset panel placeholder.

#### Implementation Steps

1. **Add Main Render section** comment

2. **Create the return statement** with main container div:
   - Apply flex-col layout with full height
   - Apply white background
   - Support `classNames?.container` override

3. **Implement Toolbar Area**:
   - Create toolbar div with bottom border
   - If `renderToolbar` prop exists, call with `ToolbarRenderProps` object
   - Otherwise, render default placeholder toolbar with:
     - Item count display (plural handling)
     - Filter indicator when `hasFilters` is true
     - View toggle buttons (Grid/List) when `allowViewToggle` is enabled
     - Active view mode highlighting

4. **Implement Main Content Area**:
   - Create scrollable container div with `flex-1` and `overflow-y-auto`
   - Render the memoized `renderContent`

5. **Implement Bulk Actions Bar (Phase 3 placeholder)**:
   - Only render when `enableBulkActions` is true AND `hasSelection` is true
   - Create fixed position bar at bottom center
   - Display selection count
   - Add clear selection button
   - Style with dark background and rounded corners

6. **Implement Preview Modal placeholder (Phase 4)**:
   - Only render when `state.previewItem` is not null
   - If `renderItemPreview` prop exists, use it
   - Otherwise, render default modal with:
     - Semi-transparent backdrop (closes on click)
     - Centered white card with item title
     - Close button
     - Placeholder text for future implementation

7. **Implement Asset Panel placeholder (Phase 5)**:
   - Only render when `state.assetPanelItem` is not null
   - Create slide-in drawer from right
   - Include header with title and close button
   - Include placeholder text for future implementation

#### Code Template

```typescript
  // -------------------------------------------------------------------------
  // Main Render
  // -------------------------------------------------------------------------

  return (
    <div className={cn('flex flex-col h-full bg-white', classNames?.container)}>
      {/* Toolbar Area */}
      <div className={cn('border-b border-gray-200', classNames?.toolbar)}>
        {renderToolbar ? (
          renderToolbar({
            viewMode: state.viewMode,
            onViewModeChange: setViewMode,
            searchQuery: state.searchQuery,
            onSearchChange: setSearchQuery,
            filters: state.filters,
            onFiltersChange: setFilters,
            onClearFilters: clearFilters,
            sortBy: state.sortBy,
            onSortChange: setSort,
            selectedCount,
            hasFilters,
            isFilterPanelOpen: state.isFilterPanelOpen,
            onToggleFilterPanel: toggleFilterPanel,
            config: effectiveConfig,
          })
        ) : (
          // Default toolbar placeholder
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''}
              {hasFilters && ' (filtered)'}
            </div>
            {effectiveConfig.allowViewToggle && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'px-2 py-1 text-sm rounded',
                    state.viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-2 py-1 text-sm rounded',
                    state.viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  )}
                >
                  List
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent}
      </div>

      {/* Bulk Actions Bar (Phase 3) */}
      {effectiveConfig.enableBulkActions && hasSelection && (
        <div className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2',
          'bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg',
          'flex items-center gap-4'
        )}>
          <span>{selectedCount} selected</span>
          <button
            onClick={clearSelection}
            className="text-sm underline hover:no-underline"
          >
            Clear
          </button>
          {/* More bulk actions added in Phase 3 */}
        </div>
      )}

      {/* Preview Modal placeholder (Phase 4) */}
      {state.previewItem && (
        <div className={cn('fixed inset-0 z-50', classNames?.previewModal)}>
          {renderItemPreview ? (
            renderItemPreview(state.previewItem)
          ) : (
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closePreview}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold">{state.previewItem.title}</h2>
                  <button onClick={closePreview} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Preview content will be implemented in Phase 4
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Panel placeholder (Phase 5) */}
      {state.assetPanelItem && (
        <div className={cn('fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-40', classNames?.assetPanel)}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Manage Assets</h3>
            <button onClick={closeAssetPanel} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="p-4 text-sm text-gray-500">
            Asset panel will be implemented in Phase 5
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Verification Steps

- [ ] Main container has flex-col layout with full height
- [ ] Toolbar renders custom or default version
- [ ] Default toolbar shows correct item count with plural handling
- [ ] View toggle buttons work and show active state
- [ ] Content area is scrollable
- [ ] Bulk actions bar only appears when items are selected
- [ ] Preview modal only appears when `previewItem` is set
- [ ] Preview modal backdrop closes modal on click
- [ ] Preview modal content doesn't close modal on click (stopPropagation)
- [ ] Asset panel only appears when `assetPanelItem` is set
- [ ] All className overrides are applied correctly
- [ ] TypeScript compilation succeeds

#### Acceptance Criteria

- Complete layout structure is rendered
- All UI sections support className customization
- Conditional rendering works correctly for all overlay elements
- Render props work correctly when provided
- Default placeholders indicate future implementation phases

---

### Task 1.3.8: Add Default Export and Update Barrel Exports

**Estimated Effort:** ~20 minutes
**Story Points:** 0.25

#### Description

Add a default export at the bottom of the component file and update the `index.ts` barrel file to export the `ItemManager` component.

#### Implementation Steps

1. **Add default export** at the end of `ItemManager.tsx`:
   ```typescript
   export default ItemManager;
   ```

2. **Update `src/components/ItemManager/index.ts`**:
   - Add named export for `ItemManager` component
   - Add type export for `ItemManagerProps`
   - Ensure existing exports are preserved

#### Code to Add to index.ts

```typescript
// =============================================================================
// Main Component Export
// =============================================================================

export { ItemManager } from './ItemManager';
export type { ItemManagerProps } from './ItemManager.types';
```

#### Verification Steps

- [ ] `ItemManager` has both named and default exports in component file
- [ ] `index.ts` exports `ItemManager` component
- [ ] `index.ts` exports `ItemManagerProps` type
- [ ] Existing exports in `index.ts` are preserved
- [ ] Import from `@/components/ItemManager` works correctly

#### Acceptance Criteria

- Component can be imported as named or default export
- Types are properly exported from barrel file
- No breaking changes to existing exports

---

### Task 1.3.9: Verify Build and TypeScript Compilation

**Estimated Effort:** ~30 minutes
**Story Points:** 0.5

#### Description

Run full TypeScript compilation and build process to verify the component integrates correctly with the codebase.

#### Implementation Steps

1. **Run TypeScript type check**:
   ```bash
   npx tsc --noEmit
   ```

2. **Run Next.js build**:
   ```bash
   npm run build
   ```

3. **Fix any type errors** that arise:
   - Check import paths
   - Verify interface conformance
   - Fix any missing or incorrect types

4. **Verify no unused variables** or imports:
   - Remove any commented-out code
   - Remove any unused imports

5. **Run linter** (if configured):
   ```bash
   npm run lint
   ```

#### Verification Checklist

- [ ] `npx tsc --noEmit` completes with no errors
- [ ] `npm run build` completes successfully
- [ ] No unused variable warnings
- [ ] No import resolution errors
- [ ] Linter passes (if configured)

#### Acceptance Criteria

- Full project builds successfully
- No TypeScript errors in the new component
- No regressions in existing code

---

### Task 1.3.10: Create Basic Usage Test

**Estimated Effort:** ~45 minutes
**Story Points:** 0.5

#### Description

Create a minimal test case to verify the component renders correctly with required props and handles all basic states.

#### Implementation Steps

1. **Create test file** or update existing test harness at `src/app/test/item-manager/page.tsx` (if exists)

2. **Test basic rendering** with minimal required props:
   - Empty items array
   - Required callbacks (can be no-ops)

3. **Test loading state**:
   - Pass `loading={true}`
   - Verify loading UI appears

4. **Test error state**:
   - Pass `error={new Error('Test error')}`
   - Verify error UI appears

5. **Test with items**:
   - Create mock `ItemRecord` array
   - Verify item count displays correctly

6. **Test view toggle**:
   - Click Grid/List buttons
   - Verify view mode changes

7. **Log all callback invocations** to console for manual verification

#### Minimal Test Code

```tsx
// Can be added to existing test harness or new test page
import { ItemManager } from '@/components/ItemManager';
import type { ItemRecord } from '@/components/ItemCapture';

const mockItems: ItemRecord[] = [
  {
    id: '1',
    title: 'Test Item 1',
    contentType: 'media',
    media: [],
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Test Item 2',
    location: 'Kitchen',
    contentType: 'text-only',
    media: [],
    createdAt: new Date(),
  },
];

export default function TestItemManagerShell() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">ItemManager Shell Test</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Empty State</h2>
        <div className="border rounded h-64">
          <ItemManager
            items={[]}
            onEditItem={(item) => console.log('Edit:', item.id)}
            onDeleteItems={(ids) => console.log('Delete:', ids)}
            onUpdateItem={(item) => console.log('Update:', item.id)}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">With Items</h2>
        <div className="border rounded h-64">
          <ItemManager
            items={mockItems}
            onEditItem={(item) => console.log('Edit:', item.id)}
            onDeleteItems={(ids) => console.log('Delete:', ids)}
            onUpdateItem={(item) => console.log('Update:', item.id)}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Loading State</h2>
        <div className="border rounded h-64">
          <ItemManager
            items={[]}
            loading={true}
            onEditItem={(item) => console.log('Edit:', item.id)}
            onDeleteItems={(ids) => console.log('Delete:', ids)}
            onUpdateItem={(item) => console.log('Update:', item.id)}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Error State</h2>
        <div className="border rounded h-64">
          <ItemManager
            items={[]}
            error={new Error('Failed to load items')}
            onEditItem={(item) => console.log('Edit:', item.id)}
            onDeleteItems={(ids) => console.log('Delete:', ids)}
            onUpdateItem={(item) => console.log('Update:', item.id)}
          />
        </div>
      </section>
    </div>
  );
}
```

#### Verification Checklist

- [ ] Empty state displays correctly
- [ ] Loading state displays correctly
- [ ] Error state displays error message
- [ ] Items state shows correct count
- [ ] View toggle buttons work
- [ ] Callbacks are invoked (check console)
- [ ] No console errors during rendering

#### Acceptance Criteria

- Component renders in all states without errors
- Basic interactivity works (view toggle)
- All required callbacks are properly connected

---

## Summary

| Task | Description | Estimated Effort | Story Points |
|------|-------------|------------------|--------------|
| 1.3.1 | Create file with header and imports | ~30 min | 0.5 |
| 1.3.2 | Implement default configuration constants | ~30 min | 0.5 |
| 1.3.3 | Create component function signature | ~45 min | 0.5 |
| 1.3.4 | Integrate state hook and create action helpers | ~1 hour | 1 |
| 1.3.5 | Implement selection change effect | ~20 min | 0.25 |
| 1.3.6 | Implement content rendering function | ~1 hour | 1 |
| 1.3.7 | Implement main layout JSX structure | ~1.5 hours | 1.5 |
| 1.3.8 | Add exports and update barrel file | ~20 min | 0.25 |
| 1.3.9 | Verify build and TypeScript compilation | ~30 min | 0.5 |
| 1.3.10 | Create basic usage test | ~45 min | 0.5 |
| **Total** | | **~7-8 hours** | **6.5** |

---

## Dependencies Diagram

```
Task 1.3.1 (File + Imports)
     │
     ▼
Task 1.3.2 (Config Constants)
     │
     ▼
Task 1.3.3 (Component Signature)
     │
     ▼
Task 1.3.4 (State + Actions)
     │
     ├──────────────────┐
     ▼                  ▼
Task 1.3.5          Task 1.3.6
(Selection Effect)  (Render Content)
     │                  │
     └────────┬─────────┘
              ▼
       Task 1.3.7 (Main Layout)
              │
              ▼
       Task 1.3.8 (Exports)
              │
              ▼
       Task 1.3.9 (Build Verification)
              │
              ▼
       Task 1.3.10 (Usage Test)
```

---

## Post-Implementation Checklist

### Component Structure
- [ ] `'use client'` directive is present
- [ ] Module documentation with @module and @see tags
- [ ] Imports organized by category
- [ ] Component function accepts `ItemManagerProps`
- [ ] Component has named and default exports

### Config Handling
- [ ] `DEFAULT_CONFIG` constant defined with all values
- [ ] `mergeConfig` helper correctly merges configs
- [ ] Multi-property mode auto-enables when properties provided

### State Integration
- [ ] `useItemManagerState` hook called with config
- [ ] All state values and dispatchers accessible
- [ ] `createItemActions` factory creates correct objects
- [ ] Selection changes trigger parent callback

### Layout Structure
- [ ] Main container with flex-col layout
- [ ] Toolbar area (custom or default)
- [ ] Content area (loading/error/empty/items)
- [ ] Bulk actions bar (when selected)
- [ ] Preview modal placeholder
- [ ] Asset panel placeholder

### ClassName Overrides
- [ ] All major sections support className override
- [ ] `cn()` utility used consistently

### Compilation
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No unused variables

---

## References

- **Overview Document:** `docs/REQ-057-build-basic-itemmanager-shell-overview.md`
- **Implementation Plan:** `docs/prd/item-capture-manager-implementation-plan.md`
- **Pattern Reference:** `src/components/ItemCapture/ItemCapture.tsx`
- **Layout Pattern:** `src/components/ItemCapture/components/CaptureWizard.tsx`
- **Utility Reference:** `src/lib/utils.ts`

---

## Implementation Notes (2026-01-03)

### Completed Tasks

All 10 tasks completed successfully:

| Task | Status | Notes |
|------|--------|-------|
| 1.3.1 | [x] DONE | Created ItemManager.tsx with 'use client' directive, JSDoc, and imports |
| 1.3.2 | [x] DONE | Implemented DEFAULT_CONFIG and mergeConfig helper |
| 1.3.3 | [x] DONE | Created component signature with all props destructured |
| 1.3.4 | [x] DONE | Integrated useItemManagerState hook and createItemActions factory |
| 1.3.5 | [x] DONE | Implemented selection change effect with useEffect |
| 1.3.6 | [x] DONE | Implemented renderContent with loading/error/empty/items states |
| 1.3.7 | [x] DONE | Implemented main layout with toolbar, content, bulk bar, preview, asset panel |
| 1.3.8 | [x] DONE | Added exports to index.ts barrel file |
| 1.3.9 | [x] DONE | Build verified - npm run build passes |
| 1.3.10 | [x] DONE | Created test page at /test/item-manager |

### Files Created/Modified

- **Created:** `src/components/ItemManager/ItemManager.tsx` - Main component (422 lines)
- **Created:** `src/app/test/item-manager/page.tsx` - Test harness page
- **Modified:** `src/components/ItemManager/index.ts` - Added ItemManager export
- **Modified:** `src/components/ItemManager/ItemManager.types.ts` - Extended ToolbarRenderProps

### Type Extensions

Added missing properties to `ToolbarRenderProps` interface:
- `hasFilters: boolean`
- `isFilterPanelOpen: boolean`
- `onToggleFilterPanel: () => void`
- `config: Required<ItemManagerConfig>`

### Testing

Test page available at: `/test/item-manager`
- Tests empty, loading, error, and items states
- Tests view mode toggle (Grid/List)
- Logs callback invocations to console
