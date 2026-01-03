# REQ-067: Create Filter/Sort Utilities - Technical Implementation Overview

**Document Created:** 2026-01-03 14:35:00
**Last Modified:** 2026-01-03 14:35:00
**Request Reference:** REQ-067 (Filter and Sort Utilities for Item Collection Management)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 2 - Search, Filter & Sort
**Task ID:** 2.6

---

## 1. Executive Summary

This document provides the technical implementation breakdown for creating the filter and sort utility modules for the ItemManager component. Task 2.6 creates the pure, unit-testable utility functions that power the search, filter, and sort functionality used by the `useItemSearch` hook (Task 2.1).

### Scope

The utilities will provide:
- `filterUtils.ts` - Pure functions for search matching and filter logic
- `sortUtils.ts` - Comparator functions for all defined sort options
- Comprehensive unit tests for all utility functions
- Type-safe implementations following established codebase patterns

### Key Characteristics

- **Pure Functions:** All utilities are pure functions with no side effects, making them easily testable
- **Type Safety:** Full TypeScript typing with strict mode compliance
- **Reusability:** Functions designed for use by hooks, components, and tests
- **Performance:** Optimized for client-side operations with expected item counts (<1000)

### Dependencies

- **Phase 1 Completion Required:** Depends on task 1.1 (Directory Structure & Types) for `FilterState`, `SortOption`, `ItemRecord`, and related types in `ItemManager.types.ts`
- **Parallel Work:** Can be developed independently from other Phase 2 tasks; provides foundation for Task 2.1 (`useItemSearch` hook)
- **Note:** Per the implementation plan, this task is marked as "Independent - can start anytime" within Phase 2

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Utility Pattern | Pure functions in separate utils files | ItemCapture utils |
| Testing | Jest with unit test patterns | Existing `__tests__` directories |

### 2.2 Reference Patterns from Codebase

**Primary Pattern Reference:** `/src/components/ItemCapture/utils/validation.ts`
- Pure validation functions with no side effects
- Comprehensive JSDoc documentation with examples
- Structured return types for validation results
- Clear function signatures with optional parameters

**Secondary Pattern Reference:** `/src/lib/utils.ts`
- Simple utility functions with clear single responsibility
- Export pattern for reuse across the codebase

**Test Pattern Reference:** `/src/components/ItemCapture/utils/__tests__/validation.test.ts`
- Comprehensive test coverage for edge cases
- Descriptive test names following "should..." convention
- Grouped tests by function

### 2.3 Types from Implementation Plan

The following types are defined in the implementation plan and must exist in `ItemManager.types.ts`:

```typescript
// Filter state structure
export interface FilterState {
  search?: string;
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;
  tags?: string[];
  locations?: string[];
  propertyIds?: string[];
}

// Sort option type
export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc'
  | 'location-asc';

// Extended ItemRecord with manager-specific properties
export interface ItemRecordExtended extends ItemRecord {
  propertyId?: string;
  updatedAt?: Date;
  mediaUrls?: Record<string, string>;
}
```

---

## 3. Implementation Approach

### 3.1 Utility Architecture

The utilities follow a pure function pattern where:
- Functions receive all required data as parameters
- No external state dependencies or side effects
- Predictable outputs for given inputs
- Easy to unit test in isolation

### 3.2 filterUtils.ts Design

```typescript
// Core functions to implement
export function matchesSearch(item: ItemRecord, query: string, caseSensitive?: boolean): boolean;
export function matchesFilters(item: ItemRecord, filters: FilterState): boolean;
export function hasActiveFilters(filters: FilterState): boolean;
export function extractFilterOptions(items: ItemRecord[]): FilterOptions;
export function deriveContentType(item: ItemRecord): ContentType;
export function normalizeSearchQuery(query: string, caseSensitive?: boolean): string;
export function matchesContentTypes(item: ItemRecord, contentTypes: string[]): boolean;
export function matchesTags(item: ItemRecord, tags: string[]): boolean;
export function matchesLocations(item: ItemRecord, locations: string[]): boolean;
export function matchesPropertyIds(item: ItemRecordExtended, propertyIds: string[]): boolean;
```

### 3.3 sortUtils.ts Design

```typescript
// Comparator type
export type ItemComparator = (a: ItemRecord, b: ItemRecord) => number;

// Core exports
export const sortComparators: Record<SortOption, ItemComparator>;
export function getSortComparator(sortBy: SortOption): ItemComparator;
export function createChainedComparator(...comparators: ItemComparator[]): ItemComparator;
export function reverseSortOrder(comparator: ItemComparator): ItemComparator;
export const DEFAULT_SORT: SortOption;
export const SORT_OPTIONS: Array<{ value: SortOption; label: string }>;
```

