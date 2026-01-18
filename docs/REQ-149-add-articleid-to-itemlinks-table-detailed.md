# REQ-149: Add `article_id` to `item_links` Table - Detailed Task Breakdown

**Document Generated:** 2026-01-10 00:15 UTC
**Last Modified:** 2026-01-10 02:45 UTC
**Implementation Status:** ✅ COMPLETE
**Request Reference:** REQ-149 (Link Items to Articles for Relationship Mapping)
**Overview Document:** [REQ-149-add-articleid-to-itemlinks-table-overview.md](/docs/REQ-149-add-articleid-to-itemlinks-table-overview.md)
**Implementation Plan:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.2

---

## Executive Summary

This document provides actionable, granular tasks for adding the `article_id` column to the existing `item_links` table in Supabase. This column establishes a foreign key relationship between item links (media content) and articles, enabling content to be grouped by purpose/topic. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

### Acceptance Criteria Summary (from REQ-149)

- [x] Items can be linked to articles through a database relationship
- [x] Links to articles are automatically removed when the article is deleted
- [x] Existing item links continue to function without disruption
- [x] The system can efficiently find all articles linked to a specific item
- [x] The relationship respects database constraints and referential integrity
- [x] NULL values are supported for links that do not reference articles

### Data Model Change

```
CURRENT:                              NEW:
Item (Fridge)                         Item (Fridge) - physical object
└── item_links (flat list)            └── Articles (grouped by purpose)
    ├── video.mp4                         ├── Article: "How to Clean - Fridge"
    ├── manual.pdf                        │   ├── media: video.mp4 (article_id → article)
    └── guide.mp4                         │   └── media: manual.pdf (article_id → article)
                                          └── Article: "Troubleshooting - Fridge"
                                              └── media: guide.mp4 (article_id → article)
```

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] Access to Supabase project with MCP tools enabled
- [x] `item_links` table exists in database (target table for modification)
- [x] `item_articles` table exists in database (REQ-148 must be complete - foreign key target)
- [x] Understanding of existing `item_links` schema from `database/schema.sql`
- [x] Existing RLS policies on `item_links` will automatically apply to new column

### Dependency Verification

```sql
-- Verify item_links table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'item_links';
-- Expected: 1 row

-- Verify item_articles table exists (REQ-148 prerequisite)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'item_articles';
-- Expected: 1 row
```

---

## Task 1: Add `article_id` Column to `item_links` Table

**Story Points:** 1
**Dependencies:** REQ-148 complete (item_articles table must exist)
**Estimated Duration:** 1-2 hours

### Objective

Add the nullable `article_id` column with foreign key constraint to the `item_articles` table, enabling links to be grouped under articles.

### Implementation Steps

1. **Verify prerequisite table exists**
   - Use `mcp__supabase__execute_sql` to confirm `item_articles` table exists
   - If not, complete REQ-148 first

2. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_article_id_to_item_links`
   - Tool: `mcp__supabase__apply_migration`

3. **SQL to Execute:**
```sql
-- Add article_id column to item_links for article grouping - REQ-149
-- Column is nullable for backwards compatibility with existing links
-- Existing links will have article_id = NULL and continue to function normally
ALTER TABLE item_links
  ADD COLUMN article_id UUID REFERENCES item_articles(id) ON DELETE CASCADE;

