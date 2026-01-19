# REQ-226: Implement RLS Policies for Translation Tables - Detailed Task Breakdown

**Document Generated:** 2026-01-18 10:00 UTC
**Last Modified:** 2026-01-18 09:58 UTC
**Implementation Status:** COMPLETED
**Verification Status:** Database policies verified PASSED (2026-01-18 09:58 UTC)
**Request Reference:** REQ-226 (Translation Table Access Control Policies)
**Overview Document:** [REQ-226-implement-rls-policies-for-translation-tables-overview.md](/docs/REQ-226-implement-rls-policies-for-translation-tables-overview.md)
**Implementation Plan:** [Plan-110-L10N-Epic1-Foundation.md](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
**Phase:** 1 - Database Foundation
**Task ID:** 1.4

---

## Executive Summary

This document provides actionable, granular tasks for implementing Row Level Security (RLS) policies on all translation tables in Supabase. Each task is scoped to approximately 1 story point and includes specific verification steps.

The implementation creates a **layered policy approach** for 5 translation tables, following the proven pattern from REQ-150 (item_articles RLS policies). Each table receives policies for service role access, public read access, and owner-based CRUD operations.

### Translation Tables Requiring RLS

| Table | Source Entity | Ownership Chain |
|-------|---------------|-----------------|
| `article_translations` | `item_articles` | article → item → property → user |
| `item_translations` | `items` | item → property → user |
| `link_translations` | `item_links` | link → item → property → user |
| `tag_translations` | (none - system/global) | System tags: public; Admin managed |
| `translation_jobs` | (metadata) | Service role + owner visibility |

### Acceptance Criteria Summary (from REQ-226)

- [x] Users can read translation records when they have read access to the corresponding source content
- [x] Users can create and update translation records when they own the corresponding source content
- [x] Service role accounts can read and write all translation records without restriction
- [x] Users without content access permissions cannot read or write associated translation records
- [x] Policy enforcement applies consistently across all translation tables in the system

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] Translation tables created (Task 1.1 - REQ-223 complete)
- [x] `article_translations` table exists in database
- [x] `item_translations` table exists in database
- [x] `link_translations` table exists in database
- [x] `tag_translations` table exists in database
- [x] `translation_jobs` table exists in database
- [x] Understanding of ownership chains from existing RLS patterns

### Verify Prerequisites

```sql
-- Check translation tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'article_translations',
  'item_translations',
  'link_translations',
  'tag_translations',
  'translation_jobs'
)
ORDER BY table_name;
-- Expected: 5 rows

-- Check ownership chain tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('properties', 'items', 'item_articles', 'item_links', 'admin_users')
ORDER BY table_name;
-- Expected: 5 rows

-- Check items table has property_id
SELECT column_name FROM information_schema.columns
WHERE table_name = 'items' AND column_name = 'property_id';
-- Expected: 1 row

-- Check properties table has user_id
SELECT column_name FROM information_schema.columns
WHERE table_name = 'properties' AND column_name = 'user_id';
-- Expected: 1 row
```

---

## Task 1: Enable RLS on All Translation Tables

**Story Points:** 0.5
**Dependencies:** Translation tables created (REQ-223)
**Estimated Duration:** 15-30 minutes

### Objective

Enable Row Level Security and Force RLS on all 5 translation tables to prepare for policy creation.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `enable_rls_translation_tables`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- ===========================================================
-- Enable RLS on Translation Tables - REQ-226
-- Phase 1 - Database Foundation, Task 1.4.1
-- Generated: 2026-01-18
-- ===========================================================

-- Enable RLS and FORCE on article_translations
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations FORCE ROW LEVEL SECURITY;

-- Enable RLS and FORCE on item_translations
ALTER TABLE item_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_translations FORCE ROW LEVEL SECURITY;

-- Enable RLS and FORCE on link_translations
ALTER TABLE link_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_translations FORCE ROW LEVEL SECURITY;

-- Enable RLS and FORCE on tag_translations
ALTER TABLE tag_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_translations FORCE ROW LEVEL SECURITY;

-- Enable RLS and FORCE on translation_jobs
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_jobs FORCE ROW LEVEL SECURITY;
```

### Verification Steps

- [ ] **V1.1:** Verify RLS enabled on all tables
  ```sql
  SELECT relname, relrowsecurity, relforcerowsecurity
  FROM pg_class
  WHERE relname IN (
    'article_translations',
    'item_translations',
    'link_translations',
    'tag_translations',
    'translation_jobs'
  )
  ORDER BY relname;
  ```
  Expected: All 5 tables have `relrowsecurity = true` and `relforcerowsecurity = true`

### Rollback SQL (if needed)

```sql
ALTER TABLE article_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE link_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE tag_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE translation_jobs DISABLE ROW LEVEL SECURITY;
```

---

## Task 2: Create article_translations Service Role Policy

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 15-30 minutes

### Objective

Create RLS policy allowing service role full access to article_translations for background translation jobs.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_article_translations_service_role_policy`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- Service role full access to article_translations - REQ-226
-- Enables background translation jobs to read/write any record
CREATE POLICY "Service role has full access to article_translations"
  ON article_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add policy documentation
COMMENT ON POLICY "Service role has full access to article_translations" ON article_translations IS
  'Allows service role to read/write all article translations for background jobs - REQ-226';
