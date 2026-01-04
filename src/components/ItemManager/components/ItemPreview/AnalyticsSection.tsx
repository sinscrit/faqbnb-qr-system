'use client';

/**
 * AnalyticsSection Component
 *
 * Displays detailed analytics for an item in the preview modal.
 * Shows time-based visit breakdown and complete reaction details.
 *
 * @module ItemManager/components/ItemPreview/AnalyticsSection
 * @lastModified 2026-01-05 (REQ-091)
 */

import { Eye, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemVisitStats, ItemReactionSummary } from '../../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

export interface AnalyticsSectionProps {
  /**
   * Visit statistics for the item.
   */
  visitStats?: ItemVisitStats | null;

  /**
   * Reaction summary for the item.
   */
  reactions?: ItemReactionSummary | null;

  /**
   * Whether analytics are currently loading.
   * @default false
   */
  loading?: boolean;

  /**
   * Optional additional CSS classes.
   */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const REACTION_DISPLAY: Record<keyof Omit<ItemReactionSummary, 'total'>, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Likes' },
  love: { emoji: '❤️', label: 'Loves' },
  dislike: { emoji: '👎', label: 'Dislikes' },
  confused: { emoji: '😕', label: 'Confused' },
};

const TIME_PERIODS: { key: keyof ItemVisitStats; label: string }[] = [
  { key: 'last24Hours', label: 'Last 24 hours' },
  { key: 'last7Days', label: 'Last 7 days' },
  { key: 'last30Days', label: 'Last 30 days' },
  { key: 'allTime', label: 'All time' },
];

// =============================================================================
// Component
// =============================================================================

export function AnalyticsSection({
  visitStats,
  reactions,
  loading = false,
  className,
}: AnalyticsSectionProps) {
  const hasData = visitStats || reactions;

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-100 rounded-lg" />
          <div className="h-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className={cn('text-center py-4 text-gray-500', className)}>
        <Eye className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visit Statistics */}
        {visitStats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <h4 className="text-sm font-medium text-gray-700">Views</h4>
            </div>
            <div className="space-y-2">
              {TIME_PERIODS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {visitStats[key].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        {reactions && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base" aria-hidden="true">😊</span>
              <h4 className="text-sm font-medium text-gray-700">Reactions</h4>
              <span className="text-xs text-gray-500 ml-auto">
                {reactions.total} total
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(REACTION_DISPLAY) as [keyof typeof REACTION_DISPLAY, { emoji: string; label: string }][]).map(
                ([key, { emoji, label }]) => {
                  const count = reactions[key];
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg',
                        count > 0 ? 'bg-white border border-gray-200' : 'bg-gray-100'
                      )}
                    >
                      <span className="text-lg" aria-hidden="true">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 truncate">{label}</div>
                        <div className={cn(
                          'text-sm font-medium',
                          count > 0 ? 'text-gray-900' : 'text-gray-400'
                        )}>
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsSection;
