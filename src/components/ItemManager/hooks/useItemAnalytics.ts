'use client';

/**
 * useItemAnalytics Hook
 *
 * Fetches, caches, and manages analytics data (visits & reactions) for items.
 * Supports single-item and batch fetching with configurable polling.
 *
 * @module ItemManager/hooks/useItemAnalytics
 * @see docs/req-091-usage-statistics-reactions-overview.md
 * @lastModified 2026-01-05 (REQ-091)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ItemVisitStats, ItemReactionSummary } from '../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

export interface ItemAnalyticsData {
  visitStats: ItemVisitStats | null;
  reactions: ItemReactionSummary | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

export interface UseItemAnalyticsOptions {
  /**
   * Array of item public IDs to fetch analytics for.
   * The hook will fetch data for all provided IDs.
   */
  itemIds: string[];

  /**
   * Whether analytics fetching is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Polling interval in milliseconds. Set to 0 to disable polling.
   * @default 60000 (1 minute)
   */
  pollingInterval?: number;

  /**
   * Cache TTL in milliseconds. Cached data older than this will be refetched.
   * @default 30000 (30 seconds)
   */
  cacheTTL?: number;

  /**
   * Authorization token for admin analytics endpoint.
   * Required for fetching visit statistics.
   */
  authToken?: string;

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;
}

export interface UseItemAnalyticsReturn {
  /**
   * Map of item public IDs to their analytics data.
   */
  analyticsMap: Map<string, ItemAnalyticsData>;

  /**
   * Whether any analytics are currently loading.
   */
  isLoading: boolean;

  /**
   * Global error message (if any).
   */
  error: string | null;

  /**
   * Fetch analytics for a single item.
   */
  fetchAnalytics: (publicId: string) => Promise<void>;

  /**
   * Fetch analytics for multiple items.
   */
  fetchBatchAnalytics: (publicIds: string[]) => Promise<void>;

  /**
   * Refresh all analytics data.
   */
  refresh: () => Promise<void>;

  /**
   * Clear cache for a specific item or all items.
   */
  clearCache: (publicId?: string) => void;

  /**
   * Get analytics for a specific item.
   */
  getAnalytics: (publicId: string) => ItemAnalyticsData | undefined;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_POLLING_INTERVAL = 60000; // 1 minute
const DEFAULT_CACHE_TTL = 30000; // 30 seconds

// =============================================================================
// Hook Implementation
// =============================================================================

export function useItemAnalytics(options: UseItemAnalyticsOptions): UseItemAnalyticsReturn {
  const {
    itemIds,
    enabled = true,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    cacheTTL = DEFAULT_CACHE_TTL,
    authToken,
    debug = false,
  } = options;

  // State
  const [analyticsMap, setAnalyticsMap] = useState<Map<string, ItemAnalyticsData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for polling and abort control
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Debug logger
  const log = useCallback((...args: unknown[]) => {
    if (debug) {
      console.log('[useItemAnalytics]', ...args);
    }
  }, [debug]);

  // Check if cache is valid
  const isCacheValid = useCallback((data: ItemAnalyticsData): boolean => {
    if (!data.lastFetched) return false;
    const age = Date.now() - data.lastFetched.getTime();
    return age < cacheTTL;
  }, [cacheTTL]);

  // Fetch reactions for a single item (public endpoint)
  const fetchReactions = useCallback(async (
    publicId: string,
    signal?: AbortSignal
  ): Promise<ItemReactionSummary | null> => {
    try {
      const response = await fetch(`/api/items/${publicId}/reactions`, { signal });
      if (!response.ok) {
        log(`Reactions fetch failed for ${publicId}:`, response.status);
        return null;
      }
      const data = await response.json();
      if (data.success && data.data) {
        return data.data as ItemReactionSummary;
      }
      return null;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        log(`Reactions fetch aborted for ${publicId}`);
        return null;
      }
      log(`Reactions fetch error for ${publicId}:`, err);
      return null;
    }
  }, [log]);

