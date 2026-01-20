# REQ-E03-027: Create Translation Job Indexes - Detailed Task Breakdown

**Detailed Implementation Document**

---

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E03-027 |
| **Title** | Create Translation Job Indexes |
| **Type** | ENHANCEMENT |
| **Size** | S (Small) |
| **Epic** | Epic 3 - Dynamic Content Translation |
| **Phase** | 6 - Database Indexes & Optimization |
| **Task ID** | 6.1 |
| **Date Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Overview Document** | REQ-E03-027-create-translation-job-indexes-overview.md |
| **Dependencies** | Epic 1 translation tables, REQ-E03-018 (Job Prioritization), REQ-E03-020 (Stale Job Cleanup) |

---

## 1. Executive Summary

This document provides a granular, step-by-step task breakdown for implementing optimized database indexes on the `translation_jobs` table. These indexes are critical for ensuring efficient query performance as the translation job queue scales to thousands of records. The implementation supports job picking, status queries, stale job detection, and monitoring operations.

---

## 2. Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 `translation_jobs` table exists and is operational
- [ ] Access to Supabase MCP for database operations
- [ ] Understanding of current index state via database query
- [ ] Confirmation that dependent tasks (REQ-E03-013, REQ-E03-018, REQ-E03-020) define the query patterns

---

## 3. Detailed Tasks

### Task 1: Audit Current Index State
**Estimated Effort:** 0.25 story points
**Type:** Research/Verification

#### 1.1 Query Current Indexes

Execute the following query to document existing indexes:

```sql
SELECT
    indexname,
    indexdef,
    tablename
FROM pg_indexes
WHERE tablename = 'translation_jobs'
ORDER BY indexname;
```

**Expected Output:**
Based on the overview document, expect these existing indexes:
- `translation_jobs_pkey` (id)
- `translation_jobs_entity_type_entity_id_target_language_key` (UNIQUE)
- `idx_trans_jobs_status` (status)
- `idx_trans_jobs_entity` (entity_type, entity_id)
- `idx_trans_jobs_target` (target_language)
- `idx_trans_jobs_created` (created_at)
- `idx_translation_jobs_processing_locked` (status, locked_at) WHERE status = 'processing'

#### 1.2 Document Gap Analysis

Compare existing indexes against the requirements from the implementation plan:

| Required Index | Purpose | Existing? | Action |
|----------------|---------|-----------|--------|
| Stale detection (status, started_at) | REQ-E03-020 cleanup | Partial | Create |
| FIFO job picking (created_at) WHERE queued | REQ-E03-013 processor | No | Create |
| Completed temporal (status, completed_at) | REQ-E03-027 monitoring | No | Create |
| Failed temporal (status, completed_at) | REQ-E03-027 monitoring | No | Create |

#### Acceptance Criteria (Task 1):
- [ ] Current indexes fully documented with definitions
- [ ] Gap analysis completed comparing required vs existing
- [ ] No duplicate indexes identified for creation
- [ ] Documentation saved for future reference

---

### Task 2: Create Stale Job Detection Index
**Estimated Effort:** 0.25 story points
**Type:** Database Migration

#### 2.1 Index Specification

**Index Name:** `idx_translation_jobs_stale`
**Table:** `translation_jobs`
**Columns:** `(status, started_at)`
**Partial Filter:** `WHERE status = 'processing'`
**Purpose:** Enables efficient identification of jobs stuck in processing state for REQ-E03-020 (Stale Job Cleanup)

#### 2.2 Implementation SQL

```sql
-- Index for stale job detection (REQ-E03-020)
-- Finds jobs stuck in 'processing' state for too long
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';

COMMENT ON INDEX idx_translation_jobs_stale IS
  'Partial index for detecting stale processing jobs. Used by cleanup routine to find jobs stuck > 5 minutes.';
```

#### 2.3 Verification Query

```sql
-- Verify index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname = 'idx_translation_jobs_stale';
```

#### Acceptance Criteria (Task 2):
- [ ] Index `idx_translation_jobs_stale` created successfully
- [ ] Index uses partial filter for `status = 'processing'`
- [ ] Index comment applied documenting purpose
- [ ] No errors during creation