### 3.4 Search Matching Algorithm

Search matches across multiple fields with case-insensitive partial matching (configurable):

```typescript
// Fields to search (in order of priority)
const SEARCHABLE_FIELDS = ['title', 'location', 'tags', 'instructions'] as const;

// Matching logic (OR across fields)
function matchesSearch(item: ItemRecord, query: string, caseSensitive = false): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = normalizeSearchQuery(query, caseSensitive);
  const normalize = (str: string) => caseSensitive ? str : str.toLowerCase();

  // Title match (highest priority)
  if (normalize(item.title).includes(normalizedQuery)) return true;

  // Location match
  if (item.location && normalize(item.location).includes(normalizedQuery)) return true;

  // Tags match (any tag containing query)
  if (item.tags?.some(tag => normalize(tag).includes(normalizedQuery))) return true;

  // Instructions match
  if (item.instructions && normalize(item.instructions).includes(normalizedQuery)) return true;

  return false;
}
```

### 3.5 Filter Logic Design

Filters use AND semantics - items must match ALL active filter categories:

```typescript
function matchesFilters(item: ItemRecord, filters: FilterState): boolean {
  // Early return if no filters active
  if (!hasActiveFilters(filters)) return true;

  // Content type filter (if any selected, item must match ONE)
  if (filters.contentTypes?.length) {
    if (!matchesContentTypes(item, filters.contentTypes)) return false;
  }

  // Tag filter (item must have ALL specified tags)
  if (filters.tags?.length) {
    if (!matchesTags(item, filters.tags)) return false;
  }

  // Location filter (if any selected, item must match ONE)
  if (filters.locations?.length) {
    if (!matchesLocations(item, filters.locations)) return false;
  }

  // Property filter (multi-property mode)
  if (filters.propertyIds?.length) {
    if (!matchesPropertyIds(item as ItemRecordExtended, filters.propertyIds)) return false;
  }

  return true;
}
```

### 3.6 Sort Comparators

Following the implementation plan Appendix B with defensive coding for edge cases:

```typescript
export const sortComparators: Record<SortOption, ItemComparator> = {
  'title-asc': (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
  'title-desc': (a, b) => (b.title ?? '').localeCompare(a.title ?? ''),
  'created-desc': (a, b) => {
    const aTime = getDateTimestamp(a.createdAt);
    const bTime = getDateTimestamp(b.createdAt);
    return bTime - aTime;
  },
  'created-asc': (a, b) => {
    const aTime = getDateTimestamp(a.createdAt);
    const bTime = getDateTimestamp(b.createdAt);
    return aTime - bTime;
  },
  'updated-desc': (a, b) => {
    const aExt = a as ItemRecordExtended;
    const bExt = b as ItemRecordExtended;
    const aTime = getDateTimestamp(aExt.updatedAt);
    const bTime = getDateTimestamp(bExt.updatedAt);
    return bTime - aTime;
  },
  'updated-asc': (a, b) => {
    const aExt = a as ItemRecordExtended;
    const bExt = b as ItemRecordExtended;
    const aTime = getDateTimestamp(aExt.updatedAt);
    const bTime = getDateTimestamp(bExt.updatedAt);
    return aTime - bTime;
  },
  'location-asc': (a, b) => (a.location ?? '').localeCompare(b.location ?? ''),
};

// Helper for safe date handling
function getDateTimestamp(date: Date | string | undefined | null): number {
  if (!date) return 0;
  if (date instanceof Date) return date.getTime();
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/utils/filterUtils.ts` | Filter and search helper functions |
| `src/components/ItemManager/utils/sortUtils.ts` | Sort comparator functions |
| `src/components/ItemManager/utils/__tests__/filterUtils.test.ts` | Unit tests for filterUtils |
| `src/components/ItemManager/utils/__tests__/sortUtils.test.ts` | Unit tests for sortUtils |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/utils/index.ts` | Add barrel exports for filterUtils and sortUtils (create if not exists) |

### 4.3 Functions to Implement

#### filterUtils.ts Functions

| Function | Purpose |
|----------|---------|
| `matchesSearch` | Check if item matches search query across all searchable fields |
| `matchesFilters` | Check if item matches all active filter criteria (AND logic) |
| `hasActiveFilters` | Determine if any filters are currently active |
| `extractFilterOptions` | Extract unique filter options from items array |
| `deriveContentType` | Derive effective content type from item's media array |
| `normalizeSearchQuery` | Normalize search query for consistent matching |
| `matchesContentTypes` | Check if item matches any of specified content types |
| `matchesTags` | Check if item has ALL specified tags |
| `matchesLocations` | Check if item matches any of specified locations |
| `matchesPropertyIds` | Check if item belongs to any specified property |
| `getSearchableText` | Extract all searchable text from an item |

#### sortUtils.ts Functions

| Function | Purpose |
|----------|---------|
| `sortComparators` | Record of all sort comparator functions |
| `getSortComparator` | Get comparator by sort option with fallback |
| `createChainedComparator` | Chain multiple comparators for secondary sorting |
| `reverseSortOrder` | Create reversed version of a comparator |
| `getDateTimestamp` | Safely extract timestamp from Date or string |

#### Constants

| Constant | File | Purpose |
|----------|------|---------|
| `SEARCHABLE_FIELDS` | filterUtils.ts | List of fields to search |
| `DEFAULT_SORT` | sortUtils.ts | Default sort option ('created-desc') |
| `SORT_OPTIONS` | sortUtils.ts | Array of sort option objects with labels |
| `CONTENT_TYPE_OPTIONS` | sortUtils.ts | Array of content type options with labels |

---

## 5. Detailed Task Breakdown

### Task 2.6.1: Create filterUtils.ts

**File:** `src/components/ItemManager/utils/filterUtils.ts`

**Implementation:**

```typescript
/**
 * Filter Utilities for ItemManager
 *
 * Pure functions for search matching and filter logic.
 * All functions are side-effect free and easily testable.
 *
 * @module ItemManager/utils/filterUtils
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.6)
 * @lastModified 2026-01-03
 */

