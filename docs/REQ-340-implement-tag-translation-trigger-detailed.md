# REQ-340: Implement Tag Translation Trigger - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.4

---

## Document Purpose

This document provides granular, implementation-ready task specifications for REQ-340: Implement Tag Translation Trigger. Each task is designed to be approximately 1 story point (30-60 minutes of focused work) and includes explicit file paths, function signatures, code snippets, and verification steps.

---

## Executive Summary

This task implements a specialized trigger function for tag translation that intelligently handles both system tags (17 predefined tags already seeded in Epic 1) and user-created custom tags. The trigger checks for existing translations before queuing new jobs and provides clear feedback about skip reasons.

**Key Deliverables:**
- `triggerTagTranslation()` function for single tag translation
- `triggerBatchTagTranslation()` function for multiple tags
- `isSystemTag()` utility function for tag classification
- Unit tests covering all scenarios
- Module exports for external consumption

---

## Prerequisites

### Required Completions Before Starting

| Prerequisite | Status Check Command | Expected Result |
|--------------|---------------------|-----------------|
| Task 1.1 (REQ-338) - Types file | `ls src/lib/content-translation/content-translation.types.ts` | File exists |
| Task 1.2 (REQ-339) - Orchestrator | `ls src/lib/content-translation/content-translation.ts` | File exists |
| Job Queue Module | `ls src/lib/job-queue/index.ts` | File exists |
| System Tags Constant | `grep -l "AVAILABLE_TAGS" src/components/ItemCreationWorkflow/utils/constants.ts` | Match found |
| tag_translations table | Verify via Supabase MCP | Table exists |

### Verification Script

```bash
# Run before starting implementation
echo "=== Verifying Prerequisites ==="

# Check content-translation module exists
if [ -d "src/lib/content-translation" ]; then
  echo "✓ content-translation directory exists"
else
  echo "✗ content-translation directory missing - complete REQ-338/REQ-339 first"
  exit 1
fi

# Check types file
if [ -f "src/lib/content-translation/content-translation.types.ts" ]; then
  echo "✓ content-translation.types.ts exists"
else
  echo "✗ content-translation.types.ts missing - complete REQ-338 first"
  exit 1
fi

# Check job queue
if [ -f "src/lib/job-queue/index.ts" ]; then
  echo "✓ job-queue module exists"
else
  echo "✗ job-queue module missing - complete Epic 1 first"
  exit 1
fi

# Check AVAILABLE_TAGS constant
if grep -q "AVAILABLE_TAGS" src/components/ItemCreationWorkflow/utils/constants.ts 2>/dev/null; then
  echo "✓ AVAILABLE_TAGS constant found"
else
  echo "✗ AVAILABLE_TAGS constant not found"
  exit 1
fi

echo "=== All prerequisites verified ==="
```

---

## Detailed Tasks

### Task 1: Create Triggers Directory Structure

**Estimated Time:** 5 minutes
**Dependencies:** None
**Story Points:** 0.5

#### Description

Create the triggers subdirectory within the content-translation module to house all entity-specific translation trigger files.

#### Steps

1. **Create triggers directory:**

```bash
mkdir -p src/lib/content-translation/triggers
```

2. **Create placeholder index file:**

Create file: `/src/lib/content-translation/triggers/index.ts`

```typescript
/**
 * Content Translation Triggers
 *
 * Entity-specific trigger functions for initiating translation workflows.
 * Each trigger extracts appropriate fields and queues translation jobs.
 *
 * @module content-translation/triggers
 * @created 2026-01-19
 */

// Task 1.3: Entity triggers (item, article, link)
// export * from './item-trigger';
// export * from './article-trigger';
// export * from './link-trigger';

// Task 1.4: Tag trigger (this task)
// export * from './tag-trigger';
```

#### Verification

```bash
# Verify directory and file created
ls -la src/lib/content-translation/triggers/
# Expected: directory exists with index.ts file
```

#### Acceptance Criteria

- [ ] `src/lib/content-translation/triggers/` directory exists
- [ ] `src/lib/content-translation/triggers/index.ts` file exists with placeholder exports

---

### Task 2: Implement isSystemTag Utility Function

**Estimated Time:** 15 minutes
**Dependencies:** Task 1
**Story Points:** 0.5

#### Description

Create the `isSystemTag()` utility function that determines whether a given tag key is a predefined system tag (which already has translations from Epic 1) or a user-created custom tag.

#### File to Create

`/src/lib/content-translation/triggers/tag-trigger.ts`

#### Implementation

