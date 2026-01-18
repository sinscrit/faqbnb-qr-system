/**
 * useSuggestions Hook Tests
 *
 * @module ItemCreationWorkflow/hooks/__tests__/useSuggestions
 * @lastModified 2026-01-05
 */

import { renderHook } from '@testing-library/react';
import { useSuggestions } from '../useSuggestions';
import type { SessionItem, RoomType, ItemType } from '../../ItemCreationWorkflow.types';

describe('useSuggestions', () => {
  const mockSessionItem = (name: string, room: RoomType): SessionItem => ({
    id: crypto.randomUUID(),
    name,
    room,
    itemType: 'appliance',
    content: [],
    createdAt: new Date(),
  });

  // ===========================================================================
  // Suggestions Retrieval Tests
  // ===========================================================================

  describe('suggestions retrieval', () => {
    it('returns suggestions for valid room + item type combination', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems: [],
        })
      );

      expect(result.current.suggestions).toContain('Stove/Oven');
      expect(result.current.suggestions).toContain('Refrigerator');
      expect(result.current.hasSuggestions).toBe(true);
    });

    it('returns empty array for "other" room', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'other',
          itemType: 'appliance',
          existingItems: [],
        })
      );

      expect(result.current.suggestions).toHaveLength(0);
      expect(result.current.hasSuggestions).toBe(false);
    });

    it('returns suggestions for laundry + appliance', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'laundry',
          itemType: 'appliance',
          existingItems: [],
        })
      );

      expect(result.current.suggestions).toContain('Washer');
      expect(result.current.suggestions).toContain('Dryer');
      expect(result.current.hasSuggestions).toBe(true);
    });

    it('returns suggestions for bedroom + room-item', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'bedroom',
          itemType: 'room-item',
          existingItems: [],
        })
      );

      expect(result.current.suggestions).toContain('Closet');
      expect(result.current.suggestions).toContain('Safe/Lock Box');
      expect(result.current.hasSuggestions).toBe(true);
    });

    it('returns suggestions for general + general-info', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'general',
          itemType: 'general-info',
          existingItems: [],
        })
      );

      expect(result.current.suggestions).toContain('WiFi Password');
      expect(result.current.suggestions).toContain('Emergency Contacts');
      expect(result.current.hasSuggestions).toBe(true);
    });
  });

  // ===========================================================================
  // Created Detection Tests
  // ===========================================================================

  describe('created detection', () => {
    it('identifies created suggestions based on session items', () => {
      const existingItems = [
        mockSessionItem('Kitchen - Refrigerator', 'kitchen'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      expect(result.current.isCreated('Refrigerator')).toBe(true);
      expect(result.current.isCreated('Stove/Oven')).toBe(false);
    });

    it('is case-insensitive when matching', () => {
      const existingItems = [
        mockSessionItem('Kitchen - REFRIGERATOR', 'kitchen'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      expect(result.current.isCreated('Refrigerator')).toBe(true);
    });

    it('only matches items in the same room', () => {
      const existingItems = [
        mockSessionItem('Bathroom - Shower', 'bathroom'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      expect(result.current.createdSuggestions.size).toBe(0);
    });

    it('detects multiple created items', () => {
      const existingItems = [
        mockSessionItem('Kitchen - Refrigerator', 'kitchen'),
        mockSessionItem('Kitchen - Microwave', 'kitchen'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      expect(result.current.isCreated('Refrigerator')).toBe(true);
      expect(result.current.isCreated('Microwave')).toBe(true);
      expect(result.current.isCreated('Stove/Oven')).toBe(false);
      expect(result.current.createdSuggestions.size).toBe(2);
    });

    it('returns empty createdSuggestions when no existing items', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems: [],
        })
      );

      expect(result.current.createdSuggestions.size).toBe(0);
    });
  });

  // ===========================================================================
  // Memoization Tests
  // ===========================================================================

  describe('memoization', () => {
    it('returns stable suggestions reference for same inputs', () => {
      const { result, rerender } = renderHook(
        (props) =>
          useSuggestions({
            room: props.room,
            itemType: props.itemType,
            existingItems: props.existingItems,
          }),
        {
          initialProps: {
            room: 'kitchen' as RoomType,
            itemType: 'appliance' as ItemType,
            existingItems: [] as SessionItem[],
          },
        }
      );

      const initialSuggestions = result.current.suggestions;

      rerender({
        room: 'kitchen',
        itemType: 'appliance',
        existingItems: [],
      });

      expect(result.current.suggestions).toBe(initialSuggestions);
    });

    it('updates suggestions when room changes', () => {
      const { result, rerender } = renderHook(
        (props) =>
          useSuggestions({
            room: props.room,
            itemType: props.itemType,
            existingItems: props.existingItems,
          }),
        {
          initialProps: {
            room: 'kitchen' as RoomType,
            itemType: 'appliance' as ItemType,
            existingItems: [] as SessionItem[],
          },
        }
      );

      expect(result.current.suggestions).toContain('Refrigerator');

      rerender({
        room: 'laundry',
        itemType: 'appliance',
        existingItems: [],
      });

      expect(result.current.suggestions).toContain('Washer');
      expect(result.current.suggestions).not.toContain('Refrigerator');
    });

    it('updates suggestions when itemType changes', () => {
      const { result, rerender } = renderHook(
        (props) =>
          useSuggestions({
            room: props.room,
            itemType: props.itemType,
            existingItems: props.existingItems,
          }),
        {
          initialProps: {
            room: 'kitchen' as RoomType,
            itemType: 'appliance' as ItemType,
            existingItems: [] as SessionItem[],
          },
        }
      );

      expect(result.current.suggestions).toContain('Refrigerator');

      rerender({
        room: 'kitchen',
        itemType: 'room-item',
        existingItems: [],
      });

      expect(result.current.suggestions).toContain('Pantry');
      expect(result.current.suggestions).not.toContain('Refrigerator');
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('edge cases', () => {
    it('handles empty item name gracefully', () => {
      const existingItems = [
        mockSessionItem('', 'kitchen'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      // Empty item names shouldn't match any suggestion
      expect(result.current.createdSuggestions.size).toBe(0);
    });

    it('handles partial matches', () => {
      const existingItems = [
        mockSessionItem('Kitchen - My Refrigerator Unit', 'kitchen'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      // Should match because 'refrigerator' is contained in the name
      expect(result.current.isCreated('Refrigerator')).toBe(true);
    });

    it('isCreated function is stable between renders', () => {
      const { result, rerender } = renderHook(
        () =>
          useSuggestions({
            room: 'kitchen',
            itemType: 'appliance',
            existingItems: [],
          })
      );

      const initialIsCreated = result.current.isCreated;

      rerender();

      expect(result.current.isCreated).toBe(initialIsCreated);
    });
  });
});
