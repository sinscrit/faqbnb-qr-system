'use client';

/**
 * CameraPermissionFallback Component
 *
 * Displays alternative content input options when camera
 * access is denied or unavailable. Offers file upload as
 * a primary action and retry as secondary.
 *
 * @module ItemCapture/components/shared/CameraPermissionFallback
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05
 */

import { Camera, Upload, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

export interface CameraPermissionFallbackProps {
  /** The content type that was being captured (video/photo) */
  contentType: 'video' | 'photo';
  /** Callback when user wants to upload a file instead */
  onUploadFile: () => void;
  /** Callback when user clicks try again (after enabling permissions) */
  onTryAgain: () => void;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const CONTENT_TYPE_LABELS = {
  video: 'video',
  photo: 'photo',
} as const;

const CONTENT_TYPE_FILE_LABELS = {
  video: 'Upload Video Instead',
  photo: 'Upload Photo Instead',
} as const;

// =============================================================================
// Main Component
// =============================================================================

/**
 * Camera permission fallback UI with alternative options.
 * Follows Airbnb design system with clear action paths.
 */
export function CameraPermissionFallback({
  contentType,
  onUploadFile,
  onTryAgain,
  className,
}: CameraPermissionFallbackProps) {
  const contentLabel = CONTENT_TYPE_LABELS[contentType];
  const uploadLabel = CONTENT_TYPE_FILE_LABELS[contentType];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-6',
        className
      )}
    >
      <div className="text-center max-w-md">
        {/* Icon with Error Overlay */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-gray-400" aria-hidden="true" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-base font-bold">!</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Camera access denied
        </h2>

        {/* Explanation */}
        <p className="text-gray-600 mb-6">
          To capture a {contentLabel}, please allow camera access in your browser settings,
          or upload an existing {contentLabel} from your device.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          {/* Primary Action: Upload File */}
          <button
            type="button"
            onClick={onUploadFile}
            className={cn(
              'flex items-center justify-center gap-2',
              'px-6 py-3 min-h-[48px]',
              'text-base font-medium text-white rounded-lg',
              'bg-blue-600 hover:bg-blue-700',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            )}
            aria-label={uploadLabel}
          >
            <Upload className="w-5 h-5" aria-hidden="true" />
            {uploadLabel}
          </button>

          {/* Secondary Action: Try Again */}
          <button
            type="button"
            onClick={onTryAgain}
            className={cn(
              'flex items-center justify-center gap-2',
              'px-6 py-3 min-h-[48px]',
              'text-base font-medium text-gray-700 rounded-lg',
              'bg-gray-100 hover:bg-gray-200',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            )}
            aria-label="Try camera again"
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            Try Camera Again
          </button>
        </div>

        {/* Help Link */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <a
            href="https://support.google.com/chrome/answer/2693767"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1',
              'text-sm text-blue-600 hover:text-blue-800',
              'transition-colors duration-200',
              'focus:outline-none focus:underline'
            )}
          >
            How to enable camera access
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default CameraPermissionFallback;
