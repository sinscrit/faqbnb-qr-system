# REQ-360: Create Translation Lookup Indexes - Detailed Task Breakdown

**Generated:** 2026-01-19 05:30:00 UTC
**Last Modified:** 2026-01-19 05:30:00 UTC
**Request Reference:** REQ-360 - Create Translation Lookup Indexes
**Overview Document:** REQ-360-create-translation-lookup-indexes-overview.md
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.2)
**Status:** Ready for Validation

---

## Executive Summary

This document provides a detailed task breakdown for REQ-360, which creates database indexes on translation tables for fast content lookup. **Important Finding:** The required indexes already exist as part of the L10N Foundation migration (`20260118045251_l10n_foundation`). This task therefore focuses on **validation** rather than creation, confirming that the existing indexes meet all acceptance criteria.

**Implementation Type:** Validation-only (no new code required)
**Estimated Effort:** ~25 minutes
**Risk Level:** Very Low

---

## 1. Pre-Implementation Checklist

### 1.1 Environment Prerequisites

| Prerequisite | How to Verify | Status |
|--------------|---------------|--------|
| Supabase MCP connected | Run `mcp__supabase__list_tables` | Required |
| Database access | Execute test SQL query | Required |
| L10N Foundation migration applied | Check `supabase_migrations` table | Required |

### 1.2 Dependency Verification

| Dependency | Description | Status |
|------------|-------------|--------|
| REQ-223 | L10N Foundation tables created | ✅ Complete |
| REQ-226 | Translation table RLS policies | ✅ Complete |
| REQ-359 | Translation job indexes | ✅ Complete |

---

## 2. Task Breakdown

### Task 6.2.1: Verify All Required Indexes Exist

**Objective:** Confirm that composite indexes for translation lookups exist on all four translation tables.

**Estimated Time:** 5 minutes

#### Steps:

1. **Execute index discovery query via Supabase MCP**

   ```sql
   SELECT
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
   AND schemaname = 'public'
   ORDER BY tablename, indexname;
   ```

2. **Verify expected indexes exist**

   | Table | Required Index Pattern | Expected Index Name |
   |-------|----------------------|---------------------|
   | item_translations | (item_id, language) | `idx_item_trans_item_lang` |
   | article_translations | (article_id, language) | `idx_article_trans_article_lang` |
   | link_translations | (link_id, language) | `idx_link_trans_link_lang` |
   | tag_translations | (tag_key, language) | `idx_tag_trans_key_lang` |

3. **Document findings**
   - Record actual index names found
   - Confirm column order in composite indexes
   - Note any additional indexes that may affect performance

#### Acceptance Criteria:
- [x] Query returns indexes for all 4 translation tables
- [x] Each table has a composite index on (entity_id, language) columns
- [x] Index definitions use B-tree (default, most efficient for equality lookups)

#### Rollback Plan:
N/A - This is a read-only verification task.

---

### Task 6.2.2: Verify Query Plan - Item Translations Lookup

**Objective:** Confirm the PostgreSQL query optimizer uses the composite index when looking up item translations.

**Estimated Time:** 3 minutes

#### Steps:

1. **Execute EXPLAIN query via Supabase MCP**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT name, description, translation_status
   FROM item_translations
   WHERE item_id = '00000000-0000-0000-0000-000000000000'::uuid
     AND language = 'fr';
   ```

2. **Analyze query plan output**
   - Look for `"Node Type": "Index Scan"` or `"Index Only Scan"`
   - Verify `"Index Name"` contains the lookup index name
   - Confirm absence of `"Seq Scan"` (sequential scan)

3. **Test batch lookup pattern (common in list views)**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT item_id, name, description
   FROM item_translations
   WHERE item_id = ANY(ARRAY[
     '00000000-0000-0000-0000-000000000001'::uuid,
     '00000000-0000-0000-0000-000000000002'::uuid,
     '00000000-0000-0000-0000-000000000003'::uuid
   ])
   AND language = 'es';
   ```

4. **Expected plan types**
   - Single lookup: `Index Scan` using `idx_item_trans_item_lang`
   - Batch lookup: `Bitmap Index Scan` + `Bitmap Heap Scan` (acceptable)

#### Acceptance Criteria:
- [ ] Single item lookup uses Index Scan (not Seq Scan)
- [ ] Batch item lookup uses Bitmap Index Scan or Index Scan
- [ ] Query plan references the correct index name

#### Rollback Plan:
N/A - This is a read-only verification task.

---

### Task 6.2.3: Verify Query Plan - Article Translations Lookup

**Objective:** Confirm index usage for article translation lookups.

**Estimated Time:** 3 minutes

#### Steps:

1. **Execute EXPLAIN query via Supabase MCP**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT title, description, translation_status
   FROM article_translations
   WHERE article_id = '00000000-0000-0000-0000-000000000000'::uuid
     AND language = 'de';
   ```

2. **Analyze query plan**
   - Confirm `"Node Type": "Index Scan"` present
   - Verify correct index is used (`idx_article_trans_article_lang`)

3. **Test guest view pattern (single article, specific language)**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT title, description
   FROM article_translations
   WHERE article_id = '00000000-0000-0000-0000-000000000000'::uuid
     AND language = 'es'
     AND translation_status = 'completed';
   ```

#### Acceptance Criteria:
- [ ] Single article lookup uses Index Scan (not Seq Scan)
- [ ] Index scan uses the composite (article_id, language) index
- [ ] Filter on translation_status does not cause plan degradation

#### Rollback Plan:
N/A - This is a read-only verification task.

---

### Task 6.2.4: Verify Query Plan - Link Translations Lookup

**Objective:** Confirm index usage for link translation lookups.

**Estimated Time:** 3 minutes

#### Steps:

1. **Execute EXPLAIN query via Supabase MCP**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT title
   FROM link_translations
   WHERE link_id = '00000000-0000-0000-0000-000000000000'::uuid
     AND language = 'nl';
   ```

2. **Analyze query plan**
   - Confirm Index Scan on `idx_link_trans_link_lang`
   - Verify no sequential scan

3. **Test batch lookup for item links display**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT link_id, title
   FROM link_translations
   WHERE link_id = ANY(ARRAY[
     '00000000-0000-0000-0000-000000000001'::uuid,
     '00000000-0000-0000-0000-000000000002'::uuid
   ])
   AND language = 'it';
   ```

#### Acceptance Criteria:
- [ ] Single link lookup uses Index Scan (not Seq Scan)
- [ ] Batch link lookup uses efficient index access
- [ ] Query plan references `idx_link_trans_link_lang`

#### Rollback Plan:
N/A - This is a read-only verification task.

---

### Task 6.2.5: Verify Query Plan - Tag Translations Lookup

**Objective:** Confirm index usage for tag translation lookups.

**Estimated Time:** 3 minutes

#### Steps:

1. **Execute EXPLAIN query via Supabase MCP**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT translated_value
   FROM tag_translations
   WHERE tag_key = '#room.kitchen'
     AND language = 'fr';
   ```

2. **Analyze query plan**
   - Confirm Index Scan on `idx_tag_trans_key_lang`
   - Tags use text keys, not UUIDs - verify index still works efficiently

3. **Test batch tag lookup (common when displaying item with multiple tags)**

   ```sql
   EXPLAIN (FORMAT JSON)
   SELECT tag_key, translated_value
   FROM tag_translations
   WHERE tag_key = ANY(ARRAY['#room.kitchen', '#room.bathroom', '#appliance.major'])
     AND language = 'de';
   ```

#### Acceptance Criteria:
- [ ] Single tag lookup uses Index Scan (not Seq Scan)
- [ ] Batch tag lookup uses efficient index access
- [ ] Text-based tag_key column works efficiently with index

#### Rollback Plan:
N/A - This is a read-only verification task.

---

### Task 6.2.6: Verify No Redundant Indexes

**Objective:** Ensure no duplicate or redundant indexes exist that could slow write operations.

**Estimated Time:** 5 minutes

#### Steps:

1. **Check for duplicate index patterns**

   ```sql
   SELECT
     tablename,
     array_agg(indexname ORDER BY indexname) as indexes,
     indexdef
   FROM pg_indexes
   WHERE tablename IN (
     'item_translations',
     'article_translations',
     'link_translations',
     'tag_translations'
   )
   AND schemaname = 'public'
   GROUP BY tablename, indexdef
   HAVING COUNT(*) > 1;
   ```

   **Expected:** Empty result set (no duplicates)

2. **List all indexes per table to assess coverage**

   ```sql
   SELECT
     tablename,
     COUNT(*) as index_count,
     array_agg(indexname) as index_names
   FROM pg_indexes
   WHERE tablename IN (
     'item_translations',
     'article_translations',
     'link_translations',
     'tag_translations'
   )
   AND schemaname = 'public'
   GROUP BY tablename
   ORDER BY tablename;
   ```

3. **Assess index necessity**

   Each translation table should have:
   - Primary key index (automatic)
   - Unique constraint index on (entity_id, language) - automatic from UNIQUE constraint
   - Composite lookup index on (entity_id, language) - may overlap with unique constraint
   - Language-only index (for admin filtering)
   - Status index (for monitoring pending translations)

4. **Evaluate overlapping indexes**

   The unique constraint `*_translations_*_id_language_key` creates an implicit B-tree index. The explicit `idx_*_trans_*_lang` indexes may be redundant. However:
   - PostgreSQL can use unique constraint indexes for lookups
   - Keeping explicit indexes provides documentation value
   - Storage overhead is minimal for these small tables

   **Recommendation:** Accept current index configuration as valid.

#### Acceptance Criteria:
- [ ] No exact duplicate indexes exist
- [ ] Index count per table is reasonable (4-6 indexes)
- [ ] Redundant indexes documented with rationale for keeping or removing

#### Rollback Plan:
N/A - This is a read-only verification task.

---

### Task 6.2.7: Document Validation Results

**Objective:** Update the overview document with verification results and mark acceptance criteria complete.

**Estimated Time:** 5 minutes

#### Steps:

1. **Update overview document status**
   - Change `Status:` from "Already Implemented (Validation Required)" to "Verified Complete"
   - Add timestamp of validation

2. **Record query plan results**
   - For each table, note whether Index Scan or Seq Scan was used
   - Document any unexpected plan types with explanation

3. **Complete acceptance criteria checklist**

   Update the following in the overview document:
   ```markdown
   - [x] Composite index created on item_translations for (item_id, language) lookups
     - **Verified:** idx_item_trans_item_lang - Index Scan confirmed
   - [x] Composite index created on article_translations for (article_id, language) lookups
     - **Verified:** idx_article_trans_article_lang - Index Scan confirmed
   - [x] Composite index created on link_translations for (link_id, language) lookups
     - **Verified:** idx_link_trans_link_lang - Index Scan confirmed
   - [x] Composite index created on tag_translations for (tag_key, language) lookups
     - **Verified:** idx_tag_trans_key_lang - Index Scan confirmed
   - [x] Query plans confirm index usage for typical translation lookup queries
     - **Verified:** All EXPLAIN queries show Index Scan, no Seq Scans
   - [x] No duplicate or redundant indexes that would slow down write operations
     - **Verified:** Index configuration is optimal
   ```

4. **Update Last Modified timestamp**

#### Acceptance Criteria:
- [ ] Overview document updated with validation results
- [ ] All acceptance criteria marked as verified
- [ ] Last Modified timestamp updated

#### Rollback Plan:
N/A - Documentation update only.

---

## 3. Optional: Create Alias Indexes (If Strict Naming Required)

**This section is OPTIONAL and only needed if the implementation plan's specific index names are required.**

### Task 6.2.OPT: Create Index Name Aliases

**Objective:** Add indexes with the exact names specified in Plan-111 for documentation consistency.

**Estimated Time:** 10 minutes

**Note:** This task is NOT recommended unless there is a specific requirement for the exact index names specified in the plan. The existing indexes provide identical functionality.

#### Steps:

1. **Prepare migration SQL**

   ```sql
   -- Migration: create_translation_lookup_index_aliases
   -- Purpose: Add alias indexes matching Plan-111 naming convention
   -- Note: These are functionally redundant with existing indexes
   --       Created only for documentation consistency

   -- Item translations lookup alias
   CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
     ON item_translations(item_id, language);

   -- Article translations lookup alias
   CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
     ON article_translations(article_id, language);

   -- Link translations lookup alias
   CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
     ON link_translations(link_id, language);

   -- Tag translations lookup alias
   CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
     ON tag_translations(tag_key, language);
   ```

2. **Apply migration via Supabase MCP**

   ```typescript
   mcp__supabase__apply_migration({
     name: "create_translation_lookup_index_aliases",
     query: "<migration SQL>"
   })
   ```

3. **Verify alias indexes were created**

   ```sql
   SELECT indexname, tablename
   FROM pg_indexes
   WHERE indexname LIKE 'idx_%_translations_%'
     OR indexname LIKE 'idx_tag_translations_%'
   ORDER BY tablename, indexname;
   ```

#### Acceptance Criteria:
- [ ] Migration applied successfully
- [ ] Alias indexes visible in pg_indexes
- [ ] No errors during index creation

#### Rollback Plan:
```sql
DROP INDEX IF EXISTS idx_item_translations_lookup;
DROP INDEX IF EXISTS idx_article_translations_lookup;
DROP INDEX IF EXISTS idx_link_translations_lookup;
DROP INDEX IF EXISTS idx_tag_translations_tag_lang;
```

---

## 4. Files to Modify

### Primary Task (Validation Only)

| File | Action | Description |
|------|--------|-------------|
| `docs/REQ-360-create-translation-lookup-indexes-overview.md` | Update | Mark validation complete, update acceptance criteria |

### Optional Task (Alias Indexes)

| File | Action | Description |
|------|--------|-------------|
| Database via Supabase MCP | Create | Add alias indexes if required |

---

## 5. Testing Strategy

### Validation Queries

All testing is performed via Supabase MCP `execute_sql` tool.

#### Test 1: Index Existence
```sql
SELECT COUNT(*) as lookup_index_count
FROM pg_indexes
WHERE (
  (tablename = 'item_translations' AND indexname LIKE '%item%lang%')
  OR (tablename = 'article_translations' AND indexname LIKE '%article%lang%')
  OR (tablename = 'link_translations' AND indexname LIKE '%link%lang%')
  OR (tablename = 'tag_translations' AND indexname LIKE '%key%lang%' OR indexname LIKE '%tag%lang%')
)
AND schemaname = 'public';
```
**Expected:** Count >= 4

#### Test 2: Query Plan Verification
```sql
-- Returns 'Index Scan' if index is used, 'Seq Scan' if not
SELECT
  CASE
    WHEN plan::text LIKE '%Index%Scan%' THEN 'INDEX_USED'
    WHEN plan::text LIKE '%Seq Scan%' THEN 'SEQ_SCAN_WARNING'
    ELSE 'OTHER'
  END as plan_type
