# REQ-E03-027: Create Translation Lookup Indexes - Detailed Task Breakdown

**Generated:** 2026-01-20 17:30:00 UTC
**Last Modified:** 2026-01-20 17:30:00 UTC

---

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E03-027 |
| **Title** | Create Translation Lookup Indexes |
| **Type** | ENHANCEMENT |
| **Size** | S (Small) |
| **Epic** | Epic 3 - Dynamic Content Translation |
| **Phase** | 6 - Database Indexes & Optimization |
| **Task ID** | 6.2 |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Overview Document** | REQ-E03-027-create-translation-lookup-indexes-overview.md |
| **Dependencies** | Epic 1 translation tables (l10n_foundation migration) |

---

## 1. Executive Summary

This task creates optimized database indexes on translation tables (item_translations, article_translations, link_translations, tag_translations) to enable fast lookup of translated content by entity ID and language combination. These indexes support the primary access pattern for displaying translated content to guests.

**Critical Finding:** Analysis in the overview document reveals that equivalent indexes **already exist** from Epic 1 (l10n_foundation migration). This task focuses on verification and documentation rather than creating duplicate indexes.

---

## 2. Pre-Implementation Analysis

### 2.1 Existing Index Coverage (from Epic 1)

| Table | Existing Index | Columns | Status |
|-------|----------------|---------|--------|
| `item_translations` | `idx_item_trans_item_lang` | `(item_id, language)` | Already exists |
| `article_translations` | `idx_article_trans_article_lang` | `(article_id, language)` | Already exists |
| `link_translations` | `idx_link_trans_link_lang` | `(link_id, language)` | Already exists |
| `tag_translations` | `idx_tag_trans_key_lang` | `(tag_key, language)` | Already exists |

### 2.2 Existing UNIQUE Constraints

| Table | Constraint Name | Columns |
|-------|----------------|---------|
| `item_translations` | `item_translations_item_id_language_key` | `(item_id, language)` |
| `article_translations` | `article_translations_article_id_language_key` | `(article_id, language)` |
| `link_translations` | `link_translations_link_id_language_key` | `(link_id, language)` |
| `tag_translations` | `tag_translations_tag_key_language_key` | `(tag_key, language)` |

### 2.3 Recommendation

**Option A (Recommended): Verify and Document Existing Coverage**
- Confirm existing indexes satisfy lookup requirements
- Document that Task 6.2 is satisfied by Epic 1 implementation
- No migration needed

**Option B: Create Aliased Indexes (Not Recommended)**
- Would create duplicate indexes with different names
- Wastes disk space and slows INSERT/UPDATE operations
- No performance benefit

---

## 3. Detailed Task Breakdown

### Task 1: Verify Existing Index Coverage

**Story Points:** 0.5
**Priority:** P0 (Critical)
**Estimated Effort:** 15 minutes

#### 1.1 Objective
Confirm that all required translation lookup indexes exist and cover the necessary query patterns.

#### 1.2 Implementation Steps

**Step 1.2.1: Query Existing Indexes**
Execute via Supabase MCP or SQL editor:

```sql
-- List all indexes on translation tables
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'item_translations',
  'article_translations',
  'link_translations',
  'tag_translations'
)
ORDER BY tablename, indexname;
```

**Step 1.2.2: Verify Index Column Coverage**
For each table, confirm an index exists with:
- `item_translations`: columns include `(item_id, language)`
- `article_translations`: columns include `(article_id, language)`
- `link_translations`: columns include `(link_id, language)`
- `tag_translations`: columns include `(tag_key, language)`

**Step 1.2.3: Document Results**
Record the output showing which indexes exist and their definitions.

#### 1.3 Acceptance Criteria
- [ ] SQL query executed successfully
- [ ] At least one index per table covers the (entity_id, language) columns
- [ ] Results documented for reference

#### 1.4 Verification Command
```sql
-- Count indexes covering required columns
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE (
  (tablename = 'item_translations' AND indexdef LIKE '%item_id%language%')
  OR (tablename = 'article_translations' AND indexdef LIKE '%article_id%language%')
  OR (tablename = 'link_translations' AND indexdef LIKE '%link_id%language%')
  OR (tablename = 'tag_translations' AND indexdef LIKE '%tag_key%language%')
);
-- Expected: 4 or more (may have unique + regular indexes)
```

