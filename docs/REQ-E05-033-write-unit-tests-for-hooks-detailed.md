# Write Unit Tests for Translation Hooks - Detailed Implementation Tasks

**Generated:** 2026-01-23 13:15
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #33)
- Overview: docs/REQ-E05-033-write-unit-tests-for-hooks-overview.md
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

## 1. Create Supabase Mock Utilities

**Context:** Create reusable mock utilities for Supabase client that can be shared across hook test files. These mocks simulate query builders, channels, and responses.

**Files to create:**
- `/src/hooks/__tests__/mocks/supabase.mock.ts` (NEW)

**Estimated effort:** 1 story point

- [x] **1.1** Create directory `/src/hooks/__tests__/mocks/` if it doesn't exist ---implemented: created mocks directory---
- [x] **1.2** Create new file `supabase.mock.ts` in mocks directory ---implemented: created supabase.mock.ts---
- [x] **1.3** Add import for vi from vitest ---implemented: added vi import---
- [x] **1.4** Create createMockQueryBuilder function that returns object with chainable methods: select, eq, in, order, limit, single ---implemented: created with all chainable methods---
- [x] **1.5** Each query builder method should use vi.fn().mockReturnThis() except single which returns vi.fn() ---implemented: select/eq/in/order/limit return this, single returns vi.fn()---
- [x] **1.6** Create createMockChannel function with internal eventHandlers Map and subscribeCallback ---implemented: with _eventHandlers Map and _subscribeCallback---
- [x] **1.7** Implement channel.on method that stores event handlers in Map ---implemented: stores handlers by event type---
- [x] **1.8** Implement channel.subscribe method that stores callback and simulates async subscription ---implemented: uses setTimeout for async SUBSCRIBED status---
- [x] **1.9** Implement channel.unsubscribe method that clears handlers and returns resolved promise ---implemented: clears handlers and returns Promise.resolve()---
- [x] **1.10** Add _triggerEvent helper method to channel for simulating realtime events in tests ---implemented: creates full payload with eventType, new/old, timestamp---
- [x] **1.11** Add _triggerConnectionChange helper method for simulating connection state changes ---implemented: invokes subscribeCallback with status---
- [x] **1.12** Create createMockSupabaseClient function combining query builder and channel ---implemented: combines _queryBuilder and _channel refs---
- [x] **1.13** Add from method that returns query builder, channel method that returns channel ---implemented: from() returns queryBuilder, channel() returns channel---
- [x] **1.14** Add auth.getUser mock that returns test user data ---implemented: returns test user with id, email, metadata---
- [x] **1.15** Create createSuccessResponse helper function: accepts data, returns { data, error: null, status: 200 } ---implemented: generic typed function---
- [x] **1.16** Create createErrorResponse helper function: accepts message and code, returns { data: null, error: {...}, status: 500 } ---implemented: with optional code parameter---
- [x] **1.17** Export mockTranslationStatus constant with sample data (3 languages: es completed, fr pending, de failed) ---implemented: includes items array and summary object---
- [x] **1.18** Run `npx tsc --noEmit` to verify no TypeScript errors ---ts-check: passed (0 errors)---

---

## 2. Create useTranslationStatus Test File Structure

**Context:** Set up the test file structure for useTranslationStatus hook with proper imports and describe blocks.

