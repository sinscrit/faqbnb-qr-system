# REQ-156: Update State Machine - Detailed Task Breakdown

**Generated:** 2026-01-09 22:15:00 UTC
**Last Modified:** 2026-01-09 22:15:00 UTC
**Request ID:** REQ-156
**Phase:** 1 - Foundation
**Task ID:** 1.3
**Title:** Update State Machine
**Overview Document:** `/docs/REQ-156-update-state-machine-overview.md`
**Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document breaks down the state machine update tasks from REQ-156 into granular, actionable tasks suitable for implementation by an AI coding agent or junior developer. Each task is designed to be completed in a few focused hours (≤1 story point).

### Key Objectives
1. Add `SELECT_PURPOSE` reducer case to handle purpose selection
2. Remove `content-source-selection` from the main workflow step flow
3. Update `getNextStep()` function for new workflow transitions
4. Integrate title auto-generation when purpose is selected
5. Add `canGoNext` validation for the purpose step
6. Add comprehensive unit tests for the new reducer cases

### Dependencies
- **REQ-154** (Types and Constants) - Adds `PurposeType` and `PURPOSE_TYPES` - MUST BE COMPLETED FIRST
- **REQ-155** (Title Generator Utility) - Provides `generateArticleTitle()` - MUST BE COMPLETED FIRST

---

## Authorized Files and Functions for Modification

### Primary Files (MODIFY)

| File | Relative Path | Functions to Modify |
|------|---------------|---------------------|
| `useWorkflowState.ts` | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `workflowReducer()`, `getNextStep()`, `STEP_TRANSITIONS`, `createInitialState()`, `useWorkflowState()` |
| `ItemCreationWorkflow.types.ts` | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `WorkflowAction` type union, `WorkflowStep` type union |
| `constants.ts` | `src/components/ItemCreationWorkflow/utils/constants.ts` | `WORKFLOW_STEPS`, `PROGRESS_WEIGHTS` |

### Test Files (CREATE/MODIFY)

| File | Relative Path | Change Type |
|------|---------------|-------------|
| `useWorkflowState.test.ts` | `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` | MODIFY - Add test cases |

### Reference Files (READ-ONLY)

| File | Purpose |
|------|---------|
| `titleGenerator.ts` | Import `generateArticleTitle()` function |
| `ItemCreationWorkflow.tsx` | Reference for integration patterns |
| Existing test file patterns | Reference for test structure |

---

## Task Breakdown

### Task 1: Add `purpose-selection` to WorkflowStep Type
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Add the new `purpose-selection` step to the `WorkflowStep` type union.

#### Steps
1. Read `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
2. Locate the `WorkflowStep` type union (around lines 100-109)
3. Add `'purpose-selection'` after `'specific-item-selection'`
4. Verify TypeScript compilation passes

#### Code Change
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
  | 'purpose-selection'           // NEW: Added
  | 'content-source-selection'    // KEEP: For backwards compatibility
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';
```

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `WorkflowStep` type now includes `'purpose-selection'`

---

### Task 2: Add SELECT_PURPOSE Action to WorkflowAction Type
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Complexity:** Low
**Estimate:** 15 minutes
**Depends On:** REQ-154 (PurposeType must exist)

#### Description
Add the `SELECT_PURPOSE` action type to the `WorkflowAction` discriminated union.

#### Steps
1. Read `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
2. Locate the `WorkflowAction` type union (around lines 321-361)
3. Import `PurposeType` if not already imported (from REQ-154)
4. Add `{ type: 'SELECT_PURPOSE'; payload: PurposeType }` after `SET_ITEM_NAME` action

#### Code Change
```typescript
// Add import at top of file (if not present from REQ-154):
import type { PurposeType } from './ItemCreationWorkflow.types';

// In WorkflowAction union, after SET_ITEM_NAME (around line 331):
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

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `WorkflowAction` type now includes `SELECT_PURPOSE` variant

---

### Task 3: Update WORKFLOW_STEPS Array
**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Update the `WORKFLOW_STEPS` array to include `purpose-selection` and `content-type-selection` in the new order.

#### Steps
1. Read `src/components/ItemCreationWorkflow/utils/constants.ts`
2. Locate `WORKFLOW_STEPS` array (around lines 191-201)
3. Add `'purpose-selection'` after `'specific-item-selection'`
4. Add `'content-type-selection'` after `'purpose-selection'`
5. Keep `'content-source-selection'` removal optional (for backwards compatibility)

