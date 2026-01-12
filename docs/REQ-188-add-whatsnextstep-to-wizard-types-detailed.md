# REQ-188: Add WhatsNextStep to Wizard Step Type Definitions - Detailed Task Breakdown

**Date Created**: 2026-01-12 02:30:00
**Last Modified**: 2026-01-12 02:30:00
**Request ID**: REQ-188
**Type**: ENHANCEMENT
**Size**: XS
**Phase**: 2 - REQ-3 - Fix "What's Next" Screen
**Task ID**: 2.2
**Story Points**: Total 4 SP (5 implementation tasks)

---

## Document Purpose

This document provides a detailed, step-by-step task breakdown for REQ-188. Each task is scoped to ≤1 story point and includes verification steps. This task adds the `'whats-next'` value to the `WizardStep` union type and updates the `ProgressIndicator` component to properly exclude this step from progress counting.

---

## Summary

REQ-188 updates the wizard type system to recognize `'whats-next'` as a valid step type while ensuring this step is explicitly excluded from progress counting logic. The key requirement is that `'whats-next'` is a valid step for navigation purposes but should NOT contribute to the step count displayed in the `ProgressIndicator` component.

---

## Acceptance Criteria (from gen_requests.md)

- [ ] WizardStep union type includes 'whats-next' as a valid value
- [ ] Progress counter logic explicitly excludes 'whats-next' from step counting
- [ ] TypeScript compilation succeeds with no type errors related to 'whats-next' step
- [ ] Documentation or code comments indicate 'whats-next' is not counted in progress
- [ ] Existing workflow step counting behavior remains unchanged for all other steps

---

## Authorized Files for This Task

| File | Access Level | Purpose |
|------|--------------|---------|
| `src/components/ItemCapture/ItemCapture.types.ts` | MODIFY | Add 'whats-next' to WizardStep union type |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | MODIFY | Add 'whats-next' to STEP_TO_STAGE_INDEX, update component to hide for 'whats-next' |

---

## Pre-Requisites

| Requirement | Status | Notes |
|-------------|--------|-------|
| Task 1.1 (Update Progress Stages Constant) | Recommended | Establishes 4-stage structure referenced by this task |
| Task 2.1 (Create WhatsNextStep Component) | Optional | Component exists but type changes are independent |
| REQ-186 (Ensure Save is Final Step) | Recommended | Confirms 'review' is the final numbered step |

---

## Current State Analysis

### WizardStep Type (ItemCapture.types.ts:250-260)

```typescript
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'add-url'
  | 'edit-media'
  | 'add-more'
  | 'review';
```

**Issue**: The type does not include `'whats-next'`, meaning:
1. The state machine cannot navigate to this step without type errors
2. Components referencing this step require type workarounds
3. The `STEP_TO_STAGE_INDEX` map will fail TypeScript checks when 'whats-next' is used

### Progress Indicator Stage Mapping (ProgressIndicator.tsx:65-76)

```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'add-url': 1,         // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
};
```

**Issue**: This `Record<WizardStep, number>` type requires an entry for every `WizardStep` value. When `'whats-next'` is added to the union, it must also be added to this map.

---

## Detailed Task Breakdown

### Task 1: Add 'whats-next' to WizardStep Union Type (0.5 SP)

**File**: `src/components/ItemCapture/ItemCapture.types.ts`
**Lines**: 250-260

**Objective**: Add `'whats-next'` to the WizardStep union type with appropriate documentation comment.

**Steps**:

1. [ ] Open `src/components/ItemCapture/ItemCapture.types.ts`
2. [ ] Locate the `WizardStep` type definition (line ~250)
3. [ ] Add `'whats-next'` as a new union member after `'review'`
4. [ ] Add JSDoc comment explaining this step is not counted in progress
5. [ ] Save the file

**Code Change**:

```typescript
// BEFORE (lines 250-260):
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'add-url'
  | 'edit-media'
  | 'add-more'
  | 'review';

// AFTER:
/**
 * Wizard step identifiers for navigation state machine.
 * Note: 'whats-next' is a post-workflow step that is NOT counted in progress display.
 */
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'add-url'
  | 'edit-media'
  | 'add-more'
  | 'review'
  | 'whats-next';  // Post-workflow decision point (not counted in progress)
```

**Verification**:

- [ ] TypeScript compilation completes without errors for this file
- [ ] Existing code that uses WizardStep continues to work
- [ ] The JSDoc comment is visible in IDE intellisense

**Expected Result**: WizardStep type now includes 'whats-next' with clear documentation.

---

### Task 2: Add 'whats-next' Entry to STEP_TO_STAGE_INDEX (0.5 SP)