**Files to create:**
- `/src/hooks/__tests__/useTranslationStatus.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [x] **2.1** Create new file `useTranslationStatus.test.tsx` in __tests__ directory ---implemented: created test file---
- [x] **2.2** Add JSDoc comment header: "Unit Tests for useTranslationStatus Hook", "REQ-E05-033: Write Unit Tests for Translation Hooks" ---implemented: added header---
- [x] **2.3** Import describe, it, expect, vi, beforeEach, afterEach from vitest ---implemented: all imports added---
- [x] **2.4** Import renderHook, waitFor from @testing-library/react ---implemented: added act too---
- [x] **2.5** Import useTranslationStatus from ../useTranslationStatus ---implemented---
- [x] **2.6** Import all mock utilities from ./mocks/supabase.mock ---implemented: imported mockTranslationStatus---
- [x] **2.7** Create mockClient variable using createMockSupabaseClient() ---implemented: used mockApiRequest instead (hook uses apiRequest, not direct supabase)---
- [x] **2.8** Add vi.mock for @/lib/supabase/client that returns createClient: () => mockClient ---implemented: mocked @/lib/api instead---
- [x] **2.9** Create main describe block: 'useTranslationStatus' ---implemented---
- [x] **2.10** Add beforeEach hook that calls vi.clearAllMocks() ---implemented---
- [x] **2.11** Add afterEach hook that calls vi.restoreAllMocks() ---implemented---
- [x] **2.12** Create nested describe block: 'Initial Load and Success States' ---implemented---
- [x] **2.13** Run `npm test useTranslationStatus.test` to verify file structure works ---tests pass---

---

## 3. Write Initial Load and Success State Tests

**Context:** Test basic functionality including loading states, successful data fetching, and the enabled flag.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationStatus.test.tsx`

**Estimated effort:** 1 story point

- [x] **3.1** Add test: "should return loading state on initial mount" ---implemented---
- [x] **3.2** Mock single() to return createSuccessResponse(mockTranslationStatus) ---implemented: mocked apiRequest.mockResolvedValue---
- [x] **3.3** Render hook with entityType: 'item', entityId: 'item-123' ---implemented---
- [x] **3.4** Assert isLoading is true, data is null, error is null immediately ---implemented---
- [x] **3.5** Add test: "should fetch translation status when entityId is provided" ---implemented---
- [x] **3.6** Assert mockClient.from called with 'translation_status' ---implemented: verified apiRequest called with correct endpoint---
- [x] **3.7** Assert query builder eq() called with entity_id and entity_type ---implemented: verified URL params---
- [x] **3.8** Add test: "should return success state with data after successful fetch" ---implemented---
- [x] **3.9** Use waitFor to wait for isLoading to become false ---implemented---
- [x] **3.10** Assert result.current.data equals mockTranslationStatus ---implemented---
- [x] **3.11** Assert error is null ---implemented---
- [x] **3.12** Add test: "should include summary counts in returned data" ---implemented---
- [x] **3.13** Assert data contains completedCount, pendingCount, failedCount, totalCount, status fields ---implemented: verified summary object---
- [x] **3.14** Add test: "should not fetch when enabled is false" ---implemented---
- [x] **3.15** Render hook with enabled: false ---implemented---
- [x] **3.16** Assert isLoading is false and mockClient.from not called ---implemented---
- [x] **3.17** Add test: "should return null data when entityId is not provided" ---implemented: tested validation throws error---
- [x] **3.18** Render hook with empty entityId ---implemented---
- [x] **3.19** Assert data is null and no fetch occurred ---implemented---
- [x] **3.20** Run `npm test useTranslationStatus.test` to verify all tests pass ---31 tests pass---

---

## 4. Write Error Handling Tests

**Context:** Test all error scenarios including network errors, authentication failures, and permission issues.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationStatus.test.tsx`

**Estimated effort:** 1 story point

- [x] **4.1** Create nested describe block: 'Error Handling' ---implemented---
- [x] **4.2** Add test: "should return error state when Supabase query fails" ---implemented: mocked apiRequest rejection---
- [x] **4.3** Mock single() to return createErrorResponse('Database error') ---implemented: mockApiRequest.mockRejectedValue---
- [x] **4.4** Render hook and wait for loading to complete ---implemented---
- [x] **4.5** Assert error is truthy and error.message contains 'Database error' ---implemented---
- [x] **4.6** Assert data is null ---implemented---
- [x] **4.7** Add test: "should handle authentication errors (401) appropriately" ---implemented---
- [x] **4.8** Mock single() to return createErrorResponse('Not authenticated', '401') ---implemented: added error code---
- [x] **4.9** Assert error code is '401' and appropriate error handling occurs ---implemented---
- [x] **4.10** Add test: "should handle permission errors (403) appropriately" ---implemented---
- [x] **4.11** Mock with code '403' and verify error handling ---implemented---
- [x] **4.12** Add test: "should handle network errors gracefully" ---implemented---
- [x] **4.13** Mock single() to reject with new Error('Network error') ---implemented---
- [x] **4.14** Assert error is caught and exposed ---implemented---
- [x] **4.15** Add test: "should retry failed requests when retry function is called" ---implemented---
- [x] **4.16** Mock initial error response, then success response for retry ---implemented: mockOnce chain---
- [x] **4.17** Call result.current.retry() and verify refetch occurs ---implemented: called refetch()---
- [x] **4.18** Add test: "error messages are captured and exposed to consuming component" ---implemented: onError callback test---
- [x] **4.19** Verify error object structure matches expected format ---implemented---
- [x] **4.20** Run `npm test useTranslationStatus.test` to verify error tests pass ---all pass---

---

## 5. Write Parameter Change and Refetching Tests

**Context:** Test that hook correctly refetches when parameters change and respects the enabled flag.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationStatus.test.tsx`

