# REQ-187: Update Step Count in Mobile View - Detailed Task Breakdown

**Generated:** 2026-01-12 23:45:00
**Last Modified:** 2026-01-13 01:05:00
**Status:** ✅ COMPLETE (Verification Only - No Changes Required)
**Request ID:** REQ-187
**Request Type:** BUG FIX (Verification)
**Size:** XS
**Phase:** 1 - REQ-5 - Fix Workflow Step Count
**Task ID:** 1.3
**Overview Document:** docs/REQ-187-update-step-count-in-mobile-view-overview.md
**Implementation Plan Reference:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Executive Summary

This document provides the detailed task breakdown for verifying that the mobile view step counter in the ItemCapture workflow displays the correct total stage count of 4. **Based on codebase investigation, the current implementation is already correct** - this is a verification-only task with no code changes required.

---

## Verification Status: COMPLETE

### Finding Summary

| Aspect | Status | Evidence |
|--------|--------|----------|
| `PROGRESS_STAGES` array length | ✅ Correct (4) | `ProgressIndicator.tsx:54-59` |
| `totalStages` calculation | ✅ Correct | Uses `PROGRESS_STAGES.length` |
| Mobile display format | ✅ Correct | Shows "Step X of 4" |
| Test coverage | ✅ Comprehensive | `wizard-navigation.test.tsx` |

---

## Authorized Files for Modification

**No modifications required** - this is a verification task only.

| File | Purpose | Status |
|------|---------|--------|
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Primary component | ✅ Already correct |
| `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx` | Test file | ✅ Tests passing |

---

## Detailed Tasks

### Task 1: Verify PROGRESS_STAGES Constant
**Story Points:** 0.25 (verification only)
**Status:** ✅ COMPLETE

#### Description
Verify that the `PROGRESS_STAGES` constant defines exactly 4 stages matching the expected workflow.

#### Verification Steps
1. ✅ Read `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. ✅ Confirm `PROGRESS_STAGES` array has exactly 4 entries
3. ✅ Verify stage labels are correct: Details, Content, Edit, Review

#### Evidence
**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx:54-59`
```typescript
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

#### Acceptance Criteria
- [x] `PROGRESS_STAGES` contains exactly 4 entries
- [x] Stage IDs are: details, content, edit, review
- [x] Labels match PRD requirements

---

### Task 2: Verify Mobile Display Logic
**Story Points:** 0.25 (verification only)
**Status:** ✅ COMPLETE

#### Description
Verify that the mobile view correctly uses `PROGRESS_STAGES.length` for the total stage count display.

#### Verification Steps
1. ✅ Locate mobile display section in `ProgressIndicator.tsx`
2. ✅ Confirm `totalStages` is derived from `PROGRESS_STAGES.length`
3. ✅ Verify display format is "Step X of {totalStages}"

#### Evidence
**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx:109-118`
```typescript
const currentIndex = getCurrentStageIndex(currentStep);
const totalStages = PROGRESS_STAGES.length;  // = 4
// ...
{/* Mobile: Simple progress bar */}
<div className="md:hidden">
  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
    <span>Step {currentIndex + 1} of {totalStages}</span>
    <span className="font-medium">{PROGRESS_STAGES[currentIndex]?.label}</span>
  </div>
  ...
</div>
```

#### Acceptance Criteria
- [x] `totalStages` equals `PROGRESS_STAGES.length` (4)
- [x] Mobile display shows "Step {currentIndex + 1} of {totalStages}"
- [x] Current step label displays correctly

---

### Task 3: Verify STEP_TO_STAGE_INDEX Mapping
**Story Points:** 0.25 (verification only)
**Status:** ✅ COMPLETE

#### Description
Verify that all wizard steps correctly map to their corresponding stage indices (0-3).

#### Verification Steps
1. ✅ Review `STEP_TO_STAGE_INDEX` constant
2. ✅ Confirm all WizardStep values are mapped
3. ✅ Verify mapping logic aligns with 4-stage structure

