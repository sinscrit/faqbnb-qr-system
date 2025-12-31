/**
 * PDF Thumbnail Generation Utilities
 *
 * This module provides functions for generating thumbnails and extracting
 * metadata from PDF files using pdfjs-dist. It is designed to be lazy-loaded
 * only when a user uploads a PDF to minimize bundle size.
 *
 * @module ItemCapture/utils/pdfThumbnailGenerator
 * @see docs/REQ-043-add-pdf-thumbnail-generation-detailed.md
 * @lastModified 2025-12-31 (REQ-043 Tasks 3.3.3-3.3.6)
 */

import {
  PDF_CONSTRAINTS,
  PDF_ERROR_MESSAGES,
  type PDFErrorCode,
} from './pdfConstants';
import type {
  PDFThumbnailResult,
  PDFThumbnailError,
} from '../ItemCapture.types';

// =============================================================================
// Helper Functions (Task 3.3.3)
// =============================================================================

/**
 * Creates a PDFThumbnailError from an error code.
 * Looks up the user-friendly message from PDF_ERROR_MESSAGES.
 *
 * @param code - The PDFErrorCode identifying the error type
 * @param customMessage - Optional custom technical message
 * @returns Structured PDFThumbnailError object
 */
function createError(
  code: PDFErrorCode,
  customMessage?: string
): PDFThumbnailError {
  const messages = PDF_ERROR_MESSAGES[code];
  return {
    code,
    message: customMessage ?? messages.title,
    userMessage: messages.description,
  };
}

/**
 * Creates a PDFThumbnailResult with default values.
 * Allows partial override of result fields.
 *
 * @param overrides - Partial result to merge with defaults
 * @returns Complete PDFThumbnailResult object
 */
function createResult(
  overrides: Partial<PDFThumbnailResult> = {}
): PDFThumbnailResult {
  return {
    thumbnail: null,
    pageCount: 0,
    isPasswordProtected: false,
    isCorrupt: false,
    ...overrides,
  };
}

// =============================================================================
// Error Handler (Task 3.3.4)
// =============================================================================

/**
 * Classifies PDF errors and creates appropriate error results.
 * Handles password-protected PDFs, corrupt files, and other error scenarios.
 *
 * @param error - The error caught during PDF processing
 * @returns PDFThumbnailResult with appropriate error flags and message
 */
function handlePDFError(error: unknown): PDFThumbnailResult {
  const errorObj = error as Error;
  const message = errorObj?.message ?? String(error);
  const name = errorObj?.name ?? '';

  // Check for password-protected PDF
  if (
    name === 'PasswordException' ||
    message.toLowerCase().includes('password')
  ) {
    return createResult({
      isPasswordProtected: true,
      error: createError('PDF_PASSWORD_PROTECTED', message),
    });
  }

  // Check for corrupt/invalid PDF
  if (
    name === 'InvalidPDFException' ||
    message.toLowerCase().includes('invalid pdf') ||
    message.toLowerCase().includes('corrupted')
  ) {
    return createResult({
      isCorrupt: true,
      error: createError('PDF_CORRUPT', message),
    });
  }

  // Check for abort/timeout
  if (name === 'AbortError' || message.toLowerCase().includes('aborted')) {
    return createResult({
      error: createError('PDF_TIMEOUT', message),
    });
  }

  // Log unknown errors for debugging
  console.error('PDF thumbnail generation failed with unknown error:', error);

  return createResult({
    error: createError('UNKNOWN_ERROR', message),
  });
}

// =============================================================================
// Main Function (Task 3.3.5)
// =============================================================================

/**
 * Generates a thumbnail and extracts metadata from a PDF file.
 *
 * This function handles:
 * - File size validation
 * - Abort signal for cancellation
 * - Error classification (password-protected, corrupt, etc.)
 * - Proper cleanup of PDF resources
 *
 * @param file - The PDF File object to process
 * @param signal - Optional AbortSignal for cancellation
 * @returns Promise resolving to PDFThumbnailResult with thumbnail, pageCount, and error info
 *
 * @example
 * ```typescript
 * const controller = new AbortController();
 * const result = await generatePDFThumbnailWithMetadata(pdfFile, controller.signal);
 *
 * if (result.thumbnail) {
 *   const url = URL.createObjectURL(result.thumbnail);
 *   console.log(`PDF has ${result.pageCount} pages`);
 * } else if (result.isPasswordProtected) {
 *   console.log('PDF is password protected');
 * }
 * ```
 */
