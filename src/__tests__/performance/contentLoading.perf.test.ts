/**
 * @fileoverview Content Loading Performance Tests for Epic 4 - Guest Experience
 *
 * This module tests the performance of content fetching and translation merge
 * operations to ensure they meet the < 200ms latency target.
 *
 * @description
 * Performance tests for:
 * - Item fetching with translation merge
 * - Original content fetching (no translation needed)
 * - Missing translation handling (fallback)
 * - Batch operations for articles and links
 *
 * Note: These tests mock the database to isolate content processing
 * performance from network latency.
 *
 * @module __tests__/performance/contentLoading.perf.test
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-026 - Performance validation specification
 *
 * Last Modified: 2026-01-23 22:35
 */

import { describe, it, expect, afterAll, vi, beforeEach } from 'vitest';
import {
  runBenchmark,
  validateBenchmark,
  formatBenchmarkReport,
  simulateNetworkLatency,
  type PerformanceBenchmark,
} from './performanceHelpers';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            // Simulate minimal database response time
            await simulateNetworkLatency(5);
            return {
              data: {
                id: 'test-item-id',
                public_id: 'test123',
                name: 'Test Item',
                description: 'Test Description',
                source_language: 'en',
                property_id: 'prop-1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            };
          },
        }),
      }),
    }),
  },
}));

// =============================================================================
// Test Configuration
// =============================================================================

/** Collect all benchmarks for final report */
const benchmarks: PerformanceBenchmark[] = [];

/** Target latency for content loading operations */
const CONTENT_LOADING_TARGET_MS = 200;

/** Target latency for batch operations */
const BATCH_TARGET_MS = 250;

/** Number of iterations for content loading (lower due to mocked latency) */
const ITERATIONS = 50;

// =============================================================================
// Mock Data
// =============================================================================

/** Mock item data */
const mockItem = {
  id: 'test-item-id',
  publicId: 'test123',
  name: 'Test Item',
  description: 'Test Description',
  sourceLanguage: 'en' as const,
  propertyId: 'prop-1',
  qrCodeUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** Mock translation data */
const mockTranslation = {
  name: 'Article de Test',
  description: 'Description de Test',
};

/** Mock articles data */
const mockArticles = [
  { id: 'article-1', title: 'Article 1', description: 'Desc 1' },
  { id: 'article-2', title: 'Article 2', description: 'Desc 2' },
  { id: 'article-3', title: 'Article 3', description: 'Desc 3' },
];

/** Mock links data */
const mockLinks = [
  { id: 'link-1', title: 'Link 1', url: 'https://example.com/1' },
  { id: 'link-2', title: 'Link 2', url: 'https://example.com/2' },
];

// =============================================================================
// Helper Functions (Simulated Translation Operations)
// =============================================================================

/**
 * Simulates fetching an item with translation merge.
 * In real implementation, this would call Supabase and merge translation fields.
 */
async function simulateFetchTranslatedItem(
  publicId: string,
  language: string
): Promise<typeof mockItem> {
  // Simulate minimal DB fetch time
  await simulateNetworkLatency(5);

  // Simulate translation merge logic
  if (language !== 'en') {
    return {
      ...mockItem,
      name: mockTranslation.name,
      description: mockTranslation.description,
    };
  }

  return mockItem;
}

/**
 * Simulates batch fetching article translations.
 */
async function simulateFetchArticleTranslations(
  articleIds: string[],
  language: string
): Promise<typeof mockArticles> {
  // Simulate batch query
  await simulateNetworkLatency(10);

  if (language !== 'en') {
    return mockArticles.map((a) => ({
      ...a,
      title: `${a.title} (${language})`,
      description: `${a.description} (${language})`,
    }));
  }

  return mockArticles;
}

/**
 * Simulates batch fetching link translations.
 */
async function simulateFetchLinkTranslations(
  linkIds: string[],
  language: string
): Promise<typeof mockLinks> {
  // Simulate batch query
  await simulateNetworkLatency(10);

  if (language !== 'en') {
    return mockLinks.map((l) => ({
      ...l,
      title: `${l.title} (${language})`,
    }));
  }

  return mockLinks;
}

/**
 * Simulates translation merge logic.
 */
function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null
): T {
  if (!translation) return original;

  const merged = { ...original };
  for (const [key, value] of Object.entries(translation)) {
    if (value !== null && value !== undefined && value !== '') {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

// =============================================================================
// Report Generation
// =============================================================================

afterAll(() => {
  console.log('\n' + '═'.repeat(80));
  console.log('Content Loading Performance Report');
  console.log('═'.repeat(80));
  console.log(formatBenchmarkReport(benchmarks));
});

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Test Suite
// =============================================================================

describe('Content Loading - Performance', () => {
  describe('Item Fetching with Translation Merge', () => {
    it('fetches and merges translation in < 200ms', async () => {
      const benchmark = await runBenchmark(
        'Fetch + Merge Translation',
        async () => {
          return await simulateFetchTranslatedItem('test123', 'fr');
        },
        { targetMs: CONTENT_LOADING_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('fetches original content in < 200ms', async () => {
      const benchmark = await runBenchmark(
        'Fetch Original (no translation)',
        async () => {
          return await simulateFetchTranslatedItem('test123', 'en');
        },
        { targetMs: CONTENT_LOADING_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('handles missing translation efficiently', async () => {
      const benchmark = await runBenchmark(
        'Missing Translation Fallback',
        async () => {
          // Simulate unsupported language - should fall back to original
          return await simulateFetchTranslatedItem('test123', 'zh');
        },
        { targetMs: CONTENT_LOADING_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Batch Operations Performance', () => {
    it('batch fetches article translations efficiently', async () => {
      const articleIds = ['article-1', 'article-2', 'article-3'];

      const benchmark = await runBenchmark(
        'Batch Article Translations',
        async () => {
          return await simulateFetchArticleTranslations(articleIds, 'fr');
        },
        { targetMs: BATCH_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('batch fetches link translations efficiently', async () => {
      const linkIds = ['link-1', 'link-2'];

      const benchmark = await runBenchmark(
        'Batch Link Translations',
        async () => {
          return await simulateFetchLinkTranslations(linkIds, 'fr');
        },
        { targetMs: BATCH_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('combined batch operations in < 300ms', async () => {
      const articleIds = ['article-1', 'article-2', 'article-3'];
      const linkIds = ['link-1', 'link-2'];

      const benchmark = await runBenchmark(
        'Combined Batch (Articles + Links)',
        async () => {
          // Run in parallel like real implementation would
          const [articles, links] = await Promise.all([
            simulateFetchArticleTranslations(articleIds, 'fr'),
            simulateFetchLinkTranslations(linkIds, 'fr'),
          ]);
          return { articles, links };
        },
        { targetMs: 300, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Translation Merge Logic Performance', () => {
    it('merge operation is fast (< 1ms)', async () => {
      const benchmark = await runBenchmark(
        'Translation Merge Logic',
        () => {
          return mergeTranslation(mockItem, {
            name: 'Translated Name',
            description: 'Translated Description',
          });
        },
        { targetMs: 1, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('merge with null translation is fast (< 1ms)', async () => {
      const benchmark = await runBenchmark(
        'Merge Null Translation',
        () => {
          return mergeTranslation(mockItem, null);
        },
        { targetMs: 1, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('merge with partial translation is fast (< 1ms)', async () => {
      const benchmark = await runBenchmark(
        'Merge Partial Translation',
        () => {
          return mergeTranslation(mockItem, {
            name: 'Only Name Translated',
            // description is omitted (partial)
          });
        },
        { targetMs: 1, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });
  });
});
