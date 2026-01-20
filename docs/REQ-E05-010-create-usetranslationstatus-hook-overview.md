# REQ-E05-010: Create useTranslationStatus Hook - Implementation Overview

**Request ID:** REQ-E05-010
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.6
**Title:** Create useTranslationStatus hook
**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## 1. Summary

This task implements a reusable React hook (`useTranslationStatus`) that fetches and monitors translation status for individual content items or entire properties. The hook provides standardized data fetching with loading states, error handling, automatic retry logic, optional polling for real-time updates, and a manual refresh capability.

---

## 2. Requirements Reference

### From gen_requests_epic5.md - REQ-E05-011:

> **Translation Status Monitoring React Hook**
>
> Property owners need a reusable React hook that fetches and monitors translation status for individual content items or entire properties, providing loading states, error handling, and automatic refresh capabilities.
>
> **Expected Behavior:**
> A custom React hook accepts either a single entity reference or a property-wide scope parameter, fetches translation status from the API endpoint, returns data in a standardized format with loading and error states, supports manual refresh actions, and optionally polls for updates when translation jobs are actively processing.

### From Implementation Plan (Plan-111):

> **Task 2.6:** Create useTranslationStatus hook
> - File: `/src/hooks/useTranslationStatus.ts`
> - Fetch translation status from API
> - Support single entity or property-wide
> - Return loading, error, data states

---

## 3. Technical Approach

### 3.1 Hook Architecture

The hook will follow existing patterns established in `useDashboardStats.ts` and `useLanguagePreference.ts`:

1. **State Management**: Use React's `useState` for managing loading, error, and data states
2. **Effect Handling**: Use `useEffect` with cleanup for initial fetch and parameter change detection
3. **Stale Request Prevention**: Implement `isStale` flag pattern to handle rapid parameter changes
4. **API Integration**: Use existing `apiRequest` utility from `@/lib/api`
5. **Callback Memoization**: Use `useCallback` for refresh and refetch functions

### 3.2 Hook Signature

```typescript
interface UseTranslationStatusParams {
  // For single entity queries
  entityType?: EntityType;
  entityId?: string;

  // For property-wide queries
  propertyId?: string;

  // Optional filters
  status?: TranslationStatus;
  language?: SupportedLanguage;

  // Polling configuration
  pollingEnabled?: boolean;
  pollingInterval?: number; // milliseconds, default 5000
}

interface UseTranslationStatusReturn {
  data: TranslationStatusResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  hasPendingJobs: boolean;
}
```

### 3.3 API Integration

The hook will integrate with the translation status API endpoint (REQ-E05-001):
- **Endpoint**: `GET /api/translations/status`
- **Query Parameters**: `entityType`, `entityId`, `status`, `propertyId`, `language`
- **Response Structure**:
  ```typescript
  interface TranslationStatusResponse {
    summary: {
      total: number;
      complete: number;
      partial: number;
      pending: number;
      failed: number;
    };
    items: TranslationStatusItem[];
  }
  ```

### 3.4 Key Features

1. **Dual Query Modes**:
   - Single entity mode: Pass `entityType` + `entityId`
   - Property-wide mode: Pass `propertyId`

2. **Automatic Retry Logic**:
   - 3 retry attempts with exponential backoff (1s, 2s, 4s)
   - Only retry on server errors (5xx) and network failures

3. **Optional Polling**:
   - Enable via `pollingEnabled` parameter
   - Auto-disable when no pending translation jobs exist
   - Configurable interval (default: 5 seconds)

4. **Result Caching**:
   - Prevent redundant API calls when parameters unchanged
   - Clear cache on parameter changes

5. **Race Condition Prevention**:
   - Mark requests as stale when parameters change rapidly
   - Proper cleanup on unmount

---

## 4. Dependencies

### 4.1 Epic Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Translation status API endpoint | REQ-E05-001 | Required |
| Translation database tables | Epic 1 | Required |
| Translation job queue | Epic 1 | Required |

### 4.2 Code Dependencies

| Dependency | Path | Purpose |
|------------|------|---------|
| `apiRequest` | `@/lib/api` | HTTP request utility |
| `ApiError` | `@/lib/api` | Error class |
| `SupportedLanguage` | `@/lib/job-queue/translation-jobs.types.ts` | Language type |
| `EntityType` | `@/lib/job-queue/translation-jobs.types.ts` | Entity type |
| `TranslationStatusResponse` | TBD (REQ-E05-006) | Response type |

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useTranslationStatus.ts` | Main hook implementation |

### 5.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/hooks/index.ts` (if exists) | Export the new hook |

### 5.3 Files for Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useDashboardStats.ts` | Pattern reference for state management, stale request handling |
| `/src/hooks/useLanguagePreference.ts` | Pattern reference for async operations, error handling |
| `/src/lib/api.ts` | API utilities and error handling |
| `/src/lib/job-queue/translation-jobs.types.ts` | Type definitions for EntityType, SupportedLanguage |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared translation types (from REQ-E05-006) |

---