-- Add column documentation
COMMENT ON COLUMN item_links.article_id IS 'Optional reference to parent article for content grouping by purpose - REQ-149. NULL for legacy links created before article system.';
```

### Verification Steps

- [ ] **V1.1:** Verify column exists
  ```sql
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'item_links' AND column_name = 'article_id';
  ```
  Expected:
  | column_name | data_type | is_nullable |
  |-------------|-----------|-------------|
  | article_id | uuid | YES |

- [ ] **V1.2:** Verify foreign key constraint exists
  ```sql
  SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column,
    rc.delete_rule
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON rc.unique_constraint_name = ccu.constraint_name
  WHERE tc.table_name = 'item_links'
    AND kcu.column_name = 'article_id'
    AND tc.constraint_type = 'FOREIGN KEY';
  ```
  Expected: Foreign key on `article_id` referencing `item_articles(id)` with `CASCADE` delete rule

- [ ] **V1.3:** Verify existing links are unaffected
  ```sql
  -- Count existing links (should be > 0 if data exists)
  SELECT COUNT(*) as total_links,
         COUNT(article_id) as links_with_article
  FROM item_links;
  ```
  Expected: `total_links` unchanged, `links_with_article` = 0 (all existing links have NULL article_id)

- [ ] **V1.4:** Verify column allows NULL
  ```sql
  INSERT INTO item_links (item_id, title, link_type, url, article_id)
  SELECT id, 'Test NULL Link', 'text', 'http://test.com', NULL
  FROM items LIMIT 1
  RETURNING id;
  -- Then delete the test link
  ```
  Expected: Insert succeeds with NULL article_id

### Rollback SQL (if needed)
```sql
-- Drop column (this will also drop the foreign key constraint)
ALTER TABLE item_links DROP COLUMN IF EXISTS article_id;
```

---

## Task 2: Create Performance Index on `article_id`

**Story Points:** 0.5
**Dependencies:** Task 1 (column must exist)
**Estimated Duration:** 30 minutes

### Objective

Add index on `article_id` for efficient lookup of links by article, optimizing queries that filter or join by article.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `add_item_links_article_index`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- Create index for faster article-based lookups - REQ-149
-- Optimizes: SELECT * FROM item_links WHERE article_id = ?
-- Optimizes: JOIN item_articles ON item_links.article_id = item_articles.id
CREATE INDEX idx_item_links_article_id ON item_links(article_id);

-- Add index documentation
COMMENT ON INDEX idx_item_links_article_id IS 'Optimizes queries filtering/joining by article_id - REQ-149';
```

### Verification Steps

- [ ] **V2.1:** Verify index exists
  ```sql
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE tablename = 'item_links' AND indexname = 'idx_item_links_article_id';
  ```
  Expected: Index `idx_item_links_article_id` present with definition on `article_id` column

- [ ] **V2.2:** Verify index is used in query plan
  ```sql
  EXPLAIN (ANALYZE, COSTS OFF)
  SELECT * FROM item_links WHERE article_id = '00000000-0000-0000-0000-000000000000';
  ```
  Expected: Query plan mentions `idx_item_links_article_id` for index scan (if data volume warrants it)

- [ ] **V2.3:** Verify all item_links indexes are present
  ```sql
  SELECT indexname
  FROM pg_indexes
  WHERE tablename = 'item_links'
  ORDER BY indexname;
  ```
  Expected indexes:
  - `idx_item_links_article_id` (new)
  - `idx_item_links_item_id` (existing)
  - `idx_item_links_order` (existing)
  - Primary key index

### Rollback SQL (if needed)
```sql
DROP INDEX IF EXISTS idx_item_links_article_id;
```

---

## Task 3: Verify Foreign Key Constraint with Valid Article Reference

**Story Points:** 0.5
**Dependencies:** Task 1 complete, item_articles table has data
**Estimated Duration:** 30 minutes

### Objective

Verify that links can be successfully associated with articles and that the foreign key constraint properly validates article references.

### Implementation Steps

1. **Test valid article reference insertion**
```sql
-- Step 1: Get an existing item ID
SELECT id, name FROM items LIMIT 1;
-- Note the item_id: <item_id>

-- Step 2: Create a test article for that item
INSERT INTO item_articles (item_id, purpose, title, display_order)
VALUES ('<item_id>', 'test_fk', 'FK Test Article', 0)
RETURNING id;
-- Note the article_id: <article_id>

-- Step 3: Create a link with the article reference
INSERT INTO item_links (item_id, title, link_type, url, article_id)
VALUES ('<item_id>', 'Link With Article', 'text', 'http://test.com', '<article_id>')
RETURNING id;
-- Expected: Insert succeeds

-- Step 4: Verify link is associated
SELECT il.id, il.title, il.article_id, ia.title as article_title
FROM item_links il
JOIN item_articles ia ON il.article_id = ia.id
WHERE il.article_id = '<article_id>';
-- Expected: Returns the link with article info
```

