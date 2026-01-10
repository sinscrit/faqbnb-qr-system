# REQ-160: Remove ContentSourceStep - Detailed Task Breakdown

**Generated:** 2026-01-09 22:15:00 UTC
**Last Modified:** 2026-01-09 22:15:00 UTC
**Request Number:** 160
**Plan Reference:** Plan-094-UI-UX-Workflow-Improvements.md (Phase 3, Task 3.1)
**Overview Document:** REQ-160-remove-contentsourcestep-overview.md
**Type:** ENHANCEMENT
**Size:** S (Small - 8 tasks, ~1 day)

---

## Executive Summary

This document provides the detailed, actionable task breakdown for removing the `content-source-selection` step from the ItemCreationWorkflow. Each task is scoped to approximately 1 story point (a few hours of focused work) with clear verification steps.

### Goal
Remove the redundant `content-source-selection` step so users navigate directly from `specific-item-selection` to `content-creation`, streamlining the workflow from 8 to 7 user-facing steps.

### Workflow Transition

| Current Flow | New Flow |
|--------------|----------|
| 1. room-selection | 1. room-selection |
| 2. item-type-selection | 2. item-type-selection |
| 3. specific-item-selection | 3. specific-item-selection |
| 4. **content-source-selection** | ~~removed~~ |
| 5. content-creation | 4. content-creation |
| 6. preview-save | 5. preview-save |
| 7. next-action | 6. next-action |
| 8. session-summary | 7. session-summary |

---

## Authorized Files for Modification

| File Path | Modification Type |
|-----------|------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | MODIFY |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | MODIFY |

### Files NOT to Delete
| File Path | Reason |
|-----------|--------|
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Keep for potential reuse in Task 3.3 consolidation |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx` | Keep with component |

---

## Detailed Task Breakdown

### Task 1: Update WorkflowStep Type Definition

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** None

#### Description
Remove `'content-source-selection'` from the `WorkflowStep` union type to ensure TypeScript catches any remaining references during compilation.

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
2. Locate the `WorkflowStep` type definition (approximately lines 100-109)
3. Remove the `| 'content-source-selection'` line from the union type

#### Code Change

**Before (lines 100-109):**
```typescript
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'content-source-selection'
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';
```

**After:**
```typescript
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';
```

#### Verification Steps

- [ ] Run `npm run type-check` - expect multiple TypeScript errors (this is expected as other files still reference the removed step)
- [ ] Confirm the type is updated in the file
- [ ] Do NOT proceed to fix other files yet - this ensures compile-time safety

#### Acceptance Criteria
- [ ] `'content-source-selection'` removed from WorkflowStep union type
- [ ] TypeScript compilation fails with expected errors referencing the removed type (validates type safety)

---

### Task 2: Update WORKFLOW_STEPS Array and PROGRESS_WEIGHTS

**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### Description
Remove `'content-source-selection'` from the `WORKFLOW_STEPS` array and recalculate `PROGRESS_WEIGHTS` for the new 7-step flow.

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/utils/constants.ts`
2. Locate `WORKFLOW_STEPS` array (lines 191-201)
3. Remove `'content-source-selection'` from the array
4. Locate `PROGRESS_WEIGHTS` object (lines 222-231)
5. Remove the `'content-source-selection': 50` entry
6. Recalculate progress weights for 7 steps (evenly distributed)

#### Code Changes

**WORKFLOW_STEPS - Before (lines 191-201):**
```typescript
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'content-source-selection',
  // 'content-type-selection' - removed as redundant (content type selected in ItemCapture)
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;
```

**WORKFLOW_STEPS - After:**
```typescript
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  // 'content-source-selection' - removed as redundant (Phase 3, Task 3.1)
  // 'content-type-selection' - removed as redundant (content type selected in ItemCapture)
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;
```

**PROGRESS_WEIGHTS - Before (lines 222-231):**
```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,
  'item-type-selection': 25,
  'specific-item-selection': 37,
  'content-source-selection': 50,
  'content-creation': 75,
  'preview-save': 87,
  'next-action': 93,
  'session-summary': 100,
};
```

**PROGRESS_WEIGHTS - After:**
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

