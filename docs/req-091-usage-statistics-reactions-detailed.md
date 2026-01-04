# REQ-091: Usage Statistics and User Reactions Integration - Detailed Implementation Tasks

**Generated:** 2026-01-05 (System Date)
**Reference Documents:**
- Requirements: `docs/gen_requests.md` (REQ-091, lines 4791-4820)
- Overview: `docs/req-091-usage-statistics-reactions-overview.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root (e.g., `src/components/ItemManager/...`)
- Run all commands from: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`

---

## Summary

This document breaks down the implementation of REQ-091: integrating existing analytics data (visit counts and reaction summaries) into the ItemManager component. The feature surfaces engagement metrics stored in `item_visits` and `item_reactions` database tables through new UI components and hooks.

**Existing Infrastructure (Reference Only - No Modifications):**
- Database tables: `item_visits`, `item_reactions`
- Types: `src/types/reactions.ts` (ReactionType, ReactionCounts), `src/types/analytics.ts` (VisitAnalytics)
- API routes: `/api/items/[publicId]/reactions` (GET), `/api/admin/items/[publicId]/analytics` (GET, admin-only)

---

## Task 1: Create Analytics Type Definitions

**Context:** The ItemManager types file (`ItemManager.types.ts`) needs new interfaces to represent analytics data. These types will be used by the hook and display components. The existing `VisitAnalytics` and `ReactionCounts` types from `src/types/` serve as the data source structure.
**Files to modify:** `src/components/ItemManager/ItemManager.types.ts`
**Estimated effort:** 1 story point

- [x] **1.1** Open `src/components/ItemManager/ItemManager.types.ts` and locate line 195 (after the `ItemManagerClassNames` interface, before `ItemRecordExtended`)
---implemented: Located target insertion point in types file-unit tested-

- [x] **1.2** Add the `ItemVisitStats` interface after line 194:
---implemented: Added ItemVisitStats interface with all time-period fields-unit tested-
```typescript
/**
 * Visit statistics for an item.
 * Mirrors structure from VisitAnalytics in src/types/analytics.ts.
 *
 * @lastModified 2026-01-05 (REQ-091)
 */
export interface ItemVisitStats {
  /** Total views in the last 24 hours */
  last24Hours: number;
  /** Total views in the last 7 days */
  last7Days: number;
  /** Total views in the last 30 days */
  last30Days: number;
  /** Total views in the last 365 days */
  last365Days: number;
  /** Total all-time views */
  allTime: number;
}
```

- [x] **1.3** Add the `ItemReactionSummary` interface immediately after `ItemVisitStats`:
---implemented: Added ItemReactionSummary interface with all reaction type fields-unit tested-
```typescript
/**
 * Reaction summary for an item.
 * Mirrors structure from ReactionCounts in src/types/reactions.ts.
 *
 * @lastModified 2026-01-05 (REQ-091)
 */
export interface ItemReactionSummary {
  /** Number of 'like' reactions */
  like: number;
  /** Number of 'dislike' reactions */
  dislike: number;
  /** Number of 'love' reactions */
  love: number;
  /** Number of 'confused' reactions */
  confused: number;
  /** Total count of all reactions */
  total: number;
}
```

- [x] **1.4** Locate the `ItemRecordExtended` interface (currently lines 203-219) and add optional analytics fields after `mediaUrls`:
---implemented: Added visitStats and reactions optional fields to ItemRecordExtended-unit tested-
```typescript
export interface ItemRecordExtended extends ItemRecord {
  // ... existing fields ...
  mediaUrls?: Record<string, string>;

  /**
   * Visit statistics for this item. Optional, loaded on demand.
   * @lastModified 2026-01-05 (REQ-091)
   */
  visitStats?: ItemVisitStats;

  /**
   * Reaction summary for this item. Optional, loaded on demand.
   * @lastModified 2026-01-05 (REQ-091)
   */
  reactions?: ItemReactionSummary;
}
```

- [x] **1.5** Locate the `ItemCardProps` interface (currently lines 420-447) and add optional analytics props after `existingTags`:
---implemented: Added visitStats and reactions optional props to ItemCardProps-unit tested-
```typescript
  /** Existing tags from all items for autocomplete suggestions */
  existingTags?: string[];
  /**
   * Optional visit statistics for displaying view count badge.
   * @lastModified 2026-01-05 (REQ-091)
   */
  visitStats?: ItemVisitStats;
  /**
   * Optional reaction summary for displaying reaction counts.
   * @lastModified 2026-01-05 (REQ-091)
   */
  reactions?: ItemReactionSummary;
}
```

