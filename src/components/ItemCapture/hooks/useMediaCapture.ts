'use client';

/**
 * useMediaCapture Hook
 *
 * Provides camera enumeration, permission handling, video recording, and photo
 * capture capabilities for the ItemCapture component. Abstracts the MediaDevices
 * API with comprehensive error handling and iOS Safari compatibility.
 *
 * @module ItemCapture/hooks/useMediaCapture
 * @see docs/REQ-036-create-usemediacapture-hook-detailed.md
 * @see docs/req-029-ios-safari-compatibility-report.md
 * @lastModified 2025-12-31 (REQ-036)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  BrowserCapabilities,
  PermissionStatus,
  MediaCaptureError,
  MediaCaptureErrorCode,
  UseMediaCaptureOptions,
  UseMediaCaptureReturn,
  FacingMode,
} from '../ItemCapture.types';

// =============================================================================
// Constants
// =============================================================================

/** Default hook options */
const DEFAULT_OPTIONS: Required<UseMediaCaptureOptions> = {
  resolution: { width: 1920, height: 1080 },
  frameRate: 30,
  facingMode: 'environment',
  includeAudio: true,
  photoFormat: 'image/jpeg',
  photoQuality: 0.92,
  debug: false,
};

/** Retry configuration for transient errors */
const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000,
  retryableErrors: ['NotReadableError', 'AbortError'],
};

/** MIME type preference chain for video recording (iOS Safari compatible) */
const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', ''];

// =============================================================================
// Error Mapping
// =============================================================================

/**
 * Maps error codes to user-friendly messages and actions.
 */
const ERROR_MESSAGES: Record<
  MediaCaptureErrorCode,
  { message: string; action: string; recoverable: boolean }
> = {
  PERMISSION_DENIED: {
    message: 'Camera access was denied',
    action: 'Please allow camera access in your browser settings, then try again',
    recoverable: false,
  },
  PERMISSION_DISMISSED: {
    message: 'Camera permission request was dismissed',
    action: 'Please try again and allow camera access when prompted',
    recoverable: true,
  },
  NO_DEVICE_FOUND: {
    message: 'No camera found on this device',
    action: 'Connect a camera or try using a different device',
    recoverable: false,
  },
  DEVICE_IN_USE: {
    message: 'Camera is being used by another application',
    action: 'Close other apps using the camera, then try again',
    recoverable: true,
  },
  BROWSER_NOT_SUPPORTED: {
    message: "Your browser doesn't support camera access",
    action: 'Please use a modern browser like Chrome, Safari, or Firefox',
    recoverable: false,
  },
  STREAM_ERROR: {
    message: 'Camera connection was interrupted',
    action: 'Please try again',
    recoverable: true,
  },
  RECORDING_ERROR: {
    message: 'Video recording failed',
    action: 'Please try recording again',
    recoverable: true,
  },
  CONSTRAINT_ERROR: {
    message: "Camera doesn't support requested settings",
    action: 'Try using a different camera',
    recoverable: true,
  },
  CAPTURE_ERROR: {
    message: 'Failed to capture photo',
    action: 'Please try again',
    recoverable: true,
  },
  UNKNOWN_ERROR: {
    message: 'Something went wrong with the camera',
    action: 'Please refresh the page and try again',
    recoverable: true,
  },
};

/**
 * Maps native error names to MediaCaptureErrorCode.
 */
