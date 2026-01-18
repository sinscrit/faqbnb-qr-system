# REQ-063: Build ItemToolbar Component - Technical Implementation Overview

**Document Created:** 2026-01-03 10:30:00
**Last Modified:** 2026-01-03 10:30:00
**Request Reference:** REQ-063 (Item Toolbar with View Controls and Filter Management)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.2

---

## 1. Executive Summary

This document provides the technical implementation breakdown for building the `ItemToolbar` component, the second task of Phase 2 in the ItemManager component implementation. The ItemToolbar is the primary control interface for users to manage view preferences, see filter status, and clear applied filters.

### Scope

The `ItemToolbar` component will:
- Provide the main toolbar layout for ItemManager
- Integrate view toggle buttons (grid/list) for switching display modes
- Display result count showing items matching current filters
- Provide a "clear filters" action to reset all active filters
- Act as the container for search, filter, and sort controls (Tasks 2.3-2.5)

### Dependencies

- **Requires Phase 1 Completion:** This task depends on Phase 1 tasks (1.1-1.7) being complete:
  - Task 1.1: Directory Structure & Types (`ItemManager.types.ts`)
  - Task 1.2: State Management Hook (`useItemManagerState.ts`)
  - Task 1.3: Basic ItemManager Shell (`ItemManager.tsx`)
- **Requires Task 2.1:** The `useItemSearch` hook must be completed for `resultCount` and `isFiltered` values
- **Enables:** Tasks 2.3 (Search UI), 2.4 (FilterPanel), and 2.5 (SortMenu) will be integrated into ItemToolbar

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x with `cn()` utility | `src/lib/utils.ts` |
| Icons | Lucide React 0.525.0 | `package.json` |
| Component Pattern | Client components with 'use client' | Established pattern |

### 2.2 Reference Patterns from Codebase

**Primary Pattern Reference:** `/src/components/ItemsManagement.tsx`
- Toolbar with search input, filter dropdown, and result count badge
- Flex layout: `flex flex-col sm:flex-row gap-4 flex-1`
- Result count badge: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`

**View Toggle Pattern Reference:** `/src/components/TimeRangeSelector.tsx`
- Multi-button toggle with radio-like semantics
- Active state: `bg-blue-600 text-white`
- Inactive state: `bg-white text-gray-700 border-gray-200`
- Full keyboard navigation and ARIA support

**Button Patterns from Codebase:**
```typescript
// Primary action button
"px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

// Secondary button
"px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"

// Text button / link style
"text-sm text-gray-600 hover:text-gray-800"
```

### 2.3 Types from Implementation Plan

The following types are defined in the implementation plan:

```typescript
// From ItemManager.types.ts
interface ItemManagerState {
  viewMode: 'grid' | 'list';
  searchQuery: string;
  filters: FilterState;
  sortBy: SortOption;
  // ... other state
}

interface ItemManagerConfig {
  defaultView?: 'grid' | 'list';
  allowViewToggle?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSort?: boolean;
  labels?: ItemManagerLabels;
}

interface ItemManagerLabels {
  searchPlaceholder?: string;
  // ... other labels
}

interface ItemManagerClassNames {
  toolbar?: string;
  searchInput?: string;
  filterPanel?: string;
}
```

### 2.4 Toolbar Render Props (from Implementation Plan)

```typescript
interface ToolbarRenderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  resultCount: number;
  totalCount: number;
  isFiltered: boolean;
  filterOptions: FilterOptions;
}
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The `ItemToolbar` component follows a composition pattern where it:
- Acts as the main container/layout for all toolbar controls
- Receives state and actions from parent (`ItemManager`) via props
- Renders child components for search, filters, and sort (Tasks 2.3-2.5)
- Handles view toggle and clear filters directly

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ItemToolbar                                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────┐ ┌───────────────┐ │
│  │  View Toggle    │ │   Search Input  │ │ Filters │ │  Sort Menu    │ │
│  │  (Grid/List)    │ │   (Task 2.3)    │ │(Task2.4)│ │  (Task 2.5)   │ │
│  └─────────────────┘ └─────────────────┘ └─────────┘ └───────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Result Count: "Showing X of Y items"  │  [Clear Filters]           ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Props Interface

