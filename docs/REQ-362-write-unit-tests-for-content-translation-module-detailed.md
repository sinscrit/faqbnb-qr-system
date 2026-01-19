# REQ-362: Write Unit Tests for Content Translation Module - Detailed Task Breakdown

**Generated:** 2026-01-19 21:45 UTC
**Last Modified:** 2026-01-19 21:45 UTC
**Request Reference:** docs/gen_requests_epic3.md - Request #362
**Overview Document:** docs/REQ-362-write-unit-tests-for-content-translation-module-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 7, Task 7.1)
**Status:** Detailed Task Breakdown Document

---

## Document Purpose

This document provides granular, implementation-ready task breakdown for REQ-362 (Unit Tests for Content Translation Module). Each task is designed to be approximately 1 story point and can be executed by an AI coding agent or junior developer with clear, step-by-step instructions.

---

## Prerequisites

Before starting implementation, verify the following:

| Prerequisite | Verification Command | Expected Result |
|--------------|---------------------|-----------------|
| Vitest installed | `npm list vitest` | vitest@x.x.x |
| Content translation module exists | `ls src/lib/content-translation/` | Module files present |
| Job queue module exists | `ls src/lib/job-queue/` | Module files present |
| Translation service exists | `ls src/lib/translation-service/` | Module files present |

**Note:** If the content-translation module is not yet implemented, these tests can be written first (TDD approach) with pending implementations.

---

## Task Summary

| Task ID | Task Title | Estimated Points | Dependencies |
|---------|-----------|------------------|--------------|
| T1 | Create test directory structure and helper utilities | 1 | None |
| T2 | Write tests for queueContentTranslations - items entity | 1 | T1 |
| T3 | Write tests for queueContentTranslations - articles entity | 1 | T1 |
| T4 | Write tests for queueContentTranslations - links and tags entities | 1 | T1 |
| T5 | Write tests for item trigger - triggerItemTranslation | 1 | T1 |
| T6 | Write tests for article trigger - triggerArticleTranslation | 1 | T1 |
| T7 | Write tests for link trigger - triggerLinkTranslation | 1 | T1 |
| T8 | Write tests for tag trigger - triggerTagTranslation | 1 | T1 |
| T9 | Write tests for source language detection | 1 | T1 |
| T10 | Write error handling and edge case tests | 1 | T2-T9 |
| T11 | Update vitest configuration and verify coverage | 1 | T2-T10 |

**Total Estimated Points:** 11

---

## Detailed Task Specifications

### Task T1: Create Test Directory Structure and Helper Utilities

**Objective:** Set up the test directory structure and create shared mock factories for consistent test data.

**Files to Create:**
- `src/lib/content-translation/__tests__/test-helpers.ts`

**Implementation Steps:**

1. **Create test directories:**
   ```bash
   mkdir -p src/lib/content-translation/__tests__
   mkdir -p src/lib/content-translation/triggers/__tests__
   ```

2. **Create test-helpers.ts with mock factories:**

```typescript
// src/lib/content-translation/__tests__/test-helpers.ts
/**
 * Test Helpers for Content Translation Module (REQ-362)
 *
 * Provides mock factories and test utilities for content translation tests.
 *
 * @created 2026-01-19
 */

import { vi } from 'vitest';
import type { SupportedLanguage } from '@/lib/translation-service';

// Types (these should match the actual types from content-translation.types.ts)
export type EntityType = 'item' | 'article' | 'link' | 'tag';
export type TranslationTrigger = 'create' | 'update';

export interface TranslatableField {
  fieldName: string;
  value: string;
  context: {
    contentType: string;
    domainContext?: string;
  };
  maxLength?: number;
}

export interface ContentToTranslate {
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  fields: TranslatableField[];
}

export interface QueueTranslationOptions {
  content: ContentToTranslate;
  trigger: TranslationTrigger;
  excludeLanguages?: SupportedLanguage[];
  priority?: number;
}

export interface QueueTranslationResult {
  success: boolean;
  jobIds: string[];
  queuedLanguages: SupportedLanguage[];
  error?: string;
}

// Mock factory functions
export function createMockContentToTranslate(
  overrides?: Partial<ContentToTranslate>
): ContentToTranslate {
  return {
    entityType: 'item',
    entityId: 'test-item-123',
    sourceLanguage: 'en',
    fields: [
      createMockTranslatableField({ fieldName: 'name', value: 'Test Item' }),
      createMockTranslatableField({ fieldName: 'description', value: 'Test description' }),
    ],
    ...overrides,
  };
}

export function createMockTranslatableField(
  overrides?: Partial<TranslatableField>
): TranslatableField {
  return {
    fieldName: 'name',
    value: 'Test value',
    context: {
      contentType: 'item_name',
      domainContext: 'property_rental',
    },
    maxLength: 255,
    ...overrides,
  };
}

export function createMockQueueTranslationOptions(
  overrides?: Partial<QueueTranslationOptions>
): QueueTranslationOptions {
  return {
    content: createMockContentToTranslate(),
    trigger: 'create',
    ...overrides,
  };
}

export function createMockQueueTranslationResult(
  overrides?: Partial<QueueTranslationResult>
): QueueTranslationResult {
  return {
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
    ...overrides,
  };
}

export interface MockItemContent {
  id: string;
  name: string;
  description: string | null;
  public_id: string;
  property_id: string;
  source_language: SupportedLanguage;
}

export function createMockItemContent(
  overrides?: Partial<MockItemContent>
): MockItemContent {
  return {
    id: 'item-uuid-123',
    name: 'Coffee Machine',
    description: 'A modern coffee machine for making espresso.',
    public_id: 'coffee-machine',
    property_id: 'property-uuid-456',
    source_language: 'en',
    ...overrides,
  };
}

export interface MockArticleContent {
  id: string;
  title: string;
  description: string | null;
  item_id: string;
  source_language: SupportedLanguage;
}

export function createMockArticleContent(
  overrides?: Partial<MockArticleContent>
): MockArticleContent {
  return {
    id: 'article-uuid-123',
    title: 'How to Use the Coffee Machine',
    description: 'Step by step instructions for making coffee.',
    item_id: 'item-uuid-456',
    source_language: 'en',
    ...overrides,
  };
}

export interface MockLinkContent {
  id: string;
  title: string;
  url: string;
  article_id: string;
  source_language: SupportedLanguage;
}

export function createMockLinkContent(
  overrides?: Partial<MockLinkContent>
): MockLinkContent {
  return {
    id: 'link-uuid-123',
    title: 'Coffee Machine Manual PDF',
    url: 'https://example.com/manual.pdf',
    article_id: 'article-uuid-456',
    source_language: 'en',
    ...overrides,
  };
}

export interface MockUser {
  id: string;
  email: string;
  preferred_language: SupportedLanguage | null;
}

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: 'user-uuid-123',
    email: 'test@example.com',
    preferred_language: 'en',
    ...overrides,
  };
}

export interface MockAccount {
  id: string;
  name: string;
  preferred_language: SupportedLanguage | null;
}

export function createMockAccount(overrides?: Partial<MockAccount>): MockAccount {
  return {
    id: 'account-uuid-123',
    name: 'Test Account',
    preferred_language: 'en',
    ...overrides,
  };
}

// Supabase mock setup helper
export function createMockSupabase() {
  const mockInsertSelect = vi.fn();
  const mockInsert = vi.fn(() => ({ select: mockInsertSelect }));
  const mockSelectEq = vi.fn();
  const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));
  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    select: mockSelect,
  }));

  return {
    from: mockFrom,
    mockFrom,
    mockInsert,
    mockInsertSelect,
    mockSelect,
    mockSelectEq,
    setupInsertSuccess: (data: unknown[]) => {
      mockInsertSelect.mockResolvedValue({ data, error: null });
    },
    setupInsertError: (errorMessage: string) => {
      mockInsertSelect.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });
    },
    setupSelectSuccess: (data: unknown[]) => {
      mockSelectEq.mockResolvedValue({ data, error: null });
    },
    setupSelectError: (errorMessage: string) => {
      mockSelectEq.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });
    },
  };
}

// Target languages constant (excludes source)
export const ALL_TARGET_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

export function getTargetLanguages(sourceLanguage: SupportedLanguage): SupportedLanguage[] {
  return ALL_TARGET_LANGUAGES.filter((lang) => lang !== sourceLanguage);
}
```

