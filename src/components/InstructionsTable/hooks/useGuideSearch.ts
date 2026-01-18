'use client';

/**
 * useGuideSearch - Hook for filtering, searching, and sorting guides
 *
 * Centralizes all search/filter/sort logic for the Guides list page.
 * Provides filtered results and computed filter options.
 *
 * @module InstructionsTable/hooks/useGuideSearch
 * @see docs/req-220-toolbar-infrastructure-guides-list-overview.md
 * @lastModified 2026-01-13 (REQ-220)
 */

import { useMemo } from 'react';
import type { InstructionRow, GuideSortOption } from '../InstructionsTable.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Filter state for filtering guides.
 * All fields are optional - omitted fields are not applied as filters.
 */
export interface GuideFilterState {
  /** Search query string for title/item name/purpose matching */
  search?: string;
  /** Filter by purpose type(s) */
  purposes?: string[];
  /** Filter by property ID(s) - for multi-property mode */
  propertyIds?: string[];
}

/**
 * Options for the useGuideSearch hook.
 */
export interface UseGuideSearchOptions {
  /** Array of guides to search/filter/sort */
  guides: InstructionRow[];
  /** Current search query string */
  searchQuery: string;
  /** Active filter state */
  filters: GuideFilterState;
  /** Current sort option */
  sortBy: GuideSortOption;
}

/**
 * Return type for the useGuideSearch hook.
 */
export interface UseGuideSearchReturn {
  /** Filtered, sorted array of guides matching current search/filter criteria */
  filteredGuides: InstructionRow[];
  /** Number of guides after filtering */
  resultCount: number;
  /** Total number of guides before filtering */
  totalCount: number;
  /** Whether any search or filter is active */
  isFiltered: boolean;
  /** Whether there are any results after filtering */
  hasResults: boolean;
  /** Whether there is an active search query */
  hasSearchQuery: boolean;
  /** Whether any filters are currently active */
  hasActiveFilters: boolean;
  /** Available filter options extracted from all guides */
  filterOptions: {
    /** Unique purpose types from all guides */
    purposes: string[];
    /** Unique property IDs from all guides */
    propertyIds: string[];
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a guide matches the search query.
 * Searches in title, item name, and purpose (case-insensitive).
 */
function guideMatchesSearch(guide: InstructionRow, query: string): boolean {
  if (!query.trim()) return true;

  const lowerQuery = query.toLowerCase().trim();

  // Search in title
  if (guide.articleTitle.toLowerCase().includes(lowerQuery)) return true;

  // Search in item name
  if (guide.itemName.toLowerCase().includes(lowerQuery)) return true;

  // Search in purpose (formatted)
  const formattedPurpose = guide.purpose
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .toLowerCase();
  if (formattedPurpose.includes(lowerQuery)) return true;

  // Search in room if available
  if (guide.room && guide.room.toLowerCase().includes(lowerQuery)) return true;

  return false;
}

/**
 * Check if a guide matches all active filters.
 */
function guideMatchesFilters(guide: InstructionRow, filters: GuideFilterState): boolean {
  // Check purpose filter
  if (filters.purposes && filters.purposes.length > 0) {
    if (!filters.purposes.includes(guide.purpose)) return false;
  }

  // Check property filter
  if (filters.propertyIds && filters.propertyIds.length > 0) {
    if (!guide.propertyId || !filters.propertyIds.includes(guide.propertyId)) return false;
  }

  return true;
}

/**
 * Sort guides based on the selected sort option.
 */
function sortGuides(guides: InstructionRow[], sort: GuideSortOption): InstructionRow[] {
  const sorted = [...guides];

  sorted.sort((a, b) => {
    switch (sort) {
      case 'title-asc':
        return a.articleTitle.localeCompare(b.articleTitle);
      case 'title-desc':
        return b.articleTitle.localeCompare(a.articleTitle);
      case 'item-asc':
        return a.itemName.localeCompare(b.itemName);
      case 'item-desc':
        return b.itemName.localeCompare(a.itemName);
      case 'purpose-asc':
        return a.purpose.localeCompare(b.purpose);
      case 'purpose-desc':
        return b.purpose.localeCompare(a.purpose);
      case 'created-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Extract unique filter options from guides.
 */
function extractFilterOptions(guides: InstructionRow[]): {
  purposes: string[];
  propertyIds: string[];
} {
  const purposeSet = new Set<string>();
  const propertyIdSet = new Set<string>();

  for (const guide of guides) {
    if (guide.purpose) {
      purposeSet.add(guide.purpose);
    }
    if (guide.propertyId) {
      propertyIdSet.add(guide.propertyId);
    }
  }

  return {
    purposes: Array.from(purposeSet).sort(),
    propertyIds: Array.from(propertyIdSet).sort(),
  };
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for filtering, searching, and sorting guides.
 *
 * @example
 * const { filteredGuides, isFiltered, filterOptions } = useGuideSearch({
 *   guides: instructionsData,
 *   searchQuery: debouncedSearch,
 *   filters: { purposes: ['how-to-use'] },
 *   sortBy: 'created-desc',
 * });
 */
export function useGuideSearch({
  guides,
  searchQuery,
  filters,
  sortBy,
}: UseGuideSearchOptions): UseGuideSearchReturn {
  // Extract filter options from all guides (before filtering)
  const filterOptions = useMemo(
    () => extractFilterOptions(guides),
    [guides]
  );

  // Compute filtered and sorted guides
  const filteredGuides = useMemo(() => {
    // Step 1: Filter by search query
    let result = guides.filter((guide) => guideMatchesSearch(guide, searchQuery));

    // Step 2: Filter by active filters
    result = result.filter((guide) => guideMatchesFilters(guide, filters));

    // Step 3: Sort results
    result = sortGuides(result, sortBy);

    return result;
  }, [guides, searchQuery, filters, sortBy]);

  // Compute derived state
  const hasSearchQuery = Boolean(searchQuery.trim());
  const hasActiveFilters = Boolean(
    (filters.purposes && filters.purposes.length > 0) ||
    (filters.propertyIds && filters.propertyIds.length > 0)
  );
  const isFiltered = hasSearchQuery || hasActiveFilters;
  const hasResults = filteredGuides.length > 0;

  return {
    filteredGuides,
    resultCount: filteredGuides.length,
    totalCount: guides.length,
    isFiltered,
    hasResults,
    hasSearchQuery,
    hasActiveFilters,
    filterOptions,
  };
}

export default useGuideSearch;
