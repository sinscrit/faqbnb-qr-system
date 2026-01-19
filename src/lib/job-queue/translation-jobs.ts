/**
 * Translation Job Queue Functions
 * Part of REQ-243: Translation Job Queue Module
 *
 * This module provides database-backed job queue functionality for
 * asynchronous translation processing, including job creation,
 * status management, concurrent-safe fetching with locking, and query utilities.
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  TranslationJob,
  CreateJobParams,
  CreateBatchJobsParams,
  JobUpdateParams,
  FetchJobOptions,
  JobQueueResult,
  JobStatus,
  EntityType,
} from './translation-jobs.types';

/**
 * Maps a database row to a TranslationJob interface
 * Converts snake_case column names to camelCase property names
 */
function mapRowToJob(row: Record<string, unknown>): TranslationJob {
  return {
    id: row.id as string,
    entityType: row.entity_type as TranslationJob['entityType'],
    entityId: row.entity_id as string,
    sourceLanguage: row.source_language as TranslationJob['sourceLanguage'],
    targetLanguage: row.target_language as TranslationJob['targetLanguage'],
    status: row.status as TranslationJob['status'],
    attempts: (row.attempts as number) ?? 0,
    errorMessage: row.error_message as string | null,
    createdAt: row.created_at as string,
    startedAt: row.started_at as string | null,
    completedAt: row.completed_at as string | null,
    lockedBy: row.locked_by as string | null,
    lockedAt: row.locked_at as string | null,
  };
}

/**
 * Creates a single translation job in the queue
 *
 * @param params - Job creation parameters
 * @returns Result containing the created job or an error
 */
export async function createTranslationJob(
  params: CreateJobParams
): Promise<JobQueueResult<TranslationJob>> {
  try {
    const { entityType, entityId, targetLanguage } = params;
    const sourceLanguage = params.sourceLanguage || 'en';

    console.log('JOB_QUEUE: Creating translation job', {
      entityType,
      entityId,
      sourceLanguage,
      targetLanguage,
    });

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .upsert(
        {
          entity_type: entityType,
          entity_id: entityId,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          status: 'queued',
          attempts: 0,
        },
        {
          onConflict: 'entity_type,entity_id,target_language',
          ignoreDuplicates: true,
        }
      )
      .select()
      .single();

    if (error) {
      // If ignoreDuplicates caused no row to be returned, fetch the existing one
      if (error.code === 'PGRST116') {
        const { data: existingJob, error: fetchError } = await supabaseAdmin
          .from('translation_jobs')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .eq('target_language', targetLanguage)
          .single();

        if (fetchError) {
          console.error('JOB_QUEUE: Failed to fetch existing job', fetchError);
          return {
            success: false,
            error: `Failed to create or fetch translation job: ${fetchError.message}`,
          };
        }

        console.log('JOB_QUEUE: Job already exists, returning existing', {
          jobId: existingJob.id,
        });

        return {
          success: true,
          data: mapRowToJob(existingJob),
        };
      }

      console.error('JOB_QUEUE: Failed to create job', error);
      return {
        success: false,
        error: `Failed to create translation job: ${error.message}`,
      };
    }

    console.log('JOB_QUEUE: Job created successfully', { jobId: data.id });

    return {
      success: true,
      data: mapRowToJob(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception creating job', error);
    return {
      success: false,
      error: `Exception creating translation job: ${message}`,
    };
  }
}

/**
 * Creates translation jobs for multiple target languages at once
 *
 * @param params - Batch job creation parameters
 * @returns Result containing array of created jobs or an error
 */
export async function createBatchTranslationJobs(
  params: CreateBatchJobsParams
): Promise<JobQueueResult<TranslationJob[]>> {
  try {
    const { entityType, entityId, targetLanguages } = params;
    const sourceLanguage = params.sourceLanguage || 'en';

    // Filter out source language from targets (can't translate to same language)
    const validTargets = targetLanguages.filter(
      (lang) => lang !== sourceLanguage
    );

    if (validTargets.length === 0) {
      return {
        success: false,
        error: 'No valid target languages provided',
      };
    }

    console.log('JOB_QUEUE: Creating batch translation jobs', {
      entityType,
      entityId,
      sourceLanguage,
      targetLanguages: validTargets,
    });

    const jobRecords = validTargets.map((targetLanguage) => ({
      entity_type: entityType,
      entity_id: entityId,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      status: 'queued' as const,
      attempts: 0,
    }));

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .upsert(jobRecords, {
        onConflict: 'entity_type,entity_id,target_language',
        ignoreDuplicates: false, // Return existing rows
      })
      .select();

    if (error) {
      console.error('JOB_QUEUE: Failed to create batch jobs', error);
      return {
        success: false,
        error: `Failed to create batch translation jobs: ${error.message}`,
      };
    }

    const jobs = (data || []).map(mapRowToJob);

    console.log('JOB_QUEUE: Batch jobs created', {
      requested: validTargets.length,
      created: jobs.length,
    });

    return {
      success: true,
      data: jobs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception creating batch jobs', error);
    return {
      success: false,
      error: `Exception creating batch translation jobs: ${message}`,
    };
  }
}

/**
 * Updates a job's status and related fields
 *
 * @param jobId - The ID of the job to update
 * @param updates - The fields to update
 * @returns Result containing the updated job or an error
 */
export async function updateJobStatus(
  jobId: string,
  updates: JobUpdateParams
): Promise<JobQueueResult<TranslationJob>> {
  try {
    console.log('JOB_QUEUE: Updating job status', { jobId, updates });

    const updateData: Record<string, unknown> = {};

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.attempts !== undefined) {
      updateData.attempts = updates.attempts;
    }
    if (updates.errorMessage !== undefined) {
      updateData.error_message = updates.errorMessage;
    }
    if (updates.startedAt !== undefined) {
      updateData.started_at = updates.startedAt;
    }
    if (updates.completedAt !== undefined) {
      updateData.completed_at = updates.completedAt;
    }

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('JOB_QUEUE: Failed to update job', error);
      return {
        success: false,
        error: `Failed to update job: ${error.message}`,
      };
    }

    console.log('JOB_QUEUE: Job updated successfully', {
      jobId,
      newStatus: data.status,
    });

    return {
      success: true,
      data: mapRowToJob(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception updating job', error);
    return {
      success: false,
      error: `Exception updating job: ${message}`,
    };
  }
}

/**
 * Marks a job as completed
 * Sets status to 'completed', adds completion timestamp, and clears lock
 *
 * @param jobId - The ID of the job to mark as completed
 * @returns Result containing the updated job or an error
 */
export async function markJobCompleted(
  jobId: string
): Promise<JobQueueResult<TranslationJob>> {
  try {
    console.log('JOB_QUEUE: Marking job completed', { jobId });

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        locked_by: null,
        locked_at: null,
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('JOB_QUEUE: Failed to mark job completed', error);
      return {
        success: false,
        error: `Failed to mark job completed: ${error.message}`,
      };
    }

    console.log('JOB_QUEUE: Job marked completed', { jobId });

    return {
      success: true,
      data: mapRowToJob(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception marking job completed', error);
    return {
      success: false,
      error: `Exception marking job completed: ${message}`,
    };
  }
}

/**
 * Marks a job as failed with error details
 * Increments attempt counter, stores error message, and clears lock
 *
 * @param jobId - The ID of the job to mark as failed
 * @param errorMessage - Description of the error that caused failure
 * @returns Result containing the updated job or an error
 */
export async function markJobFailed(
  jobId: string,
  errorMessage: string
): Promise<JobQueueResult<TranslationJob>> {
  try {
    console.log('JOB_QUEUE: Marking job failed', { jobId, errorMessage });

    // First get current attempts count
    const { data: currentJob, error: fetchError } = await supabaseAdmin
      .from('translation_jobs')
      .select('attempts')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      console.error('JOB_QUEUE: Failed to fetch job for failure update', fetchError);
      return {
        success: false,
        error: `Failed to fetch job for failure update: ${fetchError.message}`,
      };
    }

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        attempts: (currentJob?.attempts || 0) + 1,
        locked_by: null,
        locked_at: null,
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('JOB_QUEUE: Failed to mark job as failed', error);
      return {
        success: false,
        error: `Failed to mark job as failed: ${error.message}`,
      };
    }

    console.log('JOB_QUEUE: Job marked failed', {
      jobId,
      attempts: data.attempts,
    });

    return {
      success: true,
      data: mapRowToJob(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception marking job failed', error);
    return {
      success: false,
      error: `Exception marking job failed: ${message}`,
    };
  }
}

/**
 * Fallback job fetching when RPC not available
 * Uses optimistic locking with conditional update
 *
 * @param workerId - Unique identifier for the worker
 * @returns Result containing the locked job or null
 */
async function fetchAndLockJobFallback(
  workerId: string
): Promise<JobQueueResult<TranslationJob | null>> {
  const now = new Date().toISOString();

  // Find oldest queued job that's not locked
  const { data: jobs, error: selectError } = await supabaseAdmin
    .from('translation_jobs')
    .select('*')
    .eq('status', 'queued')
    .is('locked_by', null)
    .order('created_at', { ascending: true })
    .limit(1);

  if (selectError) {
    return {
      success: false,
      error: `Failed to find queued job: ${selectError.message}`,
    };
  }

  if (!jobs || jobs.length === 0) {
    return {
      success: true,
      data: null,
    };
  }

  const job = jobs[0];

  // Try to lock it (may fail if another worker got it first)
  const { data: lockedJob, error: lockError } = await supabaseAdmin
    .from('translation_jobs')
    .update({
      status: 'processing',
      locked_by: workerId,
      locked_at: now,
      started_at: now,
    })
    .eq('id', job.id)
    .is('locked_by', null) // Only lock if still unlocked
    .eq('status', 'queued') // Only lock if still queued
    .select()
    .single();

  if (lockError || !lockedJob) {
    // Another worker got it, try again (recursive but will terminate when queue empty)
    console.log('JOB_QUEUE: Job locked by another worker, retrying');
    return fetchAndLockJobFallback(workerId);
  }

  return {
    success: true,
    data: mapRowToJob(lockedJob),
  };
}

/**
 * Fetches and locks the next available queued job using atomic PostgreSQL operation
 *
 * Uses the `fetch_and_lock_translation_job` PostgreSQL function which
 * implements SELECT ... FOR UPDATE SKIP LOCKED for safe concurrent access.
 * Falls back to optimistic locking if RPC fails.
 *
 * Part of REQ-245: Implement Concurrency Control (Task 4.4.9)
 *
 * @param options - Fetch options including workerId and optional lockTimeoutMinutes
 * @returns Result containing the locked job or null if no jobs available
 */
export async function fetchAndLockNextJob(
  options: FetchJobOptions
): Promise<JobQueueResult<TranslationJob | null>> {
  try {
    const { workerId } = options;

    console.log('JOB_QUEUE: Fetching next job', { workerId });

    // Try atomic RPC function first (REQ-245)
    const { data: rpcData, error: rpcError } = await supabaseAdmin
      .rpc('fetch_and_lock_translation_job', { p_worker_id: workerId });

    if (rpcError) {
      // RPC failed, fall back to optimistic locking
      console.warn('JOB_QUEUE: RPC fetch failed, using fallback', rpcError.message);
      const result = await fetchAndLockJobFallback(workerId);

      if (result.success && result.data) {
        console.log('JOB_QUEUE: Job fetched and locked (fallback)', {
          jobId: result.data.id,
          workerId,
        });
      } else if (result.success) {
        console.log('JOB_QUEUE: No queued jobs available');
      }

      return result;
    }

    // RPC returns an array - take first result
    const jobRow = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!jobRow) {
      console.log('JOB_QUEUE: No queued jobs available');
      return {
        success: true,
        data: null,
      };
    }

    const job = mapRowToJob(jobRow);
    console.log('JOB_QUEUE: Job fetched and locked (atomic)', {
      jobId: job.id,
      workerId,
    });

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception fetching job', error);
    return {
      success: false,
      error: `Exception fetching job: ${message}`,
    };
  }
}

/**
 * Releases a job lock without changing status
 * Only the owning worker can release the lock
 *
 * @param jobId - The ID of the job to unlock
 * @param workerId - The worker that owns the lock
 * @returns Result indicating success or failure
 */
export async function releaseJobLock(
  jobId: string,
  workerId: string
): Promise<JobQueueResult<boolean>> {
  try {
    console.log('JOB_QUEUE: Releasing job lock', { jobId, workerId });

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .update({
        locked_by: null,
        locked_at: null,
      })
      .eq('id', jobId)
      .eq('locked_by', workerId) // Only release if we own the lock
      .select()
      .single();

    if (error) {
      console.error('JOB_QUEUE: Failed to release lock', error);
      return {
        success: false,
        error: `Failed to release lock: ${error.message}`,
      };
    }

    if (!data) {
      console.warn('JOB_QUEUE: Lock not owned by this worker or job not found', {
        jobId,
        workerId,
      });
      return {
        success: false,
        error: 'Lock not owned by this worker or job not found',
      };
    }

    console.log('JOB_QUEUE: Job lock released', { jobId });

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception releasing lock', error);
    return {
      success: false,
      error: `Exception releasing lock: ${message}`,
    };
  }
}

/**
 * Gets all jobs for a specific entity
 *
 * @param entityType - The type of entity
 * @param entityId - The ID of the entity
 * @returns Result containing array of jobs or an error
 */
export async function getJobsByEntity(
  entityType: EntityType,
  entityId: string
): Promise<JobQueueResult<TranslationJob[]>> {
  try {
    console.log('JOB_QUEUE: Getting jobs by entity', { entityType, entityId });

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('JOB_QUEUE: Failed to get jobs by entity', error);
      return {
        success: false,
        error: `Failed to get jobs by entity: ${error.message}`,
      };
    }

    const jobs = (data || []).map(mapRowToJob);

    console.log('JOB_QUEUE: Jobs retrieved by entity', {
      entityType,
      entityId,
      count: jobs.length,
    });

    return {
      success: true,
      data: jobs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception getting jobs by entity', error);
    return {
      success: false,
      error: `Exception getting jobs by entity: ${message}`,
    };
  }
}

/**
 * Gets jobs by status with optional limit
 *
 * @param status - The job status to filter by
 * @param limit - Optional maximum number of jobs to return
 * @returns Result containing array of jobs or an error
 */
export async function getJobsByStatus(
  status: JobStatus,
  limit?: number
): Promise<JobQueueResult<TranslationJob[]>> {
  try {
    console.log('JOB_QUEUE: Getting jobs by status', { status, limit });

    let query = supabaseAdmin
      .from('translation_jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: status === 'queued' });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('JOB_QUEUE: Failed to get jobs by status', error);
      return {
        success: false,
        error: `Failed to get jobs by status: ${error.message}`,
      };
    }

    const jobs = (data || []).map(mapRowToJob);

    console.log('JOB_QUEUE: Jobs retrieved by status', {
      status,
      count: jobs.length,
    });

    return {
      success: true,
      data: jobs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception getting jobs by status', error);
    return {
      success: false,
      error: `Exception getting jobs by status: ${message}`,
    };
  }
}

/**
 * Cleans up stale locks (processing jobs locked too long)
 * Resets old locked jobs to 'queued' status for retry
 *
 * @param timeoutMinutes - Minutes after which a lock is considered stale (default: 5)
 * @returns Result containing count of cleaned up jobs or an error
 */
export async function cleanupStaleLocks(
  timeoutMinutes: number = 5
): Promise<JobQueueResult<number>> {
  try {
    const cutoffTime = new Date(
      Date.now() - timeoutMinutes * 60 * 1000
    ).toISOString();

    console.log('JOB_QUEUE: Cleaning up stale locks', {
      timeoutMinutes,
      cutoffTime,
    });

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .update({
        status: 'queued',
        locked_by: null,
        locked_at: null,
      })
      .eq('status', 'processing')
      .lt('locked_at', cutoffTime)
      .not('locked_at', 'is', null)
      .select();

    if (error) {
      console.error('JOB_QUEUE: Failed to cleanup stale locks', error);
      return {
        success: false,
        error: `Failed to cleanup stale locks: ${error.message}`,
      };
    }

    const cleanedCount = data?.length || 0;

    console.log('JOB_QUEUE: Stale locks cleaned up', { count: cleanedCount });

    return {
      success: true,
      data: cleanedCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('JOB_QUEUE: Exception cleaning up stale locks', error);
    return {
      success: false,
      error: `Exception cleaning up stale locks: ${message}`,
    };
  }
}
