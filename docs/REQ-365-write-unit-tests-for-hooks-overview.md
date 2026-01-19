# REQ-365: Write Unit Tests for Translation Hooks - Implementation Overview

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation
**Epic:** Localization Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.5
**Size:** M (Medium)

---

## Summary

Implement comprehensive unit tests for the translation management hooks (`useTranslationStatus` and `useTranslationRealtime`) to ensure reliability and prevent regressions. These hooks are critical for displaying translation status across the owner dashboard and managing real-time subscription updates when translations complete.

---

## Dependencies

### Required Prior Implementation

| Dependency | REQ ID | Status |
|------------|--------|--------|
| useTranslationStatus hook | REQ-343 (Task 2.6) | Must be implemented first |
| useTranslationRealtime hook | REQ-344 (Task 2.7) | Must be implemented first |
| Translation status API | REQ-336 (Task 1.1) | Required for hook data fetching |
| Translation tables | Epic 1 | Required (already in place) |

### Test Infrastructure Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| Vitest configuration | `/vitest.config.ts` | Test runner setup |
| Vitest setup | `/vitest.setup.ts` | Global mocks (localStorage, etc.) |
| React Testing Library | `@testing-library/react` | Hook testing utilities |
| Mock Supabase patterns | `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Reference for Supabase mocking |

---

## Technical Context

### Existing Hook Testing Patterns in Codebase

The project follows established patterns for testing hooks:

1. **Pure utility function tests** (`useDashboardTier.test.ts`):
   - Test exported functions directly without React rendering
   - Test edge cases and boundary conditions
   - Test with invalid inputs (NaN, Infinity, negative numbers)

2. **Mock setup patterns** (`useAssetManagement.test.ts`):
   - Mock browser APIs (URL.createObjectURL, localStorage)
   - Use `vi.fn()` for creating mock functions
   - Reset mocks in `beforeEach()` and restore in `afterEach()`
   - Create helper functions for mock data generation

3. **Supabase mocking patterns** (`mockSupabase.ts`):
   - In-memory mock database for isolation
   - Chainable mock methods matching Supabase client API
   - Support for `from().select().eq()` query patterns
   - RPC function mocking for stored procedures

### Hook Interfaces to Test

Based on the implementation plan (Task 2.6, 2.7), the hooks should have these interfaces:

```typescript
// useTranslationStatus hook interface
interface UseTranslationStatusParams {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  propertyId?: string;
}

interface UseTranslationStatusReturn {
  data: TranslationStatusData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface TranslationStatusData {
  translations: {
    [language: string]: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      content?: { title?: string; description?: string; name?: string };
      translatedAt?: string;
      isStale?: boolean;
      reviewedBy?: string;
    };
  };
}

// useTranslationRealtime hook interface
interface UseTranslationRealtimeParams {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  onUpdate: (translation: TranslationUpdate) => void;
  enabled?: boolean;
}

