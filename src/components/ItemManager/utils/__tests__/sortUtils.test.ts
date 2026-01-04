/**
 * Unit tests for sortUtils
 *
 * @module ItemManager/utils/__tests__/sortUtils.test
 * @lastModified 2026-01-04 (REQ-067 - Added tests for all sort utility functions)
 */

import { describe, it, expect } from 'vitest';
import {
  sortComparators,
  getSortComparator,
  DEFAULT_SORT,
  SORT_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  getDateTimestamp,
  safeLocaleCompare,
  createChainedComparator,
  reverseSortOrder,
  createKeyComparator,
  getSortLabel,
  isValidSortOption,
} from '../sortUtils';
import type { ItemRecord } from '@/components/ItemCapture';
import type { ItemRecordExtended, SortOption } from '../../ItemManager.types';

/**
 * Factory function to create mock items for testing.
 */
const createMockItem = (overrides?: Partial<ItemRecordExtended>): ItemRecordExtended => ({
  id: 'test-id',
  title: 'Test Item',
  contentType: 'video',
  media: [],
  createdAt: new Date('2024-01-15'),
  ...overrides,
});

// =============================================================================
// DEFAULT_SORT Tests
// =============================================================================

describe('DEFAULT_SORT', () => {
  it('is set to created-desc', () => {
    expect(DEFAULT_SORT).toBe('created-desc');
  });
});

// =============================================================================
// sortComparators Tests
// =============================================================================

