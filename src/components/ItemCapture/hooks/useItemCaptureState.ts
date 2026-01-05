'use client';

/**
 * useItemCaptureState - Core state machine hook for ItemCapture wizard
 *
 * This hook manages all state for the multi-step ItemCapture wizard flow,
 * including navigation, form data, media items, validation, and resource states.
 *
 * @module ItemCapture/hooks/useItemCaptureState
 * @see docs/REQ-032-implement-core-state-machine-hook-detailed.md
 * @lastModified 2026-01-05 (REQ-092 Task 5 - Added URL support)
 */

import { useReducer, useCallback, useMemo, useEffect } from 'react';
import type {
  WizardStep,
  ItemMetadata,
  MediaItem,
  UrlItem,
  ItemCaptureState,
  ItemCaptureAction,
} from '../ItemCapture.types';
import { revokeAllTrackedURLs, setURLManagerDebug } from '../utils/urlManager';

// =============================================================================
// Step Transitions
// =============================================================================

/**
 * Valid transitions from each step.
 * Used to validate GO_TO_STEP actions.
 */
export const STEP_TRANSITIONS: Record<WizardStep, WizardStep[]> = {
  'metadata': ['content-type'],
  'content-type': ['capture-video', 'capture-photo', 'upload-file', 'write-text', 'add-url'],
  'capture-video': ['edit-media', 'add-more'],
  'capture-photo': ['edit-media', 'add-more'],
  'upload-file': ['edit-media', 'add-more'],
  'write-text': ['add-more', 'review'],
  'add-url': ['add-more', 'review'],
  'edit-media': ['add-more', 'review'],
  'add-more': ['content-type', 'review'],
  'review': ['metadata', 'content-type'],
};

// =============================================================================
// Initial State
// =============================================================================

/**
 * Factory function to create fresh initial state.
 * Used by reducer RESET action and hook initialization.
 */
export const createInitialState = (): ItemCaptureState => ({
  currentStep: 'metadata',
  stepHistory: [],
  metadata: {
    title: '',
    location: '',
    tags: [],
    applianceType: undefined,
  },
  mediaItems: [],
  urlItems: [],
  instructions: '',
  errors: {},
  isRecording: false,
  isCameraActive: false,
  isSubmitting: false,
  submitError: null,
  isDirty: false,
});

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates metadata before allowing navigation from metadata step.
 * @returns Empty object if valid, field-keyed errors if invalid
 */
export function validateMetadata(metadata: ItemMetadata): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!metadata.title.trim()) {
    errors.title = 'Title is required';
  } else if (metadata.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  return errors;
}

/**
 * Determines if the current state allows submission.
 * Requires title + at least one content item (media, URL, or text).
 */
export function canSubmitState(state: ItemCaptureState): boolean {
  if (!state.metadata.title.trim()) return false;
  if (state.mediaItems.length === 0 && state.urlItems.length === 0 && !state.instructions.trim()) return false;
  return true;
}

/**
 * Gets the next step in the wizard flow based on current step.
 * Returns null if no automatic next step exists.
 */
export function getNextStep(currentStep: WizardStep, _state: ItemCaptureState): WizardStep | null {
  const transitions = STEP_TRANSITIONS[currentStep];
  if (!transitions || transitions.length === 0) return null;

  // For steps with single transition, return it
  if (transitions.length === 1) return transitions[0];

  // For content-type step, caller must specify destination
  return null;
}

/**
 * Validates whether a step transition is allowed.
 * Returns validation errors or null if valid.
 */
export function validateStepTransition(
  fromStep: WizardStep,
  toStep: WizardStep,
  state: ItemCaptureState
): Record<string, string> | null {
  // Validate metadata step requirements
  if (fromStep === 'metadata') {
    const metadataErrors = validateMetadata(state.metadata);
    if (Object.keys(metadataErrors).length > 0) {
      return metadataErrors;
    }
  }

  // Validate capture steps - must have captured content
  if (fromStep === 'capture-video' && toStep !== 'metadata') {
    const hasVideo = state.mediaItems.some(m => m.type === 'video');
    if (!hasVideo) {
      return { media: 'Please capture a video before continuing' };
    }
  }

  if (fromStep === 'capture-photo' && toStep !== 'metadata') {
    const hasImage = state.mediaItems.some(m => m.type === 'image');
    if (!hasImage) {
      return { media: 'Please capture a photo before continuing' };
    }
  }

  // Allow transition to toStep
  void toStep; // Mark as used
  return null;
}

// =============================================================================
// Reducer
// =============================================================================

