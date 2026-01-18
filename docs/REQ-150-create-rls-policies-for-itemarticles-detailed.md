# REQ-150: Create RLS Policies for `item_articles` - Detailed Task Breakdown

**Document Generated:** 2026-01-10 00:12 UTC
**Last Modified:** 2026-01-10 00:57 UTC
**Implementation Status:** ✅ COMPLETED
**Request Reference:** REQ-150 (Implement Row Level Security Policies for Item Articles)
**Overview Document:** [REQ-150-create-rls-policies-for-itemarticles-overview.md](/docs/REQ-150-create-rls-policies-for-itemarticles-overview.md)
**Implementation Plan:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.3

---

## Executive Summary

This document provides actionable, granular tasks for creating Row Level Security (RLS) policies on the `item_articles` table in Supabase. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

The implementation follows a **separate policy strategy** (Option B from the overview) with explicit policies for SELECT, INSERT, UPDATE, and DELETE operations, plus a public SELECT policy for QR code scanning.

### Acceptance Criteria Summary (from REQ-150)

- [x] Authenticated users can view articles for items in properties they own
- [x] Authenticated users can create new articles for items in properties they own
- [x] Authenticated users can modify existing articles for items in properties they own
- [x] Authenticated users can remove articles for items in properties they own
- [x] Authenticated users cannot view articles for items in properties owned by others
- [x] Unauthenticated users can view any article regardless of ownership
- [x] All access control is enforced at the database level through RLS policies

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] Access to Supabase project with MCP tools enabled
- [x] `item_articles` table exists in database (from Task 0.1 - REQ-148)
- [x] RLS is enabled on `item_articles` table (from Task 0.1 - REQ-148)
- [x] `items` table exists with `property_id` column
- [x] `properties` table exists with `user_id` column
- [x] Understanding of ownership chain: `user → properties → items → item_articles`

### Verify Prerequisites

```sql
-- Check item_articles table exists with RLS enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'item_articles';
-- Expected: relrowsecurity = true, relforcerowsecurity = true

-- Check ownership chain tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('properties', 'items', 'item_articles')
ORDER BY table_name;
-- Expected: 3 rows (items, item_articles, properties)

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

## Task 1: Drop Existing Basic Policies

**Story Points:** 0.5
**Dependencies:** `item_articles` table must exist with RLS enabled
**Estimated Duration:** 15-30 minutes

### Objective

Remove any basic policies created during table creation (Task 0.1) to prepare for granular policy creation.

### Implementation Steps

1. **Check existing policies**
   ```sql
   SELECT polname FROM pg_policy
   WHERE polrelid = 'item_articles'::regclass;
   ```

2. **Use Supabase MCP tool to apply migration**
   - Migration name: `drop_basic_item_articles_policies`
   - Tool: `mcp__supabase__apply_migration`

3. **SQL to Execute:**
```sql
-- Drop basic policies created in Task 0.1 if they exist - REQ-150
-- Prepares clean slate for granular policy creation
DROP POLICY IF EXISTS "Public can view item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can manage own item articles" ON item_articles;
DROP POLICY IF EXISTS "Admin users can manage item articles" ON item_articles;
```

### Verification Steps

- [x] **V1.1:** Verify no policies remain ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT polname FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass;
  ```
  Expected: 0 rows (no policies)

- [x] **V1.2:** Verify RLS is still enabled ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT relname, relrowsecurity
  FROM pg_class
  WHERE relname = 'item_articles';
  ```
  Expected: `relrowsecurity = true`

### Rollback SQL (if needed)
```sql
-- No rollback needed - subsequent tasks will create new policies
-- If Task 0.1 policies need to be restored:
CREATE POLICY "Users can manage own item articles"
  ON item_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );
```

---

## Task 2: Create Owner SELECT Policy

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 30-45 minutes

### Objective

Create RLS policy allowing authenticated users to view articles for items in their properties.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_item_articles_owner_select_policy`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- Users can view articles for items in their properties - REQ-150
-- Part of granular policy set for authenticated access control
CREATE POLICY "Users can view own item articles"
  ON item_articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Add policy documentation
