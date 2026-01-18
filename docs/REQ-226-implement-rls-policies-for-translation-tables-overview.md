# REQ-226: Implement RLS Policies for Translation Tables - Implementation Overview

**Generated:** 2026-01-17 12:00:00 UTC
**Last Modified:** 2026-01-17 12:00:00 UTC
**Request Reference:** REQ-226 - Translation Table Access Control Policies
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.4)
**Status:** Ready for Implementation

---

## 1. Request Summary

Implement Row Level Security (RLS) policies for all translation tables created in Task 1.1. These policies must ensure:

1. **Read Access:** Users can only view translations for content they have permission to view
2. **Write Access:** Users can only create/modify translations for content they own
3. **Service Role Access:** Full unrestricted access for background translation jobs
4. **Public Access:** Unauthenticated users can view translations for publicly accessible content (QR code scanning)

### Translation Tables Requiring RLS

| Table | Source Entity | Ownership Chain |
|-------|---------------|-----------------|
| `article_translations` | `item_articles` | article → item → property → user |
| `item_translations` | `items` | item → property → user |
| `link_translations` | `item_links` | link → (article →) item → property → user |
| `tag_translations` | (none - system/global) | System tags: public; User tags: future scope |
| `translation_jobs` | (metadata) | Service role only for processing |

---

## 2. Current State Analysis

### Existing RLS Patterns in Project

Based on `/database/schema.sql` and `/docs/REQ-150-create-rls-policies-for-itemarticles-detailed.md`:

| Pattern | Example | Usage |
|---------|---------|-------|
| Public SELECT | `USING (true)` | Allow anonymous read for QR scanning |
| Owner Verification | `EXISTS (SELECT 1 FROM items i JOIN properties p ...)` | Multi-join ownership chain |
| Granular Policies | Separate SELECT, INSERT, UPDATE, DELETE | Fine-grained access control |
| Admin Override | `EXISTS (SELECT 1 FROM admin_users WHERE ...)` | Admin full access |
| Service Role Bypass | `auth.role() = 'service_role'` | Background job access |

### Ownership Chain Reference

```
user → properties (user_id) → items (property_id) → item_articles (item_id) → article_translations (article_id)
                                                   └→ item_links (item_id) → link_translations (link_id)
                                                   └→ item_translations (item_id)
```

### Existing Policy Examples

From `item_articles` table (REQ-150):

```sql
-- Public SELECT
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);

-- Owner SELECT (for authenticated users viewing own content)
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

-- Owner INSERT
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
```

---

## 3. Technical Approach

### Policy Strategy

We will implement a **layered policy approach** for each translation table:

| Policy Type | Command | Condition | Purpose |
|-------------|---------|-----------|---------|
| Public Read | SELECT | `USING (true)` | QR code scanning (guests) |
| Owner Read | SELECT | Ownership chain check | Authenticated users view own translations |
| Owner Insert | INSERT | Ownership chain check | Content owners create translations |
| Owner Update | UPDATE | Ownership chain check | Content owners modify translations |
| Owner Delete | DELETE | Ownership chain check | Content owners remove translations |
| Service Role All | ALL | `auth.role() = 'service_role'` | Background jobs unrestricted |

### Service Role Handling

The **service role** (`supabase_service_role`) bypasses RLS by default when using the service key. However, for explicitness and defense-in-depth, we will add service role policies that explicitly grant access.

> **Note:** When `FORCE ROW LEVEL SECURITY` is enabled (which it is in this project), even table owners must satisfy RLS policies. Service role policies ensure background jobs work correctly.

### Translation Job Table Strategy

The `translation_jobs` table is **metadata only** and should have restricted access:
- **Service Role:** Full read/write for job processing
- **Authenticated Users:** Read-only for their own content's jobs (optional, for status tracking)
- **Public:** No access

---

## 4. Policy Definitions

### 4.1 article_translations Policies

#### Enable RLS
```sql
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations FORCE ROW LEVEL SECURITY;
```

#### Policies
```sql
-- Service role: Full access for background translation jobs
CREATE POLICY "Service role has full access to article_translations"
  ON article_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Public: Read any article translation (for QR code scanning)
CREATE POLICY "Public can view article translations"
  ON article_translations FOR SELECT
  USING (true);

-- Owner: Read translations for articles in owned items
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

-- Owner: Insert translations for articles in owned items
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

-- Owner: Update translations for articles in owned items
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

-- Owner: Delete translations for articles in owned items
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
```

### 4.2 item_translations Policies

#### Enable RLS
```sql
ALTER TABLE item_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_translations FORCE ROW LEVEL SECURITY;
```