```typescript
/**
 * Props for ItemToolbar component.
 */
export interface ItemToolbarProps {
  // View mode
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  allowViewToggle?: boolean;

  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  enableSearch?: boolean;

  // Filters
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  enableFilters?: boolean;
  filterOptions?: {
    contentTypes: string[];
    tags: string[];
    locations: string[];
  };

  // Sort
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  enableSort?: boolean;

  // Results
  resultCount: number;
  totalCount: number;
  isFiltered: boolean;

  // Customization
  labels?: Partial<ItemManagerLabels>;
  classNames?: Partial<ItemToolbarClassNames>;

  // Render customization
  renderSearch?: () => React.ReactNode;
  renderFilters?: () => React.ReactNode;
  renderSort?: () => React.ReactNode;
}

interface ItemToolbarClassNames {
  container?: string;
  viewToggle?: string;
  searchContainer?: string;
  filtersContainer?: string;
  sortContainer?: string;
  resultCount?: string;
  clearButton?: string;
}
```

### 3.3 Layout Structure

The toolbar uses a responsive flex layout:

```tsx
// Mobile: stacked layout
// Desktop: horizontal layout with proper spacing

<div className="flex flex-col gap-4 md:gap-3">
  {/* Row 1: View toggle + Search + Sort */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    {/* View Toggle (left) */}
    {allowViewToggle && <ViewToggle ... />}

    {/* Search (center, flex-grow) */}
    {enableSearch && <SearchInput ... />}

    {/* Sort dropdown (right) */}
    {enableSort && <SortMenu ... />}
  </div>

  {/* Row 2: Filters (if enabled) */}
  {enableFilters && <FilterPanel ... />}

  {/* Row 3: Result count + Clear filters */}
  <div className="flex items-center justify-between">
    <ResultCount count={resultCount} total={totalCount} isFiltered={isFiltered} />
    {isFiltered && <ClearFiltersButton onClick={onClearFilters} />}
  </div>
</div>
```

### 3.4 View Toggle Component

The view toggle is implemented inline within ItemToolbar (not a separate file):

```tsx
function ViewToggle({
  viewMode,
  onViewModeChange,
  className,
}: {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={cn(
        "inline-flex rounded-lg border border-gray-300 p-1 bg-white",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'grid'}
        onClick={() => onViewModeChange('grid')}
        className={cn(
          "p-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
          viewMode === 'grid'
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'list'}
        onClick={() => onViewModeChange('list')}
        className={cn(
          "p-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
          viewMode === 'list'
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### 3.5 Result Count Display

```tsx
function ResultCount({
  count,
  total,
  isFiltered,
  className,
}: {
  count: number;
  total: number;
  isFiltered: boolean;
  className?: string;
}) {
  if (!isFiltered) {
    return (
      <span className={cn("text-sm text-gray-600", className)}>
        {total} {total === 1 ? 'item' : 'items'}
      </span>
    );
  }

  return (
    <span className={cn("text-sm", className)}>
      <span className="text-gray-900 font-medium">{count}</span>
      <span className="text-gray-600"> of {total} items</span>
    </span>
  );
}
```

### 3.6 Clear Filters Button

```tsx
function ClearFiltersButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium",
        "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        "rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
    >
      <X className="w-4 h-4" />
      Clear filters
    </button>
  );
}
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Main toolbar component |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/index.ts` | Add barrel export for ItemToolbar |
| `src/components/ItemManager/ItemManager.tsx` | Integrate ItemToolbar into main layout |
| `src/components/ItemManager/ItemManager.types.ts` | Add ItemToolbarProps, ItemToolbarClassNames types if not present |

### 4.3 Functions/Components to Implement

| Component/Function | File | Purpose |
|-------------------|------|---------|
| `ItemToolbar` | `ItemToolbar.tsx` | Main toolbar component |
| `ViewToggle` | `ItemToolbar.tsx` | Grid/List toggle (inline component) |
| `ResultCount` | `ItemToolbar.tsx` | Result count display (inline component) |
| `ClearFiltersButton` | `ItemToolbar.tsx` | Clear all filters button (inline component) |

### 4.4 Integration Points

The ItemToolbar will slot into `ItemManager.tsx`:

```tsx
// In ItemManager.tsx
<div className={cn("flex flex-col h-full", classNames?.container)}>
  <ItemToolbar
    viewMode={state.viewMode}
    onViewModeChange={(mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode })}
    searchQuery={state.searchQuery}
    onSearchChange={(query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query })}
    filters={state.filters}
    onFiltersChange={(filters) => dispatch({ type: 'SET_FILTERS', payload: filters })}
    onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
    sortBy={state.sortBy}
    onSortChange={(sort) => dispatch({ type: 'SET_SORT', payload: sort })}
    resultCount={searchResult.resultCount}
    totalCount={searchResult.totalCount}
    isFiltered={searchResult.isFiltered}
    filterOptions={searchResult.filterOptions}
    allowViewToggle={config.allowViewToggle}
    enableSearch={config.enableSearch}
    enableFilters={config.enableFilters}
    enableSort={config.enableSort}
    labels={config.labels}
    classNames={classNames}
  />

  {/* Item display area */}
  {state.viewMode === 'grid' ? (
    <ItemGrid items={filteredItems} ... />
  ) : (
    <ItemList items={filteredItems} ... />
  )}
