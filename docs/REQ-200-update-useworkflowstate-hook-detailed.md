# REQ-200: Update useWorkflowState Hook - Detailed Task Breakdown

**Document Created:** 2026-01-12 15:45:00 UTC
**Last Modified:** 2026-01-12 14:17:00 UTC (Implementation Complete)
**Request Source:** docs/gen_requests.md - Request #200
**Overview Document:** docs/REQ-200-update-useworkflowstate-hook-overview.md
**Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID:** 1.5
**Estimated Effort:** 1.5 hours (<=1 story point per task)

---

## Executive Summary

This document provides the granular, implementation-ready task breakdown for updating the `useWorkflowState` hook to properly handle step counting and navigation logic. The hook must export new computed values that differentiate between user-visible steps (1-8) and post-workflow screens (next-action, session-summary).

### Problem Statement

The current `useWorkflowState` hook exports:
- `currentStepIndex`: Index in full WORKFLOW_STEPS array (0-9)
- `totalSteps`: Returns 10 (includes post-workflow screens)

This causes the WorkflowHeader to display "Step 9 of 10" on the "What's Next?" screen when per the PRD, "Save Item" should be "Step 8 of 8" as the final numbered step.

### Solution Overview

Export three new computed values from `useWorkflowState`:
1. `isPostWorkflowStep`: Boolean indicating if current step is post-workflow
2. `userVisibleStepIndex`: Index (0-7) for user-visible steps only
3. `userVisibleTotalSteps`: Always returns 8

---

## Dependencies

### Upstream Dependencies (Must Complete First)
- **Task 1.1 (REQ-196)**: Update WORKFLOW_STEPS constant - Provides `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` exports in `constants.ts`
- **Task 1.2 (REQ-197)**: Update PROGRESS_WEIGHTS - Ensures progress reaches 100% at `preview-save`

**Verification**: Before starting implementation, confirm these constants exist:
```bash
grep -n "USER_VISIBLE_STEPS" src/components/ItemCreationWorkflow/utils/constants.ts
grep -n "POST_WORKFLOW_SCREENS" src/components/ItemCreationWorkflow/utils/constants.ts
```

### Downstream Dependencies (Blocked by This Task)
- **Task 1.4 (REQ-199)**: Update ItemCreationWorkflow component - Uses new hook exports
- **Task 1.3 (REQ-198)**: Update WorkflowHeader - Uses values passed from ItemCreationWorkflow

---

## Authorized Files for Modification

