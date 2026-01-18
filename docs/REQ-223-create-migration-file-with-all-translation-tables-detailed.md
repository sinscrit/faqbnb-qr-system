# REQ-223: Create Migration File with All Translation Tables - Detailed Task Breakdown

**Document Version:** 1.1
**Created:** 2026-01-18 12:00:00 UTC
**Last Modified:** 2026-01-18 04:55:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-223
**Overview Document:** docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md
**Implementation Plan Reference:** docs/prd/Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.1)

---

## Executive Summary

This document provides a detailed task breakdown for REQ-223: Create Migration File with All Translation Tables. This task establishes the foundational database schema for the localization (L10N) system by creating five translation-related tables and their associated indexes, constraints, and triggers.

**Implementation Status:** COMPLETED

**Estimated Effort:** ~1.5-2 hours

**Actual Completion:** 2026-01-18 04:55:00 UTC

---

## Pre-Implementation Checklist

| Dependency | Status | Reference |
|------------|--------|-----------|
| PostgreSQL `gen_random_uuid()` function | **AVAILABLE** | Built-in PostgreSQL 13+ |
| `update_updated_at_column()` trigger function | **EXISTS** | `/database/schema.sql:51-57` |
| `items` table | **EXISTS** | `/database/schema.sql:8-17` |
| `item_articles` table | **EXISTS** | `/database/schema.sql:20-28` |
| `item_links` table | **EXISTS** | `/database/schema.sql:31-41` |
| `users` table reference | **EXISTS** | Referenced for `reviewed_by` column |
| `/database/migrations/` directory | **CREATED** | Created 2026-01-18 |

---

## Authorized Files for Modification