</div>
```

---

## 5. Detailed Task Breakdown

### Task 2.2.1: Create ItemToolbar.tsx Base Structure

**File:** `src/components/ItemManager/components/ItemToolbar.tsx`

**Implementation:**

```typescript
/**
 * ItemToolbar Component
 *
 * Main toolbar for ItemManager with view toggle, search, filters, sort,
 * result count display, and clear filters action.
 *
 * @module ItemManager/components/ItemToolbar
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.2)
 */

'use client';

import { LayoutGrid, List, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState, SortOption, ItemManagerLabels } from '../ItemManager.types';

// ... interfaces defined in section 3.2 ...

export function ItemToolbar({
  // View mode
  viewMode,
  onViewModeChange,
  allowViewToggle = true,

  // Search
  searchQuery,
  onSearchChange,
  enableSearch = true,

  // Filters
  filters,
  onFiltersChange,
  onClearFilters,
  enableFilters = true,
  filterOptions,

  // Sort
  sortBy,
  onSortChange,
  enableSort = true,

  // Results
  resultCount,
  totalCount,
  isFiltered,

  // Customization
  labels = {},
  classNames = {},

  // Render overrides
  renderSearch,
  renderFilters,
  renderSort,
}: ItemToolbarProps) {
  return (
    <div className={cn(
      "flex flex-col gap-4 p-4 bg-white border-b border-gray-200",
      classNames.container
    )}>
      {/* Row 1: View Toggle + Search + Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* View Toggle */}
        {allowViewToggle && (
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            className={classNames.viewToggle}
          />
        )}

        {/* Search - placeholder for Task 2.3 */}
        {enableSearch && (
          <div className={cn("flex-1", classNames.searchContainer)}>
            {renderSearch ? (
              renderSearch()
            ) : (
              <SearchPlaceholder
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={labels.searchPlaceholder ?? 'Search items...'}
              />
            )}
          </div>
        )}

        {/* Sort - placeholder for Task 2.5 */}
        {enableSort && (
          <div className={classNames.sortContainer}>
            {renderSort ? (
              renderSort()
            ) : (
              <SortPlaceholder sortBy={sortBy} onSortChange={onSortChange} />
            )}
          </div>
        )}
      </div>

      {/* Row 2: Filters - placeholder for Task 2.4 */}
      {enableFilters && (
        <div className={classNames.filtersContainer}>
          {renderFilters ? (
            renderFilters()
          ) : (
            <FiltersPlaceholder
              filters={filters}
              onFiltersChange={onFiltersChange}
              filterOptions={filterOptions}
            />
          )}
        </div>
      )}

      {/* Row 3: Result Count + Clear Filters */}
      <div className="flex items-center justify-between">
        <ResultCount
          count={resultCount}
          total={totalCount}
          isFiltered={isFiltered}
          className={classNames.resultCount}
        />

        {isFiltered && (
          <ClearFiltersButton
            onClick={onClearFilters}
            className={classNames.clearButton}
          />
        )}
      </div>
    </div>
  );
}
```

### Task 2.2.2: Implement ViewToggle Sub-component

Inline component within `ItemToolbar.tsx`:

```typescript
/**
 * View toggle between grid and list modes.
 * Provides accessible radio button group semantics.
 */
