# Implementation Overview: REQ-E03-013 - Enhance Job Processor for Content-Specific Handling

**Request ID:** REQ-E03-013
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.1
**Type:** ENHANCEMENT
**Size:** M
**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Enhance the translation job processor to route translation jobs to specialized handlers based on content entity type. This ensures appropriate field extraction, translation context, and storage for each entity type (item, article, link, tag) while maintaining the clean architecture and extensibility of the job processing system.

---

## Background & Context

### Current State

The job processor at `/src/lib/job-queue/job-processor.ts` already contains significant content-specific handling:

1. **Entity Content Fetching** (lines 152-258): The `fetchEntityContent` function already handles entity-type-specific data retrieval with a switch statement for article, item, link, and tag
2. **Translation Saving** (lines 273-386): The `saveTranslation` function already handles entity-type-specific UPSERT operations
3. **Context Handling** (lines 400-433): Functions `getTranslationContext` and `getContentType` provide entity-specific translation contexts

The main job processing flow in `processJob` (lines 446-541) calls these functions in sequence but does **not** have explicit routing to separate processor functions as specified in the implementation plan.

### Problem Statement

1. The current implementation handles all entity types in a single flow without explicit delegation to specialized processors
2. There are no dedicated `processItemTranslation`, `processArticleTranslation`, `processLinkTranslation`, or `processTagTranslation` functions
3. The implementation plan specifies a clean switch/case routing pattern that is not currently implemented
4. Future enhancements (retry logic, batch processing, priority handling) would benefit from entity-specific processor functions

### Solution Approach

Refactor the job processor to add explicit entity-specific processor functions while preserving the existing working logic:

1. Create four dedicated processor functions that encapsulate entity-specific translation logic
2. Implement a routing switch/case in the main `processTranslationJob` function
3. Each processor handles: content fetching, field translation, storage, and job status updates
4. Integrate with storage utilities from REQ-E03-005 for consistent data persistence

---

## Technical Design

### Architecture Position

```
/src/lib/job-queue/
├── index.ts                       # Module exports (update)
├── translation-jobs.ts            # Job queue operations (existing)
├── translation-jobs.types.ts      # Type definitions (update)
├── job-processor.ts               # MODIFY - Add entity-specific processors
└── concurrency-control.ts         # Concurrency utilities (existing)
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `supabaseAdmin` | `/src/lib/supabase.ts` | Database client |
| `translateText` | `/src/lib/translation-service` | Translation API |
| `TranslationJob` | `./translation-jobs.types.ts` | Job type definition |
| `SupportedLanguage` | `./translation-jobs.types.ts` | Language type |
| `EntityType` | `./translation-jobs.types.ts` | Entity type enum |
| `markJobCompleted`, `markJobFailed` | `./translation-jobs.ts` | Job status updates |
| `storeItemTranslation`, etc. | `/src/lib/content-translation/storage/` | Storage utilities (from REQ-E03-005) |

### Existing Code Reference

The current `processJob` function (lines 446-541) contains the processing logic that will be refactored:

```typescript
// Current flow in processJob:
// 1. Start heartbeat
// 2. Fetch entity content (switch on entityType)
// 3. Translate each field
// 4. Save translation (switch on entityType)
// 5. Mark job completed/failed
```

---

## Interface Contracts

### New Types

```typescript
/**
 * Result of processing a specific entity type translation
 */
export interface EntityTranslationResult {
  success: boolean;
  /** Map of field names to translated values */
  translatedFields?: Record<string, string>;
  /** Error message if processing failed */
  errorMessage?: string;
}

/**
 * Processor function signature for entity-specific handlers
 */
export type EntityProcessorFn = (
  job: TranslationJob,
  config: JobProcessorConfig
) => Promise<EntityTranslationResult>;
```

### New Function Signatures

```typescript
/**
 * Main routing function that dispatches to entity-specific processors
 * @param job - Translation job to process
 * @param config - Processor configuration
 * @returns Processing result
 */
export async function processTranslationJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult>;

/**
 * Process item translation job
 * Fetches item, translates name and description, stores results
 * @param job - Translation job with entityType='item'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
export async function processItemTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult>;

/**
 * Process article translation job
 * Fetches article, translates title and description, stores results
 * @param job - Translation job with entityType='article'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
export async function processArticleTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult>;

/**
 * Process link translation job
 * Fetches link, translates title only, stores results
 * @param job - Translation job with entityType='link'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
export async function processLinkTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult>;

/**
 * Process tag translation job
 * Fetches tag, translates value, stores results
 * @param job - Translation job with entityType='tag'
 * @param config - Processor configuration
 * @returns Entity translation result
 */
export async function processTagTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult>;
```

---

## Implementation Details

### Main Router Function

```typescript
/**
 * Route translation job to appropriate entity-specific processor
 * Part of REQ-E03-013: Content-specific job handling
 */
async function processTranslationJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityType, entityId, targetLanguage } = job;

  // Start heartbeat to prevent lock timeout
  const stopHeartbeat = createLockHeartbeat(
    job.id,
    config.workerId,
    config.heartbeatIntervalMs || DEFAULT_HEARTBEAT_INTERVAL_MS
  );

  try {
    let result: EntityTranslationResult;

    // Route to entity-specific processor
    switch (job.entityType) {
      case 'item':
        result = await processItemTranslation(job, config);
        break;
      case 'article':
        result = await processArticleTranslation(job, config);
        break;
      case 'link':
        result = await processLinkTranslation(job, config);
        break;
      case 'tag':
        result = await processTagTranslation(job, config);
        break;
      default:
        // Handle unknown entity types gracefully
        console.error(`[JobProcessor] Unknown entity type: ${entityType}`);
        await markJobFailed(job.id, `Unknown entity type: ${entityType}`);
        return {
          jobId: job.id,
          success: false,
          entityType,
          entityId,
          targetLanguage,
          errorMessage: `Unknown entity type: ${entityType}`,
          processingTimeMs: Date.now() - startTime,
        };
    }

    // Handle processor result
    if (result.success) {
      await markJobCompleted(job.id);
      return {
        jobId: job.id,
        success: true,
        entityType,
        entityId,
        targetLanguage,
        translatedFields: result.translatedFields,
        processingTimeMs: Date.now() - startTime,
      };
    } else {
      await markJobFailed(job.id, result.errorMessage || 'Unknown error');
      return {
        jobId: job.id,
        success: false,
        entityType,
        entityId,
        targetLanguage,
        errorMessage: result.errorMessage,
        processingTimeMs: Date.now() - startTime,
      };
    }
  } finally {
    stopHeartbeat();
  }
}
```

### Entity-Specific Processor Pattern

Each processor follows a consistent pattern:

```typescript
async function processItemTranslation(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<EntityTranslationResult> {
  const { entityId, sourceLanguage, targetLanguage } = job;

  try {
    // 1. Fetch source content
    const content = await fetchEntityContent('item', entityId);
    if (!content) {
      return {
        success: false,
        errorMessage: `Item not found: ${entityId}`,
      };
    }

    // 2. Translate fields with appropriate context
    const translatedFields: Record<string, string> = {};
    const context = getTranslationContext('item');

    // Translate name (required)
    if (content.fields.name) {
      const result = await translateText(
        content.fields.name,
        sourceLanguage,
        targetLanguage,
        { context: { contentType: 'item_name', domainContext: context.domainContext } }
      );
      translatedFields.name = result.translatedText;
    }

    // Translate description (optional)
    if (content.fields.description) {
      const result = await translateText(
        content.fields.description,
        sourceLanguage,
        targetLanguage,
        { context: { contentType: 'item_description', domainContext: context.domainContext } }
      );
      translatedFields.description = result.translatedText;
    }

    // 3. Store translation using storage utilities
    const saveResult = await saveTranslation('item', entityId, targetLanguage, translatedFields);
    if (!saveResult) {
      return {
        success: false,
        errorMessage: 'Failed to save translation to database',
      };
    }

    return {
      success: true,
      translatedFields,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorMessage,
    };
  }
}
```

### Field Extraction by Entity Type

| Entity Type | Fields to Translate | Storage Table | Context Type |
|-------------|---------------------|---------------|--------------|
| item | name, description | item_translations | item_name, item_description |
| article | title, description | article_translations | article_title, article_description |
| link | title (only) | link_translations | link_title |
| tag | translated_value | tag_translations | tag |

### Error Handling Strategy

1. **Entity Not Found**: Return failure with clear message, job marked as failed
2. **Translation API Error**: Propagate error, job marked failed (retry logic handles re-queue)
3. **Storage Error**: Return failure, job marked failed
4. **Unknown Entity Type**: Log error, mark job failed with descriptive message
5. **All handlers respect retry limits** set in job queue configuration

---

## Authorized Files and Functions for Modification

### Files to Modify (UPDATE)

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/job-queue/job-processor.ts` | Major refactor | Add entity-specific processor functions and routing logic |
| `/src/lib/job-queue/index.ts` | Add exports | Export new processor functions |

### Functions to Create

| Function Name | File | Purpose |
|--------------|------|---------|
| `processTranslationJob` | job-processor.ts | Main routing function with switch/case |
| `processItemTranslation` | job-processor.ts | Item-specific translation processor |
| `processArticleTranslation` | job-processor.ts | Article-specific translation processor |
| `processLinkTranslation` | job-processor.ts | Link-specific translation processor |
| `processTagTranslation` | job-processor.ts | Tag-specific translation processor |

### Functions to Modify

| Function Name | File | Change Description |
|--------------|------|-------------------|
| `processJob` | job-processor.ts | Refactor to call `processTranslationJob` |
| Existing type definitions | job-processor.ts | Add `EntityTranslationResult` type |

### Types to Add/Update

| Type Name | File | Purpose |
|-----------|------|---------|
| `EntityTranslationResult` | job-processor.ts | Result type for entity processors |
| `EntityProcessorFn` | job-processor.ts | Function signature type |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/index.ts` | translateText function reference |
| `/src/lib/content-translation/storage/translation-storage.ts` | Storage utility patterns (from REQ-E03-005) |
| `/src/lib/job-queue/translation-jobs.ts` | markJobCompleted, markJobFailed functions |
| `/src/lib/job-queue/concurrency-control.ts` | createLockHeartbeat function |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority |
|---|------|------|----------|
| 1 | Add `EntityTranslationResult` type definition | XS | Required |
| 2 | Implement `processItemTranslation` function | S | Required |
| 3 | Implement `processArticleTranslation` function | S | Required |
| 4 | Implement `processLinkTranslation` function | S | Required |
| 5 | Implement `processTagTranslation` function | S | Required |
| 6 | Implement `processTranslationJob` routing function | M | Required |
| 7 | Refactor existing `processJob` to use new routing | S | Required |
| 8 | Update index.ts exports | XS | Required |
| 9 | Add JSDoc comments explaining routing logic | XS | Required |
| 10 | Verify TypeScript compilation | XS | Required |

### Implementation Order

1. **Step 1**: Add new type definitions (`EntityTranslationResult`)
2. **Step 2**: Implement `processItemTranslation` - extract logic from existing `processJob`
3. **Step 3**: Copy pattern to implement `processArticleTranslation`
4. **Step 4**: Copy pattern to implement `processLinkTranslation`
5. **Step 5**: Copy pattern to implement `processTagTranslation`
6. **Step 6**: Implement `processTranslationJob` router with switch/case
7. **Step 7**: Refactor `processJob` to call `processTranslationJob`
8. **Step 8**: Update exports in index.ts
9. **Step 9**: Verify build passes

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Main job processor includes switch/case based on job.entityType | `processTranslationJob` with switch statement |
| Processor routes to processItemTranslation when entityType is 'item' | case 'item' in switch |
| Processor routes to processArticleTranslation when entityType is 'article' | case 'article' in switch |
| Processor routes to processLinkTranslation when entityType is 'link' | case 'link' in switch |
| Processor routes to processTagTranslation when entityType is 'tag' | case 'tag' in switch |
| Processor handles unknown entity types gracefully with error logging | default case with console.error and markJobFailed |
| Each specialized handler extracts correct fields for its entity type | Entity-specific content fetching and field iteration |
| Each specialized handler calls translation service with appropriate payloads | translateText with correct contentType context |
| Each specialized handler uses correct storage utility | saveTranslation call with entityType |
| Each specialized handler marks jobs as completed upon success | markJobCompleted call |
| Each specialized handler marks jobs as failed with error details upon failure | markJobFailed call with error message |
| Each specialized handler respects job retry limits and backoff policies | Handled by existing job queue infrastructure |
| All handlers maintain consistent error handling patterns | Try-catch with typed error messages |
| TypeScript types properly defined for entity type enumerations and handler signatures | EntityTranslationResult and function types |
| Code includes JSDoc comments explaining routing logic | Documentation on processTranslationJob |

---

## Testing Considerations

### Unit Test Cases

1. **Routing Tests**
   - Verify item job routes to processItemTranslation
   - Verify article job routes to processArticleTranslation
   - Verify link job routes to processLinkTranslation
   - Verify tag job routes to processTagTranslation
   - Verify unknown entityType returns error

2. **Item Processor Tests**
   - Process item with name and description
   - Process item with name only (null description)
   - Handle missing item (entity not found)
   - Handle translation API failure
   - Handle storage failure

3. **Article Processor Tests**
   - Process article with title and description
   - Process article with title only
   - Handle missing article

4. **Link Processor Tests**
   - Process link (title only, URL never translated)
   - Handle missing link

5. **Tag Processor Tests**
   - Process user tag translation
   - Handle missing tag

### Integration Test Cases

1. Create item -> queue translation job -> process -> verify translation stored
2. Process job with all entity types in sequence
3. Verify heartbeat keeps lock alive during long translations
4. Verify job marked completed/failed correctly

---

## Related Documentation

- **Request Document**: `/docs/gen_requests_epic3.md` (REQ-E03-013)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Related Storage Utilities**: REQ-E03-005 (translation-storage.ts)
- **Related Status Utilities**: REQ-E03-006 (translation-status.ts)
- **Epic 1 Foundation**: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`

---

## Notes

1. **Refactoring vs. Rewriting**: This task is a refactoring of existing working code. The current `processJob` function already handles all entity types correctly. The change adds explicit routing and dedicated functions for better maintainability.

2. **Storage Utilities Integration**: If REQ-E03-005 storage utilities are implemented, the entity processors can use them instead of the inline `saveTranslation` function. If not yet implemented, continue using the existing `saveTranslation` function.

3. **Backward Compatibility**: The `TranslationJobProcessor` class should continue to work without modification after this refactoring. Only internal implementation details change.

4. **Heartbeat Management**: The heartbeat lifecycle is managed in the routing function, not in individual processors. This ensures consistent lock management regardless of entity type.

5. **Future Extensibility**: The switch/case pattern makes it easy to add new entity types (e.g., 'property', 'room') by adding new case handlers and processor functions.
