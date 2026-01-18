/**
 * Unit tests for roomMapping utility
 * @module ItemCapture/utils/__tests__/roomMapping
 * @lastModified 2026-01-08 (REQ-144)
 */

import { describe, it, expect } from 'vitest';
import { mapRoomTypeToLocation, ROOM_TYPE_TO_LOCATION_MAP } from '../roomMapping';
import type { RoomType } from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';

describe('roomMapping', () => {
  describe('mapRoomTypeToLocation', () => {
    it.each([
      ['kitchen', 'Kitchen'],
      ['living-room', 'Living Room'],
      ['laundry', 'Laundry Room'],
      ['bedroom', 'Master Bedroom'],
      ['bathroom', 'Master Bathroom'],
      ['garage', 'Garage'],
      ['outdoor', 'Outdoor/Patio'],
      ['other', 'Other'],
    ] as const)('maps %s to %s', (roomType, expected) => {
      expect(mapRoomTypeToLocation(roomType)).toBe(expected);
    });

    it('returns undefined for general room type', () => {
      expect(mapRoomTypeToLocation('general')).toBeUndefined();
    });

    it('uses custom room name when roomType is other and customRoomName provided', () => {
      expect(mapRoomTypeToLocation('other', 'Wine Cellar')).toBe('Wine Cellar');
    });

    it('returns mapped value when roomType is other but no customRoomName provided', () => {
      expect(mapRoomTypeToLocation('other')).toBe('Other');
    });

    it('ignores customRoomName for non-other room types', () => {
      expect(mapRoomTypeToLocation('kitchen', 'Custom Kitchen')).toBe('Kitchen');
    });
  });

  describe('ROOM_TYPE_TO_LOCATION_MAP', () => {
    it('has mapping for all RoomType values', () => {
      const roomTypes: RoomType[] = [
        'kitchen', 'laundry', 'bedroom', 'bathroom',
        'living-room', 'garage', 'outdoor', 'general', 'other'
      ];

      roomTypes.forEach(type => {
        expect(ROOM_TYPE_TO_LOCATION_MAP).toHaveProperty(type);
      });
    });
  });
});
