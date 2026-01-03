# REQ-067: Create Filter/Sort Utilities - Detailed Task Breakdown

**Document Created:** 2026-01-03 15:42:00
**Last Modified:** 2026-01-03 15:42:00
**Request Reference:** REQ-067 (Filter and Sort Utilities for Item Collection Management)
**Overview Document:** `/docs/REQ-067-create-filtersort-utilities-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.6

---

## Document Purpose

This document provides granular, implementation-ready task breakdowns for creating the filter and sort utility modules for the ItemManager component. Each task is designed to be ≤1 story point (a few hours of focused work) and includes verification steps.

---

## Prerequisites

Before starting implementation, ensure:

1. **Phase 1 Completion:** Task 1.1 (Directory Structure & Types) must be complete
   - `src/components/ItemManager/ItemManager.types.ts` exists with:
     - `FilterState` interface
     - `SortOption` type
     - `ItemRecordExtended` interface
   - `src/components/ItemManager/utils/` directory exists

2. **Dependencies Available:**
   - `ItemRecord` type from `@/components/ItemCapture/ItemCapture.types.ts`
   - TypeScript strict mode enabled

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/utils/filterUtils.ts` | Filter and search helper functions |
| `src/components/ItemManager/utils/sortUtils.ts` | Sort comparator functions |
| `src/components/ItemManager/utils/__tests__/filterUtils.test.ts` | Unit tests for filterUtils |
| `src/components/ItemManager/utils/__tests__/sortUtils.test.ts` | Unit tests for sortUtils |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/utils/index.ts` | Add barrel exports for filterUtils and sortUtils (create if not exists) |

---

## Task Breakdown

### Task 2.6.1: Create filterUtils.ts Core Search Functions

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/filterUtils.ts`

**Objective:** Implement the foundational search-related pure functions.

**Implementation Steps:**

1. Create the file with module header comment including `@lastModified` with current date
2. Import required types from `../ItemManager.types`
3. Define and export the `FilterOptions` interface:
   ```typescript
   export interface FilterOptions {
     contentTypes: string[];
     tags: string[];
     locations: string[];
   }
   ```
4. Define and export the `ContentType` type
5. Export the `SEARCHABLE_FIELDS` constant array
6. Implement `normalizeSearchQuery(query: string, caseSensitive?: boolean): string`
   - Trim whitespace
   - Convert to lowercase unless caseSensitive is true
7. Implement `getSearchableText(item: ItemRecord): string[]`
   - Extract title, location, tags, instructions into array
   - Handle undefined optional fields
8. Implement `matchesSearch(item: ItemRecord, query: string, caseSensitive?: boolean): boolean`
   - Return true for empty query (matches all)
   - Check title, location, tags, instructions fields
   - Use OR logic (match any field)

**Verification Steps:**
- [ ] File compiles without TypeScript errors
- [ ] `normalizeSearchQuery("  TEST  ", false)` returns `"test"`
- [ ] `normalizeSearchQuery("TEST", true)` returns `"TEST"`
- [ ] `matchesSearch(item, "")` returns `true` for any item
- [ ] `matchesSearch(item, "kitchen")` matches item with location "Kitchen"

---

### Task 2.6.2: Create filterUtils.ts Individual Filter Functions

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/filterUtils.ts`
**Depends On:** Task 2.6.1

**Objective:** Implement individual filter matching functions.

**Implementation Steps:**

1. Implement `matchesContentTypes(item: ItemRecord, contentTypes: string[]): boolean`
   - Return true for empty array (no filter)
   - Check if item.contentType is in the array
   - Use OR logic (match any content type)

2. Implement `matchesTags(item: ItemRecord, tags: string[]): boolean`
   - Return true for empty array (no filter)
   - Return false if item has no tags
   - Use AND logic (item must have ALL specified tags)

3. Implement `matchesLocations(item: ItemRecord, locations: string[]): boolean`
   - Return true for empty array (no filter)
   - Return false if item has no location
   - Use OR logic (match any location)

4. Implement `matchesPropertyIds(item: ItemRecordExtended, propertyIds: string[]): boolean`
   - Return true for empty array (no filter)
   - Return false if item has no propertyId
   - Use OR logic (match any property)

**Verification Steps:**
- [ ] `matchesContentTypes(item, [])` returns `true`
- [ ] `matchesTags(item, ['a', 'b'])` returns `false` if item only has tag 'a'
- [ ] `matchesLocations(item, ['Kitchen', 'Bath'])` returns `true` if item.location is 'Kitchen'
- [ ] All functions handle undefined/null fields gracefully

---

### Task 2.6.3: Create filterUtils.ts Composite Functions

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/filterUtils.ts`
**Depends On:** Task 2.6.2

