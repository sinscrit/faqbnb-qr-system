# Task Breakdown: REQ-220 Full Toolbar Infrastructure for Guides List Page

## Document Information
| Field | Value |
|-------|-------|
| Request Reference | #220 |
| Overview Document | docs/req-220-toolbar-infrastructure-guides-list-overview.md |
| Created | 2026-01-13 22:20 PST |
| Total Tasks | 6 |
| Estimated Total Effort | 6-8 hours |

---

## Task 1: Create useGuideSearch Hook

### Description
Create a custom React hook that handles filtering, searching, and sorting of guide data. This hook centralizes all search/filter logic and provides computed values for the UI.

### Acceptance Criteria
- [ ] Hook accepts guides array, search query, filter state, and sort option
- [ ] Returns filtered/sorted guides array
- [ ] Returns computed filter options (purpose types from data)
- [ ] Debouncing is handled at the component level (using existing useDebounce hook)
- [ ] Search matches against title, item name, and purpose
- [ ] Includes `isFiltered` boolean for showing clear filters button

### Technical Details

**File to Create**: `src/components/InstructionsTable/hooks/useGuideSearch.ts`

```typescript
// Types to define
export interface GuideFilterState {
  search?: string;
  purposes?: string[];
  propertyIds?: string[];
}

export interface UseGuideSearchOptions {
  guides: InstructionRow[];
  searchQuery: string;
  filters: GuideFilterState;
  sortBy: GuideSortOption;
}

export interface UseGuideSearchReturn {
  filteredGuides: InstructionRow[];
  resultCount: number;
  totalCount: number;
  isFiltered: boolean;
  hasResults: boolean;
  filterOptions: {
    purposes: string[];
    propertyIds: string[];
  };
}
```

### Implementation Notes
- Use `useMemo` for memoizing filtered results
- Search should be case-insensitive
- Purpose filter should support multi-select
- Extract unique purposes from all guides for filter options

### Dependencies
- InstructionRow type from InstructionsTable.types.ts
- GuideSortOption type from InstructionsTable.types.ts

### Estimated Effort
S (1-2 hours)

---

## Task 2: Create GuideToolbar Component

### Description
Build a toolbar component that provides search input, view toggle, and purpose filter controls. This matches the layout and styling of the ItemToolbar component.

### Acceptance Criteria
- [ ] Search input with clear button and debounced updates
- [ ] View toggle buttons (grid/list) with proper accessibility
- [ ] Purpose filter dropdown with multi-select capability
- [ ] Clear filters button appears when filters are active
- [ ] 48px minimum touch targets on mobile
- [ ] Matches visual design of ItemToolbar

### Technical Details

**File to Create**: `src/components/InstructionsTable/GuideToolbar.tsx`

```typescript
export interface GuideToolbarProps {
  // View mode
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;

  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Filters
  filters: GuideFilterState;
  onFiltersChange: (filters: Partial<GuideFilterState>) => void;
  onClearFilters: () => void;

  // Filter options
  filterOptions: {
    purposes: string[];
  };

  // State indicators
  resultCount: number;
  totalCount: number;
  isFiltered: boolean;
}
```

### Sub-components to include
1. **ViewToggle** - Reuse pattern from ItemToolbar
2. **SearchInput** - Import from ItemManager/components/SearchInput
3. **PurposeFilterDropdown** - New dropdown for purpose filtering
4. **ClearFiltersButton** - Reuse pattern from ItemToolbar

### Implementation Notes
- Import SearchInput from `@/components/ItemManager/components/SearchInput`
- Create ViewToggle inline (following ItemToolbar pattern)
- Create PurposeFilterDropdown with Radix DropdownMenu
- Layout: View toggle + Search + Purpose filter in row

### Dependencies
- SearchInput from ItemManager
- useDebounce hook from ItemManager
- @radix-ui/react-dropdown-menu

### Estimated Effort
M (2-3 hours)

---

## Task 3: Create GuideGrid Component

### Description
Build a responsive grid container component that renders guides in a tile layout. This matches the ItemGrid component pattern.

### Acceptance Criteria
- [ ] Responsive grid layout (1 col mobile, 2 col sm, 3 col md, 4 col lg, etc.)
- [ ] Proper ARIA grid role and labels
- [ ] Renders GuideCard for each guide
- [ ] Handles empty state gracefully

### Technical Details

**File to Create**: `src/components/InstructionsTable/GuideGrid.tsx`

```typescript
export interface GuideGridProps {
  guides: InstructionRow[];
  onEdit: (articleId: string) => void;
  loading?: boolean;
  className?: string;
}
```

### Implementation Notes
- Use Tailwind responsive grid classes matching ItemGrid
- Grid classes: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Map guides to GuideCard components

### Dependencies
- GuideCard component (Task 4)
- InstructionRow type

### Estimated Effort
S (1 hour)

---

## Task 4: Create GuideCard Component

### Description
Build an individual guide card component for the grid view display. Shows guide title, item name, purpose badge, and edit action.

### Acceptance Criteria
- [ ] Displays guide title prominently
- [ ] Shows item name as secondary info
- [ ] Shows room if available
- [ ] Purpose type displayed as colored badge
- [ ] Hover/focus states for interactivity
- [ ] Edit button triggers onEdit callback
- [ ] Keyboard accessible (Enter/Space to edit)

### Technical Details

**File to Create**: `src/components/InstructionsTable/GuideCard.tsx`

```typescript
export interface GuideCardProps {
  guide: InstructionRow;
  onEdit: (articleId: string) => void;
  className?: string;
}
```

