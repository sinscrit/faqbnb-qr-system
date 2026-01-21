'use client';

/**
 * GuideGrid Component
 *
 * Renders guides in a responsive multi-column grid layout.
 * Each guide is displayed using the GuideCard component.
 *
 * @module InstructionsTable/GuideGrid
 * @see docs/req-220-toolbar-infrastructure-guides-list-overview.md
 * @lastModified 2026-01-13 (REQ-220)
 */

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { GuideCard } from './GuideCard';
import type { InstructionRow } from './InstructionsTable.types';

// =============================================================================
// Types
// =============================================================================

export interface GuideGridProps {
  /** Array of guides to display */
  guides: InstructionRow[];
  /** Callback when edit is triggered for a guide */
  onEdit: (articleId: string) => void;
  /** Whether the grid is loading */
  loading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function GuideCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Header placeholder */}
      <div className="h-20 bg-gray-100" />

      {/* Content placeholder */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function GuideGrid({
  guides,
  onEdit,
  loading = false,
  className,
}: GuideGridProps) {
  const tEmpty = useTranslations('common.emptyStates');

  // Loading state - show skeleton grid
  if (loading) {
    return (
      <div
        className={cn(
          'grid gap-4 sm:gap-5 lg:gap-6',
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          className
        )}
        role="grid"
        aria-label="Loading guides"
        aria-busy="true"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} role="gridcell">
            <GuideCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (guides.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12',
          'text-center text-gray-500',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-medium text-gray-900">{tEmpty('guides.titleNotFound')}</p>
        <p className="text-sm mt-1">{tEmpty('generic.tryAdjusting')}</p>
      </div>
    );
  }

  // Main grid
  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-5 lg:gap-6',
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className
      )}
      role="grid"
      aria-label={`${guides.length} guide${guides.length !== 1 ? 's' : ''}`}
    >
      {guides.map((guide) => (
        <div key={guide.id} role="gridcell">
          <GuideCard
            guide={guide}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}

export default GuideGrid;
