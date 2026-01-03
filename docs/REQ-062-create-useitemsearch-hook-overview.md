# REQ-062: Create useItemSearch Hook - Technical Implementation Overview

**Document Created:** 2026-01-03 09:15:00
**Last Modified:** 2026-01-03 09:15:00
**Request Reference:** REQ-062 (Search, Filter, and Sort Hook for Item Management)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.1

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating the `useItemSearch` hook, the first task of Phase 2 in the ItemManager component implementation. This hook is the foundation for all search, filter, and sort functionality, providing client-side data processing for the ItemManager component.

### Scope

The `useItemSearch` hook will:
- Implement search query matching across item fields (title, location, tags, instructions)
- Apply filter logic with AND semantics for multiple active filters
- Implement sort comparators for all defined sort options
- Return a filtered/sorted items array for display

### Dependencies

- **Requires Phase 1 Completion:** This task depends on task 1.1 (Directory Structure & Types) being complete, as it needs the `ItemManager.types.ts` file with `FilterState`, `SortOption`, and related types.
- **Parallel Work:** Can be developed in parallel with Phase 3 (Selection & Bulk Actions) once Phase 1 is complete.

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Hook Pattern | useReducer for complex state, useState for simple | ItemCapture hooks |
| Memoization | useMemo for computed values, useCallback for functions | Established pattern |
| Utility | `cn()` from `src/lib/utils.ts` | Tailwind class merging |

### 2.2 Reference Patterns from Codebase

**Primary Pattern Reference:** `/src/components/ItemCapture/hooks/useItemValidation.ts`
- Lightweight validation hook using `useMemo` for computed values
- Pure function helpers for reusable logic
- Clear separation of concerns

**Secondary Pattern Reference:** `/src/components/ItemsManagement.tsx`
- Existing search implementation (simple string matching):
```typescript
const filteredItems = items?.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.publicId.toLowerCase().includes(searchTerm.toLowerCase())
) || [];
```

**State Pattern Reference:** `/src/components/ItemCapture/hooks/useItemCaptureState.ts`
- Uses discriminated union for action types
- Returns object with state + action methods
- Computed values via `useMemo`

### 2.3 Types from Implementation Plan

The following types are defined in the implementation plan and must be created in `ItemManager.types.ts`:

```typescript
export interface FilterState {
  search?: string;
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;
  tags?: string[];
  locations?: string[];
  propertyIds?: string[];
}

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'location-asc';
```

---

## 3. Implementation Approach

### 3.1 Hook Architecture

The `useItemSearch` hook follows a presentation-focused pattern (similar to `useItemValidation`), where:
- Items array is passed in as a parameter
- Filter state and sort option are passed as parameters
- Hook returns computed/memoized filtered+sorted results
- No internal state management (state lives in parent/`useItemManagerState`)

```typescript
// Proposed hook signature
interface UseItemSearchOptions {
  items: ItemRecord[];
  searchQuery: string;
  filters: FilterState;
  sortBy: SortOption;
  caseSensitive?: boolean; // default: false
  debug?: boolean;
}

interface UseItemSearchReturn {
  // Results
  filteredItems: ItemRecord[];
  resultCount: number;

  // Computed state
  isFiltered: boolean;
  hasResults: boolean;

  // Utilities (for external use)
  matchesSearch: (item: ItemRecord, query: string) => boolean;
  matchesFilters: (item: ItemRecord, filters: FilterState) => boolean;
}
```

### 3.2 Search Matching Algorithm

Search will match against multiple fields with case-insensitive partial matching:

```typescript
// Fields to search
const SEARCHABLE_FIELDS = ['title', 'location', 'tags', 'instructions'] as const;

// Matching logic (OR across fields)
function matchesSearch(item: ItemRecord, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = query.toLowerCase().trim();

  // Title match
  if (item.title.toLowerCase().includes(normalizedQuery)) return true;

  // Location match
  if (item.location?.toLowerCase().includes(normalizedQuery)) return true;

  // Tags match (any tag containing query)
  if (item.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))) return true;

  // Instructions match
  if (item.instructions?.toLowerCase().includes(normalizedQuery)) return true;

  return false;
}
```

