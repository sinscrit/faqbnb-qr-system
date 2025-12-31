/**
 * CameraPreview Component
 *
 * Displays live camera feed with loading, error, and mirror mode states.
 * Part of the ItemCapture wizard for media capture functionality.
 *
 * @module ItemCapture/components/shared/CameraPreview
 * @see docs/REQ-037-build-camerapreview-component-detailed.md
 * @lastModified 2025-12-31 (REQ-037)
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Loader2,
  AlertTriangle,
  Settings,
  RefreshCw,
  FlipHorizontal2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  MediaCaptureError,
  MediaCaptureErrorCode,
} from '../../ItemCapture.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the CameraPreview component
 */
export interface CameraPreviewProps {
  /** Media stream from useMediaCapture hook (null when inactive) */
  stream: MediaStream | null;

  /** Whether the camera is currently loading/initializing */
  isLoading: boolean;

  /** Error object from useMediaCapture (null when no error) */
  error: MediaCaptureError | null;

  /** Whether to mirror the video preview (for front-facing camera) */
  isMirrored: boolean;

  /** Callback to toggle mirror mode */
  onMirrorToggle?: () => void;

  /** Detected facing mode from useMediaCapture */
  facingMode?: 'user' | 'environment' | 'unknown';

  /** Optional aspect ratio (default: 16/9) */
  aspectRatio?: number;

  /** Optional additional CSS classes */
  className?: string;

  /** Whether the component is in a compact mode (e.g., thumbnail preview) */
  compact?: boolean;

  /** Callback when user wants to retry after error */
  onRetry?: () => void;

  /** Callback when user wants to open settings (permission denied) */
  onOpenSettings?: () => void;
}

// =============================================================================
// Sub-components
// =============================================================================

interface LoadingOverlayProps {
  compact?: boolean;
}

/**
 * Loading state overlay with spinner animation
 */
function LoadingOverlay({ compact = false }: LoadingOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn(
          'text-white animate-spin',
          compact ? 'h-8 w-8 mb-2' : 'h-12 w-12 mb-4'
        )}
        aria-hidden="true"
      />
      <span className={cn('text-white text-sm', compact && 'sr-only')}>
        Activating camera...
      </span>
    </div>
  );
}

interface ErrorDisplayProps {
  error: MediaCaptureError;
  onRetry?: () => void;
  onOpenSettings?: () => void;
  compact?: boolean;
}

/**
 * Get error-specific content based on error code
 */
function getErrorContent(code: MediaCaptureErrorCode) {
  switch (code) {
    case 'PERMISSION_DENIED':
      return {
        icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
        title: 'Camera Access Denied',
        showSettings: true,
      };
    case 'NO_DEVICE_FOUND':
      return {
        icon: <Camera className="h-12 w-12 text-gray-400" />,
        title: 'No Camera Found',
        showSettings: false,
      };
    case 'DEVICE_IN_USE':
      return {
        icon: <Camera className="h-12 w-12 text-orange-500" />,
        title: 'Camera In Use',
        showSettings: false,
      };
    case 'BROWSER_NOT_SUPPORTED':
      return {
        icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
        title: 'Browser Not Supported',
        showSettings: false,
      };
    default:
      return {
        icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
        title: 'Camera Error',
        showSettings: false,
      };
  }
}

/**
 * Error display with contextual messages and action buttons
 */
function ErrorDisplay({
  error,
  onRetry,
  onOpenSettings,
  compact = false,
}: ErrorDisplayProps) {
  const content = getErrorContent(error.code);

  if (compact) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-4"
        role="alert"
        aria-live="assertive"
      >
        {content.icon}
        <p className="text-white text-sm mt-2 text-center">{content.title}</p>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4">{content.icon}</div>
      <h3 className="text-white text-lg font-semibold mb-2">{content.title}</h3>
      <p className="text-gray-300 text-sm mb-4 max-w-xs">{error.message}</p>
      {error.action && (
        <p className="text-gray-400 text-xs mb-6">{error.action}</p>
      )}
      <div className="flex gap-3">
        {error.recoverable && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}
        {content.showSettings && onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            <Settings className="h-4 w-4 mr-2" />
            Open Settings
          </button>
        )}
      </div>
    </div>
  );
}

