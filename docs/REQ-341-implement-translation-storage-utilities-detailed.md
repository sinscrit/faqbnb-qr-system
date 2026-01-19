# REQ-341: Implement Translation Storage Utilities - Detailed Task Breakdown

**Created**: 2026-01-19
**Last Modified**: 2026-01-19
**Request Reference**: Epic 3 - Request #341
**Implementation Plan Reference**: Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Task 1.5)
**Overview Document**: REQ-341-implement-translation-storage-utilities-overview.md
**Phase**: 1 - Content Translation Infrastructure
**Task ID**: 1.5
**Size**: M (Medium)
**Estimated Story Points**: 5

---

## Document Purpose

This document provides granular, implementation-ready tasks for REQ-341. Each task is designed to be completed in approximately 1 story point (15-30 minutes of focused work). Tasks are ordered for sequential execution with clear dependencies and verification steps.

---

## Prerequisites

Before starting implementation:

1. **Epic 1 Complete**: Translation tables must exist in database (item_translations, article_translations, link_translations, tag_translations)
2. **REQ-227 Complete**: Translation table TypeScript types exist in `/src/lib/supabase.ts`
3. **Directory Structure**: The `/src/lib/content-translation/` directory should be created (if not exists from Task 1.1)

### Verification Commands
```bash
# Verify translation tables exist (via Supabase MCP or dashboard)
# Check TypeScript types
grep -l "item_translations\|article_translations" src/lib/supabase.ts
```

---

## Summary of Implementation

This task creates a dedicated translation storage module at `/src/lib/content-translation/storage/translation-storage.ts` that provides UPSERT-based persistence utilities for all translatable content types. The module extracts and centralizes the storage logic currently embedded in `job-processor.ts`, providing strongly-typed, entity-specific storage functions with standardized result types.

---

## Task Breakdown

### Task 1.5.1: Create Storage Directory Structure
**Estimated Time**: 5 minutes
**Dependencies**: None

**Description**: Create the storage subdirectory within the content-translation module.

**Implementation Steps**:
1. Create directory `/src/lib/content-translation/storage/`
2. Verify directory creation

**Files to Create**:
- `/src/lib/content-translation/storage/` (directory only)

**Verification**:
```bash
mkdir -p src/lib/content-translation/storage
ls -la src/lib/content-translation/
```

**Acceptance Criteria**:
- [ ] Directory `/src/lib/content-translation/storage/` exists

---

### Task 1.5.2: Define TranslationStorageResult Type
**Estimated Time**: 10 minutes
**Dependencies**: Task 1.5.1

**Description**: Define the standardized result type for all translation storage operations.

**Implementation Steps**:
1. Create file `/src/lib/content-translation/storage/translation-storage.ts`
2. Add file header with request reference and creation date
3. Define `TranslationStorageResult` interface

**Code to Implement**:
```typescript
/**
 * Translation Storage Utilities
 * Part of REQ-341: Implement Translation Storage Utilities
 *
 * Provides UPSERT-based persistence utilities for all translatable
 * content types (items, articles, links, tags).
 *
 * @module content-translation/storage/translation-storage
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// ===========================================================================
// Result Types
// ===========================================================================

/**
 * Result of a translation storage operation
 */
export interface TranslationStorageResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** The stored translation record ID (if successful) */
  translationId?: string;
  /** Whether this was a new insert or an update */
  operation?: 'insert' | 'update';
  /** Error message if operation failed */
  error?: string;
  /** Error code for specific handling (e.g., '23503' for FK violation) */
  errorCode?: string;
}
```

**Files to Create/Modify**:
- CREATE: `/src/lib/content-translation/storage/translation-storage.ts`

**Verification**:
- File compiles without TypeScript errors
- Interface is properly exported

**Acceptance Criteria**:
- [ ] `TranslationStorageResult` interface is defined with all fields
- [ ] File has proper header documentation

---

### Task 1.5.3: Define Input Data Types for Each Entity
**Estimated Time**: 15 minutes
**Dependencies**: Task 1.5.2

**Description**: Define strongly-typed input interfaces for each entity type's translation data.

**Implementation Steps**:
1. Add `StoreItemTranslationData` interface
2. Add `StoreArticleTranslationData` interface
3. Add `StoreLinkTranslationData` interface
4. Add import for `SupportedLanguage` type

**Code to Implement**:
```typescript
import type { SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

// ===========================================================================
// Input Data Types
// ===========================================================================

/**
 * Data for storing an item translation
 */
export interface StoreItemTranslationData {
  /** Translated item name (required) */
  name: string;
  /** Translated item description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' */
  translationStatus?: 'completed' | 'manual';
  /** User ID if manually edited */
  reviewedBy?: string;
}

/**
 * Data for storing an article translation
 */
export interface StoreArticleTranslationData {
  /** Translated article title (required) */
  title: string;
  /** Translated article description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' */
  translationStatus?: 'completed' | 'manual';
  /** User ID if manually edited */
  reviewedBy?: string;
}

/**
 * Data for storing a link translation
 */
export interface StoreLinkTranslationData {
  /** Translated link title (required) */
  title: string;
  /** Translation status - defaults to 'completed' */
  translationStatus?: 'completed' | 'manual';
}
```

**Files to Modify**:
- MODIFY: `/src/lib/content-translation/storage/translation-storage.ts`

**Verification**:
```bash
npx tsc --noEmit src/lib/content-translation/storage/translation-storage.ts
```

**Acceptance Criteria**:
- [ ] `StoreItemTranslationData` interface defined
- [ ] `StoreArticleTranslationData` interface defined
- [ ] `StoreLinkTranslationData` interface defined
- [ ] All interfaces have proper JSDoc comments

---

### Task 1.5.4: Add Supabase Import and Helper Functions
**Estimated Time**: 10 minutes
**Dependencies**: Task 1.5.3

**Description**: Add Supabase admin client import and timestamp helper function.

**Implementation Steps**:
1. Add import for `supabaseAdmin`
2. Create `getCurrentTimestamp()` helper function
3. Create `parsePostgresError()` helper for error code extraction

**Code to Implement**:
```typescript
import { supabaseAdmin } from '@/lib/supabase';

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Get current timestamp in ISO format for database operations
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parse PostgreSQL error codes from Supabase error objects
 *
 * Common codes:
 * - 23503: Foreign key violation (entity doesn't exist)
 * - 23505: Unique constraint violation (shouldn't occur with upsert)
 * - PGRST116: No rows returned
 */
function parsePostgresError(error: unknown): { message: string; code?: string } {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    return {
      message: String(err.message || err.details || 'Unknown database error'),
      code: err.code ? String(err.code) : undefined,
    };
  }
  return { message: String(error) };
}
```

**Files to Modify**:
- MODIFY: `/src/lib/content-translation/storage/translation-storage.ts`

**Verification**:
- File compiles without errors
- Imports resolve correctly

**Acceptance Criteria**:
- [ ] `supabaseAdmin` import added
- [ ] `getCurrentTimestamp()` helper implemented
- [ ] `parsePostgresError()` helper implemented with error code extraction

---

### Task 1.5.5: Implement storeItemTranslation Function
**Estimated Time**: 20 minutes
**Dependencies**: Task 1.5.4

**Description**: Implement the UPSERT-based storage function for item translations.

**Implementation Steps**:
1. Add function signature with proper typing
2. Implement UPSERT logic using Supabase `.upsert()` with `onConflict`
3. Handle timestamp management (translated_at, updated_at)
4. Return standardized `TranslationStorageResult`

**Code to Implement**:
```typescript
// ===========================================================================
// Item Translation Storage
// ===========================================================================

/**
 * Store or update an item translation
 *
 * Uses UPSERT on (item_id, language) constraint to handle both
 * initial translation creation and subsequent updates atomically.
 *
 * @param itemId - The item's UUID
 * @param language - Target language code (ISO 639-1)
 * @param data - Translation data including name and optional description
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeItemTranslation(
 *   'item-uuid-123',
 *   'fr',
 *   { name: 'Cafetière', description: 'Machine à café automatique' }
 * );
 * if (result.success) {
 *   console.log('Stored translation:', result.translationId);
 * }
 * ```
 */
export async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  data: StoreItemTranslationData
): Promise<TranslationStorageResult> {
  const now = getCurrentTimestamp();

  try {
    // Check if translation already exists to determine operation type
    const { data: existing } = await supabaseAdmin
      .from('item_translations')
      .select('id')
      .eq('item_id', itemId)
      .eq('language', language)
      .maybeSingle();

    const operation: 'insert' | 'update' = existing ? 'update' : 'insert';

    // Build upsert payload
    const payload: Record<string, unknown> = {
      item_id: itemId,
      language: language,
      name: data.name,
      description: data.description || null,
      translation_status: data.translationStatus || 'completed',
      updated_at: now,
    };

    // Only set translated_at for automated translations (not manual edits)
    if (data.translationStatus !== 'manual') {
      payload.translated_at = now;
    }

    const { data: result, error } = await supabaseAdmin
      .from('item_translations')
      .upsert(payload, {
        onConflict: 'item_id,language',
      })
      .select('id')
      .single();

    if (error) {
      const parsedError = parsePostgresError(error);
      console.error('[TranslationStorage] Failed to store item translation:', parsedError);
      return {
        success: false,
        error: parsedError.message,
        errorCode: parsedError.code,
      };
    }

    return {
      success: true,
      translationId: result.id,
      operation,
    };
  } catch (error) {
    const parsedError = parsePostgresError(error);
    console.error('[TranslationStorage] Exception storing item translation:', error);
    return {
      success: false,
      error: parsedError.message,
      errorCode: parsedError.code,
    };
  }
}
```

**Files to Modify**:
- MODIFY: `/src/lib/content-translation/storage/translation-storage.ts`

**Verification**:
```bash
npx tsc --noEmit src/lib/content-translation/storage/translation-storage.ts
```

**Acceptance Criteria**:
- [ ] Function accepts itemId, language, and data parameters
- [ ] Uses UPSERT with `onConflict: 'item_id,language'`
- [ ] Sets `translated_at` for automated translations
- [ ] Preserves `translated_at` for manual edits
- [ ] Returns `TranslationStorageResult` with operation type
- [ ] Handles FK violation errors gracefully

---

### Task 1.5.6: Implement storeArticleTranslation Function
**Estimated Time**: 15 minutes
**Dependencies**: Task 1.5.5

**Description**: Implement the UPSERT-based storage function for article translations.

**Implementation Steps**:
1. Add function signature with proper typing
2. Implement UPSERT logic similar to item translations
3. Handle `reviewed_by` field for manual edits

**Code to Implement**:
```typescript
// ===========================================================================
// Article Translation Storage
// ===========================================================================

/**
 * Store or update an article translation
 *
 * Uses UPSERT on (article_id, language) constraint to handle both
 * initial translation creation and subsequent updates atomically.
 *
 * @param articleId - The article's UUID
 * @param language - Target language code (ISO 639-1)
 * @param data - Translation data including title and optional description
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeArticleTranslation(
 *   'article-uuid-123',
 *   'de',
 *   { title: 'Bedienungsanleitung', description: 'Wie man die Kaffeemaschine benutzt' }
 * );
 * ```
 */
export async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  data: StoreArticleTranslationData
): Promise<TranslationStorageResult> {
  const now = getCurrentTimestamp();

  try {
    // Check if translation already exists to determine operation type
    const { data: existing } = await supabaseAdmin
      .from('article_translations')
      .select('id')
      .eq('article_id', articleId)
      .eq('language', language)
      .maybeSingle();

    const operation: 'insert' | 'update' = existing ? 'update' : 'insert';

    // Build upsert payload
    const payload: Record<string, unknown> = {
      article_id: articleId,
      language: language,
      title: data.title,
      description: data.description || null,
      translation_status: data.translationStatus || 'completed',
      updated_at: now,
    };

    // Handle manual edit fields
    if (data.translationStatus === 'manual') {
      payload.reviewed_by = data.reviewedBy || null;
    } else {
      payload.translated_at = now;
    }

    const { data: result, error } = await supabaseAdmin
      .from('article_translations')
      .upsert(payload, {
        onConflict: 'article_id,language',
      })
      .select('id')
      .single();

    if (error) {
      const parsedError = parsePostgresError(error);
      console.error('[TranslationStorage] Failed to store article translation:', parsedError);
      return {
        success: false,
        error: parsedError.message,
        errorCode: parsedError.code,
      };
    }

    return {
      success: true,
      translationId: result.id,
      operation,
    };
  } catch (error) {
    const parsedError = parsePostgresError(error);
    console.error('[TranslationStorage] Exception storing article translation:', error);
    return {
      success: false,
      error: parsedError.message,
      errorCode: parsedError.code,
    };
  }
}
```

**Files to Modify**:
- MODIFY: `/src/lib/content-translation/storage/translation-storage.ts`

**Verification**:
```bash
npx tsc --noEmit src/lib/content-translation/storage/translation-storage.ts
```

**Acceptance Criteria**:
- [ ] Function accepts articleId, language, and data parameters
- [ ] Uses UPSERT with `onConflict: 'article_id,language'`
- [ ] Handles `reviewed_by` field for manual translations
- [ ] Returns standardized result type

---

### Task 1.5.7: Implement storeLinkTranslation Function
**Estimated Time**: 15 minutes
**Dependencies**: Task 1.5.6

**Description**: Implement the UPSERT-based storage function for link translations.

**Implementation Steps**:
1. Add function signature with proper typing
2. Implement UPSERT logic for title-only translation

**Code to Implement**:
```typescript
// ===========================================================================
// Link Translation Storage
// ===========================================================================

/**
 * Store or update a link translation
 *
 * Uses UPSERT on (link_id, language) constraint to handle both
 * initial translation creation and subsequent updates atomically.
 * Note: Only the title is translated; URLs are not modified.
 *
 * @param linkId - The link's UUID
 * @param language - Target language code (ISO 639-1)
 * @param data - Translation data including title
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeLinkTranslation(
 *   'link-uuid-123',
 *   'es',
 *   { title: 'Manual de instrucciones' }
 * );
 * ```
 */
export async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  data: StoreLinkTranslationData
): Promise<TranslationStorageResult> {
  const now = getCurrentTimestamp();

  try {
    // Check if translation already exists to determine operation type
    const { data: existing } = await supabaseAdmin
      .from('link_translations')
      .select('id')
      .eq('link_id', linkId)
      .eq('language', language)
      .maybeSingle();

    const operation: 'insert' | 'update' = existing ? 'update' : 'insert';

    // Build upsert payload
    const payload: Record<string, unknown> = {
      link_id: linkId,
      language: language,
      title: data.title,
      translation_status: data.translationStatus || 'completed',
      updated_at: now,
    };

    // Set translated_at for automated translations
    if (data.translationStatus !== 'manual') {
      payload.translated_at = now;
    }

    const { data: result, error } = await supabaseAdmin
      .from('link_translations')
      .upsert(payload, {
        onConflict: 'link_id,language',
      })
      .select('id')
      .single();

    if (error) {
      const parsedError = parsePostgresError(error);
      console.error('[TranslationStorage] Failed to store link translation:', parsedError);
      return {
        success: false,
        error: parsedError.message,
        errorCode: parsedError.code,
      };
    }

    return {
      success: true,
      translationId: result.id,
      operation,
    };
  } catch (error) {
    const parsedError = parsePostgresError(error);
    console.error('[TranslationStorage] Exception storing link translation:', error);
    return {
      success: false,
      error: parsedError.message,
      errorCode: parsedError.code,
    };
  }
}
```

**Files to Modify**:
- MODIFY: `/src/lib/content-translation/storage/translation-storage.ts`

**Verification**:
```bash
npx tsc --noEmit src/lib/content-translation/storage/translation-storage.ts
```

**Acceptance Criteria**:
- [ ] Function accepts linkId, language, and data parameters
- [ ] Uses UPSERT with `onConflict: 'link_id,language'`
- [ ] Title-only storage works correctly

---

### Task 1.5.8: Implement storeTagTranslation Function
**Estimated Time**: 15 minutes
**Dependencies**: Task 1.5.7

**Description**: Implement the UPSERT-based storage function for tag translations.

**Implementation Steps**:
1. Add function signature using tag_key instead of UUID
2. Handle `is_system_tag` boolean field
3. Note: Tags table doesn't have `updated_at` field based on schema

**Code to Implement**:
```typescript
// ===========================================================================
// Tag Translation Storage
// ===========================================================================

/**
 * Store or update a tag translation
 *
 * Uses UPSERT on (tag_key, language) constraint to handle both
 * initial translation creation and subsequent updates atomically.
 *
 * @param tagKey - The tag identifier/key (e.g., 'coffee_maker')
 * @param language - Target language code (ISO 639-1)
 * @param value - The translated tag text
 * @param isSystemTag - Whether this is a system tag (default: false for user tags)
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * // Store user tag translation
 * const result = await storeTagTranslation(
 *   'coffee_maker',
 *   'fr',
 *   'Machine à café',
 *   false
 * );
 *
 * // Store system tag translation
 * const systemResult = await storeTagTranslation(
 *   '#kitchen',
 *   'de',
 *   'Küche',
 *   true
 * );
 * ```
 */
export async function storeTagTranslation(
  tagKey: string,
  language: SupportedLanguage,
  value: string,
  isSystemTag: boolean = false
): Promise<TranslationStorageResult> {
  try {
    // Check if translation already exists to determine operation type
    const { data: existing } = await supabaseAdmin
      .from('tag_translations')
      .select('id')
      .eq('tag_key', tagKey)
      .eq('language', language)
      .maybeSingle();

    const operation: 'insert' | 'update' = existing ? 'update' : 'insert';

    // Build upsert payload (tag_translations doesn't have updated_at)
    const payload = {
      tag_key: tagKey,
      language: language,
      translated_value: value,
      is_system_tag: isSystemTag,
    };

    const { data: result, error } = await supabaseAdmin
      .from('tag_translations')
      .upsert(payload, {
        onConflict: 'tag_key,language',
      })
      .select('id')
      .single();

    if (error) {
      const parsedError = parsePostgresError(error);
      console.error('[TranslationStorage] Failed to store tag translation:', parsedError);
      return {
        success: false,
        error: parsedError.message,
        errorCode: parsedError.code,
      };
    }

    return {
      success: true,
      translationId: result.id,
      operation,
    };
  } catch (error) {
    const parsedError = parsePostgresError(error);
    console.error('[TranslationStorage] Exception storing tag translation:', error);
    return {
      success: false,
      error: parsedError.message,
      errorCode: parsedError.code,
    };
  }
}
```

**Files to Modify**:
- MODIFY: `/src/lib/content-translation/storage/translation-storage.ts`

**Verification**:
```bash
npx tsc --noEmit src/lib/content-translation/storage/translation-storage.ts
```

**Acceptance Criteria**:
- [ ] Function accepts tagKey, language, value, and isSystemTag parameters
- [ ] Uses UPSERT with `onConflict: 'tag_key,language'`
- [ ] Correctly handles `is_system_tag` boolean field
- [ ] User tag (is_system_tag: false) stores correctly
- [ ] System tag (is_system_tag: true) stores correctly

---

### Task 1.5.9: Create Module Index and Update Exports
**Estimated Time**: 10 minutes
**Dependencies**: Task 1.5.8

**Description**: Create or update the content-translation module index to export storage utilities.

**Implementation Steps**:
1. Create `/src/lib/content-translation/index.ts` if it doesn't exist
2. Export all storage types and functions
3. Ensure proper module structure

**Code to Implement**:
```typescript
/**
 * Content Translation Module
 * Part of Epic 3 - Dynamic Content Translation
 *
 * This module provides utilities for translating user-generated content
 * (items, articles, links, tags) in FAQBNB.
 *
 * @module content-translation
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// ===========================================================================
// Storage Utilities (REQ-341)
// ===========================================================================

export {
  // Result types
  type TranslationStorageResult,

  // Input data types
  type StoreItemTranslationData,
  type StoreArticleTranslationData,
  type StoreLinkTranslationData,

  // Storage functions
  storeItemTranslation,
  storeArticleTranslation,
  storeLinkTranslation,
  storeTagTranslation,
} from './storage/translation-storage';
```

**Files to Create/Modify**:
- CREATE/MODIFY: `/src/lib/content-translation/index.ts`

**Verification**:
```bash
# Verify exports are accessible
npx tsc --noEmit -p . 2>&1 | grep -i "content-translation"
```

**Acceptance Criteria**:
- [ ] Module index file exports all storage types
- [ ] Module index file exports all storage functions
- [ ] Imports from `@/lib/content-translation` resolve correctly

---

### Task 1.5.10: Add Unified storeTranslation Generic Function (Optional Enhancement)
**Estimated Time**: 15 minutes
**Dependencies**: Task 1.5.8

**Description**: Add a generic wrapper function that routes to entity-specific storage based on type.

**Implementation Steps**:
1. Add `EntityType` import
2. Create generic `storeTranslation()` function with type-based routing

**Code to Implement**:
```typescript
import type { EntityType } from '@/lib/job-queue/translation-jobs.types';

// ===========================================================================
// Generic Storage Function
// ===========================================================================

/**
 * Generic storage function that routes to entity-specific implementations
 *
 * Useful for job processor or other code that handles multiple entity types.
 *
 * @param entityType - Type of entity ('item' | 'article' | 'link' | 'tag')
 * @param entityId - The entity's identifier (UUID or tag_key for tags)
 * @param targetLanguage - Target language code
 * @param translatedFields - Record of field names to translated values
 * @returns Storage result
 *
 * @example
 * ```typescript
 * const result = await storeTranslation(
 *   'item',
 *   'item-uuid-123',
 *   'fr',
 *   { name: 'Cafetière', description: 'Machine à café' }
 * );
 * ```
 */
export async function storeTranslation(
  entityType: EntityType,
  entityId: string,
  targetLanguage: SupportedLanguage,
  translatedFields: Record<string, string>
): Promise<TranslationStorageResult> {
  switch (entityType) {
    case 'item':
      return storeItemTranslation(entityId, targetLanguage, {
        name: translatedFields.name,
        description: translatedFields.description || null,
      });

    case 'article':
      return storeArticleTranslation(entityId, targetLanguage, {
        title: translatedFields.title,
        description: translatedFields.description || null,
      });

    case 'link':
      return storeLinkTranslation(entityId, targetLanguage, {
        title: translatedFields.title,
      });

    case 'tag':
      return storeTagTranslation(
        entityId,
        targetLanguage,
        translatedFields.translated_value,
        false // User tags, not system tags
      );

    default:
      return {
        success: false,
        error: `Unknown entity type: ${entityType}`,
      };
  }
}
```

**Files to Modify**:
- MODIFY: `/src/lib/content-translation/storage/translation-storage.ts`
- MODIFY: `/src/lib/content-translation/index.ts` (add export)

**Verification**:
```bash
npx tsc --noEmit src/lib/content-translation/storage/translation-storage.ts
```

**Acceptance Criteria**:
- [ ] Generic function routes correctly to entity-specific functions
- [ ] All entity types are handled
- [ ] Unknown entity types return error result

---

### Task 1.5.11: Build Verification and Type Checking
**Estimated Time**: 10 minutes
**Dependencies**: Task 1.5.10

**Description**: Verify the complete module compiles and all types are correct.

**Implementation Steps**:
1. Run TypeScript compiler on the module
2. Verify no type errors
3. Run build to ensure production compatibility

**Commands to Run**:
```bash
# Type check the specific module
npx tsc --noEmit src/lib/content-translation/storage/translation-storage.ts

# Full project type check
npx tsc --noEmit

# Run build to verify production compatibility
npm run build
```

**Acceptance Criteria**:
- [ ] Module compiles without TypeScript errors
- [ ] Full project builds successfully
- [ ] No type mismatches with existing code

---

### Task 1.5.12: Document Integration with Job Processor (Reference Only)
**Estimated Time**: 10 minutes
**Dependencies**: Task 1.5.11

**Description**: Add JSDoc comments documenting how this module relates to the existing job processor.

**Notes**:
The existing job processor at `/src/lib/job-queue/job-processor.ts` (lines 273-387) contains a `saveTranslation()` function with similar functionality. Per the implementation plan, downstream tasks (3.1-3.5) will refactor the job processor to use these new storage utilities instead of duplicating the logic.

**Files to DOCUMENT** (no code changes):
- `/src/lib/job-queue/job-processor.ts` - Add comment noting future refactor to use storage utilities

**Acceptance Criteria**:
- [ ] Relationship to job processor is documented
- [ ] Future refactoring path is noted in code comments

---

## Complete File Listing

### Files to CREATE

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/lib/content-translation/storage/translation-storage.ts` | Translation storage utilities | 1.5.2-1.5.10 |
| `/src/lib/content-translation/index.ts` | Module exports | 1.5.9 |

### Files to MODIFY

| File Path | Changes | Task |
|-----------|---------|------|
| None required | N/A | N/A |

---

## Testing Checklist

After implementation, verify the following scenarios work correctly:

### Unit Tests (Manual Verification)

1. **storeItemTranslation**
   - [ ] New item translation inserts successfully
   - [ ] Existing item translation updates successfully (upsert)
   - [ ] Invalid item_id returns error with code 23503
   - [ ] Null description is handled correctly
   - [ ] `translated_at` is set for automated translations
   - [ ] `translated_at` is preserved for manual status

2. **storeArticleTranslation**
   - [ ] New article translation inserts successfully
   - [ ] Existing article translation updates successfully
   - [ ] `reviewed_by` field is set for manual status
   - [ ] Invalid article_id returns appropriate error

3. **storeLinkTranslation**
   - [ ] Title-only storage works correctly
   - [ ] Update replaces existing translation
   - [ ] Invalid link_id returns appropriate error

4. **storeTagTranslation**
   - [ ] User tag (is_system_tag: false) stores correctly
   - [ ] System tag (is_system_tag: true) stores correctly
   - [ ] Duplicate key upserts without error

### Integration Tests (Future)

1. Full cycle: Job processor creates translation -> storage utility persists -> retrieval confirms
2. Concurrent upsert operations resolve without data corruption
3. Foreign key constraints properly enforced

---

## Dependencies Summary

### Upstream Dependencies (Required Before Starting)
- Epic 1 translation tables exist in database
- REQ-227: TypeScript types for translation tables in `/src/lib/supabase.ts`
- Job queue types from `/src/lib/job-queue/translation-jobs.types.ts`

### Downstream Dependencies (Tasks That Use This)
- Task 3.1-3.5: Job processors will use these storage utilities
- Task 4.3: Manual translation override endpoint will use these utilities
- REQ-271: Enhanced job processor will import from this module

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Duplicate code with job-processor.ts | Document future refactoring; downstream tasks will consolidate |
| Foreign key constraint errors | Return descriptive errors with error codes, don't throw |
| Timestamp inconsistency | Centralized `getCurrentTimestamp()` helper |
| Type mismatches | Align types with existing patterns in supabase.ts |

---

## References

- Overview Document: `/docs/REQ-341-implement-translation-storage-utilities-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` (REQ-341)
- Existing Implementation Reference: `/src/lib/job-queue/job-processor.ts` (Lines 273-387)
- Database Types: `/src/lib/supabase.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
