# Detailed Task Breakdown: REQ-E03-018 - Implement Job Prioritization

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 14:45:00 UTC
**Request ID:** REQ-E03-018
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.6
**Status:** Ready for Implementation
**Estimated Effort:** 4-6 story points

---

## Overview

This document provides a detailed, step-by-step implementation breakdown for the job prioritization system. The system implements a four-tier priority scheme that ensures recently created content receives immediate translation attention while batch imports and retries are processed at lower priority levels.

### Prerequisites

Before implementing this task, ensure the following are complete:
- Epic 1 Foundation complete (translation tables, job queue infrastructure)
- REQ-E03-001: Content translation module structure
- REQ-E03-013: Enhanced job processor routing logic

### Success Criteria

1. Priority calculation utility function exists and returns correct numeric values
2. Priority field is added to translation_jobs table with database migration
3. Job picker query orders by priority DESC, created_at ASC
4. Priority is calculated and stored at job creation time
5. All acceptance criteria from REQ-E03-018 are met

---

## Task Breakdown

### Task 1: Create Priority Constants and Types Module

**File:** `/src/lib/job-queue/priority.ts`
**Effort:** 1 story point
**Dependencies:** None

#### 1.1 Create the priority.ts file with constants

Create the new file at `/src/lib/job-queue/priority.ts`:

```typescript
/**
 * Job Priority Utilities
 * Part of REQ-E03-018: Implement Job Prioritization
 *
 * Provides priority calculation for translation jobs based on:
 * - Content recency (new content gets highest priority)
 * - Operation type (updates vs batch imports vs retries)
 */
```

#### 1.2 Define PRIORITY_LEVELS constant

Add the following constant definition:

```typescript
/**
 * Priority levels for translation jobs
 * Higher values = more urgent processing
 */
export const PRIORITY_LEVELS = {
  URGENT: 100,    // Recently created content (< 5 minutes)
  HIGH: 50,       // Updated content
  NORMAL: 25,     // Batch imports
  LOW: 10,        // Retry operations
} as const;
```

**Verification:** TypeScript should compile without errors when importing this constant.

#### 1.3 Define PriorityLevel type

Add the type definition:

```typescript
/**
 * Type representing valid priority values
 */
export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];
```

**Verification:** `PriorityLevel` should only accept values 10, 25, 50, or 100.

#### 1.4 Define RECENT_CONTENT_THRESHOLD_MINUTES constant

Add the threshold constant:

```typescript
/** Threshold in minutes for "recent" content classification */
export const RECENT_CONTENT_THRESHOLD_MINUTES = 5;
```

#### 1.5 Define PriorityCalculationOptions interface

Add the options interface:

```typescript
/**
 * Options for calculating job priority
 */
export interface PriorityCalculationOptions {
  /** When the content entity was created (ISO string or Date) */
  contentCreatedAt?: string | Date;
  /** When the translation job was created (ISO string or Date) */
  jobCreatedAt?: string | Date;
  /** Number of retry attempts already made */
  retryCount?: number;
  /** Batch import identifier (if from bulk import) */
  batchId?: string | null;
}
```

**Acceptance Criteria Addressed:**
- [ ] TypeScript types include priority field in translation job interface (partial - types defined)

---

### Task 2: Implement Helper Functions

**File:** `/src/lib/job-queue/priority.ts`
**Effort:** 1 story point
**Dependencies:** Task 1

#### 2.1 Implement isRecentContent function

Add the helper function:

```typescript
/**
 * Checks if content was created recently (within threshold)
 *
 * @param contentCreatedAt - When the content entity was created
 * @param jobCreatedAt - When the translation job was created
 * @param thresholdMinutes - Minutes threshold for "recent" (default: 5)
 * @returns true if content was created within threshold of job creation
 */
export function isRecentContent(
  contentCreatedAt: Date,
  jobCreatedAt: Date,
  thresholdMinutes: number = RECENT_CONTENT_THRESHOLD_MINUTES
): boolean {
  const diffMs = jobCreatedAt.getTime() - contentCreatedAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  // Content must be created before or at same time as job, and within threshold
  return diffMinutes >= 0 && diffMinutes <= thresholdMinutes;
}
```

