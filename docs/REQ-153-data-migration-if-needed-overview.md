# REQ-153: Data Migration (if needed) - Implementation Breakdown

**Document Generated:** 2026-01-09 UTC
**Last Modified:** 2026-01-09 UTC
**Request Reference:** REQ-153 (Migrate Existing Item Links to Article Structure)
**Implementation Plan Reference:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.6

---

## Overview

This document provides an implementation breakdown for migrating existing `item_links` data to the new article-based structure. This migration ensures that all existing items with associated links are automatically preserved by creating appropriate `item_articles` records and updating link associations.

### Context from Implementation Plan

From the Implementation Plan (Phase 0, Task 0.6):

> **Task 0.6: Data Migration (if needed)**
> - [ ] Script to migrate existing `item_links` to articles (optional, for existing data)

**Purpose:** Transform the flat item_links structure into the new hierarchical article-based grouping system without data loss.

### Data Model Transformation

```
BEFORE MIGRATION:                     AFTER MIGRATION:
Item (Fridge)                         Item (Fridge) - physical object
└── item_links (flat list)            └── Articles (grouped by purpose)
    ├── video.mp4 (article_id: NULL)      ├── Article: "Content" (purpose: other)
    ├── manual.pdf (article_id: NULL)     │   ├── video.mp4 (article_id: <uuid>)
    └── guide.mp4 (article_id: NULL)      │   ├── manual.pdf (article_id: <uuid>)
                                          │   └── guide.mp4 (article_id: <uuid>)
```

### Acceptance Criteria (from REQ-153)

- [ ] All existing items with links have at least one article record created automatically
- [ ] All existing links are successfully associated with an article after migration
- [ ] No item links are orphaned or inaccessible after the migration completes
- [ ] The migration can be run safely on production data without requiring downtime
- [ ] Migration can be re-run safely if interrupted (idempotent behavior)

---

## Current State Analysis

### Prerequisites

| Dependency | Status | Description |
|------------|--------|-------------|
| **REQ-148** | Required | `item_articles` table must exist |
| **REQ-149** | Required | `article_id` column added to `item_links` |
| **REQ-150** | Required | RLS policies for `item_articles` (for security) |

### Existing Database Schema

**items table:**
```sql
items (
  id UUID PRIMARY KEY,
  public_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_id UUID NOT NULL REFERENCES properties(id),
  ...
)
```

**item_links table (current):**
```sql
item_links (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  link_type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  article_id UUID REFERENCES item_articles(id) ON DELETE CASCADE, -- Added by REQ-149
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**item_articles table (new - from REQ-148):**
```sql
item_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

### Data Assessment Query

Before running the migration, assess the current state:

```sql
-- Count items with orphaned links (no article association)
SELECT
  COUNT(DISTINCT il.item_id) as items_with_orphaned_links,
  COUNT(*) as total_orphaned_links
FROM item_links il
WHERE il.article_id IS NULL;

-- Breakdown by item
SELECT
  i.id as item_id,
  i.name as item_name,
  COUNT(il.id) as orphaned_links_count
FROM items i
JOIN item_links il ON il.item_id = i.id
WHERE il.article_id IS NULL
GROUP BY i.id, i.name
ORDER BY orphaned_links_count DESC;
```

---

## Technical Approach

### Migration Strategy

**Two-Phase Migration:**

1. **Phase A:** Create default articles for items that have orphaned links
2. **Phase B:** Update orphaned links to reference the newly created articles

### Migration SQL (from Implementation Plan)

```sql
-- Phase A: Create default articles for existing items with links
INSERT INTO item_articles (item_id, purpose, title)
SELECT DISTINCT
  il.item_id,
  'other',
  COALESCE(i.name, 'Content')
FROM item_links il
JOIN items i ON il.item_id = i.id
WHERE il.article_id IS NULL;

-- Phase B: Update existing links to reference new articles
UPDATE item_links il
SET article_id = (
  SELECT ia.id FROM item_articles ia
  WHERE ia.item_id = il.item_id
  LIMIT 1
)
WHERE il.article_id IS NULL;
```

### Idempotency Considerations

The migration must be **idempotent** - safe to run multiple times:

1. **Phase A:** Uses `WHERE il.article_id IS NULL` to only process links without articles
   - Running twice would only create articles for items that still have orphaned links

