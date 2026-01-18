/**
 * PDF Thumbnail Generation Constants and Error Types
 *
 * This module defines error codes, constraints, and user-friendly messages
 * for PDF thumbnail generation operations.
 *
 * @module ItemCapture/utils/pdfConstants
 * @see docs/REQ-043-add-pdf-thumbnail-generation-detailed.md
 * @lastModified 2025-12-31 (REQ-043 Task 3.3.1)
 */

// =============================================================================
// Error Codes
// =============================================================================

/**
 * Error codes for PDF thumbnail generation failures.
 * Each code maps to a specific error scenario during PDF processing.
 */
export type PDFErrorCode =
  | 'PDF_PASSWORD_PROTECTED'
  | 'PDF_CORRUPT'
  | 'PDF_EMPTY'
  | 'PDF_TIMEOUT'
  | 'PDF_LOAD_FAILED'
  | 'CANVAS_RENDER_FAILED'
  | 'UNKNOWN_ERROR';

// =============================================================================
// Processing Constraints
// =============================================================================

/**
 * Constraints for PDF thumbnail generation.
 * These values control processing limits and output quality.
 */
export const PDF_CONSTRAINTS = {
  /** Timeout for thumbnail generation in milliseconds */
  THUMBNAIL_TIMEOUT: 2000,

  /** Maximum PDF file size for thumbnail generation (50MB) */
  MAX_PDF_SIZE_FOR_THUMBNAIL: 50 * 1024 * 1024,

  /** Scale factor for rendering PDF page to canvas (0.5 = half size) */
  THUMBNAIL_SCALE: 0.5,

  /** JPEG quality for thumbnail output (0-1) */
  THUMBNAIL_QUALITY: 0.8,
} as const;

// =============================================================================
// Error Messages
// =============================================================================

/**
 * User-friendly error messages for each PDF error code.
 * Provides both a short title and detailed description.
 */
export const PDF_ERROR_MESSAGES: Record<
  PDFErrorCode,
  { title: string; description: string }
> = {
  PDF_PASSWORD_PROTECTED: {
    title: 'Protected PDF',
    description:
      'This PDF is password-protected. Preview unavailable, but you can still upload it.',
  },
  PDF_CORRUPT: {
    title: 'Damaged PDF',
    description:
      'This PDF appears to be damaged or corrupted. Preview unavailable.',
  },
  PDF_EMPTY: {
    title: 'Empty PDF',
    description: 'This PDF has no pages. Preview unavailable.',
  },
  PDF_TIMEOUT: {
    title: 'Preview Timeout',
    description:
      'Preview generation took too long. The file may be too complex.',
  },
  PDF_LOAD_FAILED: {
    title: 'Load Failed',
    description: 'Could not load this PDF. The file may be too large or invalid.',
  },
  CANVAS_RENDER_FAILED: {
    title: 'Render Failed',
    description: 'Could not render PDF preview. Please try again.',
  },
  UNKNOWN_ERROR: {
    title: 'Preview Error',
    description: 'An unexpected error occurred while generating the preview.',
  },
};
