# Implementation Breakdown: REQ-E04-026 Performance Validation

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E04-026 |
| **Title** | Performance Validation |
| **Type** | TESTING |
| **Size** | S (2-3 hours) |
| **Epic** | L10N Epic 4 - Guest Experience |
| **Status** | PENDING |
| **Created** | 2026-01-22 19:59 |
| **Modified** | 2026-01-22 19:59 |

## Goals

Validate that the guest language detection and translation system meets performance requirements. Ensure that language detection, content loading with translations, and client-side language switching all operate within acceptable latency thresholds. Establish performance benchmarks for ongoing monitoring and regression detection.

### Performance Targets

| Operation | Target Latency |
|-----------|----------------|
| Middleware language detection | < 10ms |
| Server-side detection function | < 5ms |
| Content fetch with translations | < 200ms |
| Client-side toggle (view original) | < 100ms |
| Language switcher interaction | < 50ms |
| Time to First Byte (TTFB) | No significant increase |
| Largest Contentful Paint (LCP) | No significant increase |

## Implementation Plan

### 1. **Create Performance Test Utilities**

**File**: `/src/__tests__/performance/performanceHelpers.ts` (NEW)

Create utilities for measuring and validating performance:

```typescript
/**
 * Performance measurement utilities for L10N features
 */

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceBenchmark {
  operation: string;
  targetMs: number;
  samples: number[];
  mean: number;
  median: number;
  p95: number;
  p99: number;
  passRate: number;
}

/**
 * Measures execution time of an async function
 */
export async function measureAsync<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Measures execution time of a sync function
 */
export function measureSync<T>(
  fn: () => T
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Runs a performance test multiple times and collects statistics
 */
export async function runBenchmark<T>(
  name: string,
  fn: () => Promise<T> | T,
  options: {
    iterations?: number;
    warmup?: number;
    targetMs?: number;
  } = {}
): Promise<PerformanceBenchmark> {
  const {
    iterations = 100,
    warmup = 10,
    targetMs = 100,
  } = options;

  const samples: number[] = [];

  // Warmup iterations (not counted)
  for (let i = 0; i < warmup; i++) {
    await fn();
  }

  // Measured iterations
  for (let i = 0; i < iterations; i++) {
    const isAsync = fn.constructor.name === 'AsyncFunction';
    const { duration } = isAsync
      ? await measureAsync(fn as () => Promise<T>)
      : measureSync(fn as () => T);
    samples.push(duration);
  }

  // Calculate statistics
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const passRate = samples.filter(s => s <= targetMs).length / samples.length;

  return {
    operation: name,
    targetMs,
    samples,
    mean,
    median,
    p95,
    p99,
    passRate,
  };
}

/**
 * Validates a benchmark meets performance requirements
 */
export function validateBenchmark(
  benchmark: PerformanceBenchmark,
  options: {
    requireP95?: boolean;
    requireP99?: boolean;
    minPassRate?: number;
  } = {}
): { passed: boolean; message: string } {
  const {
    requireP95 = true,
    requireP99 = false,
    minPassRate = 0.95,
  } = options;

  const { operation, targetMs, mean, p95, p99, passRate } = benchmark;

  // Check pass rate
  if (passRate < minPassRate) {
    return {
      passed: false,
      message: `${operation}: Pass rate ${(passRate * 100).toFixed(1)}% below minimum ${(minPassRate * 100)}%`,
    };
  }

  // Check P95
  if (requireP95 && p95 > targetMs) {
    return {
      passed: false,
      message: `${operation}: P95 ${p95.toFixed(2)}ms exceeds target ${targetMs}ms`,
    };
  }

  // Check P99
  if (requireP99 && p99 > targetMs) {
    return {
      passed: false,
      message: `${operation}: P99 ${p99.toFixed(2)}ms exceeds target ${targetMs}ms`,
    };
  }

  return {
    passed: true,
    message: `${operation}: ✓ Mean ${mean.toFixed(2)}ms, P95 ${p95.toFixed(2)}ms, Pass rate ${(passRate * 100).toFixed(1)}%`,
  };
}

/**
 * Creates a mock NextRequest for performance testing
 */
export function createMockRequest(options: {
  url?: string;
  searchParams?: Record<string, string>;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}): any {
  const url = new URL(options.url || 'http://localhost:3000/item/test123');

  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const cookies = new Map(Object.entries(options.cookies || {}));
  const headers = new Map(Object.entries(options.headers || {}));

  return {
    url: url.toString(),
    nextUrl: url,
    cookies: {
      get: (name: string) => cookies.get(name) ? { value: cookies.get(name) } : undefined,
    },
    headers: {
      get: (name: string) => headers.get(name) || null,
    },
  };
}

/**
 * Simulates network latency for realistic testing
 */
export function simulateNetworkLatency(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats benchmark results for console output
 */
export function formatBenchmarkReport(benchmarks: PerformanceBenchmark[]): string {
  const lines = [
    '╔═══════════════════════════════════════════════════════════════════════╗',
    '║                      Performance Benchmark Report                     ║',
    '╠═══════════════════════════════════════════════════════════════════════╣',
  ];

  benchmarks.forEach(b => {
    lines.push(`║ ${b.operation.padEnd(40)} │ Target: ${b.targetMs}ms`.padEnd(72) + '║');
    lines.push(`║   Mean: ${b.mean.toFixed(2)}ms │ Median: ${b.median.toFixed(2)}ms │ P95: ${b.p95.toFixed(2)}ms │ P99: ${b.p99.toFixed(2)}ms`.padEnd(72) + '║');
    lines.push(`║   Pass rate: ${(b.passRate * 100).toFixed(1)}%`.padEnd(72) + '║');
    lines.push('║' + '─'.repeat(70) + '║');
  });

  lines.push('╚═══════════════════════════════════════════════════════════════════════╝');

  return lines.join('\n');
}
```