2. **Phase B:** Uses `WHERE il.article_id IS NULL` to only update links without articles
   - Running twice would only update links that still don't have article associations

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Item has no links | No migration needed - no orphaned links |
| Item already has articles | Only orphaned links get migrated |
| Multiple items with same name | Each gets its own article (item_id is unique) |
| Item with NULL name | Uses 'Content' as fallback title |
| Migration interrupted mid-way | Can be re-run safely (idempotent) |

---

## Implementation Tasks

### Task 1: Pre-Migration Data Assessment

**Objective:** Understand the current state of data before migration.

**Steps:**

1. **Query orphaned link counts:**
```sql
SELECT
  COUNT(DISTINCT il.item_id) as items_needing_migration,
  COUNT(*) as total_links_to_migrate
FROM item_links il
WHERE il.article_id IS NULL;
```

2. **Identify potential issues:**
```sql
-- Items with NULL names (will use fallback)
SELECT i.id, i.name, COUNT(il.id) as link_count
FROM items i
JOIN item_links il ON il.item_id = i.id
WHERE il.article_id IS NULL
AND i.name IS NULL
GROUP BY i.id, i.name;
```

3. **Record baseline metrics for verification:**
   - Total items with orphaned links
   - Total orphaned links
   - Items with NULL names

**Verification:**
- [ ] Pre-migration counts recorded
- [ ] Any edge cases identified and documented

---

### Task 2: Create Migration Script

**Objective:** Create a single migration that handles both phases.

**Migration Name:** `migrate_existing_links_to_articles`

**SQL:**
```sql
-- REQ-153: Data Migration - Migrate existing item_links to article structure
-- This migration is idempotent and can be safely re-run

-- Phase A: Create default articles for existing items with orphaned links
-- Only creates articles for items that have links without article associations
INSERT INTO item_articles (item_id, purpose, title, display_order)
SELECT DISTINCT
  il.item_id,
  'other',                           -- Default purpose for legacy content
  COALESCE(i.name, 'Content'),       -- Use item name or 'Content' fallback
  0                                  -- Default display order
FROM item_links il
JOIN items i ON il.item_id = i.id
WHERE il.article_id IS NULL
  -- Avoid creating duplicate articles for items that already have one
  AND NOT EXISTS (
    SELECT 1 FROM item_articles ia
    WHERE ia.item_id = il.item_id
    AND ia.purpose = 'other'
  );

-- Phase B: Update orphaned links to reference their item's default article
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

**Tool:** `mcp__supabase__apply_migration`

---

### Task 3: Verify Migration Success

**Objective:** Confirm all links are now associated with articles.

**Verification Queries:**

1. **Verify no orphaned links remain:**
```sql
SELECT COUNT(*) as orphaned_links
FROM item_links
WHERE article_id IS NULL;
-- Expected: 0
```

2. **Verify articles were created:**
```sql
SELECT
  COUNT(*) as total_articles_created,
  COUNT(CASE WHEN purpose = 'other' THEN 1 END) as default_articles
FROM item_articles;
```

3. **Verify link-article associations:**
```sql
SELECT
  ia.id as article_id,
  ia.title as article_title,
  ia.purpose,
  COUNT(il.id) as links_count
FROM item_articles ia
LEFT JOIN item_links il ON il.article_id = ia.id
GROUP BY ia.id, ia.title, ia.purpose
ORDER BY links_count DESC;
```

4. **Verify data integrity (no orphaned articles):**
```sql
-- Articles without any links (may be valid - new empty articles)
SELECT ia.id, ia.title, ia.item_id
FROM item_articles ia
LEFT JOIN item_links il ON il.article_id = ia.id
WHERE il.id IS NULL;
```

**Verification Checklist:**
- [ ] Zero orphaned links (`article_id IS NULL`)
- [ ] All migrated items have at least one article
- [ ] Link counts match pre-migration totals
- [ ] No duplicate articles created for same item

---

### Task 4: Post-Migration Validation

**Objective:** Validate the migration didn't break existing functionality.

**Tests:**

1. **API Response Test:**
   - Call `GET /api/admin/items` and verify items return with article groupings
   - Call `GET /api/items/[publicId]` and verify public item display works

2. **Data Consistency Test:**
```sql
-- Verify all links belong to articles from the same item
SELECT il.id as link_id, il.item_id as link_item_id, ia.item_id as article_item_id
FROM item_links il
JOIN item_articles ia ON il.article_id = ia.id
WHERE il.item_id != ia.item_id;
-- Expected: 0 rows (no cross-item associations)
```

3. **RLS Policy Test:**
   - Verify authenticated users can still access their items and links
   - Verify public users can still view items via QR codes

**Verification Checklist:**
- [ ] Admin API returns items with articles
- [ ] Public item display works correctly
- [ ] No cross-item link-article associations
- [ ] RLS policies work for migrated data

---

### Task 5: Optional - Enhanced Migration (Future State)

**Objective:** Support more sophisticated migration with purpose inference.

This is an **optional** enhancement for future consideration:

```sql
-- Future enhancement: Infer purpose from link content
-- (Only implement if business requirements demand it)

