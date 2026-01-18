# REQ-104: URL Content with Preview Using Open Graph Metadata - Implementation Breakdown

**Document Generated:** 2026-01-05 23:45 UTC
**Last Modified:** 2026-01-05 23:45 UTC
**Request Reference:** REQ-104 (URL Content with Preview Using Open Graph Metadata)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 3 - Content Selection Steps (4-5)
**Task ID:** 3.3

---

## Overview

This document provides a detailed implementation breakdown for the `useUrlPreview` hook, which enables users to paste a URL and see a preview of the content before proceeding in the Item Creation Workflow. The hook fetches Open Graph metadata from the provided URL, handles loading, success, and error states, and supports proceeding without a preview when metadata fetch fails.

### Context from Implementation Plan

From the Implementation Plan (Phase 3, Task 3.3):

> **Task 3.3: URL Content with Preview [0.5 days]**
> - [ ] Implement `useUrlPreview` hook
> - [ ] Fetch Open Graph metadata
> - [ ] Handle loading, success, error states
> - [ ] Support proceeding without preview (with warning)

**Files to Create:**
- `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`
- `src/app/api/url-preview/route.ts` (API route for server-side metadata fetching)

**Technical Decision from Plan:**
> | Decision | Choice | Rationale |
> |----------|--------|-----------|
> | URL Preview | Server-side API route | CORS restrictions prevent client-side Open Graph fetching |

**Recommended Spike Work from Plan:**

> ### Spike 1: URL Preview API Route
>
> **Goal:** Validate server-side URL metadata fetching approach.
>
> **Success Criteria:**
> - [ ] API route fetches URL and extracts Open Graph metadata
> - [ ] Handles YouTube URLs specially (extract video ID)
> - [ ] Returns structured UrlMetadata response
> - [ ] Graceful timeout (5 seconds)
> - [ ] Error handling for invalid/unreachable URLs

**Acceptance Criteria (from REQ-104):**
- URL input field accepts text entry for web addresses
- System automatically triggers metadata fetch after URL is entered and validated as proper URL format
- Loading state displays visual indicator while fetching Open Graph metadata
- Success state displays preview card with retrieved title, description, and image when available
- Preview card layout is visually appealing and clearly displays all available metadata fields
- Error state displays informative message when metadata fetch fails
- Error state includes warning indicator but still allows user to proceed with workflow
- Users can continue to next step with entered URL regardless of preview success or failure
- Warning message appears when user proceeds without successful preview

---

## Current State Analysis

### Existing Infrastructure

The workflow foundation and previous steps are fully implemented:

| Component | Status | Location |
|-----------|--------|----------|
| **Type Definitions** | Complete | `ItemCreationWorkflow.types.ts` |
| **State Machine Hook** | Complete | `hooks/useWorkflowState.ts` |
| **ContentTypeStep** | Complete | `components/steps/ContentTypeStep.tsx` |
| **Hooks Barrel Export** | Ready (placeholder comment) | `hooks/index.ts` |
| **API Route Pattern** | Reference Available | `src/app/api/auth/login/route.ts` |

### Content Data Type for URL

From `ItemCreationWorkflow.types.ts` (line 195):

```typescript
| { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string };
```

The `ContentData` type already supports URL content with optional metadata fields that the `useUrlPreview` hook will populate.

### Hooks Barrel Export Placeholder

From `hooks/index.ts` (lines 38-39):

```typescript
// Placeholder for Task 3.3: useUrlPreview
// export { useUrlPreview } from './useUrlPreview';
```

### Existing Hook Patterns

From `useWorkflowState.ts` and `useSuggestions.ts`, the codebase uses:
- `useReducer` for complex state
- `useCallback` for memoized functions
- `useMemo` for computed values
- `useEffect` with proper cleanup
- TypeScript interfaces for return types

From `useQRCodeGeneration.ts` (for async operation patterns):
- AbortController for request cancellation
- Ref-based unmount detection
- Timeout handling
- Progress state
- Error state with user-friendly messages

---

