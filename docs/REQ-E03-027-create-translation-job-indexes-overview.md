# REQ-E03-028: Create Translation Job Indexes

**Implementation Breakdown Document**

---

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E03-028 |
| **Title** | Create Translation Job Indexes |
| **Type** | ENHANCEMENT |
| **Size** | S (Small) |
| **Epic** | Epic 3 - Dynamic Content Translation |
| **Phase** | 6 - Database Indexes & Optimization |
| **Task ID** | 6.1 |
| **Date Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Dependencies** | Epic 1 translation tables, REQ-E03-018 (Job Prioritization), REQ-E03-020 (Stale Job Cleanup) |

---

## 1. Summary

Create optimized database indexes on the `translation_jobs` table to ensure efficient query performance for job picking, status queries, stale job detection, and monitoring operations. These indexes support the query patterns established by the job processor (REQ-E03-013), prioritization system (REQ-E03-018), stale job cleanup (REQ-E03-020), and monitoring endpoint (REQ-E03-027).

---

## 2. Background & Context

### Current State

Based on database investigation, the `translation_jobs` table currently has the following indexes:

| Index Name | Columns | Partial Filter |
|------------|---------|----------------|
| `translation_jobs_pkey` | `id` | - |
| `translation_jobs_entity_type_entity_id_target_language_key` | `(entity_type, entity_id, target_language)` | UNIQUE |
| `idx_trans_jobs_status` | `status` | - |
| `idx_trans_jobs_entity` | `(entity_type, entity_id)` | - |
| `idx_trans_jobs_target` | `target_language` | - |
| `idx_trans_jobs_created` | `created_at` | - |
| `idx_translation_jobs_processing_locked` | `(status, locked_at)` | WHERE status = 'processing' |

### Missing Indexes per Implementation Plan

The implementation plan (Plan-111, Phase 6, Task 6.1) specifies these additional indexes:

1. **Job Picking Index** - `(status, priority DESC, created_at ASC)` with partial filter for queued/processing
2. **Stale Job Detection Index** - `(status, started_at)` for cleanup routine
3. **Statistics Index** - `(status, updated_at)` for monitoring endpoint temporal metrics

### Missing Column: `priority`

**IMPORTANT:** The implementation plan references a `priority` column that does **not currently exist** in the `translation_jobs` table. The table has:
- `id`, `entity_type`, `entity_id`, `source_language`, `target_language`, `status`, `attempts`, `error_message`, `created_at`, `started_at`, `completed_at`, `locked_by`, `locked_at`

The priority column must be added (likely in REQ-E03-018: Implement Job Prioritization) before the priority-based index can be created.

### Missing Column: `updated_at`

The `updated_at` column also **does not exist** in `translation_jobs`. Without this column, the statistics index for monitoring cannot be created as specified. Options:
1. Add `updated_at` column as part of this migration
2. Use alternative columns (e.g., `completed_at`, `started_at`) for temporal queries
3. Create index on existing columns that serve similar purpose

### Why This Change Is Needed

As the job queue scales to thousands of records:
- Job picking queries without proper indexes require full table scans
- Stale job detection becomes slow without targeted index
- Monitoring endpoint response times degrade
- List views showing translation status experience delays

---

## 3. Technical Requirements

### 3.1 Existing Indexes (Already Created)

These indexes already exist and satisfy some requirements:

| Purpose | Required Index | Existing Index | Status |
|---------|----------------|----------------|--------|
| Entity lookup | `(entity_type, entity_id, target_language)` | `translation_jobs_entity_type_entity_id_target_language_key` | ✅ Covered |
| Status filtering | `status` | `idx_trans_jobs_status` | ✅ Covered |
| Language aggregation | `target_language` | `idx_trans_jobs_target` | ✅ Covered |
| Lock detection | `(status, locked_at)` WHERE processing | `idx_translation_jobs_processing_locked` | ✅ Covered |

### 3.2 Indexes to Create

Given current table schema, create these indexes:

#### Index 1: Stale Job Detection (started_at based)
```sql
-- For stale job cleanup routine (REQ-E03-020)
-- Finds jobs stuck in 'processing' state for too long
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

#### Index 2: Job Picking Optimization (without priority)
```sql
-- For job processor picking next batch (without priority column)
-- Orders by creation time when status is queued
CREATE INDEX IF NOT EXISTS idx_translation_jobs_queued_fifo
  ON translation_jobs(created_at ASC)
  WHERE status = 'queued';
```

#### Index 3: Statistics Temporal Query (using completed_at)
```sql
-- For monitoring endpoint temporal metrics
-- Counts jobs completed in last hour
CREATE INDEX IF NOT EXISTS idx_translation_jobs_completed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'completed';
```

#### Index 4: Failed Jobs Temporal Query
```sql
-- For monitoring failed jobs in last hour
CREATE INDEX IF NOT EXISTS idx_translation_jobs_failed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'failed';
```

### 3.3 Future Indexes (After Priority Column Added)

Once REQ-E03-018 adds the `priority` column, create:

```sql
-- Priority-based job picking (add after priority column exists)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');
```

---

## 4. Implementation Approach

### 4.1 Migration Strategy

Use Supabase MCP to apply the migration. The migration will:

1. Add any missing indexes using `CREATE INDEX IF NOT EXISTS` for idempotency
2. Include comments documenting each index's purpose
3. Be applied via Supabase MCP `apply_migration` function

### 4.2 Index Creation Script

```sql
-- Migration: Create Translation Job Indexes
-- Purpose: Optimize query patterns for job processing and monitoring
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Task: 6.1 - Create translation job indexes
-- Date: 2026-01-20

-- Index 1: Stale job detection for cleanup routine (REQ-E03-020)
-- Enables efficient identification of jobs stuck in processing state
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';

COMMENT ON INDEX idx_translation_jobs_stale IS
  'Partial index for detecting stale processing jobs. Used by cleanup routine to find jobs stuck > 5 minutes.';

-- Index 2: FIFO job picking for queue processor (without priority)
-- Enables efficient pickup of oldest queued jobs
CREATE INDEX IF NOT EXISTS idx_translation_jobs_queued_fifo
  ON translation_jobs(created_at ASC)
  WHERE status = 'queued';

COMMENT ON INDEX idx_translation_jobs_queued_fifo IS
  'Partial index for FIFO job picking. Orders queued jobs by creation time for fair processing.';

-- Index 3: Completed jobs temporal lookup for monitoring
-- Enables efficient counting of recently completed jobs
CREATE INDEX IF NOT EXISTS idx_translation_jobs_completed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'completed';

COMMENT ON INDEX idx_translation_jobs_completed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs completed in time window.';

-- Index 4: Failed jobs temporal lookup for monitoring
-- Enables efficient counting of recently failed jobs
CREATE INDEX IF NOT EXISTS idx_translation_jobs_failed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'failed';

COMMENT ON INDEX idx_translation_jobs_failed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs failed in time window.';
```

### 4.3 Rollback Script

```sql
-- Rollback: Remove Translation Job Indexes
-- Only removes indexes created by this migration

DROP INDEX IF EXISTS idx_translation_jobs_stale;
DROP INDEX IF EXISTS idx_translation_jobs_queued_fifo;
DROP INDEX IF EXISTS idx_translation_jobs_completed_temporal;
DROP INDEX IF EXISTS idx_translation_jobs_failed_temporal;
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Database Changes (via Supabase MCP)

| Change Type | Target | Description |
|-------------|--------|-------------|
| CREATE INDEX | `translation_jobs` | `idx_translation_jobs_stale` partial index |
| CREATE INDEX | `translation_jobs` | `idx_translation_jobs_queued_fifo` partial index |
| CREATE INDEX | `translation_jobs` | `idx_translation_jobs_completed_temporal` partial index |
| CREATE INDEX | `translation_jobs` | `idx_translation_jobs_failed_temporal` partial index |

### 5.2 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/database/migrations/YYYYMMDD_create_translation_job_indexes.sql` | Optional: Local migration file for reference |

### 5.3 Files to Modify

| File Path | Changes |
|-----------|---------|
| `/database/schema.sql` | Add index definitions to schema documentation (optional) |

