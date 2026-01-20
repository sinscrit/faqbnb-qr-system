# REQ-E03-020: Implement Stale Job Cleanup - Implementation Overview

**Generated:** 2026-01-20 22:45:00 UTC
**Last Modified:** 2026-01-20 22:45:00 UTC
**Request ID:** REQ-E03-020
**Epic:** 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.8
**Size:** M (Medium)
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## Summary

Implement an automatic stale job cleanup mechanism that runs before each job processing cycle, detecting translation jobs stuck in 'processing' state for more than 5 minutes and recovering them by resetting to 'queued' status with incremented retry counts, or marking as permanently failed if retry limits are exceeded.

---

## Current State Analysis

### Existing Stale Lock Infrastructure

The codebase already has partial stale job handling infrastructure:

1. **Stale Lock Cleanup** (`/src/lib/job-queue/translation-jobs.ts:707-757`)
   - `cleanupStaleLocks(timeoutMinutes: number)` function
   - Resets processing jobs with stale `locked_at` timestamps to 'queued'
   - Clears `locked_by` and `locked_at` fields
   - **Gap:** Does NOT increment `attempts` counter

2. **Stale Processing Job Cleanup** (`/src/lib/job-queue/concurrency-control.ts:153-248`)
   - `cleanupStaleProcessingJobs(options)` function
   - More comprehensive: splits jobs into reset vs. permanently fail
   - Checks `attempts` against `maxStaleRetries`
   - Marks jobs as 'failed' with error message when retry limit exceeded
   - **Gap:** Does NOT increment `attempts` on reset; clears `started_at`

3. **ConcurrencyControlManager** (`/src/lib/job-queue/concurrency-control.ts:567-683`)
   - Runs automatic cleanup on configurable interval (default: 5 minutes)
   - **Gap:** Runs on independent timer, NOT synchronized with job processing cycle

4. **Job Processor Cycle** (`/src/lib/job-queue/job-processor.ts:710-778`)
   - `runProcessingCycle()` method
   - **Gap:** Does NOT call stale cleanup before picking new jobs

### Gap Analysis

**What's Missing:**

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| Cleanup runs before each job pick | Runs on independent 5-minute timer | Not synchronized with processing cycle |
| Increment `attempts` on reset | Does not increment | Stale jobs can loop indefinitely |
| Update `status_updated_at` on reset | Field doesn't exist in schema | Need to use `started_at` or `locked_at` as proxy |
| Clear `processing_worker_id` | Uses `locked_by` field | Already handled |
| Configurable stale threshold | Hardcoded 5 minutes | Already configurable via options |
| Configurable max retries | Default 3 | Already configurable via options |
| Log count of recovered jobs | Logs via console | Already exists |
| Log count of permanently failed | Logs via console | Already exists |

**Key Finding:** The core cleanup logic already exists in `cleanupStaleProcessingJobs()`. The main work is:
1. Modify to increment `attempts` when resetting jobs
2. Integrate cleanup call into `runProcessingCycle()` BEFORE job picking
3. Ensure proper error message format matches spec

---

## Technical Approach

### Architecture Integration

The solution modifies the existing job processing flow:

```
                    ┌─────────────────────────────────────────┐
                    │         TranslationJobProcessor         │
                    │                                         │
                    │   runProcessingCycle() {                │
                    │     ┌───────────────────────────────┐   │
                    │     │ 1. CLEANUP STALE JOBS (NEW)   │   │ ◄── REQ-E03-020
                    │     │    - Find processing > 5 min  │   │
                    │     │    - Reset or fail based on   │   │
                    │     │      retry count              │   │
                    │     │    - Increment attempts       │   │
                    │     │    - Log recovery stats       │   │
                    │     └───────────────────────────────┘   │
                    │                   │                     │
                    │                   ▼                     │
                    │     ┌───────────────────────────────┐   │
                    │     │ 2. PICK NEXT JOB              │   │
                    │     │    - fetchAndLockNextJob()    │   │
                    │     │    - (recovered jobs now      │   │
                    │     │      available in queue)      │   │
                    │     └───────────────────────────────┘   │
                    │                   │                     │
                    │                   ▼                     │
                    │     ┌───────────────────────────────┐   │
                    │     │ 3. PROCESS JOB                │   │
                    │     │    - processJob()             │   │
                    │     │    - translate content        │   │
                    │     │    - mark completed/failed    │   │
                    │     └───────────────────────────────┘   │
                    │                                         │
                    └─────────────────────────────────────────┘
```

