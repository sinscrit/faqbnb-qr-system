/**
 * Unit Tests for Entity-Specific Translation Processors (REQ-E03-031)
 *
 * Tests the entity-specific translation processors including:
 * - Item translation processor (name, description)
 * - Article translation processor (title, description)
 * - Link translation processor (title only - URLs never translated)
 * - Tag translation processor (translated_value)
 * - Processor routing based on entity type
 *
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockItemContent,
  createMockArticleContent,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
} from './helpers/mockSupabase';
import { TABLE_NAMES, MOCK_TRANSLATIONS } from './helpers/constants';
import type { TranslationJob } from '../translation-jobs.types';

// Mock Supabase before imports
const mockSupabaseAdmin = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

// Mock translation service
const mockTranslateText = vi.fn();
vi.mock('@/lib/translation-service', () => ({
  translateText: mockTranslateText,
}));

// Mock concurrency control
vi.mock('../concurrency-control', () => ({
  createLockHeartbeat: vi.fn(() => vi.fn()), // Returns a stop function
  DEFAULT_HEARTBEAT_INTERVAL_MS: 60000,
  cleanupStaleProcessingJobs: vi.fn(),
}));

// Mock concurrency semaphore
vi.mock('../concurrency', () => ({
  getTranslationSemaphore: vi.fn(() => ({
    acquire: vi.fn().mockResolvedValue(undefined),
    release: vi.fn(),
    notifySuccess: vi.fn(),
    notifyRateLimit: vi.fn(),
  })),
  isRateLimitError: vi.fn(() => false),
}));

// Mock translation jobs functions
vi.mock('../translation-jobs', () => ({
  fetchAndLockNextJob: vi.fn(),
  markJobCompleted: vi.fn().mockResolvedValue({ success: true }),
  markJobFailed: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock content-translation processors
vi.mock('@/lib/content-translation/processors', () => ({
  processItemTranslation: vi.fn(),
  processArticleTranslation: vi.fn(),
  processLinkTranslation: vi.fn(),
}));

/**
 * Helper to create mock Supabase chain for entity fetching
 */
function createMockSelectChain(data: unknown, error: { message: string } | null = null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
    upsert: vi.fn().mockReturnValue({
      then: vi.fn((resolve) => resolve({ data, error })),
    }),
  };
}

/**
 * Helper to create mock upsert chain
 */
function createMockUpsertChain(error: { message: string } | null = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error }),
    upsert: vi.fn().mockResolvedValue({ data: null, error }),
  };
}