---

### Task 2: Run Query Plan Analysis

**Story Points:** 0.5
**Priority:** P0 (Critical)
**Estimated Effort:** 20 minutes

#### 2.1 Objective
Verify that the database query planner utilizes the existing indexes for typical translation lookup queries.

#### 2.2 Implementation Steps

**Step 2.2.1: Test Item Translation Lookup**
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT name, description, translation_status, translated_at
FROM item_translations
WHERE item_id = (SELECT id FROM items LIMIT 1)
  AND language = 'fr';
```

**Step 2.2.2: Test Article Translation Lookup**
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT title, description, translation_status, translated_at
FROM article_translations
WHERE article_id = (SELECT id FROM item_articles LIMIT 1)
  AND language = 'es';
```

**Step 2.2.3: Test Link Translation Lookup**
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT title, translation_status, translated_at
FROM link_translations
WHERE link_id = (SELECT id FROM item_links LIMIT 1)
  AND language = 'de';
```

**Step 2.2.4: Test Tag Translation Lookup**
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT translated_value, is_system_tag
FROM tag_translations
WHERE tag_key = 'kitchen'
  AND language = 'it';
```

#### 2.3 Expected Results
Each EXPLAIN output should show:
- `Index Scan` or `Index Only Scan` (NOT `Seq Scan`)
- Reference to either the composite index or unique constraint index
- Execution time under 10ms for small-to-medium datasets

#### 2.4 Acceptance Criteria
- [ ] Item translation query uses index scan
- [ ] Article translation query uses index scan
- [ ] Link translation query uses index scan
- [ ] Tag translation query uses index scan
- [ ] All query execution times are under 10ms

#### 2.5 Sample Expected Output
```
Index Scan using idx_item_trans_item_lang on item_translations  (cost=0.15..8.17 rows=1 width=200)
  Index Cond: ((item_id = 'xxx'::uuid) AND ((language)::text = 'fr'::text))
  Execution Time: 0.052 ms
```

---

### Task 3: Performance Benchmark

**Story Points:** 0.5
**Priority:** P1 (High)
**Estimated Effort:** 15 minutes

#### 3.1 Objective
Measure actual query performance to establish baseline metrics and confirm sub-10ms response times.

#### 3.2 Implementation Steps

**Step 3.2.1: Prepare Test Queries**
Create a set of representative queries that simulate real-world access patterns:

```sql
-- Benchmark: Multiple language lookups for same item
DO $$
DECLARE
  test_item_id UUID;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  total_ms NUMERIC;
BEGIN
  -- Get a test item ID
  SELECT id INTO test_item_id FROM items LIMIT 1;

  IF test_item_id IS NULL THEN
    RAISE NOTICE 'No items found for benchmark';
    RETURN;
  END IF;

  start_time := clock_timestamp();

  -- Simulate multi-language lookup (typical guest view scenario)
  PERFORM * FROM item_translations WHERE item_id = test_item_id AND language = 'fr';
  PERFORM * FROM item_translations WHERE item_id = test_item_id AND language = 'es';
  PERFORM * FROM item_translations WHERE item_id = test_item_id AND language = 'de';
  PERFORM * FROM item_translations WHERE item_id = test_item_id AND language = 'nl';
  PERFORM * FROM item_translations WHERE item_id = test_item_id AND language = 'it';

  end_time := clock_timestamp();
  total_ms := EXTRACT(MILLISECONDS FROM end_time - start_time);

  RAISE NOTICE 'Total time for 5 language lookups: % ms', total_ms;
  RAISE NOTICE 'Average per lookup: % ms', total_ms / 5;
END $$;
```

**Step 3.2.2: Record Performance Metrics**
Document the following metrics:
- Average single lookup time
- Total time for 5 language lookups
- Any queries exceeding 10ms threshold

#### 3.3 Acceptance Criteria
- [ ] Single translation lookup completes in < 10ms
- [ ] 5-language batch lookup completes in < 50ms
- [ ] No sequential scans observed during benchmark
- [ ] Performance metrics documented

---

### Task 4: Document Index Coverage

