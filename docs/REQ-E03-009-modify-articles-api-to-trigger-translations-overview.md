# Implementation Overview: REQ-E03-009 - Modify Articles API to Trigger Translations

**Request ID:** REQ-E03-009
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.3
**Type:** ENHANCEMENT
**Size:** M
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 16:45 UTC

---

## Summary

Modify the articles creation and update API endpoints to automatically initiate translation workflows when articles are created or modified. The POST handler will trigger translations after successful article creation, and the PUT handler will delete existing translations before re-queuing new translations after updates. Both handlers will include translation job identifiers in their responses for status tracking.

---

## Background & Context

### Current State

The Articles API consists of two route files that handle CRUD operations for articles without any translation integration:

**POST Handler (`/src/app/api/admin/articles/route.ts:276-401`)**
- Validates authentication via `validateAdminAuth` (imported from `@/lib/auth-server`)
- Extracts account context via local `getAccountContext` helper function
- Validates required fields (itemId, purpose)
- Validates purpose type via `isValidPurposeType` helper
- Validates item belongs to user's account context
- Auto-generates title if not provided using `generateArticleTitle`
- Creates article in database with fields: item_id, purpose, title, description, display_order
- Returns article data without translation information

**PUT Handler (`/src/app/api/admin/articles/[articleId]/route.ts:228-433`)**
- Uses local `getAccountContext` helper function
- Validates article access within account context via `validateArticleAccess` helper
- Validates purpose type if provided
- Updates article fields: purpose, title, description, display_order
- Auto-regenerates title if purpose changed and no new title provided
- Handles item tags update if provided (REQ-214)
- Handles links updates if provided (delete/update/insert pattern)
- Returns updated article data without translation information

### Existing Code Patterns

| Pattern | Location | Lines | Description |
|---------|----------|-------|-------------|
| Auth validation | `validateAdminAuth` | route.ts:10 | Returns user, isAdmin, supabase client |
| Account context | `getAccountContext` | route.ts:15-71, [articleId]/route.ts:16-72 | Extracts accountId, accountRole |
| Article validation | `validateArticleAccess` | [articleId]/route.ts:75-119 | Validates article belongs to account |
| Response format | Both files | Various | `{ success, data, accountContext }` |
| Error handling | Both files | Various | Returns `{ success: false, error, code }` with HTTP status |

### Problem Statement

1. When articles are created, no translation process is initiated - content remains in original language only
2. When articles are updated, existing translations become stale but are not replaced
3. API responses don't include translation job information for status tracking
4. There's no mechanism to pass source language for content translation
5. Translatable field changes (title, description) don't trigger re-translation
6. No `source_language` column is being set on articles

### Solution Approach

Integrate the content translation orchestrator into both handlers:

1. **POST Handler Modifications:**
   - Accept optional `sourceLanguage` in request body
   - Use `detectSourceLanguage()` utility when not explicitly provided
   - After successful article creation, call `queueContentTranslations()`
   - Update article with `source_language` column
   - Include `translationJobIds` array in response

2. **PUT Handler Modifications:**
   - Detect when translatable fields (title, description) have changed
   - Delete existing article translations before update
   - Queue new translations after successful update
   - Update article with `source_language` column
   - Include `translationJobIds` array in response
   - Skip translation queuing if only non-translatable fields changed

---

## Technical Design

### Architecture Position

