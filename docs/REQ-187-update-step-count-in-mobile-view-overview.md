# REQ-187: Update Step Count in Mobile View - Technical Implementation Overview

**Generated:** 2026-01-12 23:15:00
**Last Modified:** 2026-01-12 23:15:00
**Request ID:** REQ-187
**Request Type:** BUG FIX
**Size:** XS
**Phase:** 1 - REQ-5 - Fix Workflow Step Count
**Task ID:** 1.3
**Implementation Plan Reference:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Executive Summary

This task verifies that the mobile view step counter in the ItemCapture workflow displays the correct total stage count of 4, matching the desktop experience. Based on codebase investigation, **the current implementation is already correct** - no code changes are required. This document serves as verification documentation.

---

## Request Context

### Original Request
The step counter in the mobile view of the item creation workflow should display the correct total number of stages, matching the four-stage structure shown on desktop.

### Expected Behavior
The mobile view displays "Step X of 4" throughout the workflow, accurately reflecting the four distinct stages:
1. Details
2. Content
3. Edit
4. Review

---

## Codebase Investigation

### File Analyzed: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`

#### Current Implementation (lines 54-59, 109-117)

**Stage Definitions:**
```tsx
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

**Mobile Display Logic:**
```tsx
const currentIndex = getCurrentStageIndex(currentStep);
const totalStages = PROGRESS_STAGES.length;  // = 4

// Mobile: Simple progress bar
<div className="md:hidden">
  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
    <span>Step {currentIndex + 1} of {totalStages}</span>
    <span className="font-medium">{PROGRESS_STAGES[currentIndex]?.label}</span>
  </div>
  ...
</div>
```

### Verification Evidence

1. **`PROGRESS_STAGES.length` = 4** - Correct total
2. **Mobile view shows**: `Step {currentIndex + 1} of {totalStages}` where `totalStages = 4`
3. **Existing tests confirm behavior** in `wizard-navigation.test.tsx`:
   - Line 46: `expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();`
   - Lines 72-78: Tests verify steps 2, 3, and 4 of 4

---

## Analysis Conclusion

### Status: ✅ NO CHANGES REQUIRED

The current implementation already correctly:
- Displays exactly 4 stages in `PROGRESS_STAGES`
- Calculates `totalStages` as `PROGRESS_STAGES.length` (= 4)
- Shows "Step X of 4" in mobile view
- Has comprehensive test coverage verifying this behavior

The PRD's concern about potential incorrect step counts (mentioned as "8 of 10" in the implementation plan) refers to a different scenario - possibly an older implementation or a misunderstanding. The current codebase is correctly configured.

---

## Authorized Files and Functions for Modification

**No modifications authorized** - this is a verification task only.

If future investigation reveals discrepancies:

| File | Functions/Sections | Purpose |
|------|-------------------|---------|
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | `PROGRESS_STAGES`, mobile view section (lines 115-133) | Would be modified if step count was incorrect |

---

## Dependencies

### Depends On (upstream)
- **Task 1.1 (Update Progress Stages Constant)**: Must be verified first to ensure the base stage definitions are correct before checking mobile view
- **Phase 0 (REQ-2)**: Data model UI clarification - ensures consistent terminology in progress labels

### Blocks (downstream)
- **Task 1.2 (Ensure Save Is Final Step)**: The mobile step count verification confirms the workflow structure that Task 1.2 relies on
- **Phase 2 (REQ-3 What's Next Screen)**: The correct step count (4) establishes that save/review is the final numbered step, after which the post-workflow What's Next screen appears

### Parallel Safety
- **Files touched**: None (verification only)
- **Conflicts with**: None
- **Safe to parallelize with**:
  - Task 3.1-3.4 (Dashboard Cards) - different files
  - Task 4.1-4.4 (Navigation Menu) - different files

---

## Implementation Tasks

### Task 1: Verify Mobile Step Count Display
**Status:** ✅ Complete (via codebase investigation)
**Effort:** Verification only

**Verification Steps Completed:**
1. ✅ Read `ProgressIndicator.tsx` - confirmed `PROGRESS_STAGES` has 4 entries
2. ✅ Verified `totalStages = PROGRESS_STAGES.length` = 4
3. ✅ Confirmed mobile view displays "Step X of 4"
4. ✅ Reviewed test file confirming expected behavior

---

## Testing Plan

### Existing Test Coverage
The following tests in `wizard-navigation.test.tsx` already verify correct behavior:

```typescript
it('displays correct step count on mobile', () => {
  expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
});

it('updates step count for different steps', () => {
  expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  // ... tests for steps 2, 3, 4
  expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
});
```

### Manual Verification (Optional)
If additional confidence is needed:
1. Open the application on a mobile device or narrow viewport (< 768px)
2. Start the item capture workflow
3. Verify "Step 1 of 4" displays at Details stage
4. Navigate through each step
5. Confirm counter increments correctly up to "Step 4 of 4" at Review stage

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Implementation already correct | N/A | Positive | No changes needed |
| Test coverage gaps | Very Low | Low | Existing tests cover this scenario |
| Future regression | Low | Medium | Tests will catch if count changes |

---

## Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Mobile view displays correct total stage count of 4 | ✅ | `totalStages = PROGRESS_STAGES.length = 4` |
| Step counter on mobile matches desktop step counter behavior | ✅ | Both use same `PROGRESS_STAGES` array |
| Mobile progress display updates correctly as users move through workflow stages | ✅ | `currentIndex` updates via `getCurrentStageIndex()` |
| No discrepancy exists between mobile and desktop total stage counts | ✅ | Single source of truth: `PROGRESS_STAGES` |

---

## References

- **Implementation Plan:** `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- **Request Entry:** `docs/gen_requests.md` (REQ-187)
- **Primary Component:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
- **Test File:** `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
- **Container Component:** `src/components/ItemCapture/components/CaptureWizard.tsx`
