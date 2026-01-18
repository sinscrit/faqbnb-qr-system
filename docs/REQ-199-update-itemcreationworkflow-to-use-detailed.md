# REQ-199: Update ItemCreationWorkflow to Use USER_VISIBLE_STEPS Constant

## Detailed Task Breakdown Document

**Document Created**: 2026-01-12 22:45 UTC
**Last Modified**: 2026-01-12 14:12 UTC
**Request ID**: REQ-199
**Phase**: 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID**: 1.4
**Implementation Plan Reference**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Overview Document**: docs/REQ-199-update-itemcreationworkflow-to-use-overview.md

---

## Executive Summary

This document provides a granular task breakdown for updating the `ItemCreationWorkflow` component to properly use `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` constants for accurate step counting and display. The goal is to ensure users see "Step X of 8" (not "Step X of 10") and that post-workflow screens hide the step counter entirely.

**Business Value**: Accurate step counting prevents user confusion about workflow progress and provides reliable feedback on remaining steps.

---

## Current State Analysis

### Implementation Status

Based on code review, **partial implementation already exists**:

**Already Implemented (in `ItemCreationWorkflow.tsx`):**
- Line 42: Import for `POST_WORKFLOW_SCREENS` exists
- Lines 143-145: `isPostWorkflow` computed value exists
- Lines 624-631: `WorkflowHeader` receives `showStepCounter={!isPostWorkflow}`

**NOT Yet Implemented:**
- `USER_VISIBLE_STEPS` is not imported in `ItemCreationWorkflow.tsx`
- `currentStepIndex` and `totalSteps` still come directly from hook (lines 121-122)
- Hook returns `totalSteps = WORKFLOW_STEPS.length` (10, not 8)
- Display values not transformed to use `USER_VISIBLE_STEPS`
- Accessibility announcements not updated to use display values
- Tests not updated for 8-step expectations

### Files Involved

| File | Current State | Required Changes |
|------|---------------|------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Partial implementation | Add USER_VISIBLE_STEPS import, transform display values |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Returns totalSteps=10 | No changes (keep internal navigation working) |
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx` | Expects 10 steps | Update to expect 8 steps |
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.a11y.test.tsx` | May reference step counts | Update accessibility expectations |

---

## Authorized Files for Modification

### Primary Implementation Files

| File Path | Authorized Modifications |
|-----------|--------------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import `USER_VISIBLE_STEPS`, add display value transformations, update WorkflowHeader props |

### Test Files

| File Path | Authorized Modifications |
|-----------|--------------------------|
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx` | Update step count expectations |
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.a11y.test.tsx` | Update accessibility announcements if referenced |
| `src/components/ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow.test.tsx` | Update end-to-end step display assertions |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Modified by Task 1.1 (REQ-196) - already has USER_VISIBLE_STEPS |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Modified by Task 1.5 (REQ-200) - keep internal navigation working |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Modified by Task 1.3 (REQ-198) - already has showStepCounter prop |

---

## Task Breakdown

### Task 1.4.1: Import USER_VISIBLE_STEPS Constant

**Story Points**: 0.25
**Priority**: REQUIRED
**Depends On**: Task 1.1 (REQ-196) must be complete

#### Description
Add import for `USER_VISIBLE_STEPS` constant from the constants file.

#### Implementation Details

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: Line 42 (existing import from constants)

**Current Code (line 42):**
```typescript
import { POST_WORKFLOW_SCREENS } from './utils/constants';
```

**Target Code:**
```typescript
import { POST_WORKFLOW_SCREENS, USER_VISIBLE_STEPS } from './utils/constants';
```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] `USER_VISIBLE_STEPS` is available for use in component

---

### Task 1.4.2: Add Display Value Transformations

**Story Points**: 0.5
**Priority**: REQUIRED
**Depends On**: Task 1.4.1

#### Description
Add computed values that transform internal step tracking to user-visible display values.

#### Implementation Details

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: After line 145 (after existing `isPostWorkflow` computation)

**Current Code (lines 143-145):**
```typescript
// REQ-198: Determine if current step is a post-workflow screen
// Post-workflow screens (next-action, session-summary) should not show step counter
const isPostWorkflow = (POST_WORKFLOW_SCREENS as readonly string[]).includes(state.currentStep);
```

**Add After Line 145:**
```typescript

// REQ-199: Compute display values using USER_VISIBLE_STEPS
// These values are used for UI display; internal navigation uses full WORKFLOW_STEPS
const displayStepIndex = useMemo(() => {
  const index = (USER_VISIBLE_STEPS as readonly string[]).indexOf(state.currentStep);
  // For post-workflow screens, return last visible step index
  return index >= 0 ? index : USER_VISIBLE_STEPS.length - 1;
}, [state.currentStep]);

const displayTotalSteps = USER_VISIBLE_STEPS.length; // 8 user-visible steps
```

