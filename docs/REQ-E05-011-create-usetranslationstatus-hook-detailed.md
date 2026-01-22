# Create useTranslationStatus Hook - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:57
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #11)
- Overview: docs/REQ-E05-011-create-usetranslationstatus-hook-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Hook File and Setup Imports

**Context:** Following the pattern from useDashboardStats.ts (src/hooks/useDashboardStats.ts, lines 1-50), create a new custom hook file for fetching translation status data. The hook will use the apiRequest utility for HTTP requests and manage complex state including loading, error, and data states.

**Files to modify:**
- Create: `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **1.1** Create the hook file: `touch src/hooks/useTranslationStatus.ts`
- [ ] **1.2** Add JSDoc module header comment describing the hook: "useTranslationStatus Hook - Custom React hook for fetching and managing translation status data from the Translation Status API endpoint. Supports single entity queries or property-wide aggregated queries."
- [ ] **1.3** Add JSDoc tags: `@module hooks/useTranslationStatus`, `@see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`, `@created 2026-01-22`, `@requestReference REQ-E05-011`
- [ ] **1.4** Import React hooks: `import { useState, useEffect, useCallback, useRef, useMemo } from 'react';`
- [ ] **1.5** Import API utility: `import { apiRequest, ApiError } from '@/lib/api';`
- [ ] **1.6** Import types from TranslationManagement.types.ts: `import type { TranslationItemDisplay, TranslationSummary, SupportedLanguage, TranslationStatus } from '@/components/TranslationManagement/TranslationManagement.types';`

---

## 2. Define Hook Option and Return Type Interfaces

**Context:** Create comprehensive TypeScript interfaces for the hook's options parameter and return value. Based on overview lines 59-130, define structures for single entity queries, property-wide queries, filters, and all return states.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **2.1** Add section comment: `// =============================================================================` followed by `// Type Definitions` followed by `// =============================================================================`
- [ ] **2.2** Define UseTranslationStatusOptions interface: `export interface UseTranslationStatusOptions { entityId?: string; entityType?: 'item' | 'article' | 'link' | 'tag'; propertyId?: string; languages?: SupportedLanguage[]; statuses?: TranslationStatus[]; enabled?: boolean; refetchInterval?: number; onError?: (error: Error) => void; }`
- [ ] **2.3** Add JSDoc for UseTranslationStatusOptions explaining query modes: "Options for useTranslationStatus hook. Provide either (entityId + entityType) for single entity query, OR propertyId for property-wide query. Cannot provide both."
- [ ] **2.4** Define TranslationStatusData interface: `export interface TranslationStatusData { items: TranslationItemDisplay[]; summary: TranslationSummary; pagination?: { page: number; pageSize: number; totalItems: number; totalPages: number; }; }`
- [ ] **2.5** Add JSDoc for TranslationStatusData: "Translation status data returned from API endpoint."
- [ ] **2.6** Define UseTranslationStatusReturn interface: `export interface UseTranslationStatusReturn { data: TranslationStatusData | null; items: TranslationItemDisplay[]; summary: TranslationSummary | null; isLoading: boolean; isRefetching: boolean; isError: boolean; error: Error | null; refetch: () => Promise<void>; lastUpdated: Date | null; isFetched: boolean; }`
- [ ] **2.7** Add JSDoc for UseTranslationStatusReturn: "Return value from useTranslationStatus hook with data, states, and actions."
- [ ] **2.8** Define internal state interface: `interface HookState { data: TranslationStatusData | null; isLoading: boolean; isRefetching: boolean; error: Error | null; lastUpdated: number | null; isFetched: boolean; }`

---

## 3. Implement Options Validation Function

