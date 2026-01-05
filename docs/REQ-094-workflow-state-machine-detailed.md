# REQ-094: Workflow State Machine - Detailed Task Breakdown

**Generated:** 2026-01-05 01:57:53 UTC
**Last Modified:** 2026-01-05 01:57:53 UTC
**Request Reference:** REQ-094 in docs/gen_requests.md
**Overview Document:** docs/REQ-094-workflow-state-machine-overview.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md
**Phase:** 1 - Foundation & Core Infrastructure
**Task ID:** 1.2

---

## Executive Summary

This document provides a detailed, actionable task breakdown for implementing the `useWorkflowState` hook - the core state machine that controls multi-step workflow progression for the ItemCreationWorkflow component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes verification steps.

---

## Prerequisites

- **Completed:** REQ-093 Task 1.1 (Component Scaffold & Type Definitions)
- **Required Files Exist:**
  - `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
  - `src/components/ItemCreationWorkflow/utils/constants.ts`
  - `src/components/ItemCreationWorkflow/hooks/index.ts`
  - `src/components/ItemCreationWorkflow/index.ts`

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Main hook implementation with reducer and helpers |

### Files to Modify

| File Path | Specific Modifications |
|-----------|------------------------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Add export for `useWorkflowState` and `UseWorkflowStateReturn` |
| `src/components/ItemCreationWorkflow/index.ts` | Add export for `useWorkflowState` and `UseWorkflowStateReturn` |

### Reference Files (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Pattern reference for reducer structure, step transitions, step history |
| `src/components/ItemManager/hooks/useItemManagerState.ts` | Pattern reference for hook organization, useCallback wrapping |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions to import |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Constants to import (ROOM_LABELS, PROGRESS_WEIGHTS, WORKFLOW_STEPS) |

---

## Detailed Task Breakdown

### Task 1.2.1: Create Hook File Skeleton with Imports

**Estimated Effort:** ~30 minutes
**Story Points:** 0.5

**Description:**
Create the `useWorkflowState.ts` file with proper file header documentation, all required imports, and section comment placeholders.

**Implementation Steps:**

1. Create file `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Add file header documentation following the pattern in `useItemCaptureState.ts` (lines 1-12)
3. Add imports:
   - React hooks: `useReducer`, `useCallback`, `useMemo`
   - Types from `../ItemCreationWorkflow.types.ts`: `WorkflowStep`, `WorkflowState`, `WorkflowAction`, `RoomType`, `ItemType`, `ContentType`, `ContentPiece`, `SessionItem`, `CurrentItemState`, `WorkflowSession`
   - Constants from `../utils/constants.ts`: `ROOM_LABELS`, `PROGRESS_WEIGHTS`, `WORKFLOW_STEPS`
4. Add section comment placeholders:
   - Step Transitions
   - Initial State
   - Helper Functions
   - Reducer
   - Hook Return Type
   - Main Hook

**Code Template:**

```typescript
'use client';

/**
 * useWorkflowState - Core state machine hook for ItemCreationWorkflow
 *
 * This hook manages all state for the multi-step ItemCreationWorkflow,
 * including navigation, step history, item creation state, and session management.
 *
 * @module ItemCreationWorkflow/hooks/useWorkflowState
 * @see docs/REQ-094-workflow-state-machine-detailed.md
 * @lastModified 2026-01-05
 */

import { useReducer, useCallback, useMemo } from 'react';
import type {
  WorkflowStep,
  WorkflowState,
  WorkflowAction,
  RoomType,
  ItemType,
  ContentType,
  ContentPiece,
  SessionItem,
  CurrentItemState,
  WorkflowSession,
} from '../ItemCreationWorkflow.types';
import {
  ROOM_LABELS,
  PROGRESS_WEIGHTS,
  WORKFLOW_STEPS,
} from '../utils/constants';

// =============================================================================
// Step Transitions
// =============================================================================

// TODO: Task 1.2.2

// =============================================================================
// Initial State
// =============================================================================

// TODO: Task 1.2.3

// =============================================================================
// Helper Functions
// =============================================================================

// TODO: Task 1.2.4

// =============================================================================
// Reducer
// =============================================================================

// TODO: Tasks 1.2.5 - 1.2.9

// =============================================================================
// Hook Return Type
// =============================================================================

// TODO: Task 1.2.10

// =============================================================================
// Main Hook
// =============================================================================

// TODO: Task 1.2.11
```

**Verification Steps:**

- [ ] File compiles without TypeScript errors (`npm run type-check`)
- [ ] All imports resolve correctly (no red squiggles in IDE)
- [ ] File header includes correct module name and date
- [ ] Section comments are in correct order

---

### Task 1.2.2: Define Step Transitions Map

**Estimated Effort:** ~30 minutes
**Story Points:** 0.5

**Description:**
Create a mapping of valid step transitions, including conditional transitions for navigation validation.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 29-44

**Implementation Steps:**

1. Define `STEP_TRANSITIONS` constant as `Record<WorkflowStep, WorkflowStep[]>`
2. Map each step to its valid next steps:
   - `room-selection` → `['item-type-selection', 'specific-item-selection']` (conditional)
   - `item-type-selection` → `['specific-item-selection']`
   - `specific-item-selection` → `['content-source-selection']`
   - `content-source-selection` → `['content-type-selection']`
   - `content-type-selection` → `['content-creation']`
   - `content-creation` → `['preview-save']`
   - `preview-save` → `['next-action']`
   - `next-action` → `['room-selection', 'session-summary']` (conditional)
   - `session-summary` → `[]` (terminal step)
3. Add JSDoc comment explaining conditional transitions
4. Export the constant

**Code:**

```typescript
/**
 * Valid transitions from each step.
 * Used to validate GO_TO_STEP actions and determine NEXT_STEP targets.
 *
 * Notes on conditional transitions:
 * - room-selection: Goes to specific-item-selection if room is 'general' (skips item-type)
 * - next-action: Goes to room-selection for "Tag New Item" or session-summary for "I'm Done"
 */
export const STEP_TRANSITIONS: Record<WorkflowStep, WorkflowStep[]> = {
  'room-selection': ['item-type-selection', 'specific-item-selection'],
  'item-type-selection': ['specific-item-selection'],
  'specific-item-selection': ['content-source-selection'],
  'content-source-selection': ['content-type-selection'],
  'content-type-selection': ['content-creation'],
  'content-creation': ['preview-save'],
  'preview-save': ['next-action'],
  'next-action': ['room-selection', 'session-summary'],
  'session-summary': [],
};
```

**Verification Steps:**

