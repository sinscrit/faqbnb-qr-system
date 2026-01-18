# REQ-186: Ensure Save Is the Final Workflow Step - Implementation Overview

**Date Created**: 2026-01-12 23:30
**Last Modified**: 2026-01-12 23:30
**Request ID**: REQ-186
**Type**: ENHANCEMENT
**Size**: S
**Phase**: 1 - REQ-5 - Fix Workflow Step Count
**Task ID**: 1.2

---

## Summary

This task confirms that the save action is truly the final step in the ItemCapture wizard workflow. The "What's Next" screen (to be implemented in REQ-3/Phase 2) must appear as a POST-workflow menu rather than as part of the numbered step progression.

---

## Current Implementation Analysis

### Current Workflow Flow

From `ItemCapture.tsx` (lines 143-224), the current `handleSubmit` function:

```typescript
const handleSubmit = useCallback(() => {
  // ... validation ...

  try {
    const record = assembleItemRecord({...});

    // Emit the record via callback
    onComplete(record);

    // Reset state after successful submission
    reset();

  } catch (error) {
    // ... error handling ...
  }
}, [...]);
```

**Key Observations:**

1. **Submit calls `onComplete` then `reset()`**: After saving, the wizard resets completely - no additional steps are rendered within the wizard flow.

2. **ReviewStep has Submit button**: The submit action (`ReviewStep.tsx`, lines 700-721) triggers `onSubmit` which maps to `handleSubmit` in the parent.

3. **No post-save step exists in WizardStep type**: The `WizardStep` type in `ItemCapture.types.ts` (lines 246-256) does not include a 'whats-next' or similar step:
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

4. **ProgressIndicator shows 4 stages**: The `PROGRESS_STAGES` constant in `ProgressIndicator.tsx` (lines 54-59) defines only 4 display stages: Details, Content, Edit, Review.

### Workflow Termination Point

The save/submit action occurs at the **'review' step**. After `onComplete(record)` is called:
- Parent component receives the completed `ItemRecord`
- `reset()` is called, resetting state to initial step ('metadata')
- The wizard is effectively complete

**CONFIRMED**: Save IS currently the final step in the numbered workflow progression.

---

## Required Verification Points

### 1. No Hidden Steps After Review

**Location**: `ItemCapture.tsx` - `renderStep` function (lines 357-541)

The switch statement only handles the defined steps. After `review`, the component either:
- Resets (on success)
- Shows error state (on failure)

No additional steps are rendered post-submission.

### 2. Step Counter Accuracy

**Location**: `ProgressIndicator.tsx` - `STEP_TO_STAGE_INDEX` (lines 65-75)

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
  'review': 3,          // Stage 4: Review  <-- FINAL
};
```

**CONFIRMED**: 'review' maps to stage index 3 (Stage 4), which is the final stage. The mobile view shows "Step 4 of 4" on the review step.

### 3. What's Next Screen (Future - REQ-3)

Per the implementation plan (Plan-105, Phase 2), a `WhatsNextStep` component will be added. This task confirms:

- **What's Next MUST NOT be added to `PROGRESS_STAGES`**
- **What's Next MUST NOT be included in the step counter**
- **What's Next should either**:
  1. Be rendered OUTSIDE the wizard container after `onComplete`, OR
  2. Be rendered with a hidden/disabled progress indicator

---

## Acceptance Criteria Verification

| Criteria | Status | Evidence |
|----------|--------|----------|
| Step counter shows save as final step | VERIFIED | `STEP_TO_STAGE_INDEX['review'] = 3` (4 of 4) |
| No additional steps after save in step count | VERIFIED | WizardStep type has no post-review steps |
| "What's Next" screen not in step progression | N/A | Not yet implemented - for REQ-3 |
| "What's Next" does not increment counter | N/A | Not yet implemented - for REQ-3 |
| Save provides clear completion feedback | VERIFIED | `onComplete(record)` called, then reset |
| Post-workflow options visually distinct | N/A | Not yet implemented - for REQ-3 |

---

## Recommendations for REQ-3 Implementation

When implementing the "What's Next" screen (REQ-3, Phase 2), follow these guidelines to maintain the current correct behavior:

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

### Option B: Wizard-Internal with Hidden Progress

If adding to WizardStep type, ensure ProgressIndicator handles it:

```typescript
// In ProgressIndicator.tsx
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  // ... existing mappings ...
  'whats-next': -1,  // Excluded from progress display
};

