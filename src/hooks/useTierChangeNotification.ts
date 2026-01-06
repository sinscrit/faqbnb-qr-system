// src/hooks/useTierChangeNotification.ts
// REQ-136: Tier Change Notification Hook
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardTier } from './useDashboardTier';

/**
 * Messages shown when tier changes
 */
const TIER_CHANGE_MESSAGES: Record<DashboardTier, string> = {
  single: 'Dashboard simplified for single property',
  few: 'Property selector now available',
  multiple: 'Filtering and grouping controls now available',
  many: 'Advanced tools now available',
};

/**
 * Return type for useTierChangeNotification hook
 */
export interface UseTierChangeNotificationReturn {
  /** Current notification message (null when not showing) */
  notification: string | null;
  /** Manually dismiss the notification */
  dismiss: () => void;
}

/**
 * Hook that shows notifications when the dashboard tier changes
 *
 * @param currentTier - The current dashboard tier
 * @param enabled - Whether notifications are enabled (default: true)
 * @param autoDismissMs - Auto-dismiss time in ms (default: 3000)
 * @returns Object with notification message and dismiss function
 *
 * @example
 * ```tsx
 * const tierConfig = useDashboardTier(propertyCount);
 * const { notification, dismiss } = useTierChangeNotification(tierConfig.tier);
 *
 * // Show notification when present
 * {notification && (
 *   <div className="notification">{notification}</div>
 * )}
 * ```
 */
export function useTierChangeNotification(
  currentTier: DashboardTier,
  enabled: boolean = true,
  autoDismissMs: number = 3000
): UseTierChangeNotificationReturn {
  const [notification, setNotification] = useState<string | null>(null);
  const previousTierRef = useRef<DashboardTier | null>(null);
  const isInitialMountRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dismiss notification
  const dismiss = useCallback(() => {
    setNotification(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Detect tier changes
  useEffect(() => {
    // Skip on initial mount - we don't want to show notification on first load
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousTierRef.current = currentTier;
      return;
    }

    // Check if tier actually changed
    if (previousTierRef.current !== currentTier && enabled) {
      // Update previous tier
      previousTierRef.current = currentTier;

      // Show notification
      const message = TIER_CHANGE_MESSAGES[currentTier];
      setNotification(message);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-dismiss after specified time
      timeoutRef.current = setTimeout(() => {
        setNotification(null);
        timeoutRef.current = null;
      }, autoDismissMs);
    } else {
      // Just update the ref if disabled
      previousTierRef.current = currentTier;
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentTier, enabled, autoDismissMs]);

  return { notification, dismiss };
}

export default useTierChangeNotification;