**Verification:**
- [ ] Directory `src/lib/content-translation/__tests__/` exists
- [ ] Directory `src/lib/content-translation/triggers/__tests__/` exists
- [ ] File `src/lib/content-translation/__tests__/test-helpers.ts` exists and exports all factory functions
- [ ] TypeScript compiles without errors: `npx tsc --noEmit src/lib/content-translation/__tests__/test-helpers.ts`

**Acceptance Criteria:**
- All directories created
- test-helpers.ts exports all mock factory functions
- Factory functions return correctly typed objects
- Helper utilities are reusable across all test files

---

### Task T2: Write Tests for queueContentTranslations - Items Entity

**Objective:** Write comprehensive unit tests for the queueContentTranslations function covering item entity type.

**File to Create:**
- `src/lib/content-translation/__tests__/content-translation.test.ts`

**Implementation Steps:**

1. **Create the main test file with item entity tests:**

```typescript
// src/lib/content-translation/__tests__/content-translation.test.ts
/**
 * Unit Tests for Content Translation Orchestrator (REQ-362)
 *
 * Tests the queueContentTranslations function that orchestrates
 * translation job creation for all entity types.
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockContentToTranslate,
  createMockQueueTranslationOptions,
  createMockSupabase,
  createMockItemContent,
  getTargetLanguages,
} from './test-helpers';

// Create mock Supabase before mocking
const mockSupabase = createMockSupabase();

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Import after mocking
import { queueContentTranslations } from '../content-translation';

describe('queueContentTranslations (REQ-362)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('item entity type', () => {
    it('should queue translation jobs for all target languages', async () => {
      // Setup: 5 jobs created (all languages except source 'en')
      const mockJobs = getTargetLanguages('en').map((lang, idx) => ({
        id: `job-${idx + 1}`,
        entity_type: 'item',
        entity_id: 'test-item-123',
        source_language: 'en',
        target_language: lang,
        status: 'queued',
        priority: 100,
      }));
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'item',
          entityId: 'test-item-123',
          sourceLanguage: 'en',
        }),
        trigger: 'create',
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
      expect(result.queuedLanguages).toHaveLength(5);
      expect(result.queuedLanguages).toContain('fr');
      expect(result.queuedLanguages).toContain('es');
      expect(result.queuedLanguages).toContain('de');
      expect(result.queuedLanguages).toContain('nl');
      expect(result.queuedLanguages).toContain('it');
      expect(result.queuedLanguages).not.toContain('en'); // Source excluded
    });

    it('should include correct entity_id and entity_type in jobs', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'item',
          entityId: 'specific-item-id-456',
        }),
      });

      await queueContentTranslations(options);

      // Verify insert was called with correct entity data
      expect(mockSupabase.mockInsert).toHaveBeenCalled();
      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];

      // All jobs should have same entity_id and entity_type
      insertCall.forEach((job: { entity_id: string; entity_type: string }) => {
        expect(job.entity_id).toBe('specific-item-id-456');
        expect(job.entity_type).toBe('item');
      });
    });

    it('should include correct source_language from content', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          sourceLanguage: 'fr', // French as source
        }),
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { source_language: string }) => {
        expect(job.source_language).toBe('fr');
      });
    });

    it('should include correct target_language for each non-source language', async () => {
      const mockJobs = getTargetLanguages('en').map((lang) => ({
        id: `job-${lang}`,
        target_language: lang,
      }));
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          sourceLanguage: 'en',
        }),
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      const targetLanguages = insertCall.map((job: { target_language: string }) => job.target_language);

      expect(targetLanguages).toContain('fr');
      expect(targetLanguages).toContain('es');
      expect(targetLanguages).toContain('de');
      expect(targetLanguages).toContain('nl');
      expect(targetLanguages).toContain('it');
      expect(targetLanguages).not.toContain('en');
    });

    it('should set higher priority for create trigger', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        trigger: 'create',
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { priority: number }) => {
        expect(job.priority).toBe(100); // High priority for new content
      });
    });

    it('should set lower priority for update trigger', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        trigger: 'update',
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { priority: number }) => {
        expect(job.priority).toBe(50); // Lower priority for updates
      });
    });

    it('should respect excludeLanguages option', async () => {
      const mockJobs = [{ id: 'job-1' }, { id: 'job-2' }, { id: 'job-3' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({ sourceLanguage: 'en' }),
        excludeLanguages: ['fr', 'de'], // Exclude French and German
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      const targetLanguages = insertCall.map((job: { target_language: string }) => job.target_language);

      expect(targetLanguages).not.toContain('fr');
      expect(targetLanguages).not.toContain('de');
      expect(targetLanguages).toContain('es');
      expect(targetLanguages).toContain('nl');
      expect(targetLanguages).toContain('it');
    });

    it('should respect custom priority override', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        trigger: 'create',
        priority: 75, // Custom priority
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { priority: number }) => {
        expect(job.priority).toBe(75);
      });
    });

    it('should return job IDs for all queued jobs', async () => {
      const mockJobs = [
        { id: 'job-uuid-1' },
        { id: 'job-uuid-2' },
        { id: 'job-uuid-3' },
        { id: 'job-uuid-4' },
        { id: 'job-uuid-5' },
      ];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions();
      const result = await queueContentTranslations(options);

      expect(result.jobIds).toEqual([
        'job-uuid-1',
        'job-uuid-2',
        'job-uuid-3',
        'job-uuid-4',
        'job-uuid-5',
      ]);
    });

    it('should return queued languages in result', async () => {
      const mockJobs = getTargetLanguages('en').map((lang) => ({
        id: `job-${lang}`,
        target_language: lang,
      }));
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({ sourceLanguage: 'en' }),
      });

      const result = await queueContentTranslations(options);

      expect(result.queuedLanguages).toEqual(
        expect.arrayContaining(['fr', 'es', 'de', 'nl', 'it'])
      );
    });
  });
});
```

