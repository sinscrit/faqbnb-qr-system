# REQ-340: Implement Entity-Specific Translation Triggers - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.3

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for creating entity-specific translation triggers. These triggers are responsible for extracting translatable fields from items, articles, and links, then queuing them for translation to all supported languages.

**Prerequisite Completed Tasks:**
- REQ-243: Job Queue Module (provides `createBatchTranslationJobs`)
- REQ-244: Job Processor (handles job execution)
- Task 1.1: Content translation module structure (provides types)
- Task 1.2: Content translation orchestrator (optional but helpful)

---

## Task Inventory

| Task # | Title | Est. Points | Priority |
|--------|-------|-------------|----------|
| 1 | Create triggers directory structure | 0.5 | Required |
| 2 | Create shared trigger utilities | 1 | Required |
| 3 | Implement item translation trigger | 1 | Required |
| 4 | Implement article translation trigger | 1 | Required |
| 5 | Implement link translation trigger | 1 | Required |
| 6 | Update content-translation module index | 0.5 | Required |
| 7 | Write unit tests for item trigger | 1 | Required |
| 8 | Write unit tests for article trigger | 1 | Required |
| 9 | Write unit tests for link trigger | 1 | Required |
| 10 | Write integration tests | 1 | Optional |

**Total Estimated Points:** 9 (Required: 8)

---

## Task 1: Create Triggers Directory Structure

**File Operations:**
- CREATE: `/src/lib/content-translation/triggers/` directory

**Steps:**

1.1. Create the triggers directory:
```bash
mkdir -p src/lib/content-translation/triggers
mkdir -p src/lib/content-translation/triggers/__tests__
```

1.2. Verify the content-translation directory already exists with:
- `/src/lib/content-translation/index.ts`
- `/src/lib/content-translation/content-translation.types.ts`

**Acceptance Criteria:**
- [ ] Directory `/src/lib/content-translation/triggers/` exists
- [ ] Directory `/src/lib/content-translation/triggers/__tests__/` exists for tests

---

## Task 2: Create Shared Trigger Utilities

**File:** `/src/lib/content-translation/triggers/trigger-utils.ts`

**Purpose:** Provide shared constants and helper functions used by all entity triggers.

**Steps:**

2.1. Create the file with the following content:

```typescript
/**
 * Shared utilities for entity translation triggers
 * Part of REQ-340: Entity-Specific Translation Triggers
 *
 * Created: 2026-01-19
 */

import type { SupportedLanguage } from '@/lib/job-queue';

/** All supported languages for translation */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/**
 * Type guard to check if a string is a valid supported language
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Calculate target languages by excluding source language from all supported languages
 * @param sourceLanguage - The language to exclude
 * @returns Array of target languages (5 languages)
 */
export function getTargetLanguages(sourceLanguage: SupportedLanguage): SupportedLanguage[] {
  return SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage);
}

/**
 * Validate and normalize source language
 * Returns the language if valid, defaults to 'en' if invalid
 */
export function normalizeSourceLanguage(lang: string | null | undefined): SupportedLanguage {
  if (lang && isSupportedLanguage(lang)) {
    return lang;
  }
  console.warn(`TRIGGER_UTILS: Invalid source language "${lang}", defaulting to "en"`);
  return 'en';
}

/**
 * Standardized result interface for trigger functions
 * Matches the QueueTranslationResult from content-translation.types.ts
 */
export interface TriggerResult {
  success: boolean;
  jobIds: string[];
  queuedLanguages: SupportedLanguage[];
  error?: string;
}

/**
 * Create an error result for trigger functions
 */
export function createErrorResult(error: string): TriggerResult {
  return {
    success: false,
    jobIds: [],
    queuedLanguages: [],
    error,
  };
}

/**
 * Create a success result from job queue result
 */
export function createSuccessResult(
  jobIds: string[],
  queuedLanguages: SupportedLanguage[]
): TriggerResult {
  return {
    success: true,
    jobIds,
    queuedLanguages,
  };
}
```