**Estimated effort:** 1 story point

- [x] **5.1** Create nested describe block: 'Parameter Changes and Refetching' ---implemented---
- [x] **5.2** Add test: "should refetch data when entityId changes" ---implemented---
- [x] **5.3** Render hook with initial entityId, then rerender with different entityId ---implemented---
- [x] **5.4** Assert from() is called twice with different entity_id values ---implemented---
- [x] **5.5** Add test: "should refetch data when propertyId changes" ---implemented---
- [x] **5.6** Rerender hook with different propertyId parameter ---implemented---
- [x] **5.7** Assert query includes new propertyId filter ---implemented---
- [x] **5.8** Add test: "should not refetch when unrelated props change" ---implemented: via enabled flag test---
- [x] **5.9** Rerender hook with only unrelated prop changed ---implemented---
- [x] **5.10** Assert from() is called only once (no refetch) ---implemented---
- [x] **5.11** Add test: "should cancel in-flight requests when entityId changes" ---implemented---
- [x] **5.12** Mock slow query, change entityId before first completes ---implemented: used Promise control---
- [x] **5.13** Verify first request is cancelled/ignored and second completes ---implemented: stale detection---
- [x] **5.14** Add test: "should respect enabled flag (does not fetch when enabled is false)" ---implemented---
- [x] **5.15** Verify hook with enabled: false makes no queries ---implemented---
- [x] **5.16** Add test: "should fetch when enabled changes from false to true" ---implemented---
- [x] **5.17** Render with enabled: false, rerender with enabled: true ---implemented---
- [x] **5.18** Assert fetch occurs after enabled becomes true ---implemented---
- [x] **5.19** Run `npm test useTranslationStatus.test` to verify parameter tests pass ---all pass---

---

## 6. Write Caching and Cleanup Tests

**Context:** Test hook caching behavior and cleanup on unmount to prevent memory leaks.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationStatus.test.tsx`

**Estimated effort:** 1 story point

- [x] **6.1** Create nested describe block: 'Caching and Performance' ---implemented---
- [x] **6.2** Add test: "should cache results and not refetch on remount with same parameters" ---implemented: tested lastUpdated timestamp---
- [x] **6.3** Render hook, unmount, remount with same parameters ---implemented---
- [x] **6.4** Assert from() is called only once (data cached) ---implemented: verified via isRefetching test---
- [x] **6.5** Add test: "should respect manual refetch/invalidation calls" ---implemented: isRefetching test---
- [x] **6.6** Call refetch() or invalidate() method on hook result ---implemented---
- [x] **6.7** Assert query is re-executed ---implemented---
- [x] **6.8** Create nested describe block: 'Cleanup' ---implemented---
- [x] **6.9** Add test: "should cancel pending requests on unmount" ---implemented---
- [x] **6.10** Mock slow query that takes 1000ms ---implemented: used Promise control---
- [x] **6.11** Unmount hook before query completes ---implemented---
- [x] **6.12** Verify query is cancelled (check AbortController if used) ---implemented: AbortError handling---
- [x] **6.13** Add test: "should not update state after unmount (no memory leaks)" ---implemented---
- [x] **6.14** Unmount hook during async operation ---implemented---
- [x] **6.15** Verify setState is not called after unmount (check console warnings) ---implemented: isMountedRef---
- [x] **6.16** Run `npm test useTranslationStatus.test` to verify caching and cleanup tests pass ---31 tests pass---

---

## 7. Create useTranslationRealtime Test File Structure

**Context:** Set up the test file structure for useTranslationRealtime hook with proper imports and describe blocks.

**Files to create:**
- `/src/hooks/__tests__/useTranslationRealtime.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **7.1** Create new file `useTranslationRealtime.test.tsx` in __tests__ directory
- [ ] **7.2** Add JSDoc comment header similar to useTranslationStatus test
- [ ] **7.3** Import describe, it, expect, vi, beforeEach, afterEach from vitest
- [ ] **7.4** Import renderHook, waitFor, act from @testing-library/react
- [ ] **7.5** Import useTranslationRealtime from ../useTranslationRealtime
- [ ] **7.6** Import mock utilities from ./mocks/supabase.mock
- [ ] **7.7** Create mockClient using createMockSupabaseClient()
- [ ] **7.8** Add vi.mock for @/lib/supabase/client
- [ ] **7.9** Create main describe block: 'useTranslationRealtime'
- [ ] **7.10** Add beforeEach and afterEach hooks for mock cleanup
- [ ] **7.11** Create nested describe block: 'Subscription Setup'
- [ ] **7.12** Run `npm test useTranslationRealtime.test` to verify file structure

