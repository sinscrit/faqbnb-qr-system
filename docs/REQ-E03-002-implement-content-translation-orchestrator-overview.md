# REQ-E03-002: Implement Content Translation Orchestrator - Implementation Overview
*Generated: 2026-01-19 14:45:00 UTC*

## Reference
- **Request**: REQ-E03-002 (Implement Content Translation Orchestrator)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature (Core Infrastructure)
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.2
- **Size**: M (Medium)

## Goals
1. Implement the main `queueContentTranslations()` function that coordinates translation job creation
2. Accept entity metadata (type, ID, source language, fields) and queue jobs for all target languages
3. Determine active target languages from system configuration
4. Create individual translation job records using existing job-queue infrastructure
5. Return summary information with job IDs, queued languages, and any errors
6. Integrate with translation service types from Epic 1 for type safety
7. Handle duplicate jobs gracefully (skip if pending/processing job exists)

## Context from Implementation Plan

### Module Location
Per the implementation plan (Plan-111), this is Task 1.2:
- **File**: `/src/lib/content-translation/content-translation.ts`
- **Main Function**: `queueContentTranslations(options: QueueTranslationOptions): Promise<QueueTranslationResult>`

### Module Hierarchy
```
/src/lib/content-translation/
├── index.ts                        # Public exports (Task 1.1) ✓
├── content-translation.ts          # Main orchestrator (THIS TASK)
├── content-translation.types.ts    # All TypeScript interfaces (Task 1.1) ✓
├── source-language.ts              # Language detection (Task 2.1)
├── triggers/
│   ├── item-trigger.ts             # Item save trigger (Task 1.3)
│   ├── article-trigger.ts          # Article save trigger (Task 1.3)
│   ├── link-trigger.ts             # Link save trigger (Task 1.3)
│   └── tag-trigger.ts              # Tag translation trigger (Task 1.4)
└── storage/
    ├── translation-storage.ts      # Store/retrieve translations (Task 1.5)
    └── translation-status.ts       # Status tracking utilities (Task 1.6)
```

### Dependencies from Epic 1
This function depends on Epic 1 infrastructure:
- **Job Queue**: `createBatchTranslationJobs()` from `/src/lib/job-queue/translation-jobs.ts`
- **Types**: `SupportedLanguage`, `TranslationContext` from `/src/lib/translation-service/translation-service.types.ts`
- **Constants**: `ALL_SUPPORTED_LANGUAGES` from translation-service for determining target languages

### Task Dependencies
- **Depends On**: Task 1.1 (Content Translation Module Structure) - provides types
- **Blocks**: Tasks 1.3-1.6 (Triggers and storage utilities depend on this orchestrator)
- **Used By**: Tasks 2.2-2.5 (API routes will call this function when content is saved)

## Implementation Order

### Step 1: Create Orchestrator File Structure
Create the main orchestrator file with proper imports and exports.

**File to create**: `/src/lib/content-translation/content-translation.ts`

**Required imports**:
```typescript
import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs } from '@/lib/job-queue';
import { ALL_SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/translation-service';
import type {
  QueueTranslationOptions,
  QueueTranslationResult,
  ContentToTranslate,
} from './content-translation.types';
```

### Step 2: Implement Priority Calculation Helper
Implement a helper function to determine job priority based on trigger type.

**Priority levels** (from implementation plan):
- **Priority 100**: New content (trigger='create') - needs fastest translation
- **Priority 50**: Updated content (trigger='update') - important but not as urgent
- **Priority 25**: Batch imports (future use)
- **Priority 10**: Retry failed translations (future use)

```typescript
function calculatePriority(trigger: 'create' | 'update', customPriority?: number): number {
  if (customPriority !== undefined) return customPriority;
  return trigger === 'create' ? 100 : 50;
}
```

### Step 3: Implement Active Languages Query
Determine which target languages should receive translations.

**Logic**:
1. Start with all supported languages: `['en', 'fr', 'es', 'de', 'nl', 'it']`
2. Filter out the source language (can't translate to same language)
3. Filter out any explicitly excluded languages
4. Return remaining target languages

```typescript
function getTargetLanguages(
  sourceLanguage: SupportedLanguage,
  excludeLanguages?: SupportedLanguage[]
): SupportedLanguage[] {
  const exclude = new Set([sourceLanguage, ...(excludeLanguages || [])]);
  return ALL_SUPPORTED_LANGUAGES.filter(lang => !exclude.has(lang));
}
```

### Step 4: Implement Main Orchestrator Function
Implement the core `queueContentTranslations()` function.

**Function signature**:
```typescript
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult>
```

**Implementation flow**:
1. Extract parameters from options (content, trigger, excludeLanguages, priority)
2. Calculate job priority
3. Determine target languages (all supported minus source and excluded)
4. Validate there are languages to translate to
5. Call `createBatchTranslationJobs()` from job-queue module
6. Map job results to `QueueTranslationResult` format
7. Handle errors gracefully, returning failure result with error message

### Step 5: Update Barrel Exports
Add the new function to the module's public exports.

**File**: `/src/lib/content-translation/index.ts`

```typescript
export { queueContentTranslations } from './content-translation';
```

### Step 6: Verification
- Run TypeScript compilation to verify no errors
- Verify imports work correctly
- Test with mock data in development

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/content-translation/content-translation.ts`
- **Purpose**: Main orchestration function for queuing content translations
- **Functions to implement**:
  - `queueContentTranslations(options: QueueTranslationOptions): Promise<QueueTranslationResult>` - Main orchestrator
  - `getTargetLanguages(sourceLanguage, excludeLanguages?)` - Helper to determine target languages
  - `calculatePriority(trigger, customPriority?)` - Helper to calculate job priority
- **Pattern Reference**: Follows error handling pattern from `/src/lib/job-queue/translation-jobs.ts`

### Files to Modify

#### `/src/lib/content-translation/index.ts`
- **Current Exports**: Types only from Task 1.1
- **Changes**: Add export for `queueContentTranslations` function
- **New Export**: `export { queueContentTranslations } from './content-translation';`

### Existing Files (Import Only - No Modification)

| File | Import |
|------|--------|
| `/src/lib/job-queue/translation-jobs.ts` | `createBatchTranslationJobs` |
| `/src/lib/job-queue/translation-jobs.types.ts` | Types for job creation |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `ALL_SUPPORTED_LANGUAGES` |
| `/src/lib/supabase.ts` | `supabaseAdmin` (may be needed for future queries) |

## Technical Specifications

### Function Signature
```typescript
/**
 * Queues content for translation to all active target languages.
 *
 * This function coordinates the creation of translation jobs for a piece of content.
 * It determines which languages need translation based on system configuration,
 * filters out the source language and any excluded languages, and creates
 * individual job records in the translation_jobs table.
 *
 * @param options - Queue translation options
 * @param options.content - Content to translate (entity type, ID, source language, fields)
 * @param options.trigger - What triggered this translation ('create' or 'update')
 * @param options.excludeLanguages - Languages to skip (optional)
 * @param options.priority - Custom priority override (optional)
 * @returns Result with job IDs, queued languages, and any error
 *
 * @example
 * // Queue translations for a new item
 * const result = await queueContentTranslations({
 *   content: {
 *     entityType: 'item',
 *     entityId: 'item-123',
 *     sourceLanguage: 'en',
 *     fields: [
 *       { fieldName: 'name', value: 'Coffee Maker', context: { contentType: 'item_name' } },
 *       { fieldName: 'description', value: 'Premium coffee machine', context: { contentType: 'item_description' } }
 *     ]
 *   },
 *   trigger: 'create'
 * });
 *
 * if (result.success) {
 *   console.log(`Queued ${result.queuedLanguages.length} translations`);
 *   console.log('Job IDs:', result.jobIds);
 * }
 */
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult>;
```

### Input Type (from Task 1.1)
```typescript
interface QueueTranslationOptions {
  /** Content to translate */
  content: ContentToTranslate;
  /** Trigger type affects priority */
  trigger: TranslationTrigger;
  /** Skip specific languages */
  excludeLanguages?: SupportedLanguage[];
  /** Custom priority override (higher = more urgent) */
  priority?: number;
}

interface ContentToTranslate {
  entityType: EntityType;  // 'item' | 'article' | 'link' | 'tag'
  entityId: string;
  sourceLanguage: SupportedLanguage;
  fields: TranslatableField[];
}
```

### Output Type (from Task 1.1)
```typescript
interface QueueTranslationResult {
  /** Whether queuing succeeded */
  success: boolean;
  /** IDs of created translation jobs */
  jobIds: string[];
  /** Languages that were queued for translation */
  queuedLanguages: SupportedLanguage[];
  /** Error message if failed */
  error?: string;
}
```

### Implementation Pseudocode
```typescript
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult> {
  const { content, trigger, excludeLanguages, priority } = options;
  const { entityType, entityId, sourceLanguage, fields } = content;

  try {
    // 1. Log the operation for debugging
    console.log('CONTENT_TRANSLATION: Queuing translations', {
      entityType,
      entityId,
      sourceLanguage,
      trigger,
      fieldCount: fields.length,
    });

    // 2. Calculate job priority
    const jobPriority = calculatePriority(trigger, priority);

    // 3. Determine target languages
    const targetLanguages = getTargetLanguages(sourceLanguage, excludeLanguages);

    if (targetLanguages.length === 0) {
      console.log('CONTENT_TRANSLATION: No target languages to translate to');
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // 4. Call job queue to create batch jobs
    const jobResult = await createBatchTranslationJobs({
      entityType,
      entityId,
      sourceLanguage,
      targetLanguages,
    });

    if (!jobResult.success) {
      console.error('CONTENT_TRANSLATION: Failed to create jobs', jobResult.error);
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: jobResult.error,
      };
    }

    // 5. Extract job IDs and return success
    const jobs = jobResult.data || [];
    const jobIds = jobs.map(job => job.id);
    const queuedLanguages = jobs.map(job => job.targetLanguage);

    console.log('CONTENT_TRANSLATION: Jobs queued successfully', {
      entityType,
      entityId,
      jobCount: jobIds.length,
      languages: queuedLanguages,
    });

    return {
      success: true,
      jobIds,
      queuedLanguages,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('CONTENT_TRANSLATION: Exception queuing translations', error);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception queuing translations: ${errorMessage}`,
    };
  }
}
```

### Integration with Job Queue
The orchestrator delegates to `createBatchTranslationJobs()` from the job-queue module:

```typescript
// From /src/lib/job-queue/translation-jobs.ts
export async function createBatchTranslationJobs(
  params: CreateBatchJobsParams
): Promise<JobQueueResult<TranslationJob[]>>

interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;  // defaults to 'en'
  targetLanguages: SupportedLanguage[];
}
```

**Key behaviors of `createBatchTranslationJobs()`**:
- Automatically filters source language from targets
- Uses upsert with `onConflict: 'entity_type,entity_id,target_language'`
- Returns existing jobs if duplicates are found (handles re-queue scenarios)
- Returns array of created/existing jobs

### Usage Example (How API Routes Will Call)
```typescript
// In /src/app/api/admin/items/route.ts POST handler

import { queueContentTranslations } from '@/lib/content-translation';
import { TRANSLATION_CONTEXTS } from '@/lib/content-translation';

// After item is created successfully...
const translationResult = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: newItem.id,
    sourceLanguage: body.sourceLanguage || userLanguage || 'en',
    fields: [
      {
        fieldName: 'name',
        value: newItem.name,
        context: TRANSLATION_CONTEXTS.item_name,
        maxLength: 255,
      },
      {
        fieldName: 'description',
        value: newItem.description || '',
        context: TRANSLATION_CONTEXTS.item_description,
      },
    ],
  },
  trigger: 'create',
});

// Include job IDs in response
return NextResponse.json({
  success: true,
  data: transformedItem,
  translationJobIds: translationResult.jobIds,
});
```

## Success Validation Checklist

### File Structure
- [ ] `/src/lib/content-translation/content-translation.ts` exists
- [ ] File contains proper module documentation header
- [ ] All imports resolve correctly

### Function Implementation
- [ ] `queueContentTranslations()` function is exported
- [ ] Function accepts `QueueTranslationOptions` parameter
- [ ] Function returns `Promise<QueueTranslationResult>`
- [ ] Priority calculation helper implemented
- [ ] Target languages helper implemented
- [ ] Console logging follows `CONTENT_TRANSLATION:` prefix pattern

### Behavior
- [ ] Returns `success: true` with empty arrays when no target languages
- [ ] Correctly filters source language from targets
- [ ] Correctly filters excluded languages from targets
- [ ] Creates jobs for all remaining target languages
- [ ] Returns job IDs from created jobs
- [ ] Returns queued languages list
- [ ] Handles job queue errors gracefully
- [ ] Handles exceptions without throwing

### Integration
- [ ] Function uses `createBatchTranslationJobs` from job-queue
- [ ] Compatible with types from Task 1.1
- [ ] Exported from `/src/lib/content-translation/index.ts`
- [ ] Import works: `import { queueContentTranslations } from '@/lib/content-translation'`

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No type conflicts with existing modules
- [ ] All generics resolve correctly

## Notes

### Pattern Alignment
- Follow error handling pattern from `/src/lib/job-queue/translation-jobs.ts`
- Use console logging with prefix for debugging (`CONTENT_TRANSLATION:`)
- Never throw errors - always return error in result object
- Use JSDoc comments for all public functions

### Future Extensions
This orchestrator is designed to be extended:
- **Task 1.3**: Entity-specific triggers will wrap this function with entity-specific logic
- **Task 2.1**: Source language detection will provide the `sourceLanguage` parameter
- **Phase 3**: Job processing enhancement may add priority column to database schema

### Current Limitations
- Priority is calculated but not yet stored (job-queue doesn't use priority column yet)
- Fields array is accepted but passed to job processor, not stored in job record
- No deduplication check before calling job queue (job queue handles via upsert)

### Important Note About Fields
The `fields` array in `ContentToTranslate` is used by:
1. API routes to specify what content to translate
2. Job processor (Task 3.x) to know which fields to translate

The orchestrator does NOT store field details in the job record. The job processor fetches content by entity ID and determines fields based on entity type.

## Dependencies
- TypeScript 5.x (existing in project)
- `/src/lib/translation-service` module (Epic 1 - complete)
- `/src/lib/job-queue` module (Epic 1 - complete)
- `/src/lib/content-translation/content-translation.types.ts` (Task 1.1 - prerequisite)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Thin wrapper around existing job-queue functionality
  - All complex logic (locking, deduplication, retries) handled by job-queue
  - Clear input/output contracts from types
  - Follows established patterns from existing modules
  - Can be tested independently before API integration

## References
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Job Queue Implementation: `/src/lib/job-queue/translation-jobs.ts`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Content Translation Types: `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- Module Pattern Example: `/src/lib/translation-service/index.ts`
