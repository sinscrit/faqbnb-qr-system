# REQ-245: Implement Concurrency Control - Implementation Overview

**Generated:** 2026-01-18 13:00:00 UTC
**Last Modified:** 2026-01-18 13:00:00 UTC
**Request Reference:** REQ-245 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.4

---

## Summary

Implement concurrency control mechanisms for the translation job processing system to prevent duplicate job processing and handle stale "processing" jobs that have timed out. This task builds upon the job queue module (REQ-243) and job processor (REQ-244) to ensure robust, production-ready job processing with proper handling of edge cases like worker crashes, network failures, and concurrent processor instances.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **ORM/Client** | @supabase/supabase-js, @supabase/ssr |
| **Server Patterns** | createSupabaseServer() for server-side operations |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Job Queue Module | `/src/lib/job-queue/translation-jobs.ts` | Job fetching with locking, status updates |
| Job Processor | `/src/lib/job-queue/job-processor.ts` | Background processing with polling |
| Database Types | `/src/lib/supabase.ts` | TypeScript database type definitions |
| Admin API Routes | `/src/app/api/admin/accounts/route.ts` | Auth validation, error handling patterns |
| Server-side Supabase | `/src/lib/supabase-server.ts` | `createSupabaseServer()` for server components |

### Database Schema (from REQ-243)

The `translation_jobs` table already includes concurrency-related columns:

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

-- Performance indexes
CREATE INDEX idx_translation_jobs_status ON translation_jobs(status);
CREATE INDEX idx_translation_jobs_locked ON translation_jobs(locked_by, locked_at);
```

### Dependencies (Must Be Complete Before This Task)

| Task | File | Purpose |
|------|------|---------|
| REQ-243 (Task 4.1) | `/src/lib/job-queue/translation-jobs.ts` | Basic `fetchAndLockNextJob()`, `cleanupStaleLocks()` |
| REQ-244 (Task 4.2) | `/src/lib/job-queue/job-processor.ts` | Job processor using locking mechanism |

---

## Architecture

### Concurrency Control Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Concurrency Control System                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  Duplicate Job  │        │   Stale Lock    │        │  Lock Refresh   │
│   Prevention    │        │    Recovery     │        │   (Heartbeat)   │
│                 │        │                 │        │                 │
│ • UNIQUE index  │        │ • 5 min timeout │        │ • Active locks  │
│ • ON CONFLICT   │        │ • Reset to      │        │ • Extend while  │
│ • SELECT FOR    │        │   'queued'      │        │   processing    │
│   UPDATE SKIP   │        │ • Cleanup cron  │        │ • Prevent       │
│   LOCKED        │        │   or on-demand  │        │   timeout       │
└─────────────────┘        └─────────────────┘        └─────────────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
                                      ▼
                          ┌─────────────────────┐
                          │  Monitoring API     │
                          │                     │
                          │  • Stale job count  │
                          │  • Lock statistics  │
                          │  • Processing rate  │
                          └─────────────────────┘
```

### Module Structure Updates

```
/src/lib/job-queue/
├── index.ts                        # Barrel exports (update)
├── translation-jobs.ts             # Job queue module (update)
├── translation-jobs.types.ts       # Type definitions (update)
├── job-processor.ts                # Job processor (update)
└── concurrency-control.ts          # NEW: Concurrency control utilities
```

---

## Integration Contract

### Core Interfaces

```typescript
// /src/lib/job-queue/concurrency-control.ts

import type { SupportedLanguage, EntityType, JobStatus } from './translation-jobs.types';

/**
 * Configuration for concurrency control
 */
export interface ConcurrencyConfig {
  /** Lock timeout in minutes (default: 5) */
  lockTimeoutMinutes: number;
  /** Heartbeat interval in milliseconds (default: 60000 = 1 minute) */
  heartbeatIntervalMs: number;
  /** Enable automatic stale lock cleanup (default: true) */
  autoCleanupEnabled: boolean;
  /** Cleanup check interval in milliseconds (default: 300000 = 5 minutes) */
  cleanupIntervalMs: number;
  /** Maximum retry attempts for stale jobs (default: 3) */
  maxStaleRetries: number;
}

/**
 * Result of stale lock cleanup operation
 */
export interface CleanupResult {
  /** Number of stale jobs found */
  staleJobsFound: number;
  /** Number of jobs reset to queued */
  jobsReset: number;
  /** Number of jobs marked as failed (exceeded retry limit) */
  jobsMarkedFailed: number;
  /** IDs of affected jobs */
  affectedJobIds: string[];
  /** Cleanup timestamp */
  cleanedAt: string;
}

/**
 * Statistics about current lock state
 */
export interface LockStatistics {
  /** Total jobs with active locks */
  activeLocksCount: number;
  /** Jobs with locks older than timeout */
  staleLocksCount: number;
  /** Jobs by worker ID */
  locksByWorker: Record<string, number>;
  /** Average lock duration in milliseconds */
  avgLockDurationMs: number;
  /** Oldest lock timestamp */
  oldestLockAt?: string;
  /** Statistics timestamp */
  generatedAt: string;
}

/**
 * Lock heartbeat result
 */
export interface HeartbeatResult {
  success: boolean;
  jobId: string;
  newLockedAt: string;
  error?: string;
}

/**
 * Duplicate check result
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingJobId?: string;
  existingStatus?: JobStatus;
}
```

