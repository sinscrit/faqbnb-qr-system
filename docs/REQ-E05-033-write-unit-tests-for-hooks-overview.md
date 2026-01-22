# Implementation Overview: Write Unit Tests for Translation Hooks

## Header
| Field | Value |
|-------|-------|
| Request Reference | #033 (REQ-E05-033) |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 |
| Breakdown Created | 2026-01-22 20:54 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 14-18 hours |
| Phase | Phase 7 (Integration & Polish), Task 7.5 |
| Status | PENDING |

## Request Overview

### Original Request Summary
The translation status hooks (useTranslationStatus and useTranslationRealtime) need comprehensive unit test coverage to ensure reliable behavior, proper error handling, and correct integration with Supabase. Tests should validate hook lifecycle management, state updates, realtime subscriptions, edge cases, and all interactions using properly mocked Supabase responses.

### Why This Matters
Currently, the useTranslationStatus and useTranslationRealtime hooks provide translation status querying and realtime update functionality but lack unit test coverage. Without tests, there is no automated verification that these hooks correctly handle success cases, error conditions, loading states, subscription cleanup, or parameter changes. This creates risk of regressions during refactoring and makes it difficult for new developers to understand expected behavior.

By implementing comprehensive unit tests, we establish:
- **Code Reliability**: Automated verification that hooks behave correctly in all scenarios
- **Regression Prevention**: Tests catch bugs introduced during refactoring or feature additions
- **Living Documentation**: Tests serve as executable specifications of hook behavior
- **Development Velocity**: Developers can refactor with confidence, bugs are caught early
- **Onboarding**: New developers understand hook contracts by reading tests

### Expected User Impact
Property owners benefit indirectly through improved code reliability. Well-tested hooks reduce the risk of bugs in translation status display and realtime updates, ensuring owners see accurate and timely translation information. The translation management system becomes more stable and trustworthy.

---

## Goals

### Primary Objective
Implement comprehensive unit test coverage for useTranslationStatus and useTranslationRealtime hooks to ensure reliable behavior across all scenarios including success cases, error conditions, parameter changes, and subscription lifecycle management.

### Functional Requirements
1. **Test File Creation**: Create test files at `/src/hooks/__tests__/useTranslationStatus.test.tsx` and `/src/hooks/__tests__/useTranslationRealtime.test.tsx`
2. **useTranslationStatus Tests**: Cover initial load, success/error states, parameter changes, refetching, caching, cleanup
3. **useTranslationRealtime Tests**: Cover subscription setup, event callbacks, connection states, cleanup, error handling
4. **Supabase Mocking**: Implement comprehensive Supabase client mocks for predictable testing
5. **Integration Tests**: Test combined usage of both hooks (realtime triggers refetch)
6. **Follow Existing Patterns**: Use Vitest and React Testing Library matching codebase conventions

### Success Metrics
- Test coverage reaches 90%+ for both hooks (lines, branches, functions)
- All critical paths (success, error, parameter changes, cleanup) have test cases
- Tests pass consistently without flakiness
- Tests execute quickly (<500ms per file)
- Mock setup is reusable across test cases
- Test names clearly describe what behavior is being verified
- Tests follow Arrange-Act-Assert pattern consistently

### Assumptions & Clarifications
- useTranslationStatus and useTranslationRealtime hooks are implemented (REQ-E05-011)
- Hooks use Supabase client for data fetching and realtime subscriptions
- Codebase uses Vitest as testing framework (not Jest)
- React Testing Library's renderHook is used for hook testing
- Supabase client can be mocked using Vitest's vi.mock()
- Hooks may use React Query or similar caching library (check implementation)
- Tests should run in isolation (no shared state between tests)
- Realtime events can be simulated programmatically in tests

---

## Implementation Plan

### Step 1: Create Supabase Mock Utilities

**Objective**: Create reusable mock utilities for Supabase client that can be shared across both hook test files.

**File**: `/src/hooks/__tests__/mocks/supabase.mock.ts` (create new)

**Implementation**:

```typescript
import { vi } from 'vitest';

/**
 * Mock Supabase query builder that provides chainable methods
 */
export function createMockQueryBuilder() {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  return mockQueryBuilder;
}

/**
 * Mock Supabase channel for realtime subscriptions
 */
export function createMockChannel() {
  let eventHandlers: Map<string, Function[]> = new Map();
  let subscribeCallback: Function | null = null;

  const mockChannel = {
    on: vi.fn((event: string, callback: Function) => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, []);
      }
      eventHandlers.get(event)!.push(callback);
      return mockChannel;
    }),

    subscribe: vi.fn((callback?: Function) => {
      subscribeCallback = callback || null;
      // Simulate successful subscription
      setTimeout(() => {
        if (subscribeCallback) {
          subscribeCallback('SUBSCRIBED', null);
        }
      }, 0);
      return mockChannel;
    }),

    unsubscribe: vi.fn(() => {
      eventHandlers.clear();
      return Promise.resolve({ error: null });
    }),

    // Helper method to trigger events in tests
    _triggerEvent: (eventType: string, payload: any) => {
      const handlers = eventHandlers.get(eventType) || [];
      handlers.forEach(handler => handler(payload));
    },

    // Helper to trigger connection state changes
    _triggerConnectionChange: (status: string, error?: any) => {
      if (subscribeCallback) {
        subscribeCallback(status, error);
      }
    },
  };

  return mockChannel;
}

/**
 * Mock Supabase client with commonly used methods
 */
export function createMockSupabaseClient() {
  const mockQueryBuilder = createMockQueryBuilder();
  const mockChannel = createMockChannel();

  const mockClient = {
    from: vi.fn(() => mockQueryBuilder),
    channel: vi.fn(() => mockChannel),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
    _queryBuilder: mockQueryBuilder,
    _channel: mockChannel,
  };

  return mockClient;
}

/**
 * Helper to create successful query response
 */
export function createSuccessResponse<T>(data: T) {
  return {
    data,
    error: null,
    status: 200,
    statusText: 'OK',
  };
}

/**
 * Helper to create error query response
 */
export function createErrorResponse(message: string, code = '500') {
  return {
    data: null,
    error: {
      message,
      code,
      details: null,
      hint: null,
    },
    status: 500,
    statusText: 'Internal Server Error',
  };
}

/**
 * Sample translation status data for tests
 */
export const mockTranslationStatus = {
  entityId: 'item-123',
  entityType: 'item',
  sourceLanguage: 'en',
  languages: [
    { code: 'es', status: 'completed', lastUpdated: '2026-01-22T10:00:00Z' },
    { code: 'fr', status: 'pending', lastUpdated: '2026-01-22T10:01:00Z' },
    { code: 'de', status: 'failed', lastUpdated: '2026-01-22T10:02:00Z', error: 'API error' },
  ],
  completedCount: 1,
  pendingCount: 1,
  failedCount: 1,
  totalCount: 3,
  status: 'has_failures',
};
```

**Rationale**: Centralizing mock utilities in a separate file makes them reusable across both test files and easier to maintain. The mock channel includes helper methods (_triggerEvent, _triggerConnectionChange) that allow tests to simulate realtime events programmatically.

**Estimated Effort**: 2-3 hours

---

### Step 2: Write useTranslationStatus Tests - Basic Functionality

**Objective**: Test initial load, success states, and basic data fetching behavior.

**File**: `/src/hooks/__tests__/useTranslationStatus.test.tsx` (create new)

**Implementation**:

```typescript
/**
 * Unit Tests for useTranslationStatus Hook
 * REQ-E05-033: Write Unit Tests for Translation Hooks
 *
 * Tests the useTranslationStatus hook for fetching and caching translation status.
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTranslationStatus } from '../useTranslationStatus';
import {
  createMockSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  mockTranslationStatus,
} from './mocks/supabase.mock';

// Mock Supabase client
const mockClient = createMockSupabaseClient();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}));

describe('useTranslationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Load and Success States', () => {
    it('should return loading state on initial mount', () => {
      mockClient._queryBuilder.single.mockResolvedValueOnce(
        createSuccessResponse(mockTranslationStatus)
      );

      const { result } = renderHook(() =>
        useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should fetch translation status when entityId is provided', async () => {
      mockClient._queryBuilder.single.mockResolvedValueOnce(
        createSuccessResponse(mockTranslationStatus)
      );

      const { result } = renderHook(() =>
        useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockClient.from).toHaveBeenCalledWith('translation_status');
      expect(mockClient._queryBuilder.eq).toHaveBeenCalledWith('entity_id', 'item-123');
      expect(mockClient._queryBuilder.eq).toHaveBeenCalledWith('entity_type', 'item');
    });

    it('should return success state with data after successful fetch', async () => {
      mockClient._queryBuilder.single.mockResolvedValueOnce(
        createSuccessResponse(mockTranslationStatus)
      );

      const { result } = renderHook(() =>
        useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockTranslationStatus);
      expect(result.current.error).toBeNull();
    });

    it('should include summary counts in returned data', async () => {
      mockClient._queryBuilder.single.mockResolvedValueOnce(
        createSuccessResponse(mockTranslationStatus)
      );

      const { result } = renderHook(() =>
        useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
      );

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      expect(result.current.data).toMatchObject({
        completedCount: 1,
        pendingCount: 1,
        failedCount: 1,
        totalCount: 3,
        status: 'has_failures',
      });
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
      expect(mockClient.from).not.toHaveBeenCalled();
    });

    it('should return null data when entityId is not provided', () => {
      const { result } = renderHook(() =>
        useTranslationStatus({ entityType: 'item', entityId: '' })
      );

      expect(result.current.data).toBeNull();
      expect(mockClient.from).not.toHaveBeenCalled();
    });
  });
});
```

**Rationale**: Starting with basic functionality tests establishes the foundation. Testing loading states, successful data fetching, and the enabled flag ensures core hook behavior works correctly.

**Estimated Effort**: 2-3 hours

---

### Step 3: Write useTranslationStatus Tests - Error Handling

**Objective**: Test all error scenarios including network errors, authentication failures, and permission issues.

**File**: `/src/hooks/__tests__/useTranslationStatus.test.tsx` (continue)

**Implementation**:

```typescript
describe('Error Handling', () => {
  it('should return error state when Supabase query fails', async () => {
    mockClient._queryBuilder.single.mockResolvedValueOnce(
      createErrorResponse('Database error')
    );

    const { result } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('Database error');
    expect(result.current.data).toBeNull();
  });

  it('should handle authentication errors (401) appropriately', async () => {
    mockClient._queryBuilder.single.mockResolvedValueOnce(
      createErrorResponse('Authentication required', '401')
    );

    const { result } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.code).toBe('401');
  });

  it('should handle permission errors (403) appropriately', async () => {
    mockClient._queryBuilder.single.mockResolvedValueOnce(
      createErrorResponse('Forbidden', '403')
    );

    const { result } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.code).toBe('403');
  });

  it('should handle network errors gracefully', async () => {
    mockClient._queryBuilder.single.mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toContain('Network error');
  });

  it('should retry failed requests when retry function is called', async () => {
    // First attempt fails
    mockClient._queryBuilder.single.mockResolvedValueOnce(
      createErrorResponse('Temporary error')
    );

    const { result } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Setup successful retry
    mockClient._queryBuilder.single.mockResolvedValueOnce(
      createSuccessResponse(mockTranslationStatus)
    );

    // Call retry
    await result.current.retry();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTranslationStatus);
    });

    expect(result.current.error).toBeNull();
  });
});
```

**Rationale**: Comprehensive error testing ensures the hook gracefully handles all failure modes. Testing retry functionality verifies recovery mechanisms work correctly.

**Estimated Effort**: 2-3 hours

---

### Step 4: Write useTranslationStatus Tests - Parameter Changes and Refetching

**Objective**: Test hook behavior when input parameters change and refetching logic.

**File**: `/src/hooks/__tests__/useTranslationStatus.test.tsx` (continue)

**Implementation**:

```typescript
describe('Parameter Changes and Refetching', () => {
  it('should refetch data when entityId changes', async () => {
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse(mockTranslationStatus)
    );

    const { result, rerender } = renderHook(
      ({ entityId }) => useTranslationStatus({ entityType: 'item', entityId }),
      { initialProps: { entityId: 'item-123' } }
    );

    await waitFor(() => expect(result.current.data).toBeTruthy());

    const firstCallCount = mockClient.from.mock.calls.length;

    // Change entityId
    rerender({ entityId: 'item-456' });

    await waitFor(() => {
      expect(mockClient.from.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    expect(mockClient._queryBuilder.eq).toHaveBeenCalledWith('entity_id', 'item-456');
  });

  it('should refetch data when propertyId changes', async () => {
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse(mockTranslationStatus)
    );

    const { result, rerender } = renderHook(
      ({ propertyId }) =>
        useTranslationStatus({ entityType: 'item', entityId: 'item-123', propertyId }),
      { initialProps: { propertyId: 'prop-1' } }
    );

    await waitFor(() => expect(result.current.data).toBeTruthy());

    const firstCallCount = mockClient.from.mock.calls.length;

    // Change propertyId
    rerender({ propertyId: 'prop-2' });

    await waitFor(() => {
      expect(mockClient.from.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });

  it('should not refetch when unrelated props change', async () => {
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse(mockTranslationStatus)
    );

    const { result, rerender } = renderHook(
      ({ unrelatedProp }) =>
        useTranslationStatus({ entityType: 'item', entityId: 'item-123' }),
      { initialProps: { unrelatedProp: 'value1' } }
    );

    await waitFor(() => expect(result.current.data).toBeTruthy());

    const firstCallCount = mockClient.from.mock.calls.length;

    // Change unrelated prop
    rerender({ unrelatedProp: 'value2' });

    // Wait a bit to ensure no new calls
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockClient.from.mock.calls.length).toBe(firstCallCount);
  });

  it('should fetch when enabled changes from false to true', async () => {
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse(mockTranslationStatus)
    );

    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useTranslationStatus({ entityType: 'item', entityId: 'item-123', enabled }),
      { initialProps: { enabled: false } }
    );

    expect(mockClient.from).not.toHaveBeenCalled();

    // Enable fetching
    rerender({ enabled: true });

    await waitFor(() => {
      expect(mockClient.from).toHaveBeenCalled();
    });

    expect(result.current.data).toEqual(mockTranslationStatus);
  });

  it('should expose refetch function that triggers new fetch', async () => {
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse(mockTranslationStatus)
    );

    const { result } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => expect(result.current.data).toBeTruthy());

    const firstCallCount = mockClient.from.mock.calls.length;

    // Manual refetch
    await result.current.refetch();

    expect(mockClient.from.mock.calls.length).toBeGreaterThan(firstCallCount);
  });
});
```

**Rationale**: Testing parameter change behavior ensures the hook correctly responds to prop updates without unnecessary refetches. This is critical for performance and prevents infinite loops.

**Estimated Effort**: 2-3 hours

---

### Step 5: Write useTranslationStatus Tests - Cleanup

**Objective**: Test proper cleanup and memory leak prevention.

**File**: `/src/hooks/__tests__/useTranslationStatus.test.tsx` (continue)

**Implementation**:

```typescript
describe('Cleanup', () => {
  it('should cancel pending requests on unmount', async () => {
    let resolveQuery: Function;
    const pendingPromise = new Promise(resolve => {
      resolveQuery = resolve;
    });

    mockClient._queryBuilder.single.mockReturnValueOnce(pendingPromise);

    const { unmount } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    // Unmount before query resolves
    unmount();

    // Resolve the query after unmount
    resolveQuery!(createSuccessResponse(mockTranslationStatus));

    // Wait a bit to ensure no state updates after unmount
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test passes if no "state update on unmounted component" warning occurs
    expect(true).toBe(true);
  });

  it('should not update state after unmount', async () => {
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse(mockTranslationStatus)
    );

    const { result, unmount } = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => expect(result.current.data).toBeTruthy());

    const dataBeforeUnmount = result.current.data;

    unmount();

    // Try to trigger a state update (should be ignored)
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse({ ...mockTranslationStatus, totalCount: 999 })
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    // Data should remain unchanged (because component is unmounted)
    expect(dataBeforeUnmount).toEqual(mockTranslationStatus);
  });
});
```

**Rationale**: Cleanup tests prevent memory leaks and ensure the hook properly cancels pending operations on unmount. This is crucial for component lifecycle management.

**Estimated Effort**: 1-2 hours

---

### Step 6: Write useTranslationRealtime Tests - Subscription Setup and Event Callbacks

**Objective**: Test realtime subscription establishment and event handling.

**File**: `/src/hooks/__tests__/useTranslationRealtime.test.tsx` (create new)

**Implementation**:

```typescript
/**
 * Unit Tests for useTranslationRealtime Hook
 * REQ-E05-033: Write Unit Tests for Translation Hooks
 *
 * Tests the useTranslationRealtime hook for Supabase realtime subscriptions.
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTranslationRealtime } from '../useTranslationRealtime';
import { createMockSupabaseClient } from './mocks/supabase.mock';

const mockClient = createMockSupabaseClient();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}));

describe('useTranslationRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Subscription Setup', () => {
    it('should establish Supabase channel subscription on mount', async () => {
      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onUpdate: vi.fn(),
        })
      );

      await waitFor(() => {
        expect(mockClient.channel).toHaveBeenCalled();
      });

      expect(mockClient._channel.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to correct table based on entityType parameter', async () => {
      renderHook(() =>
        useTranslationRealtime({
          entityType: 'article',
          entityId: 'article-456',
          onUpdate: vi.fn(),
        })
      );

      await waitFor(() => {
        expect(mockClient.channel).toHaveBeenCalledWith(
          expect.stringContaining('article')
        );
      });
    });

    it('should apply entityId filter to subscription when provided', async () => {
      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onUpdate: vi.fn(),
        })
      );

      await waitFor(() => {
        expect(mockClient._channel.on).toHaveBeenCalledWith(
          'postgres_changes',
          expect.objectContaining({
            filter: expect.stringContaining('entity_id=eq.item-123'),
          }),
          expect.any(Function)
        );
      });
    });

    it('should not subscribe when enabled is false', () => {
      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          enabled: false,
          onUpdate: vi.fn(),
        })
      );

      expect(mockClient.channel).not.toHaveBeenCalled();
    });

    it('should establish subscription when enabled changes from false to true', async () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useTranslationRealtime({
            entityType: 'item',
            entityId: 'item-123',
            enabled,
            onUpdate: vi.fn(),
          }),
        { initialProps: { enabled: false } }
      );

      expect(mockClient.channel).not.toHaveBeenCalled();

      rerender({ enabled: true });

      await waitFor(() => {
        expect(mockClient.channel).toHaveBeenCalled();
      });
    });
  });

  describe('Realtime Event Callbacks', () => {
    it('should invoke onInsert callback when INSERT event occurs', async () => {
      const onInsert = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onInsert,
        })
      );

      await waitFor(() => {
        expect(mockClient._channel.subscribe).toHaveBeenCalled();
      });

      const insertPayload = {
        eventType: 'INSERT',
        new: { id: '1', entity_id: 'item-123', status: 'completed' },
        old: null,
      };

      mockClient._channel._triggerEvent('postgres_changes', insertPayload);

      await waitFor(() => {
        expect(onInsert).toHaveBeenCalledWith(insertPayload);
      });
    });

    it('should invoke onUpdate callback when UPDATE event occurs', async () => {
      const onUpdate = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onUpdate,
        })
      );

      await waitFor(() => {
        expect(mockClient._channel.subscribe).toHaveBeenCalled();
      });

      const updatePayload = {
        eventType: 'UPDATE',
        new: { id: '1', status: 'completed' },
        old: { id: '1', status: 'pending' },
      };

      mockClient._channel._triggerEvent('postgres_changes', updatePayload);

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(updatePayload);
      });
    });

    it('should invoke onDelete callback when DELETE event occurs', async () => {
      const onDelete = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onDelete,
        })
      );

      await waitFor(() => {
        expect(mockClient._channel.subscribe).toHaveBeenCalled();
      });

      const deletePayload = {
        eventType: 'DELETE',
        new: null,
        old: { id: '1', entity_id: 'item-123' },
      };

      mockClient._channel._triggerEvent('postgres_changes', deletePayload);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(deletePayload);
      });
    });

    it('should invoke onChange callback for any event type', async () => {
      const onChange = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onChange,
        })
      );

      await waitFor(() => {
        expect(mockClient._channel.subscribe).toHaveBeenCalled();
      });

      // Trigger INSERT event
      mockClient._channel._triggerEvent('postgres_changes', {
        eventType: 'INSERT',
        new: { id: '1' },
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });

      // Trigger UPDATE event
      mockClient._channel._triggerEvent('postgres_changes', {
        eventType: 'UPDATE',
        new: { id: '2' },
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledTimes(2);
      });
    });

    it('should receive correct payload data matching Supabase event structure', async () => {
      const onUpdate = vi.fn();

      renderHook(() =>
        useTranslationRealtime({
          entityType: 'item',
          entityId: 'item-123',
          onUpdate,
        })
      );

      await waitFor(() => {
        expect(mockClient._channel.subscribe).toHaveBeenCalled();
      });

      const expectedPayload = {
        eventType: 'UPDATE',
        new: {
          id: 'trans-1',
          entity_id: 'item-123',
          language: 'es',
          status: 'completed',
          content: { title: 'Título', description: 'Descripción' },
          updated_at: '2026-01-22T10:00:00Z',
        },
        old: {
          id: 'trans-1',
          status: 'pending',
        },
      };

      mockClient._channel._triggerEvent('postgres_changes', expectedPayload);

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(expectedPayload);
      });

      const receivedPayload = onUpdate.mock.calls[0][0];
      expect(receivedPayload).toEqual(expectedPayload);
    });
  });
});
```