---

### Task 3: Create FIFO Job Picking Index
**Estimated Effort:** 0.25 story points
**Type:** Database Migration

#### 3.1 Index Specification

**Index Name:** `idx_translation_jobs_queued_fifo`
**Table:** `translation_jobs`
**Columns:** `(created_at ASC)`
**Partial Filter:** `WHERE status = 'queued'`
**Purpose:** Enables efficient FIFO (First-In-First-Out) job picking for the processor

**Note:** This index is used when the `priority` column does not exist. Once REQ-E03-018 adds the `priority` column, this index should be replaced with a priority-based index.

#### 3.2 Implementation SQL

```sql
-- Index for FIFO job picking (without priority column)
-- Orders queued jobs by creation time for fair processing
CREATE INDEX IF NOT EXISTS idx_translation_jobs_queued_fifo
  ON translation_jobs(created_at ASC)
  WHERE status = 'queued';

COMMENT ON INDEX idx_translation_jobs_queued_fifo IS
  'Partial index for FIFO job picking. Orders queued jobs by creation time. Replace with priority-based index after REQ-E03-018.';
```

#### 3.3 Verification Query

```sql
-- Verify index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname = 'idx_translation_jobs_queued_fifo';
```

#### Acceptance Criteria (Task 3):
- [ ] Index `idx_translation_jobs_queued_fifo` created successfully
- [ ] Index uses partial filter for `status = 'queued'`
- [ ] Index orders by `created_at ASC`
- [ ] Index comment applied documenting temporary nature

---

### Task 4: Create Completed Jobs Temporal Index
**Estimated Effort:** 0.25 story points
**Type:** Database Migration

#### 4.1 Index Specification

**Index Name:** `idx_translation_jobs_completed_temporal`
**Table:** `translation_jobs`
**Columns:** `(status, completed_at)`
**Partial Filter:** `WHERE status = 'completed'`
**Purpose:** Enables efficient counting of recently completed jobs for monitoring endpoint (REQ-E03-027)

#### 4.2 Implementation SQL

```sql
-- Index for monitoring endpoint temporal metrics (completed jobs)
-- Counts jobs completed in last hour efficiently
CREATE INDEX IF NOT EXISTS idx_translation_jobs_completed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'completed';

COMMENT ON INDEX idx_translation_jobs_completed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs completed in time window (e.g., last hour).';
```

#### 4.3 Verification Query

```sql
-- Verify index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname = 'idx_translation_jobs_completed_temporal';
```

#### Acceptance Criteria (Task 4):
- [ ] Index `idx_translation_jobs_completed_temporal` created successfully
- [ ] Index uses partial filter for `status = 'completed'`
- [ ] Index includes `completed_at` column for temporal filtering
- [ ] Index comment applied

---

### Task 5: Create Failed Jobs Temporal Index
**Estimated Effort:** 0.25 story points
**Type:** Database Migration

#### 5.1 Index Specification

**Index Name:** `idx_translation_jobs_failed_temporal`
**Table:** `translation_jobs`
**Columns:** `(status, completed_at)`
**Partial Filter:** `WHERE status = 'failed'`
**Purpose:** Enables efficient counting of recently failed jobs for monitoring endpoint (REQ-E03-027)

#### 5.2 Implementation SQL

```sql
-- Index for monitoring endpoint temporal metrics (failed jobs)
-- Counts jobs failed in last hour efficiently
CREATE INDEX IF NOT EXISTS idx_translation_jobs_failed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'failed';

COMMENT ON INDEX idx_translation_jobs_failed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs failed in time window (e.g., last hour).';
```

#### 5.3 Verification Query

```sql
-- Verify index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname = 'idx_translation_jobs_failed_temporal';
```

#### Acceptance Criteria (Task 5):
- [ ] Index `idx_translation_jobs_failed_temporal` created successfully
- [ ] Index uses partial filter for `status = 'failed'`
- [ ] Index includes `completed_at` column for temporal filtering
- [ ] Index comment applied

