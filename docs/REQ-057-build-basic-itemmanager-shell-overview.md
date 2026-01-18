# Task 1.3: Build Basic ItemManager Shell - Implementation Overview

*Generated: 2026-01-03 18:45:00*
*Last Modified: 2026-01-03 18:45:00*

## Reference
- **Implementation Plan**: docs/prd/item-capture-manager-implementation-plan.md
- **Type**: New Feature (Core Component)
- **Phase**: 1 - Foundation
- **Task ID**: 1.3
- **Size**: M

---

## Overview

This document provides a detailed implementation breakdown for creating the basic `ItemManager.tsx` shell component - the main orchestrator that wires up props to state, implements basic layout structure, and handles config defaults.

### Purpose

The `ItemManager.tsx` component serves as the primary entry point for the item management interface, responsible for:

- Receiving items, callbacks, and configuration from parent
- Initializing and consuming the `useItemManagerState` hook
- Providing default configuration values
- Rendering the basic layout structure (toolbar, content area, panels)
- Passing state and callbacks to child components
- Handling render prop customization

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 1.1 - Directory Structure & Types | **Required** | `ItemManager.types.ts` must exist with all interfaces |
| Task 1.2 - State Management Hook | **Required** | `useItemManagerState` hook must be implemented |
| ItemCapture component types | **Required** | `ItemRecord`, `MediaItem` types must be available |

### Dependents (Blocked by this task)

- Task 1.4 - ItemCard Component
- Task 1.5 - ItemRow Component
- Task 1.6 - Grid and List Views
- Task 1.7 - Empty and Loading States
- All Phase 2-6 tasks

---

## Technical Approach

### Pattern Selection: Orchestrator Component

Based on the existing ItemCapture component pattern (`src/components/ItemCapture/ItemCapture.tsx`), this implementation follows the "props in, callbacks out" architecture:

1. **Props Input**: Receives `items`, `onEditItem`, `onDeleteItems`, `onUpdateItem`, `config`, and render customization props
2. **State Management**: Consumes `useItemManagerState` hook for internal UI state
3. **Callback Wiring**: Connects parent callbacks to child component interactions
4. **Layout Rendering**: Provides basic layout structure for toolbar, content, and panels

### Existing Patterns to Follow

| Pattern | Source File | How to Apply |
|---------|-------------|--------------|
| `'use client'` directive | `src/components/ItemCapture/ItemCapture.tsx:1` | Required for React hooks |
| Module documentation | `src/components/ItemCapture/ItemCapture.tsx:3-9` | JSDoc with @module and @see |
| Organized imports | `src/components/ItemCapture/ItemCapture.tsx:11-30` | Group by React, utilities, hooks, components, types |
| Debug logging helper | `src/components/ItemCapture/ItemCapture.tsx:70-78` | Conditional console logging |
| Memoized render functions | `src/components/ItemCapture/ItemCapture.tsx:195-270` | useMemo for step/view rendering |
| cn() utility for classes | `src/lib/utils.ts` | Class name merging with tailwind-merge |
| Layout pattern | `src/components/ItemCapture/components/CaptureWizard.tsx` | flex-col with fixed header/footer |

---

## Component Architecture

### Props Interface (From ItemManager.types.ts)

