# REQ-225: Add preferred_language Columns to Users and Accounts - Implementation Overview

**Generated:** 2026-01-17 15:30:00 UTC
**Last Modified:** 2026-01-17 15:30:00 UTC
**Request Reference:** REQ-225 - User and Account Language Preference Storage
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.3)
**Status:** Ready for Implementation

---

## 1. Request Summary

Add `preferred_language` columns to the `users` and `accounts` tables to store each user's and account's preferred display language. This enables the application to present content in the language users are most comfortable with, persisting their preference across sessions.

**Key Points:**
- Each user record will have a language preference defaulting to English
- Each account record will have a language preference defaulting to English
- Language preference values use standard ISO 639-1 language codes
- Existing records automatically receive the default English value during migration

---

## 2. Current State Analysis

### Existing Database Schema

Based on `/src/lib/supabase.ts`:

| Table | Current Columns | Notes |
|-------|-----------------|-------|
| `users` | `id`, `email`, `full_name`, `role`, `created_at`, `updated_at` | No language preference |
| `accounts` | `id`, `name`, `description`, `owner_id`, `settings`, `created_at`, `updated_at` | No language preference |

### Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| VARCHAR for enums | `item_links.link_type`, translation tables | `VARCHAR(5)` with CHECK constraint |
| Column Defaults | All tables | `DEFAULT NOW()` for timestamps, `DEFAULT 'en'` for language |
| ALTER TABLE | REQ-224 migration | Standard Supabase migration pattern |
| CHECK constraints | Translation tables | `CHECK (column IN ('value1', 'value2'))` |

### Supported Languages (from Plan-110)

| Code | Language |
|------|----------|
| `en` | English (default) |
| `fr` | French |
| `es` | Spanish |
| `de` | German |
| `nl` | Dutch |
| `it` | Italian |

---

## 3. Technical Approach

### Schema Changes

Each table will receive a new `preferred_language` column with the following characteristics:

| Property | Value |
|----------|-------|
| Column Name | `preferred_language` |
| Data Type | `VARCHAR(5)` |
| Default Value | `'en'` |
| Nullable | No (has default) |
| Constraint | CHECK constraint limiting to supported languages |

### Migration Strategy

Since we're adding columns with DEFAULT values:
1. PostgreSQL 11+ adds columns with DEFAULT values efficiently (no table rewrite for non-volatile defaults)
2. Existing rows automatically receive the default value `'en'`
3. No data migration needed - the DEFAULT clause handles existing records

### Column Definition

```sql
ALTER TABLE {table_name}
ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en'
CONSTRAINT {table_name}_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));
```

---

## 4. Implementation Tasks

### Task 1.3.1: Create migration file

**Action:** Create new migration file
**File:** `/database/migrations/20260117_add_preferred_language_columns.sql`

Header content:
```sql
-- Add preferred_language columns to users and accounts tables
-- Generated: 2026-01-17
-- Purpose: Store user and account language preferences for localized content display
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-225 (Plan-110, Task 1.3)

-- This migration adds preferred_language column to:
-- 1. users - Individual user language preferences
-- 2. accounts - Account-level default language preferences
```

### Task 1.3.2: Add preferred_language to users table

**Action:** Add column with constraint
**File:** `/database/migrations/20260117_add_preferred_language_columns.sql`

SQL:
```sql
-- Add preferred_language to users table
ALTER TABLE users
ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE users
ADD CONSTRAINT users_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));
```

Subtasks:
- [ ] Add VARCHAR(5) column with DEFAULT 'en'
- [ ] Add CHECK constraint for valid language codes
- [ ] Verify existing records receive 'en' default

### Task 1.3.3: Add preferred_language to accounts table

**Action:** Add column with constraint
**File:** `/database/migrations/20260117_add_preferred_language_columns.sql`

SQL:
```sql
-- Add preferred_language to accounts table
ALTER TABLE accounts
ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE accounts
ADD CONSTRAINT accounts_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));
```

