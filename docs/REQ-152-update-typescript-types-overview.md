# Implementation Overview: Update TypeScript Types for Article-Based Data Structure

**Document ID:** REQ-152-Overview
**Date Created:** 2026-01-09 23:15 UTC
**Last Modified:** 2026-01-09 23:15 UTC
**Request Number:** 152
**Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.5

---

## Summary

This document provides the technical implementation breakdown for updating TypeScript type definitions to reflect the new article-based content organization model. This task supports the UI/UX Item Creation Workflow Improvements (Plan-094) by ensuring type safety and developer clarity when working with the new `item_articles` table structure.

---

## Background

### Current State

The application's existing type definitions in `/src/types/index.ts` represent items with directly attached links (`ItemLink`), but lack representation of articles as an intermediate organizational layer. The current data model is:

```
Item (Database: items table)
└── ItemLink[] (Database: item_links table)
    ├── video link
    ├── pdf link
    └── image link
```

### Target State

The new article-based structure groups content by purpose/topic:

```
Item (Database: items table)
└── ItemArticle[] (Database: item_articles table)
    ├── Article: "How to Clean - Fridge"
    │   └── ItemLink[] (nested media/links)
    └── Article: "Troubleshooting - Fridge"
        └── ItemLink[] (nested media/links)
```

### Dependencies

- **REQ-148:** Create `item_articles` Table (must be completed first)
- **REQ-149:** Add `article_id` to `item_links` Table (must be completed first)
- **Plan-094:** UI/UX Item Creation Workflow Improvements (parent implementation plan)

---

## Technical Approach

### Strategy

1. Add new `ItemArticle` interface to the core types
2. Add `PurposeType` type definition to support article categorization
3. Update `Item` interface to include optional `articles` array
4. Update `ItemWithDetails` interface to include articles
5. Update API request/response types to support article operations
6. Ensure backward compatibility with existing code that doesn't use articles

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `articles` field is optional on `Item` | Maintains backward compatibility; existing queries without article joins still work |
| `article_id` is optional on `ItemLink` | Allows gradual migration of existing links |
| Use `PurposeType` string union | Type safety with autocomplete support; matches database enum values |
| Separate workflow types from database types | Keeps concerns separated; workflow types in `ItemCreationWorkflow.types.ts`, database types in `src/types/index.ts` |

---

## Implementation Tasks

### Task 1: Add PurposeType Definition

**File:** `src/types/index.ts`

Add the `PurposeType` type definition after the `LinkType` definition:

```typescript
/**
 * Purpose/Intent categories for item articles.
 * Maps to the `purpose` column in the `item_articles` table.
 * @see Plan-094 Phase 0 Database Refactoring
 */
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';
```

### Task 2: Add ItemArticle Interface

**File:** `src/types/index.ts`

Add the `ItemArticle` interface after the `ItemLink` interface:

```typescript
/**
 * Item article representing grouped content by purpose/topic.
 * Articles organize item_links into meaningful categories.
 * @see Plan-094 Phase 0 Database Refactoring
 */
export interface ItemArticle {
  /** Unique identifier (UUID) */
  id: string;

  /** Reference to parent item */
  item_id: string;

  /** Purpose/intent category for this article */
  purpose: PurposeType;

  /** Auto-generated or user-edited title (e.g., "How to Clean - Fridge") */
  title: string;

  /** Optional description text */
  description?: string | null;

  /** Display order within the item (0-indexed) */
  display_order: number;

  /** Creation timestamp */
  created_at: string;

  /** Last update timestamp */
  updated_at: string;

  /** Nested links/media belonging to this article (populated when joined) */
  links?: ItemLink[];
}
```

### Task 3: Update ItemLink Interface

**File:** `src/types/index.ts`

Add `article_id` field to the existing `ItemLink` interface:

```typescript
export interface ItemLink {
  id: string;
  item_id: string;
  article_id?: string | null; // NEW: Optional reference to parent article
  title: string;
  link_type: LinkType;
  url: string;
  thumbnail_url: string | null;
  display_order: number;
  created_at: string;
}
```

### Task 4: Update ItemWithDetails Interface

**File:** `src/types/index.ts`

Add `articles` field to the `ItemWithDetails` interface:

```typescript
export interface ItemWithDetails {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  propertyId: string;
  property?: Property;
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
  links: ItemLink[];
  /** Grouped content organized by article/purpose */
  articles?: ItemArticle[];  // NEW
  /** Count of associated media files for delete warning */
  mediaCount?: number;
}
```

### Task 5: Update API Response Types

**File:** `src/types/index.ts`

Update `ItemResponse` to include articles in the response data:

```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    links: {
      id: string;
      articleId?: string;  // NEW
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
    articles?: {  // NEW
      id: string;
      purpose: PurposeType;
      title: string;
      description?: string;
      displayOrder: number;
      links: {
        id: string;
        title: string;
        linkType: LinkType;
        url: string;
        thumbnailUrl?: string;
        displayOrder: number;
      }[];
    }[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

### Task 6: Add Article API Request Types

**File:** `src/types/index.ts`

Add new request types for article operations:

```typescript
/**
 * Request payload for creating an article.
 * @see Plan-094 Phase 0 Task 0.4
 */
export interface CreateArticleRequest {
  /** Item ID this article belongs to */
  itemId: string;
  /** Purpose/intent category */
  purpose: PurposeType;
  /** Article title (typically auto-generated) */
  title: string;
  /** Optional description */
  description?: string;
  /** Display order (defaults to end of list) */
  displayOrder?: number;
  /** Links to include in this article */
  links?: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
}

/**
 * Request payload for updating an article.
 */
export interface UpdateArticleRequest extends CreateArticleRequest {
  /** Article ID to update */
  id: string;
}

/**
 * Response type for article operations.
 */
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
}

/**
 * Response type for listing articles.
 */
export interface ArticlesListResponse {
  success: boolean;
  data?: ItemArticle[];
  error?: string;
}
```

### Task 7: Update CreateItemRequest Type

**File:** `src/types/index.ts`

Update the item creation request to optionally include article data:

```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  qrCodeUrl?: string;
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  /** Optional articles with nested links for article-based creation */
  articles?: {  // NEW
    purpose: PurposeType;
    title: string;
    description?: string;
    displayOrder: number;
    links?: {
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
  }[];
}
```

### Task 8: Export New Types

**File:** `src/types/index.ts`

Ensure all new types are properly exported. Since we're adding to the existing file, they will be automatically exported if defined at the module level.

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Change Type | Functions/Sections to Modify |
|------|-------------|------------------------------|
| `src/types/index.ts` | MODIFY | Add `PurposeType`, `ItemArticle`, `CreateArticleRequest`, `UpdateArticleRequest`, `ArticleResponse`, `ArticlesListResponse`; Update `ItemLink`, `ItemWithDetails`, `ItemResponse`, `CreateItemRequest` |

### Files That May Reference New Types (Informational)

These files will consume the new types but don't need modification as part of this task:

- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` - Will import `PurposeType` from shared types
- `src/components/ItemManager/ItemManager.types.ts` - May extend `ItemRecordExtended` with articles
- `src/app/api/admin/items/route.ts` - API endpoint will use new types
- `src/lib/item-utils.ts` - Utility functions may need article-aware helpers

---

## Integration Points

### Upstream Dependencies (Must Be Completed First)

1. **REQ-148:** `item_articles` table must exist in database
2. **REQ-149:** `item_links.article_id` column must exist

### Downstream Consumers (Will Use These Types)

1. **REQ-151:** API endpoint updates will use these types for request/response
2. **Plan-094 Phase 1:** Workflow types will import `PurposeType`
3. **Plan-094 Phase 5:** Content preview components will use `ItemArticle` for rendering

---

## Testing Considerations

### Type Checking

- [ ] Run `npm run type-check` (or `tsc --noEmit`) after changes
- [ ] Verify no type errors in dependent files
- [ ] Verify existing code using `Item`, `ItemLink`, `ItemWithDetails` still compiles

### Manual Verification

- [ ] Check IDE autocomplete works for `PurposeType` values
- [ ] Verify `ItemArticle` interface properties match database schema
- [ ] Confirm optional `article_id` on `ItemLink` doesn't break existing code

---

## Rollback Plan

If issues arise:

1. Revert changes to `src/types/index.ts`
2. The changes are additive, so existing functionality should not be affected
3. Any files that started using the new types would show compile errors, making rollback scope visible

---

## Success Criteria

- [ ] `PurposeType` type definition exists with all 7 purpose categories
- [ ] `ItemArticle` interface exists with all required fields
- [ ] `ItemLink` interface includes optional `article_id` field
- [ ] `ItemWithDetails` interface includes optional `articles` array
- [ ] `ItemResponse` includes articles in response data structure
- [ ] New article request/response types are defined
- [ ] `CreateItemRequest` supports optional articles
- [ ] TypeScript compilation passes with no errors
- [ ] IDE provides autocomplete for all new types
- [ ] Existing code using item types still compiles without changes

---

## References

- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 0, Task 0.5)
- **Request Document:** `/docs/gen_requests.md` (REQ-152)
- **Database Types:** `/src/types/index.ts`
- **Workflow Types:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Database Schema:** Supabase `item_articles` and `item_links` tables

---

## Appendix A: Complete PurposeType Values

| Value | Label | Description |
|-------|-------|-------------|
| `how-to-use` | How to Use | Operating instructions and controls |
| `how-to-clean` | How to Clean | Cleaning and care instructions |
| `troubleshooting` | Troubleshooting | Common issues and fixes |
| `safety-info` | Safety Information | Safety warnings and precautions |
| `maintenance` | Maintenance | Regular maintenance tasks |
| `features` | Features & Tips | Special features and tips |
| `other` | Other | General information |

---

## Appendix B: ItemArticle to Database Column Mapping

| TypeScript Property | Database Column | Type |
|---------------------|-----------------|------|
| `id` | `id` | UUID |
| `item_id` | `item_id` | UUID (FK → items.id) |
| `purpose` | `purpose` | VARCHAR(50) |
| `title` | `title` | VARCHAR(255) |
| `description` | `description` | TEXT |
| `display_order` | `display_order` | INTEGER |
| `created_at` | `created_at` | TIMESTAMPTZ |
| `updated_at` | `updated_at` | TIMESTAMPTZ |
| `links` | N/A (joined) | Array<ItemLink> |
