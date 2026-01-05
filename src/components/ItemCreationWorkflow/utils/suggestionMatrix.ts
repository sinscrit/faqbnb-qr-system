/**
 * Suggestion Matrix for ItemCreationWorkflow
 *
 * Maps Room + ItemType combinations to suggested specific items.
 * Based on PRD Appendix A specifications.
 *
 * @module ItemCreationWorkflow/utils/suggestionMatrix
 * @see docs/prd/Plan-093-Item-Creation-Workflow.md Appendix A
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
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
    ],
    'room-item': [
      'Pantry',
      'Cabinets',
      'Sink/Faucet',
      'Ice Maker',
    ],
    'general-info': [
      'Trash & Recycling',
    ],
  },
  laundry: {
    appliance: [
      'Washer',
      'Dryer',
      'Washer/Dryer Combo',
    ],
    'room-item': [
      'Ironing Board',
      'Drying Rack',
      'Laundry Supplies',
    ],
    'general-info': [
      'Detergent Instructions',
    ],
  },
  bedroom: {
    appliance: [
      'TV/Entertainment',
      'Ceiling Fan',
      'Space Heater',
    ],
    'room-item': [
      'Closet',
      'Safe/Lock Box',
      'Window Treatments',
    ],
    'general-info': [
      'Bedding Info',
      'Extra Blankets Location',
    ],
  },
  bathroom: {
    appliance: [
      'Hair Dryer',
      'Exhaust Fan',
      'Heated Towel Rack',
    ],
    'room-item': [
      'Shower',
      'Bathtub',
      'Toilet',
      'Medicine Cabinet',
    ],
    'general-info': [
      'Toiletries Location',
      'Towel Storage',
    ],
  },
  'living-room': {
    appliance: [
      'TV/Smart TV',
      'Sound System',
      'Fireplace',
      'Ceiling Fan',
    ],
    'room-item': [
      'Entertainment Center',
      'Window Treatments',
      'Thermostat',
    ],
    'general-info': [
      'Remote Controls',
      'Streaming Services',
    ],
  },
  garage: {
    appliance: [
      'Garage Door Opener',
      'EV Charger',
      'Freezer',
    ],
    'room-item': [
      'Tool Storage',
      'Bike Storage',
      'Recycling Bins',
    ],
    'general-info': [
      'Parking Instructions',
      'Storage Areas',
    ],
  },
  outdoor: {
    appliance: [
      'Grill/BBQ',
      'Pool Equipment',
      'Hot Tub',
      'Sprinkler System',
    ],
    'room-item': [
      'Patio Furniture',
      'Outdoor Lighting',
      'Garden Tools',
    ],
    'general-info': [
      'Gate Access',
      'Pool Rules',
      'Trash Pickup Days',
    ],
  },
  general: {
    appliance: [
      'HVAC/Thermostat',
      'Water Heater',
      'Security System',
      'Smart Home Hub',
    ],
    'room-item': [
      'Circuit Breaker',
      'Water Shutoff',
      'Fire Extinguisher',
    ],
    'general-info': [
      'WiFi Password',
      'Emergency Contacts',
      'House Rules',
      'Check-out Instructions',
      'Local Recommendations',
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
