/**
 * Unit Tests for Article Translation Processor
 * Tests for REQ-E03-015
 *
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn(),
}));

vi.mock('@/lib/job-queue/translation-jobs', () => ({
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
}));

// Import after mocks are set up
import { processArticleTranslation } from '../article-processor';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('processArticleTranslation', () => {
  const mockJob: TranslationJob = {
    id: 'job-123',
    entityType: 'article',
    entityId: 'article-456',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    status: 'processing',
    attempts: 0,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Task 11: Error Classification Tests
  // ===========================================================================

  describe('Error Classification', () => {
    it('should classify "not found" as permanent error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Row not found' },
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('not found');
    });

    it('should classify rate limit errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'article-456', title: 'Test Article', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Rate limit exceeded'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Rate limit');
    });

    it('should classify timeout errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'article-456', title: 'Test Article', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Request timed out'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Network error');
    });

    it('should classify service unavailable as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'article-456', title: 'Test Article', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('503 Service Unavailable'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Service unavailable');
    });
  });

  // ===========================================================================
  // Task 12: Successful Translation Tests
  // ===========================================================================

  describe('Successful Translation', () => {
    it('should successfully translate article title and description', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'How to use the Coffee Maker',
        description: 'Follow these steps to brew your coffee',
        source_language: 'en',
      };

      // Mock database fetch for item_articles table
      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      // Mock database upsert for article_translations table
      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      // Return different mocks based on table name
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      // Mock translation service
      vi.mocked(translateText)
        .mockResolvedValueOnce({ translatedText: 'Comment utiliser la cafetière', provider: 'claude' })
        .mockResolvedValueOnce({ translatedText: 'Suivez ces étapes pour préparer votre café', provider: 'claude' });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(true);
      expect(result.entityType).toBe('article');
      expect(result.entityId).toBe('article-456');
      expect(result.targetLanguage).toBe('fr');
      expect(result.translatedFields).toEqual({
        title: 'Comment utiliser la cafetière',
        description: 'Suivez ces étapes pour préparer votre café',
      });
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(markJobCompleted).toHaveBeenCalledWith('job-123');
    });

    it('should handle articles with null description', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'WiFi Information',
        description: null,
        source_language: 'en',
      };

      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Informations WiFi',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(true);
      expect(result.translatedFields?.title).toBe('Informations WiFi');
      expect(result.translatedFields?.description).toBeUndefined();
      // translateText should only be called once (for title)
      expect(translateText).toHaveBeenCalledTimes(1);
    });

    it('should handle articles with empty string description', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'Pool Rules',
        description: '   ',  // Whitespace only
        source_language: 'en',
      };

      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Règles de la piscine',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(true);
      // translateText should only be called once (for title, skipping empty description)
      expect(translateText).toHaveBeenCalledTimes(1);
    });

    it('should use article source_language when available', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'Comment utiliser la cafetière',
        description: null,
        source_language: 'fr', // Article was created in French
      };

      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'How to Use the Coffee Maker',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      // Job has sourceLanguage 'en' but article has 'fr'
      const jobWithEnSource: TranslationJob = {
        ...mockJob,
        sourceLanguage: 'en',
        targetLanguage: 'en', // Translating from FR to EN
      };

      await processArticleTranslation(jobWithEnSource);

      // Should have used 'fr' as source (from article) not 'en' (from job)
      expect(translateText).toHaveBeenCalledWith(
        'Comment utiliser la cafetière',
        'fr', // Article's source language takes precedence
        'en',
        expect.any(Object)
      );
    });
  });

  // ===========================================================================
  // Task 13: Job Failure Scenarios Tests
  // ===========================================================================

  describe('Job Failure Scenarios', () => {
    it('should mark job as failed when article does not exist', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Row not found' },
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(markJobFailed).toHaveBeenCalledWith('job-123', expect.stringContaining('not found'));
    });

    it('should mark job as failed when storage fails', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'Test',
        description: null,
        source_language: 'en',
      };

      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Test traduit',
        provider: 'claude',
      });

      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(markJobFailed).toHaveBeenCalled();
    });

    it('should not retry for permanent errors after max attempts', async () => {
      const jobWithMaxAttempts: TranslationJob = {
        ...mockJob,
        attempts: 3,
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'article-456', title: 'Test', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Some random error'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(jobWithMaxAttempts);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('Max retries exceeded');
    });

    it('should mark job as failed when article title is empty', async () => {
      const mockArticle = {
        id: 'article-456',
        title: '',
        description: 'Some description',
        source_language: 'en',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('title is empty');
    });

    it('should mark job as failed when translation service fails', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'Test Article',
        description: null,
        source_language: 'en',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Translation API error'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(markJobFailed).toHaveBeenCalled();
      expect(result.errorMessage).toBeDefined();
    });
  });

  // ===========================================================================
  // Task 14: Translation Context Tests
  // ===========================================================================

  describe('Translation Context', () => {
    it('should use correct translation context for title', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'How to Connect WiFi',
        description: null,
        source_language: 'en',
      };

      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Comment se connecter au WiFi',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      await processArticleTranslation(mockJob);

      // Verify translateText was called with article_title context
      expect(translateText).toHaveBeenCalledWith(
        'How to Connect WiFi',
        'en',
        'fr',
        expect.objectContaining({
          context: expect.objectContaining({
            contentType: 'article_title',
            tone: 'concise',
          }),
        })
      );
    });

    it('should use correct translation context for description', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'Safety Tips',
        description: 'Please follow these safety guidelines',
        source_language: 'en',
      };

      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText)
        .mockResolvedValueOnce({ translatedText: 'Conseils de sécurité', provider: 'claude' })
        .mockResolvedValueOnce({ translatedText: 'Veuillez suivre ces consignes de sécurité', provider: 'claude' });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      await processArticleTranslation(mockJob);

      // Verify second translateText call used article_description context
      expect(translateText).toHaveBeenNthCalledWith(
        2,
        'Please follow these safety guidelines',
        'en',
        'fr',
        expect.objectContaining({
          context: expect.objectContaining({
            contentType: 'article_description',
            tone: 'friendly',
          }),
        })
      );
    });
  });

  // ===========================================================================
  // Additional Edge Case Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should track processing time correctly', async () => {
      const mockArticle = {
        id: 'article-456',
        title: 'Test',
        description: null,
        source_language: 'en',
      };

      const mockFromArticles = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockArticle, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_articles') {
          return mockFromArticles() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'article_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Translated',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.processingTimeMs).toBe('number');
    });

    it('should always return entityType as article', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' },
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(mockJob);

      expect(result.entityType).toBe('article');
    });

    it('should return correct targetLanguage in result', async () => {
      const jobWithGerman: TranslationJob = {
        ...mockJob,
        targetLanguage: 'de',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' },
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processArticleTranslation(jobWithGerman);

      expect(result.targetLanguage).toBe('de');
    });
  });
});