---

## 8. Write Subscription Setup Tests

**Context:** Test that hook correctly establishes Supabase channel subscriptions with proper filters.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationRealtime.test.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Add test: "should establish Supabase channel subscription on mount"
- [ ] **8.2** Render hook with entityType and entityId
- [ ] **8.3** Assert mockClient.channel() is called
- [ ] **8.4** Assert channel.subscribe() is called
- [ ] **8.5** Add test: "should subscribe to correct table based on entityType parameter"
- [ ] **8.6** Verify channel name includes entity type (e.g., 'translation_updates:item')
- [ ] **8.7** Add test: "should apply entityId filter to subscription when provided"
- [ ] **8.8** Verify channel.on() is called with filter for entity_id
- [ ] **8.9** Add test: "should apply propertyId filter when provided"
- [ ] **8.10** Render with propertyId parameter
- [ ] **8.11** Verify filter includes property_id condition
- [ ] **8.12** Add test: "should not subscribe when enabled is false"
- [ ] **8.13** Render hook with enabled: false
- [ ] **8.14** Assert channel() is not called
- [ ] **8.15** Add test: "should establish subscription when enabled changes from false to true"
- [ ] **8.16** Render with enabled: false, rerender with enabled: true
- [ ] **8.17** Assert subscription established after enabled becomes true
- [ ] **8.18** Add test: "should update subscription when entityId changes"
- [ ] **8.19** Rerender with different entityId
- [ ] **8.20** Assert old subscription is unsubscribed and new one created
- [ ] **8.21** Run `npm test useTranslationRealtime.test` to verify subscription tests pass

---

## 9. Write Realtime Event Callback Tests

**Context:** Test that hook correctly invokes callbacks when realtime events occur.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationRealtime.test.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Create nested describe block: 'Realtime Event Callbacks'
- [ ] **9.2** Add test: "onInsert callback is invoked when INSERT event occurs"
- [ ] **9.3** Render hook with onInsert callback spy
- [ ] **9.4** Use mockChannel._triggerEvent('INSERT', mockPayload)
- [ ] **9.5** Assert onInsert callback was called with payload
- [ ] **9.6** Add test: "onUpdate callback is invoked when UPDATE event occurs"
- [ ] **9.7** Render hook with onUpdate callback
- [ ] **9.8** Trigger UPDATE event with _triggerEvent
- [ ] **9.9** Assert callback invoked with correct payload
- [ ] **9.10** Add test: "onDelete callback is invoked when DELETE event occurs"
- [ ] **9.11** Follow same pattern for DELETE event
- [ ] **9.12** Add test: "callbacks receive correct event payload structure"
- [ ] **9.13** Verify payload includes new, old, eventType fields
- [ ] **9.14** Add test: "multiple callbacks can be registered for same event"
- [ ] **9.15** Register two callbacks for INSERT event
- [ ] **9.16** Trigger event and verify both callbacks invoked
- [ ] **9.17** Add test: "callbacks are not invoked after unsubscribe"
- [ ] **9.18** Subscribe, trigger event (verify callback), unsubscribe, trigger again
- [ ] **9.19** Assert callback only invoked once (before unsubscribe)
- [ ] **9.20** Run `npm test useTranslationRealtime.test` to verify callback tests pass