---

### Task 6: Apply Migration via Supabase MCP
**Estimated Effort:** 0.5 story points
**Type:** Database Migration Execution

#### 6.1 Combine All Index Creation Statements

Create a single migration that applies all indexes atomically:

```sql
-- Migration: Create Translation Job Indexes
-- Purpose: Optimize query patterns for job processing and monitoring
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Task: 6.1 - Create translation job indexes
-- Date: 2026-01-20

-- =============================================================
-- INDEX 1: Stale Job Detection
-- Supports: REQ-E03-020 (Stale Job Cleanup)
-- Query Pattern: WHERE status = 'processing' AND started_at < NOW() - INTERVAL '5 minutes'
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';

COMMENT ON INDEX idx_translation_jobs_stale IS
  'Partial index for detecting stale processing jobs. Used by cleanup routine to find jobs stuck > 5 minutes.';

-- =============================================================
-- INDEX 2: FIFO Job Picking (Pre-Priority)
-- Supports: REQ-E03-013 (Job Processor)
-- Query Pattern: WHERE status = 'queued' ORDER BY created_at ASC LIMIT n
-- Note: Replace with priority-based index after REQ-E03-018
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_translation_jobs_queued_fifo
  ON translation_jobs(created_at ASC)
  WHERE status = 'queued';

COMMENT ON INDEX idx_translation_jobs_queued_fifo IS
  'Partial index for FIFO job picking. Orders queued jobs by creation time. Replace with priority-based index after REQ-E03-018.';

-- =============================================================
-- INDEX 3: Completed Jobs Temporal Lookup
-- Supports: REQ-E03-027 (Monitoring Endpoint)
-- Query Pattern: WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '1 hour'
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_translation_jobs_completed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'completed';

COMMENT ON INDEX idx_translation_jobs_completed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs completed in time window.';

-- =============================================================
-- INDEX 4: Failed Jobs Temporal Lookup
-- Supports: REQ-E03-027 (Monitoring Endpoint)
-- Query Pattern: WHERE status = 'failed' AND completed_at > NOW() - INTERVAL '1 hour'
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_translation_jobs_failed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'failed';

COMMENT ON INDEX idx_translation_jobs_failed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs failed in time window.';
```

#### 6.2 Apply via Supabase MCP

```javascript
// Use Supabase MCP to apply migration
mcp__supabase__apply_migration({
  name: "create_translation_job_indexes",
  query: `... (full SQL from 6.1) ...`
});
```

#### 6.3 Handle Potential Errors

If any error occurs:
1. Check if index already exists (should be handled by IF NOT EXISTS)
2. Check for syntax errors
3. Verify table and column names are correct
4. Check for concurrent index creation conflicts

#### Acceptance Criteria (Task 6):
- [ ] Migration executed without errors
- [ ] All 4 indexes created successfully
- [ ] All index comments applied
- [ ] Migration recorded in Supabase migrations list

---

### Task 7: Verify Index Creation
**Estimated Effort:** 0.25 story points
**Type:** Verification

#### 7.1 Query All New Indexes

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'translation_jobs'
  AND indexname LIKE 'idx_translation_jobs%'
ORDER BY indexname;
```

#### 7.2 Expected Results

| Index Name | Expected Definition |
|------------|---------------------|
| idx_translation_jobs_stale | `CREATE INDEX idx_translation_jobs_stale ON public.translation_jobs USING btree (status, started_at) WHERE (status = 'processing')` |
| idx_translation_jobs_queued_fifo | `CREATE INDEX idx_translation_jobs_queued_fifo ON public.translation_jobs USING btree (created_at) WHERE (status = 'queued')` |
| idx_translation_jobs_completed_temporal | `CREATE INDEX idx_translation_jobs_completed_temporal ON public.translation_jobs USING btree (status, completed_at) WHERE (status = 'completed')` |
| idx_translation_jobs_failed_temporal | `CREATE INDEX idx_translation_jobs_failed_temporal ON public.translation_jobs USING btree (status, completed_at) WHERE (status = 'failed')` |

#### 7.3 Verify Index Comments

```sql
SELECT
    c.relname AS index_name,
    d.description AS comment