**Verification:**
- [ ] Test file compiles without TypeScript errors
- [ ] Tests run successfully: `npm test -- src/lib/content-translation/__tests__/content-translation.test.ts`
- [ ] All 10 tests pass or are properly skipped if implementation is pending

**Acceptance Criteria:**
- Tests exist for queueContentTranslations function with items entity type
- Tests verify correct number of translation jobs (5 for non-source languages)
- Tests verify entity_id, entity_type, source_language, target_language fields
- Tests verify priority levels based on trigger type
- Tests verify excludeLanguages and priority override options

---

### Task T3: Write Tests for queueContentTranslations - Articles Entity

**Objective:** Add tests for article entity type to the content-translation test file.

**File to Modify:**
- `src/lib/content-translation/__tests__/content-translation.test.ts`

**Implementation Steps:**

1. **Add article entity type tests to the existing describe block:**

```typescript
// Add this describe block inside the main describe('queueContentTranslations (REQ-362)')

  describe('article entity type', () => {
    it('should queue translation jobs for all target languages', async () => {
      const mockJobs = getTargetLanguages('en').map((lang, idx) => ({
        id: `article-job-${idx + 1}`,
        entity_type: 'article',
        entity_id: 'test-article-123',
        source_language: 'en',
        target_language: lang,
        status: 'queued',
      }));
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'article',
          entityId: 'test-article-123',
          sourceLanguage: 'en',
          fields: [
            createMockTranslatableField({ fieldName: 'title', value: 'How to Use Coffee Machine' }),
            createMockTranslatableField({ fieldName: 'description', value: 'Step by step guide' }),
          ],
        }),
        trigger: 'create',
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
      expect(result.queuedLanguages).not.toContain('en');
    });

    it('should include correct entity_id and entity_type in jobs', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'article',
          entityId: 'article-uuid-789',
        }),
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { entity_id: string; entity_type: string }) => {
        expect(job.entity_id).toBe('article-uuid-789');
        expect(job.entity_type).toBe('article');
      });
    });

    it('should handle articles with title and description fields', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const articleContent = createMockContentToTranslate({
        entityType: 'article',
        fields: [
          createMockTranslatableField({
            fieldName: 'title',
            value: 'Safety Instructions',
            context: { contentType: 'article_title', domainContext: 'property_rental_instructions' },
          }),
          createMockTranslatableField({
            fieldName: 'description',
            value: 'Important safety information',
            context: { contentType: 'article_description', domainContext: 'property_rental_instructions' },
          }),
        ],
      });

      const options = createMockQueueTranslationOptions({
        content: articleContent,
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
    });

    it('should queue with correct priority for article updates', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({ entityType: 'article' }),
        trigger: 'update',
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { priority: number }) => {
        expect(job.priority).toBe(50);
      });
    });
  });
```

2. **Import createMockTranslatableField in the imports section (if not already imported)**

**Verification:**
- [ ] Tests compile without errors
- [ ] All article entity tests pass: `npm test -- src/lib/content-translation/__tests__/content-translation.test.ts -t "article entity"`
- [ ] 4 new tests added for article entity type

**Acceptance Criteria:**
- Tests exist for queueContentTranslations with articles entity type
- Tests verify article-specific fields (title, description)
- Tests verify correct entity_id and entity_type values

---

### Task T4: Write Tests for queueContentTranslations - Links and Tags Entities

**Objective:** Add tests for link and tag entity types.

**File to Modify:**
- `src/lib/content-translation/__tests__/content-translation.test.ts`

**Implementation Steps:**

1. **Add link entity type tests:**

```typescript
  describe('link entity type', () => {
    it('should queue translation jobs for all target languages', async () => {
      const mockJobs = getTargetLanguages('en').map((lang, idx) => ({
        id: `link-job-${idx + 1}`,
        entity_type: 'link',
        entity_id: 'test-link-123',
        target_language: lang,
      }));
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'link',
          entityId: 'test-link-123',
          sourceLanguage: 'en',
          fields: [
            createMockTranslatableField({
              fieldName: 'title',
              value: 'User Manual PDF',
              context: { contentType: 'link_title', domainContext: 'property_rental_media' },
            }),
          ],
        }),
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
    });

    it('should include correct entity_id and entity_type in jobs', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'link',
          entityId: 'link-uuid-321',
        }),
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { entity_id: string; entity_type: string }) => {
        expect(job.entity_id).toBe('link-uuid-321');
        expect(job.entity_type).toBe('link');
      });
    });

    it('should handle links with title field only (no URL translation)', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const linkContent = createMockContentToTranslate({
        entityType: 'link',
        fields: [
          createMockTranslatableField({
            fieldName: 'title',
            value: 'Video Tutorial',
            context: { contentType: 'link_title' },
          }),
        ],
      });

      const options = createMockQueueTranslationOptions({ content: linkContent });
      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
    });
  });

  describe('tag entity type', () => {
    it('should queue translation jobs for all target languages', async () => {
      const mockJobs = getTargetLanguages('en').map((lang, idx) => ({
        id: `tag-job-${idx + 1}`,
        entity_type: 'tag',
        entity_id: 'kitchen-appliance',
        target_language: lang,
      }));
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'tag',
          entityId: 'kitchen-appliance', // tag_key as entityId
          sourceLanguage: 'en',
          fields: [
            createMockTranslatableField({
              fieldName: 'value',
              value: 'Kitchen Appliance',
              context: { contentType: 'tag', domainContext: 'property_rental_categorization' },
            }),
          ],
        }),
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(5);
    });

    it('should include correct entity_id (tag_key) and entity_type in jobs', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          entityType: 'tag',
          entityId: 'coffee-maker', // tag_key
        }),
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { entity_id: string; entity_type: string }) => {
        expect(job.entity_id).toBe('coffee-maker');
        expect(job.entity_type).toBe('tag');
      });
    });

    it('should handle tag with single value field', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const tagContent = createMockContentToTranslate({
        entityType: 'tag',
        fields: [
          createMockTranslatableField({
            fieldName: 'value',
            value: 'Entertainment',
            context: { contentType: 'tag' },
          }),
        ],
      });

      const options = createMockQueueTranslationOptions({ content: tagContent });
      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
    });

    it('should use lower priority for batch tag translations', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({ entityType: 'tag' }),
        trigger: 'create',
        priority: 25, // Batch import priority
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      insertCall.forEach((job: { priority: number }) => {
        expect(job.priority).toBe(25);
      });
    });
  });
```

**Verification:**
- [ ] Tests compile without errors
- [ ] Link entity tests pass: `npm test -- src/lib/content-translation/__tests__/content-translation.test.ts -t "link entity"`
- [ ] Tag entity tests pass: `npm test -- src/lib/content-translation/__tests__/content-translation.test.ts -t "tag entity"`
- [ ] 7 new tests added (3 for links, 4 for tags)

**Acceptance Criteria:**
- Tests exist for queueContentTranslations with link and tag entity types
- Tests verify link-specific fields (title only, no URL)
- Tests verify tag-specific handling with tag_key as entityId
- Tests verify correct priority handling

