# REQ-094: Workflow State Machine - Implementation Overview

**Generated:** 2026-01-05 15:30:00 UTC
**Last Modified:** 2026-01-05 15:30:00 UTC
**Request Reference:** REQ-094 in docs/gen_requests.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md
**Phase:** 1 - Foundation & Core Infrastructure
**Task ID:** 1.2

---

## Summary

This document provides an implementation breakdown for the `useWorkflowState` hook - the core state machine that controls multi-step workflow progression for the ItemCreationWorkflow component. The hook manages step navigation (forward, back, jump), step history for reliable back navigation, and conditional step skipping logic (e.g., when "General" room is selected, item type selection is bypassed).

---

## Related Request

**REQ-094: Workflow State Management with Step Navigation**

- **Type:** NEW FEATURE
- **Size:** M
- **Date:** 2026-01-05

### Key Requirements (from gen_requests.md)
- Users can progress forward through workflow steps in the correct sequence
- Users can navigate backward to any previously visited step without data loss
- When applicable conditions are met, irrelevant steps are automatically skipped
- Navigation history accurately reflects the actual path taken through the workflow
- All state transitions follow predictable patterns that handle edge cases gracefully
- The state management solution can be reused across different workflow types

---

## Technical Context

### Existing Patterns to Follow

The implementation must follow established patterns from the codebase:

| Pattern | Location | Key Elements to Adopt |
|---------|----------|----------------------|
| Wizard State Machine | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer pattern, step transitions map, step history array, action types with discriminated unions |
| Core State Hook | `src/components/ItemManager/hooks/useItemManagerState.ts` | createInitialState factory, useReducer initialization, useCallback wrapped actions, useMemo computed values |
| Type Definitions | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Already defines `WorkflowState`, `WorkflowAction`, `WorkflowStep` |
| Constants | `src/components/ItemCreationWorkflow/utils/constants.ts` | Already defines `WORKFLOW_STEPS`, `PROGRESS_WEIGHTS` |

### Existing Type Definitions (from Task 1.1)

The types file already contains the foundational types we'll use:

```typescript
// From ItemCreationWorkflow.types.ts

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

export interface WorkflowState {
  currentStep: WorkflowStep;
  stepHistory: WorkflowStep[];
  canGoBack: boolean;
  session: WorkflowSession;
  currentItem: CurrentItemState | null;
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  submitError: string | null;
}

export type WorkflowAction =
  | { type: 'GO_TO_STEP'; payload: WorkflowStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  // ... other actions already defined
```

---

## Architecture

### Step Transition Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOW STEP FLOW                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  room-selection ─────────────────────────────────────────────┐               │
│        │                                                      │               │
│        ├─── If room === 'general' ────────────────────────────┼──────────┐   │
│        │    (skip item-type-selection)                        │          │   │
│        │                                                      │          │   │
│        v                                                      │          │   │
│  item-type-selection                                          │          │   │
│        │                                                      │          │   │
│        v                                                      │          │   │
│  specific-item-selection <────────────────────────────────────┘          │   │
│        │                              (from general room)                │   │
│        v                                                                 │   │
│  content-source-selection                                                │   │
│        │                                                                 │   │
│        v                                                                 │   │
│  content-type-selection                                                  │   │
│        │                                                                 │   │
│        v                                                                 │   │
│  content-creation (delegates to ItemCapture)                             │   │
│        │                                                                 │   │
│        v                                                                 │   │
│  preview-save                                                            │   │
│        │                                                                 │   │
│        v                                                                 │   │
│  next-action ─────────────────────────────────────────────────────────────┘  │
│        │    (loop back to room-selection for "Tag New Item")                 │
│        │                                                                     │
│        └─── "I'm Done" ───v                                                  │
│                           │                                                  │
│                    session-summary                                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### State Machine Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     useWorkflowState Hook                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐    ┌────────────────────┐               │
│  │  Step Transitions  │    │   Initial State    │               │
│  ├────────────────────┤    ├────────────────────┤               │
│  │ STEP_TRANSITIONS   │    │ createInitialState │               │
│  │ getNextStep()      │    │ v1.0               │               │
│  │ shouldSkipStep()   │    └────────────────────┘               │
│  └────────────────────┘                                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Reducer                                │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Navigation: GO_TO_STEP, NEXT_STEP, PREV_STEP               │ │
│  │ Selection: SELECT_ROOM, SELECT_ITEM_TYPE, etc.             │ │
│  │ Content: ADD_CONTENT_PIECE, REMOVE_CONTENT_PIECE, etc.     │ │
│  │ Session: SAVE_ITEM, START_NEW_ITEM, COMPLETE_SESSION       │ │
│  │ Errors: SET_ERROR, CLEAR_ERROR, CLEAR_ALL_ERRORS           │ │
│  │ Reset: RESET                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────┐    ┌────────────────────┐               │
│  │ Computed Values    │    │  Action Callbacks  │               │
│  ├────────────────────┤    ├────────────────────┤               │
│  │ canGoNext          │    │ goToStep()         │               │
│  │ canGoBack          │    │ nextStep()         │               │
│  │ progressPercent    │    │ prevStep()         │               │
│  │ currentStepIndex   │    │ selectRoom()       │               │
│  │ totalSteps         │    │ selectItemType()   │               │
│  └────────────────────┘    │ ... etc            │               │
│                            └────────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Task 1.2.1: Define Step Transitions Map

**Description:** Create a mapping of valid step transitions, including conditional transitions.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts:33-44`

**Implementation:**

```typescript
/**
 * Valid transitions from each step.
 * Used to validate GO_TO_STEP actions and determine NEXT_STEP targets.
 */
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'], // conditional
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['content-source-selection'],
  'content-source-selection': ['content-type-selection'],
  'content-type-selection': ['content-creation'],
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary'], // conditional
  'session-summary': [], // terminal
};
```

**Acceptance Criteria:**
- [ ] All step transitions are defined
- [ ] Conditional transitions documented with comments
- [ ] Export from hook file

---

### Task 1.2.2: Implement createInitialState Factory

**Description:** Create factory function that generates fresh initial state for the reducer.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts:54-72`

**Implementation:**

```typescript
/**
 * Factory function to create fresh initial state.
 * Used by reducer RESET action and hook initialization.
 */
export const createInitialState = (): WorkflowState => ({
  currentStep: 'room-selection',
  stepHistory: [],
  canGoBack: false,
  session: {
    id: crypto.randomUUID(),
    startedAt: new Date(),
    currentStep: 'room-selection',
    items: [],
    currentItem: null,
  },
  currentItem: null,
  isSubmitting: false,
  isDirty: false,
  errors: {},
  submitError: null,
});
```

**Acceptance Criteria:**
- [ ] Function generates unique session ID
- [ ] All state fields initialized correctly
- [ ] Function is exported for testing

---

### Task 1.2.3: Implement Step Skipping Logic

**Description:** Create helper functions to determine when steps should be skipped.

**Implementation:**

```typescript
/**
 * Determines if item-type-selection step should be skipped.
 * "General" room category implies "general-info" item type.
 */
export function shouldSkipItemType(state: WorkflowState): boolean {
  return state.currentItem?.room === 'general';
}

/**
 * Gets the next step, accounting for skip conditions.
 * Returns null if no automatic next step exists.
 */
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

  return null; // Caller must specify for multi-transition steps
}
```

**Acceptance Criteria:**
- [ ] "General" room skips item-type-selection
- [ ] Other rooms proceed to item-type-selection
- [ ] Skip logic is testable in isolation

---

### Task 1.2.4: Implement Navigation Actions in Reducer

**Description:** Implement GO_TO_STEP, NEXT_STEP, and PREV_STEP actions with history management.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts:160-213`

**Implementation:**

```typescript
// Within workflowReducer function:

case 'GO_TO_STEP': {
  const validTransitions = STEP_TRANSITIONS[state.currentStep];
  // Allow going to any previous step (for editing)
  const isBackNavigation = state.stepHistory.includes(action.payload);
  // Validate forward transition
  if (!isBackNavigation && !validTransitions?.includes(action.payload)) {
    console.warn(`Invalid step transition: ${state.currentStep} -> ${action.payload}`);
    return state;
  }
  return {
    ...state,
    currentStep: action.payload,
    stepHistory: isBackNavigation
      ? state.stepHistory.slice(0, state.stepHistory.indexOf(action.payload))
      : [...state.stepHistory, state.currentStep],
    canGoBack: true,
  };
}

case 'NEXT_STEP': {
  const nextStep = getNextStep(state.currentStep, state);
  if (!nextStep) {
    console.warn(`No automatic next step from: ${state.currentStep}`);
    return state;
  }
  return {
    ...state,
    currentStep: nextStep,
    stepHistory: [...state.stepHistory, state.currentStep],
    canGoBack: true,
    errors: {}, // Clear errors on successful navigation
  };
}

case 'PREV_STEP': {
  if (state.stepHistory.length === 0) {
    return state;
  }
  const previousStep = state.stepHistory[state.stepHistory.length - 1];
  return {
    ...state,
    currentStep: previousStep,
    stepHistory: state.stepHistory.slice(0, -1),
    canGoBack: state.stepHistory.length > 1,
  };
}
```

**Acceptance Criteria:**
- [ ] GO_TO_STEP validates transitions
- [ ] GO_TO_STEP handles back navigation correctly
- [ ] NEXT_STEP uses getNextStep helper
- [ ] PREV_STEP pops from history correctly
- [ ] canGoBack computed correctly

---

### Task 1.2.5: Implement Selection Actions in Reducer

**Description:** Implement SELECT_ROOM, SELECT_ITEM_TYPE, SELECT_SPECIFIC_ITEM, SET_ITEM_NAME actions.

**Implementation:**

```typescript
case 'SELECT_ROOM': {
  const itemType = action.payload === 'general' ? 'general-info' : null;
  return {
    ...state,
    currentItem: {
      room: action.payload,
      itemType: itemType as ItemType,
      specificItem: '',
      itemName: '',
      contentSource: 'existing',
      contentType: null,
      content: [],
    },
    isDirty: true,
  };
}

case 'SELECT_ITEM_TYPE': {
  if (!state.currentItem) return state;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      itemType: action.payload,
    },
    isDirty: true,
  };
}

case 'SELECT_SPECIFIC_ITEM': {
  if (!state.currentItem) return state;
  // Auto-generate name: "Room - Item"
  const roomLabel = ROOM_LABELS[state.currentItem.room] || state.currentItem.room;
  const autoName = `${roomLabel} - ${action.payload}`;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      specificItem: action.payload,
      itemName: autoName,
    },
    isDirty: true,
  };
}

case 'SET_ITEM_NAME': {
  if (!state.currentItem) return state;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      itemName: action.payload,
    },
    isDirty: true,
  };
}
```

**Acceptance Criteria:**
- [ ] SELECT_ROOM initializes currentItem
- [ ] "General" room auto-sets itemType to 'general-info'
- [ ] SELECT_SPECIFIC_ITEM auto-generates itemName
- [ ] SET_ITEM_NAME allows custom name override

---

### Task 1.2.6: Implement Content Actions in Reducer

**Description:** Implement SELECT_CONTENT_SOURCE, SELECT_CONTENT_TYPE, ADD_CONTENT_PIECE, REMOVE_CONTENT_PIECE, REORDER_CONTENT actions.

**Implementation:**

```typescript
case 'SELECT_CONTENT_SOURCE': {
  if (!state.currentItem) return state;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      contentSource: action.payload,
      contentType: null, // Reset content type when source changes
    },
    isDirty: true,
  };
}

case 'SELECT_CONTENT_TYPE': {
  if (!state.currentItem) return state;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      contentType: action.payload,
    },
    isDirty: true,
  };
}

case 'ADD_CONTENT_PIECE': {
  if (!state.currentItem) return state;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      content: [...state.currentItem.content, action.payload],
    },
    isDirty: true,
  };
}

case 'REMOVE_CONTENT_PIECE': {
  if (!state.currentItem) return state;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      content: state.currentItem.content.filter(c => c.id !== action.payload),
    },
    isDirty: true,
  };
}

