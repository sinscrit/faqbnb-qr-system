# REQ-360: Performance Validation for Guest Localization System - Technical Overview

**Document Created:** 2026-01-19T12:00:00
**Last Modified:** 2026-01-19T12:00:00
**Request Reference:** `/docs/gen_requests_epic4.md` (REQ-329 - Performance Validation)
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Phase:** 7 - Testing & Polish
**Task ID:** 7.5
**Status:** Ready for Implementation

---

## 1. Summary

Implement comprehensive performance validation for the guest-facing localization system to ensure all language operations meet defined performance thresholds. This task validates three critical performance metrics:

1. **Language Detection Performance** - Verify detection completes in under 10ms
2. **Content with Translation Retrieval** - Verify translated content loads in under 200ms
3. **Client-side Language Switch** - Verify language toggle responds in under 100ms

**Key Responsibility:** This task ensures the localization system enhances rather than degrades the guest experience by validating that language detection, content retrieval with translations, and client-side language switching all meet defined performance benchmarks.

---

## 2. Context from Implementation Plan

### Phase 7 Position

```
7.1 Test Language Detection
       │
       ▼
7.2 Test Content Display
       │
       ▼
7.3 Test Edge Cases
       │
       ▼
7.4 Mobile Responsiveness
       │
       ▼
7.5 Performance Validation  ◄──── YOU ARE HERE
```

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 7.1 (Language Detection Tests) | Required | Detection logic must be tested before performance benchmarking |
| Task 7.2 (Content Display Tests) | Required | Translation display must be functional |
| Task 7.3 (Edge Cases) | Required | System must handle all scenarios before benchmarking |
| Task 7.4 (Mobile Responsiveness) | Required | UI must be stable for meaningful performance metrics |
| Epic 1 (Foundation) | Required | i18n infrastructure and language detection utility |
| Epic 3 (Dynamic Content) | Required | Translation tables and content merging |

### Performance Thresholds (from REQ-329)

| Operation | Target | Rationale |
|-----------|--------|-----------|
| Language detection | < 10ms | Minimal server-side overhead |
| Content with translation | < 200ms | Fast page rendering for guests |
| Client-side language switch | < 100ms | Instant, responsive feel |

### This Task's Scope

Task 7.5 is a validation task that:
- Creates performance test infrastructure for localization operations
- Measures and validates against defined thresholds
- Documents benchmark results for regression tracking
- Identifies bottlenecks when thresholds are not met

---

## 3. Technical Approach

### 3.1 Language Detection Performance Testing

The language detection function (`detectUserLanguage`) in `/src/lib/i18n/language-detection.ts` must be profiled across all detection scenarios.

**Test Scenarios:**

| Scenario | Input | Expected Time |
|----------|-------|---------------|
| URL parameter detection | `?lang=fr` | < 10ms |
| Cookie detection | `FAQBNB_LANG=de` | < 10ms |
| Accept-Language header (simple) | `Accept-Language: fr` | < 10ms |
| Accept-Language header (complex) | `Accept-Language: fr-FR,fr;q=0.9,en;q=0.8,de;q=0.7,*;q=0.5` | < 10ms |
| Fallback to default | No preference sources | < 10ms |

**Implementation Pattern:**

```typescript
// Performance test helper
function measureExecutionTime<T>(fn: () => T): { result: T; durationMs: number } {
  const start = performance.now();
  const result = fn();
  const durationMs = performance.now() - start;
  return { result, durationMs };
}

// Async version
async function measureExecutionTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  return { result, durationMs };
}

// Usage in tests
describe('Language Detection Performance', () => {
  it('detects language from URL parameter in under 10ms', () => {
    const mockRequest = createMockRequest({ searchParams: { lang: 'fr' } });

    const { result, durationMs } = measureExecutionTime(() =>
      detectUserLanguage(mockRequest)
    );

    expect(result).toBe('fr');
    expect(durationMs).toBeLessThan(10);
  });
});
```

### 3.2 Content with Translation Retrieval Performance Testing

Test the complete data flow from request to translated content response.

**Test Scenarios:**

