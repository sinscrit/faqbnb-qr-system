# REQ-060: Implement Grid and List Views - Technical Overview

**Document Created:** 2026-01-03T12:30:00
**Last Modified:** 2026-01-03T12:30:00
**Request Reference:** REQ-060 (Grid and List View Layout Components with Toggle)
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.6

---

## 1. Executive Summary

This document provides a technical implementation breakdown for the Grid and List view layout components (Task 1.6 in Phase 1). These components provide the two primary display modes for items in the ItemManager: a visual-focused grid layout using ItemCard components and a data-rich list layout using ItemRow components, along with a view mode toggle control for switching between them.

### Dependencies
- **Prerequisite Tasks:**
  - Task 1.1: Directory structure and types (provides `ItemManager.types.ts`)
  - Task 1.2: Core state management hook (`useItemManagerState.ts`) - provides `viewMode` state
  - Task 1.3: Basic ItemManager shell (`ItemManager.tsx`)
  - Task 1.4: ItemCard component (for grid view rendering)
  - Task 1.5: ItemRow component (for list view rendering)

- **Parallel Tasks:**
  - Task 1.7: Empty and Loading states (can be developed in parallel)

- **Dependent Tasks:**
  - Phase 2: Search, Filter, Sort (builds on grid/list layouts)
  - Phase 3: Selection & Bulk Actions (works within both layouts)

---

## 2. Component Specification

### 2.1 Components to Create

| Component | File Path | Purpose |
|-----------|-----------|---------|
| `ItemGrid` | `src/components/ItemManager/components/ItemGrid.tsx` | Responsive grid layout container for ItemCard components |
| `ItemList` | `src/components/ItemManager/components/ItemList.tsx` | Table-like list layout container for ItemRow components |
| `ViewModeToggle` | `src/components/ItemManager/components/shared/ViewModeToggle.tsx` | Toggle control for switching between grid/list views |

### 2.2 ItemGrid Component

#### Purpose
Renders items in a responsive, multi-column grid layout optimized for visual browsing with thumbnail emphasis.

#### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │  │              │  │              │    │
│  │   ItemCard   │  │   ItemCard   │  │   ItemCard   │  │   ItemCard   │    │
│  │              │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │  │              │  │              │    │
│  │   ItemCard   │  │   ItemCard   │  │   ItemCard   │  │   ItemCard   │    │
│  │              │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Props Interface

```typescript
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
```

#### Responsive Breakpoints

| Viewport | Columns | Gap | Card Min Width |
|----------|---------|-----|----------------|
| Mobile (<640px) | 1 | 16px | 100% |
| Small (640px-768px) | 2 | 16px | ~280px |
| Medium (768px-1024px) | 3 | 20px | ~280px |
| Large (1024px-1280px) | 4 | 24px | ~260px |
| XL (>1280px) | 5-6 | 24px | ~240px |

#### Tailwind Grid Implementation

```typescript
<div className={cn(
  "grid gap-4 sm:gap-5 lg:gap-6",
  "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
  className
)}>
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
```

### 2.3 ItemList Component

#### Purpose
Renders items in a vertical, single-column list layout with table-like structure optimized for detailed metadata scanning and management operations.

#### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [✓] │ THUMBNAIL │ TITLE / DESCRIPTION     │ LOCATION │ TYPE  │ TAGS     │ DATE    │ ⋮ │
├─────┼───────────┼─────────────────────────┼──────────┼───────┼──────────┼─────────┼───┤
│ [ ] │  [IMG]    │ Coffee Maker Setup      │ Kitchen  │ VIDEO │ appliances│ Jan 15 │ ⋮ │
│     │           │ How to use the machine  │          │       │ morning   │        │   │
├─────┼───────────┼─────────────────────────┼──────────┼───────┼──────────┼─────────┼───┤
│ [ ] │  [IMG]    │ WiFi Connection Guide   │ Office   │ PDF   │ tech     │ Jan 14 │ ⋮ │
│     │           │ Network credentials...  │          │       │          │        │   │
├─────┼───────────┼─────────────────────────┼──────────┼───────┼──────────┼─────────┼───┤
│ [ ] │  [IMG]    │ Thermostat Controls     │ Hallway  │ PHOTO │ hvac     │ Jan 13 │ ⋮ │
│     │           │ Temperature adjustment  │          │       │          │        │   │
└─────┴───────────┴─────────────────────────┴──────────┴───────┴──────────┴─────────┴───┘
```

#### Props Interface

```typescript
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

  /** Action handlers passed to ItemRow */
  onEdit: (item: ItemRecord) => void;
  onDelete: (item: ItemRecord) => void;
  onManageAssets?: (item: ItemRecord) => void;
  onDuplicate?: (item: ItemRecord) => void;

  /** Optional additional CSS classes */
  className?: string;
}
```

#### Implementation Pattern

```typescript
<div className={cn(
  "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
  className
)}>
  {/* Optional Header Row */}
  <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
    {isSelectionMode && <div className="w-8" />}
    <div className="w-12">Preview</div>
    <div className="flex-1">Title</div>
    <div className="hidden md:block w-24">Location</div>
    <div className="hidden sm:block w-20">Type</div>
    <div className="hidden lg:block w-40">Tags</div>
    <div className="hidden md:block w-28">Date</div>
    <div className="w-10" />
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
```

### 2.4 ViewModeToggle Component

#### Purpose
Provides a toggle control for switching between grid and list view modes with clear visual indication of the current selection.

#### Visual Structure

```
┌─────────────────────┐
│  [▦]  │  [≡]        │  ← Icon buttons (Grid | List)
│ Active  Inactive    │
└─────────────────────┘
```

#### Props Interface

```typescript
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

