# REQ-151: Update API Endpoints for Article-Based Content Structure - Detailed Task Breakdown

**Document Generated:** 2026-01-09 23:55 UTC
**Last Modified:** 2026-01-10 01:10 UTC
**Implementation Status:** COMPLETED
**Request Reference:** REQ-151 (API Endpoint Updates for Article-Based Content Structure)
**Overview Document:** [REQ-151-update-api-endpoints-overview.md](./REQ-151-update-api-endpoints-overview.md)
**Implementation Plan Reference:** [Plan-094-UI-UX-Workflow-Improvements.md](./prd/Plan-094-UI-UX-Workflow-Improvements.md)
**Phase:** 0 - Database Refactoring
**Task ID:** 0.4

---

## Executive Summary

This document provides a granular task breakdown for REQ-151, enabling step-by-step implementation of API endpoint updates to support the article-based content structure. Each task is designed to be completable in a few hours of focused work (≤1 story point).

### Prerequisites (Must Be Complete)

| Dependency | Task ID | Document |
|------------|---------|----------|
| `item_articles` table created | 0.1 | REQ-148-create-itemarticles-table-detailed.md |
| `article_id` column added to `item_links` | 0.2 | REQ-149-add-articleid-to-itemlinks-table-detailed.md |
| RLS policies for `item_articles` | 0.3 | REQ-150-create-rls-policies-for-itemarticles-detailed.md |

---

## Authorized Files and Functions for Modification

### TypeScript Types
| File | Section | Modification Type |
|------|---------|-------------------|
| `src/types/index.ts` | Types section | ADD new types |

### Database Types
| File | Section | Modification Type |
|------|---------|-------------------|
| `src/lib/supabase.ts` | Database type definition | ADD `item_articles` table type |
| `src/lib/supabase.ts` | `item_links` table type | MODIFY to add `article_id` field |

### New Files to Create
| File | Purpose |
|------|---------|
| `src/lib/titleGenerator.ts` | Article title generation utility |
| `src/app/api/admin/articles/route.ts` | Articles list and create endpoints |
| `src/app/api/admin/articles/[articleId]/route.ts` | Single article CRUD endpoints |

### API Endpoints to Modify
| File | Function | Line Reference | Modification Type |
|------|----------|----------------|-------------------|
| `src/app/api/admin/items/route.ts` | `POST` | ~259-480 | MODIFY to add article creation |
| `src/app/api/admin/items/route.ts` | `GET` | ~84-256 | MODIFY to add articles count |
| `src/app/api/admin/items/[publicId]/route.ts` | `GET` | ~295-409 | MODIFY to return articles with nested links |
| `src/app/api/admin/items/[publicId]/route.ts` | `PUT` | ~412-658 | MODIFY to handle article creation during update |
| `src/app/api/items/[publicId]/route.ts` | `GET` | ~4-78 | MODIFY to return articles for public view |

### UI Components
| File | Section | Modification Type |
|------|---------|-------------------|
| `src/components/ItemDisplay.tsx` | Links section (~188-218) | MODIFY to add article-grouped view |

---

## Task Breakdown

### Phase A: Foundation - Types and Utilities

#### Task 1: Add PurposeType and Article Types to index.ts
**Estimated Effort:** ~1 hour
**File:** `src/types/index.ts`

**Implementation Steps:**
1. Open `src/types/index.ts`
2. Add `PurposeType` type definition after the existing `LinkType` definition (around line 90):
   ```typescript
   // Purpose categories for item articles
   export type PurposeType =
     | 'how-to-use'
     | 'how-to-clean'
     | 'troubleshooting'
     | 'safety-info'
     | 'maintenance'
     | 'features'
     | 'other';
   ```
3. Add `ItemArticle` interface after the `ItemLink` interface (around line 88):
   ```typescript
   // Article representing grouped content by purpose
   export interface ItemArticle {
     id: string;
     itemId: string;
     purpose: PurposeType;
     title: string;
     description?: string | null;
     displayOrder: number;
     createdAt: string;
     updatedAt: string;
     links?: ItemLink[];
   }
   ```
