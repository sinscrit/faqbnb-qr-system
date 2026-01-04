'use client';

/**
 * LoadingState Component
 *
 * Displays skeleton animation while content is loading in the ItemManager.
 * Supports both grid and list view modes with appropriate skeletons.
 *
 * @module ItemManager/components/shared/LoadingState
 * @see docs/REQ-061-implement-empty-and-loading-states-detailed.md
 * @lastModified 2026-01-04 (REQ-061 Task 1.7.3)
 */

import { cn } from '@/lib/utils';
import type { LoadingStateProps } from '../../ItemManager.types';

// =============================================================================
// Constants
// =============================================================================

/** Default skeleton item counts per view mode */
const DEFAULT_GRID_COUNT = 6;
const DEFAULT_LIST_COUNT = 5;

// =============================================================================
// Skeleton Components
// =============================================================================

/**
 * Skeleton card for grid view loading state.
 * Matches the visual structure of ItemCard component.
 */
function GridSkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Thumbnail placeholder - 16:9 aspect ratio */}
      <div className="aspect-video bg-gray-200" />

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Title line - 70% width */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />

        {/* Subtitle/metadata line - 50% width */}
        <div className="h-3 bg-gray-200 rounded w-1/2" />

        {/* Badge placeholders */}
        <div className="flex gap-2 pt-1">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton row for list view loading state.
 * Matches the visual structure of ItemRow component.
 */
function ListSkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">
      {/* Thumbnail placeholder - square */}
      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />

      {/* Content area */}
      <div className="flex-1 space-y-2 min-w-0">
        {/* Title line - 75% width */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        {/* Metadata line - 50% width */}
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Action buttons placeholder */}
      <div className="flex gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * LoadingState displays skeleton animation while content is loading.
 * Supports both grid and list view modes with appropriate skeletons.
 *
 * @example
 * // Grid view (default)
 * <LoadingState />
 *
 * @example
 * // List view with custom count
 * <LoadingState viewMode="list" itemCount={3} />
 */
export function LoadingState({
  viewMode = 'grid',
  itemCount,
  className,
}: LoadingStateProps) {
  const count = itemCount ?? (viewMode === 'grid' ? DEFAULT_GRID_COUNT : DEFAULT_LIST_COUNT);

  if (viewMode === 'list') {
    return (
      <div
        role="status"
        aria-label="Loading items"
        aria-busy="true"
        className={cn('animate-pulse space-y-2', className)}
      >
        {/* Screen reader text */}
        <span className="sr-only">Loading items, please wait...</span>

        {Array.from({ length: count }).map((_, index) => (
          <ListSkeletonRow key={index} />
        ))}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      role="status"
      aria-label="Loading items"
      aria-busy="true"
      className={cn(
        'animate-pulse grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {/* Screen reader text */}
      <span className="sr-only">Loading items, please wait...</span>

      {Array.from({ length: count }).map((_, index) => (
        <GridSkeletonCard key={index} />
      ))}
    </div>
  );
}

export default LoadingState;
