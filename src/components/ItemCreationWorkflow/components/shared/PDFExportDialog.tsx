'use client';

/**
 * PDFExportDialog Component
 *
 * Modal dialog for configuring PDF export settings before generation.
 * Embeds PDFExportOptions component for settings UI.
 *
 * @module ItemCreationWorkflow/components/shared/PDFExportDialog
 * @see docs/REQ-112-pdf-generation-integration-overview.md
 * @lastModified 2026-01-05 (REQ-112 PDF Generation Integration)
 */

import { useCallback, useEffect, useRef } from 'react';
import { X, FileDown, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFExportOptions } from '@/components/PDFExportOptions';
import type { PDFExportSettings } from '@/types/pdf';

// =============================================================================
// Type Definitions (Task 6.4.3)
// =============================================================================

export interface PDFExportDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when user confirms export */
  onExport: (settings: PDFExportSettings) => Promise<void>;
  /** Number of items being exported */
  itemCount: number;
  /** Current PDF settings */
  settings: PDFExportSettings;
  /** Callback to update settings */
  onSettingsChange: (settings: Partial<PDFExportSettings>) => void;
  /** Whether PDF is being generated */
  isGenerating?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Callback to clear error */
  onClearError?: () => void;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Main Component (Task 6.4.3)
// =============================================================================

export function PDFExportDialog({
  isOpen,
  onClose,
  onExport,
  itemCount,
  settings,
  onSettingsChange,
  isGenerating = false,
  error = null,
  onClearError,
  className,
}: PDFExportDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Focus the close button when dialog opens
      closeButtonRef.current?.focus();

      // Store previous active element to restore on close
      const previousActiveElement = document.activeElement as HTMLElement;

      return () => {
        previousActiveElement?.focus();
      };
    }
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) {
        e.preventDefault();
        onClose();
      }
    },
    [isGenerating, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isGenerating) {
        onClose();
      }
    },
    [isGenerating, onClose]
  );

  // Handle export button click
  const handleExport = useCallback(async () => {
    await onExport(settings);
  }, [onExport, settings]);

  // Handle close button click
  const handleClose = useCallback(() => {
    if (!isGenerating) {
      onClose();
    }
  }, [isGenerating, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-export-dialog-title"
      aria-describedby="pdf-export-dialog-description"
    >
      <div
        ref={dialogRef}
        className={cn(
          'bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <FileDown
                className="w-5 h-5"
                style={{ color: '#FF385C' }}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="pdf-export-dialog-title"
                className="text-lg font-semibold text-[#222222]"
              >
                Export QR Codes as PDF
              </h2>
              <p className="text-sm text-[#717171]">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#F7F7F7', color: '#222222' }}
                >
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            disabled={isGenerating}
            className={cn(
              'p-2 rounded-full transition-colors duration-150',
              isGenerating
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden description for accessibility */}
        <p id="pdf-export-dialog-description" className="sr-only">
          Configure PDF export settings for your QR codes and download them as a
          printable PDF document.
        </p>

        {/* Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error banner */}
          {error && (
            <div
              className="mb-4 p-4 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: '#FEE2E2' }}
              role="alert"
            >
              <AlertCircle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: '#DC2626' }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#DC2626' }}>
                  PDF generation failed
                </p>
                <p className="text-sm mt-1" style={{ color: '#7F1D1D' }}>
                  {error}
                </p>
              </div>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="p-1 rounded-full hover:bg-red-200 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4" style={{ color: '#DC2626' }} />
                </button>
              )}
            </div>
          )}

          {/* PDF Export Options */}
          <PDFExportOptions
            settings={settings}
            onSettingsChange={onSettingsChange}
            disabled={isGenerating}
            showExportButton={false}
            isGenerating={isGenerating}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isGenerating}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150',
              isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isGenerating}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-2',
              isGenerating
                ? 'cursor-wait'
                : 'hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
            )}
            style={{
              backgroundColor: '#FF385C',
              color: 'white',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" aria-hidden="true" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PDFExportDialog;
