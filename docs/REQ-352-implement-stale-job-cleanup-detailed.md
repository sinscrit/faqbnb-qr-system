# REQ-352: Implement Stale Job Cleanup for Translation Queue - Detailed Task Breakdown

**Generated:** 2026-01-19 18:30:00 UTC
**Last Modified:** 2026-01-19 18:30:00 UTC
**Request Reference:** REQ-352 in `/docs/gen_requests_epic3.md`
**Overview Document:** `/docs/REQ-352-implement-stale-job-cleanup-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.8
**Complexity:** Medium

---

## Document Purpose

This document provides granular, actionable implementation tasks for REQ-352 (Implement Stale Job Cleanup). Each task is designed to be approximately 1 story point and can be executed by an AI coding agent or junior developer with minimal ambiguity.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] REQ-243 (Job Queue Module) is complete - `/src/lib/job-queue/translation-jobs.ts` exists
- [ ] REQ-244 (Job Processor) is complete - `/src/lib/job-queue/job-processor.ts` exists
- [ ] REQ-245 (Concurrency Control) is complete - `/src/lib/job-queue/concurrency-control.ts` exists
- [ ] Database table `translation_jobs` exists with columns: `id`, `status`, `attempts`, `started_at`, `locked_by`, `locked_at`
- [ ] Index `idx_translation_jobs_stale` exists for efficient stale job queries

---

## Existing Code Analysis

### Current Implementation State

The codebase already has partial stale job cleanup functionality:

1. **`concurrency-control.ts`** (lines 153-248):
   - `cleanupStaleProcessingJobs()` - Uses `locked_at` for detection
   - `findStaleProcessingJobs()` - Returns stale jobs for monitoring
   - `getStaleLocksCount()` - Efficient count query

2. **`translation-jobs.ts`**:
   - `cleanupStaleLocks()` - Basic reset function

3. **`job-processor.ts`** (lines 710-778):
   - `runProcessingCycle()` - Does NOT currently call cleanup before picking jobs

### Gap Analysis

| Requirement | Current State | Action Needed |
|-------------|---------------|---------------|
| Detect stale jobs (processing > 5 min) | Partial - uses `locked_at` | REQ wants `started_at` per AC |
| Increment attempt counter | Missing in some paths | Add to reset logic |
| Mark as failed if max retries | Exists in concurrency-control | Verify consistency |
| Run cleanup before job picking | Missing | Integrate into `runProcessingCycle()` |
| Log job IDs | Partial logging | Enhance with detailed logging |
| Configurable via env vars | Missing | Add environment variable support |

---

## Task Breakdown

### Task 3.8.1: Create Dedicated Cleanup Module Structure

**File:** `/src/lib/job-queue/cleanup.ts` (NEW)
**Estimated Effort:** ~30 minutes
**Dependencies:** None

#### Description
Create a new dedicated module file for stale job cleanup functionality with type definitions, constants, and proper module documentation.

#### Implementation Steps

1. Create new file `/src/lib/job-queue/cleanup.ts`

2. Add module header comment:
```typescript
/**
 * Stale Job Cleanup Module
 * Part of REQ-352: Implement Stale Job Cleanup for Translation Queue
 *
 * Provides cleanup functionality to detect and recover translation jobs
 * stuck in 'processing' status beyond the threshold timeout.
 *
 * @module job-queue/cleanup
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */
```

3. Add imports:
```typescript
import { supabaseAdmin } from '@/lib/supabase';
import type { TranslationJob, JobQueueResult } from './translation-jobs.types';
```

4. Add configuration constants with environment variable support:
```typescript
// ===========================================================================
// Configuration Constants
// ===========================================================================

/** Default threshold in minutes after which a job is considered stale */
export const DEFAULT_STALE_THRESHOLD_MINUTES = parseInt(
  process.env.TRANSLATION_STALE_THRESHOLD_MINUTES || '5',
  10
);

/** Default maximum retry attempts before marking job as failed */
export const DEFAULT_MAX_RETRY_ATTEMPTS = parseInt(
  process.env.TRANSLATION_MAX_RETRY_ATTEMPTS || '3',
  10
);
```

5. Add type definitions:
```typescript
// ===========================================================================
// Type Definitions
// ===========================================================================

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
 * Stale job information for logging and monitoring
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

/**
 * Default cleanup configuration
 */
export const DEFAULT_CLEANUP_CONFIG: StaleCleanupConfig = {
  staleThresholdMinutes: DEFAULT_STALE_THRESHOLD_MINUTES,
  maxRetryAttempts: DEFAULT_MAX_RETRY_ATTEMPTS,
  enableLogging: true,
};
```

#### Acceptance Criteria
- [ ] File `/src/lib/job-queue/cleanup.ts` exists
- [ ] Module header with proper documentation
- [ ] `StaleCleanupConfig` interface defined with JSDoc comments
- [ ] `StaleCleanupResult` interface defined with all required properties
- [ ] `StaleJobInfo` interface defined for monitoring
- [ ] `DEFAULT_STALE_THRESHOLD_MINUTES` reads from `TRANSLATION_STALE_THRESHOLD_MINUTES` env var
- [ ] `DEFAULT_MAX_RETRY_ATTEMPTS` reads from `TRANSLATION_MAX_RETRY_ATTEMPTS` env var
- [ ] `DEFAULT_CLEANUP_CONFIG` object exported
- [ ] No TypeScript errors

#### Verification Command
```bash
npx tsc --noEmit src/lib/job-queue/cleanup.ts
```

---

### Task 3.8.2: Implement runStaleJobCleanup Function

**File:** `/src/lib/job-queue/cleanup.ts` (append)
**Estimated Effort:** ~45 minutes
**Dependencies:** Task 3.8.1

#### Description
Implement the main `runStaleJobCleanup()` function that identifies stale jobs, resets eligible ones to queued, and marks exceeded retry attempts as failed.

#### Implementation Steps

1. Add the main cleanup function after the type definitions:

```typescript
// ===========================================================================
// Main Cleanup Function
// ===========================================================================

/**
 * Run stale job cleanup before picking new jobs
 *
 * Identifies jobs stuck in 'processing' status for longer than the threshold,
 * increments their attempt counter, and either:
 * - Resets them to 'queued' (if attempts < maxRetryAttempts)
 * - Marks them as 'failed' (if attempts >= maxRetryAttempts)
 *
 * IMPORTANT: Uses `started_at` timestamp for stale detection as per AC requirements.
 *
 * @param config - Optional cleanup configuration
 * @returns Cleanup result with affected job counts and IDs
 */
export async function runStaleJobCleanup(
  config?: Partial<StaleCleanupConfig>
): Promise<StaleCleanupResult> {
  const startTime = Date.now();
  const mergedConfig = { ...DEFAULT_CLEANUP_CONFIG, ...config };
  const { staleThresholdMinutes, maxRetryAttempts, enableLogging } = mergedConfig;

  // Calculate cutoff timestamp
  const cutoffTime = new Date(
    Date.now() - staleThresholdMinutes * 60 * 1000
  ).toISOString();

  const resetJobIds: string[] = [];
  const failedJobIds: string[] = [];

  try {
    // Step 1: Find all stale processing jobs using started_at (per AC requirement)
    const { data: staleJobs, error: findError } = await supabaseAdmin
      .from('translation_jobs')
      .select('id, entity_type, entity_id, target_language, attempts, started_at')
      .eq('status', 'processing')
      .lt('started_at', cutoffTime);

    if (findError) {
      console.error('[StaleCleanup] Error finding stale jobs:', findError);
      return createEmptyResult(startTime);
    }

    if (!staleJobs || staleJobs.length === 0) {
      if (enableLogging) {
        console.log('[StaleCleanup] No stale jobs found');
      }
      return createEmptyResult(startTime);
    }

    if (enableLogging) {
      console.log(`[StaleCleanup] Found ${staleJobs.length} stale job(s)`);
    }

    // Step 2: Separate jobs into reset vs fail based on attempt count
    const jobsToReset = staleJobs.filter(
      (j) => (j.attempts || 0) < maxRetryAttempts
    );
    const jobsToFail = staleJobs.filter(
      (j) => (j.attempts || 0) >= maxRetryAttempts
    );

    // Step 3: Reset eligible jobs to queued with incremented attempts
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
        .eq('id', job.id)
        .eq('status', 'processing'); // Safety: only update if still processing

      if (!resetError) {
        resetJobIds.push(job.id);
        if (enableLogging) {
          const durationMinutes = calculateDurationMinutes(job.started_at);
          console.log('[StaleCleanup] Reset stale job:', {
            jobId: job.id,
            entityType: job.entity_type,
            entityId: job.entity_id,
            targetLanguage: job.target_language,
            processingDurationMinutes: durationMinutes,
            newAttempts,
          });
        }
      } else {
        console.error('[StaleCleanup] Failed to reset job:', job.id, resetError);
      }
    }

    // Step 4: Mark jobs that exceeded retry limit as failed
    for (const job of jobsToFail) {
      const { error: failError } = await supabaseAdmin
        .from('translation_jobs')
        .update({
          status: 'failed',
          locked_by: null,
          locked_at: null,
          completed_at: new Date().toISOString(),
          error_message: `Exceeded maximum retry attempts (${maxRetryAttempts}). Job timed out repeatedly and was automatically marked as failed after ${job.attempts || 0} attempts.`,
        })
        .eq('id', job.id)
        .eq('status', 'processing'); // Safety: only update if still processing

      if (!failError) {
        failedJobIds.push(job.id);
        if (enableLogging) {
          const durationMinutes = calculateDurationMinutes(job.started_at);
          console.warn('[StaleCleanup] Marked stale job as failed (exceeded retries):', {
            jobId: job.id,
            entityType: job.entity_type,
            entityId: job.entity_id,
            targetLanguage: job.target_language,
            processingDurationMinutes: durationMinutes,
            totalAttempts: job.attempts || 0,
          });
        }
      } else {
        console.error('[StaleCleanup] Failed to mark job as failed:', job.id, failError);
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
      console.info('[StaleCleanup] Cleanup completed:', {
        found: result.staleJobsFound,
        reset: result.jobsResetToQueued,
        failed: result.jobsMarkedFailed,
        durationMs: result.durationMs,
      });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[StaleCleanup] Exception during cleanup:', message);
    return createEmptyResult(startTime);
  }
}

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Create an empty result object for error/no-op cases
 */
function createEmptyResult(startTime: number): StaleCleanupResult {
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

/**
 * Calculate processing duration in minutes from started_at timestamp
 */
function calculateDurationMinutes(startedAt: string | null): number {
  if (!startedAt) return 0;
  const startTime = new Date(startedAt).getTime();
  const now = Date.now();
  return Math.round((now - startTime) / 60000);
}
```

#### Acceptance Criteria
- [ ] `runStaleJobCleanup()` function exported
- [ ] Uses `started_at` column (NOT `locked_at`) for stale detection per AC
- [ ] Calculates cutoff time as `now - thresholdMinutes * 60 * 1000`
- [ ] Queries jobs with `status = 'processing' AND started_at < cutoffTime`
- [ ] Increments `attempts` counter for reset jobs
- [ ] Sets `status = 'queued'` for jobs with `attempts < maxRetryAttempts`
- [ ] Sets `status = 'failed'` for jobs with `attempts >= maxRetryAttempts`
- [ ] Clears `locked_by`, `locked_at`, `started_at` on reset
- [ ] Sets `completed_at` on failed jobs
- [ ] Includes descriptive `error_message` for both reset and failed jobs
- [ ] Logs individual job IDs with entityType and duration
- [ ] Returns `StaleCleanupResult` with all job IDs
- [ ] Safety condition `eq('status', 'processing')` prevents race conditions
- [ ] Handles database errors gracefully (returns empty result, doesn't throw)

#### Verification Command
```bash
npx tsc --noEmit src/lib/job-queue/cleanup.ts
```

---

### Task 3.8.3: Implement Monitoring Helper Functions

**File:** `/src/lib/job-queue/cleanup.ts` (append)
**Estimated Effort:** ~30 minutes
**Dependencies:** Task 3.8.1

#### Description
Implement `findStaleJobs()` and `getStaleJobCount()` helper functions for monitoring and health checks.

#### Implementation Steps

1. Add monitoring functions after the helper functions section:

```typescript
// ===========================================================================
// Monitoring Functions
// ===========================================================================

/**
 * Find all stale processing jobs without modifying them
 *
 * Useful for monitoring dashboards and alerting systems.
 * Does NOT modify any job records.
 *
 * @param thresholdMinutes - Minutes after which a job is considered stale (default: 5)
 * @returns Array of stale job information
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
    .lt('started_at', cutoffTime)
    .order('started_at', { ascending: true });

  if (error) {
    console.error('[StaleCleanup] Error finding stale jobs:', error);
    return [];
  }

  return (data || []).map((job): StaleJobInfo => ({
    id: job.id,
    entityType: job.entity_type,
    entityId: job.entity_id,
    targetLanguage: job.target_language,
    attempts: job.attempts || 0,
    startedAt: job.started_at || '',
    processingDurationMinutes: calculateDurationMinutes(job.started_at),
  }));
}

/**
 * Get count of currently stale jobs
 *
 * Efficient count-only query for health checks and monitoring endpoints.
 * Does NOT fetch full job data - uses SELECT count(*) pattern.
 *
 * @param thresholdMinutes - Minutes after which a job is considered stale (default: 5)
 * @returns Count of stale jobs
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

#### Acceptance Criteria
- [ ] `findStaleJobs()` function exported
- [ ] `findStaleJobs()` uses `started_at` for stale detection (consistent with main cleanup)
- [ ] `findStaleJobs()` returns `StaleJobInfo[]` with calculated `processingDurationMinutes`
- [ ] `findStaleJobs()` orders results by `started_at` ascending (oldest first)
- [ ] `findStaleJobs()` does NOT modify any database records
- [ ] `getStaleJobCount()` function exported
- [ ] `getStaleJobCount()` uses efficient `count: 'exact', head: true` query
- [ ] `getStaleJobCount()` uses `started_at` for consistent detection
- [ ] Both functions accept optional `thresholdMinutes` parameter
- [ ] Both functions default to `DEFAULT_STALE_THRESHOLD_MINUTES`
- [ ] Both functions handle errors gracefully (return empty/0, don't throw)

#### Verification Command
```bash
npx tsc --noEmit src/lib/job-queue/cleanup.ts
```

---

### Task 3.8.4: Implement fetchNextJobWithCleanup Wrapper

**File:** `/src/lib/job-queue/cleanup.ts` (append)
**Estimated Effort:** ~20 minutes
**Dependencies:** Tasks 3.8.1, 3.8.2

#### Description
Implement a wrapper function that runs cleanup before fetching the next job, providing an easy integration point.

#### Implementation Steps

1. Add import at top of file (if not already present):
```typescript
import { fetchAndLockNextJob } from './translation-jobs';
```

2. Add wrapper function:

```typescript
// ===========================================================================
// Integration Functions
// ===========================================================================

/**
 * Enhanced job fetching that runs cleanup first
 *
 * Wraps the standard fetchAndLockNextJob to ensure cleanup runs before
 * picking new jobs. This is the recommended way to fetch jobs in the
 * processor when you want automatic stale job recovery.
 *
 * @param workerId - Worker identifier for locking
 * @param cleanupConfig - Optional cleanup configuration
 * @returns Locked job or null if no jobs available
 */
export async function fetchNextJobWithCleanup(
  workerId: string,
  cleanupConfig?: Partial<StaleCleanupConfig>
): Promise<JobQueueResult<TranslationJob | null>> {
  // Step 1: Run stale job cleanup before picking new jobs
  // Cleanup errors are logged but don't prevent job fetching
  try {
    await runStaleJobCleanup(cleanupConfig);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[StaleCleanup] Cleanup failed, continuing with job fetch:', message);
  }

  // Step 2: Proceed with normal job fetching
  return fetchAndLockNextJob({ workerId });
}
```

#### Acceptance Criteria
- [ ] `fetchNextJobWithCleanup()` function exported
- [ ] Calls `runStaleJobCleanup()` BEFORE `fetchAndLockNextJob()`
- [ ] Cleanup errors are caught and logged but don't prevent job fetching
- [ ] Returns same `JobQueueResult<TranslationJob | null>` type as `fetchAndLockNextJob`
- [ ] Accepts optional `cleanupConfig` parameter
- [ ] Passes workerId to `fetchAndLockNextJob()`

#### Verification Command
```bash
npx tsc --noEmit src/lib/job-queue/cleanup.ts
```

---

### Task 3.8.5: Update Job Processor to Integrate Cleanup

**File:** `/src/lib/job-queue/job-processor.ts` (modify)
**Estimated Effort:** ~30 minutes
**Dependencies:** Tasks 3.8.1, 3.8.2

#### Description
Modify the `TranslationJobProcessor.runProcessingCycle()` method to run stale job cleanup before picking new jobs.

#### Implementation Steps

1. Add import at top of `job-processor.ts`:
```typescript
import { runStaleJobCleanup, type StaleCleanupResult } from './cleanup';
```

2. Update `ProcessingRunResult` interface (add optional cleanup result):
```typescript
/**
 * Result of a processing run (may process multiple jobs)
 */
export interface ProcessingRunResult {
  startedAt: string;
  completedAt: string;
  jobsProcessed: number;
  jobsSucceeded: number;
  jobsFailed: number;
  results: JobProcessingResult[];
  /** Result of stale job cleanup (if cleanup was run) */
  cleanupResult?: StaleCleanupResult;
}
```

3. Modify `runProcessingCycle()` method in `TranslationJobProcessor` class (around line 710):

```typescript
/**
 * Run a full processing cycle
 *
 * REQ-352: Now runs stale job cleanup BEFORE picking new jobs
 */
async runProcessingCycle(): Promise<ProcessingRunResult> {
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
    // REQ-352: Run stale job cleanup BEFORE picking new jobs
    try {
      cleanupResult = await runStaleJobCleanup({
        staleThresholdMinutes: this.config.lockTimeoutMinutes,
        maxRetryAttempts: 3,
        enableLogging: this.config.enableLogging,
      });

      if (this.config.enableLogging && cleanupResult.staleJobsFound > 0) {
        this.log('info', `Stale cleanup: reset ${cleanupResult.jobsResetToQueued}, failed ${cleanupResult.jobsMarkedFailed}`);
      }
    } catch (cleanupError) {
      const message = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
      this.log('error', 'Stale cleanup failed, continuing:', message);
      // Don't fail the cycle if cleanup fails
    }

    // Process one job per cycle (as specified in requirements)
    const result = await this.processNextJob();

    if (result) {
      results.push(result);
      this.stats.totalJobsProcessed++;
      this.stats.lastProcessedAt = new Date().toISOString();

      if (result.success) {
        this.stats.totalJobsSucceeded++;
        this.stats.consecutiveErrors = 0;
      } else {
        this.stats.totalJobsFailed++;
        this.stats.consecutiveErrors++;
        this.stats.lastErrorMessage = result.errorMessage;

        // Check if we need to pause
        if (this.stats.consecutiveErrors >= this.config.maxConsecutiveErrors) {
          this.log('warn', 'Max consecutive errors reached, pausing...', {
            consecutiveErrors: this.stats.consecutiveErrors,
            pauseDurationMs: this.config.errorPauseDurationMs,
          });

          await this.pauseProcessing();
        }
      }
    } else {
      this.log('debug', 'No jobs available');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.log('error', 'Processing cycle error:', errorMessage);
    this.stats.consecutiveErrors++;
    this.stats.lastErrorMessage = errorMessage;

  } finally {
    this.isProcessing = false;
  }

  const completedAt = new Date().toISOString();

  return {
    startedAt,
    completedAt,
    jobsProcessed: results.length,
    jobsSucceeded: results.filter(r => r.success).length,
    jobsFailed: results.filter(r => !r.success).length,
    results,
    cleanupResult,
  };
}
```

#### Acceptance Criteria
- [ ] Import `runStaleJobCleanup` and `StaleCleanupResult` from `./cleanup`
- [ ] `ProcessingRunResult` interface includes optional `cleanupResult?: StaleCleanupResult`
- [ ] `runProcessingCycle()` calls `runStaleJobCleanup()` BEFORE `processNextJob()`
- [ ] Cleanup uses `this.config.lockTimeoutMinutes` as threshold (consistency)
- [ ] Cleanup uses `this.config.enableLogging` setting
- [ ] Cleanup failures are caught and logged but don't fail the processing cycle
- [ ] Cleanup result is logged when stale jobs are found (with logging enabled)
- [ ] Cleanup result is included in returned `ProcessingRunResult`
- [ ] Existing processing logic unchanged

#### Verification Command
```bash
npx tsc --noEmit src/lib/job-queue/job-processor.ts
npm run build
```

---

### Task 3.8.6: Update Barrel Exports

**File:** `/src/lib/job-queue/index.ts` (modify)
**Estimated Effort:** ~10 minutes
**Dependencies:** Tasks 3.8.1-3.8.4

#### Description
Add exports for the new cleanup module to the job-queue barrel file.

#### Implementation Steps

1. Add cleanup module exports to `/src/lib/job-queue/index.ts`:

```typescript
// Stale job cleanup exports (REQ-352)
export {
  // Main cleanup function
  runStaleJobCleanup,
  // Monitoring functions
  findStaleJobs,
  getStaleJobCount,
  // Integration wrapper
  fetchNextJobWithCleanup,
  // Configuration constants
  DEFAULT_STALE_THRESHOLD_MINUTES,
  DEFAULT_MAX_RETRY_ATTEMPTS,
  DEFAULT_CLEANUP_CONFIG,
} from './cleanup';

// Stale job cleanup types (REQ-352)
export type {
  StaleCleanupConfig,
  StaleCleanupResult,
  StaleJobInfo,
} from './cleanup';
```

2. Ensure the exports are added AFTER the existing concurrency control exports for logical grouping.

#### Acceptance Criteria
- [ ] `runStaleJobCleanup` exported from index
- [ ] `findStaleJobs` exported from index
- [ ] `getStaleJobCount` exported from index
- [ ] `fetchNextJobWithCleanup` exported from index
- [ ] `DEFAULT_STALE_THRESHOLD_MINUTES` exported from index
- [ ] `DEFAULT_MAX_RETRY_ATTEMPTS` exported from index
- [ ] `DEFAULT_CLEANUP_CONFIG` exported from index
- [ ] `StaleCleanupConfig` type exported from index
- [ ] `StaleCleanupResult` type exported from index
- [ ] `StaleJobInfo` type exported from index
- [ ] No duplicate exports (check against existing concurrency-control exports)

#### Verification Command
```bash
npx tsc --noEmit src/lib/job-queue/index.ts
```

---

### Task 3.8.7: Add Unit Tests for Cleanup Module

**File:** `/src/lib/job-queue/__tests__/cleanup.test.ts` (NEW)
**Estimated Effort:** ~60 minutes
**Dependencies:** Tasks 3.8.1-3.8.4

#### Description
Write unit tests for the stale job cleanup functionality covering main scenarios.

#### Implementation Steps

1. Create test file `/src/lib/job-queue/__tests__/cleanup.test.ts`:

```typescript
/**
 * Unit Tests for Stale Job Cleanup Module
 * Part of REQ-352: Implement Stale Job Cleanup for Translation Queue
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  runStaleJobCleanup,
  findStaleJobs,
  getStaleJobCount,
  fetchNextJobWithCleanup,
  DEFAULT_STALE_THRESHOLD_MINUTES,
  DEFAULT_MAX_RETRY_ATTEMPTS,
} from '../cleanup';

// Mock supabaseAdmin
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Mock translation-jobs
vi.mock('../translation-jobs', () => ({
  fetchAndLockNextJob: vi.fn(),
}));

describe('Cleanup Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runStaleJobCleanup', () => {
    it('should return empty result when no stale jobs found', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await runStaleJobCleanup();

      expect(result.staleJobsFound).toBe(0);
      expect(result.jobsResetToQueued).toBe(0);
      expect(result.jobsMarkedFailed).toBe(0);
      expect(result.resetJobIds).toEqual([]);
      expect(result.failedJobIds).toEqual([]);
    });

    it('should reset stale jobs with attempts < max to queued', async () => {
      const staleJob = {
        id: 'job-123',
        entity_type: 'item',
        entity_id: 'entity-456',
        target_language: 'fr',
        attempts: 1, // Less than DEFAULT_MAX_RETRY_ATTEMPTS (3)
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
      };

      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;

      // Mock select (find stale jobs)
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
      });

      // Mock update (reset job)
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      });
      mockFrom().update().eq().eq = vi.fn().mockResolvedValue({ error: null });

      const result = await runStaleJobCleanup({ enableLogging: false });

      expect(result.staleJobsFound).toBe(1);
      expect(result.jobsResetToQueued).toBe(1);
      expect(result.jobsMarkedFailed).toBe(0);
    });

    it('should mark stale jobs with attempts >= max as failed', async () => {
      const staleJob = {
        id: 'job-789',
        entity_type: 'article',
        entity_id: 'entity-012',
        target_language: 'de',
        attempts: 3, // Equals DEFAULT_MAX_RETRY_ATTEMPTS (3)
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      };

      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
      });

      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      });
      mockFrom().update().eq().eq = vi.fn().mockResolvedValue({ error: null });

      const result = await runStaleJobCleanup({ enableLogging: false });

      expect(result.staleJobsFound).toBe(1);
      expect(result.jobsResetToQueued).toBe(0);
      expect(result.jobsMarkedFailed).toBe(1);
    });

    it('should use custom threshold when provided', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;
      const mockLt = vi.fn().mockResolvedValue({ data: [], error: null });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: mockLt,
      });

      await runStaleJobCleanup({ staleThresholdMinutes: 10 });

      expect(mockLt).toHaveBeenCalled();
      // The cutoff should be 10 minutes ago, not 5
      const callArg = mockLt.mock.calls[0][1];
      const cutoffTime = new Date(callArg);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      // Allow 1 second tolerance
      expect(Math.abs(cutoffTime.getTime() - tenMinutesAgo.getTime())).toBeLessThan(1000);
    });

    it('should handle database errors gracefully', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });

      const result = await runStaleJobCleanup({ enableLogging: false });

      expect(result.staleJobsFound).toBe(0);
      expect(result.jobsResetToQueued).toBe(0);
      expect(result.jobsMarkedFailed).toBe(0);
    });
  });

  describe('findStaleJobs', () => {
    it('should return stale job information', async () => {
      const staleJob = {
        id: 'job-001',
        entity_type: 'link',
        entity_id: 'entity-002',
        target_language: 'es',
        attempts: 2,
        started_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(), // 7 min ago
      };

      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [staleJob], error: null }),
      });

      const result = await findStaleJobs();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job-001');
      expect(result[0].entityType).toBe('link');
      expect(result[0].processingDurationMinutes).toBeGreaterThanOrEqual(7);
    });
  });

  describe('getStaleJobCount', () => {
    it('should return count of stale jobs', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ count: 5, error: null }),
      });

      const count = await getStaleJobCount();

      expect(count).toBe(5);
    });
  });

  describe('fetchNextJobWithCleanup', () => {
    it('should run cleanup before fetching job', async () => {
      const { fetchAndLockNextJob } = await import('../translation-jobs');
      const mockFetch = fetchAndLockNextJob as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValue({ success: true, data: null });

      const { supabaseAdmin } = await import('@/lib/supabase');
      const mockFrom = supabaseAdmin.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      await fetchNextJobWithCleanup('worker-1');

      expect(mockFetch).toHaveBeenCalledWith({ workerId: 'worker-1' });
    });
  });

  describe('Default configuration', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_STALE_THRESHOLD_MINUTES).toBe(5);
      expect(DEFAULT_MAX_RETRY_ATTEMPTS).toBe(3);
    });
  });
});
```

#### Acceptance Criteria
- [ ] Test file created at `/src/lib/job-queue/__tests__/cleanup.test.ts`
- [ ] Tests for `runStaleJobCleanup()`:
  - [ ] Empty result when no stale jobs
  - [ ] Reset jobs with attempts < max
  - [ ] Mark as failed for attempts >= max
  - [ ] Custom threshold support
  - [ ] Graceful error handling
- [ ] Tests for `findStaleJobs()`:
  - [ ] Returns stale job info correctly
- [ ] Tests for `getStaleJobCount()`:
  - [ ] Returns correct count
- [ ] Tests for `fetchNextJobWithCleanup()`:
  - [ ] Cleanup runs before fetch
- [ ] Tests for default configuration values
- [ ] All tests pass

#### Verification Command
```bash
npm test -- src/lib/job-queue/__tests__/cleanup.test.ts
```

---

### Task 3.8.8: Update Environment Variables Documentation

**File:** `/.env.example` or project documentation (modify/create if needed)
**Estimated Effort:** ~10 minutes
**Dependencies:** Task 3.8.1

#### Description
Document the new environment variables for stale job cleanup configuration.

#### Implementation Steps

1. Add the following to `.env.example` (or create if doesn't exist):

```bash
# =============================================================================
# Translation Job Queue - Stale Job Cleanup (REQ-352)
# =============================================================================

# Threshold in minutes after which a processing job is considered stale
# Default: 5
# TRANSLATION_STALE_THRESHOLD_MINUTES=5

# Maximum retry attempts before marking a stale job as failed
# Default: 3
# TRANSLATION_MAX_RETRY_ATTEMPTS=3
```

2. If the project has a README or configuration documentation, add a section about these variables.

#### Acceptance Criteria
- [ ] `TRANSLATION_STALE_THRESHOLD_MINUTES` documented with default value
- [ ] `TRANSLATION_MAX_RETRY_ATTEMPTS` documented with default value
- [ ] Clear description of what each variable controls
- [ ] Comments indicate these are optional (defaults are used if not set)

---

## Verification Checklist

### Build Verification
```bash
# TypeScript compilation
npx tsc --noEmit

# Build the project
npm run build
```

### Test Verification
```bash
# Run cleanup module tests
npm test -- src/lib/job-queue/__tests__/cleanup.test.ts

# Run all job-queue tests
npm test -- src/lib/job-queue/
```

### Manual Integration Testing

1. **Create a stale job scenario:**
```sql
-- Insert a job in 'processing' status with old started_at
INSERT INTO translation_jobs (
  id, entity_type, entity_id, source_language, target_language,
  status, attempts, started_at, locked_by, locked_at
) VALUES (
  gen_random_uuid(), 'item', 'test-entity-id', 'en', 'fr',
  'processing', 1, NOW() - INTERVAL '10 minutes', 'test-worker', NOW() - INTERVAL '10 minutes'
);
```

2. **Run cleanup manually:**
```typescript
import { runStaleJobCleanup } from '@/lib/job-queue';

const result = await runStaleJobCleanup({ enableLogging: true });
console.log(result);
// Should show: staleJobsFound: 1, jobsResetToQueued: 1
```

3. **Verify job processor integration:**
   - Start the job processor
   - Observe logs for cleanup messages before job picking

---

## Acceptance Criteria from REQ-352

| AC | Requirement | Task | Verification |
|----|-------------|------|--------------|
| 1 | Cleanup identifies jobs with status 'processing' and started_at > 5 min | 3.8.2 | Query uses `eq('status', 'processing').lt('started_at', cutoffTime)` |
| 2 | Identified stale jobs have status changed to 'queued' | 3.8.2 | Update sets `status: 'queued'` for eligible jobs |
| 3 | Attempt counter is incremented for each reset job | 3.8.2 | Update sets `attempts: (job.attempts || 0) + 1` |
| 4 | Jobs exceeding max retry limit marked as 'failed' | 3.8.2 | Jobs with `attempts >= maxRetryAttempts` get `status: 'failed'` |
| 5 | Cleanup logs number of jobs reset and their IDs | 3.8.2 | `console.log` outputs jobId, entityType, duration for each job |
| 6 | Cleanup runs automatically before each batch picked | 3.8.5 | `runProcessingCycle()` calls `runStaleJobCleanup()` first |
| 7 | Cleanup doesn't block or significantly delay processing | 3.8.5 | Cleanup errors caught, don't prevent job processing |
| 8 | Failed job resets include error message | 3.8.2 | `error_message` field set with context about auto-recovery |
| 9 | Cleanup handles concurrent execution safely | 3.8.2 | Update includes `eq('status', 'processing')` condition |

---

## File Summary

### Files Created
| File | Purpose |
|------|---------|
| `/src/lib/job-queue/cleanup.ts` | Dedicated stale job cleanup module |
| `/src/lib/job-queue/__tests__/cleanup.test.ts` | Unit tests for cleanup module |

### Files Modified
| File | Modification |
|------|--------------|
| `/src/lib/job-queue/index.ts` | Add cleanup module exports |
| `/src/lib/job-queue/job-processor.ts` | Integrate cleanup into processing cycle |
| `/.env.example` | Document new environment variables |

---

## Dependencies Summary

### Upstream Dependencies (Required Before This Task)
- REQ-243: Translation Job Queue Module (`translation-jobs.ts`)
- REQ-244: Background Job Processing (`job-processor.ts`)
- REQ-245: Concurrency Control (`concurrency-control.ts`)

### Downstream Dependencies (Tasks That Need This)
- REQ-332: Create Job Processing API Route (will use cleanup results)
- REQ-334: Implement Job Monitoring Endpoint (will use `getStaleJobCount()`)

---

*Detailed task breakdown generated for FAQBNB Localization Epic 3, Phase 3, Task 3.8*
*Document follows 1-story-point task granularity for AI agent execution*
