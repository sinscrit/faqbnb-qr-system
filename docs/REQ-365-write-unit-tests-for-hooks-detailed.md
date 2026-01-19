# REQ-365: Write Unit Tests for Translation Hooks - Detailed Task Breakdown

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Epic:** Localization Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.5
**Size:** M (Medium)
**Overview Document:** REQ-365-write-unit-tests-for-hooks-overview.md

---

## Executive Summary

This document provides a detailed, step-by-step task breakdown for implementing comprehensive unit tests for the translation management hooks (`useTranslationStatus` and `useTranslationRealtime`). The tests will ensure reliability, prevent regressions, and maintain code quality for critical translation status display and real-time subscription functionality.

---

## Prerequisites

### Required Implementations (Must Be Complete)

| Dependency | REQ ID | File Location |
|------------|--------|---------------|
| useTranslationStatus hook | REQ-343 | `/src/hooks/useTranslationStatus.ts` |
| useTranslationRealtime hook | REQ-344 | `/src/hooks/useTranslationRealtime.ts` |
| Translation status API | REQ-336 | `/src/app/api/translations/status/route.ts` |
| Translation tables | Epic 1 | Already in place |

### Test Infrastructure (Already Available)

| Dependency | Location | Status |
|------------|----------|--------|
| Vitest configuration | `/vitest.config.ts` | ✅ Configured |
| Vitest setup | `/vitest.setup.ts` | ✅ Configured |
| React Testing Library | `@testing-library/react` | ✅ Installed |
| Mock Supabase patterns | `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | ✅ Reference available |

---

## Task Breakdown

### Task 1: Create Shared Test Helpers

**File:** `/src/hooks/__tests__/helpers/mockTranslationData.ts`

**Purpose:** Create reusable mock data generators and Supabase realtime channel mocks for translation hook tests.

#### Subtask 1.1: Create Mock Translation Status Data Generator

```typescript
// Functions to implement:
// - createMockTranslationStatusResponse(overrides?: Partial<TranslationStatusData>)
// - createMockTranslationItem(entityType, entityId, status, options?)
// - createMockLanguageStatus(language, status, options?)
```

**Implementation Steps:**

1. Create the file at `/src/hooks/__tests__/helpers/mockTranslationData.ts`
2. Add file header with module documentation and lastModified date (2026-01-19)
3. Import types from translation management types
4. Implement `createMockLanguageStatus()` function:
   - Accept `language: SupportedLanguage`
   - Accept `status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
   - Accept optional `options: { content?, translatedAt?, isStale?, reviewedBy? }`
   - Return properly typed translation status object
5. Implement `createMockTranslationStatusResponse()` function:
   - Accept optional overrides for each language
   - Return complete translation status data object with all 6 languages
   - Include sensible defaults (en=completed, fr=completed, es=pending, etc.)
6. Implement `createMockTranslationItem()` function:
   - Accept `entityType: 'article' | 'item' | 'link'`
   - Accept `entityId: string`
   - Accept `options: { sourceLanguage?, translations? }`
   - Return single translation status item

**Acceptance Criteria:**
- [ ] File exists at correct location
- [ ] All generator functions are typed correctly
- [ ] Functions produce valid mock data matching expected interfaces
- [ ] Default values cover common test scenarios

#### Subtask 1.2: Create Mock Supabase Realtime Channel Helper

```typescript
// Functions to implement:
// - createMockSupabaseChannel()
// - createMockRealtimeEvent(payload)
// - simulateChannelEvent(channel, eventType, payload)
```

**Implementation Steps:**

1. Add mock Supabase channel creation function:
   ```typescript
   export function createMockSupabaseChannel() {
     const eventHandlers: Map<string, Function[]> = new Map();
     return {
       on: vi.fn((event: string, filter: object, callback: Function) => {
         // Store callback for later simulation
         const handlers = eventHandlers.get(event) || [];
         handlers.push(callback);
         eventHandlers.set(event, handlers);
         return mockChannel; // Allow chaining
       }),
       subscribe: vi.fn((callback?: Function) => {
         if (callback) callback('SUBSCRIBED');
         return { status: 'SUBSCRIBED' };
       }),
       unsubscribe: vi.fn(),
       _eventHandlers: eventHandlers, // Expose for testing
       _triggerEvent: (event: string, payload: unknown) => {
         // Helper to simulate events
       },
     };
   }
   ```
