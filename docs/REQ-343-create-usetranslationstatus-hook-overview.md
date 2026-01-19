# REQ-343: Create useTranslationStatus Hook - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-343 (REQ-314 in gen_requests_epic5.md)
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.6
**Size:** M (Medium)
**Priority:** P2

---

## Summary

Create a reusable React hook (`useTranslationStatus`) that fetches translation status data from the backend API for use in translation management interfaces. The hook must support querying translation status for individual entities (article, item, link) or property-wide aggregates, and return standard loading, error, and data states following established hook patterns in the codebase.

---

## Background

Property owners need to view and manage translations of their content through the Translation Management UI. The `useTranslationStatus` hook provides the data-fetching abstraction that powers these interfaces by:

1. Fetching translation status from the `/api/translations/status` endpoint (to be created in Task 1.1)
2. Supporting flexible query scopes (single entity vs property-wide)
3. Providing consistent loading/error states across all translation components
4. Auto-refetching when query parameters change

---

## Dependencies

### Epic Dependencies

| Dependency | Status | Required By |
|------------|--------|-------------|
| Epic 1 - Foundation | Required | Translation tables must exist |
| Epic 3 - Dynamic Content Translation | Required | Translation status data must be populated |
| Task 1.1 - Translation Status API | Required | API endpoint must exist for hook to call |

### Codebase Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `apiRequest` utility | `/src/lib/api.ts` | Standard API call pattern with auth handling |
| `TranslationStatus` type | `/src/lib/translation-service/translation-service.types.ts` | Type definitions |
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts` | Language code types |
| Authentication context | `/src/contexts/AuthContext.tsx` | User authentication state |

---

## Technical Approach

### Hook Interface Design

```typescript
// src/hooks/useTranslationStatus.ts

interface UseTranslationStatusOptions {
  /** Optional entity type to filter by */
  entityType?: 'article' | 'item' | 'link';
  /** Optional entity ID for single-entity queries */
  entityId?: string;
  /** Optional property ID for property-wide queries */
  propertyId?: string;
  /** Optional status filter */
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  /** Auto-refetch interval in ms (0 = disabled) */
  refetchInterval?: number;
}

interface TranslationStatusSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}

interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      isStale?: boolean;
      translatedAt?: string;
      reviewedBy?: string;
    };
  };
}

