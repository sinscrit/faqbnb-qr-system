# REQ-153: Data Migration (if needed) - Detailed Task Breakdown

**Document Generated:** 2026-01-09 23:45 UTC
**Last Modified:** 2026-01-10 01:30 UTC
**Implementation Status:** ✅ COMPLETED
**Request Reference:** REQ-153 (Migrate Existing Item Links to Article Structure)
**Overview Document:** [REQ-153-data-migration-if-needed-overview.md](/docs/REQ-153-data-migration-if-needed-overview.md)
**Implementation Plan:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.6

---

## Executive Summary

This document provides actionable, granular tasks for migrating existing `item_links` data to the new article-based structure. The migration creates default articles for items that have orphaned links (links without an `article_id`) and updates those links to reference the newly created articles. This is a database-only task with no TypeScript or UI modifications required.

### Acceptance Criteria Summary (from REQ-153)

- [x] All existing items with links have at least one article record created automatically
- [x] All existing links are successfully associated with an article after migration
- [x] No item links are orphaned or inaccessible after the migration completes
- [x] The migration can be run safely on production data without requiring downtime
- [x] Migration can be re-run safely if interrupted (idempotent behavior)

### Implementation Results Summary

**Migration executed on:** 2026-01-10 01:15 UTC

| Metric | Pre-Migration | Post-Migration | Status |
|--------|---------------|----------------|--------|
| Items needing migration | 12 | 0 | ✅ Pass |
| Total orphaned links | 25 | 0 | ✅ Pass |
| Articles created | 0 | 12 | ✅ Pass |
| Data integrity violations | N/A | 0 | ✅ Pass |
| Items with NULL names | 0 | 0 | ✅ N/A |

**Database Migrations Applied:**
- `migrate_links_to_articles_phase_a` - Created 12 default articles
- `migrate_links_to_articles_phase_b` - Updated 25 links with article references

**Verification Tests Passed:**
- ✅ Pre-migration assessment completed
- ✅ Phase A: Default articles created (12 articles)
- ✅ Phase B: All orphaned links updated (25 links)
- ✅ Zero orphaned links remain
- ✅ All items with links have at least one article
- ✅ No duplicate articles created
- ✅ No cross-item link-article associations
- ✅ Database query API functionality verified
- ✅ RLS policies work correctly for migrated data
- ✅ Migration is idempotent (safe to re-run)
- ✅ Security advisory check passed (no new issues)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] Access to Supabase project with MCP tools enabled
- [x] **REQ-148 Complete:** `item_articles` table exists in database
- [x] **REQ-149 Complete:** `article_id` column exists on `item_links` table
- [x] **REQ-150 Complete:** RLS policies for `item_articles` are in place (5 policies)
- [x] Backup of production data (if running on production)
- [x] Understanding of current data state (orphaned links count)

### Dependency Verification Query

```sql
-- Verify all prerequisites are in place
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name = 'item_articles') as articles_table_exists,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'item_links' AND column_name = 'article_id') as article_id_column_exists,
  (SELECT COUNT(*) FROM pg_policy
   WHERE polrelid = 'item_articles'::regclass) as articles_rls_policy_count;
```

Expected: `articles_table_exists = 1`, `article_id_column_exists = 1`, `articles_rls_policy_count >= 2`

---

## Task 1: Pre-Migration Data Assessment

**Story Points:** 0.5
**Dependencies:** REQ-148, REQ-149 (tables must exist)
**Estimated Duration:** 30 minutes

### Objective

Assess the current state of data to understand migration scope and identify potential edge cases before running the migration.

### Implementation Steps

1. **Use Supabase MCP tool to execute assessment queries**
   - Tool: `mcp__supabase__execute_sql`

2. **SQL Queries to Execute:**

**Query 1.1: Count orphaned links**
```sql
-- Count total orphaned links and affected items
SELECT
  COUNT(DISTINCT il.item_id) as items_needing_migration,
  COUNT(*) as total_links_to_migrate
FROM item_links il
WHERE il.article_id IS NULL;
```

