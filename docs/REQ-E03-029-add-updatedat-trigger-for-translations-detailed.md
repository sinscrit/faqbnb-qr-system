# REQ-E03-029: Add Updated_At Trigger for Translations - Detailed Task Breakdown

**Detailed Implementation Document**

---

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E03-029 |
| **Title** | Add Updated_At Trigger for Translations |
| **Type** | ENHANCEMENT |
| **Size** | S (Small) |
| **Epic** | Epic 3 - Dynamic Content Translation |
| **Phase** | 6 - Database Indexes & Optimization |
| **Task ID** | 6.3 |
| **Date Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 17:30 UTC |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Overview Document** | REQ-E03-029-add-updatedat-trigger-for-translations-overview.md |
| **Story Points** | 2 |

---

## Executive Summary

This task adds database triggers to automatically update the `updated_at` timestamp column whenever translation records are modified. Based on database investigation, triggers already exist for `item_translations`, `article_translations`, and `link_translations` tables, but the `tag_translations` table requires both the `updated_at` column and trigger to be added.

**Key Finding:** The scope is limited to `tag_translations` only, as all other translation tables already have the required triggers.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 translation tables exist (item_translations, article_translations, link_translations, tag_translations)
- [ ] `update_updated_at_column()` trigger function exists in database
- [ ] Existing triggers confirmed on item/article/link translation tables
- [ ] Access to Supabase MCP for executing migrations
- [ ] TypeScript types file location confirmed

---

## Task Breakdown

### Task 1: Verify Current Database State (1 SP)

**Description:** Confirm which triggers exist and column state before making changes.

**Acceptance Criteria:**
- [ ] Confirmed item_translations trigger exists
- [ ] Confirmed article_translations trigger exists
- [ ] Confirmed link_translations trigger exists
- [ ] Confirmed tag_translations is missing updated_at column and trigger

**Implementation Steps:**

1. Execute verification query for existing triggers:

```sql
-- Check existing triggers on translation tables
SELECT tgname, relname
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE relname LIKE '%translation%'
  AND NOT tgisinternal;
```

2. Execute verification query for tag_translations columns:

```sql
-- Check tag_translations columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tag_translations';
```

3. Execute verification query for trigger function:

```sql
-- Verify trigger function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'update_updated_at_column';
```

**Expected Results:**

| Table | Trigger | Status |
|-------|---------|--------|
| item_translations | update_item_translations_updated_at | EXISTS |
| article_translations | update_article_translations_updated_at | EXISTS |
| link_translations | update_link_translations_updated_at | EXISTS |
| tag_translations | (none) | MISSING |

| Column | Expected in tag_translations |
|--------|------------------------------|
| id | EXISTS |
| tag_key | EXISTS |
| language | EXISTS |
| translated_value | EXISTS |
| is_system_tag | EXISTS |
| created_at | EXISTS |
| updated_at | MISSING |

**Tools:** Supabase MCP `execute_sql`

---

### Task 2: Add updated_at Column to tag_translations (1 SP)

**Description:** Add the `updated_at` timestamp column to the tag_translations table with proper defaults.

**Acceptance Criteria:**
- [ ] `updated_at` column added to tag_translations with type TIMESTAMPTZ
- [ ] Column has DEFAULT now() for new insertions
- [ ] Existing rows initialized with updated_at = created_at
- [ ] Column comment added for documentation

**Implementation Steps:**

1. Apply migration via Supabase MCP:

```sql
-- Migration: Add updated_at column to tag_translations
-- Purpose: Enable automatic timestamp tracking for translation modifications
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Task: REQ-E03-029 Task 2
-- Date: 2026-01-20

-- Step 1: Add updated_at column (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tag_translations'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tag_translations
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

    -- Initialize existing rows: set updated_at to created_at for historical records
    UPDATE tag_translations
    SET updated_at = created_at
    WHERE updated_at IS NULL OR updated_at = now();
  END IF;
END $$;

-- Step 2: Add column comment
COMMENT ON COLUMN tag_translations.updated_at IS
  'Timestamp of last modification, automatically updated by trigger';
```

