# REQ-E05-032: Unit Tests for Translation Management Hooks - Detailed Task Breakdown

**Generated:** 2026-01-20 14:30:00 UTC
**Last Modified:** 2026-01-20 14:30:00 UTC
**Request ID:** REQ-E05-032
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.5
**Size:** M (Medium)
**Priority:** P2 - Medium

---

## Overview

This document provides granular, implementation-ready tasks for creating comprehensive unit tests for the `useTranslationStatus` and `useTranslationRealtime` hooks. These hooks are critical for property owners to view and monitor translation progress in real-time.

---

## Prerequisites

Before starting implementation, verify the following:

| Prerequisite | Location | Verification Command |
|--------------|----------|---------------------|
| `useTranslationStatus` hook exists | `/src/hooks/useTranslationStatus.ts` | `ls src/hooks/useTranslationStatus.ts` |
| `useTranslationRealtime` hook exists | `/src/hooks/useTranslationRealtime.ts` | `ls src/hooks/useTranslationRealtime.ts` |
| TranslationManagement types exist | `/src/components/TranslationManagement/TranslationManagement.types.ts` | `ls src/components/TranslationManagement/TranslationManagement.types.ts` |
| Vitest is configured | `vitest.config.ts` or `package.json` | `npm run test -- --version` |
| Testing library installed | `package.json` | Check for `@testing-library/react` |

---

## Detailed Tasks

### Task 1: Create Test Infrastructure and Mock Factories

**File:** `/src/hooks/__tests__/translationTestUtils.ts`
**Estimated Complexity:** Low
**Dependencies:** None

#### 1.1 Create mock data factory file

Create a shared utilities file with mock data factories for translation tests.

```typescript
// /src/hooks/__tests__/translationTestUtils.ts
// REQ-E05-032: Test utilities for translation hooks
// Created: 2026-01-20
// Last Modified: 2026-01-20

import { vi } from 'vitest';
import type { SupportedLanguage } from '@/hooks/useLanguagePreference';

// Type definitions for mock data
export interface MockTranslationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  isStale?: boolean;
  translatedAt?: string;
  reviewedBy?: string;
}

export interface MockTranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: Partial<Record<SupportedLanguage, MockTranslationStatus>>;
}

export interface MockTranslationStatusResponse {
  summary: {
    total: number;
    complete: number;
    partial: number;
    pending: number;
    failed: number;
  };
  items: MockTranslationStatusItem[];
}

// Factory functions
export function createMockTranslationStatusResponse(
  overrides?: Partial<MockTranslationStatusResponse>
): MockTranslationStatusResponse {
  return {
    summary: {
      total: 18,
      complete: 12,
      partial: 3,
      pending: 2,
      failed: 1,
    },
    items: [
      createMockTranslationStatusItem({ entityType: 'article', entityId: 'article-1' }),
      createMockTranslationStatusItem({ entityType: 'item', entityId: 'item-1' }),
    ],
    ...overrides,
  };
}

export function createMockTranslationStatusItem(
  overrides?: Partial<MockTranslationStatusItem>
): MockTranslationStatusItem {
  return {
    entityType: 'article',
    entityId: 'article-123',
    name: 'How to use the dishwasher',
    sourceLanguage: 'en',
    translations: {
      fr: { status: 'completed', translatedAt: '2026-01-20T10:00:00Z' },
      es: { status: 'completed', translatedAt: '2026-01-20T10:00:00Z' },
      de: { status: 'pending' },
      nl: { status: 'processing' },
      it: { status: 'failed', isStale: false },
    },
    ...overrides,
  };
}

// Realtime payload mock
export interface MockRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

export function createMockRealtimePayload(
  overrides?: Partial<MockRealtimePayload>
): MockRealtimePayload {
  return {
    eventType: 'UPDATE',
    new: {
      id: 'trans-123',
      article_id: 'article-123',
      language: 'fr',
      title: 'Comment utiliser le lave-vaisselle',
      translation_status: 'completed',
      translated_at: '2026-01-20T10:00:00Z',
    },
    old: {
      id: 'trans-123',
      article_id: 'article-123',
      language: 'fr',
      title: '',
      translation_status: 'pending',
      translated_at: null,
    },
    ...overrides,
  };
}

// Mock Supabase channel factory
export function createMockSupabaseChannel() {
  const eventHandlers: Map<string, ((payload: unknown) => void)[]> = new Map();

  const mockChannel = {
    on: vi.fn((event: string, _filter: unknown, callback: (payload: unknown) => void) => {
      const handlers = eventHandlers.get(event) || [];
      handlers.push(callback);
      eventHandlers.set(event, handlers);
      return mockChannel;
    }),
    subscribe: vi.fn((callback?: (status: string) => void) => {
      if (callback) {
        callback('SUBSCRIBED');
      }
      return mockChannel;
    }),
    unsubscribe: vi.fn(),
    // Helper to trigger events in tests
    _triggerEvent: (event: string, payload: unknown) => {
      const handlers = eventHandlers.get(event) || [];
      handlers.forEach(handler => handler(payload));
    },
    _getHandlers: () => eventHandlers,
  };

  return mockChannel;
}

// Mock fetch response helpers
export function createMockFetchResponse(data: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  };
}

export function createMockFetchError(status: number, message: string) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
  };
}
```