case 'REORDER_CONTENT': {
  if (!state.currentItem) return state;
  const { fromIndex, toIndex } = action.payload;
  const content = [...state.currentItem.content];
  const [removed] = content.splice(fromIndex, 1);
  content.splice(toIndex, 0, removed);
  // Update order property
  const reorderedContent = content.map((item, index) => ({ ...item, order: index }));
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      content: reorderedContent,
    },
    isDirty: true,
  };
}
```

**Acceptance Criteria:**
- [ ] SELECT_CONTENT_SOURCE resets contentType
- [ ] ADD_CONTENT_PIECE appends to content array
- [ ] REMOVE_CONTENT_PIECE filters by ID
- [ ] REORDER_CONTENT maintains order property

---

### Task 1.2.7: Implement Session Management Actions

**Description:** Implement SAVE_ITEM, START_NEW_ITEM, COMPLETE_SESSION actions.

**Implementation:**

```typescript
case 'SAVE_ITEM': {
  return {
    ...state,
    session: {
      ...state.session,
      items: [...state.session.items, action.payload],
    },
    currentItem: null,
    isDirty: false,
  };
}

case 'START_NEW_ITEM': {
  return {
    ...state,
    currentStep: 'room-selection',
    stepHistory: [],
    canGoBack: false,
    currentItem: null,
    errors: {},
  };
}

case 'COMPLETE_SESSION': {
  return {
    ...state,
    currentStep: 'session-summary',
    stepHistory: [...state.stepHistory, state.currentStep],
    canGoBack: true,
  };
}
```

**Acceptance Criteria:**
- [ ] SAVE_ITEM adds to session.items and clears currentItem
- [ ] START_NEW_ITEM resets for new item flow
- [ ] COMPLETE_SESSION navigates to session-summary

---

### Task 1.2.8: Implement Error and Reset Actions

**Description:** Implement SET_ERROR, CLEAR_ERROR, CLEAR_ALL_ERRORS, SET_SUBMITTING, SUBMIT_ERROR, RESET actions.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts:316-337`

**Implementation:**

```typescript
case 'SET_ERROR':
  return {
    ...state,
    errors: {
      ...state.errors,
      [action.payload.field]: action.payload.message,
    },
  };

case 'CLEAR_ERROR': {
  const { [action.payload]: _removed, ...remainingErrors } = state.errors;
  return {
    ...state,
    errors: remainingErrors,
  };
}

case 'CLEAR_ALL_ERRORS':
  return {
    ...state,
    errors: {},
    submitError: null,
  };

case 'SET_SUBMITTING':
  return {
    ...state,
    isSubmitting: action.payload,
  };

case 'SUBMIT_ERROR':
  return {
    ...state,
    isSubmitting: false,
    submitError: action.payload,
  };

case 'RESET':
  return createInitialState();
```

**Acceptance Criteria:**
- [ ] SET_ERROR adds field-specific error
- [ ] CLEAR_ERROR removes specific field error
- [ ] CLEAR_ALL_ERRORS clears all errors and submitError
- [ ] RESET returns to initial state

---

### Task 1.2.9: Implement Hook Return Interface

**Description:** Define the return type interface and implement the main hook with useCallback actions and useMemo computed values.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts:413-612`

**Implementation:**

```typescript
export interface UseWorkflowStateReturn {
  // State
  state: WorkflowState;