| Scenario | Data Volume | Expected Time |
|----------|-------------|---------------|
| Item with no translations | 1 item, 3 articles, 10 links | < 200ms |
| Item with complete translations | 1 item, 3 articles, 10 links, all translated | < 200ms |
| Item with partial translations | 1 item, 3 articles (2 translated), 10 links (5 translated) | < 200ms |
| Large item | 1 item, 10 articles, 50 links, all translated | < 200ms |

**Database Query Strategy:**

The translation lookup should use efficient JOIN queries:

```sql
-- Pattern for efficient translation retrieval
SELECT
  i.id,
  i.public_id,
  i.name AS original_name,
  i.description AS original_description,
  i.source_language,
  COALESCE(it.name, i.name) AS name,
  COALESCE(it.description, i.description) AS description,
  CASE WHEN it.id IS NOT NULL THEN true ELSE false END AS is_translated,
  it.translation_status
FROM items i
LEFT JOIN item_translations it
  ON it.item_id = i.id
  AND it.language = $1
  AND it.translation_status = 'completed'
WHERE i.public_id = $2;
```

**Performance Test Pattern:**

```typescript
describe('Content Retrieval Performance', () => {
  it('retrieves translated content in under 200ms', async () => {
    const publicId = 'test-item-123';
    const language = 'fr';

    const { result, durationMs } = await measureExecutionTimeAsync(() =>
      fetchTranslatedItem(publicId, language)
    );

    expect(result.item).toBeDefined();
    expect(durationMs).toBeLessThan(200);
  });

  it('performs consistently across multiple requests', async () => {
    const publicId = 'test-item-123';
    const language = 'fr';
    const iterations = 10;
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { durationMs } = await measureExecutionTimeAsync(() =>
        fetchTranslatedItem(publicId, language)
      );
      durations.push(durationMs);
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / iterations;
    const maxDuration = Math.max(...durations);

    expect(avgDuration).toBeLessThan(200);
    expect(maxDuration).toBeLessThan(300); // Allow some variance
  });
});
```

### 3.3 Client-side Language Switch Performance Testing

Test the client-side state updates when toggling between languages or viewing original content.

**Test Scenarios:**

| Scenario | Operation | Expected Time |
|----------|-----------|---------------|
| Toggle "View Original" | State swap from translated to original | < 100ms |
| Toggle back to translation | State swap from original to translated | < 100ms |
| Language switcher selection | Update current language + state | < 100ms |
| Banner visibility update | Show/hide translation banner | < 100ms |

**Implementation Pattern:**

```typescript
// Using React Testing Library with performance monitoring
describe('Language Switch Performance', () => {
  it('toggles to original content in under 100ms', async () => {
    const { getByRole, queryByText } = render(
      <ItemDisplay
        item={mockTranslatedItem}
        translationMeta={mockTranslationMeta}
      />
    );

    const toggleButton = getByRole('button', { name: /view original/i });

    const start = performance.now();
    await userEvent.click(toggleButton);
    const durationMs = performance.now() - start;

    // Verify content updated
    expect(queryByText(mockTranslatedItem.originalName)).toBeInTheDocument();
    expect(durationMs).toBeLessThan(100);
  });
});

// Using performance.mark/measure for detailed analysis
describe('Language Switch Performance (detailed)', () => {
  it('measures state update, content swap, and banner visibility', async () => {
    performance.mark('switch-start');

    // Trigger language switch
    await setLanguage('de');

    performance.mark('switch-end');
    performance.measure('language-switch', 'switch-start', 'switch-end');

    const measure = performance.getEntriesByName('language-switch')[0];
    expect(measure.duration).toBeLessThan(100);

    // Cleanup
    performance.clearMarks();
    performance.clearMeasures();
  });
});
```

### 3.4 Performance Test Infrastructure

**Test Utilities Module:**

