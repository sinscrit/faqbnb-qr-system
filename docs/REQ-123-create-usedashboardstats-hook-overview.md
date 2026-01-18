# REQ-123: Create useDashboardStats Hook - Implementation Overview

**Document Created:** 2026-01-06 14:45:00 UTC
**Last Modified:** 2026-01-06 14:45:00 UTC
**Request Reference:** docs/gen_requests.md - Request #123
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Task 2.2)
**Status:** Ready for Implementation

---

## 1. Overview

### 1.1 Summary

Create a custom React hook `useDashboardStats` to manage the fetching, caching, and refreshing of dashboard statistics (Items, Rooms, Tags counts) from the existing `/api/user/dashboard/stats` endpoint. The hook will provide loading, error, and success states along with a manual `refresh()` function for on-demand data updates.

### 1.2 Business Context

This hook enables:
- Real-time visibility into user's dashboard metrics without page reload
- Manual refresh capability for users who add new items/properties
- Consistent state management pattern for dashboard data
- Foundation for the StatisticsCards component (Task 2.3)

### 1.3 Dependencies

| Dependency | Status | Description |
|------------|--------|-------------|
| `/api/user/dashboard/stats` API | **COMPLETE** (REQ-122) | Backend API endpoint at `src/app/api/user/dashboard/stats/route.ts` |
| `@/lib/api` utilities | **EXISTING** | `apiRequest` helper for authenticated API calls |
| `@/contexts/AuthContext` | **EXISTING** | Authentication state and user context |

---

## 2. Technical Context

### 2.1 Existing Patterns to Follow

Based on codebase analysis, the hook should follow these established patterns:

**From `src/hooks/usePermissions.ts`:**
- Use `'use client'` directive for client-side hooks
- Export single function with explicit state interface
- Use `useState` with typed state object
- Use `useCallback` for memoized functions
- Use `useEffect` for auto-loading on dependency changes
- Include debug logging with consistent prefix
- Return object with state properties and action functions

**From `src/lib/api.ts`:**
- Use `apiRequest<T>()` with generics for typed responses
- Use `requireAuth: true` for authenticated endpoints
- Handle `ApiError` for error classification

**From `src/components/KPIDashboardOverview.tsx`:**
- Pattern for async data fetching within components
- Loading/error state management
- Refresh function pattern

### 2.2 API Response Shape

From `src/app/api/user/dashboard/stats/route.ts`:

```typescript
// Success response
{
  success: true,
  data: {
    itemCount: number;
    roomCount: number;
    tagCount: number;
  }
}

// Error response
{
  success: false,
  error: string
}
```

### 2.3 Technology Stack

| Technology | Version | Usage |
|------------|---------|-------|
| React | 18+ | Hooks (useState, useCallback, useEffect) |
| TypeScript | 5.x | Type definitions |
| Next.js | 15.5.9 | Client components |

---

## 3. Implementation Specification

### 3.1 File Location

**Create:** `/src/hooks/useDashboardStats.ts`

### 3.2 Type Definitions

```typescript
/**
 * Dashboard statistics data shape from API
 */
export interface DashboardStats {
  itemCount: number;
  roomCount: number;
  tagCount: number;
}

/**
 * API response wrapper
 */
interface DashboardStatsResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

/**
 * Hook state interface
 */
interface UseDashboardStatsState {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Hook return interface
 */
interface UseDashboardStatsReturn {
  // Data
  stats: DashboardStats | null;

  // Loading states
  isLoading: boolean;      // Initial load
  isRefreshing: boolean;   // Refresh operation

  // Error state
  error: string | null;

  // Metadata
  lastUpdated: Date | null;

  // Actions
  refresh: () => Promise<void>;
}
```

### 3.3 Hook Implementation Logic

```
FUNCTION useDashboardStats():

  STATE:
    - stats: DashboardStats | null = null
    - isLoading: boolean = true (initially)
    - isRefreshing: boolean = false
    - error: string | null = null
    - lastUpdated: number | null = null

  FUNCTION fetchStats(isRefresh: boolean):
    1. IF isRefresh:
         SET isRefreshing = true
       ELSE:
         SET isLoading = true
    2. SET error = null

    3. TRY:
         response = await apiRequest<DashboardStatsResponse>(
           '/user/dashboard/stats',
           {},
           true // requireAuth
         )

         IF response.success AND response.data:
           SET stats = response.data
           SET lastUpdated = Date.now()
           SET error = null
         ELSE:
           SET error = response.error || 'Failed to load statistics'

    4. CATCH error:
         SET error = error.message || 'An unexpected error occurred'

    5. FINALLY:
         SET isLoading = false
         SET isRefreshing = false

  FUNCTION refresh():
    # Prevent duplicate refresh calls
    IF isRefreshing: RETURN

    await fetchStats(true)

  EFFECT (on mount):
    fetchStats(false)

  RETURN:
    stats, isLoading, isRefreshing, error,
    lastUpdated as Date, refresh
```

### 3.4 Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Statistics automatically fetch when dashboard mounts | `useEffect` with empty deps calls `fetchStats(false)` |
| Loading state displays while fetching | `isLoading: true` during initial fetch |
| Statistics data populates on success | `stats` state updated from `response.data` |
| Error state displays with user-friendly message | `error` state with parsed error message |
| Refresh function exposed for manual re-fetch | `refresh()` function returned |
| Refresh triggers new API request | `refresh()` calls `fetchStats(true)` |
| Visual feedback during refresh | `isRefreshing: true` separate from `isLoading` |
| Multiple rapid refresh calls handled | Guard clause: `if (isRefreshing) return` |
| Loading state doesn't show during refresh | Separate `isLoading` vs `isRefreshing` states |

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to CREATE