2. Verify column was added:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tag_translations'
  AND column_name = 'updated_at';
```

**Expected Result:**
| column_name | data_type | column_default |
|-------------|-----------|----------------|
| updated_at | timestamp with time zone | now() |

**Rollback:**
```sql
ALTER TABLE tag_translations DROP COLUMN IF EXISTS updated_at;
```

**Tools:** Supabase MCP `apply_migration`

---

### Task 3: Create Trigger for tag_translations (1 SP)

**Description:** Create the BEFORE UPDATE trigger on tag_translations to automatically update timestamps.

**Acceptance Criteria:**
- [ ] `update_tag_translations_updated_at` trigger created on tag_translations
- [ ] Trigger is BEFORE UPDATE type
- [ ] Trigger executes FOR EACH ROW
- [ ] Trigger uses existing `update_updated_at_column()` function
- [ ] Trigger comment added for documentation

**Implementation Steps:**

1. Apply trigger migration via Supabase MCP:

```sql
-- Migration: Add updated_at trigger to tag_translations
-- Purpose: Automatic timestamp updates on translation modifications
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Task: REQ-E03-029 Task 3
-- Date: 2026-01-20

-- Drop existing trigger if present (idempotent)
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

-- Create trigger using existing shared function
CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger comment for documentation
COMMENT ON TRIGGER update_tag_translations_updated_at ON tag_translations IS
  'Automatically updates updated_at timestamp on every UPDATE operation';
```

2. Verify trigger was created:

```sql
SELECT
  c.relname as table_name,
  t.tgname as trigger_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'tag_translations'
  AND NOT t.tgisinternal;
```

**Expected Result:**
| table_name | trigger_name | function_name |
|------------|--------------|---------------|
| tag_translations | update_tag_translations_updated_at | update_updated_at_column |

**Rollback:**
```sql
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;
```

**Tools:** Supabase MCP `apply_migration`

---

### Task 4: Verify Trigger Functionality (1 SP)

**Description:** Test that the trigger correctly updates timestamps on UPDATE operations.

**Acceptance Criteria:**
- [ ] INSERT sets updated_at to current timestamp
- [ ] UPDATE automatically changes updated_at without explicit SET
- [ ] updated_at is different from created_at after update
- [ ] Test data cleaned up after verification

**Implementation Steps:**

1. Insert test translation record:

```sql
-- Insert test translation
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES ('__test_trigger_verification__', 'fr', 'Test Traduction', false)
RETURNING id, tag_key, created_at, updated_at;
```

2. Record the initial timestamps and wait briefly, then update:

```sql
-- Wait a moment (execution gap provides time difference)
-- Update the record
UPDATE tag_translations
SET translated_value = 'Test Traduction Modifiée'
WHERE tag_key = '__test_trigger_verification__' AND language = 'fr'
RETURNING id, created_at, updated_at, updated_at > created_at as trigger_worked;
```

3. Verify timestamps:

```sql
-- Comprehensive verification
SELECT
  id,
  tag_key,
  created_at,
  updated_at,
  updated_at > created_at as trigger_worked,
  updated_at - created_at as time_difference
FROM tag_translations
WHERE tag_key = '__test_trigger_verification__';
```

**Expected Result:**
- `trigger_worked` should be `true`
- `time_difference` should be a positive interval

4. Clean up test data:

```sql
-- Remove test record
DELETE FROM tag_translations
WHERE tag_key = '__test_trigger_verification__';
```

**Tools:** Supabase MCP `execute_sql`

---

### Task 5: Verify All Translation Tables Have Triggers (0.5 SP)

**Description:** Final verification that all four translation tables have consistent trigger setup.

**Acceptance Criteria:**
- [ ] item_translations has update trigger
- [ ] article_translations has update trigger
- [ ] link_translations has update trigger
- [ ] tag_translations has update trigger
- [ ] All triggers use the same shared function

**Implementation Steps:**

1. Execute comprehensive verification:

```sql
-- Final verification: All translation tables have triggers
SELECT
  c.relname as table_name,
  t.tgname as trigger_name,
  p.proname as function_name,
  CASE
    WHEN t.tgname IS NOT NULL THEN 'CONFIGURED'
    ELSE 'MISSING'
  END as status
