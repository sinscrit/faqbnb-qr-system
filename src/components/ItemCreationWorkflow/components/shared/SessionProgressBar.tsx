'use client';

/**
 * SessionProgressBar Component
 *
 * Displays session-level progress showing items created in the current
 * session. Visual progress bar with Airbnb brand color (#FF385C) and
 * optional count display.
 *
 * @example
 * ```tsx
 * <SessionProgressBar
 *   itemsCreated={5}
 *   maxItems={50}
 *   showCount={true}
 * />
 * // Displays: "5 of 50 items"
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/SessionProgressBar
 * @see SessionSummaryStep for usage context
 * @lastModified 2026-01-22 (REQ-E02-066 i18n translations)
 */

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { WORKFLOW_CONFIG_DEFAULTS } from '../../utils/constants';

// =============================================================================
// Type Definitions
// =============================================================================

export interface SessionProgressBarProps {
  /** Number of items created in this session */
  itemsCreated: number;
  /** Optional maximum items per session (default: 50 from config) */
  maxItems?: number;
  /** Optional: Show count text (default: true) */
  showCount?: boolean;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function SessionProgressBar({
  itemsCreated,
  maxItems = WORKFLOW_CONFIG_DEFAULTS.maxItemsPerSession,
  showCount = true,
  className,
}: SessionProgressBarProps) {
  // Translation hook (REQ-E02-066)
  const t = useTranslations('workflow.shared.progress');

  // Calculate progress percentage, clamped at 100%
  const progressPercent = Math.min((itemsCreated / maxItems) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar container */}
      <div
        className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={itemsCreated}
        aria-valuemin={0}
        aria-valuemax={maxItems}
        aria-label={t('sessionProgress', { count: itemsCreated })}
      >
        {/* Progress fill */}
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: '#FF385C', // Airbnb brand primary
          }}
        />
      </div>

      {/* Count text */}
      {showCount && (
        <p className="mt-1.5 text-sm text-gray-600">
          {t('itemsCreated', { count: itemsCreated })}
        </p>
      )}
    </div>
  );
}

export default SessionProgressBar;
