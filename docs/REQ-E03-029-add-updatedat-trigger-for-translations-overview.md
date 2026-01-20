# REQ-E03-029: Add Updated_At Trigger for Translations

**Implementation Breakdown Document**

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
| **Last Modified** | 2026-01-20 16:55 UTC |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Dependencies** | Epic 1 translation tables |

---

## 1. Summary

Add database triggers to automatically update the `updated_at` timestamp column whenever translation records are modified. This ensures accurate modification tracking without requiring application-level timestamp management. Based on database investigation, triggers already exist for most translation tables but the `tag_translations` table requires both the `updated_at` column and trigger to be added.

---

## 2. Background & Context

### Current State

Based on database investigation, the following triggers and columns already exist:

#### Existing Trigger Function

A reusable trigger function `update_updated_at_column()` already exists in the database:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Existing Triggers on Translation Tables

| Table | Trigger Name | Status |
|-------|-------------|--------|
| `item_translations` | `update_item_translations_updated_at` | **EXISTS** |
| `article_translations` | `update_article_translations_updated_at` | **EXISTS** |
| `link_translations` | `update_link_translations_updated_at` | **EXISTS** |
| `tag_translations` | - | **MISSING** |

#### Current `tag_translations` Schema

```sql
-- Columns in tag_translations (NO updated_at column)
id              uuid           DEFAULT gen_random_uuid()
tag_key         varchar        -- Original tag identifier
language        varchar        -- Target language code
translated_value varchar       -- Translated tag text
is_system_tag   boolean        DEFAULT false
created_at      timestamptz    DEFAULT now()
-- NOTE: updated_at column is MISSING
```

### Why This Change Is Needed

1. The `tag_translations` table lacks an `updated_at` column entirely, making it impossible to track when translations were last modified
2. Without automatic timestamp updates, application code must manually set timestamps on every UPDATE operation
3. Manual timestamp management risks inconsistent or stale timestamps if any code path misses the update
4. Accurate modification timestamps are essential for:
   - Translation management UI showing "last modified" dates
   - Audit trails for content history tracking
   - Cache invalidation decisions
   - Identifying stale translations that may need regeneration

### Implementation Plan Reference

From Plan-111, Phase 6, Task 6.3:

```sql
CREATE OR REPLACE FUNCTION update_translation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER item_translations_updated
  BEFORE UPDATE ON item_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_translation_timestamp();

-- Repeat for article_translations, link_translations
```

**Note:** The plan's trigger function `update_translation_timestamp()` is functionally identical to the existing `update_updated_at_column()` function. We will reuse the existing function for consistency with the rest of the codebase.

---

## 3. Technical Requirements

### 3.1 Gap Analysis

| Table | `updated_at` Column | Trigger | Action Required |
|-------|---------------------|---------|-----------------|
| `item_translations` | ✅ Exists | ✅ Exists | None |
| `article_translations` | ✅ Exists | ✅ Exists | None |
| `link_translations` | ✅ Exists | ✅ Exists | None |
| `tag_translations` | ❌ Missing | ❌ Missing | Add column + trigger |

### 3.2 Required Changes

Only `tag_translations` requires modification:

1. **Add `updated_at` column** with default value and proper data type
2. **Create BEFORE UPDATE trigger** to automatically set timestamp on updates
3. **Initialize existing rows** with `updated_at = created_at` for data consistency

### 3.3 SQL Implementation

```sql
-- Migration: Add updated_at Trigger for tag_translations
-- Purpose: Automatic timestamp updates for translation modification tracking
-- Epic: L10N Epic 3 - Dynamic Content Translation
-- Task: 6.3 - Add updated_at trigger for translations
-- Date: 2026-01-20

-- Step 1: Add updated_at column to tag_translations
-- Using IF NOT EXISTS pattern via ALTER TABLE with conditional logic
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

-- Step 2: Add comment to the column
COMMENT ON COLUMN tag_translations.updated_at IS
  'Timestamp of last modification, automatically updated by trigger';

-- Step 3: Create trigger for tag_translations
-- Uses existing update_updated_at_column() function for consistency
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

CREATE TRIGGER update_tag_translations_updated_at
  BEFORE UPDATE ON tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Add comment to the trigger (via pg_description)
COMMENT ON TRIGGER update_tag_translations_updated_at ON tag_translations IS
  'Automatically updates updated_at timestamp on every UPDATE operation';
```

### 3.4 Rollback Script