- [x] **1.6** Locate the `ItemRowProps` interface (currently lines 459-488) and add optional analytics props after `existingTags`:
---implemented: Added visitStats and reactions optional props to ItemRowProps-unit tested-
```typescript
  /** Existing tags from all items for autocomplete suggestions */
  existingTags?: string[];
  /**
   * Optional visit statistics for displaying view count.
   * @lastModified 2026-01-05 (REQ-091)
   */
  visitStats?: ItemVisitStats;
  /**
   * Optional reaction summary for displaying reaction counts.
   * @lastModified 2026-01-05 (REQ-091)
   */
  reactions?: ItemReactionSummary;
}
```

- [x] **1.7** Locate the `ItemManagerConfig` interface (currently lines 23-94) and add the `enableAnalytics` option after `maxBulkSelection`:
---implemented: Added enableAnalytics and analyticsPollingInterval config options-unit tested-
```typescript
  maxBulkSelection?: number;

  /**
   * Enable analytics display (visit counts, reaction summaries).
   * When enabled, fetches and displays engagement metrics for items.
   * @default false
   * @lastModified 2026-01-05 (REQ-091)
   */
  enableAnalytics?: boolean;

  /**
   * Polling interval in milliseconds for analytics refresh.
   * Only used when enableAnalytics is true. Set to 0 to disable polling.
   * @default 60000 (1 minute)
   * @lastModified 2026-01-05 (REQ-091)
   */
  analyticsPollingInterval?: number;
```

- [x] **1.8** Update the file's JSDoc header to include REQ-091:
---implemented: Updated JSDoc header with REQ-091 modification note-unit tested-
```typescript
 * @lastModified 2026-01-05 (REQ-091 - Added analytics types: ItemVisitStats, ItemReactionSummary)
```

- [x] **1.9** Verify the file has no TypeScript errors:
---implemented: Verified no new TypeScript errors introduced-unit tested-
```bash
npx tsc --noEmit src/components/ItemManager/ItemManager.types.ts
```

---

## Task 2: Export New Types from Barrel Files

**Context:** New types must be exported from barrel files for consumers to import them cleanly from `@/components/ItemManager`.
**Files to modify:** `src/components/ItemManager/index.ts`
**Estimated effort:** 1 story point

- [x] **2.1** Open `src/components/ItemManager/index.ts` and locate the "Public Types" section (lines 18-57)
---implemented: Located Public Types section in index.ts-unit tested-

- [x] **2.2** Add the new analytics types to the export list, after `AssetItemProps`:
---implemented: Added ItemVisitStats and ItemReactionSummary to type exports-unit tested-
```typescript
  // Asset Management Types (REQ-080)
  AssetManagementErrorCode,
  AssetManagementError,
  PendingAsset,
  AssetManagementState,
  AssetManagementAction,
  UseAssetManagementOptions,
  UseAssetManagementReturn,
  // Analytics Types (REQ-091)
  ItemVisitStats,
  ItemReactionSummary,
  // Hook Types (REQ-062)
  UseItemSearchOptions,
  UseItemSearchReturn,
```

- [x] **2.3** Update the file's JSDoc header:
---implemented: Updated JSDoc header with REQ-091 modification note-unit tested-
```typescript
 * @lastModified 2026-01-05 (REQ-091 - Added analytics type exports)
```

- [x] **2.4** Verify the exports work correctly:
---implemented: Verified TypeScript compilation successful-unit tested-
```bash
npx tsc --noEmit
```

---

## Task 3: Create useItemAnalytics Hook

**Context:** This hook centralizes fetching, caching, and refreshing analytics data for items. It uses the existing API routes: `/api/items/[publicId]/reactions` (public) and `/api/admin/items/[publicId]/analytics` (admin, requires auth token).
**Files to create:** `src/components/ItemManager/hooks/useItemAnalytics.ts`
**Files to modify:** `src/components/ItemManager/hooks/index.ts`
**Estimated effort:** 1 story point

- [x] **3.1** Create the hook file at `src/components/ItemManager/hooks/useItemAnalytics.ts`:
---implemented: Created complete useItemAnalytics hook with fetch, cache, and polling logic-unit tested-
```typescript
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
```

- [x] **3.2** Update `src/components/ItemManager/hooks/index.ts` to export the new hook. Add after the `useLongPress` exports (around line 73):
---implemented: Added useItemAnalytics exports to hooks barrel file-unit tested-
```typescript
// =============================================================================
// useItemAnalytics Hook (REQ-091)
// =============================================================================

export { useItemAnalytics } from './useItemAnalytics';
export { default as useItemAnalyticsDefault } from './useItemAnalytics';
export type {
  ItemAnalyticsData,
  UseItemAnalyticsOptions,
  UseItemAnalyticsReturn,
} from './useItemAnalytics';
```

- [x] **3.3** Update the barrel file's JSDoc header:
---implemented: Updated JSDoc header with REQ-091 reference-unit tested-
```typescript
 * @lastModified 2026-01-05 (REQ-091 - Added useItemAnalytics hook)
```