```typescript
// src/lib/__tests__/utils/performanceTestUtils.ts

export interface PerformanceResult<T> {
  result: T;
  durationMs: number;
}

export interface BenchmarkResult {
  iterations: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  allDurations: number[];
}

/**
 * Measure execution time of synchronous function
 */
export function measureSync<T>(fn: () => T): PerformanceResult<T> {
  const start = performance.now();
  const result = fn();
  const durationMs = performance.now() - start;
  return { result, durationMs };
}

/**
 * Measure execution time of async function
 */
export async function measureAsync<T>(fn: () => Promise<T>): Promise<PerformanceResult<T>> {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  return { result, durationMs };
}

/**
 * Run benchmark with multiple iterations
 */
export async function benchmark<T>(
  fn: () => Promise<T>,
  iterations: number = 10
): Promise<BenchmarkResult> {
  const durations: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const { durationMs } = await measureAsync(fn);
    durations.push(durationMs);
  }

  durations.sort((a, b) => a - b);

  const sum = durations.reduce((a, b) => a + b, 0);
  const p50Index = Math.floor(iterations * 0.5);
  const p95Index = Math.floor(iterations * 0.95);
  const p99Index = Math.floor(iterations * 0.99);

  return {
    iterations,
    minMs: durations[0],
    maxMs: durations[iterations - 1],
    avgMs: sum / iterations,
    p50Ms: durations[p50Index],
    p95Ms: durations[p95Index],
    p99Ms: durations[p99Index],
    allDurations: durations,
  };
}

/**
 * Assert benchmark meets threshold
 */
export function assertBenchmarkMeetsThreshold(
  result: BenchmarkResult,
  thresholdMs: number,
  percentile: 'avg' | 'p50' | 'p95' | 'p99' = 'p95'
): void {
  const value = result[`${percentile}Ms`];
  if (value > thresholdMs) {
    throw new Error(
      `Performance threshold exceeded: ${percentile} was ${value.toFixed(2)}ms, ` +
      `expected < ${thresholdMs}ms\n` +
      `Full results: min=${result.minMs.toFixed(2)}ms, ` +
      `avg=${result.avgMs.toFixed(2)}ms, max=${result.maxMs.toFixed(2)}ms`
    );
  }
}
```

---

## 4. Files to Create

### 4.1 Performance Test Files

| File Path | Purpose |
|-----------|---------|
| `src/lib/__tests__/utils/performanceTestUtils.ts` | Shared performance measurement utilities |
| `src/lib/i18n/__tests__/language-detection.perf.test.ts` | Language detection performance tests |
| `src/lib/translations/__tests__/fetch-translations.perf.test.ts` | Content retrieval performance tests |
| `src/hooks/__tests__/useGuestLanguage.perf.test.tsx` | Client-side switch performance tests |
| `src/components/guest/__tests__/GuestLanguageSwitcher.perf.test.tsx` | UI component performance tests |

### 4.2 Documentation Files

| File Path | Purpose |
|-----------|---------|
| `docs/testing/L10N-Performance-Benchmarks.md` | Performance benchmark documentation |
| `docs/testing/results/L10N-Performance-{date}.md` | Performance test results (per run) |

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Modification Type |
|-----------|-------------------|
| `src/lib/__tests__/utils/performanceTestUtils.ts` | New file - performance measurement utilities |
| `src/lib/i18n/__tests__/language-detection.perf.test.ts` | New file - detection performance tests |
| `src/lib/translations/__tests__/fetch-translations.perf.test.ts` | New file - retrieval performance tests |
| `src/hooks/__tests__/useGuestLanguage.perf.test.tsx` | New file - hook performance tests |
| `src/components/guest/__tests__/GuestLanguageSwitcher.perf.test.tsx` | New file - component performance tests |
| `docs/testing/L10N-Performance-Benchmarks.md` | New file - benchmark documentation |

### Files to MODIFY

| File Path | Modification Type |
|-----------|-------------------|
| `vitest.config.ts` | Add performance test timeout configuration |

### Files to REFERENCE (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/language-detection.ts` | Function to benchmark |
| `/src/lib/i18n/config.ts` | Configuration constants |
| `/src/lib/translations/fetch-translations.ts` | Functions to benchmark (when created) |
| `/src/hooks/useGuestLanguage.ts` | Hook to benchmark (when created) |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Component to benchmark (when created) |
| `/src/components/ItemCapture/editors/__tests__/cropUtils.test.ts` | Performance test pattern reference |
| `/docs/testing/L10N-E2E-Test-Protocol.md` | Testing protocol reference |

