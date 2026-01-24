'use client';

/**
 * TranslationPanelSkeleton Component
 *
 * Skeleton loader for the translation preview panel. Shows animated placeholder
 * rows during status loading for better perceived performance.
 *
 * @module TranslationManagement/skeletons/TranslationPanelSkeleton
 * @created 2026-01-24
 * @requestReference REQ-E05-030
 */

import { SkeletonBase } from '@/components/SimpleDashboard/skeletons/SkeletonBase';

/**
 * Number of supported languages to show skeleton rows for.
 */
const SKELETON_ROW_COUNT = 5;

/**
 * Skeleton loader component for translation preview panel.
 * Renders placeholder for header, progress bar, and 5 language rows.
 */
export function TranslationPanelSkeleton() {
  return (
    <SkeletonBase label="Loading translations">
      <div className="space-y-4 p-4">
        {/* Header skeleton */}
        <div className="h-6 w-48 bg-gray-200 rounded mb-4" />

        {/* Progress bar skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-2 w-full bg-gray-200 rounded-full" />
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Translations header */}
        <div className="h-4 w-24 bg-gray-200 rounded mb-3" />

        {/* Language rows skeleton */}
        <div className="space-y-2">
          {Array(SKELETON_ROW_COUNT)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg"
              >
                {/* Language flag/code */}
                <div className="h-5 w-16 bg-gray-200 rounded" />
                {/* Translation status */}
                <div className="h-5 w-24 bg-gray-200 rounded-full" />
                {/* Progress indicator */}
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                {/* Action buttons */}
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            ))}
        </div>
      </div>
    </SkeletonBase>
  );
}
