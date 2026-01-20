# Implementation Overview: REQ-E03-005 - Implement Translation Storage Utilities

**Request ID:** REQ-E03-005
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.5
**Type:** NEW FEATURE
**Size:** M
**Created:** 2026-01-19
**Last Modified:** 2026-01-19

---

## Summary

Implement dedicated storage utilities that persist translated content to the database using an UPSERT pattern. These utilities handle both new translations and updates to existing translations for all four translatable entity types (items, articles, links, and tags).

---

## Background & Context

### Current State

The codebase already has translation storage logic embedded within the job processor at `/src/lib/job-queue/job-processor.ts` (lines 273-386). The `saveTranslation` function handles UPSERT operations for all entity types but is tightly coupled to the job processing workflow.

### Problem Statement

1. Translation storage logic is embedded in the job processor, making it difficult to reuse
2. There is no dedicated storage module in the planned content-translation architecture
3. Other parts of the system (manual overrides, retries, imports) will need to store translations independently
4. No source version tracking exists for detecting stale translations

### Solution Approach

Create a dedicated storage module at `/src/lib/content-translation/storage/translation-storage.ts` with four specialized storage functions that:
- Use the established UPSERT pattern from the existing codebase
- Provide consistent result types for error handling
- Support source version tracking for stale detection
- Can be called from job processors, API endpoints, or batch operations

---

## Technical Design

### Architecture Position

```
/src/lib/content-translation/
├── index.ts                          # Module exports (existing or new)
├── content-translation.types.ts      # Types (existing or new)
└── storage/
    ├── translation-storage.ts        # NEW - This task
    └── translation-status.ts         # Future Task 1.6
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `supabaseAdmin` | `/src/lib/supabase.ts` | Database client with admin privileges |
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Type-safe language codes |
| `TranslationStatus` | `/src/lib/translation-service/translation-service.types.ts` | Status enum |
| Database types | `/src/lib/supabase.ts` | Insert types for translation tables |

### Database Tables (From Epic 1)

| Table | Primary Key | Unique Constraint | Key Fields |
|-------|-------------|-------------------|------------|
| `item_translations` | `id` (UUID) | `(item_id, language)` | name, description, translation_status, translated_at |
| `article_translations` | `id` (UUID) | `(article_id, language)` | title, description, translation_status, translated_at, reviewed_by |
| `link_translations` | `id` (UUID) | `(link_id, language)` | title, translation_status, translated_at |
| `tag_translations` | `id` (UUID) | `(tag_key, language)` | translated_value, is_system_tag |

---

## Interface Contracts

### Result Type

```typescript
/**
 * Standard result type for storage operations
 */
export interface TranslationStorageResult {
  success: boolean;
  /** The ID of the upserted record */
  translationId?: string;
  /** Error message if operation failed */
  error?: string;
}
```

### Input Data Types

```typescript
/**
 * Data structure for item translation storage
 */
export interface ItemTranslationData {
  /** Translated item name (required) */
  name: string;
  /** Translated item description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection */
  sourceVersionAt?: string;
}

/**
 * Data structure for article translation storage
 */
export interface ArticleTranslationData {
  /** Translated article title (required) */
  title: string;
  /** Translated article description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' */
  status?: TranslationStatus;
  /** User ID who reviewed/created manual translation */
  reviewedBy?: string;
  /** Source content version timestamp for stale detection */
  sourceVersionAt?: string;
}

/**
 * Data structure for link translation storage
 */
export interface LinkTranslationData {
  /** Translated link title (required) */
  title: string;
  /** Translation status - defaults to 'completed' */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection */
  sourceVersionAt?: string;
}
```

### Function Signatures

```typescript
/**
 * Store item translation using UPSERT pattern
 * @param itemId - UUID of the item
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param data - Translation data object
 * @returns Storage result with success/error status
 */
export async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  data: ItemTranslationData
): Promise<TranslationStorageResult>;

/**
 * Store article translation using UPSERT pattern
 * @param articleId - UUID of the article
 * @param language - Target language code
 * @param data - Translation data object
 * @returns Storage result with success/error status
 */
export async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  data: ArticleTranslationData
): Promise<TranslationStorageResult>;

/**
 * Store link translation using UPSERT pattern
 * @param linkId - UUID of the link
 * @param language - Target language code
 * @param data - Translation data object
 * @returns Storage result with success/error status
 */
export async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  data: LinkTranslationData
): Promise<TranslationStorageResult>;

/**
 * Store tag translation using UPSERT pattern
 * @param tagKey - Tag key identifier (string, not UUID)
 * @param language - Target language code
 * @param value - Translated tag value
 * @param isSystemTag - Whether this is a system-defined tag (default: false)
 * @returns Storage result with success/error status
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

### UPSERT Pattern (Existing Codebase Pattern)

The codebase uses Supabase's `.upsert()` method with `onConflict` to handle insert-or-update semantics:

```typescript
// Pattern from job-processor.ts lines 308-324
const { error } = await supabaseAdmin
  .from('item_translations')
  .upsert(
    {
      item_id: entityId,
      language: targetLanguage,
      name: translatedFields.name,
      description: translatedFields.description || null,
      translation_status: 'completed',
      translated_at: now,
      updated_at: now,
    },
    {
      onConflict: 'item_id,language',
    }
  );
```

### Conflict Resolution Strategy

| Table | Conflict Columns | Behavior |
|-------|------------------|----------|
| item_translations | `item_id,language` | Update all fields on conflict |
| article_translations | `article_id,language` | Update all fields on conflict |
| link_translations | `link_id,language` | Update all fields on conflict |
| tag_translations | `tag_key,language` | Update translated_value on conflict |

### Validation Requirements

1. **Required Parameters**: Validate itemId/articleId/linkId/tagKey and language are non-empty
2. **Language Validation**: Ensure language is a valid `SupportedLanguage`
3. **Required Fields**: Validate required fields (name for items, title for articles/links, value for tags)
4. **UUID Format**: Validate entity IDs are valid UUIDs (except tagKey which is a string)

### Error Handling Pattern

```typescript
try {
  // Validate parameters
  if (!itemId || !language) {
    return {
      success: false,
      error: 'Missing required parameters: itemId and language are required',
    };
  }

  // Perform UPSERT
  const { data, error } = await supabaseAdmin
    .from('item_translations')
    .upsert({...}, { onConflict: '...' })
    .select('id')
    .single();

  if (error) {
    console.error('[TranslationStorage] Failed to store item translation:', error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    translationId: data.id,
  };
} catch (error) {
  console.error('[TranslationStorage] Exception storing item translation:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}
```

---

## Authorized Files and Functions for Modification

### New Files (CREATE)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/storage/translation-storage.ts` | Main storage utilities module |
| `/src/lib/content-translation/storage/index.ts` | Barrel export for storage submodule |

### Files to Modify (UPDATE)

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/content-translation/index.ts` | Add exports | Export storage functions from main module barrel |
| `/src/lib/content-translation/content-translation.types.ts` | Add types | Add storage-related type definitions if not present |

### Functions to Create

| Function Name | File | Purpose |
|--------------|------|---------|
| `storeItemTranslation` | translation-storage.ts | Store/update item translations |
| `storeArticleTranslation` | translation-storage.ts | Store/update article translations |
| `storeLinkTranslation` | translation-storage.ts | Store/update link translations |
| `storeTagTranslation` | translation-storage.ts | Store/update tag translations |
| `validateStorageParams` | translation-storage.ts | Internal param validation helper |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/job-processor.ts` | Reference for existing UPSERT patterns (lines 273-386) |
| `/src/lib/supabase.ts` | Database client and type definitions |
| `/src/lib/translation-service/translation-service.types.ts` | SupportedLanguage and TranslationStatus types |
| `/database/migrations/20260117_l10n_foundation.sql` | Table schemas for reference |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority |
|---|------|------|----------|
| 1 | Create storage module directory structure | XS | Required |
| 2 | Define TypeScript interfaces for storage data types | S | Required |
| 3 | Implement `storeItemTranslation` function | S | Required |
| 4 | Implement `storeArticleTranslation` function | S | Required |
| 5 | Implement `storeLinkTranslation` function | S | Required |
| 6 | Implement `storeTagTranslation` function | S | Required |
| 7 | Create barrel exports in index.ts files | XS | Required |
| 8 | Add parameter validation helper | XS | Required |
| 9 | Verify TypeScript compilation | XS | Required |

### Implementation Order

1. **Step 1**: Create directory `/src/lib/content-translation/storage/`
2. **Step 2**: Create type definitions in content-translation.types.ts (if module exists) or inline in storage file
3. **Step 3**: Implement `storeItemTranslation` with full validation and error handling
4. **Step 4**: Copy pattern to implement remaining three functions
5. **Step 5**: Create barrel exports
6. **Step 6**: Verify build passes

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Function exists for storing item translations | `storeItemTranslation()` function |
| Item storage function performs UPSERT operation | Uses `onConflict: 'item_id,language'` |
| Item storage function persists name and description | Data object includes both fields |
| Function exists for storing article translations | `storeArticleTranslation()` function |
| Article storage function performs UPSERT operation | Uses `onConflict: 'article_id,language'` |
| Article storage function persists title and description | Data object includes both fields |
| Function exists for storing link translations | `storeLinkTranslation()` function |
| Link storage function performs UPSERT operation | Uses `onConflict: 'link_id,language'` |
| Link storage function persists title translation only | Data object includes title only |
| Function exists for storing tag translations | `storeTagTranslation()` function |
| Tag storage function performs UPSERT operation | Uses `onConflict: 'tag_key,language'` |
| All storage functions record translation metadata | timestamp, status fields populated |
| All storage functions handle database constraint violations | Try-catch with typed errors |
| All storage functions return typed result objects | `TranslationStorageResult` return type |
| All storage functions validate required parameters | Validation before DB operation |
| TypeScript types are properly defined | Full type coverage |

---

## Testing Considerations

### Unit Test Cases

1. **Success Cases**
   - Store new item translation
   - Update existing item translation (UPSERT behavior)
   - Store translation with all optional fields
   - Store translation with minimal required fields

2. **Validation Cases**
   - Missing entity ID returns error
   - Missing language returns error
   - Invalid language code returns error
   - Missing required fields (name/title/value) returns error

3. **Error Cases**
   - Database connection failure
   - Foreign key violation (entity doesn't exist)
   - Permission denied

### Integration Test Cases

1. Create item → store translation → verify retrieval
2. Store translation → update with new values → verify update persisted
3. Store translations for multiple languages → verify all stored

---

## Related Documentation

- **Request Document**: `/docs/gen_requests_epic3.md` (REQ-E03-005)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Epic 1 Foundation Plan**: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Database Migration**: `/database/migrations/20260117_l10n_foundation.sql`
- **Existing Pattern Reference**: `/src/lib/job-queue/job-processor.ts` (lines 273-386)

---

## Notes

1. **Relationship to Job Processor**: After this module is implemented, the job processor's `saveTranslation` function (lines 273-386) could be refactored to use these utilities, reducing code duplication.

2. **Source Version Tracking**: The `sourceVersionAt` field is included in the data types to support future stale translation detection (Epic 5), even though the current database schema may not include this column yet.

3. **No Deletion Functions**: This module handles storage only. Deletion of translations (for content updates) will be handled by trigger functions or API endpoints.

4. **Type Safety**: All functions use `SupportedLanguage` type to ensure only valid language codes are accepted at compile time.
