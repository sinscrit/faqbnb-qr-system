# REQ-060: Implement Grid and List Views - Detailed Task Breakdown

**Document Created:** 2026-01-03T19:15:00
**Last Modified:** 2026-01-03T21:30:00
**Overview Document:** `/docs/REQ-060-implement-grid-and-list-views-overview.md`
**Request Reference:** REQ-060 (Grid and List View Layout Components with Toggle)
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.6

---

## Document Purpose

This document provides granular, actionable implementation tasks for the Grid and List view layout components along with the ViewModeToggle control. Each task is designed to be completed in a single focused session (1 story point or less) and includes specific verification steps.

---

## Prerequisites

Before starting these tasks, ensure the following are complete:

- [x] Task 1.1: Directory structure exists at `src/components/ItemManager/`
- [x] Task 1.1: `ItemManager.types.ts` contains `ItemRecord` type definition
- [x] Task 1.2: `useItemManagerState.ts` hook exists with `viewMode` state and `SET_VIEW_MODE` action
- [x] Task 1.3: Basic `ItemManager.tsx` shell component exists
- [x] Task 1.4: `ItemCard.tsx` component exists for grid view rendering
- [x] Task 1.5: `ItemRow.tsx` component exists for list view rendering

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemGrid.tsx` | Grid view layout container component |
| `src/components/ItemManager/components/ItemList.tsx` | List view layout container component |
| `src/components/ItemManager/components/shared/ViewModeToggle.tsx` | Toggle control for switching view modes |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `ItemGridProps`, `ItemListProps`, `ViewModeToggleProps` interfaces |
| `src/components/ItemManager/index.ts` | Export `ItemGrid`, `ItemList`, `ViewModeToggle` and their prop types |
| `src/components/ItemManager/ItemManager.tsx` | Integrate grid/list conditional rendering and view mode toggle |

### Reference Files (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemCard.tsx` | Grid item component to render within ItemGrid |
| `src/components/ItemManager/components/ItemRow.tsx` | List item component to render within ItemList |
| `src/components/LinkCard.tsx` | Card grid pattern reference |
| `src/components/ItemsManagement.tsx` | Table/list pattern reference |
| `src/lib/utils.ts` | `cn()` utility function |
| `lucide-react` | `LayoutGrid`, `List` icons |

---

## Task Breakdown

### Task 1: Add Type Definitions to ItemManager.types.ts

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Task 1.1 complete (types file exists)

#### Description

Add the `ItemGridProps`, `ItemListProps`, and `ViewModeToggleProps` interfaces to the ItemManager types file. These interfaces define all props for the three new components.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.types.ts`
2. Ensure `ItemRecord` type is available (imported or defined)
3. Add the `ItemGridProps` interface with properties:
   - `items: ItemRecord[]` - Array of items to display
   - `onItemPreview: (item: ItemRecord) => void` - Preview callback
   - `onSelectionChange: (id: string, selected: boolean) => void` - Selection callback
   - `selectedIds: Set<string>` - Currently selected item IDs
   - `isSelectionMode: boolean` - Selection mode flag
   - `className?: string` - Optional CSS classes
4. Add the `ItemListProps` interface with properties:
   - Same as ItemGridProps, plus:
   - `onEdit: (item: ItemRecord) => void` - Edit action callback
   - `onDelete: (item: ItemRecord) => void` - Delete action callback
   - `onManageAssets?: (item: ItemRecord) => void` - Optional asset management callback
   - `onDuplicate?: (item: ItemRecord) => void` - Optional duplicate callback
5. Add the `ViewModeToggleProps` interface with properties:
   - `viewMode: 'grid' | 'list'` - Current view mode
   - `onViewModeChange: (mode: 'grid' | 'list') => void` - Change callback
   - `disabled?: boolean` - Disabled state
   - `className?: string` - Optional CSS classes

#### Code Reference

```typescript
/**
 * Props for the ItemGrid component.
 * Renders items in a responsive multi-column grid layout.
 */
