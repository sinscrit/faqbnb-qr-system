// src/hooks/useDashboardStats.ts
// REQ-123: Dashboard Statistics State Management Hook
// Created: 2026-01-06 15:45:00 UTC
// Last Modified: 2026-01-06 15:45:00 UTC

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiRequest, ApiError } from '@/lib/api';

/**
 * REQ-134: Property context for statistics filtering
 */
export interface PropertyContext {
  isFiltered: boolean;
  propertyId: string | null;
  propertyName: string | null;
  totalProperties: number;
}

/**
 * Dashboard statistics data shape from API
 * REQ-134: Updated to include property context for filtering
 */
export interface DashboardStats {
  itemCount: number;
  roomCount: number;
  tagCount: number;
  propertyContext: PropertyContext;
}

/**
 * API response wrapper
 */
interface DashboardStatsResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

/**
 * Hook state interface
 */
interface UseDashboardStatsState {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Hook return interface
 */
export interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing dashboard statistics
 * REQ-134: Added optional propertyId parameter for filtering
 *
 * Features:
 * - Auto-fetches on mount
 * - Separate loading states for initial fetch vs refresh
 * - Manual refresh capability with duplicate call prevention
 * - User-friendly error messages
 * - Optional property filtering
 *
 * @param propertyId - Optional property ID to filter statistics
 * @returns UseDashboardStatsReturn object with stats data and actions
 */
export function useDashboardStats(propertyId?: string): UseDashboardStatsReturn {
  const DEBUG_PREFIX = '📊 DASHBOARD_STATS_HOOK:';

  const [state, setState] = useState<UseDashboardStatsState>({
    stats: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null
  });

  /**
   * Fetch statistics from API
   * @param isRefresh - If true, sets isRefreshing instead of isLoading
   */
  const fetchStats = useCallback(async (isRefresh: boolean = false) => {
    console.log(`${DEBUG_PREFIX} fetchStats called`, { isRefresh });

    setState(prev => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null
    }));

    try {
      // REQ-134: Include propertyId in API request when provided
      const endpoint = propertyId
        ? `/user/dashboard/stats?propertyId=${encodeURIComponent(propertyId)}`
        : '/user/dashboard/stats';

      const response = await apiRequest<DashboardStatsResponse>(
        endpoint,
        {},
        true
      );

      if (response.success && response.data) {
        console.log(`${DEBUG_PREFIX} fetchStats success`, response.data);
        setState(prev => ({
          ...prev,
          stats: response.data!,
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastUpdated: Date.now()
        }));
      } else {
        throw new Error(response.error || 'Failed to load statistics');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'An unexpected error occurred';

      console.error(`${DEBUG_PREFIX} fetchStats error`, { error, errorMessage });

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage
      }));
    }
  }, [propertyId]); // REQ-134: Add propertyId dependency

  /**
   * Manually refresh statistics
   * Prevents duplicate calls when already refreshing
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (state.isRefreshing) {
      console.log(`${DEBUG_PREFIX} refresh skipped - already refreshing`);
      return;
    }

    console.log(`${DEBUG_PREFIX} refresh triggered`);
    await fetchStats(true);
  }, [state.isRefreshing, fetchStats]);

  // REQ-134: Auto-fetch on mount or when propertyId changes
  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Auto-fetch on mount or propertyId change`, { propertyId });
    fetchStats(false);
  }, [fetchStats, propertyId]);

  return {
    stats: state.stats,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    lastUpdated: state.lastUpdated ? new Date(state.lastUpdated) : null,
    refresh
  };
}
