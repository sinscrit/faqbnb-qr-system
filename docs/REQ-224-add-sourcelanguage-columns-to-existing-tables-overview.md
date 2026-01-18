# REQ-224: Add source_language Columns to Existing Tables - Implementation Overview

**Generated:** 2026-01-17 15:00:00 UTC
**Last Modified:** 2026-01-17 15:00:00 UTC
**Request Reference:** REQ-224 - Track Original Language for Content Items
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.2)
**Status:** Ready for Implementation

---

## 1. Request Summary

Add `source_language` columns to three existing content tables to track the original language in which content was created:

1. **items** - Track source language for item names and descriptions
2. **item_articles** - Track source language for article titles and descriptions
3. **item_links** - Track source language for link titles

All existing records must default to English (`'en'`) as the source language, and new records should support specifying any valid language code from the supported set.

---

## 2. Current State Analysis

### Existing Database Schema

Based on `/database/schema.sql` and `/src/lib/supabase.ts`:

| Table | Current Columns | Notes |
|-------|-----------------|-------|
| `items` | `id`, `public_id`, `name`, `description`, `property_id`, `qr_code_url`, `qr_code_uploaded_at`, `created_at`, `updated_at` | No language tracking |
| `item_articles` | `id`, `item_id`, `purpose`, `title`, `description`, `display_order`, `created_at`, `updated_at` | No language tracking |
| `item_links` | `id`, `item_id`, `article_id`, `title`, `link_type`, `url`, `thumbnail_url`, `display_order`, `created_at` | No language tracking |

### Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| VARCHAR for enums | `item_links.link_type` | `VARCHAR(50)` with CHECK constraint |
| Column Defaults | All tables | `DEFAULT NOW()` for timestamps |
| ALTER TABLE | Various migrations | Standard Supabase migration pattern |
| CHECK constraints | `item_links`, translation tables | `CHECK (column IN ('value1', 'value2'))` |

### Supported Languages (from Plan-110)

| Code | Language |
|------|----------|
| `en` | English (default) |
| `fr` | French |
| `es` | Spanish |
| `de` | German |
| `nl` | Dutch |
| `it` | Italian |

---

## 3. Technical Approach

### Schema Changes

Each table will receive a new `source_language` column with the following characteristics:

| Property | Value |
|----------|-------|
| Column Name | `source_language` |
| Data Type | `VARCHAR(5)` |
| Default Value | `'en'` |
| Nullable | No (has default) |
| Constraint | CHECK constraint limiting to supported languages |

### Migration Strategy

Since we're adding columns with DEFAULT values:
1. PostgreSQL 11+ adds columns with DEFAULT values efficiently (no table rewrite for non-volatile defaults)
2. Existing rows automatically receive the default value `'en'`
3. No data migration needed - the DEFAULT clause handles existing records

### Column Definition

```sql
ALTER TABLE {table_name}
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en'
CONSTRAINT {table_name}_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));
```

---

## 4. Implementation Tasks

### Task 1.2.1: Create migration file

**Action:** Create new migration file
**File:** `/database/migrations/20260117_add_source_language_columns.sql`

Header content:
```sql
-- Add source_language columns to content tables
-- Generated: 2026-01-17
-- Purpose: Track original language of content for translation workflows
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-224 (Plan-110, Task 1.2)

-- This migration adds source_language column to:
-- 1. items - Track source language for item content
-- 2. item_articles - Track source language for article content
-- 3. item_links - Track source language for link titles
```

### Task 1.2.2: Add source_language to items table

**Action:** Add column with constraint
**File:** `/database/migrations/20260117_add_source_language_columns.sql`

SQL:
```sql
-- Add source_language to items table
ALTER TABLE items
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE items
ADD CONSTRAINT items_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));
```

Subtasks:
- [ ] Add VARCHAR(5) column with DEFAULT 'en'
- [ ] Add CHECK constraint for valid language codes
- [ ] Verify existing records receive 'en' default

### Task 1.2.3: Add source_language to item_articles table

**Action:** Add column with constraint
**File:** `/database/migrations/20260117_add_source_language_columns.sql`