```typescript
export interface ItemManagerProps {
  // Required data
  items: ItemRecord[];

  // Optional data
  properties?: Property[];
  loading?: boolean;
  error?: Error | null;

  // Required callbacks
  onEditItem: (item: ItemRecord) => void;
  onDeleteItems: (ids: string[]) => void;
  onUpdateItem: (item: ItemRecord) => void;

  // Optional callbacks
  onAddAssets?: (itemId: string, assets: File[]) => void;
  onRemoveAssets?: (itemId: string, assetIds: string[]) => void;
  onReorderAssets?: (itemId: string, orderedIds: string[]) => void;
  onDuplicateItem?: (item: ItemRecord) => void;
  onSelectionChange?: (selectedIds: string[]) => void;

  // Configuration
  config?: ItemManagerConfig;

  // Render customization
  renderItem?: (item: ItemRecord, actions: ItemActions) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  renderLoadingState?: () => React.ReactNode;
  renderErrorState?: (error: Error) => React.ReactNode;
  renderToolbar?: (props: ToolbarRenderProps) => React.ReactNode;
  renderItemPreview?: (item: ItemRecord) => React.ReactNode;
  renderConfirmDialog?: (props: ConfirmDialogProps) => React.ReactNode;

  // Styling
  classNames?: ItemManagerClassNames;
}
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        ItemManager                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    TOOLBAR AREA                          │    │
│  │  (Search, Filters, Sort, View Toggle)                    │    │
│  │  → Placeholder in Task 1.3, implemented in Phase 2       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CONTENT AREA                          │    │
│  │                                                          │    │
│  │  - Loading State (when loading=true)                     │    │
│  │  - Error State (when error != null)                      │    │
│  │  - Empty State (when items.length === 0)                 │    │
│  │  - Item Grid or List (based on viewMode)                 │    │
│  │    → Placeholder in Task 1.3, implemented in 1.4-1.6     │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              BULK ACTIONS BAR (Floating)                 │    │
│  │  → Shown when hasSelection=true                          │    │
│  │  → Placeholder in Task 1.3, implemented in Phase 3       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────────────────────┐    │
│  │ Preview Modal    │  │ Asset Panel (Drawer)              │    │
│  │ → Phase 4        │  │ → Phase 5                         │    │
│  └──────────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

### Step 1: Create Basic Component File (15 min)

**File:** `src/components/ItemManager/ItemManager.tsx`

**Deliverables:**
- [ ] Add `'use client'` directive at top
- [ ] Add module documentation with @module and @see tags
- [ ] Import React utilities (useCallback, useMemo)
- [ ] Import types from `./ItemManager.types`
- [ ] Import `useItemManagerState` hook
- [ ] Import `cn` utility from `@/lib/utils`
- [ ] Define component function signature with `ItemManagerProps`

**Template:**
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

### Step 2: Implement Config Defaults (15 min)

**File:** `src/components/ItemManager/ItemManager.tsx`

**Deliverables:**
- [ ] Create `DEFAULT_CONFIG` constant with all default values
- [ ] Create `mergeConfig` helper function
- [ ] Apply merged config throughout component

**Default Configuration (From Implementation Plan Appendix C):**
```typescript
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

const mergeConfig = (config?: ItemManagerConfig): Required<ItemManagerConfig> => ({
  ...DEFAULT_CONFIG,
  ...config,
  labels: {
    ...DEFAULT_CONFIG.labels,
    ...config?.labels,
  },
});
```

### Step 3: Wire Props to State Hook (20 min)

**File:** `src/components/ItemManager/ItemManager.tsx`

**Deliverables:**
- [ ] Call `useItemManagerState` with merged config
- [ ] Destructure state and action dispatchers from hook
- [ ] Create debug logging helper (conditional on config.debug)
- [ ] Wire `onSelectionChange` prop to selection state changes

**State Hook Integration:**
```typescript
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
  // Merge user config with defaults
  const config = useMemo(() => mergeConfig(userConfig), [userConfig]);

  // Enable multi-property mode if properties are provided
  const effectiveConfig = useMemo(() => ({
    ...config,
    multiPropertyMode: config.multiPropertyMode || (properties && properties.length > 0),
  }), [config, properties]);

  // Initialize state management
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

  // Debug logging helper
  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (effectiveConfig.labels && 'debug' in effectiveConfig && (effectiveConfig as { debug?: boolean }).debug) {
        console.log('[ItemManager]', ...args);
      }
    },
    [effectiveConfig]
  );
```

### Step 4: Create Item Actions Factory (15 min)

**File:** `src/components/ItemManager/ItemManager.tsx`

**Deliverables:**
- [ ] Create `createItemActions` helper function
- [ ] Return `ItemActions` interface for each item
- [ ] Connect actions to parent callbacks and state dispatchers

**Item Actions Factory:**
```typescript
  // Create item actions for render prop pattern
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

### Step 5: Implement Selection Change Effect (10 min)

**File:** `src/components/ItemManager/ItemManager.tsx`

**Deliverables:**
- [ ] Add useEffect to notify parent of selection changes
- [ ] Convert Set to array for callback

**Selection Change Notification:**
```typescript
  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedArray = Array.from(state.selectedIds);
      debugLog('Selection changed:', selectedArray);
      onSelectionChange(selectedArray);
    }
  }, [state.selectedIds, onSelectionChange, debugLog]);
```

### Step 6: Implement Basic Layout Structure (30 min)

**File:** `src/components/ItemManager/ItemManager.tsx`

