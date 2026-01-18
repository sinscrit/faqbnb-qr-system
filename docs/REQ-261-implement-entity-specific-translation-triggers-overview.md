# REQ-261: Implement Entity-Specific Translation Triggers - Implementation Overview

**Generated:** 2026-01-18 16:00:00 UTC
**Last Modified:** 2026-01-18 16:00:00 UTC
**Request Reference:** REQ-261 - Implement Entity-Specific Translation Triggers
**Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 1, Task 1.3)
**Status:** Ready for Implementation

---

## 1. Request Summary

Implement dedicated trigger functions for each content entity type (items, articles, links) that extract translatable fields from the database and initiate translation job creation through the content translation orchestrator. Each trigger function handles entity-specific field extraction and context assignment.

**Scope:**
- Create `/src/lib/content-translation/triggers/item-trigger.ts` - item translation trigger
- Create `/src/lib/content-translation/triggers/article-trigger.ts` - article translation trigger
- Create `/src/lib/content-translation/triggers/link-trigger.ts` - link translation trigger
- Implement `triggerItemTranslation(itemId: string, sourceLanguage: string): Promise<QueueTranslationResult>`
- Implement `triggerArticleTranslation(articleId: string, sourceLanguage: string): Promise<QueueTranslationResult>`
- Implement `triggerLinkTranslation(linkId: string, sourceLanguage: string): Promise<QueueTranslationResult>`
- Extract appropriate translatable fields for each entity type
- Integrate with content translation orchestrator (REQ-260)

**Out of Scope:**
- Type definitions (REQ-259 / Task 1.1)
- Content translation orchestrator (REQ-260 / Task 1.2)
- Tag translation trigger (Task 1.4)
- Translation storage utilities (Task 1.5)
- Translation status utilities (Task 1.6)
- Modifying existing API routes (Phase 2 tasks)

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

| Pattern | Location | Usage for REQ-261 |
|---------|----------|-------------------|
| Admin auth validation | `/src/lib/auth-server.ts` | Pattern for server-side validation |
| Supabase client usage | `/src/lib/supabase.ts` | Database interaction pattern |
| Item fetching | `/src/app/api/admin/items/route.ts` | Pattern for fetching items |
| Article fetching | `/src/app/api/admin/articles/route.ts` | Pattern for fetching articles |
| Link fetching | `/src/app/api/admin/items/[id]/links/route.ts` | Pattern for fetching links |
| Type definitions | `/src/types/index.ts` | Entity type interfaces |

### Database Entity Schema

**Items Table (`items`):**
| Field | Type | Translatable |
|-------|------|--------------|
| id | UUID | No |
| public_id | VARCHAR(50) | No |
| name | VARCHAR(255) | **Yes** |
| description | TEXT | **Yes** |
| property_id | UUID | No |
| created_at | TIMESTAMP | No |
| updated_at | TIMESTAMP | No |

**Articles Table (`item_articles`):**
| Field | Type | Translatable |
|-------|------|--------------|
| id | UUID | No |
| item_id | UUID | No |
| purpose | VARCHAR(100) | No |
| title | VARCHAR(255) | **Yes** |
| description | TEXT | **Yes** |
| display_order | INTEGER | No |
| created_at | TIMESTAMP | No |
| updated_at | TIMESTAMP | No |

**Links Table (`item_links`):**
| Field | Type | Translatable |
|-------|------|--------------|
| id | UUID | No |
| item_id | UUID | No |
| article_id | UUID | No |
| title | VARCHAR(255) | **Yes** |
| link_type | VARCHAR(50) | No |
| url | TEXT | **No** (URLs not translated) |
| thumbnail_url | TEXT | No |
| display_order | INTEGER | No |
| created_at | TIMESTAMP | No |

### Dependencies from Previous Tasks

| Task | Expected Location | Required Components |
|------|-------------------|---------------------|
| REQ-259 (Task 1.1) | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `SupportedLanguage`, `EntityType`, `ContentToTranslate`, `TranslatableField`, `TRANSLATION_CONTEXTS`, `ContentTranslationErrorCode`, `createContentTranslationError`, `isSupportedLanguage` |
| REQ-260 (Task 1.2) | `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations()` |
| Supabase client | `/src/lib/supabase.ts` | `supabaseAdmin` |

