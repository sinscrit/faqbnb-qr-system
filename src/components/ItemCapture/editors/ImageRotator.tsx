'use client';

/**
 * ImageRotator Component
 *
 * Interactive image rotation component with 90-degree increments, smooth CSS
 * animations for preview, and canvas-based processing for actual rotation.
 *
 * This component is lazy-loaded only when user enters edit mode.
 * Import via: const ImageRotator = dynamic(() => import('./editors/ImageRotator'), { ssr: false });
 *
 * @module ItemCapture/editors/ImageRotator
 * @see docs/REQ-048-implement-imagerotator-detailed.md
 * @lastModified 2025-12-31
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type RotationDegrees,
  rotateImage,
  calculateNextRotation,
  ROTATION_ERROR_MESSAGES,
} from './rotationUtils';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Props for the ImageRotator component
 */
export interface ImageRotatorProps {
  /** Source image (URL string, Blob, or File) */
  imageSrc: string | Blob | File;
  /** Initial rotation in degrees (default: 0) */
  initialRotation?: RotationDegrees;
  /** Callback fired when rotation is applied */
  onRotationComplete: (rotatedBlob: Blob, rotation: RotationDegrees) => void;
  /** Callback fired when user cancels rotation */
  onCancel: () => void;
  /** Output image format (default: 'image/jpeg') */
  outputFormat?: 'image/jpeg' | 'image/png';
  /** Output image quality 0-1 (default: 0.92) */
  outputQuality?: number;
  /** Additional CSS class names */
  className?: string;
  /** Whether to show processing indicator (default: true) */
  showProcessingIndicator?: boolean;
}

/**
 * Internal state interface
 */
interface ImageRotatorState {
  currentRotation: RotationDegrees;
  isAnimating: boolean;
  isProcessing: boolean;
  error: string | null;
  imageUrl: string | null;
  isImageLoaded: boolean;
}

// =============================================================================
// Helper Function
// =============================================================================

/**
 * Convert various image source types to Blob
 */
async function fetchAsBlob(src: string | Blob | File): Promise<Blob> {
  if (src instanceof Blob) {
    return src;
  }
  const response = await fetch(src);
  return response.blob();
}

// =============================================================================
// Component Implementation
// =============================================================================

