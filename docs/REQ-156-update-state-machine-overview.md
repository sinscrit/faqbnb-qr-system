# REQ-156: Update State Machine - Implementation Breakdown

**Generated:** 2026-01-09 21:45:00 UTC
**Last Modified:** 2026-01-09 21:45:00 UTC
**Request ID:** REQ-156
**Task Reference:** Phase 1 - Foundation, Task 1.3
**Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Overview

This document provides a detailed implementation breakdown for updating the ItemCreationWorkflow state machine to support the new purpose-driven workflow. The changes include adding a new `SELECT_PURPOSE` action, removing the `content-source-selection` step, updating step transitions, integrating title auto-generation, and ensuring proper validation for the new purpose selection step.

### Key Changes Summary
1. Add `SELECT_PURPOSE` reducer case to handle purpose selection
2. Remove `content-source-selection` from the step flow
3. Update `getNextStep()` function for new workflow transitions
4. Integrate title auto-generation when purpose is selected
5. Add `canGoNext` validation for the purpose step
6. Add unit tests for the new reducer cases

### Dependencies
- **Prerequisite:** REQ-154 (Types and Constants) - Adds `PurposeType` and `PURPOSE_TYPES`
- **Prerequisite:** REQ-155 (Title Generator Utility) - Provides `generateArticleTitle()`

---

## Technical Context

### Current State Machine Architecture

The workflow state machine is implemented in `useWorkflowState.ts` using the React `useReducer` pattern. Key components:

```
State Structure:
├── currentStep: WorkflowStep        // Current position in workflow
├── stepHistory: WorkflowStep[]      // Navigation history for back
├── canGoBack: boolean               // Computed from history
├── session: WorkflowSession         // Session data with items
├── currentItem: CurrentItemState    // Item being created
├── isSubmitting, isDirty, errors    // UI state
```

### Current Step Flow
```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. content-source-selection  ← TO BE REMOVED
5. content-creation
6. preview-save
7. next-action
8. session-summary
```

### New Step Flow (After Changes)
```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. purpose-selection         ← NEW STEP
5. content-type-selection    ← RESTORED (consolidated)
6. content-creation
7. preview-save
8. next-action
9. session-summary
```

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Location | Change Type | Functions to Modify |
|------|----------|-------------|---------------------|
| `useWorkflowState.ts` | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | MODIFY | `workflowReducer()`, `getNextStep()`, `STEP_TRANSITIONS`, `createInitialState()`, `useWorkflowState()` |
| `ItemCreationWorkflow.types.ts` | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | MODIFY | `WorkflowAction` type union, `WorkflowStep` type union |
| `constants.ts` | `src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY | `WORKFLOW_STEPS`, `PROGRESS_WEIGHTS` |

### Test Files (Create/Modify)

| File | Location | Change Type |
|------|----------|-------------|
| `useWorkflowState.test.ts` | `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` | CREATE/MODIFY |

### Related Files (Read-Only Reference)

| File | Purpose |
|------|---------|
| `titleGenerator.ts` | Import `generateArticleTitle()` function |
| `ItemCreationWorkflow.tsx` | Reference for integration patterns |
| `ItemTypeStep.tsx` | Reference for step component patterns |

---

## Implementation Tasks

### Task 1: Update Type Definitions

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

#### 1.1 Add `purpose-selection` to WorkflowStep Type

```typescript
// Current (lines 100-109):
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