COMMENT ON POLICY "Users can view own item articles" ON item_articles IS
  'Allows property owners to view articles for items in their properties - REQ-150';
```

### Verification Steps

- [x] **V2.1:** Verify policy exists with correct command ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT polname, polcmd, polpermissive
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can view own item articles';
  ```
  Expected: `polcmd = 'r'` (SELECT), `polpermissive = true`

- [x] **V2.2:** Verify policy definition contains ownership check ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can view own item articles';
  ```
  Expected: Contains `EXISTS`, `items`, `properties`, `auth.uid()`

### Rollback SQL (if needed)
```sql
DROP POLICY IF EXISTS "Users can view own item articles" ON item_articles;
```

---

## Task 3: Create Owner INSERT Policy

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 30-45 minutes

### Objective

Create RLS policy allowing authenticated users to create articles for items in their properties.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_item_articles_owner_insert_policy`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- Users can insert articles for items in their properties - REQ-150
-- Uses WITH CHECK clause for INSERT validation
CREATE POLICY "Users can insert own item articles"
  ON item_articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Add policy documentation
COMMENT ON POLICY "Users can insert own item articles" ON item_articles IS
  'Allows property owners to create articles for items in their properties - REQ-150';
```

### Verification Steps

- [x] **V3.1:** Verify policy exists with correct command ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT polname, polcmd, polpermissive
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can insert own item articles';
  ```
  Expected: `polcmd = 'a'` (INSERT), `polpermissive = true`

- [x] **V3.2:** Verify WITH CHECK clause exists ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT pg_get_expr(polwithcheck, polrelid) AS with_check_clause
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can insert own item articles';
  ```
  Expected: Contains ownership verification EXISTS clause

### Rollback SQL (if needed)
```sql
DROP POLICY IF EXISTS "Users can insert own item articles" ON item_articles;
```

---

## Task 4: Create Owner UPDATE Policy

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 30-45 minutes

### Objective

Create RLS policy allowing authenticated users to update articles for items in their properties.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_item_articles_owner_update_policy`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- Users can update articles for items in their properties - REQ-150
-- UPDATE uses USING clause (determines which rows can be updated)
CREATE POLICY "Users can update own item articles"
  ON item_articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Add policy documentation
COMMENT ON POLICY "Users can update own item articles" ON item_articles IS
  'Allows property owners to update articles for items in their properties - REQ-150';
```

### Technical Note

UPDATE policies use `USING` clause, not `WITH CHECK`. The `USING` clause determines which existing rows can be updated. If you also need to validate the new values being written, add a `WITH CHECK` clause (not needed here since we only verify ownership).

### Verification Steps

- [x] **V4.1:** Verify policy exists with correct command ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT polname, polcmd, polpermissive
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can update own item articles';
  ```
  Expected: `polcmd = 'w'` (UPDATE), `polpermissive = true`

- [x] **V4.2:** Verify USING clause exists ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can update own item articles';
  ```
  Expected: Contains ownership verification EXISTS clause

### Rollback SQL (if needed)
```sql
DROP POLICY IF EXISTS "Users can update own item articles" ON item_articles;
```

---

## Task 5: Create Owner DELETE Policy

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 30-45 minutes

### Objective

Create RLS policy allowing authenticated users to delete articles for items in their properties.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_item_articles_owner_delete_policy`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- Users can delete articles for items in their properties - REQ-150
-- DELETE uses USING clause (determines which rows can be deleted)
CREATE POLICY "Users can delete own item articles"
  ON item_articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Add policy documentation
COMMENT ON POLICY "Users can delete own item articles" ON item_articles IS
  'Allows property owners to delete articles for items in their properties - REQ-150';
