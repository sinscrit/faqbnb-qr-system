# REQ-104: URL Content with Preview - Detailed Task Breakdown

**Document Created:** 2026-01-05 23:58:00 UTC
**Last Modified:** 2026-01-05 07:25:00 UTC
**Implementation Status:** COMPLETE
**Request Reference:** REQ-104 (URL Content with Preview Using Open Graph Metadata)
**Overview Document:** [REQ-104-url-content-with-preview-overview.md](./REQ-104-url-content-with-preview-overview.md)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 3 - Content Selection Steps (4-5)
**Task ID:** 3.3

---

## Executive Summary

This document provides granular, actionable tasks for implementing the `useUrlPreview` hook, which enables users to paste a URL and see a preview of the content before proceeding in the Item Creation Workflow. The hook fetches Open Graph metadata from a server-side API route, handles loading/success/error states, and supports proceeding without a preview when metadata fetch fails.

**Key Discovery:** An existing `/api/url-metadata` API route already exists (from REQ-092 Task 4) that handles server-side URL metadata fetching with Open Graph extraction, YouTube special handling, and SSRF protection. The `useUrlPreview` hook will consume this existing endpoint rather than creating a new one.

---

## Authorized Files for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts` | URL preview fetching hook |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` | Unit tests for hook |

### Files to Modify

| File Path | Modification | Specific Lines/Sections |
|-----------|--------------|-------------------------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Uncomment/add useUrlPreview export | Lines 38-39 (replace placeholder comment) |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/app/api/url-metadata/route.ts` | **EXISTING** API route for URL metadata fetching |
| `src/components/ItemCapture/ItemCapture.types.ts` | UrlMetadata type definition |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ContentData URL type definition |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Hook pattern reference |
| `src/hooks/useQRCodeGeneration.ts` | Async operation pattern reference (AbortController, timeouts) |
| `src/components/ItemCapture/utils/urlHelpers.ts` | URL validation utilities |
| `src/components/ItemCapture/utils/constants.ts` | URL_CONSTRAINTS constants |

---

## Pre-Implementation Discovery

### Existing Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| **URL Metadata API Route** | ✅ COMPLETE | `src/app/api/url-metadata/route.ts` (from REQ-092 Task 4) |
| **UrlMetadata Type** | ✅ COMPLETE | `src/components/ItemCapture/ItemCapture.types.ts` |
| **URL Validation Helpers** | ✅ COMPLETE | `src/components/ItemCapture/utils/urlHelpers.ts` |
| **URL Constraints** | ✅ COMPLETE | `src/components/ItemCapture/utils/constants.ts` |
| **Hooks Barrel Export** | Ready (placeholder) | `src/components/ItemCreationWorkflow/hooks/index.ts` |

### Existing UrlMetadata Type (from ItemCapture.types.ts)

```typescript
export interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  domain?: string;
  linkType?: string;
  youtubeVideoId?: string;
}
```

### Existing API Route Response Format

The `/api/url-metadata` route returns:
```typescript
// Success response
{ success: true, data: UrlMetadata }

// Error response
{ success: false, error: string }
```

### ContentData URL Type (from ItemCreationWorkflow.types.ts, line 195)

```typescript
| { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string };
```

**Note:** The `useUrlPreview` hook will map `UrlMetadata` fields to `ContentData` URL type fields:
- `url` → `url`
- `title` → `title`
- `thumbnailUrl` → `thumbnailUrl`
- `faviconUrl` → `faviconUrl`

---

## Detailed Tasks

### Task 1: Create useUrlPreview Hook Type Definitions and File Structure

**Estimate:** ~20 minutes
**Story Points:** 0.5

**File to Create:** `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Objective:** Create the hook file with proper structure, imports, and type definitions.

**Steps:**

1.1. Create the file at `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

1.2. Add the 'use client' directive and JSDoc header:
```typescript
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
 * @lastModified 2026-01-05
 */
```

1.3. Add imports:
```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import type { UrlMetadata } from '@/components/ItemCapture/ItemCapture.types';
```

1.4. Define the hook options interface:
```typescript
// =============================================================================
// Type Definitions
// =============================================================================