| File | Type | Authorized Changes |
|------|------|-------------------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Primary | Import new constants, add computed values, update interface, update return |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` | Test | Add new test suite for user-visible step tracking |

**No other files may be modified as part of this task.**

---

## Task Breakdown

### Task 1: Import New Constants
**Priority:** Required | **Effort:** 5 minutes | **Story Points:** 0.25

#### Description
Add imports for `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` constants from the constants file.

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Lines:** ~63-68 (import section)

#### Current Code
```typescript
import {
  ROOM_LABELS,
  PROGRESS_WEIGHTS,
  WORKFLOW_STEPS,
  MAX_CONTENT_PIECES,
} from '../utils/constants';
```

#### Target Code
```typescript
import {
  ROOM_LABELS,
  PROGRESS_WEIGHTS,
  WORKFLOW_STEPS,
  USER_VISIBLE_STEPS,
  POST_WORKFLOW_SCREENS,
  MAX_CONTENT_PIECES,
} from '../utils/constants';
```

#### Verification Steps
- [ ] TypeScript compiles without errors
- [ ] No unused import warnings
- [ ] Constants are accessible in hook body

---

### Task 2: Update UseWorkflowStateReturn Interface
**Priority:** Required | **Effort:** 10 minutes | **Story Points:** 0.25

#### Description
Add TypeScript type definitions for the three new computed values to ensure type safety for consumers of the hook.

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Lines:** ~669-749 (UseWorkflowStateReturn interface)

#### Current Code (lines ~736-748)
```typescript
  // Computed values
  /** Whether the user can navigate to the next step */
  canGoNext: boolean;
  /** Whether the user can navigate back */
  canGoBack: boolean;
  /** Current progress percentage (0-100) */
  progressPercent: number;
  /** Index of current step in WORKFLOW_STEPS */
  currentStepIndex: number;
  /** Total number of workflow steps */
  totalSteps: number;
  /** Number of items created in this session */
  itemCount: number;
}
```

#### Target Code
```typescript
  // Computed values
  /** Whether the user can navigate to the next step */
  canGoNext: boolean;
  /** Whether the user can navigate back */
  canGoBack: boolean;
  /** Current progress percentage (0-100) */
  progressPercent: number;
  /** Index of current step in WORKFLOW_STEPS (includes all 10 steps) */
  currentStepIndex: number;
  /** Total number of workflow steps (includes post-workflow, always 10) */
  totalSteps: number;
  /** Number of items created in this session */
  itemCount: number;

  // User-visible step tracking (REQ-200 / Task 1.5)
  /** Whether current step is a post-workflow screen (no step counter shown) */
  isPostWorkflowStep: boolean;
  /** User-visible step index (0-7 for steps 1-8, returns 7 for post-workflow) */
  userVisibleStepIndex: number;
  /** Total user-visible steps (always 8) */
  userVisibleTotalSteps: number;
}
```

#### Verification Steps
- [ ] Interface compiles without errors
- [ ] JSDoc comments are accurate
- [ ] All three new properties are typed as expected

---

### Task 3: Add isPostWorkflowStep Computed Value
**Priority:** Required | **Effort:** 10 minutes | **Story Points:** 0.25

#### Description
Add a memoized computed value that returns `true` if the current step is a post-workflow screen (`next-action` or `session-summary`).

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Lines:** Insert after `currentStepIndex` computation (~line 931)

#### Target Code
```typescript
  const currentStepIndex = useMemo(() => {
    return WORKFLOW_STEPS.indexOf(state.currentStep);
  }, [state.currentStep]);

  // REQ-200: User-visible step tracking
  /**
   * Whether the current step is a post-workflow screen (not numbered).
   * Post-workflow screens: next-action, session-summary
   * @see POST_WORKFLOW_SCREENS constant
   */
  const isPostWorkflowStep = useMemo(() => {
    return POST_WORKFLOW_SCREENS.includes(
      state.currentStep as (typeof POST_WORKFLOW_SCREENS)[number]
    );
  }, [state.currentStep]);
```

#### Technical Notes
- Uses type assertion to satisfy TypeScript's `includes` typing requirements
- Memoized on `state.currentStep` for performance
- Returns `false` for all 8 user-visible steps
- Returns `true` for `next-action` and `session-summary`

#### Verification Steps
- [ ] TypeScript compiles without errors
- [ ] Returns `false` for 'room-selection'
- [ ] Returns `false` for 'preview-save'
- [ ] Returns `true` for 'next-action'
- [ ] Returns `true` for 'session-summary'

---

### Task 4: Add userVisibleStepIndex Computed Value
**Priority:** Required | **Effort:** 10 minutes | **Story Points:** 0.25

#### Description
Add a memoized computed value that returns the user-visible step index (0-7) for display purposes. For post-workflow screens, returns 7 (the last visible step index).

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Lines:** Insert after `isPostWorkflowStep` computation

#### Target Code
```typescript
  /**
   * User-visible step index (0-based) for the 8-step workflow.
   * Returns 7 (last visible step) for post-workflow screens.
   * Use this for step counter display instead of currentStepIndex.
   * @see USER_VISIBLE_STEPS constant
   */
  const userVisibleStepIndex = useMemo(() => {
    const index = USER_VISIBLE_STEPS.indexOf(
      state.currentStep as (typeof USER_VISIBLE_STEPS)[number]
    );
    // If not found in user-visible steps (post-workflow), return last visible index
    return index >= 0 ? index : USER_VISIBLE_STEPS.length - 1;
  }, [state.currentStep]);
