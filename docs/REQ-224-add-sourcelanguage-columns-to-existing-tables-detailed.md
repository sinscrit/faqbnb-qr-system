# REQ-224: Add source_language Columns to Existing Tables - Detailed Task Breakdown

**Generated:** 2026-01-18 09:30:00 UTC
**Last Modified:** 2026-01-18 04:59:00 UTC
**Request Reference:** REQ-224 - Track Original Language for Content Items
**Overview Document:** REQ-224-add-sourcelanguage-columns-to-existing-tables-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.2)
**Status:** ✅ COMPLETED

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for adding `source_language` columns to the `items`, `item_articles`, and `item_links` tables. Each task is designed to be completed in approximately 1 story point and includes exact file locations, code snippets, and verification steps.

---

## Prerequisites

Before starting implementation:

- [ ] REQ-223 (Translation tables migration) should ideally be completed first, but this task can run independently
- [ ] Access to Supabase database with migration permissions
- [ ] Local development environment running
- [ ] Familiarity with PostgreSQL ALTER TABLE syntax

---

## Task Breakdown

### Task 1: Create Migration File with Header
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** None

#### Description
Create a new migration file with appropriate header documentation for tracking the source language of content items.

#### Implementation Steps

1. **Create the migration file:**
   - **File Path:** `/database/migrations/20260118_add_source_language_columns.sql`
   - **Action:** Create new file

2. **Add the header content:**

```sql
-- ===========================================================
-- Migration: Add source_language columns to content tables
-- File: 20260118_add_source_language_columns.sql
-- Generated: 2026-01-18
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-224 (Plan-110, Task 1.2)
-- ===========================================================
--
-- Purpose: Track original language of content for translation workflows
-- This enables the translation system to know which version is authoritative
--
-- Tables affected:
--   1. items - Track source language for item names and descriptions
--   2. item_articles - Track source language for article content
--   3. item_links - Track source language for link titles
--
-- Supported languages: en, fr, es, de, nl, it
-- Default value: 'en' (English)
--
-- ===========================================================

```

#### Verification
- [ ] File exists at `/database/migrations/20260118_add_source_language_columns.sql`
- [ ] Header includes Epic reference, REQ number, and purpose documentation

---

### Task 2: Add source_language Column to items Table
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Task 1

#### Description
Add the `source_language` column to the `items` table with a CHECK constraint to enforce valid language codes.

#### Implementation Steps

1. **Append to migration file:**
   - **File Path:** `/database/migrations/20260118_add_source_language_columns.sql`
   - **Action:** Append SQL

```sql
-- ============================================================
-- SECTION 1: Add source_language to items table
-- ============================================================

-- Add source_language column with default 'en'
-- PostgreSQL 11+ handles DEFAULT efficiently (no table rewrite)
ALTER TABLE items
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint for valid language codes
ALTER TABLE items
ADD CONSTRAINT items_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

```

#### Verification Query
```sql
-- Verify column exists and has correct default
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'items' AND column_name = 'source_language';
-- Expected: source_language, character varying, 'en'::character varying

-- Verify all existing items have 'en'
SELECT COUNT(*) as total,
       COUNT(CASE WHEN source_language = 'en' THEN 1 END) as english_count
FROM items;
-- Expected: total = english_count
```

---

### Task 3: Add source_language Column to item_articles Table
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Task 1

#### Description
Add the `source_language` column to the `item_articles` table with a CHECK constraint to enforce valid language codes.

#### Implementation Steps

1. **Append to migration file:**
   - **File Path:** `/database/migrations/20260118_add_source_language_columns.sql`
   - **Action:** Append SQL

```sql
-- ============================================================
-- SECTION 2: Add source_language to item_articles table
-- ============================================================

-- Add source_language column with default 'en'
ALTER TABLE item_articles
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint for valid language codes
ALTER TABLE item_articles
ADD CONSTRAINT item_articles_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

```

#### Verification Query
```sql
-- Verify column exists and has correct default
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'item_articles' AND column_name = 'source_language';
-- Expected: source_language, character varying, 'en'::character varying

-- Verify all existing articles have 'en'
SELECT COUNT(*) as total,
       COUNT(CASE WHEN source_language = 'en' THEN 1 END) as english_count
FROM item_articles;
-- Expected: total = english_count
```

---

### Task 4: Add source_language Column to item_links Table
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Task 1

#### Description
Add the `source_language` column to the `item_links` table with a CHECK constraint to enforce valid language codes.

