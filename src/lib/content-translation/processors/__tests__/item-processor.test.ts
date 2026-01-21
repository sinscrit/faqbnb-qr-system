/**
 * Unit Tests for Item Translation Processor
 * Tests for REQ-E03-014
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
import { processItemTranslation } from '../item-processor';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('processItemTranslation', () => {
  const mockJob: TranslationJob = {
    id: 'job-123',
    entityType: 'item',
    entityId: 'item-456',
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

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('not found');
    });

    it('should classify rate limit errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'item-456', name: 'Test Item', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Rate limit exceeded'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Rate limit');
    });

    it('should classify timeout errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'item-456', name: 'Test Item', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Request timed out'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Network error');
    });

    it('should classify service unavailable as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'item-456', name: 'Test Item', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('503 Service Unavailable'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Service unavailable');
    });
  });

  // ===========================================================================
  // Task 12: Successful Translation Tests
  // ===========================================================================

  describe('Successful Translation', () => {
    it('should successfully translate item name and description', async () => {
      const mockItem = {
        id: 'item-456',
        name: 'Coffee Maker',
        description: 'A programmable coffee machine',
        source_language: 'en',
      };

      // Mock database fetch for items table
      const mockFromItems = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      });

      // Mock database upsert for item_translations table
      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      // Return different mocks based on table name
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'items') {
          return mockFromItems() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'item_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      // Mock translation service
      vi.mocked(translateText)
        .mockResolvedValueOnce({ translatedText: 'Machine à café', provider: 'claude' })
        .mockResolvedValueOnce({ translatedText: 'Une cafetière programmable', provider: 'claude' });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(true);
      expect(result.entityType).toBe('item');
      expect(result.entityId).toBe('item-456');
      expect(result.targetLanguage).toBe('fr');
      expect(result.translatedFields).toEqual({
        name: 'Machine à café',
        description: 'Une cafetière programmable',
      });
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(markJobCompleted).toHaveBeenCalledWith('job-123');
    });

    it('should handle items with null description', async () => {
      const mockItem = {
        id: 'item-456',
        name: 'Toaster',
        description: null,
        source_language: 'en',
      };

      const mockFromItems = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'items') {
          return mockFromItems() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'item_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Grille-pain',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(true);
      expect(result.translatedFields?.name).toBe('Grille-pain');
      expect(result.translatedFields?.description).toBeUndefined();
      // translateText should only be called once (for name)
      expect(translateText).toHaveBeenCalledTimes(1);
    });

    it('should use item source_language when available', async () => {
      const mockItem = {
        id: 'item-456',
        name: 'Cafetière',
        description: null,
        source_language: 'fr', // Item was created in French
      };

      const mockFromItems = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'items') {
          return mockFromItems() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'item_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Coffee Maker',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      // Job has sourceLanguage 'en' but item has 'fr'
      const jobWithEnSource: TranslationJob = {
        ...mockJob,
        sourceLanguage: 'en',
        targetLanguage: 'en', // Translating from FR to EN
      };

      await processItemTranslation(jobWithEnSource);

      // Should have used 'fr' as source (from item) not 'en' (from job)
      expect(translateText).toHaveBeenCalledWith(
        'Cafetière',
        'fr', // Item's source language takes precedence
        'en',
        expect.any(Object)
      );
    });
  });

  // ===========================================================================
  // Task 13: Job Failure Scenarios Tests
  // ===========================================================================

  describe('Job Failure Scenarios', () => {
    it('should mark job as failed when item does not exist', async () => {
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

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(markJobFailed).toHaveBeenCalledWith('job-123', expect.stringContaining('not found'));
    });

    it('should mark job as failed when storage fails', async () => {
      const mockItem = {
        id: 'item-456',
        name: 'Test',
        description: null,
        source_language: 'en',
      };

      const mockFromItems = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'items') {
          return mockFromItems() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'item_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Test traduit',
        provider: 'claude',
      });

      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

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
              data: { id: 'item-456', name: 'Test', description: null, source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Some random error'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processItemTranslation(jobWithMaxAttempts);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('Max retries exceeded');
    });

    it('should mark job as failed when translation service fails', async () => {
      const mockItem = {
        id: 'item-456',
        name: 'Test Item',
        description: null,
        source_language: 'en',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Translation API error'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(markJobFailed).toHaveBeenCalled();
      expect(result.errorMessage).toBeDefined();
    });

    it('should handle empty item name correctly', async () => {
      const mockItem = {
        id: 'item-456',
        name: '',
        description: null,
        source_language: 'en',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('empty');
    });
  });

  // ===========================================================================
  // Additional Edge Case Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should track processing time correctly', async () => {
      const mockItem = {
        id: 'item-456',
        name: 'Test',
        description: null,
        source_language: 'en',
      };

      const mockFromItems = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'items') {
          return mockFromItems() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'item_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Translated',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processItemTranslation(mockJob);

      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.processingTimeMs).toBe('number');
    });

    it('should always return entityType as item', async () => {
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

      const result = await processItemTranslation(mockJob);

      expect(result.entityType).toBe('item');
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

      const result = await processItemTranslation(jobWithGerman);

      expect(result.targetLanguage).toBe('de');
    });
  });
});
