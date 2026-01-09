'use client';

/**
 * useFileUpload Hook
 *
 * A comprehensive file upload hook providing:
 * - File type and size validation
 * - Drag-and-drop support with visual feedback
 * - Click-to-select file picking
 * - Preview URL generation and cleanup
 * - Accessibility support (keyboard navigation, ARIA)
 *
 * @module ItemCapture/hooks/useFileUpload
 * @see docs/REQ-041-create-usefileupload-hook-detailed.md
 * @lastModified 2025-12-31 (REQ-052 - Added type-specific size validation from CAPTURE_CONSTRAINTS)
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type {
  UseFileUploadOptions,
  UseFileUploadReturn,
  ValidatedFile,
  FileRejection,
  FileRejectionCode,
  FileUploadError,
  FileValidationResult,
  FileCategory,
  DropZoneProps,
  InputProps,
} from '../ItemCapture.types';
import { SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES, CAPTURE_CONSTRAINTS, SUPPORTED_FORMATS } from '../utils/constants';
import {
  validateFileSize as validateFileSizeLimit,
  validateMimeType as validateMimeTypeFormat,
  getMediaTypeFromMime,
  formatFileSize as formatFileSizeUtil,
} from '../utils/validation';

// =============================================================================
// Constants
// =============================================================================

/** Default maximum file size: 100MB */
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Default maximum total size: 200MB */
const DEFAULT_MAX_TOTAL_SIZE = 200 * 1024 * 1024;

/** Default maximum number of files */
const DEFAULT_MAX_FILES = 10;

/** Default allowed MIME types */
const DEFAULT_ALLOWED_MIME_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  'application/pdf',
];

// =============================================================================
// Error Messages
// =============================================================================

const ERROR_MESSAGES = {
  FILE_TYPE_NOT_ALLOWED: {
    getMessage: (filename: string) =>
      `"${filename}" is not a supported file type`,
    getAction: (allowedLabels: string[]) =>
      `Allowed types: ${allowedLabels.join(', ')}`,
  },
  FILE_TOO_LARGE: {
    getMessage: (filename: string, fileSizeMB: string, maxSizeMB: string) =>
      `"${filename}" (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit`,
    getAction: () => 'Please select a smaller file or compress this one',
  },
  TOTAL_SIZE_EXCEEDED: {
    getMessage: (filename: string) =>
      `Adding "${filename}" would exceed the total size limit`,
    getAction: (maxTotalMB: string) =>
      `Total limit is ${maxTotalMB}MB. Remove some files first.`,
  },
  MAX_FILES_EXCEEDED: {
    getMessage: (maxFiles: number) =>
      `Maximum of ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`,
    getAction: () => 'Remove some files before adding more',
  },
  EMPTY_FILE: {
    getMessage: (filename: string) => `"${filename}" appears to be empty`,
    getAction: () => 'Please select a different file',
  },
  VALIDATION_ERROR: {
    getMessage: (filename: string) =>
      `Unable to validate "${filename}"`,
    getAction: () => 'Please try again or select a different file',
  },
} as const;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a UUID v4.
 * Uses crypto.randomUUID if available, falls back to a simple implementation.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Categorize a file based on its MIME type.
 */
function categorizeFile(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  return 'other';
}

/**
 * Convert MIME types to user-friendly labels.
 */
function getAllowedTypeLabels(mimeTypes: string[]): string[] {
  const labels = new Set<string>();

  for (const mime of mimeTypes) {
    if (mime === 'image/*' || mime.startsWith('image/')) {
      labels.add('Images');
    } else if (mime === 'video/*' || mime.startsWith('video/')) {
      labels.add('Videos');
    } else if (mime === 'application/pdf') {
      labels.add('PDF');
    } else if (mime === 'audio/*' || mime.startsWith('audio/')) {
      labels.add('Audio');
    } else {
      // Extract extension from specific types
      const parts = mime.split('/');
      if (parts.length === 2) {
        labels.add(parts[1].toUpperCase());
      }
    }
  }

  return Array.from(labels);
}

