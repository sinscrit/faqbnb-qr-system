'use client';

/**
 * PhotoCaptureStep Component
 *
 * Wizard step component for multi-photo capture within the Item Capture workflow.
 * Provides camera preview, photo capture with haptic feedback, thumbnail strip,
 * and gallery mode for reviewing captured photos.
 *
 * @module ItemCapture/components/steps/PhotoCaptureStep
 * @see docs/REQ-039-implement-photocapturestep-detailed.md
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05 (REQ-113 - Added CameraPermissionFallback integration)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Camera,
  SwitchCamera,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Zap,
  ZapOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CameraPreview } from '../shared/CameraPreview';
import { CameraPermissionFallback } from '../shared/CameraPermissionFallback';
import { StepNavigation } from '../shared/StepNavigation';
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
type PhotoCaptureMode = 'preview' | 'review' | 'gallery';

/**
 * Props for PhotoCaptureStep component.
 */
export interface PhotoCaptureStepProps {
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
 * Internal captured photo interface.
 */
interface CapturedPhoto {
  id: string;
  blob: Blob;
  url: string;
  thumbnailUrl: string;
  capturedAt: Date;
}

/**
 * Internal error interface for component-specific error handling.
 */
interface PhotoCaptureError {
  code: 'CAPTURE_FAILED' | 'MAX_PHOTOS_REACHED' | 'STORAGE_FULL' | 'PERMISSION_DENIED' | 'BROWSER_NOT_SUPPORTED';
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
 * Gets image dimensions from a blob.
 */
const getImageDimensions = (blob: Blob): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(blob);
  });
};

/**
 * Generates a thumbnail from an image blob.
 */
const generateImageThumbnail = (blob: Blob, maxWidth = 320): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      canvas.width = Math.min(maxWidth, img.naturalWidth);
      canvas.height = canvas.width / aspectRatio;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (thumbnailBlob) => {
          URL.revokeObjectURL(img.src);
          resolve(thumbnailBlob);
        },
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(null);
    };

    img.src = URL.createObjectURL(blob);
  });
};

/**
 * Maps hook errors to component-specific errors.
 */
const mapHookErrorToComponentError = (
  error: MediaCaptureError | null
): PhotoCaptureError | null => {
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
        message: 'Your browser does not support photo capture',
        recoverable: false,
      };
    case 'CAPTURE_ERROR':
    default:
      return {
        code: 'CAPTURE_FAILED',
        message: error.message || 'Photo capture failed',
        recoverable: true,
      };
  }
};

/**
 * Gets user-friendly guidance for error codes.
 */