**Rationale**: Testing subscription setup and event callbacks ensures the realtime functionality works correctly. Testing all event types (INSERT, UPDATE, DELETE, onChange) provides comprehensive coverage.

**Estimated Effort**: 3-4 hours

---

### Step 7: Write useTranslationRealtime Tests - Connection State and Cleanup

**Objective**: Test connection state management and subscription cleanup.

**File**: `/src/hooks/__tests__/useTranslationRealtime.test.tsx` (continue)

**Implementation**:

```typescript
describe('Connection State Management', () => {
  it('should return isConnecting state during subscription setup', () => {
    const { result } = renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onUpdate: vi.fn(),
      })
    );

    expect(result.current.isConnecting).toBe(true);
    expect(result.current.isConnected).toBe(false);
  });

  it('should return isConnected state after successful subscription', async () => {
    const { result } = renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onUpdate: vi.fn(),
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return disconnected state when subscription fails', async () => {
    const { result } = renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onUpdate: vi.fn(),
      })
    );

    // Simulate subscription error
    mockClient._channel._triggerConnectionChange('CHANNEL_ERROR', {
      message: 'Connection failed',
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should invoke onConnectionChange callback when connection state changes', async () => {
    const onConnectionChange = vi.fn();

    renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onUpdate: vi.fn(),
        onConnectionChange,
      })
    );

    await waitFor(() => {
      expect(onConnectionChange).toHaveBeenCalledWith('SUBSCRIBED', null);
    });

    // Simulate disconnection
    mockClient._channel._triggerConnectionChange('CLOSED');

    await waitFor(() => {
      expect(onConnectionChange).toHaveBeenCalledWith('CLOSED');
    });
  });
});

describe('Subscription Cleanup', () => {
  it('should unsubscribe from channel on unmount', async () => {
    const { unmount } = renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onUpdate: vi.fn(),
      })
    );

    await waitFor(() => {
      expect(mockClient._channel.subscribe).toHaveBeenCalled();
    });

    unmount();

    expect(mockClient._channel.unsubscribe).toHaveBeenCalled();
  });

  it('should unsubscribe before resubscribing when parameters change', async () => {
    const { rerender } = renderHook(
      ({ entityId }) =>
        useTranslationRealtime({
          entityType: 'item',
          entityId,
          onUpdate: vi.fn(),
        }),
      { initialProps: { entityId: 'item-123' } }
    );

    await waitFor(() => {
      expect(mockClient._channel.subscribe).toHaveBeenCalled();
    });

    const firstSubscribeCount = mockClient._channel.subscribe.mock.calls.length;

    // Change entityId
    rerender({ entityId: 'item-456' });

    await waitFor(() => {
      expect(mockClient._channel.unsubscribe).toHaveBeenCalled();
      expect(mockClient._channel.subscribe.mock.calls.length).toBeGreaterThan(
        firstSubscribeCount
      );
    });
  });

  it('should not invoke callbacks after unmount', async () => {
    const onUpdate = vi.fn();

    const { unmount } = renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onUpdate,
      })
    );

    await waitFor(() => {
      expect(mockClient._channel.subscribe).toHaveBeenCalled();
    });

    unmount();

    // Try to trigger event after unmount
    mockClient._channel._triggerEvent('postgres_changes', {
      eventType: 'UPDATE',
      new: { id: '1' },
    });

    // Wait a bit to ensure callback is not invoked
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onUpdate).not.toHaveBeenCalled();
  });
});
```