**Context:** Create a validation function that ensures exactly one query mode is provided (entity query OR property query, not both or neither). This prevents invalid API calls and provides clear error messages. Based on overview lines 140-168.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Add section comment: `// =============================================================================` followed by `// Helper Functions` followed by `// =============================================================================`
- [ ] **3.2** Create validateOptions function: `function validateOptions(options: UseTranslationStatusOptions): void {`
- [ ] **3.3** Check for entity query: `const hasEntityQuery = Boolean(options.entityId && options.entityType);`
- [ ] **3.4** Check for property query: `const hasPropertyQuery = Boolean(options.propertyId);`
- [ ] **3.5** Validate at least one mode provided: `if (!hasEntityQuery && !hasPropertyQuery) { throw new Error('useTranslationStatus: Must provide either (entityId + entityType) or propertyId'); }`
- [ ] **3.6** Validate not both modes: `if (hasEntityQuery && hasPropertyQuery) { throw new Error('useTranslationStatus: Cannot provide both entity query and property query. Use one or the other.'); }`
- [ ] **3.7** Validate entityId and entityType together: `if ((options.entityId && !options.entityType) || (!options.entityId && options.entityType)) { throw new Error('useTranslationStatus: entityId and entityType must be provided together'); }`
- [ ] **3.8** Close function
- [ ] **3.9** Add JSDoc comment: "Validates hook options to ensure exactly one query mode is provided. Throws Error if validation fails."

---

## 4. Implement URL Construction Helper

**Context:** Create a helper function that builds the API endpoint URL with query parameters. This centralizes the URL building logic and handles encoding of array parameters. Based on overview lines 178-217.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Create buildEndpoint function: `function buildEndpoint(options: UseTranslationStatusOptions): string {`
- [ ] **4.2** Initialize URLSearchParams: `const params = new URLSearchParams();`
- [ ] **4.3** Add entity query parameters: `if (options.entityId && options.entityType) { params.append('entityId', options.entityId); params.append('entityType', options.entityType); }`
- [ ] **4.4** Add property query parameter: `if (options.propertyId) { params.append('propertyId', options.propertyId); }`
- [ ] **4.5** Add languages filter: `if (options.languages && options.languages.length > 0) { params.append('languages', options.languages.join(',')); }`
- [ ] **4.6** Add statuses filter: `if (options.statuses && options.statuses.length > 0) { params.append('statuses', options.statuses.join(',')); }`
- [ ] **4.7** Build and return full URL: `const queryString = params.toString(); return `/api/translations/status${queryString ? `?${queryString}` : ''}`;`
- [ ] **4.8** Close function
- [ ] **4.9** Add JSDoc comment: "Builds API endpoint URL with query parameters based on options."

---

## 5. Implement Main Hook Structure and State Initialization

**Context:** Create the main hook function with options destructuring, state initialization, and refs for tracking mounted status and in-flight requests. Following the pattern from useDashboardStats.ts (lines 78-120).

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Add section comment: `// =============================================================================` followed by `// Main Hook` followed by `// =============================================================================`
- [ ] **5.2** Export main hook function: `export function useTranslationStatus(options: UseTranslationStatusOptions): UseTranslationStatusReturn {`
- [ ] **5.3** Validate options at start: `validateOptions(options);`
- [ ] **5.4** Destructure options with defaults: `const { entityId, entityType, propertyId, languages, statuses, enabled = true, refetchInterval, onError } = options;`
- [ ] **5.5** Initialize state: `const [state, setState] = useState<HookState>({ data: null, isLoading: false, isRefetching: false, error: null, lastUpdated: null, isFetched: false });`
- [ ] **5.6** Create mounted ref: `const isMountedRef = useRef(true);`
- [ ] **5.7** Create abort controller ref: `const abortControllerRef = useRef<AbortController | null>(null);`
- [ ] **5.8** Create stale request counter ref: `const requestCounterRef = useRef(0);`

---

## 6. Implement Fetch Logic Function

