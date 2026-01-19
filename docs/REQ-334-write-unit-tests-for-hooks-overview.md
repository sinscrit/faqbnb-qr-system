# REQ-334: Write Unit Tests for Translation Hooks - Implementation Breakdown

**Document Generated:** 2026-01-18 15:30:00 UTC
**Last Modified:** 2026-01-18 15:30:00 UTC
**Request ID:** REQ-334
**Phase:** 7 - Integration & Polish
**Task ID:** 7.5
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P2 - Medium
**PRD Reference:** /docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Summary

This task creates comprehensive unit tests for the `useTranslationStatus` and `useTranslationRealtime` hooks that were created in Phase 2 of Epic 5. The tests validate correct behavior for data fetching, state management, realtime subscription handling, and error conditions. Testing follows established project patterns using Vitest and React Testing Library.

---

## Dependencies

### Epic Dependencies
| Epic | Status | Dependency Type |
|------|--------|-----------------|
| Epic 1 (Foundation) | Required | Translation tables, job queue, language preference columns |
| Epic 3 (Dynamic Content) | Required | Translation trigger system, status tracking |
| Epic 5 Phase 2 | Required | `useTranslationStatus` and `useTranslationRealtime` hooks must exist |

### Internal Dependencies
| Dependency | Location | Purpose |
|------------|----------|---------|
| `useTranslationStatus` hook | `/src/hooks/useTranslationStatus.ts` | Hook to be tested |
| `useTranslationRealtime` hook | `/src/hooks/useTranslationRealtime.ts` | Hook to be tested |
| Supabase client | `/src/lib/supabase.ts` | Mock target for database operations |
| Translation types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Type definitions for test data |
| Vitest setup | `/vitest.setup.ts` | Test environment configuration |

---

## Technical Context

### Existing Testing Patterns
The project uses Vitest with React Testing Library. Key patterns observed:

```typescript
// Hook mocking pattern
vi.mock('@/hooks/useQRCodeGeneration');
const mockedHook = useQRCodeGeneration as vi.MockedFunction<typeof useQRCodeGeneration>;

// renderHook usage
const { result, rerender } = renderHook(() => useMyHook(props));

// Async state updates
await act(async () => {
  await result.current.someFunction();
});

// Factory pattern for test data
const createMockItem = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test Item',
  ...overrides,
});
```

### Reference Test Files
| File | Purpose | Pattern Reference |
|------|---------|-------------------|
| `/src/components/ItemCapture/hooks/__tests__/useItemValidation.test.ts` | Comprehensive hook test (515 lines) | State testing, memoization, real-time updates |
| `/src/components/ItemCreationWorkflow/hooks/__tests__/useSessionQRGeneration.test.ts` | Async operations testing (395 lines) | Mocking underlying hooks, retry logic |
| `/src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts` | Test utilities (458 lines) | Factory functions, mock providers |

### Supabase Integration Patterns
The hooks will interact with Supabase for:
1. **Data fetching** - `supabase.from('*_translations').select()`
2. **Realtime subscriptions** - `supabase.channel().on('postgres_changes').subscribe()`

Both need to be mocked for unit tests.

---

## Implementation Approach

### Task 1: Create Test Infrastructure

**File:** `/src/hooks/__tests__/translationHooks.setup.ts`

Create shared mock factories and test utilities for translation hook testing:

```typescript
// Mock factory for translation status data
export const createMockTranslationStatus = (overrides = {}) => ({
  entityType: 'article',
  entityId: 'test-article-id',
  language: 'es',
  status: 'completed',
  content: { title: 'Título traducido', description: 'Descripción' },
  translatedAt: '2026-01-18T10:00:00Z',
  isStale: false,
  reviewedBy: null,
  ...overrides,
});

// Mock factory for realtime event payloads
export const createMockRealtimePayload = (eventType, data) => ({
  eventType, // INSERT, UPDATE, DELETE
  new: eventType !== 'DELETE' ? data : null,
  old: eventType !== 'INSERT' ? data : null,
  commit_timestamp: new Date().toISOString(),
});

// Mock Supabase client factory
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
  })),
  removeChannel: vi.fn(),
});
```