#### Policies
```sql
-- Service role: Full access for background translation jobs
CREATE POLICY "Service role has full access to item_translations"
  ON item_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Public: Read any item translation (for QR code scanning)
CREATE POLICY "Public can view item translations"
  ON item_translations FOR SELECT
  USING (true);

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
```

### 4.3 link_translations Policies

#### Enable RLS
```sql
ALTER TABLE link_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_translations FORCE ROW LEVEL SECURITY;
```

#### Policies
```sql
-- Service role: Full access for background translation jobs
CREATE POLICY "Service role has full access to link_translations"
  ON link_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Public: Read any link translation (for QR code scanning)
CREATE POLICY "Public can view link translations"
  ON link_translations FOR SELECT
  USING (true);

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
```

### 4.4 tag_translations Policies

Tag translations are primarily system-level (predefined room/category tags) with potential for future user-created tags. For Phase 1, we implement:

#### Enable RLS
```sql
ALTER TABLE tag_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_translations FORCE ROW LEVEL SECURITY;
```

#### Policies
```sql
-- Service role: Full access for seeding and updates
CREATE POLICY "Service role has full access to tag_translations"
  ON tag_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Public: Read all tag translations (needed for displaying translated tags in UI)
CREATE POLICY "Public can view tag translations"
  ON tag_translations FOR SELECT
  USING (true);

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
```

### 4.5 translation_jobs Policies

Translation jobs are internal system metadata for background processing:

#### Enable RLS
```sql
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_jobs FORCE ROW LEVEL SECURITY;
```

#### Policies
```sql
-- Service role: Full access for job processing (primary access method)
CREATE POLICY "Service role has full access to translation_jobs"
  ON translation_jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

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

-- Authenticated Users: View job status for their own content (optional, for transparency)
-- This allows users to see the status of translation jobs for their content
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
```

---

## 5. Implementation Tasks

### Task 1.4.1: Create RLS migration file

**Action:** Create new migration file
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Create migration file with header comments
- [ ] Document purpose and reference to REQ-226

### Task 1.4.2: Enable RLS on all translation tables

**Action:** Add ALTER TABLE statements
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] `ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE article_translations FORCE ROW LEVEL SECURITY;`
- [ ] Repeat for item_translations, link_translations, tag_translations, translation_jobs

### Task 1.4.3: Create article_translations policies

**Action:** Add CREATE POLICY statements
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Service role full access policy
- [ ] Public SELECT policy
- [ ] Owner SELECT policy
- [ ] Owner INSERT policy
- [ ] Owner UPDATE policy
- [ ] Owner DELETE policy
- [ ] Add COMMENT ON POLICY for documentation

### Task 1.4.4: Create item_translations policies

**Action:** Add CREATE POLICY statements
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Service role full access policy
- [ ] Public SELECT policy
- [ ] Owner SELECT policy
- [ ] Owner INSERT policy
- [ ] Owner UPDATE policy
- [ ] Owner DELETE policy
- [ ] Add COMMENT ON POLICY for documentation

### Task 1.4.5: Create link_translations policies

**Action:** Add CREATE POLICY statements
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Service role full access policy
- [ ] Public SELECT policy
- [ ] Owner SELECT policy
- [ ] Owner INSERT policy
- [ ] Owner UPDATE policy
- [ ] Owner DELETE policy
- [ ] Add COMMENT ON POLICY for documentation

### Task 1.4.6: Create tag_translations policies

**Action:** Add CREATE POLICY statements
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Service role full access policy
- [ ] Public SELECT policy
- [ ] Admin management policy
- [ ] Add COMMENT ON POLICY for documentation

### Task 1.4.7: Create translation_jobs policies

**Action:** Add CREATE POLICY statements
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Service role full access policy
- [ ] Admin SELECT policy
- [ ] User content job visibility policy
- [ ] Add COMMENT ON POLICY for documentation

### Task 1.4.8: Add policy comments and documentation

**Action:** Add COMMENT statements
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Add COMMENT ON POLICY for each policy
- [ ] Include REQ-226 reference in comments

### Task 1.4.9: Create rollback section

**Action:** Add rollback SQL in comments
**File:** `/database/migrations/20260117_l10n_rls_policies.sql`

Subtasks:
- [ ] Document DROP POLICY statements for all policies
- [ ] Document DISABLE ROW LEVEL SECURITY commands

### Task 1.4.10: Deploy and verify

**Action:** Apply migration and run verification
**Target:** Supabase (via MCP or SQL Editor)

Subtasks:
- [ ] Apply migration to database
- [ ] Verify all policies created successfully
- [ ] Run security advisor check
- [ ] Test access scenarios

