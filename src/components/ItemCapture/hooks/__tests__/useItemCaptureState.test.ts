/**
 * Unit Tests for useItemCaptureState Hook
 *
 * @module ItemCapture/hooks/__tests__/useItemCaptureState.test
 * @lastModified 2025-12-31 (REQ-032)
 */

import { renderHook, act } from '@testing-library/react';
import {
  useItemCaptureState,
  createInitialState,
  validateMetadata,
  canSubmitState,
  STEP_TRANSITIONS,
} from '../useItemCaptureState';

describe('useItemCaptureState', () => {
  describe('initialization', () => {
    it('returns correct initial state', () => {
      const { result } = renderHook(() => useItemCaptureState());

      expect(result.current.state.currentStep).toBe('metadata');
      expect(result.current.state.stepHistory).toEqual([]);
      expect(result.current.state.metadata.title).toBe('');
      expect(result.current.state.mediaItems).toEqual([]);
      expect(result.current.state.errors).toEqual({});
      expect(result.current.state.isRecording).toBe(false);
      expect(result.current.state.isCameraActive).toBe(false);
      expect(result.current.state.isSubmitting).toBe(false);
      expect(result.current.state.isDirty).toBe(false);
    });

    it('canGoBack is false initially', () => {
      const { result } = renderHook(() => useItemCaptureState());
      expect(result.current.canGoBack).toBe(false);
    });

    it('canSubmit is false initially', () => {
      const { result } = renderHook(() => useItemCaptureState());
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe('metadata actions', () => {
    it('setMetadata updates metadata fields', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setMetadata({ title: 'Test Title' });
      });

      expect(result.current.state.metadata.title).toBe('Test Title');
      expect(result.current.state.isDirty).toBe(true);
    });

    it('setMetadata merges partial metadata', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setMetadata({ title: 'Test Title' });
        result.current.setMetadata({ location: 'Kitchen' });
      });

      expect(result.current.state.metadata.title).toBe('Test Title');
      expect(result.current.state.metadata.location).toBe('Kitchen');
    });

    it('setMetadata clears field errors', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setError('title', 'Title is required');
      });

      expect(result.current.state.errors.title).toBe('Title is required');

      act(() => {
        result.current.setMetadata({ title: 'New Title' });
      });

      expect(result.current.state.errors.title).toBeUndefined();
    });
  });

  describe('navigation', () => {
    it('prevents navigation from metadata without title', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.state.currentStep).toBe('metadata');
      expect(result.current.state.errors.title).toBe('Title is required');
    });

    it('allows navigation from metadata with valid title', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setMetadata({ title: 'Valid Title' });
        result.current.nextStep();
      });

      expect(result.current.state.currentStep).toBe('content-type');
      expect(result.current.state.errors).toEqual({});
    });

    it('prevStep returns to previous step', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setMetadata({ title: 'Test' });
        result.current.nextStep();
      });

      expect(result.current.state.currentStep).toBe('content-type');
      expect(result.current.canGoBack).toBe(true);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.state.currentStep).toBe('metadata');
      expect(result.current.canGoBack).toBe(false);
    });

    it('prevStep does nothing when history is empty', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.state.currentStep).toBe('metadata');
    });

    it('goToStep validates transitions', () => {
      const { result } = renderHook(() => useItemCaptureState());

      // Invalid: metadata -> review is not allowed
      act(() => {
        result.current.goToStep('review');
      });

      expect(result.current.state.currentStep).toBe('metadata');
    });

    it('goToStep allows valid transitions', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.goToStep('content-type');
      });

      expect(result.current.state.currentStep).toBe('content-type');
      expect(result.current.state.stepHistory).toContain('metadata');
    });

    it('goToStep allows any transition from review', () => {
      const { result } = renderHook(() => useItemCaptureState());

      // Navigate to review first
      act(() => {
        result.current.setMetadata({ title: 'Test' });
        result.current.goToStep('content-type');
        result.current.goToStep('write-text');
        result.current.goToStep('review');
      });

      expect(result.current.state.currentStep).toBe('review');

      // Should allow going to any step from review
      act(() => {
        result.current.goToStep('metadata');
      });

      expect(result.current.state.currentStep).toBe('metadata');
    });
  });

  describe('media actions', () => {
    const mockMedia = {
      id: 'test-id',
      type: 'image' as const,
      file: new Blob(['test'], { type: 'image/jpeg' }),
      order: 0,
      metadata: {
        mimeType: 'image/jpeg',
        fileSize: 4,
        source: 'capture' as const,
      },
    };

    it('addMedia appends to mediaItems', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.addMedia(mockMedia);
      });

      expect(result.current.state.mediaItems).toHaveLength(1);
      expect(result.current.state.mediaItems[0].id).toBe('test-id');
      expect(result.current.state.isDirty).toBe(true);
    });

    it('removeMedia filters by id', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.addMedia(mockMedia);
        result.current.removeMedia('test-id');
      });

      expect(result.current.state.mediaItems).toHaveLength(0);
    });

    it('updateMedia updates correct item by id', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.addMedia(mockMedia);
        result.current.updateMedia('test-id', { order: 5 });
      });

      expect(result.current.state.mediaItems[0].order).toBe(5);
    });

    it('reorderMedia moves items correctly', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.addMedia({ ...mockMedia, id: 'item-0', order: 0 });
        result.current.addMedia({ ...mockMedia, id: 'item-1', order: 1 });
        result.current.addMedia({ ...mockMedia, id: 'item-2', order: 2 });
        result.current.reorderMedia(0, 2);
      });

      expect(result.current.state.mediaItems[0].id).toBe('item-1');
      expect(result.current.state.mediaItems[1].id).toBe('item-2');
      expect(result.current.state.mediaItems[2].id).toBe('item-0');
      // Check order properties are updated
      expect(result.current.state.mediaItems[0].order).toBe(0);
      expect(result.current.state.mediaItems[1].order).toBe(1);
      expect(result.current.state.mediaItems[2].order).toBe(2);
    });

    it('reorderMedia validates indices', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.addMedia(mockMedia);
        result.current.reorderMedia(-1, 0);
      });

      // State should remain unchanged with invalid indices
      expect(result.current.state.mediaItems).toHaveLength(1);

      act(() => {
        result.current.reorderMedia(0, 5);
      });

      expect(result.current.state.mediaItems).toHaveLength(1);
    });
  });

  describe('instructions', () => {
    it('setInstructions updates instructions', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setInstructions('Some instructions');
      });

      expect(result.current.state.instructions).toBe('Some instructions');
      expect(result.current.state.isDirty).toBe(true);
    });
  });

  describe('error handling', () => {
    it('setError adds field error', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setError('title', 'Error message');
      });

      expect(result.current.state.errors.title).toBe('Error message');
    });

    it('clearError removes specific error', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setError('title', 'Error 1');
        result.current.setError('location', 'Error 2');
        result.current.clearError('title');
      });

      expect(result.current.state.errors.title).toBeUndefined();
      expect(result.current.state.errors.location).toBe('Error 2');
    });

    it('clearAllErrors removes all errors', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setError('title', 'Error 1');
        result.current.setError('location', 'Error 2');
        result.current.clearAllErrors();
      });

      expect(result.current.state.errors).toEqual({});
    });
  });

  describe('resource states', () => {
    it('tracks recording state', () => {
      const { result } = renderHook(() => useItemCaptureState());

      expect(result.current.state.isRecording).toBe(false);

      act(() => {
        result.current.startRecording();
      });

      expect(result.current.state.isRecording).toBe(true);

      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.state.isRecording).toBe(false);
    });

    it('tracks camera state', () => {
      const { result } = renderHook(() => useItemCaptureState());

      expect(result.current.state.isCameraActive).toBe(false);

      act(() => {
        result.current.activateCamera();
      });

      expect(result.current.state.isCameraActive).toBe(true);

      act(() => {
        result.current.deactivateCamera();
      });

      expect(result.current.state.isCameraActive).toBe(false);
    });

    it('deactivateCamera also stops recording', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.activateCamera();
        result.current.startRecording();
        result.current.deactivateCamera();
      });

      expect(result.current.state.isCameraActive).toBe(false);
      expect(result.current.state.isRecording).toBe(false);
    });
  });

  describe('submission', () => {
    it('setSubmitting updates isSubmitting', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setSubmitting(true);
      });

      expect(result.current.state.isSubmitting).toBe(true);

      act(() => {
        result.current.setSubmitting(false);
      });

      expect(result.current.state.isSubmitting).toBe(false);
    });
  });

  describe('reset', () => {
    it('returns to initial state', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setMetadata({ title: 'Test' });
        result.current.setInstructions('Some instructions');
        result.current.setError('title', 'error');
        result.current.activateCamera();
        result.current.reset();
      });

      expect(result.current.state).toEqual(createInitialState());
    });
  });

  describe('computed values', () => {
    it('canGoNext is true when on metadata with valid title', () => {
      const { result } = renderHook(() => useItemCaptureState());

      expect(result.current.canGoNext).toBe(false);

      act(() => {
        result.current.setMetadata({ title: 'Valid Title' });
      });

      expect(result.current.canGoNext).toBe(true);
    });

    it('canGoNext is false on review step', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setMetadata({ title: 'Test' });
        result.current.goToStep('content-type');
        result.current.goToStep('write-text');
        result.current.goToStep('review');
      });

      expect(result.current.canGoNext).toBe(false);
    });

    it('canSubmit requires title and content', () => {
      const { result } = renderHook(() => useItemCaptureState());

      expect(result.current.canSubmit).toBe(false);

      act(() => {
        result.current.setMetadata({ title: 'Test' });
      });

      expect(result.current.canSubmit).toBe(false);

      act(() => {
        result.current.setInstructions('Some text');
      });

      expect(result.current.canSubmit).toBe(true);
    });

    it('canSubmit is true with title and media', () => {
      const { result } = renderHook(() => useItemCaptureState());

      const mockMedia = {
        id: 'test-id',
        type: 'image' as const,
        file: new Blob(['test'], { type: 'image/jpeg' }),
        order: 0,
        metadata: {
          mimeType: 'image/jpeg',
          fileSize: 4,
          source: 'capture' as const,
        },
      };

      act(() => {
        result.current.setMetadata({ title: 'Test' });
        result.current.addMedia(mockMedia);
      });

      expect(result.current.canSubmit).toBe(true);
    });

    it('hasUnsavedChanges reflects isDirty', () => {
      const { result } = renderHook(() => useItemCaptureState());

      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => {
        result.current.setMetadata({ title: 'Test' });
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });
});