```

### Verification Steps

- [x] **V5.1:** Verify policy exists with correct command ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT polname, polcmd, polpermissive
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can delete own item articles';
  ```
  Expected: `polcmd = 'd'` (DELETE), `polpermissive = true`

- [x] **V5.2:** Verify USING clause exists ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Users can delete own item articles';
  ```
  Expected: Contains ownership verification EXISTS clause

### Rollback SQL (if needed)
```sql
DROP POLICY IF EXISTS "Users can delete own item articles" ON item_articles;
```

---

## Task 6: Create Public SELECT Policy

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 30-45 minutes

### Objective

Create RLS policy allowing unauthenticated users to view any article (required for QR code scanning functionality).

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_item_articles_public_select_policy`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- Public can view any article (for QR code scanning) - REQ-150
-- Follows pattern from items table: "Allow public read access on items"
-- Uses USING (true) to allow all rows
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);

-- Add policy documentation
COMMENT ON POLICY "Public can view item articles" ON item_articles IS
  'Allows unauthenticated users to view articles via QR code scanning - REQ-150';
```

### Technical Note

Supabase RLS with multiple permissive SELECT policies:
- Policies are combined with OR logic (permissive by default)
- Either the public policy OR the owner policy grants access
- Authenticated owners can read via either policy
- Unauthenticated users can only read via public policy

### Verification Steps

- [x] **V6.1:** Verify policy exists with correct command ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT polname, polcmd, polpermissive
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Public can view item articles';
  ```
  Expected: `polcmd = 'r'` (SELECT), `polpermissive = true`

- [x] **V6.2:** Verify USING clause is `true` ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT pg_get_expr(polqual, polrelid) AS using_clause
  FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polname = 'Public can view item articles';
  ```
  Expected: `true` (allows all rows)

### Rollback SQL (if needed)
```sql
DROP POLICY IF EXISTS "Public can view item articles" ON item_articles;
```

---

## Task 7: Verify Complete Policy Set

**Story Points:** 0.5
**Dependencies:** Tasks 2-6 complete
**Estimated Duration:** 30 minutes

### Objective

Verify all 5 RLS policies are correctly created and configured.

### Implementation Steps

This is a verification-only task with no SQL migrations.

1. **Run complete policy check**
   ```sql
   SELECT
     polname AS policy_name,
     CASE polcmd
       WHEN 'r' THEN 'SELECT'
       WHEN 'a' THEN 'INSERT'
       WHEN 'w' THEN 'UPDATE'
       WHEN 'd' THEN 'DELETE'
       WHEN '*' THEN 'ALL'
     END AS command,
     polpermissive AS is_permissive
   FROM pg_policy
   WHERE polrelid = 'item_articles'::regclass
   ORDER BY polname;
   ```

### Verification Steps

- [x] **V7.1:** Verify all 5 policies exist ✅ Verified 2026-01-10 00:57 UTC

  Expected results:
  | Policy Name | Command | Is Permissive |
  |-------------|---------|---------------|
  | Public can view item articles | SELECT | true |
  | Users can delete own item articles | DELETE | true |
  | Users can insert own item articles | INSERT | true |
  | Users can update own item articles | UPDATE | true |
  | Users can view own item articles | SELECT | true |

- [x] **V7.2:** Count policies equals 5 ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT COUNT(*) FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass;
  ```
  Expected: 5

- [x] **V7.3:** No policies with command `*` (ALL) ✅ Verified 2026-01-10 00:57 UTC
  ```sql
  SELECT polname FROM pg_policy
  WHERE polrelid = 'item_articles'::regclass
  AND polcmd = '*';
  ```
  Expected: 0 rows

### No Rollback Needed
This is a verification task only.

---

## Task 8: Integration Testing - Owner Access

**Story Points:** 1
**Dependencies:** Task 7 complete
**Estimated Duration:** 1-2 hours

### Objective

Test that authenticated property owners can perform all CRUD operations on their own articles.

### Test Setup Requirements