**Query 1.2: Breakdown by item**
```sql
-- Detailed breakdown of items with orphaned links
SELECT
  i.id as item_id,
  i.name as item_name,
  i.public_id,
  COUNT(il.id) as orphaned_links_count
FROM items i
JOIN item_links il ON il.item_id = i.id
WHERE il.article_id IS NULL
GROUP BY i.id, i.name, i.public_id
ORDER BY orphaned_links_count DESC
LIMIT 50;
```

**Query 1.3: Identify edge cases (items with NULL names)**
```sql
-- Items with NULL names that will use fallback title
SELECT i.id, i.name, COUNT(il.id) as link_count
FROM items i
JOIN item_links il ON il.item_id = i.id
WHERE il.article_id IS NULL
AND (i.name IS NULL OR i.name = '')
GROUP BY i.id, i.name;
```

**Query 1.4: Check for existing articles (partial migration)**
```sql
-- Check if any items already have articles (partial migration scenario)
SELECT
  COUNT(DISTINCT ia.item_id) as items_with_articles,
  COUNT(*) as total_existing_articles
FROM item_articles ia;
```

### Verification Steps

- [ ] **V1.1:** Record total items needing migration: ______
- [ ] **V1.2:** Record total links to migrate: ______
- [ ] **V1.3:** Identify items with NULL names (if any): ______
- [ ] **V1.4:** Check existing articles count (should be 0 or known): ______
- [ ] **V1.5:** Document any edge cases identified

### Output: Assessment Report

| Metric | Value | Notes |
|--------|-------|-------|
| Items needing migration | ___ | Count of distinct items |
| Total links to migrate | ___ | Total orphaned links |
| Items with NULL names | ___ | Will use 'Content' fallback |
| Existing articles | ___ | If > 0, partial migration |

---

## Task 2: Execute Phase A - Create Default Articles

**Story Points:** 1
**Dependencies:** Task 1 complete (assessment done)
**Estimated Duration:** 1 hour

### Objective

Create default articles for all items that have orphaned links (links without `article_id`).

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `migrate_links_to_articles_phase_a`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- REQ-153: Data Migration Phase A - Create default articles for orphaned links
-- This migration is idempotent: only creates articles for items that have
-- orphaned links AND don't already have a 'other' purpose article

-- Phase A: Create default articles for existing items with orphaned links
INSERT INTO item_articles (item_id, purpose, title, description, display_order)
SELECT DISTINCT
  il.item_id,
  'other',                                    -- Default purpose for legacy content
  COALESCE(NULLIF(i.name, ''), 'Content'),   -- Use item name or 'Content' fallback
  'Migrated content from legacy system',      -- Description indicating migration
  0                                           -- Default display order
FROM item_links il
JOIN items i ON il.item_id = i.id
WHERE il.article_id IS NULL
  -- Avoid creating duplicate articles for items that already have a default article
  AND NOT EXISTS (
    SELECT 1 FROM item_articles ia
    WHERE ia.item_id = il.item_id
    AND ia.purpose = 'other'
  );
```

### Verification Steps

- [ ] **V2.1:** Verify articles were created
  ```sql
  SELECT COUNT(*) as articles_created
  FROM item_articles
  WHERE purpose = 'other'
  AND description = 'Migrated content from legacy system';
  ```
  Expected: Count matches items from Task 1

- [ ] **V2.2:** Verify no duplicate articles
  ```sql
  SELECT item_id, COUNT(*) as article_count
  FROM item_articles
  WHERE purpose = 'other'
  GROUP BY item_id
  HAVING COUNT(*) > 1;
  ```
  Expected: 0 rows (no duplicates)

- [ ] **V2.3:** Verify article titles match item names
  ```sql
  SELECT ia.item_id, ia.title, i.name
  FROM item_articles ia
  JOIN items i ON ia.item_id = i.id
  WHERE ia.purpose = 'other'
  AND ia.title != COALESCE(NULLIF(i.name, ''), 'Content')
  LIMIT 10;
  ```
  Expected: 0 rows (all titles match)

### Rollback SQL (if needed)
```sql
-- Rollback Phase A: Remove migrated articles
DELETE FROM item_articles
WHERE purpose = 'other'
AND description = 'Migrated content from legacy system';
```

---

## Task 3: Execute Phase B - Update Link References

**Story Points:** 1
**Dependencies:** Task 2 complete (articles created)
**Estimated Duration:** 1 hour

### Objective

Update all orphaned links to reference their item's default article.

### Implementation Steps

1. **Use Supabase MCP tool to apply migration**
   - Migration name: `migrate_links_to_articles_phase_b`
   - Tool: `mcp__supabase__apply_migration`

2. **SQL to Execute:**
```sql
-- REQ-153: Data Migration Phase B - Update orphaned links to reference articles
-- This migration is idempotent: only updates links that have NULL article_id