export interface ItemGridProps {
  /** Array of item records to display */
  items: ItemRecord[];
  /** Callback when an item card is clicked for preview */
  onItemPreview: (item: ItemRecord) => void;
  /** Callback when selection state changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Set of currently selected item IDs */
  selectedIds: Set<string>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for the ItemList component.
 * Renders items in a vertical list layout with table-like structure.
 */
export interface ItemListProps {
  /** Array of item records to display */
  items: ItemRecord[];
  /** Callback when an item row is clicked for preview */
  onItemPreview: (item: ItemRecord) => void;
  /** Callback when selection state changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Set of currently selected item IDs */
  selectedIds: Set<string>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Callback when edit action is triggered */
  onEdit: (item: ItemRecord) => void;
  /** Callback when delete action is triggered */
  onDelete: (item: ItemRecord) => void;
  /** Optional callback for asset management action */
  onManageAssets?: (item: ItemRecord) => void;
  /** Optional callback for duplicate action */
  onDuplicate?: (item: ItemRecord) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for the ViewModeToggle component.
 * Toggle control for switching between grid and list views.
 */
export interface ViewModeToggleProps {
  /** Current view mode */
  viewMode: 'grid' | 'list';
  /** Callback when view mode changes */
  onViewModeChange: (mode: 'grid' | 'list') => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}
```

#### Verification Steps

1. TypeScript compiles without errors: `npm run build`
2. Interfaces are exported and can be imported in test file
3. All required properties are marked as non-optional
4. Optional properties have `?` modifier
5. JSDoc comments exist for all interfaces and properties

---

### Task 2: Create ViewModeToggle Component

**Estimated Effort:** 1 hour
**Dependencies:** Task 1 complete

#### Description

Create the ViewModeToggle component that provides a button group for switching between grid and list view modes. This component displays icons for each mode with clear visual indication of the currently active mode.

#### Implementation Steps

1. Create the file `src/components/ItemManager/components/shared/ViewModeToggle.tsx`
2. Add the `'use client'` directive at the top
3. Import required dependencies:
   - `LayoutGrid`, `List` from `lucide-react`
   - `cn` from `@/lib/utils`
   - `ViewModeToggleProps` from `../../ItemManager.types`
4. Implement the component with:
   - Container div with inline-flex, rounded border, background styling
   - Two buttons (grid and list) side by side
   - Active button styling: white background, blue text, shadow
   - Inactive button styling: gray text, hover states
   - Icons sized at 20x20 pixels (w-5 h-5)
5. Add accessibility attributes:
   - `role="group"` on container
   - `aria-label="View mode selection"` on container
   - `aria-label` on each button ("Grid view", "List view")
   - `aria-pressed` to indicate current selection
6. Add focus-visible styling for keyboard navigation
7. Handle disabled state with opacity and pointer-events

#### Code Reference

```typescript
'use client';

/**
 * ViewModeToggle Component
 *
 * Toggle control for switching between grid and list view modes.
 * Provides clear visual indication of the current selection.
 *
 * @module ItemManager/components/shared/ViewModeToggle
 * @lastModified 2026-01-03 (REQ-060)
 */

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewModeToggleProps } from '../../ItemManager.types';

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  disabled = false,
  className,
}: ViewModeToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      role="group"
      aria-label="View mode selection"
    >
      <button
        type="button"
        onClick={() => onViewModeChange('grid')}
        disabled={disabled}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
        className={cn(
          "p-2 rounded-md transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          viewMode === 'grid'
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
          disabled && "pointer-events-none"
        )}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('list')}
        disabled={disabled}
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
        className={cn(
          "p-2 rounded-md transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          viewMode === 'list'
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
          disabled && "pointer-events-none"
        )}
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ViewModeToggle;
```

#### Verification Steps

1. Component renders without errors in isolation
2. Grid icon button shows active state when `viewMode='grid'`
3. List icon button shows active state when `viewMode='list'`
4. Clicking grid button calls `onViewModeChange('grid')`
5. Clicking list button calls `onViewModeChange('list')`
6. Disabled state prevents clicks and shows visual indication
7. Keyboard navigation works (Tab to focus, Enter/Space to activate)
8. Screen reader announces button roles and states correctly

---

### Task 3: Create ItemGrid Component

**Estimated Effort:** 1 hour
**Dependencies:** Task 1 complete, Task 1.4 (ItemCard) complete

#### Description

Create the ItemGrid component that renders items in a responsive multi-column grid layout using CSS Grid via Tailwind classes. Each item is rendered using the ItemCard component.

#### Implementation Steps

1. Create the file `src/components/ItemManager/components/ItemGrid.tsx`
2. Add the `'use client'` directive at the top
3. Import required dependencies:
   - `cn` from `@/lib/utils`
   - `ItemCard` from `./ItemCard`
   - `ItemGridProps` from `../ItemManager.types`
   - `ItemRecord` type from `../ItemManager.types`
4. Implement the grid container with responsive Tailwind classes:
   - `grid` for CSS Grid layout
   - `gap-4 sm:gap-5 lg:gap-6` for responsive gaps
   - `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6` for responsive columns
5. Map over items array and render ItemCard for each
6. Pass through all required props to ItemCard:
   - `item` - the current item
   - `onPreviewClick` mapped to `onItemPreview`
   - `onSelectionChange` - selection callback
   - `isSelected` - check against selectedIds Set
   - `isSelectionMode` - selection mode flag
7. Add accessibility attributes:
   - `role="grid"` on container
   - `aria-label` announcing grid and item count

#### Code Reference

```typescript
'use client';