// New:
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'purpose-selection'         // NEW: Added
  | 'content-source-selection'  // KEEP: For backwards compatibility
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';
```

#### 1.2 Add SELECT_PURPOSE Action to WorkflowAction Type

```typescript
// Add to WorkflowAction union (around line 321-361):
export type WorkflowAction =
  // Navigation actions
  | { type: 'GO_TO_STEP'; payload: WorkflowStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

  // Room/Item selection actions
  | { type: 'SELECT_ROOM'; payload: RoomType }
  | { type: 'SELECT_ITEM_TYPE'; payload: ItemType }
  | { type: 'SELECT_SPECIFIC_ITEM'; payload: string }
  | { type: 'SET_ITEM_NAME'; payload: string }
  | { type: 'SELECT_PURPOSE'; payload: PurposeType }  // NEW: Added

  // ... rest of actions
```

**Note:** Requires importing `PurposeType` from the updated types (REQ-154).

---

### Task 2: Update Constants

**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`

#### 2.1 Update WORKFLOW_STEPS Array

```typescript
// Current (lines 191-201):
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'content-source-selection',
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;

// New:
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',          // NEW: Added
  'content-type-selection',     // RESTORED: For consolidated content options
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;
```

#### 2.2 Update PROGRESS_WEIGHTS

```typescript
// Current (lines 222-231):
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

// New (recalculated for 8 steps):
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,
  'item-type-selection': 25,
  'specific-item-selection': 37,
  'purpose-selection': 50,        // NEW
  'content-type-selection': 62,   // ADDED
  'content-creation': 75,
  'preview-save': 87,
  'next-action': 93,
  'session-summary': 100,
};
```

---

### Task 3: Update State Machine Reducer

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

#### 3.1 Update Imports

```typescript
// Add import for title generator (after REQ-155 is complete):
import { generateArticleTitle } from '../utils/titleGenerator';
import type { PurposeType } from '../ItemCreationWorkflow.types';
```

#### 3.2 Update STEP_TRANSITIONS

```typescript
// Current (lines 76-86):
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['content-source-selection'],
  'content-source-selection': ['content-creation'],
  'content-type-selection': ['content-creation'],
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-source-selection'],
  'session-summary': [],
};

// New:
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['purpose-selection'],           // CHANGED: Goes to purpose
  'purpose-selection': ['content-type-selection'],            // NEW: Then to content type
  'content-source-selection': ['content-type-selection'],     // KEEP: For backwards compat
  'content-type-selection': ['content-creation'],
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-type-selection'], // CHANGED
  'session-summary': [],
};
```

#### 3.3 Update getNextStep() Function

```typescript
// Current (lines 139-159):
export function getNextStep(
  currentStep: WorkflowStep,
  state: WorkflowState
): WorkflowStep | null {
  const transitions = STEP_TRANSITIONS[currentStep];
  if (!transitions || transitions.length === 0) return null;

  if (currentStep === 'room-selection') {
    if (shouldSkipItemType(state)) {
      return 'specific-item-selection';
    }
    return 'item-type-selection';
  }

  if (transitions.length === 1) return transitions[0];

  return null;
}

// New (add purpose-selection handling):
export function getNextStep(
  currentStep: WorkflowStep,
  state: WorkflowState
): WorkflowStep | null {
  const transitions = STEP_TRANSITIONS[currentStep];
  if (!transitions || transitions.length === 0) return null;

  // Handle room-selection skip logic
  if (currentStep === 'room-selection') {
    if (shouldSkipItemType(state)) {
      return 'specific-item-selection';
    }
    return 'item-type-selection';
  }

  // NEW: Handle specific-item-selection -> purpose-selection
  if (currentStep === 'specific-item-selection') {
    return 'purpose-selection';
  }

  // NEW: Handle purpose-selection -> content-type-selection
  if (currentStep === 'purpose-selection') {
    return 'content-type-selection';
  }

  // For steps with single transition, return it
  if (transitions.length === 1) return transitions[0];

  // Multi-transition steps require explicit choice
  return null;
}
```

#### 3.4 Add SELECT_PURPOSE Reducer Case

Add new case in the `workflowReducer` function (after SELECT_SPECIFIC_ITEM, around line 300):

```typescript
case 'SELECT_PURPOSE': {
  if (!state.currentItem) return state;

  const purpose = action.payload;

  // Generate article title based on purpose and item
  const articleTitle = generateArticleTitle({
    specificItem: state.currentItem.specificItem,
    purpose: purpose,
  });

  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    purpose: purpose,
    // Auto-generate the article title (user can edit later)
    itemName: articleTitle,
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

#### 3.5 Update ADD_MORE_TO_ITEM Action

Update the `ADD_MORE_TO_ITEM` case to use the new step flow:

```typescript
// Current (lines 479-495):
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-source-selection',  // OLD
    // ...
  };
}

// New:
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-type-selection',    // NEW: Skip to content type directly
    stepHistory: newHistory,
    canGoBack: true,
    currentItem: restoredItem,
    isDirty: true,
    session: {
      ...state.session,
      currentStep: 'content-type-selection',
      currentItem: restoredItem,
    },
  };
}
```

#### 3.6 Update Hook Return Interface

Add `selectPurpose` action to the hook return:

```typescript
// Add to UseWorkflowStateReturn interface (around line 605):
export interface UseWorkflowStateReturn {
  // ... existing properties ...

  /** Select a purpose for the current item (triggers title auto-generation) */
  selectPurpose: (purpose: PurposeType) => void;

