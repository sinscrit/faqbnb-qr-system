# REQ-343: Create useTranslationStatus Hook - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-343 (REQ-314 in gen_requests_epic5.md)
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.6
**Size:** M (Medium)
**Priority:** P2

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for creating the `useTranslationStatus` React hook. Each task is designed to be a single, focused unit of work (approximately 1 story point) that can be completed independently and verified immediately.

---

## Prerequisites

Before starting implementation, verify the following:

- [ ] Epic 1 (Foundation) translation tables exist in database
- [ ] Epic 3 (Dynamic Content Translation) translation status data is populated
- [ ] Task 1.1 (Translation Status API - `/api/translations/status`) is implemented or stubbed
- [ ] Translation service types exist at `/src/lib/translation-service/translation-service.types.ts`
- [ ] API utility exists at `/src/lib/api.ts` with `apiRequest` and `ApiError`

---

## Implementation Tasks

### Task 1: Create Hook File with Header and Imports

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

1.1. Create new file `/src/hooks/useTranslationStatus.ts`

1.2. Add file header comment with REQ reference:
```typescript
// src/hooks/useTranslationStatus.ts
// REQ-343: Translation Status Data Fetching Hook
// Created: 2026-01-19
// Last Modified: 2026-01-19
```

1.3. Add 'use client' directive for Next.js client component:
```typescript
'use client';
```

1.4. Add React imports:
```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
```

1.5. Add API utility imports:
```typescript
import { apiRequest, ApiError } from '@/lib/api';
```

1.6. Add type imports from translation service:
```typescript
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';
```

**Verification:**
- File exists at correct path
- No TypeScript compilation errors
- All imports resolve correctly

---

### Task 2: Define Hook Options Interface

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

2.1. Add `UseTranslationStatusOptions` interface after imports:
```typescript
/**
 * Options for configuring the useTranslationStatus hook.
 */
export interface UseTranslationStatusOptions {
  /** Optional entity type to filter by ('article' | 'item' | 'link') */
  entityType?: 'article' | 'item' | 'link';

  /** Optional entity ID for single-entity queries */
  entityId?: string;

  /** Optional property ID for property-wide queries */
  propertyId?: string;

  /** Optional status filter to show only specific statuses */
  status?: TranslationStatus;

  /** Auto-refetch interval in milliseconds (0 = disabled, default: 0) */
  refetchInterval?: number;
}
```

**Verification:**
- TypeScript compiles without errors
- Interface exports correctly
- All properties have JSDoc comments

---

### Task 3: Define Translation Status Summary Interface

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

3.1. Add `TranslationStatusSummary` interface:
```typescript
/**
 * Aggregate counts of translation statuses for dashboard display.
 */
export interface TranslationStatusSummary {
  /** Total number of translatable entities */
  total: number;

  /** Number of entities with all translations complete */
  complete: number;

  /** Number of entities with some translations complete */
  partial: number;

  /** Number of entities with translations pending */
  pending: number;

  /** Number of entities with translation failures */
  failed: number;
}
```

**Verification:**
- TypeScript compiles without errors
- Interface exports correctly

---

### Task 4: Define Translation Status Item Interface

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

4.1. Add `TranslationLanguageStatus` interface for per-language status:
```typescript
/**
 * Translation status for a single language.
 */
export interface TranslationLanguageStatus {
  /** Current translation status */
  status: TranslationStatus;

  /** Whether the translation is stale (source content updated after translation) */
  isStale?: boolean;

  /** ISO timestamp of when translation was completed */
  translatedAt?: string;

  /** User ID who manually reviewed/edited the translation */
  reviewedBy?: string;
}
```

4.2. Add `TranslationStatusItem` interface:
```typescript
/**
 * Translation status for a single translatable entity.
 */
export interface TranslationStatusItem {
  /** Type of entity */
  entityType: 'article' | 'item' | 'link';

  /** Unique identifier of the entity */
  entityId: string;

  /** Display name of the entity (title/name) */
  name: string;

  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;

  /** Translation status by language code */
  translations: {
    [K in SupportedLanguage]?: TranslationLanguageStatus;
  };
}
```

**Verification:**
- TypeScript compiles without errors
- Both interfaces export correctly
- Mapped type for `translations` works correctly

---

### Task 5: Define API Response Interface

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

5.1. Add internal `TranslationStatusResponse` interface (matches API contract):
```typescript
/**
 * Expected response shape from GET /api/translations/status endpoint.
 * @internal
 */
interface TranslationStatusResponse {
  success: boolean;
  data?: {
    summary: TranslationStatusSummary;
    items: TranslationStatusItem[];
  };
  error?: string;
}
```