**Required Import Update (add to existing imports at line 32):**
```typescript
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
```

#### Verification Steps
- [ ] `displayStepIndex` correctly returns 0-7 for user-visible steps
- [ ] `displayStepIndex` returns 7 (last step) for post-workflow screens
- [ ] `displayTotalSteps` equals 8
- [ ] No TypeScript errors

---

### Task 1.4.3: Update WorkflowHeader Props for Step Display

**Story Points**: 0.5
**Priority**: REQUIRED
**Depends On**: Task 1.4.2

#### Description
Update the WorkflowHeader component call to use transformed display values instead of raw hook values.

#### Implementation Details

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: Lines 624-632 (WorkflowHeader usage)

**Current Code:**
```typescript
{/* REQ-198: Hide step counter on post-workflow screens */}
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

**Target Code:**
```typescript
{/* REQ-198: Hide step counter on post-workflow screens */}
{/* REQ-199: Use display values for step counting (8 steps, not 10) */}
<WorkflowHeader
  currentStepIndex={displayStepIndex}
  totalSteps={displayTotalSteps}
  progressPercent={progressPercent}
  canGoBack={showPrintPanel ? true : (isPostWorkflow ? false : canGoBack)}
  onBack={showPrintPanel ? handleBackFromPrint : prevStep}
  onExit={handleExitClick}
  showStepCounter={!isPostWorkflow}
/>
```

#### Verification Steps
- [ ] WorkflowHeader displays "Step 1 of 8" at room-selection
- [ ] WorkflowHeader displays "Step 8 of 8" at preview-save
- [ ] WorkflowHeader hides step counter on next-action and session-summary
- [ ] Progress bar still functions correctly

---

### Task 1.4.4: Update Accessibility Announcements

**Story Points**: 0.5
**Priority**: REQUIRED (A11y compliance)
**Depends On**: Task 1.4.2

#### Description
Update the accessibility announcement effect to use display values so screen reader users hear accurate step counts.

#### Implementation Details

**File**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Location**: Lines 188-211 (accessibility useEffect)

**Current Code:**
```typescript
// REQ-114: Announce step changes to screen readers and manage focus
useEffect(() => {
  // Only announce if step actually changed
  if (previousStepRef.current !== state.currentStep) {
    const stepName = STEP_NAMES[state.currentStep] || state.currentStep;
    const announcement = getStepAnnouncement(currentStepIndex + 1, totalSteps, stepName);
    announce(announcement);
    // ... rest of effect
  }
}, [state.currentStep, currentStepIndex, totalSteps, announce]);
```

**Target Code:**
```typescript
// REQ-114: Announce step changes to screen readers and manage focus
// REQ-199: Use display values for accurate step announcements
useEffect(() => {
  // Only announce if step actually changed
  if (previousStepRef.current !== state.currentStep) {
    const stepName = STEP_NAMES[state.currentStep] || state.currentStep;

    // Only announce step numbers for user-visible steps
    // Post-workflow screens don't get step number announcements
    if (!isPostWorkflow) {
      const announcement = getStepAnnouncement(displayStepIndex + 1, displayTotalSteps, stepName);
      announce(announcement);
    } else {
      // For post-workflow, just announce the screen name
      announce(stepName);
    }

    // Focus main content area for keyboard navigation
    if (mainContentRef.current) {
      // Find the first heading in the step content and focus it
      const heading = mainContentRef.current.querySelector('h2, h3, [role="heading"]');
      if (heading && heading instanceof HTMLElement) {
        // Make heading focusable if it isn't already
        if (!heading.hasAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1');
        }
        heading.focus();
      }
    }

    previousStepRef.current = state.currentStep;
  }
}, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce]);
```

#### Verification Steps
- [ ] Screen reader announces "Step 1 of 8" at room-selection
- [ ] Screen reader announces "Step 8 of 8" at preview-save
- [ ] Screen reader announces only screen name (no step number) for post-workflow screens
- [ ] Focus management still works correctly
- [ ] No accessibility regressions

#### Accessibility Testing
- [ ] Test with VoiceOver (macOS)
- [ ] Test with keyboard-only navigation
- [ ] Verify ARIA announcements fire correctly

---

### Task 1.4.5: Update Unit Tests - Step Count Assertions

**Story Points**: 0.5
**Priority**: REQUIRED
**Depends On**: Tasks 1.4.1-1.4.4

#### Description
Update unit tests to expect 8 steps instead of 10 in step counter displays.

#### Implementation Details

**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx`

