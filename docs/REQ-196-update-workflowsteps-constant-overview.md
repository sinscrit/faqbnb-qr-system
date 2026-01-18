# REQ-196: Update WORKFLOW_STEPS Constant - Technical Implementation Overview

**Document Created**: 2026-01-12 19:30 UTC
**Last Modified**: 2026-01-12 19:30 UTC
**Request ID**: REQ-196
**Phase**: 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID**: 1.1
**Implementation Plan Reference**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md

---

## Executive Summary

This task implements the separation of user-visible workflow steps from internal navigation steps. The goal is to display an 8-step workflow to users (steps 1-8) while preserving internal navigation to post-workflow screens (next-action and session-summary) that should not be numbered.

**Business Value**: Clear workflow progression improves user confidence and reduces abandonment by setting accurate expectations about workflow length. Progress indicators will show 100% completion at the appropriate point (preview-save), providing psychological completion cues.

---

## Current State Analysis

### Current WORKFLOW_STEPS Definition
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts` (lines 450-461)

```typescript
export const WORKFLOW_STEPS = [
  'room-selection',           // Currently Step 1 of 10
  'item-type-selection',      // Currently Step 2 of 10
  'specific-item-selection',  // Currently Step 3 of 10
  'purpose-selection',        // Currently Step 4 of 10
  'content-type-selection',   // Currently Step 5 of 10
  'media-capture',            // Currently Step 6 of 10
  'content-creation',         // Currently Step 7 of 10
  'preview-save',             // Currently Step 8 of 10
  'next-action',              // Currently Step 9 of 10 <- Should NOT be numbered
  'session-summary',          // Currently Step 10 of 10 <- Should NOT be numbered
] as const;
```

### Current PROGRESS_WEIGHTS Definition
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts` (lines 495-506)

```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 10,
  'item-type-selection': 20,
  'specific-item-selection': 30,
  'purpose-selection': 40,
  'content-type-selection': 50,
  'media-capture': 60,
  'content-creation': 65,
  'preview-save': 75,           // Should reach 100% here
  'next-action': 88,            // Post-workflow - should stay at 100%
  'session-summary': 100,       // Post-workflow - should stay at 100%
};
```

### Current Usage in useWorkflowState.ts
**File**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` (lines 929-933)

```typescript
const currentStepIndex = useMemo(() => {
  return WORKFLOW_STEPS.indexOf(state.currentStep);
}, [state.currentStep]);

const totalSteps = WORKFLOW_STEPS.length;  // Currently returns 10
```

### Current Usage in WorkflowHeader
**File**: `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` (lines 111-114)

```typescript
{/* Step indicator */}
<div className="text-sm font-medium text-gray-700">
  Step {currentStepIndex + 1} of {totalSteps}
</div>
```

---

## Target State

### New Constants Structure

```typescript
/**
 * User-visible workflow steps (for progress indicator).
 * Steps 1-8 are numbered; post-workflow screens are not counted.
 */
export const USER_VISIBLE_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'content-creation',         // Step 7 (when used)
  'preview-save',             // Step 8 - FINAL
] as const;

/**
 * Post-workflow screens (no step counter shown).
 */
export const POST_WORKFLOW_SCREENS = [
  'next-action',
  'session-summary',
] as const;

/**
 * Complete navigation flow (internal use).
 */
export const WORKFLOW_STEPS = [
  ...USER_VISIBLE_STEPS,
  ...POST_WORKFLOW_SCREENS,
] as const;
```

### Updated PROGRESS_WEIGHTS

```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,          // Step 1 of 8
  'item-type-selection': 25,     // Step 2 of 8
  'specific-item-selection': 37, // Step 3 of 8
  'purpose-selection': 50,       // Step 4 of 8
  'content-type-selection': 62,  // Step 5 of 8
  'media-capture': 75,           // Step 6 of 8
  'content-creation': 87,        // Step 7 of 8
  'preview-save': 100,           // Step 8 of 8 - FINAL
  'next-action': 100,            // Post-workflow (no bar shown)
  'session-summary': 100,        // Post-workflow (no bar shown)
};
```

---

## Implementation Tasks

### Task 1.1.1: Create USER_VISIBLE_STEPS constant
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Lines**: Insert after line 448 (before current WORKFLOW_STEPS)

**Changes**:
1. Add `USER_VISIBLE_STEPS` constant containing the first 8 workflow steps
2. Add `UserVisibleStepConst` type derived from the constant
3. Add JSDoc documentation

### Task 1.1.2: Create POST_WORKFLOW_SCREENS constant
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Lines**: Insert after USER_VISIBLE_STEPS

**Changes**:
1. Add `POST_WORKFLOW_SCREENS` constant containing `next-action` and `session-summary`
2. Add `PostWorkflowScreenConst` type derived from the constant
3. Add JSDoc documentation

### Task 1.1.3: Update WORKFLOW_STEPS to use spread syntax
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Lines**: 450-461 (current WORKFLOW_STEPS definition)

**Changes**:
1. Replace hardcoded array with spread of `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS`
2. Update JSDoc to clarify this is for internal navigation only

### Task 1.1.4: Update PROGRESS_WEIGHTS values
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`
**Lines**: 495-506

