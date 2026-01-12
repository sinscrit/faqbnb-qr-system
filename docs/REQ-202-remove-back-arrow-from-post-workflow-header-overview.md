# REQ-202: Remove Back Navigation from Post-Workflow Header - Implementation Overview

**Generated:** 2026-01-12 22:30:00 UTC
**Last Modified:** 2026-01-12 22:30:00 UTC
**Request ID:** REQ-202
**Type:** ENHANCEMENT
**Size:** S
**Phase:** 2 - Fix "What's Next" Screen (ITEM-03) - HIGH Priority
**Task ID:** 2.2

---

## Summary

The workflow header should not display a back arrow or navigation control after users complete the item capture workflow and reach the "What's Next" screen. This prevents user confusion about whether the workflow is truly complete and encourages users to consciously choose their next action from the provided options.

---

## Current Behavior Analysis

### Code Investigation

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` (lines 618-625)

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

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` (lines 91-109)

```typescript
{/* Back button */}
<div className="w-12">
  {canGoBack && (
    <button
      type="button"
      onClick={onBack}
      className={cn(
        "flex items-center justify-center w-12 h-12",
        // ... styling
      )}
      aria-label="Go back to previous step"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  )}
</div>
```

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` (lines 921-923)

```typescript
const canGoBack = useMemo(() => {
  return state.stepHistory.length > 0;
}, [state.stepHistory.length]);
```

### Problem Identification

1. **`canGoBack` is computed from `stepHistory.length`**: Since users navigate through multiple steps before reaching `next-action`, the step history is non-empty, causing `canGoBack` to be `true`.

2. **No post-workflow detection**: The current implementation does not check if the user is on a post-workflow screen before rendering the back arrow.

3. **User confusion**: After saving an item, users see a back arrow suggesting they can return to modify the saved item, which conflicts with the fact that the item has already been committed.

---

## Implementation Strategy

The solution involves modifying `ItemCreationWorkflow.tsx` to detect when the current step is a post-workflow screen and conditionally disable the back navigation.

### Approach: Conditional `canGoBack` Override

Rather than modifying the WorkflowHeader component itself (which would require adding a new prop), we can simply override the `canGoBack` value passed to WorkflowHeader when the current step is a post-workflow screen.

**Key Insight from Plan-109:**
> Task 1.4 already specifies: `canGoBack={isPostWorkflow ? false : canGoBack}`

This approach:
- Keeps WorkflowHeader generic and reusable
- Centralizes post-workflow logic in the parent component
- Aligns with the existing pattern of conditional `canGoBack` for `showPrintPanel`

---

## Technical Implementation

### Step 1: Add Post-Workflow Screen Detection

Add a computed value to detect if the current step is a post-workflow screen.

**Location:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Before the WorkflowHeader JSX (around line 603-617):**

```typescript
// Determine if current step is a post-workflow screen
const isPostWorkflowScreen = useMemo(() => {
  return ['next-action', 'session-summary'].includes(state.currentStep);
}, [state.currentStep]);
```

### Step 2: Update WorkflowHeader Props

Modify the `canGoBack` prop passed to WorkflowHeader to be `false` on post-workflow screens.

**Change from:**
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

**Change to:**
```typescript
<WorkflowHeader
  currentStepIndex={currentStepIndex}
  totalSteps={totalSteps}
  progressPercent={progressPercent}
  canGoBack={showPrintPanel ? true : (isPostWorkflowScreen ? false : canGoBack)}
  onBack={showPrintPanel ? handleBackFromPrint : prevStep}
  onExit={handleExitClick}
/>
```

### Step 3: Import useMemo (if not already imported)

Ensure `useMemo` is imported from React. Looking at the current imports:

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
```

**Update to:**
```typescript
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
```

---

## Authorized Files and Functions for Modification

### Primary File

| File | Function/Section | Modification Type |
|------|------------------|-------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import statement (line 32) | Add `useMemo` to imports |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Component body (before line 603) | Add `isPostWorkflowScreen` computed value |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | WorkflowHeader props (lines 618-625) | Update `canGoBack` conditional logic |

### Test Files to Update

| File | Reason |
|------|--------|
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx` | Verify back arrow hidden on post-workflow |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx` | May need test for `canGoBack={false}` scenario |

---

## Dependencies

### Depends On (upstream)
- **Task 1.4** (Phase 1): The implementation plan specifies that Phase 1 Task 1.4 "Update ItemCreationWorkflow to use USER_VISIBLE_STEPS" establishes the pattern for `isPostWorkflow` detection. However, this task (2.2) can proceed independently if we use a simple array check.

### Blocks (downstream)
- **None**: This is a leaf task with no downstream dependencies.

### Parallel Safety
- **Files touched:**
  - `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- **Conflicts with:**
  - Task 1.4 (Phase 1) - both modify `ItemCreationWorkflow.tsx`, specifically the area around `WorkflowHeader` props
  - Task 2.1 (Phase 2) - may modify NextActionStep rendering logic in same component
- **Safe to parallelize with:**
  - Phase 3 tasks (StatisticsCards modifications)
  - Phase 4 tasks (Navigation menu in `layout.tsx`)
  - Phase 5 tasks (Type definitions and PreviewSaveStep)

---

## Acceptance Criteria Verification

| Criteria | Verification Method |
|----------|---------------------|
| No back arrow appears in the header when WhatsNextStep is displayed | Manual testing + unit test |
| Header remains visible for branding and context | Visual inspection |
| Users cannot navigate backward from WhatsNextStep using header controls | Unit test asserting button not rendered |
| The header styling appropriately reflects the completion state | Visual inspection |
| Existing navigation functionality on other steps remains unaffected | Regression testing existing step navigation |
| Tests verify that back navigation is not rendered on WhatsNextStep | New unit test case |

---

## Testing Requirements

### New Tests

```typescript
// In ItemCreationWorkflow test file
describe('Post-workflow header behavior', () => {
  it('should not render back arrow on next-action step', () => {
    // Setup: Navigate to next-action step
    // Assert: Back button is not in document
  });

  it('should not render back arrow on session-summary step', () => {
    // Setup: Navigate to session-summary step
    // Assert: Back button is not in document
  });

  it('should still render back arrow on preview-save step', () => {
    // Setup: Navigate to preview-save step with history
    // Assert: Back button IS in document
  });
});
```

### Regression Tests to Verify

- All existing navigation tests continue to pass
- Step progression through workflow still works
- Exit functionality still works on post-workflow screens

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Conflict with Task 1.4 changes | Medium | Low | Coordinate or sequence with Phase 1 |
| Breaking existing navigation | Low | High | Comprehensive regression testing |
| Print panel back navigation affected | Low | Medium | Careful conditional logic ordering |

---

## Implementation Checklist

- [ ] Add `useMemo` to React imports if not present
- [ ] Add `isPostWorkflowScreen` computed value
- [ ] Update `canGoBack` prop in WorkflowHeader JSX
- [ ] Write unit tests for post-workflow header state
- [ ] Run existing test suite to verify no regressions
- [ ] Manual testing on `next-action` and `session-summary` screens
- [ ] Verify print panel back navigation still works

---

## Related Documents

- **Source Request:** `docs/gen_requests.md` - REQ-202
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **Related Tasks:** Task 1.4 (Phase 1), Task 2.1 (Phase 2)
- **Related Components:**
  - `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
  - `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
  - `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
