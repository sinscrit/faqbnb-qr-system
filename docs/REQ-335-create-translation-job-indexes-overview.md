# REQ-335: Create Database Indexes for Translation Job Optimization - Implementation Overview

**Generated:** 2026-01-18 07:15:00 UTC
**Last Modified:** 2026-01-18 07:15:00 UTC
**Request Reference:** REQ-335 - Database Indexes for Translation Job Optimization
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.1)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create specialized database indexes on the `translation_jobs` table to optimize query performance for job processing, status tracking, and stale job cleanup operations. This task also requires adding a `priority` column to the `translation_jobs` table, which is a prerequisite for the pending jobs index as specified in the architecture plan.

**Key Objectives:**
1. Add `priority` column to `translation_jobs` table (required for the pending jobs index)
2. Create partial index for efficient job pickup by the job processor
3. Create composite index for entity-based status lookups
4. Create partial index for identifying stale/stuck jobs during cleanup

---

## 2. Current State Analysis

### Existing translation_jobs Table Structure

| Column | Data Type | Default | Constraints |
|--------|-----------|---------|-------------|
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

**Missing Column:** `priority` (integer) - Required for job prioritization system (REQ-276)

### Existing Indexes

| Index Name | Definition | Purpose |
|------------|------------|---------|
| translation_jobs_pkey | UNIQUE btree (id) | Primary key |
| translation_jobs_entity_type_entity_id_target_language_key | UNIQUE btree (entity_type, entity_id, target_language) | Prevent duplicate jobs |
| idx_trans_jobs_status | btree (status) | Basic status filtering |
| idx_trans_jobs_entity | btree (entity_type, entity_id) | Entity lookup |
| idx_trans_jobs_target | btree (target_language) | Language filtering |
| idx_trans_jobs_created | btree (created_at) | Creation time ordering |

### Required New Indexes (From Architecture Plan)

The implementation plan specifies these specialized indexes for the job processing workload:

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

**Note:** `idx_translation_jobs_entity` already exists as `idx_trans_jobs_entity` but with only 2 columns. The architecture specifies 3 columns including `target_language`.

---

## 3. Technical Approach

### Step 1: Add Priority Column

Before creating the pending jobs index, the `priority` column must be added to support the priority-based ordering:

```sql
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';
```

### Step 2: Create Optimized Indexes

#### 2.1 Pending Jobs Index (for Job Processor)

This partial index optimizes the critical query that picks up jobs for processing:

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');
```

**Benefits:**
- Partial index only includes active jobs (queued/processing), reducing index size
- Orders by priority DESC to process high-priority jobs first
- Secondary ordering by created_at ASC for FIFO within same priority level
- Enables efficient `ORDER BY priority DESC, created_at ASC LIMIT n` queries

#### 2.2 Entity Jobs Index (for Status Queries)

This composite index supports status endpoint queries that look up jobs by entity:

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);
```

**Note:** Named `idx_translation_jobs_entity_full` to avoid conflict with existing `idx_trans_jobs_entity`. The existing 2-column index can be kept for backward compatibility or dropped if not needed.

#### 2.3 Stale Jobs Index (for Cleanup Operations)

This partial index optimizes the stale job cleanup query:

```sql
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

**Benefits:**
- Partial index only includes processing jobs
- Enables efficient identification of jobs stuck beyond timeout threshold
- Supports queries like: `WHERE status = 'processing' AND started_at < (now() - interval '5 minutes')`

---

## 4. Implementation Tasks

### Task 6.1.1: Add priority column to translation_jobs table

**Action:** Apply database migration to add priority column
**Method:** Supabase MCP `apply_migration`

```sql
-- Add priority column for job prioritization (REQ-276)
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';
```

**Migration Name:** `add_translation_jobs_priority_column`

### Task 6.1.2: Create pending jobs partial index

**Action:** Apply database migration to create index
**Method:** Supabase MCP `apply_migration`

```sql
-- Fast lookup of pending/processing jobs ordered by priority
-- Used by job processor to pick next batch of jobs
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');
```

**Migration Name:** `create_translation_jobs_pending_index`

### Task 6.1.3: Create entity lookup index with target_language

**Action:** Apply database migration to create index
**Method:** Supabase MCP `apply_migration`

```sql
-- Fast lookup of jobs by entity type, id, and target language
-- Used by translation status API endpoints
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);
```

**Migration Name:** `create_translation_jobs_entity_full_index`

### Task 6.1.4: Create stale jobs partial index

**Action:** Apply database migration to create index
**Method:** Supabase MCP `apply_migration`

```sql
-- Fast lookup of stale processing jobs for cleanup
-- Used by stale job recovery utility (REQ-278)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

