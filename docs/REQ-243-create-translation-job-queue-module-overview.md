# REQ-243: Translation Job Queue Module - Implementation Overview

**Generated:** 2026-01-18 12:45:00 UTC
**Last Modified:** 2026-01-18 12:45:00 UTC
**Request Reference:** REQ-243 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 4 - Background Job Processing
**Task ID:** 4.1

---

## Summary

Create a translation job queue module that enables asynchronous translation processing through a database-backed job queue. The module manages translation job lifecycle, tracks status transitions, and implements locking mechanisms to prevent concurrent processing of the same job.

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
| Service module structure | `/src/lib/email-service.ts` | Interface + class + factory pattern |
| Database types | `/src/lib/supabase.ts` | TypeScript database type definitions |
| Server-side Supabase | `/src/lib/supabase-server.ts` | `createSupabaseServer()` for server components |
| Admin API routes | `/src/app/api/admin/items/route.ts` | Auth validation, error handling patterns |
| Type exports | `/src/types/index.ts` | Centralized type exports |

### Database Prerequisites

This module depends on the `translation_jobs` table defined in the L10N Foundation plan:

```sql
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('article', 'item', 'link', 'tag')),
  entity_id UUID NOT NULL,
  source_language VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language VARCHAR(5) NOT NULL CHECK (target_language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  status VARCHAR(20) NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  locked_by VARCHAR(100),  -- Worker identifier for locking
  locked_at TIMESTAMPTZ,   -- When lock was acquired
  UNIQUE(entity_type, entity_id, target_language)
);

-- Performance indexes
CREATE INDEX idx_translation_jobs_status ON translation_jobs(status);
CREATE INDEX idx_translation_jobs_entity ON translation_jobs(entity_type, entity_id);
CREATE INDEX idx_translation_jobs_locked ON translation_jobs(locked_by, locked_at);
```

---

## Architecture

### Module Structure

```
/src/lib/job-queue/
├── index.ts                      # Barrel exports
├── translation-jobs.ts           # Main job queue module
└── translation-jobs.types.ts     # TypeScript type definitions
```

### Core Interfaces

```typescript
// /src/lib/job-queue/translation-jobs.types.ts

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

### Module Functions

The module exports the following functions:

```typescript
// Job Insertion
export async function createTranslationJob(
  params: CreateJobParams
): Promise<JobQueueResult<TranslationJob>>;

export async function createBatchTranslationJobs(
  params: CreateBatchJobsParams
): Promise<JobQueueResult<TranslationJob[]>>;

// Job Status Updates
export async function updateJobStatus(
  jobId: string,
  updates: JobUpdateParams
): Promise<JobQueueResult<TranslationJob>>;

export async function markJobCompleted(
  jobId: string
): Promise<JobQueueResult<TranslationJob>>;

export async function markJobFailed(
  jobId: string,
  errorMessage: string
): Promise<JobQueueResult<TranslationJob>>;

// Job Fetching with Locking
export async function fetchAndLockNextJob(
  options: FetchJobOptions
): Promise<JobQueueResult<TranslationJob | null>>;

export async function releaseJobLock(
  jobId: string,
  workerId: string
): Promise<JobQueueResult<boolean>>;

// Query Functions
export async function getJobsByEntity(
  entityType: EntityType,
  entityId: string
): Promise<JobQueueResult<TranslationJob[]>>;

export async function getJobsByStatus(
  status: JobStatus,
  limit?: number
): Promise<JobQueueResult<TranslationJob[]>>;

export async function cleanupStaleLocks(
  timeoutMinutes?: number
): Promise<JobQueueResult<number>>;
```

---

## Integration Contract

### Job Creation Example

```typescript
import {
  createTranslationJob,
  createBatchTranslationJobs
} from '@/lib/job-queue';

// Single job
const result = await createTranslationJob({
  entityType: 'article',
  entityId: 'uuid-of-article',
  sourceLanguage: 'en',
  targetLanguage: 'fr'
});

// Batch jobs for all languages
const batchResult = await createBatchTranslationJobs({
  entityType: 'item',
  entityId: 'uuid-of-item',
  sourceLanguage: 'en',
  targetLanguages: ['fr', 'es', 'de', 'nl', 'it']
});
```

### Job Processing Example

```typescript
import {
  fetchAndLockNextJob,
  markJobCompleted,
  markJobFailed,
  releaseJobLock
} from '@/lib/job-queue';

const workerId = `worker-${process.pid}-${Date.now()}`;

// Fetch and lock a job
const { data: job } = await fetchAndLockNextJob({
  workerId,
  lockTimeoutMinutes: 5
});

if (job) {
  try {
    // Process the translation...
    await markJobCompleted(job.id);
  } catch (error) {
    await markJobFailed(job.id, error.message);
  }
}
```

---

## Implementation Tasks

### Task 4.1.1: Create Type Definitions
**File:** `/src/lib/job-queue/translation-jobs.types.ts`

Create all TypeScript interfaces and types:
- `SupportedLanguage`, `EntityType`, `JobStatus` types
- `TranslationJob` interface matching database schema
- `CreateJobParams`, `CreateBatchJobsParams` interfaces
- `JobUpdateParams`, `FetchJobOptions` interfaces
- `JobQueueResult<T>` generic result type

**Acceptance Criteria:**
- All types defined with proper constraints
- Types align with database schema
- Export all types from barrel file

### Task 4.1.2: Create Job Insertion Functions
**File:** `/src/lib/job-queue/translation-jobs.ts`

Implement job creation:
- `createTranslationJob()` - Single job insertion
- `createBatchTranslationJobs()` - Multiple jobs for one entity
- Handle unique constraint conflicts gracefully (upsert or skip)
- Validate entity types and languages
- Return created job(s) with full data

**Acceptance Criteria:**
- Jobs inserted with correct status ('queued')
- Duplicate job attempts handled without error
- Proper error handling and logging

### Task 4.1.3: Create Job Status Update Functions
**File:** `/src/lib/job-queue/translation-jobs.ts`

Implement status management:
- `updateJobStatus()` - Generic status update
- `markJobCompleted()` - Set completed status + timestamp
- `markJobFailed()` - Set failed status + error message + increment attempts

**Acceptance Criteria:**
- Status transitions validated
- Timestamps auto-set on state changes
- Attempts counter incremented on failure

### Task 4.1.4: Create Job Fetching with Locking
**File:** `/src/lib/job-queue/translation-jobs.ts`

Implement concurrent-safe job fetching:
- `fetchAndLockNextJob()` - Atomic fetch + lock operation
- Use row-level locking (SELECT ... FOR UPDATE SKIP LOCKED)
- Set `locked_by` and `locked_at` fields
- Update status to 'processing'
- `releaseJobLock()` - Unlock without status change

**Acceptance Criteria:**
- Only one worker can lock a job
- Locked jobs skipped by other workers
- Lock metadata properly recorded

### Task 4.1.5: Create Query and Utility Functions
**File:** `/src/lib/job-queue/translation-jobs.ts`

Implement supporting functions:
- `getJobsByEntity()` - Get all jobs for an entity
- `getJobsByStatus()` - List jobs by status with optional limit
- `cleanupStaleLocks()` - Release locks older than timeout

**Acceptance Criteria:**
- Query functions efficient with proper indexes
- Stale lock cleanup configurable
- Results properly typed

### Task 4.1.6: Create Barrel Export
**File:** `/src/lib/job-queue/index.ts`

Create module exports:
- Export all types from types file
- Export all functions from main module
- Add module documentation comment

**Acceptance Criteria:**
- Clean import path: `import { ... } from '@/lib/job-queue'`
- All public APIs exported

### Task 4.1.7: Update Central Type Exports (Optional)
**File:** `/src/types/index.ts`

Consider re-exporting translation job types for broader access:
- Add export for translation job types if needed by other modules

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/index.ts` | Barrel exports for job queue module |
| `/src/lib/job-queue/translation-jobs.ts` | Main job queue implementation |
| `/src/lib/job-queue/translation-jobs.types.ts` | TypeScript type definitions |

### Files That May Require Updates

| File Path | Potential Changes |
|-----------|-------------------|
| `/src/types/index.ts` | Optional: Re-export translation job types |
| `/src/lib/supabase.ts` | Add `translation_jobs` table types to Database interface |

### Functions to Implement

| Function | Module | Purpose |
|----------|--------|---------|
| `createTranslationJob` | translation-jobs.ts | Insert single job |
| `createBatchTranslationJobs` | translation-jobs.ts | Insert multiple jobs |
| `updateJobStatus` | translation-jobs.ts | Update job status |
| `markJobCompleted` | translation-jobs.ts | Mark job completed |
| `markJobFailed` | translation-jobs.ts | Mark job failed |
| `fetchAndLockNextJob` | translation-jobs.ts | Fetch and lock for processing |
| `releaseJobLock` | translation-jobs.ts | Release job lock |
| `getJobsByEntity` | translation-jobs.ts | Query jobs by entity |
| `getJobsByStatus` | translation-jobs.ts | Query jobs by status |
| `cleanupStaleLocks` | translation-jobs.ts | Cleanup stale locks |

---

## Dependencies

### Prerequisites (Must Be Complete Before This Task)

1. **Task 1.1:** Database migration with `translation_jobs` table must be applied
2. **Task 1.5:** TypeScript database types should include translation_jobs table

### Downstream Dependencies (Tasks That Depend on This)

1. **Task 4.2:** Job processor implementation
2. **Task 4.3:** Process translations API route
3. **Task 4.5:** Job status API endpoint

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Locking mechanism | PostgreSQL FOR UPDATE SKIP LOCKED | Native DB support, no external dependencies |
| Worker ID format | `worker-{pid}-{timestamp}` | Unique per process instance |
| Lock timeout | 5 minutes default | Balance between long translations and stale cleanup |
| Duplicate handling | Upsert with ON CONFLICT | Idempotent job creation |
| Batch size | No limit in module | Caller controls batch size |

---

## Testing Considerations

### Unit Tests

- Job creation with valid/invalid params
- Status update transitions
- Batch job creation

### Integration Tests

- Concurrent lock acquisition (simulate multiple workers)
- Stale lock cleanup
- Duplicate job handling

### Edge Cases

- Creating job for non-existent entity
- Attempting to lock already-locked job
- Releasing lock with wrong worker ID
- Clock skew in lock timeout calculations

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Race conditions in locking | Low | High | Use PostgreSQL native locking |
| Orphaned locks | Medium | Medium | Implement cleanup cron job |
| Database connection limits | Low | Medium | Use connection pooling |
| Type mismatch with DB | Low | Medium | Generate types from DB schema |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| 4.1.1: Type definitions | Small | High |
| 4.1.2: Job insertion | Small | High |
| 4.1.3: Status updates | Small | High |
| 4.1.4: Locking mechanism | Medium | Medium |
| 4.1.5: Query functions | Small | High |
| 4.1.6: Barrel export | Trivial | High |
| 4.1.7: Type re-exports | Trivial | High |
| **Total** | **Medium** | High |

---

## References

- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (Phase 4, Task 4.1)
- Existing service pattern: `/src/lib/email-service.ts`
- Database types pattern: `/src/lib/supabase.ts`
- Server-side Supabase: `/src/lib/supabase-server.ts`
- PostgreSQL FOR UPDATE SKIP LOCKED: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation, Phase 4, Task 4.1*
