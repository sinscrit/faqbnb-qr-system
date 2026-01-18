'use client';

/**
 * InstructionsViewer Component
 *
 * Renders markdown-formatted instructions with proper styling and scrollable container.
 * Designed for integration within ItemPreviewModal for displaying item instructions.
 *
 * @module ItemManager/components/ItemPreview/InstructionsViewer
 * @created 2026-01-03
 * @lastModified 2026-01-03
 * @requestId REQ-078
 */

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

// Lazy load ReactMarkdown to reduce initial bundle size
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-20 bg-gray-100 rounded" />,
});

/**
 * Props for the InstructionsViewer component.
 */
export interface InstructionsViewerProps {
  /** Markdown-formatted instructions content */
  instructions: string;

  /** Maximum height for scrollable area (CSS value, e.g., '400px', '50vh') */
  maxHeight?: string;

  /** Minimum height for the container */
  minHeight?: string;

  /** Optional CSS class for customization */
  className?: string;

  /** Optional accessible label */
  ariaLabel?: string;

  /** Show section header (default: false) */
  showHeader?: boolean;

  /** Header text when showHeader is true */
  headerText?: string;
}

/**
 * InstructionsViewer - Renders markdown instructions with scrollable container
 *
 * Features:
 * - Lazy-loaded ReactMarkdown for bundle optimization
 * - Configurable height constraints (min/max)
 * - Comprehensive prose styling for all markdown elements
 * - Optional header with icon
 * - Empty state handling
 * - ARIA accessibility support
 *
 * @example
 * ```tsx
 * <InstructionsViewer
 *   instructions="# How to use\n\n1. Turn on the device\n2. Wait for green light"
 *   maxHeight="400px"
 *   showHeader={true}
 * />
 * ```
 */
export function InstructionsViewer({
  instructions,
  maxHeight = '400px',
  minHeight = '100px',
  className,
  ariaLabel = 'Item guides',
  showHeader = false,
  headerText = 'Guides',
}: InstructionsViewerProps) {
  // Check if there is content to display
  const hasContent = instructions?.trim().length > 0;

  return (
    <section
      className={cn('flex flex-col', className)}
      aria-label={ariaLabel}
    >
      {/* Optional Header */}
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-gray-500" aria-hidden="true" />
          <h4 className="text-sm font-medium text-gray-700">{headerText}</h4>
        </div>
      )}

      {/* Markdown Content Container */}
      <div
        className={cn(
          'bg-gray-50 rounded-lg p-4 overflow-y-auto',
          'prose prose-sm max-w-none',
          'prose-headings:text-gray-800 prose-headings:font-semibold',
          'prose-p:text-gray-600 prose-p:leading-relaxed',
          'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700',
          'prose-strong:text-gray-800',
          'prose-ul:text-gray-600 prose-ol:text-gray-600',
          'prose-code:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-code:text-sm',
          'prose-blockquote:text-gray-600 prose-blockquote:border-l-gray-300'
        )}
        style={{ maxHeight, minHeight }}
      >
        {hasContent ? (
          <ReactMarkdown>{instructions}</ReactMarkdown>
        ) : (
          <p className="text-gray-400 italic">No guides provided.</p>
        )}
      </div>
    </section>
  );
}

export default InstructionsViewer;
