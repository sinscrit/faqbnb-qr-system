'use client';

/**
 * useManualEditCheck Hook
 *
 * Custom hook for detecting manual translations before save operations.
 * Queries translation records to identify which languages have manual edits
 * (status === 'manual') and provides this information to editor components.
 *
 * Implements fail-safe behavior: if the API check fails, returns
 * hasManualEdits: false to allow the save to proceed rather than blocking.
 *
 * @module hooks/useManualEditCheck
 * @see docs/REQ-E05-024-integrate-warning-into-content-save-flow-overview.md
 * @created 2026-01-24
 * @lastModified 2026-01-24 (REQ-E05-024)
 *
 * @example
 * const { checkForManualEdits, isChecking, error } = useManualEditCheck();
 *
 * const handleSave = async () => {
 *   const result = await checkForManualEdits({
 *     entityType: 'article',
 *     entityId: articleId
 *   });
 *
 *   if (result.hasManualEdits) {
 *     // Show warning dialog
 *     setManuallyEditedLanguages(result.manuallyEditedLanguages);
 *     setShowWarningDialog(true);
 *   } else {
 *     // Proceed with save
 *     await saveContent();
 *   }
 * };
 */

import { useState, useCallback } from 'react';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Types and Interfaces
// =============================================================================

/**
 * Options for checking manual edits on an entity.
 */
export interface ManualEditCheckOptions {
  /** Type of entity to check ('item' or 'article') */
  entityType: 'item' | 'article';
  /** ID of the entity to check */
  entityId: string;
}

/**
 * Result of a manual edit check.
 */
export interface ManualEditCheckResult {
  /** Whether any translations have manual edits */
  hasManualEdits: boolean;
  /** Array of language codes that have manual translations */
  manuallyEditedLanguages: SupportedLanguage[];
}

/**
 * Return type for the useManualEditCheck hook.
 */
export interface UseManualEditCheckReturn {
  /** Function to check for manual edits on an entity */
  checkForManualEdits: (options: ManualEditCheckOptions) => Promise<ManualEditCheckResult>;
  /** Whether a check is currently in progress */
  isChecking: boolean;
  /** Error message if the last check failed (null if successful) */
  error: string | null;
  /** Function to clear the error state */
  reset: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for checking manual translations before save operations.
 *
 * @returns Object containing checkForManualEdits function, loading state, error state, and reset function
 */
export function useManualEditCheck(): UseManualEditCheckReturn {
  // State management
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check for manual translations on an entity.
   *
   * @param options - Entity type and ID to check
   * @returns Promise resolving to manual edit check result
   */
  const checkForManualEdits = useCallback(
    async (options: ManualEditCheckOptions): Promise<ManualEditCheckResult> => {
      const { entityType, entityId } = options;

      // Start loading, clear previous error
      setIsChecking(true);
      setError(null);

      try {
        // Fetch translation status from API
        const response = await fetch(`/api/translations/${entityType}/${entityId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract translations array from response
        // API may return { translations: [...] } or just [...]
        const translations = Array.isArray(data) ? data : data.translations || [];

        // Filter translations with status === 'manual' and extract language codes
        const manuallyEditedLanguages: SupportedLanguage[] = translations
          .filter((t: { status?: string }) => t.status === 'manual')
          .map((t: { language: SupportedLanguage }) => t.language);

        return {
          hasManualEdits: manuallyEditedLanguages.length > 0,
          manuallyEditedLanguages,
        };
      } catch (err) {
        // Log error for debugging
        console.error('[useManualEditCheck] Error checking manual edits:', err);

        // Set error state for UI feedback
        const errorMessage = err instanceof Error ? err.message : 'Failed to check translations';
        setError(errorMessage);

        // Fail-safe: return false to allow save to proceed
        return {
          hasManualEdits: false,
          manuallyEditedLanguages: [],
        };
      } finally {
        // Always stop loading
        setIsChecking(false);
      }
    },
    []
  );

  /**
   * Reset the error state.
   */
  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkForManualEdits,
    isChecking,
    error,
    reset,
  };
}

export default useManualEditCheck;
