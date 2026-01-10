# REQ-149: Add `article_id` to `item_links` Table - Implementation Breakdown

**Document Generated:** 2026-01-09 23:45 UTC
**Last Modified:** 2026-01-09 23:45 UTC
**Request Reference:** REQ-149 (Link Items to Articles for Relationship Mapping)
**Implementation Plan Reference:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.2

---

## Overview

This document provides a detailed implementation breakdown for adding the `article_id` column to the existing `item_links` table. This column establishes a foreign key relationship between item links (media content) and articles, enabling content to be grouped by purpose/topic (e.g., "How to Clean", "Troubleshooting").

### Context from Implementation Plan

From the Implementation Plan (Phase 0, Task 0.2):

> **Task 0.2: Add `article_id` to `item_links` Table**
> - [ ] Create migration to add `article_id` column:
> ```sql
> -- Add article_id column (nullable for backwards compatibility)
> ALTER TABLE item_links
>   ADD COLUMN article_id UUID REFERENCES item_articles(id) ON DELETE CASCADE;
>
> -- Index for faster lookups
> CREATE INDEX idx_item_links_article_id ON item_links(article_id);
> ```

**Data Model Change:**
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

**Acceptance Criteria (from REQ-149):**
- Items can be linked to articles through a database relationship
- Links to articles are automatically removed when the article is deleted
- Existing item links continue to function without disruption
- The system can efficiently find all articles linked to a specific item
- The relationship respects database constraints and referential integrity
- NULL values are supported for links that do not reference articles

---

## Current State Analysis

### Existing Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| **item_links Table** | ✅ Exists | `database/schema.sql` |
| **item_articles Table** | ⏳ Created by REQ-148 | Task 0.1 dependency |
| **RLS on item_links** | ✅ Enabled | Public read + Admin write |
| **Existing Indexes** | ✅ Present | `idx_item_links_item_id`, `idx_item_links_order` |

### Existing `item_links` Table Schema

From `database/schema.sql`:

```sql
CREATE TABLE item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  link_type VARCHAR(50) NOT NULL CHECK (link_type IN ('youtube', 'pdf', 'image', 'text')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Existing TypeScript Interface

From `src/types/index.ts`:

```typescript
export interface ItemLink {
  id: string;
  item_id: string;
  title: string;
  link_type: LinkType;
  url: string;
  thumbnail_url: string | null;
  display_order: number;
  created_at: string;
}
```

**After this task, `article_id?: string` will be added to this interface (in Task 0.5).**

---

## Technical Approach

### Migration Strategy

The migration uses `ALTER TABLE` to add a nullable column with a foreign key constraint. The column is nullable to maintain backwards compatibility with existing data - links that were created before the article system will have `article_id = NULL`.

### Column Specification

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `article_id` | UUID | NULLABLE, FK → item_articles(id) ON DELETE CASCADE | Optional reference to parent article |

**Key Design Decisions:**

1. **Nullable Column:** Allows existing `item_links` to continue working without modification
2. **ON DELETE CASCADE:** When an article is deleted, all its associated links are automatically removed
3. **Index Creation:** Optimizes queries that filter/join by `article_id`

### Backwards Compatibility

| Scenario | Behavior |
|----------|----------|
| Existing links (no article) | `article_id = NULL` - continue to work |
| New links with article | `article_id = <uuid>` - grouped under article |
| Article deletion | Associated links are cascade deleted |
| Direct item links query | Works same as before (article_id optional) |

---

## Implementation Tasks

### Task 1: Add `article_id` Column to `item_links` [Primary]

**Objective:** Add the nullable `article_id` column with foreign key constraint to the `item_articles` table.

**Steps:**
1. Use `mcp__supabase__apply_migration` with migration name: `add_article_id_to_item_links`
2. Include column addition with foreign key constraint
3. Include ON DELETE CASCADE for automatic cleanup

**SQL Migration:**
```sql
-- Add article_id column to item_links for article grouping - REQ-149
-- Column is nullable for backwards compatibility with existing links
ALTER TABLE item_links
  ADD COLUMN article_id UUID REFERENCES item_articles(id) ON DELETE CASCADE;

-- Add column documentation
COMMENT ON COLUMN item_links.article_id IS 'Optional reference to parent article for content grouping by purpose - REQ-149';
```

**Verification:**
- [ ] Column exists with correct type (UUID)
- [ ] Column is nullable (existing data not affected)
- [ ] Foreign key constraint references `item_articles(id)`
- [ ] ON DELETE CASCADE is configured

---

### Task 2: Create Performance Index [Secondary]

**Objective:** Add index on `article_id` for efficient lookup of links by article.

**Steps:**
1. Use `mcp__supabase__apply_migration` with migration name: `add_item_links_article_index`
2. Create B-tree index on `article_id` column

**SQL Migration:**
```sql
-- Create index for faster article-based lookups - REQ-149
CREATE INDEX idx_item_links_article_id ON item_links(article_id);

-- Add index documentation
COMMENT ON INDEX idx_item_links_article_id IS 'Optimizes queries filtering/joining by article_id - REQ-149';
```

**Verification:**
- [ ] Index `idx_item_links_article_id` exists
- [ ] Index is on `article_id` column

---

### Task 3: Verify Cascade Delete Behavior

**Objective:** Confirm that deleting an article automatically removes its associated links.

**Test Steps:**
1. Create a test article for an existing item
2. Create test links associated with that article
3. Delete the article
4. Verify the associated links are also deleted
5. Verify links with `article_id = NULL` are unaffected

**Verification:**
- [ ] Links with `article_id` pointing to deleted article are removed
- [ ] Links with `article_id = NULL` remain unchanged
- [ ] No orphaned links exist

---

## Authorized Files and Functions for Modification

### Database Schema

| Location | Type | Modification |
|----------|------|-------------|
| Supabase Database | Migration | Add `article_id` column to `item_links` |
| Supabase Database | Migration | Create `idx_item_links_article_id` index |

### Files to Update (Future Tasks)

These files will be modified in subsequent tasks (0.4, 0.5):

| File | Modification | Task |
|------|--------------|------|
| `src/types/index.ts` | Add `article_id?: string` to `ItemLink` interface | 0.5 |
| `src/app/api/admin/items/route.ts` | Include article reference in link responses | 0.4 |
| `src/app/api/items/[publicId]/route.ts` | Include article grouping in public response | 0.4 |

### No Files Modified in This Task

This task focuses exclusively on database schema modification via Supabase migrations. No TypeScript files are modified in this task.

---

## Dependencies

### Required Before This Task

| Dependency | Status | Notes |
|------------|--------|-------|
| Supabase Project | ✅ Required | Must have active Supabase project |
| `item_links` Table | ✅ Exists | Target table for modification |
| `item_articles` Table | ⏳ REQ-148 | Must be created first (FK target) |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| 0.3 | Create detailed RLS policies (if article-based policies needed) |
| 0.4 | Update API endpoints to return article-grouped links |
| 0.5 | Update TypeScript types with `article_id` field |
| 0.6 | Data migration for existing links (optional) |

---

## Testing Strategy

### Unit Tests (Migration Validation)

1. **Column Structure Test:**
   - Verify `article_id` column exists with UUID type
   - Verify column is nullable
   - Verify default is NULL

2. **Foreign Key Test:**
   - Attempt to insert link with invalid `article_id` → should fail
   - Insert link with valid `article_id` → should succeed
   - Insert link with NULL `article_id` → should succeed

3. **Cascade Delete Test:**
   - Create article → Create links with article_id → Delete article → Verify links deleted

4. **Index Verification:**
   - Check `idx_item_links_article_id` exists
   - Verify query plan uses index when filtering by `article_id`

### Integration Tests (API Validation)

These will be tested after Task 0.4 (API updates):

1. **Backwards Compatibility:**
   - Existing API endpoints continue to work
   - Links without article_id are returned normally

2. **Article Grouping:**
   - Links can be filtered by article_id
   - Nested article → links structure works

---

## Rollback Plan

If migration needs to be reversed:

```sql
-- Drop index first
DROP INDEX IF EXISTS idx_item_links_article_id;

-- Drop column (this will also drop the foreign key constraint)
ALTER TABLE item_links DROP COLUMN IF EXISTS article_id;
```

**Warning:** Rollback will lose any `article_id` data that has been set on existing links. Only perform rollback before production data migration.

---

## Success Criteria

- [ ] `article_id` column added to `item_links` table
- [ ] Column is nullable (backwards compatible)
- [ ] Foreign key constraint to `item_articles(id)` is active
- [ ] ON DELETE CASCADE configured correctly
- [ ] Performance index `idx_item_links_article_id` created
- [ ] Existing item_links data is unaffected
- [ ] Cascade delete verified (article deletion removes associated links)
- [ ] No errors in Supabase logs after migration

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Blocking existing links | Low | High | Column is nullable - no data changes required |
| FK constraint failure | Low | Medium | REQ-148 dependency ensures table exists |
| Performance degradation | Low | Low | Index created for new column |
| RLS policy gaps | Low | Medium | Existing policies apply to all columns |

---

## References

- **Request:** REQ-149 in `/docs/gen_requests.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Prerequisite Task:** `/docs/REQ-148-create-itemarticles-table-overview.md`
- **Existing Schema:** `/database/schema.sql`
- **Existing Types:** `/src/types/index.ts`
- **Items API:** `/src/app/api/admin/items/route.ts`
