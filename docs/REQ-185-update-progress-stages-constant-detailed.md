# REQ-185: Update Progress Stages Constant - Detailed Task Breakdown

**Document Created**: 2026-01-12 23:15:00
**Last Modified**: 2026-01-12 00:51:00
**Request ID**: REQ-185
**Type**: BUG FIX
**Size**: S
**Phase**: 1 - REQ-5 - Fix Workflow Step Count
**Task ID**: 1.1
**Overview Document**: docs/REQ-185-update-progress-stages-constant-overview.md
**Implementation Plan Reference**: docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Executive Summary

This document provides granular, actionable implementation tasks for fixing a missing step mapping in the `STEP_TO_STAGE_INDEX` constant within `ProgressIndicator.tsx`. The `add-url` wizard step is not mapped, causing incorrect progress display when users navigate to the URL input step.

---

## Problem Statement

The `STEP_TO_STAGE_INDEX` constant in `ProgressIndicator.tsx` (lines 65-75) is missing the `add-url` step mapping. When users navigate to the URL input step, the `getCurrentStageIndex()` function falls back to index 0 via the `?? 0` fallback, incorrectly showing "Step 1 of 4" instead of "Step 2 of 4".

### Root Cause
The `add-url` wizard step (defined in `ItemCapture.types.ts` line 257) was added to the `WizardStep` type but the corresponding mapping in `STEP_TO_STAGE_INDEX` was not updated.

### Expected Behavior
- Progress indicator shows "Step 2 of 4" when on `add-url` step
- All wizard steps have explicit mappings in `STEP_TO_STAGE_INDEX`
- TypeScript enforces completeness of the mapping at compile time

---

## Authorized Files for Modification

| File | Location | Change Type |
|------|----------|-------------|
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Lines 65-75 | Add `add-url` to `STEP_TO_STAGE_INDEX` |
| `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx` | `describe('ProgressIndicator')` | Add test for `add-url` step |

---

## Detailed Tasks

### Task 1.1.1: Add Missing `add-url` Mapping to STEP_TO_STAGE_INDEX

**Story Points**: 0.5
**Estimated Effort**: 5 minutes
**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines**: 65-75

#### Description
Add the missing `add-url` step mapping to the `STEP_TO_STAGE_INDEX` constant, mapping it to stage index 1 (Content stage).

#### Current Code (lines 65-75)
```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
};
```

#### Required Changes
Insert `'add-url': 1,` after the `'write-text': 1,` line to maintain logical ordering with other content capture steps:

```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'add-url': 1,         // Stage 2: Content
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
};
```

#### Implementation Steps
1. Open `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. Locate the `STEP_TO_STAGE_INDEX` constant (lines 65-75)
3. Add `'add-url': 1,` after `'write-text': 1,` line
4. Add comment `// Stage 2: Content` to match existing pattern
5. Save the file

#### Verification Steps
- [ ] File saves without syntax errors
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] `add-url` is present in `STEP_TO_STAGE_INDEX`
- [ ] Value is `1` (Content stage)

#### Acceptance Criteria
- [ ] `STEP_TO_STAGE_INDEX` contains `'add-url': 1`
- [ ] Comment follows existing pattern (`// Stage 2: Content`)
- [ ] No TypeScript errors
- [ ] File formatting is consistent with existing code

---

### Task 1.1.2: Update Unit Test to Include `add-url` in Content Steps Array

**Story Points**: 0.5
**Estimated Effort**: 5 minutes
**File**: `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
**Lines**: 27-31

#### Description
Update the existing test case that verifies content capture steps return stage index 1 to include the `add-url` step.

#### Current Code (lines 27-31)
```typescript
it('returns 1 for content capture steps', () => {
  const contentSteps: WizardStep[] = ['content-type', 'capture-video', 'capture-photo', 'upload-file', 'write-text', 'add-more'];
  contentSteps.forEach(step => {
    expect(getCurrentStageIndex(step)).toBe(1);
  });
});
```

#### Required Changes
Add `'add-url'` to the `contentSteps` array:

```typescript
it('returns 1 for content capture steps', () => {
  const contentSteps: WizardStep[] = ['content-type', 'capture-video', 'capture-photo', 'upload-file', 'write-text', 'add-url', 'add-more'];
  contentSteps.forEach(step => {
    expect(getCurrentStageIndex(step)).toBe(1);
  });
});
```

#### Implementation Steps
1. Open `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
2. Locate the `'returns 1 for content capture steps'` test (lines 27-31)
3. Add `'add-url'` to the `contentSteps` array after `'write-text'`
4. Save the file

#### Verification Steps
- [ ] Test file saves without syntax errors
- [ ] Run test: `npm test -- --testPathPattern="wizard-navigation" --testNamePattern="returns 1 for content capture steps"`
- [ ] Test passes

#### Acceptance Criteria
- [ ] `add-url` is included in `contentSteps` array
- [ ] Test passes when executed
- [ ] Array order is logical (add-url after write-text, before add-more)

---

### Task 1.1.3: Add Dedicated Test for `add-url` Step Display

