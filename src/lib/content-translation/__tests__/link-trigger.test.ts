/**
 * Unit Tests for triggerLinkTranslation (REQ-E03-030)
 *
 * Tests the link-specific translation trigger including:
 * - Successful link translation queueing
 * - Entity not found handling
 * - Field extraction verification (title-only, no URL)
 * - Database error handling
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TEST_IDS, TARGET_LANGUAGES_FROM_EN } from './helpers';
import { createMockLink } from './helpers';

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
import { triggerLinkTranslation } from '../triggers/link-trigger';
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

describe('triggerLinkTranslation (REQ-E03-030)', () => {
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
    it('should fetch link by ID from database', async () => {
      const mockLink = createMockLink();
      const mockChain = createMockChain(mockLink);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as never);

      await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('item_links');
      expect(mockChain.select).toHaveBeenCalledWith('id, title');
      expect(mockChain.eq).toHaveBeenCalledWith('id', TEST_IDS.LINK);
    });

    it('should extract title field for translation', async () => {
      const mockLink = createMockLink({ title: 'Test Link Title' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);

      await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'title',
                value: 'Test Link Title',
              }),
            ]),
          }),
        })
      );
    });

    it('should call queueContentTranslations with correct entity type', async () => {
      const mockLink = createMockLink();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);

      await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'link',
            entityId: TEST_IDS.LINK,
          }),
        })
      );
    });

    it('should pass source language to orchestrator', async () => {
      const mockLink = createMockLink();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);

      await triggerLinkTranslation(TEST_IDS.LINK, 'de');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: 'de',
          }),
        })
      );
    });

    it('should return job IDs on success', async () => {
      const mockLink = createMockLink();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);
      mockQueueContentTranslations.mockResolvedValue({
        success: true,
        jobIds: ['job-fr-0', 'job-es-1', 'job-de-2'],
        queuedLanguages: ['fr', 'es', 'de'],
      });

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(3);
    });
  });

  describe('Entity Not Found', () => {
    it('should return error when link not found', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error with descriptive message', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.error).toContain('not found');
    });

    it('should not call queueContentTranslations when link missing', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });
  });

  describe('Title-Only Field Handling', () => {
    it('should only include title field in translation (no URL)', async () => {
      const mockLink = createMockLink({ title: 'Video Tutorial', url: 'https://example.com/video' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);

      await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f: { fieldName: string }) => f.fieldName);
      expect(fieldNames).toContain('title');
      expect(fieldNames).not.toContain('url');
    });

    it('should use correct translation context for title field', async () => {
      const mockLink = createMockLink();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);

      await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
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

    it('should return empty result when title is empty', async () => {
      const mockLink = createMockLink({ title: '' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(result.queuedLanguages).toHaveLength(0);
      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });

    it('should return empty result when title is whitespace-only', async () => {
      const mockLink = createMockLink({ title: '   ' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockLink) as never);

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });
  });

  describe('Database Error Handling', () => {
    it('should return error when database query fails', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain(null, { message: 'Connection timeout' }) as never
      );

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should catch and wrap database exceptions', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected database error');
      });

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Exception');
    });

    it('should include database error message in result', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain(null, { message: 'Permission denied' }) as never
      );

      const result = await triggerLinkTranslation(TEST_IDS.LINK, 'en');

      expect(result.error).toContain('Permission denied');
    });
  });
});
