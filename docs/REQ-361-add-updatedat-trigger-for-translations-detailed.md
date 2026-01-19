# REQ-361: Add Updated Timestamp Trigger for Translation Tables - Detailed Task Breakdown

**Generated:** 2026-01-19 21:45:00 UTC
**Last Modified:** 2026-01-19 21:45:00 UTC
**Request Reference:** REQ-361 - Add Updated Timestamp Trigger for Translation Tables
**Overview Document:** REQ-361-add-updatedat-trigger-for-translations-overview.md
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 6, Task 6.3)
**Status:** Ready for Implementation

---

## Executive Summary

This task ensures all translation tables have automatic `updated_at` timestamp maintenance through database triggers. Three tables (`item_translations`, `article_translations`, `link_translations`) already have triggers from the L10N Foundation migration. The primary work involves adding the missing `updated_at` column and trigger to the `tag_translations` table to achieve consistency across all translation tables.

**Scope:** Database migration + TypeScript type update
**Estimated Effort:** ~25 minutes
**Risk Level:** Low

---

## Prerequisites

| Prerequisite | Status | Verification |
|--------------|--------|--------------|
| L10N Foundation migration applied (REQ-223) | Required | `tag_translations` table exists |
| TypeScript types for translations (REQ-227) | Required | Types exist in `/src/lib/supabase.ts` |
| `update_updated_at_column()` function exists | Required | Function in `database/schema.sql` |
| Supabase MCP access | Required | Can run `apply_migration` and `execute_sql` |

---

## Task Breakdown

### Task 6.3.1: Verify Existing Trigger Infrastructure

**Priority:** High | **Estimated Time:** 3 minutes | **Type:** Verification

#### Objective
Confirm that the required trigger function and existing triggers are in place before proceeding.

#### Steps

1. **Verify `update_updated_at_column()` function exists**
   - Method: Supabase MCP `execute_sql`
   - Query:
     ```sql
     SELECT proname, prosrc
     FROM pg_proc
     WHERE proname = 'update_updated_at_column';
     ```
   - Expected: One row with function definition

2. **Verify existing triggers on translation tables**
   - Method: Supabase MCP `execute_sql`
   - Query:
     ```sql
     SELECT
       tgname AS trigger_name,
       relname AS table_name,
       CASE WHEN tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END AS status
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
   - Expected: 3 rows (item, article, link triggers exist; tag trigger missing)

3. **Verify `tag_translations` table schema**
   - Method: Supabase MCP `execute_sql`
   - Query:
     ```sql
     SELECT column_name, data_type, column_default, is_nullable
     FROM information_schema.columns
     WHERE table_name = 'tag_translations'
     ORDER BY ordinal_position;
     ```
   - Expected: `updated_at` column should be MISSING

#### Acceptance Criteria
- [ ] `update_updated_at_column()` function exists and is functional
- [ ] Triggers exist for `item_translations`, `article_translations`, `link_translations`
- [ ] No trigger exists yet for `tag_translations`
- [ ] `tag_translations` table lacks `updated_at` column

#### Files Modified
None (verification only)

---

### Task 6.3.2: Add `updated_at` Column to `tag_translations` Table

**Priority:** High | **Estimated Time:** 5 minutes | **Type:** Database Migration

#### Objective
Add the missing `updated_at` column to the `tag_translations` table with appropriate default value for existing rows.

#### Implementation

**Method:** Supabase MCP `apply_migration`

**Migration Name:** `add_tag_translations_updated_at_column`

**SQL:**
```sql
-- ===========================================================
-- REQ-361: Add updated_at column to tag_translations
-- Epic 3, Phase 6, Task 6.3.2
-- Generated: 2026-01-19
-- ===========================================================
-- Purpose: Add updated_at column to tag_translations table
--          to enable automatic timestamp tracking on updates.
-- ===========================================================

-- Add updated_at column to tag_translations table
-- Existing rows will get current timestamp as default value
ALTER TABLE tag_translations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add documentation comment
COMMENT ON COLUMN tag_translations.updated_at IS
  'Timestamp of last translation modification, automatically maintained by trigger - REQ-361';

