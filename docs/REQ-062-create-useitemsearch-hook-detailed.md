# REQ-062: Create useItemSearch Hook - Detailed Task Breakdown

*Generated: 2026-01-03 12:45:00*
*Last Modified: 2026-01-03 12:45:00*

## Reference

- **Request**: REQ-062 (Search, Filter, and Sort Hook for Item Management)
- **Overview Document**: `docs/REQ-062-create-useitemsearch-hook-overview.md`
- **Implementation Plan**: `docs/prd/item-capture-manager-implementation-plan.md`
- **Source**: `docs/gen_requests.md`
- **Type**: New Feature
- **Phase**: 2 - Search, Filter & Sort
- **Task ID**: 2.1
- **Size**: M

---

## Summary

This document provides granular, actionable tasks for implementing the `useItemSearch` hook, the foundational hook for all search, filter, and sort functionality in the ItemManager component. Each task is scoped to be completable in a few hours of focused work (≤1 story point) and includes verification steps.

---

## Prerequisites

- **Phase 1 Task 1.1 Complete**: ItemManager directory structure and types must exist
  - `src/components/ItemManager/` directory structure created
  - `src/components/ItemManager/ItemManager.types.ts` with `FilterState`, `SortOption`, `ItemRecord` types
  - `src/components/ItemManager/index.ts` barrel exports
- TypeScript 5.x (existing in project)
- React 19.x with hooks support (existing in project)
- No new npm packages required

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/utils/filterUtils.ts` | Filter helper functions (matchesSearch, matchesFilters, hasActiveFilters) |
| `src/components/ItemManager/utils/sortUtils.ts` | Sort comparator functions and utilities |
| `src/components/ItemManager/hooks/useItemSearch.ts` | Main search/filter/sort hook implementation |
| `src/components/ItemManager/hooks/index.ts` | Barrel export for hooks directory |
| `src/components/ItemManager/hooks/__tests__/useItemSearch.test.ts` | Unit tests for the hook |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/index.ts` | Add barrel exports for useItemSearch hook and utility functions |
| `src/components/ItemManager/ItemManager.types.ts` | Add UseItemSearchOptions and UseItemSearchReturn interfaces if not already present |

### Existing Files (Read-Only Reference)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useItemValidation.ts` | Pattern reference for lightweight validation hooks |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Pattern reference for memoization and state management |
| `src/components/ItemsManagement.tsx` | Existing search implementation reference |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord, MediaItem types |

---

## Task Breakdown

### Task 1: Create filterUtils.ts Foundation
**Estimated Effort**: 45 minutes
**Dependencies**: Phase 1 Task 1.1 complete (types exist)

**Description**: Create the filter utilities file with the core search matching function.

**File to Create**: `src/components/ItemManager/utils/filterUtils.ts`

**Implementation Steps**:
1. Create the file with appropriate header comments following project patterns:
   ```typescript
   /**
    * Filter utilities for ItemManager search and filter operations.
    * All functions are pure and side-effect free.
    *
    * @module ItemManager/utils/filterUtils
    */
   ```
2. Add import statement for types from ItemManager:
   ```typescript
   import type { ItemRecord, FilterState, ItemRecordExtended } from '../ItemManager.types';
   ```
3. Implement `matchesSearch` function:
   - Accept parameters: `item: ItemRecord`, `query: string`, `caseSensitive: boolean = false`
   - Return `true` if query is empty or whitespace-only
   - Normalize query based on `caseSensitive` parameter
   - Search across these fields (OR logic - match any):
     - `item.title`
     - `item.location` (if present)
     - `item.tags` array (any tag containing query)
     - `item.instructions` (if present)
   - Return `boolean` indicating if item matches
4. Add JSDoc comments with examples