2. **Test invalid article reference fails**
```sql
-- Attempt to insert link with non-existent article_id
INSERT INTO item_links (item_id, title, link_type, url, article_id)
SELECT id, 'Invalid Article Link', 'text', 'http://test.com',
       '00000000-0000-0000-0000-000000000000'
FROM items LIMIT 1;
-- Expected: FAILS with foreign key violation error
```

### Verification Steps

- [ ] **V3.1:** Insert link with valid article_id succeeds
- [ ] **V3.2:** Link correctly joins to article in query
- [ ] **V3.3:** Insert link with invalid article_id fails
- [ ] **V3.4:** Error message mentions foreign key constraint violation
- [ ] **V3.5:** Clean up test data after verification

### Test Data Cleanup
```sql
-- Clean up test links and articles
DELETE FROM item_links WHERE title IN ('Link With Article', 'Test NULL Link');
DELETE FROM item_articles WHERE purpose = 'test_fk';
```

---

## Task 4: Verify Cascade Delete Behavior

**Story Points:** 0.5
**Dependencies:** Task 3 complete
**Estimated Duration:** 30 minutes

### Objective

Confirm that deleting an article automatically removes its associated links (ON DELETE CASCADE behavior).

### Implementation Steps

1. **Create test data hierarchy**
```sql
-- Step 1: Get an existing item ID
SELECT id, name FROM items LIMIT 1;
-- Note the item_id: <item_id>

-- Step 2: Create a test article
INSERT INTO item_articles (item_id, purpose, title, display_order)
VALUES ('<item_id>', 'cascade_test', 'Cascade Delete Test Article', 0)
RETURNING id;
-- Note the article_id: <article_id>

-- Step 3: Create multiple links associated with this article
INSERT INTO item_links (item_id, title, link_type, url, article_id)
VALUES
  ('<item_id>', 'Cascade Link 1', 'text', 'http://test1.com', '<article_id>'),
  ('<item_id>', 'Cascade Link 2', 'pdf', 'http://test2.com', '<article_id>'),
  ('<item_id>', 'Cascade Link 3', 'image', 'http://test3.com', '<article_id>');

-- Step 4: Verify links exist
SELECT COUNT(*) as link_count FROM item_links WHERE article_id = '<article_id>';
-- Expected: 3 links
```

2. **Test cascade delete**
```sql
-- Step 5: Delete the article
DELETE FROM item_articles WHERE id = '<article_id>';

-- Step 6: Verify links are automatically deleted
SELECT COUNT(*) as link_count FROM item_links WHERE article_id = '<article_id>';
-- Expected: 0 links (cascade delete worked)
```

3. **Verify links without article_id are unaffected**
```sql
-- Step 7: Create a link without article_id
INSERT INTO item_links (item_id, title, link_type, url, article_id)
SELECT id, 'Standalone Link', 'text', 'http://standalone.com', NULL
FROM items LIMIT 1
RETURNING id;
-- Note the link_id: <link_id>

-- Step 8: Verify standalone link exists
SELECT id, title, article_id FROM item_links WHERE id = '<link_id>';
-- Expected: Link exists with article_id = NULL

-- Step 9: Delete any article (should not affect standalone link)
DELETE FROM item_articles WHERE purpose = 'cascade_test';

-- Step 10: Verify standalone link still exists
SELECT id, title, article_id FROM item_links WHERE id = '<link_id>';
-- Expected: Link still exists
```

### Verification Steps

- [ ] **V4.1:** Create article with multiple associated links
- [ ] **V4.2:** Verify all links have correct article_id
- [ ] **V4.3:** Delete the article
- [ ] **V4.4:** Verify all associated links are automatically deleted
- [ ] **V4.5:** Verify links with NULL article_id are unaffected by article deletions
- [ ] **V4.6:** No orphaned links remain with invalid article_id references