**Objective:** Implement composite filter functions and utility helpers.

**Implementation Steps:**

1. Implement `hasActiveFilters(filters: FilterState): boolean`
   - Return true if any filter array has length > 0
   - Check contentTypes, tags, locations, propertyIds

2. Implement `matchesFilters(item: ItemRecord, filters: FilterState): boolean`
   - Return true if no active filters
   - Apply all filter checks with AND logic
   - Item must pass ALL active filter categories

3. Implement `extractFilterOptions(items: ItemRecord[]): FilterOptions`
   - Extract unique contentTypes, tags, locations from all items
   - Return sorted arrays for each category
   - Use Set for deduplication

4. Implement `deriveContentType(item: ItemRecord): ContentType`
   - Return the item's contentType cast to ContentType

5. Implement `countActiveFilters(filters: FilterState): number`
   - Count how many filter categories have values

6. Implement `createEmptyFilterState(): FilterState`
   - Return object with empty arrays for all filter properties

**Verification Steps:**
- [ ] `hasActiveFilters({})` returns `false`
- [ ] `hasActiveFilters({ tags: ['test'] })` returns `true`
- [ ] `matchesFilters(item, {})` returns `true`
- [ ] `extractFilterOptions([])` returns `{ contentTypes: [], tags: [], locations: [] }`
- [ ] `countActiveFilters({ tags: ['a'], locations: ['b'] })` returns `2`

---

### Task 2.6.4: Create sortUtils.ts Core Functions

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/sortUtils.ts`

**Objective:** Implement sort comparator functions and helpers.

**Implementation Steps:**

1. Create the file with module header comment including `@lastModified` with current date
2. Import required types from `../ItemManager.types`
3. Define and export types:
   ```typescript
   export type ItemComparator = (a: ItemRecord, b: ItemRecord) => number;
   export interface SortOptionConfig { value: SortOption; label: string; }
   export interface ContentTypeOption { value: string; label: string; }
   ```

4. Export constants:
   - `DEFAULT_SORT: SortOption = 'created-desc'`
   - `SORT_OPTIONS: SortOptionConfig[]` with all 7 options and labels
   - `CONTENT_TYPE_OPTIONS: ContentTypeOption[]` with 5 content types

5. Implement `getDateTimestamp(date: Date | string | undefined | null): number`
   - Return 0 for null/undefined
   - Handle Date objects and ISO strings
   - Return 0 for invalid dates

6. Implement helper `safeLocaleCompare(a: string | undefined | null, b: string | undefined | null): number`
   - Handle null/undefined by treating as empty string

**Verification Steps:**
- [ ] File compiles without TypeScript errors
- [ ] `getDateTimestamp(new Date('2024-01-15'))` returns a valid timestamp
- [ ] `getDateTimestamp(undefined)` returns `0`
- [ ] `getDateTimestamp('invalid')` returns `0`
- [ ] `SORT_OPTIONS.length` equals `7`

---

### Task 2.6.5: Create sortUtils.ts Comparators

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/sortUtils.ts`
**Depends On:** Task 2.6.4

**Objective:** Implement all sort comparator functions.

**Implementation Steps:**

1. Implement `sortComparators: Record<SortOption, ItemComparator>` with:
   - `'title-asc'`: Alphabetical A-Z using safeLocaleCompare
   - `'title-desc'`: Alphabetical Z-A (reversed)
   - `'created-desc'`: Newest first using getDateTimestamp on createdAt
   - `'created-asc'`: Oldest first (reversed)
   - `'updated-desc'`: Most recently modified first using updatedAt
   - `'updated-asc'`: Least recently modified first (reversed)
   - `'location-asc'`: Alphabetical location using safeLocaleCompare

2. Implement `getSortComparator(sortBy: SortOption): ItemComparator`
   - Return the matching comparator from sortComparators
   - Fall back to DEFAULT_SORT if not found

3. Implement `createChainedComparator(...comparators: ItemComparator[]): ItemComparator`
   - Chain multiple comparators for secondary sorting
   - Use first non-zero result

4. Implement `reverseSortOrder(comparator: ItemComparator): ItemComparator`
   - Return a new comparator with reversed order