**Migration Name:** `create_translation_jobs_stale_index`

### Task 6.1.5: Update TypeScript types for priority column

**Action:** Update `/src/lib/supabase.ts` to include priority column
**File:** `/src/lib/supabase.ts`

Add `priority` field to `translation_jobs` type definition:

```typescript
translation_jobs: {
  Row: {
    // ... existing fields ...
    priority: number | null
  }
  Insert: {
    // ... existing fields ...
    priority?: number | null
  }
  Update: {
    // ... existing fields ...
    priority?: number | null
  }
  Relationships: []
}
```

### Task 6.1.6: Verify indexes are applied

**Action:** Query pg_indexes to verify all indexes exist
**Method:** Supabase MCP `execute_sql`

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
ORDER BY indexname;
```

Expected indexes:
- `idx_translation_jobs_entity_full`
- `idx_translation_jobs_pending`
- `idx_translation_jobs_stale`
- `idx_trans_jobs_created`
- `idx_trans_jobs_entity`
- `idx_trans_jobs_status`
- `idx_trans_jobs_target`
- `translation_jobs_entity_type_entity_id_target_language_key`
- `translation_jobs_pkey`

---

## 5. Authorized Files and Functions for Modification

### Database Changes (via Supabase MCP)

| Change Type | Object | Description |
|-------------|--------|-------------|
| ALTER TABLE | translation_jobs | Add `priority` column |
| CREATE INDEX | idx_translation_jobs_pending | Partial index for job pickup |
| CREATE INDEX | idx_translation_jobs_entity_full | Composite index for entity lookups |
| CREATE INDEX | idx_translation_jobs_stale | Partial index for cleanup |

### Files to MODIFY

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/supabase.ts` | Modify | Add `priority` field to `translation_jobs` type definition |

### Sections to Modify in supabase.ts