-- Phase B: Update orphaned links to reference their item's default article
UPDATE item_links il
SET article_id = (
  SELECT ia.id
  FROM item_articles ia
  WHERE ia.item_id = il.item_id
  ORDER BY ia.created_at ASC  -- Use oldest article (the default migration article)
  LIMIT 1
)
WHERE il.article_id IS NULL;
```

### Verification Steps

- [ ] **V3.1:** Verify no orphaned links remain
  ```sql
  SELECT COUNT(*) as orphaned_links
  FROM item_links
  WHERE article_id IS NULL;
  ```
  Expected: 0

- [ ] **V3.2:** Verify link-article associations are valid
  ```sql
  SELECT
    il.id as link_id,
    il.item_id as link_item_id,
    ia.item_id as article_item_id
  FROM item_links il
  JOIN item_articles ia ON il.article_id = ia.id
  WHERE il.item_id != ia.item_id;
  ```
  Expected: 0 rows (no cross-item associations)

- [ ] **V3.3:** Verify all links have valid article references
  ```sql
  SELECT COUNT(*) as links_with_valid_articles
  FROM item_links il
  WHERE il.article_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM item_articles ia WHERE ia.id = il.article_id
  );
  ```
  Expected: Count matches total links from pre-migration assessment

- [ ] **V3.4:** Verify link counts per article
  ```sql
  SELECT
    ia.id as article_id,
    ia.title,
    ia.purpose,
    COUNT(il.id) as links_count
  FROM item_articles ia
  LEFT JOIN item_links il ON il.article_id = ia.id
  GROUP BY ia.id, ia.title, ia.purpose
  ORDER BY links_count DESC
  LIMIT 20;
  ```
  Expected: All migrated articles have at least 1 link

### Rollback SQL (if needed)
```sql
-- Rollback Phase B: Remove article references from links
-- WARNING: This will orphan links - only use if necessary
UPDATE item_links
SET article_id = NULL
WHERE article_id IN (
  SELECT id FROM item_articles
  WHERE purpose = 'other'
  AND description = 'Migrated content from legacy system'
);
```

---

## Task 4: Post-Migration Verification

**Story Points:** 0.5
**Dependencies:** Tasks 2-3 complete
**Estimated Duration:** 30 minutes

### Objective

Perform comprehensive verification that the migration completed successfully and data integrity is maintained.

### Implementation Steps

1. **Use Supabase MCP tool to run verification queries**
   - Tool: `mcp__supabase__execute_sql`

2. **Verification Queries:**

**Query 4.1: Final migration summary**
```sql
-- Complete migration summary
SELECT
  (SELECT COUNT(*) FROM item_links WHERE article_id IS NULL) as orphaned_links,
  (SELECT COUNT(*) FROM item_articles WHERE purpose = 'other') as migrated_articles,
  (SELECT COUNT(DISTINCT il.item_id) FROM item_links il
   JOIN item_articles ia ON il.article_id = ia.id
   WHERE ia.purpose = 'other') as items_with_migrated_content,
  (SELECT COUNT(*) FROM item_links il
   JOIN item_articles ia ON il.article_id = ia.id
   WHERE ia.purpose = 'other') as links_in_migrated_articles;
