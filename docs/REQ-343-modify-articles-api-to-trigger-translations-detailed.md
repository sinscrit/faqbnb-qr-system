# REQ-343: Modify Articles API to Trigger Translations - Detailed Implementation Tasks
*Generated: 2026-01-19 16:30:00 UTC*
*Last Modified: 2026-01-19 16:30:00 UTC*

## Reference
- **Request**: REQ-343
- **Source**: docs/gen_requests_epic3.md
- **Overview Document**: docs/REQ-343-modify-articles-api-to-trigger-translations-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: Enhancement
- **Phase**: 2 - Modify Existing Content APIs
- **Task ID**: 2.3
- **Size**: M (Medium)

## Summary
Modify the Articles API endpoints to automatically trigger translation workflows when articles are created or updated. The POST handler accepts an optional `sourceLanguage` parameter and queues translations after successful creation. The PUT handler deletes existing translations before update and queues fresh translations based on updated content. All translation operations execute asynchronously and do not block article CRUD operations.

## Dependencies (Must be Completed First)
- **REQ-338**: Content Translation Module Structure (provides module exports)
- **REQ-339**: Content Translation Orchestrator (provides `queueContentTranslations()`)
- **REQ-340**: Entity-Specific Translation Triggers (provides `triggerArticleTranslation()`)
- **REQ-342**: Source Language Detection (provides `detectSourceLanguage()`)
- **Epic 1 Foundation**: Translation tables and translation service must exist

---

## Task Breakdown

### Task 1: Update TypeScript Types for Article API
**File**: `/src/types/index.ts`
**Story Points**: 1
**Dependencies**: None

#### Description
Add `sourceLanguage` field to article request interfaces and `translationJobIds` field to article response interface to support translation workflow.

#### Acceptance Criteria
- [ ] `CreateArticleRequest` interface includes optional `sourceLanguage?: string` field
- [ ] `UpdateArticleRequest` interface includes optional `sourceLanguage?: string` field
- [ ] `ItemArticle` interface includes optional `translationJobIds?: string[]` field
- [ ] TypeScript compilation succeeds without errors
- [ ] No breaking changes to existing API contracts

#### Implementation Details

**Step 1.1: Update CreateArticleRequest Interface**
Location: `/src/types/index.ts` (lines 243-262)

Add the `sourceLanguage` field to the interface:
```typescript
export interface CreateArticleRequest {
  /** Item ID this article belongs to */
  itemId: string;
  /** Purpose/intent category */
  purpose: PurposeType;
  /** Article title (typically auto-generated from purpose + item name) */
  title?: string;
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
  /** Optional source language for translation (defaults to user's preferred language) */
  sourceLanguage?: string;  // ADD THIS LINE
}
```

**Step 1.2: Update UpdateArticleRequest Interface**
Location: `/src/types/index.ts` (lines 267-287)

Add the `sourceLanguage` field to the interface:
```typescript
export interface UpdateArticleRequest {
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
  /** Optional: Update item's tags (REQ-214) */
  itemTags?: string[];
  /** Optional source language for translation (defaults to user's preferred language) */
  sourceLanguage?: string;  // ADD THIS LINE
}
```

**Step 1.3: Update ItemArticle Interface**
Location: `/src/types/index.ts` (lines 106-122)

Add the `translationJobIds` field:
```typescript
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
  // REQ-212: Item data included when listing articles by property_id
  item?: {
    id: string;
    name: string;
    tags: string[];
  };
  /** Translation job IDs queued for this article (REQ-343) */
  translationJobIds?: string[];  // ADD THIS LINE
}
```

#### Verification
```bash
# Run TypeScript compilation
npx tsc --noEmit

# Verify no errors related to type changes
```

---

### Task 2: Add Imports to POST Handler File
**File**: `/src/app/api/admin/articles/route.ts`
**Story Points**: 1
**Dependencies**: Task 1, REQ-338, REQ-339, REQ-342

#### Description
Add the necessary imports for content translation module functions to the articles route.ts file.

#### Acceptance Criteria
- [ ] Import statement for `queueContentTranslations` is added
- [ ] Import statement for `detectSourceLanguage` is added
- [ ] Import statement for `QueueTranslationResult` type is added
- [ ] Imports are placed at the top of the file with other imports
- [ ] No import errors or unresolved modules

#### Implementation Details

**Step 2.1: Add Content Translation Imports**
Location: `/src/app/api/admin/articles/route.ts` (after line 12)