### Test Data Cleanup
```sql
-- Clean up any remaining test data
DELETE FROM item_links WHERE title LIKE 'Cascade Link%' OR title = 'Standalone Link';
DELETE FROM item_articles WHERE purpose = 'cascade_test';
```

---

## Task 5: Verify Backwards Compatibility with Existing Queries

**Story Points:** 0.5
**Dependencies:** Tasks 1-4 complete
**Estimated Duration:** 30 minutes

### Objective

Confirm that existing queries and API endpoints continue to work correctly with the new column.

### Implementation Steps

1. **Test existing query patterns still work**
```sql
-- Query 1: Get all links for an item (existing pattern)
SELECT * FROM item_links WHERE item_id = (SELECT id FROM items LIMIT 1);
-- Expected: Returns links, article_id column included but may be NULL

-- Query 2: Get links ordered by display_order (existing pattern)
SELECT * FROM item_links
WHERE item_id = (SELECT id FROM items LIMIT 1)
ORDER BY display_order;
-- Expected: Works as before

-- Query 3: Count links per item (existing pattern)
SELECT item_id, COUNT(*) as link_count
FROM item_links
GROUP BY item_id;
-- Expected: Works as before
```

2. **Test new query patterns work**
```sql
-- Query 4: Get links grouped by article
SELECT
  ia.title as article_title,
  ia.purpose,
  il.title as link_title,
  il.link_type
FROM item_links il
LEFT JOIN item_articles ia ON il.article_id = ia.id
WHERE il.item_id = (SELECT id FROM items LIMIT 1);
-- Expected: Returns links with article info (or NULL for unassociated links)

-- Query 5: Get links for a specific article
SELECT * FROM item_links WHERE article_id = '<article_id>';
-- Expected: Returns only links associated with that article

-- Query 6: Get links without any article
SELECT * FROM item_links WHERE article_id IS NULL;
-- Expected: Returns all legacy/standalone links
```

### Verification Steps

- [ ] **V5.1:** Existing SELECT queries work without modification
- [ ] **V5.2:** New column is included in SELECT * results
- [ ] **V5.3:** ORDER BY display_order still works
- [ ] **V5.4:** Aggregate functions (COUNT, etc.) still work
- [ ] **V5.5:** LEFT JOIN to item_articles works for both associated and standalone links
- [ ] **V5.6:** Filtering by article_id works correctly
- [ ] **V5.7:** Filtering by NULL article_id returns standalone links

---

## Task 6: Verify RLS Policies Apply to New Column

**Story Points:** 0.5
**Dependencies:** Tasks 1-4 complete
**Estimated Duration:** 30 minutes

### Objective

Confirm that existing Row Level Security policies on `item_links` automatically apply to operations involving the new `article_id` column.

### Implementation Steps

1. **Review existing RLS policies**
```sql
-- List existing policies on item_links
SELECT polname, polcmd, polpermissive
FROM pg_policy
WHERE polrelid = 'item_links'::regclass
ORDER BY polname;
```
Expected policies:
- `Allow public read access on item_links` (SELECT)
- `Allow admin users to manage item_links` (ALL)

2. **Test public read access includes article_id**
```sql
-- As unauthenticated user (using anon key):
-- Query should include article_id column
SELECT id, title, article_id FROM item_links LIMIT 5;
-- Expected: Query succeeds, article_id column visible
```

3. **Test admin write access works with article_id**
```sql
-- As authenticated admin user:
-- Insert with article_id should succeed
INSERT INTO item_links (item_id, title, link_type, url, article_id)
VALUES ('<item_id>', 'RLS Test Link', 'text', 'http://test.com', '<article_id>')
RETURNING id;
-- Expected: Insert succeeds

-- Update article_id should succeed
UPDATE item_links
SET article_id = '<new_article_id>'
WHERE id = '<link_id>';
-- Expected: Update succeeds
```