interface UseTranslationRealtimeReturn {
  isSubscribed: boolean;
  error: string | null;
}
```

---

## Implementation Approach

### Test File Structure

```
/src/hooks/__tests__/
├── useTranslationStatus.test.ts      # Unit tests for status hook
└── useTranslationRealtime.test.ts    # Unit tests for realtime hook
```

### Testing Scenarios for useTranslationStatus

#### State Transitions
1. **Initial loading state** - Hook returns `isLoading: true` initially
2. **Successful data fetch** - Returns translation data after API call
3. **Error state** - Returns error when API fails
4. **Refetch functionality** - `refetch()` triggers new API call

#### Data Fetching
5. **Correct API endpoint called** - Verifies `/api/translations/status` is called
6. **Query parameters passed correctly** - entityType, entityId, propertyId
7. **Response data transformation** - API response mapped to hook return format

#### Edge Cases
8. **Empty results handling** - Graceful handling when no translations exist
9. **Invalid entity ID** - Returns appropriate error
10. **Network failure** - Error state with retry capability
11. **Component unmount during fetch** - No state updates after unmount

### Testing Scenarios for useTranslationRealtime

#### Subscription Lifecycle
1. **Subscription created on mount** - Supabase channel subscription established
2. **Subscription cleaned up on unmount** - Channel removed properly
3. **Enabled flag respected** - No subscription when `enabled: false`

#### Real-time Updates
4. **onUpdate callback triggered** - Called when translation changes received
5. **Correct event type filtering** - Only reacts to relevant events
6. **Multiple updates handled** - Sequential updates processed correctly

#### Error Handling
7. **Subscription error state** - `error` populated on subscription failure
8. **Reconnection handling** - Handles dropped connections gracefully
9. **Invalid channel configuration** - Proper error reporting

#### Edge Cases
10. **Rapid enable/disable toggling** - No memory leaks or duplicate subscriptions
11. **Entity ID change** - Old subscription cleaned up, new one created
12. **Callback reference changes** - Uses latest callback without resubscribing

---

## Implementation Tasks

### Task 1: Create useTranslationStatus Test File

**File:** `/src/hooks/__tests__/useTranslationStatus.test.ts`

Create comprehensive unit tests covering:
- All state transitions (loading → success/error)
- API endpoint verification
- Query parameter validation
- Response data transformation
- Error handling and retry logic
- Edge cases (empty results, invalid inputs, unmount)

### Task 2: Create useTranslationRealtime Test File

**File:** `/src/hooks/__tests__/useTranslationRealtime.test.ts`

Create comprehensive unit tests covering:
- Subscription lifecycle (mount/unmount)
- Real-time event handling
- onUpdate callback invocation
- Error state management
- Enabled flag behavior
- Cleanup on entity change

### Task 3: Create Shared Test Helpers

**File:** `/src/hooks/__tests__/helpers/mockTranslationData.ts`

Create helper functions for:
- Generating mock translation status data
- Creating mock Supabase realtime channels
- Simulating realtime events

### Task 4: Update Vitest Configuration

**File:** `/vitest.config.ts`

Update coverage includes to add hooks directory if not already present.

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/__tests__/useTranslationStatus.test.ts` | Unit tests for translation status hook |
| `/src/hooks/__tests__/useTranslationRealtime.test.ts` | Unit tests for realtime subscription hook |
| `/src/hooks/__tests__/helpers/mockTranslationData.ts` | Shared test data generators |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/vitest.config.ts` | Add hooks directory to coverage includes (if needed) |

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

## Test Data Structures

### Mock Translation Status Response

```typescript
const mockTranslationStatusResponse = {
  translations: {
    en: { status: 'completed', translatedAt: '2026-01-19T10:00:00Z' },
    fr: { status: 'completed', translatedAt: '2026-01-19T10:01:00Z' },
    es: { status: 'pending' },
    de: { status: 'processing' },
    nl: { status: 'failed' },
    it: { status: 'manual', reviewedBy: 'user-123', isStale: true },
  },
};
```

### Mock Supabase Realtime Channel

```typescript
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ status: 'SUBSCRIBED' }),
  unsubscribe: vi.fn(),
};

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
};
```

---

## Acceptance Criteria

- [ ] Unit tests exist for `useTranslationStatus` hook covering all state transitions (loading, success, error)
- [ ] Unit tests exist for `useTranslationRealtime` hook covering subscription lifecycle and real-time updates
- [ ] Supabase client responses are properly mocked to avoid external dependencies during testing
- [ ] Tests verify correct handling of edge cases (network failures, empty results, invalid data)
- [ ] All tests pass successfully and are integrated into the project's test suite
- [ ] Test coverage for hooks meets or exceeds project standards (80%+)
- [ ] Tests follow existing codebase patterns from `useDashboardTier.test.ts` and `useAssetManagement.test.ts`

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: useTranslationStatus tests | 2-3 hours |
| Task 2: useTranslationRealtime tests | 2-3 hours |
| Task 3: Shared test helpers | 1 hour |
| Task 4: Configuration updates | 30 minutes |
| **Total** | **5-7 hours** |

---

## Testing Commands

```bash
# Run all hook tests
npm test -- --grep "useTranslation"

# Run with coverage
npm test -- --coverage --grep "useTranslation"

# Watch mode during development
npm test -- --watch src/hooks/__tests__/useTranslationStatus.test.ts
```

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic 5 PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Request Registry: `/docs/gen_requests_epic5.md` (REQ-365)
- Hook testing example: `/src/hooks/__tests__/useDashboardTier.test.ts`
- Supabase mock reference: `/src/lib/job-queue/__tests__/helpers/mockSupabase.ts`
- Vitest documentation: https://vitest.dev/
- React Testing Library hooks: https://testing-library.com/docs/react-testing-library/api#renderhook
