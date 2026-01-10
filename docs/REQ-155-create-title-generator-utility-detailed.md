# REQ-155 Task 1.2: Create Title Generator Utility - Detailed Task Breakdown

**Request**: #155 - Generate Appropriate Titles Based on Item Purpose
**Phase**: 1 - Foundation
**Task ID**: 1.2 - Create Title Generator Utility
**Created**: 2026-01-09 21:17:27 CET
**Last Modified**: 2026-01-09 21:17:27 CET
**Overview Document**: `docs/REQ-155-create-title-generator-utility-overview.md`

---

## Document Purpose

This document provides a granular, step-by-step task breakdown for implementing the Title Generator Utility. Each task is designed to be <= 1 story point (a few hours of focused work) and includes verification steps.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Task 1.1 (REQ-154) is complete: `PurposeType` type and `PURPOSE_LABELS` constant exist in codebase
- [ ] `src/components/ItemCreationWorkflow/utils/constants.ts` contains `PURPOSE_LABELS`
- [ ] `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` contains `PurposeType`

---

## Authorized Files for Modification

| File | Change Type | Authorized Scope |
|------|-------------|------------------|
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | CREATE | New utility file |
| `src/components/ItemCreationWorkflow/utils/index.ts` | MODIFY | Add export statement only |
| `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts` | CREATE | New test file |

---

## Task Breakdown

### Task 1.2.1: Verify Prerequisites (Upstream Dependencies)

**Objective**: Confirm Task 1.1 dependencies are available before proceeding.

**Steps**:

1. Open `src/components/ItemCreationWorkflow/utils/constants.ts`
2. Verify `PURPOSE_LABELS` constant exists with all 7 purpose types:
   - `'how-to-use': 'How to Use'`
   - `'how-to-clean': 'How to Clean'`
   - `'troubleshooting': 'Troubleshooting'`
   - `'safety-info': 'Safety Information'`
   - `'maintenance': 'Maintenance'`
   - `'features': 'Features & Tips'`
   - `'other': 'Other'`
3. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
4. Verify `PurposeType` type exists as a union type

**Verification**:
```bash
# Search for PURPOSE_LABELS in constants.ts
grep -n "PURPOSE_LABELS" src/components/ItemCreationWorkflow/utils/constants.ts

# Search for PurposeType in types file
grep -n "PurposeType" src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts
```

**Expected Result**: Both searches return matches. If not found, Task 1.1 must be completed first.

**Completion Criteria**:
- [ ] `PURPOSE_LABELS` constant exists in `constants.ts`
- [ ] `PurposeType` type exists in `ItemCreationWorkflow.types.ts`

---

### Task 1.2.2: Create TitleGeneratorInput Interface

**Objective**: Define the input type for the title generator function.

**File**: `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`

**Steps**:

1. Create new file `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`
2. Add file header with JSDoc module documentation
3. Add import statements for `PURPOSE_LABELS` and `PurposeType`
4. Define `TitleGeneratorInput` interface with:
   - `specificItem: string` - The item name selected by user
   - `purpose: PurposeType | null` - The purpose type (nullable for fallback)

**Implementation**:

```typescript
/**
 * Title Generator Utility for ItemCreationWorkflow
 *
 * Generates article titles based on user selections during the
 * item creation workflow. Titles follow the format:
 * "[Purpose Label] - [Item Name]"
 *
 * Examples:
 * - "How to Clean - Fridge"
 * - "Troubleshooting - Dishwasher"
 * - "Safety Information - Oven"
 *
 * @module ItemCreationWorkflow/utils/titleGenerator
 * @see Plan-094-UI-UX-Workflow-Improvements.md
 * @lastModified 2026-01-09 (REQ-155 Create Title Generator Utility)
 */

import { PURPOSE_LABELS } from './constants';
import type { PurposeType } from '../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Input parameters for the title generator function.
 */
export interface TitleGeneratorInput {
  /**
   * The specific item name selected by the user.
   * Examples: "Fridge", "Washing Machine", "WiFi Router"
   */
  specificItem: string;

  /**
   * The purpose/intent category selected by the user.
   * When null, the generator returns just the item name as fallback.
   */
  purpose: PurposeType | null;
}
```

