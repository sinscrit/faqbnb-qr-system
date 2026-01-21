/**
 * Unit Tests for triggerArticleTranslation (REQ-E03-030)
 *
 * Tests the article-specific translation trigger including:
 * - Successful article translation queueing
 * - Entity not found handling
 * - Field extraction verification (title and description)
 * - Database error handling
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TEST_IDS, SAMPLE_CONTENT, TARGET_LANGUAGES_FROM_EN } from './helpers';
import { createMockArticle } from './helpers';

// Mock dependencies before imports
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('../content-translation', () => ({
  queueContentTranslations: vi.fn(),
}));

// Import module under test and mocked modules AFTER mocks are set up
import { triggerArticleTranslation } from '../triggers/article-trigger';
import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';

const mockSupabaseAdmin = vi.mocked(supabaseAdmin);
const mockQueueContentTranslations = vi.mocked(queueContentTranslations);

/**
 * Helper to create mock Supabase chain
 */
function createMockChain(data: unknown, error: { message: string } | null = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
}

describe('triggerArticleTranslation (REQ-E03-030)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: successful queue result
    mockQueueContentTranslations.mockResolvedValue({
      success: true,
      jobIds: TARGET_LANGUAGES_FROM_EN.map((lang, i) => `job-${lang}-${i}`),
      queuedLanguages: [...TARGET_LANGUAGES_FROM_EN],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful Translation Queueing', () => {
    it('should fetch article by ID from database', async () => {
      const mockArticle = createMockArticle();
      const mockChain = createMockChain(mockArticle);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('item_articles');
      expect(mockChain.select).toHaveBeenCalledWith('id, title, description');
      expect(mockChain.eq).toHaveBeenCalledWith('id', TEST_IDS.ARTICLE);
    });

    it('should extract title field for translation', async () => {
      const mockArticle = createMockArticle({ title: 'Test Article Title' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'title',
                value: 'Test Article Title',
              }),
            ]),
          }),
        })
      );
    });

    it('should extract description field for translation', async () => {
      const mockArticle = createMockArticle({ description: 'Test Article Description' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                value: 'Test Article Description',
              }),
            ]),
          }),
        })
      );
    });

    it('should call queueContentTranslations with correct entity type', async () => {
      const mockArticle = createMockArticle();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'article',
            entityId: TEST_IDS.ARTICLE,
          }),
        })
      );
    });

    it('should pass source language to orchestrator', async () => {
      const mockArticle = createMockArticle();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'fr');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: 'fr',
          }),
        })
      );
    });

    it('should return job IDs on success', async () => {
      const mockArticle = createMockArticle();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);
      mockQueueContentTranslations.mockResolvedValue({
        success: true,
        jobIds: ['job-fr-0', 'job-es-1', 'job-de-2'],
        queuedLanguages: ['fr', 'es', 'de'],
      });

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(3);
    });
  });

  describe('Entity Not Found', () => {
    it('should return error when article not found', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error with descriptive message', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.error).toContain('not found');
    });

    it('should not call queueContentTranslations when article missing', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });
  });

  describe('Field Handling', () => {
    it('should handle null description gracefully', async () => {
      const mockArticle = createMockArticle({ description: null });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.success).toBe(true);
      // Should still queue with title field only
      expect(mockQueueContentTranslations).toHaveBeenCalled();
      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f: { fieldName: string }) => f.fieldName);
      expect(fieldNames).toContain('title');
      expect(fieldNames).not.toContain('description');
    });

    it('should handle empty title string', async () => {
      const mockArticle = createMockArticle({ title: '', description: SAMPLE_CONTENT.ARTICLE_DESCRIPTION });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.success).toBe(true);
      // Should only include description field
      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f: { fieldName: string }) => f.fieldName);
      expect(fieldNames).not.toContain('title');
      expect(fieldNames).toContain('description');
    });

    it('should use correct translation context for title field', async () => {
      const mockArticle = createMockArticle();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'title',
                context: expect.objectContaining({
                  contentType: 'article_title',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should use correct translation context for description field', async () => {
      const mockArticle = createMockArticle();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                context: expect.objectContaining({
                  contentType: 'article_description',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should return empty result when no translatable content', async () => {
      const mockArticle = createMockArticle({ title: '', description: null });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockArticle) as never);

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(result.queuedLanguages).toHaveLength(0);
      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });
  });

  describe('Database Error Handling', () => {
    it('should return error when database query fails', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain(null, { message: 'Connection timeout' }) as never
      );

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should catch and wrap database exceptions', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected database error');
      });

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Exception');
    });

    it('should include database error message in result', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain(null, { message: 'Permission denied' }) as never
      );

      const result = await triggerArticleTranslation(TEST_IDS.ARTICLE, 'en');

      expect(result.error).toContain('Permission denied');
    });
  });
});
