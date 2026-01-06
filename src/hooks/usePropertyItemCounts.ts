// src/hooks/usePropertyItemCounts.ts
// REQ-135: Property Item Counts Hook
// Created: 2026-01-06
// Last Modified: 2026-01-06
//
// Custom hook to fetch item counts for all user properties in parallel.
// Provides loading state and error handling for efficient property card display.

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Hook interface
interface UsePropertyItemCountsReturn {
  itemCounts: Record<string, number>; // propertyId -> count
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch item counts for all user properties.
 *
 * Features:
 * - Fetches item counts in parallel for all properties
 * - Returns a Record mapping propertyId to item count
 * - Handles API errors gracefully (returns 0 for failed properties)
 * - Provides loading state for UI skeleton/placeholder
 * - Memoized to prevent unnecessary refetches
 *
 * @param propertyIds - Array of property IDs to fetch counts for
 * @returns UsePropertyItemCountsReturn - Item counts and state
 */
export function usePropertyItemCounts(
  propertyIds: string[]
): UsePropertyItemCountsReturn {
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  // Memoize property IDs to prevent unnecessary refetches
  const memoizedPropertyIds = useMemo(
    () => JSON.stringify(propertyIds.sort()),
    [propertyIds]
  );

  // Fetch counts for all properties in parallel
  const fetchCounts = useCallback(async () => {
    // Parse the memoized property IDs
    const ids: string[] = JSON.parse(memoizedPropertyIds);

    // Skip if no properties
    if (!ids || ids.length === 0) {
      setItemCounts({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch item counts for each property in parallel
      const countPromises = ids.map(async (propertyId) => {
        try {
          const response = await fetch(`/api/user/properties/${propertyId}/items`);

          if (!response.ok) {
            console.warn(`Failed to fetch items for property ${propertyId}`);
            return { propertyId, count: 0 };
          }

          const data = await response.json();

          if (!data.success) {
            console.warn(`API error for property ${propertyId}:`, data.error);
            return { propertyId, count: 0 };
          }

          // Return the count of items
          const count = Array.isArray(data.data) ? data.data.length : 0;
          return { propertyId, count };
        } catch (err) {
          console.warn(`Error fetching items for property ${propertyId}:`, err);
          return { propertyId, count: 0 };
        }
      });

      // Wait for all fetches to complete
      const results = await Promise.all(countPromises);

      // Only update state if component is still mounted
      if (isMounted.current) {
        // Transform results to Record<string, number>
        const countsMap: Record<string, number> = {};
        results.forEach(({ propertyId, count }) => {
          countsMap[propertyId] = count;
        });

        setItemCounts(countsMap);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching property item counts:', err);

      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch item counts');
        setLoading(false);
      }
    }
  }, [memoizedPropertyIds]);

  // Fetch counts when property IDs change
  useEffect(() => {
    isMounted.current = true;
    fetchCounts();

    return () => {
      isMounted.current = false;
    };
  }, [fetchCounts]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    itemCounts,
    loading,
    error,
    refetch
  };
}

export default usePropertyItemCounts;
