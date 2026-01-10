# REQ-158: Integrate PurposeStep into Workflow - Detailed Task Breakdown

**Generated:** 2026-01-09 20:33:27 UTC
**Last Modified:** 2026-01-09 20:33:27 UTC
**Request ID:** REQ-158
**Phase:** 2 - New Purpose Step
**Task ID:** 2.2
**Overview Document:** `/docs/REQ-158-integrate-purposestep-into-workflow-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides a granular, actionable task breakdown for integrating the `PurposeStep` component into the `ItemCreationWorkflow` orchestrator. Each task is designed to be completed in a few hours or less (~1 story point). The integration connects the purpose selection UI (REQ-157) to the workflow state machine, enabling users to select a content purpose during item creation.

---

## Prerequisites Verification Checklist

Before beginning ANY implementation tasks, the following MUST be verified:

### Required Dependencies (Must Be Complete)

| Dependency | REQ | What to Verify | Verification Command/Location |
|------------|-----|----------------|-------------------------------|
| Type definitions | REQ-154 | `PurposeType` type exists | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` |
| State field | REQ-154 | `purpose` field in `CurrentItemState` | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` |
| Action type | REQ-154 | `SELECT_PURPOSE` in `WorkflowAction` | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` |
| Step type | REQ-154 | `'purpose-selection'` in `WorkflowStep` | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` |
| Constants | REQ-154 | `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS` | `src/components/ItemCreationWorkflow/utils/constants.ts` |
| Title generator | REQ-155 | `generateArticleTitle()` function | `src/components/ItemCreationWorkflow/utils/titleGenerator.ts` |
| Reducer case | REQ-156 | `SELECT_PURPOSE` case in `workflowReducer` | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` |
| Hook action | REQ-156 | `selectPurpose` returned from `useWorkflowState` | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` |
| Step transitions | REQ-156 | `'purpose-selection'` in `STEP_TRANSITIONS` | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` |
| canGoNext | REQ-156 | `'purpose-selection'` case in `canGoNext` | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` |
| PurposeStep component | REQ-157 | `PurposeStep.tsx` exists | `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` |
| Component export | REQ-157 | `PurposeStep` exported | `src/components/ItemCreationWorkflow/components/steps/index.ts` |

---

## Authorized Files for Modification

### Files to MODIFY

| File | Authorized Changes |
|------|-------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add import, add hook destructuring, add switch case, update dependencies |

### Files to READ ONLY (Reference)

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Verify props interface |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Verify `selectPurpose` action exists |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Verify `PurposeType` and `purpose` field |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Verify `PurposeStep` export |

---

## Task Breakdown

### Task 1: Verify All Prerequisites Are Complete

**Objective:** Confirm all dependent tasks (REQ-154, REQ-155, REQ-156, REQ-157) are complete before integration.

**Files to Read:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- `src/components/ItemCreationWorkflow/utils/constants.ts`
- `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
- `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Steps:**

1. **Verify Type Definitions (REQ-154)**
   - [ ] Open `ItemCreationWorkflow.types.ts`
   - [ ] Confirm `PurposeType` type exists with values: `'how-to-use' | 'how-to-clean' | 'troubleshooting' | 'safety-info' | 'maintenance' | 'features' | 'other'`
   - [ ] Confirm `purpose: PurposeType | null` field exists in `CurrentItemState` interface
   - [ ] Confirm `{ type: 'SELECT_PURPOSE'; payload: PurposeType }` exists in `WorkflowAction` union
   - [ ] Confirm `'purpose-selection'` exists in `WorkflowStep` type

2. **Verify Constants (REQ-154)**
   - [ ] Open `utils/constants.ts`
   - [ ] Confirm `PURPOSE_TYPES` array exists
   - [ ] Confirm `PURPOSE_LABELS` mapping exists
   - [ ] Confirm `PURPOSE_DESCRIPTIONS` mapping exists

3. **Verify Title Generator (REQ-155)**
   - [ ] Open `utils/titleGenerator.ts`
   - [ ] Confirm `generateArticleTitle()` function exists and is exported

4. **Verify State Machine (REQ-156)**
   - [ ] Open `hooks/useWorkflowState.ts`
   - [ ] Confirm `case 'SELECT_PURPOSE':` exists in `workflowReducer`
   - [ ] Confirm `selectPurpose` function is defined
   - [ ] Confirm `selectPurpose` is returned from the hook
   - [ ] Confirm `'purpose-selection'` is in `STEP_TRANSITIONS`
   - [ ] Confirm `case 'purpose-selection':` exists in `canGoNext` computed value

5. **Verify PurposeStep Component (REQ-157)**
   - [ ] Open `components/steps/PurposeStep.tsx`
   - [ ] Confirm component exports `PurposeStep`
   - [ ] Confirm props interface includes: `currentPurpose`, `onSelectPurpose`, `onNext`, `canNext`
   - [ ] Open `components/steps/index.ts`
   - [ ] Confirm `export { PurposeStep } from './PurposeStep';` exists

**Verification:**
- [ ] All 12 prerequisite items pass verification
- [ ] Document any missing prerequisites that must be completed first

**If Prerequisites Are Not Complete:**
- STOP this task
- Return to the prerequisite task that is incomplete
- Complete that task first before continuing

---

### Task 2: Add PurposeStep Import Statement

**Objective:** Import the PurposeStep component into the main workflow orchestrator.

**File to Modify:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Line 23 (import statement from `./components/steps`)

**Implementation Steps:**

1. **Read the current import statement**
   - [ ] Open `ItemCreationWorkflow.tsx`
   - [ ] Locate the import from `'./components/steps'` (approximately line 23)
   - [ ] Note the current list of imported components

2. **Modify the import statement**
   - [ ] Add `PurposeStep` to the import list
   - [ ] Position after `SpecificItemStep` (alphabetically/logically with other selection steps)

**Code Change:**

```typescript
// BEFORE (line 23):
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';