```sql
-- Rollback: Remove updated_at column and trigger from tag_translations

-- Remove trigger first
DROP TRIGGER IF EXISTS update_tag_translations_updated_at ON tag_translations;

-- Remove column (WARNING: This will lose updated_at data)
ALTER TABLE tag_translations DROP COLUMN IF EXISTS updated_at;
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Database Changes (via Supabase MCP)

| Change Type | Target | Description |
|-------------|--------|-------------|
| ADD COLUMN | `tag_translations.updated_at` | TIMESTAMPTZ column with DEFAULT now() |
| CREATE TRIGGER | `tag_translations` | `update_tag_translations_updated_at` trigger |
| UPDATE | `tag_translations` | Initialize `updated_at` for existing rows |

### 4.2 Files to Create

| File Path | Purpose |
|-----------|---------|
| (none) | All changes applied via Supabase MCP migration |

### 4.3 Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/types/database.ts` | Add `updated_at` field to `TagTranslation` type (if manually maintained) |
| `/src/lib/supabase.ts` | Type regeneration may include new column automatically |

### 4.4 Existing Functions to Reuse

| Function | Location | Usage |
|----------|----------|-------|
| `update_updated_at_column()` | Database | Reuse existing trigger function |

### 4.5 TypeScript Type Updates

If TypeScript database types are manually maintained:

```typescript
// Before
interface TagTranslation {
  id: string;
  tag_key: string;
  language: string;
  translated_value: string;
  is_system_tag: boolean;
  created_at: string;
}

// After
interface TagTranslation {
  id: string;
  tag_key: string;
  language: string;
  translated_value: string;
  is_system_tag: boolean;
  created_at: string;
  updated_at: string;  // NEW
}
```

---

## 5. Implementation Tasks

### Task 1: Verify Current Database State

Confirm which triggers exist and column state:

```sql
-- Check existing triggers
SELECT tgname, relname
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE relname LIKE '%translation%'
  AND NOT tgisinternal;

-- Check tag_translations columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tag_translations';
```

**Acceptance Criteria:**
- [ ] Confirmed item_translations trigger exists
- [ ] Confirmed article_translations trigger exists
- [ ] Confirmed link_translations trigger exists
- [ ] Confirmed tag_translations is missing updated_at column and trigger

### Task 2: Apply Migration via Supabase MCP

Execute the migration to add column and trigger:

**Acceptance Criteria:**
- [ ] `updated_at` column added to tag_translations
- [ ] Existing rows have updated_at initialized from created_at
- [ ] `update_tag_translations_updated_at` trigger created
- [ ] Trigger uses existing `update_updated_at_column()` function

### Task 3: Verify Trigger Functionality

Test that triggers work correctly:

```sql
-- Insert a test translation
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES ('test_trigger', 'fr', 'Test Traduction', false)
RETURNING id, created_at, updated_at;

-- Note the updated_at value
-- Wait 1 second, then update
UPDATE tag_translations
SET translated_value = 'Test Traduction Modifiée'
WHERE tag_key = 'test_trigger' AND language = 'fr'
RETURNING id, created_at, updated_at;

-- Verify updated_at changed (should be different from created_at)
SELECT id, created_at, updated_at, updated_at > created_at as trigger_worked
FROM tag_translations
WHERE tag_key = 'test_trigger';

-- Cleanup test data
DELETE FROM tag_translations WHERE tag_key = 'test_trigger';
```

**Acceptance Criteria:**
- [ ] INSERT sets updated_at to current timestamp
- [ ] UPDATE automatically changes updated_at without explicit SET
- [ ] updated_at is different from created_at after update
- [ ] Test data cleaned up

### Task 4: Verify All Translation Table Triggers

Confirm all four translation tables have triggers:

```sql
SELECT
  c.relname as table_name,
  t.tgname as trigger_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND NOT t.tgisinternal
ORDER BY c.relname;
```

**Acceptance Criteria:**
- [ ] item_translations has update trigger
- [ ] article_translations has update trigger
- [ ] link_translations has update trigger
- [ ] tag_translations has update trigger
- [ ] All triggers use same function

### Task 5: Update TypeScript Types (if needed)

Regenerate or manually update TypeScript types:

**Acceptance Criteria:**
- [ ] TypeScript types include updated_at for TagTranslation
- [ ] Application code compiles without type errors
- [ ] Type exports are correct

---

## 6. Acceptance Criteria Checklist

From REQ-E03-029:

- [ ] Migration script creates reusable trigger function named update_updated_at_column or equivalent
  - **Note:** Function already exists, will be reused