### Stale Job State Machine

```
                         ┌─────────────────┐
                         │     QUEUED      │
                         └────────┬────────┘
                                  │ fetchAndLockNextJob()
                                  ▼
                         ┌─────────────────┐
                    ┌───►│   PROCESSING    │◄────────────────┐
                    │    └────────┬────────┘                 │
                    │             │                          │
                    │    ┌────────┴────────┐                 │
                    │    │                 │                 │
                    │  < 5 min          > 5 min              │
                    │    │                 │                 │
                    │    ▼                 ▼                 │
                    │  Normal          Stale Job             │
                    │  Processing      Detected              │
                    │    │                 │                 │
                    │    │        ┌────────┴────────┐        │
                    │    │        │                 │        │
                    │    │  attempts < 3      attempts >= 3  │
                    │    │        │                 │        │
                    │    │        ▼                 ▼        │
                    │    │   Reset to          Permanently   │
                    │    │   QUEUED            FAILED        │
                    │    │   attempts++                      │
                    │    │        │                          │
                    │    │        └──────────────────────────┘
                    │    │                                   │
                    │    ▼                                   │
            ┌───────┴────────┐    ┌────────────────────┐     │
            │   COMPLETED    │    │      FAILED        │─────┘
            └────────────────┘    └────────────────────┘
```

---

## Implementation Tasks

### Task 1: Enhance Stale Job Cleanup Function (Priority: High)

**File:** `/src/lib/job-queue/concurrency-control.ts`

**Function to Modify:** `cleanupStaleProcessingJobs()`

Modify the existing function to increment `attempts` when resetting stale jobs:

```typescript
// BEFORE (current implementation)
const { error: resetError } = await supabaseAdmin
  .from('translation_jobs')
  .update({
    status: 'queued',
    locked_by: null,
    locked_at: null,
    started_at: null,  // Clears started_at
  })
  .in('id', resetIds);

// AFTER (modified implementation)
for (const job of jobsToReset) {
  const { error: resetError } = await supabaseAdmin
    .from('translation_jobs')
    .update({
      status: 'queued',
      locked_by: null,
      locked_at: null,
      started_at: null,
      attempts: (job.attempts || 0) + 1,  // INCREMENT ATTEMPTS
    })
    .eq('id', job.id);
}
```

**Alternative (batch update with SQL):** Use raw SQL to increment in batch:
```sql
UPDATE translation_jobs
SET status = 'queued',
    locked_by = NULL,
    locked_at = NULL,
    started_at = NULL,
    attempts = attempts + 1
WHERE id IN (...)
AND status = 'processing'
AND locked_at < $staleThreshold
AND attempts < $maxRetries;
```

**Acceptance Criteria:**
- [ ] `attempts` field is incremented by 1 for each reset job
- [ ] Jobs with `attempts >= maxStaleRetries` are marked as failed, not reset
- [ ] Failed jobs include error message `exceeded_max_retries_after_stale`
- [ ] Function returns accurate counts in `CleanupResult`

### Task 2: Add Cleanup Configuration to Job Processor (Priority: High)

**File:** `/src/lib/job-queue/job-processor.ts`

**Interface to Modify:** `JobProcessorConfig`

Add stale job cleanup configuration:

```typescript
export interface JobProcessorConfig {
  // ... existing fields

  /** Enable stale job cleanup before each cycle (default: true) */
  enableStaleCleanup: boolean;
  /** Stale threshold in minutes (default: 5) */
  staleThresholdMinutes: number;
  /** Maximum stale recovery attempts (default: 3) */
  maxStaleRetries: number;
}
```

Update `DEFAULT_CONFIG`:
```typescript
const DEFAULT_CONFIG: JobProcessorConfig = {
  // ... existing defaults
  enableStaleCleanup: true,
  staleThresholdMinutes: parseInt(process.env.TRANSLATION_STALE_THRESHOLD_MINUTES || '5', 10),
  maxStaleRetries: parseInt(process.env.TRANSLATION_MAX_STALE_RETRIES || '3', 10),
};
```

### Task 3: Integrate Cleanup into Processing Cycle (Priority: High)

**File:** `/src/lib/job-queue/job-processor.ts`

**Method to Modify:** `runProcessingCycle()`

Add cleanup call at the beginning of each cycle:

```typescript
async runProcessingCycle(): Promise<ProcessingRunResult> {
  if (this.isProcessing) {
    // ... existing skip logic
  }

  this.isProcessing = true;
  const startedAt = new Date().toISOString();
  const results: JobProcessingResult[] = [];

  try {
    // === NEW: Run stale cleanup BEFORE picking jobs ===
    if (this.config.enableStaleCleanup) {
      const cleanupResult = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: this.config.staleThresholdMinutes,
        maxStaleRetries: this.config.maxStaleRetries,
      });

      if (cleanupResult.staleJobsFound > 0) {
        this.log('info', 'Stale job cleanup completed', {
          found: cleanupResult.staleJobsFound,
          reset: cleanupResult.jobsReset,
          failed: cleanupResult.jobsMarkedFailed,
        });
      }
    }
    // === END NEW ===

    // Process one job per cycle (existing logic)
    const result = await this.processNextJob();
    // ... rest of existing implementation
  }
}
```

**Acceptance Criteria:**
- [ ] Cleanup runs synchronously before `processNextJob()` call
- [ ] Cleanup only runs if `enableStaleCleanup` is true
- [ ] Uses configured `staleThresholdMinutes` and `maxStaleRetries`
- [ ] Logs cleanup results at 'info' level when jobs are found

### Task 4: Update CleanupResult for Accurate Tracking (Priority: Medium)

**File:** `/src/lib/job-queue/concurrency-control.ts`

**Interface to Modify:** `CleanupResult`

Ensure the interface captures all required metrics:

```typescript
export interface CleanupResult {
  /** Number of stale jobs found */
  staleJobsFound: number;
  /** Number of jobs reset to queued */
  jobsReset: number;
  /** Number of jobs marked as failed (exceeded retry limit) */
  jobsMarkedFailed: number;
  /** IDs of jobs reset to queued */
  resetJobIds: string[];
  /** IDs of jobs marked as failed */
  failedJobIds: string[];
  /** Cleanup timestamp */
  cleanedAt: string;
  /** Error if cleanup failed */
  error?: string;
}
```

### Task 5: Add Environment Variable Support (Priority: Medium)

**File:** Environment documentation / `.env.example`

Add new configuration options:

```bash
# Stale job cleanup configuration (REQ-E03-020)

# Enable automatic stale job cleanup before each processing cycle
TRANSLATION_STALE_CLEANUP_ENABLED=true

# Minutes after which a processing job is considered stale
TRANSLATION_STALE_THRESHOLD_MINUTES=5

# Maximum times a stale job can be reset before permanent failure
TRANSLATION_MAX_STALE_RETRIES=3
```

### Task 6: Update Error Message Format (Priority: Medium)

**File:** `/src/lib/job-queue/concurrency-control.ts`

Ensure the failure error message matches the acceptance criteria exactly:

```typescript
// Mark jobs as failed (exceeded retry limit)
if (jobsToFail.length > 0) {
  const failIds = jobsToFail.map((j: { id: string }) => j.id);
  const { error: failError } = await supabaseAdmin
    .from('translation_jobs')
    .update({
      status: 'failed',
      locked_by: null,
      locked_at: null,
      error_message: 'exceeded_max_retries_after_stale',  // EXACT format from spec
      completed_at: new Date().toISOString(),
    })
    .in('id', failIds);
  // ... rest
}
```

### Task 7: Export Updated Types (Priority: Low)

**File:** `/src/lib/job-queue/index.ts`

Ensure all new types are exported:

```typescript
// Concurrency control types (REQ-245 + REQ-E03-020)
export type {
  ConcurrencyConfig,
  CleanupResult,
  LockStatistics,
  HeartbeatResult,
  DuplicateCheckResult,
} from './concurrency-control';
```

### Task 8: Write Unit Tests (Priority: Medium)

**File:** `/src/lib/job-queue/__tests__/stale-job-cleanup.test.ts` (NEW)

Test cases:

```typescript
describe('Stale Job Cleanup (REQ-E03-020)', () => {
  describe('cleanupStaleProcessingJobs', () => {
    it('should detect jobs in processing state for > 5 minutes');
    it('should reset jobs with attempts < maxRetries to queued');
    it('should increment attempts counter when resetting');
    it('should mark jobs with attempts >= maxRetries as failed');
    it('should set error_message to "exceeded_max_retries_after_stale"');
    it('should clear locked_by and locked_at fields');
    it('should update started_at (clear or set to null)');
    it('should return accurate counts in CleanupResult');
    it('should use configurable staleThresholdMinutes');
    it('should use configurable maxStaleRetries');
    it('should handle empty queue gracefully');
    it('should handle database errors gracefully');
  });

  describe('runProcessingCycle integration', () => {
    it('should run cleanup before picking new jobs');
    it('should make recovered jobs available for processing');
    it('should respect enableStaleCleanup config');
    it('should log cleanup statistics when jobs recovered');
  });
});
```

### Task 9: Write Integration Tests (Priority: Medium)

**File:** `/src/lib/job-queue/__tests__/stale-job-cleanup.integration.test.ts` (NEW)

Test scenarios:

```typescript
describe('Stale Job Cleanup Integration (REQ-E03-020)', () => {
  it('should complete full cycle: stale detection → reset → reprocess');
  it('should handle concurrent cleanup calls safely');
  it('should not affect jobs that are actively processing (< 5 min)');
  it('should permanently fail jobs after multiple stale recoveries');
  it('should work with large job queues (100+ jobs)');
  it('should use database indexes efficiently');
});
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Functions/Sections to Modify | Description |
|-----------|------------------------------|-------------|
| `/src/lib/job-queue/concurrency-control.ts` | `cleanupStaleProcessingJobs()` | Add `attempts` increment on reset |
| `/src/lib/job-queue/concurrency-control.ts` | `CleanupResult` interface | Add `resetJobIds` and `failedJobIds` arrays |
| `/src/lib/job-queue/job-processor.ts` | `JobProcessorConfig` interface | Add stale cleanup config options |
| `/src/lib/job-queue/job-processor.ts` | `DEFAULT_CONFIG` constant | Add default values for new options |
| `/src/lib/job-queue/job-processor.ts` | `runProcessingCycle()` method | Add cleanup call before job picking |
| `/src/lib/job-queue/index.ts` | Module exports | Ensure types are exported |

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/__tests__/stale-job-cleanup.test.ts` | Unit tests for stale cleanup |
| `/src/lib/job-queue/__tests__/stale-job-cleanup.integration.test.ts` | Integration tests |

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Stale cleanup logic | `/src/lib/job-queue/concurrency-control.ts:153-248` | Base implementation to modify |
| Batch update with logging | `/src/lib/job-queue/concurrency-control.ts:199-217` | Reset job pattern |
| Config from environment | `/src/lib/job-queue/job-processor.ts:551-558` | `parseInt(process.env.X || default)` |
| Logging in processor | `/src/lib/job-queue/job-processor.ts:601-627` | `this.log()` method |
| Test setup with mocks | `/src/lib/job-queue/__tests__/helpers/` | Mock factories and utilities |

---

## Dependencies

### Required Before This Task

- **REQ-E03-018:** Implement Job Prioritization (jobs need priority field)
- **REQ-E03-019:** Implement Concurrency Control (semaphore integration)

### Already Implemented (Epic 1)

- `cleanupStaleProcessingJobs()` function exists (needs modification)
- `ConcurrencyControlManager` exists
- `TranslationJobProcessor` class exists
- Job queue infrastructure with locking

### Database Requirements

The existing database schema supports this feature:
- `translation_jobs.status` - already has 'processing' state
- `translation_jobs.locked_at` - used for stale detection
- `translation_jobs.attempts` - used for retry counting
- `translation_jobs.error_message` - used for failure reason