FROM pg_class c
LEFT JOIN pg_trigger t ON c.oid = t.tgrelid
  AND t.tgname LIKE 'update_%_updated_at'
  AND NOT t.tgisinternal
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND c.relkind = 'r'
ORDER BY c.relname;
```

**Expected Result:**
| table_name | trigger_name | function_name | status |
|------------|--------------|---------------|--------|
| article_translations | update_article_translations_updated_at | update_updated_at_column | CONFIGURED |
| item_translations | update_item_translations_updated_at | update_updated_at_column | CONFIGURED |
| link_translations | update_link_translations_updated_at | update_updated_at_column | CONFIGURED |
| tag_translations | update_tag_translations_updated_at | update_updated_at_column | CONFIGURED |

2. Verify all tables have updated_at columns:

```sql
-- Verify updated_at columns exist on all translation tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND column_name = 'updated_at'
ORDER BY table_name;
```

**Expected Result:** Four rows, one for each table, all showing `timestamp with time zone`.

**Tools:** Supabase MCP `execute_sql`

---

### Task 6: Update TypeScript Types (Optional - 0.5 SP)

**Description:** Update TypeScript types to include the new `updated_at` field for TagTranslation if types are manually maintained.

**Acceptance Criteria:**
- [ ] TypeScript types include updated_at for TagTranslation
- [ ] Application code compiles without type errors
- [ ] Type exports are correct

**Implementation Steps:**

1. Check if TypeScript types are auto-generated or manually maintained:

```bash
# Check for type generation script
grep -r "generate.*types" package.json
```

2. If types are manually maintained, locate and update the TagTranslation interface:

**File to check:** `/src/types/database.ts` or `/src/lib/supabase.ts`

**Before:**
```typescript
interface TagTranslation {
  id: string;
  tag_key: string;
  language: string;
  translated_value: string;
  is_system_tag: boolean;
  created_at: string;
}
```

**After:**
```typescript
interface TagTranslation {
  id: string;
  tag_key: string;
  language: string;
  translated_value: string;
  is_system_tag: boolean;
  created_at: string;
  updated_at: string;  // Added for trigger-managed timestamp
}
```

3. If types are auto-generated, regenerate:

```bash
npx supabase gen types typescript --local > src/types/database.ts
# or
npm run generate:types
```

4. Verify no TypeScript errors:

```bash
npm run build
# or
npx tsc --noEmit
```

**Tools:** Read, Edit, Bash

---

## Complete Acceptance Criteria Verification

From REQ-E03-029 requirements:

| Criteria | Task | Status |
|----------|------|--------|
| Migration script creates reusable trigger function named update_updated_at_column or equivalent | Pre-existing | ✅ Already exists |
| Trigger function sets NEW.updated_at to current timestamp (NOW() or CURRENT_TIMESTAMP) | Pre-existing | ✅ Already exists |
| Trigger function returns NEW record to allow UPDATE to proceed | Pre-existing | ✅ Already exists |
| Migration creates BEFORE UPDATE trigger on item_translations table | Pre-existing | ✅ Already exists |
| Migration creates BEFORE UPDATE trigger on article_translations table | Pre-existing | ✅ Already exists |
| Migration creates BEFORE UPDATE trigger on link_translations table | Pre-existing | ✅ Already exists |
| Migration creates BEFORE UPDATE trigger on tag_translations table | Task 3 | ⬜ To implement |
| All triggers fire only on UPDATE operations, not on INSERT or DELETE | All | ⬜ To verify |
| All triggers execute the shared trigger function | All | ⬜ To verify |
| All trigger creation statements use IF NOT EXISTS clause or equivalent idempotent pattern | Task 3 | ⬜ To implement |
| Migration includes descriptive naming convention for triggers (trigger_update_<table>_timestamp pattern) | Task 3 | ⬜ To implement |
| Trigger function creation uses OR REPLACE clause to allow safe re-execution | Pre-existing | ✅ Already exists |
| Manual UPDATE statement on translation record automatically updates the timestamp | Task 4 | ⬜ To verify |
| Application-level UPDATE operations observe automatic timestamp updates | Task 4 | ⬜ To verify |
| Trigger does not interfere with explicit updated_at values during INSERT operations | Task 4 | ⬜ To verify |
| Trigger executes efficiently without measurable performance impact on UPDATE operations | Task 4 | ⬜ To verify |
| Migration succeeds on development environment | Tasks 2-3 | ⬜ To verify |
| Migration succeeds on staging environment | Tasks 2-3 | ⬜ To verify |
| TypeScript database types remain unchanged (triggers are transparent to application layer) | Task 6 | ⬜ To verify |
| Migration reversibility is documented with corresponding DROP TRIGGER statements | Tasks 2-3 | ⬜ Documented |
| Updated_at columns reflect accurate modification times after trigger deployment | Task 4 | ⬜ To verify |
| Database logs confirm trigger execution during translation update operations | Task 4 | ⬜ To verify |

---

## Rollback Plan

If issues occur, execute in order:

```sql
-- Step 1: Remove trigger
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

