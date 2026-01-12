# REQ-197: Update PROGRESS_WEIGHTS Constant - Detailed Task Breakdown

**Document Created**: 2026-01-12 23:45 UTC
**Last Modified**: 2026-01-12 13:50 UTC
**Implementation Status**: COMPLETED (implemented as part of REQ-196)
**Request ID**: REQ-197
**Phase**: 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID**: 1.2
**Title**: Update PROGRESS_WEIGHTS
**Overview Document**: docs/REQ-197-update-progressweights-overview.md
**Implementation Plan Reference**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for updating the `PROGRESS_WEIGHTS` constant in the ItemCreationWorkflow. The goal is to recalculate progress weights so that the progress bar reaches 100% at the `preview-save` step (Step 8 of 8), with post-workflow screens maintaining 100% progress.

**Note**: This task was implemented as part of REQ-196 (Task 1.1.4). The PROGRESS_WEIGHTS constant has already been updated and tests are in place. This document serves as the formal task breakdown for tracking and verification purposes.

---

## Authorized Files for Modification

| File Path | Change Type | Scope |
|-----------|-------------|-------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Modify | Lines 549-560 (PROGRESS_WEIGHTS section) |

### Files NOT to Modify in This Task
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` → Task 1.5 (consumes PROGRESS_WEIGHTS)
- `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` → Task 1.3
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` → Task 1.4

---

## Pre-Implementation Checklist

- [x] Verify current `PROGRESS_WEIGHTS` exists (lines 549-560) ✅ Verified
- [x] Verify `WorkflowStepConst` type is available ✅ Verified
- [x] Confirm `PROGRESS_WEIGHTS` is exported ✅ Verified
- [x] Review existing test coverage for PROGRESS_WEIGHTS ✅ Tests exist

---

## Current State Analysis

### Current PROGRESS_WEIGHTS (constants.ts lines 549-560) - ALREADY UPDATED

