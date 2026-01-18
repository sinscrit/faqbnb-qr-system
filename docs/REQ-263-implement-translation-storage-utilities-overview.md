# REQ-263: Implement Translation Storage Utilities - Implementation Overview

**Generated:** 2026-01-18 12:00:00 UTC
**Last Modified:** 2026-01-18 12:00:00 UTC
**Request Reference:** REQ-263 - Implement Translation Storage Utilities
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 1, Task 1.5)
**Status:** Ready for Implementation

---

## 1. Request Summary

Implement dedicated storage utility functions that persist translated content for each entity type (items, articles, links, tags) using UPSERT patterns to handle both new translations and translation updates seamlessly.

**Scope:**
- Create `/src/lib/content-translation/storage/translation-storage.ts`
- Implement `storeItemTranslation(itemId: string, language: string, data: {...})`
- Implement `storeArticleTranslation(articleId: string, language: string, data: {...})`
- Implement `storeLinkTranslation(linkId: string, language: string, data: {...})`
- Implement `storeTagTranslation(tagKey: string, language: string, value: string)`
- All functions use UPSERT pattern to handle inserts and updates
- All functions update timestamp metadata on storage operations

**Out of Scope:**
- Content translation orchestrator (Task 1.2)
- Entity-specific translation triggers (Tasks 1.3, 1.4)
- Translation status utilities (Task 1.6)
- API endpoints for translation management (Phase 4)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Supabase | Latest | `@supabase/supabase-js`, `@supabase/ssr` |

### Relevant Existing Patterns

| Pattern | Location | Usage for REQ-263 |
|---------|----------|-------------------|
| UPSERT operation | `/src/lib/auth.ts:1450` | Pattern for upsert with `.select().single()` |
| Supabase admin client | `/src/lib/supabase.ts` | `supabaseAdmin` for server-side operations |
| Database types | `/src/lib/supabase.ts:12-464` | Database type structure patterns |
| Error handling | Various API routes | Pattern for `{ success, data?, error? }` responses |
| Timestamp handling | Various operations | Pattern for `updated_at: new Date().toISOString()` |

### Existing UPSERT Pattern Reference

From `/src/lib/auth.ts:1450`:
```typescript
const { data, error } = await supabaseAdmin
  .from('admin_users')
  .upsert({
    id: userId,
    email,
    full_name: fullName || null,
    role,
    updated_at: new Date().toISOString(),
  })
  .select()
  .single();
```

### Database Schema Reference (from Epic 1)

The translation tables follow this structure (from REQ-223):

**item_translations:**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key (auto-generated) |
| item_id | UUID | NO | FK to items.id |
| language | VARCHAR(5) | NO | BCP-47 language code |
| name | VARCHAR(255) | NO | Translated item name |
| description | TEXT | YES | Translated description |
| translation_status | VARCHAR(20) | NO | pending/processing/completed/failed/manual |
| translated_at | TIMESTAMPTZ | YES | When translation completed |
| reviewed_by | UUID | YES | FK to users.id for manual review |
| created_at | TIMESTAMPTZ | NO | Record creation |
| updated_at | TIMESTAMPTZ | NO | Record update |

**article_translations:**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key (auto-generated) |
| article_id | UUID | NO | FK to item_articles.id |
| language | VARCHAR(5) | NO | BCP-47 language code |
| title | VARCHAR(255) | NO | Translated title |
| description | TEXT | YES | Translated description |
| translation_status | VARCHAR(20) | NO | pending/processing/completed/failed/manual |
| translated_at | TIMESTAMPTZ | YES | When translation completed |
| reviewed_by | UUID | YES | FK to users.id for manual review |
| created_at | TIMESTAMPTZ | NO | Record creation |
| updated_at | TIMESTAMPTZ | NO | Record update |

**link_translations:**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key (auto-generated) |
| link_id | UUID | NO | FK to item_links.id |
| language | VARCHAR(5) | NO | BCP-47 language code |
| title | VARCHAR(255) | NO | Translated title |
| translation_status | VARCHAR(20) | NO | pending/processing/completed/failed/manual |
| translated_at | TIMESTAMPTZ | YES | When translation completed |
| reviewed_by | UUID | YES | FK to users.id for manual review |
| created_at | TIMESTAMPTZ | NO | Record creation |
| updated_at | TIMESTAMPTZ | NO | Record update |