/**
 * Extract file extension from filename.
 */
function getExtensionFromFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Format file size to human-readable string.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i > 1 ? 2 : 0)} ${units[i]}`;
}

/**
 * Format bytes to MB with 1 decimal place.
 */
function bytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/**
 * Normalize MIME type by removing codec information.
 * e.g., "video/mp4; codecs=avc1.42000a,mp4a.40.2" -> "video/mp4"
 */
function normalizeMimeType(mimeType: string): string {
  return mimeType.split(';')[0].trim();
}

/**
 * Check if a MIME type matches an allowed pattern.
 * Supports wildcard patterns like "image/*".
 * Normalizes MIME types by stripping codec information before comparison.
 */
function matchesMimeType(fileMime: string, allowedMime: string): boolean {
  const normalizedFileMime = normalizeMimeType(fileMime);
  if (allowedMime === '*/*' || allowedMime === normalizedFileMime) {
    return true;
  }
  if (allowedMime.endsWith('/*')) {
    const prefix = allowedMime.slice(0, -1); // Remove trailing '*'
    return normalizedFileMime.startsWith(prefix);
  }
  return false;
}

/**
 * Check if a file's MIME type is allowed.
 */
function isMimeTypeAllowed(fileMime: string, allowedMimeTypes: string[]): boolean {
  return allowedMimeTypes.some((allowed) => matchesMimeType(fileMime, allowed));
}

// =============================================================================
// Validation Function
// =============================================================================

interface ValidationOptions {
  allowedMimeTypes: string[];
  maxFileSize: number;
}

/**
 * Validate a single file against the constraints.
 * Enhanced with type-specific size limits from CAPTURE_CONSTRAINTS.
 */
function validateFileInternal(
  file: File,
  options: ValidationOptions
): FileValidationResult {
  const { allowedMimeTypes, maxFileSize } = options;
  const allowedLabels = getAllowedTypeLabels(allowedMimeTypes);

  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      rejection: {
        file,
        code: 'EMPTY_FILE',
        message: ERROR_MESSAGES.EMPTY_FILE.getMessage(file.name),
        action: ERROR_MESSAGES.EMPTY_FILE.getAction(),
      },
    };
  }

  // Check MIME type
  if (!isMimeTypeAllowed(file.type, allowedMimeTypes)) {
    return {
      valid: false,
      rejection: {
        file,
        code: 'FILE_TYPE_NOT_ALLOWED',
        message: ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED.getMessage(file.name),
        action: ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED.getAction(allowedLabels),
      },
    };
  }

  // Determine media type for type-specific size limits
  const mediaType = getMediaTypeFromMime(file.type);

  // Use type-specific size limit if available, otherwise fall back to maxFileSize
  let effectiveMaxSize = maxFileSize;
  if (mediaType) {
    const typeSpecificLimit = CAPTURE_CONSTRAINTS[mediaType]?.maxFileSize;
    if (typeSpecificLimit) {
      effectiveMaxSize = Math.min(maxFileSize, typeSpecificLimit);
    }
  }

  // Check file size against type-specific or general limit
  if (file.size > effectiveMaxSize) {
    return {
      valid: false,
      rejection: {
        file,
        code: 'FILE_TOO_LARGE',
        message: ERROR_MESSAGES.FILE_TOO_LARGE.getMessage(
          file.name,
          bytesToMB(file.size),
          bytesToMB(effectiveMaxSize)
        ),
        action: ERROR_MESSAGES.FILE_TOO_LARGE.getAction(),
      },
    };
  }

  // File is valid - return metadata
  const extension = getExtensionFromFilename(file.name);
  const category = categorizeFile(file.type);

  return {
    valid: true,
    validatedFile: {
      file,
      mimeType: file.type,
      size: file.size,
      name: file.name,
      extension,
      category,
    },
  };
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Custom hook for file upload functionality.
 *
 * @example
 * ```tsx
 * const {
 *   files,
 *   isDragActive,
 *   getDropZoneProps,
 *   getInputProps,
 *   openFilePicker,
 *   removeFile,
 *   clearFiles,
 * } = useFileUpload({
 *   allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
 *   maxFileSize: 100 * 1024 * 1024,
 *   maxFiles: 10,
 *   onFilesAdded: (files) => console.log('Added:', files),
 *   onFilesRejected: (rejections) => console.log('Rejected:', rejections),
 * });
 *
 * return (
 *   <div {...getDropZoneProps()}>
 *     <input {...getInputProps()} />
 *     {isDragActive ? 'Drop files here' : 'Click or drag files'}
 *   </div>
 * );
 * ```
 */
export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const {
    allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    maxTotalSize = DEFAULT_MAX_TOTAL_SIZE,
    multiple = true,
    maxFiles = DEFAULT_MAX_FILES,
    accept,
    onFilesAdded,
    onFilesRejected,
    debug = false,
  } = options;

  // ==========================================================================
  // State
  // ==========================================================================

  const [files, setFiles] = useState<ValidatedFile[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragValid, setIsDragValid] = useState(false);
  const [error, setError] = useState<FileUploadError | null>(null);

  // ==========================================================================
  // Refs
  // ==========================================================================

  const inputRef = useRef<HTMLInputElement>(null);
  const isUnmountedRef = useRef(false);
  const dragCounterRef = useRef(0);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  // ==========================================================================
  // Derived Values
  // ==========================================================================

  const hasFiles = files.length > 0;

  // Compute accept string from allowedMimeTypes if not provided
  const computedAccept = useMemo(() => {
    if (accept) return accept;
    return allowedMimeTypes.join(',');
  }, [accept, allowedMimeTypes]);

  // ==========================================================================
  // Debug Logging
  // ==========================================================================

  const log = useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log('[useFileUpload]', ...args);
      }
    },
    [debug]
  );

  // ==========================================================================
  // Preview URL Management
  // ==========================================================================

  /**
   * Create a preview URL for a file and track it for cleanup.
   */
  const createPreviewUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.add(url);
    return url;
  }, []);

  /**
   * Revoke a preview URL and remove from tracking.
   */
  const revokePreviewUrl = useCallback((url: string) => {
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  }, []);

  /**
   * Revoke all tracked preview URLs.
   */
  const revokeAllPreviewUrls = useCallback(() => {
    previewUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    previewUrlsRef.current.clear();
  }, []);

  // ==========================================================================
  // File Validation (exposed function)
  // ==========================================================================

  /**
   * Validate a file without adding it.
   */
  const validateFile = useCallback(
    (file: File): FileValidationResult => {
      return validateFileInternal(file, {
        allowedMimeTypes,
        maxFileSize,
      });
    },
    [allowedMimeTypes, maxFileSize]
  );

  // ==========================================================================
  // File Processing
  // ==========================================================================

  /**
   * Process and add files to the list.
   */
  const addFilesInternal = useCallback(
    (fileList: FileList | File[]) => {
      if (isUnmountedRef.current) return;

      const filesArray = Array.from(fileList);
      if (filesArray.length === 0) return;

      log('Processing', filesArray.length, 'files');

      const validFiles: ValidatedFile[] = [];
      const rejections: FileRejection[] = [];
      let cumulativeSize = totalSize;
      let currentFileCount = files.length;
      const maxFilesExceeded = currentFileCount >= maxFiles;

      // Check max files limit upfront
      if (maxFilesExceeded) {
        setError({
          code: 'MAX_FILES_EXCEEDED',
          message: ERROR_MESSAGES.MAX_FILES_EXCEEDED.getMessage(maxFiles),
          action: ERROR_MESSAGES.MAX_FILES_EXCEEDED.getAction(),
        });
        return;
      }

      const remainingSlots = maxFiles - currentFileCount;
      const filesToProcess = multiple
        ? filesArray.slice(0, remainingSlots)
        : filesArray.slice(0, 1);

      // Track excess files as rejected
      if (filesArray.length > filesToProcess.length) {
        const excessFiles = filesArray.slice(filesToProcess.length);
        for (const file of excessFiles) {
          rejections.push({
            file,
            code: 'MAX_FILES_EXCEEDED',
            message: ERROR_MESSAGES.MAX_FILES_EXCEEDED.getMessage(maxFiles),
            action: ERROR_MESSAGES.MAX_FILES_EXCEEDED.getAction(),
          });
        }
      }

      // Validate and process each file
      for (const file of filesToProcess) {
        // Check total size limit
        if (cumulativeSize + file.size > maxTotalSize) {
          rejections.push({
            file,
            code: 'TOTAL_SIZE_EXCEEDED',
            message: ERROR_MESSAGES.TOTAL_SIZE_EXCEEDED.getMessage(file.name),
            action: ERROR_MESSAGES.TOTAL_SIZE_EXCEEDED.getAction(
              bytesToMB(maxTotalSize)
            ),
          });
          continue;
        }

        // Validate file
        const result = validateFileInternal(file, {
          allowedMimeTypes,
          maxFileSize,
        });

        if (result.valid && result.validatedFile) {
          const { validatedFile } = result;

          // Create preview URL for images and videos
          let previewUrl: string | undefined;
          if (
            validatedFile.category === 'image' ||
            validatedFile.category === 'video'
          ) {
            previewUrl = createPreviewUrl(file);
          }

          const validated: ValidatedFile = {
            ...validatedFile,
            id: generateUUID(),
            previewUrl,
            addedAt: new Date(),
          };

          validFiles.push(validated);
          cumulativeSize += file.size;
          currentFileCount++;
        } else if (result.rejection) {
          rejections.push(result.rejection);
        }
      }

      // Update state atomically
      if (isUnmountedRef.current) return;

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setTotalSize(cumulativeSize);
        log('Added', validFiles.length, 'files');
      }

      if (rejections.length > 0) {
        setRejectedFiles(rejections);
        log('Rejected', rejections.length, 'files');
      } else {
        setRejectedFiles([]);
      }

      // Clear error if files were added successfully
      if (validFiles.length > 0) {
        setError(null);
      }

      // Call callbacks
      if (!isUnmountedRef.current) {
        if (validFiles.length > 0 && onFilesAdded) {
          onFilesAdded(validFiles);
        }
        if (rejections.length > 0 && onFilesRejected) {
          onFilesRejected(rejections);
        }
      }
    },
    [
      files.length,
      totalSize,
      maxFiles,
      maxFileSize,
      maxTotalSize,
      allowedMimeTypes,
      multiple,
      createPreviewUrl,
      onFilesAdded,
      onFilesRejected,
      log,
    ]
  );

  // ==========================================================================
  // File Input Management
  // ==========================================================================

  /**
   * Open the native file picker dialog.
   */
  const openFilePicker = useCallback(() => {
    if (isUnmountedRef.current) return;
    if (inputRef.current) {
      // Reset input value to allow selecting the same file again
      inputRef.current.value = '';
      inputRef.current.click();
    }
  }, []);

  /**
   * Handle file input change.
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      addFilesInternal(fileList);

      // Reset input after processing
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [addFilesInternal]
  );

  // ==========================================================================
  // File Removal
  // ==========================================================================

  /**
   * Remove a file by index or ID.
   */
  const removeFile = useCallback(
    (indexOrId: number | string) => {
      if (isUnmountedRef.current) return;

      setFiles((prev) => {
        let fileToRemove: ValidatedFile | undefined;
        let newFiles: ValidatedFile[];

        if (typeof indexOrId === 'number') {
          fileToRemove = prev[indexOrId];
          newFiles = prev.filter((_, i) => i !== indexOrId);
        } else {
          fileToRemove = prev.find((f) => f.id === indexOrId);
          newFiles = prev.filter((f) => f.id !== indexOrId);
        }

        // Revoke preview URL if it exists
        if (fileToRemove?.previewUrl) {
          revokePreviewUrl(fileToRemove.previewUrl);
        }

        // Update total size
        if (fileToRemove) {
          setTotalSize((prevSize) => prevSize - fileToRemove!.size);
        }

        log('Removed file:', fileToRemove?.name);
        return newFiles;
      });
    },
    [revokePreviewUrl, log]
  );

  /**
   * Remove all files and reset state.
   */
  const clearFiles = useCallback(() => {
    if (isUnmountedRef.current) return;

    log('Clearing all files');

    // Revoke all preview URLs
    revokeAllPreviewUrls();

    // Reset all state
    setFiles([]);
    setRejectedFiles([]);
    setTotalSize(0);
    setError(null);
  }, [revokeAllPreviewUrls, log]);

  /**
   * Clear current error state.
   */
  const clearError = useCallback(() => {
    if (isUnmountedRef.current) return;
    setError(null);
  }, []);

  // ==========================================================================
  // Drag and Drop Handlers
  // ==========================================================================

  /**
   * Check if dragged items appear to be valid file types.
   *
   * IMPORTANT: This is intentionally VERY lenient because:
   * 1. Browsers may not expose MIME types during drag (security reasons)
   * 2. Different OS/browsers report MIME types inconsistently
   * 3. Strict validation happens on drop anyway
   *
   * We accept ANY file during drag to provide good UX, then validate on drop.
   */
  const checkDragValidity = useCallback(
    (dataTransfer: DataTransfer): boolean => {
      if (!dataTransfer.items || dataTransfer.items.length === 0) {
        return false;
      }

      // Check if there's at least one file item - if so, accept it
      // The actual validation happens on drop
      for (const item of Array.from(dataTransfer.items)) {
        if (item.kind === 'file') {
          // Accept ANY file during drag - we validate strictly on drop
          return true;
        }
      }

      return false;
    },
    []
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounterRef.current++;

      if (dragCounterRef.current === 1) {
        setIsDragActive(true);
        setIsDragValid(checkDragValidity(e.dataTransfer));
      }
    },
    [checkDragValidity]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current--;

    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
      setIsDragValid(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Reset drag state
      dragCounterRef.current = 0;
      setIsDragActive(false);
      setIsDragValid(false);

      const fileList = e.dataTransfer.files;
      if (fileList && fileList.length > 0) {
        addFilesInternal(fileList);
      }
    },
    [addFilesInternal]
  );

  // ==========================================================================
  // Keyboard Handler
  // ==========================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFilePicker();
      }
    },
    [openFilePicker]
  );

  // ==========================================================================
  // Props Factories
  // ==========================================================================

  /**
   * Get props to spread on drop zone element.
   */
  const getDropZoneProps = useCallback((): DropZoneProps => {
    return {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onClick: openFilePicker,
      onKeyDown: handleKeyDown,
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': 'Drop files here or click to select',
    };
  }, [
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFilePicker,
    handleKeyDown,
  ]);

  /**
   * Get props to spread on hidden file input.
   */
  const getInputProps = useCallback((): InputProps => {
    return {
      type: 'file' as const,
      ref: inputRef,
      onChange: handleInputChange,
      accept: computedAccept,
      multiple,
      style: { display: 'none' },
      'aria-hidden': true as const,
    };
  }, [handleInputChange, computedAccept, multiple]);

  // ==========================================================================
  // Cleanup Effect
  // ==========================================================================

  useEffect(() => {
    // IMPORTANT: Reset unmounted flag when effect runs (handles React Strict Mode remounting)
    isUnmountedRef.current = false;

    return () => {
      isUnmountedRef.current = true;

      // Revoke all preview URLs
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      previewUrlsRef.current.clear();
    };
  }, []);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State
    files,
    rejectedFiles,
    totalSize,
    hasFiles,
    isDragActive,
    isDragValid,
    error,

    // Actions
    openFilePicker,
    removeFile,
    clearFiles,
    clearError,
    validateFile,

    // Props factories
    getDropZoneProps,
    getInputProps,
  };
}