### 5.4 Supabase MCP Operations

```javascript
// Migration application via Supabase MCP
mcp__supabase__apply_migration({
  name: "create_translation_job_indexes",
  query: "..." // Full SQL from section 4.2
});
```

---

## 6. Implementation Tasks

### Task 1: Verify Current Index State

Before creating indexes, verify what already exists:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
ORDER BY indexname;
```

**Acceptance Criteria:**
- [ ] Current indexes documented
- [ ] Gap analysis completed against requirements
- [ ] No duplicate index creation

### Task 2: Apply Migration via Supabase MCP

Execute the migration to create missing indexes:

```sql
-- Apply all index creation statements
-- Use IF NOT EXISTS for safe re-running
```

**Acceptance Criteria:**
- [ ] All index CREATE statements execute successfully
- [ ] Index comments are applied
- [ ] No errors or conflicts

### Task 3: Verify Index Creation

Confirm all indexes were created:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
  AND indexname LIKE 'idx_translation_jobs%'
ORDER BY indexname;
```

**Acceptance Criteria:**
- [ ] `idx_translation_jobs_stale` exists
- [ ] `idx_translation_jobs_queued_fifo` exists
- [ ] `idx_translation_jobs_completed_temporal` exists
- [ ] `idx_translation_jobs_failed_temporal` exists

### Task 4: Test Query Performance

Verify indexes are being used by checking query plans:

```sql
-- Test stale job detection query
EXPLAIN ANALYZE
SELECT * FROM translation_jobs
WHERE status = 'processing'
  AND started_at < NOW() - INTERVAL '5 minutes';

-- Test job picking query
EXPLAIN ANALYZE
SELECT * FROM translation_jobs
WHERE status = 'queued'
ORDER BY created_at ASC
LIMIT 10;

-- Test completed jobs count
EXPLAIN ANALYZE
SELECT COUNT(*) FROM translation_jobs
WHERE status = 'completed'
  AND completed_at > NOW() - INTERVAL '1 hour';
```

**Acceptance Criteria:**
- [ ] Query plans show index usage (Index Scan or Index Only Scan)
- [ ] No sequential scans on indexed columns
- [ ] Query execution time is acceptable

### Task 5: Document Index Strategy

Update documentation to reflect index strategy:

**Acceptance Criteria:**
- [ ] Index purposes documented
- [ ] Maintenance requirements noted
- [ ] Future priority index documented as pending

---

## 7. Index Usage by Component

### Job Processor (REQ-E03-013)

Uses `idx_translation_jobs_queued_fifo`:
```sql
SELECT * FROM translation_jobs
WHERE status = 'queued'
ORDER BY created_at ASC
LIMIT :batch_size
FOR UPDATE SKIP LOCKED;
```

### Stale Job Cleanup (REQ-E03-020)

Uses `idx_translation_jobs_stale`:
```sql
UPDATE translation_jobs
SET status = 'queued', attempts = attempts + 1
WHERE status = 'processing'
  AND started_at < NOW() - INTERVAL '5 minutes';
```

### Monitoring Endpoint (REQ-E03-027)

Uses `idx_translation_jobs_completed_temporal` and `idx_translation_jobs_failed_temporal`:
```sql
SELECT COUNT(*) FROM translation_jobs
WHERE status = 'completed'
  AND completed_at > NOW() - INTERVAL '1 hour';

SELECT COUNT(*) FROM translation_jobs
WHERE status = 'failed'
  AND completed_at > NOW() - INTERVAL '1 hour';
```

### Translation Status Queries (REQ-E03-021)

Uses existing `translation_jobs_entity_type_entity_id_target_language_key`:
```sql
SELECT * FROM translation_jobs
WHERE entity_type = :type
  AND entity_id = :id;
```

---

## 8. Acceptance Criteria Checklist

From REQ-E03-028:

- [ ] Database migration file is created with appropriate naming convention and timestamp
- [ ] Migration includes CREATE INDEX statement for stale detection using `(status, started_at)`
- [ ] Migration includes CREATE INDEX statement for FIFO job picking using `(created_at)` with status filter
- [ ] Migration includes CREATE INDEX statement for completed temporal using `(status, completed_at)`
- [ ] Migration includes CREATE INDEX statement for failed temporal using `(status, completed_at)`
- [ ] All CREATE INDEX statements include IF NOT EXISTS clause for safe rerunning
- [ ] Migration is tested on development database to verify syntax and execution
- [ ] Migration is applied to staging environment and performance is validated
- [ ] Job picker query execution plan shows index usage after migration
- [ ] Stale job cleanup query execution plan shows index usage after migration
- [ ] Translation status query execution plan shows index usage after migration
- [ ] Monitoring endpoint query execution plan shows index usage after migration
- [ ] Query performance is measured before and after migration showing improvement
- [ ] Index maintenance does not significantly impact job insert or update operations
- [ ] Migration includes appropriate comments documenting index purpose
- [ ] Rollback statements documented for index removal if needed
- [ ] Documentation is updated to reflect index strategy and maintenance requirements

**Note on Priority Index:**
- [ ] Priority-based index deferred until `priority` column added by REQ-E03-018
- [ ] Future index documented for implementation after schema update

---

## 9. Performance Expectations

### Before Indexes

| Query Pattern | Estimated Cost | Execution Type |
|---------------|----------------|----------------|
| Pick queued jobs | High (full scan) | Seq Scan |
| Find stale jobs | High (full scan) | Seq Scan |
| Count completed (1hr) | High (full scan) | Seq Scan |
| Count failed (1hr) | High (full scan) | Seq Scan |

### After Indexes

| Query Pattern | Expected Cost | Execution Type |
|---------------|---------------|----------------|
| Pick queued jobs | Low | Index Scan |
| Find stale jobs | Low | Index Scan |
| Count completed (1hr) | Low | Index Only Scan |
| Count failed (1hr) | Low | Index Only Scan |

### Index Storage Overhead

- Partial indexes are compact (only include matching rows)
- Estimated total index overhead: < 5% of table size
- Write overhead: Minimal (indexes only updated when relevant rows change)

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index creation blocks writes temporarily | Low | Low | Use CREATE INDEX CONCURRENTLY if needed |
| Priority index cannot be created yet | Known | Medium | Document as future task, use FIFO index now |
| Index bloat over time | Low | Low | Monitor, consider REINDEX periodically |
| Wrong index chosen by planner | Low | Medium | Test with realistic data volumes |

---

## 11. Dependencies

### Upstream Dependencies (Must Be Completed First)

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 translation tables | ✅ Complete | `translation_jobs` table exists |
| Table columns | ⚠️ Partial | `priority` column missing (REQ-E03-018) |

### Downstream Dependencies (Enabled By This)

| Dependent | Impact |
|-----------|--------|
| REQ-E03-013 (Job Processor) | Faster job picking |
| REQ-E03-020 (Stale Cleanup) | Efficient stale detection |
| REQ-E03-027 (Monitoring) | Fast statistics queries |
| REQ-E03-024 (Batch Status) | Improved list view performance |

---

## 12. Future Considerations

### When Priority Column Is Added (REQ-E03-018)

After the `priority` column exists, add:

```sql
-- Drop FIFO index in favor of priority-based
DROP INDEX IF EXISTS idx_translation_jobs_queued_fifo;

-- Create priority-based index
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');
```

### When updated_at Column Is Added

If an `updated_at` column is added for comprehensive tracking:

```sql
-- Add timestamp trigger
CREATE TRIGGER translation_jobs_updated
  BEFORE UPDATE ON translation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add statistics index
CREATE INDEX IF NOT EXISTS idx_translation_jobs_updated
  ON translation_jobs(status, updated_at);
```

---

## 13. References

- **Request Document:** `/docs/gen_requests_epic3.md` - REQ-E03-028
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Phase 6, Task 6.1
- **Job Prioritization:** REQ-E03-018 (adds priority column)
- **Stale Job Cleanup:** REQ-E03-020 (uses stale index)
- **Monitoring Endpoint:** REQ-E03-027 (uses temporal indexes)
- **PostgreSQL Index Documentation:** [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

---

*Document generated: 2026-01-20*
*Last modified: 2026-01-20*
