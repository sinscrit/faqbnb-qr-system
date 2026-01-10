# REQ-151: Update API Endpoints for Article-Based Content Structure - Implementation Breakdown

**Document Generated:** 2026-01-09 23:30 UTC
**Last Modified:** 2026-01-09 23:30 UTC
**Request Reference:** REQ-151 (API Endpoint Updates for Article-Based Content Structure)
**Implementation Plan Reference:** [Plan-094-UI-UX-Workflow-Improvements.md](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.4

---

## Overview

This document provides a detailed implementation breakdown for updating the API endpoints to support the article-based content structure. This includes modifying existing item endpoints to handle article creation during item saves, returning articles with nested links, creating dedicated CRUD endpoints for articles, and updating the public item display page to group content by article.

### Context from Implementation Plan

From the Implementation Plan (Phase 0, Task 0.4):

> **Task 0.4: Update API Endpoints**
> - [ ] Update `/api/admin/items` POST to create article when saving item
> - [ ] Update `/api/admin/items` GET to include articles with nested links
> - [ ] Create `/api/admin/articles` endpoints (CRUD operations)
> - [ ] Update item display page to group content by article

### Data Model Context

The new data model groups media by purpose/topic:

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

**Article Title Format:** "[Purpose] - [Item Name]" (e.g., "How to Clean - Fridge")

### Acceptance Criteria (from REQ-151)

- When an item is saved, the API automatically creates the associated article records based on the content provided
- When items are retrieved, the response includes their related articles with nested link information
- A complete set of CRUD endpoints exists for managing articles independently
- The display interface groups and presents content by article, making it easier for users to understand the organized structure

---

## Current State Analysis

### Existing API Endpoints

| Endpoint | Method | Location | Purpose |
|----------|--------|----------|---------|
| `/api/admin/items` | GET | `src/app/api/admin/items/route.ts:84` | List items with pagination |
| `/api/admin/items` | POST | `src/app/api/admin/items/route.ts:259` | Create new item with links |
| `/api/admin/items/[publicId]` | GET | `src/app/api/admin/items/[publicId]/route.ts:295` | Get single item details |
| `/api/admin/items/[publicId]` | PUT | `src/app/api/admin/items/[publicId]/route.ts:412` | Update item and links |
| `/api/admin/items/[publicId]` | DELETE | `src/app/api/admin/items/[publicId]/route.ts:661` | Delete item (cascade) |
| `/api/items/[publicId]` | GET | `src/app/api/items/[publicId]/route.ts:4` | Public item view |

### Existing API Patterns

The current admin items API uses the following patterns:

1. **Authentication:** `validateAdminAuth(request)` returns `{ user, isAdmin, supabase }`
2. **Account Context:** `getAccountContext(request, userId, isAdmin, supabase)` for multi-tenant filtering
3. **Response Format:** `{ success: boolean, data?: T, error?: string, accountContext?: {...} }`
4. **Validation:** UUID format validation, required field checks, link type validation
5. **Error Handling:** Consistent error responses with status codes (400, 401, 403, 404, 500)

### Current Item Response Structure

```typescript
// From src/types/index.ts
interface ItemResponse {
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
  accountContext?: {...};
}
```

### Public Item Display

The public item display page (`src/app/item/[publicId]/page.tsx`) currently:
1. Fetches item data from `/api/items/[publicId]`
2. Renders using `ItemDisplay` component
3. Shows flat list of links in "Instructions & Resources" section
4. Groups by link type (video, image, pdf, text) visually via `LinkCard`

---

## Technical Approach

### Overview of Changes

1. **Admin Items POST** - Modify to accept optional article data and create article records
2. **Admin Items GET (list)** - Include article count in list view
3. **Admin Items GET (single)** - Return articles with nested links
4. **Admin Items PUT** - Handle article creation/updates during item updates
5. **New Articles API** - Full CRUD operations for articles
6. **Public Items GET** - Return articles with nested links for grouped display
7. **ItemDisplay Component** - Update to render content grouped by article

### API Request/Response Contracts

#### 1. Updated CreateItemRequest

```typescript
interface CreateItemRequest {
  publicId: string;
  name: string;
  description?: string;
  propertyId: string;
  qrCodeUrl?: string;
  // NEW: Article-based content
  article?: {
    purpose: PurposeType;
    title?: string;        // Auto-generated if not provided
    description?: string;
  };
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
}
```

#### 2. Updated ItemResponse with Articles

```typescript
interface ItemResponseWithArticles {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    // NEW: Articles with nested links
    articles: {
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
    // DEPRECATED: Flat links (kept for backward compatibility)
    links: {...}[];
  };
  error?: string;
  accountContext?: {...};
}
```

#### 3. Article CRUD Endpoints

```typescript
// GET /api/admin/articles?item_id=xxx
interface ArticlesListResponse {
  success: boolean;
  data: ItemArticle[];
  error?: string;
}

// POST /api/admin/articles
interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
}

// PUT /api/admin/articles/[articleId]
interface UpdateArticleRequest {
  purpose?: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
}

// DELETE /api/admin/articles/[articleId]
// Returns success/error response
```

---

## Implementation Tasks

### Task 1: Update TypeScript Types [Foundation]

**Objective:** Add article-related types to support API changes.

**File:** `src/types/index.ts`

**Changes:**
1. Add `PurposeType` type
2. Add `ItemArticle` interface
3. Update `CreateItemRequest` with optional article field
4. Add `ItemResponseWithArticles` interface
5. Add article API request/response types

**New Types to Add:**

```typescript
// Purpose categories for item content
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';

// Article representing grouped content
export interface ItemArticle {
  id: string;
  itemId: string;
  purpose: PurposeType;
  title: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  links?: ItemLink[];
}

// Extended item with articles
export interface ItemWithArticles extends Omit<Item, 'links'> {
  articles: ItemArticle[];
  links?: ItemLink[]; // Deprecated: kept for backward compatibility
}

// Article API request types
export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateArticleRequest {
  purpose?: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
}

// Article API response types
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

export interface ArticlesListResponse {
  success: boolean;
  data?: ItemArticle[];
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

**Verification:**
- [ ] Types compile without errors
- [ ] Types are exported from index.ts
- [ ] IDE autocomplete works for new types

---

### Task 2: Update Database Types [Foundation]

**Objective:** Update Supabase database types to include `item_articles` table.

**File:** `src/lib/supabase.ts`

**Changes:**
Add `item_articles` table definition to `Database` type:

```typescript
item_articles: {
  Row: {
    id: string
    item_id: string
    purpose: string
    title: string
    description: string | null
    display_order: number | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    item_id: string
    purpose: string
    title: string
    description?: string | null
    display_order?: number | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    item_id?: string
    purpose?: string
    title?: string
    description?: string | null
    display_order?: number | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "item_articles_item_id_fkey"
      columns: ["item_id"]
      isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    }
  ]
}
```

Also update `item_links` to include `article_id`:

```typescript
item_links: {
  Row: {
    // ... existing fields ...
    article_id: string | null  // NEW
  }
  Insert: {
    // ... existing fields ...
    article_id?: string | null  // NEW
  }
  Update: {
    // ... existing fields ...
    article_id?: string | null  // NEW
  }
  Relationships: [
    // ... existing relationship ...
    {
      foreignKeyName: "item_links_article_id_fkey"
      columns: ["article_id"]
      isOneToOne: false
      referencedRelation: "item_articles"
      referencedColumns: ["id"]
    }
  ]
}
```

**Verification:**
- [ ] Database types compile without errors
- [ ] Supabase queries with new tables work correctly

---

### Task 3: Create Title Generator Utility [Helper]

**Objective:** Create utility function for auto-generating article titles.

**File:** `src/lib/titleGenerator.ts` (NEW)

**Implementation:**

```typescript
import { PurposeType } from '@/types';

