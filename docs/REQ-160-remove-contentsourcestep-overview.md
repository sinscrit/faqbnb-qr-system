# REQ-160: Remove ContentSourceStep - Implementation Overview

**Generated:** 2026-01-09 21:45:00 UTC
**Last Modified:** 2026-01-09 21:45:00 UTC
**Request Number:** 160
**Plan Reference:** Plan-094-UI-UX-Workflow-Improvements.md (Phase 3, Task 3.1)
**Type:** ENHANCEMENT
**Size:** S

---

## Summary

Remove the `content-source-selection` step from the ItemCreationWorkflow to streamline the user experience. This step is redundant as the user's content type selection in ContentTypeStep already implies whether they are uploading existing content or creating new content. After removal, users will proceed directly from `specific-item-selection` to `content-creation`.

---

## Current State Analysis

### Workflow Flow (Current)

```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. content-source-selection    <-- REMOVE THIS STEP
5. content-creation            (content-type-selection already removed)
6. preview-save
7. next-action
8. session-summary
```

### Files Currently Using ContentSourceStep

| File | Current Usage |
|------|---------------|
| `constants.ts:195` | `'content-source-selection'` in `WORKFLOW_STEPS` array |
| `constants.ts:226` | `'content-source-selection': 50` in `PROGRESS_WEIGHTS` |
| `useWorkflowState.ts:79-80` | Transition from `specific-item-selection` → `content-source-selection` |
| `useWorkflowState.ts:80-81` | Transition from `content-source-selection` → `content-creation` |
| `useWorkflowState.ts:84` | `next-action` can transition to `content-source-selection` |
| `useWorkflowState.ts:484-495` | `ADD_MORE_TO_ITEM` action navigates to `content-source-selection` |
| `useWorkflowState.ts:814` | `canGoNext` check for `content-source-selection` step |
| `ItemCreationWorkflow.tsx:23` | Imports `ContentSourceStep` |
| `ItemCreationWorkflow.tsx:478-486` | Renders `ContentSourceStep` case in `renderCurrentStep()` |
| `ItemCreationWorkflow.types.ts:104` | `'content-source-selection'` in `WorkflowStep` union type |
| `steps/index.ts:62-63` | Exports `ContentSourceStep` and its types |

---

## Implementation Approach

### Target Workflow Flow (After Change)

```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. content-creation            <-- Skip directly to content creation
5. preview-save
6. next-action
7. session-summary
```

### Implementation Strategy

The implementation requires **surgical removal** of the `content-source-selection` step while ensuring:
1. Navigation flows correctly (specific-item → content-creation)
2. Progress weights are recalculated
3. "Add More to Item" functionality continues working
4. No console errors or warnings
5. Step indices update correctly

---

## Tasks

### Task 1: Update Type Definitions

**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

**Changes:**
- [ ] Remove `'content-source-selection'` from `WorkflowStep` union type (line ~104)

**Code Location:**
```typescript
// Line 100-109 - Remove 'content-source-selection'
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'content-source-selection'  // <-- REMOVE THIS LINE
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';
```

---

### Task 2: Update Constants

**File:** `/src/components/ItemCreationWorkflow/utils/constants.ts`

**Changes:**
- [ ] Remove `'content-source-selection'` from `WORKFLOW_STEPS` array (line ~195)
- [ ] Remove `'content-source-selection': 50` from `PROGRESS_WEIGHTS` (line ~226)
- [ ] Recalculate progress weights for remaining steps

**Code Location:**
```typescript
// Lines 191-201 - Remove 'content-source-selection'
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'content-source-selection',  // <-- REMOVE THIS LINE
  // 'content-type-selection' - already commented out
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;

// Lines 222-231 - Remove and recalculate progress weights
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,        // Keep ~12% (early step)
  'item-type-selection': 25,   // Keep ~25%
  'specific-item-selection': 38,  // Adjust from 37% (was step 3/7)
  'content-source-selection': 50, // <-- REMOVE THIS LINE
  'content-creation': 62,      // Adjust from 75% (now step 4/7)
  'preview-save': 75,          // Adjust from 87%
  'next-action': 88,           // Adjust from 93%
  'session-summary': 100,      // Keep 100%
};
```

