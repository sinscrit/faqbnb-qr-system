# REQ-196: Update WORKFLOW_STEPS Constant - Detailed Task Breakdown

**Document Created**: 2026-01-12 22:15 UTC
**Last Modified**: 2026-01-12 13:42 UTC
**Implementation Status**: COMPLETED
**Request ID**: REQ-196
**Phase**: 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID**: 1.1
**Title**: Update WORKFLOW_STEPS constant
**Overview Document**: docs/REQ-196-update-workflowsteps-constant-overview.md
**Implementation Plan Reference**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for separating user-visible workflow steps from internal navigation steps in the ItemCreationWorkflow constants. The goal is to display an 8-step workflow to users (steps 1-8) while preserving internal navigation to post-workflow screens (next-action and session-summary) that should not be numbered.

---

## Authorized Files for Modification

| File Path | Change Type | Scope |
|-----------|-------------|-------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Add + Modify | Lines 449-506 (WORKFLOW_STEPS, PROGRESS_WEIGHTS sections) |

### Files NOT to Modify in This Task
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` → Task 1.5
- `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` → Task 1.3
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` → Task 1.4

---

## Pre-Implementation Checklist

- [x] Verify current `WORKFLOW_STEPS` has 10 items (lines 450-461) ✅ Verified
- [x] Verify current `PROGRESS_WEIGHTS` has `preview-save: 75` (line 503) ✅ Verified
- [x] Verify `WorkflowStepConst` type is derived from `WORKFLOW_STEPS` ✅ Verified
- [x] Confirm no other files in this task depend on constants.ts exports ✅ Verified

---

## Task Breakdown

### Task 1.1.1: Create USER_VISIBLE_STEPS Constant

**Story Points**: 0.5
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Insert after line 448 (before current WORKFLOW_STEPS)

#### Implementation Steps

1. **Add USER_VISIBLE_STEPS constant array**
   - Insert a new `const` block after the text truncation section (after line 448)
   - Include exactly 8 workflow steps that should be numbered
   - Use `as const` assertion for literal type preservation
   - Steps: room-selection, item-type-selection, specific-item-selection, purpose-selection, content-type-selection, media-capture, content-creation, preview-save

2. **Add JSDoc documentation**
   - Document the purpose: "User-visible workflow steps for progress indicator"
   - Note that steps 1-8 are numbered
   - Note that post-workflow screens are not counted
   - Include `@lastModified` tag with date

3. **Add UserVisibleStepConst type**
   - Derive type from `USER_VISIBLE_STEPS` using `typeof` pattern
   - Follow existing pattern: `export type UserVisibleStepConst = (typeof USER_VISIBLE_STEPS)[number];`

#### Code Template

```typescript
// =============================================================================
// Workflow Step Separation (REQ-196)
// =============================================================================

/**
 * User-visible workflow steps (for progress indicator).
 * Steps 1-8 are numbered; post-workflow screens are not counted.
 *
 * Step Flow:
 * 1. room-selection        → Select room category
 * 2. item-type-selection   → Select item type (skips if 'general' room)
 * 3. specific-item-selection → Name the specific item
 * 4. purpose-selection     → Select content purpose
 * 5. content-type-selection → Select content format
 * 6. media-capture         → Direct media capture routing
 * 7. content-creation      → Create/upload content (when used)
 * 8. preview-save          → Preview with content, final step
 *
 * @see POST_WORKFLOW_SCREENS for screens after workflow completion
 * @see WORKFLOW_STEPS for complete navigation flow
 * @created 2026-01-12 (REQ-196 Step Count Fix)
 */
export const USER_VISIBLE_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'content-creation',         // Step 7 (when used)
  'preview-save',             // Step 8 - FINAL user-visible step
] as const;

/**
 * Type for user-visible step values derived from USER_VISIBLE_STEPS constant.
 */
export type UserVisibleStepConst = (typeof USER_VISIBLE_STEPS)[number];
```

#### Verification Steps

- [ ] `USER_VISIBLE_STEPS.length` equals 8
- [ ] All step names match existing step names in current `WORKFLOW_STEPS`
- [ ] `UserVisibleStepConst` type is correctly inferred by TypeScript
- [ ] No TypeScript compilation errors
- [ ] Step order matches the existing workflow order