export const PURPOSE_LABELS: Record<PurposeType, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};

export interface TitleGeneratorInput {
  itemName: string;
  purpose: PurposeType;
}

/**
 * Generates an article title based on purpose and item name.
 * Format: "[Purpose] - [Item Name]"
 * Example: "How to Clean - Fridge"
 */
export function generateArticleTitle(input: TitleGeneratorInput): string {
  const { itemName, purpose } = input;
  const purposeLabel = PURPOSE_LABELS[purpose] || PURPOSE_LABELS['other'];
  return `${purposeLabel} - ${itemName}`;
}
```

**Verification:**
- [ ] Title generator produces correct format
- [ ] All purpose types have labels
- [ ] Fallback to 'other' works

---

### Task 4: Update Admin Items POST Endpoint [Core]

**Objective:** Modify POST to create article when saving item with article data.

**File:** `src/app/api/admin/items/route.ts`

**Changes to POST handler (line ~259):**

1. Accept optional `article` field in request body
2. After item creation, if article data provided:
   - Generate title if not provided
   - Create article record
   - Associate links with article via `article_id`
3. Return response with articles included

**Key Code Changes:**

```typescript
// After item creation (around line 410)
let createdArticle = null;
if (body.article) {
  const articleTitle = body.article.title || generateArticleTitle({
    itemName: body.name,
    purpose: body.article.purpose
  });

  const { data: newArticle, error: articleError } = await supabase
    .from('item_articles')
    .insert({
      item_id: newItem.id,
      purpose: body.article.purpose,
      title: articleTitle,
      description: body.article.description || null,
      display_order: 0
    })
    .select()
    .single();

  if (articleError) {
    // Clean up item if article creation fails
    await supabase.from('items').delete().eq('id', newItem.id);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }

  createdArticle = newArticle;
}