---

## 3. Technical Approach

### Trigger Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Entity Trigger Layer                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Item Trigger   │ Article Trigger │      Link Trigger           │
│                 │                 │                             │
│  Fields:        │  Fields:        │  Fields:                    │
│  - name         │  - title        │  - title                    │
│  - description  │  - description  │  (URL excluded)             │
│                 │                 │                             │
│  Context:       │  Context:       │  Context:                   │
│  item_name,     │  article_title, │  link_title                 │
│  item_desc      │  article_desc   │                             │
└────────┬────────┴────────┬────────┴────────────┬────────────────┘
         │                 │                     │
         └─────────────────┼─────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │     Content Translation Orchestrator │
         │     (queueContentTranslations)       │
         │                                      │
         │     - Creates jobs for 5 languages   │
         │     - Returns job IDs and status     │
         └─────────────────────────────────────┘
```

### Trigger Function Flow

```
triggerEntityTranslation(entityId, sourceLanguage)
    │
    ├── 1. Validate inputs
    │       - Verify entityId is non-empty string
    │       - Verify sourceLanguage is supported
    │
    ├── 2. Fetch entity from database
    │       - SELECT required fields
    │       - Handle not found error
    │
    ├── 3. Build ContentToTranslate
    │       - Set entityType
    │       - Set entityId
    │       - Set sourceLanguage
    │       - Build fields array with context
    │
    ├── 4. Call queueContentTranslations()
    │       - Pass content
    │       - Set trigger: 'create' (can be overridden)
    │
    └── 5. Return QueueTranslationResult
            - Job IDs
            - Queued languages
            - Any errors
```

### Error Handling Strategy

1. **Entity Not Found:** Return error result with `ENTITY_NOT_FOUND` code
2. **Invalid Language:** Return error result with `INVALID_LANGUAGE` code
3. **Database Errors:** Wrap and return with meaningful message
4. **Empty Fields:** Handle gracefully - skip empty fields if content is empty
5. **Orchestrator Errors:** Pass through orchestrator result

---

## 4. Implementation Tasks

### Task 1.3.1: Create triggers directory structure

**Action:** Create the triggers directory if it doesn't exist
**Path:** `/src/lib/content-translation/triggers/`

**Verification:**
- Directory exists at `/src/lib/content-translation/triggers/`
- Directory is ready for trigger files

### Task 1.3.2: Implement item-trigger.ts

**Action:** Create the item translation trigger
**File:** `/src/lib/content-translation/triggers/item-trigger.ts`

**Content:**
```typescript
/**
 * Item Translation Trigger
 *
 * Extracts translatable fields from items (name, description)
 * and queues translation jobs through the orchestrator.
 *
 * @module content-translation/triggers/item-trigger
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
  ContentTranslationErrorCode,
  createContentTranslationError,
  isSupportedLanguage,
} from '../content-translation.types';

/**
 * Options for triggering item translation
 */
export interface TriggerItemTranslationOptions {
  /** The UUID of the item to translate */
  itemId: string;
  /** The source language of the item content */
  sourceLanguage: SupportedLanguage;
  /** What triggered this translation (affects priority) */
  trigger?: TranslationTrigger;
  /** Account ID for multi-tenant context */
  accountId?: string;
}

/**
 * Triggers translation for an item's translatable fields (name, description)
 *
 * Fetches the item from the database, extracts the name and description fields,
 * and queues translation jobs for all target languages through the orchestrator.
 *
 * @param itemId - The UUID of the item to translate
 * @param sourceLanguage - The source language of the item content
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * import { triggerItemTranslation } from '@/lib/content-translation';
 *
 * // After creating/updating an item
 * const result = await triggerItemTranslation(
 *   newItem.id,
 *   userPreferredLanguage || 'en'
 * );
 *
 * if (result.success) {
 *   console.log('Translation jobs queued:', result.jobIds);
 * }
 * ```
 */
export async function triggerItemTranslation(
  itemId: string,
  sourceLanguage: string
): Promise<QueueTranslationResult>;

/**
 * Triggers translation with additional options
 *
 * @param options - Translation trigger options
 * @returns Promise resolving to the queue result with job IDs and status
 */
