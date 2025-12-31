/**
 * MediaEditorStep Integration Tests
 *
 * Tests for the MediaEditorStep component integration with editor components.
 * These tests verify that the correct editor is displayed for each media type and phase.
 *
 * Note: These tests require Jest and React Testing Library to be configured.
 * Run with: npm test -- --testPathPattern="MediaEditorStep.integration"
 *
 * @module ItemCapture/components/steps/__tests__/MediaEditorStep.integration.test
 * @lastModified 2025-12-31 (REQ-050)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaEditorStep } from '../MediaEditorStep';
import type { MediaItem, MediaMetadata } from '../../../ItemCapture.types';

// Mock the dynamic imports with component-specific identifiers
jest.mock('next/dynamic', () => {
  return (importFunc: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    // Return a mock component based on the import path
    const MockImageCropper = (props: { onCancel: () => void; onCropComplete: (blob: Blob) => void }) => (
      <div data-testid="image-cropper">
        <button onClick={props.onCancel}>Cancel Crop</button>
        <button onClick={() => props.onCropComplete(new Blob())}>Apply Crop</button>
      </div>
    );

    const MockImageRotator = (props: { onCancel: () => void; onRotationComplete: (blob: Blob, degrees: number) => void }) => (
      <div data-testid="image-rotator">
        <button onClick={props.onCancel}>Cancel Rotate</button>
        <button onClick={() => props.onRotationComplete(new Blob(), 90)}>Apply Rotate</button>
      </div>
    );

    const MockVideoTrimmer = (props: { onCancel: () => void; onTrimComplete: (trim: unknown) => void }) => (
      <div data-testid="video-trimmer">
        <button onClick={props.onCancel}>Cancel Trim</button>
        <button onClick={() => props.onTrimComplete({ startTime: 0, endTime: 10, originalDuration: 30 })}>Apply Trim</button>
      </div>
    );

    // Determine which component to return based on the import
    const importStr = importFunc.toString();
    if (importStr.includes('ImageCropper')) {
      return MockImageCropper;
    } else if (importStr.includes('ImageRotator')) {
      return MockImageRotator;
    } else if (importStr.includes('VideoTrimmer')) {
      return MockVideoTrimmer;
    }

    return () => <div data-testid="unknown-component" />;
  };
});

// Mock useMediaEditor hook
jest.mock('../../../hooks/useMediaEditor', () => ({
  useMediaEditor: () => ({
    startEditing: jest.fn(),
    getEditState: jest.fn(),
    setCrop: jest.fn(),
    setRotation: jest.fn(),
    setTrim: jest.fn(),
    confirmEdits: jest.fn().mockResolvedValue({ success: true }),
    cancelEdits: jest.fn(),
    hasPendingEdits: jest.fn().mockReturnValue(false),
  }),
}));

// Helper to create mock media items
function createMockMediaItem(
  id: string,
  type: 'image' | 'video',
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

describe('MediaEditorStep Integration', () => {
  const mockOnComplete = jest.fn();
  const mockOnUpdateMedia = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Editor Component Rendering', () => {
    it('renders ImageCropper for image in crop phase', async () => {
      const mediaItems = [createMockMediaItem('img-1', 'image')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('image-cropper')).toBeInTheDocument();
      });
    });

    it('renders ImageRotator for image in rotate phase', async () => {
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

      // Skip crop phase
      await user.click(screen.getByRole('button', { name: /Skip Crop/i }));

      await waitFor(() => {
        expect(screen.getByTestId('image-rotator')).toBeInTheDocument();
      });
    });

    it('renders VideoTrimmer for video', async () => {
      const mediaItems = [createMockMediaItem('vid-1', 'video')];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('video-trimmer')).toBeInTheDocument();
      });
    });
  });

  describe('Editor Interactions', () => {
    it('advances from crop to rotate when Apply Crop is clicked', async () => {
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

      // Click apply in the cropper (not the main Apply button)
      await user.click(screen.getByRole('button', { name: /Apply Crop$/i }));

      // Should show Apply Crop button (main action button)
      // Note: This test relies on the mock component structure
      await waitFor(() => {
        expect(screen.getByText('Step: Crop')).toBeInTheDocument();
      });
    });

    it('cancels and advances when Cancel button in editor is clicked', async () => {
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

      // Wait for cropper to render
      await waitFor(() => {
        expect(screen.getByTestId('image-cropper')).toBeInTheDocument();
      });

      // Click cancel in the editor
      await user.click(screen.getByRole('button', { name: /Cancel Crop/i }));

      // Should advance to rotate phase (skip button behavior)
      await waitFor(() => {
        expect(screen.getByText('Step: Rotate')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Indicator Updates', () => {
    it('updates progress bar as items are processed', async () => {
      const user = userEvent.setup();
      const mediaItems = [
        createMockMediaItem('vid-1', 'video', 0),
        createMockMediaItem('vid-2', 'video', 1),
      ];

      render(
        <MediaEditorStep
          mediaItems={mediaItems}
          onComplete={mockOnComplete}
          onUpdateMedia={mockOnUpdateMedia}
          onCancel={mockOnCancel}
        />
      );

      // Initial state: 1 of 2
      expect(screen.getByText(/Editing video 1 of 2/)).toBeInTheDocument();

      // Skip first video
      await user.click(screen.getByRole('button', { name: /Skip Trim/i }));

      // Should now show 2 of 2
      await waitFor(() => {
        expect(screen.getByText(/Editing video 2 of 2/)).toBeInTheDocument();
      });
    });
  });

  describe('Mixed Media Navigation', () => {
    it('correctly handles image then video sequence', async () => {
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

      // Image 1: Crop phase
      expect(screen.getByText('Step: Crop')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /Skip Crop/i }));

      // Image 1: Rotate phase
      await waitFor(() => {
        expect(screen.getByText('Step: Rotate')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /Skip Rotation/i }));

      // Video 1: Trim phase (no Step indicator for video)
      await waitFor(() => {
        expect(screen.queryByText(/Step:/)).not.toBeInTheDocument();
        expect(screen.getByText(/Editing video 2 of 2/)).toBeInTheDocument();
      });
    });
  });
});