```typescript
/**
 * Tag Translation Trigger
 * Part of REQ-340: Implement Tag Translation Trigger
 *
 * Handles translation triggering for tags, with special handling for:
 * - System tags (17 predefined tags) - skip, already seeded
 * - User-created tags - check existing translations, queue missing
 *
 * @module content-translation/triggers/tag-trigger
 * @created 2026-01-19
 * @modified 2026-01-19
 */

import { AVAILABLE_TAGS } from '@/components/ItemCreationWorkflow/utils/constants';
import type { SupportedLanguage } from '@/lib/job-queue';

// ============================================================================
// Constants
// ============================================================================

/**
 * All supported languages for translation (from Epic 1)
 */
export const ALL_SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'en', 'fr', 'es', 'de', 'nl', 'it'
];

/**
 * Set of system tag keys for O(1) lookup performance
 * System tags are pre-seeded with translations in Epic 1
 */
const SYSTEM_TAGS_SET: ReadonlySet<string> = new Set(AVAILABLE_TAGS);

// ============================================================================
// System Tag Detection
// ============================================================================

/**
 * Checks if a tag key is a system tag (predefined with pre-seeded translations)
 *
 * System tags are the 17 predefined tags from AVAILABLE_TAGS:
 * - Room tags: kitchen, laundry, bedroom, bathroom, living-room, garage, outdoor, general
 * - Item type tags: appliance, room-item
 * - Purpose tags: instructions, cleaning, troubleshooting, safety, maintenance, features, info
 *
 * @param tagKey - The tag key to check (case-sensitive)
 * @returns true if the tag is a system tag, false if user-created
 *
 * @example
 * isSystemTag('kitchen')     // true - system tag
 * isSystemTag('coffee-maker') // false - user-created tag
 * isSystemTag('Kitchen')     // false - case-sensitive, 'kitchen' is system, 'Kitchen' is not
 */
export function isSystemTag(tagKey: string): boolean {
  // Handle edge cases
  if (!tagKey || typeof tagKey !== 'string') {
    return false;
  }

  // Normalize to lowercase for comparison (tags are stored lowercase)
  const normalizedKey = tagKey.trim().toLowerCase();

  return SYSTEM_TAGS_SET.has(normalizedKey);
}

/**
 * Gets the list of all system tag keys
 * Useful for debugging and validation
 *
 * @returns Array of all 17 system tag keys
 */
export function getSystemTagKeys(): readonly string[] {
  return AVAILABLE_TAGS;
}

/**
 * Gets the count of system tags
 *
 * @returns Number of system tags (17)
 */
export function getSystemTagCount(): number {
  return AVAILABLE_TAGS.length;
}
```

#### Verification

```bash
# Verify file created and compiles
npx tsc --noEmit src/lib/content-translation/triggers/tag-trigger.ts 2>&1 | head -20
```

#### Acceptance Criteria

- [ ] `isSystemTag()` function returns `true` for all 17 system tags
- [ ] `isSystemTag()` function returns `false` for user-created tags
- [ ] Function handles edge cases (empty string, null, undefined)
- [ ] Function normalizes tag keys to lowercase before comparison
- [ ] TypeScript compiles without errors

---

### Task 3: Implement Tag Translation Result Types

**Estimated Time:** 15 minutes
**Dependencies:** Task 2
**Story Points:** 0.5

#### Description

Define the TypeScript interfaces specific to tag translation results, extending the base `QueueTranslationResult` from Task 1.1.

#### File to Modify

`/src/lib/content-translation/triggers/tag-trigger.ts`

#### Add After Existing Code

```typescript
// ============================================================================
// Types
// ============================================================================

/**
 * Reason why tag translation was skipped
 */
export type TagSkipReason =
  | 'system_tag'           // Tag is a system tag with pre-seeded translations
  | 'translations_exist'   // All translations already exist
  | 'no_content'           // Tag key is empty or invalid
  | 'invalid_language';    // Source language is not supported

/**
 * Options for triggering tag translation
 */
export interface TriggerTagTranslationOptions {
  /** Force re-translation even if translations exist */
  force?: boolean;
  /** Specific languages to translate to (default: all except source) */
  targetLanguages?: SupportedLanguage[];
  /** Priority level for the jobs (higher = more urgent) */
  priority?: number;
}

/**
 * Result of a tag translation trigger operation
 * Extends the base result with tag-specific information
 */
export interface TagTranslationResult {
  /** Whether the operation succeeded (may succeed with skipReason) */
  success: boolean;
  /** IDs of translation jobs that were created */
  jobIds: string[];
  /** Languages that were queued for translation */
  queuedLanguages: SupportedLanguage[];
  /** Languages that already had translations (skipped) */
  existingLanguages: SupportedLanguage[];
  /** Reason why translation was skipped (if applicable) */
  skipReason?: TagSkipReason;
  /** Error message if operation failed */
  error?: string;
  /** The tag key that was processed */
  tagKey: string;
  /** Whether this is a system tag */
  isSystemTag: boolean;
}

/**
 * Result of batch tag translation trigger operation
 */
export interface BatchTagTranslationResult {
  /** Total number of tags processed */
  totalTags: number;
  /** Number of system tags skipped */
  systemTagsSkipped: number;
  /** Number of tags with all translations already existing */
  existingSkipped: number;
  /** Number of tags that had jobs queued */
  tagsQueued: number;
  /** Total number of jobs created */
  totalJobsCreated: number;
  /** Individual results for each tag */
  results: TagTranslationResult[];
  /** Any errors encountered */
  errors: Array<{ tagKey: string; error: string }>;
}
```

#### Verification

```bash
# Verify types compile
npx tsc --noEmit src/lib/content-translation/triggers/tag-trigger.ts
```

#### Acceptance Criteria

- [ ] `TagSkipReason` type covers all skip scenarios
- [ ] `TriggerTagTranslationOptions` interface defined
- [ ] `TagTranslationResult` interface defined with all required fields
- [ ] `BatchTagTranslationResult` interface defined for batch operations
- [ ] TypeScript compiles without errors

---

### Task 4: Implement getExistingTranslationLanguages Helper

**Estimated Time:** 20 minutes
**Dependencies:** Task 3
**Story Points:** 1

#### Description

Implement a helper function that queries the `tag_translations` table to find which languages already have translations for a given tag key.