**tag_translations:**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key (auto-generated) |
| tag_key | VARCHAR(100) | NO | Original tag identifier |
| language | VARCHAR(5) | NO | BCP-47 language code |
| translated_value | VARCHAR(255) | NO | Translated tag value |
| is_system_tag | BOOLEAN | NO | Whether system-defined tag |
| created_at | TIMESTAMPTZ | NO | Record creation |

**Unique Constraints:**
- `item_translations`: UNIQUE(item_id, language)
- `article_translations`: UNIQUE(article_id, language)
- `link_translations`: UNIQUE(link_id, language)
- `tag_translations`: UNIQUE(tag_key, language)

### Dependencies from Previous Tasks

| Component | Location | Status |
|-----------|----------|--------|
| Content translation types | `/src/lib/content-translation/content-translation.types.ts` | **Required** - REQ-259 |
| Module index | `/src/lib/content-translation/index.ts` | **Required** - REQ-259 |
| Translation tables | Database | **Required** - REQ-223 |
| Supabase admin client | `/src/lib/supabase.ts` | **EXISTS** |

---

## 3. Technical Approach

### Storage Directory Structure

```
/src/lib/content-translation/
├── index.ts                         # Module exports
├── content-translation.types.ts     # Types (from REQ-259)
├── content-translation.ts           # Orchestrator (Task 1.2)
├── triggers/                        # Triggers (Tasks 1.3, 1.4)
└── storage/
    ├── translation-storage.ts       # THIS TASK - Storage utilities
    └── translation-status.ts        # Task 1.6 - Status utilities
```

### UPSERT Strategy

The UPSERT pattern handles both:
1. **New translations:** Inserts new record when no translation exists for entity/language combination
2. **Updated translations:** Updates existing record when translation already exists

**Supabase UPSERT Behavior:**
- Uses the unique constraint (e.g., `item_id, language`) to detect conflicts
- On conflict: updates the existing record
- On no conflict: inserts new record
- Returns the upserted record via `.select().single()`

### Function Signatures

```typescript
// Item translation storage
async function storeItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  data: {
    name: string;
    description?: string | null;
    translationStatus?: TranslationStatus;
    reviewedBy?: string;
  }
): Promise<StoreTranslationResult>

// Article translation storage
async function storeArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  data: {
    title: string;
    description?: string | null;
    translationStatus?: TranslationStatus;
    reviewedBy?: string;
  }
): Promise<StoreTranslationResult>

// Link translation storage
async function storeLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  data: {
    title: string;
    translationStatus?: TranslationStatus;
    reviewedBy?: string;
  }
): Promise<StoreTranslationResult>

// Tag translation storage
async function storeTagTranslation(
  tagKey: string,
  language: SupportedLanguage,
  value: string,
  isSystemTag?: boolean
): Promise<StoreTranslationResult>
```

### Return Type Pattern

```typescript
interface StoreTranslationResult {
  success: boolean;
  data?: {
    id: string;
    language: SupportedLanguage;
    translationStatus: TranslationStatus;
    translatedAt: string | null;
    updatedAt: string;
  };
  error?: string;
  errorCode?: ContentTranslationErrorCode;
}
```

---

## 4. Implementation Tasks

### Task 1.5.1: Create storage directory

**Action:** Create storage subdirectory
**Path:** `/src/lib/content-translation/storage/`

**Verification:**
- Directory exists at `/src/lib/content-translation/storage/`

---

### Task 1.5.2: Create translation-storage.ts with helper types

**Action:** Create file with imports, types, and helper functions
**File:** `/src/lib/content-translation/storage/translation-storage.ts`

**Implementation:**