describe('Entity-Specific Translation Processors (REQ-E03-031)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockDatabase();

    // Default translation service mock
    mockTranslateText.mockResolvedValue({
      translatedText: 'Translated content',
      provider: 'claude',
      tokensUsed: 100,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('processItemTranslation', () => {
    it('should fetch item by ID from database', async () => {
      // Import processor dynamically to ensure mocks are applied
      const { fetchEntityContent } = await import('../job-processor');

      const mockItem = createMockItemContent({ id: 'item-123' });
      const mockChain = createMockSelectChain({
        name: mockItem.name,
        description: mockItem.description,
        source_language: mockItem.source_language,
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('item', 'item-123');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('items');
      expect(mockChain.select).toHaveBeenCalledWith('name, description, source_language');
    });

    it('should extract name and description fields for translation', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockItem = createMockItemContent({
        name: 'Coffee Maker',
        description: 'How to use the coffee maker',
      });
      const mockChain = createMockSelectChain({
        name: mockItem.name,
        description: mockItem.description,
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('item', 'item-123');

      expect(content).not.toBeNull();
      expect(content?.fields.name).toBe('Coffee Maker');
      expect(content?.fields.description).toBe('How to use the coffee maker');
    });

    it('should return null when item not found', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain(null, { message: 'Not found' });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('item', 'nonexistent');

      expect(content).toBeNull();
    });

    it('should handle null description gracefully', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        name: 'Item Name',
        description: null,
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('item', 'item-123');

      expect(content).not.toBeNull();
      expect(content?.fields.name).toBe('Item Name');
      expect(content?.fields.description).toBeNull();
    });

    it('should store translated content in item_translations table', async () => {
      const { saveTranslation } = await import('../job-processor');

      const mockChain = {
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const result = await saveTranslation('item', 'item-123', 'fr', {
        name: 'Cafetière',
        description: 'Comment utiliser la cafetière',
      });

      expect(result).toBe(true);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('item_translations');
    });

    it('should return false when save fails', async () => {
      const { saveTranslation } = await import('../job-processor');

      const mockChain = {
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Save failed' },
        }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const result = await saveTranslation('item', 'item-123', 'fr', {
        name: 'Cafetière',
      });

      expect(result).toBe(false);
    });
  });

  describe('processArticleTranslation', () => {
    it('should fetch article by ID from database', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockArticle = createMockArticleContent({ id: 'article-123' });
      const mockChain = createMockSelectChain({
        title: mockArticle.title,
        description: mockArticle.description,
        source_language: mockArticle.source_language,
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('article', 'article-123');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('item_articles');
      expect(mockChain.select).toHaveBeenCalledWith('title, description, source_language');
    });

    it('should extract title and description fields for translation', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        title: 'WiFi Instructions',
        description: 'How to connect to WiFi',
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('article', 'article-123');

      expect(content).not.toBeNull();
      expect(content?.fields.title).toBe('WiFi Instructions');
      expect(content?.fields.description).toBe('How to connect to WiFi');
    });

    it('should store translated content in article_translations table', async () => {
      const { saveTranslation } = await import('../job-processor');

      const mockChain = {
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const result = await saveTranslation('article', 'article-123', 'fr', {
        title: 'Instructions WiFi',
        description: 'Comment se connecter au WiFi',
      });

      expect(result).toBe(true);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('article_translations');
    });

    it('should return null when article not found', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain(null, { message: 'Not found' });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('article', 'nonexistent');

      expect(content).toBeNull();
    });
  });

  describe('processLinkTranslation', () => {
    it('should fetch link by ID from database', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        title: 'Instruction Video',
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('link', 'link-123');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('item_links');
      expect(mockChain.select).toHaveBeenCalledWith('title, source_language');
    });

    it('should extract only title field for translation', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        title: 'Watch Video Guide',
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('link', 'link-123');

      expect(content).not.toBeNull();
      expect(content?.fields.title).toBe('Watch Video Guide');
      // URL should NOT be in the fields
      expect(content?.fields).not.toHaveProperty('url');
    });

    it('should NOT include URL field in fetch (URLs never translated)', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        title: 'Video Guide',
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('link', 'link-123');

      // Verify select does NOT include 'url'
      expect(mockChain.select).toHaveBeenCalledWith('title, source_language');
      expect(mockChain.select).not.toHaveBeenCalledWith(expect.stringContaining('url'));
    });

    it('should store translated content in link_translations table', async () => {
      const { saveTranslation } = await import('../job-processor');

      const mockChain = {
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const result = await saveTranslation('link', 'link-123', 'fr', {
        title: 'Regarder le guide vidéo',
      });

      expect(result).toBe(true);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('link_translations');
    });

    it('should return null when link not found', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain(null, { message: 'Not found' });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('link', 'nonexistent');

      expect(content).toBeNull();
    });
  });

  describe('processTagTranslation', () => {
    it('should fetch tag by key from database', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      // Tags use tag_key for lookup and fetch from tag_translations table
      const mockChain = createMockSelectChain({
        tag_key: 'kitchen',
        translated_value: 'Kitchen',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('tag', 'kitchen');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tag_translations');
    });

    it('should extract tag value for translation', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        tag_key: 'appliances',
        translated_value: 'Appliances',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('tag', 'appliances');

      expect(content).not.toBeNull();
      expect(content?.fields.translated_value).toBe('Appliances');
    });

    it('should store translated content in tag_translations table', async () => {
      const { saveTranslation } = await import('../job-processor');

      const mockChain = {
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const result = await saveTranslation('tag', 'appliances', 'fr', {
        translated_value: 'Appareils',
      });

      expect(result).toBe(true);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tag_translations');
    });

    it('should set is_system_tag to false for user tags', async () => {
      const { saveTranslation } = await import('../job-processor');

      const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockChain = {
        upsert: upsertMock,
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await saveTranslation('tag', 'user-custom-tag', 'fr', {
        translated_value: 'Étiquette personnalisée',
      });

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          is_system_tag: false,
        }),
        expect.anything()
      );
    });

    it('should return null when tag not found', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain(null, { message: 'Not found' });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      const content = await fetchEntityContent('tag', 'nonexistent');

      expect(content).toBeNull();
    });
  });

  describe('Processor Routing', () => {
    it('should return null for unknown entity types', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      // TypeScript won't allow 'unknown' but we test runtime behavior
      const content = await fetchEntityContent('unknown' as 'item', 'id-123');

      expect(content).toBeNull();
    });

    it('should fetch from items table for item entity type', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        name: 'Test',
        description: 'Test',
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('item', 'item-123');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('items');
    });

    it('should fetch from item_articles table for article entity type', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        title: 'Test',
        description: 'Test',
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('article', 'article-123');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('item_articles');
    });

    it('should fetch from item_links table for link entity type', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        title: 'Test',
        source_language: 'en',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('link', 'link-123');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('item_links');
    });

    it('should fetch from tag_translations table for tag entity type', async () => {
      const { fetchEntityContent } = await import('../job-processor');

      const mockChain = createMockSelectChain({
        tag_key: 'test',
        translated_value: 'Test',
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain);

      await fetchEntityContent('tag', 'test-tag');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tag_translations');
    });
  });
});
