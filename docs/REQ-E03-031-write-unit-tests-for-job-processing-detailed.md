# REQ-E03-031: Write Unit Tests for Job Processing - Detailed Task Breakdown

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E03-031
**Epic:** 3 - Dynamic Content Translation
**Phase:** 7 - Testing & Validation
**Task ID:** 7.2
**Size:** M (Medium)
**Parent Document:** REQ-E03-031-write-unit-tests-for-job-processing-overview.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating comprehensive unit tests for the translation job processing infrastructure. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

The unit tests will verify:
- Job pickup and locking mechanisms
- Entity-specific translation processors (items, articles, links, tags)
- Retry logic with exponential backoff
- Concurrency control systems

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Vitest is installed and configured (`npm run test` works)
- [ ] Existing test helpers exist at `/src/lib/job-queue/__tests__/helpers/`
- [ ] Job processing modules exist:
  - `/src/lib/job-queue/translation-jobs.ts`
  - `/src/lib/job-queue/job-processor.ts`
  - `/src/lib/job-queue/concurrency-control.ts`
- [ ] Integration tests are passing (no regressions)

---

## Task Breakdown

### Task 1: Set Up Test File Structure and Common Imports

**File:** `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts` (initial setup)

**Objective:** Create the test file skeleton with proper imports, mock setup, and describe blocks.

**Implementation Steps:**

1. Create new file `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts`
2. Add standard Vitest imports:
   ```typescript
   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
   ```
3. Import test helpers:
   ```typescript
   import {
     createMockTranslationJob,
     createMockJobBatch,
   } from './helpers/mockFactories';
   import {
     resetMockDatabase,
     seedMockDatabase,
     getTableRecords,
   } from './helpers/mockSupabase';
   import { TEST_DEFAULTS, TABLE_NAMES } from './helpers/constants';
   import type { TranslationJob } from '../translation-jobs.types';
   ```
4. Set up mock for supabase module:
   ```typescript
   const mockSupabaseAdmin = {
     from: vi.fn(),
     rpc: vi.fn(),
   };

   vi.mock('@/lib/supabase', () => ({
     supabaseAdmin: mockSupabaseAdmin,
   }));
   ```
5. Add main describe block with beforeEach/afterEach hooks
6. Verify file compiles without errors: `npx vitest run job-pickup.unit.test.ts --passWithNoTests`

**Acceptance Criteria:**
- [ ] File exists with correct path
- [ ] All imports resolve without TypeScript errors
- [ ] Mock setup is in place
- [ ] Empty test suite runs successfully

**Estimated Effort:** 15-20 minutes

---

### Task 2: Write Job Pickup Selection Tests

**File:** `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts`

**Objective:** Test that `pickNextJob` correctly selects the highest priority queued job.

**Implementation Steps:**

1. Add describe block `'pickNextJob'`
2. Implement test `'should select the highest priority queued job'`:
   - Seed database with 3 jobs: priority 100, 50, 25
   - Configure mock RPC to return highest priority job
   - Call `fetchAndLockNextJob` from `translation-jobs.ts`
   - Assert returned job has priority 100
3. Implement test `'should return null when no queued jobs exist'`:
   - Seed database with only `processing` and `completed` jobs
   - Configure mock RPC to return empty array
   - Assert result.data is null
4. Implement test `'should skip jobs already in processing state'`:
   - Seed database with mix of queued and processing jobs
   - Assert RPC was called with correct query parameters
5. Implement test `'should respect priority ordering (DESC) then created_at (ASC)'`:
   - Seed database with multiple jobs of same priority, different timestamps
   - Assert oldest job with highest priority is selected

**Code Pattern:**
```typescript
describe('pickNextJob', () => {
  it('should select the highest priority queued job', async () => {
    // Arrange
    const lowPriorityJob = createMockTranslationJob({
      id: 'job-low',
      status: 'queued',
      priority: 25
    });
    const highPriorityJob = createMockTranslationJob({
      id: 'job-high',
      status: 'queued',
      priority: 100
    });
    seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [lowPriorityJob, highPriorityJob]);

    // Configure RPC to return high priority job
    mockSupabaseAdmin.rpc.mockResolvedValueOnce({
      data: [{ ...highPriorityJob, status: 'processing' }],
      error: null,
    });

    // Act
    const { fetchAndLockNextJob } = await import('../translation-jobs');
    const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

    // Assert
    expect(result.data?.id).toBe('job-high');
  });
});
```

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify correct job selection logic
- [ ] Tests use proper mock setup/teardown

**Estimated Effort:** 30-40 minutes

---

### Task 3: Write Job Status Transition Tests

**File:** `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts`

**Objective:** Test that job status transitions correctly from queued to processing.

**Implementation Steps:**

1. Implement test `'should mark picked job as processing'`:
   - Seed a queued job
   - Call fetchAndLockNextJob
   - Assert returned job has status 'processing'
2. Implement test `'should set started_at timestamp when picking job'`:
   - Seed a queued job
   - Call fetchAndLockNextJob
   - Assert startedAt is defined and is a valid ISO timestamp
3. Implement test `'should assign worker_id to picked job'`:
   - Seed a queued job
   - Call fetchAndLockNextJob with specific workerId
   - Assert lockedBy matches workerId

**Acceptance Criteria:**
- [ ] 3 tests implemented and passing
- [ ] Tests verify status transition from 'queued' to 'processing'
- [ ] Tests verify timestamp management

**Estimated Effort:** 25-30 minutes

---

### Task 4: Write Job Locking Mechanism Tests

**File:** `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts`

**Objective:** Test that job locking prevents concurrent processing of the same job.

**Implementation Steps:**

1. Add describe block `'Job Locking'`
2. Implement test `'should acquire lock using FOR UPDATE SKIP LOCKED pattern'`:
   - Verify RPC is called with correct function name 'fetch_and_lock_translation_job'
   - Verify worker_id is passed correctly
3. Implement test `'should prevent concurrent pickup of same job'`:
   - Configure mock to simulate concurrent access scenario
   - First call returns job, second call returns null
   - Assert only one worker gets the job
4. Implement test `'should release lock when job processing completes'`:
   - Use markJobCompleted function
   - Assert locked_by and locked_at are cleared
5. Implement test `'should release lock when job processing fails'`:
   - Use markJobFailed function
   - Assert locked_by and locked_at are cleared

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify lock acquisition and release
- [ ] Tests verify concurrent access prevention

**Estimated Effort:** 35-45 minutes

---

### Task 5: Write Stale Lock Detection Tests

**File:** `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts`

**Objective:** Test stale lock detection and recovery logic.

**Implementation Steps:**

1. Add describe block `'Stale Lock Detection'`
2. Implement test `'should identify jobs stuck in processing over 5 minutes'`:
   - Create job with locked_at timestamp > 5 minutes ago
   - Call findStaleProcessingJobs from concurrency-control
   - Assert job is returned as stale
3. Implement test `'should reset stale jobs to queued status'`:
   - Seed stale processing job with attempts < 3
   - Call cleanupStaleProcessingJobs
   - Assert job status is reset to 'queued'
4. Implement test `'should increment retry count when recovering stale job'`:
   - Seed stale job with attempts = 1
   - Call cleanup
   - Assert attempts is now 2 after requeue
5. Implement test `'should mark job as failed if retry limit exceeded during recovery'`:
   - Seed stale job with attempts = 3 (at limit)
   - Call cleanupStaleProcessingJobs with maxStaleRetries = 3
   - Assert job status is 'failed'

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify stale detection threshold (5 minutes)
- [ ] Tests verify appropriate recovery action

**Estimated Effort:** 35-45 minutes

---

### Task 6: Create Entity Processors Test File

**File:** `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Objective:** Create test file skeleton for entity-specific processor tests.

**Implementation Steps:**

1. Create new file `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`
2. Add imports similar to Task 1
3. Add additional mock for translation service:
   ```typescript
   vi.mock('@/lib/translation-service', () => ({
     translateText: vi.fn().mockResolvedValue({
       translatedText: 'Translated content',
       provider: 'claude',
       tokensUsed: 100,
     }),
   }));
   ```
4. Add describe blocks for each processor:
   - `'processItemTranslation'`
   - `'processArticleTranslation'`
   - `'processLinkTranslation'`
   - `'processTagTranslation'`
   - `'Processor Routing'`
5. Add mock factories for entity content (may need to extend mockFactories.ts):
   - createMockLinkContent
   - createMockTagContent

**Acceptance Criteria:**
- [ ] File created with proper structure
- [ ] All describe blocks in place
- [ ] Translation service mock configured
- [ ] File compiles without errors

**Estimated Effort:** 20-25 minutes

---

### Task 7: Write Item Translation Processor Tests

**File:** `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Objective:** Test the item translation processor handles item content correctly.

**Implementation Steps:**

1. Implement test `'should fetch item by ID from database'`:
   - Configure mock to return item data
   - Assert supabase.from('items').select().eq('id', itemId) was called
2. Implement test `'should extract name and description fields for translation'`:
   - Create item with name and description
   - Verify translateText is called with both fields
3. Implement test `'should call translation service with correct payload'`:
   - Assert translateText receives:
     - text: item content
     - sourceLanguage: job.sourceLanguage
     - targetLanguage: job.targetLanguage
     - context with contentType
4. Implement test `'should store translated content in item_translations table'`:
   - Mock successful translation
   - Assert upsert to item_translations table with correct data
5. Implement test `'should mark job as completed on success'`:
   - Assert markJobCompleted is called or job status updated
6. Implement test `'should mark job as failed when item not found'`:
   - Configure mock to return null for item
   - Assert job is marked failed with appropriate error

**Acceptance Criteria:**
- [ ] 6 tests implemented and passing
- [ ] Tests verify complete item translation flow
- [ ] Tests verify error handling

**Estimated Effort:** 40-50 minutes

---

### Task 8: Write Article Translation Processor Tests

**File:** `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Objective:** Test the article translation processor handles article content correctly.

**Implementation Steps:**

1. Implement test `'should fetch article by ID from database'`:
   - Configure mock for item_articles table
   - Assert correct query is made
2. Implement test `'should extract title and description fields for translation'`:
   - Create article with title and description
   - Verify both fields are passed to translation service
3. Implement test `'should store translated content in article_translations table'`:
   - Mock successful translation
   - Assert upsert to article_translations table
4. Implement test `'should mark job as completed on success'`:
   - Full success flow verification
5. Implement test `'should mark job as failed when article not found'`:
   - Configure mock to return null
   - Assert appropriate error handling

**Acceptance Criteria:**
- [ ] 5 tests implemented and passing
- [ ] Tests mirror item processor pattern
- [ ] Tests verify article-specific field extraction

**Estimated Effort:** 30-40 minutes

---

### Task 9: Write Link Translation Processor Tests

**File:** `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Objective:** Test the link translation processor handles only title field.

**Implementation Steps:**

1. Implement test `'should fetch link by ID from database'`:
   - Configure mock for item_links table
2. Implement test `'should extract only title field for translation'`:
   - Create link with title and url
   - Assert only title is translated
3. Implement test `'should NOT include URL field in translation request'`:
   - Verify translateText is NOT called with URL
   - This is critical - URLs should not be translated
4. Implement test `'should store translated content in link_translations table'`:
   - Mock successful translation
   - Assert upsert to link_translations
5. Implement test `'should mark job as failed when link not found'`:
   - Error handling verification

**Acceptance Criteria:**
- [ ] 5 tests implemented and passing
- [ ] Tests explicitly verify URL is NOT translated
- [ ] Tests verify link-specific behavior

**Estimated Effort:** 30-40 minutes

---

### Task 10: Write Tag Translation Processor Tests

**File:** `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Objective:** Test the tag translation processor handles tag values correctly.

**Implementation Steps:**

1. Add mock factory for tags if not exists:
   ```typescript
   export function createMockTagContent(overrides?: Partial<{
     key: string;
     value: string;
     is_system_tag: boolean;
   }>) {
     return {
       key: `tag-${Date.now()}`,
       value: 'Test Tag',
       is_system_tag: false,
       ...overrides,
     };
   }
   ```
2. Implement test `'should fetch tag by key from database'`:
   - Tags use key not id
3. Implement test `'should extract tag value for translation'`:
   - Only the display value is translated
4. Implement test `'should store translated content in tag_translations table'`:
   - Verify correct table and fields
5. Implement test `'should set is_system_tag to false for user tags'`:
   - User-created tags are not system tags
6. Implement test `'should mark job as failed when tag not found'`:
   - Error handling for missing tags

**Acceptance Criteria:**
- [ ] 5 tests implemented and passing
- [ ] Tests verify tag-specific key-based lookup
- [ ] Tests verify is_system_tag handling

**Estimated Effort:** 30-40 minutes

---

### Task 11: Write Processor Routing Tests

**File:** `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Objective:** Test that jobs are routed to the correct processor based on entity type.

**Implementation Steps:**

1. Implement test `'should route item jobs to processItemTranslation'`:
   - Create job with entityType: 'item'
   - Verify item processor is called
2. Implement test `'should route article jobs to processArticleTranslation'`:
   - Create job with entityType: 'article'
3. Implement test `'should route link jobs to processLinkTranslation'`:
   - Create job with entityType: 'link'
4. Implement test `'should route tag jobs to processTagTranslation'`:
   - Create job with entityType: 'tag'
5. Implement test `'should log error for unknown entity types'`:
   - Create job with invalid entityType
   - Verify error is logged/thrown
   - Assert job is marked as failed

**Code Pattern:**
```typescript
describe('Processor Routing', () => {
  it('should route item jobs to processItemTranslation', async () => {
    const job = createMockTranslationJob({ entityType: 'item' });
    // ... mock setup

    const { processTranslationJob } = await import('../job-processor');
    await processTranslationJob(job);

    // Assert item table was queried, not article/link/tag
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('items');
  });
});
```

**Acceptance Criteria:**
- [ ] 5 tests implemented and passing
- [ ] Tests verify correct routing for all 4 entity types
- [ ] Tests verify error handling for unknown types

**Estimated Effort:** 25-35 minutes

---

### Task 12: Create Retry Logic Test File

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Objective:** Create test file for retry mechanism verification.

**Implementation Steps:**

1. Create new file with standard imports
2. Add describe blocks:
   - `'Retry Count Management'`
   - `'Maximum Retry Limits'`
   - `'Error Message Preservation'`
   - `'Transient vs Permanent Errors'`
   - `'Job Requeue on Retry'`
   - `'Exponential Backoff'`
3. Configure mocks for retry testing scenarios

**Acceptance Criteria:**
- [ ] File created with proper structure
- [ ] All describe blocks in place
- [ ] File compiles without errors

**Estimated Effort:** 15-20 minutes

---

### Task 13: Write Retry Count Management Tests

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Objective:** Test retry counter incrementation.

**Implementation Steps:**

1. Implement test `'should increment attempts count on failure'`:
   - Create job with attempts = 1
   - Call markJobFailed
   - Assert attempts is now 2
2. Implement test `'should preserve previous attempt count when incrementing'`:
   - Create job with attempts = 2
   - Fail job
   - Assert attempts = 3 (not reset to 1)
3. Implement test `'should start with attempts = 0 for new jobs'`:
   - Create new job
   - Assert attempts = 0

**Acceptance Criteria:**
- [ ] 3 tests implemented and passing
- [ ] Tests verify counter logic

**Estimated Effort:** 20-25 minutes

---

### Task 14: Write Maximum Retry Limit Tests

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Objective:** Test that retry limits are enforced.

**Implementation Steps:**

1. Implement test `'should allow retry when attempts < max_retries (default 3)'`:
   - Job with attempts = 2
   - Should requeue not fail permanently
2. Implement test `'should mark job as permanently failed when attempts >= max_retries'`:
   - Job with attempts = 3
   - Should mark as 'failed', not requeue
3. Implement test `'should respect configurable max retry limit'`:
   - Configure TEST_DEFAULTS.MAX_RETRIES = 5
   - Job with attempts = 4 should still retry
4. Implement test `'should record exceeded_max_retries as failure reason'`:
   - When max retries exceeded
   - Assert error_message contains appropriate text

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify retry limit enforcement
- [ ] Tests verify configurable limits

**Estimated Effort:** 30-35 minutes

---

### Task 15: Write Error Message Preservation Tests

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Objective:** Test error message handling on job failures.

**Implementation Steps:**

1. Implement test `'should store error message when job fails'`:
   - Call markJobFailed with error message
   - Assert errorMessage is stored
2. Implement test `'should update error message on subsequent failures'`:
   - Fail job twice with different errors
   - Assert latest error message is stored
3. Implement test `'should clear error message when job succeeds'`:
   - Job with error_message from previous failure
   - Complete successfully
   - Assert errorMessage is null

**Acceptance Criteria:**
- [ ] 3 tests implemented and passing
- [ ] Tests verify error message lifecycle

**Estimated Effort:** 20-25 minutes

---

### Task 16: Write Transient vs Permanent Error Tests

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Objective:** Test error classification for retry decisions.

**Implementation Steps:**

1. Implement test `'should retry on network timeout errors'`:
   - Simulate ECONNRESET or timeout error
   - Assert job is requeued
2. Implement test `'should retry on rate limit (429) errors'`:
   - Simulate 429 response
   - Assert job is requeued
3. Implement test `'should NOT retry on invalid entity ID errors'`:
   - Entity not found error
   - Assert job is marked failed immediately
4. Implement test `'should NOT retry on unsupported language errors'`:
   - Invalid language code
   - Assert permanent failure
5. Implement test `'should classify translation API 5xx errors as transient'`:
   - 500, 502, 503 errors should retry
6. Implement test `'should classify translation API 4xx errors as permanent'`:
   - 400, 401, 403 errors should not retry (except 429)

**Acceptance Criteria:**
- [ ] 6 tests implemented and passing
- [ ] Tests verify error classification logic
- [ ] Tests distinguish transient from permanent errors

**Estimated Effort:** 40-50 minutes

---

### Task 17: Write Job Requeue Tests

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Objective:** Test job requeue mechanics on retryable failures.

**Implementation Steps:**

1. Implement test `'should reset status to queued for retryable failures'`:
   - Processing job fails with transient error
   - Assert status becomes 'queued'
2. Implement test `'should update status_updated_at when requeuing'`:
   - Assert timestamp is updated
3. Implement test `'should maintain original priority when requeuing'`:
   - Job with priority 100 fails
   - After requeue, priority should still be 100
4. Implement test `'should clear worker_id when requeuing'`:
   - Assert locked_by is null after requeue

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify requeue state transitions

**Estimated Effort:** 25-30 minutes

---

### Task 18: Write Exponential Backoff Tests

**File:** `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Objective:** Test exponential backoff calculation (if implemented).

**Implementation Steps:**

1. Implement test `'should calculate backoff delay based on attempt count'`:
   - Attempt 1: base delay
   - Attempt 2: base * 2
   - Attempt 3: base * 4
2. Implement test `'should increase delay exponentially with each retry'`:
   - Assert delay doubles each attempt
3. Implement test `'should cap maximum backoff delay'`:
   - Even at high attempts, delay should not exceed max
   - Default max typically 60 seconds
4. Implement test `'should apply jitter to prevent thundering herd'`:
   - Calculate multiple backoffs
   - Assert values have some variance

**Note:** If exponential backoff is not yet implemented in the codebase, these tests should be marked as `.todo()` or skipped with a note.

**Acceptance Criteria:**
- [ ] 4 tests implemented (or marked as todo if feature not implemented)
- [ ] Tests verify backoff calculation formula
- [ ] Tests verify jitter application

**Estimated Effort:** 30-35 minutes

---

### Task 19: Create Concurrency Control Test File

**File:** `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Objective:** Create test file for concurrency control verification.

**Implementation Steps:**

1. Create new file with standard imports
2. Import concurrency-control functions:
   ```typescript
   import {
     cleanupStaleProcessingJobs,
     refreshJobLock,
     createLockHeartbeat,
     checkForDuplicateJob,
     createJobIfNotExists,
     getLockStatistics,
     ConcurrencyControlManager,
   } from '../concurrency-control';
   ```
3. Add describe blocks:
   - `'Slot Management'`
   - `'Acquire Method'`
   - `'Release Method'`
   - `'Integration with Processors'`
   - `'Rate Limit Handling'`
   - `'Metrics Exposure'`
   - `'Configuration'`

**Acceptance Criteria:**
- [ ] File created with proper structure
- [ ] All imports resolve correctly
- [ ] Describe blocks in place

**Estimated Effort:** 15-20 minutes

---

### Task 20: Write Lock Heartbeat Tests

**File:** `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Objective:** Test lock heartbeat functionality.

**Implementation Steps:**

1. Implement test `'should refresh lock timestamp for active job'`:
   - Call refreshJobLock
   - Assert locked_at is updated
2. Implement test `'should fail heartbeat if job not owned by worker'`:
   - Job locked by different worker
   - Assert heartbeat fails
3. Implement test `'should fail heartbeat if job not in processing state'`:
   - Job in queued or completed state
   - Assert heartbeat fails
4. Implement test `'createLockHeartbeat should return cleanup function'`:
   - Create heartbeat
   - Assert returns function
   - Call cleanup function
   - Assert interval is cleared

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify heartbeat refresh logic
- [ ] Tests verify heartbeat failure conditions

**Estimated Effort:** 30-35 minutes

---

### Task 21: Write Duplicate Prevention Tests

**File:** `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Objective:** Test duplicate job prevention.

**Implementation Steps:**

1. Implement test `'should detect existing job for same entity/language'`:
   - Seed existing job
   - Call checkForDuplicateJob
   - Assert isDuplicate = true
2. Implement test `'should return existing job ID when duplicate found'`:
   - Assert existingJobId is populated
3. Implement test `'should return false when no duplicate exists'`:
   - Empty database
   - Assert isDuplicate = false
4. Implement test `'createJobIfNotExists should return null for duplicates'`:
   - Simulate unique constraint violation
   - Assert null is returned, not error

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify duplicate detection
- [ ] Tests verify idempotent creation

**Estimated Effort:** 25-30 minutes

---

### Task 22: Write Lock Statistics Tests

**File:** `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Objective:** Test lock statistics monitoring.

**Implementation Steps:**

1. Implement test `'should expose current active lock count'`:
   - Seed 3 processing jobs with locks
   - Assert activeLocksCount = 3
2. Implement test `'should expose stale lock count'`:
   - Seed 2 jobs with old locked_at timestamps
   - Assert staleLocksCount = 2
3. Implement test `'should expose locks grouped by worker'`:
   - Seed jobs locked by different workers
   - Assert locksByWorker has correct counts
4. Implement test `'should calculate average lock duration'`:
   - Seed jobs with known lock timestamps
   - Assert avgLockDurationMs is approximately correct

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify statistics accuracy

**Estimated Effort:** 30-35 minutes

---

### Task 23: Write ConcurrencyControlManager Tests

**File:** `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Objective:** Test the ConcurrencyControlManager class.

**Implementation Steps:**

1. Implement test `'should initialize with default config'`:
   - Create manager without config
   - Assert default values are applied
2. Implement test `'should start and stop cleanup interval'`:
   - Call start()
   - Assert isRunning() = true
   - Call stop()
   - Assert isRunning() = false
3. Implement test `'should update config dynamically'`:
   - Call updateConfig with new values
   - Assert getConfig() reflects changes
4. Implement test `'should run cleanup on demand'`:
   - Call runCleanup()
   - Assert cleanup was performed

**Acceptance Criteria:**
- [ ] 4 tests implemented and passing
- [ ] Tests verify manager lifecycle
- [ ] Tests verify configuration management

**Estimated Effort:** 30-35 minutes

---

### Task 24: Update Mock Helpers (If Needed)

**File:** `/src/lib/job-queue/__tests__/helpers/mockFactories.ts`

**Objective:** Add any missing mock factory functions discovered during test implementation.

**Implementation Steps:**

1. Review all tests for missing factories
2. Add `createMockLinkContent` if not exists:
   ```typescript
   export function createMockLinkContent(
     overrides?: Partial<{
       id: string;
       title: string;
       url: string;
       source_language: string;
       item_id: string;
     }>
   ) {
     return {
       id: `link-${Date.now()}`,
       title: 'Test Link Title',
       url: 'https://example.com/video',
       source_language: 'en',
       item_id: `item-${Date.now()}`,
       ...overrides,
     };
   }
   ```
3. Add `createMockTagContent`:
   ```typescript
   export function createMockTagContent(
     overrides?: Partial<{
       key: string;
       value: string;
       is_system_tag: boolean;
     }>
   ) {
     return {
       key: `tag-${Date.now()}`,
       value: 'Test Tag',
       is_system_tag: false,
       ...overrides,
     };
   }
   ```
4. Update `/src/lib/job-queue/__tests__/helpers/index.ts` to export new factories

**Acceptance Criteria:**
- [ ] All required mock factories exist
- [ ] All factories are exported from index.ts
- [ ] All tests can import required factories

**Estimated Effort:** 15-20 minutes

---

### Task 25: Run Full Test Suite and Generate Coverage Report

**File:** N/A (execution task)

**Objective:** Verify all tests pass and coverage meets thresholds.

**Implementation Steps:**

1. Run all new unit tests:
   ```bash
   npm run test -- job-pickup.unit.test.ts entity-processors.unit.test.ts retry-logic.unit.test.ts concurrency-control.unit.test.ts
   ```
2. Fix any failing tests
3. Run with coverage:
   ```bash
   npm run test:coverage -- --reporter=text
   ```
4. Verify coverage targets:
   - Line Coverage > 80%
   - Branch Coverage > 75%
   - Function Coverage > 90%
5. If coverage is below thresholds, identify gaps and add additional tests
6. Run tests multiple times to ensure no flakiness

**Acceptance Criteria:**
- [ ] All tests pass consistently (3+ runs)
- [ ] Coverage > 80% for job processing modules
- [ ] No flaky tests identified

**Estimated Effort:** 30-45 minutes (including fixes)

---

## Summary Table

| Task | File | Description | Est. Time |
|------|------|-------------|-----------|
| 1 | job-pickup.unit.test.ts | Setup test file structure | 15-20 min |
| 2 | job-pickup.unit.test.ts | Job pickup selection tests | 30-40 min |
| 3 | job-pickup.unit.test.ts | Job status transition tests | 25-30 min |
| 4 | job-pickup.unit.test.ts | Job locking mechanism tests | 35-45 min |
| 5 | job-pickup.unit.test.ts | Stale lock detection tests | 35-45 min |
| 6 | entity-processors.unit.test.ts | Setup processor test file | 20-25 min |
| 7 | entity-processors.unit.test.ts | Item processor tests | 40-50 min |
| 8 | entity-processors.unit.test.ts | Article processor tests | 30-40 min |
| 9 | entity-processors.unit.test.ts | Link processor tests | 30-40 min |
| 10 | entity-processors.unit.test.ts | Tag processor tests | 30-40 min |
| 11 | entity-processors.unit.test.ts | Processor routing tests | 25-35 min |
| 12 | retry-logic.unit.test.ts | Setup retry test file | 15-20 min |
| 13 | retry-logic.unit.test.ts | Retry count management tests | 20-25 min |
| 14 | retry-logic.unit.test.ts | Maximum retry limit tests | 30-35 min |
| 15 | retry-logic.unit.test.ts | Error message preservation tests | 20-25 min |
| 16 | retry-logic.unit.test.ts | Transient vs permanent error tests | 40-50 min |
| 17 | retry-logic.unit.test.ts | Job requeue tests | 25-30 min |
| 18 | retry-logic.unit.test.ts | Exponential backoff tests | 30-35 min |
| 19 | concurrency-control.unit.test.ts | Setup concurrency test file | 15-20 min |
| 20 | concurrency-control.unit.test.ts | Lock heartbeat tests | 30-35 min |
| 21 | concurrency-control.unit.test.ts | Duplicate prevention tests | 25-30 min |
| 22 | concurrency-control.unit.test.ts | Lock statistics tests | 30-35 min |
| 23 | concurrency-control.unit.test.ts | ConcurrencyControlManager tests | 30-35 min |
| 24 | helpers/mockFactories.ts | Update mock helpers | 15-20 min |
| 25 | N/A | Run suite and verify coverage | 30-45 min |

**Total Estimated Time:** ~11-14 hours

---

## Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/__tests__/job-pickup.unit.test.ts` | Unit tests for job pickup and locking |
| `/src/lib/job-queue/__tests__/entity-processors.unit.test.ts` | Unit tests for entity-specific processors |
| `/src/lib/job-queue/__tests__/retry-logic.unit.test.ts` | Unit tests for retry mechanisms |
| `/src/lib/job-queue/__tests__/concurrency-control.unit.test.ts` | Unit tests for concurrency control |

---

## Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Add createMockLinkContent, createMockTagContent |
| `/src/lib/job-queue/__tests__/helpers/index.ts` | Export new mock factories |

---

## Verification Commands

```bash
# Run individual test files
npx vitest run src/lib/job-queue/__tests__/job-pickup.unit.test.ts
npx vitest run src/lib/job-queue/__tests__/entity-processors.unit.test.ts
npx vitest run src/lib/job-queue/__tests__/retry-logic.unit.test.ts
npx vitest run src/lib/job-queue/__tests__/concurrency-control.unit.test.ts

# Run all job-queue tests
npx vitest run src/lib/job-queue/__tests__/

# Run with coverage
npx vitest run --coverage src/lib/job-queue/__tests__/

# Watch mode for development
npx vitest watch src/lib/job-queue/__tests__/
```

---

## Acceptance Criteria Mapping

| Requirement | Tasks |
|-------------|-------|
| Unit tests verify job pickup selects pending jobs and marks as processing | Tasks 2, 3 |
| Unit tests confirm locking prevents concurrent processing | Tasks 4, 5 |
| Unit tests validate each entity-specific processor | Tasks 7, 8, 9, 10, 11 |
| Unit tests check retry logic and maximum retry limits | Tasks 13, 14, 15, 16, 17, 18 |
| Unit tests verify concurrency control limits simultaneous executions | Tasks 20, 21, 22, 23 |
| All tests pass consistently without flakiness | Task 25 |
| Test coverage exceeds 80% | Task 25 |

---

## References

- Overview Document: `/docs/REQ-E03-031-write-unit-tests-for-job-processing-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` (REQ-E03-031)
- Existing Integration Tests: `/src/lib/job-queue/__tests__/job-processing.integration.test.ts`
- Mock Helpers: `/src/lib/job-queue/__tests__/helpers/`
- Vitest Documentation: https://vitest.dev/

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 7: Testing & Validation - Task 7.2*