FROM pg_class c
JOIN pg_description d ON c.oid = d.objoid
WHERE c.relname LIKE 'idx_translation_jobs%'
  AND d.description IS NOT NULL;
```

#### Acceptance Criteria (Task 7):
- [ ] All 4 indexes exist in database
- [ ] Index definitions match specifications
- [ ] Index comments are retrievable
- [ ] No unexpected indexes created

---

### Task 8: Test Query Performance with EXPLAIN ANALYZE
**Estimated Effort:** 0.5 story points
**Type:** Performance Testing

#### 8.1 Test Stale Job Detection Query

```sql
EXPLAIN ANALYZE
SELECT * FROM translation_jobs
WHERE status = 'processing'
  AND started_at < NOW() - INTERVAL '5 minutes';
```

**Expected Result:** Should show `Index Scan using idx_translation_jobs_stale`

#### 8.2 Test Job Picking Query

```sql
EXPLAIN ANALYZE
SELECT * FROM translation_jobs
WHERE status = 'queued'
ORDER BY created_at ASC
LIMIT 10;
```

**Expected Result:** Should show `Index Scan using idx_translation_jobs_queued_fifo`

#### 8.3 Test Completed Jobs Count Query

```sql
EXPLAIN ANALYZE
SELECT COUNT(*) FROM translation_jobs
WHERE status = 'completed'
  AND completed_at > NOW() - INTERVAL '1 hour';
```

**Expected Result:** Should show `Index Scan` or `Index Only Scan using idx_translation_jobs_completed_temporal`

#### 8.4 Test Failed Jobs Count Query

```sql
EXPLAIN ANALYZE
SELECT COUNT(*) FROM translation_jobs
WHERE status = 'failed'
  AND completed_at > NOW() - INTERVAL '1 hour';
```

**Expected Result:** Should show `Index Scan` or `Index Only Scan using idx_translation_jobs_failed_temporal`

#### 8.5 Document Performance Results

Record execution times and scan types for each query:

| Query | Scan Type | Execution Time | Index Used |
|-------|-----------|----------------|------------|
| Stale detection | Index Scan | ___ ms | idx_translation_jobs_stale |
| Job picking | Index Scan | ___ ms | idx_translation_jobs_queued_fifo |
| Completed count | Index Scan | ___ ms | idx_translation_jobs_completed_temporal |
| Failed count | Index Scan | ___ ms | idx_translation_jobs_failed_temporal |

#### Acceptance Criteria (Task 8):
- [ ] All queries use index scans (not sequential scans)
- [ ] Query execution times are < 100ms for typical data volumes
- [ ] EXPLAIN ANALYZE output documented
- [ ] Performance acceptable for production use

---

### Task 9: Create Rollback Script
**Estimated Effort:** 0.25 story points
**Type:** Documentation

#### 9.1 Rollback SQL

```sql
-- Rollback: Remove Translation Job Indexes
-- Use this script to remove indexes created by REQ-E03-027
-- WARNING: Only run if rollback is necessary

DROP INDEX IF EXISTS idx_translation_jobs_stale;
DROP INDEX IF EXISTS idx_translation_jobs_queued_fifo;
DROP INDEX IF EXISTS idx_translation_jobs_completed_temporal;
DROP INDEX IF EXISTS idx_translation_jobs_failed_temporal;
```

#### 9.2 Document Rollback Procedure

1. Verify no active job processing is occurring
2. Execute rollback SQL via Supabase MCP or SQL console
3. Verify indexes are removed
4. Monitor for query performance degradation

#### Acceptance Criteria (Task 9):
- [ ] Rollback script documented
- [ ] Rollback procedure documented
- [ ] Script tested (dry run verification)

---

### Task 10: Document Future Index Requirements
**Estimated Effort:** 0.25 story points
**Type:** Documentation

#### 10.1 Priority-Based Index (After REQ-E03-018)

Once the `priority` column is added by REQ-E03-018, replace the FIFO index:

```sql
-- Drop FIFO index in favor of priority-based
DROP INDEX IF EXISTS idx_translation_jobs_queued_fifo;