  // ... rest of properties ...
}
```

#### 3.7 Add selectPurpose Action Function

Add the action function in the hook body:

```typescript
// Add after selectSpecificItem (around line 713):
const selectPurpose = useCallback((purpose: PurposeType) => {
  dispatch({ type: 'SELECT_PURPOSE', payload: purpose });
}, []);
```

#### 3.8 Update canGoNext Computed Value

Add validation for the purpose step:

```typescript
// Update canGoNext useMemo (around lines 801-826):
const canGoNext = useMemo(() => {
  if (state.currentStep === 'session-summary') return false;

  switch (state.currentStep) {
    case 'room-selection':
      return state.currentItem?.room != null;
    case 'item-type-selection':
      return state.currentItem?.itemType != null;
    case 'specific-item-selection':
      return (state.currentItem?.specificItem ?? '').length > 0;
    case 'purpose-selection':                              // NEW
      return state.currentItem?.purpose != null;           // NEW
    case 'content-source-selection':
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

#### 3.9 Export selectPurpose in Hook Return

```typescript
// Add to the return object (around line 846):
return {
  // ... existing returns ...
  selectPurpose,           // NEW
  // ... rest of returns ...
};
```

---

### Task 4: Update CurrentItemState Initialization

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

Update SELECT_ROOM case to include purpose field:

```typescript
// Current SELECT_ROOM case (lines 242-263):
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  const newItem: CurrentItemState = {
    room: roomType,
    itemType: itemType as ItemType,
    specificItem: '',
    itemName: '',
    contentSource: 'existing',
    contentType: null,
    content: [],
  };
  // ...
}

// New (add purpose field):
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  const newItem: CurrentItemState = {
    room: roomType,
    itemType: itemType as ItemType,
    specificItem: '',
    itemName: '',
    purpose: null,                // NEW: Initialize purpose as null
    contentSource: 'existing',
    contentType: null,
    content: [],
  };
  // ...
}
```

**Note:** This requires `CurrentItemState` interface to have the `purpose` field added (from REQ-154).

---

### Task 5: Add Unit Tests

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`

Create or update test file with the following test cases:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useWorkflowState, workflowReducer, getNextStep, STEP_TRANSITIONS } from '../useWorkflowState';

describe('useWorkflowState - Purpose Selection', () => {
  describe('SELECT_PURPOSE action', () => {
    it('should set purpose on current item', () => {
      const { result } = renderHook(() => useWorkflowState());

      // Setup: Select room and item first
      act(() => {
        result.current.selectRoom('kitchen');
        result.current.nextStep();
        result.current.selectItemType('appliance');
        result.current.nextStep();
        result.current.selectSpecificItem('Fridge');
        result.current.nextStep();
      });

      // Test: Select purpose
      act(() => {
        result.current.selectPurpose('how-to-clean');
      });

      expect(result.current.state.currentItem?.purpose).toBe('how-to-clean');
    });

    it('should auto-generate article title when purpose is selected', () => {
      const { result } = renderHook(() => useWorkflowState());

      // Setup
      act(() => {
        result.current.selectRoom('kitchen');
        result.current.nextStep();
        result.current.selectItemType('appliance');
        result.current.nextStep();
        result.current.selectSpecificItem('Fridge');
        result.current.nextStep();
      });

      // Test
      act(() => {
        result.current.selectPurpose('how-to-clean');
      });

      expect(result.current.state.currentItem?.itemName).toBe('How to Clean - Fridge');
    });

    it('should mark state as dirty when purpose is selected', () => {
      const { result } = renderHook(() => useWorkflowState());

      // Setup
      act(() => {
        result.current.selectRoom('kitchen');
        result.current.nextStep();
        result.current.selectItemType('appliance');
        result.current.nextStep();
        result.current.selectSpecificItem('Fridge');
        result.current.nextStep();
      });

      // Test
      act(() => {
        result.current.selectPurpose('troubleshooting');
      });

      expect(result.current.state.isDirty).toBe(true);
    });
  });

  describe('canGoNext for purpose-selection step', () => {
    it('should return false when no purpose is selected', () => {
      const { result } = renderHook(() => useWorkflowState());

      // Navigate to purpose step
      act(() => {
        result.current.selectRoom('kitchen');
        result.current.nextStep();
        result.current.selectItemType('appliance');
        result.current.nextStep();
        result.current.selectSpecificItem('Fridge');
        result.current.nextStep();
      });

      expect(result.current.state.currentStep).toBe('purpose-selection');
      expect(result.current.canGoNext).toBe(false);
    });

    it('should return true when purpose is selected', () => {
      const { result } = renderHook(() => useWorkflowState());

      // Navigate to purpose step and select
      act(() => {
        result.current.selectRoom('kitchen');
        result.current.nextStep();
        result.current.selectItemType('appliance');
        result.current.nextStep();
        result.current.selectSpecificItem('Fridge');
        result.current.nextStep();
        result.current.selectPurpose('how-to-use');
      });

      expect(result.current.canGoNext).toBe(true);
    });
  });

  describe('Step Transitions', () => {
    it('should transition from specific-item-selection to purpose-selection', () => {
      expect(STEP_TRANSITIONS['specific-item-selection']).toContain('purpose-selection');
    });

    it('should transition from purpose-selection to content-type-selection', () => {
      expect(STEP_TRANSITIONS['purpose-selection']).toContain('content-type-selection');
    });

    it('should not include content-source-selection in main flow', () => {
      // Verify specific-item-selection no longer goes to content-source-selection
      expect(STEP_TRANSITIONS['specific-item-selection']).not.toContain('content-source-selection');
    });
  });

  describe('getNextStep', () => {
    it('should return purpose-selection after specific-item-selection', () => {
      const state = {
        currentStep: 'specific-item-selection',
        currentItem: { specificItem: 'Fridge' },
      } as any;

      expect(getNextStep('specific-item-selection', state)).toBe('purpose-selection');
    });

    it('should return content-type-selection after purpose-selection', () => {
      const state = {
        currentStep: 'purpose-selection',
        currentItem: { purpose: 'how-to-clean' },
      } as any;

      expect(getNextStep('purpose-selection', state)).toBe('content-type-selection');
    });
  });

  describe('Full Flow Integration', () => {
    it('should complete full workflow with purpose step', () => {
      const { result } = renderHook(() => useWorkflowState());

      // Room -> Item Type -> Specific Item -> Purpose -> Content Type
      act(() => {
        result.current.selectRoom('kitchen');
        result.current.nextStep();
      });
      expect(result.current.state.currentStep).toBe('item-type-selection');

      act(() => {
        result.current.selectItemType('appliance');
        result.current.nextStep();
      });
      expect(result.current.state.currentStep).toBe('specific-item-selection');

      act(() => {
        result.current.selectSpecificItem('Dishwasher');
        result.current.nextStep();
      });
      expect(result.current.state.currentStep).toBe('purpose-selection');

      act(() => {
        result.current.selectPurpose('maintenance');
        result.current.nextStep();
      });
      expect(result.current.state.currentStep).toBe('content-type-selection');

      // Verify auto-generated title
      expect(result.current.state.currentItem?.itemName).toBe('Maintenance - Dishwasher');
    });
  });
});
```

---

## Integration Points

### With PurposeStep Component (REQ-157)

The `selectPurpose` action returned by `useWorkflowState` will be passed to the `PurposeStep` component:

```typescript
// In ItemCreationWorkflow.tsx:
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

### With Title Generator (REQ-155)

The `SELECT_PURPOSE` reducer case imports and calls `generateArticleTitle()`:

```typescript
import { generateArticleTitle } from '../utils/titleGenerator';

// In reducer:
const articleTitle = generateArticleTitle({
  specificItem: state.currentItem.specificItem,
  purpose: purpose,
});
```

---

## Backwards Compatibility

### Session Storage Recovery

Existing saved sessions may have `content-source-selection` as their current step. The state machine maintains this step in `STEP_TRANSITIONS` for backwards compatibility:

```typescript
'content-source-selection': ['content-type-selection'],  // KEEP: For session recovery
```

### Null Purpose Handling

Items created before this change won't have a `purpose` field. The reducer and components handle `null` purpose gracefully:

```typescript
purpose: state.currentItem?.purpose ?? null
```

---

## Testing Checklist

- [ ] Unit tests pass for `SELECT_PURPOSE` action
- [ ] Unit tests pass for `canGoNext` with purpose step
- [ ] Unit tests pass for step transitions
- [ ] Unit tests pass for `getNextStep()` function
- [ ] Integration test for full workflow completes successfully
- [ ] Session recovery works with old sessions (backwards compat)
- [ ] Title auto-generation produces correct format
- [ ] Build passes without TypeScript errors

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing sessions | Medium | High | Keep `content-source-selection` in transitions for recovery |
| Title generator not ready | Low | High | REQ-155 must complete before this task |
| Type definition mismatches | Low | Medium | Run TypeScript checks after each change |
| Test coverage gaps | Medium | Medium | Write tests before implementation |

---

## Estimated Effort

| Task | Complexity | Estimate |
|------|------------|----------|
| Update type definitions | Low | 15 min |
| Update constants | Low | 15 min |
| Update STEP_TRANSITIONS | Medium | 30 min |
| Add SELECT_PURPOSE case | Medium | 45 min |
| Update getNextStep() | Low | 20 min |
| Update canGoNext | Low | 15 min |
| Add selectPurpose to hook | Low | 15 min |
| Write unit tests | High | 1-2 hours |
| Integration testing | Medium | 30 min |
| **Total** | | **3-4 hours** |

---

## References

- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- Current State Machine: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- Type Definitions: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- Constants: `/src/components/ItemCreationWorkflow/utils/constants.ts`
- Request Entry: `/docs/gen_requests.md` (REQ-156)
