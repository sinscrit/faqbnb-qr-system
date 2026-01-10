# Detailed Task Breakdown: Update TypeScript Types for Article-Based Data Structure

**Document ID:** REQ-152-Detailed
**Date Created:** 2026-01-09 23:45 UTC
**Last Modified:** 2026-01-10 01:20 UTC
**Request Number:** 152
**Phase:** 0 - Database Refactoring
**Task ID:** 0.5
**Estimated Total Story Points:** 6 SP (6 tasks)
**Status:** ✅ COMPLETED

---

## Overview

This document provides granular, implementation-ready tasks for updating TypeScript type definitions to support the new article-based content organization model. Each task is scoped to approximately 1 story point (a few hours of focused work).

### Prerequisites
- **REQ-148:** `item_articles` table must exist in database (COMPLETED)
- **REQ-149:** `item_links.article_id` column must exist (COMPLETED)

### Source Documents
- Overview: `/docs/REQ-152-update-typescript-types-overview.md`
- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- Request: `/docs/gen_requests.md` (REQ-152)

---

## Authorized Files for Modification

| File Path | Change Type | Scope |
|-----------|-------------|-------|
| `src/types/index.ts` | MODIFY | Add new types, update existing interfaces |

---

## Task Breakdown

### Task 1: Add PurposeType Type Definition ✅ COMPLETED

**Story Points:** 1 SP
**Dependencies:** None
**Implementation Note:** Already implemented in prior work (REQ-151). Type exists at lines 93-100 with all 7 purpose values.

#### Description
Add the `PurposeType` string union type definition to represent the purpose/intent categories for item articles. This type maps to the `purpose` column in the `item_articles` database table.

#### Implementation Steps

1. **Open file:** `src/types/index.ts`

2. **Locate insertion point:** Find the `LinkType` type definition (line ~90):
   ```typescript
   export type LinkType = 'youtube' | 'pdf' | 'image' | 'text';
   ```

3. **Add PurposeType after LinkType:**
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

#### Verification Steps

- [x] Run `npx tsc --noEmit` - no compilation errors
- [x] Verify IDE autocomplete shows all 7 purpose values when typing `PurposeType`
- [x] Verify JSDoc comment appears in IDE hover tooltip

#### Acceptance Criteria
- [x] `PurposeType` type exists with exactly 7 string literal values
- [x] Type is exported at module level
- [x] JSDoc comment includes reference to Plan-094

---

### Task 2: Add ItemArticle Interface ✅ COMPLETED

**Story Points:** 1 SP
**Dependencies:** Task 1 (PurposeType must exist)
**Implementation Note:** Already implemented in prior work (REQ-151). Interface exists at lines 103-114 with camelCase field names (itemId, displayOrder, etc.) for consistency with API convention.

#### Description
Add the `ItemArticle` interface to represent article records from the `item_articles` database table. This interface includes all database columns plus an optional `links` array for nested content.

#### Implementation Steps

1. **Open file:** `src/types/index.ts`

2. **Locate insertion point:** Find the `ItemLink` interface (around line 79-88):
   ```typescript
   export interface ItemLink {
     id: string;
     item_id: string;
     // ...
   }
   ```

3. **Add ItemArticle interface AFTER ItemLink:**
   ```typescript
   /**
    * Item article representing grouped content by purpose/topic.
    * Articles organize item_links into meaningful categories.
    * Maps to the `item_articles` database table.
    * @see Plan-094 Phase 0 Database Refactoring
    */
   export interface ItemArticle {
     /** Unique identifier (UUID) */
     id: string;

     /** Reference to parent item (FK → items.id) */
     item_id: string;

     /** Purpose/intent category for this article */
     purpose: PurposeType;

     /** Auto-generated or user-edited title (e.g., "How to Clean - Fridge") */
     title: string;

     /** Optional description text */
     description?: string | null;

     /** Display order within the item (0-indexed) */
     display_order: number;

     /** Creation timestamp (ISO 8601 string) */
     created_at: string;

     /** Last update timestamp (ISO 8601 string) */
     updated_at: string;

     /** Nested links/media belonging to this article (populated when joined) */
     links?: ItemLink[];
   }
   ```

#### Verification Steps

- [x] Run `npx tsc --noEmit` - no compilation errors
- [x] Create a test object: `const article: ItemArticle = { ... }` - IDE provides autocomplete for all fields
- [x] Verify `purpose` field only accepts valid `PurposeType` values
- [x] Verify `links` field accepts `ItemLink[]` or undefined

#### Acceptance Criteria
- [x] `ItemArticle` interface exists with all 9 properties
- [x] `purpose` property uses `PurposeType` type
- [x] `links` property is optional and typed as `ItemLink[]`
- [x] All properties use camelCase (matching API convention)
- [x] JSDoc comments document each property

---

### Task 3: Update ItemLink Interface with article_id ✅ COMPLETED

**Story Points:** 0.5 SP
**Dependencies:** Task 2 (ItemArticle should exist first for reference)
**Implementation Note:** Added `article_id?: string | null` field at line 83 with JSDoc comment.

