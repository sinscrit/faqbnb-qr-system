/**
 * Unit tests for itemTypeMapping utility
 * @module ItemCapture/utils/__tests__/itemTypeMapping
 * @lastModified 2026-01-08 (REQ-144)
 */

import { describe, it, expect } from 'vitest';
import { mapItemTypeToApplianceType, isApplianceItemType } from '../itemTypeMapping';
import type { ItemType } from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';

describe('itemTypeMapping', () => {
  describe('mapItemTypeToApplianceType', () => {
    it('returns undefined for appliance item type (user should select specific type)', () => {
      expect(mapItemTypeToApplianceType('appliance')).toBeUndefined();
    });

    it('returns undefined for room-item type', () => {
      expect(mapItemTypeToApplianceType('room-item')).toBeUndefined();
    });

    it('returns undefined for general-info type', () => {
      expect(mapItemTypeToApplianceType('general-info')).toBeUndefined();
    });
  });

  describe('isApplianceItemType', () => {
    it('returns true for appliance type', () => {
      expect(isApplianceItemType('appliance')).toBe(true);
    });

    it('returns false for room-item type', () => {
      expect(isApplianceItemType('room-item')).toBe(false);
    });

    it('returns false for general-info type', () => {
      expect(isApplianceItemType('general-info')).toBe(false);
    });
  });
});