**Verification Steps:**
- [ ] `sortComparators['title-asc']` sorts items A-Z by title
- [ ] `sortComparators['created-desc']` sorts newest items first
- [ ] Items with null dates sort to end/beginning appropriately
- [ ] `getSortComparator('invalid' as SortOption)` returns default comparator

---

### Task 2.6.6: Create sortUtils.ts Utility Functions

**Estimated Effort:** ~1 hour
**File:** `src/components/ItemManager/utils/sortUtils.ts`
**Depends On:** Task 2.6.5

**Objective:** Implement remaining utility functions.

**Implementation Steps:**

1. Implement `createKeyComparator<T>(keyFn: (item: ItemRecord) => T, descending?: boolean): ItemComparator`
   - Create comparator from key extraction function
   - Support string and number keys
   - Support descending order flag

2. Implement `getSortLabel(sortBy: SortOption): string`
   - Find matching option in SORT_OPTIONS
   - Return label or value if not found

3. Implement `isValidSortOption(sortBy: string): sortBy is SortOption`
   - Type guard to check if string is valid SortOption
   - Check if sortBy exists in sortComparators

**Verification Steps:**
- [ ] `getSortLabel('title-asc')` returns `'Title (A-Z)'`
- [ ] `isValidSortOption('title-asc')` returns `true`
- [ ] `isValidSortOption('invalid')` returns `false`
- [ ] Custom key comparator works for numeric and string keys

---

### Task 2.6.7: Create Utils Barrel Export

**Estimated Effort:** ~30 minutes
**File:** `src/components/ItemManager/utils/index.ts`
**Depends On:** Tasks 2.6.1-2.6.6

**Objective:** Create or update barrel exports for all utility functions.

**Implementation Steps:**

1. Create/update `src/components/ItemManager/utils/index.ts`

2. Export all functions and types from filterUtils:
   - Functions: `matchesSearch`, `matchesFilters`, `hasActiveFilters`, `extractFilterOptions`, `deriveContentType`, `normalizeSearchQuery`, `matchesContentTypes`, `matchesTags`, `matchesLocations`, `matchesPropertyIds`, `getSearchableText`, `countActiveFilters`, `createEmptyFilterState`
   - Constants: `SEARCHABLE_FIELDS`
   - Types: `FilterOptions`, `ContentType`

3. Export all functions and types from sortUtils:
   - Functions: `sortComparators`, `getSortComparator`, `createChainedComparator`, `reverseSortOrder`, `createKeyComparator`, `getDateTimestamp`, `getSortLabel`, `isValidSortOption`
   - Constants: `DEFAULT_SORT`, `SORT_OPTIONS`, `CONTENT_TYPE_OPTIONS`
   - Types: `ItemComparator`, `SortOptionConfig`, `ContentTypeOption`

**Verification Steps:**
- [ ] All exports resolve without errors
- [ ] Can import functions via `import { matchesSearch } from '../utils'`
- [ ] TypeScript reports no unused export errors

---

### Task 2.6.8: Create filterUtils Unit Tests - Search Functions

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/__tests__/filterUtils.test.ts`
**Depends On:** Task 2.6.3

**Objective:** Write comprehensive unit tests for search-related functions.

**Implementation Steps:**

1. Create the test file with module header comment
2. Create helper function `createMockItem(overrides?: Partial<ItemRecord>): ItemRecord`
3. Write test suite for `normalizeSearchQuery`:
   - Empty string handling
   - Whitespace trimming
   - Case conversion
   - Case-sensitive mode

4. Write test suite for `getSearchableText`:
   - Item with all fields
   - Item with missing optional fields
   - Tags extraction

5. Write test suite for `matchesSearch`:
   - Empty query returns true
   - Title match
   - Location match
   - Tags match (any tag)
   - Instructions match
   - Case-insensitive by default
   - Case-sensitive mode
   - No match returns false
   - Missing optional fields handled

**Test Cases to Include:**
```typescript
it('should return true for empty query');
it('should match title containing query');
it('should match location containing query');
it('should match any tag containing query');
it('should match instructions containing query');
it('should be case-insensitive by default');
it('should support case-sensitive matching');
it('should return false when no fields match');
it('should handle items with missing optional fields');
it('should trim whitespace from query');
```

**Verification Steps:**
- [ ] All tests pass
- [ ] Tests cover edge cases (empty strings, null values)
- [ ] Test file follows existing patterns from ItemCapture tests

---

### Task 2.6.9: Create filterUtils Unit Tests - Filter Functions

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/__tests__/filterUtils.test.ts`
**Depends On:** Task 2.6.8

