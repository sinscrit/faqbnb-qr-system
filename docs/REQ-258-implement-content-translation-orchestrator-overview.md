# REQ-258: Implement Content Translation Orchestrator - Implementation Overview

**Generated:** 2026-01-18 08:30:00 UTC
**Last Modified:** 2026-01-18 08:30:00 UTC
**Request Reference:** REQ-258 - Implement Content Translation Orchestrator
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 1, Task 1.2)
**Status:** Ready for Implementation

---

## 1. Request Summary

Implement the content translation orchestrator module that coordinates multi-language translation job creation for user-generated content. When content requires translation into multiple languages, the orchestrator automatically creates individual translation jobs for each target language, tracks their status, and returns a consolidated result.

**Scope:**
- Create main orchestrator function `queueContentTranslations(options: QueueTranslationOptions): Promise<QueueTranslationResult>`
- Coordinate translation job creation for all target languages (5 languages excluding source)
- Handle batch job creation efficiently without redundant jobs
- Integrate with translation service types from Epic 1
- Return job identifiers for tracking translation progress

**Out of Scope:**
- Entity-specific translation triggers (Task 1.3: item-trigger.ts, article-trigger.ts, link-trigger.ts)
- Tag translation trigger (Task 1.4)
- Translation storage utilities (Task 1.5)
- Translation status utilities (Task 1.6)
- API endpoint modifications (Phase 2)
- Job processing enhancements (Phase 3)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Supabase | Client/Admin | `/src/lib/supabase.ts` |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| API auth validation | `/src/lib/auth-server.ts` | `validateAdminAuth` pattern for authentication |
| Account context helper | `/src/app/api/admin/items/route.ts` | `getAccountContext` helper for multi-tenant context |
| Item CRUD operations | `/src/app/api/admin/items/route.ts` | POST handler pattern for item creation |
| Article CRUD operations | `/src/app/api/admin/articles/route.ts` | POST handler pattern for article creation |
| Database types | `/src/lib/supabase.ts` | TypeScript database type definitions |
| Types export pattern | `/src/types/index.ts` | Central type definitions and exports |

### Epic 1 Dependencies (Required Infrastructure)

| Component | Expected Location | Status |
|-----------|------------------|--------|
| Translation tables | Database | **Required** - `translation_jobs`, `item_translations`, `article_translations`, `link_translations`, `tag_translations` |
| Translation service types | `/src/lib/translation-service/` | **Required** - `SupportedLanguage`, `TranslationContext` |
| Job queue infrastructure | `/src/lib/job-queue/` | **Required** - Job processing infrastructure |

**IMPORTANT:** Epic 1 infrastructure must be in place before this orchestrator can function. The orchestrator depends on:
- `translation_jobs` table for storing queued jobs
- `SupportedLanguage` type for language validation
- Translation service types for context definition

### Supported Languages

| Code | Language | Role |
|------|----------|------|
| `en` | English | May be source or target |
| `fr` | French | May be source or target |
| `es` | Spanish | May be source or target |
| `de` | German | May be source or target |
| `nl` | Dutch | May be source or target |
| `it` | Italian | May be source or target |

---

## 3. Technical Approach

### Module Structure

```
/src/lib/content-translation/
├── index.ts                        # Module exports
├── content-translation.ts          # Main orchestrator (THIS TASK)
└── content-translation.types.ts    # Content-specific types (from Task 1.1)
```

### Orchestrator Function Signature

```typescript
/**
 * Queue translation jobs for content across all target languages.
 *
 * @param options - Configuration for translation queueing
 * @returns Result with job IDs and status of queueing operation
 */
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult>
```

### Core Logic Flow

```
queueContentTranslations(options)
    │
    ├── 1. Validate input parameters
    │       - Validate content has entityType, entityId, sourceLanguage
    │       - Validate fields array is non-empty
    │       - Validate sourceLanguage is supported
    │
    ├── 2. Determine target languages
    │       - Get all supported languages
    │       - Exclude sourceLanguage
    │       - Exclude any languages in excludeLanguages option
    │       - Result: 5 target languages (or fewer if excluded)
    │
    ├── 3. Calculate priority
    │       - If custom priority provided, use it
    │       - If trigger === 'create', priority = 100 (high)
    │       - If trigger === 'update', priority = 50 (medium)
    │       - Default: priority = 25 (standard)
    │
    ├── 4. Prepare job records (one per target language)
    │       For each targetLanguage:
    │       - entity_type: content.entityType
    │       - entity_id: content.entityId
    │       - source_language: content.sourceLanguage
    │       - target_language: targetLanguage
    │       - status: 'queued'
    │       - priority: calculated priority
    │       - payload: { fields: content.fields }
    │       - attempts: 0
    │       - created_at: now()
    │
    ├── 5. Batch insert jobs into translation_jobs table
    │       - Use Supabase batch insert
    │       - Handle partial failures gracefully
    │
    └── 6. Return consolidated result
            - success: true if at least one job queued
            - jobIds: array of created job UUIDs
            - queuedLanguages: languages successfully queued
            - error: any error message if complete failure
```

### Error Handling Strategy

| Error Scenario | Handling |
|---------------|----------|
| Invalid source language | Return error immediately, don't queue any jobs |
| Database insert failure | Catch error, attempt to queue remaining languages |
| Partial failure (some jobs fail) | Return success=true with queued languages; note failures |
| Complete failure | Return success=false with error message |
| No target languages (all excluded) | Return success=true with empty jobIds (no work needed) |

### Priority System

| Trigger Type | Priority Value | Description |
|-------------|----------------|-------------|
| `create` | 100 | Newly created content - highest priority |
| `update` | 50 | Updated content - medium priority |
| default | 25 | Batch imports or manual triggers |
| retry | 10 | Retried failed translations |

---

## 4. Implementation Tasks

### Task 1.2.1: Import Dependencies and Constants

**Action:** Set up imports at the top of content-translation.ts

**Code:**
```typescript
import { supabaseAdmin } from '@/lib/supabase';
import {
  QueueTranslationOptions,
  QueueTranslationResult,
  ContentToTranslate,
  EntityType,
  TranslationTrigger
} from './content-translation.types';

// Supported languages - should match Epic 1 configuration
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Priority constants
const PRIORITY = {
  CREATE: 100,    // Newly created content
  UPDATE: 50,     // Updated content
  BATCH: 25,      // Batch imports
  RETRY: 10       // Retry failed translations
} as const;
```

### Task 1.2.2: Implement Language Validation Helper

**Action:** Create helper function to validate source language

**Code:**
```typescript
/**
 * Check if a language code is supported
 */
function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Get target languages (all supported languages except source and excluded)
 */
function getTargetLanguages(
  sourceLanguage: SupportedLanguage,
  excludeLanguages?: SupportedLanguage[]
): SupportedLanguage[] {
  const excluded = new Set([sourceLanguage, ...(excludeLanguages || [])]);
  return SUPPORTED_LANGUAGES.filter(lang => !excluded.has(lang));
}
```

### Task 1.2.3: Implement Priority Calculation

**Action:** Create function to determine job priority

**Code:**
```typescript
/**
 * Calculate translation job priority based on trigger type
 */
function calculatePriority(
  trigger: TranslationTrigger,
  customPriority?: number
): number {
  if (customPriority !== undefined) {
    return customPriority;
  }

  switch (trigger) {
    case 'create':
      return PRIORITY.CREATE;
    case 'update':
      return PRIORITY.UPDATE;
    default:
      return PRIORITY.BATCH;
  }
}
```

### Task 1.2.4: Implement Job Record Preparation

**Action:** Create function to prepare job records for batch insert

**Code:**
```typescript
interface TranslationJobInsert {
  entity_type: EntityType;
  entity_id: string;
  source_language: string;
  target_language: string;
  status: 'queued';
  priority: number;
  payload: Record<string, unknown>;
  attempts: number;
  created_at: string;
}

/**
 * Prepare translation job records for database insertion
 */
function prepareJobRecords(
  content: ContentToTranslate,
  targetLanguages: SupportedLanguage[],
  priority: number
): TranslationJobInsert[] {
  const now = new Date().toISOString();

  return targetLanguages.map(targetLanguage => ({
    entity_type: content.entityType,
    entity_id: content.entityId,
    source_language: content.sourceLanguage,
    target_language: targetLanguage,
    status: 'queued' as const,
    priority,
    payload: {
      fields: content.fields.map(field => ({
        fieldName: field.fieldName,
        value: field.value,
        context: field.context,
        maxLength: field.maxLength
      }))
    },
    attempts: 0,
    created_at: now
  }));
}
```

### Task 1.2.5: Implement Main Orchestrator Function

**Action:** Create the main queueContentTranslations function

**Code:**
```typescript
/**
 * Queue translation jobs for content across all target languages.
 *
 * This function creates translation jobs for each target language,
 * allowing the job processor to handle actual translation work asynchronously.
 *
 * @param options - Configuration for translation queueing
 * @returns Result with job IDs and status of queueing operation
 *
 * @example
 * ```typescript
 * const result = await queueContentTranslations({
 *   content: {
 *     entityType: 'item',
 *     entityId: 'item-123',
 *     sourceLanguage: 'en',
 *     fields: [
 *       { fieldName: 'name', value: 'Coffee Maker', context: { contentType: 'item_name' } },
 *       { fieldName: 'description', value: 'How to use...', context: { contentType: 'item_description' } }
 *     ]
 *   },
 *   trigger: 'create'
 * });
 * ```
 */
export async function queueContentTranslations(
  options: QueueTranslationOptions
): Promise<QueueTranslationResult> {
  const { content, trigger, excludeLanguages, priority: customPriority } = options;

  // Validate source language
  if (!isValidLanguage(content.sourceLanguage)) {
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Invalid source language: ${content.sourceLanguage}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`
    };
  }

  // Validate content has fields to translate
  if (!content.fields || content.fields.length === 0) {
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: 'No fields provided for translation'
    };
  }

  // Validate entity information
  if (!content.entityType || !content.entityId) {
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: 'Missing required entity information (entityType or entityId)'
    };
  }

  // Get target languages
  const targetLanguages = getTargetLanguages(
    content.sourceLanguage,
    excludeLanguages as SupportedLanguage[] | undefined
  );

  // If no target languages (all excluded), return success with empty jobs
  if (targetLanguages.length === 0) {
    console.log(`[ContentTranslation] No target languages for ${content.entityType}:${content.entityId}`);
    return {
      success: true,
      jobIds: [],
      queuedLanguages: []
    };
  }

  // Calculate priority
  const priority = calculatePriority(trigger, customPriority);

  // Prepare job records
  const jobRecords = prepareJobRecords(content, targetLanguages, priority);

  console.log(`[ContentTranslation] Queueing ${jobRecords.length} translation jobs for ${content.entityType}:${content.entityId}`);

  try {
    // Batch insert translation jobs
    const { data: insertedJobs, error: insertError } = await supabaseAdmin
      .from('translation_jobs')
      .insert(jobRecords)
      .select('id, target_language');

    if (insertError) {
      console.error('[ContentTranslation] Failed to insert translation jobs:', insertError);
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        error: `Failed to queue translation jobs: ${insertError.message}`
      };
    }

    const jobIds = (insertedJobs || []).map(job => job.id);
    const queuedLanguages = (insertedJobs || []).map(job => job.target_language) as SupportedLanguage[];

    console.log(`[ContentTranslation] Successfully queued ${jobIds.length} jobs: ${jobIds.join(', ')}`);

    return {
      success: true,
      jobIds,
      queuedLanguages
    };

  } catch (error) {
    console.error('[ContentTranslation] Unexpected error queueing translations:', error);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
```

### Task 1.2.6: Add Module Export

**Action:** Export the orchestrator function from index.ts

**File:** `/src/lib/content-translation/index.ts`

**Code:**
```typescript
// Content Translation Module
// Epic 3 - Dynamic Content Translation

export { queueContentTranslations } from './content-translation';
export type {
  QueueTranslationOptions,
  QueueTranslationResult,
  ContentToTranslate,
  TranslatableField,
  EntityType,
  TranslationTrigger
} from './content-translation.types';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/content-translation.ts` | Main orchestrator implementation |

### Files to MODIFY

| File Path | Changes |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Add export for queueContentTranslations function |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/content-translation.types.ts` | Import type definitions from Task 1.1 |
| `/src/lib/supabase.ts` | Reference for supabaseAdmin client |
| `/src/app/api/admin/items/route.ts` | Reference for integration pattern |
| `/src/app/api/admin/articles/route.ts` | Reference for integration pattern |
| `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` | Implementation plan reference |

### Files NOT to Modify

The following files should NOT be modified for this task:
- `/src/lib/supabase.ts` - Database types will be updated separately when Epic 1 tables are created
- `/src/types/index.ts` - Type exports will be added in a separate task
- `/src/app/api/admin/items/route.ts` - Phase 2 will integrate the orchestrator
- `/src/app/api/admin/articles/route.ts` - Phase 2 will integrate the orchestrator
- Any trigger files (Task 1.3, 1.4)
- Any storage files (Task 1.5, 1.6)

---

## 6. Dependencies

### Required Epic 1 Infrastructure

| Component | Description |
|-----------|-------------|
| `translation_jobs` table | Database table for storing queued translation jobs |
| `SupportedLanguage` type | Type definition for supported language codes |
| Supabase Admin client | For database operations |

### Internal Dependencies (Same Epic)

| Dependency | From Task | Required |
|------------|-----------|----------|
| Type definitions | Task 1.1 | **Yes** - `QueueTranslationOptions`, `QueueTranslationResult`, `ContentToTranslate`, etc. |

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 1.3: Entity-specific triggers | Will import and use `queueContentTranslations` |
| Task 2.2: Items API modification | Will call `queueContentTranslations` after item creation |
| Task 2.3: Articles API modification | Will call `queueContentTranslations` after article creation |

---

## 7. Acceptance Criteria

From REQ-258:

- [ ] System accepts content payload with source language and array of target languages
- [ ] Translation job is created for each requested target language
- [ ] System returns consolidated status showing successfully queued jobs and any failures
- [ ] Failed job creation for one language does not prevent other languages from being queued
- [ ] Batch translation requests are handled efficiently without creating redundant jobs
- [ ] Integration with translation service from Epic 1 functions correctly
- [ ] Orchestrator returns job identifiers that can be used to track translation progress

Additional verification:
- [ ] Function validates source language is supported
- [ ] Function validates content fields are provided
- [ ] Function correctly excludes source language from targets
- [ ] Function respects excludeLanguages option
- [ ] Function calculates priority based on trigger type
- [ ] Function handles database errors gracefully
- [ ] Function logs operations for debugging

---

## 8. Testing Strategy

### Unit Tests

**File:** `/src/lib/content-translation/__tests__/content-translation.test.ts`

```typescript
describe('queueContentTranslations', () => {
  describe('input validation', () => {
    it('should reject invalid source language');
    it('should reject empty fields array');
    it('should reject missing entityType');
    it('should reject missing entityId');
  });

  describe('target language calculation', () => {
    it('should exclude source language from targets');
    it('should exclude languages in excludeLanguages option');
    it('should return empty result when all languages excluded');
  });

  describe('priority calculation', () => {
    it('should use priority 100 for create trigger');
    it('should use priority 50 for update trigger');
    it('should use custom priority when provided');
  });

  describe('job creation', () => {
    it('should create jobs for all target languages');
    it('should return job IDs on success');
    it('should handle database errors gracefully');
  });
});
```

### Integration Tests

```typescript
describe('queueContentTranslations integration', () => {
  it('should insert jobs into translation_jobs table');
  it('should return correct job IDs matching database records');
  it('should set correct status as "queued"');
  it('should set correct priority based on trigger');
});
```

### Manual Verification Checklist

- [ ] Function is exported from `/src/lib/content-translation/index.ts`
- [ ] TypeScript compiles without errors
- [ ] Function can be imported in API routes
- [ ] Database table `translation_jobs` receives inserted records
- [ ] Console logs show appropriate debug information
- [ ] Error cases return appropriate error messages

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | Medium | Critical | Check for translation_jobs table before running; provide helpful error message |
| Database insert fails | Low | Medium | Wrap in try-catch; return detailed error message |
| Type mismatches with Epic 1 | Medium | Medium | Use flexible types initially; update when Epic 1 is complete |
| Performance with many languages | Low | Low | Batch insert is efficient; monitor for future optimization |
| Concurrent content updates | Low | Medium | Each call creates independent jobs; job processor handles deduplication |

---

## 10. Usage Examples

### Basic Usage - Item Creation

```typescript
import { queueContentTranslations } from '@/lib/content-translation';

// After item is created successfully
const translationResult = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: newItem.id,
    sourceLanguage: 'en',
    fields: [
      {
        fieldName: 'name',
        value: newItem.name,
        context: { contentType: 'item_name', domain: 'property_rental' },
        maxLength: 255
      },
      {
        fieldName: 'description',
        value: newItem.description || '',
        context: { contentType: 'item_description', domain: 'property_rental' }
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

### Article Translation

```typescript
const translationResult = await queueContentTranslations({
  content: {
    entityType: 'article',
    entityId: newArticle.id,
    sourceLanguage: userLanguage || 'en',
    fields: [
      {
        fieldName: 'title',
        value: newArticle.title,
        context: { contentType: 'article_title', domain: 'property_rental_instructions' }
      },
      {
        fieldName: 'description',
        value: newArticle.description || '',
        context: { contentType: 'article_description', domain: 'property_rental_instructions' }
      }
    ]
  },
  trigger: 'create',
  excludeLanguages: ['de'] // Optional: skip German translation
});
```

### Update with Custom Priority

```typescript
const translationResult = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: existingItem.id,
    sourceLanguage: 'fr',
    fields: [
      { fieldName: 'name', value: updatedName, context: { contentType: 'item_name' } }
    ]
  },
  trigger: 'update',
  priority: 75 // Custom priority between create (100) and update (50)
});
```

---

## 11. Implementation Commands Summary

```bash
# Step 1: Verify Task 1.1 (types) is complete
ls -la src/lib/content-translation/
cat src/lib/content-translation/content-translation.types.ts

# Step 2: Create the orchestrator file
# (Use content from Task 1.2.5)

# Step 3: Update index.ts exports
# (Use content from Task 1.2.6)

# Step 4: Verify TypeScript compiles
npx tsc --noEmit

# Step 5: Run tests (if test file created)
npm test -- content-translation.test.ts

# Step 6: Verify build works
npm run build
```

---

## 12. Next Steps After Implementation

After completing Task 1.2 (this task):

1. **Task 1.3:** Implement entity-specific translation triggers (`item-trigger.ts`, `article-trigger.ts`, `link-trigger.ts`)
2. **Task 1.4:** Implement tag translation trigger (`tag-trigger.ts`)
3. **Task 1.5:** Implement translation storage utilities (`translation-storage.ts`)
4. **Task 1.6:** Implement translation status utilities (`translation-status.ts`)
5. **Phase 2:** Modify existing content APIs to integrate the orchestrator

---

## References

- [Implementation Plan: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Supabase TypeScript Client](https://supabase.com/docs/reference/javascript/insert)
- [Existing Items API](/src/app/api/admin/items/route.ts)
- [Existing Articles API](/src/app/api/admin/articles/route.ts)

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.2*
