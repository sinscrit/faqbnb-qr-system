# REQ-361: Add Updated Timestamp Trigger for Translation Tables - Implementation Overview

**Generated:** 2026-01-19 21:15:00 UTC
**Last Modified:** 2026-01-19 21:15:00 UTC
**Request Reference:** REQ-361 - Add Updated Timestamp Trigger for Translation Tables
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.3)
**Status:** Ready for Implementation

---

## 1. Request Summary

Ensure all translation tables have automatic `updated_at` timestamp maintenance through database triggers. When any translation record is modified, the `updated_at` column should automatically reflect the current timestamp, providing accurate audit trails for translation modifications.

**Key Objectives:**
1. Verify existing triggers on `article_translations`, `item_translations`, and `link_translations`
2. Add missing `updated_at` column to `tag_translations` table
3. Create `updated_at` trigger for `tag_translations` table
4. Update TypeScript types to reflect the new column

---

## 2. Current State Analysis

### Existing Trigger Infrastructure

The database already has a reusable trigger function defined in `database/schema.sql`:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Translation Tables Trigger Status

| Table | Has `updated_at` Column | Has Trigger | Status |
|-------|-------------------------|-------------|--------|
| `item_translations` | Yes | Yes (`update_item_translations_updated_at`) | Complete |
| `article_translations` | Yes | Yes (`update_article_translations_updated_at`) | Complete |
| `link_translations` | Yes | Yes (`update_link_translations_updated_at`) | Complete |
| `tag_translations` | **No** | **No** | **Needs Work** |

### Source: L10N Foundation Migration

From `/database/migrations/20260117_l10n_foundation.sql`:

```sql
-- Lines 163-176: Existing triggers
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

**Note:** The `tag_translations` table was intentionally created without `updated_at` in the original design, as tag translations were considered immutable. However, the current requirements specify that all translation tables need consistent timestamp tracking for audit purposes.

### Current tag_translations Table Structure

| Column | Data Type | Default | Notes |
|--------|-----------|---------|-------|
| id | uuid | gen_random_uuid() | PRIMARY KEY |
| tag_key | varchar(100) | - | NOT NULL |
| language | varchar(5) | - | CHECK (en, fr, es, de, nl, it) |
| translated_value | varchar(255) | - | NOT NULL |
| is_system_tag | boolean | false | - |
| created_at | timestamptz | now() | - |
| **updated_at** | **MISSING** | - | **Needs to be added** |

### Current TypeScript Type Definition

From `/src/lib/supabase.ts`:

```typescript
tag_translations: {
  Row: {
    id: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag: boolean | null
    created_at: string | null
    // updated_at is MISSING
  }
  // Insert and Update types also lack updated_at
}
```

---

## 3. Technical Approach

### Step 1: Add updated_at Column to tag_translations

Add the missing column with a default value for existing rows:

```sql
ALTER TABLE tag_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

### Step 2: Create Trigger for tag_translations

Create the trigger using the existing `update_updated_at_column()` function:

```sql
CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Update TypeScript Types

Add `updated_at` field to the `tag_translations` type definition in `/src/lib/supabase.ts`.

### Step 4: Verify All Triggers

Confirm all four translation tables have properly functioning triggers.

---

## 4. Implementation Tasks

### Task 6.3.1: Add updated_at column to tag_translations table

**Action:** Apply database migration
**Method:** Supabase MCP `apply_migration`

```sql
-- Add updated_at column to tag_translations table
-- Existing rows will get current timestamp as default
ALTER TABLE tag_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN tag_translations.updated_at IS
  'Timestamp of last translation modification, automatically maintained by trigger';
```

**Migration Name:** `add_tag_translations_updated_at_column`

### Task 6.3.2: Create updated_at trigger for tag_translations

**Action:** Apply database migration
**Method:** Supabase MCP `apply_migration`

```sql
-- Create updated_at trigger for tag_translations
-- Uses existing update_updated_at_column() function from schema.sql
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_tag_translations_updated_at ON tag_translations IS
  'Automatically updates updated_at column on any modification - REQ-361';
