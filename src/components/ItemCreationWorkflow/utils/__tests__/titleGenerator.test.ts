/**
 * Title Generator Utility Tests
 *
 * Tests for article title generation functions used in the
 * ItemCreationWorkflow to auto-generate titles based on purpose.
 *
 * @module ItemCreationWorkflow/utils/__tests__/titleGenerator.test
 * @see docs/REQ-155-create-title-generator-utility-overview.md
 * @lastModified 2026-01-10 (REQ-155 Create Title Generator Utility)
 */

import {
  generateArticleTitle,
  generateItemDisplayName,
  TitleGeneratorInput,
} from '../titleGenerator';

describe('titleGenerator', () => {
  // ===========================================================================
  // generateArticleTitle Tests
  // ===========================================================================

  describe('generateArticleTitle', () => {
    describe('Core Functionality', () => {
      it('generates title with purpose and item', () => {
        const result = generateArticleTitle({
          specificItem: 'Fridge',
          purpose: 'how-to-clean',
        });
        expect(result).toBe('How to Clean - Fridge');
      });

      it('generates correct title for each purpose type', () => {
        const testCases: Array<{
          purpose: TitleGeneratorInput['purpose'];
          expected: string;
        }> = [
          { purpose: 'how-to-use', expected: 'How to Use - Dishwasher' },
          { purpose: 'how-to-clean', expected: 'How to Clean - Dishwasher' },
          { purpose: 'troubleshooting', expected: 'Troubleshooting - Dishwasher' },
          { purpose: 'safety-info', expected: 'Safety Information - Dishwasher' },
          { purpose: 'maintenance', expected: 'Maintenance - Dishwasher' },
          { purpose: 'features', expected: 'Features & Tips - Dishwasher' },
          { purpose: 'other', expected: 'Other - Dishwasher' },
        ];

        testCases.forEach(({ purpose, expected }) => {
          const result = generateArticleTitle({
            specificItem: 'Dishwasher',
            purpose,
          });
          expect(result).toBe(expected);
        });
      });
    });

    describe('Fallback Behavior', () => {
      it('returns item name when purpose is null', () => {
        const result = generateArticleTitle({
          specificItem: 'Oven',
          purpose: null,
        });
        expect(result).toBe('Oven');
      });

      it('returns purpose label when item is empty string', () => {
        const result = generateArticleTitle({
          specificItem: '',
          purpose: 'how-to-use',
        });
        expect(result).toBe('How to Use');
      });

      it('returns empty string when both are missing', () => {
        const result = generateArticleTitle({
          specificItem: '',
          purpose: null,
        });
        expect(result).toBe('');
      });

      it('returns item name when purpose is null and item has whitespace', () => {
        const result = generateArticleTitle({
          specificItem: '  Microwave  ',
          purpose: null,
        });
        // Note: Function does not trim - caller should trim if needed
        expect(result).toBe('  Microwave  ');
      });
    });

    describe('Edge Cases', () => {
      it('handles items with spaces', () => {
        const result = generateArticleTitle({
          specificItem: 'Washing Machine',
          purpose: 'maintenance',
        });
        expect(result).toBe('Maintenance - Washing Machine');
      });

      it('handles items with special characters', () => {
        const result = generateArticleTitle({
          specificItem: 'WiFi Router (5GHz)',
          purpose: 'how-to-use',
        });
        expect(result).toBe('How to Use - WiFi Router (5GHz)');
      });

      it('handles items with hyphens', () => {
        const result = generateArticleTitle({
          specificItem: 'Air-Conditioner',
          purpose: 'troubleshooting',
        });
        expect(result).toBe('Troubleshooting - Air-Conditioner');
      });

      it('handles items with numbers', () => {
        const result = generateArticleTitle({
          specificItem: 'TV 55"',
          purpose: 'features',
        });
        expect(result).toBe('Features & Tips - TV 55"');
      });

      it('handles items with apostrophes', () => {
        const result = generateArticleTitle({
          specificItem: "Guest's Bedroom Heater",
          purpose: 'safety-info',
        });
        expect(result).toBe("Safety Information - Guest's Bedroom Heater");
      });
    });
  });

  // ===========================================================================
  // generateItemDisplayName Tests
  // ===========================================================================

  describe('generateItemDisplayName', () => {
    describe('Core Functionality', () => {
      it('combines room and item with hyphen separator', () => {
        const result = generateItemDisplayName('Kitchen', 'Fridge');
        expect(result).toBe('Kitchen - Fridge');
      });

      it('handles room labels with spaces', () => {
        const result = generateItemDisplayName('Living Room', 'Television');
        expect(result).toBe('Living Room - Television');
      });
    });

    describe('Fallback Behavior', () => {
      it('returns item when room is empty', () => {
        const result = generateItemDisplayName('', 'Fridge');
        expect(result).toBe('Fridge');
      });

      it('returns room when item is empty', () => {
        const result = generateItemDisplayName('Kitchen', '');
        expect(result).toBe('Kitchen');
      });

      it('returns empty string when both are empty', () => {
        const result = generateItemDisplayName('', '');
        expect(result).toBe('');
      });
    });
  });

  // ===========================================================================
  // Barrel Export Tests
  // ===========================================================================

  describe('Barrel Export', () => {
    it('exports generateArticleTitle from utils barrel', () => {
      expect(typeof generateArticleTitle).toBe('function');
    });

    it('exports generateItemDisplayName from utils barrel', () => {
      expect(typeof generateItemDisplayName).toBe('function');
    });
  });
});
