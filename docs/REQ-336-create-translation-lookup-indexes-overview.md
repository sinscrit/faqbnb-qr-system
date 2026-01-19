# REQ-336: Create Translation Content Lookup Indexes - Implementation Overview

**Generated:** 2026-01-18 18:55:00 UTC
**Last Modified:** 2026-01-18 18:55:00 UTC
**Request Reference:** REQ-336 - Create Translation Content Lookup Indexes
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.2)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create specialized database indexes on translation content tables (`item_translations`, `article_translations`, `link_translations`, `tag_translations`) to enable fast lookup of translated content when displaying property listings and articles to international guests.

**Key Objectives:**
1. Create composite indexes optimized for the primary content retrieval pattern: looking up a specific translation by entity identifier and language code
2. Ensure consistent naming convention across all translation lookup indexes
3. Maintain idempotent migrations that can be safely re-executed

---

## 2. Current State Analysis

### Existing Translation Tables

| Table | Primary Key | FK Column | Purpose |
|-------|-------------|-----------|---------|
| `item_translations` | id (uuid) | item_id | Translated item name and description |
| `article_translations` | id (uuid) | article_id | Translated article title and description |
| `link_translations` | id (uuid) | link_id | Translated link title |
| `tag_translations` | id (uuid) | tag_key | Translated tag value |

### Existing Indexes on Translation Tables

| Table | Index Name | Columns | Type |
|-------|------------|---------|------|
| **item_translations** | `item_translations_pkey` | (id) | Primary Key |
| | `item_translations_item_id_language_key` | (item_id, language) | Unique |
| | `idx_item_trans_item_lang` | (item_id, language) | B-tree |
| | `idx_item_trans_language` | (language) | B-tree |
| | `idx_item_trans_status` | (translation_status) | B-tree |
| **article_translations** | `article_translations_pkey` | (id) | Primary Key |
| | `article_translations_article_id_language_key` | (article_id, language) | Unique |
| | `idx_article_trans_article_lang` | (article_id, language) | B-tree |
| | `idx_article_trans_language` | (language) | B-tree |
| | `idx_article_trans_status` | (translation_status) | B-tree |
| **link_translations** | `link_translations_pkey` | (id) | Primary Key |
| | `link_translations_link_id_language_key` | (link_id, language) | Unique |
| | `idx_link_trans_link_lang` | (link_id, language) | B-tree |
| | `idx_link_trans_language` | (language) | B-tree |
| **tag_translations** | `tag_translations_pkey` | (id) | Primary Key |
| | `tag_translations_tag_key_language_key` | (tag_key, language) | Unique |
| | `idx_tag_trans_key_lang` | (tag_key, language) | B-tree |
| | `idx_tag_trans_language` | (language) | B-tree |
| | `idx_tag_trans_system` | (is_system_tag) | B-tree |

### Analysis of Current State

The existing indexes (`idx_item_trans_item_lang`, `idx_article_trans_article_lang`, `idx_link_trans_link_lang`, `idx_tag_trans_key_lang`) already provide the composite index functionality needed for fast lookups. However, the implementation plan specifies creating new indexes with a standardized naming convention (`idx_*_translations_lookup`) for:

1. **Consistency**: Uniform naming pattern across all translation tables
2. **Clarity**: The `_lookup` suffix clearly indicates the index's purpose for content retrieval
3. **Documentation**: Aligns with the architecture documentation in the implementation plan

The new indexes will coexist with existing ones (no harm from redundant indexes, PostgreSQL optimizer will choose the best one).

---

## 3. Technical Approach

### Index Specification from Architecture Plan

From Plan-111-L10N-Epic3-Dynamic-Content-Translation.md, Phase 6, Task 6.2:

```sql
-- Fast lookup for displaying translated content:
CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);
CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);
CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);
```

### Query Patterns These Indexes Optimize

#### 1. Single Item Translation Lookup
```sql
SELECT name, description
FROM item_translations
WHERE item_id = $1 AND language = $2;
```

#### 2. Batch Item Translation Lookup (for list views)
```sql
SELECT item_id, name, description
FROM item_translations
WHERE item_id = ANY($1) AND language = $2;
```

#### 3. Article Translation for Guest View
```sql
SELECT title, description
FROM article_translations
WHERE article_id = $1 AND language = $2;
```

#### 4. Link Title Translation
```sql
SELECT title
FROM link_translations
WHERE link_id = $1 AND language = $2;
```

#### 5. Tag Value Translation
```sql
SELECT translated_value
FROM tag_translations
WHERE tag_key = $1 AND language = $2;
```

### Why Create New Indexes?

While functionally equivalent indexes already exist, this task creates the indexes with the standardized names specified in the architecture plan:

| Specified Name | Equivalent Existing Index |
|----------------|---------------------------|
| `idx_item_translations_lookup` | `idx_item_trans_item_lang` |
| `idx_article_translations_lookup` | `idx_article_trans_article_lang` |
| `idx_link_translations_lookup` | `idx_link_trans_link_lang` |
| `idx_tag_translations_tag_lang` | `idx_tag_trans_key_lang` |

**Benefits of creating the specified indexes:**
1. Documentation references the `_lookup` naming convention
2. Future code can rely on the documented index names
3. `IF NOT EXISTS` makes migration safe and idempotent
4. Query optimizer handles duplicate indexes efficiently

---

## 4. Implementation Tasks

### Task 6.2.1: Create item_translations lookup index

**Action:** Apply database migration to create index
**Method:** Supabase MCP `apply_migration`

```sql
-- Fast lookup for translated item content by item_id and language
-- Used when displaying items to guests in their preferred language
CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);
```

**Migration Name:** `create_item_translations_lookup_index`

### Task 6.2.2: Create article_translations lookup index

**Action:** Apply database migration to create index
**Method:** Supabase MCP `apply_migration`

```sql
-- Fast lookup for translated article content by article_id and language
-- Used when displaying instructions to guests in their preferred language
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);
```

**Migration Name:** `create_article_translations_lookup_index`

### Task 6.2.3: Create link_translations lookup index

**Action:** Apply database migration to create index
**Method:** Supabase MCP `apply_migration`

```sql
-- Fast lookup for translated link titles by link_id and language
-- Used when displaying resource links to guests in their preferred language
CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);
```

**Migration Name:** `create_link_translations_lookup_index`

### Task 6.2.4: Create tag_translations lookup index

**Action:** Apply database migration to create index
**Method:** Supabase MCP `apply_migration`

```sql
-- Fast lookup for translated tag values by tag_key and language
-- Used when displaying item tags to guests in their preferred language
CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);
```

**Migration Name:** `create_tag_translations_tag_lang_index`

### Task 6.2.5: Verify indexes are applied

**Action:** Query pg_indexes to verify all new indexes exist
**Method:** Supabase MCP `execute_sql`

```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE indexname IN (
  'idx_item_translations_lookup',
  'idx_article_translations_lookup',
  'idx_link_translations_lookup',
  'idx_tag_translations_tag_lang'
)
ORDER BY tablename;
```

Expected output: 4 rows, one for each new index.

---

## 5. Authorized Files and Functions for Modification

### Database Changes (via Supabase MCP)

| Change Type | Object | Table | Description |
|-------------|--------|-------|-------------|
| CREATE INDEX | `idx_item_translations_lookup` | item_translations | Composite index (item_id, language) |
| CREATE INDEX | `idx_article_translations_lookup` | article_translations | Composite index (article_id, language) |
| CREATE INDEX | `idx_link_translations_lookup` | link_translations | Composite index (link_id, language) |
| CREATE INDEX | `idx_tag_translations_tag_lang` | tag_translations | Composite index (tag_key, language) |

### Files to Modify