#### Code Change
```typescript
// Current (lines 191-201):
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'content-source-selection',
  // 'content-type-selection' - removed as redundant
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

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `WORKFLOW_STEPS` array includes `purpose-selection` in correct position

---

### Task 4: Update PROGRESS_WEIGHTS Constant
**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Recalculate and update `PROGRESS_WEIGHTS` to include the new steps with appropriate progress percentages.

#### Steps
1. Read `src/components/ItemCreationWorkflow/utils/constants.ts`
2. Locate `PROGRESS_WEIGHTS` object (around lines 222-231)
3. Add entry for `'purpose-selection': 50`
4. Add/update entry for `'content-type-selection': 62`
5. Ensure all weights sum logically from 0 to 100

#### Code Change
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

// New (recalculated for 9 steps):
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,
  'item-type-selection': 24,
  'specific-item-selection': 36,
  'purpose-selection': 48,          // NEW
  'content-type-selection': 60,     // ADDED
  'content-creation': 72,
  'preview-save': 84,
  'next-action': 92,
  'session-summary': 100,
};
```

**Note:** If `WorkflowStepConst` type is derived from `WORKFLOW_STEPS`, ensure it's updated to include the new steps. If `content-source-selection` is still in `WORKFLOW_STEPS`, also include it in `PROGRESS_WEIGHTS` for backwards compatibility.

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Progress weights include all steps from `WORKFLOW_STEPS`
- [ ] Progress increments logically through workflow

---

### Task 5: Update STEP_TRANSITIONS Map
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Medium
**Estimate:** 30 minutes

#### Description
Update the `STEP_TRANSITIONS` record to reflect the new workflow order with purpose selection step.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `STEP_TRANSITIONS` constant (around lines 76-86)
3. Update `specific-item-selection` to transition to `purpose-selection`
4. Add new entry for `purpose-selection` transitioning to `content-type-selection`
5. Keep `content-source-selection` entry for backwards compatibility
6. Update `next-action` transitions to use `content-type-selection` instead of `content-source-selection`

#### Code Change
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
  'specific-item-selection': ['purpose-selection'],              // CHANGED: Goes to purpose
  'purpose-selection': ['content-type-selection'],               // NEW: Then to content type
  'content-source-selection': ['content-type-selection'],        // KEEP: For backwards compat
  'content-type-selection': ['content-creation'],
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary', 'content-type-selection'], // CHANGED
  'session-summary': [],
};
```

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `STEP_TRANSITIONS` includes all steps from `WorkflowStep` type
- [ ] `specific-item-selection` → `purpose-selection` transition defined
- [ ] `purpose-selection` → `content-type-selection` transition defined

---

### Task 6: Update getNextStep() Function
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Medium
**Estimate:** 20 minutes

#### Description
Modify the `getNextStep()` function to handle the new purpose selection step in the automatic navigation flow.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `getNextStep()` function (around lines 139-159)
3. Add handling for `specific-item-selection` → `purpose-selection`
4. Add handling for `purpose-selection` → `content-type-selection`

#### Code Change
```typescript
// Current (lines 139-159):
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

  // For steps with single transition, return it
  if (transitions.length === 1) return transitions[0];

  // Multi-transition steps require explicit choice
  return null;
}

// New:
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

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `getNextStep('specific-item-selection', state)` returns `'purpose-selection'`
- [ ] `getNextStep('purpose-selection', state)` returns `'content-type-selection'`

---

### Task 7: Add Imports for Title Generator
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Low
**Estimate:** 10 minutes
**Depends On:** REQ-155 (titleGenerator must exist)

#### Description
Add the import statement for `generateArticleTitle` from the title generator utility.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate import statements at top of file (around lines 44-62)
3. Add import for `generateArticleTitle` from `'../utils/titleGenerator'`
4. Add import for `PurposeType` if not already imported

#### Code Change
```typescript
// Add after existing imports (around line 62):
import { generateArticleTitle } from '../utils/titleGenerator';
import type { PurposeType } from '../ItemCreationWorkflow.types';
```

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Import resolves correctly to titleGenerator module

---

### Task 8: Add SELECT_PURPOSE Reducer Case
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Medium
**Estimate:** 45 minutes