```

**Migration Name:** `create_tag_translations_updated_at_trigger`

### Task 6.3.3: Update TypeScript types for tag_translations

**Action:** Update type definitions
**File:** `/src/lib/supabase.ts`

Add `updated_at` field to `tag_translations` type definition in Row, Insert, and Update sections.

### Task 6.3.4: Verify all translation table triggers

**Action:** Query database to verify triggers
**Method:** Supabase MCP `execute_sql`

```sql
SELECT
  tgname AS trigger_name,
  relname AS table_name,
  proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE relname IN (
  'item_translations',
  'article_translations',
  'link_translations',
  'tag_translations'
)
AND tgname LIKE 'update_%_updated_at'
ORDER BY relname;
```

Expected result: 4 rows (one trigger per translation table)

---

## 5. Authorized Files and Functions for Modification

### Database Changes (via Supabase MCP)

| Change Type | Object | Description |
|-------------|--------|-------------|
| ALTER TABLE | tag_translations | Add `updated_at` column with DEFAULT NOW() |
| CREATE TRIGGER | update_tag_translations_updated_at | Automatic timestamp trigger for tag_translations |

### Files to MODIFY

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/supabase.ts` | Modify | Add `updated_at` field to `tag_translations` type definitions |

### Sections to Modify in supabase.ts

