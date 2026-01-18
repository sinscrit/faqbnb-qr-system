# REQ-148: Create `item_articles` Table - Implementation Breakdown

**Document Generated:** 2026-01-09 22:45 UTC
**Last Modified:** 2026-01-09 22:45 UTC
**Request Reference:** REQ-148 (Support Item-Related Articles with Purpose Categories)
**Implementation Plan Reference:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.1

---

## Overview

This document provides a detailed implementation breakdown for creating the `item_articles` table in the Supabase database. This table introduces a new data model that groups media content by purpose/topic, enabling a more organized structure for item documentation such as "How to Use", "How to Clean", "Troubleshooting", etc.

### Context from Implementation Plan

From the Implementation Plan (Phase 0, Task 0.1):

> **Task 0.1: Create `item_articles` Table**
> - [ ] Create migration for `item_articles` table with proper schema
> - [ ] Add indexes for performance optimization
> - [ ] Enable Row Level Security (RLS)

**Data Model Change:**
```
CURRENT:                              NEW:
Item (Fridge)                         Item (Fridge) - physical object
└── item_links (flat list)            └── Articles (grouped by purpose)
    ├── video.mp4                         ├── Article: "How to Clean - Fridge"
    ├── manual.pdf                        │   ├── media: video.mp4
    └── guide.mp4                         │   └── media: manual.pdf
                                          └── Article: "Troubleshooting - Fridge"
                                              └── media: guide.mp4
```

**Acceptance Criteria (from REQ-148):**
- Articles can be created and linked to specific items
- Each article has a purpose category that indicates its content type
- Articles have titles that can be automatically generated from purpose and item name
- Articles can include optional detailed descriptions
- Multiple articles for the same item can be ordered for display
- Articles are automatically deleted when their parent item is deleted
- Articles can be efficiently retrieved by item identifier
- Creation and modification timestamps are tracked for each article

---

## Current State Analysis

### Existing Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| **Database Schema** | ✅ Exists | `database/schema.sql` |
| **Items Table** | ✅ Complete | `items` table with RLS |
| **Item Links Table** | ✅ Complete | `item_links` table with RLS |
| **RLS Patterns** | ✅ Established | Admin-based access control |
| **API Endpoints** | ✅ Complete | `/api/admin/items/` |
| **TypeScript Types** | ✅ Complete | `src/types/index.ts` |

### Existing RLS Pattern Analysis

From `database/schema.sql`, the current RLS pattern uses admin-based access control:

```sql
-- Public read access for QR code scanning
CREATE POLICY "Allow public read access on items" ON items
    FOR SELECT USING (true);

-- Admin-only write access
CREATE POLICY "Allow admin users to manage items" ON items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );
```

However, the Implementation Plan specifies a **property-based ownership model** for `item_articles`:

```sql
-- Users can view articles for items in their properties
USING (
    EXISTS (
        SELECT 1 FROM items i
        JOIN properties p ON i.property_id = p.id
        WHERE i.id = item_articles.item_id
        AND p.user_id = auth.uid()
    )
)
```

**Decision Point:** The RLS policies should follow the property-based model from the Implementation Plan to support multi-tenant architecture, which is the newer pattern in the codebase.

### Purpose Types from Implementation Plan

```typescript
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';
```

---

## Technical Approach

### Migration Strategy

Use Supabase's `apply_migration` MCP tool to create the table migration. This ensures:
1. Migration is tracked in Supabase's migration history
2. Schema changes are version-controlled
3. Migration can be applied to production consistently

### Table Schema

```sql
CREATE TABLE item_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Column Specifications:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the article |
| `item_id` | UUID | NOT NULL, FK → items(id) ON DELETE CASCADE | Reference to parent item |
| `purpose` | VARCHAR(50) | NOT NULL | Purpose category (how_to_use, how_to_clean, etc.) |
| `title` | VARCHAR(255) | NOT NULL | Auto-generated title: "How to Clean - Fridge" |
| `description` | TEXT | NULL | Optional detailed description |
| `display_order` | INTEGER | DEFAULT 0 | Ordering for multiple articles on same item |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last modification timestamp |

### Indexes for Performance

```sql
-- Primary lookup pattern: get all articles for an item
CREATE INDEX idx_item_articles_item_id ON item_articles(item_id);

-- Optional: compound index for ordered retrieval
CREATE INDEX idx_item_articles_item_order ON item_articles(item_id, display_order);
```

### Row Level Security

Enable RLS and create policies following the property-based ownership model:

```sql
-- Enable RLS
ALTER TABLE item_articles ENABLE ROW LEVEL SECURITY;

-- Public read access (for QR code scanning)
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);

-- Users can manage articles for items in their properties
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

**Note:** The Implementation Plan specifies separate policies for SELECT, INSERT, UPDATE, DELETE. For simplicity and consistency with the existing `items` table pattern, a single `FOR ALL` policy is used. Individual policies can be created in Task 0.3 (RLS Policies) if more granular control is needed.

### Updated_at Trigger

Leverage the existing `update_updated_at_column()` function from `schema.sql`:

```sql
CREATE TRIGGER update_item_articles_updated_at
    BEFORE UPDATE ON item_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Implementation Tasks

### Task 1: Create Migration for `item_articles` Table [Primary]

**Objective:** Create the `item_articles` table with all columns, indexes, and constraints.

**Steps:**
1. Use `mcp__supabase__apply_migration` with migration name: `create_item_articles_table`
2. Include table creation with all columns
3. Include `ON DELETE CASCADE` constraint for `item_id` foreign key
4. Add performance index on `item_id`
5. Add compound index for ordered retrieval

**SQL Migration:**
```sql
-- Create item_articles table for grouping media by purpose/topic
CREATE TABLE item_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  purpose VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE item_articles IS 'Groups item media/links by purpose (how-to-use, cleaning, troubleshooting, etc.)';
COMMENT ON COLUMN item_articles.purpose IS 'Category: how_to_use, how_to_clean, troubleshooting, safety_info, maintenance, features, other';
COMMENT ON COLUMN item_articles.title IS 'Auto-generated title format: "[Purpose] - [Item Name]"';

-- Create indexes for performance
CREATE INDEX idx_item_articles_item_id ON item_articles(item_id);
CREATE INDEX idx_item_articles_item_order ON item_articles(item_id, display_order);

-- Create trigger for automatic updated_at timestamp
CREATE TRIGGER update_item_articles_updated_at
    BEFORE UPDATE ON item_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Verification:**
- [ ] Table exists with correct columns and types
- [ ] Foreign key constraint is properly configured
- [ ] ON DELETE CASCADE works (deleting item removes its articles)
- [ ] Indexes are created
- [ ] Trigger updates `updated_at` on row modification

---

### Task 2: Enable Row Level Security [Secondary]

**Objective:** Enable RLS and create basic policies. Note: Detailed RLS policies are covered in Task 0.3.

**Steps:**
1. Enable RLS on `item_articles` table
2. Create public read policy for QR code access
3. Create owner management policy

**SQL:**
```sql
-- Enable Row Level Security
ALTER TABLE item_articles ENABLE ROW LEVEL SECURITY;

-- Public can view item articles (for QR code scanning)
CREATE POLICY "Public can view item articles"
  ON item_articles FOR SELECT
  USING (true);

-- Users can manage articles for items in their properties
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
```

**Verification:**
- [ ] RLS is enabled on `item_articles`
- [ ] Public SELECT works without authentication
- [ ] Authenticated users can only manage articles for their own items

---

## Authorized Files and Functions for Modification

### Database Schema

| Location | Type | Modification |
|----------|------|-------------|
| Supabase Database | Migration | Create `item_articles` table |
| Supabase Database | Migration | Create indexes |
| Supabase Database | Migration | Enable RLS and policies |
| Supabase Database | Migration | Create trigger |

### Files to Update (Future Tasks)

These files will be modified in subsequent tasks (0.4, 0.5):

| File | Modification |
|------|--------------|
| `src/types/index.ts` | Add `ItemArticle` interface |
| `src/app/api/admin/items/route.ts` | Update to include articles in response |
| `database/schema.sql` | Reference only - actual changes via migrations |

### No Files Modified in This Task

This task focuses exclusively on database schema creation via Supabase migrations. No TypeScript files are modified.

---

## Dependencies

### Required Before This Task

| Dependency | Status | Notes |
|------------|--------|-------|
| Supabase Project | ✅ Required | Must have active Supabase project |
| `items` Table | ✅ Exists | Foreign key target |
| `properties` Table | ✅ Exists | Used in RLS policies |
| `update_updated_at_column()` Function | ✅ Exists | Trigger function |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| 0.2 | Add `article_id` to `item_links` table |
| 0.3 | Create detailed RLS policies (if needed beyond basic) |
| 0.4 | Update API endpoints to support articles |
| 0.5 | Update TypeScript types for Article model |

---

## Testing Strategy

### Unit Tests (Migration Validation)

1. **Table Structure Test:**
   - Verify all columns exist with correct types
   - Verify constraints are applied
   - Verify default values work

2. **Cascade Delete Test:**
   - Create item → Create article → Delete item → Verify article is deleted

3. **Index Verification:**
   - Check `idx_item_articles_item_id` exists
   - Check `idx_item_articles_item_order` exists

4. **Trigger Test:**
   - Insert article → Update article → Verify `updated_at` changed

### Integration Tests (RLS Validation)

1. **Public Read:**
   - Unauthenticated request can read articles

2. **Owner Write:**
   - User can create/update/delete articles for their own items
   - User cannot modify articles for other users' items

---

## Rollback Plan

If migration needs to be reversed:

```sql
-- Drop RLS policies first
DROP POLICY IF EXISTS "Public can view item articles" ON item_articles;
DROP POLICY IF EXISTS "Users can manage own item articles" ON item_articles;

-- Drop trigger
DROP TRIGGER IF EXISTS update_item_articles_updated_at ON item_articles;

-- Drop indexes
DROP INDEX IF EXISTS idx_item_articles_item_id;
DROP INDEX IF EXISTS idx_item_articles_item_order;

-- Drop table
DROP TABLE IF EXISTS item_articles;
```

---

## Success Criteria

- [ ] `item_articles` table created with all specified columns
- [ ] Foreign key to `items` table with ON DELETE CASCADE
- [ ] Performance indexes created
- [ ] Updated_at trigger functional
- [ ] RLS enabled with appropriate policies
- [ ] Table accessible via Supabase MCP tools
- [ ] No errors in Supabase logs after migration

---

## References

- **Request:** REQ-148 in `/docs/gen_requests.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Existing Schema:** `/database/schema.sql`
- **Existing Types:** `/src/types/index.ts`
- **Items API:** `/src/app/api/admin/items/route.ts`