#### Description
Implement the `SELECT_PURPOSE` case in the `workflowReducer` function that handles purpose selection and triggers article title auto-generation.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `workflowReducer` function (around line 169)
3. Find the Selection Actions section (after line 240)
4. Add new case for `SELECT_PURPOSE` after `SET_ITEM_NAME` case (around line 317)
5. Implement purpose selection and title auto-generation logic

#### Code Change
```typescript
// Add after SET_ITEM_NAME case (around line 317):
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

**Note:** This requires that `CurrentItemState` interface has a `purpose` field added (from REQ-154).

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Reducer handles `SELECT_PURPOSE` action correctly
- [ ] Title is auto-generated when purpose is selected
- [ ] State `isDirty` is set to `true` after selection

---

### Task 9: Update CurrentItemState Initialization in SELECT_ROOM
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Low
**Estimate:** 15 minutes
**Depends On:** REQ-154 (purpose field must exist in CurrentItemState)

#### Description
Update the `SELECT_ROOM` case to initialize the `purpose` field as `null`.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `SELECT_ROOM` case in reducer (around lines 242-263)
3. Add `purpose: null` to the `newItem` object initialization

#### Code Change
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
  // ... rest of case unchanged
}
```

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] New items initialize with `purpose: null`

---

### Task 10: Update ADD_MORE_TO_ITEM Action for New Step Flow
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Update the `ADD_MORE_TO_ITEM` case to navigate to `content-type-selection` instead of `content-source-selection`.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `ADD_MORE_TO_ITEM` case (around lines 479-495)
3. Change `currentStep` from `'content-source-selection'` to `'content-type-selection'`

#### Code Change
```typescript
// Current (lines 479-495):
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-source-selection',  // OLD
    stepHistory: newHistory,
    canGoBack: true,
    currentItem: restoredItem,
    isDirty: true,
    session: {
      ...state.session,
      currentStep: 'content-source-selection',  // OLD
      currentItem: restoredItem,
    },
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
      currentStep: 'content-type-selection',  // NEW
      currentItem: restoredItem,
    },
  };
}
```

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `ADD_MORE_TO_ITEM` navigates to `content-type-selection`

---

### Task 11: Update canGoNext Computed Value for Purpose Step
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Add validation logic for the `purpose-selection` step in the `canGoNext` computed value.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `canGoNext` useMemo (around lines 801-826)
3. Add case for `'purpose-selection'` that checks if purpose is selected

#### Code Change
```typescript
// Current canGoNext useMemo (lines 801-826):
const canGoNext = useMemo(() => {
  if (state.currentStep === 'session-summary') return false;

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
      return true;
    case 'next-action':
      return true;
    default:
      return false;
  }
}, [state.currentStep, state.currentItem]);

// New (add purpose-selection case):
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

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `canGoNext` returns `false` when on purpose step with no purpose selected
- [ ] `canGoNext` returns `true` when purpose is selected

---

### Task 12: Add selectPurpose to UseWorkflowStateReturn Interface
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Low
**Estimate:** 10 minutes
**Depends On:** REQ-154 (PurposeType must exist)

#### Description
Add the `selectPurpose` action function type to the hook's return interface.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate `UseWorkflowStateReturn` interface (around lines 590-666)
3. Add `selectPurpose` property to interface after `setItemName`

#### Code Change
```typescript
// Add to UseWorkflowStateReturn interface (around line 612):
export interface UseWorkflowStateReturn {
  // ... existing properties ...

  // Selection actions
  /** Select a room for the current item */
  selectRoom: (room: RoomType) => void;
  /** Select an item type for the current item */
  selectItemType: (itemType: ItemType) => void;
  /** Select a specific item (from suggestions or custom) */
  selectSpecificItem: (item: string) => void;
  /** Set a custom item name (overrides auto-generated) */
  setItemName: (name: string) => void;
  /** Select a purpose for the current item (triggers title auto-generation) */
  selectPurpose: (purpose: PurposeType) => void;  // NEW

  // ... rest of properties ...
}
```

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Interface includes `selectPurpose` property

---

### Task 13: Implement selectPurpose Action Function
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Add the `selectPurpose` callback function in the hook body and export it in the return object.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Locate Selection Actions section in hook body (around lines 705-719)
3. Add `selectPurpose` useCallback after `setItemName`
4. Add `selectPurpose` to the return object

#### Code Change
```typescript
// Add after setItemName (around line 719):
const selectPurpose = useCallback((purpose: PurposeType) => {
  dispatch({ type: 'SELECT_PURPOSE', payload: purpose });
}, []);

