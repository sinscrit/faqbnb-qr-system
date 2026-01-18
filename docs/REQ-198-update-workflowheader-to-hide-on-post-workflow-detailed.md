# REQ-198: Update WorkflowHeader to Hide on Post-Workflow Screens - Detailed Task Breakdown

**Generated:** 2026-01-12 15:30:00 UTC
**Last Modified:** 2026-01-12 13:58:00 UTC
**Request ID:** 198
**Overview Document:** docs/REQ-198-update-workflowheader-to-hide-on-post-workflow-overview.md
**Implementation Plan Reference:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 1 - Fix Workflow Step Count (ITEM-05)
**Task ID:** 1.3
**Priority:** HIGH

---

## Executive Summary

This document provides granular, actionable tasks to implement the `showStepCounter` prop in `WorkflowHeader`, enabling the step counter and progress bar to be hidden on post-workflow screens (`next-action` and `session-summary`). After users save an item at step 8, they should no longer see step navigation indicators.

**Total Estimated Effort:** ~1 hour (4 implementation tasks, each ≤ 1 story point)

---

## Prerequisites

Before starting implementation:

1. **Task 1.1 (REQ-196)** should be completed - This created the `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` constants in `constants.ts`
2. Verify constants exist:
   - `USER_VISIBLE_STEPS` (8 steps)
   - `POST_WORKFLOW_SCREENS` (`['next-action', 'session-summary']`)

---

## Task Breakdown

### Task 1.3.1: Add `showStepCounter` Prop to WorkflowHeaderProps Interface

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
**Lines to modify:** 34-49 (interface definition)
**Story Points:** 0.5
**Type:** Implementation

#### Description

Add a new optional boolean prop `showStepCounter` to the `WorkflowHeaderProps` interface that controls visibility of the step counter text and progress bar.

#### Current Code (lines 34-49)

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

#### Target Code

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
  /**
   * Whether to show the step counter and progress bar.
   * Set to false for post-workflow screens (next-action, session-summary).
   * @default true
   */
  showStepCounter?: boolean;
}
```

#### Acceptance Criteria

- [x] `showStepCounter` prop added to `WorkflowHeaderProps` interface
- [x] Prop is optional (marked with `?`)
- [x] JSDoc comment explains purpose and default value
- [x] TypeScript compilation passes with no errors

#### Verification Steps

1. Run `npx tsc --noEmit` - no type errors
2. Verify IntelliSense shows `showStepCounter` when using `WorkflowHeader`

#### Implementation Notes (2026-01-12)

**Status:** COMPLETED

- Added `showStepCounter?: boolean` prop to `WorkflowHeaderProps` interface at line 54
- Added JSDoc comment explaining purpose and default value
- Build passes successfully

---

### Task 1.3.2: Update WorkflowHeader Render Logic for Conditional Display

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
**Lines to modify:** 55-138 (component function)
**Story Points:** 1
**Type:** Implementation

#### Description

Modify the `WorkflowHeader` component to:
1. Destructure `showStepCounter` from props with default value `true`
2. Conditionally render the progress bar section
3. Conditionally render the step indicator text
4. Maintain layout structure when elements are hidden (use spacer div)

#### Current Code Structure (lines 55-138)

```typescript
export function WorkflowHeader({
  currentStepIndex,
  totalSteps,
  progressPercent,
  canGoBack,
  onBack,
  onExit,
  className,
}: WorkflowHeaderProps) {
  return (
    <header className={cn("bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]", className)}>
      {/* Progress bar - always shown */}
      <div className="w-full h-1 bg-gray-200" role="progressbar" ...>
        ...
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        <div className="w-12">...</div>

        {/* Step indicator - always shown */}
        <div className="text-sm font-medium text-gray-700">
          Step {currentStepIndex + 1} of {totalSteps}
        </div>

        {/* Exit button */}
        <div className="w-12">...</div>
      </div>
    </header>
  );
}
```

#### Target Code

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
    <header
      className={cn(
        "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
        className
      )}
    >
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
              backgroundColor: '#FF385C', // Airbnb brand primary
            }}
          />
        </div>
      )}

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        <div className="w-12">
          {canGoBack && (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "flex items-center justify-center w-12 h-12",
                "rounded-lg text-gray-700",
                "hover:bg-gray-100 active:bg-gray-200",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
              )}
              aria-label="Go back to previous step"
            >
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
          <div className="flex-1" aria-hidden="true" />
        )}

        {/* Exit button */}
        <div className="w-12">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className={cn(
                "flex items-center justify-center w-12 h-12",
                "rounded-lg text-gray-700",
                "hover:bg-gray-100 active:bg-gray-200",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
              )}
              aria-label="Exit workflow"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
```

