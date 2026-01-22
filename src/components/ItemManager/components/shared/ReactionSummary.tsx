'use client';

/**
 * ReactionSummary Component
 *
 * Displays a compact summary of reaction counts with emoji icons.
 * Shows top reactions by count, with tooltips for full details.
 *
 * @module ItemManager/components/shared/ReactionSummary
 * @lastModified 2026-01-22 (REQ-E02-079 - Added i18n translations)
 */

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ItemReactionSummary } from '../../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

export interface ReactionSummaryProps {
  /**
   * Reaction counts to display.
   */
  reactions: ItemReactionSummary;

  /**
   * Size variant for the display.
   * @default 'small'
   */
  size?: 'small' | 'medium';

  /**
   * Maximum number of reaction types to show.
   * @default 3
   */
  maxReactions?: number;

  /**
   * Optional additional CSS classes.
   */
  className?: string;

  /**
   * Whether to show loading skeleton.
   * @default false
   */
  loading?: boolean;

  /**
   * Layout variant.
   * @default 'inline'
   */
  variant?: 'inline' | 'stacked';
}

// =============================================================================
// Constants
// =============================================================================

const REACTION_EMOJIS: Record<keyof Omit<ItemReactionSummary, 'total'>, string> = {
  like: '👍',
  love: '❤️',
  dislike: '👎',
  confused: '😕',
};

// Reaction type keys for i18n lookup
const REACTION_KEYS: (keyof Omit<ItemReactionSummary, 'total'>)[] = ['like', 'love', 'dislike', 'confused'];

// =============================================================================
// Component
// =============================================================================

export function ReactionSummary({
  reactions,
  size = 'small',
  maxReactions = 3,
  className,
  loading = false,
  variant = 'inline',
}: ReactionSummaryProps) {
  // REQ-E02-079: i18n translations
  const t = useTranslations('items');

  const sizeClasses = {
    small: 'text-xs gap-1',
    medium: 'text-sm gap-1.5',
  };

  const emojiSize = size === 'small' ? 'text-sm' : 'text-base';

  if (loading) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-gray-100 animate-pulse',
          'w-16 h-5',
          className
        )}
        aria-label={t('analytics.loadingReactions')}
      />
    );
  }

  // If no reactions, show nothing or a minimal indicator
  if (reactions.total === 0) {
    return null;
  }

  // Sort reactions by count (descending) and filter out zeros
  const sortedReactions = (
    Object.entries(reactions) as [keyof ItemReactionSummary, number][]
  )
    .filter(([key, count]) => key !== 'total' && count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxReactions);

  // Build aria-label for accessibility using translations
  const ariaLabel = sortedReactions
    .map(([type, count]) => t(`analytics.reactionCount.${type}`, { count }))
    .join(', ');

  if (variant === 'stacked') {
    return (
      <div
        className={cn('flex flex-col', sizeClasses[size], className)}
        aria-label={ariaLabel}
        role="group"
      >
        {sortedReactions.map(([type, count]) => (
          <div key={type} className="flex items-center gap-1">
            <span className={emojiSize} aria-hidden="true">
              {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]}
            </span>
            <span className="text-gray-600">{count}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center',
        sizeClasses[size],
        className
      )}
      aria-label={ariaLabel}
      role="group"
    >
      {sortedReactions.map(([type, count], index) => (
        <span key={type} className="inline-flex items-center gap-0.5">
          <span className={emojiSize} aria-hidden="true">
            {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]}
          </span>
          <span className="text-gray-600">{count}</span>
          {index < sortedReactions.length - 1 && (
            <span className="text-gray-300 mx-0.5" aria-hidden="true">·</span>
          )}
        </span>
      ))}
    </span>
  );
}

export default ReactionSummary;
