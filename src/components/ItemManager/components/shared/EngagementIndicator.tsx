'use client';

/**
 * EngagementIndicator Component
 *
 * Visual indicator showing engagement level (high/medium/low) based on
 * view counts and reactions. Uses color-coded badges/icons.
 *
 * @module ItemManager/components/shared/EngagementIndicator
 * @lastModified 2026-01-22 (REQ-E02-079 - Added i18n translations)
 */

import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemVisitStats, ItemReactionSummary } from '../../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

export type EngagementLevel = 'high' | 'medium' | 'low';

export interface EngagementThresholds {
  /**
   * Minimum views in last 7 days for "high" engagement.
   * @default 50
   */
  highViews?: number;
  /**
   * Minimum views in last 7 days for "medium" engagement.
   * @default 10
   */
  mediumViews?: number;
  /**
   * Minimum total reactions for "high" engagement.
   * @default 10
   */
  highReactions?: number;
  /**
   * Minimum total reactions for "medium" engagement.
   * @default 3
   */
  mediumReactions?: number;
}

export interface EngagementIndicatorProps {
  /**
   * Visit statistics for the item.
   */
  visitStats?: ItemVisitStats | null;

  /**
   * Reaction summary for the item.
   */
  reactions?: ItemReactionSummary | null;

  /**
   * Custom thresholds for engagement levels.
   */
  thresholds?: EngagementThresholds;

  /**
   * Display variant.
   * @default 'badge'
   */
  variant?: 'badge' | 'icon' | 'dot';

  /**
   * Size variant.
   * @default 'small'
   */
  size?: 'small' | 'medium';

  /**
   * Optional additional CSS classes.
   */
  className?: string;

  /**
   * Whether to show loading state.
   * @default false
   */
  loading?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_THRESHOLDS: Required<EngagementThresholds> = {
  highViews: 50,
  mediumViews: 10,
  highReactions: 10,
  mediumReactions: 3,
};

const LEVEL_STYLES: Record<EngagementLevel, { bg: string; text: string; border: string }> = {
  high: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  low: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
  },
};

// Engagement level keys for i18n lookup
const LEVEL_KEYS: EngagementLevel[] = ['high', 'medium', 'low'];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate engagement level based on visit stats and reactions.
 */
function calculateEngagementLevel(
  visitStats: ItemVisitStats | null | undefined,
  reactions: ItemReactionSummary | null | undefined,
  thresholds: Required<EngagementThresholds>
): EngagementLevel {
  const views7d = visitStats?.last7Days ?? 0;
  const totalReactions = reactions?.total ?? 0;

  // High engagement: either high views OR high reactions
  if (views7d >= thresholds.highViews || totalReactions >= thresholds.highReactions) {
    return 'high';
  }

  // Medium engagement: either medium views OR medium reactions
  if (views7d >= thresholds.mediumViews || totalReactions >= thresholds.mediumReactions) {
    return 'medium';
  }

  return 'low';
}

// =============================================================================
// Component
// =============================================================================

export function EngagementIndicator({
  visitStats,
  reactions,
  thresholds,
  variant = 'badge',
  size = 'small',
  className,
  loading = false,
}: EngagementIndicatorProps) {
  // REQ-E02-079: i18n translations
  const t = useTranslations('items');

  const mergedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const level = calculateEngagementLevel(visitStats, reactions, mergedThresholds);
  const styles = LEVEL_STYLES[level];
  const levelLabel = t(`analytics.engagement.${level}`);

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
  };

  const iconSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';

  if (loading) {
    return (
      <span
        className={cn(
          'inline-block rounded-full bg-gray-100 animate-pulse',
          variant === 'dot' ? 'w-2 h-2' : 'w-12 h-5',
          className
        )}
        aria-label={t('analytics.loadingEngagement')}
      />
    );
  }

  const Icon = level === 'high' ? TrendingUp : level === 'medium' ? Minus : TrendingDown;

  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'inline-block rounded-full',
          size === 'small' ? 'w-2 h-2' : 'w-3 h-3',
          styles.bg,
          className
        )}
        aria-label={levelLabel}
        role="img"
      />
    );
  }

  if (variant === 'icon') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center',
          styles.text,
          className
        )}
        aria-label={levelLabel}
        role="img"
      >
        <Icon className={iconSize} aria-hidden="true" />
      </span>
    );
  }

  // Default: badge variant
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border',
        styles.bg,
        styles.text,
        styles.border,
        sizeClasses[size],
        'font-medium',
        className
      )}
      aria-label={levelLabel}
    >
      <Icon className={iconSize} aria-hidden="true" />
      <span className="capitalize">{t(`analytics.level.${level}`)}</span>
    </span>
  );
}

export default EngagementIndicator;
