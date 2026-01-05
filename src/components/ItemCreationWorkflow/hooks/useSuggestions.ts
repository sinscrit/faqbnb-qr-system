'use client';

/**
 * useSuggestions - Dynamic item suggestions based on room and item type
 *
 * Provides contextual item name suggestions based on the selected room
 * and item type. Suggestions are sourced from the suggestion matrix
 * and help users quickly select common items.
 *
 * ## Features
 * - Dynamic suggestions based on room + item type combination
 * - Tracking of already-created suggestions to mark as "done"
 * - Case-insensitive matching for existing items
 *
 * @example Using suggestions in item selection
 * ```tsx
 * const { suggestions, isCreated, hasSuggestions } = useSuggestions({
 *   room: 'kitchen',
 *   itemType: 'appliance',
 *   existingItems: sessionItems,
 * });
 *
 * return (
 *   <div>
 *     {suggestions.map((suggestion) => (
 *       <SuggestionButton
 *         key={suggestion}
 *         label={suggestion}
 *         disabled={isCreated(suggestion)}
 *         onClick={() => handleSelect(suggestion)}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @module ItemCreationWorkflow/hooks/useSuggestions
 * @see SUGGESTION_MATRIX for suggestion data
 * @see SpecificItemStep for usage context
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
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
