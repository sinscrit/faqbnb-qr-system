# Implementation Overview: Create useTranslationStatus Hook

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-011 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 11:45 |
| Breakdown Created | 2026-01-22 19:18 |
| T-shirt Size | M |
| Estimated Effort | 6-8 hours |

## Goals

Create a custom React hook that fetches and manages translation status data from the Translation Status API endpoint. The hook supports querying status for single entities (item, article, link, tag) by ID or aggregated status across all entities for a property. It provides standard data fetching states (loading, error, data), manual refetch capability, optional auto-polling, and proper cleanup on unmount.

**Technical Requirements:**
- Fetch translation status from GET /api/translations/status endpoint
- Support single entity query with entityId + entityType parameters
- Support property-wide aggregated query with propertyId parameter
- Validate that exactly one query mode is provided (entity OR property, not both or neither)
- Return loading, refetching, error, and data states
- Provide refetch function for manual data refresh
- Support enabled flag to disable automatic fetching
- Support refetchInterval for automatic polling
- Cancel in-flight requests when options change or component unmounts
- Handle race conditions with stale flag pattern
- Support filters: languages array, statuses array
- Memoize results to prevent unnecessary re-renders
- Full TypeScript type safety

### Assumptions & Clarifications

- **Discovery**: useDashboardStats.ts (lines 78-244) provides excellent pattern for data-fetching hooks
- **Discovery**: Project uses custom apiRequest utility from @/lib/api (lines 28-117)
- **Discovery**: ApiError class available with status and code properties (lines 661-680)
- **Discovery**: No React Query or SWR in package.json - implement custom fetch logic
- **Discovery**: Hooks barrel file exists at src/hooks/index.ts with organized exports
- **Assumption**: Translation Status API (REQ-E05-001) returns response in format:
  ```typescript
  {
    items: TranslationItemDisplay[];
    summary: TranslationSummary;
    pagination?: { page, pageSize, totalItems, totalPages };
  }
  ```
- **Assumption**: API endpoint path is `/api/translations/status`
- **Clarification needed**: Should hook support pagination controls (page, pageSize parameters)?
- **Clarification needed**: Should hook automatically retry on transient errors (429, 502, 503)?

## Implementation Plan

### Step 1: Define TypeScript Interfaces and Types
- **Description**: Create comprehensive type definitions for hook options, return value, and API response
- **Rationale**: Establish type safety foundation before implementation
- **Estimated Effort**: 30 minutes

Type definitions to create:
```typescript
/**
 * Options for useTranslationStatus hook
 */
export interface UseTranslationStatusOptions {
  /** Query single entity by ID */
  entityId?: string;
  /** Entity type for single entity query */
  entityType?: 'item' | 'article' | 'link' | 'tag';
  /** Query all entities for a property */
  propertyId?: string;
  /** Filter by specific languages */
  languages?: SupportedLanguage[];
  /** Filter by specific statuses */
  statuses?: TranslationStatus[];
  /** Enable/disable the query (default: true) */
  enabled?: boolean;
  /** Auto-refetch interval in ms (optional) */
  refetchInterval?: number;
  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Return value from useTranslationStatus hook
 */
export interface UseTranslationStatusReturn {
  // Data
  data: TranslationStatusData | null;
  items: TranslationItemDisplay[];
  summary: TranslationSummary | null;

  // States
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;

  // Metadata
  lastUpdated: Date | null;
  isFetched: boolean;
}

/**
 * Translation status data from API
 */
export interface TranslationStatusData {
  items: TranslationItemDisplay[];
  summary: TranslationSummary;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Internal hook state
 */
interface UseTranslationStatusState {
  data: TranslationStatusData | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  lastUpdated: number | null;
  isFetched: boolean;
}
```

Note: TranslationItemDisplay, TranslationSummary, SupportedLanguage, TranslationStatus types imported from TranslationManagement.types.ts (REQ-E05-006).

### Step 2: Implement Options Validation Logic
- **Description**: Create validation function to ensure exactly one query mode is provided
- **Rationale**: Prevent invalid API calls and provide clear error messages
- **Estimated Effort**: 20 minutes