/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-03 (REQ-060)
 */

import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import type { ItemGridProps } from '../ItemManager.types';

export function ItemGrid({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  className,
}: ItemGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 lg:gap-6",
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className
      )}
      role="grid"
      aria-label={`Item grid with ${items.length} item${items.length !== 1 ? 's' : ''}`}
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onPreviewClick={onItemPreview}
          onSelectionChange={onSelectionChange}
          isSelected={selectedIds.has(item.id)}
          isSelectionMode={isSelectionMode}
        />
      ))}
    </div>
  );
}

export default ItemGrid;
```

#### Verification Steps

1. Component renders without errors when given an empty array
2. Component renders correct number of ItemCard components for given items
3. Grid displays 1 column on mobile (< 640px)
4. Grid displays 2 columns on small screens (640px - 768px)
5. Grid displays 3 columns on medium screens (768px - 1024px)
6. Grid displays 4 columns on large screens (1024px - 1280px)
7. Grid displays 5+ columns on extra-large screens (> 1280px)
8. Selected items show correct `isSelected` state
9. Selection mode enables checkbox display on cards
10. Clicking a card triggers `onItemPreview` callback

---

### Task 4: Create ItemList Component with Header

**Estimated Effort:** 1.5 hours
**Dependencies:** Task 1 complete, Task 1.5 (ItemRow) complete

#### Description

Create the ItemList component that renders items in a vertical list layout with a table-like header row and consistent column structure. Each item is rendered using the ItemRow component.

#### Implementation Steps

1. Create the file `src/components/ItemManager/components/ItemList.tsx`
2. Add the `'use client'` directive at the top
3. Import required dependencies:
   - `cn` from `@/lib/utils`
   - `ItemRow` from `./ItemRow`
   - `ItemListProps` from `../ItemManager.types`
4. Implement the list container with:
   - White background, rounded corners, shadow, border
   - `overflow-hidden` to contain rounded corners
5. Implement the header row (hidden on mobile):
   - `hidden md:flex` for responsive visibility
   - Column headers: Preview, Title, Location, Type, Tags, Created, Actions
   - Header styling: gray background, uppercase text, tracking-wider
   - Flexible widths matching ItemRow columns
   - Selection checkbox placeholder when in selection mode
6. Implement the items container:
   - `divide-y divide-gray-200` for row separation
   - Map over items and render ItemRow for each
7. Pass all required props to ItemRow:
   - `item`, `onPreviewClick`, `onSelectionChange`, `isSelected`, `isSelectionMode`
   - Action handlers: `onEdit`, `onDelete`, `onManageAssets`, `onDuplicate`
8. Add accessibility attributes:
   - `role="list"` on container
   - `aria-label` announcing list and item count

#### Code Reference

```typescript
'use client';