export default function ImageRotator({
  imageSrc,
  initialRotation = 0,
  onRotationComplete,
  onCancel,
  outputFormat = 'image/jpeg',
  outputQuality = 0.92,
  className,
  showProcessingIndicator = true,
}: ImageRotatorProps) {
  // ==========================================================================
  // State
  // ==========================================================================

  const [state, setState] = useState<ImageRotatorState>({
    currentRotation: initialRotation,
    isAnimating: false,
    isProcessing: false,
    error: null,
    imageUrl: null,
    isImageLoaded: false,
  });

  const { currentRotation, isAnimating, isProcessing, error, imageUrl, isImageLoaded } = state;

  // ==========================================================================
  // Refs
  // ==========================================================================

  const urlsToCleanup = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // Image Source Handling (Task 3)
  // ==========================================================================

  useEffect(() => {
    let isMounted = true;

    const setupImageUrl = async () => {
      try {
        let url: string;

        if (typeof imageSrc === 'string') {
          url = imageSrc;
        } else {
          // Blob or File
          url = URL.createObjectURL(imageSrc);
          urlsToCleanup.current.push(url);
        }

        if (isMounted) {
          setState((prev) => ({ ...prev, imageUrl: url, error: null }));
        }
      } catch (err) {
        console.error('Failed to create image URL:', err);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            error: ROTATION_ERROR_MESSAGES.IMAGE_LOAD_FAILED,
          }));
        }
      }
    };

    setupImageUrl();

    return () => {
      isMounted = false;
    };
  }, [imageSrc]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      urlsToCleanup.current.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // ==========================================================================
  // Animation Timing Handler (Task 5)
  // ==========================================================================

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, isAnimating: false }));
      }, 300); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isAnimating, currentRotation]);

  // ==========================================================================
  // Rotation Handlers (Task 5)
  // ==========================================================================

  const handleRotateLeft = useCallback(() => {
    if (isAnimating || isProcessing) return;

    setState((prev) => ({
      ...prev,
      isAnimating: true,
      currentRotation: calculateNextRotation(prev.currentRotation, 'left'),
      error: null,
    }));
  }, [isAnimating, isProcessing]);

  const handleRotateRight = useCallback(() => {
    if (isAnimating || isProcessing) return;

    setState((prev) => ({
      ...prev,
      isAnimating: true,
      currentRotation: calculateNextRotation(prev.currentRotation, 'right'),
      error: null,
    }));
  }, [isAnimating, isProcessing]);

  // ==========================================================================
  // Cancel Handler (Task 6)
  // ==========================================================================

  const handleCancel = useCallback(() => {
    // Cleanup any created URLs
    urlsToCleanup.current.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    urlsToCleanup.current = [];
    onCancel();
  }, [onCancel]);

  // ==========================================================================
  // Apply Handler (Task 6)
  // ==========================================================================

  const handleApply = useCallback(async () => {
    if (isProcessing || !imageUrl) return;

    setState((prev) => ({ ...prev, isProcessing: true, error: null }));

    // Minimum processing time to prevent flash
    const minProcessingTime = 300;
    const startTime = Date.now();

    try {
      // Fetch original as blob
      const sourceBlob = await fetchAsBlob(imageSrc);

      // If no rotation applied, return original
      if (currentRotation === 0) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minProcessingTime) {
          await new Promise((r) => setTimeout(r, minProcessingTime - elapsed));
        }
        onRotationComplete(sourceBlob, 0);
        return;
      }

      // Apply rotation
      const rotatedBlob = await rotateImage(
        sourceBlob,
        currentRotation,
        outputFormat,
        outputQuality
      );

      const elapsed = Date.now() - startTime;
      if (elapsed < minProcessingTime) {
        await new Promise((r) => setTimeout(r, minProcessingTime - elapsed));
      }

      onRotationComplete(rotatedBlob, currentRotation);
    } catch (err) {
      console.error('Rotation failed:', err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : ROTATION_ERROR_MESSAGES.ROTATION_FAILED,
        isProcessing: false,
      }));
    }
  }, [isProcessing, imageUrl, imageSrc, currentRotation, outputFormat, outputQuality, onRotationComplete]);

  // ==========================================================================
  // Error Handlers (Task 7)
  // ==========================================================================

  const handleRetry = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const handleImageLoad = useCallback(() => {
    setState((prev) => ({ ...prev, isImageLoaded: true, error: null }));
  }, []);

  const handleImageError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isImageLoaded: false,
      error: ROTATION_ERROR_MESSAGES.IMAGE_LOAD_FAILED,
    }));
  }, []);

  // ==========================================================================
  // Keyboard Shortcuts (Task 8)
  // ==========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing) return;

      // Don't handle if user is in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleRotateLeft();
      } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleRotateRight();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleApply();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, handleRotateLeft, handleRotateRight, handleCancel, handleApply]);

  // ==========================================================================
  // Screen Reader Announcements (Task 8)
  // ==========================================================================

  const getRotationAnnouncement = () => {
    return `Image rotated to ${currentRotation} degrees`;
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Image rotation editor"
      aria-busy={isProcessing}
      className={cn(
        'flex flex-col h-full',
        'px-2 sm:px-4',
        className
      )}
    >
      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isAnimating && getRotationAnnouncement()}
        {isProcessing && 'Processing rotation...'}
      </div>

      {/* Image Preview Area (Task 4) */}
      <div className="relative flex-1 min-h-0 max-h-[50vh] sm:max-h-[60vh] mb-4">
        <div
          className={cn(
            'relative w-full h-full overflow-hidden flex items-center justify-center',
            'bg-gray-100 rounded-lg'
          )}
        >
          {/* Loading State */}
          {!isImageLoaded && !error && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-pulse h-8 w-8 bg-gray-300 rounded-full" />
                <span className="text-sm text-gray-500">Loading image...</span>
              </div>
            </div>
          )}

          {/* Processing Overlay (Task 9) */}
          {isProcessing && showProcessingIndicator && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Applying rotation...</span>
              </div>
            </div>
          )}

          {/* Image with CSS Rotation */}
          {imageUrl && (
            <div
              className={cn(
                'motion-safe:transition-transform motion-safe:duration-300 ease-in-out',
                'flex items-center justify-center'
              )}
              style={{
                transform: `rotate(${currentRotation}deg)`,
                willChange: 'transform',
              }}
            >
              <img
                src={imageUrl}
                alt="Preview"
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={cn(
                  'max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain',
                  !isImageLoaded && 'opacity-0'
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Display (Task 7) */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">{error}</p>
            <button
              onClick={handleRetry}
              className="ml-4 text-red-700 hover:text-red-900 font-medium text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Rotation Controls (Task 5) */}
      <div className="flex justify-center gap-6 mb-4">
        <button
          onClick={handleRotateLeft}
          disabled={isAnimating || isProcessing || !!error}
          aria-label="Rotate image left 90 degrees"
          className={cn(
            'p-3 rounded-full transition-colors',
            'min-w-[48px] min-h-[48px]',
            'bg-gray-100 hover:bg-gray-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          <RotateCcw className="w-6 h-6" aria-hidden="true" />
        </button>

        <button
          onClick={handleRotateRight}
          disabled={isAnimating || isProcessing || !!error}
          aria-label="Rotate image right 90 degrees"
          className={cn(
            'p-3 rounded-full transition-colors',
            'min-w-[48px] min-h-[48px]',
            'bg-gray-100 hover:bg-gray-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          <RotateCw className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Rotation Info */}
      <div className="text-center text-sm text-gray-500 mb-4">
        Current rotation: {currentRotation}°
        {currentRotation !== initialRotation && (
          <span className="text-blue-500 ml-2">(modified)</span>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-center text-xs text-gray-400 mb-4 hidden sm:block">
        <span>Keyboard: </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←</kbd>
        <span> / </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">→</kbd>
        <span> to rotate, </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd>
        <span> to cancel, </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">⌘+Enter</kbd>
        <span> to apply</span>
      </div>

      {/* Action Buttons (Task 6) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          onClick={handleApply}
          disabled={isProcessing || !!error}
          className={cn(
            'min-h-[44px] px-6 py-3 rounded font-medium text-sm',
            'bg-blue-500 text-white',
            'hover:bg-blue-600 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'sm:flex-1'
          )}
        >
          {isProcessing ? 'Applying...' : 'Apply Rotation'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className={cn(
            'min-h-[44px] px-6 py-3 rounded font-medium text-sm',
            'bg-gray-200 text-gray-700',
            'hover:bg-gray-300 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
            'sm:flex-1'
          )}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