#### File to Modify

`/src/lib/content-translation/triggers/tag-trigger.ts`

#### Add Imports (at top of file)

```typescript
import { supabaseAdmin } from '@/lib/supabase';
```

#### Add Implementation

```typescript
// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks which languages already have translations for a given tag
 *
 * @param tagKey - The tag key to check translations for
 * @returns Array of languages that already have translations
 *
 * @example
 * const existing = await getExistingTranslationLanguages('coffee-maker');
 * // Returns: ['en', 'fr'] if English and French translations exist
 */
export async function getExistingTranslationLanguages(
  tagKey: string
): Promise<SupportedLanguage[]> {
  // Normalize tag key
  const normalizedKey = tagKey.trim().toLowerCase();

  if (!normalizedKey) {
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('tag_translations')
      .select('language')
      .eq('tag_key', normalizedKey);

    if (error) {
      console.error('[tag-trigger] Error fetching existing translations:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract and type-check languages
    const languages = data
      .map(row => row.language as string)
      .filter((lang): lang is SupportedLanguage =>
        ALL_SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
      );

    return languages;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[tag-trigger] Exception fetching existing translations:', message);
    return [];
  }
}

/**
 * Determines which languages need translation for a tag
 *
 * @param tagKey - The tag key to check
 * @param sourceLanguage - The source language (will be excluded)
 * @param targetLanguages - Optional specific target languages
 * @returns Object with missing and existing language arrays
 */
export async function getMissingTranslationLanguages(
  tagKey: string,
  sourceLanguage: SupportedLanguage,
  targetLanguages?: SupportedLanguage[]
): Promise<{
  missing: SupportedLanguage[];
  existing: SupportedLanguage[];
}> {
  // Get existing translations
  const existing = await getExistingTranslationLanguages(tagKey);
  const existingSet = new Set(existing);

  // Determine target languages (all supported minus source)
  const targets = targetLanguages ||
    ALL_SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage);

  // Find missing languages
  const missing = targets.filter(lang => !existingSet.has(lang));

  return {
    missing,
    existing: targets.filter(lang => existingSet.has(lang))
  };
}
```

#### Verification

```bash
# Verify compiles
npx tsc --noEmit src/lib/content-translation/triggers/tag-trigger.ts

# Verify Supabase import works (build test)
npm run build 2>&1 | grep -i "tag-trigger" | head -5
```

#### Acceptance Criteria

- [ ] `getExistingTranslationLanguages()` queries tag_translations table correctly
- [ ] Function handles database errors gracefully
- [ ] Function returns empty array for non-existent tags
- [ ] `getMissingTranslationLanguages()` correctly identifies missing translations
- [ ] Source language is excluded from target languages

---

### Task 5: Implement triggerTagTranslation Main Function

**Estimated Time:** 30 minutes
**Dependencies:** Task 4
**Story Points:** 1

#### Description

Implement the main `triggerTagTranslation()` function that orchestrates the tag translation workflow: validates inputs, checks for system tags, checks for existing translations, and queues jobs for missing translations.

#### File to Modify

`/src/lib/content-translation/triggers/tag-trigger.ts`

#### Add Import (at top)

```typescript
import { createBatchTranslationJobs } from '@/lib/job-queue';
```

#### Add Implementation

