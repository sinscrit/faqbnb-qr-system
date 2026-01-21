'use client';

/**
 * ImageCropper Component
 *
 * Interactive image cropping component with aspect ratio presets, real-time preview,
 * and touch-friendly controls for mobile devices.
 *
 * This component is lazy-loaded only when user enters edit mode.
 * Import via: const ImageCropper = dynamic(() => import('./editors/ImageCropper'), { ssr: false });
 *
 * @module ItemCapture/editors/ImageCropper
 * @see docs/REQ-047-implement-imagecropper-detailed.md
 * @lastModified 2025-12-31
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './imageCropper.css';
import { cn } from '@/lib/utils';
import { executeCrop } from './cropUtils';

// =============================================================================
// Type Definitions (Task 1)
// =============================================================================

/**
 * Available aspect ratio presets for image cropping
 * - 'free': No aspect ratio constraint, any proportion allowed
 * - '1:1': Square crop (1:1 ratio)
 * - '4:3': Standard photo ratio
 * - '16:9': Widescreen ratio
 */
export type AspectRatioPreset = 'free' | '1:1' | '4:3' | '16:9';

/**
 * Props for the ImageCropper component
 */
export interface ImageCropperProps {
  /** Source URL of the image to crop (required) */
  imageSrc: string;
  /** Callback fired when crop is applied, receives the cropped image as a Blob (required) */
  onCropComplete: (croppedBlob: Blob) => void;
  /** Callback fired when user cancels the crop operation (required) */
  onCancel: () => void;
  /** Initial aspect ratio preset (default: 'free') */
  initialAspectRatio?: AspectRatioPreset;
  /** Minimum crop width in pixels (default: 50) */
  minWidth?: number;
  /** Minimum crop height in pixels (default: 50) */
  minHeight?: number;
  /** Output image format (default: 'image/jpeg') */
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Output image quality, 0-1 (default: 0.92) */
  outputQuality?: number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Mapping of aspect ratio presets to numeric values
 * undefined = free-form (no constraint)
 */
const ASPECT_RATIOS: Record<AspectRatioPreset, number | undefined> = {
  free: undefined,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
};

/**
 * Aspect ratio options for the toolbar
 */
const ASPECT_RATIO_OPTIONS: { value: AspectRatioPreset; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
];

/**
 * Maximum image dimension for safe processing on mobile devices
 */
const MAX_IMAGE_DIMENSION = 4096;

// =============================================================================
// Component Implementation
// =============================================================================

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  initialAspectRatio = 'free',
  minWidth = 50,
  minHeight = 50,
  outputFormat = 'image/jpeg',
  outputQuality = 0.92,
  className,
}: ImageCropperProps) {
  // Translations
  const tLoading = useTranslations('common.loading');

  // Crop state from react-image-crop
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  // UI state
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>(initialAspectRatio);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLargeImage, setIsLargeImage] = useState(false);

  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const urlsToCleanup = useRef<string[]>([]);

  // =============================================================================
  // Image Load Handler (Tasks 4, 12)
  // =============================================================================

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const { width, height, naturalWidth, naturalHeight } = img;

      setIsImageLoading(false);

      // Check for large images (Task 12)
      if (naturalWidth > MAX_IMAGE_DIMENSION || naturalHeight > MAX_IMAGE_DIMENSION) {
        console.warn(`Large image detected: ${naturalWidth}x${naturalHeight}`);
        setIsLargeImage(true);
      } else {
        setIsLargeImage(false);
      }

      // Initialize centered crop (Task 4)
      const aspectValue = ASPECT_RATIOS[aspectRatio];
      const newCrop = centerCrop(
        makeAspectCrop(
          { unit: '%', width: 80 },
          aspectValue ?? width / height,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
    },
    [aspectRatio]
  );

  // =============================================================================
  // Image Error Handler (Task 7)
  // =============================================================================

  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    setError('Failed to load image. Please try again.');
  }, []);

  // =============================================================================
  // Aspect Ratio Change Handler (Task 3)
  // =============================================================================

  const handleAspectRatioChange = useCallback(
    (newAspectRatio: AspectRatioPreset) => {
      setAspectRatio(newAspectRatio);

      // Reset crop when aspect ratio changes (Task 3)
      if (imageRef.current && crop) {
        const { width, height } = imageRef.current;
        const aspectValue = ASPECT_RATIOS[newAspectRatio];

        const newCrop = centerCrop(
          makeAspectCrop(
            { unit: '%', width: crop.width || 80 },
            aspectValue ?? width / height,
            width,
            height
          ),
          width,
          height
        );
        setCrop(newCrop);
        setCompletedCrop(null);
      }
    },
    [crop]
  );

  // =============================================================================
  // Preview Generation (Task 5)
  // =============================================================================

  const generatePreview = useCallback(
    async (cropData: PixelCrop) => {
      if (!imageRef.current || cropData.width < 10 || cropData.height < 10) {
        return;
      }

      try {
        const image = imageRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Calculate scaled crop dimensions
        const scaledWidth = cropData.width * scaleX;
        const scaledHeight = cropData.height * scaleY;

        // Create small preview canvas (max 150px)
        const maxPreviewSize = 150;
        const scale = Math.min(
          maxPreviewSize / scaledWidth,
          maxPreviewSize / scaledHeight,
          1
        );

        const previewWidth = scaledWidth * scale;
        const previewHeight = scaledHeight * scale;

        const canvas = document.createElement('canvas');
        canvas.width = previewWidth;
        canvas.height = previewHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
          image,
          cropData.x * scaleX,
          cropData.y * scaleY,
          scaledWidth,
          scaledHeight,
          0,
          0,
          previewWidth,
          previewHeight
        );

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.7);
        });

        if (blob) {
          const newUrl = URL.createObjectURL(blob);
          urlsToCleanup.current.push(newUrl);

          // Revoke previous URL if exists
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl(newUrl);
        }
      } catch (err) {
        console.error('Preview generation failed:', err);
      }
    },
    [previewUrl]
  );

  // Debounced preview update (Task 5)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (completedCrop) {
        generatePreview(completedCrop);
      }
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [completedCrop, generatePreview]);

  // =============================================================================
  // Apply Crop Handler (Task 6)
  // =============================================================================

  const handleApply = useCallback(async () => {
    if (!completedCrop || !imageRef.current) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const croppedBlob = await executeCrop(
        imageRef.current,
        completedCrop,
        outputFormat,
        outputQuality
      );
      onCropComplete(croppedBlob);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Crop operation failed';
      setError(message);
      console.error('Crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, outputFormat, outputQuality, onCropComplete]);

  // =============================================================================
  // Error Dismiss Handler (Task 7)
  // =============================================================================

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-dismiss error after 5 seconds (Task 7)
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  // =============================================================================
  // Cleanup Effects (Task 10)
  // =============================================================================

  // Clean up when imageSrc changes
  useEffect(() => {
    setCrop(undefined);
    setCompletedCrop(null);
    setPreviewUrl(null);
    setError(null);
    setIsImageLoading(true);
    setIsLargeImage(false);
  }, [imageSrc]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      urlsToCleanup.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div
      className={cn(
        'image-cropper-wrapper flex flex-col h-full',
        'px-2 sm:px-4',
        className
      )}
    >
      {/* Large Image Warning (Task 12) */}
      {isLargeImage && (
        <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-2">
          Large image detected. Output may be scaled down for compatibility.
        </div>
      )}

      {/* Aspect Ratio Toolbar (Task 3) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ASPECT_RATIO_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAspectRatioChange(option.value)}
            disabled={isProcessing}
            aria-pressed={aspectRatio === option.value}
            className={cn(
              'min-w-[44px] min-h-[44px] px-3 py-2 rounded font-medium text-sm',
              'transition-colors duration-150',
              aspectRatio === option.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Crop Area (Tasks 4, 8, 9, 11) */}
      <div className="image-cropper-container relative flex-1 min-h-0 max-h-[50vh] sm:max-h-[60vh]">
        {/* Loading State (Task 9) */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-pulse h-8 w-8 bg-gray-300 rounded-full" />
              <span className="text-sm text-gray-500">{tLoading('media.image')}</span>
            </div>
          </div>
        )}

        {/* Processing Overlay (Task 9) */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10 rounded">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm text-gray-600">{tLoading('status.applying')}</span>
            </div>
          </div>
        )}

        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={ASPECT_RATIOS[aspectRatio]}
          minWidth={minWidth}
          minHeight={minHeight}
          disabled={isProcessing}
          className={cn(
            'max-h-full',
            isProcessing && 'pointer-events-none'
          )}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            onLoad={onImageLoad}
            onError={handleImageError}
            className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain"
          />
        </ReactCrop>
      </div>

      {/* Preview Section (Task 5, 11) */}
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Preview:</span>
          <div className="w-[150px] h-[100px] bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Crop preview thumbnail"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-xs text-gray-400">
                {completedCrop ? 'Generating...' : 'Select area to preview'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Display (Task 7) */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={dismissError}
            className="text-red-500 hover:text-red-700 ml-2 text-lg leading-none"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Action Buttons (Tasks 6, 7, 11) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
        <button
          onClick={handleApply}
          disabled={isProcessing || !completedCrop}
          className={cn(
            'min-h-[44px] px-6 py-3 rounded font-medium text-sm',
            'bg-blue-500 text-white',
            'hover:bg-blue-600 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'sm:flex-1'
          )}
        >
          {isProcessing ? 'Applying...' : 'Apply Crop'}
        </button>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className={cn(
            'min-h-[44px] px-6 py-3 rounded font-medium text-sm',
            'bg-gray-200 text-gray-700',
            'hover:bg-gray-300 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'sm:flex-1'
          )}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