// AFTER:
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, PurposeStep, ContentSourceStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';
```

**Verification:**
- [ ] No TypeScript compilation errors
- [ ] `PurposeStep` shows in IDE autocomplete
- [ ] Run: `npx tsc --noEmit` - no errors related to import

---

### Task 3: Add selectPurpose to Hook Destructuring

**Objective:** Extract the `selectPurpose` action from the `useWorkflowState` hook return value.

**File to Modify:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Lines 98-124 (useWorkflowState destructuring)

**Implementation Steps:**

1. **Locate the hook destructuring**
   - [ ] Find the `const { ... } = useWorkflowState();` statement
   - [ ] Identify where to add `selectPurpose` (after `setItemName`, before `selectContentSource`)

2. **Add selectPurpose to destructuring**
   - [ ] Add `selectPurpose,` on a new line
   - [ ] Position logically after `setItemName` and before `selectContentSource`

**Code Change:**

```typescript
// BEFORE:
const {
  state,
  nextStep,
  prevStep,
  goToStep,
  canGoBack,
  canGoNext,
  progressPercent,
  currentStepIndex,
  totalSteps,
  itemCount,
  reset,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  setItemName,
  selectContentSource,   // selectPurpose should go before this
  selectContentType,
  // ... rest
} = useWorkflowState();