## 6. Implementation Tasks

### Task 6.1: Create Hook Type Definitions
- Define `UseTranslationStatusParams` interface
- Define `UseTranslationStatusReturn` interface
- Define internal state interface
- Import and re-export necessary types

### Task 6.2: Implement Core State Management
- Initialize state with `useState` for loading, error, data, lastUpdated
- Implement separate `isRefreshing` state for manual refresh vs initial load
- Track `hasPendingJobs` computed from data

### Task 6.3: Implement Fetch Logic with Retry
- Create internal `fetchStatus` function
- Implement exponential backoff retry logic (3 attempts)
- Build query string from parameters
- Handle API errors appropriately

### Task 6.4: Implement Auto-Fetch Effect
- Use `useEffect` for initial fetch and parameter change detection
- Implement `isStale` flag pattern for race condition prevention
- Handle cleanup on unmount or parameter change

### Task 6.5: Implement Polling Logic
- Create polling effect with `setInterval`
- Auto-disable polling when `hasPendingJobs` is false
- Clean up interval on unmount or when polling disabled

### Task 6.6: Implement Manual Refresh
- Create memoized `refresh` callback with `useCallback`
- Prevent duplicate refresh calls
- Set `isRefreshing` state during manual refresh

### Task 6.7: Parameter Validation
- Validate required parameters based on query mode
- Throw descriptive errors for invalid input
- Handle React StrictMode double-mounting

### Task 6.8: Export Hook
- Export hook from file
- Add to hooks index if applicable
- Add JSDoc documentation

---

## 7. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| Hook file created at `/src/hooks/useTranslationStatus.ts` | Task 6.1 |
| Hook accepts entity reference parameters (entityType and entityId) | Task 6.1, 6.7 |
| Hook accepts propertyId parameter for property-wide queries | Task 6.1, 6.7 |
| Hook accepts optional filter parameters (status, language) | Task 6.1 |
| Hook returns data object containing translation status records | Task 6.2 |
| Hook returns loading boolean | Task 6.2 |
| Hook returns error object | Task 6.2 |
| Hook returns refresh function | Task 6.6 |
| Hook implements automatic retry logic (3 attempts with exponential backoff) | Task 6.3 |
| Hook supports optional polling mode with configurable interval | Task 6.5 |
| Hook automatically disables polling when no pending jobs exist | Task 6.5 |
| Hook cleans up polling intervals and pending requests on unmount | Task 6.4, 6.5 |
| Hook integrates with translation status GET API endpoint | Task 6.3 |
| Hook handles 401/403 responses appropriately | Task 6.3 |
| Hook handles 404 responses gracefully | Task 6.3 |
| Hook caches results to prevent redundant API calls | Task 6.4 |
| Hook includes TypeScript type definitions | Task 6.1 |
| Hook validates required parameters | Task 6.7 |
| Hook works correctly with React StrictMode | Task 6.7 |
| Hook prevents race conditions when parameters change rapidly | Task 6.4 |
| Loading state is true during initial fetch | Task 6.2 |
| Error state clears when successful refetch occurs | Task 6.3 |

---

## 8. Code Example

```typescript
// Basic usage - single entity
const { data, isLoading, error, refresh } = useTranslationStatus({
  entityType: 'article',
  entityId: 'abc123'
});

// Property-wide usage
const { data, isLoading, error } = useTranslationStatus({
  propertyId: 'prop456'
});

// With polling enabled
const { data, isLoading, hasPendingJobs } = useTranslationStatus({
  entityType: 'item',
  entityId: 'item789',
  pollingEnabled: true,
  pollingInterval: 3000 // 3 seconds
});

// With filters
const { data } = useTranslationStatus({
  propertyId: 'prop456',
  status: 'pending',
  language: 'fr'
});
```

---

## 9. Testing Considerations

1. **Unit Tests**:
   - Test initial fetch behavior
   - Test parameter change handling
   - Test retry logic with mock failures
   - Test polling start/stop behavior
   - Test cleanup on unmount
   - Test React StrictMode compatibility

2. **Integration Tests**:
   - Test with actual API endpoint
   - Test authentication error handling
   - Test network failure recovery

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API endpoint not ready | Medium | High | Stub API response for development |
| Polling causes excessive API calls | Low | Medium | Auto-disable when no pending jobs |
| Memory leak from uncleaned intervals | Low | Medium | Proper cleanup in useEffect |
| Race conditions with rapid changes | Low | Medium | Stale flag pattern |

---

## 11. Dependencies on Other Requests

| Request | Dependency Type | Notes |
|---------|-----------------|-------|
| REQ-E05-001 | Required | Translation Status API endpoint |
| REQ-E05-006 | Recommended | Shared type definitions |

---

## 12. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Pattern Reference: `/src/hooks/useDashboardStats.ts`
- Pattern Reference: `/src/hooks/useLanguagePreference.ts`
- API Utilities: `/src/lib/api.ts`
- Type Definitions: `/src/lib/job-queue/translation-jobs.types.ts`
