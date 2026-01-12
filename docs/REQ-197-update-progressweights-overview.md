# REQ-197: Update PROGRESS_WEIGHTS Constant - Implementation Overview

**Created:** 2026-01-12 20:15:00 UTC
**Last Modified:** 2026-01-12 20:15:00 UTC
**Request Reference:** docs/gen_requests.md#REQ-197
**Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 1 - Fix Workflow Step Count (ITEM-05) - HIGH Priority
**Task ID:** 1.2

---

## Summary

Update the `PROGRESS_WEIGHTS` constant in `src/components/ItemCreationWorkflow/utils/constants.ts` to align with the 8-step user-visible workflow. The weights must be recalculated so that the progress bar reaches 100% at the `preview-save` step (Step 8), with post-workflow screens maintaining 100% progress.

---

## Current State Analysis

### Current PROGRESS_WEIGHTS (constants.ts lines 495-506)

```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 10,
  'item-type-selection': 20,
  'specific-item-selection': 30,
  'purpose-selection': 40,
  'content-type-selection': 50,
  'media-capture': 60,            // NEW - REQ-176
  'content-creation': 65,         // Keep slightly higher for compatibility
  'preview-save': 75,             // << PROBLEM: Not 100%
  'next-action': 88,
  'session-summary': 100,
};
```

### Issues Identified

1. **preview-save is at 75%** - Should be 100% as the final numbered step
2. **Post-workflow screens show progression** - `next-action` (88%) and `session-summary` (100%) suggest more work ahead
3. **Weight distribution is uneven** - Steps don't reflect equal progression through an 8-step flow
4. **content-creation overlap** - Kept for backward compatibility but weight positioning is awkward

---

## Target Implementation

### Required Changes

Update PROGRESS_WEIGHTS to reflect an 8-step user workflow with evenly distributed progress:

```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,          // Step 1 of 8 (~12.5%)
  'item-type-selection': 25,     // Step 2 of 8 (25%)
  'specific-item-selection': 37, // Step 3 of 8 (~37.5%)
  'purpose-selection': 50,       // Step 4 of 8 (50%)
  'content-type-selection': 62,  // Step 5 of 8 (~62.5%)
  'media-capture': 75,           // Step 6 of 8 (75%)
  'content-creation': 87,        // Step 7 of 8 (~87.5%) - compatibility
  'preview-save': 100,           // Step 8 of 8 - FINAL (100%)
  'next-action': 100,            // Post-workflow (stays at 100%)
  'session-summary': 100,        // Post-workflow (stays at 100%)
};
```

### Weight Calculation Rationale

- **8 user-visible steps** = 12.5% per step (for even distribution)
- Rounded to friendly integers: 12, 25, 37, 50, 62, 75, 87, 100
- **Post-workflow screens stay at 100%** - users see "complete" status
- **content-creation at 87%** retained for backward compatibility (rarely reached due to REQ-176 media-capture routing)

---

## Dependencies

### Depends On (upstream)

- **Task 1.1 (REQ-196):** Create `USER_VISIBLE_STEPS` and `POST_WORKFLOW_SCREENS` constants
  - This task provides the structural framework for distinguishing numbered steps from post-workflow screens
  - The PROGRESS_WEIGHTS values must align with the steps defined in USER_VISIBLE_STEPS

### Blocks (downstream)

- **Task 1.3 (REQ-198):** Update WorkflowHeader to hide on post-workflow screens
  - WorkflowHeader uses `progressPercent` from PROGRESS_WEIGHTS for display
  - The header needs correct 100% value at preview-save before hiding logic is meaningful

- **Task 1.4 (REQ-199):** Update ItemCreationWorkflow to use USER_VISIBLE_STEPS
  - The main component calculates progress using PROGRESS_WEIGHTS
  - Updated weights must be in place before display logic changes

### Parallel Safety

- **Files touched:** `src/components/ItemCreationWorkflow/utils/constants.ts`
- **Conflicts with:**
  - Task 1.1 (REQ-196) - both modify constants.ts, must run sequentially
