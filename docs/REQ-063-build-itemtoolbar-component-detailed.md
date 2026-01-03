# REQ-063: Build ItemToolbar Component - Detailed Task Breakdown

**Document Created:** 2026-01-03 12:45:00
**Last Modified:** 2026-01-03 15:20:00
**Request Reference:** REQ-063 (Item Toolbar with View Controls and Filter Management)
**Overview Document:** `/docs/REQ-063-build-itemtoolbar-component-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.2

---

## Document Purpose

This document provides granular, actionable tasks for implementing the `ItemToolbar` component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting these tasks, ensure the following are complete:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Phase 1 Complete | Required | Tasks 1.1-1.7 (Directory structure, types, state management) |
| Task 2.1 (useItemSearch) | Required | Provides `resultCount`, `totalCount`, `isFiltered`, `filterOptions` |
| ItemManager.types.ts exists | Required | Contains `FilterState`, `SortOption`, `ItemManagerLabels` types |
| useItemManagerState hook exists | Required | Provides state and dispatch for view mode, search, filters, sort |

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Main toolbar component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/index.ts` | Add barrel export for ItemToolbar |
| `src/components/ItemManager/ItemManager.tsx` | Integrate ItemToolbar into main layout |
| `src/components/ItemManager/ItemManager.types.ts` | Add ItemToolbarProps, ItemToolbarClassNames types if not present |

---

## Task Breakdown

### Task 2.2.1: Add ItemToolbar Type Definitions

**Estimated Effort:** 0.5 story points (1-2 hours)
**Dependencies:** Task 1.1 (Types file exists)

#### Description

