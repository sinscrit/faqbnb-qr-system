# REQ-363: Write Unit Tests for Job Processing - Implementation Overview

**Generated:** 2026-01-19 UTC
**Last Modified:** 2026-01-19 UTC
**Request Reference:** docs/gen_requests_epic3.md - Request #363
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 7, Task 7.2)
**Status:** Overview Document

---

## Executive Summary

This document provides the implementation breakdown for Task 7.2 (Write unit tests for job processing) from the Localization Epic 3 - Dynamic Content Translation implementation plan. The task establishes comprehensive unit test coverage for the job queue processing system, including:

- Job pickup and locking mechanisms
- Entity-specific processors (article, item, link, tag)
- Retry logic with exponential backoff
- Concurrency control and race condition prevention

**Note:** The existing codebase already contains substantial integration test coverage in `src/lib/job-queue/__tests__/`. This overview documents extending coverage with focused unit tests for individual components, following established patterns.

---

## Technical Context

### Current Test Infrastructure

| Technology | Details |
|------------|---------|
| **Test Framework** | Vitest (primary), Jest API compatibility |
| **DOM Environment** | jsdom (`@vitest-environment jsdom`) |
| **Mocking** | vi.mock(), vi.fn(), vi.mocked() |
| **Test Helpers** | Custom mockFactories, testUtils, mockSupabase |

### Existing Test Files

| Test Area | Test File Location | Status |
|-----------|-------------------|--------|
| Job Processing Integration | `src/lib/job-queue/__tests__/job-processing.integration.test.ts` | ✅ Complete |
| Concurrent Processing | `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` | ✅ Complete |
| Mock Factories | `src/lib/job-queue/__tests__/helpers/mockFactories.ts` | ✅ Complete |
| Test Utilities | `src/lib/job-queue/__tests__/helpers/testUtils.ts` | ✅ Complete |
| Mock Supabase | `src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | ✅ Complete |
| Constants | `src/lib/job-queue/__tests__/helpers/constants.ts` | ✅ Complete |

### Source Files Under Test

| Source File | Module | Primary Functions |
|-------------|--------|-------------------|
| `translation-jobs.ts` | job-queue | createTranslationJob, fetchAndLockNextJob, markJobCompleted, markJobFailed |
| `job-processor.ts` | job-queue | TranslationJobProcessor, fetchEntityContent, saveTranslation, processJob |
| `concurrency-control.ts` | job-queue | cleanupStaleProcessingJobs, refreshJobLock, checkForDuplicateJob, ConcurrencyControlManager |

### Test Patterns Established

1. **Mock Chain Helper** - `createChainMock()` for Supabase query builder patterns
2. **Snake/Camel Case Conversion** - `jobToSnakeCase()` for DB row format matching
3. **Mock Database** - In-memory record store with `seedMockDatabase()`, `getTableRecords()`
4. **Concurrent Testing** - `runConcurrently()` helper for parallel operation testing
5. **Worker ID Generation** - `generateWorkerId()` for isolation testing

---

## Authorized Files and Functions for Modification

### Test Files (CREATE/WRITE)

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts` | **NEW** Unit tests for job pickup and locking |
| `src/lib/job-queue/__tests__/entity-processors.unit.test.ts` | **NEW** Unit tests for entity-specific processors |
| `src/lib/job-queue/__tests__/retry-logic.unit.test.ts` | **NEW** Unit tests for retry logic |
| `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts` | **NEW** Unit tests for concurrency control |

### Existing Test Files (READ/WRITE - extend if needed)

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Add new mock factories if needed |
| `src/lib/job-queue/__tests__/helpers/testUtils.ts` | Add new test utilities if needed |
| `src/lib/job-queue/__tests__/helpers/constants.ts` | Add new constants if needed |

