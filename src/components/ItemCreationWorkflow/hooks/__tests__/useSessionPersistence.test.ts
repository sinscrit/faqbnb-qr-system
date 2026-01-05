/**
 * Unit Tests for useSessionPersistence Hook
 *
 * Tests the session persistence hook functionality using mocked storage utilities.
 * Note: Full React hook integration tests require testing infrastructure setup.
 *
 * @module ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-05 (REQ-096 Task 1.4)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionPersistence, AUTO_SAVE_DEBOUNCE_MS } from '../useSessionPersistence';
import type { WorkflowState } from '../../ItemCreationWorkflow.types';
import * as sessionStorage from '../../utils/sessionStorage';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Creates a mock WorkflowState for testing.
 */
function createMockState(overrides: Partial<WorkflowState> = {}): WorkflowState {
  return {
    currentStep: 'room-selection',
    stepHistory: [],
    canGoBack: false,
    session: {
      id: 'test-session-123',
      startedAt: new Date('2026-01-05T10:00:00Z'),
      currentStep: 'room-selection',
      items: [],
      currentItem: null,
    },
    currentItem: null,
    isSubmitting: false,
    isDirty: false,
    errors: {},
    submitError: null,
    ...overrides,
  };
}

// =============================================================================
// Mock Setup
// =============================================================================