---

## 6. Implementation Details

### 6.1 Language Detection Performance Tests

```typescript
// src/lib/i18n/__tests__/language-detection.perf.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { detectUserLanguage } from '../language-detection';
import { measureSync, benchmark, assertBenchmarkMeetsThreshold } from '../../__tests__/utils/performanceTestUtils';

// Constants
const DETECTION_THRESHOLD_MS = 10;
const BENCHMARK_ITERATIONS = 100;

describe('Language Detection Performance', () => {
  describe('Single-run measurements', () => {
    it('detects language from URL parameter in under 10ms', () => {
      const mockRequest = createMockRequest({
        url: 'https://faqbnb.com/item/abc123?lang=fr',
        cookies: {},
        headers: {},
      });

      const { result, durationMs } = measureSync(() =>
        detectUserLanguage(mockRequest)
      );

      expect(result).toBe('fr');
      expect(durationMs).toBeLessThan(DETECTION_THRESHOLD_MS);
    });

    it('detects language from cookie in under 10ms', () => {
      const mockRequest = createMockRequest({
        url: 'https://faqbnb.com/item/abc123',
        cookies: { FAQBNB_LANG: 'de' },
        headers: {},
      });

      const { result, durationMs } = measureSync(() =>
        detectUserLanguage(mockRequest)
      );

      expect(result).toBe('de');
      expect(durationMs).toBeLessThan(DETECTION_THRESHOLD_MS);
    });

    it('parses simple Accept-Language header in under 10ms', () => {
      const mockRequest = createMockRequest({
        url: 'https://faqbnb.com/item/abc123',
        cookies: {},
        headers: { 'accept-language': 'es' },
      });

      const { result, durationMs } = measureSync(() =>
        detectUserLanguage(mockRequest)
      );

      expect(result).toBe('es');
      expect(durationMs).toBeLessThan(DETECTION_THRESHOLD_MS);
    });

    it('parses complex Accept-Language header in under 10ms', () => {
      const complexHeader = 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,nl;q=0.3,*;q=0.1';
      const mockRequest = createMockRequest({
        url: 'https://faqbnb.com/item/abc123',
        cookies: {},
        headers: { 'accept-language': complexHeader },
      });

      const { result, durationMs } = measureSync(() =>
        detectUserLanguage(mockRequest)
      );

      expect(result).toBe('fr');
      expect(durationMs).toBeLessThan(DETECTION_THRESHOLD_MS);
    });

    it('falls back to default language in under 10ms', () => {
      const mockRequest = createMockRequest({
        url: 'https://faqbnb.com/item/abc123',
        cookies: {},
        headers: {},
      });

      const { result, durationMs } = measureSync(() =>
        detectUserLanguage(mockRequest)
      );

      expect(result).toBe('en');
      expect(durationMs).toBeLessThan(DETECTION_THRESHOLD_MS);
    });
  });

  describe('Benchmark tests', () => {
    it('maintains consistent performance across 100 iterations', async () => {
      const mockRequest = createMockRequest({
        url: 'https://faqbnb.com/item/abc123',
        cookies: {},
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' },
      });

      const result = await benchmark(
        () => Promise.resolve(detectUserLanguage(mockRequest)),
        BENCHMARK_ITERATIONS
      );

      assertBenchmarkMeetsThreshold(result, DETECTION_THRESHOLD_MS, 'p95');

      console.log('Language Detection Benchmark Results:', {
        iterations: result.iterations,
        min: `${result.minMs.toFixed(3)}ms`,
        avg: `${result.avgMs.toFixed(3)}ms`,
        p95: `${result.p95Ms.toFixed(3)}ms`,
        max: `${result.maxMs.toFixed(3)}ms`,
      });
    });
  });
});

// Helper to create mock NextRequest
function createMockRequest(options: {
  url: string;
  cookies: Record<string, string>;
  headers: Record<string, string>;
}): NextRequest {
  const { url, cookies, headers } = options;
  const request = new NextRequest(url);

  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });

  // Note: Headers are read-only after creation in real NextRequest
  // For testing, we may need to mock this differently
  return request;
}
```

### 6.2 Content Retrieval Performance Tests