**Story Points**: 0.5
**Estimated Effort**: 10 minutes
**File**: `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
**Section**: `describe('ProgressIndicator')` > `describe('rendering')`

#### Description
Add a dedicated test case to verify that the `add-url` step displays "Step 2 of 4" in the mobile view.

#### Location
Add after the existing `'displays correct step count on mobile'` test (around line 48).

#### New Test Code
```typescript
it('displays correct step count for add-url step', () => {
  render(<ProgressIndicator currentStep="add-url" />);
  expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

#### Implementation Steps
1. Open `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
2. Navigate to the `describe('rendering')` block within `describe('ProgressIndicator')`
3. Add the new test case after the existing mobile step count test
4. Save the file

#### Verification Steps
- [ ] Test file saves without syntax errors
- [ ] Run test: `npm test -- --testPathPattern="wizard-navigation" --testNamePattern="displays correct step count for add-url step"`
- [ ] Test passes

#### Acceptance Criteria
- [ ] New test case exists for `add-url` step
- [ ] Test verifies "Step 2 of 4" text
- [ ] Test verifies "Content" label display
- [ ] Test passes when executed

---

### Task 1.1.4: Verify Progress Bar Width for `add-url` Step

**Story Points**: 0.5
**Estimated Effort**: 5 minutes
**File**: `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
**Section**: `describe('ProgressIndicator')` > `describe('rendering')`

#### Description
Add a test to verify the progress bar shows 50% width when on the `add-url` step (stage 2 of 4).

#### Location
Add after the new `add-url` display test.

#### New Test Code
```typescript
it('renders progress bar with correct width for add-url step', () => {
  const { container } = render(<ProgressIndicator currentStep="add-url" />);
  const progressBar = container.querySelector('[style*="width: 50%"]');
  expect(progressBar).toBeInTheDocument();
});
```

#### Implementation Steps
1. Open `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
2. Add the new test case after the step display test
3. Save the file

#### Verification Steps
- [ ] Test file saves without syntax errors
- [ ] Run test: `npm test -- --testPathPattern="wizard-navigation" --testNamePattern="renders progress bar with correct width for add-url step"`
- [ ] Test passes

#### Acceptance Criteria
- [ ] Test verifies 50% progress bar width for `add-url` step
- [ ] Test passes when executed

---

### Task 1.1.5: Verify ARIA Label for `add-url` Step

**Story Points**: 0.5
**Estimated Effort**: 5 minutes
**File**: `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
**Section**: `describe('ProgressIndicator')` > `describe('accessibility')`

#### Description
Add a test to verify the ARIA label correctly describes the step position for the `add-url` step.

#### Location
Add within the `describe('accessibility')` block (after line 101).

#### New Test Code
```typescript
it('has descriptive aria-label for add-url step', () => {
  render(<ProgressIndicator currentStep="add-url" />);
  const progressbar = screen.getByRole('progressbar');
  expect(progressbar).toHaveAttribute('aria-label', 'Step 2 of 4: Content');
});
```

#### Implementation Steps
1. Open `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
2. Navigate to the `describe('accessibility')` block within `describe('ProgressIndicator')`
3. Add the new ARIA test case
4. Save the file

#### Verification Steps
- [ ] Test file saves without syntax errors
- [ ] Run test: `npm test -- --testPathPattern="wizard-navigation" --testNamePattern="has descriptive aria-label for add-url step"`
- [ ] Test passes
- [ ] ARIA label includes "Step 2 of 4: Content"

#### Acceptance Criteria
- [ ] Accessibility test exists for `add-url` step
- [ ] Test verifies correct aria-label attribute
- [ ] Test passes when executed

---

### Task 1.1.6: Run Full Test Suite and Verify No Regressions

**Story Points**: 0.5
**Estimated Effort**: 10 minutes
**Scope**: All wizard navigation tests

#### Description
Run the complete test suite for wizard navigation components to ensure no regressions were introduced.

#### Implementation Steps
1. Run full test suite: `npm test -- --testPathPattern="wizard-navigation"`
2. Review test output for any failures
3. Verify all existing tests continue to pass
4. Verify all new tests pass

#### Verification Commands
```bash
# Run all wizard navigation tests
npm test -- --testPathPattern="wizard-navigation"

# Run with verbose output
npm test -- --testPathPattern="wizard-navigation" --verbose

# Run with coverage
npm test -- --testPathPattern="wizard-navigation" --coverage
```

#### Expected Results
- All tests in `describe('ProgressIndicator')` pass
- All tests in `describe('StepNavigation')` pass
- All tests in `describe('CaptureWizard')` pass
- No console errors or warnings

#### Acceptance Criteria
- [ ] All 30+ existing tests pass
- [ ] All 4 new tests pass
- [ ] No console warnings or errors
- [ ] Test execution completes without timeout

---

### Task 1.1.7: Build Verification

**Story Points**: 0.5
**Estimated Effort**: 5 minutes
**Scope**: Full application build

#### Description
Verify the application builds successfully with the changes and no TypeScript errors are introduced.

#### Implementation Steps
1. Run TypeScript type check: `npx tsc --noEmit`
2. Run production build: `npm run build`
3. Verify no errors or warnings

#### Verification Commands
```bash
# Type check only
npx tsc --noEmit

# Full build
npm run build
```

#### Expected Results
- TypeScript compiles with no errors
- Build completes successfully
- No new warnings introduced

#### Acceptance Criteria
- [ ] TypeScript type check passes
- [ ] Production build succeeds
- [ ] No new linting errors

---

### Task 1.1.8: Manual Verification - URL Input Step Progress Display

**Story Points**: 0.5
**Estimated Effort**: 10 minutes
**Scope**: Manual testing in development environment

#### Description
Manually verify the progress indicator displays correctly when navigating to the URL input step.

#### Prerequisites
- Development server running (`npm run dev`)
- Access to item capture workflow

#### Implementation Steps
1. Start development server: `npm run dev`
2. Navigate to item capture workflow
3. Complete metadata step
4. Select "Add URL" as content type
5. Observe progress indicator

#### Verification Checklist
- [ ] **Mobile View**: Progress shows "Step 2 of 4"
- [ ] **Mobile View**: Stage label shows "Content"
- [ ] **Mobile View**: Progress bar is at 50% width
- [ ] **Desktop View**: "Content" stage indicator is highlighted (blue)
- [ ] **Desktop View**: "Details" stage shows checkmark (completed)
- [ ] **Desktop View**: "Edit" and "Review" stages are grayed out

#### Test Path
1. Navigate to `/dashboard/items`
2. Click "Add Item" or equivalent
3. Fill in metadata (title, etc.)
4. Click "Continue"
5. Select "URL" content type
6. Verify progress indicator state

#### Acceptance Criteria
- [ ] Progress indicator correctly shows Step 2 of 4
- [ ] Content stage is highlighted as current
- [ ] No visual anomalies or layout shifts
- [ ] Matches behavior of other content capture steps (video, photo, etc.)

---

## Task Summary

| Task ID | Description | Story Points | Dependencies |
|---------|-------------|--------------|--------------|
| 1.1.1 | Add `add-url` mapping to STEP_TO_STAGE_INDEX | 0.5 | None |
| 1.1.2 | Update existing content steps test array | 0.5 | 1.1.1 |
| 1.1.3 | Add dedicated `add-url` display test | 0.5 | 1.1.1 |
| 1.1.4 | Add progress bar width test | 0.5 | 1.1.1 |
| 1.1.5 | Add ARIA accessibility test | 0.5 | 1.1.1 |
| 1.1.6 | Run full test suite | 0.5 | 1.1.2, 1.1.3, 1.1.4, 1.1.5 |
| 1.1.7 | Build verification | 0.5 | 1.1.1 |
| 1.1.8 | Manual verification | 0.5 | 1.1.6, 1.1.7 |
| **Total** | | **4.0** | |

---

## Execution Order

```
1.1.1 (Add mapping)
    ├── 1.1.2 (Update content steps test)
    ├── 1.1.3 (Add display test)
    ├── 1.1.4 (Add progress bar test)
    ├── 1.1.5 (Add ARIA test)
    └── 1.1.7 (Build verification)
           └── 1.1.6 (Full test suite)
                  └── 1.1.8 (Manual verification)
```

---

## Dependencies

### Upstream Dependencies (blocks this task)
- None - this is a standalone bug fix

### Downstream Dependencies (blocked by this task)
- **Task 1.2**: Ensure Save Is Final Step - may reference progress stages
- **Task 1.3**: Update Step Count in Mobile View - uses same constants
- **Phase 2 (REQ-3)**: What's Next screen - needs accurate progress before adding `whats-next` step handling

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Typo in step name | Low | High | TypeScript will catch incorrect step names at compile time |
| Test regression | Low | Medium | Running full test suite before commit |
| Missing other unmapped steps | Low | Medium | Review all WizardStep values against STEP_TO_STAGE_INDEX |

---

## Rollback Plan

If issues are discovered after implementation:

1. Revert the `STEP_TO_STAGE_INDEX` change in `ProgressIndicator.tsx`
2. Remove the new test cases from `wizard-navigation.test.tsx`
3. The fallback `?? 0` in `getCurrentStageIndex` ensures the app continues to function (with incorrect display)

---

## Definition of Done

- [x] `STEP_TO_STAGE_INDEX` includes `'add-url': 1`
- [x] All new unit tests pass
- [x] All existing unit tests pass
- [x] TypeScript compiles without errors
- [x] Production build succeeds
- [x] Manual verification confirms correct display on mobile and desktop
- [x] Code follows existing patterns and formatting

**Implementation Completed**: 2026-01-12 00:51:00
**Verified via Playwright**: Mobile view correctly shows "Step 2 of 4" and "Content" label for add-url step

---

## References

- **Request**: docs/gen_requests.md (REQ-185, lines 8270-8290)
- **Overview**: docs/REQ-185-update-progress-stages-constant-overview.md
- **Implementation Plan**: docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
- **Source File**: src/components/ItemCapture/components/shared/ProgressIndicator.tsx
- **Types File**: src/components/ItemCapture/ItemCapture.types.ts (lines 250-260)
- **Test File**: src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx
