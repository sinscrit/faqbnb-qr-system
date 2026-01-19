# REQ-351: Detailed Task Breakdown - Implement Job Prioritization for Translation Queue

**Document Created:** 2026-01-19 15:30 UTC
**Last Modified:** 2026-01-19 15:30 UTC
**Request Reference:** docs/gen_requests_epic3.md - Request #351
**Overview Document:** docs/REQ-351-implement-job-prioritization-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.6

---

## Document Purpose

This document provides granular, implementation-ready task instructions for REQ-351: Implement Job Prioritization. Each task is scoped to approximately 1 story point and includes exact file paths, code snippets, and acceptance criteria that can be executed step-by-step by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] `src/lib/job-queue/translation-jobs.ts` exists and contains job queue functions
- [ ] `src/lib/job-queue/translation-jobs.types.ts` exists with type definitions
- [ ] `src/lib/job-queue/concurrency-control.ts` exists (pattern reference)
- [ ] `src/lib/job-queue/index.ts` exists for module exports
- [ ] Supabase MCP is connected for database migrations
- [ ] `translation_jobs` table exists in database

---

## Task Summary

| Task # | Title | File(s) | Estimated Effort |
|--------|-------|---------|------------------|
| 1 | Create database migration for priority column | `supabase/migrations/` | 1 SP |
| 2 | Create priority constants and types module | `src/lib/job-queue/priority.ts` | 1 SP |
| 3 | Update TranslationJob type definition | `src/lib/job-queue/translation-jobs.types.ts` | 0.5 SP |
| 4 | Update CreateJobParams and CreateBatchJobsParams types | `src/lib/job-queue/translation-jobs.types.ts` | 0.5 SP |
| 5 | Update mapRowToJob to include priority | `src/lib/job-queue/translation-jobs.ts` | 0.5 SP |
| 6 | Update createTranslationJob to accept priority | `src/lib/job-queue/translation-jobs.ts` | 1 SP |
| 7 | Update createBatchTranslationJobs to accept priority | `src/lib/job-queue/translation-jobs.ts` | 1 SP |
| 8 | Update fetchAndLockJobFallback with priority ordering | `src/lib/job-queue/translation-jobs.ts` | 1 SP |
| 9 | Update/create RPC function for priority ordering | Database migration | 1 SP |
| 10 | Update module exports for priority utilities | `src/lib/job-queue/index.ts` | 0.5 SP |
| 11 | Write unit tests for priority module | `src/lib/job-queue/__tests__/priority.test.ts` | 1 SP |
| 12 | Write integration tests for priority ordering | `src/lib/job-queue/__tests__/` | 1 SP |

**Total Estimated Effort:** ~10 story points

---

## Detailed Task Instructions

### Task 1: Create Database Migration for Priority Column

**Objective:** Add `priority` column to `translation_jobs` table with appropriate default and index.

**File to Create:** Use Supabase MCP `apply_migration` tool

**Migration Name:** `add_priority_to_translation_jobs`

**SQL Content:**
```sql
-- Add priority column to translation_jobs table
-- REQ-351: Implement Job Prioritization
-- Priority values: 100 (urgent), 50 (high), 25 (normal/default), 10 (low/retry)

-- Add the priority column with default value
ALTER TABLE translation_jobs
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 25;

-- Create composite index for efficient job picking by priority
-- Primary sort: priority DESC (highest first)
-- Secondary sort: created_at ASC (oldest first within same priority)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_priority_queue
ON translation_jobs (status, priority DESC, created_at ASC)
WHERE status IN ('queued', 'processing');

-- Ensure existing jobs have the default priority
UPDATE translation_jobs
SET priority = 25
WHERE priority IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN translation_jobs.priority IS 'Job priority: 100=urgent, 50=high, 25=normal, 10=low. Higher values processed first.';
```

**Verification Steps:**
1. Run migration using Supabase MCP
2. Verify column exists: `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'translation_jobs' AND column_name = 'priority';`
3. Verify index exists: `SELECT indexname FROM pg_indexes WHERE tablename = 'translation_jobs' AND indexname = 'idx_translation_jobs_priority_queue';`
4. Verify existing rows have priority: `SELECT COUNT(*) FROM translation_jobs WHERE priority IS NULL;` (should be 0)

**Acceptance Criteria:**
- [ ] Migration completes without errors
- [ ] `priority` column exists with INTEGER type and DEFAULT 25
- [ ] Composite index `idx_translation_jobs_priority_queue` exists
- [ ] All existing jobs have priority = 25

---

### Task 2: Create Priority Constants and Types Module

**Objective:** Create the priority module with constants, types, and utility functions.

**File to Create:** `src/lib/job-queue/priority.ts`

