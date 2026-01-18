# REQ-243: Translation Job Queue Module - Detailed Task Breakdown

**Generated:** 2026-01-18 15:30:00 UTC
**Last Modified:** 2026-01-18 15:30:00 UTC
**Request Reference:** REQ-243 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-243-create-translation-job-queue-module-overview.md`
**Implementation Plan:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.1

---

## Executive Summary

This document breaks down the Translation Job Queue Module (REQ-243, Task 4.1) into granular, implementation-ready tasks. Each task is designed to be approximately 1 story point and can be executed independently with clear inputs, outputs, and acceptance criteria.

The module provides database-backed job queue functionality for asynchronous translation processing, including job creation, status management, concurrent-safe fetching with locking, and query utilities.

---

## Prerequisites

Before starting implementation, verify the following are complete:

| Prerequisite | Status | Verification |
|-------------|--------|--------------|
| Task 1.1: `translation_jobs` table exists | Required | `SELECT * FROM translation_jobs LIMIT 1;` |
| Task 1.5: TypeScript types include translation_jobs | Required | Check `/src/lib/supabase.ts` |
| Supabase server client available | Required | `/src/lib/supabase-server.ts` exists |

---

## Task Breakdown

### Task 4.1.1: Create Type Definitions File

**File:** `/src/lib/job-queue/translation-jobs.types.ts`

**Description:** Create all TypeScript type definitions for the job queue module, including type unions, interfaces for job data, and generic result types.

**Implementation Steps:**

1. Create directory `/src/lib/job-queue/` if it doesn't exist
2. Create `translation-jobs.types.ts` file
3. Define `SupportedLanguage` type union: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
4. Define `EntityType` type union: `'article' | 'item' | 'link' | 'tag'`
5. Define `JobStatus` type union: `'queued' | 'processing' | 'completed' | 'failed'`
6. Define `TranslationJob` interface matching database schema:
   - `id: string`
   - `entityType: EntityType`
   - `entityId: string`
   - `sourceLanguage: SupportedLanguage`
   - `targetLanguage: SupportedLanguage`
   - `status: JobStatus`
   - `attempts: number`
   - `errorMessage?: string | null`
   - `createdAt: string`
   - `startedAt?: string | null`
   - `completedAt?: string | null`
   - `lockedBy?: string | null`
   - `lockedAt?: string | null`
7. Define `CreateJobParams` interface:
   - `entityType: EntityType`
   - `entityId: string`
   - `sourceLanguage?: SupportedLanguage` (default: 'en')
   - `targetLanguage: SupportedLanguage`
8. Define `CreateBatchJobsParams` interface:
   - `entityType: EntityType`
   - `entityId: string`
   - `sourceLanguage?: SupportedLanguage`
   - `targetLanguages: SupportedLanguage[]`
9. Define `JobUpdateParams` interface:
   - `status?: JobStatus`
   - `attempts?: number`
   - `errorMessage?: string | null`
   - `startedAt?: string`
   - `completedAt?: string`
10. Define `FetchJobOptions` interface:
    - `workerId: string`
    - `lockTimeoutMinutes?: number` (default: 5)
11. Define generic `JobQueueResult<T>` interface:
    - `success: boolean`
    - `data?: T`
    - `error?: string`
12. Export all types

**Code Template:**

```typescript
/**
 * Translation Job Queue Types
 * Part of REQ-243: Translation Job Queue Module
 */

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
export type EntityType = 'article' | 'item' | 'link' | 'tag';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}

export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}

export interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
}

export interface JobUpdateParams {
  status?: JobStatus;
  attempts?: number;
  errorMessage?: string | null;
  startedAt?: string;
  completedAt?: string;
}

export interface FetchJobOptions {
  workerId: string;
  lockTimeoutMinutes?: number;
}

export interface JobQueueResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Acceptance Criteria:**
- [ ] File created at `/src/lib/job-queue/translation-jobs.types.ts`
- [ ] All 6 type/interface definitions present
- [ ] Types align with database schema column names (snake_case to camelCase)
- [ ] All types exported
- [ ] TypeScript compiles without errors

**Estimated Effort:** Small (< 30 min)

---

### Task 4.1.2: Create Job Insertion Function - Single Job

**File:** `/src/lib/job-queue/translation-jobs.ts`

**Description:** Implement the `createTranslationJob()` function to insert a single translation job into the queue.

**Implementation Steps:**