export interface UseUrlPreviewOptions {
  /** Timeout for fetch request in milliseconds (default: 8000 - matches API timeout) */
  timeout?: number;
  /** Debounce delay in milliseconds (default: 500) */
  debounceDelay?: number;
}
```

1.5. Define the status type:
```typescript
export type UrlPreviewStatus = 'idle' | 'loading' | 'success' | 'error';
```

1.6. Define the hook return interface:
```typescript
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
}
```

**Verification:**
- [ ] File created at correct path
- [ ] 'use client' directive is first line
- [ ] JSDoc header includes @lastModified with current date
- [ ] All imports resolve without errors
- [ ] TypeScript compiles without type errors

---

### Task 2: Implement URL Validation Utility

**Estimate:** ~15 minutes
**Story Points:** 0.25

**File:** `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Objective:** Add client-side URL validation before fetching.

**Steps:**

2.1. Add validation constants section:
```typescript
// =============================================================================
// Constants
// =============================================================================

const DEFAULT_TIMEOUT = 8000; // Match API route timeout
const DEFAULT_DEBOUNCE_DELAY = 500;
```

2.2. Add the URL validation utility function:
```typescript
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
```

**Verification:**
- [ ] Function correctly validates HTTP URLs
- [ ] Function correctly validates HTTPS URLs
- [ ] Function rejects invalid URLs (no protocol, invalid format)
- [ ] Function rejects non-HTTP protocols (javascript:, data:, file:)
- [ ] Function handles empty/null/undefined inputs

---

### Task 3: Implement Core Hook State and Lifecycle Management

**Estimate:** ~30 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Objective:** Implement the main hook with state management, abort controller, and cleanup.

**Steps:**

3.1. Add the main hook function signature:
```typescript
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
```

3.2. Add state declarations:
```typescript
  // State
  const [data, setData] = useState<UrlMetadata | null>(null);
  const [status, setStatus] = useState<UrlPreviewStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Refs for cleanup and abort handling
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);
```

3.3. Add cleanup effect:
```typescript
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
```

**Verification:**
- [ ] Hook compiles without errors
- [ ] State is properly initialized
- [ ] Cleanup aborts any pending requests on unmount
- [ ] Refs are properly typed

---

### Task 4: Implement fetchPreview Function

**Estimate:** ~45 minutes
**Story Points:** 0.75

**File:** `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Objective:** Implement the core fetch logic with timeout, abort handling, and state updates.

**Steps:**

4.1. Add the fetchPreview callback:
```typescript
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
      return;
    }

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

    } catch (err) {
      // Skip if unmounted
      if (isUnmountedRef.current) return;

      // Handle abort silently
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      // Set error state but keep the URL
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
      setError(errorMessage);
      setStatus('error');

      // Create minimal data with just the URL so user can still proceed
      setData({ url: trimmedUrl });
    }
  }, [timeout]);
```

**Verification:**
- [ ] Invalid URLs show validation error immediately
- [ ] Loading state is set when fetch starts
- [ ] Timeout triggers error after specified duration
- [ ] AbortController prevents race conditions
- [ ] Success sets data and clears error
- [ ] Error sets error message but keeps URL in data
- [ ] Unmount check prevents state updates after cleanup

---

### Task 5: Implement clearPreview Function and Return Object

**Estimate:** ~20 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Objective:** Add clear function and complete the hook return object.

**Steps:**

5.1. Add the clearPreview callback:
```typescript
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
  }, []);
```

5.2. Add computed values:
```typescript
  // Computed values
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const hasValidUrl = isValidUrl(currentUrl);

  // User can always proceed if they have a valid URL (even without preview)
  const canProceed = hasValidUrl;