**Context:** Create the core fetch function that makes the API request, handles responses, and updates state. This function uses the apiRequest utility, manages abort signals, and handles race conditions with stale flags. Based on overview lines 225-310.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Create fetchData function: `const fetchData = useCallback(async (isRefetch = false) => {`
- [ ] **6.2** Cancel previous request: `if (abortControllerRef.current) { abortControllerRef.current.abort(); }`
- [ ] **6.3** Create new abort controller: `const abortController = new AbortController(); abortControllerRef.current = abortController;`
- [ ] **6.4** Increment request counter for stale detection: `const currentRequestId = ++requestCounterRef.current;`
- [ ] **6.5** Set loading state: `setState((prev) => ({ ...prev, isLoading: !isRefetch, isRefetching: isRefetch, error: null }));`
- [ ] **6.6** Add try block and build endpoint: `try { const endpoint = buildEndpoint(options);`
- [ ] **6.7** Make API request: `const response = await apiRequest<TranslationStatusData>(endpoint, { method: 'GET', signal: abortController.signal });`
- [ ] **6.8** Check for stale request: `if (currentRequestId !== requestCounterRef.current || !isMountedRef.current) { return; }`
- [ ] **6.9** Update state with data: `setState({ data: response, isLoading: false, isRefetching: false, error: null, lastUpdated: Date.now(), isFetched: true });`
- [ ] **6.10** Add catch block for errors: `catch (err) { if (err instanceof Error && err.name === 'AbortError') { return; } if (currentRequestId !== requestCounterRef.current || !isMountedRef.current) { return; } const error = err instanceof Error ? err : new Error('Unknown error'); setState((prev) => ({ ...prev, isLoading: false, isRefetching: false, error, isFetched: true })); onError?.(error); }`
- [ ] **6.11** Add finally block: `finally { if (abortControllerRef.current === abortController) { abortControllerRef.current = null; } }`
- [ ] **6.12** Close function with dependencies: `}, [options, onError]);`

---

## 7. Implement Refetch Function

**Context:** Create a manual refetch function that users can call to refresh data. This function wraps fetchData with isRefetch=true to show refetching state instead of loading state.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Create refetch function: `const refetch = useCallback(async () => { if (!enabled) return; await fetchData(true); }, [enabled, fetchData]);`
- [ ] **7.2** Add JSDoc comment above function: "Manually refetch translation status data. Sets isRefetching=true during the operation."

---

## 8. Implement Initial Fetch Effect

**Context:** Create useEffect that triggers the initial data fetch when the hook mounts or when dependencies change. This effect respects the enabled flag and re-fetches when query parameters change.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** Add section comment: `// Effects`
- [ ] **8.2** Create initial fetch effect: `useEffect(() => { if (!enabled) return; fetchData(false); }, [enabled, fetchData]);`
- [ ] **8.3** Add comment explaining: "Fetch data on mount and when options change"

---

## 9. Implement Auto-Polling Effect

**Context:** Create useEffect that sets up automatic polling when refetchInterval is provided. This effect uses setInterval and respects the enabled flag, cleaning up the interval on unmount or when dependencies change.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **9.1** Create polling effect: `useEffect(() => { if (!enabled || !refetchInterval || refetchInterval <= 0) return; const intervalId = setInterval(() => { fetchData(true); }, refetchInterval); return () => { clearInterval(intervalId); }; }, [enabled, refetchInterval, fetchData]);`
- [ ] **9.2** Add comment explaining: "Set up auto-polling if refetchInterval is provided"

---

## 10. Implement Cleanup Effect

**Context:** Create useEffect that runs on unmount to cancel in-flight requests and mark the component as unmounted. This prevents memory leaks and state updates on unmounted components.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Create cleanup effect: `useEffect(() => { return () => { isMountedRef.current = false; if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; } }; }, []);`
- [ ] **10.2** Add comment explaining: "Cleanup on unmount"

---

## 11. Implement Memoized Return Values

**Context:** Create memoized computed values for items array, summary object, and lastUpdated Date. This prevents unnecessary re-renders when derived values haven't actually changed.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **11.1** Add section comment: `// Memoized return values`
- [ ] **11.2** Memoize items array: `const items = useMemo(() => state.data?.items || [], [state.data]);`
- [ ] **11.3** Memoize summary: `const summary = useMemo(() => state.data?.summary || null, [state.data]);`
- [ ] **11.4** Memoize lastUpdated: `const lastUpdated = useMemo(() => state.lastUpdated ? new Date(state.lastUpdated) : null, [state.lastUpdated]);`
- [ ] **11.5** Memoize error flag: `const isError = useMemo(() => Boolean(state.error), [state.error]);`

---

## 12. Implement Hook Return Object

**Context:** Construct and return the final object that consumers of the hook will receive. Ensure all properties match the UseTranslationStatusReturn interface.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **12.1** Create return object: `return { data: state.data, items, summary, isLoading: state.isLoading, isRefetching: state.isRefetching, isError, error: state.error, refetch, lastUpdated, isFetched: state.isFetched };`
- [ ] **12.2** Close hook function
- [ ] **12.3** Verify return object matches UseTranslationStatusReturn interface exactly

