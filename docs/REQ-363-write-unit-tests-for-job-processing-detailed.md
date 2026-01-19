# REQ-363: Write Unit Tests for Job Processing Infrastructure - Detailed Task Breakdown

**Generated:** 2026-01-19 UTC
**Last Modified:** 2026-01-19 UTC
**Request Reference:** docs/gen_requests_epic3.md - Request #363
**Overview Reference:** docs/REQ-363-write-unit-tests-for-job-processing-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 7, Task 7.2)
**Status:** Detailed Task Breakdown

---

## Executive Summary

This detailed task breakdown document provides granular, actionable implementation tasks for creating comprehensive unit tests for the translation job processing infrastructure. Each task is designed as a single story point (approximately 30 minutes of work) that can be executed by an AI coding agent or junior developer.

The test suite will validate:
- Job pickup and locking mechanisms (`translation-jobs.ts`)
- Entity-specific processors for articles, items, links, and tags (`job-processor.ts`)
- Retry logic with exponential backoff
- Concurrency control and stale lock management (`concurrency-control.ts`)

**Total Estimated Tasks:** 28 tasks (~14 hours of implementation)
**Target Test Count:** ~75 unit tests
**Target Coverage:** 85% for critical functions

---

## Prerequisites

Before beginning implementation, verify:

1. **Vitest is installed and configured** - `npm test` runs successfully
2. **Existing test infrastructure is in place:**
   - `src/lib/job-queue/__tests__/helpers/mockFactories.ts` exists
   - `src/lib/job-queue/__tests__/helpers/testUtils.ts` exists
   - `src/lib/job-queue/__tests__/helpers/mockSupabase.ts` exists
   - `src/lib/job-queue/__tests__/helpers/constants.ts` exists
3. **Source files to test exist:**
   - `src/lib/job-queue/translation-jobs.ts`
   - `src/lib/job-queue/job-processor.ts`
   - `src/lib/job-queue/concurrency-control.ts`

---