  // Navigation actions
  goToStep: (step: WorkflowStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Selection actions
  selectRoom: (room: RoomType) => void;
  selectItemType: (itemType: ItemType) => void;
  selectSpecificItem: (item: string) => void;
  setItemName: (name: string) => void;

  // Content actions
  selectContentSource: (source: 'existing' | 'create-new') => void;
  selectContentType: (type: ContentType) => void;
  addContentPiece: (piece: ContentPiece) => void;
  removeContentPiece: (id: string) => void;
  reorderContent: (fromIndex: number, toIndex: number) => void;

  // Session actions
  saveItem: (item: SessionItem) => void;
  startNewItem: () => void;
  completeSession: () => void;

  // Error actions
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  // Submission
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;

  // Computed values
  canGoNext: boolean;
  canGoBack: boolean;
  progressPercent: number;
  currentStepIndex: number;
  totalSteps: number;
  itemCount: number;
}
```

**Acceptance Criteria:**
- [ ] All actions wrapped with useCallback
- [ ] All computed values wrapped with useMemo
- [ ] progressPercent uses PROGRESS_WEIGHTS
- [ ] canGoNext checks step requirements

---

### Task 1.2.10: Update Barrel Exports

**Description:** Export the hook and return type from hooks/index.ts and main index.ts.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/hooks/index.ts`
- `src/components/ItemCreationWorkflow/index.ts`

**Implementation:**

```typescript
// hooks/index.ts
export { useWorkflowState } from './useWorkflowState';
export type { UseWorkflowStateReturn } from './useWorkflowState';

// index.ts
export { useWorkflowState } from './hooks';
export type { UseWorkflowStateReturn } from './hooks';
```

**Acceptance Criteria:**
- [ ] Hook exported from hooks/index.ts
- [ ] Hook exported from main index.ts
- [ ] Types exported alongside hook

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Main hook implementation with reducer and helpers |

### Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Add export for useWorkflowState and UseWorkflowStateReturn |
| `src/components/ItemCreationWorkflow/index.ts` | Add export for useWorkflowState and UseWorkflowStateReturn (lines 109-111) |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Pattern reference for reducer structure |
| `src/components/ItemManager/hooks/useItemManagerState.ts` | Pattern reference for hook organization |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions to use |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Constants to import (ROOM_LABELS, PROGRESS_WEIGHTS, WORKFLOW_STEPS) |

---

## Dependencies

### Internal Dependencies
- `ItemCreationWorkflow.types.ts` - All type definitions
- `utils/constants.ts` - ROOM_LABELS, PROGRESS_WEIGHTS, WORKFLOW_STEPS

### External Dependencies
- React hooks: `useReducer`, `useCallback`, `useMemo`
- Browser API: `crypto.randomUUID()` for session ID generation

### Task Dependencies
- **Depends on:** Task 1.1 (Component Scaffold & Type Definitions) - COMPLETED
- **Blocks:** Task 1.3 (Main Workflow Component), Task 1.4 (Session Persistence)

---

## Testing Strategy

### Unit Tests Required

```typescript
// src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts

describe('useWorkflowState', () => {
  describe('createInitialState', () => {
    it('generates unique session IDs');
    it('initializes all state fields correctly');
  });

  describe('step transitions', () => {
    it('navigates forward through valid steps');
    it('prevents invalid step transitions');
    it('maintains step history on forward navigation');
    it('pops history on back navigation');
    it('skips item-type-selection when room is "general"');
  });

  describe('selection actions', () => {
    it('SELECT_ROOM initializes currentItem');
    it('general room auto-sets itemType to general-info');
    it('SELECT_SPECIFIC_ITEM auto-generates itemName');
    it('SET_ITEM_NAME allows custom name override');
  });

  describe('content actions', () => {
    it('adds content pieces to array');
    it('removes content pieces by ID');
    it('reorders content and updates order property');
  });

  describe('session management', () => {
    it('SAVE_ITEM adds to session and clears currentItem');
    it('START_NEW_ITEM resets for new item flow');
    it('COMPLETE_SESSION navigates to session-summary');
  });

  describe('computed values', () => {
    it('calculates progressPercent from PROGRESS_WEIGHTS');
    it('canGoNext is false when required data missing');
    it('canGoBack reflects stepHistory length');
  });
});
```

---

## Acceptance Criteria Summary

- [ ] Hook creates initial state with unique session ID
- [ ] Forward navigation respects STEP_TRANSITIONS map
- [ ] Back navigation uses stepHistory for accurate restoration
- [ ] "General" room selection skips item-type-selection step
- [ ] Room selection initializes currentItem state
- [ ] Specific item selection auto-generates item name
- [ ] Content actions (add, remove, reorder) work correctly
- [ ] Session management actions (save, new, complete) function properly
- [ ] Error handling follows established patterns
- [ ] Computed values (canGoNext, canGoBack, progressPercent) are accurate
- [ ] Hook is exported from barrel files
- [ ] Code follows established naming conventions and patterns

---

## References

- [Implementation Plan: Item Creation Workflow](docs/prd/Plan-093-Item-Creation-Workflow.md)
- [ItemCapture State Hook](src/components/ItemCapture/hooks/useItemCaptureState.ts)
- [ItemManager State Hook](src/components/ItemManager/hooks/useItemManagerState.ts)
- [ItemCreationWorkflow Types](src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)
- [ItemCreationWorkflow Constants](src/components/ItemCreationWorkflow/utils/constants.ts)

---

*Implementation Overview generated on 2026-01-05 for REQ-094: Workflow State Machine*
