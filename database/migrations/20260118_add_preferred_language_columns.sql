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