**Changes Required:**

1. **Update step count assertions:**
```typescript
// BEFORE:
expect(screen.getByText('Step 1 of 10')).toBeInTheDocument();

// AFTER:
expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
```

2. **Add test for post-workflow step counter hiding:**
```typescript
describe('Post-workflow step counter', () => {
  it('hides step counter on next-action step', async () => {
    // Render component and navigate to next-action step
    // ... setup code ...

    // Verify step counter is not present
    expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
  });

  it('hides step counter on session-summary step', async () => {
    // Render component and navigate to session-summary step
    // ... setup code ...

    // Verify step counter is not present
    expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
  });
});
```

3. **Update any regex patterns matching step format:**
```typescript
// BEFORE:
expect(screen.getByText(/Step \d+ of 10/)).toBeInTheDocument();

// AFTER:
expect(screen.getByText(/Step \d+ of 8/)).toBeInTheDocument();
```

#### Verification Steps
- [ ] All existing tests pass after modifications
- [ ] New post-workflow tests pass
- [ ] No test regressions

---

### Task 1.4.6: Update Accessibility Tests

**Story Points**: 0.25
**Priority**: REQUIRED
**Depends On**: Task 1.4.4

#### Description
Update accessibility tests to verify correct step announcements with 8-step count.

#### Implementation Details

**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.a11y.test.tsx`

**Changes Required:**

1. **Update step announcement expectations:**
```typescript
// BEFORE (if present):
expect(announcement).toContain('Step 1 of 10');

// AFTER:
expect(announcement).toContain('Step 1 of 8');
```

2. **Add test for post-workflow announcements:**
```typescript
it('announces screen name without step number for post-workflow screens', async () => {
  // Navigate to next-action step
  // Verify announcement is screen name only, no step number
  expect(announcement).not.toMatch(/Step \d+ of \d+/);
});
```

#### Verification Steps
- [ ] Accessibility tests pass
- [ ] Step announcements are accurate
- [ ] Post-workflow announcements are appropriate

---

### Task 1.4.7: Update Integration Tests

**Story Points**: 0.5
**Priority**: REQUIRED
**Depends On**: Tasks 1.4.1-1.4.6

#### Description
Update integration tests to verify complete workflow displays correct step counts.

#### Implementation Details

**Files**:
- `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
- `src/components/ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow.test.tsx`

**Changes Required:**

1. **Update workflow flow assertions:**
```typescript
// Verify step progression shows 8 steps
it('displays correct step progression through workflow', async () => {
  // Step 1
  expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();

  // Navigate to step 2
  await user.click(screen.getByRole('button', { name: /continue/i }));
  expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();

  // ... continue through workflow ...

  // Step 8 (preview-save)
  expect(screen.getByText('Step 8 of 8')).toBeInTheDocument();

  // Post-workflow (no step counter)
  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(screen.queryByText(/Step \d+ of \d+/)).not.toBeInTheDocument();
});
```

2. **Update progress assertions:**
```typescript
// Verify progress reaches 100% at step 8
expect(progressBar).toHaveAttribute('aria-valuenow', '100');
```

#### Verification Steps
- [ ] Integration tests pass
- [ ] End-to-end workflow shows correct step counts
- [ ] Progress bar reaches 100% at preview-save (step 8)

---

### Task 1.4.8: Manual Testing and Verification

**Story Points**: 0.5
**Priority**: REQUIRED
**Depends On**: All previous tasks

#### Description
Perform manual testing to verify all changes work correctly in the browser.

#### Test Scenarios

**Scenario 1: Step Counter Display**
- [ ] Navigate through all 8 user-visible steps
- [ ] Verify "Step 1 of 8" at room-selection
- [ ] Verify "Step 2 of 8" at item-type-selection
- [ ] Verify "Step 3 of 8" at specific-item-selection
- [ ] Verify "Step 4 of 8" at purpose-selection
- [ ] Verify "Step 5 of 8" at content-type-selection
- [ ] Verify "Step 6 of 8" at media-capture
- [ ] Verify "Step 7 of 8" at content-creation (if used)
- [ ] Verify "Step 8 of 8" at preview-save

**Scenario 2: Post-Workflow Screens**
- [ ] Complete save and navigate to next-action
- [ ] Verify step counter is NOT visible
- [ ] Navigate to session-summary
- [ ] Verify step counter is NOT visible
- [ ] Verify back button is disabled on post-workflow screens

**Scenario 3: Progress Bar**
- [ ] Progress bar shows ~12% at step 1
- [ ] Progress bar shows 100% at step 8
- [ ] Progress bar stays at 100% on post-workflow screens