#### Implementation Pattern

```typescript
import { LayoutGrid, List } from 'lucide-react';

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  disabled = false,
  className,
}: ViewModeToggleProps) {
  return (
    <div className={cn(
      "inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <button
        type="button"
        onClick={() => onViewModeChange('grid')}
        disabled={disabled}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
        className={cn(
          "p-2 rounded-md transition-all duration-200",
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
```

---

## 3. State Integration

### 3.1 View Mode State

The view mode is managed by the `useItemManagerState` hook (from Task 1.2):

```typescript
// From useItemManagerState.ts
interface ItemManagerState {
  viewMode: 'grid' | 'list';
  // ... other state
}

type ItemManagerAction =
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  // ... other actions
```

### 3.2 Integration in ItemManager.tsx

```typescript
// In ItemManager.tsx
const { state, dispatch } = useItemManagerState();

const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
  dispatch({ type: 'SET_VIEW_MODE', payload: mode });
}, [dispatch]);

// Render the appropriate view
{state.viewMode === 'grid' ? (
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
    onEdit={handleEdit}
    onDelete={handleDelete}
    onManageAssets={config?.enableAssetManagement ? handleManageAssets : undefined}
    onDuplicate={config?.enableDuplicate ? handleDuplicate : undefined}
  />
)}
```

---

## 4. Existing Patterns to Follow

### 4.1 Card Grid Pattern (LinkCard.tsx reference)

From `src/components/LinkCard.tsx`:
- `group` class for hover state coordination
- `cursor-pointer` on card root
- `aspect-video` for thumbnail area
- `overflow-hidden` on card and thumbnail containers
- `rounded-xl shadow-sm border border-gray-200`
- `hover:shadow-lg hover:border-gray-300`
- `transition-all duration-200`
- `group-hover:scale-105` on thumbnail image

### 4.2 Table/List Pattern (ItemsManagement.tsx reference)

From `src/components/ItemsManagement.tsx`:
- `<table>` with `<thead>` and `<tbody>` for semantic structure
- `bg-gray-50 border-b border-gray-200` for header row
- `divide-y divide-gray-200` for row separation
- `hover:bg-gray-50` for row hover states
- `hidden sm:table-cell`, `hidden md:table-cell`, `hidden lg:table-cell` for responsive columns
- `text-xs font-medium text-gray-500 uppercase tracking-wider` for header text

### 4.3 Styling Utilities

Use the established `cn()` utility from `@/lib/utils`:
```typescript
import { cn } from '@/lib/utils';
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemGrid.tsx` | Grid view layout component |
| `src/components/ItemManager/components/ItemList.tsx` | List view layout component |
| `src/components/ItemManager/components/shared/ViewModeToggle.tsx` | View mode toggle control |

### 5.2 Files to Import From (Read Only)

| File Path | Imports |
|-----------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | `ItemRecord`, type definitions |
| `src/components/ItemManager/components/ItemCard.tsx` | `ItemCard` component |
| `src/components/ItemManager/components/ItemRow.tsx` | `ItemRow` component |
| `src/lib/utils.ts` | `cn` utility function |
| `lucide-react` | `LayoutGrid`, `List` icons |