// Update link insertion to include article_id
const linksToInsert = body.links.map((link, index) => ({
  item_id: newItem.id,
  article_id: createdArticle?.id || null,  // NEW
  title: link.title,
  link_type: link.linkType,
  url: link.url,
  thumbnail_url: link.thumbnailUrl || null,
  display_order: link.displayOrder || index,
}));
```

**Verification:**
- [ ] Item creation with article works
- [ ] Article title is auto-generated when not provided
- [ ] Links are associated with article
- [ ] Rollback works on failure
- [ ] Response includes article data

---

### Task 5: Update Admin Items GET (List) Endpoint [Core]

**Objective:** Include article count in items list response.

**File:** `src/app/api/admin/items/route.ts`

**Changes to GET handler (line ~84):**

1. Add article count query alongside links count
2. Include `articlesCount` in response

**Key Code Changes:**

```typescript
// In itemsWithCounts mapping (around line 172)
// Add after linksCount query:
const { count: articlesCount } = await supabase
  .from('item_articles')
  .select('*', { count: 'exact', head: true })
  .eq('item_id', item.id);

// Update return object to include:
return {
  // ... existing fields ...
  linksCount: linksCount || 0,
  articlesCount: articlesCount || 0,  // NEW
  // ...
};
```

**Verification:**
- [ ] Articles count appears in list response
- [ ] Count is accurate
- [ ] No performance degradation

---

### Task 6: Update Admin Items GET (Single) Endpoint [Core]

**Objective:** Return articles with nested links for single item view.

**File:** `src/app/api/admin/items/[publicId]/route.ts`

**Changes to GET handler (line ~295):**

1. Fetch articles for the item
2. For each article, fetch associated links
3. Include articles array in response
4. Keep flat links for backward compatibility

**Key Code Changes:**

```typescript
// After fetching item (around line 365)
// Fetch articles for this item
const { data: articles, error: articlesError } = await supabase
  .from('item_articles')
  .select('*')
  .eq('item_id', itemData.id)
  .order('display_order', { ascending: true });

if (articlesError) {
  console.error('Articles fetch error:', articlesError);
}

// For each article, get associated links
const articlesWithLinks = await Promise.all(
  (articles || []).map(async (article) => {
    const { data: articleLinks } = await supabase
      .from('item_links')
      .select('id, title, link_type, url, thumbnail_url, display_order, created_at')
      .eq('article_id', article.id)
      .order('display_order', { ascending: true });

    return {
      id: article.id,
      purpose: article.purpose,
      title: article.title,
      description: article.description,
      displayOrder: article.display_order,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      links: (articleLinks || []).map(link => ({
        id: link.id,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url,
        displayOrder: link.display_order
      }))
    };
  })
);

// Update response to include articles
const response = {
  success: true,
  data: {
    // ... existing fields ...
    articles: articlesWithLinks,  // NEW
    links: links || []  // Keep for backward compatibility
  },
  accountContext: { ... }
};
```

**Verification:**
- [ ] Articles are returned with nested links
- [ ] Links without article_id still appear in flat links array
- [ ] Article display order is respected
- [ ] Link display order within article is respected

---

### Task 7: Update Admin Items PUT Endpoint [Core]

**Objective:** Handle article creation/updates during item updates.

**File:** `src/app/api/admin/items/[publicId]/route.ts`

**Changes to PUT handler (line ~412):**

1. Accept optional `article` field for updating/creating article
2. If article data provided with new item, create article
3. Associate updated links with article
4. Handle article updates for existing articles

**Note:** This task may be deferred if the workflow doesn't require article updates via item PUT. The primary flow creates articles during initial item creation.

**Verification:**
- [ ] Item update with new article works
- [ ] Links can be associated with article during update
- [ ] Existing functionality preserved

---

### Task 8: Create Articles CRUD API [Core]

**Objective:** Create dedicated endpoints for article management.

**Files:**
- `src/app/api/admin/articles/route.ts` (NEW)
- `src/app/api/admin/articles/[articleId]/route.ts` (NEW)

#### 8.1: Articles List and Create

**File:** `src/app/api/admin/articles/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle } from '@/lib/titleGenerator';
import { CreateArticleRequest, ArticlesListResponse, ArticleResponse } from '@/types';

// GET /api/admin/articles?item_id=xxx
export async function GET(request: NextRequest) {
  // 1. Validate auth
  // 2. Get item_id from query params
  // 3. Validate item belongs to user's account
  // 4. Fetch articles for item with nested links
  // 5. Return ArticlesListResponse
}

// POST /api/admin/articles
export async function POST(request: NextRequest) {
  // 1. Validate auth
  // 2. Parse CreateArticleRequest body
  // 3. Validate item belongs to user's account
  // 4. Auto-generate title if not provided
  // 5. Create article record
  // 6. Return ArticleResponse
}
```

#### 8.2: Single Article Operations

**File:** `src/app/api/admin/articles/[articleId]/route.ts`

```typescript
// GET /api/admin/articles/[articleId]
export async function GET(...) {
  // 1. Validate auth
  // 2. Fetch article with nested links
  // 3. Validate user has access via item → property → user
  // 4. Return ArticleResponse
}

// PUT /api/admin/articles/[articleId]
export async function PUT(...) {
  // 1. Validate auth
  // 2. Parse UpdateArticleRequest body
  // 3. Validate user has access
  // 4. Update article record
  // 5. Return ArticleResponse
}

// DELETE /api/admin/articles/[articleId]
export async function DELETE(...) {
  // 1. Validate auth
  // 2. Validate user has access
  // 3. Delete article (links will update via ON DELETE SET NULL or CASCADE)
  // 4. Return success response
}
```

**Verification:**
- [ ] GET list returns articles for specified item
- [ ] GET single returns article with links
- [ ] POST creates article with auto-generated title
- [ ] PUT updates article fields
- [ ] DELETE removes article
- [ ] Access control enforced for all operations

---

### Task 9: Update Public Items API [Core]

**Objective:** Update public item endpoint to return articles with grouped content.

**File:** `src/app/api/items/[publicId]/route.ts`

**Changes:**

1. Fetch articles for the item
2. Return articles with nested links
3. Keep flat links for backward compatibility

**Key Code Changes:**

```typescript
// After fetching links (around line 33)
// Fetch articles for this item
const { data: articles, error: articlesError } = await supabase
  .from('item_articles')
  .select('*')
  .eq('item_id', item.id)
  .order('display_order', { ascending: true });

// Build articles with nested links
const articlesWithLinks = await Promise.all(
  (articles || []).map(async (article) => {
    const { data: articleLinks } = await supabase
      .from('item_links')
      .select('*')
      .eq('article_id', article.id)
      .order('display_order', { ascending: true });

    return {
      id: article.id,
      purpose: article.purpose,
      title: article.title,
      description: article.description,
      displayOrder: article.display_order,
      links: (articleLinks || []).map(link => ({
        id: link.id,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url,
        displayOrder: link.display_order
      }))
    };
  })
);

// Update response
const itemWithLinks = {
  // ... existing fields ...
  articles: articlesWithLinks,  // NEW
  links: (links || []).map(...)  // Keep for backward compatibility
};
```

**Verification:**
- [ ] Public API returns articles
- [ ] Articles have nested links
- [ ] Flat links still available
- [ ] No authentication required

---

### Task 10: Update ItemDisplay Component [UI]

**Objective:** Update public item display to group content by article.

**File:** `src/components/ItemDisplay.tsx`

**Changes:**

1. Check if item has articles
2. If articles exist, render grouped by article
3. Each article section shows title and its links
4. Fallback to flat links display for backward compatibility

**Key Code Changes:**

```typescript
// Add type for item with articles
interface ItemWithArticles {
  // ... existing ItemDisplayProps.item fields ...
  articles?: {
    id: string;
    purpose: string;
    title: string;
    description?: string;
    links: {
      id: string;
      title: string;
      linkType: string;
      url: string;
      thumbnailUrl?: string;
    }[];
  }[];
}

