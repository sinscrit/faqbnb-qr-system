/**
 * useItemAnalytics Hook Tests
 * @lastModified 2026-01-05 (REQ-091)
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useItemAnalytics } from '../useItemAnalytics';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockReactionsResponse = {
  success: true,
  data: { like: 5, love: 2, dislike: 0, confused: 1, total: 8 },
};

const mockAnalyticsResponse = {
  success: true,
  data: {
    last24Hours: 10,
    last7Days: 50,
    last30Days: 100,
    last365Days: 500,
    allTime: 1000,
  },
};

describe('useItemAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches analytics for provided item IDs', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReactionsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsResponse),
      });

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        authToken: 'test-token',
        pollingInterval: 0, // Disable polling for test
      })
    );

    await waitFor(() => {
      expect(result.current.analyticsMap.size).toBe(1);
    });

    const analytics = result.current.getAnalytics('test-id-1');
    expect(analytics?.reactions?.total).toBe(8);
    expect(analytics?.visitStats?.allTime).toBe(1000);
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        pollingInterval: 0,
      })
    );

    await waitFor(() => {
      const analytics = result.current.getAnalytics('test-id-1');
      expect(analytics?.error).toBeTruthy();
    });
  });

  it('respects cache TTL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReactionsResponse),
    });

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        cacheTTL: 5000,
        pollingInterval: 0,
      })
    );

    await waitFor(() => {
      expect(result.current.analyticsMap.size).toBe(1);
    });

    // First fetch completed
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Try to fetch again - should use cache
    await act(async () => {
      await result.current.fetchAnalytics('test-id-1');
    });

    // Should still be 1 call (cached)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('clears cache correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReactionsResponse),
    });

    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        pollingInterval: 0,
      })
    );

    await waitFor(() => {
      expect(result.current.analyticsMap.size).toBe(1);
    });

    act(() => {
      result.current.clearCache('test-id-1');
    });

    expect(result.current.analyticsMap.size).toBe(0);
  });

  it('does not fetch when disabled', async () => {
    const { result } = renderHook(() =>
      useItemAnalytics({
        itemIds: ['test-id-1'],
        enabled: false,
      })
    );

    // Wait a bit to ensure no fetches happen
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.analyticsMap.size).toBe(0);
  });
});
