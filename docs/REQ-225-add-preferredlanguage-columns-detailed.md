# REQ-225: Add preferred_language Columns - Detailed Task Breakdown

**Generated:** 2026-01-18 00:00:00 UTC
**Last Modified:** 2026-01-18 00:00:00 UTC
**Request Reference:** REQ-225 - User and Account Language Preference Storage
**Overview Document:** REQ-225-add-preferredlanguage-columns-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.3)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides granular, actionable tasks for implementing REQ-225: adding `preferred_language` columns to the `users` and `accounts` tables. Each task is designed to be approximately 1 story point and executable by an AI coding agent or junior developer.

**Total Tasks:** 12
**Estimated Complexity:** Small (S)

---

## Prerequisites

Before starting implementation:

- [ ] Verify database access via Supabase MCP
- [ ] Confirm `users` and `accounts` tables exist in the database
- [ ] Ensure TypeScript build passes: `npm run build`

---

## Task List

### Task 1: Verify Current Database State

**Task ID:** REQ-225-T01
**Type:** Verification
**Priority:** P0 (Must complete first)

**Objective:** Confirm the `users` and `accounts` tables exist and do not already have `preferred_language` columns.

**Actions:**
1. Use Supabase MCP to list tables in the public schema
2. Verify both `users` and `accounts` tables exist
3. Check that neither table already has a `preferred_language` column

**SQL Verification:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'accounts')
  AND column_name = 'preferred_language';
