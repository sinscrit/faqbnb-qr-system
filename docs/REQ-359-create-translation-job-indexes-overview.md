# REQ-359: Create Translation Job Indexes - Implementation Overview

**Generated:** 2026-01-19 20:45:00 UTC
**Last Modified:** 2026-01-19 20:45:00 UTC
**Request Reference:** REQ-359 - Create Translation Job Indexes
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.1)
**Status:** Ready for Implementation

---

## 1. Request Summary

Apply database indexes from the Architecture section of the implementation plan to optimize translation job queue query performance. This ensures efficient job retrieval, status monitoring, and cleanup operations regardless of queue size.

**Key Objectives:**
1. Add `priority` column to `translation_jobs` table (prerequisite for pending jobs index)
2. Create partial index for efficient job pickup by the job processor
3. Create composite index for entity-based status lookups
4. Create partial index for identifying stale/stuck jobs during cleanup

---

## 2. Current State Analysis

### Existing translation_jobs Table Structure

| Column | Data Type | Default | Notes |
|--------|-----------|---------|-------|
| id | uuid | gen_random_uuid() | PRIMARY KEY |
| entity_type | varchar | - | CHECK (article, item, link, tag) |
| entity_id | uuid | - | NOT NULL |
| source_language | varchar | 'en' | CHECK (en, fr, es, de, nl, it) |
| target_language | varchar | - | CHECK (en, fr, es, de, nl, it) |
| status | varchar | 'queued' | CHECK (queued, processing, completed, failed) |
| attempts | integer | 0 | - |
| error_message | text | - | nullable |
| created_at | timestamptz | now() | - |
| started_at | timestamptz | - | nullable |
| completed_at | timestamptz | - | nullable |
| locked_by | text | - | nullable - Worker ID for processing lock |
| locked_at | timestamptz | - | nullable - Lock acquisition timestamp |

**Missing Column:** `priority` (integer) - Required for job prioritization as specified in the implementation plan.

### Existing Indexes on translation_jobs

| Index Name | Definition | Purpose |
|------------|------------|---------|
| translation_jobs_pkey | UNIQUE btree (id) | Primary key |
| translation_jobs_entity_type_entity_id_target_language_key | UNIQUE btree (entity_type, entity_id, target_language) | Prevent duplicate jobs |
| idx_trans_jobs_status | btree (status) | Basic status filtering |
| idx_trans_jobs_entity | btree (entity_type, entity_id) | Entity lookup (2 columns) |
| idx_trans_jobs_target | btree (target_language) | Language filtering |
| idx_trans_jobs_created | btree (created_at) | Creation time ordering |
| idx_translation_jobs_processing_locked | btree (status, locked_at) WHERE status = 'processing' | Processing job lock tracking |

### Required New Indexes (From Architecture Plan)

The implementation plan (Section: Database Schema) specifies these specialized indexes:

```sql
-- Fast lookup of pending/processing jobs (for job processor)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');

-- Fast lookup of jobs by entity (for status queries)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity
  ON translation_jobs(entity_type, entity_id, target_language);

-- Fast lookup of stale processing jobs (for cleanup)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

### Gap Analysis

| Required Index | Current Status | Action Required |
|----------------|----------------|-----------------|
| idx_translation_jobs_pending | Missing | Create (requires priority column first) |
| idx_translation_jobs_entity (3-col) | Partial - 2 columns exist | Create full 3-column version |
| idx_translation_jobs_stale | Missing | Create |
| priority column | Missing | Add column |

---

## 3. Technical Approach

### Step 1: Add Priority Column

Before creating the pending jobs index, the `priority` column must be added:

```sql
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';
```

### Step 2: Create Pending Jobs Partial Index

Optimizes the critical query that picks up jobs for processing:

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');
```

**Benefits:**
- Partial index only includes active jobs (queued/processing), minimizing index size
- Orders by priority DESC for high-priority job processing
- Secondary ordering by created_at ASC for FIFO within same priority
- Efficient for `ORDER BY priority DESC, created_at ASC LIMIT n` queries

