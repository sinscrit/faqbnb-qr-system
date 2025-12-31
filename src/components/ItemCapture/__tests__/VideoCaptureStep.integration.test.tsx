/**
 * Integration Tests for VideoCaptureStep Component
 *
 * Tests for wizard integration, full capture flow, and component interactions.
 *
 * @module ItemCapture/__tests__/VideoCaptureStep.integration
 * @lastModified 2025-12-31 (REQ-038 Task 13)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VideoCaptureStep } from '../components/steps/VideoCaptureStep';

// Type definitions for integration tests
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

// =============================================================================
// Mock Setup
// =============================================================================

const mockStartCamera = jest.fn().mockResolvedValue(true);
const mockStopCamera = jest.fn();
const mockStartRecording = jest.fn().mockResolvedValue(true);
const mockStopRecording = jest.fn().mockResolvedValue(new Blob(['test video'], { type: 'video/mp4' }));
const mockToggleFacingMode = jest.fn().mockResolvedValue(true);
const mockCleanup = jest.fn();

jest.mock('../hooks/useMediaCapture', () => ({
  useMediaCapture: jest.fn(() => ({
    stream: new MediaStream(),
    isCameraActive: true,
    isRecording: false,
    error: null,
    permissionStatus: 'granted',
    devices: [
      { deviceId: 'camera1', kind: 'videoinput', label: 'Camera 1', groupId: '', toJSON: () => ({}) },
      { deviceId: 'camera2', kind: 'videoinput', label: 'Camera 2', groupId: '', toJSON: () => ({}) },
    ],
    facingMode: 'environment',
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

jest.mock('../components/shared/CameraPreview', () => ({
  CameraPreview: ({ stream }: { stream: MediaStream | null }) => (
    <div data-testid="camera-preview">{stream ? 'Stream Active' : 'No Stream'}</div>
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

describe('VideoCaptureStep Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================================================
  // Wizard Integration Tests
  // ===========================================================================

  describe('wizard integration', () => {
    it('receives correct props from wizard context', () => {
      const addMedia = jest.fn();
      const goToStep = jest.fn();
      const prevStep = jest.fn();

      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={addMedia}
          goToStep={goToStep}
          prevStep={prevStep}
          config={{ maxVideoDuration: 120 }}
        />
      );

      // Component should render successfully with wizard props
      expect(screen.getByText('Record Video')).toBeInTheDocument();
    });

    it('addMedia correctly adds to wizard state', async () => {
      const addMedia = jest.fn();
      const goToStep = jest.fn();

      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={addMedia}
          goToStep={goToStep}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      // Start recording
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      // Stop recording
      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // Accept video
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept video/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(addMedia).toHaveBeenCalledTimes(1);
        const mediaItem = addMedia.mock.calls[0][0];
        expect(mediaItem.type).toBe('video');
        expect(mediaItem.file).toBeInstanceOf(Blob);
      });
    });

    it('goToStep navigates within wizard', async () => {
      const goToStep = jest.fn();

      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={goToStep}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      // Complete capture flow
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

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
  });

  // ===========================================================================
  // Full Capture Flow Tests
  // ===========================================================================

  describe('full capture flow', () => {
    it('completes full record → review → accept flow', async () => {
      const addMedia = jest.fn();
      const goToStep = jest.fn();

      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={addMedia}
          goToStep={goToStep}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      // 1. Verify preview mode
      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

      // 2. Start recording
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      // 3. Verify recording mode
      await waitFor(() => {
        expect(screen.getByText('Recording Video')).toBeInTheDocument();
        expect(screen.getByText('REC')).toBeInTheDocument();
      });

      // 4. Let timer run for a few seconds
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      // 5. Stop recording
      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // 6. Verify review mode
      await waitFor(() => {
        expect(screen.getByText('Review Your Video')).toBeInTheDocument();
      });

      // 7. Accept video
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept video/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // 8. Verify media added and navigation
      await waitFor(() => {
        expect(addMedia).toHaveBeenCalled();
        expect(goToStep).toHaveBeenCalledWith('add-more');
      });
    });

    it('completes full record → review → retake → accept flow', async () => {
      const addMedia = jest.fn();
      const goToStep = jest.fn();

      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={addMedia}
          goToStep={goToStep}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      // First recording
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // Retake
      await waitFor(async () => {
        const retakeButton = screen.getByRole('button', { name: /discard and record again/i });
        await act(async () => {
          fireEvent.click(retakeButton);
        });
      });

      // Verify back to preview mode
      await waitFor(() => {
        expect(screen.getByText('Record Video')).toBeInTheDocument();
      });

      // Second recording
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      // Accept second recording
      await waitFor(async () => {
        const acceptButton = screen.getByRole('button', { name: /accept video/i });
        await act(async () => {
          fireEvent.click(acceptButton);
        });
      });

      // Verify only called once (second recording)
      await waitFor(() => {
        expect(addMedia).toHaveBeenCalledTimes(1);
        expect(goToStep).toHaveBeenCalledWith('add-more');
      });
    });
  });

  // ===========================================================================
  // Cancel Flow Tests
  // ===========================================================================

  describe('cancel flow', () => {
    it('handles Escape key to return to previous step in preview mode', async () => {
      const prevStep = jest.fn();

      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={jest.fn()}
          prevStep={prevStep}
          config={{ maxVideoDuration: 120 }}
        />
      );

      // Press Escape in preview mode
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(prevStep).toHaveBeenCalled();
    });

    it('handles Escape key to stop recording', async () => {
      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={jest.fn()}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      // Start recording
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      // Wait for recording mode
      await waitFor(() => {
        expect(screen.getByText('REC')).toBeInTheDocument();
      });

      // Press Escape during recording
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      // Should transition to review mode
      await waitFor(() => {
        expect(screen.getByText('Review Your Video')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // CameraPreview Integration Tests
  // ===========================================================================

  describe('CameraPreview integration', () => {
    it('passes stream to CameraPreview', () => {
      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={jest.fn()}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      expect(screen.getByTestId('camera-preview')).toBeInTheDocument();
      expect(screen.getByText('Stream Active')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Hook Integration Tests
  // ===========================================================================

  describe('useMediaCapture integration', () => {
    it('calls startCamera on mount', () => {
      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={jest.fn()}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      expect(mockStartCamera).toHaveBeenCalled();
    });

    it('calls cleanup on unmount', () => {
      const { unmount } = render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={jest.fn()}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });

    it('calls startRecording when record button clicked', async () => {
      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={jest.fn()}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      expect(mockStartRecording).toHaveBeenCalled();
    });

    it('calls stopRecording when stop button clicked', async () => {
      render(
        <VideoCaptureStep
          state={createMockState()}
          addMedia={jest.fn()}
          goToStep={jest.fn()}
          prevStep={jest.fn()}
          config={{ maxVideoDuration: 120 }}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
      });

      await waitFor(async () => {
        const stopButton = screen.getByRole('button', { name: /stop recording/i });
        await act(async () => {
          fireEvent.click(stopButton);
        });
      });

      expect(mockStopRecording).toHaveBeenCalled();
    });
  });
});