**Deliverables:**
- [ ] Create main container with flex layout
- [ ] Add toolbar placeholder area
- [ ] Add main content area with conditional rendering
- [ ] Add bulk actions bar placeholder (shown when hasSelection)
- [ ] Apply className overrides from props

**Layout Implementation:**
```typescript
  // Render content based on state
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
        'flex-1',
        state.viewMode === 'grid' ? classNames?.itemGrid : classNames?.itemList
      )}>
        {/* ItemGrid or ItemList will be rendered here in Task 1.6 */}
        <div className="p-4 text-gray-500 text-center">
          {items.length} items ({state.viewMode} view)
          {/* Placeholder for Grid/List rendering */}
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
          // Default toolbar placeholder (Phase 2)
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
            // Default preview modal (Phase 4)
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

### Step 7: Update Barrel Export (5 min)

**File:** `src/components/ItemManager/index.ts`

**Deliverables:**
- [ ] Add export for `ItemManager` component
- [ ] Ensure types are still exported

**Export Update:**
```typescript
// Add to existing exports
export { ItemManager } from './ItemManager';
export type { ItemManagerProps } from './ItemManager.types';
```

---

## Authorized Files and Functions for Modification

### Files to Create

#### `/src/components/ItemManager/ItemManager.tsx`
- **Purpose**: Main orchestrator component for ItemManager
- **Exports**:
  - `ItemManager` - Named export of main component
- **Functions**:
  - `ItemManager` - Main React component function
  - `mergeConfig` - Helper to merge user config with defaults
  - `DEFAULT_CONFIG` - Constant with default configuration values
- **Dependencies**:
  - `react` - `useCallback`, `useMemo`, `useEffect`
  - `@/lib/utils` - `cn` utility
  - `./hooks/useItemManagerState` - State management hook
  - `./ItemManager.types` - Type imports
  - `@/components/ItemCapture` - `ItemRecord` type

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/index.ts` | Add `ItemManager` component export |

### Existing Files (Read-Only Reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/ItemCapture.tsx` | Pattern for component structure, props handling |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Layout pattern reference |
| `src/components/ItemManager/hooks/useItemManagerState.ts` | State hook to consume |
| `src/components/ItemManager/ItemManager.types.ts` | Type definitions |
| `src/lib/utils.ts` | `cn()` utility function |

---

## Technical Specifications

### Config Merging Strategy

The component uses a two-level merge for configuration:

1. **Top-level merge**: Spread defaults, then user config
2. **Labels sub-object**: Separate merge for nested labels

```typescript
const mergeConfig = (config?: ItemManagerConfig): Required<ItemManagerConfig> => ({
  ...DEFAULT_CONFIG,
  ...config,
  labels: {
    ...DEFAULT_CONFIG.labels,
    ...config?.labels,
  },
});
```

### Multi-Property Mode Auto-Enable

If `properties` prop is provided with items, `multiPropertyMode` is automatically enabled:

```typescript
const effectiveConfig = useMemo(() => ({
  ...config,
  multiPropertyMode: config.multiPropertyMode || (properties && properties.length > 0),
}), [config, properties]);
```

### ClassName Override Pattern

Every major section supports className override via the `classNames` prop:

```typescript
<div className={cn('default-classes', classNames?.container)}>
```

This allows parent components to customize styling while preserving base functionality.

### Render Props Pattern

The component supports custom rendering for key sections:

| Render Prop | Purpose | Default Behavior |
|-------------|---------|------------------|
| `renderToolbar` | Custom toolbar UI | Basic view toggle and item count |
| `renderEmptyState` | Custom empty message | Title + description from labels |
| `renderLoadingState` | Custom loading UI | "Loading items..." text |
| `renderErrorState` | Custom error UI | Red error message |
| `renderItemPreview` | Custom preview modal | Basic modal with title |
| `renderItem` | Custom item rendering | Used by ItemCard/ItemRow (Phase 1.4-1.5) |
| `renderConfirmDialog` | Custom confirmation | Used by delete operations (Phase 3) |

---

## Success Validation Checklist

### Component Structure
- [ ] `'use client'` directive is present
- [ ] Module documentation with @module and @see tags
- [ ] Imports organized by category (React, utilities, hooks, types)
- [ ] Component function accepts `ItemManagerProps`
- [ ] Component has named export