import type { ItemRecord, FilterState, ItemRecordExtended } from '../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Available filter options extracted from items.
 */
export interface FilterOptions {
  contentTypes: string[];
  tags: string[];
  locations: string[];
}

/**
 * Content type values for filtering.
 */
export type ContentType = 'video' | 'image' | 'pdf' | 'text-only' | 'mixed' | 'media';

// =============================================================================
// Constants
// =============================================================================

/**
 * Fields that are searched when matching search queries.
 */
export const SEARCHABLE_FIELDS = ['title', 'location', 'tags', 'instructions'] as const;

// =============================================================================
// Search Functions
// =============================================================================

/**
 * Normalize a search query for consistent matching.
 *
 * @param query - Raw search query
 * @param caseSensitive - Whether to preserve case (default: false)
 * @returns Normalized query string
 *
 * @example
 * normalizeSearchQuery("  Coffee  ", false) // "coffee"
 * normalizeSearchQuery("Coffee", true) // "Coffee"
 */
export function normalizeSearchQuery(query: string, caseSensitive = false): string {
  const trimmed = query.trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

/**
 * Extract all searchable text from an item.
 *
 * @param item - Item to extract text from
 * @returns Array of searchable text strings
 */
export function getSearchableText(item: ItemRecord): string[] {
  const texts: string[] = [item.title];

  if (item.location) texts.push(item.location);
  if (item.tags) texts.push(...item.tags);
  if (item.instructions) texts.push(item.instructions);

  return texts;
}

/**
 * Check if an item matches the search query.
 * Searches across: title, location, tags, instructions.
 *
 * @param item - Item to check
 * @param query - Search query string
 * @param caseSensitive - Whether to use case-sensitive matching (default: false)
 * @returns true if item matches query
 *
 * @example
 * matchesSearch(item, "") // true (empty query matches all)
 * matchesSearch(item, "coffee") // true if any field contains "coffee"
 * matchesSearch(item, "KITCHEN", false) // true if any field contains "kitchen"
 */
export function matchesSearch(
  item: ItemRecord,
  query: string,
  caseSensitive = false
): boolean {
  // Empty query matches everything
  if (!query.trim()) return true;

  const normalizedQuery = normalizeSearchQuery(query, caseSensitive);
  const normalize = (str: string) => caseSensitive ? str : str.toLowerCase();

  // Title match
  if (normalize(item.title).includes(normalizedQuery)) return true;

  // Location match
  if (item.location && normalize(item.location).includes(normalizedQuery)) return true;

  // Tags match (any tag containing query)
  if (item.tags?.some(tag => normalize(tag).includes(normalizedQuery))) return true;

  // Instructions match
  if (item.instructions && normalize(item.instructions).includes(normalizedQuery)) return true;

  return false;
}

// =============================================================================
// Individual Filter Functions
// =============================================================================

/**
 * Check if an item matches any of the specified content types.
 *
 * @param item - Item to check
 * @param contentTypes - Array of content types to match against
 * @returns true if item's content type is in the array
 *
 * @example
 * matchesContentTypes(item, ['video', 'image']) // true if item is video or image
 */
export function matchesContentTypes(
  item: ItemRecord,
  contentTypes: string[]
): boolean {
  if (!contentTypes.length) return true;
  return contentTypes.includes(item.contentType);
}

/**
 * Check if an item has ALL specified tags.
 * Uses AND logic: item must have every specified tag.
 *
 * @param item - Item to check
 * @param tags - Array of required tags
 * @returns true if item has all specified tags
 *
 * @example
 * matchesTags(item, ['kitchen', 'appliance']) // true if item has BOTH tags
 */
export function matchesTags(
  item: ItemRecord,
  tags: string[]
): boolean {
  if (!tags.length) return true;
  if (!item.tags || item.tags.length === 0) return false;
  return tags.every(tag => item.tags!.includes(tag));
}

/**
 * Check if an item matches any of the specified locations.
 * Uses OR logic: item must match ONE of the locations.
 *
 * @param item - Item to check
 * @param locations - Array of locations to match against
 * @returns true if item's location is in the array
 *
 * @example
 * matchesLocations(item, ['Kitchen', 'Bathroom']) // true if item is in Kitchen OR Bathroom
 */
export function matchesLocations(
  item: ItemRecord,
  locations: string[]
): boolean {
  if (!locations.length) return true;
  if (!item.location) return false;
  return locations.includes(item.location);
}

/**
 * Check if an item belongs to any of the specified properties.
 * For multi-property mode.
 *
 * @param item - Extended item with propertyId
 * @param propertyIds - Array of property IDs to match against
 * @returns true if item's propertyId is in the array
 */
export function matchesPropertyIds(
  item: ItemRecordExtended,
  propertyIds: string[]
): boolean {
  if (!propertyIds.length) return true;
  if (!item.propertyId) return false;
  return propertyIds.includes(item.propertyId);
}

// =============================================================================
// Composite Filter Functions
// =============================================================================

/**
 * Check if any filters are currently active.
 *
 * @param filters - Filter state to check
 * @returns true if any filter has active values
 *
 * @example
 * hasActiveFilters({}) // false
 * hasActiveFilters({ contentTypes: ['video'] }) // true
 * hasActiveFilters({ tags: [] }) // false (empty array is not active)
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return Boolean(
    (filters.contentTypes && filters.contentTypes.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.locations && filters.locations.length > 0) ||
    (filters.propertyIds && filters.propertyIds.length > 0)
  );
}

/**
 * Check if an item matches all active filter criteria.
 * Uses AND logic: item must satisfy ALL active filter categories.
 *
 * @param item - Item to check
 * @param filters - Active filter state
 * @returns true if item passes all filter checks
 *
 * @example
 * matchesFilters(item, {}) // true (no active filters)
 * matchesFilters(item, { contentTypes: ['video'], tags: ['kitchen'] })
 * // true only if item is video AND has 'kitchen' tag
 */
export function matchesFilters(
  item: ItemRecord,
  filters: FilterState
): boolean {
  // Early return if no filters active
  if (!hasActiveFilters(filters)) return true;

  // Content type filter
  if (filters.contentTypes?.length) {
    if (!matchesContentTypes(item, filters.contentTypes)) return false;
  }

  // Tags filter (ALL must match)
  if (filters.tags?.length) {
    if (!matchesTags(item, filters.tags)) return false;
  }

  // Locations filter (ANY must match)
  if (filters.locations?.length) {
    if (!matchesLocations(item, filters.locations)) return false;
  }

  // Property filter (multi-property mode)
  if (filters.propertyIds?.length) {
    if (!matchesPropertyIds(item as ItemRecordExtended, filters.propertyIds)) return false;
  }

  return true;
}

// =============================================================================
// Filter Options Extraction
// =============================================================================

/**
 * Extract unique filter options from an array of items.
 * Useful for populating filter dropdown/checkbox options.
 *
 * @param items - Array of items to extract options from
 * @returns Object with unique content types, tags, and locations
 *
 * @example
 * extractFilterOptions(items)
 * // { contentTypes: ['video', 'image'], tags: ['kitchen', 'appliance'], locations: ['Kitchen'] }
 */
export function extractFilterOptions(items: ItemRecord[]): FilterOptions {
  const contentTypes = new Set<string>();
  const tags = new Set<string>();
  const locations = new Set<string>();

  for (const item of items) {
    // Content type
    contentTypes.add(item.contentType);

    // Tags
    if (item.tags) {
      for (const tag of item.tags) {
        tags.add(tag);
      }
    }

    // Location
    if (item.location) {
      locations.add(item.location);
    }
  }

  return {
    contentTypes: Array.from(contentTypes).sort(),
    tags: Array.from(tags).sort(),
    locations: Array.from(locations).sort(),
  };
}

/**
 * Derive the effective content type from an item.
 * Handles special cases like mixed content and media analysis.
 *
 * @param item - Item to analyze
 * @returns Derived content type string
 */
export function deriveContentType(item: ItemRecord): ContentType {
  return item.contentType as ContentType;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Count how many filters are currently active.
 *
 * @param filters - Filter state to count
 * @returns Number of active filter categories
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;

  if (filters.contentTypes?.length) count++;
  if (filters.tags?.length) count++;
  if (filters.locations?.length) count++;
  if (filters.propertyIds?.length) count++;

  return count;
}

/**
 * Create a clear (empty) filter state.
 *
 * @returns Empty filter state object
 */
export function createEmptyFilterState(): FilterState {
  return {
    contentTypes: [],
    tags: [],
    locations: [],
    propertyIds: [],
  };
}
```

### Task 2.6.2: Create sortUtils.ts

**File:** `src/components/ItemManager/utils/sortUtils.ts`

**Implementation:**

```typescript
/**
 * Sort Utilities for ItemManager
 *
 * Comparator functions for sorting ItemRecord arrays.
 * All comparators are pure functions that handle edge cases gracefully.
 *
 * @module ItemManager/utils/sortUtils
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.6)
 * @lastModified 2026-01-03
 */

import type { ItemRecord, SortOption, ItemRecordExtended } from '../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Comparator function type for sorting ItemRecords.
 */
export type ItemComparator = (a: ItemRecord, b: ItemRecord) => number;

/**
 * Sort option with display label.
 */
export interface SortOptionConfig {
  value: SortOption;
  label: string;
}

/**
 * Content type option with display label.
 */
export interface ContentTypeOption {
  value: string;
  label: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default sort option when none specified.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';

/**
 * Available sort options with display labels.
 */
export const SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'created-desc', label: 'Newest First' },
  { value: 'created-asc', label: 'Oldest First' },
  { value: 'updated-desc', label: 'Recently Modified' },
  { value: 'updated-asc', label: 'Least Recently Modified' },
  { value: 'location-asc', label: 'Location (A-Z)' },
];

