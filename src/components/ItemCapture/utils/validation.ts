'use client';

/**
 * ItemCapture Validation Utilities
 *
 * This file contains all validation functions for the ItemCapture component.
 * All functions are pure (no side effects) and return structured results
 * that include error messages suitable for display to users.
 *
 * @module ItemCapture/utils/validation
 * @see docs/REQ-052-create-validation-layer-detailed.md
 * @lastModified 2025-12-31 (REQ-052)
 */

import type { MediaItem, ItemMetadata, UrlItem } from '../ItemCapture.types';
import { CAPTURE_CONSTRAINTS, SUPPORTED_FORMATS, URL_CONSTRAINTS } from './constants';

// =============================================================================
// Types
// =============================================================================

/**
 * Basic validation result with optional error message.
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Extended validation result for file size checks.
 * Includes size information for display purposes.
 */
export interface FileSizeValidationResult {
  isValid: boolean;
  fileSize: number;
  maxAllowed: number;
  error?: string;
}

/**
 * Extended validation result for total size checks.
 * Includes current total size for display purposes.
 */
export interface TotalSizeValidationResult extends ValidationResult {
  currentSize: number;
}

/**
 * Comprehensive validation result for an entire ItemCapture submission.
 * Aggregates all individual validation results.
 */
export interface ItemCaptureValidation {
  /** Overall validation state - false if any blocking error exists */
  isValid: boolean;
  /** Blocking errors that prevent submission (keyed by field/item) */
  errors: Record<string, string>;
  /** Non-blocking warnings (keyed by field/item) */
  warnings: Record<string, string>;
  /** Detailed metadata field validation results */
  metadata: {
    title: ValidationResult;
  };
  /** Content requirement validation */
  content: {
    hasMedia: boolean;
    hasText: boolean;
    hasContent: boolean;
    error?: string;
  };
  /** File size validation details */
  fileSize: {
    individual: Array<{
      mediaId: string;
      result: FileSizeValidationResult;
    }>;
    total: {
      currentSize: number;
      maxAllowed: number;
      isValid: boolean;
      error?: string;
    };
  };
}

// =============================================================================
// Task 2: File Size Formatting Utilities
// =============================================================================

/**
 * Format a file size in bytes to a human-readable string.
 *
 * @param bytes - File size in bytes
 * @returns Human-readable size string (e.g., "1.5 KB", "25.3 MB")
 *
 * @example
 * formatFileSize(0) // "0 B"
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1536) // "1.5 KB"
 * formatFileSize(104857600) // "100 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${parseFloat(size.toFixed(1))} ${sizes[i]}`;
}

/**
 * Parse a human-readable file size string to bytes.
 *
 * @param sizeStr - Size string (e.g., "100MB", "1.5 GB", "500KB")
 * @returns Size in bytes, or 0 for invalid strings
 *
 * @example
 * parseFileSize("100MB") // 104857600
 * parseFileSize("1.5 GB") // 1610612736
 * parseFileSize("invalid") // 0
 */
export function parseFileSize(sizeStr: string): number {
  if (!sizeStr || typeof sizeStr !== 'string') return 0;

  const match = sizeStr.trim().match(/^([\d.]+)\s*(B|KB|MB|GB)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  if (isNaN(value)) return 0;

  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };

  return Math.floor(value * (multipliers[unit] || 0));
}

// =============================================================================
// Task 3: Title Validation
// =============================================================================

/**
 * Validate the item title field.
 *
 * @param title - The title string to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * validateTitle("") // { isValid: false, error: "Title is required" }
 * validateTitle("Valid Title") // { isValid: true }
 * validateTitle("x".repeat(201)) // { isValid: false, error: "Title must be 200 characters or less (current: 201)" }
 */
export function validateTitle(title: string): ValidationResult {
  const trimmedTitle = title?.trim() ?? '';

  if (trimmedTitle.length === 0) {
    return {
      isValid: false,
      error: 'Title is required',
    };
  }

  if (trimmedTitle.length > CAPTURE_CONSTRAINTS.title.maxLength) {
    return {
      isValid: false,
      error: `Title must be ${CAPTURE_CONSTRAINTS.title.maxLength} characters or less (current: ${trimmedTitle.length})`,
    };
  }

  return { isValid: true };
}