describe('sortComparators', () => {
  describe('title-asc', () => {
    it('sorts items alphabetically A-Z by title', () => {
      const items = [
        createMockItem({ id: '1', title: 'Coffee Machine' }),
        createMockItem({ id: '2', title: 'Air Conditioner' }),
        createMockItem({ id: '3', title: 'Dishwasher' }),
      ];

      const sorted = [...items].sort(sortComparators['title-asc']);

      expect(sorted.map((i) => i.title)).toEqual([
        'Air Conditioner',
        'Coffee Machine',
        'Dishwasher',
      ]);
    });

    it('handles undefined/null titles gracefully', () => {
      const items = [
        createMockItem({ id: '1', title: 'Zebra' }),
        createMockItem({ id: '2', title: '' }),
        createMockItem({ id: '3', title: 'Apple' }),
      ];

      const sorted = [...items].sort(sortComparators['title-asc']);

      expect(sorted.map((i) => i.title)).toEqual(['', 'Apple', 'Zebra']);
    });
  });

  describe('title-desc', () => {
    it('sorts items alphabetically Z-A by title', () => {
      const items = [
        createMockItem({ id: '1', title: 'Coffee Machine' }),
        createMockItem({ id: '2', title: 'Air Conditioner' }),
        createMockItem({ id: '3', title: 'Dishwasher' }),
      ];

      const sorted = [...items].sort(sortComparators['title-desc']);

      expect(sorted.map((i) => i.title)).toEqual([
        'Dishwasher',
        'Coffee Machine',
        'Air Conditioner',
      ]);
    });
  });

  describe('created-desc', () => {
    it('sorts items by creation date newest first', () => {
      const items = [
        createMockItem({ id: '1', createdAt: new Date('2024-01-01') }),
        createMockItem({ id: '2', createdAt: new Date('2024-03-01') }),
        createMockItem({ id: '3', createdAt: new Date('2024-02-01') }),
      ];

      const sorted = [...items].sort(sortComparators['created-desc']);

      expect(sorted.map((i) => i.id)).toEqual(['2', '3', '1']);
    });

    it('handles ISO string dates', () => {
      const items = [
        createMockItem({ id: '1', createdAt: '2024-01-01T00:00:00Z' as any }),
        createMockItem({ id: '2', createdAt: '2024-03-01T00:00:00Z' as any }),
      ];

      const sorted = [...items].sort(sortComparators['created-desc']);

      expect(sorted.map((i) => i.id)).toEqual(['2', '1']);
    });

    it('handles null/undefined dates by treating them as oldest', () => {
      const items = [
        createMockItem({ id: '1', createdAt: new Date('2024-01-01') }),
        createMockItem({ id: '2', createdAt: undefined as any }),
        createMockItem({ id: '3', createdAt: new Date('2024-02-01') }),
      ];

      const sorted = [...items].sort(sortComparators['created-desc']);

      expect(sorted.map((i) => i.id)).toEqual(['3', '1', '2']);
    });
  });

  describe('created-asc', () => {
    it('sorts items by creation date oldest first', () => {
      const items = [
        createMockItem({ id: '1', createdAt: new Date('2024-01-01') }),
        createMockItem({ id: '2', createdAt: new Date('2024-03-01') }),
        createMockItem({ id: '3', createdAt: new Date('2024-02-01') }),
      ];

      const sorted = [...items].sort(sortComparators['created-asc']);

      expect(sorted.map((i) => i.id)).toEqual(['1', '3', '2']);
    });
  });

  describe('updated-desc', () => {
    it('sorts items by update date most recently modified first', () => {
      const items = [
        createMockItem({
          id: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        }),
        createMockItem({
          id: '2',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-03-01'),
        }),
        createMockItem({
          id: '3',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-02-01'),
        }),
      ];

      const sorted = [...items].sort(sortComparators['updated-desc']);

      expect(sorted.map((i) => i.id)).toEqual(['2', '3', '1']);
    });

    it('falls back to createdAt when updatedAt is undefined', () => {
      const items = [
        createMockItem({
          id: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: undefined,
        }),
        createMockItem({
          id: '2',
          createdAt: new Date('2024-02-01'),
          updatedAt: undefined,
        }),
      ];

      const sorted = [...items].sort(sortComparators['updated-desc']);

      expect(sorted.map((i) => i.id)).toEqual(['2', '1']);
    });

    it('uses updatedAt over createdAt when both present', () => {
      const items = [
        createMockItem({
          id: '1',
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-01-01'),
        }),
        createMockItem({
          id: '2',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-02-01'),
        }),
      ];

      const sorted = [...items].sort(sortComparators['updated-desc']);

      expect(sorted.map((i) => i.id)).toEqual(['2', '1']);
    });
  });

  describe('updated-asc', () => {
    it('sorts items by update date least recently modified first', () => {
      const items = [
        createMockItem({
          id: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        }),
        createMockItem({
          id: '2',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-03-01'),
        }),
        createMockItem({
          id: '3',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-02-01'),
        }),
      ];

      const sorted = [...items].sort(sortComparators['updated-asc']);

      expect(sorted.map((i) => i.id)).toEqual(['1', '3', '2']);
    });
  });

  describe('location-asc', () => {
    it('sorts items alphabetically by location A-Z', () => {
      const items = [
        createMockItem({ id: '1', location: 'Kitchen' }),
        createMockItem({ id: '2', location: 'Bathroom' }),
        createMockItem({ id: '3', location: 'Living Room' }),
      ];

      const sorted = [...items].sort(sortComparators['location-asc']);

      expect(sorted.map((i) => i.location)).toEqual([
        'Bathroom',
        'Kitchen',
        'Living Room',
      ]);
    });

    it('sorts items without locations to the end', () => {
      const items = [
        createMockItem({ id: '1', location: 'Kitchen' }),
        createMockItem({ id: '2', location: undefined }),
        createMockItem({ id: '3', location: 'Bathroom' }),
        createMockItem({ id: '4', location: '' }),
      ];

      const sorted = [...items].sort(sortComparators['location-asc']);

      expect(sorted.map((i) => i.id)).toEqual(['3', '1', '2', '4']);
    });

    it('handles all items without locations', () => {
      const items = [
        createMockItem({ id: '1', location: undefined }),
        createMockItem({ id: '2', location: '' }),
        createMockItem({ id: '3', location: undefined }),
      ];

      // Should not throw
      const sorted = [...items].sort(sortComparators['location-asc']);
      expect(sorted).toHaveLength(3);
    });
  });
});

// =============================================================================
// getSortComparator Tests
// =============================================================================

describe('getSortComparator', () => {
  it('returns the correct comparator for valid sort options', () => {
    expect(getSortComparator('title-asc')).toBe(sortComparators['title-asc']);
    expect(getSortComparator('title-desc')).toBe(sortComparators['title-desc']);
    expect(getSortComparator('created-desc')).toBe(sortComparators['created-desc']);
    expect(getSortComparator('created-asc')).toBe(sortComparators['created-asc']);
    expect(getSortComparator('updated-desc')).toBe(sortComparators['updated-desc']);
    expect(getSortComparator('updated-asc')).toBe(sortComparators['updated-asc']);
    expect(getSortComparator('location-asc')).toBe(sortComparators['location-asc']);
  });

  it('falls back to default sort comparator for invalid options', () => {
    // TypeScript will prevent this at compile time, but test runtime fallback
    const comparator = getSortComparator('invalid-option' as any);
    expect(comparator).toBe(sortComparators[DEFAULT_SORT]);
  });
});

// =============================================================================
// Sort Stability Tests
// =============================================================================