#### Progress Weight Calculation
With 7 steps, each step represents ~14% of progress:
- Step 1 (room-selection): 14%
- Step 2 (item-type-selection): 28%
- Step 3 (specific-item-selection): 42%
- Step 4 (content-creation): 57%
- Step 5 (preview-save): 71%
- Step 6 (next-action): 86%
- Step 7 (session-summary): 100%

#### Verification Steps

- [ ] Verify `WORKFLOW_STEPS` has exactly 7 entries
- [ ] Verify `PROGRESS_WEIGHTS` has exactly 7 entries
- [ ] Verify progress weights sum logically (each step > previous, ending at 100)
- [ ] Run `npm run type-check` - TypeScript should still have errors (expected, fixed in later tasks)

#### Acceptance Criteria
- [ ] `'content-source-selection'` removed from WORKFLOW_STEPS
- [ ] `'content-source-selection': 50` removed from PROGRESS_WEIGHTS
- [ ] Progress weights recalculated for 7-step flow
- [ ] Comments updated to document removal

---

### Task 3: Update STEP_TRANSITIONS in useWorkflowState

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Tasks 1, 2

#### Description
Update the `STEP_TRANSITIONS` map to route `specific-item-selection` directly to `content-creation`, and remove all references to `content-source-selection`.

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `STEP_TRANSITIONS` constant (lines 76-86)
3. Update `specific-item-selection` transition to go to `content-creation`
4. Remove the `content-source-selection` entry entirely
5. Update `next-action` transitions to remove `content-source-selection`

#### Code Changes

**STEP_TRANSITIONS - Before (lines 76-86):**
```typescript
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['content-source-selection'],
  'content-source-selection': ['content-creation'], // Skip content-type-selection - redundant
  'content-type-selection': ['content-creation'], // Kept for backwards compatibility
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-source-selection'],
  'session-summary': [],
};
```

**STEP_TRANSITIONS - After:**
```typescript
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['content-creation'],  // Direct to content creation (Phase 3, Task 3.1)
  'content-type-selection': ['content-creation'],   // Kept for backwards compatibility
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-creation'],  // Changed from content-source-selection
  'session-summary': [],
};
```

#### Verification Steps

- [ ] Verify `specific-item-selection` now transitions to `content-creation`
- [ ] Verify `content-source-selection` entry is completely removed
- [ ] Verify `next-action` transitions include `content-creation` (not `content-source-selection`)
- [ ] Run `npm run type-check` - should have fewer errors now

#### Acceptance Criteria
- [ ] `specific-item-selection` transitions directly to `content-creation`
- [ ] `content-source-selection` entry removed from STEP_TRANSITIONS
- [ ] `next-action` transitions updated to use `content-creation`

---

### Task 4: Update ADD_MORE_TO_ITEM Action

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 3

#### Description
Update the `ADD_MORE_TO_ITEM` reducer case to navigate to `content-creation` instead of `content-source-selection`.

#### Implementation Steps

1. In `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate the `ADD_MORE_TO_ITEM` case in `workflowReducer` (lines 479-495)
3. Change both `currentStep` references from `'content-source-selection'` to `'content-creation'`

#### Code Changes

**ADD_MORE_TO_ITEM - Before (lines 479-495):**
```typescript
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-source-selection',
    stepHistory: newHistory,
    canGoBack: true,
    currentItem: restoredItem,
    isDirty: true,
    session: {
      ...state.session,
      currentStep: 'content-source-selection',
      currentItem: restoredItem,
    },
  };
}
```

**ADD_MORE_TO_ITEM - After:**
```typescript
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-creation',  // Changed from content-source-selection
    stepHistory: newHistory,
    canGoBack: true,
    currentItem: restoredItem,
    isDirty: true,
    session: {
      ...state.session,
      currentStep: 'content-creation',  // Changed from content-source-selection
      currentItem: restoredItem,
    },
  };
}
```

#### Verification Steps

- [ ] Verify both `currentStep` assignments changed to `'content-creation'`
- [ ] Run `npm run type-check` - should compile without errors for this case

#### Acceptance Criteria
- [ ] ADD_MORE_TO_ITEM navigates to `content-creation`
- [ ] Both state.currentStep and session.currentStep updated

---

### Task 5: Update canGoNext Validation

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Estimated Effort:** 0.25 story points
**Dependencies:** Task 4

#### Description
Remove the `content-source-selection` case from the `canGoNext` useMemo validation.

#### Implementation Steps

1. In `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate the `canGoNext` useMemo (lines 801-826)
3. Remove the `case 'content-source-selection':` block