| Location | Section | Change |
|----------|---------|--------|
| `Database.public.Tables.translation_jobs.Row` | Row type | Add `priority: number \| null` |
| `Database.public.Tables.translation_jobs.Insert` | Insert type | Add `priority?: number \| null` |
| `Database.public.Tables.translation_jobs.Update` | Update type | Add `priority?: number \| null` |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/lib/job-queue/*.ts` | Job queue code changes are separate tasks (REQ-276, REQ-278) |
| Application API routes | Index creation doesn't require code changes |
| Other database tables | This task only affects translation_jobs |

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Status | Dependency Type |
|------|--------|-----------------|
| REQ-223 (L10N Foundation migration) | Complete | translation_jobs table must exist |
| REQ-227 (TypeScript types) | Complete | Base translation_jobs types exist |

### Dependent Tasks (Unblock after completion)

| Task | Description |
|------|-------------|
| REQ-276 (Job Prioritization) | Uses priority column and pending jobs index |
| REQ-278 (Stale Job Cleanup) | Uses stale jobs index |
| REQ-328 (Translation Status API) | Uses entity lookup index |
| REQ-332 (Job Processing API) | Uses pending jobs index for efficient pickup |

---

## 7. Acceptance Criteria

From REQ-335:

- [ ] An index named `idx_translation_jobs_pending` is created on the translation_jobs table
- [ ] The pending jobs index includes columns: status, priority DESC, created_at ASC
- [ ] The pending jobs index uses a partial index filter WHERE status IN ('queued', 'processing')
- [ ] An index named `idx_translation_jobs_entity` (or `idx_translation_jobs_entity_full`) is created on the translation_jobs table
- [ ] The entity jobs index includes columns: entity_type, entity_id, target_language
- [ ] An index named `idx_translation_jobs_stale` is created on the translation_jobs table
- [ ] The stale jobs index includes columns: status, started_at
- [ ] The stale jobs index uses a partial index filter WHERE status = 'processing'
- [ ] All indexes are created using IF NOT EXISTS to allow safe re-execution of the migration
- [ ] The indexes are created through a Supabase migration with an appropriate descriptive migration name
- [ ] The migration is applied using the Supabase MCP tool apply_migration function
- [ ] Database query plans for job processor queries show index usage rather than sequential scans
- [ ] The migration name follows the snake_case convention
- [ ] The migration SQL is idempotent and can be safely run multiple times

### Additional Acceptance Criteria (from analysis)

- [ ] Priority column added to translation_jobs table with default value of 50
- [ ] Priority column has appropriate comment explaining the priority levels
- [ ] TypeScript type definitions updated to include priority field

---

## 8. Testing Strategy

### Index Verification Test

```sql
-- Verify indexes exist with correct definitions
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
  AND indexname IN (
    'idx_translation_jobs_pending',
    'idx_translation_jobs_entity_full',
    'idx_translation_jobs_stale'
  );
```

### Priority Column Test

```sql
-- Verify priority column exists with correct default
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'translation_jobs'
  AND column_name = 'priority';
```

Expected: `priority | integer | 50`

### Query Plan Verification

Test that the job processor query uses the pending index:

```sql
EXPLAIN ANALYZE
SELECT id, entity_type, entity_id, source_language, target_language
FROM translation_jobs
WHERE status = 'queued'
ORDER BY priority DESC, created_at ASC
LIMIT 10;
```

Expected: Index Scan using `idx_translation_jobs_pending`

Test that the stale job cleanup query uses the stale index:

```sql
EXPLAIN ANALYZE
SELECT id, entity_type, entity_id, started_at
FROM translation_jobs
WHERE status = 'processing'
  AND started_at < (NOW() - INTERVAL '5 minutes');
```

Expected: Index Scan using `idx_translation_jobs_stale`

### TypeScript Compilation Test

```bash
npm run build
# OR
npx tsc --noEmit
```

Expected: No type errors related to translation_jobs

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index creation locks table | Very Low | Low | IF NOT EXISTS prevents errors; indexes are small |
| Priority column default conflicts | Very Low | Low | DEFAULT 50 is safe; existing rows get default |
| Index not used by optimizer | Low | Medium | Use EXPLAIN ANALYZE to verify; adjust if needed |
| Migration fails | Very Low | Low | All operations are idempotent with IF NOT EXISTS |
| TypeScript types out of sync | Low | Low | Update types immediately after migration |

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

### Combined Migration (Single Migration Option)

If preferred, all changes can be combined into a single migration:

**Migration Name:** `create_translation_job_indexes`

```sql
-- REQ-335: Create Database Indexes for Translation Job Optimization
-- Epic 3, Phase 6, Task 6.1

-- 1. Add priority column for job prioritization (prerequisite for pending index)
ALTER TABLE translation_jobs
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 50;

COMMENT ON COLUMN translation_jobs.priority IS
  'Job processing priority: 100=new content, 50=updates, 25=batch imports, 10=retries. Higher values processed first.';

-- 2. Fast lookup of pending/processing jobs (for job processor)
-- Supports: SELECT ... WHERE status = 'queued' ORDER BY priority DESC, created_at ASC LIMIT n
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');

-- 3. Fast lookup of jobs by entity (for status queries)
-- Supports: SELECT ... WHERE entity_type = ? AND entity_id = ? AND target_language = ?
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity_full
  ON translation_jobs(entity_type, entity_id, target_language);

-- 4. Fast lookup of stale processing jobs (for cleanup)
-- Supports: SELECT ... WHERE status = 'processing' AND started_at < ?
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

---

## 12. Post-Implementation Steps

After completing this task:

1. **Task 6.2:** Create translation lookup indexes (item_translations, article_translations, link_translations, tag_translations)
2. **Task 6.3:** Add updated_at trigger for translations
3. **Update REQ-276:** Job prioritization implementation can now use priority column
4. **Update REQ-278:** Stale job cleanup can now use the stale index efficiently

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [REQ-276: Job Prioritization](/docs/gen_requests_epic3.md#req-276)
- [REQ-278: Stale Job Cleanup](/docs/gen_requests_epic3.md#req-278)
- [PostgreSQL Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [Supabase MCP apply_migration](https://supabase.com/docs)