### 3.3 Filter Application Logic

Filters use AND semantics - items must match ALL active filters:

```typescript
function matchesFilters(item: ItemRecord, filters: FilterState): boolean {
  // Content type filter (if any selected, item must match one)
  if (filters.contentTypes?.length) {
    const itemContentType = deriveContentType(item);
    if (!filters.contentTypes.includes(itemContentType)) return false;
  }

  // Tag filter (item must have ALL specified tags)
  if (filters.tags?.length) {
    if (!filters.tags.every(tag => item.tags?.includes(tag))) return false;
  }

  // Location filter (if any selected, item must match one)
  if (filters.locations?.length) {
    if (!item.location || !filters.locations.includes(item.location)) return false;
  }

  // Property filter (multi-property mode)
  if (filters.propertyIds?.length) {
    const extendedItem = item as ItemRecordExtended;
    if (!extendedItem.propertyId || !filters.propertyIds.includes(extendedItem.propertyId)) {
      return false;
    }
  }

  return true;
}
```

### 3.4 Sort Comparators

Sort comparators as defined in implementation plan Appendix B:

```typescript
const sortComparators: Record<SortOption, (a: ItemRecord, b: ItemRecord) => number> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'created-desc': (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  'created-asc': (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  'updated-desc': (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
  'updated-asc': (a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0),
  'location-asc': (a, b) => (a.location ?? '').localeCompare(b.location ?? ''),
};
```

### 3.5 Memoization Strategy

The hook must efficiently memoize results to prevent unnecessary re-renders:

```typescript
export function useItemSearch(options: UseItemSearchOptions): UseItemSearchReturn {
  const { items, searchQuery, filters, sortBy, caseSensitive = false, debug = false } = options;

  // Memoize filter/sort logic
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply search
    if (searchQuery.trim()) {
      result = result.filter(item => matchesSearch(item, searchQuery, caseSensitive));
    }

    // Apply filters
    if (hasActiveFilters(filters)) {
      result = result.filter(item => matchesFilters(item, filters));
    }

    // Apply sort
    const comparator = sortComparators[sortBy];
    if (comparator) {
      result = [...result].sort(comparator);
    }

    return result;
  }, [items, searchQuery, filters, sortBy, caseSensitive]);

  // Computed values
  const resultCount = filteredItems.length;
  const isFiltered = Boolean(searchQuery.trim()) || hasActiveFilters(filters);
  const hasResults = resultCount > 0;

  // Return stable object reference
  return useMemo(() => ({
    filteredItems,
    resultCount,
    isFiltered,
    hasResults,
    matchesSearch: (item, query) => matchesSearch(item, query, caseSensitive),
    matchesFilters,
  }), [filteredItems, resultCount, isFiltered, hasResults, caseSensitive]);
}
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/hooks/useItemSearch.ts` | Main hook implementation |
| `src/components/ItemManager/utils/filterUtils.ts` | Filter helper functions |
| `src/components/ItemManager/utils/sortUtils.ts` | Sort comparator functions |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/hooks/index.ts` | Add barrel export for useItemSearch |
| `src/components/ItemManager/ItemManager.types.ts` | Ensure FilterState, SortOption types exist (may already be created in Phase 1) |

### 4.3 Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `useItemSearch` | `useItemSearch.ts` | Main hook function |
| `matchesSearch` | `filterUtils.ts` | Search matching logic |
| `matchesFilters` | `filterUtils.ts` | Filter application logic |
| `hasActiveFilters` | `filterUtils.ts` | Check if any filters are active |
| `deriveContentType` | `filterUtils.ts` | Derive content type from item's media |
| `sortComparators` | `sortUtils.ts` | Record of all sort comparators |
| `createSortComparator` | `sortUtils.ts` | Factory for custom comparators |

---

## 5. Detailed Task Breakdown

### Task 2.1.1: Create filterUtils.ts

**File:** `src/components/ItemManager/utils/filterUtils.ts`

**Functions to Implement:**

1. **`matchesSearch(item: ItemRecord, query: string, caseSensitive?: boolean): boolean`**
   - Search across title, location, tags array, and instructions
   - Case-insensitive by default
   - Returns true if query is empty

2. **`matchesFilters(item: ItemRecord, filters: FilterState): boolean`**
   - AND logic for filter categories
   - Handle each filter type: contentTypes, tags, locations, propertyIds
   - Return true if no filters active

3. **`hasActiveFilters(filters: FilterState): boolean`**
   - Check if any filter array has items
   - Used to optimize rendering (skip filter logic if no filters)

4. **`deriveContentType(item: ItemRecord): string`**
   - Derive the effective content type from item's media array
   - Handle 'media', 'text-only', 'pdf-only', 'mixed' cases

**Example Implementation:**

```typescript
/**
 * Filter utilities for ItemManager search and filter operations.
 * All functions are pure and side-effect free.
 *
 * @module ItemManager/utils/filterUtils
 */

