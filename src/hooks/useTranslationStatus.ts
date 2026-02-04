/**
 * useTranslationStatus Hook
 *
 * Custom React hook for fetching and managing translation status data from the
 * Translation Status API endpoint. Supports single entity queries or property-wide
 * aggregated queries.
 *
 * @module hooks/useTranslationStatus
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-24
 * @requestReference REQ-E05-011
 *
 * @example
 * // Single entity query
 * const { data, isLoading, error } = useTranslationStatus({
 *   entityId: 'abc123',
 *   entityType: 'item'
 * });
 *
 * @example
 * // Property-wide query
 * const { items, summary, refetch } = useTranslationStatus({
 *   propertyId: 'xyz789'
 * });
 *
 * @example
 * // With filters
 * const { items, summary } = useTranslationStatus({
 *   propertyId: 'xyz789',
 *   languages: ['fr', 'es'],
 *   statuses: ['completed']
 * });
 *
 * @example
 * // With enabled flag (conditional fetching)
 * const { data } = useTranslationStatus({
 *   entityId: selectedId,
 *   entityType: 'article',
 *   enabled: Boolean(selectedId)
 * });
 *
 * @example
 * // With auto-polling
 * const { data, isRefetching } = useTranslationStatus({
 *   propertyId: 'xyz789',
 *   refetchInterval: 30000 // 30 seconds
 * });
 *
 * @example
 * // With error handler
 * const { data, error } = useTranslationStatus({
 *   propertyId: 'xyz789',
 *   onError: (err) => toast.error(err.message)
 * });
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { apiRequest } from '@/lib/api';
import type {
  TranslationItemDisplay,
  TranslationSummary,
  SupportedLanguage,
  TranslationStatus,
} from '@/components/TranslationManagement/TranslationManagement.types';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Options for useTranslationStatus hook.
 *
 * Provide either (entityId + entityType) for single entity query,
 * OR propertyId for property-wide query. Cannot provide both.
 */
export interface UseTranslationStatusOptions {
  /** Entity ID for single entity query (requires entityType) */
  entityId?: string;
  /** Entity type for single entity query (requires entityId) */
  entityType?: 'item' | 'article' | 'link' | 'tag';
  /** Property ID for property-wide aggregated query */
  propertyId?: string;
  /** Filter by specific languages */
  languages?: SupportedLanguage[];
  /** Filter by specific statuses */
  statuses?: TranslationStatus[];
  /** Whether to enable automatic fetching (default: true) */
  enabled?: boolean;
  /** Auto-refetch interval in milliseconds */
  refetchInterval?: number;
  /** Error callback for custom error handling */
  onError?: (error: Error) => void;
}

/**
 * Translation status data returned from API endpoint.
 */