```typescript
/**
 * Translation Storage Utilities
 *
 * Provides functions for persisting translated content to the database
 * using UPSERT patterns to handle both new translations and updates.
 *
 * @module content-translation/storage/translation-storage
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
 * @see REQ-263
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  SupportedLanguage,
  TranslationStatus,
  ContentTranslationErrorCode,
  isSupportedLanguage,
  isTranslationStatus,
} from '../content-translation.types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Result of a translation storage operation
 */
export interface StoreTranslationResult {
  /** Whether storage succeeded */
  success: boolean;
  /** Stored translation data */
  data?: {
    id: string;
    language: SupportedLanguage;
    translationStatus: TranslationStatus;
    translatedAt: string | null;
    updatedAt: string;
  };
  /** Error message if failed */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: ContentTranslationErrorCode;
}

/**
 * Input for storing item translation
 */
export interface ItemTranslationData {
  /** Translated item name */
  name: string;
  /** Translated description (optional) */
  description?: string | null;
  /** Translation status (defaults to 'completed') */
  translationStatus?: TranslationStatus;
  /** User ID who reviewed (for manual translations) */
  reviewedBy?: string;
}

/**
 * Input for storing article translation
 */
export interface ArticleTranslationData {
  /** Translated article title */
  title: string;
  /** Translated description (optional) */
  description?: string | null;
  /** Translation status (defaults to 'completed') */
  translationStatus?: TranslationStatus;
  /** User ID who reviewed (for manual translations) */
  reviewedBy?: string;
}

/**
 * Input for storing link translation
 */
export interface LinkTranslationData {
  /** Translated link title */
  title: string;
  /** Translation status (defaults to 'completed') */
  translationStatus?: TranslationStatus;
  /** User ID who reviewed (for manual translations) */
  reviewedBy?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validates language code
 */
function validateLanguage(language: string): language is SupportedLanguage {
  if (!isSupportedLanguage(language)) {
    return false;
  }
  return true;
}

/**
 * Validates translation status
 */
function validateStatus(status: string | undefined): TranslationStatus {
  if (status && isTranslationStatus(status)) {
    return status;
  }
  return 'completed'; // Default status
}

/**
 * Creates error result
 */
function createErrorResult(
  error: string,
  errorCode: ContentTranslationErrorCode
): StoreTranslationResult {
  return {
    success: false,
    error,
    errorCode,
  };
}

/**
 * Gets current ISO timestamp
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
```

---

### Task 1.5.3: Implement storeItemTranslation function

**Action:** Add item translation storage function
**File:** `/src/lib/content-translation/storage/translation-storage.ts` (append)

**Implementation:**

```typescript
// =============================================================================
// ITEM TRANSLATION STORAGE
// =============================================================================

/**
 * Stores or updates an item translation.
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * The unique constraint (item_id, language) determines whether to insert or update.
 *
 * @param itemId - UUID of the item
 * @param language - Target language code
 * @param data - Translation data including name and optional description
 * @returns Result with stored translation data or error
 *
 * @example
 * ```typescript
 * const result = await storeItemTranslation('item-uuid', 'fr', {
 *   name: 'Machine à café',
 *   description: 'Une machine à café automatique...',
 *   translationStatus: 'completed'
 * });
 *
 * if (result.success) {
 *   console.log('Translation stored:', result.data);
 * }
 * ```
 */
export async function storeItemTranslation(
  itemId: string,
  language: string,
  data: ItemTranslationData
): Promise<StoreTranslationResult> {
  // Validate inputs
  if (!itemId || typeof itemId !== 'string') {
    return createErrorResult(
      'Item ID is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  if (!validateLanguage(language)) {
    return createErrorResult(
      `Invalid language code: ${language}. Supported: en, fr, es, de, nl, it`,
      ContentTranslationErrorCode.INVALID_LANGUAGE
    );
  }

  if (!data.name || typeof data.name !== 'string') {
    return createErrorResult(
      'Translation name is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  const timestamp = getCurrentTimestamp();
  const translationStatus = validateStatus(data.translationStatus);
  const translatedAt = translationStatus === 'completed' || translationStatus === 'manual'
    ? timestamp
    : null;

  try {
    const { data: stored, error } = await supabaseAdmin
      .from('item_translations')
      .upsert(
        {
          item_id: itemId,
          language,
          name: data.name,
          description: data.description ?? null,
          translation_status: translationStatus,
          translated_at: translatedAt,
          reviewed_by: data.reviewedBy ?? null,
          updated_at: timestamp,
        },
        {
          onConflict: 'item_id,language',
        }
      )
      .select('id, language, translation_status, translated_at, updated_at')
      .single();

    if (error) {
      // Check for foreign key violation (item doesn't exist)
      if (error.code === '23503') {
        return createErrorResult(
          `Item not found: ${itemId}`,
          ContentTranslationErrorCode.ENTITY_NOT_FOUND
        );
      }

      // Check for check constraint violation (invalid status/language)
      if (error.code === '23514') {
        return createErrorResult(
          `Database constraint violation: ${error.message}`,
          ContentTranslationErrorCode.VALIDATION_ERROR
        );
      }

      return createErrorResult(
        `Database error: ${error.message}`,
        ContentTranslationErrorCode.STORAGE_ERROR
      );
    }

    return {
      success: true,
      data: {
        id: stored.id,
        language: stored.language as SupportedLanguage,
        translationStatus: stored.translation_status as TranslationStatus,
        translatedAt: stored.translated_at,
        updatedAt: stored.updated_at,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return createErrorResult(
      `Unexpected error storing item translation: ${message}`,
      ContentTranslationErrorCode.STORAGE_ERROR
    );
  }
}
```