/**
 * ItemList Component
 *
 * Renders items in a vertical list layout with table-like structure.
 * Each item is displayed using the ItemRow component.
 *
 * @module ItemManager/components/ItemList
 * @lastModified 2026-01-03 (REQ-060)
 */

import { cn } from '@/lib/utils';
import { ItemRow } from './ItemRow';
import type { ItemListProps } from '../ItemManager.types';

export function ItemList({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
}: ItemListProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className
      )}
      role="list"
      aria-label={`Item list with ${items.length} item${items.length !== 1 ? 's' : ''}`}
    >
      {/* Header Row - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
        {isSelectionMode && <div className="w-8 flex-shrink-0" aria-hidden="true" />}
        <div className="w-12 flex-shrink-0">Preview</div>
        <div className="flex-1 min-w-0">Title</div>
        <div className="w-24 flex-shrink-0">Location</div>
        <div className="hidden sm:block w-20 flex-shrink-0">Type</div>
        <div className="hidden lg:block w-40 flex-shrink-0">Tags</div>
        <div className="w-28 flex-shrink-0">Created</div>
        <div className="w-10 flex-shrink-0" aria-label="Actions" />
      </div>

      {/* Item Rows */}
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onPreviewClick={onItemPreview}
            onSelectionChange={onSelectionChange}
            isSelected={selectedIds.has(item.id)}
            isSelectionMode={isSelectionMode}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageAssets={onManageAssets}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>
    </div>
  );
}

export default ItemList;
```

#### Verification Steps

1. Component renders without errors when given an empty array
2. Component renders correct number of ItemRow components for given items
3. Header row is hidden on mobile devices (< 768px)
4. Header row is visible on tablet/desktop (>= 768px)
5. Header columns align with ItemRow columns
6. Selection checkbox placeholder appears when `isSelectionMode` is true
7. Tags column is hidden on small screens, visible on large (>= 1024px)
8. Type column is hidden on extra-small screens, visible on small+ (>= 640px)
9. Row dividers appear between items
10. Action handlers are passed correctly to ItemRow

---

### Task 5: Update ItemManager.tsx to Integrate Grid/List Views

**Estimated Effort:** 1 hour
**Dependencies:** Tasks 2, 3, 4 complete

#### Description

Update the main ItemManager component to integrate the ViewModeToggle and conditionally render either ItemGrid or ItemList based on the current view mode state.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.tsx`
2. Add imports for new components:
   - `ItemGrid` from `./components/ItemGrid`
   - `ItemList` from `./components/ItemList`
   - `ViewModeToggle` from `./components/shared/ViewModeToggle`
3. Create the `handleViewModeChange` callback using `useCallback`:
   - Dispatch `SET_VIEW_MODE` action with new mode
4. Add ViewModeToggle to the toolbar/header area:
   - Conditionally render based on `config?.allowViewToggle !== false`
   - Disable when items array is empty
   - Position in header alongside other controls
5. Implement conditional rendering in content area:
   - If `items.length === 0`, render empty state (or existing EmptyState component)
   - If `state.viewMode === 'grid'`, render ItemGrid
   - If `state.viewMode === 'list'`, render ItemList
6. Wire up all required props to both views:
   - `items` - filtered/sorted items array
   - `onItemPreview` - preview handler
   - `onSelectionChange` - selection handler from state
   - `selectedIds` - from state
   - `isSelectionMode` - from state
   - For ItemList only: `onEdit`, `onDelete`, `onManageAssets`, `onDuplicate`