**Scenario 4: Mobile View**
- [ ] Step counter displays correctly on mobile viewport
- [ ] Post-workflow screens work correctly on mobile

**Scenario 5: Accessibility**
- [ ] Enable VoiceOver and navigate through workflow
- [ ] Verify step announcements match displayed step counts
- [ ] Verify post-workflow screens announce appropriately

#### Verification Steps
- [ ] All manual test scenarios pass
- [ ] No visual regressions
- [ ] No console errors

---

## Task Summary Table

| Task ID | Description | Story Points | Priority | Status |
|---------|-------------|--------------|----------|--------|
| 1.4.1 | Import USER_VISIBLE_STEPS constant | 0.25 | REQUIRED | ✅ COMPLETE |
| 1.4.2 | Add display value transformations | 0.5 | REQUIRED | ✅ COMPLETE |
| 1.4.3 | Update WorkflowHeader props | 0.5 | REQUIRED | ✅ COMPLETE |
| 1.4.4 | Update accessibility announcements | 0.5 | REQUIRED | ✅ COMPLETE |
| 1.4.5 | Update unit tests | 0.5 | REQUIRED | ✅ COMPLETE |
| 1.4.6 | Update accessibility tests | 0.25 | REQUIRED | ✅ COMPLETE |
| 1.4.7 | Update integration tests | 0.5 | REQUIRED | ✅ COMPLETE |
| 1.4.8 | Manual testing and verification | 0.5 | REQUIRED | ⏳ PENDING (Browser testing recommended) |
| **Total** | | **3.5** | | |

**Implementation Notes (2026-01-12 14:12 UTC)**:
- Task 1.4.1-1.4.4: Core implementation complete in ItemCreationWorkflow.tsx
- Task 1.4.5-1.4.7: Tests updated to expect 8 steps instead of 9/10
- Task 1.4.8: Manual testing not performed in this session; browser verification recommended
- Accessibility tests pass (19/19)
- Build/type-check verification blocked by pre-existing project configuration issues (PostCSS, Next.js 15 API routes)

---

## Dependencies

### Upstream Dependencies (Must Complete First)

| Task | Status | Reason |
|------|--------|--------|
| Task 1.1 (REQ-196) | COMPLETE | USER_VISIBLE_STEPS constant must exist |
| Task 1.2 (REQ-197) | COMPLETE | PROGRESS_WEIGHTS must reach 100% at preview-save |
| Task 1.3 (REQ-198) | COMPLETE | showStepCounter prop must exist on WorkflowHeader |

### Downstream Dependencies (Blocked By This)

| Task | Reason |
|------|--------|
| Task 1.5 (REQ-200) | May add hook-level computed values building on this pattern |
| Phase 2 (ITEM-03) | Uses step counting and header hiding from this task |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type errors from constant imports | Low | Medium | Verify Task 1.1 complete, use type assertions |
| Test failures from step count changes | High | Medium | Systematic test updates in tasks 1.4.5-1.4.7 |
| Accessibility regression | Medium | High | Dedicated a11y testing in tasks 1.4.4, 1.4.6 |
| useMemo dependency issues | Low | Low | Careful dependency array management |

---

## Code Review Checklist

- [ ] Import statement correctly adds USER_VISIBLE_STEPS
- [ ] useMemo has correct dependency array
- [ ] displayStepIndex handles post-workflow case correctly
- [ ] displayTotalSteps equals 8
- [ ] WorkflowHeader receives display values, not raw hook values
- [ ] Accessibility announcements use display values
- [ ] All test assertions updated to expect 8 steps
- [ ] No console warnings or errors
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate**: Revert `ItemCreationWorkflow.tsx` to previous version
2. **Tests**: Revert test files to previous expectations
3. **Verify**: Run test suite to confirm rollback successful

Rollback commands:
```bash
git checkout HEAD~1 -- src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx
git checkout HEAD~1 -- src/components/ItemCreationWorkflow/__tests__/*.test.tsx
```

---

## References

- **Request**: docs/gen_requests.md - REQ-199
- **Overview**: docs/REQ-199-update-itemcreationworkflow-to-use-overview.md
- **Implementation Plan**: docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
- **Source Files**:
  - src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx
  - src/components/ItemCreationWorkflow/utils/constants.ts
  - src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts
- **Upstream Tasks**:
  - REQ-196 (Task 1.1): Create USER_VISIBLE_STEPS constant
  - REQ-197 (Task 1.2): Update PROGRESS_WEIGHTS
  - REQ-198 (Task 1.3): Add showStepCounter prop to WorkflowHeader