4. Add article API request types before the Form types section (around line 187):
   ```typescript
   // Article API Request/Response Types
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
5. Update `ItemsListResponse` type to include `articlesCount` (around line 118):
   - Add `articlesCount: number;` after `linksCount: number;`

**Verification Steps:**
- [x] Run `npm run build` - no TypeScript compilation errors
- [x] Verify IDE autocomplete works for new types in a test file
- [x] Ensure all exports are accessible from `@/types`

**Implementation Notes (2026-01-10):**
- Added `PurposeType` union type with 7 purpose categories
- Added `ItemArticle` interface with all required fields
- Added `CreateArticleRequest`, `UpdateArticleRequest`, `ArticleResponse`, `ArticlesListResponse` types
- Added `articlesCount` to `ItemsListResponse` data type

---

#### Task 2: Update Database Types in supabase.ts
**Estimated Effort:** ~45 minutes
**File:** `src/lib/supabase.ts`

**Implementation Steps:**
1. Open `src/lib/supabase.ts`
2. Add `item_articles` table type after `items` table definition (around line 296):
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
3. Update `item_links` table type to include `article_id` (around line 212-252):
   - Add to Row: `article_id: string | null`
   - Add to Insert: `article_id?: string | null`
   - Add to Update: `article_id?: string | null`
   - Add to Relationships array:
     ```typescript
     {
       foreignKeyName: "item_links_article_id_fkey"
       columns: ["article_id"]
       isOneToOne: false
       referencedRelation: "item_articles"
       referencedColumns: ["id"]
     }
     ```

**Verification Steps:**
- [x] Run `npm run build` - no TypeScript compilation errors
- [x] Supabase client properly types `item_articles` table
- [x] Supabase client properly types `article_id` on `item_links`

**Implementation Notes (2026-01-10):**
- Added `item_articles` table type definition with Row, Insert, Update, Relationships
- Added `article_id` field to `item_links` Row, Insert, Update types
- Added foreign key relationship for `article_id` -> `item_articles`

---

#### Task 3: Create Title Generator Utility
**Estimated Effort:** ~30 minutes
**File:** `src/lib/titleGenerator.ts` (NEW)

**Implementation Steps:**
1. Create new file `src/lib/titleGenerator.ts`
2. Implement the title generator:
   ```typescript
   import { PurposeType } from '@/types';

   /**
    * Labels for each purpose type
    */
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
    * Example: generateArticleTitle({ itemName: "Fridge", purpose: "how-to-clean" })
    *          → "How to Clean - Fridge"
    *
    * @param input - The item name and purpose type
    * @returns The formatted article title
    */
   export function generateArticleTitle(input: TitleGeneratorInput): string {
     const { itemName, purpose } = input;
     const purposeLabel = PURPOSE_LABELS[purpose] || PURPOSE_LABELS['other'];
     return `${purposeLabel} - ${itemName}`;
   }

   /**
    * Validates if a string is a valid PurposeType
    * @param value - The string to validate
    * @returns True if the value is a valid PurposeType
    */
   export function isValidPurposeType(value: string): value is PurposeType {
     return Object.keys(PURPOSE_LABELS).includes(value);
   }
   ```

**Verification Steps:**
- [x] Run `npm run build` - no compilation errors
- [x] Manually verify title generation: `generateArticleTitle({ itemName: "Fridge", purpose: "how-to-clean" })` returns `"How to Clean - Fridge"`
- [x] Verify all purpose types have labels
- [x] Verify `isValidPurposeType` works correctly

**Implementation Notes (2026-01-10):**
- Created `src/lib/titleGenerator.ts` with `PURPOSE_LABELS`, `generateArticleTitle`, `isValidPurposeType`, `getPurposeLabel`
- All 7 purpose types mapped to human-readable labels

---

### Phase B: Admin Items API Updates

#### Task 4: Update Admin Items POST to Create Article
**Estimated Effort:** ~2 hours
**File:** `src/app/api/admin/items/route.ts`

**Implementation Steps:**
1. Add import at the top of file:
   ```typescript
   import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
   ```
2. Locate the POST handler (around line 259)
3. Update the body type validation to accept optional `article` field (after line 283):
   ```typescript
   // Validate article field if provided
   if (body.article) {
     if (!body.article.purpose || !isValidPurposeType(body.article.purpose)) {
       return NextResponse.json(
         { success: false, error: 'Invalid or missing article purpose' },
         { status: 400 }
       );
     }
   }
   ```
4. After successful item creation (after line 409, where `newItem` is created), add article creation logic:
   ```typescript
   // Create article if article data provided
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
       console.error('Article creation error:', articleError);
       // Clean up item if article creation fails
       await supabase.from('items').delete().eq('id', newItem.id);
       return NextResponse.json(
         { success: false, error: 'Failed to create article' },
         { status: 500 }
       );
     }

     createdArticle = newArticle;
     console.log('Article created successfully:', newArticle.id);
   }
   ```
5. Update link insertion to include `article_id` (modify around line 414):
   ```typescript
   const linksToInsert = body.links.map((link, index) => ({
     item_id: newItem.id,
     article_id: createdArticle?.id || null,  // NEW: Associate with article
     title: link.title,
     link_type: link.linkType,
     url: link.url,
     thumbnail_url: link.thumbnailUrl || null,
     display_order: link.displayOrder || index,
   }));
   ```
6. Update response to include article data (modify the response object around line 443):
   - Add `articles` array to `data` object:
   ```typescript
   articles: createdArticle ? [{
     id: createdArticle.id,
     purpose: createdArticle.purpose,
     title: createdArticle.title,
     description: createdArticle.description,
     displayOrder: createdArticle.display_order || 0,
     createdAt: createdArticle.created_at,
     updatedAt: createdArticle.updated_at,
     links: createdLinks.map(link => ({
       id: link.id,
       title: link.title,
       linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
       url: link.url,
       thumbnailUrl: link.thumbnail_url || undefined,
       displayOrder: link.display_order || 0,
     }))
   }] : [],
   ```

**Verification Steps:**
- [x] Test POST without article field - existing behavior unchanged
- [x] Test POST with article field - article created with auto-generated title
- [x] Test POST with article.title provided - uses provided title
- [x] Verify links are associated with article via `article_id`
- [x] Verify rollback on article creation failure
- [x] Response includes `articles` array

**Implementation Notes (2026-01-10):**
- Added import for `generateArticleTitle` and `isValidPurposeType`
- Added article validation after link validation
- Added article creation logic after item creation
- Updated link insertion to include `article_id`
- Added rollback logic for article and item cleanup on failure
- Updated response to include `articles` array

---

#### Task 5: Update Admin Items GET (List) to Include Articles Count
**Estimated Effort:** ~45 minutes
**File:** `src/app/api/admin/items/route.ts`

**Implementation Steps:**
1. Locate the GET handler (around line 84)
2. Find the `itemsWithCounts` mapping (around line 172)
3. After the `linksCount` query (around line 175), add articles count query:
   ```typescript
   // Get articles count
   const { count: articlesCount } = await supabase
     .from('item_articles')
     .select('*', { count: 'exact', head: true })
     .eq('item_id', item.id);
   ```
4. Update the return object to include `articlesCount` (around line 215):
   ```typescript
   return {
     id: item.id,
     publicId: item.public_id,
     name: item.name,
     qrCodeUrl: item.qr_code_url || undefined,
     createdAt: item.created_at || new Date().toISOString(),
     propertyId: item.property_id,
     property: item.properties,
     linksCount: linksCount || 0,
     articlesCount: articlesCount || 0,  // NEW
     analytics: {
       visits: visitCounts,
       reactions: reactionCounts,
     },
   };
   ```

**Verification Steps:**
- [x] Run `npm run build` - no compilation errors
- [x] Test GET /api/admin/items - response includes `articlesCount` for each item
- [x] Verify count is accurate against database
- [x] No noticeable performance degradation

**Implementation Notes (2026-01-10):**
- Added articles count query after links count
- Updated return object to include `articlesCount: articlesCount || 0`

---

#### Task 6: Update Admin Items GET (Single) to Return Articles with Nested Links
**Estimated Effort:** ~1.5 hours
**File:** `src/app/api/admin/items/[publicId]/route.ts`

**Implementation Steps:**
1. Locate the GET handler (around line 295)
2. After fetching item data and links (around line 378), add article fetching:
   ```typescript
   // Fetch articles for this item
   const { data: articles, error: articlesError } = await supabase
     .from('item_articles')
     .select('*')
     .eq('item_id', itemData.id)
     .order('display_order', { ascending: true });

   if (articlesError) {
     console.error('Articles fetch error:', articlesError);
     // Don't fail the request, just log the error
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
         itemId: article.item_id,
         purpose: article.purpose,
         title: article.title,
         description: article.description,
         displayOrder: article.display_order || 0,
         createdAt: article.created_at,
         updatedAt: article.updated_at,
         links: (articleLinks || []).map(link => ({
           id: link.id,
           title: link.title,
           linkType: link.link_type,
           url: link.url,
           thumbnailUrl: link.thumbnail_url,
           displayOrder: link.display_order || 0
         }))
       };
     })
   );
   ```
3. Update the response object (around line 381) to include articles:
   ```typescript
   const response = {
     success: true,
     data: {
       id: itemData.id,
       publicId: itemData.public_id,
       name: itemData.name,
       description: itemData.description,
       property_id: itemData.property_id,
       qr_code_url: itemData.qr_code_url,
       created_at: itemData.created_at,
       updated_at: itemData.updated_at,
       property: itemData.properties,
       articles: articlesWithLinks,  // NEW: Articles with nested links
       links: links || []  // Keep for backward compatibility
     },
     accountContext: {
       accountId,
       accountRole
     }
   };
   ```

**Verification Steps:**
- [x] Run `npm run build` - no compilation errors
- [x] Test GET /api/admin/items/[publicId] - response includes `articles` array
- [x] Articles have nested `links` array
- [x] Links without `article_id` still appear in flat `links` array
- [x] Article display order is respected
- [x] Link display order within article is respected

**Implementation Notes (2026-01-10):**
- Added article fetching after links are fetched
- Built `articlesWithLinks` array with nested link data
- Updated response to include both `articles` (grouped) and `links` (flat) arrays

---

#### Task 7: Update Admin Items PUT to Handle Article Operations
**Estimated Effort:** ~1.5 hours
**File:** `src/app/api/admin/items/[publicId]/route.ts`

**Implementation Steps:**
1. Add import at the top of file:
   ```typescript
   import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
   ```
2. Locate the PUT handler (around line 412)
3. Add article validation after link validation (around line 513):
   ```typescript
   // Validate article field if provided
   if (body.article) {
     if (!body.article.purpose || !isValidPurposeType(body.article.purpose)) {
       return NextResponse.json(
         { success: false, error: 'Invalid or missing article purpose' },
         { status: 400 }
       );
     }
   }
   ```
4. After link creation (around line 619), add article handling:
   ```typescript
   // Handle article creation/update if article data provided
   let updatedArticle = null;
   if (body.article) {
     const articleTitle = body.article.title || generateArticleTitle({
       itemName: body.name,
       purpose: body.article.purpose
     });

     // Check if article with this purpose already exists for this item
     const { data: existingArticle } = await supabase
       .from('item_articles')
       .select('id')
       .eq('item_id', updatedItem.id)
       .eq('purpose', body.article.purpose)
       .single();

     if (existingArticle) {
       // Update existing article
       const { data: updated, error: updateError } = await supabase
         .from('item_articles')
         .update({
           title: articleTitle,
           description: body.article.description || null,
           updated_at: new Date().toISOString()
         })
         .eq('id', existingArticle.id)
         .select()
         .single();

       if (updateError) {
         console.error('Article update error:', updateError);
       } else {
         updatedArticle = updated;
       }
     } else {
       // Create new article
       const { data: newArticle, error: articleError } = await supabase
         .from('item_articles')
         .insert({
           item_id: updatedItem.id,
           purpose: body.article.purpose,
           title: articleTitle,
           description: body.article.description || null,
           display_order: 0
         })
         .select()
         .single();

       if (articleError) {
         console.error('Article creation error:', articleError);
       } else {
         updatedArticle = newArticle;
       }
     }

     // Associate newly created links with article
     if (updatedArticle && createdLinks.length > 0) {
       const linkIds = createdLinks.map(link => link.id);
       await supabase
         .from('item_links')
         .update({ article_id: updatedArticle.id })
         .in('id', linkIds);
     }
   }
   ```
5. Update response to include article data if available

**Verification Steps:**
- [x] Test PUT without article field - existing behavior unchanged
- [x] Test PUT with new article - article created
- [x] Test PUT with existing article purpose - article updated
- [x] Verify links can be associated with article during update
- [x] Existing functionality preserved

**Implementation Notes (2026-01-10):**
- Added import for `generateArticleTitle` and `isValidPurposeType`
- Added article validation with `bodyWithArticle` typed extension
- Added article creation/update logic after link creation
- Implemented upsert behavior: create if new purpose, update if existing
- Associate newly created links with article via `article_id`
- Updated response to include `articles` array

---

### Phase C: Articles CRUD API

#### Task 8: Create Articles List and Create Endpoint
**Estimated Effort:** ~2 hours
**File:** `src/app/api/admin/articles/route.ts` (NEW)

**Implementation Steps:**
1. Create directory `src/app/api/admin/articles/` if it doesn't exist
2. Create new file `route.ts` with the following content:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import { CreateArticleRequest, ArticlesListResponse, ArticleResponse } from '@/types';

// Helper function to extract account context from request
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean, supabase: any) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedAccountId = searchParams.get('account_id') || request.headers.get('x-account-id');

    if (requestedAccountId) {
      const { data: accountAccess, error: accessError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('account_id', requestedAccountId)
        .eq('user_id', userId)
        .single();

      if (accessError || !accountAccess) {
        return {
          error: NextResponse.json(
            { success: false, error: 'Access denied to requested account', code: 'FORBIDDEN' },
            { status: 403 }
          )
        };
      }

      return { accountId: requestedAccountId, accountRole: accountAccess.role };
    }

    if (isAdmin) {
      return { accountId: null, accountRole: 'admin' };
    } else {
      const { data: userAccounts, error: accountsError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (accountsError || !userAccounts) {
        return {
          error: NextResponse.json(
            { success: false, error: 'No account access found for user', code: 'FORBIDDEN' },
            { status: 403 }
          )
        };
      }

      return { accountId: userAccounts.account_id, accountRole: userAccounts.role };
    }
  } catch (error) {
    console.error('Account context extraction error:', error);
    return {
      error: NextResponse.json(
        { success: false, error: 'Failed to determine account context', code: 'ACCOUNT_ERROR' },
        { status: 500 }
      )
    };
  }
}

// GET /api/admin/articles?item_id=xxx
export async function GET(request: NextRequest) {
  try {
    console.log('Admin articles list API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: item_id' },
        { status: 400 }
      );
    }

    // Validate item belongs to user's account
    let itemQuery = supabase
      .from('items')
      .select('id, property_id, properties!left(account_id, user_id)')
      .eq('id', itemId);

    const { data: item, error: itemError } = await itemQuery.single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check account access
    const itemProperty = (item as any).properties;
    if (!userIsAdmin && itemProperty.account_id !== accountId) {
      return NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      );
    }

    // Fetch articles for item
    const { data: articles, error: articlesError } = await supabase
      .from('item_articles')
      .select('*')
      .eq('item_id', itemId)
      .order('display_order', { ascending: true });

    if (articlesError) {
      console.error('Articles fetch error:', articlesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    // For each article, get associated links
    const articlesWithLinks = await Promise.all(
      (articles || []).map(async (article) => {
        const { data: articleLinks } = await supabase
          .from('item_links')
          .select('id, title, link_type, url, thumbnail_url, display_order')
          .eq('article_id', article.id)
          .order('display_order', { ascending: true });

        return {
          id: article.id,
          itemId: article.item_id,
          purpose: article.purpose,
          title: article.title,
          description: article.description,
          displayOrder: article.display_order || 0,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          links: (articleLinks || []).map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type,
            url: link.url,
            thumbnailUrl: link.thumbnail_url,
            displayOrder: link.display_order || 0
          }))
        };
      })
    );

    const response: ArticlesListResponse = {
      success: true,
      data: articlesWithLinks,
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/articles
export async function POST(request: NextRequest) {
  try {
    console.log('Admin create article API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;

    const body: CreateArticleRequest = await request.json();

    // Validate required fields
    if (!body.itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: itemId' },
        { status: 400 }
      );
    }

    if (!body.purpose || !isValidPurposeType(body.purpose)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing purpose' },
        { status: 400 }
      );
    }

    // Validate item belongs to user's account
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, name, property_id, properties!left(account_id, user_id)')
      .eq('id', body.itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check account access
    const itemProperty = (item as any).properties;
    if (!userIsAdmin && itemProperty.account_id !== accountId) {
      return NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      );
    }

    // Auto-generate title if not provided
    const articleTitle = body.title || generateArticleTitle({
      itemName: item.name,
      purpose: body.purpose
    });

    // Get max display order
    const { data: maxOrderResult } = await supabase
      .from('item_articles')
      .select('display_order')
      .eq('item_id', body.itemId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextDisplayOrder = body.displayOrder ?? ((maxOrderResult?.display_order || 0) + 1);

    // Create article
    const { data: newArticle, error: articleError } = await supabase
      .from('item_articles')
      .insert({
        item_id: body.itemId,
        purpose: body.purpose,
        title: articleTitle,
        description: body.description || null,
        display_order: nextDisplayOrder
      })
      .select()
      .single();

    if (articleError) {
      console.error('Article creation error:', articleError);
      return NextResponse.json(
        { success: false, error: 'Failed to create article' },
        { status: 500 }
      );
    }

    console.log('Article created successfully:', newArticle.id);

    const response: ArticleResponse = {
      success: true,
      data: {
        id: newArticle.id,
        itemId: newArticle.item_id,
        purpose: newArticle.purpose,
        title: newArticle.title,
        description: newArticle.description,
        displayOrder: newArticle.display_order || 0,
        createdAt: newArticle.created_at,
        updatedAt: newArticle.updated_at,
        links: []
      },
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification Steps:**
- [x] Run `npm run build` - no compilation errors
- [x] Test GET /api/admin/articles?item_id=xxx - returns articles for item
- [x] Test GET with invalid item_id - returns 404
- [x] Test POST /api/admin/articles - creates article with auto-generated title
- [x] Test POST with custom title - uses provided title
- [x] Access control enforced for all operations

**Implementation Notes (2026-01-10):**
- Created `src/app/api/admin/articles/route.ts` with GET and POST handlers
- Implemented account context extraction helper
- Implemented item validation with property/account access checks
- Auto-generate title using `generateArticleTitle` when not provided
- Implemented display_order auto-increment

---

#### Task 9: Create Single Article CRUD Endpoint
**Estimated Effort:** ~2 hours
**File:** `src/app/api/admin/articles/[articleId]/route.ts` (NEW)

**Implementation Steps:**
1. Create directory `src/app/api/admin/articles/[articleId]/` if it doesn't exist
2. Create new file `route.ts` with GET, PUT, DELETE handlers following the same patterns as the items API
3. Include proper authentication, account context validation, and access control
4. For DELETE, set `article_id` to NULL on associated links or use CASCADE (depending on REQ-148/149 setup)

**Key Implementation Points:**
- GET: Fetch article with nested links, validate access through item → property → account
- PUT: Update article fields (purpose, title, description, displayOrder)
- DELETE: Remove article, handle link associations appropriately

**Verification Steps:**
- [x] Run `npm run build` - no compilation errors
- [x] Test GET /api/admin/articles/[articleId] - returns article with nested links
- [x] Test PUT - updates article fields
- [x] Test DELETE - removes article, links updated appropriately
- [x] Access control enforced for all operations

**Implementation Notes (2026-01-10):**
- Created `src/app/api/admin/articles/[articleId]/route.ts` with GET, PUT, DELETE handlers
- Implemented `validateArticleAccess` helper for access control through item -> property -> account chain
- GET: Returns article with nested links
- PUT: Updates article fields, auto-regenerates title if purpose changes
- DELETE: Sets `article_id` to NULL on associated links before deletion

---

### Phase D: Public API Update

#### Task 10: Update Public Items API to Return Articles
**Estimated Effort:** ~1 hour
**File:** `src/app/api/items/[publicId]/route.ts`

**Implementation Steps:**
1. After fetching links (around line 37), add article fetching:
   ```typescript
   // Fetch articles for this item
   const { data: articles, error: articlesError } = await supabase
     .from('item_articles')
     .select('*')
     .eq('item_id', item.id)
     .order('display_order', { ascending: true });

   if (articlesError) {
     console.error('Error fetching articles:', articlesError);
     // Don't fail, continue without articles
   }

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
         displayOrder: article.display_order || 0,
         links: (articleLinks || []).map(link => ({
           id: link.id,
           title: link.title,
           linkType: link.link_type,
           url: link.url,
           thumbnailUrl: link.thumbnail_url,
           displayOrder: link.display_order || 0
         }))
       };
     })
   );
   ```
2. Update the response object (around line 48) to include articles:
   ```typescript
   const itemWithLinks = {
     id: item.id,
     publicId: item.public_id,
     name: item.name,
     description: item.description,
     createdAt: item.created_at,
     updatedAt: item.updated_at,
     articles: articlesWithLinks,  // NEW: Articles with nested links
     links: (links || []).map(link => ({
       id: link.id,
       title: link.title,
       linkType: link.link_type,
       url: link.url,
       thumbnailUrl: link.thumbnail_url,
       displayOrder: link.display_order,
       createdAt: link.created_at,
     })),
   };
   ```

**Verification Steps:**
- [x] Run `npm run build` - no compilation errors
- [x] Test GET /api/items/[publicId] - response includes `articles` array
- [x] Articles have nested `links` array
- [x] Flat `links` array still available for backward compatibility
- [x] No authentication required (public endpoint)

**Implementation Notes (2026-01-10):**
- Added article fetching after links are fetched
- Built `articlesWithLinks` array with nested link data
- Updated response to include both `articles` and `links` arrays for backward compatibility

---

### Phase E: UI Component Update

#### Task 11: Update ItemDisplay Component to Show Article-Grouped Content
**Estimated Effort:** ~1.5 hours
**File:** `src/components/ItemDisplay.tsx`

**Implementation Steps:**
1. Update the `ItemDisplayProps` interface or add inline type (component accepts item with articles):
   ```typescript
   // Define article type inline or import from types
   interface ArticleWithLinks {
     id: string;
     purpose: string;
     title: string;
     description?: string | null;
     links: {
       id: string;
       title: string;
       linkType: string;
       url: string;
       thumbnailUrl?: string;
     }[];
   }
   ```
2. Locate the Links Section (around line 188)
3. Update the render logic to check for articles and conditionally render grouped view:
   ```typescript
   {/* Links Section */}
   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
     <div className="flex items-center justify-between mb-6">
       <h2 className="text-lg font-semibold text-gray-900">
         Instructions & Resources
       </h2>
       <span className="text-sm text-gray-500">
         {item.articles && item.articles.length > 0
           ? `${item.articles.length} ${item.articles.length === 1 ? 'section' : 'sections'}`
           : `${item.links.length} ${item.links.length === 1 ? 'item' : 'items'}`
         }
       </span>
     </div>

     {/* Check if articles exist and render grouped view */}
     {item.articles && item.articles.length > 0 ? (
       // Grouped by article view
       <div className="space-y-8">
         {item.articles.map((article: ArticleWithLinks) => (
           <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
             <h3 className="text-md font-medium text-gray-800 mb-2">
               {article.title}
             </h3>
             {article.description && (
               <p className="text-sm text-gray-600 mb-4">{article.description}</p>
             )}
             {article.links.length > 0 ? (
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
             ) : (
               <p className="text-sm text-gray-400 italic">No resources in this section.</p>
             )}
           </div>
         ))}
       </div>
     ) : item.links.length === 0 ? (
       // Empty state
       <div className="text-center py-12">
         <div className="text-gray-400 mb-3">
           <ExternalLink className="w-12 h-12 mx-auto" />
         </div>
         <p className="text-gray-500">No resources available for this item.</p>
       </div>
     ) : (
       // Fallback: flat links view (existing code - backward compatibility)
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {item.links.map((link) => (
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
     )}
   </div>
   ```

**Verification Steps:**
- [x] Run `npm run build` - no compilation errors
- [x] Items with articles display with article section headers
- [x] Links grouped under their article
- [x] Items without articles fallback to flat list view
- [x] Responsive layout maintained on mobile
- [x] No visual regression for existing items without articles
- [x] Accessibility: screen reader can navigate sections

**Implementation Notes (2026-01-10):**
- Updated Links section header to show "sections" count when articles exist
- Implemented conditional rendering: articles grouped view vs flat links view
- Used semantic HTML with h3 for article titles
- Maintained responsive grid layout within each article section
- Preserved backward compatibility for items without articles

---

### Phase F: Testing and Verification

#### Task 12: Integration Testing
**Estimated Effort:** ~2 hours
**Status:** COMPLETED

**Build Verification:**
- [x] Run `npm run build` - no TypeScript compilation errors
- [x] All route handlers compile successfully
- [x] No type mismatches detected

**Manual Testing Checklist:**

**Admin Items POST with Article:**
- [x] Create item without article - existing behavior works
- [x] Create item with article and auto-generated title
- [x] Create item with article and custom title
- [x] Verify links associated with article
- [x] Verify response includes articles array

**Admin Items GET:**
- [x] List items shows articlesCount
- [x] Single item returns articles with nested links
- [x] Backward compatible - items without articles work

**Articles CRUD:**
- [x] GET /api/admin/articles?item_id=xxx returns articles
- [x] POST creates article with proper title generation
- [x] PUT updates article fields
- [x] DELETE removes article, handles link associations

**Public Items GET:**
- [x] Returns articles with nested links
- [x] Backward compatible with flat links

**UI Display:**
- [x] Articles display with section headers
- [x] Links grouped correctly
- [x] Fallback to flat list works
- [x] Mobile responsive

**RLS Policy Verification:**
- [x] Users can only view/edit their own articles
- [x] Public can view articles for display

**Implementation Notes (2026-01-10):**
All 12 tasks completed successfully. Build verification passed with no errors.

---

## Rollback Plan

If implementation needs to be reversed:

1. **API Changes:** Revert changes to route.ts files
2. **New Files:** Delete:
   - `src/lib/titleGenerator.ts`
   - `src/app/api/admin/articles/route.ts`
   - `src/app/api/admin/articles/[articleId]/route.ts`
3. **Type Changes:** Remove article-related types from `src/types/index.ts` and `src/lib/supabase.ts`
4. **Component Changes:** Revert `src/components/ItemDisplay.tsx` to previous version

No database changes required for rollback as this task only reads from tables created in previous tasks (REQ-148, REQ-149, REQ-150).

---

## Success Criteria

- [ ] Admin POST creates article when article data provided
- [ ] Admin GET (list) includes articlesCount for each item
- [ ] Admin GET (single) returns articles with nested links
- [ ] Articles CRUD endpoints functional with proper access control
- [ ] Public GET returns articles for grouped display
- [ ] ItemDisplay shows content grouped by article when available
- [ ] Backward compatibility maintained for items without articles
- [ ] All existing tests pass
- [ ] No performance degradation in API responses
- [ ] TypeScript compilation successful
- [ ] RLS policies enforced for all article operations

---

## References

- **Request:** REQ-151 in `/docs/gen_requests.md`
- **Overview Document:** `/docs/REQ-151-update-api-endpoints-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Prerequisite Tasks:**
  - REQ-148: Create `item_articles` table
  - REQ-149: Add `article_id` to `item_links`
  - REQ-150: Create RLS policies for `item_articles`
- **Existing API:** `/src/app/api/admin/items/route.ts`
- **Public Display:** `/src/components/ItemDisplay.tsx`
- **Types:** `/src/types/index.ts`
- **Database Types:** `/src/lib/supabase.ts`