**Verification**:
```bash
# Type check the new file (will fail initially until function is added)
npx tsc --noEmit src/components/ItemCreationWorkflow/utils/titleGenerator.ts 2>&1 | head -20
```

**Completion Criteria**:
- [ ] File `titleGenerator.ts` exists in `src/components/ItemCreationWorkflow/utils/`
- [ ] `TitleGeneratorInput` interface is defined
- [ ] Import statement for `PURPOSE_LABELS` is correct
- [ ] Import statement for `PurposeType` is correct

---

### Task 1.2.3: Implement generateArticleTitle Function

**Objective**: Create the main title generation function with all business logic.

**File**: `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`

**Steps**:

1. Add `generateArticleTitle()` function after the interface definition
2. Implement title format: `"[Purpose Label] - [Item Name]"`
3. Handle all edge cases:
   - Both purpose and item present → full title
   - Purpose only (empty item) → purpose label only
   - Item only (null purpose) → item name only
   - Neither present → empty string

**Implementation** (add after `TitleGeneratorInput` interface):

```typescript
// =============================================================================
// Title Generator Function
// =============================================================================

/**
 * Generates an article title based on user selections.
 *
 * The generated title follows the format: "[Purpose Label] - [Item Name]"
 * This title represents the article/content topic, not the physical item name.
 *
 * @param input - The input parameters containing specificItem and purpose
 * @returns Generated title string
 *
 * @example
 * // With purpose selected
 * generateArticleTitle({ specificItem: "Fridge", purpose: "how-to-clean" })
 * // Returns: "How to Clean - Fridge"
 *
 * @example
 * // With different purpose
 * generateArticleTitle({ specificItem: "Oven", purpose: "troubleshooting" })
 * // Returns: "Troubleshooting - Oven"
 *
 * @example
 * // Fallback when purpose is null
 * generateArticleTitle({ specificItem: "Dishwasher", purpose: null })
 * // Returns: "Dishwasher"
 *
 * @example
 * // Empty item name edge case
 * generateArticleTitle({ specificItem: "", purpose: "how-to-use" })
 * // Returns: "How to Use"
 */
export function generateArticleTitle(input: TitleGeneratorInput): string {
  const { specificItem, purpose } = input;

  // Get the human-readable purpose label
  const purposeLabel = purpose ? PURPOSE_LABELS[purpose] : null;

  // Build the title based on available components
  if (purposeLabel && specificItem) {
    // Full format: "Purpose Label - Item Name"
    return `${purposeLabel} - ${specificItem}`;
  }

  if (purposeLabel && !specificItem) {
    // Purpose only (edge case)
    return purposeLabel;
  }

  // Fallback: return item name when no purpose selected
  return specificItem || '';
}
```

**Verification**:
```bash
# Type check the file
npx tsc --noEmit src/components/ItemCreationWorkflow/utils/titleGenerator.ts
```

**Completion Criteria**:
- [ ] `generateArticleTitle()` function is implemented
- [ ] Function handles all 4 edge cases (both, purpose only, item only, neither)
- [ ] JSDoc with examples is complete
- [ ] TypeScript compilation passes

---

### Task 1.2.4: Implement generateItemDisplayName Helper Function

**Objective**: Create a backwards-compatible helper for legacy item naming.

**File**: `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`

**Steps**:

1. Add `generateItemDisplayName()` function after `generateArticleTitle()`
2. This function generates `"[Room] - [Item]"` format for physical item names
3. Mark as `@deprecated` since it's for backwards compatibility only

**Implementation** (add after `generateArticleTitle` function):

