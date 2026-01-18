/**
 * suggestionMatrix Unit Tests
 *
 * @module ItemCreationWorkflow/utils/__tests__/suggestionMatrix
 * @lastModified 2026-01-05 (REQ-101)
 */

import { describe, it, expect } from 'vitest';
import {
  getSuggestions,
  hasSuggestions,
  getAllSuggestionsForType,
  getAllSuggestions,
} from '../suggestionMatrix';
import type { RoomType, ItemType } from '../../ItemCreationWorkflow.types';

describe('SUGGESTION_MATRIX', () => {
  // Define required rooms and item types
  const REQUIRED_ROOMS: RoomType[] = [
    'kitchen', 'laundry', 'bedroom', 'bathroom',
    'living-room', 'garage', 'outdoor', 'general'
  ];

  const REQUIRED_TYPES: ItemType[] = ['appliance', 'room-item', 'general-info'];

  // ===========================================================================
  // Coverage Tests
  // ===========================================================================

  describe('data coverage', () => {
    REQUIRED_ROOMS.forEach(room => {
      describe(`${room}`, () => {
        REQUIRED_TYPES.forEach(type => {
          it(`should have at least 4 ${type} suggestions`, () => {
            const suggestions = getSuggestions(room, type);
            expect(suggestions.length).toBeGreaterThanOrEqual(4);
          });
        });
      });
    });

    it('should have "other" room with empty arrays', () => {
      REQUIRED_TYPES.forEach(type => {
        expect(getSuggestions('other', type)).toHaveLength(0);
      });
    });

    it('should have at least 100 total unique suggestions', () => {
      const all = getAllSuggestions();
      expect(all.length).toBeGreaterThanOrEqual(100);
    });
  });

  // ===========================================================================
  // Naming Convention Tests
  // ===========================================================================

  describe('naming conventions', () => {
    it('should use Title Case for all suggestions', () => {
      const all = getAllSuggestions();
      const invalidItems: string[] = [];

      all.forEach(item => {
        // Skip known acronyms and special casing
        const acronyms = ['HVAC', 'TV', 'WiFi', 'EV', 'CO', 'DVD', 'BBQ'];
        const hasAcronym = acronyms.some(a => item.includes(a));
        // Blu-ray is correctly styled as "Blu-ray" (brand name)
        const hasBluRay = item.includes('Blu-ray');
        // Check-out is correctly styled with lowercase "out" per common conventions
        const hasCheckOut = item.includes('Check-out');

        if (!hasAcronym && !hasBluRay && !hasCheckOut) {
          // Check first letter of each word is uppercase (split on spaces, slashes, and ampersands)
          // Note: We don't split on hyphens because hyphenated words may have legitimate lowercase
          const words = item.split(/[\s\/&]+/);
          words.forEach(word => {
            if (word.length > 0 && word[0] !== word[0].toUpperCase()) {
              invalidItems.push(`"${item}" - word "${word}" not capitalized`);
            }
          });
        }
      });

      expect(invalidItems).toHaveLength(0);
    });

    it('should not have spaces around "/" in alternatives', () => {
      const all = getAllSuggestions();
      const invalid = all.filter(item => item.includes(' / ') || item.includes('/ ') || item.includes(' /'));
      expect(invalid).toHaveLength(0);
    });

    it('should use consistent WiFi spelling', () => {
      const all = getAllSuggestions();
      const hasCorrectWifi = all.some(s => s.includes('WiFi'));
      const hasIncorrectWifi = all.some(s =>
        s.toLowerCase().includes('wifi') && !s.includes('WiFi')
      );

      if (hasCorrectWifi || hasIncorrectWifi) {
        expect(hasIncorrectWifi).toBe(false);
      }
    });
  });

  // ===========================================================================
  // Function Tests
  // ===========================================================================

  describe('getSuggestions', () => {
    it('returns array for valid room + type', () => {
      const result = getSuggestions('kitchen', 'appliance');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for "other" room', () => {
      expect(getSuggestions('other', 'appliance')).toEqual([]);
    });
  });

  describe('hasSuggestions', () => {
    it('returns true for room with suggestions', () => {
      expect(hasSuggestions('kitchen', 'appliance')).toBe(true);
    });

    it('returns false for "other" room', () => {
      expect(hasSuggestions('other', 'appliance')).toBe(false);
    });
  });

  describe('getAllSuggestionsForType', () => {
    it('returns sorted unique suggestions for type', () => {
      const appliances = getAllSuggestionsForType('appliance');
      expect(appliances.length).toBeGreaterThan(0);

      // Check sorted
      const sorted = [...appliances].sort();
      expect(appliances).toEqual(sorted);

      // Check unique
      const unique = new Set(appliances);
      expect(unique.size).toBe(appliances.length);
    });
  });

  describe('getAllSuggestions', () => {
    it('returns sorted unique suggestions across all rooms/types', () => {
      const all = getAllSuggestions();
      expect(all.length).toBeGreaterThan(0);

      // Check sorted
      const sorted = [...all].sort();
      expect(all).toEqual(sorted);

      // Check unique
      const unique = new Set(all);
      expect(unique.size).toBe(all.length);
    });
  });
});
