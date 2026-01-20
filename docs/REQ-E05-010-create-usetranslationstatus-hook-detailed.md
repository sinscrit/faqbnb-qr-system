# REQ-E05-010: Create useTranslationStatus Hook - Detailed Task Breakdown

**Request ID:** REQ-E05-010
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.6
**Title:** Create useTranslationStatus hook
**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Document Purpose

This document provides granular, implementation-ready tasks for creating the `useTranslationStatus` React hook. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites

Before starting implementation, ensure:

1. **REQ-E05-001** (Translation Status API endpoint) is implemented or stubbed
2. **REQ-E05-006** (TranslationManagement.types.ts) is available for shared types
3. Access to existing pattern files:
   - `/src/hooks/useDashboardStats.ts` - State management pattern
   - `/src/hooks/useLanguagePreference.ts` - Async operations pattern
   - `/src/lib/api.ts` - API utilities

---

## Task Breakdown

### Task 1: Create Hook File with Type Definitions

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Create the hook file with all TypeScript interface definitions.

**Steps:**

1. Create new file `/src/hooks/useTranslationStatus.ts`

2. Add file header comment:
```typescript
// src/hooks/useTranslationStatus.ts
// REQ-E05-010: Translation Status Monitoring Hook
// Created: 2026-01-20
// Last Modified: 2026-01-20
```

3. Add `'use client';` directive at the top

4. Add imports:
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import type { SupportedLanguage, EntityType } from '@/lib/job-queue/translation-jobs.types';
```

5. Define `TranslationStatus` type (matching database status values):
```typescript
export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
```

6. Define `TranslationStatusItem` interface (single entity's translation info per language):
```typescript
export interface TranslationStatusItem {
  language: SupportedLanguage;
  status: TranslationStatus;
  content?: {
    title?: string;
    description?: string;
    name?: string;
  };
  translatedAt?: string;
  isStale?: boolean;
  reviewedBy?: string;
}
```

7. Define `TranslationStatusSummary` interface:
```typescript
export interface TranslationStatusSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}
```

8. Define `TranslationStatusResponse` interface (API response shape):
```typescript
export interface TranslationStatusResponse {
  summary: TranslationStatusSummary;
  items: Array<{
    entityType: EntityType;
    entityId: string;
    name: string;
    sourceLanguage: SupportedLanguage;
    translations: Record<SupportedLanguage, TranslationStatusItem>;
  }>;
}
```

9. Define `UseTranslationStatusParams` interface:
```typescript
export interface UseTranslationStatusParams {
  /** For single entity queries - entity type */
  entityType?: EntityType;
  /** For single entity queries - entity ID */
  entityId?: string;
  /** For property-wide queries */
  propertyId?: string;
  /** Optional filter: translation status */
  status?: TranslationStatus;
  /** Optional filter: specific language */
  language?: SupportedLanguage;
  /** Enable automatic polling (default: false) */
  pollingEnabled?: boolean;
  /** Polling interval in milliseconds (default: 5000) */
  pollingInterval?: number;
}
```

10. Define `UseTranslationStatusReturn` interface:
```typescript
export interface UseTranslationStatusReturn {
  /** Translation status data from API */
  data: TranslationStatusResponse | null;
  /** True during initial fetch */
  isLoading: boolean;
  /** True during manual refresh */
  isRefreshing: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Timestamp of last successful fetch */
  lastUpdated: Date | null;
  /** Function to manually trigger refetch */
  refresh: () => Promise<void>;
  /** True if any translations are pending or processing */
  hasPendingJobs: boolean;
}
```

11. Define internal state interface:
```typescript
interface InternalState {
  data: TranslationStatusResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
}
```

**Acceptance Criteria:**
- [ ] File created at correct path with 'use client' directive
- [ ] All imports are valid and from correct paths
- [ ] All interfaces exported with JSDoc comments
- [ ] Type definitions match API response structure from REQ-E05-001
- [ ] File compiles without TypeScript errors

---

### Task 2: Implement Core State Management

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Add the main hook function shell with state initialization.

**Steps:**

1. Create the main hook function signature:
```typescript
/**
 * Custom hook for fetching and monitoring translation status.
 *
 * Features:
 * - Fetches translation status from API
 * - Supports single entity or property-wide queries
 * - Automatic retry with exponential backoff
 * - Optional polling for real-time updates
 * - Race condition prevention with stale flags
 *
 * @param params - Configuration parameters for the hook
 * @returns Translation status data and control functions
 *
 * @example
 * // Single entity query
 * const { data, isLoading } = useTranslationStatus({
 *   entityType: 'article',
 *   entityId: 'abc123'
 * });
 *
 * @example
 * // Property-wide with polling
 * const { data, hasPendingJobs } = useTranslationStatus({
 *   propertyId: 'prop456',
 *   pollingEnabled: true
 * });
 */