- [ ] All 9 workflow steps are covered in the map
- [ ] TypeScript validates the Record type correctly
- [ ] Conditional transitions are documented in JSDoc
- [ ] `session-summary` has empty array (terminal step)

---

### Task 1.2.3: Implement createInitialState Factory

**Estimated Effort:** ~45 minutes
**Story Points:** 0.5

**Description:**
Create a factory function that generates fresh initial state for the reducer.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 50-72

**Implementation Steps:**

1. Create `createInitialState` function returning `WorkflowState`
2. Initialize all state fields:
   - `currentStep`: `'room-selection'`
   - `stepHistory`: `[]`
   - `canGoBack`: `false`
   - `session`: Create with `crypto.randomUUID()`, `new Date()`, empty items array
   - `currentItem`: `null`
   - `isSubmitting`: `false`
   - `isDirty`: `false`
   - `errors`: `{}`
   - `submitError`: `null`
3. Add JSDoc documentation
4. Export the function

**Code:**

```typescript
/**
 * Factory function to create fresh initial state.
 * Used by reducer RESET action and hook initialization.
 *
 * @returns Fresh WorkflowState with unique session ID
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

**Verification Steps:**

- [ ] Function returns correct `WorkflowState` type
- [ ] `crypto.randomUUID()` generates valid UUID
- [ ] All WorkflowState fields are initialized
- [ ] Function is exported for external testing

---

### Task 1.2.4: Implement Step Skipping Logic Helpers

**Estimated Effort:** ~45 minutes
**Story Points:** 0.5

**Description:**
Create helper functions to determine when steps should be skipped and what the next step should be.

**Implementation Steps:**

1. Create `shouldSkipItemType(state: WorkflowState): boolean`
   - Returns `true` when `state.currentItem?.room === 'general'`
2. Create `getNextStep(currentStep: WorkflowStep, state: WorkflowState): WorkflowStep | null`
   - Get transitions from `STEP_TRANSITIONS`
   - If no transitions, return `null`
   - Handle `room-selection` special case with skip logic
   - For single-transition steps, return that transition
   - Return `null` for multi-transition steps requiring explicit choice
3. Add JSDoc documentation for both functions
4. Export both functions

**Code:**

```typescript
/**
 * Determines if item-type-selection step should be skipped.
 * "General" room category implies "general-info" item type.
 *
 * @param state - Current workflow state
 * @returns true if item-type-selection should be skipped
 */
export function shouldSkipItemType(state: WorkflowState): boolean {
  return state.currentItem?.room === 'general';
}

