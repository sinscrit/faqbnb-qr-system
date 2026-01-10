# REQ-158: Integrate PurposeStep into Workflow - Implementation Overview

**Generated:** 2026-01-09 23:45:00 UTC
**Last Modified:** 2026-01-09 23:45:00 UTC
**Request ID:** REQ-158
**Phase:** 2 - New Purpose Step
**Task ID:** 2.2
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides a technical implementation breakdown for integrating the `PurposeStep` component into the main `ItemCreationWorkflow` orchestrator. This integration connects the purpose selection interface (created in REQ-157) to the workflow state machine, enabling users to select a content purpose during item creation. The task involves adding imports, rendering logic, and connecting to the existing reducer actions.

---

## Task Context from Implementation Plan

From Phase 2, Task 2.2 of Plan-094:

```
#### Task 2.2: Integrate PurposeStep into Workflow
- [ ] Add PurposeStep import to `ItemCreationWorkflow.tsx`
- [ ] Add case for 'purpose-selection' in `renderCurrentStep()`
- [ ] Connect to `selectPurpose` action
- [ ] Test navigation flow
```

---

## Requirements Analysis

### From REQ-158 (gen_requests.md)

**User Story:** The purpose selection interface component must be integrated into the main item creation workflow so users can access and interact with it during the creation process.

**Current Behavior:**
The purpose selection component exists as a standalone element but is not connected to the item creation workflow. Users navigating through the workflow cannot access the purpose selection interface, making it impossible to specify the purpose of their item during creation.

**Expected Behavior:**
When users reach the purpose selection stage of the workflow, they see and can interact with the purpose selection interface. Their selection triggers the appropriate workflow action, and the workflow advances to the next step after a purpose is chosen.

**Acceptance Criteria:**
- [ ] The purpose selection component appears when the workflow reaches the purpose selection step
- [ ] Users can interact with all purpose selection interface elements within the workflow
- [ ] Selecting a purpose triggers the correct workflow state transition
- [ ] The workflow advances to the appropriate next step after purpose selection
- [ ] The purpose selection step displays consistently with other workflow steps
- [ ] Navigation between workflow steps functions correctly before and after the purpose selection step
- [ ] All workflow state data related to purpose selection is properly maintained

---

## Prerequisites

### Must Be Completed Before This Task

| Task | Status | Description |
|------|--------|-------------|
| REQ-154 (Task 1.1) | Required | Add `PurposeType` to types, add `purpose` field to `CurrentItemState`, add `SELECT_PURPOSE` action |
| REQ-155 (Task 1.2) | Required | Create `titleGenerator.ts` utility for auto-generating titles |
| REQ-156 (Task 1.3) | Required | Update state machine with `SELECT_PURPOSE` reducer case, update step transitions |
| REQ-157 (Task 2.1) | Required | Create `PurposeStep.tsx` component with full UI and accessibility |

### Verification Before Starting

Before implementing this task, verify that the following exist:

1. **Type definitions exist:**
   - `PurposeType` type in `ItemCreationWorkflow.types.ts`
   - `purpose` field in `CurrentItemState` interface
   - `SELECT_PURPOSE` action in `WorkflowAction` union
   - `'purpose-selection'` in `WorkflowStep` type

2. **Constants exist:**
   - `PURPOSE_TYPES` array in `constants.ts`
   - `PURPOSE_LABELS` mapping in `constants.ts`
   - `PURPOSE_DESCRIPTIONS` mapping in `constants.ts`

3. **State machine is updated:**
   - `SELECT_PURPOSE` case in `workflowReducer`
   - `selectPurpose` action in `useWorkflowState` hook return
   - Step transitions include `'purpose-selection'`

4. **Component exists:**
   - `PurposeStep.tsx` in `/components/steps/`
   - Export in `steps/index.ts`

---

## Existing Patterns to Follow

### Current Step Rendering Pattern in ItemCreationWorkflow.tsx

Reference: Lines 438-550 of `ItemCreationWorkflow.tsx`

```typescript
// Pattern for rendering step components
const renderCurrentStep = useCallback(() => {
  const commonProps = {
    onNext: nextStep,
    canNext: canGoNext,
  };

  switch (state.currentStep) {
    case 'room-selection':
      return (
        <RoomSelectionStep
          currentRoom={state.currentItem?.room ?? null}
          onSelectRoom={selectRoom}
          onNext={nextStep}
          canNext={canGoNext}
        />
      );
    case 'item-type-selection':
      return (
        <ItemTypeStep
          currentItemType={state.currentItem?.itemType ?? null}
          onSelectItemType={selectItemType}
          onNext={nextStep}
          canNext={canGoNext}
        />
      );
    // ... other cases
  }
}, [/* dependencies */]);
```