#### Code Changes

**canGoNext - Before (lines 801-826):**
```typescript
const canGoNext = useMemo(() => {
  // Can't go next from terminal step
  if (state.currentStep === 'session-summary') return false;

  // Check step-specific requirements
  switch (state.currentStep) {
    case 'room-selection':
      return state.currentItem?.room != null;
    case 'item-type-selection':
      return state.currentItem?.itemType != null;
    case 'specific-item-selection':
      return (state.currentItem?.specificItem ?? '').length > 0;
    case 'content-source-selection':
      return state.currentItem?.contentSource != null;
    case 'content-type-selection':
      return state.currentItem?.contentType != null;
    case 'content-creation':
      return (state.currentItem?.content?.length ?? 0) > 0;
    case 'preview-save':
      return true; // Can always proceed to next-action
    case 'next-action':
      return true; // User makes choice in this step
    default:
      return false;
  }
}, [state.currentStep, state.currentItem]);
```

**canGoNext - After:**
```typescript
const canGoNext = useMemo(() => {
  // Can't go next from terminal step
  if (state.currentStep === 'session-summary') return false;

  // Check step-specific requirements
  switch (state.currentStep) {
    case 'room-selection':
      return state.currentItem?.room != null;
    case 'item-type-selection':
      return state.currentItem?.itemType != null;
    case 'specific-item-selection':
      return (state.currentItem?.specificItem ?? '').length > 0;
    // content-source-selection case removed (Phase 3, Task 3.1)
    case 'content-type-selection':
      return state.currentItem?.contentType != null;
    case 'content-creation':
      return (state.currentItem?.content?.length ?? 0) > 0;
    case 'preview-save':
      return true; // Can always proceed to next-action
    case 'next-action':
      return true; // User makes choice in this step
    default:
      return false;
  }
}, [state.currentStep, state.currentItem]);
```

#### Verification Steps

- [ ] Verify `content-source-selection` case is removed
- [ ] Run `npm run type-check` - should compile cleanly for useWorkflowState.ts

#### Acceptance Criteria
- [ ] `content-source-selection` case removed from canGoNext switch
- [ ] Comment added documenting removal

---

### Task 6: Remove ContentSourceStep Rendering from Main Component

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** Tasks 1-5

#### Description
Remove the `ContentSourceStep` import and the rendering case from `renderCurrentStep()` in the main workflow component.

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
2. Remove `ContentSourceStep` from the imports (line 23)
3. Remove `selectContentSource` from the destructured hook result (line 114)
4. Remove the `case 'content-source-selection':` block from `renderCurrentStep()` (lines 478-486)

#### Code Changes

**Imports - Before (line 23):**
```typescript
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';
```

**Imports - After:**
```typescript
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';
```

**Hook destructure - Before (around line 114):**
```typescript
selectContentSource,
```

**Hook destructure - After:**
Remove the line (or comment it out for reference).

**renderCurrentStep - Before (lines 478-486):**
```typescript
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

**renderCurrentStep - After:**
Remove the entire case block.

#### Verification Steps

- [ ] Verify `ContentSourceStep` removed from imports
- [ ] Verify `selectContentSource` removed from hook destructuring
- [ ] Verify `content-source-selection` case removed from renderCurrentStep
- [ ] Run `npm run type-check` - should compile cleanly
- [ ] Run `npm run lint` - should pass without errors

#### Acceptance Criteria
- [ ] ContentSourceStep no longer imported
- [ ] selectContentSource no longer destructured
- [ ] content-source-selection case block removed from renderCurrentStep

---

### Task 7: Update Steps Barrel Export

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`
**Estimated Effort:** 0.25 story points
**Dependencies:** Task 6