// Update render logic in Links Section (around line 188)
{item.articles && item.articles.length > 0 ? (
  // Grouped by article view
  <div className="space-y-8">
    {item.articles.map((article) => (
      <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0">
        <h3 className="text-md font-medium text-gray-800 mb-3">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-sm text-gray-600 mb-4">{article.description}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {article.links.map((link) => (
            <LinkCard
              key={link.id}
              title={link.title}
              linkType={link.linkType}
              url={link.url}
              thumbnailUrl={link.thumbnailUrl}
              onClick={() => handleLinkClick(link.url, link.linkType)}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
) : (
  // Fallback: flat links view (existing code)
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {item.links.map((link) => (
      <LinkCard ... />
    ))}
  </div>
)}
```

**Verification:**
- [ ] Articles display with title headers
- [ ] Links grouped under their article
- [ ] Fallback to flat list works
- [ ] Responsive layout maintained
- [ ] No visual regression for items without articles

---

## Authorized Files and Functions for Modification

### TypeScript Types

| File | Function/Section | Modification |
|------|------------------|--------------|
| `src/types/index.ts` | Types section | Add PurposeType, ItemArticle, article API types |

### Database Types

| File | Function/Section | Modification |
|------|------------------|--------------|
| `src/lib/supabase.ts` | Database type | Add item_articles table definition |
| `src/lib/supabase.ts` | item_links type | Add article_id field |

### New Files

| File | Purpose |
|------|---------|
| `src/lib/titleGenerator.ts` | Article title generation utility |
| `src/app/api/admin/articles/route.ts` | Articles list and create endpoints |
| `src/app/api/admin/articles/[articleId]/route.ts` | Single article CRUD endpoints |

### API Endpoints

| File | Function | Modification |
|------|----------|--------------|
| `src/app/api/admin/items/route.ts` | `POST` (~line 259) | Add article creation logic |
| `src/app/api/admin/items/route.ts` | `GET` (~line 84) | Add articles count to list response |
| `src/app/api/admin/items/[publicId]/route.ts` | `GET` (~line 295) | Return articles with nested links |
| `src/app/api/admin/items/[publicId]/route.ts` | `PUT` (~line 412) | Handle article creation during update |
| `src/app/api/items/[publicId]/route.ts` | `GET` (~line 4) | Return articles for public view |

### UI Components

| File | Function/Section | Modification |
|------|------------------|--------------|
| `src/components/ItemDisplay.tsx` | Render section (~line 188) | Add article-grouped view |

---

## Dependencies

### Required Before This Task

| Dependency | Status | Task Reference |
|------------|--------|----------------|
| `item_articles` table | Required | REQ-148 (Task 0.1) |
| `article_id` column in `item_links` | Required | REQ-149 (Task 0.2) |
| RLS policies for `item_articles` | Required | REQ-150 (Task 0.3) |

### Tasks That Depend on This

| Task | Description |
|------|-------------|
| 0.5 | Update TypeScript types (may be consolidated here) |
| Phase 1 | Foundation - Types and constants for workflow |
| Phase 2 | PurposeStep component (uses PurposeType) |

---

## Testing Strategy

### Unit Tests

1. **Title Generator:**
   - All purpose types produce valid titles
   - Fallback to 'other' works

2. **Type Validation:**
   - New types compile correctly
   - Type exports work

### Integration Tests

1. **Admin Items POST with Article:**
   - Create item with article creates both records
   - Links associated with article
   - Response includes article data

2. **Admin Items GET:**
   - List includes article count
   - Single item returns articles with nested links

3. **Articles CRUD:**
   - Create article with auto-generated title
   - Update article fields
   - Delete article

4. **Public Items GET:**
   - Returns articles with nested links
   - Backward compatible with flat links

### E2E Tests

1. **Public Item View:**
   - Page renders with article grouping
   - Links clickable within article sections
   - Fallback to flat list for legacy items

---

## Rollback Plan

If implementation needs to be reversed:

1. **API Changes:** Revert route.ts files to previous versions
2. **Types:** Remove new type definitions
3. **Components:** Revert ItemDisplay.tsx to flat list only
4. **New Files:** Delete titleGenerator.ts and articles API files

No database changes required for rollback as this task only reads from tables created in previous tasks.

---

## Success Criteria

- [ ] Admin POST creates article when article data provided
- [ ] Admin GET (list) includes articles count
- [ ] Admin GET (single) returns articles with nested links
- [ ] Articles CRUD endpoints functional
- [ ] Public GET returns articles for grouped display
- [ ] ItemDisplay shows content grouped by article
- [ ] Backward compatibility maintained for items without articles
- [ ] All existing tests pass
- [ ] No performance degradation in API responses

---

## References

- **Request:** REQ-151 in `/docs/gen_requests.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Prerequisite Tasks:**
  - REQ-148: Create `item_articles` table
  - REQ-149: Add `article_id` to `item_links`
  - REQ-150: Create RLS policies for `item_articles`
- **Existing API:** `/src/app/api/admin/items/route.ts`
- **Public Display:** `/src/components/ItemDisplay.tsx`
- **Types:** `/src/types/index.ts`
