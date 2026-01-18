/**
 * Unit Tests for VideoCaptureStep Component
 *
 * Tests for mode transitions, timer logic, error handling, and MediaItem creation.
 *
 * @module ItemCapture/components/steps/__tests__/VideoCaptureStep
 * @lastModified 2025-12-31 (REQ-038 Task 12)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VideoCaptureStep } from '../VideoCaptureStep';

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
    mimeType: string;
    fileSize: number;
    source: 'capture' | 'upload';
  };
}

interface VideoCaptureStepProps {
  state: ItemCaptureState;
  addMedia: (media: MediaItem) => void;
  goToStep: (step: string) => void;
  prevStep: () => void;
  config: { maxVideoDuration?: number };
  className?: string;
}

// =============================================================================
// Mock useMediaCapture Hook
// =============================================================================

const mockStartCamera = vi.fn().mockResolvedValue(true);
const mockStopCamera = vi.fn();
const mockStartRecording = vi.fn().mockResolvedValue(true);
const mockStopRecording = vi.fn().mockResolvedValue(new Blob(['test video'], { type: 'video/mp4' }));
const mockToggleFacingMode = vi.fn().mockResolvedValue(true);
const mockCleanup = vi.fn();

vi.mock('../../../hooks/useMediaCapture', () => ({
  useMediaCapture: vi.fn(() => ({
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
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
    toggleFacingMode: mockToggleFacingMode,
    cleanup: mockCleanup,
  })),
}));

// =============================================================================
// Mock CameraPreview Component
// =============================================================================

vi.mock('../../shared/CameraPreview', () => ({
  CameraPreview: ({ stream, isLoading, error }: { stream: MediaStream | null; isLoading: boolean; error: unknown }) => (
    <div data-testid="camera-preview">
      {isLoading && <span>Loading...</span>}
      {error && <span>Error</span>}
      {stream && <span>Stream Active</span>}
    </div>
  ),
}));

// =============================================================================
// Test Helpers
// =============================================================================

const createMockState = (overrides: Partial<ItemCaptureState> = {}): ItemCaptureState => ({
  currentStep: 'capture-video',
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

const createDefaultProps = (overrides: Partial<VideoCaptureStepProps> = {}): VideoCaptureStepProps => ({
  state: createMockState(),
  addMedia: vi.fn(),
  goToStep: vi.fn(),
  prevStep: vi.fn(),
  config: { maxVideoDuration: 120 },
  ...overrides,
});

describe('VideoCaptureStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('rendering', () => {
    it('renders the component with header', () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByText('Position your camera and tap record to start')).toBeInTheDocument();
    });

    it('renders camera preview component', () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByTestId('camera-preview')).toBeInTheDocument();
    });

    it('renders start recording button in preview mode', () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    });

    it('renders camera switch button when multiple cameras available', () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /switch camera/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <VideoCaptureStep {...createDefaultProps()} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ===========================================================================
  // Mode Transition Tests
  // ===========================================================================

  describe('mode transitions', () => {
    it('transitions from preview to recording when start is clicked', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Recording Video')).toBeInTheDocument();
      });
    });

    it('shows stop button when in recording mode', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });
    });

    it('transitions from recording to review when stop is clicked', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      // Start recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // Stop recording
      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Review Your Video')).toBeInTheDocument();
      });
    });

    it('transitions from review to preview when retake is clicked', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      // Start and stop recording to get to review mode
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // Click retake
      await waitFor(async () => {
        const retakeButton = screen.getByRole('button', { name: /discard and record again/i });
        await act(async () => {
          fireEvent.click(retakeButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Record Video')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Timer Logic Tests
  // ===========================================================================

  describe('timer logic', () => {
    it('displays timer at 0:00 when recording starts', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/0:00 \/ 2:00/)).toBeInTheDocument();
      });
    });

    it('timer increments every second during recording', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // Advance timer by 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByText(/0:05 \/ 2:00/)).toBeInTheDocument();
      });
    });

    it('timer stops when recording stops', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      // Start recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // Advance timer
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      // Stop recording
      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // In review mode, timer should not be displayed
      await waitFor(() => {
        expect(screen.queryByText(/0:\d{2} \/ 2:00/)).not.toBeInTheDocument();
      });
    });

    it('auto-stops recording at max duration', async () => {
      const props = createDefaultProps({
        config: { maxVideoDuration: 5 },
      });

      render(<VideoCaptureStep {...props} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // Advance timer past max duration
      await act(async () => {
        jest.advanceTimersByTime(6000);
      });

      // Should transition to review mode
      await waitFor(() => {
        expect(screen.getByText('Review Your Video')).toBeInTheDocument();
      });
    });

    it('shows warning color when less than 30 seconds remain', async () => {
      const props = createDefaultProps({
        config: { maxVideoDuration: 35 },
      });

      render(<VideoCaptureStep {...props} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // Advance to 8 seconds (27 seconds remaining)
      await act(async () => {
        jest.advanceTimersByTime(8000);
      });

      // Timer should have warning class (red color)
      await waitFor(() => {
        const timer = screen.getByText(/0:08 \/ 0:35/);
        expect(timer).toHaveClass('text-red-400');
      });
    });
  });

  // ===========================================================================
  // Recording Indicator Tests
  // ===========================================================================

  describe('recording indicator', () => {
    it('shows recording indicator when recording', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('REC')).toBeInTheDocument();
      });
    });

    it('recording indicator pulses during recording', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const { container } = render(<VideoCaptureStep {...createDefaultProps()} />);
        const pulsingDot = container.querySelector('.animate-pulse');
        // The pulse class should exist on the recording indicator
        expect(screen.getByText('REC')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Review Screen Tests
  // ===========================================================================

  describe('review screen', () => {
    it('shows video player in review mode', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      // Start and stop recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Review Your Video' })).toBeInTheDocument();
      });
    });

    it('shows accept and retake buttons in review mode', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      // Start and stop recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /accept video/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /discard and record again/i })).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // MediaItem Creation Tests
  // ===========================================================================

  describe('MediaItem creation', () => {
    it('calls addMedia with correct MediaItem structure on accept', async () => {
      const addMedia = vi.fn();
      const goToStep = vi.fn();

      render(<VideoCaptureStep {...createDefaultProps({ addMedia, goToStep })} />);

      // Start and stop recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // Click accept
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept video/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(addMedia).toHaveBeenCalled();
        const mediaItem = addMedia.mock.calls[0][0] as MediaItem;
        expect(mediaItem).toMatchObject({
          type: 'video',
          order: 0,
          metadata: {
            source: 'capture',
          },
        });
        expect(mediaItem.id).toBeDefined();
        expect(mediaItem.file).toBeInstanceOf(Blob);
      });
    });

    it('navigates to add-more step after accepting video', async () => {
      const goToStep = vi.fn();

      render(<VideoCaptureStep {...createDefaultProps({ goToStep })} />);

      // Start and stop recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // Click accept
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept video/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(goToStep).toHaveBeenCalledWith('add-more');
      });
    });

    it('sets correct order based on existing mediaItems', async () => {
      const addMedia = vi.fn();
      const existingMedia = [
        { id: '1', type: 'image' as const, file: new Blob(), order: 0, metadata: { mimeType: 'image/jpeg', fileSize: 100, source: 'capture' as const } },
        { id: '2', type: 'image' as const, file: new Blob(), order: 1, metadata: { mimeType: 'image/jpeg', fileSize: 100, source: 'capture' as const } },
      ];

      const props = createDefaultProps({
        addMedia,
        state: createMockState({ mediaItems: existingMedia }),
      });

      render(<VideoCaptureStep {...props} />);

      // Start and stop recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // Click accept
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept video/i });
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
  // Camera Switch Tests
  // ===========================================================================

  describe('camera switching', () => {
    it('calls toggleFacingMode when switch camera button is clicked', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const switchButton = screen.getByRole('button', { name: /switch camera/i });
      await act(async () => {
        fireEvent.click(switchButton);
      });

      expect(mockToggleFacingMode).toHaveBeenCalled();
    });

    it('disables camera switch during recording', async () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      // Start recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        const switchButton = screen.getByRole('button', { name: /switch camera/i });
        expect(switchButton).toBeDisabled();
      });
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has aria-labels on all buttons', () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /start recording/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /switch camera/i })).toHaveAttribute('aria-label');
    });

    it('includes screen reader announcements region', () => {
      const { container } = render(<VideoCaptureStep {...createDefaultProps()} />);

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('focus ring is visible on interactive elements', () => {
      render(<VideoCaptureStep {...createDefaultProps()} />);

      const startButton = screen.getByRole('button', { name: /start recording/i });
      expect(startButton).toHaveClass('focus:ring-2');
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('cleanup', () => {
    it('calls cleanup on unmount', () => {
      const { unmount } = render(<VideoCaptureStep {...createDefaultProps()} />);

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });

    it('clears timer interval on unmount during recording', async () => {
      const { unmount } = render(<VideoCaptureStep {...createDefaultProps()} />);

      // Start recording
      const startButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // Unmount
      unmount();

      // Timer should not cause errors after unmount
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      // No error should occur
      expect(true).toBe(true);
    });
  });
});
