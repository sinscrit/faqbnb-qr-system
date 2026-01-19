# REQ-339: Add Source Version Tracking Columns via Migration - Detailed Task Breakdown

**Generated:** 2026-01-19 03:15:00 UTC
**Last Modified:** 2026-01-19 03:15:00 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #339
**Overview Document:** docs/REQ-339-add-sourceversionat-columns-via-migration-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.4
**Estimated Size:** S (Small)
**Dependencies:** Epic 1 (Foundation) - Translation tables must exist

---

## Executive Summary

This document provides granular, actionable implementation tasks for adding `source_version_at` timestamp columns to all translation tables. This column tracks when source content was last modified, enabling automatic detection of stale translations that need updating when property owners modify their content.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Translation tables exist in database: `article_translations`, `item_translations`, `link_translations`
- [ ] Access to Supabase MCP tools for migration application
- [ ] TypeScript types file exists at `/src/lib/supabase.ts`
- [ ] No pending migrations that might conflict

---

## Task Breakdown

### Task 1: Apply Database Migration for Column Addition
**Estimated Effort:** 10 minutes
**Priority:** Critical (blocking)
**Tool:** `mcp__supabase__apply_migration`

#### 1.1 Migration SQL

Apply the following migration using the Supabase MCP tool:

```sql
-- Migration: add_source_version_at_columns
-- Description: Add source_version_at timestamp columns to translation tables
--              to track when source content was last modified for stale detection
-- REQ-339: Owner Translation Management - Stale Translation Detection

-- ============================================================================
-- PART 1: Add source_version_at column to translation tables
-- ============================================================================

-- Add source_version_at column to article_translations
ALTER TABLE article_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN article_translations.source_version_at IS
  'Timestamp when the source article content (item_articles) was last modified. Used to detect stale translations requiring re-translation. Populated when translation is created/updated.';

-- Add source_version_at column to item_translations
ALTER TABLE item_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN item_translations.source_version_at IS
  'Timestamp when the source item content (items) was last modified. Used to detect stale translations requiring re-translation. Populated when translation is created/updated.';

-- Add source_version_at column to link_translations
ALTER TABLE link_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN link_translations.source_version_at IS
  'Timestamp when the source link content (item_links) was last modified. Used to detect stale translations requiring re-translation. Populated when translation is created/updated.';

-- ============================================================================
-- PART 2: Create indexes for efficient status queries
-- ============================================================================

-- Status indexes support the Translation Status API endpoint (REQ-336)
-- and dashboard queries that filter by translation status

CREATE INDEX IF NOT EXISTS idx_article_translations_status
ON article_translations(translation_status);

CREATE INDEX IF NOT EXISTS idx_item_translations_status
ON item_translations(translation_status);

CREATE INDEX IF NOT EXISTS idx_link_translations_status
ON link_translations(translation_status);

-- ============================================================================
-- PART 3: Create indexes for source version timestamp ordering
-- ============================================================================

-- Partial indexes (WHERE NOT NULL) reduce index size and improve query performance
-- These support queries that order by source_version_at for stale translation detection

CREATE INDEX IF NOT EXISTS idx_article_translations_source_version
ON article_translations(source_version_at)
WHERE source_version_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_item_translations_source_version
ON item_translations(source_version_at)
WHERE source_version_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_link_translations_source_version
ON link_translations(source_version_at)
WHERE source_version_at IS NOT NULL;
```

#### 1.2 MCP Tool Parameters

```json
{
  "name": "add_source_version_at_columns",
  "query": "<SQL from section 1.1>"
}
```

#### 1.3 Acceptance Criteria

- [ ] Migration completes without errors
- [ ] Migration is recorded in Supabase migrations table
- [ ] No conflicts with existing schema elements

---

### Task 2: Verify Column Addition
**Estimated Effort:** 5 minutes
**Priority:** Critical (verification)
**Tool:** `mcp__supabase__execute_sql`

#### 2.1 Verification Query for article_translations

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'article_translations'
  AND column_name = 'source_version_at';
```

**Expected Result:**
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| source_version_at | timestamp with time zone | YES | NULL |

#### 2.2 Verification Query for item_translations

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'item_translations'
  AND column_name = 'source_version_at';
```

**Expected Result:**
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| source_version_at | timestamp with time zone | YES | NULL |

#### 2.3 Verification Query for link_translations

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'link_translations'
  AND column_name = 'source_version_at';
```

**Expected Result:**
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| source_version_at | timestamp with time zone | YES | NULL |

#### 2.4 Acceptance Criteria

- [ ] `source_version_at` column exists in `article_translations` with type `timestamptz`
- [ ] `source_version_at` column exists in `item_translations` with type `timestamptz`
- [ ] `source_version_at` column exists in `link_translations` with type `timestamptz`
- [ ] All columns are nullable (existing records will have NULL)

---

### Task 3: Verify Index Creation
**Estimated Effort:** 5 minutes
**Priority:** Critical (verification)
**Tool:** `mcp__supabase__execute_sql`

#### 3.1 Index Verification Query

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('article_translations', 'item_translations', 'link_translations')
  AND (indexname LIKE '%status%' OR indexname LIKE '%source_version%')
ORDER BY tablename, indexname;
```

**Expected Results (6 indexes total):**

| tablename | indexname | indexdef |
|-----------|-----------|----------|
| article_translations | idx_article_translations_source_version | CREATE INDEX ... ON article_translations(source_version_at) WHERE source_version_at IS NOT NULL |
| article_translations | idx_article_translations_status | CREATE INDEX ... ON article_translations(translation_status) |
| item_translations | idx_item_translations_source_version | CREATE INDEX ... ON item_translations(source_version_at) WHERE source_version_at IS NOT NULL |
| item_translations | idx_item_translations_status | CREATE INDEX ... ON item_translations(translation_status) |
| link_translations | idx_link_translations_source_version | CREATE INDEX ... ON link_translations(source_version_at) WHERE source_version_at IS NOT NULL |
| link_translations | idx_link_translations_status | CREATE INDEX ... ON link_translations(translation_status) |

#### 3.2 Acceptance Criteria

- [ ] `idx_article_translations_status` index exists
- [ ] `idx_article_translations_source_version` index exists (partial index)
- [ ] `idx_item_translations_status` index exists
- [ ] `idx_item_translations_source_version` index exists (partial index)
- [ ] `idx_link_translations_status` index exists
- [ ] `idx_link_translations_source_version` index exists (partial index)

---

### Task 4: Update TypeScript Database Types
**Estimated Effort:** 10 minutes
**Priority:** Critical
**File:** `/src/lib/supabase.ts`

#### 4.1 Update article_translations Type

Locate the `article_translations` type definition and add `source_version_at` to Row, Insert, and Update:

**Current location in file:** Lines 361-414

**Changes Required:**

```typescript
// REQ-227: Article translations table for L10N
article_translations: {
  Row: {
    id: string
    article_id: string
    language: string
    title: string
    description: string | null
    translation_status: string
    translated_at: string | null
    reviewed_by: string | null
    created_at: string | null
    updated_at: string | null
    source_version_at: string | null  // REQ-339: Track source content version for stale detection
  }
  Insert: {
    id?: string
    article_id: string
    language: string
    title: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    source_version_at?: string | null  // REQ-339: Track source content version for stale detection
  }
  Update: {
    id?: string
    article_id?: string
    language?: string
    title?: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    reviewed_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    source_version_at?: string | null  // REQ-339: Track source content version for stale detection
  }
  Relationships: [
    // ... existing relationships unchanged
  ]
}
```

#### 4.2 Update item_translations Type

Locate the `item_translations` type definition and add `source_version_at` to Row, Insert, and Update:

**Current location in file:** Lines 462-506

**Changes Required:**

```typescript
// REQ-227: Item translations table for L10N
item_translations: {
  Row: {
    id: string
    item_id: string
    language: string
    name: string
    description: string | null
    translation_status: string
    translated_at: string | null
    created_at: string | null
    updated_at: string | null
    source_version_at: string | null  // REQ-339: Track source content version for stale detection
  }
  Insert: {
    id?: string
    item_id: string
    language: string
    name: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
    source_version_at?: string | null  // REQ-339: Track source content version for stale detection
  }
  Update: {
    id?: string
    item_id?: string
    language?: string
    name?: string
    description?: string | null
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
    source_version_at?: string | null  // REQ-339: Track source content version for stale detection
  }
  Relationships: [
    // ... existing relationships unchanged
  ]
}
```

#### 4.3 Update link_translations Type

Locate the `link_translations` type definition and add `source_version_at` to Row, Insert, and Update:

**Current location in file:** Lines 273-314

**Changes Required:**