---

## 13. Add Hook to Barrel Export File

**Context:** Add the new hook to the main hooks barrel export file (src/hooks/index.ts) so it can be imported from '@/hooks' throughout the application.

**Files to modify:**
- `src/hooks/index.ts`

**Estimated effort:** 1 story point

- [ ] **13.1** Open src/hooks/index.ts
- [ ] **13.2** Add export for the hook: `export { useTranslationStatus } from './useTranslationStatus';`
- [ ] **13.3** Add type exports: `export type { UseTranslationStatusOptions, UseTranslationStatusReturn, TranslationStatusData } from './useTranslationStatus';`
- [ ] **13.4** Verify exports are in alphabetical order with other hooks
- [ ] **13.5** Save the file

---

## 14. Run TypeScript Type Check

**Context:** Verify that all TypeScript types are correct, imports resolve properly, and there are no type errors introduced by the new hook.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [ ] **14.1** Run `npx tsc --noEmit` from project root
- [ ] **14.2** Review output for any errors mentioning "useTranslationStatus"
- [ ] **14.3** If type errors exist, identify the file and line number
- [ ] **14.4** Common issues to check: missing imports, incorrect type usage, Promise return types, useCallback dependencies
- [ ] **14.5** Fix any identified type errors
- [ ] **14.6** Re-run `npx tsc --noEmit` after each fix
- [ ] **14.7** Document any pre-existing errors unrelated to this hook (acceptable per CLAUDE.md)

---

## 15. Test Hook with Single Entity Query

**Context:** Create a test component to verify the hook works correctly for single entity queries (entityId + entityType). Test loading states, data display, and error handling.

**Files to modify:** None (testing step - create temporary test component)

**Estimated effort:** 1 story point

- [ ] **15.1** Create a temporary test component that uses the hook with entityId and entityType
- [ ] **15.2** Start dev server: `npm run dev`
- [ ] **15.3** Verify initial loading state: isLoading=true, data=null
- [ ] **15.4** When data loads: verify isLoading=false, data is populated
- [ ] **15.5** Verify items array contains translation data
- [ ] **15.6** Verify summary object contains counts (total, complete, pending, failed, stale)
- [ ] **15.7** Verify lastUpdated is a valid Date object
- [ ] **15.8** Verify isFetched changes to true after first fetch
- [ ] **15.9** Click a refetch button: verify isRefetching=true during operation
- [ ] **15.10** Test with invalid entityId: verify error state is set correctly

---

## 16. Test Hook with Property-Wide Query

**Context:** Test the hook with propertyId parameter to verify it correctly fetches aggregated translation status across all entities for a property.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **16.1** Update test component to use propertyId instead of entityId/entityType
- [ ] **16.2** Verify initial loading state works
- [ ] **16.3** Verify data loads with multiple items (all entities in the property)
- [ ] **16.4** Verify summary aggregates data across all entities
- [ ] **16.5** Compare item count to expected number of entities in property
- [ ] **16.6** Verify each item in items array has correct structure (entityId, entityType, name, translations)

---

## 17. Test Hook Options Validation

**Context:** Test that the validation function correctly rejects invalid option combinations and provides helpful error messages.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **17.1** Test with no query parameters: verify throws error "Must provide either (entityId + entityType) or propertyId"
- [ ] **17.2** Test with both entity and property queries: verify throws error "Cannot provide both"
- [ ] **17.3** Test with entityId but no entityType: verify throws error "must be provided together"
- [ ] **17.4** Test with entityType but no entityId: verify throws error "must be provided together"
- [ ] **17.5** Verify error messages are clear and actionable
- [ ] **17.6** Verify errors are thrown before any API request is made (check network tab)

---

## 18. Test Hook Filters

**Context:** Test the languages and statuses filter options to verify they correctly filter the results.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **18.1** Test with languages filter: `languages: ['fr', 'es']`
- [ ] **18.2** Verify query string includes `?languages=fr,es` parameter
- [ ] **18.3** Verify returned data only includes French and Spanish translations
- [ ] **18.4** Test with statuses filter: `statuses: ['completed', 'failed']`
- [ ] **18.5** Verify query string includes `?statuses=completed,failed` parameter
- [ ] **18.6** Test with both filters combined: verify both parameters in query string
- [ ] **18.7** Test with empty arrays: verify filters are not added to query string