---

### Task 1.5.4: Implement storeArticleTranslation function

**Action:** Add article translation storage function
**File:** `/src/lib/content-translation/storage/translation-storage.ts` (append)

**Implementation:**

```typescript
// =============================================================================
// ARTICLE TRANSLATION STORAGE
// =============================================================================

/**
 * Stores or updates an article translation.
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * The unique constraint (article_id, language) determines whether to insert or update.
 *
 * @param articleId - UUID of the article
 * @param language - Target language code
 * @param data - Translation data including title and optional description
 * @returns Result with stored translation data or error
 *
 * @example
 * ```typescript
 * const result = await storeArticleTranslation('article-uuid', 'es', {
 *   title: 'Cómo usar la cafetera',
 *   description: 'Instrucciones paso a paso...',
 *   translationStatus: 'completed'
 * });
 * ```
 */
export async function storeArticleTranslation(
  articleId: string,
  language: string,
  data: ArticleTranslationData
): Promise<StoreTranslationResult> {
  // Validate inputs
  if (!articleId || typeof articleId !== 'string') {
    return createErrorResult(
      'Article ID is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  if (!validateLanguage(language)) {
    return createErrorResult(
      `Invalid language code: ${language}. Supported: en, fr, es, de, nl, it`,
      ContentTranslationErrorCode.INVALID_LANGUAGE
    );
  }

  if (!data.title || typeof data.title !== 'string') {
    return createErrorResult(
      'Translation title is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  const timestamp = getCurrentTimestamp();
  const translationStatus = validateStatus(data.translationStatus);
  const translatedAt = translationStatus === 'completed' || translationStatus === 'manual'
    ? timestamp
    : null;

  try {
    const { data: stored, error } = await supabaseAdmin
      .from('article_translations')
      .upsert(
        {
          article_id: articleId,
          language,
          title: data.title,
          description: data.description ?? null,
          translation_status: translationStatus,
          translated_at: translatedAt,
          reviewed_by: data.reviewedBy ?? null,
          updated_at: timestamp,
        },
        {
          onConflict: 'article_id,language',
        }
      )
      .select('id, language, translation_status, translated_at, updated_at')
      .single();

    if (error) {
      // Check for foreign key violation (article doesn't exist)
      if (error.code === '23503') {
        return createErrorResult(
          `Article not found: ${articleId}`,
          ContentTranslationErrorCode.ENTITY_NOT_FOUND
        );
      }

      // Check for check constraint violation
      if (error.code === '23514') {
        return createErrorResult(
          `Database constraint violation: ${error.message}`,
          ContentTranslationErrorCode.VALIDATION_ERROR
        );
      }

      return createErrorResult(
        `Database error: ${error.message}`,
        ContentTranslationErrorCode.STORAGE_ERROR
      );
    }

    return {
      success: true,
      data: {
        id: stored.id,
        language: stored.language as SupportedLanguage,
        translationStatus: stored.translation_status as TranslationStatus,
        translatedAt: stored.translated_at,
        updatedAt: stored.updated_at,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return createErrorResult(
      `Unexpected error storing article translation: ${message}`,
      ContentTranslationErrorCode.STORAGE_ERROR
    );
  }
}
```

---

### Task 1.5.5: Implement storeLinkTranslation function

**Action:** Add link translation storage function
**File:** `/src/lib/content-translation/storage/translation-storage.ts` (append)

**Implementation:**