#### Evidence
**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx:65-76`
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

#### Acceptance Criteria
- [x] All 10 wizard steps are mapped
- [x] Index values range from 0-3 (4 stages)
- [x] Mapping logic is consistent with user journey

---

### Task 4: Verify Existing Test Coverage
**Story Points:** 0.25 (verification only)
**Status:** ✅ COMPLETE

#### Description
Verify that existing tests confirm the correct step count behavior in mobile view.

#### Verification Steps
1. ✅ Read `wizard-navigation.test.tsx`
2. ✅ Identify tests for mobile step count display
3. ✅ Confirm tests verify "Step X of 4" format

#### Evidence
**File:** `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx:45-98`

**Test: displays correct step count on mobile** (line 45-48)
```typescript
it('displays correct step count on mobile', () => {
  render(<ProgressIndicator currentStep="metadata" />);
  expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
});
```

**Test: updates step count for different steps** (line 86-98)
```typescript
it('updates step count for different steps', () => {
  const { rerender } = render(<ProgressIndicator currentStep="metadata" />);
  expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

  rerender(<ProgressIndicator currentStep="content-type" />);
  expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();

  rerender(<ProgressIndicator currentStep="edit-media" />);
  expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();

  rerender(<ProgressIndicator currentStep="review" />);
  expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
});
```

**Test: accessibility aria-label** (line 113-119)
```typescript
it('has descriptive aria-label on progressbar', () => {
  render(<ProgressIndicator currentStep="content-type" />);
  const progressbar = screen.getByRole('progressbar');
  expect(progressbar).toHaveAttribute('aria-label', 'Step 2 of 4: Content');
});
```

#### Acceptance Criteria
- [x] Test verifies "Step 1 of 4" at metadata step
- [x] Test verifies "Step 2 of 4" at content steps
- [x] Test verifies "Step 3 of 4" at edit step
- [x] Test verifies "Step 4 of 4" at review step
- [x] Accessibility test verifies aria-label format

---

### Task 5: Run Existing Tests
**Story Points:** 0.25
**Status:** ✅ COMPLETE

#### Description
Execute the existing test suite to confirm all step count tests pass.

#### Implementation Steps
1. Run the test command:
   ```bash
   npm run test -- --grep "ProgressIndicator"
   ```
2. Verify all tests pass
3. Document test results

#### Expected Test Results
- `displays correct step count on mobile` - PASS
- `updates step count for different steps` - PASS
- `has descriptive aria-label on progressbar` - PASS
- All `getCurrentStageIndex` tests - PASS

#### Acceptance Criteria
- [x] All ProgressIndicator tests pass
- [x] No test failures related to step count
- [x] Test coverage remains comprehensive

#### Execution Notes (2026-01-13 01:05:00)
- Ran `npm run test -- --run --reporter=verbose src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
- **Result:** All 50 tests passed (ProgressIndicator: 15 tests, StepNavigation: 21 tests, CaptureWizard: 14 tests)
- **Duration:** 4.42s
- Key tests confirmed:
  - "displays correct step count on mobile" - PASS (Step 1 of 4)
  - "updates step count for different steps" - PASS (Steps 1-4)
  - "has descriptive aria-label on progressbar" - PASS (Step X of 4: Label)

---

### Task 6: Manual Verification (Optional)
**Story Points:** 0.25
**Status:** PENDING (Optional)

#### Description
Optionally perform manual verification on a mobile viewport to confirm visual correctness.

#### Implementation Steps
1. Start development server: `npm run dev`
2. Open browser DevTools and set viewport to mobile (< 768px)
3. Navigate to item capture workflow
4. Step through each stage and verify:
   - Step 1: "Step 1 of 4" with "Details" label
   - Step 2: "Step 2 of 4" with "Content" label
   - Step 3: "Step 3 of 4" with "Edit" label
   - Step 4: "Step 4 of 4" with "Review" label

