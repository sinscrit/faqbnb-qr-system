# REQ-271: Enhance Translation Job Processor for Content-Specific Handling - Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.1
**Depends On:** Epic 1 (Plan-110), REQ-260, REQ-261, REQ-262, REQ-263

---

## Summary

Enhance the translation job processor to execute entity-specific processing workflows when handling translation jobs. The processor must differentiate between items, articles, links, and tags to apply appropriate translation handling based on each content type's structure, field requirements, and storage patterns.

---

## Current Behavior

The translation job queue system (established in Epic 1) processes all translation jobs using a generic workflow regardless of content type. The processor cannot differentiate between items, articles, links, and tags, resulting in a one-size-fits-all approach that cannot account for:

- Entity-specific field structures (items have name+description, links have only title)
- Different validation requirements per entity type
- Distinct storage patterns (each entity type has its own translation table)
- Content-type specific optimization opportunities

---

## Expected Behavior

When a translation job is dequeued from the job queue, the processor:

1. **Examines the entity type** specified in the job metadata (`entityType` field)
2. **Routes to a specialized processor** designed for that content type
3. **Executes entity-specific logic**:
   - **Item translation**: Translates `name` and `description` fields, stores in `item_translations`
   - **Article translation**: Translates `title` and `description` fields, stores in `article_translations`
   - **Link translation**: Translates `title` field only (URL preserved unchanged), stores in `link_translations`
   - **Tag translation**: Translates tag value, applies naming constraints, stores in `tag_translations`
4. **Handles errors gracefully** with descriptive messages indicating entity type and failure context
5. **Updates job status** appropriately (completed, failed with reason)

---

## User Impact

- Translated content appears correctly in the application with all entity-specific fields properly translated and stored
- Property owners see their items, articles, links, and tags translated appropriately based on each content type's structure
- Link URLs remain unchanged while titles are translated
- Tags follow proper naming conventions after translation
- Failed translations provide clear error messages indicating which entity type failed and why

---

## Business Value

- Ensures translation quality and correctness by applying entity-aware processing logic
- Prevents translation errors from generic processing (e.g., accidentally translating URLs)
- Improves translation system reliability through specialized handling
- Enables future optimization per entity type (e.g., batching similar content)
- Maintains data integrity by using correct storage patterns for each entity type

---

## Technical Context

### Existing Infrastructure (Epic 1)

| Component | Location | Status |
|-----------|----------|--------|
| Translation jobs table | Database | Required - provides job queue storage |
| Job queue processor | `/src/lib/job-queue/translation-jobs.ts` | Required - base processor to extend |
| Translation service | `/src/lib/translation-service/` | Required - translateText() function |
| Job types | `/src/lib/job-queue/translation-jobs.types.ts` | Required - TranslationJob interface |

### Dependencies from Earlier Epic 3 Tasks

| REQ | Component | Usage |
|-----|-----------|-------|
| REQ-260 | Content translation orchestrator | Provides job creation patterns |
| REQ-263 | Translation storage utilities | storeItemTranslation, storeArticleTranslation, storeLinkTranslation, storeTagTranslation |

### Database Tables

```sql
-- Translation storage tables (from Epic 1)
item_translations(item_id, language, name, description, translation_status, translated_at)
article_translations(article_id, language, title, description, translation_status, translated_at)
link_translations(link_id, language, title, translation_status, translated_at)
tag_translations(tag_key, language, value, is_system_tag, translated_at)

-- Job queue table (from Epic 1)
translation_jobs(id, entity_type, entity_id, source_language, target_language, status, priority, attempts, error_message, created_at, started_at, completed_at)
```

---

## Implementation Approach

### Architecture Pattern

Follow the reducer/switch-based handler pattern used in `useWorkflowState.ts`:

```typescript
// Main dispatcher using discriminated union pattern
async function processTranslationJob(job: TranslationJob): Promise<void> {
  switch (job.entityType) {
    case 'item':
      await processItemTranslation(job);
      break;
    case 'article':
      await processArticleTranslation(job);
      break;
    case 'link':
      await processLinkTranslation(job);
      break;
    case 'tag':
      await processTagTranslation(job);
      break;
    default:
      throw new TranslationError(
        `Unsupported entity type: ${(job as any).entityType}`,
        'UNSUPPORTED_ENTITY_TYPE'
      );
  }
}
```

### Entity-Specific Processors

Each processor follows the same pattern:

1. **Fetch source content** from the database using entity ID
2. **Extract translatable fields** specific to that entity type
3. **Call translation service** with appropriate context
4. **Store translated content** using the correct storage utility
5. **Update job status** to completed or failed

---

## Ordered Implementation Tasks

### Task 1: Add Entity Type to TranslationJob Interface
**Estimate:** 0.5 SP

Extend the `TranslationJob` type to include the `entityType` discriminant field if not already present from Epic 1.

**Subtasks:**
1. Verify TranslationJob interface includes `entityType: EntityType`
2. Define `EntityType = 'item' | 'article' | 'link' | 'tag'`
3. Export types from module index

---

### Task 2: Create Base Processor Error Types
**Estimate:** 0.5 SP

Define error types for content-specific processing failures.

**Subtasks:**
1. Create `TranslationProcessingError` class with entity context
2. Define error codes: `ENTITY_NOT_FOUND`, `TRANSLATION_FAILED`, `STORAGE_FAILED`, `UNSUPPORTED_ENTITY_TYPE`
3. Implement error message templates with entity context

---

### Task 3: Implement Main Dispatcher Function
**Estimate:** 1 SP

Create the `processTranslationJob` function with switch-based entity routing.

**Subtasks:**
1. Create `processTranslationJob(job: TranslationJob): Promise<void>` function
2. Implement switch statement for entity type routing
3. Add error handling for unknown entity types
4. Add logging for job dispatch (with emoji prefix for consistency)

---

### Task 4: Implement processItemTranslation Handler
**Estimate:** 1.5 SP

Create the item-specific translation processor.

**Subtasks:**
1. Fetch item by ID from database (`SELECT name, description FROM items WHERE id = ?`)
2. Build translation request with item-specific context
3. Call translateText() for `name` field with `item_name` context
4. Call translateText() for `description` field with `item_description` context
5. Call `storeItemTranslation()` from REQ-263 storage utilities
6. Handle partial failures (one field succeeds, other fails)
7. Update job status with completion timestamp

---

### Task 5: Implement processArticleTranslation Handler
**Estimate:** 1.5 SP

Create the article-specific translation processor.

**Subtasks:**
1. Fetch article by ID from database (`SELECT title, description FROM item_articles WHERE id = ?`)
2. Build translation request with article-specific context
3. Call translateText() for `title` field with `article_title` context
4. Call translateText() for `description` field with `article_description` context
5. Call `storeArticleTranslation()` from REQ-263 storage utilities
6. Handle partial failures
7. Update job status with completion timestamp

---

### Task 6: Implement processLinkTranslation Handler
**Estimate:** 1 SP

Create the link-specific translation processor.

**Subtasks:**
1. Fetch link by ID from database (`SELECT title, url FROM item_links WHERE id = ?`)
2. Build translation request with link-specific context
3. Call translateText() for `title` field only with `link_title` context
4. **Explicitly preserve URL unchanged** (do not pass to translation service)
5. Call `storeLinkTranslation()` from REQ-263 storage utilities
6. Update job status with completion timestamp

---

### Task 7: Implement processTagTranslation Handler
**Estimate:** 1 SP

Create the tag-specific translation processor.

**Subtasks:**
1. Fetch tag by key from tags table or extract from job metadata
2. Build translation request with tag-specific context
3. Call translateText() for tag value with `tag` context
4. Apply tag naming constraints (max length, allowed characters)
5. Call `storeTagTranslation()` from REQ-263 storage utilities
6. Mark as user tag (`is_system_tag = false`)
7. Update job status with completion timestamp

---

### Task 8: Integrate with Job Queue Processor
**Estimate:** 1 SP

Wire the new processor into the existing job queue infrastructure.

**Subtasks:**
1. Import `processTranslationJob` into main job processor
2. Replace generic processing logic with entity-aware dispatcher
3. Ensure job locking and status updates work correctly
4. Add retry logic integration (existing from Epic 1)
5. Test integration with job picker query

---

### Task 9: Add Logging and Monitoring
**Estimate:** 0.5 SP

Add consistent logging for debugging and monitoring.

**Subtasks:**
1. Add structured logging with entity type prefix (e.g., `🔄 TRANSLATION_JOB`)
2. Log job dispatch decisions
3. Log translation service calls with timing
4. Log storage operations
5. Log error context for failed translations

---

### Task 10: Write Unit Tests
**Estimate:** 1.5 SP

Create comprehensive unit tests for all handlers.

**Subtasks:**
1. Test `processTranslationJob` routing for each entity type
2. Test `processItemTranslation` with mock translation service
3. Test `processArticleTranslation` with mock translation service
4. Test `processLinkTranslation` ensures URL is preserved
5. Test `processTagTranslation` applies naming constraints
6. Test error handling for missing entities
7. Test error handling for translation service failures
8. Test error handling for storage failures
9. Test unknown entity type rejection

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/src/lib/job-queue/translation-jobs.ts` | MODIFY | Add content-aware processing dispatcher and entity-specific handlers |
| `/src/lib/job-queue/translation-jobs.types.ts` | MODIFY | Ensure EntityType and TranslationJob types are properly defined |
| `/src/lib/job-queue/index.ts` | MODIFY | Export new processor functions if needed |

### Files to Create

| File Path | Description |
|-----------|-------------|
| `/src/lib/job-queue/handlers/item-translation-handler.ts` | (Optional) Separate file for item processing if handlers become large |
| `/src/lib/job-queue/handlers/article-translation-handler.ts` | (Optional) Separate file for article processing |
| `/src/lib/job-queue/handlers/link-translation-handler.ts` | (Optional) Separate file for link processing |
| `/src/lib/job-queue/handlers/tag-translation-handler.ts` | (Optional) Separate file for tag processing |
| `/src/lib/job-queue/__tests__/translation-processors.test.ts` | Unit tests for all processors |

### Functions to Add

| Function | Location | Signature |
|----------|----------|-----------|
| `processTranslationJob` | `translation-jobs.ts` | `(job: TranslationJob): Promise<void>` |
| `processItemTranslation` | `translation-jobs.ts` or handlers/ | `(job: TranslationJob): Promise<void>` |
| `processArticleTranslation` | `translation-jobs.ts` or handlers/ | `(job: TranslationJob): Promise<void>` |
| `processLinkTranslation` | `translation-jobs.ts` or handlers/ | `(job: TranslationJob): Promise<void>` |
| `processTagTranslation` | `translation-jobs.ts` or handlers/ | `(job: TranslationJob): Promise<void>` |

### Dependencies to Import

| Import | From | Usage |
|--------|------|-------|
| `translateText` | `@/lib/translation-service` | Execute translations |
| `storeItemTranslation` | `@/lib/content-translation/storage/translation-storage` | Persist item translations |
| `storeArticleTranslation` | `@/lib/content-translation/storage/translation-storage` | Persist article translations |
| `storeLinkTranslation` | `@/lib/content-translation/storage/translation-storage` | Persist link translations |
| `storeTagTranslation` | `@/lib/content-translation/storage/translation-storage` | Persist tag translations |
| `TRANSLATION_CONTEXTS` | `@/lib/content-translation` | Context templates per entity type |
| `createClient` | `@/lib/supabase` | Database access for fetching source content |

---

## Acceptance Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC-1 | The `processTranslationJob` function accepts a `TranslationJob` parameter | Unit test |
| AC-2 | The function examines the `entityType` field to determine content type | Unit test |
| AC-3 | When `entityType` is 'item', the function calls `processItemTranslation` | Unit test with spy |
| AC-4 | When `entityType` is 'article', the function calls `processArticleTranslation` | Unit test with spy |
| AC-5 | When `entityType` is 'link', the function calls `processLinkTranslation` | Unit test with spy |
| AC-6 | When `entityType` is 'tag', the function calls `processTagTranslation` | Unit test with spy |
| AC-7 | Item processor extracts `name` and `description` fields | Unit test |
| AC-8 | Item processor stores results using `storeItemTranslation` | Unit test |
| AC-9 | Article processor extracts `title` and `description` fields | Unit test |
| AC-10 | Article processor stores results using `storeArticleTranslation` | Unit test |
| AC-11 | Link processor extracts only `title` field | Unit test |
| AC-12 | Link processor preserves original URL unchanged | Unit test |
| AC-13 | Link processor stores results using `storeLinkTranslation` | Unit test |
| AC-14 | Tag processor extracts tag value | Unit test |
| AC-15 | Tag processor stores results using `storeTagTranslation` | Unit test |
| AC-16 | All processors handle translation service errors gracefully | Unit test |
| AC-17 | All processors mark jobs as failed with descriptive error messages | Unit test |
| AC-18 | All processors integrate with storage utilities from REQ-263 | Integration test |
| AC-19 | Implementation extends existing job queue infrastructure from Epic 1 | Code review |
| AC-20 | Unknown entity types result in job failure with clear error message | Unit test |

---

## Effort Estimate

| Task | Story Points |
|------|--------------|
| Task 1: Entity Type Interface | 0.5 |
| Task 2: Error Types | 0.5 |
| Task 3: Main Dispatcher | 1 |
| Task 4: Item Handler | 1.5 |
| Task 5: Article Handler | 1.5 |
| Task 6: Link Handler | 1 |
| Task 7: Tag Handler | 1 |
| Task 8: Integration | 1 |
| Task 9: Logging | 0.5 |
| Task 10: Unit Tests | 1.5 |
| **Total** | **10 SP** |

**Estimated Duration:** 2-3 days (single developer)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 job queue not complete | Medium | Critical | Validate Epic 1 completion before starting |
| REQ-263 storage utilities not complete | Medium | High | Coordinate with REQ-263 implementation |
| Translation service rate limiting | Medium | Low | Use existing rate limiter from Epic 1 |
| Entity not found during processing | Low | Low | Return clear error, mark job as failed |
| Partial translation failure (1 of 2 fields) | Low | Medium | Implement atomic storage with rollback |

---

## Dependencies

### Prerequisites (Must Complete First)

1. **Epic 1 (Plan-110):** Translation jobs table, job queue infrastructure, translation service
2. **REQ-260:** Content translation orchestrator (for job types and patterns)
3. **REQ-263:** Translation storage utilities (`storeItemTranslation`, etc.)

### Downstream Dependencies

- **REQ-272 (Task 3.2):** Item translation processor implementation details
- **REQ-273 (Task 3.3):** Article translation processor implementation details
- **REQ-274 (Task 3.4):** Link translation processor implementation details
- **REQ-275 (Task 3.5):** Tag translation processor implementation details
- **Phase 4:** Translation status APIs will query job status set by these processors

---

## References

- **Request Definition:** `/docs/gen_requests_epic3.md` - REQ-271
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Phase 3, Task 3.1
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Translation Context Templates:** Plan-111 Appendix A

---

## Appendix: Translation Context Templates

For optimal translation quality, use these context strings per entity type:

```typescript
const TRANSLATION_CONTEXTS = {
  item_name: {
    contentType: 'item_name' as const,
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate the name of a household item or appliance in a vacation rental context. Keep it concise and natural.'
  },
  item_description: {
    contentType: 'item_description' as const,
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate a description of a household item for vacation rental guests. Maintain helpful, friendly tone.'
  },
  article_title: {
    contentType: 'article_title' as const,
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate the title of an instruction article for vacation rental guests.'
  },
  article_description: {
    contentType: 'article_description' as const,
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate instruction content for vacation rental guests. Keep instructions clear and actionable.'
  },
  link_title: {
    contentType: 'link_title' as const,
    domain: 'property_rental_media',
    systemPrompt: 'Translate a media link title for vacation rental guests. Keep it descriptive but concise.'
  },
  tag: {
    contentType: 'tag' as const,
    domain: 'property_rental_categorization',
    systemPrompt: 'Translate a category tag for household items. Single word or short phrase.'
  }
};
```

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3 - Translation Job Processing Enhancement*
