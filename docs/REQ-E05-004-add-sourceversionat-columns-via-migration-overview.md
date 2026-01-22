# Implementation Overview: Add source_version_at Columns via Migration

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-004 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 17:45 |
| Breakdown Created | 2026-01-22 18:52 |
| T-shirt Size | S |
| Estimated Effort | 1-2 hours |

## Goals

Create a database migration that adds `source_version_at` columns to translation tables, enabling the system to detect stale translations when source content is updated. This provides the data foundation for Epic 5's stale translation detection and notification features.

**Technical Requirements:**
- Add `source_version_at` column (TIMESTAMPTZ, nullable) to `item_translations` table
- Add `source_version_at` column (TIMESTAMPTZ, nullable) to `article_translations` table
- Consider adding to `link_translations` table for consistency (implementation plan includes it)
- Create indexes on `source_version_at` columns for efficient queries
- Consider composite indexes on `(entity_id, source_version_at)` for lookups
- Use `ADD COLUMN IF NOT EXISTS` for idempotent migrations
- Allow NULL values for backward compatibility with existing records
- After migration, regenerate TypeScript database types

### Assumptions & Clarifications

- **Discovery**: Request specifies only item_translations and article_translations, but implementation plan includes link_translations
- **Recommendation**: Add column to all three tables (item, article, link) for consistency
- **Assumption**: Migration applied via Supabase MCP tool (`mcp__supabase__apply_migration`)
- **Assumption**: No data backfill needed - column remains NULL for existing records until next translation update
- **Assumption**: Stale detection logic compares source entity's `updated_at` > translation's `source_version_at`
- **Clarification needed**: Should tag_translations also get this column? (Tags may not have source version tracking)

## Implementation Plan

### Step 1: Design Migration SQL Script
- **Description**: Write SQL migration script with proper column additions and index creation
- **Rationale**: Define exactly what changes need to be made before applying to database
- **Estimated Effort**: 20 minutes

Migration script structure:
```sql
-- Migration: add_source_version_at_columns
-- Description: Add source_version_at columns to translation tables for stale detection
-- Created: 2026-01-22

-- Add source_version_at columns (nullable for backward compatibility)
ALTER TABLE item_translations
  ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

ALTER TABLE article_translations
  ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

ALTER TABLE link_translations
  ADD COLUMN IF NOT EXISTS source_version_at TIMESTAMPTZ;

-- Add indexes for efficient stale translation queries
CREATE INDEX IF NOT EXISTS idx_item_translations_source_version
  ON item_translations(source_version_at);

CREATE INDEX IF NOT EXISTS idx_article_translations_source_version
  ON article_translations(source_version_at);

CREATE INDEX IF NOT EXISTS idx_link_translations_source_version
  ON link_translations(source_version_at);

-- Optional: Composite indexes for entity-specific lookups
-- CREATE INDEX IF NOT EXISTS idx_item_translations_item_source_version
--   ON item_translations(item_id, source_version_at);
-- CREATE INDEX IF NOT EXISTS idx_article_translations_article_source_version
--   ON article_translations(article_id, source_version_at);
-- CREATE INDEX IF NOT EXISTS idx_link_translations_link_source_version
--   ON link_translations(link_id, source_version_at);
```

Key decisions:
- Use `TIMESTAMPTZ` for timezone-aware timestamps
- Use `ADD COLUMN IF NOT EXISTS` for idempotency
- No `NOT NULL` constraint to avoid breaking existing data
- No default value - NULL indicates "unknown version" for old translations
- Composite indexes commented out initially (add if performance testing shows need)

### Step 2: Apply Migration via Supabase MCP
- **Description**: Execute migration using Supabase MCP tool with proper migration name
- **Rationale**: Supabase MCP ensures migration is tracked and can be rolled back if needed
- **Estimated Effort**: 15 minutes

Execution steps:
- Use `mcp__supabase__apply_migration` tool
- Migration name: `add_source_version_at_columns`
- Migration query: SQL script from Step 1
- Verify migration succeeds without errors
- Check that migration is recorded in `supabase_migrations` table (or equivalent tracking)

Expected output:
- Confirmation that all ALTER TABLE statements executed successfully
- Confirmation that all indexes were created
- No errors related to column/index already existing (due to IF NOT EXISTS)

### Step 3: Verify Column and Index Creation
- **Description**: Query database to confirm columns and indexes exist with correct properties
- **Rationale**: Ensure migration actually applied correctly before proceeding
- **Estimated Effort**: 15 minutes

Verification queries:
```sql
-- Check columns exist and have correct type
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('item_translations', 'article_translations', 'link_translations')
  AND column_name = 'source_version_at';

-- Expected results: 3 rows (or 2 if link_translations excluded)
-- data_type: timestamp with time zone
-- is_nullable: YES

-- Check indexes exist
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('item_translations', 'article_translations', 'link_translations')
  AND indexname LIKE '%source_version%';

-- Expected results: 3 index rows showing the new indexes
```