---

### Task 1.1.2: Create POST_WORKFLOW_SCREENS Constant

**Story Points**: 0.25
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Insert after USER_VISIBLE_STEPS definition

#### Implementation Steps

1. **Add POST_WORKFLOW_SCREENS constant array**
   - Include exactly 2 screens that should not be numbered
   - Use `as const` assertion
   - Screens: next-action, session-summary

2. **Add JSDoc documentation**
   - Document that these screens are shown after workflow completion
   - Note that no step counter is displayed on these screens
   - Include `@lastModified` tag

3. **Add PostWorkflowScreenConst type**
   - Derive type using same pattern as UserVisibleStepConst

#### Code Template

```typescript
/**
 * Post-workflow screens (no step counter shown).
 * These screens appear after the main workflow is complete.
 * The progress bar should show 100% on these screens.
 *
 * - next-action: User decides what to do next
 * - session-summary: Review all items in session
 *
 * @see USER_VISIBLE_STEPS for numbered workflow steps
 * @created 2026-01-12 (REQ-196 Step Count Fix)
 */
export const POST_WORKFLOW_SCREENS = [
  'next-action',
  'session-summary',
] as const;

/**
 * Type for post-workflow screen values derived from POST_WORKFLOW_SCREENS constant.
 */
export type PostWorkflowScreenConst = (typeof POST_WORKFLOW_SCREENS)[number];
```

#### Verification Steps

- [ ] `POST_WORKFLOW_SCREENS.length` equals 2
- [ ] Step names match 'next-action' and 'session-summary' exactly
- [ ] `PostWorkflowScreenConst` type is correctly inferred
- [ ] No TypeScript compilation errors

---

### Task 1.1.3: Update WORKFLOW_STEPS to Use Spread Syntax

**Story Points**: 0.5
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Lines 450-461 (current WORKFLOW_STEPS definition)

#### Implementation Steps

1. **Replace hardcoded array with spread of both constants**
   - Remove the existing inline array definition
   - Use spread operator to combine USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS
   - Maintain `as const` assertion

2. **Update JSDoc documentation**
   - Clarify this is for internal navigation only
   - Reference the new separated constants
   - Update `@lastModified` tag

3. **Preserve backward compatibility**
   - Ensure `WorkflowStepConst` type still works
   - Ensure all existing exports remain available

#### Code Template

```typescript
/**
 * Complete navigation flow (internal use).
 * Combines user-visible steps with post-workflow screens.
 *
 * For UI display (step counters, progress bars), use:
 * - USER_VISIBLE_STEPS: Steps 1-8 that are numbered
 * - POST_WORKFLOW_SCREENS: Screens after workflow (no counter)
 *
 * This constant is used internally for:
 * - Navigation state machine
 * - Step transitions
 * - Route validation
 *
 * @see USER_VISIBLE_STEPS for numbered steps
 * @see POST_WORKFLOW_SCREENS for post-workflow screens
 * @lastModified 2026-01-12 (REQ-196 Step Count Fix)
 */
export const WORKFLOW_STEPS = [
  ...USER_VISIBLE_STEPS,
  ...POST_WORKFLOW_SCREENS,
] as const;
```

#### Verification Steps

- [ ] `WORKFLOW_STEPS.length` equals 10 (8 + 2)
- [ ] `WorkflowStepConst` type includes all 10 step values
- [ ] Order is preserved: first 8 from USER_VISIBLE_STEPS, last 2 from POST_WORKFLOW_SCREENS
- [ ] No TypeScript compilation errors
- [ ] Existing code using `WORKFLOW_STEPS` continues to work

---

### Task 1.1.4: Update PROGRESS_WEIGHTS Values

**Story Points**: 0.5
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Lines 495-506 (PROGRESS_WEIGHTS definition)

#### Implementation Steps

1. **Recalculate weights for 8-step completion**
   - Distribute weights to reach 100% at `preview-save` (step 8)
   - Each step should increment by approximately 12.5%
   - Use clean, rounded numbers for readability