### Step 3: Create Full Entity Jobs Index

Supports status endpoint queries with all three lookup dimensions:

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);
```

**Note:** Named `idx_translation_jobs_entity_full` to avoid conflict with existing `idx_trans_jobs_entity`.

### Step 4: Create Stale Jobs Partial Index

Optimizes the stale job cleanup query:

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

**Benefits:**
- Partial index only includes processing jobs
- Enables efficient identification of jobs stuck beyond timeout threshold
- Supports: `WHERE status = 'processing' AND started_at < (now() - interval '5 minutes')`

---

## 4. Implementation Tasks

### Task 6.1.1: Add priority column to translation_jobs table

**Action:** Apply database migration
**Method:** Supabase MCP `apply_migration`

```sql
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';
```

**Migration Name:** `add_translation_jobs_priority_column`

### Task 6.1.2: Create pending jobs partial index

**Action:** Apply database migration
**Method:** Supabase MCP `apply_migration`

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');
```

**Migration Name:** `create_translation_jobs_pending_index`

### Task 6.1.3: Create full entity lookup index

**Action:** Apply database migration
**Method:** Supabase MCP `apply_migration`

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);
```

**Migration Name:** `create_translation_jobs_entity_full_index`

### Task 6.1.4: Create stale jobs partial index

**Action:** Apply database migration
**Method:** Supabase MCP `apply_migration`

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

**Migration Name:** `create_translation_jobs_stale_index`

### Task 6.1.5: Update TypeScript types for priority column

**Action:** Update type definitions
**File:** `/src/lib/supabase.ts`

Add `priority` field to `translation_jobs` type definition in Row, Insert, and Update sections.

### Task 6.1.6: Verify indexes are applied

**Action:** Query pg_indexes to verify
**Method:** Supabase MCP `execute_sql`

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
ORDER BY indexname;
```

---

## 5. Authorized Files and Functions for Modification

### Database Changes (via Supabase MCP)

| Change Type | Object | Description |
|-------------|--------|-------------|
| ALTER TABLE | translation_jobs | Add `priority` column with DEFAULT 50 |
| CREATE INDEX | idx_translation_jobs_pending | Partial index for job pickup query optimization |
| CREATE INDEX | idx_translation_jobs_entity_full | Composite index for entity-based status lookups |
| CREATE INDEX | idx_translation_jobs_stale | Partial index for stale job cleanup queries |

### Files to MODIFY

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/supabase.ts` | Modify | Add `priority` field to `translation_jobs` type definitions |

### Sections to Modify in supabase.ts

| Location | Section | Change |
|----------|---------|--------|
| `Database.public.Tables.translation_jobs.Row` | Row type | Add `priority: number \| null` |
| `Database.public.Tables.translation_jobs.Insert` | Insert type | Add `priority?: number \| null` |
| `Database.public.Tables.translation_jobs.Update` | Update type | Add `priority?: number \| null` |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/lib/job-queue/*.ts` | Job queue code changes are separate tasks (Phase 3) |
| `/src/app/api/**` | API routes don't change for index creation |
| Other database tables | This task only affects translation_jobs table |

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Status | Dependency Type |
|------|--------|-----------------|
| REQ-223 (L10N Foundation migration) | Complete | translation_jobs table must exist |
| REQ-227 (TypeScript types) | Complete | Base translation_jobs types exist |
| L10N Epic 1 (Plan-110) | Complete | Foundation infrastructure in place |

### Dependent Tasks (Unblocked after completion)

| Task | Description |
|------|-------------|
| Phase 3 Job Prioritization | Uses priority column and pending jobs index |
| Phase 3 Stale Job Cleanup | Uses stale jobs index |
| Phase 4 Translation Status API | Uses entity lookup index |
| Phase 5 Job Processing API | Uses pending jobs index for efficient pickup |

---

## 7. Acceptance Criteria

### From REQ-359 Request