#### Implementation Steps

1. **Append to migration file:**
   - **File Path:** `/database/migrations/20260118_add_source_language_columns.sql`
   - **Action:** Append SQL

```sql
-- ============================================================
-- SECTION 3: Add source_language to item_links table
-- ============================================================

-- Add source_language column with default 'en'
ALTER TABLE item_links
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint for valid language codes
ALTER TABLE item_links
ADD CONSTRAINT item_links_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

```

#### Verification Query
```sql
-- Verify column exists and has correct default
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'item_links' AND column_name = 'source_language';
-- Expected: source_language, character varying, 'en'::character varying

-- Verify all existing links have 'en'
SELECT COUNT(*) as total,
       COUNT(CASE WHEN source_language = 'en' THEN 1 END) as english_count
FROM item_links;
-- Expected: total = english_count
```

---

### Task 5: Create Indexes for source_language Columns
**Story Points:** 1
**Priority:** P1 - Recommended
**Dependencies:** Tasks 2, 3, 4

#### Description
Create indexes on the `source_language` columns to optimize queries that filter by language.

#### Implementation Steps

1. **Append to migration file:**
   - **File Path:** `/database/migrations/20260118_add_source_language_columns.sql`
   - **Action:** Append SQL

```sql
-- ============================================================
-- SECTION 4: Create indexes for source_language columns
-- ============================================================
-- These indexes optimize queries filtering content by source language

CREATE INDEX IF NOT EXISTS idx_items_source_language
ON items(source_language);

CREATE INDEX IF NOT EXISTS idx_item_articles_source_language
ON item_articles(source_language);

CREATE INDEX IF NOT EXISTS idx_item_links_source_language
ON item_links(source_language);

```

#### Verification Query
```sql
-- Verify all three indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE 'idx_%_source_language';
-- Expected: 3 rows
```

---

### Task 6: Add Column Documentation Comments
**Story Points:** 1
**Priority:** P2 - Nice to Have
**Dependencies:** Tasks 2, 3, 4

#### Description
Add PostgreSQL COMMENT statements to document the purpose of each `source_language` column.

#### Implementation Steps

1. **Append to migration file:**
   - **File Path:** `/database/migrations/20260118_add_source_language_columns.sql`
   - **Action:** Append SQL

```sql
-- ============================================================
-- SECTION 5: Column documentation
-- ============================================================

COMMENT ON COLUMN items.source_language IS
  'Original language code (ISO 639-1) of the item content. Defaults to en. Valid: en, fr, es, de, nl, it.';

COMMENT ON COLUMN item_articles.source_language IS
  'Original language code (ISO 639-1) of the article content. Defaults to en. Valid: en, fr, es, de, nl, it.';

COMMENT ON COLUMN item_links.source_language IS
  'Original language code (ISO 639-1) of the link title. Defaults to en. Valid: en, fr, es, de, nl, it.';

```

#### Verification Query
```sql
-- Check comments are set
SELECT c.table_name, c.column_name, pgd.description
FROM information_schema.columns c
JOIN pg_catalog.pg_statio_all_tables st ON c.table_name = st.relname
JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid
  AND pgd.objsubid = c.ordinal_position
WHERE c.column_name = 'source_language'
  AND c.table_name IN ('items', 'item_articles', 'item_links');
```

---

### Task 7: Add Rollback Script (Commented)
**Story Points:** 1
**Priority:** P1 - Recommended
**Dependencies:** Tasks 2, 3, 4, 5

#### Description
Add a commented rollback script at the end of the migration file for emergency recovery.

#### Implementation Steps

1. **Append to migration file:**
   - **File Path:** `/database/migrations/20260118_add_source_language_columns.sql`
   - **Action:** Append SQL

```sql
-- ============================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- ============================================================
-- WARNING: This will permanently remove source_language data!
--
-- -- Remove indexes first
-- DROP INDEX IF EXISTS idx_item_links_source_language;
-- DROP INDEX IF EXISTS idx_item_articles_source_language;
-- DROP INDEX IF EXISTS idx_items_source_language;
--
-- -- Remove constraints
-- ALTER TABLE item_links DROP CONSTRAINT IF EXISTS item_links_source_language_check;
-- ALTER TABLE item_articles DROP CONSTRAINT IF EXISTS item_articles_source_language_check;
-- ALTER TABLE items DROP CONSTRAINT IF EXISTS items_source_language_check;
--
-- -- Remove columns
-- ALTER TABLE item_links DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE item_articles DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE items DROP COLUMN IF EXISTS source_language;
--
-- ============================================================
-- END OF MIGRATION
-- ============================================================
```

#### Verification
- [ ] Rollback script is present in comments
- [ ] Order is correct: indexes → constraints → columns

---

### Task 8: Update TypeScript Types - items Table
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Task 2

#### Description
Add `source_language` property to the `items` table type definitions in the Supabase types file.

#### Implementation Steps

1. **Modify file:**
   - **File Path:** `/src/lib/supabase.ts`
   - **Section:** `Database.public.Tables.items`

2. **Add to `items.Row` (around line 308-317):**

Find this section:
```typescript
items: {
  Row: {
    created_at: string | null
    description: string | null
    id: string
    name: string
    property_id: string
    public_id: string
    qr_code_uploaded_at: string | null
    qr_code_url: string | null
    updated_at: string | null
  }
```

Add after `updated_at`:
```typescript
    source_language: string | null
```

3. **Add to `items.Insert` (around line 318-328):**

Find this section and add:
```typescript
    source_language?: string | null
```

4. **Add to `items.Update` (around line 329-339):**

Find this section and add:
```typescript
    source_language?: string | null
```

#### Verification
```bash
# Verify TypeScript compiles without errors
npm run build
```

---

### Task 9: Update TypeScript Types - item_articles Table
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Task 3

#### Description
Add `source_language` property to the `item_articles` table type definitions in the Supabase types file.

#### Implementation Steps

1. **Modify file:**
   - **File Path:** `/src/lib/supabase.ts`
   - **Section:** `Database.public.Tables.item_articles`

2. **Add to `item_articles.Row` (around line 266-275):**

Find this section:
```typescript
item_articles: {
  Row: {
    id: string
    item_id: string
    purpose: string
    title: string
    description: string | null
    display_order: number | null
    created_at: string | null
    updated_at: string | null
  }
```

Add after `updated_at`:
```typescript
    source_language: string | null
```

3. **Add to `item_articles.Insert` (around line 276-285):**

Add after `updated_at`:
```typescript
    source_language?: string | null
```

4. **Add to `item_articles.Update` (around line 286-295):**

Add after `updated_at`:
```typescript
    source_language?: string | null
```

#### Verification
```bash
# Verify TypeScript compiles without errors
npm run build
```

---

### Task 10: Update TypeScript Types - item_links Table
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Task 4

#### Description
Add `source_language` property to the `item_links` table type definitions in the Supabase types file.

#### Implementation Steps

1. **Modify file:**
   - **File Path:** `/src/lib/supabase.ts`
   - **Section:** `Database.public.Tables.item_links`

2. **Add to `item_links.Row` (around line 214-224):**

Find this section:
```typescript
item_links: {
  Row: {
    created_at: string | null
    display_order: number | null
    id: string
    item_id: string | null
    article_id: string | null
    link_type: string
    thumbnail_url: string | null
    title: string
    url: string
  }
```

Add after `url`:
```typescript
    source_language: string | null
```

3. **Add to `item_links.Insert` (around line 225-235):**

Add after `url`:
```typescript
    source_language?: string | null
```

4. **Add to `item_links.Update` (around line 236-246):**

Add after `url`:
```typescript
    source_language?: string | null
```

#### Verification
```bash
# Verify TypeScript compiles without errors
npm run build
```

---

### Task 11: Run Migration on Staging Database
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Tasks 1-7

#### Description
Apply the migration to the Supabase staging database using the Supabase MCP tool.

#### Implementation Steps

1. **Review the complete migration file** before executing

2. **Apply migration via Supabase MCP:**
```
Use mcp__supabase__apply_migration with:
- name: "add_source_language_columns"
- query: [contents of migration file]
```

3. **Alternative: Apply via Supabase Dashboard:**
   - Navigate to SQL Editor
   - Paste migration content
   - Execute

