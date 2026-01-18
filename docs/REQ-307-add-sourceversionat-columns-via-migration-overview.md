# REQ-307: Add Source Version Tracking Columns to Translation Tables - Implementation Overview

**Document ID:** REQ-307-overview
**Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Status:** Ready for Implementation
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.4

---

## 1. Summary

This task adds `source_version_at` timestamp columns to all translation tables (`article_translations`, `item_translations`, `link_translations`) to enable detection of stale translations. When source content is updated, the corresponding `source_version_at` field will be compared against the source record's `updated_at` to determine if the translation is outdated. Additionally, indexes will be created on `translation_status` columns to support efficient status queries required by the Translation Status API (REQ-304).

---

## 2. Context & Dependencies

### 2.1 Epic Dependencies

| Dependency | Source | Status | Relevance |
|------------|--------|--------|-----------|
| Translation tables creation | Epic 1 - Task 1.1 | Must be completed first | Columns are added to tables created in Epic 1 |
| `article_translations` table | Epic 1 | Prerequisite | Target table for column addition |
| `item_translations` table | Epic 1 | Prerequisite | Target table for column addition |
| `link_translations` table | Epic 1 | Prerequisite | Target table for column addition |
| Translation Status API | REQ-304 (Epic 5, Task 1.1) | Parallel/consumer | Uses the indexes created here |

### 2.2 Downstream Consumers

| Consumer | Purpose |
|----------|---------|
| `GET /api/translations/status` | Query translations by status efficiently |
| `TranslationPreviewPanel` | Display stale indicators (Phase 5) |
| `ManualEditWarningDialog` | Detect when manual translations become stale |
| Re-translate logic | Identify translations needing refresh |

### 2.3 Database Schema Reference (from Epic 1)

The translation tables are defined in Epic 1's Plan-110-L10N-Epic1-Foundation.md:

```sql
-- article_translations (Epic 1 definition)
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
  UNIQUE(article_id, language)
);

-- item_translations (Epic 1 definition)
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
  UNIQUE(item_id, language)
);

-- link_translations (Epic 1 definition)
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(link_id, language)
);
```

---

## 3. Technical Approach

### 3.1 Migration SQL

The migration will be applied via Supabase MCP's `apply_migration` tool:

```sql
-- =====================================================
-- REQ-307: Add source_version_at columns for stale detection
-- =====================================================

-- Track when the source content was last modified
-- Used to detect stale translations by comparing against source updated_at
ALTER TABLE article_translations
  ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

ALTER TABLE item_translations
  ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

ALTER TABLE link_translations
  ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

-- =====================================================
-- Indexes for efficient translation status queries
-- =====================================================

-- Status indexes for filtering translations by status
-- Supports: GET /api/translations/status?status=pending
CREATE INDEX IF NOT EXISTS idx_article_translations_status
  ON article_translations(translation_status);

CREATE INDEX IF NOT EXISTS idx_item_translations_status
  ON item_translations(translation_status);

CREATE INDEX IF NOT EXISTS idx_link_translations_status
  ON link_translations(translation_status);

-- Composite indexes for status + source version queries
-- Supports: Finding stale translations (status=manual AND source_version_at < source.updated_at)
CREATE INDEX IF NOT EXISTS idx_article_translations_status_version
  ON article_translations(translation_status, source_version_at);

CREATE INDEX IF NOT EXISTS idx_item_translations_status_version
  ON item_translations(translation_status, source_version_at);

CREATE INDEX IF NOT EXISTS idx_link_translations_status_version
  ON link_translations(translation_status, source_version_at);
```

### 3.2 Stale Detection Logic

A translation is considered **stale** when:
1. `source_version_at` is set (translation was created/updated at a specific source version)
2. The source entity's `updated_at` is greater than `source_version_at`

```sql
-- Example query to find stale translations
SELECT at.*, ia.updated_at as source_updated_at
FROM article_translations at
JOIN item_articles ia ON at.article_id = ia.id
WHERE at.source_version_at IS NOT NULL
  AND ia.updated_at > at.source_version_at;
```

### 3.3 Column Usage Workflow

1. **On Translation Creation:**
   - Set `source_version_at` to the source entity's current `updated_at`

2. **On Source Content Update:**
   - Translation's `source_version_at` remains unchanged
   - Comparison with source `updated_at` reveals staleness

3. **On Re-translation:**
   - Update `source_version_at` to current source `updated_at`
   - Reset `translation_status` appropriately

---

## 4. Implementation Tasks

### Task 4.1: Apply Migration via Supabase MCP

**Estimated Effort:** 0.5 SP

1. Verify Epic 1 translation tables exist
2. Apply migration using `mcp__supabase__apply_migration`
3. Verify columns and indexes created successfully

**Verification Query:**
```sql
-- Check columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('article_translations', 'item_translations', 'link_translations')
  AND column_name = 'source_version_at';

-- Check indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('article_translations', 'item_translations', 'link_translations')
  AND indexname LIKE '%_status%';
```

### Task 4.2: Update TypeScript Database Types

**Estimated Effort:** 0.5 SP

Add `source_version_at` field to translation table types in `/src/lib/supabase.ts`:

```typescript
article_translations: {
  Row: {
    // ... existing fields ...
    source_version_at: string | null  // NEW: Track source content version
  }
  Insert: {
    // ... existing fields ...
    source_version_at?: string | null
  }
  Update: {
    // ... existing fields ...
    source_version_at?: string | null
  }
}
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Database Migration (via Supabase MCP)

| Action | Target | Description |
|--------|--------|-------------|
| ADD COLUMN | `article_translations.source_version_at` | TIMESTAMPTZ nullable |
| ADD COLUMN | `item_translations.source_version_at` | TIMESTAMPTZ nullable |
| ADD COLUMN | `link_translations.source_version_at` | TIMESTAMPTZ nullable |
| CREATE INDEX | `idx_article_translations_status` | Status query optimization |
| CREATE INDEX | `idx_item_translations_status` | Status query optimization |
| CREATE INDEX | `idx_link_translations_status` | Status query optimization |
| CREATE INDEX | `idx_article_translations_status_version` | Composite for stale queries |
| CREATE INDEX | `idx_item_translations_status_version` | Composite for stale queries |
| CREATE INDEX | `idx_link_translations_status_version` | Composite for stale queries |

### 5.2 TypeScript Files

| File | Action | Description |
|------|--------|-------------|
| `/src/lib/supabase.ts` | MODIFY | Add `source_version_at` to translation table Row/Insert/Update types |

### 5.3 Files NOT to Modify

- No API route changes required (this task is schema-only)
- No component changes required
- No hook changes required
- RLS policies: Not affected (existing policies cover new columns)

---

## 6. Acceptance Criteria

From REQ-307:

- [ ] Migration adds `source_version_at` column to `article_translations` table
- [ ] Migration adds `source_version_at` column to `item_translations` table
- [ ] Migration adds `source_version_at` column to `link_translations` table
- [ ] Indexes are created to support efficient queries filtering by translation status
- [ ] Indexes are created to support efficient queries ordering by source version timestamp
- [ ] Migration executes successfully without errors
- [ ] Database type definitions reflect the new columns after migration

---

## 7. Testing Strategy

### 7.1 Migration Verification

```sql
-- Verify column existence and type
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('article_translations', 'item_translations', 'link_translations')
  AND column_name = 'source_version_at'
ORDER BY table_name;
```

### 7.2 Index Verification

```sql
-- Verify indexes created
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('article_translations', 'item_translations', 'link_translations')
  AND indexname LIKE '%status%'
ORDER BY tablename, indexname;
```

### 7.3 Functional Test

```sql
-- Test stale detection query works
-- (Run after Epic 1 tables have data)
SELECT
  'article' as entity_type,
  at.id,
  at.translation_status,
  at.source_version_at,
  ia.updated_at as source_updated_at,
  CASE
    WHEN at.source_version_at IS NOT NULL
     AND ia.updated_at > at.source_version_at
    THEN true
    ELSE false
  END as is_stale
FROM article_translations at
JOIN item_articles ia ON at.article_id = ia.id
LIMIT 5;
```

---

## 8. Rollback Plan

If migration fails or needs to be reverted:

```sql
-- Remove indexes first
DROP INDEX IF EXISTS idx_article_translations_status;
DROP INDEX IF EXISTS idx_item_translations_status;
DROP INDEX IF EXISTS idx_link_translations_status;
DROP INDEX IF EXISTS idx_article_translations_status_version;
DROP INDEX IF EXISTS idx_item_translations_status_version;
DROP INDEX IF EXISTS idx_link_translations_status_version;

-- Remove columns
ALTER TABLE article_translations DROP COLUMN IF EXISTS source_version_at;
ALTER TABLE item_translations DROP COLUMN IF EXISTS source_version_at;
ALTER TABLE link_translations DROP COLUMN IF EXISTS source_version_at;
```

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 tables don't exist yet | High | High | Verify tables exist before applying; fail gracefully with clear message |
| Index creation slow on large tables | Low | Low | Tables will be empty/small initially; use IF NOT EXISTS |
| Type definition out of sync | Low | Medium | Update types immediately after migration; run TypeScript build to verify |

---

## 10. Notes

- This migration is idempotent (uses `IF NOT EXISTS` clauses)
- Columns are nullable to support existing translation records without requiring data migration
- Indexes are designed for the queries defined in REQ-304 (Translation Status API)
- No RLS policy changes needed - existing policies cover all columns in the table

---

## 11. References

- **Request:** `/docs/gen_requests_epic5.md` - REQ-307
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Epic 1 PRD:** `/docs/prd/PRD_L10N_Epic1_Foundation.md`

---

*Implementation Overview generated for FAQBNB L10N Epic 5 - Task 1.4*