| Location | Section | Change |
|----------|---------|--------|
| `Database.public.Tables.tag_translations.Row` | Row type | Add `updated_at: string \| null` |
| `Database.public.Tables.tag_translations.Insert` | Insert type | Add `updated_at?: string \| null` |
| `Database.public.Tables.tag_translations.Update` | Update type | Add `updated_at?: string \| null` |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/database/migrations/20260117_l10n_foundation.sql` | Original migration is already applied; use new migration |
| `/database/schema.sql` | `update_updated_at_column()` function already exists |
| `/src/lib/content-translation/*.ts` | Content translation code changes are separate tasks |
| `/src/app/api/**` | API routes don't change for trigger creation |

### Functions/Types to MODIFY

| Component | Location | Change Description |
|-----------|----------|-------------------|
| `tag_translations.Row` | `/src/lib/supabase.ts` | Add `updated_at: string \| null` |
| `tag_translations.Insert` | `/src/lib/supabase.ts` | Add `updated_at?: string \| null` |
| `tag_translations.Update` | `/src/lib/supabase.ts` | Add `updated_at?: string \| null` |

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Status | Dependency Type |
|------|--------|-----------------|
| REQ-223 (L10N Foundation migration) | Complete | tag_translations table exists |
| REQ-227 (TypeScript types) | Complete | Base tag_translations types exist |
| L10N Epic 1 (Plan-110) | Complete | Foundation infrastructure in place |

### Dependent Tasks (Unblocked after completion)

| Task | Description |
|------|-------------|
| Translation status utilities | Can now track tag translation modification times |
| Translation audit features | Accurate timestamps for all translation modifications |
| Manual override tracking | Updated_at reflects when manual edits occur |

---

## 7. Acceptance Criteria

### From REQ-361 Request

- [ ] Database trigger function is created that sets updated_at to current timestamp
  - **Already exists:** `update_updated_at_column()` in schema.sql
- [ ] Trigger is attached to item_translations table for UPDATE operations
  - **Already exists:** `update_item_translations_updated_at`
- [ ] Trigger is attached to article_translations table for UPDATE operations
  - **Already exists:** `update_article_translations_updated_at`
- [ ] Trigger is attached to link_translations table for UPDATE operations
  - **Already exists:** `update_link_translations_updated_at`
- [ ] Trigger is attached to tag_translations table for UPDATE operations
  - **TO DO:** Create `update_tag_translations_updated_at`
- [ ] Trigger only fires on UPDATE operations, not INSERT operations
  - **Note:** BEFORE UPDATE triggers only fire on UPDATE
- [ ] Trigger does not fire if updated_at is explicitly set in the UPDATE statement to a different value
  - **Note:** Current trigger implementation always sets updated_at regardless; this is standard behavior and acceptable
- [ ] Migration includes appropriate comments documenting trigger purpose
  - **TO DO:** Include COMMENT ON TRIGGER statement
- [ ] Migration is tested to verify updated_at changes when translation text is modified
  - **TO DO:** Verification query after migration
- [ ] Migration is tested to verify updated_at changes when translation status is modified
  - **N/A:** tag_translations does not have translation_status column
- [ ] Migration includes rollback script that removes triggers and function
  - **TO DO:** Include rollback SQL in comments
- [ ] Trigger function follows PostgreSQL best practices for performance
  - **Already exists:** Simple, efficient function
- [ ] Existing translation records are not affected by trigger installation
  - **Note:** Trigger only fires on UPDATE; existing rows unchanged until modified

### From Implementation Plan (Phase 6, Task 6.3)

- [ ] `updated_at` column added to `tag_translations` table
- [ ] `update_tag_translations_updated_at` trigger created on tag_translations
- [ ] Trigger uses existing `update_updated_at_column()` function
- [ ] TypeScript type definitions updated for tag_translations

---

## 8. Testing Strategy

### Column Existence Verification

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tag_translations'
  AND column_name = 'updated_at';
```

Expected: `updated_at | timestamp with time zone | now()`

### Trigger Verification

```sql
SELECT tgname, tgenabled, pg_get_triggerdef(t.oid)
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'tag_translations'
  AND tgname = 'update_tag_translations_updated_at';
```

Expected: One row with trigger definition

### All Translation Tables Trigger Verification

```sql
SELECT
  relname AS table_name,
  tgname AS trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE relname IN (
  'item_translations',
  'article_translations',
  'link_translations',
  'tag_translations'
)
AND tgname LIKE 'update_%_updated_at'
ORDER BY relname;
```

Expected: 4 rows

### Functional Test - Trigger Behavior

```sql
-- Insert test record
INSERT INTO tag_translations (tag_key, language, translated_value)
VALUES ('test_trigger', 'fr', 'Test initial')
RETURNING id, created_at, updated_at;

-- Verify initial state (created_at should equal updated_at)

-- Wait 1 second and update
UPDATE tag_translations
SET translated_value = 'Test updated'
WHERE tag_key = 'test_trigger' AND language = 'fr'
RETURNING id, created_at, updated_at;

-- Verify updated_at changed but created_at did not

-- Cleanup
DELETE FROM tag_translations WHERE tag_key = 'test_trigger';
```

### TypeScript Compilation

```bash
npm run build
```

Expected: No type errors related to tag_translations

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ALTER TABLE locks table | Very Low | Low | IF NOT EXISTS; table is small |
| Trigger creation fails | Very Low | Low | Function already exists |
| TypeScript types out of sync | Low | Low | Update immediately after migration |
| Existing records affected | None | N/A | Trigger only fires on UPDATE |
| Migration already applied | Very Low | Low | IF NOT EXISTS for column; DROP IF EXISTS before CREATE TRIGGER |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add updated_at column to tag_translations | 5 min |
| Create tag_translations trigger | 3 min |
| Update TypeScript types | 5 min |
| Verify all triggers | 5 min |
| Run functional test | 5 min |
| **Total** | **~25 min** |

---

## 11. Migration SQL Summary

### Combined Migration (Recommended)

**Migration Name:** `add_tag_translations_updated_at_trigger`

```sql
-- ===========================================================
-- REQ-361: Add updated_at trigger for tag_translations
-- Epic 3, Phase 6, Task 6.3
-- Generated: 2026-01-19
-- ===========================================================
-- Purpose: Add updated_at column and automatic timestamp
--          trigger to tag_translations table to match other
--          translation tables.
-- ===========================================================

-- 1. Add updated_at column to tag_translations table
-- Existing rows will get current timestamp as default value
ALTER TABLE tag_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create updated_at trigger for tag_translations
-- Uses existing update_updated_at_column() function from schema.sql
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Add documentation comments
COMMENT ON COLUMN tag_translations.updated_at IS
  'Timestamp of last translation modification, automatically maintained by trigger - REQ-361';

COMMENT ON TRIGGER update_tag_translations_updated_at ON tag_translations IS
  'Automatically updates updated_at column on any modification - REQ-361';

-- ===========================================================
-- ROLLBACK SCRIPT (commented)
-- Run manually to reverse this migration if needed
-- ===========================================================
--
-- DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;
-- ALTER TABLE tag_translations DROP COLUMN IF EXISTS updated_at;
--
-- Note: The update_updated_at_column() function is shared and should NOT be dropped
```

---

## 12. TypeScript Type Update

### Before (Current)

```typescript
tag_translations: {
  Row: {
    id: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag: boolean | null
    created_at: string | null
  }
  Insert: {
    id?: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag?: boolean | null
    created_at?: string | null
  }
  Update: {
    id?: string
    tag_key?: string
    language?: string
    translated_value?: string
    is_system_tag?: boolean | null
    created_at?: string | null
  }
  Relationships: []
}
```

### After (Updated)

```typescript
tag_translations: {
  Row: {
    id: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag: boolean | null
    created_at: string | null
    updated_at: string | null  // REQ-361: Added for timestamp tracking
  }
  Insert: {
    id?: string
    tag_key: string
    language: string
    translated_value: string
    is_system_tag?: boolean | null
    created_at?: string | null
    updated_at?: string | null  // REQ-361: Added for timestamp tracking
  }
  Update: {
    id?: string
    tag_key?: string
    language?: string
    translated_value?: string
    is_system_tag?: boolean | null
    created_at?: string | null
    updated_at?: string | null  // REQ-361: Added for timestamp tracking
  }
  Relationships: []
}
```

---

## 13. Post-Implementation Steps

After completing this task:

1. **Verify all triggers:** Run verification query to confirm all 4 translation tables have updated_at triggers
2. **Run functional test:** Execute the trigger behavior test to confirm automatic timestamp updates
3. **Update application code (if needed):** Any code that manually sets updated_at can now rely on the trigger
4. **Phase 7 Tasks:** Testing and validation can now include timestamp consistency checks

---

## 14. Design Notes

### Why tag_translations Was Originally Missing updated_at

The original L10N Foundation migration (REQ-223) intentionally omitted the `updated_at` column from `tag_translations` based on the assumption that tag translations would be immutable once created. This design decision was documented in REQ-227-update-typescript-database-types-detailed.md:

> "`tag_translations` has no `updated_at` column - this is intentional as translations are typically immutable once set"

### Why We're Adding It Now

The current requirements (REQ-361 and implementation plan Phase 6, Task 6.3) specify that all translation tables should have consistent timestamp tracking:

1. **Audit trail:** Enables tracking when translations were last modified
2. **Consistency:** All translation tables should behave the same way
3. **Manual edits:** Owners can now edit translations (Epic 5), requiring modification tracking
4. **Quality control:** Translation monitoring tools need accurate timestamps

---

## References

- [Implementation Plan - Plan-111-L10N-Epic3](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Document - gen_requests_epic3.md](/docs/gen_requests_epic3.md#req-361)
- [L10N Foundation Migration](/database/migrations/20260117_l10n_foundation.sql)
- [Database Schema - schema.sql](/database/schema.sql)
- [PostgreSQL Trigger Documentation](https://www.postgresql.org/docs/current/sql-createtrigger.html)