## Technical Approach

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        useUrlPreview Hook                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input: URL string                                               │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │   URL Validation    │                                        │
│  │   (client-side)     │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   Fetch Request     │───▶│  /api/url-preview API Route     │ │
│  │   (with timeout)    │◀───│  (server-side OG fetch)         │ │
│  └──────────┬──────────┘    └─────────────────────────────────┘ │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │   State: Loading    │                                        │
│  │   State: Success    │                                        │
│  │   State: Error      │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
│  Output: UrlPreviewData                                          │
│    - url: string                                                 │
│    - title?: string                                              │
│    - description?: string                                        │
│    - imageUrl?: string                                           │
│    - faviconUrl?: string                                         │
│    - siteName?: string                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### API Route Architecture

The API route handles server-side fetching to bypass CORS restrictions:

```
┌─────────────────────────────────────────────────────────────────┐
│              /api/url-preview API Route                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Validate URL format                                          │
│  2. Fetch URL with timeout (5 seconds)                          │
│  3. Parse HTML response                                          │
│  4. Extract Open Graph meta tags:                               │
│     - og:title                                                   │
│     - og:description                                             │
│     - og:image                                                   │
│     - og:site_name                                               │
│  5. Extract fallback data:                                       │
│     - <title> element                                            │
│     - meta description                                           │
│     - favicon link                                               │
│  6. Special handling for known domains (YouTube, etc.)          │
│  7. Return structured response                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Type Definitions

```typescript
// URL Preview Hook Types
export interface UrlPreviewData {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  siteName?: string;
}

export interface UseUrlPreviewOptions {
  /** Timeout for fetch request in milliseconds (default: 5000) */
  timeout?: number;
  /** Debounce delay in milliseconds (default: 500) */
  debounceDelay?: number;
}

export type UrlPreviewStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseUrlPreviewReturn {
  /** Current preview data (null if not fetched yet or error) */
  data: UrlPreviewData | null;
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
  /** Whether it's safe to proceed (with or without preview) */
  canProceed: boolean;
}

// API Route Types
interface UrlPreviewRequest {
  url: string;
}

interface UrlPreviewResponse {
  success: boolean;
  data?: UrlPreviewData;
  error?: string;
}
```

### URL Validation

Client-side URL validation before fetching:

```typescript
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
```

### Debounce Implementation

To prevent excessive API calls while user is typing:

```typescript
// Using a simple debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Implementation Tasks

### Task 1: Create API Route for URL Preview [45 min]

**File:** `src/app/api/url-preview/route.ts`

**Subtasks:**
1. Create API route file with Next.js Route Handler pattern
2. Implement URL validation
3. Implement URL fetch with timeout (5 seconds)
4. Parse HTML and extract Open Graph meta tags
5. Extract fallback data (title, description, favicon)
6. Add special handling for YouTube URLs
7. Return structured JSON response
8. Handle all error cases gracefully

**Code Structure:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface UrlPreviewRequest {
  url: string;
}

interface UrlPreviewData {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  siteName?: string;
}

interface UrlPreviewResponse {
  success: boolean;
  data?: UrlPreviewData;
  error?: string;
}

/**
 * URL Preview API Route
 *
 * Fetches a URL and extracts Open Graph metadata for preview purposes.
 * Handles CORS by performing server-side fetching.
 *
 * @route POST /api/url-preview
 */