**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines**: 65-76

**Objective**: Add an entry for `'whats-next'` that maps to `-1` (indicating it should not be displayed in progress).

**Steps**:

1. [ ] Open `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. [ ] Locate the `STEP_TO_STAGE_INDEX` constant (line ~65)
3. [ ] Add `'whats-next': -1` entry with explanatory comment
4. [ ] Update the JSDoc for this constant to explain -1 convention
5. [ ] Save the file

**Code Change**:

```typescript
// BEFORE (lines 65-76):
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'add-url': 1,         // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
};

// AFTER:
/**
 * Maps internal wizard steps to display stage indices.
 * Used to determine which progress stage to highlight.
 * Steps with index -1 are post-workflow and hide the progress indicator.
 */
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'add-url': 1,         // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
  'whats-next': -1,     // Post-workflow: not displayed in progress indicator
};
```

**Verification**:

- [ ] TypeScript compilation completes without Record type errors
- [ ] All WizardStep values have a mapping entry
- [ ] Comment clearly explains the -1 convention

**Expected Result**: STEP_TO_STAGE_INDEX includes 'whats-next' mapped to -1.

---

### Task 3: Update ProgressIndicator to Hide for 'whats-next' Step (0.75 SP)

**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines**: 105-110

**Objective**: Update the ProgressIndicator component to return null when the current step is 'whats-next', hiding the progress indicator during post-workflow screens.

**Steps**:

1. [ ] Open `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. [ ] Locate the `ProgressIndicator` function component (line ~105)
3. [ ] Add early return condition for 'whats-next' step
4. [ ] Add JSDoc comment explaining the behavior
5. [ ] Save the file

**Code Change**:

```typescript
// BEFORE (lines 105-112):
export function ProgressIndicator({
  currentStep,
  className,
}: ProgressIndicatorProps) {
  const currentIndex = getCurrentStageIndex(currentStep);
  const totalStages = PROGRESS_STAGES.length;
  const progressPercent = ((currentIndex + 1) / totalStages) * 100;

  return (
    // ... component JSX
  );
}

// AFTER:
/**
 * ProgressIndicator displays the user's position in the wizard flow.
 *
 * Features:
 * - Mobile: Compact progress bar with step count text
 * - Desktop: Visual step indicators with checkmarks for completed stages
 * - Smooth transitions between steps
 * - Full ARIA accessibility support
 * - Hides automatically for post-workflow steps (e.g., 'whats-next')
 *
 * @example
 * ```tsx
 * <ProgressIndicator currentStep="content-type" />
 * ```
 */
export function ProgressIndicator({
  currentStep,
  className,
}: ProgressIndicatorProps) {
  // Hide progress indicator for post-workflow steps
  // These steps have index -1 in STEP_TO_STAGE_INDEX
  if (currentStep === 'whats-next') {
    return null;
  }

  const currentIndex = getCurrentStageIndex(currentStep);
  const totalStages = PROGRESS_STAGES.length;
  const progressPercent = ((currentIndex + 1) / totalStages) * 100;

  return (
    // ... existing component JSX unchanged
  );
}
```

**Verification**:

- [ ] Component returns null when currentStep is 'whats-next'
- [ ] Component renders normally for all other steps
- [ ] No visual regressions for existing steps

**Expected Result**: ProgressIndicator hides when on 'whats-next' step.

---

### Task 4: Update getCurrentStageIndex to Handle -1 Values (0.5 SP)

**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines**: 83-85

**Objective**: Update the getCurrentStageIndex function to properly document and handle steps with -1 index values.

**Steps**:

1. [ ] Open `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. [ ] Locate the `getCurrentStageIndex` function (line ~83)
3. [ ] Update JSDoc to document -1 return value meaning
4. [ ] Ensure function handles 'whats-next' correctly (returns -1)
5. [ ] Save the file

**Code Change**:

```typescript
// BEFORE (lines 78-85):
/**
 * Gets the display stage index for a given wizard step.
 * @param step - Current wizard step
 * @returns Zero-based stage index
 */
export function getCurrentStageIndex(step: WizardStep): number {
  return STEP_TO_STAGE_INDEX[step] ?? 0;
}

// AFTER:
/**
 * Gets the display stage index for a given wizard step.
 * @param step - Current wizard step
 * @returns Zero-based stage index (0-3), or -1 for post-workflow steps
 *          that should not be displayed in the progress indicator
 */
export function getCurrentStageIndex(step: WizardStep): number {
  return STEP_TO_STAGE_INDEX[step] ?? 0;
}
```

**Verification**:

- [ ] Function returns -1 for 'whats-next' step
- [ ] Function returns correct indices for all other steps
- [ ] JSDoc accurately describes return value possibilities

**Expected Result**: getCurrentStageIndex function properly documented for -1 case.

---

### Task 5: Add Unit Test for 'whats-next' Step Handling (0.75 SP)

**File**: `src/components/ItemCapture/components/shared/__tests__/ProgressIndicator.test.tsx` (create if not exists)

**Objective**: Create unit tests verifying that 'whats-next' step is handled correctly by ProgressIndicator.

**Steps**:

1. [ ] Create or open `__tests__/ProgressIndicator.test.tsx`
2. [ ] Add test case for STEP_TO_STAGE_INDEX mapping
3. [ ] Add test case for getCurrentStageIndex returning -1
4. [ ] Add test case for component returning null
5. [ ] Run tests to verify passing
6. [ ] Save the file

**Code to Add**:

```typescript
// src/components/ItemCapture/components/shared/__tests__/ProgressIndicator.test.tsx

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  ProgressIndicator,
  STEP_TO_STAGE_INDEX,
  getCurrentStageIndex,
  PROGRESS_STAGES,
} from '../ProgressIndicator';
import type { WizardStep } from '../../../ItemCapture.types';

