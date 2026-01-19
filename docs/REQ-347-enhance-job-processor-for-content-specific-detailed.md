# REQ-347: Enhance Job Processor for Content-Specific Translation Handling - Detailed Task Breakdown

**Generated:** 2026-01-19 12:00:00 UTC
**Last Modified:** 2026-01-19 12:00:00 UTC
**Request Reference:** REQ-347 in `/docs/gen_requests_epic3.md`
**Overview Document:** `/docs/REQ-347-enhance-job-processor-for-content-specific-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.1

---

## Executive Summary

This task enhances the existing translation job processor (`/src/lib/job-queue/job-processor.ts`) to route different content types through specialized translation handlers based on entity type. The enhancement enables content-aware job processing where items, articles, links, and tags each follow dedicated processing paths that understand their unique field structures, validation requirements, and post-processing needs.

**Current State:** The job processor handles all translation jobs through a generic flow with switch statements in `fetchEntityContent()` and `saveTranslation()` functions.

**Target State:** A router function (`processTranslationJob()`) dispatches jobs to entity-specific processors, each with dedicated fetch, translate, and save logic optimized for that content type.

---

## Prerequisites Verification Checklist

Before starting implementation, verify these components exist and are functional:

| Prerequisite | File/Location | Verification |
|--------------|---------------|--------------|
| Job Queue Module (REQ-243) | `/src/lib/job-queue/translation-jobs.ts` | `fetchAndLockNextJob()`, `markJobCompleted()`, `markJobFailed()` functions exist |
| Job Processor (REQ-244) | `/src/lib/job-queue/job-processor.ts` | `fetchEntityContent()`, `saveTranslation()`, `TranslationJobProcessor` class exist |
| Translation Service (REQ-240) | `/src/lib/translation-service/` | `translateText()` function exists |
| Job Types (REQ-243) | `/src/lib/job-queue/translation-jobs.types.ts` | `TranslationJob`, `EntityType`, `SupportedLanguage` types exist |
| Concurrency Control (REQ-245) | `/src/lib/job-queue/concurrency-control.ts` | `createLockHeartbeat()` function exists |
| Database Tables | Supabase | `items`, `item_articles`, `item_links`, `tag_translations` source tables; `item_translations`, `article_translations`, `link_translations`, `tag_translations` translation tables |

---

## Task Breakdown

### Task 3.1.1: Create Content Processors Directory Structure

**Estimated Size:** S (Small)
**Priority:** P0 - Must complete first

**Objective:** Create the directory structure and foundational type definitions for entity-specific processors.

**Files to Create:**
- `/src/lib/job-queue/content-processors/types.ts`
- `/src/lib/job-queue/content-processors/index.ts`

**Implementation Details:**

**File: `/src/lib/job-queue/content-processors/types.ts`**

```typescript
/**
 * Content Processor Types
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Type definitions for entity-specific translation processors.
 *
 * @module job-queue/content-processors/types
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import type { TranslationJob, SupportedLanguage, EntityType } from '../translation-jobs.types';
import type { JobProcessingResult } from '../job-processor';

/**
 * Configuration for entity-specific translation processing
 */
export interface EntityProcessorConfig {
  /** Fields to translate for this entity type */
  translatableFields: string[];
  /** Translation context for quality optimization */
  translationContext: {
    contentType: string;
    domainContext: string;
  };
  /** Maximum field lengths (optional validation) */
  maxFieldLengths?: Record<string, number>;
  /** Whether to preserve HTML/Markdown formatting */
  preserveFormatting?: boolean;
}

/**
 * Content fetched from source table
 */
export interface FetchedContent {
  entityId: string;
  sourceLanguage: SupportedLanguage;
  fields: Record<string, string | null>;
}

/**
 * Result from an entity-specific processor
 */
export interface ProcessorResult {
  success: boolean;
  translatedFields?: Record<string, string>;
  errorMessage?: string;
}

/**
 * Entity processor function signature
 */
export type EntityProcessor = (
  job: TranslationJob
) => Promise<JobProcessingResult>;