**Verification:**
- TypeScript compiles without errors
- Interface is not exported (internal use only)

---

### Task 6: Define Hook Return Interface

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

6.1. Add `UseTranslationStatusReturn` interface:
```typescript
/**
 * Return type for the useTranslationStatus hook.
 */
export interface UseTranslationStatusReturn {
  /** Summary counts of translation statuses */
  summary: TranslationStatusSummary | null;

  /** Individual translation status items */
  items: TranslationStatusItem[];

  /** Loading state during initial fetch */
  isLoading: boolean;

  /** Refreshing state during refetch */
  isRefreshing: boolean;

  /** Error message if fetch failed, null otherwise */
  error: string | null;

  /** Timestamp of last successful fetch */
  lastUpdated: Date | null;

  /** Manual refresh function */
  refresh: () => Promise<void>;
}
```

**Verification:**
- TypeScript compiles without errors
- Interface exports correctly
- All properties have JSDoc comments

---

### Task 7: Define Internal State Interface

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

7.1. Add internal `UseTranslationStatusState` interface:
```typescript
/**
 * Internal state shape for the hook.
 * @internal
 */
interface UseTranslationStatusState {
  summary: TranslationStatusSummary | null;
  items: TranslationStatusItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
}
```

**Verification:**
- TypeScript compiles without errors
- Interface is not exported (internal use only)

---

### Task 8: Create Hook Function Signature and Initial State

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

8.1. Add hook function with JSDoc and initial state:
```typescript
/**
 * Custom hook for fetching and managing translation status data.
 *
 * Features:
 * - Auto-fetches on mount and when options change
 * - Separate loading states for initial fetch vs refresh
 * - Manual refresh capability with duplicate call prevention
 * - Optional polling via refetchInterval
 * - User-friendly error messages
 *
 * @param options - Configuration options for the hook
 * @returns UseTranslationStatusReturn object with status data and actions
 *
 * @example
 * ```tsx
 * // Single entity status
 * const { summary, items, isLoading, error } = useTranslationStatus({
 *   entityType: 'article',
 *   entityId: articleId,
 * });
 *
 * // Property-wide status with polling
 * const { summary, items, refresh } = useTranslationStatus({
 *   propertyId: selectedPropertyId,
 *   refetchInterval: 30000,
 * });
 * ```
 */
export function useTranslationStatus(
  options: UseTranslationStatusOptions = {}
): UseTranslationStatusReturn {
  const DEBUG_PREFIX = '🌐 TRANSLATION_STATUS_HOOK:';

  const { entityType, entityId, propertyId, status, refetchInterval = 0 } = options;

  const [state, setState] = useState<UseTranslationStatusState>({
    summary: null,
    items: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
  });

  // TODO: Add fetch logic in next tasks

  return {
    summary: state.summary,
    items: state.items,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    lastUpdated: state.lastUpdated ? new Date(state.lastUpdated) : null,
    refresh: async () => {}, // Placeholder
  };
}
```

**Verification:**
- TypeScript compiles without errors
- Hook can be imported and called without crashing
- Initial state values are correct

---

### Task 9: Implement API URL Builder Helper

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

9.1. Add helper function inside the hook (before state) to build API URL:
```typescript
  /**
   * Build API endpoint URL with query parameters.
   */
  const buildApiUrl = useCallback((): string => {
    const params = new URLSearchParams();

    if (entityType) {
      params.set('entityType', entityType);
    }
    if (entityId) {
      params.set('entityId', entityId);
    }
    if (propertyId) {
      params.set('propertyId', propertyId);
    }
    if (status) {
      params.set('status', status);
    }

    const queryString = params.toString();
    return queryString ? `/translations/status?${queryString}` : '/translations/status';
  }, [entityType, entityId, propertyId, status]);
```

**Verification:**
- TypeScript compiles without errors
- URL is built correctly with various option combinations
- Empty options produces `/translations/status`
- All options produces correct query string

---

### Task 10: Implement Fetch Status Function

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

