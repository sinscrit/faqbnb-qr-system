'use client';

/**
 * useSessionPersistence - Automatic session persistence and recovery
 *
 * This hook provides auto-save and session recovery functionality for the
 * ItemCreationWorkflow component. It automatically persists state to localStorage
 * with debouncing and provides methods for manual save/restore operations.
 *
 * ## Features
 * - Auto-save on state changes (debounced to minimize storage operations)
 * - Session recovery on mount with recoverable session detection
 * - Automatic cleanup on session completion
 * - Detection of content needing re-upload (File/Blob references don't persist)
 *
 * @example Session recovery on mount
 * ```tsx
 * const {
 *   hasRecoverableSession,
 *   recover,
 *   discard,
 *   lastSaved,
 * } = useSessionPersistence({
 *   sessionId: state.session.id,
 *   state,
 *   enabled: true,
 * });
 *
 * if (hasRecoverableSession) {
 *   return (
 *     <SessionRecoveryBanner
 *       lastSaved={lastSaved}
 *       onRecover={recover}
 *       onDiscard={discard}
 *     />
 *   );
 * }
 * ```
 *
 * @module ItemCreationWorkflow/hooks/useSessionPersistence
 * @see SessionRecoveryBanner for recovery UI
 * @see sessionStorage utilities for storage implementation
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { WorkflowState } from '../ItemCreationWorkflow.types';
import {
  isLocalStorageAvailable,
  saveWorkflowState,
  loadWorkflowState,
  loadMostRecentWorkflowState,
  clearWorkflowState,
  hasRecoverableSession,
  getContentNeedingReUpload,
} from '../utils/sessionStorage';

// =============================================================================
// Constants
// =============================================================================

/** Default debounce interval for auto-save (milliseconds) */
export const AUTO_SAVE_DEBOUNCE_MS = 500;

// =============================================================================
// Types
// =============================================================================

/**
 * Options for configuring the useSessionPersistence hook.
 */
export interface UseSessionPersistenceOptions {
  /** Whether persistence is enabled (default: true) */
  enabled?: boolean;

  /** Debounce interval for auto-save in milliseconds (default: 500) */
  debounceMs?: number;

  /**
   * Callback when a session is restored.
   * @param state - The restored workflow state
   * @param needsReUpload - Number of content pieces needing re-upload
   */
  onSessionRestored?: (state: Partial<WorkflowState>, needsReUpload: number) => void;

  /** Callback when no session is found to restore */
  onNoSession?: () => void;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Return type for the useSessionPersistence hook.
 */
export interface UseSessionPersistenceReturn {
  /** Whether localStorage is available */
  isStorageAvailable: boolean;

  /** Whether the current session was restored from storage */
  wasRestored: boolean;

  /** Number of content pieces that need re-upload */
  contentNeedingReUpload: number;

  /** Immediately save the current state (bypasses debounce) */
  saveNow: () => void;

  /** Clear the current session from storage */
  clearSession: () => void;

  /** Check if there are any recoverable sessions */
  checkForRecoverableSession: () => boolean;