```typescript
// ============================================================================
// Main Trigger Functions
// ============================================================================

/**
 * Triggers translation for a single tag
 *
 * This function implements the following decision flow:
 * 1. Validate inputs (non-empty tag key, valid source language)
 * 2. Check if system tag → skip with 'system_tag' reason
 * 3. Check existing translations → skip fully translated tags
 * 4. Queue translation jobs for missing languages
 *
 * @param tagKey - The tag key to translate
 * @param sourceLanguage - The source language of the tag
 * @param options - Optional configuration for the translation
 * @returns TagTranslationResult with job IDs or skip reason
 *
 * @example
 * // Translate a user-created tag
 * const result = await triggerTagTranslation('coffee-maker', 'en');
 * if (result.skipReason === 'system_tag') {
 *   console.log('System tag, already has translations');
 * } else if (result.jobIds.length > 0) {
 *   console.log(`Created ${result.jobIds.length} translation jobs`);
 * }
 */
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: SupportedLanguage,
  options: TriggerTagTranslationOptions = {}
): Promise<TagTranslationResult> {
  // Initialize result
  const result: TagTranslationResult = {
    success: true,
    jobIds: [],
    queuedLanguages: [],
    existingLanguages: [],
    tagKey: tagKey?.trim().toLowerCase() || '',
    isSystemTag: false,
  };

  // -------------------------------------------------------------------------
  // Step 1: Validate inputs
  // -------------------------------------------------------------------------

  if (!tagKey || typeof tagKey !== 'string' || tagKey.trim() === '') {
    return {
      ...result,
      success: false,
      skipReason: 'no_content',
      error: 'Tag key is required and must be a non-empty string',
    };
  }

  const normalizedTagKey = tagKey.trim().toLowerCase();
  result.tagKey = normalizedTagKey;

  if (!ALL_SUPPORTED_LANGUAGES.includes(sourceLanguage)) {
    return {
      ...result,
      success: false,
      skipReason: 'invalid_language',
      error: `Source language '${sourceLanguage}' is not supported. Supported: ${ALL_SUPPORTED_LANGUAGES.join(', ')}`,
    };
  }

  // -------------------------------------------------------------------------
  // Step 2: Check if system tag
  // -------------------------------------------------------------------------

  if (isSystemTag(normalizedTagKey)) {
    return {
      ...result,
      success: true,
      isSystemTag: true,
      skipReason: 'system_tag',
    };
  }

  // -------------------------------------------------------------------------
  // Step 3: Check existing translations
  // -------------------------------------------------------------------------

  const { missing, existing } = await getMissingTranslationLanguages(
    normalizedTagKey,
    sourceLanguage,
    options.targetLanguages
  );

  result.existingLanguages = existing;

  // If not forcing and all translations exist, skip
  if (!options.force && missing.length === 0) {
    return {
      ...result,
      success: true,
      skipReason: 'translations_exist',
    };
  }

  // -------------------------------------------------------------------------
  // Step 4: Queue translation jobs for missing languages
  // -------------------------------------------------------------------------

  const languagesToTranslate = options.force
    ? (options.targetLanguages || ALL_SUPPORTED_LANGUAGES.filter(l => l !== sourceLanguage))
    : missing;

  if (languagesToTranslate.length === 0) {
    return {
      ...result,
      success: true,
      skipReason: 'translations_exist',
    };
  }

  try {
    const jobResult = await createBatchTranslationJobs({
      entityType: 'tag',
      entityId: normalizedTagKey, // For tags, entityId is the tag key
      sourceLanguage,
      targetLanguages: languagesToTranslate,
    });

    if (!jobResult.success) {
      return {
        ...result,
        success: false,
        error: jobResult.error || 'Failed to create translation jobs',
      };
    }

    result.jobIds = jobResult.data || [];
    result.queuedLanguages = languagesToTranslate;

    console.log(
      `[tag-trigger] Queued ${result.jobIds.length} translation jobs for tag '${normalizedTagKey}' ` +
      `(languages: ${languagesToTranslate.join(', ')})`
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[tag-trigger] Error creating translation jobs for tag '${normalizedTagKey}':`, message);

    return {
      ...result,
      success: false,
      error: `Failed to queue translation jobs: ${message}`,
    };
  }
}
```

#### Verification

```bash
# Verify compiles
npx tsc --noEmit src/lib/content-translation/triggers/tag-trigger.ts

# Verify imports resolve
npm run build 2>&1 | grep -i "error" | head -10
```

#### Acceptance Criteria

- [ ] Function validates tag key (non-empty string required)
- [ ] Function validates source language
- [ ] System tags return immediately with `skipReason: 'system_tag'`
- [ ] Function checks existing translations before queuing
- [ ] Returns `skipReason: 'translations_exist'` when all translations exist
- [ ] Successfully queues jobs for missing languages
- [ ] Returns job IDs in the result
- [ ] Handles database errors gracefully
- [ ] Logs job creation operations

---

### Task 6: Implement triggerBatchTagTranslation Function

**Estimated Time:** 20 minutes
**Dependencies:** Task 5
**Story Points:** 1

#### Description

Implement the batch processing function that handles translation triggering for multiple tags efficiently.

#### File to Modify

`/src/lib/content-translation/triggers/tag-trigger.ts`

#### Add Implementation

```typescript
/**
 * Triggers translation for multiple tags
 *
 * Processes tags sequentially to avoid overwhelming the job queue.
 * Aggregates results and provides summary statistics.
 *
 * @param tagKeys - Array of tag keys to translate
 * @param sourceLanguage - The source language for all tags
 * @param options - Optional configuration for the translations
 * @returns BatchTagTranslationResult with aggregated statistics
 *
 * @example
 * const result = await triggerBatchTagTranslation(
 *   ['coffee-maker', 'espresso-machine', 'kitchen'],
 *   'en'
 * );
 * console.log(`Processed ${result.totalTags} tags`);
 * console.log(`Created ${result.totalJobsCreated} jobs`);
 * console.log(`Skipped ${result.systemTagsSkipped} system tags`);
 */