```
/src/app/api/admin/articles/
├── route.ts                    # MODIFY: POST handler (lines 276-401)
└── [articleId]/
    └── route.ts                # MODIFY: PUT handler (lines 228-433)

/src/lib/content-translation/   # Dependencies (from prior tasks)
├── index.ts                    # Module exports
├── content-translation.ts      # queueContentTranslations()
├── content-translation.types.ts # Type definitions
├── source-language.ts          # detectSourceLanguage()
├── triggers/
│   └── article-trigger.ts      # triggerArticleTranslation()
└── storage/
    └── translation-storage.ts  # deleteEntityTranslations()
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `queueContentTranslations` | `/src/lib/content-translation/content-translation.ts` | Queue translation jobs |
| `detectSourceLanguage` | `/src/lib/content-translation/source-language.ts` | Determine source language |
| `deleteEntityTranslations` | `/src/lib/content-translation/storage/translation-storage.ts` | Delete existing translations |
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Language type |
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Authentication |

### Database Schema Reference

**Item Articles Table (`item_articles`):**
```sql
id: uuid PRIMARY KEY
item_id: uuid REFERENCES items(id) ON DELETE CASCADE
purpose: text NOT NULL
title: text
description: text
display_order: integer DEFAULT 0
source_language: text  -- Added in Epic 1, to be populated
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
```

**Article Translations Table (`article_translations`):**
```sql
id: uuid PRIMARY KEY
article_id: uuid REFERENCES item_articles(id) ON DELETE CASCADE
language: text NOT NULL  -- Target language code
title: text
description: text
translation_status: text  -- 'pending', 'completed', 'failed', 'manual'
translated_at: timestamptz
source_version_at: timestamptz
reviewed_by: uuid REFERENCES users(id)
created_at: timestamptz
updated_at: timestamptz
UNIQUE(article_id, language)
```

**Translation Jobs Table (`translation_jobs`):**
```sql
id: uuid PRIMARY KEY
entity_type: text NOT NULL  -- 'item', 'article', 'link', 'tag'
entity_id: uuid NOT NULL
source_language: text NOT NULL
target_language: text NOT NULL
status: text NOT NULL  -- 'queued', 'processing', 'completed', 'failed'
priority: integer DEFAULT 50
attempts: integer DEFAULT 0
error_message: text
created_at: timestamptz
started_at: timestamptz
completed_at: timestamptz
```

---

## Interface Contracts

### Extended Request Types

```typescript
// Extended CreateArticleRequest (POST)
// File: /src/types/index.ts
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
  /**
   * Optional source language override for translations.
   * If not provided, detected from user/account preferences.
   * @see detectSourceLanguage()
   */
  sourceLanguage?: SupportedLanguage;  // NEW
}
```

### Extended Response Types

```typescript
// Extended article response (both POST and PUT)
// File: /src/types/index.ts
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  /**
   * Array of translation job IDs for status tracking.
   * Empty if translation queuing was skipped or failed.
   */
  translationJobIds?: string[];  // NEW

  /**
   * Translation error message if queuing failed.
   * Article creation/update still succeeds even if translation fails.
   */
  translationError?: string;  // NEW

  /**
   * Languages queued for translation.
   */
  queuedLanguages?: SupportedLanguage[];  // NEW
}
```

### Translation Integration Contract

```typescript
// Usage pattern in POST handler
import {
  queueContentTranslations,
  detectSourceLanguage
} from '@/lib/content-translation';

const sourceLanguage = detectSourceLanguage({
  user: { preferred_language: userPreferredLanguage },
  account: { preferred_language: accountPreferredLanguage },
  override: body.sourceLanguage
});

const translationResult = await queueContentTranslations({
  content: {
    entityType: 'article',
    entityId: newArticle.id,
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
  trigger: 'create'
});
```

---

## Implementation Details

### POST Handler Modifications

**Location:** `/src/app/api/admin/articles/route.ts`
**Function:** `POST` (lines 276-401)

**Step 1: Add imports at top of file (after line 5)**
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

**Step 2: Add helper functions after `getAccountContext` (after line 71)**
```typescript
async function getAccountPreferredLanguage(
  supabase: any,
  accountId: string | null
): Promise<string | null> {
  if (!accountId) return null;

  const { data } = await supabase
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();

  return data?.preferred_language || null;
}

async function getUserPreferredLanguage(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('preferred_language')
    .eq('id', userId)
    .single();

  return data?.preferred_language || null;
}
```

**Step 3: After successful article creation (after line 374), add translation logic**
```typescript
// After: console.log('Article created successfully:', newArticle.id);

// Fetch language preferences for source language detection
const [userPreferredLanguage, accountPreferredLanguage] = await Promise.all([
  getUserPreferredLanguage(supabase, user.id),
  getAccountPreferredLanguage(supabase, accountId)
]);

// Determine source language
const sourceLanguage = detectSourceLanguage({
  user: { preferred_language: userPreferredLanguage },
  account: { preferred_language: accountPreferredLanguage },
  override: body.sourceLanguage
});

// Update article with source_language
await supabase
  .from('item_articles')
  .update({ source_language: sourceLanguage })
  .eq('id', newArticle.id);

// Queue translations (non-blocking - errors don't fail article creation)
let translationJobIds: string[] = [];
let translationError: string | undefined;
let queuedLanguages: SupportedLanguage[] = [];

try {
  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'article',
      entityId: newArticle.id,
      sourceLanguage,
      fields: [
        {
          fieldName: 'title',
          value: newArticle.title || '',
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
    trigger: 'create'
  });

  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    queuedLanguages = translationResult.queuedLanguages;
    console.log('Translation jobs queued for article:', translationJobIds.length);
  } else {
    translationError = translationResult.error;
    console.error('Translation queuing returned error:', translationError);
  }
} catch (error) {
  console.error('Translation queuing error:', error);
  translationError = error instanceof Error ? error.message : 'Unknown translation error';
}
```

**Step 4: Modify response object (around line 376-392)**
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
    links: []
  },
  // NEW: Include translation fields
  translationJobIds,
  queuedLanguages,
  ...(translationError && { translationError }),
  accountContext: { accountId, accountRole }
};
```

### PUT Handler Modifications

**Location:** `/src/app/api/admin/articles/[articleId]/route.ts`
**Function:** `PUT` (lines 228-433)

**Step 1: Add imports at top of file (after line 4)**
```typescript
import {
  queueContentTranslations,
  detectSourceLanguage,
  deleteEntityTranslations
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
```

**Step 2: Add helper functions after `getAccountContext` (after line 72)**
```typescript
// Same helpers as POST handler
async function getAccountPreferredLanguage(supabase: any, accountId: string | null): Promise<string | null> { /* ... */ }
async function getUserPreferredLanguage(supabase: any, userId: string): Promise<string | null> { /* ... */ }
```

**Step 3: Before article update, detect translatable field changes (before line 280)**
```typescript
// Get current article values for comparison (from validateArticleAccess)
const currentArticle = article;

// Detect if translatable fields will change (considering the update data)
const newTitle = body.title !== undefined ? body.title : currentArticle.title;
const newDescription = body.description !== undefined ? body.description : currentArticle.description;

const translatableFieldsChanged = (
  newTitle !== currentArticle.title ||
  (newDescription || '') !== (currentArticle.description || '')
);
```

**Step 4: After successful article update (after line 318), add translation logic**
```typescript
// Fetch language preferences
const [userPreferredLanguage, accountPreferredLanguage] = await Promise.all([
  getUserPreferredLanguage(supabase, user.id),
  getAccountPreferredLanguage(supabase, accountId)
]);

// Determine source language
const sourceLanguage = detectSourceLanguage({
  user: { preferred_language: userPreferredLanguage },
  account: { preferred_language: accountPreferredLanguage },
  override: body.sourceLanguage
});

// Update article with source_language
await supabase
  .from('item_articles')
  .update({ source_language: sourceLanguage })
  .eq('id', updatedArticle.id);

let translationJobIds: string[] = [];
let translationError: string | undefined;
let queuedLanguages: SupportedLanguage[] = [];

// Only process translations if translatable fields changed
if (translatableFieldsChanged) {
  try {
    // Delete existing translations (guests see source content while re-translating)
    await deleteEntityTranslations('article', updatedArticle.id);
    console.log('Existing translations deleted for article:', updatedArticle.id);

    // Queue new translations
    const translationResult = await queueContentTranslations({
      content: {
        entityType: 'article',
        entityId: updatedArticle.id,
        sourceLanguage,
        fields: [
          {
            fieldName: 'title',
            value: updatedArticle.title || '',
            context: { contentType: 'article_title', domainContext: 'property_rental_instructions' },
            maxLength: 255
          },
          {
            fieldName: 'description',
            value: updatedArticle.description || '',
            context: { contentType: 'article_description', domainContext: 'property_rental_instructions' }
          }
        ]
      },
      trigger: 'update'
    });

    if (translationResult.success) {
      translationJobIds = translationResult.jobIds;
      queuedLanguages = translationResult.queuedLanguages;
      console.log('Translation jobs queued after article update:', translationJobIds.length);
    } else {
      translationError = translationResult.error;
    }
  } catch (error) {
    console.error('Translation update error:', error);
    translationError = error instanceof Error ? error.message : 'Unknown translation error';
  }
} else {
  console.log('No translatable field changes - skipping translation queuing');
}
```

**Step 5: Modify response object (around line 398-422)**
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
      /* ... existing link mapping ... */
    }))
  },
  // NEW: Include translation fields
  translationJobIds,
  queuedLanguages,
  ...(translationError && { translationError }),
  accountContext: { accountId, accountRole }
};
```

---

## Authorized Files and Functions for Modification

### Files to Modify (UPDATE)

| File Path | Change Type | Lines Affected | Description |
|-----------|-------------|----------------|-------------|
| `/src/app/api/admin/articles/route.ts` | Modify | 1-12 (imports), 72-110 (helpers), 374-395 (POST handler) | Add translation integration to POST |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Modify | 1-14 (imports), 73-110 (helpers), 269-280 (change detection), 318-380 (PUT handler), 398-425 (response) | Add translation integration to PUT |
| `/src/types/index.ts` | Modify | ~243-262 (CreateArticleRequest), ~289-307 (ArticleResponse) | Extend request and response types |

### Functions to Modify

| Function | File | Lines | Modification |
|----------|------|-------|--------------|
| `POST` handler | route.ts | 276-401 | Add source language detection, queue translations, update response |
| `PUT` handler | [articleId]/route.ts | 228-433 | Add change detection, delete/re-queue translations, update response |

### New Functions to Add

| Function | File | Purpose |
|----------|------|---------|
| `getAccountPreferredLanguage` | route.ts | Fetch account language preference |
| `getUserPreferredLanguage` | route.ts | Fetch user language preference |
| `getAccountPreferredLanguage` | [articleId]/route.ts | Fetch account language preference (duplicate) |
| `getUserPreferredLanguage` | [articleId]/route.ts | Fetch user language preference (duplicate) |

### Types to Extend

| Type | File | Line | Changes |
|------|------|------|---------|
| `CreateArticleRequest` | `/src/types/index.ts` | ~243 | Add `sourceLanguage?: SupportedLanguage` |
| `ArticleResponse` | `/src/types/index.ts` | ~289 | Add `translationJobIds?`, `translationError?`, `queuedLanguages?` |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Import content translation functions |
| `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` function signature |
| `/src/lib/content-translation/source-language.ts` | `detectSourceLanguage` function signature |
| `/src/lib/content-translation/storage/translation-storage.ts` | `deleteEntityTranslations` function signature |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type definition |
| `/src/lib/auth-server.ts` | `validateAdminAuth` pattern reference |
| `/src/lib/titleGenerator.ts` | `generateArticleTitle`, `isValidPurposeType` utilities |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority | Dependencies |
|---|------|------|----------|--------------|
| 1 | Extend `CreateArticleRequest` type with `sourceLanguage` field | XS | Required | None |
| 2 | Extend `ArticleResponse` type with translation fields | S | Required | None |
| 3 | Add imports to route.ts (POST handler file) | XS | Required | Tasks 1-2 |
| 4 | Add `getUserPreferredLanguage` helper in route.ts | XS | Required | Task 3 |
| 5 | Add `getAccountPreferredLanguage` helper in route.ts | XS | Required | Task 3 |
| 6 | Modify POST handler to fetch language preferences | S | Required | Tasks 4-5 |
| 7 | Modify POST handler to determine source language | S | Required | Task 6 |
| 8 | Modify POST handler to update article with source_language | XS | Required | Task 7 |
| 9 | Modify POST handler to queue translations | M | Required | Task 8 |
| 10 | Modify POST handler response to include translation fields | S | Required | Task 9 |
| 11 | Add imports to [articleId]/route.ts (PUT handler file) | XS | Required | Tasks 1-2 |
| 12 | Add helper functions in [articleId]/route.ts | XS | Required | Task 11 |
| 13 | Add translatable field change detection in PUT handler | S | Required | Task 12 |
| 14 | Modify PUT handler to delete existing translations | S | Required | Task 13 |
| 15 | Modify PUT handler to queue new translations | M | Required | Task 14 |
| 16 | Modify PUT handler response to include translation fields | S | Required | Task 15 |
| 17 | Verify TypeScript compilation with `npm run build` | XS | Required | Tasks 1-16 |

### Implementation Order

1. **Phase 1 - Type Updates:**
   - Tasks 1, 2: Extend TypeScript types in `/src/types/index.ts`

2. **Phase 2 - POST Handler:**
   - Tasks 3, 4, 5: Add imports and helper functions
   - Tasks 6, 7, 8, 9, 10: Modify POST handler flow

3. **Phase 3 - PUT Handler:**
   - Tasks 11, 12: Add imports and helper functions
   - Tasks 13, 14, 15, 16: Modify PUT handler flow

4. **Phase 4 - Verification:**
   - Task 17: Build and verify no TypeScript errors

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| POST handler accepts optional sourceLanguage parameter in request body | `body.sourceLanguage` field in `CreateArticleRequest` type |
| POST handler uses language detection utility when not explicitly provided | `detectSourceLanguage({ user, account, override: body.sourceLanguage })` |
| POST handler calls content translation orchestrator after successful article creation | `queueContentTranslations()` called after article insert succeeds |
| POST handler includes translationJobIds array in successful response payload | `translationJobIds` field in response object |
| POST handler includes translation error messages in response if orchestration fails | `translationError` field in response object (only when error occurs) |
| POST handler completes article creation even if translation queuing fails | Try/catch around translation code, article creation not affected |
| PUT/PATCH handler identifies when title or description fields have changed | `translatableFieldsChanged` boolean comparison before update |
| PUT/PATCH handler deletes existing translation records for the article before update | `deleteEntityTranslations('article', articleId)` call |
| PUT/PATCH handler calls content translation orchestrator after successful update | `queueContentTranslations()` called after article update succeeds |
| PUT/PATCH handler includes translationJobIds array in successful response payload | `translationJobIds` field in response object |
| PUT/PATCH handler skips translation queuing if translatable fields are unchanged | Conditional check on `translatableFieldsChanged` |
| Both handlers maintain existing response structure with new fields added as non-breaking changes | New fields are optional, existing fields unchanged |
| Both handlers handle translation orchestrator errors gracefully without failing the primary operation | Try/catch blocks, errors logged, don't fail article operations |
| Response type definitions are updated to include optional translation-related fields | `ArticleResponse` extended with `translationJobIds?`, `translationError?`, `queuedLanguages?` |
| API documentation reflects new request parameters and response fields | JSDoc comments added to type definitions |

---

## Error Handling Strategy

### Translation Errors Should NOT Fail Article Operations

```typescript
// Correct pattern - translation errors are caught and reported but don't fail the primary operation
try {
  const translationResult = await queueContentTranslations(/* ... */);
  if (translationResult.success) {
    translationJobIds = translationResult.jobIds;
    queuedLanguages = translationResult.queuedLanguages;
  } else {
    translationError = translationResult.error;
  }
} catch (error) {
  console.error('Translation queuing failed:', error);
  translationError = error instanceof Error ? error.message : 'Unknown translation error';
}