-- Expected: 0 rows (column doesn't exist yet)
```

**Acceptance Criteria:**
- [ ] `users` table exists
- [ ] `accounts` table exists
- [ ] Neither table has `preferred_language` column yet

**Files:** None (verification only)

---

### Task 2: Create Database Migration Directory

**Task ID:** REQ-225-T02
**Type:** Setup
**Priority:** P0

**Objective:** Ensure the database migrations directory structure exists.

**Actions:**
1. Check if `/database/migrations/` directory exists
2. Create the directory if it doesn't exist

**Bash Command:**
```bash
mkdir -p database/migrations
```

**Acceptance Criteria:**
- [ ] Directory `/database/migrations/` exists

**Files to Create:**
| Path | Description |
|------|-------------|
| `/database/migrations/` | Directory for SQL migration files |

---

### Task 3: Create Migration File Header

**Task ID:** REQ-225-T03
**Type:** Implementation
**Priority:** P1
**Depends On:** REQ-225-T02

**Objective:** Create the migration file with proper header documentation.

**File to Create:** `/database/migrations/20260118_add_preferred_language_columns.sql`

**Content:**
```sql
-- ===========================================================
-- Migration: Add preferred_language columns to users and accounts
-- File: 20260118_add_preferred_language_columns.sql
-- Generated: 2026-01-18
-- Last Modified: 2026-01-18
-- ===========================================================
--
-- Purpose: Store user and account language preferences for
--          localized content display
--
-- Epic: L10N Epic 1 - Foundation
-- Request Reference: REQ-225
-- Plan Reference: Plan-110-L10N-Epic1-Foundation.md (Task 1.3)
--
-- Tables Modified:
--   - users: Add preferred_language column
--   - accounts: Add preferred_language column
--
-- Supported Languages (ISO 639-1):
--   en (English - default), fr (French), es (Spanish),
--   de (German), nl (Dutch), it (Italian)
--
-- ===========================================================

```

**Acceptance Criteria:**
- [ ] Migration file created at correct path
- [ ] Header includes all required metadata
- [ ] File ends with blank line for subsequent content

**Files to Create:**
| Path | Description |
|------|-------------|
| `/database/migrations/20260118_add_preferred_language_columns.sql` | Migration file |

---

### Task 4: Add preferred_language Column to Users Table

**Task ID:** REQ-225-T04
**Type:** Implementation
**Priority:** P1
**Depends On:** REQ-225-T03

**Objective:** Add the `preferred_language` column to the `users` table with proper constraints.

**File to Modify:** `/database/migrations/20260118_add_preferred_language_columns.sql`

**SQL to Append:**
```sql
-- ============================================================
-- SECTION 1: Add preferred_language to users table
-- ============================================================

-- Add column with default value
-- PostgreSQL 11+ handles DEFAULT efficiently without table rewrite
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint to limit to supported languages
ALTER TABLE users
ADD CONSTRAINT users_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

```

**Verification SQL:**
```sql
-- Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name = 'preferred_language';
-- Expected: 1 row with VARCHAR(5) and default 'en'
```

**Acceptance Criteria:**
- [ ] Column `preferred_language` added to `users` table
- [ ] Column type is VARCHAR(5)
- [ ] Default value is 'en'
- [ ] CHECK constraint limits values to supported languages

**Files to Modify:**
| Path | Section | Changes |
|------|---------|---------|
| `/database/migrations/20260118_add_preferred_language_columns.sql` | After header | Append ALTER TABLE statement |

---

### Task 5: Add preferred_language Column to Accounts Table

**Task ID:** REQ-225-T05
**Type:** Implementation
**Priority:** P1
**Depends On:** REQ-225-T03

**Objective:** Add the `preferred_language` column to the `accounts` table with proper constraints.

**File to Modify:** `/database/migrations/20260118_add_preferred_language_columns.sql`

**SQL to Append:**
```sql
-- ============================================================
-- SECTION 2: Add preferred_language to accounts table
-- ============================================================

-- Add column with default value
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint to limit to supported languages
ALTER TABLE accounts
ADD CONSTRAINT accounts_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

```

**Verification SQL:**
```sql
-- Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'accounts'
  AND column_name = 'preferred_language';
-- Expected: 1 row with VARCHAR(5) and default 'en'
```

**Acceptance Criteria:**
- [ ] Column `preferred_language` added to `accounts` table
- [ ] Column type is VARCHAR(5)
- [ ] Default value is 'en'
- [ ] CHECK constraint limits values to supported languages

**Files to Modify:**
| Path | Section | Changes |
|------|---------|---------|
| `/database/migrations/20260118_add_preferred_language_columns.sql` | After Section 1 | Append ALTER TABLE statement |

---

### Task 6: Add Indexes for Language-Based Queries

**Task ID:** REQ-225-T06
**Type:** Implementation
**Priority:** P2
**Depends On:** REQ-225-T04, REQ-225-T05

**Objective:** Create indexes on `preferred_language` columns to optimize queries that filter or group by language preference.

**File to Modify:** `/database/migrations/20260118_add_preferred_language_columns.sql`

**SQL to Append:**
```sql
-- ============================================================
-- SECTION 3: Indexes for preferred_language columns
-- ============================================================
-- These indexes support:
--   - Grouping users by language (analytics)
--   - Bulk operations per language (notifications, exports)
--   - Account filtering by language

CREATE INDEX IF NOT EXISTS idx_users_preferred_language
ON users(preferred_language);

CREATE INDEX IF NOT EXISTS idx_accounts_preferred_language
ON accounts(preferred_language);

```

**Verification SQL:**
```sql
-- Verify indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE '%preferred_language%';
-- Expected: 2 rows
```

**Acceptance Criteria:**
- [ ] Index `idx_users_preferred_language` created
- [ ] Index `idx_accounts_preferred_language` created

**Files to Modify:**
| Path | Section | Changes |
|------|---------|---------|
| `/database/migrations/20260118_add_preferred_language_columns.sql` | After Section 2 | Append CREATE INDEX statements |

---

### Task 7: Add Column Documentation Comments

**Task ID:** REQ-225-T07
**Type:** Implementation
**Priority:** P2
**Depends On:** REQ-225-T04, REQ-225-T05

**Objective:** Add PostgreSQL COMMENT statements to document the new columns.

**File to Modify:** `/database/migrations/20260118_add_preferred_language_columns.sql`

**SQL to Append:**
```sql
-- ============================================================
-- SECTION 4: Column Documentation
-- ============================================================

COMMENT ON COLUMN users.preferred_language IS
  'User preferred display language code (ISO 639-1). Supported: en, fr, es, de, nl, it. Defaults to en.';

COMMENT ON COLUMN accounts.preferred_language IS
  'Account default display language code (ISO 639-1). Applied to new users unless individually overridden. Defaults to en.';

```

**Acceptance Criteria:**
- [ ] Comment added to `users.preferred_language`
- [ ] Comment added to `accounts.preferred_language`

**Files to Modify:**
| Path | Section | Changes |
|------|---------|---------|
| `/database/migrations/20260118_add_preferred_language_columns.sql` | After Section 3 | Append COMMENT statements |

---

### Task 8: Add Rollback Script Section

**Task ID:** REQ-225-T08
**Type:** Implementation
**Priority:** P2
**Depends On:** REQ-225-T04, REQ-225-T05, REQ-225-T06

**Objective:** Add a commented rollback script for reversibility per acceptance criteria.

**File to Modify:** `/database/migrations/20260118_add_preferred_language_columns.sql`

**SQL to Append:**
```sql
-- ============================================================
-- ROLLBACK SCRIPT (run manually if rollback needed)
-- ============================================================
-- To reverse this migration, run the following commands:
--
-- -- Remove indexes
-- DROP INDEX IF EXISTS idx_accounts_preferred_language;
-- DROP INDEX IF EXISTS idx_users_preferred_language;
--
-- -- Remove constraints
-- ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_preferred_language_check;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_language_check;
--
-- -- Remove columns
-- ALTER TABLE accounts DROP COLUMN IF EXISTS preferred_language;
-- ALTER TABLE users DROP COLUMN IF EXISTS preferred_language;
--
-- ============================================================
-- END OF MIGRATION
-- ============================================================
```

**Acceptance Criteria:**
- [ ] Rollback script included as comments
- [ ] Rollback removes indexes, constraints, and columns
- [ ] Order is correct (indexes → constraints → columns)

**Files to Modify:**
| Path | Section | Changes |
|------|---------|---------|
| `/database/migrations/20260118_add_preferred_language_columns.sql` | End of file | Append rollback section |

---

### Task 9: Apply Migration to Database

**Task ID:** REQ-225-T09
**Type:** Deployment
**Priority:** P0
**Depends On:** REQ-225-T04, REQ-225-T05, REQ-225-T06, REQ-225-T07, REQ-225-T08

**Objective:** Apply the migration to the Supabase database using the MCP tool.

**Actions:**
1. Read the complete migration file
2. Use Supabase MCP `apply_migration` tool to execute

**MCP Tool Call:**
```
mcp__supabase__apply_migration
  name: add_preferred_language_columns
  query: [contents of migration file]
```

**Post-Migration Verification:**
```sql
-- Verify both columns exist with correct properties
SELECT
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'accounts')
  AND column_name = 'preferred_language';