**Acceptance Criteria:**
- [ ] File exports `SUPPORTED_LANGUAGES` constant array
- [ ] File exports `isSupportedLanguage` type guard function
- [ ] File exports `getTargetLanguages` helper function
- [ ] File exports `normalizeSourceLanguage` validation function
- [ ] File exports `TriggerResult` interface
- [ ] File exports `createErrorResult` and `createSuccessResult` helper functions

---

## Task 3: Implement Item Translation Trigger

**File:** `/src/lib/content-translation/triggers/item-trigger.ts`

**Purpose:** Trigger translation jobs for item `name` and `description` fields.

**Steps:**

3.1. Create the file with imports:

```typescript
/**
 * Item Translation Trigger
 * Part of REQ-340: Entity-Specific Translation Triggers
 *
 * Queues translation jobs for item name and description fields
 * across all supported languages.
 *
 * Created: 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  createBatchTranslationJobs,
  type SupportedLanguage
} from '@/lib/job-queue';
import {
  normalizeSourceLanguage,
  getTargetLanguages,
  createErrorResult,
  createSuccessResult,
  type TriggerResult,
} from './trigger-utils';
```

3.2. Add the main trigger function:

```typescript
/**
 * Triggers translation jobs for an item's translatable fields
 *
 * @param itemId - UUID of the item to translate
 * @param sourceLanguage - ISO 639-1 language code of the source content
 * @returns Promise<TriggerResult> with job IDs and status
 *
 * @example
 * const result = await triggerItemTranslation('item-uuid', 'en');
 * if (result.success) {
 *   console.log('Queued jobs:', result.jobIds);
 * }
 */
export async function triggerItemTranslation(
  itemId: string,
  sourceLanguage: SupportedLanguage | string
): Promise<TriggerResult> {
  const logPrefix = 'ITEM_TRIGGER';

  try {
    // Validate and normalize source language
    const normalizedSource = normalizeSourceLanguage(sourceLanguage);

    console.log(`${logPrefix}: Starting translation trigger`, {
      itemId,
      sourceLanguage: normalizedSource,
    });

    // Step 1: Fetch item from database
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('id, name, description')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      console.error(`${logPrefix}: Database error fetching item`, fetchError);
      return createErrorResult(`Database error: ${fetchError.message}`);
    }

    if (!item) {
      console.warn(`${logPrefix}: Item not found`, { itemId });
      return createErrorResult('Item not found');
    }

    // Step 2: Validate item has content to translate
    if (!item.name && !item.description) {
      console.warn(`${logPrefix}: Item has no translatable content`, { itemId });
      return createErrorResult('Item has no translatable content');
    }

    // Step 3: Calculate target languages
    const targetLanguages = getTargetLanguages(normalizedSource);

    console.log(`${logPrefix}: Queueing translation jobs`, {
      itemId,
      sourceLanguage: normalizedSource,
      targetLanguages,
      fieldsToTranslate: ['name', 'description'].filter(f => item[f as keyof typeof item]),
    });

    // Step 4: Create batch translation jobs
    const result = await createBatchTranslationJobs({
      entityType: 'item',
      entityId: itemId,
      sourceLanguage: normalizedSource,
      targetLanguages,
    });

    if (!result.success) {
      console.error(`${logPrefix}: Failed to queue translation jobs`, {
        itemId,
        error: result.error,
      });
      return createErrorResult(`Failed to queue jobs: ${result.error}`);
    }

    const jobIds = result.data?.map(job => job.id) || [];
    const queuedLanguages = result.data?.map(job => job.targetLanguage) || [];

    console.log(`${logPrefix}: Translation jobs queued successfully`, {
      itemId,
      jobCount: jobIds.length,
      queuedLanguages,
    });

    return createSuccessResult(jobIds, queuedLanguages);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${logPrefix}: Exception in trigger`, { itemId, error });
    return createErrorResult(`Exception: ${message}`);
  }
}
```

3.3. Export the function at the bottom:

```typescript
export type { TriggerResult };
```

**Acceptance Criteria:**
- [ ] Function accepts `itemId` (string) and `sourceLanguage` (SupportedLanguage | string)
- [ ] Function returns `Promise<TriggerResult>`
- [ ] Fetches item from database with `id`, `name`, `description` fields
- [ ] Returns error result with message "Item not found" when item doesn't exist
- [ ] Returns error result with message when item has no translatable content
- [ ] Calls `createBatchTranslationJobs` with entity type 'item'
- [ ] Returns success result with job IDs and queued languages
- [ ] Handles database errors gracefully
- [ ] Logs operations for debugging/monitoring

---

## Task 4: Implement Article Translation Trigger

**File:** `/src/lib/content-translation/triggers/article-trigger.ts`

**Purpose:** Trigger translation jobs for article `title` and `description` fields.

**Steps:**

4.1. Create the file:

```typescript
/**
 * Article Translation Trigger
 * Part of REQ-340: Entity-Specific Translation Triggers
 *
 * Queues translation jobs for article title and description fields
 * across all supported languages.
 *
 * Created: 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  createBatchTranslationJobs,
  type SupportedLanguage
} from '@/lib/job-queue';
import {
  normalizeSourceLanguage,
  getTargetLanguages,
  createErrorResult,
  createSuccessResult,
  type TriggerResult,
} from './trigger-utils';

/**
 * Triggers translation jobs for an article's translatable fields
 *
 * @param articleId - UUID of the article to translate
 * @param sourceLanguage - ISO 639-1 language code of the source content
 * @returns Promise<TriggerResult> with job IDs and status
 *
 * @example
 * const result = await triggerArticleTranslation('article-uuid', 'fr');
 * if (result.success) {
 *   console.log('Queued jobs:', result.jobIds);
 * }
 */