```typescript
// =============================================================================
// Legacy/Alternative Generator (for backwards compatibility)
// =============================================================================

/**
 * Generates an item display name based on room and item.
 * This is used for the Item entity name (the physical object),
 * not the Article title.
 *
 * Format: "[Room Label] - [Item Name]"
 *
 * @param roomLabel - Human-readable room label (e.g., "Kitchen")
 * @param specificItem - The specific item name (e.g., "Fridge")
 * @returns Generated item display name
 *
 * @example
 * generateItemDisplayName("Kitchen", "Fridge")
 * // Returns: "Kitchen - Fridge"
 *
 * @example
 * generateItemDisplayName("", "Fridge")
 * // Returns: "Fridge"
 *
 * @deprecated Use generateArticleTitle for article titles.
 * This function maintains backwards compatibility with existing
 * item naming logic in SELECT_SPECIFIC_ITEM action.
 */
export function generateItemDisplayName(
  roomLabel: string,
  specificItem: string
): string {
  if (roomLabel && specificItem) {
    return `${roomLabel} - ${specificItem}`;
  }
  return specificItem || roomLabel || '';
}
```

**Verification**:
```bash
# Type check the complete file
npx tsc --noEmit src/components/ItemCreationWorkflow/utils/titleGenerator.ts
```

**Completion Criteria**:
- [ ] `generateItemDisplayName()` function is implemented
- [ ] Function marked with `@deprecated` JSDoc tag
- [ ] Function handles empty string edge cases
- [ ] TypeScript compilation passes

---

### Task 1.2.5: Export from utils/index.ts Barrel File

**Objective**: Make the title generator utilities accessible via the barrel export.

**File**: `src/components/ItemCreationWorkflow/utils/index.ts`

**Steps**:

1. Open `src/components/ItemCreationWorkflow/utils/index.ts`
2. Add a new section comment for Title Generator
3. Add export statement: `export * from './titleGenerator';`
4. Place after line 58 (after `export * from './accessibility';`)

**Implementation** (add at end of file):

```typescript

// =============================================================================
// Title Generator
// =============================================================================
/**
 * Title generation utilities for auto-generating article titles.
 * @see docs/REQ-155-create-title-generator-utility-overview.md
 */
export * from './titleGenerator';
```

**Verification**:
```bash
# Verify export works by checking if imports resolve
npx tsc --noEmit -p . 2>&1 | grep -i "titleGenerator" || echo "No errors - exports working"
```

**Completion Criteria**:
- [ ] Export statement added to `utils/index.ts`
- [ ] Section comment added for consistency
- [ ] Project compiles without errors

---

### Task 1.2.6: Create Unit Test File Structure

**Objective**: Set up the test file with imports and describe blocks.