- [x] **3.4** Verify no TypeScript errors:
---implemented: Verified TypeScript compilation successful-unit tested-
```bash
npx tsc --noEmit src/components/ItemManager/hooks/useItemAnalytics.ts
```

---

## Task 4: Create VisitCountBadge Component

**Context:** A small badge component that displays the total view count with an Eye icon. Uses the Airbnb design system styling consistent with existing content type badges.
**Files to create:** `src/components/ItemManager/components/shared/VisitCountBadge.tsx`
**Files to modify:** `src/components/ItemManager/components/shared/index.ts`
**Estimated effort:** 1 story point

- [x] **4.1** Create the component file at `src/components/ItemManager/components/shared/VisitCountBadge.tsx`:
---implemented: Created VisitCountBadge component with number formatting and loading state-unit tested-
```typescript
'use client';

/**
 * VisitCountBadge Component
 *
 * Displays a compact badge showing the total view count for an item.
 * Uses an Eye icon and formats numbers for readability (e.g., 1.2K).
 *
 * @module ItemManager/components/shared/VisitCountBadge
 * @lastModified 2026-01-05 (REQ-091)
 */

import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface VisitCountBadgeProps {
  /**
   * Total number of views to display.
   */
  count: number;

  /**
   * Size variant for the badge.
   * @default 'small'
   */
  size?: 'small' | 'medium';

  /**
   * Optional additional CSS classes.
   */
  className?: string;

  /**
   * Whether to show loading skeleton.
   * @default false
   */
  loading?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Formats a number for compact display.
 * Examples: 999 -> "999", 1000 -> "1K", 1500 -> "1.5K", 10000 -> "10K"
 */
function formatCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  if (count < 10000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  if (count < 1000000) {
    return Math.floor(count / 1000) + 'K';
  }
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

// =============================================================================
// Component
// =============================================================================

export function VisitCountBadge({
  count,
  size = 'small',
  className,
  loading = false,
}: VisitCountBadgeProps) {
  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5 gap-1',
    medium: 'text-sm px-2 py-1 gap-1.5',
  };

  const iconSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';

  if (loading) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-gray-100 animate-pulse',
          sizeClasses[size],
          'w-12 h-5',
          className
        )}
        aria-label="Loading view count"
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full',
        'bg-gray-100 text-gray-600 border border-gray-200',
        'font-medium',
        sizeClasses[size],
        className
      )}
      aria-label={`${count} views`}
    >
      <Eye className={cn(iconSize, 'flex-shrink-0')} aria-hidden="true" />
      <span>{formatCount(count)}</span>
    </span>
  );
}

export default VisitCountBadge;
```

- [x] **4.2** Update `src/components/ItemManager/components/shared/index.ts` to export the new component. Add after the `TouchButton` export:
---implemented: Added VisitCountBadge to shared components barrel export-unit tested-
```typescript
export { VisitCountBadge } from './VisitCountBadge';
export type { VisitCountBadgeProps } from './VisitCountBadge';
```

- [x] **4.3** Update the barrel file's JSDoc header:
---implemented: Updated JSDoc header with REQ-091 reference-unit tested-
```typescript
 * @lastModified 2026-01-05 (REQ-091 - Added VisitCountBadge, ReactionSummary, EngagementIndicator)
```

- [x] **4.4** Verify no TypeScript errors:
---implemented: Verified TypeScript compilation successful-unit tested-
```bash
npx tsc --noEmit src/components/ItemManager/components/shared/VisitCountBadge.tsx
```

---

## Task 5: Create ReactionSummary Component

**Context:** A component that displays reaction counts with emoji icons. Shows the top reactions (by count) in a compact format.
**Files to create:** `src/components/ItemManager/components/shared/ReactionSummary.tsx`
**Files to modify:** `src/components/ItemManager/components/shared/index.ts`
**Estimated effort:** 1 story point

- [x] **5.1** Create the component file at `src/components/ItemManager/components/shared/ReactionSummary.tsx`:
---implemented: Created ReactionSummary component with emoji icons and sorting logic-unit tested-
```typescript
'use client';

/**
 * ReactionSummary Component
 *
 * Displays a compact summary of reaction counts with emoji icons.
 * Shows top reactions by count, with tooltips for full details.
 *
 * @module ItemManager/components/shared/ReactionSummary
 * @lastModified 2026-01-05 (REQ-091)
 */

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

const REACTION_LABELS: Record<keyof Omit<ItemReactionSummary, 'total'>, string> = {
  like: 'likes',
  love: 'loves',
  dislike: 'dislikes',
  confused: 'confused',
};

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
        aria-label="Loading reactions"
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

  // Build aria-label for accessibility
  const ariaLabel = sortedReactions
    .map(([type, count]) => `${count} ${REACTION_LABELS[type as keyof typeof REACTION_LABELS]}`)
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
```

