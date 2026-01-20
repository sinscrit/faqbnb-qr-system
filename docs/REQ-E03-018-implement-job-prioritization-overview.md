# Implementation Overview: REQ-E03-018 - Implement Job Prioritization

**Document Version:** 1.1
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 12:30:00 UTC
**Request ID:** REQ-E03-018
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.6
**Status:** Ready for Implementation

---

## Summary

Implement a four-tier job prioritization system for the translation job queue to ensure the most critical translations are processed first. The system will assign numeric priority values based on content recency and operation type, with recently created content receiving the highest priority and retry operations receiving the lowest. The job picker query will be modified to order by priority descending (highest first), then by creation timestamp ascending (oldest first within same priority).

---

## Request Details

### Type
NEW FEATURE

### Size
M (Medium)

### Priority
P1 - High (Core translation infrastructure optimization)

### Dependencies
- **Epic 1 Foundation (Complete):**
  - Translation tables exist (`translation_jobs`)
  - Job queue infrastructure in place (`/src/lib/job-queue/`)
  - Job processing mechanism operational

- **Epic 3 Prerequisites:**
  - REQ-E03-001: Content translation module structure
  - REQ-E03-013: Enhanced job processor routing logic

---

## Current Behavior

The existing job queue in `/src/lib/job-queue/translation-jobs.ts` fetches jobs using FIFO (First-In-First-Out) ordering:

```typescript
// Lines 411-417 in translation-jobs.ts
.select('*')
.eq('status', 'queued')
.is('locked_by', null)
.order('created_at', { ascending: true })
.limit(1)
```

This approach:
- Processes jobs purely in the order they appear
- Does not differentiate between newly created content and batch imports
- May delay urgent translations behind large batch operations
- Does not consider retry attempts when ordering

The `TranslationJob` interface in `/src/lib/job-queue/translation-jobs.types.ts` does not include a `priority` field.

---

## Expected Behavior

### Priority Tier System

The system implements a four-tier prioritization scheme:

| Priority Level | Numeric Value | Condition | Use Case |
|----------------|---------------|-----------|----------|
| **Urgent** | 100 | Content created within last 5 minutes | New items, articles, links created by users |
| **High** | 50 | Content updates (updated_at differs from created_at) | Modified content requiring re-translation |
| **Normal** | 25 | Batch import operations (identified by metadata) | Bulk content imports |
| **Low** | 10 | Retry operations (retry_count > 0) | Failed translations being retried |

### Priority Calculation Logic

```
IF content_created_at is within 5 minutes of job_created_at:
    priority = 100 (Urgent - new content)
ELSE IF job has batch_id in metadata:
    priority = 25 (Normal - batch import)
ELSE IF retry_count > 0:
    priority = 10 (Low - retry)
ELSE:
    priority = 50 (High - updated content)
```

### Job Fetching Behavior

The job picker query will order results by:
1. `priority DESC` (highest priority first)
2. `created_at ASC` (oldest first within same priority)

This ensures:
- Newly created content is translated almost immediately
- Updates are processed promptly after new content
- Batch operations don't block individual content creation
- Failed retries don't starve new translations

---

## Technical Approach

### Option A: Database-Level Priority (Recommended)

Add a `priority` column to the `translation_jobs` table:
- Calculate and store priority at job creation time
- Index the priority column for efficient sorting
- Modify job picker query to order by priority

**Advantages:**
- Single database query for job fetching
- Leverages PostgreSQL's B-tree index for sorting
- Consistent priority across multiple workers
- No application-level sorting overhead

### Option B: Application-Level Priority

Calculate priority dynamically when fetching jobs:
- Fetch multiple queued jobs
- Calculate priority in application code
- Select highest priority job

**Disadvantages:**
- More complex query logic
- Potential for inconsistent sorting across workers
- Higher memory usage for batch fetching

### Recommendation: Option A (Database-Level)

Database-level prioritization provides the most reliable and efficient approach, especially with multiple workers.

---

## Database Schema Changes

### Migration: Add Priority Column

```sql
-- Migration: add_priority_to_translation_jobs
-- Date: 2026-01-20

-- Add priority column with default value
ALTER TABLE translation_jobs
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 50;

-- Add comment for documentation
COMMENT ON COLUMN translation_jobs.priority IS
  'Job priority: 100=urgent (new content), 50=high (updates), 25=normal (batch), 10=low (retry)';

-- Create index for efficient priority-based fetching
CREATE INDEX IF NOT EXISTS idx_translation_jobs_priority_created
ON translation_jobs(status, priority DESC, created_at ASC)
WHERE status IN ('queued', 'processing');
```

### Index Strategy

The composite index on `(status, priority DESC, created_at ASC)` supports:
- Filtering by status (WHERE clause)
- Sorting by priority descending
- Secondary sorting by created_at ascending
- Efficient range scans for partial index

---

## Integration Contracts

### Priority Calculation Function

```typescript
/**
 * Priority levels for translation jobs
 */
export const PRIORITY_LEVELS = {
  URGENT: 100,    // Recently created content (< 5 minutes)
  HIGH: 50,       // Updated content
  NORMAL: 25,     // Batch imports
  LOW: 10,        // Retry operations
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

/**
 * Options for calculating job priority
 */
export interface PriorityCalculationOptions {
  /** When the content entity was created */
  contentCreatedAt?: string | Date;
  /** When the translation job was created */
  jobCreatedAt?: string | Date;
  /** Number of retry attempts already made */
  retryCount?: number;
  /** Batch import identifier (if from bulk import) */
  batchId?: string | null;
}

/**
 * Calculate the priority for a translation job
 *
 * Priority rules (in order of evaluation):
 * 1. If content created within 5 minutes: URGENT (100)
 * 2. If job has batch_id: NORMAL (25)
 * 3. If retry_count > 0: LOW (10)
 * 4. Otherwise: HIGH (50) - assumes content update
 *
 * @param options - Context for priority calculation
 * @returns Numeric priority value (higher = more urgent)
 */
export function calculateJobPriority(options: PriorityCalculationOptions): PriorityLevel;
```

### Extended CreateJobParams Interface

```typescript
/**
 * Extended parameters for creating a translation job with priority
 */
export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  /** Optional priority override (if not provided, calculated automatically) */
  priority?: PriorityLevel;
  /** Content creation timestamp for priority calculation */
  contentCreatedAt?: string;
  /** Batch import identifier for bulk operations */
  batchId?: string;
}
```

### Extended TranslationJob Interface

```typescript
/**
 * Extended TranslationJob with priority field
 */
export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  priority: PriorityLevel;           // NEW: Job priority
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `/src/lib/job-queue/priority.ts` | Priority calculation utilities and constants |

### Files to Modify

| File Path | Modification Type | Description |
|-----------|------------------|-------------|
| `/src/lib/job-queue/translation-jobs.types.ts` | MODIFY | Add priority field to TranslationJob interface, add PriorityLevel type |
| `/src/lib/job-queue/translation-jobs.ts` | MODIFY | Update job fetching queries to order by priority, add priority to job creation |
| `/src/lib/job-queue/index.ts` | MODIFY | Export new priority utilities |

### Database Changes

| Change Type | Table | Description |
|-------------|-------|-------------|
| ADD COLUMN | `translation_jobs` | Add `priority INTEGER DEFAULT 50` column |
| CREATE INDEX | `translation_jobs` | Add composite index for priority-based fetching |

### Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `fetchAndLockJobFallback` | `translation-jobs.ts:405-460` | Add `.order('priority', { ascending: false })` before `created_at` ordering |
| `createTranslationJob` | `translation-jobs.ts` | Calculate and store priority on job creation |
| `createBatchTranslationJobs` | `translation-jobs.ts` | Calculate and store priority for batch jobs |
| `mapRowToJob` | `translation-jobs.ts` | Map priority column from database row |

### Functions to Create

| Function | File | Signature |
|----------|------|-----------|
| `calculateJobPriority` | `priority.ts` | `function calculateJobPriority(options: PriorityCalculationOptions): PriorityLevel` |
| `isRecentContent` | `priority.ts` | `function isRecentContent(contentCreatedAt: Date, jobCreatedAt: Date, thresholdMinutes?: number): boolean` |

---

## Implementation Tasks

### Task 1: Create Priority Module

**Location:** `/src/lib/job-queue/priority.ts`

```typescript
/**
 * Job Priority Utilities
 * Part of REQ-E03-018: Implement Job Prioritization
 *
 * Provides priority calculation for translation jobs based on:
 * - Content recency (new content gets highest priority)
 * - Operation type (updates vs batch imports vs retries)
 */

export const PRIORITY_LEVELS = {
  URGENT: 100,    // Recently created content (< 5 minutes)
  HIGH: 50,       // Updated content
  NORMAL: 25,     // Batch imports
  LOW: 10,        // Retry operations
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

/** Threshold for "recent" content in minutes */
const RECENT_CONTENT_THRESHOLD_MINUTES = 5;

export interface PriorityCalculationOptions {
  contentCreatedAt?: string | Date;
  jobCreatedAt?: string | Date;
  retryCount?: number;
  batchId?: string | null;
}

/**
 * Checks if content was created recently (within threshold)
 */
export function isRecentContent(
  contentCreatedAt: Date,
  jobCreatedAt: Date,
  thresholdMinutes: number = RECENT_CONTENT_THRESHOLD_MINUTES
): boolean {
  const diffMs = jobCreatedAt.getTime() - contentCreatedAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes >= 0 && diffMinutes <= thresholdMinutes;
}

/**
 * Calculate job priority based on context
 */
export function calculateJobPriority(options: PriorityCalculationOptions): PriorityLevel {
  const {
    contentCreatedAt,
    jobCreatedAt = new Date(),
    retryCount = 0,
    batchId,
  } = options;

  // Parse dates
  const jobDate = jobCreatedAt instanceof Date ? jobCreatedAt : new Date(jobCreatedAt);

  // Rule 1: Check if this is recently created content
  if (contentCreatedAt) {
    const contentDate = contentCreatedAt instanceof Date
      ? contentCreatedAt
      : new Date(contentCreatedAt);

    if (isRecentContent(contentDate, jobDate)) {
      return PRIORITY_LEVELS.URGENT;
    }
  }

  // Rule 2: Check if this is a batch import
  if (batchId) {
    return PRIORITY_LEVELS.NORMAL;
  }

  // Rule 3: Check if this is a retry
  if (retryCount > 0) {
    return PRIORITY_LEVELS.LOW;
  }

  // Rule 4: Default to HIGH (assumes content update)
  return PRIORITY_LEVELS.HIGH;
}
```

### Task 2: Update Type Definitions

**Location:** `/src/lib/job-queue/translation-jobs.types.ts`

Add to existing types:

```typescript
import { PriorityLevel } from './priority';

export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  priority: number;  // NEW: Add priority field
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
  priority?: number;           // NEW: Optional priority override
  contentCreatedAt?: string;   // NEW: For priority calculation
  batchId?: string;            // NEW: For batch import tracking
}
```

### Task 3: Update Job Fetching Query

**Location:** `/src/lib/job-queue/translation-jobs.ts:411-417`

Modify the fetch query to order by priority:

```typescript
// Before (FIFO only)
.order('created_at', { ascending: true })

// After (Priority then FIFO)
.order('priority', { ascending: false })  // Higher priority first
.order('created_at', { ascending: true }) // Then oldest first
```

### Task 4: Update Job Creation

**Location:** `/src/lib/job-queue/translation-jobs.ts`

Modify `createTranslationJob` to calculate and store priority:

```typescript
import { calculateJobPriority, PRIORITY_LEVELS } from './priority';

export async function createTranslationJob(
  params: CreateJobParams
): Promise<JobQueueResult<TranslationJob>> {
  const {
    entityType,
    entityId,
    sourceLanguage = 'en',
    targetLanguage,
    priority: priorityOverride,
    contentCreatedAt,
    batchId,
  } = params;

  // Calculate priority if not explicitly provided
  const priority = priorityOverride ?? calculateJobPriority({
    contentCreatedAt,
    jobCreatedAt: new Date(),
    retryCount: 0,
    batchId,
  });

  const { data, error } = await supabaseAdmin
    .from('translation_jobs')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      priority,  // NEW: Include priority
      status: 'queued',
      attempts: 0,
    })
    .select()
    .single();

  // ... rest of function
}
```

### Task 5: Update Row Mapper

**Location:** `/src/lib/job-queue/translation-jobs.ts`

Add priority to the `mapRowToJob` function:

```typescript
function mapRowToJob(row: DatabaseRow): TranslationJob {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    status: row.status,
    priority: row.priority ?? 50,  // NEW: Map priority with default
    attempts: row.attempts,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    lockedBy: row.locked_by,
    lockedAt: row.locked_at,
  };
}
```

### Task 6: Create Database Migration

Apply via Supabase MCP or migration file:

```sql
-- Add priority column
ALTER TABLE translation_jobs
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 50;

-- Create optimized index
CREATE INDEX IF NOT EXISTS idx_translation_jobs_priority_queue
ON translation_jobs(status, priority DESC, created_at ASC)
WHERE status = 'queued';
```

### Task 7: Export from Module Index

**Location:** `/src/lib/job-queue/index.ts`

```typescript
// Add exports for priority utilities
export {
  PRIORITY_LEVELS,
  PriorityLevel,
  PriorityCalculationOptions,
  calculateJobPriority,
  isRecentContent,
} from './priority';
```

---

## Error Handling

### Priority Calculation Edge Cases

| Scenario | Behavior |
|----------|----------|
| Missing contentCreatedAt | Skip recency check, evaluate other rules |
| Invalid date format | Log warning, default to HIGH priority |
| Future contentCreatedAt | Treat as not recent, evaluate other rules |
| Negative time difference | Treat as not recent, evaluate other rules |

### Database Fallback

If the priority column doesn't exist (migration not applied), the system should:
1. Log a warning
2. Use default priority of 50 for all jobs
3. Continue functioning with FIFO ordering

---

## Testing Requirements

### Unit Tests

1. **calculateJobPriority with recent content**
   - Input: contentCreatedAt = 2 minutes ago
   - Assert: Returns PRIORITY_LEVELS.URGENT (100)

2. **calculateJobPriority with old content**
   - Input: contentCreatedAt = 10 minutes ago
   - Assert: Returns PRIORITY_LEVELS.HIGH (50)

3. **calculateJobPriority with batch import**
   - Input: batchId = 'batch-123'
   - Assert: Returns PRIORITY_LEVELS.NORMAL (25)

4. **calculateJobPriority with retry**
   - Input: retryCount = 2
   - Assert: Returns PRIORITY_LEVELS.LOW (10)

5. **isRecentContent boundary tests**
   - Input: contentCreatedAt = exactly 5 minutes ago
   - Assert: Returns true (inclusive boundary)

6. **calculateJobPriority priority precedence**
   - Input: retryCount = 1, contentCreatedAt = 2 minutes ago
   - Assert: Returns URGENT (100) - recency takes precedence

### Integration Tests

1. **Job creation includes priority**
   - Create job with contentCreatedAt
   - Verify priority is calculated and stored correctly

2. **Job fetching respects priority**
   - Create multiple jobs with different priorities
   - Fetch next job
   - Verify highest priority job is returned

3. **FIFO within same priority**
   - Create multiple jobs with same priority at different times
   - Verify oldest job within priority is returned first

4. **Batch import priority**
   - Create jobs with batchId
   - Verify NORMAL priority assigned

---

## Acceptance Criteria

From REQ-E03-018 in gen_requests_epic3.md:

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

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration fails on production | Low | High | Test migration on staging first, include rollback plan |
| Priority starvation for low-priority jobs | Medium | Medium | Monitor queue depths, consider periodic priority boost |
| Index overhead on inserts | Low | Low | Partial index limits impact, benchmark before/after |
| Breaking existing job creation | Low | High | Make priority optional with sensible defaults |
| Race condition in priority calculation | Low | Low | Priority calculated at creation time, not fetch time |

---

## Performance Considerations

### Index Efficiency

The partial index on `(status, priority DESC, created_at ASC) WHERE status = 'queued'` provides:
- O(log n) lookup for next highest priority job
- Minimal overhead for inserts (only indexed when queued)
- Automatic exclusion of completed/failed jobs from index

### Benchmark Recommendations

Before deployment, measure:
1. Job fetch latency with/without priority ordering
2. Insert latency with priority column and index
3. Queue depth trends over time (watch for starvation)

### Expected Impact

| Metric | Expected Change |
|--------|-----------------|
| Job fetch latency | +0-5ms (index scan vs sequential scan) |
| Insert latency | +1-2ms (index maintenance) |
| New content translation latency | -50% (higher priority) |
| Batch import completion time | +10-20% (lower priority) |

---

## PostgreSQL RPC Update

If using the `fetch_and_lock_translation_job` RPC function, update it to respect priority:

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

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.6)
- **Request Source:** `/docs/gen_requests_epic3.md` (REQ-E03-018)
- **Existing Job Queue:** `/src/lib/job-queue/`
- **Job Types:** `/src/lib/job-queue/translation-jobs.types.ts`
- **Job Operations:** `/src/lib/job-queue/translation-jobs.ts`

---

## Appendix: Priority Calculation Examples

### Example 1: New Item Created

```typescript
// User creates a new item
const priority = calculateJobPriority({
  contentCreatedAt: '2026-01-20T10:00:00Z',  // Item created
  jobCreatedAt: '2026-01-20T10:00:05Z',      // Job created 5 seconds later
  retryCount: 0,
  batchId: null,
});
// Result: 100 (URGENT) - content is recent
```

### Example 2: Item Updated

```typescript
// User updates an existing item
const priority = calculateJobPriority({
  contentCreatedAt: '2026-01-15T10:00:00Z',  // Item created 5 days ago
  jobCreatedAt: '2026-01-20T10:00:00Z',      // Job created now
  retryCount: 0,
  batchId: null,
});
// Result: 50 (HIGH) - not recent, not batch, not retry
```

### Example 3: Batch Import

```typescript
// Bulk import of items
const priority = calculateJobPriority({
  contentCreatedAt: '2026-01-20T10:00:00Z',
  jobCreatedAt: '2026-01-20T10:00:00Z',
  retryCount: 0,
  batchId: 'import-batch-abc123',  // Batch identifier present
});
// Result: 25 (NORMAL) - batch import
```

### Example 4: Retry After Failure

```typescript
// Re-queuing failed job
const priority = calculateJobPriority({
  contentCreatedAt: '2026-01-15T10:00:00Z',
  jobCreatedAt: '2026-01-20T10:00:00Z',
  retryCount: 2,  // Already failed twice
  batchId: null,
});
// Result: 10 (LOW) - retry operation
```

### Example 5: Priority Precedence

```typescript
// Edge case: recent content that's also a retry
const priority = calculateJobPriority({
  contentCreatedAt: '2026-01-20T10:00:00Z',  // Very recent
  jobCreatedAt: '2026-01-20T10:02:00Z',      // 2 minutes later
  retryCount: 1,  // Is a retry
  batchId: null,
});
// Result: 100 (URGENT) - recency takes precedence over retry
```