| File | Description |
|------|-------------|
| `/src/hooks/useDashboardStats.ts` | Main hook implementation |

### 4.2 Files to READ (Reference Only)

| File | Purpose |
|------|---------|
| `/src/hooks/usePermissions.ts` | Hook pattern reference |
| `/src/lib/api.ts` | `apiRequest` usage and `ApiError` handling |
| `/src/app/api/user/dashboard/stats/route.ts` | API response shape verification |
| `/src/contexts/AuthContext.tsx` | Auth state pattern reference |

### 4.3 Functions to CREATE

| Function | Location | Description |
|----------|----------|-------------|
| `useDashboardStats` | `/src/hooks/useDashboardStats.ts` | Main exported hook |
| `fetchStats` | Internal to hook | Private function for API calls |

### 4.4 Exports to ADD

```typescript
// /src/hooks/useDashboardStats.ts
export { useDashboardStats };
export type { DashboardStats, UseDashboardStatsReturn };
```

---

## 5. Implementation Tasks

### Task 2.2.1: Create Hook File Structure
- [ ] Create `/src/hooks/useDashboardStats.ts`
- [ ] Add `'use client'` directive
- [ ] Define type interfaces (`DashboardStats`, `UseDashboardStatsState`, `UseDashboardStatsReturn`)

### Task 2.2.2: Implement State Management
- [ ] Initialize state with `useState<UseDashboardStatsState>`
- [ ] Set initial `isLoading: true` for auto-fetch on mount

### Task 2.2.3: Implement fetchStats Function
- [ ] Create memoized `fetchStats` with `useCallback`
- [ ] Handle `isRefresh` parameter for loading state differentiation
- [ ] Call `apiRequest('/user/dashboard/stats', {}, true)`
- [ ] Update state based on response success/failure
- [ ] Record `lastUpdated` timestamp on success

### Task 2.2.4: Implement refresh Function
- [ ] Create memoized `refresh` with `useCallback`
- [ ] Add guard clause to prevent duplicate calls when `isRefreshing`
- [ ] Call `fetchStats(true)` for refresh operation

### Task 2.2.5: Implement Auto-Fetch on Mount
- [ ] Add `useEffect` with empty dependency array
- [ ] Call `fetchStats(false)` on mount

### Task 2.2.6: Export Hook and Types
- [ ] Export `useDashboardStats` function
- [ ] Export `DashboardStats` type for consumer components
- [ ] Export `UseDashboardStatsReturn` type for documentation

---

## 6. Testing Considerations

### 6.1 Unit Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Hook mounts | `isLoading: true`, then fetches and updates `stats` |
| Successful fetch | `stats` populated, `isLoading: false`, `error: null` |
| Failed fetch | `stats: null`, `error` contains message, `isLoading: false` |
| Call `refresh()` | `isRefreshing: true`, fetch completes, `isRefreshing: false` |
| Rapid `refresh()` calls | Only one API call made (guard clause) |
| Network error | `error` set with user-friendly message |

### 6.2 Integration Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Authenticated user | API returns stats successfully |
| Unauthenticated user | API returns 401, hook handles error gracefully |
| No account for user | API returns 404, hook handles error gracefully |

---

## 7. Airbnb Design System Compliance

Not directly applicable to this hook (data layer). Visual compliance will be addressed in Task 2.3 (StatisticsCards component).

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API endpoint changes | Low | Medium | Type definitions match existing API contract |
| Auth context not available | Low | Medium | Hook handles auth errors gracefully |
| Memory leaks from unmounted component | Low | Low | Standard React cleanup not needed for this simple hook |
| Excessive API calls | Medium | Low | Guard clause prevents duplicate refresh calls |

---

## 9. Estimated Effort

| Task | Effort |
|------|--------|
| Task 2.2.1: File structure & types | 15 min |
| Task 2.2.2: State management | 10 min |
| Task 2.2.3: fetchStats implementation | 20 min |
| Task 2.2.4: refresh implementation | 10 min |
| Task 2.2.5: Auto-fetch effect | 5 min |
| Task 2.2.6: Exports | 5 min |
| Testing & verification | 15 min |
| **Total** | **~1.5 hours** |

---

## 10. References

- [Request #123 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan - Task 2.2](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Existing Dashboard Stats API](/src/app/api/user/dashboard/stats/route.ts)
- [usePermissions Hook Pattern](/src/hooks/usePermissions.ts)
- [API Request Helper](/src/lib/api.ts)

---

## Appendix A: Example Usage

```tsx
// In /src/app/dashboard2/page.tsx or StatisticsCards component

import { useDashboardStats } from '@/hooks/useDashboardStats';

function DashboardPage() {
  const { stats, isLoading, isRefreshing, error, refresh, lastUpdated } = useDashboardStats();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  return (
    <div>
      <StatisticsCards
        itemCount={stats?.itemCount ?? 0}
        roomCount={stats?.roomCount ?? 0}
        tagCount={stats?.tagCount ?? 0}
      />
      <button onClick={refresh} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
      </button>
      {lastUpdated && (
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
      )}
    </div>
  );
}
```
