'use client';

/**
 * useColumnVisibility - Hook for managing column visibility preferences
 *
 * Manages which optional columns are visible in the ItemList view.
 * Persists state to sessionStorage for tab-level persistence.
 *
 * @module ItemManager/hooks/useColumnVisibility
 * @see docs/req-218-items-list-ui-improvements-Overview.md
 * @lastModified 2026-01-24 (REQ-E05-017 - Added translationStatus column)
 */

import { useState, useCallback, useEffect } from 'react';
import type { ColumnVisibilityState } from '../ItemManager.types';

// =============================================================================
// Constants
// =============================================================================

const SESSION_STORAGE_KEY = 'itemManager.columns';

// =============================================================================
// Types
// =============================================================================

// Re-export ColumnVisibilityState from ItemManager.types
export type { ColumnVisibilityState } from '../ItemManager.types';

export interface UseColumnVisibilityReturn {
  /** Current visibility state for all columns */
  columnVisibility: ColumnVisibilityState;
  /** Toggle visibility of a specific column */
  toggleColumn: (column: keyof ColumnVisibilityState) => void;
  /** Set visibility of a specific column */
  setColumnVisibility: (column: keyof ColumnVisibilityState, visible: boolean) => void;
  /** Check if a specific column is visible */
  isColumnVisible: (column: keyof ColumnVisibilityState) => boolean;
}

// =============================================================================
// Default State
// =============================================================================

const DEFAULT_VISIBILITY: ColumnVisibilityState = {
  property: false, // Hidden by default as per requirements
  translationStatus: false, // Hidden by default, opt-in feature (REQ-E05-017)
};

// =============================================================================
// Hook Implementation
// =============================================================================

export function useColumnVisibility(): UseColumnVisibilityReturn {
  const [columnVisibility, setVisibilityState] = useState<ColumnVisibilityState>(DEFAULT_VISIBILITY);

  // Restore from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setVisibilityState({
            ...DEFAULT_VISIBILITY,
            ...parsed,
          });
        }
      } catch (e) {
        console.warn('Failed to parse column visibility from sessionStorage:', e);
      }
    }
  }, []);

  // Persist to sessionStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(columnVisibility));
      } catch (e) {
        console.warn('Failed to save column visibility to sessionStorage:', e);
      }
    }
  }, [columnVisibility]);

  const toggleColumn = useCallback((column: keyof ColumnVisibilityState) => {
    setVisibilityState((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  }, []);

  const setColumnVisibility = useCallback((column: keyof ColumnVisibilityState, visible: boolean) => {
    setVisibilityState((prev) => ({
      ...prev,
      [column]: visible,
    }));
  }, []);

  const isColumnVisible = useCallback(
    (column: keyof ColumnVisibilityState) => columnVisibility[column],
    [columnVisibility]
  );

  return {
    columnVisibility,
    toggleColumn,
    setColumnVisibility,
    isColumnVisible,
  };
}

export default useColumnVisibility;