```typescript
// src/lib/translations/__tests__/fetch-translations.perf.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { measureAsync, benchmark, assertBenchmarkMeetsThreshold } from '../../__tests__/utils/performanceTestUtils';
import { fetchTranslatedItem } from '../fetch-translations';
import { createClient } from '@supabase/supabase-js';

// Constants
const RETRIEVAL_THRESHOLD_MS = 200;
const BENCHMARK_ITERATIONS = 10;

describe('Content Retrieval Performance', () => {
  // Setup test data
  let testPublicId: string;

  beforeAll(async () => {
    // Use existing test item or create one
    testPublicId = 'test-item-perf-001';
  });

  describe('Single-run measurements', () => {
    it('retrieves item with translations in under 200ms', async () => {
      const { result, durationMs } = await measureAsync(() =>
        fetchTranslatedItem(testPublicId, 'fr')
      );

      expect(result.item).toBeDefined();
      expect(durationMs).toBeLessThan(RETRIEVAL_THRESHOLD_MS);
    });

    it('retrieves item without translations in under 200ms', async () => {
      const { result, durationMs } = await measureAsync(() =>
        fetchTranslatedItem(testPublicId, 'en') // Original language
      );

      expect(result.item).toBeDefined();
      expect(durationMs).toBeLessThan(RETRIEVAL_THRESHOLD_MS);
    });

    it('retrieves item with partial translations in under 200ms', async () => {
      const { result, durationMs } = await measureAsync(() =>
        fetchTranslatedItem(testPublicId, 'de')
      );

      expect(result.item).toBeDefined();
      expect(durationMs).toBeLessThan(RETRIEVAL_THRESHOLD_MS);
    });
  });

  describe('Benchmark tests', () => {
    it('maintains consistent performance across 10 iterations', async () => {
      const result = await benchmark(
        () => fetchTranslatedItem(testPublicId, 'fr'),
        BENCHMARK_ITERATIONS
      );

      assertBenchmarkMeetsThreshold(result, RETRIEVAL_THRESHOLD_MS, 'p95');

      console.log('Content Retrieval Benchmark Results:', {
        iterations: result.iterations,
        min: `${result.minMs.toFixed(2)}ms`,
        avg: `${result.avgMs.toFixed(2)}ms`,
        p95: `${result.p95Ms.toFixed(2)}ms`,
        max: `${result.maxMs.toFixed(2)}ms`,
      });
    });

    it('handles concurrent requests efficiently', async () => {
      const concurrentRequests = 5;

      const start = performance.now();
      await Promise.all(
        Array(concurrentRequests).fill(null).map(() =>
          fetchTranslatedItem(testPublicId, 'fr')
        )
      );
      const totalDuration = performance.now() - start;
      const avgPerRequest = totalDuration / concurrentRequests;

      expect(avgPerRequest).toBeLessThan(RETRIEVAL_THRESHOLD_MS * 1.5); // Allow some overhead

      console.log('Concurrent Request Results:', {
        concurrentRequests,
        totalDuration: `${totalDuration.toFixed(2)}ms`,
        avgPerRequest: `${avgPerRequest.toFixed(2)}ms`,
      });
    });
  });
});
```

### 6.3 Client-side Switch Performance Tests