// Add to return object (around line 846):
return {
  state,
  goToStep,
  nextStep,
  prevStep,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  setItemName,
  selectPurpose,           // NEW
  selectContentSource,
  selectContentType,
  // ... rest of returns ...
};
```

#### Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] `selectPurpose` function is exported from hook
- [ ] Calling `selectPurpose('how-to-clean')` dispatches correct action

---

### Task 14: Add Unit Tests for SELECT_PURPOSE Action
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Complexity:** Medium
**Estimate:** 45 minutes

#### Description
Add comprehensive unit tests for the `SELECT_PURPOSE` reducer case.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
2. Add new describe block for `SELECT_PURPOSE` tests after existing Selection tests
3. Test that purpose is set on current item
4. Test that article title is auto-generated
5. Test that state is marked as dirty

#### Code Change
```typescript
// Add after SELECT_SPECIFIC_ITEM tests (around line 454):

describe('SELECT_PURPOSE', () => {
  it('sets purpose on current item', () => {
    let state = workflowReducer(createInitialState(), {
      type: 'SELECT_ROOM',
      payload: 'kitchen',
    });
    state = workflowReducer(state, {
      type: 'SELECT_SPECIFIC_ITEM',
      payload: 'Fridge',
    });

    const newState = workflowReducer(state, {
      type: 'SELECT_PURPOSE',
      payload: 'how-to-clean',
    });

    expect(newState.currentItem?.purpose).toBe('how-to-clean');
  });

  it('auto-generates article title when purpose is selected', () => {
    let state = workflowReducer(createInitialState(), {
      type: 'SELECT_ROOM',
      payload: 'kitchen',
    });
    state = workflowReducer(state, {
      type: 'SELECT_SPECIFIC_ITEM',
      payload: 'Fridge',
    });

    const newState = workflowReducer(state, {
      type: 'SELECT_PURPOSE',
      payload: 'how-to-clean',
    });

    expect(newState.currentItem?.itemName).toBe('How to Clean - Fridge');
  });

  it('marks state as dirty when purpose is selected', () => {
    let state = workflowReducer(createInitialState(), {
      type: 'SELECT_ROOM',
      payload: 'kitchen',
    });
    state = workflowReducer(state, {
      type: 'SELECT_SPECIFIC_ITEM',
      payload: 'Fridge',
    });
    // Reset isDirty for clean test
    state = { ...state, isDirty: false };

    const newState = workflowReducer(state, {
      type: 'SELECT_PURPOSE',
      payload: 'troubleshooting',
    });

    expect(newState.isDirty).toBe(true);
  });

  it('returns unchanged state when currentItem is null', () => {
    const state = createInitialState();

    const newState = workflowReducer(state, {
      type: 'SELECT_PURPOSE',
      payload: 'how-to-use',
    });

    expect(newState).toBe(state);
  });

  it('syncs purpose to session.currentItem', () => {
    let state = workflowReducer(createInitialState(), {
      type: 'SELECT_ROOM',
      payload: 'kitchen',
    });
    state = workflowReducer(state, {
      type: 'SELECT_SPECIFIC_ITEM',
      payload: 'Dishwasher',
    });

    const newState = workflowReducer(state, {
      type: 'SELECT_PURPOSE',
      payload: 'maintenance',
    });

    expect(newState.session.currentItem?.purpose).toBe('maintenance');
  });
});
```

#### Verification
- [ ] Run `npm test -- useWorkflowState.test.ts` - all tests pass
- [ ] Tests cover purpose selection, title generation, dirty state
- [ ] Tests verify null currentItem handling

---

### Task 15: Add Unit Tests for canGoNext with Purpose Step
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Complexity:** Medium
**Estimate:** 30 minutes

#### Description
Add tests to verify `canGoNext` behavior for the purpose-selection step.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
2. This requires testing the hook with React Testing Library
3. If hook tests don't exist, add integration-style tests for canGoNext

#### Code Change
```typescript
// Add new describe block for canGoNext with purpose step:

describe('canGoNext for purpose-selection step', () => {
  it('validates purpose is required on purpose-selection step', () => {
    // Create state at purpose-selection step without purpose
    const state: WorkflowState = {
      ...createInitialState(),
      currentStep: 'purpose-selection',
      currentItem: {
        room: 'kitchen',
        itemType: 'appliance',
        specificItem: 'Fridge',
        itemName: 'Kitchen - Fridge',
        purpose: null,  // No purpose selected
        contentSource: 'existing',
        contentType: null,
        content: [],
      },
    };

    // canGoNext should be false
    expect(state.currentItem?.purpose).toBeNull();
  });

  it('allows proceeding when purpose is selected', () => {
    const state: WorkflowState = {
      ...createInitialState(),
      currentStep: 'purpose-selection',
      currentItem: {
        room: 'kitchen',
        itemType: 'appliance',
        specificItem: 'Fridge',
        itemName: 'How to Clean - Fridge',
        purpose: 'how-to-clean',  // Purpose selected
        contentSource: 'existing',
        contentType: null,
        content: [],
      },
    };

    expect(state.currentItem?.purpose).toBe('how-to-clean');
  });
});
```

#### Verification
- [ ] Run `npm test -- useWorkflowState.test.ts` - all tests pass
- [ ] Tests cover canGoNext = false when no purpose
- [ ] Tests cover canGoNext = true when purpose selected

---

### Task 16: Add Unit Tests for Step Transitions
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Complexity:** Medium
**Estimate:** 30 minutes

#### Description
Update existing step transition tests to verify the new workflow order.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
2. Locate `STEP_TRANSITIONS` tests (around lines 140-168)
3. Update test to verify `purpose-selection` step exists
4. Add tests for new transitions

#### Code Change
```typescript
// Update existing STEP_TRANSITIONS tests:

describe('STEP_TRANSITIONS', () => {
  it('covers all 10 workflow steps', () => {  // Updated count
    const steps = Object.keys(STEP_TRANSITIONS);
    expect(steps).toHaveLength(10);  // Updated from 9
    expect(steps).toContain('room-selection');
    expect(steps).toContain('item-type-selection');
    expect(steps).toContain('specific-item-selection');
    expect(steps).toContain('purpose-selection');        // NEW
    expect(steps).toContain('content-source-selection');
    expect(steps).toContain('content-type-selection');
    expect(steps).toContain('content-creation');
    expect(steps).toContain('preview-save');
    expect(steps).toContain('next-action');
    expect(steps).toContain('session-summary');
  });

  it('specific-item-selection transitions to purpose-selection', () => {
    expect(STEP_TRANSITIONS['specific-item-selection']).toContain('purpose-selection');
  });

  it('purpose-selection transitions to content-type-selection', () => {
    expect(STEP_TRANSITIONS['purpose-selection']).toContain('content-type-selection');
  });

  it('specific-item-selection no longer goes directly to content-source-selection', () => {
    expect(STEP_TRANSITIONS['specific-item-selection']).not.toContain('content-source-selection');
  });

  // ... existing tests ...
});
```

#### Verification
- [ ] Run `npm test -- useWorkflowState.test.ts` - all tests pass
- [ ] Step transition tests updated for new workflow

---

### Task 17: Add Unit Tests for getNextStep Function
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Complexity:** Low
**Estimate:** 20 minutes

#### Description
Update `getNextStep` tests to verify new step transitions.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
2. Locate `getNextStep` tests (around lines 98-134)
3. Update test for `specific-item-selection` to return `purpose-selection`
4. Add test for `purpose-selection` returning `content-type-selection`

#### Code Change
```typescript
// Update existing getNextStep tests (around line 128):

