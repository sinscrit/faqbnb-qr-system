# Implementation Overview: Modify Articles API to Trigger Content Translations

## Header
| Field | Value |
|-------|-------|
| Request Reference | #267 |
| Source File | docs/gen_requests_epic3.md |
| Original Request Date | 2026-01-18 21:15 |
| Breakdown Created | 2026-01-18 23:45:00 UTC |
| Implementation Plan Reference | docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| Phase | 2 - Modify Existing Content APIs |
| Task ID | 2.3 |
| T-shirt Size | M |
| Estimated Effort | 2-4 hours |

## Goals

Modify the Articles API to automatically initiate translation jobs when articles are created or updated, ensuring multilingual instructional content is generated without manual intervention.

1. **POST handler enhancement**: Accept optional `sourceLanguage` field and queue translations after successful article creation
2. **PUT handler enhancement**: Delete existing article translations and queue new translations after successful article update
3. **Non-blocking translation**: Translation failures must not block article CRUD operations
4. **Response enrichment**: Include `translationJobIds` in API responses for tracking

### Assumptions & Clarifications
- Epic 1 foundation is complete and the following are available:
  - `queueContentTranslations` function from `/src/lib/content-translation/`
  - `detectSourceLanguage` function from `/src/lib/content-translation/source-language.ts`
  - `article_translations` table in the database
  - `translation_jobs` table for job queue
- The `sourceLanguage` parameter is optional; when not provided, the system uses `detectSourceLanguage` to determine the appropriate source language
- Translation jobs are queued asynchronously - the API returns immediately after queuing
- Articles have two translatable fields: `title` and `description`
- Translation failures are logged but do not affect the success of article CRUD operations
- Existing translations are deleted on update to ensure content consistency (no stale translations)

## Implementation Plan

### Step 1: Import Required Translation Modules (POST handler file)
- **Description**: Add imports for `queueContentTranslations` and `detectSourceLanguage` to `/src/app/api/admin/articles/route.ts`
- **Rationale**: These functions from the content-translation module are required to queue translation jobs and detect source language
- **Estimated Effort**: XS (5 minutes)

### Step 2: Extend CreateArticleRequest Type
- **Description**: Add optional `sourceLanguage?: string` field to the `CreateArticleRequest` interface in `/src/types/index.ts`
- **Rationale**: Enables API consumers to explicitly specify the source language; falls back to auto-detection when not provided
- **Estimated Effort**: XS (5 minutes)

### Step 3: Modify POST Handler to Queue Translations
- **Description**: After successful article creation (line ~374), add logic to:
  1. Determine source language using `detectSourceLanguage` or from request body
  2. Call `queueContentTranslations` with article's `title` and `description` fields
  3. Capture translation job IDs from the result
  4. Include `translationJobIds` in the response
- **Rationale**: Implements automatic translation triggering on article creation as specified in PRD
- **Estimated Effort**: M (30-45 minutes)

### Step 4: Import Required Translation Modules ([articleId] route file)
- **Description**: Add imports for `queueContentTranslations`, `detectSourceLanguage`, and Supabase delete operations to `/src/app/api/admin/articles/[articleId]/route.ts`
- **Rationale**: The PUT handler needs these for deleting old translations and queuing new ones
- **Estimated Effort**: XS (5 minutes)

### Step 5: Extend UpdateArticleRequest Type
- **Description**: Add optional `sourceLanguage?: string` field to the `UpdateArticleRequest` interface in `/src/types/index.ts`
- **Rationale**: Enables explicit source language specification during updates
- **Estimated Effort**: XS (5 minutes)

### Step 6: Add Translation Deletion Logic to PUT Handler
- **Description**: Before updating the article (around line ~304), add logic to delete all existing translations for the article from `article_translations` table
- **Rationale**: Ensures stale translations are removed before new content is saved and re-translated
- **Estimated Effort**: S (15-20 minutes)

### Step 7: Modify PUT Handler to Queue New Translations
- **Description**: After successful article update (around line ~317), add logic to:
  1. Determine source language using `detectSourceLanguage` or from request body
  2. Call `queueContentTranslations` with updated article's `title` and `description`
  3. Capture translation job IDs
  4. Include `translationJobIds` in the response
- **Rationale**: Implements automatic re-translation on article updates
- **Estimated Effort**: M (30-45 minutes)

### Step 8: Add Error Handling for Translation Operations
- **Description**: Wrap all translation operations in try-catch blocks. Log errors but do not throw - article operations should succeed regardless of translation queue status
- **Rationale**: Translation is a non-critical enhancement; article CRUD must not fail due to translation issues
- **Estimated Effort**: S (15 minutes)

### Step 9: Update ArticleResponse Type
- **Description**: Add optional `translationJobIds?: string[]` field to the `ArticleResponse` interface
- **Rationale**: Enables API consumers to track translation job status
- **Estimated Effort**: XS (5 minutes)

### Step 10: Testing and Validation
- **Description**: Test the following scenarios:
  - POST with explicit `sourceLanguage`
  - POST without `sourceLanguage` (auto-detection)
  - PUT with content changes (verify old translations deleted, new ones queued)
  - Error scenarios (translation service unavailable)
  - Verify article operations succeed when translation fails
- **Rationale**: Ensures feature works correctly across all expected use cases
- **Estimated Effort**: M (30-45 minutes)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Primary Files

| File | Target | Type |
|------|--------|------|
| `/src/app/api/admin/articles/route.ts` | Import statements (lines 9-12) | Modify |
| `/src/app/api/admin/articles/route.ts` | POST handler body (lines 276-401) | Modify |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Import statements (lines 9-13) | Modify |
| `/src/app/api/admin/articles/[articleId]/route.ts` | PUT handler body (lines 227-432) | Modify |
| `/src/types/index.ts` | `CreateArticleRequest` interface (lines 243-262) | Modify |
| `/src/types/index.ts` | `UpdateArticleRequest` interface (lines 267-287) | Modify |
| `/src/types/index.ts` | `ArticleResponse` interface (lines 289-297) | Modify |

### Translation Module Files (Read/Import Only)

| File | Purpose |
|------|---------|
| `/src/lib/content-translation/index.ts` | Import `queueContentTranslations` |
| `/src/lib/content-translation/source-language.ts` | Import `detectSourceLanguage` |
| `/src/lib/content-translation/content-translation.types.ts` | Import type definitions |

### Database Tables (Modify Data Only)

| Table | Operation | Purpose |
|-------|-----------|---------|
| `article_translations` | DELETE | Remove existing translations before re-translating on PUT |
| `translation_jobs` | INSERT (via orchestrator) | Queue new translation jobs |

## Dependencies

### Internal Dependencies
- **REQ-260**: Content Translation Orchestrator - `queueContentTranslations` function
- **REQ-265**: Source Language Detection Utility - `detectSourceLanguage` function
- **Epic 1 Database Schema**: `article_translations` table, `translation_jobs` table

### External Dependencies
- None - uses existing translation infrastructure from Epic 1/3

## Risks and Considerations

### Potential Side Effects
- **Performance impact**: Adding translation queueing adds a small amount of latency to article CRUD operations (database INSERT to translation_jobs table)
- **Database connections**: Each translation operation opens additional database connections; ensure connection pooling is configured appropriately
- **Translation costs**: Every article create/update triggers translation jobs to 5 target languages; monitor API costs
- **Race conditions**: If an article is rapidly updated multiple times, multiple translation job sets may be queued; the orchestrator should handle this gracefully via UPSERT on translation storage

### Testing Requirements
- [ ] Test POST with explicit `sourceLanguage: "fr"` - should use French as source
- [ ] Test POST without `sourceLanguage` - should auto-detect from user/account preferences
- [ ] Test POST response includes `translationJobIds` array
- [ ] Test PUT deletes existing `article_translations` records
- [ ] Test PUT queues new translation jobs
- [ ] Test PUT response includes `translationJobIds` array
- [ ] Test article creation succeeds when translation service is unavailable
- [ ] Test article update succeeds when translation service is unavailable
- [ ] Verify translation errors are logged but not thrown
- [ ] Test with articles that have null/empty `description` field
- [ ] Verify DELETE handler does NOT trigger translations (only removes article)

### Open Questions
- [ ] Should the `PATCH` method also be implemented, or is `PUT` sufficient for this use case?
- [ ] Should translations be queued for articles where `description` is null/empty (translate title only)?
- [ ] Is there a need to expose translation status in the GET article response?

## Out of Scope
- Changes to the DELETE handler (articles are simply deleted, no translation cleanup needed - job processor handles orphaned jobs)
- Changes to the GET handler (translation status is queried via separate translation status API)
- Translation job processing logic (handled by Epic 3 Phase 3)
- Translation storage logic (handled by REQ-263)
- UI changes to display translation status
- Batch article translation operations

## Code Examples

### Example: POST Handler Translation Integration

```typescript
// After successful article creation (around line 374)
// Queue translations asynchronously
let translationJobIds: string[] = [];
try {
  const sourceLanguage = body.sourceLanguage ||
    await detectSourceLanguage(user, account);

  const translationResult = await queueContentTranslations({
    content: {
      entityType: 'article',
      entityId: newArticle.id,
      sourceLanguage,
      fields: [
        {
          fieldName: 'title',
          value: newArticle.title || '',
          context: { contentType: 'article_title', domain: 'property_rental_instructions' },
          maxLength: 500
        },
        {
          fieldName: 'description',
          value: newArticle.description || '',
          context: { contentType: 'article_description', domain: 'property_rental_instructions' }
        }
      ]
    },
    trigger: 'create'
  });

  translationJobIds = translationResult.jobIds;
} catch (translationError) {
  console.error('Failed to queue article translations:', translationError);
  // Non-blocking - article was created successfully
}
```

### Example: PUT Handler Translation Deletion

```typescript
// Before updating article, delete existing translations
try {
  const { error: deleteTranslationsError } = await supabase
    .from('article_translations')
    .delete()
    .eq('article_id', articleId);

  if (deleteTranslationsError) {
    console.error('Failed to delete existing translations:', deleteTranslationsError);
  }
} catch (deleteError) {
  console.error('Error during translation cleanup:', deleteError);
  // Non-blocking - continue with article update
}
```

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 2, Task 2.3)
- Request Document: `/docs/gen_requests_epic3.md` (REQ-267)
- Related Request (Items API): REQ-266 - Modify Items API to Trigger Content Translations
- Epic 1 Foundation: `Plan-110-L10N-Epic1-Foundation.md`

---
*Document generated: 2026-01-18 23:45:00 UTC*