Subtasks:
- [ ] Add VARCHAR(5) column with DEFAULT 'en'
- [ ] Add CHECK constraint for valid language codes
- [ ] Verify existing records receive 'en' default

### Task 1.3.4: Add indexes for language-based queries

**Action:** Create indexes on preferred_language columns
**File:** `/database/migrations/20260117_add_preferred_language_columns.sql`

SQL:
```sql
-- Indexes for preferred_language columns
-- Useful for grouping users by language preference (analytics, bulk operations)
CREATE INDEX idx_users_preferred_language ON users(preferred_language);
CREATE INDEX idx_accounts_preferred_language ON accounts(preferred_language);
```

### Task 1.3.5: Add column comments for documentation

**Action:** Document new columns
**File:** `/database/migrations/20260117_add_preferred_language_columns.sql`

SQL:
```sql
-- Documentation comments
COMMENT ON COLUMN users.preferred_language IS 'User preferred display language code (ISO 639-1). Defaults to en.';
COMMENT ON COLUMN accounts.preferred_language IS 'Account default display language code (ISO 639-1). Defaults to en. Applied to new users in account unless overridden.';
```

### Task 1.3.6: Create rollback section

**Action:** Add rollback SQL in comments
**File:** `/database/migrations/20260117_add_preferred_language_columns.sql`

SQL:
```sql
-- ===========================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- ===========================================================
-- DROP INDEX IF EXISTS idx_accounts_preferred_language;
-- DROP INDEX IF EXISTS idx_users_preferred_language;
--
-- ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_preferred_language_check;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_language_check;
--
-- ALTER TABLE accounts DROP COLUMN IF EXISTS preferred_language;
-- ALTER TABLE users DROP COLUMN IF EXISTS preferred_language;
```

### Task 1.3.7: Update TypeScript database types

**Action:** Update Supabase type definitions
**File:** `/src/lib/supabase.ts`

Changes to make in each table definition:

**users table (Row/Insert/Update):**
```typescript
preferred_language: string | null  // Row
preferred_language?: string | null // Insert
preferred_language?: string | null // Update
```

**accounts table (Row/Insert/Update):**
```typescript
preferred_language: string | null  // Row
preferred_language?: string | null // Insert
preferred_language?: string | null // Update
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/database/migrations/20260117_add_preferred_language_columns.sql` | Migration file for preferred_language columns |

### Files to MODIFY

| File Path | Section to Modify | Changes |
|-----------|-------------------|---------|
| `/src/lib/supabase.ts` | `Database.public.Tables.users.Row` | Add `preferred_language: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.users.Insert` | Add `preferred_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.users.Update` | Add `preferred_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.accounts.Row` | Add `preferred_language: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.accounts.Insert` | Add `preferred_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.accounts.Update` | Add `preferred_language?: string \| null` |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/database/schema.sql` | Reference existing schema patterns |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |
| `/docs/REQ-224-add-sourcelanguage-columns-to-existing-tables-overview.md` | Related L10N migration pattern |

### No Modifications Required

The following files should NOT be modified for this task:
- `/database/schema.sql` (migrations are separate from base schema)
- Any authentication-related code (language preference is stored but not yet consumed)
- Any UI components (no user-facing changes for this task - language switching UI is a separate task)

---

## 6. Dependencies

### Database Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| `users` table | Must exist | Target for ALTER TABLE |
| `accounts` table | Must exist | Target for ALTER TABLE |

### Task Dependencies

| Task | Dependency | Notes |
|------|------------|-------|
| Task 1.1 (REQ-223) | Optional | Can run independently |
| Task 1.2 (REQ-224) | Optional | Can run independently |
| Task 1.4 (RLS policies) | Runs after | May reference preferred_language |

### Application Dependencies

After TypeScript types are updated:
- Existing code that queries/inserts users and accounts will continue to work (column has default)
- No breaking changes - the column is optional in Insert/Update types
- Future tasks (LanguageSwitcher, useLanguagePreference hook) will consume these columns

---

## 7. Acceptance Criteria

From REQ-225:

- [ ] Each user record includes a language preference field with a default value of English
- [ ] Each account record includes a language preference field with a default value of English
- [ ] Language preference values follow standard language codes (ISO 639-1) for consistency and interoperability
- [ ] Existing user and account records automatically receive the default language value during migration
- [ ] The database schema change is reversible without data loss

From Plan-110 (Task 1.3):

- [ ] ALTER users and accounts tables with preferred_language column
- [ ] Default to 'en' for existing and new records
- [ ] CHECK constraints limit values to supported languages

---

## 8. Testing Strategy

### Pre-Deployment Verification

1. **Syntax Check:**
   ```bash
   # Validate SQL syntax (local PostgreSQL if available)
   psql -h localhost -d faqbnb_test -f database/migrations/20260117_add_preferred_language_columns.sql --echo-errors
   ```

2. **TypeScript Compilation:**
   ```bash
   # Verify type changes compile correctly
   npm run build
   ```

### Post-Deployment Verification

3. **Column Existence Check:**
   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_schema = 'public'
   AND table_name IN ('users', 'accounts')
   AND column_name = 'preferred_language';
   -- Expected: 2 rows, all with 'en'::character varying as default
   ```