interface UseTranslationStatusReturn {
  /** Summary counts of translation statuses */
  summary: TranslationStatusSummary | null;
  /** Individual translation status items */
  items: TranslationStatusItem[];
  /** Loading state during initial fetch */
  isLoading: boolean;
  /** Refreshing state during refetch */
  isRefreshing: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Timestamp of last successful fetch */
  lastUpdated: Date | null;
  /** Manual refresh function */
  refresh: () => Promise<void>;
}
```

### Implementation Pattern

The hook follows the established pattern from `useDashboardStats.ts`:

1. **State Management**: Use `useState` for loading, error, data, and timestamp states
2. **Effect-based Fetching**: Auto-fetch on mount and when parameters change
3. **Stale Request Handling**: Use `isStale` flag to prevent race conditions
4. **Error Handling**: Convert API errors to user-friendly messages via `ApiError`
5. **Refresh Capability**: Expose `refresh` function for manual updates
6. **Dependency Tracking**: Include all query parameters in effect dependencies

### API Integration

The hook calls `GET /api/translations/status` with query parameters:

```
GET /api/translations/status?entityType=article&entityId=123
GET /api/translations/status?propertyId=456
GET /api/translations/status?status=failed&propertyId=456
```

---

## Implementation Tasks

### Task 1: Create Hook File Structure
- Create `/src/hooks/useTranslationStatus.ts`
- Add file header with REQ reference and timestamps
- Import required dependencies

### Task 2: Define TypeScript Interfaces
- Define `UseTranslationStatusOptions` interface
- Define `TranslationStatusSummary` interface
- Define `TranslationStatusItem` interface
- Define `UseTranslationStatusReturn` interface
- Export all interfaces for external use

### Task 3: Implement Core Hook Logic
- Initialize state with `useState`:
  - `summary: TranslationStatusSummary | null`
  - `items: TranslationStatusItem[]`
  - `isLoading: boolean`
  - `isRefreshing: boolean`
  - `error: string | null`
  - `lastUpdated: number | null`
- Create `fetchStatus` callback with `useCallback`
- Handle `isRefresh` parameter for loading vs refreshing states

### Task 4: Implement API Call
- Build query string from options (entityType, entityId, propertyId, status)
- Call `apiRequest<TranslationStatusResponse>` with authentication
- Parse response and update state
- Handle API errors with user-friendly messages

### Task 5: Implement Auto-fetch Effect
- Create effect that triggers on mount
- Track stale state for race condition prevention
- Refetch when options change (entityType, entityId, propertyId, status)
- Cleanup function to mark stale on unmount

### Task 6: Implement Manual Refresh
- Create `refresh` function with `useCallback`
- Prevent duplicate calls while refreshing
- Return Promise for await-ability

### Task 7: Implement Optional Polling
- Support `refetchInterval` option
- Set up interval timer when interval > 0
- Clear interval on unmount or interval change

### Task 8: Export Hook
- Default export the hook function
- Named exports for interfaces

---

## Authorized Files and Functions for Modification

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationStatus.ts` | Main hook implementation |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useDashboardStats.ts` | Pattern reference for hook structure |
| `/src/hooks/useLanguagePreference.ts` | Pattern reference for API integration |
| `/src/lib/api.ts` | API request utility and error handling |
| `/src/lib/translation-service/translation-service.types.ts` | Type definitions |
| `/src/contexts/AuthContext.tsx` | Authentication context reference |

### Functions/Patterns to Follow

| Pattern | Source | Usage |
|---------|--------|-------|
| State initialization | `useDashboardStats.ts:81-87` | Initialize hook state |
| Fetch callback | `useDashboardStats.ts:93-143` | API fetch with error handling |
| Stale request handling | `useDashboardStats.ts:162-234` | Race condition prevention |
| API request pattern | `api.ts:28-117` | Authenticated API calls |
| Error handling | `api.ts:119-169` | User-friendly error messages |

---

## Acceptance Criteria

Based on REQ-314:

- [ ] Hook accepts optional entity ID parameter for single-entity queries
- [ ] Hook accepts optional property ID parameter for property-wide queries
- [ ] Hook returns loading boolean indicating whether data is being fetched
- [ ] Hook returns error object containing error details when requests fail
- [ ] Hook returns data object containing translation status records when successful
- [ ] Hook automatically refetches data when parameters change
- [ ] Hook handles authentication errors by returning appropriate error state
- [ ] Hook handles network failures gracefully without crashing consuming components
- [ ] Hook provides TypeScript types for all return values
- [ ] Hook can be used by multiple components simultaneously without conflicts

---

## Testing Strategy

### Unit Tests (Future Task 7.5)

1. Test initial loading state
2. Test successful data fetch
3. Test error handling for network failures
4. Test error handling for authentication errors
5. Test parameter change triggers refetch
6. Test manual refresh function
7. Test polling interval when enabled
8. Mock Supabase/API responses

### Integration Points

- Component: `TranslationPreviewPanel` (Task 2.2)
- Component: `TranslationStatusWidget` (Task 3.1)
- Component: `TranslationStatusColumn` (Task 3.2)
- Page: `/dashboard2/translations/page.tsx` (Task 4.3)

---

## Example Usage

```tsx
// Single entity status
const { summary, items, isLoading, error, refresh } = useTranslationStatus({
  entityType: 'article',
  entityId: articleId,
});

// Property-wide status
const { summary, items, isLoading, error } = useTranslationStatus({
  propertyId: selectedPropertyId,
});

// Filtered by status with polling
const { items, isLoading, refresh } = useTranslationStatus({
  propertyId: selectedPropertyId,
  status: 'failed',
  refetchInterval: 30000, // Poll every 30 seconds
});

// In component
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage message={error} onRetry={refresh} />;

return (
  <div>
    <ProgressBar
      completed={summary?.complete ?? 0}
      total={summary?.total ?? 0}
    />
    {items.map(item => (
      <TranslationStatusItem key={item.entityId} item={item} />
    ))}
  </div>
);
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API endpoint not ready | High | Blocks hook | Create mock/stub response for development |
| Race conditions on rapid parameter changes | Medium | Stale data displayed | Implement stale flag pattern from useDashboardStats |
| Performance with large datasets | Low | Slow UI | Add pagination support to API/hook |
| Multiple hook instances causing duplicate requests | Low | Wasted API calls | Consider SWR or React Query in future |

---

## Notes

- This hook depends on Task 1.1 (Translation Status API) being completed first
- The hook follows the exact pattern established in `useDashboardStats.ts` for consistency
- Future enhancement: Consider migrating to SWR or React Query for automatic caching and deduplication
- The `refetchInterval` option enables real-time updates during translation processing

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Details: `/docs/gen_requests_epic5.md` (REQ-314)
- Hook Pattern: `/src/hooks/useDashboardStats.ts`
- API Pattern: `/src/lib/api.ts`
- Type Definitions: `/src/lib/translation-service/translation-service.types.ts`