function itemCaptureReducer(
  state: ItemCaptureState,
  action: ItemCaptureAction
): ItemCaptureState {
  switch (action.type) {
    // =========================================================================
    // Navigation Actions
    // =========================================================================
    case 'GO_TO_STEP': {
      const validTransitions = STEP_TRANSITIONS[state.currentStep];
      // Allow going to any step from review for editing
      const isFromReview = state.currentStep === 'review';
      // Validate transition
      if (!isFromReview && !validTransitions?.includes(action.payload)) {
        console.warn(`Invalid step transition: ${state.currentStep} -> ${action.payload}`);
        return state;
      }
      return {
        ...state,
        currentStep: action.payload,
        stepHistory: [...state.stepHistory, state.currentStep],
      };
    }

    case 'NEXT_STEP': {
      const nextStep = getNextStep(state.currentStep, state);
      if (!nextStep) {
        console.warn(`No automatic next step from: ${state.currentStep}`);
        return state;
      }
      // Validate before transition
      const errors = validateStepTransition(state.currentStep, nextStep, state);
      if (errors) {
        return { ...state, errors: { ...state.errors, ...errors } };
      }
      return {
        ...state,
        currentStep: nextStep,
        stepHistory: [...state.stepHistory, state.currentStep],
        errors: {},
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
      };
    }

    // =========================================================================
    // Data Mutation Actions
    // =========================================================================
    case 'SET_METADATA': {
      // Clear errors for updated fields
      const clearedErrors = { ...state.errors };
      Object.keys(action.payload).forEach(key => {
        delete clearedErrors[key];
      });
      return {
        ...state,
        metadata: { ...state.metadata, ...action.payload },
        errors: clearedErrors,
        isDirty: true,
      };
    }

    case 'ADD_MEDIA':
      return {
        ...state,
        mediaItems: [...state.mediaItems, action.payload],
        isDirty: true,
      };

    case 'REMOVE_MEDIA':
      return {
        ...state,
        mediaItems: state.mediaItems.filter(m => m.id !== action.payload),
        isDirty: true,
      };

    case 'UPDATE_MEDIA':
      return {
        ...state,
        mediaItems: state.mediaItems.map(m =>
          m.id === action.payload.id
            ? { ...m, ...action.payload.updates }
            : m
        ),
        isDirty: true,
      };

    case 'REORDER_MEDIA': {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex < 0 ||
        fromIndex >= state.mediaItems.length ||
        toIndex < 0 ||
        toIndex >= state.mediaItems.length
      ) {
        return state;
      }
      const reordered = [...state.mediaItems];
      const [removed] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, removed);
      // Update order property on each item
      return {
        ...state,
        mediaItems: reordered.map((item, index) => ({ ...item, order: index })),
        isDirty: true,
      };
    }

    case 'SET_INSTRUCTIONS':
      return {
        ...state,
        instructions: action.payload,
        isDirty: true,
      };

    // =========================================================================
    // URL Actions (REQ-092)
    // =========================================================================
    case 'ADD_URL':
      return {
        ...state,
        urlItems: [...state.urlItems, action.payload],
        isDirty: true,
      };

    case 'REMOVE_URL':
      return {
        ...state,
        urlItems: state.urlItems.filter(u => u.id !== action.payload),
        isDirty: true,
      };

    case 'UPDATE_URL':
      return {
        ...state,
        urlItems: state.urlItems.map(u =>
          u.id === action.payload.id
            ? { ...u, ...action.payload.updates }
            : u
        ),
        isDirty: true,
      };

    // =========================================================================
    // Error Actions
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
      };

    // =========================================================================
    // Resource State Actions
    // =========================================================================
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
      };

    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
      };

    case 'ACTIVATE_CAMERA':
      return {
        ...state,
        isCameraActive: true,
      };

    case 'DEACTIVATE_CAMERA':
      return {
        ...state,
        isCameraActive: false,
        isRecording: false, // Also stop recording when camera deactivates
      };

    // =========================================================================
    // Submission Actions
    // =========================================================================
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'SUBMIT':
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      };

    case 'SUBMIT_SUCCESS':
      return createInitialState();

    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        submitError: action.payload,
      };

    case 'RESET':
      return createInitialState();

    // =========================================================================
    // Cleanup Actions (REQ-054)
    // =========================================================================
    case 'CLEANUP_ALL':
      // Revoke all tracked object URLs to prevent memory leaks
      revokeAllTrackedURLs();
      return createInitialState();

    default:
      return state;
  }
}

// =============================================================================
// Hook Return Type
// =============================================================================

export interface UseItemCaptureStateReturn {
  // State
  state: ItemCaptureState;

  // Navigation actions
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Data actions
  setMetadata: (metadata: Partial<ItemMetadata>) => void;
  addMedia: (media: MediaItem) => void;
  removeMedia: (id: string) => void;
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
  reorderMedia: (fromIndex: number, toIndex: number) => void;
  setInstructions: (text: string) => void;

  // URL actions (REQ-092)
  addUrl: (urlItem: UrlItem) => void;
  removeUrl: (id: string) => void;
  updateUrl: (id: string, updates: Partial<UrlItem>) => void;

  // Error actions
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  // Resource actions
  startRecording: () => void;
  stopRecording: () => void;
  activateCamera: () => void;
  deactivateCamera: () => void;

  // Submission
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;

  // Cleanup (REQ-054)
  cleanupAll: () => void;

  // Computed values
  canGoNext: boolean;
  canGoBack: boolean;
  canSubmit: boolean;
  hasUnsavedChanges: boolean;
}

// =============================================================================
// Main Hook
// =============================================================================

export function useItemCaptureState(): UseItemCaptureStateReturn {
  const [state, dispatch] = useReducer(itemCaptureReducer, undefined, createInitialState);

  // Navigation actions
  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  // Data actions
  const setMetadata = useCallback((metadata: Partial<ItemMetadata>) => {
    dispatch({ type: 'SET_METADATA', payload: metadata });
  }, []);

  const addMedia = useCallback((media: MediaItem) => {
    dispatch({ type: 'ADD_MEDIA', payload: media });
  }, []);

  const removeMedia = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MEDIA', payload: id });
  }, []);

  const updateMedia = useCallback((id: string, updates: Partial<MediaItem>) => {
    dispatch({ type: 'UPDATE_MEDIA', payload: { id, updates } });
  }, []);

  const reorderMedia = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_MEDIA', payload: { fromIndex, toIndex } });
  }, []);

  const setInstructions = useCallback((text: string) => {
    dispatch({ type: 'SET_INSTRUCTIONS', payload: text });
  }, []);

  // URL actions (REQ-092)
  const addUrl = useCallback((urlItem: UrlItem) => {
    dispatch({ type: 'ADD_URL', payload: urlItem });
  }, []);

  const removeUrl = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_URL', payload: id });
  }, []);

  const updateUrl = useCallback((id: string, updates: Partial<UrlItem>) => {
    dispatch({ type: 'UPDATE_URL', payload: { id, updates } });
  }, []);

  // Error actions
  const setError = useCallback((field: string, message: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, message } });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: field });
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  // Resource actions
  const startRecording = useCallback(() => {
    dispatch({ type: 'START_RECORDING' });
  }, []);

  const stopRecording = useCallback(() => {
    dispatch({ type: 'STOP_RECORDING' });
  }, []);

  const activateCamera = useCallback(() => {
    dispatch({ type: 'ACTIVATE_CAMERA' });
  }, []);

  const deactivateCamera = useCallback(() => {
    dispatch({ type: 'DEACTIVATE_CAMERA' });
  }, []);

  // Submission
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Cleanup action (REQ-054)
  const cleanupAll = useCallback(() => {
    dispatch({ type: 'CLEANUP_ALL' });
  }, []);

  // Computed values
  const canGoNext = useMemo(() => {
    if (state.currentStep === 'review') return false;
    if (state.currentStep === 'metadata') {
      return validateMetadata(state.metadata).title === undefined;
    }
    return STEP_TRANSITIONS[state.currentStep]?.length > 0;
  }, [state.currentStep, state.metadata]);

  const canGoBack = useMemo(() => {
    return state.stepHistory.length > 0;
  }, [state.stepHistory.length]);

  const canSubmit = useMemo(() => {
    return canSubmitState(state);
  }, [state]);

  const hasUnsavedChanges = useMemo(() => {
    return state.isDirty;
  }, [state.isDirty]);

  return {
    state,
    goToStep,
    nextStep,
    prevStep,
    setMetadata,
    addMedia,
    removeMedia,
    updateMedia,
    reorderMedia,
    setInstructions,
    addUrl,
    removeUrl,
    updateUrl,
    setError,
    clearError,
    clearAllErrors,
    startRecording,
    stopRecording,
    activateCamera,
    deactivateCamera,
    setSubmitting,
    reset,
    cleanupAll,
    canGoNext,
    canGoBack,
    canSubmit,
    hasUnsavedChanges,
  };
}

export default useItemCaptureState;