### 5.3 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `ItemGridProps`, `ItemListProps`, `ViewModeToggleProps` interfaces |
| `src/components/ItemManager/index.ts` | Export `ItemGrid`, `ItemList`, `ViewModeToggle` components |
| `src/components/ItemManager/ItemManager.tsx` | Integrate grid/list rendering based on viewMode |

---

## 6. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Grid layout | CSS Grid via Tailwind | Native responsive columns; no JS layout calculation needed |
| List layout | Flexbox rows | More flexible than `<table>` for responsive behavior; easier column control |
| View toggle | Button group with icons | Standard UI pattern; immediate visual feedback; accessible |
| Selection state preservation | Parent-controlled Set | Selection persists across view mode switches |
| Responsive columns | Tailwind breakpoints | Consistent with codebase; predictable behavior |
| Header row in list | Optional/hidden on mobile | Reduces visual noise on small screens |

---

## 7. Accessibility Requirements

### 7.1 ItemGrid
- Grid container: `role="grid"` or semantic container
- Focus management: Cards focusable via tab navigation
- Screen reader: Announce grid structure and item count

### 7.2 ItemList
- List container: Semantic structure with proper heading association
- Rows: `role="row"` on each ItemRow
- Column headers: Screen reader friendly (via `sr-only` or visually hidden headers on mobile)

### 7.3 ViewModeToggle
- Buttons: `aria-pressed` to indicate current selection
- Labels: `aria-label` for icon-only buttons ("Grid view", "List view")
- Focus: Clear focus ring using `focus-visible` styles
- Keyboard: Enter/Space triggers mode change

```typescript
// ViewModeToggle accessibility attributes
<button
  aria-label="Grid view"
  aria-pressed={viewMode === 'grid'}
  className="... focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
>
```

---

## 8. Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| Grid layout renders items in responsive multi-column grid | `ItemGrid` with Tailwind grid classes |
| Grid automatically adjusts column count based on viewport | `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` |
| Grid maintains consistent spacing between items | `gap-4 sm:gap-5 lg:gap-6` Tailwind classes |
| List layout renders items in single-column vertical arrangement | `ItemList` with flexbox row structure |
| List layout displays rows with table-like structure | Header row + ItemRow components with consistent column widths |
| View mode toggle appears in header/toolbar | `ViewModeToggle` integrated in ItemToolbar |
| Toggle displays distinct icons for grid and list | `LayoutGrid` and `List` Lucide icons |
| Clicking grid icon switches to grid layout | `onViewModeChange('grid')` → `SET_VIEW_MODE` action |
| Clicking list icon switches to list layout | `onViewModeChange('list')` → `SET_VIEW_MODE` action |
| Currently active mode is visually highlighted | Active button has `bg-white text-blue-600 shadow-sm` |
| Switching preserves selection state | `selectedIds` Set passed to both layouts from parent state |
| Both layouts work with empty state | Handled by parent (EmptyState rendered when items.length === 0) |
| Both layouts work with single and multiple items | Map over items array; no special handling needed |
| TypeScript compilation succeeds | Explicit interfaces for all props |
| Layouts render correctly across devices | Responsive Tailwind classes with breakpoints |

---

## 9. Testing Considerations

### 9.1 Unit Test Cases

**ItemGrid:**
1. Renders correct number of ItemCard components
2. Passes correct props to each ItemCard
3. Applies responsive grid classes
4. Handles empty items array gracefully
5. Preserves key prop for React reconciliation

**ItemList:**
1. Renders correct number of ItemRow components
2. Passes correct props to each ItemRow
3. Renders optional header row
4. Handles empty items array gracefully
5. Column visibility matches responsive breakpoints

**ViewModeToggle:**
1. Renders grid and list buttons
2. Highlights current mode correctly
3. Calls onViewModeChange with correct mode
4. Respects disabled state
5. Has correct ARIA attributes

### 9.2 Visual Test Cases

1. Grid: 1, 2, 3, 4, 5+ columns at different viewport widths
2. Grid: Consistent card sizing and spacing
3. List: Column alignment across rows
4. List: Responsive column hiding
5. Toggle: Active/inactive visual states
6. Toggle: Hover and focus states
7. Mode switch: Smooth transition (no layout jump)

### 9.3 Interaction Test Cases

1. Click grid button → switches to grid view
2. Click list button → switches to list view
3. Select items → switch views → selection preserved
4. Keyboard navigation through toggle buttons

---

## 10. Implementation Sequence

1. **Create type definitions:**
   - Add `ItemGridProps`, `ItemListProps`, `ViewModeToggleProps` to `ItemManager.types.ts`