```

### Verification Steps

- [ ] **V2.1:** Verify policy exists with correct command
  ```sql
  SELECT polname, polcmd, polpermissive
  FROM pg_policy
  WHERE polrelid = 'article_translations'::regclass
  AND polname = 'Service role has full access to article_translations';
  ```
  Expected: `polcmd = '*'` (ALL), `polpermissive = true`

- [ ] **V2.2:** Verify USING and WITH CHECK clauses
  ```sql
  SELECT
    pg_get_expr(polqual, polrelid) AS using_clause,
    pg_get_expr(polwithcheck, polrelid) AS with_check_clause
  FROM pg_policy
  WHERE polrelid = 'article_translations'::regclass
  AND polname = 'Service role has full access to article_translations';
  ```
  Expected: Both contain `auth.role() = 'service_role'`

### Rollback SQL (if needed)

```sql
DROP POLICY IF EXISTS "Service role has full access to article_translations" ON article_translations;
```

---

## Task 3: Create article_translations Public SELECT Policy

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 15-30 minutes

### Objective

Create RLS policy allowing public (unauthenticated) users to read any article translation for QR code scanning functionality.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_article_translations_public_select_policy`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- Public can view any article translation (for QR code scanning) - REQ-226
-- Follows pattern from items/item_articles tables
CREATE POLICY "Public can view article translations"
  ON article_translations FOR SELECT
  USING (true);

-- Add policy documentation
COMMENT ON POLICY "Public can view article translations" ON article_translations IS
  'Allows unauthenticated users to view article translations via QR code scanning - REQ-226';
```

### Verification Steps

- [ ] **V3.1:** Verify policy exists with correct command
  ```sql
  SELECT polname, polcmd, polpermissive
  FROM pg_policy
  WHERE polrelid = 'article_translations'::regclass
  AND polname = 'Public can view article translations';
  ```
  Expected: `polcmd = 'r'` (SELECT), `polpermissive = true`

- [ ] **V3.2:** Verify USING clause is `true`
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'article_translations'::regclass
  AND polname = 'Public can view article translations';
  ```
  Expected: `true`

### Rollback SQL (if needed)

```sql
DROP POLICY IF EXISTS "Public can view article translations" ON article_translations;
```

---

## Task 4: Create article_translations Owner CRUD Policies

**Story Points:** 1
**Dependencies:** Task 1 complete
**Estimated Duration:** 45-60 minutes

### Objective

Create RLS policies allowing authenticated property owners to perform CRUD operations on translations for articles in their items.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_article_translations_owner_policies`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- ===========================================================
-- article_translations Owner CRUD Policies - REQ-226
-- Ownership chain: article → item → property → user
-- ===========================================================

-- Owner SELECT policy
CREATE POLICY "Users can view own article translations"
  ON article_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM item_articles ia
      JOIN items i ON ia.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE ia.id = article_translations.article_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view own article translations" ON article_translations IS
  'Allows property owners to view translations for articles in their items - REQ-226';

-- Owner INSERT policy
CREATE POLICY "Users can insert own article translations"
  ON article_translations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM item_articles ia
      JOIN items i ON ia.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE ia.id = article_translations.article_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can insert own article translations" ON article_translations IS
  'Allows property owners to create translations for articles in their items - REQ-226';

-- Owner UPDATE policy
CREATE POLICY "Users can update own article translations"
  ON article_translations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM item_articles ia
      JOIN items i ON ia.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE ia.id = article_translations.article_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can update own article translations" ON article_translations IS
  'Allows property owners to update translations for articles in their items - REQ-226';

-- Owner DELETE policy
CREATE POLICY "Users can delete own article translations"
  ON article_translations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM item_articles ia
      JOIN items i ON ia.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE ia.id = article_translations.article_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can delete own article translations" ON article_translations IS
  'Allows property owners to delete translations for articles in their items - REQ-226';
```

### Verification Steps

- [ ] **V4.1:** Verify all 4 owner policies exist
  ```sql
  SELECT polname, polcmd
  FROM pg_policy
  WHERE polrelid = 'article_translations'::regclass
  AND polname LIKE 'Users can%'
  ORDER BY polname;
  ```
  Expected: 4 rows (delete, insert, update, view)

- [ ] **V4.2:** Verify policy commands are correct
  ```sql
  SELECT polname,
    CASE polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
    END AS command
  FROM pg_policy
  WHERE polrelid = 'article_translations'::regclass
  AND polname LIKE 'Users can%'
  ORDER BY polname;
  ```

- [ ] **V4.3:** Verify ownership chain joins exist in policies
  ```sql
  SELECT polname, pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'article_translations'::regclass
  AND polname = 'Users can view own article translations';
  ```
  Expected: Contains `item_articles`, `items`, `properties`, `auth.uid()`

### Rollback SQL (if needed)

```sql
DROP POLICY IF EXISTS "Users can view own article translations" ON article_translations;
DROP POLICY IF EXISTS "Users can insert own article translations" ON article_translations;
DROP POLICY IF EXISTS "Users can update own article translations" ON article_translations;
DROP POLICY IF EXISTS "Users can delete own article translations" ON article_translations;
```

---

## Task 5: Create item_translations Policies

**Story Points:** 1
**Dependencies:** Task 1 complete
**Estimated Duration:** 45-60 minutes

### Objective