interface MirrorToggleProps {
  isMirrored: boolean;
  onToggle: () => void;
  compact?: boolean;
}

/**
 * Button to toggle mirror mode for front-facing camera
 */
function MirrorToggle({
  isMirrored,
  onToggle,
  compact = false,
}: MirrorToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'absolute p-2 rounded-full transition-colors',
        'bg-black/50 hover:bg-black/70',
        isMirrored && 'bg-blue-500/80 hover:bg-blue-500',
        compact ? 'bottom-2 right-2' : 'bottom-4 right-4',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black'
      )}
      aria-label={isMirrored ? 'Disable mirror mode' : 'Enable mirror mode'}
      aria-pressed={isMirrored}
      title={isMirrored ? 'Disable mirror mode' : 'Enable mirror mode'}
    >
      <FlipHorizontal2
        className={cn('text-white', compact ? 'h-4 w-4' : 'h-5 w-5')}
      />
    </button>
  );
}

/**
 * Placeholder display when no stream or state is active
 */
function PlaceholderDisplay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
      <Camera className="h-16 w-16 text-gray-600" aria-hidden="true" />
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * CameraPreview displays a live camera feed with loading, error,
 * and mirror mode states.
 *
 * @example
 * ```tsx
 * <CameraPreview
 *   stream={stream}
 *   isLoading={isLoading}
 *   error={error}
 *   isMirrored={isMirrored}
 *   onMirrorToggle={() => setIsMirrored(!isMirrored)}
 *   facingMode="user"
 * />
 * ```
 */
export function CameraPreview({
  stream,
  isLoading,
  error,
  isMirrored,
  onMirrorToggle,
  facingMode = 'unknown',
  aspectRatio = 16 / 9,
  className,
  compact = false,
  onRetry,
  onOpenSettings,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Bind media stream to video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (stream) {
      videoElement.srcObject = stream;

      const handleLoadedMetadata = () => setIsVideoReady(true);
      const handlePlay = () => setIsVideoReady(true);

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('play', handlePlay);

      videoElement.play().catch((err) => {
        console.warn('Video autoplay failed:', err);
      });

      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.srcObject = null;
        setIsVideoReady(false);
      };
    } else {
      videoElement.srcObject = null;
      setIsVideoReady(false);
    }
  }, [stream]);

  // Determine what to show based on state priority
  const showPlaceholder = !stream && !isLoading && !error;
  const showLoading = isLoading;
  const showError = error !== null;
  const showVideo = stream && !isLoading && !error;
  const showMirrorToggle = showVideo && facingMode === 'user' && onMirrorToggle;

  return (
    <div
      role="region"
      aria-label="Camera preview"
      className={cn(
        'relative overflow-hidden bg-black rounded-lg',
        'border border-gray-800 dark:border-gray-700',
        className
      )}
      style={{
        aspectRatio: `${aspectRatio}`,
        maxHeight: compact ? '200px' : undefined,
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-hidden="true"
        {...({ 'webkit-playsinline': 'true' } as React.HTMLAttributes<HTMLVideoElement>)}
        className={cn(
          'w-full h-full',
          compact ? 'object-contain' : 'object-cover',
          isMirrored && 'scale-x-[-1]'
        )}
      />

      {/* State Overlays */}
      {showPlaceholder && <PlaceholderDisplay />}
      {showLoading && <LoadingOverlay compact={compact} />}
      {showError && (
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          onOpenSettings={onOpenSettings}
          compact={compact}
        />
      )}

      {/* Controls */}
      {showMirrorToggle && (
        <MirrorToggle
          isMirrored={isMirrored}
          onToggle={onMirrorToggle}
          compact={compact}
        />
      )}
    </div>
  );
}