// AFTER:
const {
  state,
  nextStep,
  prevStep,
  goToStep,
  canGoBack,
  canGoNext,
  progressPercent,
  currentStepIndex,
  totalSteps,
  itemCount,
  reset,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  setItemName,
  selectPurpose,         // ADD THIS LINE
  selectContentSource,
  selectContentType,
  // ... rest
} = useWorkflowState();
```

**Verification:**
- [ ] No TypeScript compilation errors
- [ ] `selectPurpose` is recognized as a function
- [ ] Hover shows type: `(purpose: PurposeType) => void`

---

### Task 4: Add purpose-selection Case to renderCurrentStep

**Objective:** Render the PurposeStep component when workflow reaches `'purpose-selection'` step.

**File to Modify:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Inside `renderCurrentStep` callback (after `'specific-item-selection'` case, before `'content-source-selection'` case)

**Implementation Steps:**

1. **Locate the renderCurrentStep function**
   - [ ] Find the `const renderCurrentStep = useCallback(() => {` definition
   - [ ] Find the switch statement inside

2. **Identify insertion point**
   - [ ] Find `case 'specific-item-selection':` (approximately line 464-476)
   - [ ] Find `case 'content-source-selection':` (approximately line 478-486)
   - [ ] The new case goes between these two

3. **Add the new case**
   - [ ] Add `case 'purpose-selection':` after `specific-item-selection` case
   - [ ] Return PurposeStep component with correct props

**Code Change:**

```typescript
// Add after the 'specific-item-selection' case (around line 477):

case 'purpose-selection':
  return (
    <PurposeStep
      currentPurpose={state.currentItem?.purpose ?? null}
      onSelectPurpose={selectPurpose}
      onNext={nextStep}
      canNext={canGoNext}
    />
  );
```

**Props Mapping:**

| Prop | Source | Description |
|------|--------|-------------|
| `currentPurpose` | `state.currentItem?.purpose ?? null` | Currently selected purpose from state |
| `onSelectPurpose` | `selectPurpose` | Action to update purpose in state |
| `onNext` | `nextStep` | Standard workflow navigation |
| `canNext` | `canGoNext` | Computed from state machine |

**Verification:**
- [ ] No TypeScript compilation errors
- [ ] Props match PurposeStepProps interface
- [ ] Case is positioned correctly in switch order

---

### Task 5: Update renderCurrentStep useCallback Dependencies

**Objective:** Add `selectPurpose` to the dependencies array of the `renderCurrentStep` useCallback.

**File to Modify:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Line 550 (useCallback dependencies array)

**Implementation Steps:**

1. **Locate the dependencies array**
   - [ ] Find the closing `}, [` of the `renderCurrentStep` useCallback
   - [ ] This is approximately at line 550

2. **Add selectPurpose to dependencies**
   - [ ] Add `selectPurpose` to the array
   - [ ] Position after `setItemName` (maintaining logical order)

**Code Change:**

```typescript
// BEFORE (line 550):
}, [state.currentStep, state.currentItem, state.session.items, nextStep, prevStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectContentSource, selectContentType, addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem, isSaving, itemCount, handleAddMore, startNewItem, completeSession, existingItems, isLoadingExisting, handleEditItem, removeSessionItem, handleProceedToPrint, handleFinishWithoutPrint]);

