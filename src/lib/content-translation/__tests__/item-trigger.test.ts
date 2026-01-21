/**
 * Unit Tests for triggerItemTranslation (REQ-E03-030)
 *
 * Tests the item-specific translation trigger including:
 * - Successful item translation queueing
 * - Entity not found handling
 * - Field extraction verification
 * - Database error handling
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TEST_IDS, SAMPLE_CONTENT, TARGET_LANGUAGES_FROM_EN } from './helpers';
import { createMockItem } from './helpers';

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
import { triggerItemTranslation } from '../triggers/item-trigger';
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

describe('triggerItemTranslation (REQ-E03-030)', () => {
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
    it('should fetch item by ID from database', async () => {
      const mockItem = createMockItem();
      const mockChain = createMockChain(mockItem);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('items');
      expect(mockChain.select).toHaveBeenCalledWith('id, name, description');
      expect(mockChain.eq).toHaveBeenCalledWith('id', TEST_IDS.ITEM);
    });

    it('should extract name field for translation', async () => {
      const mockItem = createMockItem({ name: 'Test Item Name' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'name',
                value: 'Test Item Name',
              }),
            ]),
          }),
        })
      );
    });

    it('should extract description field for translation', async () => {
      const mockItem = createMockItem({ description: 'Test Description' });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                value: 'Test Description',
              }),
            ]),
          }),
        })
      );
    });

    it('should call queueContentTranslations with correct entity type', async () => {
      const mockItem = createMockItem();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'item',
            entityId: TEST_IDS.ITEM,
          }),
        })
      );
    });

    it('should pass source language to orchestrator', async () => {
      const mockItem = createMockItem();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'fr');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: 'fr',
          }),
        })
      );
    });

    it('should return job IDs on success', async () => {
      const mockItem = createMockItem();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);
      mockQueueContentTranslations.mockResolvedValue({
        success: true,
        jobIds: ['job-fr-0', 'job-es-1', 'job-de-2'],
        queuedLanguages: ['fr', 'es', 'de'],
      });

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(3);
    });
  });

  describe('Entity Not Found', () => {
    it('should return error when item not found', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error with descriptive message', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.error).toContain('not found');
    });

    it('should not call queueContentTranslations when item missing', async () => {
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(null) as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });
  });

  describe('Field Handling', () => {
    it('should handle null description gracefully', async () => {
      const mockItem = createMockItem({ description: null });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.success).toBe(true);
      // Should still queue with name field only
      expect(mockQueueContentTranslations).toHaveBeenCalled();
      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f: { fieldName: string }) => f.fieldName);
      expect(fieldNames).toContain('name');
      expect(fieldNames).not.toContain('description');
    });

    it('should handle empty name string', async () => {
      const mockItem = createMockItem({ name: '', description: SAMPLE_CONTENT.ITEM_DESCRIPTION });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.success).toBe(true);
      // Should only include description field
      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      const fieldNames = callArgs.content.fields.map((f: { fieldName: string }) => f.fieldName);
      expect(fieldNames).not.toContain('name');
      expect(fieldNames).toContain('description');
    });

    it('should use correct translation context for name field', async () => {
      const mockItem = createMockItem();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'name',
                context: expect.objectContaining({
                  contentType: 'item_name',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should use correct translation context for description field', async () => {
      const mockItem = createMockItem();
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'description',
                context: expect.objectContaining({
                  contentType: 'item_description',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should return empty result when no translatable content', async () => {
      const mockItem = createMockItem({ name: '', description: null });
      mockSupabaseAdmin.from.mockReturnValue(createMockChain(mockItem) as never);

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

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

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should catch and wrap database exceptions', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected database error');
      });

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Exception');
    });

    it('should include database error message in result', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain(null, { message: 'Permission denied' }) as never
      );

      const result = await triggerItemTranslation(TEST_IDS.ITEM, 'en');

      expect(result.error).toContain('Permission denied');
    });
  });
});
