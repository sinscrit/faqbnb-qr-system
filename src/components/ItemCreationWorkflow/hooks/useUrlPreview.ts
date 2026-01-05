'use client';

/**
 * useUrlPreview - Hook for fetching and displaying URL previews
 *
 * This hook fetches Open Graph metadata from URLs via the existing /api/url-metadata
 * endpoint to display rich previews in the item creation workflow. It handles
 * loading, success, and error states, and supports proceeding without a preview
 * when metadata fetch fails.
 *
 * @module ItemCreationWorkflow/hooks/useUrlPreview
 * @see docs/REQ-104-url-content-with-preview-overview.md
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { UrlMetadata } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface UseUrlPreviewOptions {
  /** Timeout for fetch request in milliseconds (default: 8000 - matches API timeout) */
  timeout?: number;
  /** Debounce delay in milliseconds (default: 500) */
  debounceDelay?: number;
}

export type UrlPreviewStatus = 'idle' | 'loading' | 'success' | 'error';

/** Network connectivity status */
export type NetworkStatus = 'online' | 'offline' | 'unknown';

/** Information about network errors */
export interface NetworkErrorInfo {
  /** Whether the error is due to network connectivity */
  isNetworkError: boolean;
  /** Current network status */
  networkStatus: NetworkStatus;
}

export interface UseUrlPreviewReturn {
  /** Current preview data (null if not fetched yet or error) */
  data: UrlMetadata | null;
  /** Current status of the preview fetch */
  status: UrlPreviewStatus;
  /** Whether the preview is currently loading */
  isLoading: boolean;
  /** Whether the preview fetch succeeded */
  isSuccess: boolean;
  /** Whether the preview fetch failed */
  isError: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a fetch for a URL */
  fetchPreview: (url: string) => Promise<void>;
  /** Clear the current preview data */
  clearPreview: () => void;
  /** Whether it's safe to proceed (always true when valid URL entered) */
  canProceed: boolean;
  /** Whether a valid URL has been entered */
  hasValidUrl: boolean;
  /** The current URL being previewed */
  currentUrl: string;
  /** Whether the error is due to network connectivity */
  isNetworkError: boolean;
  /** Current network status */
  networkStatus: NetworkStatus;
  /** Retry the last fetch attempt */
  retry: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_TIMEOUT = 8000; // Match API route timeout
// Note: debounceDelay is available in options for future UI implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _DEFAULT_DEBOUNCE_DELAY = 500;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validates that a string is a properly formatted HTTP/HTTPS URL.
 * Provides client-side validation before making API request.
 */
function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;

  const trimmed = urlString.trim();
  if (trimmed.length === 0) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for fetching and managing URL preview data.
 *
 * Uses the existing /api/url-metadata endpoint to fetch Open Graph metadata
 * server-side, avoiding CORS issues. Handles loading, success, and error
 * states gracefully, and always allows proceeding with a valid URL.
 *
 * @param options - Configuration options
 * @returns Preview data, status, and control functions
 *
 * @example
 * const { data, isLoading, isError, fetchPreview, canProceed } = useUrlPreview();
 *
 * const handleUrlChange = (url: string) => {
 *   fetchPreview(url);
 * };
 *
 * // User can always proceed if URL is valid (even without preview)
 * if (canProceed) {
 *   onNext();
 * }
 */
export function useUrlPreview(options: UseUrlPreviewOptions = {}): UseUrlPreviewReturn {
  const { timeout = DEFAULT_TIMEOUT } = options;

  // State
  const [data, setData] = useState<UrlMetadata | null>(null);
  const [status, setStatus] = useState<UrlPreviewStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');

  // Refs for cleanup and abort handling
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);
  const lastUrlRef = useRef<string>('');

  // Network status detection effect
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };

    // Initial status
    updateNetworkStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Fetch preview data for a URL.
   * Aborts any existing request before starting a new one.
   */
  const fetchPreview = useCallback(async (url: string): Promise<void> => {
    // Skip if unmounted
    if (isUnmountedRef.current) return;

    // Validate URL client-side first
    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid URL (starting with http:// or https://)');
      setStatus('error');
      setCurrentUrl(trimmedUrl);
      setData(null);
      setIsNetworkError(false);
      return;
    }

    // Store URL for retry
    lastUrlRef.current = trimmedUrl;

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Set loading state
    setCurrentUrl(trimmedUrl);
    setStatus('loading');
    setError(null);
    setIsNetworkError(false);

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), timeout);
      });

      // Fetch from existing API route
      const fetchPromise = fetch('/api/url-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
        signal: abortControllerRef.current.signal,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Skip if unmounted or aborted
      if (isUnmountedRef.current) return;

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch preview');
      }

      setData(result.data);
      setStatus('success');
      setError(null);
      setIsNetworkError(false);

    } catch (err) {
      // Skip if unmounted
      if (isUnmountedRef.current) return;

      // Handle abort silently
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      // Detect network errors
      const isNetwork = !navigator.onLine ||
        (err instanceof TypeError && err.message === 'Failed to fetch') ||
        (err instanceof Error && err.message === 'Request timed out');

      setIsNetworkError(isNetwork);

      // Set error state but keep the URL
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
      setError(isNetwork ? 'Preview unavailable - Network issue' : errorMessage);
      setStatus('error');

      // Create minimal data with just the URL so user can still proceed
      setData({ url: trimmedUrl, title: '', domain: '', linkType: 'generic' });
    }
  }, [timeout]);

  /**
   * Clear preview data and reset state to idle.
   * Aborts any ongoing request.
   */
  const clearPreview = useCallback((): void => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setData(null);
    setStatus('idle');
    setError(null);
    setCurrentUrl('');
    setIsNetworkError(false);
    lastUrlRef.current = '';
  }, []);

  /**
   * Retry the last fetch attempt.
   * Useful when network connectivity is restored.
   */
  const retry = useCallback((): void => {
    if (lastUrlRef.current) {
      fetchPreview(lastUrlRef.current);
    }
  }, [fetchPreview]);

  // Computed values
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const hasValidUrl = isValidUrl(currentUrl);

  // User can always proceed if they have a valid URL (even without preview)
  const canProceed = hasValidUrl;

  return {
    data,
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    fetchPreview,
    clearPreview,
    canProceed,
    hasValidUrl,
    currentUrl,
    isNetworkError,
    networkStatus,
    retry,
  };
}

export default useUrlPreview;
