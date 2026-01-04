/**
 * Filter utilities for ItemManager search and filter operations.
 * All functions are pure and side-effect free.
 *
 * @module ItemManager/utils/filterUtils
 * @lastModified 2026-01-04 (REQ-067 - Added missing filter utility functions)
 */

import type { ItemRecord } from '@/components/ItemCapture';
import type { FilterState, ItemRecordExtended } from '../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Available filter options extracted from item collections.
 * Used to populate filter dropdowns/chips with available options.
 */
export interface FilterOptions {
  /** Unique content types from all items */
  contentTypes: string[];
  /** Unique tags from all items */
  tags: string[];
  /** Unique locations from all items */
  locations: string[];
}

/**
 * Content type categories for item classification.
 * Mirrors ItemRecord.contentType for type safety.
 */
export type ContentType = 'video' | 'image' | 'pdf' | 'text-only' | 'mixed' | 'media' | 'pdf-only';

// =============================================================================
// Constants
// =============================================================================

/**
 * Fields that are searched when matching items against a search query.
 * Used by getSearchableText to extract text from items.
 */
export const SEARCHABLE_FIELDS = ['title', 'location', 'tags', 'instructions'] as const;

// =============================================================================
// Search Functions
// =============================================================================

/**
 * Normalize a search query for matching.
 * Trims whitespace and optionally converts to lowercase.
 *
 * @param query - The search query string to normalize
 * @param caseSensitive - Whether to preserve case (default: false)
 * @returns Normalized query string
 *
 * @example
 * normalizeSearchQuery("  TEST  ", false); // returns "test"
 * normalizeSearchQuery("TEST", true); // returns "TEST"
 */
export function normalizeSearchQuery(query: string, caseSensitive = false): string {
  const trimmed = query.trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

/**
 * Extract all searchable text from an item as an array.
 * Used for advanced search scenarios.
 *
 * @param item - The item to extract text from
 * @returns Array of searchable text strings
 *
 * @example
 * getSearchableText(item); // ['Coffee Machine', 'Kitchen', 'appliance', 'Press the button...']
 */
export function getSearchableText(item: ItemRecord): string[] {
  const texts: string[] = [];

  // Add title (always present)
  if (item.title) {
    texts.push(item.title);
  }

  // Add location (optional)
  if (item.location) {
    texts.push(item.location);
  }

  // Add tags (optional array)
  if (item.tags && Array.isArray(item.tags)) {
    texts.push(...item.tags.filter((tag) => !!tag));
  }

  // Add instructions (optional)
  if (item.instructions) {
    texts.push(item.instructions);
  }

  return texts;
}

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

// =============================================================================
// Individual Filter Functions
// =============================================================================

/**
 * Check if an item matches the content types filter.
 * Uses OR logic - item matches if its contentType is in the array.
 *
 * @param item - The item to check
 * @param contentTypes - Array of content types to match against
 * @returns true if item matches any content type or array is empty
 *
 * @example
 * matchesContentTypes(item, ['video', 'image']); // true if item.contentType is 'video' or 'image'
 * matchesContentTypes(item, []); // true (empty filter matches all)
 */
export function matchesContentTypes(item: ItemRecord, contentTypes: string[]): boolean {
  // Empty filter matches all items
  if (!contentTypes || contentTypes.length === 0) {
    return true;
  }

  // Check if item's contentType is in the filter array
  return contentTypes.includes(item.contentType);
}

/**
 * Check if an item matches the tags filter.
 * Uses AND logic - item must have ALL specified tags.
 *
 * @param item - The item to check
 * @param tags - Array of tags the item must have
 * @returns true if item has all specified tags or array is empty
 *
 * @example
 * matchesTags(item, ['kitchen', 'appliance']); // true only if item has BOTH tags
 * matchesTags(item, []); // true (empty filter matches all)
 */
export function matchesTags(item: ItemRecord, tags: string[]): boolean {
  // Empty filter matches all items
  if (!tags || tags.length === 0) {
    return true;
  }

  // No tags on item means it can't match any required tags
  if (!item.tags || !Array.isArray(item.tags)) {
    return false;
  }

  // Item must have ALL specified tags (AND logic)
  for (const requiredTag of tags) {
    if (!item.tags.includes(requiredTag)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an item matches the locations filter.
 * Uses OR logic - item matches if its location is in the array.
 *
 * @param item - The item to check
 * @param locations - Array of locations to match against
 * @returns true if item matches any location or array is empty
 *
 * @example
 * matchesLocations(item, ['Kitchen', 'Bathroom']); // true if item.location is 'Kitchen' or 'Bathroom'
 * matchesLocations(item, []); // true (empty filter matches all)
 */
export function matchesLocations(item: ItemRecord, locations: string[]): boolean {
  // Empty filter matches all items
  if (!locations || locations.length === 0) {
    return true;
  }

  // No location on item means it can't match any required location
  if (!item.location) {
    return false;
  }

  // Check if item's location is in the filter array
  return locations.includes(item.location);
}

/**
 * Check if an extended item matches the property IDs filter.
 * Uses OR logic - item matches if its propertyId is in the array.
 *
 * @param item - The extended item to check
 * @param propertyIds - Array of property IDs to match against
 * @returns true if item matches any property ID or array is empty
 *
 * @example
 * matchesPropertyIds(item, ['prop-123', 'prop-456']); // true if item.propertyId matches either
 * matchesPropertyIds(item, []); // true (empty filter matches all)
 */
export function matchesPropertyIds(item: ItemRecordExtended, propertyIds: string[]): boolean {
  // Empty filter matches all items
  if (!propertyIds || propertyIds.length === 0) {
    return true;
  }

  // No propertyId on item means it can't match any required propertyId
  if (!item.propertyId) {
    return false;
  }

  // Check if item's propertyId is in the filter array
  return propertyIds.includes(item.propertyId);
}

// =============================================================================
// Composite Filter Functions
// =============================================================================

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

/**
 * Derive the content type from an item.
 * Simply returns the item's contentType cast to ContentType.
 *
 * @param item - The item to derive content type from
 * @returns The item's content type as ContentType
 *
 * @example
 * deriveContentType(item); // 'video'
 */
export function deriveContentType(item: ItemRecord): ContentType {
  return item.contentType as ContentType;
}

/**
 * Count the number of active filter categories.
 * Useful for displaying filter count badges.
 *
 * @param filters - The filter state to count
 * @returns Number of filter categories with active values
 *
 * @example
 * countActiveFilters({ tags: ['a'], locations: ['b'] }); // returns 2
 * countActiveFilters({}); // returns 0
 */
export function countActiveFilters(filters: FilterState): number {
  if (!filters) {
    return 0;
  }

  let count = 0;

  if (filters.contentTypes && filters.contentTypes.length > 0) {
    count++;
  }
  if (filters.tags && filters.tags.length > 0) {
    count++;
  }
  if (filters.locations && filters.locations.length > 0) {
    count++;
  }
  if (filters.propertyIds && filters.propertyIds.length > 0) {
    count++;
  }

  return count;
}

/**
 * Create an empty filter state with all filter arrays initialized to empty.
 * Useful for resetting filters or initializing state.
 *
 * @returns A new FilterState with all filter arrays empty
 *
 * @example
 * const filters = createEmptyFilterState();
 * // { contentTypes: [], tags: [], locations: [], propertyIds: [] }
 */
export function createEmptyFilterState(): FilterState {
  return {
    contentTypes: [],
    tags: [],
    locations: [],
    propertyIds: [],
  };
}