**Story Points:** 0.5
**Priority:** P1 (High)
**Estimated Effort:** 20 minutes

#### 4.1 Objective
Create documentation confirming that Task 6.2 requirements are satisfied by Epic 1 indexes.

#### 4.2 Implementation Steps

**Step 4.2.1: Update Overview Document Status**
Add completion status to the overview document.

**File:** `docs/REQ-E03-027-create-translation-lookup-indexes-overview.md`

Add to Section 8 (Acceptance Criteria Mapping):

```markdown
## Verification Results

**Date Verified:** 2026-01-20
**Verified By:** [Implementation Agent]

### Index Existence Confirmed

| Table | Required Index | Existing Index | Status |
|-------|---------------|----------------|--------|
| item_translations | (item_id, language) | idx_item_trans_item_lang | VERIFIED |
| article_translations | (article_id, language) | idx_article_trans_article_lang | VERIFIED |
| link_translations | (link_id, language) | idx_link_trans_link_lang | VERIFIED |
| tag_translations | (tag_key, language) | idx_tag_trans_key_lang | VERIFIED |

### Query Plan Verification

| Query Pattern | Plan Type | Execution Time |
|--------------|-----------|----------------|
| Item translation lookup | Index Scan | < 1ms |
| Article translation lookup | Index Scan | < 1ms |
| Link translation lookup | Index Scan | < 1ms |
| Tag translation lookup | Index Scan | < 1ms |

### Conclusion

Task 6.2 (Create Translation Lookup Indexes) is **SATISFIED** by existing Epic 1 indexes.
No new migration required.
```

**Step 4.2.2: Create Completion Note (Optional)**
If an Epic 3 completion notes file exists, add entry:

```markdown
## Task 6.2 - Translation Lookup Indexes

**Status:** Complete (Pre-existing)
**Date:** 2026-01-20

The translation lookup indexes required by Task 6.2 were already implemented
in Epic 1 (l10n_foundation migration). Verification confirmed:

- All four translation tables have composite indexes on (entity_id, language)
- Query planner uses indexes for all lookup patterns
- Performance meets < 10ms requirement

No additional migration was needed. Original Epic 1 index names are:
- idx_item_trans_item_lang
- idx_article_trans_article_lang
- idx_link_trans_link_lang
- idx_tag_trans_key_lang
```

#### 4.3 Acceptance Criteria
- [ ] Overview document updated with verification results
- [ ] Index names and status documented
- [ ] Performance metrics recorded
- [ ] Completion status noted in Epic 3 tracking

---

### Task 5: Update Code Comments (If Applicable)

**Story Points:** 0.5
**Priority:** P2 (Medium)
**Estimated Effort:** 15 minutes

#### 5.1 Objective
Ensure any code referencing translation lookup indexes uses the correct existing index names.

#### 5.2 Implementation Steps

**Step 5.2.1: Search for Index References**
Search codebase for any hardcoded index name references:

```bash
# Search for any references to lookup index names
grep -r "idx_.*_translations_lookup" src/
grep -r "idx_item_translations_lookup" src/
grep -r "idx_article_translations_lookup" src/
grep -r "idx_link_translations_lookup" src/
```

**Step 5.2.2: Update References (If Found)**
If any code references the planned index names (idx_*_lookup), update to use existing names:

| Planned Name | Actual Name |
|--------------|-------------|
| idx_item_translations_lookup | idx_item_trans_item_lang |
| idx_article_translations_lookup | idx_article_trans_article_lang |
| idx_link_translations_lookup | idx_link_trans_link_lang |
| idx_tag_translations_tag_lang | idx_tag_trans_key_lang |

**Step 5.2.3: Verify No Breaking References**
Ensure no application code depends on specific index names (indexes are transparent to ORM/query layers).

#### 5.3 Acceptance Criteria
- [ ] Codebase searched for index name references
- [ ] Any outdated references updated
- [ ] No application code depends on index names

---

## 4. Alternative Path: Create New Indexes (Option B)

**Note:** This section is provided for completeness if naming consistency is required. **Not recommended.**

### Task A1: Create Migration File (If Option B Required)

**Story Points:** 1
**Priority:** P0

#### A1.1 Implementation Steps

**Step A1.1.1: Generate Migration File**
```bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
touch supabase/migrations/${TIMESTAMP}_create_translation_lookup_indexes.sql
```

**Step A1.1.2: Migration Content**
**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_translation_lookup_indexes.sql`

```sql
-- Migration: create_translation_lookup_indexes
-- Task: REQ-E03-027 / Plan-111 Task 6.2
-- Purpose: Fast lookup for displaying translated content
-- Note: Creates indexes with consistent naming (equivalent indexes may already exist from Epic 1)

-- ============================================================================
-- TRANSLATION LOOKUP INDEXES
-- These indexes optimize the primary query pattern: retrieving translations
-- by entity ID and language code for guest content display.
-- ============================================================================

-- Item translations lookup (item_id + language)
-- Supports: SELECT name, description FROM item_translations WHERE item_id = ? AND language = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);

-- Article translations lookup (article_id + language)
-- Supports: SELECT title, description FROM article_translations WHERE article_id = ? AND language = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);

-- Link translations lookup (link_id + language)
-- Supports: SELECT title FROM link_translations WHERE link_id = ? AND language = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);

-- Tag translations lookup (tag_key + language)
-- Supports: SELECT translated_value FROM tag_translations WHERE tag_key = ? AND language = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);

-- ============================================================================
-- INDEX DOCUMENTATION COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_item_translations_lookup IS
  'Fast lookup of item translations by item_id and language - Epic 3 Task 6.2';

COMMENT ON INDEX idx_article_translations_lookup IS
  'Fast lookup of article translations by article_id and language - Epic 3 Task 6.2';

COMMENT ON INDEX idx_link_translations_lookup IS
  'Fast lookup of link translations by link_id and language - Epic 3 Task 6.2';

COMMENT ON INDEX idx_tag_translations_tag_lang IS
  'Fast lookup of tag translations by tag_key and language - Epic 3 Task 6.2';
```

**Step A1.1.3: Create Rollback Script**
```sql
-- Rollback: drop_translation_lookup_indexes
-- Only run if rolling back Task 6.2

DROP INDEX CONCURRENTLY IF EXISTS idx_item_translations_lookup;
DROP INDEX CONCURRENTLY IF EXISTS idx_article_translations_lookup;
DROP INDEX CONCURRENTLY IF EXISTS idx_link_translations_lookup;
DROP INDEX CONCURRENTLY IF EXISTS idx_tag_translations_tag_lang;
```

---

## 5. Files and Functions Reference

### Database Objects (Verification Only)

| Object Type | Name | Table | Purpose |
|-------------|------|-------|---------|
| INDEX | `idx_item_trans_item_lang` | item_translations | Item translation lookup |
| INDEX | `idx_article_trans_article_lang` | article_translations | Article translation lookup |
| INDEX | `idx_link_trans_link_lang` | link_translations | Link translation lookup |
| INDEX | `idx_tag_trans_key_lang` | tag_translations | Tag translation lookup |
| UNIQUE | `item_translations_item_id_language_key` | item_translations | Uniqueness + lookup |
| UNIQUE | `article_translations_article_id_language_key` | article_translations | Uniqueness + lookup |
| UNIQUE | `link_translations_link_id_language_key` | link_translations | Uniqueness + lookup |
| UNIQUE | `tag_translations_tag_key_language_key` | tag_translations | Uniqueness + lookup |

### Documentation Files

| Operation | File | Purpose |
|-----------|------|---------|
| UPDATE | `docs/REQ-E03-027-create-translation-lookup-indexes-overview.md` | Add verification results |
| CREATE | `docs/REQ-E03-027-create-translation-lookup-indexes-detailed.md` | This document |

### No Application Code Changes Required

This task involves database indexes only. Indexes are transparent to the application layer - no TypeScript/JavaScript files need modification.

---

## 6. Testing Requirements

### 6.1 Index Existence Test
```sql
-- Verify all translation tables have lookup indexes
SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE tablename IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND indexdef LIKE '%(item_id%language%'
   OR indexdef LIKE '%(article_id%language%'
   OR indexdef LIKE '%(link_id%language%'
   OR indexdef LIKE '%(tag_key%language%'