10.1. Add `fetchStatus` callback after `buildApiUrl`:
```typescript
  /**
   * Fetch translation status from API.
   * @param isRefresh - If true, sets isRefreshing instead of isLoading
   */
  const fetchStatus = useCallback(async (isRefresh: boolean = false): Promise<void> => {
    console.log(`${DEBUG_PREFIX} fetchStatus called`, { isRefresh, entityType, entityId, propertyId });

    setState(prev => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null,
    }));

    try {
      const endpoint = buildApiUrl();

      const response = await apiRequest<TranslationStatusResponse>(
        endpoint,
        {},
        true // requireAuth
      );

      if (response.success && response.data) {
        console.log(`${DEBUG_PREFIX} fetchStatus success`, {
          summary: response.data.summary,
          itemCount: response.data.items.length,
        });

        setState(prev => ({
          ...prev,
          summary: response.data!.summary,
          items: response.data!.items,
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastUpdated: Date.now(),
        }));
      } else {
        throw new Error(response.error || 'Failed to load translation status');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'An unexpected error occurred';

      console.error(`${DEBUG_PREFIX} fetchStatus error`, { error, errorMessage });

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage,
      }));
    }
  }, [buildApiUrl, entityType, entityId, propertyId, DEBUG_PREFIX]);
```

**Verification:**
- TypeScript compiles without errors
- Function handles success case correctly
- Function handles error cases correctly
- Loading states are set appropriately

---

### Task 11: Implement Manual Refresh Function

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

11.1. Add `refresh` callback after `fetchStatus`:
```typescript
  /**
   * Manually refresh translation status.
   * Prevents duplicate calls when already refreshing.
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (state.isRefreshing) {
      console.log(`${DEBUG_PREFIX} refresh skipped - already refreshing`);
      return;
    }

    console.log(`${DEBUG_PREFIX} refresh triggered`);
    await fetchStatus(true);
  }, [state.isRefreshing, fetchStatus, DEBUG_PREFIX]);
```

11.2. Update the return statement to use the real `refresh` function:
```typescript
  return {
    summary: state.summary,
    items: state.items,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    lastUpdated: state.lastUpdated ? new Date(state.lastUpdated) : null,
    refresh,
  };
```

**Verification:**
- TypeScript compiles without errors
- Refresh function returns a Promise
- Duplicate calls are prevented when already refreshing

---

### Task 12: Implement Auto-Fetch Effect with Stale Flag

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

12.1. Add auto-fetch effect after `refresh` callback:
```typescript
  /**
   * Auto-fetch on mount and when options change.
   * Uses isStale flag to prevent race conditions when options change rapidly.
   */
  useEffect(() => {
    let isStale = false;

    console.log(`${DEBUG_PREFIX} Auto-fetch triggered`, { entityType, entityId, propertyId, status });

    const doFetch = async () => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const endpoint = buildApiUrl();

        const response = await apiRequest<TranslationStatusResponse>(
          endpoint,
          {},
          true
        );

        // Check if this fetch is still relevant
        if (isStale) {
          console.log(`${DEBUG_PREFIX} Fetch completed but is stale, ignoring`);
          return;
        }

        if (response.success && response.data) {
          console.log(`${DEBUG_PREFIX} Auto-fetch success`, {
            summary: response.data.summary,
            itemCount: response.data.items.length,
          });

          setState(prev => ({
            ...prev,
            summary: response.data!.summary,
            items: response.data!.items,
            isLoading: false,
            isRefreshing: false,
            error: null,
            lastUpdated: Date.now(),
          }));
        } else {
          throw new Error(response.error || 'Failed to load translation status');
        }
      } catch (error) {
        // Check if this fetch is still relevant
        if (isStale) {
          console.log(`${DEBUG_PREFIX} Fetch error but is stale, ignoring`);
          return;
        }

        const errorMessage = error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        console.error(`${DEBUG_PREFIX} Auto-fetch error`, { error, errorMessage });

        setState(prev => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: errorMessage,
        }));
      }
    };

    doFetch();

    // Cleanup: mark this fetch as stale when dependencies change
    return () => {
      isStale = true;
    };
  }, [entityType, entityId, propertyId, status, buildApiUrl, DEBUG_PREFIX]);
```

**Verification:**
- TypeScript compiles without errors
- Effect runs on mount
- Effect re-runs when options change
- Stale flag prevents race conditions

---

### Task 13: Implement Optional Polling with Interval

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

13.1. Add polling effect after auto-fetch effect:
```typescript
  /**
   * Optional polling interval for auto-refresh.
   * Only runs when refetchInterval > 0.
   */
  useEffect(() => {
    if (refetchInterval <= 0) {
      return;
    }

    console.log(`${DEBUG_PREFIX} Setting up polling interval`, { refetchInterval });

    const intervalId = setInterval(() => {
      console.log(`${DEBUG_PREFIX} Polling triggered`);
      // Don't await - fire and forget for polling
      fetchStatus(true).catch(err => {
        console.error(`${DEBUG_PREFIX} Polling fetch error`, err);
      });
    }, refetchInterval);

    // Cleanup: clear interval when unmounting or when refetchInterval changes
    return () => {
      console.log(`${DEBUG_PREFIX} Clearing polling interval`);
      clearInterval(intervalId);
    };
  }, [refetchInterval, fetchStatus, DEBUG_PREFIX]);
```

