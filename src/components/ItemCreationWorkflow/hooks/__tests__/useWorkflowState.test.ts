/**
 * Unit Tests for useWorkflowState Hook
 *
 * Tests the pure functions (reducer, helper functions, factory) that don't require
 * React Testing Library. Includes comprehensive tests for state management, navigation,
 * content management, session handling, and large session edge cases.
 *
 * @module ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-05 (REQ-115 - Added large session handling tests)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createInitialState,
  shouldSkipItemType,
  getNextStep,
  STEP_TRANSITIONS,
  workflowReducer,
} from '../useWorkflowState';
import type { WorkflowState, SessionItem, ContentPiece } from '../../ItemCreationWorkflow.types';

// =============================================================================
// createInitialState Tests
// =============================================================================

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
    expect(state.session.currentStep).toBe('room-selection');
  });
});

// =============================================================================
// shouldSkipItemType Tests
// =============================================================================

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

  it('returns false for other rooms', () => {
    const rooms = ['bedroom', 'bathroom', 'living-room', 'garage', 'outdoor', 'laundry', 'other'];
    rooms.forEach(room => {
      const state = {
        ...createInitialState(),
        currentItem: { room },
      } as WorkflowState;
      expect(shouldSkipItemType(state)).toBe(false);
    });
  });

  it('returns false when currentItem is null', () => {
    const state = createInitialState();
    expect(shouldSkipItemType(state)).toBe(false);
  });
});

// =============================================================================
// getNextStep Tests
// =============================================================================

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
    expect(getNextStep('content-source-selection', state)).toBe('content-type-selection');
    expect(getNextStep('content-type-selection', state)).toBe('content-creation');
    expect(getNextStep('content-creation', state)).toBe('preview-save');
    expect(getNextStep('preview-save', state)).toBe('next-action');
  });
});

// =============================================================================
// STEP_TRANSITIONS Tests
// =============================================================================

describe('STEP_TRANSITIONS', () => {
  it('covers all 9 workflow steps', () => {
    const steps = Object.keys(STEP_TRANSITIONS);
    expect(steps).toHaveLength(9);
    expect(steps).toContain('room-selection');
    expect(steps).toContain('item-type-selection');
    expect(steps).toContain('specific-item-selection');
    expect(steps).toContain('content-source-selection');
    expect(steps).toContain('content-type-selection');
    expect(steps).toContain('content-creation');
    expect(steps).toContain('preview-save');
    expect(steps).toContain('next-action');
    expect(steps).toContain('session-summary');
  });

  it('session-summary has no transitions (terminal)', () => {
    expect(STEP_TRANSITIONS['session-summary']).toEqual([]);
  });

  it('room-selection can go to item-type or specific-item (conditional)', () => {
    expect(STEP_TRANSITIONS['room-selection']).toContain('item-type-selection');
    expect(STEP_TRANSITIONS['room-selection']).toContain('specific-item-selection');
  });

  it('next-action can go to room-selection or session-summary', () => {
    expect(STEP_TRANSITIONS['next-action']).toContain('room-selection');
    expect(STEP_TRANSITIONS['next-action']).toContain('session-summary');
  });
});

// =============================================================================
// Reducer Navigation Tests
// =============================================================================

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
      expect(newState.session.currentStep).toBe('item-type-selection');
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
      const initialState: WorkflowState = {
        ...createInitialState(),
        currentStep: 'content-source-selection',
        stepHistory: ['room-selection', 'item-type-selection', 'specific-item-selection'],
      };

      const newState = workflowReducer(initialState, {
        type: 'GO_TO_STEP',
        payload: 'item-type-selection',
      });

      expect(newState.currentStep).toBe('item-type-selection');
      expect(newState.stepHistory).toEqual(['room-selection']);
      expect(newState.canGoBack).toBe(true);
    });

    it('truncates history when navigating back', () => {
      const initialState: WorkflowState = {
        ...createInitialState(),
        currentStep: 'preview-save',
        stepHistory: ['room-selection', 'item-type-selection', 'specific-item-selection', 'content-source-selection', 'content-type-selection', 'content-creation'],
      };

      const newState = workflowReducer(initialState, {
        type: 'GO_TO_STEP',
        payload: 'room-selection',
      });

      expect(newState.currentStep).toBe('room-selection');
      expect(newState.stepHistory).toEqual([]);
      expect(newState.canGoBack).toBe(false);
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

    it('does nothing when no automatic next step', () => {
      const initialState: WorkflowState = {
        ...createInitialState(),
        currentStep: 'next-action',
      };
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const newState = workflowReducer(initialState, { type: 'NEXT_STEP' });

      expect(newState).toBe(initialState);
      consoleSpy.mockRestore();
    });
  });

  describe('PREV_STEP', () => {
    it('pops from history correctly', () => {
      const initialState: WorkflowState = {
        ...createInitialState(),
        currentStep: 'item-type-selection',
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

    it('updates session.currentStep', () => {
      const initialState: WorkflowState = {
        ...createInitialState(),
        currentStep: 'item-type-selection',
        stepHistory: ['room-selection'],
      };

      const newState = workflowReducer(initialState, { type: 'PREV_STEP' });

      expect(newState.session.currentStep).toBe('room-selection');
    });
  });
});

// =============================================================================
// Reducer Selection Tests
// =============================================================================

describe('workflowReducer - Selection', () => {
  describe('SELECT_ROOM', () => {
    it('initializes currentItem with room', () => {
      const newState = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });

      expect(newState.currentItem?.room).toBe('kitchen');
      expect(newState.currentItem?.itemType).toBeNull();
      expect(newState.currentItem?.specificItem).toBe('');
      expect(newState.currentItem?.itemName).toBe('');
      expect(newState.currentItem?.contentSource).toBe('existing');
      expect(newState.currentItem?.contentType).toBeNull();
      expect(newState.currentItem?.content).toEqual([]);
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

    it('syncs currentItem to session.currentItem', () => {
      const newState = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'bathroom',
      });

      expect(newState.session.currentItem?.room).toBe('bathroom');
    });
  });

  describe('SELECT_ITEM_TYPE', () => {
    it('updates itemType when currentItem exists', () => {
      const initialState = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });

      const newState = workflowReducer(initialState, {
        type: 'SELECT_ITEM_TYPE',
        payload: 'appliance',
      });

      expect(newState.currentItem?.itemType).toBe('appliance');
      expect(newState.isDirty).toBe(true);
    });

    it('returns state unchanged when currentItem is null', () => {
      const initialState = createInitialState();

      const newState = workflowReducer(initialState, {
        type: 'SELECT_ITEM_TYPE',
        payload: 'appliance',
      });

      expect(newState).toBe(initialState);
    });
  });

  describe('SELECT_SPECIFIC_ITEM', () => {
    it('auto-generates itemName', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });
      state = workflowReducer(state, {
        type: 'SELECT_ITEM_TYPE',
        payload: 'appliance',
      });

      const newState = workflowReducer(state, {
        type: 'SELECT_SPECIFIC_ITEM',
        payload: 'Refrigerator',
      });

      expect(newState.currentItem?.specificItem).toBe('Refrigerator');
      expect(newState.currentItem?.itemName).toBe('Kitchen - Refrigerator');
    });

    it('uses ROOM_LABELS for auto-name generation', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'living-room',
      });

      const newState = workflowReducer(state, {
        type: 'SELECT_SPECIFIC_ITEM',
        payload: 'TV',
      });

      expect(newState.currentItem?.itemName).toBe('Living Room - TV');
    });
  });

  describe('SET_ITEM_NAME', () => {
    it('allows custom name override', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });
      state = workflowReducer(state, {
        type: 'SELECT_SPECIFIC_ITEM',
        payload: 'Fridge',
      });

      const newState = workflowReducer(state, {
        type: 'SET_ITEM_NAME',
        payload: 'My Custom Fridge Name',
      });

      expect(newState.currentItem?.itemName).toBe('My Custom Fridge Name');
      expect(newState.isDirty).toBe(true);
    });
  });
});

// =============================================================================
// Reducer Content Tests
// =============================================================================

describe('workflowReducer - Content', () => {
  const mockContentPiece: ContentPiece = {
    id: 'piece-1',
    type: 'video',
    data: { type: 'video', file: new Blob() },
    order: 0,
  };

  const setupWithContent = () => {
    let state = workflowReducer(createInitialState(), {
      type: 'SELECT_ROOM',
      payload: 'kitchen',
    });
    state = workflowReducer(state, {
      type: 'SELECT_CONTENT_SOURCE',
      payload: 'existing',
    });
    state = workflowReducer(state, {
      type: 'SELECT_CONTENT_TYPE',
      payload: 'video',
    });
    return state;
  };

  describe('SELECT_CONTENT_SOURCE', () => {
    it('updates contentSource and resets contentType', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });
      state = workflowReducer(state, {
        type: 'SELECT_CONTENT_TYPE',
        payload: 'video',
      });

      const newState = workflowReducer(state, {
        type: 'SELECT_CONTENT_SOURCE',
        payload: 'create-new',
      });

      expect(newState.currentItem?.contentSource).toBe('create-new');
      expect(newState.currentItem?.contentType).toBeNull();
    });
  });

  describe('SELECT_CONTENT_TYPE', () => {
    it('updates contentType', () => {
      const state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });

      const newState = workflowReducer(state, {
        type: 'SELECT_CONTENT_TYPE',
        payload: 'photo',
      });

      expect(newState.currentItem?.contentType).toBe('photo');
    });
  });

  describe('ADD_CONTENT_PIECE', () => {
    it('appends content piece to array', () => {
      const state = setupWithContent();

      const newState = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: mockContentPiece,
      });

      expect(newState.currentItem?.content).toHaveLength(1);
      expect(newState.currentItem?.content[0].id).toBe('piece-1');
    });

    it('does not mutate original array', () => {
      const state = setupWithContent();
      const originalContent = state.currentItem!.content;

      workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: mockContentPiece,
      });

      expect(originalContent).toHaveLength(0);
    });
  });

  describe('REMOVE_CONTENT_PIECE', () => {
    it('filters out piece by ID', () => {
      let state = setupWithContent();
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: mockContentPiece,
      });
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: { ...mockContentPiece, id: 'piece-2' },
      });

      const newState = workflowReducer(state, {
        type: 'REMOVE_CONTENT_PIECE',
        payload: 'piece-1',
      });

      expect(newState.currentItem?.content).toHaveLength(1);
      expect(newState.currentItem?.content[0].id).toBe('piece-2');
    });
  });

  describe('REORDER_CONTENT', () => {
    it('reorders and updates order property', () => {
      let state = setupWithContent();
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: { ...mockContentPiece, id: 'a', order: 0 },
      });
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: { ...mockContentPiece, id: 'b', type: 'photo', order: 1 },
      });
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: { ...mockContentPiece, id: 'c', type: 'text', order: 2 },
      });

      const newState = workflowReducer(state, {
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

    it('validates index bounds', () => {
      let state = setupWithContent();
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: mockContentPiece,
      });

      const invalidReorder = workflowReducer(state, {
        type: 'REORDER_CONTENT',
        payload: { fromIndex: -1, toIndex: 0 },
      });

      expect(invalidReorder).toBe(state);

      const outOfBounds = workflowReducer(state, {
        type: 'REORDER_CONTENT',
        payload: { fromIndex: 0, toIndex: 5 },
      });

      expect(outOfBounds).toBe(state);
    });
  });
});

// =============================================================================
// Reducer Session Management Tests
// =============================================================================

describe('workflowReducer - Session Management', () => {
  const mockSessionItem: SessionItem = {
    id: 'item-1',
    name: 'Kitchen - Fridge',
    room: 'kitchen',
    itemType: 'appliance',
    content: [],
    createdAt: new Date(),
  };

  describe('SAVE_ITEM', () => {
    it('appends to session.items array', () => {
      const state = createInitialState();

      const newState = workflowReducer(state, {
        type: 'SAVE_ITEM',
        payload: mockSessionItem,
      });

      expect(newState.session.items).toHaveLength(1);
      expect(newState.session.items[0].id).toBe('item-1');
    });

    it('clears currentItem in both state and session', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });

      const newState = workflowReducer(state, {
        type: 'SAVE_ITEM',
        payload: mockSessionItem,
      });

      expect(newState.currentItem).toBeNull();
      expect(newState.session.currentItem).toBeNull();
    });

    it('sets isDirty to false', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });
      expect(state.isDirty).toBe(true);

      const newState = workflowReducer(state, {
        type: 'SAVE_ITEM',
        payload: mockSessionItem,
      });

      expect(newState.isDirty).toBe(false);
    });
  });

  describe('START_NEW_ITEM', () => {
    it('resets to room-selection step', () => {
      const state: WorkflowState = {
        ...createInitialState(),
        currentStep: 'content-creation',
        stepHistory: ['room-selection', 'item-type-selection'],
      };

      const newState = workflowReducer(state, { type: 'START_NEW_ITEM' });

      expect(newState.currentStep).toBe('room-selection');
      expect(newState.session.currentStep).toBe('room-selection');
    });

    it('clears stepHistory and errors', () => {
      const state: WorkflowState = {
        ...createInitialState(),
        currentStep: 'content-creation',
        stepHistory: ['room-selection', 'item-type-selection'],
        errors: { someField: 'error' },
      };

      const newState = workflowReducer(state, { type: 'START_NEW_ITEM' });

      expect(newState.stepHistory).toEqual([]);
      expect(newState.errors).toEqual({});
      expect(newState.canGoBack).toBe(false);
    });

    it('clears currentItem', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });

      const newState = workflowReducer(state, { type: 'START_NEW_ITEM' });

      expect(newState.currentItem).toBeNull();
      expect(newState.session.currentItem).toBeNull();
    });
  });

  describe('COMPLETE_SESSION', () => {
    it('navigates to session-summary', () => {
      const state: WorkflowState = {
        ...createInitialState(),
        currentStep: 'next-action',
      };

      const newState = workflowReducer(state, { type: 'COMPLETE_SESSION' });

      expect(newState.currentStep).toBe('session-summary');
      expect(newState.session.currentStep).toBe('session-summary');
    });

    it('preserves history for back navigation', () => {
      const state: WorkflowState = {
        ...createInitialState(),
        currentStep: 'next-action',
        stepHistory: ['room-selection'],
      };

      const newState = workflowReducer(state, { type: 'COMPLETE_SESSION' });

      expect(newState.stepHistory).toContain('next-action');
      expect(newState.canGoBack).toBe(true);
    });
  });
});

// =============================================================================
// Reducer Error Handling Tests
// =============================================================================

describe('workflowReducer - Error Handling', () => {
  describe('SET_ERROR', () => {
    it('adds error to errors object', () => {
      const state = createInitialState();

      const newState = workflowReducer(state, {
        type: 'SET_ERROR',
        payload: { field: 'room', message: 'Room is required' },
      });

      expect(newState.errors.room).toBe('Room is required');
    });
  });

  describe('CLEAR_ERROR', () => {
    it('removes specific error key', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SET_ERROR',
        payload: { field: 'room', message: 'Error 1' },
      });
      state = workflowReducer(state, {
        type: 'SET_ERROR',
        payload: { field: 'item', message: 'Error 2' },
      });

      const newState = workflowReducer(state, {
        type: 'CLEAR_ERROR',
        payload: 'room',
      });

      expect(newState.errors.room).toBeUndefined();
      expect(newState.errors.item).toBe('Error 2');
    });
  });

  describe('CLEAR_ALL_ERRORS', () => {
    it('resets both errors and submitError', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SET_ERROR',
        payload: { field: 'room', message: 'Error' },
      });
      state = workflowReducer(state, {
        type: 'SUBMIT_ERROR',
        payload: 'Submission failed',
      });

      const newState = workflowReducer(state, { type: 'CLEAR_ALL_ERRORS' });

      expect(newState.errors).toEqual({});
      expect(newState.submitError).toBeNull();
    });
  });

  describe('SET_SUBMITTING', () => {
    it('updates isSubmitting correctly', () => {
      const state = createInitialState();

      const submitting = workflowReducer(state, {
        type: 'SET_SUBMITTING',
        payload: true,
      });
      expect(submitting.isSubmitting).toBe(true);

      const notSubmitting = workflowReducer(submitting, {
        type: 'SET_SUBMITTING',
        payload: false,
      });
      expect(notSubmitting.isSubmitting).toBe(false);
    });
  });

  describe('SUBMIT_ERROR', () => {
    it('sets isSubmitting to false and sets error', () => {
      const state: WorkflowState = {
        ...createInitialState(),
        isSubmitting: true,
      };

      const newState = workflowReducer(state, {
        type: 'SUBMIT_ERROR',
        payload: 'Network error',
      });

      expect(newState.isSubmitting).toBe(false);
      expect(newState.submitError).toBe('Network error');
    });
  });

  describe('RESET', () => {
    it('returns completely fresh state with new session ID', () => {
      let state = workflowReducer(createInitialState(), {
        type: 'SELECT_ROOM',
        payload: 'kitchen',
      });
      const originalSessionId = state.session.id;

      const newState = workflowReducer(state, { type: 'RESET' });

      expect(newState.currentStep).toBe('room-selection');
      expect(newState.currentItem).toBeNull();
      expect(newState.session.id).not.toBe(originalSessionId);
    });
  });
});

// =============================================================================
// Large Session Handling Tests (REQ-115)
// =============================================================================

describe('workflowReducer - Large Session Handling', () => {
  const MAX_ITEMS = 50; // Matches WORKFLOW_CONFIG_DEFAULTS.maxItemsPerSession

  /**
   * Creates a workflow state with the specified number of session items.
   */
  const createSessionWithItems = (count: number): WorkflowState => {
    const items: SessionItem[] = Array.from({ length: count }, (_, i) => ({
      id: `item-${i}`,
      name: `Test Item ${i}`,
      room: 'kitchen',
      itemType: 'appliance',
      content: [],
      createdAt: new Date(),
    }));

    return {
      ...createInitialState(),
      session: {
        ...createInitialState().session,
        items,
      },
    };
  };

  describe('session item capacity', () => {
    it('allows saving items up to one below session limit (49 items)', () => {
      const state = createSessionWithItems(49);

      expect(state.session.items).toHaveLength(49);

      const newItem: SessionItem = {
        id: 'item-49',
        name: 'Item 49',
        room: 'kitchen',
        itemType: 'appliance',
        content: [],
        createdAt: new Date(),
      };

      const newState = workflowReducer(state, {
        type: 'SAVE_ITEM',
        payload: newItem,
      });

      expect(newState.session.items).toHaveLength(50);
      expect(newState.session.items[49].id).toBe('item-49');
    });

    it('handles session at maximum capacity (50 items)', () => {
      const state = createSessionWithItems(50);

      expect(state.session.items).toHaveLength(50);

      // Verify all 50 items have unique IDs
      const uniqueIds = new Set(state.session.items.map(item => item.id));
      expect(uniqueIds.size).toBe(50);
    });

    it('allows navigation actions with large item count', () => {
      const state = createSessionWithItems(50);

      // Navigate to room-selection
      let newState = workflowReducer(state, {
        type: 'NAVIGATE_TO',
        payload: 'room-selection',
      });

      expect(newState.currentStep).toBe('room-selection');
      expect(newState.session.items).toHaveLength(50);

      // Select a room - should still work
      newState = workflowReducer(newState, {
        type: 'SELECT_ROOM',
        payload: 'bedroom',
      });

      expect(newState.currentItem?.room).toBe('bedroom');
      expect(newState.session.items).toHaveLength(50);
    });
  });

  describe('reducer performance with large sessions', () => {
    it('maintains performance with 50 items for state transitions', () => {
      const state = createSessionWithItems(50);
      const startTime = performance.now();

      // Perform multiple reducer actions
      let newState = state;
      for (let i = 0; i < 10; i++) {
        newState = workflowReducer(newState, { type: 'START_NEW_ITEM' });
        newState = workflowReducer(newState, { type: 'SELECT_ROOM', payload: 'kitchen' });
        newState = workflowReducer(newState, { type: 'GO_BACK' });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (1 second for 30 operations)
      expect(duration).toBeLessThan(1000);

      // State should still be valid
      expect(newState.session.items).toHaveLength(50);
    });
  });

  describe('session state consistency', () => {
    it('preserves all items after multiple state changes', () => {
      let state = createSessionWithItems(50);

      // Perform various state operations
      state = workflowReducer(state, { type: 'START_NEW_ITEM' });
      state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'bathroom' });
      state = workflowReducer(state, { type: 'GO_BACK' });
      state = workflowReducer(state, { type: 'COMPLETE_SESSION' });
      state = workflowReducer(state, { type: 'GO_BACK' });

      // All 50 original items should still exist
      expect(state.session.items).toHaveLength(50);
    });

    it('correctly updates session.currentItem independently of session.items', () => {
      const state = createSessionWithItems(50);

      const newState = workflowReducer(state, {
        type: 'SELECT_ROOM',
        payload: 'outdoor',
      });

      // currentItem should be set
      expect(newState.currentItem?.room).toBe('outdoor');
      expect(newState.session.currentItem?.room).toBe('outdoor');

      // Saved items should be unchanged
      expect(newState.session.items).toHaveLength(50);
      expect(newState.session.items[0].room).toBe('kitchen');
    });
  });

  describe('boundary conditions', () => {
    it('handles 0 items gracefully', () => {
      const state = createSessionWithItems(0);

      expect(state.session.items).toHaveLength(0);

      const newState = workflowReducer(state, { type: 'COMPLETE_SESSION' });

      expect(newState.currentStep).toBe('session-summary');
      expect(newState.session.items).toHaveLength(0);
    });

    it('handles 1 item correctly', () => {
      const state = createSessionWithItems(1);

      expect(state.session.items).toHaveLength(1);

      const newState = workflowReducer(state, { type: 'COMPLETE_SESSION' });

      expect(newState.currentStep).toBe('session-summary');
      expect(newState.session.items).toHaveLength(1);
    });

    it('handles session at 49 items (one below max)', () => {
      const state = createSessionWithItems(49);

      expect(state.session.items).toHaveLength(49);

      // Can add one more item
      const newItem: SessionItem = {
        id: 'new-item',
        name: 'New Item',
        room: 'kitchen',
        itemType: 'appliance',
        content: [],
        createdAt: new Date(),
      };

      const newState = workflowReducer(state, {
        type: 'SAVE_ITEM',
        payload: newItem,
      });

      expect(newState.session.items).toHaveLength(50);
    });
  });
});
