/**
 * Duplicate Name Check Utility Tests
 *
 * Tests for duplicate name detection functions used to warn users
 * when creating items with similar or identical names.
 *
 * @module ItemCreationWorkflow/utils/__tests__/duplicateNameCheck.test
 * @lastModified 2026-01-05
 */

import {
  checkDuplicateName,
  hasExactDuplicate,
  suggestUniqueName,
} from '../duplicateNameCheck';

describe('duplicateNameCheck', () => {
  // ===========================================================================
  // checkDuplicateName Tests
  // ===========================================================================

  describe('checkDuplicateName', () => {
    describe('Exact Matches', () => {
      it('detects exact case-insensitive match', () => {
        const result = checkDuplicateName('Kitchen - Stove', ['kitchen - stove']);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('exact');
        expect(result.matchingNames).toContain('kitchen - stove');
      });

      it('detects exact match with different casing', () => {
        const result = checkDuplicateName('KITCHEN - STOVE', ['Kitchen - Stove']);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('exact');
      });

      it('trims whitespace for exact match', () => {
        const result = checkDuplicateName('  Kitchen - Stove  ', ['Kitchen - Stove']);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('exact');
      });

      it('normalizes multiple spaces', () => {
        const result = checkDuplicateName('Kitchen  -  Stove', ['Kitchen - Stove']);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('exact');
      });
    });

    describe('Similar Matches', () => {
      it('detects numbered variants as similar', () => {
        const result = checkDuplicateName('Kitchen - Stove 2', ['Kitchen - Stove']);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('similar');
        expect(result.matchingNames).toContain('Kitchen - Stove');
      });

      it('detects parenthetical numbered variants as similar', () => {
        const result = checkDuplicateName('Kitchen - Stove (2)', ['Kitchen - Stove']);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('similar');
      });

      it('detects when one name contains the other', () => {
        const result = checkDuplicateName('Kitchen - Stove Instructions', [
          'Kitchen - Stove',
        ]);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('similar');
      });

      it('detects common prefix matches for long names', () => {
        const result = checkDuplicateName(
          'Living Room - Television Remote Control',
          ['Living Room - Television Remote Guide']
        );

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('similar');
      });
    });

    describe('No Match', () => {
      it('returns no match for completely different names', () => {
        const result = checkDuplicateName('Kitchen - Stove', ['Bathroom - Sink']);

        expect(result.isDuplicate).toBe(false);
        expect(result.matchType).toBe('none');
        expect(result.matchingNames).toHaveLength(0);
      });

      it('returns no match for empty name', () => {
        const result = checkDuplicateName('', ['Kitchen - Stove']);

        expect(result.isDuplicate).toBe(false);
        expect(result.matchType).toBe('none');
      });

      it('returns no match for whitespace-only name', () => {
        const result = checkDuplicateName('   ', ['Kitchen - Stove']);

        expect(result.isDuplicate).toBe(false);
        expect(result.matchType).toBe('none');
      });

      it('returns no match for empty existing names array', () => {
        const result = checkDuplicateName('Kitchen - Stove', []);

        expect(result.isDuplicate).toBe(false);
        expect(result.matchType).toBe('none');
      });

      it('returns no match for short non-matching names', () => {
        const result = checkDuplicateName('TV', ['AC']);

        expect(result.isDuplicate).toBe(false);
        expect(result.matchType).toBe('none');
      });
    });

    describe('Priority', () => {
      it('prioritizes exact matches over similar matches', () => {
        const result = checkDuplicateName('Kitchen - Stove', [
          'Kitchen - Stove', // exact
          'Kitchen - Stove 2', // similar (would match as numbered variant)
        ]);

        expect(result.matchType).toBe('exact');
        expect(result.matchingNames).toContain('Kitchen - Stove');
      });
    });

    describe('Edge Cases', () => {
      it('handles null in existing names array', () => {
        const result = checkDuplicateName('Kitchen - Stove', [
          null as unknown as string,
          'Kitchen - Stove',
        ]);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('exact');
      });

      it('handles undefined in existing names array', () => {
        const result = checkDuplicateName('Kitchen - Stove', [
          undefined as unknown as string,
          'Kitchen - Stove',
        ]);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('exact');
      });

      it('handles empty strings in existing names array', () => {
        const result = checkDuplicateName('Kitchen - Stove', [
          '',
          '   ',
          'Kitchen - Stove',
        ]);

        expect(result.isDuplicate).toBe(true);
        expect(result.matchType).toBe('exact');
      });
    });
  });

  // ===========================================================================
  // hasExactDuplicate Tests
  // ===========================================================================

  describe('hasExactDuplicate', () => {
    it('returns true for exact match', () => {
      const result = hasExactDuplicate('Kitchen - Stove', ['Kitchen - Stove']);

      expect(result).toBe(true);
    });

    it('returns true for case-insensitive match', () => {
      const result = hasExactDuplicate('KITCHEN - STOVE', ['kitchen - stove']);

      expect(result).toBe(true);
    });

    it('returns false for similar but not exact match', () => {
      const result = hasExactDuplicate('Kitchen - Stove 2', ['Kitchen - Stove']);

      expect(result).toBe(false);
    });

    it('returns false for empty name', () => {
      const result = hasExactDuplicate('', ['Kitchen - Stove']);

      expect(result).toBe(false);
    });

    it('returns false for empty existing names', () => {
      const result = hasExactDuplicate('Kitchen - Stove', []);

      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // suggestUniqueName Tests
  // ===========================================================================

  describe('suggestUniqueName', () => {
    it('returns original name if no duplicate exists', () => {
      const result = suggestUniqueName('Kitchen - Stove', ['Bathroom - Sink']);

      expect(result).toBe('Kitchen - Stove');
    });

    it('appends 2 for first duplicate', () => {
      const result = suggestUniqueName('Kitchen - Stove', ['Kitchen - Stove']);

      expect(result).toBe('Kitchen - Stove 2');
    });

    it('appends 3 when 2 already exists', () => {
      const result = suggestUniqueName('Kitchen - Stove', [
        'Kitchen - Stove',
        'Kitchen - Stove 2',
      ]);

      expect(result).toBe('Kitchen - Stove 3');
    });

    it('finds next available number with gaps', () => {
      const result = suggestUniqueName('Kitchen - Stove', [
        'Kitchen - Stove',
        'Kitchen - Stove 2',
        'Kitchen - Stove 3',
        'Kitchen - Stove 5', // Gap at 4
      ]);

      expect(result).toBe('Kitchen - Stove 4');
    });

    it('trims input name', () => {
      const result = suggestUniqueName('  Kitchen - Stove  ', ['Kitchen - Stove']);

      expect(result).toBe('Kitchen - Stove 2');
    });

    it('returns empty string for empty input', () => {
      const result = suggestUniqueName('', ['Kitchen - Stove']);

      expect(result).toBe('');
    });

    it('returns whitespace-only input as-is', () => {
      const result = suggestUniqueName('   ', ['Kitchen - Stove']);

      expect(result).toBe('   ');
    });

    it('handles case-insensitive duplicates', () => {
      const result = suggestUniqueName('kitchen - stove', ['KITCHEN - STOVE']);

      expect(result).toBe('kitchen - stove 2');
    });
  });
});
