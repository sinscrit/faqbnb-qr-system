# REQ-351: Implementation Breakdown - Implement Job Prioritization for Translation Queue

**Document Created:** 2026-01-19 12:30
**Last Modified:** 2026-01-19 12:30
**Request Reference:** docs/gen_requests_epic3.md - Request #351
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.6

---

## Overview

This document provides a detailed implementation breakdown for the job prioritization system in the translation job queue. The prioritization ensures that recently created content is translated first, followed by updates, batch imports, and retry attempts, improving user experience by reducing translation latency for new content.

### Purpose

The job prioritization module serves to:

- Define priority levels for different types of translation jobs
- Assign appropriate priority values when jobs are created
- Ensure the job picker fetches jobs in priority order (highest first, oldest first within same priority)
- Enable dynamic priority adjustment based on job characteristics

### Priority Levels

| Priority | Value | Description | Use Case |
|----------|-------|-------------|----------|
| **URGENT** | 100 | Recently created content (within last 5 minutes) | New item/article/link creation |
| **HIGH** | 50 | Updated content | Content edits/modifications |
| **NORMAL** | 25 | Batch imports | Bulk data import operations |
| **LOW** | 10 | Retry failed translations | Re-queued failed jobs |

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Translation jobs table | **Required** | Must add `priority` column (migration needed) |
| Job queue module | **Required** | `src/lib/job-queue/translation-jobs.ts` must exist |
| Concurrency control | **Required** | `src/lib/job-queue/concurrency-control.ts` must exist |

### Dependents (Blocked by this task)

- Job processor optimization - relies on priority ordering for efficient processing
- API responses that report translation job status
- Future batch import functionality

---

## Technical Approach

### Database Schema Changes

The `translation_jobs` table needs a `priority` column to store integer priority values.

**Current schema (relevant columns):**
```
id, entity_type, entity_id, source_language, target_language, status,
attempts, error_message, created_at, started_at, completed_at, locked_by, locked_at
```

**Addition required:**
```sql
ALTER TABLE translation_jobs ADD COLUMN priority INTEGER DEFAULT 25;
```

### Existing Patterns to Follow

| Pattern | Source File | How to Apply |
|---------|-------------|--------------|
| Module structure | `concurrency-control.ts` | Export types, constants, and functions |
| Constants for config | `concurrency-control.ts:100-111` | Define priority constants |
| Type exports | `translation-jobs.types.ts` | Add priority-related types |
| Supabase queries | `translation-jobs.ts` | Use same query patterns |

---

## Architecture

### Module Structure

```
src/lib/job-queue/
├── priority.ts            # NEW: Priority assignment and constants
├── translation-jobs.ts    # MODIFY: Update job creation and fetching
├── translation-jobs.types.ts  # MODIFY: Add priority types
├── index.ts               # MODIFY: Export priority utilities
└── ...
```

### Priority Assignment Flow

```
Job Creation Request
    │
    ▼
Determine Job Context
    │
    ├── Is this new content? (created_at < 5 minutes ago)
    │   └── Priority = 100 (URGENT)
    │
    ├── Is this content update?
    │   └── Priority = 50 (HIGH)
    │
    ├── Is this batch import?
    │   └── Priority = 25 (NORMAL)
    │
    └── Is this retry of failed job?
        └── Priority = 10 (LOW)
    │
    ▼
Insert job with assigned priority
```

### Job Picker Query

The job picker must fetch jobs ordered by:
1. **Priority DESC** (highest priority first)
2. **created_at ASC** (oldest first within same priority)

```sql
SELECT * FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

---

## Integration Contract

### Priority Types

```typescript
// /src/lib/job-queue/priority.ts

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

export type JobPriorityLevel = typeof JobPriority[keyof typeof JobPriority];

/**
 * Context for determining job priority
 */
export type JobCreationContext = 'create' | 'update' | 'batch_import' | 'retry';

/**
 * Options for calculating job priority
 */
export interface PriorityCalculationOptions {
  /** The context in which the job is being created */
  context: JobCreationContext;
  /** Entity creation timestamp (for determining if recently created) */
  entityCreatedAt?: Date | string;
  /** Override the calculated priority */
  priorityOverride?: JobPriorityLevel;
}

/**
 * Calculate the priority for a translation job
 */
export function calculateJobPriority(options: PriorityCalculationOptions): JobPriorityLevel;

/**
 * Check if content was recently created (within threshold)
 */
export function isRecentlyCreated(
  createdAt: Date | string,
  thresholdMinutes?: number
): boolean;
```

### Updated CreateJobParams

```typescript
// /src/lib/job-queue/translation-jobs.types.ts

export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  /** Priority level for the job (default: NORMAL) */
  priority?: number;
}

export interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  /** Priority level for all jobs (default: NORMAL) */
  priority?: number;
}
```

### Updated TranslationJob Interface

```typescript
// /src/lib/job-queue/translation-jobs.types.ts

export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  /** Job priority (higher = more urgent) */
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

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/priority.ts` | Priority constants, types, and utility functions |
| `supabase/migrations/[timestamp]_add_priority_to_translation_jobs.sql` | Database migration |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/lib/job-queue/translation-jobs.types.ts` | Add `priority` field to interfaces |
| `src/lib/job-queue/translation-jobs.ts` | Update job creation and fetching to use priority |
| `src/lib/job-queue/index.ts` | Export priority utilities and types |

### Dependencies (Read-Only Reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/lib/job-queue/concurrency-control.ts` | Pattern for module structure |
| `src/lib/supabase.ts` | Database client patterns |

---

## Implementation Tasks

### Task 1: Create Database Migration (15 min)

**File:** `supabase/migrations/[timestamp]_add_priority_to_translation_jobs.sql`

**Deliverables:**
- [ ] Add `priority` column with default value of 25 (NORMAL)
- [ ] Create index on (status, priority DESC, created_at ASC) for efficient job picking
- [ ] Update existing jobs to have priority 25

**SQL Migration:**
```sql
-- Add priority column to translation_jobs table
ALTER TABLE translation_jobs
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 25;

-- Create index for efficient job picking by priority
CREATE INDEX IF NOT EXISTS idx_translation_jobs_priority_queue
ON translation_jobs (status, priority DESC, created_at ASC)
WHERE status IN ('queued', 'processing');

-- Update existing jobs to have default priority
UPDATE translation_jobs
SET priority = 25
WHERE priority IS NULL;
```

**Acceptance Criteria:**
- Migration runs without errors
- Existing jobs have priority 25
- New index is created

### Task 2: Create Priority Module (30 min)

**File:** `src/lib/job-queue/priority.ts`

**Deliverables:**
- [ ] Define `JobPriority` constant object
- [ ] Define `JobPriorityLevel` type
- [ ] Define `JobCreationContext` type
- [ ] Define `PriorityCalculationOptions` interface
- [ ] Implement `calculateJobPriority()` function
- [ ] Implement `isRecentlyCreated()` helper
- [ ] Add JSDoc documentation

**Implementation:**
```typescript
/**
 * Translation Job Priority Module
 * Part of REQ-351: Implement Job Prioritization
 *
 * Defines priority levels and utilities for assigning priorities
 * to translation jobs based on creation context.
 *
 * @module job-queue/priority
 * @created 2026-01-19
 */

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

export type JobPriorityLevel = typeof JobPriority[keyof typeof JobPriority];

/** Context for determining job priority */
export type JobCreationContext = 'create' | 'update' | 'batch_import' | 'retry';

/** Options for calculating job priority */
export interface PriorityCalculationOptions {
  context: JobCreationContext;
  entityCreatedAt?: Date | string;
  priorityOverride?: JobPriorityLevel;
}

/** Default threshold for "recently created" in minutes */
export const RECENT_CREATION_THRESHOLD_MINUTES = 5;

/**
 * Check if content was recently created
 */
export function isRecentlyCreated(
  createdAt: Date | string,
  thresholdMinutes: number = RECENT_CREATION_THRESHOLD_MINUTES
): boolean {
  const createdTime = typeof createdAt === 'string'
    ? new Date(createdAt).getTime()
    : createdAt.getTime();
  const threshold = Date.now() - (thresholdMinutes * 60 * 1000);
  return createdTime >= threshold;
}

/**
 * Calculate the priority for a translation job
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
 * Get human-readable priority label
 */
export function getPriorityLabel(priority: number): string {
  if (priority >= JobPriority.URGENT) return 'Urgent';
  if (priority >= JobPriority.HIGH) return 'High';
  if (priority >= JobPriority.NORMAL) return 'Normal';
  return 'Low';
}
```

**Acceptance Criteria:**
- All types and functions export correctly
- `calculateJobPriority` returns correct values for each context
- `isRecentlyCreated` correctly identifies content within threshold

### Task 3: Update Type Definitions (15 min)

**File:** `src/lib/job-queue/translation-jobs.types.ts`

**Deliverables:**
- [ ] Add `priority` field to `TranslationJob` interface
- [ ] Add `priority` field to `CreateJobParams` interface
- [ ] Add `priority` field to `CreateBatchJobsParams` interface

**Modifications:**
```typescript
// Add to TranslationJob interface:
export interface TranslationJob {
  // ... existing fields
  /** Job priority (higher = more urgent, default: 25) */
  priority: number;
}

// Add to CreateJobParams interface:
export interface CreateJobParams {
  // ... existing fields
  /** Priority level for the job (default: 25) */
  priority?: number;
}

// Add to CreateBatchJobsParams interface:
export interface CreateBatchJobsParams {
  // ... existing fields
  /** Priority level for all jobs in batch (default: 25) */
  priority?: number;
}
```

**Acceptance Criteria:**
- Types compile without errors
- Priority field is optional on creation params
- Priority field is required on TranslationJob

### Task 4: Update Job Creation Functions (30 min)

**File:** `src/lib/job-queue/translation-jobs.ts`

**Deliverables:**
- [ ] Update `mapRowToJob()` to include priority
- [ ] Update `createTranslationJob()` to accept and store priority
- [ ] Update `createBatchTranslationJobs()` to accept and store priority
- [ ] Default to `JobPriority.NORMAL` (25) when not specified

**Modifications to `mapRowToJob`:**
```typescript
function mapRowToJob(row: Record<string, unknown>): TranslationJob {
  return {
    // ... existing mappings
    priority: (row.priority as number) ?? 25,
  };
}
```

**Modifications to `createTranslationJob`:**
```typescript
export async function createTranslationJob(
  params: CreateJobParams
): Promise<JobQueueResult<TranslationJob>> {
  // ... existing code
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
        priority: priority, // ADD THIS
      },
      // ... rest unchanged
    )
    // ...
}
```

**Acceptance Criteria:**
- Jobs are created with correct priority values
- Default priority is 25 when not specified
- Priority is correctly mapped from database rows

### Task 5: Update Job Fetching with Priority Order (30 min)

**File:** `src/lib/job-queue/translation-jobs.ts`

**Deliverables:**
- [ ] Update `fetchAndLockJobFallback()` to order by priority DESC, created_at ASC
- [ ] Update RPC function call parameters if needed
- [ ] Update `getJobsByStatus()` to support priority ordering

**Modifications to `fetchAndLockJobFallback`:**
```typescript
async function fetchAndLockJobFallback(
  workerId: string
): Promise<JobQueueResult<TranslationJob | null>> {
  const now = new Date().toISOString();

  // Find highest priority queued job that's not locked
  const { data: jobs, error: selectError } = await supabaseAdmin
    .from('translation_jobs')
    .select('*')
    .eq('status', 'queued')
    .is('locked_by', null)
    .order('priority', { ascending: false })   // CHANGE: priority DESC
    .order('created_at', { ascending: true })  // KEEP: then created_at ASC
    .limit(1);

  // ... rest of function unchanged
}
```

**Database RPC Update (if needed):**
The PostgreSQL function `fetch_and_lock_translation_job` should also be updated:
```sql
CREATE OR REPLACE FUNCTION fetch_and_lock_translation_job(p_worker_id TEXT)
RETURNS SETOF translation_jobs AS $$
DECLARE
  locked_job translation_jobs%ROWTYPE;
BEGIN
  SELECT * INTO locked_job
  FROM translation_jobs
  WHERE status = 'queued'
    AND locked_by IS NULL
  ORDER BY priority DESC, created_at ASC  -- Priority ordering
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    UPDATE translation_jobs
    SET
      status = 'processing',
      locked_by = p_worker_id,
      locked_at = NOW(),
      started_at = NOW()
    WHERE id = locked_job.id;

    RETURN QUERY SELECT * FROM translation_jobs WHERE id = locked_job.id;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;
```

**Acceptance Criteria:**
- Jobs are fetched in priority order (highest first)
- Within same priority, older jobs are fetched first
- Both fallback and RPC methods use priority ordering

### Task 6: Update Module Exports (10 min)

**File:** `src/lib/job-queue/index.ts`

**Deliverables:**
- [ ] Export priority constants and types
- [ ] Export priority utility functions

**Additions:**
```typescript
// Priority exports (REQ-351)
export {
  JobPriority,
  RECENT_CREATION_THRESHOLD_MINUTES,
  calculateJobPriority,
  isRecentlyCreated,
  getPriorityLabel,
} from './priority';

export type {
  JobPriorityLevel,
  JobCreationContext,
  PriorityCalculationOptions,
} from './priority';
```

**Acceptance Criteria:**
- All priority utilities are accessible via `import { ... } from '@/lib/job-queue'`
- No import errors

### Task 7: Write Unit Tests (30 min)

**File:** `src/lib/job-queue/__tests__/priority.test.ts`

**Test Coverage:**
- [ ] `calculateJobPriority` returns URGENT for recent creation
- [ ] `calculateJobPriority` returns HIGH for updates
- [ ] `calculateJobPriority` returns NORMAL for batch imports
- [ ] `calculateJobPriority` returns LOW for retries
- [ ] `isRecentlyCreated` correctly identifies recent content
- [ ] `isRecentlyCreated` correctly identifies old content
- [ ] Priority override takes precedence
- [ ] Default values work correctly

**Example Tests:**
```typescript
import {
  JobPriority,
  calculateJobPriority,
  isRecentlyCreated,
  getPriorityLabel,
} from '../priority';

describe('priority', () => {
  describe('calculateJobPriority', () => {
    it('returns URGENT for recently created content', () => {
      const result = calculateJobPriority({
        context: 'create',
        entityCreatedAt: new Date(), // Just created
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

    it('returns HIGH for updates', () => {
      const result = calculateJobPriority({ context: 'update' });
      expect(result).toBe(JobPriority.HIGH);
    });

    it('returns NORMAL for batch imports', () => {
      const result = calculateJobPriority({ context: 'batch_import' });
      expect(result).toBe(JobPriority.NORMAL);
    });

    it('returns LOW for retries', () => {
      const result = calculateJobPriority({ context: 'retry' });
      expect(result).toBe(JobPriority.LOW);
    });

    it('respects priority override', () => {
      const result = calculateJobPriority({
        context: 'retry',
        priorityOverride: JobPriority.URGENT,
      });
      expect(result).toBe(JobPriority.URGENT);
    });
  });

  describe('isRecentlyCreated', () => {
    it('returns true for content created within threshold', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      expect(isRecentlyCreated(twoMinutesAgo)).toBe(true);
    });

    it('returns false for content created beyond threshold', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(isRecentlyCreated(tenMinutesAgo)).toBe(false);
    });

    it('accepts string dates', () => {
      const recent = new Date().toISOString();
      expect(isRecentlyCreated(recent)).toBe(true);
    });
  });

  describe('getPriorityLabel', () => {
    it('returns correct labels', () => {
      expect(getPriorityLabel(100)).toBe('Urgent');
      expect(getPriorityLabel(50)).toBe('High');
      expect(getPriorityLabel(25)).toBe('Normal');
      expect(getPriorityLabel(10)).toBe('Low');
    });
  });
});
```

**Acceptance Criteria:**
- All tests pass
- Coverage includes edge cases
- Tests are isolated and don't require database

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: Database Migration | 15 min | Low |
| Task 2: Priority Module | 30 min | Medium |
| Task 3: Type Definitions | 15 min | Low |
| Task 4: Job Creation Functions | 30 min | Medium |
| Task 5: Job Fetching | 30 min | Medium |
| Task 6: Module Exports | 10 min | Low |
| Task 7: Unit Tests | 30 min | Low |
| **Total** | **~2.5 hours** | Medium |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration fails on existing data | Low | Medium | Add DEFAULT value, test on staging first |
| Index affects insert performance | Low | Low | Monitor query performance after deployment |
| Priority logic doesn't match business needs | Medium | Medium | Make thresholds configurable |
| Race conditions in priority updates | Low | Low | Use database-level defaults |

---

## Testing Checklist

### Unit Tests
- [ ] Priority calculation for each context type
- [ ] Recently created detection with various timestamps
- [ ] Priority override functionality
- [ ] Default priority assignment

### Integration Tests
- [ ] Job creation with priority values
- [ ] Job fetching returns highest priority first
- [ ] Same-priority jobs returned oldest first
- [ ] Batch job creation with shared priority

### Manual Testing
- [ ] Create a high-priority job, verify it's processed before existing lower-priority jobs
- [ ] Verify job picker query performance with new index
- [ ] Test concurrent job processing respects priority

---

## Code Standards

### Naming Conventions
- Use UPPER_CASE for constant values (JobPriority.URGENT)
- Use camelCase for functions (calculateJobPriority)
- Use PascalCase for types (JobPriorityLevel)

### Documentation
- JSDoc comments for all exported functions
- Inline comments explaining priority determination logic
- Module-level documentation header

### Error Messages
- Clear log messages for priority assignment
- Include priority in job creation logs

---

## References

- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Definition:** `docs/gen_requests_epic3.md` - Request #351
- **Pattern Reference - Module Structure:** `src/lib/job-queue/concurrency-control.ts`
- **Pattern Reference - Types:** `src/lib/job-queue/translation-jobs.types.ts`
- **Pattern Reference - Job Operations:** `src/lib/job-queue/translation-jobs.ts`

---

## Appendix: Complete Priority Module

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
 * @lastModified 2026-01-19
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
 */
export function getPriorityLabel(priority: number): string {
  if (priority >= JobPriority.URGENT) return 'Urgent';
  if (priority >= JobPriority.HIGH) return 'High';
  if (priority >= JobPriority.NORMAL) return 'Normal';
  return 'Low';
}

/**
 * Validate that a priority value is valid
 *
 * @param priority - The priority value to validate
 * @returns True if priority is a valid JobPriorityLevel
 */
export function isValidPriority(priority: number): priority is JobPriorityLevel {
  return Object.values(JobPriority).includes(priority as JobPriorityLevel);
}
```

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 3.6: Implement job prioritization*