**Objective:** Write comprehensive unit tests for filter functions.

**Implementation Steps:**

1. Write test suite for `matchesContentTypes`:
   - Empty array returns true
   - Match when type in array
   - No match when type not in array

2. Write test suite for `matchesTags`:
   - Empty array returns true
   - Match when item has all tags
   - No match when item missing any tag
   - No match when item has no tags

3. Write test suite for `matchesLocations`:
   - Empty array returns true
   - Match when location in array
   - No match when location not in array
   - No match when item has no location

4. Write test suite for `matchesPropertyIds`:
   - Empty array returns true
   - Match when propertyId in array
   - No match when propertyId not in array

5. Write test suite for `hasActiveFilters`:
   - Empty object returns false
   - Empty arrays return false
   - Non-empty contentTypes returns true
   - Non-empty tags returns true
   - Non-empty locations returns true

6. Write test suite for `matchesFilters`:
   - Empty filters returns true
   - Single filter type works
   - Multiple filters use AND logic
   - Failing any filter returns false

7. Write test suite for `extractFilterOptions`:
   - Empty items returns empty arrays
   - Extracts unique content types
   - Extracts unique tags
   - Extracts unique locations
   - Results are sorted alphabetically

**Verification Steps:**
- [ ] All tests pass
- [ ] Tests achieve high branch coverage
- [ ] Edge cases covered (empty arrays, null values)

---

### Task 2.6.10: Create sortUtils Unit Tests - Comparators

**Estimated Effort:** ~2 hours
**File:** `src/components/ItemManager/utils/__tests__/sortUtils.test.ts`
**Depends On:** Task 2.6.6

**Objective:** Write comprehensive unit tests for sort comparators.

**Implementation Steps:**

1. Create the test file with module header comment
2. Create helper functions:
   - `createMockItem(overrides?: Partial<ItemRecord>): ItemRecord`
   - Helper to verify sort order

3. Write test suite for `getDateTimestamp`:
   - Date object handling
   - ISO string handling
   - Undefined returns 0
   - Null returns 0
   - Invalid date string returns 0
   - Invalid Date object returns 0

4. Write test suite for `sortComparators['title-asc']`:
   - Sorts alphabetically A-Z
   - Handles equal titles
   - Handles empty/undefined titles

5. Write test suite for `sortComparators['title-desc']`:
   - Sorts alphabetically Z-A

6. Write test suite for `sortComparators['created-desc']`:
   - Sorts newest first
   - Handles Date objects
   - Handles ISO date strings
   - Handles missing dates

7. Write test suite for `sortComparators['created-asc']`:
   - Sorts oldest first

8. Write test suite for `sortComparators['updated-desc']`:
   - Sorts by updatedAt newest first
   - Handles items without updatedAt

9. Write test suite for `sortComparators['location-asc']`:
   - Sorts locations alphabetically
   - Handles null/undefined locations

**Verification Steps:**
- [ ] All tests pass
- [ ] All 7 sort options have test coverage
- [ ] Edge cases (null, undefined, invalid dates) are tested

---

### Task 2.6.11: Create sortUtils Unit Tests - Utility Functions

**Estimated Effort:** ~1 hour
**File:** `src/components/ItemManager/utils/__tests__/sortUtils.test.ts`
**Depends On:** Task 2.6.10

**Objective:** Write unit tests for utility functions.

**Implementation Steps:**

1. Write test suite for `getSortComparator`:
   - Returns correct comparator for valid option
   - Returns default comparator for invalid option

2. Write test suite for `createChainedComparator`:
   - Uses secondary comparator when primary returns 0
   - Stops at first non-zero result
   - Works with empty comparator list

3. Write test suite for `reverseSortOrder`:
   - Reverses comparison result

4. Write test suite for `createKeyComparator`:
   - Works with string keys
   - Works with numeric keys
   - Supports descending order

5. Write test suite for `getSortLabel`:
   - Returns label for valid sort option
   - Returns value for unknown option

6. Write test suite for `isValidSortOption`:
   - Returns true for all valid options
   - Returns false for invalid strings

**Verification Steps:**
- [ ] All tests pass
- [ ] Type guard tests verify TypeScript narrowing
- [ ] Chained comparator behavior verified with multiple comparators