/**
 * Content type options with display labels.
 */
export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Photo' },
  { value: 'pdf', label: 'PDF' },
  { value: 'text-only', label: 'Text Only' },
  { value: 'mixed', label: 'Mixed' },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Safely extract timestamp from Date, string, or undefined.
 * Returns 0 for invalid/missing dates (sorts to end for desc, start for asc).
 *
 * @param date - Date, ISO string, or undefined
 * @returns Unix timestamp in milliseconds, or 0 if invalid
 *
 * @example
 * getDateTimestamp(new Date('2024-01-15')) // 1705276800000
 * getDateTimestamp('2024-01-15') // 1705276800000
 * getDateTimestamp(undefined) // 0
 * getDateTimestamp(null) // 0
 */
export function getDateTimestamp(date: Date | string | undefined | null): number {
  if (!date) return 0;

  if (date instanceof Date) {
    const time = date.getTime();
    return isNaN(time) ? 0 : time;
  }

  if (typeof date === 'string') {
    const parsed = new Date(date);
    const time = parsed.getTime();
    return isNaN(time) ? 0 : time;
  }

  return 0;
}

/**
 * Safe string comparison that handles null/undefined.
 *
 * @param a - First string or undefined
 * @param b - Second string or undefined
 * @returns Comparison result (-1, 0, 1)
 */