// =============================================================================
// Task 4: Content Requirement Validation
// =============================================================================

/**
 * Validate that at least one form of content exists (media, URL, or text).
 *
 * @param mediaItems - Array of media items
 * @param urlItems - Array of URL items
 * @param instructions - Text instructions string
 * @returns Validation result with error message if no content
 *
 * @example
 * validateContentRequirement([], [], "") // { isValid: false, error: "At least one media item, link, or text instructions must be provided" }
 * validateContentRequirement([mediaItem], [], "") // { isValid: true }
 * validateContentRequirement([], [urlItem], "") // { isValid: true }
 * validateContentRequirement([], [], "Some text") // { isValid: true }
 */
export function validateContentRequirement(
  mediaItems: MediaItem[],
  urlItems: UrlItem[],
  instructions: string
): ValidationResult {
  const hasMedia = mediaItems.length > 0;
  const hasUrls = urlItems.length > 0;
  const hasText = instructions?.trim().length > 0;

  if (!hasMedia && !hasUrls && !hasText) {
    return {
      isValid: false,
      error: 'At least one media item, link, or text instructions must be provided',
    };
  }

  return { isValid: true };
}

// =============================================================================
// Task 5: Individual File Size Validation
// =============================================================================

/**
 * Validate an individual file's size against type-specific limits.
 *
 * @param file - File or Blob to validate
 * @param mediaType - Type of media ('video' | 'image' | 'pdf')
 * @returns Validation result with size information
 *
 * @example
 * validateFileSize(file, 'video') // For 50MB video: { isValid: true, fileSize: 52428800, maxAllowed: 104857600 }
 * validateFileSize(file, 'image') // For 25MB image: { isValid: false, fileSize: 26214400, maxAllowed: 20971520, error: "..." }
 */
export function validateFileSize(
  file: File | Blob,
  mediaType: 'video' | 'image' | 'pdf'
): FileSizeValidationResult {
  const maxAllowed = CAPTURE_CONSTRAINTS[mediaType].maxFileSize;
  const fileSize = file.size;

  if (fileSize > maxAllowed) {
    return {
      isValid: false,
      fileSize,
      maxAllowed,
      error: `File exceeds ${formatFileSize(maxAllowed)} limit (current: ${formatFileSize(fileSize)})`,
    };
  }

  return {
    isValid: true,
    fileSize,
    maxAllowed,
  };
}

// =============================================================================
// Task 6: Total Size Validation
// =============================================================================

/**
 * Validate the combined size of all media items.
 *
 * @param mediaItems - Array of media items to validate
 * @returns Validation result with total size information
 *
 * @example
 * validateTotalSize([]) // { isValid: true, currentSize: 0 }
 * validateTotalSize(items150MB) // { isValid: true, currentSize: 157286400 }
 * validateTotalSize(items250MB) // { isValid: false, currentSize: 262144000, error: "..." }
 */
export function validateTotalSize(mediaItems: MediaItem[]): TotalSizeValidationResult {
  const currentSize = mediaItems.reduce((sum, item) => {
    return sum + (item.file?.size || 0);
  }, 0);

  const maxAllowed = CAPTURE_CONSTRAINTS.total.maxSize;

  if (currentSize > maxAllowed) {
    return {
      isValid: false,
      currentSize,
      error: `Total upload size (${formatFileSize(currentSize)}) exceeds ${formatFileSize(maxAllowed)} limit`,
    };
  }

  return {
    isValid: true,
    currentSize,
  };
}

// =============================================================================
// Task 7: Text Length Validation
// =============================================================================

/**
 * Validate the instructions text length.
 * Note: This is treated as a warning, not a blocking error.
 *
 * @param text - Instructions text to validate
 * @returns Validation result with warning if too long
 *
 * @example
 * validateTextLength("Short text") // { isValid: true }
 * validateTextLength("x".repeat(5001)) // { isValid: false, error: "Instructions exceed 5000 character limit (current: 5001)" }
 */
export function validateTextLength(text: string): ValidationResult {
  const length = text?.length ?? 0;
  const maxLength = CAPTURE_CONSTRAINTS.text.maxLength;

  if (length > maxLength) {
    return {
      isValid: false,
      error: `Instructions exceed ${maxLength} character limit (current: ${length})`,
    };
  }

  return { isValid: true };
}

