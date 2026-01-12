# REQ-185: Update Progress Stages Constant - Implementation Overview

**Document Created**: 2026-01-12 22:45:00
**Last Modified**: 2026-01-12 22:45:00
**Request ID**: REQ-185
**Type**: BUG FIX
**Size**: S
**Phase**: 1 - REQ-5 - Fix Workflow Step Count
**Task ID**: 1.1
**Implementation Plan Reference**: docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md

---

## Executive Summary

This task investigates and fixes a workflow step count display inconsistency in the ItemCapture wizard. The investigation reveals that the current `ProgressIndicator` component correctly maps multiple wizard steps to 4 display stages, but there is a **missing mapping for the `add-url` step** in the `STEP_TO_STAGE_INDEX` constant. This causes the progress indicator to default to stage 0 (Details) when users are on the URL input step, creating confusing progress feedback.

---

## Problem Analysis

### Current Behavior

The `STEP_TO_STAGE_INDEX` constant in `ProgressIndicator.tsx` (lines 65-75) maps internal wizard steps to display stage indices:

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

**Issue**: The `add-url` step (defined in `ItemCapture.types.ts` line 253) is **missing** from this mapping. When a user navigates to the URL input step, the `getCurrentStageIndex()` function falls back to index 0 via the `?? 0` fallback, incorrectly showing "Step 1 of 4" instead of "Step 2 of 4".

### WizardStep Type Definition (ItemCapture.types.ts:246-256)

```typescript
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'add-url'      // <-- This step is missing from STEP_TO_STAGE_INDEX
  | 'edit-media'
  | 'add-more'
  | 'review';
```

### Expected Behavior

- The progress indicator should show "Step 2 of 4" when on the `add-url` step
- All wizard steps should have explicit mappings in `STEP_TO_STAGE_INDEX`
- TypeScript should enforce completeness of the mapping at compile time

---

## Investigation Findings

### Step Count Display

The ProgressIndicator correctly displays a 4-stage workflow:
1. **Details** (Stage 1) - `metadata`
2. **Content** (Stage 2) - `content-type`, `capture-*`, `upload-file`, `write-text`, `add-url`, `add-more`
3. **Edit** (Stage 3) - `edit-media`
4. **Review** (Stage 4) - `review`

### Inconsistency Source

The inconsistency mentioned in REQ-185 ("8 of 10" display) may refer to:
1. A previous implementation that has been replaced
2. A user observation from a different component
3. The incorrect display caused by the missing `add-url` mapping

The current implementation correctly shows "X of 4" for all mapped steps. The only bug is the missing `add-url` mapping.

### No Other Step Counters Found

Searched the codebase for other step count displays:
- Only `ProgressIndicator.tsx` displays step counts
- Tests confirm expected behavior is "Step X of 4"
- No other components show alternative step counts

---

## Root Cause

**Missing step mapping**: The `add-url` wizard step was added to the `WizardStep` type (REQ-092) but the `STEP_TO_STAGE_INDEX` mapping in `ProgressIndicator.tsx` was not updated to include it.

---

## Proposed Solution

### Task 1.1.1: Add Missing `add-url` Mapping