---

## 6. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/database/migrations/20260117_l10n_rls_policies.sql` | RLS policies migration file |

### Database Objects to CREATE

| Object Type | Table | Name | Description |
|-------------|-------|------|-------------|
| Policy | article_translations | `Service role has full access to article_translations` | Service role bypass |
| Policy | article_translations | `Public can view article translations` | Public SELECT |
| Policy | article_translations | `Users can view own article translations` | Owner SELECT |
| Policy | article_translations | `Users can insert own article translations` | Owner INSERT |
| Policy | article_translations | `Users can update own article translations` | Owner UPDATE |
| Policy | article_translations | `Users can delete own article translations` | Owner DELETE |
| Policy | item_translations | `Service role has full access to item_translations` | Service role bypass |
| Policy | item_translations | `Public can view item translations` | Public SELECT |
| Policy | item_translations | `Users can view own item translations` | Owner SELECT |
| Policy | item_translations | `Users can insert own item translations` | Owner INSERT |
| Policy | item_translations | `Users can update own item translations` | Owner UPDATE |
| Policy | item_translations | `Users can delete own item translations` | Owner DELETE |
| Policy | link_translations | `Service role has full access to link_translations` | Service role bypass |
| Policy | link_translations | `Public can view link translations` | Public SELECT |
| Policy | link_translations | `Users can view own link translations` | Owner SELECT |
| Policy | link_translations | `Users can insert own link translations` | Owner INSERT |
| Policy | link_translations | `Users can update own link translations` | Owner UPDATE |
| Policy | link_translations | `Users can delete own link translations` | Owner DELETE |
| Policy | tag_translations | `Service role has full access to tag_translations` | Service role bypass |
| Policy | tag_translations | `Public can view tag translations` | Public SELECT |
| Policy | tag_translations | `Admin users can manage tag translations` | Admin ALL |
| Policy | translation_jobs | `Service role has full access to translation_jobs` | Service role bypass |
| Policy | translation_jobs | `Admin users can view translation jobs` | Admin SELECT |
| Policy | translation_jobs | `Users can view own content translation jobs` | User SELECT (own content) |

### Database Objects Referenced (Read Only)

| Object Type | Name | Purpose |
|-------------|------|---------|
| Table | `article_translations` | Target for RLS policies |
| Table | `item_translations` | Target for RLS policies |
| Table | `link_translations` | Target for RLS policies |
| Table | `tag_translations` | Target for RLS policies |
| Table | `translation_jobs` | Target for RLS policies |
| Table | `item_articles` | Ownership chain |
| Table | `items` | Ownership chain |
| Table | `item_links` | Ownership chain |
| Table | `properties` | Ownership chain (user_id) |
| Table | `admin_users` | Admin role verification |
| Function | `auth.uid()` | Current authenticated user |
| Function | `auth.role()` | Current role (anon, authenticated, service_role) |

### Files NOT Modified

| File | Notes |
|------|-------|
| `/database/schema.sql` | Reference only |
| `/database/migrations/20260117_l10n_foundation.sql` | Tables already created in Task 1.1 |
| `/src/lib/supabase.ts` | No type changes for RLS policies |

---

## 7. Dependencies

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

## 8. Acceptance Criteria

From REQ-226:

- [ ] Users can read translation records when they have read access to the corresponding source content
- [ ] Users can create and update translation records when they own the corresponding source content
- [ ] Service role accounts can read and write all translation records without restriction
- [ ] Users without content access permissions cannot read or write associated translation records
- [ ] Policy enforcement applies consistently across all translation tables in the system

### Additional Technical Criteria

- [ ] RLS enabled on all 5 translation tables
- [ ] FORCE ROW LEVEL SECURITY enabled on all 5 tables
- [ ] All policies created with appropriate USING and WITH CHECK clauses
- [ ] Service role policies use `auth.role() = 'service_role'`
- [ ] Owner policies use correct ownership chain (joins)
- [ ] Public SELECT policies use `USING (true)`
- [ ] Admin policies verify `admin_users` role
- [ ] Policy comments reference REQ-226

---

## 9. Testing Strategy

### Verification Queries

#### Check RLS Enabled
```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname IN (
  'article_translations',
  'item_translations',
  'link_translations',
  'tag_translations',
  'translation_jobs'
);
-- Expected: All have relrowsecurity = true, relforcerowsecurity = true
```