### Module Functions

```typescript
// ===========================================================================
// Stale Lock Recovery
// ===========================================================================

/**
 * Clean up stale processing locks and reset jobs to queued status
 *
 * Jobs in 'processing' status with locks older than the timeout are either:
 * 1. Reset to 'queued' status (if attempts < maxStaleRetries)
 * 2. Marked as 'failed' (if attempts >= maxStaleRetries)
 *
 * @param options - Cleanup options
 * @returns Cleanup result with affected job counts
 */
export async function cleanupStaleProcessingJobs(
  options?: {
    lockTimeoutMinutes?: number;
    maxStaleRetries?: number;
  }
): Promise<CleanupResult>;

/**
 * Find jobs with stale processing locks (for monitoring)
 *
 * @param lockTimeoutMinutes - Lock timeout in minutes (default: 5)
 * @returns Array of stale jobs
 */
export async function findStaleProcessingJobs(
  lockTimeoutMinutes?: number
): Promise<TranslationJob[]>;

// ===========================================================================
// Lock Heartbeat (Refresh)
// ===========================================================================

/**
 * Refresh the lock timestamp for an active job
 *
 * This prevents the job from being considered stale while still processing.
 * Call this periodically for long-running translations.
 *
 * @param jobId - Job ID to refresh
 * @param workerId - Worker ID that owns the lock
 * @returns Heartbeat result
 */
export async function refreshJobLock(
  jobId: string,
  workerId: string
): Promise<HeartbeatResult>;

/**
 * Create a lock heartbeat interval for long-running jobs
 *
 * @param jobId - Job ID
 * @param workerId - Worker ID
 * @param intervalMs - Heartbeat interval in milliseconds
 * @returns Cleanup function to stop heartbeat
 */
export function createLockHeartbeat(
  jobId: string,
  workerId: string,
  intervalMs?: number
): () => void;

// ===========================================================================
// Duplicate Prevention
// ===========================================================================

/**
 * Check if a job already exists for the given entity/language combination
 *
 * @param entityType - Entity type
 * @param entityId - Entity ID
 * @param targetLanguage - Target language
 * @returns Duplicate check result
 */
export async function checkForDuplicateJob(
  entityType: EntityType,
  entityId: string,
  targetLanguage: SupportedLanguage
): Promise<DuplicateCheckResult>;

/**
 * Create a job only if no duplicate exists (idempotent creation)
 *
 * Uses INSERT ... ON CONFLICT DO NOTHING for atomic duplicate prevention.
 *
 * @param params - Job creation parameters
 * @returns Created job or null if duplicate exists
 */
export async function createJobIfNotExists(
  params: CreateJobParams
): Promise<JobQueueResult<TranslationJob | null>>;

// ===========================================================================
// Lock Statistics & Monitoring
// ===========================================================================

/**
 * Get current lock statistics for monitoring
 *
 * @returns Lock statistics
 */
export async function getLockStatistics(): Promise<LockStatistics>;

/**
 * Get count of stale locks (for health checks)
 *
 * @param lockTimeoutMinutes - Lock timeout in minutes (default: 5)
 * @returns Count of stale locks
 */
export async function getStaleLocksCount(
  lockTimeoutMinutes?: number
): Promise<number>;

// ===========================================================================
// Automatic Cleanup Manager
// ===========================================================================

/**
 * Concurrency control manager with automatic stale lock cleanup
 */
export class ConcurrencyControlManager {
  constructor(config?: Partial<ConcurrencyConfig>);

  /** Start automatic cleanup interval */
  start(): void;

  /** Stop automatic cleanup */
  stop(): void;

  /** Check if manager is running */
  isRunning(): boolean;

  /** Trigger manual cleanup */
  runCleanup(): Promise<CleanupResult>;

  /** Get lock statistics */
  getStatistics(): Promise<LockStatistics>;

  /** Update configuration */
  updateConfig(config: Partial<ConcurrencyConfig>): void;

  /** Get current configuration */
  getConfig(): ConcurrencyConfig;
}

// Factory and singleton functions
export function createConcurrencyManager(
  config?: Partial<ConcurrencyConfig>
): ConcurrencyControlManager;

export function getConcurrencyManager(): ConcurrencyControlManager;

export function resetConcurrencyManager(): Promise<void>;
```

