'use client';

/**
 * EmptyState Component
 *
 * Displays a friendly message when no items exist in the ItemManager.
 * Supports customizable title, description, icon, and action CTA.
 *
 * @module ItemManager/components/shared/EmptyState
 * @see docs/REQ-061-implement-empty-and-loading-states-detailed.md
 * @lastModified 2026-01-03 (REQ-090 Task 17 - Added accessibility features)
 */

import { useTranslations } from 'next-intl';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmptyStateProps } from '../../ItemManager.types';

// =============================================================================
// Component
// =============================================================================

/**
 * EmptyState displays a friendly message when no items exist.
 * Supports customizable title, description, icon, and action CTA.
 *
 * @example
 * // Basic usage
 * <EmptyState />
 *
 * @example
 * // With custom content
 * <EmptyState
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 *   icon={<Search className="w-12 h-12" />}
 *   action={<button>Clear Filters</button>}
 * />
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const tEmpty = useTranslations('common.emptyStates');

  const effectiveTitle = title ?? tEmpty('items.title');
  const effectiveDescription = description ?? tEmpty('items.description');

  return (
    <div
      role="status"
      aria-label={`${effectiveTitle}. ${effectiveDescription}`}
      className={cn('text-center py-12', className)}
    >
      {/* Icon container - decorative */}
      <div className="text-gray-400 mb-4 flex justify-center" aria-hidden="true">
        {icon ?? <Package className="w-12 h-12" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {effectiveTitle}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {effectiveDescription}
      </p>

      {/* Optional action CTA */}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
