/**
 * Sort comparator functions for ItemManager.
 * All comparators are pure functions that handle null/undefined values gracefully.
 *
 * @module ItemManager/utils/sortUtils
 * @lastModified 2026-01-04 (REQ-062 Task 4)
 */

import type { ItemRecord } from '@/components/ItemCapture';
import type { SortOption, ItemRecordExtended } from '../ItemManager.types';

/**
 * Type alias for sort comparator functions.
 */
type ItemComparator = (a: ItemRecord, b: ItemRecord) => number;

/**
 * Default sort option used when none specified.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';

/**
 * Helper to safely get a Date value from a potentially undefined/null date field.
 * Handles both Date objects and ISO string representations.
 *
 * @param value - The date value (Date, string, or undefined/null)
 * @returns Timestamp in milliseconds, or 0 if invalid
 */
function getDateTimestamp(value: Date | string | undefined | null): number {
  if (!value) {
    return 0;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Sort comparators for all supported sort options.
 * Each comparator handles null/undefined values gracefully.
 */
export const sortComparators: Record<SortOption, ItemComparator> = {
  /**
   * Sort by title A-Z (alphabetical ascending)
   */
  'title-asc': (a, b) => {
    const titleA = a.title ?? '';
    const titleB = b.title ?? '';
    return titleA.localeCompare(titleB);
  },

  /**
   * Sort by title Z-A (alphabetical descending)
   */
  'title-desc': (a, b) => {
    const titleA = a.title ?? '';
    const titleB = b.title ?? '';
    return titleB.localeCompare(titleA);
  },

  /**
   * Sort by creation date newest first (descending)
   */
  'created-desc': (a, b) => {
    const timestampA = getDateTimestamp(a.createdAt);
    const timestampB = getDateTimestamp(b.createdAt);
    return timestampB - timestampA;
  },

  /**
   * Sort by creation date oldest first (ascending)
   */
  'created-asc': (a, b) => {
    const timestampA = getDateTimestamp(a.createdAt);
    const timestampB = getDateTimestamp(b.createdAt);
    return timestampA - timestampB;
  },

  /**
   * Sort by update date most recently modified first (descending)
   * Falls back to createdAt if updatedAt is not available.
   */
  'updated-desc': (a, b) => {
    const extendedA = a as ItemRecordExtended;
    const extendedB = b as ItemRecordExtended;
    const timestampA = getDateTimestamp(extendedA.updatedAt) || getDateTimestamp(a.createdAt);
    const timestampB = getDateTimestamp(extendedB.updatedAt) || getDateTimestamp(b.createdAt);
    return timestampB - timestampA;
  },

  /**
   * Sort by update date least recently modified first (ascending)
   * Falls back to createdAt if updatedAt is not available.
   */
  'updated-asc': (a, b) => {
    const extendedA = a as ItemRecordExtended;
    const extendedB = b as ItemRecordExtended;
    const timestampA = getDateTimestamp(extendedA.updatedAt) || getDateTimestamp(a.createdAt);
    const timestampB = getDateTimestamp(extendedB.updatedAt) || getDateTimestamp(b.createdAt);
    return timestampA - timestampB;
  },

  /**
   * Sort by location A-Z (alphabetical ascending)
   * Items without locations are sorted to the end.
   */
  'location-asc': (a, b) => {
    const locationA = a.location ?? '';
    const locationB = b.location ?? '';

    // Handle empty locations - sort them to the end
    if (!locationA && !locationB) return 0;
    if (!locationA) return 1;
    if (!locationB) return -1;

    return locationA.localeCompare(locationB);
  },
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