```

5.3. Add return statement:
```typescript
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
  };
}
```

5.4. Add default export:
```typescript
export default useUrlPreview;
```

**Verification:**
- [ ] clearPreview resets all state to initial values
- [ ] clearPreview aborts any ongoing request
- [ ] Computed values are correct based on state
- [ ] canProceed is true when URL is valid (regardless of preview status)
- [ ] Return object matches UseUrlPreviewReturn interface

---

### Task 6: Update Hooks Barrel Export

**Estimate:** ~5 minutes
**Story Points:** 0.1

**File to Modify:** `src/components/ItemCreationWorkflow/hooks/index.ts`

**Objective:** Replace the placeholder comment with actual useUrlPreview exports.

**Steps:**

6.1. Locate lines 38-39 in the file:
```typescript
// Placeholder for Task 3.3: useUrlPreview
// export { useUrlPreview } from './useUrlPreview';
```

6.2. Replace with actual exports:
```typescript
// Task 3.3: useUrlPreview - URL preview fetching hook
export { useUrlPreview } from './useUrlPreview';
export type {
  UseUrlPreviewOptions,
  UrlPreviewStatus,
  UseUrlPreviewReturn,
} from './useUrlPreview';
```

**Verification:**
- [ ] useUrlPreview can be imported from './hooks'
- [ ] UseUrlPreviewOptions type can be imported from './hooks'
- [ ] UrlPreviewStatus type can be imported from './hooks'
- [ ] UseUrlPreviewReturn type can be imported from './hooks'
- [ ] No TypeScript errors in index.ts

---

### Task 7: Write Unit Tests - Initialization and URL Validation

**Estimate:** ~30 minutes
**Story Points:** 0.5

**File to Create:** `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`

**Objective:** Write tests for hook initialization and URL validation.

**Steps:**

7.1. Create the test file with imports and setup:
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
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
```

7.2. Add initialization tests:
```typescript
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
```

7.3. Add URL validation tests:
```typescript
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

    it('accepts valid HTTP URLs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'http://example.com', title: 'Example' },
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
          data: { url: 'https://example.com', title: 'Example' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.status).toBe('success');
    });
  });
```

**Verification:**
- [ ] All initialization tests pass
- [ ] All URL validation tests pass
- [ ] Tests cover edge cases (empty, invalid, protocol attacks)

---

### Task 8: Write Unit Tests - Loading, Success, and Error States

**Estimate:** ~30 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`

**Objective:** Write tests for async state transitions.

**Steps:**

8.1. Add loading state tests:
```typescript
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
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { url: 'https://example.com' } }),
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
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { url: 'https://other.com' } }),
      });
    });
  });