#### Verification Queries
```sql
-- 1. Verify columns exist on all three tables
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE column_name = 'source_language'
  AND table_name IN ('items', 'item_articles', 'item_links')
ORDER BY table_name;
-- Expected: 3 rows, all with default 'en'

-- 2. Verify constraints exist
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conname LIKE '%_source_language_check';
-- Expected: 3 rows

-- 3. Verify indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE '%source_language%';
-- Expected: 3 rows

-- 4. Verify existing data has default value
SELECT 'items' as table_name, COUNT(*) as total,
       COUNT(CASE WHEN source_language = 'en' THEN 1 END) as has_default
FROM items
UNION ALL
SELECT 'item_articles', COUNT(*),
       COUNT(CASE WHEN source_language = 'en' THEN 1 END)
FROM item_articles
UNION ALL
SELECT 'item_links', COUNT(*),
       COUNT(CASE WHEN source_language = 'en' THEN 1 END)
FROM item_links;
-- Expected: total = has_default for all tables
```

---

### Task 12: Verify Build and Type Safety
**Story Points:** 1
**Priority:** P0 - Required
**Dependencies:** Tasks 8, 9, 10, 11

#### Description
Run TypeScript build and verify no type errors exist after adding new type definitions.

#### Implementation Steps

1. **Run TypeScript build:**
```bash
npm run build
```

2. **Check for any type errors** related to `source_language`

3. **If errors exist:** Review and fix type definitions in `/src/lib/supabase.ts`

#### Verification
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors related to `source_language`

---

### Task 13: Test Constraint Enforcement
**Story Points:** 1
**Priority:** P1 - Recommended
**Dependencies:** Task 11

#### Description
Verify that CHECK constraints properly reject invalid language codes and accept valid ones.

#### Test Cases

1. **Test invalid language code rejection:**
```sql
-- This should FAIL with constraint violation
INSERT INTO items (public_id, name, property_id, source_language)
VALUES ('test-invalid-lang', 'Test Item',
        (SELECT id FROM properties LIMIT 1), 'xx');
-- Expected: ERROR: new row violates check constraint "items_source_language_check"
```

2. **Test valid language codes:**
```sql
-- Test each valid language code
DO $$
DECLARE
    lang VARCHAR(5);
    langs VARCHAR(5)[] := ARRAY['en', 'fr', 'es', 'de', 'nl', 'it'];
    prop_id UUID;
BEGIN
    SELECT id INTO prop_id FROM properties LIMIT 1;

    IF prop_id IS NULL THEN
        RAISE NOTICE 'No properties found, skipping test';
        RETURN;
    END IF;

    FOREACH lang IN ARRAY langs LOOP
        BEGIN
            INSERT INTO items (public_id, name, property_id, source_language)
            VALUES ('test-lang-' || lang, 'Test ' || lang, prop_id, lang);
            RAISE NOTICE 'Language % accepted', lang;
        EXCEPTION WHEN check_violation THEN
            RAISE NOTICE 'Language % REJECTED (unexpected)', lang;
        END;
    END LOOP;
END $$;

-- Clean up test data
DELETE FROM items WHERE public_id LIKE 'test-lang-%';
```

#### Verification
- [ ] Invalid language codes are rejected
- [ ] All 6 valid language codes are accepted

---

## Complete Migration File

For reference, here is the complete migration file that should result from Tasks 1-7:

```sql
-- ===========================================================
-- Migration: Add source_language columns to content tables
-- File: 20260118_add_source_language_columns.sql
-- Generated: 2026-01-18
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-224 (Plan-110, Task 1.2)
-- ===========================================================
--
-- Purpose: Track original language of content for translation workflows
-- This enables the translation system to know which version is authoritative
--
-- Tables affected:
--   1. items - Track source language for item names and descriptions
--   2. item_articles - Track source language for article content
--   3. item_links - Track source language for link titles
--
-- Supported languages: en, fr, es, de, nl, it
-- Default value: 'en' (English)
--
-- ===========================================================

-- ============================================================
-- SECTION 1: Add source_language to items table
-- ============================================================

ALTER TABLE items
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE items
ADD CONSTRAINT items_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 2: Add source_language to item_articles table
-- ============================================================

ALTER TABLE item_articles
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE item_articles
ADD CONSTRAINT item_articles_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 3: Add source_language to item_links table
-- ============================================================

ALTER TABLE item_links
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE item_links
ADD CONSTRAINT item_links_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 4: Create indexes for source_language columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_items_source_language
ON items(source_language);

CREATE INDEX IF NOT EXISTS idx_item_articles_source_language
ON item_articles(source_language);

CREATE INDEX IF NOT EXISTS idx_item_links_source_language
ON item_links(source_language);

-- ============================================================
-- SECTION 5: Column documentation
-- ============================================================

COMMENT ON COLUMN items.source_language IS
  'Original language code (ISO 639-1) of the item content. Defaults to en. Valid: en, fr, es, de, nl, it.';

COMMENT ON COLUMN item_articles.source_language IS
  'Original language code (ISO 639-1) of the article content. Defaults to en. Valid: en, fr, es, de, nl, it.';

COMMENT ON COLUMN item_links.source_language IS
  'Original language code (ISO 639-1) of the link title. Defaults to en. Valid: en, fr, es, de, nl, it.';

-- ============================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- ============================================================
-- WARNING: This will permanently remove source_language data!
--
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
--
-- ============================================================
-- END OF MIGRATION
-- ============================================================
```

---

## Acceptance Criteria Checklist

From REQ-224:

- [x] Items table records indicate their source language
- [x] Item articles table records indicate their source language
- [x] Item links table records indicate their source language
- [x] All existing records show English (`'en'`) as their source language
- [x] New records can specify any valid language code as their source language

From Plan-110 (Task 1.2):

- [x] ALTER items, item_articles, item_links tables with source_language column
- [x] Default to 'en' for existing records
- [x] CHECK constraints limit values to supported languages

---

## Files Modified Summary

### Files to CREATE

| File Path | Task | Description |
|-----------|------|-------------|
| `/database/migrations/20260118_add_source_language_columns.sql` | Tasks 1-7 | Migration file |

### Files to MODIFY

| File Path | Tasks | Changes |
|-----------|-------|---------|
| `/src/lib/supabase.ts` | Tasks 8-10 | Add `source_language` to items, item_articles, item_links types |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Column addition locks table | Low | Medium | PostgreSQL 11+ handles DEFAULT efficiently |
| Existing queries break | Very Low | Low | Adding column with default doesn't affect SELECTs |
| TypeScript type mismatch | Low | Medium | Update types in same session as migration |
| Constraint too restrictive | Low | Low | Only supported languages; matches L10N plan |

---

## Post-Implementation Notes

After completing all tasks:

1. **Next Task:** REQ-225 (Add preferred_language columns to users/accounts)
2. **Related Tasks:** REQ-226 (RLS policies for translation tables)
3. **Documentation:** Update any API documentation that references items/articles/links

---

## Implementation Log (2026-01-18)

### Completed Tasks

| Task | Description | Status | Notes |
|------|-------------|--------|-------|
| Task 1 | Create migration file with header | ✅ | Created `/database/migrations/20260118_add_source_language_columns.sql` |
| Task 2 | Add source_language to items table | ✅ | Column added with default 'en', CHECK constraint added |
| Task 3 | Add source_language to item_articles table | ✅ | Column added with default 'en', CHECK constraint added |
| Task 4 | Add source_language to item_links table | ✅ | Column added with default 'en', CHECK constraint added |
| Task 5 | Create indexes | ✅ | 3 indexes created for source_language columns |
| Task 6 | Add column documentation | ✅ | COMMENT statements added |
| Task 7 | Add rollback script | ✅ | Commented rollback section included |
| Task 8 | Update TypeScript types - items | ✅ | Added `source_language: string | null` to Row/Insert/Update |
| Task 9 | Update TypeScript types - item_articles | ✅ | Added `source_language: string | null` to Row/Insert/Update |
| Task 10 | Update TypeScript types - item_links | ✅ | Added `source_language: string | null` to Row/Insert/Update |
| Task 11 | Run migration on staging | ✅ | Migration applied via Supabase MCP |
| Task 12 | Verify build and type safety | ✅ | `npm run build` passed |
| Task 13 | Test constraint enforcement | ✅ | Invalid 'xx' rejected, all 6 valid codes accepted |

### Database Verification Results

- **Columns created:** 3 (items, item_articles, item_links)
- **Constraints created:** 3 CHECK constraints
- **Indexes created:** 3 indexes
- **Existing records updated:** All records set to default 'en'
  - items: 21/21
  - item_articles: 14/14
  - item_links: 32/32

### Files Modified

1. **Created:** `/database/migrations/20260118_add_source_language_columns.sql`
2. **Modified:** `/src/lib/supabase.ts` - Added `source_language` property to items, item_articles, item_links types

---

## References

- [Overview Document](/docs/REQ-224-add-sourcelanguage-columns-to-existing-tables-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Requirements](/docs/gen_requests.md) - REQ-224
- [Supabase TypeScript Types](/src/lib/supabase.ts)