export async function triggerArticleTranslation(
  articleId: string,
  sourceLanguage: SupportedLanguage | string
): Promise<TriggerResult> {
  const logPrefix = 'ARTICLE_TRIGGER';

  try {
    // Validate and normalize source language
    const normalizedSource = normalizeSourceLanguage(sourceLanguage);

    console.log(`${logPrefix}: Starting translation trigger`, {
      articleId,
      sourceLanguage: normalizedSource,
    });

    // Step 1: Fetch article from database
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('item_articles')
      .select('id, title, description')
      .eq('id', articleId)
      .single();

    if (fetchError) {
      console.error(`${logPrefix}: Database error fetching article`, fetchError);
      return createErrorResult(`Database error: ${fetchError.message}`);
    }

    if (!article) {
      console.warn(`${logPrefix}: Article not found`, { articleId });
      return createErrorResult('Article not found');
    }

    // Step 2: Validate article has content to translate
    if (!article.title && !article.description) {
      console.warn(`${logPrefix}: Article has no translatable content`, { articleId });
      return createErrorResult('Article has no translatable content');
    }

    // Step 3: Calculate target languages
    const targetLanguages = getTargetLanguages(normalizedSource);

    console.log(`${logPrefix}: Queueing translation jobs`, {
      articleId,
      sourceLanguage: normalizedSource,
      targetLanguages,
      fieldsToTranslate: ['title', 'description'].filter(f => article[f as keyof typeof article]),
    });

    // Step 4: Create batch translation jobs
    const result = await createBatchTranslationJobs({
      entityType: 'article',
      entityId: articleId,
      sourceLanguage: normalizedSource,
      targetLanguages,
    });

    if (!result.success) {
      console.error(`${logPrefix}: Failed to queue translation jobs`, {
        articleId,
        error: result.error,
      });
      return createErrorResult(`Failed to queue jobs: ${result.error}`);
    }

    const jobIds = result.data?.map(job => job.id) || [];
    const queuedLanguages = result.data?.map(job => job.targetLanguage) || [];

    console.log(`${logPrefix}: Translation jobs queued successfully`, {
      articleId,
      jobCount: jobIds.length,
      queuedLanguages,
    });

    return createSuccessResult(jobIds, queuedLanguages);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${logPrefix}: Exception in trigger`, { articleId, error });
    return createErrorResult(`Exception: ${message}`);
  }
}

export type { TriggerResult };
```

**Acceptance Criteria:**
- [ ] Function accepts `articleId` (string) and `sourceLanguage` (SupportedLanguage | string)
- [ ] Function returns `Promise<TriggerResult>`
- [ ] Fetches article from `item_articles` table with `id`, `title`, `description` fields
- [ ] Returns error result with message "Article not found" when article doesn't exist
- [ ] Returns error result when article has no translatable content
- [ ] Calls `createBatchTranslationJobs` with entity type 'article'
- [ ] Returns success result with job IDs and queued languages
- [ ] Handles database errors gracefully
- [ ] Logs operations for debugging/monitoring

---

## Task 5: Implement Link Translation Trigger

**File:** `/src/lib/content-translation/triggers/link-trigger.ts`

**Purpose:** Trigger translation jobs for link `title` field ONLY. URLs are explicitly excluded from translation.

**Steps:**

5.1. Create the file:

```typescript
/**
 * Link Translation Trigger
 * Part of REQ-340: Entity-Specific Translation Triggers
 *
 * Queues translation jobs for link title field ONLY.
 * URLs are explicitly NOT translated as they are language-agnostic.
 *
 * Created: 2026-01-19
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  createBatchTranslationJobs,
  type SupportedLanguage
} from '@/lib/job-queue';
import {
  normalizeSourceLanguage,
  getTargetLanguages,
  createErrorResult,
  createSuccessResult,
  type TriggerResult,
} from './trigger-utils';

/**
 * Triggers translation jobs for a link's title field
 *
 * IMPORTANT: Only the `title` field is translated. URLs are NOT translated
 * as they are language-agnostic resources.
 *
 * @param linkId - UUID of the link to translate
 * @param sourceLanguage - ISO 639-1 language code of the source content
 * @returns Promise<TriggerResult> with job IDs and status
 *
 * @example
 * const result = await triggerLinkTranslation('link-uuid', 'de');
 * if (result.success) {
 *   console.log('Queued jobs:', result.jobIds);
 * }
 */
export async function triggerLinkTranslation(
  linkId: string,
  sourceLanguage: SupportedLanguage | string
): Promise<TriggerResult> {
  const logPrefix = 'LINK_TRIGGER';

  try {
    // Validate and normalize source language
    const normalizedSource = normalizeSourceLanguage(sourceLanguage);

    console.log(`${logPrefix}: Starting translation trigger`, {
      linkId,
      sourceLanguage: normalizedSource,
    });

    // Step 1: Fetch link from database
    // NOTE: We explicitly DO NOT fetch the `url` field as it is not translated
    const { data: link, error: fetchError } = await supabaseAdmin
      .from('item_links')
      .select('id, title')  // URL deliberately excluded from translation
      .eq('id', linkId)
      .single();

    if (fetchError) {
      console.error(`${logPrefix}: Database error fetching link`, fetchError);
      return createErrorResult(`Database error: ${fetchError.message}`);
    }

    if (!link) {
      console.warn(`${logPrefix}: Link not found`, { linkId });
      return createErrorResult('Link not found');
    }

    // Step 2: Validate link has a title to translate
    if (!link.title) {
      console.warn(`${logPrefix}: Link has no title to translate`, { linkId });
      return createErrorResult('Link has no translatable content');
    }

    // Step 3: Calculate target languages
    const targetLanguages = getTargetLanguages(normalizedSource);

    console.log(`${logPrefix}: Queueing translation jobs`, {
      linkId,
      sourceLanguage: normalizedSource,
      targetLanguages,
      fieldsToTranslate: ['title'],  // Only title - URL is never translated
    });

    // Step 4: Create batch translation jobs
    const result = await createBatchTranslationJobs({
      entityType: 'link',
      entityId: linkId,
      sourceLanguage: normalizedSource,
      targetLanguages,
    });

    if (!result.success) {
      console.error(`${logPrefix}: Failed to queue translation jobs`, {
        linkId,
        error: result.error,
      });
      return createErrorResult(`Failed to queue jobs: ${result.error}`);
    }

    const jobIds = result.data?.map(job => job.id) || [];
    const queuedLanguages = result.data?.map(job => job.targetLanguage) || [];

    console.log(`${logPrefix}: Translation jobs queued successfully`, {
      linkId,
      jobCount: jobIds.length,
      queuedLanguages,
    });

    return createSuccessResult(jobIds, queuedLanguages);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${logPrefix}: Exception in trigger`, { linkId, error });
    return createErrorResult(`Exception: ${message}`);
  }
}