Validation function:
```typescript
/**
 * Validates hook options to ensure exactly one query mode is provided
 * @throws Error if validation fails
 */
function validateOptions(options: UseTranslationStatusOptions): void {
  const hasEntityQuery = options.entityId && options.entityType;
  const hasPropertyQuery = options.propertyId;

  if (!hasEntityQuery && !hasPropertyQuery) {
    throw new Error(
      'useTranslationStatus: Must provide either (entityId + entityType) or propertyId'
    );
  }

  if (hasEntityQuery && hasPropertyQuery) {
    throw new Error(
      'useTranslationStatus: Cannot provide both entity query and property query. Use one or the other.'
    );
  }

  // Validate entityId and entityType together
  if ((options.entityId && !options.entityType) || (!options.entityId && options.entityType)) {
    throw new Error(
      'useTranslationStatus: entityId and entityType must be provided together'
    );
  }
}
```

Call this validation at the start of the hook.

### Step 3: Implement URL Construction Helper
- **Description**: Create helper function to build API endpoint URL with query parameters
- **Rationale**: Centralize URL building logic for clarity and maintainability
- **Estimated Effort**: 30 minutes

URL builder function:
```typescript
/**
 * Builds API endpoint URL with query parameters
 */
function buildEndpoint(options: UseTranslationStatusOptions): string {
  const params = new URLSearchParams();

  // Single entity query
  if (options.entityId && options.entityType) {
    params.append('entityId', options.entityId);
    params.append('entityType', options.entityType);
  }

  // Property-wide query
  if (options.propertyId) {
    params.append('propertyId', options.propertyId);
  }

  // Filters
  if (options.languages && options.languages.length > 0) {
    params.append('languages', options.languages.join(','));
  }

  if (options.statuses && options.statuses.length > 0) {
    params.append('statuses', options.statuses.join(','));
  }

  const queryString = params.toString();
  return `/translations/status${queryString ? `?${queryString}` : ''}`;
}
```

Pattern reference: useDashboardStats.ts (lines 105-107) for URL construction with params.

### Step 4: Implement Core Fetch Logic with AbortController
- **Description**: Create fetch function that calls API with abort support and error handling
- **Rationale**: Enable request cancellation and proper cleanup
- **Estimated Effort**: 60 minutes

Fetch function:
```typescript
/**
 * Fetches translation status from API
 * @param options - Hook options
 * @param isRefresh - Whether this is a refresh (affects loading state)
 * @param signal - AbortSignal for request cancellation
 * @returns API response data
 */
async function fetchTranslationStatus(
  options: UseTranslationStatusOptions,
  isRefresh: boolean,
  signal?: AbortSignal
): Promise<TranslationStatusData> {
  const endpoint = buildEndpoint(options);

  try {
    // Use apiRequest utility with auth requirement
    const response = await apiRequest<{ success: boolean; data?: TranslationStatusData; error?: string }>(
      endpoint,
      {
        signal, // Pass abort signal for cancellation
      },
      true // Require authentication
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch translation status');
    }
  } catch (error) {
    // Re-throw abort errors without modification
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    // Convert ApiError to standard Error for consistency
    if (error instanceof ApiError) {
      const err = new Error(error.message);
      (err as any).status = error.status;
      (err as any).code = error.code;
      throw err;
    }

    throw error;
  }
}
```

Pattern reference: useDashboardStats.ts (lines 93-144) for fetch structure and error handling.

### Step 5: Implement Hook State Management with useState
- **Description**: Set up React state for tracking loading, data, error, and metadata
- **Rationale**: Manage component-level state following React hooks best practices
- **Estimated Effort**: 20 minutes

State initialization:
```typescript
const [state, setState] = useState<UseTranslationStatusState>({
  data: null,
  isLoading: options.enabled !== false, // Start loading if enabled
  isRefetching: false,
  error: null,
  lastUpdated: null,
  isFetched: false,
});
```

Pattern reference: useDashboardStats.ts (lines 81-87).

### Step 6: Implement Main useEffect for Auto-Fetch with Race Condition Protection
- **Description**: Create effect that fetches data on mount and when options change
- **Rationale**: Automatic data fetching with proper cleanup and stale flag pattern
- **Estimated Effort**: 90 minutes

