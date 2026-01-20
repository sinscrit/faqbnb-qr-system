# Implementation Breakdown: REQ-E05-003 - Add source_version_at Columns via Migration

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-E05-003
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.4
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Overview

This task adds `source_version_at` columns to all three translation tables (`item_translations`, `article_translations`, `link_translations`) to enable automatic detection of stale translations. When source content is modified, this timestamp can be compared against the translation's `translated_at` timestamp to determine if a re-translation is needed.

### Business Context

Property owners need to know when translations have become outdated due to source content changes. Without this tracking mechanism, the system cannot automatically identify which translations need to be refreshed, requiring manual tracking by owners.

### Technical Context

The translation tables were created in Epic 1 (L10N Foundation) with the following relevant columns:
- `translation_status`: Tracks lifecycle (pending, processing, completed, failed, manual)
- `translated_at`: Timestamp when translation was completed
- `updated_at`: Generic row update timestamp

The new `source_version_at` column will:
1. Be set when a translation is created/updated to match the source content's `updated_at`
2. Enable staleness queries: `WHERE source_version_at < source_entity.updated_at`
3. Support the Translation Preview Panel's "stale" indicator (yellow warning icon)

---

## Dependencies

### Required from Epic 1 (Foundation)
| Dependency | Status | Notes |
|------------|--------|-------|
| `item_translations` table | ✅ Exists | Has 0 rows currently |
| `article_translations` table | ✅ Exists | Has 0 rows, includes `reviewed_by` column |
| `link_translations` table | ✅ Exists | Has 0 rows currently |
| Existing status indexes | ✅ Exists | `idx_*_trans_status` indexes present |

### Required from Epic 3 (Dynamic Content)
| Dependency | Purpose |
|------------|---------|
| Translation trigger system | Will need to set `source_version_at` when creating translations |

---

## Database Schema Changes

### Current State

All three translation tables have these columns (verified via database inspection):
- `id` (UUID, PK)
- `[entity]_id` (UUID, FK)
- `language` (VARCHAR, CHECK constraint for en/fr/es/de/nl/it)
- `title`/`name` (VARCHAR)
- `description` (TEXT, nullable - articles/items only)
- `translation_status` (VARCHAR, default 'pending')
- `translated_at` (TIMESTAMPTZ, nullable)
- `reviewed_by` (UUID, FK to users - articles only)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Proposed Changes

Add to each translation table:
```sql
source_version_at TIMESTAMPTZ NULL
```

**Column Specification:**
- **Type:** `TIMESTAMPTZ` (timestamp with time zone)
- **Nullable:** Yes (for backward compatibility with existing records)
- **Default:** None (will be set programmatically during translation creation)
- **Comment:** "Timestamp of source content version when this translation was created/updated. Compare with source entity's updated_at to detect staleness."

### New Indexes Required

Based on the implementation plan and acceptance criteria:

1. **Status + Source Version Composite Indexes** (for efficient staleness queries):
   ```sql
   CREATE INDEX idx_article_trans_status_version ON article_translations(translation_status, source_version_at);
   CREATE INDEX idx_item_trans_status_version ON item_translations(translation_status, source_version_at);
   CREATE INDEX idx_link_trans_status_version ON link_translations(translation_status, source_version_at);
   ```

2. **Source Version Only Indexes** (for direct staleness lookups):
   ```sql
   CREATE INDEX idx_article_trans_source_version ON article_translations(source_version_at) WHERE source_version_at IS NOT NULL;
   CREATE INDEX idx_item_trans_source_version ON item_translations(source_version_at) WHERE source_version_at IS NOT NULL;
   CREATE INDEX idx_link_trans_source_version ON link_translations(source_version_at) WHERE source_version_at IS NOT NULL;
   ```

Note: Single-column status indexes already exist (`idx_article_trans_status`, `idx_item_trans_status`, link status index pending).

---

## Implementation Tasks

### Task 1: Create Database Migration
**Effort:** S (Small)
**File:** Apply via Supabase MCP

Add the `source_version_at` column to all three translation tables:

```sql
-- Migration: add_source_version_at_to_translations
-- Purpose: Track source content version for stale translation detection (Epic 5)

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

### Task 2: Create Status Query Indexes
**Effort:** S (Small)
**File:** Apply via Supabase MCP

Create composite indexes for efficient status + staleness queries:

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

### Task 3: Create Source Version Partial Indexes
**Effort:** S (Small)
**File:** Apply via Supabase MCP

Create partial indexes for non-null source_version_at values:

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

### Task 4: Update TypeScript Database Types
**Effort:** S (Small)
**File:** `/src/lib/supabase.ts`

Add `source_version_at` to the TypeScript type definitions for all three translation tables:

```typescript
// In article_translations Row/Insert/Update types:
source_version_at: string | null  // REQ-E05-003: Source content version for staleness detection

// In item_translations Row/Insert/Update types:
source_version_at: string | null  // REQ-E05-003: Source content version for staleness detection

// In link_translations Row/Insert/Update types:
source_version_at: string | null  // REQ-E05-003: Source content version for staleness detection
```

### Task 5: Verify Migration and Index Performance
**Effort:** XS (Extra Small)
**File:** N/A (verification only)

Post-migration verification:
1. Confirm columns exist on all three tables
2. Verify indexes were created successfully
3. Run EXPLAIN ANALYZE on sample staleness query to confirm index usage
4. Confirm existing translation records remain valid (should have NULL source_version_at)

---

## Authorized Files and Functions for Modification

### Database (via Supabase MCP)

| Table | Operation | Purpose |
|-------|-----------|---------|
| `article_translations` | ALTER TABLE ADD COLUMN | Add `source_version_at` column |
| `item_translations` | ALTER TABLE ADD COLUMN | Add `source_version_at` column |
| `link_translations` | ALTER TABLE ADD COLUMN | Add `source_version_at` column |
| `article_translations` | CREATE INDEX | Add composite and partial indexes |
| `item_translations` | CREATE INDEX | Add composite and partial indexes |
| `link_translations` | CREATE INDEX | Add composite and partial indexes |

### TypeScript Files

| File | Section | Change |
|------|---------|--------|
| `/src/lib/supabase.ts` | `article_translations.Row` | Add `source_version_at: string \| null` |
| `/src/lib/supabase.ts` | `article_translations.Insert` | Add `source_version_at?: string \| null` |
| `/src/lib/supabase.ts` | `article_translations.Update` | Add `source_version_at?: string \| null` |
| `/src/lib/supabase.ts` | `item_translations.Row` | Add `source_version_at: string \| null` |
| `/src/lib/supabase.ts` | `item_translations.Insert` | Add `source_version_at?: string \| null` |
| `/src/lib/supabase.ts` | `item_translations.Update` | Add `source_version_at?: string \| null` |
| `/src/lib/supabase.ts` | `link_translations.Row` | Add `source_version_at: string \| null` |
| `/src/lib/supabase.ts` | `link_translations.Insert` | Add `source_version_at?: string \| null` |
| `/src/lib/supabase.ts` | `link_translations.Update` | Add `source_version_at?: string \| null` |

---

## SQL Migration Script (Complete)

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

### Staleness Detection Query

```sql
-- Find all completed translations that are stale (source was updated after translation)
SELECT
  t.id,
  t.language,
  t.translated_at,
  t.source_version_at,
  a.updated_at as current_source_version
FROM article_translations t
JOIN item_articles a ON t.article_id = a.id
WHERE t.translation_status = 'completed'
  AND t.source_version_at IS NOT NULL
  AND t.source_version_at < a.updated_at;
```

### TypeScript Usage

```typescript
// Check if translation is stale
const isStale = translation.source_version_at &&
  sourceArticle.updated_at &&
  new Date(translation.source_version_at) < new Date(sourceArticle.updated_at);
```

---

## Acceptance Criteria Verification

| Criteria | Implementation | Status |
|----------|----------------|--------|
| Add source_version_at to items_translation | Task 1 - ALTER TABLE item_translations | Pending |
| Add source_version_at to articles_translation | Task 1 - ALTER TABLE article_translations | Pending |
| Add source_version_at to links_translation | Task 1 - ALTER TABLE link_translations | Pending |
| All columns allow NULL for backward compatibility | All ADD COLUMN statements omit NOT NULL | Pending |
| Indexes on source_version_at for staleness queries | Task 3 - Partial indexes | Pending |
| Composite indexes for status + source_version_at | Task 2 - Composite indexes | Pending |
| Migration can be rolled back without data loss | Rollback script provided | Pending |
| Existing translation records remain valid | NULL values allowed, no data modification | Pending |
| Query performance shows no degradation | Task 5 - EXPLAIN ANALYZE verification | Pending |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration locks tables during ALTER | Low | Medium | Tables have 0 rows currently; run during low-traffic period |
| Index creation impacts performance | Low | Low | IF NOT EXISTS prevents errors; tables are small |
| TypeScript types out of sync | Medium | Medium | Update types immediately after migration |
| NULL values cause issues in queries | Low | Low | All queries should handle NULL source_version_at |

---

## Effort Estimate

| Task | Estimate | Notes |
|------|----------|-------|
| Task 1: Add columns | 5 min | Single migration via Supabase MCP |
| Task 2: Composite indexes | 5 min | Part of same migration |
| Task 3: Partial indexes | 5 min | Part of same migration |
| Task 4: TypeScript types | 10 min | Manual update to supabase.ts |
| Task 5: Verification | 5 min | Run sample queries |
| **Total** | **30 min** | |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic 5 PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Epic 1 Foundation Migration: `20260118045251_l10n_foundation`
- Request: `/docs/gen_requests_epic5.md` (REQ-E05-004)