export function useTranslationStatus(params: UseTranslationStatusParams = {}): UseTranslationStatusReturn {
```

2. Add debug prefix constant:
```typescript
  const DEBUG_PREFIX = '🌐 TRANSLATION_STATUS_HOOK:';
```

3. Destructure parameters with defaults:
```typescript
  const {
    entityType,
    entityId,
    propertyId,
    status: statusFilter,
    language: languageFilter,
    pollingEnabled = false,
    pollingInterval = 5000,
  } = params;
```

4. Initialize state using useState:
```typescript
  const [state, setState] = useState<InternalState>({
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
  });
```

5. Add ref for tracking mounted state (for cleanup):
```typescript
  const isMountedRef = useRef(true);
```

6. Add ref for tracking current request (for stale detection):
```typescript
  const currentRequestIdRef = useRef(0);
```

7. Compute `hasPendingJobs` from state data:
```typescript
  const hasPendingJobs = state.data?.items.some(item =>
    Object.values(item.translations).some(
      t => t.status === 'pending' || t.status === 'processing'
    )
  ) ?? false;
```

8. Add placeholder return statement (to be filled in later tasks):
```typescript
  return {
    data: state.data,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    lastUpdated: state.lastUpdated ? new Date(state.lastUpdated) : null,
    refresh: async () => {}, // Placeholder
    hasPendingJobs,
  };
}
```

**Acceptance Criteria:**
- [ ] Hook function created with proper JSDoc documentation
- [ ] State initialized with correct initial values
- [ ] Refs created for mounted state and request tracking
- [ ] `hasPendingJobs` computed correctly from state
- [ ] Hook returns all required properties (with placeholders)
- [ ] Code compiles without errors

---

### Task 3: Implement Parameter Validation

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Add validation logic to ensure valid parameter combinations.

**Steps:**

1. Create validation function inside the hook (before state):
```typescript
  /**
   * Validate hook parameters.
   * Either (entityType + entityId) OR propertyId must be provided.
   */
  const validateParams = useCallback((): { valid: boolean; error?: string } => {
    const hasEntityParams = entityType && entityId;
    const hasPropertyParam = !!propertyId;

    // At least one query mode must be specified
    if (!hasEntityParams && !hasPropertyParam) {
      return {
        valid: false,
        error: 'Either (entityType + entityId) or propertyId must be provided',
      };
    }

    // Cannot mix single entity and property-wide modes
    if (hasEntityParams && hasPropertyParam) {
      return {
        valid: false,
        error: 'Cannot specify both entity parameters and propertyId',
      };
    }

    // If using entity mode, both entityType and entityId required
    if ((entityType && !entityId) || (!entityType && entityId)) {
      return {
        valid: false,
        error: 'Both entityType and entityId must be provided together',
      };
    }

    // Validate entityType value
    if (entityType && !['article', 'item', 'link', 'tag'].includes(entityType)) {
      return {
        valid: false,
        error: `Invalid entityType: ${entityType}. Must be one of: article, item, link, tag`,
      };
    }

    return { valid: true };
  }, [entityType, entityId, propertyId]);
```

2. Call validation early in the hook and handle invalid state:
```typescript
  // Validate parameters
  const validation = validateParams();

  // Handle invalid parameters with useEffect to avoid render issues
  useEffect(() => {
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: validation.error || 'Invalid parameters',
      }));
    }
  }, [validation.valid, validation.error]);
