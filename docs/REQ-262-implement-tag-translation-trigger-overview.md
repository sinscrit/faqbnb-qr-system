# REQ-262: Implement Tag Translation Trigger with System Tag Handling - Implementation Overview

**Generated:** 2026-01-18 17:00:00 UTC
**Last Modified:** 2026-01-18 17:00:00 UTC
**Request Reference:** REQ-262 - Implement Tag Translation Trigger with System Tag Handling
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 1, Task 1.4)
**Status:** Ready for Implementation

---

## 1. Request Summary

Implement a specialized trigger function for tag translation that distinguishes between system tags (pre-seeded with translations in Epic 1) and user-created custom tags. The trigger must prevent redundant translation of system tags while enabling translation of user-created tags, and check for existing translations before queuing new jobs.

**Scope:**
- Create `/src/lib/content-translation/triggers/tag-trigger.ts` - tag translation trigger
- Implement `triggerTagTranslation(tagKey: string, sourceLanguage: string): Promise<QueueTranslationResult>`
- Detect system tags vs user-created tags using the `AVAILABLE_TAGS` constant or database `is_system_tag` flag
- Skip translation for system tags (already pre-seeded)
- Check if translation already exists before queuing new jobs
- Handle graceful skipping with informative result status
- Integrate with content translation orchestrator (REQ-260)

**Out of Scope:**
- Type definitions (REQ-259 / Task 1.1)
- Content translation orchestrator (REQ-260 / Task 1.2)
- Item/article/link translation triggers (REQ-261 / Task 1.3)
- Translation storage utilities (Task 1.5)
- Translation status utilities (Task 1.6)
- Modifying existing API routes (Phase 2 tasks)
- System tag seeding (Epic 1 responsibility)

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

| Pattern | Location | Usage for REQ-262 |
|---------|----------|-------------------|
| System tags definition | `/src/components/ItemCreationWorkflow/utils/constants.ts` | `AVAILABLE_TAGS` constant - 17 system tags |
| Tag mapper utility | `/src/components/ItemCreationWorkflow/utils/tagMapper.ts` | Pattern for tag handling |
| Supabase client usage | `/src/lib/supabase.ts` | Database interaction pattern |
| Entity triggers | `/src/lib/content-translation/triggers/*` | Pattern from REQ-261 |
| Type definitions | `/src/lib/content-translation/content-translation.types.ts` | Type imports |

### System Tags (Pre-seeded in Epic 1)

From `/src/components/ItemCreationWorkflow/utils/constants.ts` (lines 346-364):

**Room Tags (8):**
- `kitchen`, `laundry`, `bedroom`, `bathroom`, `living-room`, `garage`, `outdoor`, `general`

**Item Type Tags (2):**
- `appliance`, `room-item`

**Purpose Tags (7):**
- `instructions`, `cleaning`, `troubleshooting`, `safety`, `maintenance`, `features`, `info`

**Total: 17 system tags** - These are pre-seeded with translations in Epic 1 and should be skipped.

### Database Tag Translation Schema

From REQ-223 (Epic 1 migration specifications):

```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL,
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tag_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  UNIQUE(tag_key, language)
);
```

**Key Fields:**
- `tag_key`: The original tag identifier (e.g., 'kitchen', 'my-custom-tag')
- `is_system_tag`: Boolean flag - `true` for system tags, `false` for user tags
- Unique constraint on `(tag_key, language)` prevents duplicate translations

### Dependencies from Previous Tasks

| Task | Expected Location | Required Components |
|------|-------------------|---------------------|
| REQ-259 (Task 1.1) | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `SupportedLanguage`, `EntityType`, `ContentToTranslate`, `TranslatableField`, `TRANSLATION_CONTEXTS`, `ContentTranslationErrorCode`, `createContentTranslationError`, `isSupportedLanguage`, `SUPPORTED_LANGUAGES` |
| REQ-260 (Task 1.2) | `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations()` |
| REQ-261 (Task 1.3) | `/src/lib/content-translation/triggers/*` | Pattern reference for triggers |
| Supabase client | `/src/lib/supabase.ts` | `supabaseAdmin` |

---

## 3. Technical Approach

### Tag Translation Decision Flow

```
triggerTagTranslation(tagKey, sourceLanguage)
    │
    ├── 1. Validate inputs
    │       - Verify tagKey is non-empty string
    │       - Verify sourceLanguage is supported
    │
    ├── 2. Check if system tag
    │       │
    │       ├── YES (is system tag)
    │       │   └── Return early with status: 'skipped_system_tag'
    │       │       - No jobs queued
    │       │       - Success: true
    │       │       - Message: 'System tag already has translations'
    │       │
    │       └── NO (is user tag)
    │           │
    │           ├── 3. Check for existing translations
    │           │       SELECT COUNT(*) FROM tag_translations
    │           │       WHERE tag_key = ? AND language IN (target_languages)
    │           │
    │           ├── If all translations exist:
    │           │   └── Return early with status: 'translations_exist'
    │           │       - No jobs queued
    │           │       - Success: true
    │           │       - Message: 'All translations already exist'
    │           │
    │           └── If some/no translations exist:
    │               │
    │               ├── 4. Build ContentToTranslate
    │               │       - entityType: 'tag'
    │               │       - entityId: tagKey (tags use key as ID)
    │               │       - sourceLanguage
    │               │       - fields: [{ fieldName: 'value', value: tagKey, context: TRANSLATION_CONTEXTS.tag }]
    │               │
    │               ├── 5. Determine languages to skip
    │               │       - Languages with existing translations
    │               │
    │               └── 6. Call queueContentTranslations()
    │                       - Pass content
    │                       - Set excludeLanguages for existing translations
    │                       - Set trigger: 'create'
    │
    └── 7. Return QueueTranslationResult
            - Job IDs for newly queued jobs
            - Queued languages
            - Skipped languages (source + existing + excluded)
            - Status information
```

### System Tag Detection Strategy

The trigger will use two methods to identify system tags:

1. **Primary Method - Constants Check:**
   Import `AVAILABLE_TAGS` from constants and check if `tagKey` is in this array.

   ```typescript
   import { AVAILABLE_TAGS } from '@/components/ItemCreationWorkflow/utils/constants';
   const isSystemTag = (AVAILABLE_TAGS as readonly string[]).includes(tagKey);
   ```

2. **Fallback Method - Database Check (if constants unavailable):**
   Query `tag_translations` table for `is_system_tag = true` records.

**Rationale:** Using constants is faster (no database call) and provides a single source of truth that matches the UI.

### Error Handling Strategy

1. **Invalid Tag Key:** Return error result with `VALIDATION_ERROR` code
2. **Invalid Language:** Return error result with `INVALID_LANGUAGE` code
3. **Database Errors:** Wrap and return with meaningful message
4. **System Tag Skip:** Return success with informative message (not an error)
5. **Existing Translations:** Return success with informative message
6. **Orchestrator Errors:** Pass through orchestrator result

---

## 4. Implementation Tasks

### Task 1.4.1: Create tag-trigger.ts

**Action:** Create the tag translation trigger with system tag handling
**File:** `/src/lib/content-translation/triggers/tag-trigger.ts`

**Content:**
```typescript
/**
 * Tag Translation Trigger
 *
 * Triggers translation for user-created tags while intelligently
 * skipping system tags (which are pre-seeded with translations).
 *
 * Key Features:
 * - Detects system tags vs user tags
 * - Skips system tags (already have translations from Epic 1)
 * - Checks for existing translations before queuing
 * - Only queues jobs for languages missing translations
 *
 * @module content-translation/triggers/tag-trigger
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
 */

import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import {
  QueueTranslationResult,
  SupportedLanguage,
  TranslatableField,
  TranslationTrigger,
  TRANSLATION_CONTEXTS,
  SUPPORTED_LANGUAGES,
  ContentTranslationErrorCode,
  createContentTranslationError,
  isSupportedLanguage,
  getTargetLanguages,
} from '../content-translation.types';

// Import system tags from constants
import { AVAILABLE_TAGS } from '@/components/ItemCreationWorkflow/utils/constants';

/**
 * Extended result type for tag translation with additional status info
 */
export interface TagTranslationResult extends QueueTranslationResult {
  /** Status indicating why translation was skipped (if applicable) */
  skipReason?: 'system_tag' | 'translations_exist' | 'no_content';
  /** Languages that already had translations */
  existingLanguages?: SupportedLanguage[];
}

/**
 * Options for triggering tag translation
 */
export interface TriggerTagTranslationOptions {
  /** The tag key (identifier) to translate */
  tagKey: string;
  /** The source language of the tag value */
  sourceLanguage: SupportedLanguage;
  /** What triggered this translation (affects priority) */
  trigger?: TranslationTrigger;
  /** Account ID for multi-tenant context */
  accountId?: string;
  /** Force translation even if translations exist (use with caution) */
  forceRetranslate?: boolean;
}

/**
 * Checks if a tag is a system tag (pre-defined in constants)
 *
 * System tags are pre-seeded with translations in Epic 1 and should not
 * be re-translated. These include room tags, item type tags, and purpose tags.
 *
 * @param tagKey - The tag key to check
 * @returns true if the tag is a system tag, false if user-created
 */
export function isSystemTag(tagKey: string): boolean {
  return (AVAILABLE_TAGS as readonly string[]).includes(tagKey);
}

/**
 * Checks which languages already have translations for a tag
 *
 * @param tagKey - The tag key to check
 * @param targetLanguages - Languages to check for existing translations
 * @returns Array of languages that already have translations
 */
async function getExistingTranslationLanguages(
  tagKey: string,
  targetLanguages: SupportedLanguage[]
): Promise<SupportedLanguage[]> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('language')
    .eq('tag_key', tagKey)
    .in('language', targetLanguages);

  if (error) {
    console.error('Error checking existing tag translations:', error);
    return []; // Proceed with translation if we can't check
  }

  return (data || []).map(row => row.language as SupportedLanguage);
}

/**
 * Triggers translation for a tag's value
 *
 * This function handles both system tags and user-created tags:
 * - System tags are automatically skipped (already have translations)
 * - User tags are checked for existing translations before queuing
 * - Only languages without translations are queued
 *
 * @param tagKey - The tag key (identifier) to translate
 * @param sourceLanguage - The source language of the tag value
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * import { triggerTagTranslation } from '@/lib/content-translation';
 *
 * // System tag - will be skipped
 * const result1 = await triggerTagTranslation('kitchen', 'en');
 * // result1.success === true, result1.skipReason === 'system_tag'
 *
 * // User tag - will be queued for translation
 * const result2 = await triggerTagTranslation('my-custom-tag', 'en');
 * // result2.success === true, result2.jobIds.length > 0
 * ```
 */
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: string
): Promise<TagTranslationResult>;

/**
 * Triggers translation with additional options
 *
 * @param options - Translation trigger options
 * @returns Promise resolving to the queue result with job IDs and status
 */
export async function triggerTagTranslation(
  options: TriggerTagTranslationOptions
): Promise<TagTranslationResult>;

/**
 * Implementation that handles both overloads
 */
export async function triggerTagTranslation(
  tagKeyOrOptions: string | TriggerTagTranslationOptions,
  sourceLanguageArg?: string
): Promise<TagTranslationResult> {
  // Parse arguments based on overload used
  const options: TriggerTagTranslationOptions =
    typeof tagKeyOrOptions === 'string'
      ? {
          tagKey: tagKeyOrOptions,
          sourceLanguage: sourceLanguageArg as SupportedLanguage,
        }
      : tagKeyOrOptions;

  const {
    tagKey,
    sourceLanguage,
    trigger = 'create',
    accountId,
    forceRetranslate = false,
  } = options;

  try {
    // Step 1: Validate inputs
    if (!tagKey || typeof tagKey !== 'string' || tagKey.trim() === '') {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        'Tag key is required and must be a non-empty string',
        { entityType: 'tag' }
      );
    }

    const normalizedTagKey = tagKey.trim().toLowerCase();

    if (!isSupportedLanguage(sourceLanguage)) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.INVALID_LANGUAGE,
        `Invalid source language: ${sourceLanguage}. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
        { entityType: 'tag', entityId: normalizedTagKey }
      );
    }

    // Step 2: Check if system tag
    if (isSystemTag(normalizedTagKey)) {
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: getTargetLanguages(sourceLanguage),
        skipReason: 'system_tag',
        error: undefined,
      };
    }

    // Step 3: Determine target languages (all except source)
    const targetLanguages = getTargetLanguages(sourceLanguage);

    // If no target languages, return early
    if (targetLanguages.length === 0) {
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [],
        skipReason: 'no_content',
      };
    }

    // Step 4: Check for existing translations (unless force retranslate)
    let existingLanguages: SupportedLanguage[] = [];
    let languagesToTranslate = targetLanguages;

    if (!forceRetranslate) {
      existingLanguages = await getExistingTranslationLanguages(
        normalizedTagKey,
        targetLanguages
      );

      // Filter out languages that already have translations
      languagesToTranslate = targetLanguages.filter(
        lang => !existingLanguages.includes(lang)
      );

      // If all translations exist, return early
      if (languagesToTranslate.length === 0) {
        return {
          success: true,
          jobIds: [],
          queuedLanguages: [],
          skippedLanguages: targetLanguages,
          existingLanguages,
          skipReason: 'translations_exist',
        };
      }
    }

    // Step 5: Build translatable fields
    // For tags, the "value" to translate is the tag key itself (human-readable)
    const fields: TranslatableField[] = [
      {
        fieldName: 'value',
        value: normalizedTagKey,
        context: TRANSLATION_CONTEXTS.tag,
        maxLength: 100,
      },
    ];

    // Step 6: Queue translations through orchestrator
    // Pass existingLanguages as excludeLanguages to skip them
    const result = await queueContentTranslations({
      content: {
        entityType: 'tag',
        entityId: normalizedTagKey, // Tags use the key as their ID
        sourceLanguage,
        fields,
      },
      trigger,
      accountId,
      excludeLanguages: existingLanguages.length > 0 ? existingLanguages : undefined,
    });

    // Step 7: Return enhanced result with existing languages info
    return {
      ...result,
      existingLanguages: existingLanguages.length > 0 ? existingLanguages : undefined,
    };
  } catch (err) {
    // Handle typed errors
    if ((err as { code: ContentTranslationErrorCode }).code) {
      const error = err as { code: ContentTranslationErrorCode; message: string };
      return {
        success: false,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [],
        error: error.message,
      };
    }

    // Handle unexpected errors
    console.error('Unexpected error in triggerTagTranslation:', err);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      skippedLanguages: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Batch trigger for multiple tags
 *
 * Efficiently processes multiple tags, skipping system tags and
 * checking for existing translations in batch.
 *
 * @param tagKeys - Array of tag keys to translate
 * @param sourceLanguage - The source language for all tags
 * @param options - Additional options (trigger, accountId)
 * @returns Promise resolving to array of results (one per tag)
 */
export async function triggerBatchTagTranslation(
  tagKeys: string[],
  sourceLanguage: SupportedLanguage,
  options?: Partial<Omit<TriggerTagTranslationOptions, 'tagKey' | 'sourceLanguage'>>
): Promise<TagTranslationResult[]> {
  const { trigger = 'create', accountId, forceRetranslate = false } = options || {};

  const results: TagTranslationResult[] = [];

  // Process tags sequentially to avoid overwhelming the database
  // Could be parallelized with Promise.all if needed, but sequential is safer
  for (const tagKey of tagKeys) {
    const result = await triggerTagTranslation({
      tagKey,
      sourceLanguage,
      trigger,
      accountId,
      forceRetranslate,
    });
    results.push(result);
  }

  return results;
}
```

### Task 1.4.2: Update index.ts to export tag trigger functions

**Action:** Add exports for tag trigger functions to module index
**File:** `/src/lib/content-translation/index.ts`

**Modification:** Add under the trigger exports section:

```typescript
// Task 1.4: Tag translation trigger
export {
  triggerTagTranslation,
  triggerBatchTagTranslation,
  isSystemTag,
} from './triggers/tag-trigger';
export type {
  TriggerTagTranslationOptions,
  TagTranslationResult,
} from './triggers/tag-trigger';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/triggers/tag-trigger.ts` | Tag translation trigger with system tag handling |

### Files to MODIFY

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/content-translation/index.ts` | Export section | Add exports for `triggerTagTranslation`, `triggerBatchTagTranslation`, `isSystemTag`, and related types |

### Functions to CREATE

| Function Name | File | Purpose |
|---------------|------|---------|
| `triggerTagTranslation` | `tag-trigger.ts` | Main trigger - translates user tags, skips system tags |
| `triggerBatchTagTranslation` | `tag-trigger.ts` | Batch processing for multiple tags |
| `isSystemTag` | `tag-trigger.ts` | Utility to check if a tag is a system tag |
| `getExistingTranslationLanguages` | `tag-trigger.ts` | Helper to check existing translations |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/content-translation.types.ts` | Import types (created in REQ-259) |
| `/src/lib/content-translation/content-translation.ts` | Import `queueContentTranslations` (created in REQ-260) |
| `/src/lib/content-translation/triggers/item-trigger.ts` | Pattern reference from REQ-261 |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Import `AVAILABLE_TAGS` |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` client |
| `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` | Implementation plan reference |

### No Modifications Required

The following files should NOT be modified for this task:
- `/src/lib/content-translation/content-translation.types.ts` (created in REQ-259)
- `/src/lib/content-translation/content-translation.ts` (created in REQ-260)
- `/src/lib/content-translation/triggers/item-trigger.ts` (created in REQ-261)
- `/src/lib/content-translation/triggers/article-trigger.ts` (created in REQ-261)
- `/src/lib/content-translation/triggers/link-trigger.ts` (created in REQ-261)
- `/src/components/ItemCreationWorkflow/utils/constants.ts` (read-only reference)
- `/src/lib/supabase.ts` (use existing supabaseAdmin)
- Any API route files (Phase 2 tasks will modify these)
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
| REQ-259 (Task 1.1) | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `SupportedLanguage`, `TranslatableField`, `TranslationTrigger`, `TRANSLATION_CONTEXTS`, `SUPPORTED_LANGUAGES`, `ContentTranslationErrorCode`, `createContentTranslationError`, `isSupportedLanguage`, `getTargetLanguages` |
| REQ-260 (Task 1.2) | `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` |
| Constants | `/src/components/ItemCreationWorkflow/utils/constants.ts` | `AVAILABLE_TAGS` |
| Supabase client | `/src/lib/supabase.ts` | `supabaseAdmin` |

**Prerequisites:** REQ-259, REQ-260 must be completed before this task can begin.

### Database Dependencies

The following table must exist (created in Epic 1):

```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL,
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tag_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  UNIQUE(tag_key, language)
);
```

The `translation_jobs` table must also exist for the orchestrator to insert jobs.

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 2.5: Add tag translation on item save | Uses `triggerTagTranslation` on item create/update |
| Task 3.5: Tag translation processor | Processes jobs created by tag trigger |
| Phase 4: Translation status APIs | May query tag translation status |

---

## 7. Acceptance Criteria

From REQ-262:

- [ ] A `triggerTagTranslation` function accepts tag identifier and source language parameters
- [ ] The function determines whether the tag is a system tag based on tag metadata or type indicators
- [ ] System tags return immediately without queuing translation jobs since they were pre-seeded
- [ ] User-created tags are checked against existing translations before queuing new jobs
- [ ] Translation jobs are only queued when translations do not already exist for the target languages
- [ ] The function returns `QueueTranslationResult` indicating whether translation was skipped, existing, or newly queued
- [ ] The result includes job tracking identifiers for newly queued translation jobs
- [ ] The function handles database retrieval errors gracefully with meaningful error messages
- [ ] The trigger integrates seamlessly with the content translation orchestrator established in REQ-260
- [ ] The implementation prevents duplicate translation jobs for tags that already have complete translations

### Additional Implementation Criteria

- [ ] `/src/lib/content-translation/triggers/tag-trigger.ts` file exists
- [ ] `triggerTagTranslation` is exported from `/src/lib/content-translation/index.ts`
- [ ] `isSystemTag` utility function is exported
- [ ] `triggerBatchTagTranslation` is exported for batch processing
- [ ] `TagTranslationResult` type includes `skipReason` and `existingLanguages` fields
- [ ] TypeScript compilation passes without errors
- [ ] Build succeeds
- [ ] Function can be imported: `import { triggerTagTranslation } from '@/lib/content-translation'`

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify REQ-259, REQ-260, and REQ-261 are complete:**
   ```bash
   ls -la src/lib/content-translation/
   # Expected: index.ts, content-translation.types.ts, content-translation.ts
   ls -la src/lib/content-translation/triggers/
   # Expected: item-trigger.ts, article-trigger.ts, link-trigger.ts
   ```

2. **Verify constants file exists:**
   ```bash
   ls -la src/components/ItemCreationWorkflow/utils/constants.ts
   # Expected: file exists with AVAILABLE_TAGS export
   ```

3. **Verify types can be imported:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

### Post-Implementation Verification

4. **File exists check:**
   ```bash
   ls -la src/lib/content-translation/triggers/tag-trigger.ts
   # Expected: file exists
   ```

5. **TypeScript compilation check:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

6. **Build verification:**
   ```bash
   npm run build
   # Expected: Build completes successfully
   ```

### Unit Test Scenarios

Create `/src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts`:

```typescript
import {
  triggerTagTranslation,
  isSystemTag,
  triggerBatchTagTranslation,
} from '../tag-trigger';
import { AVAILABLE_TAGS } from '@/components/ItemCreationWorkflow/utils/constants';

describe('isSystemTag', () => {
  it('should return true for all system tags', () => {
    for (const tag of AVAILABLE_TAGS) {
      expect(isSystemTag(tag)).toBe(true);
    }
  });

  it('should return false for user-created tags', () => {
    expect(isSystemTag('my-custom-tag')).toBe(false);
    expect(isSystemTag('coffee-maker')).toBe(false);
    expect(isSystemTag('guest-favorite')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isSystemTag('KITCHEN')).toBe(false); // Tags are lowercase in AVAILABLE_TAGS
    expect(isSystemTag('kitchen')).toBe(true);
  });
});

describe('triggerTagTranslation', () => {
  describe('validation', () => {
    it('should reject empty tag key', async () => {
      const result = await triggerTagTranslation('', 'en');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Tag key is required');
    });

    it('should reject whitespace-only tag key', async () => {
      const result = await triggerTagTranslation('   ', 'en');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Tag key is required');
    });

    it('should reject invalid source language', async () => {
      const result = await triggerTagTranslation('my-tag', 'xx' as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid source language');
    });
  });

  describe('system tag handling', () => {
    it('should skip system tags without queuing jobs', async () => {
      const result = await triggerTagTranslation('kitchen', 'en');
      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(result.skipReason).toBe('system_tag');
    });

    it('should skip all 17 system tags', async () => {
      for (const systemTag of AVAILABLE_TAGS) {
        const result = await triggerTagTranslation(systemTag, 'en');
        expect(result.success).toBe(true);
        expect(result.skipReason).toBe('system_tag');
      }
    });
  });

  describe('user tag handling', () => {
    it('should queue translations for user tags', async () => {
      // Mock database to return no existing translations
      const result = await triggerTagTranslation('my-custom-tag', 'en');
      expect(result.success).toBe(true);
      // If no existing translations, should queue for 5 languages
      // (Depends on database mock)
    });

    it('should skip languages with existing translations', async () => {
      // Mock database to return existing translations for some languages
      const result = await triggerTagTranslation('partially-translated', 'en');
      expect(result.success).toBe(true);
      // Should only queue for languages without translations
    });

    it('should return translations_exist if all translations exist', async () => {
      // Mock database to return all target languages as translated
      const result = await triggerTagTranslation('fully-translated', 'en');
      expect(result.success).toBe(true);
      expect(result.skipReason).toBe('translations_exist');
      expect(result.jobIds).toHaveLength(0);
    });
  });

  describe('forceRetranslate option', () => {
    it('should ignore existing translations when forceRetranslate is true', async () => {
      const result = await triggerTagTranslation({
        tagKey: 'my-tag',
        sourceLanguage: 'en',
        forceRetranslate: true,
      });
      // Should queue all 5 languages regardless of existing translations
    });
  });
});

describe('triggerBatchTagTranslation', () => {
  it('should process multiple tags', async () => {
    const results = await triggerBatchTagTranslation(
      ['kitchen', 'my-custom-tag', 'another-tag'],
      'en'
    );
    expect(results).toHaveLength(3);
    expect(results[0].skipReason).toBe('system_tag'); // kitchen is system tag
  });
});
```

### Integration Test Scenarios

1. **System Tag Skip:**
   ```typescript
   // Attempt to translate a system tag
   const result = await triggerTagTranslation('kitchen', 'en');

   // Verify
   expect(result.success).toBe(true);
   expect(result.skipReason).toBe('system_tag');
   expect(result.jobIds).toHaveLength(0);

   // Verify no jobs were created
   const { data: jobs } = await supabase
     .from('translation_jobs')
     .select('*')
     .eq('entity_id', 'kitchen')
     .eq('entity_type', 'tag');
   expect(jobs).toHaveLength(0);
   ```

2. **User Tag Translation:**
   ```typescript
   // Translate a user-created tag
   const result = await triggerTagTranslation('coffee-maker', 'en');

   // Verify
   expect(result.success).toBe(true);
   expect(result.queuedLanguages).toHaveLength(5); // fr, es, de, nl, it
   expect(result.jobIds).toHaveLength(5);

   // Verify jobs in database
   const { data: jobs } = await supabase
     .from('translation_jobs')
     .select('*')
     .eq('entity_id', 'coffee-maker')
     .eq('entity_type', 'tag');
   expect(jobs).toHaveLength(5);
   ```

3. **Existing Translation Skip:**
   ```typescript
   // Pre-create a translation
   await supabase.from('tag_translations').insert({
     tag_key: 'my-tag',
     language: 'fr',
     translated_value: 'mon-tag',
     is_system_tag: false,
   });

   // Trigger translation
   const result = await triggerTagTranslation('my-tag', 'en');

   // Verify French was skipped
   expect(result.success).toBe(true);
   expect(result.existingLanguages).toContain('fr');
   expect(result.queuedLanguages).not.toContain('fr');
   expect(result.queuedLanguages).toHaveLength(4); // es, de, nl, it
   ```

### Manual Verification Checklist

- [ ] `/src/lib/content-translation/triggers/tag-trigger.ts` file exists
- [ ] `triggerTagTranslation` is exported from `index.ts`
- [ ] `isSystemTag` function correctly identifies all 17 system tags
- [ ] System tags return `skipReason: 'system_tag'`
- [ ] User tags check for existing translations before queuing
- [ ] Existing translations are skipped
- [ ] `existingLanguages` field populated correctly
- [ ] `forceRetranslate` option bypasses existing translation check
- [ ] Error messages are clear and helpful
- [ ] TypeScript compilation passes
- [ ] Build succeeds

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AVAILABLE_TAGS not importable | Low | Medium | Use fallback database check; document dependency |
| tag_translations table doesn't exist | Medium | High | Add clear error message; document Epic 1 prerequisite |
| System tag list changes | Low | Low | Keep AVAILABLE_TAGS as single source of truth |
| Duplicate translation jobs | Medium | Low | Unique constraint on tag_translations prevents duplicates |
| Case sensitivity issues | Medium | Low | Normalize tag keys to lowercase |
| Database check performance | Low | Low | Only queries tag_translations, should be fast |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1.4.1: Create tag-trigger.ts | 30 min |
| Task 1.4.2: Update index.ts exports | 5 min |
| Testing and verification | 25 min |
| **Total** | **~60 min** |

---

## 11. Implementation Commands Summary

```bash
# Step 1: Verify prerequisites are complete
ls -la src/lib/content-translation/
# Expected: index.ts, content-translation.types.ts, content-translation.ts
ls -la src/lib/content-translation/triggers/
# Expected: item-trigger.ts, article-trigger.ts, link-trigger.ts

# Step 2: Verify constants file exists
ls -la src/components/ItemCreationWorkflow/utils/constants.ts

# Step 3: Create tag-trigger.ts
# (Use content from Task 1.4.1)

# Step 4: Update index.ts exports
# (Add exports for tag trigger functions)

# Step 5: Verify TypeScript compilation
npx tsc --noEmit

# Step 6: Verify build
npm run build

# Step 7: Verify imports work
# Test in REPL or temporary file:
# import { triggerTagTranslation, isSystemTag } from '@/lib/content-translation'
```

---

## 12. Summary of Tag Translation Behavior

| Tag Type | Example | Behavior | Result |
|----------|---------|----------|--------|
| System Tag | `kitchen`, `appliance`, `safety` | Skip immediately | `skipReason: 'system_tag'` |
| User Tag (new) | `coffee-maker`, `guest-favorite` | Queue for all 5 target languages | `jobIds: [5 UUIDs]` |
| User Tag (partial) | Tag with some existing translations | Queue only for missing languages | `queuedLanguages: [missing], existingLanguages: [existing]` |
| User Tag (complete) | Tag with all translations | Skip, return existing info | `skipReason: 'translations_exist'` |
| User Tag (force) | Any user tag with `forceRetranslate: true` | Queue for all 5 target languages | `jobIds: [5 UUIDs]` |

**Key Design Decisions:**

1. **System Tag Detection:** Uses `AVAILABLE_TAGS` constant for fast, consistent detection
2. **Tag Key Normalization:** Tags are normalized to lowercase for consistency
3. **Entity ID:** Tags use the `tagKey` as their entity ID (not a UUID)
4. **Translation Value:** The tag key itself is translated (e.g., "kitchen" -> "cuisine" in French)
5. **Existing Translation Check:** Queries `tag_translations` table before queuing to prevent duplicates

---

## 13. Next Steps After Implementation

After completing Task 1.4 (this task):

1. **Task 1.5:** Implement translation storage utilities (`translation-storage.ts`)
2. **Task 1.6:** Implement translation status utilities (`translation-status.ts`)
3. **Phase 2:** Modify existing API routes:
   - Task 2.5: Add tag translation on item save
4. **Phase 3:** Implement job processors:
   - Task 3.5: Tag translation processor

The tag trigger created in this task will be called by the Items API in Phase 2 whenever items are created or updated with tags.

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-262
- [Type Definitions Task](/docs/REQ-259-create-content-translation-module-structure-overview.md) - REQ-259
- [Orchestrator Task](/docs/REQ-260-implement-content-translation-orchestrator-overview.md) - REQ-260
- [Entity Triggers Task](/docs/REQ-261-implement-entity-specific-translation-triggers-overview.md) - REQ-261
- [System Tags Constants](/src/components/ItemCreationWorkflow/utils/constants.ts) - `AVAILABLE_TAGS`
- [Existing Supabase Client](/src/lib/supabase.ts)

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.4*