---

### Task 2.6.12: Integration Verification and Cleanup

**Estimated Effort:** ~1 hour
**Depends On:** All previous tasks

**Objective:** Verify complete integration and clean up any issues.

**Verification Steps:**

1. **TypeScript Verification:**
   - [ ] Run `npx tsc --noEmit` with no errors
   - [ ] All functions have proper JSDoc comments
   - [ ] No `any` types used

2. **Test Coverage:**
   - [ ] Run tests: `npm test -- --testPathPattern="ItemManager/utils"`
   - [ ] Verify 95%+ line coverage for filterUtils.ts
   - [ ] Verify 95%+ line coverage for sortUtils.ts

3. **Import Verification:**
   - [ ] Test imports from barrel export work correctly
   - [ ] No circular dependency warnings

4. **Pattern Consistency:**
   - [ ] Verify function patterns match ItemCapture validation.ts
   - [ ] JSDoc format matches existing codebase conventions

5. **Integration Readiness:**
   - [ ] Verify types match what useItemSearch hook expects
   - [ ] Verify constants match what UI components will need

---

## Acceptance Criteria Checklist

From REQ-067 and implementation plan:

- [ ] Users can apply filters to item collections and see only items matching the filter criteria
- [ ] Users can sort item collections by different attributes and see results in the expected order
- [ ] Multiple filters can be applied simultaneously with correct combined results (AND logic)
- [ ] Sort order (ascending/descending) can be toggled and produces correct ordering
- [ ] Filter and sort operations return correct results for edge cases (empty collections, no matches, null values)
- [ ] All filter and sort functions are covered by unit tests demonstrating correct behavior

### Technical Acceptance Criteria:

- [ ] All functions are pure (no side effects)
- [ ] All functions have comprehensive JSDoc documentation with `@example` tags
- [ ] TypeScript strict mode passes without errors
- [ ] Unit tests achieve 95%+ coverage
- [ ] Functions handle null/undefined gracefully
- [ ] Code follows established patterns from ItemCapture utils

---

## Task Dependency Graph

```
Task 2.6.1 (Search Functions)
     │
     ▼
Task 2.6.2 (Individual Filters)
     │
     ▼
Task 2.6.3 (Composite Filters) ─────────────────┐
     │                                           │
     │         Task 2.6.4 (Sort Core)            │
     │              │                            │
     │              ▼                            │
     │         Task 2.6.5 (Comparators)          │
     │              │                            │
     │              ▼                            │
     │         Task 2.6.6 (Sort Utils)           │
     │              │                            │
     └──────────────┼────────────────────────────┘
                    │
                    ▼
              Task 2.6.7 (Barrel Exports)
                    │
     ┌──────────────┼──────────────┐
     │              │              │
     ▼              ▼              ▼
Task 2.6.8    Task 2.6.10    Task 2.6.11
(Filter       (Sort          (Sort Utils
Search        Comparator     Tests)
Tests)        Tests)
     │              │              │
     ▼              └──────┬───────┘
Task 2.6.9                 │
(Filter Tests)             │
     │                     │
     └──────────┬──────────┘
                │
                ▼
          Task 2.6.12
     (Integration Verification)
```

---

## Parallelization Opportunities

The following tasks can be worked on in parallel:

1. **filterUtils implementation (2.6.1-2.6.3)** can proceed independently from **sortUtils implementation (2.6.4-2.6.6)**
2. **filterUtils tests (2.6.8-2.6.9)** can be written in parallel with **sortUtils tests (2.6.10-2.6.11)** after respective implementations complete

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Types not yet defined in ItemManager.types.ts | Verify Phase 1 Task 1.1 is complete before starting |
| Test patterns unclear | Reference `/src/components/ItemCapture/utils/__tests__/validation.test.ts` |
| Performance with large datasets | Document performance considerations; defer optimization |

---

## References

- [Overview Document](/docs/REQ-067-create-filtersort-utilities-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.6
- [Implementation Plan Appendix B](/docs/prd/item-capture-manager-implementation-plan.md#appendix-b-sort-comparators-reference)
- [ItemCapture Validation Utils](/src/components/ItemCapture/utils/validation.ts) - Pattern reference
- [ItemCapture Validation Tests](/src/components/ItemCapture/utils/__tests__/validation.test.ts) - Test pattern reference

---

**Document Version:** 1.0
**Status:** Ready for Implementation