export async function triggerItemTranslation(
  options: TriggerItemTranslationOptions
): Promise<QueueTranslationResult>;

/**
 * Implementation that handles both overloads
 */
export async function triggerItemTranslation(
  itemIdOrOptions: string | TriggerItemTranslationOptions,
  sourceLanguageArg?: string
): Promise<QueueTranslationResult> {
  // Parse arguments based on overload used
  const options: TriggerItemTranslationOptions =
    typeof itemIdOrOptions === 'string'
      ? {
          itemId: itemIdOrOptions,
          sourceLanguage: sourceLanguageArg as SupportedLanguage,
        }
      : itemIdOrOptions;

  const { itemId, sourceLanguage, trigger = 'create', accountId } = options;

  try {
    // Step 1: Validate inputs
    if (!itemId || typeof itemId !== 'string') {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        'Item ID is required and must be a string',
        { entityType: 'item' }
      );
    }

    if (!isSupportedLanguage(sourceLanguage)) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.INVALID_LANGUAGE,
        `Invalid source language: ${sourceLanguage}`,
        { entityType: 'item', entityId: itemId }
      );
    }

    // Step 2: Fetch item from database
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('id, name, description')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.ENTITY_NOT_FOUND,
        `Item not found with ID: ${itemId}`,
        { entityType: 'item', entityId: itemId, details: fetchError }
      );
    }

    // Step 3: Build translatable fields
    const fields: TranslatableField[] = [];

    // Add name field (required)
    if (item.name) {
      fields.push({
        fieldName: 'name',
        value: item.name,
        context: TRANSLATION_CONTEXTS.item_name,
        maxLength: 255,
      });
    }

    // Add description field (optional - may be empty)
    if (item.description) {
      fields.push({
        fieldName: 'description',
        value: item.description,
        context: TRANSLATION_CONTEXTS.item_description,
      });
    }

    // If no fields to translate, return early
    if (fields.length === 0) {
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [],
        error: 'No translatable content found for this item',
      };
    }

    // Step 4: Queue translations through orchestrator
    const result = await queueContentTranslations({
      content: {
        entityType: 'item',
        entityId: item.id,
        sourceLanguage,
        fields,
      },
      trigger,
      accountId,
    });

    return result;
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
    console.error('Unexpected error in triggerItemTranslation:', err);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      skippedLanguages: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
```

### Task 1.3.3: Implement article-trigger.ts

**Action:** Create the article translation trigger
**File:** `/src/lib/content-translation/triggers/article-trigger.ts`

**Content:**
```typescript
/**
 * Article Translation Trigger
 *
 * Extracts translatable fields from articles (title, description)
 * and queues translation jobs through the orchestrator.
 *
 * @module content-translation/triggers/article-trigger
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
  ContentTranslationErrorCode,
  createContentTranslationError,
  isSupportedLanguage,
} from '../content-translation.types';

/**
 * Options for triggering article translation
 */
export interface TriggerArticleTranslationOptions {
  /** The UUID of the article to translate */
  articleId: string;
  /** The source language of the article content */
  sourceLanguage: SupportedLanguage;
  /** What triggered this translation (affects priority) */
  trigger?: TranslationTrigger;
  /** Account ID for multi-tenant context */
  accountId?: string;
}

/**
 * Triggers translation for an article's translatable fields (title, description)
 *
 * Fetches the article from the database, extracts the title and description fields,
 * and queues translation jobs for all target languages through the orchestrator.
 *
 * @param articleId - The UUID of the article to translate
 * @param sourceLanguage - The source language of the article content
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * import { triggerArticleTranslation } from '@/lib/content-translation';
 *
 * // After creating/updating an article
 * const result = await triggerArticleTranslation(
 *   newArticle.id,
 *   userPreferredLanguage || 'en'
 * );
 *
 * if (result.success) {
 *   console.log('Translation jobs queued:', result.jobIds);
 * }
 * ```
 */
export async function triggerArticleTranslation(
  articleId: string,
  sourceLanguage: string
): Promise<QueueTranslationResult>;

/**
 * Triggers translation with additional options
 *
 * @param options - Translation trigger options
 * @returns Promise resolving to the queue result with job IDs and status
 */
export async function triggerArticleTranslation(
  options: TriggerArticleTranslationOptions
): Promise<QueueTranslationResult>;