function mapNativeError(error: Error): MediaCaptureErrorCode {
  const name = error.name;
  const message = error.message?.toLowerCase() || '';

  switch (name) {
    case 'NotAllowedError':
      // Distinguish between denied and dismissed
      if (message.includes('dismissed') || message.includes('cancel')) {
        return 'PERMISSION_DISMISSED';
      }
      return 'PERMISSION_DENIED';

    case 'NotFoundError':
      return 'NO_DEVICE_FOUND';

    case 'NotReadableError':
      return 'DEVICE_IN_USE';

    case 'OverconstrainedError':
    case 'TypeError':
      return 'CONSTRAINT_ERROR';

    case 'AbortError':
      return 'STREAM_ERROR';

    case 'SecurityError':
      return 'PERMISSION_DENIED';

    default:
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Creates a MediaCaptureError from a code.
 */
function createError(
  code: MediaCaptureErrorCode,
  originalError?: Error
): MediaCaptureError {
  const errorInfo = ERROR_MESSAGES[code];
  return {
    code,
    message: errorInfo.message,
    action: errorInfo.action,
    recoverable: errorInfo.recoverable,
    originalError,
  };
}

/**
 * Creates a MediaCaptureError from a native error.
 */
function createErrorFromNative(error: Error): MediaCaptureError {
  const code = mapNativeError(error);
  return createError(code, error);
}

// =============================================================================
// Browser Capability Detection
// =============================================================================

/**
 * Detects browser capabilities for media capture.
 * SSR-safe - returns safe defaults when running on server.
 */
function detectCapabilities(): BrowserCapabilities {
  // SSR safety check
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      hasMediaDevices: false,
      hasGetUserMedia: false,
      hasMediaRecorder: false,
      hasEnumerateDevices: false,
      unsupportedReason: 'Running in server environment',
    };
  }

  const hasMediaDevices = typeof navigator !== 'undefined' && !!navigator.mediaDevices;
  const hasGetUserMedia = hasMediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
  const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';
  const hasEnumerateDevices = hasMediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function';

  const isSupported = hasMediaDevices && hasGetUserMedia && hasMediaRecorder && hasEnumerateDevices;

  let unsupportedReason: string | undefined;
  if (!isSupported) {
    // Check if this is likely an HTTPS issue (MediaDevices missing on non-localhost HTTP)
    const isHttpNonLocalhost = typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      !['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isHttpNonLocalhost && !hasMediaDevices) {
      unsupportedReason = 'Camera requires HTTPS connection';
    } else {
      const missing: string[] = [];
      if (!hasMediaDevices) missing.push('MediaDevices API');
      if (!hasGetUserMedia) missing.push('getUserMedia');
      if (!hasMediaRecorder) missing.push('MediaRecorder');
      if (!hasEnumerateDevices) missing.push('enumerateDevices');
      unsupportedReason = `Missing: ${missing.join(', ')}`;
    }
  }

  return {
    isSupported,
    hasMediaDevices,
    hasGetUserMedia,
    hasMediaRecorder,
    hasEnumerateDevices,
    unsupportedReason,
  };
}

/**
 * Selects the optimal MIME type for video recording.
 * Follows iOS Safari recommendations from REQ-029.
 */
function selectOptimalMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }

  for (const mimeType of VIDEO_MIME_TYPES) {
    if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return '';
}

// =============================================================================
// useMediaCapture Hook
// =============================================================================

/**
 * React hook for camera access, video recording, and photo capture.
 *
 * @example
 * ```tsx
 * const {
 *   capabilities,
 *   permissionStatus,
 *   stream,
 *   startCamera,
 *   stopCamera,
 *   startRecording,
 *   stopRecording,
 *   capturePhoto,
 *   error,
 * } = useMediaCapture({ facingMode: 'environment' });
 *
 * // Check browser support
 * if (!capabilities.isSupported) {
 *   return <p>{capabilities.unsupportedReason}</p>;
 * }
 *
 * // Start camera
 * await startCamera();
 *
 * // Capture photo
 * const photo = await capturePhoto();
 *
 * // Record video
 * await startRecording();
 * // ... later
 * const video = await stopRecording();
 * ```
 */
