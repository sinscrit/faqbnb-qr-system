# REQ-339: Add Source Version Tracking Columns via Migration

**Generated:** 2026-01-19 02:38:00 UTC
**Last Modified:** 2026-01-19 02:38:00 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #339
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.4
**Estimated Size:** S (Small)
**Dependencies:** Epic 1 (Foundation) - Translation tables must exist

---

## Overview

This document provides the implementation breakdown for adding `source_version_at` timestamp columns to all translation tables via a database migration. This column tracks when the source content was last modified, enabling automatic detection of stale translations that need updating.

### Purpose

When property owners modify descriptions, amenity details, FAQ answers, or other translatable content, the system needs to identify which existing translations have become outdated. The `source_version_at` column stores the timestamp of when the source content was last modified, allowing the system to compare source modification times against translation creation times.

### Business Value

- Enables automated detection of stale translations requiring re-translation
- Ensures international guests always see current and accurate information
- Reduces manual effort required to track which translations need updating after content changes
- Supports the Owner Translation Management features that display "stale" indicators

---

## Technical Context

### Database Schema - Current State

The following translation tables exist from Epic 1 (L10N Foundation):

| Table | Purpose | Current Columns |
|-------|---------|-----------------|
| `article_translations` | Translated versions of item_articles content | id, article_id, language, title, description, translation_status, translated_at, reviewed_by, created_at, updated_at |
| `item_translations` | Translated versions of items content | id, item_id, language, name, description, translation_status, translated_at, created_at, updated_at |
| `link_translations` | Translated versions of item_links titles | id, link_id, language, title, translation_status, translated_at, created_at, updated_at |
| `tag_translations` | Translated tag values | id, tag_key, language, translated_value, is_system_tag, created_at |

**Note:** The `tag_translations` table does not need `source_version_at` because system tags are static and the schema differs from entity translation tables.

### Existing Migration Naming Convention

From the migrations list, the naming pattern is:
- `YYYYMMDDHHMMSS_snake_case_description`
- Example: `20260118051130_add_translation_jobs_policies`

### Relevant Existing Patterns

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Column Addition | Migration `20260118045628_add_source_language_columns` | Pattern for adding columns to existing tables |
| Index Creation | Migration `20260118050915_enable_rls_translation_tables` | Pattern for creating indexes |
| Translation Tables | `/src/lib/supabase.ts` | TypeScript type definitions to update |

### Translation Status Values

```sql
-- Translation status enum values (CHECK constraint)
-- 'pending', 'processing', 'completed', 'failed', 'manual'
```

---

## Migration SQL

### Full Migration Script

```sql
-- Migration: add_source_version_at_columns
-- Description: Add source_version_at timestamp columns to translation tables
--              to track when source content was last modified for stale detection

-- Add source_version_at column to article_translations
ALTER TABLE article_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN article_translations.source_version_at IS
  'Timestamp when the source article content was last modified. Used to detect stale translations.';

-- Add source_version_at column to item_translations
ALTER TABLE item_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN item_translations.source_version_at IS
  'Timestamp when the source item content was last modified. Used to detect stale translations.';

-- Add source_version_at column to link_translations
ALTER TABLE link_translations
ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

COMMENT ON COLUMN link_translations.source_version_at IS
  'Timestamp when the source link content was last modified. Used to detect stale translations.';

-- Create indexes for efficient status queries
-- These indexes support the Translation Status API endpoint (REQ-336)
-- and dashboard queries that filter by translation status

CREATE INDEX IF NOT EXISTS idx_article_translations_status
ON article_translations(translation_status);

CREATE INDEX IF NOT EXISTS idx_item_translations_status
ON item_translations(translation_status);

CREATE INDEX IF NOT EXISTS idx_link_translations_status
ON link_translations(translation_status);

-- Create indexes for efficient ordering by source version timestamp
-- Used when querying for stale translations that need updating

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

---

## Implementation Tasks

### Task 1: Apply Migration via Supabase MCP

**Tool:** `mcp__supabase__apply_migration`

Apply the migration using the Supabase MCP tool with the following parameters:

```json
{
  "name": "add_source_version_at_columns",
  "query": "<full SQL from above>"
}
```

**Acceptance Criteria:**
- [ ] Migration applies successfully without errors
- [ ] Migration is recorded in the migrations table
- [ ] No conflicts with existing schema

---

### Task 2: Verify Column Addition

After applying the migration, verify the columns were added:

```sql
-- Verify article_translations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'article_translations'
  AND column_name = 'source_version_at';

-- Verify item_translations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'item_translations'
  AND column_name = 'source_version_at';

-- Verify link_translations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'link_translations'
  AND column_name = 'source_version_at';
```

**Acceptance Criteria:**
- [ ] `source_version_at` column exists in `article_translations`
- [ ] `source_version_at` column exists in `item_translations`
- [ ] `source_version_at` column exists in `link_translations`
- [ ] Column type is `timestamp with time zone` (timestamptz)
- [ ] Column is nullable (existing records will have NULL)

---

### Task 3: Verify Index Creation

Verify the indexes were created:

```sql
-- Verify status indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('article_translations', 'item_translations', 'link_translations')
  AND indexname LIKE '%status%' OR indexname LIKE '%source_version%';