```typescript
// src/hooks/__tests__/useGuestLanguage.perf.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuestLanguage } from '../useGuestLanguage';

// Constants
const SWITCH_THRESHOLD_MS = 100;
const ITERATIONS = 50;

describe('useGuestLanguage Performance', () => {
  const defaultOptions = {
    initialLanguage: 'fr' as const,
    sourceLanguage: 'en' as const,
    availableTranslations: ['en', 'fr', 'de', 'es'] as const,
  };

  describe('Language switching performance', () => {
    it('setLanguage completes in under 100ms', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      const start = performance.now();
      act(() => {
        result.current.setLanguage('de');
      });
      const durationMs = performance.now() - start;

      expect(result.current.currentLanguage).toBe('de');
      expect(durationMs).toBeLessThan(SWITCH_THRESHOLD_MS);
    });

    it('toggleOriginal completes in under 100ms', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      const start = performance.now();
      act(() => {
        result.current.toggleOriginal();
      });
      const durationMs = performance.now() - start;

      expect(result.current.showOriginal).toBe(true);
      expect(durationMs).toBeLessThan(SWITCH_THRESHOLD_MS);
    });

    it('multiple rapid toggles remain performant', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));
      const durations: number[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        act(() => {
          result.current.toggleOriginal();
        });
        durations.push(performance.now() - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / ITERATIONS;
      const maxDuration = Math.max(...durations);

      expect(avgDuration).toBeLessThan(SWITCH_THRESHOLD_MS);
      expect(maxDuration).toBeLessThan(SWITCH_THRESHOLD_MS * 2);

      console.log('Rapid Toggle Performance:', {
        iterations: ITERATIONS,
        avg: `${avgDuration.toFixed(3)}ms`,
        max: `${maxDuration.toFixed(3)}ms`,
      });
    });

    it('language cycling remains performant', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));
      const languages = ['en', 'fr', 'de', 'es', 'it', 'nl'] as const;
      const durations: number[] = [];

      for (const lang of languages) {
        const start = performance.now();
        act(() => {
          result.current.setLanguage(lang);
        });
        durations.push(performance.now() - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / languages.length;

      expect(avgDuration).toBeLessThan(SWITCH_THRESHOLD_MS);

      console.log('Language Cycling Performance:', {
        languages: languages.length,
        avg: `${avgDuration.toFixed(3)}ms`,
      });
    });
  });
});
```

### 6.4 Component Performance Tests

```typescript
// src/components/guest/__tests__/GuestLanguageSwitcher.perf.test.tsx

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';
import type { SupportedLanguage } from '@/types/l10n';

const RENDER_THRESHOLD_MS = 50;
const INTERACTION_THRESHOLD_MS = 100;

describe('GuestLanguageSwitcher Performance', () => {
  const defaultProps = {
    currentLanguage: 'en' as SupportedLanguage,
    availableTranslations: ['en', 'fr', 'de', 'es', 'it', 'nl'] as SupportedLanguage[],
    sourceLanguage: 'en' as SupportedLanguage,
    onLanguageChange: vi.fn(),
  };

  describe('Render performance', () => {
    it('initial render completes in under 50ms', () => {
      const start = performance.now();
      const { container } = render(<GuestLanguageSwitcher {...defaultProps} />);
      const durationMs = performance.now() - start;

      expect(container).toBeTruthy();
      expect(durationMs).toBeLessThan(RENDER_THRESHOLD_MS);
    });

    it('re-render after language change completes in under 50ms', () => {
      const { rerender } = render(<GuestLanguageSwitcher {...defaultProps} />);

      const start = performance.now();
      rerender(<GuestLanguageSwitcher {...defaultProps} currentLanguage="fr" />);
      const durationMs = performance.now() - start;

      expect(durationMs).toBeLessThan(RENDER_THRESHOLD_MS);
    });
  });

  describe('Interaction performance', () => {
    it('dropdown open completes in under 100ms', async () => {
      const { getByRole } = render(<GuestLanguageSwitcher {...defaultProps} />);
      const trigger = getByRole('button');

      const start = performance.now();
      fireEvent.click(trigger);
      const durationMs = performance.now() - start;

      expect(durationMs).toBeLessThan(INTERACTION_THRESHOLD_MS);
    });

    it('language selection completes in under 100ms', async () => {
      const onLanguageChange = vi.fn();
      const { getByRole, getAllByRole } = render(
        <GuestLanguageSwitcher {...defaultProps} onLanguageChange={onLanguageChange} />
      );

      // Open dropdown
      fireEvent.click(getByRole('button'));

      // Select language
      const start = performance.now();
      const options = getAllByRole('option');
      fireEvent.click(options[1]); // Select second language
      const durationMs = performance.now() - start;

      expect(onLanguageChange).toHaveBeenCalled();
      expect(durationMs).toBeLessThan(INTERACTION_THRESHOLD_MS);
    });
  });
});
```

---

## 7. Acceptance Criteria Mapping

Based on REQ-329 in gen_requests_epic4.md:

| Requirement | Implementation |
|-------------|----------------|
| Language detection < 10ms | `language-detection.perf.test.ts` with measureSync |
| Detection covers URL, cookie, Accept-Language | Test scenarios for each source |
| Worst-case Accept-Language handled | Complex header parsing test |
| Content with translation < 200ms | `fetch-translations.perf.test.ts` with measureAsync |
| Includes joins across translation tables | Integration tests with real DB |
| Validates query efficiency for complex items | Large item test scenarios |
| Client-side switch < 100ms | `useGuestLanguage.perf.test.tsx` |
| Switch includes state, content, banner updates | Component render benchmarks |
| Production-scale data volumes | Benchmark with realistic data |
| Partial vs complete translations tested | Separate test scenarios |
| No overhead on non-localized routes | Middleware performance isolation |
| Regression tests run automatically | Tests integrated into CI |
| Results documented and tracked | Benchmark results in docs |
| Bottlenecks identified when thresholds exceeded | Error messages with details |
| Covers server and client operations | Separate test files |

---

## 8. Testing Approach

### Unit Tests

1. **Performance Utilities:**
   - Verify measureSync/measureAsync return accurate timings
   - Verify benchmark function calculates percentiles correctly
   - Verify assertBenchmarkMeetsThreshold throws on failure

2. **Language Detection:**
   - Each detection scenario meets 10ms threshold
   - Complex headers don't degrade performance
   - 100-iteration benchmark stays under threshold

3. **Content Retrieval:**
   - Each content scenario meets 200ms threshold
   - Concurrent requests don't cause degradation
   - Database queries are efficient (check query plans)

4. **Client-side Operations:**
   - Hook state updates meet 100ms threshold
   - Component renders meet 50ms threshold
   - User interactions meet 100ms threshold

### Integration Tests

1. Full page load with translation detection
2. Complete language switch flow
3. Content display with translation merging
4. End-to-end guest experience timing

### Manual Testing Checklist

- [ ] Page loads feel instant when viewing translated content
- [ ] Language switcher responds instantly to clicks
- [ ] "View Original" toggle switches content immediately
- [ ] No visible delay when detecting language from browser
- [ ] No flash of untranslated content (FOUC)
- [ ] Performance consistent across supported browsers
- [ ] Mobile performance acceptable on 3G networks (simulated)

### CI Integration

Tests should run automatically in CI pipeline:

```yaml
# Example CI configuration
performance-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
    - name: Install dependencies
      run: npm ci
    - name: Run performance tests
      run: npm run test:performance
    - name: Upload benchmark results
      uses: actions/upload-artifact@v4
      with:
        name: performance-results
        path: coverage/performance/
```

---

## 9. Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database latency varies | High | Medium | Use p95 percentile, test against staging DB |
| Test environment differs from production | Medium | High | Document baseline, track relative changes |
| False positives from test framework overhead | Medium | Medium | Warm up JIT, exclude setup time |
| Network variability in API tests | High | Medium | Use local mocks for unit tests, real DB for integration |
| Browser differences in client-side timing | Medium | Low | Test in headless Chrome, document browser |
| React rendering overhead varies | Medium | Low | Use consistent React version, measure isolated |

---

## 10. Implementation Order

1. **Phase A: Test Infrastructure (Day 1)**
   - Create `performanceTestUtils.ts` with measurement helpers
   - Set up vitest configuration for performance tests
   - Create documentation template for results

2. **Phase B: Language Detection Tests (Day 1)**
   - Create mock request utilities
   - Implement single-run tests for each scenario
   - Implement 100-iteration benchmark test

3. **Phase C: Content Retrieval Tests (Day 2)**
   - Set up test data in staging database
   - Implement single-run tests for each scenario
   - Implement benchmark and concurrent tests

4. **Phase D: Client-side Tests (Day 2)**
   - Implement hook performance tests
   - Implement component performance tests
   - Implement interaction timing tests

5. **Phase E: Documentation & CI (Day 3)**
   - Document baseline benchmark results
   - Integrate tests into CI pipeline
   - Create performance tracking dashboard/doc

---