```typescript
// REQ-227: Link translations table for L10N
link_translations: {
  Row: {
    id: string
    link_id: string
    language: string
    title: string
    translation_status: string
    translated_at: string | null
    created_at: string | null
    updated_at: string | null
    source_version_at: string | null  // REQ-339: Track source content version for stale detection
  }
  Insert: {
    id?: string
    link_id: string
    language: string
    title: string
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
    source_version_at?: string | null  // REQ-339: Track source content version for stale detection
  }
  Update: {
    id?: string
    link_id?: string
    language?: string
    title?: string
    translation_status?: string
    translated_at?: string | null
    created_at?: string | null
    updated_at?: string | null
    source_version_at?: string | null  // REQ-339: Track source content version for stale detection
  }
  Relationships: [
    // ... existing relationships unchanged
  ]
}
```

#### 4.4 Acceptance Criteria

- [ ] `source_version_at: string | null` added to `article_translations.Row`
- [ ] `source_version_at?: string | null` added to `article_translations.Insert`
- [ ] `source_version_at?: string | null` added to `article_translations.Update`
- [ ] `source_version_at: string | null` added to `item_translations.Row`
- [ ] `source_version_at?: string | null` added to `item_translations.Insert`
- [ ] `source_version_at?: string | null` added to `item_translations.Update`
- [ ] `source_version_at: string | null` added to `link_translations.Row`
- [ ] `source_version_at?: string | null` added to `link_translations.Insert`
- [ ] `source_version_at?: string | null` added to `link_translations.Update`

---

### Task 5: Verify TypeScript Compilation
**Estimated Effort:** 5 minutes
**Priority:** Critical (verification)
**Tool:** Bash

#### 5.1 Run TypeScript Compiler Check

```bash
npx tsc --noEmit
```

#### 5.2 Alternative: Check for Type Errors in Specific File

```bash
npx tsc --noEmit src/lib/supabase.ts
```

#### 5.3 Acceptance Criteria

- [ ] TypeScript compilation completes without errors
- [ ] No type errors related to translation tables
- [ ] Existing code referencing translation tables still compiles

---

### Task 6: Verify Existing Data Integrity
**Estimated Effort:** 5 minutes
**Priority:** High (verification)
**Tool:** `mcp__supabase__execute_sql`

#### 6.1 Check Existing Records Have NULL for New Column

```sql
-- Verify article_translations existing records
SELECT
  COUNT(*) as total_records,
  COUNT(source_version_at) as records_with_value,
  COUNT(*) - COUNT(source_version_at) as records_with_null
FROM article_translations;

-- Verify item_translations existing records
SELECT
  COUNT(*) as total_records,
  COUNT(source_version_at) as records_with_value,
  COUNT(*) - COUNT(source_version_at) as records_with_null
FROM item_translations;

-- Verify link_translations existing records
SELECT
  COUNT(*) as total_records,
  COUNT(source_version_at) as records_with_value,
  COUNT(*) - COUNT(source_version_at) as records_with_null
FROM link_translations;
```

**Expected Result:**
All existing records should have `source_version_at = NULL` (records_with_value = 0).

#### 6.2 Acceptance Criteria

- [ ] Existing translation records are not affected
- [ ] All existing records have NULL for `source_version_at`
- [ ] No data corruption or loss

---

## Authorized Files and Functions for Modification

### Database Changes (via Supabase MCP)

| Table | Change Type | Description |
|-------|-------------|-------------|
| `article_translations` | ADD COLUMN | Add `source_version_at TIMESTAMPTZ` |
| `item_translations` | ADD COLUMN | Add `source_version_at TIMESTAMPTZ` |
| `link_translations` | ADD COLUMN | Add `source_version_at TIMESTAMPTZ` |
| `article_translations` | CREATE INDEX | `idx_article_translations_status` |
| `article_translations` | CREATE INDEX | `idx_article_translations_source_version` (partial) |
| `item_translations` | CREATE INDEX | `idx_item_translations_status` |
| `item_translations` | CREATE INDEX | `idx_item_translations_source_version` (partial) |
| `link_translations` | CREATE INDEX | `idx_link_translations_status` |
| `link_translations` | CREATE INDEX | `idx_link_translations_source_version` (partial) |

### Files to Modify

| File Path | Change Type | Lines to Modify | Description |
|-----------|-------------|-----------------|-------------|
| `/src/lib/supabase.ts` | UPDATE | ~273-314, ~361-414, ~462-506 | Add `source_version_at` to translation table types |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/types/index.ts` | Reference for type export patterns |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | Schema specifications |

---

## Implementation Order

Execute tasks in the following sequence:

1. **Task 1** - Apply database migration (blocking)
2. **Task 2** - Verify columns added
3. **Task 3** - Verify indexes created
4. **Task 4** - Update TypeScript types
5. **Task 5** - Verify TypeScript compilation
6. **Task 6** - Verify existing data integrity

**Note:** Tasks 2, 3, and 6 are verification steps and can be combined into a single verification pass if preferred.

---

## Stale Translation Detection (Reference)

Once the `source_version_at` column is populated by the Translation APIs (REQ-337, REQ-338), stale translations can be detected using:

```sql
-- Example: Find stale article translations
SELECT
  t.id,
  t.article_id,
  t.language,
  t.translation_status,
  t.translated_at,
  t.source_version_at,
  a.updated_at as current_source_version,
  CASE
    WHEN t.source_version_at IS NULL THEN 'unknown'
    WHEN a.updated_at > t.source_version_at THEN 'stale'
    ELSE 'current'
  END as freshness_status
FROM article_translations t
JOIN item_articles a ON t.article_id = a.id
WHERE t.translation_status IN ('completed', 'manual');
```

---

## Rollback Procedure

If migration needs to be reverted:

```sql
-- Rollback: remove_source_version_at_columns
-- WARNING: Only run if migration needs to be completely reverted

-- Drop indexes first
DROP INDEX IF EXISTS idx_article_translations_source_version;
DROP INDEX IF EXISTS idx_article_translations_status;
DROP INDEX IF EXISTS idx_item_translations_source_version;
DROP INDEX IF EXISTS idx_item_translations_status;
DROP INDEX IF EXISTS idx_link_translations_source_version;
DROP INDEX IF EXISTS idx_link_translations_status;

-- Remove columns
ALTER TABLE article_translations DROP COLUMN IF EXISTS source_version_at;
ALTER TABLE item_translations DROP COLUMN IF EXISTS source_version_at;
ALTER TABLE link_translations DROP COLUMN IF EXISTS source_version_at;
```

**Note:** Rollback should only be executed if critical issues are discovered. Coordinate with team before executing.

---

## Testing Considerations

### Post-Implementation Tests

1. **Column Existence Test**
   - Query information_schema to verify columns exist
   - Verify column type is `timestamp with time zone`
   - Verify column allows NULL values

2. **Index Existence Test**
   - Query pg_indexes to verify all 6 indexes exist
   - Verify partial indexes have correct WHERE clause

3. **TypeScript Compilation Test**
   - Run `npx tsc --noEmit`
   - Verify no type errors

4. **Existing Data Integrity Test**
   - Verify existing translation records unchanged
   - Verify new column has NULL for all existing records

5. **Insert/Update Test** (manual)
   - Test inserting new translation with source_version_at
   - Test updating existing translation with source_version_at
   - Verify timestamp stored correctly

---

## Related Tasks

| Task ID | Title | Dependency Type |
|---------|-------|-----------------|
| REQ-336 | Translation Status API | Uses status indexes created here |
| REQ-337 | Update Translation API | Populates source_version_at column |
| REQ-338 | Re-translate API | Uses source_version_at for stale detection |

---

## Final Acceptance Criteria Checklist

From REQ-339 in gen_requests_epic5.md:

- [ ] Migration adds source_version_at column to article_translations table
- [ ] Migration adds source_version_at column to item_translations table
- [ ] Migration adds source_version_at column to link_translations table
- [ ] Column type is timestamp with time zone for accurate temporal tracking
- [ ] Indexes are created to support efficient filtering by translation status
- [ ] Indexes are created to support efficient ordering by source_version_at timestamp
- [ ] Migration executes successfully without errors or conflicts
- [ ] Database schema reflects new columns after migration completes
- [ ] Existing translation records handle null values gracefully for the new column
- [ ] TypeScript type definitions updated to reflect new column

---

## Notes

1. **Table Name Mapping:** The original request mentions `property_translations`, `listing_translations`, `faq_translations`, and `amenity_translations`, but the actual implemented tables from Epic 1 are `article_translations`, `item_translations`, and `link_translations`. This implementation addresses the actual existing tables.

2. **tag_translations Excluded:** The `tag_translations` table does not need `source_version_at` because system tags are static and have a different schema structure from entity translation tables.

3. **Partial Indexes:** The source_version indexes use a WHERE clause (`WHERE source_version_at IS NOT NULL`) to reduce index size since existing records will have NULL values.

---

*Document generated for FAQBNB Localization Epic 5 - REQ-339*