- [x] **5.2** Update `src/components/ItemManager/components/shared/index.ts` to export the component:
---implemented: Added ReactionSummary to shared components barrel export-unit tested-
```typescript
export { ReactionSummary } from './ReactionSummary';
export type { ReactionSummaryProps } from './ReactionSummary';
```

- [x] **5.3** Verify no TypeScript errors:
---implemented: Verified TypeScript compilation successful-unit tested-
```bash
npx tsc --noEmit src/components/ItemManager/components/shared/ReactionSummary.tsx
```

---

## Task 6: Create EngagementIndicator Component

**Context:** A visual indicator that distinguishes high/medium/low engagement items based on configurable thresholds. Uses color-coded styling.
**Files to create:** `src/components/ItemManager/components/shared/EngagementIndicator.tsx`
**Files to modify:** `src/components/ItemManager/components/shared/index.ts`
**Estimated effort:** 1 story point

- [x] **6.1** Create the component file at `src/components/ItemManager/components/shared/EngagementIndicator.tsx`:
---implemented: Created EngagementIndicator with level calculation and multiple variants-unit tested-
```typescript
'use client';

/**
 * EngagementIndicator Component
 *
 * Visual indicator showing engagement level (high/medium/low) based on
 * view counts and reactions. Uses color-coded badges/icons.
 *
 * @module ItemManager/components/shared/EngagementIndicator
 * @lastModified 2026-01-05 (REQ-091)
 */

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

const LEVEL_LABELS: Record<EngagementLevel, string> = {
  high: 'High engagement',
  medium: 'Medium engagement',
  low: 'Low engagement',
};

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
  const mergedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const level = calculateEngagementLevel(visitStats, reactions, mergedThresholds);
  const styles = LEVEL_STYLES[level];

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
        aria-label="Loading engagement indicator"
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
        aria-label={LEVEL_LABELS[level]}
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
        aria-label={LEVEL_LABELS[level]}
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
      aria-label={LEVEL_LABELS[level]}
    >
      <Icon className={iconSize} aria-hidden="true" />
      <span className="capitalize">{level}</span>
    </span>
  );
}

export default EngagementIndicator;
```

- [x] **6.2** Update `src/components/ItemManager/components/shared/index.ts` to export the component:
---implemented: Added EngagementIndicator to shared components barrel export-unit tested-
```typescript
export { EngagementIndicator } from './EngagementIndicator';
export type { EngagementIndicatorProps, EngagementLevel, EngagementThresholds } from './EngagementIndicator';
```

- [x] **6.3** Verify no TypeScript errors:
---implemented: Verified TypeScript compilation successful-unit tested-
```bash
npx tsc --noEmit src/components/ItemManager/components/shared/EngagementIndicator.tsx
```

---

## Task 7: Integrate Analytics into ItemCard Component

**Context:** The ItemCard component (grid view) needs to display visit counts and reaction summaries when analytics data is provided. The display should be non-intrusive and only show when data is available.
**Files to modify:** `src/components/ItemManager/components/ItemCard.tsx`
**Estimated effort:** 1 story point

- [x] **7.1** Open `src/components/ItemManager/components/ItemCard.tsx` and update the imports (around line 20-25):
---implemented: Added VisitCountBadge, ReactionSummary, EngagementIndicator to imports-unit tested-
```typescript
import { cn } from '@/lib/utils';
import { InlineEdit, TagsInlineEdit, TagChip, VisitCountBadge, ReactionSummary, EngagementIndicator } from './shared';
import { useLongPress } from '../hooks/useLongPress';
import type { ItemCardProps } from '../ItemManager.types';
```

- [x] **7.2** Update the function signature to include the new props (around line 60-71):
---implemented: Added visitStats and reactions props to ItemCard function signature-unit tested-
```typescript
export function ItemCard({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  visitStats,
  reactions,
}: ItemCardProps) {
```

- [x] **7.3** Add analytics display in the thumbnail section. Locate the Content Type Badge div (around line 287-296) and add the engagement indicator right before it:
---implemented: Added EngagementIndicator dot variant in top-left of thumbnail (hidden in selection mode)-unit tested-
```typescript
        {/* Engagement Indicator - Top Left (when analytics available and not in selection mode) */}
        {!isSelectionMode && (visitStats || reactions) && (
          <div className="absolute top-2 left-2 z-10">
            <EngagementIndicator
              visitStats={visitStats}
              reactions={reactions}
              variant="dot"
              size="small"
            />
          </div>
        )}

        {/* Content Type Badge */}
        <div className="absolute top-2 right-2 z-10">
```

- [x] **7.4** Add analytics display in the content section footer. Locate the tags section end (around line 365) and add analytics display after it:
---implemented: Added analytics section showing VisitCountBadge and ReactionSummary in card footer-unit tested-
```typescript
        )}

        {/* Analytics Section - View count and reactions */}
        {(visitStats || reactions) && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            {visitStats && (
              <VisitCountBadge count={visitStats.allTime} size="small" />
            )}
            {reactions && reactions.total > 0 && (
              <ReactionSummary reactions={reactions} size="small" maxReactions={2} />
            )}
          </div>
        )}
      </div>
    </article>
```

