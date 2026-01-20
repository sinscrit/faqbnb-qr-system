# REQ-E03-027: Create Translation Lookup Indexes

**Implementation Breakdown Document**

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
| **Date Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 16:45 UTC |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Dependencies** | Epic 1 translation tables (l10n_foundation migration) |

---

## 1. Summary

Create optimized database indexes on all translation tables (item_translations, article_translations, link_translations, tag_translations) to enable fast lookup of translated content by entity ID and language combination. These composite indexes support the primary access pattern of retrieving translations for display to guests viewing content in their preferred language.

---

## 2. Background & Context

### Current State

Based on database investigation, the translation tables **already have equivalent indexes** created in Epic 1 (l10n_foundation migration):

| Table | Existing Index | Columns | Matches Plan |
|-------|----------------|---------|--------------|
| `item_translations` | `idx_item_trans_item_lang` | `(item_id, language)` | ✅ Yes |
| `article_translations` | `idx_article_trans_article_lang` | `(article_id, language)` | ✅ Yes |
| `link_translations` | `idx_link_trans_link_lang` | `(link_id, language)` | ✅ Yes |
| `tag_translations` | `idx_tag_trans_key_lang` | `(tag_key, language)` | ✅ Yes |

Additionally, UNIQUE constraints exist on these tables:

| Table | Unique Constraint | Columns |
|-------|-------------------|---------|
| `item_translations` | `item_translations_item_id_language_key` | `(item_id, language)` |
| `article_translations` | `article_translations_article_id_language_key` | `(article_id, language)` |
| `link_translations` | `link_translations_link_id_language_key` | `(link_id, language)` |
| `tag_translations` | `tag_translations_tag_key_language_key` | `(tag_key, language)` |

### Implementation Plan Specification

The implementation plan (Phase 6, Task 6.2) specifies these indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);
CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);
CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);
```

### Assessment: Indexes Already Exist

The required functionality is **already satisfied** by the existing indexes from Epic 1. The naming convention differs slightly:
- Plan specifies: `idx_*_translations_lookup`
- Existing uses: `idx_*_trans_*_lang`

Both patterns cover the same columns and provide identical performance benefits. Creating duplicate indexes with different names would:
1. Waste disk space
2. Slow down INSERT/UPDATE operations (maintaining redundant indexes)
3. Add no performance benefit for SELECT queries

### Recommendation

**Option A (Recommended): Verify and Document Existing Coverage**
- Confirm existing indexes satisfy all lookup requirements
- Document that Task 6.2 is satisfied by Epic 1 implementation
- No migration needed

**Option B: Create Aliased Indexes for Consistency**
- Create the `idx_*_lookup` indexes as specified
- Accept minor overhead for naming consistency
- Allows future code to reference consistent naming

This document recommends **Option A** based on the principle of avoiding unnecessary changes.

---

## 3. Technical Requirements

### 3.1 Existing Index Coverage

All required lookup indexes are **already implemented**:

#### Item Translations Lookup
```sql
-- Existing (Epic 1)
CREATE INDEX idx_item_trans_item_lang ON item_translations(item_id, language);
CREATE UNIQUE INDEX item_translations_item_id_language_key ON item_translations(item_id, language);
```

Query pattern supported:
```sql
SELECT name, description, translation_status, translated_at
FROM item_translations
WHERE item_id = $1 AND language = $2;
```

#### Article Translations Lookup
```sql
-- Existing (Epic 1)
CREATE INDEX idx_article_trans_article_lang ON article_translations(article_id, language);
CREATE UNIQUE INDEX article_translations_article_id_language_key ON article_translations(article_id, language);
```

Query pattern supported:
```sql
SELECT title, description, translation_status, translated_at
FROM article_translations
WHERE article_id = $1 AND language = $2;
```

#### Link Translations Lookup
```sql
-- Existing (Epic 1)
CREATE INDEX idx_link_trans_link_lang ON link_translations(link_id, language);
CREATE UNIQUE INDEX link_translations_link_id_language_key ON link_translations(link_id, language);
```

Query pattern supported:
```sql
SELECT title, translation_status, translated_at
FROM link_translations
WHERE link_id = $1 AND language = $2;
```

#### Tag Translations Lookup
```sql
-- Existing (Epic 1)
CREATE INDEX idx_tag_trans_key_lang ON tag_translations(tag_key, language);
CREATE UNIQUE INDEX tag_translations_tag_key_language_key ON tag_translations(tag_key, language);
```

Query pattern supported:
```sql
SELECT translated_value, is_system_tag
FROM tag_translations
WHERE tag_key = $1 AND language = $2;
```

### 3.2 Query Performance Verification

To verify indexes are being used, run EXPLAIN ANALYZE on typical queries:

```sql
-- Verify item translation lookup uses index
EXPLAIN ANALYZE
SELECT name, description, translation_status
FROM item_translations
WHERE item_id = 'some-uuid' AND language = 'fr';

-- Expected output should show:
-- Index Scan using idx_item_trans_item_lang on item_translations
-- (or using the unique constraint index)
```

### 3.3 Optional: Create Aliased Indexes (Option B)

If naming consistency is required for documentation or tooling purposes:

```sql
-- Migration: create_translation_lookup_indexes
-- Only creates if they don't already exist (will be no-op for identical columns)

CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);

CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);

CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);

CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);
```

**Note:** PostgreSQL will detect that equivalent indexes already exist and may skip creation or create redundant indexes depending on implementation.

---

## 4. Ordered Task List

### Verification Tasks (Option A - Recommended)

| # | Task | Story Points | Priority |
|---|------|--------------|----------|
| 1 | Verify existing indexes cover all lookup patterns | 0.5 | P0 |
| 2 | Run EXPLAIN ANALYZE on representative queries | 0.5 | P0 |
| 3 | Document index coverage in Epic 3 completion notes | 0.5 | P1 |
| 4 | Update any code comments that reference new index names | 0.5 | P2 |

**Total: 2 story points** (verification only, no migration)

### Implementation Tasks (Option B - If Required)

| # | Task | Story Points | Priority |
|---|------|--------------|----------|
| 1 | Create migration file with lookup indexes | 1 | P0 |
| 2 | Test migration on development database | 0.5 | P0 |
| 3 | Verify query planner uses indexes | 0.5 | P0 |
| 4 | Apply migration to staging environment | 0.5 | P1 |
| 5 | Update documentation | 0.5 | P2 |

**Total: 3 story points** (full implementation)

---

## 5. Authorized Files and Functions for Modification

### Database Migrations

| Operation | File/Location | Description |
|-----------|---------------|-------------|
| CREATE (if Option B) | `supabase/migrations/YYYYMMDDHHMMSS_create_translation_lookup_indexes.sql` | New migration file |
| VERIFY | `database/migrations/20260117_l10n_foundation.sql` | Reference existing indexes |

### No Application Code Changes Required

This task involves database indexes only. No TypeScript/JavaScript files need modification as indexes are transparent to the application layer.

### Documentation

| Operation | File | Description |
|-----------|------|-------------|
| UPDATE | `docs/epic3-completion-notes.md` | Document index coverage |
| UPDATE | `docs/REQ-E03-027-create-translation-lookup-indexes-overview.md` | This document |

---

## 6. Implementation Guidance

### If Proceeding with Option A (Verification Only)

1. **Run Index Verification Queries**
   ```sql
   -- List all indexes on translation tables
   SELECT schemaname, tablename, indexname, indexdef
   FROM pg_indexes
   WHERE tablename IN (
     'item_translations',
     'article_translations',
     'link_translations',
     'tag_translations'
   )
   ORDER BY tablename, indexname;
   ```

2. **Test Query Performance**
   ```sql
   -- Test with actual data (requires existing translations)
   EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
   SELECT * FROM item_translations
   WHERE item_id = (SELECT id FROM items LIMIT 1)
     AND language = 'fr';
   ```

3. **Document Completion**
   - Note that Task 6.2 requirements are satisfied by Epic 1
   - Reference existing index names in any Epic 3 documentation

### If Proceeding with Option B (Create New Indexes)

1. **Create Migration File**
   ```bash
   # Generate timestamp for migration
   TIMESTAMP=$(date +%Y%m%d%H%M%S)
   touch supabase/migrations/${TIMESTAMP}_create_translation_lookup_indexes.sql
   ```

2. **Migration Content**
   ```sql
   -- Migration: create_translation_lookup_indexes
   -- Task: REQ-E03-027 / Plan-111 Task 6.2
   -- Purpose: Fast lookup for displaying translated content
   -- Note: Equivalent indexes may exist from Epic 1; IF NOT EXISTS handles this

   -- Item translations lookup (item_id + language)
   CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
     ON item_translations(item_id, language);

   -- Article translations lookup (article_id + language)
   CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
     ON article_translations(article_id, language);

   -- Link translations lookup (link_id + language)
   CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
     ON link_translations(link_id, language);

   -- Tag translations lookup (tag_key + language)
   CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
     ON tag_translations(tag_key, language);

   -- Add index comments for documentation
   COMMENT ON INDEX idx_item_translations_lookup IS 'Fast lookup of item translations by item_id and language - Epic 3 Task 6.2';
   COMMENT ON INDEX idx_article_translations_lookup IS 'Fast lookup of article translations by article_id and language - Epic 3 Task 6.2';
   COMMENT ON INDEX idx_link_translations_lookup IS 'Fast lookup of link translations by link_id and language - Epic 3 Task 6.2';
   COMMENT ON INDEX idx_tag_translations_tag_lang IS 'Fast lookup of tag translations by tag_key and language - Epic 3 Task 6.2';
   ```

3. **Apply Migration**
   ```bash
   # Apply via Supabase CLI
   supabase db push

   # Or via MCP apply_migration tool
   ```

4. **Verify Creation**
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE indexname LIKE '%lookup%' OR indexname LIKE '%tag_lang%';
   ```

