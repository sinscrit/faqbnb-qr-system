# Detailed Task Breakdown: REQ-E05-003 - Add source_version_at Columns via Migration

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-E05-003
**Title:** Source Content Version Tracking via Database Schema
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.4
**Overview Document:** REQ-E05-003-add-sourceversionat-columns-via-migration-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Executive Summary

This task adds `source_version_at` timestamp columns to the three translation tables (`item_translations`, `article_translations`, `link_translations`) to enable automatic detection of stale translations. The column stores the source content's `updated_at` timestamp at the time of translation, allowing comparison queries to identify translations that need refreshing when source content changes.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following:

- [ ] Supabase MCP connection is available
- [ ] Database access is confirmed
- [ ] Translation tables exist (`item_translations`, `article_translations`, `link_translations`)
- [ ] Current table schemas have been verified
- [ ] No pending migrations that might conflict

---

## Task Breakdown

### Task 1: Add source_version_at Column to All Translation Tables

**Priority:** HIGH
**Effort:** XS (Extra Small - 5 minutes)
**Type:** Database Migration

#### Description
Add the `source_version_at` TIMESTAMPTZ column to all three translation tables. This column will store the timestamp of the source content when the translation was created or last updated.

#### SQL to Execute
```sql
-- Migration: add_source_version_at_to_translations
-- Purpose: Track source content version for stale translation detection (Epic 5)
-- Date: 2026-01-19

-- Add source_version_at column to article_translations
ALTER TABLE article_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN article_translations.source_version_at IS
'Timestamp of source article updated_at when translation was created. Compare with item_articles.updated_at to detect staleness.';

-- Add source_version_at column to item_translations
ALTER TABLE item_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN item_translations.source_version_at IS
'Timestamp of source item updated_at when translation was created. Compare with items.updated_at to detect staleness.';

-- Add source_version_at column to link_translations
ALTER TABLE link_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN link_translations.source_version_at IS
'Timestamp of source link created_at when translation was created. Links do not have updated_at, use created_at for staleness check.';
```

#### Acceptance Criteria
- [ ] Column `source_version_at` exists on `article_translations` with type TIMESTAMPTZ
- [ ] Column `source_version_at` exists on `item_translations` with type TIMESTAMPTZ
- [ ] Column `source_version_at` exists on `link_translations` with type TIMESTAMPTZ
- [ ] All columns allow NULL values (no NOT NULL constraint)
- [ ] Column comments are present describing the purpose
- [ ] Existing rows remain unaffected (will have NULL for new column)

#### Verification Query
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('article_translations', 'item_translations', 'link_translations')
  AND column_name = 'source_version_at';
```

---

### Task 2: Create Composite Indexes for Status + Source Version

**Priority:** HIGH
**Effort:** XS (Extra Small - 5 minutes)
**Type:** Database Migration

#### Description
Create composite indexes combining `translation_status` and `source_version_at` for efficient queries that filter by status while also checking staleness.

#### SQL to Execute
```sql
-- Composite indexes for status filtering with source version
-- These support queries like: WHERE translation_status = 'completed' AND source_version_at < ?

CREATE INDEX IF NOT EXISTS idx_article_trans_status_version
ON article_translations(translation_status, source_version_at);

CREATE INDEX IF NOT EXISTS idx_item_trans_status_version
ON item_translations(translation_status, source_version_at);

CREATE INDEX IF NOT EXISTS idx_link_trans_status_version
ON link_translations(translation_status, source_version_at);
```

#### Acceptance Criteria
- [ ] Index `idx_article_trans_status_version` exists on `article_translations`
- [ ] Index `idx_item_trans_status_version` exists on `item_translations`
- [ ] Index `idx_link_trans_status_version` exists on `link_translations`
- [ ] All indexes are composite indexes on (translation_status, source_version_at)

#### Verification Query
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('article_translations', 'item_translations', 'link_translations')
  AND indexname LIKE '%status_version%';
```

---

### Task 3: Create Partial Indexes for Source Version Lookups

**Priority:** MEDIUM
**Effort:** XS (Extra Small - 5 minutes)
**Type:** Database Migration

#### Description
Create partial indexes on `source_version_at` that only include non-NULL values. These indexes optimize staleness lookup queries where we need to find translations with known source versions.

#### SQL to Execute
```sql
-- Partial indexes for staleness lookups (only index rows with version tracking)
-- These support queries that check source_version_at against source entity timestamps

CREATE INDEX IF NOT EXISTS idx_article_trans_source_version
ON article_translations(source_version_at)
WHERE source_version_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_item_trans_source_version
ON item_translations(source_version_at)
WHERE source_version_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_link_trans_source_version
ON link_translations(source_version_at)
WHERE source_version_at IS NOT NULL;
```

#### Acceptance Criteria
- [ ] Index `idx_article_trans_source_version` exists as partial index
- [ ] Index `idx_item_trans_source_version` exists as partial index
- [ ] Index `idx_link_trans_source_version` exists as partial index
- [ ] All partial indexes have condition `WHERE source_version_at IS NOT NULL`

#### Verification Query
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('article_translations', 'item_translations', 'link_translations')
  AND indexname LIKE '%source_version%'
  AND indexname NOT LIKE '%status_version%';
```

---

### Task 4: Update TypeScript Database Types

**Priority:** HIGH
**Effort:** S (Small - 10 minutes)
**Type:** Code Update

#### Description
Add the `source_version_at` field to the TypeScript type definitions for all three translation tables in `/src/lib/supabase.ts`.

#### File to Modify
`/src/lib/supabase.ts`

#### Changes Required

**4.1 Update `article_translations` types (around line 361-414)**

Add to `Row` interface (after line 371, after `updated_at`):
```typescript
source_version_at: string | null  // REQ-E05-003: Source content version for staleness detection
```

Add to `Insert` interface (after line 384, after `updated_at`):
```typescript
source_version_at?: string | null  // REQ-E05-003: Source content version for staleness detection
```

Add to `Update` interface (after line 396, after `updated_at`):
```typescript
source_version_at?: string | null  // REQ-E05-003: Source content version for staleness detection
```

**4.2 Update `item_translations` types (around line 463-506)**

Add to `Row` interface (after line 473, after `updated_at`):
```typescript
source_version_at: string | null  // REQ-E05-003: Source content version for staleness detection
```

Add to `Insert` interface (after line 484, after `updated_at`):
```typescript
source_version_at?: string | null  // REQ-E05-003: Source content version for staleness detection
```

Add to `Update` interface (after line 495, after `updated_at`):
```typescript
source_version_at?: string | null  // REQ-E05-003: Source content version for staleness detection
```

**4.3 Update `link_translations` types (around line 274-314)**

Add to `Row` interface (after line 283, after `updated_at`):
```typescript
source_version_at: string | null  // REQ-E05-003: Source content version for staleness detection
```

Add to `Insert` interface (after line 294, after `updated_at`):
```typescript
source_version_at?: string | null  // REQ-E05-003: Source content version for staleness detection
```

Add to `Update` interface (after line 303, after `updated_at`):
```typescript
source_version_at?: string | null  // REQ-E05-003: Source content version for staleness detection
```

#### Acceptance Criteria
- [ ] `article_translations.Row` includes `source_version_at: string | null`
- [ ] `article_translations.Insert` includes `source_version_at?: string | null`
- [ ] `article_translations.Update` includes `source_version_at?: string | null`
- [ ] `item_translations.Row` includes `source_version_at: string | null`
- [ ] `item_translations.Insert` includes `source_version_at?: string | null`
- [ ] `item_translations.Update` includes `source_version_at?: string | null`
- [ ] `link_translations.Row` includes `source_version_at: string | null`
- [ ] `link_translations.Insert` includes `source_version_at?: string | null`
- [ ] `link_translations.Update` includes `source_version_at?: string | null`
- [ ] TypeScript compiles without errors
- [ ] All added fields include REQ-E05-003 comment

---

### Task 5: Verify Migration and Index Performance

**Priority:** MEDIUM
**Effort:** XS (Extra Small - 5 minutes)
**Type:** Verification

#### Description
Run verification queries to confirm all schema changes were applied correctly and test sample queries to ensure indexes are being used.

#### Verification Steps

**5.1 Confirm Columns Exist**
```sql
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

Expected: 3 rows showing TIMESTAMPTZ columns that are nullable

**5.2 Confirm Indexes Exist**
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('article_translations', 'item_translations', 'link_translations')
  AND (indexname LIKE '%source_version%' OR indexname LIKE '%status_version%')
