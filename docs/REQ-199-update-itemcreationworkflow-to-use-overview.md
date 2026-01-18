# REQ-199: Update ItemCreationWorkflow to Use USER_VISIBLE_STEPS Constant

**Document Created**: 2026-01-12 22:30 UTC
**Last Modified**: 2026-01-12 22:30 UTC
**Request ID**: REQ-199
**Phase**: 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID**: 1.4
**Implementation Plan Reference**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md

---

## Executive Summary

This task updates the `ItemCreationWorkflow` component to use the centralized `USER_VISIBLE_STEPS` constant for displaying workflow progress and step navigation, replacing hardcoded step count references with dynamic calculations based on the constants defined in Task 1.1.

**Business Value**: Centralizing step count logic ensures users see accurate, consistent workflow progress (e.g., "Step 3 of 8") regardless of internal workflow changes. This reduces maintenance burden and prevents UI inconsistencies when workflow steps are modified.

---

## Problem Statement

### Current Behavior

The `ItemCreationWorkflow` component receives step count values from the `useWorkflowState` hook, which currently calculates:

- `currentStepIndex`: Based on `WORKFLOW_STEPS.indexOf(state.currentStep)` - returns indices 0-9 for all 10 steps
- `totalSteps`: `WORKFLOW_STEPS.length` = 10 (includes post-workflow screens)

This results in users seeing:
- "Step 9 of 10" on the What's Next screen (after saving)
- "Step 10 of 10" on the Session Summary screen
- Progress percentages that suggest more work remains when the item is already saved

### Expected Behavior

Per the implementation plan (ITEM-05):
- Users should see **8 numbered steps** ending at "Save Item" (preview-save)
- Post-workflow screens (next-action, session-summary) should NOT be numbered
- Step counter should display "Step 8 of 8" at preview-save
- Post-workflow screens should hide the step counter entirely

### User Impact

Users currently experience:
1. Confusion about workflow length ("10 steps" vs expected "8 steps")
2. Misleading step numbers after saving an item
3. Uncertainty about completion status when seeing "Step 9 of 10"

---

## Technical Investigation

### File: `ItemCreationWorkflow.tsx`

**Location**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Current State Hook Usage (lines 111-141)**:
```typescript
const {
  state,
  nextStep,
  prevStep,
  goToStep,
  canGoBack,
  canGoNext,
  progressPercent,
  currentStepIndex,   // <- Currently 0-9 for all 10 steps
  totalSteps,         // <- Currently 10
  itemCount,
  reset,
  // ... other actions
} = useWorkflowState();
```

**Current WorkflowHeader Usage (lines 618-625)**:
```typescript
<WorkflowHeader
  currentStepIndex={currentStepIndex}
  totalSteps={totalSteps}
  progressPercent={progressPercent}
  canGoBack={showPrintPanel ? true : canGoBack}
  onBack={showPrintPanel ? handleBackFromPrint : prevStep}
  onExit={handleExitClick}
/>
```

**Issues Identified**:
1. `currentStepIndex` and `totalSteps` come directly from the hook without transformation
2. No distinction between user-visible steps and post-workflow screens
3. No prop passed to control step counter visibility

### File: `useWorkflowState.ts`

**Location**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Current Calculations (lines 929-933)**:
```typescript
const currentStepIndex = useMemo(() => {
  return WORKFLOW_STEPS.indexOf(state.currentStep);
}, [state.currentStep]);

const totalSteps = WORKFLOW_STEPS.length;  // Returns 10
```

**Issue**: Uses `WORKFLOW_STEPS.length` (10) instead of user-visible count (8).

### File: `constants.ts`

**Location**: `src/components/ItemCreationWorkflow/utils/constants.ts`

After Task 1.1 is complete, this file will contain:
- `USER_VISIBLE_STEPS` - Array of 8 numbered workflow steps
- `POST_WORKFLOW_SCREENS` - Array of 2 post-workflow screen names
- `WORKFLOW_STEPS` - Combined array (spread of above two)

---

## Solution Design

### Approach: Transform Values in ItemCreationWorkflow Component

The `ItemCreationWorkflow` component will:
1. Import `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` constants
2. Compute whether current step is a post-workflow screen
3. Calculate display step index and total based on `USER_VISIBLE_STEPS`
4. Pass transformed values and `showStepCounter` prop to `WorkflowHeader`

### Implementation Strategy

```typescript
import { USER_VISIBLE_STEPS, POST_WORKFLOW_SCREENS } from './utils/constants';

// In component body:
const isPostWorkflow = POST_WORKFLOW_SCREENS.includes(state.currentStep as any);
const displayStepIndex = USER_VISIBLE_STEPS.indexOf(state.currentStep as any);
const displayTotalSteps = USER_VISIBLE_STEPS.length; // 8

// Pass to WorkflowHeader:
<WorkflowHeader
  currentStepIndex={displayStepIndex >= 0 ? displayStepIndex : USER_VISIBLE_STEPS.length - 1}
  totalSteps={displayTotalSteps}
  progressPercent={progressPercent}
  canGoBack={isPostWorkflow ? false : canGoBack}
  onBack={prevStep}
  onExit={handleExitClick}
  showStepCounter={!isPostWorkflow}
/>
```