describe('ProgressIndicator', () => {
  describe('STEP_TO_STAGE_INDEX', () => {
    it('should map whats-next to -1 (post-workflow)', () => {
      expect(STEP_TO_STAGE_INDEX['whats-next']).toBe(-1);
    });

    it('should map review to 3 (final visible stage)', () => {
      expect(STEP_TO_STAGE_INDEX['review']).toBe(3);
    });

    it('should have mappings for all WizardStep values', () => {
      const allSteps: WizardStep[] = [
        'metadata',
        'content-type',
        'capture-video',
        'capture-photo',
        'upload-file',
        'write-text',
        'add-url',
        'edit-media',
        'add-more',
        'review',
        'whats-next',
      ];

      allSteps.forEach((step) => {
        expect(STEP_TO_STAGE_INDEX[step]).toBeDefined();
      });
    });
  });

  describe('getCurrentStageIndex', () => {
    it('should return -1 for whats-next step', () => {
      expect(getCurrentStageIndex('whats-next')).toBe(-1);
    });

    it('should return 0-3 for workflow steps', () => {
      expect(getCurrentStageIndex('metadata')).toBe(0);
      expect(getCurrentStageIndex('content-type')).toBe(1);
      expect(getCurrentStageIndex('edit-media')).toBe(2);
      expect(getCurrentStageIndex('review')).toBe(3);
    });
  });

  describe('ProgressIndicator component', () => {
    it('should return null when currentStep is whats-next', () => {
      const { container } = render(
        <ProgressIndicator currentStep="whats-next" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render progress for review step', () => {
      const { container } = render(
        <ProgressIndicator currentStep="review" />
      );
      expect(container.firstChild).not.toBeNull();
    });

    it('should show Step 4 of 4 for review step on mobile', () => {
      const { getByText } = render(
        <ProgressIndicator currentStep="review" />
      );
      expect(getByText(/Step 4 of 4/)).toBeInTheDocument();
    });
  });

  describe('PROGRESS_STAGES', () => {
    it('should have exactly 4 stages', () => {
      expect(PROGRESS_STAGES.length).toBe(4);
    });

    it('should have Review as the final stage', () => {
      expect(PROGRESS_STAGES[3].id).toBe('review');
      expect(PROGRESS_STAGES[3].label).toBe('Review');
    });
  });
});
```

**Verification**:

- [ ] All tests pass with `npm test` or `vitest run`
- [ ] Test coverage includes STEP_TO_STAGE_INDEX, getCurrentStageIndex, and component
- [ ] Tests verify both the -1 mapping and component null return

**Expected Result**: Unit tests confirm 'whats-next' step handling is correct.

---

## Task Dependencies

```
Task 1 (Add to WizardStep Type)
    │
    └──► Task 2 (Add to STEP_TO_STAGE_INDEX)
              │
              ├──► Task 3 (Update ProgressIndicator to Hide)
              │
              └──► Task 4 (Update getCurrentStageIndex JSDoc)
                        │
                        └──► Task 5 (Add Unit Tests)
```

**Execution Order**:
1. Task 1 must complete first (type change enables other tasks)
2. Task 2 must complete after Task 1 (fixes TypeScript Record error)
3. Tasks 3 and 4 can run in parallel after Task 2
4. Task 5 runs after Tasks 3 and 4 complete (tests all changes)

---

## Parallel Safety Analysis

| Aspect | Value |
|--------|-------|
| Files Modified | 2 files (ItemCapture.types.ts, ProgressIndicator.tsx) |
| Conflicts With | Task 1.1 (Update Progress Stages Constant) - touches ProgressIndicator.tsx |
| Safe to Parallelize With | Phase 0 tasks (MetadataStep, ReviewStep), Phase 3 tasks (Dashboard cards), Phase 4 tasks (Navigation) |

**Conflict Resolution**: If Task 1.1 is running concurrently, coordinate changes to ProgressIndicator.tsx to avoid merge conflicts. Both tasks modify different constants in the same file.

---

## Testing Checklist

### Automated Tests

- [ ] TypeScript compilation succeeds with `npm run type-check`
- [ ] Unit tests pass with `npm test`
- [ ] Build succeeds with `npm run build`

### Manual Testing

1. [ ] Navigate through wizard to Review step - verify "Step 4 of 4" displays
2. [ ] Trigger navigation to 'whats-next' step (requires Task 2.3 integration)
3. [ ] Verify ProgressIndicator is not visible on What's Next screen
4. [ ] Verify no console errors related to WizardStep type
5. [ ] Verify step count text shows "4 of 4" not "5 of 5" on Review

### Accessibility Testing

- [ ] Screen reader announces correct step count on Review step
- [ ] No aria attributes reference 'whats-next' in progress indicator
- [ ] Focus management works correctly when transitioning to 'whats-next'

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TypeScript Record type error | High | Low | Task 2 adds mapping immediately after Task 1 |
| Breaking exhaustive switch statements | Medium | Low | Fix any type errors in other files |
| ProgressIndicator display issues | Low | Medium | Returning null is safest approach |
| Test file creation conflicts | Low | Low | Use consistent test file naming |

---

## References

- **Source Request**: `docs/gen_requests.md` - REQ-188
- **Overview Document**: `docs/REQ-188-add-whatsnextstep-to-wizard-types-overview.md`
- **Implementation Plan**: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md` (Phase 2, Task 2.2)
- **Related Tasks**:
  - Phase 1, Task 1.1: Update Progress Stages Constant (REQ-185)
  - Phase 2, Task 2.1: Create WhatsNextStep Component (REQ-187)
  - Phase 2, Task 2.3: Integrate WhatsNextStep into ItemCapture Flow (REQ-189)
  - Phase 2, Task 2.4: Ensure No Navigation Controls on WhatsNextStep (REQ-190)

---

## Component Files Referenced

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/ItemCapture.types.ts` | WizardStep type definition (lines 250-260) |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Progress display component with STEP_TO_STAGE_INDEX |
| `src/components/ItemCapture/components/shared/__tests__/ProgressIndicator.test.tsx` | Unit tests for progress indicator |

---

## Completion Checklist

- [x] Task 1: Add 'whats-next' to WizardStep Union Type
- [x] Task 2: Add 'whats-next' Entry to STEP_TO_STAGE_INDEX
- [x] Task 3: Update ProgressIndicator to Hide for 'whats-next' Step
- [x] Task 4: Update getCurrentStageIndex to Handle -1 Values
- [x] Task 5: Add Unit Test for 'whats-next' Step Handling

**Overall Status**: COMPLETED

---

## Implementation Notes

- **Verified By**: Claude Opus 4.5 (spec-implementation agent)
- **Implementation Date**: 2026-01-12 02:30:00
- **Type Check**: PASSED (pre-existing errors in unrelated files, modified files compile correctly)
- **Build**: PASSED (next build completed successfully)
- **Test Results**: PASSED (19/19 tests passed)

### Changes Made:

1. **ItemCapture.types.ts** (lines 247-262):
   - Added JSDoc note explaining 'whats-next' is not counted in progress
   - Added `'whats-next'` to WizardStep union type with inline comment

2. **ProgressIndicator.tsx**:
   - Updated STEP_TO_STAGE_INDEX JSDoc to explain -1 convention (lines 61-65)
   - Added `'whats-next': -1` mapping (line 77)
   - Updated getCurrentStageIndex JSDoc to document -1 return value (lines 80-85)
   - Added early return for 'whats-next' step to hide indicator (lines 112-116)
   - Updated component JSDoc to mention auto-hide for post-workflow steps

3. **ProgressIndicator.test.tsx** (new file):
   - Created comprehensive test suite with 19 tests
   - Tests for STEP_TO_STAGE_INDEX mappings
   - Tests for getCurrentStageIndex function
   - Tests for component rendering and hiding behavior
   - Tests for PROGRESS_STAGES constant

---

*Document generated: 2026-01-12 02:30:00*
*Last modified: 2026-01-12 02:30:00*
*Total Story Points: 4 SP*
*Task Count: 5 tasks (all completed)*