### Verification Steps

- [ ] **V6.1:** Existing RLS policies are listed and active
- [ ] **V6.2:** Public read access includes article_id column
- [ ] **V6.3:** Admin can INSERT links with article_id
- [ ] **V6.4:** Admin can UPDATE article_id on existing links
- [ ] **V6.5:** Non-admin cannot INSERT/UPDATE (existing behavior unchanged)
- [ ] **V6.6:** No new RLS policies required for this column

### Test Data Cleanup
```sql
DELETE FROM item_links WHERE title = 'RLS Test Link';
```

---

## Task 7: Run Security Advisory Check

**Story Points:** 0.5
**Dependencies:** All previous tasks complete
**Estimated Duration:** 30 minutes

### Objective

Run Supabase security advisors to ensure no security vulnerabilities were introduced by the schema change.

### Implementation Steps

1. **Use Supabase MCP tool**
   - Tool: `mcp__supabase__get_advisors`
   - Type: `security`

2. **Check for issues related to `item_links`**
   - Review any warnings about the table
   - Verify no new vulnerabilities introduced

### Verification Steps

- [ ] **V7.1:** Run security advisor
- [ ] **V7.2:** No critical security issues on `item_links` table
- [ ] **V7.3:** RLS is still properly enabled
- [ ] **V7.4:** Document any warnings and remediation status

### Expected Results

The security advisor should NOT report:
- "RLS disabled" for `item_links`
- Missing policies on `item_links`
- Exposed sensitive data through new column
- Foreign key vulnerabilities

---

## Task 8: Update database/schema.sql Documentation

**Story Points:** 0.5
**Dependencies:** All migrations successful
**Estimated Duration:** 30 minutes

### Objective

Update the `database/schema.sql` file to reflect the new column for documentation purposes.

### Implementation Steps

1. **Read current schema.sql**
   - File: `database/schema.sql`
   - Locate `item_links` table definition

2. **Update table definition (documentation only)**
   Add the `article_id` column to the schema documentation:

```sql
-- Links table
CREATE TABLE item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  link_type VARCHAR(50) NOT NULL CHECK (link_type IN ('youtube', 'pdf', 'image', 'text')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  article_id UUID REFERENCES item_articles(id) ON DELETE CASCADE, -- REQ-149: Optional article grouping
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **Add index documentation**
```sql
-- Indexes for performance
CREATE INDEX idx_items_public_id ON items(public_id);
CREATE INDEX idx_item_links_item_id ON item_links(item_id);
CREATE INDEX idx_item_links_order ON item_links(item_id, display_order);
CREATE INDEX idx_item_links_article_id ON item_links(article_id); -- REQ-149: Article lookup
```

### Verification Steps

- [ ] **V8.1:** schema.sql updated with article_id column
- [ ] **V8.2:** Column comment includes REQ-149 reference
- [ ] **V8.3:** Index documentation added
- [ ] **V8.4:** File compiles without syntax errors (can be verified by reading)

### Note

The `database/schema.sql` file is for documentation/reference only. The actual schema changes are managed through Supabase migrations.

---

## Post-Implementation Verification

After all tasks are complete, perform these final verifications:

### Database Structure Verification

```sql
-- Complete column information for item_links
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'item_links'
ORDER BY ordinal_position;
```

Expected columns:
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| id | uuid | NO | gen_random_uuid() |
| item_id | uuid | YES | NULL |
| title | character varying | NO | NULL |
| link_type | character varying | NO | NULL |
| url | text | NO | NULL |
| thumbnail_url | text | YES | NULL |
| display_order | integer | YES | 0 |
| article_id | uuid | YES | NULL |
| created_at | timestamp with time zone | YES | now() |

### Foreign Key Verification

```sql
-- All foreign keys on item_links
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.table_name = 'item_links'
  AND tc.constraint_type = 'FOREIGN KEY';