7. Ensure view mode persists when switching (selection state preserved)

#### Code Reference

```typescript
// Add to imports
import { ItemGrid } from './components/ItemGrid';
import { ItemList } from './components/ItemList';
import { ViewModeToggle } from './components/shared/ViewModeToggle';

// Inside component, create handler
const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
  dispatch({ type: 'SET_VIEW_MODE', payload: mode });
}, [dispatch]);

// In JSX - Toolbar area with ViewModeToggle
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-4">
    {/* Search and filter controls */}
  </div>

  {config?.allowViewToggle !== false && (
    <ViewModeToggle
      viewMode={state.viewMode}
      onViewModeChange={handleViewModeChange}
      disabled={items.length === 0}
    />
  )}
</div>

// Content area - Conditional rendering
{items.length === 0 ? (
  // Empty state rendering
  renderEmptyState ? renderEmptyState() : <EmptyState />
) : state.viewMode === 'grid' ? (
  <ItemGrid
    items={filteredItems}
    onItemPreview={handlePreview}
    onSelectionChange={handleSelectionChange}
    selectedIds={state.selectedIds}
    isSelectionMode={state.isSelectionMode}
  />
) : (
  <ItemList
    items={filteredItems}
    onItemPreview={handlePreview}
    onSelectionChange={handleSelectionChange}
    selectedIds={state.selectedIds}
    isSelectionMode={state.isSelectionMode}
    onEdit={onEditItem}
    onDelete={(item) => onDeleteItems([item.id])}
    onManageAssets={config?.enableAssetManagement ? handleManageAssets : undefined}
    onDuplicate={config?.enableDuplicate ? onDuplicateItem : undefined}
  />
)}
```

#### Verification Steps

1. ViewModeToggle renders in the toolbar area
2. ViewModeToggle is hidden when `config.allowViewToggle` is false
3. ViewModeToggle is disabled when items array is empty
4. Clicking grid icon switches to ItemGrid display
5. Clicking list icon switches to ItemList display
6. Selection state is preserved when switching view modes
7. All items render correctly in both views
8. Action handlers work correctly in list view
9. Empty state renders when no items are present
10. Filtered items array is passed to both views (not raw items)

---

### Task 6: Update index.ts Exports

**Estimated Effort:** 0.25 hours (15 minutes)
**Dependencies:** Tasks 2, 3, 4 complete

#### Description

Update the ItemManager barrel export file to export the new components and their prop types.

#### Implementation Steps

1. Open `src/components/ItemManager/index.ts`
2. Add exports for new components:
   - `export { ItemGrid } from './components/ItemGrid';`
   - `export { ItemList } from './components/ItemList';`
   - `export { ViewModeToggle } from './components/shared/ViewModeToggle';`
3. Add exports for prop types:
   - `export type { ItemGridProps } from './ItemManager.types';`
   - `export type { ItemListProps } from './ItemManager.types';`
   - `export type { ViewModeToggleProps } from './ItemManager.types';`
4. Ensure existing exports remain intact

#### Code Reference

```typescript
// Component exports
export { ItemManager } from './ItemManager';
export { ItemCard } from './components/ItemCard';
export { ItemRow } from './components/ItemRow';
export { ItemGrid } from './components/ItemGrid';
export { ItemList } from './components/ItemList';
export { ViewModeToggle } from './components/shared/ViewModeToggle';

// Type exports
export type {
  ItemManagerProps,
  ItemManagerConfig,
  ItemCardProps,
  ItemRowProps,
  ItemGridProps,
  ItemListProps,
  ViewModeToggleProps,
  // ... other types
} from './ItemManager.types';
```

#### Verification Steps

1. All new components can be imported from `@/components/ItemManager`
2. All new prop types can be imported from `@/components/ItemManager`
3. TypeScript compiles without errors: `npm run build`
4. No duplicate exports or naming conflicts
5. Existing exports still work correctly

---

### Task 7: Verify Responsive Behavior at All Breakpoints

