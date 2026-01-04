/**
 * useDebounce Hook
 *
 * Returns a debounced value that only updates after the specified delay.
 * Useful for search inputs to prevent excessive API calls or re-renders.
 *
 * @module ItemManager/hooks/useDebounce
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 * @lastModified 2026-01-04 (REQ-064 - Initial implementation)
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Default debounce delay for search inputs.
 * 300ms is a standard UX delay that feels responsive while reducing unnecessary operations.
 */
export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Debounce a value by delaying updates.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating
 * @returns The debounced value
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   // This runs 300ms after the user stops typing
 *   performSearch(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Skip if delay is 0 or negative (no debounce)
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    // Set up timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes or component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Default export for compatibility
export default useDebounce;