-- ===========================================================
-- ROLLBACK (if needed):
-- ALTER TABLE tag_translations DROP COLUMN IF EXISTS updated_at;
-- ===========================================================
```

#### Post-Migration Verification
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tag_translations'
  AND column_name = 'updated_at';
```
Expected: `updated_at | timestamp with time zone | now()`

#### Acceptance Criteria
- [ ] `updated_at` column added to `tag_translations` table
- [ ] Column type is `TIMESTAMPTZ`
- [ ] Column default is `NOW()`
- [ ] Existing rows have `updated_at` populated with current timestamp
- [ ] Column allows NULL values (for flexibility)

#### Files Modified
- Database: `tag_translations` table schema

---

### Task 6.3.3: Create `updated_at` Trigger for `tag_translations` Table

**Priority:** High | **Estimated Time:** 5 minutes | **Type:** Database Migration

#### Objective
Create a BEFORE UPDATE trigger on `tag_translations` that automatically sets `updated_at` to the current timestamp when any column is modified.

#### Implementation

**Method:** Supabase MCP `apply_migration`

**Migration Name:** `create_tag_translations_updated_at_trigger`

**SQL:**
```sql
-- ===========================================================
-- REQ-361: Create updated_at trigger for tag_translations
-- Epic 3, Phase 6, Task 6.3.3
-- Generated: 2026-01-19
-- ===========================================================
-- Purpose: Create automatic timestamp trigger for tag_translations
--          to match behavior of other translation tables.
-- ===========================================================

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

-- Create updated_at trigger for tag_translations
-- Uses existing update_updated_at_column() function from schema.sql
CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add documentation comment
COMMENT ON TRIGGER update_tag_translations_updated_at ON tag_translations IS
  'Automatically updates updated_at column on any modification - REQ-361';

-- ===========================================================
-- ROLLBACK (if needed):
-- DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;
-- ===========================================================
```

#### Post-Migration Verification
```sql
SELECT tgname, tgenabled, pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'tag_translations'
  AND tgname = 'update_tag_translations_updated_at';
```
Expected: One row with trigger definition

#### Acceptance Criteria
- [ ] Trigger `update_tag_translations_updated_at` created on `tag_translations` table
- [ ] Trigger fires BEFORE UPDATE
- [ ] Trigger executes `update_updated_at_column()` function
- [ ] Trigger has documentation comment
- [ ] Trigger is enabled (tgenabled = 'O')

#### Files Modified
- Database: `tag_translations` table triggers

---

### Task 6.3.4: Update TypeScript Types for `tag_translations`

**Priority:** High | **Estimated Time:** 5 minutes | **Type:** Code Modification

#### Objective
Add the `updated_at` field to the `tag_translations` TypeScript type definitions to maintain type safety with the updated database schema.

#### File to Modify
`/src/lib/supabase.ts`

#### Current Code (to find)
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

#### New Code (replace with)
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

#### Changes Summary

| Section | Field to Add | Type |
|---------|--------------|------|
| `tag_translations.Row` | `updated_at` | `string \| null` |
| `tag_translations.Insert` | `updated_at` | `string \| null` (optional) |
| `tag_translations.Update` | `updated_at` | `string \| null` (optional) |

#### Acceptance Criteria
- [ ] `updated_at: string | null` added to `tag_translations.Row`
- [ ] `updated_at?: string | null` added to `tag_translations.Insert`
- [ ] `updated_at?: string | null` added to `tag_translations.Update`
- [ ] TypeScript compilation succeeds without errors
- [ ] Type comments indicate REQ-361 reference

#### Files Modified
- `/src/lib/supabase.ts` - Add `updated_at` to tag_translations types

---

### Task 6.3.5: Verify All Translation Table Triggers

**Priority:** High | **Estimated Time:** 5 minutes | **Type:** Verification

#### Objective
Confirm that all four translation tables now have properly functioning `updated_at` triggers.

#### Verification Steps

