# REQ-223: Create Migration File with All Translation Tables - Implementation Overview

**Generated:** 2026-01-17 23:45:00 UTC
**Last Modified:** 2026-01-17 23:45:00 UTC
**Request Reference:** REQ-223 - Localization Database Foundation Schema
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.1)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create the foundational database migration file for the localization (L10N) system. This migration will establish five translation-related tables:

1. **article_translations** - Stores translated versions of item articles (how-to guides, troubleshooting, etc.)
2. **item_translations** - Stores translated item names and descriptions
3. **link_translations** - Stores translated link titles
4. **tag_translations** - Stores translated tag values (system and custom tags)
5. **translation_jobs** - Tracks metadata about translation requests (job queue for async processing)

All tables must include appropriate indexes for performance optimization on language lookups and foreign key relationships.

---

## 2. Current State Analysis

### Existing Database Schema

Based on `/database/schema.sql` and `/src/lib/supabase.ts`:

| Table | Primary Key | Relevant Fields | Notes |
|-------|-------------|-----------------|-------|
| `items` | UUID `id` | `name`, `description`, `property_id` | Source content for item translations |
| `item_articles` | UUID `id` | `title`, `description`, `purpose`, `item_id` | Source content for article translations |
| `item_links` | UUID `id` | `title`, `item_id`, `article_id` | Source content for link translations |
| `users` | UUID `id` | `email`, `full_name` | For `reviewed_by` references |

### Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| UUID Primary Keys | All tables | `gen_random_uuid()` |
| Timestamps | All tables | `created_at`, `updated_at` with `NOW()` default |
| Foreign Key Cascades | `item_links`, `item_articles` | `ON DELETE CASCADE` |
| RLS Policies | All public tables | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| Check Constraints | `item_links` | `CHECK (link_type IN (...))` |

### Migration File Location

Based on the plan and existing structure:
- **Target:** `/database/migrations/20260117_l10n_foundation.sql`
- **Note:** The `/database/migrations/` directory does not currently exist and must be created

---

## 3. Technical Approach

### Schema Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Supported Languages | `en`, `fr`, `es`, `de`, `nl`, `it` | Per PRD - 6 language support |
| Translation Status | `pending`, `processing`, `completed`, `failed`, `manual` | Full lifecycle tracking |
| Language Column Type | `VARCHAR(5)` | BCP-47 format support (e.g., `en`, `fr-CA`) |
| Entity ID Reference | UUID foreign keys | Consistent with existing schema |
| Unique Constraints | `(entity_id, language)` | Prevent duplicate translations |

### Table Design

#### 1. article_translations

Stores translations for `item_articles` content:

```sql
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

#### 2. item_translations

Stores translations for `items` content:

```sql
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

#### 3. link_translations

Stores translations for `item_links` titles:

```sql
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

#### 4. tag_translations

Stores translations for tag values (room tags, category tags, etc.):

```sql
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

#### 5. translation_jobs

Tracks translation job metadata for async processing:

```sql
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

---

## 4. Implementation Tasks

### Task 1.1.1: Create migrations directory

**Action:** Create directory structure
**Path:** `/database/migrations/`

Subtasks:
- [ ] Create `/database/migrations/` directory
- [ ] Verify directory is accessible and empty

### Task 1.1.2: Create migration file with header

**Action:** Create new file
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Content:
```sql
-- L10N Foundation Migration
-- Generated: 2026-01-17
-- Purpose: Create translation tables for multi-language support
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-223

-- This migration creates:
-- 1. article_translations - Translated article content
-- 2. item_translations - Translated item names/descriptions
-- 3. link_translations - Translated link titles
-- 4. tag_translations - Translated tag values
-- 5. translation_jobs - Translation job queue metadata
```

### Task 1.1.3: Add article_translations table

**Action:** Add CREATE TABLE statement
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Subtasks:
- [ ] Create table with all columns per schema above
- [ ] Add CHECK constraints for language and status
- [ ] Add UNIQUE constraint on (article_id, language)
- [ ] Add foreign key to item_articles with CASCADE delete

### Task 1.1.4: Add item_translations table

**Action:** Add CREATE TABLE statement
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Subtasks:
- [ ] Create table with all columns per schema above
- [ ] Add CHECK constraints for language and status
- [ ] Add UNIQUE constraint on (item_id, language)
- [ ] Add foreign key to items with CASCADE delete

### Task 1.1.5: Add link_translations table

**Action:** Add CREATE TABLE statement
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Subtasks:
- [ ] Create table with all columns per schema above
- [ ] Add CHECK constraints for language and status
- [ ] Add UNIQUE constraint on (link_id, language)
- [ ] Add foreign key to item_links with CASCADE delete

### Task 1.1.6: Add tag_translations table

**Action:** Add CREATE TABLE statement
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Subtasks:
- [ ] Create table with all columns per schema above
- [ ] Add CHECK constraint for language
- [ ] Add UNIQUE constraint on (tag_key, language)
- [ ] Add is_system_tag boolean flag

### Task 1.1.7: Add translation_jobs table

**Action:** Add CREATE TABLE statement
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Subtasks:
- [ ] Create table with all columns per schema above
- [ ] Add CHECK constraints for entity_type, languages, and status
- [ ] Add UNIQUE constraint on (entity_type, entity_id, target_language)
- [ ] Add job tracking fields (attempts, error_message, timestamps)

### Task 1.1.8: Create performance indexes

**Action:** Add index statements
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Indexes to create:

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| article_translations | idx_article_trans_article_lang | `article_id, language` | Lookup translations by article |
| article_translations | idx_article_trans_language | `language` | Filter by language |
| article_translations | idx_article_trans_status | `translation_status` | Filter pending translations |
| item_translations | idx_item_trans_item_lang | `item_id, language` | Lookup translations by item |
| item_translations | idx_item_trans_language | `language` | Filter by language |
| item_translations | idx_item_trans_status | `translation_status` | Filter pending translations |
| link_translations | idx_link_trans_link_lang | `link_id, language` | Lookup translations by link |
| link_translations | idx_link_trans_language | `language` | Filter by language |
| tag_translations | idx_tag_trans_key_lang | `tag_key, language` | Lookup tag translations |
| tag_translations | idx_tag_trans_language | `language` | Filter by language |
| tag_translations | idx_tag_trans_system | `is_system_tag` | Filter system tags |
| translation_jobs | idx_trans_jobs_status | `status` | Find queued jobs |
| translation_jobs | idx_trans_jobs_entity | `entity_type, entity_id` | Find jobs by entity |
| translation_jobs | idx_trans_jobs_target | `target_language` | Filter by target language |
| translation_jobs | idx_trans_jobs_created | `created_at` | Order by creation time |

### Task 1.1.9: Add updated_at trigger

**Action:** Create trigger for updated_at columns
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Subtasks:
- [ ] Reuse existing `update_updated_at_column()` function from schema.sql
- [ ] Create triggers for article_translations, item_translations, link_translations

### Task 1.1.10: Add table comments

**Action:** Add documentation comments
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Subtasks:
- [ ] Add COMMENT ON TABLE for each new table
- [ ] Add COMMENT ON COLUMN for key fields (translation_status, is_system_tag, etc.)

### Task 1.1.11: Create rollback section

**Action:** Add rollback SQL in comments
**File:** `/database/migrations/20260117_l10n_foundation.sql`

Content:
```sql
-- ROLLBACK SCRIPT (run manually if needed)
-- DROP TABLE IF EXISTS translation_jobs CASCADE;
-- DROP TABLE IF EXISTS tag_translations CASCADE;
-- DROP TABLE IF EXISTS link_translations CASCADE;
-- DROP TABLE IF EXISTS item_translations CASCADE;
-- DROP TABLE IF EXISTS article_translations CASCADE;
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/database/migrations/` | New migrations directory |
| `/database/migrations/20260117_l10n_foundation.sql` | L10N foundation migration file |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/database/schema.sql` | Existing schema patterns (FK, RLS, triggers) |
| `/src/lib/supabase.ts` | TypeScript types for existing tables |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |

### No Modifications Required

The following files should NOT be modified for this task:
- `/database/schema.sql` (this is a new migration, not modifying existing)
- `/src/lib/supabase.ts` (Task 1.5 will update TypeScript types)
- Any application code (database-only task)

---

## 6. Dependencies

### Database Dependencies

| Table | Dependency Type | Notes |
|-------|-----------------|-------|
| `item_articles` | Foreign Key | Must exist for article_translations |
| `items` | Foreign Key | Must exist for item_translations |
| `item_links` | Foreign Key | Must exist for link_translations |
| `users` | Foreign Key | Optional reference for reviewed_by |

### Function Dependencies

| Function | Location | Usage |
|----------|----------|-------|
| `gen_random_uuid()` | PostgreSQL built-in | UUID generation |
| `update_updated_at_column()` | `/database/schema.sql` | Trigger function |

---

## 7. Acceptance Criteria

From REQ-223 and Plan-110:

- [ ] Migration file creates five translation-related tables: article_translations, item_translations, link_translations, tag_translations, and translation_jobs
- [ ] Each translation table references its source entity and includes language column, translated content fields, and timestamps
- [ ] The translation_jobs table tracks metadata about translation requests including status, source/target languages, and attempts
- [ ] Database indexes are created on language columns for efficient query performance
- [ ] Database indexes are created on foreign key columns to optimize lookup of translations for specific content
- [ ] Check constraints limit language values to: `en`, `fr`, `es`, `de`, `nl`, `it`
- [ ] Check constraints limit status values appropriately per table
- [ ] Unique constraints prevent duplicate translations for same entity/language combination
- [ ] The migration can be applied successfully to both local development and staging environments
- [ ] The migration is reversible with a proper rollback script that removes all created tables and indexes

---

## 8. Testing Strategy

### Pre-Deployment Verification