---

## 7. Testing Requirements

### Index Existence Verification
```sql
-- All four lookup indexes should exist (or their equivalents)
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

### Query Plan Verification
```sql
-- Verify Index Scan (not Seq Scan) for typical queries
EXPLAIN (FORMAT JSON)
SELECT name, description FROM item_translations WHERE item_id = $1 AND language = $2;

-- Check that "Node Type" is "Index Scan" or "Index Only Scan"
```

### Performance Benchmark
```sql
-- Query should complete in < 10ms for typical dataset
EXPLAIN ANALYZE
SELECT name, description, translation_status, translated_at
FROM item_translations
WHERE item_id = 'test-item-uuid' AND language = 'es';

-- Check "Execution Time" in output
```

---

## 8. Acceptance Criteria Mapping

| PRD Criteria | Status | Notes |
|--------------|--------|-------|
| Composite index on item_translations(item_id, language) | ✅ Exists | `idx_item_trans_item_lang` + unique constraint |
| Composite index on article_translations(article_id, language) | ✅ Exists | `idx_article_trans_article_lang` + unique constraint |
| Composite index on link_translations(link_id, language) | ✅ Exists | `idx_link_trans_link_lang` + unique constraint |
| Composite index on tag_translations(tag_key, language) | ✅ Exists | `idx_tag_trans_key_lang` + unique constraint |
| IF NOT EXISTS clause for safe re-execution | ✅ N/A | Existing indexes handle this |
| Query planner uses indexes | Needs verification | Run EXPLAIN ANALYZE |
| Queries complete in < 10ms | Needs verification | Benchmark with test data |
| TypeScript types unchanged | ✅ N/A | Indexes are transparent |
| Migration reversibility documented | ✅ N/A | Existing indexes from Epic 1 |

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate indexes created (waste resources) | Medium | Low | Use IF NOT EXISTS, verify before migration |
| Indexes not used by query planner | Low | Medium | Verify with EXPLAIN ANALYZE |
| Performance regression on writes | Very Low | Low | Composite indexes have minimal write overhead |

---

## 10. Dependencies

### Upstream Dependencies
| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 translation tables | ✅ Complete | Tables and indexes exist |
| l10n_foundation migration | ✅ Applied | Verified in production |

### Downstream Dependencies
| Feature | Impact |
|---------|--------|
| Guest content display (Epic 4) | Uses these indexes for translation retrieval |
| Translation status APIs (REQ-E03-021) | Uses these indexes for status queries |
| Batch status endpoint (REQ-E03-024) | Uses these indexes for bulk lookups |

---

## 11. Conclusion

**This task (6.2) is effectively complete** due to indexes created in Epic 1. The recommended action is:

1. **Verify** existing indexes cover the required query patterns
2. **Document** that Epic 1 indexes satisfy Task 6.2 requirements
3. **Skip** creating redundant indexes with different names

If strict naming convention adherence is required, the migration script in Section 6 can be applied, but this is not recommended as it adds no functional benefit.

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Last Modified: 2026-01-20 16:45 UTC*
