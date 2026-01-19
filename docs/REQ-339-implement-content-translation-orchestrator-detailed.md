# REQ-339: Implement Content Translation Orchestrator Function - Detailed Task Breakdown

*Generated: 2026-01-19 15:45:00 UTC*
*Last Modified: 2026-01-19 15:45:00 UTC*

## Document Information

| Field | Value |
|-------|-------|
| Request ID | REQ-339 |
| Title | Implement Content Translation Orchestrator Function |
| Overview Document | docs/REQ-339-implement-content-translation-orchestrator-overview.md |
| Requirements Source | docs/gen_requests_epic3.md |
| Implementation Plan | docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| Phase | 1 - Content Translation Infrastructure |
| Task ID | 1.2 |
| Size | M (Medium) |
| Estimated Story Points | 5 |

## Prerequisites

### Required Dependencies (Must Be Complete)

| Dependency | Location | Status Check |
|------------|----------|--------------|
| Task 1.1 - Content translation types | `/src/lib/content-translation/content-translation.types.ts` | `ls src/lib/content-translation/content-translation.types.ts` |
| Task 1.1 - Module index | `/src/lib/content-translation/index.ts` | `ls src/lib/content-translation/index.ts` |
| Job queue module | `/src/lib/job-queue/translation-jobs.ts` | Exists (verified) |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | Exists (verified) |
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | Exists (verified) |

### Pre-Implementation Verification Commands

```bash
# Verify Task 1.1 is complete
ls -la src/lib/content-translation/

# Verify job queue module exists
ls -la src/lib/job-queue/translation-jobs.ts

# Verify translation service types exist
ls -la src/lib/translation-service/translation-service.types.ts

# TypeScript compilation check
npx tsc --noEmit 2>&1 | head -20
```

---

## Task Breakdown

### Task 1: Create Main Orchestrator File with Imports
**Story Points: 0.5**
**File: `/src/lib/content-translation/content-translation.ts`**

#### Description
Create the main content translation orchestrator file with proper imports, documentation header, and module-level constants.

#### Acceptance Criteria
- [ ] File created at `/src/lib/content-translation/content-translation.ts`
- [ ] File has comprehensive JSDoc documentation header
- [ ] All required imports are present and resolve correctly
- [ ] Priority constants are defined matching implementation plan
- [ ] File passes TypeScript compilation

#### Implementation Details

```typescript
/**
 * Content Translation Orchestrator
 * Part of REQ-339: Implement Content Translation Orchestrator Function
 *
 * This module provides centralized orchestration for creating translation jobs
 * across all target languages when user-generated content is created or updated.
 *
 * @module content-translation/content-translation
 * @created 2026-01-19
 */

import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import { isSupportedLanguage, getOtherLanguages } from '@/lib/translation-service/translation-service.types';
import type { EntityType, TranslationJob, JobQueueResult } from '@/lib/job-queue/translation-jobs.types';
import { createBatchTranslationJobs, getJobsByEntity } from '@/lib/job-queue/translation-jobs';
import type {
  QueueTranslationOptions,
  QueueTranslationResult,
  TranslationTrigger,
} from './content-translation.types';

/**
 * Priority levels for translation jobs based on trigger type.
 * Higher numbers = higher priority (processed first).
 */
const PRIORITY_LEVELS = {
  CREATE: 100,    // Recently created content - highest priority
  UPDATE: 50,     // Updated content - medium priority
  BATCH: 25,      // Batch imports - lower priority
  RETRY: 10,      // Retry failed translations - lowest priority
} as const;

/**
 * Valid entity types for translation.
 */
const VALID_ENTITY_TYPES: EntityType[] = ['item', 'article', 'link', 'tag'];
```

#### Verification Steps
```bash
# Check file exists
ls -la src/lib/content-translation/content-translation.ts

# Verify imports resolve
npx tsc --noEmit src/lib/content-translation/content-translation.ts 2>&1

# Check file structure
head -50 src/lib/content-translation/content-translation.ts
```

---

### Task 2: Implement Input Validation Helper
**Story Points: 1**
**File: `/src/lib/content-translation/content-translation.ts`**

#### Description
Implement a validation helper function to verify all input parameters before processing translation requests.

#### Acceptance Criteria
- [ ] `validateQueueOptions` function is implemented
- [ ] Validates source language is a valid `SupportedLanguage`
- [ ] Validates entity type is one of: 'item', 'article', 'link', 'tag'
- [ ] Validates entity ID is a non-empty string
- [ ] Validates content has at least one field to translate
- [ ] Validates trigger is 'create' or 'update'
- [ ] Validates excludeLanguages (if provided) are all valid `SupportedLanguage` values
- [ ] Returns clear error messages for each validation failure
- [ ] Function passes TypeScript compilation

#### Implementation Details

```typescript
/**
 * Validation result for queue options.
 * @internal
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates queue translation options before processing.
 * Checks all required fields and validates against supported values.
 *
 * @param options - The queue translation options to validate
 * @returns Validation result with success status and optional error message
 * @internal
 */
function validateQueueOptions(options: QueueTranslationOptions): ValidationResult {
  // Validate content object exists
  if (!options.content) {
    return { valid: false, error: 'Missing content object' };
  }

  const { content, trigger, excludeLanguages } = options;

  // Validate entity type
  if (!content.entityType || !VALID_ENTITY_TYPES.includes(content.entityType as EntityType)) {
    return {
      valid: false,
      error: `Invalid entity type: ${content.entityType}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
    };
  }

  // Validate entity ID
  if (!content.entityId || typeof content.entityId !== 'string' || content.entityId.trim() === '') {
    return { valid: false, error: 'Entity ID must be a non-empty string' };
  }

  // Validate source language
  if (!content.sourceLanguage || !isSupportedLanguage(content.sourceLanguage)) {
    return {
      valid: false,
      error: `Invalid source language: ${content.sourceLanguage}. Must be a supported language code.`,
    };
  }

  // Validate fields array
  if (!content.fields || !Array.isArray(content.fields) || content.fields.length === 0) {
    return { valid: false, error: 'Content must have at least one field to translate' };
  }

  // Validate each field has a value
  const hasTranslatableContent = content.fields.some(
    (field) => field.value && field.value.trim() !== ''
  );
  if (!hasTranslatableContent) {
    return { valid: false, error: 'At least one field must have non-empty content to translate' };
  }

  // Validate trigger
  if (!trigger || (trigger !== 'create' && trigger !== 'update')) {
    return {
      valid: false,
      error: `Invalid trigger: ${trigger}. Must be 'create' or 'update'.`,
    };
  }

  // Validate excludeLanguages if provided
  if (excludeLanguages && Array.isArray(excludeLanguages)) {
    for (const lang of excludeLanguages) {
      if (!isSupportedLanguage(lang)) {
        return {
          valid: false,
          error: `Invalid excluded language: ${lang}. Must be a supported language code.`,
        };
      }
    }
  }

  return { valid: true };
}
```

#### Verification Steps
```bash
# TypeScript compilation check
npx tsc --noEmit src/lib/content-translation/content-translation.ts 2>&1

# Check function is defined
grep -n "function validateQueueOptions" src/lib/content-translation/content-translation.ts
```

---

### Task 3: Implement Priority Calculation Helper
**Story Points: 0.5**
**File: `/src/lib/content-translation/content-translation.ts`**

#### Description
Implement a helper function to calculate job priority based on trigger type and optional custom override.

#### Acceptance Criteria
- [ ] `calculateJobPriority` function is implemented
- [ ] Returns priority 100 for 'create' trigger
- [ ] Returns priority 50 for 'update' trigger
- [ ] Allows custom priority override via optional parameter
- [ ] Custom priority overrides default trigger-based priority
- [ ] Function is properly typed and documented

#### Implementation Details

```typescript
/**
 * Calculates job priority based on trigger type and custom override.
 *
 * Priority levels:
 * - CREATE (100): New content, highest priority for fast guest access
 * - UPDATE (50): Updated content, medium priority
 *
 * @param trigger - The translation trigger type ('create' or 'update')
 * @param customPriority - Optional custom priority override (higher = more urgent)
 * @returns Calculated priority value
 * @internal
 */
function calculateJobPriority(
  trigger: TranslationTrigger,
  customPriority?: number
): number {
  // Custom priority takes precedence if provided
  if (customPriority !== undefined && customPriority >= 0) {
    return customPriority;
  }

  // Default priority based on trigger type
  switch (trigger) {
    case 'create':
      return PRIORITY_LEVELS.CREATE;
    case 'update':
      return PRIORITY_LEVELS.UPDATE;
    default:
      return PRIORITY_LEVELS.UPDATE; // Fallback to update priority
  }
}
```

#### Verification Steps
```bash
# Check function is defined
grep -n "function calculateJobPriority" src/lib/content-translation/content-translation.ts

# TypeScript compilation
npx tsc --noEmit src/lib/content-translation/content-translation.ts 2>&1
```

---

### Task 4: Implement Target Language Determination Helper
**Story Points: 0.5**
**File: `/src/lib/content-translation/content-translation.ts`**

#### Description
Implement a helper function to determine which target languages need translation by excluding the source language and any explicitly excluded languages.

#### Acceptance Criteria
- [ ] `determineTargetLanguages` function is implemented
- [ ] Returns all supported languages except source language
- [ ] Excludes any languages in the excludeLanguages array
- [ ] Uses `getOtherLanguages` utility from translation-service types
- [ ] Returns empty array if all languages are excluded
- [ ] Function is properly typed and documented

#### Implementation Details

```typescript
/**
 * Determines target languages by excluding source and any explicitly excluded languages.
 *
 * @param sourceLanguage - The source language to exclude
 * @param excludeLanguages - Optional array of additional languages to exclude
 * @returns Array of target languages for translation
 * @internal
 */
function determineTargetLanguages(
  sourceLanguage: SupportedLanguage,
  excludeLanguages?: SupportedLanguage[]
): SupportedLanguage[] {
  // Get all languages except source
  let targetLanguages = getOtherLanguages(sourceLanguage);

  // Filter out any explicitly excluded languages
  if (excludeLanguages && excludeLanguages.length > 0) {
    const excludeSet = new Set(excludeLanguages);
    targetLanguages = targetLanguages.filter((lang) => !excludeSet.has(lang));
  }

  return targetLanguages;
}
```

#### Verification Steps
```bash
# Check function is defined
grep -n "function determineTargetLanguages" src/lib/content-translation/content-translation.ts

# TypeScript compilation
npx tsc --noEmit src/lib/content-translation/content-translation.ts 2>&1
```

---

### Task 5: Implement Duplicate Detection Helper
**Story Points: 1**
**File: `/src/lib/content-translation/content-translation.ts`**

#### Description
Implement a helper function to check for existing pending or processing translation jobs for an entity, preventing duplicate job creation.

#### Acceptance Criteria
- [ ] `findPendingJobLanguages` function is implemented
- [ ] Queries existing jobs for the entity using `getJobsByEntity`
- [ ] Returns array of languages that have pending ('queued') or processing ('processing') jobs
- [ ] Handles database query errors gracefully
- [ ] Returns empty array if no pending jobs found
- [ ] Logs query results for monitoring

#### Implementation Details

```typescript
/**
 * Checks for existing pending translation jobs to prevent duplicates.
 * Returns languages that already have queued or processing jobs.
 *
 * @param entityType - Type of entity to check
 * @param entityId - ID of the entity
 * @returns Promise resolving to array of languages with pending jobs
 * @internal
 */
async function findPendingJobLanguages(
  entityType: EntityType,
  entityId: string
): Promise<SupportedLanguage[]> {
  try {
    const result = await getJobsByEntity(entityType, entityId);

    if (!result.success || !result.data) {
      // If query fails, return empty to allow job creation
      // (duplicate handling will occur at database level via upsert)
      console.warn('CONTENT_TRANSLATION: Failed to check existing jobs', {
        entityType,
        entityId,
        error: result.error,
      });
      return [];
    }

    // Filter for pending or processing jobs
    const pendingJobs = result.data.filter(
      (job) => job.status === 'queued' || job.status === 'processing'
    );

    const pendingLanguages = pendingJobs.map(
      (job) => job.targetLanguage as SupportedLanguage
    );

    if (pendingLanguages.length > 0) {
      console.log('CONTENT_TRANSLATION: Found existing pending jobs', {
        entityType,
        entityId,
        pendingLanguages,
      });
    }

    return pendingLanguages;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('CONTENT_TRANSLATION: Exception checking pending jobs', {
      entityType,
      entityId,
      error: message,
    });
    return []; // Return empty to allow job creation attempt
  }
}
```

#### Verification Steps
```bash
# Check function is defined
grep -n "async function findPendingJobLanguages" src/lib/content-translation/content-translation.ts

# TypeScript compilation
npx tsc --noEmit src/lib/content-translation/content-translation.ts 2>&1
```

---

### Task 6: Implement Main queueContentTranslations Function
**Story Points: 2**
**File: `/src/lib/content-translation/content-translation.ts`**

#### Description
Implement the main orchestration function that coordinates translation job creation for all target languages.

#### Acceptance Criteria
- [ ] `queueContentTranslations` function is implemented and exported
- [ ] Validates input parameters using `validateQueueOptions`
- [ ] Calculates target languages using `determineTargetLanguages`
- [ ] Checks for existing pending jobs using `findPendingJobLanguages`
- [ ] Skips languages that already have pending jobs
- [ ] Creates batch translation jobs using `createBatchTranslationJobs`
- [ ] Returns comprehensive `QueueTranslationResult` with job IDs
- [ ] Handles partial failures gracefully
- [ ] Includes skipped languages in the result
- [ ] Logs operations with `CONTENT_TRANSLATION:` prefix
- [ ] Passes TypeScript compilation

#### Implementation Details

```typescript
/**
 * Main orchestration function for queueing content translations.
 * Creates translation jobs for all target languages based on options.
 *
 * This function:
 * 1. Validates input parameters
 * 2. Determines target languages (excluding source and any explicit exclusions)
 * 3. Checks for existing pending jobs to prevent duplicates
 * 4. Creates batch translation jobs via job queue
 * 5. Returns comprehensive result with job IDs and status
 *
 * @param options - Queue translation options including content, trigger type, exclusions
 * @returns Promise resolving to QueueTranslationResult with job IDs and status
 *
 * @example
 * ```typescript
 * const result = await queueContentTranslations({
 *   content: {
 *     entityType: 'item',
 *     entityId: 'uuid-123',
 *     sourceLanguage: 'en',
 *     fields: [
 *       { fieldName: 'name', value: 'Coffee Maker', context: { contentType: 'item_name' } }
 *     ]
 *   },
 *   trigger: 'create'
 * });
 *
 * if (result.success) {
 *   console.log('Queued jobs:', result.jobIds);
 * }
 * ```
 */
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult> {
  const startTime = Date.now();

  // Step 1: Validate input parameters
  const validation = validateQueueOptions(options);
  if (!validation.valid) {
    console.error('CONTENT_TRANSLATION: Validation failed', {
      error: validation.error,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: validation.error,
    };
  }

  const { content, trigger, excludeLanguages, priority: customPriority } = options;
  const { entityType, entityId, sourceLanguage, fields } = content;

  console.log('CONTENT_TRANSLATION: Queueing translations', {
    entityType,
    entityId,
    sourceLanguage,
    trigger,
    fieldCount: fields.length,
  });

  try {
    // Step 2: Determine target languages
    const allTargetLanguages = determineTargetLanguages(
      sourceLanguage,
      excludeLanguages
    );

    if (allTargetLanguages.length === 0) {
      console.warn('CONTENT_TRANSLATION: No target languages after exclusions', {
        entityType,
        entityId,
        sourceLanguage,
        excludeLanguages,
      });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: excludeLanguages,
      };
    }

    // Step 3: Check for existing pending jobs
    const pendingLanguages = await findPendingJobLanguages(
      entityType as EntityType,
      entityId
    );

    // Step 4: Filter out languages with pending jobs
    const pendingSet = new Set(pendingLanguages);
    const languagesToQueue = allTargetLanguages.filter(
      (lang) => !pendingSet.has(lang)
    );
    const skippedDueToPending = allTargetLanguages.filter(
      (lang) => pendingSet.has(lang)
    );

    if (languagesToQueue.length === 0) {
      console.log('CONTENT_TRANSLATION: All languages have pending jobs', {
        entityType,
        entityId,
        skippedLanguages: skippedDueToPending,
      });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: skippedDueToPending,
      };
    }

    // Step 5: Calculate priority
    const jobPriority = calculateJobPriority(trigger, customPriority);

    console.log('CONTENT_TRANSLATION: Creating batch jobs', {
      entityType,
      entityId,
      targetLanguages: languagesToQueue,
      priority: jobPriority,
    });

    // Step 6: Create batch translation jobs
    const batchResult = await createBatchTranslationJobs({
      entityType: entityType as EntityType,
      entityId,
      sourceLanguage,
      targetLanguages: languagesToQueue,
    });

    if (!batchResult.success) {
      console.error('CONTENT_TRANSLATION: Failed to create batch jobs', {
        entityType,
        entityId,
        error: batchResult.error,
      });
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: skippedDueToPending,
        error: batchResult.error,
      };
    }

    // Step 7: Extract results
    const createdJobs = batchResult.data || [];
    const jobIds = createdJobs.map((job) => job.id);
    const queuedLanguages = createdJobs.map(
      (job) => job.targetLanguage as SupportedLanguage
    );

    // Combine all skipped languages
    const allSkippedLanguages = [
      ...skippedDueToPending,
      ...(excludeLanguages || []),
    ];
    const uniqueSkippedLanguages = [...new Set(allSkippedLanguages)];

    const durationMs = Date.now() - startTime;

    console.log('CONTENT_TRANSLATION: Jobs queued successfully', {
      entityType,
      entityId,
      jobCount: jobIds.length,
      queuedLanguages,
      skippedLanguages: uniqueSkippedLanguages.length > 0 ? uniqueSkippedLanguages : undefined,
      durationMs,
    });

    return {
      success: true,
      jobIds,
      queuedLanguages,
      skippedLanguages: uniqueSkippedLanguages.length > 0 ? uniqueSkippedLanguages : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('CONTENT_TRANSLATION: Exception queueing translations', {
      entityType,
      entityId,
      error: message,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception queueing translations: ${message}`,
    };
  }
}
```

#### Verification Steps
```bash
# Check function is exported
grep -n "export async function queueContentTranslations" src/lib/content-translation/content-translation.ts

# TypeScript compilation
npx tsc --noEmit src/lib/content-translation/content-translation.ts 2>&1

# Check all console.log patterns use correct prefix
grep "CONTENT_TRANSLATION:" src/lib/content-translation/content-translation.ts
```

---

### Task 7: Update Module Index with Function Export
**Story Points: 0.5**
**File: `/src/lib/content-translation/index.ts`**

#### Description
Update the module index file to export the `queueContentTranslations` function for external consumption.

#### Acceptance Criteria
- [ ] `queueContentTranslations` function is exported from index.ts
- [ ] Existing type exports from Task 1.1 are preserved
- [ ] Import path `@/lib/content-translation` resolves correctly
- [ ] Function can be imported using: `import { queueContentTranslations } from '@/lib/content-translation'`

#### Implementation Details

```typescript
// Add to existing exports in /src/lib/content-translation/index.ts

// Function exports
export { queueContentTranslations } from './content-translation';

// Existing type exports (from Task 1.1 - preserve these)
export type {
  QueueTranslationOptions,
  QueueTranslationResult,
  ContentToTranslate,
  TranslatableField,
  TranslationTrigger,
  // ... other existing type exports
} from './content-translation.types';
```

#### Verification Steps
```bash
# Check export statement exists
grep -n "queueContentTranslations" src/lib/content-translation/index.ts

# Test import resolution
echo "import { queueContentTranslations } from '@/lib/content-translation';" > /tmp/test-import.ts
npx tsc --noEmit /tmp/test-import.ts 2>&1

# Full module check
cat src/lib/content-translation/index.ts
```

---

### Task 8: TypeScript Compilation and Integration Verification
**Story Points: 0.5**
**Files: Multiple**

#### Description
Verify complete TypeScript compilation and that the orchestrator integrates correctly with existing modules.

#### Acceptance Criteria
- [ ] No TypeScript compilation errors in the entire project
- [ ] Function is importable from `@/lib/content-translation`
- [ ] Function integrates correctly with `createBatchTranslationJobs`
- [ ] All logging follows established patterns
- [ ] No implicit `any` types in the implementation

#### Verification Steps
```bash
# Full project TypeScript compilation
npx tsc --noEmit

# Check for any implicit any types
npx tsc --noEmit 2>&1 | grep -i "any" || echo "No implicit any types found"

# Verify import resolution works
node -e "
const path = require('path');
console.log('Module should resolve to:', path.resolve('src/lib/content-translation/index.ts'));
"

# Run lint check
npm run lint -- src/lib/content-translation/

# Check function signature
grep -A5 "export async function queueContentTranslations" src/lib/content-translation/content-translation.ts
```

---

## Complete File Structure After Implementation

```
/src/lib/content-translation/
├── index.ts                        # Module exports (modified in Task 7)
├── content-translation.ts          # NEW: Main orchestrator module (Tasks 1-6)
└── content-translation.types.ts    # Types from Task 1.1 (existing)
```

---

## Test Scenarios for Manual Verification

### Scenario 1: Basic Content Translation Queue
```typescript
// Test creating translation jobs for a new item
const result = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: 'test-item-123',
    sourceLanguage: 'en',
    fields: [
      { fieldName: 'name', value: 'Coffee Maker', context: { contentType: 'item_name' } },
      { fieldName: 'description', value: 'Brews delicious coffee', context: { contentType: 'item_description' } }
    ]
  },
  trigger: 'create'
});

// Expected: 5 jobs created (fr, es, de, nl, it)
console.assert(result.success === true);
console.assert(result.jobIds.length === 5);
console.assert(result.queuedLanguages.length === 5);
```

### Scenario 2: With Excluded Languages
```typescript
const result = await queueContentTranslations({
  content: {
    entityType: 'article',
    entityId: 'test-article-456',
    sourceLanguage: 'fr',
    fields: [
      { fieldName: 'title', value: 'Comment utiliser', context: { contentType: 'article_title' } }
    ]
  },
  trigger: 'update',
  excludeLanguages: ['de', 'nl']
});

// Expected: 3 jobs created (en, es, it) - excludes fr (source), de, nl
console.assert(result.success === true);
console.assert(result.queuedLanguages.length === 3);
console.assert(!result.queuedLanguages.includes('fr'));
console.assert(!result.queuedLanguages.includes('de'));
console.assert(!result.queuedLanguages.includes('nl'));
```

### Scenario 3: Invalid Input Handling
```typescript
const result = await queueContentTranslations({
  content: {
    entityType: 'invalid_type' as any,
    entityId: '',
    sourceLanguage: 'xx' as any,
    fields: []
  },
  trigger: 'create'
});

// Expected: Validation failure
console.assert(result.success === false);
console.assert(result.error !== undefined);
```

### Scenario 4: Custom Priority Override
```typescript
const result = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: 'batch-import-item-789',
    sourceLanguage: 'en',
    fields: [
      { fieldName: 'name', value: 'Imported Item', context: { contentType: 'item_name' } }
    ]
  },
  trigger: 'create',
  priority: 25 // Override to BATCH priority
});

// Expected: Jobs created with custom priority
console.assert(result.success === true);
```

---

## Rollback Plan

If implementation causes issues:

1. **Revert content-translation.ts changes**:
   ```bash
   git checkout HEAD -- src/lib/content-translation/content-translation.ts
   ```

2. **Revert index.ts export addition**:
   ```bash
   git checkout HEAD -- src/lib/content-translation/index.ts
   ```

3. **Verify no breaking changes**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

## Dependencies for Downstream Tasks

After this task is complete, the following tasks can proceed:

| Task | Description | Dependency |
|------|-------------|------------|
| Task 1.3 | Entity-specific triggers | Uses `queueContentTranslations` |
| Task 2.2 | Items API modifications | Calls `queueContentTranslations` on POST/PUT |
| Task 2.3 | Articles API modifications | Calls `queueContentTranslations` on POST/PUT |
| Task 2.4 | Links API modifications | Calls `queueContentTranslations` on POST/PUT |

---

## Notes

### Design Decisions Rationale

1. **Delegation Pattern**: Uses `createBatchTranslationJobs` from job-queue module instead of direct database access to maintain separation of concerns and leverage existing error handling.

2. **Silent Skip for Duplicates**: When pending jobs exist for a language, they are skipped silently (included in `skippedLanguages`) rather than treated as errors. This prevents redundant job creation while remaining transparent about what happened.

3. **Partial Success Support**: If batch job creation partially succeeds, the function returns all created jobs along with error details. This ensures no work is lost even when some jobs fail.

4. **Logging Prefix Convention**: All logs use `CONTENT_TRANSLATION:` prefix consistent with existing `JOB_QUEUE:` convention for easy log filtering and monitoring.

### Future Enhancements (Out of Scope)

- Job priority adjustment based on entity popularity
- Rate limiting at orchestration layer (handled by job processor)
- Caching of validation results
- Batch orchestration for multiple entities

---

## References

- Overview Document: [REQ-339-implement-content-translation-orchestrator-overview.md](./REQ-339-implement-content-translation-orchestrator-overview.md)
- Implementation Plan: [Plan-111-L10N-Epic3-Dynamic-Content-Translation.md](./prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- Job Queue Module: [translation-jobs.ts](../src/lib/job-queue/translation-jobs.ts)
- Translation Service Types: [translation-service.types.ts](../src/lib/translation-service/translation-service.types.ts)