/**
 * Gets the next step, accounting for skip conditions.
 * Returns null if no automatic next step exists (caller must specify).
 *
 * @param currentStep - The current workflow step
 * @param state - Current workflow state for skip condition evaluation
 * @returns The next step, or null if explicit selection required
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

  // Multi-transition steps require explicit choice
  return null;
}
```

**Verification Steps:**

- [ ] `shouldSkipItemType` returns `true` only when room is 'general'
- [ ] `getNextStep` returns 'specific-item-selection' when room is 'general' at room-selection
- [ ] `getNextStep` returns 'item-type-selection' for non-general rooms at room-selection
- [ ] `getNextStep` returns `null` for `session-summary` (terminal step)
- [ ] `getNextStep` returns `null` for `next-action` (requires explicit choice)

---

### Task 1.2.5: Implement Navigation Actions in Reducer (GO_TO_STEP, NEXT_STEP, PREV_STEP)

**Estimated Effort:** ~1 hour
**Story Points:** 1

**Description:**
Implement the core navigation action handlers in the reducer with proper history management.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 168-213

**Implementation Steps:**

1. Create reducer function skeleton: `function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState`
2. Implement `GO_TO_STEP` case:
   - Check if payload is in `stepHistory` (back navigation)
   - If forward: validate against `STEP_TRANSITIONS[state.currentStep]`
   - If back: truncate history to that point
   - If forward: push current step to history
   - Update `canGoBack` based on new history length
3. Implement `NEXT_STEP` case:
   - Use `getNextStep()` helper
   - If no next step, log warning and return state
   - Push current step to history
   - Clear errors on successful navigation
   - Update `canGoBack` to true
4. Implement `PREV_STEP` case:
   - If history is empty, return state unchanged
   - Pop last step from history
   - Update `canGoBack` based on remaining history
5. Add switch statement with default return state

**Code:**

```typescript
function workflowReducer(
  state: WorkflowState,
  action: WorkflowAction
): WorkflowState {
  switch (action.type) {
    // =========================================================================
    // Navigation Actions
    // =========================================================================
    case 'GO_TO_STEP': {
      const validTransitions = STEP_TRANSITIONS[state.currentStep];
      // Allow going to any previous step (for editing)
      const isBackNavigation = state.stepHistory.includes(action.payload);
      // Validate forward transition
      if (!isBackNavigation && !validTransitions?.includes(action.payload)) {
        console.warn(`Invalid step transition: ${state.currentStep} -> ${action.payload}`);
        return state;
      }
      const newHistory = isBackNavigation
        ? state.stepHistory.slice(0, state.stepHistory.indexOf(action.payload))
        : [...state.stepHistory, state.currentStep];
      return {
        ...state,
        currentStep: action.payload,
        stepHistory: newHistory,
        canGoBack: newHistory.length > 0,
        session: {
          ...state.session,
          currentStep: action.payload,
        },
      };
    }

    case 'NEXT_STEP': {
      const nextStep = getNextStep(state.currentStep, state);
      if (!nextStep) {
        console.warn(`No automatic next step from: ${state.currentStep}`);
        return state;
      }
      const newHistory = [...state.stepHistory, state.currentStep];
      return {
        ...state,
        currentStep: nextStep,
        stepHistory: newHistory,
        canGoBack: true,
        errors: {},
        session: {
          ...state.session,
          currentStep: nextStep,
        },
      };
    }

    case 'PREV_STEP': {
      if (state.stepHistory.length === 0) {
        return state;
      }
      const previousStep = state.stepHistory[state.stepHistory.length - 1];
      const newHistory = state.stepHistory.slice(0, -1);
      return {
        ...state,
        currentStep: previousStep,
        stepHistory: newHistory,
        canGoBack: newHistory.length > 0,
        session: {
          ...state.session,
          currentStep: previousStep,
        },
      };
    }

    default:
      return state;
  }
}
```

**Verification Steps:**

- [ ] GO_TO_STEP validates forward transitions against STEP_TRANSITIONS
- [ ] GO_TO_STEP allows navigation to any step in history
- [ ] GO_TO_STEP truncates history when navigating back
- [ ] NEXT_STEP uses getNextStep helper correctly
- [ ] NEXT_STEP clears errors on successful navigation
- [ ] PREV_STEP pops from history correctly
- [ ] canGoBack is updated correctly in all cases
- [ ] session.currentStep is synced with state.currentStep

---

### Task 1.2.6: Implement Selection Actions in Reducer (SELECT_ROOM, SELECT_ITEM_TYPE, SELECT_SPECIFIC_ITEM, SET_ITEM_NAME)

**Estimated Effort:** ~1 hour
**Story Points:** 1

**Description:**
Implement the selection action handlers for room, item type, specific item, and item name.

**Implementation Steps:**

1. Add `SELECT_ROOM` case:
   - If room is 'general', auto-set itemType to 'general-info'
   - Initialize `currentItem` with all default values
   - Set `isDirty` to true
2. Add `SELECT_ITEM_TYPE` case:
   - Guard: return state if `currentItem` is null
   - Update `currentItem.itemType`
   - Set `isDirty` to true
3. Add `SELECT_SPECIFIC_ITEM` case:
   - Guard: return state if `currentItem` is null
   - Update `currentItem.specificItem`
   - Auto-generate `itemName` using pattern: `"${ROOM_LABELS[room]} - ${specificItem}"`
   - Set `isDirty` to true
4. Add `SET_ITEM_NAME` case:
   - Guard: return state if `currentItem` is null
   - Update `currentItem.itemName` with custom value
   - Set `isDirty` to true

**Code:**

```typescript
// Add after PREV_STEP case in switch statement:

// =========================================================================
// Selection Actions
// =========================================================================
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  return {
    ...state,
    currentItem: {
      room: roomType,
      itemType: itemType as ItemType,
      specificItem: '',
      itemName: '',
      contentSource: 'existing',
      contentType: null,
      content: [],
    },
    isDirty: true,
    session: {
      ...state.session,
      currentItem: {
        room: roomType,
        itemType: itemType as ItemType,
        specificItem: '',
        itemName: '',
        contentSource: 'existing',
        contentType: null,
        content: [],
      },
    },
  };
}

case 'SELECT_ITEM_TYPE': {
  if (!state.currentItem) return state;
  const updatedItem = {
    ...state.currentItem,
    itemType: action.payload,
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

case 'SELECT_SPECIFIC_ITEM': {
  if (!state.currentItem) return state;
  const roomLabel = ROOM_LABELS[state.currentItem.room] || state.currentItem.room;
  const autoName = `${roomLabel} - ${action.payload}`;
  const updatedItem = {
    ...state.currentItem,
    specificItem: action.payload,
    itemName: autoName,
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

case 'SET_ITEM_NAME': {
  if (!state.currentItem) return state;
  const updatedItem = {
    ...state.currentItem,
    itemName: action.payload,
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

**Verification Steps:**

- [ ] SELECT_ROOM initializes currentItem with all required fields
- [ ] SELECT_ROOM sets itemType to 'general-info' when room is 'general'
- [ ] SELECT_ITEM_TYPE guards against null currentItem
- [ ] SELECT_SPECIFIC_ITEM uses ROOM_LABELS for auto-name generation
- [ ] SET_ITEM_NAME allows custom name override
- [ ] All actions sync currentItem to session.currentItem
- [ ] All actions set isDirty to true

---

### Task 1.2.7: Implement Content Actions in Reducer (SELECT_CONTENT_SOURCE, SELECT_CONTENT_TYPE, ADD_CONTENT_PIECE, REMOVE_CONTENT_PIECE, REORDER_CONTENT)

**Estimated Effort:** ~1 hour
**Story Points:** 1

**Description:**
Implement the content-related action handlers for source selection, type selection, and content piece management.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 257-276 (REORDER_MEDIA)

**Implementation Steps:**

1. Add `SELECT_CONTENT_SOURCE` case:
   - Guard: return state if `currentItem` is null
   - Update `contentSource` and reset `contentType` to null
   - Set `isDirty` to true
2. Add `SELECT_CONTENT_TYPE` case:
   - Guard: return state if `currentItem` is null
   - Update `contentType`
   - Set `isDirty` to true
3. Add `ADD_CONTENT_PIECE` case:
   - Guard: return state if `currentItem` is null
   - Append piece to `content` array
   - Set `isDirty` to true
4. Add `REMOVE_CONTENT_PIECE` case:
   - Guard: return state if `currentItem` is null
   - Filter out piece by ID
   - Set `isDirty` to true
5. Add `REORDER_CONTENT` case:
   - Guard: return state if `currentItem` is null
   - Splice/reorder content array
   - Update `order` property on each piece
   - Set `isDirty` to true

**Code:**

```typescript
// Add after SET_ITEM_NAME case in switch statement:

// =========================================================================
// Content Actions
// =========================================================================
case 'SELECT_CONTENT_SOURCE': {
  if (!state.currentItem) return state;
  const updatedItem = {
    ...state.currentItem,
    contentSource: action.payload,
    contentType: null, // Reset content type when source changes
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

case 'SELECT_CONTENT_TYPE': {
  if (!state.currentItem) return state;
  const updatedItem = {
    ...state.currentItem,
    contentType: action.payload,
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

case 'ADD_CONTENT_PIECE': {
  if (!state.currentItem) return state;
  const updatedItem = {
    ...state.currentItem,
    content: [...state.currentItem.content, action.payload],
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

case 'REMOVE_CONTENT_PIECE': {
  if (!state.currentItem) return state;
  const updatedItem = {
    ...state.currentItem,
    content: state.currentItem.content.filter(c => c.id !== action.payload),
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

case 'REORDER_CONTENT': {
  if (!state.currentItem) return state;
  const { fromIndex, toIndex } = action.payload;
  const content = [...state.currentItem.content];

  // Validate indices
  if (fromIndex < 0 || fromIndex >= content.length ||
      toIndex < 0 || toIndex >= content.length) {
    return state;
  }

  const [removed] = content.splice(fromIndex, 1);
  content.splice(toIndex, 0, removed);

  // Update order property on each piece
  const reorderedContent = content.map((item, index) => ({
    ...item,
    order: index,
  }));

  const updatedItem = {
    ...state.currentItem,
    content: reorderedContent,
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

**Verification Steps:**

- [ ] SELECT_CONTENT_SOURCE resets contentType to null
- [ ] ADD_CONTENT_PIECE appends to content array (does not mutate)
- [ ] REMOVE_CONTENT_PIECE filters by correct ID
- [ ] REORDER_CONTENT validates index bounds
- [ ] REORDER_CONTENT updates order property on all pieces
- [ ] All actions guard against null currentItem
- [ ] All actions sync to session.currentItem

---

### Task 1.2.8: Implement Session Management Actions (SAVE_ITEM, START_NEW_ITEM, COMPLETE_SESSION)

**Estimated Effort:** ~45 minutes
**Story Points:** 0.5

**Description:**
Implement the session lifecycle action handlers for saving items, starting new items, and completing sessions.

**Implementation Steps:**

1. Add `SAVE_ITEM` case:
   - Add payload (SessionItem) to `session.items` array
   - Clear `currentItem` to null
   - Set `isDirty` to false
2. Add `START_NEW_ITEM` case:
   - Reset to `room-selection` step
   - Clear `stepHistory`
   - Set `canGoBack` to false
   - Clear `currentItem`
   - Clear `errors`
3. Add `COMPLETE_SESSION` case:
   - Navigate to `session-summary` step
   - Push current step to history
   - Set `canGoBack` to true

**Code:**

```typescript
// Add after REORDER_CONTENT case in switch statement:

// =========================================================================
// Session Management Actions
// =========================================================================
case 'SAVE_ITEM': {
  return {
    ...state,
    session: {
      ...state.session,
      items: [...state.session.items, action.payload],
      currentItem: null,
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
    session: {
      ...state.session,
      currentStep: 'room-selection',
      currentItem: null,
    },
  };
}

case 'COMPLETE_SESSION': {
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'session-summary',
    stepHistory: newHistory,
    canGoBack: true,
    session: {
      ...state.session,
      currentStep: 'session-summary',
    },
  };
}
```

**Verification Steps:**

- [ ] SAVE_ITEM appends to session.items array
- [ ] SAVE_ITEM clears currentItem in both state and session
- [ ] SAVE_ITEM sets isDirty to false
- [ ] START_NEW_ITEM resets to room-selection step
- [ ] START_NEW_ITEM clears stepHistory and errors
- [ ] COMPLETE_SESSION navigates to session-summary
- [ ] COMPLETE_SESSION preserves history for back navigation

---

### Task 1.2.9: Implement Error and Reset Actions (SET_ERROR, CLEAR_ERROR, CLEAR_ALL_ERRORS, SET_SUBMITTING, SUBMIT_ERROR, RESET)

**Estimated Effort:** ~30 minutes
**Story Points:** 0.5

**Description:**
Implement the error handling and reset action handlers.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 316-394

**Implementation Steps:**

1. Add `SET_ERROR` case:
   - Add/update error for specified field
2. Add `CLEAR_ERROR` case:
   - Remove error for specified field using object destructuring
3. Add `CLEAR_ALL_ERRORS` case:
   - Reset `errors` to empty object
   - Reset `submitError` to null
4. Add `SET_SUBMITTING` case:
   - Update `isSubmitting` to payload value
5. Add `SUBMIT_ERROR` case:
   - Set `isSubmitting` to false
   - Set `submitError` to payload message
6. Add `RESET` case:
   - Return result of `createInitialState()`

**Code:**

```typescript
// Add after COMPLETE_SESSION case in switch statement:

// =========================================================================
// Error Handling Actions
// =========================================================================
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

// =========================================================================
// Submission Actions
// =========================================================================
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

// =========================================================================
// Reset Action
// =========================================================================
case 'RESET':
  return createInitialState();
```

**Verification Steps:**

- [ ] SET_ERROR adds error to errors object
- [ ] CLEAR_ERROR removes specific error key
- [ ] CLEAR_ALL_ERRORS resets both errors and submitError
- [ ] SET_SUBMITTING updates isSubmitting correctly
- [ ] SUBMIT_ERROR sets isSubmitting to false and sets error
- [ ] RESET returns completely fresh state with new session ID
- [ ] _removed variable silences unused variable warning in CLEAR_ERROR

---

### Task 1.2.10: Define Hook Return Interface

**Estimated Effort:** ~30 minutes
**Story Points:** 0.5

**Description:**
Define the `UseWorkflowStateReturn` interface that documents all state, actions, and computed values the hook exposes.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 413-458

**Implementation Steps:**

1. Create `UseWorkflowStateReturn` interface
2. Group properties by category:
   - State: `state: WorkflowState`
   - Navigation actions: `goToStep`, `nextStep`, `prevStep`
   - Selection actions: `selectRoom`, `selectItemType`, `selectSpecificItem`, `setItemName`
   - Content actions: `selectContentSource`, `selectContentType`, `addContentPiece`, `removeContentPiece`, `reorderContent`
   - Session actions: `saveItem`, `startNewItem`, `completeSession`
   - Error actions: `setError`, `clearError`, `clearAllErrors`
   - Submission: `setSubmitting`, `reset`
   - Computed values: `canGoNext`, `canGoBack`, `progressPercent`, `currentStepIndex`, `totalSteps`, `itemCount`
3. Add JSDoc documentation for the interface
4. Export the interface

**Code:**

```typescript
// =============================================================================
// Hook Return Type
// =============================================================================

/**
 * Return type for useWorkflowState hook.
 * Contains all state, actions, and computed values for workflow management.
 */
