/**
 * E2E Test Utilities for Content Translation
 *
 * Provides setup/teardown functions and context management for E2E tests.
 *
 * @module content-translation/__tests__/e2e/helpers/e2e-test-utils
 * @lastModified 2026-01-21
 */

import { vi } from 'vitest';
import {
  resetMockDatabase,
  seedMockDatabase,
  createMockSupabaseServer,
} from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';

/**
 * Test item entity interface
 */
export interface TestItem {
  id: string;
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  sourceLanguage: string;
  tags?: string[];
  createdAt: string;
}

/**
 * Test article entity interface
 */
export interface TestArticle {
  id: string;
  itemId: string;
  title: string;
  description: string;
  sourceLanguage: string;
  createdAt: string;
}

/**
 * Test link entity interface
 */
export interface TestLink {
  id: string;
  itemId: string;
  title: string;
  url: string;
  sourceLanguage: string;
  createdAt: string;
}

/**
 * Test property entity interface
 */
export interface TestProperty {
  id: string;
  name: string;
  accountId: string;
}

/**
 * E2E test context containing all mock infrastructure
 */
export interface E2ETestContext {
  mockSupabase: ReturnType<typeof createMockSupabaseServer>;
  mockTranslationService: {
    translateText: ReturnType<typeof vi.fn>;
    translateToAllLanguages: ReturnType<typeof vi.fn>;
  };
  testEntities: {
    items: TestItem[];
    articles: TestArticle[];
    links: TestLink[];
    properties: TestProperty[];
  };
  cleanup: () => Promise<void>;
}

/**
 * Sets up a complete E2E test context with mock database and services.
 */
export async function setupE2ETestContext(): Promise<E2ETestContext> {
  // Reset mock database to clean state
  resetMockDatabase();

  // Initialize empty arrays for all tables
  seedMockDatabase(TABLE_NAMES.ITEMS, []);
  seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, []);
  seedMockDatabase(TABLE_NAMES.ITEM_LINKS, []);
  seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, []);
  seedMockDatabase(TABLE_NAMES.ITEM_TRANSLATIONS, []);
  seedMockDatabase(TABLE_NAMES.ARTICLE_TRANSLATIONS, []);
  seedMockDatabase(TABLE_NAMES.LINK_TRANSLATIONS, []);
  seedMockDatabase(TABLE_NAMES.TAG_TRANSLATIONS, []);
  seedMockDatabase('properties', []);

  // Create mock Supabase client
  const mockSupabase = createMockSupabaseServer();

  // Create mock translation service
  const mockTranslationService = {
    translateText: vi.fn().mockResolvedValue({
      translatedText: 'Translated text',
      provider: 'claude',
      tokensUsed: 50,
    }),
    translateToAllLanguages: vi.fn().mockResolvedValue({
      translations: {
        en: 'English text',
        fr: 'Texte français',
        es: 'Texto español',
        de: 'Deutscher Text',
        nl: 'Nederlandse tekst',
        it: 'Testo italiano',
      },
      provider: 'claude',
      totalTokensUsed: 300,
    }),
  };

  const context: E2ETestContext = {
    mockSupabase,
    mockTranslationService,
    testEntities: {
      items: [],
      articles: [],
      links: [],
      properties: [],
    },
    cleanup: async () => {
      vi.clearAllMocks();
      resetMockDatabase();
    },
  };

  return context;
}

/**
 * Tears down the E2E test context and cleans up resources.
 */
export async function teardownE2ETestContext(ctx: E2ETestContext): Promise<void> {
  await ctx.cleanup();
  vi.restoreAllMocks();
}

/**
 * Helper to simulate processing time passing
 */
export function advanceTime(ms: number): void {
  vi.advanceTimersByTime(ms);
}

/**
 * Helper to get a unique test ID
 */
export function generateTestId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