2. Add mock Supabase client factory:
   ```typescript
   export function createMockSupabaseClient(mockChannel: ReturnType<typeof createMockSupabaseChannel>) {
     return {
       channel: vi.fn(() => mockChannel),
       removeChannel: vi.fn(),
     };
   }
   ```
3. Add helper to simulate realtime events:
   ```typescript
   export function simulateRealtimeEvent(
     channel: ReturnType<typeof createMockSupabaseChannel>,
     eventType: 'INSERT' | 'UPDATE' | 'DELETE',
     payload: TranslationUpdate
   )
   ```

**Acceptance Criteria:**
- [ ] Mock channel supports `on()`, `subscribe()`, `unsubscribe()` methods
- [ ] Event handlers can be registered and triggered
- [ ] Channel allows method chaining (returns `this`)
- [ ] Events can be simulated for testing callbacks

#### Subtask 1.3: Create Mock Fetch Helper

```typescript
// Functions to implement:
// - mockFetch(response, options?)
// - createMockApiResponse(data, status?)
// - createMockApiError(message, status?)
```

**Implementation Steps:**

1. Add global fetch mock helper:
   ```typescript
   export function mockFetch(responseData: unknown, options?: { status?: number; ok?: boolean; delay?: number }) {
     const response = {
       ok: options?.ok ?? true,
       status: options?.status ?? 200,
       json: vi.fn().mockResolvedValue(responseData),
     };
     return vi.spyOn(global, 'fetch').mockResolvedValue(response as Response);
   }
   ```
2. Add API response factory functions
3. Add API error factory functions

**Acceptance Criteria:**
- [ ] Fetch mock can simulate successful responses
- [ ] Fetch mock can simulate error responses
- [ ] Fetch mock can simulate network delays (for loading state tests)
- [ ] Mock can be easily reset between tests

---

### Task 2: Create useTranslationStatus Test File

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts`

**Purpose:** Comprehensive unit tests for the translation status fetching hook.

#### Subtask 2.1: Setup Test File Structure

**Implementation Steps:**

1. Create the file at `/src/hooks/__tests__/useTranslationStatus.test.ts`
2. Add file header:
   ```typescript
   /**
    * Unit tests for useTranslationStatus hook
    *
    * Tests translation status fetching, state management, and error handling.
    *
    * @module hooks/__tests__/useTranslationStatus
    * @lastModified 2026-01-19
    * @req REQ-365
    */
   ```
3. Add imports:
   ```typescript
   import { renderHook, waitFor, act } from '@testing-library/react';
   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
   import { useTranslationStatus } from '../useTranslationStatus';
   import {
     createMockTranslationStatusResponse,
     mockFetch,
     createMockApiError,
   } from './helpers/mockTranslationData';
   ```
4. Add `beforeEach()` and `afterEach()` blocks for mock setup/cleanup:
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });

   afterEach(() => {
     vi.restoreAllMocks();
   });
   ```

**Acceptance Criteria:**
- [ ] File exists with proper header documentation
- [ ] Imports are correctly configured
- [ ] Mock setup/cleanup is properly structured

#### Subtask 2.2: Implement Initial State Tests

```typescript
describe('useTranslationStatus', () => {
  describe('initial state', () => {
    // Tests to implement
  });
});
```

**Implementation Steps:**

1. Test initial loading state:
   ```typescript
   it('should return loading state initially', () => {
     mockFetch(createMockTranslationStatusResponse(), { delay: 100 });
     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     expect(result.current.isLoading).toBe(true);
     expect(result.current.data).toBeNull();
     expect(result.current.error).toBeNull();
   });
   ```

