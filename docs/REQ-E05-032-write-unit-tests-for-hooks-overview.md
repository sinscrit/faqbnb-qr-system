# REQ-E05-032: Unit Tests for Translation Management Hooks - Implementation Overview

**Generated:** 2026-01-20 13:45:00 UTC
**Last Modified:** 2026-01-20 13:45:00 UTC
**Request ID:** REQ-E05-032
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.5
**Size:** M (Medium)
**Priority:** P2 - Medium

---

## Summary

Create comprehensive unit tests for the `useTranslationStatus` and `useTranslationRealtime` hooks to ensure reliable translation status management functionality. These hooks are critical for property owners to view and monitor translation progress in real-time.

---

## Dependencies

### Required Epic 1 Components
| Dependency | Status | Notes |
|------------|--------|-------|
| Translation tables (`article_translations`, `item_translations`, `link_translations`) | Required | Schema must exist |
| Translation job queue (`translation_jobs`) | Required | For status tracking |
| `SupportedLanguage` type definition | Available | Defined in `/src/hooks/useLanguagePreference.ts` |

### Required Epic 5 Components (Must Be Implemented First)
| Dependency | Location | Notes |
|------------|----------|-------|
| `useTranslationStatus` hook | `/src/hooks/useTranslationStatus.ts` | Hook to be tested |
| `useTranslationRealtime` hook | `/src/hooks/useTranslationRealtime.ts` | Hook to be tested |
| Translation Status API | `/src/app/api/translations/status/route.ts` | API endpoint used by hooks |
| TranslationManagement types | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions |

---

## Technical Context

### Existing Testing Patterns

The codebase follows consistent testing patterns using:

| Pattern | Example Location |
|---------|------------------|
| Vitest + React Testing Library | `/src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` |
| Hook testing with `renderHook` | `/src/hooks/__tests__/useDashboardTier.test.ts` |
| Mock fetch patterns | `/src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` |
| Async state testing | `/src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` |
| Vitest configuration | `vitest-environment: jsdom` |

### Testing Infrastructure

```typescript
// Standard test imports pattern
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock patterns
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Cleanup patterns
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Supabase Realtime Mocking Pattern

The `useTranslationRealtime` hook will use Supabase Realtime subscriptions. Mock pattern:

```typescript
// Mock Supabase channel
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
};

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));
```

---

## Implementation Approach

### Phase 1: useTranslationStatus Test Suite

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts`

#### Test Categories

1. **Initialization Tests**
   - Returns correct initial state (loading: true, data: null)
   - Provides required functions (refresh, retry)

2. **Data Fetching Tests**
   - Successfully fetches translation status
   - Returns expected data structure
   - Loading state transitions correctly (true → false)
   - Error handling when fetch fails

3. **Parameter Handling Tests**
   - Fetch with entityType filter
   - Fetch with entityId filter
   - Fetch with status filter
   - Parameter changes trigger new fetch
   - Caching prevents duplicate API calls

4. **Retry and Refresh Tests**
   - Refresh function triggers new data fetch
   - Retry logic with exponential backoff (3 attempts)
   - Retry resets error state

5. **Polling Mode Tests**
   - Polling mode enables automatic refetch at intervals
   - Polling disables when no pending jobs exist
   - Polling cleanup on unmount

6. **Cleanup Tests**
   - Cleanup cancels pending requests on unmount
   - AbortController properly aborts on unmount

7. **Error Handling Tests**
   - 401/403 authentication errors surfaced correctly
   - 404 not found responses handled gracefully
   - Network errors handled with appropriate messages
   - Invalid parameter validation throws descriptive errors

