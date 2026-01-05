'use client';

/**
 * VideoCaptureStep Component
 *
 * Wizard step component for video recording within the Item Capture workflow.
 * Provides camera preview, recording controls, timer display, and video review.
 *
 * @module ItemCapture/components/steps/VideoCaptureStep
 * @see docs/REQ-038-implement-videocapturestep-detailed.md
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05 (REQ-113 - Added CameraPermissionFallback integration)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Circle,
  Square,
  SwitchCamera,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CameraPreview } from '../shared/CameraPreview';
import { CameraPermissionFallback } from '../shared/CameraPermissionFallback';
import { useMediaCapture } from '../../hooks/useMediaCapture';
import type {
  ItemCaptureState,
  ItemCaptureConfig,
  MediaItem,
  WizardStep,
  MediaCaptureError,
} from '../../ItemCapture.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Component mode state - determines which UI to display.
 */
type VideoCaptureMode = 'preview' | 'recording' | 'review';

/**
 * Props for VideoCaptureStep component.
 */
export interface VideoCaptureStepProps {
  /** Current wizard state */
  state: ItemCaptureState;
  /** Callback to add captured media to state */
  addMedia: (media: MediaItem) => void;
  /** Callback to navigate to a specific step */
  goToStep: (step: WizardStep) => void;
  /** Callback to go to previous step */
  prevStep: () => void;
  /** Configuration for capture behavior */
  config: ItemCaptureConfig;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Internal error interface for component-specific error handling.
 */
interface VideoCaptureError {
  code: 'RECORDING_FAILED' | 'BROWSER_NOT_SUPPORTED' | 'PERMISSION_DENIED' | 'THUMBNAIL_FAILED';
  message: string;
  recoverable: boolean;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generates a UUID v4 for unique media item identification.
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Formats seconds into MM:SS format.
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Gets video duration from a blob.
 */
const getVideoDuration = (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(blob);
  });
};

/**
 * Generates a thumbnail from the first frame of a video blob.
 */
const generateVideoThumbnail = (blob: Blob, maxWidth = 320): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Seek to first frame
      video.currentTime = 0.1;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      const aspectRatio = video.videoWidth / video.videoHeight;
      canvas.width = Math.min(maxWidth, video.videoWidth);
      canvas.height = canvas.width / aspectRatio;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(video.src);
        resolve(null);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (thumbnailBlob) => {
          URL.revokeObjectURL(video.src);
          resolve(thumbnailBlob);
        },
        'image/jpeg',
        0.8
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    };

    video.src = URL.createObjectURL(blob);
  });
};

/**
 * Maps hook errors to component-specific errors.
 */
const mapHookErrorToComponentError = (
  error: MediaCaptureError | null
): VideoCaptureError | null => {
  if (!error) return null;

  switch (error.code) {
    case 'PERMISSION_DENIED':
      return {
        code: 'PERMISSION_DENIED',
        message: 'Camera access was denied',
        recoverable: false,
      };
    case 'BROWSER_NOT_SUPPORTED':
      return {
        code: 'BROWSER_NOT_SUPPORTED',
        message: 'Your browser does not support video recording',
        recoverable: false,
      };
    case 'RECORDING_ERROR':
    default:
      return {
        code: 'RECORDING_FAILED',
        message: error.message || 'Video recording failed',
        recoverable: true,
      };
  }
};

/**
 * Gets user-friendly guidance for error codes.
 */