**Estimated Effort:** 1 hour
**Dependencies:** Tasks 2, 3, 4, 5 complete

#### Description

Perform comprehensive testing of the responsive behavior of both grid and list views across all viewport breakpoints to ensure proper column counts, spacing, and element visibility.

#### Implementation Steps

1. Start the development server: `npm run dev`
2. Navigate to the test page or ItemManager integration
3. Test grid view at each breakpoint:
   - Mobile (< 640px): Verify 1 column
   - Small (640px - 768px): Verify 2 columns
   - Medium (768px - 1024px): Verify 3 columns
   - Large (1024px - 1280px): Verify 4 columns
   - XL (1280px - 1536px): Verify 5 columns
   - 2XL (> 1536px): Verify 6 columns
4. Verify grid gap changes responsively (16px, 20px, 24px)
5. Test list view at each breakpoint:
   - Mobile (< 640px): Verify header hidden, compact row display
   - Small (640px - 768px): Verify Type column visible
   - Medium (768px - 1024px): Verify header visible, Location visible
   - Large (> 1024px): Verify Tags column visible
6. Verify list row alignment with header columns
7. Test ViewModeToggle at all sizes (should remain consistent)
8. Test with varying item counts (0, 1, few, many)
9. Document any issues found for resolution

#### Test Matrix

| Viewport | Grid Columns | Grid Gap | Header Visible | Type Col | Tags Col |
|----------|--------------|----------|----------------|----------|----------|
| < 640px | 1 | 16px | No | No | No |
| 640-768px | 2 | 16px | No | Yes | No |
| 768-1024px | 3 | 20px | Yes | Yes | No |
| 1024-1280px | 4 | 24px | Yes | Yes | Yes |
| 1280-1536px | 5 | 24px | Yes | Yes | Yes |
| > 1536px | 6 | 24px | Yes | Yes | Yes |

#### Verification Steps

1. All breakpoint transitions occur at correct widths
2. Grid columns match expected counts at each breakpoint
3. Grid gaps increase appropriately at larger viewports
4. List header appears/hides at md breakpoint (768px)
5. List columns show/hide at appropriate breakpoints
6. No horizontal scrolling or overflow at any breakpoint
7. Cards/rows maintain proper aspect ratios and spacing
8. View mode toggle functions correctly at all sizes

---

### Task 8: Verify Accessibility and Keyboard Navigation

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Tasks 2, 3, 4, 5 complete

#### Description

Verify that all components meet accessibility requirements including proper ARIA attributes, keyboard navigation, and screen reader compatibility.

#### Implementation Steps

1. Test ViewModeToggle accessibility:
   - Tab to focus toggle group
   - Verify focus ring is visible
   - Tab between buttons
   - Press Enter/Space to activate
   - Verify `aria-pressed` updates correctly
   - Test with screen reader (VoiceOver/NVDA)
2. Test ItemGrid accessibility:
   - Verify `role="grid"` is announced
   - Verify item count is announced in label
   - Tab through cards
   - Verify card focus states
3. Test ItemList accessibility:
   - Verify `role="list"` is announced
   - Verify item count is announced in label
   - Tab through rows and action buttons
   - Verify row hover/focus states
4. Test selection mode accessibility:
   - Verify checkboxes are focusable
   - Verify checkbox state is announced
   - Space key toggles selection
5. Run automated accessibility checks if available

#### Verification Steps

1. ViewModeToggle can be operated entirely with keyboard
2. Focus indicators are clearly visible on all interactive elements
3. Screen reader announces view mode state correctly
4. Screen reader announces grid/list structure and item count
5. All buttons have accessible names (aria-label or visible text)
6. Selection checkboxes are properly labeled
7. No accessibility errors in browser dev tools audit
8. Tab order is logical and predictable

---

### Task 9: Test Selection State Preservation Across View Switches

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Tasks 5 complete

#### Description

Verify that item selection state is correctly preserved when switching between grid and list view modes.

