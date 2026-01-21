/**
 * Concurrency Control for Translation Job Queue
 * Part of REQ-245: Implement Concurrency Control
 *
 * Provides stale lock recovery, lock heartbeat, duplicate prevention,
 * and lock statistics monitoring for the translation job queue.
 *
 * @module job-queue/concurrency-control
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

import type {
  SupportedLanguage,
  EntityType,
  JobStatus,
  TranslationJob,
  CreateJobParams,
  JobQueueResult,
} from './translation-jobs.types';
import { supabaseAdmin } from '@/lib/supabase';

// ===========================================================================
// Type Definitions (Task 4.4.1)
// ===========================================================================

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

// ===========================================================================
// Default Configuration Constants
// ===========================================================================

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

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Maps a database row to a TranslationJob interface
 * Converts snake_case column names to camelCase property names
 */
export function mapDbJobToTranslationJob(row: Record<string, unknown>): TranslationJob {
  return {
    id: row.id as string,
    entityType: row.entity_type as TranslationJob['entityType'],
    entityId: row.entity_id as string,
    sourceLanguage: row.source_language as TranslationJob['sourceLanguage'],
    targetLanguage: row.target_language as TranslationJob['targetLanguage'],
    status: row.status as TranslationJob['status'],
    priority: (row.priority as number) ?? 50,  // Default to HIGH priority
    attempts: (row.attempts as number) ?? 0,
    errorMessage: row.error_message as string | null,
    createdAt: row.created_at as string,
    startedAt: row.started_at as string | null,
    completedAt: row.completed_at as string | null,
    lockedBy: row.locked_by as string | null,
    lockedAt: row.locked_at as string | null,
  };
}

// ===========================================================================
// Stale Lock Cleanup Functions (Task 4.4.2)
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
): Promise<CleanupResult> {
  const lockTimeoutMinutes = options?.lockTimeoutMinutes ?? DEFAULT_LOCK_TIMEOUT_MINUTES;
  const maxStaleRetries = options?.maxStaleRetries ?? DEFAULT_MAX_STALE_RETRIES;

  const staleThreshold = new Date(
    Date.now() - lockTimeoutMinutes * 60 * 1000
  ).toISOString();

  // Find stale jobs
  const { data: staleJobs, error: findError } = await supabaseAdmin
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

  const jobsToReset = staleJobs.filter((j: { id: string; attempts: number | null }) => (j.attempts || 0) < maxStaleRetries);
  const jobsToFail = staleJobs.filter((j: { id: string; attempts: number | null }) => (j.attempts || 0) >= maxStaleRetries);
  const affectedJobIds: string[] = [];

  // Reset jobs to queued (can be retried)
  if (jobsToReset.length > 0) {
    const resetIds = jobsToReset.map((j: { id: string }) => j.id);
    const { error: resetError } = await supabaseAdmin
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
    const failIds = jobsToFail.map((j: { id: string }) => j.id);
    const { error: failError } = await supabaseAdmin
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

/**
 * Find jobs with stale processing locks (for monitoring)
 *
 * @param lockTimeoutMinutes - Lock timeout in minutes (default: 5)
 * @returns Array of stale jobs
 */
export async function findStaleProcessingJobs(
  lockTimeoutMinutes: number = DEFAULT_LOCK_TIMEOUT_MINUTES
): Promise<TranslationJob[]> {
  const staleThreshold = new Date(
    Date.now() - lockTimeoutMinutes * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseAdmin
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

// ===========================================================================
// Lock Heartbeat Functions (Task 4.4.3)
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
): Promise<HeartbeatResult> {
  const newLockedAt = new Date().toISOString();

  const { data, error } = await supabaseAdmin
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

// ===========================================================================
// Duplicate Prevention Functions (Task 4.4.4)
// ===========================================================================

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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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

// ===========================================================================
// Lock Statistics Functions (Task 4.4.5)
// ===========================================================================

/**
 * Get current lock statistics for monitoring
 *
 * @returns Lock statistics
 */
export async function getLockStatistics(): Promise<LockStatistics> {
  const fiveMinutesAgo = new Date(Date.now() - DEFAULT_LOCK_TIMEOUT_MINUTES * 60 * 1000).toISOString();

  // Get all processing jobs with locks
  const { data: lockedJobs, error } = await supabaseAdmin
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

/**
 * Get count of stale locks (for health checks)
 *
 * @param lockTimeoutMinutes - Lock timeout in minutes (default: 5)
 * @returns Count of stale locks
 */
export async function getStaleLocksCount(
  lockTimeoutMinutes: number = DEFAULT_LOCK_TIMEOUT_MINUTES
): Promise<number> {
  const staleThreshold = new Date(
    Date.now() - lockTimeoutMinutes * 60 * 1000
  ).toISOString();

  const { count, error } = await supabaseAdmin
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

// ===========================================================================
// ConcurrencyControlManager Class (Task 4.4.6)
// ===========================================================================

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
