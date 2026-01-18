# REQ-150: Create RLS Policies for `item_articles` - Implementation Breakdown

**Document Generated:** 2026-01-09 23:45 UTC
**Last Modified:** 2026-01-09 23:45 UTC
**Request Reference:** REQ-150 (Implement Row Level Security Policies for Item Articles)
**Implementation Plan Reference:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.3

---

## Overview

This document provides a detailed implementation breakdown for creating Row Level Security (RLS) policies on the `item_articles` table in Supabase. These policies enforce access control at the database level, ensuring users can only manage articles for items in their own properties while allowing public read access for QR code scanning functionality.

### Context from Implementation Plan

From the Implementation Plan (Phase 0, Task 0.3):

> **Task 0.3: Create RLS Policies for `item_articles`**
> - [ ] Create RLS policies matching existing item security

**RLS Policy Requirements from Plan:**
- Users can view articles for items in their properties (SELECT)
- Users can insert articles for their items (INSERT)
- Users can update their own item articles (UPDATE)
- Users can delete their own item articles (DELETE)
- Public can view articles for QR code access (SELECT with `USING (true)`)

### Acceptance Criteria (from REQ-150)

- [ ] Authenticated users can view articles for items in properties they own
- [ ] Authenticated users can create new articles for items in properties they own
- [ ] Authenticated users can modify existing articles for items in properties they own
- [ ] Authenticated users can remove articles for items in properties they own
- [ ] Authenticated users cannot view articles for items in properties owned by others
- [ ] Unauthenticated users can view any article regardless of ownership
- [ ] All access control is enforced at the database level through RLS policies

---

## Current State Analysis

### Existing Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| **`item_articles` Table** | ✅ Created | Database (from Task 0.1) |
| **RLS Enabled** | ✅ Enabled | `item_articles` table (from Task 0.1) |
| **Basic Policies** | ⚠️ May exist | Task 0.1 created basic policies |
| **Properties Table** | ✅ Exists | Multi-tenant property ownership |
| **Items Table** | ✅ Exists | With `property_id` foreign key |

### Existing RLS Pattern Analysis

The codebase uses a **property-based ownership model** for multi-tenant access control. From `docs/gen_techguide.md`:

```sql
-- Users can only access their own properties
CREATE POLICY "Users can manage own properties" ON properties
    FOR ALL USING (user_id = auth.uid());

-- Users can only access items in their properties
CREATE POLICY "Users can manage own property items" ON items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = items.property_id
            AND p.user_id = auth.uid()
        )
    );
```

### Database Schema Context

**Properties Table:**
```sql
properties (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_type_id UUID NOT NULL REFERENCES property_types(id),
  nickname VARCHAR(100) NOT NULL,
  ...
)
```

**Items Table:**
```sql
items (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  ...
)
```

**Item Articles Table:**
```sql
item_articles (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  ...
)
```

**Ownership Chain:** `user → properties → items → item_articles`

---

## Technical Approach

### Policy Strategy Options

**Option A: Consolidated Policy (Single `FOR ALL`)**
- Pros: Simpler, fewer policies to maintain, consistent with existing `items` table pattern
- Cons: Less granular control, all operations use same check

**Option B: Separate Policies (SELECT, INSERT, UPDATE, DELETE)**
- Pros: More granular control, follows Implementation Plan specification exactly
- Cons: More policies to maintain, potential for inconsistency

**Recommendation:** Use **Option B** (Separate Policies) to match the Implementation Plan specification exactly and provide defense-in-depth with explicit policies for each operation type.

### Public Access Consideration

The system requires two conflicting access patterns:
1. **Authenticated users:** Can only view articles for items they own
2. **Unauthenticated users:** Can view any article (for QR code scanning)

Supabase RLS handles this elegantly:
- When `auth.uid()` is NULL (unauthenticated), the owner check fails
- A separate policy with `USING (true)` allows public SELECT access
- Both policies are permissive by default (OR logic)

### Ownership Verification Query

All policies use the same ownership verification pattern:

```sql
EXISTS (
  SELECT 1 FROM items i
  JOIN properties p ON i.property_id = p.id
  WHERE i.id = item_articles.item_id
  AND p.user_id = auth.uid()
)
```

This query:
1. Joins `items` to `properties` via `property_id`
2. Checks if the item belongs to a property owned by the current user
3. Returns `true` only if the ownership chain is valid

---

## Implementation Tasks

### Task 1: Drop Existing Basic Policies (If Present)

**Objective:** Clean slate before creating granular policies.

**SQL Migration Name:** `drop_basic_item_articles_policies`

