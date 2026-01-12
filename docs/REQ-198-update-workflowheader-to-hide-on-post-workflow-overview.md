# REQ-198: Update WorkflowHeader to Hide on Post-Workflow Screens

**Generated:** 2026-01-12 14:30:00 UTC
**Last Modified:** 2026-01-12 14:30:00 UTC
**Request ID:** 198
**Implementation Plan Reference:** Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 1 - Fix Workflow Step Count (ITEM-05)
**Task ID:** 1.3
**Priority:** HIGH

---

## Summary

Update the `WorkflowHeader` component to conditionally hide the step counter and progress bar on post-workflow screens (`next-action` and `session-summary`). After saving an item (step 8 "Save Item"), users should no longer see "Step 9 of 10" or similar indicators - these are post-workflow decision screens, not numbered steps.

---

## Problem Statement

### Current Behavior

The `WorkflowHeader` component currently displays:
- **Step counter:** "Step X of 10" for ALL workflow steps including post-workflow screens
- **Progress bar:** Shows progress percentage for all steps

When users reach the "What's Next" screen after saving their item:
- They see "Step 9 of 10" which incorrectly implies more numbered steps remain
- The progress bar shows 88% instead of being hidden or at 100%
- This creates confusion about how many "real" steps the workflow has

### Expected Behavior

Per the PRD (ITEM-05):
- The workflow should have **8 numbered steps** ending at "Save Item" (preview-save)
- "What's Next" (next-action) and "Session Summary" (session-summary) are **post-workflow screens**
- Post-workflow screens should NOT display:
  - Step counter ("Step X of Y")
  - Progress bar
- Exit button should remain available

### User Impact

- Users see "Step 9 of 10" on What's Next screen - confusing since item is already saved
- Creates impression workflow is incomplete when item is actually saved
- Contradicts mental model of "Save = Done"

---

## Technical Investigation

### File: `WorkflowHeader.tsx`

**Location:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Current Props Interface (lines 34-49):**
```typescript
export interface WorkflowHeaderProps {
  /** Current step index (0-based) */
  currentStepIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Whether back navigation is available */
  canGoBack: boolean;
  /** Called when back button is clicked */
  onBack: () => void;
  /** Called when close/exit button is clicked */
  onExit?: () => void;
  /** Optional CSS class name */
  className?: string;
}
```

**Current Render Structure (lines 64-137):**
- Progress bar with `role="progressbar"` (lines 72-87)
- Navigation controls container (lines 90-135)
  - Back button (conditional on `canGoBack`)
  - Step indicator: `Step {currentStepIndex + 1} of {totalSteps}` (lines 111-114)
  - Exit button (conditional on `onExit`)

### File: `ItemCreationWorkflow.tsx`

**Location:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Current WorkflowHeader Usage (lines 618-625):**
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

**Values from `useWorkflowState` hook:**
- `currentStepIndex`: Index from `WORKFLOW_STEPS.indexOf(state.currentStep)` - returns 8 for `next-action`, 9 for `session-summary`
- `totalSteps`: `WORKFLOW_STEPS.length` = 10
- `progressPercent`: From `PROGRESS_WEIGHTS[state.currentStep]` - returns 88% for `next-action`, 100% for `session-summary`

### File: `useWorkflowState.ts`

**Location:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Current Step Calculation (lines 929-933):**
```typescript
const currentStepIndex = useMemo(() => {
  return WORKFLOW_STEPS.indexOf(state.currentStep);
}, [state.currentStep]);

const totalSteps = WORKFLOW_STEPS.length;
```

### File: `constants.ts`

**Location:** `src/components/ItemCreationWorkflow/utils/constants.ts`

**Current WORKFLOW_STEPS (lines 450-461):**
```typescript
export const WORKFLOW_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'content-creation',         // Step 7
  'preview-save',             // Step 8 - FINAL numbered step
  'next-action',              // Post-workflow (should NOT be numbered)
  'session-summary',          // Post-workflow (should NOT be numbered)
] as const;
```

---

## Solution Design

### Approach: Add `showStepCounter` Prop to WorkflowHeader

The simplest approach is to add a `showStepCounter` boolean prop to `WorkflowHeader` that controls visibility of both the step counter text AND the progress bar.