export interface TranslationStatusData {
  /** List of translation items */
  items: TranslationItemDisplay[];
  /** Aggregate summary statistics */
  summary: TranslationSummary;
  /** Pagination info (optional) */
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Return value from useTranslationStatus hook with data, states, and actions.
 */
export interface UseTranslationStatusReturn {
  /** Full data object from API */
  data: TranslationStatusData | null;
  /** Convenience accessor for items array */
  items: TranslationItemDisplay[];
  /** Convenience accessor for summary object */
  summary: TranslationSummary | null;
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Loading state for subsequent fetches */
  isRefetching: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Error object if any */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
  /** Timestamp of last successful fetch */
  lastUpdated: Date | null;
  /** Whether data has been fetched at least once */
  isFetched: boolean;
}

/**
 * Internal state for tracking field values, dirty state, and save status.
 */
interface HookState {
  data: TranslationStatusData | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  lastUpdated: number | null;
  isFetched: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Validates hook options to ensure exactly one query mode is provided.
 * Throws Error if validation fails.
 */
function validateOptions(options: UseTranslationStatusOptions): void {
  const hasEntityQuery = Boolean(options.entityId && options.entityType);
  const hasPropertyQuery = Boolean(options.propertyId);

  if (!hasEntityQuery && !hasPropertyQuery) {
    throw new Error(
      'useTranslationStatus: Must provide either (entityId + entityType) or propertyId'
    );
  }

  if (hasEntityQuery && hasPropertyQuery) {
    throw new Error(
      'useTranslationStatus: Cannot provide both entity query and property query. Use one or the other.'
    );
  }

  if (
    (options.entityId && !options.entityType) ||
    (!options.entityId && options.entityType)
  ) {
    throw new Error(
      'useTranslationStatus: entityId and entityType must be provided together'
    );
  }
}

/**
 * Builds API endpoint URL with query parameters based on options.
 */
function buildEndpoint(options: UseTranslationStatusOptions): string {
  const params = new URLSearchParams();

  if (options.entityId && options.entityType) {
    params.append('entityId', options.entityId);
    params.append('entityType', options.entityType);
  }

  if (options.propertyId) {
    params.append('propertyId', options.propertyId);
  }

  if (options.languages && options.languages.length > 0) {
    params.append('languages', options.languages.join(','));
  }

  if (options.statuses && options.statuses.length > 0) {
    params.append('statuses', options.statuses.join(','));
  }

  const queryString = params.toString();
  return `/translations/status${queryString ? `?${queryString}` : ''}`;
}

// =============================================================================
// Main Hook
// =============================================================================

export function useTranslationStatus(
  options: UseTranslationStatusOptions
): UseTranslationStatusReturn {
  // Destructure options with defaults first
  const {
    enabled = true,
    refetchInterval,
    onError,
  } = options;

  // Only validate options if hook is enabled
  if (enabled) {
    validateOptions(options);
  }

  // Initialize state
  const [state, setState] = useState<HookState>({
    data: null,
    isLoading: false,
    isRefetching: false,
    error: null,
    lastUpdated: null,
    isFetched: false,
  });

  // Create mounted ref
  const isMountedRef = useRef(true);

  // Create abort controller ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create stale request counter ref
  const requestCounterRef = useRef(0);

  // Memoize options for stable dependency
  const optionsKey = useMemo(
    () =>
      JSON.stringify({
        entityId: options.entityId,
        entityType: options.entityType,
        propertyId: options.propertyId,
        languages: options.languages,
        statuses: options.statuses,
      }),
    [
      options.entityId,
      options.entityType,
      options.propertyId,
      options.languages,
      options.statuses,
    ]
  );

  /**
   * Fetches translation status data from API.
   * Handles abort signals, race conditions, and updates state.
   */
  const fetchData = useCallback(
    async (isRefetch = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Increment request counter for stale detection
      const currentRequestId = ++requestCounterRef.current;

      // Set loading state
      setState((prev) => ({
        ...prev,
        isLoading: !isRefetch,
        isRefetching: isRefetch,
        error: null,
      }));

      try {
        const endpoint = buildEndpoint(options);

        const response = await apiRequest<TranslationStatusData>(endpoint, {
          method: 'GET',
          signal: abortController.signal,
        });

        // Check if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        // Update state with data
        setState({
          data: response,
          isLoading: false,
          isRefetching: false,
          error: null,
          lastUpdated: Date.now(),
          isFetched: true,
        });
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        // Check for stale request
        if (
          currentRequestId !== requestCounterRef.current ||
          !isMountedRef.current
        ) {
          return;
        }

        const error = err instanceof Error ? err : new Error('Unknown error');

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefetching: false,
          error,
          isFetched: true,
        }));

        onError?.(error);
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [optionsKey, onError] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * Manually refetch translation status data.
   * Sets isRefetching=true during the operation.
   */
  const refetch = useCallback(async () => {
    if (!enabled) return;
    await fetchData(true);
  }, [enabled, fetchData]);

  // Effects

  // Fetch data on mount and when options change
  useEffect(() => {
    if (!enabled) return;
    fetchData(false);
  }, [enabled, fetchData, optionsKey]);

  // Set up auto-polling if refetchInterval is provided
  useEffect(() => {
    if (!enabled || !refetchInterval || refetchInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchData(true);
    }, refetchInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, refetchInterval, fetchData]);

  // Set mounted flag and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Memoized return values
  const items = useMemo(() => state.data?.items || [], [state.data]);
  const summary = useMemo(() => state.data?.summary || null, [state.data]);
  const lastUpdated = useMemo(
    () => (state.lastUpdated ? new Date(state.lastUpdated) : null),
    [state.lastUpdated]
  );
  const isError = useMemo(() => Boolean(state.error), [state.error]);

  return {
    data: state.data,
    items,
    summary,
    isLoading: state.isLoading,
    isRefetching: state.isRefetching,
    isError,
    error: state.error,
    refetch,
    lastUpdated,
    isFetched: state.isFetched,
  };
}