---

## Implementation Tasks

### Task 4.4.1: Create Type Definitions

**File:** `/src/lib/job-queue/concurrency-control.ts`

Create all TypeScript interfaces for concurrency control:

- `ConcurrencyConfig` - Configuration interface
- `CleanupResult` - Stale cleanup result
- `LockStatistics` - Lock monitoring statistics
- `HeartbeatResult` - Lock refresh result
- `DuplicateCheckResult` - Duplicate check result

**Acceptance Criteria:**
- All types properly defined with JSDoc comments
- Types align with existing job queue types
- Export types from barrel file

### Task 4.4.2: Implement Stale Lock Cleanup

**File:** `/src/lib/job-queue/concurrency-control.ts`

Implement the stale lock detection and cleanup logic:

```typescript
const DEFAULT_LOCK_TIMEOUT_MINUTES = 5;
const DEFAULT_MAX_STALE_RETRIES = 3;

/**
 * Clean up stale processing locks and reset jobs to queued status
 */
export async function cleanupStaleProcessingJobs(
  options?: {
    lockTimeoutMinutes?: number;
    maxStaleRetries?: number;
  }
): Promise<CleanupResult> {
  const supabase = createSupabaseServer();
  const lockTimeoutMinutes = options?.lockTimeoutMinutes ?? DEFAULT_LOCK_TIMEOUT_MINUTES;
  const maxStaleRetries = options?.maxStaleRetries ?? DEFAULT_MAX_STALE_RETRIES;

  const staleThreshold = new Date(
    Date.now() - lockTimeoutMinutes * 60 * 1000
  ).toISOString();

  // Find stale jobs
  const { data: staleJobs, error: findError } = await supabase
    .from('translation_jobs')
    .select('id, attempts')
    .eq('status', 'processing')
    .lt('locked_at', staleThreshold);

  if (findError || !staleJobs) {
    console.error('[ConcurrencyControl] Error finding stale jobs:', findError);
    return {
      staleJobsFound: 0,
      jobsReset: 0,
      jobsMarkedFailed: 0,
      affectedJobIds: [],
      cleanedAt: new Date().toISOString(),
    };
  }

  if (staleJobs.length === 0) {
    return {
      staleJobsFound: 0,
      jobsReset: 0,
      jobsMarkedFailed: 0,
      affectedJobIds: [],
      cleanedAt: new Date().toISOString(),
    };
  }

  const jobsToReset = staleJobs.filter(j => (j.attempts || 0) < maxStaleRetries);
  const jobsToFail = staleJobs.filter(j => (j.attempts || 0) >= maxStaleRetries);
  const affectedJobIds: string[] = [];

  // Reset jobs to queued (can be retried)
  if (jobsToReset.length > 0) {
    const resetIds = jobsToReset.map(j => j.id);
    const { error: resetError } = await supabase
      .from('translation_jobs')
      .update({
        status: 'queued',
        locked_by: null,
        locked_at: null,
        started_at: null,
      })
      .in('id', resetIds);

    if (!resetError) {
      affectedJobIds.push(...resetIds);
      console.info(`[ConcurrencyControl] Reset ${resetIds.length} stale jobs to queued`);
    }
  }

  // Mark jobs as failed (exceeded retry limit)
  if (jobsToFail.length > 0) {
    const failIds = jobsToFail.map(j => j.id);
    const { error: failError } = await supabase
      .from('translation_jobs')
      .update({
        status: 'failed',
        locked_by: null,
        locked_at: null,
        error_message: `Exceeded maximum processing attempts (${maxStaleRetries}). Job timed out multiple times.`,
        completed_at: new Date().toISOString(),
      })
      .in('id', failIds);

    if (!failError) {
      affectedJobIds.push(...failIds);
      console.warn(`[ConcurrencyControl] Marked ${failIds.length} stale jobs as failed (exceeded retries)`);
    }
  }

  return {
    staleJobsFound: staleJobs.length,
    jobsReset: jobsToReset.length,
    jobsMarkedFailed: jobsToFail.length,
    affectedJobIds,
    cleanedAt: new Date().toISOString(),
  };
}

/**
 * Find jobs with stale processing locks (for monitoring)
 */
export async function findStaleProcessingJobs(
  lockTimeoutMinutes: number = DEFAULT_LOCK_TIMEOUT_MINUTES
): Promise<TranslationJob[]> {
  const supabase = createSupabaseServer();
  const staleThreshold = new Date(
    Date.now() - lockTimeoutMinutes * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('translation_jobs')
    .select('*')
    .eq('status', 'processing')
    .lt('locked_at', staleThreshold);

  if (error) {
    console.error('[ConcurrencyControl] Error finding stale jobs:', error);
    return [];
  }

  return (data || []).map(mapDbJobToTranslationJob);
}
```