### Phase 2: useTranslationRealtime Test Suite

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts`

#### Test Categories

1. **Subscription Lifecycle Tests**
   - Subscription created on mount
   - Subscription cleanup executes unsubscribe on unmount
   - Parameter changes close old subscription and open new one

2. **Event Handling Tests**
   - INSERT event triggers callback when entity matches
   - UPDATE event triggers callback when entity matches
   - Events not matching entity reference filtered out
   - Events not matching property scope filtered out
   - Callback receives correct translation record data

3. **Debouncing Tests**
   - Debouncing prevents excessive callback executions
   - Debounce timeout properly configured

4. **Connection Status Tests**
   - Connection status indicator updates correctly
   - Connection error handling without component crash
   - Disconnection and reconnection scenarios

5. **React StrictMode Compatibility**
   - Double mounting handled correctly
   - No duplicate subscriptions in StrictMode

6. **Race Condition Prevention**
   - Rapid parameter changes don't cause issues
   - Memory leak prevention through proper cleanup

---

## Test Data Factories

### Translation Status Mock Data

```typescript
// Factory for creating mock translation status responses
export function createMockTranslationStatusResponse(overrides?: Partial<TranslationStatusResponse>): TranslationStatusResponse {
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

export function createMockTranslationStatusItem(overrides?: Partial<TranslationStatusItem>): TranslationStatusItem {
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
```

### Realtime Event Mock Data

```typescript
export function createMockRealtimePayload(overrides?: Partial<RealtimePayload>): RealtimePayload {
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
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/__tests__/useTranslationStatus.test.ts` | Unit tests for useTranslationStatus hook |
| `/src/hooks/__tests__/useTranslationRealtime.test.ts` | Unit tests for useTranslationRealtime hook |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationStatus.ts` | Hook implementation to test |
| `/src/hooks/useTranslationRealtime.ts` | Hook implementation to test |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Type definitions |
| `/src/hooks/useLanguagePreference.ts` | SupportedLanguage type reference |
| `/src/lib/supabase.ts` | Supabase client for mocking reference |
| `/src/hooks/__tests__/useDashboardTier.test.ts` | Testing pattern reference |
| `/src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` | Async hook testing pattern reference |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Test Coverage |
|---------------------|---------------|
| Test file created at `/src/hooks/__tests__/useTranslationStatus.test.ts` | Phase 1 |
| Test file created at `/src/hooks/__tests__/useTranslationRealtime.test.ts` | Phase 2 |
| Tests use React Testing Library and Vitest | All tests |
| useTranslationStatus: initial loading state test | Phase 1, Category 1 |
| useTranslationStatus: successful data fetch test | Phase 1, Category 2 |
| useTranslationStatus: error handling test | Phase 1, Category 7 |
| useTranslationStatus: loading state transition test | Phase 1, Category 2 |
| useTranslationStatus: refresh function test | Phase 1, Category 4 |
| useTranslationStatus: retry logic test | Phase 1, Category 4 |
| useTranslationStatus: polling mode test | Phase 1, Category 5 |
| useTranslationStatus: polling disable test | Phase 1, Category 5 |
| useTranslationStatus: cleanup test | Phase 1, Category 6 |
| useTranslationStatus: parameter changes test | Phase 1, Category 3 |
| useTranslationStatus: caching test | Phase 1, Category 3 |
| Supabase API mocking with jest.mock | All tests |
| useTranslationRealtime: subscription creation test | Phase 2, Category 1 |
| useTranslationRealtime: INSERT event test | Phase 2, Category 2 |
| useTranslationRealtime: UPDATE event test | Phase 2, Category 2 |
| useTranslationRealtime: entity filtering test | Phase 2, Category 2 |
| useTranslationRealtime: property scope filtering test | Phase 2, Category 2 |
| useTranslationRealtime: debouncing test | Phase 2, Category 3 |
| useTranslationRealtime: callback data test | Phase 2, Category 2 |
| useTranslationRealtime: cleanup test | Phase 2, Category 1 |
| useTranslationRealtime: parameter changes test | Phase 2, Category 1 |
| useTranslationRealtime: connection error test | Phase 2, Category 4 |
| useTranslationRealtime: reconnection test | Phase 2, Category 4 |
| useTranslationRealtime: connection status test | Phase 2, Category 4 |
| Mock channel implementation with on/unsubscribe | Test infrastructure |
| Mock channel event triggering | Test infrastructure |
| React StrictMode compatibility test | Phase 2, Category 5 |
| Race condition prevention test | Phase 2, Category 6 |
| Memory leak prevention test | Phase 2, Category 6 |
| Type definition matching test | All tests |
| Actionable error messages test | Phase 1, Category 7 |
| 401/403 authentication error test | Phase 1, Category 7 |
| 404 not found test | Phase 1, Category 7 |
| Invalid parameter validation test | Phase 1, Category 7 |
| Minimum 80% code coverage | Test coverage goal |
| Tests run in CI pipeline | CI integration |
| Tests execute under 5 seconds | Performance requirement |
| Clear test descriptions | All tests |
| Arrange-act-assert pattern | All tests |
| Mock data factories | Test infrastructure |
| afterEach cleanup | Test infrastructure |
| Known limitations documentation | Test file comments |
| Complex mock setup comments | Test file comments |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| useTranslationStatus hook not yet implemented | High | Wait for Phase 2 (Task 2.6) completion before implementing tests |
| useTranslationRealtime hook not yet implemented | High | Wait for Phase 2 (Task 2.7) completion before implementing tests |
| Supabase Realtime mocking complexity | Medium | Reference existing async patterns in useUrlPreview.test.ts |
| StrictMode double-mounting edge cases | Low | Include explicit StrictMode compatibility tests |
| Flaky timing-dependent tests | Medium | Use vi.useFakeTimers() consistently |

---

## Implementation Order

1. **Prerequisite Check:** Verify `useTranslationStatus.ts` and `useTranslationRealtime.ts` exist
2. **Phase 1:** Create `useTranslationStatus.test.ts` with all test categories
3. **Phase 2:** Create `useTranslationRealtime.test.ts` with all test categories
4. **Validation:** Run test suite, verify coverage meets 80% minimum
5. **Documentation:** Add comments for complex mocking setups

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Tasks 2.6, 2.7, 7.5)
- Testing Pattern Reference: `/src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`
- Hook Testing Pattern: `/src/hooks/__tests__/useDashboardTier.test.ts`
- Supabase Types: `/src/lib/supabase.ts`
- Language Types: `/src/hooks/useLanguagePreference.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 5 - Owner Translation Management*