Main fetch effect:
```typescript
useEffect(() => {
  // Skip if disabled
  if (options.enabled === false) {
    return;
  }

  // Validate options before proceeding
  try {
    validateOptions(options);
  } catch (error) {
    console.error('useTranslationStatus validation error:', error);
    setState(prev => ({
      ...prev,
      isLoading: false,
      isError: true,
      error: error instanceof Error ? error : new Error('Validation failed'),
    }));
    return;
  }

  let isStale = false;
  const abortController = new AbortController();

  const doFetch = async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const data = await fetchTranslationStatus(options, false, abortController.signal);

      // Check if this fetch is still relevant
      if (isStale) {
        console.log('useTranslationStatus: Fetch completed but is stale, ignoring');
        return;
      }

      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        isRefetching: false,
        error: null,
        lastUpdated: Date.now(),
        isFetched: true,
      }));
    } catch (error) {
      // Ignore aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('useTranslationStatus: Request aborted');
        return;
      }

      // Check if this fetch is still relevant
      if (isStale) {
        console.log('useTranslationStatus: Fetch error but is stale, ignoring');
        return;
      }

      const errorObj = error instanceof Error ? error : new Error('Unknown error');

      // Call error callback if provided
      options.onError?.(errorObj);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefetching: false,
        error: errorObj,
      }));
    }
  };

  doFetch();

  // Cleanup: abort request and mark as stale
  return () => {
    isStale = true;
    abortController.abort();
  };
}, [
  options.enabled,
  options.entityId,
  options.entityType,
  options.propertyId,
  options.languages?.join(','), // Stable dependency
  options.statuses?.join(','),   // Stable dependency
]);
```

Pattern reference: useDashboardStats.ts (lines 162-234) for stale flag pattern and cleanup.

### Step 7: Implement Manual Refetch Function
- **Description**: Create refetch function for manual data refresh
- **Rationale**: Allow components to refresh data on demand
- **Estimated Effort**: 30 minutes

Refetch function:
```typescript
const refetch = useCallback(async (): Promise<void> => {
  // Skip if already refetching or disabled
  if (state.isRefetching || options.enabled === false) {
    console.log('useTranslationStatus: Refetch skipped');
    return;
  }

  // Validate options
  try {
    validateOptions(options);
  } catch (error) {
    console.error('useTranslationStatus refetch validation error:', error);
    return;
  }

  setState(prev => ({
    ...prev,
    isRefetching: true,
    error: null,
  }));

  try {
    const data = await fetchTranslationStatus(options, true);

    setState(prev => ({
      ...prev,
      data,
      isLoading: false,
      isRefetching: false,
      error: null,
      lastUpdated: Date.now(),
      isFetched: true,
    }));
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error');

    // Call error callback if provided
    options.onError?.(errorObj);

    setState(prev => ({
      ...prev,
      isRefetching: false,
      error: errorObj,
    }));
  }
}, [state.isRefetching, options]);
```

Pattern reference: useDashboardStats.ts (lines 150-158).

### Step 8: Implement Auto-Refetch Interval Logic
- **Description**: Add effect that sets up polling interval when refetchInterval is provided
- **Rationale**: Support real-time status updates for active translations
- **Estimated Effort**: 30 minutes

Polling effect:
```typescript
useEffect(() => {
  // Skip if no interval specified, disabled, or not yet fetched
  if (!options.refetchInterval || options.enabled === false || !state.isFetched) {
    return;
  }

  console.log(`useTranslationStatus: Setting up auto-refetch every ${options.refetchInterval}ms`);

  const intervalId = setInterval(() => {
    refetch();
  }, options.refetchInterval);

  // Cleanup: clear interval
  return () => {
    console.log('useTranslationStatus: Clearing auto-refetch interval');
    clearInterval(intervalId);
  };
}, [options.refetchInterval, options.enabled, state.isFetched, refetch]);
```

### Step 9: Implement Return Value with Convenience Accessors
- **Description**: Create return object with memoized convenience accessors
- **Rationale**: Provide ergonomic API with computed properties
- **Estimated Effort**: 20 minutes

Return value:
```typescript
return useMemo<UseTranslationStatusReturn>(() => ({
  // Data
  data: state.data,
  items: state.data?.items || [],
  summary: state.data?.summary || null,

  // States
  isLoading: state.isLoading,
  isRefetching: state.isRefetching,
  isError: !!state.error,
  error: state.error,

  // Actions
  refetch,

  // Metadata
  lastUpdated: state.lastUpdated ? new Date(state.lastUpdated) : null,
  isFetched: state.isFetched,
}), [state, refetch]);
```

Use useMemo to prevent unnecessary re-renders when state hasn't changed.

### Step 10: Add JSDoc Documentation
- **Description**: Document hook function with comprehensive JSDoc comments
- **Rationale**: Provide clear API documentation for developers
- **Estimated Effort**: 20 minutes

