'use client';

/**
 * TruncatedText Component
 *
 * Displays text truncated with ellipsis when exceeding maxLength,
 * with full text shown in tooltip on hover or mobile long-press.
 *
 * @module ItemCreationWorkflow/components/shared/TruncatedText
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05
 */

import { useState, useRef, useCallback, useEffect, createElement } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

export interface TruncatedTextProps {
  /** The full text to display */
  text: string;
  /** Maximum character length before truncation (default: 40) */
  maxLength?: number;
  /** HTML element to render as (default: 'span') */
  as?: 'span' | 'p' | 'h3' | 'div';
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MAX_LENGTH = 40;
const LONG_PRESS_DELAY = 500; // ms

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Truncates text to specified length with ellipsis.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Text component with truncation and tooltip support.
 * Shows full text on hover (desktop) or long-press (mobile).
 */
export function TruncatedText({
  text,
  maxLength = DEFAULT_MAX_LENGTH,
  as = 'span',
  className,
}: TruncatedTextProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? truncateText(text, maxLength) : text;

  // Handle touch start for long-press
  const handleTouchStart = useCallback(() => {
    if (!shouldTruncate) return;

    longPressTimerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, LONG_PRESS_DELAY);
  }, [shouldTruncate]);

  // Handle touch end - clear timer and hide tooltip
  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Delay hiding tooltip for better UX
    setTimeout(() => setShowTooltip(false), 200);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // If no truncation needed, render simple element
  if (!shouldTruncate) {
    return createElement(
      as,
      {
        ref: elementRef,
        className,
      },
      text
    );
  }

  // With truncation, wrap in tooltip
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root open={showTooltip} onOpenChange={setShowTooltip}>
        <Tooltip.Trigger asChild>
          {createElement(
            as,
            {
              ref: elementRef,
              className: cn('cursor-default', className),
              title: text, // Fallback for accessibility
              onTouchStart: handleTouchStart,
              onTouchEnd: handleTouchEnd,
              onTouchCancel: handleTouchEnd,
            },
            displayText
          )}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={cn(
              'z-50 overflow-hidden rounded-md',
              'bg-gray-900 px-3 py-2',
              'text-sm text-white',
              'shadow-md',
              'max-w-xs break-words',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2'
            )}
            sideOffset={5}
          >
            {text}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default TruncatedText;