-- Create priority-based job picking index
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');

COMMENT ON INDEX idx_translation_jobs_pending IS
  'Priority-based index for job picking. Orders by priority (DESC) then creation time (ASC).';
```

#### 10.2 Updated_at Index (If Column Added)

If an `updated_at` column is added for comprehensive tracking:

```sql
-- Add updated_at index for statistics queries
CREATE INDEX IF NOT EXISTS idx_translation_jobs_updated
  ON translation_jobs(status, updated_at);

COMMENT ON INDEX idx_translation_jobs_updated IS
  'Index for statistics queries requiring updated_at timestamp.';
```

#### 10.3 Create Documentation Note

Add a note to the migration or schema documentation:

```markdown
## Future Index Requirements

### After REQ-E03-018 (Priority Column)
Replace `idx_translation_jobs_queued_fifo` with `idx_translation_jobs_pending`:
- Columns: (status, priority DESC, created_at ASC)
- Filter: WHERE status IN ('queued', 'processing')

### If updated_at Column Added
Add `idx_translation_jobs_updated`:
- Columns: (status, updated_at)
- Purpose: Statistics queries with updated_at filtering
```

#### Acceptance Criteria (Task 10):
- [ ] Future priority index documented
- [ ] Future updated_at index documented
- [ ] Documentation indicates when to apply future indexes

---

## 4. Complete Migration Script

```sql
-- =============================================================
-- Migration: create_translation_job_indexes
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Task: REQ-E03-027 (Task 6.1 - Create translation job indexes)
-- Date: 2026-01-20
--
-- Purpose: Create optimized database indexes on translation_jobs
--          table for job processing and monitoring operations.
--
-- Dependencies:
--   - Epic 1 translation_jobs table must exist
--   - Supports REQ-E03-013 (Job Processor)
--   - Supports REQ-E03-020 (Stale Job Cleanup)
--   - Supports REQ-E03-027 (Monitoring Endpoint)
--
-- Note: Priority-based index deferred until REQ-E03-018 adds
--       the priority column to translation_jobs table.
-- =============================================================

-- Index 1: Stale job detection for cleanup routine
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';

COMMENT ON INDEX idx_translation_jobs_stale IS
  'Partial index for detecting stale processing jobs. Used by cleanup routine to find jobs stuck > 5 minutes.';

-- Index 2: FIFO job picking for queue processor (pre-priority)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_queued_fifo
  ON translation_jobs(created_at ASC)
  WHERE status = 'queued';

COMMENT ON INDEX idx_translation_jobs_queued_fifo IS
  'Partial index for FIFO job picking. Orders queued jobs by creation time. Replace with priority-based index after REQ-E03-018.';

-- Index 3: Completed jobs temporal lookup for monitoring
CREATE INDEX IF NOT EXISTS idx_translation_jobs_completed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'completed';

COMMENT ON INDEX idx_translation_jobs_completed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs completed in time window.';

-- Index 4: Failed jobs temporal lookup for monitoring
CREATE INDEX IF NOT EXISTS idx_translation_jobs_failed_temporal
  ON translation_jobs(status, completed_at)
  WHERE status = 'failed';

COMMENT ON INDEX idx_translation_jobs_failed_temporal IS
  'Partial index for monitoring endpoint. Enables efficient count of jobs failed in time window.';
```

---

## 5. Rollback Script

```sql
-- =============================================================
-- Rollback: remove_translation_job_indexes
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Task: REQ-E03-027 Rollback
--
-- WARNING: Only execute if rollback is necessary.
--          Query performance will degrade after rollback.
-- =============================================================