JSDoc header:
```typescript
/**
 * Custom React hook for fetching and managing translation status data
 *
 * Supports two query modes:
 * 1. Single entity query: Provide entityId + entityType
 * 2. Property-wide query: Provide propertyId
 *
 * Features:
 * - Auto-fetches on mount and when options change
 * - Separate loading states for initial fetch vs refresh
 * - Manual refetch capability
 * - Optional auto-polling via refetchInterval
 * - Request cancellation on unmount or option changes
 * - Race condition protection with stale flag pattern
 * - Filter support for languages and statuses
 * - Full TypeScript type safety
 *
 * @param options - Hook configuration options
 * @returns Hook return object with data, states, and actions
 *
 * @example
 * // Query single entity
 * const { data, isLoading } = useTranslationStatus({
 *   entityId: 'item-123',
 *   entityType: 'item',
 * });
 *
 * @example
 * // Query property with filters and auto-refresh
 * const { items, summary, refetch } = useTranslationStatus({
 *   propertyId: 'prop-456',
 *   statuses: ['pending', 'failed'],
 *   refetchInterval: 10000,
 * });
 *
 * @throws {Error} If neither entityId+entityType nor propertyId is provided
 * @throws {Error} If both entity and property query modes are provided
 */
export function useTranslationStatus(
  options: UseTranslationStatusOptions
): UseTranslationStatusReturn {
  // Implementation...
}
```

### Step 11: Export Hook and Types from Barrel File
- **Description**: Add exports to src/hooks/index.ts barrel file
- **Rationale**: Enable clean imports from centralized location
- **Estimated Effort**: 10 minutes

Add to hooks/index.ts:
```typescript
// ============ Translation Hooks ============

export { useTranslationStatus } from './useTranslationStatus';
export type {
  UseTranslationStatusOptions,
  UseTranslationStatusReturn,
  TranslationStatusData,
} from './useTranslationStatus';
```

Pattern reference: hooks/index.ts (lines 1-70) for export structure.

### Step 12: Manual Testing Checklist
- **Description**: Test hook with various option combinations
- **Rationale**: Ensure all functionality works correctly before integration
- **Estimated Effort**: 60 minutes