**Unit Tests Required:**
1. Returns true when content created 2 minutes before job
2. Returns true when content created at exact same time as job (0 minutes)
3. Returns true when content created exactly 5 minutes before job (boundary)
4. Returns false when content created 6 minutes before job
5. Returns false when content created after job (negative difference)
6. Custom threshold works correctly (e.g., 10 minutes)

#### 2.2 Implement parseDate helper (internal function)

Add internal date parsing helper:

```typescript
/**
 * Parses a date string or Date object to Date
 * Internal helper for date normalization
 */
function parseDate(date: string | Date | undefined, fallback: Date): Date {
  if (!date) return fallback;
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? fallback : parsed;
}
```

**Verification:** Function handles ISO strings, Date objects, and invalid inputs gracefully.

---

### Task 3: Implement Main Priority Calculation Function

**File:** `/src/lib/job-queue/priority.ts`
**Effort:** 1 story point
**Dependencies:** Tasks 1, 2

#### 3.1 Implement calculateJobPriority function

Add the main calculation function:

```typescript
/**
 * Calculate the priority for a translation job
 *
 * Priority rules (evaluated in order):
 * 1. If content created within 5 minutes of job: URGENT (100)
 * 2. If job has batch_id: NORMAL (25)
 * 3. If retry_count > 0: LOW (10)
 * 4. Otherwise: HIGH (50) - assumes content update
 *
 * @param options - Context for priority calculation
 * @returns Numeric priority value (higher = more urgent)
 */
export function calculateJobPriority(options: PriorityCalculationOptions): PriorityLevel {
  const {
    contentCreatedAt,
    jobCreatedAt = new Date(),
    retryCount = 0,
    batchId,
  } = options;

  // Parse job creation date
  const jobDate = parseDate(jobCreatedAt, new Date());

  // Rule 1: Check if this is recently created content (highest priority)
  if (contentCreatedAt) {
    const contentDate = parseDate(contentCreatedAt, jobDate);

    if (isRecentContent(contentDate, jobDate)) {
      return PRIORITY_LEVELS.URGENT;
    }
  }

  // Rule 2: Check if this is a batch import (medium priority)
  if (batchId) {
    return PRIORITY_LEVELS.NORMAL;
  }

  // Rule 3: Check if this is a retry (lowest priority)
  if (retryCount > 0) {
    return PRIORITY_LEVELS.LOW;
  }

  // Rule 4: Default to HIGH priority (assumes content update)
  return PRIORITY_LEVELS.HIGH;
}
```

**Unit Tests Required:**
1. Returns 100 when contentCreatedAt is 2 minutes before jobCreatedAt
2. Returns 100 when contentCreatedAt is 0 minutes before jobCreatedAt
3. Returns 100 when contentCreatedAt is exactly 5 minutes before jobCreatedAt
4. Returns 50 when contentCreatedAt is 10 minutes before jobCreatedAt (not recent)
5. Returns 25 when batchId is provided (regardless of other options)
6. Returns 10 when retryCount > 0 and no contentCreatedAt
7. Returns 50 when no options provided (default case)
8. Recency takes precedence: returns 100 even if retryCount > 0 and content is recent
9. Batch takes precedence over retry: returns 25 if both batchId and retryCount > 0

**Acceptance Criteria Addressed:**
- [x] Priority calculation utility function exists that accepts a translation job and returns a numeric priority value
- [x] Function assigns priority 100 to jobs where content was created less than 5 minutes ago
- [x] Function determines content creation time by comparing job created_at timestamp with content entity created_at timestamp
- [x] Function assigns priority 50 to jobs triggered by content updates
- [x] Function assigns priority 25 to jobs created during batch import operations
- [x] Function assigns priority 10 to jobs being retried (where retry_count is greater than zero)

---

### Task 4: Create Database Migration for Priority Column

**Effort:** 1 story point
**Dependencies:** None (can be done in parallel with Tasks 1-3)

#### 4.1 Add priority column to translation_jobs table

Apply via Supabase MCP `apply_migration`:

**Migration Name:** `add_priority_to_translation_jobs`

```sql
-- Add priority column with default value
-- Priority values: 100=urgent (new), 50=high (update), 25=normal (batch), 10=low (retry)
ALTER TABLE translation_jobs
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 50;

-- Add documentation comment
COMMENT ON COLUMN translation_jobs.priority IS
  'Job priority: 100=urgent (new content <5min), 50=high (updates), 25=normal (batch), 10=low (retry). Higher = process first.';
```

**Verification Steps:**
1. Query the table schema to confirm column exists: `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'translation_jobs' AND column_name = 'priority';`
2. Confirm existing rows have default value of 50

#### 4.2 Create composite index for priority-based fetching

Apply via Supabase MCP `apply_migration`:

**Migration Name:** `add_priority_index_translation_jobs`

```sql
-- Create composite index for efficient priority-based job fetching
-- Supports: WHERE status = 'queued' ORDER BY priority DESC, created_at ASC
CREATE INDEX IF NOT EXISTS idx_translation_jobs_priority_queue
ON translation_jobs(status, priority DESC, created_at ASC)
WHERE status = 'queued';

-- Add comment for documentation
COMMENT ON INDEX idx_translation_jobs_priority_queue IS
  'Partial index for efficient priority-based job fetching. Only indexes queued jobs.';
```

**Verification Steps:**
1. Confirm index exists: `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'translation_jobs' AND indexname = 'idx_translation_jobs_priority_queue';`
2. Run EXPLAIN on job fetch query to verify index is used

**Acceptance Criteria Addressed:**
- [x] Priority field is added to translation jobs table schema via database migration
- [x] Database indexes support efficient priority-based job retrieval

---

### Task 5: Update Type Definitions

**File:** `/src/lib/job-queue/translation-jobs.types.ts`
**Effort:** 0.5 story points
**Dependencies:** Task 1

#### 5.1 Import PriorityLevel type

Add at the top of the file after existing imports:

```typescript
// Note: PriorityLevel is imported from priority.ts in implementation
// For type definition, we use number to avoid circular dependency
```

#### 5.2 Add priority field to TranslationJob interface

Modify the existing `TranslationJob` interface (around line 23-37):

**Before:**
```typescript
export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  attempts: number;
  // ... rest of fields
}
```

**After:**
```typescript
export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  priority: number;  // NEW: Job priority (100=urgent, 50=high, 25=normal, 10=low)
  attempts: number;
  // ... rest of fields unchanged
}
```

#### 5.3 Add priority fields to CreateJobParams interface

Modify the existing `CreateJobParams` interface (around line 42-47):

**Before:**
```typescript
export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}
```

**After:**
```typescript
export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  /** Optional priority override (if not provided, calculated automatically) */
  priority?: number;
  /** Content creation timestamp for priority calculation */
  contentCreatedAt?: string;
  /** Batch import identifier for bulk operations */
  batchId?: string;
}
```

#### 5.4 Add priority fields to CreateBatchJobsParams interface

Modify the existing `CreateBatchJobsParams` interface (around line 52-57):

**Before:**
```typescript
export interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
}
```

**After:**
```typescript
export interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  /** Optional priority override (if not provided, calculated automatically) */
  priority?: number;
  /** Content creation timestamp for priority calculation */
  contentCreatedAt?: string;
  /** Batch import identifier for bulk operations */
  batchId?: string;
}
```

**Acceptance Criteria Addressed:**
- [x] TypeScript types include priority field in translation job interface

---

### Task 6: Update Job Creation Functions

**File:** `/src/lib/job-queue/translation-jobs.ts`
**Effort:** 1 story point
**Dependencies:** Tasks 1-3, 5

#### 6.1 Add import for priority utilities

Add at the top of the file with other imports:

```typescript
import { calculateJobPriority, PRIORITY_LEVELS } from './priority';
```

#### 6.2 Update mapRowToJob function

Modify the `mapRowToJob` function (around line 26-42) to include priority:

**Find this section:**
```typescript
function mapRowToJob(row: Record<string, unknown>): TranslationJob {
  return {
    id: row.id as string,
    entityType: row.entity_type as TranslationJob['entityType'],
    // ... other fields
    attempts: (row.attempts as number) ?? 0,
    // ... rest of fields
  };
}
```

**Add after the `status` field mapping:**
```typescript
    status: row.status as TranslationJob['status'],
    priority: (row.priority as number) ?? PRIORITY_LEVELS.HIGH,  // NEW: Map priority with fallback
    attempts: (row.attempts as number) ?? 0,
```

#### 6.3 Update createTranslationJob function

Modify the `createTranslationJob` function (around line 50-133):

**Find the destructuring section:**
```typescript
const { entityType, entityId, targetLanguage } = params;
const sourceLanguage = params.sourceLanguage || 'en';
```

**Replace with:**
```typescript
const {
  entityType,
  entityId,
  targetLanguage,
  priority: priorityOverride,
  contentCreatedAt,
  batchId,
} = params;
const sourceLanguage = params.sourceLanguage || 'en';

// Calculate priority if not explicitly provided
const priority = priorityOverride ?? calculateJobPriority({
  contentCreatedAt,
  jobCreatedAt: new Date(),
  retryCount: 0,
  batchId,
});
```

**Find the upsert section:**
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
```

**Add priority field:**
```typescript
const { data, error } = await supabaseAdmin
  .from('translation_jobs')
  .upsert(
    {
      entity_type: entityType,
      entity_id: entityId,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      priority,  // NEW: Include calculated priority
      status: 'queued',
      attempts: 0,
    },
```

**Update the log statement:**
```typescript
console.log('JOB_QUEUE: Creating translation job', {
  entityType,
  entityId,
  sourceLanguage,
  targetLanguage,
  priority,  // NEW: Log priority
});
```

#### 6.4 Update createBatchTranslationJobs function

Modify the `createBatchTranslationJobs` function (around line 141-211):

**Find the destructuring section:**
```typescript
const { entityType, entityId, targetLanguages } = params;
const sourceLanguage = params.sourceLanguage || 'en';
```

**Replace with:**
```typescript
const {
  entityType,
  entityId,
  targetLanguages,
  priority: priorityOverride,
  contentCreatedAt,
  batchId,
} = params;
const sourceLanguage = params.sourceLanguage || 'en';

// Calculate priority if not explicitly provided
const priority = priorityOverride ?? calculateJobPriority({
  contentCreatedAt,
  jobCreatedAt: new Date(),
  retryCount: 0,
  batchId,
});
```

**Find the jobRecords mapping:**
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

**Add priority field:**
```typescript
const jobRecords = validTargets.map((targetLanguage) => ({
  entity_type: entityType,
  entity_id: entityId,
  source_language: sourceLanguage,
  target_language: targetLanguage,
  priority,  // NEW: Include calculated priority
  status: 'queued' as const,
  attempts: 0,
}));
```

**Update the log statement:**
```typescript
console.log('JOB_QUEUE: Creating batch translation jobs', {
  entityType,
  entityId,
  sourceLanguage,
  targetLanguages: validTargets,
  priority,  // NEW: Log priority
});
```

**Acceptance Criteria Addressed:**
- [x] Priority value is calculated and stored when jobs are created in the queue
- [x] Priority does not change after initial job creation (no dynamic re-prioritization)

---

### Task 7: Update Job Fetching Query

**File:** `/src/lib/job-queue/translation-jobs.ts`
**Effort:** 0.5 story points
**Dependencies:** Task 4 (migration must be applied first)

#### 7.1 Update fetchAndLockJobFallback function

Modify the `fetchAndLockJobFallback` function (around line 405-460):

**Find this query section:**
```typescript
// Find oldest queued job that's not locked
const { data: jobs, error: selectError } = await supabaseAdmin
  .from('translation_jobs')
  .select('*')
  .eq('status', 'queued')
  .is('locked_by', null)
  .order('created_at', { ascending: true })
  .limit(1);
```

**Replace with priority-based ordering:**
```typescript
// Find highest priority queued job that's not locked
// Orders by priority DESC (highest first), then created_at ASC (oldest first within same priority)
const { data: jobs, error: selectError } = await supabaseAdmin
  .from('translation_jobs')
  .select('*')
  .eq('status', 'queued')
  .is('locked_by', null)
  .order('priority', { ascending: false })  // NEW: Highest priority first
  .order('created_at', { ascending: true }) // Then oldest first
  .limit(1);
```

**Update the log statement when locked by another worker:**
```typescript
console.log('JOB_QUEUE: Job locked by another worker, retrying', {
  attemptedJobId: job.id,
  priority: job.priority,
});
```

**Acceptance Criteria Addressed:**
- [x] Job picker query includes ORDER BY priority DESC, created_at ASC clause
- [x] Job processor retrieves jobs in priority order during each processing cycle

---

### Task 8: Update PostgreSQL RPC Function (Optional)

**Effort:** 0.5 story points
**Dependencies:** Task 4

If using the `fetch_and_lock_translation_job` RPC function, update it to respect priority:

#### 8.1 Update the RPC function

Apply via Supabase MCP `execute_sql`:

```sql
CREATE OR REPLACE FUNCTION fetch_and_lock_translation_job(p_worker_id TEXT)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  source_language VARCHAR(5),
  target_language VARCHAR(5),
  status TEXT,
  priority INTEGER,
  attempts INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  locked_by TEXT,
  locked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  -- Lock the highest priority queued job
  SELECT tj.id INTO v_job_id
  FROM translation_jobs tj
  WHERE tj.status = 'queued'
    AND tj.locked_by IS NULL
  ORDER BY tj.priority DESC, tj.created_at ASC  -- Priority ordering
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job_id IS NULL THEN
    RETURN;
  END IF;

  -- Update and return the job
  RETURN QUERY
  UPDATE translation_jobs
  SET
    status = 'processing',
    locked_by = p_worker_id,
    locked_at = NOW(),
    started_at = NOW()
  WHERE translation_jobs.id = v_job_id
  RETURNING *;
END;
$$;
```

**Verification:**
1. Test RPC returns highest priority job first
2. Confirm jobs with same priority are returned in created_at order

---

### Task 9: Export Priority Utilities from Module Index

**File:** `/src/lib/job-queue/index.ts`
**Effort:** 0.25 story points
**Dependencies:** Tasks 1-3

#### 9.1 Add exports for priority utilities

Add new export section after existing exports:

```typescript
// Priority utilities (REQ-E03-018)
export {
  PRIORITY_LEVELS,
  RECENT_CONTENT_THRESHOLD_MINUTES,
  calculateJobPriority,
  isRecentContent,
} from './priority';

// Priority types (REQ-E03-018)
export type {
  PriorityLevel,
  PriorityCalculationOptions,
} from './priority';
```

**Acceptance Criteria Addressed:**
- [x] Priority calculation function is exported from the job queue module

---

### Task 10: Write Unit Tests

**File:** `/src/lib/job-queue/__tests__/priority.test.ts` (or similar test location)
**Effort:** 1 story point
**Dependencies:** Tasks 1-3

#### 10.1 Test suite for isRecentContent

```typescript
describe('isRecentContent', () => {
  it('returns true when content created 2 minutes before job', () => {
    const jobDate = new Date('2026-01-20T10:05:00Z');
    const contentDate = new Date('2026-01-20T10:03:00Z'); // 2 min earlier
    expect(isRecentContent(contentDate, jobDate)).toBe(true);
  });

  it('returns true when content created at same time as job', () => {
    const date = new Date('2026-01-20T10:00:00Z');
    expect(isRecentContent(date, date)).toBe(true);
  });

  it('returns true at exactly 5 minute boundary (inclusive)', () => {
    const jobDate = new Date('2026-01-20T10:05:00Z');
    const contentDate = new Date('2026-01-20T10:00:00Z'); // exactly 5 min earlier
    expect(isRecentContent(contentDate, jobDate)).toBe(true);
  });

  it('returns false when content created 6 minutes before job', () => {
    const jobDate = new Date('2026-01-20T10:06:00Z');
    const contentDate = new Date('2026-01-20T10:00:00Z'); // 6 min earlier
    expect(isRecentContent(contentDate, jobDate)).toBe(false);
  });

  it('returns false when content created after job (future)', () => {
    const jobDate = new Date('2026-01-20T10:00:00Z');
    const contentDate = new Date('2026-01-20T10:05:00Z'); // 5 min later
    expect(isRecentContent(contentDate, jobDate)).toBe(false);
  });

  it('respects custom threshold', () => {
    const jobDate = new Date('2026-01-20T10:10:00Z');
    const contentDate = new Date('2026-01-20T10:02:00Z'); // 8 min earlier
    expect(isRecentContent(contentDate, jobDate, 10)).toBe(true);
    expect(isRecentContent(contentDate, jobDate, 5)).toBe(false);
  });
});
```

#### 10.2 Test suite for calculateJobPriority

```typescript
describe('calculateJobPriority', () => {
  describe('Priority 100 - Recent content', () => {
    it('returns URGENT for content created 2 minutes ago', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: twoMinutesAgo,
        jobCreatedAt: now,
      })).toBe(100);
    });

    it('returns URGENT for content created at exact same time', () => {
      const now = new Date();
      expect(calculateJobPriority({
        contentCreatedAt: now,
        jobCreatedAt: now,
      })).toBe(100);
    });

    it('returns URGENT for content created exactly 5 minutes ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: fiveMinutesAgo,
        jobCreatedAt: now,
      })).toBe(100);
    });
  });

  describe('Priority 50 - Updated content (default)', () => {
    it('returns HIGH when contentCreatedAt is 10 minutes ago', () => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: tenMinutesAgo,
        jobCreatedAt: now,
      })).toBe(50);
    });

    it('returns HIGH when no options provided', () => {
      expect(calculateJobPriority({})).toBe(50);
    });

    it('returns HIGH when only jobCreatedAt provided', () => {
      expect(calculateJobPriority({
        jobCreatedAt: new Date(),
      })).toBe(50);
    });
  });

  describe('Priority 25 - Batch imports', () => {
    it('returns NORMAL when batchId is provided', () => {
      expect(calculateJobPriority({
        batchId: 'batch-123',
      })).toBe(25);
    });

    it('returns NORMAL even with old content when batchId present', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: oneHourAgo,
        jobCreatedAt: now,
        batchId: 'import-abc',
      })).toBe(25);
    });
  });

  describe('Priority 10 - Retry operations', () => {
    it('returns LOW when retryCount > 0', () => {
      expect(calculateJobPriority({
        retryCount: 1,
      })).toBe(10);
    });

    it('returns LOW when retryCount is 2', () => {
      expect(calculateJobPriority({
        retryCount: 2,
      })).toBe(10);
    });
  });

  describe('Priority precedence', () => {
    it('recency takes precedence over retry', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: twoMinutesAgo,
        jobCreatedAt: now,
        retryCount: 3,
      })).toBe(100); // URGENT, not LOW
    });

    it('recency takes precedence over batchId', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: twoMinutesAgo,
        jobCreatedAt: now,
        batchId: 'batch-123',
      })).toBe(100); // URGENT, not NORMAL
    });

    it('batchId takes precedence over retry when not recent', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(calculateJobPriority({
        contentCreatedAt: oneHourAgo,
        jobCreatedAt: now,
        batchId: 'batch-123',
        retryCount: 2,
      })).toBe(25); // NORMAL, not LOW
    });
  });

  describe('Edge cases', () => {
    it('handles ISO string dates', () => {
      expect(calculateJobPriority({
        contentCreatedAt: '2026-01-20T10:00:00Z',
        jobCreatedAt: '2026-01-20T10:02:00Z',
      })).toBe(100);
    });

    it('handles null batchId', () => {
      expect(calculateJobPriority({
        batchId: null,
      })).toBe(50);
    });

    it('handles retryCount of 0', () => {
      expect(calculateJobPriority({
        retryCount: 0,
      })).toBe(50);
    });
  });
});
```

**Acceptance Criteria Addressed:**
- [x] Priority assignment logic is unit tested with scenarios for each priority tier

---

### Task 11: Write Integration Tests

**Effort:** 0.5 story points
**Dependencies:** All previous tasks

#### 11.1 Test job creation with priority

```typescript
describe('Job creation with priority', () => {
  it('creates job with calculated URGENT priority for recent content', async () => {
    const now = new Date();
    const result = await createTranslationJob({
      entityType: 'item',
      entityId: 'test-item-123',
      targetLanguage: 'fr',
      contentCreatedAt: now.toISOString(),
    });

    expect(result.success).toBe(true);
    expect(result.data?.priority).toBe(100);
  });

  it('creates batch jobs with NORMAL priority when batchId provided', async () => {
    const result = await createBatchTranslationJobs({
      entityType: 'item',
      entityId: 'test-item-456',
      targetLanguages: ['fr', 'de', 'es'],
      batchId: 'import-batch-001',
    });

    expect(result.success).toBe(true);
    result.data?.forEach(job => {
      expect(job.priority).toBe(25);
    });
  });
});
```

#### 11.2 Test job fetching respects priority

```typescript
describe('Job fetching priority order', () => {
  beforeEach(async () => {
    // Create jobs with different priorities
    // Job 1: LOW priority (retry)
    await createTranslationJob({
      entityType: 'item',
      entityId: 'low-priority-item',
      targetLanguage: 'fr',
      priority: 10,
    });

    // Job 2: HIGH priority (update)
    await createTranslationJob({
      entityType: 'item',
      entityId: 'high-priority-item',
      targetLanguage: 'fr',
      priority: 50,
    });

    // Job 3: URGENT priority (new)
    await createTranslationJob({
      entityType: 'item',
      entityId: 'urgent-priority-item',
      targetLanguage: 'fr',
      priority: 100,
    });
  });

  it('fetches highest priority job first', async () => {
    const result = await fetchAndLockNextJob({ workerId: 'test-worker' });

    expect(result.success).toBe(true);
    expect(result.data?.entityId).toBe('urgent-priority-item');
    expect(result.data?.priority).toBe(100);
  });
});
```

---

## Verification Checklist

After completing all tasks, verify each acceptance criterion:

- [ ] Priority calculation utility function exists that accepts a translation job and returns a numeric priority value
- [ ] Function assigns priority 100 to jobs where content was created less than 5 minutes ago
- [ ] Function determines content creation time by comparing job created_at timestamp with content entity created_at timestamp
- [ ] Function assigns priority 50 to jobs triggered by content updates (where entity updated_at differs from created_at)
- [ ] Function assigns priority 25 to jobs created during batch import operations (identified by batch identifier in job metadata)
- [ ] Function assigns priority 10 to jobs being retried (where retry_count is greater than zero)
- [ ] Priority field is added to translation jobs table schema via database migration
- [ ] Priority value is calculated and stored when jobs are created in the queue
- [ ] Job picker query includes ORDER BY priority DESC, created_at ASC clause
- [ ] Job processor retrieves jobs in priority order during each processing cycle
- [ ] Priority assignment logic is unit tested with scenarios for each priority tier
- [ ] Priority does not change after initial job creation (no dynamic re-prioritization)
- [ ] TypeScript types include priority field in translation job interface
- [ ] Priority calculation function is exported from the job queue module
- [ ] Database indexes support efficient priority-based job retrieval

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `/src/lib/job-queue/priority.ts` | CREATE | Priority calculation utilities and constants |
| `/src/lib/job-queue/translation-jobs.types.ts` | MODIFY | Add priority field to interfaces |
| `/src/lib/job-queue/translation-jobs.ts` | MODIFY | Update job creation and fetching |
| `/src/lib/job-queue/index.ts` | MODIFY | Export priority utilities |
| `/src/lib/job-queue/__tests__/priority.test.ts` | CREATE | Unit tests for priority functions |
| Database: `translation_jobs` | MIGRATE | Add priority column and index |

---

## Rollback Plan

If issues occur after deployment:

1. **Index Rollback:** `DROP INDEX IF EXISTS idx_translation_jobs_priority_queue;`
2. **Column Rollback:** `ALTER TABLE translation_jobs DROP COLUMN IF EXISTS priority;`
3. **Code Rollback:** Revert commits for priority.ts changes and type updates
4. **RPC Rollback:** Restore previous version of `fetch_and_lock_translation_job` function

---

## References

- **Overview Document:** `/docs/REQ-E03-018-implement-job-prioritization-overview.md`
- **Request Source:** `/docs/gen_requests_epic3.md` (REQ-E03-018)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.6)
- **Existing Job Queue:** `/src/lib/job-queue/`
- **Job Types:** `/src/lib/job-queue/translation-jobs.types.ts`
- **Job Operations:** `/src/lib/job-queue/translation-jobs.ts`
