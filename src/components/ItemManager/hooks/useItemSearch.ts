/**
 * useItemSearch Hook
 *
 * Provides search, filter, and sort functionality for ItemManager.
 * Uses memoization for efficient re-renders.
 *
 * @module ItemManager/hooks/useItemSearch
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.1)
 * @lastModified 2026-01-04 (REQ-062 Task 6)
 */

'use client';

import { useMemo, useCallback } from 'react';
import type { ItemRecord } from '@/components/ItemCapture';
import type {
  FilterState,
  SortOption,
  UseItemSearchOptions,
  UseItemSearchReturn,
} from '../ItemManager.types';
import {
  matchesSearch,
  matchesFilters,
  hasActiveFilters as checkHasActiveFilters,
  extractFilterOptions,
} from '../utils/filterUtils';
import { getSortComparator } from '../utils/sortUtils';

/**
 * Hook for searching, filtering, and sorting items.
 *
 * @param options - Configuration options for the hook
 * @returns Object containing filtered items, computed state, and utility functions
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

  // Debug logger - memoized to prevent unnecessary recreations
  const log = useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log('[useItemSearch]', ...args);
      }
    },
    [debug]
  );

  // Compute whether we have an active search query
  const hasSearchQuery = useMemo(() => {
    return searchQuery.trim().length > 0;
  }, [searchQuery]);

  // Compute whether we have active filters
  const hasActiveFilters = useMemo(() => {
    return checkHasActiveFilters(filters);
  }, [filters]);

  // Compute filtered and sorted items
  const filteredItems = useMemo(() => {
    log('Computing filtered items...', {
      totalItems: items.length,
      searchQuery,
      hasActiveFilters,
      sortBy,
    });

    let result = [...items]; // Create new array to avoid mutation

    // Apply search filter if query exists
    if (hasSearchQuery) {
      result = result.filter((item) => matchesSearch(item, searchQuery, caseSensitive));
      log(`After search filter: ${result.length} items`);
    }

    // Apply filters if any are active
    if (hasActiveFilters) {
      result = result.filter((item) => matchesFilters(item, filters));
      log(`After filters: ${result.length} items`);
    }

    // Apply sort comparator
    const comparator = getSortComparator(sortBy);
    result.sort(comparator);
    log(`After sorting by ${sortBy}: ${result.length} items`);

    return result;
  }, [items, searchQuery, filters, sortBy, caseSensitive, hasSearchQuery, hasActiveFilters, log]);

  // Extract filter options from all items (not filtered items)
  // This ensures the filter dropdowns always show all available options
  const filterOptions = useMemo(() => {
    log('Extracting filter options...');
    return extractFilterOptions(items);
  }, [items, log]);

  // Computed values
  const resultCount = filteredItems.length;
  const totalCount = items.length;
  const isFiltered = hasSearchQuery || hasActiveFilters;
  const hasResults = resultCount > 0;

  // Utility function: check if a specific item matches the current search
  const itemMatchesSearch = useCallback(
    (item: ItemRecord) => {
      return matchesSearch(item, searchQuery, caseSensitive);
    },
    [searchQuery, caseSensitive]
  );

  // Utility function: check if a specific item matches the current filters
  const itemMatchesFilters = useCallback(
    (item: ItemRecord) => {
      return matchesFilters(item, filters);
    },
    [filters]
  );

  // Return stable object using useMemo
  return useMemo(
    () => ({
      // Results
      filteredItems,
      resultCount,
      totalCount,

      // Computed state
      isFiltered,
      hasResults,
      hasSearchQuery,
      hasActiveFilters,

      // Available filter options
      filterOptions,

      // Utility functions
      itemMatchesSearch,
      itemMatchesFilters,
    }),
    [
      filteredItems,
      resultCount,
      totalCount,
      isFiltered,
      hasResults,
      hasSearchQuery,
      hasActiveFilters,
      filterOptions,
      itemMatchesSearch,
      itemMatchesFilters,
    ]
  );
}

export default useItemSearch;
