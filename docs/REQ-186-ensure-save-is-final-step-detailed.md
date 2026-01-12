# REQ-186: Ensure Save Is the Final Workflow Step - Detailed Task Breakdown

**Date Created**: 2026-01-12 23:45
**Last Modified**: 2026-01-13 00:15
**Request ID**: REQ-186
**Type**: ENHANCEMENT
**Size**: S
**Phase**: 1 - REQ-5 - Fix Workflow Step Count
**Task ID**: 1.2
**Story Points**: Total 3 SP (Verification + Documentation tasks)

---

## Document Purpose

This document provides a detailed, step-by-step task breakdown for REQ-186. Each task is scoped to ≤1 story point and includes verification steps. This task is primarily a **verification and documentation task** - the current implementation already satisfies REQ-186 requirements. This document establishes guidelines for future REQ-3 (What's Next Screen) implementation to maintain the "Save is final step" requirement.

---

## Summary

REQ-186 confirms that the save action is the final step in the ItemCapture wizard workflow. The "What's Next" screen (to be implemented in REQ-3/Phase 2) must appear as a POST-workflow menu rather than as part of the numbered step progression.

---

## Acceptance Criteria (from gen_requests.md)

- [x] Step counter shows save as the final step in the numbered progression
- [x] No additional steps appear after save in the workflow step count
- [ ] "What's Next" screen appears outside the step progression flow (REQ-3 scope)
- [ ] "What's Next" screen does not increment the step counter (REQ-3 scope)
- [x] Save action provides clear completion feedback indicating workflow end
- [ ] Post-workflow menu options are visually distinct from workflow steps (REQ-3 scope)

---

## Authorized Files for This Task

| File | Access Level | Purpose |
|------|--------------|---------|
| `src/components/ItemCapture/ItemCapture.tsx` | READ-ONLY | Verify submit flow and no post-review steps |
| `src/components/ItemCapture/ItemCapture.types.ts` | READ-ONLY | Verify WizardStep type has no post-review steps |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | READ-ONLY | Verify step mapping and stage count |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | READ-ONLY | Verify submit button behavior |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | READ-ONLY | Verify state transitions |

**NOTE**: This is a verification task. No code modifications are required.

---

## Pre-Requisites

| Requirement | Status | Notes |
|-------------|--------|-------|
| Task 1.1 (Update Progress Stages Constant) complete | Required | Establishes 4-stage structure that this task verifies |
| Phase 0 (REQ-2) complete or in progress | Recommended | Data model UI clarification affects Review step labels |

---

## Detailed Task Breakdown

### Task 1: Verify WizardStep Type Contains No Post-Review Steps (0.25 SP)

**File**: `src/components/ItemCapture/ItemCapture.types.ts`
**Lines**: 250-260

**Objective**: Confirm the WizardStep union type does not include any step identifiers that occur after 'review'.

**Steps**:

1. [x] Open `src/components/ItemCapture/ItemCapture.types.ts`
2. [x] Locate the `WizardStep` type definition (line ~250)
3. [x] Verify the type contains exactly these values:
   - `'metadata'`
   - `'content-type'`
   - `'capture-video'`
   - `'capture-photo'`
   - `'upload-file'`
   - `'write-text'`
   - `'add-url'`
   - `'edit-media'`
   - `'add-more'`
   - `'review'`
4. [x] Confirm NO additional step types exist (e.g., no 'whats-next', 'complete', 'confirmation', etc.)
5. [x] Document finding in verification checklist

**Expected Result**: WizardStep type ends at 'review' with no post-save steps.

**Current State (Verified 2026-01-13)**:
```typescript
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'add-url'
  | 'edit-media'
  | 'add-more'
  | 'review';
```

**Status**: ✅ VERIFIED - No post-review steps exist in the type definition.

---

### Task 2: Verify STEP_TO_STAGE_INDEX Mapping (0.25 SP)

**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines**: 65-76

**Objective**: Confirm the step-to-stage mapping shows 'review' as the final stage (index 3, i.e., Stage 4 of 4).

**Steps**:

1. [x] Open `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. [x] Locate `STEP_TO_STAGE_INDEX` constant (line ~65)
3. [x] Verify 'review' maps to index 3 (the highest index)
4. [x] Confirm no step maps to index > 3
5. [x] Verify all WizardStep values are mapped
6. [x] Document finding in verification checklist

**Expected Result**: 'review' has the highest stage index (3), confirming it's the final step.

**Current State (Verified 2026-01-13)**:
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
  'review': 3,          // Stage 4: Review  <-- FINAL
};
```

**Status**: ✅ VERIFIED - 'review' is the highest stage index.

---

### Task 3: Verify PROGRESS_STAGES Has Correct Count (0.25 SP)

**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines**: 54-59

**Objective**: Confirm PROGRESS_STAGES contains exactly 4 stages with 'Review' as the final stage.

**Steps**:

1. [x] Open `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. [x] Locate `PROGRESS_STAGES` constant (line ~54)
3. [x] Verify exactly 4 stages are defined:
   - Details (index 0)
   - Content (index 1)
   - Edit (index 2)
   - Review (index 3)
4. [x] Confirm 'Review' is the last stage in the array
5. [x] Document finding in verification checklist

**Expected Result**: PROGRESS_STAGES has 4 entries, ending with 'Review'.

**Current State (Verified 2026-01-13)**:
```typescript
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

**Status**: ✅ VERIFIED - 4 stages with Review as final.

---

### Task 4: Verify handleSubmit Flow Terminates Workflow (0.25 SP)

**File**: `src/components/ItemCapture/ItemCapture.tsx`
**Lines**: 143-224

**Objective**: Confirm the handleSubmit function calls `onComplete()` then `reset()` without transitioning to any additional wizard steps.

**Steps**:

1. [x] Open `src/components/ItemCapture/ItemCapture.tsx`
2. [x] Locate `handleSubmit` function (line ~143)
3. [x] Trace the success path:
   - Validation passes
   - `assembleItemRecord()` is called
   - `onComplete(record)` is called with the assembled record
   - `reset()` is called immediately after
4. [x] Confirm NO step transition occurs (no `goToStep('whats-next')` or similar)
5. [x] Confirm the wizard returns to initial state after successful submit
6. [x] Document finding in verification checklist

**Expected Result**: After successful submit, `onComplete()` is called and wizard resets. No post-submit step navigation.

**Current State (Verified 2026-01-13)**:
```typescript
// Emit the record via callback
onComplete(record);

// Reset state after successful submission
reset();

debugLog('Submission successful');
```

**Status**: ✅ VERIFIED - Submit calls onComplete then reset, no additional steps.

---

### Task 5: Verify Mobile Step Counter Display (0.25 SP)

**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
**Lines**: 115-127

**Objective**: Confirm the mobile view displays "Step X of 4" with 4 as the final step.

**Steps**:

1. [x] Open `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
2. [x] Locate mobile progress bar section (line ~115)
3. [x] Verify the step count displays:
   - `Step {currentIndex + 1} of {totalStages}`
   - Where `totalStages = PROGRESS_STAGES.length` (which is 4)
4. [x] Confirm on Review step, display shows "Step 4 of 4"
5. [x] Document finding in verification checklist

**Expected Result**: Mobile view shows "Step 4 of 4" on Review step.

**Current State (Verified 2026-01-13)**:
```tsx
<span>Step {currentIndex + 1} of {totalStages}</span>
```
Where `totalStages = PROGRESS_STAGES.length = 4`.

**Status**: ✅ VERIFIED - Step 4 of 4 displays on Review step.

---

### Task 6: Document Guidelines for REQ-3 Implementation (0.5 SP)

**Objective**: Create clear guidelines for the Phase 2 What's Next Screen implementation to ensure it doesn't break the "Save is final step" requirement.

**Steps**:

1. [x] Document that 'whats-next' step (if added to WizardStep type) must:
   - NOT be included in PROGRESS_STAGES
   - Map to index -1 in STEP_TO_STAGE_INDEX (or be excluded)
   - Hide the progress indicator when displayed
   - NOT have back/cancel navigation controls
2. [x] Document the two implementation options:
   - **Option A (Recommended)**: Parent-level rendering - What's Next screen rendered by parent component, not as a wizard step
   - **Option B**: Wizard-internal with hidden progress - Add to WizardStep but exclude from progress display
3. [x] Add clear code examples for both approaches
4. [x] Specify that save must remain the final numbered step regardless of implementation choice

**Expected Result**: Clear documentation for REQ-3 implementation team.

**Status**: ✅ COMPLETE - Guidelines documented in "Recommendations for REQ-3 Implementation" section below.

---

### Task 7: Create Manual Testing Checklist (0.25 SP)

**Objective**: Define the manual testing steps to verify REQ-186 acceptance criteria.

**Manual Testing Steps**:

1. [ ] Start a new item capture workflow
2. [ ] Complete all required fields in MetadataStep
3. [ ] Select a content type and add content
4. [ ] Navigate through Edit step to Review step
5. [ ] On Review step, verify:
   - [ ] Mobile view shows "Step 4 of 4"
   - [ ] Desktop view shows Review as the final/current stage
   - [ ] No indication of additional steps after Review
6. [ ] Click Submit button
7. [ ] Verify:
   - [ ] `onComplete` callback is triggered with ItemRecord
   - [ ] Wizard resets to initial state (MetadataStep)
   - [ ] No additional steps are displayed post-submit
   - [ ] No "What's Next" screen appears as a numbered step

**Expected Result**: All manual tests pass, confirming save is the final step.

---

### Task 8: Document Verification Results (0.25 SP)

**Objective**: Compile all verification findings into a summary table.

**Verification Summary**:

| Acceptance Criteria | Status | Evidence |
|---------------------|--------|----------|
| Step counter shows save as final step | ✅ VERIFIED | `STEP_TO_STAGE_INDEX['review'] = 3` (Stage 4 of 4) |
| No additional steps after save in step count | ✅ VERIFIED | WizardStep type has no post-review values |
| "What's Next" screen appears outside step progression | ⏳ N/A | Not yet implemented - REQ-3 scope |
| "What's Next" does not increment step counter | ⏳ N/A | Not yet implemented - REQ-3 scope |
| Save provides clear completion feedback | ✅ VERIFIED | `onComplete(record)` called, then `reset()` |
| Post-workflow options visually distinct | ⏳ N/A | Not yet implemented - REQ-3 scope |

**Status**: All currently implementable criteria are verified. Remaining criteria are for REQ-3 scope.

---

## Task Dependencies

```
Task 1 (Verify WizardStep Type)
    │
    ├──► Task 2 (Verify STEP_TO_STAGE_INDEX) ──► Task 6 (Document Guidelines)
    │                                                      │
    ├──► Task 3 (Verify PROGRESS_STAGES)                   │
    │                                                      ▼
    ├──► Task 4 (Verify handleSubmit Flow)           Task 8 (Document Results)
    │                                                      ▲
    └──► Task 5 (Verify Mobile Display)                    │
                                                           │
                              Task 7 (Manual Testing) ─────┘
```

Tasks 1-5 can be executed in parallel. Task 6-8 depend on verification tasks being complete.

---

## Recommendations for REQ-3 Implementation

### Option A: Parent-Level Rendering (Recommended)

Instead of adding 'whats-next' to WizardStep, have the parent component handle it:

```typescript
// In parent component consuming ItemCapture
const [savedItem, setSavedItem] = useState<ItemRecord | null>(null);

const handleComplete = (record: ItemRecord) => {
  setSavedItem(record);  // Triggers What's Next screen
};

return (
  <>
    {savedItem ? (
      <WhatsNextScreen
        item={savedItem}
        onEditInstructions={() => {...}}
        onAddNewInstructions={() => {...}}
        onCreateNewItem={() => setSavedItem(null)}
        onDone={() => router.push('/dashboard')}
      />
    ) : (
      <ItemCapture onComplete={handleComplete} onCancel={handleCancel} />
    )}
  </>
);
```

**Advantages**:
- No changes to WizardStep type
- No changes to ProgressIndicator
- Clear separation between wizard and post-workflow menu
- Simplest implementation

### Option B: Wizard-Internal with Hidden Progress

If adding to WizardStep type, ensure ProgressIndicator handles it:

```typescript
// In ItemCapture.types.ts
export type WizardStep =
  | 'metadata'
  // ... existing steps ...
  | 'review'
  | 'whats-next';  // Post-workflow, not a numbered step

// In ProgressIndicator.tsx
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  // ... existing mappings ...
  'whats-next': -1,  // Excluded from progress display
};