const getErrorGuidance = (code: string): string => {
  switch (code) {
    case 'PERMISSION_DENIED':
      return 'Please enable camera access in your browser settings to record video.';
    case 'BROWSER_NOT_SUPPORTED':
      return 'Please try Chrome, Safari, or Firefox.';
    case 'RECORDING_FAILED':
      return 'Please check your camera and try again.';
    case 'THUMBNAIL_FAILED':
      return 'Video saved but thumbnail generation failed.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// =============================================================================
// Component
// =============================================================================

/**
 * VideoCaptureStep provides video recording functionality within the wizard.
 *
 * Features:
 * - Live camera preview with mirror mode support
 * - Video recording with timer display
 * - Auto-stop at configured max duration
 * - Video review with playback controls
 * - Accept/Retake workflow
 * - Camera switching for multi-camera devices
 * - Comprehensive error handling
 * - Full keyboard and screen reader accessibility
 *
 * @example
 * ```tsx
 * <VideoCaptureStep
 *   state={wizardState}
 *   addMedia={handleAddMedia}
 *   goToStep={handleGoToStep}
 *   prevStep={handlePrevStep}
 *   config={captureConfig}
 * />
 * ```
 */
export function VideoCaptureStep({
  state,
  addMedia,
  goToStep,
  prevStep,
  config,
  className,
}: VideoCaptureStepProps) {
  // ===========================================================================
  // Hook: Media Capture
  // ===========================================================================

  const {
    stream,
    isCameraActive,
    isRecording: hookIsRecording,
    error: cameraError,
    permissionStatus,
    devices,
    facingMode,
    capabilities,
    startCamera,
    stopCamera,
    startRecording: hookStartRecording,
    stopRecording: hookStopRecording,
    toggleFacingMode,
    cleanup,
  } = useMediaCapture({
    facingMode: 'environment',
    includeAudio: true,
    debug: config?.debug,
  });

  // ===========================================================================
  // State
  // ===========================================================================

  const [mode, setMode] = useState<VideoCaptureMode>('preview');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<VideoCaptureError | null>(null);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ===========================================================================
  // Refs
  // ===========================================================================

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  // ===========================================================================
  // Derived Values
  // ===========================================================================

  const maxDuration = config.maxVideoDuration ?? 120;
  const hasMultipleCameras = devices.length > 1;
  const componentError = error || mapHookErrorToComponentError(cameraError);
  const isLoading = !isCameraActive && !cameraError && permissionStatus !== 'denied';

  // ===========================================================================
  // Screen Reader Announcements
  // ===========================================================================

  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  // ===========================================================================
  // Camera Lifecycle
  // ===========================================================================

  useEffect(() => {
    // Check browser support
    if (!capabilities.isSupported) {
      setError({
        code: 'BROWSER_NOT_SUPPORTED',
        message: capabilities.unsupportedReason || 'Browser not supported',
        recoverable: false,
      });
      return;
    }

    // Start camera on mount
    startCamera();

    // Cleanup on unmount
    return () => {
      cleanup();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [capabilities.isSupported, capabilities.unsupportedReason, startCamera, cleanup]);

  // ===========================================================================
  // Timer Effect
  // ===========================================================================

  useEffect(() => {
    if (mode === 'recording') {
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop at max duration
          if (newTime >= maxDuration) {
            handleStopRecording();
          }
          return newTime;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [mode, maxDuration]);

  // ===========================================================================
  // Mirror Mode Auto-Toggle
  // ===========================================================================

  useEffect(() => {
    // Auto-enable mirror mode for front camera
    setIsMirrored(facingMode === 'user');
  }, [facingMode]);

  // ===========================================================================
  // Visibility Change Handler
  // ===========================================================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mode === 'recording') {
        // Auto-stop recording when page is hidden
        handleStopRecording();
        announce('Recording stopped - page was hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode]);

  // ===========================================================================
  // Recording Handlers
  // ===========================================================================

  const handleStartRecording = useCallback(async () => {
    setError(null);
    setElapsedTime(0);

    const success = await hookStartRecording();
    if (success) {
      setMode('recording');
      announce('Recording started');
    } else {
      setError({
        code: 'RECORDING_FAILED',
        message: 'Failed to start recording',
        recoverable: true,
      });
    }
  }, [hookStartRecording, announce]);

  const handleStopRecording = useCallback(async () => {
    // Clear timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const blob = await hookStopRecording();
    if (blob) {
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setMode('review');
      announce('Recording stopped. Review your video.');
    } else {
      setError({
        code: 'RECORDING_FAILED',
        message: 'No video data captured',
        recoverable: true,
      });
      setMode('preview');
    }
  }, [hookStopRecording, announce]);

  // ===========================================================================
  // Review Handlers
  // ===========================================================================

  const handleRetake = useCallback(() => {
    // Revoke old URL to free memory
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsedTime(0);
    setMode('preview');
    setError(null);
    announce('Retaking video. Ready to record.');
  }, [recordedUrl, announce]);

  const handleAccept = useCallback(async () => {
    if (!recordedBlob) return;

    setIsProcessing(true);
    announce('Processing video...');

    try {
      // Generate thumbnail
      const thumbnail = await generateVideoThumbnail(recordedBlob);

      // Get duration
      const duration = await getVideoDuration(recordedBlob);

      // Create MediaItem
      const mediaItem: MediaItem = {
        id: generateUUID(),
        type: 'video',
        file: recordedBlob,
        thumbnail: thumbnail || undefined,
        order: state.mediaItems.length,
        metadata: {
          duration,
          mimeType: recordedBlob.type || 'video/mp4',
          fileSize: recordedBlob.size,
          source: 'capture',
        },
      };

      // Add to state
      addMedia(mediaItem);

      // Cleanup
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }

      // Navigate to add-more step
      goToStep('add-more');
    } catch (err) {
      console.error('Failed to process video:', err);
      setError({
        code: 'THUMBNAIL_FAILED',
        message: 'Failed to process video',
        recoverable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [recordedBlob, recordedUrl, state.mediaItems.length, addMedia, goToStep, announce]);

  // ===========================================================================
  // Camera Switch Handler
  // ===========================================================================

  const handleSwitchCamera = useCallback(async () => {
    if (mode === 'recording') return;
    await toggleFacingMode();
    announce(`Switched to ${facingMode === 'user' ? 'back' : 'front'} camera`);
  }, [mode, toggleFacingMode, facingMode, announce]);

  // ===========================================================================
  // Error Retry Handler
  // ===========================================================================

  const handleRetry = useCallback(async () => {
    setError(null);
    setMode('preview');
    await startCamera();
    announce('Retrying camera initialization');
  }, [startCamera, announce]);

  // ===========================================================================
  // Upload Fallback Handler
  // ===========================================================================

  const handleUploadFile = useCallback(() => {
    // Navigate to file upload step for video
    cleanup();
    goToStep('file-upload');
  }, [cleanup, goToStep]);

  // ===========================================================================
  // Keyboard Handler
  // ===========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'recording') {
          handleStopRecording();
        } else if (mode === 'review') {
          handleRetake();
        } else {
          prevStep();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleStopRecording, handleRetake, prevStep]);

  // ===========================================================================
  // Render: Error State
  // ===========================================================================

  if (componentError && mode !== 'review') {
    // Use CameraPermissionFallback for permission denied errors
    if (componentError.code === 'PERMISSION_DENIED') {
      return (
        <div className={className}>
          <CameraPermissionFallback
            contentType="video"
            onUploadFile={handleUploadFile}
            onTryAgain={handleRetry}
          />
          {/* Screen reader announcement */}
          <div ref={announceRef} className="sr-only" aria-live="polite" aria-atomic="true" />
        </div>
      );
    }

    // Generic error display for other errors
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-6', className)}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{componentError.message}</h2>
          <p className="text-gray-600 mb-6">{getErrorGuidance(componentError.code)}</p>
          {componentError.recoverable && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Try Again
            </button>
          )}
        </div>
        {/* Screen reader announcement */}
        <div ref={announceRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      </div>
    );
  }

  // ===========================================================================
  // Render: Loading State
  // ===========================================================================

  if (isLoading && mode === 'preview') {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}>
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" aria-hidden="true" />
        <p className="text-gray-600" role="status" aria-live="polite">
          Initializing camera...
        </p>
      </div>
    );
  }

  // ===========================================================================
  // Render: Review Mode
  // ===========================================================================

  if (mode === 'review' && recordedUrl) {
    return (
      <div className={cn('flex flex-col', className)}>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Review Your Video</h2>
          <p className="text-sm text-gray-600">Play to review, then accept or retake</p>
        </div>

        {/* Video Player */}
        <div className="relative w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={recordedUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full aspect-video rounded-lg"
            onError={() => {
              setError({
                code: 'RECORDING_FAILED',
                message: 'Failed to load video for playback',
                recoverable: true,
              });
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleRetake}
            disabled={isProcessing}
            className={cn(
              'inline-flex items-center px-6 py-3 min-w-[140px] justify-center',
              'bg-gray-100 text-gray-700 rounded-lg',
              'hover:bg-gray-200 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'active:scale-95',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Discard and record again"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Retake
          </button>

          <button
            type="button"
            onClick={handleAccept}
            disabled={isProcessing}
            className={cn(
              'inline-flex items-center px-6 py-3 min-w-[140px] justify-center',
              'bg-blue-600 text-white rounded-lg',
              'hover:bg-blue-700 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'active:scale-95',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Accept video"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Accept
              </>
            )}
          </button>
        </div>

        {/* Screen reader announcement */}
        <div ref={announceRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      </div>
    );
  }

  // ===========================================================================
  // Render: Preview/Recording Mode
  // ===========================================================================

  const remainingTime = maxDuration - elapsedTime;
  const showTimeWarning = mode === 'recording' && remainingTime <= 30;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'recording' ? 'Recording Video' : 'Record Video'}
        </h2>
        <p className="text-sm text-gray-600">
          {mode === 'recording'
            ? 'Recording in progress - tap stop when finished'
            : 'Position your camera and tap record to start'}
        </p>
      </div>

      {/* Camera Preview */}
      <div className="relative w-full max-w-2xl mx-auto">
        <CameraPreview
          stream={stream}
          isLoading={isLoading}
          error={cameraError}
          isMirrored={isMirrored}
          onMirrorToggle={() => setIsMirrored(!isMirrored)}
          facingMode={facingMode}
          aspectRatio={16 / 9}
          onRetry={handleRetry}
        />

        {/* Recording Indicator */}
        {mode === 'recording' && (
          <div
            className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full"
            role="status"
            aria-live="polite"
          >
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-white text-sm font-medium">REC</span>
          </div>
        )}

        {/* Timer Display */}
        {mode === 'recording' && (
          <div
            className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-full"
            aria-live="off"
          >
            <span
              className={cn(
                'font-mono text-sm',
                showTimeWarning ? 'text-red-400' : 'text-white'
              )}
            >
              {formatTime(elapsedTime)} / {formatTime(maxDuration)}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Camera Switch Button */}
        {hasMultipleCameras && (
          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={mode === 'recording'}
            className={cn(
              'p-4 rounded-full transition-all',
              'bg-gray-100 hover:bg-gray-200 text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              mode === 'recording' && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-6 w-6" />
          </button>
        )}

        {/* Record/Stop Button */}
        {mode === 'preview' ? (
          <button
            type="button"
            onClick={handleStartRecording}
            className={cn(
              'w-16 h-16 rounded-full transition-all',
              'bg-red-500 hover:bg-red-600',
              'flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
              'active:scale-95'
            )}
            aria-label="Start recording"
          >
            <Circle className="h-8 w-8 text-white fill-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStopRecording}
            className={cn(
              'w-16 h-16 rounded-full transition-all',
              'bg-gray-700 hover:bg-gray-800',
              'flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'active:scale-95'
            )}
            aria-label="Stop recording"
          >
            <Square className="h-6 w-6 text-white fill-white" />
          </button>
        )}

        {/* Spacer for symmetry when single camera */}
        {!hasMultipleCameras && <div className="w-14" />}
      </div>

      {/* Timer aria-live region for screen readers */}
      {mode === 'recording' && (
        <div className="sr-only" aria-live="polite">
          {elapsedTime % 30 === 0 && elapsedTime > 0 && (
            <span>{formatTime(remainingTime)} remaining</span>
          )}
        </div>
      )}

      {/* Screen reader announcement */}
      <div ref={announceRef} className="sr-only" aria-live="polite" aria-atomic="true" />
    </div>
  );
}

export default VideoCaptureStep;