**New Progress Weights (7 steps):**
```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 14,
  'item-type-selection': 28,
  'specific-item-selection': 42,
  'content-creation': 57,
  'preview-save': 71,
  'next-action': 86,
  'session-summary': 100,
};
```

---

### Task 3: Update Step Transitions

**File:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Changes:**
- [ ] Update `STEP_TRANSITIONS` to route `specific-item-selection` → `content-creation` (lines ~76-86)
- [ ] Remove `content-source-selection` entry from `STEP_TRANSITIONS`
- [ ] Update `next-action` transitions to skip `content-source-selection`

**Code Location:**
```typescript
// Lines 76-86 - Update STEP_TRANSITIONS
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['content-source-selection'],  // <-- CHANGE TO 'content-creation'
  'content-source-selection': ['content-creation'],         // <-- REMOVE THIS LINE
  'content-type-selection': ['content-creation'],           // Keep for backwards compat
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-source-selection'],  // <-- REMOVE content-source-selection
  'session-summary': [],
};
```

**New STEP_TRANSITIONS:**
```typescript
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['content-creation'],  // Direct to content creation
  'content-type-selection': ['content-creation'],   // Keep for backwards compatibility
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-creation'],  // Changed
  'session-summary': [],
};
```

---

### Task 4: Update ADD_MORE_TO_ITEM Action

**File:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Changes:**
- [ ] Update `ADD_MORE_TO_ITEM` case to navigate to `content-creation` instead of `content-source-selection` (lines ~479-495)

**Code Location:**
```typescript
// Lines 479-495 - Change navigation target
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-source-selection',  // <-- CHANGE TO 'content-creation'
    stepHistory: newHistory,
    canGoBack: true,
    currentItem: restoredItem,
    isDirty: true,
    session: {
      ...state.session,
      currentStep: 'content-source-selection',  // <-- CHANGE TO 'content-creation'
      currentItem: restoredItem,
    },
  };
}
```

---

### Task 5: Update canGoNext Validation

**File:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Changes:**
- [ ] Remove `content-source-selection` case from `canGoNext` validation (lines ~801-826)

**Code Location:**
```typescript
// Lines 806-825 - Remove content-source-selection case
const canGoNext = useMemo(() => {
  if (state.currentStep === 'session-summary') return false;

  switch (state.currentStep) {
    case 'room-selection':
      return state.currentItem?.room != null;
    case 'item-type-selection':
      return state.currentItem?.itemType != null;
    case 'specific-item-selection':
      return (state.currentItem?.specificItem ?? '').length > 0;
    case 'content-source-selection':    // <-- REMOVE THIS CASE
      return state.currentItem?.contentSource != null;
    case 'content-type-selection':
      return state.currentItem?.contentType != null;
    case 'content-creation':
      return (state.currentItem?.content?.length ?? 0) > 0;
    case 'preview-save':
      return true;
    case 'next-action':
      return true;
    default:
      return false;
  }
}, [state.currentStep, state.currentItem]);
```

---

### Task 6: Remove ContentSourceStep Rendering

**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Changes:**
- [ ] Remove `ContentSourceStep` from imports (line ~23)
- [ ] Remove `'content-source-selection'` case from `renderCurrentStep()` function (lines ~478-486)

**Code Location:**
```typescript
// Line 23 - Remove ContentSourceStep from import
import {
  RoomSelectionStep,
  ItemTypeStep,
  SpecificItemStep,
  ContentSourceStep,  // <-- REMOVE THIS
  ContentTypeStep,
  ContentCreationStep,
  PreviewSaveStep,
  NextActionStep,
  SessionSummaryStep
} from './components/steps';

// Lines 478-486 - Remove this entire case block
case 'content-source-selection':
  return (
    <ContentSourceStep
      currentContentSource={state.currentItem?.contentSource ?? null}
      onSelectContentSource={selectContentSource}
      onNext={nextStep}
      canNext={canGoNext}
    />
  );
```

---

### Task 7: Update Steps Barrel Export

**File:** `/src/components/ItemCreationWorkflow/components/steps/index.ts`

**Changes:**
- [ ] Remove `ContentSourceStep` export (lines ~62-63)
- [ ] Update JSDoc comment listing step flow (lines ~8-19)