2. **Create ViewModeToggle component:**
   - Create `ViewModeToggle.tsx` in `shared/` directory
   - Implement toggle UI with icons
   - Add accessibility attributes
   - Test standalone functionality

3. **Create ItemGrid component:**
   - Create `ItemGrid.tsx`
   - Implement responsive grid layout
   - Map items to ItemCard components
   - Pass selection-related props through

4. **Create ItemList component:**
   - Create `ItemList.tsx`
   - Implement list container with optional header
   - Map items to ItemRow components
   - Pass action handlers through

5. **Integrate with ItemManager:**
   - Update `ItemManager.tsx` to render ViewModeToggle
   - Conditionally render ItemGrid or ItemList based on viewMode
   - Wire up view mode change handler

6. **Update exports:**
   - Export all new components from `index.ts`

7. **Testing:**
   - Visual testing at all breakpoints
   - Verify selection preservation across view switches
   - Keyboard navigation testing

---

## 11. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Full component plan
- [PRD](/docs/prd/PRD_Item-capture-manager_Component.md) - Product requirements
- [REQ-058 ItemCard Overview](/docs/REQ-058-implement-itemcard-component-overview.md) - Grid item component
- [REQ-059 ItemRow Overview](/docs/REQ-059-implement-itemrow-component-overview.md) - List item component
- [ItemsManagement.tsx](/src/components/ItemsManagement.tsx) - Table/list pattern reference
- [LinkCard.tsx](/src/components/LinkCard.tsx) - Card pattern reference

---

## 12. Estimated Effort

| Task | Estimate |
|------|----------|
| Type definitions | 0.5 hours |
| ViewModeToggle component | 1 hour |
| ItemGrid component | 1.5 hours |
| ItemList component | 1.5 hours |
| Integration with ItemManager | 1 hour |
| Exports and barrel files | 0.25 hours |
| Responsive testing and refinement | 1 hour |
| Accessibility verification | 0.5 hours |
| **Total** | **7.25 hours** |

---

## Appendix A: Complete ItemGrid Component Skeleton

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
import type { ItemRecord } from '../ItemManager.types';

export interface ItemGridProps {
  items: ItemRecord[];
  onItemPreview: (item: ItemRecord) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  className?: string;
}

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
      aria-label={`Item grid with ${items.length} items`}
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

---

## Appendix B: Complete ItemList Component Skeleton

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
import type { ItemRecord } from '../ItemManager.types';

export interface ItemListProps {
  items: ItemRecord[];
  onItemPreview: (item: ItemRecord) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  onEdit: (item: ItemRecord) => void;
  onDelete: (item: ItemRecord) => void;
  onManageAssets?: (item: ItemRecord) => void;
  onDuplicate?: (item: ItemRecord) => void;
  className?: string;
}

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
      aria-label={`Item list with ${items.length} items`}
    >
      {/* Header Row - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
        {isSelectionMode && <div className="w-8 flex-shrink-0" />}
        <div className="w-12 flex-shrink-0">Preview</div>
        <div className="flex-1 min-w-0">Title</div>
        <div className="w-24 flex-shrink-0">Location</div>
        <div className="hidden sm:block w-20 flex-shrink-0">Type</div>
        <div className="hidden lg:block w-40 flex-shrink-0">Tags</div>
        <div className="w-28 flex-shrink-0">Created</div>
        <div className="w-10 flex-shrink-0" />
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

---

## Appendix C: Complete ViewModeToggle Component Skeleton

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

export interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  disabled?: boolean;
  className?: string;
}

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

---

## Appendix D: Integration Example in ItemManager.tsx

```typescript
// In ItemManager.tsx - relevant integration code

import { ItemGrid } from './components/ItemGrid';
import { ItemList } from './components/ItemList';
import { ViewModeToggle } from './components/shared/ViewModeToggle';

// Inside the ItemManager component:

const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
  dispatch({ type: 'SET_VIEW_MODE', payload: mode });
}, [dispatch]);

// In the render section:

{/* Toolbar with View Mode Toggle */}
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-4">
    {/* Search and filter controls here */}
  </div>

  {config?.allowViewToggle !== false && (
    <ViewModeToggle
      viewMode={state.viewMode}
      onViewModeChange={handleViewModeChange}
      disabled={items.length === 0}
    />
  )}
</div>

{/* Content Area - Conditional Rendering */}
{items.length === 0 ? (
  <EmptyState />
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
