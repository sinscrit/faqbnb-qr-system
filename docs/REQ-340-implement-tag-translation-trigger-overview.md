# REQ-340: Implement Tag Translation Trigger - Implementation Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.4

---

## 1. Summary

Implement a specialized trigger function for tag translation that distinguishes between system tags (pre-seeded with translations in Epic 1) and user-created custom tags. The trigger checks for existing translations before queuing new jobs and handles both tag types appropriately.

**Key Features:**
- Skip system tags (17 predefined tags already have translations)
- Check for existing translations before queuing
- Handle both system and user tags gracefully
- Support batch translation for multiple tags

---

## 2. Request Reference

From `docs/gen_requests_epic3.md` - REQ-340:

> **Summary:** The system should provide dedicated trigger functions for each content entity type (items, articles, links) to initiate translation workflows based on entity-specific field requirements.
>
> **Expected Behavior:** When content is created or updated, dedicated trigger functions extract the appropriate translatable fields for each entity type and queue them for translation across all supported languages.

---

## 3. Current State

### Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Job Queue Module | `/src/lib/job-queue/` | **Implemented** - `createBatchTranslationJobs()` function |
| Translation Service | `/src/lib/translation-service/` | **Implemented** - `translateText()` function |
| Job Processor | `/src/lib/job-queue/job-processor.ts` | **Implemented** - entity-specific content fetching |
| System Tags Constant | `/src/components/ItemCreationWorkflow/utils/constants.ts` | **Exists** - `AVAILABLE_TAGS` (17 system tags) |
| Content Translation Module | `/src/lib/content-translation/` | **Not yet created** |

### System Tags (Pre-seeded in Epic 1)

From `/src/components/ItemCreationWorkflow/utils/constants.ts` (lines 352-370):

**Room Tags (8):** `kitchen`, `laundry`, `bedroom`, `bathroom`, `living-room`, `garage`, `outdoor`, `general`

**Item Type Tags (2):** `appliance`, `room-item`

**Purpose Tags (7):** `instructions`, `cleaning`, `troubleshooting`, `safety`, `maintenance`, `features`, `info`

**Total: 17 system tags** - These are pre-seeded with translations and must be skipped.

### Database Schema

```sql
-- tag_translations table (created in Epic 1)
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

---

## 4. Expected Behavior

### Tag Translation Decision Flow

```
triggerTagTranslation(tagKey, sourceLanguage)
    │
    ├── 1. Validate inputs (non-empty string, valid language)
    │
    ├── 2. Check if system tag (using AVAILABLE_TAGS constant)
    │       │
    │       ├── YES (is system tag)
    │       │   └── Return: { success: true, skipReason: 'system_tag', jobIds: [] }
    │       │
    │       └── NO (is user tag)
    │           │
    │           ├── 3. Check existing translations in tag_translations
    │           │
    │           ├── All exist → Return: { skipReason: 'translations_exist' }
    │           │
    │           └── Some/none exist → Queue for missing languages
    │
    └── 4. Return QueueTranslationResult with job IDs
```

### Result Scenarios

| Tag Type | Example | Behavior | Result |
|----------|---------|----------|--------|
| System Tag | `kitchen`, `safety` | Skip immediately | `skipReason: 'system_tag'` |
| User Tag (new) | `coffee-maker` | Queue for all 5 target languages | `jobIds: [5 UUIDs]` |
| User Tag (partial) | Some existing translations | Queue only missing languages | `queuedLanguages: [missing]` |
| User Tag (complete) | All translations exist | Skip with info | `skipReason: 'translations_exist'` |

---

## 5. Technical Approach

### 5.1 Architecture

```
/src/lib/content-translation/
├── index.ts                          # Module exports
├── content-translation.types.ts      # TypeScript interfaces
└── triggers/
    ├── item-trigger.ts               # Task 1.3 - Item trigger
    ├── article-trigger.ts            # Task 1.3 - Article trigger
    ├── link-trigger.ts               # Task 1.3 - Link trigger
    └── tag-trigger.ts                # Task 1.4 - Tag trigger (THIS TASK)
```

### 5.2 Function Signatures

```typescript
// Main trigger function
export async function triggerTagTranslation(
  tagKey: string,
  sourceLanguage: SupportedLanguage
): Promise<TagTranslationResult>

// Extended result type
export interface TagTranslationResult extends QueueTranslationResult {
  skipReason?: 'system_tag' | 'translations_exist' | 'no_content';
  existingLanguages?: SupportedLanguage[];
}

// Utility function
export function isSystemTag(tagKey: string): boolean

// Batch function for multiple tags
export async function triggerBatchTagTranslation(
  tagKeys: string[],
  sourceLanguage: SupportedLanguage,
  options?: TriggerTagTranslationOptions
): Promise<TagTranslationResult[]>
```

### 5.3 System Tag Detection Strategy

**Primary Method:** Use `AVAILABLE_TAGS` constant from `/src/components/ItemCreationWorkflow/utils/constants.ts`

```typescript
import { AVAILABLE_TAGS } from '@/components/ItemCreationWorkflow/utils/constants';

export function isSystemTag(tagKey: string): boolean {
  return (AVAILABLE_TAGS as readonly string[]).includes(tagKey);
}
```

**Rationale:** Using constants is faster (no database call) and provides a single source of truth that matches the UI.

### 5.4 Translation Context

Use the `tag` context for optimal translation quality:

```typescript
const TRANSLATION_CONTEXTS = {
  tag: {
    contentType: 'tag' as const,
    domain: 'property_rental_categorization',
    systemPrompt: 'Translate a category tag for household items. Single word or short phrase, suitable for filtering/searching.'
  }
};
```

---

## 6. Ordered Implementation Tasks

### Task 1: Create tag-trigger.ts

**File:** `/src/lib/content-translation/triggers/tag-trigger.ts`

**Steps:**
1. Import dependencies:
   - `supabaseAdmin` from `/src/lib/supabase`
   - `createBatchTranslationJobs` from `/src/lib/job-queue`
   - `AVAILABLE_TAGS` from `/src/components/ItemCreationWorkflow/utils/constants`
   - Types from `../content-translation.types`

2. Implement `isSystemTag(tagKey: string): boolean`
   - Check if tag exists in `AVAILABLE_TAGS` array
   - Return boolean result

3. Implement `getExistingTranslationLanguages()` helper
   - Query `tag_translations` table for existing translations
   - Return array of languages that already have translations

4. Implement `triggerTagTranslation(tagKey, sourceLanguage)`:
   - Validate inputs (non-empty tagKey, valid sourceLanguage)
   - Normalize tagKey to lowercase
   - Check if system tag → return early with `skipReason: 'system_tag'`
   - Check for existing translations
   - If all exist → return early with `skipReason: 'translations_exist'`
   - Call `createBatchTranslationJobs()` for missing languages
   - Return result with job IDs and status

5. Implement `triggerBatchTagTranslation()`:
   - Process array of tag keys sequentially
   - Return array of results

**Estimated Effort:** 30-45 minutes

---

### Task 2: Update index.ts Exports

**File:** `/src/lib/content-translation/index.ts`

**Add exports:**
```typescript
// Task 1.4: Tag translation trigger
export {
  triggerTagTranslation,
  triggerBatchTagTranslation,
  isSystemTag,
} from './triggers/tag-trigger';

export type {
  TagTranslationResult,
  TriggerTagTranslationOptions,
} from './triggers/tag-trigger';
```

**Estimated Effort:** 5 minutes

---

### Task 3: Create Unit Tests

**File:** `/src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts`

**Test Categories:**

1. **isSystemTag tests:**
   - Returns `true` for all 17 system tags
   - Returns `false` for user-created tags
   - Handles edge cases (empty string, case sensitivity)

2. **triggerTagTranslation validation tests:**
   - Rejects empty tag key
   - Rejects invalid source language
   - Handles whitespace-only tag key

3. **System tag handling tests:**
   - Skips all 17 system tags without queuing jobs
   - Returns correct `skipReason: 'system_tag'`
   - Does not create database entries

4. **User tag handling tests:**
   - Queues translations for new user tags
   - Skips languages with existing translations
   - Returns `skipReason: 'translations_exist'` when all exist
   - Handles database errors gracefully

5. **Batch processing tests:**
   - Processes multiple tags correctly
   - Mixed system/user tags handled appropriately

**Estimated Effort:** 45-60 minutes

---

### Task 4: Verify Build and Types

**Steps:**
1. Run TypeScript compilation: `npx tsc --noEmit`
2. Run build: `npm run build`
3. Verify import works: `import { triggerTagTranslation } from '@/lib/content-translation'`

**Estimated Effort:** 10 minutes

---

## 7. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/triggers/tag-trigger.ts` | Tag translation trigger with system tag handling |
| `/src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts` | Unit tests for tag trigger |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `/src/lib/content-translation/index.ts` | Add exports for `triggerTagTranslation`, `triggerBatchTagTranslation`, `isSystemTag`, and related types |

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
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Import `AVAILABLE_TAGS` constant |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` client |
| `/src/lib/job-queue/index.ts` | Import `createBatchTranslationJobs` |
| `/src/lib/content-translation/content-translation.types.ts` | Import types (created in Task 1.1) |

### No Modifications Allowed

- `/src/components/ItemCreationWorkflow/utils/constants.ts` - read-only reference
- `/src/lib/supabase.ts` - use existing client
- Database schema files - Epic 1 responsibility
- API route files - Phase 2 tasks

---

## 8. Dependencies

### Internal Dependencies (Prerequisites)

| Dependency | Source | Required Items |
|------------|--------|----------------|
| Task 1.1 (REQ-338) | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `SupportedLanguage`, `TranslatableField` |
| Task 1.2 (REQ-339) | `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` (optional orchestrator) |
| Epic 1 | `/src/lib/job-queue/` | `createBatchTranslationJobs` |
| Constants | `/src/components/ItemCreationWorkflow/utils/constants.ts` | `AVAILABLE_TAGS` |

### Database Dependencies

Tables required (from Epic 1):
- `tag_translations` - stores translated tag values
- `translation_jobs` - stores queued translation jobs

### NPM Dependencies

None required - uses only existing project dependencies.

### Downstream Dependencies (Blocked by this task)

| Task | Dependency |
|------|------------|
| Task 2.5 | Add tag translation on item save (uses `triggerTagTranslation`) |
| Task 3.5 | Tag translation processor (processes jobs created by tag trigger) |

---

## 9. Acceptance Criteria

From REQ-340 and Plan-111:

- [ ] A `triggerTagTranslation` function accepts tag identifier and source language parameters
- [ ] The function determines whether the tag is a system tag using `AVAILABLE_TAGS` constant
- [ ] System tags return immediately without queuing translation jobs
- [ ] System tags return `skipReason: 'system_tag'` in the result
- [ ] User-created tags are checked against existing translations before queuing
- [ ] Translation jobs are only queued when translations do not already exist
- [ ] The function returns `QueueTranslationResult` indicating skip reason or newly queued jobs
- [ ] The result includes job tracking identifiers for newly queued translation jobs
- [ ] The function handles database errors gracefully with meaningful error messages
- [ ] The `isSystemTag` utility function is exported and correctly identifies all 17 system tags
- [ ] The `triggerBatchTagTranslation` function processes multiple tags efficiently
- [ ] TypeScript compilation passes without errors
- [ ] Build succeeds
- [ ] Function can be imported: `import { triggerTagTranslation, isSystemTag } from '@/lib/content-translation'`

---

## 10. Testing Strategy

### Pre-Implementation Verification

```bash
# Verify prerequisites exist
ls -la src/lib/content-translation/
# Expected: index.ts, content-translation.types.ts

ls -la src/components/ItemCreationWorkflow/utils/constants.ts
# Expected: file exists with AVAILABLE_TAGS export

# Verify types compile
npx tsc --noEmit
```

### Post-Implementation Verification

```bash
# File exists
ls -la src/lib/content-translation/triggers/tag-trigger.ts

# TypeScript compilation
npx tsc --noEmit

# Build verification
npm run build

# Run tests
npm test -- --grep "tag-trigger"
```

### Manual Verification Checklist

- [ ] `/src/lib/content-translation/triggers/tag-trigger.ts` file exists
- [ ] `triggerTagTranslation` is exported from module index
- [ ] `isSystemTag` function correctly identifies all 17 system tags
- [ ] System tags return `skipReason: 'system_tag'` without database queries
- [ ] User tags check existing translations before queuing
- [ ] `existingLanguages` field populated correctly for partial translations
- [ ] Error messages are clear and helpful

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AVAILABLE_TAGS import fails | Low | Medium | Document dependency; add fallback error handling |
| tag_translations table doesn't exist | Low | High | Document Epic 1 prerequisite; clear error message |
| Case sensitivity issues | Medium | Low | Normalize tag keys to lowercase |
| Database query performance | Low | Low | Only queries tag_translations, indexed on tag_key |
| Duplicate job creation | Medium | Low | Unique constraint on translation_jobs prevents duplicates |

---

## 12. Estimated Effort Summary

| Task | Estimate |
|------|----------|
| Task 1: Create tag-trigger.ts | 30-45 min |
| Task 2: Update index.ts exports | 5 min |
| Task 3: Create unit tests | 45-60 min |
| Task 4: Verify build and types | 10 min |
| **Total** | **~90-120 min** |

---

## 13. Implementation Commands Summary

```bash
# Step 1: Verify prerequisites
ls -la src/lib/content-translation/
ls -la src/components/ItemCreationWorkflow/utils/constants.ts

# Step 2: Create triggers directory if needed
mkdir -p src/lib/content-translation/triggers

# Step 3: Create tag-trigger.ts (use content from detailed spec)

# Step 4: Update index.ts exports

# Step 5: Verify TypeScript compilation
npx tsc --noEmit

# Step 6: Verify build
npm run build

# Step 7: Run tests
npm test -- --grep "tag-trigger"
```

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md) - Phase 1, Task 1.4
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-340
- [System Tags Constants](/src/components/ItemCreationWorkflow/utils/constants.ts) - `AVAILABLE_TAGS`
- [Job Queue Module](/src/lib/job-queue/index.ts) - `createBatchTranslationJobs`
- [Previous Tag Trigger Doc](/docs/REQ-262-implement-tag-translation-trigger-overview.md) - Related implementation

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.4*