### Props Pattern for Selection Steps

All selection step components follow a consistent props interface:

```typescript
// Current[Type] - The currently selected value from state (null if none)
// onSelect[Type] - Callback to update state when user makes selection
// onNext - Callback to advance to next step
// canNext - Boolean indicating if advancement is allowed

interface SelectionStepProps {
  current[Type]: TypeValue | null;
  onSelect[Type]: (value: TypeValue) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}
```

### Import Pattern

Reference: Lines 23 in `ItemCreationWorkflow.tsx`

```typescript
import {
  RoomSelectionStep,
  ItemTypeStep,
  SpecificItemStep,
  ContentSourceStep,  // Will remain for backwards compatibility
  ContentTypeStep,
  ContentCreationStep,
  PreviewSaveStep,
  NextActionStep,
  SessionSummaryStep
} from './components/steps';
```

---

## Implementation Tasks

### Task 1: Add PurposeStep Import

**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Line 23 (import statement)

**Change:**
```typescript
// BEFORE:
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';

// AFTER:
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, PurposeStep, ContentSourceStep, ContentTypeStep, ContentCreationStep, PreviewSaveStep, NextActionStep, SessionSummaryStep } from './components/steps';
```

### Task 2: Add selectPurpose to useWorkflowState Destructuring

**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Lines 98-124 (useWorkflowState hook destructuring)

**Change:**
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
  selectContentSource,
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
  selectPurpose,        // ADD THIS LINE
  selectContentSource,
  selectContentType,
  // ... rest
} = useWorkflowState();
```

### Task 3: Add 'purpose-selection' Case in renderCurrentStep

**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Inside `renderCurrentStep` callback, after `specific-item-selection` case (around line 476)

**Change:**
```typescript
// Add this case after 'specific-item-selection' and before 'content-source-selection':

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

### Task 4: Update renderCurrentStep Dependencies

**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Location:** Line 550 (useCallback dependencies array)

**Change:**
```typescript
// BEFORE:
}, [state.currentStep, state.currentItem, state.session.items, nextStep, prevStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectContentSource, selectContentType, addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem, isSaving, itemCount, handleAddMore, startNewItem, completeSession, existingItems, isLoadingExisting, handleEditItem, removeSessionItem, handleProceedToPrint, handleFinishWithoutPrint]);

// AFTER (add selectPurpose to the array):
}, [state.currentStep, state.currentItem, state.session.items, nextStep, prevStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectPurpose, selectContentSource, selectContentType, addContentPiece, removeContentPiece, reorderContent, goToStep, handleSaveItem, isSaving, itemCount, handleAddMore, startNewItem, completeSession, existingItems, isLoadingExisting, handleEditItem, removeSessionItem, handleProceedToPrint, handleFinishWithoutPrint]);
```

---

## Expected PurposeStep Props Interface

Based on Plan-094 Integration Contract and existing patterns:

```typescript
export interface PurposeStepProps {
  /** Currently selected purpose (null if none) */
  currentPurpose: PurposeType | null;
  /** Callback when purpose is selected */
  onSelectPurpose: (purpose: PurposeType) => void;
  /** Callback to proceed to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class */
  className?: string;
}
```

---

## Expected useWorkflowState Changes (Prerequisites)

The following must exist in `useWorkflowState.ts` before this integration works:

### Action Definition
```typescript
// In hook return type
selectPurpose: (purpose: PurposeType) => void;
```

### Action Implementation
```typescript
const selectPurpose = useCallback((purpose: PurposeType) => {
  dispatch({ type: 'SELECT_PURPOSE', payload: purpose });
}, []);
```

### Reducer Case
```typescript
case 'SELECT_PURPOSE': {
  if (!state.currentItem) return state;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    purpose: action.payload,
  };
  return {
    ...state,
    currentItem: updatedItem,
    isDirty: true,
    session: {
      ...state.session,
      currentItem: updatedItem,
    },
  };
}
```

### canGoNext Update
```typescript
case 'purpose-selection':
  return state.currentItem?.purpose != null;
```

### Step Transitions Update
```typescript
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  // ...
  'specific-item-selection': ['purpose-selection'],  // Changed from content-source-selection
  'purpose-selection': ['content-type-selection'],   // New entry
  // ...
};
```