/**
 * Implementation that handles both overloads
 */
export async function triggerArticleTranslation(
  articleIdOrOptions: string | TriggerArticleTranslationOptions,
  sourceLanguageArg?: string
): Promise<QueueTranslationResult> {
  // Parse arguments based on overload used
  const options: TriggerArticleTranslationOptions =
    typeof articleIdOrOptions === 'string'
      ? {
          articleId: articleIdOrOptions,
          sourceLanguage: sourceLanguageArg as SupportedLanguage,
        }
      : articleIdOrOptions;

  const { articleId, sourceLanguage, trigger = 'create', accountId } = options;

  try {
    // Step 1: Validate inputs
    if (!articleId || typeof articleId !== 'string') {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        'Article ID is required and must be a string',
        { entityType: 'article' }
      );
    }

    if (!isSupportedLanguage(sourceLanguage)) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.INVALID_LANGUAGE,
        `Invalid source language: ${sourceLanguage}`,
        { entityType: 'article', entityId: articleId }
      );
    }

    // Step 2: Fetch article from database
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('item_articles')
      .select('id, title, description')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.ENTITY_NOT_FOUND,
        `Article not found with ID: ${articleId}`,
        { entityType: 'article', entityId: articleId, details: fetchError }
      );
    }

    // Step 3: Build translatable fields
    const fields: TranslatableField[] = [];

    // Add title field (required)
    if (article.title) {
      fields.push({
        fieldName: 'title',
        value: article.title,
        context: TRANSLATION_CONTEXTS.article_title,
        maxLength: 255,
      });
    }

    // Add description field (optional - may be empty)
    if (article.description) {
      fields.push({
        fieldName: 'description',
        value: article.description,
        context: TRANSLATION_CONTEXTS.article_description,
      });
    }

    // If no fields to translate, return early
    if (fields.length === 0) {
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [],
        error: 'No translatable content found for this article',
      };
    }

    // Step 4: Queue translations through orchestrator
    const result = await queueContentTranslations({
      content: {
        entityType: 'article',
        entityId: article.id,
        sourceLanguage,
        fields,
      },
      trigger,
      accountId,
    });

    return result;
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
    console.error('Unexpected error in triggerArticleTranslation:', err);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      skippedLanguages: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
```

### Task 1.3.4: Implement link-trigger.ts

**Action:** Create the link translation trigger
**File:** `/src/lib/content-translation/triggers/link-trigger.ts`

**Content:**
```typescript
/**
 * Link Translation Trigger
 *
 * Extracts the translatable title field from links
 * and queues translation jobs through the orchestrator.
 *
 * Note: URLs are NOT translated - only the title field is translatable.
 *
 * @module content-translation/triggers/link-trigger
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
  ContentTranslationErrorCode,
  createContentTranslationError,
  isSupportedLanguage,
} from '../content-translation.types';

/**
 * Options for triggering link translation
 */
export interface TriggerLinkTranslationOptions {
  /** The UUID of the link to translate */
  linkId: string;
  /** The source language of the link title */
  sourceLanguage: SupportedLanguage;
  /** What triggered this translation (affects priority) */
  trigger?: TranslationTrigger;
  /** Account ID for multi-tenant context */
  accountId?: string;
}

/**
 * Triggers translation for a link's translatable field (title only)
 *
 * Fetches the link from the database, extracts the title field,
 * and queues translation jobs for all target languages through the orchestrator.
 *
 * IMPORTANT: The URL field is explicitly NOT translated - only the title is translatable.
 *
 * @param linkId - The UUID of the link to translate
 * @param sourceLanguage - The source language of the link title
 * @returns Promise resolving to the queue result with job IDs and status
 *
 * @example
 * ```typescript
 * import { triggerLinkTranslation } from '@/lib/content-translation';
 *
 * // After creating/updating a link
 * const result = await triggerLinkTranslation(
 *   newLink.id,
 *   userPreferredLanguage || 'en'
 * );
 *
 * if (result.success) {
 *   console.log('Translation jobs queued:', result.jobIds);
 * }
 * ```
 */
export async function triggerLinkTranslation(
  linkId: string,
  sourceLanguage: string
): Promise<QueueTranslationResult>;

