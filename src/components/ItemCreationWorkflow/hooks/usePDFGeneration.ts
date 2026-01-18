'use client';

/**
 * usePDFGeneration - PDF generation from QR codes
 *
 * Orchestrates the generation of PDF documents containing QR codes.
 * Takes session items and their generated QR codes, applies export
 * settings, and produces a downloadable PDF blob.
 *
 * ## Features
 * - Progress tracking during generation
 * - Auto-download with configurable filename
 * - Error handling with user-friendly messages
 * - Support for all PDF export settings
 *
 * @example Generating and downloading PDF
 * ```tsx
 * const { settings } = usePDFExportSettings();
 * const {
 *   generatePDF,
 *   downloadPDF,
 *   isGenerating,
 *   progress,
 *   error,
 * } = usePDFGeneration({ settings });
 *
 * const handleExport = async () => {
 *   const blob = await generatePDF(items, qrCodes);
 *   if (blob) {
 *     downloadPDF(blob, 'my-qr-codes.pdf');
 *   }
 * };
 *
 * return (
 *   <Button onClick={handleExport} disabled={isGenerating}>
 *     {isGenerating ? `Generating... ${progress?.percent}%` : 'Download PDF'}
 *   </Button>
 * );
 * ```
 *
 * @module ItemCreationWorkflow/hooks/usePDFGeneration
 * @see usePDFExportSettings for configuration
 * @see useSessionQRGeneration for QR code generation
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { useState, useCallback, useRef } from 'react';
import {
  generatePDFFromQRCodes,
  downloadPDFBlob,
  convertPDFToBlob,
  PDFGenerationProgress,
  PDFGenerationResult,
  PDFPipelineOptions,
} from '@/lib/pdf-generator';
import type { PDFExportSettings } from '@/types/pdf';
import type { SessionItem } from '../ItemCreationWorkflow.types';

// =============================================================================
// Type Definitions (Task 6.4.2)
// =============================================================================

/**
 * Options for configuring the usePDFGeneration hook.
 */
export interface UsePDFGenerationOptions {
  /** PDF export settings */
  settings: PDFExportSettings;
  /** Progress callback during generation */
  onProgress?: (progress: PDFGenerationProgress) => void;
}

/**
 * Return type for the usePDFGeneration hook.
 */
export interface UsePDFGenerationReturn {
  /** Whether PDF generation is in progress */
  isGenerating: boolean;
  /** Current generation progress */
  progress: PDFGenerationProgress | null;
  /** Error message if generation failed */
  error: string | null;
  /** Generate PDF from items and their QR codes */
  generatePDF: (
    items: SessionItem[],
    qrCodes: Map<string, string>
  ) => Promise<Blob | null>;
  /** Download a PDF blob with auto-generated filename */
  downloadPDF: (blob: Blob, filename?: string) => void;
  /** Clear error state */
  clearError: () => void;
}

// =============================================================================
// Helper Functions (Task 6.4.2)
// =============================================================================

/**
 * Formats a date as YYYY-MM-DD for filename generation.
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a default filename for PDF downloads.
 */
function generateDefaultFilename(): string {
  const dateStr = formatDateForFilename(new Date());
  return `qr-codes-${dateStr}.pdf`;
}

// =============================================================================
// Core Implementation (Task 6.4.2)
// =============================================================================

/**
 * Custom hook for orchestrating PDF generation from QR codes.
 * Provides progress tracking, error handling, and download functionality.
 *
 * @param options - Configuration options including PDF settings
 * @returns Hook return with generation methods and state
 *
 * @example
 * ```typescript
 * const pdfSettings = usePDFExportSettings();
 * const { generatePDF, downloadPDF, isGenerating, error } = usePDFGeneration({
 *   settings: pdfSettings.settings,
 *   onProgress: (progress) => console.log(`${progress.percentage}% complete`)
 * });
 *
 * // Generate PDF from items
 * const qrCodes = new Map([['item1', 'data:image/png;base64,...']]);
 * const blob = await generatePDF(items, qrCodes);
 *
 * // Download the generated PDF
 * if (blob) {
 *   downloadPDF(blob);
 * }
 * ```
 */
export function usePDFGeneration(
  options: UsePDFGenerationOptions
): UsePDFGenerationReturn {
  const { settings, onProgress } = options;

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<PDFGenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref for cancellation (future enhancement)
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generate PDF from session items and their QR codes.
   * Maps items to URLs for the pdf-generator library.
   */
  const generatePDF = useCallback(
    async (
      items: SessionItem[],
      qrCodes: Map<string, string>
    ): Promise<Blob | null> => {
      // Clear previous error
      setError(null);
      setIsGenerating(true);
      setProgress({ step: 'Initializing', percentage: 0 });

      // Create new abort controller for this generation
      abortControllerRef.current = new AbortController();

      try {
        // Build URL map from items for QR code generation
        // The pdf-generator expects item IDs → URLs for generating QR codes
        const urlMap = new Map<string, string>();

        for (const item of items) {
          // Get QR code from the provided map or from the item itself
          const qrCode = qrCodes.get(item.id) || item.qrCodeUrl;

          if (qrCode) {
            // Use the QR code URL directly - the generator will create QR codes from these
            urlMap.set(item.id, qrCode);
          }
        }

        if (urlMap.size === 0) {
          throw new Error('No QR codes available for PDF generation');
        }

        // Configure pipeline options
        const pipelineOptions: PDFPipelineOptions = {
          onProgress: (progressUpdate) => {
            setProgress(progressUpdate);
            onProgress?.(progressUpdate);
          },
          includeLabels: settings.includeLabels,
          includeCutlines: settings.includeCutlines,
        };

        // Generate PDF
        const result: PDFGenerationResult = await generatePDFFromQRCodes(
          urlMap,
          settings,
          pipelineOptions
        );

        if (!result.success || !result.pdfBytes) {
          throw new Error(result.error || 'PDF generation failed');
        }

        // Convert to Blob
        const blob = convertPDFToBlob(result.pdfBytes, generateDefaultFilename());

        setProgress({ step: 'Complete', percentage: 100 });
        setIsGenerating(false);

        return blob;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error during PDF generation';
        setError(errorMessage);
        setProgress(null);
        setIsGenerating(false);
        return null;
      }
    },
    [settings, onProgress]
  );

  /**
   * Download a PDF blob with an auto-generated filename.
   * Uses a descriptive date-based filename by default.
   */
  const downloadPDF = useCallback((blob: Blob, filename?: string) => {
    const finalFilename = filename || generateDefaultFilename();
    downloadPDFBlob(blob, finalFilename);
  }, []);

  /**
   * Clear the error state.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isGenerating,
    progress,
    error,
    generatePDF,
    downloadPDF,
    clearError,
  };
}

export default usePDFGeneration;
