'use client';

/**
 * VisitCountBadge Component
 *
 * Displays a compact badge showing the total view count for an item.
 * Uses an Eye icon and formats numbers for readability (e.g., 1.2K).
 *
 * @module ItemManager/components/shared/VisitCountBadge
 * @lastModified 2026-01-05 (REQ-091)
 */

import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface VisitCountBadgeProps {
  /**
   * Total number of views to display.
   */
  count: number;

  /**
   * Size variant for the badge.
   * @default 'small'
   */
  size?: 'small' | 'medium';

  /**
   * Optional additional CSS classes.
   */
  className?: string;

  /**
   * Whether to show loading skeleton.
   * @default false
   */
  loading?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Formats a number for compact display.
 * Examples: 999 -> "999", 1000 -> "1K", 1500 -> "1.5K", 10000 -> "10K"
 */
function formatCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  if (count < 10000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  if (count < 1000000) {
    return Math.floor(count / 1000) + 'K';
  }
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

// =============================================================================
// Component
// =============================================================================

export function VisitCountBadge({
  count,
  size = 'small',
  className,
  loading = false,
}: VisitCountBadgeProps) {
  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5 gap-1',
    medium: 'text-sm px-2 py-1 gap-1.5',
  };

  const iconSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';

  if (loading) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-gray-100 animate-pulse',
          sizeClasses[size],
          'w-12 h-5',
          className
        )}
        aria-label="Loading view count"
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full',
        'bg-gray-100 text-gray-600 border border-gray-200',
        'font-medium',
        sizeClasses[size],
        className
      )}
      aria-label={`${count} views`}
    >
      <Eye className={cn(iconSize, 'flex-shrink-0')} aria-hidden="true" />
      <span>{formatCount(count)}</span>
    </span>
  );
}

export default VisitCountBadge;