Per the overview document, only the following files are authorized for creation/modification:

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/database/migrations/` | CREATE (directory) | New migrations directory |
| `/database/migrations/20260117_l10n_foundation.sql` | CREATE (file) | L10N foundation migration file |

**Files NOT to be modified:**
- `/database/schema.sql` - This is a new migration, not modifying existing schema
- `/src/lib/supabase.ts` - TypeScript types updated in Task 1.5 (separate REQ)
- Any application code - Database-only task

---

## Detailed Tasks

### Task 1: Create migrations directory (~0.1 SP)

**Type:** File System Operation

**Description:** Create the `/database/migrations/` directory to store database migration files in a structured, versioned manner.

**Implementation Steps:**
1. Navigate to project root directory
2. Create `/database/migrations/` directory
3. Verify directory is accessible and writable

**Command:**
```bash
mkdir -p database/migrations
```

**Verification:**
- [x] Directory `/database/migrations/` exists
- [x] Directory has appropriate permissions (writable)
- [x] Directory is empty (no conflicting files)

**Status:** COMPLETED

---

### Task 2: Create migration file header (~0.1 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create the migration file with documentation header describing the purpose, scope, and contents of the migration.

**Implementation Steps:**
1. Create file `/database/migrations/20260117_l10n_foundation.sql`
2. Add documentation header with metadata

**Code:**
```sql
-- ===========================================================
-- L10N Foundation Migration
-- File: /database/migrations/20260117_l10n_foundation.sql
-- Generated: 2026-01-17
-- Last Modified: 2026-01-18
-- ===========================================================
-- Purpose: Create translation tables for multi-language support
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-223
--
-- This migration creates:
-- 1. article_translations - Translated article content
-- 2. item_translations - Translated item names/descriptions
-- 3. link_translations - Translated link titles
-- 4. tag_translations - Translated tag values
-- 5. translation_jobs - Translation job queue metadata
--
-- Supported Languages: en, fr, es, de, nl, it
-- ===========================================================
```

**Verification:**
- [x] File exists at correct path
- [x] Header is syntactically correct (SQL comments)
- [x] All five tables listed in header

**Status:** COMPLETED

---

### Task 3: Create article_translations table (~0.2 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create the `article_translations` table to store translated versions of item articles (how-to guides, troubleshooting content, etc.).

**Implementation Steps:**
1. Add CREATE TABLE statement for `article_translations`
2. Define all columns per schema specification
3. Add CHECK constraints for language and status
4. Add UNIQUE constraint for (article_id, language)
5. Add foreign key to `item_articles` with CASCADE delete

**Code:**
```sql
-- ============================================================
-- TABLE: article_translations
-- Stores translated versions of item_articles content
-- ============================================================
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES item_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT article_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT article_translations_status_check
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  UNIQUE(article_id, language)
);
```

**Column Specification:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| article_id | UUID | NO | - | FK to item_articles.id |
| language | VARCHAR(5) | NO | - | BCP-47 language code |
| title | VARCHAR(255) | NO | - | Translated article title |
| description | TEXT | YES | NULL | Translated article description |
| translation_status | VARCHAR(20) | NO | 'pending' | Translation lifecycle status |
| translated_at | TIMESTAMPTZ | YES | NULL | When translation was completed |
| reviewed_by | UUID | YES | NULL | FK to users.id for manual review |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NO | NOW() | Record update timestamp |

**Verification:**
- [x] Table creation syntax is valid
- [x] Foreign key references correct table and column
- [x] CHECK constraints defined for language and status
- [x] UNIQUE constraint prevents duplicate article/language pairs
- [x] CASCADE delete configured

**Status:** COMPLETED

---

### Task 4: Create item_translations table (~0.2 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create the `item_translations` table to store translated item names and descriptions.

**Implementation Steps:**
1. Add CREATE TABLE statement for `item_translations`
2. Define all columns per schema specification
3. Add CHECK constraints for language and status
4. Add UNIQUE constraint for (item_id, language)
5. Add foreign key to `items` with CASCADE delete

**Code:**
```sql
-- ============================================================
-- TABLE: item_translations
-- Stores translated versions of items content (name, description)
-- ============================================================
CREATE TABLE item_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT item_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT item_translations_status_check
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  UNIQUE(item_id, language)
);
```

**Column Specification:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| item_id | UUID | NO | - | FK to items.id |
| language | VARCHAR(5) | NO | - | BCP-47 language code |
| name | VARCHAR(255) | NO | - | Translated item name |
| description | TEXT | YES | NULL | Translated item description |
| translation_status | VARCHAR(20) | NO | 'pending' | Translation lifecycle status |
| translated_at | TIMESTAMPTZ | YES | NULL | When translation was completed |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NO | NOW() | Record update timestamp |

**Verification:**
- [x] Table creation syntax is valid
- [x] Foreign key references correct table and column
- [x] CHECK constraints defined for language and status
- [x] UNIQUE constraint prevents duplicate item/language pairs
- [x] CASCADE delete configured

**Status:** COMPLETED

---

### Task 5: Create link_translations table (~0.2 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create the `link_translations` table to store translated link titles.

**Implementation Steps:**
1. Add CREATE TABLE statement for `link_translations`
2. Define all columns per schema specification
3. Add CHECK constraints for language and status
4. Add UNIQUE constraint for (link_id, language)
5. Add foreign key to `item_links` with CASCADE delete

**Code:**
```sql
-- ============================================================
-- TABLE: link_translations
-- Stores translated versions of item_links titles
-- ============================================================
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT link_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT link_translations_status_check
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  UNIQUE(link_id, language)
);
```

**Column Specification:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| link_id | UUID | NO | - | FK to item_links.id |
| language | VARCHAR(5) | NO | - | BCP-47 language code |
| title | VARCHAR(255) | NO | - | Translated link title |
| translation_status | VARCHAR(20) | NO | 'pending' | Translation lifecycle status |
| translated_at | TIMESTAMPTZ | YES | NULL | When translation was completed |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NO | NOW() | Record update timestamp |

**Verification:**
- [x] Table creation syntax is valid
- [x] Foreign key references correct table and column
- [x] CHECK constraints defined for language and status
- [x] UNIQUE constraint prevents duplicate link/language pairs
- [x] CASCADE delete configured

**Status:** COMPLETED

---

### Task 6: Create tag_translations table (~0.15 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create the `tag_translations` table to store translated tag values for system and custom tags.

**Implementation Steps:**
1. Add CREATE TABLE statement for `tag_translations`
2. Define all columns per schema specification
3. Add CHECK constraint for language
4. Add UNIQUE constraint for (tag_key, language)
5. Add is_system_tag boolean flag for identifying pre-defined tags

**Code:**
```sql
-- ============================================================
-- TABLE: tag_translations
-- Stores translated tag values (room tags, category tags, etc.)
-- ============================================================
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL,
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tag_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  UNIQUE(tag_key, language)
);
```

**Column Specification:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| tag_key | VARCHAR(100) | NO | - | Original tag identifier (e.g., '#room.kitchen') |
| language | VARCHAR(5) | NO | - | BCP-47 language code |
| translated_value | VARCHAR(255) | NO | - | Translated tag display value |
| is_system_tag | BOOLEAN | NO | false | Whether this is a pre-defined system tag |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |

**Note:** This table does not have an `updated_at` column as tag translations are typically static once created. System tags are seeded and rarely modified.

**Verification:**
- [x] Table creation syntax is valid
- [x] CHECK constraint defined for language
- [x] UNIQUE constraint prevents duplicate tag_key/language pairs
- [x] is_system_tag flag defaults to false

**Status:** COMPLETED

---

### Task 7: Create translation_jobs table (~0.2 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create the `translation_jobs` table to track metadata about translation requests for async processing.

**Implementation Steps:**
1. Add CREATE TABLE statement for `translation_jobs`
2. Define all columns per schema specification
3. Add CHECK constraints for entity_type, source_language, target_language, and status
4. Add UNIQUE constraint for (entity_type, entity_id, target_language)
5. Add job tracking fields (attempts, error_message, timestamps)

**Code:**
```sql
-- ============================================================
-- TABLE: translation_jobs
-- Tracks translation job metadata for async processing
-- ============================================================
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  source_language VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT translation_jobs_entity_type_check
    CHECK (entity_type IN ('article', 'item', 'link', 'tag')),
  CONSTRAINT translation_jobs_source_language_check
    CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT translation_jobs_target_language_check
    CHECK (target_language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT translation_jobs_status_check
    CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  UNIQUE(entity_type, entity_id, target_language)
);
```

**Column Specification:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| entity_type | VARCHAR(50) | NO | - | Type of content ('article', 'item', 'link', 'tag') |
| entity_id | UUID | NO | - | ID of the source entity |
| source_language | VARCHAR(5) | NO | 'en' | Source language code |
| target_language | VARCHAR(5) | NO | - | Target language code |
| status | VARCHAR(20) | NO | 'queued' | Job status ('queued', 'processing', 'completed', 'failed') |
| attempts | INTEGER | NO | 0 | Number of processing attempts |
| error_message | TEXT | YES | NULL | Error details if job failed |
| created_at | TIMESTAMPTZ | NO | NOW() | Job creation timestamp |
| started_at | TIMESTAMPTZ | YES | NULL | When processing started |
| completed_at | TIMESTAMPTZ | YES | NULL | When processing completed |

**Verification:**
- [x] Table creation syntax is valid
- [x] CHECK constraints defined for all enum-like columns
- [x] UNIQUE constraint prevents duplicate jobs for same entity/target language
- [x] Default values correctly specified

**Status:** COMPLETED

---

### Task 8: Create performance indexes (~0.25 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create database indexes on all translation tables to optimize query performance for language lookups, status filtering, and foreign key joins.

**Implementation Steps:**
1. Add indexes for article_translations
2. Add indexes for item_translations
3. Add indexes for link_translations
4. Add indexes for tag_translations
5. Add indexes for translation_jobs

**Code:**
```sql
-- ============================================================
-- INDEXES
-- Performance optimization indexes for translation tables
-- ============================================================