Add the following import after the existing imports:
```typescript
// Existing imports (lines 9-12)
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import { CreateArticleRequest, ArticlesListResponse, ArticleResponse } from '@/types';

// REQ-343: Content translation imports
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

#### Verification
```bash
# Verify imports resolve correctly
npx tsc --noEmit src/app/api/admin/articles/route.ts
```

---

### Task 3: Modify POST Handler to Queue Translations
**File**: `/src/app/api/admin/articles/route.ts`
**Story Points**: 3
**Dependencies**: Task 1, Task 2

#### Description
Enhance the POST handler to trigger translations after successful article creation. The handler should extract sourceLanguage from the request body, queue translations for all target languages after article creation, and include translationJobIds in the response.

#### Acceptance Criteria
- [ ] POST handler extracts `sourceLanguage` from request body
- [ ] After successful article creation, `queueContentTranslations` is called
- [ ] Uses `detectSourceLanguage` when sourceLanguage not provided in request
- [ ] Translation jobs are queued for both `title` and `description` fields
- [ ] `translationJobIds` is included in success response
- [ ] Article creation succeeds even if translation queueing fails
- [ ] Translation errors are logged for debugging
- [ ] Internal translation errors are not exposed to client

#### Implementation Details

**Step 3.1: Extract sourceLanguage from Request Body**
Location: After parsing the request body (after line 296)

The body is already typed as `CreateArticleRequest`, so `sourceLanguage` will be available if provided.

**Step 3.2: Add Translation Queueing Logic After Article Creation**
Location: After line 374 (after `console.log('Article created successfully:', newArticle.id);`)

Add the translation queueing block:
```typescript
console.log('Article created successfully:', newArticle.id);

// REQ-343: Queue translations for the new article
let translationJobIds: string[] = [];
try {
  // Determine source language: use provided value, or detect from user/account preferences
  const sourceLanguage = body.sourceLanguage ||
    detectSourceLanguage(user, null, undefined);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'article',
      entityId: newArticle.id,
      sourceLanguage,
      fields: [
        {
          fieldName: 'title',
          value: articleTitle,
          context: {
            contentType: 'article_title',
            domainContext: 'property_rental_instructions'
          },
          maxLength: 255
        },
        {
          fieldName: 'description',
          value: body.description || '',
          context: {
            contentType: 'article_description',
            domainContext: 'property_rental_instructions'
          }
        }
      ]
    },
    trigger: 'create'
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for article ${newArticle.id}`);
  } else {
    console.error('Article translation queueing failed:', translationResult.error);
  }
} catch (translationError) {
  // Log error but don't fail the article creation
  console.error('Error queueing article translations:', translationError);
  // translationJobIds remains empty array
}
```

**Step 3.3: Update Response to Include translationJobIds**
Location: Modify the response object (lines 376-392)

Update the response to include translationJobIds:
```typescript
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
    links: [],
    translationJobIds  // REQ-343: Include queued translation job IDs
  },
  accountContext: { accountId, accountRole }
};
```

#### Verification
```bash
# Test article creation triggers translations
curl -X POST http://localhost:3000/api/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemId": "test-item-uuid",
    "purpose": "how-to-use",
    "title": "How to Use Coffee Maker",
    "description": "Step by step instructions..."
  }'

# Expected: Response includes translationJobIds array
# Verify in database: translation_jobs table has new records
```

---

### Task 4: Add Imports to PUT Handler File
**File**: `/src/app/api/admin/articles/[articleId]/route.ts`
**Story Points**: 1
**Dependencies**: Task 1, REQ-338, REQ-339, REQ-342

#### Description
Add the necessary imports for content translation module functions to the [articleId]/route.ts file.

#### Acceptance Criteria
- [ ] Import statement for `queueContentTranslations` is added
- [ ] Import statement for `detectSourceLanguage` is added
- [ ] Import statement for `QueueTranslationResult` type is added
- [ ] Imports are placed at the top of the file with other imports
- [ ] No import errors or unresolved modules

#### Implementation Details

**Step 4.1: Add Content Translation Imports**
Location: `/src/app/api/admin/articles/[articleId]/route.ts` (after line 13)

Add the following import after the existing imports:
```typescript
// Existing imports (lines 10-13)
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import { UpdateArticleRequest, ArticleResponse, PurposeType, LinkType } from '@/types';

// REQ-343: Content translation imports
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

#### Verification
```bash
# Verify imports resolve correctly
npx tsc --noEmit src/app/api/admin/articles/[articleId]/route.ts
```

---

### Task 5: Add Translation Deletion Logic to PUT Handler
**File**: `/src/app/api/admin/articles/[articleId]/route.ts`
**Story Points**: 2
**Dependencies**: Task 4

#### Description
Add logic to delete existing article translations before updating the article. This ensures that stale translations are removed and fresh translations will be queued.

#### Acceptance Criteria
- [ ] Existing translations are deleted from `article_translations` table before update
- [ ] Deletion uses the article's UUID to identify records
- [ ] Translation deletion failure does not block article update
- [ ] Deletion errors are logged for debugging

#### Implementation Details

**Step 5.1: Add Translation Deletion Before Article Update**
Location: `/src/app/api/admin/articles/[articleId]/route.ts` (before line 303 - before "Update article" section)

Add the deletion logic after the update data preparation:
```typescript
if (body.displayOrder !== undefined) {
  updateData.display_order = body.displayOrder;
}

// REQ-343: Delete existing translations before update
// This ensures stale translations are removed before queueing new ones
const { error: deleteTranslationsError } = await supabase
  .from('article_translations')
  .delete()
  .eq('article_id', articleId);

if (deleteTranslationsError) {
  // Log error but don't fail the update - translations can be manually retriggered
  console.error('Failed to delete existing article translations:', deleteTranslationsError);
}

// Update article
const { data: updatedArticle, error: updateError } = await supabase
// ... existing code
```

#### Verification
```sql
-- Before updating an article, verify existing translations
SELECT * FROM article_translations WHERE article_id = 'test-article-uuid';

-- After PUT request, verify translations are deleted
SELECT * FROM article_translations WHERE article_id = 'test-article-uuid';
-- Expected: No rows returned (will be repopulated by job processor)
```

---

### Task 6: Modify PUT Handler to Queue Translations
**File**: `/src/app/api/admin/articles/[articleId]/route.ts`
**Story Points**: 3
**Dependencies**: Task 4, Task 5

#### Description
Enhance the PUT handler to queue new translations after successful article update. The handler should extract sourceLanguage from the request body, queue translations for all target languages, and include translationJobIds in the response.

#### Acceptance Criteria
- [ ] PUT handler extracts `sourceLanguage` from request body
- [ ] After successful article update, `queueContentTranslations` is called
- [ ] Uses `detectSourceLanguage` when sourceLanguage not provided in request
- [ ] Translation jobs are queued with trigger type 'update' (priority 50)
- [ ] `translationJobIds` is included in success response
- [ ] Article update succeeds even if translation queueing fails
- [ ] Translation errors are logged for debugging

#### Implementation Details

**Step 6.1: Add Translation Queueing Logic After Article Update**
Location: After line 396 (after `console.log('Article updated successfully:', updatedArticle.id);`)

Add the translation queueing block:
```typescript
console.log('Article updated successfully:', updatedArticle.id);

// REQ-343: Queue translations for the updated article
let translationJobIds: string[] = [];
try {
  // Determine source language: use provided value, or detect from user/account preferences
  const sourceLanguage = body.sourceLanguage ||
    detectSourceLanguage(user, null, undefined);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'article',
      entityId: updatedArticle.id,
      sourceLanguage,
      fields: [
        {
          fieldName: 'title',
          value: updatedArticle.title || '',
          context: {
            contentType: 'article_title',
            domainContext: 'property_rental_instructions'
          },
          maxLength: 255
        },
        {
          fieldName: 'description',
          value: updatedArticle.description || '',
          context: {
            contentType: 'article_description',
            domainContext: 'property_rental_instructions'
          }
        }
      ]
    },
    trigger: 'update'  // Lower priority (50) than create (100)
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for updated article ${updatedArticle.id}`);
  } else {
    console.error('Article translation queueing failed:', translationResult.error);
  }
} catch (translationError) {
  // Log error but don't fail the article update
  console.error('Error queueing article translations:', translationError);
  // translationJobIds remains empty array
}
```

**Step 6.2: Update Response to Include translationJobIds**
Location: Modify the response object (lines 398-422)

Update the response to include translationJobIds:
```typescript
const response: ArticleResponse = {
  success: true,
  data: {
    id: updatedArticle.id,
    itemId: updatedArticle.item_id,
    purpose: updatedArticle.purpose as PurposeType,
    title: updatedArticle.title || '',
    description: updatedArticle.description || null,
    displayOrder: updatedArticle.display_order || 0,
    createdAt: updatedArticle.created_at || '',
    updatedAt: updatedArticle.updated_at || '',
    links: (articleLinks || []).map(link => ({
      id: link.id,
      item_id: updatedArticle.item_id,
      article_id: updatedArticle.id,
      title: link.title,
      link_type: link.link_type as LinkType,
      url: link.url,
      thumbnail_url: link.thumbnail_url,
      display_order: link.display_order || 0,
      created_at: link.created_at || new Date().toISOString()
    })),
    translationJobIds  // REQ-343: Include queued translation job IDs
  },
  accountContext: { accountId, accountRole }
};
```

