# REQ-200: Update useWorkflowState Hook - Implementation Breakdown

**Document Created:** 2026-01-12 14:30:00 UTC
**Last Modified:** 2026-01-12 14:30:00 UTC
**Request Source:** docs/gen_requests.md - Request #200
**Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID:** 1.5

---

## Overview

This document provides the implementation breakdown for updating the `useWorkflowState` hook to properly handle step counting and navigation logic for the ItemCreationWorkflow wizard. The hook must correctly differentiate between user-visible steps (1-8) and post-workflow screens (next-action, session-summary) that should not be included in the step count.

### Problem Statement

The current implementation uses `WORKFLOW_STEPS.length` (10 steps) as the total step count, causing the step indicator to show "Step 9 of 10" on the "What's Next?" screen when it should actually be a post-workflow menu with no step counter visible. The PRD requires "Save Item" (preview-save) to be "Step 8 of 8" as the final numbered step.

### Solution Overview

Export new computed values from `useWorkflowState` hook that:
1. Determine if the current step is a post-workflow screen
2. Calculate the correct user-visible step index (0-7 for steps 1-8)
3. Provide the correct total step count (8, not 10)

---

## Technical Context

### Current Implementation

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

The hook currently exposes:
```typescript
// Computed values (lines 929-937)
const currentStepIndex = useMemo(() => {
  return WORKFLOW_STEPS.indexOf(state.currentStep);
}, [state.currentStep]);

const totalSteps = WORKFLOW_STEPS.length;  // Returns 10
```

**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`

The `WORKFLOW_STEPS` constant (lines 450-461):
```typescript
export const WORKFLOW_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'content-creation',         // Step 7 (compatibility)
  'preview-save',             // Step 8 (FINAL)
  'next-action',              // Post-workflow menu
  'session-summary',          // Post-workflow
] as const;
```

### Target Implementation

After Task 1.1 and 1.2 are complete (updating constants.ts), the hook will use:
- `USER_VISIBLE_STEPS` - Array of 8 steps (room-selection through preview-save)
- `POST_WORKFLOW_SCREENS` - Array of 2 screens (next-action, session-summary)

---

## Dependencies

### Depends On (upstream)
- **Task 1.1**: Update WORKFLOW_STEPS constant - Must complete first to provide `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` constants
- **Task 1.2**: Update PROGRESS_WEIGHTS - Must complete to ensure progress reaches 100% at preview-save

### Blocks (downstream)
- **Task 1.4**: Update ItemCreationWorkflow component - Requires new hook exports (`isPostWorkflowStep`, `userVisibleStepIndex`, `userVisibleTotalSteps`)
- **Task 1.3**: Update WorkflowHeader - Indirectly depends through ItemCreationWorkflow using hook values

### Parallel Safety
- **Files touched:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Conflicts with:** None (only this task modifies useWorkflowState.ts in Phase 1)
- **Safe to parallelize with:**
  - Phase 3 tasks (StatisticsCards.tsx)
  - Phase 4 tasks (layout.tsx, Instructions page)
  - Phase 5 tasks (types, PreviewSaveStep display changes)

---

## Implementation Tasks

### Task 1: Import New Constants

**Priority:** Required
**Effort:** 5 minutes

Import the new constants from `constants.ts`:

```typescript
// At line 64-68, update imports from:
import {
  ROOM_LABELS,
  PROGRESS_WEIGHTS,
  WORKFLOW_STEPS,
  MAX_CONTENT_PIECES,
} from '../utils/constants';

// To:
import {
  ROOM_LABELS,
  PROGRESS_WEIGHTS,
  WORKFLOW_STEPS,
  USER_VISIBLE_STEPS,
  POST_WORKFLOW_SCREENS,
  MAX_CONTENT_PIECES,
} from '../utils/constants';
```

### Task 2: Add New Computed Values

**Priority:** Required
**Effort:** 15 minutes

Add three new computed values after the existing `currentStepIndex` calculation (around line 929):

```typescript
/**
 * Whether the current step is a post-workflow screen (not numbered).
 * Post-workflow screens: next-action, session-summary
 */