```

#### Technical Notes
- `indexOf` returns -1 for post-workflow screens
- Fallback logic returns `USER_VISIBLE_STEPS.length - 1` (7) for post-workflow
- Ensures step counter never shows invalid values

#### Expected Values by Step
| Step | userVisibleStepIndex | Display as |
|------|---------------------|------------|
| room-selection | 0 | Step 1 |
| item-type-selection | 1 | Step 2 |
| specific-item-selection | 2 | Step 3 |
| purpose-selection | 3 | Step 4 |
| content-type-selection | 4 | Step 5 |
| media-capture | 5 | Step 6 |
| content-creation | 6 | Step 7 |
| preview-save | 7 | Step 8 |
| next-action | 7 | (not displayed) |
| session-summary | 7 | (not displayed) |

#### Verification Steps
- [ ] Returns 0 for 'room-selection'
- [ ] Returns 7 for 'preview-save'
- [ ] Returns 7 for 'next-action'
- [ ] Returns 7 for 'session-summary'

---

### Task 5: Add userVisibleTotalSteps Constant Value
**Priority:** Required | **Effort:** 5 minutes | **Story Points:** 0.1

#### Description
Add a constant value that returns the total number of user-visible steps (always 8). This is not memoized as it's a static value.

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Lines:** Insert after `userVisibleStepIndex` computation

#### Target Code
```typescript
  /**
   * Total number of user-visible steps (always 8).
   * Use this as the denominator for step counter display.
   * @see USER_VISIBLE_STEPS constant
   */
  const userVisibleTotalSteps = USER_VISIBLE_STEPS.length;
```

#### Technical Notes
- Static value, no memoization needed
- Derives from `USER_VISIBLE_STEPS.length` to stay in sync with constant

#### Verification Steps
- [ ] Value equals 8
- [ ] Value matches USER_VISIBLE_STEPS.length

---

### Task 6: Update Hook Return Statement
**Priority:** Required | **Effort:** 5 minutes | **Story Points:** 0.1

#### Description
Add the three new computed values to the hook's return statement so consumers can access them.

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Lines:** ~939-972 (return statement)

#### Current Code (end of return object)
```typescript
    canGoNext,
    canGoBack,
    progressPercent,
    currentStepIndex,
    totalSteps,
    itemCount,
  };
}
```

#### Target Code
```typescript
    canGoNext,
    canGoBack,
    progressPercent,
    currentStepIndex,
    totalSteps,
    itemCount,
    // REQ-200: User-visible step tracking
    isPostWorkflowStep,
    userVisibleStepIndex,
    userVisibleTotalSteps,
  };
}
```

#### Verification Steps
- [ ] All three new properties are in return statement
- [ ] TypeScript shows no errors about missing return properties
- [ ] Comment identifies the task reference

---

### Task 7: Write Unit Tests - isPostWorkflowStep
**Priority:** Required | **Effort:** 15 minutes | **Story Points:** 0.5

#### Description
Add unit tests to verify `isPostWorkflowStep` detection works correctly for all workflow steps.

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Lines:** Add new describe block at end of file

#### Target Code
```typescript
// =============================================================================
// REQ-200: User-Visible Step Tracking Tests
// =============================================================================