```

**Acceptance Criteria:**
- [ ] `idx_article_translations_status` index exists
- [ ] `idx_item_translations_status` index exists
- [ ] `idx_link_translations_status` index exists
- [ ] `idx_article_translations_source_version` index exists
- [ ] `idx_item_translations_source_version` index exists
- [ ] `idx_link_translations_source_version` index exists

---

### Task 4: Update TypeScript Database Types

**File:** `/src/lib/supabase.ts`

Add the `source_version_at` column to the TypeScript type definitions for each translation table.

**Changes Required:**

1. **article_translations** - Add to Row, Insert, and Update types:
```typescript
source_version_at: string | null  // REQ-339: Track source content version for stale detection
```

2. **item_translations** - Add to Row, Insert, and Update types:
```typescript
source_version_at: string | null  // REQ-339: Track source content version for stale detection
```

3. **link_translations** - Add to Row, Insert, and Update types:
```typescript
source_version_at: string | null  // REQ-339: Track source content version for stale detection
```

**Acceptance Criteria:**
- [ ] `source_version_at` added to `article_translations` Row type
- [ ] `source_version_at` added to `article_translations` Insert type (optional)
- [ ] `source_version_at` added to `article_translations` Update type (optional)
- [ ] Same pattern applied to `item_translations`
- [ ] Same pattern applied to `link_translations`
- [ ] TypeScript compiler successfully validates the types

---

## Authorized Files and Functions for Modification

### Database Changes (via Supabase MCP)

| Table | Change Type | Description |
|-------|-------------|-------------|
| `article_translations` | ADD COLUMN | Add `source_version_at TIMESTAMPTZ` |
| `item_translations` | ADD COLUMN | Add `source_version_at TIMESTAMPTZ` |
| `link_translations` | ADD COLUMN | Add `source_version_at TIMESTAMPTZ` |
| `article_translations` | CREATE INDEX | Status and source_version indexes |
| `item_translations` | CREATE INDEX | Status and source_version indexes |
| `link_translations` | CREATE INDEX | Status and source_version indexes |

### Files to Modify

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/supabase.ts` | UPDATE | Add `source_version_at` to translation table types |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/types/index.ts` | Reference for type export patterns |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | Schema specifications |

---

## Stale Translation Detection Logic

Once the `source_version_at` column is populated, stale translations can be detected using:

```sql
-- Query to find stale translations (source updated after translation)
SELECT
  t.id,
  t.article_id,
  t.language,
  t.translation_status,
  t.translated_at,
  t.source_version_at,
  a.updated_at as current_source_version
FROM article_translations t
JOIN item_articles a ON t.article_id = a.id
WHERE t.translation_status IN ('completed', 'manual')
  AND t.source_version_at IS NOT NULL
  AND a.updated_at > t.source_version_at;
```

**Note:** The `source_version_at` column should be populated when:
1. A new translation is created (set to source entity's `updated_at`)
2. A translation is updated (set to current source entity's `updated_at`)

This population logic will be implemented in the Translation API endpoints (REQ-337, REQ-338).

---

## Existing Data Handling

For existing translation records created before this migration:

- `source_version_at` will be `NULL`
- These records should be treated as "unknown freshness"
- UI components should handle NULL gracefully (show no stale indicator)
- Optionally, a backfill migration could populate historical values:

```sql
-- Optional backfill (run manually if needed)
UPDATE article_translations t
SET source_version_at = a.updated_at
FROM item_articles a
WHERE t.article_id = a.id
  AND t.source_version_at IS NULL;

-- Similar for item_translations and link_translations
```

**Note:** Backfill is optional and not part of the core requirement.

---

## Testing Considerations

### Migration Verification Tests

1. **Column Existence**
   - All three translation tables have `source_version_at` column
   - Column type is `timestamptz`
   - Column allows NULL values

2. **Index Existence**
   - Status indexes exist on all three tables
   - Source version indexes exist with partial index on non-null values

3. **Existing Data Integrity**
   - Existing translation records are not affected
   - Existing records have NULL for `source_version_at`

4. **TypeScript Compilation**
   - Project compiles without type errors after type updates

### Query Performance Tests

1. Status filter queries should use the new indexes
2. Source version ordering should use the partial indexes

---

## Performance Considerations

- Partial indexes on `source_version_at` (WHERE NOT NULL) reduce index size
- Status indexes support the Translation Status API (REQ-336)
- Both index types are B-tree (default), optimal for equality and range queries

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Document: `/docs/gen_requests_epic5.md` - REQ-339
- Epic 1 Foundation: Translation table creation migrations
- Related Tasks:
  - REQ-336: Translation Status API (uses status indexes)
  - REQ-337: Update Translation API (populates source_version_at)
  - REQ-338: Re-translate API (uses source_version_at for stale detection)

---

## Acceptance Criteria Checklist

From REQ-339 in gen_requests_epic5.md:

- [ ] Migration adds source_version_at column to article_translations table
- [ ] Migration adds source_version_at column to item_translations table (note: listed as listing_translations in request, but actual table is item_translations)
- [ ] Migration adds source_version_at column to link_translations table (note: listed as faq_translations in request, but actual table is link_translations)
- [ ] Column type is timestamp with time zone for accurate temporal tracking
- [ ] Indexes are created to support efficient filtering by translation status
- [ ] Indexes are created to support efficient ordering by source_version_at timestamp
- [ ] Migration executes successfully without errors or conflicts
- [ ] Database schema reflects new columns after migration completes
- [ ] Existing translation records handle null values gracefully for the new column
- [ ] TypeScript type definitions updated to reflect new column

**Note:** The request mentions `property_translations`, `listing_translations`, `faq_translations`, and `amenity_translations` tables, but the actual implemented tables from Epic 1 are `article_translations`, `item_translations`, and `link_translations`. This implementation addresses the actual tables that exist in the schema.