function safeLocaleCompare(a: string | undefined | null, b: string | undefined | null): number {
  const strA = a ?? '';
  const strB = b ?? '';
  return strA.localeCompare(strB);
}

// =============================================================================
// Sort Comparators
// =============================================================================

/**
 * Record of all sort comparator functions.
 * Each comparator handles null/undefined values gracefully.
 */
export const sortComparators: Record<SortOption, ItemComparator> = {
  'title-asc': (a, b) => safeLocaleCompare(a.title, b.title),

  'title-desc': (a, b) => safeLocaleCompare(b.title, a.title),

  'created-desc': (a, b) => {
    const aTime = getDateTimestamp(a.createdAt);
    const bTime = getDateTimestamp(b.createdAt);
    return bTime - aTime;
  },

  'created-asc': (a, b) => {
    const aTime = getDateTimestamp(a.createdAt);
    const bTime = getDateTimestamp(b.createdAt);
    return aTime - bTime;
  },

  'updated-desc': (a, b) => {
    const aExt = a as ItemRecordExtended;
    const bExt = b as ItemRecordExtended;
    const aTime = getDateTimestamp(aExt.updatedAt);
    const bTime = getDateTimestamp(bExt.updatedAt);
    return bTime - aTime;
  },

  'updated-asc': (a, b) => {
    const aExt = a as ItemRecordExtended;
    const bExt = b as ItemRecordExtended;
    const aTime = getDateTimestamp(aExt.updatedAt);
    const bTime = getDateTimestamp(bExt.updatedAt);
    return aTime - bTime;
  },

  'location-asc': (a, b) => safeLocaleCompare(a.location, b.location),
};