2. **Update post-workflow weights to 100%**
   - Set `next-action` weight to 100
   - Set `session-summary` weight to 100
   - Progress bar should stay at 100% on these screens

3. **Update JSDoc comments**
   - Document the new weight distribution
   - Note that progress reaches 100% at preview-save
   - Update `@lastModified` tag

#### Code Template

```typescript
/**
 * Progress weights for each step.
 * Used to calculate progress bar percentage.
 *
 * REQ-196 Update: Weights recalculated for 8-step workflow.
 * - Progress reaches 100% at preview-save (step 8 of 8)
 * - Post-workflow screens maintain 100% (no regression)
 * - Weights distributed evenly: ~12.5% per step
 * - Rounded to clean numbers for visual consistency
 *
 * @see USER_VISIBLE_STEPS for the 8 user-visible steps
 * @see POST_WORKFLOW_SCREENS for post-workflow screens
 * @lastModified 2026-01-12 (REQ-196 Step Count Fix)
 */
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,           // Step 1 of 8
  'item-type-selection': 25,      // Step 2 of 8
  'specific-item-selection': 37,  // Step 3 of 8
  'purpose-selection': 50,        // Step 4 of 8
  'content-type-selection': 62,   // Step 5 of 8
  'media-capture': 75,            // Step 6 of 8
  'content-creation': 87,         // Step 7 of 8
  'preview-save': 100,            // Step 8 of 8 - FINAL
  'next-action': 100,             // Post-workflow (progress bar hidden or stays at 100%)
  'session-summary': 100,         // Post-workflow (progress bar hidden or stays at 100%)
};
```

#### Weight Distribution Rationale

| Step | Weight | Increment | Notes |
|------|--------|-----------|-------|
| room-selection | 12 | - | Starting point (~12.5%) |
| item-type-selection | 25 | +13 | Step 2 of 8 |
| specific-item-selection | 37 | +12 | Step 3 of 8 |
| purpose-selection | 50 | +13 | Midpoint |
| content-type-selection | 62 | +12 | Step 5 of 8 |
| media-capture | 75 | +13 | Step 6 of 8 |
| content-creation | 87 | +12 | Step 7 of 8 |
| preview-save | 100 | +13 | Final step |
| next-action | 100 | 0 | Post-workflow |
| session-summary | 100 | 0 | Post-workflow |

#### Verification Steps

- [ ] `PROGRESS_WEIGHTS['preview-save']` equals 100
- [ ] `PROGRESS_WEIGHTS['next-action']` equals 100
- [ ] `PROGRESS_WEIGHTS['session-summary']` equals 100
- [ ] All weights are positive integers
- [ ] Weights increase monotonically for user-visible steps
- [ ] No TypeScript compilation errors

---

### Task 1.1.5: Export New Constants and Types

**Story Points**: 0.25
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Top-level exports (verify at file end)

#### Implementation Steps

1. **Verify all new constants are exported**
   - `USER_VISIBLE_STEPS` must be exported
   - `POST_WORKFLOW_SCREENS` must be exported
   - Both use `export const` so should auto-export

2. **Verify all new types are exported**
   - `UserVisibleStepConst` must be exported
   - `PostWorkflowScreenConst` must be exported
   - Both use `export type` so should auto-export

3. **Verify existing exports are preserved**
   - `WORKFLOW_STEPS` still exported
   - `WorkflowStepConst` still exported
   - `PROGRESS_WEIGHTS` still exported

#### Verification Steps

- [ ] Can import `USER_VISIBLE_STEPS` from constants
- [ ] Can import `POST_WORKFLOW_SCREENS` from constants
- [ ] Can import `UserVisibleStepConst` from constants
- [ ] Can import `PostWorkflowScreenConst` from constants
- [ ] Existing imports still work without changes

---

### Task 1.1.6: Create Constants Validation Tests

**Story Points**: 0.5
**File**: `src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts` (new file)
**Location**: Create new test file in utils/__tests__/ directory

#### Implementation Steps

1. **Create new test file**
   - Use Vitest test framework
   - Follow existing test patterns from other constants tests
   - Import all new constants and types