-- Expected: 2 rows

-- Verify existing records received default value
SELECT 'users' as table_name, COUNT(*) as total, preferred_language
FROM users
GROUP BY preferred_language
UNION ALL
SELECT 'accounts' as table_name, COUNT(*) as total, preferred_language
FROM accounts
GROUP BY preferred_language;
-- Expected: All records show 'en'

-- Verify CHECK constraint works
UPDATE users SET preferred_language = 'xx' WHERE FALSE;
-- Expected: No error (no rows updated, but constraint validated)
```

**Acceptance Criteria:**
- [ ] Migration applied successfully
- [ ] Both columns exist in database
- [ ] Existing records have 'en' as preferred_language
- [ ] Indexes are visible in pg_indexes
- [ ] Constraints are enforced

**Files:** None (MCP operation)

---

### Task 10: Update TypeScript Types - Users Table

**Task ID:** REQ-225-T10
**Type:** Implementation
**Priority:** P1
**Depends On:** REQ-225-T09

**Objective:** Update the `users` table type definitions in `/src/lib/supabase.ts`.

**File to Modify:** `/src/lib/supabase.ts`

**Locate:** The `users` table definition (around line 186-212)

**Changes to Make:**

In `users.Row` (after `updated_at: string | null`):
```typescript
preferred_language: string | null
```

In `users.Insert` (after `updated_at?: string | null`):
```typescript
preferred_language?: string | null
```

In `users.Update` (after `updated_at?: string | null`):
```typescript
preferred_language?: string | null
```

**Verification:**
```bash
npm run build
# Expected: No TypeScript errors
```

**Acceptance Criteria:**
- [ ] `preferred_language` added to `users.Row`
- [ ] `preferred_language` added to `users.Insert` (optional)
- [ ] `preferred_language` added to `users.Update` (optional)
- [ ] TypeScript build passes

**Files to Modify:**
| Path | Section | Changes |
|------|---------|---------|
| `/src/lib/supabase.ts` | `Database.public.Tables.users.Row` | Add `preferred_language: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.users.Insert` | Add `preferred_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.users.Update` | Add `preferred_language?: string \| null` |

---

### Task 11: Update TypeScript Types - Accounts Table

**Task ID:** REQ-225-T11
**Type:** Implementation
**Priority:** P1
**Depends On:** REQ-225-T09

**Objective:** Update the `accounts` table type definitions in `/src/lib/supabase.ts`.

**File to Modify:** `/src/lib/supabase.ts`

**Locate:** The `accounts` table definition (around line 50-79)

**Changes to Make:**

In `accounts.Row` (after `updated_at: string | null`):
```typescript
preferred_language: string | null
```

In `accounts.Insert` (after `updated_at?: string | null`):
```typescript
preferred_language?: string | null
```

In `accounts.Update` (after `updated_at?: string | null`):
```typescript
preferred_language?: string | null
```

**Verification:**
```bash
npm run build
# Expected: No TypeScript errors
```

**Acceptance Criteria:**
- [ ] `preferred_language` added to `accounts.Row`
- [ ] `preferred_language` added to `accounts.Insert` (optional)
- [ ] `preferred_language` added to `accounts.Update` (optional)
- [ ] TypeScript build passes

**Files to Modify:**
| Path | Section | Changes |
|------|---------|---------|
| `/src/lib/supabase.ts` | `Database.public.Tables.accounts.Row` | Add `preferred_language: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.accounts.Insert` | Add `preferred_language?: string \| null` |
| `/src/lib/supabase.ts` | `Database.public.Tables.accounts.Update` | Add `preferred_language?: string \| null` |

---

### Task 12: Final Verification and Testing

**Task ID:** REQ-225-T12
**Type:** Verification
**Priority:** P0
**Depends On:** REQ-225-T09, REQ-225-T10, REQ-225-T11

**Objective:** Perform comprehensive verification that all acceptance criteria are met.

**Verification Checklist:**

1. **Database Schema Verification:**
```sql
-- Verify columns exist
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'accounts')
  AND column_name = 'preferred_language';
