# REQ-339: Implement Content Translation Orchestrator Function - Implementation Overview
*Generated: 2026-01-19 14:30:00 UTC*
*Last Modified: 2026-01-19 14:30:00 UTC*

## Reference
- **Request**: REQ-339 (Implement Content Translation Orchestrator Function)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.2
- **Size**: M

## Goals
1. Create the `queueContentTranslations` function at `/src/lib/content-translation/content-translation.ts`
2. Implement centralized orchestration for creating translation jobs across all target languages
3. Integrate with the job queue infrastructure from Epic 1 (`createBatchTranslationJobs`)
4. Validate input parameters (entity type, languages, source/target validation)
5. Return comprehensive results with job IDs, queued languages, and error details
6. Prevent duplicate job creation for pending jobs
7. Support priority levels based on trigger type (create vs update)
8. Provide proper logging for monitoring translation job creation

## Context from Implementation Plan

### Dependencies on Epic 1
This task relies on the following Epic 1 infrastructure being complete:

| Component | Location | Purpose |
|-----------|----------|---------|
| Job queue functions | `/src/lib/job-queue/translation-jobs.ts` | `createBatchTranslationJobs`, `getJobsByEntity` |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `TranslationJob`, `CreateBatchJobsParams` |
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `TranslationContext` |
| Content translation types | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationOptions`, `QueueTranslationResult` (Task 1.1) |

### Task Dependencies
- **Depends on**: Task 1.1 (Create content translation module structure and types) - Provides `QueueTranslationOptions`, `QueueTranslationResult`, `ContentToTranslate` types
- **Depended on by**: Task 1.3 (Entity-specific triggers), Task 2.2-2.5 (API modifications)

### Existing Patterns to Follow

| Pattern | Location | Application |
|---------|----------|-------------|
| Batch job creation | `src/lib/job-queue/translation-jobs.ts:141` | Use `createBatchTranslationJobs` for multi-language job creation |
| Job result pattern | `JobQueueResult<T>` in job-queue types | Follow existing result pattern for consistency |
| Language utilities | `src/lib/translation-service/translation-service.types.ts:567` | Use `getOtherLanguages()` to determine target languages |
| Logging conventions | Existing job-queue logging | Use `JOB_QUEUE:`-style prefixed console logging |

## Implementation Order

### Step 1: Create Main Orchestrator File
Create `/src/lib/content-translation/content-translation.ts` with proper imports and documentation header.

### Step 2: Implement Input Validation Helper
Create a validation helper to verify:
- Source language is a valid `SupportedLanguage`
- Entity type is valid ('item' | 'article' | 'link' | 'tag')
- Content has at least one field to translate
- Target languages exclude the source language

### Step 3: Implement Priority Calculation
Create priority logic based on implementation plan:
- **Priority 100**: 'create' trigger (new content)
- **Priority 50**: 'update' trigger (updated content)
- Allow custom priority override via `options.priority`

### Step 4: Implement Duplicate Detection
Before creating jobs, check for existing pending jobs:
- Query `translation_jobs` for pending jobs matching entity type/ID
- Skip languages that already have queued/processing jobs
- Include skipped languages in the result for transparency

### Step 5: Implement Main queueContentTranslations Function
Core orchestration logic:
1. Validate input parameters
2. Calculate target languages (all except source and excluded)
3. Check for existing pending jobs
4. Create batch translation jobs via `createBatchTranslationJobs`
5. Handle partial failures gracefully
6. Return comprehensive result

### Step 6: Export from Module Index
Update `/src/lib/content-translation/index.ts` to export the new function.

### Step 7: Verification
- Run TypeScript compilation
- Verify function is importable from `@/lib/content-translation`
- Test with mock data (unit tests in later task)

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/content-translation/content-translation.ts`
- **Purpose**: Main content translation orchestrator module
- **Functions to implement**:

```typescript
/**
 * Main orchestration function for queueing content translations.
 * Creates translation jobs for all target languages based on options.
 *
 * @param options - Queue translation options including content, trigger type, exclusions
 * @returns Promise<QueueTranslationResult> with job IDs and status
 */
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult>
```

```typescript
/**
 * Validates queue translation options before processing.
 * @internal
 */
function validateQueueOptions(
  options: QueueTranslationOptions
): { valid: boolean; error?: string }
```

```typescript
/**
 * Calculates job priority based on trigger type and custom override.
 * @internal
 */
function calculateJobPriority(
  trigger: TranslationTrigger,
  customPriority?: number
): number
```

```typescript
/**
 * Checks for existing pending translation jobs to prevent duplicates.
 * @internal
 */
async function findPendingJobLanguages(
  entityType: EntityType,
  entityId: string
): Promise<SupportedLanguage[]>
```

```typescript
/**
 * Determines target languages by excluding source and any explicitly excluded languages.
 * @internal
 */
function determineTargetLanguages(
  sourceLanguage: SupportedLanguage,
  excludeLanguages?: SupportedLanguage[]
): SupportedLanguage[]
```

### Files to Modify

#### `/src/lib/content-translation/index.ts`
- **Purpose**: Add export for `queueContentTranslations` function
- **Modifications**:
  - Add function export: `export { queueContentTranslations } from './content-translation';`
  - Retain all existing type exports from Task 1.1

### Existing Files Referenced (No Modification)

#### `/src/lib/job-queue/translation-jobs.ts`
- **Functions to call**:
  - `createBatchTranslationJobs(params)` - Create multiple translation jobs
  - `getJobsByEntity(entityType, entityId)` - Query existing jobs for duplicate detection

#### `/src/lib/job-queue/translation-jobs.types.ts`
- **Types to import**:
  - `EntityType` - Entity type enumeration
  - `JobQueueResult<T>` - Result pattern
  - `TranslationJob` - Job structure
  - `CreateBatchJobsParams` - Parameters for batch creation

#### `/src/lib/translation-service/translation-service.types.ts`
- **Types to import**:
  - `SupportedLanguage` - Language code type
  - `isSupportedLanguage()` - Validation function
  - `getOtherLanguages()` - Utility for target languages

#### `/src/lib/content-translation/content-translation.types.ts`
- **Types to import**:
  - `QueueTranslationOptions` - Input options interface
  - `QueueTranslationResult` - Return result interface
  - `ContentToTranslate` - Content structure
  - `TranslationTrigger` - 'create' | 'update'

## Technical Specifications

### Function Signature
```typescript
import type { SupportedLanguage } from '@/lib/translation-service';
import type { EntityType, TranslationJob, JobQueueResult } from '@/lib/job-queue';
import type {
  QueueTranslationOptions,
  QueueTranslationResult,
  TranslationTrigger,
} from './content-translation.types';

export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult>
```

### Input Validation Rules
1. `options.content.entityType` must be one of: 'item', 'article', 'link', 'tag'
2. `options.content.entityId` must be a non-empty string (UUID format preferred)
3. `options.content.sourceLanguage` must be a valid `SupportedLanguage`
4. `options.content.fields` must have at least one field with non-empty value
5. `options.trigger` must be 'create' or 'update'
6. `options.excludeLanguages` (if provided) must all be valid `SupportedLanguage` values

### Priority Levels (From Implementation Plan)
```typescript
const PRIORITY_LEVELS = {
  CREATE: 100,    // Recently created content - highest priority
  UPDATE: 50,     // Updated content - medium priority
  BATCH: 25,      // Batch imports - lower priority
  RETRY: 10,      // Retry failed translations - lowest priority
} as const;
```

### Expected Return Structure
```typescript
interface QueueTranslationResult {
  success: boolean;           // Overall operation success
  jobIds: string[];           // IDs of created jobs
  queuedLanguages: SupportedLanguage[];  // Languages that were queued
  skippedLanguages?: SupportedLanguage[]; // Languages with existing pending jobs
  error?: string;             // Error message if operation failed
}
```

### Logging Format
Following existing job-queue conventions:
```typescript
console.log('CONTENT_TRANSLATION: Queueing translations', {
  entityType,
  entityId,
  sourceLanguage,
  targetLanguages,
  trigger,
  priority,
});

console.log('CONTENT_TRANSLATION: Jobs queued successfully', {
  entityType,
  entityId,
  jobCount: jobIds.length,
  queuedLanguages,
});

console.error('CONTENT_TRANSLATION: Failed to queue translations', {
  entityType,
  entityId,
  error: errorMessage,
});
```

### Error Handling
1. **Validation failures**: Return immediately with `success: false` and descriptive error
2. **Database errors**: Catch and include in error message, return partial results if possible
3. **Partial job creation failures**: Return success with created jobs, include failed languages in error
4. **Duplicate job detection**: Not an error, silently skip and note in `skippedLanguages`

## Usage Example (From Implementation Plan)

```typescript
import { queueContentTranslations } from '@/lib/content-translation';

// After item is created successfully in items/route.ts POST handler
const translationResult = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: newItem.id,
    sourceLanguage: body.sourceLanguage || userLanguage || 'en',
    fields: [
      {
        fieldName: 'name',
        value: newItem.name,
        context: { contentType: 'item_name', domainContext: 'property_rental' },
        maxLength: 255
      },
      {
        fieldName: 'description',
        value: newItem.description || '',
        context: { contentType: 'item_description', domainContext: 'property_rental' }
      }
    ]
  },
  trigger: 'create'
});

// Include job IDs in response
return NextResponse.json({
  success: true,
  data: transformedItem,
  translationJobIds: translationResult.jobIds
});
```

## Success Validation Checklist

### File Creation
- [ ] `/src/lib/content-translation/content-translation.ts` exists with proper structure
- [ ] File has comprehensive JSDoc documentation header
- [ ] All imports resolve correctly

### Function Implementation
- [ ] `queueContentTranslations` function is implemented and exported
- [ ] Input validation catches invalid parameters with clear error messages
- [ ] Priority calculation follows implementation plan (100 for create, 50 for update)
- [ ] Duplicate detection queries existing jobs before creating new ones
- [ ] Batch job creation uses `createBatchTranslationJobs` from job-queue
- [ ] Partial failures return created jobs with error details
- [ ] Logging follows established patterns with `CONTENT_TRANSLATION:` prefix

### Module Export
- [ ] Function is exported from `/src/lib/content-translation/index.ts`
- [ ] Import `{ queueContentTranslations } from '@/lib/content-translation'` resolves

### Type Safety
- [ ] All parameters are properly typed
- [ ] Return type matches `QueueTranslationResult` interface
- [ ] No TypeScript compilation errors
- [ ] No implicit `any` types

### Integration Readiness
- [ ] Function integrates correctly with `createBatchTranslationJobs`
- [ ] Job IDs returned match those from job-queue functions
- [ ] Ready for use by entity-specific triggers (Task 1.3)
- [ ] Ready for use by API route handlers (Phase 2 tasks)

## Dependencies
- TypeScript 5.x (existing)
- `/src/lib/job-queue/` module (Epic 1, existing)
- `/src/lib/translation-service/` module (Epic 1, existing)
- `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Orchestration logic is straightforward composition of existing functions
  - No direct database access (delegates to job-queue module)
  - Input validation prevents invalid state
  - Error handling provides graceful degradation
  - Duplicate detection prevents redundant job creation
  - Pattern follows existing job-queue conventions

## Notes

### Design Decisions
1. **Delegation over duplication**: Use existing `createBatchTranslationJobs` rather than direct database access
2. **Silent skip for duplicates**: Pending jobs for same entity/language are skipped without error
3. **Partial success support**: If some jobs fail to create, return what succeeded with error details
4. **Field storage**: Fields are passed through to job metadata for processor use (not stored in orchestrator)

### Future Enhancements (Out of Scope)
- Job priority adjustment based on entity popularity
- Rate limiting at orchestration layer (handled by job processor)
- Caching of validation results
- Batch orchestration for multiple entities (not needed per PRD)

### Integration Points
The orchestrator will be called by:
1. **Task 1.3**: Entity-specific triggers (`triggerItemTranslation`, etc.)
2. **Task 2.2**: Items API POST/PUT handlers
3. **Task 2.3**: Articles API POST/PUT handlers
4. **Task 2.4**: Links API POST/PUT handlers

All callers will receive `QueueTranslationResult` and can include `jobIds` in API responses for client-side tracking.