**Changes**:
1. Update weights so `preview-save` = 100%
2. Redistribute weights evenly across 8 user-visible steps
3. Keep post-workflow screens at 100%
4. Update JSDoc comments

### Task 1.1.5: Export new constants
**File**: `src/components/ItemCreationWorkflow/utils/constants.ts`

**Changes**:
1. Ensure `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` are exported
2. Ensure new types are exported

---

## Authorized Files and Functions for Modification

### Primary File
| File | Functions/Constants | Change Type |
|------|---------------------|-------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `USER_VISIBLE_STEPS` (new), `POST_WORKFLOW_SCREENS` (new), `WORKFLOW_STEPS` (modify), `PROGRESS_WEIGHTS` (modify) | Add + Modify |

### Type Definitions (if needed)
| File | Types | Change Type |
|------|-------|-------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `UserVisibleStepConst` (new), `PostWorkflowScreenConst` (new), `WorkflowStepConst` (unchanged) | Add |

### Files NOT to Modify in This Task
The following files will be modified in subsequent tasks (1.2, 1.3, 1.4, 1.5):
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` → Task 1.5
- `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` → Task 1.3
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` → Task 1.4

---

## Dependencies

### Depends On (upstream)
- None - This is the foundational task for Phase 1

### Blocks (downstream)
- **Task 1.2**: Update PROGRESS_WEIGHTS - Must have USER_VISIBLE_STEPS defined first
- **Task 1.3**: Update WorkflowHeader - Needs new constants to conditionally show step counter
- **Task 1.4**: Update ItemCreationWorkflow - Needs USER_VISIBLE_STEPS to calculate display step
- **Task 1.5**: Update useWorkflowState hook - Needs POST_WORKFLOW_SCREENS for isPostWorkflow check
- **Phase 2 (ITEM-03)**: What's Next screen - Uses correct step terminology
- **All testing tasks**: Constants must be stable before tests are updated

### Parallel Safety
- **Files touched**: `src/components/ItemCreationWorkflow/utils/constants.ts` only
- **Conflicts with**: No other tasks should modify constants.ts in this phase
- **Safe to parallelize with**:
  - Phase 3 (ITEM-01): Dashboard cards - Different component tree
  - Phase 4 (ITEM-04): Navigation menu - Different component tree
  - Phase 5 (ITEM-02): Data model types - Different file (types.ts)

---

## Testing Requirements

### Unit Tests to Update
| Test File | Changes Needed |
|-----------|----------------|
| `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` | Import new constants, update step count expectations |

### New Tests Needed
1. **Constants validation tests**:
   - Verify `USER_VISIBLE_STEPS` has exactly 8 items
   - Verify `POST_WORKFLOW_SCREENS` has exactly 2 items
   - Verify `WORKFLOW_STEPS` equals spread of both
   - Verify `PROGRESS_WEIGHTS['preview-save']` equals 100

2. **Type compatibility tests**:
   - Verify all `USER_VISIBLE_STEPS` items are valid `WorkflowStep` values
   - Verify all `POST_WORKFLOW_SCREENS` items are valid `WorkflowStep` values

### Integration Tests to Verify (not modify)
- `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`
- `src/components/ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow.test.tsx`

---

## Acceptance Criteria Mapping

| Acceptance Criterion | Task | Verification |
|---------------------|------|--------------|
| USER_VISIBLE_STEPS constant is created containing the first 8 workflow steps | 1.1.1 | Constant exists and contains 8 items |
| POST_WORKFLOW_SCREENS constant is created containing next-action and session-summary | 1.1.2 | Constant exists and contains 2 items |
| WORKFLOW_STEPS constant combines both arrays for internal navigation | 1.1.3 | WORKFLOW_STEPS.length === 10 |
| Progress weights are updated to reach 100% at preview-save step | 1.1.4 | PROGRESS_WEIGHTS['preview-save'] === 100 |
| Type definitions are updated to reflect the new constants structure | 1.1.5 | Types compile without errors |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing imports | Low | High | Keep WORKFLOW_STEPS signature unchanged |
| Type incompatibility | Low | Medium | Derive types from existing WorkflowStep |
| Test failures | Medium | Medium | Run test suite after changes |

---

## Implementation Notes

1. **Backward Compatibility**: The `WORKFLOW_STEPS` constant maintains its external signature. Code using `WORKFLOW_STEPS` directly will continue to work unchanged.

2. **New Constants Usage**: Downstream tasks will import `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` for step counter logic and conditional rendering.

3. **Progress Weight Distribution**: Weights are recalculated to provide smooth visual progression:
   - Each of 8 steps gets ~12.5% increment
   - Rounded to clean numbers: 12, 25, 37, 50, 62, 75, 87, 100

4. **Type Safety**: New constants use `as const` assertion to preserve literal types, matching existing pattern.

---

## References

- **Request**: docs/gen_requests.md - REQ-196
- **Implementation Plan**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
- **Source File**: src/components/ItemCreationWorkflow/utils/constants.ts
- **Related Tests**: src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts
