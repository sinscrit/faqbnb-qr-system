# REQ-352: Implement Stale Job Cleanup for Translation Queue - Implementation Overview

**Generated:** 2026-01-19 17:45:00 UTC
**Last Modified:** 2026-01-19 17:45:00 UTC
**Request Reference:** REQ-352 in `/docs/gen_requests_epic3.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.8

---

## Summary

Implement automatic detection and recovery of translation jobs that become stuck in "processing" status beyond an acceptable time threshold. Jobs stuck for more than 5 minutes are identified and either reset to "queued" status (with incremented attempt counts) or marked as "failed" if they exceed the maximum retry limit. The cleanup routine must run automatically before the job processor picks new jobs to ensure stale jobs are recovered before new work is assigned.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **ORM/Client** | @supabase/supabase-js |
| **Server Patterns** | supabaseAdmin for server-side operations |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Job Queue Module | `/src/lib/job-queue/translation-jobs.ts` | Job fetching, status updates, existing `cleanupStaleLocks()` function |
| Concurrency Control | `/src/lib/job-queue/concurrency-control.ts` | Existing `cleanupStaleProcessingJobs()` function that will be enhanced |
| Job Processor | `/src/lib/job-queue/job-processor.ts` | Background processing with polling |
| Database Types | `/src/lib/job-queue/translation-jobs.types.ts` | TypeScript type definitions |
| Admin API Routes | `/src/app/api/admin/` | Auth validation, error handling patterns |

### Database Schema (from Epic 1)

The `translation_jobs` table already includes necessary columns for stale job detection:

```sql
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  source_language VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  locked_by VARCHAR(100),        -- Worker identifier for locking
  locked_at TIMESTAMPTZ,         -- When lock was acquired
  UNIQUE(entity_type, entity_id, target_language)
);

-- Existing index for stale job queries
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

### Dependencies (Must Be Complete Before This Task)

| Task | File | Purpose |
|------|------|---------|
| REQ-243 (Task 4.1) | `/src/lib/job-queue/translation-jobs.ts` | Basic `cleanupStaleLocks()` function exists |
| REQ-245 (Task 4.4) | `/src/lib/job-queue/concurrency-control.ts` | `cleanupStaleProcessingJobs()` exists |
| REQ-244 (Task 4.2) | `/src/lib/job-queue/job-processor.ts` | Job processor infrastructure |

### Existing Implementation Analysis

The codebase already contains partial implementations of stale job cleanup:

1. **`cleanupStaleLocks()` in `translation-jobs.ts` (lines 708-757):**
   - Resets jobs to 'queued' status based on `locked_at` timestamp
   - Does NOT increment attempt counter
   - Does NOT mark jobs as failed if max retries exceeded
   - Does NOT log individual job IDs

2. **`cleanupStaleProcessingJobs()` in `concurrency-control.ts` (lines 153-248):**
   - Identifies stale jobs based on `locked_at` timestamp
   - Increments attempt counter properly
   - Marks jobs as failed if attempts >= maxStaleRetries
   - Returns detailed `CleanupResult`
   - MISSING: Not automatically called before job picking

---

## Architecture

### Stale Job Cleanup Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Stale Job Cleanup Flow                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                          ┌─────────────────────┐
                          │  Job Processor      │
                          │  Polling Cycle      │
                          └─────────────────────┘
                                      │
                                      ▼
                          ┌─────────────────────┐
                          │  1. Run Cleanup     │
                          │  BEFORE picking     │
                          │  new jobs           │
                          └─────────────────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
                  ▼                   ▼                   ▼
         ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
         │ Find Stale    │   │ Check Attempt │   │ Update Jobs   │
         │ Jobs          │   │ Counter       │   │               │
         │ (processing   │   │               │   │               │
         │  > 5 min)     │   │               │   │               │
         └───────────────┘   └───────────────┘   └───────────────┘
                  │                   │                   │
                  │                   ▼                   │
                  │      ┌─────────────────────┐         │
                  │      │ attempts < MAX_RETRY│         │
                  │      │ (default: 3)        │         │
                  │      └─────────────────────┘         │
                  │           │           │              │
                  │           │ YES       │ NO           │
                  │           ▼           ▼              │
                  │    ┌───────────┐ ┌───────────┐      │
                  │    │ Reset to  │ │ Mark as   │      │
                  │    │ 'queued'  │ │ 'failed'  │      │
                  │    │ +1 attempt│ │ + error   │      │
                  │    └───────────┘ └───────────┘      │
                  │           │           │              │
                  │           └─────┬─────┘              │
                  │                 │                    │
                  │                 ▼                    │
                  │        ┌───────────────┐            │
                  │        │ Log cleanup   │            │
                  │        │ results       │            │
                  │        └───────────────┘            │
                  │                 │                    │
                  └─────────────────┼────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │  2. Pick Next Job   │
                          │  (normal queue      │
                          │   processing)       │
                          └─────────────────────┘
```

### Module Structure

```
/src/lib/job-queue/
├── index.ts                        # Barrel exports (update)
├── translation-jobs.ts             # Job queue module (update cleanupStaleLocks)
├── translation-jobs.types.ts       # Type definitions (update if needed)
├── job-processor.ts                # Job processor (integrate cleanup)
├── concurrency-control.ts          # Existing cleanup function (minor update)
└── cleanup.ts                      # NEW: Dedicated cleanup module
```

---

## Integration Contract

### Core Interfaces

```typescript
// /src/lib/job-queue/cleanup.ts

import type { TranslationJob, JobQueueResult } from './translation-jobs.types';

/**
 * Configuration for stale job cleanup
 */
export interface StaleCleanupConfig {
  /** Timeout threshold in minutes (default: 5) */
  staleThresholdMinutes: number;
  /** Maximum retry attempts before marking as failed (default: 3) */
  maxRetryAttempts: number;
  /** Enable detailed logging (default: true) */
  enableLogging: boolean;
}

/**
 * Result of stale job cleanup operation
 */
export interface StaleCleanupResult {
  /** Total number of stale jobs found */
  staleJobsFound: number;
  /** Number of jobs reset to queued */
  jobsResetToQueued: number;
  /** Number of jobs marked as failed */
  jobsMarkedFailed: number;
  /** IDs of jobs reset to queued */
  resetJobIds: string[];
  /** IDs of jobs marked as failed */
  failedJobIds: string[];
  /** Cleanup execution timestamp */
  cleanedAt: string;
  /** Execution duration in milliseconds */
  durationMs: number;
}

/**
 * Stale job information for logging
 */
export interface StaleJobInfo {
  id: string;
  entityType: string;
  entityId: string;
  targetLanguage: string;
  attempts: number;
  startedAt: string;
  processingDurationMinutes: number;
}
```

### Module Functions

```typescript
// ===========================================================================
// Stale Job Cleanup Functions
// ===========================================================================

/**
 * Run stale job cleanup before picking new jobs
 *
 * This function should be called at the beginning of each job processing cycle.
 * It identifies jobs stuck in 'processing' status for longer than the threshold,
 * increments their attempt counter, and either resets them to 'queued' or marks
 * them as 'failed' based on retry limits.
 *
 * @param config - Optional cleanup configuration
 * @returns Cleanup result with affected job counts and IDs
 */
export async function runStaleJobCleanup(
  config?: Partial<StaleCleanupConfig>
): Promise<StaleCleanupResult>;

/**
 * Find all stale processing jobs without modifying them
 *
 * Useful for monitoring and reporting purposes.
 *
 * @param thresholdMinutes - Minutes after which a job is considered stale (default: 5)
 * @returns Array of stale job information
 */
export async function findStaleJobs(
  thresholdMinutes?: number
): Promise<StaleJobInfo[]>;

/**
 * Get count of currently stale jobs
 *
 * Efficient query for health checks and monitoring dashboards.
 *
 * @param thresholdMinutes - Minutes after which a job is considered stale (default: 5)
 * @returns Count of stale jobs
 */
export async function getStaleJobCount(
  thresholdMinutes?: number
): Promise<number>;

// ===========================================================================
// Integration with Job Processor
// ===========================================================================

/**
 * Enhanced job picking that runs cleanup first
 *
 * Wraps the standard fetchAndLockNextJob to ensure cleanup runs before
 * picking new jobs.
 *
 * @param workerId - Worker identifier for locking
 * @returns Locked job or null if no jobs available
 */
export async function fetchNextJobWithCleanup(
  workerId: string,
  cleanupConfig?: Partial<StaleCleanupConfig>
): Promise<JobQueueResult<TranslationJob | null>>;
```

---

## Implementation Tasks

### Task 3.8.1: Create Dedicated Cleanup Module

**File:** `/src/lib/job-queue/cleanup.ts` (new file)

Create a new module dedicated to stale job cleanup functionality:

```typescript
/**
 * Stale Job Cleanup Module
 * Part of REQ-352: Implement Stale Job Cleanup for Translation Queue
 *
 * This module provides cleanup functionality to detect and recover
 * translation jobs stuck in 'processing' status.
 *
 * @module job-queue/cleanup
 * @created 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { TranslationJob, JobQueueResult } from './translation-jobs.types';

// Default configuration
export const DEFAULT_STALE_THRESHOLD_MINUTES = 5;
export const DEFAULT_MAX_RETRY_ATTEMPTS = 3;

// Type definitions
export interface StaleCleanupConfig {
  staleThresholdMinutes: number;
  maxRetryAttempts: number;
  enableLogging: boolean;
}

export interface StaleCleanupResult {
  staleJobsFound: number;
  jobsResetToQueued: number;
  jobsMarkedFailed: number;
  resetJobIds: string[];
  failedJobIds: string[];
  cleanedAt: string;
  durationMs: number;
}

export interface StaleJobInfo {
  id: string;
  entityType: string;
  entityId: string;
  targetLanguage: string;
  attempts: number;
  startedAt: string;
  processingDurationMinutes: number;
}

const DEFAULT_CONFIG: StaleCleanupConfig = {
  staleThresholdMinutes: DEFAULT_STALE_THRESHOLD_MINUTES,
  maxRetryAttempts: DEFAULT_MAX_RETRY_ATTEMPTS,
  enableLogging: true,
};
```

**Acceptance Criteria:**
- New file created with proper module header
- All interfaces defined with JSDoc comments
- Default configuration constants exported
- Proper imports from existing modules

### Task 3.8.2: Implement runStaleJobCleanup Function

**File:** `/src/lib/job-queue/cleanup.ts` (append to existing)

Implement the main cleanup function:

```typescript
/**
 * Run stale job cleanup before picking new jobs
 */