  /**
   * Restore the most recent session from storage.
   * @returns The restored state or null if none found
   */
  restoreMostRecentSession: () => Partial<WorkflowState> | null;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing workflow state persistence to localStorage.
 *
 * Provides auto-save functionality with debouncing, session recovery,
 * and automatic cleanup when the workflow completes.
 *
 * @param state - Current workflow state to persist
 * @param options - Configuration options
 * @returns Persistence controls and status
 *
 * @example
 * const {
 *   isStorageAvailable,
 *   wasRestored,
 *   saveNow,
 *   clearSession,
 *   restoreMostRecentSession,
 * } = useSessionPersistence(state, {
 *   onSessionRestored: (restored, needsReUpload) => {
 *     console.log('Session restored with', needsReUpload, 'items needing re-upload');
 *   },
 * });
 */
export function useSessionPersistence(
  state: WorkflowState,
  options: UseSessionPersistenceOptions = {}
): UseSessionPersistenceReturn {
  // Destructure options with defaults
  const {
    enabled = true,
    debounceMs = AUTO_SAVE_DEBOUNCE_MS,
    onSessionRestored,
    onNoSession,
    debug = false,
  } = options;

  // ==========================================================================
  // State
  // ==========================================================================

  const [wasRestored, setWasRestored] = useState(false);
  const [contentNeedingReUpload, setContentNeedingReUpload] = useState(0);

  // ==========================================================================
  // Refs
  // ==========================================================================

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevSessionIdRef = useRef<string | null>(null);

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  // Check storage availability once
  const isStorageAvailable = isLocalStorageAvailable();

  // ==========================================================================
  // Debug Logging
  // ==========================================================================

  const log = useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log('[useSessionPersistence]', ...args);
      }
    },
    [debug]
  );

  // ==========================================================================
  // Save Functions
  // ==========================================================================

  /**
   * Immediately save the current state to localStorage.
   */
  const saveNow = useCallback(() => {
    // Skip if disabled or storage unavailable
    if (!enabled || !isStorageAvailable) {
      log('Save skipped - enabled:', enabled, 'storage:', isStorageAvailable);
      return;
    }

    // Don't save if session is complete
    if (state.currentStep === 'session-summary') {
      log('Save skipped - session complete');
      return;
    }

    const success = saveWorkflowState(state);
    log('Save result:', success);
  }, [enabled, isStorageAvailable, state, log]);

  // ==========================================================================
  // Auto-Save Effect
  // ==========================================================================

  useEffect(() => {
    // Skip if disabled or storage unavailable
    if (!enabled || !isStorageAvailable) {
      return;
    }

    // Don't auto-save if session is complete
    if (state.currentStep === 'session-summary') {
      return;
    }

    // Clear previous debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounced save
    debounceRef.current = setTimeout(() => {
      saveNow();
    }, debounceMs);

    // Cleanup on unmount or deps change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state, enabled, isStorageAvailable, debounceMs, saveNow]);

  // ==========================================================================
  // Clear Session
  // ==========================================================================

  /**
   * Clear the current session from localStorage.
   */
  const clearSession = useCallback(() => {
    if (!isStorageAvailable) {
      return;
    }

    log('Clearing session:', state.session.id);
    clearWorkflowState(state.session.id);
  }, [isStorageAvailable, state.session.id, log]);

  // ==========================================================================
  // Session Completion Cleanup
  // ==========================================================================

  useEffect(() => {
    if (state.currentStep === 'session-summary') {
      log('Session complete - clearing storage');
      clearSession();
    }
  }, [state.currentStep, clearSession, log]);

  // ==========================================================================
  // Session Recovery
  // ==========================================================================

  /**
   * Check if there are any recoverable sessions in storage.
   */
  const checkForRecoverableSession = useCallback((): boolean => {
    return hasRecoverableSession();
  }, []);

  /**
   * Restore the most recent session from storage.
   */
  const restoreMostRecentSession = useCallback((): Partial<WorkflowState> | null => {
    if (!isStorageAvailable) {
      return null;
    }

    const restored = loadMostRecentWorkflowState();

    if (restored) {
      const needsReUpload = getContentNeedingReUpload(restored);
      setWasRestored(true);
      setContentNeedingReUpload(needsReUpload);
      log('Session restored, content needing re-upload:', needsReUpload);
      onSessionRestored?.(restored, needsReUpload);
      return restored;
    }

    log('No session to restore');
    onNoSession?.();
    return null;
  }, [isStorageAvailable, onSessionRestored, onNoSession, log]);

  // ==========================================================================
  // Session ID Change Detection
  // ==========================================================================

  useEffect(() => {
    // If the session ID changed (not initial render), clear the old session
    if (
      prevSessionIdRef.current !== null &&
      prevSessionIdRef.current !== state.session.id
    ) {
      log('Session ID changed, clearing old session:', prevSessionIdRef.current);
      clearWorkflowState(prevSessionIdRef.current);
    }

    prevSessionIdRef.current = state.session.id;
  }, [state.session.id, log]);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    isStorageAvailable,
    wasRestored,
    contentNeedingReUpload,
    saveNow,
    clearSession,
    checkForRecoverableSession,
    restoreMostRecentSession,
  };
}

export default useSessionPersistence;