---

### Task T5: Write Tests for Item Trigger - triggerItemTranslation

**Objective:** Write comprehensive unit tests for the item-specific translation trigger.

**File to Create:**
- `src/lib/content-translation/triggers/__tests__/item-trigger.test.ts`

**Implementation Steps:**

1. **Create the item trigger test file:**

```typescript
// src/lib/content-translation/triggers/__tests__/item-trigger.test.ts
/**
 * Unit Tests for Item Translation Trigger (REQ-362)
 *
 * Tests the triggerItemTranslation function that extracts
 * translatable fields from item entities.
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockItemContent,
  createMockSupabase,
  createMockUser,
} from '../../__tests__/test-helpers';

// Create mock Supabase
const mockSupabase = createMockSupabase();

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock the main orchestrator
vi.mock('../../content-translation', () => ({
  queueContentTranslations: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
}));

import { triggerItemTranslation } from '../item-trigger';
import { queueContentTranslations } from '../../content-translation';

describe('triggerItemTranslation (REQ-362)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('field extraction', () => {
    it('should extract name field with item_name content type', async () => {
      const mockItem = createMockItemContent({
        name: 'Espresso Machine',
      });
      mockSupabase.setupSelectSuccess([mockItem]);

      await triggerItemTranslation(mockItem.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'name',
                value: 'Espresso Machine',
                context: expect.objectContaining({
                  contentType: 'item_name',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should extract description field with item_description content type', async () => {
      const mockItem = createMockItemContent({
        description: 'A premium espresso machine for making coffee.',
      });
      mockSupabase.setupSelectSuccess([mockItem]);

      await triggerItemTranslation(mockItem.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                value: 'A premium espresso machine for making coffee.',
                context: expect.objectContaining({
                  contentType: 'item_description',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should handle null description gracefully', async () => {
      const mockItem = createMockItemContent({
        name: 'Simple Item',
        description: null,
      });
      mockSupabase.setupSelectSuccess([mockItem]);

      const result = await triggerItemTranslation(mockItem.id, 'en');

      expect(result.success).toBe(true);
      // Should only queue name field, not description
      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.not.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                value: null,
              }),
            ]),
          }),
        })
      );
    });

    it('should handle undefined description gracefully', async () => {
      const mockItem = {
        id: 'item-123',
        name: 'Test Item',
        // description is undefined
        public_id: 'test-item',
        property_id: 'property-123',
        source_language: 'en' as const,
      };
      mockSupabase.setupSelectSuccess([mockItem]);

      const result = await triggerItemTranslation(mockItem.id, 'en');

      expect(result.success).toBe(true);
    });

    it('should include maxLength constraint for name field', async () => {
      const mockItem = createMockItemContent();
      mockSupabase.setupSelectSuccess([mockItem]);

      await triggerItemTranslation(mockItem.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'name',
                maxLength: 255,
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('TranslatableField construction', () => {
    it('should set correct context for name field', async () => {
      const mockItem = createMockItemContent();
      mockSupabase.setupSelectSuccess([mockItem]);

      await triggerItemTranslation(mockItem.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'name',
                context: {
                  contentType: 'item_name',
                  domainContext: 'property_rental_appliances',
                },
              }),
            ]),
          }),
        })
      );
    });

    it('should set correct context for description field', async () => {
      const mockItem = createMockItemContent({
        description: 'Test description',
      });
      mockSupabase.setupSelectSuccess([mockItem]);

      await triggerItemTranslation(mockItem.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                context: {
                  contentType: 'item_description',
                  domainContext: 'property_rental_appliances',
                },
              }),
            ]),
          }),
        })
      );
    });

    it('should include domain context for property rental', async () => {
      const mockItem = createMockItemContent();
      mockSupabase.setupSelectSuccess([mockItem]);

      await triggerItemTranslation(mockItem.id, 'en');

      const callArgs = vi.mocked(queueContentTranslations).mock.calls[0][0];
      callArgs.content.fields.forEach((field) => {
        expect(field.context.domainContext).toContain('property_rental');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string name', async () => {
      const mockItem = createMockItemContent({
        name: '',
        description: 'Some description',
      });
      mockSupabase.setupSelectSuccess([mockItem]);

      const result = await triggerItemTranslation(mockItem.id, 'en');

      // Should still succeed but may skip empty name field
      expect(result.success).toBe(true);
    });

    it('should handle special characters in name', async () => {
      const mockItem = createMockItemContent({
        name: 'Café Machine (50°C) & "Premium" Edition™',
      });
      mockSupabase.setupSelectSuccess([mockItem]);

      await triggerItemTranslation(mockItem.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'name',
                value: 'Café Machine (50°C) & "Premium" Edition™',
              }),
            ]),
          }),
        })
      );
    });

    it('should handle maximum field length content', async () => {
      const longName = 'A'.repeat(255);
      const mockItem = createMockItemContent({
        name: longName,
      });
      mockSupabase.setupSelectSuccess([mockItem]);

      const result = await triggerItemTranslation(mockItem.id, 'en');

      expect(result.success).toBe(true);
      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'name',
                value: longName,
              }),
            ]),
          }),
        })
      );
    });

    it('should return error when item not found', async () => {
      mockSupabase.setupSelectSuccess([]);

      const result = await triggerItemTranslation('non-existent-id', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should return error on database failure', async () => {
      mockSupabase.setupSelectError('Database connection failed');

      const result = await triggerItemTranslation('item-123', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

**Verification:**
- [ ] Test file compiles without errors
- [ ] Tests run successfully: `npm test -- src/lib/content-translation/triggers/__tests__/item-trigger.test.ts`
- [ ] All 13 tests pass or are properly documented as pending

**Acceptance Criteria:**
- Tests verify field extraction for name and description
- Tests verify null/undefined handling
- Tests verify context construction
- Tests include edge cases (empty strings, special characters, max length)

---

### Task T6: Write Tests for Article Trigger - triggerArticleTranslation

**Objective:** Write comprehensive unit tests for the article-specific translation trigger.

**File to Create:**
- `src/lib/content-translation/triggers/__tests__/article-trigger.test.ts`

**Implementation Steps:**

1. **Create the article trigger test file:**

```typescript
// src/lib/content-translation/triggers/__tests__/article-trigger.test.ts
/**
 * Unit Tests for Article Translation Trigger (REQ-362)
 *
 * Tests the triggerArticleTranslation function that extracts
 * translatable fields from article entities.
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockArticleContent,
  createMockSupabase,
} from '../../__tests__/test-helpers';

// Create mock Supabase
const mockSupabase = createMockSupabase();

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock the main orchestrator
vi.mock('../../content-translation', () => ({
  queueContentTranslations: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
}));

import { triggerArticleTranslation } from '../article-trigger';
import { queueContentTranslations } from '../../content-translation';

describe('triggerArticleTranslation (REQ-362)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('field extraction', () => {
    it('should extract title field with article_title content type', async () => {
      const mockArticle = createMockArticleContent({
        title: 'How to Use the Washing Machine',
      });
      mockSupabase.setupSelectSuccess([mockArticle]);

      await triggerArticleTranslation(mockArticle.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'title',
                value: 'How to Use the Washing Machine',
                context: expect.objectContaining({
                  contentType: 'article_title',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should extract description field with article_description content type', async () => {
      const mockArticle = createMockArticleContent({
        description: 'Step-by-step instructions for operating the washing machine.',
      });
      mockSupabase.setupSelectSuccess([mockArticle]);

      await triggerArticleTranslation(mockArticle.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                value: 'Step-by-step instructions for operating the washing machine.',
                context: expect.objectContaining({
                  contentType: 'article_description',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should handle null description gracefully', async () => {
      const mockArticle = createMockArticleContent({
        title: 'Quick Start Guide',
        description: null,
      });
      mockSupabase.setupSelectSuccess([mockArticle]);

      const result = await triggerArticleTranslation(mockArticle.id, 'en');

      expect(result.success).toBe(true);
      // Should only queue title field, not description
    });
  });

  describe('TranslatableField construction', () => {
    it('should set correct context for title field', async () => {
      const mockArticle = createMockArticleContent();
      mockSupabase.setupSelectSuccess([mockArticle]);

      await triggerArticleTranslation(mockArticle.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'title',
                context: {
                  contentType: 'article_title',
                  domainContext: 'property_rental_instructions',
                },
              }),
            ]),
          }),
        })
      );
    });

    it('should set correct context for description field', async () => {
      const mockArticle = createMockArticleContent({
        description: 'Test description',
      });
      mockSupabase.setupSelectSuccess([mockArticle]);

      await triggerArticleTranslation(mockArticle.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                context: {
                  contentType: 'article_description',
                  domainContext: 'property_rental_instructions',
                },
              }),
            ]),
          }),
        })
      );
    });

    it('should include instruction domain context', async () => {
      const mockArticle = createMockArticleContent();
      mockSupabase.setupSelectSuccess([mockArticle]);

      await triggerArticleTranslation(mockArticle.id, 'en');

      const callArgs = vi.mocked(queueContentTranslations).mock.calls[0][0];
      callArgs.content.fields.forEach((field) => {
        expect(field.context.domainContext).toContain('instructions');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string title', async () => {
      const mockArticle = createMockArticleContent({
        title: '',
        description: 'Some description',
      });
      mockSupabase.setupSelectSuccess([mockArticle]);

      const result = await triggerArticleTranslation(mockArticle.id, 'en');

      expect(result.success).toBe(true);
    });

    it('should handle articles with minimal fields', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Basic Title',
        description: null,
        item_id: 'item-456',
        source_language: 'en' as const,
      };
      mockSupabase.setupSelectSuccess([mockArticle]);

      const result = await triggerArticleTranslation(mockArticle.id, 'en');

      expect(result.success).toBe(true);
    });

    it('should return error when article not found', async () => {
      mockSupabase.setupSelectSuccess([]);

      const result = await triggerArticleTranslation('non-existent-id', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle very long descriptions', async () => {
      const longDescription = 'A'.repeat(5000);
      const mockArticle = createMockArticleContent({
        description: longDescription,
      });
      mockSupabase.setupSelectSuccess([mockArticle]);

      const result = await triggerArticleTranslation(mockArticle.id, 'en');

      expect(result.success).toBe(true);
    });
  });
});
```

**Verification:**
- [ ] Test file compiles without errors
- [ ] Tests run successfully: `npm test -- src/lib/content-translation/triggers/__tests__/article-trigger.test.ts`
- [ ] All 11 tests pass

**Acceptance Criteria:**
- Tests verify field extraction for title and description
- Tests verify null handling
- Tests verify context construction with instruction domain
- Tests include edge cases

---

### Task T7: Write Tests for Link Trigger - triggerLinkTranslation

**Objective:** Write unit tests for the link-specific translation trigger.

**File to Create:**
- `src/lib/content-translation/triggers/__tests__/link-trigger.test.ts`

**Implementation Steps:**

1. **Create the link trigger test file:**

```typescript
// src/lib/content-translation/triggers/__tests__/link-trigger.test.ts
/**
 * Unit Tests for Link Translation Trigger (REQ-362)
 *
 * Tests the triggerLinkTranslation function that extracts
 * translatable fields from link entities.
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockLinkContent,
  createMockSupabase,
} from '../../__tests__/test-helpers';

// Create mock Supabase
const mockSupabase = createMockSupabase();

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock the main orchestrator
vi.mock('../../content-translation', () => ({
  queueContentTranslations: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
}));

import { triggerLinkTranslation } from '../link-trigger';
import { queueContentTranslations } from '../../content-translation';

describe('triggerLinkTranslation (REQ-362)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('field extraction', () => {
    it('should extract title field only', async () => {
      const mockLink = createMockLinkContent({
        title: 'User Manual PDF',
        url: 'https://example.com/manual.pdf',
      });
      mockSupabase.setupSelectSuccess([mockLink]);

      await triggerLinkTranslation(mockLink.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'title',
                value: 'User Manual PDF',
              }),
            ]),
          }),
        })
      );
    });

    it('should NOT extract or translate URL field', async () => {
      const mockLink = createMockLinkContent({
        title: 'Video Tutorial',
        url: 'https://youtube.com/watch?v=abc123',
      });
      mockSupabase.setupSelectSuccess([mockLink]);

      await triggerLinkTranslation(mockLink.id, 'en');

      const callArgs = vi.mocked(queueContentTranslations).mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f) => f.fieldName);

      expect(fieldNames).toContain('title');
      expect(fieldNames).not.toContain('url');
    });
  });

  describe('context', () => {
    it('should set link_title content type', async () => {
      const mockLink = createMockLinkContent();
      mockSupabase.setupSelectSuccess([mockLink]);

      await triggerLinkTranslation(mockLink.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'title',
                context: expect.objectContaining({
                  contentType: 'link_title',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should include media domain context', async () => {
      const mockLink = createMockLinkContent();
      mockSupabase.setupSelectSuccess([mockLink]);

      await triggerLinkTranslation(mockLink.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                context: expect.objectContaining({
                  domainContext: 'property_rental_media',
                }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle links with empty title', async () => {
      const mockLink = createMockLinkContent({
        title: '',
      });
      mockSupabase.setupSelectSuccess([mockLink]);

      const result = await triggerLinkTranslation(mockLink.id, 'en');

      // Should handle gracefully
      expect(result.success).toBe(true);
    });

    it('should handle various title formats', async () => {
      const mockLink = createMockLinkContent({
        title: 'PDF - Installation Guide (v2.1)',
      });
      mockSupabase.setupSelectSuccess([mockLink]);

      await triggerLinkTranslation(mockLink.id, 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                value: 'PDF - Installation Guide (v2.1)',
              }),
            ]),
          }),
        })
      );
    });

    it('should return error when link not found', async () => {
      mockSupabase.setupSelectSuccess([]);

      const result = await triggerLinkTranslation('non-existent-id', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
```

**Verification:**
- [ ] Test file compiles without errors
- [ ] Tests run successfully: `npm test -- src/lib/content-translation/triggers/__tests__/link-trigger.test.ts`
- [ ] All 7 tests pass

**Acceptance Criteria:**
- Tests verify only title field is extracted
- Tests verify URL is NOT translated
- Tests verify link_title content type and media domain context

---

### Task T8: Write Tests for Tag Trigger - triggerTagTranslation

**Objective:** Write unit tests for the tag-specific translation trigger.

**File to Create:**
- `src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts`

**Implementation Steps:**

1. **Create the tag trigger test file:**

```typescript
// src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts
/**
 * Unit Tests for Tag Translation Trigger (REQ-362)
 *
 * Tests the triggerTagTranslation function that handles
 * translation of user-created tags.
 *
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockSupabase } from '../../__tests__/test-helpers';

// Create mock Supabase
const mockSupabase = createMockSupabase();

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock the main orchestrator
const mockQueueContentTranslations = vi.fn().mockResolvedValue({
  success: true,
  jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
  queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
});

vi.mock('../../content-translation', () => ({
  queueContentTranslations: mockQueueContentTranslations,
}));

import { triggerTagTranslation } from '../tag-trigger';
import { queueContentTranslations } from '../../content-translation';

describe('triggerTagTranslation (REQ-362)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('translation check', () => {
    it('should check if translation already exists', async () => {
      // No existing translation
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('coffee-maker', 'Coffee Maker', 'en');

      // Should have queried for existing translations
      expect(mockSupabase.mockFrom).toHaveBeenCalledWith('tag_translations');
    });

    it('should skip queuing if translation exists for all languages', async () => {
      // All translations already exist
      const existingTranslations = [
        { tag_key: 'coffee-maker', language: 'fr' },
        { tag_key: 'coffee-maker', language: 'es' },
        { tag_key: 'coffee-maker', language: 'de' },
        { tag_key: 'coffee-maker', language: 'nl' },
        { tag_key: 'coffee-maker', language: 'it' },
      ];
      mockSupabase.setupSelectSuccess(existingTranslations);

      const result = await triggerTagTranslation('coffee-maker', 'Coffee Maker', 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(queueContentTranslations).not.toHaveBeenCalled();
    });

    it('should queue if no translation exists', async () => {
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('kitchen-appliance', 'Kitchen Appliance', 'en');

      expect(queueContentTranslations).toHaveBeenCalled();
    });

    it('should queue only for missing languages', async () => {
      // Only French translation exists
      mockSupabase.setupSelectSuccess([
        { tag_key: 'coffee-maker', language: 'fr' },
      ]);

      await triggerTagTranslation('coffee-maker', 'Coffee Maker', 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeLanguages: expect.arrayContaining(['fr']),
        })
      );
    });
  });

  describe('system tags', () => {
    it('should skip system tags (starting with #)', async () => {
      const result = await triggerTagTranslation('#system-tag', 'System Tag', 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(queueContentTranslations).not.toHaveBeenCalled();
    });

    it('should process user tags (not starting with #)', async () => {
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('user-tag', 'User Tag', 'en');

      expect(queueContentTranslations).toHaveBeenCalled();
    });

    it('should skip tags marked as system in database', async () => {
      // Mock system tag check
      mockSupabase.setupSelectSuccess([
        { tag_key: 'safety', is_system_tag: true },
      ]);

      const result = await triggerTagTranslation('safety', 'Safety', 'en');

      expect(result.success).toBe(true);
      // Should not queue system tags
    });
  });

  describe('field construction', () => {
    it('should set tag content type', async () => {
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('entertainment', 'Entertainment', 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'value',
                value: 'Entertainment',
                context: expect.objectContaining({
                  contentType: 'tag',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should include categorization domain context', async () => {
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('kitchen', 'Kitchen', 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                context: expect.objectContaining({
                  domainContext: 'property_rental_categorization',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should use tag_key as entityId', async () => {
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('outdoor-furniture', 'Outdoor Furniture', 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'tag',
            entityId: 'outdoor-furniture',
          }),
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle tag with special characters', async () => {
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('wifi-&-internet', 'WiFi & Internet', 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityId: 'wifi-&-internet',
            fields: expect.arrayContaining([
              expect.objectContaining({
                value: 'WiFi & Internet',
              }),
            ]),
          }),
        })
      );
    });

    it('should handle empty tag value gracefully', async () => {
      const result = await triggerTagTranslation('empty-tag', '', 'en');

      expect(result.success).toBe(true);
      // Should skip empty values
      expect(queueContentTranslations).not.toHaveBeenCalled();
    });

    it('should normalize tag key to lowercase', async () => {
      mockSupabase.setupSelectSuccess([]);

      await triggerTagTranslation('UPPER-CASE-TAG', 'Upper Case Tag', 'en');

      expect(queueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityId: 'upper-case-tag', // Normalized
          }),
        })
      );
    });
  });
});
```

**Verification:**
- [ ] Test file compiles without errors
- [ ] Tests run successfully: `npm test -- src/lib/content-translation/triggers/__tests__/tag-trigger.test.ts`
- [ ] All 14 tests pass

**Acceptance Criteria:**
- Tests verify translation existence check before queuing
- Tests verify system tag skipping
- Tests verify correct field construction with tag content type
- Tests verify tag key normalization

---

### Task T9: Write Tests for Source Language Detection

**Objective:** Write comprehensive unit tests for the source language detection utility.

**File to Create:**
- `src/lib/content-translation/__tests__/source-language.test.ts`

**Implementation Steps:**

1. **Create the source language detection test file:**

```typescript
// src/lib/content-translation/__tests__/source-language.test.ts
/**
 * Unit Tests for Source Language Detection (REQ-362)
 *
 * Tests the detectSourceLanguage function that determines
 * the source language for content translation.
 *
 * @created 2026-01-19
 */