SQL:
```sql
-- Add source_language to item_articles table
ALTER TABLE item_articles
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE item_articles
ADD CONSTRAINT item_articles_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));
```

Subtasks:
- [ ] Add VARCHAR(5) column with DEFAULT 'en'
- [ ] Add CHECK constraint for valid language codes
- [ ] Verify existing records receive 'en' default

### Task 1.2.4: Add source_language to item_links table

**Action:** Add column with constraint
**File:** `/database/migrations/20260117_add_source_language_columns.sql`

SQL:
```sql
-- Add source_language to item_links table
ALTER TABLE item_links
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE item_links
ADD CONSTRAINT item_links_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));
```

Subtasks:
- [ ] Add VARCHAR(5) column with DEFAULT 'en'
- [ ] Add CHECK constraint for valid language codes
- [ ] Verify existing records receive 'en' default

### Task 1.2.5: Add indexes for language-based queries

**Action:** Create indexes on source_language columns
**File:** `/database/migrations/20260117_add_source_language_columns.sql`

SQL:
```sql
-- Indexes for source_language columns
-- Useful for filtering content by source language
CREATE INDEX idx_items_source_language ON items(source_language);
CREATE INDEX idx_item_articles_source_language ON item_articles(source_language);
CREATE INDEX idx_item_links_source_language ON item_links(source_language);
```

### Task 1.2.6: Add column comments for documentation

**Action:** Document new columns
**File:** `/database/migrations/20260117_add_source_language_columns.sql`

SQL:
```sql
-- Documentation comments
COMMENT ON COLUMN items.source_language IS 'Original language code of the item content (ISO 639-1). Defaults to en.';
COMMENT ON COLUMN item_articles.source_language IS 'Original language code of the article content (ISO 639-1). Defaults to en.';
COMMENT ON COLUMN item_links.source_language IS 'Original language code of the link title (ISO 639-1). Defaults to en.';
```

### Task 1.2.7: Create rollback section

**Action:** Add rollback SQL in comments
**File:** `/database/migrations/20260117_add_source_language_columns.sql`

SQL:
```sql
-- ===========================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- ===========================================================
-- DROP INDEX IF EXISTS idx_item_links_source_language;
-- DROP INDEX IF EXISTS idx_item_articles_source_language;
-- DROP INDEX IF EXISTS idx_items_source_language;
--
-- ALTER TABLE item_links DROP CONSTRAINT IF EXISTS item_links_source_language_check;
-- ALTER TABLE item_articles DROP CONSTRAINT IF EXISTS item_articles_source_language_check;
-- ALTER TABLE items DROP CONSTRAINT IF EXISTS items_source_language_check;
--
-- ALTER TABLE item_links DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE item_articles DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE items DROP COLUMN IF EXISTS source_language;
```

### Task 1.2.8: Update TypeScript database types

**Action:** Update Supabase type definitions
**File:** `/src/lib/supabase.ts`

Changes to make in each table definition:

**items table (Row/Insert/Update):**
```typescript
source_language: string | null  // Row
source_language?: string | null // Insert
source_language?: string | null // Update
```

**item_articles table (Row/Insert/Update):**
```typescript
source_language: string | null  // Row
source_language?: string | null // Insert
source_language?: string | null // Update
```

**item_links table (Row/Insert/Update):**
```typescript
source_language: string | null  // Row
source_language?: string | null // Insert
source_language?: string | null // Update
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/database/migrations/20260117_add_source_language_columns.sql` | Migration file for source_language columns |

### Files to MODIFY

| File Path | Section to Modify | Changes |
|-----------|-------------------|---------|
| `/src/lib/supabase.ts` | `Database.public.Tables.items.Row` | Add `source_language: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.items.Insert` | Add `source_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.items.Update` | Add `source_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.item_articles.Row` | Add `source_language: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.item_articles.Insert` | Add `source_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.item_articles.Update` | Add `source_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.item_links.Row` | Add `source_language: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.item_links.Insert` | Add `source_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.item_links.Update` | Add `source_language?: string \| null` |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/database/schema.sql` | Reference existing schema patterns |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |
| `/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md` | Previous L10N migration |

### No Modifications Required

The following files should NOT be modified for this task:
- `/database/schema.sql` (migrations are separate from base schema)
- Any application code that creates/updates items, articles, or links (they will use the default)
- Any UI components (no user-facing changes for this task)

---

## 6. Dependencies

### Database Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| `items` table | Must exist | Target for ALTER TABLE |
| `item_articles` table | Must exist | Target for ALTER TABLE |
| `item_links` table | Must exist | Target for ALTER TABLE |

### Task Dependencies

| Task | Dependency | Notes |
|------|------------|-------|
| Task 1.1 (REQ-223) | Optional | Can run independently, but ideally after translation tables exist |
| Task 1.3 (preferred_language) | None | Independent task |

### Application Dependencies

After TypeScript types are updated:
- Existing code that queries/inserts items, articles, links will continue to work (column has default)
- No breaking changes - the column is optional in Insert/Update types

---

## 7. Acceptance Criteria

From REQ-224:

- [ ] Items table records indicate their source language
- [ ] Item articles table records indicate their source language
- [ ] Item links table records indicate their source language
- [ ] All existing records show English (`'en'`) as their source language
- [ ] New records can specify any valid language code as their source language

From Plan-110 (Task 1.2):

- [ ] ALTER items, item_articles, item_links tables with source_language column
- [ ] Default to 'en' for existing records
- [ ] CHECK constraints limit values to supported languages

---

## 8. Testing Strategy

### Pre-Deployment Verification

1. **Syntax Check:**
   ```bash
   # Validate SQL syntax (local PostgreSQL if available)
   psql -h localhost -d faqbnb_test -f database/migrations/20260117_add_source_language_columns.sql --echo-errors
   ```

2. **TypeScript Compilation:**
   ```bash
   # Verify type changes compile correctly
   npm run build
   ```

### Post-Deployment Verification

3. **Column Existence Check:**
   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_schema = 'public'
   AND table_name IN ('items', 'item_articles', 'item_links')
   AND column_name = 'source_language';
   -- Expected: 3 rows, all with 'en'::character varying as default
   ```

4. **Existing Data Verification:**
   ```sql
   -- Verify all existing items have 'en' as source_language
   SELECT COUNT(*) as total, source_language
   FROM items
   GROUP BY source_language;
   -- Expected: All rows should have source_language = 'en'

   -- Same for item_articles
   SELECT COUNT(*) as total, source_language
   FROM item_articles
   GROUP BY source_language;

   -- Same for item_links
   SELECT COUNT(*) as total, source_language
   FROM item_links
   GROUP BY source_language;
   ```

5. **Constraint Verification:**
   ```sql
   -- Test that invalid language codes are rejected
   INSERT INTO items (public_id, name, property_id, source_language)
   VALUES ('test-invalid', 'Test Item', 'some-property-id', 'xx');
   -- Expected: ERROR - violates check constraint

   -- Test that valid language codes are accepted
   INSERT INTO items (public_id, name, property_id, source_language)
   VALUES ('test-valid', 'Test Item', 'some-property-id', 'fr');
   -- Expected: SUCCESS
   -- Clean up: DELETE FROM items WHERE public_id = 'test-valid';
   ```

6. **Index Verification:**
   ```sql
   SELECT indexname, tablename
   FROM pg_indexes
   WHERE indexname LIKE '%source_language%';
   -- Expected: 3 rows (idx_items_source_language, idx_item_articles_source_language, idx_item_links_source_language)
   ```

### Rollback Testing