-- Expected: 2 rows with VARCHAR(5) and 'en' default
```

2. **Existing Data Verification:**
```sql
-- All existing users should have 'en'
SELECT COUNT(*) as users_with_en
FROM users
WHERE preferred_language = 'en';

-- All existing accounts should have 'en'
SELECT COUNT(*) as accounts_with_en
FROM accounts
WHERE preferred_language = 'en';
```

3. **Constraint Verification:**
```sql
-- Test valid language codes work
UPDATE users
SET preferred_language = 'fr'
WHERE id = (SELECT id FROM users LIMIT 1);
-- Expected: Success

-- Revert test change
UPDATE users
SET preferred_language = 'en'
WHERE preferred_language = 'fr';

-- Test invalid codes are rejected (in a transaction that rolls back)
BEGIN;
UPDATE users SET preferred_language = 'xx' WHERE FALSE;
ROLLBACK;
-- Constraint exists but no rows to violate
```

4. **Index Verification:**
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE '%preferred_language%';
-- Expected: idx_users_preferred_language, idx_accounts_preferred_language
```

5. **TypeScript Build Verification:**
```bash
npm run build
# Expected: Success with no errors
```

**Acceptance Criteria (from REQ-225):**
- [ ] Each user record includes a language preference field with a default value of English
- [ ] Each account record includes a language preference field with a default value of English
- [ ] Language preference values follow standard language codes (ISO 639-1) for consistency
- [ ] Existing user and account records automatically received the default language value
- [ ] The database schema change is reversible without data loss (rollback script exists)

**Acceptance Criteria (from Plan-110 Task 1.3):**
- [ ] ALTER users and accounts tables with preferred_language column
- [ ] Default to 'en' for existing and new records
- [ ] CHECK constraints limit values to supported languages

**Files:** None (verification only)

---

## Complete Migration File Reference

The complete migration file after all tasks should look like:

**File:** `/database/migrations/20260118_add_preferred_language_columns.sql`

```sql
-- ===========================================================
-- Migration: Add preferred_language columns to users and accounts
-- File: 20260118_add_preferred_language_columns.sql
-- Generated: 2026-01-18
-- Last Modified: 2026-01-18
-- ===========================================================
--
-- Purpose: Store user and account language preferences for
--          localized content display
--
-- Epic: L10N Epic 1 - Foundation
-- Request Reference: REQ-225
-- Plan Reference: Plan-110-L10N-Epic1-Foundation.md (Task 1.3)
--
-- Tables Modified:
--   - users: Add preferred_language column
--   - accounts: Add preferred_language column
--
-- Supported Languages (ISO 639-1):
--   en (English - default), fr (French), es (Spanish),
--   de (German), nl (Dutch), it (Italian)
--
-- ===========================================================

-- ============================================================
-- SECTION 1: Add preferred_language to users table
-- ============================================================

-- Add column with default value
-- PostgreSQL 11+ handles DEFAULT efficiently without table rewrite
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint to limit to supported languages
ALTER TABLE users
ADD CONSTRAINT users_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 2: Add preferred_language to accounts table
-- ============================================================

-- Add column with default value
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint to limit to supported languages
ALTER TABLE accounts
ADD CONSTRAINT accounts_preferred_language_check
CHECK (preferred_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 3: Indexes for preferred_language columns
-- ============================================================
-- These indexes support:
--   - Grouping users by language (analytics)
--   - Bulk operations per language (notifications, exports)
--   - Account filtering by language

CREATE INDEX IF NOT EXISTS idx_users_preferred_language
ON users(preferred_language);

CREATE INDEX IF NOT EXISTS idx_accounts_preferred_language
ON accounts(preferred_language);

-- ============================================================
-- SECTION 4: Column Documentation
-- ============================================================

COMMENT ON COLUMN users.preferred_language IS
  'User preferred display language code (ISO 639-1). Supported: en, fr, es, de, nl, it. Defaults to en.';

COMMENT ON COLUMN accounts.preferred_language IS
  'Account default display language code (ISO 639-1). Applied to new users unless individually overridden. Defaults to en.';

-- ============================================================
-- ROLLBACK SCRIPT (run manually if rollback needed)
-- ============================================================
-- To reverse this migration, run the following commands:
--
-- -- Remove indexes
-- DROP INDEX IF EXISTS idx_accounts_preferred_language;
-- DROP INDEX IF EXISTS idx_users_preferred_language;
--
-- -- Remove constraints
-- ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_preferred_language_check;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_language_check;
--
-- -- Remove columns
-- ALTER TABLE accounts DROP COLUMN IF EXISTS preferred_language;
-- ALTER TABLE users DROP COLUMN IF EXISTS preferred_language;
--
-- ============================================================
-- END OF MIGRATION
-- ============================================================
```