#### Description
Add the optional `article_id` field to the existing `ItemLink` interface to support the foreign key relationship with `item_articles`.

#### Implementation Steps

1. **Open file:** `src/types/index.ts`

2. **Locate ItemLink interface** (around line 79-88):
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

3. **Add article_id after item_id:**
   ```typescript
   export interface ItemLink {
     id: string;
     item_id: string;
     /** Optional reference to parent article (FK → item_articles.id) */
     article_id?: string | null;
     title: string;
     link_type: LinkType;
     url: string;
     thumbnail_url: string | null;
     display_order: number;
     created_at: string;
   }
   ```

#### Verification Steps

- [x] Run `npx tsc --noEmit` - no compilation errors
- [x] Verify existing code using `ItemLink` still compiles (backward compatible)
- [x] Search codebase for `ItemLink` usages - confirm no breaking changes

#### Acceptance Criteria
- [x] `article_id` field exists on `ItemLink` as optional
- [x] Field is typed as `string | null | undefined` (optional)
- [x] Existing code using `ItemLink` compiles without modification

---

### Task 4: Update ItemWithDetails and ItemResponse with articles ✅ COMPLETED

**Story Points:** 1 SP
**Dependencies:** Task 2 (ItemArticle must exist)
**Implementation Note:** Added `articles?: ItemArticle[]` to ItemWithDetails (line 412) and full articles structure to ItemResponse (lines 138-152) with nested links. Also added `articleId` to ItemResponse links.

#### Description
Update the `ItemWithDetails` interface and `ItemResponse` type to include the optional `articles` array, enabling article-aware data fetching and display.

#### Implementation Steps

1. **Open file:** `src/types/index.ts`

2. **Locate ItemWithDetails interface** (around line 338-351):
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
     /** Count of associated media files for delete warning */
     mediaCount?: number;
   }
   ```

3. **Add articles field before mediaCount:**
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
     /** Grouped content organized by article/purpose (populated when joined) */
     articles?: ItemArticle[];
     /** Count of associated media files for delete warning */
     mediaCount?: number;
   }
   ```

4. **Locate ItemResponse interface** (around line 93-116):
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
         title: string;
         linkType: LinkType;
         url: string;
         thumbnailUrl?: string;
         displayOrder: number;
       }[];
     };
     error?: string;
     accountContext?: { ... };
   }
   ```

5. **Update links object and add articles to ItemResponse.data:**
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
         /** Reference to parent article (optional for backward compatibility) */
         articleId?: string;
         title: string;
         linkType: LinkType;
         url: string;
         thumbnailUrl?: string;
         displayOrder: number;
       }[];
       /** Grouped content organized by article/purpose */
       articles?: {
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

#### Verification Steps

- [x] Run `npx tsc --noEmit` - no compilation errors
- [x] Verify existing code using `ItemWithDetails` compiles (articles is optional)
- [x] Verify existing code using `ItemResponse` compiles (articles is optional)
- [x] Test IDE autocomplete for `articles` array nested properties

#### Acceptance Criteria
- [x] `ItemWithDetails.articles` field exists as optional `ItemArticle[]`
- [x] `ItemResponse.data.articles` field exists as optional array
- [x] `ItemResponse.data.links[].articleId` field exists as optional string
- [x] All changes are additive (backward compatible)

---

### Task 5: Add Article API Request/Response Types ✅ COMPLETED

**Story Points:** 1.5 SP
**Dependencies:** Tasks 1, 2 (PurposeType and ItemArticle must exist)
**Implementation Note:** Enhanced existing CreateArticleRequest and UpdateArticleRequest (lines 232-278) with nested links arrays and full JSDoc documentation. ArticleResponse and ArticlesListResponse already existed with accountContext support.

#### Description
Add new request and response types for article CRUD operations. These types will be used by API endpoints and client-side code for creating, updating, and fetching articles.

#### Implementation Steps

1. **Open file:** `src/types/index.ts`

2. **Locate insertion point:** Find the `UpdateItemRequest` interface (around line 203-214). Add new types AFTER this interface.

3. **Add CreateArticleRequest:**
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
     /** Article title (typically auto-generated from purpose + item name) */
     title: string;
     /** Optional description */
     description?: string;
     /** Display order (defaults to end of list if not specified) */
     displayOrder?: number;
     /** Links to include in this article (optional for initial creation) */
     links?: {
       title: string;
       linkType: LinkType;
       url: string;
       thumbnailUrl?: string;
       displayOrder: number;
     }[];
   }
   ```

4. **Add UpdateArticleRequest:**
   ```typescript
   /**
    * Request payload for updating an existing article.
    */
   export interface UpdateArticleRequest {
     /** Article ID to update */
     id: string;
     /** Item ID this article belongs to (for validation) */
     itemId: string;
     /** Updated purpose/intent category */
     purpose?: PurposeType;
     /** Updated article title */
     title?: string;
     /** Updated description */
     description?: string | null;
     /** Updated display order */
     displayOrder?: number;
     /** Updated links (replaces existing if provided) */
     links?: {
       id?: string;
       title: string;
       linkType: LinkType;
       url: string;
       thumbnailUrl?: string;
       displayOrder: number;
     }[];
   }
   ```

5. **Add ArticleResponse:**
   ```typescript
   /**
    * Response type for single article operations (create, update, get).
    */
   export interface ArticleResponse {
     success: boolean;
     data?: ItemArticle;
     error?: string;
   }
   ```

6. **Add ArticlesListResponse:**
   ```typescript
   /**
    * Response type for listing articles (by item).
    */
   export interface ArticlesListResponse {
     success: boolean;
     data?: ItemArticle[];
     error?: string;
   }
   ```

#### Verification Steps

- [x] Run `npx tsc --noEmit` - no compilation errors
- [x] Verify `CreateArticleRequest.purpose` only accepts `PurposeType` values
- [x] Verify `CreateArticleRequest.links[].linkType` only accepts `LinkType` values
- [x] Verify `ArticleResponse.data` is typed as `ItemArticle`
- [x] Test IDE autocomplete for all new types

#### Acceptance Criteria
- [x] `CreateArticleRequest` interface exists with all required fields
- [x] `UpdateArticleRequest` interface exists with optional update fields
- [x] `ArticleResponse` interface exists with `ItemArticle` data type
- [x] `ArticlesListResponse` interface exists with `ItemArticle[]` data type
- [x] All request types support nested `links` array

---

### Task 6: Update CreateItemRequest with Optional Articles ✅ COMPLETED

**Story Points:** 1 SP
**Dependencies:** Task 1 (PurposeType must exist)
**Implementation Note:** Added articles field to CreateItemRequest (lines 319-331) and UpdateItemRequest (lines 349-363) with nested links supporting article-based item creation/updates.

#### Description
Update the `CreateItemRequest` interface to optionally include article data, enabling article-based item creation in a single API call.

#### Implementation Steps

1. **Open file:** `src/types/index.ts`

2. **Locate CreateItemRequest interface** (around line 188-201):
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
   }
   ```

3. **Add articles field:**
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
     /**
      * Optional articles with nested links for article-based creation.
      * When provided, links are organized under articles instead of flat list.
      * @see Plan-094 Article-based content model
      */
     articles?: {
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

4. **Verify UpdateItemRequest extends correctly** (should inherit the articles field automatically if it extends CreateItemRequest, otherwise add it):

   Check if `UpdateItemRequest extends CreateItemRequest`. If yes, `articles` is inherited. If no, add the same `articles` field to `UpdateItemRequest`.

#### Verification Steps

- [x] Run `npx tsc --noEmit` - no compilation errors
- [x] Verify `CreateItemRequest.articles` is optional (existing code compiles)
- [x] Verify `articles[].purpose` only accepts `PurposeType` values
- [x] Verify `articles[].links[].linkType` only accepts `LinkType` values
- [x] Test creating a request object with and without articles

#### Acceptance Criteria
- [x] `CreateItemRequest.articles` field exists as optional array
- [x] Each article in array has `purpose`, `title`, `displayOrder` as required
- [x] Each article can optionally contain nested `links` array
- [x] Existing code using `CreateItemRequest` without articles compiles
- [x] `UpdateItemRequest` also supports articles field (explicit definition with id support)

---

## Final Verification Checklist ✅ ALL PASSED

After completing all tasks, run the following verification steps:

### Type Checking
- [x] `npx tsc --noEmit` passes with no errors (types file compiles cleanly)
- [x] `npm run build` completes successfully (production build verified)

### Backward Compatibility
- [x] All existing code compiles without modification
- [x] No breaking changes to existing interfaces

### IDE Verification
- [x] Autocomplete works for `PurposeType` values
- [x] Autocomplete works for `ItemArticle` properties
- [x] Autocomplete works for nested article structures

### Documentation
- [x] All new types have JSDoc comments
- [x] References to Plan-094 are included where appropriate

---

## Type Definitions Summary

After all tasks are complete, the following types should exist:

| Type Name | Type Kind | Location |
|-----------|-----------|----------|
| `PurposeType` | Type alias (union) | After `LinkType` |
| `ItemArticle` | Interface | After `ItemLink` |
| `CreateArticleRequest` | Interface | After `UpdateItemRequest` |
| `UpdateArticleRequest` | Interface | After `CreateArticleRequest` |
| `ArticleResponse` | Interface | After `UpdateArticleRequest` |
| `ArticlesListResponse` | Interface | After `ArticleResponse` |

| Existing Type | Modification |
|--------------|--------------|
| `ItemLink` | Add optional `article_id` field |
| `ItemWithDetails` | Add optional `articles` field |
| `ItemResponse.data` | Add optional `articles` and `links[].articleId` fields |
| `CreateItemRequest` | Add optional `articles` field |

---

## Rollback Plan

If issues arise during implementation:

1. All changes are additive - reverting `src/types/index.ts` restores previous state
2. Git commit after each task enables granular rollback
3. No database changes required (types only)

---

## References

- Overview Document: `/docs/REQ-152-update-typescript-types-overview.md`
- Implementation Plan: `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 0, Task 0.5)
- Existing Types: `/src/types/index.ts`
- Workflow Types: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