**None required.** This task only creates database indexes. No application code changes are needed because:
- The indexes automatically optimize existing queries
- PostgreSQL's query optimizer uses indexes transparently
- No TypeScript type changes required (indexes don't affect types)

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/lib/supabase.ts` | No type changes needed for index creation |
| `/src/lib/content-translation/*.ts` | Queries automatically benefit from indexes |
| `/src/app/api/**/*.ts` | API routes automatically benefit from indexes |
| Other translation-related files | Index creation is transparent to application code |

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Status | Dependency Type |
|------|--------|-----------------|
| REQ-223 (L10N Foundation migration) | Complete | Translation tables must exist |
| REQ-335 (Translation job indexes) | Should be complete first | Consistent with Phase 6 ordering |

### Dependent Tasks (Benefits after completion)

| Task | Description | Benefit |
|------|-------------|---------|
| Epic 4 (Guest Experience) | Guest views of translated content | Faster page loads for international guests |
| REQ-328 (Translation Status API) | Status queries with translated content | Faster status lookups |
| REQ-331 (Batch Status Endpoint) | Batch translation retrieval | Efficient batch lookups for list views |

---

## 7. Acceptance Criteria

From REQ-336:

- [ ] An index named `idx_item_translations_lookup` is created on the item_translations table
- [ ] The item translations index includes columns: item_id, language
- [ ] An index named `idx_article_translations_lookup` is created on the article_translations table
- [ ] The article translations index includes columns: article_id, language
- [ ] An index named `idx_link_translations_lookup` is created on the link_translations table
- [ ] The link translations index includes columns: link_id, language
- [ ] An index named `idx_tag_translations_tag_lang` is created on the tag_translations table
- [ ] The tag translations index includes columns: tag_key, language
- [ ] All indexes are created using IF NOT EXISTS to allow safe re-execution of the migration
- [ ] The indexes are created through a Supabase migration with an appropriate descriptive migration name
- [ ] The migration is applied using the Supabase MCP tool apply_migration function
- [ ] Database query plans for translation content lookups show index usage rather than sequential scans
- [ ] The migration name follows the snake_case convention (e.g., create_translation_lookup_indexes)
- [ ] The migration SQL is idempotent and can be safely run multiple times

---

## 8. Testing Strategy

### Index Existence Verification

```sql
-- Verify all lookup indexes exist
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE indexname IN (
  'idx_item_translations_lookup',
  'idx_article_translations_lookup',
  'idx_link_translations_lookup',
  'idx_tag_translations_tag_lang'
)
ORDER BY tablename;
```

Expected: 4 rows with correct column definitions.

### Query Plan Verification

#### Test 1: Item Translation Lookup
```sql
EXPLAIN ANALYZE
SELECT name, description
FROM item_translations
WHERE item_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND language = 'fr';
```

Expected: Index Scan using `idx_item_translations_lookup` (or equivalent existing index).

#### Test 2: Article Translation Lookup
```sql
EXPLAIN ANALYZE
SELECT title, description
FROM article_translations
WHERE article_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND language = 'es';
```

Expected: Index Scan using `idx_article_translations_lookup` (or equivalent existing index).

#### Test 3: Link Translation Lookup
```sql
EXPLAIN ANALYZE
SELECT title
FROM link_translations
WHERE link_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND language = 'de';
```

Expected: Index Scan using `idx_link_translations_lookup` (or equivalent existing index).

#### Test 4: Tag Translation Lookup
```sql
EXPLAIN ANALYZE
SELECT translated_value
FROM tag_translations
WHERE tag_key = '#room.kitchen'
  AND language = 'nl';
```

Expected: Index Scan using `idx_tag_translations_tag_lang` (or equivalent existing index).

#### Test 5: Batch Lookup Performance
```sql
EXPLAIN ANALYZE
SELECT item_id, name, description
FROM item_translations
WHERE item_id = ANY(ARRAY[
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
])
AND language = 'fr';
```

Expected: Index Scan or Bitmap Index Scan, not Sequential Scan.

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Index creation locks table briefly | Very Low | Very Low | Small tables, quick operation |
| Duplicate indexes increase storage | Low | Very Low | Minimal overhead; optimizer chooses best |
| Index not used by optimizer | Very Low | Low | Equivalent indexes already in use; verify with EXPLAIN |
| Migration fails | Very Low | Very Low | IF NOT EXISTS ensures idempotent execution |
| Wrong column order in index | Very Low | Medium | Column order matches documented specification |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create item_translations lookup index | 2 min |
| Create article_translations lookup index | 2 min |
| Create link_translations lookup index | 2 min |
| Create tag_translations lookup index | 2 min |
| Verify indexes and query plans | 10 min |
| **Total** | **~20 min** |

---

## 11. Migration SQL Summary

### Option A: Individual Migrations (Recommended)

Apply each index as a separate migration for granular tracking:

1. `create_item_translations_lookup_index`
2. `create_article_translations_lookup_index`
3. `create_link_translations_lookup_index`
4. `create_tag_translations_tag_lang_index`

### Option B: Combined Migration

If preferred, all indexes can be created in a single migration:

**Migration Name:** `create_translation_lookup_indexes`

```sql
-- REQ-336: Create Translation Content Lookup Indexes
-- Epic 3, Phase 6, Task 6.2
-- Fast lookup for displaying translated content to international guests

-- 1. Item translations lookup (item_id, language)
CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);

-- 2. Article translations lookup (article_id, language)
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);

-- 3. Link translations lookup (link_id, language)
CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);

-- 4. Tag translations lookup (tag_key, language)
CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);
```

---

## 12. Post-Implementation Steps

After completing this task:

1. **Task 6.3:** Add updated_at trigger for translations (automatic timestamp updates)
2. **Verify Epic 4 Performance:** Guest content display should benefit from these indexes
3. **Monitor Query Performance:** Use Supabase Dashboard or `pg_stat_user_indexes` to track index usage

### Monitoring Index Usage

```sql
-- Check index usage statistics after deployment
SELECT
  schemaname,
  tablename,
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexrelname IN (
  'idx_item_translations_lookup',
  'idx_article_translations_lookup',
  'idx_link_translations_lookup',
  'idx_tag_translations_tag_lang'
)
ORDER BY tablename;
```

---

## 13. Notes on Existing Indexes

The existing indexes (`idx_item_trans_item_lang`, etc.) already provide the same functionality. The new indexes specified in this task:

1. **Do NOT replace** the existing indexes
2. **Coexist safely** with existing indexes
3. **Follow the naming convention** specified in the architecture plan
4. **Are referenced** by documentation for consistency

PostgreSQL's query optimizer will automatically choose the most efficient index for each query, whether it's the new `_lookup` index or the existing equivalent.

If cleanup of duplicate indexes is desired in the future, a separate task can be created to drop the older `idx_*_trans_*` indexes after confirming the new indexes are being used.

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [REQ-335: Translation Job Indexes](/docs/REQ-335-create-translation-job-indexes-overview.md)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL Index Tips](https://www.postgresql.org/docs/current/indexes.html)
- [Supabase MCP apply_migration](https://supabase.com/docs)