```

3. Add early return check in fetch logic (implemented in Task 4) to skip fetch if invalid

**Acceptance Criteria:**
- [ ] Validation function checks all required parameter combinations
- [ ] Clear error messages for each validation failure case
- [ ] Invalid parameters result in error state (not exception)
- [ ] Validation is memoized with useCallback
- [ ] Hook remains stable under React StrictMode

---

### Task 4: Implement Fetch Logic with Retry

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Implement the core data fetching function with exponential backoff retry.

**Steps:**

1. Define retry constants:
```typescript
const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1000; // 1s, 2s, 4s exponential backoff
```

2. Create the fetch function with retry logic:
```typescript
  /**
   * Fetch translation status from API with retry logic.
   * @param isRefresh - True if this is a manual refresh (shows isRefreshing state)
   * @param requestId - Unique ID to detect stale requests
   */
  const fetchStatus = useCallback(async (isRefresh: boolean, requestId: number): Promise<void> => {
    // Skip if parameters are invalid
    if (!validateParams().valid) {
      return;
    }

    console.log(`${DEBUG_PREFIX} fetchStatus called`, {
      isRefresh,
      requestId,
      entityType,
      entityId,
      propertyId,
    });

    // Set loading state
    setState(prev => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null,
    }));

    // Build query string
    const queryParams = new URLSearchParams();
    if (entityType) queryParams.set('entityType', entityType);
    if (entityId) queryParams.set('entityId', entityId);
    if (propertyId) queryParams.set('propertyId', propertyId);
    if (statusFilter) queryParams.set('status', statusFilter);
    if (languageFilter) queryParams.set('language', languageFilter);

    const endpoint = `/translations/status?${queryParams.toString()}`;

    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await apiRequest<{ success: boolean; data?: TranslationStatusResponse; error?: string }>(
          endpoint,
          {},
          true // requireAuth
        );

        // Check if this request is still relevant
        if (requestId !== currentRequestIdRef.current || !isMountedRef.current) {
          console.log(`${DEBUG_PREFIX} Request ${requestId} is stale, ignoring result`);
          return;
        }

        if (response.success && response.data) {
          console.log(`${DEBUG_PREFIX} fetchStatus success`, response.data);
          setState(prev => ({
            ...prev,
            data: response.data!,
            isLoading: false,
            isRefreshing: false,
            error: null,
            lastUpdated: Date.now(),
          }));
          return; // Success, exit retry loop
        } else {
          throw new Error(response.error || 'Failed to fetch translation status');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if should retry
        const shouldRetry =
          attempt < MAX_RETRY_ATTEMPTS &&
          (error instanceof ApiError
            ? error.isRetryable() || (error.status && error.status >= 500)
            : true);

        if (shouldRetry) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`${DEBUG_PREFIX} Retry attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break; // Don't retry
        }
      }
    }

    // All retries failed - check if still mounted and current
    if (requestId !== currentRequestIdRef.current || !isMountedRef.current) {
      return;
    }

    // Set error state
    const errorMessage = lastError instanceof ApiError
      ? lastError.message
      : lastError?.message || 'An unexpected error occurred';

    console.error(`${DEBUG_PREFIX} fetchStatus error after retries`, { error: lastError });

    setState(prev => ({
      ...prev,
      isLoading: false,
      isRefreshing: false,
      error: errorMessage,
    }));
  }, [entityType, entityId, propertyId, statusFilter, languageFilter, validateParams]);
```

**Acceptance Criteria:**
- [ ] Fetch function builds correct query string from parameters
- [ ] Retry logic attempts 3 times with exponential backoff (1s, 2s, 4s)
- [ ] Only retries on server errors (5xx) and retryable errors
- [ ] Stale requests are ignored using requestId comparison
- [ ] Error state set correctly after all retries exhausted
- [ ] 401/403 errors handled appropriately (ApiError handles redirect)

---

### Task 5: Implement Auto-Fetch Effect

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Add useEffect for initial fetch and parameter change handling.

**Steps:**

1. Add the auto-fetch effect with stale flag pattern:
```typescript
  // Auto-fetch on mount and parameter changes
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;

    // Skip if parameters are invalid
    if (!validateParams().valid) {
      return;
    }

    // Generate new request ID to track this specific request
    const requestId = ++currentRequestIdRef.current;

    console.log(`${DEBUG_PREFIX} Auto-fetch triggered`, {
      requestId,
      entityType,
      entityId,
      propertyId,
    });

    // Perform initial fetch
    fetchStatus(false, requestId);

    // Cleanup: mark any pending requests as stale
    return () => {
      console.log(`${DEBUG_PREFIX} Cleanup - marking request ${requestId} as stale`);
      // Note: We don't set isMountedRef.current = false here
      // because that would prevent re-mounts in StrictMode.
      // Instead, the requestId comparison handles staleness.
    };
  }, [entityType, entityId, propertyId, statusFilter, languageFilter, fetchStatus, validateParams]);
```

2. Add unmount cleanup effect:
```typescript
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
```

**Acceptance Criteria:**
- [ ] Initial fetch triggered on mount
- [ ] Fetch re-triggered when parameters change
- [ ] Stale requests properly ignored using requestId
- [ ] Cleanup prevents state updates after unmount
- [ ] Works correctly with React StrictMode (double-mounting)

---

### Task 6: Implement Polling Logic

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Add optional polling functionality that auto-disables when no pending jobs.

**Steps:**

1. Add ref to track polling interval:
```typescript
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
```

2. Add polling effect:
```typescript
  // Polling effect
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Skip if polling not enabled or invalid params
    if (!pollingEnabled || !validateParams().valid) {
      return;
    }

    // Auto-disable polling when no pending jobs
    if (!hasPendingJobs && state.data !== null) {
      console.log(`${DEBUG_PREFIX} Polling disabled - no pending jobs`);
      return;
    }

    console.log(`${DEBUG_PREFIX} Starting polling with interval ${pollingInterval}ms`);

    pollingIntervalRef.current = setInterval(() => {
      // Generate new request ID for polling fetch
      const requestId = ++currentRequestIdRef.current;
      console.log(`${DEBUG_PREFIX} Polling fetch triggered`, { requestId });
      fetchStatus(true, requestId); // Use refresh mode to show isRefreshing
    }, pollingInterval);

    // Cleanup interval on unmount or dependency change
    return () => {
      if (pollingIntervalRef.current) {
        console.log(`${DEBUG_PREFIX} Clearing polling interval`);
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [pollingEnabled, pollingInterval, hasPendingJobs, state.data, fetchStatus, validateParams]);
```

**Acceptance Criteria:**
- [ ] Polling starts when pollingEnabled is true
- [ ] Polling uses configurable interval (default 5000ms)
- [ ] Polling auto-disables when hasPendingJobs is false
- [ ] Polling interval cleared on unmount
- [ ] Polling interval cleared when parameters change
- [ ] New polling fetch uses isRefreshing state

---

### Task 7: Implement Manual Refresh Function

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Create memoized refresh callback with duplicate call prevention.

**Steps:**

1. Add ref to track if refresh is in progress:
```typescript
  const isRefreshingRef = useRef(false);
```

2. Implement the refresh function:
```typescript
  /**
   * Manually trigger a refresh of translation status.
   * Prevents duplicate calls when already refreshing.
   */
  const refresh = useCallback(async (): Promise<void> => {
    // Prevent duplicate refresh calls
    if (isRefreshingRef.current || state.isRefreshing) {
      console.log(`${DEBUG_PREFIX} Refresh skipped - already refreshing`);
      return;
    }

    // Skip if parameters are invalid
    if (!validateParams().valid) {
      console.log(`${DEBUG_PREFIX} Refresh skipped - invalid parameters`);
      return;
    }

    isRefreshingRef.current = true;

    try {
      const requestId = ++currentRequestIdRef.current;
      console.log(`${DEBUG_PREFIX} Manual refresh triggered`, { requestId });
      await fetchStatus(true, requestId);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [state.isRefreshing, fetchStatus, validateParams]);
```

3. Update the return statement to use the actual refresh function:
```typescript
  return {
    data: state.data,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    lastUpdated: state.lastUpdated ? new Date(state.lastUpdated) : null,
    refresh,
    hasPendingJobs,
  };
```

**Acceptance Criteria:**
- [ ] Refresh function is memoized with useCallback
- [ ] Duplicate refresh calls are prevented
- [ ] Refresh sets isRefreshing state (not isLoading)
- [ ] Refresh skipped if parameters are invalid
- [ ] Refresh function returns Promise<void>

---

### Task 8: Add Hook Export and Index Update

**File:** `/src/hooks/useTranslationStatus.ts` and `/src/hooks/index.ts`

**Objective:** Export the hook and add to hooks barrel export if it exists.

**Steps:**

1. Ensure the hook and all types are exported from the file:
```typescript
// At the end of useTranslationStatus.ts

export default useTranslationStatus;

// Re-export types for convenience
export type {
  UseTranslationStatusParams,
  UseTranslationStatusReturn,
  TranslationStatusResponse,
  TranslationStatusSummary,
  TranslationStatusItem,
  TranslationStatus,
};
```

2. Check if `/src/hooks/index.ts` exists:
   - If yes, add export: `export { useTranslationStatus, type UseTranslationStatusParams, type UseTranslationStatusReturn } from './useTranslationStatus';`
   - If no, skip this step

**Acceptance Criteria:**
- [ ] Hook exported as default and named export
- [ ] All types exported for external use
- [ ] Hooks index updated (if exists)
- [ ] Import `import { useTranslationStatus } from '@/hooks/useTranslationStatus'` works
- [ ] Import `import useTranslationStatus from '@/hooks/useTranslationStatus'` works

---

### Task 9: Add 404 and Empty State Handling

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Handle 404 responses gracefully and provide sensible defaults for empty results.

**Steps:**

1. Update the fetch logic to handle 404 specifically (in Task 4's try block):
```typescript
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Handle 404 as empty result, not error
        if (error instanceof ApiError && error.status === 404) {
          if (requestId !== currentRequestIdRef.current || !isMountedRef.current) {
            return;
          }

          console.log(`${DEBUG_PREFIX} 404 response - returning empty data`);
          setState(prev => ({
            ...prev,
            data: {
              summary: { total: 0, complete: 0, partial: 0, pending: 0, failed: 0 },
              items: [],
            },
            isLoading: false,
            isRefreshing: false,
            error: null,
            lastUpdated: Date.now(),
          }));
          return;
        }

        // ... rest of retry logic
```

2. Update the fetch function signature comment:
```typescript
  /**
   * Fetch translation status from API with retry logic.
   * - 404 responses are treated as empty results (not errors)
   * - 401/403 trigger redirect via ApiError
   * - 5xx errors are retried with exponential backoff
   */
```

**Acceptance Criteria:**
- [ ] 404 responses return empty data structure (not error)
- [ ] Empty summary has all counts at 0
- [ ] Empty items array returned for 404
- [ ] lastUpdated is still set for 404 responses
- [ ] Error state remains null for 404

---

### Task 10: Final Integration and Testing Verification

**File:** `/src/hooks/useTranslationStatus.ts`

**Objective:** Verify complete hook implementation and add comprehensive comments.

**Steps:**

1. Review entire file for consistency and completeness

2. Ensure all acceptance criteria from the overview are addressed:
   - [ ] Hook file created at `/src/hooks/useTranslationStatus.ts`
   - [ ] Hook accepts entity reference parameters (entityType and entityId)
   - [ ] Hook accepts propertyId parameter for property-wide queries
   - [ ] Hook accepts optional filter parameters (status, language)
   - [ ] Hook returns data object containing translation status records
   - [ ] Hook returns loading boolean
   - [ ] Hook returns error object
   - [ ] Hook returns refresh function
   - [ ] Hook implements automatic retry logic (3 attempts with exponential backoff)
   - [ ] Hook supports optional polling mode with configurable interval
   - [ ] Hook automatically disables polling when no pending jobs exist
   - [ ] Hook cleans up polling intervals and pending requests on unmount
   - [ ] Hook integrates with translation status GET API endpoint
   - [ ] Hook handles 401/403 responses appropriately
   - [ ] Hook handles 404 responses gracefully
   - [ ] Hook caches results to prevent redundant API calls
   - [ ] Hook includes TypeScript type definitions
   - [ ] Hook validates required parameters
   - [ ] Hook works correctly with React StrictMode
   - [ ] Hook prevents race conditions when parameters change rapidly
   - [ ] Loading state is true during initial fetch
   - [ ] Error state clears when successful refetch occurs

3. Add usage examples in JSDoc (already in Task 2)

4. Verify no console.log statements reference undefined variables

5. Run TypeScript compiler to verify no type errors:
```bash
npx tsc --noEmit src/hooks/useTranslationStatus.ts
```

**Acceptance Criteria:**
- [ ] All acceptance criteria from overview document are met
- [ ] File compiles without TypeScript errors
- [ ] All debug console.log statements are properly formatted
- [ ] Hook follows existing codebase patterns (useDashboardStats)
- [ ] JSDoc documentation is complete and accurate

---

## Complete Code Template

Below is the complete implementation template for reference:

```typescript
// src/hooks/useTranslationStatus.ts
// REQ-E05-010: Translation Status Monitoring Hook
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import type { SupportedLanguage, EntityType } from '@/lib/job-queue/translation-jobs.types';

// ============ Constants ============

const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1000;
const DEBUG_PREFIX = '🌐 TRANSLATION_STATUS_HOOK:';

// ============ Type Definitions ============

export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

export interface TranslationStatusItem {
  language: SupportedLanguage;
  status: TranslationStatus;
  content?: {
    title?: string;
    description?: string;
    name?: string;
  };
  translatedAt?: string;
  isStale?: boolean;
  reviewedBy?: string;
}

export interface TranslationStatusSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}

export interface TranslationStatusResponse {
  summary: TranslationStatusSummary;
  items: Array<{
    entityType: EntityType;
    entityId: string;
    name: string;
    sourceLanguage: SupportedLanguage;
    translations: Record<SupportedLanguage, TranslationStatusItem>;
  }>;
}

export interface UseTranslationStatusParams {
  entityType?: EntityType;
  entityId?: string;
  propertyId?: string;
  status?: TranslationStatus;
  language?: SupportedLanguage;
  pollingEnabled?: boolean;
  pollingInterval?: number;
}

export interface UseTranslationStatusReturn {
  data: TranslationStatusResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  hasPendingJobs: boolean;
}

interface InternalState {
  data: TranslationStatusResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// ============ Hook Implementation ============

export function useTranslationStatus(params: UseTranslationStatusParams = {}): UseTranslationStatusReturn {
  // ... Implementation from tasks above
}

export default useTranslationStatus;
```

---

## Dependencies Summary

| Dependency | Source | Required |
|------------|--------|----------|
| `apiRequest`, `ApiError` | `@/lib/api` | Yes |
| `SupportedLanguage`, `EntityType` | `@/lib/job-queue/translation-jobs.types` | Yes |
| Translation Status API | REQ-E05-001 | Yes |
| TranslationManagement.types.ts | REQ-E05-006 | Optional (for shared types) |

---

## Testing Checklist

After implementation, verify the following scenarios:

### Unit Test Scenarios

1. **Initial fetch** - Hook fetches data on mount
2. **Parameter change** - Hook refetches when entityId changes
3. **Error handling** - Hook sets error state on API failure
4. **Retry logic** - Hook retries 3 times with backoff
5. **404 handling** - Hook returns empty data for 404
6. **Polling start** - Polling starts when pollingEnabled=true
7. **Polling stop** - Polling stops when hasPendingJobs=false
8. **Manual refresh** - refresh() triggers new fetch
9. **Duplicate prevention** - Multiple refresh() calls are debounced
10. **Unmount cleanup** - Intervals cleared on unmount
11. **StrictMode** - No double-fetch issues in StrictMode
12. **Validation** - Invalid params result in error state

### Integration Test Scenarios

1. **With real API** - Hook works with actual translation status endpoint
2. **Authentication** - 401/403 redirects to login
3. **Network failure** - Retries and eventually errors

---

## Notes

- This hook follows the pattern established in `useDashboardStats.ts`
- The `isStale` flag pattern prevents race conditions when parameters change
- Polling is automatically disabled when no pending translations exist to reduce API load
- The hook handles React StrictMode's double-mounting behavior correctly