**Code Template**:
```typescript
/**
 * Check if an item matches the search query.
 * Searches across: title, location, tags, instructions.
 * Uses OR logic - item matches if query found in ANY field.
 *
 * @param item - The item to check
 * @param query - The search query string
 * @param caseSensitive - Whether to perform case-sensitive matching (default: false)
 * @returns true if item matches query or query is empty
 *
 * @example
 * matchesSearch(item, 'coffee'); // true if 'coffee' in title, location, tags, or instructions
 * matchesSearch(item, ''); // true (empty query matches all)
 */
export function matchesSearch(
  item: ItemRecord,
  query: string,
  caseSensitive = false
): boolean {
  // Implementation here
}
```

**Verification Steps**:
- [ ] File exists at `src/components/ItemManager/utils/filterUtils.ts`
- [ ] `matchesSearch` function is exported
- [ ] Function handles empty/whitespace query correctly (returns true)
- [ ] Function searches all four fields: title, location, tags, instructions
- [ ] Function handles missing optional fields (location, tags, instructions) without errors
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 2: Add matchesFilters Function
**Estimated Effort**: 45 minutes
**Dependencies**: Task 1

**Description**: Add the filter matching function that applies multiple filter criteria with AND logic.

**File to Modify**: `src/components/ItemManager/utils/filterUtils.ts`

**Implementation Steps**:
1. Implement `matchesFilters` function:
   - Accept parameters: `item: ItemRecord`, `filters: FilterState`
   - Return `true` if no filters are active (all arrays empty/undefined)
   - Apply AND logic: item must match ALL active filter categories
   - For each filter category:
     - **contentTypes**: If array has items, item's contentType must be in the array
     - **tags**: If array has items, item must have ALL specified tags (AND within category)
     - **locations**: If array has items, item's location must be in the array (OR within category)
     - **propertyIds**: If array has items, extended item's propertyId must be in the array
2. Handle type casting for extended items when checking propertyId
3. Add JSDoc comments with examples

**Code Template**:
```typescript
/**
 * Check if an item matches all active filters.
 * Uses AND logic between filter categories: item must satisfy ALL active filters.
 *
 * Filter category logic:
 * - contentTypes: item.contentType must be in the array (OR within category)
 * - tags: item must have ALL specified tags (AND within category)
 * - locations: item.location must be in the array (OR within category)
 * - propertyIds: item.propertyId must be in the array (OR within category)
 *
 * @param item - The item to check
 * @param filters - The active filter state
 * @returns true if item matches all active filters or no filters are active
 */
export function matchesFilters(item: ItemRecord, filters: FilterState): boolean {
  // Implementation here
}
```

**Verification Steps**:
- [ ] `matchesFilters` function is exported
- [ ] Function returns `true` when no filters are active
- [ ] Function correctly implements AND logic between filter categories
- [ ] contentTypes filter works correctly
- [ ] tags filter requires ALL specified tags
- [ ] locations filter works correctly with OR logic
- [ ] propertyIds filter works correctly for extended items
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 3: Add hasActiveFilters and extractFilterOptions Functions
**Estimated Effort**: 30 minutes
**Dependencies**: Task 1

**Description**: Add utility functions to check for active filters and extract available filter options from items.

**File to Modify**: `src/components/ItemManager/utils/filterUtils.ts`

**Implementation Steps**:
1. Implement `hasActiveFilters` function:
   - Accept parameter: `filters: FilterState`
   - Return `boolean` indicating if any filter array has items
   - Check all filter arrays: contentTypes, tags, locations, propertyIds
2. Implement `extractFilterOptions` function:
   - Accept parameter: `items: ItemRecord[]`
   - Return object with unique values extracted from all items:
     ```typescript
     {
       contentTypes: string[];
       tags: string[];
       locations: string[];
     }
     ```
   - Use Set for deduplication
   - Sort arrays alphabetically
3. Add JSDoc comments for both functions

**Code Template**:
```typescript
/**
 * Check if any filters are currently active.
 * Used to optimize rendering by skipping filter logic when no filters are set.
 *
 * @param filters - The filter state to check
 * @returns true if any filter category has active values
 */
export function hasActiveFilters(filters: FilterState): boolean {
  // Implementation here
}

/**
 * Extract unique filter option values from a collection of items.
 * Used to populate filter dropdowns/chips with available options.
 *
 * @param items - Array of items to extract options from
 * @returns Object containing sorted arrays of unique values for each filter category
 */
export function extractFilterOptions(items: ItemRecord[]): {
  contentTypes: string[];
  tags: string[];
  locations: string[];
} {
  // Implementation here
}
```