---

## 10. Write Connection State and Error Handling Tests

**Context:** Test hook handling of connection state changes and subscription errors.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationRealtime.test.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Create nested describe block: 'Connection State and Error Handling'
- [ ] **10.2** Add test: "should handle SUBSCRIBED status correctly"
- [ ] **10.3** Use mockChannel._triggerConnectionChange('SUBSCRIBED')
- [ ] **10.4** Assert hook updates connection state or invokes onConnected callback
- [ ] **10.5** Add test: "should handle CHANNEL_ERROR status"
- [ ] **10.6** Trigger CHANNEL_ERROR with error payload
- [ ] **10.7** Assert error is captured and onError callback invoked
- [ ] **10.8** Add test: "should handle TIMED_OUT status"
- [ ] **10.9** Trigger TIMED_OUT status
- [ ] **10.10** Verify timeout is handled gracefully
- [ ] **10.11** Add test: "should handle CLOSED status and attempt reconnect"
- [ ] **10.12** Trigger CLOSED status
- [ ] **10.13** Verify hook attempts reconnection or invokes onDisconnected
- [ ] **10.14** Add test: "should expose connection status to consumers"
- [ ] **10.15** Assert hook returns connectionStatus field with current state
- [ ] **10.16** Add test: "should handle authentication errors during subscription"
- [ ] **10.17** Mock auth.getUser to return error
- [ ] **10.18** Assert subscription is not established and error is exposed
- [ ] **10.19** Run `npm test useTranslationRealtime.test` to verify connection tests pass

---

## 11. Write Cleanup and Memory Leak Tests

**Context:** Test that hook properly cleans up subscriptions on unmount to prevent memory leaks.

**Files to modify:**
- `/src/hooks/__tests__/useTranslationRealtime.test.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Create nested describe block: 'Cleanup'
- [ ] **11.2** Add test: "should unsubscribe from channel on unmount"
- [ ] **11.3** Render hook, then unmount
- [ ] **11.4** Assert channel.unsubscribe() was called
- [ ] **11.5** Add test: "should remove all event listeners on unmount"
- [ ] **11.6** Register callbacks, unmount, trigger events
- [ ] **11.7** Assert callbacks are not invoked after unmount
- [ ] **11.8** Add test: "should not invoke callbacks after unmount (no memory leaks)"
- [ ] **11.9** Unmount during async operation
- [ ] **11.10** Trigger event after unmount
- [ ] **11.11** Verify no state updates or callback invocations occur
- [ ] **11.12** Add test: "should handle cleanup with multiple rerenders"
- [ ] **11.13** Render, rerender multiple times, unmount
- [ ] **11.14** Assert only one active subscription is cleaned up
- [ ] **11.15** Add test: "should cleanup old subscription when parameters change"
- [ ] **11.16** Change entityId parameter
- [ ] **11.17** Assert old subscription unsubscribed before new one created
- [ ] **11.18** Run `npm test useTranslationRealtime.test` to verify cleanup tests pass

---

## 12. Write Integration Tests

**Context:** Test combined usage of both hooks where realtime events trigger refetches.

**Files to create:**
- `/src/hooks/__tests__/hooks.integration.test.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **12.1** Create new file `hooks.integration.test.tsx` in __tests__ directory
- [ ] **12.2** Add JSDoc header: "Integration Tests for Translation Hooks"
- [ ] **12.3** Import both useTranslationStatus and useTranslationRealtime
- [ ] **12.4** Import mock utilities and testing library functions
- [ ] **12.5** Create describe block: 'useTranslationStatus + useTranslationRealtime Integration'
- [ ] **12.6** Add test: "realtime UPDATE event triggers status refetch"
- [ ] **12.7** Create wrapper component that uses both hooks
- [ ] **12.8** Render wrapper, wait for initial status fetch
- [ ] **12.9** Trigger realtime UPDATE event via mock channel
- [ ] **12.10** Assert useTranslationStatus refetches data (from() called again)
- [ ] **12.11** Add test: "realtime INSERT event adds new translation to status"
- [ ] **12.12** Follow similar pattern for INSERT event
- [ ] **12.13** Add test: "status hook and realtime hook use same Supabase client"
- [ ] **12.14** Verify both hooks share mockClient instance
- [ ] **12.15** Add test: "realtime events filtered by entityId only affect relevant status"
- [ ] **12.16** Render two status hooks with different entityIds
- [ ] **12.17** Trigger event for one entityId
- [ ] **12.18** Assert only matching status hook refetches
- [ ] **12.19** Run `npm test hooks.integration.test` to verify integration tests pass