describe('getNextStep', () => {
  // ... existing tests ...

  it('returns purpose-selection after specific-item-selection', () => {
    const state = createInitialState();
    expect(getNextStep('specific-item-selection', state)).toBe('purpose-selection');
  });

  it('returns content-type-selection after purpose-selection', () => {
    const state = createInitialState();
    expect(getNextStep('purpose-selection', state)).toBe('content-type-selection');
  });

  // Update existing test:
  it('returns single transition for single-transition steps', () => {
    const state = createInitialState();
    expect(getNextStep('item-type-selection', state)).toBe('specific-item-selection');
    expect(getNextStep('specific-item-selection', state)).toBe('purpose-selection');  // UPDATED
    expect(getNextStep('purpose-selection', state)).toBe('content-type-selection');   // NEW
    expect(getNextStep('content-type-selection', state)).toBe('content-creation');
    expect(getNextStep('content-creation', state)).toBe('preview-save');
    expect(getNextStep('preview-save', state)).toBe('next-action');
  });
});
```

#### Verification
- [ ] Run `npm test -- useWorkflowState.test.ts` - all tests pass
- [ ] getNextStep tests verify new step transitions

---

### Task 18: Add Full Flow Integration Test
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
**Complexity:** Medium
**Estimate:** 30 minutes

#### Description
Add an integration test that verifies the complete workflow flow including the new purpose step.

#### Steps
1. Read `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
2. Add new describe block for full flow integration tests
3. Test complete navigation through all steps

#### Code Change
```typescript
// Add new describe block at end of file:

describe('workflowReducer - Full Flow Integration', () => {
  it('completes full workflow with purpose step', () => {
    let state = createInitialState();

    // Room selection
    state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });
    expect(state.currentItem?.room).toBe('kitchen');

    // Navigate to item-type
    state = workflowReducer(state, { type: 'NEXT_STEP' });
    expect(state.currentStep).toBe('item-type-selection');

    // Select item type
    state = workflowReducer(state, { type: 'SELECT_ITEM_TYPE', payload: 'appliance' });
    expect(state.currentItem?.itemType).toBe('appliance');

    // Navigate to specific-item
    state = workflowReducer(state, { type: 'NEXT_STEP' });
    expect(state.currentStep).toBe('specific-item-selection');

    // Select specific item
    state = workflowReducer(state, { type: 'SELECT_SPECIFIC_ITEM', payload: 'Dishwasher' });
    expect(state.currentItem?.specificItem).toBe('Dishwasher');

    // Navigate to purpose-selection (NEW)
    state = workflowReducer(state, { type: 'NEXT_STEP' });
    expect(state.currentStep).toBe('purpose-selection');

    // Select purpose
    state = workflowReducer(state, { type: 'SELECT_PURPOSE', payload: 'maintenance' });
    expect(state.currentItem?.purpose).toBe('maintenance');
    expect(state.currentItem?.itemName).toBe('Maintenance - Dishwasher');

    // Navigate to content-type-selection
    state = workflowReducer(state, { type: 'NEXT_STEP' });
    expect(state.currentStep).toBe('content-type-selection');

    // Verify history includes purpose-selection
    expect(state.stepHistory).toContain('purpose-selection');
  });

  it('allows back navigation from purpose-selection', () => {
    let state = createInitialState();

    // Navigate to purpose-selection step
    state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });
    state = workflowReducer(state, { type: 'NEXT_STEP' });
    state = workflowReducer(state, { type: 'SELECT_ITEM_TYPE', payload: 'appliance' });
    state = workflowReducer(state, { type: 'NEXT_STEP' });
    state = workflowReducer(state, { type: 'SELECT_SPECIFIC_ITEM', payload: 'Oven' });
    state = workflowReducer(state, { type: 'NEXT_STEP' });

    expect(state.currentStep).toBe('purpose-selection');
    expect(state.canGoBack).toBe(true);

    // Go back
    state = workflowReducer(state, { type: 'PREV_STEP' });
    expect(state.currentStep).toBe('specific-item-selection');
  });
});
```

#### Verification
- [ ] Run `npm test -- useWorkflowState.test.ts` - all tests pass
- [ ] Integration test verifies complete flow with purpose step
- [ ] Back navigation works correctly from purpose step

---

### Task 19: Run Build and Type Check
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Verify all changes compile without TypeScript errors and the build passes.

#### Steps
1. Run `npm run type-check` to verify TypeScript
2. Run `npm run build` to verify production build
3. Fix any errors that arise

#### Commands
```bash
npm run type-check
npm run build
```

#### Verification
- [ ] `npm run type-check` exits with code 0
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors in modified files

---

### Task 20: Run All Tests and Verify
**Complexity:** Low
**Estimate:** 15 minutes

#### Description
Run the complete test suite to ensure no regressions.

#### Steps
1. Run all tests with `npm test`
2. Run specific workflow tests with `npm test -- useWorkflowState`
3. Fix any failing tests

#### Commands
```bash
npm test
npm test -- useWorkflowState
```