**Verification Steps**:
- [ ] `hasActiveFilters` function is exported
- [ ] `hasActiveFilters` returns `false` for empty/undefined filters
- [ ] `hasActiveFilters` returns `true` when any filter array has items
- [ ] `extractFilterOptions` function is exported
- [ ] `extractFilterOptions` returns sorted, unique values
- [ ] `extractFilterOptions` handles items with missing optional fields
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 4: Create sortUtils.ts with Sort Comparators
**Estimated Effort**: 45 minutes
**Dependencies**: Phase 1 Task 1.1 complete (types exist)

**Description**: Create the sort utilities file with all sort comparator functions.

**File to Create**: `src/components/ItemManager/utils/sortUtils.ts`

**Implementation Steps**:
1. Create the file with appropriate header comments:
   ```typescript
   /**
    * Sort comparator functions for ItemManager.
    * All comparators are pure functions that handle null/undefined values gracefully.
    *
    * @module ItemManager/utils/sortUtils
    */
   ```
2. Add import statement for types:
   ```typescript
   import type { ItemRecord, ItemRecordExtended, SortOption } from '../ItemManager.types';
   ```
3. Define `ItemComparator` type alias:
   ```typescript
   type ItemComparator = (a: ItemRecord, b: ItemRecord) => number;
   ```
4. Implement `sortComparators` record with all 7 sort options:
   - `'title-asc'`: alphabetical A-Z using `localeCompare`
   - `'title-desc'`: alphabetical Z-A using `localeCompare`
   - `'created-desc'`: newest first (handle Date objects and ISO strings)
   - `'created-asc'`: oldest first
   - `'updated-desc'`: most recently modified first (handle undefined updatedAt)
   - `'updated-asc'`: least recently modified first
   - `'location-asc'`: alphabetical by location (handle null/undefined)
5. Handle edge cases: null dates, undefined values, non-Date objects
6. Implement `getSortComparator` getter function with fallback
7. Export `DEFAULT_SORT` constant as `'created-desc'`

**Code Template**:
```typescript
/**
 * Sort comparators for all supported sort options.
 * Each comparator handles null/undefined values gracefully.
 */
export const sortComparators: Record<SortOption, ItemComparator> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  // ... remaining comparators
};

/**
 * Get a sort comparator by option, with fallback to default.
 *
 * @param sortBy - The sort option to get comparator for
 * @returns The comparator function, or default if option not found
 */
export function getSortComparator(sortBy: SortOption): ItemComparator {
  return sortComparators[sortBy] ?? sortComparators[DEFAULT_SORT];
}

/**
 * Default sort option used when none specified.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';
```

**Verification Steps**:
- [ ] File exists at `src/components/ItemManager/utils/sortUtils.ts`
- [ ] `sortComparators` record is exported with all 7 sort options
- [ ] `getSortComparator` function is exported
- [ ] `DEFAULT_SORT` constant is exported
- [ ] Date comparators handle both Date objects and potential ISO strings
- [ ] Updated comparators handle undefined `updatedAt` gracefully
- [ ] Location comparator handles null/undefined location
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 5: Add Hook Interface Types to ItemManager.types.ts
**Estimated Effort**: 30 minutes
**Dependencies**: Phase 1 Task 1.1 complete

**Description**: Add the `UseItemSearchOptions` and `UseItemSearchReturn` interfaces to the types file.

**File to Modify**: `src/components/ItemManager/ItemManager.types.ts`

**Implementation Steps**:
1. Add a section header comment for hook types:
   ```typescript
   // =============================================================================
   // Hook Types
   // =============================================================================
   ```
2. Implement `UseItemSearchOptions` interface:
   ```typescript
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
   ```
