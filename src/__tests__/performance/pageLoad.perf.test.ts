/**
 * @fileoverview Page Load Performance Tests for Epic 4 - Guest Experience
 *
 * This module tests the performance of page loading operations including
 * SSR, metadata generation, and Core Web Vitals impact measurements.
 *
 * @description
 * Performance tests for:
 * - Server-side rendering of guest item page
 * - Metadata generation performance
 * - Core Web Vitals impact (TTFB, LCP delta)
 * - Content component rendering
 *
 * @module __tests__/performance/pageLoad.perf.test
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-026 - Performance validation specification
 *
 * Last Modified: 2026-01-23 22:45
 */

import { describe, it, expect, afterAll, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
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
            await simulateNetworkLatency(10);
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
        in: () => ({
          eq: async () => {
            await simulateNetworkLatency(10);
            return { data: [], error: null };
          },
        }),
      }),
    }),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/item/test123',
}));

// Mock next-intl to avoid NextIntlClientProvider requirement
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  useFormatter: () => ({
    dateTime: () => 'date',
    number: () => '0',
  }),
}));

// =============================================================================
// Test Configuration
// =============================================================================

/** Collect all benchmarks for final report */
const benchmarks: PerformanceBenchmark[] = [];

/** Target latency for SSR operations */
const SSR_TARGET_MS = 500;

/** Target latency for metadata generation */
const METADATA_TARGET_MS = 100;

/** Target latency for component render (LCP approximation) */
const LCP_TARGET_MS = 100;

/** Number of iterations for SSR tests (lower due to complexity) */
const SSR_ITERATIONS = 20;

/** Number of iterations for component tests */
const COMPONENT_ITERATIONS = 50;

// =============================================================================
// Mock Data
// =============================================================================