import type { ItemRecord, FilterState, ItemRecordExtended } from '../ItemManager.types';

/**
 * Check if an item matches the search query.
 * Searches across: title, location, tags, instructions
 */
export function matchesSearch(
  item: ItemRecord,
  query: string,
  caseSensitive = false
): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = caseSensitive ? query.trim() : query.toLowerCase().trim();
  const normalize = (str: string) => caseSensitive ? str : str.toLowerCase();

  // Title match
  if (normalize(item.title).includes(normalizedQuery)) return true;

  // Location match
  if (item.location && normalize(item.location).includes(normalizedQuery)) return true;

  // Tags match (any tag)
  if (item.tags?.some(tag => normalize(tag).includes(normalizedQuery))) return true;

  // Instructions match
  if (item.instructions && normalize(item.instructions).includes(normalizedQuery)) return true;

  return false;
}

/**
 * Check if an item matches all active filters.
 * Uses AND logic: item must satisfy all filter criteria.
 */
export function matchesFilters(item: ItemRecord, filters: FilterState): boolean {
  // Content type filter
  if (filters.contentTypes?.length) {
    if (!filters.contentTypes.includes(item.contentType)) return false;
  }

  // Tags filter (item must have ALL specified tags)
  if (filters.tags?.length) {
    if (!item.tags || !filters.tags.every(tag => item.tags!.includes(tag))) return false;
  }

  // Locations filter (item must match ONE of the locations)
  if (filters.locations?.length) {
    if (!item.location || !filters.locations.includes(item.location)) return false;
  }

  // Property filter (multi-property mode)
  if (filters.propertyIds?.length) {
    const extendedItem = item as ItemRecordExtended;
    if (!extendedItem.propertyId || !filters.propertyIds.includes(extendedItem.propertyId)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if any filters are currently active.
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return Boolean(
    filters.contentTypes?.length ||
    filters.tags?.length ||
    filters.locations?.length ||
    filters.propertyIds?.length
  );
}

/**
 * Extract unique values from items for filter options.
 */
export function extractFilterOptions(items: ItemRecord[]): {
  contentTypes: string[];
  tags: string[];
  locations: string[];
} {
  const contentTypes = new Set<string>();
  const tags = new Set<string>();
  const locations = new Set<string>();

  for (const item of items) {
    contentTypes.add(item.contentType);
    item.tags?.forEach(tag => tags.add(tag));
    if (item.location) locations.add(item.location);
  }

  return {
    contentTypes: Array.from(contentTypes).sort(),
    tags: Array.from(tags).sort(),
    locations: Array.from(locations).sort(),
  };
}
```

### Task 2.1.2: Create sortUtils.ts

**File:** `src/components/ItemManager/utils/sortUtils.ts`

**Functions to Implement:**

1. **`sortComparators: Record<SortOption, Comparator>`**
   - All 7 sort options from the implementation plan
   - Handle null/undefined values gracefully

2. **`getSortComparator(sortBy: SortOption): Comparator`**
   - Safe getter with fallback to default sort

**Example Implementation:**

```typescript
/**
 * Sort comparator functions for ItemManager.
 * All comparators are pure functions.
 *
 * @module ItemManager/utils/sortUtils
 */

import type { ItemRecord, ItemRecordExtended, SortOption } from '../ItemManager.types';

type ItemComparator = (a: ItemRecord, b: ItemRecord) => number;

/**
 * Sort comparators for all supported sort options.
 * Handles null/undefined values gracefully.
 */
export const sortComparators: Record<SortOption, ItemComparator> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'created-desc': (a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
    return bTime - aTime;
  },
  'created-asc': (a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
    return aTime - bTime;
  },
  'updated-desc': (a, b) => {
    const aExt = a as ItemRecordExtended;
    const bExt = b as ItemRecordExtended;
    const aTime = aExt.updatedAt instanceof Date ? aExt.updatedAt.getTime() : 0;
    const bTime = bExt.updatedAt instanceof Date ? bExt.updatedAt.getTime() : 0;
    return bTime - aTime;
  },
  'updated-asc': (a, b) => {
    const aExt = a as ItemRecordExtended;
    const bExt = b as ItemRecordExtended;
    const aTime = aExt.updatedAt instanceof Date ? aExt.updatedAt.getTime() : 0;
    const bTime = bExt.updatedAt instanceof Date ? bExt.updatedAt.getTime() : 0;
    return aTime - bTime;
  },
  'location-asc': (a, b) => (a.location ?? '').localeCompare(b.location ?? ''),
};

/**
 * Get a sort comparator by option, with fallback to default.
 */
export function getSortComparator(sortBy: SortOption): ItemComparator {
  return sortComparators[sortBy] ?? sortComparators['created-desc'];
}

/**
 * Default sort option.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';
```

### Task 2.1.3: Create useItemSearch.ts Hook

**File:** `src/components/ItemManager/hooks/useItemSearch.ts`

**Implementation Requirements:**

1. Accept items array, search query, filters, and sort option as parameters
2. Use `useMemo` for filtered/sorted results
3. Return stable object reference with results and utilities
4. Include debug logging when enabled
5. Follow established hook patterns from ItemCapture

**Example Implementation:**

```typescript
/**
 * useItemSearch Hook
 *
 * Provides search, filter, and sort functionality for ItemManager.
 * Uses memoization for efficient re-renders.
 *
 * @module ItemManager/hooks/useItemSearch
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.1)
 */

'use client';

import { useMemo, useCallback } from 'react';
import type { ItemRecord, FilterState, SortOption } from '../ItemManager.types';
import { matchesSearch, matchesFilters, hasActiveFilters, extractFilterOptions } from '../utils/filterUtils';
import { getSortComparator, DEFAULT_SORT } from '../utils/sortUtils';

/**
 * Options for useItemSearch hook.
 */
export interface UseItemSearchOptions {
  /** Array of items to search/filter/sort */
  items: ItemRecord[];
  /** Current search query string */
  searchQuery: string;
  /** Active filter state */
  filters: FilterState;
  /** Current sort option */
  sortBy: SortOption;
  /** Enable case-sensitive search (default: false) */
  caseSensitive?: boolean;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Return type for useItemSearch hook.
 */
export interface UseItemSearchReturn {
  // Results
  /** Filtered and sorted items array */
  filteredItems: ItemRecord[];
  /** Count of filtered items */
  resultCount: number;
  /** Total count of all items (before filtering) */
  totalCount: number;

  // Computed state
  /** Whether any search/filter is active */
  isFiltered: boolean;
  /** Whether there are any results */
  hasResults: boolean;
  /** Whether search query is active */
  hasSearchQuery: boolean;
  /** Whether any filters are active */
  hasActiveFilters: boolean;

  // Available filter options (derived from items)
  /** Available filter options extracted from items */
  filterOptions: {
    contentTypes: string[];
    tags: string[];
    locations: string[];
  };

  // Utility functions
  /** Check if a specific item matches the current search query */
  itemMatchesSearch: (item: ItemRecord) => boolean;
  /** Check if a specific item matches the current filters */
  itemMatchesFilters: (item: ItemRecord) => boolean;
}

/**
 * Hook for searching, filtering, and sorting items.
 *
 * @example
 * const { filteredItems, resultCount, isFiltered } = useItemSearch({
 *   items: allItems,
 *   searchQuery: 'coffee',
 *   filters: { contentTypes: ['video'] },
 *   sortBy: 'title-asc',
 * });
 */
export function useItemSearch(options: UseItemSearchOptions): UseItemSearchReturn {
  const {
    items,
    searchQuery,
    filters,
    sortBy,
    caseSensitive = false,
    debug = false,
  } = options;

  // Debug logger
  const log = useCallback((...args: unknown[]) => {
    if (debug) {
      console.log('[useItemSearch]', ...args);
    }
  }, [debug]);

  // Compute filtered and sorted items
  const filteredItems = useMemo(() => {
    log('Computing filtered items', {
      itemCount: items.length,
      searchQuery,
      filters,
      sortBy
    });

    let result = items;

    // Apply search query
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      result = result.filter(item => matchesSearch(item, trimmedQuery, caseSensitive));
      log('After search filter:', result.length);
    }

    // Apply filters
    if (hasActiveFilters(filters)) {
      result = result.filter(item => matchesFilters(item, filters));
      log('After filters:', result.length);
    }

    // Apply sort (create new array to avoid mutating)
    const comparator = getSortComparator(sortBy);
    result = [...result].sort(comparator);
    log('After sort:', result.length);

    return result;
  }, [items, searchQuery, filters, sortBy, caseSensitive, log]);

  // Extract filter options from all items
  const filterOptions = useMemo(() => {
    return extractFilterOptions(items);
  }, [items]);

  // Computed values
  const resultCount = filteredItems.length;
  const totalCount = items.length;
  const hasSearchQuery = Boolean(searchQuery.trim());
  const filtersActive = hasActiveFilters(filters);
  const isFiltered = hasSearchQuery || filtersActive;
  const hasResults = resultCount > 0;

  // Utility functions for external use
  const itemMatchesSearch = useCallback(
    (item: ItemRecord) => matchesSearch(item, searchQuery, caseSensitive),
    [searchQuery, caseSensitive]
  );

  const itemMatchesFilters = useCallback(
    (item: ItemRecord) => matchesFilters(item, filters),
    [filters]
  );

  // Return stable object
  return useMemo(() => ({
    filteredItems,
    resultCount,
    totalCount,
    isFiltered,
    hasResults,
    hasSearchQuery,
    hasActiveFilters: filtersActive,
    filterOptions,
    itemMatchesSearch,
    itemMatchesFilters,
  }), [
    filteredItems,
    resultCount,
    totalCount,
    isFiltered,
    hasResults,
    hasSearchQuery,
    filtersActive,
    filterOptions,
    itemMatchesSearch,
    itemMatchesFilters,
  ]);
}
```

### Task 2.1.4: Update Barrel Exports

**File:** `src/components/ItemManager/hooks/index.ts`

```typescript
export { useItemSearch } from './useItemSearch';
export type { UseItemSearchOptions, UseItemSearchReturn } from './useItemSearch';
```

---

## 6. Testing Requirements

### 6.1 Unit Test Cases

Create tests in `src/components/ItemManager/hooks/__tests__/useItemSearch.test.ts`:

| Test Case | Description |
|-----------|-------------|
| Empty query returns all items | No search/filter should return full array |
| Search matches title | Query "coffee" matches item with title "Coffee Maker" |
| Search matches location | Query "kitchen" matches item with location "Kitchen" |
| Search matches tags | Query "appliance" matches item with tag "appliances" |
| Search matches instructions | Query "press" matches item with instructions containing "press" |
| Search is case-insensitive | "COFFEE" matches "coffee maker" |
| Multiple filters use AND logic | contentType + tag filter only returns items matching both |
| Sort by title ascending | Items sorted alphabetically by title |
| Sort by created descending | Newest items first |
| Sort handles null dates | Items without dates sorted to end |
| Empty results | Query with no matches returns empty array |
| Filter options extracted | All unique tags/locations extracted from items |

### 6.2 Performance Considerations

- Test with 500+ items to verify memoization effectiveness
- Ensure no re-renders when props haven't changed
- Verify sort stability (items with same sort key maintain order)

---

## 7. Acceptance Criteria

From REQ-062:

- [ ] Search functionality returns items when query matches any part of the item's title, location, tags, or instructions (case-insensitive)
- [ ] Multiple filters can be applied simultaneously, with results showing only items that match all active filters
- [ ] Sort options reorder the entire result set according to the selected comparator
- [ ] When search query is empty and no filters are active, all items are returned in the selected sort order

### Additional Technical Criteria:

- [ ] Hook follows established patterns from ItemCapture hooks
- [ ] All functions are pure and testable
- [ ] Memoization prevents unnecessary re-computations
- [ ] Debug mode provides useful console output
- [ ] TypeScript types are comprehensive and exported

---

## 8. Integration Notes

### 8.1 Usage in ItemManager

The hook will be used in `ItemManager.tsx`:

```typescript
function ItemManager({ items, ...props }: ItemManagerProps) {
  const { state } = useItemManagerState();

  const { filteredItems, resultCount, isFiltered, filterOptions } = useItemSearch({
    items,
    searchQuery: state.searchQuery,
    filters: state.filters,
    sortBy: state.sortBy,
  });

  return (
    <div>
      <ItemToolbar
        resultCount={resultCount}
        isFiltered={isFiltered}
        filterOptions={filterOptions}
      />
      <ItemGrid items={filteredItems} />
    </div>
  );
}
```

### 8.2 Relationship to Other Phase 2 Tasks

- **Task 2.2 (ItemToolbar):** Will consume `filterOptions` and `resultCount`
- **Task 2.3 (Search UI):** Will update `searchQuery` via state
- **Task 2.4 (FilterPanel):** Will update `filters` via state and use `filterOptions`
- **Task 2.5 (SortMenu):** Will update `sortBy` via state
- **Task 2.6 (Utilities):** This task creates the utilities; 2.6 may add additional helpers

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with large item counts (>500) | Medium | Medium | Memoization + consider debouncing search input in UI |
| Complex filter combinations | Low | Low | Clear AND semantics; comprehensive testing |
| Date parsing issues | Low | Medium | Handle both Date objects and ISO strings |
| Type mismatches with ItemCapture types | Low | Medium | Import types from ItemCapture; extend as needed |

---

## 10. Appendix: File Structure After Implementation

```
src/components/ItemManager/
├── hooks/
│   ├── index.ts                 # Barrel exports
│   ├── useItemSearch.ts         # NEW: Search/filter/sort hook
│   ├── useItemManagerState.ts   # (Created in Phase 1)
│   └── __tests__/
│       └── useItemSearch.test.ts  # NEW: Unit tests
├── utils/
│   ├── filterUtils.ts           # NEW: Filter helper functions
│   ├── sortUtils.ts             # NEW: Sort comparators
│   └── constants.ts             # (Created in Phase 1)
└── ItemManager.types.ts         # (Created in Phase 1)
```

---

## 11. References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.1
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - ItemRecord, MediaItem types
- [useItemValidation](/src/components/ItemCapture/hooks/useItemValidation.ts) - Pattern reference
- [ItemsManagement](/src/components/ItemsManagement.tsx) - Existing search pattern