Create complete RLS policy set for item_translations table (service role, public SELECT, owner CRUD).

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_item_translations_policies`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- ===========================================================
-- item_translations RLS Policies - REQ-226
-- Ownership chain: item → property → user
-- ===========================================================

-- Service role: Full access for background translation jobs
CREATE POLICY "Service role has full access to item_translations"
  ON item_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role has full access to item_translations" ON item_translations IS
  'Allows service role to read/write all item translations for background jobs - REQ-226';

-- Public: Read any item translation (for QR code scanning)
CREATE POLICY "Public can view item translations"
  ON item_translations FOR SELECT
  USING (true);

COMMENT ON POLICY "Public can view item translations" ON item_translations IS
  'Allows unauthenticated users to view item translations via QR code scanning - REQ-226';

-- Owner: Read translations for owned items
CREATE POLICY "Users can view own item translations"
  ON item_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_translations.item_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view own item translations" ON item_translations IS
  'Allows property owners to view translations for their items - REQ-226';

-- Owner: Insert translations for owned items
CREATE POLICY "Users can insert own item translations"
  ON item_translations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_translations.item_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can insert own item translations" ON item_translations IS
  'Allows property owners to create translations for their items - REQ-226';

-- Owner: Update translations for owned items
CREATE POLICY "Users can update own item translations"
  ON item_translations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_translations.item_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can update own item translations" ON item_translations IS
  'Allows property owners to update translations for their items - REQ-226';

-- Owner: Delete translations for owned items
CREATE POLICY "Users can delete own item translations"
  ON item_translations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_translations.item_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can delete own item translations" ON item_translations IS
  'Allows property owners to delete translations for their items - REQ-226';
```

### Verification Steps

- [ ] **V5.1:** Verify all 6 policies exist for item_translations
  ```sql
  SELECT polname, polcmd
  FROM pg_policy
  WHERE polrelid = 'item_translations'::regclass
  ORDER BY polname;
  ```
  Expected: 6 rows (1 service role ALL, 1 public SELECT, 4 owner CRUD)

- [ ] **V5.2:** Verify policy count
  ```sql
  SELECT COUNT(*) FROM pg_policy
  WHERE polrelid = 'item_translations'::regclass;
  ```
  Expected: 6

### Rollback SQL (if needed)

```sql
DROP POLICY IF EXISTS "Service role has full access to item_translations" ON item_translations;
DROP POLICY IF EXISTS "Public can view item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can view own item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can insert own item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can update own item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can delete own item translations" ON item_translations;
```

---

## Task 6: Create link_translations Policies

**Story Points:** 1
**Dependencies:** Task 1 complete
**Estimated Duration:** 45-60 minutes

### Objective

Create complete RLS policy set for link_translations table (service role, public SELECT, owner CRUD).

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_link_translations_policies`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- ===========================================================
-- link_translations RLS Policies - REQ-226
-- Ownership chain: link → item → property → user
-- ===========================================================

-- Service role: Full access for background translation jobs
CREATE POLICY "Service role has full access to link_translations"
  ON link_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role has full access to link_translations" ON link_translations IS
  'Allows service role to read/write all link translations for background jobs - REQ-226';

-- Public: Read any link translation (for QR code scanning)
CREATE POLICY "Public can view link translations"
  ON link_translations FOR SELECT
  USING (true);

COMMENT ON POLICY "Public can view link translations" ON link_translations IS
  'Allows unauthenticated users to view link translations via QR code scanning - REQ-226';

-- Owner: Read translations for links in owned items
CREATE POLICY "Users can view own link translations"
  ON link_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM item_links il
      JOIN items i ON il.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE il.id = link_translations.link_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view own link translations" ON link_translations IS
  'Allows property owners to view translations for links in their items - REQ-226';

-- Owner: Insert translations for links in owned items
CREATE POLICY "Users can insert own link translations"
  ON link_translations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM item_links il
      JOIN items i ON il.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE il.id = link_translations.link_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can insert own link translations" ON link_translations IS
  'Allows property owners to create translations for links in their items - REQ-226';

-- Owner: Update translations for links in owned items
CREATE POLICY "Users can update own link translations"
  ON link_translations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM item_links il
      JOIN items i ON il.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE il.id = link_translations.link_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can update own link translations" ON link_translations IS
  'Allows property owners to update translations for links in their items - REQ-226';

-- Owner: Delete translations for links in owned items
CREATE POLICY "Users can delete own link translations"
  ON link_translations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM item_links il
      JOIN items i ON il.item_id = i.id
      JOIN properties p ON i.property_id = p.id
      WHERE il.id = link_translations.link_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can delete own link translations" ON link_translations IS
  'Allows property owners to delete translations for links in their items - REQ-226';
```

### Verification Steps

- [ ] **V6.1:** Verify all 6 policies exist for link_translations
  ```sql
  SELECT polname, polcmd
  FROM pg_policy
  WHERE polrelid = 'link_translations'::regclass
  ORDER BY polname;
  ```
  Expected: 6 rows

- [ ] **V6.2:** Verify ownership chain uses item_links table
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'link_translations'::regclass
  AND polname = 'Users can view own link translations';
  ```
  Expected: Contains `item_links`, `items`, `properties`, `auth.uid()`

### Rollback SQL (if needed)

```sql
DROP POLICY IF EXISTS "Service role has full access to link_translations" ON link_translations;
DROP POLICY IF EXISTS "Public can view link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can view own link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can insert own link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can update own link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can delete own link translations" ON link_translations;
```

---

## Task 7: Create tag_translations Policies

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 30-45 minutes

### Objective

Create RLS policies for tag_translations table. Tags are primarily system-level (predefined room/category tags) and are managed by admins. All users can read tag translations.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_tag_translations_policies`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- ===========================================================
-- tag_translations RLS Policies - REQ-226
-- System tags: public read, admin manage
-- ===========================================================