#### Key Changes

1. **Line 63 (destructure):** Add `showStepCounter = true` to destructured props
2. **Lines 71-87 (progress bar):** Wrap in `{showStepCounter && (...)}` conditional
3. **Lines 111-117 (step indicator):** Replace unconditional div with ternary:
   - If `showStepCounter`: Show step text
   - Else: Show spacer div with `flex-1` to maintain layout

#### Acceptance Criteria

- [x] `showStepCounter` destructured with default value `true`
- [x] Progress bar only renders when `showStepCounter` is `true`
- [x] Step indicator only renders when `showStepCounter` is `true`
- [x] When `showStepCounter` is `false`:
  - No progress bar visible
  - No "Step X of Y" text visible
  - Exit button remains visible
  - Header structure maintained (no layout shift)
- [x] Backward compatible (existing usage without prop works unchanged)

#### Verification Steps

1. Manual test: Render with `showStepCounter={true}` - see progress bar and step text
2. Manual test: Render with `showStepCounter={false}` - no progress bar, no step text
3. Manual test: Render without prop - same as `true` (backward compatible)
4. Visual check: No layout shift when hiding elements

#### Implementation Notes (2026-01-12)

**Status:** COMPLETED

- Added `showStepCounter = true` to destructured props at line 69
- Wrapped progress bar in `{showStepCounter && (...)}` conditional at lines 78-96
- Added ternary for step indicator at lines 120-127 (shows spacer div when hidden)
- All 22 unit tests pass (including 9 new showStepCounter prop tests)

---

### Task 1.3.3: Update ItemCreationWorkflow to Pass `showStepCounter` Prop

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Lines to modify:** 618-625 (WorkflowHeader usage)
**Story Points:** 0.5
**Type:** Implementation

#### Description

Update the `ItemCreationWorkflow` component to:
1. Import `POST_WORKFLOW_SCREENS` constant (or define inline)
2. Compute `isPostWorkflow` state based on current step
3. Pass `showStepCounter={!isPostWorkflow}` to `WorkflowHeader`
4. Also set `canGoBack={false}` for post-workflow screens (item already saved)

#### Current Code (lines 618-625)

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

#### Target Code

Add near top of component (after state destructuring, around line 141):

```typescript
// REQ-198: Determine if current step is a post-workflow screen
const POST_WORKFLOW_SCREENS = ['next-action', 'session-summary'];
const isPostWorkflow = POST_WORKFLOW_SCREENS.includes(state.currentStep);
```

Update WorkflowHeader usage (lines 618-626):

```typescript
<WorkflowHeader
  currentStepIndex={currentStepIndex}
  totalSteps={totalSteps}
  progressPercent={progressPercent}
  canGoBack={showPrintPanel ? true : (isPostWorkflow ? false : canGoBack)}
  onBack={showPrintPanel ? handleBackFromPrint : prevStep}
  onExit={handleExitClick}
  showStepCounter={!isPostWorkflow}
/>
```

#### Key Changes

1. **New constant (line ~141):** Define `POST_WORKFLOW_SCREENS` array
2. **New computed value (line ~142):** `isPostWorkflow` checks if current step is post-workflow
3. **Line 622 (canGoBack):** Add nested ternary to disable back on post-workflow
4. **Line 626 (showStepCounter):** Pass `{!isPostWorkflow}` to hide step counter

#### Alternative: Import from constants.ts

If `POST_WORKFLOW_SCREENS` is already exported from `constants.ts` (via Task 1.1/REQ-196):

```typescript
// At imports section:
import { POST_WORKFLOW_SCREENS } from './utils/constants';

// In component:
const isPostWorkflow = (POST_WORKFLOW_SCREENS as readonly string[]).includes(state.currentStep);
```

#### Acceptance Criteria

- [x] `isPostWorkflow` computed correctly for `next-action` and `session-summary` steps
- [x] `showStepCounter={false}` passed when on post-workflow screens
- [x] `showStepCounter={true}` (or omitted) for all other steps
- [x] `canGoBack` is `false` on post-workflow screens (item already saved)
- [x] Print panel back navigation still works (`canGoBack={true}` when `showPrintPanel`)
- [x] No TypeScript errors

#### Verification Steps

1. Navigate to `preview-save` step - see "Step 8 of 8" and progress bar
2. Save item, navigate to `next-action` step - NO step counter, NO progress bar
3. Navigate to `session-summary` step - NO step counter, NO progress bar
4. Exit button visible on all screens
5. Back button hidden on `next-action` and `session-summary`