7. **Rollback Verification:**
   - Run rollback script on test environment
   - Verify columns removed from all three tables
   - Verify indexes removed
   - Verify constraints removed

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Column addition locks table | Low | Medium | PostgreSQL 11+ handles DEFAULT efficiently; use low-traffic window |
| Existing queries break | Very Low | Low | Adding column with default doesn't affect existing SELECTs |
| TypeScript type mismatch | Low | Medium | Update types in same deployment as migration |
| Constraint too restrictive | Low | Low | Only supported languages; matches translation tables |
| Index creation slow | Low | Low | Small tables; minimal data currently |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create migration file with header | 5 min |
| Add column ALTER statements (3 tables) | 10 min |
| Add CHECK constraints (3 tables) | 5 min |
| Add indexes (3 tables) | 5 min |
| Add comments | 5 min |
| Add rollback script | 5 min |
| Update TypeScript types | 15 min |
| Local testing | 10 min |
| Staging deployment | 10 min |
| **Total** | **~70 min** |

---

## 11. Complete Migration File Structure

```sql
-- ===========================================================
-- Add source_language columns to content tables
-- File: /database/migrations/20260117_add_source_language_columns.sql
-- Generated: 2026-01-17
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-224 (Plan-110, Task 1.2)
-- ===========================================================

-- Purpose: Track original language of content for translation workflows
-- This enables the translation system to know which version is authoritative

-- ============ COLUMN ADDITIONS ============

-- Add source_language to items table
ALTER TABLE items
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE items
ADD CONSTRAINT items_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- Add source_language to item_articles table
ALTER TABLE item_articles
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE item_articles
ADD CONSTRAINT item_articles_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- Add source_language to item_links table
ALTER TABLE item_links
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE item_links
ADD CONSTRAINT item_links_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============ INDEXES ============

CREATE INDEX idx_items_source_language ON items(source_language);
CREATE INDEX idx_item_articles_source_language ON item_articles(source_language);
CREATE INDEX idx_item_links_source_language ON item_links(source_language);

-- ============ DOCUMENTATION ============

COMMENT ON COLUMN items.source_language IS 'Original language code of the item content (ISO 639-1). Defaults to en.';
COMMENT ON COLUMN item_articles.source_language IS 'Original language code of the article content (ISO 639-1). Defaults to en.';
COMMENT ON COLUMN item_links.source_language IS 'Original language code of the link title (ISO 639-1). Defaults to en.';

-- ===========================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- ===========================================================
-- DROP INDEX IF EXISTS idx_item_links_source_language;
-- DROP INDEX IF EXISTS idx_item_articles_source_language;
-- DROP INDEX IF EXISTS idx_items_source_language;
--
-- ALTER TABLE item_links DROP CONSTRAINT IF EXISTS item_links_source_language_check;
-- ALTER TABLE item_articles DROP CONSTRAINT IF EXISTS item_articles_source_language_check;
-- ALTER TABLE items DROP CONSTRAINT IF EXISTS items_source_language_check;
--
-- ALTER TABLE item_links DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE item_articles DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE items DROP COLUMN IF EXISTS source_language;
```

---

## 12. TypeScript Type Updates

### Updates to `/src/lib/supabase.ts`

**For `items` table:**

```typescript
// In Database.public.Tables.items.Row, add:
source_language: string | null

// In Database.public.Tables.items.Insert, add:
source_language?: string | null

// In Database.public.Tables.items.Update, add:
source_language?: string | null
```

**For `item_articles` table:**

```typescript
// In Database.public.Tables.item_articles.Row, add:
source_language: string | null

// In Database.public.Tables.item_articles.Insert, add:
source_language?: string | null

// In Database.public.Tables.item_articles.Update, add:
source_language?: string | null
```

**For `item_links` table:**

```typescript
// In Database.public.Tables.item_links.Row, add:
source_language: string | null

// In Database.public.Tables.item_links.Insert, add:
source_language?: string | null

// In Database.public.Tables.item_links.Update, add:
source_language?: string | null
```

---

## 13. Next Steps After Implementation

After completing Task 1.2 (this task):

1. **Task 1.3:** Add preferred_language columns to users and accounts tables
2. **Task 1.4:** Implement RLS policies for translation tables
3. **Task 1.5:** Update TypeScript database types (if not done as part of this task)
4. **Task 1.6:** Seed system tag translations

---

## References

- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-223 Overview](/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md)
- [Existing Schema](/database/schema.sql)
- [Supabase TypeScript Types](/src/lib/supabase.ts)
