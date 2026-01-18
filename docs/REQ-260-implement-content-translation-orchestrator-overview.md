# REQ-260: Implement Content Translation Orchestrator - Implementation Overview

**Generated:** 2026-01-18 14:30:00 UTC
**Last Modified:** 2026-01-18 14:30:00 UTC
**Request Reference:** REQ-260 - Implement Content Translation Orchestrator
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 1, Task 1.2)
**Status:** Ready for Implementation

---

## 1. Request Summary

Implement the content translation orchestrator - a centralized function that coordinates the creation and queuing of translation jobs for user-generated content across all target languages. When content requires translation, the orchestrator accepts a translation request, automatically creates individual translation jobs for each target language, and returns comprehensive feedback about the operation.

**Scope:**
- Create `/src/lib/content-translation/content-translation.ts` - main orchestrator module
- Implement `queueContentTranslations(options: QueueTranslationOptions): Promise<QueueTranslationResult>` function
- Coordinate translation job creation for all 5 target languages (excluding source)
- Integrate with translation service types from Epic 1 (or types from REQ-259)
- Handle batch translation operations efficiently
- Respect rate limiting and concurrency constraints
- Provide comprehensive error handling and feedback

**Out of Scope:**
- Type definitions (REQ-259 / Task 1.1)
- Entity-specific translation triggers (Tasks 1.3, 1.4)
- Translation storage utilities (Task 1.5)
- Translation status utilities (Task 1.6)
- Actual translation processing (handled by job processor in Phase 3)
- API endpoints (Phase 4)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Supabase | Latest | `@supabase/supabase-js`, `@supabase/ssr` |
| Tailwind CSS | ^4 | `package.json` |

### Relevant Existing Patterns

| Pattern | Location | Usage for REQ-260 |
|---------|----------|-------------------|
| Admin auth validation | `/src/lib/auth-server.ts` | Pattern for server-side validation |
| Supabase client usage | `/src/lib/supabase.ts` | Database interaction pattern |
| Supabase server client | `/src/lib/supabase-server.ts` | Server-side Supabase client |
| API route patterns | `/src/app/api/admin/items/route.ts` | Error handling, response formatting |
| Type definitions | `/src/types/index.ts` | TypeScript interface patterns |

### Dependencies from REQ-259 (Task 1.1)

This task depends on the following from REQ-259:

| Component | Expected Location | Required Types |
|-----------|-------------------|----------------|
| Type definitions | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationOptions`, `QueueTranslationResult`, `ContentToTranslate`, `TranslatableField`, `TranslationJob`, `CreateTranslationJobInput`, `SupportedLanguage`, `EntityType`, `TranslationTrigger` |
| Index exports | `/src/lib/content-translation/index.ts` | All type exports |
| Constants | `/src/lib/content-translation/content-translation.types.ts` | `SUPPORTED_LANGUAGES`, `TRANSLATION_PRIORITIES`, `getTargetLanguages` |

### Dependencies from Epic 1 (Plan-110)

| Component | Expected Location | Status |
|-----------|-------------------|--------|
| Translation tables | Database | **Required** - `translation_jobs` table must exist |
| Job queue infrastructure | `/src/lib/job-queue/` | **Optional** - can insert directly to database |
| Translation service | `/src/lib/translation-service/` | **Not needed** - orchestrator only queues jobs |

**Note:** If Epic 1 job queue infrastructure exists, integrate with it. Otherwise, insert directly into `translation_jobs` table.

---

## 3. Technical Approach

### Orchestrator Architecture

```
queueContentTranslations()
    │
    ├── 1. Validate input
    │       - Verify content has required fields
    │       - Verify sourceLanguage is valid
    │       - Verify entityType is valid
    │
    ├── 2. Determine target languages
    │       - Get all supported languages
    │       - Exclude source language
    │       - Exclude any languages in excludeLanguages option
    │
    ├── 3. Determine priority
    │       - Use priority from options if provided
    │       - Otherwise use TRANSLATION_PRIORITIES[trigger]
    │
    ├── 4. Create translation jobs (batch insert)
    │       - Build job records for each target language
    │       - Insert all jobs in single database transaction
    │       - Handle partial failures
    │
    └── 5. Return result
            - Return success status
            - Return job IDs
            - Return queued languages
            - Return any errors