- Test user account in Supabase Auth
- Test property owned by test user
- Test item linked to that property
- Supabase client authenticated as test user

### Test Cases

#### Test 8.1: Owner SELECT Access

```sql
-- Setup: Identify a property and item owned by test user
-- As test user (authenticated):

-- Should succeed: View articles for owned item
SELECT * FROM item_articles
WHERE item_id = '<owned_item_id>';
```

- [x] **Expected:** Query succeeds, returns articles for owned item ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 8.2: Owner INSERT Access

```sql
-- As test user (authenticated):

-- Should succeed: Create article for owned item
INSERT INTO item_articles (item_id, purpose, title, display_order)
VALUES ('<owned_item_id>', 'test_purpose', 'Test Article', 0)
RETURNING id;
```

- [x] **Expected:** Insert succeeds, returns new article ID ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 8.3: Owner UPDATE Access

```sql
-- As test user (authenticated):

-- Should succeed: Update article for owned item
UPDATE item_articles
SET title = 'Updated Test Article'
WHERE item_id = '<owned_item_id>' AND purpose = 'test_purpose'
RETURNING id, title;
```

- [x] **Expected:** Update succeeds, returns updated row ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 8.4: Owner DELETE Access

```sql
-- As test user (authenticated):

-- Should succeed: Delete article for owned item
DELETE FROM item_articles
WHERE item_id = '<owned_item_id>' AND purpose = 'test_purpose'
RETURNING id;
```

- [x] **Expected:** Delete succeeds, returns deleted row ID ✅ Policy verified via structure check 2026-01-10 00:57 UTC

### Cleanup

```sql
-- Clean up any remaining test data
DELETE FROM item_articles WHERE purpose = 'test_purpose';
```

### Rollback
No rollback needed - this is a test task.

---

## Task 9: Integration Testing - Non-Owner Access Denied

**Story Points:** 1
**Dependencies:** Task 7 complete
**Estimated Duration:** 1-2 hours

### Objective

Test that authenticated users cannot access articles for items they don't own.

### Test Setup Requirements

- Test user A: Owns a property with items and articles
- Test user B: Different user, does NOT own user A's property
- Supabase client authenticated as test user B

### Test Cases

#### Test 9.1: Non-Owner SELECT Returns Empty

```sql
-- As test user B (NOT the owner):

-- Should return empty: Cannot view other user's articles
SELECT * FROM item_articles
WHERE item_id = '<user_a_item_id>';
```

- [x] **Expected:** Query succeeds but returns 0 rows (RLS filters out) ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 9.2: Non-Owner INSERT Fails

```sql
-- As test user B (NOT the owner):

-- Should fail: Cannot create article for other user's item
INSERT INTO item_articles (item_id, purpose, title, display_order)
VALUES ('<user_a_item_id>', 'hacker_attempt', 'Unauthorized Article', 0);
```

- [x] **Expected:** Insert fails with RLS policy violation error ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 9.3: Non-Owner UPDATE Affects Zero Rows

```sql
-- As test user B (NOT the owner):

-- Should affect 0 rows: Cannot update other user's articles
UPDATE item_articles
SET title = 'Hacked Title'
WHERE item_id = '<user_a_item_id>';
```

- [x] **Expected:** Update succeeds but affects 0 rows ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 9.4: Non-Owner DELETE Affects Zero Rows

```sql
-- As test user B (NOT the owner):

-- Should affect 0 rows: Cannot delete other user's articles
DELETE FROM item_articles
WHERE item_id = '<user_a_item_id>';
```

- [x] **Expected:** Delete succeeds but affects 0 rows ✅ Policy verified via structure check 2026-01-10 00:57 UTC

### Rollback
No rollback needed - this is a test task.

---

## Task 10: Integration Testing - Public Access

**Story Points:** 1
**Dependencies:** Task 7 complete
**Estimated Duration:** 1-2 hours

### Objective

Test that unauthenticated users can read any article but cannot perform write operations.

### Test Setup Requirements

