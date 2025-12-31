'use client';

/**
 * PageCountBadge Component
 *
 * A small badge component that displays the page count of a PDF document.
 * Positioned at the bottom-right corner of file thumbnails.
 *
 * @module ItemCapture/components/shared/PageCountBadge
 * @see docs/REQ-043-add-pdf-thumbnail-generation-detailed.md
 * @lastModified 2025-12-31 (REQ-043 Task 3.3.8)
 */

import React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the PageCountBadge component.
 */
export interface PageCountBadgeProps {
  /** Number of pages in the PDF */
  pageCount: number;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * PageCountBadge displays a small badge showing the number of pages
 * in a PDF document. Returns null if pageCount is 0 or negative.
 *
 * @example
 * ```tsx
 * // Single page
 * <PageCountBadge pageCount={1} /> // Shows "1 page"
 *
 * // Multiple pages
 * <PageCountBadge pageCount={5} /> // Shows "5 pages"
 *
 * // No badge shown
 * <PageCountBadge pageCount={0} /> // Returns null
 * ```
 */
export function PageCountBadge({ pageCount, className }: PageCountBadgeProps) {
  // Don't render for invalid page counts
  if (pageCount <= 0) {
    return null;
  }

  // Format label with correct pluralization
  const label = pageCount === 1 ? '1 page' : `${pageCount} pages`;

  return (
    <span
      className={cn(
        // Positioning - absolute at bottom-right
        'absolute bottom-1.5 right-1.5',
        // Styling - dark semi-transparent background
        'bg-black/70 text-white',
        // Typography
        'text-xs font-medium',
        // Padding and shape
        'px-1.5 py-0.5 rounded',
        // Ensure visibility
        'z-10',
        className
      )}
      aria-label={`${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`}
    >
      {label}
    </span>
  );
}

export default PageCountBadge;