const getErrorGuidance = (code: string, maxPhotos: number): string => {
  switch (code) {
    case 'PERMISSION_DENIED':
      return 'Please enable camera access in your browser settings to capture photos.';
    case 'BROWSER_NOT_SUPPORTED':
      return 'Please try Chrome, Safari, or Firefox.';
    case 'CAPTURE_FAILED':
      return 'Please check your camera and try again.';
    case 'MAX_PHOTOS_REACHED':
      return `You have reached the maximum of ${maxPhotos} photos. Remove a photo to add more.`;
    case 'STORAGE_FULL':
      return 'Device storage is full. Please free up space and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// =============================================================================
// Component
// =============================================================================

/**
 * PhotoCaptureStep provides multi-photo capture functionality within the wizard.
 *
 * Features:
 * - Live camera preview with mirror mode support
 * - Instant photo capture with haptic feedback
 * - Visual flash feedback on capture
 * - Photo review with accept/retake options
 * - Thumbnail strip for managing multiple photos
 * - Gallery mode for viewing previous captures
 * - Camera switching for multi-camera devices
 * - Comprehensive error handling
 * - Full keyboard and screen reader accessibility
 *
 * @example
 * ```tsx
 * <PhotoCaptureStep
 *   state={wizardState}
 *   addMedia={handleAddMedia}
 *   goToStep={handleGoToStep}
 *   prevStep={handlePrevStep}
 *   config={captureConfig}
 * />
 * ```
 */
export function PhotoCaptureStep({
  state,
  addMedia,
  goToStep,
  prevStep,
  config,
  className,
}: PhotoCaptureStepProps) {
  // ===========================================================================
  // Hook: Media Capture
  // ===========================================================================

  const {
    stream,
    isCameraActive,
    error: cameraError,
    permissionStatus,
    devices,
    facingMode,
    capabilities,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    cleanup,
  } = useMediaCapture({
    facingMode: 'environment',
    includeAudio: false,
    debug: config?.debug,
  });

  // ===========================================================================
  // State
  // ===========================================================================

  const [mode, setMode] = useState<PhotoCaptureMode>('preview');
  const [capturedPhoto, setCapturedPhoto] = useState<Blob | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<PhotoCaptureError | null>(null);
  const [isMirrored, setIsMirrored] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // ===========================================================================
  // Refs
  // ===========================================================================

  const announceRef = useRef<HTMLDivElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  // ===========================================================================
  // Derived Values
  // ===========================================================================

  const maxPhotos = config.maxPhotos ?? 10;
  const hasMultipleCameras = devices.length > 1;
  const componentError = error || mapHookErrorToComponentError(cameraError);
  const isLoading = !isCameraActive && !cameraError && permissionStatus !== 'denied';
  const isAtMaxPhotos = capturedPhotos.length >= maxPhotos;

  // ===========================================================================
  // Screen Reader Announcements
  // ===========================================================================

  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  // ===========================================================================
  // Haptic Feedback
  // ===========================================================================

  const triggerHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
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
      // Revoke all object URLs
      capturedPhotos.forEach((photo) => {
        URL.revokeObjectURL(photo.url);
        URL.revokeObjectURL(photo.thumbnailUrl);
      });
      if (capturedPhotoUrl) {
        URL.revokeObjectURL(capturedPhotoUrl);
      }
    };
  }, [capabilities.isSupported, capabilities.unsupportedReason, startCamera, cleanup]);

  // ===========================================================================
  // Mirror Mode Auto-Toggle
  // ===========================================================================

  useEffect(() => {
    setIsMirrored(facingMode === 'user');
  }, [facingMode]);

  // ===========================================================================
  // Photo Capture Handler
  // ===========================================================================

  const handleCapturePhoto = useCallback(async () => {
    // Check max photos limit
    if (capturedPhotos.length >= maxPhotos) {
      setError({
        code: 'MAX_PHOTOS_REACHED',
        message: `Maximum of ${maxPhotos} photos reached`,
        recoverable: false,
      });
      return;
    }

    setIsCapturing(true);
    triggerHaptic();

    // Visual flash feedback
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);

    try {
      const photoBlob = await capturePhoto();
      if (photoBlob) {
        const photoUrl = URL.createObjectURL(photoBlob);
        setCapturedPhoto(photoBlob);
        setCapturedPhotoUrl(photoUrl);
        setMode('review');
        announce('Photo captured. Review or retake.');
      }
    } catch (err) {
      setError({
        code: 'CAPTURE_FAILED',
        message: 'Failed to capture photo',
        recoverable: true,
      });
    } finally {
      setIsCapturing(false);
    }
  }, [capturePhoto, capturedPhotos.length, maxPhotos, triggerHaptic, announce]);

  // ===========================================================================
  // Review Handlers
  // ===========================================================================

  const handleRetake = useCallback(() => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhoto(null);
    setCapturedPhotoUrl(null);
    setMode('preview');
    setError(null);
    announce('Retaking photo. Ready to capture.');
  }, [capturedPhotoUrl, announce]);

  const handleAcceptPhoto = useCallback(async () => {
    if (!capturedPhoto || !capturedPhotoUrl) return;

    setIsCapturing(true);
    announce('Processing photo...');

    try {
      const id = generateUUID();
      const thumbnail = await generateImageThumbnail(capturedPhoto);
      const thumbnailUrl = thumbnail ? URL.createObjectURL(thumbnail) : capturedPhotoUrl;
      const dimensions = await getImageDimensions(capturedPhoto);

      // Add to local captured photos array
      const newPhoto: CapturedPhoto = {
        id,
        blob: capturedPhoto,
        url: capturedPhotoUrl,
        thumbnailUrl,
        capturedAt: new Date(),
      };
      setCapturedPhotos((prev) => [...prev, newPhoto]);

      // Create MediaItem for wizard state
      const mediaItem: MediaItem = {
        id,
        type: 'image',
        file: capturedPhoto,
        thumbnail: thumbnail || undefined,
        order: state.mediaItems.filter((m) => m.type === 'image').length,
        metadata: {
          dimensions,
          mimeType: capturedPhoto.type || 'image/jpeg',
          fileSize: capturedPhoto.size,
          source: 'capture',
        },
      };

      // Add to wizard state
      addMedia(mediaItem);

      // Reset for next capture
      setCapturedPhoto(null);
      setCapturedPhotoUrl(null);
      setMode('preview');
      announce('Photo added to collection.');

      // Scroll thumbnail strip to end
      setTimeout(() => {
        thumbnailStripRef.current?.scrollTo({ left: 9999, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError({
        code: 'CAPTURE_FAILED',
        message: 'Failed to process photo',
        recoverable: true,
      });
    } finally {
      setIsCapturing(false);
    }
  }, [capturedPhoto, capturedPhotoUrl, addMedia, state.mediaItems, announce]);

  // ===========================================================================
  // Thumbnail Strip Handlers
  // ===========================================================================

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setMode('gallery');
  }, []);

  const handleRemovePhoto = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCapturedPhotos((prev) => {
      const photo = prev[index];
      URL.revokeObjectURL(photo.url);
      URL.revokeObjectURL(photo.thumbnailUrl);
      return prev.filter((_, i) => i !== index);
    });
    announce('Photo removed.');
  }, [announce]);

  // ===========================================================================
  // Gallery Handlers
  // ===========================================================================

  const handleGalleryClose = useCallback(() => {
    setSelectedPhotoIndex(null);
    setMode('preview');
  }, []);

  const handleGalleryDelete = useCallback(() => {
    if (selectedPhotoIndex === null) return;

    const photo = capturedPhotos[selectedPhotoIndex];
    URL.revokeObjectURL(photo.url);
    URL.revokeObjectURL(photo.thumbnailUrl);

    setCapturedPhotos((prev) => prev.filter((_, i) => i !== selectedPhotoIndex));
    announce('Photo removed.');

    // Navigate or close
    if (capturedPhotos.length <= 1) {
      handleGalleryClose();
    } else if (selectedPhotoIndex >= capturedPhotos.length - 1) {
      setSelectedPhotoIndex(capturedPhotos.length - 2);
    }
  }, [selectedPhotoIndex, capturedPhotos, handleGalleryClose, announce]);

  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  }, [selectedPhotoIndex]);

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < capturedPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  }, [selectedPhotoIndex, capturedPhotos.length]);

  // ===========================================================================
  // Navigation Handlers
  // ===========================================================================

  const handleContinue = useCallback(() => {
    stopCamera();
    goToStep('add-more');
  }, [stopCamera, goToStep]);

  const handleBack = useCallback(() => {
    stopCamera();
    prevStep();
  }, [stopCamera, prevStep]);

  // ===========================================================================
  // Camera Switch Handler
  // ===========================================================================

  const handleSwitchCamera = useCallback(async () => {
    if (mode !== 'preview') return;
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
    // Navigate to file upload step for images
    cleanup();
    goToStep('file-upload');
  }, [cleanup, goToStep]);

  // ===========================================================================
  // Keyboard Handler
  // ===========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'gallery') {
          handleGalleryClose();
        } else if (mode === 'review') {
          handleRetake();
        }
      }

      // Gallery navigation
      if (mode === 'gallery') {
        if (e.key === 'ArrowLeft') {
          handlePrevPhoto();
        } else if (e.key === 'ArrowRight') {
          handleNextPhoto();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleGalleryClose, handleRetake, handlePrevPhoto, handleNextPhoto]);

  // ===========================================================================
  // Render: Error State
  // ===========================================================================

  if (componentError && mode !== 'review' && mode !== 'gallery') {
    // Use CameraPermissionFallback for permission denied errors
    if (componentError.code === 'PERMISSION_DENIED') {
      return (
        <div className={className}>
          <CameraPermissionFallback
            contentType="photo"
            onUploadFile={handleUploadFile}
            onTryAgain={handleRetry}
          />
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
          <p className="text-gray-600 mb-6">{getErrorGuidance(componentError.code, maxPhotos)}</p>
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
  // Render: Gallery Mode
  // ===========================================================================

  if (mode === 'gallery' && selectedPhotoIndex !== null && capturedPhotos[selectedPhotoIndex]) {
    const selectedPhoto = capturedPhotos[selectedPhotoIndex];
    const canGoPrev = selectedPhotoIndex > 0;
    const canGoNext = selectedPhotoIndex < capturedPhotos.length - 1;

    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" role="dialog" aria-modal="true" aria-label="Photo gallery">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            type="button"
            onClick={handleGalleryDelete}
            className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Delete photo"
          >
            <Trash2 className="h-6 w-6" />
          </button>
          <span className="text-white text-sm font-medium">
            {selectedPhotoIndex + 1} of {capturedPhotos.length}
          </span>
          <button
            type="button"
            onClick={handleGalleryClose}
            className="p-2 text-white hover:text-gray-300 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Photo Display */}
        <div className="flex-1 flex items-center justify-center relative px-4">
          {/* Previous Button */}
          {canGoPrev && (
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <img
            src={selectedPhoto.url}
            alt={`Photo ${selectedPhotoIndex + 1}`}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />

          {/* Next Button */}
          {canGoNext && (
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        <div ref={announceRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      </div>
    );
  }

  // ===========================================================================
  // Render: Review Mode
  // ===========================================================================

  if (mode === 'review' && capturedPhotoUrl) {
    return (
      <div className={cn('flex flex-col', className)}>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Review Your Photo</h2>
          <p className="text-sm text-gray-600">Accept to add or retake for a new shot</p>
        </div>

        {/* Photo Preview */}
        <div className="relative w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
          <img
            src={capturedPhotoUrl}
            alt="Captured photo preview"
            className="w-full max-h-[60vh] object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleRetake}
            disabled={isCapturing}
            className={cn(
              'inline-flex items-center px-6 py-3 min-w-[140px] justify-center',
              'bg-gray-100 text-gray-700 rounded-lg',
              'hover:bg-gray-200 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'active:scale-95',
              isCapturing && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Discard and capture again"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Retake
          </button>

          <button
            type="button"
            onClick={handleAcceptPhoto}
            disabled={isCapturing}
            className={cn(
              'inline-flex items-center px-6 py-3 min-w-[140px] justify-center',
              'bg-blue-600 text-white rounded-lg',
              'hover:bg-blue-700 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'active:scale-95',
              isCapturing && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Accept photo"
          >
            {isCapturing ? (
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

        <div ref={announceRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      </div>
    );
  }

  // ===========================================================================
  // Render: Preview Mode
  // ===========================================================================

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Capture Photos</h2>
        <p className="text-sm text-gray-600">
          Tap the capture button to take photos ({capturedPhotos.length} / {maxPhotos})
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
          aspectRatio={4 / 3}
          onRetry={handleRetry}
        />

        {/* Flash Overlay */}
        {showFlash && (
          <div
            className="absolute inset-0 bg-white pointer-events-none animate-pulse"
            style={{ animationDuration: '200ms' }}
          />
        )}

        {/* Flash Indicator (informational) */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full">
          <Zap className="h-4 w-4 text-yellow-400" aria-hidden="true" />
          <span className="text-white text-xs">Auto</span>
        </div>

        {/* Photo Count Badge */}
        {capturedPhotos.length > 0 && (
          <div
            className={cn(
              'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium',
              isAtMaxPhotos ? 'bg-orange-500 text-white' : 'bg-black/50 text-white'
            )}
          >
            {capturedPhotos.length} / {maxPhotos}
          </div>
        )}
      </div>

      {/* Capture Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Camera Switch Button */}
        {hasMultipleCameras && (
          <button
            type="button"
            onClick={handleSwitchCamera}
            className={cn(
              'p-4 rounded-full transition-all',
              'bg-gray-100 hover:bg-gray-200 text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            )}
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-6 w-6" />
          </button>
        )}

        {/* Capture Button - Smartphone style */}
        <button
          type="button"
          onClick={handleCapturePhoto}
          disabled={isCapturing || isAtMaxPhotos}
          className={cn(
            'w-[72px] h-[72px] rounded-full transition-all',
            'border-4 border-white shadow-lg',
            'flex items-center justify-center',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'active:scale-95',
            isAtMaxPhotos ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          )}
          aria-label="Capture photo"
        >
          {isCapturing ? (
            <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
          ) : (
            <div className={cn(
              'w-14 h-14 rounded-full transition-colors',
              isAtMaxPhotos ? 'bg-gray-400' : 'bg-blue-500'
            )} />
          )}
        </button>

        {/* Spacer for symmetry when single camera */}
        {!hasMultipleCameras && <div className="w-14" />}
      </div>

      {/* Thumbnail Strip */}
      {capturedPhotos.length > 0 && (
        <div className="mt-6 bg-gray-100 rounded-lg p-2">
          <div
            ref={thumbnailStripRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            role="listbox"
            aria-label="Captured photos"
          >
            {capturedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                role="option"
                aria-selected={selectedPhotoIndex === index}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer',
                  'ring-2 ring-transparent hover:ring-blue-300 transition-all',
                  selectedPhotoIndex === index && 'ring-blue-500'
                )}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemovePhoto(e, index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add More Placeholder */}
            {!isAtMaxPhotos && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-400">
                <Plus className="h-5 w-5" />
                <span className="text-xs mt-0.5">Add</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className={cn(
              'px-6 py-2 rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              capturedPhotos.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {capturedPhotos.length > 0 ? 'Continue' : 'Skip'}
          </button>
        </div>
      </div>

      <div ref={announceRef} className="sr-only" aria-live="polite" aria-atomic="true" />
    </div>
  );
}

export default PhotoCaptureStep;