2. **Add tests for USER_VISIBLE_STEPS**
   - Verify exactly 8 items
   - Verify all items are valid step names
   - Verify order matches expected workflow

3. **Add tests for POST_WORKFLOW_SCREENS**
   - Verify exactly 2 items
   - Verify contains 'next-action' and 'session-summary'
   - Verify order is correct

4. **Add tests for WORKFLOW_STEPS composition**
   - Verify equals spread of both constants
   - Verify total is 10 items
   - Verify first 8 match USER_VISIBLE_STEPS
   - Verify last 2 match POST_WORKFLOW_SCREENS

5. **Add tests for PROGRESS_WEIGHTS**
   - Verify 'preview-save' equals 100
   - Verify 'next-action' equals 100
   - Verify 'session-summary' equals 100
   - Verify all weights are positive numbers
   - Verify user-visible step weights are monotonically increasing

#### Test Template

```typescript
/**
 * Unit Tests for ItemCreationWorkflow Constants
 *
 * Tests the new step separation constants introduced in REQ-196.
 *
 * @module ItemCreationWorkflow/utils/__tests__/constants.test
 * @vitest-environment jsdom
 * @created 2026-01-12 (REQ-196 Step Count Fix)
 */

import { describe, it, expect } from 'vitest';
import {
  USER_VISIBLE_STEPS,
  POST_WORKFLOW_SCREENS,
  WORKFLOW_STEPS,
  PROGRESS_WEIGHTS,
} from '../constants';
import type {
  UserVisibleStepConst,
  PostWorkflowScreenConst,
  WorkflowStepConst,
} from '../constants';

// =============================================================================
// USER_VISIBLE_STEPS Tests
// =============================================================================

describe('USER_VISIBLE_STEPS', () => {
  it('contains exactly 8 steps', () => {
    expect(USER_VISIBLE_STEPS).toHaveLength(8);
  });

  it('starts with room-selection', () => {
    expect(USER_VISIBLE_STEPS[0]).toBe('room-selection');
  });

  it('ends with preview-save', () => {
    expect(USER_VISIBLE_STEPS[USER_VISIBLE_STEPS.length - 1]).toBe('preview-save');
  });

  it('contains expected steps in correct order', () => {
    const expectedSteps = [
      'room-selection',
      'item-type-selection',
      'specific-item-selection',
      'purpose-selection',
      'content-type-selection',
      'media-capture',
      'content-creation',
      'preview-save',
    ];
    expect(USER_VISIBLE_STEPS).toEqual(expectedSteps);
  });

  it('does not contain post-workflow screens', () => {
    expect(USER_VISIBLE_STEPS).not.toContain('next-action');
    expect(USER_VISIBLE_STEPS).not.toContain('session-summary');
  });
});

// =============================================================================
// POST_WORKFLOW_SCREENS Tests
// =============================================================================

describe('POST_WORKFLOW_SCREENS', () => {
  it('contains exactly 2 screens', () => {
    expect(POST_WORKFLOW_SCREENS).toHaveLength(2);
  });

  it('contains next-action and session-summary', () => {
    expect(POST_WORKFLOW_SCREENS).toContain('next-action');
    expect(POST_WORKFLOW_SCREENS).toContain('session-summary');
  });

  it('has next-action first', () => {
    expect(POST_WORKFLOW_SCREENS[0]).toBe('next-action');
  });

  it('has session-summary last', () => {
    expect(POST_WORKFLOW_SCREENS[1]).toBe('session-summary');
  });
});

// =============================================================================
// WORKFLOW_STEPS Composition Tests
// =============================================================================

describe('WORKFLOW_STEPS composition', () => {
  it('contains exactly 10 steps', () => {
    expect(WORKFLOW_STEPS).toHaveLength(10);
  });

  it('equals spread of USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS', () => {
    const expected = [...USER_VISIBLE_STEPS, ...POST_WORKFLOW_SCREENS];
    expect(WORKFLOW_STEPS).toEqual(expected);
  });

  it('first 8 steps match USER_VISIBLE_STEPS', () => {
    const first8 = WORKFLOW_STEPS.slice(0, 8);
    expect(first8).toEqual([...USER_VISIBLE_STEPS]);
  });

  it('last 2 steps match POST_WORKFLOW_SCREENS', () => {
    const last2 = WORKFLOW_STEPS.slice(-2);
    expect(last2).toEqual([...POST_WORKFLOW_SCREENS]);
  });
});

// =============================================================================
// PROGRESS_WEIGHTS Tests
// =============================================================================

describe('PROGRESS_WEIGHTS', () => {
  it('has preview-save at 100%', () => {
    expect(PROGRESS_WEIGHTS['preview-save']).toBe(100);
  });

  it('has next-action at 100%', () => {
    expect(PROGRESS_WEIGHTS['next-action']).toBe(100);
  });

  it('has session-summary at 100%', () => {
    expect(PROGRESS_WEIGHTS['session-summary']).toBe(100);
  });

  it('has all weights as positive numbers', () => {
    Object.values(PROGRESS_WEIGHTS).forEach(weight => {
      expect(weight).toBeGreaterThan(0);
      expect(typeof weight).toBe('number');
    });
  });

  it('has user-visible step weights monotonically increasing', () => {
    const userVisibleWeights = USER_VISIBLE_STEPS.map(
      step => PROGRESS_WEIGHTS[step]
    );

    for (let i = 1; i < userVisibleWeights.length; i++) {
      expect(userVisibleWeights[i]).toBeGreaterThan(userVisibleWeights[i - 1]);
    }
  });

  it('covers all workflow steps', () => {
    WORKFLOW_STEPS.forEach(step => {
      expect(PROGRESS_WEIGHTS[step]).toBeDefined();
    });
  });
});

// =============================================================================
// Type Compatibility Tests
// =============================================================================

describe('Type compatibility', () => {
  it('USER_VISIBLE_STEPS items are valid WorkflowStep values', () => {
    USER_VISIBLE_STEPS.forEach(step => {
      expect(WORKFLOW_STEPS).toContain(step);
    });
  });

  it('POST_WORKFLOW_SCREENS items are valid WorkflowStep values', () => {
    POST_WORKFLOW_SCREENS.forEach(screen => {
      expect(WORKFLOW_STEPS).toContain(screen);
    });
  });
});
```