export type { TriggerResult };
```

**Acceptance Criteria:**
- [ ] Function accepts `linkId` (string) and `sourceLanguage` (SupportedLanguage | string)
- [ ] Function returns `Promise<TriggerResult>`
- [ ] Fetches link from `item_links` table with `id`, `title` fields ONLY
- [ ] **CRITICAL:** Does NOT fetch or translate `url` field
- [ ] Returns error result with message "Link not found" when link doesn't exist
- [ ] Returns error result when link has no title
- [ ] Calls `createBatchTranslationJobs` with entity type 'link'
- [ ] Returns success result with job IDs and queued languages
- [ ] Handles database errors gracefully
- [ ] Logs operations clearly indicating only 'title' is translated

---

## Task 6: Update Content-Translation Module Index

**File:** `/src/lib/content-translation/index.ts`

**Purpose:** Export all trigger functions for use by API routes.

**Steps:**

6.1. Add the following exports to the existing index file (if it exists) or create it:

```typescript
/**
 * Content Translation Module
 * Part of Epic 3: Dynamic Content Translation
 *
 * Created: 2026-01-19
 */

// Types (from Task 1.1)
export type {
  EntityType,
  TranslationTrigger,
  ContentToTranslate,
  TranslatableField,
  QueueTranslationOptions,
  QueueTranslationResult,
  TranslationStatusResult,
  LanguageTranslationStatus,
} from './content-translation.types';

