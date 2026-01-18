'use client';

/**
 * DuplicateNameWarning Component
 *
 * Displays a warning indicator when a duplicate or similar
 * item name is detected in the current session.
 *
 * @module ItemCreationWorkflow/components/shared/DuplicateNameWarning
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05
 */

import { AlertTriangle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

export interface DuplicateNameWarningProps {
  /** Names that match the current input */
  matchingNames: string[];
  /** Type of match (exact or similar) */
  matchType: 'exact' | 'similar';
  /** Whether to show as inline or block */
  variant?: 'inline' | 'block';
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MESSAGES = {
  exact: 'Exact name already exists',
  similar: 'Similar name already used',
} as const;

// =============================================================================
// Main Component
// =============================================================================

/**
 * Warning indicator for duplicate item names.
 * Shows inline icon with tooltip or block message based on variant.
 */
export function DuplicateNameWarning({
  matchingNames,
  matchType,
  variant = 'block',
  className,
}: DuplicateNameWarningProps) {
  const message = MESSAGES[matchType];
  const matchList = matchingNames.slice(0, 3); // Show max 3 matches
  const hasMore = matchingNames.length > 3;

  // Inline variant - just icon with tooltip
  if (variant === 'inline') {
    return (
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span
              className={cn(
                'inline-flex items-center',
                'cursor-help',
                className
              )}
              aria-label={`Warning: ${message}`}
            >
              <AlertTriangle
                className="w-4 h-4 text-amber-500"
                aria-hidden="true"
              />
            </span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className={cn(
                'z-50 rounded-md',
                'bg-gray-900 px-3 py-2',
                'text-sm text-white',
                'shadow-md',
                'max-w-xs',
                'animate-in fade-in-0 zoom-in-95 duration-150'
              )}
              sideOffset={5}
            >
              <p className="font-medium mb-1">{message}</p>
              <ul className="text-xs text-gray-300 space-y-0.5">
                {matchList.map((name, i) => (
                  <li key={i} className="truncate">• {name}</li>
                ))}
                {hasMore && (
                  <li className="text-gray-400">
                    +{matchingNames.length - 3} more...
                  </li>
                )}
              </ul>
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  // Block variant - icon + message with optional matching names
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2',
        'px-3 py-2',
        'bg-amber-50 border border-amber-200 rounded-lg',
        'text-sm text-amber-800',
        className
      )}
    >
      <AlertTriangle
        className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{message}</p>
        {matchList.length > 0 && (
          <ul className="mt-1 text-xs text-amber-700 space-y-0.5">
            {matchList.map((name, i) => (
              <li key={i} className="truncate">• {name}</li>
            ))}
            {hasMore && (
              <li className="text-amber-600">
                +{matchingNames.length - 3} more...
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DuplicateNameWarning;
