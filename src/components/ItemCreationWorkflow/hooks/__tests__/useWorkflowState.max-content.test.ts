/**
 * useWorkflowState - MAX_CONTENT_PIECES Enforcement Tests
 *
 * Tests specifically for the maximum content pieces limit enforcement
 * in the workflow state management.
 *
 * @module ItemCreationWorkflow/hooks/__tests__/useWorkflowState.max-content
 * @vitest-environment jsdom
 * @see docs/REQ-108-multi-content-item-support-detailed.md
 * @lastModified 2026-01-05 (REQ-115 - Migrated from Jest to Vitest)
 */

import { describe, it, expect, vi } from 'vitest';
import { workflowReducer, createInitialState } from '../useWorkflowState';
import { MAX_CONTENT_PIECES } from '../../utils/constants';
import type { ContentPiece, WorkflowState } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Test Helpers
// =============================================================================

const createContentPiece = (id: string, order: number = 0): ContentPiece => ({
  id,
  type: 'photo',
  data: {
    type: 'photo',
    file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
  },
  order,
});

const createStateWithContent = (count: number): WorkflowState => {
  // Start with initial state
  let state = createInitialState();

  // Select a room to initialize currentItem
  state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });

  // Add content pieces
  for (let i = 0; i < count; i++) {
    state = workflowReducer(state, {
      type: 'ADD_CONTENT_PIECE',
      payload: createContentPiece(`content-${i}`, i),
    });
  }

  return state;
};

// =============================================================================
// Tests
// =============================================================================

