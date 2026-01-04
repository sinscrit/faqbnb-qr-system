/**
 * Unit tests for filterUtils
 *
 * @module ItemManager/utils/__tests__/filterUtils.test
 * @lastModified 2026-01-04 (REQ-067 - Added tests for all filter utility functions)
 */

import { describe, it, expect } from 'vitest';
import {
  matchesSearch,
  matchesFilters,
  hasActiveFilters,
  extractFilterOptions,
  normalizeSearchQuery,
  getSearchableText,
  matchesContentTypes,
  matchesTags,
  matchesLocations,
  matchesPropertyIds,
  deriveContentType,
  countActiveFilters,
  createEmptyFilterState,
  SEARCHABLE_FIELDS,
} from '../filterUtils';
import type { ItemRecord } from '@/components/ItemCapture';
import type { FilterState, ItemRecordExtended } from '../../ItemManager.types';

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

// =============================================================================
// normalizeSearchQuery Tests
// =============================================================================

describe('normalizeSearchQuery', () => {
  it('trims whitespace from query', () => {
    expect(normalizeSearchQuery('  TEST  ')).toBe('test');
  });

  it('converts to lowercase by default', () => {
    expect(normalizeSearchQuery('TEST')).toBe('test');
  });

  it('preserves case when caseSensitive is true', () => {
    expect(normalizeSearchQuery('TEST', true)).toBe('TEST');
  });

  it('trims and converts mixed case', () => {
    expect(normalizeSearchQuery('  TeSt Query  ')).toBe('test query');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeSearchQuery('   ')).toBe('');
  });
});

// =============================================================================
// getSearchableText Tests
// =============================================================================

describe('getSearchableText', () => {
  it('extracts all fields from complete item', () => {
    const item = createMockItem({
      title: 'Coffee Machine',
      location: 'Kitchen',
      tags: ['appliance', 'kitchen'],
      instructions: 'Press the button',
    });

    const texts = getSearchableText(item);
    expect(texts).toContain('Coffee Machine');
    expect(texts).toContain('Kitchen');
    expect(texts).toContain('appliance');
    expect(texts).toContain('kitchen');
    expect(texts).toContain('Press the button');
  });

  it('handles missing optional fields', () => {
    const item = createMockItem({
      title: 'Simple Item',
      location: undefined,
      tags: undefined,
      instructions: undefined,
    });

    const texts = getSearchableText(item);
    expect(texts).toEqual(['Simple Item']);
  });

  it('filters out empty tags', () => {
    const item = createMockItem({
      title: 'Item',
      tags: ['valid', '', 'also-valid'],
    });

    const texts = getSearchableText(item);
    expect(texts).toContain('valid');
    expect(texts).toContain('also-valid');
    expect(texts).not.toContain('');
  });
});

// =============================================================================
// Individual Filter Function Tests
// =============================================================================

describe('matchesContentTypes', () => {
  it('returns true for empty filter array', () => {
    const item = createMockItem({ contentType: 'video' });
    expect(matchesContentTypes(item, [])).toBe(true);
  });

  it('matches when contentType is in array', () => {
    const item = createMockItem({ contentType: 'video' });
    expect(matchesContentTypes(item, ['video', 'image'])).toBe(true);
  });

  it('does not match when contentType is not in array', () => {
    const item = createMockItem({ contentType: 'pdf' });
    expect(matchesContentTypes(item, ['video', 'image'])).toBe(false);
  });
});

describe('matchesTags', () => {
  it('returns true for empty filter array', () => {
    const item = createMockItem({ tags: ['kitchen'] });
    expect(matchesTags(item, [])).toBe(true);
  });

  it('matches when item has all required tags', () => {
    const item = createMockItem({ tags: ['kitchen', 'appliance', 'important'] });
    expect(matchesTags(item, ['kitchen', 'appliance'])).toBe(true);
  });

  it('does not match when item is missing a required tag', () => {
    const item = createMockItem({ tags: ['kitchen'] });
    expect(matchesTags(item, ['kitchen', 'bathroom'])).toBe(false);
  });

  it('does not match when item has no tags', () => {
    const item = createMockItem({ tags: undefined });
    expect(matchesTags(item, ['kitchen'])).toBe(false);
  });
});