-- Step 2: Remove column (WARNING: Data loss)
ALTER TABLE tag_translations DROP COLUMN IF EXISTS updated_at;
```

**Note:** Rollback will lose any `updated_at` data that has been recorded for tag_translations.

---

## Dependencies

### Upstream Dependencies (Required Before Starting)

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 translation tables | ✅ Required | All four tables must exist |
| `update_updated_at_column()` function | ✅ Required | Must exist in database |
| Existing triggers on item/article/link translations | ✅ Required | Confirms pattern |

### Downstream Dependencies (Enabled By This)

| Dependent | Impact |
|-----------|--------|
| Translation management UI | Can show accurate "last modified" timestamps for tags |
| Audit logging | Complete modification history for all translations |
| Cache invalidation | Can use updated_at for cache freshness checks |
| Epic 5 Translation Management | Owner UI will display tag modification times |

---

## Effort Summary

| Task | Story Points | Description |
|------|--------------|-------------|
| Task 1 | 0.5 | Verify current database state |
| Task 2 | 0.5 | Add updated_at column |
| Task 3 | 0.5 | Create trigger |
| Task 4 | 0.5 | Verify functionality |
| Task 5 | 0.25 | Final verification |
| Task 6 | 0.25 | TypeScript types (optional) |
| **Total** | **2.5** | - |

**Estimated Time:** 1-2 hours

---

## Testing Verification Script

Execute this complete verification after all tasks:

```sql
-- FINAL VERIFICATION SCRIPT
-- Run after completing all tasks

-- 1. Check all translation tables have updated_at columns
SELECT
  'COLUMN CHECK' as test_type,
  table_name,
  column_name,
  data_type,
  CASE WHEN column_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as result
FROM information_schema.columns
WHERE table_name IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND column_name = 'updated_at'
ORDER BY table_name;

-- 2. Check all translation tables have triggers
SELECT
  'TRIGGER CHECK' as test_type,
  c.relname as table_name,
  t.tgname as trigger_name,
  CASE WHEN t.tgname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_class c
LEFT JOIN pg_trigger t ON c.oid = t.tgrelid
  AND t.tgname LIKE 'update_%_updated_at'
  AND NOT t.tgisinternal
WHERE c.relname IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 3. Check trigger function exists
SELECT
  'FUNCTION CHECK' as test_type,
  proname as function_name,
  CASE WHEN proname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_proc
WHERE proname = 'update_updated_at_column';
```

**Expected:** All results show 'PASS'

---

## References

- **Request Document:** `/docs/gen_requests_epic3.md` - REQ-E03-029
- **Overview Document:** `/docs/REQ-E03-029-add-updatedat-trigger-for-translations-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Phase 6, Task 6.3
- **PostgreSQL Triggers:** https://www.postgresql.org/docs/current/sql-createtrigger.html
- **Supabase Triggers:** https://supabase.com/docs/guides/database/postgres/triggers

---

*Document generated: 2026-01-20 17:30 UTC*
*Last modified: 2026-01-20 17:30 UTC*