**Code Location:**
```typescript
// Lines 62-63 - Remove exports
export { ContentSourceStep } from './ContentSourceStep';  // <-- REMOVE
export type { ContentSourceStepProps } from './ContentSourceStep';  // <-- REMOVE

// Lines 8-19 - Update JSDoc step flow comment
/**
 * ## Step Flow
 * ```
 * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
 * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
 * 3. SpecificItemStep       - Select/name specific item with suggestions
 * 4. ContentSourceStep      - Choose existing content or create new    <-- REMOVE
 * 5. ContentTypeStep        - Select content type (video, photo, pdf, etc.)  <-- RENUMBER
 * 6. ContentCreationStep    - Create/upload content (delegates to ItemCapture)
 * ...
 * ```
 */
```

---

### Task 8: Verify and Clean Up

**Files to verify:**
- [ ] Verify no other references to `content-source-selection` exist in codebase
- [ ] Verify `selectContentSource` can be removed from main component if no longer used
- [ ] Verify ContentCreationStep properly handles both existing and new content sources
- [ ] Run TypeScript compilation to catch any type errors
- [ ] Test navigation flow: room → item-type → specific-item → content-creation

**Search for remaining references:**
```bash
grep -r "content-source-selection" src/
grep -r "ContentSourceStep" src/
grep -r "selectContentSource" src/
```

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Specific Changes |
|-----------|------------------|------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY | Remove `content-source-selection` from `WorkflowStep` type |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY | Remove from `WORKFLOW_STEPS`, update `PROGRESS_WEIGHTS` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | Update `STEP_TRANSITIONS`, `ADD_MORE_TO_ITEM`, `canGoNext` |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY | Remove import and rendering case |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | MODIFY | Remove export, update JSDoc |

### Files NOT to Delete (Keep for Reference)

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Keep file - may be reused or referenced; let task 3.3 handle consolidation |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx` | Keep test file with component |

### Functions/Constants to Modify

| Location | Function/Constant | Change |
|----------|-------------------|--------|
| `constants.ts` | `WORKFLOW_STEPS` | Remove `'content-source-selection'` |
| `constants.ts` | `PROGRESS_WEIGHTS` | Remove entry, recalculate weights |
| `useWorkflowState.ts` | `STEP_TRANSITIONS` | Update transitions |
| `useWorkflowState.ts` | `workflowReducer` (ADD_MORE_TO_ITEM case) | Change target step |
| `useWorkflowState.ts` | `canGoNext` (useMemo) | Remove case |
| `ItemCreationWorkflow.tsx` | `renderCurrentStep()` | Remove case |

---

## Testing Requirements

### Manual Testing Checklist

- [ ] Navigate from room-selection through entire workflow - verify no errors
- [ ] Verify progress bar increments correctly at each step
- [ ] Verify "Back" navigation works from content-creation to specific-item-selection
- [ ] Verify "Add More Content" from NextActionStep goes to content-creation
- [ ] Verify step counter displays correct numbers (e.g., "Step 4 of 7")
- [ ] Check browser console for any warnings about invalid transitions
- [ ] Test on mobile viewport for touch navigation

### Automated Verification

```bash
# Type checking
npm run type-check

# Lint
npm run lint

# Build verification
npm run build
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking step history navigation | Medium | High | Test back navigation thoroughly |
| Progress bar calculation errors | Low | Medium | Verify PROGRESS_WEIGHTS sum to 100 |
| Session storage compatibility | Low | Medium | Existing sessions with old step will be handled by recovery flow |
| TypeScript compilation errors | Medium | Low | Run type-check before committing |

---

## Dependencies

- **Precedes Task 3.2:** Update ContentTypeStep Labels (separate task)
- **Precedes Task 3.3:** Consolidate Content Options (may reuse ContentSourceStep UI)

---

## Acceptance Criteria (from REQ-160)

- [ ] The content source selection step no longer appears in the workflow sequence
- [ ] Users navigate from the previous step directly to the next step without errors
- [ ] Step numbering and progress indicators reflect the correct total number of remaining steps
- [ ] All forward and backward navigation functions work correctly across the modified workflow
- [ ] No errors or warnings appear in the console related to the removed step
- [ ] The workflow can be completed end-to-end successfully
- [ ] Step index calculations remain accurate throughout the workflow

---

## References

- **Request:** `/docs/gen_requests.md` - REQ-160
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 3, Task 3.1
- **Current Component:** `/src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`
- **State Machine:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Types:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
