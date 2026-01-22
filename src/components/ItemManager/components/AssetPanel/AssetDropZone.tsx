'use client';

/**
 * AssetDropZone Component
 *
 * A drag-and-drop file upload zone for adding media assets to items.
 * Reuses the battle-tested useFileUpload hook from ItemCapture.
 *
 * @module ItemManager/components/AssetPanel/AssetDropZone
 * @see docs/REQ-083-implement-assetdropzone-detailed.md
 * @lastModified 2026-01-03 (REQ-083 Task 1 - Initial component shell)
 */

import { useMemo, useCallback, useId } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Upload, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@/components/ItemCapture/hooks/useFileUpload';
import type { ValidatedFile } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Types
// =============================================================================

export interface AssetDropZoneProps {
  /** Callback when files are successfully selected/dropped */
  onFilesSelected: (files: File[]) => void;
  /** Allowed media types (default: all) */
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];
  /** Maximum file size in bytes (default: 100MB) */
  maxFileSize?: number;
  /** Maximum number of files allowed (default: 10) */
  maxFiles?: number;
  /** Allow multiple file selection (default: true) */
  multiple?: boolean;
  /** Current count of files already added (for remaining slots calculation) */
  currentFileCount?: number;
  /** Whether the drop zone is disabled */
  disabled?: boolean;
  /** Use compact mode with reduced height */
  compact?: boolean;
  /** Additional CSS class name */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Default maximum file size: 100MB */
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Default maximum number of files */
const DEFAULT_MAX_FILES = 10;

/** Media type to MIME type mapping */
const MEDIA_TYPE_MIME_MAP: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  pdf: ['application/pdf'],
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format file size to human-readable string.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// =============================================================================
// Component
// =============================================================================

/**
 * AssetDropZone - Drag-and-drop file upload zone for asset management.
 *
 * Features:
 * - Drag-and-drop file upload with visual feedback
 * - Click-to-select file picker
 * - File type and size validation
 * - Error/rejection display
 * - Compact and disabled modes
 * - Full keyboard and screen reader accessibility
 *
 * @example
 * ```tsx
 * <AssetDropZone
 *   onFilesSelected={(files) => handleAddAssets(files)}
 *   allowedMediaTypes={['image', 'video']}
 *   maxFileSize={50 * 1024 * 1024}
 *   compact={true}
 * />
 * ```
 */
export function AssetDropZone({
  onFilesSelected,
  allowedMediaTypes = ['video', 'image', 'pdf'],
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  multiple = true,
  currentFileCount = 0,
  disabled = false,
  compact = false,
  className,
}: AssetDropZoneProps) {
  // REQ-E02-079: i18n translations
  const t = useTranslations('media.dropZone');
  const tCommon = useTranslations('common.actions');

  // Generate unique IDs for accessibility
  const baseId = useId();
  const descriptionId = `${baseId}-description`;

  // ==========================================================================
  // Build MIME Types Array
  // ==========================================================================

  const allowedMimeTypes = useMemo(() => {
    const mimeTypes: string[] = [];
    for (const mediaType of allowedMediaTypes) {
      const mimes = MEDIA_TYPE_MIME_MAP[mediaType];
      if (mimes) {
        mimeTypes.push(...mimes);
      }
    }
    return mimeTypes;
  }, [allowedMediaTypes]);

  // ==========================================================================
  // Handle Files Added Callback
  // ==========================================================================

  const handleFilesAdded = useCallback(
    (validatedFiles: ValidatedFile[]) => {
      // Extract raw File objects from validated files
      const files = validatedFiles.map((vf) => vf.file);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  // ==========================================================================
  // Initialize useFileUpload Hook
  // ==========================================================================

  const remainingSlots = Math.max(0, maxFiles - currentFileCount);

  const {
    rejectedFiles,
    isDragActive,
    isDragValid,
    error,
    clearError,
    getDropZoneProps,
    getInputProps,
  } = useFileUpload({
    allowedMimeTypes,
    maxFileSize,
    maxFiles: remainingSlots,
    multiple,
    onFilesAdded: handleFilesAdded,
  });

  // ==========================================================================
  // Get Supported Type Labels for Display
  // ==========================================================================

  const supportedTypesLabel = useMemo(() => {
    const labels: string[] = [];
    if (allowedMediaTypes.includes('image')) labels.push(t('types.images'));
    if (allowedMediaTypes.includes('video')) labels.push(t('types.videos'));
    if (allowedMediaTypes.includes('pdf')) labels.push(t('types.pdfs'));
    return labels.join(', ');
  }, [allowedMediaTypes, t]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className={cn('space-y-3', className)}>
      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700">{error.message}</p>
            <button
              onClick={clearError}
              className="text-red-600 text-xs underline mt-1 hover:text-red-800"
            >
              {tCommon('dismiss')}
            </button>
          </div>
        </div>
      )}

      {/* Rejected Files Warning */}
      {rejectedFiles.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">
              {t('rejected.title', { count: rejectedFiles.length })}
            </p>
            <ul className="mt-1 space-y-0.5">
              {rejectedFiles.map((rejection, index) => (
                <li key={index} className="text-yellow-700 text-xs">
                  {rejection.file.name}: {rejection.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Drop Zone Container */}
      <div
        {...getDropZoneProps()}
        aria-disabled={disabled}
        aria-describedby={descriptionId}
        className={cn(
          // Base styles
          'border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          // Size variants
          compact ? 'p-4 min-h-[80px]' : 'p-6 min-h-[140px]',
          // State styles
          isDragActive && isDragValid && 'border-blue-500 bg-blue-50 border-solid',
          isDragActive && !isDragValid && 'border-red-500 bg-red-50 border-solid',
          !isDragActive && !disabled && 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none border-gray-200 bg-gray-100'
        )}
      >
        {/* Hidden File Input */}
        <input {...getInputProps()} />

        {/* Screen Reader Announcements */}
        <div aria-live="polite" className="sr-only">
          {isDragActive && isDragValid && t('dragActive.valid')}
          {isDragActive && !isDragValid && t('dragActive.invalid')}
        </div>

        {/* Drag Active State: Valid */}
        {isDragActive && isDragValid && (
          <div className="text-center text-blue-600">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">{t('dropFilesHere')}</p>
          </div>
        )}

        {/* Drag Active State: Invalid */}
        {isDragActive && !isDragValid && (
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">{t('invalidFileType')}</p>
          </div>
        )}

        {/* Empty State (default) */}
        {!isDragActive && (
          <div className="text-center">
            <Upload className={cn('mx-auto mb-2 text-gray-400', compact ? 'w-6 h-6' : 'w-8 h-8')} />
            <p className="text-gray-700 font-medium">
              {t('dragOrClick')}
            </p>
            {!compact && (
              <>
                <p id={descriptionId} className="text-gray-500 text-sm mt-1">
                  {t('supports', { types: supportedTypesLabel })}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t('maxFileSize', { size: formatFileSize(maxFileSize) })}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetDropZone;