// =============================================================================
// Comparator Utilities
// =============================================================================

/**
 * Get a sort comparator by option, with fallback to default.
 *
 * @param sortBy - Sort option to retrieve
 * @returns Comparator function (never returns undefined)
 *
 * @example
 * const comparator = getSortComparator('title-asc');
 * const sorted = items.sort(comparator);
 */
export function getSortComparator(sortBy: SortOption): ItemComparator {
  return sortComparators[sortBy] ?? sortComparators[DEFAULT_SORT];
}

/**
 * Create a chained comparator from multiple comparators.
 * Uses secondary comparators when primary returns 0 (equal).
 *
 * @param comparators - Array of comparators (primary first)
 * @returns Combined comparator function
 *
 * @example
 * const comparator = createChainedComparator(
 *   sortComparators['location-asc'],
 *   sortComparators['title-asc']
 * );
 * // Sorts by location, then by title within same location
 */
export function createChainedComparator(...comparators: ItemComparator[]): ItemComparator {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

/**
 * Reverse the order of a comparator.
 *
 * @param comparator - Comparator to reverse
 * @returns Comparator with reversed order
 *
 * @example
 * const ascComparator = sortComparators['title-asc'];
 * const descComparator = reverseSortOrder(ascComparator);
 */
export function reverseSortOrder(comparator: ItemComparator): ItemComparator {
  return (a, b) => comparator(b, a);
}

/**
 * Create a comparator from a key extraction function.
 *
 * @param keyFn - Function to extract comparable value from item
 * @param descending - Whether to sort in descending order
 * @returns Comparator function
 *
 * @example
 * const byMediaCount = createKeyComparator(item => item.media.length, true);
 * // Sorts by number of media items, most first
 */
export function createKeyComparator<T extends string | number>(
  keyFn: (item: ItemRecord) => T,
  descending = false
): ItemComparator {
  return (a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);

    let result: number;
    if (typeof aKey === 'string' && typeof bKey === 'string') {
      result = aKey.localeCompare(bKey);
    } else {
      result = (aKey as number) - (bKey as number);
    }

    return descending ? -result : result;
  };
}

/**
 * Get the label for a sort option.
 *
 * @param sortBy - Sort option to get label for
 * @returns Human-readable label
 */
export function getSortLabel(sortBy: SortOption): string {
  const option = SORT_OPTIONS.find(opt => opt.value === sortBy);
  return option?.label ?? sortBy;
}

/**
 * Check if a sort option is valid.
 *
 * @param sortBy - Value to check
 * @returns true if sortBy is a valid SortOption
 */
export function isValidSortOption(sortBy: string): sortBy is SortOption {
  return sortBy in sortComparators;
}
```

### Task 2.6.3: Create Utils Barrel Export

**File:** `src/components/ItemManager/utils/index.ts`

```typescript
/**
 * ItemManager Utility Exports
 *
 * @module ItemManager/utils
 */

// Filter utilities
export {
  matchesSearch,
  matchesFilters,
  hasActiveFilters,
  extractFilterOptions,
  deriveContentType,
  normalizeSearchQuery,
  matchesContentTypes,
  matchesTags,
  matchesLocations,
  matchesPropertyIds,
  getSearchableText,
  countActiveFilters,
  createEmptyFilterState,
  SEARCHABLE_FIELDS,
} from './filterUtils';

export type { FilterOptions, ContentType } from './filterUtils';

// Sort utilities
export {
  sortComparators,
  getSortComparator,
  createChainedComparator,
  reverseSortOrder,
  createKeyComparator,
  getDateTimestamp,
  getSortLabel,
  isValidSortOption,
  DEFAULT_SORT,
  SORT_OPTIONS,
  CONTENT_TYPE_OPTIONS,
} from './sortUtils';