**Complete File Content:**
```typescript
/**
 * Translation Job Priority Module
 * Part of REQ-351: Implement Job Prioritization
 *
 * Defines priority levels and utilities for assigning priorities
 * to translation jobs based on creation context and timing.
 *
 * Priority Levels:
 * - URGENT (100): Recently created content (last 5 minutes)
 * - HIGH (50): Updated content
 * - NORMAL (25): Batch imports (default)
 * - LOW (10): Retry failed translations
 *
 * Job Picker Order:
 * - Primary: priority DESC (highest first)
 * - Secondary: created_at ASC (oldest first within priority)
 *
 * @module job-queue/priority
 * @created 2026-01-19
 */

// ===========================================================================
// Constants
// ===========================================================================

/**
 * Priority levels for translation jobs
 * Higher values = higher priority (processed first)
 */
export const JobPriority = {
  /** Recently created content (last 5 minutes) */
  URGENT: 100,
  /** Updated content */
  HIGH: 50,
  /** Batch imports */
  NORMAL: 25,
  /** Retry failed translations */
  LOW: 10,
} as const;

/** Default threshold for "recently created" in minutes */
export const RECENT_CREATION_THRESHOLD_MINUTES = 5;

// ===========================================================================
// Types
// ===========================================================================

/** Type for valid priority level values */
export type JobPriorityLevel = typeof JobPriority[keyof typeof JobPriority];

/** Context for determining job priority */
export type JobCreationContext = 'create' | 'update' | 'batch_import' | 'retry';

/** Options for calculating job priority */
export interface PriorityCalculationOptions {
  /** The context in which the job is being created */
  context: JobCreationContext;
  /** Entity creation timestamp (for determining if recently created) */
  entityCreatedAt?: Date | string;
  /** Override the calculated priority */
  priorityOverride?: JobPriorityLevel;
}

// ===========================================================================
// Utility Functions
// ===========================================================================

/**
 * Check if content was recently created (within threshold)
 *
 * @param createdAt - The creation timestamp
 * @param thresholdMinutes - Minutes threshold (default: 5)
 * @returns True if created within threshold
 *
 * @example
 * ```typescript
 * const recent = isRecentlyCreated(new Date()); // true
 * const old = isRecentlyCreated(new Date(Date.now() - 10 * 60 * 1000)); // false
 * ```
 */
export function isRecentlyCreated(
  createdAt: Date | string,
  thresholdMinutes: number = RECENT_CREATION_THRESHOLD_MINUTES
): boolean {
  const createdTime = typeof createdAt === 'string'
    ? new Date(createdAt).getTime()
    : createdAt.getTime();
  const threshold = Date.now() - thresholdMinutes * 60 * 1000;
  return createdTime >= threshold;
}

/**
 * Calculate the priority for a translation job based on context
 *
 * Priority determination:
 * 1. If priorityOverride provided, use it
 * 2. For 'create' context with recent creation, use URGENT
 * 3. For 'create'/'update' context, use HIGH
 * 4. For 'batch_import' context, use NORMAL
 * 5. For 'retry' context, use LOW
 *
 * @param options - Priority calculation options
 * @returns The calculated priority level
 *
 * @example
 * ```typescript
 * // Recently created content gets URGENT priority
 * const priority = calculateJobPriority({
 *   context: 'create',
 *   entityCreatedAt: new Date(),
 * }); // Returns 100
 *
 * // Retry gets LOW priority
 * const retryPriority = calculateJobPriority({
 *   context: 'retry',
 * }); // Returns 10
 * ```
 */
export function calculateJobPriority(
  options: PriorityCalculationOptions
): JobPriorityLevel {
  // Allow explicit override
  if (options.priorityOverride !== undefined) {
    return options.priorityOverride;
  }

  switch (options.context) {
    case 'create':
      // Check if recently created (within 5 minutes)
      if (options.entityCreatedAt && isRecentlyCreated(options.entityCreatedAt)) {
        return JobPriority.URGENT;
      }
      return JobPriority.HIGH;

    case 'update':
      return JobPriority.HIGH;

    case 'batch_import':
      return JobPriority.NORMAL;

    case 'retry':
      return JobPriority.LOW;

    default:
      return JobPriority.NORMAL;
  }
}

/**
 * Get human-readable priority label for display
 *
 * @param priority - The priority value
 * @returns Human-readable label
 *
 * @example
 * ```typescript
 * getPriorityLabel(100); // 'Urgent'
 * getPriorityLabel(50);  // 'High'
 * getPriorityLabel(25);  // 'Normal'
 * getPriorityLabel(10);  // 'Low'
 * ```
 */
export function getPriorityLabel(priority: number): string {
  if (priority >= JobPriority.URGENT) return 'Urgent';
  if (priority >= JobPriority.HIGH) return 'High';
  if (priority >= JobPriority.NORMAL) return 'Normal';
  return 'Low';
}

/**
 * Validate that a priority value is a valid JobPriorityLevel
 *
 * @param priority - The priority value to validate
 * @returns True if priority is a valid JobPriorityLevel
 *
 * @example
 * ```typescript
 * isValidPriority(100); // true
 * isValidPriority(75);  // false
 * ```
 */
export function isValidPriority(priority: number): priority is JobPriorityLevel {
  return Object.values(JobPriority).includes(priority as JobPriorityLevel);
}

/**
 * Get all priority levels sorted from highest to lowest
 *
 * @returns Array of priority levels
 */
export function getAllPriorityLevels(): JobPriorityLevel[] {
  return [JobPriority.URGENT, JobPriority.HIGH, JobPriority.NORMAL, JobPriority.LOW];
}
```

**Verification Steps:**
1. File compiles without TypeScript errors
2. All functions are exported correctly
3. JSDoc comments are complete

**Acceptance Criteria:**
- [ ] File created at `src/lib/job-queue/priority.ts`
- [ ] `JobPriority` constant object defined with values 100, 50, 25, 10
- [ ] `RECENT_CREATION_THRESHOLD_MINUTES` constant defined as 5
- [ ] `JobPriorityLevel` type defined
- [ ] `JobCreationContext` type defined
- [ ] `PriorityCalculationOptions` interface defined
- [ ] `isRecentlyCreated()` function implemented
- [ ] `calculateJobPriority()` function implemented
- [ ] `getPriorityLabel()` function implemented
- [ ] `isValidPriority()` function implemented
- [ ] All functions have JSDoc documentation

---

### Task 3: Update TranslationJob Type Definition

**Objective:** Add `priority` field to the `TranslationJob` interface.

**File to Modify:** `src/lib/job-queue/translation-jobs.types.ts`

**Location:** Find the `TranslationJob` interface (around line 23-37)

**Current Code:**
```typescript
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
```

**Updated Code:**
```typescript
/**
 * Represents a translation job in the queue
 * Maps to the translation_jobs database table
 */
export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  /** Job priority (higher = more urgent, default: 25) */
  priority: number;
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}
```

**Acceptance Criteria:**
- [ ] `priority: number` field added to `TranslationJob` interface
- [ ] JSDoc comment added for the priority field
- [ ] No TypeScript compilation errors

---

### Task 4: Update CreateJobParams and CreateBatchJobsParams Types

**Objective:** Add optional `priority` field to job creation parameter interfaces.

**File to Modify:** `src/lib/job-queue/translation-jobs.types.ts`

**Location:** Find `CreateJobParams` interface (around line 42-47) and `CreateBatchJobsParams` interface (around line 52-57)

**Current Code for CreateJobParams:**
```typescript
export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}
```

**Updated Code for CreateJobParams:**
```typescript
/**
 * Parameters for creating a single translation job
 */
export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  /** Priority level for the job (default: 25 = NORMAL) */
  priority?: number;
}
```

**Current Code for CreateBatchJobsParams:**
```typescript
export interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
}
```

**Updated Code for CreateBatchJobsParams:**
```typescript
/**
 * Parameters for creating translation jobs for multiple target languages
 */
export interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  /** Priority level for all jobs in batch (default: 25 = NORMAL) */
  priority?: number;
}
```

**Acceptance Criteria:**
- [ ] `priority?: number` field added to `CreateJobParams`
- [ ] `priority?: number` field added to `CreateBatchJobsParams`
- [ ] JSDoc comments added for both priority fields
- [ ] No TypeScript compilation errors

---

### Task 5: Update mapRowToJob to Include Priority

**Objective:** Modify the row mapping function to include the priority field.

**File to Modify:** `src/lib/job-queue/translation-jobs.ts`

**Location:** Find `mapRowToJob` function (around line 26-42)

**Current Code:**
```typescript
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
```

**Updated Code:**
```typescript
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
    priority: (row.priority as number) ?? 25,
    attempts: (row.attempts as number) ?? 0,
    errorMessage: row.error_message as string | null,
    createdAt: row.created_at as string,
    startedAt: row.started_at as string | null,
    completedAt: row.completed_at as string | null,
    lockedBy: row.locked_by as string | null,
    lockedAt: row.locked_at as string | null,
  };
}
```

**Acceptance Criteria:**
- [ ] `priority` field added to mapRowToJob return object
- [ ] Default value of 25 applied when priority is null/undefined
- [ ] No TypeScript compilation errors

---

### Task 6: Update createTranslationJob to Accept Priority

**Objective:** Modify `createTranslationJob` function to accept and store priority.

**File to Modify:** `src/lib/job-queue/translation-jobs.ts`

**Location:** Find `createTranslationJob` function (around line 50-133)

**Changes Required:**

1. Extract priority from params with default value
2. Include priority in the upsert data
3. Log priority in debug output

**Find this section (around line 64-79):**
```typescript
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
```

**Replace with:**
```typescript
// Default priority is NORMAL (25) if not specified
const priority = params.priority ?? 25;

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
      priority: priority,
    },
    {
      onConflict: 'entity_type,entity_id,target_language',
      ignoreDuplicates: true,
    }
  )
```

**Also update the log statement (around line 57-62):**
```typescript
console.log('JOB_QUEUE: Creating translation job', {
  entityType,
  entityId,
  sourceLanguage,
  targetLanguage,
  priority,
});
```

**Acceptance Criteria:**
- [ ] `priority` extracted from params with default value of 25
- [ ] `priority` included in upsert data object
- [ ] Priority logged in debug output
- [ ] No TypeScript compilation errors