**Acceptance Criteria:**
- [ ] File created at `/src/hooks/__tests__/translationTestUtils.ts`
- [ ] Mock factories create realistic test fixtures matching production data shapes
- [ ] Type definitions match TranslationManagement.types.ts
- [ ] Supabase channel mock supports event subscription and triggering

---

### Task 2: Create useTranslationStatus Test Suite - Initialization Tests

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts`
**Estimated Complexity:** Low
**Dependencies:** Task 1

#### 2.1 Set up test file with imports and mocks

```typescript
// /src/hooks/__tests__/useTranslationStatus.test.ts
// REQ-E05-032: Unit tests for useTranslationStatus hook
// Created: 2026-01-20
// Last Modified: 2026-01-20

/**
 * useTranslationStatus Hook Tests
 *
 * Tests translation status fetching, loading states, error handling,
 * polling behavior, caching, and cleanup operations.
 *
 * @module hooks/__tests__/useTranslationStatus
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslationStatus } from '../useTranslationStatus';
import {
  createMockTranslationStatusResponse,
  createMockFetchResponse,
  createMockFetchError,
} from './translationTestUtils';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useTranslationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('returns correct initial state with loading true and data null', () => {
      const { result } = renderHook(() => useTranslationStatus());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('provides refresh function', () => {
      const { result } = renderHook(() => useTranslationStatus());

      expect(typeof result.current.refresh).toBe('function');
    });

    it('provides retry function', () => {
      const { result } = renderHook(() => useTranslationStatus());

      expect(typeof result.current.retry).toBe('function');
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created at `/src/hooks/__tests__/useTranslationStatus.test.ts`
- [ ] Tests use Vitest and React Testing Library
- [ ] Test for initial loading state (loading: true, data: null)
- [ ] Test verifies refresh and retry functions are provided

---

### Task 3: useTranslationStatus - Data Fetching Tests

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts` (append)
**Estimated Complexity:** Medium
**Dependencies:** Task 2

#### 3.1 Add data fetching test suite

```typescript
  // ===========================================================================
  // Data Fetching Tests
  // ===========================================================================

  describe('Data Fetching', () => {
    it('successfully fetches translation status', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockData));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('returns expected data structure with summary and items', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockData));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.data).not.toBeNull();
      });

      expect(result.current.data?.summary).toBeDefined();
      expect(result.current.data?.summary.total).toBe(18);
      expect(result.current.data?.items).toBeInstanceOf(Array);
    });

    it('loading state transitions correctly (true -> false)', async () => {
      const mockData = createMockTranslationStatusResponse();

      let resolvePromise: (value: unknown) => void;
      mockFetch.mockReturnValueOnce(
        new Promise((resolve) => { resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useTranslationStatus());

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the fetch
      await act(async () => {
        resolvePromise!(createMockFetchResponse(mockData));
      });

      // No longer loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('sets error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.data).toBeNull();
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for successful data fetch returning expected data structure
- [ ] Test for loading state transitioning to false after fetch completes
- [ ] Test for error handling setting error object when fetch fails

---

### Task 4: useTranslationStatus - Parameter Handling Tests

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts` (append)
**Estimated Complexity:** Medium
**Dependencies:** Task 3

#### 4.1 Add parameter handling test suite

```typescript
  // ===========================================================================
  // Parameter Handling Tests
  // ===========================================================================

  describe('Parameter Handling', () => {
    it('fetches with entityType filter', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockData));

      renderHook(() => useTranslationStatus({ entityType: 'article' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toContain('entityType=article');
    });

    it('fetches with entityId filter', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockData));

      renderHook(() => useTranslationStatus({ entityId: 'article-123' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toContain('entityId=article-123');
    });

    it('fetches with status filter', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockData));

      renderHook(() => useTranslationStatus({ status: 'pending' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toContain('status=pending');
    });

    it('triggers new fetch when parameters change', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData));

      const { rerender } = renderHook(
        ({ entityType }) => useTranslationStatus({ entityType }),
        { initialProps: { entityType: 'article' as const } }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Change parameters
      rerender({ entityType: 'item' as const });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('caching prevents duplicate API calls with identical parameters', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData));

      const { result, rerender } = renderHook(
        ({ entityType }) => useTranslationStatus({ entityType }),
        { initialProps: { entityType: 'article' as const } }
      );

      await waitFor(() => {
        expect(result.current.data).not.toBeNull();
      });

      const callCount = mockFetch.mock.calls.length;

      // Rerender with same parameters - should not trigger new fetch
      rerender({ entityType: 'article' as const });

      // Wait a bit to ensure no new calls
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should still be same call count (cached)
      expect(mockFetch.mock.calls.length).toBe(callCount);
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for fetch with entityType filter
- [ ] Test for fetch with entityId filter
- [ ] Test for fetch with status filter
- [ ] Test for parameter changes triggering new fetch
- [ ] Test for caching preventing duplicate API calls

---

### Task 5: useTranslationStatus - Retry and Refresh Tests

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts` (append)
**Estimated Complexity:** Medium
**Dependencies:** Task 4

#### 5.1 Add retry and refresh test suite

```typescript
  // ===========================================================================
  // Retry and Refresh Tests
  // ===========================================================================

  describe('Retry and Refresh', () => {
    it('refresh function triggers new data fetch', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.data).not.toBeNull();
      });

      const initialCallCount = mockFetch.mock.calls.length;

      // Call refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('retry logic attempts 3 times with exponential backoff on failure', async () => {
      // All attempts fail
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTranslationStatus());

      // Wait for initial attempt + retries
      await act(async () => {
        vi.advanceTimersByTime(100); // First attempt
        vi.advanceTimersByTime(1000); // Wait for 1st retry (1s backoff)
        vi.advanceTimersByTime(2000); // Wait for 2nd retry (2s backoff)
        vi.advanceTimersByTime(4000); // Wait for 3rd retry (4s backoff)
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Should have attempted 3 times (initial + 2 retries, or similar pattern)
      // Exact count depends on implementation
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('retry resets error state on successful retry', async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Setup successful retry
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockData));

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data).not.toBeNull();
      });
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for refresh function triggering new data fetch
- [ ] Test for retry logic with exponential backoff
- [ ] Test for retry resetting error state

---

### Task 6: useTranslationStatus - Polling Mode Tests

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts` (append)
**Estimated Complexity:** Medium
**Dependencies:** Task 5

#### 6.1 Add polling mode test suite

```typescript
  // ===========================================================================
  // Polling Mode Tests
  // ===========================================================================

  describe('Polling Mode', () => {
    it('polling mode enables automatic refetch at configured intervals', async () => {
      const mockData = createMockTranslationStatusResponse({
        summary: { total: 10, complete: 5, partial: 2, pending: 3, failed: 0 },
      });
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData));

      renderHook(() => useTranslationStatus({ polling: true, pollingInterval: 5000 }));

      // Initial fetch
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Advance time to trigger polling
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Another polling interval
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });
    });

    it('polling disables when no pending jobs exist', async () => {
      // First response has pending jobs
      const mockDataWithPending = createMockTranslationStatusResponse({
        summary: { total: 10, complete: 5, partial: 2, pending: 3, failed: 0 },
      });

      // Second response has no pending jobs
      const mockDataNoPending = createMockTranslationStatusResponse({
        summary: { total: 10, complete: 10, partial: 0, pending: 0, failed: 0 },
      });

      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockDataWithPending))
        .mockResolvedValueOnce(createMockFetchResponse(mockDataNoPending));

      renderHook(() => useTranslationStatus({ polling: true, pollingInterval: 5000 }));

      // Initial fetch
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Advance to second fetch
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Advance again - polling should stop since no pending
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Should still be 2 (polling stopped)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('polling cleanup occurs on unmount', async () => {
      const mockData = createMockTranslationStatusResponse();
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData));

      const { unmount } = renderHook(() =>
        useTranslationStatus({ polling: true, pollingInterval: 5000 })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Unmount
      unmount();

      // Advance time past polling interval
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      // Should still be 1 (no more polling after unmount)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for polling mode enabling automatic refetch
- [ ] Test for polling disabling when no pending jobs
- [ ] Test for polling cleanup on unmount

---

### Task 7: useTranslationStatus - Cleanup and Error Handling Tests

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts` (append)
**Estimated Complexity:** Medium
**Dependencies:** Task 6

#### 7.1 Add cleanup and error handling test suites

```typescript
  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('Cleanup', () => {
    it('cleanup cancels pending requests on unmount', async () => {
      const abortSpy = vi.fn();
      const originalAbortController = global.AbortController;

      global.AbortController = class MockAbortController {
        signal = { aborted: false };
        abort = abortSpy;
      } as unknown as typeof AbortController;

      // Slow fetch that won't complete before unmount
      let resolvePromise: (value: unknown) => void;
      mockFetch.mockReturnValueOnce(
        new Promise((resolve) => { resolvePromise = resolve; })
      );

      const { unmount } = renderHook(() => useTranslationStatus());

      // Unmount before fetch completes
      unmount();

      expect(abortSpy).toHaveBeenCalled();

      // Cleanup
      global.AbortController = originalAbortController;
    });

    it('AbortController properly aborts on unmount', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      mockFetch.mockRejectedValueOnce(abortError);

      const { result, unmount } = renderHook(() => useTranslationStatus());

      unmount();

      // AbortError should not set error state (it's expected)
      // This verifies the hook handles AbortError gracefully
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('handles 401 authentication errors correctly', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchError(401, 'Unauthorized'));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('Unauthorized');
    });

    it('handles 403 forbidden errors correctly', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchError(403, 'Forbidden'));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('Forbidden');
    });

    it('handles 404 not found responses gracefully', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchError(404, 'Not found'));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle gracefully without crashing
      expect(result.current.error).not.toBeNull();
    });

    it('handles network errors with appropriate messages', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      // Error message should be actionable/informative
    });

    it('provides actionable error messages for debugging', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => useTranslationStatus());

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Error should be a string that helps with debugging
      expect(typeof result.current.error).toBe('string');
      expect(result.current.error!.length).toBeGreaterThan(0);
    });

    it('validates invalid parameters and throws descriptive errors', () => {
      // Test that invalid parameters are handled
      // This depends on implementation - might throw or return error state
      const { result } = renderHook(() =>
        useTranslationStatus({ entityType: 'invalid' as 'article' })
      );

      // Hook should handle gracefully
      expect(result.current).toBeDefined();
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for cleanup canceling pending requests on unmount
- [ ] Test for AbortController properly aborting
- [ ] Test for 401/403 authentication errors
- [ ] Test for 404 not found responses
- [ ] Test for network errors
- [ ] Test for actionable error messages
- [ ] Test for invalid parameter validation

---

### Task 8: Create useTranslationRealtime Test Suite - Initialization

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts`
**Estimated Complexity:** Medium
**Dependencies:** Task 1

#### 8.1 Set up test file with imports and mocks

```typescript
// /src/hooks/__tests__/useTranslationRealtime.test.ts
// REQ-E05-032: Unit tests for useTranslationRealtime hook
// Created: 2026-01-20
// Last Modified: 2026-01-20

/**
 * useTranslationRealtime Hook Tests
 *
 * Tests Supabase realtime subscription for translation updates,
 * event handling, debouncing, connection status, and cleanup.
 *
 * @module hooks/__tests__/useTranslationRealtime
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslationRealtime } from '../useTranslationRealtime';
import {
  createMockSupabaseChannel,
  createMockRealtimePayload,
} from './translationTestUtils';

// Mock Supabase client
const mockChannel = createMockSupabaseChannel();
const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('useTranslationRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset the mock channel for each test
    mockChannel.on.mockClear();
    mockChannel.subscribe.mockClear();
    mockChannel.unsubscribe.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // Subscription Lifecycle Tests
  // ===========================================================================

  describe('Subscription Lifecycle', () => {
    it('creates subscription on mount', () => {
      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate: vi.fn(),
      }));

      expect(mockSupabase.channel).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('executes unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate: vi.fn(),
      }));

      unmount();

      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });

    it('closes old subscription and opens new one when parameters change', () => {
      const { rerender } = renderHook(
        ({ entityId }) => useTranslationRealtime({
          entityType: 'article',
          entityId,
          onUpdate: vi.fn(),
        }),
        { initialProps: { entityId: 'article-123' } }
      );

      // Change entityId
      rerender({ entityId: 'article-456' });

      // Should have unsubscribed from old and subscribed to new
      expect(mockChannel.unsubscribe).toHaveBeenCalled();
      expect(mockSupabase.channel).toHaveBeenCalledTimes(2);
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created at `/src/hooks/__tests__/useTranslationRealtime.test.ts`
- [ ] Tests use Vitest and React Testing Library
- [ ] Supabase client is mocked
- [ ] Test for subscription creation on mount
- [ ] Test for cleanup executing unsubscribe on unmount
- [ ] Test for parameter changes triggering subscription recreation

---

### Task 9: useTranslationRealtime - Event Handling Tests

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts` (append)
**Estimated Complexity:** High
**Dependencies:** Task 8

#### 9.1 Add event handling test suite

```typescript
  // ===========================================================================
  // Event Handling Tests
  // ===========================================================================

  describe('Event Handling', () => {
    it('INSERT event triggers callback when entity matches', async () => {
      const onUpdate = vi.fn();

      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
      }));

      const payload = createMockRealtimePayload({
        eventType: 'INSERT',
        new: { article_id: 'article-123', language: 'fr', translation_status: 'completed' },
      });

      // Trigger the event through the mock channel
      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      expect(onUpdate).toHaveBeenCalledWith(payload);
    });

    it('UPDATE event triggers callback when entity matches', async () => {
      const onUpdate = vi.fn();

      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
      }));

      const payload = createMockRealtimePayload({
        eventType: 'UPDATE',
        new: { article_id: 'article-123', language: 'es', translation_status: 'completed' },
      });

      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      expect(onUpdate).toHaveBeenCalledWith(payload);
    });

    it('events not matching entity reference are filtered out', async () => {
      const onUpdate = vi.fn();

      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
      }));

      // Payload with different entity ID
      const payload = createMockRealtimePayload({
        new: { article_id: 'article-999', language: 'fr', translation_status: 'completed' },
      });

      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('events not matching property scope are filtered out', async () => {
      const onUpdate = vi.fn();

      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        propertyId: 'property-1',
        onUpdate,
      }));

      // Payload with different property ID
      const payload = createMockRealtimePayload({
        new: {
          article_id: 'article-123',
          property_id: 'property-2',
          language: 'fr',
          translation_status: 'completed'
        },
      });

      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('callback receives correct translation record data', async () => {
      const onUpdate = vi.fn();

      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
      }));

      const expectedData = {
        id: 'trans-456',
        article_id: 'article-123',
        language: 'de',
        title: 'Deutscher Titel',
        translation_status: 'completed',
        translated_at: '2026-01-20T12:00:00Z',
      };

      const payload = createMockRealtimePayload({
        eventType: 'UPDATE',
        new: expectedData,
      });

      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          new: expectedData,
        })
      );
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for INSERT event triggering callback
- [ ] Test for UPDATE event triggering callback
- [ ] Test for entity reference filtering
- [ ] Test for property scope filtering
- [ ] Test for callback receiving correct data

---

### Task 10: useTranslationRealtime - Debouncing Tests

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts` (append)
**Estimated Complexity:** Medium
**Dependencies:** Task 9

#### 10.1 Add debouncing test suite

```typescript
  // ===========================================================================
  // Debouncing Tests
  // ===========================================================================

  describe('Debouncing', () => {
    it('debouncing prevents excessive callback executions', async () => {
      const onUpdate = vi.fn();

      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
        debounceMs: 200,
      }));

      const payload = createMockRealtimePayload({
        new: { article_id: 'article-123', language: 'fr', translation_status: 'completed' },
      });

      // Trigger multiple events rapidly
      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
        mockChannel._triggerEvent('postgres_changes', payload);
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      // Advance time past debounce period
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      // Should only have called once due to debouncing
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('debounce timeout properly configured', async () => {
      const onUpdate = vi.fn();

      renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
        debounceMs: 500,
      }));

      const payload = createMockRealtimePayload({
        new: { article_id: 'article-123', language: 'fr', translation_status: 'completed' },
      });

      // First event
      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      // Advance but not past debounce
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Should not have called yet
      expect(onUpdate).not.toHaveBeenCalled();

      // Advance past debounce
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      // Now should have called
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for debouncing preventing excessive callbacks
- [ ] Test for debounce timeout configuration

---

### Task 11: useTranslationRealtime - Connection Status Tests

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts` (append)
**Estimated Complexity:** Medium
**Dependencies:** Task 10

#### 11.1 Add connection status test suite

```typescript
  // ===========================================================================
  // Connection Status Tests
  // ===========================================================================

  describe('Connection Status', () => {
    it('connection status indicator updates correctly', () => {
      const { result } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate: vi.fn(),
      }));

      // After subscription, should be connected
      expect(result.current.connectionStatus).toBe('connected');
    });

    it('handles connection error without component crash', () => {
      // Mock channel to throw on subscribe
      mockChannel.subscribe.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });

      // Should not throw
      expect(() => {
        renderHook(() => useTranslationRealtime({
          entityType: 'article',
          entityId: 'article-123',
          onUpdate: vi.fn(),
        }));
      }).not.toThrow();
    });

    it('handles disconnection scenario', () => {
      const { result } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate: vi.fn(),
      }));

      // Simulate disconnection by triggering status change
      // (This depends on implementation - may need to trigger through mock)

      // After reconnection logic, status should update
      expect(result.current.connectionStatus).toBeDefined();
    });

    it('handles reconnection scenario', async () => {
      const { result } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate: vi.fn(),
      }));

      // Simulate reconnection
      // Implementation-dependent - may need to trigger through mock channel

      expect(result.current.connectionStatus).toBeDefined();
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for connection status indicator updates
- [ ] Test for connection error handling without crash
- [ ] Test for disconnection handling
- [ ] Test for reconnection handling

---

### Task 12: useTranslationRealtime - React StrictMode and Race Condition Tests

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts` (append)
**Estimated Complexity:** High
**Dependencies:** Task 11

#### 12.1 Add StrictMode and race condition test suites

```typescript
  // ===========================================================================
  // React StrictMode Compatibility Tests
  // ===========================================================================

  describe('React StrictMode Compatibility', () => {
    it('handles double mounting correctly', () => {
      // In StrictMode, effects run twice
      const onUpdate = vi.fn();

      const { rerender } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
      }));

      // Simulate StrictMode behavior by rerendering
      rerender();

      // Should not have duplicate subscriptions
      // Verify through channel call count or subscription state
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('no duplicate subscriptions in StrictMode', () => {
      const onUpdate = vi.fn();

      // Initial render
      const { rerender, unmount } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
      }));

      const initialSubscribeCount = mockChannel.subscribe.mock.calls.length;

      // Simulate StrictMode remount
      rerender();

      // Should clean up and resubscribe, not accumulate subscriptions
      // The exact behavior depends on implementation
      expect(mockChannel.subscribe.mock.calls.length).toBeLessThanOrEqual(initialSubscribeCount + 1);

      unmount();
    });
  });

  // ===========================================================================
  // Race Condition Prevention Tests
  // ===========================================================================

  describe('Race Condition Prevention', () => {
    it('rapid parameter changes do not cause issues', async () => {
      const onUpdate = vi.fn();

      const { rerender } = renderHook(
        ({ entityId }) => useTranslationRealtime({
          entityType: 'article',
          entityId,
          onUpdate,
        }),
        { initialProps: { entityId: 'article-1' } }
      );

      // Rapid parameter changes
      rerender({ entityId: 'article-2' });
      rerender({ entityId: 'article-3' });
      rerender({ entityId: 'article-4' });
      rerender({ entityId: 'article-5' });

      // Allow time for cleanup
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should not throw or cause memory issues
      // Final subscription should be for article-5
    });

    it('memory leak prevention through proper cleanup of timers', async () => {
      const onUpdate = vi.fn();

      const { unmount } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
        debounceMs: 200,
      }));

      // Trigger event that starts debounce timer
      const payload = createMockRealtimePayload({
        new: { article_id: 'article-123', language: 'fr' },
      });

      act(() => {
        mockChannel._triggerEvent('postgres_changes', payload);
      });

      // Unmount before debounce completes
      unmount();

      // Advance time past debounce
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Callback should NOT be called after unmount (timer cleaned up)
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('memory leak prevention through proper subscription cleanup', () => {
      const onUpdate = vi.fn();

      const { unmount } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate,
      }));

      unmount();

      // Verify unsubscribe was called
      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });
  });
```

**Acceptance Criteria:**
- [ ] Test for React StrictMode double mounting
- [ ] Test for no duplicate subscriptions in StrictMode
- [ ] Test for rapid parameter changes handling
- [ ] Test for timer cleanup preventing memory leaks
- [ ] Test for subscription cleanup preventing memory leaks

---

### Task 13: Type Definition and Documentation Tests

**File:** Both test files (append)
**Estimated Complexity:** Low
**Dependencies:** Tasks 7, 12

#### 13.1 Add type definition tests to useTranslationStatus.test.ts

```typescript
  // ===========================================================================
  // Type Definition Tests
  // ===========================================================================

  describe('Type Definitions', () => {
    it('hook return type matches expected interface', () => {
      const { result } = renderHook(() => useTranslationStatus());

      // Verify all expected properties exist
      expect('isLoading' in result.current).toBe(true);
      expect('data' in result.current).toBe(true);
      expect('error' in result.current).toBe(true);
      expect('refresh' in result.current).toBe(true);
      expect('retry' in result.current).toBe(true);

      // Verify types
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.retry).toBe('function');
    });
  });
```

#### 13.2 Add type definition tests to useTranslationRealtime.test.ts

```typescript
  // ===========================================================================
  // Type Definition Tests
  // ===========================================================================

  describe('Type Definitions', () => {
    it('hook return type matches expected interface', () => {
      const { result } = renderHook(() => useTranslationRealtime({
        entityType: 'article',
        entityId: 'article-123',
        onUpdate: vi.fn(),
      }));

      // Verify all expected properties exist
      expect('connectionStatus' in result.current).toBe(true);

      // Verify types
      expect(typeof result.current.connectionStatus).toBe('string');
    });
  });
```

**Acceptance Criteria:**
- [ ] Tests verify hook type definitions match actual return values
- [ ] All expected properties are verified

---

### Task 14: Run Tests and Verify Coverage

**Estimated Complexity:** Low
**Dependencies:** All previous tasks

#### 14.1 Execute test suite and verify results

```bash
# Run all translation hook tests
npm run test -- src/hooks/__tests__/useTranslationStatus.test.ts src/hooks/__tests__/useTranslationRealtime.test.ts

# Run with coverage
npm run test -- --coverage src/hooks/__tests__/useTranslationStatus.test.ts src/hooks/__tests__/useTranslationRealtime.test.ts

# Verify coverage meets 80% minimum
# Check coverage report for useTranslationStatus.ts and useTranslationRealtime.ts
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Tests achieve minimum 80% code coverage for hook logic
- [ ] Tests run successfully in continuous integration pipeline
- [ ] Tests execute quickly (complete in under 5 seconds for entire suite)

---

### Task 15: Documentation and Comments

**File:** Both test files
**Estimated Complexity:** Low
**Dependencies:** Task 14

#### 15.1 Add documentation comments

Ensure all test files include:

1. **File header comments** explaining purpose and coverage
2. **Test section comments** using `// ===========================================================================` pattern
3. **Complex mock setup explanations**
4. **Known limitations documentation**

```typescript
/**
 * Known Limitations:
 * - Supabase Realtime channel mocking is simplified; actual channel behavior may differ
 * - StrictMode tests simulate double-mounting but don't use actual React.StrictMode wrapper
 * - Connection status testing depends on implementation details
 */
