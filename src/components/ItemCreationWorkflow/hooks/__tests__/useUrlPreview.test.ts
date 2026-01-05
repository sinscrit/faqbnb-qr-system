/**
 * useUrlPreview Hook Tests
 *
 * @module ItemCreationWorkflow/hooks/__tests__/useUrlPreview
 * @lastModified 2026-01-05
 */

import { renderHook, act } from '@testing-library/react';
import { useUrlPreview } from '../useUrlPreview';

// Mock fetch
global.fetch = jest.fn();

describe('useUrlPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('returns idle status initially', () => {
      const { result } = renderHook(() => useUrlPreview());

      expect(result.current.status).toBe('idle');
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.currentUrl).toBe('');
      expect(result.current.hasValidUrl).toBe(false);
      expect(result.current.canProceed).toBe(false);
    });

    it('provides fetchPreview and clearPreview functions', () => {
      const { result } = renderHook(() => useUrlPreview());

      expect(typeof result.current.fetchPreview).toBe('function');
      expect(typeof result.current.clearPreview).toBe('function');
    });
  });

  // ===========================================================================
  // URL Validation Tests
  // ===========================================================================

  describe('URL Validation', () => {
    it('rejects empty URLs', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('');
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('valid URL');
    });

    it('rejects invalid URL format', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('not-a-url');
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('valid URL');
    });

    it('rejects javascript: protocol', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('javascript:alert(1)');
      });

      expect(result.current.status).toBe('error');
    });

    it('rejects file: protocol', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('file:///etc/passwd');
      });

      expect(result.current.status).toBe('error');
    });

    it('rejects data: protocol', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('data:text/html,<script>alert(1)</script>');
      });

      expect(result.current.status).toBe('error');
    });

    it('accepts valid HTTP URLs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'http://example.com', title: 'Example', domain: 'example.com', linkType: 'generic' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('http://example.com');
      });

      expect(result.current.status).toBe('success');
    });

    it('accepts valid HTTPS URLs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com', title: 'Example', domain: 'example.com', linkType: 'generic' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.status).toBe('success');
    });

    it('trims whitespace from URLs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com', title: 'Example', domain: 'example.com', linkType: 'generic' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('  https://example.com  ');
      });

      expect(result.current.status).toBe('success');
      expect(result.current.currentUrl).toBe('https://example.com');
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('sets loading status when fetch starts', async () => {
      let resolvePromise: (value: unknown) => void;
      (global.fetch as jest.Mock).mockReturnValueOnce(
        new Promise((resolve) => { resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useUrlPreview());

      act(() => {
        result.current.fetchPreview('https://example.com');
      });

      // Should be loading immediately
      expect(result.current.status).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.currentUrl).toBe('https://example.com');

      // Cleanup
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { url: 'https://example.com', title: 'Test', domain: 'example.com', linkType: 'generic' } }),
        });
      });
    });

    it('clears previous error when starting new fetch', async () => {
      // First fetch fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Failed' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.error).toBe('Failed');

      // Second fetch should clear error
      let resolvePromise: (value: unknown) => void;
      (global.fetch as jest.Mock).mockReturnValueOnce(
        new Promise((resolve) => { resolvePromise = resolve; })
      );

      act(() => {
        result.current.fetchPreview('https://other.com');
      });

      expect(result.current.error).toBeNull();

      // Cleanup
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { url: 'https://other.com', title: 'Test', domain: 'other.com', linkType: 'generic' } }),
        });
      });
    });
  });

  // ===========================================================================
  // Success State Tests
  // ===========================================================================

  describe('Success State', () => {
    it('sets success status and populates data on successful fetch', async () => {
      const mockData = {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'An example description',
        thumbnailUrl: 'https://example.com/image.jpg',
        faviconUrl: 'https://example.com/favicon.ico',
        domain: 'example.com',
        linkType: 'generic' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.status).toBe('success');
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.canProceed).toBe(true);
    });

    it('handles YouTube URLs with video metadata', async () => {
      const mockData = {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'YouTube Video',
        domain: 'youtube.com',
        linkType: 'youtube' as const,
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        faviconUrl: 'https://www.youtube.com/favicon.ico',
        youtubeVideoId: 'dQw4w9WgXcQ',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      });

      expect(result.current.data?.youtubeVideoId).toBe('dQw4w9WgXcQ');
      expect(result.current.data?.thumbnailUrl).toContain('youtube');
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe('Error State', () => {
    it('sets error status on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Failed to fetch URL' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.status).toBe('error');
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe('Failed to fetch URL');
    });

    it('still populates URL in data even on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Network error' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.data?.url).toBe('https://example.com');
    });

    it('allows proceeding even when preview fails (canProceed is true)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Failed' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.canProceed).toBe(true);
      expect(result.current.hasValidUrl).toBe(true);
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Network error');
    });

    it('handles timeout errors', async () => {
      // Mock a slow fetch that will be interrupted by timeout
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) => {
          // This will never resolve in time
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, data: {} }),
            });
          }, 20000);
        })
      );

      const { result } = renderHook(() => useUrlPreview({ timeout: 100 }));

      await act(async () => {
        const fetchPromise = result.current.fetchPreview('https://example.com');
        jest.advanceTimersByTime(200);
        await fetchPromise;
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('timed out');
    });
  });

  // ===========================================================================
  // Clear Preview Tests
  // ===========================================================================

  describe('Clear Preview', () => {
    it('resets all state to initial values', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com', title: 'Test', domain: 'example.com', linkType: 'generic' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.data).not.toBeNull();

      act(() => {
        result.current.clearPreview();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.status).toBe('idle');
      expect(result.current.error).toBeNull();
      expect(result.current.currentUrl).toBe('');
      expect(result.current.hasValidUrl).toBe(false);
      expect(result.current.canProceed).toBe(false);
    });

    it('clears error state', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Failed' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.error).toBe('Failed');

      act(() => {
        result.current.clearPreview();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ===========================================================================
  // Abort Handling Tests
  // ===========================================================================

  describe('Abort Handling', () => {
    it('aborts previous request when new request starts', async () => {
      const abortSpy = jest.fn();
      const originalAbortController = global.AbortController;

      global.AbortController = class MockAbortController {
        signal = { aborted: false };
        abort = abortSpy;
      } as unknown as typeof AbortController;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let _resolveFirst: (value: unknown) => void;
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) => { _resolveFirst = resolve; })
      );

      const { result } = renderHook(() => useUrlPreview());

      // Start first fetch
      act(() => {
        result.current.fetchPreview('https://first.com');
      });

      // Start second fetch (should abort first)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { url: 'https://second.com', title: 'Test', domain: 'second.com', linkType: 'generic' } }),
      });

      await act(async () => {
        await result.current.fetchPreview('https://second.com');
      });

      expect(abortSpy).toHaveBeenCalled();

      global.AbortController = originalAbortController;
    });

    it('handles AbortError silently without setting error state', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      // AbortError should not set error state
      expect(result.current.error).toBeNull();
    });

    it('aborts ongoing request when clearPreview is called', async () => {
      const abortSpy = jest.fn();
      const originalAbortController = global.AbortController;

      global.AbortController = class MockAbortController {
        signal = { aborted: false };
        abort = abortSpy;
      } as unknown as typeof AbortController;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let _resolvePromise: (value: unknown) => void;
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) => { _resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useUrlPreview());

      // Start fetch
      act(() => {
        result.current.fetchPreview('https://example.com');
      });

      // Clear preview (should abort)
      act(() => {
        result.current.clearPreview();
      });

      expect(abortSpy).toHaveBeenCalled();

      global.AbortController = originalAbortController;
    });
  });

  // ===========================================================================
  // hasValidUrl and canProceed Tests
  // ===========================================================================

  describe('hasValidUrl and canProceed', () => {
    it('hasValidUrl is true for valid URLs in currentUrl', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com', title: 'Test', domain: 'example.com', linkType: 'generic' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.hasValidUrl).toBe(true);
    });

    it('hasValidUrl is false for invalid URLs in currentUrl', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('not-a-url');
      });

      expect(result.current.hasValidUrl).toBe(false);
    });

    it('canProceed matches hasValidUrl', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com', title: 'Test', domain: 'example.com', linkType: 'generic' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      // Initially false
      expect(result.current.canProceed).toBe(false);

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      // After valid URL, true
      expect(result.current.canProceed).toBe(true);

      act(() => {
        result.current.clearPreview();
      });

      // After clear, false
      expect(result.current.canProceed).toBe(false);
    });
  });

  // ===========================================================================
  // Options Tests
  // ===========================================================================

  describe('Options', () => {
    it('uses custom timeout option', async () => {
      // Mock a slow fetch
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, data: {} }),
            });
          }, 5000);
        })
      );

      const { result } = renderHook(() => useUrlPreview({ timeout: 500 }));

      await act(async () => {
        const fetchPromise = result.current.fetchPreview('https://example.com');
        jest.advanceTimersByTime(600);
        await fetchPromise;
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('timed out');
    });
  });

  // ===========================================================================
  // Network Error Detection Tests (REQ-113)
  // ===========================================================================

  describe('Network Error Detection', () => {
    it('sets isNetworkError to true when fetch fails with TypeError', async () => {
      const typeError = new TypeError('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(typeError);

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.isNetworkError).toBe(true);
      expect(result.current.status).toBe('error');
    });

    it('sets isNetworkError to true when request times out', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, data: {} }),
            });
          }, 20000);
        })
      );

      const { result } = renderHook(() => useUrlPreview({ timeout: 100 }));

      await act(async () => {
        const fetchPromise = result.current.fetchPreview('https://example.com');
        jest.advanceTimersByTime(200);
        await fetchPromise;
      });

      expect(result.current.isNetworkError).toBe(true);
      expect(result.current.error).toContain('Network issue');
    });

    it('clears isNetworkError on successful retry', async () => {
      // First fetch fails with network error
      const typeError = new TypeError('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(typeError);

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.isNetworkError).toBe(true);

      // Second fetch succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com', title: 'Test', domain: 'example.com', linkType: 'generic' },
        }),
      });

      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.isNetworkError).toBe(false);
      expect(result.current.status).toBe('success');
    });

    it('retry function refetches the last URL', async () => {
      // First fetch fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Failed' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com/specific-url');
      });

      // Second fetch succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com/specific-url', title: 'Test', domain: 'example.com', linkType: 'generic' },
        }),
      });

      await act(async () => {
        await result.current.retry();
      });

      // Check that the correct URL was used
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/url-metadata',
        expect.objectContaining({
          body: JSON.stringify({ url: 'https://example.com/specific-url' }),
        })
      );
    });

    it('retry does nothing when no URL has been fetched', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.retry();
      });

      // fetch should not have been called
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Network Status Detection Tests (REQ-113)
  // ===========================================================================

  describe('Network Status Detection', () => {
    const originalNavigator = global.navigator;

    beforeEach(() => {
      // Reset navigator.onLine to true
      Object.defineProperty(global.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(global.navigator, 'onLine', {
        value: originalNavigator.onLine,
        writable: true,
        configurable: true,
      });
    });

    it('initializes networkStatus to online when navigator.onLine is true', () => {
      Object.defineProperty(global.navigator, 'onLine', { value: true, configurable: true });

      const { result } = renderHook(() => useUrlPreview());

      // May need to wait for effect
      expect(result.current.networkStatus).toBe('online');
    });

    it('sets isNetworkError when navigator.onLine is false during fetch', async () => {
      // Set offline
      Object.defineProperty(global.navigator, 'onLine', { value: false, configurable: true });

      // Mock fetch to fail with TypeError (typical offline behavior)
      const typeError = new TypeError('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(typeError);

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.isNetworkError).toBe(true);
    });

    it('isNetworkError is false for non-network errors', async () => {
      // Mock fetch to fail with a server error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Internal server error' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.isNetworkError).toBe(false);
      expect(result.current.status).toBe('error');
    });

    it('clears isNetworkError when clearPreview is called', async () => {
      // First fetch fails with network error
      const typeError = new TypeError('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(typeError);

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.isNetworkError).toBe(true);

      act(() => {
        result.current.clearPreview();
      });

      expect(result.current.isNetworkError).toBe(false);
    });
  });
});