**Why this approach:**
1. **Minimal changes:** Single prop addition to WorkflowHeader
2. **Explicit control:** Parent component (ItemCreationWorkflow) decides when to hide
3. **Testable:** Easy to test both states
4. **No breaking changes:** Prop is optional with default behavior preserved

### Alternative Approaches Considered

| Approach | Pros | Cons |
|----------|------|------|
| Add `showStepCounter` prop | Simple, explicit, testable | Requires parent to compute post-workflow state |
| Pass step name to header, let it decide | Encapsulated logic | Couples header to workflow step knowledge |
| New `PostWorkflowHeader` component | Clear separation | Duplicates exit button logic |
| CSS-only with data attribute | No prop changes | Less explicit, harder to test |

**Selected:** Add `showStepCounter` prop - cleanest API with least coupling.

---

## Implementation Tasks

### Task 1.3.1: Update WorkflowHeaderProps Interface

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Change:** Add `showStepCounter` prop to interface.

```typescript
export interface WorkflowHeaderProps {
  // ... existing props
  /** Whether to show the step counter and progress bar. Defaults to true. */
  showStepCounter?: boolean;
}
```

### Task 1.3.2: Update WorkflowHeader Render Logic

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Changes:**
1. Destructure `showStepCounter` from props with default `true`
2. Conditionally render progress bar section
3. Conditionally render step indicator text

**Updated render structure:**
```typescript
export function WorkflowHeader({
  currentStepIndex,
  totalSteps,
  progressPercent,
  canGoBack,
  onBack,
  onExit,
  className,
  showStepCounter = true,  // NEW: Default to showing step counter
}: WorkflowHeaderProps) {
  return (
    <header className={cn("bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]", className)}>
      {/* Progress bar - conditionally rendered */}
      {showStepCounter && (
        <div
          className="w-full h-1 bg-gray-200"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: '#FF385C',
            }}
          />
        </div>
      )}

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button - unchanged */}
        <div className="w-12">
          {canGoBack && (
            <button type="button" onClick={onBack} /* ... */>
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Step indicator - conditionally rendered */}
        {showStepCounter ? (
          <div className="text-sm font-medium text-gray-700">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
        ) : (
          <div className="flex-1" /> {/* Spacer to maintain layout */}
        )}

        {/* Exit button - unchanged */}
        <div className="w-12">
          {onExit && (
            <button type="button" onClick={onExit} /* ... */>
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Task 1.3.3: Update ItemCreationWorkflow to Pass showStepCounter

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Changes:**
1. Import `POST_WORKFLOW_SCREENS` constant (or define inline)
2. Compute `isPostWorkflow` state
3. Pass `showStepCounter={!isPostWorkflow}` to WorkflowHeader

**Implementation:**
```typescript
// Near top of component, after state destructuring:
const POST_WORKFLOW_SCREENS = ['next-action', 'session-summary'];
const isPostWorkflow = POST_WORKFLOW_SCREENS.includes(state.currentStep);

// Update WorkflowHeader usage:
<WorkflowHeader
  currentStepIndex={currentStepIndex}
  totalSteps={totalSteps}
  progressPercent={progressPercent}
  canGoBack={showPrintPanel ? true : (isPostWorkflow ? false : canGoBack)}
  onBack={showPrintPanel ? handleBackFromPrint : prevStep}
  onExit={handleExitClick}
  showStepCounter={!isPostWorkflow}  // NEW: Hide on post-workflow screens
/>
```

**Note:** Also set `canGoBack={false}` for post-workflow screens per Task 1.4 requirements (item already saved, nothing to go back to).

### Task 1.3.4: Add Unit Tests for showStepCounter Prop

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx`

**New test cases:**
```typescript
describe('showStepCounter prop', () => {
  it('shows step indicator by default', () => {
    render(<WorkflowHeader {...defaultProps} />);
    expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows step indicator when showStepCounter is true', () => {
    render(<WorkflowHeader {...defaultProps} showStepCounter={true} />);
    expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('hides step indicator when showStepCounter is false', () => {
    render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);
    expect(screen.queryByText('Step 3 of 9')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('keeps exit button visible when showStepCounter is false', () => {
    render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);
    expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();
  });

  it('maintains header structure when showStepCounter is false', () => {
    render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
```

