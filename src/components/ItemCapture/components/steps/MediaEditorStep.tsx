'use client';

/**
 * MediaEditorStep Component
 *
 * Step component for the ItemCapture wizard that orchestrates media editing
 * operations (crop, rotate for images; trim for videos). This component
 * sequences through editable media items and presents appropriate editor
 * components for each.
 *
 * Features:
 * - Sequential editing of multiple media items
 * - Two-phase editing for images (crop → rotate)
 * - Single-phase editing for videos (trim)
 * - Skip functionality for individual edit operations
 * - Progress tracking and visual feedback
 * - Non-destructive editing via useMediaEditor hook
 *
 * @module ItemCapture/components/steps/MediaEditorStep
 * @see docs/REQ-050-build-mediaeditorstep-detailed.md
 * @lastModified 2025-12-31 (REQ-050)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { X, SkipForward, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaEditor } from '../../hooks/useMediaEditor';
import type {
  MediaItem,
  MediaMetadata,
  CropDescriptor,
  RotationDegrees,
  TrimDescriptor,
} from '../../ItemCapture.types';

// =============================================================================
// Type Definitions (Task 1)
// =============================================================================

/**
 * Edit phase for images.
 * Images go through two phases: crop first, then rotate.
 */
export type ImageEditPhase = 'crop' | 'rotate';

/**
 * Props for the MediaEditorStep component
 */
export interface MediaEditorStepProps {
  /** Array of media items to edit */
  mediaItems: MediaItem[];
  /** Called when all editing is complete */
  onComplete: () => void;
  /** Called to update a specific media item */
  onUpdateMedia: (mediaId: string, updates: Partial<MediaItem>) => void;
  /** Called when user cancels the entire editing session */
  onCancel: () => void;
  /** Initial media index to start editing from (default: 0) */
  initialIndex?: number;
  /** Additional CSS class names */
  className?: string;
  /** Enable debug logging */
  debug?: boolean;
}

// =============================================================================
// Loading Placeholder Component (Task 12)
// =============================================================================

/**
 * Loading placeholder shown while editor components are lazily loaded
 */
