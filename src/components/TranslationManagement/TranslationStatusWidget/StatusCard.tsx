'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for StatusCard component.
 */
export interface StatusCardProps {
  /** Status type determining color scheme */
  status: 'complete' | 'partial' | 'pending' | 'failed';
  /** Number to display */
  count: number;
  /** Translated label text */
  label: string;
  /** Icon component (from lucide-react) */
  icon: React.ReactNode;
  /** Compact mode for smaller layout (default: false) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Color mapping for each status type.
 * Uses semantic colors to indicate translation status:
 * - complete: green (success)
 * - partial: blue (in progress)
 * - pending: orange (waiting)
 * - failed: red (error)
 */
const STATUS_COLOR_MAP = {
  complete: {
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
  },
  partial: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
  },
  pending: {
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
  },
  failed: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
  },
} as const;

/**
 * StatusCard - A reusable card component for displaying individual status counts.
 * Used within TranslationStatusWidget to show breakdown of translation statuses.
 *
 * @example
 * <StatusCard
 *   status="complete"
 *   count={15}
 *   label="Complete"
 *   icon={<CheckCircle2 />}
 *   compact={false}
 * />
 */
export function StatusCard({
  status,
  count,
  label,
  icon,
  compact = false,
  className,
}: StatusCardProps) {
  const colors = STATUS_COLOR_MAP[status];

  return (
    <div
      className={cn(
        'rounded-lg border transition-shadow hover:shadow-md',
        compact ? 'p-2' : 'p-4',
        colors.bg,
        colors.border,
        className
      )}
      aria-label={`${label}: ${count}`}
    >
      <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0',
            colors.text,
            compact ? 'w-5 h-5' : 'w-6 h-6'
          )}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'font-bold',
              colors.text,
              compact ? 'text-lg' : 'text-2xl'
            )}
          >
            {count}
          </div>
          <div
            className={cn(
              'truncate text-gray-600 dark:text-gray-400',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