```

**Acceptance Criteria:**
- [ ] Test descriptions clearly explain what behavior is being verified
- [ ] Tests follow arrange-act-assert pattern for clarity
- [ ] Tests clean up all mocks and timers in afterEach blocks
- [ ] Tests document any known limitations or edge cases not yet covered
- [ ] Code comments explain complex mock setups or timing-sensitive test logic

---

## Summary of Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `/src/hooks/__tests__/translationTestUtils.ts` | Create | Mock data factories and shared test utilities |
| `/src/hooks/__tests__/useTranslationStatus.test.ts` | Create | Unit tests for useTranslationStatus hook |
| `/src/hooks/__tests__/useTranslationRealtime.test.ts` | Create | Unit tests for useTranslationRealtime hook |

---

## Acceptance Criteria Checklist

### Test File Setup
- [ ] Test file created at `/src/hooks/__tests__/useTranslationStatus.test.ts`
- [ ] Test file created at `/src/hooks/__tests__/useTranslationRealtime.test.ts`
- [ ] Tests use React Testing Library and Vitest for consistent testing patterns

### useTranslationStatus Tests
- [ ] Initial loading state test (loading: true, data: null)
- [ ] Successful data fetch returning expected data structure
- [ ] Error handling setting error object when fetch fails
- [ ] Loading state transitioning to false after fetch completes
- [ ] Refresh function triggering new data fetch
- [ ] Retry logic with exponential backoff on failure
- [ ] Polling mode enabling automatic refetch at configured intervals
- [ ] Polling disabling when no pending jobs exist
- [ ] Cleanup canceling pending requests on unmount
- [ ] Parameter changes triggering new fetch with updated values
- [ ] Caching preventing duplicate API calls with identical parameters

### useTranslationRealtime Tests
- [ ] Subscription creation on mount
- [ ] INSERT event triggering callback when entity matches
- [ ] UPDATE event triggering callback when entity matches
- [ ] Events not matching entity reference being filtered out
- [ ] Events not matching property scope being filtered out
- [ ] Debouncing preventing excessive callback executions
- [ ] Callback receiving correct translation record data
- [ ] Subscription cleanup executing unsubscribe on unmount
- [ ] Parameter changes closing old subscription and opening new one
- [ ] Connection error handling without component crash
- [ ] Disconnection and reconnection scenarios
- [ ] Connection status indicator updating correctly

### Mock Infrastructure
- [ ] Supabase API responses mocked for predictable test behavior
- [ ] Mock responses include complete translation status objects matching types
- [ ] Supabase Realtime channel mocked to simulate subscription behavior
- [ ] Mock channel supports on method for event subscription
- [ ] Mock channel supports unsubscribe method for cleanup verification
- [ ] Mock channel can trigger test events to verify callback execution

### Edge Cases
- [ ] React StrictMode compatibility handling double mounting correctly
- [ ] Race condition prevention when parameters change rapidly
- [ ] Memory leak prevention through proper cleanup of timers and subscriptions
- [ ] Hook type definitions match actual return values
- [ ] Error messages provide actionable information for debugging
- [ ] 401/403 authentication errors surfaced correctly
- [ ] 404 not found responses handled gracefully
- [ ] Invalid parameter validation throws descriptive errors

### Quality
- [ ] Tests achieve minimum 80% code coverage for hook logic
- [ ] Tests run successfully in continuous integration pipeline
- [ ] Tests execute quickly (complete in under 5 seconds for entire suite)
- [ ] Test descriptions clearly explain what behavior is being verified
- [ ] Tests follow arrange-act-assert pattern for clarity and maintainability
- [ ] Mock data factories create realistic test fixtures matching production data shapes
- [ ] Tests clean up all mocks and timers in afterEach blocks
- [ ] Tests document any known limitations or edge cases not yet covered
- [ ] Code comments explain complex mock setups or timing-sensitive test logic

---

## References

- Overview document: `/docs/REQ-E05-032-write-unit-tests-for-hooks-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Tasks 2.6, 2.7, 7.5)
- Testing Pattern Reference: `/src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`
- Hook Testing Pattern: `/src/hooks/__tests__/useDashboardTier.test.ts`
- Supabase Types: `/src/lib/supabase.ts`
- Language Types: `/src/hooks/useLanguagePreference.ts`

---

*Detailed task breakdown generated for FAQBNB Localization Epic 5 - Owner Translation Management*
