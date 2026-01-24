'use client';

/**
 * TranslationFormSkeleton Component
 *
 * Skeleton loader for the translation edit form. Shows animated placeholder
 * fields during form data loading for better perceived performance.
 *
 * @module TranslationManagement/skeletons/TranslationFormSkeleton
 * @created 2026-01-24
 * @requestReference REQ-E05-030
 */

import { SkeletonBase } from '@/components/SimpleDashboard/skeletons/SkeletonBase';

/**
 * Skeleton loader component for translation edit form.
 * Renders placeholder for title, textarea, description, and submit button.
 */
export function TranslationFormSkeleton() {
  return (
    <SkeletonBase label="Loading translation form">
      <div className="space-y-4">
        {/* Form header skeleton */}
        <div className="h-8 w-48 bg-gray-200 rounded" />

        {/* Title input skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>

        {/* Main textarea skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-32 w-full bg-gray-200 rounded" />
        </div>

        {/* Description field skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-200 rounded" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center gap-4 pt-4">
          <div className="h-10 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </SkeletonBase>
  );
}
