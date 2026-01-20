# REQ-E03-004: Implement Tag Translation Trigger - Detailed Task Breakdown
*Generated: 2026-01-19 19:15:00 UTC*

## Reference
- **Request**: REQ-E03-004 (Implement Tag Translation Trigger)
- **Overview Document**: docs/REQ-E03-004-implement-tag-translation-trigger-overview.md
- **Source**: docs/gen_requests_epic3.md (Request #4)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature (Translation Trigger)
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.4
- **Size**: S (Small)
- **Story Points**: 3

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for creating a specialized tag translation trigger function. Tags differ from other entities (items, articles, links) because:

1. **System tags exist**: 17 pre-seeded tags already have translations in all 6 languages
2. **Tag key is the entity ID**: Unlike UUIDs for other entities, tags use their string key
3. **Single field**: Only one field (`translated_value`) needs translation
4. **Deduplication required**: Must check for existing translations before queuing jobs

The implementation follows the established pattern from Task 1.3 (entity triggers) while adding tag-specific logic for system tag detection and existing translation checks.

---

## Prerequisites

### Required Completed Tasks
- [ ] **Task 1.1**: Content Translation Module Structure (provides types)
- [ ] **Task 1.2**: Content Translation Orchestrator (provides `queueContentTranslations`)
- [ ] **Task 1.3**: Entity-Specific Translation Triggers (provides pattern reference)

### Required Epic 1 Infrastructure
- [ ] Translation jobs table exists with upsert support
- [ ] `tag_translations` table exists with `is_system_tag` column
- [ ] System tags seeded via `20260117_system_tag_translations.sql`
- [ ] Job queue functions available (`createBatchTranslationJobs`)

### Files That Must Exist
| File | Status | Purpose |
|------|--------|---------|
| `/src/lib/content-translation/index.ts` | Task 1.1 | Module exports |
| `/src/lib/content-translation/content-translation.ts` | Task 1.2 | Orchestrator |
| `/src/lib/content-translation/content-translation.types.ts` | Task 1.1 | Type definitions |
| `/src/lib/content-translation/triggers/index.ts` | Task 1.3 | Trigger barrel exports |
| `/src/lib/job-queue/translation-jobs.types.ts` | Epic 1 | `SupportedLanguage` type |
| `/src/lib/translation-service/translation-service.types.ts` | Epic 1 | `getOtherLanguages` helper |

---

## Task Breakdown

### Task 1: Create Tag Trigger File Structure
**Estimated effort**: 5 minutes
**File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

#### 1.1 Create the file with module header
Create a new file at `/src/lib/content-translation/triggers/tag-trigger.ts` with:

```typescript
/**
 * Tag Translation Trigger
 * Part of REQ-E03-004: Implement Tag Translation Trigger
 *
 * This module provides a specialized translation trigger for tag entities.
 * It handles the distinction between system tags (pre-seeded, skip translation)
 * and user-created tags (queue for translation).
 *
 * @module content-translation/triggers/tag-trigger
 * @created 2026-01-19
 */
```

#### 1.2 Add required imports
```typescript
import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import { TRANSLATION_CONTEXTS } from '../content-translation.types';
import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
import { getOtherLanguages } from '@/lib/translation-service';
```

**Verification**:
- [ ] File exists at correct path
- [ ] All imports are correct (no red underlines in IDE)
- [ ] No circular dependency errors

---

### Task 2: Implement System Tag Detection Helper
**Estimated effort**: 10 minutes
**File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

#### 2.1 Add section divider and function documentation
```typescript
// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a tag is a system tag (pre-seeded with translations).
 * System tags are seeded via /database/seeds/20260117_system_tag_translations.sql
 * and have is_system_tag = true in the database.
 *
 * @param tagKey - The tag identifier (e.g., 'kitchen', 'my-custom-tag')
 * @returns Promise resolving to true if this is a system tag
 */
```

#### 2.2 Implement `isSystemTag` function
```typescript
async function isSystemTag(tagKey: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('is_system_tag')
    .eq('tag_key', tagKey)
    .eq('is_system_tag', true)
    .limit(1);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking system tag status', {
      tagKey,
      error: error.message,
    });
    return false; // Assume not system tag on error, will queue translation
  }

  return data !== null && data.length > 0;
}
```

**Design decisions**:
- Uses database as source of truth (not hardcoded constant)
- Returns `false` on error (conservative approach - will queue translation)
- Uses `limit(1)` for efficiency (only need existence check)

**Verification**:
- [ ] Function compiles without errors
- [ ] Console logging follows `TAG_TRIGGER:` prefix pattern
- [ ] Returns `Promise<boolean>` type

---

### Task 3: Implement Existing Translation Check Helper
**Estimated effort**: 10 minutes
**File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

#### 3.1 Add function documentation
```typescript
/**
 * Gets languages that already have translations for a tag.
 *
 * @param tagKey - The tag identifier
 * @returns Promise resolving to array of language codes with existing translations
 */
```

#### 3.2 Implement `getExistingTagTranslationLanguages` function
```typescript
async function getExistingTagTranslationLanguages(
  tagKey: string
): Promise<SupportedLanguage[]> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('language')
    .eq('tag_key', tagKey);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking existing translations', {
      tagKey,
      error: error.message,
    });
    return []; // Assume no translations exist on error
  }

  return (data || []).map(row => row.language as SupportedLanguage);
}
```

**Design decisions**:
- Returns empty array on error (will attempt translation)
- Maps database rows to `SupportedLanguage[]` array
- No limit - returns all existing translation languages

**Verification**:
- [ ] Function compiles without errors
- [ ] Returns `Promise<SupportedLanguage[]>` type
- [ ] Handles empty results correctly

---

### Task 4: Implement Pending Jobs Check Helper
**Estimated effort**: 10 minutes
**File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

#### 4.1 Add function documentation
```typescript
/**
 * Gets languages with pending or processing translation jobs for a tag.
 *
 * @param tagKey - The tag identifier
 * @returns Promise resolving to array of language codes with pending jobs
 */
```

#### 4.2 Implement `getPendingTagJobLanguages` function
```typescript
async function getPendingTagJobLanguages(
  tagKey: string
): Promise<SupportedLanguage[]> {
  const { data, error } = await supabaseAdmin
    .from('translation_jobs')
    .select('target_language')
    .eq('entity_type', 'tag')
    .eq('entity_id', tagKey)
    .in('status', ['queued', 'processing']);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking pending jobs', {
      tagKey,
      error: error.message,
    });
    return []; // Assume no pending jobs on error
  }

  return (data || []).map(row => row.target_language as SupportedLanguage);
}
```

**Design decisions**:
- Filters for both `queued` and `processing` status
- Uses `entity_type = 'tag'` to only match tag jobs
- Uses tag key as `entity_id` (not UUID like other entities)

**Verification**:
- [ ] Function compiles without errors
- [ ] Returns `Promise<SupportedLanguage[]>` type
- [ ] Queries correct columns (`target_language`, not `language`)

---

### Task 5: Implement Main Trigger Function Signature and Documentation
**Estimated effort**: 5 minutes
**File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

#### 5.1 Add section divider
```typescript
// ============================================================================
// Main Trigger Function
// ============================================================================
```

#### 5.2 Add comprehensive JSDoc
```typescript
/**
 * Triggers translation for a tag's value across all target languages.
 *
 * This function handles the special case of tags:
 * 1. System tags (pre-seeded in database) are skipped - they already have translations
 * 2. User-created tags are checked for existing translations before queuing
 * 3. Only missing translations are queued to avoid redundant work
 *
 * @param tagKey - The tag identifier (e.g., 'coffee-maker', 'my-custom-tag')
 * @param sourceLanguage - The source language code (e.g., 'en', 'fr')
 * @returns Result with job IDs, queued languages, and any error or skip reason
 *
 * @example
 * // Trigger translation for a user-created tag
 * const result = await triggerTagTranslation('coffee-maker', 'en');
 * if (result.success) {
 *   if (result.jobIds.length === 0) {
 *     console.log('Tag already translated or is a system tag');
 *   } else {
 *     console.log(`Queued ${result.queuedLanguages.length} translations`);
 *   }
 * }
 *
 * @example
 * // System tag will be skipped
 * const result = await triggerTagTranslation('kitchen', 'en');
 * // result.success === true, result.jobIds === []
 */
```

**Verification**:
- [ ] JSDoc includes all parameters
- [ ] JSDoc includes return type description
- [ ] Examples demonstrate key use cases

---

### Task 6: Implement Main Trigger Function Logic
**Estimated effort**: 20 minutes
**File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

#### 6.1 Define function signature
```typescript
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
```

#### 6.2 Implement try-catch wrapper
```typescript
  try {
    console.log('TAG_TRIGGER: Triggering tag translation', {
      tagKey,
      sourceLanguage,
    });

    // Implementation steps go here...

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('TAG_TRIGGER: Exception triggering tag translation', {
      tagKey,
      sourceLanguage,
      error: errorMessage,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering tag translation: ${errorMessage}`,
    };
  }
}
```

#### 6.3 Implement system tag check (Step 1)
Inside the try block:
```typescript
    // 1. Check if this is a system tag (pre-seeded, skip translation)
    const systemTag = await isSystemTag(tagKey);
    if (systemTag) {
      console.log('TAG_TRIGGER: Skipping system tag (already seeded)', { tagKey });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        // Note: No error field - this is expected behavior for system tags
      };
    }
```

#### 6.4 Implement target language calculation (Step 2)
```typescript
    // 2. Get all target languages (excluding source)
    const allTargetLanguages = getOtherLanguages(sourceLanguage);
```

#### 6.5 Implement existing coverage check (Steps 3-5)
```typescript
    // 3. Check for existing translations
    const existingTranslations = await getExistingTagTranslationLanguages(tagKey);

    // 4. Check for pending/processing jobs
    const pendingJobs = await getPendingTagJobLanguages(tagKey);

    // 5. Determine which languages still need translation
    const coveredLanguages = new Set([
      ...existingTranslations,
      ...pendingJobs,
      sourceLanguage, // Source language doesn't need translation
    ]);

    const languagesToTranslate = allTargetLanguages.filter(
      lang => !coveredLanguages.has(lang)
    );

    console.log('TAG_TRIGGER: Translation coverage check', {
      tagKey,
      sourceLanguage,
      existingTranslations,
      pendingJobs,
      languagesToTranslate,
    });
```

#### 6.6 Implement early return for fully covered tags (Step 6)
```typescript
    // 6. If all languages are covered, return success with empty arrays
    if (languagesToTranslate.length === 0) {
      console.log('TAG_TRIGGER: All translations exist or are pending', { tagKey });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }
```

#### 6.7 Implement translation job queuing (Steps 7-8)
```typescript
    // 7. Build translatable fields for the tag
    // Tags only have one translatable field: the tag value itself
    // The tag key is used as both the identifier and the value to translate
    const fields: TranslatableField[] = [
      {
        fieldName: 'translated_value',
        value: tagKey, // The tag key is what gets translated
        context: TRANSLATION_CONTEXTS.tag,
      },
    ];

    // 8. Queue translations via orchestrator
    console.log('TAG_TRIGGER: Queuing translations', {
      tagKey,
      languageCount: languagesToTranslate.length,
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'tag',
        entityId: tagKey, // Tag key is the entity ID
        sourceLanguage,
        fields,
      },
      trigger: 'create',
      excludeLanguages: [...existingTranslations, ...pendingJobs] as SupportedLanguage[],
    });

    console.log('TAG_TRIGGER: Translation queuing complete', {
      tagKey,
      success: result.success,
      jobCount: result.jobIds.length,
    });

    return result;
```

**Verification**:
- [ ] Function is exported
- [ ] All console logs use `TAG_TRIGGER:` prefix
- [ ] No exceptions thrown - all errors returned in result object
- [ ] Returns `QueueTranslationResult` type

---

### Task 7: Update Trigger Barrel Exports
**Estimated effort**: 2 minutes
**File**: `/src/lib/content-translation/triggers/index.ts`

#### 7.1 Add tag trigger export
Add to the existing exports:
```typescript
export { triggerTagTranslation } from './tag-trigger';
```

**Expected file content after update**:
```typescript
export { triggerItemTranslation } from './item-trigger';
export { triggerArticleTranslation } from './article-trigger';
export { triggerLinkTranslation } from './link-trigger';
export { triggerTagTranslation } from './tag-trigger';
```

**Verification**:
- [ ] Export added without syntax errors
- [ ] Import resolves correctly

---

### Task 8: Update Main Module Exports
**Estimated effort**: 2 minutes
**File**: `/src/lib/content-translation/index.ts`

#### 8.1 Update trigger exports
Find the trigger exports section and add `triggerTagTranslation`:

```typescript
export {
  triggerItemTranslation,
  triggerArticleTranslation,
  triggerLinkTranslation,
  triggerTagTranslation,  // ADD THIS
} from './triggers';
```

**Verification**:
- [ ] Export compiles without errors
- [ ] Can import from `@/lib/content-translation`

---

### Task 9: Verify TypeScript Compilation
**Estimated effort**: 5 minutes

#### 9.1 Run TypeScript compiler
```bash
npm run build
```

#### 9.2 Verify no type errors related to tag-trigger
Check output for any errors mentioning:
- `tag-trigger.ts`
- `triggers/index.ts`
- `content-translation/index.ts`

**Verification**:
- [ ] Build succeeds without errors
- [ ] No type conflicts with existing modules
- [ ] All generics resolve correctly

---

### Task 10: Verify Import Chain
**Estimated effort**: 5 minutes

#### 10.1 Test import from trigger barrel
Create a temporary test or verify in existing code:
```typescript
import { triggerTagTranslation } from '@/lib/content-translation/triggers';
```

#### 10.2 Test import from main module
```typescript
import { triggerTagTranslation } from '@/lib/content-translation';
```

**Verification**:
- [ ] Both import paths work
- [ ] Function signature is correctly typed
- [ ] IDE autocomplete shows function

---

## Complete File Reference

### `/src/lib/content-translation/triggers/tag-trigger.ts`

<details>
<summary>Click to expand complete file</summary>

```typescript
/**
 * Tag Translation Trigger
 * Part of REQ-E03-004: Implement Tag Translation Trigger
 *
 * This module provides a specialized translation trigger for tag entities.
 * It handles the distinction between system tags (pre-seeded, skip translation)
 * and user-created tags (queue for translation).
 *
 * @module content-translation/triggers/tag-trigger
 * @created 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import { TRANSLATION_CONTEXTS } from '../content-translation.types';
import type { QueueTranslationResult, TranslatableField } from '../content-translation.types';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
import { getOtherLanguages } from '@/lib/translation-service';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a tag is a system tag (pre-seeded with translations).
 * System tags are seeded via /database/seeds/20260117_system_tag_translations.sql
 * and have is_system_tag = true in the database.
 *
 * @param tagKey - The tag identifier (e.g., 'kitchen', 'my-custom-tag')
 * @returns Promise resolving to true if this is a system tag
 */
async function isSystemTag(tagKey: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('is_system_tag')
    .eq('tag_key', tagKey)
    .eq('is_system_tag', true)
    .limit(1);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking system tag status', {
      tagKey,
      error: error.message,
    });
    return false; // Assume not system tag on error, will queue translation
  }

  return data !== null && data.length > 0;
}

/**
 * Gets languages that already have translations for a tag.
 *
 * @param tagKey - The tag identifier
 * @returns Promise resolving to array of language codes with existing translations
 */
async function getExistingTagTranslationLanguages(
  tagKey: string
): Promise<SupportedLanguage[]> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('language')
    .eq('tag_key', tagKey);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking existing translations', {
      tagKey,
      error: error.message,
    });
    return []; // Assume no translations exist on error
  }

  return (data || []).map(row => row.language as SupportedLanguage);
}

/**
 * Gets languages with pending or processing translation jobs for a tag.
 *
 * @param tagKey - The tag identifier
 * @returns Promise resolving to array of language codes with pending jobs
 */
async function getPendingTagJobLanguages(
  tagKey: string
): Promise<SupportedLanguage[]> {
  const { data, error } = await supabaseAdmin
    .from('translation_jobs')
    .select('target_language')
    .eq('entity_type', 'tag')
    .eq('entity_id', tagKey)
    .in('status', ['queued', 'processing']);

  if (error) {
    console.warn('TAG_TRIGGER: Error checking pending jobs', {
      tagKey,
      error: error.message,
    });
    return []; // Assume no pending jobs on error
  }

  return (data || []).map(row => row.target_language as SupportedLanguage);
}

// ============================================================================
// Main Trigger Function
// ============================================================================

/**
 * Triggers translation for a tag's value across all target languages.
 *
 * This function handles the special case of tags:
 * 1. System tags (pre-seeded in database) are skipped - they already have translations
 * 2. User-created tags are checked for existing translations before queuing
 * 3. Only missing translations are queued to avoid redundant work
 *
 * @param tagKey - The tag identifier (e.g., 'coffee-maker', 'my-custom-tag')
 * @param sourceLanguage - The source language code (e.g., 'en', 'fr')
 * @returns Result with job IDs, queued languages, and any error or skip reason
 *
 * @example
 * // Trigger translation for a user-created tag
 * const result = await triggerTagTranslation('coffee-maker', 'en');
 * if (result.success) {
 *   if (result.jobIds.length === 0) {
 *     console.log('Tag already translated or is a system tag');
 *   } else {
 *     console.log(`Queued ${result.queuedLanguages.length} translations`);
 *   }
 * }
 *
 * @example
 * // System tag will be skipped
 * const result = await triggerTagTranslation('kitchen', 'en');
 * // result.success === true, result.jobIds === []
 */
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult> {
  try {
    console.log('TAG_TRIGGER: Triggering tag translation', {
      tagKey,
      sourceLanguage,
    });

    // 1. Check if this is a system tag (pre-seeded, skip translation)
    const systemTag = await isSystemTag(tagKey);
    if (systemTag) {
      console.log('TAG_TRIGGER: Skipping system tag (already seeded)', { tagKey });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        // Note: No error field - this is expected behavior for system tags
      };
    }

    // 2. Get all target languages (excluding source)
    const allTargetLanguages = getOtherLanguages(sourceLanguage);

    // 3. Check for existing translations
    const existingTranslations = await getExistingTagTranslationLanguages(tagKey);

    // 4. Check for pending/processing jobs
    const pendingJobs = await getPendingTagJobLanguages(tagKey);

    // 5. Determine which languages still need translation
    const coveredLanguages = new Set([
      ...existingTranslations,
      ...pendingJobs,
      sourceLanguage, // Source language doesn't need translation
    ]);

    const languagesToTranslate = allTargetLanguages.filter(
      lang => !coveredLanguages.has(lang)
    );

    console.log('TAG_TRIGGER: Translation coverage check', {
      tagKey,
      sourceLanguage,
      existingTranslations,
      pendingJobs,
      languagesToTranslate,
    });

    // 6. If all languages are covered, return success with empty arrays
    if (languagesToTranslate.length === 0) {
      console.log('TAG_TRIGGER: All translations exist or are pending', { tagKey });
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
      };
    }

    // 7. Build translatable fields for the tag
    // Tags only have one translatable field: the tag value itself
    // The tag key is used as both the identifier and the value to translate
    const fields: TranslatableField[] = [
      {
        fieldName: 'translated_value',
        value: tagKey, // The tag key is what gets translated
        context: TRANSLATION_CONTEXTS.tag,
      },
    ];

    // 8. Queue translations via orchestrator
    console.log('TAG_TRIGGER: Queuing translations', {
      tagKey,
      languageCount: languagesToTranslate.length,
    });

    const result = await queueContentTranslations({
      content: {
        entityType: 'tag',
        entityId: tagKey, // Tag key is the entity ID
        sourceLanguage,
        fields,
      },
      trigger: 'create',
      excludeLanguages: [...existingTranslations, ...pendingJobs] as SupportedLanguage[],
    });

    console.log('TAG_TRIGGER: Translation queuing complete', {
      tagKey,
      success: result.success,
      jobCount: result.jobIds.length,
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('TAG_TRIGGER: Exception triggering tag translation', {
      tagKey,
      sourceLanguage,
      error: errorMessage,
    });
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      error: `Exception triggering tag translation: ${errorMessage}`,
    };
  }
}
```

</details>

---

## Success Validation Checklist

### File Structure
- [ ] `/src/lib/content-translation/triggers/tag-trigger.ts` exists
- [ ] File contains proper module documentation header with creation date
- [ ] All imports resolve correctly

### Function Implementation
- [ ] `triggerTagTranslation()` function is exported
- [ ] `isSystemTag()` helper function is implemented (internal/private)
- [ ] `getExistingTagTranslationLanguages()` helper function is implemented (internal/private)
- [ ] `getPendingTagJobLanguages()` helper function is implemented (internal/private)
- [ ] Function accepts `(tagKey: string, sourceLanguage: SupportedLanguage)` parameters
- [ ] Function returns `Promise<QueueTranslationResult>`
- [ ] Console logging follows `TAG_TRIGGER:` prefix pattern

### System Tag Handling
- [ ] System tags are correctly identified via database query
- [ ] System tags return `success: true` with empty `jobIds` and `queuedLanguages`
- [ ] No translation jobs are created for system tags
- [ ] System tag check uses `is_system_tag = true` filter

### Existing Translation Handling
- [ ] Function queries `tag_translations` for existing translations
- [ ] Function queries `translation_jobs` for pending/processing jobs
- [ ] Function only queues translations for languages without coverage
- [ ] Function returns early if all languages are covered

### User Tag Handling
- [ ] User tags are correctly identified (not system tags)
- [ ] User tags have translation jobs created for missing languages
- [ ] Tag key is used as both entity ID and translation source value
- [ ] Uses `TRANSLATION_CONTEXTS.tag` for translation quality

### Error Handling
- [ ] Function handles missing tags gracefully (via orchestrator)
- [ ] Function handles database errors gracefully in helper functions
- [ ] Function catches and wraps exceptions
- [ ] Error results include descriptive messages
- [ ] No exceptions thrown - all errors returned in result object

### Integration
- [ ] Function uses `queueContentTranslations` from orchestrator module
- [ ] Compatible with types from Task 1.1
- [ ] Exported from `/src/lib/content-translation/triggers/index.ts`
- [ ] Exported from `/src/lib/content-translation/index.ts`
- [ ] Import works: `import { triggerTagTranslation } from '@/lib/content-translation'`

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No type conflicts with existing modules
- [ ] All generics resolve correctly

---

## Acceptance Criteria Mapping

| Requirement | Implementation | Verification |
|-------------|---------------|--------------|
| Tag trigger function exists | Task 1, 5-6 | Function compiles and is exported |
| Accepts tag key and source language | Task 5-6 | Parameter types match specification |
| Distinguishes system vs user tags | Task 2 | `isSystemTag()` returns correct boolean |
| Skips translation for system tags | Task 6 (Step 1) | System tags return empty job arrays |
| Checks for existing translations | Task 3-4 | Queries both tables before queuing |
| Returns early if all covered | Task 6 (Step 6) | No jobs queued when fully translated |
| Queues only missing languages | Task 6 (Steps 7-8) | `excludeLanguages` filters covered languages |
| Returns consistent result object | Task 6 | Returns `QueueTranslationResult` type |
| Handles errors gracefully | Tasks 2-4, 6 | All errors caught and returned in result |
| TypeScript types defined | Tasks 5-6 | Compiles without errors |

---

## Usage Examples After Implementation

### Basic Usage (Processing Item Tags)
```typescript
// In /src/app/api/admin/items/route.ts POST handler
// After item is created, process its tags for translation

import { triggerTagTranslation } from '@/lib/content-translation';

// For each user tag on the item
for (const tag of item.tags) {
  const result = await triggerTagTranslation(tag, sourceLanguage);
  if (!result.success) {
    console.warn(`Failed to queue tag translation for ${tag}:`, result.error);
  }
}
```

### Batch Tag Processing
```typescript
// Process multiple tags, collecting results
const tagTranslationResults = await Promise.all(
  item.tags.map(tag => triggerTagTranslation(tag, sourceLanguage))
);

const totalJobsQueued = tagTranslationResults.reduce(
  (sum, result) => sum + result.jobIds.length,
  0
);
console.log(`Queued ${totalJobsQueued} tag translation jobs`);
```

---

## Notes

### System Tags Reference
These 17 tags are pre-seeded and will be skipped by the trigger:

**Room Tags (8)**: `kitchen`, `laundry`, `bedroom`, `bathroom`, `living-room`, `garage`, `outdoor`, `general`

**Item Type Tags (2)**: `appliance`, `room-item`

**Purpose Tags (7)**: `instructions`, `cleaning`, `troubleshooting`, `safety`, `maintenance`, `features`, `info`

### Comparison: Tags vs Other Entities

| Aspect | Tags | Items/Articles/Links |
|--------|------|---------------------|
| Entity ID | Tag key (string) | UUID |
| Translatable Fields | 1 (`translated_value`) | 2+ (name, description, etc.) |
| System Pre-seeding | Yes (17 tags × 6 languages) | No |
| Duplicate Check | Required (explicit) | Handled by job queue upsert |
| Database Table | `tag_translations` | `item_translations`, etc. |

### Downstream Tasks
This task is a dependency for:
- **Task 2.5**: Add tag translation on item save (will call this trigger)
- **Phase 3**: Job processor will handle tag-specific translation storage

---

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Thin wrapper around existing orchestrator functionality
  - Simple database queries for system tag detection
  - Clear patterns established by Task 1.3 entity triggers
  - Can be tested independently before API integration

---

## References
- Overview Document: `/docs/REQ-E03-004-implement-tag-translation-trigger-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Content Translation Orchestrator: `/src/lib/content-translation/content-translation.ts` (Task 1.2)
- Content Translation Types: `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- Entity Triggers Pattern: `/src/lib/content-translation/triggers/item-trigger.ts` (Task 1.3)
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts` (Epic 1)
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts` (Epic 1)
- System Tags Seed: `/database/seeds/20260117_system_tag_translations.sql`
