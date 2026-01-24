'use client';

/**
 * TranslationProgressBar Component
 *
 * Displays translation completion status as a segmented, multi-colored progress bar.
 * Shows proportional segments for complete/pending/failed/stale/missing translations.
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationProgressBar
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-24
 * @requestReference REQ-E05-009
 *
 * @example
 * // Basic usage with required props
 * <TranslationProgressBar
 *   completed={3}
 *   pending={1}
 *   failed={1}
 *   total={5}
 * />
 *
 * @example
 * // With all optional props
 * <TranslationProgressBar
 *   completed={3}
 *   pending={1}
 *   failed={0}
 *   stale={1}
 *   total={5}
 *   showLabels
 *   showPercentage
 *   size="lg"
 *   animated={false}
 *   labelFormat="detailed"
 *   className="mb-4"
 * />
 *
 * @example
 * // Integration with TranslationPreviewPanel
 * <TranslationProgressBar
 *   completed={translations.filter(t => t.status === 'completed').length}
 *   pending={translations.filter(t => t.status === 'pending' || t.status === 'processing').length}
 *   failed={translations.filter(t => t.status === 'failed').length}
 *   stale={translations.filter(t => t.isStale).length}
 *   total={SUPPORTED_LANGUAGES.length}
 *   showLabels
 *   showPercentage
 * />
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { TranslationFn } from '@/types';

// =============================================================================
// Component Props Interface
// =============================================================================

/**
 * Props for TranslationProgressBar component.
 *
 * @property completed - Count of completed translations
 * @property pending - Count of in-progress translations
 * @property failed - Count of failed translations
 * @property stale - Count of stale translations (optional, defaults to 0)
 * @property total - Total possible translations
 * @property showLabels - Whether to display text summary (e.g., "3/5" or "3 of 5 translations")
 * @property showPercentage - Whether to show percentage (e.g., "60%")
 * @property size - Bar height variant: 'sm' (6px), 'md' (8px), 'lg' (12px)
 * @property animated - Enable pulse animation on pending segment (auto-enabled when pending > 0)
 * @property labelFormat - 'compact' shows "3/5", 'detailed' shows "3 of 5 translations"
 * @property className - Additional CSS classes
 */