**Verification:**
- TypeScript compiles without errors
- Polling only starts when refetchInterval > 0
- Interval is cleared on unmount
- Interval is cleared when refetchInterval changes

---

### Task 14: Add Default Export

**File:** `/src/hooks/useTranslationStatus.ts`

**Steps:**

14.1. Add default export at the end of the file:
```typescript
export default useTranslationStatus;
```

**Verification:**
- TypeScript compiles without errors
- Hook can be imported with default import syntax
- Hook can be imported with named import syntax

---

### Task 15: Create Integration Test Stub (Manual Verification)

**File:** `/src/hooks/useTranslationStatus.ts` (no changes, verification task)

**Steps:**

15.1. Verify hook can be imported in a test component:
```tsx
// Test in browser console or temporary component:
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

function TestComponent() {
  const { summary, items, isLoading, error, refresh } = useTranslationStatus({
    propertyId: 'test-property-id',
  });

  console.log({ summary, items, isLoading, error });

  return <div>Test</div>;
}
```

15.2. Verify TypeScript types are correctly inferred:
- `summary` is `TranslationStatusSummary | null`
- `items` is `TranslationStatusItem[]`
- `isLoading` is `boolean`
- `error` is `string | null`
- `refresh` is `() => Promise<void>`

15.3. Verify error handling with network failure (disable network in DevTools)

15.4. Verify error handling with 401 response (expired session)

**Verification:**
- Hook compiles and can be used in components
- All TypeScript types are correctly inferred
- Error states display correctly

---

## Complete File Reference

After completing all tasks, the file structure should be:

```typescript
// src/hooks/useTranslationStatus.ts
// REQ-343: Translation Status Data Fetching Hook
// Created: 2026-01-19
// Last Modified: 2026-01-19

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';

// Exported interfaces
export interface UseTranslationStatusOptions { ... }
export interface TranslationStatusSummary { ... }
export interface TranslationLanguageStatus { ... }
export interface TranslationStatusItem { ... }
export interface UseTranslationStatusReturn { ... }

// Internal interfaces
interface TranslationStatusResponse { ... }
interface UseTranslationStatusState { ... }

// Main hook function
export function useTranslationStatus(options: UseTranslationStatusOptions = {}): UseTranslationStatusReturn { ... }

export default useTranslationStatus;
```

---

## Acceptance Criteria Checklist

Based on REQ-314 (gen_requests_epic5.md):

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

## Dependencies for Downstream Tasks

This hook will be consumed by:

| Component | Task Reference | Usage |
|-----------|----------------|-------|
| TranslationPreviewPanel | Task 2.2 | Display translation status for single entity |
| TranslationStatusWidget | Task 3.1 | Display summary on dashboard |
| TranslationStatusColumn | Task 3.2 | Display in item list tables |
| Translation Management Page | Task 4.3 | Full translation management interface |

---

## Testing Notes (for Task 7.5)

When implementing unit tests in Task 7.5, cover:

1. **Initial loading state** - Hook returns `isLoading: true` initially
2. **Successful fetch** - Data populates correctly after fetch
3. **Error handling** - Network errors set error state
4. **Auth errors** - 401/403 responses handled gracefully
5. **Parameter changes** - Refetch triggered when options change
6. **Manual refresh** - `refresh()` function triggers refetch
7. **Polling** - Interval fires correctly when `refetchInterval > 0`
8. **Race conditions** - Rapid option changes don't cause stale data
9. **Multiple instances** - Two components using hook don't conflict

Mock the `apiRequest` function to simulate various API responses.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API endpoint not ready | Create mock response in development: `if (process.env.NODE_ENV === 'development') { return mockData; }` |
| Race conditions | Stale flag pattern prevents displaying outdated data |
| Memory leaks | Effects return cleanup functions |
| Multiple rapid calls | `isRefreshing` check prevents duplicate refresh calls |

---

## References

- Overview Document: `/docs/REQ-343-create-usetranslationstatus-hook-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Details: `/docs/gen_requests_epic5.md` (REQ-314)
- Hook Pattern Reference: `/src/hooks/useDashboardStats.ts`
- API Pattern Reference: `/src/lib/api.ts`
- Type Definitions: `/src/lib/translation-service/translation-service.types.ts`