import { describe, it, expect } from 'vitest';
import {
  createMockUser,
  createMockAccount,
} from './test-helpers';
import type { SupportedLanguage } from '@/lib/translation-service';

// Import the function under test
import { detectSourceLanguage } from '../source-language';

describe('detectSourceLanguage (REQ-362)', () => {
  describe('priority order', () => {
    it('should use override when provided', () => {
      const user = createMockUser({ preferred_language: 'fr' });
      const account = createMockAccount({ preferred_language: 'de' });

      const result = detectSourceLanguage(user, account, 'es');

      expect(result).toBe('es');
    });

    it('should use user preferred_language when no override', () => {
      const user = createMockUser({ preferred_language: 'fr' });
      const account = createMockAccount({ preferred_language: 'de' });

      const result = detectSourceLanguage(user, account);

      expect(result).toBe('fr');
    });

    it('should use account preferred_language when user has none', () => {
      const user = createMockUser({ preferred_language: null });
      const account = createMockAccount({ preferred_language: 'de' });

      const result = detectSourceLanguage(user, account);

      expect(result).toBe('de');
    });

    it('should default to "en" when no preferences exist', () => {
      const user = createMockUser({ preferred_language: null });
      const account = createMockAccount({ preferred_language: null });

      const result = detectSourceLanguage(user, account);

      expect(result).toBe('en');
    });
  });

  describe('override handling', () => {
    it('should prefer override over user preference', () => {
      const user = createMockUser({ preferred_language: 'fr' });
      const account = createMockAccount({ preferred_language: null });

      const result = detectSourceLanguage(user, account, 'nl');

      expect(result).toBe('nl');
    });

    it('should prefer override over account preference', () => {
      const user = createMockUser({ preferred_language: null });
      const account = createMockAccount({ preferred_language: 'de' });

      const result = detectSourceLanguage(user, account, 'it');

      expect(result).toBe('it');
    });

    it('should validate override is supported language', () => {
      const user = createMockUser({ preferred_language: 'fr' });
      const account = createMockAccount({ preferred_language: null });

      // Invalid override should fall back to user preference
      const result = detectSourceLanguage(user, account, 'invalid' as SupportedLanguage);

      expect(result).toBe('fr'); // Falls back to user preference
    });
  });

  describe('invalid language handling', () => {
    it('should return default for invalid user language code', () => {
      const user = createMockUser({ preferred_language: 'xyz' as SupportedLanguage });
      const account = createMockAccount({ preferred_language: null });

      const result = detectSourceLanguage(user, account);

      expect(result).toBe('en'); // Falls back to default
    });

    it('should return default for unsupported language code', () => {
      const user = createMockUser({ preferred_language: 'ja' as SupportedLanguage }); // Japanese not supported
      const account = createMockAccount({ preferred_language: null });

      const result = detectSourceLanguage(user, account);

      expect(result).toBe('en');
    });

    it('should handle null language preferences', () => {
      const user = createMockUser({ preferred_language: null });
      const account = createMockAccount({ preferred_language: null });

      const result = detectSourceLanguage(user, account);

      expect(result).toBe('en');
    });

    it('should handle undefined language preferences', () => {
      const user = { id: 'user-123', email: 'test@example.com' } as any;
      const account = { id: 'account-123', name: 'Test' } as any;

      const result = detectSourceLanguage(user, account);

      expect(result).toBe('en');
    });
  });

  describe('consistency', () => {
    it('should return same result for identical inputs', () => {
      const user = createMockUser({ preferred_language: 'fr' });
      const account = createMockAccount({ preferred_language: 'de' });

      const result1 = detectSourceLanguage(user, account);
      const result2 = detectSourceLanguage(user, account);
      const result3 = detectSourceLanguage(user, account);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('fr');
    });

    it('should be deterministic across multiple calls', () => {
      const results: SupportedLanguage[] = [];

      for (let i = 0; i < 10; i++) {
        const user = createMockUser({ preferred_language: 'es' });
        const account = createMockAccount({ preferred_language: 'it' });
        results.push(detectSourceLanguage(user, account));
      }

      // All results should be identical
      expect(new Set(results).size).toBe(1);
      expect(results[0]).toBe('es');
    });
  });

  describe('all supported languages', () => {
    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'] as SupportedLanguage[])(
      'should accept %s as valid override',
      (language) => {
        const user = createMockUser({ preferred_language: null });
        const account = createMockAccount({ preferred_language: null });

        const result = detectSourceLanguage(user, account, language);

        expect(result).toBe(language);
      }
    );

    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'] as SupportedLanguage[])(
      'should accept %s as valid user preference',
      (language) => {
        const user = createMockUser({ preferred_language: language });
        const account = createMockAccount({ preferred_language: null });

        const result = detectSourceLanguage(user, account);

        expect(result).toBe(language);
      }
    );

    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'] as SupportedLanguage[])(
      'should accept %s as valid account preference',
      (language) => {
        const user = createMockUser({ preferred_language: null });
        const account = createMockAccount({ preferred_language: language });

        const result = detectSourceLanguage(user, account);

        expect(result).toBe(language);
      }
    );
  });
});
```

**Verification:**
- [ ] Test file compiles without errors
- [ ] Tests run successfully: `npm test -- src/lib/content-translation/__tests__/source-language.test.ts`
- [ ] All tests pass (30+ test cases including parameterized tests)

**Acceptance Criteria:**
- Tests verify priority order: override > user > account > default
- Tests verify handling of invalid/unsupported language codes
- Tests verify null/undefined handling
- Tests verify consistency and determinism

---

### Task T10: Write Error Handling and Edge Case Tests

**Objective:** Add comprehensive error handling and edge case tests to the main test file.

**File to Modify:**
- `src/lib/content-translation/__tests__/content-translation.test.ts`

**Implementation Steps:**

1. **Add error handling and edge case describe blocks:**

```typescript
// Add these describe blocks to content-translation.test.ts

  describe('error handling', () => {
    it('should handle database error during job insertion', async () => {
      mockSupabase.setupInsertError('Database connection failed');

      const options = createMockQueueTranslationOptions();
      const result = await queueContentTranslations(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database');
    });

    it('should return error in result when queuing fails', async () => {
      mockSupabase.setupInsertError('Constraint violation');

      const options = createMockQueueTranslationOptions();
      const result = await queueContentTranslations(options);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.jobIds).toHaveLength(0);
    });

    it('should not partially queue jobs on failure', async () => {
      // Simulate failure after some jobs might have been prepared
      mockSupabase.setupInsertError('Transaction rollback');

      const options = createMockQueueTranslationOptions();
      const result = await queueContentTranslations(options);

      expect(result.success).toBe(false);
      expect(result.jobIds).toHaveLength(0);
      expect(result.queuedLanguages).toHaveLength(0);
    });

    it('should handle timeout during database operation', async () => {
      mockSupabase.mockInsertSelect.mockRejectedValue(new Error('Query timeout'));

      const options = createMockQueueTranslationOptions();
      const result = await queueContentTranslations(options);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string in fields', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          fields: [
            createMockTranslatableField({ fieldName: 'name', value: '' }),
          ],
        }),
      });

      const result = await queueContentTranslations(options);

      // Should succeed but may skip empty fields
      expect(result.success).toBe(true);
    });

    it('should handle content with special characters', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          fields: [
            createMockTranslatableField({
              fieldName: 'name',
              value: '☕ Café "Délice" & Crème Brûlée™ 50°C',
            }),
            createMockTranslatableField({
              fieldName: 'description',
              value: '日本語テスト <script>alert("XSS")</script>',
            }),
          ],
        }),
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
    });

    it('should handle very long content strings', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const longContent = 'A'.repeat(10000);
      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          fields: [
            createMockTranslatableField({ fieldName: 'description', value: longContent }),
          ],
        }),
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
    });

    it('should return empty jobIds when all languages excluded', async () => {
      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({ sourceLanguage: 'en' }),
        excludeLanguages: ['fr', 'es', 'de', 'nl', 'it'], // All non-source languages
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(result.queuedLanguages).toHaveLength(0);
    });

    it('should filter out source language from targets', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({ sourceLanguage: 'fr' }),
      });

      await queueContentTranslations(options);

      const insertCall = mockSupabase.mockInsert.mock.calls[0][0];
      const targetLanguages = insertCall.map((job: { target_language: string }) => job.target_language);

      expect(targetLanguages).not.toContain('fr');
      expect(targetLanguages.length).toBe(5); // en, es, de, nl, it
    });

    it('should handle content with no translatable fields', async () => {
      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          fields: [],
        }),
      });

      const result = await queueContentTranslations(options);

      // Should handle gracefully - either success with no jobs or specific error
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle unicode and emoji in content', async () => {
      const mockJobs = [{ id: 'job-1' }];
      mockSupabase.setupInsertSuccess(mockJobs);

      const options = createMockQueueTranslationOptions({
        content: createMockContentToTranslate({
          fields: [
            createMockTranslatableField({
              fieldName: 'name',
              value: '🏠 Vacation Home 🌴 €500/night',
            }),
          ],
        }),
      });

      const result = await queueContentTranslations(options);

      expect(result.success).toBe(true);
    });
  });