export function useMediaCapture(
  options: UseMediaCaptureOptions = {}
): UseMediaCaptureReturn {
  // Merge options with defaults
  const opts = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [options]
  );

  // Debug logging helper
  const log = useCallback(
    (...args: unknown[]) => {
      if (opts.debug) {
        console.log('[useMediaCapture]', ...args);
      }
    },
    [opts.debug]
  );

  // ==========================================================================
  // Browser Capabilities (memoized)
  // ==========================================================================

  const capabilities = useMemo(() => detectCapabilities(), []);

  // ==========================================================================
  // State
  // ==========================================================================

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<FacingMode>('unknown');
  const [error, setError] = useState<MediaCaptureError | null>(null);

  // ==========================================================================
  // Refs for cleanup and resource management
  // ==========================================================================

  const isUnmountedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const operationLockRef = useRef(false);

  // ==========================================================================
  // Helper: Safe state update (guards against unmount)
  // ==========================================================================

  const safeSetState = useCallback(
    <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T | ((prev: T) => T)) => {
      if (!isUnmountedRef.current) {
        setter(value);
      }
    },
    []
  );

  // ==========================================================================
  // Error handling
  // ==========================================================================

  const clearError = useCallback(() => {
    safeSetState(setError, null);
  }, [safeSetState]);

  const handleError = useCallback(
    (err: Error | MediaCaptureErrorCode, context?: string) => {
      const captureError =
        typeof err === 'string' ? createError(err) : createErrorFromNative(err);

      log('Error:', context, captureError);
      safeSetState(setError, captureError);
      return captureError;
    },
    [log, safeSetState]
  );

  // ==========================================================================
  // Device Enumeration (Task 2.1.3)
  // ==========================================================================

  const refreshDevices = useCallback(async () => {
    if (!capabilities.hasEnumerateDevices) {
      log('enumerateDevices not available');
      return;
    }

    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');

      // Handle empty labels (permission not yet granted)
      const devicesWithLabels = videoDevices.map((device, index) => {
        if (!device.label) {
          return {
            ...device,
            label: `Camera ${index + 1}`,
          } as MediaDeviceInfo;
        }
        return device;
      });

      log('Devices found:', devicesWithLabels.length);
      safeSetState(setDevices, devicesWithLabels);
    } catch (err) {
      log('Failed to enumerate devices:', err);
    }
  }, [capabilities.hasEnumerateDevices, log, safeSetState]);

  // Listen for device changes
  useEffect(() => {
    if (typeof window === 'undefined' || !capabilities.hasMediaDevices) {
      return;
    }

    const handleDeviceChange = () => {
      log('Device change detected');
      refreshDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [capabilities.hasMediaDevices, refreshDevices, log]);

  // ==========================================================================
  // Permission Handling (Task 2.1.4)
  // ==========================================================================

  /**
   * Check current permission status using Permissions API.
   */
  const checkPermissionStatus = useCallback(async (): Promise<PermissionStatus> => {
    if (typeof navigator === 'undefined') {
      return 'unavailable';
    }

    // Try Permissions API first (not available in all browsers)
    try {
      if ('permissions' in navigator) {
        // @ts-expect-error - 'camera' is not in the PermissionName type in all TS versions
        const result = await navigator.permissions.query({ name: 'camera' });
        const status = result.state === 'granted' ? 'granted' :
                       result.state === 'denied' ? 'denied' : 'prompt';
        return status;
      }
    } catch {
      // Permissions API not supported, fall through
      log('Permissions API not supported');
    }

    // Fallback: check if we have an active stream
    if (streamRef.current) {
      return 'granted';
    }

    return 'prompt';
  }, [log]);

  /**
   * Request camera permission by attempting to get a minimal stream.
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!capabilities.isSupported) {
      handleError('BROWSER_NOT_SUPPORTED');
      return false;
    }

    clearError();

    try {
      log('Requesting camera permission...');

      // Request a minimal stream to trigger permission prompt
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: opts.includeAudio,
      });

      // Stop the stream immediately - we just wanted to trigger the permission
      tempStream.getTracks().forEach((track) => track.stop());

      safeSetState(setPermissionStatus, 'granted');
      log('Permission granted');

      // Refresh devices now that we have permission (labels become available)
      await refreshDevices();

      return true;
    } catch (err) {
      const captureError = handleError(err as Error, 'requestPermission');

      if (captureError.code === 'PERMISSION_DENIED') {
        safeSetState(setPermissionStatus, 'denied');
      }

      return false;
    }
  }, [
    capabilities.isSupported,
    clearError,
    handleError,
    log,
    opts.includeAudio,
    refreshDevices,
    safeSetState,
  ]);

  // Initialize permission status and devices on mount
  useEffect(() => {
    if (!capabilities.isSupported) {
      return;
    }

    const init = async () => {
      const status = await checkPermissionStatus();
      safeSetState(setPermissionStatus, status);

      if (status === 'granted') {
        await refreshDevices();
      }
    };

    init();
  }, [capabilities.isSupported, checkPermissionStatus, refreshDevices, safeSetState]);

  // ==========================================================================
  // Camera Start/Stop (Task 2.1.5)
  // ==========================================================================

  /**
   * Detect facing mode from stream track settings.
   */
  const detectFacingMode = useCallback((mediaStream: MediaStream): FacingMode => {
    const videoTrack = mediaStream.getVideoTracks()[0];
    if (!videoTrack) return 'unknown';

    const settings = videoTrack.getSettings();
    if (settings.facingMode === 'user') return 'user';
    if (settings.facingMode === 'environment') return 'environment';
    return 'unknown';
  }, []);

  /**
   * Start the camera stream.
   */
  const startCamera = useCallback(
    async (deviceId?: string): Promise<boolean> => {
      if (!capabilities.isSupported) {
        handleError('BROWSER_NOT_SUPPORTED');
        return false;
      }

      // Prevent concurrent operations
      if (operationLockRef.current) {
        log('Operation in progress, skipping startCamera');
        return false;
      }

      operationLockRef.current = true;
      clearError();

      try {
        log('Starting camera...', { deviceId });

        // Build constraints
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: opts.resolution.width },
          height: { ideal: opts.resolution.height },
          frameRate: { ideal: opts.frameRate },
        };

        if (deviceId) {
          videoConstraints.deviceId = { exact: deviceId };
        } else {
          videoConstraints.facingMode = { ideal: opts.facingMode };
        }

        const constraints: MediaStreamConstraints = {
          video: videoConstraints,
          audio: opts.includeAudio,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

        // Store stream in both state and ref
        streamRef.current = newStream;
        safeSetState(setStream, newStream);
        safeSetState(setIsCameraActive, true);
        safeSetState(setPermissionStatus, 'granted');

        // Update device ID and facing mode
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          if (settings.deviceId) {
            safeSetState(setSelectedDeviceId, settings.deviceId);
          }
        }

        const detectedFacingMode = detectFacingMode(newStream);
        safeSetState(setFacingMode, detectedFacingMode);

        log('Camera started successfully');
        return true;
      } catch (err) {
        handleError(err as Error, 'startCamera');
        return false;
      } finally {
        operationLockRef.current = false;
      }
    },
    [
      capabilities.isSupported,
      clearError,
      detectFacingMode,
      handleError,
      log,
      opts.facingMode,
      opts.frameRate,
      opts.includeAudio,
      opts.resolution.height,
      opts.resolution.width,
      safeSetState,
    ]
  );

  /**
   * Stop the camera stream and release resources.
   */
  const stopCamera = useCallback(() => {
    log('Stopping camera...');

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        log('Track stopped:', track.kind);
      });
    }

    // Clear stream state
    streamRef.current = null;
    safeSetState(setStream, null);
    safeSetState(setIsCameraActive, false);

    log('Camera stopped');
  }, [log, safeSetState]);

  // ==========================================================================
  // Camera Switching (Task 2.1.6)
  // ==========================================================================

  /**
   * Switch to a different camera device.
   */
  const switchCamera = useCallback(
    async (deviceId: string): Promise<boolean> => {
      // Validate device exists
      const deviceExists = devices.some((d) => d.deviceId === deviceId);
      if (!deviceExists) {
        log('Device not found:', deviceId);
        return false;
      }

      if (operationLockRef.current) {
        log('Operation in progress, skipping switchCamera');
        return false;
      }

      operationLockRef.current = true;
      clearError();

      const previousDeviceId = selectedDeviceId;

      try {
        log('Switching camera to:', deviceId);

        // Stop current stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Start new stream with specific device
        const videoConstraints: MediaTrackConstraints = {
          deviceId: { exact: deviceId },
          width: { ideal: opts.resolution.width },
          height: { ideal: opts.resolution.height },
          frameRate: { ideal: opts.frameRate },
        };

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: opts.includeAudio,
        });

        streamRef.current = newStream;
        safeSetState(setStream, newStream);
        safeSetState(setSelectedDeviceId, deviceId);

        const detectedFacingMode = detectFacingMode(newStream);
        safeSetState(setFacingMode, detectedFacingMode);

        log('Camera switched successfully');
        return true;
      } catch (err) {
        // Revert to previous device on failure
        if (previousDeviceId && previousDeviceId !== deviceId) {
          log('Switch failed, reverting to previous device');
          try {
            await startCamera(previousDeviceId);
          } catch {
            // Revert also failed
          }
        }

        handleError(err as Error, 'switchCamera');
        return false;
      } finally {
        operationLockRef.current = false;
      }
    },
    [
      clearError,
      detectFacingMode,
      devices,
      handleError,
      log,
      opts.frameRate,
      opts.includeAudio,
      opts.resolution.height,
      opts.resolution.width,
      safeSetState,
      selectedDeviceId,
      startCamera,
    ]
  );

  /**
   * Toggle between front and back camera.
   */
  const toggleFacingMode = useCallback(async (): Promise<boolean> => {
    if (operationLockRef.current) {
      log('Operation in progress, skipping toggleFacingMode');
      return false;
    }

    operationLockRef.current = true;
    clearError();

    try {
      const targetFacingMode = facingMode === 'user' ? 'environment' : 'user';
      log('Toggling facing mode to:', targetFacingMode);

      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Request stream with opposite facing mode
      const videoConstraints: MediaTrackConstraints = {
        facingMode: { exact: targetFacingMode },
        width: { ideal: opts.resolution.width },
        height: { ideal: opts.resolution.height },
        frameRate: { ideal: opts.frameRate },
      };

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: opts.includeAudio,
      });

      streamRef.current = newStream;
      safeSetState(setStream, newStream);

      const detectedFacingMode = detectFacingMode(newStream);
      safeSetState(setFacingMode, detectedFacingMode);

      // Update selected device ID
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          safeSetState(setSelectedDeviceId, settings.deviceId);
        }
      }

      log('Facing mode toggled successfully');
      return true;
    } catch (err) {
      handleError(err as Error, 'toggleFacingMode');
      return false;
    } finally {
      operationLockRef.current = false;
    }
  }, [
    clearError,
    detectFacingMode,
    facingMode,
    handleError,
    log,
    opts.frameRate,
    opts.includeAudio,
    opts.resolution.height,
    opts.resolution.width,
    safeSetState,
  ]);

  // ==========================================================================
  // Video Recording (Task 2.1.7)
  // ==========================================================================

  /**
   * Start video recording.
   */
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!streamRef.current) {
      log('Cannot start recording: no active stream');
      handleError('STREAM_ERROR');
      return false;
    }

    if (isRecording || mediaRecorderRef.current) {
      log('Recording already in progress');
      return false;
    }

    clearError();

    try {
      log('Starting recording...');

      // Clear any previous chunks
      recordedChunksRef.current = [];

      // Select optimal MIME type
      const mimeType = selectOptimalMimeType();
      log('Using MIME type:', mimeType || 'browser default');

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(streamRef.current, options);

      // Handle data available
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          log('Chunk received:', event.data.size, 'bytes');
        }
      };

      // Handle errors
      recorder.onerror = (event) => {
        log('Recording error:', event);
        handleError('RECORDING_ERROR');
      };

      mediaRecorderRef.current = recorder;

      // Start recording (collect data every second for progressive recording)
      recorder.start(1000);

      safeSetState(setIsRecording, true);
      safeSetState(setRecordingTime, 0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        safeSetState(setRecordingTime, (prev) => prev + 1);
      }, 1000);

      log('Recording started');
      return true;
    } catch (err) {
      handleError(err as Error, 'startRecording');
      return false;
    }
  }, [clearError, handleError, isRecording, log, safeSetState]);

  /**
   * Stop video recording and return the recorded Blob.
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!mediaRecorderRef.current || !isRecording) {
      log('No active recording to stop');
      return null;
    }

    log('Stopping recording...');

    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current!;

      recorder.onstop = () => {
        log('Recording stopped');

        // Create final blob from chunks
        const chunks = recordedChunksRef.current;
        if (chunks.length === 0) {
          log('No data recorded');
          resolve(null);
          return;
        }

        const mimeType = recorder.mimeType || 'video/mp4';
        const blob = new Blob(chunks, { type: mimeType });

        log('Recorded blob:', blob.size, 'bytes,', mimeType);

        // Clear chunks
        recordedChunksRef.current = [];
        mediaRecorderRef.current = null;

        safeSetState(setIsRecording, false);
        safeSetState(setRecordingTime, 0);

        resolve(blob);
      };

      recorder.stop();
    });
  }, [isRecording, log, safeSetState]);

  // ==========================================================================
  // Photo Capture (Task 2.1.8)
  // ==========================================================================

  /**
   * Capture a photo from the current video stream.
   */
  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    if (!streamRef.current) {
      log('Cannot capture photo: no active stream');
      return null;
    }

    clearError();

    try {
      log('Capturing photo...');

      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) {
        log('No video track available');
        return null;
      }

      const settings = videoTrack.getSettings();
      const width = settings.width || opts.resolution.width;
      const height = settings.height || opts.resolution.height;

      // Create a temporary video element
      const video = document.createElement('video');
      video.srcObject = streamRef.current;
      video.muted = true;
      video.playsInline = true;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = () => reject(new Error('Failed to load video'));
      });

      // Create canvas and draw current frame
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(video, 0, 0, width, height);

      // Cleanup video element
      video.pause();
      video.srcObject = null;

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          opts.photoFormat,
          opts.photoQuality
        );
      });

      if (blob) {
        log('Photo captured:', blob.size, 'bytes');
      }

      return blob;
    } catch (err) {
      handleError(err as Error, 'capturePhoto');
      return null;
    }
  }, [
    clearError,
    handleError,
    log,
    opts.photoFormat,
    opts.photoQuality,
    opts.resolution.height,
    opts.resolution.width,
  ]);

  // ==========================================================================
  // Cleanup (Task 2.1.10)
  // ==========================================================================

  /**
   * Full cleanup of all media resources.
   */
  const cleanup = useCallback(() => {
    log('Performing full cleanup...');

    // Stop recording if active
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore errors during cleanup
      }
      mediaRecorderRef.current = null;
    }

    // Clear recording timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Clear recorded chunks
    recordedChunksRef.current = [];

    // Stop all stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Reset state
    safeSetState(setStream, null);
    safeSetState(setIsCameraActive, false);
    safeSetState(setIsRecording, false);
    safeSetState(setRecordingTime, 0);
    safeSetState(setError, null);

    log('Cleanup complete');
  }, [log, safeSetState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      log('Component unmounting, cleaning up...');

      // Stop recording
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore
        }
        mediaRecorderRef.current = null;
      }

      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Clear chunks
      recordedChunksRef.current = [];

      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [log]);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State
    capabilities,
    permissionStatus,
    devices,
    selectedDeviceId,
    stream,
    isCameraActive,
    isRecording,
    recordingTime,
    facingMode,
    error,

    // Actions
    requestPermission,
    refreshDevices,
    startCamera,
    stopCamera,
    switchCamera,
    toggleFacingMode,
    startRecording,
    stopRecording,
    capturePhoto,
    clearError,
    cleanup,
  };
}