**Acceptance Criteria:**
- Detects jobs in 'processing' status with locks older than timeout
- Resets jobs with attempts < maxStaleRetries to 'queued'
- Marks jobs with attempts >= maxStaleRetries as 'failed'
- Clears lock metadata (locked_by, locked_at)
- Returns detailed cleanup result
- Proper error handling and logging

### Task 4.4.3: Implement Lock Heartbeat

**File:** `/src/lib/job-queue/concurrency-control.ts`

Implement lock refresh mechanism for long-running jobs:

```typescript
/**
 * Refresh the lock timestamp for an active job
 */
export async function refreshJobLock(
  jobId: string,
  workerId: string
): Promise<HeartbeatResult> {
  const supabase = createSupabaseServer();
  const newLockedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('translation_jobs')
    .update({ locked_at: newLockedAt })
    .eq('id', jobId)
    .eq('locked_by', workerId)
    .eq('status', 'processing')
    .select('id')
    .single();

  if (error || !data) {
    return {
      success: false,
      jobId,
      newLockedAt,
      error: error?.message || 'Job not found or lock not owned by worker',
    };
  }

  return {
    success: true,
    jobId,
    newLockedAt,
  };
}

/**
 * Create a lock heartbeat interval for long-running jobs
 */
export function createLockHeartbeat(
  jobId: string,
  workerId: string,
  intervalMs: number = 60000
): () => void {
  let intervalId: NodeJS.Timeout | null = null;
  let isActive = true;

  const runHeartbeat = async () => {
    if (!isActive) return;

    const result = await refreshJobLock(jobId, workerId);

    if (!result.success) {
      console.warn(`[ConcurrencyControl] Heartbeat failed for job ${jobId}:`, result.error);
      // Stop heartbeat if lock is lost
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };

  intervalId = setInterval(runHeartbeat, intervalMs);

  // Return cleanup function
  return () => {
    isActive = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}
```

**Acceptance Criteria:**
- Updates `locked_at` timestamp only for valid lock owner
- Verifies job is still in 'processing' status
- Returns success/failure with error details
- Heartbeat interval self-terminates if lock is lost
- Returns cleanup function to stop heartbeat

### Task 4.4.4: Implement Duplicate Prevention

**File:** `/src/lib/job-queue/concurrency-control.ts`

Implement duplicate job detection and idempotent creation:

```typescript
/**
 * Check if a job already exists for the given entity/language combination
 */
export async function checkForDuplicateJob(
  entityType: EntityType,
  entityId: string,
  targetLanguage: SupportedLanguage
): Promise<DuplicateCheckResult> {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('translation_jobs')
    .select('id, status')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('target_language', targetLanguage)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('[ConcurrencyControl] Error checking for duplicate:', error);
    return { isDuplicate: false };
  }

  if (data) {
    return {
      isDuplicate: true,
      existingJobId: data.id,
      existingStatus: data.status as JobStatus,
    };
  }

  return { isDuplicate: false };
}

/**
 * Create a job only if no duplicate exists (idempotent creation)
 */
export async function createJobIfNotExists(
  params: CreateJobParams
): Promise<JobQueueResult<TranslationJob | null>> {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('translation_jobs')
    .insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      source_language: params.sourceLanguage || 'en',
      target_language: params.targetLanguage,
      status: 'queued',
      attempts: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Handle unique constraint violation (duplicate exists)
  if (error && error.code === '23505') {
    // PostgreSQL unique violation
    return {
      success: true,
      data: null, // Indicates duplicate exists, nothing created
    };
  }

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: mapDbJobToTranslationJob(data),
  };
}
```

**Acceptance Criteria:**
- Checks for existing job with same entity/language combination
- Returns existing job ID and status if found
- Idempotent creation handles unique constraint gracefully
- Returns null (not error) for duplicates
- Proper error handling for other failures