4. **Existing Data Verification:**
   ```sql
   -- Verify all existing users have 'en' as preferred_language
   SELECT COUNT(*) as total, preferred_language
   FROM users
   GROUP BY preferred_language;
   -- Expected: All rows should have preferred_language = 'en'

   -- Same for accounts
   SELECT COUNT(*) as total, preferred_language
   FROM accounts
   GROUP BY preferred_language;
   -- Expected: All rows should have preferred_language = 'en'
   ```

5. **Constraint Verification:**
   ```sql
   -- Test that invalid language codes are rejected
   UPDATE users SET preferred_language = 'xx' WHERE id = (SELECT id FROM users LIMIT 1);
   -- Expected: ERROR - violates check constraint

   -- Test that valid language codes are accepted
   UPDATE users SET preferred_language = 'fr' WHERE id = (SELECT id FROM users LIMIT 1);
   -- Expected: SUCCESS
   -- Revert: UPDATE users SET preferred_language = 'en' WHERE preferred_language = 'fr';
   ```

6. **Index Verification:**
   ```sql
   SELECT indexname, tablename
   FROM pg_indexes
   WHERE indexname LIKE '%preferred_language%';
   -- Expected: 2 rows (idx_users_preferred_language, idx_accounts_preferred_language)
   ```

### Rollback Testing

7. **Rollback Verification:**
   - Run rollback script on test environment
   - Verify columns removed from both tables
   - Verify indexes removed
   - Verify constraints removed

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Column addition locks table | Low | Medium | PostgreSQL 11+ handles DEFAULT efficiently; use low-traffic window |
| Existing queries break | Very Low | Low | Adding column with default doesn't affect existing SELECTs |
| TypeScript type mismatch | Low | Medium | Update types in same deployment as migration |
| Constraint too restrictive | Low | Low | Only supported languages; matches translation tables |
| Auth flow impacts | Very Low | Medium | Column is passive storage only; not used in auth logic |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create migration file with header | 5 min |
| Add column ALTER statements (2 tables) | 10 min |
| Add CHECK constraints (2 tables) | 5 min |
| Add indexes (2 tables) | 5 min |
| Add comments | 5 min |
| Add rollback script | 5 min |
| Update TypeScript types | 10 min |
| Local testing | 10 min |
| Staging deployment | 10 min |
| **Total** | **~65 min** |

---

## 11. Complete Migration File Structure