---

### 2. **Create Language Detection Performance Tests**

**File**: `/src/__tests__/performance/languageDetection.perf.test.ts` (NEW)

Test language detection performance:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { detectGuestLanguage } from '@/lib/i18n/guest-language';
import {
  runBenchmark,
  validateBenchmark,
  createMockRequest,
  formatBenchmarkReport,
  type PerformanceBenchmark,
} from './performanceHelpers';

describe('Language Detection - Performance', () => {
  const benchmarks: PerformanceBenchmark[] = [];

  describe('Server-Side Detection Function', () => {
    it('detects language from URL parameter in < 5ms', async () => {
      const request = createMockRequest({
        searchParams: { lang: 'fr' },
      });

      const benchmark = await runBenchmark(
        'URL parameter detection',
        () => detectGuestLanguage('fr', request),
        { targetMs: 5, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('detects language from cookie in < 5ms', async () => {
      const request = createMockRequest({
        cookies: { FAQBNB_GUEST_LANG: 'es' },
      });

      const benchmark = await runBenchmark(
        'Cookie detection',
        () => detectGuestLanguage(null, request),
        { targetMs: 5, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('parses Accept-Language header in < 5ms', async () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7' },
      });

      const benchmark = await runBenchmark(
        'Accept-Language parsing',
        () => detectGuestLanguage(null, request),
        { targetMs: 5, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('full detection cascade in < 5ms', async () => {
      const request = createMockRequest({
        searchParams: { lang: 'de' },
        cookies: { FAQBNB_GUEST_LANG: 'es' },
        headers: { 'Accept-Language': 'fr-FR,fr;q=0.9' },
      });

      const benchmark = await runBenchmark(
        'Full detection cascade',
        () => detectGuestLanguage('de', request),
        { targetMs: 5, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Edge Cases Performance', () => {
    it('handles invalid language codes efficiently', async () => {
      const request = createMockRequest({});

      const benchmark = await runBenchmark(
        'Invalid language fallback',
        () => detectGuestLanguage('invalid-lang', request),
        { targetMs: 5, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });

    it('handles malformed Accept-Language efficiently', async () => {
      const request = createMockRequest({
        headers: { 'Accept-Language': ';;;invalid;;;' },
      });

      const benchmark = await runBenchmark(
        'Malformed header handling',
        () => detectGuestLanguage(null, request),
        { targetMs: 5, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });
  });

  // Print report after all tests
  afterAll(() => {
    console.log('\n' + formatBenchmarkReport(benchmarks));
  });
});
```

---

### 3. **Create Content Loading Performance Tests**

**File**: `/src/__tests__/performance/contentLoading.perf.test.ts` (NEW)

Test content fetching and translation merging performance:

```typescript
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { fetchTranslatedItem } from '@/lib/i18n/translation-fetch';
import {
  runBenchmark,
  validateBenchmark,
  simulateNetworkLatency,
  formatBenchmarkReport,
  type PerformanceBenchmark,
} from './performanceHelpers';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: mockItemData,
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

const mockItemData = {
  id: 'item-1',
  public_id: 'test123',
  name: 'Test Item',
  description: 'Test description',
  source_language: 'en',
  translations: {
    fr: {
      name: 'Article Test',
      description: 'Description test',
    },
  },
  links: [],
  articles: [],
  tags: [],
};

describe('Content Loading - Performance', () => {
  const benchmarks: PerformanceBenchmark[] = [];

  describe('Item Fetching with Translation Merge', () => {
    it('fetches and merges translation in < 200ms', async () => {
      const benchmark = await runBenchmark(
        'Fetch with translation',
        () => fetchTranslatedItem('test123', 'fr'),
        { targetMs: 200, iterations: 100 }
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
        'Fetch original (no translation)',
        () => fetchTranslatedItem('test123', 'en'),
        { targetMs: 200, iterations: 100 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });

    it('handles missing translation efficiently', async () => {
      const benchmark = await runBenchmark(
        'Fetch with missing translation fallback',
        () => fetchTranslatedItem('test123', 'de'),
        { targetMs: 200, iterations: 100 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });
  });

  describe('Batch Operations Performance', () => {
    it('batch fetches article translations efficiently', async () => {
      const articleIds = ['article-1', 'article-2', 'article-3'];

      const benchmark = await runBenchmark(
        'Batch article translation fetch',
        () => fetchArticleTranslations(articleIds, 'fr'),
        { targetMs: 250, iterations: 50 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('batch fetches link translations efficiently', async () => {
      const linkIds = ['link-1', 'link-2', 'link-3'];

      const benchmark = await runBenchmark(
        'Batch link translation fetch',
        () => fetchLinkTranslations(linkIds, 'fr'),
        { targetMs: 250, iterations: 50 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });
  });

  afterAll(() => {
    console.log('\n' + formatBenchmarkReport(benchmarks));
  });
});
```

---

### 4. **Create Client-Side Performance Tests**

**File**: `/src/__tests__/performance/clientInteractions.perf.test.ts` (NEW)

Test client-side language switching performance:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import {
  runBenchmark,
  validateBenchmark,
  measureSync,
  formatBenchmarkReport,
  type PerformanceBenchmark,
} from './performanceHelpers';

describe('Client-Side Interactions - Performance', () => {
  const benchmarks: PerformanceBenchmark[] = [];

  describe('useGuestLanguage Hook', () => {
    it('toggleOriginal completes in < 100ms', async () => {
      const { result } = renderHook(() =>
        useGuestLanguage({
          initialLanguage: 'fr',
          availableLanguages: ['en', 'fr', 'es'],
        })
      );

      const benchmark = await runBenchmark(
        'Toggle original content',
        () => {
          act(() => {
            result.current.toggleOriginal();
          });
        },
        { targetMs: 100, iterations: 100 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('setLanguage completes in < 100ms', async () => {
      const { result } = renderHook(() =>
        useGuestLanguage({
          initialLanguage: 'en',
          availableLanguages: ['en', 'fr', 'es'],
        })
      );

      const benchmark = await runBenchmark(
        'Change language',
        () => {
          act(() => {
            result.current.setLanguage('fr');
          });
        },
        { targetMs: 100, iterations: 100 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });
  });

  describe('Component Render Performance', () => {
    it('GuestLanguageSwitcher renders in < 50ms', async () => {
      const { GuestLanguageSwitcher } = await import('@/components/guest/GuestLanguageSwitcher');
      const { render } = await import('@testing-library/react');

      const benchmark = await runBenchmark(
        'Language switcher render',
        () => {
          render(
            <GuestLanguageSwitcher
              currentLanguage="en"
              availableLanguages={['en', 'fr', 'es']}
              onLanguageChange={() => {}}
            />
          );
        },
        { targetMs: 50, iterations: 50 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('TranslationBanner renders in < 50ms', async () => {
      const { TranslationBanner } = await import('@/components/guest/TranslationBanner');
      const { render } = await import('@testing-library/react');

      const benchmark = await runBenchmark(
        'Translation banner render',
        () => {
          render(
            <TranslationBanner
              sourceLanguage="en"
              onViewOriginal={() => {}}
            />
          );
        },
        { targetMs: 50, iterations: 50 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });
  });

  describe('Cookie Operations', () => {
    it('setGuestLanguageCookie completes in < 10ms', async () => {
      const { setGuestLanguageCookie } = await import('@/lib/i18n/guest-language');

      const mockResponse = {
        cookies: {
          set: vi.fn(),
        },
      };

      const benchmark = await runBenchmark(
        'Set language cookie',
        () => setGuestLanguageCookie(mockResponse as any, 'fr'),
        { targetMs: 10, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
      });

      expect(validation.passed).toBe(true);
    });
  });

  afterAll(() => {
    console.log('\n' + formatBenchmarkReport(benchmarks));
  });
});
```

---

### 5. **Create Page Load Performance Tests**

**File**: `/src/__tests__/performance/pageLoad.perf.test.ts` (NEW)

Test server-side rendering and page load metrics:

```typescript
import { describe, it, expect } from 'vitest';
import {
  runBenchmark,
  validateBenchmark,
  formatBenchmarkReport,
  type PerformanceBenchmark,
} from './performanceHelpers';

describe('Page Load - Performance', () => {
  const benchmarks: PerformanceBenchmark[] = [];

  describe('Server-Side Rendering', () => {
    it('guest item page SSR in < 500ms (with translation)', async () => {
      // Mock page component import
      const { default: ItemPage } = await import('@/app/item/[publicId]/page');

      const benchmark = await runBenchmark(
        'Item page SSR with translation',
        async () => {
          await ItemPage({
            params: Promise.resolve({ publicId: 'test123' }),
            searchParams: Promise.resolve({ lang: 'fr' }),
          });
        },
        { targetMs: 500, iterations: 20 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.80,
      });

      expect(validation.passed).toBe(true);
    });

    it('metadata generation in < 100ms', async () => {
      const { generateMetadata } = await import('@/app/item/[publicId]/page');

      const benchmark = await runBenchmark(
        'Generate page metadata',
        async () => {
          await generateMetadata({
            params: Promise.resolve({ publicId: 'test123' }),
            searchParams: Promise.resolve({ lang: 'fr' }),
          });
        },
        { targetMs: 100, iterations: 50 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark);
      expect(validation.passed).toBe(true);
    });
  });

  describe('Core Web Vitals Impact', () => {
    it('TTFB increase is acceptable (< 50ms delta)', async () => {
      // Baseline: page without translation
      const baselineBenchmark = await runBenchmark(
        'TTFB baseline (no translation)',
        async () => {
          const response = await fetch('http://localhost:3000/item/test123');
          return response;
        },
        { targetMs: 200, iterations: 20 }
      );

      // With translation
      const translatedBenchmark = await runBenchmark(
        'TTFB with translation',
        async () => {
          const response = await fetch('http://localhost:3000/item/test123?lang=fr');
          return response;
        },
        { targetMs: 250, iterations: 20 }
      );

      const delta = translatedBenchmark.mean - baselineBenchmark.mean;

      benchmarks.push(baselineBenchmark);
      benchmarks.push(translatedBenchmark);

      expect(delta).toBeLessThan(50);
      console.log(`TTFB delta: ${delta.toFixed(2)}ms`);
    });

    it('LCP does not significantly increase with translation', async () => {
      // This would require actual browser testing with Lighthouse/Puppeteer
      // Placeholder for integration with E2E testing framework

      // For unit testing, we validate that content rendering time is acceptable
      const benchmark = await runBenchmark(
        'Content render time',
        async () => {
          const { render } = await import('@testing-library/react');
          const { ItemDisplay } = await import('@/components/ItemDisplay');

          render(
            <ItemDisplay
              item={mockItem}
              translationMeta={mockTranslationMeta}
            />
          );
        },
        { targetMs: 100, iterations: 50 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });
  });

  afterAll(() => {
    console.log('\n' + formatBenchmarkReport(benchmarks));
  });
});

const mockItem = {
  id: 'item-1',
  publicId: 'test123',
  name: 'Guide Wifi',
  originalName: 'Wifi Guide',
  description: 'Instructions',
  originalDescription: 'Instructions',
  sourceLanguage: 'en',
  links: [],
  articles: [],
  tags: [],
};

const mockTranslationMeta = {
  requestedLanguage: 'fr',
  displayLanguage: 'fr',
  originalLanguage: 'en',
  availableLanguages: ['en', 'fr'],
  isTranslated: true,
};
```

---

### 6. **Create Performance Test Runner Script**

**File**: `/scripts/run-perf-tests.sh` (NEW)

Convenient script for running performance tests:

```bash
#!/usr/bin/env bash

# Run L10N performance tests and generate report

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        L10N Performance Test Suite                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Run tests with performance output
npm run test -- \
  --run \
  --reporter=verbose \
  src/__tests__/performance/*.perf.test.ts

echo ""
echo "Performance tests complete!"
echo "Review benchmark reports above for detailed metrics."
```

---

### 7. **Update package.json Scripts**

**File**: `/package.json` (MODIFY)

Add performance test script:

```json
{
  "scripts": {
    "test:perf": "vitest run src/__tests__/performance/*.perf.test.ts",
    "test:perf:watch": "vitest watch src/__tests__/performance/*.perf.test.ts",
    "test:perf:ui": "vitest --ui src/__tests__/performance/*.perf.test.ts"
  }
}
```

---

## Authorized Files and Functions for Modification

### New Test Files (CREATE)

| File | Purpose |
|------|---------|
| `/src/__tests__/performance/performanceHelpers.ts` | Performance measurement utilities |
| `/src/__tests__/performance/languageDetection.perf.test.ts` | Language detection performance tests |
| `/src/__tests__/performance/contentLoading.perf.test.ts` | Content fetch performance tests |
| `/src/__tests__/performance/clientInteractions.perf.test.ts` | Client-side performance tests |
| `/src/__tests__/performance/pageLoad.perf.test.ts` | Page load performance tests |
| `/scripts/run-perf-tests.sh` | Performance test runner script |

### Existing Files (MODIFY)

| File | Changes |
|------|---------|
| `/package.json` | Add `test:perf` scripts |

---

## Dependencies

### Depends On

- **REQ-E04-002**: Guest language utility must exist
- **REQ-E04-004**: Translation fetch utilities must exist
- **REQ-E04-008**: GuestLanguageSwitcher component must exist
- **REQ-E04-009**: TranslationBanner component must exist
- **REQ-E04-014**: useGuestLanguage hook must exist
- **REQ-E04-016**: Guest item page with translation support must exist
- **REQ-E04-020**: Middleware language detection must exist
- **REQ-E04-021**: Server-side detection utility must exist

### Blocks

- None (testing task doesn't block other implementation)

### Parallel Safety

- **SAFE**: Can be implemented in parallel with REQ-E04-025 (Mobile Testing)
- **SAFE**: Does not conflict with functional tests

---

## Testing Strategy

### Performance Benchmark Methodology

**Iterations**: Each benchmark runs 100-1000 iterations with 10 warmup iterations to eliminate cold-start bias.

**Statistics**: Report mean, median, P95, and P99 latencies to understand performance distribution.

**Pass Criteria**:
- P95 latency must be within target for critical paths
- 95% of samples must meet target latency
- No significant regressions from baseline measurements

### Manual Performance Validation

After automated tests pass, validate with:

1. **Lighthouse Audits**:
   - Run Lighthouse on guest item pages
   - Compare scores with and without translation
   - Validate Core Web Vitals (LCP, FID, CLS)

2. **Chrome DevTools Performance Tab**:
   - Record page load with translation
   - Verify no long tasks blocking main thread
   - Check for excessive memory usage

3. **Network Throttling**:
   - Test with "Fast 3G" throttling
   - Verify acceptable performance on slow connections
   - Check for efficient caching

4. **Production Monitoring**:
   - Set up Real User Monitoring (RUM)
   - Track P95 TTFB and LCP in production
   - Alert on performance regressions

---

## Risks and Considerations

### Risk: Test Environment Performance

**Issue**: Local test environment may not match production performance.

**Mitigation**:
- Use consistent CI environment for benchmarks
- Establish baseline measurements in production
- Monitor production metrics continuously

### Risk: Database Query Performance

**Issue**: Translation queries may be slow with real data volume.

**Mitigation**:
- Ensure proper database indexes
- Test with realistic data volumes
- Monitor slow query logs in production

### Risk: Network Latency Variability

**Issue**: Network conditions affect real-world performance.

**Mitigation**:
- Test with simulated latency
- Validate on real devices over cellular
- Set up CDN for static assets

### Risk: Cold Start Performance

**Issue**: First request may be slower than subsequent requests.

**Mitigation**:
- Use warmup iterations in benchmarks
- Measure "cold start" separately
- Consider connection pooling

---

## Out of Scope

1. **E2E performance testing** - Requires Playwright/Puppeteer setup
2. **Load testing** - Stress testing with concurrent users
3. **Database query optimization** - Handled in infrastructure layer
4. **CDN configuration** - Infrastructure concern
5. **Bundle size optimization** - Separate build optimization task
6. **Server-side caching strategy** - Separate caching task
7. **Real User Monitoring setup** - Production monitoring setup

---

## Implementation Notes

### Performance Budget

Establish performance budgets for each operation:

| Category | Operation | Budget |
|----------|-----------|--------|
| **Critical Path** | Middleware detection | 10ms |
| **Critical Path** | Server detection | 5ms |
| **Critical Path** | Content fetch | 200ms |
| **User Interaction** | Toggle original | 100ms |
| **User Interaction** | Language switch | 100ms |
| **User Interaction** | Dropdown open | 50ms |
| **Page Load** | TTFB increase | < 50ms |
| **Page Load** | LCP increase | < 100ms |

### Continuous Performance Monitoring

**In CI Pipeline**:
- Run performance tests on every PR
- Fail if P95 exceeds targets by > 10%
- Track performance trends over time

**In Production**:
- Monitor TTFB P95 via analytics
- Track LCP via Core Web Vitals
- Alert on > 20% degradation

### Optimization Opportunities

If performance targets not met:

1. **Database Optimization**:
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Consider query result caching

2. **Middleware Optimization**:
   - Minimize processing in middleware
   - Move heavy operations to page load
   - Consider edge caching

3. **Client-Side Optimization**:
   - Memoize expensive computations
   - Use React.memo for static components
   - Lazy load heavy components

---

## Verification Checklist

- [ ] All performance test files created
- [ ] Performance helper utilities implemented
- [ ] Language detection benchmarks passing
- [ ] Content loading benchmarks passing
- [ ] Client interaction benchmarks passing
- [ ] Page load benchmarks passing
- [ ] All P95 targets met
- [ ] Performance test script executable
- [ ] package.json scripts added
- [ ] Benchmarks integrated into CI pipeline
- [ ] Performance report format readable
- [ ] Manual Lighthouse validation complete
- [ ] Production monitoring configured
- [ ] Performance documentation updated

---

## Performance Monitoring Dashboard

**Recommended Metrics to Track**:

```
┌─────────────────────────────────────────────────────────────┐
│ L10N Performance Dashboard                                  │
├─────────────────────────────────────────────────────────────┤
│ Middleware Detection (P95):        8.3ms   [Target: 10ms]  │
│ Server Detection (P95):             3.1ms   [Target: 5ms]   │
│ Content Fetch (P95):              178ms    [Target: 200ms]  │
│ Toggle Original (P95):             82ms    [Target: 100ms]  │
│ Language Switch (P95):             91ms    [Target: 100ms]  │
│ Dropdown Interaction (P95):        38ms    [Target: 50ms]   │
├─────────────────────────────────────────────────────────────┤
│ Page Load Metrics:                                          │
│ TTFB (with translation):          223ms                     │
│ TTFB Delta:                       +34ms    [Target: <50ms]  │
│ LCP (with translation):           1.8s                      │
│ LCP Delta:                        +67ms    [Target: <100ms] │
├─────────────────────────────────────────────────────────────┤
│ Status: ✓ ALL TARGETS MET                                   │
└─────────────────────────────────────────────────────────────┘
```

This dashboard should be:
- Displayed in CI test output
- Available in development via `npm run test:perf`
- Monitored continuously in production
