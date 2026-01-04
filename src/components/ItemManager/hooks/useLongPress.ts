/**
 * useLongPress Hook
 *
 * Reusable long-press gesture hook for mobile selection mode entry.
 * Detects long-press gestures on touch devices and triggers callbacks.
 *
 * @module ItemManager/hooks/useLongPress
 * @see docs/REQ-069-integrate-selection-ui-detailed.md (Task 3.2.1)
 * @lastModified 2026-01-04 (REQ-069)
 */

'use client';

import { useRef, useCallback, useEffect } from 'react';

// =============================================================================
// Types and Interfaces
// =============================================================================

/**
 * Options for the useLongPress hook.
 */
export interface UseLongPressOptions {
  /** Required callback when long-press is detected */
  onLongPress: () => void;
  /** Delay in milliseconds before triggering long-press (default: 500) */
  delay?: number;
  /** Whether the hook is enabled (default: true) */
  enabled?: boolean;
  /** Whether to trigger haptic feedback on long-press (default: true) */
  hapticFeedback?: boolean;
}

/**
 * Return type for the useLongPress hook.
 */
export interface UseLongPressReturn {
  /** Event handlers to spread on the target element */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchCancel: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  /** Check if a long-press was detected (use to prevent click actions) */
  isLongPress: () => boolean;
  /** Reset the long-press state */
  reset: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_DELAY = 500;

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for detecting long-press gestures on touch devices.
 *
 * @param options - Configuration options for the hook
 * @returns Object containing event handlers and state functions
 *
 * @example
 * const { handlers, isLongPress } = useLongPress({
 *   onLongPress: () => console.log('Long press detected!'),
 *   delay: 500,
 *   enabled: !isSelectionMode,
 * });
 *
 * return (
 *   <div {...handlers} onClick={() => !isLongPress() && handleClick()}>
 *     Long press me
 *   </div>
 * );
 */
export function useLongPress(options: UseLongPressOptions): UseLongPressReturn {
  const {
    onLongPress,
    delay = DEFAULT_DELAY,
    enabled = true,
    hapticFeedback = true,
  } = options;

  // Refs for timer and long-press state
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Clear the timer and reset timer ref.
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Trigger haptic feedback if supported and enabled.
   */
  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch {
        // Ignore errors - haptic feedback is optional
      }
    }
  }, [hapticFeedback]);

  /**
   * Start the long-press timer.
   */
  const start = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      // Store starting touch position for movement detection
      const touch = e.touches[0];
      if (touch) {
        startPositionRef.current = { x: touch.clientX, y: touch.clientY };
      }

      // Reset long-press state
      isLongPressRef.current = false;

      // Clear any existing timer
      clearTimer();

      // Start new timer
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        triggerHapticFeedback();
        onLongPress();
      }, delay);
    },
    [enabled, delay, onLongPress, clearTimer, triggerHapticFeedback]
  );

  /**
   * Cancel the long-press timer (on touch end/cancel).
   */
  const cancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  /**
   * Handle touch move - cancel if user moves too far from start position.
   * This prevents triggering long-press during scroll gestures.
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!timerRef.current || !startPositionRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      // Calculate distance moved
      const deltaX = Math.abs(touch.clientX - startPositionRef.current.x);
      const deltaY = Math.abs(touch.clientY - startPositionRef.current.y);

      // Cancel if moved more than 10px in any direction
      if (deltaX > 10 || deltaY > 10) {
        clearTimer();
        startPositionRef.current = null;
      }
    },
    [clearTimer]
  );

  /**
   * Prevent context menu when long-press was detected.
   * This prevents the native long-press menu on iOS/Android.
   */
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (isLongPressRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    []
  );

  /**
   * Reset long-press state.
   */
  const reset = useCallback(() => {
    clearTimer();
    isLongPressRef.current = false;
    startPositionRef.current = null;
  }, [clearTimer]);

  /**
   * Check if a long-press was detected.
   * Use this to prevent click actions after long-press.
   */
  const isLongPress = useCallback(() => isLongPressRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Return handlers and state functions
  return {
    handlers: {
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchCancel: cancel,
      onTouchMove: handleTouchMove,
      onContextMenu: handleContextMenu,
    },
    isLongPress,
    reset,
  };
}

export default useLongPress;