---

## Authorized Files and Functions for Modification

### Files to MODIFY

| File | Changes |
|------|---------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add import, add case, add dependency |

### Specific Locations to Modify

| Location | Line | Change Type |
|----------|------|-------------|
| Import statement | ~23 | Add `PurposeStep` to imports |
| Hook destructuring | ~98-124 | Add `selectPurpose` |
| renderCurrentStep switch | ~476 | Add new case for 'purpose-selection' |
| useCallback dependencies | ~550 | Add `selectPurpose` to array |

### Files to READ (Reference Only)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Verify props interface |
| `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Verify selectPurpose action exists |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Verify PurposeType and purpose field exist |

---

## Integration Flow

```
                     BEFORE INTEGRATION:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ specific-item-   │ --> │ content-source-  │ --> │ content-type-    │
│ selection        │     │ selection        │     │ selection        │
└──────────────────┘     └──────────────────┘     └──────────────────┘


                     AFTER INTEGRATION:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ specific-item-   │ --> │ purpose-         │ --> │ content-type-    │
│ selection        │     │ selection        │     │ selection        │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ PurposeStep      │
                    │ component        │
                    │ renders here     │
                    └──────────────────┘
```

---

## Testing Checklist

### Manual Testing Steps

1. **Navigation Flow**
   - [ ] Start workflow from room-selection
   - [ ] Navigate through item-type-selection
   - [ ] Navigate through specific-item-selection
   - [ ] Verify purpose-selection step appears next
   - [ ] Select a purpose and verify auto-advance
   - [ ] Verify workflow continues to content-type-selection

2. **State Persistence**
   - [ ] Select a purpose
   - [ ] Navigate forward and back
   - [ ] Verify selected purpose is preserved
   - [ ] Complete workflow and verify purpose in saved item

3. **Back Navigation**
   - [ ] From purpose-selection, click Back
   - [ ] Verify return to specific-item-selection
   - [ ] From content-type-selection, click Back
   - [ ] Verify return to purpose-selection

4. **Error Conditions**
   - [ ] Verify workflow doesn't crash if PurposeStep component is missing
   - [ ] Verify Continue button is disabled when no purpose selected

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Prerequisites not complete | High | High | Verify all prerequisites before starting; document exact checks |
| PurposeStep props mismatch | Medium | Medium | Cross-reference props interface with actual component |
| Missing selectPurpose action | Medium | High | Verify hook export before integration |
| Step transitions not updated | Medium | High | Test navigation flow thoroughly |

---

## Estimated Effort

| Sub-task | Estimate | Confidence |
|----------|----------|------------|
| Verify prerequisites | 10 minutes | High |
| Add import statement | 2 minutes | High |
| Add hook destructuring | 2 minutes | High |
| Add switch case | 5 minutes | High |
| Update dependencies array | 2 minutes | High |
| Manual testing | 15 minutes | High |
| **Total** | **~35 minutes** | High |

---

## Definition of Done

- [ ] PurposeStep imported in ItemCreationWorkflow.tsx
- [ ] selectPurpose destructured from useWorkflowState
- [ ] case 'purpose-selection' added to renderCurrentStep
- [ ] selectPurpose added to useCallback dependencies
- [ ] No TypeScript errors
- [ ] No console errors during navigation
- [ ] Purpose selection step renders correctly in workflow
- [ ] Selecting purpose triggers state update
- [ ] Auto-advance to next step works
- [ ] Back navigation from purpose step works
- [ ] Forward navigation from purpose step works
- [ ] Selected purpose persists through workflow

---

## Dependencies on Other Tasks

### This Task Depends On:

```
Task 1.1: Update Types and Constants (REQ-154)
         └── Task 1.3: Update State Machine (REQ-156)
                       └── Task 2.1: Create PurposeStep Component (REQ-157)
                                     └── Task 2.2: Integrate PurposeStep (THIS TASK)
```

### Tasks That Depend on This:

```
Task 2.2: Integrate PurposeStep (THIS TASK)
         └── Task 2.3: Create Unit Tests (REQ-159)
         └── Task 3.1: Remove ContentSourceStep (REQ-160)
```

---

## References

- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- Request: `/docs/gen_requests.md` - REQ-158
- Main Workflow Component: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- State Machine Hook: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- Types: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- Steps Barrel: `/src/components/ItemCreationWorkflow/components/steps/index.ts`
- PurposeStep Overview: `/docs/REQ-157-create-purposestep-component-overview.md`