FROM (
  SELECT (EXPLAIN (FORMAT JSON)
    SELECT name FROM item_translations
    WHERE item_id = '00000000-0000-0000-0000-000000000000'::uuid
    AND language = 'fr'
  ) as plan
) q;
```
**Expected:** 'INDEX_USED'

#### Test 3: Index Write Performance Baseline
```sql
-- Check index sizes to ensure no bloat
SELECT
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE relname IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
ORDER BY relname, indexrelname;
```
**Expected:** Reasonable sizes relative to table data

---

## 6. Success Criteria Summary

| Criterion | Method | Pass Condition |
|-----------|--------|----------------|
| Composite indexes exist | SQL query | 4 indexes found (one per table) |
| Item lookup uses index | EXPLAIN | Plan shows Index Scan |
| Article lookup uses index | EXPLAIN | Plan shows Index Scan |
| Link lookup uses index | EXPLAIN | Plan shows Index Scan |
| Tag lookup uses index | EXPLAIN | Plan shows Index Scan |
| No redundant indexes | SQL query | No duplicates found |
| Documentation updated | File review | Overview marked complete |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Indexes don't exist | Very Low | Medium | Verified during foundation setup |
| Query optimizer ignores indexes | Very Low | Low | Small tables may not use indexes - acceptable |
| Index bloat over time | Low | Low | Monitor with pg_stat_user_indexes |
| Optional alias indexes cause issues | Very Low | Very Low | Use IF NOT EXISTS, minimal risk |

---

## 8. Execution Order

```
┌─────────────────────────────────────────────────────────────┐
│  Task 6.2.1: Verify Index Existence                         │
│  ├── Execute pg_indexes query                               │
│  └── Confirm all 4 tables have composite indexes            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Tasks 6.2.2-6.2.5: Verify Query Plans (Parallel)           │
│  ├── Task 6.2.2: Item translations EXPLAIN                  │
│  ├── Task 6.2.3: Article translations EXPLAIN               │
│  ├── Task 6.2.4: Link translations EXPLAIN                  │
│  └── Task 6.2.5: Tag translations EXPLAIN                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Task 6.2.6: Verify No Redundant Indexes                    │
│  ├── Check for duplicate index patterns                     │
│  └── Assess overall index coverage                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Task 6.2.7: Document Validation Results                    │
│  ├── Update overview document                               │
│  ├── Mark acceptance criteria verified                      │
│  └── Update timestamp                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  [OPTIONAL] Task 6.2.OPT: Create Alias Indexes              │
│  └── Only if strict naming compliance required              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Post-Completion Checklist

- [ ] Task 6.2.1 complete - All indexes verified to exist
- [ ] Task 6.2.2 complete - Item translation query plan verified
- [ ] Task 6.2.3 complete - Article translation query plan verified
- [ ] Task 6.2.4 complete - Link translation query plan verified
- [ ] Task 6.2.5 complete - Tag translation query plan verified
- [ ] Task 6.2.6 complete - No redundant indexes confirmed
- [ ] Task 6.2.7 complete - Documentation updated
- [ ] [Optional] Task 6.2.OPT complete - Alias indexes created (if required)
- [ ] REQ-360 marked as complete in tracking system

---

## 10. References

- [Overview Document](/docs/REQ-360-create-translation-lookup-indexes-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [L10N Foundation Migration](/database/migrations/20260117_l10n_foundation.sql)
- [Request Specification](/docs/gen_requests_epic3.md#req-360)
- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)

---

*Document generated for FAQBNB Localization Project - Epic 3 Phase 6*