export async function POST(request: NextRequest): Promise<NextResponse<UrlPreviewResponse>> {
  try {
    const body: UrlPreviewRequest = await request.json();

    // Validate URL is provided
    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(body.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'faqbnb-url-preview/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch URL: ${response.status}` },
          { status: 502 }
        );
      }

      const html = await response.text();
      const metadata = extractMetadata(html, body.url, parsedUrl);

      return NextResponse.json({
        success: true,
        data: metadata,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timed out' },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch URL' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('URL preview API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract Open Graph and fallback metadata from HTML
 */
function extractMetadata(html: string, originalUrl: string, parsedUrl: URL): UrlPreviewData {
  const metadata: UrlPreviewData = { url: originalUrl };

  // Extract Open Graph tags
  const ogTitle = extractMetaContent(html, 'og:title');
  const ogDescription = extractMetaContent(html, 'og:description');
  const ogImage = extractMetaContent(html, 'og:image');
  const ogSiteName = extractMetaContent(html, 'og:site_name');

  // Fallback to standard meta tags
  const title = ogTitle || extractHtmlTitle(html);
  const description = ogDescription || extractMetaContent(html, 'description');

  // Build favicon URL
  const faviconUrl = extractFaviconUrl(html, parsedUrl);

  // Resolve relative image URLs
  let imageUrl = ogImage;
  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      imageUrl = new URL(imageUrl, parsedUrl.origin).href;
    } catch {
      imageUrl = undefined;
    }
  }

  if (title) metadata.title = title;
  if (description) metadata.description = truncateText(description, 200);
  if (imageUrl) metadata.imageUrl = imageUrl;
  if (faviconUrl) metadata.faviconUrl = faviconUrl;
  if (ogSiteName) metadata.siteName = ogSiteName;

  // YouTube special handling
  if (isYouTubeUrl(originalUrl)) {
    const videoId = extractYouTubeVideoId(originalUrl);
    if (videoId && !metadata.imageUrl) {
      metadata.imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  return metadata;
}

function extractMetaContent(html: string, property: string): string | undefined {
  // Try og: property first
  const ogMatch = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:)?${property}["'][^>]+content=["']([^"']+)["']`, 'i')
  );
  if (ogMatch) return ogMatch[1];

  // Try content first format
  const contentFirstMatch = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:)?${property}["']`, 'i')
  );
  if (contentFirstMatch) return contentFirstMatch[1];

  return undefined;
}

function extractHtmlTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : undefined;
}