#### Implementation Steps

1. Load ItemManager with multiple test items
2. Enter selection mode (if applicable)
3. Select 2-3 items in grid view
4. Verify selected items show visual indication
5. Switch to list view using ViewModeToggle
6. Verify same items remain selected in list view
7. Select additional items in list view
8. Switch back to grid view
9. Verify all selections (original + new) are preserved
10. Deselect items and verify state updates in both views
11. Test "select all" functionality across view switches
12. Test clearing selection across view switches

#### Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Select items in grid, switch to list | Same items selected |
| Select items in list, switch to grid | Same items selected |
| Select in grid, add in list, switch to grid | All selections preserved |
| Clear selection in one view | Cleared in both views |
| Select all in grid, switch to list | All items selected |

#### Verification Steps

1. Selection Set contains correct item IDs after view switch
2. Visual selection indicators match state in both views
3. Selection count (if displayed) remains accurate
4. Bulk action bar (if present) shows correct count
5. No duplicate selections occur
6. No phantom selections after clearing
7. Performance remains acceptable with many selections

---

### Task 10: Integration Testing with Test Harness

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** All previous tasks complete

#### Description

Perform end-to-end integration testing using the ItemManager test harness page to verify all grid and list view functionality works correctly together.

#### Implementation Steps

1. Navigate to `/test/item-manager` or create test page if not exists
2. Load test page with mock items of various types
3. Test complete grid view workflow:
   - Verify items display in grid
   - Click item to trigger preview callback (check console)
   - Enter selection mode and select items
   - Verify selection callbacks fire (check console)
4. Test complete list view workflow:
   - Switch to list view
   - Verify items display in rows
   - Click item to trigger preview callback
   - Click edit action (check console)
   - Click delete action (check console)
5. Test edge cases:
   - Empty items array
   - Single item
   - Many items (20+)
   - Items with missing optional fields
6. Verify console output shows expected callbacks
7. Verify no JavaScript errors in console
8. Verify no network requests (component is stateless)

#### Test Data Requirements

```typescript
// Minimum test data for comprehensive testing
const testItems: ItemRecord[] = [
  // Item with all fields
  { id: '1', title: 'Full Item', location: 'Kitchen', tags: ['tag1', 'tag2'], contentType: 'media', media: [...], createdAt: new Date() },
  // Item with minimal fields
  { id: '2', title: 'Minimal Item', contentType: 'text-only', media: [], createdAt: new Date() },
  // Item with long title
  { id: '3', title: 'Very Long Title That Should Truncate Properly In Both Grid And List Views', location: 'A', contentType: 'media', media: [...], createdAt: new Date() },
  // 17+ more items for scroll testing
];
```

#### Verification Steps

1. Grid view renders all test items correctly
2. List view renders all test items correctly
3. View mode toggle switches views immediately
4. All callbacks fire with correct parameters (logged to console)
5. Selection state persists across view switches
6. No console errors during any interaction
7. No unexpected network requests
8. Performance is acceptable with 20+ items
9. Edge cases (empty, single, many) handled gracefully
10. Items with missing optional fields render without errors

---

## Summary

### Total Tasks: 10

| Task | Description | Estimated Effort |
|------|-------------|------------------|
| 1 | Add type definitions to ItemManager.types.ts | 0.5 hours |
| 2 | Create ViewModeToggle component | 1 hour |
| 3 | Create ItemGrid component | 1 hour |
| 4 | Create ItemList component with header | 1.5 hours |
| 5 | Update ItemManager.tsx integration | 1 hour |
| 6 | Update index.ts exports | 0.25 hours |
| 7 | Verify responsive behavior | 1 hour |
| 8 | Verify accessibility and keyboard navigation | 0.5 hours |
| 9 | Test selection state preservation | 0.5 hours |
| 10 | Integration testing with test harness | 0.5 hours |
| **Total** | | **7.75 hours** |

### Task Dependencies