### Why This Approach

| Approach | Pros | Cons |
|----------|------|------|
| Transform in component (selected) | Minimal hook changes, clear separation of concerns, explicit control | Requires constants import |
| Move to useWorkflowState hook | Single source of truth | Hook becomes larger, couples display logic to state |
| Create separate display hook | Clean separation | Over-engineering for simple transformation |

**Selected**: Transform in component - keeps display logic close to rendering, minimal changes to existing hook.

---

## Implementation Tasks

### Task 1.4.1: Import New Constants

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: Near line 39 (after existing imports from constants)

**Change**: Add import for new constants from Task 1.1.

```typescript
import { USER_VISIBLE_STEPS, POST_WORKFLOW_SCREENS } from './utils/constants';
```

### Task 1.4.2: Compute Post-Workflow State

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: After hook destructuring (around line 142)

**Change**: Add computed values for post-workflow detection and display step.

```typescript
// Compute post-workflow state and display values
const isPostWorkflow = POST_WORKFLOW_SCREENS.includes(state.currentStep as any);
const displayStepIndex = USER_VISIBLE_STEPS.indexOf(state.currentStep as any);
const displayTotalSteps = USER_VISIBLE_STEPS.length;
```

### Task 1.4.3: Update WorkflowHeader Props

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: Lines 618-625 (WorkflowHeader usage)

**Change**: Pass transformed values and showStepCounter prop.

```typescript
<WorkflowHeader
  currentStepIndex={displayStepIndex >= 0 ? displayStepIndex : displayTotalSteps - 1}
  totalSteps={displayTotalSteps}
  progressPercent={progressPercent}
  canGoBack={showPrintPanel ? true : (isPostWorkflow ? false : canGoBack)}
  onBack={showPrintPanel ? handleBackFromPrint : prevStep}
  onExit={handleExitClick}
  showStepCounter={!isPostWorkflow}
/>
```

### Task 1.4.4: Update Accessibility Announcement

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: Lines 183-206 (accessibility effect)

**Change**: Update step change announcement to use display values.

```typescript
// Update the announcement to use display values
useEffect(() => {
  if (previousStepRef.current !== state.currentStep) {
    const stepName = STEP_NAMES[state.currentStep] || state.currentStep;
    // Use display values for announcement, but only for visible steps
    if (!isPostWorkflow) {
      const announcement = getStepAnnouncement(displayStepIndex + 1, displayTotalSteps, stepName);
      announce(announcement);
    }
    // ... rest of effect
  }
}, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce]);
```

### Task 1.4.5: Update Tests

**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx`

**Changes**:
1. Update test assertions for step count (8 instead of 10)
2. Add tests for post-workflow step counter hiding
3. Update snapshot tests if applicable

---

## Authorized Files and Functions for Modification

### Primary File

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import section | Add imports for new constants |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | After hook destructuring (~line 142) | Add computed values |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | WorkflowHeader usage (lines 618-625) | Update props |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Accessibility effect (lines 183-206) | Update announcement |

### Test Files

| File | Changes Required |
|------|------------------|
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx` | Update step count expectations |
| `src/components/ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow.test.tsx` | Verify step display values |

### Files NOT to Modify in This Task

These files are modified in other tasks:
- `src/components/ItemCreationWorkflow/utils/constants.ts` → Task 1.1 (REQ-196)
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` → Task 1.5 (REQ-200)
- `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` → Task 1.3 (REQ-198)

---

## Dependencies

### Depends On (upstream)

| Task | Reason |
|------|--------|
| **Task 1.1 (REQ-196)**: Create USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS constants | This task imports and uses these constants - they MUST exist before this task can run |
| **Task 1.2 (REQ-197)**: Update PROGRESS_WEIGHTS | Progress values should reach 100% at preview-save before this task displays them correctly |
| **Task 1.3 (REQ-198)**: Add showStepCounter prop to WorkflowHeader | This task passes `showStepCounter={!isPostWorkflow}` - prop MUST exist |

### Blocks (downstream)

| Task | Reason |
|------|--------|
| **Task 1.5 (REQ-200)**: Update useWorkflowState hook exports | Hook may add isPostWorkflowStep computed value that builds on this pattern |
| **Phase 2 (ITEM-03)**: What's Next Screen | Uses step counting and header hiding logic from this task |
| **All Phase 1 testing**: Requires step display to work correctly |

### Parallel Safety

- **Files touched**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- **Conflicts with**:
  - Task 1.3 (REQ-198): Both modify ItemCreationWorkflow.tsx around WorkflowHeader usage
  - **Recommendation**: Task 1.3 should complete BEFORE Task 1.4, or coordinate merge
- **Safe to parallelize with**:
  - Phase 3 (ITEM-01): Dashboard cards - different component tree
  - Phase 4 (ITEM-04): Navigation menu - different component tree
  - Phase 5 (ITEM-02): Data model types - different file (types.ts)

### Dependency Chain

```
Task 1.1 (constants)
    ↓