// AFTER:
}, [state.currentStep, state.currentItem, state.session.items, nextStep, prevStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectPurpose, selectContentSource, selectContentType, addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem, isSaving, itemCount, handleAddMore, startNewItem, completeSession, existingItems, isLoadingExisting, handleEditItem, removeSessionItem, handleProceedToPrint, handleFinishWithoutPrint]);
```

**Verification:**
- [ ] No ESLint warnings about missing dependencies
- [ ] `selectPurpose` appears in the array
- [ ] Array maintains consistent ordering pattern

---

### Task 6: Manual Testing - Navigation Flow

**Objective:** Verify the purpose selection step integrates correctly into the workflow navigation.

**Testing Environment:**
- Local development server running (`npm run dev`)
- Browser with developer console open

**Test Cases:**

#### Test 6.1: Forward Navigation to Purpose Step
1. [ ] Start workflow from room-selection
2. [ ] Select a room (e.g., Kitchen)
3. [ ] Select an item type (e.g., Appliance)
4. [ ] Select/enter a specific item (e.g., Fridge)
5. [ ] **VERIFY:** Purpose selection step appears next
6. [ ] **VERIFY:** PurposeStep component renders with all purpose options
7. [ ] **VERIFY:** No console errors

#### Test 6.2: Purpose Selection Updates State
1. [ ] On purpose-selection step, select a purpose (e.g., "How to Clean")
2. [ ] **VERIFY:** Purpose card shows selected state (visual feedback)
3. [ ] **VERIFY:** Workflow auto-advances to next step (content-type-selection)
4. [ ] **VERIFY:** No console errors

#### Test 6.3: Back Navigation from Purpose Step
1. [ ] From purpose-selection step, click Back button
2. [ ] **VERIFY:** Returns to specific-item-selection step
3. [ ] **VERIFY:** Previous selections are preserved
4. [ ] [ ] Click Continue to return to purpose-selection
5. [ ] **VERIFY:** Previously selected purpose is still shown

#### Test 6.4: Back Navigation from Content Type Step
1. [ ] From content-type-selection step, click Back button
2. [ ] **VERIFY:** Returns to purpose-selection step
3. [ ] **VERIFY:** Selected purpose is preserved

#### Test 6.5: Complete Workflow with Purpose
1. [ ] Complete full workflow: Room → Item Type → Item → Purpose → Content Type → Content → Preview → Save
2. [ ] **VERIFY:** No errors throughout
3. [ ] **VERIFY:** Item saves successfully

**Verification Checklist:**
- [ ] All 5 test cases pass
- [ ] No console errors or warnings
- [ ] Navigation is seamless in both directions

---

### Task 7: Manual Testing - State Persistence

**Objective:** Verify purpose selection state persists correctly throughout the workflow.

**Test Cases:**

#### Test 7.1: Purpose Persists Through Forward Navigation
1. [ ] Navigate to purpose-selection step
2. [ ] Select "Troubleshooting" purpose
3. [ ] Navigate forward through remaining steps (don't save)
4. [ ] Navigate all the way back to purpose-selection
5. [ ] **VERIFY:** "Troubleshooting" is still selected

#### Test 7.2: Purpose Persists After Content Addition
1. [ ] Complete through content-creation step (add some content)
2. [ ] Navigate back to purpose-selection step
3. [ ] **VERIFY:** Previously selected purpose is still shown

#### Test 7.3: Purpose Appears in Preview Step
1. [ ] Select a purpose (e.g., "How to Use")
2. [ ] Complete through to preview-save step
3. [ ] **VERIFY:** (If PreviewSaveStep shows purpose) Purpose value displays correctly

**Verification Checklist:**
- [ ] All 3 test cases pass
- [ ] Purpose state never gets lost during navigation

---

### Task 8: Manual Testing - Accessibility

**Objective:** Verify purpose selection step meets accessibility requirements.

**Test Cases:**

#### Test 8.1: Keyboard Navigation
1. [ ] Navigate to purpose-selection step using only keyboard
2. [ ] **VERIFY:** Can Tab to purpose options
3. [ ] **VERIFY:** Can use Arrow keys to move between options
4. [ ] **VERIFY:** Can use Enter/Space to select a purpose
5. [ ] **VERIFY:** Focus indicators are visible

#### Test 8.2: Screen Reader Announcements
1. [ ] Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. [ ] Navigate to purpose-selection step
3. [ ] **VERIFY:** Step change is announced
4. [ ] **VERIFY:** Purpose options are announced with labels
5. [ ] **VERIFY:** Selection confirmation is announced

#### Test 8.3: Focus Management
1. [ ] Navigate from specific-item-selection to purpose-selection
2. [ ] **VERIFY:** Focus moves to purpose step heading or first interactive element
3. [ ] After selecting a purpose and advancing
4. [ ] **VERIFY:** Focus moves appropriately to next step

**Verification Checklist:**
- [ ] All keyboard navigation works
- [ ] Screen reader provides meaningful announcements
- [ ] Focus management is correct

---

### Task 9: Build Verification

**Objective:** Verify the build succeeds with no errors.

**Steps:**

1. **Run TypeScript compilation check**
   ```bash
   npx tsc --noEmit
   ```
   - [ ] No TypeScript errors

2. **Run linter**
   ```bash
   npm run lint
   ```
   - [ ] No ESLint errors
   - [ ] No ESLint warnings related to changes

3. **Run production build**
   ```bash
   npm run build
   ```
   - [ ] Build completes successfully
   - [ ] No build errors or warnings

**Verification Checklist:**
- [ ] TypeScript check passes
- [ ] Lint check passes
- [ ] Production build succeeds

---

## Code Changes Summary

### File: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

| Line | Change Type | Description |
|------|-------------|-------------|
| ~23 | MODIFY | Add `PurposeStep` to import statement |
| ~98-124 | MODIFY | Add `selectPurpose` to hook destructuring |
| ~477 | ADD | New `case 'purpose-selection':` in renderCurrentStep |
| ~550 | MODIFY | Add `selectPurpose` to useCallback dependencies |

---

## Expected Final State

After completing all tasks:

1. **Import statement includes PurposeStep:**
   ```typescript
   import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, PurposeStep, ContentSourceStep, ... } from './components/steps';
   ```

2. **Hook destructuring includes selectPurpose:**
   ```typescript
   const { ..., selectPurpose, ... } = useWorkflowState();
   ```

3. **Switch statement includes purpose-selection case:**
   ```typescript
   case 'purpose-selection':
     return (
       <PurposeStep
         currentPurpose={state.currentItem?.purpose ?? null}
         onSelectPurpose={selectPurpose}
         onNext={nextStep}
         canNext={canGoNext}
       />
     );
   ```

4. **Dependencies array includes selectPurpose:**
   ```typescript
   }, [..., selectPurpose, ...]);
   ```

---

## Definition of Done

- [ ] Task 1: All prerequisites verified complete
- [ ] Task 2: PurposeStep import added
- [ ] Task 3: selectPurpose destructured from hook
- [ ] Task 4: purpose-selection case added to renderCurrentStep
- [ ] Task 5: selectPurpose added to useCallback dependencies
- [ ] Task 6: Navigation flow tests pass
- [ ] Task 7: State persistence tests pass
- [ ] Task 8: Accessibility tests pass
- [ ] Task 9: Build verification passes
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console errors during runtime
- [ ] Code follows existing patterns in ItemCreationWorkflow.tsx

---

## Rollback Plan

If issues are discovered after integration:

1. **Revert import statement** - Remove `PurposeStep` from imports
2. **Revert hook destructuring** - Remove `selectPurpose`
3. **Revert switch case** - Remove `case 'purpose-selection':`
4. **Revert dependencies** - Remove `selectPurpose` from array

All changes are isolated to `ItemCreationWorkflow.tsx` and can be reverted without affecting other files.

---

## Dependencies and Blockers

### This Task Depends On:

```
REQ-154 (Types & Constants)
    └── REQ-156 (State Machine)
            └── REQ-157 (PurposeStep Component)
                    └── REQ-158 (This Integration) ←── YOU ARE HERE
```

### Tasks That Depend on This:

```
REQ-158 (This Integration)
    ├── REQ-159 (Unit Tests for PurposeStep)
    └── REQ-160 (Remove ContentSourceStep)
```

---

## References

- Overview Document: `/docs/REQ-158-integrate-purposestep-into-workflow-overview.md`
- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- Request Entry: `/docs/gen_requests.md` - REQ-158
- Main Workflow Component: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- State Machine Hook: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- Types: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- Steps Barrel: `/src/components/ItemCreationWorkflow/components/steps/index.ts`
- PurposeStep Component: `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 20:33:27 UTC | AI Agent | Initial document creation |