```typescript
// =============================================================================
// LINK TRANSLATION STORAGE
// =============================================================================

/**
 * Stores or updates a link translation.
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * The unique constraint (link_id, language) determines whether to insert or update.
 *
 * Note: Only the title field is translated for links. URLs are not translated.
 *
 * @param linkId - UUID of the link
 * @param language - Target language code
 * @param data - Translation data including title
 * @returns Result with stored translation data or error
 *
 * @example
 * ```typescript
 * const result = await storeLinkTranslation('link-uuid', 'de', {
 *   title: 'Bedienungsanleitung Video',
 *   translationStatus: 'completed'
 * });
 * ```
 */
export async function storeLinkTranslation(
  linkId: string,
  language: string,
  data: LinkTranslationData
): Promise<StoreTranslationResult> {
  // Validate inputs
  if (!linkId || typeof linkId !== 'string') {
    return createErrorResult(
      'Link ID is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  if (!validateLanguage(language)) {
    return createErrorResult(
      `Invalid language code: ${language}. Supported: en, fr, es, de, nl, it`,
      ContentTranslationErrorCode.INVALID_LANGUAGE
    );
  }

  if (!data.title || typeof data.title !== 'string') {
    return createErrorResult(
      'Translation title is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  const timestamp = getCurrentTimestamp();
  const translationStatus = validateStatus(data.translationStatus);
  const translatedAt = translationStatus === 'completed' || translationStatus === 'manual'
    ? timestamp
    : null;

  try {
    const { data: stored, error } = await supabaseAdmin
      .from('link_translations')
      .upsert(
        {
          link_id: linkId,
          language,
          title: data.title,
          translation_status: translationStatus,
          translated_at: translatedAt,
          reviewed_by: data.reviewedBy ?? null,
          updated_at: timestamp,
        },
        {
          onConflict: 'link_id,language',
        }
      )
      .select('id, language, translation_status, translated_at, updated_at')
      .single();

    if (error) {
      // Check for foreign key violation (link doesn't exist)
      if (error.code === '23503') {
        return createErrorResult(
          `Link not found: ${linkId}`,
          ContentTranslationErrorCode.ENTITY_NOT_FOUND
        );
      }

      // Check for check constraint violation
      if (error.code === '23514') {
        return createErrorResult(
          `Database constraint violation: ${error.message}`,
          ContentTranslationErrorCode.VALIDATION_ERROR
        );
      }

      return createErrorResult(
        `Database error: ${error.message}`,
        ContentTranslationErrorCode.STORAGE_ERROR
      );
    }

    return {
      success: true,
      data: {
        id: stored.id,
        language: stored.language as SupportedLanguage,
        translationStatus: stored.translation_status as TranslationStatus,
        translatedAt: stored.translated_at,
        updatedAt: stored.updated_at,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return createErrorResult(
      `Unexpected error storing link translation: ${message}`,
      ContentTranslationErrorCode.STORAGE_ERROR
    );
  }
}
```

---

### Task 1.5.6: Implement storeTagTranslation function

**Action:** Add tag translation storage function
**File:** `/src/lib/content-translation/storage/translation-storage.ts` (append)

**Implementation:**

```typescript
// =============================================================================
// TAG TRANSLATION STORAGE
// =============================================================================

/**
 * Stores or updates a tag translation.
 *
 * Uses UPSERT pattern to handle both new translations and updates.
 * The unique constraint (tag_key, language) determines whether to insert or update.
 *
 * @param tagKey - Original tag identifier (e.g., 'kitchen', '#room.bedroom')
 * @param language - Target language code
 * @param value - Translated tag value
 * @param isSystemTag - Whether this is a system-defined tag (default: false)
 * @returns Result with stored translation data or error
 *
 * @example
 * ```typescript
 * // Store user-created tag translation
 * const result = await storeTagTranslation('coffee maker', 'fr', 'machine à café');
 *
 * // Store system tag translation
 * const result = await storeTagTranslation('#room.kitchen', 'es', 'Cocina', true);
 * ```
 */
export async function storeTagTranslation(
  tagKey: string,
  language: string,
  value: string,
  isSystemTag: boolean = false
): Promise<StoreTranslationResult> {
  // Validate inputs
  if (!tagKey || typeof tagKey !== 'string') {
    return createErrorResult(
      'Tag key is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  if (!validateLanguage(language)) {
    return createErrorResult(
      `Invalid language code: ${language}. Supported: en, fr, es, de, nl, it`,
      ContentTranslationErrorCode.INVALID_LANGUAGE
    );
  }

  if (!value || typeof value !== 'string') {
    return createErrorResult(
      'Translated value is required',
      ContentTranslationErrorCode.VALIDATION_ERROR
    );
  }

  const timestamp = getCurrentTimestamp();

  try {
    // Note: tag_translations table doesn't have updated_at column
    // It only has created_at, so we use insert with onConflict update
    const { data: stored, error } = await supabaseAdmin
      .from('tag_translations')
      .upsert(
        {
          tag_key: tagKey,
          language,
          translated_value: value,
          is_system_tag: isSystemTag,
        },
        {
          onConflict: 'tag_key,language',
        }
      )
      .select('id, language, created_at')
      .single();

    if (error) {
      // Check for check constraint violation
      if (error.code === '23514') {
        return createErrorResult(
          `Database constraint violation: ${error.message}`,
          ContentTranslationErrorCode.VALIDATION_ERROR
        );
      }

      return createErrorResult(
        `Database error: ${error.message}`,
        ContentTranslationErrorCode.STORAGE_ERROR
      );
    }

    // Tag translations don't have full translation status tracking
    // They are considered 'completed' once stored
    return {
      success: true,
      data: {
        id: stored.id,
        language: stored.language as SupportedLanguage,
        translationStatus: 'completed' as TranslationStatus,
        translatedAt: timestamp,
        updatedAt: stored.created_at, // Use created_at as there's no updated_at
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return createErrorResult(
      `Unexpected error storing tag translation: ${message}`,
      ContentTranslationErrorCode.STORAGE_ERROR
    );
  }
}
```

---

### Task 1.5.7: Add batch storage helper functions

**Action:** Add batch storage utilities for efficiency
**File:** `/src/lib/content-translation/storage/translation-storage.ts` (append)

**Implementation:**

```typescript
// =============================================================================
// BATCH STORAGE UTILITIES
// =============================================================================

/**
 * Batch result for multiple storage operations
 */
export interface BatchStoreResult {
  success: boolean;
  stored: number;
  failed: number;
  results: StoreTranslationResult[];
  errors?: Array<{
    index: number;
    error: string;
    errorCode?: ContentTranslationErrorCode;
  }>;
}

/**
 * Stores multiple item translations in batch.
 *
 * Processes each translation individually to maintain error isolation.
 * All successful translations are stored, and failures are reported.
 *
 * @param itemId - UUID of the item
 * @param translations - Array of language/data pairs
 * @returns Batch result with individual outcomes
 */
export async function batchStoreItemTranslations(
  itemId: string,
  translations: Array<{
    language: SupportedLanguage;
    data: ItemTranslationData;
  }>
): Promise<BatchStoreResult> {
  const results: StoreTranslationResult[] = [];
  const errors: BatchStoreResult['errors'] = [];

  for (let i = 0; i < translations.length; i++) {
    const { language, data } = translations[i];
    const result = await storeItemTranslation(itemId, language, data);
    results.push(result);

    if (!result.success) {
      errors.push({
        index: i,
        error: result.error || 'Unknown error',
        errorCode: result.errorCode,
      });
    }
  }

  const stored = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: failed === 0,
    stored,
    failed,
    results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Stores multiple article translations in batch.
 *
 * @param articleId - UUID of the article
 * @param translations - Array of language/data pairs
 * @returns Batch result with individual outcomes
 */
export async function batchStoreArticleTranslations(
  articleId: string,
  translations: Array<{
    language: SupportedLanguage;
    data: ArticleTranslationData;
  }>
): Promise<BatchStoreResult> {
  const results: StoreTranslationResult[] = [];
  const errors: BatchStoreResult['errors'] = [];

  for (let i = 0; i < translations.length; i++) {
    const { language, data } = translations[i];
    const result = await storeArticleTranslation(articleId, language, data);
    results.push(result);

    if (!result.success) {
      errors.push({
        index: i,
        error: result.error || 'Unknown error',
        errorCode: result.errorCode,
      });
    }
  }

  const stored = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: failed === 0,
    stored,
    failed,
    results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Stores multiple link translations in batch.
 *
 * @param linkId - UUID of the link
 * @param translations - Array of language/data pairs
 * @returns Batch result with individual outcomes
 */
export async function batchStoreLinkTranslations(
  linkId: string,
  translations: Array<{
    language: SupportedLanguage;
    data: LinkTranslationData;
  }>
): Promise<BatchStoreResult> {
  const results: StoreTranslationResult[] = [];
  const errors: BatchStoreResult['errors'] = [];

  for (let i = 0; i < translations.length; i++) {
    const { language, data } = translations[i];
    const result = await storeLinkTranslation(linkId, language, data);
    results.push(result);

    if (!result.success) {
      errors.push({
        index: i,
        error: result.error || 'Unknown error',
        errorCode: result.errorCode,
      });
    }
  }

  const stored = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: failed === 0,
    stored,
    failed,
    results,
    errors: errors.length > 0 ? errors : undefined,
  };
}
```

