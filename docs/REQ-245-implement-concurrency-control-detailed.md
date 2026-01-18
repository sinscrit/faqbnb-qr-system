# REQ-245: Implement Concurrency Control - Detailed Task Breakdown

**Generated:** 2026-01-18 13:30:00 UTC
**Last Modified:** 2026-01-18 13:30:00 UTC
**Overview Reference:** `/docs/REQ-245-implement-concurrency-control-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.4

---

## Document Purpose

This document provides a granular, step-by-step implementation guide for REQ-245: Implement Concurrency Control. Each task is designed to be approximately 1 story point and can be executed independently with clear verification steps.

---

## Prerequisites

Before starting this task, ensure the following are complete:

| Prerequisite | Task Reference | Verification |
|--------------|----------------|--------------|
| Job queue module created | REQ-243 (Task 4.1) | File exists: `/src/lib/job-queue/translation-jobs.ts` |
| Job processor implemented | REQ-244 (Task 4.2) | File exists: `/src/lib/job-queue/job-processor.ts` |
| Database migration applied | Task 1.1 | `translation_jobs` table exists with `locked_by`, `locked_at` columns |
| TypeScript types defined | REQ-243 | `TranslationJob` type exported from job-queue module |

---

## Task Breakdown

### Task 4.4.1: Create Concurrency Control Type Definitions

**Objective:** Define all TypeScript interfaces needed for concurrency control functionality.

**File:** `/src/lib/job-queue/concurrency-control.ts` (new file)

**Steps:**

1. Create the new file `/src/lib/job-queue/concurrency-control.ts`

2. Add necessary imports at the top:
   ```typescript
   import type { SupportedLanguage, EntityType, JobStatus, TranslationJob, CreateJobParams, JobQueueResult } from './translation-jobs.types';
   import { createSupabaseServer } from '@/lib/supabase-server';
   ```

3. Define `ConcurrencyConfig` interface:
   ```typescript
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
   ```

4. Define `CleanupResult` interface:
   ```typescript
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
   ```

5. Define `LockStatistics` interface:
   ```typescript
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
   ```

6. Define `HeartbeatResult` interface:
   ```typescript
   /**
    * Lock heartbeat result
    */
   export interface HeartbeatResult {
     success: boolean;
     jobId: string;
     newLockedAt: string;
     error?: string;
   }
   ```

7. Define `DuplicateCheckResult` interface:
   ```typescript
   /**
    * Duplicate check result
    */
   export interface DuplicateCheckResult {
     isDuplicate: boolean;
     existingJobId?: string;
     existingStatus?: JobStatus;
   }
   ```

8. Add default configuration constants:
   ```typescript
   export const DEFAULT_LOCK_TIMEOUT_MINUTES = 5;
   export const DEFAULT_HEARTBEAT_INTERVAL_MS = 60000;
   export const DEFAULT_CLEANUP_INTERVAL_MS = 300000;
   export const DEFAULT_MAX_STALE_RETRIES = 3;

   export const DEFAULT_CONCURRENCY_CONFIG: ConcurrencyConfig = {
     lockTimeoutMinutes: DEFAULT_LOCK_TIMEOUT_MINUTES,
     heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
     autoCleanupEnabled: true,
     cleanupIntervalMs: DEFAULT_CLEANUP_INTERVAL_MS,
     maxStaleRetries: DEFAULT_MAX_STALE_RETRIES,
   };
   ```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All interfaces have JSDoc comments
- [ ] Default constants are exported
- [ ] Imports resolve correctly (may need to create stub types if dependencies don't exist yet)

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.2: Implement Stale Lock Cleanup Function

**Objective:** Create the `cleanupStaleProcessingJobs` function to detect and reset stale processing jobs.

**File:** `/src/lib/job-queue/concurrency-control.ts` (append to existing file)

**Steps:**

1. Add the helper function to map database rows (if not already available from translation-jobs.ts):
   ```typescript
   // Import or define mapDbJobToTranslationJob
   import { mapDbJobToTranslationJob } from './translation-jobs';
   ```

2. Implement `cleanupStaleProcessingJobs` function:
   ```typescript
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
       } else {
         console.error('[ConcurrencyControl] Error resetting stale jobs:', resetError);
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
       } else {
         console.error('[ConcurrencyControl] Error marking jobs as failed:', failError);
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
   ```

3. Implement `findStaleProcessingJobs` function for monitoring:
   ```typescript
   /**
    * Find jobs with stale processing locks (for monitoring)
    *
    * @param lockTimeoutMinutes - Lock timeout in minutes (default: 5)
    * @returns Array of stale jobs
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

**Verification:**
- [ ] Function compiles without errors
- [ ] Stale jobs with attempts < 3 are reset to 'queued'
- [ ] Stale jobs with attempts >= 3 are marked as 'failed'
- [ ] Lock metadata (locked_by, locked_at) is cleared on both reset and fail
- [ ] Returns accurate counts in CleanupResult
- [ ] Console logging provides visibility into cleanup actions

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.3: Implement Lock Heartbeat Functions

**Objective:** Create lock refresh mechanism to prevent long-running jobs from being incorrectly marked as stale.

**File:** `/src/lib/job-queue/concurrency-control.ts` (append to existing file)

**Steps:**

1. Implement `refreshJobLock` function:
   ```typescript
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
   ```

2. Implement `createLockHeartbeat` function:
   ```typescript
   /**
    * Create a lock heartbeat interval for long-running jobs
    *
    * @param jobId - Job ID
    * @param workerId - Worker ID
    * @param intervalMs - Heartbeat interval in milliseconds (default: 60000)
    * @returns Cleanup function to stop heartbeat
    */
   export function createLockHeartbeat(
     jobId: string,
     workerId: string,
     intervalMs: number = DEFAULT_HEARTBEAT_INTERVAL_MS
   ): () => void {
     let intervalId: NodeJS.Timeout | null = null;
     let isActive = true;

     const runHeartbeat = async () => {
       if (!isActive) return;

       try {
         const result = await refreshJobLock(jobId, workerId);

         if (!result.success) {
           console.warn(`[ConcurrencyControl] Heartbeat failed for job ${jobId}:`, result.error);
           // Stop heartbeat if lock is lost
           if (intervalId) {
             clearInterval(intervalId);
             intervalId = null;
           }
         }
       } catch (error) {
         console.error(`[ConcurrencyControl] Heartbeat error for job ${jobId}:`, error);
       }
     };

     // Run first heartbeat immediately, then on interval
     runHeartbeat();
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

**Verification:**
- [ ] `refreshJobLock` only updates if job exists with matching worker ID and is in 'processing' status
- [ ] `refreshJobLock` returns failure result if lock is lost
- [ ] `createLockHeartbeat` runs first heartbeat immediately
- [ ] `createLockHeartbeat` continues at specified interval
- [ ] Cleanup function stops the interval
- [ ] Heartbeat auto-stops if lock refresh fails

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.4: Implement Duplicate Prevention Functions

**Objective:** Create functions to check for and prevent duplicate job creation.

**File:** `/src/lib/job-queue/concurrency-control.ts` (append to existing file)

**Steps:**

1. Implement `checkForDuplicateJob` function:
   ```typescript
   /**
    * Check if a job already exists for the given entity/language combination
    *
    * @param entityType - Entity type (article, item, link, tag)
    * @param entityId - Entity ID
    * @param targetLanguage - Target language
    * @returns Duplicate check result
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

     // PGRST116 = no rows returned (not an error for our case)
     if (error && error.code !== 'PGRST116') {
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
   ```

2. Implement `createJobIfNotExists` function:
   ```typescript
   /**
    * Create a job only if no duplicate exists (idempotent creation)
    *
    * Uses INSERT with conflict handling for atomic duplicate prevention.
    * Returns null if a duplicate exists (not an error condition).
    *
    * @param params - Job creation parameters
    * @returns Created job or null if duplicate exists
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
     // PostgreSQL unique violation code is '23505'
     if (error && error.code === '23505') {
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

**Verification:**
- [ ] `checkForDuplicateJob` returns `isDuplicate: true` when job exists
- [ ] `checkForDuplicateJob` returns existing job ID and status
- [ ] `checkForDuplicateJob` returns `isDuplicate: false` when no job exists
- [ ] `createJobIfNotExists` creates job when none exists
- [ ] `createJobIfNotExists` returns `null` data (not error) when duplicate exists
- [ ] Handles PostgreSQL unique constraint violation gracefully

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.5: Implement Lock Statistics Functions

**Objective:** Create monitoring functions to track lock health and statistics.

**File:** `/src/lib/job-queue/concurrency-control.ts` (append to existing file)

**Steps:**

1. Implement `getLockStatistics` function:
   ```typescript
   /**
    * Get current lock statistics for monitoring
    *
    * @returns Lock statistics
    */
   export async function getLockStatistics(): Promise<LockStatistics> {
     const supabase = createSupabaseServer();
     const fiveMinutesAgo = new Date(Date.now() - DEFAULT_LOCK_TIMEOUT_MINUTES * 60 * 1000).toISOString();

     // Get all processing jobs with locks
     const { data: lockedJobs, error } = await supabase
       .from('translation_jobs')
       .select('id, locked_by, locked_at')
       .eq('status', 'processing')
       .not('locked_at', 'is', null);

     if (error) {
       console.error('[ConcurrencyControl] Error getting lock statistics:', error);
       return {
         activeLocksCount: 0,
         staleLocksCount: 0,
         locksByWorker: {},
         avgLockDurationMs: 0,
         generatedAt: new Date().toISOString(),
       };
     }

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

       // Calculate lock duration and check for stale
       if (job.locked_at) {
         const lockTime = new Date(job.locked_at).getTime();
         totalDurationMs += now - lockTime;

         // Check if stale (older than 5 minutes)
         if (job.locked_at < fiveMinutesAgo) {
           staleCount++;
         }

         // Track oldest lock
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
   ```

2. Implement `getStaleLocksCount` function:
   ```typescript
   /**
    * Get count of stale locks (for health checks)
    *
    * @param lockTimeoutMinutes - Lock timeout in minutes (default: 5)
    * @returns Count of stale locks
    */
   export async function getStaleLocksCount(
     lockTimeoutMinutes: number = DEFAULT_LOCK_TIMEOUT_MINUTES
   ): Promise<number> {
     const supabase = createSupabaseServer();
     const staleThreshold = new Date(
       Date.now() - lockTimeoutMinutes * 60 * 1000
     ).toISOString();

     const { count, error } = await supabase
       .from('translation_jobs')
       .select('*', { count: 'exact', head: true })
       .eq('status', 'processing')
       .lt('locked_at', staleThreshold);

     if (error) {
       console.error('[ConcurrencyControl] Error getting stale lock count:', error);
       return 0;
     }

     return count || 0;
   }
   ```

**Verification:**
- [ ] `getLockStatistics` returns accurate count of active locks
- [ ] `getLockStatistics` correctly identifies stale locks (> 5 minutes old)
- [ ] `getLockStatistics` groups locks by worker ID correctly
- [ ] `getLockStatistics` calculates average lock duration
- [ ] `getLockStatistics` tracks oldest lock timestamp
- [ ] `getStaleLocksCount` uses efficient count query (head: true)
- [ ] Both functions handle database errors gracefully

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.6: Implement ConcurrencyControlManager Class

**Objective:** Create a manager class that handles automatic periodic stale lock cleanup.

**File:** `/src/lib/job-queue/concurrency-control.ts` (append to existing file)

**Steps:**

1. Implement the `ConcurrencyControlManager` class:
   ```typescript
   /**
    * Concurrency control manager with automatic stale lock cleanup
    */
   export class ConcurrencyControlManager {
     private config: ConcurrencyConfig;
     private cleanupIntervalId: NodeJS.Timeout | null = null;
     private running = false;

     constructor(config: Partial<ConcurrencyConfig> = {}) {
       this.config = { ...DEFAULT_CONCURRENCY_CONFIG, ...config };
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
         this.runCleanup().catch(err => {
           console.error('[ConcurrencyControl] Initial cleanup failed:', err);
         });

         // Schedule recurring cleanup
         this.cleanupIntervalId = setInterval(
           () => {
             this.runCleanup().catch(err => {
               console.error('[ConcurrencyControl] Scheduled cleanup failed:', err);
             });
           },
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
      *
      * Note: If cleanupIntervalMs changes while running, the interval is restarted
      */
     updateConfig(config: Partial<ConcurrencyConfig>): void {
       const oldIntervalMs = this.config.cleanupIntervalMs;
       this.config = { ...this.config, ...config };

       // Restart cleanup interval if changed and currently running
       if (
         config.cleanupIntervalMs &&
         config.cleanupIntervalMs !== oldIntervalMs &&
         this.cleanupIntervalId &&
         this.running
       ) {
         clearInterval(this.cleanupIntervalId);
         this.cleanupIntervalId = setInterval(
           () => {
             this.runCleanup().catch(err => {
               console.error('[ConcurrencyControl] Scheduled cleanup failed:', err);
             });
           },
           this.config.cleanupIntervalMs
         );
         console.info('[ConcurrencyControl] Cleanup interval updated to', this.config.cleanupIntervalMs);
       }
     }

     /**
      * Get current configuration
      */
     getConfig(): ConcurrencyConfig {
       return { ...this.config };
     }
   }
   ```

2. Add factory and singleton functions:
   ```typescript
   // ===========================================================================
   // Factory and Singleton
   // ===========================================================================

   let globalManager: ConcurrencyControlManager | null = null;

   /**
    * Create a new concurrency control manager instance
    *
    * @param config - Configuration options
    * @returns New ConcurrencyControlManager instance
    */
   export function createConcurrencyManager(
     config?: Partial<ConcurrencyConfig>
   ): ConcurrencyControlManager {
     return new ConcurrencyControlManager(config);
   }

   /**
    * Get the global singleton concurrency control manager
    *
    * Creates a new instance if none exists
    *
    * @returns Global ConcurrencyControlManager instance
    */
   export function getConcurrencyManager(): ConcurrencyControlManager {
     if (!globalManager) {
       globalManager = createConcurrencyManager();
     }
     return globalManager;
   }

   /**
    * Reset the global singleton manager
    *
    * Stops the current manager if running and clears the reference
    */
   export async function resetConcurrencyManager(): Promise<void> {
     if (globalManager) {
       globalManager.stop();
       globalManager = null;
     }
   }
   ```

**Verification:**
- [ ] `start()` begins automatic cleanup if autoCleanupEnabled is true
- [ ] `start()` runs initial cleanup immediately
- [ ] `start()` logs warning if called when already running
- [ ] `stop()` clears the interval and sets running to false
- [ ] `isRunning()` returns correct state
- [ ] `runCleanup()` delegates to `cleanupStaleProcessingJobs` with config values
- [ ] `getStatistics()` delegates to `getLockStatistics`
- [ ] `updateConfig()` restarts interval if cleanupIntervalMs changes
- [ ] `getConfig()` returns a copy of the config
- [ ] Singleton pattern works correctly
- [ ] `resetConcurrencyManager()` stops and clears singleton

**Estimated Effort:** Medium (2 story points)

---

### Task 4.4.7: Update Job Processor to Use Lock Heartbeat

**Objective:** Integrate lock heartbeat into the job processor to prevent long-running translations from being marked as stale.

**File:** `/src/lib/job-queue/job-processor.ts` (modify existing file)

**Steps:**

1. Add import for `createLockHeartbeat`:
   ```typescript
   import { createLockHeartbeat } from './concurrency-control';
   ```

2. Locate the `processJob` function (or equivalent job processing function)

3. Add heartbeat at the start of job processing:
   ```typescript
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

       // Example: Call translation service
       // const result = await translateEntity(entityType, entityId, sourceLanguage, targetLanguage);

       // ... update job status to completed ...

       return {
         success: true,
         job,
         duration: Date.now() - startTime,
       };

     } catch (error) {
       // ... existing error handling ...

       return {
         success: false,
         job,
         error: error instanceof Error ? error.message : 'Unknown error',
         duration: Date.now() - startTime,
       };

     } finally {
       // Always stop heartbeat when done (success or failure)
       stopHeartbeat();
     }
   }
   ```

4. If `JobProcessorConfig` doesn't have `heartbeatIntervalMs`, add it to the type:
   ```typescript
   // In translation-jobs.types.ts or job-processor.ts
   export interface JobProcessorConfig {
     // ... existing fields ...
     /** Heartbeat interval in milliseconds (default: 60000) */
     heartbeatIntervalMs?: number;
   }
   ```

**Verification:**
- [ ] Import statement added correctly
- [ ] Heartbeat starts at the beginning of job processing
- [ ] Heartbeat is stopped in finally block (handles both success and error)
- [ ] Heartbeat interval is configurable via config
- [ ] No resource leaks (interval always cleared)
- [ ] TypeScript compiles without errors

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.8: Add Atomic Job Locking PostgreSQL Function

**Objective:** Create a PostgreSQL function for atomic fetch-and-lock operations using SELECT FOR UPDATE SKIP LOCKED.

**File:** Database migration (via Supabase MCP or migration file)

**Steps:**

1. Create a new migration with the atomic locking function:
   ```sql
   -- Migration: Add fetch_and_lock_translation_job function
   -- Purpose: Atomic job acquisition using FOR UPDATE SKIP LOCKED

   CREATE OR REPLACE FUNCTION fetch_and_lock_translation_job(p_worker_id TEXT)
   RETURNS SETOF translation_jobs AS $$
   DECLARE
     v_job translation_jobs;
   BEGIN
     -- Select and lock next queued job
     -- FOR UPDATE SKIP LOCKED prevents blocking if another worker has the lock
     SELECT * INTO v_job
     FROM translation_jobs
     WHERE status = 'queued'
     ORDER BY created_at ASC
     LIMIT 1
     FOR UPDATE SKIP LOCKED;

     -- If a job was found, update it atomically
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

   -- Add index to optimize stale lock cleanup queries
   CREATE INDEX IF NOT EXISTS idx_translation_jobs_processing_locked
   ON translation_jobs(status, locked_at)
   WHERE status = 'processing';

   -- Comment for documentation
   COMMENT ON FUNCTION fetch_and_lock_translation_job(TEXT) IS
   'Atomically fetches and locks the next queued translation job.
   Uses FOR UPDATE SKIP LOCKED for concurrent-safe job acquisition.
   Returns the locked job or empty result if no jobs available.';
   ```

2. Apply the migration using Supabase MCP:
   ```
   mcp__supabase__apply_migration(
     name: "add_fetch_and_lock_function",
     query: "<SQL above>"
   )
   ```

**Verification:**
- [ ] Migration applies without errors
- [ ] Function `fetch_and_lock_translation_job` exists in database
- [ ] Function returns a job when queued jobs exist
- [ ] Function returns empty result when no queued jobs
- [ ] Index `idx_translation_jobs_processing_locked` created
- [ ] Multiple concurrent calls don't return the same job (test with multiple connections)

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.9: Update fetchAndLockNextJob to Use RPC Function

**Objective:** Modify the existing `fetchAndLockNextJob` function to use the new PostgreSQL function for truly atomic locking.

**File:** `/src/lib/job-queue/translation-jobs.ts` (modify existing file)

**Steps:**

1. Locate the existing `fetchAndLockNextJob` function

2. Update implementation to use the RPC function:
   ```typescript
   /**
    * Fetch and lock the next available job using atomic PostgreSQL operation
    *
    * Uses the `fetch_and_lock_translation_job` PostgreSQL function which
    * implements SELECT ... FOR UPDATE SKIP LOCKED for safe concurrent access.
    *
    * @param options - Fetch options including worker ID
    * @returns Result containing the locked job or null if no jobs available
    */
   export async function fetchAndLockNextJob(
     options: FetchJobOptions
   ): Promise<JobQueueResult<TranslationJob | null>> {
     const supabase = createSupabaseServer();
     const { workerId } = options;

     if (!workerId) {
       return {
         success: false,
         error: 'Worker ID is required for job locking',
       };
     }

     try {
       // Use RPC for atomic fetch-and-lock
       const { data, error } = await supabase.rpc('fetch_and_lock_translation_job', {
         p_worker_id: workerId,
       });

       if (error) {
         console.error('[JobQueue] Error fetching job via RPC:', error);
         return { success: false, error: error.message };
       }

       // RPC returns array; empty means no jobs available
       if (!data || data.length === 0) {
         return { success: true, data: null };
       }

       return {
         success: true,
         data: mapDbJobToTranslationJob(data[0]),
       };
     } catch (error) {
       console.error('[JobQueue] Unexpected error fetching job:', error);
       return {
         success: false,
         error: error instanceof Error ? error.message : 'Unknown error',
       };
     }
   }
   ```

3. Ensure `FetchJobOptions` interface includes workerId:
   ```typescript
   export interface FetchJobOptions {
     /** Worker identifier for locking */
     workerId: string;
     /** Lock timeout in minutes (optional, used for validation) */
     lockTimeoutMinutes?: number;
   }
   ```

**Verification:**
- [ ] Function uses `supabase.rpc()` to call the PostgreSQL function
- [ ] Worker ID is validated as required
- [ ] Empty result from RPC correctly returns `{ success: true, data: null }`
- [ ] Non-empty result is correctly mapped via `mapDbJobToTranslationJob`
- [ ] Error handling covers both Supabase errors and unexpected exceptions
- [ ] TypeScript compiles without errors

**Estimated Effort:** Small (1 story point)

---

### Task 4.4.10: Update Barrel Exports

**Objective:** Export all concurrency control functions and types from the job-queue module.

**File:** `/src/lib/job-queue/index.ts` (modify existing file)

**Steps:**

1. Add concurrency control exports to the barrel file:
   ```typescript
   // Concurrency control functions
   export {
     // Stale lock recovery
     cleanupStaleProcessingJobs,
     findStaleProcessingJobs,
     // Lock heartbeat
     refreshJobLock,
     createLockHeartbeat,
     // Duplicate prevention
     checkForDuplicateJob,
     createJobIfNotExists,
     // Lock statistics
     getLockStatistics,
     getStaleLocksCount,
     // Manager class
     ConcurrencyControlManager,
     createConcurrencyManager,
     getConcurrencyManager,
     resetConcurrencyManager,
     // Constants
     DEFAULT_LOCK_TIMEOUT_MINUTES,
     DEFAULT_HEARTBEAT_INTERVAL_MS,
     DEFAULT_CLEANUP_INTERVAL_MS,
     DEFAULT_MAX_STALE_RETRIES,
     DEFAULT_CONCURRENCY_CONFIG,
   } from './concurrency-control';

   // Concurrency control types
   export type {
     ConcurrencyConfig,
     CleanupResult,
     LockStatistics,
     HeartbeatResult,
     DuplicateCheckResult,
   } from './concurrency-control';
   ```

2. Verify existing exports are not duplicated or conflicting

**Verification:**
- [ ] All public functions are exported
- [ ] All public types are exported with `export type`
- [ ] All public constants are exported
- [ ] No duplicate exports
- [ ] File compiles without errors
- [ ] Imports work from consuming modules: `import { getConcurrencyManager } from '@/lib/job-queue'`

**Estimated Effort:** Trivial (< 1 story point)

---

## Summary of Files to Create/Modify

### New Files

| File Path | Tasks | Purpose |
|-----------|-------|---------|
| `/src/lib/job-queue/concurrency-control.ts` | 4.4.1 - 4.4.6 | Main concurrency control implementation |

### Modified Files

| File Path | Tasks | Changes |
|-----------|-------|---------|
| `/src/lib/job-queue/index.ts` | 4.4.10 | Add concurrency control exports |
| `/src/lib/job-queue/job-processor.ts` | 4.4.7 | Integrate lock heartbeat |
| `/src/lib/job-queue/translation-jobs.ts` | 4.4.9 | Update fetchAndLockNextJob to use RPC |
| `/src/lib/job-queue/translation-jobs.types.ts` | 4.4.7 | Add heartbeatIntervalMs to config (if needed) |

### Database Changes

| Migration Name | Task | Description |
|----------------|------|-------------|
| `add_fetch_and_lock_function` | 4.4.8 | PostgreSQL function for atomic job locking |

---

## Implementation Order

The recommended implementation order based on dependencies:

```
4.4.1 (Types)
    ↓
4.4.8 (DB Migration - can run in parallel with code tasks)
    ↓
4.4.2 (Stale Cleanup) → 4.4.3 (Heartbeat) → 4.4.4 (Duplicate Prevention) → 4.4.5 (Statistics)
                                                                                    ↓
                                                                              4.4.6 (Manager)
                                                                                    ↓
                                                    4.4.7 (Processor Integration) + 4.4.9 (RPC Update)
                                                                                    ↓
                                                                              4.4.10 (Exports)
```

**Parallelization Notes:**
- Tasks 4.4.2-4.4.5 can be implemented in any order after 4.4.1
- Task 4.4.8 (database migration) can run in parallel with code tasks
- Tasks 4.4.7 and 4.4.9 can run in parallel after their dependencies

---

## Testing Checklist

### Unit Tests (Recommended)

| Test File | Coverage |
|-----------|----------|
| `concurrency-control.test.ts` | `cleanupStaleProcessingJobs`, `refreshJobLock`, `checkForDuplicateJob`, `createJobIfNotExists`, `getLockStatistics`, `ConcurrencyControlManager` |

### Integration Tests (Recommended)

- [ ] Multiple workers competing for same job (only one succeeds)
- [ ] Stale cleanup with actual database operations
- [ ] Heartbeat prevents stale detection during long processing
- [ ] Duplicate prevention with concurrent job creation attempts

### Manual Verification

- [ ] Start concurrency manager, verify cleanup runs periodically
- [ ] Create stale job manually, verify cleanup resets it
- [ ] Create stale job with 3+ attempts, verify cleanup marks it failed
- [ ] Verify lock statistics API returns accurate data

---

## Acceptance Criteria Verification

| Criteria | Implementation | Verification Method |
|----------|----------------|---------------------|
| Prevent duplicate job processing | UNIQUE constraint + `checkForDuplicateJob()` + `SELECT FOR UPDATE SKIP LOCKED` | Create same job twice, verify only one exists |
| Handle stale "processing" jobs (timeout after 5 min) | `cleanupStaleProcessingJobs()` + `ConcurrencyControlManager` with automatic cleanup | Create old processing job, run cleanup, verify reset |
| Jobs reset to queued if attempts < 3 | Logic in `cleanupStaleProcessingJobs()` | Create stale job with attempts=1, verify status becomes 'queued' |
| Jobs marked failed if attempts >= 3 | Logic in `cleanupStaleProcessingJobs()` | Create stale job with attempts=3, verify status becomes 'failed' |

---

## Rollback Plan

If issues are encountered:

1. **Database rollback:** Drop the function and index:
   ```sql
   DROP FUNCTION IF EXISTS fetch_and_lock_translation_job(TEXT);
   DROP INDEX IF EXISTS idx_translation_jobs_processing_locked;
   ```

2. **Code rollback:** Revert to previous `fetchAndLockNextJob` implementation that doesn't use RPC

3. **Disable automatic cleanup:** Set `autoCleanupEnabled: false` in manager config

---

## References

- Overview Document: `/docs/REQ-245-implement-concurrency-control-overview.md`
- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (Phase 4, Task 4.4)
- PostgreSQL FOR UPDATE: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE
- Supabase RPC Documentation: https://supabase.com/docs/guides/database/functions

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.4*
*Generated: 2026-01-18 13:30:00 UTC*