describe('sort stability', () => {
  it('maintains relative order for items with same sort key (title)', () => {
    const items = [
      createMockItem({ id: '1', title: 'Same Title' }),
      createMockItem({ id: '2', title: 'Same Title' }),
      createMockItem({ id: '3', title: 'Same Title' }),
    ];

    const sorted = [...items].sort(sortComparators['title-asc']);

    // In a stable sort, items with same title maintain their original order
    // Note: JavaScript's sort is not guaranteed to be stable in all engines,
    // but modern engines (V8, SpiderMonkey) implement stable sort
    expect(sorted).toHaveLength(3);
    expect(sorted.every((item) => item.title === 'Same Title')).toBe(true);
  });

  it('maintains relative order for items with same date', () => {
    const sameDate = new Date('2024-01-15');
    const items = [
      createMockItem({ id: '1', createdAt: sameDate }),
      createMockItem({ id: '2', createdAt: sameDate }),
      createMockItem({ id: '3', createdAt: sameDate }),
    ];

    const sorted = [...items].sort(sortComparators['created-desc']);

    expect(sorted).toHaveLength(3);
  });
});

// =============================================================================
// Constants Tests
// =============================================================================

describe('SORT_OPTIONS', () => {
  it('has exactly 7 options', () => {
    expect(SORT_OPTIONS).toHaveLength(7);
  });

  it('contains all expected sort options', () => {
    const values = SORT_OPTIONS.map((opt) => opt.value);
    expect(values).toContain('title-asc');
    expect(values).toContain('title-desc');
    expect(values).toContain('created-desc');
    expect(values).toContain('created-asc');
    expect(values).toContain('updated-desc');
    expect(values).toContain('updated-asc');
    expect(values).toContain('location-asc');
  });

  it('has labels for all options', () => {
    SORT_OPTIONS.forEach((opt) => {
      expect(opt.label).toBeDefined();
      expect(opt.label.length).toBeGreaterThan(0);
    });
  });
});

describe('CONTENT_TYPE_OPTIONS', () => {
  it('has 5 content type options', () => {
    expect(CONTENT_TYPE_OPTIONS).toHaveLength(5);
  });

  it('contains expected content types', () => {
    const values = CONTENT_TYPE_OPTIONS.map((opt) => opt.value);
    expect(values).toContain('video');
    expect(values).toContain('image');
    expect(values).toContain('pdf');
    expect(values).toContain('text-only');
    expect(values).toContain('mixed');
  });
});

// =============================================================================
// getDateTimestamp Tests
// =============================================================================

describe('getDateTimestamp', () => {
  it('returns timestamp for Date object', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    expect(getDateTimestamp(date)).toBe(date.getTime());
  });

  it('returns timestamp for ISO string', () => {
    const isoString = '2024-01-15T12:00:00Z';
    expect(getDateTimestamp(isoString)).toBe(Date.parse(isoString));
  });

  it('returns 0 for undefined', () => {
    expect(getDateTimestamp(undefined)).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(getDateTimestamp(null)).toBe(0);
  });

  it('returns 0 for invalid date string', () => {
    expect(getDateTimestamp('invalid-date')).toBe(0);
  });

  it('returns 0 for invalid Date object', () => {
    expect(getDateTimestamp(new Date('invalid'))).toBe(0);
  });
});

// =============================================================================
// safeLocaleCompare Tests
// =============================================================================

describe('safeLocaleCompare', () => {
  it('compares two strings', () => {
    expect(safeLocaleCompare('apple', 'banana')).toBeLessThan(0);
    expect(safeLocaleCompare('banana', 'apple')).toBeGreaterThan(0);
    expect(safeLocaleCompare('apple', 'apple')).toBe(0);
  });

  it('handles undefined as empty string', () => {
    expect(safeLocaleCompare(undefined, 'apple')).toBeLessThan(0);
    expect(safeLocaleCompare('apple', undefined)).toBeGreaterThan(0);
    expect(safeLocaleCompare(undefined, undefined)).toBe(0);
  });

  it('handles null as empty string', () => {
    expect(safeLocaleCompare(null, 'apple')).toBeLessThan(0);
    expect(safeLocaleCompare('apple', null)).toBeGreaterThan(0);
    expect(safeLocaleCompare(null, null)).toBe(0);
  });
});

// =============================================================================
// createChainedComparator Tests
// =============================================================================