  // Fetch visit stats for a single item (admin endpoint)
  const fetchVisitStats = useCallback(async (
    publicId: string,
    signal?: AbortSignal
  ): Promise<ItemVisitStats | null> => {
    if (!authToken) {
      log(`No auth token provided, skipping visit stats for ${publicId}`);
      return null;
    }

    try {
      const response = await fetch(`/api/admin/items/${publicId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        signal,
      });
      if (!response.ok) {
        log(`Visit stats fetch failed for ${publicId}:`, response.status);
        return null;
      }
      const data = await response.json();
      if (data.success && data.data) {
        return {
          last24Hours: data.data.last24Hours,
          last7Days: data.data.last7Days,
          last30Days: data.data.last30Days,
          last365Days: data.data.last365Days,
          allTime: data.data.allTime,
        } as ItemVisitStats;
      }
      return null;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        log(`Visit stats fetch aborted for ${publicId}`);
        return null;
      }
      log(`Visit stats fetch error for ${publicId}:`, err);
      return null;
    }
  }, [authToken, log]);

  // Fetch analytics for a single item
  const fetchAnalytics = useCallback(async (publicId: string): Promise<void> => {
    if (!mountedRef.current) return;

    // Check cache
    const cached = analyticsMap.get(publicId);
    if (cached && isCacheValid(cached)) {
      log(`Using cached analytics for ${publicId}`);
      return;
    }

    // Set loading state for this item
    setAnalyticsMap(prev => {
      const next = new Map(prev);
      const existing = next.get(publicId);
      next.set(publicId, {
        visitStats: existing?.visitStats || null,
        reactions: existing?.reactions || null,
        loading: true,
        error: null,
        lastFetched: existing?.lastFetched || null,
      });
      return next;
    });

    // Create abort controller
    const controller = new AbortController();

    try {
      // Fetch both in parallel
      const [reactions, visitStats] = await Promise.all([
        fetchReactions(publicId, controller.signal),
        fetchVisitStats(publicId, controller.signal),
      ]);

      if (!mountedRef.current) return;

      setAnalyticsMap(prev => {
        const next = new Map(prev);
        next.set(publicId, {
          visitStats,
          reactions,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
        return next;
      });

      log(`Fetched analytics for ${publicId}:`, { visitStats, reactions });
    } catch (err) {
      if (!mountedRef.current) return;
      const errorMsg = (err as Error).message || 'Failed to fetch analytics';
      setAnalyticsMap(prev => {
        const next = new Map(prev);
        const existing = next.get(publicId);
        next.set(publicId, {
          visitStats: existing?.visitStats || null,
          reactions: existing?.reactions || null,
          loading: false,
          error: errorMsg,
          lastFetched: existing?.lastFetched || null,
        });
        return next;
      });
    }
  }, [analyticsMap, isCacheValid, fetchReactions, fetchVisitStats, log]);

  // Fetch analytics for multiple items
  const fetchBatchAnalytics = useCallback(async (publicIds: string[]): Promise<void> => {
    if (!mountedRef.current || publicIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    // Abort previous batch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Fetch all items in parallel (with concurrency limit)
      const CONCURRENCY_LIMIT = 5;
      for (let i = 0; i < publicIds.length; i += CONCURRENCY_LIMIT) {
        const batch = publicIds.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(batch.map(id => fetchAnalytics(id)));
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError((err as Error).message || 'Failed to fetch analytics');
        setIsLoading(false);
      }
    }
  }, [fetchAnalytics]);

  // Refresh all analytics
  const refresh = useCallback(async (): Promise<void> => {
    // Clear cache and refetch
    setAnalyticsMap(new Map());
    await fetchBatchAnalytics(itemIds);
  }, [itemIds, fetchBatchAnalytics]);

  // Clear cache
  const clearCache = useCallback((publicId?: string): void => {
    if (publicId) {
      setAnalyticsMap(prev => {
        const next = new Map(prev);
        next.delete(publicId);
        return next;
      });
    } else {
      setAnalyticsMap(new Map());
    }
  }, []);

  // Get analytics for a specific item
  const getAnalytics = useCallback((publicId: string): ItemAnalyticsData | undefined => {
    return analyticsMap.get(publicId);
  }, [analyticsMap]);

  // Initial fetch when itemIds change
  useEffect(() => {
    if (!enabled || itemIds.length === 0) return;

    log('Initial fetch for items:', itemIds);
    fetchBatchAnalytics(itemIds);
  }, [enabled, itemIds.join(','), fetchBatchAnalytics, log]);

  // Set up polling
  useEffect(() => {
    if (!enabled || pollingInterval === 0 || itemIds.length === 0) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    log(`Setting up polling with interval: ${pollingInterval}ms`);
    pollingRef.current = setInterval(() => {
      log('Polling refresh');
      refresh();
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [enabled, pollingInterval, itemIds.length, refresh, log]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    analyticsMap,
    isLoading,
    error,
    fetchAnalytics,
    fetchBatchAnalytics,
    refresh,
    clearCache,
    getAnalytics,
  };
}

export default useItemAnalytics;