- **Safe to parallelize with:**
  - Phase 2 tasks (ITEM-03: What's Next Screen)
  - Phase 3 tasks (ITEM-01: Dashboard Cards)
  - Phase 4 tasks (ITEM-04: Navigation Menu)

---

## Authorized Files and Functions for Modification

### Primary File

| File | Functions/Sections | Changes Required |
|------|-------------------|------------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `PROGRESS_WEIGHTS` constant (lines 495-506) | Update all weight values to reach 100% at preview-save |

### Documentation Update

| File | Section | Changes Required |
|------|---------|------------------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | JSDoc for PROGRESS_WEIGHTS (lines 479-493) | Update comment to reflect 8-step workflow with 100% at Step 8 |

---

## Implementation Steps

### Step 1: Update PROGRESS_WEIGHTS constant values

**Location:** `src/components/ItemCreationWorkflow/utils/constants.ts` lines 495-506

**Changes:**
1. Change `'room-selection'` from `10` to `12`
2. Change `'item-type-selection'` from `20` to `25`
3. Change `'specific-item-selection'` from `30` to `37`
4. Change `'purpose-selection'` from `40` to `50`
5. Change `'content-type-selection'` from `50` to `62`
6. Change `'media-capture'` from `60` to `75`
7. Change `'content-creation'` from `65` to `87`
8. Change `'preview-save'` from `75` to `100`
9. Change `'next-action'` from `88` to `100`
10. Keep `'session-summary'` at `100`

### Step 2: Update JSDoc documentation

**Location:** `src/components/ItemCreationWorkflow/utils/constants.ts` lines 479-493

**Update comment to reflect:**
- 8-step user-visible workflow
- Weights reach 100% at preview-save (Step 8)
- Post-workflow screens maintain 100% (not part of numbered progression)

---

## Testing Requirements

### Unit Tests

No changes required to existing tests - PROGRESS_WEIGHTS is a simple constant.

### Integration Verification

1. **Progress bar visual check:**
   - Verify progress bar reaches 100% at preview-save step
   - Verify progress bar stays at 100% on next-action step
   - Verify progress bar stays at 100% on session-summary step

2. **Step indicator sync:**
   - Ensure "Step 8 of 8" shows when progress is 100%
   - (Note: Step indicator fix is in Task 1.4, but progress value must be correct)

3. **Workflow progression:**
   - Walk through complete workflow flow
   - Verify progress increments feel natural and evenly distributed

---

## Acceptance Criteria

From REQ-197:
- [x] PROGRESS_WEIGHTS constant contains exactly 10 entries (8 numbered + 2 post-workflow)
- [ ] First 8 step weights sum to progressive completion ending at 100
- [ ] Weight values are ordered to match step sequence
- [ ] Progress bar reaches 100% completion at preview-save step
- [ ] Post-workflow screens (next-action, session-summary) maintain 100% progress
- [ ] Weight distribution reflects reasonable time allocation (~12.5% per step)
- [ ] Progress calculations use the updated PROGRESS_WEIGHTS correctly
- [ ] Progress indicator displays smooth, logical advancement through all steps

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Progress calculations in other files expect old values | Low | Low | PROGRESS_WEIGHTS is only consumed by useWorkflowState.ts |
| Visual jarring from larger progress jumps | Low | Low | Even distribution feels more natural than current uneven jumps |
| Tests fail due to progress value changes | Low | Medium | Run test suite after change; update snapshots if needed |

---

## Related Tasks

- **REQ-196 (Task 1.1):** Separate User-Visible and Internal Workflow Steps Constants
- **REQ-198 (Task 1.3):** Hide Workflow Header on Post-Workflow Screens
- **REQ-199 (Task 1.4):** Update ItemCreationWorkflow to use USER_VISIBLE_STEPS
- **REQ-200 (Task 1.5):** Update useWorkflowState hook exports

---

## Notes

- This is an XS-sized task - straightforward constant value updates
- Must coordinate with Task 1.1 (REQ-196) if both modify constants.ts
- The content-creation step (87%) is retained for backward compatibility but is rarely reached due to REQ-176 media-capture routing
- Progress weights are consumed by `useWorkflowState.ts` line 925: `PROGRESS_WEIGHTS[state.currentStep] ?? 0`
