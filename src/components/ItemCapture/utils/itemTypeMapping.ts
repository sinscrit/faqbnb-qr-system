/**
 * Item Type to Appliance Type Mapping Utility
 *
 * Provides utilities for mapping ItemCreationWorkflow specific item selections
 * to ItemCapture ApplianceType values.
 *
 * @module ItemCapture/utils/itemTypeMapping
 * @lastModified 2026-01-08 (REQ-144 Fix - Map specificItem to ApplianceType)
 */

import type { ItemType } from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';
import type { ApplianceType } from '../ItemCapture.types';

/**
 * Mapping from workflow specific item names to ApplianceType values.
 * Keys are normalized (lowercase) for case-insensitive matching.
 */
const SPECIFIC_ITEM_TO_APPLIANCE_TYPE: Record<string, ApplianceType> = {
  // Washer variants
  'washer': 'washer',
  'washer/dryer combo': 'washer',

  // Dryer
  'dryer': 'dryer',

  // Dishwasher
  'dishwasher': 'dishwasher',

  // Oven/Range variants
  'stove/oven': 'oven',
  'oven': 'oven',
  'stove': 'oven',
  'range': 'oven',

  // Microwave
  'microwave': 'microwave',

  // Refrigerator variants
  'refrigerator': 'refrigerator',
  'fridge': 'refrigerator',
  'freezer': 'refrigerator',

  // HVAC variants
  'hvac/thermostat': 'hvac',
  'thermostat': 'hvac',
  'air conditioner': 'hvac',
  'ceiling fan': 'hvac',
  'space heater': 'hvac',
  'heated floor': 'hvac',

  // Water Heater
  'water heater': 'water_heater',

  // Garbage Disposal
  'garbage disposal': 'garbage_disposal',

  // Security System variants
  'security system': 'security_system',
  'doorbell camera': 'security_system',
  'smart locks': 'security_system',
  'alarm code': 'security_system',

  // Smart Home variants
  'smart home hub': 'smart_home',
  'smart home device': 'smart_home',

  // Entertainment variants
  'tv/entertainment': 'entertainment',
  'tv/smart tv': 'entertainment',
  'sound system': 'entertainment',
  'gaming console': 'entertainment',
  'dvd/blu-ray player': 'entertainment',
  'outdoor speakers': 'entertainment',

  // Pool/Spa
  'pool equipment': 'pool_spa',
  'hot tub': 'pool_spa',

  // Garage Door
  'garage door opener': 'garage',
};

/**
 * Maps a specific item name from the workflow to an ApplianceType.
 *
 * @param specificItem - The specific item name from Step 3 (e.g., "Refrigerator")
 * @returns The matching ApplianceType, or undefined if no match
 */
export function mapSpecificItemToApplianceType(
  specificItem: string | undefined
): ApplianceType | undefined {
  if (!specificItem) return undefined;

  const normalized = specificItem.toLowerCase().trim();
  return SPECIFIC_ITEM_TO_APPLIANCE_TYPE[normalized];
}

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
 * @deprecated Use mapSpecificItemToApplianceType instead for accurate mapping
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