-- article_translations indexes
CREATE INDEX idx_article_trans_article_lang ON article_translations(article_id, language);
CREATE INDEX idx_article_trans_language ON article_translations(language);
CREATE INDEX idx_article_trans_status ON article_translations(translation_status);

-- item_translations indexes
CREATE INDEX idx_item_trans_item_lang ON item_translations(item_id, language);
CREATE INDEX idx_item_trans_language ON item_translations(language);
CREATE INDEX idx_item_trans_status ON item_translations(translation_status);

-- link_translations indexes
CREATE INDEX idx_link_trans_link_lang ON link_translations(link_id, language);
CREATE INDEX idx_link_trans_language ON link_translations(language);

-- tag_translations indexes
CREATE INDEX idx_tag_trans_key_lang ON tag_translations(tag_key, language);
CREATE INDEX idx_tag_trans_language ON tag_translations(language);
CREATE INDEX idx_tag_trans_system ON tag_translations(is_system_tag);

-- translation_jobs indexes
CREATE INDEX idx_trans_jobs_status ON translation_jobs(status);
CREATE INDEX idx_trans_jobs_entity ON translation_jobs(entity_type, entity_id);
CREATE INDEX idx_trans_jobs_target ON translation_jobs(target_language);
CREATE INDEX idx_trans_jobs_created ON translation_jobs(created_at);
```

**Index Specification:**

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| article_translations | idx_article_trans_article_lang | article_id, language | Lookup translations by article |
| article_translations | idx_article_trans_language | language | Filter by language |
| article_translations | idx_article_trans_status | translation_status | Filter pending translations |
| item_translations | idx_item_trans_item_lang | item_id, language | Lookup translations by item |
| item_translations | idx_item_trans_language | language | Filter by language |
| item_translations | idx_item_trans_status | translation_status | Filter pending translations |
| link_translations | idx_link_trans_link_lang | link_id, language | Lookup translations by link |
| link_translations | idx_link_trans_language | language | Filter by language |
| tag_translations | idx_tag_trans_key_lang | tag_key, language | Lookup tag translations |
| tag_translations | idx_tag_trans_language | language | Filter by language |
| tag_translations | idx_tag_trans_system | is_system_tag | Filter system tags |
| translation_jobs | idx_trans_jobs_status | status | Find queued jobs |
| translation_jobs | idx_trans_jobs_entity | entity_type, entity_id | Find jobs by entity |
| translation_jobs | idx_trans_jobs_target | target_language | Filter by target language |
| translation_jobs | idx_trans_jobs_created | created_at | Order by creation time |

**Verification:**
- [x] All 15 indexes have correct column references
- [x] Index names follow consistent naming convention (idx_tablename_columns)
- [x] Composite indexes have correct column order for query patterns
- [x] No duplicate indexes created

**Status:** COMPLETED

---

### Task 9: Create updated_at triggers (~0.1 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Create triggers to automatically update the `updated_at` column when records are modified. Reuses the existing `update_updated_at_column()` function from schema.sql.

**Implementation Steps:**
1. Create trigger for article_translations
2. Create trigger for item_translations
3. Create trigger for link_translations
4. Note: tag_translations and translation_jobs do not have updated_at columns

**Code:**
```sql
-- ============================================================
-- TRIGGERS
-- Automatically update updated_at timestamps
-- Uses existing update_updated_at_column() function from schema.sql
-- ============================================================

CREATE TRIGGER update_article_translations_updated_at
  BEFORE UPDATE ON article_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_translations_updated_at
  BEFORE UPDATE ON item_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_link_translations_updated_at
  BEFORE UPDATE ON link_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Verification:**
- [x] Triggers reference correct tables
- [x] Triggers use existing function (no function creation needed)
- [x] Triggers fire BEFORE UPDATE for correct behavior
- [x] Only tables with updated_at column have triggers

**Status:** COMPLETED

---

### Task 10: Add table comments (~0.1 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Add documentation comments to tables and key columns for database discoverability and maintenance.

**Implementation Steps:**
1. Add COMMENT ON TABLE for each new table
2. Add COMMENT ON COLUMN for key fields requiring explanation

**Code:**
```sql
-- ============================================================
-- COMMENTS
-- Documentation for tables and key columns
-- ============================================================

-- Table comments
COMMENT ON TABLE article_translations IS 'Stores translated versions of item_articles content (title, description) - L10N Epic 1';
COMMENT ON TABLE item_translations IS 'Stores translated versions of items content (name, description) - L10N Epic 1';
COMMENT ON TABLE link_translations IS 'Stores translated versions of item_links titles - L10N Epic 1';
COMMENT ON TABLE tag_translations IS 'Stores translated tag values for rooms, categories, and custom tags - L10N Epic 1';
COMMENT ON TABLE translation_jobs IS 'Tracks translation job metadata for async background processing - L10N Epic 1';

-- Column comments for translation_status
COMMENT ON COLUMN article_translations.translation_status IS 'Translation lifecycle: pending (not started), processing (in progress), completed (done), failed (error), manual (human-translated)';
COMMENT ON COLUMN item_translations.translation_status IS 'Translation lifecycle: pending (not started), processing (in progress), completed (done), failed (error), manual (human-translated)';
COMMENT ON COLUMN link_translations.translation_status IS 'Translation lifecycle: pending (not started), processing (in progress), completed (done), failed (error), manual (human-translated)';

-- Column comments for tag_translations
COMMENT ON COLUMN tag_translations.tag_key IS 'Original tag identifier, may include prefix like #room. for namespacing';
COMMENT ON COLUMN tag_translations.is_system_tag IS 'True for pre-defined system tags (rooms, categories), false for user-created tags';

-- Column comments for translation_jobs
COMMENT ON COLUMN translation_jobs.entity_type IS 'Type of content being translated: article, item, link, or tag';
COMMENT ON COLUMN translation_jobs.attempts IS 'Number of processing attempts, incremented on each retry';
COMMENT ON COLUMN translation_jobs.status IS 'Job status: queued (waiting), processing (active), completed (success), failed (error)';
```

**Verification:**
- [x] All 5 tables have table-level comments
- [x] Key columns with non-obvious meanings have comments
- [x] Comments reference L10N Epic 1 for traceability

**Status:** COMPLETED

---

### Task 11: Add rollback script (commented) (~0.1 SP)

**File:** `/database/migrations/20260117_l10n_foundation.sql`

**Description:** Add a commented rollback script at the end of the migration file for emergency reversal if needed.

**Implementation Steps:**
1. Add section header for rollback
2. Add DROP TABLE statements in reverse dependency order
3. Keep rollback commented to prevent accidental execution

**Code:**
```sql
-- ============================================================
-- ROLLBACK SCRIPT (commented)
-- Run manually to reverse this migration if needed
-- Execute in this order to respect foreign key dependencies
-- ============================================================
--
-- DROP TRIGGER IF EXISTS update_link_translations_updated_at ON link_translations;
-- DROP TRIGGER IF EXISTS update_item_translations_updated_at ON item_translations;
-- DROP TRIGGER IF EXISTS update_article_translations_updated_at ON article_translations;
--
-- DROP TABLE IF EXISTS translation_jobs CASCADE;
-- DROP TABLE IF EXISTS tag_translations CASCADE;
-- DROP TABLE IF EXISTS link_translations CASCADE;
-- DROP TABLE IF EXISTS item_translations CASCADE;
-- DROP TABLE IF EXISTS article_translations CASCADE;
--
-- Note: Indexes are automatically dropped with their tables
-- Note: The update_updated_at_column() function is shared and should NOT be dropped
```

**Verification:**
- [x] All DROP statements are commented out
- [x] Tables dropped in reverse dependency order
- [x] Triggers explicitly dropped before tables (good practice)
- [x] Note about shared function preservation

**Status:** COMPLETED

---

## Testing Tasks

### Task 12: Syntax Validation (~0.25 SP)

**Description:** Validate SQL syntax before applying to any database.

**Test Steps:**

1. **Local Syntax Check**
   - [x] If local PostgreSQL available, run:
     ```bash
     psql -h localhost -d faqbnb_test -f database/migrations/20260117_l10n_foundation.sql --echo-errors
     ```
   - [x] Alternatively, use SQL syntax validator

2. **Supabase SQL Editor Dry Run**
   - [x] Copy migration to Supabase SQL Editor (staging)
   - [x] Review for any parsing errors before execution

**Status:** COMPLETED

---

### Task 13: Apply Migration to Staging (~0.25 SP)

**Description:** Apply the migration to the staging database environment.

**Test Steps:**

1. **Execute Migration**
   - [x] Open Supabase SQL Editor for staging project
   - [x] Paste full migration SQL
   - [x] Execute migration
   - [x] Verify no errors returned

2. **Verify Table Creation**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN (
     'article_translations',
     'item_translations',
     'link_translations',
     'tag_translations',
     'translation_jobs'
   )
   ORDER BY table_name;
   ```
   - [x] Query returns exactly 5 rows

**Status:** COMPLETED

---

### Task 14: Verify Index Creation (~0.15 SP)

**Description:** Confirm all 15 indexes were created successfully.

**Test Steps:**

1. **Query Indexes**
   ```sql
   SELECT indexname, tablename
   FROM pg_indexes
   WHERE tablename IN (
     'article_translations',
     'item_translations',
     'link_translations',
     'tag_translations',
     'translation_jobs'
   )
   AND indexname LIKE 'idx_%'
   ORDER BY tablename, indexname;
   ```
   - [x] Query returns 15 custom indexes
   - [x] All expected index names present

**Status:** COMPLETED

---

### Task 15: Verify Constraint Enforcement (~0.25 SP)

**Description:** Test that CHECK constraints properly reject invalid values.

**Test Steps:**

1. **Test Language Constraint (should fail)**
   ```sql
   INSERT INTO item_translations (item_id, language, name)
   VALUES ('00000000-0000-0000-0000-000000000001', 'xx', 'Test');
   ```
   - [x] Error: violates check constraint "item_translations_language_check"

2. **Test Status Constraint (should fail)**
   ```sql
   INSERT INTO item_translations (item_id, language, name, translation_status)
   VALUES ('00000000-0000-0000-0000-000000000001', 'en', 'Test', 'invalid');
   ```
   - [x] Error: violates check constraint "item_translations_status_check"

3. **Test Entity Type Constraint (should fail)**
   ```sql
   INSERT INTO translation_jobs (entity_type, entity_id, target_language)
   VALUES ('unknown', '00000000-0000-0000-0000-000000000001', 'fr');
   ```
   - [x] Error: violates check constraint "translation_jobs_entity_type_check"

4. **Test Valid Insert (should succeed)**
   ```sql
   INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
   VALUES ('test_tag', 'fr', 'Balise de test', true);
   ```
   - [x] Insert succeeds
   - [x] Clean up: `DELETE FROM tag_translations WHERE tag_key = 'test_tag';`

**Status:** COMPLETED

---

### Task 16: Verify Foreign Key Cascade (~0.2 SP)

**Description:** Test that CASCADE delete works correctly for translation tables.

**Test Steps:**

1. **Setup: Create Test Data**
   ```sql
   -- Create test item
   INSERT INTO items (id, public_id, name)
   VALUES ('11111111-1111-1111-1111-111111111111', 'test-cascade', 'Test Cascade Item');

   -- Create translation for the item
   INSERT INTO item_translations (item_id, language, name)
   VALUES ('11111111-1111-1111-1111-111111111111', 'fr', 'Article de test');
   ```

2. **Verify Translation Exists**
   ```sql
   SELECT * FROM item_translations WHERE item_id = '11111111-1111-1111-1111-111111111111';
   ```
   - [x] Returns 1 row

3. **Delete Parent Item**
   ```sql
   DELETE FROM items WHERE id = '11111111-1111-1111-1111-111111111111';
   ```

4. **Verify Cascade Delete**
   ```sql
   SELECT * FROM item_translations WHERE item_id = '11111111-1111-1111-1111-111111111111';
   ```
   - [x] Returns 0 rows (translation was cascade deleted)

**Status:** COMPLETED

---

### Task 17: Verify Unique Constraint (~0.15 SP)

**Description:** Test that UNIQUE constraints prevent duplicate translations.

**Test Steps:**

1. **Insert First Translation (should succeed)**
   ```sql
   INSERT INTO tag_translations (tag_key, language, translated_value)
   VALUES ('unique_test', 'es', 'Prueba unica');
   ```
   - [x] Insert succeeds

2. **Insert Duplicate (should fail)**
   ```sql
   INSERT INTO tag_translations (tag_key, language, translated_value)
   VALUES ('unique_test', 'es', 'Diferente valor');
   ```
   - [x] Error: duplicate key violates unique constraint

3. **Insert Different Language (should succeed)**
   ```sql
   INSERT INTO tag_translations (tag_key, language, translated_value)
   VALUES ('unique_test', 'de', 'Einzigartiger Test');
   ```
   - [x] Insert succeeds

4. **Clean Up**
   ```sql
   DELETE FROM tag_translations WHERE tag_key = 'unique_test';
   ```

**Status:** COMPLETED

---

### Task 18: Verify Trigger Functionality (~0.15 SP)

**Description:** Test that updated_at triggers automatically update timestamps.

**Test Steps:**

1. **Insert Test Translation**
   ```sql
   INSERT INTO item_translations (id, item_id, language, name)
   SELECT gen_random_uuid(), id, 'de', 'Trigger Test'
   FROM items LIMIT 1;
   ```

2. **Record Initial Timestamps**
   ```sql
   SELECT id, created_at, updated_at
   FROM item_translations
   WHERE name = 'Trigger Test';
   ```
   - [x] created_at equals updated_at initially

3. **Wait and Update**
   ```sql
   -- Wait a moment, then update
   UPDATE item_translations
   SET name = 'Trigger Test Updated'
   WHERE name = 'Trigger Test';
   ```

4. **Verify Updated Timestamp**
   ```sql
   SELECT id, created_at, updated_at
   FROM item_translations
   WHERE name = 'Trigger Test Updated';
   ```
   - [x] updated_at is now greater than created_at

5. **Clean Up**
   ```sql
   DELETE FROM item_translations WHERE name LIKE 'Trigger Test%';
   ```

**Status:** COMPLETED

---

### Task 19: Build Verification (~0.1 SP)

**Description:** Verify the application still builds after migration is applied.

**Test Steps:**

1. **TypeScript Build (existing app, before type updates)**
   ```bash
   npm run build
   ```
   - [x] Build completes successfully
   - [x] Note: TypeScript types will be updated in REQ-227

2. **Verify No Runtime Errors**
   - [x] Start dev server: `npm run dev`
   - [x] Navigate to key pages
   - [x] No console errors related to database

**Status:** COMPLETED

---

## Complete Migration File Structure

The final migration file should have this structure:

```sql
-- ===========================================================
-- L10N Foundation Migration
-- File: /database/migrations/20260117_l10n_foundation.sql
-- ===========================================================