Verification checklist:
- ✓ Column exists in item_translations with type TIMESTAMPTZ
- ✓ Column exists in article_translations with type TIMESTAMPTZ
- ✓ Column exists in link_translations with type TIMESTAMPTZ (if included)
- ✓ Column allows NULL values
- ✓ Index exists on item_translations(source_version_at)
- ✓ Index exists on article_translations(source_version_at)
- ✓ Index exists on link_translations(source_version_at) (if included)
- ✓ Existing records have NULL value for new column

### Step 4: Regenerate TypeScript Database Types
- **Description**: Run Supabase type generation to update TypeScript types with new column
- **Rationale**: Ensure TypeScript code can reference new column with type safety
- **Estimated Effort**: 10 minutes

Type generation command (from CLAUDE.md):
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts
```

Or use Supabase MCP tool:
```
mcp__supabase__generate_typescript_types
```

Expected changes in generated types:
```typescript
// In database.generated.ts or similar
export interface ItemTranslation {
  id: string;
  item_id: string;
  language: string;
  name: string;
  description: string | null;
  translation_status: string;
  translated_at: string | null;
  updated_at: string | null;
  source_version_at: string | null; // NEW FIELD
}

// Similar for ArticleTranslation and LinkTranslation
```

### Step 5: Update Code to Populate source_version_at on Translation Creation
- **Description**: Identify and update code that creates translations to populate the new column
- **Rationale**: Ensure new translations capture source version timestamp going forward
- **Estimated Effort**: 20 minutes

Files likely needing updates:
- `/src/lib/job-queue/job-processor.ts`: When saving translations after processing
- `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`: When manually overriding translations
- Translation service utilities that create translation records

Changes needed:
- When fetching source content for translation, capture its `updated_at` timestamp
- When inserting/upserting translation record, include `source_version_at: sourceUpdatedAt`
- Example:
  ```typescript
  // Before translation
  const sourceItem = await getItem(itemId);
  const sourceVersionAt = sourceItem.updated_at;

  // After translation
  await supabase.from('item_translations').upsert({
    item_id: itemId,
    language: targetLanguage,
    name: translatedName,
    description: translatedDescription,
    translation_status: 'completed',
    translated_at: now,
    source_version_at: sourceVersionAt, // NEW
  });
  ```

**Note**: This step is technically part of integrating the new column into the system, but should be done immediately after migration to ensure consistency going forward.

### Step 6: Document Migration and Update Tracking
- **Description**: Update documentation to reflect new column and its usage
- **Rationale**: Ensure team understands the new column and how to use it
- **Estimated Effort**: 10 minutes

Documentation updates:
- Add comment to migration explaining purpose and stale detection logic
- Update README or technical docs about translation table schema
- Document stale detection query pattern:
  ```sql
  -- Find stale translations for an item
  SELECT t.*
  FROM item_translations t
  JOIN items i ON i.id = t.item_id
  WHERE t.source_version_at IS NOT NULL
    AND i.updated_at > t.source_version_at;
  ```
- Note that NULL source_version_at means "unknown version" (legacy translations)

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Database Migration
| Operation | Target | Type |
|-----------|--------|------|
| Supabase MCP | `item_translations` table | ALTER - add column |
| Supabase MCP | `article_translations` table | ALTER - add column |
| Supabase MCP | `link_translations` table | ALTER - add column |
| Supabase MCP | `item_translations` | CREATE INDEX |
| Supabase MCP | `article_translations` | CREATE INDEX |
| Supabase MCP | `link_translations` | CREATE INDEX |

### Type Generation
| File | Operation | Type |
|------|-----------|------|
| `src/types/database.generated.ts` | Regenerate types | Modify (auto-generated) |

### Optional Code Updates (Integration)
| File | Target | Type |
|------|--------|------|
| `/src/lib/job-queue/job-processor.ts` | `saveTranslation()` function | Modify - add source_version_at |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | PUT handler (lines 381-707) | Modify - add source_version_at |

## Dependencies

### Depends On (Completed First)
- **Epic 1 (Foundation)**: Translation tables must exist
  - Tables: `item_translations`, `article_translations`, `link_translations`
  - Core columns: `id`, `entity_id`, `language`, `translated_at`, `updated_at`
- **Database access**: Supabase MCP tool configured and working
- **Project**: Supabase project ID available for type generation

### Blocks (Requires This First)
- **REQ-E05-005**: Update TypeScript Database Types - needs this migration to be complete
- **Stale Translation Detection Features**: Any UI or API that shows "translation is outdated" warnings
- **REQ-E05-010**: Manual Edit Warning Dialog - uses source_version_at to detect stale translations
- **Translation Status API**: May need to query source_version_at to include isStale flag in responses

### Parallel Safety
- **Files touched**:
  - Database schema only (no code files directly modified)
  - Type generation file (auto-generated, safe)
- **Conflicts with**:
  - REQ-E05-002 (Update Translation API) - If that task also modifies translation table schema
  - Any other migrations that alter translation tables simultaneously
- **Safe to parallelize with**:
  - All Epic 5 UI component tasks (they read database, don't alter schema)
  - Epic 5 API endpoint tasks (different scope)
  - Type updates can happen after migration in same session

### External Dependencies
- Supabase PostgreSQL database (v15+)
- Supabase MCP tool for applying migrations
- TypeScript 5.x for type generation
- Node.js/npm for running type generation command

## Risks and Considerations

### Potential Side Effects
- **Existing code**: Code that inserts translations may fail if it doesn't handle new column
  - Mitigation: Column is nullable, so omitting it is safe
  - Mitigation: Use SELECT * cautiously - new column adds to result set

- **Query performance**: New indexes add overhead to INSERT/UPDATE operations
  - Mitigation: Indexes are on nullable timestamp column, relatively lightweight
  - Mitigation: Translation writes are async and infrequent compared to reads

- **NULL semantics**: Existing translations have NULL source_version_at
  - Mitigation: Document that NULL means "unknown version" (legacy translation)
  - Mitigation: Stale detection queries must check for NULL: `WHERE source_version_at IS NOT NULL`

- **Type generation timing**: Generated types may be out of sync briefly
  - Mitigation: Run type generation immediately after migration
  - Mitigation: Commit both migration record and type changes together

### Testing Requirements
- **Migration testing**:
  - Verify migration runs successfully on clean database
  - Verify migration is idempotent (can run twice without error)
  - Verify rollback migration removes columns and indexes cleanly

- **Data integrity testing**:
  - Verify existing translation records are unaffected (NULL value)
  - Verify new translations can be created with source_version_at populated
  - Verify new translations can still be created without source_version_at (backward compat)

- **Index performance testing**:
  - Query plan for stale translation detection uses new index
  - No significant INSERT/UPDATE performance degradation

- **Type generation testing**:
  - Verify TypeScript types include new column with correct type (string | null)
  - Verify code compiles after type regeneration

### Open Questions
- [ ] Should link_translations be included even though the request doesn't mention it? (Recommendation: Yes, for consistency)
- [ ] Should we add composite indexes immediately or wait for performance data? (Recommendation: Single column index first, add composite if needed)
- [ ] Should tag_translations get source_version_at? (Recommendation: No, tags don't have source entities with updated_at)
- [ ] Should we backfill source_version_at for existing translations? (Recommendation: No, leave NULL for legacy records)
- [ ] Should we add a trigger to auto-populate source_version_at? (Recommendation: No, do it in application code for clarity)

## Out of Scope

The following are explicitly **not** included in this task:
- Backfilling source_version_at values for existing translation records
- Implementing stale translation detection logic (that's separate Epic 5 tasks)
- Creating UI to display stale translation warnings
- Automatically re-translating stale content
- Creating triggers to update source_version_at when source content changes
- Adding source_version_at to tag_translations table
- Performance tuning or query optimization (unless migration causes issues)
- Modifying translation service logic (beyond populating the new column)
- Creating rollback migration script (recommended but separate task)
- Adding composite indexes beyond what's specified
- Database monitoring or alerting for stale translations

## Special Notes

### Migration Safety

This is a low-risk schema addition:
- **Additive only**: No columns removed, no data deleted
- **Nullable**: No NOT NULL constraint to break existing code
- **Idempotent**: Uses IF NOT EXISTS for safe re-runs
- **No downtime**: ALTER TABLE ADD COLUMN is non-blocking on PostgreSQL
- **Backward compatible**: Existing code continues to work without changes

### Stale Translation Detection Pattern

Once migration is complete, stale translations can be detected with:

```sql
-- Find all stale translations for items
SELECT
  t.item_id,
  t.language,
  t.translated_at,
  t.source_version_at,
  i.updated_at as source_updated_at,
  i.updated_at - t.source_version_at as staleness_duration
FROM item_translations t
JOIN items i ON i.id = t.item_id
WHERE t.source_version_at IS NOT NULL  -- Ignore legacy translations
  AND i.updated_at > t.source_version_at;  -- Source newer than translation

-- Similar queries for article_translations and link_translations
```

### Integration with Epic 5 Features

This migration enables several Epic 5 features:
1. **Translation Preview Panel**: Can show "stale" indicator for translations
2. **Manual Edit Warning**: Can warn when source content changed after manual edit
3. **Translation Status API**: Can include isStale flag in status responses
4. **Re-translate Endpoint**: Can prioritize stale translations in queue

### Future Enhancement Considerations

Potential follow-up improvements (out of scope for this task):
- Add composite indexes if query patterns show need
- Create materialized view for stale translation counts by property
- Add trigger to clear source_version_at when translation is invalidated
- Create scheduled job to identify and flag stale translations
- Add source_version_at to translation_jobs table for retry tracking

---
*Document generated: 2026-01-22 18:52*