- [ ] Database indexes on frequently queried columns enable efficient job retrieval regardless of queue size
- [ ] Job processors retrieve batches of queued jobs in single-digit milliseconds
- [ ] Status monitoring queries return aggregated statistics within 100 milliseconds
- [ ] Query execution plans use index scans instead of sequential scans for filtered queries

### From Implementation Plan (Phase 6, Task 6.1)

- [ ] `priority` column added to translation_jobs table with DEFAULT 50
- [ ] `idx_translation_jobs_pending` partial index created with columns (status, priority DESC, created_at ASC)
- [ ] Pending index uses WHERE clause: `status IN ('queued', 'processing')`
- [ ] `idx_translation_jobs_entity_full` composite index created with columns (entity_type, entity_id, target_language)
- [ ] `idx_translation_jobs_stale` partial index created with columns (status, started_at)
- [ ] Stale index uses WHERE clause: `status = 'processing'`
- [ ] All indexes use `IF NOT EXISTS` for idempotent execution
- [ ] TypeScript type definitions updated to include priority field
- [ ] EXPLAIN ANALYZE confirms index usage for job processor queries

---

## 8. Testing Strategy

### Index Verification

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
  AND indexname IN (
    'idx_translation_jobs_pending',
    'idx_translation_jobs_entity_full',
    'idx_translation_jobs_stale'
  );
```

### Priority Column Verification

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'translation_jobs'
  AND column_name = 'priority';
```

Expected: `priority | integer | 50`

### Query Plan Verification - Job Processor Query

```sql
EXPLAIN ANALYZE
SELECT id, entity_type, entity_id, source_language, target_language
FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT 10;
```

Expected: Index Scan using `idx_translation_jobs_pending`

### Query Plan Verification - Stale Job Cleanup

```sql
EXPLAIN ANALYZE
SELECT id, entity_type, entity_id, started_at
FROM translation_jobs
WHERE status = 'processing'
  AND started_at < (NOW() - INTERVAL '5 minutes');
```

Expected: Index Scan using `idx_translation_jobs_stale`

### TypeScript Compilation

```bash
npm run build
```

Expected: No type errors related to translation_jobs

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index creation locks table | Very Low | Low | IF NOT EXISTS; table is small |
| Priority column DEFAULT conflicts | Very Low | Low | DEFAULT 50 is safe for existing rows |
| Index not used by optimizer | Low | Medium | Verify with EXPLAIN ANALYZE |
| Migration fails | Very Low | Low | All operations are idempotent |
| TypeScript types out of sync | Low | Low | Update immediately after migration |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add priority column migration | 5 min |
| Create pending jobs index | 3 min |
| Create entity lookup index | 3 min |
| Create stale jobs index | 3 min |
| Update TypeScript types | 5 min |
| Verify indexes and query plans | 10 min |
| **Total** | **~30 min** |

---

## 11. Migration SQL Summary

### Combined Migration (Recommended)

**Migration Name:** `create_translation_job_indexes`

```sql
-- REQ-359: Create Translation Job Indexes
-- Epic 3, Phase 6, Task 6.1
-- Generated: 2026-01-19

-- 1. Add priority column for job prioritization
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';

-- 2. Fast lookup of pending/processing jobs (for job processor)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');

-- 3. Fast lookup of jobs by entity (for status queries)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);

-- 4. Fast lookup of stale processing jobs (for cleanup)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

---

## 12. Post-Implementation Steps

After completing this task:

1. **Task 6.2 (Next):** Create translation lookup indexes for item_translations, article_translations, link_translations, tag_translations
2. **Task 6.3:** Add updated_at trigger for translations
3. **Phase 3 Tasks:** Job prioritization and stale job cleanup can now use optimized indexes
4. **Regenerate TypeScript types:** Run `npm run gen:types` if auto-generation is configured

---

## References

- [Implementation Plan - Plan-111-L10N-Epic3](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Document - gen_requests_epic3.md](/docs/gen_requests_epic3.md#req-359)
- [L10N Foundation Migration](/database/migrations/20260117_l10n_foundation.sql)
- [PostgreSQL Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