#### Verification
- [ ] All existing tests continue to pass
- [ ] All new tests for SELECT_PURPOSE pass
- [ ] All step transition tests pass
- [ ] Integration tests pass

---

## Task Summary Table

| Task # | Description | File | Complexity | Estimate | Dependencies |
|--------|-------------|------|------------|----------|--------------|
| 1 | Add `purpose-selection` to WorkflowStep | types.ts | Low | 15 min | - |
| 2 | Add SELECT_PURPOSE to WorkflowAction | types.ts | Low | 15 min | REQ-154 |
| 3 | Update WORKFLOW_STEPS array | constants.ts | Low | 15 min | Task 1 |
| 4 | Update PROGRESS_WEIGHTS | constants.ts | Low | 15 min | Task 3 |
| 5 | Update STEP_TRANSITIONS | useWorkflowState.ts | Medium | 30 min | Task 1 |
| 6 | Update getNextStep() | useWorkflowState.ts | Medium | 20 min | Task 5 |
| 7 | Add imports for title generator | useWorkflowState.ts | Low | 10 min | REQ-155 |
| 8 | Add SELECT_PURPOSE reducer case | useWorkflowState.ts | Medium | 45 min | Tasks 2, 7, REQ-154 |
| 9 | Update SELECT_ROOM initialization | useWorkflowState.ts | Low | 15 min | REQ-154 |
| 10 | Update ADD_MORE_TO_ITEM action | useWorkflowState.ts | Low | 15 min | Task 5 |
| 11 | Update canGoNext for purpose step | useWorkflowState.ts | Low | 15 min | Task 8, REQ-154 |
| 12 | Add selectPurpose to interface | useWorkflowState.ts | Low | 10 min | REQ-154 |
| 13 | Implement selectPurpose function | useWorkflowState.ts | Low | 15 min | Task 12 |
| 14 | Add tests for SELECT_PURPOSE | test.ts | Medium | 45 min | Task 8 |
| 15 | Add tests for canGoNext purpose | test.ts | Medium | 30 min | Task 11 |
| 16 | Update step transition tests | test.ts | Medium | 30 min | Task 5 |
| 17 | Update getNextStep tests | test.ts | Low | 20 min | Task 6 |
| 18 | Add full flow integration test | test.ts | Medium | 30 min | All tasks |
| 19 | Run build and type check | - | Low | 15 min | All tasks |
| 20 | Run all tests and verify | - | Low | 15 min | All tasks |

**Total Estimated Time:** ~7 hours (approximately 1 day of focused work)

---

## Testing Checklist

### Unit Tests
- [ ] SELECT_PURPOSE action sets purpose on currentItem
- [ ] SELECT_PURPOSE auto-generates article title
- [ ] SELECT_PURPOSE marks state as dirty
- [ ] SELECT_PURPOSE syncs to session.currentItem
- [ ] SELECT_PURPOSE returns unchanged state when currentItem is null
- [ ] canGoNext returns false on purpose-selection without purpose
- [ ] canGoNext returns true on purpose-selection with purpose
- [ ] STEP_TRANSITIONS includes all 10 steps
- [ ] specific-item-selection → purpose-selection transition exists
- [ ] purpose-selection → content-type-selection transition exists
- [ ] getNextStep returns correct steps for new flow

### Integration Tests
- [ ] Full workflow flow completes with purpose step
- [ ] Back navigation works from purpose-selection
- [ ] Step history correctly tracks purpose-selection
- [ ] Session recovery works with old sessions (backwards compat)

### Build Verification
- [ ] TypeScript compilation passes
- [ ] Production build succeeds
- [ ] No console warnings in development

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing sessions | Medium | High | Keep `content-source-selection` in transitions for recovery |
| Title generator not ready | Low | High | REQ-155 must complete before Tasks 7-8 |
| Type definition mismatches | Low | Medium | Run TypeScript checks after each change |
| Test coverage gaps | Medium | Medium | Write tests before implementation (TDD approach) |

---

## References

- **Overview Document:** `/docs/REQ-156-update-state-machine-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Request Entry:** `/docs/gen_requests.md` (REQ-156)
- **Current State Machine:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Type Definitions:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Constants:** `src/components/ItemCreationWorkflow/utils/constants.ts`
- **Existing Tests:** `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
