// src/hooks/usePropertyItemCounts.ts
// REQ-135: Property Item Counts Hook
// Created: 2026-01-06
// Last Modified: 2026-01-11 - Added room counts from tags
//
// Custom hook to fetch item counts and room counts for all user properties.
// Provides loading state and error handling for efficient property card display.

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Room tag prefix - items tagged with #room.kitchen, #room.bathroom, etc.
const ROOM_TAG_PREFIX = '#room.';

// Hook interface
interface UsePropertyItemCountsReturn {
  itemCounts: Record<string, number>; // propertyId -> item count
  roomCounts: Record<string, number>; // propertyId -> unique room count
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Extract unique room names from an array of tags
 * Room tags use format #room.roomname (e.g., #room.kitchen, #room.bathroom)
 */
function extractUniqueRooms(tags: string[] | null | undefined): Set<string> {
  const rooms = new Set<string>();
  if (!tags || !Array.isArray(tags)) return rooms;

  for (const tag of tags) {
    if (tag && tag.toLowerCase().startsWith(ROOM_TAG_PREFIX)) {
      // Extract room name after #room.
      const roomName = tag.slice(ROOM_TAG_PREFIX.length).toLowerCase();
      if (roomName) {
        rooms.add(roomName);
      }
    }
  }
  return rooms;
}

/**
 * Hook to fetch item counts and room counts for all user properties.
 *
 * Features:
 * - Fetches item counts in parallel for all properties
 * - Extracts unique room counts from item tags (#room.roomname format)
 * - Returns Records mapping propertyId to counts
 * - Handles API errors gracefully (returns 0 for failed properties)
 * - Provides loading state for UI skeleton/placeholder
 * - Memoized to prevent unnecessary refetches
 *
 * @param propertyIds - Array of property IDs to fetch counts for
 * @returns UsePropertyItemCountsReturn - Item counts, room counts, and state
 */
export function usePropertyItemCounts(
  propertyIds: string[]
): UsePropertyItemCountsReturn {
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
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
      setRoomCounts({});
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
            return { propertyId, itemCount: 0, roomCount: 0 };
          }

          const data = await response.json();

          if (!data.success) {
            console.warn(`API error for property ${propertyId}:`, data.error);
            return { propertyId, itemCount: 0, roomCount: 0 };
          }

          // Count items
          const items = Array.isArray(data.data) ? data.data : [];
          const itemCount = items.length;

          // Extract unique rooms from all items' tags
          const allRooms = new Set<string>();
          for (const item of items) {
            const itemRooms = extractUniqueRooms(item.tags);
            itemRooms.forEach(room => allRooms.add(room));
          }
          const roomCount = allRooms.size;

          return { propertyId, itemCount, roomCount };
        } catch (err) {
          console.warn(`Error fetching items for property ${propertyId}:`, err);
          return { propertyId, itemCount: 0, roomCount: 0 };
        }
      });

      // Wait for all fetches to complete
      const results = await Promise.all(countPromises);

      // Only update state if component is still mounted
      if (isMounted.current) {
        // Transform results to Records
        const itemCountsMap: Record<string, number> = {};
        const roomCountsMap: Record<string, number> = {};

        results.forEach(({ propertyId, itemCount, roomCount }) => {
          itemCountsMap[propertyId] = itemCount;
          roomCountsMap[propertyId] = roomCount;
        });

        setItemCounts(itemCountsMap);
        setRoomCounts(roomCountsMap);
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
    roomCounts,
    loading,
    error,
    refetch
  };
}

export default usePropertyItemCounts;
