# REQ-343: Modify Articles API to Trigger Translations - Implementation Overview
*Generated: 2026-01-19 15:45:00 UTC*
*Last Modified: 2026-01-19 15:45:00 UTC*

## Reference
- **Request**: REQ-343 (Modify Articles API to Trigger Translations)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: Enhancement
- **Phase**: 2 - Modify Existing Content APIs
- **Task ID**: 2.3
- **Size**: M

## Goals
1. Modify the Articles API POST handler to accept optional `sourceLanguage` in request body
2. After successful article creation, call `queueContentTranslations` to queue translations for all target languages
3. Include `translationJobIds` in POST response
4. Modify the Articles API PUT handler to delete existing translations before update
5. After successful article update, queue new translations and include `translationJobIds` in PUT response
6. Ensure translation queueing failures do not block article CRUD operations
7. Log translation queueing errors for debugging without failing the main operation

## Context from Implementation Plan

### Task Description (Task 2.3)
Per the implementation plan, this task modifies the Articles API to automatically trigger translations:

```
- [ ] **Task 2.3:** Modify Articles API to trigger translations
  - File: `/src/app/api/admin/articles/route.ts`
  - **POST handler:**
    - Accept optional `sourceLanguage` in request body
    - After successful article creation, call `queueContentTranslations`
  - **PUT/PATCH handler (in [id]/route.ts):**
    - Delete existing article translations
    - Queue new translations
```

### Task Dependencies
- **Task 2.1** (Source Language Detection): Must be completed first - provides `detectSourceLanguage()` utility
- **Task 1.2** (Content Translation Orchestrator): Must be completed first - provides `queueContentTranslations()` function
- **Task 1.1** (Content Translation Types): Must be completed first - provides type definitions
- **Task 1.3** (Entity-Specific Triggers): Provides `triggerArticleTranslation()` function
- **Epic 1** (Foundation): Translation tables and translation service must exist

### Related Tasks
- **Task 2.2** (Items API Translations): Uses identical pattern - reference implementation
- **Task 2.4** (Links API Translations): Will follow same pattern

### Data Flow (From Implementation Plan)
```
Article Save Request
    │
    ▼
API Route (articles/route.ts or articles/[articleId]/route.ts)
    │
    ├── 1. Save article with source_language
    │
    ├── 2. Delete existing translations (if update)
    │
    ├── 3. Queue translation jobs (5 target languages)
    │       │
    │       └── Insert into translation_jobs table
    │           - entity_type: 'article'
    │           - entity_id: UUID
    │           - source_language: detected from user/account
    │           - target_language: each of 5 other languages
    │           - status: 'queued'
    │           - priority: based on job type
    │
    └── 4. Return success immediately
            │
            └── Response includes translationJobIds
```

## Implementation Order

### Step 1: Update TypeScript Types
Add `sourceLanguage` to CreateArticleRequest and `translationJobIds` to ArticleResponse in `/src/types/index.ts`.

**Changes:**
- Add optional `sourceLanguage?: string` field to `CreateArticleRequest` interface
- Add optional `sourceLanguage?: string` field to `UpdateArticleRequest` interface
- Add optional `translationJobIds?: string[]` field to `ArticleResponse.data` structure (via ItemArticle interface)

### Step 2: Modify POST Handler in `/src/app/api/admin/articles/route.ts`
Enhance the POST handler to trigger translations after article creation.

**Changes:**
1. Import `queueContentTranslations` from `@/lib/content-translation`
2. Import `detectSourceLanguage` from `@/lib/content-translation`
3. Extract `sourceLanguage` from request body
4. After successful article creation (after line 372), call `queueContentTranslations()`
5. Add `translationJobIds` to response
6. Wrap translation logic in try-catch to prevent blocking main operation
7. Log errors for debugging without failing the article creation

### Step 3: Modify PUT Handler in `/src/app/api/admin/articles/[articleId]/route.ts`
Enhance the PUT handler to delete existing translations and queue new ones.

**Changes:**
1. Import `queueContentTranslations` from `@/lib/content-translation`
2. Import `detectSourceLanguage` from `@/lib/content-translation`
3. Before updating article, delete existing translations from `article_translations` table
4. Extract `sourceLanguage` from request body (if provided)
5. After successful article update (after line 396), call `queueContentTranslations()`
6. Add `translationJobIds` to response
7. Wrap translation logic in try-catch to prevent blocking main operation
8. Log errors for debugging without failing the article update

### Step 4: Verification
- Run TypeScript compilation to verify no errors
- Test article creation triggers translation jobs
- Test article update deletes old translations and creates new jobs
- Verify main operations succeed even if translation queueing fails

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/types/index.ts`
- **Purpose**: Add translation-related fields to API request/response types
- **Interfaces to modify**:
  - `CreateArticleRequest` interface (lines 243-262) - Add `sourceLanguage?: string` field
  - `UpdateArticleRequest` interface (lines 267-287) - Add `sourceLanguage?: string` field
  - `ItemArticle` interface (lines 106-122) - Add `translationJobIds?: string[]` field
  - `ArticleResponse` interface (lines 289-297) - Response already uses ItemArticle type

#### `/src/app/api/admin/articles/route.ts`
- **Purpose**: Trigger translations after article creation
- **Functions to modify**:
  - `POST` handler function (lines 276-401)
    - Add imports for content-translation module (after line 12)
    - Extract sourceLanguage from request body (after line 296)
    - Add translation queueing logic after article creation (after line 372)
    - Include translationJobIds in response (lines 376-392)

#### `/src/app/api/admin/articles/[articleId]/route.ts`
- **Purpose**: Delete existing translations and trigger new ones after article update
- **Functions to modify**:
  - `PUT` handler function (lines 228-433)
    - Add imports for content-translation module (after line 13)
    - Add logic to delete existing article_translations before update (after line 302)
    - Extract sourceLanguage from request body (after line 269)
    - Add translation queueing logic after article update (after line 396)
    - Include translationJobIds in response (lines 398-422)

### New Dependencies to Import

```typescript
// In both route files, add these imports at the top:
import {
  queueContentTranslations,
  detectSourceLanguage,
  type QueueTranslationResult
} from '@/lib/content-translation';
```

### Database Operations

#### Translation Deletion (PUT handler only)
```typescript
// Delete existing translations for this article before update
const { error: deleteTranslationsError } = await supabase
  .from('article_translations')
  .delete()
  .eq('article_id', articleId);

if (deleteTranslationsError) {
  console.error('Failed to delete existing article translations:', deleteTranslationsError);
  // Continue with update - don't fail the main operation
}
```

#### Translation Queueing (Both handlers)
```typescript
// Queue translations for all target languages
let translationJobIds: string[] = [];
try {
  const sourceLanguage = body.sourceLanguage ||
    detectSourceLanguage(user, accountContext, undefined);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'article',
      entityId: newArticle.id, // or updatedArticle.id for PUT
      sourceLanguage,
      fields: [
        {
          fieldName: 'title',
          value: newArticle.title,
          context: { contentType: 'article_title', domainContext: 'property_rental_instructions' },
          maxLength: 255
        },
        {
          fieldName: 'description',
          value: newArticle.description || '',
          context: { contentType: 'article_description', domainContext: 'property_rental_instructions' }
        }
      ]
    },
    trigger: 'create' // or 'update' for PUT
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    console.log(`Queued ${translationJobIds.length} translation jobs for article ${newArticle.id}`);
  } else {
    console.error('Article translation queueing failed:', translationResult.error);
  }
} catch (translationError) {
  console.error('Error queueing article translations:', translationError);
  // Don't fail the article creation/update - translations can be retried later
}
```

### Existing Files (Read-Only Reference)
These files will be imported from but NOT modified:
- `/src/lib/content-translation/index.ts` - Module exports
- `/src/lib/content-translation/content-translation.ts` - queueContentTranslations function
- `/src/lib/content-translation/source-language.ts` - detectSourceLanguage function
- `/src/lib/content-translation/triggers/article-trigger.ts` - triggerArticleTranslation function

## Technical Specifications

### Request Body Extension (POST/PUT)
```typescript
// Extended CreateArticleRequest (existing interface in /src/types/index.ts)
interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
  links?: {...}[];
  // NEW: Optional source language for translation
  sourceLanguage?: string;
}

// Extended UpdateArticleRequest
interface UpdateArticleRequest {
  purpose?: PurposeType;
  title?: string;
  description?: string | null;
  displayOrder?: number;
  links?: {...}[];
  itemTags?: string[];
  // NEW: Optional source language for translation
  sourceLanguage?: string;
}
```

### Response Extension
```typescript
// Extended ItemArticle (used by ArticleResponse)
interface ItemArticle {
  id: string;
  itemId: string;
  purpose: PurposeType;
  title: string;
  description?: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  links?: ItemLink[];
  item?: {...};
  // NEW: Translation job tracking
  translationJobIds?: string[];
}
```

### Translation Context (From Implementation Plan)
```typescript
const TRANSLATION_CONTEXTS = {
  article_title: {
    contentType: 'article_title' as const,
    domainContext: 'property_rental_instructions',
    systemPrompt: 'Translate the title of an instruction article for vacation rental guests. Format: "[How to/Safety/etc] - [Item Name]"'
  },
  article_description: {
    contentType: 'article_description' as const,
    domainContext: 'property_rental_instructions',
    systemPrompt: 'Translate instruction content for vacation rental guests. Keep instructions clear and actionable.'
  }
};
```

### Supported Languages
Per Epic 1 configuration:
- English (en) - default
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

Source language is excluded from target languages (5 translations per article).

### Fields to Translate
Articles contain two translatable fields:
1. **title** - Article title (typically auto-generated from purpose + item name)
2. **description** - Article content/instructions

Note: `purpose` field is an enum and not translated (how-to-use, how-to-clean, troubleshooting, etc.)

## Success Validation Checklist

### Type Updates
- [ ] `CreateArticleRequest` includes optional `sourceLanguage` field
- [ ] `UpdateArticleRequest` includes optional `sourceLanguage` field
- [ ] `ItemArticle` includes optional `translationJobIds` field
- [ ] TypeScript compilation succeeds without errors

### POST Handler (/api/admin/articles)
- [ ] Accepts `sourceLanguage` in request body
- [ ] Creates article successfully before queueing translations
- [ ] Calls `queueContentTranslations` after article creation
- [ ] Uses `detectSourceLanguage` when sourceLanguage not provided
- [ ] Includes `translationJobIds` in success response
- [ ] Article creation succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging
- [ ] Does not expose internal errors to client

### PUT Handler (/api/admin/articles/[articleId])
- [ ] Accepts `sourceLanguage` in request body
- [ ] Deletes existing article_translations before update
- [ ] Translation deletion failure doesn't block update
- [ ] Updates article successfully before queueing translations
- [ ] Calls `queueContentTranslations` after article update
- [ ] Uses `detectSourceLanguage` when sourceLanguage not provided
- [ ] Includes `translationJobIds` in success response
- [ ] Article update succeeds even if translation queueing fails
- [ ] Logs translation errors for debugging

### Database Verification
- [ ] article_translations records are deleted on article update
- [ ] translation_jobs records are created for each target language
- [ ] Job records have correct entity_type='article'
- [ ] Job records have correct entity_id matching article.id
- [ ] Job records have appropriate priority (100 for create, 50 for update)

## Error Handling Strategy

### Translation Failures Should NOT Block Article Operations
```typescript
// Pattern to follow:
try {
  // Translation queueing logic
} catch (translationError) {
  // Log error for debugging
  console.error('Article translation queueing error:', translationError);
  // Continue with success response - article was saved
  // translationJobIds will be empty array
}
```

### Response Always Includes translationJobIds
```typescript
// Even on translation failure, include the field
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
    translationJobIds: translationJobIds // May be empty array
  },
  accountContext: { accountId, accountRole }
};
```

## Notes

### Backward Compatibility
- `sourceLanguage` is optional - existing clients continue to work
- `translationJobIds` is optional in response - existing clients can ignore it
- No breaking changes to existing API contracts

### Performance Considerations
- Translation queueing is fast (just inserts to job queue)
- Actual translation happens asynchronously via job processor
- API response time not significantly impacted

### Key Differences from Items API (REQ-342)
- Article entity has `title` and `description` fields (vs `name` and `description` for items)
- Article translation context uses 'article_title' and 'article_description' content types
- Articles are child entities of items (item_id FK relationship)
- Route uses `[articleId]` param vs `[publicId]` for items

### Testing Approach
Per implementation plan Task 7.3:
- Integration tests for article creation with translations
- Verify jobs are created in translation_jobs table
- Verify translations are deleted before update
- Test with various article purposes (how-to-use, troubleshooting, etc.)

## Dependencies
- Epic 1 Foundation: Translation tables, translation service (REQUIRED)
- Task 1.1: Content Translation Types (REQUIRED)
- Task 1.2: Content Translation Orchestrator (REQUIRED)
- Task 1.3: Entity-Specific Translation Triggers (REQUIRED - article-trigger.ts)
- Task 2.1: Source Language Detection (REQUIRED)
- Next.js 15.5.9, TypeScript 5.x (existing in project)
- Supabase client for database operations (existing in project)

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Non-blocking approach means main operations always succeed
  - Existing API contracts preserved with additive changes only
  - Well-established patterns from Items API (REQ-342) to follow
  - Translation can be retried via retry endpoint
  - Comprehensive error logging for debugging
  - No changes to authentication or authorization logic

## Acceptance Criteria Mapping (From PRD/Request)

| PRD Criteria | Implementation |
|--------------|----------------|
| AC-1: New article triggers translation to 5 languages | POST handler calls queueContentTranslations |
| AC-1: Source language is recorded correctly | detectSourceLanguage utility + optional override |
| AC-2: Updated content re-triggers translation | PUT handler calls queueContentTranslations |
| AC-2: Old translations are replaced | PUT handler deletes existing article_translations |
| AC-2: Update doesn't block user action | try-catch wrapper, non-blocking approach |
| Source language defaults appropriately | detectSourceLanguage fallback chain |
| Errors in queueing do not prevent CRUD | try-catch isolation in both handlers |