// =============================================================================
// URL Validation (REQ-092)
// =============================================================================

/**
 * Validate a URL string.
 *
 * @param url - URL to validate
 * @returns Validation result with error if invalid
 *
 * @example
 * validateUrl("") // { isValid: false, error: "URL is required" }
 * validateUrl("https://example.com") // { isValid: true }
 * validateUrl("javascript:alert('xss')") // { isValid: false, error: "Only http and https URLs are allowed" }
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  if (url.length > URL_CONSTRAINTS.maxUrlLength) {
    return {
      isValid: false,
      error: `URL exceeds ${URL_CONSTRAINTS.maxUrlLength} character limit`,
    };
  }

  try {
    const parsed = new URL(url);
    const allowedProtocols = URL_CONSTRAINTS.allowedProtocols as readonly string[];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { isValid: false, error: 'Only http and https URLs are allowed' };
    }
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  return { isValid: true };
}

/**
 * Validate the number of URL items doesn't exceed the limit.
 *
 * @param urlItems - Array of URL items
 * @returns Validation result with error if too many URLs
 *
 * @example
 * validateUrlCount([...19urls]) // { isValid: true }
 * validateUrlCount([...21urls]) // { isValid: false, error: "Maximum 20 links allowed (current: 21)" }
 */
export function validateUrlCount(urlItems: UrlItem[]): ValidationResult {
  if (urlItems.length > URL_CONSTRAINTS.maxUrls) {
    return {
      isValid: false,
      error: `Maximum ${URL_CONSTRAINTS.maxUrls} links allowed (current: ${urlItems.length})`,
    };
  }
  return { isValid: true };
}

// =============================================================================
// Task 8: Image Count Validation
// =============================================================================

/**
 * Validate the number of images doesn't exceed the limit.
 *
 * @param mediaItems - Array of media items
 * @returns Validation result with error if too many images
 *
 * @example
 * validateImageCount([...9images]) // { isValid: true }
 * validateImageCount([...11images]) // { isValid: false, error: "Maximum 10 photos allowed (current: 11)" }
 */
export function validateImageCount(mediaItems: MediaItem[]): ValidationResult {
  const imageCount = mediaItems.filter(item => item.type === 'image').length;
  const maxCount = CAPTURE_CONSTRAINTS.image.maxCount;

  if (imageCount > maxCount) {
    return {
      isValid: false,
      error: `Maximum ${maxCount} photos allowed (current: ${imageCount})`,
    };
  }

  return { isValid: true };
}

// =============================================================================
// Task 9: MIME Type Validation
// =============================================================================

/**
 * Validate a file's MIME type against supported formats.
 *
 * @param mimeType - MIME type string to validate
 * @param mediaType - Expected media category ('video' | 'image' | 'pdf')
 * @returns Validation result with error if unsupported
 *
 * @example
 * validateMimeType("image/jpeg", "image") // { isValid: true }
 * validateMimeType("audio/mp3", "video") // { isValid: false, error: "File type 'audio/mp3' is not supported for video" }
 */
export function validateMimeType(
  mimeType: string,
  mediaType: 'video' | 'image' | 'pdf'
): ValidationResult {
  const supportedFormats = SUPPORTED_FORMATS[mediaType];

  if (!supportedFormats.includes(mimeType as never)) {
    return {
      isValid: false,
      error: `File type '${mimeType}' is not supported for ${mediaType}`,
    };
  }

  return { isValid: true };
}

/**
 * Get the media type category from a MIME type string.
 *
 * @param mimeType - MIME type to categorize
 * @returns Media type or null if not recognized
 */
export function getMediaTypeFromMime(mimeType: string): 'video' | 'image' | 'pdf' | null {
  if (SUPPORTED_FORMATS.image.includes(mimeType as never)) {
    return 'image';
  }
  if (SUPPORTED_FORMATS.video.includes(mimeType as never)) {
    return 'video';
  }
  if (SUPPORTED_FORMATS.pdf.includes(mimeType as never)) {
    return 'pdf';
  }
  return null;
}

// =============================================================================
// Task 10: Complete Validation Aggregator
// =============================================================================