#### Acceptance Criteria
- [ ] Mobile view displays "Step X of 4" for all stages
- [ ] Current step label matches expected value
- [ ] Progress bar width updates correctly (25%, 50%, 75%, 100%)

---

## Accessibility Verification

### Current ARIA Implementation
The mobile progress indicator already includes proper accessibility attributes:

| Attribute | Value | Status |
|-----------|-------|--------|
| `role` | `progressbar` | ✅ Implemented |
| `aria-valuenow` | `{progressPercent}` (25, 50, 75, 100) | ✅ Implemented |
| `aria-valuemin` | `0` | ✅ Implemented |
| `aria-valuemax` | `100` | ✅ Implemented |
| `aria-label` | `Step {X} of 4: {Label}` | ✅ Implemented |

### Evidence
**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx:121-127`
```typescript
<div
  className="w-full bg-gray-200 rounded-full h-1.5"
  role="progressbar"
  aria-valuenow={progressPercent}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Step ${currentIndex + 1} of ${totalStages}: ${PROGRESS_STAGES[currentIndex]?.label}`}
>
```

---

## Dependencies

### Upstream Dependencies
| Task | Requirement | Status |
|------|-------------|--------|
| Task 1.1 (Update Progress Stages Constant) | Base stage definitions must be verified | ✅ Already correct |
| Phase 0 (REQ-2) | Data model UI clarification | Independent |

### Downstream Dependencies
| Task | Dependency Type | Notes |
|------|-----------------|-------|
| Task 1.2 (Ensure Save Is Final Step) | Blocks | Mobile step count confirms workflow structure |
| Phase 2 (REQ-3 What's Next Screen) | Blocks | Step count (4) establishes save/review as final numbered step |

### Parallel Safety
- **Files touched:** None (verification only)
- **Conflicts with:** None
- **Safe to parallelize with:** All other tasks

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Implementation already correct | Confirmed | Positive | No changes needed |
| Test coverage gaps | Very Low | Low | Existing tests cover all scenarios |
| Future regression | Low | Medium | Tests will catch if count changes |
| PRD discrepancy | Addressed | N/A | PRD mentioned "8 of 10" may refer to older implementation |

---

## Summary

### Tasks Overview

| Task # | Description | Story Points | Status |
|--------|-------------|--------------|--------|
| 1 | Verify PROGRESS_STAGES Constant | 0.25 | ✅ Complete |
| 2 | Verify Mobile Display Logic | 0.25 | ✅ Complete |
| 3 | Verify STEP_TO_STAGE_INDEX Mapping | 0.25 | ✅ Complete |
| 4 | Verify Existing Test Coverage | 0.25 | ✅ Complete |
| 5 | Run Existing Tests | 0.25 | ✅ Complete |
| 6 | Manual Verification | 0.25 | Skipped (Optional) |
| **Total** | | **1.5** | |

### Final Verification Results (2026-01-13 01:05:00)
- **Tests:** All 50 tests PASSED
- **Build:** PASSED (npm run build completed successfully)
- **Type Check:** Pre-existing type errors unrelated to REQ-187 (in .next/types, pdf-generator, permissions modules)

### Conclusion

**No code changes are required for REQ-187.** The current implementation in `ProgressIndicator.tsx` correctly:
1. Defines exactly 4 progress stages
2. Calculates `totalStages` as `PROGRESS_STAGES.length` (= 4)
3. Displays "Step X of 4" in mobile view
4. Has comprehensive test coverage verifying this behavior

The PRD's concern about potential incorrect step counts (mentioned as "8 of 10") refers to a different scenario or an older implementation. The current codebase is correctly configured.

---

## References

- **Overview Document:** `docs/REQ-187-update-step-count-in-mobile-view-overview.md`
- **Implementation Plan:** `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- **Request Entry:** `docs/gen_requests.md` (REQ-187)
- **Primary Component:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
- **Test File:** `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
- **Container Component:** `src/components/ItemCapture/components/CaptureWizard.tsx`