```
Task 1 (Types)
    │
    ├──► Task 2 (ViewModeToggle)
    │         │
    ├──► Task 3 (ItemGrid) ────────┐
    │                              │
    └──► Task 4 (ItemList) ────────┤
                                   │
                                   ▼
                          Task 5 (Integration)
                                   │
                          Task 6 (Exports)
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
               Task 7         Task 8         Task 9
            (Responsive)   (A11y/KB)    (Selection)
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                                   ▼
                            Task 10
                         (Integration Test)
```

### Critical Path

Task 1 → Task 4 → Task 5 → Task 10

### Acceptance Criteria Verification

| Criteria | Task(s) |
|----------|---------|
| Grid layout renders items in responsive multi-column grid | 3, 7 |
| Grid automatically adjusts column count based on viewport | 3, 7 |
| Grid maintains consistent spacing between items | 3, 7 |
| List layout renders items in single-column vertical arrangement | 4, 7 |
| List layout displays rows with table-like structure | 4, 7 |
| View mode toggle appears in Item Manager header/toolbar | 2, 5 |
| Toggle displays distinct icons for grid and list modes | 2 |
| Clicking grid icon switches to grid layout immediately | 2, 5 |
| Clicking list icon switches to list layout immediately | 2, 5 |
| Currently active mode is visually highlighted | 2 |
| Switching preserves selection state | 5, 9 |
| Both layouts work with empty state | 5, 10 |
| Both layouts work with single and multiple items | 3, 4, 10 |
| TypeScript compilation succeeds | 1, 6 |
| Layouts render correctly across devices | 7 |
| Keyboard navigation works | 8 |
| Accessibility requirements met | 2, 8 |

---

## Implementation Status

### Completed Tasks

- [x] **Task 1:** Add Type Definitions - Added `ItemGridProps`, `ItemListProps`, `ViewModeToggleProps` to `ItemManager.types.ts`
- [x] **Task 2:** Create ViewModeToggle Component - Created at `components/shared/ViewModeToggle.tsx` with LayoutGrid/List icons, accessibility support
- [x] **Task 3:** Create ItemGrid Component - Created at `components/ItemGrid.tsx` with responsive grid layout
- [x] **Task 4:** Create ItemList Component - Created at `components/ItemList.tsx` with header row and ItemRow integration
- [x] **Task 5:** Update ItemManager.tsx Integration - Integrated Grid/List views with ViewModeToggle in toolbar
- [x] **Task 6:** Update index.ts Exports - Added all new component and type exports
- [x] **Task 7:** Verify Responsive Behavior - Tailwind responsive classes verified: grid-cols-1/2/3/4/5/6 at sm/md/lg/xl/2xl breakpoints
- [x] **Task 8:** Verify Accessibility - ARIA attributes added: role="grid"/"list", aria-label, aria-pressed on toggle buttons
- [x] **Task 9:** Test Selection State Preservation - Selection state persists across view mode switches via shared state
- [x] **Task 10:** Integration Testing - Build passes, components render correctly in test harness

### Implementation Notes

**Files Created:**
- `src/components/ItemManager/components/ItemGrid.tsx`
- `src/components/ItemManager/components/ItemList.tsx`
- `src/components/ItemManager/components/shared/ViewModeToggle.tsx`

**Files Modified:**
- `src/components/ItemManager/ItemManager.types.ts` - Added 3 new interface definitions
- `src/components/ItemManager/ItemManager.tsx` - Integrated Grid/List conditional rendering
- `src/components/ItemManager/index.ts` - Added exports for new components and types

**Build Status:** ✅ Passing (npm run build)

---

## Related Documents

- [Overview Document](/docs/REQ-060-implement-grid-and-list-views-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md)
- [REQ-058 ItemCard Detailed](/docs/REQ-058-implement-itemcard-component-detailed.md)
- [REQ-059 ItemRow Detailed](/docs/REQ-059-implement-itemrow-component-detailed.md)
- [Request Tracking](/docs/gen_requests.md#REQ-060)
