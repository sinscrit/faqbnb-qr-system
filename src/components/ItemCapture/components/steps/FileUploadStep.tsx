'use client';

/**
 * FileUploadStep Component
 *
 * Wizard step component for file upload within the Item Capture workflow.
 * Provides drag-and-drop file upload, click-to-select, file previews,
 * and comprehensive validation with user-friendly error handling.
 *
 * @module ItemCapture/components/steps/FileUploadStep
 * @see docs/REQ-042-implement-fileuploadstep-detailed.md
 * @lastModified 2025-12-31 (REQ-042)
 */

import React, { useCallback, useState, useEffect } from 'react';
import {
  Upload,
  Image,
  Video,
  FileText,
  File,
  X,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload } from '../../hooks/useFileUpload';
import {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
} from '../../utils/constants';
import type {
  ValidatedFile,
  FileRejection,
  FileUploadError,
  ItemCaptureState,
  MediaItem,
  WizardStep,
  ItemCaptureConfig,
} from '../../ItemCapture.types';

// =============================================================================
// Constants
// =============================================================================

/** Default maximum file size: 100MB */
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Default maximum total size: 200MB */
const DEFAULT_MAX_TOTAL_SIZE = 200 * 1024 * 1024;

/** Default maximum number of files */
const DEFAULT_MAX_FILES = 10;

/** Supported PDF MIME types */
const SUPPORTED_PDF_TYPES = ['application/pdf'] as const;

// =============================================================================
// Types
// =============================================================================

/**
 * Props for FileUploadStep component.
 */
export interface FileUploadStepProps {
  /** Current wizard state */
  state: ItemCaptureState;
  /** Callback to add uploaded media to state */
  addMedia: (media: MediaItem) => void;
  /** Callback to remove media from state */
  removeMedia: (id: string) => void;
  /** Callback to navigate to a specific step */
  goToStep: (step: WizardStep) => void;
  /** Callback to go to previous step */
  prevStep: () => void;
  /** Configuration for upload behavior */
  config: ItemCaptureConfig;
  /** Optional CSS class name for the root element */
  className?: string;
  /** Whether to show the step in compact mode (for modal use) */
  compact?: boolean;
}

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

/**
 * Get icon component for a file category.
 */
function getFileIcon(category: ValidatedFile['category']): React.ReactNode {
  const iconClass = 'h-12 w-12';

  switch (category) {
    case 'image':
      return <Image className={cn(iconClass, 'text-green-500')} />;
    case 'video':
      return <Video className={cn(iconClass, 'text-purple-500')} />;
    case 'pdf':
      return <FileText className={cn(iconClass, 'text-red-500')} />;
    default:
      return <File className={cn(iconClass, 'text-gray-500')} />;
  }
}

// =============================================================================
// Subcomponents
// =============================================================================

/**
 * FileCard displays a single uploaded file with preview and remove functionality.
 */
interface FileCardProps {
  file: ValidatedFile;
  onRemove: (id: string) => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
  const icon = getFileIcon(file.category);
  const sizeLabel = formatFileSize(file.size);

