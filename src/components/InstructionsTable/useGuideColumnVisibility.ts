'use client';

/**
 * useGuideColumnVisibility - Hook for managing column visibility preferences
 *
 * Manages which optional columns are visible in the InstructionsTable view.
 * Persists state to sessionStorage for tab-level persistence.
 *
 * @module InstructionsTable/hooks/useGuideColumnVisibility
 * @see docs/req-220-toolbar-infrastructure-guides-list-overview.md
 * @lastModified 2026-01-13 (REQ-220 - Added property column)
 */

import { useState, useCallback, useEffect } from 'react';
import type { GuideColumnVisibilityState } from './InstructionsTable.types';

// =============================================================================
// Constants
// =============================================================================

const SESSION_STORAGE_KEY = 'instructionsTable.columns';

// =============================================================================
// Types
// =============================================================================

export interface UseGuideColumnVisibilityReturn {
  /** Current visibility state for all columns */
  columnVisibility: GuideColumnVisibilityState;
  /** Toggle visibility of a specific column */
  toggleColumn: (column: keyof GuideColumnVisibilityState) => void;
  /** Set visibility of a specific column */
  setColumnVisibility: (column: keyof GuideColumnVisibilityState, visible: boolean) => void;
  /** Check if a specific column is visible */
  isColumnVisible: (column: keyof GuideColumnVisibilityState) => boolean;
}

// =============================================================================
// Default State
// =============================================================================

const DEFAULT_VISIBILITY: GuideColumnVisibilityState = {
  room: true,     // Visible by default
  purpose: true,  // Visible by default
  property: false, // Hidden by default (REQ-220)
};

// =============================================================================
// Hook Implementation
// =============================================================================

export function useGuideColumnVisibility(): UseGuideColumnVisibilityReturn {
  const [columnVisibility, setVisibilityState] = useState<GuideColumnVisibilityState>(DEFAULT_VISIBILITY);

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
        console.warn('Failed to parse guide column visibility from sessionStorage:', e);
      }
    }
  }, []);

  // Persist to sessionStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(columnVisibility));
      } catch (e) {
        console.warn('Failed to save guide column visibility to sessionStorage:', e);
      }
    }
  }, [columnVisibility]);

  const toggleColumn = useCallback((column: keyof GuideColumnVisibilityState) => {
    setVisibilityState((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  }, []);

  const setColumnVisibility = useCallback((column: keyof GuideColumnVisibilityState, visible: boolean) => {
    setVisibilityState((prev) => ({
      ...prev,
      [column]: visible,
    }));
  }, []);

  const isColumnVisible = useCallback(
    (column: keyof GuideColumnVisibilityState) => columnVisibility[column],
    [columnVisibility]
  );

  return {
    columnVisibility,
    toggleColumn,
    setColumnVisibility,
    isColumnVisible,
  };
}

export default useGuideColumnVisibility;