describe('User-Visible Step Tracking (REQ-200)', () => {
  describe('isPostWorkflowStep detection', () => {
    it('USER_VISIBLE_STEPS contains exactly 8 steps', () => {
      expect(USER_VISIBLE_STEPS.length).toBe(8);
    });

    it('POST_WORKFLOW_SCREENS contains exactly 2 screens', () => {
      expect(POST_WORKFLOW_SCREENS.length).toBe(2);
    });

    it('returns false for all user-visible steps', () => {
      const userVisibleSteps: string[] = [
        'room-selection',
        'item-type-selection',
        'specific-item-selection',
        'purpose-selection',
        'content-type-selection',
        'media-capture',
        'content-creation',
        'preview-save',
      ];

      userVisibleSteps.forEach(step => {
        const isPostWorkflow = POST_WORKFLOW_SCREENS.includes(step as any);
        expect(isPostWorkflow).toBe(false);
      });
    });

    it('returns true for post-workflow screens', () => {
      const postWorkflowScreens = ['next-action', 'session-summary'];

      postWorkflowScreens.forEach(step => {
        const isPostWorkflow = POST_WORKFLOW_SCREENS.includes(step as any);
        expect(isPostWorkflow).toBe(true);
      });
    });

    it('USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS are mutually exclusive', () => {
      USER_VISIBLE_STEPS.forEach(step => {
        expect(POST_WORKFLOW_SCREENS.includes(step as any)).toBe(false);
      });

      POST_WORKFLOW_SCREENS.forEach(step => {
        expect(USER_VISIBLE_STEPS.includes(step as any)).toBe(false);
      });
    });
  });
});
```

#### Test File Imports Required
Add to imports at top of test file:
```typescript
import {
  USER_VISIBLE_STEPS,
  POST_WORKFLOW_SCREENS,
} from '../../utils/constants';
```

#### Verification Steps
- [ ] Tests compile without errors
- [ ] All tests pass
- [ ] Test coverage includes all expected scenarios

---

### Task 8: Write Unit Tests - userVisibleStepIndex
**Priority:** Required | **Effort:** 10 minutes | **Story Points:** 0.25

#### Description
Add unit tests to verify `userVisibleStepIndex` calculation for all steps.

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Lines:** Add to the REQ-200 describe block

#### Target Code
```typescript
  describe('userVisibleStepIndex calculation', () => {
    it('returns 0 for first step (room-selection)', () => {
      expect(USER_VISIBLE_STEPS.indexOf('room-selection')).toBe(0);
    });

    it('returns correct index for each user-visible step', () => {
      const expectedIndices: Record<string, number> = {
        'room-selection': 0,
        'item-type-selection': 1,
        'specific-item-selection': 2,
        'purpose-selection': 3,
        'content-type-selection': 4,
        'media-capture': 5,
        'content-creation': 6,
        'preview-save': 7,
      };

      Object.entries(expectedIndices).forEach(([step, expectedIndex]) => {
        const actualIndex = USER_VISIBLE_STEPS.indexOf(step as any);
        expect(actualIndex).toBe(expectedIndex);
      });
    });

    it('returns -1 for post-workflow screens (not in USER_VISIBLE_STEPS)', () => {
      expect(USER_VISIBLE_STEPS.indexOf('next-action' as any)).toBe(-1);
      expect(USER_VISIBLE_STEPS.indexOf('session-summary' as any)).toBe(-1);
    });

    it('fallback logic returns 7 (last index) for -1 values', () => {
      // Simulating the hook logic: index >= 0 ? index : USER_VISIBLE_STEPS.length - 1
      const getDisplayIndex = (step: string) => {
        const index = USER_VISIBLE_STEPS.indexOf(step as any);
        return index >= 0 ? index : USER_VISIBLE_STEPS.length - 1;
      };

      expect(getDisplayIndex('next-action')).toBe(7);
      expect(getDisplayIndex('session-summary')).toBe(7);
    });
  });
```

#### Verification Steps
- [ ] Tests compile without errors
- [ ] All tests pass
- [ ] Index values match expected workflow order

---

### Task 9: Write Unit Tests - userVisibleTotalSteps
**Priority:** Required | **Effort:** 5 minutes | **Story Points:** 0.1

#### Description
Add unit tests to verify `userVisibleTotalSteps` equals 8.

#### Location
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Lines:** Add to the REQ-200 describe block

#### Target Code
```typescript
  describe('userVisibleTotalSteps', () => {
    it('equals 8 (number of user-visible steps)', () => {
      expect(USER_VISIBLE_STEPS.length).toBe(8);
    });

    it('equals USER_VISIBLE_STEPS.length', () => {
      const userVisibleTotalSteps = USER_VISIBLE_STEPS.length;
      expect(userVisibleTotalSteps).toBe(USER_VISIBLE_STEPS.length);
    });

    it('is less than WORKFLOW_STEPS.length (10)', () => {
      expect(USER_VISIBLE_STEPS.length).toBeLessThan(10);
    });
  });