1. **Query all translation table triggers**
   - Method: Supabase MCP `execute_sql`
   - Query:
     ```sql
     SELECT
       relname AS table_name,
       tgname AS trigger_name,
       CASE WHEN tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END AS status
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
   - Expected Result:
     | table_name | trigger_name | status |
     |------------|--------------|--------|
     | article_translations | update_article_translations_updated_at | enabled |
     | item_translations | update_item_translations_updated_at | enabled |
     | link_translations | update_link_translations_updated_at | enabled |
     | tag_translations | update_tag_translations_updated_at | enabled |

2. **Verify trigger count is exactly 4**

#### Acceptance Criteria
- [ ] Query returns exactly 4 rows
- [ ] All triggers are enabled
- [ ] Trigger names follow consistent naming pattern

#### Files Modified
None (verification only)

---

### Task 6.3.6: Functional Test - Verify Trigger Behavior

**Priority:** Medium | **Estimated Time:** 5 minutes | **Type:** Testing

#### Objective
Verify the trigger correctly updates `updated_at` when a `tag_translations` record is modified.

#### Test Steps

**Method:** Supabase MCP `execute_sql`

1. **Insert a test record**
   ```sql
   INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
   VALUES ('__test_trigger_req361__', 'fr', 'Test initial value', false)
   RETURNING id, tag_key, language, translated_value, created_at, updated_at;
   ```
   - Expected: `created_at` and `updated_at` should be approximately equal (both set to NOW())

2. **Wait briefly and update the record**
   ```sql
   -- Small delay to ensure timestamp difference is visible
   SELECT pg_sleep(1);

   UPDATE tag_translations
   SET translated_value = 'Test updated value'
   WHERE tag_key = '__test_trigger_req361__' AND language = 'fr'
   RETURNING id, tag_key, translated_value, created_at, updated_at;
   ```
   - Expected: `updated_at` should be later than `created_at`

3. **Verify timestamp difference**
   ```sql
   SELECT
     tag_key,
     created_at,
     updated_at,
     CASE WHEN updated_at > created_at THEN 'PASS' ELSE 'FAIL' END AS test_result
   FROM tag_translations
   WHERE tag_key = '__test_trigger_req361__';
   ```
   - Expected: `test_result` = 'PASS'

4. **Cleanup test data**
   ```sql
   DELETE FROM tag_translations WHERE tag_key = '__test_trigger_req361__';
   ```

#### Acceptance Criteria
- [ ] INSERT operation sets both `created_at` and `updated_at` to current time
- [ ] UPDATE operation changes `updated_at` but leaves `created_at` unchanged
- [ ] `updated_at` is strictly greater than `created_at` after UPDATE
- [ ] Test data is cleaned up

#### Files Modified
None (testing only)

---

### Task 6.3.7: TypeScript Build Verification

**Priority:** Medium | **Estimated Time:** 2 minutes | **Type:** Verification

#### Objective
Verify that the TypeScript type changes compile without errors.

#### Steps

1. **Run TypeScript compilation**
   ```bash
   npm run build
   ```
   - Expected: Build succeeds without type errors related to `tag_translations`

2. **Check for type errors specifically**
   ```bash
   npx tsc --noEmit
   ```
   - Expected: No errors

#### Acceptance Criteria
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors related to `tag_translations` or `updated_at`

#### Files Modified
None (verification only)

---

## Summary of All Tasks

| Task ID | Title | Type | Est. Time | Priority |
|---------|-------|------|-----------|----------|
| 6.3.1 | Verify Existing Trigger Infrastructure | Verification | 3 min | High |
| 6.3.2 | Add `updated_at` Column to `tag_translations` | DB Migration | 5 min | High |
| 6.3.3 | Create `updated_at` Trigger for `tag_translations` | DB Migration | 5 min | High |
| 6.3.4 | Update TypeScript Types for `tag_translations` | Code Modification | 5 min | High |
| 6.3.5 | Verify All Translation Table Triggers | Verification | 5 min | High |
| 6.3.6 | Functional Test - Verify Trigger Behavior | Testing | 5 min | Medium |
| 6.3.7 | TypeScript Build Verification | Verification | 2 min | Medium |
| **Total** | | | **~30 min** | |

---

## Files to Modify

| File Path | Task(s) | Change Type |
|-----------|---------|-------------|
| `/src/lib/supabase.ts` | 6.3.4 | Add `updated_at` field to `tag_translations` types |

## Database Objects to Create/Modify

| Object Type | Object Name | Task(s) | Change |
|-------------|-------------|---------|--------|
| Column | `tag_translations.updated_at` | 6.3.2 | ADD COLUMN |
| Trigger | `update_tag_translations_updated_at` | 6.3.3 | CREATE TRIGGER |

---

## Rollback Plan

If issues occur, execute the following rollback SQL:

```sql
-- Rollback REQ-361 changes
-- Run manually via Supabase MCP if needed