```typescript
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

### Implementation Verification

The PROGRESS_WEIGHTS has already been updated per the target specification:
- ✅ `preview-save` is at 100% (was 75%)
- ✅ `next-action` is at 100% (was 88%)
- ✅ `session-summary` stays at 100%
- ✅ Weights are evenly distributed (~12.5% per step)
- ✅ JSDoc documentation updated

---

## Task Breakdown

### Task 1.2.1: Update PROGRESS_WEIGHTS Values

**Story Points**: 0.5
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Lines 549-560
**Status**: ✅ COMPLETED (implemented in REQ-196)

#### Implementation Steps

1. **Update weight values for even distribution**
   - Change `room-selection` from `10` to `12`
   - Change `item-type-selection` from `20` to `25`
   - Change `specific-item-selection` from `30` to `37`
   - Change `purpose-selection` from `40` to `50`
   - Change `content-type-selection` from `50` to `62`
   - Change `media-capture` from `60` to `75`
   - Change `content-creation` from `65` to `87`
   - Change `preview-save` from `75` to `100`
   - Change `next-action` from `88` to `100`
   - Keep `session-summary` at `100`

2. **Weight distribution rationale**
   - 8 user-visible steps = 12.5% per step average
   - Rounded to clean numbers for visual consistency
   - Post-workflow screens stay at 100%

#### Code Template (Reference)

```typescript
/**
 * Progress weights for each step.
 * Used to calculate progress bar percentage.
 *
 * REQ-196/REQ-197 Update: Weights recalculated for 8-step workflow.
 * - Progress reaches 100% at preview-save (step 8 of 8)
 * - Post-workflow screens maintain 100% (no regression)
 * - Weights distributed evenly: ~12.5% per step
 * - Rounded to clean numbers for visual consistency
 *
 * @see USER_VISIBLE_STEPS for the 8 user-visible steps
 * @see POST_WORKFLOW_SCREENS for post-workflow screens
 * @lastModified 2026-01-12 (REQ-196/REQ-197 Step Count Fix)
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

#### Weight Distribution Table

| Step | Old Weight | New Weight | Increment | Notes |
|------|------------|------------|-----------|-------|
| room-selection | 10 | 12 | - | Starting point (~12.5%) |
| item-type-selection | 20 | 25 | +13 | Step 2 of 8 |
| specific-item-selection | 30 | 37 | +12 | Step 3 of 8 |
| purpose-selection | 40 | 50 | +13 | Midpoint |
| content-type-selection | 50 | 62 | +12 | Step 5 of 8 |
| media-capture | 60 | 75 | +13 | Step 6 of 8 |
| content-creation | 65 | 87 | +12 | Step 7 of 8 |
| preview-save | 75 | 100 | +13 | Final numbered step |
| next-action | 88 | 100 | 0 | Post-workflow |
| session-summary | 100 | 100 | 0 | Post-workflow |

#### Verification Steps

- [x] `PROGRESS_WEIGHTS['preview-save']` equals 100
- [x] `PROGRESS_WEIGHTS['next-action']` equals 100
- [x] `PROGRESS_WEIGHTS['session-summary']` equals 100
- [x] All weights are positive integers
- [x] Weights increase monotonically for user-visible steps
- [x] No TypeScript compilation errors

---

### Task 1.2.2: Update JSDoc Documentation

**Story Points**: 0.25
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Location**: Lines 536-548 (JSDoc comment above PROGRESS_WEIGHTS)
**Status**: ✅ COMPLETED (implemented in REQ-196)

#### Implementation Steps

1. **Update JSDoc comment block**
   - Document the new weight distribution
   - Note that progress reaches 100% at preview-save
   - Reference REQ-197 requirement
   - Add `@lastModified` tag with current date

2. **Include reference to dependent constants**
   - Reference `USER_VISIBLE_STEPS` for the 8 user-visible steps
   - Reference `POST_WORKFLOW_SCREENS` for post-workflow screens

#### Verification Steps

- [x] JSDoc comment reflects 8-step workflow
- [x] Documentation mentions 100% at preview-save
- [x] `@lastModified` tag is present
- [x] References to USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS exist

---

### Task 1.2.3: Verify Existing Tests

**Story Points**: 0.25
**File**: `src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts`
**Location**: Lines 115-150 (PROGRESS_WEIGHTS tests)
**Status**: ✅ COMPLETED (tests created in REQ-196)

#### Implementation Steps

1. **Verify test coverage exists**
   - Test for `preview-save` at 100%
   - Test for `next-action` at 100%
   - Test for `session-summary` at 100%
   - Test for all weights being positive numbers
   - Test for monotonically increasing weights for user-visible steps
   - Test for coverage of all workflow steps

2. **Run existing tests**
   ```bash
   npm test -- src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts
   ```

#### Existing Test Coverage

```typescript
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
```

#### Verification Steps

- [x] Test file exists at correct location
- [x] Tests for PROGRESS_WEIGHTS are present
- [x] All 6 PROGRESS_WEIGHTS tests pass
- [x] Test covers all acceptance criteria

---

### Task 1.2.4: Verify Integration with useWorkflowState Hook

**Story Points**: 0.25
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Location**: Line 926 (PROGRESS_WEIGHTS usage)
**Status**: ✅ VERIFIED

#### Implementation Steps

1. **Verify PROGRESS_WEIGHTS consumption**
   - Confirm `useWorkflowState.ts` imports PROGRESS_WEIGHTS (line 65)
   - Verify usage: `PROGRESS_WEIGHTS[state.currentStep] ?? 0` (line 926)
   - No code changes needed - just verification

2. **Test progress calculation**
   - Verify `progressPercent` returns 100 when on `preview-save`
   - Verify `progressPercent` returns 100 when on `next-action`
   - Verify `progressPercent` returns 100 when on `session-summary`

#### Verification Steps

- [x] `PROGRESS_WEIGHTS` is imported in useWorkflowState.ts
- [x] Progress calculation uses updated weights correctly
- [x] No code changes needed in this file for this task

---

## Implementation Order

| Order | Task | Depends On | Story Points | Status |
|-------|------|------------|--------------|--------|
| 1 | Task 1.2.1 - Update PROGRESS_WEIGHTS values | REQ-196 Task 1.1.1-1.1.2 | 0.5 | ✅ COMPLETED |
| 2 | Task 1.2.2 - Update JSDoc documentation | None | 0.25 | ✅ COMPLETED |
| 3 | Task 1.2.3 - Verify existing tests | 1.2.1, 1.2.2 | 0.25 | ✅ COMPLETED |
| 4 | Task 1.2.4 - Verify integration | 1.2.1-1.2.3 | 0.25 | ✅ VERIFIED |
| **Total** | | | **1.25 SP** | |

---

## Acceptance Criteria Checklist

| Criterion | Task | Status | Verification Method |
|-----------|------|--------|---------------------|
| PROGRESS_WEIGHTS contains exactly 10 entries (8 numbered + 2 post-workflow) | 1.2.1 | ✅ PASS | `Object.keys(PROGRESS_WEIGHTS).length === 10` |
| First 8 step weights sum to progressive completion ending at 100 | 1.2.1 | ✅ PASS | `PROGRESS_WEIGHTS['preview-save'] === 100` |
| Weight values are ordered to match step sequence | 1.2.1 | ✅ PASS | Monotonically increasing test |
| Progress bar reaches 100% completion at preview-save step | 1.2.1 | ✅ PASS | Unit test verification |
| Post-workflow screens (next-action, session-summary) maintain 100% progress | 1.2.1 | ✅ PASS | Unit test verification |
| Weight distribution reflects reasonable time allocation (~12.5% per step) | 1.2.1 | ✅ PASS | Manual review of values |
| Progress calculations use the updated PROGRESS_WEIGHTS correctly | 1.2.4 | ✅ PASS | useWorkflowState.ts verification |
| Progress indicator displays smooth, logical advancement through all steps | 1.2.1 | ✅ PASS | Monotonically increasing test |

---

## Dependencies

### Depends On (Upstream)

| Task | Status | Description |
|------|--------|-------------|
| REQ-196 Task 1.1.1 | ✅ COMPLETED | Create USER_VISIBLE_STEPS constant |
| REQ-196 Task 1.1.2 | ✅ COMPLETED | Create POST_WORKFLOW_SCREENS constant |

The PROGRESS_WEIGHTS values must align with the steps defined in USER_VISIBLE_STEPS.

### Blocks (Downstream)

| Task | Status | Description |
|------|--------|-------------|
| REQ-198 (Task 1.3) | PENDING | Update WorkflowHeader to hide on post-workflow screens |
| REQ-199 (Task 1.4) | PENDING | Update ItemCreationWorkflow to use USER_VISIBLE_STEPS |
| REQ-200 (Task 1.5) | PENDING | Update useWorkflowState hook exports |

The WorkflowHeader uses `progressPercent` from PROGRESS_WEIGHTS for display. The header needs correct 100% value at preview-save before hiding logic is meaningful.

### Parallel Safety

- **Files touched:** `src/components/ItemCreationWorkflow/utils/constants.ts`
- **Conflicts with:**
  - REQ-196 (Task 1.1) - both modify constants.ts, must run sequentially
- **Safe to parallelize with:**
  - Phase 2 tasks (ITEM-03: What's Next Screen)
  - Phase 3 tasks (ITEM-01: Dashboard Cards)
  - Phase 4 tasks (ITEM-04: Navigation Menu)

---

## Testing Requirements

### Unit Tests

**File**: `src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts`
**Status**: ✅ TESTS EXIST AND PASS

Tests that verify PROGRESS_WEIGHTS:
1. `has preview-save at 100%`
2. `has next-action at 100%`
3. `has session-summary at 100%`
4. `has all weights as positive numbers`
5. `has user-visible step weights monotonically increasing`
6. `covers all workflow steps`

### Integration Verification

1. **Progress bar visual check:**
   - Verify progress bar reaches 100% at preview-save step
   - Verify progress bar stays at 100% on next-action step
   - Verify progress bar stays at 100% on session-summary step

2. **Step indicator sync:**
   - Ensure "Step 8 of 8" shows when progress is 100%
   - (Note: Step indicator fix is in Task 1.4, but progress value must be correct)

3. **Workflow progression:**
   - Walk through complete workflow flow
   - Verify progress increments feel natural and evenly distributed

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

1. **Visual verification**: Navigate through workflow, observe progress bar at each step
2. **Console verification**: Log `PROGRESS_WEIGHTS[currentStep]` at each step transition
3. **Post-workflow verification**: Confirm progress stays at 100% on next-action and session-summary

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Progress calculations in other files expect old values | Low | Low | PROGRESS_WEIGHTS is only consumed by useWorkflowState.ts |
| Visual jarring from larger progress jumps | Low | Low | Even distribution feels more natural than current uneven jumps |
| Tests fail due to progress value changes | Low | Medium | Tests already updated to expect new values |
| Type compatibility issues | Very Low | Low | Using existing Record<WorkflowStepConst, number> type |

---

## Rollback Plan

If issues are discovered after implementation:

1. **Revert PROGRESS_WEIGHTS values** - Restore original weight values (10, 20, 30, 40, 50, 60, 65, 75, 88, 100)
2. **Revert JSDoc comments** - Restore original documentation
3. **Update tests** - Restore test expectations to original values
4. **Verify build** - Ensure application builds and tests pass after revert

---

## References

- **Request**: docs/gen_requests.md - REQ-197
- **Overview**: docs/REQ-197-update-progressweights-overview.md
- **Implementation Plan**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
- **Source File**: src/components/ItemCreationWorkflow/utils/constants.ts
- **Test File**: src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts
- **Consumer**: src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts (line 926)
- **Related Task**: REQ-196 (Task 1.1.4 - PROGRESS_WEIGHTS was updated as part of this task)

---

## Implementation Notes

**Implemented**: 2026-01-12 (as part of REQ-196)

### Status Summary

This task was **implemented as part of REQ-196 Task 1.1.4**. The PROGRESS_WEIGHTS constant has been updated with the correct values and comprehensive tests are in place.

### Completed Tasks

| Task | Status | Notes |
|------|--------|-------|
| 1.2.1 - Update PROGRESS_WEIGHTS values | ✅ DONE | All 10 weights updated per specification |
| 1.2.2 - Update JSDoc documentation | ✅ DONE | Documentation reflects 8-step workflow |
| 1.2.3 - Verify existing tests | ✅ DONE | 6 tests covering PROGRESS_WEIGHTS |
| 1.2.4 - Verify integration | ✅ DONE | useWorkflowState.ts correctly uses updated weights |

### Verification Results

- **Type Check**: PASSED (no errors in constants.ts)
- **Constants Tests**: All PROGRESS_WEIGHTS tests pass (6/6, 21 total in file)
- **Integration**: useWorkflowState correctly returns progressPercent based on PROGRESS_WEIGHTS
- **Lint Check**: PASSED (no lint errors in ItemCreationWorkflow constants)

### Additional Verification (2026-01-12 13:50 UTC)

Verification performed by automated pipeline agent:
- Confirmed PROGRESS_WEIGHTS values match specification (12, 25, 37, 50, 62, 75, 87, 100, 100, 100)
- Confirmed USER_VISIBLE_STEPS (8 steps) and POST_WORKFLOW_SCREENS (2 screens) exist
- All 21 tests in constants.test.ts PASSED
- No TypeScript errors in constants.ts
- No ESLint errors in ItemCreationWorkflow constants

### Files Modified

1. `src/components/ItemCreationWorkflow/utils/constants.ts`
   - Updated PROGRESS_WEIGHTS values to reach 100% at preview-save
   - Updated JSDoc documentation

2. `src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts`
   - Tests verify new PROGRESS_WEIGHTS values

### Key Implementation Details

- **Weight calculation**: 100 / 8 steps ≈ 12.5% per step, rounded to clean numbers
- **Post-workflow handling**: Both `next-action` and `session-summary` set to 100% to maintain complete progress
- **Backward compatibility**: `content-creation` step (87%) retained for compatibility but rarely reached due to media-capture routing (REQ-176)
- **Consumer**: Progress weights are consumed by `useWorkflowState.ts` at line 926: `PROGRESS_WEIGHTS[state.currentStep] ?? 0`
