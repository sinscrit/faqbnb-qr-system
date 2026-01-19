# REQ-337: Create Automatic Updated Timestamp Trigger for Translation Tables - Implementation Overview

**Generated:** 2026-01-18 07:30:00 UTC
**Last Modified:** 2026-01-18 07:30:00 UTC
**Request Reference:** REQ-337 - Add updated_at trigger for translations
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.3)
**Status:** Ready for Implementation

---

## 1. Request Summary

Implement automatic `updated_at` timestamp management for translation tables using database triggers. This ensures accurate tracking of when translations were last modified, regardless of which code path performs the update.

**Key Objectives:**
1. Add `updated_at` column to `tag_translations` table (currently missing)
2. Create trigger for `tag_translations` table using existing trigger function
3. Verify all translation tables have consistent timestamp triggers
4. Ensure triggers work correctly with UPSERT operations

---

## 2. Current State Analysis

### Existing Trigger Function

A reusable trigger function already exists in the database schema:

**Location:** `/database/schema.sql` (lines 50-57)

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Translation Table Trigger Status

| Table | Has updated_at Column | Has Trigger | Status |
|-------|----------------------|-------------|--------|
| `article_translations` | Yes | `update_article_translations_updated_at` | Complete |
| `item_translations` | Yes | `update_item_translations_updated_at` | Complete |
| `link_translations` | Yes | `update_link_translations_updated_at` | Complete |
| `tag_translations` | **No** | **None** | **MISSING** |

### tag_translations Current Schema

**Location:** `/database/migrations/20260117_l10n_foundation.sql` (lines 88-98)

```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL,
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- NOTE: updated_at column is MISSING
  CONSTRAINT tag_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  UNIQUE(tag_key, language)
);
```

**Problem:** The `tag_translations` table lacks both the `updated_at` column and the corresponding trigger, making it inconsistent with other translation tables.

### Existing Trigger Patterns

All three existing triggers follow the same pattern:

```sql
CREATE TRIGGER update_{table}_updated_at
  BEFORE UPDATE ON {table}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. Technical Approach

### Step 1: Add updated_at Column to tag_translations

Add the missing column with a default value of `NOW()`:

```sql
ALTER TABLE tag_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

### Step 2: Create Trigger for tag_translations

Create the trigger using the existing function:

```sql
CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Verify Existing Triggers (Optional)

The request mentions verifying existing triggers. The current state shows:
- `article_translations`, `item_translations`, and `link_translations` already have triggers
- These were created in the foundation migration
- No action needed for these tables

---

## 4. Implementation Tasks

### Task 6.3.1: Add updated_at column to tag_translations table

**Action:** Apply database migration to add updated_at column
**Method:** Supabase MCP `apply_migration`

```sql
-- Add updated_at column to tag_translations table
-- Ensures consistency with other translation tables
ALTER TABLE tag_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing rows to have updated_at = created_at
UPDATE tag_translations
SET updated_at = created_at
WHERE updated_at IS NULL;
```

**Migration Name:** `add_tag_translations_updated_at_column`

### Task 6.3.2: Create trigger for tag_translations table

**Action:** Apply database migration to create trigger
**Method:** Supabase MCP `apply_migration`

```sql
-- Create updated_at trigger for tag_translations
-- Uses existing update_updated_at_column() function
CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Note:** PostgreSQL does not support `IF NOT EXISTS` for triggers. Use `DROP TRIGGER IF EXISTS` first for idempotency:

```sql
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Migration Name:** `create_tag_translations_updated_at_trigger`

### Task 6.3.3: Update TypeScript types for tag_translations

**Action:** Update `/src/lib/supabase.ts` to include updated_at column
**File:** `/src/lib/supabase.ts`

Add `updated_at` field to `tag_translations` type definition:

```typescript
tag_translations: {
  Row: {
    id: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag: boolean | null
    created_at: string | null
    updated_at: string | null  // ADD THIS
  }
  Insert: {
    id?: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag?: boolean | null
    created_at?: string | null
    updated_at?: string | null  // ADD THIS
  }
  Update: {
    id?: string
    tag_key?: string
    language?: string
    translated_value?: string
    is_system_tag?: boolean | null
    created_at?: string | null
    updated_at?: string | null  // ADD THIS
  }
  Relationships: []
}
```

### Task 6.3.4: Verify all translation triggers

**Action:** Query database to verify triggers exist
**Method:** Supabase MCP `execute_sql`

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE event_object_table LIKE '%translations'
ORDER BY event_object_table, trigger_name;
```

Expected results:

| trigger_name | event_manipulation | event_object_table | action_timing |
|--------------|-------------------|-------------------|---------------|
| update_article_translations_updated_at | UPDATE | article_translations | BEFORE |
| update_item_translations_updated_at | UPDATE | item_translations | BEFORE |
| update_link_translations_updated_at | UPDATE | link_translations | BEFORE |
| update_tag_translations_updated_at | UPDATE | tag_translations | BEFORE |

---

## 5. Authorized Files and Functions for Modification

### Database Changes (via Supabase MCP)

| Change Type | Object | Description |
|-------------|--------|-------------|
| ALTER TABLE | tag_translations | Add `updated_at` column |
| CREATE TRIGGER | update_tag_translations_updated_at | Automatic timestamp trigger |

### Files to MODIFY

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/supabase.ts` | Modify | Add `updated_at` field to `tag_translations` type definition |

### Sections to Modify in supabase.ts

| Location | Section | Change |
|----------|---------|--------|
| `Database.public.Tables.tag_translations.Row` | Row type | Add `updated_at: string \| null` |
| `Database.public.Tables.tag_translations.Insert` | Insert type | Add `updated_at?: string \| null` |
| `Database.public.Tables.tag_translations.Update` | Update type | Add `updated_at?: string \| null` |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/database/schema.sql` | Trigger function already exists |
| `/database/migrations/20260117_l10n_foundation.sql` | Original migration; changes go in new migration |
| Other translation tables | Already have triggers in place |
| Application code using tag_translations | Column is nullable with default; backward compatible |

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Status | Dependency Type |
|------|--------|-----------------|
| REQ-223 (L10N Foundation migration) | Complete | tag_translations table must exist |
| REQ-227 (TypeScript types) | Complete | Base tag_translations types exist |
| update_updated_at_column() function | Complete | Exists in schema.sql |

### Dependent Tasks (Unblock after completion)

| Task | Description |
|------|-------------|
| REQ-263 (Translation Storage Utilities) | storeTagTranslation will benefit from automatic timestamp |
| REQ-275 (Tag Translation Processor) | Job processor updates will be timestamped |
| REQ-330 (Manual Translation Override) | Manual overrides will have accurate timestamps |

---

## 7. Acceptance Criteria

From REQ-337:

- [ ] A database trigger function named `set_updated_at_timestamp` is created that sets `NEW.updated_at` to `CURRENT_TIMESTAMP`
  - **NOTE:** The existing `update_updated_at_column()` function serves this purpose; no new function needed
- [ ] The trigger function returns the modified NEW record to allow the update to proceed
  - **Verified:** Existing function returns `NEW`
- [ ] A BEFORE UPDATE trigger is created on the `item_translations` table invoking `set_updated_at_timestamp`
  - **Already exists:** `update_item_translations_updated_at`
- [ ] A BEFORE UPDATE trigger is created on the `article_translations` table invoking `set_updated_at_timestamp`
  - **Already exists:** `update_article_translations_updated_at`
- [ ] A BEFORE UPDATE trigger is created on the `link_translations` table invoking `set_updated_at_timestamp`
  - **Already exists:** `update_link_translations_updated_at`
- [ ] A BEFORE UPDATE trigger is created on the `tag_translations` table invoking `set_updated_at_timestamp`
  - **TO DO:** Create `update_tag_translations_updated_at`
- [ ] The trigger function uses `OR REPLACE` to allow safe re-execution of the migration
  - **Verified:** Existing function uses `CREATE OR REPLACE`
- [ ] The triggers are created using `IF NOT EXISTS` or `DROP/CREATE` pattern to allow safe re-execution
  - **Use DROP/CREATE pattern** (PostgreSQL doesn't support IF NOT EXISTS for triggers)
- [ ] When a translation record is updated, the `updated_at` column is automatically set without application code intervention
  - **Will verify after implementation**
- [ ] When a translation record is inserted, the `updated_at` column uses the default value without trigger interference
  - **Verified:** Trigger fires only on UPDATE, not INSERT
- [ ] The trigger function is created in the public schema or appropriate schema matching the translation tables
  - **Verified:** Function exists in public schema
- [ ] The migration is created through a Supabase migration with descriptive name (e.g., `add_translation_updated_at_trigger`)
  - **Will use:** `add_tag_translations_updated_at_trigger`
- [ ] The migration is applied using the Supabase MCP tool `apply_migration` function
- [ ] The migration SQL is idempotent and can be safely run multiple times
- [ ] The trigger function executes efficiently without measurable performance impact on update operations

---

## 8. Testing Strategy

### Column Existence Test

```sql
-- Verify updated_at column exists on tag_translations
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tag_translations'
  AND column_name = 'updated_at';
```

Expected: `updated_at | timestamp with time zone | now()`

### Trigger Existence Test

```sql
-- Verify all translation table triggers exist
SELECT
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table LIKE '%translations'
  AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;
```

Expected: 4 triggers (article, item, link, tag)

### Trigger Functionality Test

```sql
-- Test that trigger updates timestamp on UPDATE
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES ('test_trigger_tag', 'en', 'Test Value', false)
ON CONFLICT (tag_key, language) DO UPDATE
SET translated_value = 'Test Value';

-- Wait 1 second
SELECT pg_sleep(1);

-- Update the record
UPDATE tag_translations
SET translated_value = 'Updated Value'
WHERE tag_key = 'test_trigger_tag' AND language = 'en';

-- Verify updated_at changed
SELECT
  tag_key,
  translated_value,
  created_at,
  updated_at,
  (updated_at > created_at) as timestamp_updated
FROM tag_translations
WHERE tag_key = 'test_trigger_tag' AND language = 'en';

-- Cleanup
DELETE FROM tag_translations WHERE tag_key = 'test_trigger_tag';
```

Expected: `timestamp_updated = true`

### TypeScript Compilation Test

```bash
npm run build
# OR
npx tsc --noEmit
```

Expected: No type errors related to tag_translations

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Adding column locks table | Very Low | Low | `ADD COLUMN IF NOT EXISTS` is fast; table is small |
| Trigger creation fails | Very Low | Low | `DROP TRIGGER IF EXISTS` ensures idempotency |
| Existing system tag seeds affected | Very Low | None | Seeds use INSERT; trigger only fires on UPDATE |
| Application code breaks | None | None | Column is nullable with default; fully backward compatible |
| TypeScript types out of sync | Low | Low | Update types immediately after migration |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add updated_at column to tag_translations | 5 min |
| Create trigger for tag_translations | 3 min |
| Update TypeScript types | 5 min |
| Verify triggers on all translation tables | 5 min |
| Test trigger functionality | 5 min |
| **Total** | **~25 min** |

---

## 11. Migration SQL Summary

### Combined Migration (Recommended)

**Migration Name:** `add_tag_translations_updated_at_trigger`

```sql
-- ===========================================================
-- REQ-337: Add updated_at Trigger for Translation Tables
-- File: add_tag_translations_updated_at_trigger
-- Generated: 2026-01-18
-- Epic: L10N Epic 3, Phase 6, Task 6.3
-- ===========================================================
-- Purpose: Add updated_at column and trigger to tag_translations
-- for consistency with other translation tables.
--
-- The update_updated_at_column() function already exists in the
-- database schema and is reused by this migration.
-- ===========================================================

-- 1. Add updated_at column to tag_translations table
ALTER TABLE tag_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Backfill existing rows: set updated_at = created_at where null
UPDATE tag_translations
SET updated_at = created_at
WHERE updated_at IS NULL;

-- 3. Create BEFORE UPDATE trigger for automatic timestamp management
-- Using DROP/CREATE pattern for idempotency (PostgreSQL doesn't support IF NOT EXISTS for triggers)
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Add column comment for documentation
COMMENT ON COLUMN tag_translations.updated_at IS
  'Timestamp of last modification, automatically updated by trigger';

-- ===========================================================
-- ROLLBACK SCRIPT (if needed):
-- DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;
-- ALTER TABLE tag_translations DROP COLUMN IF EXISTS updated_at;
-- ===========================================================
```

---

## 12. Post-Implementation Steps

After completing this task:

1. **Verify all 4 translation tables** have consistent `updated_at` triggers
2. **Run TypeScript compilation** to ensure types are in sync
3. **Update REQ-263** (Translation Storage Utilities): Storage functions can now rely on automatic timestamp
4. **Update REQ-275** (Tag Translation Processor): Processor updates will be timestamped automatically
5. **Proceed to Phase 7:** Testing & Validation tasks

---

## 13. Implementation Notes

### Why tag_translations Was Different

The original L10N Foundation migration (REQ-223) created the `tag_translations` table without an `updated_at` column, likely because:
1. Tags were initially treated as mostly static (system tags are seeded once)
2. User-created tags weren't initially expected to be updated frequently

However, with Epic 3's dynamic content translation features (manual overrides, retry mechanisms), consistent timestamp tracking is essential.

### Trigger Function Naming

The REQ-337 acceptance criteria mention a function named `set_updated_at_timestamp`, but the existing function is named `update_updated_at_column()`. Both accomplish the same goal. This implementation reuses the existing function for consistency with other translation tables.

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [REQ-223: L10N Foundation Migration](/docs/gen_requests_epic1.md#req-223)
- [Foundation Migration File](/database/migrations/20260117_l10n_foundation.sql)
- [PostgreSQL Trigger Documentation](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase MCP apply_migration](https://supabase.com/docs)