export type { ItemComparator, SortOptionConfig, ContentTypeOption } from './sortUtils';
```

### Task 2.6.4: Create Unit Tests for filterUtils

**File:** `src/components/ItemManager/utils/__tests__/filterUtils.test.ts`

**Test Cases to Implement:**

```typescript
/**
 * Unit tests for filterUtils
 */

describe('filterUtils', () => {
  // matchesSearch tests
  describe('matchesSearch', () => {
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
  });

  // matchesFilters tests
  describe('matchesFilters', () => {
    it('should return true for empty filters');
    it('should filter by content type');
    it('should filter by multiple content types (OR logic)');
    it('should filter by tags (AND logic - all tags required)');
    it('should filter by locations (OR logic)');
    it('should filter by property IDs');
    it('should apply multiple filters with AND logic');
    it('should return false if any filter fails');
  });

  // hasActiveFilters tests
  describe('hasActiveFilters', () => {
    it('should return false for empty filter state');
    it('should return false for filters with empty arrays');
    it('should return true when contentTypes has values');
    it('should return true when tags has values');
    it('should return true when locations has values');
    it('should return true when propertyIds has values');
  });

  // extractFilterOptions tests
  describe('extractFilterOptions', () => {
    it('should return empty arrays for empty items');
    it('should extract unique content types');
    it('should extract unique tags from all items');
    it('should extract unique locations');
    it('should sort all extracted options alphabetically');
  });

  // Individual filter function tests
  describe('matchesContentTypes', () => {
    it('should return true for empty array');
    it('should return true when item type is in array');
    it('should return false when item type is not in array');
  });

  describe('matchesTags', () => {
    it('should return true for empty array');
    it('should return true when item has all tags');
    it('should return false when item missing any tag');
    it('should return false when item has no tags');
  });
});
```

### Task 2.6.5: Create Unit Tests for sortUtils

**File:** `src/components/ItemManager/utils/__tests__/sortUtils.test.ts`

**Test Cases to Implement:**

```typescript
/**
 * Unit tests for sortUtils
 */

describe('sortUtils', () => {
  // Sort comparator tests
  describe('sortComparators', () => {
    describe('title-asc', () => {
      it('should sort alphabetically A-Z');
      it('should handle equal titles');
      it('should handle empty titles');
    });

    describe('title-desc', () => {
      it('should sort alphabetically Z-A');
    });

    describe('created-desc', () => {
      it('should sort newest first');
      it('should handle Date objects');
      it('should handle ISO date strings');
      it('should handle missing dates (sort to end)');
    });

    describe('created-asc', () => {
      it('should sort oldest first');
    });

    describe('updated-desc', () => {
      it('should sort by updatedAt newest first');
      it('should handle items without updatedAt');
    });

    describe('location-asc', () => {
      it('should sort locations alphabetically');
      it('should handle null/undefined locations');
    });
  });

  // Helper function tests
  describe('getDateTimestamp', () => {
    it('should return timestamp for Date object');
    it('should return timestamp for ISO string');
    it('should return 0 for undefined');
    it('should return 0 for null');
    it('should return 0 for invalid date string');
    it('should return 0 for invalid Date object');
  });

  describe('getSortComparator', () => {
    it('should return correct comparator for valid option');
    it('should return default comparator for invalid option');
  });

  describe('createChainedComparator', () => {
    it('should use secondary comparator when primary returns 0');
    it('should stop at first non-zero result');
  });

  describe('reverseSortOrder', () => {
    it('should reverse the order of comparisons');
  });

  describe('getSortLabel', () => {
    it('should return label for valid sort option');
    it('should return the value itself for unknown option');
  });
});
```

---

## 6. Testing Requirements

### 6.1 Unit Test Coverage Requirements

| Function | Minimum Coverage |
|----------|------------------|
| `matchesSearch` | 100% branch coverage |
| `matchesFilters` | 100% branch coverage |
| `hasActiveFilters` | 100% branch coverage |
| `extractFilterOptions` | 90% line coverage |
| `sortComparators` (all) | 100% branch coverage |
| `getDateTimestamp` | 100% branch coverage |

### 6.2 Edge Cases to Test

1. **Empty/null handling:**
   - Empty items array
   - Items with undefined optional fields (location, tags, instructions)
   - Empty search query
   - Empty filter arrays

2. **Date handling:**
   - Date objects
   - ISO date strings
   - Invalid dates
   - Missing dates

3. **Unicode/special characters:**
   - Non-ASCII characters in search
   - Emoji in tags/titles
   - Special regex characters

4. **Large datasets:**
   - Performance test with 500+ items
   - Verify no memory leaks

---

## 7. Acceptance Criteria

From REQ-067 and implementation plan:

- [ ] Users can apply filters to item collections and see only items matching the filter criteria
- [ ] Users can sort item collections by different attributes and see results in the expected order
- [ ] Multiple filters can be applied simultaneously with correct combined results (AND logic)
- [ ] Sort order (ascending/descending) can be toggled and produces correct ordering
- [ ] Filter and sort operations return correct results for edge cases (empty collections, no matches, null values)
- [ ] All filter and sort functions are covered by unit tests demonstrating correct behavior

### Technical Acceptance Criteria:

- [ ] All functions are pure (no side effects)
- [ ] All functions have comprehensive JSDoc documentation
- [ ] TypeScript strict mode passes without errors
- [ ] Unit tests achieve 95%+ coverage
- [ ] Functions handle null/undefined gracefully
- [ ] Code follows established patterns from ItemCapture utils

---

## 8. Integration Notes

### 8.1 Usage by useItemSearch Hook

The utilities will be consumed by the `useItemSearch` hook (Task 2.1):

```typescript
// In useItemSearch.ts
import {
  matchesSearch,
  matchesFilters,
  hasActiveFilters,
  extractFilterOptions
} from '../utils/filterUtils';
import { getSortComparator } from '../utils/sortUtils';