1. **Syntax Check:**
   ```bash
   # Validate SQL syntax (local PostgreSQL)
   psql -h localhost -d faqbnb_test -f database/migrations/20260117_l10n_foundation.sql --echo-errors
   ```

2. **Apply to Local/Staging:**
   - Apply migration via Supabase SQL Editor
   - Verify all tables created successfully
   - Verify all indexes created

### Post-Deployment Verification

3. **Table Existence Check:**
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
   );
   -- Expected: 5 rows
   ```

4. **Index Verification:**
   ```sql
   SELECT indexname
   FROM pg_indexes
   WHERE tablename LIKE '%_translations'
     OR tablename = 'translation_jobs';
   ```

5. **Constraint Verification:**
   ```sql
   -- Test language constraint
   INSERT INTO item_translations (item_id, language, name)
   VALUES ('00000000-0000-0000-0000-000000000000', 'xx', 'Test');
   -- Expected: ERROR (check constraint violation)

   -- Test status constraint
   INSERT INTO item_translations (item_id, language, name, translation_status)
   VALUES ('00000000-0000-0000-0000-000000000000', 'en', 'Test', 'invalid');
   -- Expected: ERROR (check constraint violation)
   ```

6. **Foreign Key Cascade Test:**
   ```sql
   -- Create test item, then translation, then delete item
   -- Translation should be deleted automatically
   ```

### Rollback Testing

7. **Rollback Verification:**
   - Run rollback script on test environment
   - Verify all tables removed
   - Verify all indexes removed

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FK references non-existent items | Low | High | Run on clean staging first; existing tables verified |
| Large migration blocks production | Low | Medium | Apply during low-traffic period |
| Index creation slow on large tables | N/A | N/A | New empty tables, no existing data |
| Syntax errors in SQL | Medium | Low | Test locally before staging |
| Missing update_updated_at function | Low | Medium | Verify function exists or include in migration |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create directory structure | 2 min |
| Write table definitions | 30 min |
| Write index definitions | 15 min |
| Write triggers and comments | 10 min |
| Write rollback script | 5 min |
| Local testing | 15 min |
| Staging deployment | 10 min |
| **Total** | **~90 min** |

---

## 11. Complete Migration File Structure

```sql
-- ===========================================================
-- L10N Foundation Migration
-- File: /database/migrations/20260117_l10n_foundation.sql
-- ===========================================================

-- Header and documentation
-- ...

-- ============ TABLE DEFINITIONS ============

-- 1. article_translations
CREATE TABLE article_translations (...);

-- 2. item_translations
CREATE TABLE item_translations (...);

-- 3. link_translations
CREATE TABLE link_translations (...);

-- 4. tag_translations
CREATE TABLE tag_translations (...);

-- 5. translation_jobs
CREATE TABLE translation_jobs (...);

-- ============ INDEXES ============

-- article_translations indexes
CREATE INDEX idx_article_trans_article_lang ...;
CREATE INDEX idx_article_trans_language ...;
CREATE INDEX idx_article_trans_status ...;

-- item_translations indexes
CREATE INDEX idx_item_trans_item_lang ...;
CREATE INDEX idx_item_trans_language ...;
CREATE INDEX idx_item_trans_status ...;

-- link_translations indexes
CREATE INDEX idx_link_trans_link_lang ...;
CREATE INDEX idx_link_trans_language ...;

-- tag_translations indexes
CREATE INDEX idx_tag_trans_key_lang ...;
CREATE INDEX idx_tag_trans_language ...;
CREATE INDEX idx_tag_trans_system ...;

-- translation_jobs indexes
CREATE INDEX idx_trans_jobs_status ...;
CREATE INDEX idx_trans_jobs_entity ...;
CREATE INDEX idx_trans_jobs_target ...;
CREATE INDEX idx_trans_jobs_created ...;

-- ============ TRIGGERS ============

CREATE TRIGGER update_article_translations_updated_at ...;
CREATE TRIGGER update_item_translations_updated_at ...;
CREATE TRIGGER update_link_translations_updated_at ...;

-- ============ COMMENTS ============

COMMENT ON TABLE article_translations IS '...';
COMMENT ON TABLE item_translations IS '...';
-- etc.

-- ============ ROLLBACK (commented) ============
-- DROP TABLE IF EXISTS translation_jobs CASCADE;
-- DROP TABLE IF EXISTS tag_translations CASCADE;
-- ...
```

---

## 12. Next Steps After Implementation

After completing Task 1.1 (this task):

1. **Task 1.2:** Add source_language columns to existing tables (items, item_articles, item_links)
2. **Task 1.3:** Add preferred_language columns to users and accounts tables
3. **Task 1.4:** Implement RLS policies for translation tables
4. **Task 1.5:** Update TypeScript database types in `/src/lib/supabase.ts`
5. **Task 1.6:** Seed system tag translations

---

## References

- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Existing Schema](/database/schema.sql)
- [Supabase TypeScript Types](/src/lib/supabase.ts)