// In component logic
const shouldShowProgress = currentStageIndex >= 0;
```

---

## Authorized Files and Functions for Modification

### Files to Verify (Read-Only for This Task)

| File | Purpose | Lines |
|------|---------|-------|
| `src/components/ItemCapture/ItemCapture.tsx` | Verify no post-review steps | 143-224, 357-541 |
| `src/components/ItemCapture/ItemCapture.types.ts` | Verify WizardStep type | 246-256 |
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Verify step mapping | 54-75 |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Verify submit flow | 700-721 |

### No Modifications Required

This task is a **verification task**. The current implementation already satisfies REQ-186. No code changes are needed.

If future changes are made that affect workflow steps, the following would need updates:

| File | Change Type | Reason |
|------|-------------|--------|
| `ItemCapture.types.ts` | Type addition | If adding new WizardStep |
| `ProgressIndicator.tsx` | Constant update | If new step needs stage mapping |
| `useItemCaptureState.ts` | Transition logic | If new step needs navigation rules |

---

## Dependencies

### Depends On (upstream)

- **Task 1.1 (Update Progress Stages Constant)**: Must complete first to establish the 4-stage structure that Task 1.2 verifies as complete.
- **Phase 0 (REQ-2)**: Data model UI clarification should use correct "Item" terminology in the Review step label that shows save completion.

### Blocks (downstream)

- **Phase 2 (REQ-3) Task 2.2**: Adding 'whats-next' to WizardStep type must follow the guidelines in this document to avoid breaking the "Save is final step" requirement.
- **Phase 2 (REQ-3) Task 2.4**: Ensuring no navigation controls on WhatsNextStep depends on the verification that save is truly final.

### Parallel Safety

- **Files touched**: None (verification only, read-only)
- **Conflicts with**: None
- **Safe to parallelize with**:
  - Task 1.1 (reads different sections of same files)
  - Task 1.3 (mobile view - different component areas)
  - Phase 3 (REQ-1) - Dashboard cards (completely separate components)
  - Phase 4 (REQ-4) - Navigation menu (completely separate components)

---

## Implementation Tasks

### Task 1: Verify Submit Flow (15 min)

**Status**: VERIFICATION ONLY

1. Confirm `handleSubmit` in `ItemCapture.tsx` calls `onComplete` then `reset()`
2. Confirm no transition to additional step occurs after submission
3. Document current behavior for reference

**Expected Result**: Confirmation that save completes the workflow.

### Task 2: Verify Step Mapping (10 min)

**Status**: VERIFICATION ONLY

1. Check `STEP_TO_STAGE_INDEX` in `ProgressIndicator.tsx`
2. Confirm 'review' is the highest-indexed step (Stage 4)
3. Confirm no steps exist beyond 'review' in the mapping

**Expected Result**: Confirmation that Review/Save is step 4 of 4.

### Task 3: Document Guidelines for REQ-3 (20 min)

**Status**: DOCUMENTATION ONLY

1. Document the two options for What's Next implementation
2. Specify that 'whats-next' must NOT appear in progress counter
3. Create clear guidance for Phase 2 implementation

**Expected Result**: This document serves as the reference for REQ-3 implementation.

---

## Testing Plan

### Manual Testing Checklist

- [ ] Navigate through complete wizard flow to Review step
- [ ] Observe step counter shows "Step 4 of 4" on Review step
- [ ] Click Submit and verify no additional wizard steps appear
- [ ] Verify `onComplete` callback receives the ItemRecord
- [ ] Verify wizard resets to initial state after submission

### Automated Test Considerations

For unit tests, verify:

```typescript
describe('ItemCapture workflow termination', () => {
  it('should call onComplete with ItemRecord on submit', async () => {
    const onComplete = vi.fn();
    // ... render and fill wizard ...
    await userEvent.click(screen.getByText('Submit'));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      title: expect.any(String),
    }));
  });

  it('should reset wizard state after successful submit', async () => {
    // ... render and complete wizard ...
    await userEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Details')).toBeVisible(); // Back to step 1
  });
});
```

---

## References

- **Source Request**: `docs/gen_requests.md` - REQ-186
- **Implementation Plan**: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- **Related Tasks**:
  - Phase 1, Task 1.1: Update Progress Stages Constant
  - Phase 1, Task 1.3: Update Step Count in Mobile View
  - Phase 2, Task 2.1-2.4: What's Next Screen Implementation
- **Component Files**:
  - `src/components/ItemCapture/ItemCapture.tsx`
  - `src/components/ItemCapture/ItemCapture.types.ts`
  - `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
  - `src/components/ItemCapture/components/steps/ReviewStep.tsx`
  - `src/components/ItemCapture/hooks/useItemCaptureState.ts`
