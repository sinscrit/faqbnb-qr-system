'use client';

/**
 * usePDFThumbnail Hook
 *
 * React hook for generating PDF thumbnails with loading and error states.
 * Handles object URL lifecycle, abort signals, and cleanup on unmount.
 *
 * @module ItemCapture/hooks/usePDFThumbnail
 * @see docs/REQ-043-add-pdf-thumbnail-generation-detailed.md
 * @lastModified 2025-12-31 (REQ-043 Tasks 3.3.9-3.3.10)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PDF_CONSTRAINTS } from '../utils/pdfConstants';
import type { PDFThumbnailError } from '../ItemCapture.types';

// =============================================================================
// Types (Task 3.3.9)
// =============================================================================

/**
 * State returned by the usePDFThumbnail hook.
 */
export interface PDFThumbnailState {
  /** Object URL for the generated thumbnail (null if not available) */
  thumbnailUrl: string | null;
  /** Number of pages in the PDF */
  pageCount: number;
  /** Whether thumbnail generation is in progress */
  isLoading: boolean;
  /** Error details if thumbnail generation failed */
  error: PDFThumbnailError | null;
  /** Whether the PDF is password-protected */
  isPasswordProtected: boolean;
  /** Whether the PDF is corrupt/damaged */
  isCorrupt: boolean;
}

/**
 * Initial state for the hook.
 */
const initialState: PDFThumbnailState = {
  thumbnailUrl: null,
  pageCount: 0,
  isLoading: false,
  error: null,
  isPasswordProtected: false,
  isCorrupt: false,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a file is a PDF based on MIME type or extension.
 */
function isPDFFile(file: File): boolean {
  if (file.type === 'application/pdf') {
    return true;
  }
  const extension = file.name.toLowerCase().split('.').pop();
  return extension === 'pdf';
}

// =============================================================================
// Hook Implementation (Task 3.3.10)
// =============================================================================

/**
 * Hook for generating PDF thumbnails with automatic loading/error state management.
 *
 * Features:
 * - Lazy-loads pdfjs-dist only when needed
 * - Automatic cleanup of object URLs
 * - Abort signal support for cancellation
 * - Timeout protection (configurable via PDF_CONSTRAINTS)
 * - Proper cleanup on unmount
 *
 * @param file - The PDF file to generate a thumbnail for (or null to reset)
 * @returns PDFThumbnailState with thumbnailUrl, pageCount, isLoading, error, and flags
 *
 * @example
 * ```tsx
 * function PDFPreview({ file }: { file: File }) {
 *   const { thumbnailUrl, pageCount, isLoading, error, isPasswordProtected } = usePDFThumbnail(file);
 *
 *   if (isLoading) return <Spinner />;
 *   if (isPasswordProtected) return <LockIcon />;
 *   if (error) return <ErrorMessage>{error.userMessage}</ErrorMessage>;
 *   if (thumbnailUrl) return <img src={thumbnailUrl} alt="PDF preview" />;
 *   return <PlaceholderIcon />;
 * }
 * ```
 */
export function usePDFThumbnail(file: File | null): PDFThumbnailState {
  const [state, setState] = useState<PDFThumbnailState>(initialState);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const thumbnailUrlRef = useRef<string | null>(null);
  const isUnmountedRef = useRef<boolean>(false);

  /**
   * Cleanup function to abort pending operations and revoke object URLs.
   */
  const cleanup = useCallback(() => {
    // Abort any pending operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Revoke object URL to prevent memory leaks
    if (thumbnailUrlRef.current) {
      URL.revokeObjectURL(thumbnailUrlRef.current);
      thumbnailUrlRef.current = null;
    }
  }, []);

  // Main effect for processing PDF files
  useEffect(() => {
    // Run cleanup from previous file
    cleanup();

    // Reset state if no file or not a PDF
    if (!file || !isPDFFile(file)) {
      setState(initialState);
      return;
    }

    // Set loading state
    setState({
      ...initialState,
      isLoading: true,
    });

    // Create abort controller with timeout
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, PDF_CONSTRAINTS.THUMBNAIL_TIMEOUT);

    // Process PDF asynchronously
    const processPDF = async () => {
      try {
        // Dynamic import to keep bundle size small
        const { generatePDFThumbnailWithMetadata } = await import(
          '../utils/pdfThumbnailGenerator'
        );

        // Check if unmounted before proceeding
        if (isUnmountedRef.current) {
          return;
        }

        const result = await generatePDFThumbnailWithMetadata(
          file,
          abortController.signal
        );

        // Check if unmounted or aborted before updating state
        if (isUnmountedRef.current || abortController.signal.aborted) {
          // Cleanup result if we got a thumbnail but are no longer mounted
          if (result.thumbnail) {
            // No object URL was created yet, so no need to revoke
          }
          return;
        }

        // Create object URL if we got a thumbnail
        let thumbnailUrl: string | null = null;
        if (result.thumbnail) {
          thumbnailUrl = URL.createObjectURL(result.thumbnail);
          thumbnailUrlRef.current = thumbnailUrl;
        }

        // Update state with result
        setState({
          thumbnailUrl,
          pageCount: result.pageCount,
          isLoading: false,
          error: result.error ?? null,
          isPasswordProtected: result.isPasswordProtected,
          isCorrupt: result.isCorrupt,
        });
      } catch (error) {
        // Handle unexpected errors (shouldn't happen with proper error handling in generator)
        if (isUnmountedRef.current) {
          return;
        }

        console.error('Unexpected error in usePDFThumbnail:', error);
        setState({
          ...initialState,
          isLoading: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            userMessage: 'An unexpected error occurred while generating the preview.',
          },
        });
      } finally {
        // Clear timeout
        clearTimeout(timeoutId);
      }
    };

    processPDF();

    // Cleanup on effect cleanup (file change or unmount)
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [file, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    isUnmountedRef.current = false;

    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  return state;
}

export default usePDFThumbnail;