3. Implement `UseItemSearchReturn` interface:
   ```typescript
   export interface UseItemSearchReturn {
     // Results
     filteredItems: ItemRecord[];
     resultCount: number;
     totalCount: number;

     // Computed state
     isFiltered: boolean;
     hasResults: boolean;
     hasSearchQuery: boolean;
     hasActiveFilters: boolean;

     // Available filter options
     filterOptions: {
       contentTypes: string[];
       tags: string[];
       locations: string[];
     };

     // Utility functions
     itemMatchesSearch: (item: ItemRecord) => boolean;
     itemMatchesFilters: (item: ItemRecord) => boolean;
   }
   ```
4. Add comprehensive JSDoc comments for each property

**Verification Steps**:
- [ ] `UseItemSearchOptions` interface is defined and exported
- [ ] `UseItemSearchReturn` interface is defined and exported
- [ ] All properties have JSDoc comments
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 6: Create useItemSearch.ts Hook Implementation
**Estimated Effort**: 60 minutes
**Dependencies**: Tasks 1-5

**Description**: Create the main `useItemSearch` hook with full search, filter, sort, and memoization implementation.

**File to Create**: `src/components/ItemManager/hooks/useItemSearch.ts`

**Implementation Steps**:
1. Create the file with appropriate header comments:
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
   ```
2. Add imports:
   ```typescript
   import { useMemo, useCallback } from 'react';
   import type { ItemRecord, FilterState, SortOption, UseItemSearchOptions, UseItemSearchReturn } from '../ItemManager.types';
   import { matchesSearch, matchesFilters, hasActiveFilters, extractFilterOptions } from '../utils/filterUtils';
   import { getSortComparator, DEFAULT_SORT } from '../utils/sortUtils';
   ```
3. Implement the hook function:
   - Destructure options with defaults
   - Create debug logger using `useCallback`
   - Compute `filteredItems` using `useMemo`:
     - Start with all items
     - Apply search filter if query exists
     - Apply filters if any are active
     - Apply sort comparator (create new array to avoid mutation)
   - Compute `filterOptions` using `useMemo`
   - Compute derived state values: `resultCount`, `totalCount`, `isFiltered`, etc.
   - Create utility functions using `useCallback`: `itemMatchesSearch`, `itemMatchesFilters`
   - Return stable object using `useMemo`
4. Export the hook function

**Code Template**:
```typescript
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
    // Implementation
  }, [items, searchQuery, filters, sortBy, caseSensitive, log]);

  // Extract filter options from all items
  const filterOptions = useMemo(() => {
    return extractFilterOptions(items);
  }, [items]);

  // Computed values
  // ... resultCount, totalCount, isFiltered, etc.

  // Utility functions
  // ... itemMatchesSearch, itemMatchesFilters

  // Return stable object
  return useMemo(() => ({
    // All return properties
  }), [/* all dependencies */]);
}
```

**Verification Steps**:
- [ ] File exists at `src/components/ItemManager/hooks/useItemSearch.ts`
- [ ] Hook function is exported
- [ ] All imports resolve correctly
- [ ] Hook returns correct interface shape (UseItemSearchReturn)
- [ ] Memoization dependencies are correctly specified
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 7: Create Hooks Barrel Export
**Estimated Effort**: 15 minutes
**Dependencies**: Task 6

**Description**: Create the barrel export file for the hooks directory.

**File to Create**: `src/components/ItemManager/hooks/index.ts`

**Implementation Steps**:
1. Create the file with header comment:
   ```typescript
   /**
    * ItemManager hooks barrel export.
    *
    * @module ItemManager/hooks
    */
   ```
2. Export the hook and its types:
   ```typescript
   export { useItemSearch } from './useItemSearch';
   ```
3. Add placeholder comments for future hooks:
   ```typescript
   // Future hooks (to be implemented in subsequent tasks):
   // export { useItemManagerState } from './useItemManagerState';
   // export { useItemSelection } from './useItemSelection';
   // export { useAssetManagement } from './useAssetManagement';
   ```

**Verification Steps**:
- [ ] File exists at `src/components/ItemManager/hooks/index.ts`
- [ ] `useItemSearch` is exported
- [ ] Import from `src/components/ItemManager/hooks` resolves correctly
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 8: Update Main Barrel Export
**Estimated Effort**: 15 minutes
**Dependencies**: Tasks 5, 7

**Description**: Update the main ItemManager barrel export to include the hook and utilities.

**File to Modify**: `src/components/ItemManager/index.ts`

**Implementation Steps**:
1. Add section for hook exports:
   ```typescript
   // =============================================================================
   // Hooks
   // =============================================================================
   export { useItemSearch } from './hooks';
   ```
2. Add section for hook type exports:
   ```typescript
   export type {
     UseItemSearchOptions,
     UseItemSearchReturn,
   } from './ItemManager.types';
   ```
3. Add section for utility exports (optional, for advanced use cases):
   ```typescript
   // =============================================================================
   // Utilities (for advanced use cases)
   // =============================================================================
   export {
     matchesSearch,
     matchesFilters,
     hasActiveFilters,
     extractFilterOptions,
   } from './utils/filterUtils';

   export {
     sortComparators,
     getSortComparator,
     DEFAULT_SORT,
   } from './utils/sortUtils';
   ```

**Verification Steps**:
- [ ] Hook is exported from main barrel
- [ ] Hook types are exported
- [ ] Utility functions are exported
- [ ] Import `{ useItemSearch } from '@/components/ItemManager'` works
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

### Task 9: Create Unit Tests for filterUtils
**Estimated Effort**: 45 minutes
**Dependencies**: Tasks 1-3

**Description**: Create unit tests for all filter utility functions.

**File to Create**: `src/components/ItemManager/utils/__tests__/filterUtils.test.ts`

**Implementation Steps**:
1. Create test file with imports:
   ```typescript
   import { describe, it, expect } from 'vitest'; // or jest
   import { matchesSearch, matchesFilters, hasActiveFilters, extractFilterOptions } from '../filterUtils';
   import type { ItemRecord, FilterState } from '../../ItemManager.types';
   ```
2. Create mock item factory for test data:
   ```typescript
   const createMockItem = (overrides?: Partial<ItemRecord>): ItemRecord => ({
     id: 'test-id',
     title: 'Test Item',
     contentType: 'media',
     media: [],
     createdAt: new Date(),
     ...overrides,
   });
   ```
3. Implement test cases for `matchesSearch`:
   - Empty query returns true
   - Matches title
   - Matches location
   - Matches any tag in array
   - Matches instructions
   - Case-insensitive by default
   - Case-sensitive when specified
   - Handles missing optional fields
4. Implement test cases for `matchesFilters`:
   - No filters returns true
   - Single filter category works
   - Multiple filters use AND logic
   - Tags filter requires ALL tags
   - Handles extended items with propertyId
5. Implement test cases for `hasActiveFilters`:
   - Returns false for empty filters
   - Returns true when any array has items
6. Implement test cases for `extractFilterOptions`:
   - Extracts unique values
   - Sorts values alphabetically
   - Handles empty items array

**Verification Steps**:
- [ ] Test file exists and contains tests for all functions
- [ ] All tests pass: `npm test -- filterUtils.test.ts`
- [ ] Test coverage includes edge cases (null, undefined, empty values)
- [ ] Mock items follow ItemRecord interface correctly

---

### Task 10: Create Unit Tests for sortUtils
**Estimated Effort**: 30 minutes
**Dependencies**: Task 4

**Description**: Create unit tests for sort utility functions.

**File to Create**: `src/components/ItemManager/utils/__tests__/sortUtils.test.ts`

**Implementation Steps**:
1. Create test file with imports
2. Create mock items with various dates, titles, locations
3. Implement test cases for each sort option:
   - `'title-asc'`: Items sorted A-Z by title
   - `'title-desc'`: Items sorted Z-A by title
   - `'created-desc'`: Newest items first
   - `'created-asc'`: Oldest items first
   - `'updated-desc'`: Most recently updated first
   - `'updated-asc'`: Least recently updated first
   - `'location-asc'`: Items sorted A-Z by location
4. Test edge cases:
   - Items with null/undefined dates
   - Items with null/undefined location
   - Items with same sort key (stability)
5. Test `getSortComparator` function:
   - Returns correct comparator
   - Falls back to default for invalid option

**Verification Steps**:
- [ ] Test file exists and contains tests for all sort options
- [ ] All tests pass: `npm test -- sortUtils.test.ts`
- [ ] Edge cases (null dates, null locations) are handled
- [ ] Sort stability is verified

---

### Task 11: Create Unit Tests for useItemSearch Hook
**Estimated Effort**: 60 minutes
**Dependencies**: Task 6

**Description**: Create comprehensive unit tests for the useItemSearch hook.

**File to Create**: `src/components/ItemManager/hooks/__tests__/useItemSearch.test.ts`

**Implementation Steps**:
1. Create test file with imports:
   ```typescript
   import { renderHook } from '@testing-library/react';
   import { describe, it, expect } from 'vitest';
   import { useItemSearch } from '../useItemSearch';
   ```
2. Create mock items array with variety:
   - Different content types
   - Different tags
   - Different locations
   - Different dates
3. Implement test cases for search:
   - Empty query returns all items
   - Query matches title
   - Query matches location
   - Query matches tags
   - Query matches instructions
   - Case-insensitive matching
4. Implement test cases for filters:
   - No filters returns all items
   - Single filter works
   - Multiple filters use AND logic
   - Combined search + filters work together
5. Implement test cases for sort:
   - Each sort option orders correctly
   - Sort applies after filtering
6. Implement test cases for computed state:
   - `resultCount` is accurate
   - `totalCount` is accurate
   - `isFiltered` is true when search or filters active
   - `hasResults` is accurate
7. Implement test cases for utility functions:
   - `itemMatchesSearch` works correctly
   - `itemMatchesFilters` works correctly
8. Implement test cases for `filterOptions`:
   - Extracts correct options from items

**Verification Steps**:
- [ ] Test file exists with comprehensive test cases
- [ ] All tests pass: `npm test -- useItemSearch.test.ts`
- [ ] Tests cover all return properties
- [ ] Tests verify memoization (same input = same output reference)

---

### Task 12: Run Full Build and Integration Verification
**Estimated Effort**: 30 minutes
**Dependencies**: Tasks 1-11

**Description**: Run full project build and verify integration with existing codebase.

**Implementation Steps**:
1. Run TypeScript type check:
   ```bash
   npx tsc --noEmit
   ```
2. Run all tests:
   ```bash
   npm test
   ```
3. Run the build:
   ```bash
   npm run build
   ```
4. Verify imports work from consuming code:
   - Create temporary test file importing hook and utilities
   - Verify no import errors
5. Test hook manually in development (if test harness exists):
   - Import hook in test page
   - Verify it returns correct data structure
   - Verify search/filter/sort work as expected
6. Delete any temporary test files

**Verification Steps**:
- [ ] `npx tsc --noEmit` completes without errors
- [ ] `npm test` passes all tests
- [ ] `npm run build` completes successfully
- [ ] No unused export warnings
- [ ] No type conflicts with existing codebase
- [ ] Hook can be imported and used in test page

---

## Complete Validation Checklist

### File Structure
- [ ] `src/components/ItemManager/utils/filterUtils.ts` exists
- [ ] `src/components/ItemManager/utils/sortUtils.ts` exists
- [ ] `src/components/ItemManager/hooks/useItemSearch.ts` exists
- [ ] `src/components/ItemManager/hooks/index.ts` exists

### Function Implementation
- [ ] `matchesSearch` - searches title, location, tags, instructions
- [ ] `matchesFilters` - applies AND logic for filter categories
- [ ] `hasActiveFilters` - checks if any filters are active
- [ ] `extractFilterOptions` - extracts unique filter values from items
- [ ] `sortComparators` - all 7 sort options implemented
- [ ] `getSortComparator` - returns comparator with fallback
- [ ] `useItemSearch` - main hook with memoization

### Type Definitions
- [ ] `UseItemSearchOptions` interface defined and exported
- [ ] `UseItemSearchReturn` interface defined and exported

### Barrel Exports
- [ ] Hook exported from `hooks/index.ts`
- [ ] Hook exported from main `index.ts`
- [ ] Utility functions exported from main `index.ts`
- [ ] Types exported from main `index.ts`

### Tests
- [ ] `filterUtils.test.ts` with passing tests
- [ ] `sortUtils.test.ts` with passing tests
- [ ] `useItemSearch.test.ts` with passing tests

### Compilation
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] All tests pass

---

## Acceptance Criteria (from REQ-062)

- [ ] Search functionality returns items when query matches any part of the item's title, location, tags, or instructions (case-insensitive)
- [ ] Multiple filters can be applied simultaneously, with results showing only items that match all active filters
- [ ] Sort options reorder the entire result set according to the selected comparator
- [ ] When search query is empty and no filters are active, all items are returned in the selected sort order

### Additional Technical Criteria

- [ ] Hook follows established patterns from ItemCapture hooks
- [ ] All functions are pure and testable
- [ ] Memoization prevents unnecessary re-computations
- [ ] Debug mode provides useful console output
- [ ] TypeScript types are comprehensive and exported

---

## Estimated Total Effort

| Task | Effort |
|------|--------|
| Task 1: Create filterUtils.ts Foundation | 45 min |
| Task 2: Add matchesFilters Function | 45 min |
| Task 3: Add hasActiveFilters and extractFilterOptions | 30 min |
| Task 4: Create sortUtils.ts | 45 min |
| Task 5: Add Hook Interface Types | 30 min |
| Task 6: Create useItemSearch.ts Hook | 60 min |
| Task 7: Create Hooks Barrel Export | 15 min |
| Task 8: Update Main Barrel Export | 15 min |
| Task 9: Create Unit Tests for filterUtils | 45 min |
| Task 10: Create Unit Tests for sortUtils | 30 min |
| Task 11: Create Unit Tests for useItemSearch | 60 min |
| Task 12: Run Full Build Verification | 30 min |
| **Total** | **~7.5 hours** |

---

## Dependencies for Next Tasks

Upon completion of this task (2.1), the following tasks are unblocked:

| Task ID | Title | Description |
|---------|-------|-------------|
| 2.2 | Build ItemToolbar component | Uses `resultCount`, `isFiltered`, `filterOptions` from useItemSearch |
| 2.3 | Implement search UI | Provides `searchQuery` to useItemSearch |
| 2.4 | Implement FilterPanel | Uses `filterOptions`, provides `filters` to useItemSearch |
| 2.5 | Implement SortMenu | Provides `sortBy` to useItemSearch |

---

## Integration Example

```typescript
// Example usage in ItemManager.tsx
import { useItemSearch } from './hooks';

