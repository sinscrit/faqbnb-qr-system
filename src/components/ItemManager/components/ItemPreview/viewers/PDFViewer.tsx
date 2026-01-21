'use client';

/**
 * PDFViewer Component
 *
 * PDF document viewer with page navigation for the ItemPreview modal.
 * Uses pdfjs-dist for PDF rendering with responsive canvas sizing
 * and high-DPI display support.
 *
 * Features:
 * - Page-by-page PDF rendering
 * - Previous/Next navigation buttons
 * - Page indicator display
 * - Keyboard navigation (arrow keys)
 * - Loading and error states
 * - Auto-reset on PDF source change
 *
 * @module ItemManager/components/ItemPreview/viewers/PDFViewer
 * @lastModified 2026-01-03
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// pdfjs-dist types and imports
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Configure PDF.js worker - use CDN for reliability
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the PDFViewer component.
 */
export interface PDFViewerProps {
  /** PDF source - can be object URL, File, or Blob */
  pdfSrc: string | File | Blob;
  /** Initial page to display (default: 1) */
  initialPage?: number;
  /** Known page count (for display before PDF loads) */
  pageCount?: number;
  /** Callback when page changes */
  onPageChange?: (page: number, total: number) => void;
  /** Callback when loading completes or fails */
  onLoadComplete?: (success: boolean, pageCount: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Internal state for PDF viewer.
 */
interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isRendering: boolean;
  error: string | null;
}

// =============================================================================
// Component
// =============================================================================

export function PDFViewer({
  pdfSrc,
  initialPage = 1,
  pageCount,
  onPageChange,
  onLoadComplete,
  className,
}: PDFViewerProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(pageCount || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<ReturnType<PDFPageProxy['render']> | null>(null);

  // ---------------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------------
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // ---------------------------------------------------------------------------
  // Load PDF Document
  // ---------------------------------------------------------------------------
  const loadPDF = useCallback(
    async (src: string | File | Blob) => {
      setIsLoading(true);
      setError(null);

      try {
        let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

        if (typeof src !== 'string') {
          const arrayBuffer = await src.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        } else {
          loadingTask = pdfjsLib.getDocument(src);
        }

        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        onLoadComplete?.(true, pdf.numPages);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load PDF';
        setError(message);
        onLoadComplete?.(false, 0);
      } finally {
        setIsLoading(false);
      }
    },
    [onLoadComplete]
  );

  // ---------------------------------------------------------------------------
  // Render Page
  // ---------------------------------------------------------------------------
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || !canvasRef.current || !containerRef.current) {
      return;
    }

    // Cancel any pending render task
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // Ignore cancel errors
      }
      renderTaskRef.current = null;
    }

    setIsRendering(true);

    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Calculate scale to fit container width
      const containerWidth = containerRef.current.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(containerWidth / viewport.width, 1.5);
      const scaledViewport = page.getViewport({ scale });

      // Handle high-DPI displays
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(scaledViewport.width * outputScale);
      canvas.height = Math.floor(scaledViewport.height * outputScale);
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(outputScale, outputScale);

      // Render page
      const renderTask = page.render({
        canvasContext: context,
        viewport: scaledViewport,
      });

      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err) {
      // Ignore cancellation errors
      if (err instanceof Error && err.name === 'RenderingCancelledException') {
        return;
      }
      console.error('Failed to render page:', err);
    } finally {
      setIsRendering(false);
      renderTaskRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation Functions
  // ---------------------------------------------------------------------------
  const goToPage = useCallback(
    (pageNum: number) => {
      const clampedPage = Math.max(1, Math.min(pageNum, totalPages));
      setCurrentPage(clampedPage);
      onPageChange?.(clampedPage, totalPages);
    },
    [totalPages, onPageChange]
  );

  const goToNextPage = useCallback(() => {
    if (canGoNext) {
      goToPage(currentPage + 1);
    }
  }, [canGoNext, currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (canGoPrevious) {
      goToPage(currentPage - 1);
    }
  }, [canGoPrevious, currentPage, goToPage]);

  // ---------------------------------------------------------------------------
  // Retry Loading
  // ---------------------------------------------------------------------------
  const handleRetry = useCallback(() => {
    setError(null);
    loadPDF(pdfSrc);
  }, [loadPDF, pdfSrc]);

  // ---------------------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousPage, goToNextPage]);

  // ---------------------------------------------------------------------------
  // Load PDF on mount or source change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Clean up previous document
    if (pdfDocRef.current) {
      pdfDocRef.current.destroy();
      pdfDocRef.current = null;
    }

    // Cancel pending render
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // Ignore cancel errors
      }
      renderTaskRef.current = null;
    }

    // Reset state
    setCurrentPage(initialPage || 1);
    setTotalPages(pageCount || 0);
    setError(null);
    setIsRendering(false);

    // Load new PDF
    if (pdfSrc) {
      loadPDF(pdfSrc);
    }

    // Cleanup on unmount
    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancel errors
        }
      }
    };
  }, [pdfSrc, initialPage, pageCount, loadPDF]);

  // ---------------------------------------------------------------------------
  // Render page when currentPage or PDF document changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoading && pdfDocRef.current && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [currentPage, isLoading, renderPage]);

  // ---------------------------------------------------------------------------
  // Handle container resize
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!isLoading && pdfDocRef.current && currentPage > 0) {
        renderPage(currentPage);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [currentPage, isLoading, renderPage]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full flex flex-col items-center',
        className
      )}
      role="document"
      aria-label={`PDF document, page ${currentPage} of ${totalPages}`}
    >
      {/* Screen reader announcement */}
      <div aria-live="polite" className="sr-only">
        {isLoading
          ? 'Loading PDF...'
          : error
            ? `Error: ${error}`
            : `Page ${currentPage} of ${totalPages}`}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="mt-2 text-sm text-gray-600">Loading PDF...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <span className="mt-2 text-sm text-red-700 text-center px-4">
            {error}
          </span>
          <button
            onClick={handleRetry}
            className={cn(
              'mt-4 px-4 py-2 rounded-md flex items-center gap-2',
              'bg-red-500 text-white hover:bg-red-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              'transition-colors'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* PDF Canvas Container */}
      <div className="flex-1 flex items-center justify-center overflow-auto w-full">
        {/* Rendering indicator overlay */}
        {isRendering && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-5">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Canvas for PDF rendering */}
        <canvas
          ref={canvasRef}
          className={cn(
            'max-w-full shadow-lg',
            (isLoading || error) && 'hidden'
          )}
        />

        {/* Placeholder when no PDF loaded */}
        {!isLoading && !error && !pdfDocRef.current && (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-16 h-16" />
            <span className="mt-2 text-sm">No PDF to display</span>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {!isLoading && !error && totalPages > 0 && (
        <div
          className={cn(
            'flex items-center justify-center gap-2 py-3 px-4',
            'bg-black/60 backdrop-blur-sm rounded-full',
            'mt-4 mb-2 shadow-lg'
          )}
        >
          {/* Previous Button */}
          <button
            onClick={goToPreviousPage}
            disabled={!canGoPrevious}
            className={cn(
              'w-11 h-11 flex items-center justify-center rounded-full',
              'text-white transition-colors',
              'hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
              !canGoPrevious && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
            aria-label="Previous page"
            aria-disabled={!canGoPrevious}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Page Indicator */}
          <span
            className="min-w-[100px] text-center text-sm font-medium text-white"
            aria-live="polite"
          >
            Page {currentPage} of {totalPages}
          </span>

          {/* Next Button */}
          <button
            onClick={goToNextPage}
            disabled={!canGoNext}
            className={cn(
              'w-11 h-11 flex items-center justify-center rounded-full',
              'text-white transition-colors',
              'hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
              !canGoNext && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
            aria-label="Next page"
            aria-disabled={!canGoNext}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
