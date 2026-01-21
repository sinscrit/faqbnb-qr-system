/**
 * Unit Tests for Link Translation Processor
 * Tests for REQ-E03-016
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
import { processLinkTranslation } from '../link-processor';
import { supabaseAdmin } from '@/lib/supabase';
import { translateText } from '@/lib/translation-service';
import { markJobCompleted, markJobFailed } from '@/lib/job-queue/translation-jobs';
import type { TranslationJob } from '@/lib/job-queue/translation-jobs.types';

describe('processLinkTranslation', () => {
  const mockJob: TranslationJob = {
    id: 'job-123',
    entityType: 'link',
    entityId: 'link-456',
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

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('not found');
    });

    it('should classify rate limit errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'link-456', title: 'Test Link', source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Rate limit exceeded'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Rate limit');
    });

    it('should classify timeout errors as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'link-456', title: 'Test Link', source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Request timed out'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Network error');
    });

    it('should classify service unavailable as transient', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'link-456', title: 'Test Link', source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('503 Service Unavailable'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('transient');
      expect(result.errorMessage).toContain('Service unavailable');
    });
  });

  // ===========================================================================
  // Task 12: Successful Translation Tests
  // ===========================================================================

  describe('Successful Translation', () => {
    it('should successfully translate link title only', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'How to use the dishwasher',
        source_language: 'en',
      };

      // Mock database fetch for item_links table
      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      // Mock database upsert for link_translations table
      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      // Return different mocks based on table name
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      // Mock translation service - should only be called ONCE (for title)
      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Comment utiliser le lave-vaisselle',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(true);
      expect(result.entityType).toBe('link');
      expect(result.entityId).toBe('link-456');
      expect(result.targetLanguage).toBe('fr');
      expect(result.translatedFields).toEqual({
        title: 'Comment utiliser le lave-vaisselle',
      });
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(markJobCompleted).toHaveBeenCalledWith('job-123');

      // CRITICAL: translateText should only be called ONCE (for title, never URL)
      expect(translateText).toHaveBeenCalledTimes(1);
    });

    it('should only call translation service once (for title only)', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'Appliance Manual PDF',
        source_language: 'en',
      };

      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: "Manuel PDF de l'appareil",
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      await processLinkTranslation(mockJob);

      // Verify translateText was called exactly once
      // Links should NEVER translate more than the title
      expect(translateText).toHaveBeenCalledTimes(1);
      expect(translateText).toHaveBeenCalledWith(
        'Appliance Manual PDF',
        expect.any(String),
        'fr',
        expect.any(Object)
      );
    });

    it('should use link source_language when available', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'Guide vidéo de la cafetière',
        source_language: 'fr', // Link was created in French
      };

      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Coffee Maker Video Guide',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      // Job has sourceLanguage 'en' but link has 'fr'
      const jobWithEnSource: TranslationJob = {
        ...mockJob,
        sourceLanguage: 'en',
        targetLanguage: 'en', // Translating from FR to EN
      };

      await processLinkTranslation(jobWithEnSource);

      // Should have used 'fr' as source (from link) not 'en' (from job)
      expect(translateText).toHaveBeenCalledWith(
        'Guide vidéo de la cafetière',
        'fr', // Link's source language takes precedence
        'en',
        expect.any(Object)
      );
    });
  });

  // ===========================================================================
  // Task 13: Job Failure Scenarios Tests
  // ===========================================================================

  describe('Job Failure Scenarios', () => {
    it('should mark job as failed when link does not exist', async () => {
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

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(markJobFailed).toHaveBeenCalledWith('job-123', expect.stringContaining('not found'));
    });

    it('should mark job as failed when storage fails', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'Test',
        source_language: 'en',
      };

      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Test traduit',
        provider: 'claude',
      });

      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

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
              data: { id: 'link-456', title: 'Test', source_language: 'en' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Some error'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(jobWithMaxAttempts);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('permanent');
      expect(result.errorMessage).toContain('Max retries exceeded');
    });

    it('should mark job as failed when link title is empty', async () => {
      const mockLink = {
        id: 'link-456',
        title: '',
        source_language: 'en',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('title is empty');
    });

    it('should mark job as failed when translation service fails', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'Test Link',
        source_language: 'en',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(translateText).mockRejectedValue(new Error('Translation API error'));
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(markJobFailed).toHaveBeenCalled();
      expect(result.errorMessage).toBeDefined();
    });
  });

  // ===========================================================================
  // Task 14: Translation Context and URL Exclusion Tests
  // ===========================================================================

  describe('Translation Context and URL Exclusion', () => {
    it('should use correct translation context for link title', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'Video Tutorial',
        source_language: 'en',
      };

      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Tutoriel vidéo',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      await processLinkTranslation(mockJob);

      // Verify translateText was called with link_title context
      expect(translateText).toHaveBeenCalledWith(
        'Video Tutorial',
        'en',
        'fr',
        expect.objectContaining({
          context: expect.objectContaining({
            contentType: 'link_title',
            tone: 'concise',
          }),
        })
      );
    });

    it('should NEVER include URL in translation request', async () => {
      // This test verifies the critical requirement that URLs are never translated
      const mockLink = {
        id: 'link-456',
        title: 'Setup Guide',
        source_language: 'en',
        // Note: URL is not in the fetched data because we don't select it
      };

      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Guide de configuration',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      await processLinkTranslation(mockJob);

      // Verify translateText was ONLY called with the title
      // It should never receive a URL
      expect(translateText).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(translateText).mock.calls[0];
      expect(callArgs[0]).toBe('Setup Guide'); // Only title, no URL

      // Verify URL patterns are never passed to translation
      expect(callArgs[0]).not.toMatch(/^https?:\/\//);
      expect(callArgs[0]).not.toMatch(/\.com|\.org|\.net|\.io/);
    });

    it('should verify database query does not select URL field', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'link-456', title: 'Test', source_language: 'en' },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'item_links') {
          return {
            select: selectMock,
          };
        }
        if (table === 'link_translations') {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Test',
        provider: 'claude',
      });
      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      await processLinkTranslation(mockJob);

      // Verify the select call does NOT include 'url' or 'thumbnail_url'
      expect(selectMock).toHaveBeenCalled();
      const selectArg = selectMock.mock.calls[0][0];
      expect(selectArg).not.toContain('url,');
      expect(selectArg).not.toContain('thumbnail_url');
      expect(selectArg).not.toContain('link_type');
      expect(selectArg).toContain('title');
      expect(selectArg).toContain('source_language');
    });
  });

  // ===========================================================================
  // Additional Edge Case Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should track processing time correctly', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'Test',
        source_language: 'en',
      };

      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Translated',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.processingTimeMs).toBe('number');
    });

    it('should always return entityType as link', async () => {
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

      const result = await processLinkTranslation(mockJob);

      expect(result.entityType).toBe('link');
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

      const result = await processLinkTranslation(jobWithGerman);

      expect(result.targetLanguage).toBe('de');
    });

    it('should handle whitespace-only title as empty', async () => {
      const mockLink = {
        id: 'link-456',
        title: '   ',  // Whitespace only
        source_language: 'en',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });
      vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom);
      vi.mocked(markJobFailed).mockResolvedValue({ success: true });

      const result = await processLinkTranslation(mockJob);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('title is empty');
    });

    it('should fall back to job sourceLanguage when link has no source_language', async () => {
      const mockLink = {
        id: 'link-456',
        title: 'Test Link',
        source_language: null, // No source language on link
      };

      const mockFromLinks = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
          }),
        }),
      });

      const mockFromTranslations = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });

      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'item_links') {
          return mockFromLinks() as ReturnType<typeof supabaseAdmin.from>;
        }
        if (table === 'link_translations') {
          return mockFromTranslations() as ReturnType<typeof supabaseAdmin.from>;
        }
        return {} as ReturnType<typeof supabaseAdmin.from>;
      });

      vi.mocked(translateText).mockResolvedValueOnce({
        translatedText: 'Lien de test',
        provider: 'claude',
      });

      vi.mocked(markJobCompleted).mockResolvedValue({ success: true });

      await processLinkTranslation(mockJob);

      // Should have used 'en' from job since link has no source_language
      expect(translateText).toHaveBeenCalledWith(
        'Test Link',
        'en', // Job's sourceLanguage used as fallback
        'fr',
        expect.any(Object)
      );
    });
  });
});