1. Create `translation-jobs.ts` file
2. Import types from `translation-jobs.types.ts`
3. Import `supabaseAdmin` from `/src/lib/supabase`
4. Create helper function to map camelCase to snake_case for database operations
5. Implement `createTranslationJob()`:
   - Accept `CreateJobParams` parameter
   - Set default `sourceLanguage` to 'en' if not provided
   - Insert into `translation_jobs` table with status 'queued'
   - Handle unique constraint conflicts using upsert (ON CONFLICT DO NOTHING or return existing)
   - Transform database response to `TranslationJob` interface
   - Return `JobQueueResult<TranslationJob>`
6. Add error handling with descriptive error messages
7. Add console logging for debugging

**Code Template:**

```typescript
import { supabaseAdmin } from '@/lib/supabase';
import {
  TranslationJob,
  CreateJobParams,
  JobQueueResult,
  SupportedLanguage,
} from './translation-jobs.types';

/**
 * Maps database row to TranslationJob interface
 */
function mapRowToJob(row: any): TranslationJob {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    status: row.status,
    attempts: row.attempts,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    lockedBy: row.locked_by,
    lockedAt: row.locked_at,
  };
}

/**
 * Creates a single translation job in the queue
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
      console.error('JOB_QUEUE: Failed to create job', error);
      return {
        success: false,
        error: `Failed to create translation job: ${error.message}`,
      };
    }

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
```

**Acceptance Criteria:**
- [ ] Function `createTranslationJob()` implemented and exported
- [ ] Jobs inserted with status 'queued' and attempts = 0
- [ ] Default source language 'en' applied when not specified
- [ ] Duplicate job creation (same entity + target language) handled gracefully
- [ ] Returns properly typed `JobQueueResult<TranslationJob>`
- [ ] Console logging present for debugging

**Estimated Effort:** Small (30-45 min)

---

### Task 4.1.3: Create Job Insertion Function - Batch Jobs

**File:** `/src/lib/job-queue/translation-jobs.ts`

**Description:** Implement the `createBatchTranslationJobs()` function to insert multiple translation jobs for one entity across multiple target languages.

**Implementation Steps:**

1. Implement `createBatchTranslationJobs()`:
   - Accept `CreateBatchJobsParams` parameter
   - Validate `targetLanguages` array is not empty
   - Filter out source language from target languages (can't translate to same language)
   - Create array of job records for batch insert
   - Insert all jobs using Supabase batch insert with upsert
   - Handle partial failures (some jobs may already exist)
   - Transform and return all successfully created/existing jobs
   - Return `JobQueueResult<TranslationJob[]>`
2. Add validation for empty target languages array
3. Add console logging for batch operations

**Code Template:**

```typescript
import { CreateBatchJobsParams } from './translation-jobs.types';

/**
 * Creates translation jobs for multiple target languages at once
 */
export async function createBatchTranslationJobs(
  params: CreateBatchJobsParams
): Promise<JobQueueResult<TranslationJob[]>> {
  try {
    const { entityType, entityId, targetLanguages } = params;
    const sourceLanguage = params.sourceLanguage || 'en';

    // Filter out source language from targets
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
```

**Acceptance Criteria:**
- [ ] Function `createBatchTranslationJobs()` implemented and exported
- [ ] Source language filtered from target languages
- [ ] Empty/invalid target languages returns error
- [ ] All jobs created in single database operation
- [ ] Existing jobs not duplicated
- [ ] Returns array of all jobs (created or existing)

**Estimated Effort:** Small (30-45 min)

---

### Task 4.1.4: Create Job Status Update Functions

**File:** `/src/lib/job-queue/translation-jobs.ts`

**Description:** Implement functions for updating job status: `updateJobStatus()`, `markJobCompleted()`, and `markJobFailed()`.

**Implementation Steps:**

1. Implement `updateJobStatus()`:
   - Accept `jobId` and `JobUpdateParams`
   - Update specified fields in database
   - Return updated job
2. Implement `markJobCompleted()`:
   - Accept `jobId`
   - Set status to 'completed'
   - Set `completedAt` to current timestamp
   - Clear `lockedBy` and `lockedAt`
   - Return updated job
3. Implement `markJobFailed()`:
   - Accept `jobId` and `errorMessage`
   - Set status to 'failed'
   - Increment `attempts` counter
   - Store error message
   - Clear lock fields
   - Return updated job
4. Add validation for job existence
5. Add console logging for status transitions

**Code Template:**

```typescript
/**
 * Updates a job's status and related fields
 */
export async function updateJobStatus(
  jobId: string,
  updates: JobUpdateParams
): Promise<JobQueueResult<TranslationJob>> {
  try {
    console.log('JOB_QUEUE: Updating job status', { jobId, updates });

    const updateData: Record<string, any> = {};

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

    return {
      success: true,
      data: mapRowToJob(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Exception updating job: ${message}`,
    };
  }
}

/**
 * Marks a job as completed
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

    return {
      success: true,
      data: mapRowToJob(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Exception marking job completed: ${message}`,
    };
  }
}

/**
 * Marks a job as failed with error details
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

    return {
      success: true,
      data: mapRowToJob(data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Exception marking job failed: ${message}`,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `updateJobStatus()` updates only specified fields
- [ ] `markJobCompleted()` sets status, completedAt, and clears lock
- [ ] `markJobFailed()` increments attempts and stores error
- [ ] All functions clear lock fields on completion/failure
- [ ] Non-existent job ID returns appropriate error
- [ ] Status transitions logged

**Estimated Effort:** Medium (45-60 min)

---

### Task 4.1.5: Create Job Fetching with Locking

**File:** `/src/lib/job-queue/translation-jobs.ts`

**Description:** Implement `fetchAndLockNextJob()` for concurrent-safe job fetching using PostgreSQL row-level locking, and `releaseJobLock()` for releasing locks.

**Implementation Steps:**

1. Implement `fetchAndLockNextJob()`:
   - Accept `FetchJobOptions` with `workerId` and optional `lockTimeoutMinutes`
   - Use raw SQL with `SELECT ... FOR UPDATE SKIP LOCKED` for atomic operation
   - Select oldest queued job that is not locked
   - In same transaction: update status to 'processing', set `lockedBy`, `lockedAt`, `startedAt`
   - Return locked job or null if no jobs available
2. Implement `releaseJobLock()`:
   - Accept `jobId` and `workerId`
   - Verify worker owns the lock before releasing
   - Clear `lockedBy` and `lockedAt` fields
   - Do NOT change job status (caller decides next status)
   - Return success/failure
3. Handle edge cases:
   - No queued jobs available
   - Worker ID mismatch on release
   - Database connection issues

**Code Template:**

```typescript
import { FetchJobOptions } from './translation-jobs.types';

/**
 * Fetches and locks the next available queued job
 * Uses PostgreSQL FOR UPDATE SKIP LOCKED for concurrency safety
 */
export async function fetchAndLockNextJob(
  options: FetchJobOptions
): Promise<JobQueueResult<TranslationJob | null>> {
  try {
    const { workerId, lockTimeoutMinutes = 5 } = options;
    const now = new Date().toISOString();

    console.log('JOB_QUEUE: Fetching next job', { workerId });

    // Use raw SQL for atomic SELECT FOR UPDATE SKIP LOCKED
    // This ensures only one worker gets each job
    const { data, error } = await supabaseAdmin.rpc('fetch_and_lock_translation_job', {
      p_worker_id: workerId,
      p_lock_timeout_minutes: lockTimeoutMinutes,
    });

    // If RPC not available, fall back to two-step approach
    // Note: The RPC approach is preferred for true atomicity
    if (error && error.code === 'PGRST202') {
      // Function doesn't exist, use fallback
      return await fetchAndLockJobFallback(workerId);
    }

    if (error) {
      console.error('JOB_QUEUE: Failed to fetch job', error);
      return {
        success: false,
        error: `Failed to fetch job: ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      console.log('JOB_QUEUE: No queued jobs available');
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: mapRowToJob(data[0]),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Exception fetching job: ${message}`,
    };
  }
}

/**
 * Fallback job fetching when RPC not available
 * Less atomic but functional
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
    // Another worker got it, try again
    console.log('JOB_QUEUE: Job locked by another worker, retrying');
    return fetchAndLockJobFallback(workerId);
  }

  return {
    success: true,
    data: mapRowToJob(lockedJob),
  };
}

/**
 * Releases a job lock without changing status
 * Only the owning worker can release
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
      return {
        success: false,
        error: 'Lock not owned by this worker or job not found',
      };
    }

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Exception releasing lock: ${message}`,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `fetchAndLockNextJob()` returns oldest queued job
- [ ] Locked job has status 'processing', `lockedBy`, `lockedAt`, `startedAt` set
- [ ] Two workers cannot lock the same job
- [ ] Returns null when no queued jobs exist
- [ ] `releaseJobLock()` only releases if worker owns lock
- [ ] Worker ID mismatch returns error, not success

**Estimated Effort:** Medium (60-90 min)

---

### Task 4.1.6: Create Query and Utility Functions

**File:** `/src/lib/job-queue/translation-jobs.ts`

**Description:** Implement query functions `getJobsByEntity()`, `getJobsByStatus()`, and `cleanupStaleLocks()` utility.

**Implementation Steps:**

1. Implement `getJobsByEntity()`:
   - Accept `entityType` and `entityId`
   - Query all jobs for the entity
   - Order by `createdAt` descending
   - Return array of jobs
2. Implement `getJobsByStatus()`:
   - Accept `status` and optional `limit`
   - Query jobs by status
   - Order by `createdAt` ascending (oldest first for queued)
   - Apply limit if provided
   - Return array of jobs
3. Implement `cleanupStaleLocks()`:
   - Accept optional `timeoutMinutes` (default: 5)
   - Find jobs with locks older than timeout
   - Reset `lockedBy`, `lockedAt` to null
   - Set status back to 'queued' for retry
   - Return count of cleaned up jobs
4. Add console logging for all operations

**Code Template:**

```typescript
/**
 * Gets all jobs for a specific entity
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
      return {
        success: false,
        error: `Failed to get jobs by entity: ${error.message}`,
      };
    }

    return {
      success: true,
      data: (data || []).map(mapRowToJob),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Exception getting jobs by entity: ${message}`,
    };
  }
}

/**
 * Gets jobs by status with optional limit
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
      return {
        success: false,
        error: `Failed to get jobs by status: ${error.message}`,
      };
    }

    return {
      success: true,
      data: (data || []).map(mapRowToJob),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Exception getting jobs by status: ${message}`,
    };
  }
}

/**
 * Cleans up stale locks (processing jobs locked too long)
 * Returns count of cleaned up jobs
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
    return {
      success: false,
      error: `Exception cleaning up stale locks: ${message}`,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `getJobsByEntity()` returns all jobs for entity, newest first
- [ ] `getJobsByStatus()` returns jobs filtered by status
- [ ] `getJobsByStatus()` with 'queued' orders oldest first
- [ ] `cleanupStaleLocks()` resets old locked jobs to 'queued'
- [ ] `cleanupStaleLocks()` returns count of affected jobs
- [ ] All functions handle empty results gracefully

**Estimated Effort:** Medium (45-60 min)

---

### Task 4.1.7: Create Barrel Export File

**File:** `/src/lib/job-queue/index.ts`

**Description:** Create the barrel export file for clean module imports.

**Implementation Steps:**

1. Create `index.ts` file
2. Re-export all types from `translation-jobs.types.ts`
3. Re-export all functions from `translation-jobs.ts`
4. Add module documentation comment

**Code Template:**

```typescript
/**
 * Translation Job Queue Module
 * Part of REQ-243: Translation Job Queue Module for Background Processing
 *
 * This module provides database-backed job queue functionality for
 * asynchronous translation processing.
 *
 * Usage:
 * ```typescript
 * import { createTranslationJob, fetchAndLockNextJob } from '@/lib/job-queue';
 * ```
 *
 * @module job-queue
 */

// Type exports
export type {
  SupportedLanguage,
  EntityType,
  JobStatus,
  TranslationJob,
  CreateJobParams,
  CreateBatchJobsParams,
  JobUpdateParams,
  FetchJobOptions,
  JobQueueResult,
} from './translation-jobs.types';

// Function exports
export {
  createTranslationJob,
  createBatchTranslationJobs,
  updateJobStatus,
  markJobCompleted,
  markJobFailed,
  fetchAndLockNextJob,
  releaseJobLock,
  getJobsByEntity,
  getJobsByStatus,
  cleanupStaleLocks,
} from './translation-jobs';
```

**Acceptance Criteria:**
- [ ] File created at `/src/lib/job-queue/index.ts`
- [ ] All types exported with `export type`
- [ ] All functions exported
- [ ] Module documentation comment present
- [ ] Import path `@/lib/job-queue` works correctly

**Estimated Effort:** Small (15 min)

---

### Task 4.1.8: Update TypeScript Database Types (If Needed)

**File:** `/src/lib/supabase.ts`

**Description:** Verify and update the TypeScript database types to include the `translation_jobs` table if not already present.

**Implementation Steps:**

1. Check if `translation_jobs` table is already in Database type
2. If not present, add type definition:
   - Row type with all columns
   - Insert type with optional columns
   - Update type with all optional columns
   - Relationships (none for this table)
3. Verify column types match database schema
4. Run TypeScript compilation to verify no errors

**Code Template (if needed):**

```typescript
// Add to Database['public']['Tables'] in supabase.ts

translation_jobs: {
  Row: {
    id: string
    entity_type: string
    entity_id: string
    source_language: string
    target_language: string
    status: string
    attempts: number
    error_message: string | null
    created_at: string | null
    started_at: string | null
    completed_at: string | null
    locked_by: string | null
    locked_at: string | null
  }
  Insert: {
    id?: string
    entity_type: string
    entity_id: string
    source_language?: string
    target_language: string
    status?: string
    attempts?: number
    error_message?: string | null
    created_at?: string | null
    started_at?: string | null
    completed_at?: string | null
    locked_by?: string | null
    locked_at?: string | null
  }
  Update: {
    id?: string
    entity_type?: string
    entity_id?: string
    source_language?: string
    target_language?: string
    status?: string
    attempts?: number
    error_message?: string | null
    created_at?: string | null
    started_at?: string | null
    completed_at?: string | null
    locked_by?: string | null
    locked_at?: string | null
  }
  Relationships: []
}
```

**Acceptance Criteria:**
- [ ] `translation_jobs` table present in Database type
- [ ] All columns typed correctly
- [ ] TypeScript compiles without errors
- [ ] Supabase queries type-checked correctly

**Estimated Effort:** Small (15-30 min)

---

## Implementation Order

Execute tasks in the following order for optimal dependency management:

1. **Task 4.1.8** - Update TypeScript Database Types (prerequisite check)
2. **Task 4.1.1** - Create Type Definitions File
3. **Task 4.1.2** - Create Job Insertion Function - Single Job
4. **Task 4.1.3** - Create Job Insertion Function - Batch Jobs
5. **Task 4.1.4** - Create Job Status Update Functions
6. **Task 4.1.5** - Create Job Fetching with Locking
7. **Task 4.1.6** - Create Query and Utility Functions
8. **Task 4.1.7** - Create Barrel Export File

---

## Testing Checklist

After implementation, verify:

### Unit Tests
- [ ] `createTranslationJob()` creates job with correct defaults
- [ ] `createTranslationJob()` handles duplicate gracefully
- [ ] `createBatchTranslationJobs()` creates multiple jobs
- [ ] `createBatchTranslationJobs()` filters out source language
- [ ] `updateJobStatus()` updates only specified fields
- [ ] `markJobCompleted()` sets all required fields
- [ ] `markJobFailed()` increments attempts
- [ ] `getJobsByEntity()` returns correct jobs
- [ ] `getJobsByStatus()` respects limit parameter
- [ ] `cleanupStaleLocks()` resets old locks

### Integration Tests
- [ ] Two workers cannot lock same job
- [ ] Stale lock cleanup enables job reprocessing
- [ ] Full job lifecycle: create -> lock -> complete
- [ ] Full job lifecycle: create -> lock -> fail

### Manual Verification
- [ ] Import from `@/lib/job-queue` works
- [ ] All functions accessible via import
- [ ] Console logging appears during operations
- [ ] Database records created correctly

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `/src/lib/job-queue/translation-jobs.types.ts` | Create | Type definitions |
| `/src/lib/job-queue/translation-jobs.ts` | Create | Main implementation |
| `/src/lib/job-queue/index.ts` | Create | Barrel exports |
| `/src/lib/supabase.ts` | Modify (if needed) | Add translation_jobs types |

---

## Dependencies Created

This module creates the following dependencies for downstream tasks:

| Downstream Task | Dependency |
|----------------|------------|
| Task 4.2: Job Processor | Uses `fetchAndLockNextJob()`, `markJobCompleted()`, `markJobFailed()` |
| Task 4.3: Process Translations API | Uses `fetchAndLockNextJob()`, job status functions |
| Task 4.5: Job Status API | Uses `getJobsByStatus()`, `getJobsByEntity()` |

---

## Rollback Plan

If issues occur during implementation:

1. Delete created files in `/src/lib/job-queue/`
2. Revert any changes to `/src/lib/supabase.ts`
3. No database changes required (table already exists)

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.1*
