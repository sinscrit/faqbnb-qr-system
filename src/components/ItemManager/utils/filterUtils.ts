/**
 * Filter utilities for ItemManager search and filter operations.
 * All functions are pure and side-effect free.
 *
 * @module ItemManager/utils/filterUtils
 * @lastModified 2026-01-04 (REQ-062 Task 1)
 */

import type { ItemRecord } from '@/components/ItemCapture';
import type { FilterState, ItemRecordExtended } from '../ItemManager.types';

/**
 * Check if an item matches the search query.
 * Searches across: title, location, tags, instructions.
 * Uses OR logic - item matches if query found in ANY field.
 *
 * @param item - The item to check
 * @param query - The search query string
 * @param caseSensitive - Whether to perform case-sensitive matching (default: false)
 * @returns true if item matches query or query is empty
 *
 * @example
 * matchesSearch(item, 'coffee'); // true if 'coffee' in title, location, tags, or instructions
 * matchesSearch(item, ''); // true (empty query matches all)
 */
export function matchesSearch(
  item: ItemRecord,
  query: string,
  caseSensitive = false
): boolean {
  // Empty or whitespace-only query matches all items
  const trimmedQuery = query.trim();
  if (trimmedQuery === '') {
    return true;
  }

  // Normalize query based on case sensitivity
  const normalizedQuery = caseSensitive ? trimmedQuery : trimmedQuery.toLowerCase();

  // Helper to normalize text for comparison
  const normalize = (text: string | undefined | null): string => {
    if (!text) return '';
    return caseSensitive ? text : text.toLowerCase();
  };

  // Check title
  if (normalize(item.title).includes(normalizedQuery)) {
    return true;
  }

  // Check location (optional field)
  if (item.location && normalize(item.location).includes(normalizedQuery)) {
    return true;
  }

  // Check tags (optional field) - match any tag containing the query
  if (item.tags && Array.isArray(item.tags)) {
    for (const tag of item.tags) {
      if (normalize(tag).includes(normalizedQuery)) {
        return true;
      }
    }
  }

  // Check instructions (optional field)
  if (item.instructions && normalize(item.instructions).includes(normalizedQuery)) {
    return true;
  }

  return false;
}

/**
 * Check if an item matches all active filters.
 * Uses AND logic between filter categories: item must satisfy ALL active filters.
 *
 * Filter category logic:
 * - contentTypes: item.contentType must be in the array (OR within category)
 * - tags: item must have ALL specified tags (AND within category)
 * - locations: item.location must be in the array (OR within category)
 * - propertyIds: item.propertyId must be in the array (OR within category)
 *
 * @param item - The item to check
 * @param filters - The active filter state
 * @returns true if item matches all active filters or no filters are active
 */
export function matchesFilters(item: ItemRecord, filters: FilterState): boolean {
  // If no filters object or all filter arrays are empty/undefined, match all
  if (!filters) {
    return true;
  }

  // Check contentTypes filter (OR logic within category)
  if (filters.contentTypes && filters.contentTypes.length > 0) {
    const itemContentType = item.contentType;
    if (!filters.contentTypes.includes(itemContentType as typeof filters.contentTypes[number])) {
      return false;
    }
  }

  // Check tags filter (AND logic within category - item must have ALL specified tags)
  if (filters.tags && filters.tags.length > 0) {
    const itemTags = item.tags ?? [];
    for (const requiredTag of filters.tags) {
      if (!itemTags.includes(requiredTag)) {
        return false;
      }
    }
  }

  // Check locations filter (OR logic within category)
  if (filters.locations && filters.locations.length > 0) {
    const itemLocation = item.location ?? '';
    if (!filters.locations.includes(itemLocation)) {
      return false;
    }
  }

  // Check propertyIds filter (OR logic within category) - for extended items
  if (filters.propertyIds && filters.propertyIds.length > 0) {
    const extendedItem = item as ItemRecordExtended;
    const itemPropertyId = extendedItem.propertyId ?? '';
    if (!filters.propertyIds.includes(itemPropertyId)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if any filters are currently active.
 * Used to optimize rendering by skipping filter logic when no filters are set.
 *
 * @param filters - The filter state to check
 * @returns true if any filter category has active values
 */
export function hasActiveFilters(filters: FilterState): boolean {
  if (!filters) {
    return false;
  }

  // Check if any filter array has items
  if (filters.contentTypes && filters.contentTypes.length > 0) {
    return true;
  }
  if (filters.tags && filters.tags.length > 0) {
    return true;
  }
  if (filters.locations && filters.locations.length > 0) {
    return true;
  }
  if (filters.propertyIds && filters.propertyIds.length > 0) {
    return true;
  }

  return false;
}

/**
 * Extract unique filter option values from a collection of items.
 * Used to populate filter dropdowns/chips with available options.
 *
 * @param items - Array of items to extract options from
 * @returns Object containing sorted arrays of unique values for each filter category
 */
export function extractFilterOptions(items: ItemRecord[]): {
  contentTypes: string[];
  tags: string[];
  locations: string[];
} {
  const contentTypesSet = new Set<string>();
  const tagsSet = new Set<string>();
  const locationsSet = new Set<string>();

  for (const item of items) {
    // Collect content types
    if (item.contentType) {
      contentTypesSet.add(item.contentType);
    }

    // Collect tags
    if (item.tags && Array.isArray(item.tags)) {
      for (const tag of item.tags) {
        if (tag) {
          tagsSet.add(tag);
        }
      }
    }

    // Collect locations
    if (item.location) {
      locationsSet.add(item.location);
    }
  }

  // Convert to sorted arrays
  return {
    contentTypes: Array.from(contentTypesSet).sort((a, b) => a.localeCompare(b)),
    tags: Array.from(tagsSet).sort((a, b) => a.localeCompare(b)),
    locations: Array.from(locationsSet).sort((a, b) => a.localeCompare(b)),
  };
}