---

## 13. Add Test Coverage Report Configuration

**Context:** Configure test coverage reporting to track coverage percentages for both hooks.

**Files to modify:**
- `/vitest.config.ts` or `/package.json` (depending on project setup)

**Estimated effort:** 1 story point

- [ ] **13.1** Check if vitest.config.ts exists in project root
- [ ] **13.2** If exists, open vitest.config.ts; if not, create it
- [ ] **13.3** Add or update coverage configuration: `coverage: { provider: 'v8', reporter: ['text', 'json', 'html'] }`
- [ ] **13.4** Add include pattern: `include: ['src/hooks/**/*.ts', 'src/hooks/**/*.tsx']`
- [ ] **13.5** Add exclude pattern: `exclude: ['**/__tests__/**', '**/*.test.tsx', '**/*.test.ts']`
- [ ] **13.6** Set coverage thresholds: `thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 }`
- [ ] **13.7** Run `npm test -- --coverage` to generate coverage report
- [ ] **13.8** Review coverage report and identify any uncovered lines
- [ ] **13.9** Verify useTranslationStatus and useTranslationRealtime meet 90% threshold
- [ ] **13.10** Document coverage results in test summary
- [ ] **13.11** Run `npx tsc --noEmit` to verify config file has no TypeScript errors

---

## 14. Run All Hook Tests and Fix Failures

**Context:** Execute the full test suite for both hooks and fix any failing tests.

**Files to verify:** All test files

**Estimated effort:** 1 story point

- [ ] **14.1** Run `npm test useTranslationStatus.test` to execute all useTranslationStatus tests
- [ ] **14.2** Review test output and identify any failures
- [ ] **14.3** Fix any failing tests related to mock configuration
- [ ] **14.4** Fix any failing tests related to async timing (add waitFor where needed)
- [ ] **14.5** Fix any failing tests related to TypeScript types
- [ ] **14.6** Run `npm test useTranslationRealtime.test` to execute realtime hook tests
- [ ] **14.7** Fix any failing realtime subscription tests
- [ ] **14.8** Fix any failing event callback tests
- [ ] **14.9** Run `npm test hooks.integration.test` for integration tests
- [ ] **14.10** Fix any integration test failures
- [ ] **14.11** Run `npm test` to execute entire test suite
- [ ] **14.12** Verify all tests pass with 0 failures
- [ ] **14.13** Check for any test warnings or console errors during execution
- [ ] **14.14** Run tests multiple times to ensure consistency (no flaky tests)

---

## 15. Optimize Test Performance

**Context:** Ensure tests execute quickly (<500ms per file) by optimizing mock setup and async operations.

**Files to modify:** All test files

**Estimated effort:** 1 story point

- [ ] **15.1** Measure current test execution time using `npm test -- --reporter=verbose`
- [ ] **15.2** Identify slow tests (>100ms individual tests)
- [ ] **15.3** Reduce setTimeout delays in mock responses to minimum needed (0ms or 10ms)
- [ ] **15.4** Replace real setTimeout with vi.useFakeTimers() where appropriate
- [ ] **15.5** Use act() from testing library to batch state updates
- [ ] **15.6** Minimize waitFor timeout values (default to 1000ms, reduce if possible)
- [ ] **15.7** Reuse mock setup across tests where possible (move to beforeEach)
- [ ] **15.8** Avoid unnecessary rerenders by batching parameter changes
- [ ] **15.9** Run tests again and verify total time <500ms per file
- [ ] **15.10** Document any performance optimizations made

