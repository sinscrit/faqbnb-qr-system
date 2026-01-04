/**
 * Unit tests for useItemSearch hook
 *
 * Note: These tests verify the hook's underlying logic through the utility functions
 * since @testing-library/react is not installed. The hook itself is a thin wrapper
 * around these utilities with memoization.
 *
 * @module ItemManager/hooks/__tests__/useItemSearch.test
 * @lastModified 2026-01-04 (REQ-062 Task 11)
 */

import { describe, it, expect } from 'vitest';
import type { ItemRecord } from '@/components/ItemCapture';
import type { FilterState, ItemRecordExtended } from '../../ItemManager.types';
import {
  matchesSearch,
  matchesFilters,
  hasActiveFilters,
  extractFilterOptions,
} from '../../utils/filterUtils';
import { sortComparators, getSortComparator, DEFAULT_SORT } from '../../utils/sortUtils';

/**
 * Factory function to create mock items for testing.
 */
const createMockItem = (overrides?: Partial<ItemRecordExtended>): ItemRecord => ({
  id: `test-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Item',
  contentType: 'video',
  media: [],
  createdAt: new Date('2024-01-15'),
  ...overrides,
});

/**
 * Create a set of diverse mock items for testing.
 */
const createMockItems = (): ItemRecord[] => [
  createMockItem({
    id: '1',
    title: 'Coffee Machine',
    contentType: 'video',
    location: 'Kitchen',
    tags: ['appliance', 'important'],
    instructions: 'Press the button to brew',
    createdAt: new Date('2024-01-01'),
  }),
  createMockItem({
    id: '2',
    title: 'Dishwasher Guide',
    contentType: 'pdf',
    location: 'Kitchen',
    tags: ['appliance', 'cleaning'],
    instructions: 'Load dishes and select cycle',
    createdAt: new Date('2024-02-01'),
  }),
  createMockItem({
    id: '3',
    title: 'Bathroom Rules',
    contentType: 'text-only',
    location: 'Bathroom',
    tags: ['rules', 'cleaning'],
    instructions: 'Keep the bathroom clean',
    createdAt: new Date('2024-03-01'),
  }),
  createMockItem({
    id: '4',
    title: 'Pool Safety',
    contentType: 'image',
    location: 'Outdoor',
    tags: ['safety', 'outdoor'],
    instructions: 'No diving in shallow end',
    createdAt: new Date('2024-04-01'),
  }),
  createMockItem({
    id: '5',
    title: 'Air Conditioner',
    contentType: 'video',
    location: 'Living Room',
    tags: ['appliance', 'important'],
    instructions: 'Set temperature using remote',
    createdAt: new Date('2024-05-01'),
  }),
];

/**
 * Simulate what the useItemSearch hook does:
 * 1. Filter by search query
 * 2. Filter by filters
 * 3. Sort by sort option
 */
function simulateUseItemSearch(
  items: ItemRecord[],
  searchQuery: string,
  filters: FilterState,
  sortBy: string,
  caseSensitive = false
) {
  const hasSearchQuery = searchQuery.trim().length > 0;
  const activeFilters = hasActiveFilters(filters);

  // Apply search filter
  let result = [...items];
  if (hasSearchQuery) {
    result = result.filter((item) => matchesSearch(item, searchQuery, caseSensitive));
  }

  // Apply filters
  if (activeFilters) {
    result = result.filter((item) => matchesFilters(item, filters));
  }

  // Apply sort
  const comparator = getSortComparator(sortBy as any);
  result.sort(comparator);

  // Extract filter options from ALL items (not filtered)
  const filterOptions = extractFilterOptions(items);

  return {
    filteredItems: result,
    resultCount: result.length,
    totalCount: items.length,
    isFiltered: hasSearchQuery || activeFilters,
    hasResults: result.length > 0,
    hasSearchQuery,
    hasActiveFilters: activeFilters,
    filterOptions,
  };
}

// =============================================================================
// Hook Logic Integration Tests
// =============================================================================

describe('useItemSearch (simulated hook logic)', () => {
  describe('basic behavior', () => {
    it('returns all items when no search or filters are applied', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'created-desc');

      expect(result.filteredItems).toHaveLength(5);
      expect(result.totalCount).toBe(5);
      expect(result.resultCount).toBe(5);
      expect(result.isFiltered).toBe(false);
    });

    it('returns empty array when items is empty', () => {
      const result = simulateUseItemSearch([], '', {}, 'created-desc');

      expect(result.filteredItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.resultCount).toBe(0);
      expect(result.hasResults).toBe(false);
    });
  });

  // ===========================================================================
  // Search Tests
  // ===========================================================================

  describe('search functionality', () => {
    it('filters items by title match', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'coffee', {}, 'created-desc');

      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].id).toBe('1');
      expect(result.hasSearchQuery).toBe(true);
      expect(result.isFiltered).toBe(true);
    });

    it('filters items by location match', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'kitchen', {}, 'created-desc');

      expect(result.filteredItems).toHaveLength(2);
      expect(result.filteredItems.map((i) => i.id)).toContain('1');
      expect(result.filteredItems.map((i) => i.id)).toContain('2');
    });

    it('filters items by tag match', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'safety', {}, 'created-desc');

      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].id).toBe('4');
    });

    it('filters items by instructions match', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'button', {}, 'created-desc');

      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].id).toBe('1');
    });

    it('performs case-insensitive search by default', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'COFFEE', {}, 'created-desc');

      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].id).toBe('1');
    });

    it('respects case-sensitive option', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'COFFEE', {}, 'created-desc', true);

      expect(result.filteredItems).toHaveLength(0);
    });
  });

  // ===========================================================================
  // Filter Tests
  // ===========================================================================

  describe('filter functionality', () => {
    it('filters by content type', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(
        items,
        '',
        { contentTypes: ['video'] },
        'created-desc'
      );

      expect(result.filteredItems).toHaveLength(2);
      expect(result.hasActiveFilters).toBe(true);
      expect(result.isFiltered).toBe(true);
    });

    it('filters by multiple content types', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(
        items,
        '',
        { contentTypes: ['video', 'pdf'] },
        'created-desc'
      );

      expect(result.filteredItems).toHaveLength(3);
    });

    it('filters by tags (AND logic)', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(
        items,
        '',
        { tags: ['appliance', 'important'] },
        'created-desc'
      );

      // Only items with BOTH 'appliance' AND 'important' tags
      expect(result.filteredItems).toHaveLength(2);
      expect(result.filteredItems.map((i) => i.id)).toContain('1');
      expect(result.filteredItems.map((i) => i.id)).toContain('5');
    });

    it('filters by location', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(
        items,
        '',
        { locations: ['Kitchen'] },
        'created-desc'
      );

      expect(result.filteredItems).toHaveLength(2);
    });

    it('combines multiple filter categories with AND logic', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(
        items,
        '',
        {
          contentTypes: ['video'],
          locations: ['Kitchen'],
        },
        'created-desc'
      );

      // Only video items in Kitchen (just the Coffee Machine)
      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].id).toBe('1');
    });
  });

  // ===========================================================================
  // Combined Search and Filter Tests
  // ===========================================================================

  describe('combined search and filters', () => {
    it('applies both search and filters', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(
        items,
        'machine',
        { contentTypes: ['video'] },
        'created-desc'
      );

      expect(result.filteredItems).toHaveLength(1);
      expect(result.filteredItems[0].id).toBe('1');
      expect(result.hasSearchQuery).toBe(true);
      expect(result.hasActiveFilters).toBe(true);
      expect(result.isFiltered).toBe(true);
    });
  });

  // ===========================================================================
  // Sort Tests
  // ===========================================================================

  describe('sort functionality', () => {
    it('sorts by title ascending', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'title-asc');

      const titles = result.filteredItems.map((i) => i.title);
      expect(titles[0]).toBe('Air Conditioner');
      expect(titles[4]).toBe('Pool Safety');
    });

    it('sorts by title descending', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'title-desc');

      const titles = result.filteredItems.map((i) => i.title);
      expect(titles[0]).toBe('Pool Safety');
      expect(titles[4]).toBe('Air Conditioner');
    });

    it('sorts by created date descending (newest first)', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'created-desc');

      const ids = result.filteredItems.map((i) => i.id);
      expect(ids[0]).toBe('5'); // May 1 (newest)
      expect(ids[4]).toBe('1'); // Jan 1 (oldest)
    });

    it('sorts by created date ascending (oldest first)', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'created-asc');

      const ids = result.filteredItems.map((i) => i.id);
      expect(ids[0]).toBe('1'); // Jan 1 (oldest)
      expect(ids[4]).toBe('5'); // May 1 (newest)
    });

    it('sorts after filtering', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(
        items,
        '',
        { contentTypes: ['video'] },
        'title-asc'
      );

      expect(result.filteredItems).toHaveLength(2);
      expect(result.filteredItems[0].title).toBe('Air Conditioner');
      expect(result.filteredItems[1].title).toBe('Coffee Machine');
    });
  });

  // ===========================================================================
  // Computed State Tests
  // ===========================================================================

  describe('computed state values', () => {
    it('computes resultCount correctly', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'kitchen', {}, 'created-desc');

      expect(result.resultCount).toBe(2);
      expect(result.totalCount).toBe(5);
    });

    it('computes hasResults correctly', () => {
      const items = createMockItems();

      // With results
      const withResults = simulateUseItemSearch(items, 'coffee', {}, 'created-desc');
      expect(withResults.hasResults).toBe(true);

      // Without results
      const noResults = simulateUseItemSearch(items, 'nonexistent', {}, 'created-desc');
      expect(noResults.hasResults).toBe(false);
    });

    it('computes isFiltered correctly', () => {
      const items = createMockItems();

      // Not filtered
      const notFiltered = simulateUseItemSearch(items, '', {}, 'created-desc');
      expect(notFiltered.isFiltered).toBe(false);

      // Filtered by search
      const searchFiltered = simulateUseItemSearch(items, 'coffee', {}, 'created-desc');
      expect(searchFiltered.isFiltered).toBe(true);

      // Filtered by filters
      const filterFiltered = simulateUseItemSearch(
        items,
        '',
        { contentTypes: ['video'] },
        'created-desc'
      );
      expect(filterFiltered.isFiltered).toBe(true);
    });
  });

  // ===========================================================================
  // Filter Options Tests
  // ===========================================================================

  describe('filterOptions', () => {
    it('extracts content types from all items', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'created-desc');

      expect(result.filterOptions.contentTypes).toContain('video');
      expect(result.filterOptions.contentTypes).toContain('pdf');
      expect(result.filterOptions.contentTypes).toContain('image');
      expect(result.filterOptions.contentTypes).toContain('text-only');
    });

    it('extracts unique tags from all items', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'created-desc');

      expect(result.filterOptions.tags).toContain('appliance');
      expect(result.filterOptions.tags).toContain('important');
      expect(result.filterOptions.tags).toContain('cleaning');
      expect(result.filterOptions.tags).toContain('safety');
      expect(result.filterOptions.tags).toContain('outdoor');
    });

    it('extracts unique locations from all items', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, '', {}, 'created-desc');

      expect(result.filterOptions.locations).toContain('Kitchen');
      expect(result.filterOptions.locations).toContain('Bathroom');
      expect(result.filterOptions.locations).toContain('Outdoor');
      expect(result.filterOptions.locations).toContain('Living Room');
    });

    it('filter options are based on all items, not filtered items', () => {
      const items = createMockItems();
      const result = simulateUseItemSearch(items, 'coffee', {}, 'created-desc');

      // Even though only 1 item matches, all filter options should be available
      expect(result.filteredItems).toHaveLength(1);
      expect(result.filterOptions.locations.length).toBeGreaterThan(1);
    });
  });
});

// =============================================================================
// Hook Import/Export Verification
// =============================================================================

describe('useItemSearch hook exports', () => {
  it('hook module exports useItemSearch function', async () => {
    // Dynamic import to verify the hook file is valid
    const module = await import('../useItemSearch');

    expect(module.useItemSearch).toBeDefined();
    expect(typeof module.useItemSearch).toBe('function');
  });

  it('hook module has default export', async () => {
    const module = await import('../useItemSearch');

    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('function');
    expect(module.default).toBe(module.useItemSearch);
  });
});