GROUP BY tablename;

-- Expected: 4 tables, each with at least 1 matching index
```

### 6.2 Query Plan Test
```sql
-- Verify Index Scan usage (not Seq Scan)
EXPLAIN (FORMAT JSON)
SELECT name, description
FROM item_translations
WHERE item_id = '00000000-0000-0000-0000-000000000000'
  AND language = 'fr';

-- Parse JSON output and check "Node Type" = "Index Scan" or "Index Only Scan"
```

### 6.3 Performance Test
```sql
-- Query should complete in < 10ms
EXPLAIN ANALYZE
SELECT name, description, translation_status, translated_at
FROM item_translations
WHERE item_id = (SELECT id FROM items LIMIT 1)
  AND language = 'es';

-- Check "Execution Time" in output is < 10.000 ms
```

---

## 7. Acceptance Criteria Checklist

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Composite index exists on item_translations(item_id, language) | Verify | `idx_item_trans_item_lang` from Epic 1 |
| 2 | Composite index exists on article_translations(article_id, language) | Verify | `idx_article_trans_article_lang` from Epic 1 |
| 3 | Composite index exists on link_translations(link_id, language) | Verify | `idx_link_trans_link_lang` from Epic 1 |
| 4 | Composite index exists on tag_translations(tag_key, language) | Verify | `idx_tag_trans_key_lang` from Epic 1 |
| 5 | IF NOT EXISTS clause present (or N/A for existing) | N/A | Existing indexes |
| 6 | Query planner uses indexes for lookups | Verify | Run EXPLAIN ANALYZE |
| 7 | Queries complete in < 10ms | Verify | Performance benchmark |
| 8 | TypeScript types unchanged | N/A | Indexes transparent |
| 9 | Migration reversibility documented | N/A | Existing indexes from Epic 1 |

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Existing indexes don't cover all columns | Very Low | Medium | Verification query confirms coverage |
| Query planner doesn't use indexes | Low | Medium | EXPLAIN ANALYZE verification |
| Performance exceeds 10ms threshold | Very Low | Low | Benchmark testing confirms performance |
| Creating duplicate indexes (Option B) | Medium | Low | Recommend Option A (verification only) |

---

## 9. Dependencies

### Upstream Dependencies
| Dependency | Status | Blocking |
|------------|--------|----------|
| Epic 1 translation tables | Complete | No |
| l10n_foundation migration | Applied | No |
| Translation tables populated | Not required | No |

### Downstream Dependencies
| Feature | Dependency Type |
|---------|----------------|
| Guest content display (Epic 4) | Uses these indexes |
| Translation status APIs (REQ-E03-021) | Uses these indexes |
| Batch status endpoint (REQ-E03-024) | Uses these indexes |

---

## 10. Task Summary

| Task # | Title | Story Points | Priority | Status |
|--------|-------|--------------|----------|--------|
| 1 | Verify Existing Index Coverage | 0.5 | P0 | Pending |
| 2 | Run Query Plan Analysis | 0.5 | P0 | Pending |
| 3 | Performance Benchmark | 0.5 | P1 | Pending |
| 4 | Document Index Coverage | 0.5 | P1 | Pending |
| 5 | Update Code Comments | 0.5 | P2 | Pending |
| **Total** | | **2.5** | | |

### Recommended Implementation Order
1. Task 1: Verify Existing Index Coverage (P0)
2. Task 2: Run Query Plan Analysis (P0)
3. Task 3: Performance Benchmark (P1)
4. Task 4: Document Index Coverage (P1)
5. Task 5: Update Code Comments (P2)

---

## 11. Conclusion

**This task (6.2) is effectively complete** due to indexes created in Epic 1. The implementation work consists of:

1. **Verification** - Confirm existing indexes cover required query patterns (Tasks 1-2)
2. **Benchmarking** - Measure performance to confirm < 10ms requirement (Task 3)
3. **Documentation** - Record that Epic 1 indexes satisfy Task 6.2 (Tasks 4-5)

No new database migration is required. Creating duplicate indexes with different names would add overhead without benefit.

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 6.2: Create Translation Lookup Indexes*
*Last Modified: 2026-01-20 17:30:00 UTC*