describe('useWorkflowState - MAX_CONTENT_PIECES enforcement', () => {
  describe('adding content pieces', () => {
    it('allows adding content up to MAX_CONTENT_PIECES - 1', () => {
      const state = createStateWithContent(MAX_CONTENT_PIECES - 1);

      // Should have MAX_CONTENT_PIECES - 1 pieces
      expect(state.currentItem?.content.length).toBe(MAX_CONTENT_PIECES - 1);
    });

    it('allows adding exactly MAX_CONTENT_PIECES', () => {
      const state = createStateWithContent(MAX_CONTENT_PIECES);

      // Should have MAX_CONTENT_PIECES pieces
      expect(state.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);
    });

    it('allows adding one more piece to reach MAX_CONTENT_PIECES', () => {
      let state = createStateWithContent(MAX_CONTENT_PIECES - 1);

      // Add one more piece
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('last-content', MAX_CONTENT_PIECES - 1),
      });

      expect(state.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);
    });

    it('rejects content beyond MAX_CONTENT_PIECES', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      const state = createStateWithContent(MAX_CONTENT_PIECES);

      // Try to add one more
      const newState = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('extra-content', MAX_CONTENT_PIECES),
      });

      // Count should remain at MAX_CONTENT_PIECES
      expect(newState.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);

      // Console warning should be logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('maximum limit')
      );

      consoleSpy.mockRestore();
    });

    it('returns same state reference when rejecting content', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      const state = createStateWithContent(MAX_CONTENT_PIECES);

      const newState = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('extra-content', MAX_CONTENT_PIECES),
      });

      // Should return exact same state object (referential equality)
      expect(newState).toBe(state);

      consoleSpy.mockRestore();
    });

    it('does not log warning when adding within limit', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      const state = createStateWithContent(MAX_CONTENT_PIECES - 1);

      workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('valid-content', MAX_CONTENT_PIECES - 1),
      });

      // No warning should be logged
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('reordering at max content', () => {
    it('still allows reordering at MAX_CONTENT_PIECES', () => {
      const state = createStateWithContent(MAX_CONTENT_PIECES);

      const newState = workflowReducer(state, {
        type: 'REORDER_CONTENT',
        payload: { fromIndex: 0, toIndex: 5 },
      });

      // Count should remain the same
      expect(newState.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);

      // The first item should now be at index 5
      expect(newState.currentItem?.content[5].id).toBe('content-0');
    });

    it('updates order property on all pieces after reorder', () => {
      const state = createStateWithContent(MAX_CONTENT_PIECES);

      const newState = workflowReducer(state, {
        type: 'REORDER_CONTENT',
        payload: { fromIndex: 0, toIndex: MAX_CONTENT_PIECES - 1 },
      });

      // Each piece should have order matching its index
      newState.currentItem?.content.forEach((piece, index) => {
        expect(piece.order).toBe(index);
      });
    });
  });

  describe('removal at max content', () => {
    it('still allows removal at MAX_CONTENT_PIECES', () => {
      const state = createStateWithContent(MAX_CONTENT_PIECES);

      const newState = workflowReducer(state, {
        type: 'REMOVE_CONTENT_PIECE',
        payload: 'content-0',
      });

      expect(newState.currentItem?.content.length).toBe(MAX_CONTENT_PIECES - 1);
    });

    it('can add new content after removing at limit', () => {
      // Start at max
      let state = createStateWithContent(MAX_CONTENT_PIECES);

      // Remove one
      state = workflowReducer(state, {
        type: 'REMOVE_CONTENT_PIECE',
        payload: 'content-0',
      });

      expect(state.currentItem?.content.length).toBe(MAX_CONTENT_PIECES - 1);

      // Now can add one more
      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('new-content', MAX_CONTENT_PIECES - 1),
      });

      expect(state.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);
    });

    it('removes correct piece by id', () => {
      const state = createStateWithContent(MAX_CONTENT_PIECES);

      const newState = workflowReducer(state, {
        type: 'REMOVE_CONTENT_PIECE',
        payload: 'content-5',
      });

      // content-5 should no longer exist
      const hasContent5 = newState.currentItem?.content.some(c => c.id === 'content-5');
      expect(hasContent5).toBe(false);

      // Other content should still exist
      const hasContent4 = newState.currentItem?.content.some(c => c.id === 'content-4');
      expect(hasContent4).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles adding content to null currentItem gracefully', () => {
      const state = createInitialState();

      // Try to add content without selecting room first
      const newState = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('content-0'),
      });

      // State should be unchanged
      expect(newState).toBe(state);
      expect(newState.currentItem).toBeNull();
    });

    it('MAX_CONTENT_PIECES constant is 10', () => {
      // Verify the constant value as specified in requirements
      expect(MAX_CONTENT_PIECES).toBe(10);
    });

    it('marks state as dirty when content is added', () => {
      let state = createInitialState();
      state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });

      // Reset isDirty
      state = { ...state, isDirty: false };

      // Add content
      const newState = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('content-0'),
      });

      expect(newState.isDirty).toBe(true);
    });

    it('does not mark state as dirty when content is rejected', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      const state = createStateWithContent(MAX_CONTENT_PIECES);
      // Verify we're at max
      expect(state.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);

      // Reset isDirty for testing
      const stateWithDirtyFalse = { ...state, isDirty: false };

      const newState = workflowReducer(stateWithDirtyFalse, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('extra-content'),
      });

      // isDirty should remain false since state didn't change
      expect(newState.isDirty).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('session state synchronization', () => {
    it('updates session.currentItem when content is added', () => {
      let state = createInitialState();
      state = workflowReducer(state, { type: 'SELECT_ROOM', payload: 'kitchen' });

      state = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('content-0'),
      });

      // Both currentItem and session.currentItem should have the content
      expect(state.currentItem?.content.length).toBe(1);
      expect(state.session.currentItem?.content.length).toBe(1);
    });

    it('keeps session.currentItem in sync when content is rejected', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      const state = createStateWithContent(MAX_CONTENT_PIECES);

      const newState = workflowReducer(state, {
        type: 'ADD_CONTENT_PIECE',
        payload: createContentPiece('extra-content'),
      });

      // Both should still have MAX_CONTENT_PIECES
      expect(newState.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);
      expect(newState.session.currentItem?.content.length).toBe(MAX_CONTENT_PIECES);

      consoleSpy.mockRestore();
    });
  });
});