## File Structure Overview

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts` | Unit tests for job pickup and locking (~15 tests) |
| `src/lib/job-queue/__tests__/entity-processors.unit.test.ts` | Unit tests for entity-specific processors (~20 tests) |
| `src/lib/job-queue/__tests__/retry-logic.unit.test.ts` | Unit tests for retry logic (~15 tests) |
| `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts` | Unit tests for concurrency control (~25 tests) |

### Files to MODIFY (if needed)

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Add new mock factories for link/tag content |
| `src/lib/job-queue/__tests__/helpers/testUtils.ts` | Add new test utilities if required |

---

## Part 1: Job Pickup and Locking Unit Tests

### Task 1.1: Create Test File Scaffold for Job Pickup Tests

**File:** `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts`

**Actions:**
1. Create new test file
2. Add imports for vitest (`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`)
3. Add imports from `../translation-jobs`
4. Add imports from `./helpers/mockFactories`
5. Set up `vi.mock('@/lib/supabase')` with mock `supabaseAdmin`
6. Add `beforeEach` to clear mocks and optionally use fake timers
7. Add `afterEach` to restore mocks
8. Create top-level `describe('Job Pickup and Locking Unit Tests')` block

**Acceptance Criteria:**
- [ ] File compiles without TypeScript errors
- [ ] `npm test -- job-pickup-locking.unit.test.ts` runs (even if tests are empty)

---

### Task 1.2: Write Tests for fetchAndLockNextJob - Successful Fetch

**File:** `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts`

**Actions:**
1. Create `describe('fetchAndLockNextJob')` block
2. Create nested `describe('successful fetch')` block
3. Add test: `it('returns oldest queued job when multiple available')`
   - Mock RPC to return a locked job
   - Verify function returns success with job data
4. Add test: `it('updates job to processing status')`
   - Mock RPC response with status 'processing'
   - Verify returned job has status 'processing'
5. Add test: `it('sets lock fields correctly')`
   - Mock RPC response with locked_by and locked_at
   - Verify lockedBy equals workerId parameter
   - Verify lockedAt is a valid ISO string

**Code Pattern:**
```typescript
it('returns oldest queued job when multiple available', async () => {
  const mockJob = createMockTranslationJob({ status: 'queued' });
  const { supabaseAdmin } = await import('@/lib/supabase');

  vi.mocked(supabaseAdmin.rpc).mockResolvedValueOnce({
    data: [{
      id: mockJob.id,
      entity_type: mockJob.entityType,
      entity_id: mockJob.entityId,
      source_language: mockJob.sourceLanguage,
      target_language: mockJob.targetLanguage,
      status: 'processing',
      locked_by: 'test-worker',
      locked_at: new Date().toISOString(),
      attempts: 1,
      // ... other snake_case fields
    }],
    error: null,
  });

  const { fetchAndLockNextJob } = await import('../translation-jobs');
  const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

  expect(result.success).toBe(true);
  expect(result.data).not.toBeNull();
});
```

**Acceptance Criteria:**
- [ ] 3 passing tests for successful job fetch
- [ ] Tests verify job status transition
- [ ] Tests verify lock field population

---

### Task 1.3: Write Tests for fetchAndLockNextJob - Lock Atomicity

**File:** `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts`

**Actions:**
1. Add test: `it('increments attempts counter')`
   - Mock RPC to return attempts = 1
   - Verify returned job has incremented attempts
2. Add test: `it('maps response from snake_case to camelCase')`
   - Mock RPC with snake_case fields
   - Verify returned job has camelCase properties
3. Add test: `it('calls RPC function with correct parameters')`
   - Verify `supabaseAdmin.rpc` called with `'fetch_and_lock_translation_job'`
   - Verify `p_worker_id` parameter matches input

**Acceptance Criteria:**
- [ ] 3 additional passing tests
- [ ] Tests verify RPC call parameters
- [ ] Tests verify case conversion

---

### Task 1.4: Write Tests for fetchAndLockNextJob - No Jobs Available

**File:** `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts`

**Actions:**
1. Create nested `describe('no jobs available')` block
2. Add test: `it('returns null when queue empty')`
   - Mock RPC to return empty array
   - Verify result.success is true
   - Verify result.data is null
3. Add test: `it('returns null when all jobs locked')`
   - Mock RPC to return empty array (simulating all locked)
   - Verify result.data is null

**Acceptance Criteria:**
- [ ] 2 passing tests for empty queue scenarios
- [ ] Tests correctly handle null data response

---

### Task 1.5: Write Tests for fetchAndLockNextJob - Error Handling

**File:** `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts`

**Actions:**
1. Create nested `describe('error handling')` block
2. Add test: `it('falls back to optimistic locking on RPC failure')`
   - Mock RPC to return error
   - Mock subsequent `from().select().eq()...` chain for fallback
   - Verify function still attempts to fetch and lock
3. Add test: `it('returns error result on database failure')`
   - Mock complete failure scenario
   - Verify result.success is false
   - Verify result.error contains error message

**Acceptance Criteria:**
- [ ] 2 passing tests for error scenarios
- [ ] Fallback mechanism test covers optimistic locking path

---

### Task 1.6: Write Tests for releaseJobLock Function

**File:** `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts`

**Actions:**
1. Create `describe('releaseJobLock')` block
2. Add test: `it('releases lock for correct owner')`
   - Mock update chain returning success
   - Verify result.success is true
3. Add test: `it('fails for non-owner')`
   - Mock update chain returning no data (wrong owner)
   - Verify result.success is false
   - Verify error message indicates ownership issue
4. Add test: `it('handles missing job')`
   - Mock update chain returning error (job not found)
   - Verify result.success is false

**Acceptance Criteria:**
- [ ] 3 passing tests for releaseJobLock
- [ ] Tests verify ownership validation logic

---

## Part 2: Entity-Specific Processors Unit Tests

### Task 2.1: Create Test File Scaffold for Entity Processors

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create new test file
2. Add imports for vitest
3. Add imports from `../job-processor` (fetchEntityContent, saveTranslation)
4. Add imports from `./helpers/mockFactories`
5. Set up `vi.mock('@/lib/supabase')` with mock `supabaseAdmin`
6. Set up `vi.mock('@/lib/translation-service')` for translateText
7. Add `beforeEach` and `afterEach` hooks
8. Create top-level `describe('Entity-Specific Processors Unit Tests')` block

**Acceptance Criteria:**
- [ ] File compiles without TypeScript errors
- [ ] `npm test -- entity-processors.unit.test.ts` runs

---

### Task 2.2: Write Tests for fetchEntityContent - Article Content

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create `describe('fetchEntityContent')` block
2. Create nested `describe('article content')` block
3. Add test: `it('fetches article with title and description')`
   - Mock `from('item_articles').select().eq().single()` chain
   - Verify returned content has entityType 'article'
   - Verify fields contain title and description
4. Add test: `it('extracts source_language from article')`
   - Mock response with source_language = 'fr'
   - Verify sourceLanguage in returned content
5. Add test: `it('returns null for missing article')`
   - Mock response with error or null data
   - Verify function returns null

**Acceptance Criteria:**
- [ ] 3 passing tests for article content fetching
- [ ] Tests verify correct table is queried

---

### Task 2.3: Write Tests for fetchEntityContent - Item Content

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create nested `describe('item content')` block
2. Add test: `it('fetches item with name and description')`
   - Mock `from('items').select().eq().single()` chain
   - Verify fields contain name and description
3. Add test: `it('extracts source_language from item')`
   - Mock response with source_language
   - Verify correct extraction
4. Add test: `it('returns null for missing item')`
   - Mock error scenario
   - Verify null return

**Acceptance Criteria:**
- [ ] 3 passing tests for item content fetching

---

### Task 2.4: Write Tests for fetchEntityContent - Link Content

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create nested `describe('link content')` block
2. Add test: `it('fetches link with title')`
   - Mock `from('item_links').select().eq().single()` chain
   - Verify fields contain only title
3. Add test: `it('returns null for missing link')`
   - Mock error scenario

**Acceptance Criteria:**
- [ ] 2 passing tests for link content fetching

---

### Task 2.5: Write Tests for fetchEntityContent - Tag Content

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create nested `describe('tag content')` block
2. Add test: `it('fetches English tag translation as source')`
   - Mock `from('tag_translations').select().eq().eq().single()` chain
   - Verify query filters by language = 'en'
3. Add test: `it('defaults source_language to en')`
   - Verify sourceLanguage is always 'en' for tags
4. Add test: `it('returns null for missing tag')`
   - Mock error scenario

**Acceptance Criteria:**
- [ ] 3 passing tests for tag content fetching
- [ ] Tests verify English source is used

---

### Task 2.6: Write Tests for fetchEntityContent - Error Handling

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create nested `describe('error handling')` block
2. Add test: `it('returns null on database error')`
   - Mock database error
   - Verify returns null, not throws
3. Add test: `it('returns null for unknown entity type')`
   - Call with invalid entity type
   - Verify returns null

**Acceptance Criteria:**
- [ ] 2 passing tests for error handling
- [ ] Function gracefully handles errors

---

### Task 2.7: Write Tests for saveTranslation - Article Translations

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create `describe('saveTranslation')` block
2. Create nested `describe('article translations')` block
3. Add test: `it('upserts to article_translations')`
   - Mock upsert chain
   - Verify `from('article_translations')` is called
4. Add test: `it('uses article_id,language constraint')`
   - Capture upsert options
   - Verify onConflict matches expected constraint

**Acceptance Criteria:**
- [ ] 2 passing tests for article translation saving

---

### Task 2.8: Write Tests for saveTranslation - Item, Link, Tag

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create `describe('item translations')` with test for correct table
2. Create `describe('link translations')` with test for correct table
3. Create `describe('tag translations')` with test for correct table
4. Add test verifying `translation_status: 'completed'` is set
5. Add test verifying `translated_at` timestamp is set

**Acceptance Criteria:**
- [ ] 5 passing tests covering all entity types
- [ ] Tests verify correct upsert parameters

---

### Task 2.9: Write Tests for getTranslationContext and getContentType

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Actions:**
1. Create `describe('getTranslationContext')` block
2. Add test: `it('returns vacation rental context for articles')`
3. Add test: `it('returns household item context for items')`
4. Create `describe('getContentType')` block
5. Add test: `it('maps entity.field to correct content type')`
   - Test article.title -> 'article_title'
   - Test item.name -> 'item_name'
   - Test tag.translated_value -> 'tag'

**Note:** If these functions are not exported, test them indirectly through processJob behavior.

**Acceptance Criteria:**
- [ ] 4 passing tests for context/content type helpers

---

## Part 3: Retry Logic Unit Tests

### Task 3.1: Create Test File Scaffold for Retry Logic Tests

**File:** `src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Actions:**
1. Create new test file
2. Add imports for vitest
3. Add imports from `../translation-jobs` (markJobFailed, markJobCompleted)
4. Add imports from `./helpers/mockFactories`
5. Set up mocks for supabase
6. Create top-level `describe('Retry Logic Unit Tests')` block

**Acceptance Criteria:**
- [ ] File compiles without TypeScript errors
- [ ] `npm test -- retry-logic.unit.test.ts` runs

---

### Task 3.2: Write Tests for markJobFailed - Attempts Increment

**File:** `src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Actions:**
1. Create `describe('markJobFailed')` block
2. Add test: `it('increments attempts from current value')`
   - Mock fetch to return current attempts = 1
   - Mock update chain
   - Verify update is called with attempts = 2
3. Add test: `it('stores error message')`
   - Verify error_message field in update call
4. Add test: `it('clears lock fields')`
   - Verify locked_by = null and locked_at = null in update

**Acceptance Criteria:**
- [ ] 3 passing tests for markJobFailed behavior

---

### Task 3.3: Write Tests for markJobFailed - Error Handling

**File:** `src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Actions:**
1. Add test: `it('handles fetch error gracefully')`
   - Mock fetch to return error
   - Verify result.success is false
2. Add test: `it('handles update error gracefully')`
   - Mock fetch success, update failure
   - Verify result.success is false
3. Add test: `it('preserves job history on failure')`
   - Verify error message is stored even on partial failure

**Acceptance Criteria:**
- [ ] 3 passing tests for error scenarios

---

### Task 3.4: Write Tests for Processor Retry Behavior

**File:** `src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Actions:**
1. Create `describe('processor retry behavior')` block
2. Add test: `it('tracks consecutive errors')`
   - Mock TranslationJobProcessor behavior
   - Verify consecutiveErrors increments on failure
3. Add test: `it('resets errors on successful job')`
   - Verify consecutiveErrors resets to 0 on success
4. Add test: `it('pauses on max consecutive errors')`
   - Use fake timers
   - Simulate maxConsecutiveErrors failures
   - Verify processor pauses

**Acceptance Criteria:**
- [ ] 3 passing tests for processor retry behavior

---

### Task 3.5: Write Tests for Error Classification

**File:** `src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Actions:**
1. Create `describe('error classification')` block
2. Add test: `it('retries on translation service error')`
   - Simulate translation API error
   - Verify job is re-queued (not marked permanently failed)
3. Add test: `it('fails immediately on entity not found')`
   - Simulate entity not found
   - Verify job is marked failed (no retry)
4. Add test: `it('retries on database timeout')`
   - Simulate database timeout error
   - Verify retry behavior

**Acceptance Criteria:**
- [ ] 3 passing tests for error classification

---

### Task 3.6: Write Tests for Pause and Resume

**File:** `src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Actions:**
1. Create `describe('pause and resume')` block
2. Add test: `it('pauses for configured duration')`
   - Use `vi.useFakeTimers()`
   - Verify processor pauses
3. Add test: `it('resumes after pause')`
   - Advance timers by errorPauseDurationMs
   - Verify processor resumes
4. Add test: `it('clears interval during pause')`
   - Verify interval is cleared when pausing

**Acceptance Criteria:**
- [ ] 3 passing tests for pause/resume behavior
- [ ] Tests use fake timers correctly

---

## Part 4: Concurrency Control Unit Tests

### Task 4.1: Create Test File Scaffold for Concurrency Control

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create new test file
2. Add imports for vitest
3. Add imports from `../concurrency-control`
4. Add imports from `./helpers/mockFactories`
5. Set up mocks
6. Create top-level `describe('Concurrency Control Unit Tests')` block

**Acceptance Criteria:**
- [ ] File compiles without TypeScript errors
- [ ] `npm test -- concurrency-control.unit.test.ts` runs

---

### Task 4.2: Write Tests for cleanupStaleProcessingJobs - Basic Behavior

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create `describe('Stale Lock Cleanup')` block
2. Create nested `describe('cleanupStaleProcessingJobs')` block
3. Add test: `it('finds jobs with locks older than timeout')`
   - Mock query returning stale jobs
   - Verify staleJobsFound count
4. Add test: `it('resets jobs under max retries to queued')`
   - Mock job with attempts < maxStaleRetries
   - Verify update to 'queued' status
5. Add test: `it('clears lock fields on reset')`
   - Verify locked_by = null, locked_at = null

**Acceptance Criteria:**
- [ ] 3 passing tests for basic cleanup behavior

---

### Task 4.3: Write Tests for cleanupStaleProcessingJobs - Failure Cases

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Add test: `it('marks jobs at max retries as failed')`
   - Mock job with attempts >= maxStaleRetries
   - Verify update to 'failed' status
2. Add test: `it('returns accurate cleanup counts')`
   - Mock multiple jobs (some reset, some failed)
   - Verify jobsReset and jobsMarkedFailed counts
3. Add test: `it('returns empty result when no stale jobs')`
   - Mock empty query result
   - Verify all counts are 0

**Acceptance Criteria:**
- [ ] 3 passing tests for failure and edge cases

---

### Task 4.4: Write Tests for findStaleProcessingJobs

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create `describe('findStaleProcessingJobs')` block
2. Add test: `it('returns only stale processing jobs')`
   - Mock query with filter conditions
   - Verify jobs are mapped correctly
3. Add test: `it('respects custom timeout')`
   - Call with custom lockTimeoutMinutes
   - Verify correct threshold calculation

**Acceptance Criteria:**
- [ ] 2 passing tests for find function

---

### Task 4.5: Write Tests for refreshJobLock

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create `describe('Lock Heartbeat')` block
2. Create nested `describe('refreshJobLock')` block
3. Add test: `it('updates locked_at timestamp')`
   - Mock update chain success
   - Verify new timestamp in result
4. Add test: `it('only updates if worker owns lock')`
   - Verify query includes `eq('locked_by', workerId)`
5. Add test: `it('returns error if lock not owned')`
   - Mock update returning no data
   - Verify error in result

**Acceptance Criteria:**
- [ ] 3 passing tests for lock refresh

---

### Task 4.6: Write Tests for createLockHeartbeat

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create nested `describe('createLockHeartbeat')` block
2. Add test: `it('calls refreshJobLock at interval')`
   - Use fake timers
   - Create heartbeat
   - Advance timer by interval
   - Verify refreshJobLock called
3. Add test: `it('stop function clears interval')`
   - Create heartbeat, get stop function
   - Call stop
   - Advance timers
   - Verify no more calls
4. Add test: `it('stops on lock refresh failure')`
   - Mock refreshJobLock to fail
   - Verify heartbeat stops automatically

**Acceptance Criteria:**
- [ ] 3 passing tests for heartbeat interval behavior

---

### Task 4.7: Write Tests for checkForDuplicateJob

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create `describe('Duplicate Prevention')` block
2. Create nested `describe('checkForDuplicateJob')` block
3. Add test: `it('returns isDuplicate true with existing job')`
   - Mock query returning existing job
   - Verify isDuplicate is true
   - Verify existingJobId is set
4. Add test: `it('returns isDuplicate false when none')`
   - Mock query returning PGRST116 error (no rows)
   - Verify isDuplicate is false
5. Add test: `it('includes existing job status')`
   - Mock query returning job with status
   - Verify existingStatus in result

**Acceptance Criteria:**
- [ ] 3 passing tests for duplicate detection

---

### Task 4.8: Write Tests for createJobIfNotExists

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create nested `describe('createJobIfNotExists')` block
2. Add test: `it('creates job when none exists')`
   - Mock insert success
   - Verify job is returned
3. Add test: `it('returns null on unique constraint violation')`
   - Mock insert with error code '23505'
   - Verify success is true but data is null

**Acceptance Criteria:**
- [ ] 2 passing tests for idempotent job creation

---

### Task 4.9: Write Tests for getLockStatistics

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create `describe('Lock Statistics')` block
2. Create nested `describe('getLockStatistics')` block
3. Add test: `it('counts active locks')`
   - Mock query returning locked jobs
   - Verify activeLocksCount
4. Add test: `it('identifies stale locks')`
   - Mock jobs with old locked_at timestamps
   - Verify staleLocksCount
5. Add test: `it('groups by worker ID')`
   - Mock jobs with different locked_by values
   - Verify locksByWorker object
6. Add test: `it('calculates average duration')`
   - Mock jobs with varying lock times
   - Verify avgLockDurationMs calculation

**Acceptance Criteria:**
- [ ] 4 passing tests for statistics gathering

---

### Task 4.10: Write Tests for ConcurrencyControlManager

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Actions:**
1. Create `describe('ConcurrencyControlManager')` block
2. Add test: `it('start begins automatic cleanup')`
   - Create manager with autoCleanupEnabled
   - Call start()
   - Verify isRunning() is true
3. Add test: `it('stop clears interval')`
   - Start then stop manager
   - Verify isRunning() is false
4. Add test: `it('runCleanup triggers immediate cleanup')`
   - Mock cleanupStaleProcessingJobs
   - Call runCleanup()
   - Verify cleanup function called
5. Add test: `it('updateConfig restarts interval if needed')`
   - Start manager
   - Update cleanupIntervalMs
   - Verify interval restarted with new value

**Acceptance Criteria:**
- [ ] 4 passing tests for manager lifecycle

---

## Part 5: Test Helper Extensions (If Needed)

### Task 5.1: Add Mock Factories for Link and Tag Content

**File:** `src/lib/job-queue/__tests__/helpers/mockFactories.ts`

**Actions:**
1. Add `createMockLinkContent()` function:
   ```typescript
   export function createMockLinkContent(overrides?: Partial<{
     id: string;
     title: string;
     source_language: string;
     item_id: string;
   }>) {
     return {
       id: `link-${Date.now()}`,
       title: 'Test Link Title',
       source_language: 'en',
       item_id: `item-${Date.now()}`,
       ...overrides,
     };
   }
   ```
2. Add `createMockTagContent()` function
3. Export both functions from helpers/index.ts

**Acceptance Criteria:**
- [ ] New factories compile without errors
- [ ] Factories are exported and usable in tests

---

### Task 5.2: Add Heartbeat Test Utilities

**File:** `src/lib/job-queue/__tests__/helpers/testUtils.ts`

**Actions:**
1. Add `createMockHeartbeatResult()` function
2. Add utility for tracking interval calls:
   ```typescript
   export function createIntervalTracker() {
     const calls: number[] = [];
     return {
       track: () => calls.push(Date.now()),
       getCalls: () => [...calls],
       getCallCount: () => calls.length,
       reset: () => calls.length = 0,
     };
   }
   ```

**Acceptance Criteria:**
- [ ] New utilities compile without errors
- [ ] Utilities support heartbeat testing patterns

---

## Part 6: Final Integration and Verification

### Task 6.1: Run Full Test Suite and Fix Any Failures

**Actions:**
1. Run all unit tests: `npm test -- src/lib/job-queue/__tests__/*.unit.test.ts`
2. Fix any failing tests
3. Verify all tests pass
4. Check for TypeScript errors

**Acceptance Criteria:**
- [ ] All ~75 unit tests pass
- [ ] No TypeScript errors
- [ ] Tests execute in under 10 seconds

---

### Task 6.2: Verify Test Coverage

**Actions:**
1. Run coverage report: `npm test -- --coverage src/lib/job-queue`
2. Verify coverage for `translation-jobs.ts` > 85%
3. Verify coverage for `job-processor.ts` > 85%
4. Verify coverage for `concurrency-control.ts` > 85%
5. Document any uncovered edge cases

**Acceptance Criteria:**
- [ ] Test coverage exceeds 85% for critical functions
- [ ] Coverage report generated successfully

---

### Task 6.3: Add Test Documentation Comments

**Actions:**
1. Add JSDoc comment at top of each test file explaining:
   - Purpose of tests
   - Source file being tested
   - Key test scenarios covered
2. Add comment sections explaining edge cases
3. Reference REQ-363 in file headers

**Example:**
```typescript
/**
 * Unit Tests for Job Pickup and Locking
 *
 * Tests the fetchAndLockNextJob and releaseJobLock functions from
 * translation-jobs.ts. Covers:
 * - Successful job fetch and lock acquisition
 * - Handling of empty queue and locked jobs
 * - Error handling and fallback mechanisms
 * - Lock ownership validation
 *
 * @see docs/REQ-363-write-unit-tests-for-job-processing-detailed.md
 * @module job-queue/__tests__/job-pickup-locking.unit
 * @lastModified 2026-01-19
 */
```

**Acceptance Criteria:**
- [ ] All test files have documentation headers
- [ ] Key scenarios are documented

---

## Acceptance Criteria Summary

From the original request (REQ-363):

| Criterion | Task Reference | Status |
|-----------|----------------|--------|
| Unit tests exist for job pickup function | Tasks 1.2-1.5 | 🔲 To Implement |
| Tests verify job pickup respects priority ordering | Task 1.2 | 🔲 To Implement |
| Tests verify job pickup marks selected jobs as in-progress | Task 1.2 | 🔲 To Implement |
| Tests verify job pickup prevents duplicate pickup | Task 1.5 | 🔲 To Implement |
| Tests verify job pickup handles database failures | Task 1.5 | 🔲 To Implement |
| Tests verify job pickup skips already locked jobs | Task 1.4 | 🔲 To Implement |
| Tests verify job pickup includes timestamp | Task 1.3 | 🔲 To Implement |
| Unit tests exist for item processor | Tasks 2.3, 2.8 | 🔲 To Implement |
| Unit tests exist for article processor | Tasks 2.2, 2.7 | 🔲 To Implement |
| Unit tests exist for link processor | Tasks 2.4, 2.8 | 🔲 To Implement |
| Unit tests exist for tag processor | Tasks 2.5, 2.8 | 🔲 To Implement |
| Tests verify all processors handle null values | Task 2.6 | 🔲 To Implement |
| Tests verify all processors handle empty strings | Task 2.6 | 🔲 To Implement |
| Unit tests exist for retry logic | Tasks 3.2-3.3 | 🔲 To Implement |
| Tests verify retry increments count | Task 3.2 | 🔲 To Implement |
| Tests verify retry logic applies backoff | Task 3.6 | 🔲 To Implement |
| Tests verify retry respects max limit | Tasks 3.4-3.5 | 🔲 To Implement |
| Tests verify retry marks permanently failed | Task 3.5 | 🔲 To Implement |
| Tests verify retry records error messages | Task 3.2 | 🔲 To Implement |
| Tests verify retry distinguishes error types | Task 3.5 | 🔲 To Implement |
| Unit tests exist for concurrency control | Tasks 4.2-4.10 | 🔲 To Implement |
| Tests verify concurrency prevents excess workers | Task 4.10 | 🔲 To Implement |
| Tests verify concurrency tracks active workers | Task 4.9 | 🔲 To Implement |
| Tests use mocking for translation API | All tasks | 🔲 To Implement |
| Tests use mocking for database calls | All tasks | 🔲 To Implement |
| All tests pass in local environment | Task 6.1 | 🔲 To Implement |
| Test coverage exceeds 85% | Task 6.2 | 🔲 To Implement |
| Tests execute in under 10 seconds | Task 6.1 | 🔲 To Implement |
| Tests include documentation | Task 6.3 | 🔲 To Implement |

---

## Test Execution Commands

```bash
# Run all job queue unit tests
npm test -- src/lib/job-queue/__tests__/*.unit.test.ts

# Run specific test files
npm test -- src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts
npm test -- src/lib/job-queue/__tests__/entity-processors.unit.test.ts
npm test -- src/lib/job-queue/__tests__/retry-logic.unit.test.ts
npm test -- src/lib/job-queue/__tests__/concurrency-control.unit.test.ts

# Run with coverage
npm test -- --coverage src/lib/job-queue

# Run all job queue tests (including integration)
npm test -- src/lib/job-queue

# Run in watch mode during development
npm test -- --watch src/lib/job-queue/__tests__/*.unit.test.ts
```

---

## References

- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md) - Phase 7, Task 7.2
- [Request #363](/docs/gen_requests_epic3.md) - Write Unit Tests for Job Processing
- [Overview Document](/docs/REQ-363-write-unit-tests-for-job-processing-overview.md)
- [Existing Integration Tests](/src/lib/job-queue/__tests__/job-processing.integration.test.ts)
- [Job Processor Implementation](/src/lib/job-queue/job-processor.ts)
- [Translation Jobs Implementation](/src/lib/job-queue/translation-jobs.ts)
- [Concurrency Control Implementation](/src/lib/job-queue/concurrency-control.ts)

---

*Document generated on 2026-01-19 for REQ-363: Write Unit Tests for Job Processing Infrastructure*