describe('validateMetadata', () => {
  it('returns empty object for valid metadata', () => {
    const errors = validateMetadata({ title: 'Valid', location: '', tags: [] });
    expect(errors).toEqual({});
  });

  it('returns error for empty title', () => {
    const errors = validateMetadata({ title: '', location: '', tags: [] });
    expect(errors.title).toBe('Title is required');
  });

  it('returns error for whitespace-only title', () => {
    const errors = validateMetadata({ title: '   ', location: '', tags: [] });
    expect(errors.title).toBe('Title is required');
  });

  it('returns error for title over 200 chars', () => {
    const longTitle = 'a'.repeat(201);
    const errors = validateMetadata({ title: longTitle, location: '', tags: [] });
    expect(errors.title).toBe('Title must be 200 characters or less');
  });

  it('accepts title of exactly 200 chars', () => {
    const title = 'a'.repeat(200);
    const errors = validateMetadata({ title, location: '', tags: [] });
    expect(errors).toEqual({});
  });
});

describe('canSubmitState', () => {
  it('returns false without title', () => {
    const state = createInitialState();
    expect(canSubmitState(state)).toBe(false);
  });

  it('returns false with only title', () => {
    const state = {
      ...createInitialState(),
      metadata: { ...createInitialState().metadata, title: 'Test' },
    };
    expect(canSubmitState(state)).toBe(false);
  });

  it('returns true with title and instructions', () => {
    const state = {
      ...createInitialState(),
      metadata: { ...createInitialState().metadata, title: 'Test' },
      instructions: 'Some text',
    };
    expect(canSubmitState(state)).toBe(true);
  });

  it('returns true with title and media', () => {
    const mockMedia = {
      id: 'test-id',
      type: 'image' as const,
      file: new Blob(['test'], { type: 'image/jpeg' }),
      order: 0,
      metadata: {
        mimeType: 'image/jpeg',
        fileSize: 4,
        source: 'capture' as const,
      },
    };
    const state = {
      ...createInitialState(),
      metadata: { ...createInitialState().metadata, title: 'Test' },
      mediaItems: [mockMedia],
    };
    expect(canSubmitState(state)).toBe(true);
  });

  it('returns false with whitespace-only title', () => {
    const state = {
      ...createInitialState(),
      metadata: { ...createInitialState().metadata, title: '   ' },
      instructions: 'Some text',
    };
    expect(canSubmitState(state)).toBe(false);
  });
});

describe('STEP_TRANSITIONS', () => {
  it('covers all 9 wizard steps', () => {
    const allSteps = [
      'metadata',
      'content-type',
      'capture-video',
      'capture-photo',
      'upload-file',
      'write-text',
      'edit-media',
      'add-more',
      'review',
    ];

    allSteps.forEach(step => {
      expect(STEP_TRANSITIONS).toHaveProperty(step);
    });
  });

  it('metadata can only go to content-type', () => {
    expect(STEP_TRANSITIONS['metadata']).toEqual(['content-type']);
  });

  it('content-type can go to capture/upload/write steps', () => {
    expect(STEP_TRANSITIONS['content-type']).toContain('capture-video');
    expect(STEP_TRANSITIONS['content-type']).toContain('capture-photo');
    expect(STEP_TRANSITIONS['content-type']).toContain('upload-file');
    expect(STEP_TRANSITIONS['content-type']).toContain('write-text');
  });

  it('review can go back to metadata or content-type', () => {
    expect(STEP_TRANSITIONS['review']).toContain('metadata');
    expect(STEP_TRANSITIONS['review']).toContain('content-type');
  });
});