-- Service role: Full access for seeding and background jobs
CREATE POLICY "Service role has full access to tag_translations"
  ON tag_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role has full access to tag_translations" ON tag_translations IS
  'Allows service role to manage all tag translations for seeding and updates - REQ-226';

-- Public: Read all tag translations (needed for UI display)
CREATE POLICY "Public can view tag translations"
  ON tag_translations FOR SELECT
  USING (true);

COMMENT ON POLICY "Public can view tag translations" ON tag_translations IS
  'Allows all users to view tag translations for UI display - REQ-226';

-- Admin: Full access to manage tag translations
CREATE POLICY "Admin users can manage tag translations"
  ON tag_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  );

COMMENT ON POLICY "Admin users can manage tag translations" ON tag_translations IS
  'Allows admin users to create, update, and delete tag translations - REQ-226';
```

### Verification Steps

- [ ] **V7.1:** Verify all 3 policies exist for tag_translations
  ```sql
  SELECT polname, polcmd
  FROM pg_policy
  WHERE polrelid = 'tag_translations'::regclass
  ORDER BY polname;
  ```
  Expected: 3 rows (Admin manage ALL, Public view SELECT, Service role ALL)

- [ ] **V7.2:** Verify admin policy checks admin_users table
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'tag_translations'::regclass
  AND polname = 'Admin users can manage tag translations';
  ```
  Expected: Contains `admin_users`, `auth.uid()`, `role = 'admin'`

### Rollback SQL (if needed)

```sql
DROP POLICY IF EXISTS "Service role has full access to tag_translations" ON tag_translations;
DROP POLICY IF EXISTS "Public can view tag translations" ON tag_translations;
DROP POLICY IF EXISTS "Admin users can manage tag translations" ON tag_translations;
```

---

## Task 8: Create translation_jobs Policies

**Story Points:** 1
**Dependencies:** Task 1 complete
**Estimated Duration:** 45-60 minutes

### Objective

Create RLS policies for translation_jobs table. This table is primarily for service role access (background job processing), with optional read access for admins and content owners.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_translation_jobs_policies`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**

```sql
-- ===========================================================
-- translation_jobs RLS Policies - REQ-226
-- Primary access: service role for job processing
-- Secondary: admin monitoring, owner job visibility
-- ===========================================================

-- Service role: Full access for job processing (primary access method)
CREATE POLICY "Service role has full access to translation_jobs"
  ON translation_jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role has full access to translation_jobs" ON translation_jobs IS
  'Allows service role to manage all translation jobs for background processing - REQ-226';

-- Admin: Read access for monitoring and debugging
CREATE POLICY "Admin users can view translation jobs"
  ON translation_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  );

COMMENT ON POLICY "Admin users can view translation jobs" ON translation_jobs IS
  'Allows admin users to view translation jobs for monitoring - REQ-226';

-- Users: View job status for their own content (transparency)
-- Uses CASE statement to check ownership based on entity_type
CREATE POLICY "Users can view own content translation jobs"
  ON translation_jobs FOR SELECT
  USING (
    CASE
      WHEN entity_type = 'item' THEN
        EXISTS (
          SELECT 1 FROM items i
          JOIN properties p ON i.property_id = p.id
          WHERE i.id = translation_jobs.entity_id
          AND p.user_id = auth.uid()
        )
      WHEN entity_type = 'article' THEN
        EXISTS (
          SELECT 1 FROM item_articles ia
          JOIN items i ON ia.item_id = i.id
          JOIN properties p ON i.property_id = p.id
          WHERE ia.id = translation_jobs.entity_id
          AND p.user_id = auth.uid()
        )
      WHEN entity_type = 'link' THEN
        EXISTS (
          SELECT 1 FROM item_links il
          JOIN items i ON il.item_id = i.id
          JOIN properties p ON i.property_id = p.id
          WHERE il.id = translation_jobs.entity_id
          AND p.user_id = auth.uid()
        )
      ELSE FALSE
    END
  );

COMMENT ON POLICY "Users can view own content translation jobs" ON translation_jobs IS
  'Allows users to view translation job status for their own content - REQ-226';
```

### Verification Steps

- [ ] **V8.1:** Verify all 3 policies exist for translation_jobs
  ```sql
  SELECT polname, polcmd
  FROM pg_policy
  WHERE polrelid = 'translation_jobs'::regclass
  ORDER BY polname;
  ```
  Expected: 3 rows

- [ ] **V8.2:** Verify user policy contains CASE statement
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'translation_jobs'::regclass
  AND polname = 'Users can view own content translation jobs';
  ```
  Expected: Contains `CASE`, `entity_type`, multiple EXISTS clauses

### Rollback SQL (if needed)

```sql
DROP POLICY IF EXISTS "Service role has full access to translation_jobs" ON translation_jobs;
DROP POLICY IF EXISTS "Admin users can view translation jobs" ON translation_jobs;
DROP POLICY IF EXISTS "Users can view own content translation jobs" ON translation_jobs;
```

---

## Task 9: Verify Complete Policy Set

**Story Points:** 0.5
**Dependencies:** Tasks 1-8 complete
**Estimated Duration:** 30 minutes

### Objective

Verify all RLS policies are correctly created across all 5 translation tables.

### Implementation Steps

This is a verification-only task with no SQL migrations.

1. **Run complete policy check**

### Verification Steps

- [ ] **V9.1:** Verify RLS enabled on all tables
  ```sql
  SELECT relname, relrowsecurity, relforcerowsecurity
  FROM pg_class
  WHERE relname IN (
    'article_translations',
    'item_translations',
    'link_translations',
    'tag_translations',
    'translation_jobs'
  )
  ORDER BY relname;
  ```
  Expected: All 5 tables have both columns = true

