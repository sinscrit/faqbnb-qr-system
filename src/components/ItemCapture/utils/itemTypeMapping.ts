/**
 * Item Type to Appliance Type Mapping Utility
 *
 * Provides utilities for mapping ItemCreationWorkflow ItemType values
 * to ItemCapture ApplianceType values. Since ItemType is a broad category
 * and ApplianceType is specific, direct mapping is limited.
 *
 * @module ItemCapture/utils/itemTypeMapping
 * @lastModified 2026-01-08 (REQ-144 Task 3)
 */

import type { ItemType } from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';
import type { ApplianceType } from '../ItemCapture.types';

/**
 * Determines if the workflow ItemType suggests pre-selecting an appliance-related type.
 *
 * Since ItemType is a broad category ('appliance', 'room-item', 'general-info')
 * and ApplianceType is specific (washer, dryer, etc.), we cannot automatically
 * select a specific appliance type. However, this function can be used to
 * determine whether to show appliance-related suggestions.
 *
 * @param itemType - The ItemType from ItemCreationWorkflow
 * @returns 'other' if itemType is 'appliance' (to indicate appliance category),
 *          undefined otherwise (user should select manually)
 */
export function mapItemTypeToApplianceType(
  itemType: ItemType
): ApplianceType | undefined {
  // Only pre-select 'other' for appliances to indicate category
  // without forcing a specific appliance type
  if (itemType === 'appliance') {
    return undefined; // Let user select specific appliance
  }

  // For 'room-item' and 'general-info', no appliance type applies
  return undefined;
}

/**
 * Checks if the workflow ItemType is appliance-related.
 *
 * @param itemType - The ItemType from ItemCreationWorkflow
 * @returns true if the item type is 'appliance'
 */
export function isApplianceItemType(itemType: ItemType): boolean {
  return itemType === 'appliance';
}
