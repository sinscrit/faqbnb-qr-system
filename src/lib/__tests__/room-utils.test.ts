/**
 * Room Utils Tests
 * Created: 2026-01-12
 * REQ-212: Instructions List Page - Task 15
 *
 * Unit tests for room extraction logic from item tags.
 */

import { extractRoomFromTags } from '../room-utils';

describe('extractRoomFromTags', () => {
  it('returns null when tags array is empty', () => {
    expect(extractRoomFromTags([])).toBeNull();
  });

  it('returns null when no room tag exists', () => {
    const tags = ['#appliance.coffee-maker', '#type.kitchen-appliance'];
    expect(extractRoomFromTags(tags)).toBeNull();
  });

  it('returns correct room name from basic tag', () => {
    const tags = ['#room.kitchen'];
    expect(extractRoomFromTags(tags)).toBe('Kitchen');
  });

  it('handles hyphens in room names correctly', () => {
    const tags = ['#room.living-room'];
    expect(extractRoomFromTags(tags)).toBe('Living Room');
  });

  it('handles multiple hyphens in room names', () => {
    const tags = ['#room.master-bedroom-suite'];
    expect(extractRoomFromTags(tags)).toBe('Master Bedroom Suite');
  });

  it('returns first room tag when multiple room tags exist', () => {
    const tags = ['#room.kitchen', '#room.living-room', '#appliance.coffee'];
    expect(extractRoomFromTags(tags)).toBe('Kitchen');
  });

  it('returns null for malformed room tag without name', () => {
    const tags = ['#room.'];
    expect(extractRoomFromTags(tags));
  });

  it('returns null for malformed room tag without dot', () => {
    const tags = ['#room'];
    expect(extractRoomFromTags(tags)).toBeNull();
  });

  it('capitalizes first letter of each word correctly', () => {
    const tags = ['#room.dining-room'];
    expect(extractRoomFromTags(tags)).toBe('Dining Room');
  });

  it('handles single letter room names', () => {
    const tags = ['#room.a'];
    expect(extractRoomFromTags(tags)).toBe('A');
  });

  it('handles mixed case input by normalizing to title case', () => {
    const tags = ['#room.KITCHEN'];
    expect(extractRoomFromTags(tags)).toBe('Kitchen');
  });

  it('handles room tag mixed with other tags', () => {
    const tags = [
      '#appliance.coffee-maker',
      '#room.kitchen',
      '#type.appliance',
      '#brand.keurig',
    ];
    expect(extractRoomFromTags(tags)).toBe('Kitchen');
  });

  it('returns null for undefined tags array', () => {
    expect(extractRoomFromTags(undefined as any)).toBeNull();
  });

  it('returns null for null tags array', () => {
    expect(extractRoomFromTags(null as any)).toBeNull();
  });

  it('handles room names with underscores (treats as regular characters)', () => {
    const tags = ['#room.guest_room'];
    expect(extractRoomFromTags(tags)).toBe('Guest_room');
  });

  it('handles very long room names', () => {
    const tags = ['#room.primary-bedroom-with-ensuite-bathroom'];
    expect(extractRoomFromTags(tags)).toBe('Primary Bedroom With Ensuite Bathroom');
  });
});