// Re-export commonly used types for convenience
export type { TranslationJob, SupportedLanguage, EntityType, JobProcessingResult };
```

**File: `/src/lib/job-queue/content-processors/index.ts`**

```typescript
/**
 * Content Processors Module
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Barrel exports for entity-specific translation processors.
 *
 * @module job-queue/content-processors
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// Type exports
export type {
  EntityProcessorConfig,
  FetchedContent,
  ProcessorResult,
  EntityProcessor,
  TranslationJob,
  SupportedLanguage,
  EntityType,
  JobProcessingResult,
} from './types';

// Processor exports (to be added as processors are implemented)
// export { processItemTranslation } from './item-processor';
// export { processArticleTranslation } from './article-processor';
// export { processLinkTranslation } from './link-processor';
// export { processTagTranslation } from './tag-processor';
```

**Acceptance Criteria:**
- [ ] Directory `/src/lib/job-queue/content-processors/` exists
- [ ] `types.ts` contains all interface definitions matching the overview document
- [ ] `index.ts` exports all types
- [ ] TypeScript compilation succeeds with no errors
- [ ] Types are importable from `@/lib/job-queue/content-processors`

**Verification Command:**
```bash
npx tsc --noEmit src/lib/job-queue/content-processors/types.ts
```

---

### Task 3.1.2: Implement Item Translation Processor

**Estimated Size:** S (Small)
**Priority:** P1
**Depends On:** Task 3.1.1

**Objective:** Create a specialized handler for item translations that processes `name` and `description` fields.

**File to Create:** `/src/lib/job-queue/content-processors/item-processor.ts`

**Implementation Details:**

```typescript
/**
 * Item Translation Processor
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Specialized handler for translating item content (name, description).
 *
 * @module job-queue/content-processors/item-processor
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '../translation-jobs';
import type { TranslationJob, SupportedLanguage } from '../translation-jobs.types';
import type { JobProcessingResult } from '../job-processor';

// ===========================================================================
// Translation Context Configuration
// ===========================================================================

const ITEM_TRANSLATION_CONTEXT = {
  name: {
    contentType: 'item_name' as const,
    domainContext: 'Household item or appliance name in vacation rental property. Keep concise and natural.',
  },
  description: {
    contentType: 'item_description' as const,
    domainContext: 'Description of household item for vacation rental guests. Maintain helpful, friendly tone.',
  },
};

// ===========================================================================
// Content Fetching
// ===========================================================================

/**
 * Fetch item content from source table
 *
 * @param entityId - The item UUID
 * @returns Item content or null if not found
 */
async function fetchItemContent(entityId: string): Promise<{
  sourceLanguage: SupportedLanguage;
  name: string;
  description: string | null;
} | null> {
  const { data, error } = await supabaseAdmin
    .from('items')
    .select('name, description, source_language')
    .eq('id', entityId)
    .single();

  if (error || !data) {
    console.error('[ItemProcessor] Failed to fetch item:', error);
    return null;
  }

  return {
    sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
    name: data.name,
    description: data.description,
  };
}

// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Save item translation to translation table
 *
 * @param itemId - The item UUID
 * @param language - Target language code
 * @param translatedFields - Translated name and description
 * @returns Boolean indicating success
 */
