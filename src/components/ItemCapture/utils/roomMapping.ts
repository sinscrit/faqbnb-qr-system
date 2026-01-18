/**
 * Room Type Mapping Utility
 *
 * Maps ItemCreationWorkflow RoomType values to ItemCapture PRESET_LOCATIONS values.
 * This enables pre-filling the Room dropdown in MetadataStep based on workflow selection.
 *
 * @module ItemCapture/utils/roomMapping
 * @lastModified 2026-01-08 (REQ-144 Task 2)
 */

import type { RoomType } from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';
import { PRESET_LOCATIONS } from './constants';

/**
 * Maps ItemCreationWorkflow RoomType values to ItemCapture PRESET_LOCATIONS values.
 *
 * Workflow RoomType values:
 * 'kitchen' | 'laundry' | 'bedroom' | 'bathroom' | 'living-room' |
 * 'garage' | 'outdoor' | 'general' | 'other'
 *
 * PRESET_LOCATIONS values:
 * 'Kitchen' | 'Living Room' | 'Master Bedroom' | 'Guest Bedroom' |
 * 'Master Bathroom' | 'Guest Bathroom' | 'Garage' | 'Laundry Room' |
 * 'Basement' | 'Attic' | 'Outdoor/Patio' | 'Office/Study' |
 * 'Dining Room' | 'Entryway' | 'Other'
 */
export const ROOM_TYPE_TO_LOCATION_MAP: Record<RoomType, string | null> = {
  'kitchen': 'Kitchen',
  'laundry': 'Laundry Room',
  'bedroom': 'Master Bedroom', // Default to Master Bedroom for generic bedroom
  'bathroom': 'Master Bathroom', // Default to Master Bathroom for generic bathroom
  'living-room': 'Living Room',
  'garage': 'Garage',
  'outdoor': 'Outdoor/Patio',
  'general': null, // No direct mapping for general
  'other': 'Other',
};

/**
 * Converts a workflow RoomType to a preset location string for MetadataStep.
 *
 * @param roomType - The RoomType from ItemCreationWorkflow
 * @param customRoomName - Optional custom room name if RoomType is 'other'
 * @returns The mapped location string, or undefined if no mapping exists
 */
export function mapRoomTypeToLocation(
  roomType: RoomType,
  customRoomName?: string
): string | undefined {
  // If 'other' was selected with a custom name, use the custom name
  if (roomType === 'other' && customRoomName) {
    return customRoomName;
  }

  const mappedLocation = ROOM_TYPE_TO_LOCATION_MAP[roomType];
  return mappedLocation ?? undefined;
}