export interface UseWorkflowStateReturn {
  // State
  /** Current workflow state */
  state: WorkflowState;

  // Navigation actions
  /** Navigate directly to a specific step */
  goToStep: (step: WorkflowStep) => void;
  /** Navigate to the next step (automatic determination) */
  nextStep: () => void;
  /** Navigate to the previous step using history */
  prevStep: () => void;

  // Selection actions
  /** Select a room for the current item */
  selectRoom: (room: RoomType) => void;
  /** Select an item type for the current item */
  selectItemType: (itemType: ItemType) => void;
  /** Select a specific item (from suggestions or custom) */
  selectSpecificItem: (item: string) => void;
  /** Set a custom item name (overrides auto-generated) */
  setItemName: (name: string) => void;

  // Content actions
  /** Select content source (existing or create-new) */
  selectContentSource: (source: 'existing' | 'create-new') => void;
  /** Select content type for the current item */
  selectContentType: (type: ContentType) => void;
  /** Add a content piece to the current item */
  addContentPiece: (piece: ContentPiece) => void;
  /** Remove a content piece by ID */
  removeContentPiece: (id: string) => void;
  /** Reorder content pieces */
  reorderContent: (fromIndex: number, toIndex: number) => void;

  // Session actions
  /** Save the current item to the session */
  saveItem: (item: SessionItem) => void;
  /** Start creating a new item (resets to room-selection) */
  startNewItem: () => void;
  /** Complete the session (navigate to session-summary) */
  completeSession: () => void;