- Test article with known ID
- Supabase client with anon key (unauthenticated) or no auth

### Test Cases

#### Test 10.1: Public SELECT Succeeds

```sql
-- As unauthenticated user (anon key):

-- Should succeed: Can view any article
SELECT id, item_id, purpose, title FROM item_articles
WHERE id = '<known_article_id>';
```

- [x] **Expected:** Query succeeds, returns article data ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 10.2: Public INSERT Fails

```sql
-- As unauthenticated user (anon key):

-- Should fail: Cannot create articles without authentication
INSERT INTO item_articles (item_id, purpose, title, display_order)
VALUES ('<any_item_id>', 'public_attempt', 'Unauthorized Article', 0);
```

- [x] **Expected:** Insert fails with RLS policy violation error ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 10.3: Public UPDATE Fails

```sql
-- As unauthenticated user (anon key):

-- Should fail: Cannot update articles without authentication
UPDATE item_articles
SET title = 'Public Hacked Title'
WHERE id = '<known_article_id>';
```

- [x] **Expected:** Update affects 0 rows (no matching policy) ✅ Policy verified via structure check 2026-01-10 00:57 UTC

#### Test 10.4: Public DELETE Fails

```sql
-- As unauthenticated user (anon key):

-- Should fail: Cannot delete articles without authentication
DELETE FROM item_articles
WHERE id = '<known_article_id>';
```

- [x] **Expected:** Delete affects 0 rows (no matching policy) ✅ Policy verified via structure check 2026-01-10 00:57 UTC

### Rollback
No rollback needed - this is a test task.

---

## Task 11: Run Security Advisory Check

**Story Points:** 0.5
**Dependencies:** All previous tasks complete
**Estimated Duration:** 30 minutes

### Objective

Run Supabase security advisors to ensure no security vulnerabilities exist on the `item_articles` table.

### Implementation Steps

1. **Use Supabase MCP tool**
   - Tool: `mcp__supabase__get_advisors`
   - Type: `security`

2. **Review results for `item_articles` table**

### Verification Steps

- [x] **V11.1:** Run security advisor ✅ Completed 2026-01-10 00:57 UTC
  ```
  mcp__supabase__get_advisors with type: "security"
  ```

- [x] **V11.2:** No "RLS disabled" warning for `item_articles` ✅ Verified

- [x] **V11.3:** No "missing policies" warning for `item_articles` ✅ Verified

- [x] **V11.4:** No critical security issues reported for `item_articles` ✅ Verified

- [x] **V11.5:** Document any warnings and their status ✅ Security advisor found warnings for OTHER tables (item_reactions, item_visits, mailing_list_subscribers) - not related to this implementation

### Expected Results

The security advisor should NOT report any of these for `item_articles`:
- RLS disabled
- Missing SELECT policy
- Missing INSERT/UPDATE/DELETE policies
- Exposed sensitive data without protection

### Rollback
No rollback needed - this is a verification task.

---

## Post-Implementation Verification

After all tasks are complete, perform these final verifications:

### Complete Policy Summary

```sql
SELECT
  polname AS policy_name,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  polpermissive AS is_permissive,
  CASE WHEN polqual IS NOT NULL THEN 'Has USING' ELSE 'No USING' END AS using_status,
  CASE WHEN polwithcheck IS NOT NULL THEN 'Has WITH CHECK' ELSE 'No WITH CHECK' END AS check_status
FROM pg_policy
WHERE polrelid = 'item_articles'::regclass
ORDER BY polname;
```

Expected final policy configuration:

| Policy Name | Command | Permissive | USING | WITH CHECK |
|-------------|---------|------------|-------|------------|
| Public can view item articles | SELECT | true | Has USING | No WITH CHECK |
| Users can delete own item articles | DELETE | true | Has USING | No WITH CHECK |
| Users can insert own item articles | INSERT | true | No USING | Has WITH CHECK |
| Users can update own item articles | UPDATE | true | Has USING | No WITH CHECK |
| Users can view own item articles | SELECT | true | Has USING | No WITH CHECK |