// Article creation/update succeeds regardless of translation status
return NextResponse.json({
  success: true, // Article operation succeeded
  data: { /* article data */ },
  translationJobIds, // May be empty if translation failed
  queuedLanguages,
  ...(translationError && { translationError }) // Only included if there was an error
}, { status: 201 }); // POST returns 201, PUT returns 200
```

### Error Scenarios

| Error Scenario | Handling | Response |
|---------------|----------|----------|
| Translation service unavailable | Catch error, log, continue | `{ success: true, translationError: "..." }` |
| Invalid source language in body | Fallback via `detectSourceLanguage` | Normal response |
| Database error deleting translations | Catch error, log, continue | `{ success: true, translationError: "..." }` |
| Job queue insert fails | Catch error, log, continue | `{ success: true, translationError: "..." }` |
| No language preferences found | Use English default | Normal response |

---

## Testing Considerations

### Unit Test Cases

1. **POST Handler Translation Integration**
   - Article created successfully with translations queued
   - Article created successfully when translation queuing fails
   - Source language from body.sourceLanguage override
   - Source language detected from user preference
   - Source language detected from account preference
   - Default English when no preferences set
   - translationJobIds array populated on success
   - translationError populated on failure
   - queuedLanguages shows 5 target languages (excluding source)

2. **PUT Handler Translation Integration**
   - Translations re-queued when title changes
   - Translations re-queued when description changes
   - Translations re-queued when both title and description change
   - Translations skipped when only purpose changes (title auto-regenerated triggers re-translation)
   - Translations skipped when only displayOrder changes
   - Translations skipped when only links are updated
   - Translations skipped when only itemTags are updated
   - Existing translations deleted before new ones queued
   - Update succeeds when translation deletion fails
   - Update succeeds when translation queuing fails

3. **Response Structure Validation**
   - POST response includes all existing fields plus translation fields
   - PUT response includes all existing fields plus translation fields
   - translationError only included when there's an error
   - translationJobIds is empty array (not undefined) when no jobs queued
   - Backward compatibility: existing fields unchanged

### Integration Test Cases

1. Create article -> Verify 5 translation jobs in `translation_jobs` table
2. Create article -> Verify `source_language` column populated on article
3. Update article title -> Verify old translations deleted from `article_translations`
4. Update article title -> Verify 5 new jobs queued in `translation_jobs`
5. Update article (only displayOrder) -> Verify no new translation jobs created
6. Update article (only links) -> Verify no new translation jobs created
7. Create article with sourceLanguage='fr' -> Verify jobs have source_language='fr'
8. Create article without sourceLanguage -> Verify source detected from user preference

### Test File Locations

- Unit tests: `/src/app/api/admin/articles/__tests__/route.test.ts`
- Unit tests: `/src/app/api/admin/articles/[articleId]/__tests__/route.test.ts`
- Integration tests: `/src/tests/integration/articles-translation.test.ts`

---

## Related Documentation

- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-009)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 2, Task 2.3)
- **Source Language Detection:** `/docs/REQ-E03-007-add-source-language-detection-utility-overview.md`
- **Content Translation Orchestrator:** `/docs/REQ-E03-002-implement-content-translation-orchestrator-overview.md`
- **Translation Storage:** `/docs/REQ-E03-005-implement-translation-storage-utilities-overview.md`
- **Items API Translation (similar pattern):** `/docs/REQ-E03-008-modify-items-api-to-trigger-translations-overview.md`
- **Existing Articles API:** `/src/app/api/admin/articles/route.ts`, `/src/app/api/admin/articles/[articleId]/route.ts`
- **Type Definitions:** `/src/types/index.ts`

---

## Notes

1. **Backward Compatibility:** The new response fields (`translationJobIds`, `translationError`, `queuedLanguages`) are optional, so existing API consumers will not break. The new `sourceLanguage` request field is also optional.

2. **Non-Blocking Translation:** Translation queuing is designed to be non-blocking. If translation fails, the article creation/update still succeeds. This follows the principle that the primary operation should never fail due to secondary concerns.

3. **Dependency on Prior Tasks:** This task depends on:
   - REQ-E03-001: Content translation module structure
   - REQ-E03-002: Content translation orchestrator (`queueContentTranslations`)
   - REQ-E03-005: Translation storage utilities (`deleteEntityTranslations`)
   - REQ-E03-007: Source language detection utility (`detectSourceLanguage`)

4. **Duplicate Helper Functions:** The `getAccountPreferredLanguage` and `getUserPreferredLanguage` functions are added to both route files. This mirrors the pattern established in the Items API. Could be refactored into a shared utility later.

5. **Change Detection Logic:** Only `title` and `description` are considered translatable fields. Changes to `purpose` (which may trigger title regeneration), `displayOrder`, `links`, or `itemTags` alone do not trigger translation re-queuing. However, if purpose changes AND title is auto-regenerated, the title change will trigger re-translation.

6. **Delete Before Re-translate:** On update, existing translations are deleted before queuing new ones. This ensures guests see source language content while new translations are processing, rather than potentially stale translations.

7. **source_language Column:** The `source_language` column on articles is updated on both create and update operations, ensuring it always reflects the current source language.

8. **Title Auto-Generation:** When an article is created without a title, or when purpose changes, the title is auto-generated via `generateArticleTitle()`. The translation will use this auto-generated title.

9. **Article Context:** The translation context uses `contentType: 'article_title'` and `contentType: 'article_description'` with `domainContext: 'property_rental_instructions'` to provide appropriate context to the translation service.

---

## File Structure After Implementation

```typescript
// /src/app/api/admin/articles/route.ts (modified)
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import { CreateArticleRequest, ArticlesListResponse, ArticleResponse } from '@/types';
import { queueContentTranslations, detectSourceLanguage } from '@/lib/content-translation';  // NEW
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';  // NEW

async function getAccountContext(request, userId, isAdmin, supabase) { /* existing */ }
async function getUserPreferredLanguage(supabase, userId): Promise<string | null> { /* NEW */ }
async function getAccountPreferredLanguage(supabase, accountId): Promise<string | null> { /* NEW */ }

export async function GET(request: NextRequest) { /* unchanged */ }

export async function POST(request: NextRequest) {
  // ... existing validation and article creation ...

  // NEW: Source language detection and translation queuing
  const sourceLanguage = detectSourceLanguage({ /* ... */ });
  await supabase.from('item_articles').update({ source_language: sourceLanguage }).eq('id', newArticle.id);

  let translationJobIds: string[] = [];
  let translationError: string | undefined;
  let queuedLanguages: SupportedLanguage[] = [];

  try {
    const translationResult = await queueContentTranslations({ /* ... */ });
    // Handle result
  } catch (error) {
    translationError = error.message;
  }

  // MODIFIED: Response includes translation fields
  const response: ArticleResponse = {
    success: true,
    data: { /* existing */ },
    translationJobIds,
    queuedLanguages,
    ...(translationError && { translationError }),
    accountContext: { /* existing */ }
  };

  return NextResponse.json(response, { status: 201 });
}
```

```typescript
// /src/app/api/admin/articles/[articleId]/route.ts (modified)
// Similar structure with change detection and delete before re-queue logic
```

```typescript
// /src/types/index.ts (extended)
export interface CreateArticleRequest {
  // ... existing fields ...
  sourceLanguage?: SupportedLanguage;  // NEW
}

export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: { /* existing */ };
  translationJobIds?: string[];      // NEW
  translationError?: string;         // NEW
  queuedLanguages?: SupportedLanguage[];  // NEW
}
```