#### Implementation Notes (2026-01-12)

**Status:** COMPLETED

- Imported `POST_WORKFLOW_SCREENS` from `./utils/constants` at line 42
- Added `isPostWorkflow` computed value at line 145 using the Alternative approach (import from constants.ts)
- Updated WorkflowHeader usage at lines 623-632 with:
  - `canGoBack={showPrintPanel ? true : (isPostWorkflow ? false : canGoBack)}`
  - `showStepCounter={!isPostWorkflow}`
- Build passes successfully

---

### Task 1.3.4: Add Unit Tests for `showStepCounter` Prop

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx`
**Lines to add:** After line 103 (existing tests)
**Story Points:** 1
**Type:** Testing

#### Description

Add comprehensive unit tests for the new `showStepCounter` prop behavior, covering:
- Default behavior (backward compatibility)
- Explicit true value
- False value (hiding elements)
- Structure maintenance when hidden
- Exit button visibility when hidden

#### Current Test Structure (lines 11-103)

```typescript
describe('WorkflowHeader', () => {
  const defaultProps = {
    currentStepIndex: 2,
    totalSteps: 9,
    progressPercent: 30,
    canGoBack: true,
    onBack: vi.fn(),
    onExit: vi.fn(),
  };

  // ... existing tests ...
});
```

#### New Tests to Add (after line 102)

```typescript
  // =============================================================================
  // showStepCounter prop tests (REQ-198)
  // =============================================================================

  describe('showStepCounter prop', () => {
    it('shows step indicator and progress bar by default (no prop)', () => {
      render(<WorkflowHeader {...defaultProps} />);

      // Step indicator should be visible
      expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();

      // Progress bar should be visible
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows step indicator and progress bar when showStepCounter is true', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={true} />);

      expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('hides step indicator when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      expect(screen.queryByText('Step 3 of 9')).not.toBeInTheDocument();
      expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
    });

    it('hides progress bar when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('keeps exit button visible when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      expect(screen.getByLabelText('Exit workflow')).toBeInTheDocument();
    });

    it('maintains header element structure when showStepCounter is false', () => {
      render(<WorkflowHeader {...defaultProps} showStepCounter={false} />);

      // Header element should still exist
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('keeps back button behavior when showStepCounter is false', () => {
      const onBack = vi.fn();
      render(
        <WorkflowHeader
          {...defaultProps}
          showStepCounter={false}
          canGoBack={true}
          onBack={onBack}
        />
      );

      const backButton = screen.getByLabelText('Go back to previous step');
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('hides back button when both showStepCounter is false and canGoBack is false', () => {
      render(
        <WorkflowHeader
          {...defaultProps}
          showStepCounter={false}
          canGoBack={false}
        />
      );

      expect(screen.queryByLabelText('Go back to previous step')).not.toBeInTheDocument();
    });

    it('calls onExit when exit button clicked with showStepCounter false', () => {
      const onExit = vi.fn();
      render(
        <WorkflowHeader
          {...defaultProps}
          showStepCounter={false}
          onExit={onExit}
        />
      );

      fireEvent.click(screen.getByLabelText('Exit workflow'));
      expect(onExit).toHaveBeenCalledTimes(1);
    });
  });
```

#### Acceptance Criteria

- [x] Test: Default behavior shows step indicator and progress bar
- [x] Test: `showStepCounter={true}` shows step indicator and progress bar
- [x] Test: `showStepCounter={false}` hides step indicator
- [x] Test: `showStepCounter={false}` hides progress bar
- [x] Test: Exit button visible when `showStepCounter={false}`
- [x] Test: Header structure maintained when `showStepCounter={false}`
- [x] Test: Back button works when `showStepCounter={false}` and `canGoBack={true}`
- [x] Test: Back button hidden when both `showStepCounter={false}` and `canGoBack={false}`
- [x] Test: `onExit` called correctly when `showStepCounter={false}`
- [x] All tests pass: `npm test -- WorkflowHeader.test.tsx`

#### Verification Steps

1. Run: `npm test -- src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx`
2. Verify all new tests pass
3. Verify existing tests still pass (no regression)
4. Check test coverage includes new prop scenarios

#### Implementation Notes (2026-01-12)

**Status:** COMPLETED

- Added 9 new test cases in a nested `describe('showStepCounter prop', ...)` block
- All 22 tests pass (13 existing + 9 new)
- Tests cover: default behavior, explicit true/false, exit button visibility, header structure, back button behavior
- Test file updated with lastModified date

---

## Integration Testing Notes

After completing all tasks, verify end-to-end behavior:

### Test Scenario 1: Complete Workflow to Post-Workflow

1. Start new item creation workflow
2. Progress through all 8 steps (room → item type → specific item → purpose → content type → media capture → preview → save)
3. Verify "Step 8 of 8" shown at preview-save step
4. Save item successfully
5. Verify `next-action` screen shows:
   - ✅ Exit button visible
   - ❌ No step counter ("Step X of Y")
   - ❌ No progress bar
   - ❌ No back button
6. Navigate to `session-summary` screen - verify same behavior

### Test Scenario 2: Exit from Post-Workflow

1. Complete workflow to `next-action` step
2. Click exit button
3. Verify exit confirmation dialog appears
4. Confirm exit works correctly

### Test Scenario 3: Mobile Viewport

1. Resize browser to mobile width (375px)
2. Complete workflow to `next-action` step
3. Verify no step counter visible
4. Verify header layout is correct (no overflow, no layout shift)

---

## Authorized Files for Modification

| File | Change Type | Scope |
|------|-------------|-------|
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Interface + Component | Add prop, conditional rendering |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Component logic | Compute isPostWorkflow, pass prop |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx` | Tests | Add new test cases |

---

## Dependencies

### Upstream Dependencies

| Task | Description | Required? | Status |
|------|-------------|-----------|--------|
| Task 1.1 (REQ-196) | Create `POST_WORKFLOW_SCREENS` constant | Optional | Can define inline |
| Task 1.2 (REQ-197) | Update `PROGRESS_WEIGHTS` | No | Independent |

### Downstream Dependencies

| Task | Description | Impact |
|------|-------------|--------|
| Task 1.4 | Update ItemCreationWorkflow step calculations | Shares same file - coordinate changes |
| Phase 2 (ITEM-03) | What's Next screen redesign | Relies on hidden step counter |

### Files That May Conflict

- `ItemCreationWorkflow.tsx` - Also modified by Task 1.4
- Recommendation: Complete Task 1.3 before Task 1.4

---

## Rollback Plan

If issues arise after deployment:

1. **Revert WorkflowHeader changes:** Remove `showStepCounter` prop and conditional rendering
2. **Revert ItemCreationWorkflow changes:** Remove `isPostWorkflow` computation and prop passing
3. **Tests:** Keep new tests but mark as skipped until fix is ready

---

## Accessibility Considerations

- [ ] Header element (`<header>`) always present for landmark navigation
- [ ] Exit button always visible and focusable
- [ ] No keyboard trap when step counter is hidden
- [ ] Screen reader announces page content correctly without step counter
- [ ] Focus management unaffected (heading focus still works)

---

## References

- **Overview Document:** `docs/REQ-198-update-workflowheader-to-hide-on-post-workflow-overview.md`
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md`
- **PRD Item:** ITEM-05 (Step Count Fix)
- **Related Requests:** REQ-196 (Step constants), REQ-197 (Progress weights)
- **Existing Tests:** `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx`

---

## Implementation Summary (2026-01-12)

### Status: ALL TASKS COMPLETED

| Task | Description | Status |
|------|-------------|--------|
| Task 1.3.1 | Add `showStepCounter` prop to WorkflowHeaderProps interface | ✅ COMPLETED |
| Task 1.3.2 | Update WorkflowHeader render logic for conditional display | ✅ COMPLETED |
| Task 1.3.3 | Update ItemCreationWorkflow to pass `showStepCounter` prop | ✅ COMPLETED |
| Task 1.3.4 | Add unit tests for `showStepCounter` prop | ✅ COMPLETED |

### Verification Results

- **Build:** PASSED (`npm run build` completed successfully)
- **Unit Tests:** PASSED (22 tests, all passing)
- **Type Check:** Build verified TypeScript compilation

### Files Modified

1. `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
   - Added `showStepCounter?: boolean` prop to interface
   - Added conditional rendering for progress bar and step indicator
   - Updated lastModified date

2. `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
   - Imported `POST_WORKFLOW_SCREENS` from constants
   - Added `isPostWorkflow` computed value
   - Updated WorkflowHeader usage with `showStepCounter` and conditional `canGoBack`
   - Updated lastModified date

3. `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx`
   - Added 9 new test cases for `showStepCounter` prop
   - Updated lastModified date

### Behavior Summary

- **Steps 1-8 (user-visible workflow):** Step counter and progress bar visible, back navigation available
- **Post-workflow screens (next-action, session-summary):** Step counter and progress bar hidden, back button disabled, exit button remains visible