describe('matchesLocations', () => {
  it('returns true for empty filter array', () => {
    const item = createMockItem({ location: 'Kitchen' });
    expect(matchesLocations(item, [])).toBe(true);
  });

  it('matches when location is in array', () => {
    const item = createMockItem({ location: 'Kitchen' });
    expect(matchesLocations(item, ['Kitchen', 'Bathroom'])).toBe(true);
  });

  it('does not match when location is not in array', () => {
    const item = createMockItem({ location: 'Bedroom' });
    expect(matchesLocations(item, ['Kitchen', 'Bathroom'])).toBe(false);
  });

  it('does not match when item has no location', () => {
    const item = createMockItem({ location: undefined });
    expect(matchesLocations(item, ['Kitchen'])).toBe(false);
  });
});

describe('matchesPropertyIds', () => {
  it('returns true for empty filter array', () => {
    const item = createMockItem() as ItemRecordExtended;
    item.propertyId = 'prop-123';
    expect(matchesPropertyIds(item, [])).toBe(true);
  });

  it('matches when propertyId is in array', () => {
    const item = createMockItem() as ItemRecordExtended;
    item.propertyId = 'prop-123';
    expect(matchesPropertyIds(item, ['prop-123', 'prop-456'])).toBe(true);
  });

  it('does not match when propertyId is not in array', () => {
    const item = createMockItem() as ItemRecordExtended;
    item.propertyId = 'prop-789';
    expect(matchesPropertyIds(item, ['prop-123', 'prop-456'])).toBe(false);
  });

  it('does not match when item has no propertyId', () => {
    const item = createMockItem() as ItemRecordExtended;
    item.propertyId = undefined;
    expect(matchesPropertyIds(item, ['prop-123'])).toBe(false);
  });
});

// =============================================================================
// Utility Function Tests
// =============================================================================

describe('deriveContentType', () => {
  it('returns item contentType', () => {
    const item = createMockItem({ contentType: 'video' });
    expect(deriveContentType(item)).toBe('video');
  });

  it('works with all content types', () => {
    expect(deriveContentType(createMockItem({ contentType: 'image' }))).toBe('image');
    expect(deriveContentType(createMockItem({ contentType: 'pdf' } as any))).toBe('pdf');
    expect(deriveContentType(createMockItem({ contentType: 'text-only' }))).toBe('text-only');
    expect(deriveContentType(createMockItem({ contentType: 'mixed' }))).toBe('mixed');
  });
});

describe('countActiveFilters', () => {
  it('returns 0 for empty filters', () => {
    expect(countActiveFilters({})).toBe(0);
  });

  it('returns 0 for filters with empty arrays', () => {
    expect(countActiveFilters({ contentTypes: [], tags: [], locations: [] })).toBe(0);
  });

  it('counts each filter category with values', () => {
    expect(countActiveFilters({ tags: ['kitchen'] })).toBe(1);
    expect(countActiveFilters({ tags: ['kitchen'], locations: ['Kitchen'] })).toBe(2);
    expect(countActiveFilters({
      contentTypes: ['video'],
      tags: ['kitchen'],
      locations: ['Kitchen'],
      propertyIds: ['prop-1'],
    })).toBe(4);
  });
});

describe('createEmptyFilterState', () => {
  it('returns object with empty filter arrays', () => {
    const state = createEmptyFilterState();
    expect(state).toEqual({
      contentTypes: [],
      tags: [],
      locations: [],
      propertyIds: [],
    });
  });

  it('returns a new object each time', () => {
    const state1 = createEmptyFilterState();
    const state2 = createEmptyFilterState();
    expect(state1).not.toBe(state2);
  });
});

// =============================================================================
// Constants Tests
// =============================================================================

describe('SEARCHABLE_FIELDS', () => {
  it('contains expected fields', () => {
    expect(SEARCHABLE_FIELDS).toContain('title');
    expect(SEARCHABLE_FIELDS).toContain('location');
    expect(SEARCHABLE_FIELDS).toContain('tags');
    expect(SEARCHABLE_FIELDS).toContain('instructions');
  });

  it('has exactly 4 fields', () => {
    expect(SEARCHABLE_FIELDS).toHaveLength(4);
  });
});