```

**Verification:**
- [ ] Tests compile without errors
- [ ] All error handling tests pass
- [ ] All edge case tests pass
- [ ] Test coverage for error paths is verified

**Acceptance Criteria:**
- Tests verify database error handling
- Tests verify partial failure prevention
- Tests verify handling of special characters, unicode, emoji
- Tests verify empty field and excluded language handling

---

### Task T11: Update Vitest Configuration and Verify Coverage

**Objective:** Update vitest configuration to include content-translation in coverage and verify all tests pass with adequate coverage.

**Files to Modify:**
- `vitest.config.ts`

**Implementation Steps:**

1. **Update vitest.config.ts to include content-translation:**

```typescript
// vitest.config.ts - Update coverage include array
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/lib/job-queue/**/*.ts',
    'src/lib/translation-service/**/*.ts',
    'src/lib/content-translation/**/*.ts', // Added for REQ-362
  ],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
},
```

2. **Run all content translation tests:**

```bash
# Run all tests
npm test -- src/lib/content-translation

# Run with coverage
npm test -- --coverage src/lib/content-translation

# Run with verbose output
npm test -- --verbose src/lib/content-translation
```

3. **Verify coverage thresholds:**

| File/Module | Required Coverage | Actual Coverage |
|-------------|-------------------|-----------------|
| content-translation.ts | 80% | TBD |
| source-language.ts | 80% | TBD |
| triggers/item-trigger.ts | 80% | TBD |
| triggers/article-trigger.ts | 80% | TBD |
| triggers/link-trigger.ts | 80% | TBD |
| triggers/tag-trigger.ts | 80% | TBD |

4. **Document test summary:**

| Test File | Test Count | Passing | Failing |
|-----------|------------|---------|---------|
| content-translation.test.ts | 30+ | TBD | TBD |
| source-language.test.ts | 20+ | TBD | TBD |
| item-trigger.test.ts | 13 | TBD | TBD |
| article-trigger.test.ts | 11 | TBD | TBD |
| link-trigger.test.ts | 7 | TBD | TBD |
| tag-trigger.test.ts | 14 | TBD | TBD |
| **Total** | **95+** | **TBD** | **TBD** |

**Verification:**
- [ ] vitest.config.ts updated with content-translation path
- [ ] All tests pass: `npm test -- src/lib/content-translation`
- [ ] Coverage report generated: `npm test -- --coverage src/lib/content-translation`
- [ ] Coverage exceeds 80% for critical functions

**Acceptance Criteria:**
- vitest.config.ts includes content-translation in coverage
- All ~95 tests pass successfully
- Coverage exceeds 80% for critical translation functions
- No TypeScript errors in test files

---

## Verification Checklist

### Final Verification Steps

Run these commands to verify complete implementation:

```bash
# 1. Check all test files exist
ls -la src/lib/content-translation/__tests__/
ls -la src/lib/content-translation/triggers/__tests__/