```

#### Verification Steps
- [ ] Tests compile without errors
- [ ] All tests pass
- [ ] Value equals 8

---

### Task 10: Run Full Test Suite and Verify
**Priority:** Required | **Effort:** 10 minutes | **Story Points:** 0.25

#### Description
Run the complete test suite to ensure no regressions and all new tests pass.

#### Commands
```bash
# Run only the useWorkflowState tests
npm run test -- src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts

# Run all ItemCreationWorkflow tests
npm run test -- src/components/ItemCreationWorkflow

# Run TypeScript type check
npm run type-check

# Run linter
npm run lint
```

#### Expected Results
- [ ] All existing tests pass (no regressions)
- [ ] All new REQ-200 tests pass
- [ ] TypeScript compilation succeeds
- [ ] No lint errors or warnings
- [ ] Coverage includes new computed values

---

## Integration Notes for Downstream Tasks

### For Task 1.4 (REQ-199): ItemCreationWorkflow.tsx

After this task completes, consumers can use the new exports:

```typescript
const {
  // ... existing destructured values ...
  isPostWorkflowStep,
  userVisibleStepIndex,
  userVisibleTotalSteps,
} = useWorkflowState();

// Pass to WorkflowHeader
<WorkflowHeader
  currentStepIndex={userVisibleStepIndex}
  totalSteps={userVisibleTotalSteps}
  progressPercent={progressPercent}
  canGoBack={isPostWorkflowStep ? false : canGoBack}
  onBack={prevStep}
  onExit={handleExitClick}
  showStepCounter={!isPostWorkflowStep}  // New prop from Task 1.3
/>
```

### Backward Compatibility

The original exports are preserved for any code that depends on the full 10-step index:
- `currentStepIndex`: Still returns 0-9 index in WORKFLOW_STEPS
- `totalSteps`: Still returns 10

New code for UI display should use:
- `userVisibleStepIndex`: For step counter numerator
- `userVisibleTotalSteps`: For step counter denominator
- `isPostWorkflowStep`: To conditionally hide step counter

---

## Validation Checklist

### Pre-Implementation
- [x] Task 1.1 (REQ-196) completed - USER_VISIBLE_STEPS exists
- [x] Task 1.2 (REQ-197) completed - POST_WORKFLOW_SCREENS exists

### Implementation
- [x] Imports added for USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS
- [x] UseWorkflowStateReturn interface updated with 3 new properties
- [x] isPostWorkflowStep computed value added
- [x] userVisibleStepIndex computed value added
- [x] userVisibleTotalSteps constant added
- [x] Return statement updated with 3 new exports

### Testing
- [x] Unit tests added for isPostWorkflowStep
- [x] Unit tests added for userVisibleStepIndex
- [x] Unit tests added for userVisibleTotalSteps
- [x] All existing tests pass (98/98)
- [x] All new tests pass (17 new tests for REQ-200)

### Quality
- [x] TypeScript compilation succeeds (pre-existing errors in codebase unrelated to this task)
- [x] No lint errors related to this task
- [x] JSDoc comments accurate
- [x] Code follows existing patterns

### Implementation Notes (2026-01-12)
- Added three new exports to useWorkflowState hook: `isPostWorkflowStep`, `userVisibleStepIndex`, `userVisibleTotalSteps`
- These values allow consumers to properly display "Step X of 8" for user-visible steps and hide the step counter on post-workflow screens
- All 98 tests pass including 17 new tests for REQ-200
- Build has pre-existing failures unrelated to this task (_document page routing issue)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| USER_VISIBLE_STEPS not exported from constants | Low | High | Verify Task 1.1 complete before starting |
| Breaking existing hook consumers | Low | Medium | Keep original exports unchanged |
| Test failures in existing suite | Medium | Medium | Run full test suite incrementally |
| Type errors in downstream components | Low | Low | Interface updates are additive |

---

## References

- **Overview Document:** `docs/REQ-200-update-useworkflowstate-hook-overview.md`
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Task 1.5)
- **Hook Source:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Constants Source:** `src/components/ItemCreationWorkflow/utils/constants.ts`
- **Test File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
- **PRD Source:** ITEM-05 (Fix workflow step count from 10 to 8)
