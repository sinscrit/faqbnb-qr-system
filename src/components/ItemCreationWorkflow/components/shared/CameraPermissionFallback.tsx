'use client';

/**
 * CameraPermissionFallback Component
 *
 * Displays alternative content input options when camera
 * access is denied or unavailable.
 *
 * @module ItemCreationWorkflow/components/shared/CameraPermissionFallback
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-22 (REQ-E02-063 i18n Integration)
 */

import { useTranslations } from 'next-intl';
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
  // i18n (REQ-E02-063)
  const t = useTranslations('workflow.shared.cameraPermission');

  // Get content-type-specific labels
  const uploadLabel = contentType === 'video' ? t('uploadVideo') : t('uploadPhoto');

  return (
    <div
      className={cn(
        'bg-gray-50 border border-gray-200 rounded-lg p-6',
        'flex flex-col items-center text-center',
        className
      )}
    >
      {/* Icon with Error Overlay */}
      <div className="relative mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">!</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('title')}
      </h3>

      {/* Explanation */}
      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        {t('explanation', { contentType })}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* Primary Action: Upload File */}
        <button
          type="button"
          onClick={onUploadFile}
          className={cn(
            'flex items-center justify-center gap-2',
            'px-4 py-3 min-h-[48px]',
            'text-base font-medium text-white rounded-lg',
            'bg-[#FF385C] hover:bg-[#E31C5F]',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]'
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
            'px-4 py-3 min-h-[48px]',
            'text-base font-medium text-gray-700 rounded-lg',
            'bg-white border border-gray-300',
            'hover:bg-gray-50',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          )}
          aria-label={t('tryAgain')}
        >
          <RefreshCw className="w-5 h-5" aria-hidden="true" />
          {t('tryAgain')}
        </button>
      </div>

      {/* Help Link */}
      <div className="mt-6 pt-4 border-t border-gray-200 w-full">
        <a
          href="https://support.google.com/chrome/answer/2693767"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-1',
            'text-sm text-[#FF385C] hover:text-[#E31C5F]',
            'transition-colors duration-200',
            'focus:outline-none focus:underline'
          )}
        >
          {t('helpLink')}
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export default CameraPermissionFallback;