---

### Task 7: Update createBatchTranslationJobs to Accept Priority

**Objective:** Modify `createBatchTranslationJobs` function to accept and store priority.

**File to Modify:** `src/lib/job-queue/translation-jobs.ts`

**Location:** Find `createBatchTranslationJobs` function (around line 141-211)

**Changes Required:**

1. Extract priority from params with default value
2. Include priority in job records
3. Log priority in debug output

**Find this section (around line 167-174):**
```typescript
const jobRecords = validTargets.map((targetLanguage) => ({
  entity_type: entityType,
  entity_id: entityId,
  source_language: sourceLanguage,
  target_language: targetLanguage,
  status: 'queued' as const,
  attempts: 0,
}));
```

**Replace with:**
```typescript
// Default priority is NORMAL (25) if not specified
const priority = params.priority ?? 25;

const jobRecords = validTargets.map((targetLanguage) => ({
  entity_type: entityType,
  entity_id: entityId,
  source_language: sourceLanguage,
  target_language: targetLanguage,
  status: 'queued' as const,
  attempts: 0,
  priority: priority,
}));
```

**Also update the log statement (around line 160-165):**
```typescript
console.log('JOB_QUEUE: Creating batch translation jobs', {
  entityType,
  entityId,
  sourceLanguage,
  targetLanguages: validTargets,
  priority,
});
```

**Acceptance Criteria:**
- [ ] `priority` extracted from params with default value of 25
- [ ] `priority` included in all job records
- [ ] Priority logged in debug output
- [ ] No TypeScript compilation errors

---

### Task 8: Update fetchAndLockJobFallback with Priority Ordering

**Objective:** Modify the fallback job fetching to order by priority DESC, then created_at ASC.

**File to Modify:** `src/lib/job-queue/translation-jobs.ts`

**Location:** Find `fetchAndLockJobFallback` function (around line 405-460)

**Find this section (around line 411-417):**
```typescript
const { data: jobs, error: selectError } = await supabaseAdmin
  .from('translation_jobs')
  .select('*')
  .eq('status', 'queued')
  .is('locked_by', null)
  .order('created_at', { ascending: true })
  .limit(1);
```

**Replace with:**
```typescript
// Order by priority DESC (highest first), then created_at ASC (oldest first within same priority)
const { data: jobs, error: selectError } = await supabaseAdmin
  .from('translation_jobs')
  .select('*')
  .eq('status', 'queued')
  .is('locked_by', null)
  .order('priority', { ascending: false })
  .order('created_at', { ascending: true })
  .limit(1);
```

**Also update the comment at line ~410:**
```typescript
// Find highest priority queued job that's not locked (priority DESC, created_at ASC)
```

**Acceptance Criteria:**
- [ ] Query orders by `priority` descending first
- [ ] Query orders by `created_at` ascending second
- [ ] Comment updated to reflect priority ordering
- [ ] No TypeScript compilation errors

---

### Task 9: Update/Create RPC Function for Priority Ordering

**Objective:** Create or update the PostgreSQL RPC function to order by priority.

**File to Create:** Use Supabase MCP `apply_migration` tool

**Migration Name:** `update_fetch_job_rpc_priority`

**SQL Content:**
```sql
-- Update the fetch_and_lock_translation_job RPC function to use priority ordering
-- REQ-351: Implement Job Prioritization

CREATE OR REPLACE FUNCTION fetch_and_lock_translation_job(p_worker_id TEXT)
RETURNS SETOF translation_jobs AS $$
DECLARE
  locked_job translation_jobs%ROWTYPE;
BEGIN
  -- Select and lock the highest priority queued job
  -- Priority ordering: priority DESC (highest first), created_at ASC (oldest first within priority)
  SELECT * INTO locked_job
  FROM translation_jobs
  WHERE status = 'queued'
    AND locked_by IS NULL
  ORDER BY priority DESC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    -- Lock the job and mark as processing
    UPDATE translation_jobs
    SET
      status = 'processing',
      locked_by = p_worker_id,
      locked_at = NOW(),
      started_at = NOW()
    WHERE id = locked_job.id;

    -- Return the updated job
    RETURN QUERY SELECT * FROM translation_jobs WHERE id = locked_job.id;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION fetch_and_lock_translation_job(TEXT) IS
'Atomically fetch and lock the highest priority translation job.
Returns the job with highest priority (DESC) and oldest created_at (ASC) within same priority.
Uses FOR UPDATE SKIP LOCKED for concurrent safety.
Part of REQ-351: Job Prioritization.';
```

**Verification Steps:**
1. Run migration using Supabase MCP
2. Verify function exists: `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'fetch_and_lock_translation_job';`
3. Test function returns jobs in priority order

**Acceptance Criteria:**
- [ ] Migration completes without errors
- [ ] RPC function `fetch_and_lock_translation_job` is updated
- [ ] Function orders by `priority DESC, created_at ASC`
- [ ] `FOR UPDATE SKIP LOCKED` is preserved for concurrent safety

---

### Task 10: Update Module Exports for Priority Utilities

**Objective:** Export priority constants, types, and functions from the job-queue module.

**File to Modify:** `src/lib/job-queue/index.ts`

**Location:** Add new exports at the end of the file (after line 102)

**Code to Add:**
```typescript
// Priority utilities (REQ-351)
export {
  JobPriority,
  RECENT_CREATION_THRESHOLD_MINUTES,
  calculateJobPriority,
  isRecentlyCreated,
  getPriorityLabel,
  isValidPriority,
  getAllPriorityLevels,
} from './priority';

// Priority types (REQ-351)
export type {
  JobPriorityLevel,
  JobCreationContext,
  PriorityCalculationOptions,
} from './priority';
```

**Verification Steps:**
1. Verify imports work: Create a test file that imports from `@/lib/job-queue`
2. Verify TypeScript compilation succeeds

**Acceptance Criteria:**
- [ ] All priority functions exported
- [ ] All priority types exported
- [ ] All priority constants exported
- [ ] No TypeScript compilation errors
- [ ] Imports work correctly from `@/lib/job-queue`

---

### Task 11: Write Unit Tests for Priority Module

**Objective:** Create comprehensive unit tests for the priority module.

**File to Create:** `src/lib/job-queue/__tests__/priority.test.ts`

**Complete File Content:**
```typescript
/**
 * Unit Tests for Translation Job Priority Module
 * Part of REQ-351: Implement Job Prioritization
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  JobPriority,
  RECENT_CREATION_THRESHOLD_MINUTES,
  calculateJobPriority,
  isRecentlyCreated,
  getPriorityLabel,
  isValidPriority,
  getAllPriorityLevels,
} from '../priority';

describe('priority', () => {
  describe('JobPriority constants', () => {
    it('defines URGENT as 100', () => {
      expect(JobPriority.URGENT).toBe(100);
    });

    it('defines HIGH as 50', () => {
      expect(JobPriority.HIGH).toBe(50);
    });

    it('defines NORMAL as 25', () => {
      expect(JobPriority.NORMAL).toBe(25);
    });

    it('defines LOW as 10', () => {
      expect(JobPriority.LOW).toBe(10);
    });

    it('has URGENT > HIGH > NORMAL > LOW', () => {
      expect(JobPriority.URGENT).toBeGreaterThan(JobPriority.HIGH);
      expect(JobPriority.HIGH).toBeGreaterThan(JobPriority.NORMAL);
      expect(JobPriority.NORMAL).toBeGreaterThan(JobPriority.LOW);
    });
  });

  describe('RECENT_CREATION_THRESHOLD_MINUTES', () => {
    it('is set to 5 minutes', () => {
      expect(RECENT_CREATION_THRESHOLD_MINUTES).toBe(5);
    });
  });

  describe('isRecentlyCreated', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-19T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true for content created now', () => {
      const now = new Date();
      expect(isRecentlyCreated(now)).toBe(true);
    });

    it('returns true for content created 2 minutes ago', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      expect(isRecentlyCreated(twoMinutesAgo)).toBe(true);
    });

    it('returns true for content created exactly at threshold', () => {
      const atThreshold = new Date(Date.now() - 5 * 60 * 1000);
      expect(isRecentlyCreated(atThreshold)).toBe(true);
    });

    it('returns false for content created 6 minutes ago', () => {
      const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
      expect(isRecentlyCreated(sixMinutesAgo)).toBe(false);
    });

    it('returns false for content created 10 minutes ago', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(isRecentlyCreated(tenMinutesAgo)).toBe(false);
    });

    it('accepts string dates', () => {
      const recent = new Date().toISOString();
      expect(isRecentlyCreated(recent)).toBe(true);
    });

    it('accepts string dates for old content', () => {
      const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      expect(isRecentlyCreated(old)).toBe(false);
    });

    it('uses custom threshold when provided', () => {
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
      expect(isRecentlyCreated(threeMinutesAgo, 2)).toBe(false);
      expect(isRecentlyCreated(threeMinutesAgo, 5)).toBe(true);
    });
  });

  describe('calculateJobPriority', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-19T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('context: create', () => {
      it('returns URGENT for recently created content', () => {
        const result = calculateJobPriority({
          context: 'create',
          entityCreatedAt: new Date(),
        });
        expect(result).toBe(JobPriority.URGENT);
      });

      it('returns HIGH for old created content', () => {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const result = calculateJobPriority({
          context: 'create',
          entityCreatedAt: tenMinutesAgo,
        });
        expect(result).toBe(JobPriority.HIGH);
      });

      it('returns HIGH when entityCreatedAt not provided', () => {
        const result = calculateJobPriority({
          context: 'create',
        });
        expect(result).toBe(JobPriority.HIGH);
      });
    });

    describe('context: update', () => {
      it('returns HIGH for updates', () => {
        const result = calculateJobPriority({ context: 'update' });
        expect(result).toBe(JobPriority.HIGH);
      });

      it('ignores entityCreatedAt for updates', () => {
        const result = calculateJobPriority({
          context: 'update',
          entityCreatedAt: new Date(),
        });
        expect(result).toBe(JobPriority.HIGH);
      });
    });

    describe('context: batch_import', () => {
      it('returns NORMAL for batch imports', () => {
        const result = calculateJobPriority({ context: 'batch_import' });
        expect(result).toBe(JobPriority.NORMAL);
      });
    });

    describe('context: retry', () => {
      it('returns LOW for retries', () => {
        const result = calculateJobPriority({ context: 'retry' });
        expect(result).toBe(JobPriority.LOW);
      });
    });

    describe('priorityOverride', () => {
      it('uses override when provided', () => {
        const result = calculateJobPriority({
          context: 'retry',
          priorityOverride: JobPriority.URGENT,
        });
        expect(result).toBe(JobPriority.URGENT);
      });

      it('override takes precedence over context', () => {
        const result = calculateJobPriority({
          context: 'create',
          entityCreatedAt: new Date(),
          priorityOverride: JobPriority.LOW,
        });
        expect(result).toBe(JobPriority.LOW);
      });
    });
  });

  describe('getPriorityLabel', () => {
    it('returns "Urgent" for priority >= 100', () => {
      expect(getPriorityLabel(100)).toBe('Urgent');
      expect(getPriorityLabel(150)).toBe('Urgent');
    });

    it('returns "High" for priority >= 50 and < 100', () => {
      expect(getPriorityLabel(50)).toBe('High');
      expect(getPriorityLabel(75)).toBe('High');
      expect(getPriorityLabel(99)).toBe('High');
    });

    it('returns "Normal" for priority >= 25 and < 50', () => {
      expect(getPriorityLabel(25)).toBe('Normal');
      expect(getPriorityLabel(30)).toBe('Normal');
      expect(getPriorityLabel(49)).toBe('Normal');
    });

    it('returns "Low" for priority < 25', () => {
      expect(getPriorityLabel(10)).toBe('Low');
      expect(getPriorityLabel(24)).toBe('Low');
      expect(getPriorityLabel(0)).toBe('Low');
      expect(getPriorityLabel(-5)).toBe('Low');
    });
  });

  describe('isValidPriority', () => {
    it('returns true for valid priority levels', () => {
      expect(isValidPriority(100)).toBe(true);
      expect(isValidPriority(50)).toBe(true);
      expect(isValidPriority(25)).toBe(true);
      expect(isValidPriority(10)).toBe(true);
    });

    it('returns false for invalid priority values', () => {
      expect(isValidPriority(75)).toBe(false);
      expect(isValidPriority(0)).toBe(false);
      expect(isValidPriority(-10)).toBe(false);
      expect(isValidPriority(1000)).toBe(false);
    });
  });

  describe('getAllPriorityLevels', () => {
    it('returns all priority levels sorted from highest to lowest', () => {
      const levels = getAllPriorityLevels();
      expect(levels).toEqual([100, 50, 25, 10]);
    });

    it('returns an array of length 4', () => {
      expect(getAllPriorityLevels()).toHaveLength(4);
    });
  });
});
```

**Run Tests:**
```bash
npm run test -- src/lib/job-queue/__tests__/priority.test.ts
```

**Acceptance Criteria:**
- [ ] Test file created at `src/lib/job-queue/__tests__/priority.test.ts`
- [ ] All tests pass
- [ ] Tests cover all priority constants
- [ ] Tests cover `isRecentlyCreated` with various timestamps
- [ ] Tests cover `calculateJobPriority` for all contexts
- [ ] Tests cover priority override functionality
- [ ] Tests cover `getPriorityLabel` for all ranges
- [ ] Tests cover `isValidPriority` for valid and invalid values

---

### Task 12: Write Integration Tests for Priority Ordering

**Objective:** Create integration tests to verify jobs are fetched in priority order.

**File to Create:** `src/lib/job-queue/__tests__/priority-ordering.integration.test.ts`

**Complete File Content:**
```typescript
/**
 * Integration Tests for Translation Job Priority Ordering
 * Part of REQ-351: Implement Job Prioritization
 *
 * Tests that jobs are fetched in correct priority order:
 * - Primary: priority DESC (highest first)
 * - Secondary: created_at ASC (oldest first within same priority)
 *
 * @created 2026-01-19
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase';
import {
  createTranslationJob,
  fetchAndLockNextJob,
  markJobCompleted,
  JobPriority,
} from '../index';
import type { EntityType, SupportedLanguage } from '../translation-jobs.types';

// Test entity IDs - use unique IDs for each test run
const generateTestId = () => `test-priority-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('Priority Ordering Integration Tests', () => {
  const testEntityIds: string[] = [];

  // Cleanup test data after each test
  afterEach(async () => {
    if (testEntityIds.length > 0) {
      await supabaseAdmin
        .from('translation_jobs')
        .delete()
        .in('entity_id', testEntityIds);
      testEntityIds.length = 0;
    }
  });

  describe('Job creation with priority', () => {
    it('creates job with default priority 25', async () => {
      const entityId = generateTestId();
      testEntityIds.push(entityId);

      const result = await createTranslationJob({
        entityType: 'item',
        entityId,
        targetLanguage: 'fr',
      });

      expect(result.success).toBe(true);
      expect(result.data?.priority).toBe(25);
    });

    it('creates job with specified priority', async () => {
      const entityId = generateTestId();
      testEntityIds.push(entityId);

      const result = await createTranslationJob({
        entityType: 'item',
        entityId,
        targetLanguage: 'fr',
        priority: JobPriority.URGENT,
      });

      expect(result.success).toBe(true);
      expect(result.data?.priority).toBe(100);
    });

    it('creates job with LOW priority', async () => {
      const entityId = generateTestId();
      testEntityIds.push(entityId);

      const result = await createTranslationJob({
        entityType: 'item',
        entityId,
        targetLanguage: 'de',
        priority: JobPriority.LOW,
      });

      expect(result.success).toBe(true);
      expect(result.data?.priority).toBe(10);
    });
  });

  describe('Job fetching by priority order', () => {
    it('fetches highest priority job first', async () => {
      // Create jobs in reverse priority order
      const lowEntityId = generateTestId();
      const highEntityId = generateTestId();
      const urgentEntityId = generateTestId();
      testEntityIds.push(lowEntityId, highEntityId, urgentEntityId);

      // Create LOW priority first
      await createTranslationJob({
        entityType: 'item',
        entityId: lowEntityId,
        targetLanguage: 'fr',
        priority: JobPriority.LOW,
      });

      // Create HIGH priority second
      await createTranslationJob({
        entityType: 'item',
        entityId: highEntityId,
        targetLanguage: 'fr',
        priority: JobPriority.HIGH,
      });

      // Create URGENT priority last
      await createTranslationJob({
        entityType: 'item',
        entityId: urgentEntityId,
        targetLanguage: 'fr',
        priority: JobPriority.URGENT,
      });

      // Fetch should return URGENT first (highest priority)
      const workerId = `test-worker-${Date.now()}`;
      const result = await fetchAndLockNextJob({ workerId });

      expect(result.success).toBe(true);
      expect(result.data?.entityId).toBe(urgentEntityId);
      expect(result.data?.priority).toBe(JobPriority.URGENT);

      // Complete the job to continue testing
      if (result.data) {
        await markJobCompleted(result.data.id);
      }

      // Fetch should return HIGH second
      const result2 = await fetchAndLockNextJob({ workerId });
      expect(result2.success).toBe(true);
      expect(result2.data?.entityId).toBe(highEntityId);
      expect(result2.data?.priority).toBe(JobPriority.HIGH);

      if (result2.data) {
        await markJobCompleted(result2.data.id);
      }

      // Fetch should return LOW last
      const result3 = await fetchAndLockNextJob({ workerId });
      expect(result3.success).toBe(true);
      expect(result3.data?.entityId).toBe(lowEntityId);
      expect(result3.data?.priority).toBe(JobPriority.LOW);

      if (result3.data) {
        await markJobCompleted(result3.data.id);
      }
    });

    it('fetches oldest job first within same priority', async () => {
      // Create multiple jobs with same priority
      const firstEntityId = generateTestId();
      const secondEntityId = generateTestId();
      const thirdEntityId = generateTestId();
      testEntityIds.push(firstEntityId, secondEntityId, thirdEntityId);

      // Create with small delays to ensure different created_at
      await createTranslationJob({
        entityType: 'item',
        entityId: firstEntityId,
        targetLanguage: 'fr',
        priority: JobPriority.NORMAL,
      });

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));

      await createTranslationJob({
        entityType: 'item',
        entityId: secondEntityId,
        targetLanguage: 'fr',
        priority: JobPriority.NORMAL,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      await createTranslationJob({
        entityType: 'item',
        entityId: thirdEntityId,
        targetLanguage: 'fr',
        priority: JobPriority.NORMAL,
      });

      // Fetch should return first (oldest) first
      const workerId = `test-worker-${Date.now()}`;
      const result1 = await fetchAndLockNextJob({ workerId });
      expect(result1.success).toBe(true);
      expect(result1.data?.entityId).toBe(firstEntityId);

      if (result1.data) await markJobCompleted(result1.data.id);

      // Fetch should return second
      const result2 = await fetchAndLockNextJob({ workerId });
      expect(result2.success).toBe(true);
      expect(result2.data?.entityId).toBe(secondEntityId);

      if (result2.data) await markJobCompleted(result2.data.id);

      // Fetch should return third
      const result3 = await fetchAndLockNextJob({ workerId });
      expect(result3.success).toBe(true);
      expect(result3.data?.entityId).toBe(thirdEntityId);

      if (result3.data) await markJobCompleted(result3.data.id);
    });

    it('handles mixed priorities correctly', async () => {
      // Create jobs in mixed order
      const entities = [
        { id: generateTestId(), priority: JobPriority.NORMAL, order: 1 },
        { id: generateTestId(), priority: JobPriority.URGENT, order: 2 },
        { id: generateTestId(), priority: JobPriority.LOW, order: 3 },
        { id: generateTestId(), priority: JobPriority.HIGH, order: 4 },
        { id: generateTestId(), priority: JobPriority.NORMAL, order: 5 },
      ];

      for (const e of entities) {
        testEntityIds.push(e.id);
        await createTranslationJob({
          entityType: 'article',
          entityId: e.id,
          targetLanguage: 'es',
          priority: e.priority,
        });
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Expected order: URGENT, HIGH, NORMAL(order=1), NORMAL(order=5), LOW
      const workerId = `test-worker-${Date.now()}`;
      const expectedOrder = [
        { id: entities[1].id, priority: JobPriority.URGENT }, // order=2, URGENT
        { id: entities[3].id, priority: JobPriority.HIGH },   // order=4, HIGH
        { id: entities[0].id, priority: JobPriority.NORMAL }, // order=1, NORMAL (older)
        { id: entities[4].id, priority: JobPriority.NORMAL }, // order=5, NORMAL (newer)
        { id: entities[2].id, priority: JobPriority.LOW },    // order=3, LOW
      ];

      for (const expected of expectedOrder) {
        const result = await fetchAndLockNextJob({ workerId });
        expect(result.success).toBe(true);
        expect(result.data?.entityId).toBe(expected.id);
        expect(result.data?.priority).toBe(expected.priority);

        if (result.data) await markJobCompleted(result.data.id);
      }
    });
  });
});
```

**Run Tests:**
```bash
npm run test -- src/lib/job-queue/__tests__/priority-ordering.integration.test.ts
```

**Note:** Integration tests require database connection. Ensure test environment is configured.

**Acceptance Criteria:**
- [ ] Test file created
- [ ] Tests verify jobs created with correct priority values
- [ ] Tests verify highest priority jobs fetched first
- [ ] Tests verify oldest jobs fetched first within same priority
- [ ] Tests verify mixed priority scenarios work correctly
- [ ] All tests pass

---

## Post-Implementation Verification

After completing all tasks, run these verification steps:

### 1. Run All Tests
```bash
npm run test -- src/lib/job-queue/__tests__/priority
```

### 2. Type Check
```bash
npx tsc --noEmit
```

### 3. Verify Database Schema
```sql
-- Run via Supabase MCP execute_sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'translation_jobs'
AND column_name = 'priority';
```

### 4. Verify Index
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
AND indexname = 'idx_translation_jobs_priority_queue';
```

### 5. Manual Test Priority Ordering
```sql
-- Insert test jobs with different priorities
INSERT INTO translation_jobs (entity_type, entity_id, source_language, target_language, status, priority)
VALUES
  ('item', 'test-low', 'en', 'fr', 'queued', 10),
  ('item', 'test-high', 'en', 'fr', 'queued', 50),
  ('item', 'test-urgent', 'en', 'fr', 'queued', 100);

-- Verify order
SELECT id, entity_id, priority, created_at
FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC;

-- Cleanup
DELETE FROM translation_jobs WHERE entity_id LIKE 'test-%';
```

---

## Acceptance Criteria Summary

### Database
- [ ] `priority` column exists on `translation_jobs` table
- [ ] Default value is 25 (NORMAL)
- [ ] Composite index `idx_translation_jobs_priority_queue` exists
- [ ] RPC function `fetch_and_lock_translation_job` uses priority ordering

### Code
- [ ] `src/lib/job-queue/priority.ts` created with all functions
- [ ] `TranslationJob` interface includes `priority` field
- [ ] `CreateJobParams` interface includes optional `priority` field
- [ ] `CreateBatchJobsParams` interface includes optional `priority` field
- [ ] `mapRowToJob` maps priority field with default 25
- [ ] `createTranslationJob` accepts and stores priority
- [ ] `createBatchTranslationJobs` accepts and stores priority
- [ ] `fetchAndLockJobFallback` orders by priority DESC, created_at ASC
- [ ] All priority utilities exported from `src/lib/job-queue/index.ts`

### Tests
- [ ] Unit tests for priority module pass
- [ ] Integration tests for priority ordering pass
- [ ] TypeScript compilation succeeds with no errors

### Functional
- [ ] Priority 100 jobs are picked before priority 50 jobs
- [ ] Priority 50 jobs are picked before priority 25 jobs
- [ ] Priority 25 jobs are picked before priority 10 jobs
- [ ] Within same priority, older jobs are picked before newer jobs

---

## References

- **Request:** docs/gen_requests_epic3.md - Request #351
- **Overview:** docs/REQ-351-implement-job-prioritization-overview.md
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Task 3.6)
- **Pattern Reference:** `src/lib/job-queue/concurrency-control.ts`
- **Type Reference:** `src/lib/job-queue/translation-jobs.types.ts`
- **Function Reference:** `src/lib/job-queue/translation-jobs.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 3.6: Implement job prioritization*