#### Description
Remove the `ContentSourceStep` export from the barrel file and update the JSDoc comment documenting the step flow.

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/components/steps/index.ts`
2. Remove the export lines for `ContentSourceStep` (lines 62-63)
3. Update the JSDoc step flow comment (lines 8-19) to reflect the new flow

#### Code Changes

**Exports - Before (lines 62-63):**
```typescript
export { ContentSourceStep } from './ContentSourceStep';
export type { ContentSourceStepProps } from './ContentSourceStep';
```

**Exports - After:**
Remove these two lines. Optionally add a comment:
```typescript
// ContentSourceStep export removed (Phase 3, Task 3.1) - component kept for potential reuse
```

**JSDoc - Before (lines 8-19):**
```typescript
/**
 * ## Step Flow
 * ```
 * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
 * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
 * 3. SpecificItemStep       - Select/name specific item with suggestions
 * 4. ContentSourceStep      - Choose existing content or create new
 * 5. ContentTypeStep        - Select content type (video, photo, pdf, etc.)
 * 6. ContentCreationStep    - Create/upload content (delegates to ItemCapture)
 * 7. PreviewSaveStep        - Preview and save the item
 * 8. NextActionStep         - Add more content, new item, or finish
 * 9. SessionSummaryStep     - Review all items and print QR codes
 * ```
```

**JSDoc - After:**
```typescript
/**
 * ## Step Flow
 * ```
 * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
 * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
 * 3. SpecificItemStep       - Select/name specific item with suggestions
 * 4. ContentCreationStep    - Create/upload content (delegates to ItemCapture)
 * 5. PreviewSaveStep        - Preview and save the item
 * 6. NextActionStep         - Add more content, new item, or finish
 * 7. SessionSummaryStep     - Review all items and print QR codes
 * ```
 *
 * Note: ContentSourceStep removed in Phase 3, Task 3.1 (component file retained for reuse)
```

#### Verification Steps

- [ ] Verify `ContentSourceStep` exports removed
- [ ] Verify JSDoc step flow updated to show 7 steps
- [ ] Run `npm run type-check` - should compile cleanly
- [ ] Run `npm run lint` - should pass

#### Acceptance Criteria
- [ ] ContentSourceStep no longer exported
- [ ] JSDoc step flow documentation updated
- [ ] Note added about component file retention

---

### Task 8: Full Verification and Testing

**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1-7

#### Description
Perform comprehensive verification of all changes, including TypeScript compilation, linting, and manual workflow testing.

#### Implementation Steps

1. Run full TypeScript compilation
2. Run linting
3. Run build
4. Perform manual testing of the workflow
5. Search for any remaining references to removed step

#### Verification Commands

```bash
# Step 1: TypeScript compilation
npm run type-check

# Step 2: Linting
npm run lint

# Step 3: Build verification
npm run build

# Step 4: Search for remaining references
grep -r "content-source-selection" src/
grep -r "ContentSourceStep" src/ --include="*.ts" --include="*.tsx" | grep -v "ContentSourceStep.tsx" | grep -v "ContentSourceStep.test.tsx"
```

#### Manual Testing Checklist

- [ ] **Navigation Flow Test**
  1. Start the workflow at room-selection
  2. Select a room (e.g., Kitchen)
  3. Select an item type (e.g., Appliance)
  4. Select a specific item (e.g., Refrigerator)
  5. Verify you are taken directly to content-creation (NOT content-source-selection)
  6. Complete content creation
  7. Continue through preview-save, next-action, session-summary

- [ ] **Back Navigation Test**
  1. From content-creation, click Back
  2. Verify you return to specific-item-selection (NOT content-source-selection)
  3. Click Back again to item-type-selection
  4. Verify navigation chain works correctly

- [ ] **Add More Content Test**
  1. Complete an item through preview-save
  2. At next-action, select "Add More Content"
  3. Verify you are taken to content-creation (NOT content-source-selection)

- [ ] **Progress Bar Test**
  1. Verify progress bar shows correct percentages at each step
  2. Verify step indicator shows correct step numbers (e.g., "Step 4 of 7" at content-creation)

- [ ] **Console Errors Test**
  1. Open browser developer tools (Console tab)
  2. Navigate through entire workflow
  3. Verify no errors or warnings related to invalid steps or transitions

- [ ] **Mobile Viewport Test**
  1. Resize browser to mobile width (375px)
  2. Navigate through workflow
  3. Verify all steps display correctly
  4. Verify touch navigation works

#### Accessibility Verification

- [ ] Tab through each step with keyboard
- [ ] Verify focus moves correctly between steps
- [ ] Verify screen reader announces correct step number
- [ ] Verify no accessibility warnings in console

#### Expected Results

| Metric | Expected |
|--------|----------|
| TypeScript compilation | 0 errors |
| Lint errors | 0 errors |
| Build | Success |
| grep content-source-selection | Only in ContentSourceStep.tsx and test file |
| grep ContentSourceStep | Only in ContentSourceStep.tsx and test file |

#### Acceptance Criteria
- [ ] TypeScript compiles without errors
- [ ] Lint passes without errors
- [ ] Build completes successfully
- [ ] No unexpected references to removed step
- [ ] Manual navigation flow works correctly
- [ ] Back navigation works correctly
- [ ] "Add More Content" navigates to correct step
- [ ] Progress bar displays correct values
- [ ] No console errors during workflow
- [ ] Step numbering is accurate

---

## Task Summary

| Task | Description | File(s) | Est. Points | Dependencies |
|------|-------------|---------|-------------|--------------|
| 1 | Update WorkflowStep type | ItemCreationWorkflow.types.ts | 0.5 | None |
| 2 | Update WORKFLOW_STEPS & PROGRESS_WEIGHTS | constants.ts | 0.5 | Task 1 |
| 3 | Update STEP_TRANSITIONS | useWorkflowState.ts | 0.5 | Tasks 1,2 |
| 4 | Update ADD_MORE_TO_ITEM action | useWorkflowState.ts | 0.5 | Task 3 |
| 5 | Update canGoNext validation | useWorkflowState.ts | 0.25 | Task 4 |
| 6 | Remove rendering from main component | ItemCreationWorkflow.tsx | 0.5 | Tasks 1-5 |
| 7 | Update barrel exports | steps/index.ts | 0.25 | Task 6 |
| 8 | Full verification and testing | All files | 1.0 | Tasks 1-7 |
| **Total** | | | **4.0** | |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking back navigation | Medium | High | Test back navigation at each step thoroughly |
| Session storage incompatibility | Low | Medium | Existing sessions with old step will trigger recovery flow |
| TypeScript errors in untested code | Low | Low | Run full type-check before and after |
| Progress bar calculation issues | Low | Medium | Verify PROGRESS_WEIGHTS sum to expected values |

---

## Rollback Plan

If issues are discovered after implementation:

1. Revert all 5 files to their previous state using git:
   ```bash
   git checkout HEAD~1 -- src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts
   git checkout HEAD~1 -- src/components/ItemCreationWorkflow/utils/constants.ts
   git checkout HEAD~1 -- src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts
   git checkout HEAD~1 -- src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx
   git checkout HEAD~1 -- src/components/ItemCreationWorkflow/components/steps/index.ts
   ```

2. Run verification:
   ```bash
   npm run type-check && npm run lint && npm run build
   ```

---

## References

- **Request:** `/docs/gen_requests.md` - REQ-160
- **Overview:** `/docs/REQ-160-remove-contentsourcestep-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 3, Task 3.1
- **State Machine:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Types:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Constants:** `/src/components/ItemCreationWorkflow/utils/constants.ts`

---

## Acceptance Criteria (from REQ-160)

All criteria from the original request:

- [ ] The content source selection step no longer appears in the workflow sequence
- [ ] Users navigate from the previous step directly to the next step without errors
- [ ] Step numbering and progress indicators reflect the correct total number of remaining steps
- [ ] All forward and backward navigation functions work correctly across the modified workflow
- [ ] No errors or warnings appear in the console related to the removed step
- [ ] The workflow can be completed end-to-end successfully
- [ ] Step index calculations remain accurate throughout the workflow