```

Expected foreign keys:
| column_name | foreign_table | delete_rule |
|-------------|---------------|-------------|
| item_id | items | CASCADE |
| article_id | item_articles | CASCADE |

### Index Verification

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'item_links'
ORDER BY indexname;
```

Expected indexes:
- `idx_item_links_article_id` (on article_id)
- `idx_item_links_item_id` (on item_id)
- `idx_item_links_order` (on item_id, display_order)
- Primary key index (on id)

### Integration Test Summary

1. **Existing Links:**
   - [ ] All existing links have `article_id = NULL`
   - [ ] Existing queries return correct results
   - [ ] No data loss occurred

2. **New Functionality:**
   - [ ] Can create links with article_id
   - [ ] Can create links without article_id (NULL)
   - [ ] Cascade delete from article works
   - [ ] Foreign key constraint validates article_id

3. **RLS Policies:**
   - [ ] Public can read links (including article_id)
   - [ ] Admin can manage links with article_id
   - [ ] No unauthorized access possible

---

## Authorized Files and Functions for Modification

### Database Objects Created/Modified

| Object Type | Name | Description |
|-------------|------|-------------|
| Column | `item_links.article_id` | New UUID column referencing item_articles |
| Foreign Key | `item_links_article_id_fkey` | FK to item_articles(id) ON DELETE CASCADE |
| Index | `idx_item_links_article_id` | Performance index on article_id |

### Local Files for Documentation Update

| File | Modification | Purpose |
|------|--------------|---------|
| `database/schema.sql` | Add article_id column definition | Documentation only |

### Files to Update in Subsequent Tasks

These files will be modified in Phase 0 Tasks 0.4 and 0.5:

| File | Modification | Task |
|------|--------------|------|
| `src/types/index.ts` | Add `article_id?: string` to `ItemLink` interface | 0.5 |
| `src/app/api/admin/items/route.ts` | Include article reference in link responses | 0.4 |
| `src/app/api/items/[publicId]/route.ts` | Include article grouping in public response | 0.4 |

---

## Dependencies on This Task

The following tasks depend on successful completion of Task 0.2:

| Task | Description | Dependency Type |
|------|-------------|-----------------|
| 0.3 | Create detailed RLS policies (if article-based policies needed) | Soft |
| 0.4 | Update API endpoints to return article-grouped links | Hard |
| 0.5 | Update TypeScript types with `article_id` field | Hard |
| 0.6 | Data migration for existing links (optional) | Soft |

---

## Rollback Plan

If complete rollback is needed:

```sql
-- Step 1: Drop index
DROP INDEX IF EXISTS idx_item_links_article_id;

-- Step 2: Drop column (this will also drop the foreign key constraint)
ALTER TABLE item_links DROP COLUMN IF EXISTS article_id;
```

**Warning:** Rollback will lose any `article_id` data that has been set on existing links. Only perform rollback before production data migration.

---

## Success Criteria Checklist

- [x] `article_id` column added to `item_links` table (UUID type)
- [x] Column is nullable (backwards compatible - all existing links unaffected)
- [x] Foreign key constraint to `item_articles(id)` is active
- [x] ON DELETE CASCADE configured correctly (article deletion removes links)
- [x] Performance index `idx_item_links_article_id` created
- [x] Existing `item_links` data is unaffected (all have NULL article_id)
- [x] Cascade delete verified (article deletion removes associated links)
- [x] Links with NULL article_id unaffected by article deletions
- [x] Existing RLS policies apply to new column
- [x] Security advisory check passed
- [x] No errors in Supabase logs after migration
- [x] `database/schema.sql` documentation updated

---

## References

- **Request:** REQ-149 in `/docs/gen_requests.md`
- **Overview:** `/docs/REQ-149-add-articleid-to-itemlinks-table-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Prerequisite Task:** `/docs/REQ-148-create-itemarticles-table-detailed.md`
- **Existing Schema:** `/database/schema.sql`
- **Existing Types:** `/src/types/index.ts`
- **ItemLink Interface:** `/src/types/index.ts:79-88`