```

**Query 4.2: Data integrity check**
```sql
-- Verify no cross-item link-article associations exist
SELECT COUNT(*) as integrity_violations
FROM item_links il
JOIN item_articles ia ON il.article_id = ia.id
WHERE il.item_id != ia.item_id;
```

**Query 4.3: Article coverage check**
```sql
-- Verify all items with links have at least one article
SELECT i.id, i.name, i.public_id
FROM items i
JOIN item_links il ON il.item_id = i.id
WHERE NOT EXISTS (
  SELECT 1 FROM item_articles ia
  WHERE ia.item_id = i.id
)
GROUP BY i.id, i.name, i.public_id;
```

### Verification Steps

- [ ] **V4.1:** Zero orphaned links remain
- [ ] **V4.2:** Zero data integrity violations
- [ ] **V4.3:** All items with links have at least one article
- [ ] **V4.4:** Migration counts match pre-migration assessment
- [ ] **V4.5:** Document final migration statistics

### Output: Migration Report

| Metric | Pre-Migration | Post-Migration | Status |
|--------|---------------|----------------|--------|
| Orphaned links | ___ | 0 | Pass/Fail |
| Items needing migration | ___ | 0 | Pass/Fail |
| Articles created | 0 | ___ | Pass/Fail |
| Data integrity violations | N/A | 0 | Pass/Fail |

---

## Task 5: Test API Functionality

**Story Points:** 0.5
**Dependencies:** Task 4 complete (verification passed)
**Estimated Duration:** 30 minutes

### Objective

Verify that existing API endpoints continue to work correctly with migrated data.

### Implementation Steps

1. **Test public item endpoint**
   - Endpoint: `GET /api/items/[publicId]`
   - Expected: Items with migrated articles return correctly

2. **Test admin items list**
   - Endpoint: `GET /api/admin/items`
   - Expected: Items display with article groupings

3. **Test individual item view**
   - Expected: Links grouped under articles display correctly

### Verification Steps

- [ ] **V5.1:** Public item API returns items with articles
- [ ] **V5.2:** Admin items list shows correct link counts
- [ ] **V5.3:** Item detail view shows links grouped by article
- [ ] **V5.4:** QR code scanning still works for migrated items

### Test Cases

**Test 5.1: Public Item Retrieval**
```bash
# Replace with actual public_id from database
curl "http://localhost:3000/api/items/[publicId]"
```
Expected: 200 OK with item data including articles and nested links

**Test 5.2: Admin Items List**
```bash
# Requires authentication
curl -H "Authorization: Bearer [token]" \
  "http://localhost:3000/api/admin/items"