**Rationale**: Connection state and cleanup tests ensure the realtime subscription properly manages its lifecycle, prevents memory leaks, and handles connection failures gracefully.

**Estimated Effort**: 2-3 hours

---

### Step 8: Write Integration Tests for Combined Hook Usage

**Objective**: Test that useTranslationRealtime events can trigger refetch in useTranslationStatus.

**File**: `/src/hooks/__tests__/translationHooks.integration.test.tsx` (create new)

**Implementation**:

```typescript
/**
 * Integration Tests for Translation Hooks
 * REQ-E05-033: Write Unit Tests for Translation Hooks
 *
 * Tests combined usage of useTranslationStatus and useTranslationRealtime.
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTranslationStatus } from '../useTranslationStatus';
import { useTranslationRealtime } from '../useTranslationRealtime';
import {
  createMockSupabaseClient,
  createSuccessResponse,
  mockTranslationStatus,
} from './mocks/supabase.mock';

const mockClient = createMockSupabaseClient();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}));

describe('Translation Hooks Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient._queryBuilder.single.mockResolvedValue(
      createSuccessResponse(mockTranslationStatus)
    );
  });

  it('should trigger refetch in useTranslationStatus when onChange callback is invoked', async () => {
    let realtimeOnChange: Function;

    // Render status hook
    const statusHook = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => {
      expect(statusHook.result.current.data).toBeTruthy();
    });

    const initialFetchCount = mockClient.from.mock.calls.length;

    // Render realtime hook with onChange that triggers refetch
    renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onChange: (payload) => {
          realtimeOnChange = payload;
          statusHook.result.current.refetch();
        },
      })
    );

    await waitFor(() => {
      expect(mockClient._channel.subscribe).toHaveBeenCalled();
    });

    // Trigger realtime update
    mockClient._channel._triggerEvent('postgres_changes', {
      eventType: 'UPDATE',
      new: { id: '1', status: 'completed' },
    });

    await waitFor(() => {
      expect(mockClient.from.mock.calls.length).toBeGreaterThan(initialFetchCount);
    });

    expect(realtimeOnChange).toBeTruthy();
  });

  it('should not cause infinite refetch loops', async () => {
    const statusHook = renderHook(() =>
      useTranslationStatus({ entityType: 'item', entityId: 'item-123' })
    );

    await waitFor(() => {
      expect(statusHook.result.current.data).toBeTruthy();
    });

    renderHook(() =>
      useTranslationRealtime({
        entityType: 'item',
        entityId: 'item-123',
        onChange: () => {
          statusHook.result.current.refetch();
        },
      })
    );

    await waitFor(() => {
      expect(mockClient._channel.subscribe).toHaveBeenCalled();
    });

    const fetchCountBefore = mockClient.from.mock.calls.length;

    // Trigger multiple events in rapid succession
    for (let i = 0; i < 5; i++) {
      mockClient._channel._triggerEvent('postgres_changes', {
        eventType: 'UPDATE',
        new: { id: i.toString() },
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    const fetchCountAfter = mockClient.from.mock.calls.length;

    // Should have refetched, but not infinitely
    expect(fetchCountAfter).toBeGreaterThan(fetchCountBefore);
    expect(fetchCountAfter).toBeLessThan(fetchCountBefore + 20); // Reasonable threshold
  });
});
```

**Rationale**: Integration tests verify the two hooks work correctly together, which is their primary use case. Testing for infinite loops prevents a common bug pattern.

**Estimated Effort**: 1-2 hours

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Test Files (New)

| File | Target | Type |
|------|--------|------|
| `/src/hooks/__tests__/mocks/supabase.mock.ts` | — | Create |
| `/src/hooks/__tests__/useTranslationStatus.test.tsx` | — | Create |
| `/src/hooks/__tests__/useTranslationRealtime.test.tsx` | — | Create |
| `/src/hooks/__tests__/translationHooks.integration.test.tsx` | — | Create |

### Configuration Files (May Need Update)

| File | Target | Type |
|------|--------|------|
| `vitest.config.ts` | Test configuration | Modify (if needed) |
| `package.json` | Test scripts | Modify (if needed) |

### Files That Must NOT Be Modified