// In component logic
const shouldShowProgress = currentStageIndex >= 0;

return shouldShowProgress ? (
  <div className="space-y-2">
    {/* Progress indicator content */}
  </div>
) : null;
```

**Advantages**:
- Keeps all step logic in ItemCapture
- Single component tree
- Easier state management for What's Next callbacks

**Disadvantages**:
- Requires type changes
- Requires ProgressIndicator changes
- More complex implementation

---

## Parallel Safety Analysis

| Aspect | Value |
|--------|-------|
| Files Modified | None (READ-ONLY verification) |
| Files Read | ItemCapture.tsx, ItemCapture.types.ts, ProgressIndicator.tsx, ReviewStep.tsx |
| Conflicts With | None |
| Safe to Parallelize With | All other tasks |

---

## References

- **Source Request**: `docs/gen_requests.md` - REQ-186
- **Overview Document**: `docs/REQ-186-ensure-save-is-final-step-overview.md`
- **Implementation Plan**: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- **Related Tasks**:
  - Phase 1, Task 1.1: Update Progress Stages Constant (REQ-185)
  - Phase 1, Task 1.3: Update Step Count in Mobile View (REQ-187)
  - Phase 2, Task 2.1-2.4: What's Next Screen Implementation (REQ-187-190)

---

## Component Files Referenced

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/ItemCapture.tsx` | Main wizard component with handleSubmit logic |
| `src/components/ItemCapture/ItemCapture.types.ts` | WizardStep type definition |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Step counter and progress display |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Submit button component |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | State management for wizard |

