'use client';

/**
 * SessionProgressBar Component
 *
 * Displays session-level progress showing items created count.
 * Uses Airbnb brand color (#FF385C) for the progress fill.
 *
 * @module ItemCreationWorkflow/components/shared/SessionProgressBar
 * @see docs/REQ-097-basic-shared-components-overview.md
 * @lastModified 2026-01-05
 */

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
        aria-label={`Session progress: ${itemsCreated} items created`}
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
          {itemsCreated} items created
        </p>
      )}
    </div>
  );
}

export default SessionProgressBar;
