'use client';

/**
 * useSuggestions - Dynamic suggestions hook for SpecificItemStep
 *
 * Provides contextual item suggestions based on room and item type,
 * with tracking of which suggestions have already been created in the session.
 *
 * @module ItemCreationWorkflow/hooks/useSuggestions
 * @see docs/REQ-100-specific-item-selection-step-overview.md
 * @lastModified 2026-01-05
 */

import { useMemo, useCallback } from 'react';
import type { RoomType, ItemType, SessionItem } from '../ItemCreationWorkflow.types';
import { getSuggestions } from '../utils/suggestionMatrix';

export interface UseSuggestionsOptions {
  /** Currently selected room type */
  room: RoomType;
  /** Currently selected item type */
  itemType: ItemType;
  /** Items already created in this session */
  existingItems: SessionItem[];
}

export interface UseSuggestionsReturn {
  /** All suggestions for the room + item type combination */
  suggestions: string[];
  /** Set of suggestion names that have already been created */
  createdSuggestions: Set<string>;
  /** Helper to check if a specific suggestion was created */
  isCreated: (suggestion: string) => boolean;
  /** Whether there are any suggestions available */
  hasSuggestions: boolean;
}

export function useSuggestions({
  room,
  itemType,
  existingItems,
}: UseSuggestionsOptions): UseSuggestionsReturn {
  // Get suggestions based on room and item type
  const suggestions = useMemo(() => {
    return getSuggestions(room, itemType);
  }, [room, itemType]);

  // Calculate which suggestions have been created
  const createdSuggestions = useMemo(() => {
    const created = new Set<string>();
    for (const item of existingItems) {
      // Match items in same room by checking if name contains suggestion
      if (item.room === room) {
        for (const suggestion of suggestions) {
          // Case-insensitive check if item name contains the suggestion
          if (item.name.toLowerCase().includes(suggestion.toLowerCase())) {
            created.add(suggestion);
          }
        }
      }
    }
    return created;
  }, [existingItems, room, suggestions]);

  // Helper to check if a suggestion was created
  const isCreated = useCallback(
    (suggestion: string) => createdSuggestions.has(suggestion),
    [createdSuggestions]
  );

  return {
    suggestions,
    createdSuggestions,
    isCreated,
    hasSuggestions: suggestions.length > 0,
  };
}

export default useSuggestions;