---

## 19. Test Enabled Flag and Manual Refetch

**Context:** Test the enabled flag to verify it prevents automatic fetching, and test the manual refetch function.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **19.1** Set enabled=false: verify no initial API request is made (check network tab)
- [ ] **19.2** Verify isLoading stays false when enabled=false
- [ ] **19.3** Change enabled to true: verify fetch is triggered
- [ ] **19.4** Test refetch function: call it manually, verify isRefetching becomes true
- [ ] **19.5** Verify refetch makes a new API request
- [ ] **19.6** Verify data updates after refetch completes
- [ ] **19.7** Test calling refetch while enabled=false: verify it doesn't make request

---

## 20. Test Auto-Polling with refetchInterval

**Context:** Test the automatic polling feature to verify data refreshes at the specified interval.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **20.1** Set refetchInterval to 5000 (5 seconds)
- [ ] **20.2** Verify initial fetch happens immediately
- [ ] **20.3** Wait 5 seconds: verify a second request is made automatically
- [ ] **20.4** Verify isRefetching is true during auto-refresh
- [ ] **20.5** Wait another 5 seconds: verify a third request is made
- [ ] **20.6** Change enabled to false: verify polling stops
- [ ] **20.7** Change refetchInterval to 0: verify polling is disabled
- [ ] **20.8** Unmount component: verify polling stops (check network tab for no more requests)

---

## 21. Test Request Cancellation and Race Conditions

**Context:** Test that the hook properly cancels in-flight requests when options change or component unmounts, and handles race conditions correctly.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **21.1** Trigger a slow API request (add delay in API or use network throttling)
- [ ] **21.2** While request is in-flight, change entityId prop
- [ ] **21.3** Verify the first request is aborted (AbortError in console or network tab shows cancelled)
- [ ] **21.4** Verify new request is initiated for new entityId
- [ ] **21.5** Test rapid option changes: change entityId 3 times quickly
- [ ] **21.6** Verify only the final request's data is used (stale flag prevents earlier responses)
- [ ] **21.7** Unmount component during in-flight request: verify no state update error
- [ ] **21.8** Verify no memory leaks (component unmounts cleanly)

---

## 22. Test Error Handling and onError Callback

**Context:** Test various error scenarios to ensure the hook handles them gracefully and calls the onError callback when provided.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **22.1** Test with API returning 404: verify isError=true, error message set
- [ ] **22.2** Test with API returning 500: verify error state is set
- [ ] **22.3** Test with network failure (offline mode): verify error handling
- [ ] **22.4** Provide onError callback: verify it's called with the error object
- [ ] **22.5** Verify onError callback receives Error instance (not string)
- [ ] **22.6** Test error during refetch: verify isRefetching becomes false, error is set
- [ ] **22.7** Verify data from previous successful fetch is preserved when new fetch fails
- [ ] **22.8** Test that AbortError from cancelled requests doesn't trigger onError

---

## 23. Test Hook with TranslationPreviewPanel Integration

**Context:** Test the hook integrated into the TranslationPreviewPanel component to replace the direct fetch logic. Verify seamless integration and proper data flow.

**Files to modify:** None (testing step, may require updating TranslationPreviewPanel later)

**Estimated effort:** 1 story point

- [ ] **23.1** Update TranslationPreviewPanel to use useTranslationStatus hook instead of direct fetch
- [ ] **23.2** Pass entityId and entityType from panel props to hook
- [ ] **23.3** Replace manual loading state with hook's isLoading
- [ ] **23.4** Replace manual error handling with hook's error state
- [ ] **23.5** Use hook's items data to populate translations list
- [ ] **23.6** Use hook's summary data for TranslationProgressBar
- [ ] **23.7** Test panel opening: verify data loads automatically
- [ ] **23.8** Test panel with auto-polling enabled: verify translation status updates in real-time
- [ ] **23.9** Verify panel works correctly with all features (edit, retranslate, etc.)

---