### Source Files (READ ONLY - for reference)

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/translation-jobs.ts` | Job queue functions |
| `src/lib/job-queue/job-processor.ts` | Job processor implementation |
| `src/lib/job-queue/concurrency-control.ts` | Concurrency control utilities |
| `src/lib/job-queue/translation-jobs.types.ts` | Type definitions |
| `src/lib/job-queue/index.ts` | Module exports |

---

## Implementation Tasks

### Task 1: Job Pickup and Locking Unit Tests

**File:** `src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts`

**Test Coverage Required:**

1. **fetchAndLockNextJob Function**
   - Returns oldest queued job when multiple available
   - Updates job status to 'processing' atomically
   - Sets lockedBy to worker ID
   - Sets lockedAt timestamp
   - Increments attempts counter
   - Returns null when no jobs available
   - Falls back to optimistic locking when RPC fails
   - Handles database errors gracefully

2. **Lock Acquisition Atomicity**
   - Only one worker can lock a job at a time
   - RPC function `fetch_and_lock_translation_job` called correctly
   - Parameters passed correctly (p_worker_id)
   - Response mapped from snake_case to camelCase

3. **releaseJobLock Function**
   - Only owner can release lock
   - Clears locked_by and locked_at fields
   - Returns error if not lock owner
   - Returns error if job not found

**Test Categories:**
```typescript
describe('Job Pickup and Locking Unit Tests', () => {
  describe('fetchAndLockNextJob', () => {
    describe('successful fetch', () => {
      it('returns oldest queued job');
      it('updates job to processing status');
      it('sets lock fields correctly');
      it('increments attempts counter');
      it('maps response to camelCase');
    });
    describe('no jobs available', () => {
      it('returns null when queue empty');
      it('returns null when all jobs locked');
    });
    describe('error handling', () => {
      it('falls back to optimistic locking on RPC failure');
      it('returns error result on database failure');
    });
  });
  describe('releaseJobLock', () => {
    it('releases lock for correct owner');
    it('fails for non-owner');
    it('handles missing job');
  });
});
```

**Key Test Pattern:**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAndLockNextJob, releaseJobLock } from '../translation-jobs';
import { createMockTranslationJob } from './helpers/mockFactories';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('fetchAndLockNextJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns locked job with correct fields', async () => {
    const mockJob = createMockTranslationJob({ status: 'queued' });
    const mockRpcResponse = {
      data: [{
        id: mockJob.id,
        entity_type: mockJob.entityType,
        entity_id: mockJob.entityId,
        // ... snake_case fields
        status: 'processing',
        locked_by: 'test-worker',
        locked_at: new Date().toISOString(),
      }],
      error: null,
    };

    const { supabaseAdmin } = await import('@/lib/supabase');
    vi.mocked(supabaseAdmin.rpc).mockResolvedValueOnce(mockRpcResponse);

    const result = await fetchAndLockNextJob({
      workerId: 'test-worker',
      lockTimeoutMinutes: 5,
    });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('processing');
    expect(result.data?.lockedBy).toBe('test-worker');
  });
});
```

---

### Task 2: Entity-Specific Processors Unit Tests

**File:** `src/lib/job-queue/__tests__/entity-processors.unit.test.ts`

**Test Coverage Required:**

1. **fetchEntityContent Function**
   - Fetches article content correctly (title, description)
   - Fetches item content correctly (name, description)
   - Fetches link content correctly (title)
   - Fetches tag content correctly (tag_key, translated_value)
   - Returns null for missing entity
   - Returns null for unknown entity type
   - Handles database errors gracefully

2. **saveTranslation Function**
   - Saves article translations to article_translations table
   - Saves item translations to item_translations table
   - Saves link translations to link_translations table
   - Saves tag translations to tag_translations table
   - Uses correct UPSERT constraints
   - Sets translation_status to 'completed'
   - Sets translated_at timestamp
   - Handles save errors gracefully

3. **getTranslationContext Function**
   - Returns correct context for article entity
   - Returns correct context for item entity
   - Returns correct context for link entity
   - Returns correct context for tag entity

4. **getContentType Function**
   - Maps article.title to 'article_title'
   - Maps article.description to 'article_description'
   - Maps item.name to 'item_name'
   - Maps item.description to 'item_description'
   - Maps link.title to 'link_title'
   - Maps tag.translated_value to 'tag'

**Test Categories:**
```typescript
describe('Entity-Specific Processors Unit Tests', () => {
  describe('fetchEntityContent', () => {
    describe('article content', () => {
      it('fetches article with title and description');
      it('extracts source_language from article');
      it('returns null for missing article');
    });
    describe('item content', () => {
      it('fetches item with name and description');
      it('extracts source_language from item');
      it('returns null for missing item');
    });
    describe('link content', () => {
      it('fetches link with title');
      it('extracts source_language from link');
      it('returns null for missing link');
    });
    describe('tag content', () => {
      it('fetches English tag translation as source');
      it('defaults source_language to en');
      it('returns null for missing tag');
    });
    describe('error handling', () => {
      it('returns null on database error');
      it('returns null for unknown entity type');
    });
  });
  describe('saveTranslation', () => {
    describe('article translations', () => {
      it('upserts to article_translations');
      it('uses article_id,language constraint');
    });
    // Similar for item, link, tag...
  });
  describe('getTranslationContext', () => {
    it('returns vacation rental context for articles');
    it('returns household item context for items');
    // ...
  });
  describe('getContentType', () => {
    it('maps entity.field to correct content type');
  });
});
```

**Key Test Pattern:**
```typescript
describe('fetchEntityContent', () => {
  it('fetches article content correctly', async () => {
    const mockArticle = createMockArticleContent({
      id: 'test-article',
      title: 'Test Title',
      description: 'Test Description',
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockArticle,
              error: null,
            }),
          }),
        }),
      }),
    };

    vi.mocked(supabaseAdmin).from = mockSupabase.from;

    const result = await fetchEntityContent('article', 'test-article');

    expect(result).not.toBeNull();
    expect(result?.entityType).toBe('article');
    expect(result?.fields.title).toBe('Test Title');
    expect(result?.fields.description).toBe('Test Description');
  });
});
```

---

### Task 3: Retry Logic Unit Tests

**File:** `src/lib/job-queue/__tests__/retry-logic.unit.test.ts`

**Test Coverage Required:**

1. **markJobFailed Function**
   - Increments attempts counter correctly
   - Stores error message
   - Clears lock fields
   - Fetches current attempts before incrementing
   - Sets status to 'failed' after max retries

2. **Retry Behavior in Processor**
   - Continues processing after recoverable error
   - Stops after MAX_RETRIES exceeded
   - Tracks consecutive errors correctly
   - Pauses after maxConsecutiveErrors
   - Resumes after error pause duration

3. **Error Classification**
   - Distinguishes retryable vs non-retryable errors
   - Translation service errors are retryable
   - Entity not found is non-retryable
   - Database connection errors are retryable

4. **Backoff Behavior**
   - Error pause duration respected
   - Consecutive error counter resets on success

**Test Categories:**
```typescript
describe('Retry Logic Unit Tests', () => {
  describe('markJobFailed', () => {
    it('increments attempts from current value');
    it('stores error message');
    it('clears lock fields');
    it('preserves job history');
  });
  describe('processor retry behavior', () => {
    it('re-queues failed job under max retries');
    it('marks job failed at max retries');
    it('tracks consecutive errors');
    it('pauses on max consecutive errors');
    it('resets errors on successful job');
  });
  describe('error classification', () => {
    it('retries on translation service error');
    it('fails immediately on entity not found');
    it('retries on database timeout');
  });
  describe('pause and resume', () => {
    it('pauses for configured duration');
    it('resumes after pause');
    it('clears interval during pause');
  });
});
```

**Key Test Pattern:**
```typescript
describe('markJobFailed', () => {
  it('increments attempts counter correctly', async () => {
    // Setup mock to return current attempts = 1
    const fetchMock = createChainMock();
    fetchMock.select = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { attempts: 1 },
          error: null,
        }),
      }),
    });

    // Setup mock for update
    const updateMock = createChainMock();
    updateMock.update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-job',
              status: 'failed',
              attempts: 2, // Incremented
              error_message: 'Test error',
              locked_by: null,
              locked_at: null,
            },
            error: null,
          }),
        }),
      }),
    });

    mockSupabaseAdmin.from.mockReturnValueOnce(fetchMock)
                          .mockReturnValueOnce(updateMock);

    const { markJobFailed } = await import('../translation-jobs');
    const result = await markJobFailed('test-job', 'Test error');

    expect(result.data?.attempts).toBe(2);
    expect(result.data?.errorMessage).toBe('Test error');
    expect(result.data?.lockedBy).toBeNull();
  });
});
```

---

### Task 4: Concurrency Control Unit Tests

**File:** `src/lib/job-queue/__tests__/concurrency-control.unit.test.ts`

**Test Coverage Required:**

1. **Stale Lock Cleanup**
   - cleanupStaleProcessingJobs finds jobs with old locks
   - Jobs under max retries reset to 'queued'
   - Jobs at max retries marked 'failed'
   - Returns correct counts in CleanupResult
   - findStaleProcessingJobs returns correct jobs

2. **Lock Heartbeat**
   - refreshJobLock updates locked_at timestamp
   - Only updates if worker owns lock
   - Returns error if lock lost
   - createLockHeartbeat runs at configured interval
   - Stop function clears interval

3. **Duplicate Prevention**
   - checkForDuplicateJob finds existing job
   - Returns existing job ID and status
   - Returns isDuplicate: false when no duplicate
   - createJobIfNotExists handles constraint violations

4. **Lock Statistics**
   - getLockStatistics counts active locks correctly
   - Identifies stale locks by age
   - Groups locks by worker
   - Calculates average lock duration
   - getStaleLocksCount returns correct count

5. **ConcurrencyControlManager**
   - start() begins automatic cleanup
   - stop() clears cleanup interval
   - runCleanup() triggers manual cleanup
   - updateConfig() updates runtime config
   - Restarts interval on cleanupIntervalMs change

**Test Categories:**
```typescript
describe('Concurrency Control Unit Tests', () => {
  describe('Stale Lock Cleanup', () => {
    describe('cleanupStaleProcessingJobs', () => {
      it('finds jobs with locks older than timeout');
      it('resets jobs under max retries to queued');
      it('marks jobs at max retries as failed');
      it('returns accurate cleanup counts');
      it('clears lock fields on reset');
    });
    describe('findStaleProcessingJobs', () => {
      it('returns only stale processing jobs');
      it('respects custom timeout');
    });
  });
  describe('Lock Heartbeat', () => {
    describe('refreshJobLock', () => {
      it('updates locked_at timestamp');
      it('only updates if worker owns lock');
      it('returns error if lock not owned');
    });
    describe('createLockHeartbeat', () => {
      it('calls refreshJobLock at interval');
      it('stop function clears interval');
      it('stops on lock refresh failure');
    });
  });
  describe('Duplicate Prevention', () => {
    describe('checkForDuplicateJob', () => {
      it('returns isDuplicate true with existing job');
      it('returns isDuplicate false when none');
      it('includes existing job status');
    });
    describe('createJobIfNotExists', () => {
      it('creates job when none exists');
      it('returns null on unique constraint violation');
    });
  });
  describe('Lock Statistics', () => {
    describe('getLockStatistics', () => {
      it('counts active locks');
      it('identifies stale locks');
      it('groups by worker ID');
      it('calculates average duration');
    });
    describe('getStaleLocksCount', () => {
      it('returns count of stale locks');
    });
  });
  describe('ConcurrencyControlManager', () => {
    it('start begins automatic cleanup');
    it('stop clears interval');
    it('runCleanup triggers immediate cleanup');
    it('updateConfig restarts interval if needed');
    it('getConfig returns current config');
  });
});
```

**Key Test Pattern:**
```typescript
describe('cleanupStaleProcessingJobs', () => {
  it('resets stale jobs under max retries to queued', async () => {
    // Job with 1 attempt and stale lock
    const staleJob = {
      id: 'stale-job-1',
      attempts: 1,
    };

    // Mock finding stale jobs
    mockSupabaseAdmin.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({
            data: [staleJob],
            error: null,
          }),
        }),
      }),
    });

    // Mock resetting job
    mockSupabaseAdmin.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const { cleanupStaleProcessingJobs } = await import('../concurrency-control');
    const result = await cleanupStaleProcessingJobs({
      lockTimeoutMinutes: 5,
      maxStaleRetries: 3,
    });

    expect(result.staleJobsFound).toBe(1);
    expect(result.jobsReset).toBe(1);
    expect(result.jobsMarkedFailed).toBe(0);
    expect(result.affectedJobIds).toContain('stale-job-1');
  });
});
```

---

## Acceptance Criteria Verification

| Criterion | Test File | Status |
|-----------|-----------|--------|
| Job pickup selects correct queued job | job-pickup-locking.unit.test.ts | 🔲 To Implement |
| Lock acquisition is atomic (one worker only) | job-pickup-locking.unit.test.ts | 🔲 To Implement |
| Job status transitions correctly | job-pickup-locking.unit.test.ts | 🔲 To Implement |
| Article processor fetches/saves correctly | entity-processors.unit.test.ts | 🔲 To Implement |
| Item processor fetches/saves correctly | entity-processors.unit.test.ts | 🔲 To Implement |
| Link processor fetches/saves correctly | entity-processors.unit.test.ts | 🔲 To Implement |
| Tag processor fetches/saves correctly | entity-processors.unit.test.ts | 🔲 To Implement |
| Retry increments attempts correctly | retry-logic.unit.test.ts | 🔲 To Implement |
| Max retries leads to failure status | retry-logic.unit.test.ts | 🔲 To Implement |
| Consecutive errors trigger pause | retry-logic.unit.test.ts | 🔲 To Implement |
| Stale locks detected and cleaned | concurrency-control.unit.test.ts | 🔲 To Implement |
| Lock heartbeat refreshes timestamp | concurrency-control.unit.test.ts | 🔲 To Implement |
| Duplicate jobs prevented | concurrency-control.unit.test.ts | 🔲 To Implement |
| All tests run without manual intervention | All test files use Vitest | 🔲 To Verify |

---

## Test Execution

### Running Tests

```bash
# Run all job queue unit tests
npm test -- src/lib/job-queue/__tests__/*.unit.test.ts

# Run specific test files
npm test -- src/lib/job-queue/__tests__/job-pickup-locking.unit.test.ts
npm test -- src/lib/job-queue/__tests__/entity-processors.unit.test.ts
npm test -- src/lib/job-queue/__tests__/retry-logic.unit.test.ts
npm test -- src/lib/job-queue/__tests__/concurrency-control.unit.test.ts

# Run all job queue tests (including integration)
npm test -- src/lib/job-queue

# Run with coverage
npm test -- --coverage src/lib/job-queue
```

---

## Implementation Notes

### Distinction from Existing Integration Tests

The existing integration tests (`job-processing.integration.test.ts` and `concurrent-processing.integration.test.ts`) test complete workflows with multiple components working together. These new unit tests should:

1. **Isolate individual functions** - Each test should focus on a single function's behavior
2. **Mock all dependencies** - Supabase, translation service, other modules
3. **Test edge cases thoroughly** - Error conditions, boundary values, invalid inputs
4. **Be fast and deterministic** - No actual database calls, no timers (use fake timers)

### Mock Patterns to Follow

```typescript
// Standard mock setup
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn(),
}));

// Reset between tests
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Helper Functions to Add (if needed)

```typescript
// In helpers/mockFactories.ts - add if not present
export function createMockLinkContent(overrides?: Partial<...>) {...}
export function createMockTagContent(overrides?: Partial<...>) {...}
export function createMockHeartbeatResult(overrides?: Partial<...>) {...}
```

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| vitest | Test framework |
| vi.mock, vi.fn | Function mocking |
| vi.useFakeTimers | Timer control for heartbeat tests |
| Existing test helpers | mockFactories, testUtils, constants |

---

## Estimated Test Count

| Test File | Estimated Test Cases |
|-----------|---------------------|
| job-pickup-locking.unit.test.ts | ~15 tests |
| entity-processors.unit.test.ts | ~20 tests |
| retry-logic.unit.test.ts | ~15 tests |
| concurrency-control.unit.test.ts | ~25 tests |
| **Total** | **~75 unit tests** |

---

## References

- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md) - Phase 7, Task 7.2
- [Request #363](/docs/gen_requests_epic3.md) - Write Unit Tests for Job Processing
- [Existing Integration Tests](/src/lib/job-queue/__tests__/job-processing.integration.test.ts)
- [Job Processor Implementation](/src/lib/job-queue/job-processor.ts)
- [Concurrency Control Implementation](/src/lib/job-queue/concurrency-control.ts)

---

*Document generated on 2026-01-19 for REQ-363: Write Unit Tests for Job Processing*