---

## Authorized Files and Functions for Modification

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | `WorkflowHeaderProps` interface | Add `showStepCounter` prop |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | `WorkflowHeader` component render | Conditional rendering logic |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Component body (near line 618) | Compute `isPostWorkflow`, pass prop |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx` | Test suite | Add new test cases |

---

## Dependencies

### Depends On (upstream)

- **Task 1.1:** Update WORKFLOW_STEPS constant to separate user-visible steps
  - Reason: This task uses the concept of POST_WORKFLOW_SCREENS which may be formalized as a constant in Task 1.1
  - However, Task 1.3 can proceed independently by defining the screens inline

- **Task 1.2:** Update PROGRESS_WEIGHTS
  - Reason: Progress bar behavior when hidden doesn't affect this task directly
  - Can run in parallel

### Blocks (downstream)

- **Task 1.4:** Update ItemCreationWorkflow to use USER_VISIBLE_STEPS
  - Reason: Task 1.4 will also modify `ItemCreationWorkflow.tsx` around the WorkflowHeader usage
  - Coordination needed to avoid merge conflicts

- **Phase 2 (ITEM-03):** What's Next Screen refactoring
  - Reason: What's Next screen relies on header not showing step counter

### Parallel Safety

- **Files touched:**
  - `WorkflowHeader.tsx` - Only this task modifies
  - `WorkflowHeader.test.tsx` - Only this task modifies
  - `ItemCreationWorkflow.tsx` - **SHARED** with Task 1.4

- **Conflicts with:**
  - Task 1.4: Both modify WorkflowHeader usage in ItemCreationWorkflow.tsx
  - Recommendation: Run Task 1.3 BEFORE Task 1.4, OR coordinate changes

- **Safe to parallelize with:**
  - Task 1.1 (constants.ts)
  - Task 1.2 (PROGRESS_WEIGHTS)
  - Task 1.5 (useWorkflowState.ts)
  - Phase 3 (Dashboard cards - different files)
  - Phase 4 (Navigation menu - different files)

---

## Acceptance Criteria

1. [ ] `WorkflowHeader` accepts optional `showStepCounter` prop (defaults to `true`)
2. [ ] When `showStepCounter={false}`:
   - Progress bar is NOT rendered
   - Step indicator text is NOT rendered
   - Exit button IS still rendered
   - Header element structure is maintained
3. [ ] When `showStepCounter={true}` or not provided:
   - Progress bar IS rendered (unchanged from current)
   - Step indicator IS rendered (unchanged from current)
4. [ ] ItemCreationWorkflow passes `showStepCounter={false}` for `next-action` and `session-summary` steps
5. [ ] All existing WorkflowHeader tests pass
6. [ ] New tests for `showStepCounter` prop pass
7. [ ] Build completes without errors

---

## Testing Requirements

### Unit Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Default render (no showStepCounter prop) | Shows step indicator and progress bar |
| showStepCounter={true} | Shows step indicator and progress bar |
| showStepCounter={false} | Hides step indicator and progress bar |
| showStepCounter={false} + exit button | Exit button still visible |
| showStepCounter={false} + back button | Back button behavior unchanged |
| Header structure with showStepCounter={false} | `<header>` element still present |

### Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Workflow at `preview-save` step | Shows "Step 8 of 8" |
| Workflow at `next-action` step | No step counter visible |
| Workflow at `session-summary` step | No step counter visible |
| Exit from post-workflow screen | Exit dialog appears |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Update WorkflowHeaderProps interface | 5 min |
| Update WorkflowHeader render logic | 15 min |
| Update ItemCreationWorkflow | 10 min |
| Add unit tests | 20 min |
| Manual testing | 10 min |
| **Total** | **~1 hour** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Merge conflict with Task 1.4 | Medium | Low | Coordinate timing, merge 1.3 first |
| Layout shift when hiding progress bar | Low | Medium | Use spacer div to maintain layout |
| Accessibility regression | Low | Medium | Keep header element, test with screen reader |

---

## References

- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **PRD Item:** ITEM-05 (Step Count Fix)
- **Related Tasks:** 1.1, 1.2, 1.4, 1.5 (all Phase 1)
- **Existing Component:** `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` (demonstrates post-workflow pattern)