async function saveItemTranslation(
  itemId: string,
  language: SupportedLanguage,
  translatedFields: { name: string; description?: string | null }
): Promise<boolean> {
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('item_translations')
    .upsert(
      {
        item_id: itemId,
        language,
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

  if (error) {
    console.error('[ItemProcessor] Failed to save translation:', error);
    return false;
  }

  return true;
}

// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process item translation job
 *
 * Handles translation of item `name` and `description` fields.
 * Uses item_name and item_description content types for optimal translation context.
 *
 * @param job - Translation job with entityType 'item'
 * @returns Processing result
 */
export async function processItemTranslation(
  job: TranslationJob
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityId, targetLanguage } = job;

  try {
    // 1. Fetch item content
    const content = await fetchItemContent(entityId);
    if (!content) {
      throw new Error(`Item not found: ${entityId}`);
    }

    // 2. Translate fields
    const translatedFields: { name: string; description?: string | null } = {
      name: '',
    };

    // Translate name (required field)
    const nameResult = await translateText(
      content.name,
      content.sourceLanguage,
      targetLanguage,
      {
        context: ITEM_TRANSLATION_CONTEXT.name,
      }
    );
    translatedFields.name = nameResult.translatedText;

    // Translate description (optional field)
    if (content.description && content.description.trim() !== '') {
      const descResult = await translateText(
        content.description,
        content.sourceLanguage,
        targetLanguage,
        {
          context: ITEM_TRANSLATION_CONTEXT.description,
        }
      );
      translatedFields.description = descResult.translatedText;
    }

    // 3. Save translation
    const saved = await saveItemTranslation(entityId, targetLanguage, translatedFields);
    if (!saved) {
      throw new Error('Failed to save item translation');
    }

    // 4. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[ItemProcessor] Job ${job.id} completed: ${entityId} -> ${targetLanguage}`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'item',
      entityId,
      targetLanguage,
      translatedFields: {
        name: translatedFields.name,
        ...(translatedFields.description && { description: translatedFields.description }),
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await markJobFailed(job.id, errorMessage);

    console.error(`[ItemProcessor] Job ${job.id} failed:`, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'item',
      entityId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `processItemTranslation` function accepts a `TranslationJob` parameter
- [ ] Function fetches item from `items` table using Supabase
- [ ] Function translates `name` field with `item_name` content type
- [ ] Function translates `description` field with `item_description` content type (if not null/empty)
- [ ] Function stores translation in `item_translations` table using UPSERT
- [ ] Function calls `markJobCompleted()` on success
- [ ] Function calls `markJobFailed()` with error message on failure
- [ ] Function returns `JobProcessingResult` with all required fields
- [ ] Error handling catches and logs exceptions
- [ ] TypeScript compilation succeeds with no errors

**Test Cases:**
1. Successfully translate item with name and description
2. Successfully translate item with name only (null description)
3. Handle item not found error
4. Handle translation service failure
5. Handle database save failure

---

### Task 3.1.3: Implement Article Translation Processor

**Estimated Size:** S (Small)
**Priority:** P1
**Depends On:** Task 3.1.1

**Objective:** Create a specialized handler for article translations that processes `title` and `description` fields with Markdown preservation.

**File to Create:** `/src/lib/job-queue/content-processors/article-processor.ts`

**Implementation Details:**

```typescript
/**
 * Article Translation Processor
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Specialized handler for translating article content (title, description).
 * Preserves Markdown/HTML formatting in description field.
 *
 * @module job-queue/content-processors/article-processor
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '../translation-jobs';
import type { TranslationJob, SupportedLanguage } from '../translation-jobs.types';
import type { JobProcessingResult } from '../job-processor';

// ===========================================================================
// Translation Context Configuration
// ===========================================================================

const ARTICLE_TRANSLATION_CONTEXT = {
  title: {
    contentType: 'article_title' as const,
    domainContext: 'Title of an instruction article for vacation rental guests. Format: "[How to/Safety/etc] - [Item Name]"',
  },
  description: {
    contentType: 'article_description' as const,
    domainContext: 'Instruction content for vacation rental guests. Keep instructions clear and actionable. Preserve any Markdown formatting.',
  },
};

// ===========================================================================
// Content Fetching
// ===========================================================================

/**
 * Fetch article content from source table
 *
 * @param entityId - The article UUID
 * @returns Article content or null if not found
 */
async function fetchArticleContent(entityId: string): Promise<{
  sourceLanguage: SupportedLanguage;
  title: string;
  description: string | null;
} | null> {
  const { data, error } = await supabaseAdmin
    .from('item_articles')
    .select('title, description, source_language')
    .eq('id', entityId)
    .single();

  if (error || !data) {
    console.error('[ArticleProcessor] Failed to fetch article:', error);
    return null;
  }

  return {
    sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
    title: data.title,
    description: data.description,
  };
}

// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Save article translation to translation table
 *
 * @param articleId - The article UUID
 * @param language - Target language code
 * @param translatedFields - Translated title and description
 * @returns Boolean indicating success
 */
async function saveArticleTranslation(
  articleId: string,
  language: SupportedLanguage,
  translatedFields: { title: string; description?: string | null }
): Promise<boolean> {
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('article_translations')
    .upsert(
      {
        article_id: articleId,
        language,
        title: translatedFields.title,
        description: translatedFields.description || null,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
      },
      {
        onConflict: 'article_id,language',
      }
    );

  if (error) {
    console.error('[ArticleProcessor] Failed to save translation:', error);
    return false;
  }

  return true;
}

// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process article translation job
 *
 * Handles translation of article `title` and `description` fields.
 * Description may contain Markdown formatting that should be preserved.
 *
 * @param job - Translation job with entityType 'article'
 * @returns Processing result
 */
export async function processArticleTranslation(
  job: TranslationJob
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityId, targetLanguage } = job;

  try {
    // 1. Fetch article content
    const content = await fetchArticleContent(entityId);
    if (!content) {
      throw new Error(`Article not found: ${entityId}`);
    }

    // 2. Translate fields
    const translatedFields: { title: string; description?: string | null } = {
      title: '',
    };

    // Translate title (required field)
    const titleResult = await translateText(
      content.title,
      content.sourceLanguage,
      targetLanguage,
      {
        context: ARTICLE_TRANSLATION_CONTEXT.title,
      }
    );
    translatedFields.title = titleResult.translatedText;

    // Translate description (optional field, preserve formatting)
    if (content.description && content.description.trim() !== '') {
      const descResult = await translateText(
        content.description,
        content.sourceLanguage,
        targetLanguage,
        {
          context: ARTICLE_TRANSLATION_CONTEXT.description,
          preserveFormatting: true,
        }
      );
      translatedFields.description = descResult.translatedText;
    }

    // 3. Save translation
    const saved = await saveArticleTranslation(entityId, targetLanguage, translatedFields);
    if (!saved) {
      throw new Error('Failed to save article translation');
    }

    // 4. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[ArticleProcessor] Job ${job.id} completed: ${entityId} -> ${targetLanguage}`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'article',
      entityId,
      targetLanguage,
      translatedFields: {
        title: translatedFields.title,
        ...(translatedFields.description && { description: translatedFields.description }),
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await markJobFailed(job.id, errorMessage);

    console.error(`[ArticleProcessor] Job ${job.id} failed:`, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'article',
      entityId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `processArticleTranslation` function accepts a `TranslationJob` parameter
- [ ] Function fetches article from `item_articles` table using Supabase
- [ ] Function translates `title` field with `article_title` content type
- [ ] Function translates `description` field with `article_description` content type (if not null/empty)
- [ ] Function passes `preserveFormatting: true` for description translation
- [ ] Function stores translation in `article_translations` table using UPSERT
- [ ] Function calls `markJobCompleted()` on success
- [ ] Function calls `markJobFailed()` with error message on failure
- [ ] Function returns `JobProcessingResult` with all required fields

**Test Cases:**
1. Successfully translate article with title and description
2. Successfully translate article with title only (null description)
3. Preserve Markdown formatting in description (headers, lists, bold, etc.)
4. Handle article not found error
5. Handle translation service failure

---

### Task 3.1.4: Implement Link Translation Processor

**Estimated Size:** S (Small)
**Priority:** P1
**Depends On:** Task 3.1.1

**Objective:** Create a specialized handler for link translations that processes only the `title` field (URLs are never translated).

**File to Create:** `/src/lib/job-queue/content-processors/link-processor.ts`

**Implementation Details:**

```typescript
/**
 * Link Translation Processor
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Specialized handler for translating link content (title only).
 * URLs are never translated.
 *
 * @module job-queue/content-processors/link-processor
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '../translation-jobs';
import type { TranslationJob, SupportedLanguage } from '../translation-jobs.types';
import type { JobProcessingResult } from '../job-processor';

// ===========================================================================
// Translation Context Configuration
// ===========================================================================

const LINK_TRANSLATION_CONTEXT = {
  title: {
    contentType: 'link_title' as const,
    domainContext: 'Media link title (video, PDF, manual, etc.) for vacation rental guests. Keep it descriptive but concise.',
  },
};

// ===========================================================================
// Content Fetching
// ===========================================================================

/**
 * Fetch link content from source table
 *
 * @param entityId - The link UUID
 * @returns Link content or null if not found
 */
async function fetchLinkContent(entityId: string): Promise<{
  sourceLanguage: SupportedLanguage;
  title: string;
} | null> {
  const { data, error } = await supabaseAdmin
    .from('item_links')
    .select('title, source_language')
    .eq('id', entityId)
    .single();

  if (error || !data) {
    console.error('[LinkProcessor] Failed to fetch link:', error);
    return null;
  }

  return {
    sourceLanguage: (data.source_language as SupportedLanguage) || 'en',
    title: data.title,
  };
}

// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Save link translation to translation table
 *
 * @param linkId - The link UUID
 * @param language - Target language code
 * @param translatedTitle - Translated title
 * @returns Boolean indicating success
 */
async function saveLinkTranslation(
  linkId: string,
  language: SupportedLanguage,
  translatedTitle: string
): Promise<boolean> {
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('link_translations')
    .upsert(
      {
        link_id: linkId,
        language,
        title: translatedTitle,
        translation_status: 'completed',
        translated_at: now,
        updated_at: now,
      },
      {
        onConflict: 'link_id,language',
      }
    );

  if (error) {
    console.error('[LinkProcessor] Failed to save translation:', error);
    return false;
  }

  return true;
}

// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process link translation job
 *
 * Handles translation of link `title` field only.
 * URLs are never translated.
 *
 * @param job - Translation job with entityType 'link'
 * @returns Processing result
 */
export async function processLinkTranslation(
  job: TranslationJob
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityId, targetLanguage } = job;

  try {
    // 1. Fetch link content
    const content = await fetchLinkContent(entityId);
    if (!content) {
      throw new Error(`Link not found: ${entityId}`);
    }

    // 2. Translate title
    const titleResult = await translateText(
      content.title,
      content.sourceLanguage,
      targetLanguage,
      {
        context: LINK_TRANSLATION_CONTEXT.title,
      }
    );

    // 3. Save translation
    const saved = await saveLinkTranslation(entityId, targetLanguage, titleResult.translatedText);
    if (!saved) {
      throw new Error('Failed to save link translation');
    }

    // 4. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[LinkProcessor] Job ${job.id} completed: ${entityId} -> ${targetLanguage}`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'link',
      entityId,
      targetLanguage,
      translatedFields: {
        title: titleResult.translatedText,
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await markJobFailed(job.id, errorMessage);

    console.error(`[LinkProcessor] Job ${job.id} failed:`, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'link',
      entityId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `processLinkTranslation` function accepts a `TranslationJob` parameter
- [ ] Function fetches link from `item_links` table using Supabase
- [ ] Function translates only `title` field with `link_title` content type
- [ ] Function does NOT translate URL field (not even fetched)
- [ ] Function stores translation in `link_translations` table using UPSERT
- [ ] Function calls `markJobCompleted()` on success
- [ ] Function calls `markJobFailed()` with error message on failure
- [ ] Function returns `JobProcessingResult` with all required fields

**Test Cases:**
1. Successfully translate link title
2. Handle link not found error
3. Handle translation service failure
4. Handle database save failure

---

### Task 3.1.5: Implement Tag Translation Processor

**Estimated Size:** S (Small)
**Priority:** P1
**Depends On:** Task 3.1.1

**Objective:** Create a specialized handler for tag translations with system tag awareness.

**File to Create:** `/src/lib/job-queue/content-processors/tag-processor.ts`

**Implementation Details:**

```typescript
/**
 * Tag Translation Processor
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Specialized handler for translating tag content.
 * System tags (is_system_tag=true) should already be seeded and are skipped.
 * User tags are translated from English source.
 *
 * @module job-queue/content-processors/tag-processor
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '../translation-jobs';
import type { TranslationJob, SupportedLanguage } from '../translation-jobs.types';
import type { JobProcessingResult } from '../job-processor';

// ===========================================================================
// Translation Context Configuration
// ===========================================================================

const TAG_TRANSLATION_CONTEXT = {
  contentType: 'tag' as const,
  domainContext: 'Category tag for organizing household items in vacation rental property. Single word or short phrase, suitable for filtering/searching.',
};

// ===========================================================================
// Content Fetching
// ===========================================================================

/**
 * Fetch tag content from source table (English tag_translations)
 *
 * @param tagKey - The tag key identifier
 * @returns Tag content or null if not found
 */
async function fetchTagContent(tagKey: string): Promise<{
  translatedValue: string;
  isSystemTag: boolean;
} | null> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('translated_value, is_system_tag')
    .eq('tag_key', tagKey)
    .eq('language', 'en')
    .single();

  if (error || !data) {
    console.error('[TagProcessor] Failed to fetch tag:', error);
    return null;
  }

  return {
    translatedValue: data.translated_value,
    isSystemTag: data.is_system_tag || false,
  };
}

/**
 * Check if translation already exists for this tag/language combination
 *
 * @param tagKey - The tag key identifier
 * @param language - Target language code
 * @returns Boolean indicating if translation exists
 */
async function tagTranslationExists(
  tagKey: string,
  language: SupportedLanguage
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('tag_translations')
    .select('tag_key')
    .eq('tag_key', tagKey)
    .eq('language', language)
    .maybeSingle();

  if (error) {
    console.error('[TagProcessor] Error checking existing translation:', error);
    return false;
  }

  return data !== null;
}

// ===========================================================================
// Translation Storage
// ===========================================================================

/**
 * Save tag translation to translation table
 *
 * @param tagKey - The tag key identifier
 * @param language - Target language code
 * @param translatedValue - Translated tag value
 * @returns Boolean indicating success
 */
async function saveTagTranslation(
  tagKey: string,
  language: SupportedLanguage,
  translatedValue: string
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('tag_translations')
    .upsert(
      {
        tag_key: tagKey,
        language,
        translated_value: translatedValue,
        is_system_tag: false,
      },
      {
        onConflict: 'tag_key,language',
      }
    );

  if (error) {
    console.error('[TagProcessor] Failed to save translation:', error);
    return false;
  }

  return true;
}

// ===========================================================================
// Main Processor Function
// ===========================================================================

/**
 * Process tag translation job
 *
 * Handles translation of tag `translated_value`.
 * Checks is_system_tag flag - system tags should already be seeded.
 * Tags are short category labels - single word or short phrase.
 *
 * @param job - Translation job with entityType 'tag'
 * @returns Processing result
 */
export async function processTagTranslation(
  job: TranslationJob
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityId: tagKey, targetLanguage } = job;

  try {
    // 1. Fetch tag content (English source)
    const content = await fetchTagContent(tagKey);
    if (!content) {
      throw new Error(`Tag not found: ${tagKey}`);
    }

    // 2. Check if system tag - should already be seeded
    if (content.isSystemTag) {
      // Check if translation already exists
      const exists = await tagTranslationExists(tagKey, targetLanguage);
      if (exists) {
        // System tag translation already exists, mark as completed
        await markJobCompleted(job.id);
        console.log(`[TagProcessor] Job ${job.id} skipped: system tag already translated`);

        return {
          jobId: job.id,
          success: true,
          entityType: 'tag',
          entityId: tagKey,
          targetLanguage,
          translatedFields: {},
          processingTimeMs: Date.now() - startTime,
        };
      }
      // System tag missing translation - this is unusual but we'll translate it
      console.warn(`[TagProcessor] System tag ${tagKey} missing ${targetLanguage} translation, will translate`);
    }

    // 3. Translate the tag value
    const translationResult = await translateText(
      content.translatedValue,
      'en', // Tags always use English as source
      targetLanguage,
      {
        context: TAG_TRANSLATION_CONTEXT,
      }
    );

    // 4. Save translation (mark as user tag, not system)
    const saved = await saveTagTranslation(tagKey, targetLanguage, translationResult.translatedText);
    if (!saved) {
      throw new Error('Failed to save tag translation');
    }

    // 5. Mark job completed
    await markJobCompleted(job.id);

    console.log(`[TagProcessor] Job ${job.id} completed: ${tagKey} -> ${targetLanguage}`);

    return {
      jobId: job.id,
      success: true,
      entityType: 'tag',
      entityId: tagKey,
      targetLanguage,
      translatedFields: {
        translated_value: translationResult.translatedText,
      },
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await markJobFailed(job.id, errorMessage);

    console.error(`[TagProcessor] Job ${job.id} failed:`, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: 'tag',
      entityId: tagKey,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `processTagTranslation` function accepts a `TranslationJob` parameter
- [ ] Function fetches tag from `tag_translations` table where language='en'
- [ ] Function checks `is_system_tag` flag
- [ ] System tags with existing translation are marked completed without re-translation
- [ ] Function translates `translated_value` field with `tag` content type
- [ ] Function stores translation in `tag_translations` table with `is_system_tag: false`
- [ ] Function calls `markJobCompleted()` on success
- [ ] Function calls `markJobFailed()` with error message on failure
- [ ] Function returns `JobProcessingResult` with all required fields

**Test Cases:**
1. Successfully translate user tag
2. Skip system tag that already has translation
3. Translate system tag that is missing translation (edge case)
4. Handle tag not found error
5. Handle translation service failure

---

### Task 3.1.6: Create Router Function in Job Processor

**Estimated Size:** S (Small)
**Priority:** P0
**Depends On:** Tasks 3.1.2, 3.1.3, 3.1.4, 3.1.5

**Objective:** Add the `processTranslationJob()` router function to dispatch jobs to entity-specific handlers.

**File to Modify:** `/src/lib/job-queue/job-processor.ts`

**Implementation Details:**

Add the following after the import statements (around line 19):

```typescript
// ===========================================================================
// Content-Specific Processor Imports (REQ-347)
// ===========================================================================

import {
  processItemTranslation,
  processArticleTranslation,
  processLinkTranslation,
  processTagTranslation,
} from './content-processors';
```

Add the following new function (before the `processJob` function, around line 435):

```typescript
// ===========================================================================
// Translation Job Router (REQ-347)
// ===========================================================================

/**
 * Route translation job to content-specific handler
 *
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Dispatches jobs to entity-specific processors based on entityType.
 * Each processor handles fetching, translating, and storing for its content type.
 *
 * @param job - The translation job to process
 * @returns Processing result from the appropriate handler
 */
export async function processTranslationJob(
  job: TranslationJob
): Promise<JobProcessingResult> {
  switch (job.entityType) {
    case 'item':
      return processItemTranslation(job);
    case 'article':
      return processArticleTranslation(job);
    case 'link':
      return processLinkTranslation(job);
    case 'tag':
      return processTagTranslation(job);
    default:
      // Handle unrecognized entity type gracefully
      console.error(`[JobProcessor] Unknown entity type: ${job.entityType}`);
      return {
        jobId: job.id,
        success: false,
        entityType: job.entityType,
        entityId: job.entityId,
        targetLanguage: job.targetLanguage,
        errorMessage: `Unrecognized entity type: ${job.entityType}`,
        processingTimeMs: 0,
      };
  }
}
```

**Acceptance Criteria:**
- [ ] `processTranslationJob` function is exported from job-processor.ts
- [ ] Function accepts `TranslationJob` parameter
- [ ] Switch statement dispatches to `processItemTranslation` for entityType 'item'
- [ ] Switch statement dispatches to `processArticleTranslation` for entityType 'article'
- [ ] Switch statement dispatches to `processLinkTranslation` for entityType 'link'
- [ ] Switch statement dispatches to `processTagTranslation` for entityType 'tag'
- [ ] Default case logs error and returns failed result for unknown entity types
- [ ] TypeScript compilation succeeds with no errors

**Test Cases:**
1. Route item job to processItemTranslation
2. Route article job to processArticleTranslation
3. Route link job to processLinkTranslation
4. Route tag job to processTagTranslation
5. Handle unknown entity type with error result

---

### Task 3.1.7: Update Barrel Exports

**Estimated Size:** XS (Trivial)
**Priority:** P1
**Depends On:** Tasks 3.1.1 through 3.1.6

**Objective:** Update the content-processors index.ts and main job-queue index.ts to export new processors.

**Files to Modify:**

**File 1: `/src/lib/job-queue/content-processors/index.ts`**

Uncomment the processor exports and ensure all are listed:

```typescript
/**
 * Content Processors Module
 * Part of REQ-347: Content-Specific Translation Handling
 *
 * Barrel exports for entity-specific translation processors.
 *
 * @module job-queue/content-processors
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// Type exports
export type {
  EntityProcessorConfig,
  FetchedContent,
  ProcessorResult,
  EntityProcessor,
  TranslationJob,
  SupportedLanguage,
  EntityType,
  JobProcessingResult,
} from './types';

// Processor exports
export { processItemTranslation } from './item-processor';
export { processArticleTranslation } from './article-processor';
export { processLinkTranslation } from './link-processor';
export { processTagTranslation } from './tag-processor';
```

**File 2: `/src/lib/job-queue/index.ts`**

Add exports for the new router function and content processors:

```typescript
// Content-specific processors (REQ-347)
export { processTranslationJob } from './job-processor';

export {
  processItemTranslation,
  processArticleTranslation,
  processLinkTranslation,
  processTagTranslation,
} from './content-processors';

export type {
  EntityProcessorConfig,
  FetchedContent,
  ProcessorResult,
  EntityProcessor,
} from './content-processors';
```

**Acceptance Criteria:**
- [ ] All processor functions exported from content-processors/index.ts
- [ ] All processor types exported from content-processors/index.ts
- [ ] processTranslationJob exported from main job-queue index.ts
- [ ] All processors re-exported from main job-queue index.ts
- [ ] Import `import { processTranslationJob } from '@/lib/job-queue'` works
- [ ] Import `import { processItemTranslation } from '@/lib/job-queue'` works

---

### Task 3.1.8: Refactor Existing processJob Function

**Estimated Size:** S (Small)
**Priority:** P1
**Depends On:** Task 3.1.6

**Objective:** Refactor the existing `processJob()` function to use the new router while preserving heartbeat and logging functionality.

**File to Modify:** `/src/lib/job-queue/job-processor.ts`

**Implementation Details:**

Replace the existing `processJob` function (lines ~446-542) with:

```typescript
// ===========================================================================
// Single Job Processing (Refactored for REQ-347)
// ===========================================================================

/**
 * Process a single translation job
 *
 * Wraps content-specific processing with heartbeat management and logging.
 * Delegates actual translation work to processTranslationJob router.
 *
 * @param job - The translation job to process
 * @param config - Processor configuration
 * @returns Processing result
 */
async function processJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  // Start heartbeat to prevent lock timeout during processing (Task 4.4.7 - REQ-245)
  const stopHeartbeat = createLockHeartbeat(
    job.id,
    config.workerId,
    config.heartbeatIntervalMs || DEFAULT_HEARTBEAT_INTERVAL_MS
  );

  try {
    // Delegate to content-specific processor via router
    const result = await processTranslationJob(job);

    if (config.enableLogging) {
      const status = result.success ? 'completed' : 'failed';
      console.log(`[JobProcessor] Job ${job.id} ${status}`);
    }

    return result;

  } catch (error) {
    // Handle unexpected errors from router
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (config.enableLogging) {
      console.error(`[JobProcessor] Job ${job.id} unexpected error:`, errorMessage);
    }

    // Mark job failed if router threw unexpectedly
    await markJobFailed(job.id, errorMessage);

    return {
      jobId: job.id,
      success: false,
      entityType: job.entityType,
      entityId: job.entityId,
      targetLanguage: job.targetLanguage,
      errorMessage,
      processingTimeMs: 0,
    };

  } finally {
    // Always stop heartbeat when done (success or failure)
    stopHeartbeat();
  }
}
```

**Changes Summary:**
1. Removed inline fetch/translate/save logic
2. Added call to `processTranslationJob(job)` to delegate to router
3. Preserved heartbeat start/stop
4. Preserved logging based on config.enableLogging
5. Added catch block for unexpected router errors
6. Simplified return - uses result from router

**Acceptance Criteria:**
- [ ] `processJob` function calls `processTranslationJob(job)` for actual processing
- [ ] Heartbeat is started before processing and stopped after (success or failure)
- [ ] Logging behavior preserved based on `config.enableLogging`
- [ ] Unexpected errors are caught, logged, and result in failed job status
- [ ] Existing callers (`processNextJob`, `runProcessingCycle`) continue to work unchanged
- [ ] All existing tests pass without modification
- [ ] TypeScript compilation succeeds with no errors

**Test Cases:**
1. Job processing works end-to-end through new router
2. Heartbeat is active during processing
3. Heartbeat stops after success
4. Heartbeat stops after failure
5. Unexpected exceptions are handled gracefully

---

## Testing Strategy

### Unit Tests to Create

Create test file: `/src/lib/job-queue/content-processors/__tests__/content-processors.test.ts`

**Test Suites:**

1. **processTranslationJob Router Tests**
   - Routes item job correctly
   - Routes article job correctly
   - Routes link job correctly
   - Routes tag job correctly
   - Handles unknown entity type

2. **processItemTranslation Tests**
   - Successfully translates item with name and description
   - Handles item with null description
   - Returns error for item not found
   - Returns error for translation service failure
   - Returns error for database save failure

3. **processArticleTranslation Tests**
   - Successfully translates article with title and description
   - Preserves Markdown formatting
   - Handles article with null description
   - Returns error for article not found

4. **processLinkTranslation Tests**
   - Successfully translates link title
   - Does not include URL in translation
   - Returns error for link not found

5. **processTagTranslation Tests**
   - Successfully translates user tag
   - Skips system tag with existing translation
   - Translates system tag missing translation
   - Returns error for tag not found

### Integration Tests

Extend existing file: `/src/lib/job-queue/__tests__/job-processing.integration.test.ts`

Add test cases:
1. End-to-end: Create item job -> Process via new router -> Verify translation saved
2. Multi-entity: Process jobs for all 4 entity types sequentially
3. Error recovery: Entity not found, translation service failure
4. Existing tests continue to pass

### Verification Commands

```bash
# Type checking
npx tsc --noEmit

# Run unit tests for content processors
npm test -- --testPathPattern="content-processors"

# Run all job-queue tests
npm test -- --testPathPattern="job-queue"

# Run integration tests
npm test -- --testPathPattern="integration"
```

---

## Files Changed Summary

### New Files Created

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/content-processors/types.ts` | Type definitions for processors |
| `/src/lib/job-queue/content-processors/index.ts` | Barrel exports |
| `/src/lib/job-queue/content-processors/item-processor.ts` | Item translation handler |
| `/src/lib/job-queue/content-processors/article-processor.ts` | Article translation handler |
| `/src/lib/job-queue/content-processors/link-processor.ts` | Link translation handler |
| `/src/lib/job-queue/content-processors/tag-processor.ts` | Tag translation handler |

### Existing Files Modified

| File Path | Changes |
|-----------|---------|
| `/src/lib/job-queue/job-processor.ts` | Add imports, add `processTranslationJob()` router, refactor `processJob()` |
| `/src/lib/job-queue/index.ts` | Add exports for new processors and types |

---

## Acceptance Criteria Verification Checklist

| Requirement (from REQ-347) | Task | Verification |
|---------------------------|------|--------------|
| processTranslationJob function accepts TranslationJob with entityType field | 3.1.6 | Function signature accepts `TranslationJob` |
| Switch statement dispatches based on entityType | 3.1.6 | `switch (job.entityType)` in router |
| processItemTranslation handler exists for entityType 'item' | 3.1.2 | Implemented in `item-processor.ts` |
| processArticleTranslation handler exists for entityType 'article' | 3.1.3 | Implemented in `article-processor.ts` |
| processLinkTranslation handler exists for entityType 'link' | 3.1.4 | Implemented in `link-processor.ts` |
| processTagTranslation handler exists for entityType 'tag' | 3.1.5 | Implemented in `tag-processor.ts` |
| Each handler retrieves content from appropriate table | 3.1.2-3.1.5 | Direct Supabase queries per processor |
| Each handler invokes translation service with appropriate params | 3.1.2-3.1.5 | Content-type specific context per processor |
| Each handler stores results in corresponding translation table | 3.1.2-3.1.5 | UPSERT to entity-specific table |
| Unrecognized entityType logs error and marks job failed | 3.1.6 | Default case in switch handles this |
| Existing tests remain passing | 3.1.8 | Backward compatibility preserved |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing behavior | Comprehensive unit test coverage before and after refactoring |
| Inconsistent error handling | All processors use same result type and logging patterns |
| Context configuration drift | Constants defined at top of each processor file |
| Import cycle issues | Types in separate file, processors import from types |

---

## References

- Overview Document: `/docs/REQ-347-enhance-job-processor-for-content-specific-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 3, Task 3.1)
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-347)
- Existing Job Processor: `/src/lib/job-queue/job-processor.ts`
- Existing Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Translation Service: `/src/lib/translation-service/`

---

*Detailed task breakdown generated for FAQBNB Localization Epic 3 - Dynamic Content Translation, Phase 3, Task 3.1*
*Generated: 2026-01-19 12:00:00 UTC*