ORDER BY tablename, indexname;
```

Expected: 6 rows (2 indexes per table)

**5.3 Test Index Usage with EXPLAIN ANALYZE**
```sql
-- Test composite index usage
EXPLAIN ANALYZE
SELECT id, language, translation_status, source_version_at
FROM article_translations
WHERE translation_status = 'completed'
  AND source_version_at IS NOT NULL;

-- Test partial index usage with staleness check
EXPLAIN ANALYZE
SELECT t.id, t.language, t.source_version_at, a.updated_at
FROM article_translations t
JOIN item_articles a ON t.article_id = a.id
WHERE t.source_version_at IS NOT NULL
  AND t.source_version_at < a.updated_at;
```

Expected: Query plans show index scans, not sequential scans

**5.4 Verify Existing Records Unaffected**
```sql
-- Check that existing records have NULL source_version_at
SELECT
  'article_translations' as table_name,
  COUNT(*) as total_rows,
  COUNT(source_version_at) as rows_with_version
FROM article_translations
UNION ALL
SELECT
  'item_translations',
  COUNT(*),
  COUNT(source_version_at)
FROM item_translations
UNION ALL
SELECT
  'link_translations',
  COUNT(*),
  COUNT(source_version_at)
FROM link_translations;
```

Expected: All `rows_with_version` should be 0 (existing records have NULL)

#### Acceptance Criteria
- [ ] All 3 tables have `source_version_at` column
- [ ] All 6 indexes are created successfully
- [ ] Query plans show index usage for status + staleness queries
- [ ] Existing translation records remain valid (NULL for source_version_at)
- [ ] No errors during verification queries

---

## Complete Migration Script

This script can be run as a single migration via Supabase MCP:

```sql
-- ============================================================================
-- Migration: add_source_version_at_to_translations
-- Description: Add source_version_at columns and indexes for stale translation detection
-- Epic: L10N Epic 5 - Owner Translation Management
-- Request: REQ-E05-003
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- PART 1: Add source_version_at columns
-- ============================================================================

-- Article translations
ALTER TABLE article_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN article_translations.source_version_at IS
'Timestamp of source article updated_at when translation was created. Compare with item_articles.updated_at to detect staleness.';

-- Item translations
ALTER TABLE item_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN item_translations.source_version_at IS
'Timestamp of source item updated_at when translation was created. Compare with items.updated_at to detect staleness.';

-- Link translations
ALTER TABLE link_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN link_translations.source_version_at IS
'Timestamp of source link created_at when translation was created. Links do not have updated_at, use created_at for staleness check.';

-- ============================================================================
-- PART 2: Create composite indexes (status + source_version_at)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_article_trans_status_version
ON article_translations(translation_status, source_version_at);

CREATE INDEX IF NOT EXISTS idx_item_trans_status_version
ON item_translations(translation_status, source_version_at);

CREATE INDEX IF NOT EXISTS idx_link_trans_status_version
ON link_translations(translation_status, source_version_at);

-- ============================================================================
-- PART 3: Create partial indexes for non-null source versions
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_article_trans_source_version
ON article_translations(source_version_at)
WHERE source_version_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_item_trans_source_version
ON item_translations(source_version_at)
WHERE source_version_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_link_trans_source_version
ON link_translations(source_version_at)
WHERE source_version_at IS NOT NULL;
```

---

## Rollback Script

If the migration needs to be reverted:

```sql
-- ============================================================================
-- Rollback: remove_source_version_at_from_translations
-- Description: Remove source_version_at columns and indexes
-- ============================================================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_article_trans_status_version;
DROP INDEX IF EXISTS idx_item_trans_status_version;
DROP INDEX IF EXISTS idx_link_trans_status_version;
DROP INDEX IF EXISTS idx_article_trans_source_version;
DROP INDEX IF EXISTS idx_item_trans_source_version;
DROP INDEX IF EXISTS idx_link_trans_source_version;

-- Drop columns
ALTER TABLE article_translations DROP COLUMN IF EXISTS source_version_at;
ALTER TABLE item_translations DROP COLUMN IF EXISTS source_version_at;
ALTER TABLE link_translations DROP COLUMN IF EXISTS source_version_at;
```

---

## Usage Examples

### Setting source_version_at When Creating Translation

```typescript
// When creating a new translation, set source_version_at from source entity
const createTranslation = async (articleId: string, language: string, content: TranslatedContent) => {
  // First, get the source article's updated_at
  const { data: article } = await supabase
    .from('item_articles')
    .select('updated_at')
    .eq('id', articleId)
    .single();

  // Create translation with source version
  const { data: translation } = await supabase
    .from('article_translations')
    .insert({
      article_id: articleId,
      language: language,
      title: content.title,
      description: content.description,
      translation_status: 'completed',
      translated_at: new Date().toISOString(),
      source_version_at: article?.updated_at // Track source version
    })
    .select()
    .single();

  return translation;
};
```

### Checking if Translation is Stale

```typescript
// TypeScript utility to check staleness
const isTranslationStale = (
  translation: { source_version_at: string | null },
  sourceEntity: { updated_at: string | null }
): boolean => {
  if (!translation.source_version_at || !sourceEntity.updated_at) {
    return false; // Can't determine staleness without timestamps
  }
  return new Date(translation.source_version_at) < new Date(sourceEntity.updated_at);
};
```

### Query for Stale Translations

```sql
-- Find all completed translations that are stale
SELECT
  t.id,
  t.language,
  t.translated_at,
  t.source_version_at,
  a.updated_at as current_source_version,
  a.title as source_title
FROM article_translations t
JOIN item_articles a ON t.article_id = a.id
WHERE t.translation_status = 'completed'
  AND t.source_version_at IS NOT NULL
  AND t.source_version_at < a.updated_at
ORDER BY a.updated_at DESC;
```

---

## Acceptance Criteria Summary (from Requirements)

| Requirement | Task | Status |
|-------------|------|--------|
| Database migration adds source_version_at column to items_translation table | Task 1 | Pending |
| Database migration adds source_version_at column to articles_translation table | Task 1 | Pending |
| Database migration adds source_version_at column to links_translation table | Task 1 | Pending |
| All new source_version_at columns allow NULL values for backward compatibility | Task 1 | Pending |
| Indexes are created on source_version_at columns for efficient staleness queries | Task 3 | Pending |
| Composite indexes are created combining status and source_version_at for performance | Task 2 | Pending |
| Migration can be rolled back without data loss | Rollback Script | Pending |
| Existing translation records remain valid after migration | Task 5 | Pending |
| Query performance for status filtering shows no degradation after index creation | Task 5 | Pending |

---

## Dependencies

### Required (from previous epics)
- Epic 1: Translation tables must exist (`article_translations`, `item_translations`, `link_translations`)
- Existing status indexes (`idx_*_trans_status`) - these already exist

### Enables (for future tasks)
- Translation Preview Panel stale indicator (Epic 5 Phase 2)
- Re-translate API staleness detection (Task 1.3)
- Translation status widget staleness counts (Phase 3)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tables currently empty - migration safe | N/A | N/A | All tables have 0 rows, no data migration needed |
| Index creation on empty tables | Low | None | Empty tables index instantly |
| TypeScript types drift from database | Medium | Medium | Update types immediately after migration, run type check |
| NULL values in queries | Low | Low | All queries must handle NULL source_version_at gracefully |

---

## Effort Summary

| Task | Effort | Time Estimate |
|------|--------|---------------|
| Task 1: Add columns | XS | 5 min |
| Task 2: Composite indexes | XS | 5 min |
| Task 3: Partial indexes | XS | 5 min |
| Task 4: TypeScript types | S | 10 min |
| Task 5: Verification | XS | 5 min |
| **Total** | **S** | **30 min** |

---

## Implementation Order

1. **Task 1** - Add columns (must be first)
2. **Task 2** - Create composite indexes (depends on Task 1)
3. **Task 3** - Create partial indexes (depends on Task 1)
4. **Task 4** - Update TypeScript types (can be done in parallel with 2-3)
5. **Task 5** - Verification (must be last)

Tasks 1-3 can be combined into a single migration. Task 4 is a code change. Task 5 is verification only.

---

## References

- Overview Document: `/docs/REQ-E05-003-add-sourceversionat-columns-via-migration-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic 5 PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Requirements: `/docs/gen_requests_epic5.md` (REQ-E05-004)
- TypeScript Types: `/src/lib/supabase.ts`