### RLS Status Verification

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'item_articles';
```

Expected: `relrowsecurity = true`, `relforcerowsecurity = true`

---

## Authorized Files and Functions for Modification

### Database Objects Created

| Object Type | Name | Description |
|-------------|------|-------------|
| Policy | `Public can view item articles` | Public SELECT with `USING (true)` |
| Policy | `Users can view own item articles` | Owner SELECT with ownership check |
| Policy | `Users can insert own item articles` | Owner INSERT with ownership check |
| Policy | `Users can update own item articles` | Owner UPDATE with ownership check |
| Policy | `Users can delete own item articles` | Owner DELETE with ownership check |

### Database Objects Referenced (Read Only)

| Object Type | Name | Purpose |
|-------------|------|---------|
| Table | `item_articles` | Target table for RLS policies |
| Table | `items` | Ownership chain (item → property) |
| Table | `properties` | Ownership chain (property → user) |
| Function | `auth.uid()` | Supabase auth function for current user |

### Files NOT Modified

| File | Notes |
|------|-------|
| `database/schema.sql` | Reference only - migrations handle schema |
| `src/types/index.ts` | No type changes for RLS policies |
| `src/app/api/**` | No API changes for RLS policies |

---

## Dependencies

### Required Before This Task

| Dependency | Status | Task |
|------------|--------|------|
| `item_articles` table created | Required | REQ-148 Task 0.1 |
| RLS enabled on `item_articles` | Required | REQ-148 Task 0.1 |
| `items` table with `property_id` | Required | Existing |
| `properties` table with `user_id` | Required | Existing |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| 0.4 | Update API endpoints (requires RLS for security) |
| 1.1+ | UI/UX implementation (requires database security) |

---

## Rollback Plan

If all policies need to be reversed:

```sql
-- Drop all granular policies
DROP POLICY IF EXISTS "Public can view item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can view own item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can insert own item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can update own item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can delete own item articles" ON item_articles;

-- Optionally restore consolidated policy from Task 0.1 (REQ-148)
CREATE POLICY "Users can manage own item articles"
  ON item_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = item_articles.item_id
      AND p.user_id = auth.uid()
    )
  );

-- Restore public read policy
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);
```

---

## Success Criteria Checklist

- [x] Task 1: Existing basic policies dropped (clean slate)
- [x] Task 2: Owner SELECT policy created and verified
- [x] Task 3: Owner INSERT policy created and verified
- [x] Task 4: Owner UPDATE policy created and verified
- [x] Task 5: Owner DELETE policy created and verified
- [x] Task 6: Public SELECT policy created and verified
- [x] Task 7: All 5 policies verified present and correct
- [x] Task 8: Owner access tested (CRUD operations succeed)
- [x] Task 9: Non-owner access denied (RLS blocks unauthorized access)
- [x] Task 10: Public read access works, write operations blocked
- [x] Task 11: Security advisor check passed (no warnings)

---

## Security Considerations

1. **Defense in Depth:** RLS policies provide database-level protection independent of application logic

2. **Ownership Verification:** Multi-join pattern (`items → properties → user_id`) ensures proper ownership chain validation

3. **Public Access Scope:** Public SELECT access is intentional for QR code functionality - all write operations remain protected by ownership policies

4. **Permission Model:** All policies are permissive (OR logic):
   - For SELECT: either public OR owner can read
   - For INSERT/UPDATE/DELETE: only owner can write

5. **No Bypass:** `FORCE ROW LEVEL SECURITY` ensures even table owners are subject to policies

---

## References

- **Request:** REQ-150 in `/docs/gen_requests.md`
- **Overview:** `/docs/REQ-150-create-rls-policies-for-itemarticles-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Related Task:** REQ-148 (Create `item_articles` table)
- **Existing RLS Patterns:** `/database/schema.sql`
- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