function ViewToggle({
  viewMode,
  onViewModeChange,
  className,
}: {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent, mode: 'grid' | 'list') => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newMode = mode === 'grid' ? 'list' : 'grid';
      onViewModeChange(newMode);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={cn(
        "inline-flex rounded-lg border border-gray-300 p-1 bg-white shrink-0",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'grid'}
        tabIndex={viewMode === 'grid' ? 0 : -1}
        onClick={() => onViewModeChange('grid')}
        onKeyDown={(e) => handleKeyDown(e, 'grid')}
        className={cn(
          "p-2 rounded-md transition-all",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          viewMode === 'grid'
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'list'}
        tabIndex={viewMode === 'list' ? 0 : -1}
        onClick={() => onViewModeChange('list')}
        onKeyDown={(e) => handleKeyDown(e, 'list')}
        className={cn(
          "p-2 rounded-md transition-all",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          viewMode === 'list'
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### Task 2.2.3: Implement ResultCount Sub-component

```typescript
/**
 * Displays the current result count vs total.
 * Shows different format when filters are active.
 */
function ResultCount({
  count,
  total,
  isFiltered,
  className,
}: {
  count: number;
  total: number;
  isFiltered: boolean;
  className?: string;
}) {
  const itemLabel = count === 1 ? 'item' : 'items';
  const totalLabel = total === 1 ? 'item' : 'items';

  if (!isFiltered) {
    return (
      <span
        className={cn("text-sm text-gray-600", className)}
        aria-live="polite"
      >
        {total} {totalLabel}
      </span>
    );
  }

  return (
    <span
      className={cn("text-sm", className)}
      aria-live="polite"
    >
      <span className="font-medium text-gray-900">{count}</span>
      <span className="text-gray-600"> of {total} {totalLabel}</span>
      {count === 0 && (
        <span className="text-gray-500 ml-1">(no matches)</span>
      )}
    </span>
  );
}
```

### Task 2.2.4: Implement ClearFiltersButton Sub-component

```typescript
/**
 * Button to clear all active filters.
 * Only shown when filters are active.
 */
function ClearFiltersButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium",
        "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        "rounded-md transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        className
      )}
      aria-label="Clear all filters"
    >
      <X className="w-4 h-4" aria-hidden="true" />
      Clear filters
    </button>
  );
}
```

### Task 2.2.5: Implement Placeholder Components

Temporary placeholder components for Tasks 2.3-2.5:

```typescript
/**
 * Placeholder for search input (Task 2.3).
 * Will be replaced with full SearchInput component.
 */
function SearchPlaceholder({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-4 py-2 text-sm",
        "border border-gray-300 rounded-lg",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "placeholder:text-gray-400"
      )}
    />
  );
}

/**
 * Placeholder for sort menu (Task 2.5).
 * Will be replaced with full SortMenu component.
 */
function SortPlaceholder({
  sortBy,
  onSortChange,
}: {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  return (
    <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value as SortOption)}
      className={cn(
        "px-3 py-2 text-sm",
        "border border-gray-300 rounded-lg bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      )}
    >
      <option value="created-desc">Newest First</option>
      <option value="created-asc">Oldest First</option>
      <option value="title-asc">Title (A-Z)</option>
      <option value="title-desc">Title (Z-A)</option>
      <option value="updated-desc">Recently Modified</option>
      <option value="location-asc">Location (A-Z)</option>
    </select>
  );
}

/**
 * Placeholder for filter panel (Task 2.4).
 * Will be replaced with full FilterPanel component.
 */
function FiltersPlaceholder({
  filters,
  onFiltersChange,
  filterOptions,
}: {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  filterOptions?: {
    contentTypes: string[];
    tags: string[];
    locations: string[];
  };
}) {
  // Simple placeholder - full implementation in Task 2.4
  const hasFilters = Boolean(
    filters.contentTypes?.length ||
    filters.tags?.length ||
    filters.locations?.length
  );

  return (
    <div className="text-sm text-gray-500">
      {hasFilters ? (
        <span>Filters active (full UI in Task 2.4)</span>
      ) : (
        <span>No filters applied</span>
      )}
    </div>
  );
}
```

### Task 2.2.6: Export and Integrate

**File:** `src/components/ItemManager/components/index.ts`

```typescript
export { ItemToolbar } from './ItemToolbar';
export type { ItemToolbarProps } from './ItemToolbar';
```

---

## 6. Testing Requirements

### 6.1 Manual Testing Checklist

| Test Case | Expected Behavior |
|-----------|-------------------|
| View toggle renders | Grid and List buttons visible when `allowViewToggle=true` |
| View toggle click | Clicking grid/list button changes view mode |
| View toggle keyboard | Arrow keys switch between grid/list |
| View toggle hidden | Not visible when `allowViewToggle=false` |
| Result count (unfiltered) | Shows "X items" format |
| Result count (filtered) | Shows "X of Y items" format |
| Result count (no matches) | Shows "0 of Y items (no matches)" |
| Clear filters button | Only visible when `isFiltered=true` |
| Clear filters click | Calls `onClearFilters` callback |
| Search input | Placeholder renders and accepts input |
| Sort dropdown | Shows current sort and allows selection |
| Responsive layout | Stacks on mobile, horizontal on desktop |

### 6.2 Accessibility Testing

| Requirement | Implementation |
|-------------|----------------|
| View toggle has radiogroup role | `role="radiogroup"` on container |
| View buttons have radio role | `role="radio"` with `aria-checked` |
| Keyboard navigation | Arrow keys navigate between options |
| Focus visible | Focus ring on all interactive elements |
| Screen reader announce | `aria-live="polite"` on result count |
| Labels | `aria-label` on all buttons |

### 6.3 Visual Testing

| Viewport | Expected Behavior |
|----------|-------------------|
| Mobile (< 640px) | Vertical stack layout |
| Tablet (640px - 1024px) | Horizontal with wrapping |
| Desktop (> 1024px) | Full horizontal layout |

---

## 7. Acceptance Criteria

From REQ-063:

- [ ] Users see a toolbar above the item listing
- [ ] Toggle controls switch between grid and list view modes
- [ ] Result count display shows items matching current filters
- [ ] "Clear filters" action removes all active filters
- [ ] Visual feedback indicates which view mode is currently active

### Additional Technical Criteria:

- [ ] Component follows established patterns from ItemsManagement and TimeRangeSelector
- [ ] View toggle has proper ARIA attributes and keyboard navigation
- [ ] Result count updates dynamically with `aria-live`
- [ ] Clear filters button only appears when filters are active
- [ ] Component accepts className overrides via `classNames` prop
- [ ] Component uses render props for search/filter/sort customization
- [ ] All touch targets meet 44x44px minimum size

---

## 8. Integration Notes

### 8.1 State Flow

```
ItemManager (parent)
    │
    ├─── useItemManagerState (state + dispatch)
    │         │
    │         └─── state.viewMode, state.searchQuery, state.filters, state.sortBy
    │
    ├─── useItemSearch (computed values)
    │         │
    │         └─── resultCount, totalCount, isFiltered, filterOptions
    │
    └─── ItemToolbar (this component)
              │
              ├─── ViewToggle: viewMode → SET_VIEW_MODE
              ├─── Search: searchQuery → SET_SEARCH_QUERY
              ├─── Filters: filters → SET_FILTERS
              ├─── Sort: sortBy → SET_SORT
              ├─── ResultCount: ← resultCount, totalCount, isFiltered
              └─── ClearFilters: → CLEAR_FILTERS
```

### 8.2 Relationship to Other Phase 2 Tasks

| Task | Relationship |
|------|--------------|
| 2.1 (useItemSearch) | Provides `resultCount`, `totalCount`, `isFiltered`, `filterOptions` |
| 2.3 (Search UI) | Will replace `SearchPlaceholder` with full implementation |
| 2.4 (FilterPanel) | Will replace `FiltersPlaceholder` with full implementation |
| 2.5 (SortMenu) | Will replace `SortPlaceholder` with full implementation |
| 2.6 (Utilities) | May provide sort option labels, filter type labels |

### 8.3 Future Extensions

The toolbar is designed to support future additions:
- **Bulk selection mode indicator** (Phase 3)
- **Property filter** (multi-property mode)
- **Saved filters** (potential future feature)
- **View customization** (column selection for list view)

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Responsive layout issues | Medium | Low | Test on multiple devices; use flex-wrap |
| Keyboard navigation complexity | Low | Medium | Follow TimeRangeSelector pattern exactly |
| State sync issues | Low | Medium | Controlled component pattern; parent owns state |
| Placeholder replacement | Low | Low | Clear interfaces for Task 2.3-2.5 integration |

---

## 10. Appendix: Complete File After Implementation

```typescript
// src/components/ItemManager/components/ItemToolbar.tsx

/**
 * ItemToolbar Component
 *
 * Main toolbar for ItemManager with view toggle, search, filters, sort,
 * result count display, and clear filters action.
 *
 * @module ItemManager/components/ItemToolbar
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.2)
 */

'use client';

import { LayoutGrid, List, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState, SortOption, ItemManagerLabels } from '../ItemManager.types';

// ============================================================================
// Types
// ============================================================================

export interface ItemToolbarProps {
  // View mode
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  allowViewToggle?: boolean;

  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  enableSearch?: boolean;

  // Filters
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  enableFilters?: boolean;
  filterOptions?: {
    contentTypes: string[];
    tags: string[];
    locations: string[];
  };

  // Sort
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  enableSort?: boolean;

  // Results
  resultCount: number;
  totalCount: number;
  isFiltered: boolean;

  // Customization
  labels?: Partial<ItemManagerLabels>;
  classNames?: Partial<ItemToolbarClassNames>;

  // Render overrides
  renderSearch?: () => React.ReactNode;
  renderFilters?: () => React.ReactNode;
  renderSort?: () => React.ReactNode;
}

interface ItemToolbarClassNames {
  container?: string;
  viewToggle?: string;
  searchContainer?: string;
  filtersContainer?: string;
  sortContainer?: string;
  resultCount?: string;
  clearButton?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

function ViewToggle({ ... }) { ... }
function ResultCount({ ... }) { ... }
function ClearFiltersButton({ ... }) { ... }
function SearchPlaceholder({ ... }) { ... }
function SortPlaceholder({ ... }) { ... }
function FiltersPlaceholder({ ... }) { ... }

// ============================================================================
// Main Component
// ============================================================================

export function ItemToolbar({ ... }: ItemToolbarProps) {
  return (
    <div className={cn(
      "flex flex-col gap-4 p-4 bg-white border-b border-gray-200",
      classNames?.container
    )}>
      {/* Implementation as shown in Task 2.2.1 */}
    </div>
  );
}
```

---

## 11. References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.2
- [ItemsManagement](/src/components/ItemsManagement.tsx) - Toolbar pattern reference
- [TimeRangeSelector](/src/components/TimeRangeSelector.tsx) - Toggle pattern reference
- [useItemSearch](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Hook providing result data
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
