# Detailed Task Breakdown: REQ-E03-005 - Implement Translation Storage Utilities

**Request ID:** REQ-E03-005
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.5
**Type:** NEW FEATURE
**Size:** M (Medium)
**Created:** 2026-01-19
**Last Modified:** 2026-01-19

---

## Document Purpose

This document provides step-by-step implementation instructions for creating dedicated translation storage utilities. Each task is designed to be completed in approximately 1 story point and includes explicit file paths, code snippets, and verification steps.

---

## Prerequisites

Before starting implementation, verify the following:

1. **Epic 1 Foundation Complete**: Translation tables exist in database
2. **Translation Service Types Available**: `SupportedLanguage`, `TranslationStatus` types defined at `/src/lib/translation-service/translation-service.types.ts`
3. **Database Client Available**: `supabaseAdmin` exported from `/src/lib/supabase.ts`
4. **Job Processor Reference**: Existing UPSERT patterns available at `/src/lib/job-queue/job-processor.ts` (lines 273-386)

---

## Task List

| # | Task | Estimated Size | Dependencies |
|---|------|----------------|--------------|
| 1 | Create storage module directory structure | XS | None |
| 2 | Define TypeScript interfaces for storage operations | S | Task 1 |
| 3 | Implement `storeItemTranslation` function | S | Task 2 |
| 4 | Implement `storeArticleTranslation` function | S | Task 3 |
| 5 | Implement `storeLinkTranslation` function | S | Task 4 |
| 6 | Implement `storeTagTranslation` function | S | Task 5 |
| 7 | Add parameter validation helper | XS | Task 2 |
| 8 | Create barrel exports for storage module | XS | Tasks 3-6 |
| 9 | Update main content-translation module exports | XS | Task 8 |
| 10 | Verify TypeScript compilation | XS | Task 9 |

---

## Task 1: Create Storage Module Directory Structure

**Size:** XS
**File(s):** New directories and files

### Objective
Create the directory structure for the translation storage module within the content-translation folder.

### Implementation Steps

1. **Create the storage directory**
   ```bash
   mkdir -p src/lib/content-translation/storage
   ```

2. **Create empty files to establish structure**
   - Create `/src/lib/content-translation/storage/translation-storage.ts`
   - Create `/src/lib/content-translation/storage/index.ts`

3. **If content-translation module doesn't exist yet, also create:**
   - `/src/lib/content-translation/index.ts`
   - `/src/lib/content-translation/content-translation.types.ts`

### Expected Directory Structure
```
/src/lib/content-translation/
├── index.ts
├── content-translation.types.ts
└── storage/
    ├── translation-storage.ts        # Main storage utilities
    └── index.ts                       # Barrel export
```

### Verification
- [ ] Directory `/src/lib/content-translation/storage/` exists
- [ ] File `translation-storage.ts` is created
- [ ] File `storage/index.ts` is created

---

## Task 2: Define TypeScript Interfaces for Storage Operations

**Size:** S
**File:** `/src/lib/content-translation/storage/translation-storage.ts`

### Objective
Define all TypeScript interfaces needed for storage operations, including result types and input data types.

### Implementation Steps

1. **Add file header and imports**

```typescript
/**
 * Translation Storage Utilities
 * Part of REQ-E03-005: Implement Translation Storage Utilities
 *
 * Provides dedicated storage functions for persisting translated content
 * to the database using an UPSERT pattern for each entity type.
 *
 * @module content-translation/storage/translation-storage
 * @created 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  SupportedLanguage,
  TranslationStatus,
  isSupportedLanguage,
} from '@/lib/translation-service/translation-service.types';
```

2. **Define the result type**

```typescript
// ============================================================================
// Result Types
// ============================================================================

/**
 * Standard result type for all storage operations.
 * Provides consistent success/error handling across storage functions.
 */
export interface TranslationStorageResult {
  /** Whether the storage operation succeeded */
  success: boolean;
  /** The database ID of the upserted translation record */
  translationId?: string;
  /** Error message if operation failed */
  error?: string;
}
```

3. **Define input data types for each entity**

```typescript
// ============================================================================
// Input Data Types
// ============================================================================

/**
 * Data structure for storing item translations.
 * Used with storeItemTranslation function.
 */
export interface ItemTranslationData {
  /** Translated item name (required) */
  name: string;
  /** Translated item description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

/**
 * Data structure for storing article translations.
 * Used with storeArticleTranslation function.
 */
export interface ArticleTranslationData {
  /** Translated article title (required) */
  title: string;
  /** Translated article description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** User ID who reviewed/created manual translation (optional) */
  reviewedBy?: string;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

/**
 * Data structure for storing link translations.
 * Used with storeLinkTranslation function.
 */
export interface LinkTranslationData {
  /** Translated link title (required) */
  title: string;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}
```

### Verification
- [ ] All interfaces are defined with proper JSDoc comments
- [ ] TypeScript compiles without errors for the type definitions
- [ ] `SupportedLanguage` and `TranslationStatus` imports work correctly

---

## Task 3: Implement `storeItemTranslation` Function

**Size:** S
**File:** `/src/lib/content-translation/storage/translation-storage.ts`

### Objective
Implement the function to store item translations using the UPSERT pattern from the existing job processor.

### Implementation Steps

1. **Add the function implementation after the type definitions**

```typescript
// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Store item translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 *
 * @param itemId - UUID of the item to translate
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param data - Translation data object containing name and optional description
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
  data: ItemTranslationData
): Promise<TranslationStorageResult> {
  // Validate required parameters
  const validation = validateStorageParams(itemId, language, 'itemId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate required field
  if (!data.name || data.name.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: name is required for item translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('item_translations')
      .upsert(
        {
          item_id: itemId,
          language: language,
          name: data.name,
          description: data.description || null,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'item_id,language',
        }
      )
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
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing item translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

### Key Implementation Details

| Aspect | Implementation |
|--------|----------------|
| Conflict resolution | `onConflict: 'item_id,language'` |
| Default status | `'completed'` if not specified |
| Timestamp handling | Uses `translated_at` and `updated_at` |
| Error handling | Try-catch with typed error response |
| Logging prefix | `[TranslationStorage]` for consistency |

### Verification
- [ ] Function compiles without TypeScript errors
- [ ] Function handles missing itemId with appropriate error
- [ ] Function handles missing language with appropriate error
- [ ] Function handles missing name with appropriate error

---

## Task 4: Implement `storeArticleTranslation` Function

**Size:** S
**File:** `/src/lib/content-translation/storage/translation-storage.ts`

### Objective
Implement the function to store article translations, including support for the `reviewed_by` field for manual translations.

### Implementation Steps

1. **Add the function implementation**

```typescript
/**
 * Store article translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 *
 * @param articleId - UUID of the article to translate
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param data - Translation data object containing title and optional description
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeArticleTranslation(
 *   'article-uuid-456',
 *   'es',
 *   {
 *     title: 'Cómo usar la cafetera',
 *     description: 'Instrucciones paso a paso',
 *     status: 'manual',
 *     reviewedBy: 'user-uuid-789'
 *   }
 * );
 * ```
 */
export async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  data: ArticleTranslationData
): Promise<TranslationStorageResult> {
  // Validate required parameters
  const validation = validateStorageParams(articleId, language, 'articleId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate required field
  if (!data.title || data.title.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: title is required for article translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('article_translations')
      .upsert(
        {
          article_id: articleId,
          language: language,
          title: data.title,
          description: data.description || null,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
          reviewed_by: data.reviewedBy || null,
        },
        {
          onConflict: 'article_id,language',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store article translation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing article translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

### Key Differences from Item Storage

| Aspect | Article Translation |
|--------|---------------------|
| Primary field | `title` (not `name`) |
| Additional field | `reviewed_by` for manual translations |
| Conflict columns | `article_id,language` |

### Verification
- [ ] Function compiles without TypeScript errors
- [ ] Function handles missing articleId with appropriate error
- [ ] Function handles missing title with appropriate error
- [ ] Function correctly stores `reviewed_by` for manual translations

---

## Task 5: Implement `storeLinkTranslation` Function

**Size:** S
**File:** `/src/lib/content-translation/storage/translation-storage.ts`

### Objective
Implement the function to store link translations. Links only have a title field (URLs are not translated).

### Implementation Steps

1. **Add the function implementation**

```typescript
/**
 * Store link translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 * Note: Only the title is translated; URLs remain unchanged.
 *
 * @param linkId - UUID of the link to translate
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param data - Translation data object containing title
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * const result = await storeLinkTranslation(
 *   'link-uuid-321',
 *   'de',
 *   { title: 'Bedienungsanleitung PDF' }
 * );
 * ```
 */
export async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  data: LinkTranslationData
): Promise<TranslationStorageResult> {
  // Validate required parameters
  const validation = validateStorageParams(linkId, language, 'linkId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate required field
  if (!data.title || data.title.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: title is required for link translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('link_translations')
      .upsert(
        {
          link_id: linkId,
          language: language,
          title: data.title,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'link_id,language',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store link translation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing link translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

### Key Characteristics

| Aspect | Link Translation |
|--------|------------------|
| Fields translated | `title` only |
| No description | Links don't have translated descriptions |
| Conflict columns | `link_id,language` |

### Verification
- [ ] Function compiles without TypeScript errors
- [ ] Function handles missing linkId with appropriate error
- [ ] Function handles missing title with appropriate error

---

## Task 6: Implement `storeTagTranslation` Function

**Size:** S
**File:** `/src/lib/content-translation/storage/translation-storage.ts`

### Objective
Implement the function to store tag translations. Tags use a string key (not UUID) and have simpler fields.

### Implementation Steps

1. **Add the function implementation**

```typescript
/**
 * Store tag translation using UPSERT pattern.
 * Inserts a new translation record or updates existing one if already present.
 * Tags use a string key identifier rather than UUID.
 *
 * @param tagKey - Tag key identifier (string, not UUID)
 * @param language - Target language code (en, fr, es, de, nl, it)
 * @param value - Translated tag value
 * @param isSystemTag - Whether this is a system-defined tag (default: false)
 * @returns Storage result with success status and translation ID
 *
 * @example
 * ```typescript
 * // User-created tag
 * const result = await storeTagTranslation(
 *   'coffee-maker',
 *   'it',
 *   'macchina del caffè',
 *   false
 * );
 *
 * // System tag (typically seeded during initialization)
 * const systemResult = await storeTagTranslation(
 *   'kitchen',
 *   'fr',
 *   'cuisine',
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
  // Validate required parameters
  if (!tagKey || tagKey.trim() === '') {
    return {
      success: false,
      error: 'Missing required parameter: tagKey is required',
    };
  }

  if (!isSupportedLanguage(language)) {
    return {
      success: false,
      error: `Invalid language code: ${language}. Must be one of: en, fr, es, de, nl, it`,
    };
  }

  // Validate required field
  if (!value || value.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: value is required for tag translation',
    };
  }

  try {
    const { data: result, error } = await supabaseAdmin
      .from('tag_translations')
      .upsert(
        {
          tag_key: tagKey,
          language: language,
          translated_value: value,
          is_system_tag: isSystemTag,
        },
        {
          onConflict: 'tag_key,language',
        }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store tag translation:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      translationId: result?.id,
    };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing tag translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

### Key Differences from Other Storage Functions

| Aspect | Tag Translation |
|--------|-----------------|
| Identifier | `tagKey` (string) not UUID |
| Value field | `translated_value` (single field) |
| Additional field | `is_system_tag` boolean flag |
| No timestamps | Tags don't track `translated_at` |
| Conflict columns | `tag_key,language` |

### Verification
- [ ] Function compiles without TypeScript errors
- [ ] Function handles missing tagKey with appropriate error
- [ ] Function handles missing value with appropriate error
- [ ] Function correctly sets `is_system_tag` flag

---

## Task 7: Add Parameter Validation Helper

**Size:** XS
**File:** `/src/lib/content-translation/storage/translation-storage.ts`

### Objective
Add a reusable internal helper function for validating common storage parameters.

### Implementation Steps

1. **Add the validation helper function (place before the storage functions)**

```typescript
// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Validation result for storage parameters.
 * @internal
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate common storage parameters.
 * Checks that entity ID is non-empty and language is valid.
 *
 * @param entityId - Entity identifier to validate
 * @param language - Language code to validate
 * @param idFieldName - Name of the ID field for error messages
 * @returns Validation result
 * @internal
 */
function validateStorageParams(
  entityId: string,
  language: string,
  idFieldName: string
): ValidationResult {
  // Check entity ID
  if (!entityId || entityId.trim() === '') {
    return {
      valid: false,
      error: `Missing required parameter: ${idFieldName} is required`,
    };
  }

  // Validate UUID format for entity IDs (except tags which use string keys)
  if (idFieldName !== 'tagKey') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(entityId)) {
      return {
        valid: false,
        error: `Invalid ${idFieldName} format: expected UUID`,
      };
    }
  }

  // Check language
  if (!isSupportedLanguage(language)) {
    return {
      valid: false,
      error: `Invalid language code: ${language}. Must be one of: en, fr, es, de, nl, it`,
    };
  }

  return { valid: true };
}
```

### Verification
- [ ] Helper function is placed before storage functions in the file
- [ ] Helper is marked as internal (not exported)
- [ ] Helper validates entity ID and language

---

## Task 8: Create Barrel Exports for Storage Module

**Size:** XS
**File:** `/src/lib/content-translation/storage/index.ts`

### Objective
Create the barrel export file for the storage module to enable clean imports.

### Implementation Steps

1. **Create the barrel export file**

```typescript
/**
 * Translation Storage Module Exports
 * Part of REQ-E03-005: Implement Translation Storage Utilities
 *
 * @module content-translation/storage
 * @created 2026-01-19
 */

// Export all storage functions and types
export {
  // Result type
  TranslationStorageResult,
  // Input data types
  ItemTranslationData,
  ArticleTranslationData,
  LinkTranslationData,
  // Storage functions
  storeItemTranslation,
  storeArticleTranslation,
  storeLinkTranslation,
  storeTagTranslation,
} from './translation-storage';
```

### Usage After Export
```typescript
// Clean import pattern
import {
  storeItemTranslation,
  storeArticleTranslation,
  TranslationStorageResult,
} from '@/lib/content-translation/storage';
```

### Verification
- [ ] File exports all public types
- [ ] File exports all storage functions
- [ ] No internal helpers are exported

---

## Task 9: Update Main Content-Translation Module Exports

**Size:** XS
**File:** `/src/lib/content-translation/index.ts`

### Objective
Update or create the main content-translation module barrel export to include storage functions.

### Implementation Steps

1. **If file doesn't exist, create it:**

```typescript
/**
 * Content Translation Module
 * Part of Epic 3: Dynamic Content Translation
 *
 * Provides infrastructure for translating user-generated content
 * (items, articles, links, tags) across all supported languages.
 *
 * @module content-translation
 * @created 2026-01-19
 */

// Re-export storage utilities
export * from './storage';

// Re-export types (if content-translation.types.ts exists)
// export * from './content-translation.types';
```

2. **If file exists, add the storage export:**

```typescript
// Add to existing exports
export * from './storage';
```

### Final Import Pattern
```typescript
// End users can import from the main module
import {
  storeItemTranslation,
  storeArticleTranslation,
  storeLinkTranslation,
  storeTagTranslation,
  TranslationStorageResult,
  ItemTranslationData,
  ArticleTranslationData,
  LinkTranslationData,
} from '@/lib/content-translation';
```

### Verification
- [ ] Storage exports are included in main module
- [ ] Imports from `@/lib/content-translation` resolve correctly

---

## Task 10: Verify TypeScript Compilation

**Size:** XS
**Files:** All created files

### Objective
Verify that all files compile without TypeScript errors and the module is properly integrated.

### Implementation Steps

1. **Run TypeScript compiler check**
   ```bash
   npx tsc --noEmit
   ```

2. **Verify specific imports work**
   ```bash
   # Create a temporary test file
   echo "import { storeItemTranslation } from '@/lib/content-translation';" > /tmp/test-import.ts
   npx tsc --noEmit /tmp/test-import.ts
   ```

3. **Run the build process**
   ```bash
   npm run build
   ```

### Common Issues and Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Cannot find module '@/lib/supabase' | Path alias not configured | Verify tsconfig.json paths |
| Type 'string' not assignable to 'SupportedLanguage' | Type mismatch | Use type guard or cast |
| Property 'id' does not exist on select result | Supabase typing | Use `.select('id').single()` pattern |

### Verification
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] No type errors in IDE

---

## Complete File: translation-storage.ts

For reference, here is the complete implementation file:

```typescript
/**
 * Translation Storage Utilities
 * Part of REQ-E03-005: Implement Translation Storage Utilities
 *
 * Provides dedicated storage functions for persisting translated content
 * to the database using an UPSERT pattern for each entity type.
 *
 * @module content-translation/storage/translation-storage
 * @created 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  SupportedLanguage,
  TranslationStatus,
  isSupportedLanguage,
} from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Result Types
// ============================================================================

/**
 * Standard result type for all storage operations.
 * Provides consistent success/error handling across storage functions.
 */
export interface TranslationStorageResult {
  /** Whether the storage operation succeeded */
  success: boolean;
  /** The database ID of the upserted translation record */
  translationId?: string;
  /** Error message if operation failed */
  error?: string;
}

// ============================================================================
// Input Data Types
// ============================================================================

/**
 * Data structure for storing item translations.
 */
export interface ItemTranslationData {
  /** Translated item name (required) */
  name: string;
  /** Translated item description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

/**
 * Data structure for storing article translations.
 */
export interface ArticleTranslationData {
  /** Translated article title (required) */
  title: string;
  /** Translated article description (optional) */
  description?: string | null;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** User ID who reviewed/created manual translation (optional) */
  reviewedBy?: string;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

/**
 * Data structure for storing link translations.
 */
export interface LinkTranslationData {
  /** Translated link title (required) */
  title: string;
  /** Translation status - defaults to 'completed' if not specified */
  status?: TranslationStatus;
  /** Source content version timestamp for stale detection (future use) */
  sourceVersionAt?: string;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Validation result for storage parameters.
 * @internal
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate common storage parameters.
 * @internal
 */
function validateStorageParams(
  entityId: string,
  language: string,
  idFieldName: string
): ValidationResult {
  if (!entityId || entityId.trim() === '') {
    return {
      valid: false,
      error: `Missing required parameter: ${idFieldName} is required`,
    };
  }

  if (idFieldName !== 'tagKey') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(entityId)) {
      return {
        valid: false,
        error: `Invalid ${idFieldName} format: expected UUID`,
      };
    }
  }

  if (!isSupportedLanguage(language)) {
    return {
      valid: false,
      error: `Invalid language code: ${language}. Must be one of: en, fr, es, de, nl, it`,
    };
  }

  return { valid: true };
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Store item translation using UPSERT pattern.
 */
export async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  data: ItemTranslationData
): Promise<TranslationStorageResult> {
  const validation = validateStorageParams(itemId, language, 'itemId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!data.name || data.name.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: name is required for item translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('item_translations')
      .upsert(
        {
          item_id: itemId,
          language: language,
          name: data.name,
          description: data.description || null,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
        },
        { onConflict: 'item_id,language' }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store item translation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, translationId: result?.id };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing item translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Store article translation using UPSERT pattern.
 */
export async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  data: ArticleTranslationData
): Promise<TranslationStorageResult> {
  const validation = validateStorageParams(articleId, language, 'articleId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!data.title || data.title.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: title is required for article translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('article_translations')
      .upsert(
        {
          article_id: articleId,
          language: language,
          title: data.title,
          description: data.description || null,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
          reviewed_by: data.reviewedBy || null,
        },
        { onConflict: 'article_id,language' }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store article translation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, translationId: result?.id };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing article translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Store link translation using UPSERT pattern.
 */
export async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  data: LinkTranslationData
): Promise<TranslationStorageResult> {
  const validation = validateStorageParams(linkId, language, 'linkId');
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!data.title || data.title.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: title is required for link translation',
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: result, error } = await supabaseAdmin
      .from('link_translations')
      .upsert(
        {
          link_id: linkId,
          language: language,
          title: data.title,
          translation_status: data.status || 'completed',
          translated_at: now,
          updated_at: now,
        },
        { onConflict: 'link_id,language' }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store link translation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, translationId: result?.id };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing link translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Store tag translation using UPSERT pattern.
 */
export async function storeTagTranslation(
  tagKey: string,
  language: SupportedLanguage,
  value: string,
  isSystemTag: boolean = false
): Promise<TranslationStorageResult> {
  if (!tagKey || tagKey.trim() === '') {
    return {
      success: false,
      error: 'Missing required parameter: tagKey is required',
    };
  }

  if (!isSupportedLanguage(language)) {
    return {
      success: false,
      error: `Invalid language code: ${language}. Must be one of: en, fr, es, de, nl, it`,
    };
  }

  if (!value || value.trim() === '') {
    return {
      success: false,
      error: 'Missing required field: value is required for tag translation',
    };
  }

  try {
    const { data: result, error } = await supabaseAdmin
      .from('tag_translations')
      .upsert(
        {
          tag_key: tagKey,
          language: language,
          translated_value: value,
          is_system_tag: isSystemTag,
        },
        { onConflict: 'tag_key,language' }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[TranslationStorage] Failed to store tag translation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, translationId: result?.id };
  } catch (error) {
    console.error('[TranslationStorage] Exception storing tag translation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

---

## Acceptance Criteria Checklist

| # | Criteria | Task(s) | Verified |
|---|----------|---------|----------|
| 1 | Function exists for storing item translations | Task 3 | [ ] |
| 2 | Item storage performs UPSERT on `(item_id, language)` | Task 3 | [ ] |
| 3 | Item storage persists name and description | Task 3 | [ ] |
| 4 | Function exists for storing article translations | Task 4 | [ ] |
| 5 | Article storage performs UPSERT on `(article_id, language)` | Task 4 | [ ] |
| 6 | Article storage persists title and description | Task 4 | [ ] |
| 7 | Function exists for storing link translations | Task 5 | [ ] |
| 8 | Link storage performs UPSERT on `(link_id, language)` | Task 5 | [ ] |
| 9 | Link storage persists title only | Task 5 | [ ] |
| 10 | Function exists for storing tag translations | Task 6 | [ ] |
| 11 | Tag storage performs UPSERT on `(tag_key, language)` | Task 6 | [ ] |
| 12 | All functions record translation metadata (timestamp, status) | Tasks 3-6 | [ ] |
| 13 | All functions handle database constraint violations | Tasks 3-6 | [ ] |
| 14 | All functions return typed result objects | Task 2 | [ ] |
| 15 | All functions validate required parameters | Task 7 | [ ] |
| 16 | TypeScript types are properly defined | Task 2 | [ ] |
| 17 | Build succeeds with no TypeScript errors | Task 10 | [ ] |

---

## Testing Recommendations

### Unit Test Cases

1. **Success Cases**
   - Store new translation for each entity type
   - Update existing translation (UPSERT behavior)
   - Store with all optional fields populated
   - Store with minimal required fields only

2. **Validation Cases**
   - Empty entity ID returns error
   - Empty language returns error
   - Invalid language code returns error
   - Empty required field (name/title/value) returns error
   - Invalid UUID format returns error (for item/article/link)

3. **Error Cases**
   - Database connection failure
   - Foreign key violation (entity doesn't exist)
   - Timeout handling

### Integration Test Pattern

```typescript
// Example integration test
describe('storeItemTranslation', () => {
  it('should create new translation and return ID', async () => {
    const result = await storeItemTranslation(
      'existing-item-uuid',
      'fr',
      { name: 'Cafetière', description: 'Machine à café' }
    );

    expect(result.success).toBe(true);
    expect(result.translationId).toBeDefined();

    // Verify in database
    const { data } = await supabaseAdmin
      .from('item_translations')
      .select('*')
      .eq('id', result.translationId)
      .single();

    expect(data.name).toBe('Cafetière');
    expect(data.language).toBe('fr');
  });
});
```

---

## Related Documents

- **Overview Document:** `/docs/REQ-E03-005-implement-translation-storage-utilities-overview.md`
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-005)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Reference Implementation:** `/src/lib/job-queue/job-processor.ts` (lines 273-386)
- **Type Definitions:** `/src/lib/translation-service/translation-service.types.ts`

---

## Notes

1. **Relationship to Job Processor**: The existing `saveTranslation` function in job-processor.ts can be refactored to use these storage utilities after implementation, reducing code duplication.

2. **Source Version Tracking**: The `sourceVersionAt` field is included in data types but not currently used in the UPSERT. This prepares for future stale translation detection in Epic 5.

3. **No Deletion Functions**: This module handles storage only. Deletion of translations will be handled by trigger functions or API endpoints in separate tasks.

4. **Logging Convention**: All error logs use the `[TranslationStorage]` prefix for consistency with the codebase pattern.