Task 1.2 (weights) ──┐
    ↓               │
Task 1.3 (header)   │
    ↓               │
Task 1.4 (workflow) ←┘
    ↓
Task 1.5 (hook exports)
```

---

## Testing Requirements

### Unit Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Workflow at room-selection step | Shows "Step 1 of 8" |
| Workflow at preview-save step | Shows "Step 8 of 8" |
| Workflow at next-action step | No step counter visible |
| Workflow at session-summary step | No step counter visible |
| Back button on next-action | Disabled (canGoBack=false) |
| Exit button on all steps | Always visible |

### Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Complete workflow flow | Steps count 1-8, then no counter |
| Accessibility announcements | Correct step numbers announced |
| Post-workflow navigation | No back navigation on next-action |

### Test Updates Required

```typescript
// Update existing test expectations:
expect(screen.getByText('Step 1 of 8')).toBeInTheDocument(); // was 'Step 1 of 10'

// Add new test for post-workflow:
it('hides step counter on next-action step', () => {
  // Advance workflow to next-action
  expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
});
```

---

## Acceptance Criteria Mapping

| Acceptance Criterion | Implementation Task | Verification |
|---------------------|---------------------|--------------|
| ItemCreationWorkflow imports USER_VISIBLE_STEPS constant | Task 1.4.1 | Import statement present |
| All hardcoded step count references replaced | Task 1.4.2, 1.4.3 | displayTotalSteps used instead of totalSteps |
| Workflow header displays step count using USER_VISIBLE_STEPS | Task 1.4.3 | WorkflowHeader receives displayTotalSteps |
| Progress calculations use USER_VISIBLE_STEPS as denominator | N/A - uses PROGRESS_WEIGHTS | progressPercent unchanged |
| Step navigation logic references USER_VISIBLE_STEPS | Task 1.4.3 | displayStepIndex used for display |
| No hardcoded step numbers remain | All tasks | Code review confirms no magic numbers |
| All existing tests pass | Task 1.4.5 | Test suite green |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Constants not yet created (Task 1.1 incomplete) | Medium | Blocker | Verify Task 1.1 complete before starting |
| Merge conflict with Task 1.3 | Medium | Low | Coordinate timing, merge 1.3 first |
| showStepCounter prop missing | Medium | Blocker | Verify Task 1.3 complete before starting |
| Accessibility regression | Low | Medium | Update announcements to use display values |
| Test failures from changed step counts | Medium | Medium | Update all test assertions |

---

## Implementation Notes

1. **Type Casting**: `state.currentStep as any` is used when checking against constants due to TypeScript literal type inference. This is acceptable for runtime checks.

2. **Fallback Logic**: `displayStepIndex >= 0 ? displayStepIndex : displayTotalSteps - 1` handles the case where current step is not in USER_VISIBLE_STEPS (post-workflow), defaulting to showing the last step's index.

3. **canGoBack Override**: On post-workflow screens, `canGoBack` is forced to `false` because:
   - Item is already saved - nothing to "go back" to edit
   - Prevents confusing UX of navigating backward after completion

4. **showPrintPanel Handling**: Existing print panel logic (`showPrintPanel ? true : ...`) is preserved to maintain that feature's behavior.

5. **Coordination with Task 1.3**: Both tasks modify the WorkflowHeader usage. Task 1.3 adds the `showStepCounter` prop, Task 1.4 uses it. Run Task 1.3 first.

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Add imports | 5 min |
| Add computed values | 10 min |
| Update WorkflowHeader props | 10 min |
| Update accessibility announcement | 15 min |
| Update tests | 30 min |
| Manual testing | 15 min |
| **Total** | **~1.5 hours** |

---

## References

- **Request**: docs/gen_requests.md - REQ-199
- **Implementation Plan**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md (Task 1.4)
- **Upstream Tasks**:
  - REQ-196 (Task 1.1): docs/REQ-196-update-workflowsteps-constant-overview.md
  - REQ-197 (Task 1.2): docs/REQ-197-update-progressweights-overview.md
  - REQ-198 (Task 1.3): docs/REQ-198-update-workflowheader-to-hide-on-post-workflow-overview.md
- **Source Files**:
  - src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx
  - src/components/ItemCreationWorkflow/utils/constants.ts
  - src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts
