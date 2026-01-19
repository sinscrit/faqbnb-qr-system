# REQ-359: Create Translation Job Indexes - Detailed Task Breakdown

**Generated:** 2026-01-19 21:15:00 UTC
**Last Modified:** 2026-01-19 21:15:00 UTC
**Request Reference:** REQ-359 - Create Translation Job Indexes
**Overview Document:** REQ-359-create-translation-job-indexes-overview.md
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.1)
**Phase:** 6 - Database Indexes & Optimization
**Task ID:** 6.1

---

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Estimated Story Points** | 2 |
| **Implementation Type** | Database Migration + TypeScript Types |
| **Primary Tools** | Supabase MCP (apply_migration, execute_sql) |
| **Files Modified** | 1 |
| **New Files** | 0 |
| **Database Objects Created** | 1 column, 3 indexes |

---

## Task Breakdown

### Task 6.1.1: Add priority column to translation_jobs table

**Story Points:** 0.5
**Type:** Database Migration
**Dependencies:** None (translation_jobs table must exist from Epic 1)

#### Objective
Add the `priority` column to the `translation_jobs` table to enable job prioritization. This column is required before creating the pending jobs index which orders by priority.

#### Implementation Steps

**Step 1:** Apply the migration via Supabase MCP

```sql
-- Add priority column to translation_jobs table
-- Priority levels: 100=new content, 50=updates, 25=batch imports, 10=retries
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';
```

**Migration Name:** `add_translation_jobs_priority_column`

#### Verification Steps

**Step 1:** Verify column exists with correct default

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'translation_jobs'
  AND column_name = 'priority';
```

**Expected Result:**
| column_name | data_type | column_default | is_nullable |
|-------------|-----------|----------------|-------------|
| priority | integer | 50 | YES |

**Step 2:** Verify existing rows have priority set to default

```sql
SELECT COUNT(*) as total, COUNT(priority) as with_priority, COUNT(*) - COUNT(priority) as null_priority
FROM translation_jobs;
```

**Note:** Existing rows will have `priority = 50` (the default value).

#### Acceptance Criteria
- [ ] Column `priority` exists on `translation_jobs` table
- [ ] Column has type `integer` with DEFAULT 50
- [ ] Column comment documents priority level meanings
- [ ] Migration is idempotent (IF NOT EXISTS)

---

### Task 6.1.2: Create pending jobs partial index

**Story Points:** 0.5
**Type:** Database Migration
**Dependencies:** Task 6.1.1 (priority column must exist)

#### Objective
Create a partial index optimized for the job processor query that picks up pending and processing jobs, ordered by priority and creation time.

#### Implementation Steps

**Step 1:** Apply the migration via Supabase MCP

```sql
-- Fast lookup of pending/processing jobs (for job processor)
-- This partial index only includes active jobs, minimizing index size
-- Orders by priority DESC for high-priority job processing
-- Secondary ordering by created_at ASC for FIFO within same priority
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');
```

**Migration Name:** `create_translation_jobs_pending_index`

#### Technical Details

| Aspect | Detail |
|--------|--------|
| Index Type | Partial B-tree index |
| Columns | status, priority DESC, created_at ASC |
| Partial Condition | `status IN ('queued', 'processing')` |
| Use Case | Job processor batch pickup queries |

**Optimizes Query Pattern:**
```sql
SELECT id, entity_type, entity_id, source_language, target_language
FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT 10
FOR UPDATE SKIP LOCKED;
```

#### Verification Steps

**Step 1:** Verify index exists

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
  AND indexname = 'idx_translation_jobs_pending';
```

**Expected Result:**
| indexname | indexdef |
|-----------|----------|
| idx_translation_jobs_pending | CREATE INDEX idx_translation_jobs_pending ON public.translation_jobs USING btree (status, priority DESC, created_at) WHERE ((status)::text = ANY ((ARRAY['queued'::character varying, 'processing'::character varying])::text[])) |

**Step 2:** Verify query uses index (EXPLAIN ANALYZE)

```sql
EXPLAIN ANALYZE
SELECT id, entity_type, entity_id, source_language, target_language
FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT 10;
```

**Expected:** Query plan shows "Index Scan using idx_translation_jobs_pending"

#### Acceptance Criteria
- [ ] Index `idx_translation_jobs_pending` exists
- [ ] Index is partial (only queued/processing statuses)
- [ ] Index column order is (status, priority DESC, created_at ASC)
- [ ] EXPLAIN shows index scan for job processor query
- [ ] Migration is idempotent (IF NOT EXISTS)

---

### Task 6.1.3: Create full entity lookup index

**Story Points:** 0.25
**Type:** Database Migration
**Dependencies:** None (base table must exist)

#### Objective
Create a composite index for fast lookup of translation jobs by entity type, entity ID, and target language. This supports the translation status API endpoint.

#### Implementation Steps

**Step 1:** Apply the migration via Supabase MCP

```sql
-- Fast lookup of jobs by entity (for status queries)
-- Supports queries like: "What is the translation status of item X for language Y?"
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);
```

**Migration Name:** `create_translation_jobs_entity_full_index`

**Note:** Named `idx_translation_jobs_entity_full` to avoid conflict with existing `idx_trans_jobs_entity` which only has 2 columns.

#### Technical Details

| Aspect | Detail |
|--------|--------|
| Index Type | B-tree composite index |
| Columns | entity_type, entity_id, target_language |
| Use Case | Translation status lookups by entity |

**Optimizes Query Pattern:**
```sql
SELECT id, status, attempts, error_message, created_at, completed_at
FROM translation_jobs
WHERE entity_type = 'item'
  AND entity_id = '123e4567-e89b-12d3-a456-426614174000'
  AND target_language = 'fr';
```

#### Verification Steps

**Step 1:** Verify index exists

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
  AND indexname = 'idx_translation_jobs_entity_full';
```

**Expected:** Index exists with columns (entity_type, entity_id, target_language)

**Step 2:** Verify query uses index

```sql
EXPLAIN ANALYZE
SELECT id, status, attempts, error_message
FROM translation_jobs
WHERE entity_type = 'item'
  AND entity_id = gen_random_uuid()
  AND target_language = 'fr';
```

**Expected:** Query plan shows "Index Scan using idx_translation_jobs_entity_full"

#### Acceptance Criteria
- [ ] Index `idx_translation_jobs_entity_full` exists
- [ ] Index covers all three columns (entity_type, entity_id, target_language)
- [ ] EXPLAIN shows index scan for entity status queries
- [ ] Migration is idempotent (IF NOT EXISTS)

---

### Task 6.1.4: Create stale jobs partial index

**Story Points:** 0.25
**Type:** Database Migration
**Dependencies:** None (base table must exist)

#### Objective
Create a partial index optimized for the stale job cleanup query that identifies jobs stuck in 'processing' status beyond a timeout threshold.

#### Implementation Steps

**Step 1:** Apply the migration via Supabase MCP

```sql
-- Fast lookup of stale processing jobs (for cleanup)
-- Partial index only includes processing jobs
-- Enables efficient identification of jobs stuck beyond timeout threshold
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

**Migration Name:** `create_translation_jobs_stale_index`

#### Technical Details

| Aspect | Detail |
|--------|--------|
| Index Type | Partial B-tree index |
| Columns | status, started_at |
| Partial Condition | `status = 'processing'` |
| Use Case | Stale job cleanup (stuck processing jobs) |

**Optimizes Query Pattern:**
```sql
SELECT id, entity_type, entity_id, attempts, started_at
FROM translation_jobs
WHERE status = 'processing'
  AND started_at < (NOW() - INTERVAL '5 minutes');
```

#### Verification Steps

**Step 1:** Verify index exists

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
  AND indexname = 'idx_translation_jobs_stale';
```

**Expected:** Index exists with partial condition `WHERE status = 'processing'`

**Step 2:** Verify query uses index

```sql
EXPLAIN ANALYZE
SELECT id, entity_type, entity_id, attempts, started_at
FROM translation_jobs
WHERE status = 'processing'
  AND started_at < (NOW() - INTERVAL '5 minutes');
```

**Expected:** Query plan shows "Index Scan using idx_translation_jobs_stale"

#### Acceptance Criteria
- [ ] Index `idx_translation_jobs_stale` exists
- [ ] Index is partial (only processing status)
- [ ] Index columns are (status, started_at)
- [ ] EXPLAIN shows index scan for stale job queries
- [ ] Migration is idempotent (IF NOT EXISTS)

---

### Task 6.1.5: Update TypeScript types for priority column

**Story Points:** 0.5
**Type:** Code Modification
**Dependencies:** Task 6.1.1 (priority column must be applied)

#### Objective
Update the TypeScript type definitions in `/src/lib/supabase.ts` to include the `priority` field in the `translation_jobs` table types.

#### File to Modify

**File:** `/src/lib/supabase.ts`

#### Implementation Steps

**Step 1:** Locate the `translation_jobs` type definition (approximately line 637)

**Step 2:** Add `priority` field to Row type

```typescript
// In translation_jobs.Row, add after locked_at:
priority: number | null
```

**Step 3:** Add `priority` field to Insert type

```typescript
// In translation_jobs.Insert, add after locked_at:
priority?: number | null
```

**Step 4:** Add `priority` field to Update type

```typescript
// In translation_jobs.Update, add after locked_at:
priority?: number | null
```

#### Before (Current State)

```typescript
translation_jobs: {
  Row: {
    id: string
    entity_type: string
    entity_id: string
    source_language: string
    target_language: string
    status: string
    attempts: number | null
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
    attempts?: number | null
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
    attempts?: number | null
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

#### After (Expected State)

```typescript
// REQ-227: Translation jobs queue table for L10N
// REQ-243: Added locked_by and locked_at for job locking support
// REQ-359: Added priority column for job prioritization
translation_jobs: {
  Row: {
    id: string
    entity_type: string
    entity_id: string
    source_language: string
    target_language: string
    status: string
    attempts: number | null
    error_message: string | null
    created_at: string | null
    started_at: string | null
    completed_at: string | null
    locked_by: string | null
    locked_at: string | null
    priority: number | null
  }
  Insert: {
    id?: string
    entity_type: string
    entity_id: string
    source_language?: string
    target_language: string
    status?: string
    attempts?: number | null
    error_message?: string | null
    created_at?: string | null
    started_at?: string | null
    completed_at?: string | null
    locked_by?: string | null
    locked_at?: string | null
    priority?: number | null
  }
  Update: {
    id?: string
    entity_type?: string
    entity_id?: string
    source_language?: string
    target_language?: string
    status?: string
    attempts?: number | null
    error_message?: string | null
    created_at?: string | null
    started_at?: string | null
    completed_at?: string | null
    locked_by?: string | null
    locked_at?: string | null
    priority?: number | null
  }
  Relationships: []
}
```

#### Verification Steps

**Step 1:** Run TypeScript compilation

```bash
npm run build
```

**Expected:** No type errors related to translation_jobs

**Step 2:** Verify type exports work

```bash
npm run type-check
```

**Expected:** Success with no errors

#### Acceptance Criteria
- [ ] `priority` field added to `translation_jobs.Row` type
- [ ] `priority` field added to `translation_jobs.Insert` type (optional)
- [ ] `priority` field added to `translation_jobs.Update` type (optional)
- [ ] Comment updated to reference REQ-359
- [ ] TypeScript compilation succeeds
- [ ] No type errors in codebase

---

### Task 6.1.6: Verify all indexes and query plans

**Story Points:** 0.25
**Type:** Verification
**Dependencies:** Tasks 6.1.1-6.1.4 (all migrations must be applied)

#### Objective
Comprehensive verification that all indexes were created correctly and query optimizer uses them appropriately.

#### Verification Steps

**Step 1:** List all indexes on translation_jobs table

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
ORDER BY indexname;
```

**Expected Result:** Should include all new indexes:
- `idx_translation_jobs_entity_full`
- `idx_translation_jobs_pending`
- `idx_translation_jobs_stale`

**Step 2:** Verify priority column statistics

```sql
SELECT
  attname AS column_name,
  n_distinct,
  most_common_vals,
  most_common_freqs
FROM pg_stats
WHERE tablename = 'translation_jobs'
  AND attname = 'priority';
```

**Step 3:** Verify pending jobs index usage

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, entity_type, entity_id, source_language, target_language
FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT 10;
```

**Expected:** Shows "Index Scan using idx_translation_jobs_pending"

**Step 4:** Verify entity lookup index usage

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, status, attempts, error_message
FROM translation_jobs
WHERE entity_type = 'item'
  AND entity_id = gen_random_uuid()
  AND target_language = 'fr';
```

**Expected:** Shows "Index Scan using idx_translation_jobs_entity_full"

**Step 5:** Verify stale jobs index usage

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, entity_type, entity_id, attempts, started_at
FROM translation_jobs
WHERE status = 'processing'
  AND started_at < (NOW() - INTERVAL '5 minutes');
```

**Expected:** Shows "Index Scan using idx_translation_jobs_stale"

**Step 6:** Check index sizes

```sql
SELECT
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE relname = 'translation_jobs'
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### Acceptance Criteria
- [ ] All three new indexes appear in pg_indexes
- [ ] EXPLAIN ANALYZE shows index scans for all three query patterns
- [ ] No sequential scans for filtered queries
- [ ] Index sizes are documented

---

## Combined Migration Option

For efficiency, all database changes can be combined into a single migration:

**Migration Name:** `create_translation_job_indexes`

```sql
-- REQ-359: Create Translation Job Indexes
-- Epic 3, Phase 6, Task 6.1
-- Generated: 2026-01-19
--
-- This migration adds:
-- 1. priority column for job prioritization
-- 2. idx_translation_jobs_pending - partial index for job processor
-- 3. idx_translation_jobs_entity_full - composite index for status queries
-- 4. idx_translation_jobs_stale - partial index for cleanup queries

-- 1. Add priority column for job prioritization
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';

-- 2. Fast lookup of pending/processing jobs (for job processor)
-- Optimizes: SELECT ... WHERE status = 'queued' ORDER BY priority DESC, created_at ASC LIMIT n
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');

-- 3. Fast lookup of jobs by entity (for status queries)
-- Optimizes: SELECT ... WHERE entity_type = ? AND entity_id = ? AND target_language = ?
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);

-- 4. Fast lookup of stale processing jobs (for cleanup)
-- Optimizes: SELECT ... WHERE status = 'processing' AND started_at < (now() - interval '5 minutes')
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

---

## Files Modified Summary

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/supabase.ts` | Modify | Add `priority` field to translation_jobs type definitions (Row, Insert, Update) |

---

## Database Objects Created Summary

| Object Type | Name | Description |
|-------------|------|-------------|
| Column | `translation_jobs.priority` | Integer column with DEFAULT 50 |
| Index | `idx_translation_jobs_pending` | Partial B-tree on (status, priority DESC, created_at ASC) WHERE status IN ('queued', 'processing') |
| Index | `idx_translation_jobs_entity_full` | B-tree on (entity_type, entity_id, target_language) |
| Index | `idx_translation_jobs_stale` | Partial B-tree on (status, started_at) WHERE status = 'processing' |

---

## Execution Checklist

### Pre-Implementation Checks
- [ ] Verify translation_jobs table exists
- [ ] Verify no conflicting index names exist
- [ ] Confirm Supabase MCP access

### Task Execution
- [ ] Task 6.1.1: Add priority column
- [ ] Task 6.1.2: Create pending jobs index
- [ ] Task 6.1.3: Create entity lookup index
- [ ] Task 6.1.4: Create stale jobs index
- [ ] Task 6.1.5: Update TypeScript types
- [ ] Task 6.1.6: Verify all indexes and query plans

### Post-Implementation Verification
- [ ] All indexes appear in pg_indexes
- [ ] EXPLAIN ANALYZE shows index usage
- [ ] TypeScript compilation succeeds
- [ ] No regressions in existing functionality

---

## Rollback Procedure

If any issues occur, rollback in reverse order:

```sql
-- Rollback indexes (safe, doesn't affect data)
DROP INDEX IF EXISTS idx_translation_jobs_stale;
DROP INDEX IF EXISTS idx_translation_jobs_entity_full;
DROP INDEX IF EXISTS idx_translation_jobs_pending;

-- Rollback priority column (only if no data depends on it)
ALTER TABLE translation_jobs DROP COLUMN IF EXISTS priority;
```

**Note:** Only execute rollback if critical issues are found. Index removal is non-destructive.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index creation blocks table writes | Very Low | Low | IF NOT EXISTS; table is small; Supabase handles concurrency |
| Priority column DEFAULT conflicts | Very Low | Low | DEFAULT 50 is safe for existing rows |
| Index not used by optimizer | Low | Medium | Verify with EXPLAIN ANALYZE after creation |
| Migration fails | Very Low | Low | All operations are idempotent |
| TypeScript types out of sync | Low | Low | Update immediately after migration |

---

## Dependencies

### Prerequisite Tasks (Must be Complete)
| Task | Description | Status |
|------|-------------|--------|
| REQ-223 | L10N Foundation migration (translation_jobs table) | Required |
| REQ-227 | TypeScript types for translation tables | Required |
| Epic 1 | All foundation infrastructure | Required |

### Dependent Tasks (Unblocked After Completion)
| Task | Description |
|------|-------------|
| Phase 3 Job Prioritization | Uses priority column and pending jobs index |
| Phase 3 Stale Job Cleanup | Uses stale jobs index |
| Phase 4 Translation Status API | Uses entity lookup index |
| Phase 5 Job Processing API | Uses pending jobs index for efficient pickup |

---

## References

- [Overview Document](/docs/REQ-359-create-translation-job-indexes-overview.md)
- [Implementation Plan - Plan-111-L10N-Epic3](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Document - gen_requests_epic3.md](/docs/gen_requests_epic3.md#req-359)
- [PostgreSQL Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL EXPLAIN ANALYZE](https://www.postgresql.org/docs/current/using-explain.html)

---

*Document generated for FAQBNB REQ-359 - Create Translation Job Indexes*
*Phase 6.1 of L10N Epic 3: Dynamic Content Translation*