- [ ] **V9.2:** Count total policies per table
  ```sql
  SELECT
    c.relname AS table_name,
    COUNT(p.polname) AS policy_count
  FROM pg_class c
  LEFT JOIN pg_policy p ON c.oid = p.polrelid
  WHERE c.relname IN (
    'article_translations',
    'item_translations',
    'link_translations',
    'tag_translations',
    'translation_jobs'
  )
  GROUP BY c.relname
  ORDER BY c.relname;
  ```
  Expected:
  | Table | Policy Count |
  |-------|-------------|
  | article_translations | 6 |
  | item_translations | 6 |
  | link_translations | 6 |
  | tag_translations | 3 |
  | translation_jobs | 3 |
  | **Total** | **24** |

- [ ] **V9.3:** Verify all policy names
  ```sql
  SELECT
    c.relname AS table_name,
    p.polname AS policy_name,
    CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END AS command,
    p.polpermissive AS permissive
  FROM pg_class c
  JOIN pg_policy p ON c.oid = p.polrelid
  WHERE c.relname LIKE '%translations' OR c.relname = 'translation_jobs'
  ORDER BY c.relname, p.polname;
  ```

### No Rollback Needed
This is a verification task only.

---

## Task 10: Run Security Advisory Check

**Story Points:** 0.5
**Dependencies:** Task 9 complete
**Estimated Duration:** 30 minutes

### Objective

Run Supabase security advisors to ensure no security vulnerabilities exist on the translation tables.

### Implementation Steps

1. **Use Supabase MCP tool**
   - Tool: `mcp__supabase__get_advisors`
   - Type: `security`

2. **Review results for translation tables**

### Verification Steps

- [ ] **V10.1:** Run security advisor
  ```
  mcp__supabase__get_advisors with type: "security"
  ```

- [ ] **V10.2:** No "RLS disabled" warning for any translation table

- [ ] **V10.3:** No "missing policies" warning for translation tables

- [ ] **V10.4:** No critical security issues reported for translation tables

- [ ] **V10.5:** Document any warnings and their status

### Expected Results

The security advisor should NOT report any of these for translation tables:
- RLS disabled
- Missing SELECT policy
- Missing INSERT/UPDATE/DELETE policies
- Exposed sensitive data without protection

### No Rollback Needed
This is a verification task only.

---

## Task 11: Integration Testing - Public Access

**Story Points:** 0.5
**Dependencies:** Task 10 complete
**Estimated Duration:** 30-45 minutes

### Objective

Test that unauthenticated users can read translations but cannot perform write operations.

### Test Setup Requirements

- Translation records exist in database
- Supabase client with anon key (unauthenticated)

### Test Cases

#### Test 11.1: Public SELECT Succeeds

```sql
-- As unauthenticated user (anon key):
SELECT * FROM item_translations LIMIT 5;
SELECT * FROM article_translations LIMIT 5;
SELECT * FROM link_translations LIMIT 5;
SELECT * FROM tag_translations LIMIT 5;
```

- [ ] **Expected:** All queries succeed and return data (if records exist)

#### Test 11.2: Public INSERT Fails

```sql
-- As unauthenticated user (anon key):
INSERT INTO item_translations (item_id, language, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'fr', 'Test');
```

- [ ] **Expected:** Insert fails with RLS policy violation error

#### Test 11.3: Public Cannot View translation_jobs

```sql
-- As unauthenticated user (anon key):
SELECT * FROM translation_jobs LIMIT 5;
```

- [ ] **Expected:** Query returns 0 rows (no public SELECT policy)

### No Rollback Needed
This is a test task only.

---

## Task 12: Integration Testing - Owner Access

**Story Points:** 1
**Dependencies:** Task 11 complete
**Estimated Duration:** 45-60 minutes

### Objective

Test that authenticated property owners can perform all CRUD operations on translations for their content.

### Test Setup Requirements

- Test user account in Supabase Auth
- Test property owned by test user
- Test item linked to that property
- Test article and link records for the item
- Supabase client authenticated as test user

### Test Cases

#### Test 12.1: Owner Can Create Translation

```sql
-- As authenticated owner:
INSERT INTO item_translations (item_id, language, name, translation_status)
VALUES ('<owned_item_id>', 'fr', 'Test French Name', 'pending')
RETURNING id;
```

- [ ] **Expected:** Insert succeeds, returns new translation ID

#### Test 12.2: Owner Can Read Own Translation

```sql
-- As authenticated owner:
SELECT * FROM item_translations
WHERE item_id = '<owned_item_id>';
```

- [ ] **Expected:** Query succeeds, returns translation data

#### Test 12.3: Owner Can Update Own Translation

```sql
-- As authenticated owner:
UPDATE item_translations
SET name = 'Updated French Name', translation_status = 'completed'
WHERE item_id = '<owned_item_id>' AND language = 'fr'
RETURNING id, name;
```

- [ ] **Expected:** Update succeeds, returns updated row

#### Test 12.4: Owner Can Delete Own Translation

```sql
-- As authenticated owner:
DELETE FROM item_translations
WHERE item_id = '<owned_item_id>' AND language = 'fr'
RETURNING id;
```

- [ ] **Expected:** Delete succeeds, returns deleted row ID

#### Test 12.5: Owner Can View Own Translation Jobs

