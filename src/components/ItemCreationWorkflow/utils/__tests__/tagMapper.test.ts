/**
 * Unit Tests for tagMapper
 *
 * Tests the tag generation logic for workflow selections.
 * Verifies correct tag mapping for room, item type, and purpose combinations.
 *
 * @module ItemCreationWorkflow/utils/__tests__/tagMapper
 * @created 2026-01-10 (REQ-177 Intelligent Pre-filling)
 */

import { generateTags } from '../tagMapper';

describe('generateTags', () => {
  it('should generate kitchen + appliance + instructions tags for kitchen/appliance/how-to-use', () => {
    const input = {
      room: 'kitchen',
      itemType: 'appliance',
      purpose: 'how-to-use',
    };

    const result = generateTags(input);

    expect(result).toEqual(['kitchen', 'appliance', 'instructions']);
  });

  it('should generate kitchen + appliance + cleaning tags for kitchen/appliance/how-to-clean', () => {
    const input = {
      room: 'kitchen',
      itemType: 'appliance',
      purpose: 'how-to-clean',
    };

    const result = generateTags(input);

    expect(result).toEqual(['kitchen', 'appliance', 'cleaning']);
  });

  it('should generate laundry + appliance + troubleshooting tags for laundry/appliance/troubleshooting', () => {
    const input = {
      room: 'laundry',
      itemType: 'appliance',
      purpose: 'troubleshooting',
    };

    const result = generateTags(input);

    expect(result).toEqual(['laundry', 'appliance', 'troubleshooting']);
  });

  it('should generate general + info tags for general/general-info/other', () => {
    const input = {
      room: 'general',
      itemType: 'general-info',
      purpose: 'other',
    };

    const result = generateTags(input);

    expect(result).toContain('general');
    expect(result).toContain('info');
    // Note: 'general' and 'info' may appear from both special case logic
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should NOT include room tag when room is "other"', () => {
    const input = {
      room: 'other',
      itemType: 'appliance',
      purpose: 'how-to-use',
    };

    const result = generateTags(input);

    expect(result).not.toContain('other');
    expect(result).toContain('appliance');
    expect(result).toContain('instructions');
  });

  it('should handle null purpose by omitting purpose-derived tag', () => {
    const input = {
      room: 'kitchen',
      itemType: 'appliance',
      purpose: null,
    };

    const result = generateTags(input);

    expect(result).toContain('kitchen');
    expect(result).toContain('appliance');
    // Should not have any purpose-derived tags
    expect(result).not.toContain('instructions');
    expect(result).not.toContain('cleaning');
  });

  it('should deduplicate tags when multiple sources generate same tag', () => {
    const input = {
      room: 'general',
      itemType: 'general-info',
      purpose: 'other',
    };

    const result = generateTags(input);

    // 'general' and 'info' may come from both room/itemType and purpose
    const uniqueTags = Array.from(new Set(result));
    expect(result.length).toBe(uniqueTags.length);
  });

  it('should generate bedroom + room-item + safety tags for bedroom/room-item/safety-info', () => {
    const input = {
      room: 'bedroom',
      itemType: 'room-item',
      purpose: 'safety-info',
    };

    const result = generateTags(input);

    expect(result).toContain('bedroom');
    expect(result).toContain('room-item');
    expect(result).toContain('safety');
  });

  it('should generate bathroom + room-item + maintenance tags for bathroom/room-item/maintenance', () => {
    const input = {
      room: 'bathroom',
      itemType: 'room-item',
      purpose: 'maintenance',
    };

    const result = generateTags(input);

    expect(result).toContain('bathroom');
    expect(result).toContain('room-item');
    expect(result).toContain('maintenance');
  });

  it('should generate living-room + appliance + features tags for living-room/appliance/features', () => {
    const input = {
      room: 'living-room',
      itemType: 'appliance',
      purpose: 'features',
    };

    const result = generateTags(input);

    expect(result).toContain('living-room');
    expect(result).toContain('appliance');
    expect(result).toContain('features');
  });
});