// Orchestrator (from Task 1.2)
export { queueContentTranslations } from './content-translation';

// Entity-specific triggers (REQ-340 - Task 1.3)
export { triggerItemTranslation } from './triggers/item-trigger';
export { triggerArticleTranslation } from './triggers/article-trigger';
export { triggerLinkTranslation } from './triggers/link-trigger';

// Trigger utilities (REQ-340)
export {
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  getTargetLanguages,
  normalizeSourceLanguage,
} from './triggers/trigger-utils';
export type { TriggerResult } from './triggers/trigger-utils';
```

**Note:** If the content-translation module was not created in Task 1.1/1.2, you may need to create placeholder files or adjust imports accordingly.

**Acceptance Criteria:**
- [ ] `triggerItemTranslation` function is exported from module index
- [ ] `triggerArticleTranslation` function is exported from module index
- [ ] `triggerLinkTranslation` function is exported from module index
- [ ] `TriggerResult` type is exported from module index
- [ ] Utility functions are exported from module index
- [ ] All imports resolve correctly

---

## Task 7: Write Unit Tests for Item Trigger

**File:** `/src/lib/content-translation/triggers/__tests__/item-trigger.test.ts`

**Steps:**

7.1. Create the test file:

```typescript
/**
 * Unit Tests for Item Translation Trigger
 * Part of REQ-340: Entity-Specific Translation Triggers
 *
 * Created: 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerItemTranslation } from '../item-trigger';

// Mock supabaseAdmin
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Mock job queue
vi.mock('@/lib/job-queue', () => ({
  createBatchTranslationJobs: vi.fn(),
}));

import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs } from '@/lib/job-queue';

describe('triggerItemTranslation', () => {
  const mockItemId = 'test-item-uuid';
  const mockItem = {
    id: mockItemId,
    name: 'Coffee Maker',
    description: 'Instructions for using the coffee maker',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful translation queueing', () => {
    it('should queue translations for all target languages', async () => {
      // Setup mocks
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockItem,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      (createBatchTranslationJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: 'job-1', targetLanguage: 'fr' },
          { id: 'job-2', targetLanguage: 'es' },
          { id: 'job-3', targetLanguage: 'de' },
          { id: 'job-4', targetLanguage: 'nl' },
          { id: 'job-5', targetLanguage: 'it' },
        ],
      });

      // Execute
      const result = await triggerItemTranslation(mockItemId, 'en');

      // Verify
      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
      expect(result.queuedLanguages).toEqual(['fr', 'es', 'de', 'nl', 'it']);
      expect(result.error).toBeUndefined();

      expect(createBatchTranslationJobs).toHaveBeenCalledWith({
        entityType: 'item',
        entityId: mockItemId,
        sourceLanguage: 'en',
        targetLanguages: ['fr', 'es', 'de', 'nl', 'it'],
      });
    });

    it('should handle different source languages', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockItem,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      (createBatchTranslationJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: 'job-1', targetLanguage: 'en' },
          { id: 'job-2', targetLanguage: 'es' },
          { id: 'job-3', targetLanguage: 'de' },
          { id: 'job-4', targetLanguage: 'nl' },
          { id: 'job-5', targetLanguage: 'it' },
        ],
      });

      const result = await triggerItemTranslation(mockItemId, 'fr');

      expect(result.success).toBe(true);
      expect(result.queuedLanguages).not.toContain('fr');
      expect(result.queuedLanguages).toContain('en');
    });
  });

  describe('error handling - item not found', () => {
    it('should return error when item does not exist', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerItemTranslation('non-existent-id', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found');
      expect(result.jobIds).toEqual([]);
      expect(result.queuedLanguages).toEqual([]);
    });
  });

  describe('error handling - database errors', () => {
    it('should handle database fetch errors gracefully', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerItemTranslation(mockItemId, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
      expect(result.jobIds).toEqual([]);
    });
  });

  describe('error handling - job queue errors', () => {
    it('should handle job queue failures gracefully', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockItem,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      (createBatchTranslationJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Failed to connect to queue',
      });

      const result = await triggerItemTranslation(mockItemId, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to queue jobs');
    });
  });

  describe('source language validation', () => {
    it('should default to "en" for invalid source language', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockItem,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      (createBatchTranslationJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      await triggerItemTranslation(mockItemId, 'invalid-lang');

      expect(createBatchTranslationJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceLanguage: 'en',
        })
      );
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests pass with `npm run test`
- [ ] Covers successful translation queueing scenario
- [ ] Covers item not found scenario
- [ ] Covers database error handling
- [ ] Covers job queue error handling
- [ ] Covers source language validation/defaulting

---

## Task 8: Write Unit Tests for Article Trigger

**File:** `/src/lib/content-translation/triggers/__tests__/article-trigger.test.ts`

**Steps:**

8.1. Create the test file with similar structure to Task 7, but for articles:

```typescript
/**
 * Unit Tests for Article Translation Trigger
 * Part of REQ-340: Entity-Specific Translation Triggers
 *
 * Created: 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerArticleTranslation } from '../article-trigger';

// Mock supabaseAdmin
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Mock job queue
vi.mock('@/lib/job-queue', () => ({
  createBatchTranslationJobs: vi.fn(),
}));

import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs } from '@/lib/job-queue';

describe('triggerArticleTranslation', () => {
  const mockArticleId = 'test-article-uuid';
  const mockArticle = {
    id: mockArticleId,
    title: 'How to Use the Coffee Maker',
    description: 'Step by step instructions for brewing coffee',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful translation queueing', () => {
    it('should queue translations for all target languages', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockArticle,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      (createBatchTranslationJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: 'job-1', targetLanguage: 'fr' },
          { id: 'job-2', targetLanguage: 'es' },
          { id: 'job-3', targetLanguage: 'de' },
          { id: 'job-4', targetLanguage: 'nl' },
          { id: 'job-5', targetLanguage: 'it' },
        ],
      });

      const result = await triggerArticleTranslation(mockArticleId, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
      expect(result.queuedLanguages).toEqual(['fr', 'es', 'de', 'nl', 'it']);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('item_articles');
      expect(createBatchTranslationJobs).toHaveBeenCalledWith({
        entityType: 'article',
        entityId: mockArticleId,
        sourceLanguage: 'en',
        targetLanguages: ['fr', 'es', 'de', 'nl', 'it'],
      });
    });
  });

  describe('error handling - article not found', () => {
    it('should return error when article does not exist', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerArticleTranslation('non-existent-id', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Article not found');
    });
  });

  describe('error handling - database errors', () => {
    it('should handle database fetch errors gracefully', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Connection timeout' },
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerArticleTranslation(mockArticleId, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('error handling - no content', () => {
    it('should return error when article has no translatable content', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: mockArticleId, title: '', description: null },
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerArticleTranslation(mockArticleId, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Article has no translatable content');
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests pass with `npm run test`
- [ ] Verifies `item_articles` table is queried
- [ ] Verifies entity type 'article' is passed to job queue
- [ ] Covers article not found scenario
- [ ] Covers database error handling
- [ ] Covers no content scenario

---

## Task 9: Write Unit Tests for Link Trigger

**File:** `/src/lib/content-translation/triggers/__tests__/link-trigger.test.ts`

**Steps:**

9.1. Create the test file with special focus on URL exclusion:

```typescript
/**
 * Unit Tests for Link Translation Trigger
 * Part of REQ-340: Entity-Specific Translation Triggers
 *
 * IMPORTANT: These tests verify that ONLY the title field is translated,
 * and URLs are explicitly excluded from translation.
 *
 * Created: 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerLinkTranslation } from '../link-trigger';

// Mock supabaseAdmin
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Mock job queue
vi.mock('@/lib/job-queue', () => ({
  createBatchTranslationJobs: vi.fn(),
}));

import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs } from '@/lib/job-queue';

describe('triggerLinkTranslation', () => {
  const mockLinkId = 'test-link-uuid';
  const mockLink = {
    id: mockLinkId,
    title: 'Watch the tutorial video',
    // NOTE: url field is intentionally NOT included in mock
    // because it should NOT be fetched or translated
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful translation queueing', () => {
    it('should queue translations for title field only', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockLink,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      (createBatchTranslationJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [
          { id: 'job-1', targetLanguage: 'fr' },
          { id: 'job-2', targetLanguage: 'es' },
          { id: 'job-3', targetLanguage: 'de' },
          { id: 'job-4', targetLanguage: 'nl' },
          { id: 'job-5', targetLanguage: 'it' },
        ],
      });

      const result = await triggerLinkTranslation(mockLinkId, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('item_links');
      expect(createBatchTranslationJobs).toHaveBeenCalledWith({
        entityType: 'link',
        entityId: mockLinkId,
        sourceLanguage: 'en',
        targetLanguages: ['fr', 'es', 'de', 'nl', 'it'],
      });
    });
  });

  describe('URL exclusion verification', () => {
    it('should NOT fetch URL field from database', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockLink,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      (createBatchTranslationJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      await triggerLinkTranslation(mockLinkId, 'en');

      // Verify select was called with only id and title (no url)
      expect(mockSelect).toHaveBeenCalledWith('id, title');
    });
  });

  describe('error handling - link not found', () => {
    it('should return error when link does not exist', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerLinkTranslation('non-existent-id', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Link not found');
    });
  });

  describe('error handling - no title', () => {
    it('should return error when link has no title', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: mockLinkId, title: '' },
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerLinkTranslation(mockLinkId, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Link has no translatable content');
    });
  });

  describe('error handling - database errors', () => {
    it('should handle database fetch errors gracefully', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await triggerLinkTranslation(mockLinkId, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests pass with `npm run test`
- [ ] **CRITICAL:** Verifies `select` is called with `'id, title'` (NO url field)
- [ ] Verifies `item_links` table is queried
- [ ] Verifies entity type 'link' is passed to job queue
- [ ] Covers link not found scenario
- [ ] Covers no title scenario

---

## Task 10: Write Integration Tests (Optional)

**File:** `/src/lib/content-translation/triggers/__tests__/triggers.integration.test.ts`

**Purpose:** Test actual database interactions with a test database.

**Steps:**

10.1. Create integration test file that:
- Creates actual test entities in the database
- Calls trigger functions
- Verifies job records are created in `translation_jobs` table
- Cleans up test data after tests

**Note:** Integration tests require a test database setup and may be deferred based on project CI/CD configuration.

**Acceptance Criteria:**
- [ ] Integration tests can be run against test database
- [ ] Creates actual job records in translation_jobs table
- [ ] Verifies correct number of jobs created (5 per entity)
- [ ] Cleans up test data after execution

---

## Verification Checklist

### Pre-Implementation Verification
- [ ] `/src/lib/job-queue/index.ts` exports `createBatchTranslationJobs`
- [ ] `/src/lib/supabase.ts` exports `supabaseAdmin`
- [ ] Database tables exist: `items`, `item_articles`, `item_links`, `translation_jobs`

### Post-Implementation Verification
- [ ] All TypeScript files compile without errors
- [ ] All unit tests pass
- [ ] Manual test: Call `triggerItemTranslation` with valid item ID
- [ ] Manual test: Call `triggerArticleTranslation` with valid article ID
- [ ] Manual test: Call `triggerLinkTranslation` with valid link ID
- [ ] Verify jobs appear in `translation_jobs` table with correct entity types

---

## References

- **Overview Document:** `/docs/REQ-340-implement-entity-specific-translation-triggers-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 1, Task 1.3)
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-340)
- **Job Queue Module:** `/src/lib/job-queue/` (REQ-243)
- **Job Queue Types:** `/src/lib/job-queue/translation-jobs.types.ts`

---

## Appendix A: Complete File Listing

| # | File Path | Operation | Lines Est. |
|---|-----------|-----------|------------|
| 1 | `/src/lib/content-translation/triggers/` | CREATE DIR | - |
| 2 | `/src/lib/content-translation/triggers/__tests__/` | CREATE DIR | - |
| 3 | `/src/lib/content-translation/triggers/trigger-utils.ts` | CREATE | ~70 |
| 4 | `/src/lib/content-translation/triggers/item-trigger.ts` | CREATE | ~100 |
| 5 | `/src/lib/content-translation/triggers/article-trigger.ts` | CREATE | ~100 |
| 6 | `/src/lib/content-translation/triggers/link-trigger.ts` | CREATE | ~100 |
| 7 | `/src/lib/content-translation/index.ts` | MODIFY | +15 |
| 8 | `/src/lib/content-translation/triggers/__tests__/item-trigger.test.ts` | CREATE | ~180 |
| 9 | `/src/lib/content-translation/triggers/__tests__/article-trigger.test.ts` | CREATE | ~150 |
| 10 | `/src/lib/content-translation/triggers/__tests__/link-trigger.test.ts` | CREATE | ~170 |

**Total New Lines:** ~885