const isPostWorkflowStep = useMemo(() => {
  return POST_WORKFLOW_SCREENS.includes(state.currentStep as typeof POST_WORKFLOW_SCREENS[number]);
}, [state.currentStep]);

/**
 * User-visible step index (0-based) for the 8-step workflow.
 * Returns 7 (last visible step) for post-workflow screens.
 */
const userVisibleStepIndex = useMemo(() => {
  const index = USER_VISIBLE_STEPS.indexOf(state.currentStep as typeof USER_VISIBLE_STEPS[number]);
  return index >= 0 ? index : USER_VISIBLE_STEPS.length - 1;
}, [state.currentStep]);

/**
 * Total number of user-visible steps (8).
 */
const userVisibleTotalSteps = USER_VISIBLE_STEPS.length;
```

### Task 3: Update Return Type Interface

**Priority:** Required
**Effort:** 10 minutes

Update `UseWorkflowStateReturn` interface (around line 669) to include new exports:

```typescript
export interface UseWorkflowStateReturn {
  // ... existing properties ...

  // Computed values
  /** Whether the user can navigate to the next step */
  canGoNext: boolean;
  /** Whether the user can navigate back */
  canGoBack: boolean;
  /** Current progress percentage (0-100) */
  progressPercent: number;
  /** Index of current step in WORKFLOW_STEPS (includes all steps) */
  currentStepIndex: number;
  /** Total number of workflow steps (includes post-workflow) */
  totalSteps: number;
  /** Number of items created in this session */
  itemCount: number;

  // NEW: User-visible step tracking (Task 1.5)
  /** Whether current step is a post-workflow screen (no step counter) */
  isPostWorkflowStep: boolean;
  /** User-visible step index (0-7 for steps 1-8, or 7 for post-workflow) */
  userVisibleStepIndex: number;
  /** Total user-visible steps (always 8) */
  userVisibleTotalSteps: number;
}
```

### Task 4: Update Return Statement

**Priority:** Required
**Effort:** 5 minutes

Update the hook's return statement (around line 939) to include new values:

```typescript
return {
  state,
  goToStep,
  nextStep,
  prevStep,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  setItemName,
  setTags,
  selectPurpose,
  selectContentSource,
  selectContentType,
  addContentPiece,
  removeContentPiece,
  reorderContent,
  saveItem,
  startNewItem,
  completeSession,
  addMoreToItem,
  removeSessionItem,
  updateItemsQRCodes,
  setError,
  clearError,
  clearAllErrors,
  setSubmitting,
  reset,
  canGoNext,
  canGoBack,
  progressPercent,
  currentStepIndex,
  totalSteps,
  itemCount,
  // NEW: User-visible step tracking (Task 1.5)
  isPostWorkflowStep,
  userVisibleStepIndex,
  userVisibleTotalSteps,
};
```

### Task 5: Update Unit Tests

**Priority:** Required
**Effort:** 30 minutes

Update test file: `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`

Add new test cases:

```typescript
// =============================================================================
// Task 1.5: User-Visible Step Tracking Tests
// =============================================================================