export interface TranslationProgressBarProps {
  /** Count of completed translations */
  completed: number;
  /** Count of in-progress translations */
  pending: number;
  /** Count of failed translations */
  failed: number;
  /** Count of stale translations (optional) */
  stale?: number;
  /** Total possible translations */
  total: number;
  /** Whether to display text summary */
  showLabels?: boolean;
  /** Whether to show percentage */
  showPercentage?: boolean;
  /** Bar height variant */
  size?: 'sm' | 'md' | 'lg';
  /** Enable pulse animation on pending segment */
  animated?: boolean;
  /** Label format: 'compact' or 'detailed' */
  labelFormat?: 'compact' | 'detailed';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Configuration for progress bar size variants.
 * Maps size prop to bar height and label font size.
 */
const SIZE_CONFIG = {
  sm: { barHeight: 'h-1.5', fontSize: 'text-xs' },
  md: { barHeight: 'h-2', fontSize: 'text-sm' },
  lg: { barHeight: 'h-3', fontSize: 'text-base' },
} as const;

/**
 * Color classes for each segment type.
 * Matches color scheme from TranslationStatusItem component.
 */
const SEGMENT_COLORS = {
  complete: 'bg-green-500',
  pending: 'bg-orange-500',
  failed: 'bg-red-500',
  stale: 'bg-amber-500',
  missing: 'bg-gray-200',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Segment width percentages for each status type.
 */
interface SegmentWidths {
  completed: number;
  pending: number;
  failed: number;
  stale: number;
  missing: number;
}

/**
 * Calculates proportional width percentages for each segment type.
 * Returns percentages that sum to 100%.
 */
function calculateSegmentWidths(
  completed: number,
  pending: number,
  failed: number,
  stale: number,
  total: number
): SegmentWidths {
  const safeTotal = Math.max(total, 1);
  const missing = Math.max(0, total - (completed + pending + failed + stale));

  return {
    completed: (completed / safeTotal) * 100,
    pending: (pending / safeTotal) * 100,
    failed: (failed / safeTotal) * 100,
    stale: (stale / safeTotal) * 100,
    missing: (missing / safeTotal) * 100,
  };
}

/**
 * Formats the progress label text based on format prop.
 * Compact returns 'X/Y', detailed returns localized 'X of Y translations'.
 */
function formatLabel(
  completed: number,
  total: number,
  format: 'compact' | 'detailed',
  t: TranslationFn
): string {
  if (format === 'compact') {
    return `${completed}/${total}`;
  }
  return t('progressLabel', { completed, total });
}

// =============================================================================
// Component
// =============================================================================

export function TranslationProgressBar(props: TranslationProgressBarProps) {
  const {
    completed,
    pending,
    failed,
    stale = 0,
    total,
    showLabels = false,
    showPercentage = false,
    size = 'md',
    animated = pending > 0,
    labelFormat = 'compact',
    className,
  } = props;

  // Translation hooks
  const t = useTranslations('translation.progressBar');

  // Get size configuration
  const sizeConfig = SIZE_CONFIG[size];

  // Compute segment widths with useMemo
  const widths = useMemo(
    () => calculateSegmentWidths(completed, pending, failed, stale, total),
    [completed, pending, failed, stale, total]
  );

  // Compute completion percentage
  const completionPercentage = useMemo(
    () => (total > 0 ? Math.round((completed / total) * 100) : 0),
    [completed, total]
  );

  // Compute label text if needed
  const labelText = useMemo(
    () => (showLabels ? formatLabel(completed, total, labelFormat, t) : null),
    [showLabels, completed, total, labelFormat, t]
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Labels and percentage display */}
      {(showLabels || showPercentage) && (
        <div className="flex items-center justify-between">
          {showLabels && labelText && (
            <span
              className={cn(
                'font-medium text-gray-700 dark:text-gray-300',
                sizeConfig.fontSize
              )}
            >
              {labelText}
            </span>
          )}
          {showPercentage && (
            <span
              className={cn(
                'font-semibold text-gray-900 dark:text-white',
                sizeConfig.fontSize
              )}
            >
              {completionPercentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={cn(
          'relative w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700',
          sizeConfig.barHeight
        )}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t('ariaLabel', { completed, total })}
      >
        {/* Screen reader text for detailed status */}
        <span className="sr-only">
          {t('detailedStatus', { completed, pending, failed, stale, total })}
        </span>

        {/* Segments container */}
        <div className="absolute inset-0 flex">
          {/* Completed segment */}
          {widths.completed > 0 && (
            <div
              className={cn(
                'h-full transition-all duration-300 ease-in-out',
                SEGMENT_COLORS.complete
              )}
              style={{ width: `${widths.completed}%` }}
              aria-label={t('segmentLabel', { type: t('complete'), count: completed })}
            />
          )}

          {/* Pending segment with animation */}
          {widths.pending > 0 && (
            <div
              className={cn(
                'h-full transition-all duration-300 ease-in-out',
                SEGMENT_COLORS.pending,
                animated && 'animate-pulse motion-reduce:animate-none'
              )}
              style={{ width: `${widths.pending}%` }}
              aria-label={t('segmentLabel', { type: t('pending'), count: pending })}
            />
          )}

          {/* Failed segment */}
          {widths.failed > 0 && (
            <div
              className={cn(
                'h-full transition-all duration-300 ease-in-out',
                SEGMENT_COLORS.failed
              )}
              style={{ width: `${widths.failed}%` }}
              aria-label={t('segmentLabel', { type: t('failed'), count: failed })}
            />
          )}

          {/* Stale segment */}
          {stale > 0 && widths.stale > 0 && (
            <div
              className={cn(
                'h-full transition-all duration-300 ease-in-out',
                SEGMENT_COLORS.stale
              )}
              style={{ width: `${widths.stale}%` }}
              aria-label={t('segmentLabel', { type: t('stale'), count: stale })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