```sql
-- ===========================================================
-- Add preferred_language columns to users and accounts tables
-- File: /database/migrations/20260117_add_preferred_language_columns.sql
-- Generated: 2026-01-17
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-225 (Plan-110, Task 1.3)
-- ===========================================================

-- Purpose: Store user and account language preferences for localized content display
-- This enables the application to present UI and content in the user's preferred language

-- ============ COLUMN ADDITIONS ============

-- Add preferred_language to users table
ALTER TABLE users
ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE users
ADD CONSTRAINT users_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- Add preferred_language to accounts table
ALTER TABLE accounts
ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';

ALTER TABLE accounts
ADD CONSTRAINT accounts_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============ INDEXES ============

CREATE INDEX idx_users_preferred_language ON users(preferred_language);
CREATE INDEX idx_accounts_preferred_language ON accounts(preferred_language);

-- ============ DOCUMENTATION ============

COMMENT ON COLUMN users.preferred_language IS 'User preferred display language code (ISO 639-1). Defaults to en.';
COMMENT ON COLUMN accounts.preferred_language IS 'Account default display language code (ISO 639-1). Defaults to en. Applied to new users in account unless overridden.';

-- ===========================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- ===========================================================
-- DROP INDEX IF EXISTS idx_accounts_preferred_language;
-- DROP INDEX IF EXISTS idx_users_preferred_language;
--
-- ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_preferred_language_check;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_language_check;
--
-- ALTER TABLE accounts DROP COLUMN IF EXISTS preferred_language;
-- ALTER TABLE users DROP COLUMN IF EXISTS preferred_language;
```

---

## 12. TypeScript Type Updates

### Updates to `/src/lib/supabase.ts`

**For `users` table:**

Locate the `users` table definition and add to each section:

```typescript
// In Database.public.Tables.users.Row, add after 'updated_at':
preferred_language: string | null

// In Database.public.Tables.users.Insert, add after 'updated_at':
preferred_language?: string | null

// In Database.public.Tables.users.Update, add after 'updated_at':
preferred_language?: string | null
```

**For `accounts` table:**

Locate the `accounts` table definition and add to each section:

```typescript
// In Database.public.Tables.accounts.Row, add after 'updated_at':
preferred_language: string | null

// In Database.public.Tables.accounts.Insert, add after 'updated_at':
preferred_language?: string | null

// In Database.public.Tables.accounts.Update, add after 'updated_at':
preferred_language?: string | null
```

---

## 13. Integration with Language Preference Flow

After this migration, the language preference flow (defined in Plan-110) will work as follows:

```
User Request
    │
    ▼
Middleware (language detection)
    │
    ├── Check user.preferred_language (if authenticated) ← NEW COLUMN
    ├── Check FAQBNB_LANG cookie
    ├── Check Accept-Language header
    └── Default to 'en'
    │
    ▼
IntlProvider (wraps app)
```

**Note:** This task only adds the database storage. The middleware integration and LanguageSwitcher component that consume this column are separate tasks (Phase 5 of Plan-110).

---

## 14. Relationship to Account Language

The `accounts.preferred_language` column serves as:
1. **Team Default:** When new users are added to an account, their preference can default to the account's setting
2. **Guest Default:** For unauthenticated property guests, the account language may influence default content language
3. **Reporting:** Analytics can be grouped by account language preference

The exact inheritance logic (user preference vs account preference) will be implemented in Phase 5 (Task 5.1: Language detection utility).

---

## 15. Next Steps After Implementation

After completing Task 1.3 (this task):

1. **Task 1.4:** Implement RLS policies for translation tables
2. **Task 1.5:** Update TypeScript database types (if not done as part of this task)
3. **Task 1.6:** Seed system tag translations
4. **Phase 5:** Language Switching Infrastructure (consumes these columns)
   - Task 5.4: Create useLanguagePreference hook
   - Task 5.6: Add language preference API endpoint

---

## References

- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-224 Overview](/docs/REQ-224-add-sourcelanguage-columns-to-existing-tables-overview.md)
- [Existing Schema](/database/schema.sql)
- [Supabase TypeScript Types](/src/lib/supabase.ts)
