/**
 * Suggestion Matrix for ItemCreationWorkflow
 *
 * Maps Room + ItemType combinations to contextual item suggestions.
 * Used by SpecificItemStep to display relevant item options based
 * on the user's room and category selections.
 *
 * @example Using the suggestion matrix
 * ```tsx
 * import { getSuggestions, hasSuggestions } from '@/components/ItemCreationWorkflow/utils/suggestionMatrix';
 *
 * // Get suggestions for kitchen appliances
 * const suggestions = getSuggestions('kitchen', 'appliance');
 * // ['Stove/Oven', 'Refrigerator', 'Microwave', ...]
 *
 * // Check if suggestions exist
 * if (hasSuggestions('garage', 'room-item')) {
 *   // Render suggestion buttons
 * }
 * ```
 *
 * @module ItemCreationWorkflow/utils/suggestionMatrix
 * @see useSuggestions hook for React integration
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import type { RoomType, ItemType } from '../ItemCreationWorkflow.types';

/**
 * Complete suggestion matrix mapping room and item type to suggested items.
 * Each room contains suggestions for each item type category.
 */
export const SUGGESTION_MATRIX: Record<RoomType, Record<ItemType, string[]>> = {
  kitchen: {
    appliance: [
      'Stove/Oven',
      'Refrigerator',
      'Microwave',
      'Dishwasher',
      'Garbage Disposal',
      'Coffee Maker',
      'Toaster Oven',
      'Blender',
      'Electric Kettle',
      'Air Fryer',
      'Instant Pot',
    ],
    'room-item': [
      'Pantry',
      'Cabinets',
      'Sink/Faucet',
      'Ice Maker',
      'Spice Rack',
      'Cutting Boards',
      'Pots & Pans',
      'Utensil Drawer',
    ],
    'general-info': [
      'Trash & Recycling',
      'Composting',
      'Dish Soap Location',
      'Food Storage',
    ],
  },
  laundry: {
    appliance: [
      'Washer',
      'Dryer',
      'Washer/Dryer Combo',
      'Steamer',
      'Iron',
    ],
    'room-item': [
      'Ironing Board',
      'Drying Rack',
      'Laundry Supplies',
      'Laundry Basket',
      'Hangers',
      'Stain Remover',
      'Lint Roller',
    ],
    'general-info': [
      'Detergent Instructions',
      'Cycle Settings',
      'Laundry Schedule',
      'Dryer Lint Trap',
    ],
  },
  bedroom: {
    appliance: [
      'TV/Entertainment',
      'Ceiling Fan',
      'Space Heater',
      'Air Conditioner',
      'Air Purifier',
      'Sound Machine',
      'Alarm Clock',
    ],
    'room-item': [
      'Closet',
      'Safe/Lock Box',
      'Window Treatments',
      'Dresser',
      'Nightstand',
      'Bed Frame',
      'Mirror',
      'Desk/Workspace',
      'Luggage Rack',
    ],
    'general-info': [
      'Bedding Info',
      'Extra Blankets Location',
      'Pillow Options',
      'Light Switches',
      'Outlet Locations',
    ],
  },
  bathroom: {
    appliance: [
      'Hair Dryer',
      'Exhaust Fan',
      'Heated Towel Rack',
      'Electric Razor',
      'Curling Iron',
      'Heated Floor',
    ],
    'room-item': [
      'Shower',
      'Bathtub',
      'Toilet',
      'Medicine Cabinet',
      'Vanity',
      'Towel Hooks',
      'Shower Caddy',
      'Scale',
      'Trash Can',
    ],
    'general-info': [
      'Toiletries Location',
      'Towel Storage',
      'Water Pressure',
      'Hot Water',
      'Cleaning Supplies',
    ],
  },
  'living-room': {
    appliance: [
      'TV/Smart TV',
      'Sound System',
      'Fireplace',
      'Ceiling Fan',
      'Gaming Console',
      'DVD/Blu-ray Player',
      'Air Conditioner',
      'Humidifier',
    ],
    'room-item': [
      'Entertainment Center',
      'Window Treatments',
      'Thermostat',
      'Sofa/Couch',
      'Coffee Table',
      'Bookshelf',
      'Area Rug',
      'Lamps',
      'Charging Station',
    ],
    'general-info': [
      'Remote Controls',
      'Streaming Services',
      'TV Channels',
      'Speaker Instructions',
      'Board Games',
    ],
  },
  garage: {
    appliance: [
      'Garage Door Opener',
      'EV Charger',
      'Freezer',
      'Shop Vac',
      'Workbench Light',
      'Air Compressor',
    ],
    'room-item': [
      'Tool Storage',
      'Bike Storage',
      'Recycling Bins',
      'Lawn Mower',
      'Snow Blower',
      'Ladder',
      'Sports Equipment',
      'Beach Gear',
      'Camping Gear',
    ],
    'general-info': [
      'Parking Instructions',
      'Storage Areas',
      'Car Washing',
      'Emergency Kit',
      'Trash Bins',
    ],
  },
  outdoor: {
    appliance: [
      'Grill/BBQ',
      'Pool Equipment',
      'Hot Tub',
      'Sprinkler System',
      'Outdoor Heater',
      'Fire Pit',
      'Pressure Washer',
      'Electric Bug Zapper',
    ],
    'room-item': [
      'Patio Furniture',
      'Outdoor Lighting',
      'Garden Tools',
      'Umbrella/Shade',
      'Outdoor Cushions',
      'Hose & Nozzle',
      'Fire Pit Tools',
      'Outdoor Speakers',
      'Bird Feeder',
    ],
    'general-info': [
      'Gate Access',
      'Pool Rules',
      'Trash Pickup Days',
      'Outdoor Dining',
      'Wildlife Info',
      'Quiet Hours',
      'Garden Care',
    ],
  },
  general: {
    appliance: [
      'HVAC/Thermostat',
      'Water Heater',
      'Security System',
      'Smart Home Hub',
      'Doorbell Camera',
      'Smart Locks',
      'Smoke Detectors',
      'CO Detectors',
      'Intercom',
    ],
    'room-item': [
      'Circuit Breaker',
      'Water Shutoff',
      'Fire Extinguisher',
      'Fuse Box',
      'Gas Shutoff',
      'First Aid Kit',
      'Flashlights',
      'Batteries',
    ],
    'general-info': [
      'WiFi Password',
      'Emergency Contacts',
      'House Rules',
      'Check-out Instructions',
      'Local Recommendations',
      'Key Access',
      'Alarm Code',
      'Guest Manual',
      'Parking Pass',
      'Neighborhood Info',
    ],
  },
  other: {
    appliance: [],
    'room-item': [],
    'general-info': [],
  },
};