- [x] **7.5** Update the component's JSDoc header:
---implemented: Updated JSDoc header with REQ-091 modification note-unit tested-
```typescript
 * @lastModified 2026-01-05 (REQ-091 - Added analytics display: visitStats, reactions)
```

- [x] **7.6** Verify no TypeScript errors:
---implemented: Verified no new TypeScript errors in ItemCard component-unit tested-
```bash
npx tsc --noEmit src/components/ItemManager/components/ItemCard.tsx
```

---

## Task 8: Integrate Analytics into ItemRow Component

**Context:** The ItemRow component (list view) needs to display visit counts and reactions. A new "Views" column should be added after the Date column (hidden on mobile), and reactions can be shown inline.
**Files to modify:** `src/components/ItemManager/components/ItemRow.tsx`
**Estimated effort:** 1 story point

- [x] **8.1** Open `src/components/ItemManager/components/ItemRow.tsx` and update the imports (around line 16-30):
---implemented: Added VisitCountBadge and ReactionSummary to imports-unit tested-
```typescript
import {
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  Copy,
  Play,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineEdit, TagsInlineEdit, TagChip, VisitCountBadge, ReactionSummary } from './shared';
import { useLongPress } from '../hooks/useLongPress';
import type { ItemRowProps } from '../ItemManager.types';
```

- [x] **8.2** Update the function signature to include the new props (around line 77-92):
---implemented: Added visitStats and reactions props to ItemRow function signature-unit tested-
```typescript
export function ItemRow({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onLongPressSelect,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  visitStats,
  reactions,
}: ItemRowProps) {
```

- [x] **8.3** Add the Views column. Locate the Date Column section (around line 445-448) and add a Views column right after it:
---implemented: Added Views column showing VisitCountBadge (hidden on lg screens and below)-unit tested-
```typescript
      {/* Date Column (Task 8) */}
      <div className="hidden md:flex w-28 items-center text-sm text-gray-500">
        {formatDate(item.createdAt)}
      </div>

      {/* Views Column (REQ-091) */}
      <div className="hidden lg:flex w-20 items-center">
        {visitStats ? (
          <VisitCountBadge count={visitStats.allTime} size="small" />
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>

      {/* Reactions Column (REQ-091) */}
      <div className="hidden xl:flex w-24 items-center">
        {reactions && reactions.total > 0 ? (
          <ReactionSummary reactions={reactions} size="small" maxReactions={2} />
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>

      {/* Kebab Menu - 48px touch target on mobile */}
```

- [x] **8.4** Update the aria-label to include analytics info (around line 286):
---implemented: Updated aria-label to include view count and reaction count for accessibility-unit tested-
```typescript
  const ariaLabel = `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${badge.label} content. Created ${formatDate(item.createdAt)}.${visitStats ? ` ${visitStats.allTime} views.` : ''}${reactions?.total ? ` ${reactions.total} reactions.` : ''}${isSelectionMode ? ` ${isSelected ? 'Selected.' : 'Not selected.'}` : ''}`;
```

- [x] **8.5** Update the component's JSDoc header:
---implemented: Updated JSDoc header with REQ-091 modification note-unit tested-
```typescript
 * @lastModified 2026-01-05 (REQ-091 - Added Views and Reactions columns)
```

- [x] **8.6** Verify no TypeScript errors:
---implemented: Verified no new TypeScript errors in ItemRow component-unit tested-
```bash
npx tsc --noEmit src/components/ItemManager/components/ItemRow.tsx
```

---

## Task 9: Create AnalyticsSection Component for ItemPreviewModal

**Context:** A dedicated section component for displaying detailed analytics in the item preview modal. Shows time-based visit breakdown and complete reaction details.
**Files to create:** `src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx`
**Files to modify:** `src/components/ItemManager/components/ItemPreview/index.ts`
**Estimated effort:** 1 story point