**Index verification** (from Plan-111):
```sql
-- This index should exist for efficient stale job lookup
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|--------------------|---------------------|
| Cleanup function scans for jobs in processing state | Already exists; Task 1 |
| Cleanup identifies stale jobs where time > 5 minutes | Already exists; Task 1 |
| Cleanup runs before job picker in each cycle | Task 3 |
| Cleanup updates status from processing to queued | Already exists |
| Cleanup increments `retry_count` (attempts) field | Task 1 (NEW behavior) |
| Cleanup clears `processing_worker_id` (locked_by) | Already exists |
| Cleanup updates timestamp to current time | Already exists |
| Jobs exceeding max retries are marked as failed | Already exists |
| Failed jobs record reason as `exceeded_max_retries_after_stale` | Task 6 |
| Cleanup logs count of jobs recovered | Already exists; Task 3 |
| Cleanup logs count of jobs permanently failed | Already exists; Task 3 |
| Cleanup completes within reasonable time with thousands of jobs | Task 9 (integration test) |
| Cleanup uses database indexes | Verify index exists |
| Max retry limit configurable via environment variable | Task 5 |
| Stale threshold configurable via environment variable | Task 5 |
| TypeScript types properly defined | Task 4, 7 |
| Unit tests verify stale detection with timestamp scenarios | Task 8 |
| Unit tests verify retry limit enforcement | Task 8 |
| Integration tests verify cleanup before job picking | Task 9 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cleanup delays job processing | Low | Low | Cleanup is fast (single query); only runs if stale jobs exist |
| Race condition between cleanup and active processing | Low | Medium | Use optimistic locking; only target jobs with old timestamps |
| Incrementing attempts causes premature failure | Low | Medium | Default 3 retries is generous; make configurable |
| Database timeout on large cleanup | Low | Low | Index ensures efficient query; LIMIT clause if needed |
| Breaking existing cleanup behavior | Medium | Medium | Comprehensive tests; validate before production |

---

## Performance Considerations

1. **Index Usage:** The cleanup query should use the existing `idx_translation_jobs_stale` index for efficient filtering of processing jobs by timestamp.

2. **Batch Size:** For very large job queues, consider adding a `LIMIT` clause to the cleanup query to bound execution time, processing stale jobs in chunks.

3. **Cleanup Frequency:** Cleanup runs every processing cycle (default 30 seconds). This is appropriate since:
   - Stale jobs are rare in normal operation
   - Query is efficient with index
   - Early detection prevents cascading delays

4. **Atomic Updates:** The batch update approach for resetting jobs is efficient, but incrementing `attempts` requires either:
   - Individual updates (current approach, more accurate)
   - Raw SQL with `attempts = attempts + 1` (faster for large batches)

---

## Notes

1. **Relationship to ConcurrencyControlManager:** The `ConcurrencyControlManager` runs its own cleanup on a 5-minute interval. This is independent from the per-cycle cleanup introduced here. Both serve different purposes:
   - ConcurrencyControlManager: Background safety net
   - Per-cycle cleanup: Immediate recovery before job processing

2. **`status_updated_at` Field:** The acceptance criteria mentions `status_updated_at`, but this field doesn't exist in the current schema. The implementation uses `locked_at` as the proxy for detecting stale jobs, which is appropriate since it's updated when a job enters processing state.

3. **Error Message Consistency:** The exact string `exceeded_max_retries_after_stale` is specified in the acceptance criteria. This differs from the current implementation which uses a more verbose message. Task 6 ensures exact compliance.

4. **Retry Semantics:** Incrementing `attempts` on stale recovery means:
   - A job that fails 2 times normally, then becomes stale, has attempts=3
   - On stale recovery, attempts becomes 4, exceeding limit of 3
   - This is intentional: stale jobs indicate persistent issues

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request: `/docs/gen_requests_epic3.md` (REQ-E03-020)
- Existing Stale Cleanup: `/src/lib/job-queue/concurrency-control.ts:153-248`
- Job Processor: `/src/lib/job-queue/job-processor.ts`
- Related Task (REQ-E03-019): `/docs/REQ-E03-019-implement-concurrency-control-overview.md`