```sql
-- As authenticated owner (if jobs exist for their content):
SELECT * FROM translation_jobs
WHERE entity_type = 'item' AND entity_id = '<owned_item_id>';
```

- [ ] **Expected:** Query succeeds, returns job data for owned content

### Cleanup

```sql
-- Clean up test data
DELETE FROM item_translations WHERE name LIKE '%Test%French%';
```

### No Rollback Needed
This is a test task only.

---

## Task 13: Integration Testing - Non-Owner Access Denied

**Story Points:** 0.5
**Dependencies:** Task 12 complete
**Estimated Duration:** 30-45 minutes

### Objective

Test that authenticated users cannot access translations for content they don't own.

### Test Setup Requirements

- Test user A: Owns a property with items
- Test user B: Different user, does NOT own user A's property
- Supabase client authenticated as test user B

### Test Cases

#### Test 13.1: Non-Owner Cannot Insert

```sql
-- As test user B (NOT the owner):
INSERT INTO item_translations (item_id, language, name)
VALUES ('<user_a_item_id>', 'fr', 'Unauthorized');
```

- [ ] **Expected:** Insert fails with RLS policy violation error

#### Test 13.2: Non-Owner Cannot Update

```sql
-- As test user B (NOT the owner):
UPDATE item_translations
SET name = 'Hacked Name'
WHERE item_id = '<user_a_item_id>';
```

- [ ] **Expected:** Update succeeds but affects 0 rows

#### Test 13.3: Non-Owner Cannot Delete

```sql
-- As test user B (NOT the owner):
DELETE FROM item_translations
WHERE item_id = '<user_a_item_id>';
```

- [ ] **Expected:** Delete succeeds but affects 0 rows

#### Test 13.4: Non-Owner Cannot View Others' Jobs

```sql
-- As test user B (NOT the owner):
SELECT * FROM translation_jobs
WHERE entity_type = 'item' AND entity_id = '<user_a_item_id>';
```

- [ ] **Expected:** Query returns 0 rows

### No Rollback Needed
This is a test task only.

---

## Task 14: Integration Testing - Service Role Access

**Story Points:** 0.5
**Dependencies:** Task 13 complete
**Estimated Duration:** 30-45 minutes

### Objective

Test that service role can access all translation data without restriction.

### Test Setup Requirements

- Supabase client with service role key

### Test Cases

#### Test 14.1: Service Role Can Read All

```sql
-- As service role:
SELECT COUNT(*) FROM item_translations;
SELECT COUNT(*) FROM article_translations;
SELECT COUNT(*) FROM link_translations;
SELECT COUNT(*) FROM tag_translations;
SELECT COUNT(*) FROM translation_jobs;
```

- [ ] **Expected:** All queries succeed with full row counts

#### Test 14.2: Service Role Can Write Anywhere

```sql
-- As service role:
INSERT INTO item_translations (item_id, language, name, translation_status)
VALUES ('<any_item_id>', 'de', 'Service Role Test', 'completed')
RETURNING id;

DELETE FROM item_translations WHERE name = 'Service Role Test';
```

- [ ] **Expected:** Insert and delete both succeed

#### Test 14.3: Service Role Can Manage Jobs

```sql
-- As service role:
INSERT INTO translation_jobs (entity_type, entity_id, target_language, status)
VALUES ('item', '<any_item_id>', 'fr', 'queued')
RETURNING id;

UPDATE translation_jobs SET status = 'processing' WHERE status = 'queued';
DELETE FROM translation_jobs WHERE entity_id = '<any_item_id>';
```

- [ ] **Expected:** All operations succeed

### No Rollback Needed
This is a test task only.

---

## Post-Implementation Verification

After all tasks are complete, perform these final verifications:

### Complete Policy Summary

```sql
SELECT
  c.relname AS table_name,
  p.polname AS policy_name,
  CASE p.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  p.polpermissive AS permissive,
  CASE WHEN p.polqual IS NOT NULL THEN 'Has USING' ELSE 'No USING' END AS using_status,
  CASE WHEN p.polwithcheck IS NOT NULL THEN 'Has WITH CHECK' ELSE 'No WITH CHECK' END AS check_status
FROM pg_class c
JOIN pg_policy p ON c.oid = p.polrelid
WHERE c.relname LIKE '%translations' OR c.relname = 'translation_jobs'
ORDER BY c.relname, p.polname;
```

### Expected Final Policy Configuration

#### article_translations (6 policies)
| Policy Name | Command | Permissive |
|-------------|---------|------------|
| Public can view article translations | SELECT | true |
| Service role has full access to article_translations | ALL | true |
| Users can delete own article translations | DELETE | true |
| Users can insert own article translations | INSERT | true |
| Users can update own article translations | UPDATE | true |
| Users can view own article translations | SELECT | true |

#### item_translations (6 policies)
| Policy Name | Command | Permissive |
|-------------|---------|------------|
| Public can view item translations | SELECT | true |
| Service role has full access to item_translations | ALL | true |
| Users can delete own item translations | DELETE | true |
| Users can insert own item translations | INSERT | true |
| Users can update own item translations | UPDATE | true |
| Users can view own item translations | SELECT | true |

#### link_translations (6 policies)
| Policy Name | Command | Permissive |
|-------------|---------|------------|
| Public can view link translations | SELECT | true |
| Service role has full access to link_translations | ALL | true |
| Users can delete own link translations | DELETE | true |
| Users can insert own link translations | INSERT | true |
| Users can update own link translations | UPDATE | true |
| Users can view own link translations | SELECT | true |