### Task 4.4.5: Implement Lock Statistics

**File:** `/src/lib/job-queue/concurrency-control.ts`

Implement monitoring and statistics functions:

```typescript
/**
 * Get current lock statistics for monitoring
 */
export async function getLockStatistics(): Promise<LockStatistics> {
  const supabase = createSupabaseServer();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  // Get all processing jobs with locks
  const { data: lockedJobs } = await supabase
    .from('translation_jobs')
    .select('id, locked_by, locked_at')
    .eq('status', 'processing')
    .not('locked_at', 'is', null);

  const jobs = lockedJobs || [];
  const now = Date.now();

  // Calculate statistics
  const locksByWorker: Record<string, number> = {};
  let totalDurationMs = 0;
  let staleCount = 0;
  let oldestLockAt: string | undefined;

  for (const job of jobs) {
    // Count by worker
    if (job.locked_by) {
      locksByWorker[job.locked_by] = (locksByWorker[job.locked_by] || 0) + 1;
    }

    // Calculate lock duration
    if (job.locked_at) {
      const lockTime = new Date(job.locked_at).getTime();
      totalDurationMs += now - lockTime;

      // Check if stale
      if (job.locked_at < fiveMinutesAgo) {
        staleCount++;
      }

      // Track oldest
      if (!oldestLockAt || job.locked_at < oldestLockAt) {
        oldestLockAt = job.locked_at;
      }
    }
  }

  return {
    activeLocksCount: jobs.length,
    staleLocksCount: staleCount,
    locksByWorker,
    avgLockDurationMs: jobs.length > 0 ? Math.round(totalDurationMs / jobs.length) : 0,
    oldestLockAt,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get count of stale locks (for health checks)
 */
export async function getStaleLocksCount(
  lockTimeoutMinutes: number = 5
): Promise<number> {
  const supabase = createSupabaseServer();
  const staleThreshold = new Date(
    Date.now() - lockTimeoutMinutes * 60 * 1000
  ).toISOString();

  const { count } = await supabase
    .from('translation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing')
    .lt('locked_at', staleThreshold);

  return count || 0;
}
```

**Acceptance Criteria:**
- Returns count of active locks
- Returns count of stale locks (older than timeout)
- Groups locks by worker ID
- Calculates average lock duration
- Tracks oldest lock timestamp
- Efficient queries using count and select

### Task 4.4.6: Implement Concurrency Control Manager

**File:** `/src/lib/job-queue/concurrency-control.ts`

Implement the manager class with automatic cleanup:

```typescript
const DEFAULT_CONFIG: ConcurrencyConfig = {
  lockTimeoutMinutes: 5,
  heartbeatIntervalMs: 60000,
  autoCleanupEnabled: true,
  cleanupIntervalMs: 300000, // 5 minutes
  maxStaleRetries: 3,
};

/**
 * Concurrency control manager with automatic stale lock cleanup
 */
export class ConcurrencyControlManager {
  private config: ConcurrencyConfig;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private running = false;

  constructor(config: Partial<ConcurrencyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start automatic cleanup interval
   */
  start(): void {
    if (this.running) {
      console.warn('[ConcurrencyControl] Manager already running');
      return;
    }

    this.running = true;

    if (this.config.autoCleanupEnabled) {
      console.info('[ConcurrencyControl] Starting automatic cleanup', {
        intervalMs: this.config.cleanupIntervalMs,
        lockTimeoutMinutes: this.config.lockTimeoutMinutes,
      });

      // Run initial cleanup
      this.runCleanup();

      // Schedule recurring cleanup
      this.cleanupIntervalId = setInterval(
        () => this.runCleanup(),
        this.config.cleanupIntervalMs
      );
    }
  }

  /**
   * Stop automatic cleanup
   */
  stop(): void {
    this.running = false;

    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }

    console.info('[ConcurrencyControl] Manager stopped');
  }

  /**
   * Check if manager is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Trigger manual cleanup
   */
  async runCleanup(): Promise<CleanupResult> {
    return cleanupStaleProcessingJobs({
      lockTimeoutMinutes: this.config.lockTimeoutMinutes,
      maxStaleRetries: this.config.maxStaleRetries,
    });
  }

  /**
   * Get lock statistics
   */
  async getStatistics(): Promise<LockStatistics> {
    return getLockStatistics();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConcurrencyConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart cleanup interval if changed
    if (config.cleanupIntervalMs && this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = setInterval(
        () => this.runCleanup(),
        this.config.cleanupIntervalMs
      );
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ConcurrencyConfig {
    return { ...this.config };
  }
}

// ===========================================================================
// Factory and Singleton
// ===========================================================================

let globalManager: ConcurrencyControlManager | null = null;

export function createConcurrencyManager(
  config?: Partial<ConcurrencyConfig>
): ConcurrencyControlManager {
  return new ConcurrencyControlManager(config);
}

export function getConcurrencyManager(): ConcurrencyControlManager {
  if (!globalManager) {
    globalManager = createConcurrencyManager();
  }
  return globalManager;
}

export async function resetConcurrencyManager(): Promise<void> {
  if (globalManager) {
    globalManager.stop();
    globalManager = null;
  }
}
```

**Acceptance Criteria:**
- Automatic periodic cleanup of stale locks
- Configurable intervals and thresholds
- Manual cleanup trigger available
- Singleton pattern for global management
- Clean start/stop lifecycle

### Task 4.4.7: Update Job Processor to Use Heartbeat

**File:** `/src/lib/job-queue/job-processor.ts` (modify)

Integrate lock heartbeat into job processing for long translations:

```typescript
import { createLockHeartbeat } from './concurrency-control';

/**
 * Process a single translation job with heartbeat
 */
async function processJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityType, entityId, sourceLanguage, targetLanguage } = job;

  // Start heartbeat to prevent lock timeout during processing
  const stopHeartbeat = createLockHeartbeat(
    job.id,
    config.workerId,
    config.heartbeatIntervalMs || 60000
  );

  try {
    // ... existing processing logic ...

  } catch (error) {
    // ... existing error handling ...

  } finally {
    // Always stop heartbeat when done
    stopHeartbeat();
  }
}
```

**Acceptance Criteria:**
- Heartbeat starts when job processing begins
- Heartbeat stops on success, failure, or exception
- Configurable heartbeat interval
- No resource leaks

### Task 4.4.8: Update Job Queue Module

**File:** `/src/lib/job-queue/translation-jobs.ts` (modify)

Enhance `fetchAndLockNextJob` with improved atomic locking:

```typescript
/**
 * Fetch and lock the next available job using atomic PostgreSQL operation
 *
 * Uses SELECT ... FOR UPDATE SKIP LOCKED for safe concurrent access.
 * Updates status to 'processing' and sets lock metadata.
 */
export async function fetchAndLockNextJob(
  options: FetchJobOptions
): Promise<JobQueueResult<TranslationJob | null>> {
  const supabase = createSupabaseServer();
  const { workerId, lockTimeoutMinutes = 5 } = options;

  // Use RPC for atomic fetch-and-lock
  const { data, error } = await supabase.rpc('fetch_and_lock_translation_job', {
    p_worker_id: workerId,
  });

  if (error) {
    console.error('[JobQueue] Error fetching job:', error);
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: true, data: null };
  }

  return {
    success: true,
    data: mapDbJobToTranslationJob(data[0]),
  };
}
```

And add the corresponding PostgreSQL function (in database migration):

```sql
-- Add to database migration if not exists
CREATE OR REPLACE FUNCTION fetch_and_lock_translation_job(p_worker_id TEXT)
RETURNS SETOF translation_jobs AS $$
DECLARE
  v_job translation_jobs;
BEGIN
  SELECT * INTO v_job
  FROM translation_jobs
  WHERE status = 'queued'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job.id IS NOT NULL THEN
    UPDATE translation_jobs
    SET
      status = 'processing',
      locked_by = p_worker_id,
      locked_at = NOW(),
      started_at = NOW(),
      attempts = attempts + 1
    WHERE id = v_job.id
    RETURNING * INTO v_job;

    RETURN NEXT v_job;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;
```

**Acceptance Criteria:**
- Atomic fetch-and-lock prevents race conditions
- FOR UPDATE SKIP LOCKED prevents blocking
- Sets all lock metadata in single operation
- Increments attempt counter

### Task 4.4.9: Update Barrel Exports

**File:** `/src/lib/job-queue/index.ts` (modify)

Add concurrency control exports:

```typescript
// Concurrency control
export {
  // Functions
  cleanupStaleProcessingJobs,
  findStaleProcessingJobs,
  refreshJobLock,
  createLockHeartbeat,
  checkForDuplicateJob,
  createJobIfNotExists,
  getLockStatistics,
  getStaleLocksCount,
  // Manager
  ConcurrencyControlManager,
  createConcurrencyManager,
  getConcurrencyManager,
  resetConcurrencyManager,
} from './concurrency-control';

// Types
export type {
  ConcurrencyConfig,
  CleanupResult,
  LockStatistics,
  HeartbeatResult,
  DuplicateCheckResult,
} from './concurrency-control';
```

**Acceptance Criteria:**
- All public APIs exported
- Types exported separately
- Clean import path maintained

### Task 4.4.10: Add Database Migration (if needed)

**File:** Database migration

Add the PostgreSQL function for atomic job locking:

```sql
-- Add fetch_and_lock function for atomic job acquisition
CREATE OR REPLACE FUNCTION fetch_and_lock_translation_job(p_worker_id TEXT)
RETURNS SETOF translation_jobs AS $$
DECLARE
  v_job translation_jobs;
BEGIN
  -- Select and lock next queued job
  SELECT * INTO v_job
  FROM translation_jobs
  WHERE status = 'queued'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Update if found
  IF v_job.id IS NOT NULL THEN
    UPDATE translation_jobs
    SET
      status = 'processing',
      locked_by = p_worker_id,
      locked_at = NOW(),
      started_at = NOW(),
      attempts = attempts + 1
    WHERE id = v_job.id
    RETURNING * INTO v_job;

    RETURN NEXT v_job;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Add index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_translation_jobs_processing_locked
ON translation_jobs(status, locked_at)
WHERE status = 'processing';
```

**Acceptance Criteria:**
- Function created with proper error handling
- Uses FOR UPDATE SKIP LOCKED
- Index added for cleanup queries
- Idempotent (IF NOT EXISTS)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/concurrency-control.ts` | Main concurrency control implementation |

### Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/index.ts` | Add concurrency control exports |
| `/src/lib/job-queue/job-processor.ts` | Integrate lock heartbeat |
| `/src/lib/job-queue/translation-jobs.ts` | Enhance fetchAndLockNextJob (optional if using RPC) |

### Database Changes (if applicable)

| Change | Description |
|--------|-------------|
| Add `fetch_and_lock_translation_job` function | Atomic job locking PostgreSQL function |
| Add index on `(status, locked_at)` | Optimize stale job queries |

### Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `cleanupStaleProcessingJobs` | concurrency-control.ts | Reset/fail stale jobs |
| `findStaleProcessingJobs` | concurrency-control.ts | Find stale jobs for monitoring |
| `refreshJobLock` | concurrency-control.ts | Refresh lock timestamp |
| `createLockHeartbeat` | concurrency-control.ts | Create heartbeat interval |
| `checkForDuplicateJob` | concurrency-control.ts | Check for existing job |
| `createJobIfNotExists` | concurrency-control.ts | Idempotent job creation |
| `getLockStatistics` | concurrency-control.ts | Get lock monitoring data |
| `getStaleLocksCount` | concurrency-control.ts | Get stale lock count |
| `ConcurrencyControlManager` | concurrency-control.ts | Manager class |
| `createConcurrencyManager` | concurrency-control.ts | Factory function |
| `getConcurrencyManager` | concurrency-control.ts | Singleton accessor |
| `resetConcurrencyManager` | concurrency-control.ts | Reset singleton |

---

## Dependencies

### Prerequisites (Must Be Completed First)

1. **REQ-243 (Task 4.1):** Job queue module
   - `fetchAndLockNextJob()` function (will be enhanced)
   - `TranslationJob` type
   - `locked_by`, `locked_at` columns in database

2. **REQ-244 (Task 4.2):** Job processor
   - `TranslationJobProcessor` class
   - `processJob()` function

3. **Task 1.1:** Database migration
   - `translation_jobs` table with lock columns

### Downstream Dependencies (Tasks That Depend on This)

1. **Task 4.5:** Job status API endpoint (can use statistics functions)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Lock timeout | 5 minutes default | Balance between slow translations and quick recovery |
| Stale retry limit | 3 attempts | Prevent infinite retry loops |
| Heartbeat interval | 1 minute default | Less than lock timeout, frequent enough to prevent false stale |
| Locking mechanism | PostgreSQL FOR UPDATE SKIP LOCKED | Database-native, no external dependencies |
| Cleanup trigger | Periodic + on-demand | Automatic recovery + manual intervention option |
| Duplicate handling | Unique constraint + soft check | Database enforces uniqueness, app can check proactively |

---

## Testing Considerations

### Unit Tests

Create `/src/lib/job-queue/__tests__/concurrency-control.test.ts`:

- `cleanupStaleProcessingJobs`: Test reset and fail paths
- `refreshJobLock`: Test valid and invalid worker scenarios
- `checkForDuplicateJob`: Test duplicate and non-duplicate cases
- `createJobIfNotExists`: Test new creation and duplicate handling
- `getLockStatistics`: Test statistics calculation
- `ConcurrencyControlManager`: Test start/stop lifecycle

### Integration Tests

- Simulate multiple workers competing for same job
- Verify only one worker processes each job
- Test stale cleanup with actual database
- Test heartbeat prevents stale detection

### Edge Cases

- Worker crashes mid-processing (lock becomes stale)
- Clock skew between workers
- Cleanup runs while job completes normally
- Heartbeat fails but job completes
- Database connection lost during lock operation
- Concurrent cleanup operations

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Clock skew between workers | Low | Medium | Use database timestamps, not local time |
| Cleanup resets completing job | Low | Medium | Cleanup window < processing time |
| Lost heartbeat causes false stale | Medium | Low | Heartbeat interval << lock timeout |
| Race condition in cleanup | Low | Medium | Use atomic operations, idempotent updates |
| Excessive cleanup queries | Low | Low | Configurable interval, efficient indexes |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| 4.4.1: Type definitions | Small | High |
| 4.4.2: Stale lock cleanup | Small | High |
| 4.4.3: Lock heartbeat | Small | High |
| 4.4.4: Duplicate prevention | Small | High |
| 4.4.5: Lock statistics | Small | High |
| 4.4.6: Manager class | Medium | High |
| 4.4.7: Processor integration | Small | High |
| 4.4.8: Job queue update | Small | Medium |
| 4.4.9: Barrel exports | Trivial | High |
| 4.4.10: Database migration | Small | High |
| **Total** | **Medium** | High |

---

## Usage Examples

### Starting Concurrency Control

```typescript
import {
  getConcurrencyManager,
  startJobProcessor
} from '@/lib/job-queue';

// Start concurrency manager (automatic stale cleanup)
getConcurrencyManager().start();

// Start job processor (will benefit from cleanup)
startJobProcessor();
```

### Manual Stale Cleanup

```typescript
import { cleanupStaleProcessingJobs } from '@/lib/job-queue';

// Manual cleanup (e.g., from admin API)
const result = await cleanupStaleProcessingJobs({
  lockTimeoutMinutes: 5,
  maxStaleRetries: 3,
});

console.log(`Reset ${result.jobsReset} jobs, failed ${result.jobsMarkedFailed}`);
```

### Checking for Duplicates

```typescript
import { checkForDuplicateJob, createJobIfNotExists } from '@/lib/job-queue';

// Check first
const { isDuplicate, existingStatus } = await checkForDuplicateJob(
  'article',
  articleId,
  'fr'
);

if (isDuplicate && existingStatus === 'completed') {
  // Already translated
  return;
}

// Or use idempotent creation
const { data: job } = await createJobIfNotExists({
  entityType: 'article',
  entityId: articleId,
  targetLanguage: 'fr',
});

if (job === null) {
  // Duplicate exists, nothing created
}
```

### Monitoring Lock Health

```typescript
import {
  getLockStatistics,
  getStaleLocksCount
} from '@/lib/job-queue';

// Health check
const staleCount = await getStaleLocksCount(5);
if (staleCount > 10) {
  console.warn('High number of stale locks detected');
}

// Detailed statistics
const stats = await getLockStatistics();
console.log(`Active locks: ${stats.activeLocksCount}`);
console.log(`Stale locks: ${stats.staleLocksCount}`);
console.log(`Average duration: ${stats.avgLockDurationMs}ms`);
```

---

## Acceptance Criteria Verification

| Criteria (from Task 4.4) | Implementation Verification |
|--------------------------|----------------------------|
| Prevent duplicate job processing | UNIQUE constraint on `(entity_type, entity_id, target_language)`; `SELECT FOR UPDATE SKIP LOCKED`; `checkForDuplicateJob()` function |
| Handle stale "processing" jobs (timeout after 5 min) | `cleanupStaleProcessingJobs()` with configurable timeout; automatic cleanup via `ConcurrencyControlManager`; jobs reset to 'queued' or marked 'failed' |

---

## References

- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (Phase 4, Task 4.4)
- Job Queue Module: REQ-243 (`/docs/REQ-243-create-translation-job-queue-module-overview.md`)
- Job Processor: REQ-244 (`/docs/REQ-244-implement-job-processor-overview.md`)
- PostgreSQL FOR UPDATE: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE
- Supabase RPC: https://supabase.com/docs/guides/database/functions

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.4*
