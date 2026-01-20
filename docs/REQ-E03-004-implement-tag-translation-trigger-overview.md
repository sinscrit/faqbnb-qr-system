# REQ-E03-004: Implement Tag Translation Trigger - Implementation Overview
*Generated: 2026-01-19 18:30:00 UTC*

## Reference
- **Request**: REQ-E03-004 (Implement Tag Translation Trigger)
- **Source**: docs/gen_requests_epic3.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
- **Type**: New Feature (Translation Trigger)
- **Epic**: 3 - Dynamic Content Translation
- **Phase**: 1 - Content Translation Infrastructure
- **Task ID**: 1.4
- **Size**: S (Small)

## Goals
1. Create a specialized tag translation trigger function that handles tag-specific translation logic
2. Distinguish between system tags (pre-seeded, skip translation) and user-created tags (queue translation)
3. Check for existing translation jobs before creating new ones to avoid redundant work
4. Queue translation jobs for user-created tags across all target languages
5. Return consistent `QueueTranslationResult` objects with appropriate status information
6. Handle missing tags and database errors gracefully

## Context from Implementation Plan

### Module Location
Per the implementation plan (Plan-111), this is Task 1.4:
- **File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

### Module Hierarchy
```
/src/lib/content-translation/
├── index.ts                        # Public exports (Task 1.1) ✓
├── content-translation.ts          # Main orchestrator (Task 1.2) ✓
├── content-translation.types.ts    # All TypeScript interfaces (Task 1.1) ✓
├── source-language.ts              # Language detection (Task 2.1)
├── triggers/
│   ├── index.ts                    # Barrel exports for triggers (Task 1.3) ✓
│   ├── item-trigger.ts             # Item translation trigger (Task 1.3) ✓
│   ├── article-trigger.ts          # Article translation trigger (Task 1.3) ✓
│   ├── link-trigger.ts             # Link translation trigger (Task 1.3) ✓
│   └── tag-trigger.ts              # Tag translation trigger (THIS TASK)
└── storage/
    ├── translation-storage.ts      # Store/retrieve translations (Task 1.5)
    └── translation-status.ts       # Status tracking utilities (Task 1.6)
```

### Dependencies from Epic 1 and Previous Tasks
This task depends on:
- **Job Queue**: `createBatchTranslationJobs()` from `/src/lib/job-queue/translation-jobs.ts` (Epic 1)
- **Types**: `SupportedLanguage`, `EntityType` from `/src/lib/job-queue/translation-jobs.types.ts` (Epic 1)
- **Orchestrator**: `queueContentTranslations()` from `/src/lib/content-translation/content-translation.ts` (Task 1.2)
- **Content Types**: `QueueTranslationResult`, `TranslatableField` from `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- **Supabase Client**: `supabaseAdmin` from `/src/lib/supabase.ts` for database access

### Task Dependencies
- **Depends On**: Task 1.1 (Content Translation Module Structure), Task 1.2 (Content Translation Orchestrator), Task 1.3 (Entity-specific triggers - provides pattern)
- **Blocks**: Task 2.5 (Add tag translation on item save)
- **Used By**: Tasks 2.2, 2.5 (API routes will call this when processing item tags)

## Database Schema Reference

### Tag Translations Table
```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,           -- The tag identifier (e.g., 'kitchen', 'my-custom-tag')
  language VARCHAR(5) NOT NULL,            -- Target language code
  translated_value TEXT NOT NULL,          -- Translated tag text
  is_system_tag BOOLEAN DEFAULT false,     -- True for pre-seeded system tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tag_key, language)
);
```

### System Tags Reference
System tags are pre-seeded via `/database/seeds/20260117_system_tag_translations.sql`:

**Room Tags** (8): `kitchen`, `laundry`, `bedroom`, `bathroom`, `living-room`, `garage`, `outdoor`, `general`

**Item Type Tags** (2): `appliance`, `room-item`

**Purpose Tags** (7): `instructions`, `cleaning`, `troubleshooting`, `safety`, `maintenance`, `features`, `info`

**Total**: 17 system tags × 6 languages = 102 pre-seeded translation records

### System Tags Constant
The canonical list of system tags is defined in:
- **File**: `/src/components/ItemCreationWorkflow/utils/constants.ts`
- **Constant**: `AVAILABLE_TAGS`

```typescript
export const AVAILABLE_TAGS = [
  'kitchen', 'laundry', 'bedroom', 'bathroom', 'living-room',
  'garage', 'outdoor', 'general', 'appliance', 'room-item',
  'instructions', 'cleaning', 'troubleshooting', 'safety',
  'maintenance', 'features', 'info',
] as const;
```

## Key Design Decisions

### System Tag Detection Strategy
The tag trigger must determine whether a tag is a system tag or user-created tag. Two approaches are possible:

**Option 1: Database Check (Recommended)**
Query `tag_translations` table to check if `is_system_tag = true` for the given tag_key.
- Pros: Source of truth is the database, handles edge cases automatically
- Cons: Requires database query for every tag

**Option 2: Constant Comparison**
Check if tag_key is in the `AVAILABLE_TAGS` constant.
- Pros: No database query, faster
- Cons: Must keep constant in sync with database seeds

**Recommendation**: Use **Option 1 (Database Check)** for accuracy, as the database is the authoritative source. The query is simple and can be combined with the existence check.

### Existing Translation Check
Before queuing new translation jobs, check if translations already exist or are in progress:
1. Query `tag_translations` table for existing translations
2. Query `translation_jobs` table for pending/processing jobs
3. Only queue translations for missing languages

### Simplified Approach for Tags
Tags are simpler than other entities:
- Only one field to translate: the tag value itself (stored as `translated_value`)
- No description or additional metadata
- Tag key is the identifier (not a UUID)

## Implementation Order

### Step 1: Define System Tag Detection Helper
Create a helper function to determine if a tag is a system tag.

**Implementation**:
```typescript
/**
 * Checks if a tag is a system tag (pre-seeded with translations)
 * @param tagKey - The tag identifier
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
    console.warn('TAG_TRIGGER: Error checking system tag status', error);
    return false; // Assume not system tag on error, will queue translation
  }

  return data && data.length > 0;
}
```

### Step 2: Define Existing Translation Check Helper
Create a helper function to check for existing translations.

**Implementation**:
```typescript
/**
 * Gets languages that already have translations for a tag
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
    console.warn('TAG_TRIGGER: Error checking existing translations', error);
    return []; // Assume no translations exist on error
  }

  return (data || []).map(row => row.language as SupportedLanguage);
}
```

### Step 3: Define Pending Jobs Check Helper
Create a helper to check for pending/processing translation jobs.

**Implementation**:
```typescript
/**
 * Gets languages with pending or processing translation jobs for a tag
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
    console.warn('TAG_TRIGGER: Error checking pending jobs', error);
    return []; // Assume no pending jobs on error
  }

  return (data || []).map(row => row.target_language as SupportedLanguage);
}
```

### Step 4: Implement Main Tag Trigger Function
Implement the core `triggerTagTranslation()` function.

**File**: `/src/lib/content-translation/triggers/tag-trigger.ts`

**Function signature**:
```typescript
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: SupportedLanguage
): Promise<QueueTranslationResult>
```

**Implementation flow**:
1. Log the operation with `TAG_TRIGGER:` prefix
2. Check if tag is a system tag - if yes, return success with skip reason
3. Get existing translations and pending jobs
4. Determine which languages still need translation
5. If all languages covered, return success with empty arrays
6. Queue translations only for missing languages
7. Return result with job IDs and queued languages
8. Handle errors gracefully

### Step 5: Update Barrel Exports
Add the tag trigger export to the triggers barrel file.

**File**: `/src/lib/content-translation/triggers/index.ts`

Add:
```typescript
export { triggerTagTranslation } from './tag-trigger';
```

### Step 6: Update Main Module Exports
Add the tag trigger to the main content-translation module exports.

**File**: `/src/lib/content-translation/index.ts`

Update exports to include:
```typescript
export {
  triggerItemTranslation,
  triggerArticleTranslation,
  triggerLinkTranslation,
  triggerTagTranslation,  // ADD THIS
} from './triggers';
```

### Step 7: Verification
- Run TypeScript compilation to verify no errors
- Verify imports resolve correctly
- Test with mock data in development

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/content-translation/triggers/tag-trigger.ts`
- **Purpose**: Tag translation trigger function with system tag detection
- **Functions to implement**:
  - `triggerTagTranslation(tagKey: string, sourceLanguage: SupportedLanguage): Promise<QueueTranslationResult>` - Main trigger function
  - `isSystemTag(tagKey: string): Promise<boolean>` - Helper to detect system tags
  - `getExistingTagTranslationLanguages(tagKey: string): Promise<SupportedLanguage[]>` - Helper to get existing translations
  - `getPendingTagJobLanguages(tagKey: string): Promise<SupportedLanguage[]>` - Helper to get pending jobs
- **Pattern Reference**: Follows error handling pattern from `/src/lib/content-translation/triggers/item-trigger.ts` (Task 1.3)

### Files to Modify

#### `/src/lib/content-translation/triggers/index.ts`
- **Current Exports**: `triggerItemTranslation`, `triggerArticleTranslation`, `triggerLinkTranslation` from Task 1.3
- **Changes**: Add export for `triggerTagTranslation`
- **New Export**: `export { triggerTagTranslation } from './tag-trigger';`

#### `/src/lib/content-translation/index.ts`
- **Current Exports**: Types, orchestrator, and entity triggers from Tasks 1.1-1.3
- **Changes**: Update trigger imports to include `triggerTagTranslation`
- **New Export**: Add `triggerTagTranslation` to the trigger exports

### Existing Files (Import Only - No Modification)

| File | Import |
|------|--------|
| `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` |
| `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `TranslatableField`, `TRANSLATION_CONTEXTS` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `SupportedLanguage` |
| `/src/lib/translation-service/translation-service.types.ts` | `SUPPORTED_LANGUAGES`, `getOtherLanguages` |
| `/src/lib/supabase.ts` | `supabaseAdmin` |

## Technical Specifications

### Tag Trigger Implementation

```typescript
// /src/lib/content-translation/triggers/tag-trigger.ts

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

### Barrel Exports Update

```typescript
// /src/lib/content-translation/triggers/index.ts

export { triggerItemTranslation } from './item-trigger';
export { triggerArticleTranslation } from './article-trigger';
export { triggerLinkTranslation } from './link-trigger';
export { triggerTagTranslation } from './tag-trigger';
```

### Usage Examples

#### Basic Usage (Processing Item Tags)
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

#### Batch Tag Processing
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

## Success Validation Checklist

### File Structure
- [ ] `/src/lib/content-translation/triggers/tag-trigger.ts` exists
- [ ] File contains proper module documentation header
- [ ] All imports resolve correctly

### Function Implementation
- [ ] `triggerTagTranslation()` function is exported
- [ ] `isSystemTag()` helper function is implemented
- [ ] `getExistingTagTranslationLanguages()` helper function is implemented
- [ ] `getPendingTagJobLanguages()` helper function is implemented
- [ ] Function accepts `(tagKey: string, sourceLanguage: SupportedLanguage)` parameters
- [ ] Function returns `Promise<QueueTranslationResult>`
- [ ] Console logging follows `TAG_TRIGGER:` prefix pattern

### System Tag Handling
- [ ] System tags are correctly identified via database query
- [ ] System tags return `success: true` with empty `jobIds` and `queuedLanguages`
- [ ] No translation jobs are created for system tags

### Existing Translation Handling
- [ ] Function queries `tag_translations` for existing translations
- [ ] Function queries `translation_jobs` for pending/processing jobs
- [ ] Function only queues translations for languages without coverage
- [ ] Function returns early if all languages are covered

### User Tag Handling
- [ ] User tags are correctly identified (not system tags)
- [ ] User tags have translation jobs created for missing languages
- [ ] Tag key is used as both entity ID and translation source value
- [ ] Uses `contentType: 'tag'` context for translation quality

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

## Notes

### Pattern Alignment
- Follow error handling pattern from `/src/lib/content-translation/triggers/item-trigger.ts`
- Use console logging with `TAG_TRIGGER:` prefix for debugging
- Never throw errors - always return error in result object
- Use JSDoc comments for all public functions

### Tag Translation Specifics

| Aspect | Tags | Items/Articles/Links |
|--------|------|---------------------|
| Entity ID | Tag key (string) | UUID |
| Translatable Fields | 1 (`translated_value`) | 2+ (name, description, etc.) |
| System Pre-seeding | Yes (17 tags × 6 languages) | No |
| Duplicate Check | Required (explicit) | Handled by job queue upsert |

### System vs User Tags

| Tag Type | Identification | Translation Behavior |
|----------|----------------|---------------------|
| System Tags | `is_system_tag = true` in DB | Skip - already seeded |
| User Tags | `is_system_tag = false` or not in DB | Queue translation jobs |

### System Tags List (for reference)
These tags are pre-seeded and will be skipped:
```
kitchen, laundry, bedroom, bathroom, living-room, garage, outdoor, general,
appliance, room-item, instructions, cleaning, troubleshooting, safety,
maintenance, features, info
```

### Future Extensions
- **Task 2.5**: API routes will call this trigger when processing item tags
- **Phase 3**: Job processor will handle tag-specific translation storage
- **Epic 5**: UI may allow viewing/editing tag translations

## Dependencies
- TypeScript 5.x (existing in project)
- `/src/lib/supabase.ts` - Supabase client for database access
- `/src/lib/content-translation/content-translation.ts` - Orchestrator function (Task 1.2)
- `/src/lib/content-translation/content-translation.types.ts` - Type definitions (Task 1.1)
- `/src/lib/job-queue/translation-jobs.types.ts` - `SupportedLanguage` type (Epic 1)
- `/src/lib/translation-service/translation-service.types.ts` - `getOtherLanguages` helper (Epic 1)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Thin wrapper around existing orchestrator functionality
  - Simple database queries for system tag detection and existing translation checks
  - Clear input/output contracts from types
  - Follows established patterns from Task 1.3 entity triggers
  - System tags are clearly defined and pre-seeded
  - Can be tested independently before API integration

## References
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Content Translation Orchestrator: `/src/lib/content-translation/content-translation.ts` (Task 1.2)
- Content Translation Types: `/src/lib/content-translation/content-translation.types.ts` (Task 1.1)
- Entity Triggers Pattern: `/src/lib/content-translation/triggers/item-trigger.ts` (Task 1.3)
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts` (Epic 1)
- System Tags Seed: `/database/seeds/20260117_system_tag_translations.sql`
- System Tags Constant: `/src/components/ItemCreationWorkflow/utils/constants.ts` (AVAILABLE_TAGS)