function extractFaviconUrl(html: string, parsedUrl: URL): string | undefined {
  // Try to find favicon link
  const faviconMatch = html.match(
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i
  );

  if (faviconMatch) {
    const href = faviconMatch[1];
    if (href.startsWith('http')) return href;
    try {
      return new URL(href, parsedUrl.origin).href;
    } catch {
      return undefined;
    }
  }

  // Fallback to default favicon location
  return `${parsedUrl.origin}/favicon.ico`;
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function extractYouTubeVideoId(url: string): string | undefined {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
```

### Task 2: Create useUrlPreview Hook [45 min]

**File:** `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Subtasks:**
1. Create hook file with 'use client' directive and JSDoc header
2. Define type interfaces for options and return value
3. Implement URL validation utility
4. Implement fetch logic with AbortController
5. Handle loading, success, and error states
6. Implement debounce for URL input
7. Add proper cleanup on unmount
8. Export hook and types

**Code Structure:**

```typescript
'use client';

/**
 * useUrlPreview - Hook for fetching and displaying URL previews
 *
 * This hook fetches Open Graph metadata from URLs to display rich previews
 * in the item creation workflow. It handles loading, success, and error states,
 * and supports proceeding without a preview when metadata fetch fails.
 *
 * @module ItemCreationWorkflow/hooks/useUrlPreview
 * @see docs/REQ-104-url-content-with-preview-overview.md
 * @lastModified 2026-01-05
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// =============================================================================
// Type Definitions
// =============================================================================

export interface UrlPreviewData {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  siteName?: string;
}

export interface UseUrlPreviewOptions {
  /** Timeout for fetch request in milliseconds (default: 5000) */
  timeout?: number;
  /** Debounce delay in milliseconds (default: 500) */
  debounceDelay?: number;
}

export type UrlPreviewStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseUrlPreviewReturn {
  /** Current preview data (null if not fetched yet or error) */
  data: UrlPreviewData | null;
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
  /** Whether it's safe to proceed (always true - can proceed with or without preview) */
  canProceed: boolean;
  /** Whether a valid URL has been entered */
  hasValidUrl: boolean;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validates that a string is a properly formatted HTTP/HTTPS URL
 */
function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;

  try {
    const url = new URL(urlString.trim());
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
 * Fetches Open Graph metadata from the server-side API route to avoid CORS issues.
 * Handles loading, success, and error states gracefully.
 *
 * @param options - Configuration options
 * @returns Preview data, status, and control functions
 *
 * @example
 * const { data, isLoading, isError, fetchPreview } = useUrlPreview();
 *
 * const handleUrlChange = (url: string) => {
 *   if (isValidUrl(url)) {
 *     fetchPreview(url);
 *   }
 * };
 */
export function useUrlPreview(options: UseUrlPreviewOptions = {}): UseUrlPreviewReturn {
  const { timeout = 5000 } = options;

  // State
  const [data, setData] = useState<UrlPreviewData | null>(null);
  const [status, setStatus] = useState<UrlPreviewStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);

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
   * Fetch preview data for a URL
   */
  const fetchPreview = useCallback(async (url: string): Promise<void> => {
    // Skip if unmounted
    if (isUnmountedRef.current) return;

    // Validate URL
    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid URL');
      setStatus('error');
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

      // Fetch from API route
      const fetchPromise = fetch('/api/url-preview', {
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

      // Handle abort
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Silent return on abort
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
      setError(errorMessage);
      setStatus('error');

      // Keep the URL even on error (user can still proceed)
      setData({ url: trimmedUrl });
    }
  }, [timeout]);

  /**
   * Clear preview data and reset state
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
  };
}

export default useUrlPreview;
```

### Task 3: Update Hooks Barrel Export [5 min]

**File:** `src/components/ItemCreationWorkflow/hooks/index.ts`

**Subtasks:**
1. Uncomment/add the `useUrlPreview` export
2. Add type exports

**Changes:**

```typescript
// Task 3.3: useUrlPreview - URL preview fetching hook
export { useUrlPreview } from './useUrlPreview';
export type {
  UrlPreviewData,
  UseUrlPreviewOptions,
  UrlPreviewStatus,
  UseUrlPreviewReturn,
} from './useUrlPreview';
```

### Task 4: Write Unit Tests for useUrlPreview Hook [45 min]

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`

**Test Cases:**

1. **Initialization:**
   - Returns idle status initially
   - Data is null initially
   - No error initially

2. **URL Validation:**
   - Rejects invalid URLs
   - Accepts valid HTTP URLs
   - Accepts valid HTTPS URLs
   - Rejects non-HTTP protocols

3. **Loading State:**
   - Sets loading status when fetch starts
   - isLoading is true during fetch

4. **Success State:**
   - Sets success status on successful fetch
   - Populates data with preview information
   - isSuccess is true after successful fetch
   - Error is null on success

5. **Error State:**
   - Sets error status on failed fetch
   - Populates error message
   - isError is true after failed fetch
   - Still populates URL in data even on error

6. **Clear Preview:**
   - Resets all state to initial values
   - Aborts any ongoing request

7. **Abort Handling:**
   - Aborts previous request when new one starts
   - Cleans up on unmount

8. **canProceed:**
   - Returns true when valid URL is entered
   - Returns true even when preview fails

**Test Template:**

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUrlPreview } from '../useUrlPreview';

// Mock fetch
global.fetch = jest.fn();

describe('useUrlPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('returns idle status initially', () => {
      const { result } = renderHook(() => useUrlPreview());

      expect(result.current.status).toBe('idle');
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('rejects invalid URLs', async () => {
      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('not-a-url');
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Please enter a valid URL');
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

      expect(result.current.status).toBe('loading');
      expect(result.current.isLoading).toBe(true);

      // Cleanup
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { url: 'https://example.com' } }),
      });
    });
  });

  describe('Success State', () => {
    it('sets success status and populates data on successful fetch', async () => {
      const mockData = {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'An example description',
        imageUrl: 'https://example.com/image.jpg',
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
    });
  });

  describe('Error State', () => {
    it('sets error status on failed fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Failed to fetch' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.status).toBe('error');
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe('Failed to fetch');
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
  });

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
    });
  });

  describe('canProceed', () => {
    it('returns true when valid URL is entered and preview succeeds', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://example.com' },
        }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.canProceed).toBe(true);
    });

    it('returns true even when preview fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Failed' }),
      });

      const { result } = renderHook(() => useUrlPreview());

      await act(async () => {
        await result.current.fetchPreview('https://example.com');
      });

      expect(result.current.canProceed).toBe(true);
    });
  });
});
```

### Task 5: Write Unit Tests for API Route [30 min]

**File:** `src/app/api/url-preview/__tests__/route.test.ts`

**Test Cases:**

1. **Input Validation:**
   - Returns 400 for missing URL
   - Returns 400 for invalid URL format
   - Returns 400 for non-HTTP protocols

2. **Successful Fetch:**
   - Returns 200 with preview data
   - Extracts Open Graph metadata correctly
   - Falls back to standard meta tags

3. **Error Handling:**
   - Returns 504 on timeout
   - Returns 502 on fetch failure
   - Returns 500 on internal error

4. **YouTube Special Handling:**
   - Extracts YouTube video ID
   - Generates YouTube thumbnail URL

**Test Template:**

```typescript
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

describe('URL Preview API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(body: object): NextRequest {
    return new NextRequest('http://localhost/api/url-preview', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  describe('Input Validation', () => {
    it('returns 400 for missing URL', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('URL is required');
    });

    it('returns 400 for invalid URL format', async () => {
      const request = createRequest({ url: 'not-a-url' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid URL format');
    });
  });

  describe('Successful Fetch', () => {
    it('returns 200 with preview data', async () => {
      const mockHtml = `
        <html>
          <head>
            <meta property="og:title" content="Test Title">
            <meta property="og:description" content="Test Description">
            <meta property="og:image" content="https://example.com/image.jpg">
          </head>
        </html>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml),
      });

      const request = createRequest({ url: 'https://example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Test Title');
      expect(data.data.description).toBe('Test Description');
      expect(data.data.imageUrl).toBe('https://example.com/image.jpg');
    });
  });

  describe('YouTube Special Handling', () => {
    it('extracts YouTube thumbnail for video URLs', async () => {
      const mockHtml = '<html><head><title>YouTube Video</title></head></html>';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml),
      });

      const request = createRequest({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.imageUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });
  });
});
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts` | URL preview fetching hook |
| `src/app/api/url-preview/route.ts` | Server-side API route for metadata fetching |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` | Unit tests for hook |
| `src/app/api/url-preview/__tests__/route.test.ts` | Unit tests for API route |