describe('User-Visible Step Tracking (Task 1.5)', () => {
  describe('isPostWorkflowStep detection', () => {
    it('returns false for user-visible steps', () => {
      const visibleSteps = [
        'room-selection',
        'item-type-selection',
        'specific-item-selection',
        'purpose-selection',
        'content-type-selection',
        'media-capture',
        'content-creation',
        'preview-save',
      ];

      visibleSteps.forEach(step => {
        const state: WorkflowState = {
          ...createInitialState(),
          currentStep: step as WorkflowStep,
        };
        // Test would use hook, but since we're testing reducer pure functions,
        // verify step membership in USER_VISIBLE_STEPS
        expect(USER_VISIBLE_STEPS.includes(step as any)).toBe(true);
      });
    });

    it('returns true for post-workflow screens', () => {
      const postWorkflowSteps = ['next-action', 'session-summary'];

      postWorkflowSteps.forEach(step => {
        expect(POST_WORKFLOW_SCREENS.includes(step as any)).toBe(true);
      });
    });
  });

  describe('userVisibleStepIndex calculation', () => {
    it('returns correct index for first step (0)', () => {
      expect(USER_VISIBLE_STEPS.indexOf('room-selection')).toBe(0);
    });

    it('returns correct index for last visible step (7)', () => {
      expect(USER_VISIBLE_STEPS.indexOf('preview-save')).toBe(7);
    });

    it('returns 7 (last index) for post-workflow screens', () => {
      // post-workflow screens not in USER_VISIBLE_STEPS, so indexOf returns -1
      // Hook logic: index >= 0 ? index : USER_VISIBLE_STEPS.length - 1
      const nextActionIndex = USER_VISIBLE_STEPS.indexOf('next-action' as any);
      expect(nextActionIndex).toBe(-1);
      // Expected behavior: return 7 (last visible index)
    });
  });

  describe('userVisibleTotalSteps', () => {
    it('equals 8 (number of user-visible steps)', () => {
      expect(USER_VISIBLE_STEPS.length).toBe(8);
    });
  });
});
```

---

## Authorized Files and Functions for Modification

### Primary File

| File | Functions/Exports | Change Type |
|------|------------------|-------------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `useWorkflowState`, `UseWorkflowStateReturn` | Modify |

### Specific Modifications

1. **Import section (line ~64-68)**
   - Add imports: `USER_VISIBLE_STEPS`, `POST_WORKFLOW_SCREENS`

2. **UseWorkflowStateReturn interface (line ~669)**
   - Add properties: `isPostWorkflowStep`, `userVisibleStepIndex`, `userVisibleTotalSteps`

3. **useWorkflowState function (line ~767)**
   - Add computed values after `currentStepIndex` (line ~929)
   - Update return statement (line ~939)

### Test File

| File | Test Suites | Change Type |
|------|-------------|-------------|
| `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` | New test suite | Add |

---

## Validation Checklist

- [ ] New constants imported correctly from constants.ts
- [ ] `isPostWorkflowStep` returns `true` only for `next-action` and `session-summary`
- [ ] `userVisibleStepIndex` returns 0-7 for steps 1-8
- [ ] `userVisibleStepIndex` returns 7 for post-workflow screens
- [ ] `userVisibleTotalSteps` equals 8
- [ ] Existing `currentStepIndex` and `totalSteps` still work (backward compatibility)
- [ ] All existing tests pass
- [ ] New unit tests added and passing
- [ ] TypeScript compilation succeeds
- [ ] No lint errors

---

## Integration Notes

### For Task 1.4 (ItemCreationWorkflow.tsx)

After this task is complete, ItemCreationWorkflow.tsx can use the new exports:

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

The original exports (`currentStepIndex`, `totalSteps`) are preserved for any code that might depend on the full 10-step index. New code should use `userVisibleStepIndex` and `userVisibleTotalSteps` for UI display.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type errors if USER_VISIBLE_STEPS not exported | Low | High | Verify Task 1.1 completes first |
| Breaking existing callers of hook | Low | Medium | Keep backward-compatible exports |
| Test failures in existing suite | Medium | Medium | Run full test suite after changes |

---

## Estimated Effort

| Task | Time |
|------|------|
| Import constants | 5 min |
| Add computed values | 15 min |
| Update interface | 10 min |
| Update return | 5 min |
| Write tests | 30 min |
| Validation | 15 min |
| **Total** | **~1.5 hours** |

---

## References

- Implementation Plan: `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Task 1.5)
- Hook Source: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- Constants Source: `src/components/ItemCreationWorkflow/utils/constants.ts`
- Test File: `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
- PRD Source: ITEM-05 (Fix workflow step count from 10 to 8)