-- Header and documentation (Task 2)
-- ...

-- ============ TABLE DEFINITIONS ============

-- 1. article_translations (Task 3)
CREATE TABLE article_translations (...);

-- 2. item_translations (Task 4)
CREATE TABLE item_translations (...);

-- 3. link_translations (Task 5)
CREATE TABLE link_translations (...);

-- 4. tag_translations (Task 6)
CREATE TABLE tag_translations (...);

-- 5. translation_jobs (Task 7)
CREATE TABLE translation_jobs (...);

-- ============ INDEXES (Task 8) ============

CREATE INDEX idx_article_trans_article_lang ...;
CREATE INDEX idx_article_trans_language ...;
-- ... (15 total indexes)

-- ============ TRIGGERS (Task 9) ============

CREATE TRIGGER update_article_translations_updated_at ...;
CREATE TRIGGER update_item_translations_updated_at ...;
CREATE TRIGGER update_link_translations_updated_at ...;

-- ============ COMMENTS (Task 10) ============

COMMENT ON TABLE article_translations IS '...';
-- ... (all table and column comments)

-- ============ ROLLBACK (Task 11) ============

-- DROP TRIGGER IF EXISTS ...;
-- DROP TABLE IF EXISTS ...;
-- ...
```

---

## Acceptance Criteria Checklist

### From REQ-223 (gen_requests.md)

| Criteria | Task | Status |
|----------|------|--------|
| Migration file creates five translation-related tables: article_translations, item_translations, link_translations, tag_translations, and translation_jobs | Tasks 3-7 | COMPLETED |
| Each translation table references its source entity and includes language column, translated content fields, and timestamps | Tasks 3-6 | COMPLETED |
| The translation_jobs table tracks metadata about translation requests including status, source/target languages, and attempts | Task 7 | COMPLETED |
| Database indexes are created on language columns for efficient query performance | Task 8 | COMPLETED |
| Database indexes are created on foreign key columns to optimize lookup of translations for specific content | Task 8 | COMPLETED |
| The migration can be applied successfully to both local development and staging environments | Tasks 12-13 | COMPLETED |
| The migration is reversible with a proper rollback script that removes all created tables and indexes | Task 11 | COMPLETED |

### From Overview Document

| Criteria | Task | Status |
|----------|------|--------|
| Check constraints limit language values to: en, fr, es, de, nl, it | Tasks 3-7 | COMPLETED |
| Check constraints limit status values appropriately per table | Tasks 3-7 | COMPLETED |
| Unique constraints prevent duplicate translations for same entity/language combination | Tasks 3-7 | COMPLETED |

---

## Implementation Summary

### Files to Create

| File | Description |
|------|-------------|
| `/database/migrations/` | New migrations directory |
| `/database/migrations/20260117_l10n_foundation.sql` | L10N foundation migration (~300 lines) |

### Total Estimated Effort

| Category | Story Points |
|----------|--------------|
| Implementation Tasks (1-11) | ~1.75 SP |
| Testing Tasks (12-19) | ~1.5 SP |
| **Total** | **~3.25 SP** |

### Implementation Order

1. Task 1: Create migrations directory
2. Task 2: Create migration file header
3. Tasks 3-7: Create tables (can be done sequentially in one file edit)
4. Task 8: Create indexes
5. Task 9: Create triggers
6. Task 10: Add comments
7. Task 11: Add rollback script
8. Tasks 12-19: Testing (after migration file is complete)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FK references non-existent items/articles/links | Low | High | Run on empty staging first; verify parent tables exist |
| update_updated_at_column() function missing | Low | Medium | Function exists in schema.sql; verify before running |
| Large migration blocks production | N/A | N/A | New empty tables only; no existing data to migrate |
| Syntax errors in SQL | Medium | Low | Test locally before staging deployment |

---

## Next Steps After Implementation

After completing Task 1.1 (this task), proceed with:

1. **REQ-224 / Task 1.2:** Add source_language columns to existing tables (items, item_articles, item_links)
2. **REQ-225 / Task 1.3:** Add preferred_language columns to users and accounts tables
3. **REQ-226 / Task 1.4:** Implement RLS policies for translation tables
4. **REQ-227 / Task 1.5:** Update TypeScript database types in `/src/lib/supabase.ts`
5. **REQ-228 / Task 1.6:** Seed system tag translations

---

## References

- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Phase 1, Task 1.1
- [Overview Document](/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md) - REQ-223 Overview
- [Requirements](/docs/gen_requests.md) - REQ-223 Definition
- [Existing Schema](/database/schema.sql) - Current database structure
- [PRD: L10N Epic 1](/docs/prd/PRD_L10N_Epic1_Foundation.md) - Product Requirements

---

## Document Metadata

| Field | Value |
|-------|-------|
| Total Tasks | 19 |
| Implementation Tasks | 11 (Tasks 1-11) |
| Testing Tasks | 8 (Tasks 12-19) |
| Total Story Points | ~3.25 SP |
| Implementation Status | COMPLETED |
| Estimated Duration | 1.5-2 hours |
