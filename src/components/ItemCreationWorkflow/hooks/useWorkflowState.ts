'use client';

/**
 * useWorkflowState - Core state machine hook for ItemCreationWorkflow
 *
 * This hook manages all state for the multi-step ItemCreationWorkflow,
 * including navigation, step history, item creation state, and session management.
 *
 * @module ItemCreationWorkflow/hooks/useWorkflowState
 * @see docs/REQ-094-workflow-state-machine-detailed.md
 * @lastModified 2026-01-05 (REQ-107 Tasks 9-10)
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
} from '../ItemCreationWorkflow.types';
import {
  ROOM_LABELS,
  PROGRESS_WEIGHTS,
  WORKFLOW_STEPS,
} from '../utils/constants';

// =============================================================================
// Step Transitions
// =============================================================================

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
  'next-action': ['room-selection', 'session-summary', 'content-source-selection'],
  'session-summary': [],
};

// =============================================================================
// Initial State
// =============================================================================

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

// =============================================================================
// Helper Functions
// =============================================================================

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

// =============================================================================
// Reducer
// =============================================================================

/**
 * Main reducer function for workflow state management.
 * Handles all workflow actions including navigation, selection, content, and session management.
 */
export function workflowReducer(
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

    // =========================================================================
    // Selection Actions
    // =========================================================================
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
      return {
        ...state,
        currentItem: newItem,
        isDirty: true,
        session: {
          ...state.session,
          currentItem: newItem,
        },
      };
    }

    case 'SELECT_ITEM_TYPE': {
      if (!state.currentItem) return state;
      const updatedItem: CurrentItemState = {
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
      const updatedItem: CurrentItemState = {
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
      const updatedItem: CurrentItemState = {
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

    // =========================================================================
    // Content Actions
    // =========================================================================
    case 'SELECT_CONTENT_SOURCE': {
      if (!state.currentItem) return state;
      const updatedItem: CurrentItemState = {
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
      const updatedItem: CurrentItemState = {
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
      const updatedItem: CurrentItemState = {
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
      const updatedItem: CurrentItemState = {
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

      const updatedItem: CurrentItemState = {
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

    default:
      return state;
  }
}

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
  /** Restore an item and navigate to content-source-selection for adding more content */
  addMoreToItem: (item: CurrentItemState) => void;

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

  const addMoreToItem = useCallback((item: CurrentItemState) => {
    dispatch({ type: 'ADD_MORE_TO_ITEM', payload: item });
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
    addMoreToItem,
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
}

export default useWorkflowState;