vi.mock('../../utils/sessionStorage', () => ({
  isLocalStorageAvailable: vi.fn(() => true),
  saveWorkflowState: vi.fn(() => true),
  loadWorkflowState: vi.fn(() => null),
  loadMostRecentWorkflowState: vi.fn(() => null),
  clearWorkflowState: vi.fn(),
  hasRecoverableSession: vi.fn(() => false),
  getContentNeedingReUpload: vi.fn(() => 0),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('useSessionPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Reset to default mock implementations
    vi.mocked(sessionStorage.isLocalStorageAvailable).mockReturnValue(true);
    vi.mocked(sessionStorage.saveWorkflowState).mockReturnValue(true);
    vi.mocked(sessionStorage.loadMostRecentWorkflowState).mockReturnValue(null);
    vi.mocked(sessionStorage.hasRecoverableSession).mockReturnValue(false);
    vi.mocked(sessionStorage.getContentNeedingReUpload).mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('initialization', () => {
    it('returns isStorageAvailable correctly when available', () => {
      vi.mocked(sessionStorage.isLocalStorageAvailable).mockReturnValue(true);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      expect(result.current.isStorageAvailable).toBe(true);
    });

    it('returns isStorageAvailable correctly when unavailable', () => {
      vi.mocked(sessionStorage.isLocalStorageAvailable).mockReturnValue(false);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      expect(result.current.isStorageAvailable).toBe(false);
    });

    it('initializes wasRestored as false', () => {
      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      expect(result.current.wasRestored).toBe(false);
    });

    it('initializes contentNeedingReUpload as 0', () => {
      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      expect(result.current.contentNeedingReUpload).toBe(0);
    });
  });

  // ===========================================================================
  // Auto-Save Tests
  // ===========================================================================

  describe('auto-save', () => {
    it('saves state after debounce interval', async () => {
      const state = createMockState();

      renderHook(() => useSessionPersistence(state));

      // Should not save immediately
      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();

      // Advance past debounce interval
      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS + 10);
      });

      expect(sessionStorage.saveWorkflowState).toHaveBeenCalledWith(state);
    });

    it('does not save when disabled', () => {
      const state = createMockState();

      renderHook(() =>
        useSessionPersistence(state, { enabled: false })
      );

      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS + 10);
      });

      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();
    });

    it('does not save on session-summary step', () => {
      const state = createMockState({ currentStep: 'session-summary' });

      renderHook(() => useSessionPersistence(state));

      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS + 10);
      });

      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();
    });

    it('debounces rapid state changes', () => {
      const state1 = createMockState({ currentStep: 'room-selection' });
      const state2 = createMockState({ currentStep: 'item-type-selection' });
      const state3 = createMockState({ currentStep: 'specific-item-selection' });

      const { rerender } = renderHook(
        ({ state }) => useSessionPersistence(state),
        { initialProps: { state: state1 } }
      );

      // Advance halfway
      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS / 2);
      });

      // Change state - should reset debounce
      rerender({ state: state2 });

      // Advance halfway again
      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS / 2);
      });

      // Still should not have saved
      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();

      // Change state again
      rerender({ state: state3 });

      // Complete the debounce
      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS + 10);
      });

      // Should only save once with the final state
      expect(sessionStorage.saveWorkflowState).toHaveBeenCalledTimes(1);
      expect(sessionStorage.saveWorkflowState).toHaveBeenCalledWith(state3);
    });

    it('clears pending save on unmount', () => {
      const state = createMockState();

      const { unmount } = renderHook(() => useSessionPersistence(state));

      // Advance part way
      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS / 2);
      });

      // Unmount
      unmount();

      // Complete what would have been the debounce
      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS);
      });

      // Should not have saved (cleanup cleared the timeout)
      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();
    });

    it('uses custom debounce interval', () => {
      const state = createMockState();
      const customDebounce = 1000;

      renderHook(() =>
        useSessionPersistence(state, { debounceMs: customDebounce })
      );

      // Default debounce time should not trigger save
      act(() => {
        vi.advanceTimersByTime(AUTO_SAVE_DEBOUNCE_MS + 10);
      });

      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();

      // Custom debounce time should trigger save
      act(() => {
        vi.advanceTimersByTime(customDebounce - AUTO_SAVE_DEBOUNCE_MS);
      });

      expect(sessionStorage.saveWorkflowState).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // saveNow Tests
  // ===========================================================================

  describe('saveNow', () => {
    it('saves immediately when called', () => {
      const state = createMockState();

      const { result } = renderHook(() => useSessionPersistence(state));

      act(() => {
        result.current.saveNow();
      });

      expect(sessionStorage.saveWorkflowState).toHaveBeenCalledWith(state);
    });

    it('does not save when storage unavailable', () => {
      vi.mocked(sessionStorage.isLocalStorageAvailable).mockReturnValue(false);

      const state = createMockState();

      const { result } = renderHook(() => useSessionPersistence(state));

      act(() => {
        result.current.saveNow();
      });

      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();
    });

    it('does not save on session-summary step', () => {
      const state = createMockState({ currentStep: 'session-summary' });

      const { result } = renderHook(() => useSessionPersistence(state));

      act(() => {
        result.current.saveNow();
      });

      expect(sessionStorage.saveWorkflowState).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Session Recovery Tests
  // ===========================================================================

  describe('session recovery', () => {
    it('checkForRecoverableSession returns correct value', () => {
      vi.mocked(sessionStorage.hasRecoverableSession).mockReturnValue(true);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      expect(result.current.checkForRecoverableSession()).toBe(true);

      vi.mocked(sessionStorage.hasRecoverableSession).mockReturnValue(false);

      expect(result.current.checkForRecoverableSession()).toBe(false);
    });

    it('restoreMostRecentSession returns restored state', () => {
      const restoredState: Partial<WorkflowState> = {
        currentStep: 'content-creation',
        session: {
          id: 'restored-session',
          startedAt: new Date(),
          currentStep: 'content-creation',
          items: [],
          currentItem: null,
        },
      };

      vi.mocked(sessionStorage.loadMostRecentWorkflowState).mockReturnValue(restoredState);
      vi.mocked(sessionStorage.getContentNeedingReUpload).mockReturnValue(0);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      let restored: Partial<WorkflowState> | null = null;
      act(() => {
        restored = result.current.restoreMostRecentSession();
      });

      expect(restored).toEqual(restoredState);
    });

    it('calls onSessionRestored callback with state', () => {
      const restoredState: Partial<WorkflowState> = {
        currentStep: 'content-creation',
        session: {
          id: 'restored-session',
          startedAt: new Date(),
          currentStep: 'content-creation',
          items: [],
          currentItem: null,
        },
      };

      vi.mocked(sessionStorage.loadMostRecentWorkflowState).mockReturnValue(restoredState);
      vi.mocked(sessionStorage.getContentNeedingReUpload).mockReturnValue(2);

      const onSessionRestored = vi.fn();

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState(), { onSessionRestored })
      );

      act(() => {
        result.current.restoreMostRecentSession();
      });

      expect(onSessionRestored).toHaveBeenCalledWith(restoredState, 2);
    });

    it('reports content needing re-upload count', () => {
      const restoredState: Partial<WorkflowState> = {
        currentStep: 'content-creation',
        session: {
          id: 'restored-session',
          startedAt: new Date(),
          currentStep: 'content-creation',
          items: [],
          currentItem: null,
        },
      };

      vi.mocked(sessionStorage.loadMostRecentWorkflowState).mockReturnValue(restoredState);
      vi.mocked(sessionStorage.getContentNeedingReUpload).mockReturnValue(3);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      act(() => {
        result.current.restoreMostRecentSession();
      });

      expect(result.current.contentNeedingReUpload).toBe(3);
    });

    it('returns null when no sessions to recover', () => {
      vi.mocked(sessionStorage.loadMostRecentWorkflowState).mockReturnValue(null);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      let restored: Partial<WorkflowState> | null = null;
      act(() => {
        restored = result.current.restoreMostRecentSession();
      });

      expect(restored).toBeNull();
    });

    it('calls onNoSession callback when no sessions', () => {
      vi.mocked(sessionStorage.loadMostRecentWorkflowState).mockReturnValue(null);

      const onNoSession = vi.fn();

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState(), { onNoSession })
      );

      act(() => {
        result.current.restoreMostRecentSession();
      });

      expect(onNoSession).toHaveBeenCalled();
    });

    it('sets wasRestored state on successful restore', () => {
      const restoredState: Partial<WorkflowState> = {
        currentStep: 'content-creation',
        session: {
          id: 'restored-session',
          startedAt: new Date(),
          currentStep: 'content-creation',
          items: [],
          currentItem: null,
        },
      };

      vi.mocked(sessionStorage.loadMostRecentWorkflowState).mockReturnValue(restoredState);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      expect(result.current.wasRestored).toBe(false);

      act(() => {
        result.current.restoreMostRecentSession();
      });

      expect(result.current.wasRestored).toBe(true);
    });

    it('does not restore when storage unavailable', () => {
      vi.mocked(sessionStorage.isLocalStorageAvailable).mockReturnValue(false);

      const { result } = renderHook(() =>
        useSessionPersistence(createMockState())
      );

      let restored: Partial<WorkflowState> | null = null;
      act(() => {
        restored = result.current.restoreMostRecentSession();
      });

      expect(restored).toBeNull();
      expect(sessionStorage.loadMostRecentWorkflowState).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // clearSession Tests
  // ===========================================================================

  describe('clearSession', () => {
    it('clears current session from storage', () => {
      const state = createMockState();

      const { result } = renderHook(() => useSessionPersistence(state));

      act(() => {
        result.current.clearSession();
      });

      expect(sessionStorage.clearWorkflowState).toHaveBeenCalledWith('test-session-123');
    });

    it('handles storage unavailable gracefully', () => {
      vi.mocked(sessionStorage.isLocalStorageAvailable).mockReturnValue(false);

      const state = createMockState();

      const { result } = renderHook(() => useSessionPersistence(state));

      // Should not throw
      expect(() => {
        act(() => {
          result.current.clearSession();
        });
      }).not.toThrow();

      expect(sessionStorage.clearWorkflowState).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Session Completion Tests
  // ===========================================================================

  describe('session completion', () => {
    it('clears session when reaching session-summary', () => {
      const state1 = createMockState({ currentStep: 'next-action' });
      const state2 = createMockState({ currentStep: 'session-summary' });

      const { rerender } = renderHook(
        ({ state }) => useSessionPersistence(state),
        { initialProps: { state: state1 } }
      );

      // Transition to session-summary
      rerender({ state: state2 });

      expect(sessionStorage.clearWorkflowState).toHaveBeenCalledWith('test-session-123');
    });
  });

  // ===========================================================================
  // Session ID Change Tests
  // ===========================================================================

  describe('session ID changes', () => {
    it('clears old session when session ID changes', () => {
      const state1 = createMockState({
        session: {
          id: 'old-session',
          startedAt: new Date(),
          currentStep: 'room-selection',
          items: [],
          currentItem: null,
        },
      });

      const state2 = createMockState({
        session: {
          id: 'new-session',
          startedAt: new Date(),
          currentStep: 'room-selection',
          items: [],
          currentItem: null,
        },
      });

      const { rerender } = renderHook(
        ({ state }) => useSessionPersistence(state),
        { initialProps: { state: state1 } }
      );

      // Clear the initial calls
      vi.clearAllMocks();

      // Change to new session
      rerender({ state: state2 });

      expect(sessionStorage.clearWorkflowState).toHaveBeenCalledWith('old-session');
    });

    it('does not clear on initial render', () => {
      const state = createMockState();

      renderHook(() => useSessionPersistence(state));

      // clearWorkflowState should not be called on initial render
      // (it may be called for session-summary cleanup, so check specific call)
      expect(sessionStorage.clearWorkflowState).not.toHaveBeenCalledWith(
        expect.stringContaining('test-session-123')
      );
    });
  });

  // ===========================================================================
  // Debug Mode Tests
  // ===========================================================================

  describe('debug mode', () => {
    it('logs actions when debug is true', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const state = createMockState();

      const { result } = renderHook(() =>
        useSessionPersistence(state, { debug: true })
      );

      act(() => {
        result.current.saveNow();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[useSessionPersistence]',
        expect.anything(),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });

    it('does not log when debug is false', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const state = createMockState();

      const { result } = renderHook(() =>
        useSessionPersistence(state, { debug: false })
      );

      act(() => {
        result.current.saveNow();
      });

      // Check that no calls were made with our prefix
      const prefixedCalls = consoleSpy.mock.calls.filter(
        call => call[0] === '[useSessionPersistence]'
      );
      expect(prefixedCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });

  // ===========================================================================
  // Constants Tests
  // ===========================================================================

  describe('constants', () => {
    it('exports AUTO_SAVE_DEBOUNCE_MS', () => {
      expect(AUTO_SAVE_DEBOUNCE_MS).toBe(500);
    });
  });
});