/**
 * Run all validations and aggregate results.
 * This is the main validation function used by the useItemValidation hook.
 *
 * @param metadata - Item metadata including title
 * @param mediaItems - Array of media items
 * @param urlItems - Array of URL items
 * @param instructions - Text instructions
 * @returns Comprehensive validation result with all errors and warnings
 *
 * @example
 * const validation = validateItemCapture(metadata, mediaItems, urlItems, instructions);
 * if (!validation.isValid) {
 *   console.log("Errors:", validation.errors);
 * }
 */
export function validateItemCapture(
  metadata: ItemMetadata,
  mediaItems: MediaItem[],
  urlItems: UrlItem[],
  instructions: string
): ItemCaptureValidation {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Validate title
  const titleResult = validateTitle(metadata.title);
  if (!titleResult.isValid && titleResult.error) {
    errors['title'] = titleResult.error;
  }

  // Validate content requirement
  const contentResult = validateContentRequirement(mediaItems, urlItems, instructions);
  const hasMedia = mediaItems.length > 0;
  const hasText = instructions?.trim().length > 0;
  if (!contentResult.isValid && contentResult.error) {
    errors['content'] = contentResult.error;
  }

  // Validate URL count
  const urlCountResult = validateUrlCount(urlItems);
  if (!urlCountResult.isValid && urlCountResult.error) {
    errors['urlCount'] = urlCountResult.error;
  }

  // Validate image count
  const imageCountResult = validateImageCount(mediaItems);
  if (!imageCountResult.isValid && imageCountResult.error) {
    errors['imageCount'] = imageCountResult.error;
  }

  // Validate text length (warning only, not blocking)
  const textLengthResult = validateTextLength(instructions);
  if (!textLengthResult.isValid && textLengthResult.error) {
    warnings['textLength'] = textLengthResult.error;
  }

  // Validate individual file sizes
  const individualFileSizes: Array<{
    mediaId: string;
    result: FileSizeValidationResult;
  }> = [];

  for (const item of mediaItems) {
    // Skip URL items - they don't have file sizes to validate
    if (item.type === 'url') continue;

    if (item.file) {
      const result = validateFileSize(item.file, item.type);
      individualFileSizes.push({
        mediaId: item.id,
        result,
      });

      if (!result.isValid && result.error) {
        errors[`fileSize_${item.id}`] = result.error;
      }
    }
  }

  // Validate total size
  const totalSizeResult = validateTotalSize(mediaItems);
  if (!totalSizeResult.isValid && totalSizeResult.error) {
    errors['totalSize'] = totalSizeResult.error;
  }

  // Determine overall validity (warnings don't affect this)
  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    warnings,
    metadata: {
      title: titleResult,
    },
    content: {
      hasMedia,
      hasText,
      hasContent: hasMedia || hasText,
      error: contentResult.error,
    },
    fileSize: {
      individual: individualFileSizes,
      total: {
        currentSize: totalSizeResult.currentSize,
        maxAllowed: CAPTURE_CONSTRAINTS.total.maxSize,
        isValid: totalSizeResult.isValid,
        error: totalSizeResult.error,
      },
    },
  };
}

/**
 * Calculate the remaining upload size capacity.
 *
 * @param mediaItems - Current media items
 * @returns Remaining size in bytes
 */
export function calculateRemainingSize(mediaItems: MediaItem[]): number {
  const currentSize = mediaItems.reduce((sum, item) => {
    return sum + (item.file?.size || 0);
  }, 0);
  return Math.max(0, CAPTURE_CONSTRAINTS.total.maxSize - currentSize);
}

/**
 * Calculate the current total size of all media items.
 *
 * @param mediaItems - Current media items
 * @returns Total size in bytes
 */
export function calculateTotalSize(mediaItems: MediaItem[]): number {
  return mediaItems.reduce((sum, item) => {
    return sum + (item.file?.size || 0);
  }, 0);
}

/**
 * Check if adding a file would exceed the total size limit.
 *
 * @param mediaItems - Current media items
 * @param newFileSize - Size of the file to be added
 * @returns true if adding the file would exceed the limit
 */
export function wouldExceedTotalSize(
  mediaItems: MediaItem[],
  newFileSize: number
): boolean {
  const currentSize = calculateTotalSize(mediaItems);
  return currentSize + newFileSize > CAPTURE_CONSTRAINTS.total.maxSize;
}