#### Verification Steps

- [ ] Test file is created at correct location
- [ ] All tests pass when running `npm test` or `vitest`
- [ ] Tests cover all new constants
- [ ] Tests validate all acceptance criteria

---

## Implementation Order

| Order | Task | Depends On | Estimated Points |
|-------|------|------------|------------------|
| 1 | Task 1.1.1 - Create USER_VISIBLE_STEPS | None | 0.5 |
| 2 | Task 1.1.2 - Create POST_WORKFLOW_SCREENS | None | 0.25 |
| 3 | Task 1.1.3 - Update WORKFLOW_STEPS | 1.1.1, 1.1.2 | 0.5 |
| 4 | Task 1.1.4 - Update PROGRESS_WEIGHTS | None | 0.5 |
| 5 | Task 1.1.5 - Export verification | 1.1.1-1.1.4 | 0.25 |
| 6 | Task 1.1.6 - Create tests | 1.1.1-1.1.5 | 0.5 |
| **Total** | | | **2.5 SP** |

---

## Acceptance Criteria Checklist

| Criterion | Task | Verification Method |
|-----------|------|---------------------|
| USER_VISIBLE_STEPS contains exactly 8 workflow steps | 1.1.1 | `USER_VISIBLE_STEPS.length === 8` |
| POST_WORKFLOW_SCREENS contains next-action and session-summary | 1.1.2 | `POST_WORKFLOW_SCREENS.length === 2` |
| WORKFLOW_STEPS combines both arrays (total 10) | 1.1.3 | `WORKFLOW_STEPS.length === 10` |
| PROGRESS_WEIGHTS reaches 100% at preview-save | 1.1.4 | `PROGRESS_WEIGHTS['preview-save'] === 100` |
| Post-workflow screens have 100% weight | 1.1.4 | `PROGRESS_WEIGHTS['next-action'] === 100` |
| Types compile without errors | 1.1.5 | TypeScript compilation passes |
| All unit tests pass | 1.1.6 | `npm test` passes |

---

## Post-Implementation Verification

### Build Verification

```bash
# Run TypeScript compilation check
npm run type-check

# Run tests for the constants
npm test -- src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts

# Run all workflow tests to ensure no regressions
npm test -- src/components/ItemCreationWorkflow/
```

### Manual Verification

1. **Import verification**: Create a temporary test file that imports all new exports
2. **Type inference**: Verify TypeScript correctly infers types from constants
3. **Backward compatibility**: Verify existing code using WORKFLOW_STEPS still compiles

---

## Rollback Plan

If issues are discovered after implementation:

1. **Revert constants.ts changes** - Restore original WORKFLOW_STEPS and PROGRESS_WEIGHTS
2. **Remove test file** - Delete the new constants.test.ts file
3. **Verify build** - Ensure application builds and tests pass after revert

---

## Dependencies

### Blocks (downstream tasks waiting on this)
- **Task 1.2**: Update PROGRESS_WEIGHTS (partially included in this task)
- **Task 1.3**: Update WorkflowHeader to use new constants
- **Task 1.4**: Update ItemCreationWorkflow for display calculations
- **Task 1.5**: Update useWorkflowState hook with isPostWorkflow check

### Does Not Block
- Phase 3: Dashboard cards (different component tree)
- Phase 4: Navigation menu (different component tree)
- Phase 5: Data model types (different file)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing imports | Low | High | WORKFLOW_STEPS signature unchanged |
| Type incompatibility | Low | Medium | Derive types from existing WorkflowStep |
| Test failures in other files | Medium | Medium | Run full test suite after changes |
| Spread syntax browser support | Very Low | Low | Already using spread elsewhere in codebase |

---

## References

- **Request**: docs/gen_requests.md - REQ-196
- **Overview**: docs/REQ-196-update-workflowsteps-constant-overview.md
- **Implementation Plan**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
- **Source File**: src/components/ItemCreationWorkflow/utils/constants.ts
- **Related Tests**: src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts
- **Existing Pattern**: src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts

---

## Implementation Notes

**Implemented**: 2026-01-12 13:42 UTC

### Completed Tasks

| Task | Status | Notes |
|------|--------|-------|
| 1.1.1 - Create USER_VISIBLE_STEPS | ✅ DONE | Created constant with 8 steps, ending at preview-save |
| 1.1.2 - Create POST_WORKFLOW_SCREENS | ✅ DONE | Created constant with next-action and session-summary |
| 1.1.3 - Update WORKFLOW_STEPS | ✅ DONE | Now uses spread of USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS |
| 1.1.4 - Update PROGRESS_WEIGHTS | ✅ DONE | preview-save, next-action, session-summary all at 100% |
| 1.1.5 - Export verification | ✅ DONE | All exports verified, TypeScript compiles |
| 1.1.6 - Create tests | ✅ DONE | Created src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts |

### Additional Fixes

- **useWorkflowState.test.ts**: Updated test expectations to reflect 10 total steps (was checking for 9)
- **useWorkflowState.test.ts**: Updated single-transition test to include media-capture step in the chain

### Verification Results

- **Type Check**: PASSED (no errors in constants.ts)
- **Constants Tests**: 21/21 passed
- **useWorkflowState Tests**: 80/80 passed

### Files Modified

1. `src/components/ItemCreationWorkflow/utils/constants.ts`
   - Added USER_VISIBLE_STEPS constant (8 items)
   - Added UserVisibleStepConst type
   - Added POST_WORKFLOW_SCREENS constant (2 items)
   - Added PostWorkflowScreenConst type
   - Updated WORKFLOW_STEPS to use spread syntax
   - Updated PROGRESS_WEIGHTS to reach 100% at preview-save

2. `src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts` (NEW)
   - Created comprehensive test suite with 21 tests
   - Tests for USER_VISIBLE_STEPS, POST_WORKFLOW_SCREENS, WORKFLOW_STEPS composition, PROGRESS_WEIGHTS

3. `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
   - Fixed test expecting 9 steps to expect 10 (including media-capture)
   - Updated transition test to include media-capture step