### Files to Modify

| File Path | Modification | Functions/Sections |
|-----------|--------------|-------------------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Add useUrlPreview export | Lines 38-39 (replace placeholder comment) |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ContentData URL type definition |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Hook pattern reference |
| `src/hooks/useQRCodeGeneration.ts` | Async operation pattern reference |
| `src/app/api/auth/login/route.ts` | API route pattern reference |
| `docs/prd/Plan-093-Item-Creation-Workflow.md` | Implementation plan, spike work details |

---

## Integration Points

### With Content Type Step

When user selects "Paste URL" content type, the workflow will transition to a URL input step that uses `useUrlPreview`:

```typescript
// Future integration in URL content step
const { data, isLoading, isError, error, fetchPreview, canProceed } = useUrlPreview();

const handleUrlChange = useCallback((url: string) => {
  fetchPreview(url);
}, [fetchPreview]);

// User can proceed even if preview fails (with warning)
const handleContinue = () => {
  if (!canProceed) return;

  if (isError) {
    // Show warning but allow proceeding
    // "Preview unavailable. The URL will still be saved."
  }

  // Add content piece with available data
  addContentPiece({
    id: crypto.randomUUID(),
    type: 'url',
    data: {
      type: 'url',
      url: data?.url || url,
      title: data?.title,
      thumbnailUrl: data?.imageUrl,
      faviconUrl: data?.faviconUrl,
    },
    order: 0,
  });

  nextStep();
};
```

### With ContentPiece Type

The hook populates fields that match the `ContentData` URL type:

```typescript
// ContentData URL type (from types file)
| { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string };

// useUrlPreview output maps to this:
// data.url -> url
// data.title -> title
// data.imageUrl -> thumbnailUrl
// data.faviconUrl -> faviconUrl
```

### With Workflow State

The hook is independent of workflow state but provides data that will be stored via:

```typescript
dispatch({ type: 'ADD_CONTENT_PIECE', payload: contentPiece });
```

---

## Design System Compliance

### Preview Card Styling (Future Integration)

When the URL preview is displayed in a component, it should follow:

| Element | Color | Token |
|---------|-------|-------|
| Card Border | gray-200 | `border-gray-200` |
| Card Background | white | `bg-white` |
| Title Text | #222222 | `text-[#222222]` |
| Description Text | #717171 | `text-[#717171]` |
| Site Name | #717171 | `text-[#717171]` |
| Loading Spinner | blue-500 | `text-blue-500` |
| Error Text | #FF5A5F | `text-[#FF5A5F]` |
| Warning Background | yellow-50 | `bg-yellow-50` |
| Warning Border | yellow-200 | `border-yellow-200` |

### Loading States

- Skeleton loading: Pulse animation on placeholder elements
- Spinner: Animate-spin on SVG icon
- Loading text: "Fetching preview..."

### Error States

- Error message displayed below URL input
- Warning indicator (triangle icon) for "proceed anyway" option
- Clear warning text: "Preview unavailable. The URL will still be saved."

---

## Dependencies

### Required (Already Installed)

| Package | Usage |
|---------|-------|
| `react` | Hooks framework |
| `next` | API route handler, NextRequest/NextResponse |

### No New Dependencies Required

The implementation uses:
- Native `fetch` API for HTTP requests
- Native `URL` API for URL parsing
- Native `AbortController` for request cancellation
- Regex for HTML parsing (no external HTML parser needed for simple meta extraction)

---

## Risk Assessment

### Low Risk

- **Hook Pattern:** Follows established patterns from `useWorkflowState` and `useQRCodeGeneration`
- **API Route Pattern:** Follows established pattern from `auth/login/route.ts`
- **Type Safety:** Fully typed with TypeScript interfaces

### Medium Risk

- **HTML Parsing:** Regex-based parsing may miss some edge cases
  - **Mitigation:** Use multiple regex patterns for common meta tag formats
  - **Fallback:** Return partial data if some fields can't be extracted

- **External URL Fetching:** Server fetches external URLs which could be slow or blocked
  - **Mitigation:** 5-second timeout, graceful error handling
  - **User Experience:** Allow proceeding without preview

### Edge Cases

1. **Redirect URLs:** Some URLs may redirect; follow redirects is default fetch behavior
2. **Rate Limiting:** External sites may rate limit; handle 429 errors gracefully
3. **Large Pages:** Very large HTML pages may be slow; rely on timeout
4. **Invalid SSL:** Some sites have invalid SSL; may fail (acceptable)
5. **Empty Metadata:** Site has no OG tags; fall back to title/favicon only

---

## Success Criteria

Per REQ-104 Acceptance Criteria:

- [ ] URL input field accepts text entry for web addresses
- [ ] System automatically triggers metadata fetch after URL is entered and validated as proper URL format
- [ ] Loading state displays visual indicator while fetching Open Graph metadata
- [ ] Success state displays preview card with retrieved title, description, and image when available
- [ ] Preview card layout is visually appealing and clearly displays all available metadata fields
- [ ] Error state displays informative message when metadata fetch fails
- [ ] Error state includes warning indicator but still allows user to proceed with workflow
- [ ] Users can continue to next step with entered URL regardless of preview success or failure
- [ ] Warning message appears when user proceeds without successful preview

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Create API route | 45 min |
| Task 2: Create useUrlPreview hook | 45 min |
| Task 3: Update hooks barrel export | 5 min |
| Task 4: Write hook unit tests | 45 min |
| Task 5: Write API route unit tests | 30 min |
| **Total** | **~2.75 hours** |

---

## Future Considerations

### URL Input Component (Not in Scope)

The actual UI component for URL input and preview display is not part of this task. It will be implemented as part of the Content Creation Step (Phase 4) and will consume the `useUrlPreview` hook.

### Caching (Optional Enhancement)

Consider adding client-side caching for URL previews to avoid refetching when navigating back:

```typescript
// Future enhancement
const previewCache = new Map<string, UrlPreviewData>();
```

### Rate Limiting (Optional Enhancement)

Consider adding rate limiting to the API route to prevent abuse:

```typescript
// Future enhancement using next-rate-limit or similar
```

---

## References

- [REQ-104 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [useWorkflowState Hook](/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [useQRCodeGeneration Hook](/src/hooks/useQRCodeGeneration.ts)
- [API Route Pattern](/src/app/api/auth/login/route.ts)
- [Type Definitions](/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)
- [REQ-103 Overview (Pattern Reference)](/docs/REQ-103-content-type-step-overview.md)