2. Test initial fetch trigger:
   ```typescript
   it('should fetch data on mount', async () => {
     const fetchSpy = mockFetch(createMockTranslationStatusResponse());
     renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     expect(fetchSpy).toHaveBeenCalledTimes(1);
     expect(fetchSpy).toHaveBeenCalledWith(
       expect.stringContaining('/api/translations/status'),
       expect.any(Object)
     );
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies `isLoading: true` on initial render
- [ ] Test verifies `data: null` before fetch completes
- [ ] Test verifies `error: null` initially
- [ ] Test verifies API endpoint is called on mount

#### Subtask 2.3: Implement Successful Data Fetch Tests

```typescript
describe('successful data fetch', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test successful data fetch:
   ```typescript
   it('should return translation data after successful fetch', async () => {
     const mockData = createMockTranslationStatusResponse();
     mockFetch(mockData);

     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     await waitFor(() => {
       expect(result.current.isLoading).toBe(false);
     });

     expect(result.current.data).toEqual(mockData);
     expect(result.current.error).toBeNull();
   });
   ```

2. Test correct query parameters:
   ```typescript
   it('should pass correct query parameters to API', async () => {
     const fetchSpy = mockFetch(createMockTranslationStatusResponse());

     renderHook(() =>
       useTranslationStatus({
         entityType: 'item',
         entityId: 'item-123',
         propertyId: 'prop-456'
       })
     );

     await waitFor(() => expect(fetchSpy).toHaveBeenCalled());

     const calledUrl = fetchSpy.mock.calls[0][0];
     expect(calledUrl).toContain('entityType=item');
     expect(calledUrl).toContain('entityId=item-123');
     expect(calledUrl).toContain('propertyId=prop-456');
   });
   ```

3. Test data transformation (if applicable):
   ```typescript
   it('should transform API response to expected format', async () => {
     // Verify any data transformation logic
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies `isLoading: false` after fetch
- [ ] Test verifies `data` matches expected structure
- [ ] Test verifies query parameters are correctly passed
- [ ] Test verifies all entityType values work ('article', 'item', 'link')

#### Subtask 2.4: Implement Error Handling Tests

```typescript
describe('error handling', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test API error response:
   ```typescript
   it('should handle API error response', async () => {
     mockFetch(createMockApiError('Not found'), { status: 404, ok: false });

     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'invalid-id' })
     );

     await waitFor(() => {
       expect(result.current.isLoading).toBe(false);
     });

     expect(result.current.error).toBeTruthy();
     expect(result.current.data).toBeNull();
   });
   ```

2. Test network failure:
   ```typescript
   it('should handle network failure', async () => {
     vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     await waitFor(() => {
       expect(result.current.isLoading).toBe(false);
     });

     expect(result.current.error).toContain('Network error');
   });
   ```

3. Test invalid entity ID handling:
   ```typescript
   it('should handle empty entityId gracefully', async () => {
     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: '' })
     );

     // Should either not fetch or return appropriate error
     expect(result.current.data).toBeNull();
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies error state is set on API error
- [ ] Test verifies error state is set on network failure
- [ ] Test verifies data is null when error occurs
- [ ] Test verifies isLoading is false after error

#### Subtask 2.5: Implement Refetch Functionality Tests

```typescript
describe('refetch functionality', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test refetch triggers new API call:
   ```typescript
   it('should fetch new data when refetch is called', async () => {
     const fetchSpy = mockFetch(createMockTranslationStatusResponse());

     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     await waitFor(() => {
       expect(result.current.isLoading).toBe(false);
     });

     expect(fetchSpy).toHaveBeenCalledTimes(1);

     // Trigger refetch
     await act(async () => {
       await result.current.refetch();
     });

     expect(fetchSpy).toHaveBeenCalledTimes(2);
   });
   ```

2. Test refetch updates data:
   ```typescript
   it('should update data with new response on refetch', async () => {
     const initialData = createMockTranslationStatusResponse({ fr: { status: 'pending' } });
     const updatedData = createMockTranslationStatusResponse({ fr: { status: 'completed' } });

     const fetchSpy = vi.spyOn(global, 'fetch')
       .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(initialData) } as Response)
       .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(updatedData) } as Response);

     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     await waitFor(() => {
       expect(result.current.data?.translations.fr.status).toBe('pending');
     });

     await act(async () => {
       await result.current.refetch();
     });

     expect(result.current.data?.translations.fr.status).toBe('completed');
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies refetch triggers new API call
- [ ] Test verifies data updates after refetch
- [ ] Test verifies loading state during refetch

#### Subtask 2.6: Implement Edge Case Tests

```typescript
describe('edge cases', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test empty results handling:
   ```typescript
   it('should handle empty translation results', async () => {
     mockFetch({ translations: {} });

     const { result } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     await waitFor(() => {
       expect(result.current.isLoading).toBe(false);
     });

     expect(result.current.data?.translations).toEqual({});
     expect(result.current.error).toBeNull();
   });
   ```

2. Test component unmount during fetch (no state updates after unmount):
   ```typescript
   it('should not update state after unmount', async () => {
     let resolvePromise: (value: Response) => void;
     const fetchPromise = new Promise<Response>(resolve => {
       resolvePromise = resolve;
     });
     vi.spyOn(global, 'fetch').mockReturnValue(fetchPromise);

     const { result, unmount } = renderHook(() =>
       useTranslationStatus({ entityType: 'article', entityId: 'test-id' })
     );

     // Unmount before fetch completes
     unmount();

     // Resolve fetch after unmount
     resolvePromise!({ ok: true, json: () => Promise.resolve(createMockTranslationStatusResponse()) } as Response);

     // Should not throw or cause state update warnings
   });
   ```

3. Test parameter change triggers new fetch:
   ```typescript
   it('should refetch when entityId changes', async () => {
     const fetchSpy = mockFetch(createMockTranslationStatusResponse());

     const { result, rerender } = renderHook(
       ({ entityId }) => useTranslationStatus({ entityType: 'article', entityId }),
       { initialProps: { entityId: 'id-1' } }
     );

     await waitFor(() => expect(result.current.isLoading).toBe(false));
     expect(fetchSpy).toHaveBeenCalledTimes(1);

     // Change entityId
     rerender({ entityId: 'id-2' });

     await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies graceful handling of empty results
- [ ] Test verifies no state updates after unmount
- [ ] Test verifies refetch on parameter change
- [ ] Test verifies handling of null/undefined values

---

### Task 3: Create useTranslationRealtime Test File

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts`

**Purpose:** Comprehensive unit tests for the real-time subscription hook.

#### Subtask 3.1: Setup Test File Structure

**Implementation Steps:**

1. Create the file at `/src/hooks/__tests__/useTranslationRealtime.test.ts`
2. Add file header:
   ```typescript
   /**
    * Unit tests for useTranslationRealtime hook
    *
    * Tests Supabase realtime subscription lifecycle, event handling,
    * and cleanup behavior.
    *
    * @module hooks/__tests__/useTranslationRealtime
    * @lastModified 2026-01-19
    * @req REQ-365
    */
   ```
3. Add imports:
   ```typescript
   import { renderHook, act, waitFor } from '@testing-library/react';
   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
   import { useTranslationRealtime } from '../useTranslationRealtime';
   import {
     createMockSupabaseChannel,
     createMockSupabaseClient,
     simulateRealtimeEvent,
   } from './helpers/mockTranslationData';
   ```
4. Add Supabase client mock setup:
   ```typescript
   // Mock the Supabase client import
   vi.mock('@/lib/supabase', () => ({
     createBrowserClient: vi.fn(),
   }));

   let mockChannel: ReturnType<typeof createMockSupabaseChannel>;
   let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

   beforeEach(() => {
     mockChannel = createMockSupabaseChannel();
     mockSupabase = createMockSupabaseClient(mockChannel);

     // Set up the mock to return our mock client
     vi.mocked(createBrowserClient).mockReturnValue(mockSupabase);
   });

   afterEach(() => {
     vi.restoreAllMocks();
   });
   ```

**Acceptance Criteria:**
- [ ] File exists with proper header documentation
- [ ] Supabase client is properly mocked
- [ ] Mock setup/cleanup is properly structured

#### Subtask 3.2: Implement Subscription Lifecycle Tests

```typescript
describe('useTranslationRealtime', () => {
  describe('subscription lifecycle', () => {
    // Tests to implement
  });
});
```

**Implementation Steps:**

1. Test subscription created on mount:
   ```typescript
   it('should create subscription on mount', () => {
     const onUpdate = vi.fn();

     renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
       })
     );

     expect(mockSupabase.channel).toHaveBeenCalled();
     expect(mockChannel.on).toHaveBeenCalled();
     expect(mockChannel.subscribe).toHaveBeenCalled();
   });
   ```

2. Test subscription cleaned up on unmount:
   ```typescript
   it('should clean up subscription on unmount', () => {
     const onUpdate = vi.fn();

     const { unmount } = renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
       })
     );

     unmount();

     expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
   });
   ```

3. Test isSubscribed state:
   ```typescript
   it('should set isSubscribed to true after successful subscription', async () => {
     const onUpdate = vi.fn();

     const { result } = renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
       })
     );

     await waitFor(() => {
       expect(result.current.isSubscribed).toBe(true);
     });
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies subscription is created on mount
- [ ] Test verifies subscription is removed on unmount
- [ ] Test verifies isSubscribed state is accurate

#### Subtask 3.3: Implement Enabled Flag Tests

```typescript
describe('enabled flag behavior', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test enabled=false prevents subscription:
   ```typescript
   it('should not subscribe when enabled is false', () => {
     const onUpdate = vi.fn();

     renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
         enabled: false,
       })
     );

     expect(mockSupabase.channel).not.toHaveBeenCalled();
   });
   ```

2. Test enabling after mount creates subscription:
   ```typescript
   it('should create subscription when enabled changes to true', async () => {
     const onUpdate = vi.fn();

     const { rerender } = renderHook(
       ({ enabled }) => useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
         enabled,
       }),
       { initialProps: { enabled: false } }
     );

     expect(mockSupabase.channel).not.toHaveBeenCalled();

     rerender({ enabled: true });

     expect(mockSupabase.channel).toHaveBeenCalled();
   });
   ```

3. Test disabling removes subscription:
   ```typescript
   it('should remove subscription when enabled changes to false', async () => {
     const onUpdate = vi.fn();

     const { rerender } = renderHook(
       ({ enabled }) => useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
         enabled,
       }),
       { initialProps: { enabled: true } }
     );

     rerender({ enabled: false });

     expect(mockSupabase.removeChannel).toHaveBeenCalled();
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies no subscription when enabled=false
- [ ] Test verifies subscription created when enabled changes to true
- [ ] Test verifies subscription removed when enabled changes to false

#### Subtask 3.4: Implement Real-time Event Handling Tests

```typescript
describe('real-time event handling', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test onUpdate callback triggered:
   ```typescript
   it('should call onUpdate when translation event is received', async () => {
     const onUpdate = vi.fn();

     renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
       })
     );

     // Simulate a realtime event
     const payload = {
       eventType: 'UPDATE',
       new: {
         entity_type: 'article',
         entity_id: 'test-id',
         language: 'fr',
         status: 'completed',
       },
     };

     act(() => {
       simulateRealtimeEvent(mockChannel, 'UPDATE', payload);
     });

     expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
       language: 'fr',
       status: 'completed',
     }));
   });
   ```

2. Test event filtering:
   ```typescript
   it('should only respond to events for the specified entity', async () => {
     const onUpdate = vi.fn();

     renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
       })
     );

     // Simulate event for different entity
     act(() => {
       simulateRealtimeEvent(mockChannel, 'UPDATE', {
         new: { entity_id: 'different-id', language: 'fr', status: 'completed' },
       });
     });

     expect(onUpdate).not.toHaveBeenCalled();
   });
   ```

3. Test multiple sequential updates:
   ```typescript
   it('should handle multiple sequential updates', async () => {
     const onUpdate = vi.fn();

     renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
       })
     );

     act(() => {
       simulateRealtimeEvent(mockChannel, 'UPDATE', { new: { entity_id: 'test-id', language: 'fr', status: 'completed' } });
       simulateRealtimeEvent(mockChannel, 'UPDATE', { new: { entity_id: 'test-id', language: 'es', status: 'completed' } });
       simulateRealtimeEvent(mockChannel, 'UPDATE', { new: { entity_id: 'test-id', language: 'de', status: 'completed' } });
     });

     expect(onUpdate).toHaveBeenCalledTimes(3);
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies onUpdate is called with correct payload
- [ ] Test verifies events for other entities are ignored
- [ ] Test verifies multiple events are handled correctly

#### Subtask 3.5: Implement Error Handling Tests

```typescript
describe('error handling', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test subscription error state:
   ```typescript
   it('should set error state on subscription failure', async () => {
     // Configure mock to fail subscription
     mockChannel.subscribe.mockImplementation((callback?: Function) => {
       if (callback) callback('SUBSCRIPTION_ERROR', new Error('Failed to subscribe'));
       return { status: 'SUBSCRIPTION_ERROR' };
     });

     const onUpdate = vi.fn();

     const { result } = renderHook(() =>
       useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
       })
     );

     await waitFor(() => {
       expect(result.current.error).toBeTruthy();
     });

     expect(result.current.isSubscribed).toBe(false);
   });
   ```

2. Test reconnection handling (if implemented):
   ```typescript
   it('should handle channel reconnection', async () => {
     // Test reconnection behavior if the hook supports it
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies error state is set on subscription failure
- [ ] Test verifies isSubscribed is false when error occurs

#### Subtask 3.6: Implement Edge Case Tests

```typescript
describe('edge cases', () => {
  // Tests to implement
});
```

**Implementation Steps:**

1. Test rapid enable/disable toggling:
   ```typescript
   it('should handle rapid enable/disable toggling without memory leaks', async () => {
     const onUpdate = vi.fn();

     const { rerender } = renderHook(
       ({ enabled }) => useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate,
         enabled,
       }),
       { initialProps: { enabled: true } }
     );

     // Rapidly toggle enabled
     for (let i = 0; i < 10; i++) {
       rerender({ enabled: false });
       rerender({ enabled: true });
     }

     // Should have cleaned up previous subscriptions
     const removeChannelCalls = mockSupabase.removeChannel.mock.calls.length;
     expect(removeChannelCalls).toBeGreaterThanOrEqual(10);
   });
   ```

2. Test entity ID change:
   ```typescript
   it('should clean up old subscription when entityId changes', async () => {
     const onUpdate = vi.fn();

     const { rerender } = renderHook(
       ({ entityId }) => useTranslationRealtime({
         entityType: 'article',
         entityId,
         onUpdate,
       }),
       { initialProps: { entityId: 'id-1' } }
     );

     rerender({ entityId: 'id-2' });

     expect(mockSupabase.removeChannel).toHaveBeenCalled();
     expect(mockSupabase.channel).toHaveBeenCalledTimes(2);
   });
   ```

3. Test callback reference changes:
   ```typescript
   it('should use latest callback without resubscribing', async () => {
     let onUpdate = vi.fn();

     const { rerender } = renderHook(
       ({ callback }) => useTranslationRealtime({
         entityType: 'article',
         entityId: 'test-id',
         onUpdate: callback,
       }),
       { initialProps: { callback: onUpdate } }
     );

     const initialChannelCalls = mockSupabase.channel.mock.calls.length;

     // Update callback reference
     const newOnUpdate = vi.fn();
     rerender({ callback: newOnUpdate });

     // Should not have created new subscription
     expect(mockSupabase.channel.mock.calls.length).toBe(initialChannelCalls);

     // But should use new callback when event fires
     act(() => {
       simulateRealtimeEvent(mockChannel, 'UPDATE', {
         new: { entity_id: 'test-id', language: 'fr', status: 'completed' },
       });
     });

     expect(newOnUpdate).toHaveBeenCalled();
     expect(onUpdate).not.toHaveBeenCalled();
   });
   ```

**Acceptance Criteria:**
- [ ] Test verifies no memory leaks on rapid toggling
- [ ] Test verifies proper cleanup on entity change
- [ ] Test verifies latest callback is used without resubscription

---

### Task 4: Update Vitest Configuration

**File:** `/vitest.config.ts`

**Purpose:** Ensure hooks directory is included in test coverage.

#### Subtask 4.1: Add Hooks Directory to Coverage Includes

**Implementation Steps:**

1. Read current vitest.config.ts
2. Check if `src/hooks/**/*.ts` is already in coverage includes
3. If not present, add `'src/hooks/**/*.ts'` to the `coverage.include` array
4. Update the `lastModified` comment in the file header to 2026-01-19

**Current Configuration:**
```typescript
coverage: {
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/lib/job-queue/**/*.ts',
    'src/lib/translation-service/**/*.ts',
  ],
}
```

**Target Configuration:**
```typescript
coverage: {
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/lib/job-queue/**/*.ts',
    'src/lib/translation-service/**/*.ts',
    'src/hooks/**/*.ts',  // Added for REQ-365
  ],
}
```

**Acceptance Criteria:**
- [ ] Hooks directory is included in coverage configuration
- [ ] File header is updated with correct date
- [ ] Existing configuration is preserved

---

## File Summary

### Files to Create

| File Path | Purpose | Size Estimate |
|-----------|---------|---------------|
| `/src/hooks/__tests__/helpers/mockTranslationData.ts` | Shared test helpers and mock generators | ~150 lines |
| `/src/hooks/__tests__/useTranslationStatus.test.ts` | Unit tests for status hook | ~300 lines |
| `/src/hooks/__tests__/useTranslationRealtime.test.ts` | Unit tests for realtime hook | ~350 lines |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/vitest.config.ts` | Add hooks directory to coverage includes |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationStatus.ts` | Hook implementation to test |
| `/src/hooks/useTranslationRealtime.ts` | Hook implementation to test |
| `/src/hooks/__tests__/useDashboardTier.test.ts` | Testing pattern reference |
| `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Supabase mocking patterns |
| `/src/components/ItemManager/hooks/__tests__/useAssetManagement.test.ts` | Mock setup patterns |
| `/vitest.setup.ts` | Global test setup reference |

---

## Testing Commands

```bash
# Run all hook tests
npm test -- --grep "useTranslation"

# Run specific test file
npm test -- src/hooks/__tests__/useTranslationStatus.test.ts
npm test -- src/hooks/__tests__/useTranslationRealtime.test.ts

# Run with coverage
npm test -- --coverage --grep "useTranslation"

# Watch mode during development
npm test -- --watch src/hooks/__tests__/useTranslationStatus.test.ts

# Run all tests to verify integration
npm test
```

---

## Verification Checklist

### Task 1: Shared Test Helpers
- [ ] `mockTranslationData.ts` file created
- [ ] `createMockTranslationStatusResponse()` function works
- [ ] `createMockSupabaseChannel()` function works
- [ ] Mock fetch helper functions work
- [ ] All helpers are properly typed

### Task 2: useTranslationStatus Tests
- [ ] Initial state tests pass
- [ ] Successful data fetch tests pass
- [ ] Error handling tests pass
- [ ] Refetch functionality tests pass
- [ ] Edge case tests pass
- [ ] All tests use proper async/await patterns
- [ ] Tests follow existing codebase patterns

### Task 3: useTranslationRealtime Tests
- [ ] Subscription lifecycle tests pass
- [ ] Enabled flag behavior tests pass
- [ ] Real-time event handling tests pass
- [ ] Error handling tests pass
- [ ] Edge case tests pass
- [ ] Tests properly mock Supabase realtime

### Task 4: Configuration
- [ ] Coverage includes hooks directory
- [ ] All tests run successfully with `npm test`
- [ ] Coverage report shows hooks included

### Final Verification
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Coverage meets 80%+ threshold for hooks
- [ ] Tests follow existing patterns from `useDashboardTier.test.ts` and `useAssetManagement.test.ts`

---

## Acceptance Criteria (from REQ-365)

- [ ] Unit tests exist for `useTranslationStatus` hook covering all state transitions (loading, success, error)
- [ ] Unit tests exist for `useTranslationRealtime` hook covering subscription lifecycle and real-time updates
- [ ] Supabase client responses are properly mocked to avoid external dependencies during testing
- [ ] Tests verify correct handling of edge cases (network failures, empty results, invalid data)
- [ ] All tests pass successfully and are integrated into the project's test suite
- [ ] Test coverage for hooks meets or exceeds project standards (80%+)

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic 5 PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Request Registry: `/docs/gen_requests_epic5.md` (REQ-365)
- Overview Document: `/docs/REQ-365-write-unit-tests-for-hooks-overview.md`
- Hook testing example: `/src/hooks/__tests__/useDashboardTier.test.ts`
- Supabase mock reference: `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts`
- Asset management tests: `/src/components/ItemManager/hooks/__tests__/useAssetManagement.test.ts`
- Vitest documentation: https://vitest.dev/
- React Testing Library hooks: https://testing-library.com/docs/react-testing-library/api#renderhook
