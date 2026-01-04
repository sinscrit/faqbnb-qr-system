/**
 * Sort comparator functions for ItemManager.
 * All comparators are pure functions that handle null/undefined values gracefully.
 *
 * @module ItemManager/utils/sortUtils
 * @lastModified 2026-01-04 (REQ-067 - Added missing sort utility functions)
 */

import type { ItemRecord } from '@/components/ItemCapture';
import type { SortOption, ItemRecordExtended } from '../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Type alias for sort comparator functions.
 */
export type ItemComparator = (a: ItemRecord, b: ItemRecord) => number;

/**
 * Configuration for a sort option with label.
 */
export interface SortOptionConfig {
  /** The sort option value */
  value: SortOption;
  /** Human-readable label for the option */
  label: string;
}

/**
 * Configuration for a content type option.
 */
export interface ContentTypeOption {
  /** The content type value */
  value: string;
  /** Human-readable label for the option */
  label: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default sort option used when none specified.
 */
export const DEFAULT_SORT: SortOption = 'created-desc';

/**
 * All available sort options with their display labels.
 */
export const SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'created-desc', label: 'Newest First' },
  { value: 'created-asc', label: 'Oldest First' },
  { value: 'updated-desc', label: 'Recently Updated' },
  { value: 'updated-asc', label: 'Least Recently Updated' },
  { value: 'location-asc', label: 'Location (A-Z)' },
];

/**
 * Available content type options for filtering.
 */
export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'pdf', label: 'PDF' },
  { value: 'text-only', label: 'Text Only' },
  { value: 'mixed', label: 'Mixed Content' },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Helper to safely get a Date value from a potentially undefined/null date field.
 * Handles both Date objects and ISO string representations.
 *
 * @param value - The date value (Date, string, or undefined/null)
 * @returns Timestamp in milliseconds, or 0 if invalid
 *
 * @example
 * getDateTimestamp(new Date('2024-01-15')); // valid timestamp
 * getDateTimestamp('2024-01-15T00:00:00Z'); // valid timestamp
 * getDateTimestamp(undefined); // 0
 * getDateTimestamp('invalid'); // 0
 */
export function getDateTimestamp(value: Date | string | undefined | null): number {
  if (!value) {
    return 0;
  }
  if (value instanceof Date) {
    const time = value.getTime();
    return isNaN(time) ? 0 : time;
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

// =============================================================================
// Advanced Sort Utilities
// =============================================================================

/**
 * Safely compare two strings with locale comparison.
 * Handles null/undefined by treating them as empty strings.
 *
 * @param a - First string (or undefined/null)
 * @param b - Second string (or undefined/null)
 * @returns Comparison result (-1, 0, or 1)
 */
export function safeLocaleCompare(
  a: string | undefined | null,
  b: string | undefined | null
): number {
  const strA = a ?? '';
  const strB = b ?? '';
  return strA.localeCompare(strB);
}

/**
 * Chain multiple comparators together.
 * Uses the first comparator that returns a non-zero result.
 * Useful for secondary sorting (e.g., sort by location, then by title).
 *
 * @param comparators - Array of comparators to chain
 * @returns A new comparator that applies comparators in order
 *
 * @example
 * const byLocationThenTitle = createChainedComparator(
 *   sortComparators['location-asc'],
 *   sortComparators['title-asc']
 * );
 */
export function createChainedComparator(
  ...comparators: ItemComparator[]
): ItemComparator {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
}

/**
 * Reverse the order of a comparator.
 * Useful for toggling between ascending and descending.
 *
 * @param comparator - The comparator to reverse
 * @returns A new comparator with reversed order
 *
 * @example
 * const titleDesc = reverseSortOrder(sortComparators['title-asc']);
 */
export function reverseSortOrder(comparator: ItemComparator): ItemComparator {
  return (a, b) => -comparator(a, b);
}

/**
 * Create a comparator from a key extraction function.
 * Supports string and number keys with optional descending order.
 *
 * @param keyFn - Function to extract sort key from item
 * @param descending - Whether to sort in descending order (default: false)
 * @returns A comparator function based on the key
 *
 * @example
 * const byTitle = createKeyComparator(item => item.title);
 * const byTitleDesc = createKeyComparator(item => item.title, true);
 */
export function createKeyComparator<T extends string | number>(
  keyFn: (item: ItemRecord) => T | undefined | null,
  descending = false
): ItemComparator {
  return (a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);

    // Handle null/undefined
    if (keyA == null && keyB == null) return 0;
    if (keyA == null) return descending ? -1 : 1;
    if (keyB == null) return descending ? 1 : -1;

    // Compare based on type
    let result: number;
    if (typeof keyA === 'string' && typeof keyB === 'string') {
      result = keyA.localeCompare(keyB);
    } else {
      result = (keyA as number) - (keyB as number);
    }

    return descending ? -result : result;
  };
}

/**
 * Get the display label for a sort option.
 *
 * @param sortBy - The sort option to get label for
 * @returns The display label, or the value if not found
 *
 * @example
 * getSortLabel('title-asc'); // 'Title (A-Z)'
 */
export function getSortLabel(sortBy: SortOption): string {
  const option = SORT_OPTIONS.find((opt) => opt.value === sortBy);
  return option?.label ?? sortBy;
}

/**
 * Type guard to check if a string is a valid SortOption.
 *
 * @param sortBy - The string to check
 * @returns true if sortBy is a valid SortOption
 *
 * @example
 * isValidSortOption('title-asc'); // true
 * isValidSortOption('invalid'); // false
 */
export function isValidSortOption(sortBy: string): sortBy is SortOption {
  return sortBy in sortComparators;
}