### Task 2: Write Tests for useTranslationStatus Hook

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts`

#### Test Suite Structure

```
describe('useTranslationStatus')
├── describe('initialization')
│   ├── returns loading state initially
│   ├── returns undefined data before fetch completes
│   └── returns null error initially
├── describe('single entity queries')
│   ├── fetches status for specific entityId
│   ├── returns data when fetch succeeds
│   ├── handles empty translation records
│   └── includes all 6 supported languages in response
├── describe('property-wide queries')
│   ├── fetches aggregated status for propertyId
│   ├── returns summary counts by status
│   └── includes all entity types in response
├── describe('parameter changes')
│   ├── refetches when entityId changes
│   ├── refetches when propertyId changes
│   └── cancels previous request on parameter change
├── describe('error handling')
│   ├── returns error state when fetch fails
│   ├── handles network errors gracefully
│   ├── handles authentication errors with appropriate message
│   └── does not crash component on error
├── describe('loading states')
│   ├── sets loading true during fetch
│   ├── sets loading false after success
│   └── sets loading false after error
└── describe('TypeScript types')
    └── provides correct types for return values
```

#### Key Test Cases

**Test: Returns loading state initially**
```typescript
it('returns loading state initially', () => {
  const { result } = renderHook(() =>
    useTranslationStatus({ entityId: 'test-id', entityType: 'article' })
  );

  expect(result.current.isLoading).toBe(true);
  expect(result.current.data).toBeUndefined();
  expect(result.current.error).toBeNull();
});
```

**Test: Fetches status for specific entityId**
```typescript
it('fetches status for specific entityId', async () => {
  const mockData = [
    createMockTranslationStatus({ language: 'es', status: 'completed' }),
    createMockTranslationStatus({ language: 'fr', status: 'pending' }),
  ];

  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }),
  });

  const { result } = renderHook(() =>
    useTranslationStatus({ entityId: 'test-id', entityType: 'article' })
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toHaveLength(2);
  expect(result.current.data[0].status).toBe('completed');
});
```

**Test: Handles authentication errors**
```typescript
it('handles authentication errors with appropriate error state', async () => {
  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'JWT expired', code: 'PGRST301' }
      }),
    }),
  });

  const { result } = renderHook(() =>
    useTranslationStatus({ entityId: 'test-id', entityType: 'article' })
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.error).not.toBeNull();
  expect(result.current.error?.message).toContain('authentication');
});
```

**Test: Refetches when entityId changes**
```typescript
it('refetches when entityId changes', async () => {
  const { result, rerender } = renderHook(
    ({ entityId }) => useTranslationStatus({ entityId, entityType: 'article' }),
    { initialProps: { entityId: 'id-1' } }
  );

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  const fetchCount = mockSupabase.from.mock.calls.length;

  rerender({ entityId: 'id-2' });

  await waitFor(() => {
    expect(mockSupabase.from.mock.calls.length).toBe(fetchCount + 1);
  });
});
```

### Task 3: Write Tests for useTranslationRealtime Hook

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts`

#### Test Suite Structure

```
describe('useTranslationRealtime')
├── describe('subscription setup')
│   ├── establishes Supabase realtime subscription on mount
│   ├── filters by authenticated user account
│   ├── filters by entityId when provided
│   └── filters by propertyId when provided
├── describe('INSERT events')
│   ├── updates state when translation insert event received
│   ├── adds new translation to existing state
│   └── triggers re-render in consuming components
├── describe('UPDATE events')
│   ├── updates state when translation update event received
│   ├── replaces existing translation with updated data
│   └── preserves other translations in state
├── describe('DELETE events')
│   ├── updates state when translation delete event received
│   └── removes deleted translation from state
├── describe('cleanup')
│   ├── unsubscribes from channel on unmount
│   ├── removes channel from Supabase client
│   └── does not leak subscriptions on rapid mount/unmount
├── describe('parameter changes')
│   ├── resubscribes when entityId changes
│   ├── resubscribes when propertyId changes
│   └── unsubscribes from old channel before new subscription
├── describe('error handling')
│   ├── handles realtime connection errors gracefully
│   ├── does not crash on malformed event payloads
│   └── recovers from temporary disconnections
└── describe('TypeScript types')
    └── provides correct types for subscription payloads
```

#### Key Test Cases

**Test: Establishes realtime subscription on mount**
```typescript
it('establishes Supabase realtime subscription on mount', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  };
  mockSupabase.channel.mockReturnValue(mockChannel);

  renderHook(() => useTranslationRealtime({ entityId: 'test-id' }));

  expect(mockSupabase.channel).toHaveBeenCalledWith(
    expect.stringContaining('translation-')
  );
  expect(mockChannel.on).toHaveBeenCalledWith(
    'postgres_changes',
    expect.objectContaining({ event: '*', table: expect.any(String) }),
    expect.any(Function)
  );
  expect(mockChannel.subscribe).toHaveBeenCalled();
});
```