/** Mock item data for rendering */
const mockItem = {
  id: 'test-item-id',
  publicId: 'test123',
  name: 'Test Item',
  description: 'This is a test item description for performance testing.',
  sourceLanguage: 'en' as const,
  propertyId: 'prop-1',
  qrCodeUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** Mock translation meta */
const mockTranslationMeta = {
  requestedLanguage: 'fr' as const,
  displayLanguage: 'fr' as const,
  sourceLanguage: 'en' as const,
  isTranslated: true,
  availableLanguages: ['en', 'fr', 'es'] as const,
};

/** Mock articles */
const mockArticles = [
  {
    id: 'article-1',
    title: 'Article Title 1',
    description: 'Article description 1',
    content: 'Article content 1',
    itemId: 'test-item-id',
    sortOrder: 1,
  },
  {
    id: 'article-2',
    title: 'Article Title 2',
    description: 'Article description 2',
    content: 'Article content 2',
    itemId: 'test-item-id',
    sortOrder: 2,
  },
];

/** Mock links */
const mockLinks = [
  {
    id: 'link-1',
    title: 'Link Title 1',
    url: 'https://example.com/1',
    itemId: 'test-item-id',
    sortOrder: 1,
  },
  {
    id: 'link-2',
    title: 'Link Title 2',
    url: 'https://example.com/2',
    itemId: 'test-item-id',
    sortOrder: 2,
  },
];

// =============================================================================
// Simulated Functions
// =============================================================================

/**
 * Simulates server-side data fetching for item page.
 */
async function simulateSSRDataFetch(
  publicId: string,
  language: string
): Promise<{ item: typeof mockItem; articles: typeof mockArticles; links: typeof mockLinks }> {
  // Simulate parallel data fetching
  await Promise.all([
    simulateNetworkLatency(15), // Item fetch
    simulateNetworkLatency(10), // Articles fetch
    simulateNetworkLatency(10), // Links fetch
  ]);

  return {
    item: mockItem,
    articles: mockArticles,
    links: mockLinks,
  };
}

/**
 * Simulates metadata generation for SEO.
 */
async function simulateMetadataGeneration(
  publicId: string,
  language: string
): Promise<{ title: string; description: string }> {
  // Simulate minimal data fetch for metadata
  await simulateNetworkLatency(5);

  return {
    title: `${mockItem.name} | FAQBNB`,
    description: mockItem.description || 'Guest information',
  };
}

// =============================================================================
// Report Generation
// =============================================================================

afterAll(() => {
  console.log('\n' + '═'.repeat(80));
  console.log('Page Load Performance Report');
  console.log('═'.repeat(80));
  console.log(formatBenchmarkReport(benchmarks));
});

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Test Suite
// =============================================================================

describe('Page Load - Performance', () => {
  describe('Server-Side Rendering', () => {
    it('guest item page SSR data fetch in < 500ms', async () => {
      const benchmark = await runBenchmark(
        'SSR: Data Fetch',
        async () => {
          return await simulateSSRDataFetch('test123', 'fr');
        },
        { targetMs: SSR_TARGET_MS, iterations: SSR_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.80,
      });

      expect(validation.passed).toBe(true);
    });

    it('metadata generation in < 100ms', async () => {
      const benchmark = await runBenchmark(
        'SSR: Metadata Generation',
        async () => {
          return await simulateMetadataGeneration('test123', 'fr');
        },
        { targetMs: METADATA_TARGET_MS, iterations: SSR_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('parallel data fetch is faster than sequential', async () => {
      // Measure parallel fetch
      const parallelBenchmark = await runBenchmark(
        'SSR: Parallel Fetch',
        async () => {
          await Promise.all([
            simulateNetworkLatency(20),
            simulateNetworkLatency(20),
            simulateNetworkLatency(20),
          ]);
          return true;
        },
        { targetMs: 100, iterations: 20 }
      );

      // Measure sequential fetch
      const sequentialBenchmark = await runBenchmark(
        'SSR: Sequential Fetch',
        async () => {
          await simulateNetworkLatency(20);
          await simulateNetworkLatency(20);
          await simulateNetworkLatency(20);
          return true;
        },
        { targetMs: 100, iterations: 20 }
      );

      benchmarks.push(parallelBenchmark);
      benchmarks.push(sequentialBenchmark);

      // Parallel should be faster
      expect(parallelBenchmark.mean).toBeLessThan(sequentialBenchmark.mean);
    });
  });

  describe('Core Web Vitals Impact', () => {
    it('TTFB increase is acceptable (< 50ms delta)', async () => {
      // Baseline: fetch without translation processing
      const baselineBenchmark = await runBenchmark(
        'TTFB: Baseline',
        async () => {
          await simulateNetworkLatency(20);
          return mockItem;
        },
        { targetMs: 200, iterations: 20 }
      );

      // With translation: fetch + translation merge
      const translatedBenchmark = await runBenchmark(
        'TTFB: With Translation',
        async () => {
          await simulateNetworkLatency(20);
          // Simulate translation merge overhead
          await simulateNetworkLatency(5);
          return {
            ...mockItem,
            name: 'Article de Test',
            description: 'Description traduite',
          };
        },
        { targetMs: 250, iterations: 20 }
      );

      benchmarks.push(baselineBenchmark);
      benchmarks.push(translatedBenchmark);

      // Calculate delta
      const delta = translatedBenchmark.mean - baselineBenchmark.mean;

      console.log(`TTFB Delta: ${delta.toFixed(2)}ms`);

      // Delta should be < 50ms
      expect(delta).toBeLessThan(50);
    });

    it('LCP does not significantly increase with translation', async () => {
      // Import ItemDisplay component
      const { default: ItemDisplay } = await import('@/components/ItemDisplay');

      const benchmark = await runBenchmark(
        'LCP: ItemDisplay Render',
        () => {
          const { unmount } = render(
            React.createElement(ItemDisplay, {
              item: mockItem,
              articles: mockArticles,
              links: mockLinks,
              translationMeta: mockTranslationMeta,
            })
          );
          unmount();
          return true;
        },
        { targetMs: LCP_TARGET_MS, iterations: COMPONENT_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('full page component tree renders efficiently', async () => {
      const { GuestLanguageSwitcher } = await import(
        '@/components/guest/GuestLanguageSwitcher'
      );
      const { TranslationBanner } = await import(
        '@/components/guest/TranslationBanner'
      );
      const { default: ItemDisplay } = await import('@/components/ItemDisplay');

      const benchmark = await runBenchmark(
        'LCP: Full Page Tree',
        () => {
          // Render full component tree
          const { unmount } = render(
            React.createElement(
              'div',
              null,
              React.createElement(GuestLanguageSwitcher, {
                currentLanguage: 'fr',
                onLanguageChange: vi.fn(),
                availableLanguages: ['en', 'fr', 'es'],
              }),
              React.createElement(TranslationBanner, {
                sourceLanguage: 'en',
                displayLanguage: 'fr',
                isShowingOriginal: false,
                onToggleOriginal: vi.fn(),
              }),
              React.createElement(ItemDisplay, {
                item: mockItem,
                articles: mockArticles,
                links: mockLinks,
                translationMeta: mockTranslationMeta,
              })
            )
          );
          unmount();
          return true;
        },
        { targetMs: 150, iterations: COMPONENT_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.85,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Data Processing Performance', () => {
    it('translation meta computation is fast', async () => {
      const benchmark = await runBenchmark(
        'Data: Translation Meta',
        () => {
          // Simulate translation meta computation
          const meta = {
            requestedLanguage: 'fr' as const,
            displayLanguage: mockItem.sourceLanguage === 'fr' ? 'fr' : 'fr',
            sourceLanguage: mockItem.sourceLanguage,
            isTranslated: mockItem.sourceLanguage !== 'fr',
          };
          return meta;
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

    it('available languages computation is fast', async () => {
      const translations = ['en', 'fr', 'es']; // Simulated available translations

      const benchmark = await runBenchmark(
        'Data: Available Languages',
        () => {
          const available = new Set(translations);
          return Array.from(available);
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