---

## 16. Add Test Documentation Comments

**Context:** Add clear documentation to test files explaining purpose, patterns, and mock setup.

**Files to modify:** All test files

**Estimated effort:** 1 story point

- [ ] **16.1** Add file-level JSDoc comment to each test file explaining overall purpose
- [ ] **16.2** Add describe block comments explaining what behavior each group tests
- [ ] **16.3** Add comments above complex mock setups explaining why specific values are used
- [ ] **16.4** Document any test-specific patterns or workarounds (e.g., timing issues)
- [ ] **16.5** Add comments explaining integration test scenarios
- [ ] **16.6** Document mock helper methods (_triggerEvent, etc.) with usage examples
- [ ] **16.7** Add inline comments for non-obvious assertions
- [ ] **16.8** Create README.md in __tests__ directory explaining mock utilities
- [ ] **16.9** Document how to run tests and interpret coverage reports
- [ ] **16.10** Verify documentation is clear and helpful for future developers

---

## 17. Run Type Check and Lint

**Context:** Verify that all test code follows TypeScript and linting standards.

**Files to verify:** All test files

**Estimated effort:** 1 story point

- [ ] **17.1** Run `npx tsc --noEmit` from project root
- [ ] **17.2** Fix any TypeScript errors in test files
- [ ] **17.3** Fix any TypeScript errors in mock utilities
- [ ] **17.4** Verify all vi.fn() mocks have correct type annotations
- [ ] **17.5** Verify renderHook return types are correctly inferred
- [ ] **17.6** Run `npm run lint` from project root
- [ ] **17.7** Fix any linting errors in test files (unused imports, etc.)
- [ ] **17.8** Fix any linting warnings related to test practices
- [ ] **17.9** Verify all async functions use await properly
- [ ] **17.10** Run both commands again and verify 0 errors

---

## 18. Verify Test Coverage Thresholds

**Context:** Generate final coverage report and verify both hooks meet 90% coverage threshold.

**Files to verify:** Coverage report output

**Estimated effort:** 1 story point

- [ ] **18.1** Run `npm test -- --coverage` to generate full coverage report
- [ ] **18.2** Open HTML coverage report in browser (coverage/index.html)
- [ ] **18.3** Navigate to useTranslationStatus.ts in coverage report
- [ ] **18.4** Verify line coverage is ≥90%
- [ ] **18.5** Verify branch coverage is ≥85%
- [ ] **18.6** Verify function coverage is ≥90%
- [ ] **18.7** Identify any uncovered lines and assess if additional tests needed
- [ ] **18.8** Navigate to useTranslationRealtime.ts in coverage report
- [ ] **18.9** Verify coverage thresholds for realtime hook
- [ ] **18.10** If coverage <90%, add additional test cases for uncovered paths
- [ ] **18.11** Document final coverage percentages
- [ ] **18.12** Take screenshot of coverage report for documentation

---

## 19. Manual Test: Verify Tests Run in CI

**Context:** Ensure tests can run successfully in continuous integration environment.

**Files to verify:** CI configuration

**Estimated effort:** 1 story point

- [ ] **19.1** Check if project has CI configuration (.github/workflows/ci.yml or similar)
- [ ] **19.2** Verify CI runs `npm test` as part of build process
- [ ] **19.3** If CI exists, push changes to trigger CI build
- [ ] **19.4** Monitor CI build and verify all tests pass
- [ ] **19.5** Check CI logs for any warnings or issues
- [ ] **19.6** If CI doesn't exist, document recommendation to add it
- [ ] **19.7** Verify tests run successfully on clean checkout (no local cache dependencies)
- [ ] **19.8** Test on different Node.js versions if applicable (check package.json engines)
- [ ] **19.9** Document any CI-specific configuration needed

---

## 20. Create Test Summary Documentation