- [ ] Trigger function sets NEW.updated_at to current timestamp (NOW() or CURRENT_TIMESTAMP)
- [ ] Trigger function returns NEW record to allow UPDATE to proceed
- [ ] Migration creates BEFORE UPDATE trigger on item_translations table
  - **Note:** Already exists
- [ ] Migration creates BEFORE UPDATE trigger on article_translations table
  - **Note:** Already exists
- [ ] Migration creates BEFORE UPDATE trigger on link_translations table
  - **Note:** Already exists
- [ ] Migration creates BEFORE UPDATE trigger on tag_translations table
  - **NEW:** This is the main deliverable
- [ ] All triggers fire only on UPDATE operations, not on INSERT or DELETE
- [ ] All triggers execute the shared trigger function
- [ ] All trigger creation statements use IF NOT EXISTS clause or equivalent idempotent pattern
- [ ] Migration includes descriptive naming convention for triggers (trigger_update_<table>_timestamp pattern)
- [ ] Trigger function creation uses OR REPLACE clause to allow safe re-execution
- [ ] Manual UPDATE statement on translation record automatically updates the timestamp
- [ ] Application-level UPDATE operations observe automatic timestamp updates
- [ ] Trigger does not interfere with explicit updated_at values during INSERT operations
- [ ] Trigger executes efficiently without measurable performance impact on UPDATE operations
- [ ] Migration succeeds on development environment
- [ ] Migration succeeds on staging environment
- [ ] TypeScript database types remain unchanged (triggers are transparent to application layer)
  - **Note:** `updated_at` column must be added to TypeScript types for tag_translations
- [ ] Migration reversibility is documented with corresponding DROP TRIGGER statements
- [ ] Updated_at columns reflect accurate modification times after trigger deployment
- [ ] Database logs confirm trigger execution during translation update operations

---

## 7. Performance Considerations

### Trigger Overhead

- BEFORE UPDATE triggers add minimal overhead (< 0.1ms per operation)
- The trigger function is simple (single timestamp assignment)
- No additional queries or external calls in trigger

### Index Considerations

If `updated_at` will be used for queries (e.g., "find recently updated translations"):

```sql
-- Optional: Add index for temporal queries on tag_translations
CREATE INDEX IF NOT EXISTS idx_tag_translations_updated
  ON tag_translations(updated_at DESC);
```

This is NOT required for the trigger to work, but may be added if needed for query performance.

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Existing rows have NULL updated_at | Low | Low | Migration initializes from created_at |
| Trigger function doesn't exist | Very Low | Medium | Verified function exists in database |
| Name collision with existing trigger | Low | Low | Use DROP TRIGGER IF EXISTS before CREATE |
| TypeScript type mismatch | Medium | Low | Regenerate types after migration |

---

## 9. Dependencies

### Upstream Dependencies (Must Be Completed First)

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 translation tables | ✅ Complete | All four tables exist |
| `update_updated_at_column()` function | ✅ Complete | Function exists |
| item/article/link translation triggers | ✅ Complete | Already created |

### Downstream Dependencies (Enabled By This)

| Dependent | Impact |
|-----------|--------|
| Translation management UI | Can show accurate "last modified" timestamps for tags |
| Audit logging | Complete modification history for all translations |
| Cache invalidation | Can use updated_at for cache freshness checks |
| REQ-E05-xxx (Owner Translation Management) | Can display tag modification times |

---

## 10. Verification Queries

### Final Verification After Implementation

```sql
-- 1. Verify all translation tables have updated_at columns
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND column_name = 'updated_at'
ORDER BY table_name;

-- 2. Verify all translation tables have triggers
SELECT c.relname as table_name, t.tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('item_translations', 'article_translations', 'link_translations', 'tag_translations')
  AND t.tgname LIKE 'update_%_updated_at'
ORDER BY c.relname;

-- 3. Verify trigger function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'update_updated_at_column';
```

### Expected Results

1. All four tables should have `updated_at` column of type `timestamp with time zone`
2. All four tables should have triggers named `update_<table>_updated_at`
3. The trigger function should exist and contain `NEW.updated_at = NOW()`

---

## 11. References

- **Request Document:** `/docs/gen_requests_epic3.md` - REQ-E03-029
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Phase 6, Task 6.3
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **PostgreSQL Trigger Documentation:** [PostgreSQL CREATE TRIGGER](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- **Supabase Triggers Guide:** [Supabase Database Triggers](https://supabase.com/docs/guides/database/postgres/triggers)

---

*Document generated: 2026-01-20 16:55 UTC*
*Last modified: 2026-01-20 16:55 UTC*