  // Error actions
  /** Set a field-level error */
  setError: (field: string, message: string) => void;
  /** Clear a specific field error */
  clearError: (field: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;

  // Submission
  /** Set the submitting state */
  setSubmitting: (isSubmitting: boolean) => void;
  /** Reset the entire workflow to initial state */
  reset: () => void;

  // Computed values
  /** Whether the user can navigate to the next step */
  canGoNext: boolean;
  /** Whether the user can navigate back */
  canGoBack: boolean;
  /** Current progress percentage (0-100) */
  progressPercent: number;
  /** Index of current step in WORKFLOW_STEPS */
  currentStepIndex: number;
  /** Total number of workflow steps */
  totalSteps: number;
  /** Number of items created in this session */
  itemCount: number;
}
```

**Verification Steps:**

- [ ] All actions from WorkflowAction type are represented
- [ ] All computed values documented
- [ ] JSDoc comments explain each property
- [ ] Interface is exported

---

### Task 1.2.11: Implement Main Hook with useCallback Actions

**Estimated Effort:** ~1.5 hours
**Story Points:** 1

**Description:**
Implement the main `useWorkflowState` hook with all action callbacks wrapped in `useCallback` for referential stability.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 464-612

**Implementation Steps:**

1. Create `useWorkflowState` function returning `UseWorkflowStateReturn`
2. Initialize state with `useReducer(workflowReducer, undefined, createInitialState)`
3. Create all navigation action callbacks with `useCallback`:
   - `goToStep`, `nextStep`, `prevStep`
4. Create all selection action callbacks:
   - `selectRoom`, `selectItemType`, `selectSpecificItem`, `setItemName`
5. Create all content action callbacks:
   - `selectContentSource`, `selectContentType`, `addContentPiece`, `removeContentPiece`, `reorderContent`
6. Create all session action callbacks:
   - `saveItem`, `startNewItem`, `completeSession`
7. Create all error action callbacks:
   - `setError`, `clearError`, `clearAllErrors`
8. Create submission callbacks:
   - `setSubmitting`, `reset`
9. Export both named and default exports

**Code:**

```typescript
// =============================================================================
// Main Hook
// =============================================================================

/**
 * Core state management hook for ItemCreationWorkflow component.
 *
 * Provides centralized state for multi-step workflow navigation,
 * item creation, session management, and error handling.
 * Uses reducer pattern for predictable state updates.
 *
 * @returns State, actions, and computed values
 *
 * @example
 * const { state, nextStep, selectRoom, canGoNext } = useWorkflowState();
 */
export function useWorkflowState(): UseWorkflowStateReturn {
  const [state, dispatch] = useReducer(workflowReducer, undefined, createInitialState);

  // =========================================================================
  // Navigation Actions
  // =========================================================================
  const goToStep = useCallback((step: WorkflowStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  // =========================================================================
  // Selection Actions
  // =========================================================================
  const selectRoom = useCallback((room: RoomType) => {
    dispatch({ type: 'SELECT_ROOM', payload: room });
  }, []);

  const selectItemType = useCallback((itemType: ItemType) => {
    dispatch({ type: 'SELECT_ITEM_TYPE', payload: itemType });
  }, []);

  const selectSpecificItem = useCallback((item: string) => {
    dispatch({ type: 'SELECT_SPECIFIC_ITEM', payload: item });
  }, []);

  const setItemName = useCallback((name: string) => {
    dispatch({ type: 'SET_ITEM_NAME', payload: name });
  }, []);

  // =========================================================================
  // Content Actions
  // =========================================================================
  const selectContentSource = useCallback((source: 'existing' | 'create-new') => {
    dispatch({ type: 'SELECT_CONTENT_SOURCE', payload: source });
  }, []);

  const selectContentType = useCallback((type: ContentType) => {
    dispatch({ type: 'SELECT_CONTENT_TYPE', payload: type });
  }, []);

  const addContentPiece = useCallback((piece: ContentPiece) => {
    dispatch({ type: 'ADD_CONTENT_PIECE', payload: piece });
  }, []);

  const removeContentPiece = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CONTENT_PIECE', payload: id });
  }, []);

  const reorderContent = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_CONTENT', payload: { fromIndex, toIndex } });
  }, []);

  // =========================================================================
  // Session Actions
  // =========================================================================
  const saveItem = useCallback((item: SessionItem) => {
    dispatch({ type: 'SAVE_ITEM', payload: item });
  }, []);

  const startNewItem = useCallback(() => {
    dispatch({ type: 'START_NEW_ITEM' });
  }, []);

  const completeSession = useCallback(() => {
    dispatch({ type: 'COMPLETE_SESSION' });
  }, []);

  // =========================================================================
  // Error Actions
  // =========================================================================
  const setError = useCallback((field: string, message: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, message } });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: field });
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  // =========================================================================
  // Submission Actions
  // =========================================================================
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Computed values added in Task 1.2.12

  return {
    state,
    goToStep,
    nextStep,
    prevStep,
    selectRoom,
    selectItemType,
    selectSpecificItem,
    setItemName,
    selectContentSource,
    selectContentType,
    addContentPiece,
    removeContentPiece,
    reorderContent,
    saveItem,
    startNewItem,
    completeSession,
    setError,
    clearError,
    clearAllErrors,
    setSubmitting,
    reset,
    // Computed values (Task 1.2.12)
    canGoNext: false, // Placeholder
    canGoBack: state.canGoBack,
    progressPercent: 0, // Placeholder
    currentStepIndex: 0, // Placeholder
    totalSteps: WORKFLOW_STEPS.length,
    itemCount: state.session.items.length,
  };
}

export default useWorkflowState;
```

**Verification Steps:**

- [ ] All callbacks are wrapped with useCallback
- [ ] All callbacks have empty dependency arrays (only use dispatch)
- [ ] Hook returns all properties from UseWorkflowStateReturn
- [ ] Both named and default exports exist
- [ ] Hook compiles without TypeScript errors

---

### Task 1.2.12: Implement Computed Values with useMemo

**Estimated Effort:** ~45 minutes
**Story Points:** 0.5

**Description:**
Implement all computed values using useMemo for performance optimization.

**Pattern Reference:** `src/components/ItemCapture/hooks/useItemCaptureState.ts` lines 563-581

**Implementation Steps:**

1. Implement `canGoNext` computed value:
   - Returns `false` if currentStep is `session-summary`
   - Uses getNextStep to check if navigation is possible
   - Considers step-specific requirements (e.g., room selected, item type selected)
2. Implement `progressPercent` computed value:
   - Use PROGRESS_WEIGHTS[state.currentStep]
3. Implement `currentStepIndex` computed value:
   - Use WORKFLOW_STEPS.indexOf(state.currentStep)
4. Update hook return to use computed values

**Code:**

```typescript
// Add before the return statement in useWorkflowState:

// =========================================================================
// Computed Values
// =========================================================================
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

const canGoBack = useMemo(() => {
  return state.stepHistory.length > 0;
}, [state.stepHistory.length]);

const progressPercent = useMemo(() => {
  return PROGRESS_WEIGHTS[state.currentStep] ?? 0;
}, [state.currentStep]);

const currentStepIndex = useMemo(() => {
  return WORKFLOW_STEPS.indexOf(state.currentStep);
}, [state.currentStep]);

const totalSteps = WORKFLOW_STEPS.length;

const itemCount = useMemo(() => {
  return state.session.items.length;
}, [state.session.items.length]);
```

**Update Return Statement:**

```typescript
return {
  state,
  goToStep,
  nextStep,
  prevStep,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  setItemName,
  selectContentSource,
  selectContentType,
  addContentPiece,
  removeContentPiece,
  reorderContent,
  saveItem,
  startNewItem,
  completeSession,
  setError,
  clearError,
  clearAllErrors,
  setSubmitting,
  reset,
  canGoNext,
  canGoBack,
  progressPercent,
  currentStepIndex,
  totalSteps,
  itemCount,
};
```

**Verification Steps:**

- [ ] canGoNext returns false when required data missing
- [ ] canGoNext returns true when step requirements met
- [ ] progressPercent uses values from PROGRESS_WEIGHTS
- [ ] currentStepIndex correctly finds index in WORKFLOW_STEPS
- [ ] All useMemo hooks have correct dependencies
- [ ] canGoBack reflects stepHistory.length > 0

---

### Task 1.2.13: Update Barrel Exports

**Estimated Effort:** ~15 minutes
**Story Points:** 0.25

**Description:**
Export the hook and return type from hooks/index.ts and main index.ts.

**Implementation Steps:**

1. Update `src/components/ItemCreationWorkflow/hooks/index.ts`:
   - Add named export for useWorkflowState
   - Add type export for UseWorkflowStateReturn
2. Update `src/components/ItemCreationWorkflow/index.ts`:
   - Add re-export from hooks for useWorkflowState
   - Add re-export for UseWorkflowStateReturn type

**Code for hooks/index.ts:**

```typescript
// Add to existing exports:
export { useWorkflowState } from './useWorkflowState';
export type { UseWorkflowStateReturn } from './useWorkflowState';
```

**Code for main index.ts:**

```typescript
// Add to existing exports (after line ~109):
export { useWorkflowState } from './hooks';
export type { UseWorkflowStateReturn } from './hooks';
```

**Verification Steps:**

- [ ] `import { useWorkflowState } from '@/components/ItemCreationWorkflow'` works
- [ ] `import type { UseWorkflowStateReturn } from '@/components/ItemCreationWorkflow'` works
- [ ] No duplicate exports
- [ ] Build passes without errors

---

### Task 1.2.14: Write Unit Tests for createInitialState and Helper Functions

**Estimated Effort:** ~1 hour
**Story Points:** 1

**Description:**
Write unit tests for the factory function and helper functions.

**Implementation Steps:**

1. Create test file: `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
2. Write tests for `createInitialState`:
   - Generates unique session IDs
   - Initializes all state fields correctly
   - Returns correct types
3. Write tests for `shouldSkipItemType`:
   - Returns true when room is 'general'
   - Returns false for all other rooms
4. Write tests for `getNextStep`:
   - Returns correct step for room-selection with general room
   - Returns correct step for room-selection with other rooms
   - Returns null for session-summary
   - Returns single transition for single-transition steps

**Code:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  shouldSkipItemType,
  getNextStep,
  STEP_TRANSITIONS,
} from '../useWorkflowState';
import type { WorkflowState } from '../../ItemCreationWorkflow.types';

describe('useWorkflowState', () => {
  describe('createInitialState', () => {
    it('generates unique session IDs', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();
      expect(state1.session.id).not.toBe(state2.session.id);
    });

    it('initializes all state fields correctly', () => {
      const state = createInitialState();
      expect(state.currentStep).toBe('room-selection');
      expect(state.stepHistory).toEqual([]);
      expect(state.canGoBack).toBe(false);
      expect(state.currentItem).toBeNull();
      expect(state.isSubmitting).toBe(false);
      expect(state.isDirty).toBe(false);
      expect(state.errors).toEqual({});
      expect(state.submitError).toBeNull();
    });

    it('creates session with valid structure', () => {
      const state = createInitialState();
      expect(state.session.id).toBeDefined();
      expect(state.session.startedAt).toBeInstanceOf(Date);
      expect(state.session.items).toEqual([]);
      expect(state.session.currentItem).toBeNull();
    });
  });

  describe('shouldSkipItemType', () => {
    it('returns true when room is general', () => {
      const state = {
        ...createInitialState(),
        currentItem: { room: 'general' },
      } as WorkflowState;
      expect(shouldSkipItemType(state)).toBe(true);
    });

    it('returns false for kitchen room', () => {
      const state = {
        ...createInitialState(),
        currentItem: { room: 'kitchen' },
      } as WorkflowState;
      expect(shouldSkipItemType(state)).toBe(false);
    });

    it('returns false when currentItem is null', () => {
      const state = createInitialState();
      expect(shouldSkipItemType(state)).toBe(false);
    });
  });

  describe('getNextStep', () => {
    it('returns specific-item-selection for general room at room-selection', () => {
      const state = {
        ...createInitialState(),
        currentItem: { room: 'general' },
      } as WorkflowState;
      expect(getNextStep('room-selection', state)).toBe('specific-item-selection');
    });

    it('returns item-type-selection for kitchen room at room-selection', () => {
      const state = {
        ...createInitialState(),
        currentItem: { room: 'kitchen' },
      } as WorkflowState;
      expect(getNextStep('room-selection', state)).toBe('item-type-selection');
    });

    it('returns null for session-summary (terminal step)', () => {
      const state = createInitialState();
      expect(getNextStep('session-summary', state)).toBeNull();
    });

    it('returns null for next-action (requires explicit choice)', () => {
      const state = createInitialState();
      expect(getNextStep('next-action', state)).toBeNull();
    });

    it('returns single transition for single-transition steps', () => {
      const state = createInitialState();
      expect(getNextStep('item-type-selection', state)).toBe('specific-item-selection');
      expect(getNextStep('specific-item-selection', state)).toBe('content-source-selection');
    });
  });

  describe('STEP_TRANSITIONS', () => {
    it('covers all workflow steps', () => {
      const steps = Object.keys(STEP_TRANSITIONS);
      expect(steps).toHaveLength(9);
      expect(steps).toContain('room-selection');
      expect(steps).toContain('session-summary');
    });

    it('session-summary has no transitions (terminal)', () => {
      expect(STEP_TRANSITIONS['session-summary']).toEqual([]);
    });
  });
});
```

**Verification Steps:**

- [ ] All tests pass with `npm test`
- [ ] Tests cover factory function
- [ ] Tests cover skip logic
- [ ] Tests cover getNextStep for various scenarios
- [ ] Tests verify STEP_TRANSITIONS completeness

---

### Task 1.2.15: Write Unit Tests for Reducer Navigation Actions

**Estimated Effort:** ~1 hour
**Story Points:** 1

**Description:**
Write unit tests for the reducer navigation action handlers.

**Implementation Steps:**

1. Add tests for `GO_TO_STEP`:
   - Valid forward navigation adds to history
   - Invalid forward navigation is rejected
   - Back navigation truncates history
2. Add tests for `NEXT_STEP`:
   - Advances to correct next step
   - Clears errors on navigation
   - Fails gracefully when no next step
3. Add tests for `PREV_STEP`:
   - Pops from history correctly
   - Does nothing when history is empty
   - Updates canGoBack correctly

**Code:**

```typescript
// Add to existing test file:

import { workflowReducer } from '../useWorkflowState';

describe('workflowReducer - Navigation', () => {
  describe('GO_TO_STEP', () => {
    it('navigates forward and adds current step to history', () => {
      const initialState = {
        ...createInitialState(),
        currentItem: { room: 'kitchen' },
      } as WorkflowState;

      const newState = workflowReducer(initialState, {
        type: 'GO_TO_STEP',
        payload: 'item-type-selection',
      });

      expect(newState.currentStep).toBe('item-type-selection');
      expect(newState.stepHistory).toContain('room-selection');
      expect(newState.canGoBack).toBe(true);
    });

    it('rejects invalid forward navigation', () => {
      const initialState = createInitialState();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const newState = workflowReducer(initialState, {
        type: 'GO_TO_STEP',
        payload: 'session-summary', // Invalid from room-selection
      });

      expect(newState).toBe(initialState); // Unchanged
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('allows navigation to any step in history', () => {
      const initialState = {
        ...createInitialState(),
        currentStep: 'content-source-selection' as const,
        stepHistory: ['room-selection', 'item-type-selection', 'specific-item-selection'],
      };

      const newState = workflowReducer(initialState, {
        type: 'GO_TO_STEP',
        payload: 'item-type-selection',
      });

      expect(newState.currentStep).toBe('item-type-selection');
      expect(newState.stepHistory).toEqual(['room-selection']);
    });
  });

  describe('NEXT_STEP', () => {
    it('advances to correct next step', () => {
      const initialState = {
        ...createInitialState(),
        currentItem: { room: 'kitchen' },
      } as WorkflowState;

      const newState = workflowReducer(initialState, { type: 'NEXT_STEP' });

      expect(newState.currentStep).toBe('item-type-selection');
      expect(newState.canGoBack).toBe(true);
    });

    it('clears errors on successful navigation', () => {
      const initialState = {
        ...createInitialState(),
        currentItem: { room: 'kitchen' },
        errors: { someField: 'Some error' },
      } as WorkflowState;

      const newState = workflowReducer(initialState, { type: 'NEXT_STEP' });

      expect(newState.errors).toEqual({});
    });

    it('skips item-type-selection for general room', () => {
      const initialState = {
        ...createInitialState(),
        currentItem: { room: 'general' },
      } as WorkflowState;

      const newState = workflowReducer(initialState, { type: 'NEXT_STEP' });

      expect(newState.currentStep).toBe('specific-item-selection');
    });
  });

  describe('PREV_STEP', () => {
    it('pops from history correctly', () => {
      const initialState = {
        ...createInitialState(),
        currentStep: 'item-type-selection' as const,
        stepHistory: ['room-selection'],
      };

      const newState = workflowReducer(initialState, { type: 'PREV_STEP' });

      expect(newState.currentStep).toBe('room-selection');
      expect(newState.stepHistory).toEqual([]);
      expect(newState.canGoBack).toBe(false);
    });

    it('does nothing when history is empty', () => {
      const initialState = createInitialState();

      const newState = workflowReducer(initialState, { type: 'PREV_STEP' });

      expect(newState).toBe(initialState);
    });
  });
});
```

**Verification Steps:**

- [ ] All navigation tests pass
- [ ] GO_TO_STEP validation works correctly
- [ ] NEXT_STEP uses skip logic
- [ ] PREV_STEP handles empty history gracefully

---

### Task 1.2.16: Write Unit Tests for Reducer Selection and Content Actions

**Estimated Effort:** ~1 hour
**Story Points:** 1

**Description:**
Write unit tests for selection and content action handlers.

**Code:**

```typescript
// Add to existing test file:

describe('workflowReducer - Selection', () => {
  describe('SELECT_ROOM', () => {
    it('initializes currentItem with room', () => {
      const newState = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });

      expect(newState.currentItem?.room).toBe('kitchen');
      expect(newState.currentItem?.itemType).toBeNull();
      expect(newState.isDirty).toBe(true);
    });

    it('sets itemType to general-info for general room', () => {
      const newState = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'general',
      });

      expect(newState.currentItem?.room).toBe('general');
      expect(newState.currentItem?.itemType).toBe('general-info');
    });
  });

  describe('SELECT_SPECIFIC_ITEM', () => {
    it('auto-generates itemName', () => {
      const initialState = {
        ...createInitialState(),
        currentItem: {
          room: 'kitchen' as const,
          itemType: 'appliance' as const,
          specificItem: '',
          itemName: '',
          contentSource: 'existing' as const,
          contentType: null,
          content: [],
        },
      };

      const newState = workflowReducer(initialState, {
        type: 'SELECT_SPECIFIC_ITEM',
        payload: 'Refrigerator',
      });

      expect(newState.currentItem?.specificItem).toBe('Refrigerator');
      expect(newState.currentItem?.itemName).toBe('Kitchen - Refrigerator');
    });
  });
});