export async function runStaleJobCleanup(
  config?: Partial<StaleCleanupConfig>
): Promise<StaleCleanupResult> {
  const startTime = Date.now();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { staleThresholdMinutes, maxRetryAttempts, enableLogging } = mergedConfig;

  const cutoffTime = new Date(
    Date.now() - staleThresholdMinutes * 60 * 1000
  ).toISOString();

  const resetJobIds: string[] = [];
  const failedJobIds: string[] = [];

  try {
    // Step 1: Find all stale processing jobs
    const { data: staleJobs, error: findError } = await supabaseAdmin
      .from('translation_jobs')
      .select('id, entity_type, entity_id, target_language, attempts, started_at')
      .eq('status', 'processing')
      .lt('started_at', cutoffTime);

    if (findError) {
      console.error('[StaleCleanup] Error finding stale jobs:', findError);
      return {
        staleJobsFound: 0,
        jobsResetToQueued: 0,
        jobsMarkedFailed: 0,
        resetJobIds: [],
        failedJobIds: [],
        cleanedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      };
    }

    if (!staleJobs || staleJobs.length === 0) {
      if (enableLogging) {
        console.log('[StaleCleanup] No stale jobs found');
      }
      return {
        staleJobsFound: 0,
        jobsResetToQueued: 0,
        jobsMarkedFailed: 0,
        resetJobIds: [],
        failedJobIds: [],
        cleanedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      };
    }

    // Step 2: Separate jobs into reset vs fail based on attempt count
    const jobsToReset = staleJobs.filter(
      (j) => (j.attempts || 0) < maxRetryAttempts
    );
    const jobsToFail = staleJobs.filter(
      (j) => (j.attempts || 0) >= maxRetryAttempts
    );

    // Step 3: Reset eligible jobs to queued with incremented attempts
    if (jobsToReset.length > 0) {
      for (const job of jobsToReset) {
        const newAttempts = (job.attempts || 0) + 1;
        const { error: resetError } = await supabaseAdmin
          .from('translation_jobs')
          .update({
            status: 'queued',
            attempts: newAttempts,
            locked_by: null,
            locked_at: null,
            started_at: null,
            error_message: `Automatically reset from stale processing state. Attempt ${newAttempts} of ${maxRetryAttempts}.`,
          })
          .eq('id', job.id);

        if (!resetError) {
          resetJobIds.push(job.id);
          if (enableLogging) {
            console.log('[StaleCleanup] Reset stale job:', {
              jobId: job.id,
              entityType: job.entity_type,
              entityId: job.entity_id,
              targetLanguage: job.target_language,
              newAttempts,
            });
          }
        } else {
          console.error('[StaleCleanup] Failed to reset job:', job.id, resetError);
        }
      }
    }

    // Step 4: Mark jobs that exceeded retry limit as failed
    if (jobsToFail.length > 0) {
      for (const job of jobsToFail) {
        const { error: failError } = await supabaseAdmin
          .from('translation_jobs')
          .update({
            status: 'failed',
            locked_by: null,
            locked_at: null,
            completed_at: new Date().toISOString(),
            error_message: `Exceeded maximum retry attempts (${maxRetryAttempts}). Job timed out repeatedly and was automatically marked as failed.`,
          })
          .eq('id', job.id);

        if (!failError) {
          failedJobIds.push(job.id);
          if (enableLogging) {
            console.warn('[StaleCleanup] Marked stale job as failed:', {
              jobId: job.id,
              entityType: job.entity_type,
              entityId: job.entity_id,
              targetLanguage: job.target_language,
              attempts: job.attempts,
            });
          }
        } else {
          console.error('[StaleCleanup] Failed to mark job as failed:', job.id, failError);
        }
      }
    }

    const result: StaleCleanupResult = {
      staleJobsFound: staleJobs.length,
      jobsResetToQueued: resetJobIds.length,
      jobsMarkedFailed: failedJobIds.length,
      resetJobIds,
      failedJobIds,
      cleanedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    };

    if (enableLogging && staleJobs.length > 0) {
      console.info('[StaleCleanup] Cleanup completed:', result);
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[StaleCleanup] Exception during cleanup:', message);
    return {
      staleJobsFound: 0,
      jobsResetToQueued: 0,
      jobsMarkedFailed: 0,
      resetJobIds: [],
      failedJobIds: [],
      cleanedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- Identifies jobs with status 'processing' and started_at > threshold
- Increments attempt counter for each reset job
- Resets jobs to 'queued' if attempts < maxRetryAttempts
- Marks jobs as 'failed' if attempts >= maxRetryAttempts
- Logs each recovered job with jobId, entityType, and processing duration
- Returns detailed cleanup result with job IDs
- Handles database errors gracefully
- Uses database timestamps (started_at) for accurate duration calculation

### Task 3.8.3: Implement Helper Functions

**File:** `/src/lib/job-queue/cleanup.ts` (append to existing)

Implement monitoring and utility functions:

```typescript
/**
 * Find all stale processing jobs without modifying them
 */
export async function findStaleJobs(
  thresholdMinutes: number = DEFAULT_STALE_THRESHOLD_MINUTES
): Promise<StaleJobInfo[]> {
  const cutoffTime = new Date(
    Date.now() - thresholdMinutes * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from('translation_jobs')
    .select('id, entity_type, entity_id, target_language, attempts, started_at')
    .eq('status', 'processing')
    .lt('started_at', cutoffTime);

  if (error) {
    console.error('[StaleCleanup] Error finding stale jobs:', error);
    return [];
  }

  return (data || []).map((job) => {
    const startedAt = new Date(job.started_at);
    const now = new Date();
    const durationMs = now.getTime() - startedAt.getTime();

    return {
      id: job.id,
      entityType: job.entity_type,
      entityId: job.entity_id,
      targetLanguage: job.target_language,
      attempts: job.attempts || 0,
      startedAt: job.started_at,
      processingDurationMinutes: Math.round(durationMs / 60000),
    };
  });
}

/**
 * Get count of currently stale jobs
 */
export async function getStaleJobCount(
  thresholdMinutes: number = DEFAULT_STALE_THRESHOLD_MINUTES
): Promise<number> {
  const cutoffTime = new Date(
    Date.now() - thresholdMinutes * 60 * 1000
  ).toISOString();

  const { count, error } = await supabaseAdmin
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing')
    .lt('started_at', cutoffTime);

  if (error) {
    console.error('[StaleCleanup] Error counting stale jobs:', error);
    return 0;
  }

  return count || 0;
}
```

**Acceptance Criteria:**
- `findStaleJobs()` returns detailed information without modifying jobs
- `getStaleJobCount()` uses efficient count query
- Both functions use consistent threshold calculation
- Proper error handling in both functions

### Task 3.8.4: Implement Integration with Job Processor

**File:** `/src/lib/job-queue/cleanup.ts` (append to existing)

Implement the wrapper function that integrates cleanup with job picking:

```typescript
import { fetchAndLockNextJob } from './translation-jobs';

/**
 * Enhanced job picking that runs cleanup first
 */
export async function fetchNextJobWithCleanup(
  workerId: string,
  cleanupConfig?: Partial<StaleCleanupConfig>
): Promise<JobQueueResult<TranslationJob | null>> {
  // Step 1: Run stale job cleanup before picking new jobs
  await runStaleJobCleanup(cleanupConfig);

  // Step 2: Proceed with normal job fetching
  return fetchAndLockNextJob({ workerId });
}
```

**Acceptance Criteria:**
- Cleanup runs BEFORE job picking
- Cleanup does not block job picking on failure
- Returns same interface as fetchAndLockNextJob
- Cleanup config is optional

### Task 3.8.5: Update Job Processor to Use Cleanup

**File:** `/src/lib/job-queue/job-processor.ts` (modify)

Update the `runProcessingCycle` method to run cleanup before picking jobs:

```typescript
// Add import at top of file
import { runStaleJobCleanup, StaleCleanupResult } from './cleanup';

// Modify runProcessingCycle method in TranslationJobProcessor class
async runProcessingCycle(): Promise<ProcessingRunResult & { cleanupResult?: StaleCleanupResult }> {
  if (this.isProcessing) {
    this.log('debug', 'Skipping cycle - already processing');
    return {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      jobsProcessed: 0,
      jobsSucceeded: 0,
      jobsFailed: 0,
      results: [],
    };
  }

  this.isProcessing = true;
  const startedAt = new Date().toISOString();
  const results: JobProcessingResult[] = [];
  let cleanupResult: StaleCleanupResult | undefined;

  try {
    // Step 1: Run stale job cleanup BEFORE picking new jobs
    cleanupResult = await runStaleJobCleanup({
      staleThresholdMinutes: this.config.lockTimeoutMinutes,
      maxRetryAttempts: 3,
      enableLogging: this.config.enableLogging,
    });

    // Step 2: Process one job per cycle
    const result = await this.processNextJob();

    // ... rest of existing processing logic ...
  } finally {
    this.isProcessing = false;
  }

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    jobsProcessed: results.length,
    jobsSucceeded: results.filter(r => r.success).length,
    jobsFailed: results.filter(r => !r.success).length,
    results,
    cleanupResult,
  };
}
```

**Acceptance Criteria:**
- Cleanup runs at the start of each processing cycle
- Cleanup failures don't prevent job processing
- Cleanup result is included in cycle result for monitoring
- Cleanup uses processor's existing timeout configuration

### Task 3.8.6: Update Barrel Exports

**File:** `/src/lib/job-queue/index.ts` (modify)

Add cleanup module exports:

```typescript
// Stale job cleanup exports (REQ-352)
export {
  runStaleJobCleanup,
  findStaleJobs,
  getStaleJobCount,
  fetchNextJobWithCleanup,
  DEFAULT_STALE_THRESHOLD_MINUTES,
  DEFAULT_MAX_RETRY_ATTEMPTS,
} from './cleanup';

// Types
export type {
  StaleCleanupConfig,
  StaleCleanupResult,
  StaleJobInfo,
} from './cleanup';
```

**Acceptance Criteria:**
- All public APIs exported
- Types exported separately
- Clean import path maintained

### Task 3.8.7: Add Environment Variable Support

**File:** `/src/lib/job-queue/cleanup.ts` (modify defaults)

Make thresholds configurable via environment variables:

```typescript
// Update default configuration to read from environment
export const DEFAULT_STALE_THRESHOLD_MINUTES = parseInt(
  process.env.TRANSLATION_STALE_THRESHOLD_MINUTES || '5',
  10
);

export const DEFAULT_MAX_RETRY_ATTEMPTS = parseInt(
  process.env.TRANSLATION_MAX_RETRY_ATTEMPTS || '3',
  10
);
```

**Acceptance Criteria:**
- 5-minute threshold is configurable via `TRANSLATION_STALE_THRESHOLD_MINUTES`
- Max retry threshold is configurable via `TRANSLATION_MAX_RETRY_ATTEMPTS`
- Defaults are used when environment variables not set

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/cleanup.ts` | Dedicated stale job cleanup module |

### Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/index.ts` | Add cleanup module exports |
| `/src/lib/job-queue/job-processor.ts` | Integrate cleanup into processing cycle |

### Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `runStaleJobCleanup` | cleanup.ts | Main cleanup function |
| `findStaleJobs` | cleanup.ts | Find stale jobs for monitoring |
| `getStaleJobCount` | cleanup.ts | Efficient count query |
| `fetchNextJobWithCleanup` | cleanup.ts | Wrapper for job picking |

### Functions to Modify

| Function | File | Modification |
|----------|------|--------------|
| `runProcessingCycle` | job-processor.ts | Add cleanup before job picking |

---

## Dependencies

### Prerequisites (Must Be Completed First)

1. **REQ-243 (Task 4.1):** Job queue module
   - `fetchAndLockNextJob()` function
   - `TranslationJob` type
   - `translation_jobs` table exists

2. **REQ-244 (Task 4.2):** Job processor
   - `TranslationJobProcessor` class
   - `runProcessingCycle()` method

3. **REQ-245 (Task 4.4):** Concurrency control (optional enhancement source)
   - Existing `cleanupStaleProcessingJobs()` can be referenced

### Downstream Dependencies (Tasks That Depend on This)

1. **REQ-332:** Create Job Processing API Route
   - Will use `runStaleJobCleanup()` before processing batches
   - Will return `cleanupCount` in response

2. **REQ-334:** Implement Job Monitoring Endpoint
   - Will use `getStaleJobCount()` for health checks

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Use `started_at` for stale detection | Yes | More reliable than `locked_at` as it indicates actual processing start |
| Separate cleanup module | New file | Clean separation of concerns, easier testing |
| Increment attempts on reset | Yes | Tracks total processing attempts for accurate failure detection |
| Run cleanup per cycle | Yes | Ensures recovery happens before new work |
| Cleanup doesn't block processing | Non-fatal errors | System continues operating even if cleanup fails |
| Individual job updates | Per-job queries | Better logging and error handling per job |

---

## Testing Considerations

### Unit Tests

Create `/src/lib/job-queue/__tests__/cleanup.test.ts`:

- `runStaleJobCleanup`: Test reset and fail paths
- `runStaleJobCleanup`: Test empty result when no stale jobs
- `runStaleJobCleanup`: Test attempt increment logic
- `findStaleJobs`: Test accurate duration calculation
- `getStaleJobCount`: Test efficient count query
- `fetchNextJobWithCleanup`: Test cleanup runs before fetch

### Integration Tests

- Simulate job stuck in processing for > 5 minutes
- Verify cleanup resets job to queued with incremented attempts
- Verify job exceeding max retries is marked failed
- Verify cleanup runs before job picking in processor
- Test concurrent cleanup operations (no race conditions)

### Edge Cases

- Job completes just as cleanup runs (no conflict due to status check)
- Cleanup runs while job is legitimately processing (heartbeat prevents)
- Clock skew between workers (use database timestamps)
- Database connection lost during cleanup (graceful error handling)
- Large number of stale jobs (performance testing)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cleanup resets completing job | Low | Medium | Use status='processing' check in update |
| Performance impact of cleanup | Low | Low | Uses indexed started_at column |
| Clock skew | Low | Low | Uses database timestamps, not local |
| Race condition in cleanup | Low | Medium | Per-job atomic updates |
| Cleanup query timeout | Very Low | Low | Indexed query should be fast |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| 3.8.1: Create cleanup module structure | Trivial | High |
| 3.8.2: Implement runStaleJobCleanup | Small | High |
| 3.8.3: Implement helper functions | Small | High |
| 3.8.4: Implement fetchNextJobWithCleanup | Trivial | High |
| 3.8.5: Update job processor | Small | High |
| 3.8.6: Update barrel exports | Trivial | High |
| 3.8.7: Add environment variable support | Trivial | High |
| **Total** | **Small-Medium** | High |

---

## Usage Examples

### Manual Cleanup (from Admin API)

```typescript
import { runStaleJobCleanup } from '@/lib/job-queue';

// Manual cleanup with custom configuration
const result = await runStaleJobCleanup({
  staleThresholdMinutes: 5,
  maxRetryAttempts: 3,
  enableLogging: true,
});

console.log(`Cleanup completed:
  - Found ${result.staleJobsFound} stale jobs
  - Reset ${result.jobsResetToQueued} jobs to queued
  - Marked ${result.jobsMarkedFailed} jobs as failed
  - Duration: ${result.durationMs}ms
`);
```

### Health Check for Stale Jobs

```typescript
import { getStaleJobCount, findStaleJobs } from '@/lib/job-queue';

// Quick count for health checks
const staleCount = await getStaleJobCount(5);
if (staleCount > 10) {
  console.warn('High number of stale jobs detected');
}

// Detailed info for debugging
const staleJobs = await findStaleJobs(5);
for (const job of staleJobs) {
  console.log(`Stale job: ${job.id}
    - Entity: ${job.entityType}/${job.entityId}
    - Processing for ${job.processingDurationMinutes} minutes
    - Attempt ${job.attempts}
  `);
}
```

### Automatic Cleanup in Processing

```typescript
// The job processor automatically runs cleanup before each cycle
import { startJobProcessor } from '@/lib/job-queue';

// When started, cleanup runs automatically before picking jobs
startJobProcessor();
```

---

## Acceptance Criteria Verification

| Criteria (from REQ-352) | Implementation Verification |
|-------------------------|----------------------------|
| Cleanup identifies jobs with status 'processing' and started_at > 5 minutes | `runStaleJobCleanup()` queries with `lt('started_at', cutoffTime)` |
| Stale jobs have status changed from 'processing' to 'queued' | Update query sets `status: 'queued'` |
| Attempt counter is incremented for each reset job | Update includes `attempts: newAttempts` where `newAttempts = attempts + 1` |
| Jobs exceeding max retry limit are marked 'failed' | Separate update path for `attempts >= maxRetryAttempts` |
| Cleanup logs job count and IDs | `console.log` with jobId, entityType, etc. when enableLogging=true |
| Cleanup runs before job picking | `runProcessingCycle()` calls cleanup before `processNextJob()` |
| Cleanup doesn't significantly delay job processing | Uses indexed query, non-blocking design |
| Failed job resets include error message | Error message includes retry context |
| Handles concurrent execution safely | Per-job atomic updates, no shared state |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.8)
- Request: REQ-352 in `/docs/gen_requests_epic3.md`
- Related Request: REQ-278 (similar functionality, different request number)
- Job Queue Module: REQ-243 (`/src/lib/job-queue/translation-jobs.ts`)
- Concurrency Control: REQ-245 (`/src/lib/job-queue/concurrency-control.ts`)
- Job Processor: REQ-244 (`/src/lib/job-queue/job-processor.ts`)

---

*Implementation overview generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 3, Task 3.8*