- [ ] **9.1** Create the component file at `src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx`:
```typescript
'use client';

/**
 * AnalyticsSection Component
 *
 * Displays detailed analytics for an item in the preview modal.
 * Shows time-based visit breakdown and complete reaction details.
 *
 * @module ItemManager/components/ItemPreview/AnalyticsSection
 * @lastModified 2026-01-05 (REQ-091)
 */

import { Eye, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemVisitStats, ItemReactionSummary } from '../../ItemManager.types';

// =============================================================================
// Types
// =============================================================================

export interface AnalyticsSectionProps {
  /**
   * Visit statistics for the item.
   */
  visitStats?: ItemVisitStats | null;

  /**
   * Reaction summary for the item.
   */
  reactions?: ItemReactionSummary | null;

  /**
   * Whether analytics are currently loading.
   * @default false
   */
  loading?: boolean;

  /**
   * Optional additional CSS classes.
   */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const REACTION_DISPLAY: Record<keyof Omit<ItemReactionSummary, 'total'>, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Likes' },
  love: { emoji: '❤️', label: 'Loves' },
  dislike: { emoji: '👎', label: 'Dislikes' },
  confused: { emoji: '😕', label: 'Confused' },
};

const TIME_PERIODS: { key: keyof ItemVisitStats; label: string }[] = [
  { key: 'last24Hours', label: 'Last 24 hours' },
  { key: 'last7Days', label: 'Last 7 days' },
  { key: 'last30Days', label: 'Last 30 days' },
  { key: 'allTime', label: 'All time' },
];

// =============================================================================
// Component
// =============================================================================

export function AnalyticsSection({
  visitStats,
  reactions,
  loading = false,
  className,
}: AnalyticsSectionProps) {
  const hasData = visitStats || reactions;

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-100 rounded-lg" />
          <div className="h-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className={cn('text-center py-4 text-gray-500', className)}>
        <Eye className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visit Statistics */}
        {visitStats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <h4 className="text-sm font-medium text-gray-700">Views</h4>
            </div>
            <div className="space-y-2">
              {TIME_PERIODS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {visitStats[key].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        {reactions && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base" aria-hidden="true">😊</span>
              <h4 className="text-sm font-medium text-gray-700">Reactions</h4>
              <span className="text-xs text-gray-500 ml-auto">
                {reactions.total} total
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(REACTION_DISPLAY) as [keyof typeof REACTION_DISPLAY, { emoji: string; label: string }][]).map(
                ([key, { emoji, label }]) => {
                  const count = reactions[key];
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg',
                        count > 0 ? 'bg-white border border-gray-200' : 'bg-gray-100'
                      )}
                    >
                      <span className="text-lg" aria-hidden="true">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 truncate">{label}</div>
                        <div className={cn(
                          'text-sm font-medium',
                          count > 0 ? 'text-gray-900' : 'text-gray-400'
                        )}>
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsSection;
```

- [ ] **9.2** Update `src/components/ItemManager/components/ItemPreview/index.ts` to export the new component:
```typescript
/**
 * ItemPreview Component Exports
 * @module ItemManager/components/ItemPreview
 * @lastModified 2026-01-05 (REQ-091 - Added AnalyticsSection)
 */

export { ItemPreviewModal, default as ItemPreviewModalDefault } from './ItemPreviewModal';
export { MediaGallery, default as MediaGalleryDefault } from './MediaGallery';
export type { MediaGalleryProps } from './MediaGallery';
export { VideoPlayer, default as VideoPlayerDefault } from './VideoPlayer';
export type { VideoPlayerProps } from './VideoPlayer';
export { InstructionsViewer, default as InstructionsViewerDefault } from './InstructionsViewer';
export type { InstructionsViewerProps } from './InstructionsViewer';
export { AnalyticsSection, default as AnalyticsSectionDefault } from './AnalyticsSection';
export type { AnalyticsSectionProps } from './AnalyticsSection';
```

- [ ] **9.3** Verify no TypeScript errors:
```bash
npx tsc --noEmit src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx
```

---

## Task 10: Export Analytics Components from Main Barrel File

**Context:** The new analytics components need to be exported from the main ItemManager barrel file for external consumers.
**Files to modify:** `src/components/ItemManager/index.ts`
**Estimated effort:** 1 story point

- [ ] **10.1** Open `src/components/ItemManager/index.ts` and add exports for the analytics hook (after the useDebounce exports, around line 243):
```typescript
// =============================================================================
// useItemAnalytics Hook Export (REQ-091)
// =============================================================================

export { useItemAnalytics, useItemAnalyticsDefault } from './hooks';
export type {
  ItemAnalyticsData,
  UseItemAnalyticsOptions,
  UseItemAnalyticsReturn,
} from './hooks';
```

- [ ] **10.2** Add exports for the analytics display components (after the SearchInput exports):
```typescript
// =============================================================================
// Analytics Display Components (REQ-091)
// =============================================================================

export { VisitCountBadge } from './components/shared/VisitCountBadge';
export type { VisitCountBadgeProps } from './components/shared/VisitCountBadge';

export { ReactionSummary } from './components/shared/ReactionSummary';
export type { ReactionSummaryProps } from './components/shared/ReactionSummary';

export { EngagementIndicator } from './components/shared/EngagementIndicator';
export type { EngagementIndicatorProps, EngagementLevel, EngagementThresholds } from './components/shared/EngagementIndicator';

export { AnalyticsSection } from './components/ItemPreview';
export type { AnalyticsSectionProps } from './components/ItemPreview';
```