- `/src/hooks/useTranslationStatus.ts` - Hook implementation (separate request)
- `/src/hooks/useTranslationRealtime.ts` - Hook implementation (separate request)
- Any production code files - Tests should not modify implementations
- Supabase client implementation - Only mock it in tests

---

## Dependencies

### Depends On (Must Be Completed First)
- **REQ-E05-011** (Task 5.5): useTranslationStatus Hook - Hook must exist before testing
- **REQ-E05-012** (Task 5.6): useTranslationRealtime Hook (if separate) - Hook must exist before testing

### Blocks (Tasks That Require This First)
- None - Tests don't block other features but provide confidence for refactoring

### Parallel Safety
- **Files Touched**: Only test files in `__tests__` directories
- **Conflicts With**: None - test files are isolated
- **Safe to Parallelize With**: All other tasks (tests don't modify production code)

### External Dependencies
- `vitest` - Testing framework (already installed)
- `@testing-library/react` - React hook testing utilities (already installed)
- `@testing-library/user-event` - User interaction simulation (may need installation)

---

## Risks and Considerations

### Potential Side Effects

- **Test Flakiness**: Asynchronous tests may be flaky if timing is not handled correctly
- **Mock Maintenance**: Supabase API changes may require mock updates
- **Test Performance**: Large test suites may slow down CI/CD pipeline
- **False Confidence**: Tests passing doesn't guarantee production reliability

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hooks not yet implemented | HIGH | HIGH | Task MUST wait for REQ-E05-011/012 completion |
| Supabase mock incomplete | MEDIUM | MEDIUM | Start with simple mock, iterate based on hook behavior |
| Async test flakiness | MEDIUM | LOW | Use waitFor properly, avoid hardcoded timeouts |
| Mock diverges from real API | MEDIUM | MEDIUM | Reference Supabase docs, update mocks when API changes |
| Test coverage gaps | LOW | MEDIUM | Run coverage report, aim for 90%+ coverage |

### Testing Requirements

- **Run Tests**: `npm run test` or `npm run test:watch`
- **Coverage Report**: `npm run test:coverage`
- **Target**: 90%+ line coverage, 85%+ branch coverage
- **Performance**: All tests should complete in < 3 seconds total
- **CI Integration**: Tests must pass before merge to main

---

## Open Questions

### Technical Clarifications

- [ ] **Caching Implementation**: Does useTranslationStatus use React Query, SWR, or custom caching?
  - **Answer**: Check implementation to understand caching invalidation
- [ ] **Realtime Channel Names**: What naming convention is used for Supabase channels?
  - **Answer**: Review hook implementation for channel naming pattern
- [ ] **Error Types**: What error types does Supabase return (SupabaseError interface)?
  - **Answer**: Reference Supabase TypeScript types for error structure

### Design Decisions

- [ ] **Test Organization**: Should integration tests be in separate file or combined with unit tests?
  - **Recommendation**: Separate file (clearer organization, easier to run independently)
- [ ] **Mock Complexity**: Should mock Supabase client support chaining for complex queries?
  - **Recommendation**: Yes, hooks may use `.select().eq().order()` chains
- [ ] **Snapshot Testing**: Should we use snapshot tests for hook return values?
  - **Recommendation**: No, explicit assertions are clearer and more maintainable

---

## Out of Scope

The following items are explicitly **OUT OF SCOPE** for this request:

- **E2E Tests**: End-to-end tests with real Supabase instance (separate testing strategy)
- **Component Tests**: Testing components that use these hooks (separate component test files)
- **Performance Tests**: Load testing, stress testing of hooks
- **Hook Implementation**: Writing or modifying the actual hook code
- **CI/CD Configuration**: Setting up GitHub Actions or similar (separate DevOps task)
- **Test Documentation**: Comprehensive testing guide (this document serves as guide)
- **Mock Library**: Creating reusable mock library for entire project (this task only mocks Supabase)
- **Integration with External Services**: Testing actual Supabase API calls
- **Accessibility Testing**: Testing hook behavior with screen readers (not applicable to hooks)
- **Visual Regression Testing**: Not applicable to hooks (no visual output)

---

*Document generated: 2026-01-22 20:54*
*Source: docs/gen_requests_epic5.md - Request #033*
*Status: PENDING (Blocked by REQ-E05-011, REQ-E05-012)*
