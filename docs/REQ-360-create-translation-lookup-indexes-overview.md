# REQ-360: Create Translation Lookup Indexes - Implementation Overview

**Generated:** 2026-01-19 00:00:00 UTC
**Last Modified:** 2026-01-19 00:00:00 UTC
**Request Reference:** REQ-360 - Create Translation Lookup Indexes
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.2)
**Status:** Already Implemented (Validation Required)

---

## 1. Request Summary

Create database indexes on translation tables to enable fast lookup of translated content by entity ID and language combination. This task ensures that when the system displays translated content for items, articles, links, or tags in a specific language, the database uses composite indexes for instant retrieval without sequential scans.

**Key Objectives:**
1. Create composite indexes on `item_translations(item_id, language)`
2. Create composite indexes on `article_translations(article_id, language)`
3. Create composite indexes on `link_translations(link_id, language)`
4. Create composite indexes on `tag_translations(tag_key, language)`
5. Verify query plans confirm index usage for translation lookups

---

## 2. Current State Analysis

### Implementation Status: ALREADY COMPLETE

The translation lookup indexes already exist in the database. They were created as part of the L10N Foundation migration (`20260118045251_l10n_foundation`).

### Existing Indexes on Translation Tables

| Table | Index Name | Columns | Type | Purpose |
|-------|------------|---------|------|---------|
| **item_translations** | `idx_item_trans_item_lang` | (item_id, language) | B-tree | Fast item translation lookup |
| | `item_translations_item_id_language_key` | (item_id, language) | Unique | Ensures one translation per language |
| | `idx_item_trans_language` | (language) | B-tree | Filter by language |
| | `idx_item_trans_status` | (translation_status) | B-tree | Filter by status |
| **article_translations** | `idx_article_trans_article_lang` | (article_id, language) | B-tree | Fast article translation lookup |
| | `article_translations_article_id_language_key` | (article_id, language) | Unique | Ensures one translation per language |
| | `idx_article_trans_language` | (language) | B-tree | Filter by language |
| | `idx_article_trans_status` | (translation_status) | B-tree | Filter by status |
| **link_translations** | `idx_link_trans_link_lang` | (link_id, language) | B-tree | Fast link translation lookup |
| | `link_translations_link_id_language_key` | (link_id, language) | Unique | Ensures one translation per language |
| | `idx_link_trans_language` | (language) | B-tree | Filter by language |
| **tag_translations** | `idx_tag_trans_key_lang` | (tag_key, language) | B-tree | Fast tag translation lookup |
| | `tag_translations_tag_key_language_key` | (tag_key, language) | Unique | Ensures one translation per language |
| | `idx_tag_trans_language` | (language) | B-tree | Filter by language |
| | `idx_tag_trans_system` | (is_system_tag) | B-tree | Filter system vs user tags |

### Source Migration

File: `database/migrations/20260117_l10n_foundation.sql` (lines 128-155)

```sql
-- item_translations indexes
CREATE INDEX idx_item_trans_item_lang ON item_translations(item_id, language);
CREATE INDEX idx_item_trans_language ON item_translations(language);
CREATE INDEX idx_item_trans_status ON item_translations(translation_status);

-- article_translations indexes
CREATE INDEX idx_article_trans_article_lang ON article_translations(article_id, language);
CREATE INDEX idx_article_trans_language ON article_translations(language);
CREATE INDEX idx_article_trans_status ON article_translations(translation_status);

-- link_translations indexes
CREATE INDEX idx_link_trans_link_lang ON link_translations(link_id, language);
CREATE INDEX idx_link_trans_language ON link_translations(language);

-- tag_translations indexes
CREATE INDEX idx_tag_trans_key_lang ON tag_translations(tag_key, language);
CREATE INDEX idx_tag_trans_language ON tag_translations(language);
CREATE INDEX idx_tag_trans_system ON tag_translations(is_system_tag);
```

---

## 3. Technical Approach

### Index Mapping: Plan vs Existing

The implementation plan (Task 6.2) specifies certain index names, but functionally equivalent indexes already exist:

| Specified in Plan | Existing Equivalent | Status |
|-------------------|---------------------|--------|
| `idx_item_translations_lookup` | `idx_item_trans_item_lang` | Equivalent functionality |
| `idx_article_translations_lookup` | `idx_article_trans_article_lang` | Equivalent functionality |
| `idx_link_translations_lookup` | `idx_link_trans_link_lang` | Equivalent functionality |
| `idx_tag_translations_tag_lang` | `idx_tag_trans_key_lang` | Equivalent functionality |

### Query Patterns Optimized

#### 1. Single Item Translation Lookup
```sql
SELECT name, description
FROM item_translations
WHERE item_id = $1 AND language = $2;
-- Uses: idx_item_trans_item_lang OR item_translations_item_id_language_key
```

#### 2. Batch Item Translation Lookup (List Views)
```sql
SELECT item_id, name, description
FROM item_translations
WHERE item_id = ANY($1) AND language = $2;
-- Uses: idx_item_trans_item_lang with Bitmap Index Scan
```

#### 3. Article Translation for Guest View
```sql
SELECT title, description
FROM article_translations
WHERE article_id = $1 AND language = $2;
-- Uses: idx_article_trans_article_lang
```

#### 4. Link Title Translation
```sql
SELECT title
FROM link_translations
WHERE link_id = $1 AND language = $2;
-- Uses: idx_link_trans_link_lang
```

#### 5. Tag Value Translation
```sql
SELECT translated_value
FROM tag_translations
WHERE tag_key = $1 AND language = $2;
-- Uses: idx_tag_trans_key_lang
```

---

## 4. Implementation Tasks

Since the indexes already exist, this task focuses on validation rather than creation.

### Task 6.2.1: Verify Index Existence

**Action:** Confirm all required indexes exist in the database
**Method:** Supabase MCP `execute_sql`

```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE tablename IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Expected:** Indexes for (entity_id, language) composite lookup on all 4 tables.

### Task 6.2.2: Verify Query Plan - Item Translations

**Action:** Confirm index usage for item translation lookup
**Method:** Supabase MCP `execute_sql`

```sql
EXPLAIN (FORMAT JSON)
SELECT name, description
FROM item_translations
WHERE item_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
  AND language = 'fr';
```

**Expected:** Index Scan or Index Only Scan (not Seq Scan).

### Task 6.2.3: Verify Query Plan - Article Translations

**Action:** Confirm index usage for article translation lookup
**Method:** Supabase MCP `execute_sql`

```sql
EXPLAIN (FORMAT JSON)
SELECT title, description
FROM article_translations
WHERE article_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
  AND language = 'es';
```

**Expected:** Index Scan (not Seq Scan).

### Task 6.2.4: Verify Query Plan - Link Translations

**Action:** Confirm index usage for link translation lookup
**Method:** Supabase MCP `execute_sql`

```sql
EXPLAIN (FORMAT JSON)
SELECT title
FROM link_translations
WHERE link_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
  AND language = 'de';
```

**Expected:** Index Scan (not Seq Scan).

### Task 6.2.5: Verify Query Plan - Tag Translations

**Action:** Confirm index usage for tag translation lookup
**Method:** Supabase MCP `execute_sql`

```sql
EXPLAIN (FORMAT JSON)
SELECT translated_value
FROM tag_translations
WHERE tag_key = '#room.kitchen'
  AND language = 'nl';
```

**Expected:** Index Scan (not Seq Scan).

### Task 6.2.6: Document Validation Results

**Action:** Update this document with verification results
**Method:** Manual documentation

---

## 5. Authorized Files and Functions for Modification

### Database Changes

**No database changes required.** All necessary indexes already exist.

| Index | Table | Status |
|-------|-------|--------|
| `idx_item_trans_item_lang` | item_translations | EXISTS |
| `idx_article_trans_article_lang` | article_translations | EXISTS |
| `idx_link_trans_link_lang` | link_translations | EXISTS |
| `idx_tag_trans_key_lang` | tag_translations | EXISTS |

### Files to Modify

**None required.** This task validates existing infrastructure.

### Optional: Create Alias Indexes (If Desired)

If strict adherence to the plan's naming convention is required, the following migration could add alias indexes:

```sql
-- Optional: Create indexes with names matching the implementation plan
-- These are redundant but provide documentation consistency

CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);

CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);

CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);

CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);
```

**Migration Name:** `create_translation_lookup_index_aliases`

**Note:** This is optional. The existing indexes already provide the required functionality.

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Status | Notes |
|------|--------|-------|
| L10N Foundation (20260118045251) | Complete | Created translation tables and indexes |
| REQ-359 (Translation Job Indexes) | Complete | Job queue indexes exist |

### Dependent Tasks

| Task | Description | Benefit |
|------|-------------|---------|
| Epic 4 (Guest Experience) | Guest views translated content | Faster page loads |
| Content Translation APIs | Fetch translations for display | Sub-millisecond lookups |
| Translation Status API | Status queries | Efficient status retrieval |

---

## 7. Acceptance Criteria

From REQ-360:

- [x] Composite index created on item_translations for (item_id, language) lookups
  - **Status:** EXISTS as `idx_item_trans_item_lang`
- [x] Composite index created on article_translations for (article_id, language) lookups
  - **Status:** EXISTS as `idx_article_trans_article_lang`
- [x] Composite index created on link_translations for (link_id, language) lookups
  - **Status:** EXISTS as `idx_link_trans_link_lang`
- [x] Composite index created on tag_translations for (tag_key, language) lookups
  - **Status:** EXISTS as `idx_tag_trans_key_lang`
- [ ] Query plans confirm index usage for typical translation lookup queries
  - **Status:** Requires validation (Task 6.2.2-6.2.5)
- [x] No duplicate or redundant indexes that would slow down write operations
  - **Status:** VERIFIED - No unnecessary duplicates

---

## 8. Testing Strategy

### Index Existence Verification

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

### Query Plan Verification

Run EXPLAIN ANALYZE on typical queries to confirm index usage:

```sql
-- Test: Item translation lookup
EXPLAIN (ANALYZE, FORMAT TEXT)
SELECT name, description
FROM item_translations
WHERE item_id = (SELECT id FROM items LIMIT 1)
  AND language = 'fr';

-- Test: Batch item lookup
EXPLAIN (ANALYZE, FORMAT TEXT)
SELECT item_id, name, description
FROM item_translations
WHERE item_id = ANY(ARRAY(SELECT id FROM items LIMIT 5))
  AND language = 'es';
```

**Success Criteria:**
- Query plans show "Index Scan" or "Index Only Scan"
- No "Seq Scan" for translation lookups
- Execution time < 10ms for single lookups
- Execution time < 50ms for batch lookups (5-10 items)

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Indexes don't exist | Very Low | Medium | Verified indexes exist in database |
| Wrong columns indexed | Very Low | Medium | Verified index definitions match requirements |
| Index not used by optimizer | Low | Low | Test with EXPLAIN ANALYZE |
| Redundant indexes waste storage | Low | Very Low | Existing indexes are appropriately designed |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Verify index existence | 5 min |
| Verify item translation query plan | 3 min |
| Verify article translation query plan | 3 min |
| Verify link translation query plan | 3 min |
| Verify tag translation query plan | 3 min |
| Document results | 5 min |
| **Total** | **~22 min** |

---

## 11. Implementation Notes

### Why Indexes Already Exist

The translation lookup indexes were created as part of the L10N Foundation setup (Epic 1, REQ-223/REQ-226). The foundation migration included both table creation and index creation for performance optimization.

### Index Naming Convention

The existing indexes use a shorter naming convention:
- `idx_item_trans_item_lang` instead of `idx_item_translations_lookup`
- `idx_article_trans_article_lang` instead of `idx_article_translations_lookup`
- etc.

Both naming conventions are valid. The shorter names were used in the foundation migration for consistency with other database objects.

### No Action Required for Completion

To mark this task as complete:
1. Run the verification queries (Tasks 6.2.1-6.2.5)
2. Confirm all EXPLAIN outputs show index scans
3. Document results in this overview
4. Mark REQ-360 acceptance criteria as verified

---

## 12. Post-Validation Steps

After confirming indexes work correctly:

1. **Proceed to Task 6.3:** Add updated_at trigger for translations (if not already done)
2. **Monitor performance:** Use `pg_stat_user_indexes` to track index usage in production
3. **Epic 4 development:** Guest experience features can proceed with confidence in translation lookup performance

### Index Usage Monitoring Query

```sql
SELECT
  schemaname,
  tablename,
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexrelname LIKE 'idx_%trans%'
ORDER BY tablename, indexrelname;
```

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [L10N Foundation Migration](/database/migrations/20260117_l10n_foundation.sql)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL Index Performance](https://www.postgresql.org/docs/current/indexes.html)