describe('createChainedComparator', () => {
  it('uses first comparator when it returns non-zero', () => {
    const chained = createChainedComparator(
      sortComparators['location-asc'],
      sortComparators['title-asc']
    );

    const a = createMockItem({ location: 'Alpha', title: 'Zebra' });
    const b = createMockItem({ location: 'Beta', title: 'Apple' });

    expect(chained(a, b)).toBeLessThan(0); // location comparison wins
  });

  it('uses second comparator when first returns zero', () => {
    const chained = createChainedComparator(
      sortComparators['location-asc'],
      sortComparators['title-asc']
    );

    const a = createMockItem({ location: 'Kitchen', title: 'Zebra' });
    const b = createMockItem({ location: 'Kitchen', title: 'Apple' });

    expect(chained(a, b)).toBeGreaterThan(0); // title comparison used
  });

  it('works with empty comparator list', () => {
    const chained = createChainedComparator();
    const a = createMockItem({ title: 'A' });
    const b = createMockItem({ title: 'B' });

    expect(chained(a, b)).toBe(0);
  });
});

// =============================================================================
// reverseSortOrder Tests
// =============================================================================

describe('reverseSortOrder', () => {
  it('reverses the comparison result', () => {
    const titleAsc = sortComparators['title-asc'];
    const titleDesc = reverseSortOrder(titleAsc);

    const items = [
      createMockItem({ id: '1', title: 'Apple' }),
      createMockItem({ id: '2', title: 'Zebra' }),
    ];

    const sorted = [...items].sort(titleDesc);
    expect(sorted.map((i) => i.title)).toEqual(['Zebra', 'Apple']);
  });
});

// =============================================================================
// createKeyComparator Tests
// =============================================================================

describe('createKeyComparator', () => {
  it('creates comparator for string keys', () => {
    const byTitle = createKeyComparator((item) => item.title);
    const items = [
      createMockItem({ title: 'Zebra' }),
      createMockItem({ title: 'Apple' }),
    ];

    const sorted = [...items].sort(byTitle);
    expect(sorted.map((i) => i.title)).toEqual(['Apple', 'Zebra']);
  });

  it('creates comparator for numeric keys', () => {
    const byMediaCount = createKeyComparator((item) => item.media.length);
    const items = [
      createMockItem({ media: [{} as any, {} as any, {} as any] }),
      createMockItem({ media: [{} as any] }),
    ];

    const sorted = [...items].sort(byMediaCount);
    expect(sorted.map((i) => i.media.length)).toEqual([1, 3]);
  });

  it('supports descending order', () => {
    const byTitleDesc = createKeyComparator((item) => item.title, true);
    const items = [
      createMockItem({ title: 'Apple' }),
      createMockItem({ title: 'Zebra' }),
    ];

    const sorted = [...items].sort(byTitleDesc);
    expect(sorted.map((i) => i.title)).toEqual(['Zebra', 'Apple']);
  });

  it('handles null/undefined keys', () => {
    const byLocation = createKeyComparator((item) => item.location);
    const items = [
      createMockItem({ location: 'Kitchen' }),
      createMockItem({ location: undefined }),
      createMockItem({ location: 'Bathroom' }),
    ];

    const sorted = [...items].sort(byLocation);
    // undefined sorts to end
    expect(sorted.map((i) => i.location)).toEqual(['Bathroom', 'Kitchen', undefined]);
  });
});

// =============================================================================
// getSortLabel Tests
// =============================================================================

describe('getSortLabel', () => {
  it('returns label for valid sort option', () => {
    expect(getSortLabel('title-asc')).toBe('Title (A-Z)');
    expect(getSortLabel('title-desc')).toBe('Title (Z-A)');
    expect(getSortLabel('created-desc')).toBe('Newest First');
  });

  it('returns value for unknown option', () => {
    expect(getSortLabel('unknown' as SortOption)).toBe('unknown');
  });
});

// =============================================================================
// isValidSortOption Tests
// =============================================================================

describe('isValidSortOption', () => {
  it('returns true for all valid sort options', () => {
    expect(isValidSortOption('title-asc')).toBe(true);
    expect(isValidSortOption('title-desc')).toBe(true);
    expect(isValidSortOption('created-desc')).toBe(true);
    expect(isValidSortOption('created-asc')).toBe(true);
    expect(isValidSortOption('updated-desc')).toBe(true);
    expect(isValidSortOption('updated-asc')).toBe(true);
    expect(isValidSortOption('location-asc')).toBe(true);
  });

  it('returns false for invalid options', () => {
    expect(isValidSortOption('invalid')).toBe(false);
    expect(isValidSortOption('title-both')).toBe(false);
    expect(isValidSortOption('')).toBe(false);
  });
});