# 2. TypeScript compilation check
npx tsc --noEmit

# 3. Run all content translation tests
npm test -- src/lib/content-translation

# 4. Run with coverage
npm test -- --coverage src/lib/content-translation

# 5. Verify no failing tests
npm test -- src/lib/content-translation --reporter=verbose
```

### Test Summary Expectations

| Category | Expected Tests | Expected Pass Rate |
|----------|---------------|-------------------|
| queueContentTranslations - items | 10 | 100% |
| queueContentTranslations - articles | 4 | 100% |
| queueContentTranslations - links | 3 | 100% |
| queueContentTranslations - tags | 4 | 100% |
| Item trigger | 13 | 100% |
| Article trigger | 11 | 100% |
| Link trigger | 7 | 100% |
| Tag trigger | 14 | 100% |
| Source language detection | 20+ | 100% |
| Error handling & edge cases | 11 | 100% |
| **Total** | **~97** | **100%** |

---

## Acceptance Criteria Mapping

| Original Criteria | Task | Test Location |
|-------------------|------|---------------|
| Unit tests exist for queueContentTranslations - items | T2 | content-translation.test.ts |
| Unit tests exist for queueContentTranslations - articles | T3 | content-translation.test.ts |
| Unit tests exist for queueContentTranslations - links | T4 | content-translation.test.ts |
| Unit tests exist for queueContentTranslations - tags | T4 | content-translation.test.ts |
| Tests verify correct translation job count | T2-T4 | content-translation.test.ts |
| Tests verify entity_id and entity_type values | T2-T4 | content-translation.test.ts |
| Tests verify source_language value | T2-T4 | content-translation.test.ts |
| Tests verify target_language values | T2-T4 | content-translation.test.ts |
| Tests verify priority levels | T2-T4 | content-translation.test.ts |
| Tests verify item trigger field extraction | T5 | item-trigger.test.ts |
| Tests verify article trigger field extraction | T6 | article-trigger.test.ts |
| Tests verify link trigger field extraction | T7 | link-trigger.test.ts |
| Tests verify tag trigger field extraction | T8 | tag-trigger.test.ts |
| Tests verify null/undefined handling | T5-T8 | triggers/__tests__/*.test.ts |
| Tests verify minimal required fields | T5-T8 | triggers/__tests__/*.test.ts |
| Tests verify source language uses user preference | T9 | source-language.test.ts |
| Tests verify source language fallback | T9 | source-language.test.ts |
| Tests verify invalid language handling | T9 | source-language.test.ts |
| Tests verify consistency | T9 | source-language.test.ts |
| Tests use mocking for database calls | T1-T10 | All test files |
| Tests use descriptive names | T1-T10 | All test files |
| All tests pass locally | T11 | npm test verification |
| Coverage exceeds 80% | T11 | npm test --coverage |
| Tests include edge cases | T10 | content-translation.test.ts |

---

## References

- [Overview Document](./REQ-362-write-unit-tests-for-content-translation-module-overview.md)
- [Request #362](./gen_requests_epic3.md#req-362)
- [Implementation Plan - Phase 7](./prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [Translation Service Tests](../src/lib/translation-service/__tests__/) - Reference patterns
- [Job Queue Tests](../src/lib/job-queue/__tests__/) - Reference patterns

---

*Document generated on 2026-01-19 for REQ-362: Write Unit Tests for Content Translation Module - Detailed Task Breakdown*