#### Check Policies Created
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  permissive
FROM pg_policies
WHERE tablename LIKE '%translations' OR tablename = 'translation_jobs'
ORDER BY tablename, policyname;
```

### Test Scenarios

#### Scenario 1: Public Read Access
```sql
-- As anonymous user (anon key):
SELECT * FROM item_translations LIMIT 5;
-- Expected: Returns rows (public SELECT allowed)
```

#### Scenario 2: Owner Write Access
```sql
-- As authenticated user with owned content:
INSERT INTO item_translations (item_id, language, name)
VALUES ('<owned_item_id>', 'fr', 'Test French Name');
-- Expected: Success
```

#### Scenario 3: Non-Owner Write Blocked
```sql
-- As authenticated user WITHOUT ownership:
INSERT INTO item_translations (item_id, language, name)
VALUES ('<other_user_item_id>', 'fr', 'Unauthorized');
-- Expected: Error (RLS policy violation)
```

#### Scenario 4: Service Role Access
```sql
-- As service role (using service key):
INSERT INTO item_translations (item_id, language, name)
VALUES ('<any_item_id>', 'fr', 'Service Role Insert');
-- Expected: Success (service role bypasses ownership check)
```

### Security Advisor Check
```
mcp__supabase__get_advisors with type: "security"
```
- Expected: No warnings for translation tables

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Policy blocks service role | Low | High | Explicit service_role policy ensures bypass |
| Ownership chain breaks | Low | Medium | Use same pattern as REQ-150 (proven) |
| Performance impact | Medium | Low | Policies use indexed columns |
| Missing table dependency | Low | High | Verify Task 1.1 complete before starting |
| Admin policy blocks admins | Low | Medium | Test admin access before deployment |

---

## 11. Rollback Plan

If policies need to be removed:

```sql
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

## 12. Security Considerations

1. **Defense in Depth:** RLS policies provide database-level protection independent of application logic

2. **Ownership Chain Verification:** Multi-join pattern ensures proper authorization through the entire content hierarchy

3. **Service Role Security:** Service role policies are only accessible when using the service key, which should only be used server-side

4. **Public Access Scope:** Public SELECT is intentional for QR code functionality - all write operations require authentication and ownership

5. **Permission Model:**
   - Multiple permissive policies use OR logic (any matching policy grants access)
   - SELECT: Service role OR public OR owner
   - INSERT/UPDATE/DELETE: Service role OR owner (for content tables) or admin (for tags)

6. **FORCE ROW LEVEL SECURITY:** Even table owners are subject to policies, preventing bypass

7. **Translation Job Protection:** Jobs are primarily service-role access; user visibility is read-only for their own content

---

## 13. Estimated Effort

| Task | Estimate |
|------|----------|
| Create migration file structure | 5 min |
| Enable RLS statements | 10 min |
| article_translations policies | 20 min |
| item_translations policies | 20 min |
| link_translations policies | 20 min |
| tag_translations policies | 15 min |
| translation_jobs policies | 20 min |
| Comments and documentation | 10 min |
| Rollback section | 10 min |
| Testing and verification | 30 min |
| **Total** | **~2.5 hours** |

---

## 14. Complete Migration File Structure

```sql
-- ===========================================================
-- L10N RLS Policies Migration
-- File: /database/migrations/20260117_l10n_rls_policies.sql
-- Generated: 2026-01-17
-- Purpose: Row Level Security for translation tables
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-226
-- ===========================================================

-- ============ ENABLE RLS ============
-- Enable Row Level Security on all translation tables

ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations FORCE ROW LEVEL SECURITY;

ALTER TABLE item_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_translations FORCE ROW LEVEL SECURITY;

ALTER TABLE link_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_translations FORCE ROW LEVEL SECURITY;

ALTER TABLE tag_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_translations FORCE ROW LEVEL SECURITY;

ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_jobs FORCE ROW LEVEL SECURITY;

-- ============ ARTICLE_TRANSLATIONS POLICIES ============
-- [Policy definitions...]

-- ============ ITEM_TRANSLATIONS POLICIES ============
-- [Policy definitions...]

-- ============ LINK_TRANSLATIONS POLICIES ============
-- [Policy definitions...]

-- ============ TAG_TRANSLATIONS POLICIES ============
-- [Policy definitions...]

-- ============ TRANSLATION_JOBS POLICIES ============
-- [Policy definitions...]

-- ============ POLICY COMMENTS ============
-- [COMMENT ON POLICY statements...]

-- ============ ROLLBACK (commented) ============
-- [DROP POLICY and DISABLE RLS statements...]
```

---

## References

- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-150: RLS for item_articles (pattern reference)](/docs/REQ-150-create-rls-policies-for-itemarticles-detailed.md)
- [REQ-223: Translation tables migration](/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md)
- [Existing Schema](/database/schema.sql)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/row-level-security#policies)