```

### Database Interaction

The orchestrator will insert jobs into the `translation_jobs` table:

```sql
-- Expected table structure from Epic 1
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'queued',
  priority INTEGER DEFAULT 50,
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  account_id UUID
);
```

### Error Handling Strategy

1. **Validation Errors:** Return immediately with clear error message
2. **Database Errors:** Wrap in try-catch, return detailed error
3. **Partial Failures:** Track per-language errors, return success for completed jobs
4. **Rate Limiting:** Respect any job queue rate limits (defer to job processor)

### Concurrency Considerations

- The orchestrator only **creates** jobs, it does not process them
- Multiple calls can safely run concurrently
- Job processing concurrency is handled by the job processor (Phase 3)

---

## 4. Implementation Tasks

### Task 1.2.1: Create content-translation.ts file structure

**Action:** Create the main orchestrator file with imports and function signature
**File:** `/src/lib/content-translation/content-translation.ts`

**Initial Structure:**
```typescript
/**
 * Content Translation Orchestrator
 *
 * Coordinates the creation and queuing of translation jobs for
 * user-generated content across all target languages.
 *
 * @module content-translation/orchestrator
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  QueueTranslationOptions,
  QueueTranslationResult,
  SupportedLanguage,
  CreateTranslationJobInput,
  ContentTranslationError,
  ContentTranslationErrorCode,
  SUPPORTED_LANGUAGES,
  TRANSLATION_PRIORITIES,
  getTargetLanguages,
  isSupportedLanguage,
  isEntityType,
  createContentTranslationError,
} from './content-translation.types';

// Implementation follows...
```

### Task 1.2.2: Implement input validation helper

**Action:** Create validation function for QueueTranslationOptions
**File:** `/src/lib/content-translation/content-translation.ts`

**Content:**
```typescript
/**
 * Validates queue translation options
 * @throws ContentTranslationError if validation fails
 */
function validateQueueOptions(options: QueueTranslationOptions): void {
  const { content, trigger } = options;

  // Validate content structure
  if (!content) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      'Content is required'
    );
  }

  // Validate entity type
  if (!isEntityType(content.entityType)) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.INVALID_ENTITY_TYPE,
      `Invalid entity type: ${content.entityType}. Must be one of: item, article, link, tag`,
      { entityType: content.entityType }
    );
  }

  // Validate entity ID
  if (!content.entityId || typeof content.entityId !== 'string') {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      'Entity ID is required and must be a string',
      { entityType: content.entityType }
    );
  }

  // Validate source language
  if (!isSupportedLanguage(content.sourceLanguage)) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.INVALID_LANGUAGE,
      `Invalid source language: ${content.sourceLanguage}. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
      { entityType: content.entityType, entityId: content.entityId }
    );
  }

  // Validate fields array
  if (!content.fields || !Array.isArray(content.fields) || content.fields.length === 0) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      'At least one field is required for translation',
      { entityType: content.entityType, entityId: content.entityId }
    );
  }

  // Validate each field has required properties
  for (const field of content.fields) {
    if (!field.fieldName || typeof field.fieldName !== 'string') {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        'Each field must have a fieldName',
        { entityType: content.entityType, entityId: content.entityId }
      );
    }
    if (field.value === undefined || field.value === null) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        `Field "${field.fieldName}" must have a value`,
        { entityType: content.entityType, entityId: content.entityId }
      );
    }
  }

  // Validate trigger
  const validTriggers = ['create', 'update', 'retry', 'manual', 'batch_import'];
  if (!validTriggers.includes(trigger)) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      `Invalid trigger: ${trigger}. Must be one of: ${validTriggers.join(', ')}`,
      { entityType: content.entityType, entityId: content.entityId }
    );
  }

  // Validate excludeLanguages if provided
  if (options.excludeLanguages) {
    for (const lang of options.excludeLanguages) {
      if (!isSupportedLanguage(lang)) {
        throw createContentTranslationError(
          ContentTranslationErrorCode.INVALID_LANGUAGE,
          `Invalid language in excludeLanguages: ${lang}`,
          { entityType: content.entityType, entityId: content.entityId }
        );
      }
    }
  }
}
```

### Task 1.2.3: Implement target language calculation

**Action:** Create function to determine which languages to translate to
**File:** `/src/lib/content-translation/content-translation.ts`

**Content:**
```typescript
/**
 * Determines the target languages for translation
 * @param sourceLanguage - The source language to exclude
 * @param excludeLanguages - Additional languages to exclude
 * @returns Array of target languages
 */
function determineTargetLanguages(
  sourceLanguage: SupportedLanguage,
  excludeLanguages?: SupportedLanguage[]
): SupportedLanguage[] {
  // Start with all languages except source
  let targetLanguages = getTargetLanguages(sourceLanguage);

  // Remove any additional excluded languages
  if (excludeLanguages && excludeLanguages.length > 0) {
    const excludeSet = new Set(excludeLanguages);
    targetLanguages = targetLanguages.filter(lang => !excludeSet.has(lang));
  }

  return targetLanguages;
}
```

### Task 1.2.4: Implement job creation function

**Action:** Create function to build and insert translation jobs
**File:** `/src/lib/content-translation/content-translation.ts`

**Content:**
```typescript
/**
 * Creates translation jobs in the database
 * @param options - Queue options including content and trigger
 * @param targetLanguages - Languages to create jobs for
 * @param priority - Job priority level
 * @returns Object containing job IDs and any errors
 */
async function createTranslationJobs(
  options: QueueTranslationOptions,
  targetLanguages: SupportedLanguage[],
  priority: number
): Promise<{
  jobIds: string[];
  queuedLanguages: SupportedLanguage[];
  errors: Record<SupportedLanguage, string>;
}> {
  const { content } = options;
  const jobIds: string[] = [];
  const queuedLanguages: SupportedLanguage[] = [];
  const errors: Record<SupportedLanguage, string> = {} as Record<SupportedLanguage, string>;

  // Build job records for batch insert
  const jobRecords: CreateTranslationJobInput[] = targetLanguages.map(targetLang => ({
    entity_type: content.entityType,
    entity_id: content.entityId,
    source_language: content.sourceLanguage,
    target_language: targetLang,
    priority,
    account_id: options.accountId,
  }));

  // Attempt batch insert
  try {
    const { data: insertedJobs, error: insertError } = await supabaseAdmin
      .from('translation_jobs')
      .insert(jobRecords)
      .select('id, target_language');

    if (insertError) {
      // If batch insert fails, try individual inserts to identify specific failures
      console.error('Batch insert failed, attempting individual inserts:', insertError);

      for (const record of jobRecords) {
        try {
          const { data: job, error: jobError } = await supabaseAdmin
            .from('translation_jobs')
            .insert(record)
            .select('id, target_language')
            .single();

          if (jobError) {
            errors[record.target_language as SupportedLanguage] = jobError.message;
          } else if (job) {
            jobIds.push(job.id);
            queuedLanguages.push(job.target_language as SupportedLanguage);
          }
        } catch (err) {
          errors[record.target_language as SupportedLanguage] =
            err instanceof Error ? err.message : 'Unknown error';
        }
      }
    } else if (insertedJobs) {
      // Batch insert succeeded
      for (const job of insertedJobs) {
        jobIds.push(job.id);
        queuedLanguages.push(job.target_language as SupportedLanguage);
      }
    }
  } catch (err) {
    // Catastrophic failure - mark all languages as failed
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    for (const targetLang of targetLanguages) {
      errors[targetLang] = errorMessage;
    }
  }

  return { jobIds, queuedLanguages, errors };
}
```

### Task 1.2.5: Implement main queueContentTranslations function

**Action:** Create the main exported orchestrator function
**File:** `/src/lib/content-translation/content-translation.ts`

**Content:**
```typescript
/**
 * Queue content translations for all target languages
 *
 * This is the main entry point for triggering content translation.
 * It creates translation jobs for each target language (excluding source)
 * and returns a result indicating which jobs were successfully queued.
 *
 * @param options - Options specifying what content to translate and how
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * const result = await queueContentTranslations({
 *   content: {
 *     entityType: 'item',
 *     entityId: 'uuid-here',
 *     sourceLanguage: 'en',
 *     fields: [
 *       { fieldName: 'name', value: 'Coffee Maker', context: TRANSLATION_CONTEXTS.item_name },
 *       { fieldName: 'description', value: 'How to use...', context: TRANSLATION_CONTEXTS.item_description }
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
  const { content, trigger, excludeLanguages, priority: customPriority } = options;

  try {
    // Step 1: Validate input
    validateQueueOptions(options);

    // Step 2: Determine target languages
    const targetLanguages = determineTargetLanguages(
      content.sourceLanguage,
      excludeLanguages
    );

    // If no target languages (e.g., all excluded), return early success
    if (targetLanguages.length === 0) {
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [...SUPPORTED_LANGUAGES].filter(
          lang => lang !== content.sourceLanguage
        ) as SupportedLanguage[],
      };
    }

    // Step 3: Determine priority
    const priority = customPriority ?? TRANSLATION_PRIORITIES[trigger] ?? 50;

    // Step 4: Create translation jobs
    const { jobIds, queuedLanguages, errors } = await createTranslationJobs(
      options,
      targetLanguages,
      priority
    );

    // Step 5: Build and return result
    const skippedLanguages = targetLanguages.filter(
      lang => !queuedLanguages.includes(lang)
    );

    const hasErrors = Object.keys(errors).length > 0;
    const allFailed = jobIds.length === 0 && hasErrors;

    if (allFailed) {
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: targetLanguages,
        error: 'Failed to queue any translation jobs',
        languageErrors: errors,
      };
    }

    return {
      success: true,
      jobIds,
      queuedLanguages,
      skippedLanguages,
      ...(hasErrors && { languageErrors: errors }),
    };
  } catch (err) {
    // Handle validation or unexpected errors
    if ((err as ContentTranslationError).code) {
      const error = err as ContentTranslationError;
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [],
        error: error.message,
      };
    }

    // Unexpected error
    console.error('Unexpected error in queueContentTranslations:', err);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      skippedLanguages: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
```

### Task 1.2.6: Update index.ts to export orchestrator function

**Action:** Add export for queueContentTranslations to module index
**File:** `/src/lib/content-translation/index.ts`

**Modification:**
```typescript
// Under "FUTURE EXPORTS" section, uncomment and add:

// Task 1.2: Content translation orchestrator
export { queueContentTranslations } from './content-translation';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/content-translation.ts` | Main orchestrator module with `queueContentTranslations` function |

### Files to MODIFY

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/content-translation/index.ts` | Export section | Add export for `queueContentTranslations` |

### Functions to CREATE

| Function Name | File | Purpose |
|---------------|------|---------|
| `queueContentTranslations` | `content-translation.ts` | Main orchestrator - queues translation jobs for all target languages |
| `validateQueueOptions` | `content-translation.ts` | Validates input options before processing |
| `determineTargetLanguages` | `content-translation.ts` | Calculates which languages to translate to |
| `createTranslationJobs` | `content-translation.ts` | Creates and inserts job records in database |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/content-translation.types.ts` | Import types (created in REQ-259) |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` client |
| `/src/app/api/admin/items/route.ts` | Reference error handling patterns |
| `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` | Implementation plan reference |

### No Modifications Required

The following files should NOT be modified for this task:
- `/src/lib/content-translation/content-translation.types.ts` (created in REQ-259)
- `/src/lib/supabase.ts` (use existing supabaseAdmin)
- Any API route files (Phase 2-4 tasks)
- Any component files
- Database schema (Epic 1 responsibility)

---

## 6. Dependencies

### NPM Package Dependencies

None required - uses only existing project dependencies:
- `@supabase/supabase-js` (existing)
- TypeScript built-in types

### Internal Dependencies

| Dependency | Source | Required Items |
|------------|--------|----------------|
| REQ-259 (Task 1.1) | `/src/lib/content-translation/content-translation.types.ts` | All type definitions, constants, and utility functions |
| Supabase client | `/src/lib/supabase.ts` | `supabaseAdmin` |

**Prerequisite:** REQ-259 must be completed before this task can begin.

### Database Dependencies

The `translation_jobs` table must exist (created in Epic 1):

```sql
-- Required table structure
CREATE TABLE IF NOT EXISTS translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'queued',
  priority INTEGER DEFAULT 50,
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  account_id UUID
);
```

If this table doesn't exist, the orchestrator will fail with a database error. This should be documented in error messages to help developers understand the prerequisite.

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 1.3: Item translation trigger | Uses `queueContentTranslations` |
| Task 1.3: Article translation trigger | Uses `queueContentTranslations` |
| Task 1.3: Link translation trigger | Uses `queueContentTranslations` |
| Task 1.4: Tag translation trigger | Uses `queueContentTranslations` |
| Task 2.2: Modify Items API | Calls `queueContentTranslations` on item create/update |
| Task 2.3: Modify Articles API | Calls `queueContentTranslations` on article create/update |
| Task 2.4: Modify Links API | Calls `queueContentTranslations` on link create/update |

---

## 7. Acceptance Criteria

From REQ-260:

- [ ] A `queueContentTranslations` function accepts options including content identifier, source language, target languages, and content type
- [ ] The function creates individual translation jobs for each specified target language
- [ ] The function returns a result object indicating successful job queues, failed attempts, and job tracking identifiers
- [ ] `QueueTranslationOptions` type defines all required parameters for initiating translation orchestration
- [ ] `QueueTranslationResult` type provides comprehensive feedback about queued jobs and any failures
- [ ] The orchestrator integrates with translation service types and infrastructure from Epic 1
- [ ] The function handles errors gracefully and provides detailed error information for failed job creation
- [ ] The implementation supports batch translation operations for multiple content items
- [ ] Job creation respects rate limiting and concurrency constraints from the translation service layer

### Additional Implementation Criteria

- [ ] `/src/lib/content-translation/content-translation.ts` file exists
- [ ] `queueContentTranslations` is exported from `/src/lib/content-translation/index.ts`
- [ ] Function validates all input parameters
- [ ] Function correctly excludes source language from targets
- [ ] Function respects `excludeLanguages` option
- [ ] Function uses correct priority based on trigger type
- [ ] Function handles partial failures (some jobs succeed, some fail)
- [ ] Function logs errors appropriately for debugging
- [ ] TypeScript compilation passes without errors
- [ ] Function can be imported: `import { queueContentTranslations } from '@/lib/content-translation'`

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify REQ-259 is complete:**
   ```bash
   ls -la src/lib/content-translation/
   # Expected: index.ts, content-translation.types.ts
   ```

2. **Verify types can be imported:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

### Post-Implementation Verification

3. **File exists check:**
   ```bash
   ls -la src/lib/content-translation/content-translation.ts
   # Expected: file exists
   ```

4. **TypeScript compilation check:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

5. **Build verification:**
   ```bash
   npm run build
   # Expected: Build completes successfully
   ```

### Unit Test Scenarios

Create `/src/lib/content-translation/__tests__/content-translation.test.ts`:

```typescript
import { queueContentTranslations } from '../content-translation';
import { TRANSLATION_CONTEXTS } from '../content-translation.types';

describe('queueContentTranslations', () => {
  describe('validation', () => {
    it('should reject missing content', async () => {
      const result = await queueContentTranslations({
        content: null as any,
        trigger: 'create'
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Content is required');
    });

    it('should reject invalid entity type', async () => {
      const result = await queueContentTranslations({
        content: {
          entityType: 'invalid' as any,
          entityId: 'test-id',
          sourceLanguage: 'en',
          fields: []
        },
        trigger: 'create'
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid entity type');
    });

    it('should reject invalid source language', async () => {
      const result = await queueContentTranslations({
        content: {
          entityType: 'item',
          entityId: 'test-id',
          sourceLanguage: 'xx' as any,
          fields: []
        },
        trigger: 'create'
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid source language');
    });

    it('should reject empty fields array', async () => {
      const result = await queueContentTranslations({
        content: {
          entityType: 'item',
          entityId: 'test-id',
          sourceLanguage: 'en',
          fields: []
        },
        trigger: 'create'
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one field is required');
    });
  });

  describe('target language determination', () => {
    it('should exclude source language from targets', async () => {
      // Mock database insert to capture job records
      // Verify 5 jobs created (all languages except 'en')
    });

    it('should respect excludeLanguages option', async () => {
      // Mock database insert
      // Verify excluded languages are not in job records
    });
  });

  describe('priority handling', () => {
    it('should use create priority (100) for create trigger', async () => {
      // Verify jobs have priority 100
    });

    it('should use update priority (75) for update trigger', async () => {
      // Verify jobs have priority 75
    });

    it('should use custom priority when provided', async () => {
      // Verify jobs have custom priority
    });
  });

  describe('job creation', () => {
    it('should return job IDs on success', async () => {
      // Mock successful database insert
      // Verify result contains job IDs
    });

    it('should handle partial failures', async () => {
      // Mock database to fail for some languages
      // Verify success is true if at least one succeeded
      // Verify languageErrors contains failed languages
    });

    it('should return success false if all jobs fail', async () => {
      // Mock database to fail all inserts
      // Verify success is false
      // Verify error message present
    });
  });
});
```

### Integration Test Scenarios

1. **Happy Path - Item Translation:**
   ```typescript
   const result = await queueContentTranslations({
     content: {
       entityType: 'item',
       entityId: 'test-item-uuid',
       sourceLanguage: 'en',
       fields: [
         { fieldName: 'name', value: 'Coffee Maker', context: TRANSLATION_CONTEXTS.item_name },
         { fieldName: 'description', value: 'Makes coffee', context: TRANSLATION_CONTEXTS.item_description }
       ]
     },
     trigger: 'create'
   });
   expect(result.success).toBe(true);
   expect(result.queuedLanguages).toHaveLength(5); // fr, es, de, nl, it
   expect(result.jobIds).toHaveLength(5);
   ```

2. **Verify Jobs in Database:**
   ```sql
   SELECT * FROM translation_jobs
   WHERE entity_id = 'test-item-uuid'
   ORDER BY target_language;
   -- Expected: 5 rows with status 'queued' and priority 100
   ```

### Manual Verification Checklist

- [ ] `content-translation.ts` file exists and contains all functions
- [ ] Function is exported from `index.ts`
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] Function can be imported in other modules
- [ ] Database jobs are created with correct structure
- [ ] Validation errors return appropriate messages
- [ ] Priority values match `TRANSLATION_PRIORITIES` constants

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database table doesn't exist (Epic 1 incomplete) | Medium | High | Add clear error message; document prerequisite |
| Type incompatibility with REQ-259 types | Low | Medium | Follow exact type signatures from REQ-259 |
| Batch insert performance issues | Low | Low | Fallback to individual inserts; log for monitoring |
| Concurrent job creation race conditions | Low | Low | Use unique constraints on (entity_id, target_language) |
| Memory issues with large batch operations | Low | Medium | Process in reasonable batch sizes (5 languages max per entity) |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1.2.1: Create file structure | 5 min |
| Task 1.2.2: Implement validation helper | 15 min |
| Task 1.2.3: Implement target language calculation | 5 min |
| Task 1.2.4: Implement job creation function | 20 min |
| Task 1.2.5: Implement main orchestrator function | 15 min |
| Task 1.2.6: Update index exports | 2 min |
| Testing and verification | 20 min |
| **Total** | **~80 min** |

---

## 11. Implementation Commands Summary

```bash
# Step 1: Verify REQ-259 is complete
ls -la src/lib/content-translation/
# Expected: index.ts, content-translation.types.ts

# Step 2: Create content-translation.ts
# (Use content from Tasks 1.2.1 - 1.2.5)

# Step 3: Update index.ts exports
# (Add export for queueContentTranslations)

# Step 4: Verify TypeScript compilation
npx tsc --noEmit

# Step 5: Verify build
npm run build

# Step 6: Verify import works
# Create temporary test file and run:
# import { queueContentTranslations } from '@/lib/content-translation'
```

---

## 12. Complete File Content

### `/src/lib/content-translation/content-translation.ts`

```typescript
/**
 * Content Translation Orchestrator
 *
 * Coordinates the creation and queuing of translation jobs for
 * user-generated content across all target languages.
 *
 * @module content-translation/orchestrator
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  QueueTranslationOptions,
  QueueTranslationResult,
  SupportedLanguage,
  CreateTranslationJobInput,
  ContentTranslationError,
  ContentTranslationErrorCode,
  SUPPORTED_LANGUAGES,
  TRANSLATION_PRIORITIES,
  getTargetLanguages,
  isSupportedLanguage,
  isEntityType,
  createContentTranslationError,
} from './content-translation.types';

/**
 * Validates queue translation options
 * @throws ContentTranslationError if validation fails
 */
function validateQueueOptions(options: QueueTranslationOptions): void {
  const { content, trigger } = options;

  // Validate content structure
  if (!content) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      'Content is required'
    );
  }

  // Validate entity type
  if (!isEntityType(content.entityType)) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.INVALID_ENTITY_TYPE,
      `Invalid entity type: ${content.entityType}. Must be one of: item, article, link, tag`,
      { entityType: content.entityType }
    );
  }

  // Validate entity ID
  if (!content.entityId || typeof content.entityId !== 'string') {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      'Entity ID is required and must be a string',
      { entityType: content.entityType }
    );
  }

  // Validate source language
  if (!isSupportedLanguage(content.sourceLanguage)) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.INVALID_LANGUAGE,
      `Invalid source language: ${content.sourceLanguage}. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
      { entityType: content.entityType, entityId: content.entityId }
    );
  }

  // Validate fields array
  if (!content.fields || !Array.isArray(content.fields) || content.fields.length === 0) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      'At least one field is required for translation',
      { entityType: content.entityType, entityId: content.entityId }
    );
  }

  // Validate each field has required properties
  for (const field of content.fields) {
    if (!field.fieldName || typeof field.fieldName !== 'string') {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        'Each field must have a fieldName',
        { entityType: content.entityType, entityId: content.entityId }
      );
    }
    if (field.value === undefined || field.value === null) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        `Field "${field.fieldName}" must have a value`,
        { entityType: content.entityType, entityId: content.entityId }
      );
    }
  }

  // Validate trigger
  const validTriggers = ['create', 'update', 'retry', 'manual', 'batch_import'];
  if (!validTriggers.includes(trigger)) {
    throw createContentTranslationError(
      ContentTranslationErrorCode.VALIDATION_ERROR,
      `Invalid trigger: ${trigger}. Must be one of: ${validTriggers.join(', ')}`,
      { entityType: content.entityType, entityId: content.entityId }
    );
  }

  // Validate excludeLanguages if provided
  if (options.excludeLanguages) {
    for (const lang of options.excludeLanguages) {
      if (!isSupportedLanguage(lang)) {
        throw createContentTranslationError(
          ContentTranslationErrorCode.INVALID_LANGUAGE,
          `Invalid language in excludeLanguages: ${lang}`,
          { entityType: content.entityType, entityId: content.entityId }
        );
      }
    }
  }
}

/**
 * Determines the target languages for translation
 * @param sourceLanguage - The source language to exclude
 * @param excludeLanguages - Additional languages to exclude
 * @returns Array of target languages
 */
function determineTargetLanguages(
  sourceLanguage: SupportedLanguage,
  excludeLanguages?: SupportedLanguage[]
): SupportedLanguage[] {
  // Start with all languages except source
  let targetLanguages = getTargetLanguages(sourceLanguage);

  // Remove any additional excluded languages
  if (excludeLanguages && excludeLanguages.length > 0) {
    const excludeSet = new Set(excludeLanguages);
    targetLanguages = targetLanguages.filter(lang => !excludeSet.has(lang));
  }

  return targetLanguages;
}

/**
 * Creates translation jobs in the database
 * @param options - Queue options including content and trigger
 * @param targetLanguages - Languages to create jobs for
 * @param priority - Job priority level
 * @returns Object containing job IDs and any errors
 */
async function createTranslationJobs(
  options: QueueTranslationOptions,
  targetLanguages: SupportedLanguage[],
  priority: number
): Promise<{
  jobIds: string[];
  queuedLanguages: SupportedLanguage[];
  errors: Record<SupportedLanguage, string>;
}> {
  const { content } = options;
  const jobIds: string[] = [];
  const queuedLanguages: SupportedLanguage[] = [];
  const errors: Record<SupportedLanguage, string> = {} as Record<SupportedLanguage, string>;

  // Build job records for batch insert
  const jobRecords: CreateTranslationJobInput[] = targetLanguages.map(targetLang => ({
    entity_type: content.entityType,
    entity_id: content.entityId,
    source_language: content.sourceLanguage,
    target_language: targetLang,
    priority,
    account_id: options.accountId,
  }));

  // Attempt batch insert
  try {
    const { data: insertedJobs, error: insertError } = await supabaseAdmin
      .from('translation_jobs')
      .insert(jobRecords)
      .select('id, target_language');

    if (insertError) {
      // If batch insert fails, try individual inserts to identify specific failures
      console.error('Batch translation job insert failed, attempting individual inserts:', insertError.message);

      for (const record of jobRecords) {
        try {
          const { data: job, error: jobError } = await supabaseAdmin
            .from('translation_jobs')
            .insert(record)
            .select('id, target_language')
            .single();

          if (jobError) {
            errors[record.target_language as SupportedLanguage] = jobError.message;
          } else if (job) {
            jobIds.push(job.id);
            queuedLanguages.push(job.target_language as SupportedLanguage);
          }
        } catch (err) {
          errors[record.target_language as SupportedLanguage] =
            err instanceof Error ? err.message : 'Unknown error';
        }
      }
    } else if (insertedJobs) {
      // Batch insert succeeded
      for (const job of insertedJobs) {
        jobIds.push(job.id);
        queuedLanguages.push(job.target_language as SupportedLanguage);
      }
    }
  } catch (err) {
    // Catastrophic failure - mark all languages as failed
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    console.error('Database error creating translation jobs:', errorMessage);
    for (const targetLang of targetLanguages) {
      errors[targetLang] = errorMessage;
    }
  }

  return { jobIds, queuedLanguages, errors };
}

/**
 * Queue content translations for all target languages
 *
 * This is the main entry point for triggering content translation.
 * It creates translation jobs for each target language (excluding source)
 * and returns a result indicating which jobs were successfully queued.
 *
 * @param options - Options specifying what content to translate and how
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * import { queueContentTranslations, TRANSLATION_CONTEXTS } from '@/lib/content-translation';
 *
 * const result = await queueContentTranslations({
 *   content: {
 *     entityType: 'item',
 *     entityId: 'uuid-here',
 *     sourceLanguage: 'en',
 *     fields: [
 *       { fieldName: 'name', value: 'Coffee Maker', context: TRANSLATION_CONTEXTS.item_name },
 *       { fieldName: 'description', value: 'How to use...', context: TRANSLATION_CONTEXTS.item_description }
 *     ]
 *   },
 *   trigger: 'create'
 * });
 *
 * if (result.success) {
 *   console.log('Queued jobs:', result.jobIds);
 *   console.log('Languages queued:', result.queuedLanguages);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 */
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult> {
  const { content, trigger, excludeLanguages, priority: customPriority } = options;

  try {
    // Step 1: Validate input
    validateQueueOptions(options);

    // Step 2: Determine target languages
    const targetLanguages = determineTargetLanguages(
      content.sourceLanguage,
      excludeLanguages
    );

    // If no target languages (e.g., all excluded), return early success
    if (targetLanguages.length === 0) {
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [...SUPPORTED_LANGUAGES].filter(
          lang => lang !== content.sourceLanguage
        ) as SupportedLanguage[],
      };
    }

    // Step 3: Determine priority
    const priority = customPriority ?? TRANSLATION_PRIORITIES[trigger] ?? 50;

    // Step 4: Create translation jobs
    const { jobIds, queuedLanguages, errors } = await createTranslationJobs(
      options,
      targetLanguages,
      priority
    );

    // Step 5: Build and return result
    const skippedLanguages = targetLanguages.filter(
      lang => !queuedLanguages.includes(lang)
    );

    const hasErrors = Object.keys(errors).length > 0;
    const allFailed = jobIds.length === 0 && hasErrors;

    if (allFailed) {
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: targetLanguages,
        error: 'Failed to queue any translation jobs. Ensure the translation_jobs table exists (Epic 1 prerequisite).',
        languageErrors: errors,
      };
    }

    return {
      success: true,
      jobIds,
      queuedLanguages,
      skippedLanguages,
      ...(hasErrors && { languageErrors: errors }),
    };
  } catch (err) {
    // Handle validation or unexpected errors
    if ((err as ContentTranslationError).code) {
      const error = err as ContentTranslationError;
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [],
        error: error.message,
      };
    }

    // Unexpected error
    console.error('Unexpected error in queueContentTranslations:', err);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      skippedLanguages: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
```

---

## 13. Next Steps After Implementation

After completing Task 1.2 (this task):

1. **Task 1.3:** Implement entity-specific translation triggers (`item-trigger.ts`, `article-trigger.ts`, `link-trigger.ts`)
2. **Task 1.4:** Implement tag translation trigger (`tag-trigger.ts`)
3. **Task 1.5:** Implement translation storage utilities (`translation-storage.ts`)
4. **Task 1.6:** Implement translation status utilities (`translation-status.ts`)

The orchestrator created in this task will be used by all trigger functions to queue translation jobs consistently.

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-260
- [Type Definitions Task](/docs/REQ-259-create-content-translation-module-structure-overview.md) - REQ-259
- [Existing Supabase Client](/src/lib/supabase.ts)
- [API Route Patterns](/src/app/api/admin/items/route.ts)

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.2*