export async function generatePDFThumbnailWithMetadata(
  file: File,
  signal?: AbortSignal
): Promise<PDFThumbnailResult> {
  // Check file size constraint
  if (file.size > PDF_CONSTRAINTS.MAX_PDF_SIZE_FOR_THUMBNAIL) {
    return createResult({
      error: createError(
        'PDF_LOAD_FAILED',
        `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds limit`
      ),
    });
  }

  // Check if already aborted
  if (signal?.aborted) {
    return createResult({
      error: createError('PDF_TIMEOUT', 'Operation was cancelled'),
    });
  }

  // Dynamic import of pdfjs-dist
  const pdfjs = await import('pdfjs-dist');

  // Configure worker from CDN to avoid bundling
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  // Variables for cleanup
  let pdf: Awaited<ReturnType<typeof pdfjs.getDocument>['promise']> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let loadingTask: any = null;

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Check abort after async operation
    if (signal?.aborted) {
      return createResult({
        error: createError('PDF_TIMEOUT', 'Operation was cancelled'),
      });
    }

    // Create loading task
    loadingTask = pdfjs.getDocument({ data: arrayBuffer });

    // Set up abort listener
    const abortPromise = signal
      ? new Promise<never>((_, reject) => {
          const handleAbort = () => {
            loadingTask?.destroy();
            reject(new DOMException('Aborted', 'AbortError'));
          };
          signal.addEventListener('abort', handleAbort, { once: true });
        })
      : null;

    // Race between PDF loading and abort
    pdf = await (abortPromise
      ? Promise.race([loadingTask.promise, abortPromise])
      : loadingTask.promise);

    // Check for empty PDF
    if (pdf.numPages === 0) {
      await pdf.destroy();
      return createResult({
        error: createError('PDF_EMPTY'),
      });
    }

    // Get first page
    const page = await pdf.getPage(1);

    // Create canvas for rendering
    const viewport = page.getViewport({ scale: PDF_CONSTRAINTS.THUMBNAIL_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) {
      page.cleanup();
      await pdf.destroy();
      return createResult({
        pageCount: pdf.numPages,
        error: createError('CANVAS_RENDER_FAILED', 'Could not get canvas context'),
      });
    }

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert canvas to blob
    const thumbnail = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', PDF_CONSTRAINTS.THUMBNAIL_QUALITY);
    });

    // Cleanup
    page.cleanup();
    const pageCount = pdf.numPages;
    await pdf.destroy();

    if (!thumbnail) {
      return createResult({
        pageCount,
        error: createError('CANVAS_RENDER_FAILED', 'Failed to create blob from canvas'),
      });
    }

    return createResult({
      thumbnail,
      pageCount,
    });
  } catch (error) {
    // Cleanup on error
    if (pdf) {
      try {
        await pdf.destroy();
      } catch {
        // Ignore cleanup errors
      }
    } else if (loadingTask) {
      try {
        loadingTask.destroy();
      } catch {
        // Ignore cleanup errors
      }
    }

    return handlePDFError(error);
  }
}

// =============================================================================
// Legacy Functions (Task 3.3.6) - Backward Compatibility
// =============================================================================

/**
 * Generates a thumbnail image from a PDF file.
 *
 * @deprecated Use `generatePDFThumbnailWithMetadata` for detailed results including
 * page count and error information.
 *
 * @param file - The PDF File object to process
 * @returns Promise resolving to thumbnail Blob or null if generation failed
 */
export async function generatePDFThumbnail(file: File): Promise<Blob | null> {
  const result = await generatePDFThumbnailWithMetadata(file);
  return result.thumbnail;
}

/**
 * Gets the page count from a PDF file.
 *
 * @deprecated Use `generatePDFThumbnailWithMetadata` which returns pageCount
 * along with thumbnail in a single operation.
 *
 * @param file - The PDF File object to process
 * @returns Promise resolving to the number of pages in the PDF
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const result = await generatePDFThumbnailWithMetadata(file);
  return result.pageCount;
}

// Re-export types for convenience
export type { PDFThumbnailResult, PDFThumbnailError };