Test scenarios:
- [ ] **Single entity query**: Fetches status for specific item/article/link/tag
- [ ] **Property query**: Fetches aggregated status for all entities in property
- [ ] **Validation error**: Throws when neither entity nor property provided
- [ ] **Validation error**: Throws when both entity and property provided
- [ ] **Loading state**: isLoading=true during initial fetch
- [ ] **Refetching state**: isRefetching=true during manual refetch
- [ ] **Error state**: isError=true and error populated on API failure
- [ ] **Data state**: data, items, summary populated on success
- [ ] **Refetch function**: Triggers new API request
- [ ] **Enabled flag**: enabled=false prevents automatic fetching
- [ ] **Auto-refetch**: refetchInterval triggers periodic refetch
- [ ] **Language filter**: languages array passed to API correctly
- [ ] **Status filter**: statuses array passed to API correctly
- [ ] **Request cancellation**: In-flight request cancelled on unmount
- [ ] **Request cancellation**: In-flight request cancelled when options change
- [ ] **Race condition**: Stale flag prevents old request from updating state
- [ ] **onError callback**: Called when errors occur
- [ ] **Convenience accessors**: items returns array, summary returns object
- [ ] **lastUpdated**: Timestamp updated on successful fetch
- [ ] **isFetched**: True after first successful fetch

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/hooks/useTranslationStatus.ts` | — | Create |

### Existing Files to Modify
| File | Target | Type |
|------|--------|------|
| `/src/hooks/index.ts` | Export statements | Modify - add useTranslationStatus exports |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|------------|
| `/src/hooks/useDashboardStats.ts` | Pattern reference for data-fetching hook (lines 78-244) |
| `/src/lib/api.ts` | Import apiRequest utility and ApiError class |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Import types (when REQ-E05-006 is completed) |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-001**: Translation Status API Endpoint
  - Provides: GET /api/translations/status endpoint
  - Reason: Hook fetches data from this endpoint
  - Status: Must be completed and deployed
- **REQ-E05-006**: TranslationManagement Types File
  - Provides: TranslationItemDisplay, TranslationSummary, SupportedLanguage, TranslationStatus types
  - Status: Pending (not yet created)
  - Note: Hook can be implemented with temporary local type definitions, then import from types file when available
  - Reason: Hook needs these types for full type safety
- **Existing**: React 18+ with hooks
- **Existing**: @/lib/api utility (apiRequest, ApiError)

### Blocks (Requires This First)
- **REQ-E05-007**: TranslationPreviewPanel Component - will use this hook to fetch data
- **Future**: Any translation management UI component that needs status data
- **Integration**: All components in Translation Management family that display status

### Parallel Safety
- **Files touched**:
  - `/src/hooks/useTranslationStatus.ts` (new file)
  - `/src/hooks/index.ts` (export addition)
- **Conflicts with**: None - new hook in hooks directory
- **Safe to parallelize with**:
  - All Epic 5 UI component tasks (different scope)
  - REQ-E05-002, REQ-E05-003 (API endpoint tasks) - can develop hook assuming API contract
  - REQ-E05-006 (types file) - can use temporary local types initially

### External Dependencies
- React 18+ with hooks (useState, useEffect, useCallback, useMemo)
- Native fetch API (via apiRequest utility)
- AbortController API for request cancellation
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **Memory leaks**: If interval cleanup fails, could cause memory leak
  - Mitigation: useEffect cleanup function clears interval in all cases
  - Mitigation: Test unmount behavior thoroughly

- **Race conditions**: Rapid option changes could cause stale data
  - Mitigation: Stale flag pattern prevents old requests from updating state
  - Mitigation: AbortController cancels in-flight requests

- **API rate limiting**: Aggressive refetchInterval could trigger rate limits
  - Mitigation: Document recommended minimum interval (5-10 seconds)
  - Mitigation: API should implement rate limiting protection

- **Large data sets**: Fetching property-wide status with many entities could be slow
  - Mitigation: API should implement pagination (documented in response type)
  - Mitigation: Consider pagination support in future hook enhancement

- **Authentication errors**: Hook redirects to login on 401/403
  - Mitigation: apiRequest utility handles auth errors automatically (lines 57-98)
  - Mitigation: Document this behavior for developers

### Testing Requirements
- **Unit tests**:
  - Options validation (both/neither entity/property throws error)
  - URL construction with various filter combinations
  - State updates on successful fetch
  - State updates on error
  - Refetch prevents duplicate calls
  - AbortController cancels requests
  - Stale flag prevents old updates

- **Integration tests**:
  - Hook fetches data from API endpoint
  - Error handling with API error responses
  - Auto-refetch interval triggers correctly
  - Component unmount cancels request
  - Option changes cancel old request and start new one

- **Hook tests** (using @testing-library/react-hooks if available):
  - Hook returns correct initial state
  - Hook fetches data on mount
  - Hook skips fetch when enabled=false
  - Refetch function works correctly
  - Auto-refetch interval works correctly
  - Cleanup functions run on unmount

### Open Questions
- [ ] Should hook support pagination controls (page, pageSize parameters)?
  - Recommendation: Out of scope for MVP, add in v2 if API supports pagination
- [ ] Should hook automatically retry on transient errors (429, 502, 503)?
  - Recommendation: No automatic retry in hook, let parent component decide
  - Rationale: ApiError.isRetryable() method available for manual retry logic
- [ ] Should hook cache responses to reduce API calls?
  - Recommendation: No in-memory cache in hook, rely on HTTP caching headers
  - Rationale: Avoids complexity of cache invalidation logic
- [ ] Should hook support optimistic updates for mutation operations?
  - Recommendation: Out of scope, this is a read-only hook
- [ ] Should hook expose loading progress (e.g., percentage for batch operations)?
  - Recommendation: Not needed for simple status fetch, add if API provides progress

## Out of Scope

The following are explicitly **not** included in this task:
- Pagination controls (page, pageSize parameters) - API may support but hook does not expose
- Automatic retry logic for transient errors - parent component responsibility
- In-memory response caching - rely on HTTP caching
- Optimistic updates - read-only hook
- Mutation operations (create, update, delete) - separate hooks needed
- WebSocket/SSR real-time updates - separate hook (REQ-E05-012)
- Loading progress indicators for batch operations
- Request debouncing or throttling - parent component can implement
- Infinite scroll pagination - future enhancement
- Sorting or filtering beyond API-supported params
- Data transformation beyond API response format
- Local state persistence (localStorage/sessionStorage)
- Analytics or telemetry tracking
- A/B test bucketing or feature flags
- Offline mode or queue for failed requests
- Request batching or multiplexing
- GraphQL query support (REST API only)
- File upload or download functionality
- Authentication token management (handled by apiRequest)
- CSRF protection (handled by API layer)

## Special Notes

### Hook Usage Patterns

The hook supports two distinct query modes:

**1. Single Entity Query:**
```typescript
const { data, isLoading } = useTranslationStatus({
  entityId: 'item-abc123',
  entityType: 'item',
});
```

**2. Property-Wide Aggregated Query:**
```typescript
const { items, summary, refetch } = useTranslationStatus({
  propertyId: 'property-xyz789',
});
```

**Important**: Attempting to use both modes or neither will throw a validation error.

### Stale Flag Pattern

The hook uses a stale flag pattern (from useDashboardStats.ts) to prevent race conditions:

1. Set `isStale = false` at start of effect
2. Cleanup function sets `isStale = true`
3. Before updating state, check if `isStale` - if true, ignore the response

This ensures that when options change rapidly, old responses don't overwrite newer data.

### AbortController for Request Cancellation

Each fetch creates an AbortController to enable cancellation:
- Passed to fetch via `signal` option
- Cleanup function calls `controller.abort()`
- Aborted requests throw AbortError (caught and ignored)

This prevents memory leaks and ensures components don't update after unmount.

### Auto-Refetch Interval Behavior

When `refetchInterval` is provided:
- Interval only starts AFTER first successful fetch
- Each interval calls the `refetch()` function
- Interval is cleared when component unmounts or interval changes
- Interval is paused when `enabled=false`

Recommended minimum interval: 5-10 seconds to avoid rate limiting.

### Convenience Accessors

The hook provides convenience accessors for common use cases:
- `items`: Returns `data.items` or empty array (never null)
- `summary`: Returns `data.summary` or null

This eliminates need for null checks in consuming components:
```typescript
// With convenience accessor
const { items } = useTranslationStatus({ ... });
items.map(item => ...) // Safe, always an array