#### Verification
```bash
# Test article update triggers translations
curl -X PUT http://localhost:3000/api/admin/articles/test-article-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated: How to Use Coffee Maker",
    "description": "Updated step by step instructions..."
  }'

# Expected: Response includes translationJobIds array
# Verify in database:
# 1. article_translations should be empty (deleted before update)
# 2. translation_jobs should have new records with priority 50
```

---

### Task 7: Verification and Integration Testing
**File**: N/A (Testing)
**Story Points**: 2
**Dependencies**: Tasks 1-6

#### Description
Verify the complete implementation by testing article creation and update workflows, ensuring translations are properly queued and the API behaves correctly in success and failure scenarios.

#### Acceptance Criteria
- [ ] TypeScript compilation succeeds without errors
- [ ] POST handler queues translations for new articles
- [ ] PUT handler deletes old translations and queues new ones
- [ ] API responses include translationJobIds field
- [ ] Main operations succeed even when translation queueing fails
- [ ] Error logs are generated for translation failures
- [ ] Database contains correct translation_jobs records

#### Verification Checklist

**7.1: TypeScript Compilation**
```bash
npx tsc --noEmit
```

**7.2: Test Article Creation Flow**
```bash
# Create a new article
curl -X POST http://localhost:3000/api/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemId": "existing-item-uuid",
    "purpose": "how-to-use",
    "title": "Test Article",
    "description": "Test description for translation",
    "sourceLanguage": "en"
  }'

# Verify response includes translationJobIds
# Verify translation_jobs table has 5 new records (one per target language)
```

**7.3: Test Article Update Flow**
```bash
# Update the article
curl -X PUT http://localhost:3000/api/admin/articles/new-article-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated Test Article",
    "description": "Updated test description"
  }'

# Verify:
# 1. Response includes translationJobIds
# 2. Old article_translations records were deleted
# 3. New translation_jobs records created with priority 50
```

**7.4: Test Error Handling**
```bash
# Simulate translation service unavailable (if possible in dev)
# Verify article creation/update still succeeds
# Verify error is logged but not exposed to client
```

**7.5: Database Verification Queries**
```sql
-- Check translation jobs for a specific article
SELECT
  id,
  entity_type,
  entity_id,
  source_language,
  target_language,
  status,
  priority,
  created_at
FROM translation_jobs
WHERE entity_type = 'article'
  AND entity_id = 'article-uuid'
ORDER BY created_at DESC;

-- Expected: 5 records (one per target language: fr, es, de, nl, it for English source)
-- Priority should be 100 for create, 50 for update

-- Verify article_translations cleared on update
SELECT * FROM article_translations WHERE article_id = 'article-uuid';
-- Expected: Empty until job processor runs
```

---

## Files Modified Summary

| File | Changes | Task |
|------|---------|------|
| `/src/types/index.ts` | Add `sourceLanguage` to request types, `translationJobIds` to response type | Task 1 |
| `/src/app/api/admin/articles/route.ts` | Add imports, translation queueing in POST handler | Tasks 2, 3 |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Add imports, translation deletion and queueing in PUT handler | Tasks 4, 5, 6 |

## Dependencies Summary

### External Dependencies (Must Exist)
- `/src/lib/content-translation/index.ts` - Module exports
- `/src/lib/content-translation/content-translation.ts` - `queueContentTranslations` function
- `/src/lib/content-translation/source-language.ts` - `detectSourceLanguage` function
- `article_translations` table - Database table for storing translations
- `translation_jobs` table - Database table for job queue

### Import Dependencies
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Non-blocking approach ensures main operations always succeed
  - Additive changes only - no breaking changes to existing API
  - Well-established patterns from similar tasks (REQ-342 Items API)
  - Comprehensive error handling and logging
  - Translations can be retried via separate retry endpoint

## Notes

### Backward Compatibility
- `sourceLanguage` is optional - existing clients continue to work
- `translationJobIds` is optional in response - existing clients can ignore it
- No breaking changes to existing API contracts

### Performance Considerations
- Translation queueing is fast (just database inserts)
- Actual translation happens asynchronously via job processor
- API response time not significantly impacted

### Key Differences from Items API (REQ-342)
- Article entity has `title` and `description` fields
- Article translation context uses 'article_title' and 'article_description' content types
- Articles are child entities of items (item_id FK relationship)
- Route uses `[articleId]` param vs `[publicId]` for items

### Error Scenarios Handled
1. Translation module not available - logged, article operation succeeds
2. Database error queueing jobs - logged, article operation succeeds
3. Invalid source language - detected via fallback chain
4. Missing description - empty string translated (valid operation)