**Test: Updates state on INSERT event**
```typescript
it('updates state when translation insert event received', async () => {
  let eventCallback: (payload: any) => void;

  const mockChannel = {
    on: vi.fn((event, filter, callback) => {
      eventCallback = callback;
      return mockChannel;
    }),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  };
  mockSupabase.channel.mockReturnValue(mockChannel);

  const { result } = renderHook(() =>
    useTranslationRealtime({ entityId: 'test-id' })
  );

  // Simulate INSERT event
  const newTranslation = createMockTranslationStatus({
    language: 'de',
    status: 'completed'
  });

  act(() => {
    eventCallback(createMockRealtimePayload('INSERT', newTranslation));
  });

  expect(result.current.translations).toContainEqual(
    expect.objectContaining({ language: 'de', status: 'completed' })
  );
});
```

**Test: Unsubscribes on unmount**
```typescript
it('unsubscribes from channel on unmount', () => {
  const unsubscribeMock = vi.fn();
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: unsubscribeMock }),
  };
  mockSupabase.channel.mockReturnValue(mockChannel);

  const { unmount } = renderHook(() =>
    useTranslationRealtime({ entityId: 'test-id' })
  );

  unmount();

  expect(unsubscribeMock).toHaveBeenCalled();
  expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
});
```

**Test: Resubscribes when entityId changes**
```typescript
it('resubscribes when entityId changes', async () => {
  const unsubscribeMock = vi.fn();
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: unsubscribeMock }),
  };
  mockSupabase.channel.mockReturnValue(mockChannel);

  const { rerender } = renderHook(
    ({ entityId }) => useTranslationRealtime({ entityId }),
    { initialProps: { entityId: 'id-1' } }
  );

  const initialSubscribeCount = mockChannel.subscribe.mock.calls.length;

  rerender({ entityId: 'id-2' });

  expect(unsubscribeMock).toHaveBeenCalled();
  expect(mockChannel.subscribe.mock.calls.length).toBe(initialSubscribeCount + 1);
});
```

**Test: Handles malformed event payloads gracefully**
```typescript
it('does not crash on malformed event payloads', () => {
  let eventCallback: (payload: any) => void;

  const mockChannel = {
    on: vi.fn((event, filter, callback) => {
      eventCallback = callback;
      return mockChannel;
    }),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  };
  mockSupabase.channel.mockReturnValue(mockChannel);

  const { result } = renderHook(() =>
    useTranslationRealtime({ entityId: 'test-id' })
  );

  // Send malformed payload - should not throw
  expect(() => {
    act(() => {
      eventCallback({ invalid: 'payload' });
      eventCallback(null);
      eventCallback({ eventType: 'UNKNOWN', new: null, old: null });
    });
  }).not.toThrow();

  // Hook should still be functional
  expect(result.current).toBeDefined();
});
```

### Task 4: Create Mock Supabase Module

**File:** `/src/hooks/__tests__/__mocks__/supabase.ts`

```typescript
// Mock module for Supabase client
import { vi } from 'vitest';

export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    in: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  });

  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  });

  const mockChannel = vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({
      unsubscribe: vi.fn()
    }),
  });

  return {
    from: mockFrom,
    channel: mockChannel,
    removeChannel: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      }),
    },
    // Helper methods for test setup
    __mockSelect: mockSelect,
    __mockFrom: mockFrom,
    __mockChannel: mockChannel,
  };
};

// Default mock instance
export const mockSupabaseClient = createMockSupabaseClient();

// vi.mock helper
export const setupSupabaseMock = () => {
  vi.mock('@/lib/supabase', () => ({
    createBrowserClient: () => mockSupabaseClient,
    supabase: mockSupabaseClient,
  }));
};
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose | Estimated Lines |
|-----------|---------|-----------------|
| `/src/hooks/__tests__/useTranslationStatus.test.ts` | Unit tests for useTranslationStatus hook | 300-400 |
| `/src/hooks/__tests__/useTranslationRealtime.test.ts` | Unit tests for useTranslationRealtime hook | 350-450 |
| `/src/hooks/__tests__/translationHooks.setup.ts` | Shared test utilities and mock factories | 100-150 |
| `/src/hooks/__tests__/__mocks__/supabase.ts` | Mock Supabase client for testing | 80-100 |

### Files to Review (Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationStatus.ts` | Hook implementation to be tested |
| `/src/hooks/useTranslationRealtime.ts` | Hook implementation to be tested |
| `/src/lib/supabase.ts` | Real Supabase client implementation (for mock accuracy) |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Type definitions |
| `/vitest.config.ts` | Test configuration reference |
| `/vitest.setup.ts` | Global test setup reference |