## 24. Performance and Memory Leak Testing

**Context:** Test the hook's performance characteristics and verify there are no memory leaks.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **24.1** Use React DevTools Profiler to measure hook render performance
- [ ] **24.2** Verify useMemo prevents unnecessary re-renders when data hasn't changed
- [ ] **24.3** Verify useCallback prevents fetchData from changing unnecessarily
- [ ] **24.4** Test mounting/unmounting component 100 times rapidly: verify no memory leaks
- [ ] **24.5** Check browser memory usage before and after: should return to baseline
- [ ] **24.6** Verify abort controllers are properly cleaned up
- [ ] **24.7** Test with very large datasets (100+ items): verify performance remains good
- [ ] **24.8** Verify no warning messages in console about state updates on unmounted components

---

## 25. Document Hook Usage and Examples

**Context:** Add comprehensive JSDoc comments and usage examples to help future developers understand how to use the hook correctly.

**Files to modify:**
- `src/hooks/useTranslationStatus.ts`

**Estimated effort:** 1 story point

- [ ] **25.1** At the top of the file, add a comprehensive usage example in JSDoc
- [ ] **25.2** Include example showing single entity query: `useTranslationStatus({ entityId: 'abc123', entityType: 'item' })`
- [ ] **25.3** Include example showing property-wide query: `useTranslationStatus({ propertyId: 'xyz789' })`
- [ ] **25.4** Include example with filters: `useTranslationStatus({ propertyId: 'xyz789', languages: ['fr', 'es'], statuses: ['completed'] })`
- [ ] **25.5** Include example with enabled flag: `useTranslationStatus({ entityId: id, entityType: 'article', enabled: Boolean(id) })`
- [ ] **25.6** Include example with auto-polling: `useTranslationStatus({ propertyId: id, refetchInterval: 30000 })`
- [ ] **25.7** Include example with error handler: `useTranslationStatus({ propertyId: id, onError: (err) => toast.error(err.message) })`
- [ ] **25.8** Document the return values and when to use each (isLoading vs isRefetching, items vs summary)
- [ ] **25.9** Add notes about cleanup and request cancellation behavior

---

## Summary

This task creates the useTranslationStatus custom React hook for fetching and managing translation status data. The hook provides:

**Core Functionality:**
- Fetches translation status from GET /api/translations/status endpoint
- Supports single entity queries (entityId + entityType)
- Supports property-wide aggregated queries (propertyId)
- Options validation to prevent invalid query combinations
- Filters by languages and statuses
- Manual refetch capability
- Automatic polling with configurable interval
- Enabled flag to disable automatic fetching

**State Management:**
- Loading state for initial fetch (isLoading)
- Refetching state for subsequent fetches (isRefetching)
- Error state with error object
- Last updated timestamp
- Fetched flag indicating if data has been loaded at least once

**Advanced Features:**
- Request cancellation with AbortController
- Race condition handling with stale flag pattern
- Memory leak prevention with cleanup on unmount
- Memoized return values to prevent unnecessary re-renders
- Error callback for custom error handling

**TypeScript Type Safety:**
- Comprehensive interfaces for options and return types
- Full type inference for API responses
- Type-safe filters and query parameters

**Key Files Created:**
- `src/hooks/useTranslationStatus.ts` - Main hook file (~400-500 lines)
- Updated: `src/hooks/index.ts` - Added exports

**Critical Dependencies:**
- REQ-E05-006 (TranslationManagement types) - provides TypeScript types
- REQ-E05-001 (Translation Status API) - provides data endpoint
- apiRequest utility from @/lib/api - handles HTTP requests
- React hooks (useState, useEffect, useCallback, useMemo, useRef)

**Blocks:**
- TranslationPreviewPanel refactoring - can replace direct fetch logic with this hook
- TranslationStatusWidget - will use this hook to fetch data
- Translation management page - will use this hook for list view
- Real-time updates integration - provides foundation for useTranslationRealtime

**Future Enhancements** (out of scope):
- Pagination support (page, pageSize parameters)
- Automatic retry on transient errors (429, 502, 503)
- Request deduplication (same query from multiple components)
- Cache management and TTL
- Optimistic updates

---

*Document generated: 2026-01-22 22:57*