export async function triggerBatchTagTranslation(
  tagKeys: string[],
  sourceLanguage: SupportedLanguage,
  options: TriggerTagTranslationOptions = {}
): Promise<BatchTagTranslationResult> {
  const result: BatchTagTranslationResult = {
    totalTags: tagKeys.length,
    systemTagsSkipped: 0,
    existingSkipped: 0,
    tagsQueued: 0,
    totalJobsCreated: 0,
    results: [],
    errors: [],
  };

  if (!tagKeys || tagKeys.length === 0) {
    return result;
  }

  // Filter out empty/invalid tag keys
  const validTagKeys = tagKeys
    .filter(key => key && typeof key === 'string' && key.trim() !== '')
    .map(key => key.trim().toLowerCase());

  // Remove duplicates
  const uniqueTagKeys = [...new Set(validTagKeys)];
  result.totalTags = uniqueTagKeys.length;

  // Process each tag
  for (const tagKey of uniqueTagKeys) {
    try {
      const tagResult = await triggerTagTranslation(tagKey, sourceLanguage, options);
      result.results.push(tagResult);

      // Update statistics
      if (tagResult.skipReason === 'system_tag') {
        result.systemTagsSkipped++;
      } else if (tagResult.skipReason === 'translations_exist') {
        result.existingSkipped++;
      } else if (tagResult.jobIds.length > 0) {
        result.tagsQueued++;
        result.totalJobsCreated += tagResult.jobIds.length;
      }

      if (!tagResult.success && tagResult.error) {
        result.errors.push({ tagKey, error: tagResult.error });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push({ tagKey, error: message });
      result.results.push({
        success: false,
        jobIds: [],
        queuedLanguages: [],
        existingLanguages: [],
        tagKey,
        isSystemTag: isSystemTag(tagKey),
        error: message,
      });
    }
  }

  console.log(
    `[tag-trigger] Batch complete: ${result.totalTags} tags processed, ` +
    `${result.tagsQueued} queued, ${result.systemTagsSkipped} system tags skipped, ` +
    `${result.existingSkipped} already translated, ${result.totalJobsCreated} jobs created`
  );

  return result;
}
```

#### Verification

```bash
# Verify compiles
npx tsc --noEmit src/lib/content-translation/triggers/tag-trigger.ts
```

#### Acceptance Criteria

- [ ] Function processes array of tag keys
- [ ] Handles empty array gracefully
- [ ] Filters out invalid/empty tag keys
- [ ] Removes duplicate tag keys
- [ ] Aggregates statistics correctly
- [ ] Collects errors without stopping processing
- [ ] Returns individual results for each tag

---

### Task 7: Update Module Exports

**Estimated Time:** 10 minutes
**Dependencies:** Task 6
**Story Points:** 0.5

#### Description

Update the triggers index and main content-translation module index to export the new tag trigger functions and types.

#### Files to Modify

1. `/src/lib/content-translation/triggers/index.ts`
2. `/src/lib/content-translation/index.ts` (create if doesn't exist)

#### Update triggers/index.ts

```typescript
/**
 * Content Translation Triggers
 *
 * Entity-specific trigger functions for initiating translation workflows.
 * Each trigger extracts appropriate fields and queues translation jobs.
 *
 * @module content-translation/triggers
 * @created 2026-01-19
 * @modified 2026-01-19
 */

// Task 1.3: Entity triggers (item, article, link)
// export * from './item-trigger';
// export * from './article-trigger';
// export * from './link-trigger';

// Task 1.4: Tag trigger
export {
  // Main functions
  triggerTagTranslation,
  triggerBatchTagTranslation,

  // Utility functions
  isSystemTag,
  getSystemTagKeys,
  getSystemTagCount,
  getExistingTranslationLanguages,
  getMissingTranslationLanguages,

  // Constants
  ALL_SUPPORTED_LANGUAGES,
} from './tag-trigger';

export type {
  // Types
  TagSkipReason,
  TriggerTagTranslationOptions,
  TagTranslationResult,
  BatchTagTranslationResult,
} from './tag-trigger';
```

#### Create/Update content-translation/index.ts

```typescript
/**
 * Content Translation Module
 * Part of L10N Epic 3: Dynamic Content Translation
 *
 * This module provides functions for triggering and managing
 * automatic translation of user-generated content.
 *
 * @module content-translation
 * @created 2026-01-19
 * @modified 2026-01-19
 */

// Types (from Task 1.1 - REQ-338)
// export type {
//   EntityType,
//   TranslationTrigger,
//   ContentToTranslate,
//   TranslatableField,
//   QueueTranslationOptions,
//   QueueTranslationResult,
// } from './content-translation.types';

// Orchestrator (from Task 1.2 - REQ-339)
// export { queueContentTranslations } from './content-translation';

// Entity-specific triggers (Task 1.3 - REQ-340 items/articles/links)
// export * from './triggers/item-trigger';
// export * from './triggers/article-trigger';
// export * from './triggers/link-trigger';

// Tag trigger (Task 1.4 - REQ-340 tags)
export {
  // Functions
  triggerTagTranslation,
  triggerBatchTagTranslation,
  isSystemTag,
  getSystemTagKeys,
  getSystemTagCount,
  getExistingTranslationLanguages,
  getMissingTranslationLanguages,
  ALL_SUPPORTED_LANGUAGES,
} from './triggers/tag-trigger';

export type {
  TagSkipReason,
  TriggerTagTranslationOptions,
  TagTranslationResult,
  BatchTagTranslationResult,
} from './triggers/tag-trigger';
```

#### Verification

```bash
# Verify exports work
echo "import { triggerTagTranslation, isSystemTag } from '@/lib/content-translation';" > /tmp/test-import.ts
npx tsc --noEmit /tmp/test-import.ts 2>&1 || echo "Import test requires build context"

# Verify build
npm run build 2>&1 | grep -i "content-translation" | head -10
```

#### Acceptance Criteria

- [ ] `triggerTagTranslation` exported from module index
- [ ] `triggerBatchTagTranslation` exported from module index
- [ ] `isSystemTag` exported from module index
- [ ] All types exported from module index
- [ ] TypeScript compilation passes

---

### Task 8: Create Unit Tests - isSystemTag

**Estimated Time:** 20 minutes
**Dependencies:** Task 2
**Story Points:** 1

#### Description

Create comprehensive unit tests for the `isSystemTag()` utility function.

#### File to Create

`/src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts`

#### Implementation

```typescript
/**
 * Unit Tests: Tag Translation Trigger
 * Part of REQ-340: Implement Tag Translation Trigger
 *
 * @created 2026-01-19
 * @modified 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isSystemTag,
  getSystemTagKeys,
  getSystemTagCount,
  ALL_SUPPORTED_LANGUAGES,
} from '../tag-trigger';

// ============================================================================
// isSystemTag Tests
// ============================================================================

describe('isSystemTag', () => {
  describe('system tag detection', () => {
    it('returns true for all 17 system tags', () => {
      const systemTags = [
        // Room tags (8)
        'kitchen', 'laundry', 'bedroom', 'bathroom',
        'living-room', 'garage', 'outdoor', 'general',
        // Item type tags (2)
        'appliance', 'room-item',
        // Purpose tags (7)
        'instructions', 'cleaning', 'troubleshooting',
        'safety', 'maintenance', 'features', 'info',
      ];

      systemTags.forEach(tag => {
        expect(isSystemTag(tag)).toBe(true);
      });
    });

    it('returns true for system tags regardless of case', () => {
      expect(isSystemTag('KITCHEN')).toBe(true);
      expect(isSystemTag('Kitchen')).toBe(true);
      expect(isSystemTag('LIVING-ROOM')).toBe(true);
      expect(isSystemTag('Living-Room')).toBe(true);
    });

    it('returns true for system tags with leading/trailing whitespace', () => {
      expect(isSystemTag('  kitchen  ')).toBe(true);
      expect(isSystemTag('\tkitchen\n')).toBe(true);
    });
  });

  describe('user tag detection', () => {
    it('returns false for user-created tags', () => {
      const userTags = [
        'coffee-maker',
        'espresso-machine',
        'smart-tv',
        'pool-heater',
        'wine-fridge',
      ];

      userTags.forEach(tag => {
        expect(isSystemTag(tag)).toBe(false);
      });
    });

    it('returns false for similar but different tag names', () => {
      expect(isSystemTag('kitchens')).toBe(false);  // plural
      expect(isSystemTag('living_room')).toBe(false);  // underscore instead of hyphen
      expect(isSystemTag('livingroom')).toBe(false);  // no separator
      expect(isSystemTag('room-living')).toBe(false);  // reversed
    });
  });

  describe('edge cases', () => {
    it('returns false for empty string', () => {
      expect(isSystemTag('')).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
      expect(isSystemTag('   ')).toBe(false);
      expect(isSystemTag('\t\n')).toBe(false);
    });

    it('returns false for null/undefined (type coerced)', () => {
      // @ts-expect-error - testing runtime behavior
      expect(isSystemTag(null)).toBe(false);
      // @ts-expect-error - testing runtime behavior
      expect(isSystemTag(undefined)).toBe(false);
    });

    it('returns false for non-string types', () => {
      // @ts-expect-error - testing runtime behavior
      expect(isSystemTag(123)).toBe(false);
      // @ts-expect-error - testing runtime behavior
      expect(isSystemTag({})).toBe(false);
      // @ts-expect-error - testing runtime behavior
      expect(isSystemTag([])).toBe(false);
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('getSystemTagKeys', () => {
  it('returns array of all 17 system tags', () => {
    const keys = getSystemTagKeys();
    expect(keys).toHaveLength(17);
    expect(keys).toContain('kitchen');
    expect(keys).toContain('safety');
  });

  it('returns readonly array', () => {
    const keys = getSystemTagKeys();
    // Verify it's a readonly type (compile-time check)
    expect(Array.isArray(keys)).toBe(true);
  });
});

describe('getSystemTagCount', () => {
  it('returns 17', () => {
    expect(getSystemTagCount()).toBe(17);
  });
});

describe('ALL_SUPPORTED_LANGUAGES', () => {
  it('contains all 6 supported languages', () => {
    expect(ALL_SUPPORTED_LANGUAGES).toHaveLength(6);
    expect(ALL_SUPPORTED_LANGUAGES).toContain('en');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('fr');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('es');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('de');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('nl');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('it');
  });
});
```

#### Verification

```bash
# Run tests
npm test -- --grep "isSystemTag"
```

#### Acceptance Criteria

- [ ] Tests verify all 17 system tags return true
- [ ] Tests verify user-created tags return false
- [ ] Tests verify case insensitivity
- [ ] Tests verify whitespace handling
- [ ] Tests verify edge cases (null, undefined, empty)
- [ ] All tests pass

---

### Task 9: Create Unit Tests - triggerTagTranslation

**Estimated Time:** 30 minutes
**Dependencies:** Task 8
**Story Points:** 1

#### Description

Create unit tests for the main `triggerTagTranslation()` function with mocked database calls.

#### File to Modify

`/src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts`

#### Add to Existing File

```typescript
// Add at the top with other imports
import {
  triggerTagTranslation,
  triggerBatchTagTranslation,
  getExistingTranslationLanguages,
} from '../tag-trigger';
import { supabaseAdmin } from '@/lib/supabase';
import * as jobQueue from '@/lib/job-queue';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/job-queue', () => ({
  createBatchTranslationJobs: vi.fn(),
}));

// ============================================================================
// triggerTagTranslation Tests
// ============================================================================

describe('triggerTagTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('input validation', () => {
    it('returns error for empty tag key', async () => {
      const result = await triggerTagTranslation('', 'en');

      expect(result.success).toBe(false);
      expect(result.skipReason).toBe('no_content');
      expect(result.error).toContain('Tag key is required');
    });

    it('returns error for whitespace-only tag key', async () => {
      const result = await triggerTagTranslation('   ', 'en');

      expect(result.success).toBe(false);
      expect(result.skipReason).toBe('no_content');
    });

    it('returns error for invalid source language', async () => {
      const result = await triggerTagTranslation('coffee-maker', 'xx' as any);

      expect(result.success).toBe(false);
      expect(result.skipReason).toBe('invalid_language');
      expect(result.error).toContain('not supported');
    });
  });

  describe('system tag handling', () => {
    it('skips system tags without queuing jobs', async () => {
      const result = await triggerTagTranslation('kitchen', 'en');

      expect(result.success).toBe(true);
      expect(result.skipReason).toBe('system_tag');
      expect(result.isSystemTag).toBe(true);
      expect(result.jobIds).toHaveLength(0);

      // Verify no database or job queue calls
      expect(supabaseAdmin.from).not.toHaveBeenCalled();
      expect(jobQueue.createBatchTranslationJobs).not.toHaveBeenCalled();
    });

    it('skips all 17 system tags', async () => {
      const systemTags = getSystemTagKeys();

      for (const tag of systemTags) {
        const result = await triggerTagTranslation(tag, 'en');
        expect(result.skipReason).toBe('system_tag');
      }
    });
  });

  describe('existing translations handling', () => {
    it('skips tag when all translations exist', async () => {
      // Mock database to return all languages
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { language: 'fr' },
            { language: 'es' },
            { language: 'de' },
            { language: 'nl' },
            { language: 'it' },
          ],
          error: null,
        }),
      });
      vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

      const result = await triggerTagTranslation('coffee-maker', 'en');

      expect(result.success).toBe(true);
      expect(result.skipReason).toBe('translations_exist');
      expect(result.existingLanguages).toHaveLength(5);
      expect(jobQueue.createBatchTranslationJobs).not.toHaveBeenCalled();
    });

    it('queues only missing languages when some exist', async () => {
      // Mock database to return partial translations
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { language: 'fr' },
            { language: 'es' },
          ],
          error: null,
        }),
      });
      vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

      // Mock job creation
      vi.mocked(jobQueue.createBatchTranslationJobs).mockResolvedValue({
        success: true,
        data: ['job-1', 'job-2', 'job-3'],
      });

      const result = await triggerTagTranslation('coffee-maker', 'en');

      expect(result.success).toBe(true);
      expect(result.skipReason).toBeUndefined();
      expect(result.existingLanguages).toContain('fr');
      expect(result.existingLanguages).toContain('es');
      expect(result.queuedLanguages).toContain('de');
      expect(result.queuedLanguages).toContain('nl');
      expect(result.queuedLanguages).toContain('it');
      expect(result.jobIds).toHaveLength(3);
    });
  });

  describe('job creation', () => {
    it('queues all target languages for new tags', async () => {
      // Mock no existing translations
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });
      vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

      // Mock job creation
      vi.mocked(jobQueue.createBatchTranslationJobs).mockResolvedValue({
        success: true,
        data: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
      });

      const result = await triggerTagTranslation('coffee-maker', 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
      expect(result.queuedLanguages).toHaveLength(5);

      expect(jobQueue.createBatchTranslationJobs).toHaveBeenCalledWith({
        entityType: 'tag',
        entityId: 'coffee-maker',
        sourceLanguage: 'en',
        targetLanguages: expect.arrayContaining(['fr', 'es', 'de', 'nl', 'it']),
      });
    });

    it('handles job creation failure gracefully', async () => {
      // Mock no existing translations
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });
      vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

      // Mock job creation failure
      vi.mocked(jobQueue.createBatchTranslationJobs).mockResolvedValue({
        success: false,
        error: 'Database connection error',
      });

      const result = await triggerTagTranslation('coffee-maker', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection error');
    });
  });

  describe('force option', () => {
    it('re-queues all translations when force is true', async () => {
      // Mock existing translations
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { language: 'fr' },
            { language: 'es' },
            { language: 'de' },
            { language: 'nl' },
            { language: 'it' },
          ],
          error: null,
        }),
      });
      vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

      // Mock job creation
      vi.mocked(jobQueue.createBatchTranslationJobs).mockResolvedValue({
        success: true,
        data: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
      });

      const result = await triggerTagTranslation('coffee-maker', 'en', { force: true });

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
      expect(jobQueue.createBatchTranslationJobs).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// triggerBatchTagTranslation Tests
// ============================================================================

describe('triggerBatchTagTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes multiple tags and aggregates results', async () => {
    // Mock for system tags (will be skipped by isSystemTag check)
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

    vi.mocked(jobQueue.createBatchTranslationJobs).mockResolvedValue({
      success: true,
      data: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    });

    const result = await triggerBatchTagTranslation(
      ['kitchen', 'coffee-maker', 'espresso-machine'],
      'en'
    );

    expect(result.totalTags).toBe(3);
    expect(result.systemTagsSkipped).toBe(1); // kitchen
    expect(result.tagsQueued).toBe(2); // coffee-maker, espresso-machine
    expect(result.results).toHaveLength(3);
  });

  it('handles empty array gracefully', async () => {
    const result = await triggerBatchTagTranslation([], 'en');

    expect(result.totalTags).toBe(0);
    expect(result.results).toHaveLength(0);
  });

  it('removes duplicate tags', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

    vi.mocked(jobQueue.createBatchTranslationJobs).mockResolvedValue({
      success: true,
      data: ['job-1'],
    });

    const result = await triggerBatchTagTranslation(
      ['coffee-maker', 'COFFEE-MAKER', 'Coffee-Maker'],
      'en'
    );

    expect(result.totalTags).toBe(1); // Deduplicated to 1
  });

  it('filters out empty/invalid tags', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

    vi.mocked(jobQueue.createBatchTranslationJobs).mockResolvedValue({
      success: true,
      data: ['job-1'],
    });

    const result = await triggerBatchTagTranslation(
      ['coffee-maker', '', '   ', null as any],
      'en'
    );

    expect(result.totalTags).toBe(1); // Only coffee-maker is valid
  });
});
```

#### Verification

```bash
# Run all tests
npm test -- --grep "tag-trigger"

# Run with coverage
npm test -- --coverage --grep "tag-trigger"
```

#### Acceptance Criteria

- [ ] Input validation tests pass
- [ ] System tag handling tests pass
- [ ] Existing translation tests pass
- [ ] Job creation tests pass
- [ ] Force option tests pass
- [ ] Batch processing tests pass
- [ ] All mocks work correctly

---

### Task 10: Build Verification and Final Checks

**Estimated Time:** 15 minutes
**Dependencies:** All previous tasks
**Story Points:** 0.5

#### Description

Perform final verification that all components compile, integrate correctly, and the module can be imported from the expected path.

#### Verification Steps

```bash
# Step 1: TypeScript compilation
echo "=== Step 1: TypeScript Compilation ==="
npx tsc --noEmit
echo "TypeScript compilation: $?"

# Step 2: Full build
echo "=== Step 2: Full Build ==="
npm run build
echo "Build: $?"

# Step 3: Run all tag-trigger tests
echo "=== Step 3: Unit Tests ==="
npm test -- --grep "tag-trigger"
echo "Tests: $?"

# Step 4: Verify exports
echo "=== Step 4: Verify Module Exports ==="
node -e "
const path = require('path');
const fs = require('fs');

// Check file exists
const triggerFile = path.join(process.cwd(), 'src/lib/content-translation/triggers/tag-trigger.ts');
if (fs.existsSync(triggerFile)) {
  console.log('✓ tag-trigger.ts exists');
} else {
  console.log('✗ tag-trigger.ts NOT FOUND');
  process.exit(1);
}

// Check index exists
const indexFile = path.join(process.cwd(), 'src/lib/content-translation/index.ts');
if (fs.existsSync(indexFile)) {
  console.log('✓ index.ts exists');
} else {
  console.log('✗ index.ts NOT FOUND');
  process.exit(1);
}

console.log('✓ All files present');
"

# Step 5: List created files
echo "=== Step 5: Created Files ==="
ls -la src/lib/content-translation/
ls -la src/lib/content-translation/triggers/

echo "=== Verification Complete ==="
```

#### Acceptance Criteria

- [ ] TypeScript compilation passes without errors
- [ ] npm run build succeeds
- [ ] All unit tests pass
- [ ] `triggerTagTranslation` can be imported from `@/lib/content-translation`
- [ ] `isSystemTag` can be imported from `@/lib/content-translation`
- [ ] All files exist in expected locations

---

## Summary of Files

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/triggers/tag-trigger.ts` | Tag translation trigger with system tag handling |
| `/src/lib/content-translation/triggers/index.ts` | Triggers module exports |
| `/src/lib/content-translation/index.ts` | Main content-translation module exports |
| `/src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts` | Unit tests for tag trigger |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| None | All files are new for this task |

### Functions Created

| Function | File | Purpose |
|----------|------|---------|
| `isSystemTag` | tag-trigger.ts | Check if tag is a system tag |
| `getSystemTagKeys` | tag-trigger.ts | Get all system tag keys |
| `getSystemTagCount` | tag-trigger.ts | Get count of system tags |
| `getExistingTranslationLanguages` | tag-trigger.ts | Query existing translations |
| `getMissingTranslationLanguages` | tag-trigger.ts | Find languages needing translation |
| `triggerTagTranslation` | tag-trigger.ts | Main trigger function |
| `triggerBatchTagTranslation` | tag-trigger.ts | Batch processing function |

---

## Acceptance Criteria Checklist

From REQ-340 and Plan-111:

- [ ] `triggerTagTranslation` function accepts tag identifier and source language parameters
- [ ] Function determines whether tag is system tag using `AVAILABLE_TAGS` constant
- [ ] System tags return immediately without queuing translation jobs
- [ ] System tags return `skipReason: 'system_tag'` in the result
- [ ] User-created tags are checked against existing translations before queuing
- [ ] Translation jobs only queued when translations do not already exist
- [ ] Function returns `QueueTranslationResult` indicating skip reason or newly queued jobs
- [ ] Result includes job tracking identifiers for newly queued translation jobs
- [ ] Function handles database errors gracefully with meaningful error messages
- [ ] `isSystemTag` utility function exported and correctly identifies all 17 system tags
- [ ] `triggerBatchTagTranslation` function processes multiple tags efficiently
- [ ] TypeScript compilation passes without errors
- [ ] Build succeeds
- [ ] Function can be imported: `import { triggerTagTranslation, isSystemTag } from '@/lib/content-translation'`

---

## References

- [Overview Document](/docs/REQ-340-implement-tag-translation-trigger-overview.md)
- [PRD: L10N Epic 3](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md) - Phase 1, Task 1.4
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-340
- [System Tags Constants](/src/components/ItemCreationWorkflow/utils/constants.ts) - `AVAILABLE_TAGS`
- [Job Queue Module](/src/lib/job-queue/index.ts) - `createBatchTranslationJobs`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.4*