Add the `ItemToolbarProps` and `ItemToolbarClassNames` interfaces to the ItemManager types file. These types define the props contract for the toolbar component.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.types.ts`
2. Add the `ItemToolbarClassNames` interface with properties for styling overrides:
   - `container?: string` - Main toolbar container
   - `viewToggle?: string` - View toggle button group
   - `searchContainer?: string` - Search input wrapper
   - `filtersContainer?: string` - Filters section wrapper
   - `sortContainer?: string` - Sort menu wrapper
   - `resultCount?: string` - Result count display
   - `clearButton?: string` - Clear filters button
3. Add the `ItemToolbarProps` interface with all required props:
   - View mode props: `viewMode`, `onViewModeChange`, `allowViewToggle`
   - Search props: `searchQuery`, `onSearchChange`, `enableSearch`
   - Filter props: `filters`, `onFiltersChange`, `onClearFilters`, `enableFilters`, `filterOptions`
   - Sort props: `sortBy`, `onSortChange`, `enableSort`
   - Result props: `resultCount`, `totalCount`, `isFiltered`
   - Customization: `labels`, `classNames`
   - Render overrides: `renderSearch`, `renderFilters`, `renderSort`
4. Export the new types from the file

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `ItemToolbarProps` and `ItemToolbarClassNames` interfaces |

#### Verification Steps

- [ ] TypeScript compiles without errors
- [ ] New types are exported and importable
- [ ] Types include JSDoc comments for each property
- [ ] All optional props have default values documented

---

### Task 2.2.2: Create ItemToolbar Base Component Shell

**Estimated Effort:** 1 story point (2-3 hours)
**Dependencies:** Task 2.2.1 (Types defined)

#### Description

Create the main `ItemToolbar.tsx` file with the component shell, imports, and basic layout structure. This establishes the component foundation before adding sub-components.

#### Implementation Steps

1. Create new file `src/components/ItemManager/components/ItemToolbar.tsx`
2. Add 'use client' directive at top
3. Add imports:
   - React and types from React
   - Icons from lucide-react: `LayoutGrid`, `List`, `X`
   - `cn` utility from `@/lib/utils`
   - Types from `../ItemManager.types`
4. Define the component with props destructuring and default values:
   - `allowViewToggle = true`
   - `enableSearch = true`
   - `enableFilters = true`
   - `enableSort = true`
   - `labels = {}`
   - `classNames = {}`
5. Implement the main layout structure with three rows:
   - Row 1: View toggle + Search + Sort (flex row with responsive stacking)
   - Row 2: Filters section (conditional)
   - Row 3: Result count + Clear filters button
6. Add placeholder divs with comments for each section
7. Export the component as named export

#### Files to Create

| File | Content |
|------|---------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Component shell with layout structure |

#### Code Structure

```tsx
// Expected component structure
<div className={cn("flex flex-col gap-4 p-4 bg-white border-b border-gray-200", classNames?.container)}>
  {/* Row 1: View Toggle + Search + Sort */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    {/* ViewToggle placeholder */}
    {/* Search placeholder */}
    {/* Sort placeholder */}
  </div>

  {/* Row 2: Filters */}
  {enableFilters && (/* Filters placeholder */)}

  {/* Row 3: Result Count + Clear Filters */}
  <div className="flex items-center justify-between">
    {/* ResultCount placeholder */}
    {/* ClearFiltersButton placeholder */}
  </div>
</div>
```

#### Verification Steps

- [ ] File created at correct path
- [ ] Component renders without errors when imported
- [ ] Props are correctly typed and have defaults
- [ ] Layout structure matches design (three rows)
- [ ] Responsive classes applied (`sm:flex-row`)
- [ ] Border and background styles match codebase patterns

---

### Task 2.2.3: Implement ViewToggle Sub-component

**Estimated Effort:** 1 story point (2-3 hours)
**Dependencies:** Task 2.2.2 (Component shell exists)

#### Description

Implement the inline `ViewToggle` sub-component within `ItemToolbar.tsx`. This provides grid/list view switching with proper accessibility attributes.

#### Implementation Steps

1. Add the `ViewToggle` function component inside `ItemToolbar.tsx` (before the main export)
2. Define props interface inline:
   - `viewMode: 'grid' | 'list'`
   - `onViewModeChange: (mode: 'grid' | 'list') => void`
   - `className?: string`
3. Implement accessibility features:
   - Container with `role="radiogroup"` and `aria-label="View mode"`
   - Buttons with `role="radio"` and `aria-checked`
   - `tabIndex` management (0 for active, -1 for inactive)
4. Implement keyboard navigation:
   - Arrow keys switch between grid/list
   - Use `handleKeyDown` function for ArrowLeft/ArrowRight
5. Apply styling based on active state:
   - Active: `bg-blue-600 text-white shadow-sm`
   - Inactive: `text-gray-600 hover:bg-gray-100`
   - Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`
6. Use Lucide icons: `LayoutGrid` for grid, `List` for list
7. Wire up the ViewToggle in the main component (Row 1)
8. Conditionally render based on `allowViewToggle` prop

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add ViewToggle sub-component and wire up in layout |

#### Reference Pattern

Follow the toggle pattern from `/src/components/TimeRangeSelector.tsx`:
- Multi-button toggle with radio-like semantics
- Full keyboard navigation
- ARIA support for screen readers

#### Verification Steps

- [ ] Grid button shows LayoutGrid icon
- [ ] List button shows List icon
- [ ] Clicking grid button triggers `onViewModeChange('grid')`
- [ ] Clicking list button triggers `onViewModeChange('list')`
- [ ] Active button has blue background and white text
- [ ] Inactive button has gray text and hover effect
- [ ] Arrow keys navigate between options
- [ ] Focus ring visible on keyboard navigation
- [ ] Screen reader announces "View mode" radiogroup
- [ ] Toggle hidden when `allowViewToggle={false}`

---

### Task 2.2.4: Implement ResultCount Sub-component

**Estimated Effort:** 0.5 story points (1-2 hours)
**Dependencies:** Task 2.2.2 (Component shell exists)

#### Description

Implement the inline `ResultCount` sub-component that displays the current item count. Shows different formats based on whether filters are active.

#### Implementation Steps

1. Add the `ResultCount` function component inside `ItemToolbar.tsx`
2. Define props interface inline:
   - `count: number` - Current filtered count
   - `total: number` - Total items before filtering
   - `isFiltered: boolean` - Whether any filters/search active
   - `className?: string`
3. Implement display logic:
   - Unfiltered: Show "{total} items" (or "item" if singular)
   - Filtered: Show "{count} of {total} items"
   - No matches: Add "(no matches)" suffix when count is 0 and isFiltered
4. Use proper pluralization helper (inline or simple ternary)
5. Add `aria-live="polite"` for screen reader updates
6. Wire up in the main component (Row 3, left side)
7. Accept and apply className prop for customization

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add ResultCount sub-component and wire up |

#### Expected Output Examples

| State | Display |
|-------|---------|
| 10 items, no filter | "10 items" |
| 1 item, no filter | "1 item" |
| 5 of 10 items, filtered | "5 of 10 items" |
| 0 of 10 items, filtered | "0 of 10 items (no matches)" |

#### Verification Steps

- [ ] Displays total count when not filtered
- [ ] Displays "X of Y items" format when filtered
- [ ] Shows "(no matches)" when count is 0 and filtered
- [ ] Uses singular "item" for count of 1
- [ ] Has `aria-live="polite"` for accessibility
- [ ] Accepts and applies className prop
- [ ] Updates dynamically when props change

---

### Task 2.2.5: Implement ClearFiltersButton Sub-component

**Estimated Effort:** 0.5 story points (1-2 hours)
**Dependencies:** Task 2.2.2 (Component shell exists)

#### Description

Implement the inline `ClearFiltersButton` sub-component that allows users to reset all active filters with a single click.

#### Implementation Steps

1. Add the `ClearFiltersButton` function component inside `ItemToolbar.tsx`
2. Define props interface inline:
   - `onClick: () => void` - Callback to clear all filters
   - `className?: string`
3. Implement button with icon and text:
   - X icon from Lucide (`X` component)
   - "Clear filters" text label
   - Inline flex layout with gap
4. Apply styling:
   - Text style: `text-sm font-medium text-gray-600`
   - Hover: `hover:text-gray-900 hover:bg-gray-100`
   - Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`
   - Rounded and transitions: `rounded-md transition-colors`
5. Add accessibility:
   - `aria-label="Clear all filters"`
   - Icon has `aria-hidden="true"`
6. Wire up in main component (Row 3, right side)
7. Conditionally render only when `isFiltered` is true

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add ClearFiltersButton sub-component and wire up |

#### Verification Steps

- [ ] Button displays X icon and "Clear filters" text
- [ ] Clicking button triggers `onClearFilters` callback
- [ ] Button only visible when `isFiltered={true}`
- [ ] Button hidden when no filters active
- [ ] Hover state shows darker text and gray background
- [ ] Focus ring visible on keyboard focus
- [ ] Screen reader announces "Clear all filters"
- [ ] Accepts and applies className prop

---

### Task 2.2.6: Implement Search Placeholder Component

**Estimated Effort:** 0.5 story points (1-2 hours)
**Dependencies:** Task 2.2.2 (Component shell exists)

#### Description

Implement a temporary `SearchPlaceholder` sub-component that provides basic search input functionality. This will be replaced by the full `SearchInput` component in Task 2.3.

#### Implementation Steps

1. Add the `SearchPlaceholder` function component inside `ItemToolbar.tsx`
2. Define props interface inline:
   - `value: string` - Current search query
   - `onChange: (value: string) => void` - Callback for value changes
   - `placeholder: string` - Placeholder text
3. Implement basic text input:
   - Use native `<input type="text">`
   - Wire value and onChange
   - Full width with `w-full`
4. Apply styling matching codebase patterns:
   - Padding: `px-4 py-2`
   - Text: `text-sm`
   - Border: `border border-gray-300 rounded-lg`
   - Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`
   - Placeholder: `placeholder:text-gray-400`
5. Wire up in main component (Row 1, center, with flex-1)
6. Conditionally render based on `enableSearch` prop
7. Support `renderSearch` prop for custom rendering

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add SearchPlaceholder sub-component and wire up |

#### Verification Steps

- [ ] Input renders with placeholder text
- [ ] Typing updates value via onChange callback
- [ ] Input has proper styling (border, focus ring)
- [ ] Input takes flex-1 width in row
- [ ] Hidden when `enableSearch={false}`
- [ ] Custom `renderSearch` renders instead when provided
- [ ] Placeholder text uses `labels.searchPlaceholder` or default

---

### Task 2.2.7: Implement Sort Placeholder Component

**Estimated Effort:** 0.5 story points (1-2 hours)
**Dependencies:** Task 2.2.2 (Component shell exists)

#### Description

Implement a temporary `SortPlaceholder` sub-component that provides basic sort selection. This will be replaced by the full `SortMenu` component in Task 2.5.

#### Implementation Steps

1. Add the `SortPlaceholder` function component inside `ItemToolbar.tsx`
2. Define props interface inline:
   - `sortBy: SortOption` - Current sort option
   - `onSortChange: (sort: SortOption) => void` - Callback for sort changes
3. Implement native select element with sort options:
   - "Newest First" (`created-desc`)
   - "Oldest First" (`created-asc`)
   - "Title (A-Z)" (`title-asc`)
   - "Title (Z-A)" (`title-desc`)
   - "Recently Modified" (`updated-desc`)
   - "Location (A-Z)" (`location-asc`)
4. Apply styling:
   - Padding: `px-3 py-2`
   - Text: `text-sm`
   - Border: `border border-gray-300 rounded-lg bg-white`
   - Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`
5. Wire up in main component (Row 1, right side)
6. Conditionally render based on `enableSort` prop
7. Support `renderSort` prop for custom rendering

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add SortPlaceholder sub-component and wire up |

#### Verification Steps

- [ ] Select shows current sort option as selected
- [ ] All 6 sort options are available
- [ ] Changing selection triggers onSortChange callback
- [ ] Select has proper styling (border, focus ring)
- [ ] Hidden when `enableSort={false}`
- [ ] Custom `renderSort` renders instead when provided

---

### Task 2.2.8: Implement Filters Placeholder Component

**Estimated Effort:** 0.5 story points (1-2 hours)
**Dependencies:** Task 2.2.2 (Component shell exists)

#### Description

Implement a temporary `FiltersPlaceholder` sub-component that indicates filter status. This will be replaced by the full `FilterPanel` component in Task 2.4.

#### Implementation Steps

1. Add the `FiltersPlaceholder` function component inside `ItemToolbar.tsx`
2. Define props interface inline:
   - `filters: FilterState` - Current filter state
   - `onFiltersChange: (filters: Partial<FilterState>) => void` - Callback for changes
   - `filterOptions?: { contentTypes: string[]; tags: string[]; locations: string[] }`
3. Implement simple status display:
   - Check if any filters active (contentTypes, tags, locations arrays have length)
   - If active: "Filters active (full UI in Task 2.4)"
   - If not active: "No filters applied"
4. Use simple gray text styling: `text-sm text-gray-500`
5. Wire up in main component (Row 2)
6. Conditionally render based on `enableFilters` prop
7. Support `renderFilters` prop for custom rendering

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add FiltersPlaceholder sub-component and wire up |

#### Verification Steps

- [ ] Shows "No filters applied" when no filters active
- [ ] Shows "Filters active" message when filters are set
- [ ] Hidden when `enableFilters={false}`
- [ ] Custom `renderFilters` renders instead when provided
- [ ] Accepts filterOptions prop (for future use)

---

### Task 2.2.9: Add Barrel Export for ItemToolbar

**Estimated Effort:** 0.25 story points (30 minutes)
**Dependencies:** Task 2.2.2 (Component exists)

#### Description

Export the ItemToolbar component and its types from the components barrel export file.

#### Implementation Steps

1. Open or create `src/components/ItemManager/components/index.ts`
2. Add export statement: `export { ItemToolbar } from './ItemToolbar'`
3. Add type export: `export type { ItemToolbarProps } from './ItemToolbar'`
4. Verify imports work from parent directory

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/components/index.ts` | Add exports for ItemToolbar |

#### Verification Steps

- [ ] ItemToolbar importable from `./components`
- [ ] ItemToolbarProps type importable from `./components`
- [ ] No circular dependency warnings
- [ ] TypeScript compiles without errors

---

### Task 2.2.10: Integrate ItemToolbar into ItemManager

**Estimated Effort:** 1 story point (2-3 hours)
**Dependencies:** Tasks 2.2.1-2.2.9 complete, Task 2.1 (useItemSearch) complete

#### Description

Wire up the ItemToolbar component into the main ItemManager component, connecting it to state management and the useItemSearch hook.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.tsx`
2. Import ItemToolbar from `./components`
3. Import useItemSearch from `./hooks`
4. In the component body, call useItemSearch with state values:
   ```typescript
   const searchResult = useItemSearch({
     items,
     searchQuery: state.searchQuery,
     filters: state.filters,
     sortBy: state.sortBy,
   });
   ```
5. Add ItemToolbar to the component JSX before the item display area
6. Wire up all props from state and dispatch:
   - `viewMode={state.viewMode}`
   - `onViewModeChange={(mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode })}`
   - `searchQuery={state.searchQuery}`
   - `onSearchChange={(query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query })}`
   - `filters={state.filters}`
   - `onFiltersChange={(filters) => dispatch({ type: 'SET_FILTERS', payload: filters })}`
   - `onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}`
   - `sortBy={state.sortBy}`
   - `onSortChange={(sort) => dispatch({ type: 'SET_SORT', payload: sort })}`
   - `resultCount={searchResult.resultCount}`
   - `totalCount={searchResult.totalCount}`
   - `isFiltered={searchResult.isFiltered}`
   - `filterOptions={searchResult.filterOptions}`
7. Pass through config options:
   - `allowViewToggle={config.allowViewToggle}`
   - `enableSearch={config.enableSearch}`
   - `enableFilters={config.enableFilters}`
   - `enableSort={config.enableSort}`
8. Pass through customization props:
   - `labels={config.labels}`
   - `classNames={classNames}`

#### Files to Modify

| File | Change |
|------|--------|
| `src/components/ItemManager/ItemManager.tsx` | Import and render ItemToolbar with proper props |

#### Verification Steps

- [ ] ItemToolbar renders above item display area
- [ ] View toggle changes view mode in state
- [ ] Search input updates search query in state
- [ ] Sort dropdown updates sort option in state
- [ ] Result count displays correct filtered count
- [ ] Clear filters button resets all filters
- [ ] Config options correctly enable/disable features
- [ ] Filtered items from useItemSearch used for display

---

### Task 2.2.11: Manual Testing and Verification

**Estimated Effort:** 1 story point (2-3 hours)
**Dependencies:** Task 2.2.10 complete

#### Description

Perform comprehensive manual testing of the ItemToolbar component across different scenarios, devices, and accessibility requirements.

#### Testing Checklist

**Functional Testing:**

- [ ] View toggle renders when `allowViewToggle=true`
- [ ] View toggle hidden when `allowViewToggle=false`
- [ ] Clicking grid button switches to grid view
- [ ] Clicking list button switches to list view
- [ ] Active view button has correct visual state
- [ ] Search input accepts and displays text
- [ ] Search input updates state on change
- [ ] Sort dropdown shows all options
- [ ] Sort dropdown updates state on change
- [ ] Result count shows total when not filtered
- [ ] Result count shows "X of Y" when filtered
- [ ] Result count shows "(no matches)" when zero results
- [ ] Clear filters button only visible when filtered
- [ ] Clear filters button resets all filters

**Accessibility Testing:**

- [ ] View toggle announced as radiogroup by screen reader
- [ ] Arrow keys navigate view toggle options
- [ ] Focus ring visible on all interactive elements
- [ ] Tab order is logical (left to right, top to bottom)
- [ ] Clear filters button has aria-label
- [ ] Result count announced on filter changes (aria-live)

**Responsive Testing:**

| Viewport | Expected Layout |
|----------|-----------------|
| Mobile (< 640px) | Stacked: view toggle, search, sort vertically |
| Tablet (640px+) | Horizontal: all controls in single row |
| Desktop (1024px+) | Full horizontal with comfortable spacing |

**Edge Cases:**

- [ ] Works with 0 items
- [ ] Works with 1 item (singular text)
- [ ] Works with 1000+ items
- [ ] All features disabled still renders (empty toolbar)
- [ ] Custom renderSearch/renderFilters/renderSort work

#### Verification Steps

- [ ] All functional tests pass
- [ ] All accessibility tests pass
- [ ] All responsive breakpoints work
- [ ] All edge cases handled
- [ ] No console errors or warnings
- [ ] No TypeScript errors

---

## Summary

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| 2.2.1 | Add ItemToolbar type definitions | 0.5 SP | Task 1.1 |
| 2.2.2 | Create ItemToolbar base component shell | 1 SP | Task 2.2.1 |
| 2.2.3 | Implement ViewToggle sub-component | 1 SP | Task 2.2.2 |
| 2.2.4 | Implement ResultCount sub-component | 0.5 SP | Task 2.2.2 |
| 2.2.5 | Implement ClearFiltersButton sub-component | 0.5 SP | Task 2.2.2 |
| 2.2.6 | Implement Search placeholder | 0.5 SP | Task 2.2.2 |
| 2.2.7 | Implement Sort placeholder | 0.5 SP | Task 2.2.2 |
| 2.2.8 | Implement Filters placeholder | 0.5 SP | Task 2.2.2 |
| 2.2.9 | Add barrel export for ItemToolbar | 0.25 SP | Task 2.2.2 |
| 2.2.10 | Integrate ItemToolbar into ItemManager | 1 SP | Tasks 2.2.1-2.2.9, Task 2.1 |
| 2.2.11 | Manual testing and verification | 1 SP | Task 2.2.10 |

**Total Estimated Effort:** ~7.25 story points

---

## Acceptance Criteria Checklist

From REQ-063:

- [ ] Toolbar is visible and positioned consistently above item listings
- [ ] View toggle buttons allow switching between available display modes
- [ ] Active view mode is clearly indicated visually
- [ ] Result count updates dynamically as filters are applied or removed
- [ ] "Clear filters" action is accessible and removes all active filters when triggered

### Additional Technical Criteria:

- [ ] Component follows established patterns from ItemsManagement and TimeRangeSelector
- [ ] View toggle has proper ARIA attributes and keyboard navigation
- [ ] Result count updates dynamically with `aria-live`
- [ ] Clear filters button only appears when filters are active
- [ ] Component accepts className overrides via `classNames` prop
- [ ] Component uses render props for search/filter/sort customization
- [ ] All touch targets meet 44x44px minimum size
- [ ] Responsive layout works on mobile, tablet, and desktop

---

## References

- [Overview Document](/docs/REQ-063-build-itemtoolbar-component-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.2
- [REQ-062 useItemSearch](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Dependency
- [ItemsManagement](/src/components/ItemsManagement.tsx) - Toolbar pattern reference
- [TimeRangeSelector](/src/components/TimeRangeSelector.tsx) - Toggle pattern reference