DROP INDEX IF EXISTS idx_translation_jobs_stale;
DROP INDEX IF EXISTS idx_translation_jobs_queued_fifo;
DROP INDEX IF EXISTS idx_translation_jobs_completed_temporal;
DROP INDEX IF EXISTS idx_translation_jobs_failed_temporal;
```

---

## 6. Implementation Sequence

| Order | Task | Dependency | Estimated Effort |
|-------|------|------------|------------------|
| 1 | Audit Current Index State | None | 0.25 SP |
| 2 | Create Stale Job Detection Index | Task 1 | 0.25 SP |
| 3 | Create FIFO Job Picking Index | Task 1 | 0.25 SP |
| 4 | Create Completed Jobs Temporal Index | Task 1 | 0.25 SP |
| 5 | Create Failed Jobs Temporal Index | Task 1 | 0.25 SP |
| 6 | Apply Migration via Supabase MCP | Tasks 2-5 | 0.5 SP |
| 7 | Verify Index Creation | Task 6 | 0.25 SP |
| 8 | Test Query Performance | Task 7 | 0.5 SP |
| 9 | Create Rollback Script | Task 6 | 0.25 SP |
| 10 | Document Future Index Requirements | Task 6 | 0.25 SP |

**Total Estimated Effort:** 3.0 Story Points

---

## 7. Acceptance Criteria Summary

### From Original Request (REQ-E03-027/028):

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

### Additional Criteria:

- [ ] Priority-based index deferred until `priority` column added by REQ-E03-018
- [ ] Future index documented for implementation after schema update
- [ ] All partial indexes use appropriate WHERE clauses

---

## 8. Index Usage Reference

### Which Index Serves Which Query

| Component | Query Pattern | Index Used |
|-----------|---------------|------------|
| Job Processor (REQ-E03-013) | `WHERE status = 'queued' ORDER BY created_at LIMIT n` | idx_translation_jobs_queued_fifo |
| Stale Cleanup (REQ-E03-020) | `WHERE status = 'processing' AND started_at < ?` | idx_translation_jobs_stale |
| Monitoring (REQ-E03-027) | `WHERE status = 'completed' AND completed_at > ?` | idx_translation_jobs_completed_temporal |
| Monitoring (REQ-E03-027) | `WHERE status = 'failed' AND completed_at > ?` | idx_translation_jobs_failed_temporal |
| Status API (REQ-E03-021) | `WHERE entity_type = ? AND entity_id = ?` | translation_jobs_entity_type_entity_id_target_language_key (existing) |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index creation blocks writes temporarily | Low | Low | Use CREATE INDEX CONCURRENTLY if high traffic |
| Priority index cannot be created yet | Known | Medium | Document as future task, use FIFO index now |
| Index bloat over time | Low | Low | Monitor size, consider periodic REINDEX |
| Wrong index chosen by planner | Low | Medium | Test with realistic data volumes, use EXPLAIN |
| Migration fails partway through | Low | Medium | Use IF NOT EXISTS, can safely re-run |

---

## 10. Testing Checklist

- [ ] Execute audit query before migration
- [ ] Apply migration via Supabase MCP
- [ ] Verify all 4 indexes created
- [ ] Run EXPLAIN ANALYZE on stale detection query
- [ ] Run EXPLAIN ANALYZE on job picking query
- [ ] Run EXPLAIN ANALYZE on completed count query
- [ ] Run EXPLAIN ANALYZE on failed count query
- [ ] Confirm all queries use index scans
- [ ] Document execution times
- [ ] Test rollback script (optional, on dev only)

---

## 11. References

- **Overview Document:** `/docs/REQ-E03-027-create-translation-job-indexes-overview.md`
- **Request Document:** `/docs/gen_requests_epic3.md` - REQ-E03-028
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Phase 6, Task 6.1
- **Related Tasks:**
  - REQ-E03-013 (Job Processor) - Uses FIFO picking index
  - REQ-E03-018 (Job Prioritization) - Will add priority column, enables priority index
  - REQ-E03-020 (Stale Job Cleanup) - Uses stale detection index
  - REQ-E03-027 (Monitoring Endpoint) - Uses temporal indexes
- **PostgreSQL Index Documentation:** [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

---

*Document generated: 2026-01-20*
*Last modified: 2026-01-20*
