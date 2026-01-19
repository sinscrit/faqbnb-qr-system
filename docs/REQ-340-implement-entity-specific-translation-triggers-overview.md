# REQ-340: Implement Entity-Specific Translation Triggers - Implementation Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.3

---

## 1. Summary

Implement dedicated trigger functions for each content entity type (items, articles, links) to initiate translation workflows. Each trigger extracts entity-specific translatable fields and queues them for translation across all supported languages (en, fr, es, de, nl, it).

---

## 2. Current State

- **Job Queue Module:** Fully implemented at `/src/lib/job-queue/` with `createBatchTranslationJobs()` function (REQ-243)
- **Translation Service:** Available at `/src/lib/translation-service/` with `translateText()` function (REQ-235-240)
- **Job Processor:** Implemented at `/src/lib/job-queue/job-processor.ts` with entity-specific content fetching (REQ-244)
- **Content Translation Module:** Directory `/src/lib/content-translation/` does not exist yet - needs to be created
- **Entity Types:** Database has `items`, `item_articles`, `item_links` tables with `source_language` columns

---

## 3. Expected Behavior

When content is created or updated:
1. **Item Trigger:** Extracts `name` and `description` fields, queues translations to 5 target languages
2. **Article Trigger:** Extracts `title` and `description` fields, queues translations to 5 target languages
3. **Link Trigger:** Extracts `title` field only (URLs are not translated), queues translations to 5 target languages

All triggers return a standardized `QueueTranslationResult` with job IDs, queued languages, and status.

---

## 4. Technical Approach

### 4.1 Architecture

Create entity-specific trigger files under `/src/lib/content-translation/triggers/`:

```
/src/lib/content-translation/
├── index.ts                          # Module exports
├── content-translation.types.ts      # TypeScript interfaces (from Task 1.1)
└── triggers/
    ├── item-trigger.ts               # Item translation trigger
    ├── article-trigger.ts            # Article translation trigger
    └── link-trigger.ts               # Link translation trigger
```

### 4.2 Shared Result Interface

Use the `QueueTranslationResult` interface defined in the implementation plan:

```typescript
interface QueueTranslationResult {
  success: boolean;
  jobIds: string[];
  queuedLanguages: SupportedLanguage[];
  error?: string;
}
```

### 4.3 Implementation Pattern

Each trigger will follow this pattern:
1. Fetch entity content from database using `supabaseAdmin`
2. Validate entity exists and has content to translate
3. Build `TranslatableField[]` with appropriate translation context
4. Call `createBatchTranslationJobs()` from job-queue module
5. Return standardized result with job IDs

### 4.4 Translation Context

Use entity-specific contexts for better translation quality:
- `item_name`: Household item name in vacation rental context
- `item_description`: Item usage instructions for guests
- `article_title`: FAQ article title (format: "[How to/Safety/etc] - [Item Name]")
- `article_description`: Instruction content for guests
- `link_title`: Resource link title for external references

---

## 5. Ordered Implementation Tasks

### Task 1: Create item-trigger.ts
**File:** `/src/lib/content-translation/triggers/item-trigger.ts`

**Function Signature:**
```typescript
export async function triggerItemTranslation(
  itemId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>
```

**Steps:**
1. Import `supabaseAdmin` from `/src/lib/supabase`
2. Import `createBatchTranslationJobs` from `/src/lib/job-queue`
3. Import types from `../content-translation.types`
4. Fetch item record: `SELECT name, description FROM items WHERE id = ?`
5. Validate item exists, return error result if not found
6. Calculate target languages (all 6 supported minus source)
7. Call `createBatchTranslationJobs({ entityType: 'item', entityId: itemId, sourceLanguage, targetLanguages })`
8. Map result to `QueueTranslationResult` format
9. Handle errors gracefully with meaningful messages

**Acceptance Criteria:**
- Accepts item ID and source language parameters
- Extracts `name` and `description` fields
- Returns job IDs for all queued translations
- Handles missing item gracefully

---

### Task 2: Create article-trigger.ts
**File:** `/src/lib/content-translation/triggers/article-trigger.ts`

**Function Signature:**
```typescript
export async function triggerArticleTranslation(
  articleId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>
```

**Steps:**
1. Import `supabaseAdmin` from `/src/lib/supabase`
2. Import `createBatchTranslationJobs` from `/src/lib/job-queue`
3. Import types from `../content-translation.types`
4. Fetch article record: `SELECT title, description FROM item_articles WHERE id = ?`
5. Validate article exists, return error result if not found
6. Calculate target languages (all 6 supported minus source)
7. Call `createBatchTranslationJobs({ entityType: 'article', entityId: articleId, sourceLanguage, targetLanguages })`
8. Map result to `QueueTranslationResult` format
9. Handle errors gracefully with meaningful messages

**Acceptance Criteria:**
- Accepts article ID and source language parameters
- Extracts `title` and `description` fields
- Returns job IDs for all queued translations
- Handles missing article gracefully

---

### Task 3: Create link-trigger.ts
**File:** `/src/lib/content-translation/triggers/link-trigger.ts`

**Function Signature:**
```typescript
export async function triggerLinkTranslation(
  linkId: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>
```

**Steps:**
1. Import `supabaseAdmin` from `/src/lib/supabase`
2. Import `createBatchTranslationJobs` from `/src/lib/job-queue`
3. Import types from `../content-translation.types`
4. Fetch link record: `SELECT title FROM item_links WHERE id = ?` (note: NO url field - URLs are not translated)
5. Validate link exists, return error result if not found
6. Calculate target languages (all 6 supported minus source)
7. Call `createBatchTranslationJobs({ entityType: 'link', entityId: linkId, sourceLanguage, targetLanguages })`
8. Map result to `QueueTranslationResult` format
9. Handle errors gracefully with meaningful messages

**Acceptance Criteria:**
- Accepts link ID and source language parameters
- Extracts `title` field ONLY (explicitly excludes URL)
- Returns job IDs for all queued translations
- Handles missing link gracefully

---

### Task 4: Update content-translation index.ts
**File:** `/src/lib/content-translation/index.ts`

**Steps:**
1. Add exports for all three trigger functions:
```typescript
export { triggerItemTranslation } from './triggers/item-trigger';
export { triggerArticleTranslation } from './triggers/article-trigger';
export { triggerLinkTranslation } from './triggers/link-trigger';
```

**Acceptance Criteria:**
- All three trigger functions are exported from module index

---

### Task 5: Create Unit Tests
**File:** `/src/lib/content-translation/triggers/__tests__/triggers.test.ts`

**Test Cases:**
1. `triggerItemTranslation` - successful translation queueing
2. `triggerItemTranslation` - handles missing item
3. `triggerArticleTranslation` - successful translation queueing
4. `triggerArticleTranslation` - handles missing article
5. `triggerLinkTranslation` - successful translation queueing
6. `triggerLinkTranslation` - handles missing link
7. `triggerLinkTranslation` - does not queue URL field translations
8. All triggers handle database errors gracefully
9. All triggers return standardized result format

---

## 6. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/triggers/item-trigger.ts` | Item translation trigger function |
| `/src/lib/content-translation/triggers/article-trigger.ts` | Article translation trigger function |
| `/src/lib/content-translation/triggers/link-trigger.ts` | Link translation trigger function |
| `/src/lib/content-translation/triggers/__tests__/triggers.test.ts` | Unit tests for trigger functions |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/content-translation/index.ts` | Add exports for three trigger functions |

### Files to Import From (Read-Only Reference)

| File Path | Usage |
|-----------|-------|
| `/src/lib/supabase.ts` | `supabaseAdmin` for database queries |
| `/src/lib/job-queue/index.ts` | `createBatchTranslationJobs` function |
| `/src/lib/job-queue/translation-jobs.types.ts` | `SupportedLanguage`, `EntityType` types |
| `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `TranslatableField` types |

---

## 7. Dependencies

### Required Before This Task (Task 1.3)
- **Task 1.1:** Content translation module structure must be created (`/src/lib/content-translation/index.ts`, `content-translation.types.ts`)
- **Task 1.2:** Content translation orchestrator is helpful but not blocking
- **REQ-243:** Job queue module must be operational (already complete)
- **REQ-244:** Job processor must be operational (already complete)

### Provides For
- **Task 2.2:** Items API will call `triggerItemTranslation()` on POST/PUT
- **Task 2.3:** Articles API will call `triggerArticleTranslation()` on POST/PUT
- **Task 2.4:** Links API will call `triggerLinkTranslation()` on POST/PUT

---

## 8. Database Tables Referenced

### Source Tables (Read)

| Table | Columns Used |
|-------|--------------|
| `items` | `id`, `name`, `description`, `source_language` |
| `item_articles` | `id`, `title`, `description`, `source_language` |
| `item_links` | `id`, `title`, `source_language` |

### Queue Tables (Write via job-queue module)

| Table | Operation |
|-------|-----------|
| `translation_jobs` | INSERT via `createBatchTranslationJobs()` |

---

## 9. Error Handling

Each trigger must handle these error cases:

| Error Case | Response |
|------------|----------|
| Entity not found | Return `{ success: false, jobIds: [], queuedLanguages: [], error: "Item/Article/Link not found" }` |
| Database error | Return `{ success: false, jobIds: [], queuedLanguages: [], error: "Database error: [details]" }` |
| Job queue error | Return `{ success: false, jobIds: [], queuedLanguages: [], error: "Failed to queue jobs: [details]" }` |
| Invalid source language | Use type guard `isSupportedLanguage()` to validate, default to 'en' if invalid |

---

## 10. Testing Strategy

### Unit Tests
- Mock `supabaseAdmin` for database calls
- Mock `createBatchTranslationJobs` for job queue
- Verify correct fields extracted per entity type
- Verify error handling for all failure modes

### Integration Tests
- Create actual entity in test database
- Call trigger function
- Verify job records created in `translation_jobs` table
- Verify correct target languages queued (5 for each source)

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Task 1.1 types not ready | Medium | Blocking | Can define local types temporarily, refactor later |
| Job queue changes | Low | Medium | Job queue API is stable, already tested |
| Source language column missing | Low | High | Database migration from Epic 1 must be complete |

---

## 12. Acceptance Criteria Checklist

- [ ] Item translation trigger accepts item identifier and source language, then queues translations for name and description fields
- [ ] Article translation trigger accepts article identifier and source language, then queues translations for title and description fields
- [ ] Link translation trigger accepts link identifier and source language, then queues translation for title field only
- [ ] All trigger functions return standardized queue result information including job identifiers and status
- [ ] Link trigger explicitly excludes URL fields from translation processing
- [ ] Each trigger function handles errors gracefully and returns meaningful error information
- [ ] Unit tests cover all success and error paths
- [ ] Functions are exported from module index

---

## 13. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 1, Task 1.3)
- Request Document: `/docs/gen_requests_epic3.md` (REQ-340)
- Job Queue Module: `/src/lib/job-queue/`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
