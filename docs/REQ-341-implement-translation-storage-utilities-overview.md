# REQ-341: Implement Translation Storage Utilities - Technical Overview

**Created**: 2026-01-19
**Last Modified**: 2026-01-19
**Request Reference**: Epic 3 - Request #341
**Implementation Plan Reference**: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Task 1.5)
**Phase**: 1 - Content Translation Infrastructure
**Task ID**: 1.5
**Size**: M (Medium)

---

## Executive Summary

This task implements a centralized translation storage module providing UPSERT-based persistence utilities for all translatable content types (items, articles, links, tags). The module provides a consistent interface for storing translation results from the job processor while handling both initial translation creation and subsequent updates atomically.

---

## Current State Analysis

### Existing Implementation

The codebase already has a partial implementation of translation storage in the job processor:

**File**: `src/lib/job-queue/job-processor.ts` (Lines 273-387)
- Contains a `saveTranslation()` function that handles UPSERT for all entity types
- Implements switch-case routing based on entity type
- Uses Supabase `.upsert()` with `onConflict` constraint handling

**Current Pattern** (from job-processor.ts):
```typescript
export async function saveTranslation(
  entityType: EntityType,
  entityId: string,
  targetLanguage: SupportedLanguage,
  translatedFields: Record<string, string>
): Promise<boolean>
```

### Gap Analysis

The current implementation is embedded in the job processor. Per the implementation plan (Task 1.5), a dedicated storage module should be created at `/src/lib/content-translation/storage/translation-storage.ts` with:

1. **Entity-specific storage functions** - More explicit function signatures per entity type
2. **Standardized result types** - Consistent return types with detailed error information
3. **Timestamp metadata management** - Explicit handling of `translated_at` and `updated_at`
4. **Export structure** - Properly exported utilities for use by other modules

---

## Technical Approach

### Architecture Decision

Create a new dedicated storage module that:
1. Provides strongly-typed, entity-specific storage functions
2. Uses the established UPSERT pattern from job-processor.ts
3. Returns a standardized `StorageResult` type for consistent error handling
4. Manages timestamp metadata automatically
5. Exports all functions through the content-translation module index

### Module Structure

```
/src/lib/content-translation/
├── index.ts                    # Module exports (MODIFY)
└── storage/
    └── translation-storage.ts  # NEW: Translation storage utilities
```

---

## Database Schema Reference

### item_translations Table
| Column | Type | Notes |
|--------|------|-------|
| id | string | Auto-generated UUID |
| item_id | string | FK to items.id |
| language | string | ISO 639-1 code |
| name | string | Translated item name |
| description | string | null | Translated description |
| translation_status | string | 'completed', 'manual', etc. |
| translated_at | string | null | Timestamp of translation |
| created_at | string | null | Auto-set |
| updated_at | string | null | Modified timestamp |

**Unique Constraint**: `item_id,language`

### article_translations Table
| Column | Type | Notes |
|--------|------|-------|
| id | string | Auto-generated UUID |
| article_id | string | FK to item_articles.id |
| language | string | ISO 639-1 code |
| title | string | Translated title |
| description | string | null | Translated description |
| translation_status | string | 'completed', 'manual', etc. |
| translated_at | string | null | Timestamp of translation |
| reviewed_by | string | null | User ID for manual edits |
| created_at | string | null | Auto-set |
| updated_at | string | null | Modified timestamp |

**Unique Constraint**: `article_id,language`

### link_translations Table
| Column | Type | Notes |
|--------|------|-------|
| id | string | Auto-generated UUID |
| link_id | string | FK to item_links.id |
| language | string | ISO 639-1 code |
| title | string | Translated title |
| translation_status | string | 'completed', 'manual', etc. |
| translated_at | string | null | Timestamp of translation |
| created_at | string | null | Auto-set |
| updated_at | string | null | Modified timestamp |

**Unique Constraint**: `link_id,language`

### tag_translations Table
| Column | Type | Notes |
|--------|------|-------|
| id | string | Auto-generated UUID |
| tag_key | string | Tag identifier/key |
| language | string | ISO 639-1 code |
| translated_value | string | Translated tag text |
| is_system_tag | boolean | null | System vs user tag flag |
| created_at | string | null | Auto-set |

**Unique Constraint**: `tag_key,language`

---

## Interface Contracts

### Storage Result Type

```typescript
/**
 * Result of a translation storage operation
 */
export interface TranslationStorageResult {
  success: boolean;
  /** The stored translation record ID (if successful) */
  translationId?: string;
  /** Whether this was a new insert or an update */
  operation?: 'insert' | 'update';
  /** Error message if operation failed */
  error?: string;
}
```

### Item Translation Storage

```typescript
export interface StoreItemTranslationData {
  name: string;
  description?: string | null;
  translationStatus?: 'completed' | 'manual';
  reviewedBy?: string;
}

/**
 * Store or update an item translation
 * Uses UPSERT on (item_id, language) constraint
 */
export async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  data: StoreItemTranslationData
): Promise<TranslationStorageResult>;
```

### Article Translation Storage

```typescript
export interface StoreArticleTranslationData {
  title: string;
  description?: string | null;
  translationStatus?: 'completed' | 'manual';
  reviewedBy?: string;
}

/**
 * Store or update an article translation
 * Uses UPSERT on (article_id, language) constraint
 */
export async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  data: StoreArticleTranslationData
): Promise<TranslationStorageResult>;
```

### Link Translation Storage

```typescript
export interface StoreLinkTranslationData {
  title: string;
  translationStatus?: 'completed' | 'manual';
}

/**
 * Store or update a link translation
 * Uses UPSERT on (link_id, language) constraint
 */
export async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  data: StoreLinkTranslationData
): Promise<TranslationStorageResult>;
```

### Tag Translation Storage

```typescript
/**
 * Store or update a tag translation
 * Uses UPSERT on (tag_key, language) constraint
 */
export async function storeTagTranslation(
  tagKey: string,
  language: SupportedLanguage,
  value: string,
  isSystemTag?: boolean
): Promise<TranslationStorageResult>;
```

---

## Implementation Details

### UPSERT Pattern

Follow the established pattern from `job-processor.ts`:

```typescript
const { data, error } = await supabaseAdmin
  .from('item_translations')
  .upsert(
    {
      item_id: itemId,
      language: language,
      name: data.name,
      description: data.description || null,
      translation_status: data.translationStatus || 'completed',
      translated_at: now,
      updated_at: now,
    },
    {
      onConflict: 'item_id,language',
    }
  )
  .select('id')
  .single();
```

### Error Handling

Handle specific error scenarios:
1. **PGRST116** - No rows returned (not applicable for upsert)
2. **23503** - Foreign key violation (entity doesn't exist)
3. **23505** - Unique constraint violation (should not occur with upsert)
4. General database errors - Log and return with error message

### Timestamp Management

All storage functions should:
1. Set `translated_at` to current timestamp for new automated translations
2. Set `updated_at` to current timestamp for all operations
3. Preserve `translated_at` when updating with `translationStatus: 'manual'`

---

## Dependencies

### Required Imports
```typescript
import { supabaseAdmin } from '@/lib/supabase';
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
```

### Dependency on Other Tasks
- **Epic 1 (Plan-110)**: Translation tables must exist in database
- **REQ-227**: Translation table TypeScript types in `src/lib/supabase.ts`

### Downstream Dependencies
- **Task 3.1-3.5**: Job processors will use these storage utilities
- **Task 4.3**: Manual translation override endpoint will use these utilities
- **REQ-271**: Enhanced job processor references storage utilities

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/storage/translation-storage.ts` | Translation storage utilities module |

### Files to MODIFY

| File Path | Changes Required |
|-----------|------------------|
| `/src/lib/content-translation/index.ts` | Export storage utilities |

### Functions to IMPLEMENT

| Function | Location | Purpose |
|----------|----------|---------|
| `storeItemTranslation` | translation-storage.ts | UPSERT item translations |
| `storeArticleTranslation` | translation-storage.ts | UPSERT article translations |
| `storeLinkTranslation` | translation-storage.ts | UPSERT link translations |
| `storeTagTranslation` | translation-storage.ts | UPSERT tag translations |

### Types to DEFINE

| Type | Location | Purpose |
|------|----------|---------|
| `TranslationStorageResult` | translation-storage.ts | Standardized result type |
| `StoreItemTranslationData` | translation-storage.ts | Item translation input |
| `StoreArticleTranslationData` | translation-storage.ts | Article translation input |
| `StoreLinkTranslationData` | translation-storage.ts | Link translation input |

---

## Testing Strategy

### Unit Tests

1. **storeItemTranslation**
   - New translation insert succeeds
   - Existing translation update succeeds (upsert)
   - Invalid item_id returns appropriate error
   - Null description handled correctly

2. **storeArticleTranslation**
   - New translation insert succeeds
   - Existing translation update succeeds
   - reviewed_by field preserved for manual status

3. **storeLinkTranslation**
   - Title-only storage works correctly
   - Update replaces existing translation

4. **storeTagTranslation**
   - User tag (is_system_tag: false) stores correctly
   - System tag (is_system_tag: true) stores correctly
   - Duplicate key upserts without error

### Integration Tests

1. Full cycle: Job processor creates translation → storage utility persists → retrieval confirms
2. Concurrent upsert operations resolve without data corruption
3. Foreign key constraints properly enforced

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| storeItemTranslation accepts item identifier, target language, and translated name and description fields | Function signature with typed parameters |
| Item storage function uses UPSERT pattern | Supabase `.upsert()` with `onConflict: 'item_id,language'` |
| storeArticleTranslation accepts article identifier, target language, and translated title and description fields | Function signature with typed parameters |
| Article storage function uses UPSERT pattern | Supabase `.upsert()` with `onConflict: 'article_id,language'` |
| storeLinkTranslation accepts link identifier, target language, and translated title field | Function signature with typed parameters |
| Link storage function uses UPSERT pattern | Supabase `.upsert()` with `onConflict: 'link_id,language'` |
| storeTagTranslation accepts tag key, target language, and translated value | Function signature with typed parameters |
| Tag storage function uses UPSERT pattern | Supabase `.upsert()` with `onConflict: 'tag_key,language'` |
| All storage functions handle database constraint violations gracefully | Error handling with specific error codes |
| All storage functions update timestamp metadata | Automatic `translated_at` and `updated_at` management |
| Implementation is located at /src/lib/content-translation/storage/translation-storage.ts | File location as specified |
| All storage functions are properly exported | Exports via module index |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate code with job-processor.ts | Medium | Low | Consider refactoring job-processor to use new utilities |
| Foreign key constraint errors on invalid IDs | Medium | Medium | Return descriptive errors, don't throw |
| Timestamp inconsistency | Low | Low | Centralize timestamp generation |
| Type mismatches with existing code | Low | Medium | Align types with existing patterns |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` (REQ-341)
- Existing Implementation: `/src/lib/job-queue/job-processor.ts` (Lines 273-387)
- Database Types: `/src/lib/supabase.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
