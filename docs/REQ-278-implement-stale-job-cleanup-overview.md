# REQ-278: Implement Stale Job Cleanup for Translation Queue - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-278
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.8
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

---

## 1. Summary

This document provides the technical implementation breakdown for implementing automatic stale job cleanup in the translation queue. The system must detect translation jobs that remain stuck in "processing" status beyond 5 minutes and recover them by resetting their status to "queued" with incremented attempt counters. Jobs exceeding the maximum retry threshold are marked as "failed" to prevent infinite retry loops.

---

## 2. Current Behavior

Translation jobs that encounter unexpected interruptions during processing (such as process crashes, network timeouts, or server restarts) remain indefinitely in the "processing" status. These stale jobs:
- Are never completed and never retried
- Create orphaned work items blocking progress
- Prevent content from being translated
- Have no mechanism for automatic detection or recovery

---

## 3. Expected Behavior

Before the job picker selects new translation jobs for processing, the system runs a cleanup operation that:
1. Identifies all jobs in "processing" status for more than 5 minutes
2. Increments the attempt counter for each stale job
3. Resets job status from "processing" to "queued" (if under max attempts)
4. Marks jobs as "failed" if they exceed the maximum retry threshold
5. Logs each recovery action for monitoring and debugging

---

## 4. Technical Approach

### 4.1 Architecture Overview

```
Job Picker Flow (Enhanced)
    │
    ├── 1. Run cleanupStaleJobs() BEFORE picking new jobs
    │       │
    │       ├── Query: SELECT * FROM translation_jobs
    │       │          WHERE status = 'processing'
    │       │          AND started_at < NOW() - INTERVAL '5 minutes'
    │       │
    │       ├── For each stale job:
    │       │   │
    │       │   ├── IF attempts < MAX_ATTEMPTS:
    │       │   │   │
    │       │   │   └── UPDATE SET status = 'queued',
    │       │   │               attempts = attempts + 1,
    │       │   │               started_at = NULL,
    │       │   │               error_message = 'Reset: stale processing'
    │       │   │
    │       │   └── IF attempts >= MAX_ATTEMPTS:
    │       │       │
    │       │       └── UPDATE SET status = 'failed',
    │       │                   completed_at = NOW(),
    │       │                   error_message = 'Max retry attempts exceeded'
    │       │
    │       └── Log cleanup results
    │
    └── 2. Pick new jobs to process (existing logic)
```

### 4.2 Database Query Strategy

The cleanup operation uses the existing `idx_translation_jobs_stale` index defined in the implementation plan:

```sql
-- Index for fast stale job lookup (defined in Plan-111)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

### 4.3 Configuration Strategy

Following the existing codebase pattern from `/src/lib/config.ts`, configuration values use a priority chain:

```typescript
// Priority: Environment variable > Default constant
const STALE_JOB_THRESHOLD_MINUTES = parseInt(
  process.env.TRANSLATION_STALE_THRESHOLD_MINUTES || '5',
  10
);

const MAX_RETRY_ATTEMPTS = parseInt(
  process.env.TRANSLATION_MAX_RETRY_ATTEMPTS || '3',
  10
);
```

---

## 5. Implementation Tasks

### Task 5.1: Create Cleanup Types and Interfaces
**File:** `/src/lib/job-queue/cleanup.types.ts`

Define TypeScript interfaces following the pattern from `/src/lib/email-service.ts`:

```typescript
export interface CleanupConfig {
  /** Time in minutes before a processing job is considered stale (default: 5) */
  staleThresholdMinutes?: number;
  /** Maximum retry attempts before marking as failed (default: 3) */
  maxRetryAttempts?: number;
  /** Run in dry-run mode without making changes (default: false) */
  dryRun?: boolean;
}

export interface CleanupResult {
  success: boolean;
  totalStaleJobs: number;
  jobsRequeued: number;
  jobsMarkedFailed: number;
  errors: CleanupError[];
  durationMs: number;
  timestamp: string;
}

export interface CleanupError {
  jobId: string;
  entityType: string;
  error: string;
  timestamp: string;
}

export interface StaleJobInfo {
  id: string;
  entityType: string;
  entityId: string;
  attempts: number;
  startedAt: string;
  processingDurationMinutes: number;
}
```

### Task 5.2: Implement Stale Job Detection Function
**File:** `/src/lib/job-queue/cleanup.ts`

```typescript
/**
 * Identifies translation jobs stuck in 'processing' status beyond threshold
 * @param thresholdMinutes - Minutes before a job is considered stale (default: 5)
 * @returns Array of stale job information
 */
export async function findStaleJobs(
  thresholdMinutes: number = 5
): Promise<StaleJobInfo[]>
```

**Implementation Details:**
- Query translation_jobs table using `idx_translation_jobs_stale` index
- Filter: `status = 'processing' AND started_at < NOW() - INTERVAL '{thresholdMinutes} minutes'`
- Calculate processing duration for logging
- Return structured StaleJobInfo objects

### Task 5.3: Implement Job Reset Function
**File:** `/src/lib/job-queue/cleanup.ts`

```typescript
/**
 * Resets a stale job to queued status with incremented attempts
 * @param jobId - ID of the job to reset
 * @returns Updated job record or null if max attempts exceeded
 */
export async function resetStaleJob(
  jobId: string
): Promise<TranslationJob | null>
```

**Implementation Details:**
- Increment attempts counter
- Reset status to 'queued'
- Clear started_at timestamp
- Add error_message with reset reason and timestamp
- Return updated job or null

### Task 5.4: Implement Job Failure Function
**File:** `/src/lib/job-queue/cleanup.ts`

```typescript
/**
 * Marks a job as failed when max retry attempts exceeded
 * @param jobId - ID of the job to mark as failed
 * @param reason - Failure reason for error_message field
 * @returns Updated job record
 */
export async function markJobAsFailed(
  jobId: string,
  reason: string
): Promise<TranslationJob>
```

**Implementation Details:**
- Update status to 'failed'
- Set completed_at to current timestamp
- Set error_message with max attempts exceeded message
- Include original failure context in metadata

### Task 5.5: Implement Main Cleanup Orchestrator
**File:** `/src/lib/job-queue/cleanup.ts`

```typescript
/**
 * Main cleanup function - identifies and recovers stale translation jobs
 * Should be called before job picker selects new jobs
 * @param config - Optional cleanup configuration
 * @returns CleanupResult with statistics
 */
export async function cleanupStaleJobs(
  config?: CleanupConfig
): Promise<CleanupResult>
```

**Implementation Details:**
- Load configuration from environment variables with defaults
- Execute within database transaction for consistency
- Call findStaleJobs() to identify candidates
- For each stale job:
  - Check if attempts < maxRetryAttempts
  - If yes: call resetStaleJob()
  - If no: call markJobAsFailed()
- Log each recovery action with structured logging
- Return comprehensive CleanupResult

### Task 5.6: Implement Transaction Wrapper
**File:** `/src/lib/job-queue/cleanup.ts`

```typescript
/**
 * Executes cleanup operation within a database transaction
 * Ensures consistency when processing multiple stale jobs
 */
async function executeCleanupTransaction(
  staleJobs: StaleJobInfo[],
  maxRetryAttempts: number
): Promise<{ requeued: number; failed: number; errors: CleanupError[] }>
```

**Implementation Details:**
- Use Supabase transaction support or sequential operations with error handling
- Process jobs in batches to avoid long-running transactions
- Collect errors without stopping on individual failures
- Return aggregate results

### Task 5.7: Add Logging Support
**File:** `/src/lib/job-queue/cleanup.ts`

Following the existing logging pattern with `[CleanupService]` prefix:

```typescript
/**
 * Logs cleanup operation details
 */
function logCleanupAction(
  action: 'requeue' | 'fail' | 'error',
  job: StaleJobInfo,
  details?: string
): void
```

**Log Format Examples:**
```
[CleanupService] Requeued stale job job-abc-123 (item, processing for 7 min, attempt 2/3)
[CleanupService] Failed job job-def-456 (article, exceeded max attempts: 3)
[CleanupService] Cleanup completed: 5 requeued, 1 failed, 0 errors (42ms)
```

### Task 5.8: Integrate with Job Picker
**File:** `/src/lib/job-queue/translation-jobs.ts`

Modify the job picker function to call cleanup before selecting new jobs:

```typescript
export async function pickNextTranslationJob(): Promise<TranslationJob | null> {
  // Step 1: Run stale job cleanup
  const cleanupResult = await cleanupStaleJobs();
  if (cleanupResult.totalStaleJobs > 0) {
    console.log(`[JobQueue] Cleanup recovered ${cleanupResult.jobsRequeued} stale jobs`);
  }

  // Step 2: Pick next job (existing logic)
  // ...
}
```

### Task 5.9: Export Module Functions
**File:** `/src/lib/job-queue/index.ts`

Update module exports to include cleanup functions:

```typescript
// Cleanup utilities
export {
  cleanupStaleJobs,
  findStaleJobs,
  resetStaleJob,
  markJobAsFailed
} from './cleanup';

export type {
  CleanupConfig,
  CleanupResult,
  CleanupError,
  StaleJobInfo
} from './cleanup.types';
```

### Task 5.10: Add Configuration Documentation
**File:** `/docs/configuration.md` (or README.md)

Document the environment variables:

```markdown
## Translation Job Cleanup Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TRANSLATION_STALE_THRESHOLD_MINUTES` | `5` | Minutes before a processing job is considered stale |
| `TRANSLATION_MAX_RETRY_ATTEMPTS` | `3` | Maximum retry attempts before marking job as failed |
```

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/cleanup.ts` | Main cleanup utility implementation |
| `/src/lib/job-queue/cleanup.types.ts` | TypeScript interfaces for cleanup operations |

### 6.2 Files to Modify

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/job-queue/index.ts` | Module exports | Add cleanup function exports |
| `/src/lib/job-queue/translation-jobs.ts` | `pickNextTranslationJob()` | Call `cleanupStaleJobs()` before job selection |

### 6.3 Database Objects

| Object | Type | Modification |
|--------|------|--------------|
| `translation_jobs` | Table | Use existing schema (no changes needed) |
| `idx_translation_jobs_stale` | Index | Ensure index exists (created in foundation) |

---

## 7. Dependencies

### 7.1 Prerequisites (Must Be Implemented First)

| Requirement | Description | Status |
|-------------|-------------|--------|
| REQ-243 | Translation Job Queue Module (types, basic functions) | Required |
| Translation jobs table | Database schema with status, attempts, started_at columns | From Epic 1 |
| `idx_translation_jobs_stale` index | Fast lookup of stale processing jobs | From Plan-111 |

### 7.2 Related Requirements

| Requirement | Description | Relationship |
|-------------|-------------|--------------|
| REQ-276 | Job Prioritization | Can work in parallel |
| REQ-277 | Concurrency Control | Can work in parallel |
| REQ-271 | Job Processor Enhancement | Cleanup integrates with processor |

---

## 8. Database Operations

### 8.1 Query: Find Stale Jobs

```sql
SELECT
  id,
  entity_type,
  entity_id,
  attempts,
  started_at,
  EXTRACT(EPOCH FROM (NOW() - started_at)) / 60 AS processing_duration_minutes
FROM translation_jobs
WHERE status = 'processing'
  AND started_at < NOW() - INTERVAL '5 minutes'
ORDER BY started_at ASC;
```

### 8.2 Update: Reset Stale Job to Queued

```sql
UPDATE translation_jobs
SET
  status = 'queued',
  attempts = attempts + 1,
  started_at = NULL,
  error_message = 'Reset: stale processing after ' || $1 || ' minutes (attempt ' || (attempts + 1) || ')'
WHERE id = $2
RETURNING *;
```

### 8.3 Update: Mark Job as Failed

```sql
UPDATE translation_jobs
SET
  status = 'failed',
  completed_at = NOW(),
  error_message = 'Max retry attempts exceeded (' || $1 || ' attempts). Last error: stale processing.'
WHERE id = $2
RETURNING *;
```

---

## 9. Error Handling

### 9.1 Error Classification

Following the pattern from `/src/lib/error-utils.ts`:

| Error Type | Severity | Action |
|------------|----------|--------|
| Database connection failure | High | Skip cleanup, continue to job picker |
| Individual job update failure | Medium | Log error, continue with other jobs |
| Configuration parse error | Low | Use default values, log warning |

### 9.2 Graceful Degradation

If cleanup fails completely:
- Log error with `console.error('[CleanupService] Cleanup failed: ...')`
- Return CleanupResult with `success: false` and error details
- Job picker continues normally (cleanup is not blocking)

---

## 10. Testing Strategy

### 10.1 Unit Tests
**File:** `/src/lib/job-queue/__tests__/cleanup.test.ts`

| Test Case | Description |
|-----------|-------------|
| `findStaleJobs returns empty array when no stale jobs` | Happy path - no stale jobs |
| `findStaleJobs identifies jobs processing > 5 minutes` | Core detection logic |
| `resetStaleJob increments attempts and resets status` | Reset flow validation |
| `markJobAsFailed sets status and completed_at` | Failure flow validation |
| `cleanupStaleJobs requeues jobs under max attempts` | Integration of reset |
| `cleanupStaleJobs fails jobs at max attempts` | Integration of failure marking |
| `cleanupStaleJobs handles empty result set` | Edge case |
| `cleanupStaleJobs respects custom configuration` | Config override |

### 10.2 Integration Tests

| Test Case | Description |
|-----------|-------------|
| `Cleanup runs before job picker selects jobs` | Integration with job picker |
| `Requeued jobs are picked up by job processor` | End-to-end recovery |
| `Failed jobs are not picked up again` | Failure state is terminal |

---

## 11. Acceptance Criteria Mapping

| Acceptance Criterion | Implementation Task |
|----------------------|---------------------|
| Cleanup utility identifies jobs in processing > 5 minutes | Task 5.2 |
| Cleanup increments attempt counter for stale jobs | Task 5.3 |
| Cleanup resets status from processing to queued | Task 5.3 |
| Cleanup logs each recovered job with details | Task 5.7 |
| Jobs exceeding max attempts are marked as failed | Task 5.4 |
| Job picker calls cleanup before selecting new jobs | Task 5.8 |
| Cleanup executes within database transaction | Task 5.6 |
| 5-minute threshold is configurable via environment | Task 5.5 |
| Max retry threshold is configurable via environment | Task 5.5 |
| Cleanup utility is at `/src/lib/job-queue/cleanup.ts` | Task 5.5 |
| Cleanup utility is exported and importable | Task 5.9 |
| Uses database timestamps for accurate duration calculation | Task 5.2 |
| Cleanup completes efficiently without blocking job picker | Task 5.5 |
| Failed jobs include error metadata about max attempts | Task 5.4 |

---

## 12. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cleanup blocks job picker on slow database | Low | Medium | Add timeout, async execution |
| Race condition with job processor | Low | Low | Transaction isolation, row locking |
| Aggressive cleanup resets legitimate long jobs | Low | Medium | 5-minute threshold is conservative |
| Configuration misconfiguration | Low | Low | Sensible defaults, validation |

---

## 13. Sequence Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Job Picker │     │ Cleanup Service  │     │   Database   │
└──────┬──────┘     └────────┬─────────┘     └──────┬───────┘
       │                      │                      │
       │ pickNextJob()        │                      │
       │─────────────────────>│                      │
       │                      │                      │
       │                      │ findStaleJobs()      │
       │                      │─────────────────────>│
       │                      │                      │
       │                      │ <─ stale jobs list ──│
       │                      │                      │
       │                      │                      │
       │           ┌──────────┴──────────┐           │
       │           │ For each stale job  │           │
       │           └──────────┬──────────┘           │
       │                      │                      │
       │                      │ [attempts < 3]       │
       │                      │ resetStaleJob()      │
       │                      │─────────────────────>│
       │                      │                      │
       │                      │ [attempts >= 3]      │
       │                      │ markJobAsFailed()    │
       │                      │─────────────────────>│
       │                      │                      │
       │                      │ logCleanupAction()   │
       │                      │                      │
       │<─ CleanupResult ─────│                      │
       │                      │                      │
       │ [Continue to pick new jobs]                 │
       │─────────────────────────────────────────────>
       │                      │                      │
```

---

## 14. Implementation Order

1. **Task 5.1:** Create types and interfaces (foundation)
2. **Task 5.2:** Implement stale job detection (core query)
3. **Task 5.3:** Implement job reset function
4. **Task 5.4:** Implement job failure function
5. **Task 5.6:** Implement transaction wrapper
6. **Task 5.7:** Add logging support
7. **Task 5.5:** Implement main cleanup orchestrator (combines all)
8. **Task 5.8:** Integrate with job picker
9. **Task 5.9:** Export module functions
10. **Task 5.10:** Add configuration documentation

---

## 15. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.8)
- Request Document: `/docs/gen_requests_epic3.md` (REQ-278)
- Database Schema: `/database/migrations/20260117_l10n_foundation.sql`
- Error Handling Pattern: `/src/lib/error-utils.ts`
- Logging Pattern: `/src/lib/email-service.ts`
- Configuration Pattern: `/src/lib/config.ts`
