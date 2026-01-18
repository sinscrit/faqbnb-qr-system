# REQ-155 Task 1.2: Create Title Generator Utility - Implementation Overview

**Request**: #155 - Generate Appropriate Titles Based on Item Purpose
**Phase**: 1 - Foundation
**Task ID**: 1.2 - Create Title Generator Utility
**Created**: 2026-01-09
**Last Modified**: 2026-01-09

---

## Executive Summary

This task creates a title generator utility that automatically generates contextually appropriate titles for items based on their selected purpose type. The utility will generate article-style titles in the format "[Purpose] - [Item]" (e.g., "How to Clean - Fridge"). This supports the new Article data model where content is grouped by purpose/topic under items.

---

## Scope

### In Scope
- Create `/utils/titleGenerator.ts` file in the ItemCreationWorkflow utils directory
- Implement `generateArticleTitle()` function
- Handle all purpose type combinations defined in `PURPOSE_TYPES`
- Add fallback behavior for missing purpose (returns just the item name)
- Export the utility from `utils/index.ts`
- Add comprehensive JSDoc documentation

### Out of Scope
- Updating the state machine to call the title generator (Task 1.3)
- Creating the PurposeStep component (Task 2.1)
- Database changes for the Article model (Phase 0)
- Integration with PreviewSaveStep to display generated titles (Phase 5)

---

## Technical Context

### Existing Patterns

The codebase follows established patterns for utility functions:

1. **Utility File Structure** (`utils/` directory):
   - Each utility has its own file (e.g., `sessionStorage.ts`, `duplicateNameCheck.ts`)
   - Functions exported via barrel export in `utils/index.ts`
   - Well-documented with JSDoc comments including `@lastModified` tag

2. **Constants Usage** (`constants.ts`):
   - `PURPOSE_LABELS` provides human-readable labels for each purpose type
   - Labels follow consistent capitalization (e.g., "How to Use", "How to Clean")
   - Already defined in Task 1.1

3. **Type Definitions** (`ItemCreationWorkflow.types.ts`):
   - `PurposeType` union type defines all valid purpose values
   - Already defined in Task 1.1

### Title Format Specification

From Plan-094:
- **Article Title**: "[Purpose] - [Item]" (e.g., "How to Clean - Fridge")
- **Item Name**: Just the item name (e.g., "Fridge") - unchanged
- The generated title is for the Article, not the physical Item

### Purpose Labels (from Task 1.1)

```typescript
const PURPOSE_LABELS = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};
```

---

## Implementation Details

### Task 1.2.1: Create titleGenerator.ts File

**File**: `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`

Create the new utility file:

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

// =============================================================================
// Legacy/Alternative Generator (if needed for Item names)
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

### Task 1.2.2: Export from utils/index.ts

**File**: `src/components/ItemCreationWorkflow/utils/index.ts`

Add the export for the new title generator:

```typescript
// =============================================================================
// Title Generator
// =============================================================================
/**
 * Title generation utilities for auto-generating article titles.
 */
export * from './titleGenerator';
```

Add this export after the existing exports (after line 58 in the current file).

---

## Authorized Files and Functions for Modification

| File | Section/Function | Change Type | Purpose |
|------|------------------|-------------|---------|
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | NEW FILE | CREATE | New utility file for title generation |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | `TitleGeneratorInput` | CREATE | Interface for function input parameters |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | `generateArticleTitle()` | CREATE | Main function for generating article titles |
| `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | `generateItemDisplayName()` | CREATE | Legacy helper for item display names |
| `src/components/ItemCreationWorkflow/utils/index.ts` | Exports section | ADD | Export title generator utilities |

---

## Dependencies

### Upstream Dependencies
- **Task 1.1**: Update Types and Constants - provides `PurposeType` type and `PURPOSE_LABELS` constant

### Downstream Dependencies (tasks that depend on this)
- **Task 1.3**: Update State Machine - will call `generateArticleTitle()` on purpose selection
- **Task 5.4**: Pre-populate Fields in PreviewSaveStep - uses the generated title
- **Phase 0**: Database tasks will store the generated title in `item_articles.title`

---

## Testing Strategy

### Unit Tests

Create test file: `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

```typescript
import { generateArticleTitle, generateItemDisplayName } from '../titleGenerator';

describe('titleGenerator', () => {
  describe('generateArticleTitle', () => {
    it('generates title with purpose and item', () => {
      const result = generateArticleTitle({
        specificItem: 'Fridge',
        purpose: 'how-to-clean',
      });
      expect(result).toBe('How to Clean - Fridge');
    });

    it('generates title for each purpose type', () => {
      const testCases = [
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
          purpose: purpose as any,
        });
        expect(result).toBe(expected);
      });
    });

    it('returns item name when purpose is null', () => {
      const result = generateArticleTitle({
        specificItem: 'Oven',
        purpose: null,
      });
      expect(result).toBe('Oven');
    });

    it('returns purpose label when item is empty', () => {
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
  });

  describe('generateItemDisplayName', () => {
    it('combines room and item', () => {
      const result = generateItemDisplayName('Kitchen', 'Fridge');
      expect(result).toBe('Kitchen - Fridge');
    });

    it('returns item when room is empty', () => {
      const result = generateItemDisplayName('', 'Fridge');
      expect(result).toBe('Fridge');
    });

    it('returns room when item is empty', () => {
      const result = generateItemDisplayName('Kitchen', '');
      expect(result).toBe('Kitchen');
    });
  });
});
```

### Manual Verification

1. Run `npm run type-check` or `tsc --noEmit` to verify type correctness
2. Run `npm test -- titleGenerator` to execute unit tests
3. Verify export is accessible: `import { generateArticleTitle } from '@/components/ItemCreationWorkflow/utils'`

---

## Acceptance Criteria

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

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PURPOSE_LABELS not available (Task 1.1 incomplete) | Low | High | Verify Task 1.1 is complete before starting |
| Title format change requested later | Medium | Low | Format is configurable; can add options parameter if needed |
| Special characters in item names | Low | Low | Test with various special characters |
| Internationalization needs | Medium | Medium | Labels in constants.ts can be swapped for i18n keys later |

---

## Implementation Order

1. Verify Task 1.1 is complete (`PURPOSE_LABELS` exists in constants.ts)
2. Create `titleGenerator.ts` file
3. Implement `TitleGeneratorInput` interface
4. Implement `generateArticleTitle()` function
5. Implement `generateItemDisplayName()` for backwards compatibility
6. Add export to `utils/index.ts`
7. Create unit test file
8. Run type check and tests
9. Verify import works from consuming code

---

## Code Quality Checklist

- [ ] Functions have comprehensive JSDoc comments
- [ ] All parameters and return types are documented
- [ ] Examples provided in JSDoc
- [ ] `@lastModified` tag included in module header
- [ ] No hardcoded purpose labels (uses `PURPOSE_LABELS` constant)
- [ ] Edge cases handled (null, empty string)
- [ ] Pure function with no side effects
- [ ] Unit tests cover all code paths

---

## References

- **Implementation Plan**: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Appendix B)
- **Request Document**: `/docs/gen_requests.md` - REQ-155
- **Upstream Task**: `/docs/REQ-154-update-types-and-constants-overview.md` - Task 1.1
- **Constants File**: `/src/components/ItemCreationWorkflow/utils/constants.ts`
- **Types File**: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Utils Barrel Export**: `/src/components/ItemCreationWorkflow/utils/index.ts`
