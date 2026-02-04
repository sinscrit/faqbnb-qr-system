'use client';

/**
 * TranslationStatusWidget Component
 *
 * Dashboard widget displaying translation status overview with progress bar
 * and status breakdown cards. Supports both full and compact modes.
 *
 * @module TranslationManagement/TranslationStatusWidget
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-24
 * @requestReference REQ-E05-013
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslationStatus } from '@/hooks';
import { TranslationProgressBar } from '../TranslationPreviewPanel';
import { StatusCard } from './StatusCard';
import { SkeletonBase } from '@/components/SimpleDashboard/skeletons/SkeletonBase';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  ChevronRight,
  RefreshCw,
  Languages,
} from 'lucide-react';

// =============================================================================
// Props Interface
// =============================================================================

/**
 * Props for TranslationStatusWidget component.
 */
export interface TranslationStatusWidgetProps {
  /** Filter to specific property (optional) */
  propertyId?: string;
  /** Compact mode for sidebar placement (default: false) */
  compact?: boolean;
  /** Callback when View Details is clicked */
  onViewAll?: () => void;
  /** Show/hide View Details link (default: true) */
  showViewAllLink?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function TranslationStatusWidget({
  propertyId,
  compact = false,
  onViewAll,
  showViewAllLink = true,
  className,
}: TranslationStatusWidgetProps) {
  const t = useTranslations('translationManagement.widget');

  // Fetch translation status data
  // Only enable query if propertyId is provided
  const { summary, isLoading, error, refetch } = useTranslationStatus({
    propertyId,
    enabled: Boolean(propertyId),
  });

  /**
   * Extract and compute status counts from summary data.
   * Handles fallback for undefined/null data.
   */
  const statusCounts = useMemo(() => {
    const completeCount = summary?.complete ?? 0;
    const partialCount = summary?.partial ?? 0;
    const pendingCount = summary?.pending ?? 0;
    const failedCount = summary?.failed ?? 0;
    const staleCount = summary?.stale ?? 0;
    const totalEntities =
      completeCount + partialCount + pendingCount + failedCount;

    return {
      complete: completeCount,
      partial: partialCount,
      pending: pendingCount,
      failed: failedCount,
      stale: staleCount,
      totalEntities,
    };
  }, [summary]);

  /**
   * Calculate overall completion percentage.
   * Partial translations count as 50% complete toward the total.
   */
  const completionPercentage = useMemo(() => {
    if (statusCounts.totalEntities === 0) return 0;

    const partialWeight = 0.5;
    const weightedCompletion =
      (statusCounts.complete + statusCounts.partial * partialWeight) /
      statusCounts.totalEntities;
    const percentage = Math.round(weightedCompletion * 100);

    return Math.max(0, Math.min(100, percentage));
  }, [statusCounts]);

  // Loading state
  if (isLoading) {
    return (
      <SkeletonBase label={t('loading')}>
        <div
          className={cn(
            'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden',
            className
          )}
          aria-busy="true"
        >
          {/* Skeleton header */}
          <div
            className={cn(
              'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 animate-pulse',
              compact ? 'h-10' : 'h-12'
            )}
          />
          {/* Skeleton progress bar */}
          <div className={cn('p-4 border-b border-gray-200 dark:border-gray-700', compact && 'p-3')}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
          {/* Skeleton cards */}
          <div className={cn('p-4', compact && 'p-3')}>
            <div
              className={cn(
                'grid gap-2',
                compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-4'
              )}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse',
                    compact ? 'h-16' : 'h-20'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </SkeletonBase>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden',
          className
        )}
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center',
            compact ? 'min-h-[200px] p-4' : 'min-h-[300px] p-6'
          )}
        >
          <XCircle
            className={cn(
              'text-red-500',
              compact ? 'w-8 h-8' : 'w-12 h-12'
            )}
          />
          <p
            className={cn(
              'text-center text-gray-600 dark:text-gray-400 mt-3',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {t('error')}
          </p>
          <button
            onClick={() => refetch()}
            className={cn(
              'mt-4 flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600',
              'text-gray-700 dark:text-gray-300 transition-colors',
              compact ? 'text-sm' : 'text-base'
            )}
            aria-label={t('retry')}
          >
            <RefreshCw className="w-4 h-4" />
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!summary || statusCounts.totalEntities === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden',
          className
        )}
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center',
            compact ? 'min-h-[200px] p-4' : 'min-h-[300px] p-6'
          )}
        >
          <Languages
            className={cn(
              'text-gray-400',
              compact ? 'w-8 h-8' : 'w-12 h-12'
            )}
          />
          <p
            className={cn(
              'text-center text-gray-500 dark:text-gray-400 mt-3',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {t('empty')}
          </p>
        </div>
      </div>
    );
  }

  // Main widget render
  return (
    <div
      className={cn(
        'rounded-lg shadow-md bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'hover:shadow-lg transition-shadow duration-200',
        'overflow-hidden',
        className
      )}
      role="region"
      aria-label={t('title')}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-end',
          'bg-gradient-to-r from-purple-600 to-indigo-600',
          compact ? 'px-3 py-2' : 'px-4 py-3',
          'rounded-t-lg'
        )}
      >
        {showViewAllLink && (
          <>
            {onViewAll ? (
              <button
                onClick={onViewAll}
                className={cn(
                  'flex items-center gap-1 text-white/90 hover:text-white transition-colors',
                  compact ? 'text-xs' : 'text-sm'
                )}
              >
                {t('viewDetails')}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/dashboard2/translations"
                className={cn(
                  'flex items-center gap-1 text-white/90 hover:text-white transition-colors',
                  compact ? 'text-xs' : 'text-sm'
                )}
              >
                {t('viewDetails')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </>
        )}
      </div>

      {/* Progress Section */}
      <div
        className={cn(
          'border-b border-gray-200 dark:border-gray-700',
          compact ? 'p-3' : 'p-4'
        )}
        aria-label="Translation progress"
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={cn(
              'font-medium text-gray-700 dark:text-gray-300',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {t('progress', { percent: completionPercentage })}
          </span>
        </div>
        <TranslationProgressBar
          completed={statusCounts.complete}
          pending={statusCounts.pending}
          failed={statusCounts.failed}
          stale={statusCounts.stale}
          total={statusCounts.totalEntities}
          size={compact ? 'sm' : 'md'}
        />
      </div>

      {/* Status Cards Grid */}
      <div
        className={compact ? 'p-3' : 'p-4'}
        aria-label="Translation status breakdown"
      >
        <div
          className={cn(
            'grid',
            compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-4'
          )}
        >
          <StatusCard
            status="complete"
            count={statusCounts.complete}
            label={t('statusLabels.complete')}
            icon={<CheckCircle2 className="w-full h-full" />}
            compact={compact}
          />
          <StatusCard
            status="partial"
            count={statusCounts.partial}
            label={t('statusLabels.partial')}
            icon={<AlertCircle className="w-full h-full" />}
            compact={compact}
          />
          <StatusCard
            status="pending"
            count={statusCounts.pending}
            label={t('statusLabels.pending')}
            icon={<Clock className="w-full h-full" />}
            compact={compact}
          />
          <StatusCard
            status="failed"
            count={statusCounts.failed}
            label={t('statusLabels.failed')}
            icon={<XCircle className="w-full h-full" />}
            compact={compact}
          />
        </div>
      </div>
    </div>
  );
}