// Without convenience accessor (more verbose)
const { data } = useTranslationStatus({ ... });
(data?.items || []).map(item => ...)
```

### Error Handling Strategy

The hook converts all errors to standard Error objects:
- ApiError → Error with status/code properties preserved
- AbortError → Caught and ignored (request cancelled)
- Unknown errors → Wrapped in Error object

The `onError` callback receives the Error object for custom handling:
```typescript
const { data, error } = useTranslationStatus({
  propertyId: 'prop-123',
  onError: (error) => {
    // Custom error handling
    console.error('Translation status fetch failed:', error);
    toast.error('Failed to load translation status');
  },
});
```

### Integration with TranslationManagement Components

This hook will be consumed by Translation Management UI components:

**TranslationPreviewPanel:**
```typescript
const { items, summary, isLoading, refetch } = useTranslationStatus({
  entityId: selectedItem.id,
  entityType: 'item',
  enabled: !!selectedItem,
});
```

**Translation Dashboard Widget:**
```typescript
const { summary, isLoading } = useTranslationStatus({
  propertyId: activePropertyId,
  refetchInterval: 30000, // Refresh every 30s
});
```

**Translation List View:**
```typescript
const { items, isLoading, error, refetch } = useTranslationStatus({
  propertyId: activePropertyId,
  statuses: ['pending', 'failed'], // Show only items needing attention
});
```

### SSR and Hydration Safety

The hook is safe for server-side rendering:
- Initial state has `isLoading: true` (or false if `enabled: false`)
- Fetch only runs in browser (useEffect doesn't run on server)
- No window/document access in hook code
- AbortController is only used in browser

For Next.js App Router, mark components using this hook with 'use client' directive.

### Performance Considerations

The hook is designed for efficient re-rendering:
- useMemo on return value prevents unnecessary re-renders
- Array dependencies use `.join(',')` for stable comparison
- Refetch function uses useCallback for stable reference
- State updates are batched where possible

Expected performance:
- Minimal overhead for typical queries (< 50 entities)
- Handles large property queries (100+ entities) without blocking UI
- Auto-refetch has negligible performance impact

### Future Enhancement Opportunities

Potential improvements for future iterations:
1. **Pagination support**: Add page/pageSize parameters and pagination metadata
2. **Infinite scroll**: Support for incremental loading with cursor-based pagination
3. **Automatic retry**: Configurable retry logic for transient errors
4. **Request debouncing**: Debounce rapid option changes
5. **Cache management**: In-memory cache with TTL and invalidation
6. **Suspense support**: React Suspense integration for concurrent features
7. **DevTools integration**: React DevTools plugin for debugging
8. **Optimistic updates**: Support for mutation operations with rollback
9. **Request batching**: Batch multiple queries into single API call
10. **GraphQL support**: Query builder for GraphQL API variant

---
*Document generated: 2026-01-22 19:18*
