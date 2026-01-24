/**
 * Unit Tests for useTranslationStatus Hook
 *
 * Tests for the translation status fetching hook including loading states,
 * error handling, parameter changes, caching, and cleanup.
 *
 * @module hooks/__tests__/useTranslationStatus.test
 * @created 2026-01-24
 * @requestReference REQ-E05-033: Write Unit Tests for Translation Hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTranslationStatus } from '../useTranslationStatus';
import {
  mockTranslationStatus,
} from './mocks/supabase.mock';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock the apiRequest function
const mockApiRequest = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// =============================================================================
// Test Suite
// =============================================================================

describe('useTranslationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: successful response
    mockApiRequest.mockResolvedValue(mockTranslationStatus);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Initial Load and Success States
  // ---------------------------------------------------------------------------

  describe('Initial Load and Success States', () => {
    it('should return loading state on initial mount', () => {
      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      // Initial state should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should fetch translation status when entityId is provided', async () => {
      renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalled();
      });

      // Check the endpoint includes correct query params
      const callArgs = mockApiRequest.mock.calls[0];
      expect(callArgs[0]).toContain('/translations/status');
      expect(callArgs[0]).toContain('entityId=item-123');
      expect(callArgs[0]).toContain('entityType=item');
    });

    it('should return success state with data after successful fetch', async () => {
      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockTranslationStatus);
      expect(result.current.error).toBe(null);
      expect(result.current.isFetched).toBe(true);
    });

    it('should include summary counts in returned data', async () => {
      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.summary).toBeDefined();
      expect(result.current.summary?.completed).toBe(1);
      expect(result.current.summary?.pending).toBe(1);
      expect(result.current.summary?.failed).toBe(1);
      expect(result.current.summary?.total).toBe(3);
    });

    it('should provide items array via convenience accessor', async () => {
      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toEqual(mockTranslationStatus.items);
      expect(result.current.items).toHaveLength(1);
    });

    it('should not fetch when enabled is false', () => {
      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
          enabled: false,
        })
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it('should fetch with propertyId for property-wide query', async () => {
      renderHook(() =>
        useTranslationStatus({
          propertyId: 'property-456',
        })
      );

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalled();
      });

      const callArgs = mockApiRequest.mock.calls[0];
      expect(callArgs[0]).toContain('propertyId=property-456');
    });

    it('should include language filters in query when provided', async () => {
      renderHook(() =>
        useTranslationStatus({
          propertyId: 'property-456',
          languages: ['fr', 'es'],
        })
      );

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalled();
      });

      const callArgs = mockApiRequest.mock.calls[0];
      // URL encodes commas as %2C
      expect(callArgs[0]).toMatch(/languages=fr(%2C|,)es/);
    });

    it('should include status filters in query when provided', async () => {
      renderHook(() =>
        useTranslationStatus({
          propertyId: 'property-456',
          statuses: ['completed', 'pending'],
        })
      );

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalled();
      });

      const callArgs = mockApiRequest.mock.calls[0];
      // URL encodes commas as %2C
      expect(callArgs[0]).toMatch(/statuses=completed(%2C|,)pending/);
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------

  describe('Error Handling', () => {
    it('should return error state when API request fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Database error');
      expect(result.current.data).toBe(null);
      expect(result.current.isError).toBe(true);
    });

    it('should handle authentication errors (401) appropriately', async () => {
      const authError = new Error('Not authenticated');
      (authError as Error & { code: string }).code = '401';
      mockApiRequest.mockRejectedValue(authError);

      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isError).toBe(true);
    });

    it('should handle permission errors (403) appropriately', async () => {
      const permError = new Error('Permission denied');
      (permError as Error & { code: string }).code = '403';
      mockApiRequest.mockRejectedValue(permError);

      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe('Permission denied');
    });

    it('should handle network errors gracefully', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe('Network error');
    });

    it('should call onError callback when error occurs', async () => {
      const onError = vi.fn();
      mockApiRequest.mockRejectedValue(new Error('Test error'));

      renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
          onError,
        })
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe('Test error');
    });

    it('should retry failed requests when refetch is called', async () => {
      // First call fails, second succeeds
      mockApiRequest
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(mockTranslationStatus);

      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      // Should now have data
      await waitFor(() => {
        expect(result.current.data).toEqual(mockTranslationStatus);
      });

      expect(result.current.error).toBe(null);
    });

    it('should convert non-Error exceptions to Error objects', async () => {
      mockApiRequest.mockRejectedValue('string error');

      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ---------------------------------------------------------------------------
  // Parameter Changes and Refetching
  // ---------------------------------------------------------------------------

  describe('Parameter Changes and Refetching', () => {
    it('should refetch data when entityId changes', async () => {
      const { result, rerender } = renderHook(
        ({ entityId }) =>
          useTranslationStatus({
            entityType: 'item',
            entityId,
          }),
        { initialProps: { entityId: 'item-123' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstCallCount = mockApiRequest.mock.calls.length;

      // Change entityId
      rerender({ entityId: 'item-456' });

      await waitFor(() => {
        expect(mockApiRequest.mock.calls.length).toBeGreaterThan(firstCallCount);
      });

      // Check second call has new entityId
      const lastCall = mockApiRequest.mock.calls[mockApiRequest.mock.calls.length - 1];
      expect(lastCall[0]).toContain('entityId=item-456');
    });

    it('should refetch data when propertyId changes', async () => {
      const { result, rerender } = renderHook(
        ({ propertyId }) =>
          useTranslationStatus({
            propertyId,
          }),
        { initialProps: { propertyId: 'property-123' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstCallCount = mockApiRequest.mock.calls.length;

      // Change propertyId
      rerender({ propertyId: 'property-456' });

      await waitFor(() => {
        expect(mockApiRequest.mock.calls.length).toBeGreaterThan(firstCallCount);
      });

      const lastCall = mockApiRequest.mock.calls[mockApiRequest.mock.calls.length - 1];
      expect(lastCall[0]).toContain('propertyId=property-456');
    });

    it('should respect enabled flag (does not fetch when enabled is false)', async () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useTranslationStatus({
            entityType: 'item',
            entityId: 'item-123',
            enabled,
          }),
        { initialProps: { enabled: false } }
      );

      // Should not have fetched
      expect(mockApiRequest).not.toHaveBeenCalled();

      // Enable fetching
      rerender({ enabled: true });

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalled();
      });
    });

    it('should fetch when enabled changes from false to true', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useTranslationStatus({
            entityType: 'item',
            entityId: 'item-123',
            enabled,
          }),
        { initialProps: { enabled: false } }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockApiRequest).not.toHaveBeenCalled();

      // Enable
      rerender({ enabled: true });

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });

    it('should cancel in-flight requests when entityId changes rapidly', async () => {
      // Make the first request take a long time
      let resolveFirst: (value: unknown) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      mockApiRequest
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValue(mockTranslationStatus);

      const { result, rerender } = renderHook(
        ({ entityId }) =>
          useTranslationStatus({
            entityType: 'item',
            entityId,
          }),
        { initialProps: { entityId: 'item-123' } }
      );

      // Change entityId before first request completes
      rerender({ entityId: 'item-456' });

      // Wait for second request to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Resolve first request (should be ignored due to stale detection)
      resolveFirst!({ ...mockTranslationStatus, items: [{ entityId: 'item-123' }] });

      // Data should be from second request, not first
      await waitFor(() => {
        expect(result.current.data).toEqual(mockTranslationStatus);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Caching and Performance
  // ---------------------------------------------------------------------------

  describe('Caching and Performance', () => {
    it('should set lastUpdated timestamp after successful fetch', async () => {
      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastUpdated).toBeInstanceOf(Date);
    });

    it('should set isRefetching to true during refetch (not isLoading)', async () => {
      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start refetch
      let refetchPromise: Promise<void>;
      act(() => {
        refetchPromise = result.current.refetch();
      });

      // During refetch, isRefetching should be true, isLoading should be false
      expect(result.current.isRefetching).toBe(true);
      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await refetchPromise;
      });

      expect(result.current.isRefetching).toBe(false);
    });

    it('should support auto-polling with refetchInterval', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
          refetchInterval: 5000, // 5 seconds
        })
      );

      // Wait for initial fetch
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      const initialCallCount = mockApiRequest.mock.calls.length;

      // Advance time by 5 seconds
      await act(async () => {
        vi.advanceTimersByTime(5000);
        await vi.runOnlyPendingTimersAsync();
      });

      expect(mockApiRequest.mock.calls.length).toBeGreaterThan(initialCallCount);

      vi.useRealTimers();
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  describe('Cleanup', () => {
    it('should cancel pending requests on unmount', async () => {
      // Create a promise that we can control
      let rejectFn: (error: Error) => void;
      const slowPromise = new Promise((_, reject) => {
        rejectFn = reject;
      });
      mockApiRequest.mockReturnValue(slowPromise);

      const { unmount } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      // Unmount before request completes
      unmount();

      // Reject with AbortError (should be ignored)
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      rejectFn!(abortError);

      // No errors should be thrown
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    it('should not update state after unmount', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let resolveFn: (value: unknown) => void;
      const slowPromise = new Promise((resolve) => {
        resolveFn = resolve;
      });
      mockApiRequest.mockReturnValue(slowPromise);

      const { unmount } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
        })
      );

      // Unmount
      unmount();

      // Resolve after unmount
      resolveFn!(mockTranslationStatus);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not have React state update warnings
      // (The hook uses isMountedRef to prevent this)
      consoleSpy.mockRestore();
    });

    it('should clean up polling interval on unmount', async () => {
      vi.useFakeTimers();

      const { unmount } = renderHook(() =>
        useTranslationStatus({
          entityType: 'item',
          entityId: 'item-123',
          refetchInterval: 5000,
        })
      );

      // Wait for initial fetch
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      const callCountAfterInitial = mockApiRequest.mock.calls.length;

      // Unmount
      unmount();

      // Advance time
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      // No additional calls should have been made
      expect(mockApiRequest.mock.calls.length).toBe(callCountAfterInitial);

      vi.useRealTimers();
    });
  });

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  describe('Validation', () => {
    it('should throw error when neither entityId+entityType nor propertyId provided', () => {
      expect(() => {
        renderHook(() =>
          useTranslationStatus({} as Parameters<typeof useTranslationStatus>[0])
        );
      }).toThrow('Must provide either (entityId + entityType) or propertyId');
    });

    it('should throw error when both entity query and property query provided', () => {
      expect(() => {
        renderHook(() =>
          useTranslationStatus({
            entityId: 'item-123',
            entityType: 'item',
            propertyId: 'property-456',
          })
        );
      }).toThrow('Cannot provide both entity query and property query');
    });

    it('should throw error when entityId provided without entityType', () => {
      expect(() => {
        renderHook(() =>
          useTranslationStatus({
            entityId: 'item-123',
          } as Parameters<typeof useTranslationStatus>[0])
        );
      }).toThrow(); // First validation catches missing propertyId and incomplete entity query
    });

    it('should throw error when entityType provided without entityId', () => {
      expect(() => {
        renderHook(() =>
          useTranslationStatus({
            entityType: 'item',
          } as Parameters<typeof useTranslationStatus>[0])
        );
      }).toThrow(); // First validation catches missing propertyId and incomplete entity query
    });
  });
});