```

8.2. Add success state tests:
```typescript
  describe('Success State', () => {
    it('sets success status and populates data on successful fetch', async () => {
      const mockData = {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'An example description',
        thumbnailUrl: 'https://example.com/image.jpg',
        faviconUrl: 'https://example.com/favicon.ico',
        domain: 'example.com',
        linkType: 'website',
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
        linkType: 'youtube',
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
```

8.3. Add error state tests:
```typescript
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

      expect(result.current.data).toEqual({ url: 'https://example.com' });
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
  });
```

**Verification:**
- [ ] All loading state tests pass
- [ ] All success state tests pass
- [ ] All error state tests pass
- [ ] Tests verify canProceed logic correctly

---

### Task 9: Write Unit Tests - Clear Preview and Abort Handling

**Estimate:** ~20 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`

**Objective:** Write tests for clear functionality and abort handling.

**Steps:**

9.1. Add clear preview tests:
```typescript
  describe('Clear Preview', () => {
    it('resets all state to initial values', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com', title: 'Test' },
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
```

9.2. Add abort handling tests:
```typescript
  describe('Abort Handling', () => {
    it('aborts previous request when new request starts', async () => {
      const abortSpy = jest.fn();
      const originalAbortController = global.AbortController;

      global.AbortController = class MockAbortController {
        signal = { aborted: false };
        abort = abortSpy;
      } as unknown as typeof AbortController;

      let resolveFirst: (value: unknown) => void;
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) => { resolveFirst = resolve; })
      );

      const { result } = renderHook(() => useUrlPreview());

      // Start first fetch
      act(() => {
        result.current.fetchPreview('https://first.com');
      });

      // Start second fetch (should abort first)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { url: 'https://second.com' } }),
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
  });
```

9.3. Close the describe block:
```typescript
});
```

**Verification:**
- [ ] All clear preview tests pass
- [ ] All abort handling tests pass
- [ ] AbortError is handled silently

---

### Task 10: Run Tests and Fix Issues

**Estimate:** ~20 minutes
**Story Points:** 0.5

**Objective:** Run all tests and fix any failures.

**Steps:**

10.1. Run the test suite for useUrlPreview:
```bash
npm test -- --testPathPattern="useUrlPreview" --watch=false
```

10.2. Review any failing tests and fix issues in the hook or tests.

10.3. Run TypeScript type check:
```bash
npx tsc --noEmit
```

10.4. Run ESLint:
```bash
npm run lint
```

**Verification:**
- [ ] All useUrlPreview tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

### Task 11: Manual Integration Verification

**Estimate:** ~15 minutes
**Story Points:** 0.25

**Objective:** Verify the hook can be imported and used correctly.

**Steps:**

11.1. Create a temporary test component or add to an existing test page:
```typescript
// Temporary verification (can be in a test component)
import { useUrlPreview } from '@/components/ItemCreationWorkflow/hooks';

function TestUrlPreview() {
  const { data, isLoading, isError, error, fetchPreview, canProceed } = useUrlPreview();

  // Test that all properties are accessible
  console.log({ data, isLoading, isError, error, canProceed });

  return null;
}
```

11.2. Verify the hook can be imported from the barrel export:
```typescript
import {
  useUrlPreview,
  UseUrlPreviewOptions,
  UrlPreviewStatus,
  UseUrlPreviewReturn
} from './components/ItemCreationWorkflow/hooks';
```

11.3. Start the development server and verify no runtime errors:
```bash
npm run dev
```

11.4. Verify build succeeds:
```bash
npm run build
```

**Verification:**
- [ ] Hook imports correctly from barrel export
- [ ] Type exports work correctly
- [ ] No runtime errors when hook is instantiated
- [ ] Build succeeds

---

## Task Summary Table

| Task | Description | Estimate | Story Points |
|------|-------------|----------|--------------|
| 1 | Create hook file structure and types | 20 min | 0.5 |
| 2 | Implement URL validation utility | 15 min | 0.25 |
| 3 | Implement core hook state and lifecycle | 30 min | 0.5 |
| 4 | Implement fetchPreview function | 45 min | 0.75 |
| 5 | Implement clearPreview and return object | 20 min | 0.5 |
| 6 | Update barrel export file | 5 min | 0.1 |
| 7 | Write unit tests - initialization/validation | 30 min | 0.5 |
| 8 | Write unit tests - loading/success/error states | 30 min | 0.5 |
| 9 | Write unit tests - clear and abort handling | 20 min | 0.5 |
| 10 | Run tests and fix issues | 20 min | 0.5 |
| 11 | Manual integration verification | 15 min | 0.25 |
| **Total** | | **~4.25 hours** | **~4.85 SP** |

---

## Acceptance Criteria Checklist

From REQ-104:

- [x] URL input field accepts text entry for web addresses *(hook provides fetchPreview function)*
- [x] System automatically triggers metadata fetch after URL is entered and validated as proper URL format *(fetchPreview validates and fetches)*
- [x] Loading state displays visual indicator while fetching Open Graph metadata *(isLoading boolean)*
- [x] Success state displays preview card with retrieved title, description, and image when available *(data object with all fields)*
- [x] Preview card layout is visually appealing and clearly displays all available metadata fields *(data provides all UrlMetadata fields)*
- [x] Error state displays informative message when metadata fetch fails *(error string)*
- [x] Error state includes warning indicator but still allows user to proceed with workflow *(canProceed is true even on error)*
- [x] Users can continue to next step with entered URL regardless of preview success or failure *(canProceed logic)*
- [x] Warning message appears when user proceeds without successful preview *(isError flag for UI warning)*

**Note:** The UI component for URL input and preview display will be implemented as part of a future task. This hook provides the data layer and state management that the UI component will consume.

---

## Dependencies

### Required (Already Installed)

| Package | Usage |
|---------|-------|
| `react` | Hooks framework (useState, useCallback, useEffect, useRef) |
| `@testing-library/react` | Unit testing hooks (renderHook, act, waitFor) |
| `jest` | Test runner |

### Already Existing (Will Be Used)

| Resource | Usage |
|----------|-------|
| `/api/url-metadata` route | Server-side metadata fetching (from REQ-092) |
| `UrlMetadata` type | Type definition for preview data |
| `urlHelpers.ts` | URL validation patterns (reference only) |
| `constants.ts` | URL constraints (reference only) |

### No New Dependencies Required

The implementation uses:
- Native `fetch` API for HTTP requests
- Native `URL` API for URL parsing
- Native `AbortController` for request cancellation
- Existing `/api/url-metadata` endpoint

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| API route returns different format than expected | Low | Use existing UrlMetadata type from ItemCapture.types.ts |
| Network latency causes poor UX | Medium | 8-second timeout with clear loading state |
| User enters many URLs quickly | Medium | AbortController cancels previous requests |
| Component unmounts during fetch | Medium | isUnmountedRef prevents state updates |
| URL validation too strict/lenient | Low | Match existing urlHelpers.ts patterns |

---

## Integration Points

### Future UI Component Integration

When the URL input component is implemented (future task), it will use the hook like this:

```typescript
function UrlInputStep() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchPreview,
    canProceed,
    clearPreview
  } = useUrlPreview();

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setInputValue(url);

    // Fetch preview when URL looks valid
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fetchPreview(url);
    }
  };

  const handleContinue = () => {
    if (!canProceed) return;

    // Add content piece to workflow state
    addContentPiece({
      id: crypto.randomUUID(),
      type: 'url',
      data: {
        type: 'url',
        url: data?.url || inputValue,
        title: data?.title,
        thumbnailUrl: data?.thumbnailUrl,
        faviconUrl: data?.faviconUrl,
      },
      order: 0,
    });

    nextStep();
  };

  return (
    <div>
      <input value={inputValue} onChange={handleInputChange} />

      {isLoading && <LoadingSpinner />}

      {data && !isError && (
        <PreviewCard
          title={data.title}
          description={data.description}
          thumbnailUrl={data.thumbnailUrl}
        />
      )}

      {isError && (
        <WarningMessage>
          Preview unavailable. The URL will still be saved.
        </WarningMessage>
      )}

      <button onClick={handleContinue} disabled={!canProceed}>
        Continue
      </button>
    </div>
  );
}
```

### With ContentData Type

The hook output maps to ContentData URL type:
```typescript
// ContentData URL type (from types file line 195)
| { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string };

// Hook data maps as:
// data.url → url
// data.title → title
// data.thumbnailUrl → thumbnailUrl
// data.faviconUrl → faviconUrl
```

---

## References

- [REQ-104 in gen_requests.md](./gen_requests.md) - Original request
- [REQ-104 Overview Document](./REQ-104-url-content-with-preview-overview.md) - Technical overview
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md) - Overall workflow plan
- [/api/url-metadata route](../src/app/api/url-metadata/route.ts) - Existing API endpoint
- [ItemCapture.types.ts](../src/components/ItemCapture/ItemCapture.types.ts) - UrlMetadata type
- [useQRCodeGeneration Hook](../src/hooks/useQRCodeGeneration.ts) - Async pattern reference
- [REQ-103 Detailed Document](./REQ-103-content-type-step-detailed.md) - Document format reference

---

## Implementation Notes

*Completed: 2026-01-05 07:25 UTC*

| Task | Status | Notes |
|------|--------|-------|
| 1. Create hook file structure | ✅ Complete | Created useUrlPreview.ts with types, JSDoc, 'use client' directive |
| 2. Implement URL validation | ✅ Complete | isValidUrl() validates HTTP/HTTPS URLs, rejects dangerous protocols |
| 3. Implement core hook state | ✅ Complete | useReducer pattern with useState, AbortController, unmount cleanup |
| 4. Implement fetchPreview | ✅ Complete | Timeout support, abort handling, API error handling, maintains URL on error |
| 5. Implement clearPreview | ✅ Complete | Aborts ongoing requests, resets all state to idle |
| 6. Update barrel export | ✅ Complete | Added exports to hooks/index.ts for hook and all types |
| 7. Unit tests - initialization | ✅ Complete | Tests for idle state, function availability |
| 8. Unit tests - states | ✅ Complete | Tests for loading, success, error, timeout, YouTube handling |
| 9. Unit tests - clear/abort | ✅ Complete | Tests for clearPreview, abort on new request, AbortError handling |
| 10. Run tests and fix | ✅ Complete | ESLint warnings fixed, build passes |
| 11. Manual verification | ✅ Complete | Barrel export verified, API route exists, build successful |
