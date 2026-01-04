/**
 * Unit tests for filterUtils
 *
 * @module ItemManager/utils/__tests__/filterUtils.test
 * @lastModified 2026-01-04 (REQ-062 Task 9)
 */

import { describe, it, expect } from 'vitest';
import {
  matchesSearch,
  matchesFilters,
  hasActiveFilters,
  extractFilterOptions,
} from '../filterUtils';
import type { ItemRecord } from '@/components/ItemCapture';
import type { FilterState } from '../../ItemManager.types';

/**
 * Factory function to create mock items for testing.
 */
const createMockItem = (overrides?: Partial<ItemRecord>): ItemRecord => ({
  id: 'test-id',
  title: 'Test Item',
  contentType: 'video',
  media: [],
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

// =============================================================================
// matchesSearch Tests
// =============================================================================

describe('matchesSearch', () => {
  describe('empty query handling', () => {
    it('returns true for empty query', () => {
      const item = createMockItem({ title: 'Coffee Machine' });
      expect(matchesSearch(item, '')).toBe(true);
    });

    it('returns true for whitespace-only query', () => {
      const item = createMockItem({ title: 'Coffee Machine' });
      expect(matchesSearch(item, '   ')).toBe(true);
    });
  });

  describe('title matching', () => {
    it('matches title containing query', () => {
      const item = createMockItem({ title: 'Coffee Machine Instructions' });
      expect(matchesSearch(item, 'coffee')).toBe(true);
    });

    it('matches partial title', () => {
      const item = createMockItem({ title: 'Coffee Machine Instructions' });
      expect(matchesSearch(item, 'mach')).toBe(true);
    });

    it('does not match when title does not contain query', () => {
      const item = createMockItem({ title: 'Dishwasher Guide' });
      expect(matchesSearch(item, 'coffee')).toBe(false);
    });
  });

  describe('location matching', () => {
    it('matches location containing query', () => {
      const item = createMockItem({
        title: 'Item',
        location: 'Kitchen Counter',
      });
      expect(matchesSearch(item, 'kitchen')).toBe(true);
    });

    it('handles missing location gracefully', () => {
      const item = createMockItem({ title: 'Item', location: undefined });
      expect(matchesSearch(item, 'kitchen')).toBe(false);
    });
  });

  describe('tags matching', () => {
    it('matches any tag containing query', () => {
      const item = createMockItem({
        title: 'Item',
        tags: ['appliance', 'kitchen', 'important'],
      });
      expect(matchesSearch(item, 'appli')).toBe(true);
    });

    it('matches when query is in one of multiple tags', () => {
      const item = createMockItem({
        title: 'Item',
        tags: ['cleaning', 'bathroom', 'weekly'],
      });
      expect(matchesSearch(item, 'bath')).toBe(true);
    });

    it('handles missing tags gracefully', () => {
      const item = createMockItem({ title: 'Item', tags: undefined });
      expect(matchesSearch(item, 'tag')).toBe(false);
    });

    it('handles empty tags array', () => {
      const item = createMockItem({ title: 'Item', tags: [] });
      expect(matchesSearch(item, 'tag')).toBe(false);
    });
  });

  describe('instructions matching', () => {
    it('matches instructions containing query', () => {
      const item = createMockItem({
        title: 'Item',
        instructions: 'Press the button to start brewing',
      });
      expect(matchesSearch(item, 'brewing')).toBe(true);
    });

    it('handles missing instructions gracefully', () => {
      const item = createMockItem({ title: 'Item', instructions: undefined });
      expect(matchesSearch(item, 'brewing')).toBe(false);
    });
  });

  describe('case sensitivity', () => {
    it('is case-insensitive by default', () => {
      const item = createMockItem({ title: 'COFFEE Machine' });
      expect(matchesSearch(item, 'coffee')).toBe(true);
      expect(matchesSearch(item, 'COFFEE')).toBe(true);
      expect(matchesSearch(item, 'Coffee')).toBe(true);
    });

    it('respects case-sensitive option when true', () => {
      const item = createMockItem({ title: 'Coffee Machine' });
      expect(matchesSearch(item, 'Coffee', true)).toBe(true);
      expect(matchesSearch(item, 'coffee', true)).toBe(false);
      expect(matchesSearch(item, 'COFFEE', true)).toBe(false);
    });
  });

  describe('OR logic across fields', () => {
    it('matches when query is found in any field', () => {
      const item = createMockItem({
        title: 'Appliance Guide',
        location: 'Kitchen',
        tags: ['coffee'],
        instructions: 'Use daily',
      });

      // Match title
      expect(matchesSearch(item, 'guide')).toBe(true);
      // Match location
      expect(matchesSearch(item, 'kitchen')).toBe(true);
      // Match tag
      expect(matchesSearch(item, 'coffee')).toBe(true);
      // Match instructions
      expect(matchesSearch(item, 'daily')).toBe(true);
    });
  });
});

// =============================================================================
// matchesFilters Tests
// =============================================================================

describe('matchesFilters', () => {
  describe('empty/no filters', () => {
    it('returns true when filters is empty object', () => {
      const item = createMockItem();
      expect(matchesFilters(item, {})).toBe(true);
    });

    it('returns true when filters has empty arrays', () => {
      const item = createMockItem();
      const filters: FilterState = {
        contentTypes: [],
        tags: [],
        locations: [],
      };
      expect(matchesFilters(item, filters)).toBe(true);
    });
  });

  describe('contentTypes filter', () => {
    it('matches when item contentType is in filter array', () => {
      const item = createMockItem({ contentType: 'video' });
      const filters: FilterState = { contentTypes: ['video', 'image'] };
      expect(matchesFilters(item, filters)).toBe(true);
    });

    it('does not match when item contentType is not in filter array', () => {
      const item = createMockItem({ contentType: 'pdf' });
      const filters: FilterState = { contentTypes: ['video', 'image'] };
      expect(matchesFilters(item, filters)).toBe(false);
    });
  });

  describe('tags filter (AND logic)', () => {
    it('matches when item has ALL required tags', () => {
      const item = createMockItem({
        tags: ['kitchen', 'appliance', 'important'],
      });
      const filters: FilterState = { tags: ['kitchen', 'appliance'] };
      expect(matchesFilters(item, filters)).toBe(true);
    });

    it('does not match when item is missing any required tag', () => {
      const item = createMockItem({ tags: ['kitchen', 'appliance'] });
      const filters: FilterState = { tags: ['kitchen', 'bathroom'] };
      expect(matchesFilters(item, filters)).toBe(false);
    });

    it('handles missing tags on item', () => {
      const item = createMockItem({ tags: undefined });
      const filters: FilterState = { tags: ['kitchen'] };
      expect(matchesFilters(item, filters)).toBe(false);
    });
  });

  describe('locations filter (OR logic)', () => {
    it('matches when item location is in filter array', () => {
      const item = createMockItem({ location: 'Kitchen' });
      const filters: FilterState = { locations: ['Kitchen', 'Bathroom'] };
      expect(matchesFilters(item, filters)).toBe(true);
    });

    it('does not match when item location is not in filter array', () => {
      const item = createMockItem({ location: 'Bedroom' });
      const filters: FilterState = { locations: ['Kitchen', 'Bathroom'] };
      expect(matchesFilters(item, filters)).toBe(false);
    });

    it('handles missing location on item', () => {
      const item = createMockItem({ location: undefined });
      const filters: FilterState = { locations: ['Kitchen'] };
      expect(matchesFilters(item, filters)).toBe(false);
    });
  });

  describe('propertyIds filter', () => {
    it('matches when item propertyId is in filter array', () => {
      const item = createMockItem();
      (item as any).propertyId = 'prop-123';
      const filters: FilterState = { propertyIds: ['prop-123', 'prop-456'] };
      expect(matchesFilters(item, filters)).toBe(true);
    });

    it('does not match when item propertyId is not in filter array', () => {
      const item = createMockItem();
      (item as any).propertyId = 'prop-789';
      const filters: FilterState = { propertyIds: ['prop-123', 'prop-456'] };
      expect(matchesFilters(item, filters)).toBe(false);
    });
  });

  describe('multiple filters (AND between categories)', () => {
    it('matches only when ALL filter categories are satisfied', () => {
      const item = createMockItem({
        contentType: 'video',
        location: 'Kitchen',
        tags: ['appliance', 'important'],
      });

      const matchingFilters: FilterState = {
        contentTypes: ['video'],
        locations: ['Kitchen'],
        tags: ['appliance'],
      };
      expect(matchesFilters(item, matchingFilters)).toBe(true);

      const nonMatchingFilters: FilterState = {
        contentTypes: ['video'],
        locations: ['Bathroom'], // Different location
        tags: ['appliance'],
      };
      expect(matchesFilters(item, nonMatchingFilters)).toBe(false);
    });
  });
});

// =============================================================================
// hasActiveFilters Tests
// =============================================================================

describe('hasActiveFilters', () => {
  it('returns false for empty filters object', () => {
    expect(hasActiveFilters({})).toBe(false);
  });

  it('returns false for filters with all empty arrays', () => {
    const filters: FilterState = {
      contentTypes: [],
      tags: [],
      locations: [],
      propertyIds: [],
    };
    expect(hasActiveFilters(filters)).toBe(false);
  });

  it('returns true when contentTypes has items', () => {
    const filters: FilterState = { contentTypes: ['video'] };
    expect(hasActiveFilters(filters)).toBe(true);
  });

  it('returns true when tags has items', () => {
    const filters: FilterState = { tags: ['kitchen'] };
    expect(hasActiveFilters(filters)).toBe(true);
  });

  it('returns true when locations has items', () => {
    const filters: FilterState = { locations: ['Kitchen'] };
    expect(hasActiveFilters(filters)).toBe(true);
  });

  it('returns true when propertyIds has items', () => {
    const filters: FilterState = { propertyIds: ['prop-123'] };
    expect(hasActiveFilters(filters)).toBe(true);
  });
});

// =============================================================================
// extractFilterOptions Tests
// =============================================================================

describe('extractFilterOptions', () => {
  it('extracts unique content types from items', () => {
    const items = [
      createMockItem({ contentType: 'video' }),
      createMockItem({ contentType: 'image' }),
      createMockItem({ contentType: 'video' }), // duplicate
      createMockItem({ contentType: 'pdf' }),
    ];

    const options = extractFilterOptions(items);
    expect(options.contentTypes).toEqual(['image', 'pdf', 'video']); // sorted
  });

  it('extracts unique tags from all items', () => {
    const items = [
      createMockItem({ tags: ['kitchen', 'appliance'] }),
      createMockItem({ tags: ['bathroom', 'appliance'] }), // 'appliance' is duplicate
      createMockItem({ tags: ['outdoor'] }),
    ];

    const options = extractFilterOptions(items);
    expect(options.tags).toEqual(['appliance', 'bathroom', 'kitchen', 'outdoor']); // sorted
  });

  it('extracts unique locations from items', () => {
    const items = [
      createMockItem({ location: 'Kitchen' }),
      createMockItem({ location: 'Bathroom' }),
      createMockItem({ location: 'Kitchen' }), // duplicate
    ];

    const options = extractFilterOptions(items);
    expect(options.locations).toEqual(['Bathroom', 'Kitchen']); // sorted
  });

  it('handles items with missing optional fields', () => {
    const items = [
      createMockItem({ tags: undefined, location: undefined }),
      createMockItem({ tags: ['kitchen'], location: 'Kitchen' }),
    ];

    const options = extractFilterOptions(items);
    expect(options.tags).toEqual(['kitchen']);
    expect(options.locations).toEqual(['Kitchen']);
  });

  it('handles empty items array', () => {
    const options = extractFilterOptions([]);
    expect(options.contentTypes).toEqual([]);
    expect(options.tags).toEqual([]);
    expect(options.locations).toEqual([]);
  });

  it('sorts values alphabetically', () => {
    const items = [
      createMockItem({ location: 'Zulu Room' }),
      createMockItem({ location: 'Alpha Room' }),
      createMockItem({ location: 'Mike Room' }),
    ];

    const options = extractFilterOptions(items);
    expect(options.locations).toEqual(['Alpha Room', 'Mike Room', 'Zulu Room']);
  });

  it('filters out empty/falsy tag values', () => {
    const items = [createMockItem({ tags: ['kitchen', '', 'bathroom'] })];

    const options = extractFilterOptions(items);
    expect(options.tags).toEqual(['bathroom', 'kitchen']);
    expect(options.tags).not.toContain('');
  });
});
