/**
 * MediaEditorStep Unit Tests
 *
 * Tests for the MediaEditorStep component state management and navigation logic.
 *
 * @module ItemCapture/components/steps/__tests__/MediaEditorStep.test
 * @lastModified 2025-12-31 (REQ-050)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaEditorStep } from '../MediaEditorStep';
import type { MediaItem, MediaMetadata } from '../../../ItemCapture.types';

// Mock the dynamic imports
jest.mock('next/dynamic', () => () => {
  const MockComponent = ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="mock-editor">
      <button onClick={onCancel}>Cancel Editor</button>
    </div>
  );
  return MockComponent;
});

// Mock useMediaEditor hook
const mockConfirmEdits = jest.fn().mockResolvedValue({ success: true });
const mockCancelEdits = jest.fn();
const mockStartEditing = jest.fn();
const mockSetCrop = jest.fn();
const mockSetRotation = jest.fn();
const mockSetTrim = jest.fn();
const mockHasPendingEdits = jest.fn().mockReturnValue(false);

jest.mock('../../../hooks/useMediaEditor', () => ({
  useMediaEditor: () => ({
    startEditing: mockStartEditing,
    getEditState: jest.fn(),
    setCrop: mockSetCrop,
    setRotation: mockSetRotation,
    setTrim: mockSetTrim,
    confirmEdits: mockConfirmEdits,
    cancelEdits: mockCancelEdits,
    hasPendingEdits: mockHasPendingEdits,
  }),
}));

// Helper to create mock media items
function createMockMediaItem(
  id: string,
  type: 'image' | 'video' | 'pdf',
  order: number = 0
): MediaItem {
  const blob = new Blob(['test'], { type: type === 'image' ? 'image/jpeg' : 'video/mp4' });
  const metadata: MediaMetadata = {
    mimeType: type === 'image' ? 'image/jpeg' : 'video/mp4',
    fileSize: 1024,
    source: 'upload',
  };

  return {
    id,
    type,
    file: blob,
    order,
    metadata,
  };
}

describe('MediaEditorStep', () => {
  const mockOnComplete = jest.fn();
  const mockOnUpdateMedia = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing with valid media items', () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Editing image 1 of 1/)).toBeInTheDocument();
    });

    it('shows progress indicator with correct count', () => {
      const mediaItems = [
        createMockMediaItem('img-1', 'image', 0),
        createMockMediaItem('img-2', 'image', 1),
        createMockMediaItem('img-3', 'image', 2),
      ];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Editing image 1 of 3/)).toBeInTheDocument();
    });

    it('shows edit phase for images (crop first)', () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Step: Crop')).toBeInTheDocument();
    });
  });

  describe('Empty Items Handler', () => {
    it('calls onComplete when no editable items exist', async () => {
      const pdfOnlyItems = [createMockMediaItem('pdf-1', 'pdf')];

      render(
        <MediaEditorStep
          mediaItems={pdfOnlyItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('calls onComplete when media items array is empty', async () => {
      render(
        <MediaEditorStep
          mediaItems={[]}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Phase Transitions', () => {
    it('initializes image editing in crop phase', () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Step: Crop')).toBeInTheDocument();
    });

    it('does not show edit phase for videos', () => {
      const mediaItems = [createMockMediaItem('vid-1', 'video')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText(/Step:/)).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('displays Cancel, Skip, and Apply buttons', () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Skip Crop/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Apply Crop/i })).toBeInTheDocument();
    });

    it('shows correct edit type labels for video', () => {
      const mediaItems = [createMockMediaItem('vid-1', 'video')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /Skip Trim/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Apply Trim/i })).toBeInTheDocument();
    });
  });

  describe('Skip Functionality', () => {
    it('advances to next phase when skip is clicked on image crop', async () => {
      const user = userEvent.setup();
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      // Initial phase is crop
      expect(screen.getByText('Step: Crop')).toBeInTheDocument();

      // Click skip
      await user.click(screen.getByRole('button', { name: /Skip Crop/i }));

      // Should advance to rotate phase
      await waitFor(() => {
        expect(screen.getByText('Step: Rotate')).toBeInTheDocument();
      });
    });

    it('calls onComplete when skipping last item', async () => {
      const user = userEvent.setup();
      const mediaItems = [createMockMediaItem('vid-1', 'video')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      // Skip the video
      await user.click(screen.getByRole('button', { name: /Skip Trim/i }));

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('cancels edits and advances when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mediaItems = [
        createMockMediaItem('img-1', 'image', 0),
        createMockMediaItem('img-2', 'image', 1),
      ];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      // Click cancel
      await user.click(screen.getByRole('button', { name: /^Cancel$/i }));

      // Should call cancelEdits on the hook
      await waitFor(() => {
        expect(mockCancelEdits).toHaveBeenCalledWith('img-1');
      });
    });
  });

  describe('Apply Functionality', () => {
    it('confirms edits and advances when Apply is clicked', async () => {
      const user = userEvent.setup();
      const mediaItems = [createMockMediaItem('vid-1', 'video')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      // Click apply
      await user.click(screen.getByRole('button', { name: /Apply Trim/i }));

      await waitFor(() => {
        expect(mockConfirmEdits).toHaveBeenCalledWith('vid-1');
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('shows error when confirmEdits fails', async () => {
      mockConfirmEdits.mockResolvedValueOnce({
        success: false,
        error: 'Test error message',
      });

      const user = userEvent.setup();
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /Apply Crop/i }));

      await waitFor(() => {
        expect(screen.getByText('Test error message')).toBeInTheDocument();
      });
    });
  });

  describe('Error Display', () => {
    it('shows error UI when error state is set', async () => {
      mockConfirmEdits.mockResolvedValueOnce({
        success: false,
        error: 'Processing failed',
      });

      const user = userEvent.setup();
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /Apply Crop/i }));

      await waitFor(() => {
        expect(screen.getByText('Unable to process edit')).toBeInTheDocument();
        expect(screen.getByText('Processing failed')).toBeInTheDocument();
      });
    });

    it('dismisses error when Dismiss button is clicked', async () => {
      mockConfirmEdits.mockResolvedValueOnce({
        success: false,
        error: 'Test error',
      });

      const user = userEvent.setup();
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /Apply Crop/i }));

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Dismiss/i }));

      await waitFor(() => {
        expect(screen.queryByText('Test error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('includes live region for screen readers', () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.textContent).toContain('Now editing image 1 of 1');
    });
  });

  describe('Edit Type Labels', () => {
    it('returns "Crop" for image in crop phase', () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Apply Crop')).toBeInTheDocument();
    });

    it('returns "Trim" for video', () => {
      const mediaItems = [createMockMediaItem('vid-1', 'video')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Apply Trim')).toBeInTheDocument();
    });
  });

  describe('Multiple Items Navigation', () => {
    it('advances through all items and phases', async () => {
      const user = userEvent.setup();
      const mediaItems = [
        createMockMediaItem('img-1', 'image', 0),
        createMockMediaItem('vid-1', 'video', 1),
      ];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      // Image 1, Crop phase
      expect(screen.getByText(/Editing image 1 of 2/)).toBeInTheDocument();
      expect(screen.getByText('Step: Crop')).toBeInTheDocument();

      // Skip crop
      await user.click(screen.getByRole('button', { name: /Skip Crop/i }));

      // Image 1, Rotate phase
      await waitFor(() => {
        expect(screen.getByText('Step: Rotate')).toBeInTheDocument();
      });

      // Skip rotate
      await user.click(screen.getByRole('button', { name: /Skip Rotation/i }));

      // Video 1
      await waitFor(() => {
        expect(screen.getByText(/Editing video 2 of 2/)).toBeInTheDocument();
      });

      // Skip video
      await user.click(screen.getByRole('button', { name: /Skip Trim/i }));

      // Complete
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Start Editing Hook Integration', () => {
    it('calls startEditing when component mounts with media', () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      expect(mockStartEditing).toHaveBeenCalledWith('img-1', expect.any(Object));
    });

    it('calls startEditing again when advancing to next item', async () => {
      const user = userEvent.setup();
      const mediaItems = [
        createMockMediaItem('img-1', 'image', 0),
        createMockMediaItem('img-2', 'image', 1),
      ];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      // Skip both phases of first image
      await user.click(screen.getByRole('button', { name: /Skip Crop/i }));
      await user.click(screen.getByRole('button', { name: /Skip Rotation/i }));

      // Should have called startEditing for second image
      await waitFor(() => {
        expect(mockStartEditing).toHaveBeenCalledWith('img-2', expect.any(Object));
      });
    });
  });
});