/**
 * Get suggestions for a room and item type combination.
 * Returns empty array for invalid combinations or 'other' room.
 *
 * @param room - The selected room type
 * @param itemType - The selected item type
 * @returns Array of suggested item names
 */
export function getSuggestions(room: RoomType, itemType: ItemType): string[] {
  return SUGGESTION_MATRIX[room]?.[itemType] ?? [];
}

/**
 * Check if a room has any suggestions for the given item type.
 *
 * @param room - The room type to check
 * @param itemType - The item type to check
 * @returns True if suggestions exist
 */
export function hasSuggestions(room: RoomType, itemType: ItemType): boolean {
  return getSuggestions(room, itemType).length > 0;
}

/**
 * Get all unique suggestions across all rooms for a given item type.
 * Useful for autocomplete or search functionality.
 *
 * @param itemType - The item type to get suggestions for
 * @returns Alphabetically sorted array of unique suggestions
 */
export function getAllSuggestionsForType(itemType: ItemType): string[] {
  const suggestions = new Set<string>();

  Object.values(SUGGESTION_MATRIX).forEach((roomSuggestions) => {
    roomSuggestions[itemType]?.forEach((s) => suggestions.add(s));
  });

  return Array.from(suggestions).sort();
}

/**
 * Get all unique suggestions across all rooms and item types.
 * Useful for global search functionality.
 *
 * @returns Alphabetically sorted array of all unique suggestions
 */
export function getAllSuggestions(): string[] {
  const suggestions = new Set<string>();

  Object.values(SUGGESTION_MATRIX).forEach((roomSuggestions) => {
    Object.values(roomSuggestions).forEach((items) => {
      items.forEach((s) => suggestions.add(s));
    });
  });

  return Array.from(suggestions).sort();
}

/**
 * Convert an English suggestion string to a camelCase translation key.
 * Used for looking up translations in workflow.constants.itemSuggestions.
 *
 * @example
 * getSuggestionKey('Stove/Oven') // 'stoveOven'
 * getSuggestionKey('Trash & Recycling') // 'trashRecycling'
 * getSuggestionKey('TV/Smart TV') // 'tvSmartTv'
 * getSuggestionKey('DVD/Blu-ray Player') // 'dvdBlurayPlayer'
 *
 * @param suggestion - The English suggestion string
 * @returns The camelCase translation key
 * @lastModified 2026-02-12 (REQ-258 i18n Item Suggestions)
 */
export function getSuggestionKey(suggestion: string): string {
  return suggestion
    // Replace special characters with spaces
    .replace(/[/&-]/g, ' ')
    // Remove other special characters (like apostrophes)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    // Split into words
    .split(/\s+/)
    // Filter out empty strings
    .filter(Boolean)
    // Convert to camelCase: first word lowercase, rest capitalized
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/**
 * Map from item type with hyphens to camelCase for translation keys.
 * Used to convert 'room-item' and 'general-info' to 'roomItem' and 'generalInfo'.
 *
 * @param itemType - The item type (may contain hyphens)
 * @returns The camelCase version for translation lookup
 * @lastModified 2026-02-12 (REQ-258 i18n Item Suggestions)
 */
export function getItemTypeKey(itemType: ItemType): string {
  return itemType.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Map from room type with hyphens to camelCase for translation keys.
 * Used to convert 'living-room' to 'livingRoom'.
 *
 * @param room - The room type (may contain hyphens)
 * @returns The camelCase version for translation lookup
 * @lastModified 2026-02-12 (REQ-258 i18n Item Suggestions)
 */
export function getRoomKey(room: RoomType): string {
  return room.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