**File**: `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

**Steps**:

1. Create new file `__tests__/titleGenerator.test.ts`
2. Add file header with JSDoc
3. Import functions to test
4. Create describe blocks for each function

**Implementation**:

```typescript
/**
 * Title Generator Utility Tests
 *
 * Tests for article title generation functions used in the
 * ItemCreationWorkflow to auto-generate titles based on purpose.
 *
 * @module ItemCreationWorkflow/utils/__tests__/titleGenerator.test
 * @see docs/REQ-155-create-title-generator-utility-overview.md
 * @lastModified 2026-01-09 (REQ-155 Create Title Generator Utility)
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
    // Tests will be added in subsequent tasks
  });

  // ===========================================================================
  // generateItemDisplayName Tests
  // ===========================================================================

  describe('generateItemDisplayName', () => {
    // Tests will be added in subsequent tasks
  });
});
```

**Verification**:
```bash
# Run the test file (should pass with empty describe blocks)
npm test -- --testPathPattern="titleGenerator.test" --passWithNoTests
```

**Completion Criteria**:
- [ ] Test file exists at correct path
- [ ] Imports are correct
- [ ] Describe blocks are set up
- [ ] Test file runs without errors

---

### Task 1.2.7: Write Tests for generateArticleTitle - Core Functionality

**Objective**: Test the main use cases for article title generation.

**File**: `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

**Steps**:

1. Add tests for basic title generation with purpose and item
2. Add tests for all 7 purpose types

**Implementation** (add inside `describe('generateArticleTitle', () => { ... })`):

```typescript
    describe('Core Functionality', () => {
      it('generates title with purpose and item', () => {
        const result = generateArticleTitle({
          specificItem: 'Fridge',
          purpose: 'how-to-clean',
        });
        expect(result).toBe('How to Clean - Fridge');
      });

      it('generates correct title for each purpose type', () => {
        const testCases: Array<{ purpose: TitleGeneratorInput['purpose']; expected: string }> = [
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
```

**Verification**:
```bash
npm test -- --testPathPattern="titleGenerator.test" --verbose
```

**Completion Criteria**:
- [ ] Core functionality tests pass
- [ ] All 7 purpose types are tested
- [ ] Test coverage for basic title format

---

### Task 1.2.8: Write Tests for generateArticleTitle - Fallback Behavior

**Objective**: Test edge cases and fallback behavior.

**File**: `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

**Steps**:

1. Add tests for null purpose (fallback to item name)
2. Add tests for empty item (fallback to purpose label)
3. Add tests for both missing (empty string)

**Implementation** (add after Core Functionality tests):

```typescript
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
```

**Verification**:
```bash
npm test -- --testPathPattern="titleGenerator.test" --verbose
```

**Completion Criteria**:
- [ ] Fallback behavior tests pass
- [ ] Null purpose handling tested
- [ ] Empty item handling tested
- [ ] Both missing handling tested

---

### Task 1.2.9: Write Tests for generateArticleTitle - Edge Cases

**Objective**: Test special characters, spaces, and unusual inputs.

**File**: `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

**Steps**:

1. Add tests for items with spaces
2. Add tests for items with special characters
3. Add tests for items with parentheses

**Implementation** (add after Fallback Behavior tests):

```typescript
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
```

**Verification**:
```bash
npm test -- --testPathPattern="titleGenerator.test" --verbose
```

**Completion Criteria**:
- [ ] Edge case tests pass
- [ ] Special characters handled correctly
- [ ] Spaces in item names preserved
- [ ] Numbers and symbols work correctly

---

### Task 1.2.10: Write Tests for generateItemDisplayName

**Objective**: Test the legacy helper function for backwards compatibility.

**File**: `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

**Steps**:

1. Add tests for basic room + item combination
2. Add tests for missing room
3. Add tests for missing item
4. Add tests for both missing

**Implementation** (add inside `describe('generateItemDisplayName', () => { ... })`):

```typescript
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
```

**Verification**:
```bash
npm test -- --testPathPattern="titleGenerator.test" --verbose
```

**Completion Criteria**:
- [ ] All generateItemDisplayName tests pass
- [ ] Room + item combination works
- [ ] Fallback for missing values works
- [ ] Empty string edge case handled

---

### Task 1.2.11: Run Full Test Suite and Type Check

**Objective**: Verify all tests pass and TypeScript compilation succeeds.

**Steps**:

1. Run the title generator tests
2. Run the full project type check
3. Run the project build to catch any issues

**Verification Commands**:

```bash
# Run title generator tests
npm test -- --testPathPattern="titleGenerator.test" --verbose

# Run all ItemCreationWorkflow tests (ensure no regressions)
npm test -- --testPathPattern="ItemCreationWorkflow" --passWithNoTests

# Type check entire project
npm run type-check

# Verify build succeeds
npm run build
```

**Completion Criteria**:
- [ ] All titleGenerator tests pass
- [ ] No TypeScript errors in project
- [ ] Build completes successfully
- [ ] No regressions in existing tests

---

### Task 1.2.12: Verify Import Accessibility

**Objective**: Confirm the title generator can be imported from the barrel export.

**Steps**:

1. Create a temporary test to verify import works
2. Verify both named exports are accessible
3. Clean up temporary test

**Verification**:

```bash
# Check exports are accessible (quick TypeScript check)
echo 'import { generateArticleTitle, generateItemDisplayName, TitleGeneratorInput } from "./src/components/ItemCreationWorkflow/utils";' > /tmp/import-test.ts
npx tsc --noEmit --esModuleInterop --moduleResolution node /tmp/import-test.ts 2>&1 && echo "Imports work correctly" || echo "Import error - check exports"
rm -f /tmp/import-test.ts
```

**Alternative Verification** (in test file):

```typescript
// Add to titleGenerator.test.ts temporarily
import {
  generateArticleTitle,
  generateItemDisplayName,
} from '../../utils'; // Import from barrel

// Verify both exports work from barrel
describe('Barrel Export', () => {
  it('exports generateArticleTitle from utils barrel', () => {
    expect(typeof generateArticleTitle).toBe('function');
  });

  it('exports generateItemDisplayName from utils barrel', () => {
    expect(typeof generateItemDisplayName).toBe('function');
  });
});
```

**Completion Criteria**:
- [ ] `generateArticleTitle` accessible from barrel export
- [ ] `generateItemDisplayName` accessible from barrel export
- [ ] `TitleGeneratorInput` type accessible from barrel export

---

## Summary Checklist

### Files Created
- [ ] `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`
- [ ] `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

### Files Modified
- [ ] `src/components/ItemCreationWorkflow/utils/index.ts` (add export)

### Functions Implemented
- [ ] `TitleGeneratorInput` interface exported
- [ ] `generateArticleTitle()` function exported
- [ ] `generateItemDisplayName()` function exported (deprecated)

### Tests Written
- [ ] Core functionality tests (7+ tests)
- [ ] Fallback behavior tests (4+ tests)
- [ ] Edge case tests (5+ tests)
- [ ] Legacy function tests (5+ tests)

### Quality Checks
- [ ] TypeScript compilation passes
- [ ] All unit tests pass
- [ ] Project build succeeds
- [ ] JSDoc documentation complete with examples
- [ ] `@lastModified` tag present in module header
- [ ] No hardcoded values (uses `PURPOSE_LABELS` constant)

---

## Acceptance Criteria (from Overview)

- [ ] `titleGenerator.ts` file exists in `src/components/ItemCreationWorkflow/utils/`
- [ ] `TitleGeneratorInput` interface is exported
- [ ] `generateArticleTitle()` function is exported
- [ ] `generateArticleTitle()` returns correct format: "[Purpose] - [Item]"
- [ ] `generateArticleTitle()` handles all 7 purpose types correctly
- [ ] `generateArticleTitle()` returns item name fallback when purpose is null
- [ ] `generateArticleTitle()` handles edge cases (empty strings, special characters)
- [ ] `generateItemDisplayName()` function is exported for backwards compatibility
- [ ] Export added to `utils/index.ts`
- [ ] Unit tests pass for all test cases
- [ ] TypeScript compilation passes without errors
- [ ] JSDoc documentation is complete with examples

---

## References

- **Overview Document**: `/docs/REQ-155-create-title-generator-utility-overview.md`
- **Implementation Plan**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Appendix B)
- **Request Document**: `/docs/gen_requests.md` - REQ-155
- **Upstream Task**: `/docs/REQ-154-update-types-and-constants-overview.md` - Task 1.1
- **Constants File**: `/src/components/ItemCreationWorkflow/utils/constants.ts`
- **Types File**: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Utils Barrel Export**: `/src/components/ItemCreationWorkflow/utils/index.ts`
- **Test Pattern Reference**: `/src/components/ItemCreationWorkflow/utils/__tests__/duplicateNameCheck.test.ts`