---

## TypeScript Type Changes Summary

**File:** `/src/lib/supabase.ts`

### Users Table (lines ~186-212)

```typescript
users: {
  Row: {
    created_at: string | null
    email: string
    full_name: string | null
    id: string
    role: string | null
    updated_at: string | null
    preferred_language: string | null  // ADD THIS LINE
  }
  Insert: {
    created_at?: string | null
    email: string
    full_name?: string | null
    id: string
    role?: string | null
    updated_at?: string | null
    preferred_language?: string | null  // ADD THIS LINE
  }
  Update: {
    created_at?: string | null
    email?: string
    full_name?: string | null
    id?: string
    role?: string | null
    updated_at?: string | null
    preferred_language?: string | null  // ADD THIS LINE
  }
  Relationships: []
}
```

### Accounts Table (lines ~50-79)

```typescript
accounts: {
  Row: {
    created_at: string | null
    description: string | null
    id: string
    name: string
    owner_id: string
    settings: Json | null
    updated_at: string | null
    preferred_language: string | null  // ADD THIS LINE
  }
  Insert: {
    created_at?: string | null
    description?: string | null
    id?: string
    name: string
    owner_id: string
    settings?: Json | null
    updated_at?: string | null
    preferred_language?: string | null  // ADD THIS LINE
  }
  Update: {
    created_at?: string | null
    description?: string | null
    id?: string
    name?: string
    owner_id?: string
    settings?: Json | null
    updated_at?: string | null
    preferred_language?: string | null  // ADD THIS LINE
  }
  Relationships: []
}
```

---

## Task Dependency Graph

```
REQ-225-T01 (Verify DB State)
      │
      ▼
REQ-225-T02 (Create Directory)
      │
      ▼
REQ-225-T03 (Create File Header)
      │
      ├─────────────────────────┐
      ▼                         ▼
REQ-225-T04 (Users Column)    REQ-225-T05 (Accounts Column)
      │                         │
      └────────┬────────────────┘
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
REQ-225-T06  REQ-225-T07  REQ-225-T08
(Indexes)    (Comments)   (Rollback)
      │        │          │
      └────────┴────┬─────┘
                    │
                    ▼
           REQ-225-T09 (Apply Migration)
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
REQ-225-T10                 REQ-225-T11
(TS Users Types)            (TS Accounts Types)
      │                           │
      └─────────────┬─────────────┘
                    │
                    ▼
           REQ-225-T12 (Final Verification)
```

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Table lock during ALTER | Low | Medium | PostgreSQL 11+ handles DEFAULT efficiently |
| Existing queries break | Very Low | Low | Adding nullable column with default is safe |
| TypeScript type mismatch | Low | Medium | Update types immediately after migration |
| Constraint name collision | Very Low | Low | Use unique constraint names with table prefix |

---

## Post-Implementation Notes

After completing all tasks:

1. **Next Task:** REQ-226 (RLS policies for translation tables) can proceed
2. **Consumers:** The `preferred_language` columns will be consumed by:
   - Task 5.4: `useLanguagePreference` hook (Phase 5)
   - Task 5.6: Language preference API endpoint (Phase 5)
3. **No breaking changes:** Existing code continues to work; new column has default value

---

## References

- [Overview Document](/docs/REQ-225-add-preferredlanguage-columns-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Request Definition](/docs/gen_requests.md) - REQ-225
- [Database Schema](/database/schema.sql)
- [TypeScript Types](/src/lib/supabase.ts)