## 11. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 7.1 | Test Language Detection | Preceding - functional tests before performance |
| 7.2 | Test Content Display | Preceding - display tests before timing |
| 7.3 | Test Edge Cases | Preceding - stability before benchmarking |
| 7.4 | Mobile Responsiveness | Preceding - UI stable for metrics |
| 1.2 | Guest Language Utility | Creates function to benchmark |
| 2.1 | Translation Fetch Utilities | Creates function to benchmark |
| 4.1 | useGuestLanguage Hook | Creates hook to benchmark |
| 3.1 | GuestLanguageSwitcher | Creates component to benchmark |

---

## 12. Open Questions

1. **Test Data:** Should we use seed data or existing production-like data for benchmarks?
   - **Recommendation:** Create dedicated test seed data to ensure reproducible results

2. **CI Baseline:** How should we track performance regression over time?
   - **Recommendation:** Store benchmark results in artifacts, compare against baseline JSON

3. **Threshold Tolerance:** Should we allow some variance (e.g., p95 vs p99)?
   - **Recommendation:** Use p95 for pass/fail, document p99 for monitoring

4. **Network Conditions:** Should we simulate slow network for client tests?
   - **Recommendation:** Focus on computation time; network testing is separate concern

5. **Cold Start:** Should we measure first-run vs warmed-up performance?
   - **Recommendation:** Measure both; use warmed-up for thresholds, document cold start

---

## 13. Performance Benchmark Documentation Template

Results should be documented using this format:

```markdown
# L10N Performance Benchmark Results - {DATE}

## Environment
- Node.js: v20.x
- OS: Ubuntu 22.04 (CI)
- Database: Supabase (us-east-1)
- Test Runner: Vitest 3.x

## Results Summary

### Language Detection (Threshold: 10ms)
| Scenario | Min | Avg | P95 | Max | Status |
|----------|-----|-----|-----|-----|--------|
| URL param | 0.1ms | 0.2ms | 0.3ms | 0.5ms | PASS |
| Cookie | 0.1ms | 0.2ms | 0.3ms | 0.4ms | PASS |
| Accept-Language (simple) | 0.2ms | 0.3ms | 0.4ms | 0.6ms | PASS |
| Accept-Language (complex) | 0.3ms | 0.5ms | 0.8ms | 1.2ms | PASS |
| Fallback | 0.1ms | 0.2ms | 0.2ms | 0.3ms | PASS |

### Content Retrieval (Threshold: 200ms)
| Scenario | Min | Avg | P95 | Max | Status |
|----------|-----|-----|-----|-----|--------|
| With translations | 45ms | 62ms | 85ms | 120ms | PASS |
| Without translations | 40ms | 55ms | 72ms | 95ms | PASS |
| Partial translations | 43ms | 60ms | 80ms | 110ms | PASS |
| Large item | 65ms | 85ms | 115ms | 145ms | PASS |

### Client-side Switch (Threshold: 100ms)
| Scenario | Min | Avg | P95 | Max | Status |
|----------|-----|-----|-----|-----|--------|
| setLanguage | 0.5ms | 1.2ms | 2.5ms | 4.0ms | PASS |
| toggleOriginal | 0.3ms | 0.8ms | 1.5ms | 2.5ms | PASS |
| Component render | 3.0ms | 5.5ms | 8.0ms | 12.0ms | PASS |
| Dropdown interaction | 5.0ms | 8.5ms | 15.0ms | 22.0ms | PASS |

## Notes
- All tests passed performance thresholds
- Database connection pooling in use
- No significant degradation from previous run
```

---

## 14. References

- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md) - Phase 7, Task 7.5
- [REQ-329](/docs/gen_requests_epic4.md) - Performance Validation requirements
- [Language Detection](/src/lib/i18n/language-detection.ts) - Function to benchmark
- [i18n Config](/src/lib/i18n/config.ts) - Configuration constants
- [L10N E2E Test Protocol](/docs/testing/L10N-E2E-Test-Protocol.md) - Testing standards
- [cropUtils.test.ts](/src/components/ItemCapture/editors/__tests__/cropUtils.test.ts) - Performance test pattern
- [Vitest Documentation](https://vitest.dev/guide/features.html#benchmarking)
- [Web Performance APIs - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
