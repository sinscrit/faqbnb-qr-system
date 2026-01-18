# REQ-276: Implement Job Prioritization for Translation Queue - Overview

**Document Created:** 2026-01-18 14:30:00 UTC
**Last Modified:** 2026-01-18 14:30:00 UTC
**Request Reference:** `/docs/gen_requests_epic3.md` - Request #276
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.6
**Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** Epic 1 Foundation (Plan-110), Job Queue Infrastructure (REQ-243/244)

---

## Summary

Implement a job prioritization system for the translation queue that assigns priority levels to translation jobs based on content recency and operation type. This ensures time-sensitive translations (recently created content) are processed before lower-priority batch operations or retry attempts. The job picker query must order jobs by priority descending, then by creation timestamp ascending within each priority level.

---

## Current Behavior

Translation jobs are processed in the order they are created (FIFO - first-in-first-out) without regard to urgency or importance. The existing `translation_jobs` table and indexes only support ordering by `created_at`:

```sql
-- Current index from L10N foundation migration
CREATE INDEX idx_trans_jobs_created ON translation_jobs(created_at);
```

This means:
- Recently created content requiring immediate translation receives the same priority as bulk imports
- Retry operations and batch imports compete equally with urgent new content
- No mechanism exists to prioritize time-sensitive translations
- Property owners may experience delays in publishing new content for international guests

---

## Expected Behavior

When translation jobs are created, the system automatically assigns priority values based on specific criteria:

| Priority Level | Value | Criteria | Use Case |
|----------------|-------|----------|----------|
| **Highest** | 100 | Content created within last 5 minutes | Rapid publication of new listings |
| **High** | 50 | Updated content | Prompt translation of modifications |
| **Medium** | 25 | Batch import operations | Bulk content that is less time-sensitive |
| **Low** | 10 | Failed translation retry attempts | Background recovery without blocking new content |

The job picker query retrieves jobs ordered by:
1. **Primary sort:** `priority DESC` (highest priority first)
2. **Secondary sort:** `created_at ASC` (oldest first within same priority level)

This ensures highest-priority jobs are processed first while maintaining chronological order within each priority level.

---

## Technical Context

### Dependencies from Epic 1 (Plan-110)

This task requires the following Epic 1 infrastructure to be implemented:

| Component | Location | Required For |
|-----------|----------|--------------|
| Translation jobs table | Database | `translation_jobs` with status tracking |
| Job queue infrastructure | `/src/lib/job-queue/` | Job creation and processing |
| Job status updates | `/src/lib/job-queue/` | `updateJobStatus()` functions |

### Database Schema Reference

The `translation_jobs` table from the L10N migration (`/database/migrations/20260117_l10n_foundation.sql`):

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
  CONSTRAINT translation_jobs_entity_type_check
    CHECK (entity_type IN ('article', 'item', 'link', 'tag')),
  -- ... other constraints
  UNIQUE(entity_type, entity_id, target_language)
);
```

**Critical Observation:** The current schema does **NOT** include a `priority` column. This must be added via database migration.

### Existing Patterns to Follow

| Pattern | Source Location | Usage |
|---------|-----------------|-------|
| Utility module structure | `/src/lib/email-service.ts` | Export interface pattern |
| Type definitions | `/src/lib/supabase.ts` | Database type patterns |
| Result object pattern | `/src/lib/access-management.ts` | `ValidationResult` interface |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | (To be created in Epic 1) |

---

## Architecture

### Component Location

```
/src/lib/job-queue/
├── index.ts                      # Module exports (add priority exports)
├── translation-jobs.ts           # Job processing (modify job picker)
├── translation-jobs.types.ts     # Types (add priority-related types)
└── priority.ts                   # NEW: Priority assignment utility (This REQ)

/database/migrations/
└── 20260118_add_priority_to_translation_jobs.sql  # NEW: Add priority column
```

### Data Flow

```
Content Save Event
    │
    ├── Determine operation type
    │   - 'create' (new content)
    │   - 'update' (modified content)
    │   - 'batch_import' (bulk operation)
    │   - 'retry' (failed translation)
    │
    ▼
calculateJobPriority(options)
    │
    ├── Check content creation time
    │   - If created < 5 minutes ago: Priority 100
    │   - Otherwise use operation type
    │
    ├── Check operation type
    │   - 'create' (recent): Priority 100
    │   - 'update': Priority 50
    │   - 'batch_import': Priority 25
    │   - 'retry': Priority 10
    │
    ▼
Return priority value (integer)
    │
    ▼
Insert into translation_jobs
    - priority = calculated value
    - status = 'queued'
    - created_at = NOW()

    === JOB PROCESSING ===

Job Processor picks next job
    │
    ▼
SELECT * FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED
    │
    ▼
Process highest priority job first
```

### Priority Assignment Logic

```typescript
// Priority calculation pseudocode
function calculateJobPriority(options: PriorityOptions): number {
  // Priority 100: Recently created content (last 5 minutes)
  if (options.trigger === 'create') {
    const contentAge = Date.now() - options.contentCreatedAt.getTime();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (contentAge <= fiveMinutesMs) {
      return 100;  // Highest priority for fresh content
    }
  }

  // Priority based on operation type
  switch (options.trigger) {
    case 'update':
      return 50;   // High priority for updates
    case 'batch_import':
      return 25;   // Medium priority for bulk
    case 'retry':
      return 10;   // Low priority for retries
    default:
      return 50;   // Default to update priority
  }
}
```

---

## Integration Contract

### Type Definitions

```typescript
// /src/lib/job-queue/priority.ts

/**
 * Types of operations that trigger translation jobs
 */
export type TranslationTrigger = 'create' | 'update' | 'batch_import' | 'retry';

/**
 * Priority levels for translation jobs
 */
export const PRIORITY_LEVELS = {
  /** Recently created content (last 5 minutes) */
  RECENT_CREATE: 100,
  /** Updated content */
  UPDATE: 50,
  /** Batch import operations */
  BATCH_IMPORT: 25,
  /** Retry failed translations */
  RETRY: 10
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

/**
 * Options for calculating job priority
 */
export interface PriorityOptions {
  /** The type of operation that triggered this translation */
  trigger: TranslationTrigger;
  /** When the content was originally created (for recency check) */
  contentCreatedAt?: Date;
  /** Optional explicit priority override (for custom scenarios) */
  priorityOverride?: number;
}

/**
 * Result of priority calculation
 */
export interface PriorityResult {
  /** The calculated priority value */
  priority: number;
  /** The reason for this priority assignment */
  reason: string;
}
```

### Function Signatures

```typescript
// /src/lib/job-queue/priority.ts

/**
 * Calculate the priority level for a translation job
 *
 * Priority levels:
 * - 100: Recently created content (last 5 minutes)
 * - 50: Updated content
 * - 25: Batch import operations
 * - 10: Retry failed translations
 *
 * @param options - Priority calculation options
 * @returns Priority result with value and reason
 *
 * @example
 * const result = calculateJobPriority({
 *   trigger: 'create',
 *   contentCreatedAt: new Date()
 * });
 * // result.priority === 100 (recent content)
 */
export function calculateJobPriority(options: PriorityOptions): PriorityResult;

/**
 * Check if content is considered "recently created" (within 5 minutes)
 *
 * @param createdAt - When the content was created
 * @returns True if content is less than 5 minutes old
 */
export function isRecentlyCreated(createdAt: Date): boolean;

/**
 * Get the default priority for a given trigger type
 *
 * @param trigger - The type of operation
 * @returns The default priority value for this trigger
 */
export function getDefaultPriority(trigger: TranslationTrigger): number;
```

### Usage from Job Creation

```typescript
// In content-translation orchestrator (REQ-260)
import { calculateJobPriority, PriorityOptions } from '@/lib/job-queue/priority';

async function queueContentTranslations(options: QueueTranslationOptions) {
  // Calculate priority based on trigger type and content age
  const priorityOptions: PriorityOptions = {
    trigger: options.trigger,
    contentCreatedAt: options.content.createdAt,
    priorityOverride: options.priority
  };

  const { priority, reason } = calculateJobPriority(priorityOptions);

  console.log(`[JobQueue] Queueing with priority ${priority}: ${reason}`);

  // Insert job with calculated priority
  await supabase
    .from('translation_jobs')
    .insert({
      entity_type: options.content.entityType,
      entity_id: options.content.entityId,
      source_language: options.content.sourceLanguage,
      target_language: targetLang,
      status: 'queued',
      priority: priority,  // Use calculated priority
      created_at: new Date().toISOString()
    });
}
```

### Updated Job Picker Query

```typescript
// In /src/lib/job-queue/translation-jobs.ts

async function pickNextJob(): Promise<TranslationJob | null> {
  const { data, error } = await supabase
    .from('translation_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })    // Primary: highest priority first
    .order('created_at', { ascending: true })   // Secondary: oldest first within priority
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}
```

---

## Implementation Tasks

### Task 1: Create Database Migration for Priority Column

**File:** `/database/migrations/20260118_add_priority_to_translation_jobs.sql`

Add the `priority` column to the `translation_jobs` table with appropriate default and index.

```sql
-- ===========================================================
-- Add Priority Column to Translation Jobs
-- File: /database/migrations/20260118_add_priority_to_translation_jobs.sql
-- Generated: 2026-01-18
-- Last Modified: 2026-01-18
-- ===========================================================
-- Purpose: Add priority-based job processing support
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Reference: REQ-276
-- ===========================================================

-- Add priority column with default value
ALTER TABLE translation_jobs
ADD COLUMN priority INTEGER DEFAULT 50;

-- Add comment for documentation
COMMENT ON COLUMN translation_jobs.priority IS 'Job priority: 100 (recent create), 50 (update), 25 (batch), 10 (retry). Higher values processed first.';

-- Create index for priority-based job picking
-- Orders by priority DESC, created_at ASC for optimal job selection
CREATE INDEX idx_translation_jobs_priority_queue
  ON translation_jobs(priority DESC, created_at ASC)
  WHERE status = 'queued';

-- ===========================================================
-- ROLLBACK SCRIPT (commented)
-- ===========================================================
-- DROP INDEX IF EXISTS idx_translation_jobs_priority_queue;
-- ALTER TABLE translation_jobs DROP COLUMN IF EXISTS priority;
```

### Task 2: Create Priority Module File Structure

**File:** `/src/lib/job-queue/priority.ts`

```typescript
/**
 * Job Prioritization Utility
 *
 * Provides priority calculation for translation jobs based on
 * content recency and operation type.
 *
 * Priority Levels:
 * - 100: Recently created content (last 5 minutes)
 * - 50: Updated content
 * - 25: Batch import operations
 * - 10: Retry failed translations
 *
 * @module job-queue/priority
 * @see docs/REQ-276-implement-job-prioritization-overview.md
 */

/**
 * Types of operations that trigger translation jobs
 */
export type TranslationTrigger = 'create' | 'update' | 'batch_import' | 'retry';

/**
 * Priority levels for translation jobs
 */
export const PRIORITY_LEVELS = {
  /** Recently created content (last 5 minutes) */
  RECENT_CREATE: 100,
  /** Updated content */
  UPDATE: 50,
  /** Batch import operations */
  BATCH_IMPORT: 25,
  /** Retry failed translations */
  RETRY: 10
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

/**
 * Options for calculating job priority
 */
export interface PriorityOptions {
  /** The type of operation that triggered this translation */
  trigger: TranslationTrigger;
  /** When the content was originally created (for recency check) */
  contentCreatedAt?: Date;
  /** Optional explicit priority override (for custom scenarios) */
  priorityOverride?: number;
}

/**
 * Result of priority calculation
 */
export interface PriorityResult {
  /** The calculated priority value */
  priority: number;
  /** The reason for this priority assignment */
  reason: string;
}

/** Time threshold for "recently created" content (5 minutes in milliseconds) */
const RECENT_THRESHOLD_MS = 5 * 60 * 1000;
```

### Task 3: Implement isRecentlyCreated Helper

```typescript
/**
 * Check if content is considered "recently created" (within 5 minutes)
 *
 * @param createdAt - When the content was created
 * @returns True if content is less than 5 minutes old
 */
export function isRecentlyCreated(createdAt: Date): boolean {
  const now = Date.now();
  const contentAge = now - createdAt.getTime();
  return contentAge <= RECENT_THRESHOLD_MS;
}
```

### Task 4: Implement getDefaultPriority Helper

```typescript
/**
 * Get the default priority for a given trigger type
 *
 * @param trigger - The type of operation
 * @returns The default priority value for this trigger
 */
export function getDefaultPriority(trigger: TranslationTrigger): number {
  switch (trigger) {
    case 'create':
      return PRIORITY_LEVELS.UPDATE;  // Default for create without timestamp
    case 'update':
      return PRIORITY_LEVELS.UPDATE;
    case 'batch_import':
      return PRIORITY_LEVELS.BATCH_IMPORT;
    case 'retry':
      return PRIORITY_LEVELS.RETRY;
    default:
      return PRIORITY_LEVELS.UPDATE;  // Fallback to update priority
  }
}
```

### Task 5: Implement Main calculateJobPriority Function

```typescript
/**
 * Calculate the priority level for a translation job
 *
 * Priority levels:
 * - 100: Recently created content (last 5 minutes)
 * - 50: Updated content
 * - 25: Batch import operations
 * - 10: Retry failed translations
 *
 * @param options - Priority calculation options
 * @returns Priority result with value and reason
 *
 * @example
 * // Recent content creation
 * const result = calculateJobPriority({
 *   trigger: 'create',
 *   contentCreatedAt: new Date()
 * });
 * // result.priority === 100
 *
 * @example
 * // Batch import
 * const result = calculateJobPriority({
 *   trigger: 'batch_import'
 * });
 * // result.priority === 25
 */
export function calculateJobPriority(options: PriorityOptions): PriorityResult {
  const { trigger, contentCreatedAt, priorityOverride } = options;

  // If explicit override is provided, use it
  if (priorityOverride !== undefined) {
    return {
      priority: priorityOverride,
      reason: `Explicit priority override: ${priorityOverride}`
    };
  }

  // Priority 100: Recently created content (last 5 minutes)
  if (trigger === 'create' && contentCreatedAt) {
    if (isRecentlyCreated(contentCreatedAt)) {
      return {
        priority: PRIORITY_LEVELS.RECENT_CREATE,
        reason: 'Recently created content (within 5 minutes)'
      };
    }
  }

  // Priority based on operation type
  switch (trigger) {
    case 'create':
      // Create without recent timestamp defaults to update priority
      return {
        priority: PRIORITY_LEVELS.UPDATE,
        reason: 'New content creation (not recent)'
      };

    case 'update':
      return {
        priority: PRIORITY_LEVELS.UPDATE,
        reason: 'Content update operation'
      };

    case 'batch_import':
      return {
        priority: PRIORITY_LEVELS.BATCH_IMPORT,
        reason: 'Batch import operation'
      };

    case 'retry':
      return {
        priority: PRIORITY_LEVELS.RETRY,
        reason: 'Retry of failed translation'
      };

    default:
      return {
        priority: PRIORITY_LEVELS.UPDATE,
        reason: `Unknown trigger type: ${trigger}, using default`
      };
  }
}
```

### Task 6: Export from Module Index

**File:** `/src/lib/job-queue/index.ts` (modify)

```typescript
// Add exports for priority module
export {
  calculateJobPriority,
  isRecentlyCreated,
  getDefaultPriority,
  PRIORITY_LEVELS,
  type TranslationTrigger,
  type PriorityOptions,
  type PriorityResult,
  type PriorityLevel
} from './priority';
```

### Task 7: Update Job Picker Query in translation-jobs.ts

**File:** `/src/lib/job-queue/translation-jobs.ts` (modify)

Update the job picker to order by priority DESC, created_at ASC:

```typescript
/**
 * Pick the next job from the queue
 *
 * Orders by:
 * 1. priority DESC (highest priority first)
 * 2. created_at ASC (oldest first within same priority)
 *
 * @returns The next job to process, or null if queue is empty
 */
async function pickNextJob(): Promise<TranslationJob | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('translation_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })    // Highest priority first
    .order('created_at', { ascending: true })   // Oldest first within priority
    .limit(1);

  if (error) {
    console.error('[JobQueue] Error picking job:', error.message);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as TranslationJob;
}
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/priority.ts` | Priority calculation utility module |
| `/database/migrations/20260118_add_priority_to_translation_jobs.sql` | Database migration for priority column |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/index.ts` | Export priority module functions and types |
| `/src/lib/job-queue/translation-jobs.ts` | Update job picker query to order by priority |
| `/src/lib/job-queue/translation-jobs.types.ts` | Add priority field to TranslationJob type |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `calculateJobPriority` | `priority.ts` | Main priority calculation function |
| `isRecentlyCreated` | `priority.ts` | Check if content is within 5-minute threshold |
| `getDefaultPriority` | `priority.ts` | Get default priority for trigger type |

### Functions to Modify

| Function | Location | Modification |
|----------|----------|--------------|
| `pickNextJob` | `translation-jobs.ts` | Add `ORDER BY priority DESC, created_at ASC` |
| Job creation functions | `content-translation.ts` | Call `calculateJobPriority` and include in INSERT |

### Database Tables Involved

| Table | Operation | Purpose |
|-------|-----------|---------|
| `translation_jobs` | ALTER TABLE | Add `priority` INTEGER column |
| `translation_jobs` | CREATE INDEX | Add priority-based job picking index |

---

## Critical Implementation Notes

### Priority Value Consistency

Priority values must be consistent across all job creation points:

1. **Content Translation Orchestrator** (REQ-260): Use `calculateJobPriority()` when creating jobs
2. **Entity-Specific Triggers** (REQ-261): Pass trigger type to orchestrator
3. **Retry Mechanism** (REQ-271): Always use `PRIORITY_LEVELS.RETRY` (10)

```typescript
// Example: Consistent priority usage
// In content-translation.ts
const { priority } = calculateJobPriority({
  trigger: 'create',
  contentCreatedAt: new Date(item.created_at)
});

// In retry handler
const { priority } = calculateJobPriority({
  trigger: 'retry'  // Always priority 10
});
```

### Index Optimization

The composite index must be created correctly for optimal performance:

```sql
-- This index is CRITICAL for job picker performance
CREATE INDEX idx_translation_jobs_priority_queue
  ON translation_jobs(priority DESC, created_at ASC)
  WHERE status = 'queued';
```

The `WHERE status = 'queued'` partial index ensures:
- Smaller index size (only queued jobs)
- Faster lookups for job picking
- No index maintenance overhead for completed/failed jobs

### Default Priority

When priority is not explicitly calculated, use the default value of `50`:
- Matches existing jobs (before migration adds column with DEFAULT 50)
- Provides reasonable middle-ground priority
- Ensures backward compatibility

---

## Error Handling

### Invalid Trigger Type

The function handles unknown trigger types gracefully:

```typescript
default:
  return {
    priority: PRIORITY_LEVELS.UPDATE,
    reason: `Unknown trigger type: ${trigger}, using default`
  };
```

### Missing contentCreatedAt

When `contentCreatedAt` is not provided for 'create' trigger:

```typescript
case 'create':
  // Without timestamp, cannot determine recency
  return {
    priority: PRIORITY_LEVELS.UPDATE,  // Default to update priority
    reason: 'New content creation (not recent)'
  };
```

### Future Date Handling

Content with a future `createdAt` timestamp is treated as recent:

```typescript
// contentAge will be negative for future dates
const contentAge = now - createdAt.getTime();
return contentAge <= RECENT_THRESHOLD_MS;  // true for negative values
```

This is acceptable as it's an edge case that would still result in high priority for fresh content.

---

## Acceptance Criteria

From REQ-276 in gen_requests_epic3.md:

- [ ] A priority assignment utility function determines the appropriate priority value based on job metadata
- [ ] Jobs for content created within the last 5 minutes are assigned priority 100
- [ ] Jobs for updated content are assigned priority 50
- [ ] Jobs for batch import operations are assigned priority 25
- [ ] Jobs for retry attempts of failed translations are assigned priority 10
- [ ] The translation job creation logic calls the priority assignment utility to set the priority field
- [ ] The job picker query orders results by priority descending as the primary sort criterion
- [ ] The job picker query orders results by created_at ascending as the secondary sort criterion within each priority level
- [ ] The priority assignment logic is located at `/src/lib/job-queue/priority.ts`
- [ ] The priority utility function is properly exported and importable by job creation modules
- [ ] The job queue table schema includes a priority field to store integer priority values
- [ ] Priority values are stored as integers to enable efficient database sorting and indexing

---

## User Impact

- **Property Owners**: Newly created content is translated and available to international guests more quickly, improving time-to-market for new listings
- **Guests**: See translated content sooner for recently published properties, improving browsing experience
- **System Operations**: Batch imports and retries don't block time-sensitive translations, improving overall system responsiveness

---

## Business Value

Optimizes translation resource allocation by prioritizing time-sensitive content over bulk operations:

1. **Faster Publishing**: New listings reach international audiences within minutes
2. **Better UX**: Property owners see their translations complete quickly after creating content
3. **Efficient Processing**: Background tasks (batch imports, retries) run during lower-demand periods
4. **Scalability**: Priority system handles varying workloads gracefully

---

## Testing Strategy

### Unit Tests

```typescript
describe('calculateJobPriority', () => {
  it('should return priority 100 for recently created content', () => {
    const result = calculateJobPriority({
      trigger: 'create',
      contentCreatedAt: new Date()  // Just now
    });

    expect(result.priority).toBe(100);
    expect(result.reason).toContain('Recently created');
  });

  it('should return priority 50 for content older than 5 minutes', () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    const result = calculateJobPriority({
      trigger: 'create',
      contentCreatedAt: sixMinutesAgo
    });

    expect(result.priority).toBe(50);
    expect(result.reason).toContain('not recent');
  });

  it('should return priority 50 for update trigger', () => {
    const result = calculateJobPriority({
      trigger: 'update'
    });

    expect(result.priority).toBe(50);
    expect(result.reason).toContain('update');
  });

  it('should return priority 25 for batch import', () => {
    const result = calculateJobPriority({
      trigger: 'batch_import'
    });

    expect(result.priority).toBe(25);
    expect(result.reason).toContain('Batch import');
  });

  it('should return priority 10 for retry', () => {
    const result = calculateJobPriority({
      trigger: 'retry'
    });

    expect(result.priority).toBe(10);
    expect(result.reason).toContain('Retry');
  });

  it('should respect priority override', () => {
    const result = calculateJobPriority({
      trigger: 'create',
      contentCreatedAt: new Date(),
      priorityOverride: 75
    });

    expect(result.priority).toBe(75);
    expect(result.reason).toContain('override');
  });
});

describe('isRecentlyCreated', () => {
  it('should return true for content created just now', () => {
    expect(isRecentlyCreated(new Date())).toBe(true);
  });

  it('should return true for content created 4 minutes ago', () => {
    const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);
    expect(isRecentlyCreated(fourMinutesAgo)).toBe(true);
  });

  it('should return false for content created 6 minutes ago', () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    expect(isRecentlyCreated(sixMinutesAgo)).toBe(false);
  });

  it('should return true for content exactly at 5 minute boundary', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(isRecentlyCreated(fiveMinutesAgo)).toBe(true);
  });
});

describe('getDefaultPriority', () => {
  it('should return 50 for create trigger', () => {
    expect(getDefaultPriority('create')).toBe(50);
  });

  it('should return 50 for update trigger', () => {
    expect(getDefaultPriority('update')).toBe(50);
  });

  it('should return 25 for batch_import trigger', () => {
    expect(getDefaultPriority('batch_import')).toBe(25);
  });

  it('should return 10 for retry trigger', () => {
    expect(getDefaultPriority('retry')).toBe(10);
  });
});
```

### Integration Tests

```typescript
describe('Job Queue Priority Integration', () => {
  it('should pick highest priority job first', async () => {
    // Insert jobs with different priorities
    await insertJob({ priority: 10, created_at: '2026-01-18T10:00:00Z' });
    await insertJob({ priority: 100, created_at: '2026-01-18T10:01:00Z' });
    await insertJob({ priority: 50, created_at: '2026-01-18T10:00:30Z' });

    const pickedJob = await pickNextJob();

    expect(pickedJob.priority).toBe(100);  // Highest priority first
  });

  it('should pick oldest job within same priority', async () => {
    // Insert jobs with same priority, different times
    await insertJob({ priority: 50, created_at: '2026-01-18T10:01:00Z', entity_id: 'newer' });
    await insertJob({ priority: 50, created_at: '2026-01-18T10:00:00Z', entity_id: 'older' });

    const pickedJob = await pickNextJob();

    expect(pickedJob.entity_id).toBe('older');  // Oldest first within priority
  });

  it('should process jobs in correct priority order', async () => {
    // Insert batch import job (low priority) first
    await insertJob({ priority: 25, created_at: '2026-01-18T10:00:00Z', entity_id: 'batch' });
    // Insert recent create (high priority) second
    await insertJob({ priority: 100, created_at: '2026-01-18T10:01:00Z', entity_id: 'recent' });

    // First pick should be high priority
    const first = await pickNextJob();
    expect(first.entity_id).toBe('recent');

    // Second pick should be batch import
    await markJobComplete(first.id);
    const second = await pickNextJob();
    expect(second.entity_id).toBe('batch');
  });
});
```

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: Database migration | 15 min | Low |
| Task 2: Priority module structure | 15 min | Low |
| Task 3: isRecentlyCreated helper | 10 min | Low |
| Task 4: getDefaultPriority helper | 10 min | Low |
| Task 5: calculateJobPriority function | 20 min | Medium |
| Task 6: Export from module index | 5 min | Low |
| Task 7: Update job picker query | 15 min | Low |
| Testing | 30 min | Medium |
| **Total** | **~2 hours** | **Medium** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index not used by query planner | Low | High | Use `EXPLAIN ANALYZE` to verify; force index if needed |
| Migration breaks existing jobs | Low | Medium | DEFAULT 50 ensures existing jobs have valid priority |
| Priority drift over time | Low | Low | Clear documentation of priority values and their meanings |
| Race condition in job picking | Medium | Low | Use `FOR UPDATE SKIP LOCKED` pattern |
| Starvation of low-priority jobs | Low | Medium | Monitor queue depths; consider priority aging in future |

---

## Future Enhancements

### Priority Aging (Not in Scope)

Consider implementing priority aging in future iterations:
- Low-priority jobs that wait too long could have their priority increased
- Prevents starvation of batch imports during high traffic
- Requires additional tracking of wait time

### Dynamic Priority Adjustment

Future enhancement to adjust priority based on:
- Queue depth
- Time of day
- Account tier/subscription level
- Translation language demand

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-276)
- Database Schema: `/database/migrations/20260117_l10n_foundation.sql`
- Job Queue Module: REQ-243 (`createTranslationJob`)
- Job Processor: REQ-244 (`processTranslationJob`)
- Content Translation Orchestrator: REQ-260 (`queueContentTranslations`)
- Service Pattern: `/src/lib/email-service.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3, Task 3.6 - Implement Job Prioritization*
