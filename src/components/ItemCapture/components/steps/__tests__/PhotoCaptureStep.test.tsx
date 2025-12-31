/**
 * Unit Tests for PhotoCaptureStep Component
 *
 * Tests for mode transitions, photo capture logic, thumbnail strip behavior,
 * gallery mode, and MediaItem creation.
 *
 * @module ItemCapture/components/steps/__tests__/PhotoCaptureStep
 * @lastModified 2025-12-31 (REQ-039 Task 13)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PhotoCaptureStep } from '../PhotoCaptureStep';

// Type definitions for tests - inline to avoid TS import issues in Jest
interface ItemCaptureState {
  currentStep: string;
  stepHistory: string[];
  metadata: { title: string };
  mediaItems: MediaItem[];
  instructions: string;
  errors: Record<string, string>;
  isRecording: boolean;
  isCameraActive: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: Blob;
  thumbnail?: Blob;
  order: number;
  metadata: {
    duration?: number;
    dimensions?: { width: number; height: number };
    mimeType: string;
    fileSize: number;
    source: 'capture' | 'upload';
  };
}

interface PhotoCaptureStepProps {
  state: ItemCaptureState;
  addMedia: (media: MediaItem) => void;
  goToStep: (step: string) => void;
  prevStep: () => void;
  config: { maxPhotos?: number; debug?: boolean };
  className?: string;
}

// =============================================================================
// Mock useMediaCapture Hook
// =============================================================================

const mockStartCamera = jest.fn().mockResolvedValue(true);
const mockStopCamera = jest.fn();
const mockCapturePhoto = jest.fn().mockResolvedValue(new Blob(['test image'], { type: 'image/jpeg' }));
const mockToggleFacingMode = jest.fn().mockResolvedValue(true);
const mockCleanup = jest.fn();

jest.mock('../../../hooks/useMediaCapture', () => ({
  useMediaCapture: jest.fn(() => ({
    stream: new MediaStream(),
    isCameraActive: true,
    isRecording: false,
    error: null,
    permissionStatus: 'granted' as const,
    devices: [
      { deviceId: 'camera1', kind: 'videoinput', label: 'Front Camera', groupId: '', toJSON: () => ({}) },
      { deviceId: 'camera2', kind: 'videoinput', label: 'Back Camera', groupId: '', toJSON: () => ({}) },
    ],
    facingMode: 'environment' as const,
    capabilities: {
      isSupported: true,
      hasMediaDevices: true,
      hasGetUserMedia: true,
      hasMediaRecorder: true,
      hasEnumerateDevices: true,
    },
    startCamera: mockStartCamera,
    stopCamera: mockStopCamera,
    capturePhoto: mockCapturePhoto,
    toggleFacingMode: mockToggleFacingMode,
    cleanup: mockCleanup,
  })),
}));

// =============================================================================
// Mock CameraPreview Component
// =============================================================================

jest.mock('../../shared/CameraPreview', () => ({
  CameraPreview: ({ stream, isLoading, error }: { stream: MediaStream | null; isLoading: boolean; error: unknown }) => (
    <div data-testid="camera-preview">
      {isLoading && <span>Loading...</span>}
      {error && <span>Error</span>}
      {stream && <span>Stream Active</span>}
    </div>
  ),
}));

// =============================================================================
// Mock URL.createObjectURL and URL.revokeObjectURL
// =============================================================================

const mockCreateObjectURL = jest.fn((blob: Blob) => `blob:mock-url-${Math.random()}`);
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

// =============================================================================
// Mock navigator.vibrate
// =============================================================================

const mockVibrate = jest.fn().mockReturnValue(true);

beforeAll(() => {
  Object.defineProperty(navigator, 'vibrate', {
    value: mockVibrate,
    configurable: true,
  });
});

// =============================================================================
// Test Helpers
// =============================================================================

const createMockState = (overrides: Partial<ItemCaptureState> = {}): ItemCaptureState => ({
  currentStep: 'capture-photo',
  stepHistory: ['metadata', 'content-type'],
  metadata: { title: 'Test Item' },
  mediaItems: [],
  instructions: '',
  errors: {},
  isRecording: false,
  isCameraActive: false,
  isSubmitting: false,
  isDirty: false,
  ...overrides,
});

const createDefaultProps = (overrides: Partial<PhotoCaptureStepProps> = {}): PhotoCaptureStepProps => ({
  state: createMockState(),
  addMedia: jest.fn(),
  goToStep: jest.fn(),
  prevStep: jest.fn(),
  config: { maxPhotos: 10 },
  ...overrides,
});

describe('PhotoCaptureStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    mockVibrate.mockClear();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('rendering', () => {
    it('renders the component with header', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByText('Capture Photos')).toBeInTheDocument();
      expect(screen.getByText(/Tap the capture button to take photos/)).toBeInTheDocument();
    });

    it('renders camera preview component', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByTestId('camera-preview')).toBeInTheDocument();
    });

    it('renders capture button in preview mode', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /capture photo/i })).toBeInTheDocument();
    });

    it('renders camera switch button when multiple cameras available', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /switch camera/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PhotoCaptureStep {...createDefaultProps()} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('displays photo count indicator', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByText('(0 / 10)')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Mode Transition Tests
  // ===========================================================================

  describe('mode transitions', () => {
    it('transitions from preview to review when capture button is clicked', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Review Your Photo')).toBeInTheDocument();
      });
    });

    it('transitions from review to preview when retake is clicked', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Click retake
      await waitFor(async () => {
        const retakeButton = screen.getByRole('button', { name: /discard and capture again/i });
        await act(async () => {
          fireEvent.click(retakeButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Capture Photos')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /capture photo/i })).toBeInTheDocument();
      });
    });

    it('transitions from review to preview after accepting photo', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Accept photo
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Capture Photos')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Photo Capture Tests
  // ===========================================================================

  describe('photo capture', () => {
    it('calls capturePhoto when capture button is clicked', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      expect(mockCapturePhoto).toHaveBeenCalled();
    });

    it('triggers haptic feedback on capture', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      expect(mockVibrate).toHaveBeenCalledWith(50);
    });

    it('shows error when max photos limit is reached', async () => {
      const props = createDefaultProps({
        config: { maxPhotos: 1 },
      });

      render(<PhotoCaptureStep {...props} />);

      // Capture first photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Accept first photo
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Try to capture second photo - button should be disabled
      await waitFor(() => {
        const captureBtn = screen.getByRole('button', { name: /capture photo/i });
        expect(captureBtn).toBeDisabled();
      });
    });
  });

  // ===========================================================================
  // Review Screen Tests
  // ===========================================================================

  describe('review screen', () => {
    it('shows captured photo in review mode', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Review Your Photo' })).toBeInTheDocument();
        expect(screen.getByAltText('Captured photo preview')).toBeInTheDocument();
      });
    });

    it('shows accept and retake buttons in review mode', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /accept photo/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /discard and capture again/i })).toBeInTheDocument();
      });
    });

    it('revokes object URL when retaking photo', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Retake photo
      await waitFor(async () => {
        const retakeButton = screen.getByRole('button', { name: /discard and capture again/i });
        await act(async () => {
          fireEvent.click(retakeButton);
        });
      });

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // Thumbnail Strip Tests
  // ===========================================================================

  describe('thumbnail strip', () => {
    it('shows thumbnail after accepting photo', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Accept photo
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByAltText('Photo 1')).toBeInTheDocument();
      });
    });

    it('updates photo count after accepting photo', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept first photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByText('1 / 10')).toBeInTheDocument();
      });
    });

    it('shows remove button on thumbnail', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remove photo 1/i })).toBeInTheDocument();
      });
    });

    it('removes photo when remove button is clicked', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Remove photo
      await waitFor(async () => {
        const removeButton = screen.getByRole('button', { name: /remove photo 1/i });
        await act(async () => {
          fireEvent.click(removeButton);
        });
      });

      await waitFor(() => {
        expect(screen.queryByAltText('Photo 1')).not.toBeInTheDocument();
      });
    });

    it('revokes object URLs when photo is removed', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Clear call history for revokeObjectURL
      mockRevokeObjectURL.mockClear();

      // Remove photo
      await waitFor(async () => {
        const removeButton = screen.getByRole('button', { name: /remove photo 1/i });
        await act(async () => {
          fireEvent.click(removeButton);
        });
      });

      await waitFor(() => {
        // Should revoke both the photo URL and thumbnail URL
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // Gallery Mode Tests
  // ===========================================================================

  describe('gallery mode', () => {
    it('opens gallery when thumbnail is clicked', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Click on thumbnail
      await waitFor(async () => {
        const thumbnail = screen.getByAltText('Photo 1');
        await act(async () => {
          fireEvent.click(thumbnail);
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /photo gallery/i })).toBeInTheDocument();
        expect(screen.getByText('1 of 1')).toBeInTheDocument();
      });
    });

    it('closes gallery when close button is clicked', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Open gallery
      await waitFor(async () => {
        const thumbnail = screen.getByAltText('Photo 1');
        await act(async () => {
          fireEvent.click(thumbnail);
        });
      });

      // Close gallery
      await waitFor(async () => {
        const closeButton = screen.getByRole('button', { name: /close gallery/i });
        await act(async () => {
          fireEvent.click(closeButton);
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /photo gallery/i })).not.toBeInTheDocument();
      });
    });

    it('closes gallery when Escape key is pressed', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Open gallery
      await waitFor(async () => {
        const thumbnail = screen.getByAltText('Photo 1');
        await act(async () => {
          fireEvent.click(thumbnail);
        });
      });

      // Press Escape
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /photo gallery/i })).not.toBeInTheDocument();
      });
    });

    it('deletes photo from gallery', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Open gallery
      await waitFor(async () => {
        const thumbnail = screen.getByAltText('Photo 1');
        await act(async () => {
          fireEvent.click(thumbnail);
        });
      });

      // Delete photo
      await waitFor(async () => {
        const deleteButton = screen.getByRole('button', { name: /delete photo/i });
        await act(async () => {
          fireEvent.click(deleteButton);
        });
      });

      // Gallery should close when last photo is deleted
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /photo gallery/i })).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // MediaItem Creation Tests
  // ===========================================================================

  describe('MediaItem creation', () => {
    it('calls addMedia with correct MediaItem structure on accept', async () => {
      const addMedia = jest.fn();

      render(<PhotoCaptureStep {...createDefaultProps({ addMedia })} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Accept photo
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(addMedia).toHaveBeenCalled();
        const mediaItem = addMedia.mock.calls[0][0] as MediaItem;
        expect(mediaItem).toMatchObject({
          type: 'image',
          order: 0,
          metadata: {
            source: 'capture',
          },
        });
        expect(mediaItem.id).toBeDefined();
        expect(mediaItem.file).toBeInstanceOf(Blob);
      });
    });

    it('sets correct order based on existing image mediaItems', async () => {
      const addMedia = jest.fn();
      const existingMedia = [
        { id: '1', type: 'image' as const, file: new Blob(), order: 0, metadata: { mimeType: 'image/jpeg', fileSize: 100, source: 'capture' as const } },
        { id: '2', type: 'image' as const, file: new Blob(), order: 1, metadata: { mimeType: 'image/jpeg', fileSize: 100, source: 'capture' as const } },
      ];

      const props = createDefaultProps({
        addMedia,
        state: createMockState({ mediaItems: existingMedia }),
      });

      render(<PhotoCaptureStep {...props} />);

      // Capture photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Accept photo
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        const mediaItem = addMedia.mock.calls[0][0] as MediaItem;
        expect(mediaItem.order).toBe(2);
      });
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  describe('navigation', () => {
    it('calls prevStep when back button is clicked', async () => {
      const prevStep = jest.fn();

      render(<PhotoCaptureStep {...createDefaultProps({ prevStep })} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      await act(async () => {
        fireEvent.click(backButton);
      });

      expect(prevStep).toHaveBeenCalled();
      expect(mockStopCamera).toHaveBeenCalled();
    });

    it('shows Skip button when no photos captured', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });

    it('shows Continue button when photos are captured', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
    });

    it('calls goToStep with add-more when continue is clicked', async () => {
      const goToStep = jest.fn();

      render(<PhotoCaptureStep {...createDefaultProps({ goToStep })} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Click continue
      await waitFor(async () => {
        const continueButton = screen.getByRole('button', { name: /continue/i });
        await act(async () => {
          fireEvent.click(continueButton);
        });
      });

      expect(goToStep).toHaveBeenCalledWith('add-more');
      expect(mockStopCamera).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Camera Switch Tests
  // ===========================================================================

  describe('camera switching', () => {
    it('calls toggleFacingMode when switch camera button is clicked', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      const switchButton = screen.getByRole('button', { name: /switch camera/i });
      await act(async () => {
        fireEvent.click(switchButton);
      });

      expect(mockToggleFacingMode).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has aria-labels on all buttons', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /capture photo/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /switch camera/i })).toHaveAttribute('aria-label');
    });

    it('includes screen reader announcements region', () => {
      const { container } = render(<PhotoCaptureStep {...createDefaultProps()} />);

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('thumbnail strip has listbox role', async () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      // Capture and accept photo
      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept photo/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox', { name: /captured photos/i })).toBeInTheDocument();
      });
    });

    it('focus ring is visible on interactive elements', () => {
      render(<PhotoCaptureStep {...createDefaultProps()} />);

      const captureButton = screen.getByRole('button', { name: /capture photo/i });
      expect(captureButton).toHaveClass('focus:ring-2');
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('cleanup', () => {
    it('calls cleanup on unmount', () => {
      const { unmount } = render(<PhotoCaptureStep {...createDefaultProps()} />);

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });
  });
});