### Reference Files (Patterns to Follow)

| File Path | Pattern to Apply |
|-----------|------------------|
| `/src/components/ItemCapture/hooks/__tests__/useItemValidation.test.ts` | Comprehensive hook testing structure |
| `/src/components/ItemCreationWorkflow/hooks/__tests__/useSessionQRGeneration.test.ts` | Async operations and mocking |
| `/src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts` | Factory function patterns |

---

## Acceptance Criteria Mapping

| AC from REQ-334 | Implementation Task |
|-----------------|---------------------|
| Test suite created for useTranslationStatus | Task 2: Full test file |
| Tests verify hook returns loading state | Task 2: `describe('initialization')` |
| Tests verify hook returns data state | Task 2: `describe('single entity queries')` |
| Tests verify hook returns error state | Task 2: `describe('error handling')` |
| Tests verify authentication error handling | Task 2: `handles authentication errors` test |
| Tests verify refetch on parameter change | Task 2: `describe('parameter changes')` |
| Tests mock Supabase select queries | Task 4: Mock module |
| Test suite created for useTranslationRealtime | Task 3: Full test file |
| Tests verify subscription establishment | Task 3: `establishes subscription on mount` |
| Tests verify entity ID filtering | Task 3: `filters by entityId when provided` |
| Tests verify property ID filtering | Task 3: `filters by propertyId when provided` |
| Tests verify INSERT event handling | Task 3: `describe('INSERT events')` |
| Tests verify UPDATE event handling | Task 3: `describe('UPDATE events')` |
| Tests verify DELETE event handling | Task 3: `describe('DELETE events')` |
| Tests verify unsubscribe on unmount | Task 3: `unsubscribes from channel on unmount` |
| Tests mock realtime subscription | Task 4: Mock channel implementation |
| Tests verify graceful error handling | Task 3: `describe('error handling')` |
| Tests verify resubscribe on param change | Task 3: `resubscribes when entityId changes` |
| All tests pass in CI | Configure in vitest.config.ts (existing) |
| Test coverage meets standards | Comprehensive test suites (90%+ coverage target) |
| Tests execute quickly | Proper mocking, no network calls |
| Mock implementations accurate | Task 4: Based on real Supabase client API |

---

## Implementation Order

1. **Task 4: Create Mock Supabase Module** (First - enables all other tests)
2. **Task 1: Create Test Infrastructure** (Shared utilities)
3. **Task 2: Write useTranslationStatus Tests** (Can run independently)
4. **Task 3: Write useTranslationRealtime Tests** (Can run independently)

Tasks 2 and 3 can be developed in parallel after Tasks 1 and 4 are complete.

---

## Testing Commands

```bash
# Run all translation hook tests
npm test -- --filter="useTranslation"

# Run specific test file
npm test -- src/hooks/__tests__/useTranslationStatus.test.ts

# Run with coverage
npm test -- --coverage --filter="useTranslation"

# Run in watch mode during development
npm test -- --watch --filter="useTranslation"
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hooks not yet implemented | Medium | High | Create tests first as TDD, verify hook exists before running |
| Supabase mock doesn't match real API | Low | Medium | Reference `/src/lib/supabase.ts` for accurate mock structure |
| Realtime subscription testing complexity | Medium | Medium | Use callback capture pattern, test event emission separately |
| Flaky async tests | Low | Medium | Use proper `waitFor` and `act`, avoid arbitrary timeouts |
| Test isolation issues | Low | Low | Reset mocks in `beforeEach`, clear state between tests |

---

## Notes

1. **TDD Approach**: If hooks don't exist yet, these test files serve as specifications. Tests will fail initially and pass once hooks are implemented correctly.

2. **Coverage Targets**: Aim for 90%+ line coverage on both hooks. Focus on:
   - All code paths (success, error, loading)
   - Parameter variations
   - Lifecycle events (mount, unmount, rerender)

3. **Performance**: All tests should complete in < 5 seconds total. Mocking eliminates network latency.

4. **CI Integration**: Tests will run automatically via existing Vitest configuration in `/vitest.config.ts`.

---

## References

- PRD: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 7.5)
- REQ-334: `/docs/gen_requests_epic5.md` (Request #334)
- Vitest Documentation: https://vitest.dev/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Supabase Realtime: https://supabase.com/docs/guides/realtime