### Implementation Notes
- Reuse `getPurposeBadgeColor` and `formatPurposeLabel` from InstructionsTable
- Card layout: purpose badge top-right, title, item name, room (optional)
- Edit button visible on hover or always visible on mobile
- Use similar card styling as ItemCard (rounded-xl, shadow, border)

### Dependencies
- InstructionRow type
- cn utility
- lucide-react icons (Pencil)

### Estimated Effort
S (1 hour)

---

## Task 5: Extend InstructionsTable for Property Column

### Description
Add an optional Property column to the existing table view that shows which property each guide belongs to. Update column visibility settings.

### Acceptance Criteria
- [ ] Property column added to table (hidden by default)
- [ ] Column appears between Room and Purpose columns
- [ ] Property name displayed (resolved from item data)
- [ ] Column visibility toggle added to GuideColumnSettingsPopup
- [ ] Column visibility persists in sessionStorage

### Technical Details

**Files to Modify**:

1. `src/components/InstructionsTable/InstructionsTable.types.ts`:
```typescript
// Add to GuideColumnVisibilityState
export interface GuideColumnVisibilityState {
  room: boolean;
  purpose: boolean;
  property: boolean;  // NEW - default: false
}

// Add to InstructionRow
export interface InstructionRow {
  // ... existing fields
  propertyId?: string;    // NEW
  propertyName?: string;  // NEW
}
```

2. `src/components/InstructionsTable/InstructionsTable.tsx`:
- Add Property column header (between Room and Purpose)
- Add Property column cells with propertyName or fallback

3. `src/components/InstructionsTable/useGuideColumnVisibility.ts`:
- Update DEFAULT_VISIBILITY to include `property: false`

4. `src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`:
- Add property to COLUMN_OPTIONS array

### Implementation Notes
- Property column should be hidden on mobile (hidden md:table-cell)
- If propertyName is not available, show "-" or "Default Property"
- Update colspan calculation in InstructionsTable

### Dependencies
- None (modifying existing files)

### Estimated Effort
S (30 min)

---

## Task 6: Integrate Toolbar and Views in Page Component

### Description
Wire up all new components in the instructions page with proper state management, combining search, filtering, sorting, and view switching.

### Acceptance Criteria
- [ ] GuideToolbar renders above the content area
- [ ] View toggle switches between GuideGrid and InstructionsTable
- [ ] Search filters guides with debounced updates
- [ ] Purpose filter filters by selected purposes
- [ ] Clear filters resets all filters and search
- [ ] View mode persists in session storage
- [ ] Sorting works in both views
- [ ] Loading and empty states work correctly

### Technical Details

**File to Modify**: `src/app/dashboard2/instructions/page.tsx`

State additions:
```typescript
// View mode state
const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

// Search state (for debouncing)
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

// Filter state
const [filters, setFilters] = useState<GuideFilterState>({});

// Use the hook
const {
  filteredGuides,
  isFiltered,
  filterOptions,
  resultCount
} = useGuideSearch({
  guides: instructionsData,
  searchQuery: debouncedSearch,
  filters,
  sortBy: currentSort,
});
```

### Layout Structure
```tsx
<div>
  {/* Success message banner */}

  {/* Page Header */}
  <div>
    <h1>Guides</h1>
    <p>Manage guide articles for your items</p>
    <span>{resultCount} articles</span>
  </div>

  {/* Toolbar */}
  <GuideToolbar
    viewMode={viewMode}
    onViewModeChange={setViewMode}
    searchQuery={searchQuery}
    onSearchChange={setSearchQuery}
    filters={filters}
    onFiltersChange={(partial) => setFilters(prev => ({ ...prev, ...partial }))}
    onClearFilters={handleClearFilters}
    filterOptions={filterOptions}
    resultCount={resultCount}
    totalCount={instructionsData.length}
    isFiltered={isFiltered}
  />

  {/* Content Area */}
  {viewMode === 'grid' ? (
    <GuideGrid guides={filteredGuides} onEdit={handleEditArticle} />
  ) : (
    <InstructionsTable
      instructions={filteredGuides}
      onEdit={handleEditArticle}
      currentSort={currentSort}
      onSortChange={handleSortChange}
      columnVisibility={columnVisibility}
      onToggleColumn={toggleColumn}
    />
  )}
</div>
```

### Implementation Notes
- Import useDebounce from ItemManager hooks
- Add view mode to session storage (similar to column visibility)
- Handle clear filters to reset search query too
- Update empty state to show different messages for filtered vs no data

### Dependencies
- useGuideSearch hook (Task 1)
- GuideToolbar component (Task 2)
- GuideGrid component (Task 3)
- useDebounce from ItemManager

### Estimated Effort
S (1 hour)

---

## Implementation Order

1. **Task 1**: useGuideSearch hook (foundation)
2. **Task 4**: GuideCard component (no dependencies)
3. **Task 3**: GuideGrid component (depends on GuideCard)
4. **Task 2**: GuideToolbar component (can use placeholder)
5. **Task 5**: InstructionsTable Property column (independent)
6. **Task 6**: Page integration (depends on all above)

## Validation Checklist

After implementation, verify:
- [ ] Search filters guides as user types
- [ ] Clear button in search input works
- [ ] View toggle switches between grid and list
- [ ] Purpose filter dropdown works with multi-select
- [ ] Clear filters button resets everything
- [ ] Property column toggles in column settings
- [ ] Sorting works in both views
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation works throughout
- [ ] No console errors or warnings

---
*Document generated: 2026-01-13 22:20 PST*
