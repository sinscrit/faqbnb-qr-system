'use client';

/**
 * PDFPlaceholder Component
 *
 * A visual placeholder component displayed when PDF thumbnail generation
 * fails or is in progress. Shows appropriate icons and colors based on
 * the error type (password-protected, corrupt, loading, or generic error).
 *
 * @module ItemCapture/components/shared/PDFPlaceholder
 * @see docs/REQ-043-add-pdf-thumbnail-generation-detailed.md
 * @lastModified 2025-12-31 (REQ-043 Task 3.3.7)
 */

import React from 'react';
import { FileText, Lock, AlertTriangle, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PDFErrorCode } from '../../utils/pdfConstants';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the PDFPlaceholder component.
 */
export interface PDFPlaceholderProps {
  /** Error code from PDF thumbnail generation */
  errorCode?: PDFErrorCode;
  /** Whether the PDF is password-protected */
  isPasswordProtected?: boolean;
  /** Whether the PDF is corrupt/damaged */
  isCorrupt?: boolean;
  /** Whether thumbnail generation is in progress */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * PDFPlaceholder displays a visual indicator for PDF files when
 * thumbnail generation is loading, failed, or the PDF has issues.
 *
 * Visual states:
 * - Loading: Pulsing FileText icon on gray background
 * - Password-protected: Lock icon on amber/yellow background
 * - Corrupt: FileWarning icon on red background
 * - Other errors: AlertTriangle icon on orange background
 * - Default: FileText icon on red/pink background
 *
 * @example
 * ```tsx
 * // Loading state
 * <PDFPlaceholder isLoading />
 *
 * // Password-protected PDF
 * <PDFPlaceholder isPasswordProtected />
 *
 * // Corrupt PDF
 * <PDFPlaceholder isCorrupt />
 *
 * // Specific error code
 * <PDFPlaceholder errorCode="PDF_TIMEOUT" />
 * ```
 */
export function PDFPlaceholder({
  errorCode,
  isPasswordProtected,
  isCorrupt,
  isLoading,
  className,
}: PDFPlaceholderProps) {
  // Determine which state to display
  const showLoading = isLoading;
  const showPasswordProtected = !isLoading && isPasswordProtected;
  const showCorrupt = !isLoading && !isPasswordProtected && isCorrupt;
  const showError = !isLoading && !isPasswordProtected && !isCorrupt && errorCode;
  const showDefault = !showLoading && !showPasswordProtected && !showCorrupt && !showError;

  // Get icon and styles based on state
  const getContent = () => {
    if (showLoading) {
      return {
        icon: <FileText className="h-10 w-10" />,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-400',
        animate: true,
      };
    }

    if (showPasswordProtected) {
      return {
        icon: <Lock className="h-10 w-10" />,
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        animate: false,
      };
    }

    if (showCorrupt) {
      return {
        icon: <FileWarning className="h-10 w-10" />,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-500',
        animate: false,
      };
    }

    if (showError) {
      return {
        icon: <AlertTriangle className="h-10 w-10" />,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-500',
        animate: false,
      };
    }

    // Default state (no thumbnail available)
    return {
      icon: <FileText className="h-10 w-10" />,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-400',
      animate: false,
    };
  };

  const { icon, bgColor, iconColor, animate } = getContent();

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center rounded-md',
        bgColor,
        iconColor,
        animate && 'animate-pulse',
        className
      )}
      role={showLoading ? 'status' : 'img'}
      aria-label={
        showLoading
          ? 'Loading PDF preview'
          : showPasswordProtected
            ? 'Password-protected PDF'
            : showCorrupt
              ? 'Damaged PDF file'
              : showError
                ? 'PDF preview unavailable'
                : 'PDF document'
      }
    >
      {icon}
      {showLoading && <span className="sr-only">Loading...</span>}
    </div>
  );
}

export default PDFPlaceholder;