-- Example: Infer purpose from title keywords
UPDATE item_articles ia
SET purpose = CASE
  WHEN ia.title ILIKE '%clean%' THEN 'how-to-clean'
  WHEN ia.title ILIKE '%use%' OR ia.title ILIKE '%how to%' THEN 'how-to-use'
  WHEN ia.title ILIKE '%troubleshoot%' OR ia.title ILIKE '%problem%' THEN 'troubleshooting'
  WHEN ia.title ILIKE '%safe%' OR ia.title ILIKE '%warning%' THEN 'safety-info'
  WHEN ia.title ILIKE '%maintain%' OR ia.title ILIKE '%service%' THEN 'maintenance'
  ELSE 'other'
END
WHERE ia.purpose = 'other';
```

**Note:** This enhancement is NOT part of the current scope but documented for future reference.

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
| REQ-151 | 0.4 | API endpoints (optional, for verification) |
| REQ-152 | 0.5 | TypeScript types (optional, for verification) |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| Phase 1+ | UI/UX implementation assumes migrated data |

---

## Rollback Plan

If migration needs to be reversed:

```sql
-- WARNING: This will remove article associations from migrated links
-- Only run if migration caused issues

-- Step 1: Remove article associations from links
UPDATE item_links
SET article_id = NULL
WHERE article_id IN (
  SELECT id FROM item_articles
  WHERE purpose = 'other'  -- Only rollback default articles
);

-- Step 2: Delete default articles created by migration
DELETE FROM item_articles
WHERE purpose = 'other'
AND title NOT LIKE '%-%';  -- Avoid deleting user-created articles with purpose format
```

**Caution:** Rollback should only be performed if:
- Migration introduced data corruption
- Business requirements changed
- Testing revealed critical issues

---

## Success Criteria Checklist

- [ ] Pre-migration data assessment completed
- [ ] Migration script executed successfully
- [ ] Zero orphaned links remain (all have `article_id`)
- [ ] All items with links have at least one article
- [ ] No duplicate articles created for same item
- [ ] Link counts match pre-migration totals
- [ ] No cross-item link-article associations
- [ ] API endpoints return data correctly
- [ ] Public item display works via QR codes
- [ ] RLS policies work for migrated data
- [ ] Migration is idempotent (safe to re-run)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Low | High | Use INSERT/UPDATE only, no DELETEs |
| Cross-item article associations | Low | Medium | Verify with post-migration query |
| Performance impact on large datasets | Medium | Low | Migration runs in single transaction |
| Duplicate article creation | Low | Low | Use NOT EXISTS check in INSERT |
| Migration interrupted | Low | Low | Idempotent design allows re-run |

---

## Security Considerations

1. **RLS Compliance:** Migration respects existing RLS policies - no security bypass
2. **Data Isolation:** No cross-user data exposure during migration
3. **Audit Trail:** Migration creates records with timestamps for traceability
4. **Minimal Privilege:** Migration only requires INSERT/UPDATE permissions

---

## Performance Considerations

1. **Batch Size:** For very large datasets, consider batch processing
2. **Index Usage:** Migration queries use existing indexes
3. **Transaction Scope:** Single transaction for consistency
4. **Downtime:** Zero downtime - migration doesn't lock tables for extended periods

---

## References

- **Request:** REQ-153 in `/docs/gen_requests.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Prerequisite Tasks:**
  - REQ-148: `/docs/REQ-148-create-itemarticles-table-detailed.md`
  - REQ-149: `/docs/REQ-149-add-articleid-to-itemlinks-table-detailed.md`
  - REQ-150: `/docs/REQ-150-create-rls-policies-for-itemarticles-overview.md`
- **Database Schema:** `/database/schema.sql`
- **Existing Types:** `/src/types/index.ts`