  return (
    <div className="relative group bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      {/* Thumbnail or Icon */}
      <div className="aspect-square rounded-md overflow-hidden bg-gray-100 mb-2 flex items-center justify-center relative">
        {file.previewUrl && file.category === 'image' ? (
          <img
            src={file.previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : file.previewUrl && file.category === 'video' ? (
          <>
            <video
              src={file.previewUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            {/* Video play indicator overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Video className="h-8 w-8 text-white" />
            </div>
          </>
        ) : (
          <div className="p-4">{icon}</div>
        )}
      </div>

      {/* File info */}
      <p
        className="text-sm font-medium text-gray-700 truncate"
        title={file.name}
      >
        {file.name}
      </p>
      <p className="text-xs text-gray-500">{sizeLabel}</p>

      {/* Remove button - always visible on mobile, hover on desktop */}
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className={cn(
          'absolute top-1 right-1 p-2 rounded-full',
          'bg-red-100 text-red-600',
          'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
          'transition-opacity hover:bg-red-200',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:opacity-100'
        )}
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * ErrorDisplay shows hook-level errors and file rejections.
 */
interface ErrorDisplayProps {
  error: FileUploadError | null;
  rejectedFiles: FileRejection[];
  onDismissError: () => void;
  onClearRejections: () => void;
  showRejections: boolean;
}

function ErrorDisplay({
  error,
  rejectedFiles,
  onDismissError,
  onClearRejections,
  showRejections,
}: ErrorDisplayProps) {
  if (!error && (!showRejections || rejectedFiles.length === 0)) return null;

  return (
    <div className="space-y-3">
      {/* Hook-level error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{error.message}</p>
            <p className="text-red-600 text-sm mt-1">{error.action}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            aria-label="Dismiss error"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Rejected files list */}
      {showRejections && rejectedFiles.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-800 font-medium">
              {rejectedFiles.length} file
              {rejectedFiles.length > 1 ? 's' : ''} couldn&apos;t be added
            </p>
            <button
              type="button"
              onClick={onClearRejections}
              className="text-yellow-600 hover:text-yellow-800 text-sm underline focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-1">
            {rejectedFiles.map((rejection, index) => (
              <li key={index} className="text-sm text-yellow-700">
                <span className="font-medium">{rejection.file.name}</span>
                {' — '}
                {rejection.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * UploadProgress shows file count and total size progress.
 */
interface UploadProgressProps {
  fileCount: number;
  maxFiles: number;
  totalSize: number;
  maxTotalSize: number;
}

function UploadProgress({
  fileCount,
  maxFiles,
  totalSize,
  maxTotalSize,
}: UploadProgressProps) {
  const sizePercent = Math.min((totalSize / maxTotalSize) * 100, 100);
  const countText = `${fileCount}/${maxFiles} files`;
  const sizeText = `${formatFileSize(totalSize)} / ${formatFileSize(maxTotalSize)}`;

  return (
    <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
      <span>{countText}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              sizePercent > 80 ? 'bg-red-500' : 'bg-blue-500'
            )}
            style={{ width: `${sizePercent}%` }}
            role="progressbar"
            aria-valuenow={sizePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload size progress"
          />
        </div>
        <span>{sizeText}</span>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * FileUploadStep provides file upload functionality within the wizard.
 *
 * Features:
 * - Drag-and-drop file upload with visual feedback
 * - Click-to-select file picker
 * - File type and size validation
 * - Preview thumbnails for images and videos
 * - Icons for PDF and other file types
 * - Responsive grid layout for file cards
 * - Progress indicator showing file count and total size
 * - Comprehensive error handling with dismissible messages
 * - Full keyboard and screen reader accessibility
 *
 * @example
 * ```tsx
 * <FileUploadStep
 *   state={wizardState}
 *   addMedia={handleAddMedia}
 *   removeMedia={handleRemoveMedia}
 *   goToStep={handleGoToStep}
 *   prevStep={handlePrevStep}
 *   config={captureConfig}
 * />
 * ```
 */
export function FileUploadStep({
  state,
  addMedia,
  removeMedia,
  config,
  goToStep,
  prevStep,
  className,
  compact = false,
}: FileUploadStepProps) {
  // ===========================================================================
  // Configuration
  // ===========================================================================

  const maxFileSize = config.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
  const maxTotalSize = config.maxTotalSize ?? DEFAULT_MAX_TOTAL_SIZE;
  const maxFiles = config.maxPhotos ?? DEFAULT_MAX_FILES;

  // Build allowed MIME types from config
  const allowedMimeTypes = React.useMemo(() => {
    const types: string[] = [];
    const allowed = config.allowedMediaTypes ?? ['image', 'video', 'pdf'];

    if (allowed.includes('image')) {
      types.push(...SUPPORTED_IMAGE_TYPES);
    }
    if (allowed.includes('video')) {
      types.push(...SUPPORTED_VIDEO_TYPES);
    }
    if (allowed.includes('pdf')) {
      types.push(...SUPPORTED_PDF_TYPES);
    }

    return types;
  }, [config.allowedMediaTypes]);

  // ===========================================================================
  // Rejection Display State
  // ===========================================================================

  const [clearedRejections, setClearedRejections] = useState(false);

  // ===========================================================================
  // File Upload Hook Integration
  // ===========================================================================

  const handleFilesAdded = useCallback(
    (newFiles: ValidatedFile[]) => {
      newFiles.forEach((vf) => {
        const mediaItem: MediaItem = {
          id: vf.id,
          type: vf.category === 'pdf' ? 'pdf' : vf.category === 'video' ? 'video' : 'image',
          file: vf.file,
          thumbnail: undefined, // Will be generated by thumbnail utility
          order: state.mediaItems.length, // Assign order based on current count
          metadata: {
            mimeType: vf.mimeType,
            fileSize: vf.size,
            originalFilename: vf.name,
            source: 'upload',
          },
        };
        addMedia(mediaItem);
      });
    },
    [addMedia, state.mediaItems.length]
  );

  const {
    files,
    rejectedFiles,
    isDragActive,
    isDragValid,
    error,
    totalSize,
    hasFiles,
    removeFile,
    getDropZoneProps,
    getInputProps,
    clearError,
    openFilePicker,
  } = useFileUpload({
    allowedMimeTypes,
    maxFileSize,
    maxTotalSize,
    maxFiles,
    onFilesAdded: handleFilesAdded,
  });

  // ===========================================================================
  // Reset cleared rejections when new ones come in
  // ===========================================================================

  useEffect(() => {
    if (rejectedFiles.length > 0) {
      setClearedRejections(false);
    }
  }, [rejectedFiles]);

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const handleRemove = useCallback(
    (id: string) => {
      removeFile(id);
      removeMedia(id);
    },
    [removeFile, removeMedia]
  );

  const handleClearRejections = useCallback(() => {
    setClearedRejections(true);
  }, []);

  const handleContinue = useCallback(() => {
    goToStep('add-more');
  }, [goToStep]);

  const handleBack = useCallback(() => {
    prevStep();
  }, [prevStep]);

  // Keyboard handler for drop zone
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFilePicker();
      }
    },
    [openFilePicker]
  );

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {!compact && (
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
          <p className="text-sm text-gray-600">
            Drag and drop files or click to select
          </p>
        </div>
      )}

      {/* Error Display */}
      <ErrorDisplay
        error={error}
        rejectedFiles={rejectedFiles}
        onDismissError={clearError}
        onClearRejections={handleClearRejections}
        showRejections={!clearedRejections}
      />

      {/* Drop Zone */}
      <div
        {...getDropZoneProps()}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles
          'relative border-2 border-dashed rounded-xl',
          'flex flex-col items-center justify-center',
          'transition-colors duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',

          // Size based on compact mode and file state
          hasFiles && !compact ? 'p-6 min-h-[120px]' : 'p-8 min-h-[200px]',

          // Default state
          !isDragActive &&
            'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100',

          // Drag valid state
          isDragActive && isDragValid && 'border-blue-500 bg-blue-50',

          // Drag invalid state
          isDragActive && !isDragValid && 'border-red-500 bg-red-50'
        )}
      >
        <input {...getInputProps()} />

        {/* Icon - only show when no files */}
        {!hasFiles && (
          <div
            className={cn(
              'p-4 rounded-full mb-4',
              isDragActive && isDragValid && 'bg-blue-100 text-blue-600',
              isDragActive && !isDragValid && 'bg-red-100 text-red-600',
              !isDragActive && 'bg-gray-200 text-gray-500'
            )}
          >
            <Upload className="h-8 w-8" />
          </div>
        )}

        {/* Conditional text content */}
        {isDragActive ? (
          isDragValid ? (
            <p className="text-blue-600 font-medium">Drop files here</p>
          ) : (
            <p className="text-red-600 font-medium">Invalid file type</p>
          )
        ) : hasFiles ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Plus className="h-5 w-5" />
            <span>Add more files</span>
          </div>
        ) : (
          <>
            <p className="text-gray-700 font-medium">
              Drag files here or click to browse
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Supports images, videos, and PDF files
            </p>
            <p className="text-gray-400 text-xs mt-4">
              Max {maxFiles} files, {formatFileSize(maxFileSize)} each
            </p>
          </>
        )}
      </div>

      {/* File Grid and Progress */}
      {hasFiles && (
        <>
          <div
            className={cn(
              'grid gap-3',
              compact
                ? 'grid-cols-3 sm:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            )}
          >
            {files.map((file) => (
              <FileCard key={file.id} file={file} onRemove={handleRemove} />
            ))}
          </div>

          <UploadProgress
            fileCount={files.length}
            maxFiles={maxFiles}
            totalSize={totalSize}
            maxTotalSize={maxTotalSize}
          />
        </>
      )}

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {hasFiles && `${files.length} files uploaded`}
      </div>

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
              hasFiles
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {hasFiles ? 'Continue' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUploadStep;