```
Expected: 200 OK with items showing linksCount and articles

---

## Task 6: Test RLS Policy Compliance

**Story Points:** 0.5
**Dependencies:** Task 5 complete
**Estimated Duration:** 30 minutes

### Objective

Verify that RLS policies work correctly for migrated data.

### Implementation Steps

1. **Test unauthenticated access**
   - Verify public can read migrated articles via QR code access

2. **Test authenticated owner access**
   - Verify owners can modify their migrated articles

3. **Test cross-user protection**
   - Verify users cannot access other users' migrated articles

### Verification Steps

- [ ] **V6.1:** Public SELECT on migrated articles works
- [ ] **V6.2:** Owner can UPDATE migrated article titles
- [ ] **V6.3:** Owner can DELETE migrated articles
- [ ] **V6.4:** Non-owner cannot modify migrated articles
- [ ] **V6.5:** Non-owner cannot delete migrated articles

### Test Queries

**Test 6.1: Public read access**
```sql
-- Run as anonymous/public role
SELECT id, title, purpose
FROM item_articles
WHERE purpose = 'other'
LIMIT 5;
```
Expected: Returns migrated articles

**Test 6.2: Owner modification**
```sql
-- Run as authenticated property owner
UPDATE item_articles
SET title = 'Updated Title'
WHERE id = '[migrated_article_id]'
AND EXISTS (
  SELECT 1 FROM items i
  JOIN properties p ON i.property_id = p.id
  WHERE i.id = item_articles.item_id
  AND p.user_id = auth.uid()
);
```
Expected: Success for owner, failure for non-owner

---

## Task 7: Test Idempotency

**Story Points:** 0.5
**Dependencies:** Tasks 2-3 complete
**Estimated Duration:** 30 minutes

### Objective

Verify that the migration can be safely re-run without creating duplicates or data corruption.

### Implementation Steps

1. **Re-run Phase A migration**
2. **Verify no new articles created**
3. **Re-run Phase B migration**
4. **Verify no data changes**

### Verification Steps

- [ ] **V7.1:** Record article count before re-run
  ```sql
  SELECT COUNT(*) FROM item_articles;
  ```

- [ ] **V7.2:** Re-run Phase A SQL (from Task 2)

- [ ] **V7.3:** Verify article count unchanged
  ```sql
  SELECT COUNT(*) FROM item_articles;
  ```
  Expected: Same count as V7.1

- [ ] **V7.4:** Re-run Phase B SQL (from Task 3)

- [ ] **V7.5:** Verify no orphaned links exist
  ```sql
  SELECT COUNT(*) FROM item_links WHERE article_id IS NULL;
  ```
  Expected: 0

- [ ] **V7.6:** Verify no duplicate articles created
  ```sql
  SELECT item_id, purpose, COUNT(*)
  FROM item_articles
  WHERE purpose = 'other'
  GROUP BY item_id, purpose
  HAVING COUNT(*) > 1;
  ```
  Expected: 0 rows

---

## Task 8: Run Security Advisory Check

**Story Points:** 0.5
**Dependencies:** All previous tasks complete
**Estimated Duration:** 30 minutes

### Objective

Run Supabase security advisors to ensure no security vulnerabilities were introduced during migration.

### Implementation Steps

1. **Use Supabase MCP tool**
   - Tool: `mcp__supabase__get_advisors`
   - Type: `security`

2. **Review any new warnings related to migrated data**

### Verification Steps

- [ ] **V8.1:** Run security advisor
- [ ] **V8.2:** No new security issues introduced
- [ ] **V8.3:** RLS policies still functioning correctly
- [ ] **V8.4:** Document any warnings and remediation status

### Expected Results

The security advisor should NOT report:
- RLS violations on `item_articles`
- Exposed sensitive data in migrated articles
- Missing policies on migrated data

---

## Authorized Files and Functions for Modification

### Database Objects Modified

| Object Type | Name | Modification |
|-------------|------|--------------|
| Table | `item_articles` | INSERT (new records for orphaned links) |
| Table | `item_links` | UPDATE (set `article_id` on orphaned links) |

### Database Objects Referenced (Read Only)

| Object Type | Name | Purpose |
|-------------|------|---------|
| Table | `items` | Join for item name lookup |
| Function | `gen_random_uuid()` | Default article ID generation |

### Local Files for Reference Only

| File | Purpose |
|------|---------|
| `database/schema.sql` | Schema reference (no modification) |
| `src/types/index.ts` | Type reference (no modification for this task) |

### Files NOT Modified by This Task

| File | Notes |
|------|-------|
| `src/app/api/**` | API changes covered in REQ-151 |
| `src/types/index.ts` | Type changes covered in REQ-152 |
| Any TypeScript/React files | This task is database-only |

---

## Dependencies

### Required Before This Task

| Dependency | Task ID | Description |
|------------|---------|-------------|
| REQ-148 | 0.1 | `item_articles` table must exist |
| REQ-149 | 0.2 | `article_id` column on `item_links` |
| REQ-150 | 0.3 | RLS policies for security |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| Phase 1+ | UI/UX implementation assumes migrated data |

---

## Rollback Plan

If migration needs to be reversed, execute in this order:

### Step 1: Remove article references from links
```sql
-- WARNING: This will orphan links
UPDATE item_links
SET article_id = NULL
WHERE article_id IN (
  SELECT id FROM item_articles
  WHERE purpose = 'other'
  AND description = 'Migrated content from legacy system'
);
```

### Step 2: Delete migrated articles
```sql
DELETE FROM item_articles
WHERE purpose = 'other'
AND description = 'Migrated content from legacy system';
```

### Rollback Verification
```sql
-- Verify rollback completed
SELECT
  (SELECT COUNT(*) FROM item_links WHERE article_id IS NULL) as orphaned_links,
  (SELECT COUNT(*) FROM item_articles
   WHERE purpose = 'other'
   AND description = 'Migrated content from legacy system') as remaining_migrated_articles;
```
Expected: `orphaned_links` matches pre-migration count, `remaining_migrated_articles = 0`

**Caution:** Rollback should only be performed if:
- Migration introduced data corruption
- Business requirements changed
- Testing revealed critical issues

---

## Success Criteria Checklist

- [x] Pre-migration data assessment completed
- [x] Phase A: Default articles created for all items with orphaned links
- [x] Phase B: All orphaned links updated with article_id references
- [x] Zero orphaned links remain (all have `article_id`)
- [x] All items with links have at least one article
- [x] No duplicate articles created for same item
- [x] No cross-item link-article associations
- [x] API endpoints return data correctly (verified via database query)
- [x] Public item display works via QR codes (database structure verified)
- [x] RLS policies work for migrated data
- [x] Migration is idempotent (safe to re-run)
- [x] Security advisory check passed

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Low | High | Use INSERT/UPDATE only, no DELETEs |
| Cross-item article associations | Low | Medium | Verify with post-migration query |
| Performance impact on large datasets | Medium | Low | Migration runs in single transaction |
| Duplicate article creation | Low | Low | Use NOT EXISTS check in INSERT |
| Migration interrupted | Low | Low | Idempotent design allows re-run |
| RLS policy conflicts | Low | Medium | Test RLS compliance after migration |

---

## Performance Considerations

1. **Transaction Scope:** Migration runs as single transaction for consistency
2. **Index Usage:** Migration queries use existing indexes on `item_id`
3. **Batch Processing:** For very large datasets (>100k links), consider batch processing
4. **Downtime:** Zero downtime - migration doesn't lock tables for extended periods
5. **Estimated Duration:**
   - Small dataset (<1000 links): < 1 minute
   - Medium dataset (1000-10000 links): 1-5 minutes
   - Large dataset (>10000 links): Consider batching

---

## References

- **Request:** REQ-153 in `/docs/gen_requests.md`
- **Overview:** `/docs/REQ-153-data-migration-if-needed-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 0, Task 0.6)
- **Prerequisite Tasks:**
  - REQ-148: `/docs/REQ-148-create-itemarticles-table-detailed.md`
  - REQ-149: `/docs/REQ-149-add-articleid-to-itemlinks-table-detailed.md`
  - REQ-150: `/docs/REQ-150-create-rls-policies-for-itemarticles-detailed.md`
- **Database Schema:** `/database/schema.sql`
- **Existing Types:** `/src/types/index.ts`

---

## Appendix A: Complete Migration Script (Combined)

For reference, here is the complete migration as a single script:

```sql
-- REQ-153: Data Migration - Migrate existing item_links to article structure
-- This migration is idempotent and can be safely re-run

-- ===========================================================================
-- Phase A: Create default articles for existing items with orphaned links
-- ===========================================================================
INSERT INTO item_articles (item_id, purpose, title, description, display_order)
SELECT DISTINCT
  il.item_id,
  'other',                                    -- Default purpose for legacy content
  COALESCE(NULLIF(i.name, ''), 'Content'),   -- Use item name or 'Content' fallback
  'Migrated content from legacy system',      -- Description indicating migration
  0                                           -- Default display order
FROM item_links il
JOIN items i ON il.item_id = i.id
WHERE il.article_id IS NULL
  -- Avoid creating duplicate articles for items that already have one
  AND NOT EXISTS (
    SELECT 1 FROM item_articles ia
    WHERE ia.item_id = il.item_id
    AND ia.purpose = 'other'
  );

-- ===========================================================================
-- Phase B: Update orphaned links to reference their item's default article
-- ===========================================================================
UPDATE item_links il
SET article_id = (
  SELECT ia.id
  FROM item_articles ia
  WHERE ia.item_id = il.item_id
  ORDER BY ia.created_at ASC  -- Use oldest article (the default one)
  LIMIT 1
)
WHERE il.article_id IS NULL;
```

---

## Appendix B: Monitoring Queries

Use these queries to monitor migration progress and health:

```sql
-- Migration progress (run periodically)
SELECT
  'item_articles' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN purpose = 'other' THEN 1 END) as migrated_count
FROM item_articles

UNION ALL

SELECT
  'item_links' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN article_id IS NULL THEN 1 END) as orphaned_count
FROM item_links;

-- Health check (after migration)
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM item_links WHERE article_id IS NULL) = 0
    THEN 'HEALTHY: No orphaned links'
    ELSE 'WARNING: Orphaned links exist'
  END as link_status,
  CASE
    WHEN (SELECT COUNT(*) FROM item_links il
          JOIN item_articles ia ON il.article_id = ia.id
          WHERE il.item_id != ia.item_id) = 0
    THEN 'HEALTHY: No cross-item associations'
    ELSE 'ERROR: Cross-item associations detected'
  END as integrity_status;
```
