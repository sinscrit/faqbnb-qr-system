/**
 * Unit Tests for triggerTagTranslation (REQ-E03-030)
 *
 * Tests the tag-specific translation trigger including:
 * - System tag detection and skipping
 * - User tag translation queueing
 * - Duplicate prevention (existing translations)
 * - Tag-key-as-entity-id pattern
 * - Error handling
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TARGET_LANGUAGES_FROM_EN } from './helpers';

// Mock dependencies before imports
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('../content-translation', () => ({
  queueContentTranslations: vi.fn(),
}));

vi.mock('@/lib/translation-service', () => ({
  getOtherLanguages: vi.fn(),
}));

// Import module under test and mocked modules AFTER mocks are set up
import { triggerTagTranslation } from '../triggers/tag-trigger';
import { supabaseAdmin } from '@/lib/supabase';
import { queueContentTranslations } from '../content-translation';
import { getOtherLanguages } from '@/lib/translation-service';

const mockSupabaseAdmin = vi.mocked(supabaseAdmin);
const mockQueueContentTranslations = vi.mocked(queueContentTranslations);
const mockGetOtherLanguages = vi.mocked(getOtherLanguages);

// Track table names for different query types
type QueryTracker = {
  tableName: string | null;
  queryResult: { data: unknown; error: { message: string } | null };
};

describe('triggerTagTranslation (REQ-E03-030)', () => {
  let queryTrackers: QueryTracker[];
  let currentQueryIndex: number;

  beforeEach(() => {
    vi.clearAllMocks();
    queryTrackers = [];
    currentQueryIndex = 0;

    // Default: return all target languages from English
    mockGetOtherLanguages.mockReturnValue([...TARGET_LANGUAGES_FROM_EN]);

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

  /**
   * Helper to create a Supabase mock chain that tracks queries
   */
  function createMockChain() {
    const chainMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn(), // For awaiting
    };

    // Make the chain itself thenable to work as a Promise
    chainMock.then = vi.fn((resolve) => {
      const tracker = queryTrackers[currentQueryIndex++];
      if (tracker) {
        return Promise.resolve(tracker.queryResult).then(resolve);
      }
      return Promise.resolve({ data: [], error: null }).then(resolve);
    });

    // Override to act like a Promise
    Object.defineProperty(chainMock, 'then', {
      get: () => {
        return (resolve: (val: unknown) => unknown) => {
          const tracker = queryTrackers[currentQueryIndex++];
          if (tracker) {
            return Promise.resolve(tracker.queryResult).then(resolve);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve);
        };
      }
    });

    return chainMock;
  }

  /**
   * Set up query responses in order
   */
  function setupQueryResponses(responses: Array<{ data: unknown; error: { message: string } | null }>) {
    queryTrackers = responses.map(r => ({ tableName: null, queryResult: r }));
    currentQueryIndex = 0;

    const chain = createMockChain();
    mockSupabaseAdmin.from.mockReturnValue(chain as never);
  }

  describe('System Tag Detection', () => {
    it('should skip system tags without queueing translations', async () => {
      // First query: isSystemTag returns true
      setupQueryResponses([
        { data: [{ is_system_tag: true }], error: null },
      ]);

      const result = await triggerTagTranslation('kitchen', 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(result.queuedLanguages).toHaveLength(0);
      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });

    it('should return success with empty result for system tags', async () => {
      setupQueryResponses([
        { data: [{ is_system_tag: true }], error: null },
      ]);

      const result = await triggerTagTranslation('bathroom', 'en');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should proceed with user tags (not system)', async () => {
      // isSystemTag: no system tag found
      // getExistingTagTranslationLanguages: no existing translations
      // getPendingTagJobLanguages: no pending jobs
      setupQueryResponses([
        { data: [], error: null },  // isSystemTag check
        { data: [], error: null },  // existing translations
        { data: [], error: null },  // pending jobs
      ]);

      await triggerTagTranslation('my-custom-tag', 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalled();
    });
  });

  describe('User Tag Translation', () => {
    it('should queue translations for user-created tags', async () => {
      setupQueryResponses([
        { data: [], error: null },  // Not a system tag
        { data: [], error: null },  // No existing translations
        { data: [], error: null },  // No pending jobs
      ]);

      await triggerTagTranslation('coffee-maker', 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityType: 'tag',
            entityId: 'coffee-maker',
          }),
        })
      );
    });

    it('should use tag key as entity ID', async () => {
      const tagKey = 'my-custom-tag-123';
      setupQueryResponses([
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ]);

      await triggerTagTranslation(tagKey, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityId: tagKey,
          }),
        })
      );
    });

    it('should pass source language to orchestrator', async () => {
      setupQueryResponses([
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ]);

      await triggerTagTranslation('test-tag', 'fr');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sourceLanguage: 'fr',
          }),
        })
      );
    });

    it('should use correct translation context for tag', async () => {
      setupQueryResponses([
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ]);

      await triggerTagTranslation('test-tag', 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'translated_value',
                context: expect.objectContaining({
                  contentType: 'tag',
                }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('Duplicate Prevention', () => {
    it('should skip languages with existing translations', async () => {
      setupQueryResponses([
        { data: [], error: null },  // Not system tag
        { data: [{ language: 'fr' }, { language: 'de' }], error: null }, // Existing
        { data: [], error: null },  // No pending
      ]);

      await triggerTagTranslation('test-tag', 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeLanguages: expect.arrayContaining(['fr', 'de']),
        })
      );
    });

    it('should skip languages with pending jobs', async () => {
      setupQueryResponses([
        { data: [], error: null },  // Not system tag
        { data: [], error: null },  // No existing
        { data: [{ target_language: 'es' }, { target_language: 'nl' }], error: null }, // Pending
      ]);

      await triggerTagTranslation('test-tag', 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeLanguages: expect.arrayContaining(['es', 'nl']),
        })
      );
    });

    it('should return empty result when all translations exist', async () => {
      // All 5 target languages already have translations
      setupQueryResponses([
        { data: [], error: null },  // Not system tag
        { data: [
          { language: 'fr' },
          { language: 'es' },
          { language: 'de' },
          { language: 'nl' },
          { language: 'it' },
        ], error: null },
        { data: [], error: null },
      ]);

      const result = await triggerTagTranslation('test-tag', 'en');

      expect(result.success).toBe(true);
      expect(result.jobIds).toHaveLength(0);
      expect(mockQueueContentTranslations).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should catch and wrap exceptions', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await triggerTagTranslation('test-tag', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Exception');
    });

    it('should assume not system tag on error (fail open)', async () => {
      setupQueryResponses([
        { data: null, error: { message: 'Query failed' } },  // System tag check fails
        { data: [], error: null },
        { data: [], error: null },
      ]);

      await triggerTagTranslation('test-tag', 'en');

      // Should continue and try to queue translations
      expect(mockQueueContentTranslations).toHaveBeenCalled();
    });

    it('should never throw exceptions', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Critical failure');
      });

      await expect(triggerTagTranslation('test-tag', 'en')).resolves.toBeDefined();
    });
  });

  describe('Tag Key as Entity ID', () => {
    it('should use tag key as entityId, not UUID', async () => {
      const customTagKey = 'custom-appliance-tag';
      setupQueryResponses([
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ]);

      await triggerTagTranslation(customTagKey, 'en');

      const callArgs = mockQueueContentTranslations.mock.calls[0][0];
      expect(callArgs.content.entityId).toBe(customTagKey);
      // Verify it's NOT a UUID pattern
      expect(callArgs.content.entityId).not.toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('should handle special characters in tag keys', async () => {
      const specialTagKey = 'tag-with-dashes_and_underscores';
      setupQueryResponses([
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ]);

      await triggerTagTranslation(specialTagKey, 'en');

      expect(mockQueueContentTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            entityId: specialTagKey,
          }),
        })
      );
    });
  });
});