function ItemManager({ items, ...props }: ItemManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<SortOption>('created-desc');

  const {
    filteredItems,
    resultCount,
    totalCount,
    isFiltered,
    filterOptions,
  } = useItemSearch({
    items,
    searchQuery,
    filters,
    sortBy,
  });

  return (
    <div>
      <ItemToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={resultCount}
        totalCount={totalCount}
        isFiltered={isFiltered}
        filterOptions={filterOptions}
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <ItemGrid items={filteredItems} />
    </div>
  );
}
```

---

## Notes

### Pattern Alignment
- Hook follows `useItemValidation` pattern from ItemCapture
- Uses `useMemo` for computed values (matching established pattern)
- Uses `useCallback` for stable function references
- Pure utility functions in separate files for testability

### Performance Considerations
- All filtering/sorting done in single `useMemo` to avoid multiple array passes
- Filter options extracted once per items change (not per filter change)
- Utility functions are pure and memoization-friendly
- Consider debouncing search input in consuming component (not in hook)

### Future Considerations
- For 500+ items, consider virtualization in display components
- For complex search, consider fuzzy matching library (e.g., fuse.js)
- For server-side filtering, modify hook to accept pre-filtered items

---

## Risk Level

**Low** - This task creates new files without modifying existing functionality. The hook is self-contained and follows established patterns from the codebase.
