'use client';

/**
 * TranslationTableSkeleton Component
 *
 * Skeleton loader for the translation status table. Shows animated placeholder
 * rows during data loading for better perceived performance.
 *
 * @module TranslationManagement/skeletons/TranslationTableSkeleton
 * @created 2026-01-24
 * @requestReference REQ-E05-030
 */

import { SkeletonBase } from '@/components/SimpleDashboard/skeletons/SkeletonBase';

/**
 * Skeleton loader component for translation status table.
 * Renders 5 placeholder rows with language, name, status, and action columns.
 */
export function TranslationTableSkeleton() {
  return (
    <SkeletonBase label="Loading translation status">
      <div className="space-y-3">
        {/* Table header skeleton */}
        <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {/* Table rows skeleton */}
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-2">
              {/* Language column */}
              <div className="h-4 w-20 bg-gray-200 rounded" />
              {/* Name column */}
              <div className="h-4 w-32 bg-gray-200 rounded" />
              {/* Status badge column */}
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
              {/* Action button column */}
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
      </div>
    </SkeletonBase>
  );
}