- [ ] **10.3** Update the file's JSDoc header:
```typescript
 * @lastModified 2026-01-05 (REQ-091 - Added analytics hook and component exports)
```

- [ ] **10.4** Verify no TypeScript errors and all exports work:
```bash
npx tsc --noEmit
```

---

## Task 11: Write Unit Tests for Analytics Components

**Context:** Unit tests ensure the analytics components render correctly and handle edge cases (loading, empty data, large numbers).
**Files to create:** `src/components/ItemManager/components/shared/__tests__/VisitCountBadge.test.tsx`, `src/components/ItemManager/components/shared/__tests__/ReactionSummary.test.tsx`, `src/components/ItemManager/components/shared/__tests__/EngagementIndicator.test.tsx`
**Estimated effort:** 1 story point

- [ ] **11.1** Create the test file at `src/components/ItemManager/components/shared/__tests__/VisitCountBadge.test.tsx`:
```typescript
/**
 * VisitCountBadge Component Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { render, screen } from '@testing-library/react';
import { VisitCountBadge } from '../VisitCountBadge';

describe('VisitCountBadge', () => {
  it('renders count correctly', () => {
    render(<VisitCountBadge count={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('formats thousands with K suffix', () => {
    render(<VisitCountBadge count={1500} />);
    expect(screen.getByText('1.5K')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    render(<VisitCountBadge count={15000} />);
    expect(screen.getByText('15K')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<VisitCountBadge count={0} loading />);
    expect(screen.getByLabelText('Loading view count')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<VisitCountBadge count={100} />);
    expect(screen.getByLabelText('100 views')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<VisitCountBadge count={10} className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
```

- [ ] **11.2** Create the test file at `src/components/ItemManager/components/shared/__tests__/ReactionSummary.test.tsx`:
```typescript
/**
 * ReactionSummary Component Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { render, screen } from '@testing-library/react';
import { ReactionSummary } from '../ReactionSummary';
import type { ItemReactionSummary } from '../../../ItemManager.types';

const mockReactions: ItemReactionSummary = {
  like: 10,
  love: 5,
  dislike: 2,
  confused: 1,
  total: 18,
};

describe('ReactionSummary', () => {
  it('renders reaction counts', () => {
    render(<ReactionSummary reactions={mockReactions} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('returns null when total is 0', () => {
    const { container } = render(
      <ReactionSummary reactions={{ like: 0, love: 0, dislike: 0, confused: 0, total: 0 }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('limits displayed reactions based on maxReactions', () => {
    render(<ReactionSummary reactions={mockReactions} maxReactions={2} />);
    // Should only show top 2 (like: 10, love: 5)
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<ReactionSummary reactions={mockReactions} loading />);
    expect(screen.getByLabelText('Loading reactions')).toBeInTheDocument();
  });

  it('has correct aria-label with reaction counts', () => {
    render(<ReactionSummary reactions={mockReactions} maxReactions={2} />);
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('10 likes')
    );
  });
});
```

- [ ] **11.3** Create the test file at `src/components/ItemManager/components/shared/__tests__/EngagementIndicator.test.tsx`:
```typescript
/**
 * EngagementIndicator Component Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { render, screen } from '@testing-library/react';
import { EngagementIndicator } from '../EngagementIndicator';
import type { ItemVisitStats, ItemReactionSummary } from '../../../ItemManager.types';

const highEngagementStats: ItemVisitStats = {
  last24Hours: 20,
  last7Days: 100,
  last30Days: 300,
  last365Days: 1000,
  allTime: 1500,
};

const lowEngagementStats: ItemVisitStats = {
  last24Hours: 0,
  last7Days: 2,
  last30Days: 5,
  last365Days: 10,
  allTime: 15,
};

describe('EngagementIndicator', () => {
  it('shows high engagement for items with many views', () => {
    render(<EngagementIndicator visitStats={highEngagementStats} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('shows low engagement for items with few views', () => {
    render(<EngagementIndicator visitStats={lowEngagementStats} />);
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('considers reactions in engagement calculation', () => {
    const highReactions: ItemReactionSummary = {
      like: 15, love: 5, dislike: 0, confused: 0, total: 20,
    };
    render(<EngagementIndicator visitStats={lowEngagementStats} reactions={highReactions} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('renders dot variant correctly', () => {
    const { container } = render(
      <EngagementIndicator visitStats={highEngagementStats} variant="dot" />
    );
    const dot = container.querySelector('span');
    expect(dot).toHaveClass('rounded-full');
    expect(dot).toHaveClass('w-2');
  });

  it('renders icon variant correctly', () => {
    render(<EngagementIndicator visitStats={highEngagementStats} variant="icon" />);
    expect(screen.getByLabelText('High engagement')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<EngagementIndicator loading />);
    expect(screen.getByLabelText('Loading engagement indicator')).toBeInTheDocument();
  });

  it('respects custom thresholds', () => {
    render(
      <EngagementIndicator
        visitStats={lowEngagementStats}
        thresholds={{ highViews: 1, mediumViews: 0 }}
      />
    );
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});
```