---

### Task 1.5.8: Update module index.ts with storage exports

**Action:** Add storage utility exports to module index
**File:** `/src/lib/content-translation/index.ts` (modify)

**Add the following exports:**

```typescript
// =============================================================================
// STORAGE UTILITY EXPORTS
// =============================================================================

export {
  // Core storage functions
  storeItemTranslation,
  storeArticleTranslation,
  storeLinkTranslation,
  storeTagTranslation,
  // Batch storage functions
  batchStoreItemTranslations,
  batchStoreArticleTranslations,
  batchStoreLinkTranslations,
} from './storage/translation-storage';

export type {
  StoreTranslationResult,
  ItemTranslationData,
  ArticleTranslationData,
  LinkTranslationData,
  BatchStoreResult,
} from './storage/translation-storage';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/storage/` | New storage subdirectory |
| `/src/lib/content-translation/storage/translation-storage.ts` | Translation storage utilities |

### Files to MODIFY

| File Path | Changes |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Add storage utility exports |

### Functions to CREATE

| Function | Location | Description |
|----------|----------|-------------|
| `storeItemTranslation` | `translation-storage.ts` | Store/update item translation |
| `storeArticleTranslation` | `translation-storage.ts` | Store/update article translation |
| `storeLinkTranslation` | `translation-storage.ts` | Store/update link translation |
| `storeTagTranslation` | `translation-storage.ts` | Store/update tag translation |
| `batchStoreItemTranslations` | `translation-storage.ts` | Batch store item translations |
| `batchStoreArticleTranslations` | `translation-storage.ts` | Batch store article translations |
| `batchStoreLinkTranslations` | `translation-storage.ts` | Batch store link translations |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/supabase.ts` | Supabase client reference |
| `/src/lib/auth.ts` | UPSERT pattern reference |
| `/src/lib/content-translation/content-translation.types.ts` | Type imports |
| `/docs/REQ-223-create-migration-file-with-all-translation-tables-detailed.md` | Table schema reference |

---

## 6. Dependencies

### NPM Package Dependencies

None required beyond existing Supabase packages.

### Internal Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| `supabaseAdmin` | `/src/lib/supabase.ts` | **EXISTS** |
| Content translation types | `/src/lib/content-translation/content-translation.types.ts` | **Required** - REQ-259 |
| Translation tables | Database | **Required** - REQ-223 |

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 3.2: Implement item translation processor | Uses `storeItemTranslation` |
| Task 3.3: Implement article translation processor | Uses `storeArticleTranslation` |
| Task 3.4: Implement link translation processor | Uses `storeLinkTranslation` |
| Task 3.5: Implement tag translation processor | Uses `storeTagTranslation` |
| Task 4.3: Manual translation override endpoint | Uses storage functions |

---

## 7. Acceptance Criteria

From REQ-263:

- [ ] A `storeItemTranslation` function accepts item identifier, target language, and translated name and description fields
- [ ] The item storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] A `storeArticleTranslation` function accepts article identifier, target language, and translated title and description fields
- [ ] The article storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] A `storeLinkTranslation` function accepts link identifier, target language, and translated title field
- [ ] The link storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] A `storeTagTranslation` function accepts tag key, target language, and translated value
- [ ] The tag storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] All storage functions handle database constraint violations gracefully and provide meaningful error messages
- [ ] All storage functions update timestamp metadata to track when translations were stored or updated
- [ ] The implementation is located at `/src/lib/content-translation/storage/translation-storage.ts`
- [ ] All storage functions are properly exported and importable by other application modules
- [ ] The storage utilities integrate with the database schema established in Epic 3 foundation tasks

Additional verification:

- [ ] All functions validate input parameters before database operations
- [ ] All functions return consistent `StoreTranslationResult` type
- [ ] Error codes align with `ContentTranslationErrorCode` enum
- [ ] TypeScript compilation passes without errors
- [ ] Functions can be imported: `import { storeItemTranslation } from '@/lib/content-translation'`

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify Dependencies Exist:**
   ```bash
   # Check content-translation module exists
   ls -la src/lib/content-translation/

   # Check types file exists
   cat src/lib/content-translation/content-translation.types.ts | head -20

   # Check supabaseAdmin exists
   grep "supabaseAdmin" src/lib/supabase.ts
   ```

### Post-Implementation Verification

2. **TypeScript Compilation Check:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

3. **Import Test:**
   ```typescript
   // Verify imports work in another file
   import {
     storeItemTranslation,
     storeArticleTranslation,
     storeLinkTranslation,
     storeTagTranslation,
     StoreTranslationResult,
   } from '@/lib/content-translation';
   ```

4. **Build Verification:**
   ```bash
   npm run build
   # Expected: Build completes successfully
   ```

### Manual Integration Testing

5. **Test Item Translation Storage:**
   ```typescript
   // Create test item first, then:
   const result = await storeItemTranslation('test-item-id', 'fr', {
     name: 'Machine à café',
     description: 'Description en français',
     translationStatus: 'completed'
   });
   console.log('Result:', result);
   ```

6. **Test UPSERT Behavior:**
   ```typescript
   // Store initial translation
   await storeItemTranslation('item-id', 'fr', { name: 'V1' });

   // Update same translation (should upsert)
   await storeItemTranslation('item-id', 'fr', { name: 'V2' });

   // Verify only one record exists
   const { count } = await supabaseAdmin
     .from('item_translations')
     .select('*', { count: 'exact' })
     .eq('item_id', 'item-id')
     .eq('language', 'fr');
   console.log('Count should be 1:', count);
   ```

7. **Test Error Handling:**
   ```typescript
   // Test invalid language
   const result1 = await storeItemTranslation('item-id', 'xx', { name: 'Test' });
   console.log('Should fail with INVALID_LANGUAGE:', result1.errorCode);

   // Test non-existent entity
   const result2 = await storeItemTranslation('non-existent-id', 'fr', { name: 'Test' });
   console.log('Should fail with ENTITY_NOT_FOUND:', result2.errorCode);
   ```

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation tables not created (Epic 1 incomplete) | Medium | High | Verify tables exist before implementing; fail gracefully if missing |
| Foreign key violations | Low | Medium | Validate entity exists or handle 23503 error gracefully |
| UPSERT conflict resolution issues | Low | Medium | Use explicit `onConflict` specification |
| TypeScript type mismatches | Low | Low | Align types with REQ-259 definitions |
| Database constraint violations | Low | Low | Handle 23514 errors with meaningful messages |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create storage directory | 1 min |
| Create translation-storage.ts with types | 15 min |
| Implement storeItemTranslation | 15 min |
| Implement storeArticleTranslation | 10 min |
| Implement storeLinkTranslation | 10 min |
| Implement storeTagTranslation | 10 min |
| Implement batch utilities | 15 min |
| Update index.ts exports | 5 min |
| Testing and verification | 15 min |
| **Total** | **~90 min** |

---

## 11. Implementation Commands Summary

```bash
# Step 1: Create storage directory
mkdir -p src/lib/content-translation/storage

# Step 2: Create translation-storage.ts
# (Use content from Tasks 1.5.2-1.5.7)

# Step 3: Update index.ts
# (Add exports from Task 1.5.8)

# Step 4: Verify TypeScript compilation
npx tsc --noEmit

# Step 5: Verify build
npm run build

# Step 6: Verify exports
node -e "console.log(require('./src/lib/content-translation').storeItemTranslation)"
```

---

## 12. Next Steps After Implementation

After completing Task 1.5 (this task):

1. **Task 1.6:** Implement translation status utilities (`/src/lib/content-translation/storage/translation-status.ts`)
2. **Phase 2:** Modify existing content APIs to trigger translations
3. **Phase 3:** Enhance job processor to use storage utilities

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-263
- [Translation Tables Schema](/docs/REQ-223-create-migration-file-with-all-translation-tables-detailed.md) - REQ-223
- [Content Translation Types](/docs/REQ-259-create-content-translation-module-structure-overview.md) - REQ-259
- [Existing UPSERT Pattern](/src/lib/auth.ts) - Line 1450

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.5*
