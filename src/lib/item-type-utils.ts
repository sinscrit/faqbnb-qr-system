/**
 * Item Type Utilities
 * Created: 2026-01-13
 * REQ-215: Simplified Item Edit Page
 *
 * Helper functions for extracting and processing item type information from tags.
 * Item types use plain tags (e.g., 'appliance', 'room-item', 'general-info')
 */

import { ITEM_TYPES } from '@/components/ItemCreationWorkflow/utils/constants';

/**
 * Extracts item type from tags array
 * @param tags Array of tag strings
 * @returns First matching item type, or null if none found
 *
 * @example
 * extractItemTypeFromTags(['#room.kitchen', 'appliance']) // Returns: "appliance"
 * extractItemTypeFromTags(['#room.kitchen', 'room-item']) // Returns: "room-item"
 * extractItemTypeFromTags(['#room.kitchen']) // Returns: null
 */
export function extractItemTypeFromTags(tags: string[]): string | null {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Find the first tag that matches one of the item types
  const itemTypeTag = tags.find((tag) =>
    ITEM_TYPES.includes(tag as any)
  );

  return itemTypeTag || null;
}

/**
 * Sets or updates item type tag in tags array
 * @param tags Array of tag strings
 * @param itemType Item type value ('appliance', 'room-item', 'general-info') or null to remove
 * @returns New array with item type tag updated (does not mutate original)
 *
 * @example
 * setItemTypeInTags(['#room.kitchen', 'appliance'], 'room-item') // Returns: ['#room.kitchen', 'room-item']
 * setItemTypeInTags(['#room.kitchen', 'appliance'], null) // Returns: ['#room.kitchen']
 * setItemTypeInTags(['#room.kitchen'], 'appliance') // Returns: ['#room.kitchen', 'appliance']
 */
export function setItemTypeInTags(tags: string[], itemType: string | null): string[] {
  // Remove any existing item type tags
  const tagsWithoutItemType = tags.filter((tag) =>
    !ITEM_TYPES.includes(tag as any)
  );

  // If itemType is provided, add the new item type tag
  if (itemType && itemType.trim() !== '') {
    return [...tagsWithoutItemType, itemType];
  }

  // Otherwise, return tags without item type tag
  return tagsWithoutItemType;
}