**SQL:**
```sql
-- Drop basic policies created in Task 0.1 if they exist
-- This ensures clean state for granular policy creation
DROP POLICY IF EXISTS "Public can view item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can manage own item articles" ON item_articles;
```

**Verification:**
```sql
SELECT polname FROM pg_policy WHERE polrelid = 'item_articles'::regclass;
-- Expected: No policies (or only unrelated policies)
```

---

### Task 2: Create Owner SELECT Policy

**Objective:** Allow authenticated users to view articles for items in their properties.

**SQL Migration Name:** `add_item_articles_owner_select_policy`

**SQL:**
```sql
-- Users can view articles for items in their properties
-- REQ-150: Authenticated access control
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

**Verification:**
```sql
SELECT polname, polcmd FROM pg_policy
WHERE polrelid = 'item_articles'::regclass
AND polname = 'Users can view own item articles';
-- Expected: polcmd = 'r' (SELECT)
```

---

### Task 3: Create Owner INSERT Policy

**Objective:** Allow authenticated users to create articles for items in their properties.

**SQL Migration Name:** `add_item_articles_owner_insert_policy`

**SQL:**
```sql
-- Users can insert articles for their items
-- REQ-150: Authenticated access control
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

**Verification:**
```sql
SELECT polname, polcmd FROM pg_policy
WHERE polrelid = 'item_articles'::regclass
AND polname = 'Users can insert own item articles';
-- Expected: polcmd = 'a' (INSERT)
```

---

### Task 4: Create Owner UPDATE Policy

**Objective:** Allow authenticated users to update articles for items in their properties.

**SQL Migration Name:** `add_item_articles_owner_update_policy`

**SQL:**
```sql
-- Users can update their own item articles
-- REQ-150: Authenticated access control
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

**Note:** UPDATE policies use `USING` clause, not `WITH CHECK`. The `USING` clause determines which rows can be updated.

**Verification:**
```sql
SELECT polname, polcmd FROM pg_policy
WHERE polrelid = 'item_articles'::regclass
AND polname = 'Users can update own item articles';
-- Expected: polcmd = 'w' (UPDATE)
```

---

### Task 5: Create Owner DELETE Policy

**Objective:** Allow authenticated users to delete articles for items in their properties.

**SQL Migration Name:** `add_item_articles_owner_delete_policy`

**SQL:**
```sql
-- Users can delete their own item articles
-- REQ-150: Authenticated access control
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

**Verification:**
```sql
SELECT polname, polcmd FROM pg_policy
WHERE polrelid = 'item_articles'::regclass
AND polname = 'Users can delete own item articles';
-- Expected: polcmd = 'd' (DELETE)
```

---

### Task 6: Create Public SELECT Policy

**Objective:** Allow unauthenticated users to view any article (for QR code scanning).

**SQL Migration Name:** `add_item_articles_public_select_policy`

**SQL:**
```sql
-- Public can view articles (for QR code access)
-- REQ-150: Public access for QR code scanning
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);

-- Add policy documentation
COMMENT ON POLICY "Public can view item articles" ON item_articles IS
  'Allows unauthenticated users to view articles via QR code scanning - REQ-150';
```

**Verification:**
```sql
SELECT polname, polcmd, polpermissive FROM pg_policy
WHERE polrelid = 'item_articles'::regclass
AND polname = 'Public can view item articles';
-- Expected: polcmd = 'r' (SELECT), polpermissive = true
```

---

### Task 7: Verify Complete Policy Set

**Objective:** Ensure all 5 policies are correctly created.

**Verification SQL:**
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

**Expected Results:**

| Policy Name | Command | Is Permissive |
|-------------|---------|---------------|
| Public can view item articles | SELECT | true |
| Users can delete own item articles | DELETE | true |
| Users can insert own item articles | INSERT | true |
| Users can update own item articles | UPDATE | true |
| Users can view own item articles | SELECT | true |

---

## Alternative Implementation: Consolidated Migration

If preferred, all policies can be created in a single migration:

**SQL Migration Name:** `create_item_articles_rls_policies`

```sql
-- REQ-150: Create RLS policies for item_articles table
-- Following property-based ownership model from Implementation Plan

-- Drop existing basic policies if present
DROP POLICY IF EXISTS "Public can view item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can manage own item articles" ON item_articles;

-- Users can view articles for items in their properties
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

-- Users can insert articles for their items
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

-- Users can update their own item articles
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

-- Users can delete their own item articles
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

-- Public can view articles (for QR code access)
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);
```

---

## Testing Strategy

### Unit Tests

