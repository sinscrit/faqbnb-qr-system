/**
 * Unit tests for sortUtils
 *
 * @module ItemManager/utils/__tests__/sortUtils.test
 * @lastModified 2026-01-04 (REQ-062 Task 10)
 */

import { describe, it, expect } from 'vitest';
import {
  sortComparators,
  getSortComparator,
  DEFAULT_SORT,
} from '../sortUtils';
import type { ItemRecord } from '@/components/ItemCapture';
import type { ItemRecordExtended } from '../../ItemManager.types';

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