-- Step 1: Drop the trigger
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

-- Step 2: Drop the column
ALTER TABLE tag_translations DROP COLUMN IF EXISTS updated_at;

-- Note: Do NOT drop update_updated_at_column() function
-- as it is shared by other translation tables
```

For TypeScript changes, revert `/src/lib/supabase.ts` to previous version via git.

---

## Acceptance Criteria Checklist

### From REQ-361 Request Document

- [ ] Database trigger function is created that sets updated_at to current timestamp
  - **Status:** Already exists (`update_updated_at_column()`)
- [ ] Trigger is attached to item_translations table for UPDATE operations
  - **Status:** Already exists
- [ ] Trigger is attached to article_translations table for UPDATE operations
  - **Status:** Already exists
- [ ] Trigger is attached to link_translations table for UPDATE operations
  - **Status:** Already exists
- [ ] Trigger is attached to tag_translations table for UPDATE operations
  - **Status:** TO DO (Task 6.3.3)
- [ ] Trigger only fires on UPDATE operations, not INSERT operations
  - **Status:** Confirmed by BEFORE UPDATE trigger type
- [ ] Migration includes appropriate comments documenting trigger purpose
  - **Status:** TO DO (included in migration SQL)
- [ ] Migration is tested to verify updated_at changes when translation text is modified
  - **Status:** TO DO (Task 6.3.6)
- [ ] Migration includes rollback script that removes triggers and function
  - **Status:** Included in comments
- [ ] Trigger function follows PostgreSQL best practices for performance
  - **Status:** Uses existing optimized function
- [ ] Existing translation records are not affected by trigger installation
  - **Status:** BEFORE UPDATE trigger only fires on future updates

### From Implementation Plan (Phase 6, Task 6.3)

- [ ] `updated_at` column added to `tag_translations` table (Task 6.3.2)
- [ ] `update_tag_translations_updated_at` trigger created (Task 6.3.3)
- [ ] Trigger uses existing `update_updated_at_column()` function (Task 6.3.3)
- [ ] TypeScript type definitions updated (Task 6.3.4)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ALTER TABLE locks table briefly | Very Low | Low | `IF NOT EXISTS` makes it fast; table is small |
| Trigger creation fails | Very Low | Low | Function exists; DROP IF EXISTS before CREATE |
| TypeScript types out of sync | Low | Low | Update immediately after migration |
| Existing records affected | None | N/A | BEFORE UPDATE trigger doesn't touch existing data |
| Migration partially applied | Very Low | Medium | Each task is atomic; rollback available |

---

## Notes

### Why Only `tag_translations` Needs Changes

The L10N Foundation migration (REQ-223) already created triggers for:
- `item_translations`
- `article_translations`
- `link_translations`

However, `tag_translations` was intentionally designed without `updated_at` because tag translations were originally considered immutable. This task adds consistency by treating all translation tables the same way.

### Trigger Behavior

The `update_updated_at_column()` function always overwrites `updated_at` with `NOW()`. This is standard PostgreSQL behavior and acceptable per the requirements. The trigger fires on ANY UPDATE, regardless of which columns are modified.

### Testing Notes

The functional test (Task 6.3.6) uses a specially prefixed tag key (`__test_trigger_req361__`) to avoid conflicts with real data. Always clean up test data after verification.

---

## References

- [Overview Document](/docs/REQ-361-add-updatedat-trigger-for-translations-overview.md)
- [Implementation Plan - Plan-111](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Document](/docs/gen_requests_epic3.md#req-361)
- [L10N Foundation Migration](/database/migrations/20260117_l10n_foundation.sql)
- [Database Schema](/database/schema.sql)
- [PostgreSQL Trigger Documentation](https://www.postgresql.org/docs/current/sql-createtrigger.html)