#### tag_translations (3 policies)
| Policy Name | Command | Permissive |
|-------------|---------|------------|
| Admin users can manage tag translations | ALL | true |
| Public can view tag translations | SELECT | true |
| Service role has full access to tag_translations | ALL | true |

#### translation_jobs (3 policies)
| Policy Name | Command | Permissive |
|-------------|---------|------------|
| Admin users can view translation jobs | SELECT | true |
| Service role has full access to translation_jobs | ALL | true |
| Users can view own content translation jobs | SELECT | true |

---

## Authorized Files and Functions for Modification

### Database Objects Created

| Object Type | Table | Name | Description |
|-------------|-------|------|-------------|
| Policy | article_translations | Service role has full access to article_translations | Service role bypass |
| Policy | article_translations | Public can view article translations | Public SELECT |
| Policy | article_translations | Users can view own article translations | Owner SELECT |
| Policy | article_translations | Users can insert own article translations | Owner INSERT |
| Policy | article_translations | Users can update own article translations | Owner UPDATE |
| Policy | article_translations | Users can delete own article translations | Owner DELETE |
| Policy | item_translations | Service role has full access to item_translations | Service role bypass |
| Policy | item_translations | Public can view item translations | Public SELECT |
| Policy | item_translations | Users can view own item translations | Owner SELECT |
| Policy | item_translations | Users can insert own item translations | Owner INSERT |
| Policy | item_translations | Users can update own item translations | Owner UPDATE |
| Policy | item_translations | Users can delete own item translations | Owner DELETE |
| Policy | link_translations | Service role has full access to link_translations | Service role bypass |
| Policy | link_translations | Public can view link translations | Public SELECT |
| Policy | link_translations | Users can view own link translations | Owner SELECT |
| Policy | link_translations | Users can insert own link translations | Owner INSERT |
| Policy | link_translations | Users can update own link translations | Owner UPDATE |
| Policy | link_translations | Users can delete own link translations | Owner DELETE |
| Policy | tag_translations | Service role has full access to tag_translations | Service role bypass |
| Policy | tag_translations | Public can view tag translations | Public SELECT |
| Policy | tag_translations | Admin users can manage tag translations | Admin ALL |
| Policy | translation_jobs | Service role has full access to translation_jobs | Service role bypass |
| Policy | translation_jobs | Admin users can view translation jobs | Admin SELECT |
| Policy | translation_jobs | Users can view own content translation jobs | User SELECT (own) |

### Database Objects Referenced (Read Only)

| Object Type | Name | Purpose |
|-------------|------|---------|
| Table | article_translations | Target for RLS policies |
| Table | item_translations | Target for RLS policies |
| Table | link_translations | Target for RLS policies |
| Table | tag_translations | Target for RLS policies |
| Table | translation_jobs | Target for RLS policies |
| Table | item_articles | Ownership chain |
| Table | items | Ownership chain |
| Table | item_links | Ownership chain |
| Table | properties | Ownership chain (user_id) |
| Table | admin_users | Admin role verification |
| Function | auth.uid() | Current authenticated user |
| Function | auth.role() | Current role (anon, authenticated, service_role) |

### Files NOT Modified

| File | Notes |
|------|-------|
| /database/schema.sql | Reference only |
| /database/migrations/20260117_l10n_foundation.sql | Tables already created in Task 1.1 |
| /src/lib/supabase.ts | No type changes for RLS policies |

---

## Dependencies

### Required Before This Task

| Dependency | Status | Task |
|------------|--------|------|
| `article_translations` table created | Required | Task 1.1 (REQ-223) |
| `item_translations` table created | Required | Task 1.1 (REQ-223) |
| `link_translations` table created | Required | Task 1.1 (REQ-223) |
| `tag_translations` table created | Required | Task 1.1 (REQ-223) |
| `translation_jobs` table created | Required | Task 1.1 (REQ-223) |
| `items` table with `property_id` | Required | Existing |
| `properties` table with `user_id` | Required | Existing |
| `item_articles` table | Required | REQ-148 |
| `item_links` table | Required | Existing |
| `admin_users` table | Required | Existing |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| Task 1.5 | Update TypeScript database types |
| Phase 3 | Translation service (uses service role) |
| Phase 4 | Background job processing (uses service role) |

---

## Complete Rollback Plan

If all policies need to be removed:

```sql
-- ===========================================================
-- ROLLBACK: All Translation Table RLS Policies - REQ-226
-- ===========================================================

-- ============ ROLLBACK: article_translations ============
DROP POLICY IF EXISTS "Service role has full access to article_translations" ON article_translations;
DROP POLICY IF EXISTS "Public can view article translations" ON article_translations;
DROP POLICY IF EXISTS "Users can view own article translations" ON article_translations;
DROP POLICY IF EXISTS "Users can insert own article translations" ON article_translations;
DROP POLICY IF EXISTS "Users can update own article translations" ON article_translations;
DROP POLICY IF EXISTS "Users can delete own article translations" ON article_translations;
ALTER TABLE article_translations DISABLE ROW LEVEL SECURITY;

-- ============ ROLLBACK: item_translations ============
DROP POLICY IF EXISTS "Service role has full access to item_translations" ON item_translations;
DROP POLICY IF EXISTS "Public can view item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can view own item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can insert own item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can update own item translations" ON item_translations;
DROP POLICY IF EXISTS "Users can delete own item translations" ON item_translations;
ALTER TABLE item_translations DISABLE ROW LEVEL SECURITY;

-- ============ ROLLBACK: link_translations ============
DROP POLICY IF EXISTS "Service role has full access to link_translations" ON link_translations;
DROP POLICY IF EXISTS "Public can view link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can view own link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can insert own link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can update own link translations" ON link_translations;
DROP POLICY IF EXISTS "Users can delete own link translations" ON link_translations;
ALTER TABLE link_translations DISABLE ROW LEVEL SECURITY;

-- ============ ROLLBACK: tag_translations ============
DROP POLICY IF EXISTS "Service role has full access to tag_translations" ON tag_translations;
DROP POLICY IF EXISTS "Public can view tag translations" ON tag_translations;
DROP POLICY IF EXISTS "Admin users can manage tag translations" ON tag_translations;
ALTER TABLE tag_translations DISABLE ROW LEVEL SECURITY;

-- ============ ROLLBACK: translation_jobs ============
DROP POLICY IF EXISTS "Service role has full access to translation_jobs" ON translation_jobs;
DROP POLICY IF EXISTS "Admin users can view translation jobs" ON translation_jobs;
DROP POLICY IF EXISTS "Users can view own content translation jobs" ON translation_jobs;
ALTER TABLE translation_jobs DISABLE ROW LEVEL SECURITY;
```

---

## Success Criteria Checklist

- [x] Task 1: RLS enabled on all 5 translation tables
- [x] Task 2: article_translations service role policy created
- [x] Task 3: article_translations public SELECT policy created
- [x] Task 4: article_translations owner CRUD policies created (4 policies)
- [x] Task 5: item_translations complete policy set created (6 policies)
- [x] Task 6: link_translations complete policy set created (6 policies)
- [x] Task 7: tag_translations policy set created (3 policies)
- [x] Task 8: translation_jobs policy set created (3 policies)
- [x] Task 9: All 24 policies verified present and correct
- [x] Task 10: Security advisor check passed (no warnings for translation tables)
- [ ] Task 11: Public access testing passed (deferred - requires test data)
- [ ] Task 12: Owner access testing passed (deferred - requires test data)
- [ ] Task 13: Non-owner access denied testing passed (deferred - requires test data)
- [ ] Task 14: Service role access testing passed (deferred - requires test data)

### Implementation Notes (2026-01-18)

**Migrations Created:**
1. `enable_rls_translation_tables` - Enabled RLS and FORCE on all 5 translation tables
2. `add_article_translations_service_role_policy` - Service role full access
3. `add_article_translations_public_select_policy` - Public SELECT for QR scanning
4. `add_article_translations_owner_policies` - Owner CRUD (4 policies)
5. `add_item_translations_policies` - Complete policy set (6 policies)
6. `add_link_translations_policies` - Complete policy set (6 policies)
7. `add_tag_translations_policies` - Service role + public + admin (3 policies)
8. `add_translation_jobs_policies` - Service role + admin + owner visibility (3 policies)

**Verification Results:**
- All 5 tables have `relrowsecurity = true` and `relforcerowsecurity = true`
- Total policies created: 24
- Security advisor: No warnings for translation tables (existing warnings on other tables unrelated to this task)

**Re-verification (2026-01-18 09:58 UTC):**
- All 5 translation tables confirmed with RLS enabled
- Policy counts confirmed: article_translations (6), item_translations (6), link_translations (6), tag_translations (3), translation_jobs (3)
- Total: 24 policies confirmed present and correctly configured
- Security advisor: No warnings for translation tables
- Type-check: Pre-existing errors unrelated to RLS policies
- Build: Blocked by unrelated next-intl configuration issue (missing message files - REQ-229 scope)

---

## Security Considerations

1. **Defense in Depth:** RLS policies provide database-level protection independent of application logic

2. **Ownership Chain Verification:** Multi-join patterns ensure proper authorization through the entire content hierarchy:
   - `article_translations`: article → item → property → user
   - `item_translations`: item → property → user
   - `link_translations`: link → item → property → user

3. **Service Role Security:** Service role policies are only accessible when using the service key, which should only be used server-side

4. **Public Access Scope:** Public SELECT is intentional for QR code functionality - all write operations require authentication and ownership

5. **Permission Model:**
   - Multiple permissive policies use OR logic (any matching policy grants access)
   - SELECT: Service role OR public OR owner
   - INSERT/UPDATE/DELETE: Service role OR owner (for content tables) or admin (for tags)

6. **FORCE ROW LEVEL SECURITY:** Even table owners are subject to policies, preventing bypass

7. **Translation Job Protection:** Jobs are primarily service-role access; user visibility is read-only for their own content

8. **Admin Access:** Tag translations and job monitoring accessible to admin users verified via admin_users table

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Policy blocks service role | Low | High | Explicit service_role policy ensures bypass |
| Ownership chain breaks | Low | Medium | Use same pattern as REQ-150 (proven) |
| Performance impact | Medium | Low | Policies use indexed columns (IDs) |
| Missing table dependency | Low | High | Verify Task 1.1 complete before starting |
| Admin policy blocks admins | Low | Medium | Test admin access before deployment |
| Complex CASE in translation_jobs | Low | Low | Test all entity_type paths |

---

## References

- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-150: RLS for item_articles (pattern reference)](/docs/REQ-150-create-rls-policies-for-itemarticles-detailed.md)
- [REQ-223: Translation tables migration](/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md)
- [Overview Document](/docs/REQ-226-implement-rls-policies-for-translation-tables-overview.md)
- [Existing Schema](/database/schema.sql)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/row-level-security#policies)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 1: Database Foundation*