// Usage in hook
const filteredItems = useMemo(() => {
  let result = items;

  if (searchQuery.trim()) {
    result = result.filter(item => matchesSearch(item, searchQuery));
  }

  if (hasActiveFilters(filters)) {
    result = result.filter(item => matchesFilters(item, filters));
  }

  const comparator = getSortComparator(sortBy);
  return [...result].sort(comparator);
}, [items, searchQuery, filters, sortBy]);
```

### 8.2 Relationship to Other Phase 2 Tasks

| Task | Relationship |
|------|--------------|
| 2.1 (useItemSearch hook) | Consumes these utilities for search/filter/sort logic |
| 2.2 (ItemToolbar) | Uses `SORT_OPTIONS` and `CONTENT_TYPE_OPTIONS` for UI |
| 2.3 (Search UI) | Triggers search via state; utilities handle matching |
| 2.4 (FilterPanel) | Uses `extractFilterOptions` for available filter values |
| 2.5 (SortMenu) | Uses `SORT_OPTIONS` for dropdown menu |

### 8.3 Constants Export

The utilities export constants that should be used by UI components:

```typescript
// For SortMenu component
import { SORT_OPTIONS, DEFAULT_SORT } from '../utils/sortUtils';

// For FilterPanel component
import { CONTENT_TYPE_OPTIONS } from '../utils/sortUtils';
```

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance with large item counts (>500) | Medium | Medium | Profile performance; consider indexing for frequent searches |
| Unicode normalization issues in search | Low | Low | Use `String.prototype.normalize()` if issues arise |
| Date parsing edge cases | Low | Medium | Comprehensive date handling with fallback to 0 |
| Type mismatches with ItemCapture types | Low | Medium | Import shared types; use type assertions where needed |

---

## 10. File Structure After Implementation

```
src/components/ItemManager/
├── utils/
│   ├── index.ts                    # Barrel exports
│   ├── filterUtils.ts              # NEW: Filter/search functions
│   ├── sortUtils.ts                # NEW: Sort comparators
│   ├── constants.ts                # Existing constants (from Phase 1)
│   └── __tests__/
│       ├── filterUtils.test.ts     # NEW: Filter utils tests
│       └── sortUtils.test.ts       # NEW: Sort utils tests
├── hooks/
│   ├── useItemSearch.ts            # Uses filterUtils + sortUtils
│   └── useItemManagerState.ts      # Uses DEFAULT_SORT
└── ItemManager.types.ts            # FilterState, SortOption types
```

---

## 11. References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 2, Task 2.6
- [Implementation Plan Appendix B](/docs/prd/item-capture-manager-implementation-plan.md#appendix-b-sort-comparators-reference) - Sort comparators reference
- [Implementation Plan Appendix C](/docs/prd/item-capture-manager-implementation-plan.md#appendix-c-default-configuration) - Default configuration
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - ItemRecord, MediaItem types
- [Validation Utils](/src/components/ItemCapture/utils/validation.ts) - Pattern reference for pure utility functions
- [REQ-062 useItemSearch Overview](/docs/REQ-062-create-useitemsearch-hook-overview.md) - Consumer of these utilities

---

**Document Version:** 1.0
**Status:** Ready for Implementation