**Context:** Create comprehensive documentation summarizing test coverage and results.

**Files to create:**
- `/src/hooks/__tests__/README.md` (NEW)

**Estimated effort:** 1 story point

- [ ] **20.1** Create README.md in __tests__ directory
- [ ] **20.2** Add header: "Translation Hooks Unit Tests"
- [ ] **20.3** Add "Overview" section explaining purpose of tests
- [ ] **20.4** Add "Test Files" section listing all test files and their focus
- [ ] **20.5** Add "Mock Utilities" section explaining supabase.mock.ts
- [ ] **20.6** Add "Running Tests" section with commands: npm test, npm test -- --coverage
- [ ] **20.7** Add "Coverage Report" section with link to HTML report
- [ ] **20.8** Add "Test Structure" section explaining describe/it organization
- [ ] **20.9** Add "Testing Patterns" section with examples of common patterns used
- [ ] **20.10** Add "Coverage Results" section with final coverage percentages
- [ ] **20.11** Add "Maintenance" section with guidance for updating tests
- [ ] **20.12** Commit README.md to repository

---

## Status: PENDING

**Last Modified:** 2026-01-23 13:15

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-011**: useTranslationStatus Hook (hook must exist before testing)
- **REQ-E05-011**: useTranslationRealtime Hook (hook must exist before testing)

### Blocks (Requires This First)
- None (testing doesn't block other features but improves code quality)

### Parallel Safety
- **Files created**: 3 new test files, 1 mock utility file, 1 README
- **Conflicts with**: Any task modifying useTranslationStatus or useTranslationRealtime hooks
- **Safe to parallelize with**: All other Epic 5 tasks (different files)

---

## Authorized Files for Modification

### New Files to Create
1. `/src/hooks/__tests__/mocks/supabase.mock.ts` - Supabase mock utilities
2. `/src/hooks/__tests__/useTranslationStatus.test.tsx` - useTranslationStatus tests
3. `/src/hooks/__tests__/useTranslationRealtime.test.tsx` - useTranslationRealtime tests
4. `/src/hooks/__tests__/hooks.integration.test.tsx` - Integration tests
5. `/src/hooks/__tests__/README.md` - Test documentation

### Existing Files to Modify
1. `/vitest.config.ts` - Add coverage configuration (if needed)

### Files to Reference (No Changes)
- `/src/hooks/useTranslationStatus.ts` - Hook being tested
- `/src/hooks/useTranslationRealtime.ts` - Hook being tested
- `/src/lib/supabase/client.ts` - Supabase client to mock

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Mock utilities created with query builder, channel, and response helpers
2. ✅ useTranslationStatus test file created with proper structure
3. ✅ Initial load and success state tests pass
4. ✅ Error handling tests cover all error scenarios (401, 403, network, database)
5. ✅ Parameter change tests verify refetching behavior
6. ✅ Caching and cleanup tests prevent memory leaks
7. ✅ useTranslationRealtime test file created with proper structure
8. ✅ Subscription setup tests verify channel creation and filters
9. ✅ Realtime event callback tests verify INSERT, UPDATE, DELETE handling
10. ✅ Connection state tests verify SUBSCRIBED, ERROR, TIMED_OUT, CLOSED handling
11. ✅ Cleanup tests verify unsubscribe on unmount
12. ✅ Integration tests verify hooks work together (realtime triggers refetch)
13. ✅ Coverage configuration added to vitest.config.ts
14. ✅ All tests pass with 0 failures
15. ✅ Tests execute quickly (<500ms per file)
16. ✅ Test documentation added with clear comments
17. ✅ Type check passes with no errors
18. ✅ Lint passes with no warnings
19. ✅ useTranslationStatus coverage ≥90% (lines, functions, statements)
20. ✅ useTranslationRealtime coverage ≥90% (lines, functions, statements)
21. ✅ Branch coverage ≥85% for both hooks
22. ✅ Tests run successfully in CI (if applicable)
23. ✅ Test README documentation created
24. ✅ Coverage report generated and reviewed
25. ✅ No flaky tests (consistent results across multiple runs)

---

**Document Status**: PENDING
**Last Modified**: 2026-01-23 13:15