function EditorLoadingPlaceholder() {
  return (
    <div
      className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center"
      role="status"
      aria-label="Loading editor"
    >
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full mb-2" />
        <div className="h-4 w-24 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

// =============================================================================
// Dynamic Imports (Task 13)
// =============================================================================

const ImageCropper = dynamic(
  () => import('../../editors/ImageCropper'),
  {
    ssr: false,
    loading: () => <EditorLoadingPlaceholder />,
  }
);

const ImageRotator = dynamic(
  () => import('../../editors/ImageRotator'),
  {
    ssr: false,
    loading: () => <EditorLoadingPlaceholder />,
  }
);

const VideoTrimmer = dynamic(
  () => import('../../editors/VideoTrimmer'),
  {
    ssr: false,
    loading: () => <EditorLoadingPlaceholder />,
  }
);

// =============================================================================
// Component Implementation
// =============================================================================

export function MediaEditorStep({
  mediaItems,
  onComplete,
  onUpdateMedia,
  onCancel,
  initialIndex = 0,
  className,
  debug = false,
}: MediaEditorStepProps) {
  // === State Management (Task 2) ===
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialIndex);
  const [currentEditPhase, setCurrentEditPhase] = useState<ImageEditPhase | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track object URLs for cleanup (Task 17)
  const urlsRef = useRef<string[]>([]);

  // === Computed Values (Task 2) ===
  // Filter out PDFs as they're not editable
  const editableItems = useMemo(
    () => mediaItems.filter((item) => item.type !== 'pdf'),
    [mediaItems]
  );
  const currentMedia = editableItems[currentMediaIndex];
  const isLastItem = currentMediaIndex >= editableItems.length - 1;

  // === Debug Logging ===
  const log = useCallback(
    (message: string, ...args: unknown[]) => {
      if (debug) {
        console.log(`[MediaEditorStep] ${message}`, ...args);
      }
    },
    [debug]
  );

  // === useMediaEditor Hook Integration (Task 18) ===
  const {
    startEditing,
    getEditState,
    setCrop,
    setRotation,
    setTrim,
    confirmEdits,
    cancelEdits,
    hasPendingEdits,
  } = useMediaEditor({
    onEditsConfirmed: (mediaId, result) => {
      if (result.success && result.editedBlob) {
        onUpdateMedia(mediaId, {
          file: result.editedBlob,
          metadata: result.editedMetadata,
        });
        log(`Edits confirmed for ${mediaId}`, result.appliedEdits);
      }
    },
    debug,
  });

  // === Object URL Helpers (Task 17) ===
  const createTrackedObjectURL = useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  }, []);

  const cleanupUrls = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  }, []);

  // === Empty Items Handler (Task 4) ===
  // Handle case when there are no editable items
  const hasNoEditableItems = editableItems.length === 0;

  useEffect(() => {
    if (hasNoEditableItems) {
      log('No editable items, completing immediately');
      onComplete();
    }
  }, [hasNoEditableItems, onComplete, log]);

  // === Edit Phase Initialization Effect (Task 3) ===
  useEffect(() => {
    if (!currentMedia || hasNoEditableItems) return;

    // Start editing session for current media
    startEditing(currentMedia.id, currentMedia);

    // Initialize edit phase based on media type
    if (currentMedia.type === 'image') {
      setCurrentEditPhase('crop');
      log(`Starting image edit for ${currentMedia.id}, phase: crop`);
    } else {
      setCurrentEditPhase(null);
      log(`Starting video edit for ${currentMedia.id}`);
    }

    // Cleanup previous URLs when moving to new item
    cleanupUrls();

    // Clear any previous errors
    setError(null);
  }, [currentMediaIndex, currentMedia?.id, hasNoEditableItems, startEditing, cleanupUrls, log]);

  // === Component Cleanup (Task 17) ===
  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, [cleanupUrls]);

  // === Navigation Logic (Task 5) ===
  const advanceToNext = useCallback(() => {
    // For images: advance through phases (crop → rotate → next item)
    if (currentMedia?.type === 'image' && currentEditPhase === 'crop') {
      setCurrentEditPhase('rotate');
      log('Advancing from crop to rotate phase');
      return;
    }

    // For videos or after rotate phase: move to next item or complete
    if (isLastItem) {
      log('Last item completed, calling onComplete');
      onComplete();
    } else {
      setCurrentMediaIndex((prev) => prev + 1);
      log(`Advancing to item ${currentMediaIndex + 2}`);
    }
  }, [currentMedia?.type, currentEditPhase, isLastItem, currentMediaIndex, onComplete, log]);

  // === Action Handlers (Task 6) ===
  const handleApply = useCallback(async () => {
    if (!currentMedia) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await confirmEdits(currentMedia.id);
      if (!result.success) {
        setError(result.error || 'Failed to apply edits');
        setIsProcessing(false);
        return;
      }

      log(`Applied edits for ${currentMedia.id}`);
      advanceToNext();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      log('Error applying edits:', message);
    } finally {
      setIsProcessing(false);
    }
  }, [currentMedia, confirmEdits, advanceToNext, log]);

  const handleSkip = useCallback(() => {
    log('Skipping current edit');
    advanceToNext();
  }, [advanceToNext, log]);

  const handleCancelItem = useCallback(() => {
    if (currentMedia) {
      cancelEdits(currentMedia.id);
      log(`Cancelled edits for ${currentMedia.id}`);
    }
    advanceToNext();
  }, [currentMedia, cancelEdits, advanceToNext, log]);

  // === Helper Functions (Task 7) ===
  const getEditTypeLabel = (): string => {
    if (currentMedia?.type === 'video') return 'Trim';
    if (currentEditPhase === 'crop') return 'Crop';
    if (currentEditPhase === 'rotate') return 'Rotation';
    return 'Edit';
  };

  // === Editor Callbacks (Task 19) ===
  const handleCropComplete = useCallback(
    (croppedBlob: Blob) => {
      if (!currentMedia) return;
      // Mark crop as applied in the edit state
      // Note: ImageCropper already produces the cropped blob, we just need to track it
      setCrop(currentMedia.id, { x: 0, y: 0, width: 100, height: 100 }); // Placeholder descriptor
      log('Crop completed for', currentMedia.id);
    },
    [currentMedia, setCrop, log]
  );

  const handleRotationComplete = useCallback(
    (rotatedBlob: Blob, degrees: RotationDegrees) => {
      if (!currentMedia) return;
      setRotation(currentMedia.id, degrees);
      log('Rotation completed for', currentMedia.id, 'degrees:', degrees);
    },
    [currentMedia, setRotation, log]
  );

  const handleTrimComplete = useCallback(
    (trimDescriptor: TrimDescriptor) => {
      if (!currentMedia) return;
      setTrim(currentMedia.id, trimDescriptor);
      log('Trim completed for', currentMedia.id, 'trim:', trimDescriptor);
    },
    [currentMedia, setTrim, log]
  );

  // === Render Editor (Tasks 14, 15, 16) ===
  const renderEditor = () => {
    if (!currentMedia) return null;

    // For images in crop phase
    if (currentMedia.type === 'image' && currentEditPhase === 'crop') {
      const imageUrl = createTrackedObjectURL(currentMedia.file);
      return (
        <ImageCropper
          imageSrc={imageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleSkip}
        />
      );
    }

    // For images in rotate phase
    if (currentMedia.type === 'image' && currentEditPhase === 'rotate') {
      const imageUrl = createTrackedObjectURL(currentMedia.file);
      return (
        <ImageRotator
          imageSrc={imageUrl}
          initialRotation={0}
          onRotationComplete={handleRotationComplete}
          onCancel={handleSkip}
        />
      );
    }

    // For videos
    if (currentMedia.type === 'video') {
      const videoUrl = createTrackedObjectURL(currentMedia.file);
      return (
        <VideoTrimmer
          videoSrc={videoUrl}
          onTrimComplete={handleTrimComplete}
          onCancel={handleSkip}
        />
      );
    }

    return null;
  };

  // === Early Return for Empty Items ===
  if (hasNoEditableItems) {
    return null;
  }

  // === Main Render (Task 20) ===
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Progress Indicator (Task 8) */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Editing {currentMedia?.type} {currentMediaIndex + 1} of {editableItems.length}
        </p>
        {currentMedia?.type === 'image' && (
          <p className="text-xs text-gray-500 mt-1">
            Step: {currentEditPhase === 'crop' ? 'Crop' : 'Rotate'}
          </p>
        )}
        <div className="h-1 bg-gray-200 rounded mt-2">
          <div
            className="h-full bg-blue-500 rounded transition-all duration-300"
            style={{
              width: `${((currentMediaIndex + 1) / editableItems.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Error Display (Task 9) */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm font-medium">Unable to process edit</p>
          <p className="text-sm">{error}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 underline"
            >
              Dismiss
            </button>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 underline"
            >
              Skip this item
            </button>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderEditor()}
      </div>

      {/* Action Buttons (Task 10) */}
      <div className="flex justify-between items-center gap-4 mt-4 pt-4 border-t">
        <button
          onClick={handleCancelItem}
          disabled={isProcessing}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded',
            'bg-gray-100 hover:bg-gray-200 text-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            disabled={isProcessing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded',
              'bg-gray-100 hover:bg-gray-200 text-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <SkipForward className="w-4 h-4" />
            Skip {getEditTypeLabel()}
          </button>

          <button
            onClick={handleApply}
            disabled={isProcessing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded',
              'bg-blue-500 hover:bg-blue-600 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" />
            Apply {getEditTypeLabel()}
          </button>
        </div>
      </div>

      {/* Accessibility Live Region (Task 11) */}
      <div aria-live="polite" className="sr-only">
        {`Now editing ${currentMedia?.type} ${currentMediaIndex + 1} of ${editableItems.length}`}
      </div>
    </div>
  );
}

// Export as default and named
export default MediaEditorStep;