/**
 * Triggers translation with additional options
 *
 * @param options - Translation trigger options
 * @returns Promise resolving to the queue result with job IDs and status
 */
export async function triggerLinkTranslation(
  options: TriggerLinkTranslationOptions
): Promise<QueueTranslationResult>;

/**
 * Implementation that handles both overloads
 */
export async function triggerLinkTranslation(
  linkIdOrOptions: string | TriggerLinkTranslationOptions,
  sourceLanguageArg?: string
): Promise<QueueTranslationResult> {
  // Parse arguments based on overload used
  const options: TriggerLinkTranslationOptions =
    typeof linkIdOrOptions === 'string'
      ? {
          linkId: linkIdOrOptions,
          sourceLanguage: sourceLanguageArg as SupportedLanguage,
        }
      : linkIdOrOptions;

  const { linkId, sourceLanguage, trigger = 'create', accountId } = options;

  try {
    // Step 1: Validate inputs
    if (!linkId || typeof linkId !== 'string') {
      throw createContentTranslationError(
        ContentTranslationErrorCode.VALIDATION_ERROR,
        'Link ID is required and must be a string',
        { entityType: 'link' }
      );
    }

    if (!isSupportedLanguage(sourceLanguage)) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.INVALID_LANGUAGE,
        `Invalid source language: ${sourceLanguage}`,
        { entityType: 'link', entityId: linkId }
      );
    }

    // Step 2: Fetch link from database
    // Note: We only fetch the title field - URL is explicitly NOT translated
    const { data: link, error: fetchError } = await supabaseAdmin
      .from('item_links')
      .select('id, title')
      .eq('id', linkId)
      .single();

    if (fetchError || !link) {
      throw createContentTranslationError(
        ContentTranslationErrorCode.ENTITY_NOT_FOUND,
        `Link not found with ID: ${linkId}`,
        { entityType: 'link', entityId: linkId, details: fetchError }
      );
    }

    // Step 3: Build translatable fields (title only)
    const fields: TranslatableField[] = [];

    // Add title field (required)
    if (link.title) {
      fields.push({
        fieldName: 'title',
        value: link.title,
        context: TRANSLATION_CONTEXTS.link_title,
        maxLength: 255,
      });
    }

    // If no fields to translate, return early
    if (fields.length === 0) {
      return {
        success: true,
        jobIds: [],
        queuedLanguages: [],
        skippedLanguages: [],
        error: 'No translatable content found for this link',
      };
    }

    // Step 4: Queue translations through orchestrator
    const result = await queueContentTranslations({
      content: {
        entityType: 'link',
        entityId: link.id,
        sourceLanguage,
        fields,
      },
      trigger,
      accountId,
    });

    return result;
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
    console.error('Unexpected error in triggerLinkTranslation:', err);
    return {
      success: false,
      jobIds: [],
      queuedLanguages: [],
      skippedLanguages: [],
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
```

### Task 1.3.5: Update index.ts to export trigger functions

**Action:** Add exports for all trigger functions to module index
**File:** `/src/lib/content-translation/index.ts`

**Modification:** Uncomment and add under "Task 1.3-1.4: Translation triggers" section:

```typescript
// Task 1.3: Entity-specific translation triggers
export { triggerItemTranslation } from './triggers/item-trigger';
export type { TriggerItemTranslationOptions } from './triggers/item-trigger';

export { triggerArticleTranslation } from './triggers/article-trigger';
export type { TriggerArticleTranslationOptions } from './triggers/article-trigger';

export { triggerLinkTranslation } from './triggers/link-trigger';
export type { TriggerLinkTranslationOptions } from './triggers/link-trigger';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/content-translation/triggers/` | Triggers directory (if not exists) |
| `/src/lib/content-translation/triggers/item-trigger.ts` | Item translation trigger with `triggerItemTranslation` |
| `/src/lib/content-translation/triggers/article-trigger.ts` | Article translation trigger with `triggerArticleTranslation` |
| `/src/lib/content-translation/triggers/link-trigger.ts` | Link translation trigger with `triggerLinkTranslation` |

### Files to MODIFY

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/content-translation/index.ts` | Export section | Add exports for all trigger functions and their option types |

### Functions to CREATE

| Function Name | File | Purpose |
|---------------|------|---------|
| `triggerItemTranslation` | `item-trigger.ts` | Triggers translation for item name and description |
| `triggerArticleTranslation` | `article-trigger.ts` | Triggers translation for article title and description |
| `triggerLinkTranslation` | `link-trigger.ts` | Triggers translation for link title only |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/content-translation.types.ts` | Import types (created in REQ-259) |
| `/src/lib/content-translation/content-translation.ts` | Import `queueContentTranslations` (created in REQ-260) |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` client |
| `/src/app/api/admin/items/route.ts` | Reference item fetching patterns |
| `/src/app/api/admin/articles/route.ts` | Reference article fetching patterns |
| `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` | Implementation plan reference |

### No Modifications Required

The following files should NOT be modified for this task:
- `/src/lib/content-translation/content-translation.types.ts` (created in REQ-259)
- `/src/lib/content-translation/content-translation.ts` (created in REQ-260)
- `/src/lib/supabase.ts` (use existing supabaseAdmin)
- Any API route files (Phase 2 tasks will modify these)
- Any component files
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
| REQ-259 (Task 1.1) | `/src/lib/content-translation/content-translation.types.ts` | `QueueTranslationResult`, `SupportedLanguage`, `TranslatableField`, `TranslationTrigger`, `TRANSLATION_CONTEXTS`, `ContentTranslationErrorCode`, `createContentTranslationError`, `isSupportedLanguage` |
| REQ-260 (Task 1.2) | `/src/lib/content-translation/content-translation.ts` | `queueContentTranslations` |
| Supabase client | `/src/lib/supabase.ts` | `supabaseAdmin` |

**Prerequisites:** REQ-259 and REQ-260 must be completed before this task can begin.

### Database Dependencies

The following tables must exist:

| Table | Required Fields | Purpose |
|-------|-----------------|---------|
| `items` | id, name, description | Source data for item triggers |
| `item_articles` | id, title, description | Source data for article triggers |
| `item_links` | id, title | Source data for link triggers |
| `translation_jobs` | (all fields) | Target for job creation (via orchestrator) |

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 2.2: Modify Items API | Uses `triggerItemTranslation` on item create/update |
| Task 2.3: Modify Articles API | Uses `triggerArticleTranslation` on article create/update |
| Task 2.4: Modify Links API | Uses `triggerLinkTranslation` on link create/update |
| Task 3.2: Item translation processor | Processes jobs created by item trigger |
| Task 3.3: Article translation processor | Processes jobs created by article trigger |
| Task 3.4: Link translation processor | Processes jobs created by link trigger |

---

## 7. Acceptance Criteria

From REQ-261:

- [x] A `triggerItemTranslation` function accepts item identifier and source language parameters
- [x] The item trigger extracts name and description fields from the specified item
- [x] The item trigger queues translation jobs for the extracted fields and returns job status information
- [x] A `triggerArticleTranslation` function accepts article identifier and source language parameters
- [x] The article trigger extracts title and description fields from the specified article
- [x] The article trigger queues translation jobs for the extracted fields and returns job status information
- [x] A `triggerLinkTranslation` function accepts link identifier and source language parameters
- [x] The link trigger extracts only the title field and explicitly excludes URL fields from translation
- [x] The link trigger queues translation jobs for the title field only and returns job status information
- [x] All trigger functions return `QueueTranslationResult` type indicating success, failure, and job tracking identifiers
- [x] All trigger functions handle database retrieval errors gracefully and provide meaningful error messages
- [x] The triggers integrate seamlessly with the content translation orchestrator established in REQ-260

### Additional Implementation Criteria

- [ ] `/src/lib/content-translation/triggers/` directory exists
- [ ] `/src/lib/content-translation/triggers/item-trigger.ts` file exists and exports `triggerItemTranslation`
- [ ] `/src/lib/content-translation/triggers/article-trigger.ts` file exists and exports `triggerArticleTranslation`
- [ ] `/src/lib/content-translation/triggers/link-trigger.ts` file exists and exports `triggerLinkTranslation`
- [ ] All trigger functions are exported from `/src/lib/content-translation/index.ts`
- [ ] TypeScript compilation passes without errors
- [ ] Build succeeds
- [ ] Functions can be imported: `import { triggerItemTranslation, triggerArticleTranslation, triggerLinkTranslation } from '@/lib/content-translation'`

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify REQ-259 and REQ-260 are complete:**
   ```bash
   ls -la src/lib/content-translation/
   # Expected: index.ts, content-translation.types.ts, content-translation.ts
   ```

2. **Verify types can be imported:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

### Post-Implementation Verification

3. **Directory and file existence check:**
   ```bash
   ls -la src/lib/content-translation/triggers/
   # Expected: item-trigger.ts, article-trigger.ts, link-trigger.ts
   ```

4. **TypeScript compilation check:**
   ```bash
   npx tsc --noEmit
   # Expected: No errors
   ```

5. **Build verification:**
   ```bash
   npm run build
   # Expected: Build completes successfully
   ```

### Unit Test Scenarios

Create `/src/lib/content-translation/triggers/__tests__/triggers.test.ts`:

```typescript
import { triggerItemTranslation } from '../item-trigger';
import { triggerArticleTranslation } from '../article-trigger';
import { triggerLinkTranslation } from '../link-trigger';

describe('triggerItemTranslation', () => {
  describe('validation', () => {
    it('should reject empty item ID', async () => {
      const result = await triggerItemTranslation('', 'en');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Item ID is required');
    });

    it('should reject invalid source language', async () => {
      const result = await triggerItemTranslation('valid-uuid', 'xx' as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid source language');
    });
  });

  describe('entity fetching', () => {
    it('should return error for non-existent item', async () => {
      const result = await triggerItemTranslation('non-existent-uuid', 'en');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Item not found');
    });

    it('should extract name and description fields', async () => {
      // Mock database to return item with name and description
      // Verify queueContentTranslations is called with both fields
    });

    it('should handle item with only name (no description)', async () => {
      // Mock database to return item with name only
      // Verify queueContentTranslations is called with name field only
    });
  });

  describe('orchestrator integration', () => {
    it('should return job IDs on success', async () => {
      // Mock database and orchestrator
      // Verify result contains job IDs
    });

    it('should pass through orchestrator errors', async () => {
      // Mock orchestrator to fail
      // Verify error is passed through
    });
  });
});

describe('triggerArticleTranslation', () => {
  describe('validation', () => {
    it('should reject empty article ID', async () => {
      const result = await triggerArticleTranslation('', 'en');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Article ID is required');
    });
  });

  describe('entity fetching', () => {
    it('should extract title and description fields', async () => {
      // Mock database to return article with title and description
      // Verify queueContentTranslations is called with both fields
    });
  });
});

describe('triggerLinkTranslation', () => {
  describe('validation', () => {
    it('should reject empty link ID', async () => {
      const result = await triggerLinkTranslation('', 'en');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Link ID is required');
    });
  });

  describe('entity fetching', () => {
    it('should extract only title field (not URL)', async () => {
      // Mock database to return link
      // Verify queueContentTranslations is called with title field only
      // Verify URL is NOT included in fields
    });
  });
});
```

### Integration Test Scenarios

1. **Item Translation Trigger:**
   ```typescript
   // Create test item
   const { data: item } = await supabase.from('items').insert({
     public_id: 'test-item',
     name: 'Coffee Maker',
     description: 'A great coffee maker',
     property_id: testPropertyId
   }).select().single();

   // Trigger translation
   const result = await triggerItemTranslation(item.id, 'en');

   // Verify
   expect(result.success).toBe(true);
   expect(result.queuedLanguages).toHaveLength(5); // fr, es, de, nl, it
   expect(result.jobIds).toHaveLength(5);

   // Verify jobs in database
   const { data: jobs } = await supabase
     .from('translation_jobs')
     .select('*')
     .eq('entity_id', item.id);
   expect(jobs).toHaveLength(5);
   ```

2. **Link Translation Trigger (URL not translated):**
   ```typescript
   // Create test link
   const { data: link } = await supabase.from('item_links').insert({
     item_id: testItemId,
     title: 'User Manual',
     url: 'https://example.com/manual.pdf',
     link_type: 'pdf'
   }).select().single();

   // Trigger translation
   const result = await triggerLinkTranslation(link.id, 'en');

   // Verify
   expect(result.success).toBe(true);

   // Verify URL is NOT in translation jobs (only title)
   const { data: jobs } = await supabase
     .from('translation_jobs')
     .select('*')
     .eq('entity_id', link.id);

   // Jobs exist for link
   expect(jobs.length).toBeGreaterThan(0);
   // URL was never passed to orchestrator (verified via mock or inspection)
   ```

### Manual Verification Checklist

- [ ] `/src/lib/content-translation/triggers/` directory exists
- [ ] All three trigger files exist (`item-trigger.ts`, `article-trigger.ts`, `link-trigger.ts`)
- [ ] Functions are exported from `index.ts`
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] Item trigger extracts `name` and `description`
- [ ] Article trigger extracts `title` and `description`
- [ ] Link trigger extracts `title` only (URL excluded)
- [ ] Entity not found errors return meaningful messages
- [ ] Invalid language errors are caught
- [ ] Empty content is handled gracefully

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Entity table doesn't exist | Low | High | Check table exists; clear error messages |
| Field names mismatch database | Low | Medium | Verify against database schema |
| REQ-260 orchestrator not available | Low | High | Document prerequisite; fail fast with clear message |
| Empty content handling | Medium | Low | Return early with informative message |
| Database connection issues | Low | Medium | Proper error handling and logging |
| Translation context mismatch | Low | Low | Use pre-defined TRANSLATION_CONTEXTS |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1.3.1: Create triggers directory | 1 min |
| Task 1.3.2: Implement item-trigger.ts | 20 min |
| Task 1.3.3: Implement article-trigger.ts | 15 min |
| Task 1.3.4: Implement link-trigger.ts | 15 min |
| Task 1.3.5: Update index.ts exports | 5 min |
| Testing and verification | 25 min |
| **Total** | **~80 min** |

---

## 11. Implementation Commands Summary

```bash
# Step 1: Verify prerequisites are complete
ls -la src/lib/content-translation/
# Expected: index.ts, content-translation.types.ts, content-translation.ts

# Step 2: Create triggers directory
mkdir -p src/lib/content-translation/triggers

# Step 3: Create trigger files
# (Use content from Tasks 1.3.2 - 1.3.4)

# Step 4: Update index.ts exports
# (Add exports for trigger functions)

# Step 5: Verify TypeScript compilation
npx tsc --noEmit

# Step 6: Verify build
npm run build

# Step 7: Verify directory structure
ls -la src/lib/content-translation/triggers/
# Expected: item-trigger.ts, article-trigger.ts, link-trigger.ts
```

---

## 12. Summary of Entity-Field Mapping

| Entity Type | Trigger Function | Extracted Fields | Not Translated |
|-------------|-----------------|------------------|----------------|
| Item | `triggerItemTranslation` | `name`, `description` | id, public_id, property_id |
| Article | `triggerArticleTranslation` | `title`, `description` | id, item_id, purpose, display_order |
| Link | `triggerLinkTranslation` | `title` | id, item_id, article_id, **url**, link_type, thumbnail_url, display_order |

**Key Design Decision:** URLs are explicitly NOT translated. Only the `title` field of links is translatable, ensuring that link destinations remain functional across all languages.

---

## 13. Next Steps After Implementation

After completing Task 1.3 (this task):

1. **Task 1.4:** Implement tag translation trigger (`tag-trigger.ts`)
2. **Task 1.5:** Implement translation storage utilities (`translation-storage.ts`)
3. **Task 1.6:** Implement translation status utilities (`translation-status.ts`)
4. **Phase 2:** Modify existing API routes to use these triggers

The triggers created in this task will be called by the API routes in Phase 2 whenever items, articles, or links are created or updated.

---

## References

- [PRD: L10N Epic 3 - Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Request Reference](/docs/gen_requests_epic3.md) - REQ-261
- [Type Definitions Task](/docs/REQ-259-create-content-translation-module-structure-overview.md) - REQ-259
- [Orchestrator Task](/docs/REQ-260-implement-content-translation-orchestrator-overview.md) - REQ-260
- [Existing Supabase Client](/src/lib/supabase.ts)
- [Items API Route](/src/app/api/admin/items/route.ts)
- [Articles API Route](/src/app/api/admin/articles/route.ts)

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 1, Task 1.3*