1. **Policy Existence Test:**
   - Verify all 5 policies exist
   - Verify correct command types (SELECT, INSERT, UPDATE, DELETE)
   - Verify all policies are permissive

2. **Policy Definition Test:**
   - Verify USING clauses contain correct ownership check
   - Verify WITH CHECK clauses for INSERT policy

### Integration Tests

#### Test 1: Authenticated User - Own Items

**Setup:**
- Create test user
- Create property owned by test user
- Create item in that property
- Create article for that item

**Tests:**
```sql
-- As test user, should succeed:
SELECT * FROM item_articles WHERE item_id = '<test_item_id>';
INSERT INTO item_articles (item_id, purpose, title) VALUES ('<test_item_id>', 'test', 'Test');
UPDATE item_articles SET title = 'Updated' WHERE item_id = '<test_item_id>';
DELETE FROM item_articles WHERE item_id = '<test_item_id>';
```

#### Test 2: Authenticated User - Other User's Items

**Setup:**
- Create test user A with property and item
- Create test user B (different user)
- Create article for user A's item

**Tests:**
```sql
-- As user B, should fail with RLS violation:
SELECT * FROM item_articles WHERE item_id = '<user_a_item_id>';  -- Returns empty
INSERT INTO item_articles (item_id, purpose, title) VALUES ('<user_a_item_id>', 'test', 'Test');  -- Fails
UPDATE item_articles SET title = 'Hacked' WHERE item_id = '<user_a_item_id>';  -- No rows affected
DELETE FROM item_articles WHERE item_id = '<user_a_item_id>';  -- No rows affected
```

#### Test 3: Unauthenticated User - Public Access

**Setup:**
- Create article with known ID

**Tests:**
```sql
-- As unauthenticated (service role or anon key):
SELECT * FROM item_articles WHERE id = '<test_article_id>';  -- Should succeed
INSERT INTO item_articles (...) VALUES (...);  -- Should fail (no public INSERT)
UPDATE item_articles SET title = 'Hacked' WHERE id = '<test_article_id>';  -- Should fail
DELETE FROM item_articles WHERE id = '<test_article_id>';  -- Should fail
```

---

## Authorized Files and Functions for Modification

### Database Objects Modified

| Object Type | Name | Modification |
|-------------|------|--------------|
| Policy | `Public can view item articles` | CREATE (SELECT with `USING (true)`) |
| Policy | `Users can view own item articles` | CREATE (SELECT with ownership check) |
| Policy | `Users can insert own item articles` | CREATE (INSERT with ownership check) |
| Policy | `Users can update own item articles` | CREATE (UPDATE with ownership check) |
| Policy | `Users can delete own item articles` | CREATE (DELETE with ownership check) |

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
| `src/types/index.ts` | No type changes for RLS |
| `src/app/api/**` | No API changes for RLS |

---

## Dependencies

### Required Before This Task

| Dependency | Status | Task |
|------------|--------|------|
| `item_articles` table created | Required | Task 0.1 |
| RLS enabled on `item_articles` | Required | Task 0.1 |
| `items` table with `property_id` | Required | Existing |
| `properties` table with `user_id` | Required | Existing |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| 0.4 | Update API endpoints (requires RLS for security) |
| 1.1+ | UI/UX implementation (requires database security) |

---

## Rollback Plan

If policies need to be reversed:

```sql
-- Drop all granular policies
DROP POLICY IF EXISTS "Public can view item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can view own item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can insert own item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can update own item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can delete own item articles" ON item_articles;

-- Optionally restore basic policy from Task 0.1
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

## Success Criteria

- [ ] All 5 RLS policies created successfully
- [ ] Authenticated users can only access articles for items they own
- [ ] Authenticated users cannot access articles for other users' items
- [ ] Unauthenticated users can read any article (QR code access)
- [ ] Unauthenticated users cannot create/update/delete articles
- [ ] No security advisor warnings for `item_articles` table
- [ ] Integration tests pass for all access scenarios

---

## Security Considerations

1. **Defense in Depth:** RLS policies provide database-level protection independent of application logic
2. **Ownership Verification:** Multi-join pattern ensures proper ownership chain validation
3. **Public Access Scope:** Public SELECT access is intentional for QR code functionality - write operations remain protected
4. **Permission Model:** All policies are permissive (OR logic) - either public OR owner can read

---

## References

- **Request:** REQ-150 in `/docs/gen_requests.md`
- **Overview:** `/docs/REQ-148-create-itemarticles-table-overview.md` (related table creation)
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Existing RLS Patterns:** `/docs/gen_techguide.md` (multi-tenant RLS examples)
- **Database Schema:** `/database/schema.sql`