describe('workflowReducer - Content', () => {
  describe('ADD_CONTENT_PIECE', () => {
    it('appends content piece to array', () => {
      const initialState = {
        ...createInitialState(),
        currentItem: {
          room: 'kitchen' as const,
          itemType: 'appliance' as const,
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'existing' as const,
          contentType: 'video' as const,
          content: [],
        },
      };

      const piece = {
        id: 'piece-1',
        type: 'video' as const,
        data: { type: 'video' as const, file: new Blob() },
        order: 0,
      };

      const newState = workflowReducer(initialState, {
        type: 'ADD_CONTENT_PIECE',
        payload: piece,
      });

      expect(newState.currentItem?.content).toHaveLength(1);
      expect(newState.currentItem?.content[0].id).toBe('piece-1');
    });
  });

  describe('REORDER_CONTENT', () => {
    it('reorders and updates order property', () => {
      const initialState = {
        ...createInitialState(),
        currentItem: {
          room: 'kitchen' as const,
          itemType: 'appliance' as const,
          specificItem: 'Fridge',
          itemName: 'Kitchen - Fridge',
          contentSource: 'existing' as const,
          contentType: 'video' as const,
          content: [
            { id: 'a', type: 'video' as const, data: { type: 'video' as const, file: new Blob() }, order: 0 },
            { id: 'b', type: 'photo' as const, data: { type: 'photo' as const, file: new Blob() }, order: 1 },
            { id: 'c', type: 'text' as const, data: { type: 'text' as const, text: 'Hello' }, order: 2 },
          ],
        },
      };

      const newState = workflowReducer(initialState, {
        type: 'REORDER_CONTENT',
        payload: { fromIndex: 0, toIndex: 2 },
      });

      expect(newState.currentItem?.content[0].id).toBe('b');
      expect(newState.currentItem?.content[1].id).toBe('c');
      expect(newState.currentItem?.content[2].id).toBe('a');
      expect(newState.currentItem?.content[0].order).toBe(0);
      expect(newState.currentItem?.content[1].order).toBe(1);
      expect(newState.currentItem?.content[2].order).toBe(2);
    });
  });
});
```

**Verification Steps:**

- [ ] Selection action tests pass
- [ ] Content action tests pass
- [ ] Auto-name generation tested
- [ ] Reorder logic verified

---

### Task 1.2.17: Write Unit Tests for Computed Values

**Estimated Effort:** ~45 minutes
**Story Points:** 0.5

**Description:**
Write unit tests for the computed values returned by the hook.

**Code:**

```typescript
// Add to existing test file:
import { renderHook, act } from '@testing-library/react';
import { useWorkflowState } from '../useWorkflowState';

describe('useWorkflowState - Computed Values', () => {
  describe('canGoNext', () => {
    it('returns false at room-selection without room selected', () => {
      const { result } = renderHook(() => useWorkflowState());
      expect(result.current.canGoNext).toBe(false);
    });

    it('returns true at room-selection with room selected', () => {
      const { result } = renderHook(() => useWorkflowState());
      act(() => {
        result.current.selectRoom('kitchen');
      });
      expect(result.current.canGoNext).toBe(true);
    });

    it('returns false at session-summary', () => {
      const { result } = renderHook(() => useWorkflowState());
      act(() => {
        result.current.goToStep('session-summary');
      });
      expect(result.current.canGoNext).toBe(false);
    });
  });

  describe('progressPercent', () => {
    it('returns 10 at room-selection', () => {
      const { result } = renderHook(() => useWorkflowState());
      expect(result.current.progressPercent).toBe(10);
    });

    it('returns 100 at session-summary', () => {
      const { result } = renderHook(() => useWorkflowState());
      act(() => {
        // Navigate to session-summary
        result.current.selectRoom('kitchen');
        // ... continue navigation
      });
      // After completing navigation, check progress
    });
  });

  describe('itemCount', () => {
    it('starts at 0', () => {
      const { result } = renderHook(() => useWorkflowState());
      expect(result.current.itemCount).toBe(0);
    });
  });
});
```

**Verification Steps:**

- [ ] Computed value tests pass
- [ ] canGoNext tested for multiple scenarios
- [ ] progressPercent tested against PROGRESS_WEIGHTS

---

## Summary Checklist

### All Tasks

| Task | Description | Story Points | Status |
|------|-------------|--------------|--------|
| 1.2.1 | Create Hook File Skeleton with Imports | 0.5 | [ ] |
| 1.2.2 | Define Step Transitions Map | 0.5 | [ ] |
| 1.2.3 | Implement createInitialState Factory | 0.5 | [ ] |
| 1.2.4 | Implement Step Skipping Logic Helpers | 0.5 | [ ] |
| 1.2.5 | Implement Navigation Actions in Reducer | 1 | [ ] |
| 1.2.6 | Implement Selection Actions in Reducer | 1 | [ ] |
| 1.2.7 | Implement Content Actions in Reducer | 1 | [ ] |
| 1.2.8 | Implement Session Management Actions | 0.5 | [ ] |
| 1.2.9 | Implement Error and Reset Actions | 0.5 | [ ] |
| 1.2.10 | Define Hook Return Interface | 0.5 | [ ] |
| 1.2.11 | Implement Main Hook with useCallback Actions | 1 | [ ] |
| 1.2.12 | Implement Computed Values with useMemo | 0.5 | [ ] |
| 1.2.13 | Update Barrel Exports | 0.25 | [ ] |
| 1.2.14 | Write Unit Tests for createInitialState and Helpers | 1 | [ ] |
| 1.2.15 | Write Unit Tests for Navigation Actions | 1 | [ ] |
| 1.2.16 | Write Unit Tests for Selection and Content Actions | 1 | [ ] |
| 1.2.17 | Write Unit Tests for Computed Values | 0.5 | [ ] |

**Total Estimated Story Points:** ~11.25

### Acceptance Criteria Summary

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
- [ ] All unit tests pass
- [ ] Code follows established naming conventions and patterns

---

## Dependencies and Blocking

### This Task Depends On

- **REQ-093 Task 1.1** (Component Scaffold & Type Definitions) - COMPLETED

### This Task Blocks

- **Task 1.3** (Main Workflow Component) - Requires useWorkflowState hook
- **Task 1.4** (Session Persistence) - Requires WorkflowState type and hook integration

---

## References

- [Implementation Overview](docs/REQ-094-workflow-state-machine-overview.md)
- [Implementation Plan](docs/prd/Plan-093-Item-Creation-Workflow.md)
- [ItemCapture State Hook Pattern](src/components/ItemCapture/hooks/useItemCaptureState.ts)
- [ItemManager State Hook Pattern](src/components/ItemManager/hooks/useItemManagerState.ts)
- [ItemCreationWorkflow Types](src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)
- [ItemCreationWorkflow Constants](src/components/ItemCreationWorkflow/utils/constants.ts)

---

*Detailed Task Breakdown generated on 2026-01-05 01:57:53 UTC for REQ-094: Workflow State Machine*