**File**: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`

**Change**: Add `add-url` to the `STEP_TO_STAGE_INDEX` constant, mapping it to stage index 1 (Content).

**Current (lines 65-75)**:
```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,
  'content-type': 1,
  'capture-video': 1,
  'capture-photo': 1,
  'upload-file': 1,
  'write-text': 1,
  'edit-media': 2,
  'add-more': 1,
  'review': 3,
};
```

**Updated**:
```typescript
export const STEP_TO_STAGE_INDEX: Record<WizardStep, number> = {
  'metadata': 0,        // Stage 1: Details
  'content-type': 1,    // Stage 2: Content
  'capture-video': 1,   // Stage 2: Content
  'capture-photo': 1,   // Stage 2: Content
  'upload-file': 1,     // Stage 2: Content
  'write-text': 1,      // Stage 2: Content
  'add-url': 1,         // Stage 2: Content (NEW)
  'edit-media': 2,      // Stage 3: Edit
  'add-more': 1,        // Stage 2: Content (returning)
  'review': 3,          // Stage 4: Review
};
```

### Task 1.1.2: Add Unit Test for `add-url` Step

**File**: `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`

**Change**: Add test case to verify `add-url` step shows correct stage.

```typescript
it('displays correct step count for add-url step', () => {
  render(<ProgressIndicator currentStep="add-url" />);
  expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
});
```

---

## Dependencies

### Depends On (upstream)
- **None**: This is a standalone bug fix with no dependencies on other tasks.

### Blocks (downstream)
- **Task 1.2**: Ensure Save Is Final Step - may reference progress stages
- **Task 1.3**: Update Step Count in Mobile View - uses same constants
- **Phase 2 (REQ-3)**: What's Next screen - will need progress indicator to be accurate before adding `whats-next` step handling

### Parallel Safety
- **Files touched**:
  - `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
  - `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx`
- **Conflicts with**: Tasks 1.2 and 1.3 (same file - should be done sequentially)
- **Safe to parallelize with**:
  - Phase 3 (REQ-1): Dashboard cards - different files
  - Phase 4 (REQ-4): Navigation menu - different files

---

## Authorized Files and Functions for Modification

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | `STEP_TO_STAGE_INDEX` constant (lines 65-75) | Add missing `add-url` mapping |
| `src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx` | `describe('ProgressIndicator')` test suite | Add test for `add-url` step |

---

## Technical Considerations

### TypeScript Enforcement

The type `Record<WizardStep, number>` should enforce that all WizardStep values have a mapping. However, the current implementation doesn't cause a compile-time error because TypeScript allows partial assignment with the fallback at runtime.

**Recommendation**: Consider adding a compile-time assertion to catch missing mappings:

```typescript
// Type assertion to ensure all wizard steps are mapped
const _exhaustiveCheck: Record<WizardStep, number> = STEP_TO_STAGE_INDEX;
```

### No Breaking Changes

This fix only adds a missing mapping. Existing functionality remains unchanged:
- All currently mapped steps continue to work correctly
- The 4-stage display remains consistent
- Mobile and desktop views both benefit from the fix

---

## Testing Plan

### Unit Tests
- [ ] Verify `add-url` step displays "Step 2 of 4" on mobile view
- [ ] Verify `add-url` step highlights stage 2 (Content) on desktop view
- [ ] Verify progress bar shows 50% progress on `add-url` step
- [ ] Verify ARIA label includes correct stage information

### Manual Testing
- [ ] Navigate to URL input step via content type selection
- [ ] Verify mobile progress shows "Step 2 of 4"
- [ ] Verify desktop progress highlights "Content" stage
- [ ] Complete workflow through `add-url` path and verify all stages display correctly

---

## Effort Estimate

| Task | Description | Estimate |
|------|-------------|----------|
| 1.1.1 | Add `add-url` mapping | 5 minutes |
| 1.1.2 | Add unit test | 10 minutes |
| Testing | Manual verification | 10 minutes |
| **Total** | | **25 minutes** |

---

## Acceptance Criteria

- [ ] `STEP_TO_STAGE_INDEX` includes `add-url` mapped to stage index 1
- [ ] Progress indicator shows "Step 2 of 4" when on `add-url` step
- [ ] Unit test verifies `add-url` step count display
- [ ] All existing progress indicator tests continue to pass
- [ ] No TypeScript errors or warnings

---

## References

- **Request**: docs/gen_requests.md (REQ-185)
- **Implementation Plan**: docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
- **Source File**: src/components/ItemCapture/components/shared/ProgressIndicator.tsx
- **Types File**: src/components/ItemCapture/ItemCapture.types.ts
- **Test File**: src/components/ItemCapture/components/__tests__/wizard-navigation.test.tsx