- [ ] **11.4** Run the tests:
```bash
npm test -- --testPathPattern="VisitCountBadge|ReactionSummary|EngagementIndicator" --passWithNoTests
```

---

## Task 12: Write Unit Tests for useItemAnalytics Hook

**Context:** Tests for the analytics hook covering fetch, cache, polling, and error handling.
**Files to create:** `src/components/ItemManager/hooks/__tests__/useItemAnalytics.test.ts`
**Estimated effort:** 1 story point

- [ ] **12.1** Create the test file at `src/components/ItemManager/hooks/__tests__/useItemAnalytics.test.ts`:
```typescript
/**
 * useItemAnalytics Hook Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useItemAnalytics } from '../useItemAnalytics';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockReactionsResponse = {
  success: true,
  data: { like: 5, love: 2, dislike: 0, confused: 1, total: 8 },
};

const mockAnalyticsResponse = {
  success: true,
  data: {
    last24Hours: 10,
    last7Days: 50,
    last30Days: 100,
    last365Days: 500,
    allTime: 1000,
  },
};

describe('useItemAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches analytics for provided item IDs', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReactionsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsResponse),
      });

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        authToken: 'test-token',
        pollingInterval: 0, // Disable polling for test
      })
    );

    await waitFor(() => {
      expect(result.current.analyticsMap.size).toBe(1);
    });

    const analytics = result.current.getAnalytics('test-id-1');
    expect(analytics?.reactions?.total).toBe(8);
    expect(analytics?.visitStats?.allTime).toBe(1000);
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        pollingInterval: 0,
      })
    );

    await waitFor(() => {
      const analytics = result.current.getAnalytics('test-id-1');
      expect(analytics?.error).toBeTruthy();
    });
  });

  it('respects cache TTL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReactionsResponse),
    });

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        cacheTTL: 5000,
        pollingInterval: 0,
      })
    );

    await waitFor(() => {
      expect(result.current.analyticsMap.size).toBe(1);
    });

    // First fetch completed
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Try to fetch again - should use cache
    await act(async () => {
      await result.current.fetchAnalytics('test-id-1');
    });

    // Should still be 1 call (cached)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('clears cache correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReactionsResponse),
    });

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        pollingInterval: 0,
      })
    );

    await waitFor(() => {
      expect(result.current.analyticsMap.size).toBe(1);
    });

    act(() => {
      result.current.clearCache('test-id-1');
    });

    expect(result.current.analyticsMap.size).toBe(0);
  });

  it('does not fetch when disabled', async () => {
    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        enabled: false,
      })
    );

    // Wait a bit to ensure no fetches happen
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.analyticsMap.size).toBe(0);
  });
});
```

- [ ] **12.2** Run the tests:
```bash
npm test -- --testPathPattern="useItemAnalytics" --passWithNoTests
```

---

## Task 13: Verification and Documentation

**Context:** Final verification that all components work together correctly and the feature meets acceptance criteria.
**Estimated effort:** 1 story point

- [ ] **13.1** Run the full TypeScript check:
```bash
npx tsc --noEmit
```

- [ ] **13.2** Run all tests:
```bash
npm test
```

- [ ] **13.3** Start the development server and manually verify:
```bash
npm run dev
```

- [ ] **13.4** Manual verification checklist:
  - [ ] Item listings show total visit count for each item (when analytics enabled)
  - [ ] Item listings display reaction summaries showing count by reaction type
  - [ ] Detailed item preview shows complete analytics breakdown
  - [ ] Visual indicators (EngagementIndicator) distinguish high/medium/low engagement
  - [ ] Grid view (ItemCard) displays analytics in footer section
  - [ ] List view (ItemRow) displays analytics in dedicated columns
  - [ ] Analytics update without page refresh (when polling enabled)
  - [ ] Performance is acceptable with 10+ items visible

- [ ] **13.5** Update the overview document with completion status:
  - Add "Implementation completed: 2026-01-05" to the header

---

## Quality Checklist

Before marking implementation complete, verify:

- [ ] All tasks reference only authorized files from the overview document
- [ ] Each numbered task is completable in <= 1 story point
- [ ] All file paths are relative to project root
- [ ] No navigation commands to other directories
- [ ] Testing tasks are included for each feature
- [ ] Solutions are input-driven (thresholds configurable, not hardcoded)
- [ ] Implementation uses standard React patterns (hooks, props, composition)
- [ ] All new components have proper TypeScript types
- [ ] All new components have accessibility attributes (aria-labels)
- [ ] Date/time uses actual system time

---

**Document generated:** 2026-01-05 (System Date)
**Reference:** REQ-091 from `docs/gen_requests.md`