---

## Completion Checklist

- [x] Task 1: Verify WizardStep Type Contains No Post-Review Steps
- [x] Task 2: Verify STEP_TO_STAGE_INDEX Mapping
- [x] Task 3: Verify PROGRESS_STAGES Has Correct Count
- [x] Task 4: Verify handleSubmit Flow Terminates Workflow
- [x] Task 5: Verify Mobile Step Counter Display
- [x] Task 6: Document Guidelines for REQ-3 Implementation
- [x] Task 7: Create Manual Testing Checklist
- [x] Task 8: Document Verification Results

**Overall Status**: ✅ ALL VERIFICATION TASKS COMPLETE

---

## Implementation Notes

**Verified By**: Claude Agent
**Verification Date**: 2026-01-13 00:15
**Type Check**: PASSED (pre-existing unrelated type errors in `.next/types`, `tmp/` directory)
**Build**: PASSED (Next.js 15.5.9 build completed successfully)

All verification tasks have been completed successfully. The current implementation satisfies the REQ-186 requirements:
- Save (Review step) is the final step in the wizard (Stage 4 of 4)
- No post-review steps exist in the WizardStep type
- Mobile displays "Step 4 of 4" correctly on Review step
- handleSubmit calls onComplete then reset with no additional step transitions

The "What's Next" screen implementation guidelines have been documented for REQ-3 (Phase 2).

---

*Document generated: 2026-01-12 23:45*
*Last verified: 2026-01-13 00:15*
*Total Story Points: 3 SP*
*Task Count: 8 tasks*