### Config Handling
- [ ] `DEFAULT_CONFIG` constant defined with all default values
- [ ] `mergeConfig` helper correctly merges user config
- [ ] Multi-property mode auto-enables when properties provided
- [ ] All config values accessible throughout component

### State Integration
- [ ] `useItemManagerState` hook called with merged config
- [ ] All state values destructured from hook
- [ ] All action dispatchers destructured from hook
- [ ] `createItemActions` factory creates correct `ItemActions` objects
- [ ] Selection changes trigger `onSelectionChange` callback

### Layout Structure
- [ ] Main container with `flex flex-col` layout
- [ ] Toolbar area renders (custom or default)
- [ ] Content area renders based on state (loading/error/empty/items)
- [ ] Bulk actions bar shows when items selected
- [ ] Preview modal renders when `previewItem` is set
- [ ] Asset panel renders when `assetPanelItem` is set

### ClassName Overrides
- [ ] Container supports `classNames.container`
- [ ] Toolbar supports `classNames.toolbar`
- [ ] Grid/List areas support respective classNames
- [ ] Empty state supports `classNames.emptyState`
- [ ] Loading state supports `classNames.loadingState`
- [ ] Preview modal supports `classNames.previewModal`
- [ ] Asset panel supports `classNames.assetPanel`

### Render Props
- [ ] `renderToolbar` works when provided
- [ ] `renderEmptyState` works when provided
- [ ] `renderLoadingState` works when provided
- [ ] `renderErrorState` works when provided
- [ ] `renderItemPreview` works when provided

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused variables or imports
- [ ] No type mismatches

---

## Estimated Effort

| Step | Estimate | Complexity |
|------|----------|------------|
| Step 1: Create Basic Component File | 15 min | Low |
| Step 2: Implement Config Defaults | 15 min | Low |
| Step 3: Wire Props to State Hook | 20 min | Medium |
| Step 4: Create Item Actions Factory | 15 min | Low |
| Step 5: Implement Selection Change Effect | 10 min | Low |
| Step 6: Implement Basic Layout Structure | 30 min | Medium |
| Step 7: Update Barrel Export | 5 min | Low |
| **Total** | **~2 hours** | Low-Medium |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type mismatches between types file and implementation | Medium | Medium | Reference types file constantly; run type check frequently |
| Missing hook exports | Low | Medium | Verify index.ts exports before starting |
| Layout issues on different screen sizes | Low | Low | Use existing Tailwind responsive patterns |
| Circular dependency issues | Low | Medium | Keep imports unidirectional (types → hooks → component) |

---

## Code Standards

### Naming Conventions
- Use camelCase for functions and variables
- Use PascalCase for components and types
- Prefix internal helpers with meaningful names (e.g., `mergeConfig`, `createItemActions`)

### Documentation
- JSDoc module comment at file top
- @see references to related documentation
- @lastModified timestamp
- Inline comments for complex logic only

### File Structure
```typescript
'use client';

/**
 * Module documentation
 * @module ...
 * @see ...
 * @lastModified ...
 */

// =============================================================================
// Imports
// =============================================================================

// =============================================================================
// Constants
// =============================================================================

// =============================================================================
// Helper Functions
// =============================================================================

// =============================================================================
// Main Component
// =============================================================================

export function ItemManager({ ... }: ItemManagerProps) {
  // 1. Config merging
  // 2. State hook initialization
  // 3. Debug helper
  // 4. Item actions factory
  // 5. Effects
  // 6. Memoized render functions
  // 7. Return JSX
}
```

---

## References

- **Implementation Plan:** `docs/prd/item-capture-manager-implementation-plan.md`
- **Type Definitions:** `src/components/ItemManager/ItemManager.types.ts` (Task 1.1)
- **State Hook:** `src/components/ItemManager/hooks/useItemManagerState.ts` (Task 1.2)
- **Pattern Reference - Main Component:** `src/components/ItemCapture/ItemCapture.tsx`
- **Pattern Reference - Layout:** `src/components/ItemCapture/components/CaptureWizard.tsx`
- **Utility Reference:** `src/lib/utils.ts` - `cn()` function
- **Config Defaults Reference:** Implementation Plan Appendix C

---

## Appendix: Complete Component Skeleton

```typescript
// src/components/ItemManager/ItemManager.tsx
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
      // Debug logging can be enabled via custom config extension
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
        {/* ItemGrid or ItemList will be rendered here in Task 1.6 */}
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

export default ItemManager;
```
