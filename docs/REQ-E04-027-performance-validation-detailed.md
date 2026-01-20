# Detailed Task Breakdown: REQ-E04-027 - Performance Validation

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-027
**Epic:** Epic 4 - Guest Experience
**Phase:** 7 - Testing & Polish
**Task ID:** 7.5
**Request Type:** ENHANCEMENT
**Size:** M
**Overview Document:** REQ-E04-027-performance-validation-overview.md

---

## Table of Contents

1. [Summary](#summary)
2. [Prerequisites](#prerequisites)
3. [Task Breakdown](#task-breakdown)
4. [File Specifications](#file-specifications)
5. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)
6. [Testing Requirements](#testing-requirements)
7. [Rollback Plan](#rollback-plan)

---

## Summary

This document provides granular, implementation-ready tasks for comprehensive performance validation of the guest localization features. The testing validates that:
- Language detection completes in under 10 milliseconds
- Content retrieval with translations completes in under 200 milliseconds
- Client-side language switching completes in under 100 milliseconds

These performance thresholds ensure a responsive, high-quality multilingual experience for international guests.

---

## Prerequisites

### Required Epic Dependencies

| Dependency | Status | Blocking |
|------------|--------|----------|
| REQ-E04-002: Guest language detection utilities | Must be implemented | Yes |
| REQ-E04-004: Translation fetch utilities | Must be implemented | Yes |
| REQ-E04-014: useGuestLanguage hook | Must be implemented | Yes |
| REQ-E04-008: GuestLanguageSwitcher component | Must be implemented | Yes |
| REQ-E04-016: Guest item page with translation support | Must be implemented | Yes |

### Required Files to Exist

| File | Purpose |
|------|---------|
| `/src/lib/i18n/language-detection.ts` | Language detection functions to test |
| `/src/lib/i18n/config.ts` | i18n configuration with supported locales |
| `/src/lib/performance-monitor.ts` | Existing performance monitoring utilities |
| `/src/lib/translations/fetch-translations.ts` | Translation fetch utilities (if exists) |
| `/src/hooks/useGuestLanguage.ts` | Guest language hook (if exists) |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Language switcher component (if exists) |

### Verification Commands

```bash
# Verify vitest is available
npx vitest --version

# Verify test setup works
npm test -- --run --reporter=verbose

# Verify performance monitor exists
test -f src/lib/performance-monitor.ts && echo "Performance monitor found" || echo "Performance monitor missing"
```

---

## Task Breakdown

### Task 1: Create Performance Test Utilities Module

**Objective:** Create shared utilities and helpers for performance testing that can be reused across all performance test files.

**File:** `/src/lib/__tests__/perf-utils.ts`

**Estimated Effort:** 1 story point

#### Task 1.1: Create percentile calculation helper

**Action:** CREATE function `percentile()`

```typescript
// /src/lib/__tests__/perf-utils.ts

/**
 * Performance Test Utilities
 * Shared helpers for performance testing across the codebase.
 *
 * @module lib/__tests__/perf-utils
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

/**
 * Calculate percentile value from an array of numbers.
 *
 * @param arr - Array of numeric values
 * @param p - Percentile to calculate (0-100)
 * @returns The value at the specified percentile
 *
 * @example
 * percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 95)
 * // Returns: 10
 */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
```

**Verification:**
- [ ] Function handles empty arrays
- [ ] Function returns correct P50 (median)
- [ ] Function returns correct P95
- [ ] Function returns correct P99

#### Task 1.2: Create statistical summary helper

**Action:** CREATE function `calculateStats()`

```typescript
/**
 * Performance statistics summary.
 */
export interface PerformanceTestStats {
  /** Number of samples */
  count: number;
  /** Average (mean) value */
  average: number;
  /** Median (P50) value */
  median: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** 95th percentile value */
  p95: number;
  /** 99th percentile value */
  p99: number;
  /** Standard deviation */
  stdDev: number;
}

/**
 * Calculate comprehensive statistics from duration samples.
 *
 * @param durations - Array of duration values in milliseconds
 * @returns Performance statistics summary
 */
export function calculateStats(durations: number[]): PerformanceTestStats {
  if (durations.length === 0) {
    return {
      count: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      p95: 0,
      p99: 0,
      stdDev: 0,
    };
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const count = durations.length;
  const sum = durations.reduce((a, b) => a + b, 0);
  const average = sum / count;

  // Calculate standard deviation
  const squaredDiffs = durations.map((d) => Math.pow(d - average, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    count,
    average,
    median: percentile(durations, 50),
    min: sorted[0],
    max: sorted[count - 1],
    p95: percentile(durations, 95),
    p99: percentile(durations, 99),
    stdDev,
  };
}
```

**Verification:**
- [ ] Function calculates correct average
- [ ] Function calculates correct standard deviation
- [ ] Function returns all percentile values

#### Task 1.3: Create performance thresholds constants

**Action:** CREATE constants for performance thresholds

```typescript
/**
 * Performance threshold constants for guest localization features.
 * These thresholds define acceptable performance levels for production.
 */
export const PERF_THRESHOLDS = {
  /** Language detection thresholds (milliseconds) */
  LANGUAGE_DETECTION: {
    AVERAGE: 10,
    P95: 15,
    P99: 25,
    MAX_NORMAL: 50,
  },
  /** Content with translation retrieval thresholds (milliseconds) */
  CONTENT_RETRIEVAL: {
    AVERAGE: 200,
    P95: 300,
    P99: 500,
  },
  /** Client-side language switch thresholds (milliseconds) */
  CLIENT_SWITCH: {
    AVERAGE: 100,
    P95: 150,
    P99: 200,
  },
  /** Test sample sizes */
  SAMPLE_SIZE: {
    SERVER_SIDE: 100,
    CLIENT_SIDE: 50,
    E2E: 20,
  },
  /** Warm-up iterations to exclude */
  WARMUP_ITERATIONS: 5,
} as const;
```

**Verification:**
- [ ] Constants are exported correctly
- [ ] Values match overview document specifications

#### Task 1.4: Create timing measurement wrapper

**Action:** CREATE function `measureTiming()`

```typescript
/**
 * Measure execution time of an async function.
 *
 * @param fn - Async function to measure
 * @returns Duration in milliseconds
 */
export async function measureTiming(fn: () => Promise<void>): Promise<number> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

/**
 * Measure execution time of a sync function.
 *
 * @param fn - Sync function to measure
 * @returns Duration in milliseconds
 */
export function measureTimingSync(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

/**
 * Run performance test with multiple samples and calculate statistics.
 *
 * @param fn - Function to test (async or sync)
 * @param sampleSize - Number of samples to collect
 * @param warmupIterations - Number of warm-up iterations to exclude
 * @returns Performance statistics
 */
export async function runPerformanceTest(
  fn: () => Promise<void> | void,
  sampleSize: number = PERF_THRESHOLDS.SAMPLE_SIZE.SERVER_SIDE,
  warmupIterations: number = PERF_THRESHOLDS.WARMUP_ITERATIONS
): Promise<PerformanceTestStats> {
  const durations: number[] = [];

  // Warm-up iterations (not counted)
  for (let i = 0; i < warmupIterations; i++) {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
  }

  // Actual measurement iterations
  for (let i = 0; i < sampleSize; i++) {
    const start = performance.now();
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    const end = performance.now();
    durations.push(end - start);
  }

  return calculateStats(durations);
}
```

**Verification:**
- [ ] Function handles async functions
- [ ] Function handles sync functions
- [ ] Warm-up iterations are excluded from results

---

### Task 2: Create Language Detection Performance Tests

**Objective:** Validate that language detection operations complete within the specified thresholds.

**File:** `/src/lib/i18n/__tests__/language-detection.perf.test.ts`

**Estimated Effort:** 2 story points

#### Task 2.1: Create test file with imports and setup

**Action:** CREATE test file with proper structure

```typescript
// /src/lib/i18n/__tests__/language-detection.perf.test.ts

/**
 * Performance Tests: Language Detection
 * Validates that language detection operations meet performance thresholds.
 *
 * Performance Targets:
 * - Average: < 10ms
 * - P95: < 15ms
 * - P99: < 25ms
 *
 * @module lib/i18n/__tests__/language-detection.perf.test
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { detectUserLanguage } from '../language-detection';
import {
  PERF_THRESHOLDS,
  calculateStats,
  runPerformanceTest,
} from '@/lib/__tests__/perf-utils';

describe('Language Detection Performance', () => {
  const { LANGUAGE_DETECTION, SAMPLE_SIZE, WARMUP_ITERATIONS } = PERF_THRESHOLDS;
```

**Verification:**
- [ ] Imports resolve correctly
- [ ] Test file is discovered by vitest

#### Task 2.2: Add detectUserLanguage timing test

**Action:** ADD test for complete detection cycle

```typescript
  describe('detectUserLanguage - Complete Detection Cycle', () => {
    it('should complete language detection under 10ms average', async () => {
      const stats = await runPerformanceTest(
        () => {
          const mockRequest = new NextRequest('https://example.com/item/test', {
            headers: {
              'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6',
              Cookie: 'FAQBNB_LANG=es',
            },
          });
          detectUserLanguage(mockRequest);
        },
        SAMPLE_SIZE.SERVER_SIDE,
        WARMUP_ITERATIONS
      );

      console.log('Language Detection Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
        p99: `${stats.p99.toFixed(3)}ms`,
        min: `${stats.min.toFixed(3)}ms`,
        max: `${stats.max.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(LANGUAGE_DETECTION.AVERAGE);
      expect(stats.p95).toBeLessThan(LANGUAGE_DETECTION.P95);
      expect(stats.p99).toBeLessThan(LANGUAGE_DETECTION.P99);
    });
  });
```

**Verification:**
- [ ] Test runs successfully
- [ ] Statistics are logged for debugging
- [ ] Assertions use correct thresholds

#### Task 2.3: Add Accept-Language parsing test

**Action:** ADD test for header parsing performance

```typescript
  describe('Accept-Language Header Parsing', () => {
    it('should parse Accept-Language header under 5ms', async () => {
      // Test with a complex header containing many languages
      const complexHeader = 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,nl;q=0.3,pt;q=0.2,ja;q=0.1';

      const stats = await runPerformanceTest(
        () => {
          const mockRequest = new NextRequest('https://example.com/item/test', {
            headers: {
              'Accept-Language': complexHeader,
            },
          });
          detectUserLanguage(mockRequest);
        },
        SAMPLE_SIZE.SERVER_SIDE,
        WARMUP_ITERATIONS
      );

      console.log('Accept-Language Parsing Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      // Accept-Language parsing should be faster than full detection
      expect(stats.average).toBeLessThan(5);
    });
  });
```

**Verification:**
- [ ] Test handles complex headers
- [ ] Performance is within acceptable range

#### Task 2.4: Add cookie reading test

**Action:** ADD test for cookie-based detection

```typescript
  describe('Cookie-based Language Detection', () => {
    it('should read language from cookie under 5ms', async () => {
      const stats = await runPerformanceTest(
        () => {
          const mockRequest = new NextRequest('https://example.com/item/test', {
            headers: {
              Cookie: 'FAQBNB_LANG=fr; other_cookie=value',
            },
          });
          detectUserLanguage(mockRequest);
        },
        SAMPLE_SIZE.SERVER_SIDE,
        WARMUP_ITERATIONS
      );

      console.log('Cookie Detection Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(5);
    });
  });
```

**Verification:**
- [ ] Test creates proper mock request with cookies
- [ ] Performance meets threshold

#### Task 2.5: Add fallback scenario test

**Action:** ADD test for fallback detection path

```typescript
  describe('Fallback Detection Path', () => {
    it('should handle fallback to default under threshold', async () => {
      const stats = await runPerformanceTest(
        () => {
          // No cookie, no valid Accept-Language - should fall back to default
          const mockRequest = new NextRequest('https://example.com/item/test', {
            headers: {
              'Accept-Language': 'xyz,abc;q=0.5',
            },
          });
          detectUserLanguage(mockRequest);
        },
        SAMPLE_SIZE.SERVER_SIDE,
        WARMUP_ITERATIONS
      );

      console.log('Fallback Detection Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(LANGUAGE_DETECTION.AVERAGE);
    });
  });
```

**Verification:**
- [ ] Fallback path is tested
- [ ] Performance remains acceptable during fallback

#### Task 2.6: Add consistency test with multiple languages

**Action:** ADD test for consistent performance across language variations

```typescript
  describe('Consistency Across Language Variations', () => {
    it('should maintain consistent performance with varying Accept-Language headers', async () => {
      const headerVariations = [
        'en',
        'en-US,en;q=0.9',
        'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'de-DE,de;q=0.9,fr;q=0.8,en-US;q=0.7,en;q=0.6',
        'es-ES,es;q=0.9,pt-BR;q=0.8,pt;q=0.7,en;q=0.6,it;q=0.5',
      ];

      const allDurations: number[] = [];

      for (const header of headerVariations) {
        const stats = await runPerformanceTest(
          () => {
            const mockRequest = new NextRequest('https://example.com/item/test', {
              headers: { 'Accept-Language': header },
            });
            detectUserLanguage(mockRequest);
          },
          20, // Smaller sample for each variation
          2
        );
        allDurations.push(stats.average);
      }

      const overallStats = calculateStats(allDurations);

      console.log('Consistency Stats:', {
        averageAcrossVariations: `${overallStats.average.toFixed(3)}ms`,
        stdDev: `${overallStats.stdDev.toFixed(3)}ms`,
        max: `${overallStats.max.toFixed(3)}ms`,
      });

      // All variations should be under threshold
      expect(overallStats.max).toBeLessThan(LANGUAGE_DETECTION.AVERAGE);
      // Standard deviation should be low (consistent performance)
      expect(overallStats.stdDev).toBeLessThan(2);
    });
  });
});
```

**Verification:**
- [ ] Multiple header variations are tested
- [ ] Standard deviation is calculated
- [ ] Performance is consistent across variations

---

### Task 3: Create Translation Fetch Performance Tests

**Objective:** Validate that content retrieval with translation merging completes within specified thresholds.

**File:** `/src/lib/translations/__tests__/fetch-translations.perf.test.ts`

**Estimated Effort:** 2 story points

**Note:** This task depends on the existence of `/src/lib/translations/fetch-translations.ts`. If this file does not exist yet, create placeholder tests that can be completed when the module is implemented.

#### Task 3.1: Create test file with mocks

**Action:** CREATE test file with Supabase mocks

```typescript
// /src/lib/translations/__tests__/fetch-translations.perf.test.ts

/**
 * Performance Tests: Translation Fetch Utilities
 * Validates that translation retrieval operations meet performance thresholds.
 *
 * Performance Targets:
 * - Average: < 200ms
 * - P95: < 300ms
 * - P99: < 500ms
 *
 * @module lib/translations/__tests__/fetch-translations.perf.test
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PERF_THRESHOLDS,
  calculateStats,
  runPerformanceTest,
} from '@/lib/__tests__/perf-utils';

// Mock data for testing different content sizes
const createMockItemData = (size: 'small' | 'medium' | 'large') => {
  const configs = {
    small: { articles: 2, links: 5, tags: 5 },
    medium: { articles: 5, links: 10, tags: 15 },
    large: { articles: 10, links: 25, tags: 30 },
  };

  const config = configs[size];

  return {
    item: {
      id: 'test-item-id',
      public_id: 'test-public-id',
      name: 'Test Item',
      description: 'Test description for performance testing',
      source_language: 'en',
    },
    articles: Array.from({ length: config.articles }, (_, i) => ({
      id: `article-${i}`,
      title: `Article ${i}`,
      description: `Description for article ${i}`,
    })),
    links: Array.from({ length: config.links }, (_, i) => ({
      id: `link-${i}`,
      title: `Link ${i}`,
      url: `https://example.com/link-${i}`,
    })),
    tags: Array.from({ length: config.tags }, (_, i) => ({
      key: `tag-${i}`,
      value: `Tag Value ${i}`,
    })),
  };
};

// Mock translations for the item data
const createMockTranslations = (itemData: ReturnType<typeof createMockItemData>, language: string) => ({
  itemTranslation: {
    name: `${itemData.item.name} (${language})`,
    description: `${itemData.item.description} (${language})`,
  },
  articleTranslations: itemData.articles.map((a) => ({
    article_id: a.id,
    title: `${a.title} (${language})`,
    description: `${a.description} (${language})`,
  })),
  linkTranslations: itemData.links.map((l) => ({
    link_id: l.id,
    title: `${l.title} (${language})`,
  })),
  tagTranslations: itemData.tags.map((t) => ({
    tag_key: t.key,
    value: `${t.value} (${language})`,
  })),
});
```

**Verification:**
- [ ] Mock data generators work correctly
- [ ] Different content sizes are properly configured

#### Task 3.2: Add translation merge performance test

**Action:** ADD test for merging original content with translations

```typescript
describe('Translation Fetch Performance', () => {
  const { CONTENT_RETRIEVAL, SAMPLE_SIZE, WARMUP_ITERATIONS } = PERF_THRESHOLDS;

  describe('Content Merging Performance', () => {
    it('should merge original content with translations under 50ms', async () => {
      const itemData = createMockItemData('medium');
      const translations = createMockTranslations(itemData, 'es');

      // Simulate merge function (replace with actual import when available)
      const mergeContent = () => {
        return {
          item: {
            ...itemData.item,
            name: translations.itemTranslation.name,
            description: translations.itemTranslation.description,
            originalName: itemData.item.name,
            originalDescription: itemData.item.description,
          },
          articles: itemData.articles.map((article, i) => ({
            ...article,
            title: translations.articleTranslations[i].title,
            description: translations.articleTranslations[i].description,
          })),
          links: itemData.links.map((link, i) => ({
            ...link,
            title: translations.linkTranslations[i].title,
          })),
          tags: itemData.tags.map((tag, i) => ({
            ...tag,
            displayValue: translations.tagTranslations[i].value,
          })),
        };
      };

      const stats = await runPerformanceTest(
        () => { mergeContent(); },
        SAMPLE_SIZE.SERVER_SIDE,
        WARMUP_ITERATIONS
      );

      console.log('Content Merge Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(50);
    });
  });
```

**Verification:**
- [ ] Merge simulation covers all content types
- [ ] Performance is well under threshold

#### Task 3.3: Add size-based performance tests

**Action:** ADD tests for different content sizes

```typescript
  describe('Size-based Performance Tests', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const expectedThresholds = {
      small: 150,
      medium: 200,
      large: 300,
    };

    sizes.forEach((size) => {
      it(`should handle ${size} content under ${expectedThresholds[size]}ms`, async () => {
        const itemData = createMockItemData(size);
        const translations = createMockTranslations(itemData, 'fr');

        // Simulate complete fetch + merge cycle
        const fetchAndMerge = async () => {
          // Simulate database latency (10-50ms)
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 40 + 10));

          // Perform merge
          return {
            item: {
              ...itemData.item,
              name: translations.itemTranslation.name,
              description: translations.itemTranslation.description,
            },
            articles: itemData.articles.map((article, i) => ({
              ...article,
              title: translations.articleTranslations[i].title,
            })),
            links: itemData.links.map((link, i) => ({
              ...link,
              title: translations.linkTranslations[i].title,
            })),
            tags: itemData.tags.map((tag, i) => ({
              ...tag,
              displayValue: translations.tagTranslations[i].value,
            })),
          };
        };

        const stats = await runPerformanceTest(
          fetchAndMerge,
          20, // Smaller sample due to simulated latency
          2
        );

        console.log(`${size.charAt(0).toUpperCase() + size.slice(1)} Content Stats:`, {
          average: `${stats.average.toFixed(3)}ms`,
          p95: `${stats.p95.toFixed(3)}ms`,
          articles: itemData.articles.length,
          links: itemData.links.length,
          tags: itemData.tags.length,
        });

        expect(stats.average).toBeLessThan(expectedThresholds[size]);
      });
    });
  });
```

**Verification:**
- [ ] All three sizes are tested
- [ ] Thresholds are appropriate for each size

#### Task 3.4: Add response construction test

**Action:** ADD test for response payload construction

```typescript
  describe('Response Construction Performance', () => {
    it('should construct response payload under 20ms', async () => {
      const itemData = createMockItemData('medium');
      const translations = createMockTranslations(itemData, 'de');

      const constructResponse = () => {
        return {
          item: {
            ...itemData.item,
            name: translations.itemTranslation.name,
            description: translations.itemTranslation.description,
          },
          articles: itemData.articles.map((article, i) => ({
            ...article,
            title: translations.articleTranslations[i].title,
          })),
          tags: itemData.tags.map((tag, i) => ({
            ...tag,
            displayValue: translations.tagTranslations[i].value,
          })),
          translationMeta: {
            requestedLanguage: 'de',
            displayLanguage: 'de',
            sourceLanguage: 'en',
            availableTranslations: ['en', 'es', 'fr', 'de'],
            isShowingTranslation: true,
          },
        };
      };

      const stats = await runPerformanceTest(
        () => { constructResponse(); },
        SAMPLE_SIZE.SERVER_SIDE,
        WARMUP_ITERATIONS
      );

      console.log('Response Construction Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(20);
    });
  });
});
```

**Verification:**
- [ ] Response includes all required metadata
- [ ] Performance is well under threshold

---

### Task 4: Create Client-Side Switching Performance Tests

**Objective:** Validate that client-side language switching completes within specified thresholds.

**File:** `/src/hooks/__tests__/useGuestLanguage.perf.test.tsx`

**Estimated Effort:** 2 story points

**Note:** This task depends on the existence of `/src/hooks/useGuestLanguage.ts`. Create placeholder tests if the hook does not exist yet.

#### Task 4.1: Create test file with React Testing Library setup

**Action:** CREATE test file with proper React testing setup

```typescript
// /src/hooks/__tests__/useGuestLanguage.perf.test.tsx

/**
 * Performance Tests: useGuestLanguage Hook
 * Validates that client-side language switching meets performance thresholds.
 *
 * Performance Targets:
 * - Average: < 100ms
 * - P95: < 150ms
 * - P99: < 200ms
 *
 * @module hooks/__tests__/useGuestLanguage.perf.test
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import {
  PERF_THRESHOLDS,
  calculateStats,
} from '@/lib/__tests__/perf-utils';

// Mock cookie utilities
vi.mock('@/lib/i18n/guest-language', () => ({
  setGuestLanguageCookie: vi.fn(),
  getGuestLanguageCookie: vi.fn(() => 'en'),
}));

const { CLIENT_SWITCH, SAMPLE_SIZE, WARMUP_ITERATIONS } = PERF_THRESHOLDS;

// Placeholder hook for testing (replace with actual import when available)
const useGuestLanguagePlaceholder = (options: {
  initialLanguage?: string;
  sourceLanguage: string;
  availableTranslations: string[];
}) => {
  const [currentLanguage, setCurrentLanguage] = React.useState(
    options.initialLanguage || 'en'
  );
  const [showOriginal, setShowOriginal] = React.useState(false);

  const setLanguage = React.useCallback((lang: string) => {
    setCurrentLanguage(lang);
    setShowOriginal(false);
  }, []);

  const toggleOriginal = React.useCallback(() => {
    setShowOriginal((prev) => !prev);
  }, []);

  const displayLanguage = showOriginal
    ? options.sourceLanguage
    : currentLanguage;

  const hasTranslation = React.useCallback(
    (lang: string) => options.availableTranslations.includes(lang),
    [options.availableTranslations]
  );

  return {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
    hasTranslation,
  };
};
```

**Verification:**
- [ ] Test file is properly configured for React testing
- [ ] Mocks are set up correctly

#### Task 4.2: Add language switch performance test

**Action:** ADD test for language switching timing

```typescript
describe('useGuestLanguage Hook Performance', () => {
  describe('Language Switch Performance', () => {
    it('should complete language switch under 100ms average', async () => {
      const durations: number[] = [];

      const { result } = renderHook(() =>
        useGuestLanguagePlaceholder({
          initialLanguage: 'en',
          sourceLanguage: 'en',
          availableTranslations: ['en', 'es', 'fr', 'de', 'nl', 'it'],
        })
      );

      // Warm-up iterations
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        await act(async () => {
          result.current.setLanguage(i % 2 === 0 ? 'es' : 'en');
        });
      }

      // Measured iterations
      for (let i = 0; i < SAMPLE_SIZE.CLIENT_SIDE; i++) {
        const nextLang = i % 2 === 0 ? 'es' : 'en';

        const start = performance.now();
        await act(async () => {
          result.current.setLanguage(nextLang);
        });
        const end = performance.now();

        durations.push(end - start);
      }

      const stats = calculateStats(durations);

      console.log('Language Switch Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
        p99: `${stats.p99.toFixed(3)}ms`,
        min: `${stats.min.toFixed(3)}ms`,
        max: `${stats.max.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(CLIENT_SWITCH.AVERAGE);
      expect(stats.p95).toBeLessThan(CLIENT_SWITCH.P95);
    });
  });
```

**Verification:**
- [ ] Language switching is measured correctly
- [ ] act() wrapper is used properly
- [ ] Performance meets threshold

#### Task 4.3: Add toggle original performance test

**Action:** ADD test for view original toggle timing

```typescript
  describe('Toggle Original Performance', () => {
    it('should complete view original toggle under 100ms', async () => {
      const durations: number[] = [];

      const { result } = renderHook(() =>
        useGuestLanguagePlaceholder({
          initialLanguage: 'es',
          sourceLanguage: 'en',
          availableTranslations: ['en', 'es'],
        })
      );

      // Warm-up
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        await act(async () => {
          result.current.toggleOriginal();
        });
      }

      // Measured iterations
      for (let i = 0; i < SAMPLE_SIZE.CLIENT_SIDE; i++) {
        const start = performance.now();
        await act(async () => {
          result.current.toggleOriginal();
        });
        const end = performance.now();

        durations.push(end - start);
      }

      const stats = calculateStats(durations);

      console.log('Toggle Original Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(CLIENT_SWITCH.AVERAGE);
    });
  });
```

**Verification:**
- [ ] Toggle action is measured correctly
- [ ] Performance meets threshold

#### Task 4.4: Add rapid switching stress test

**Action:** ADD test for multiple rapid language switches

```typescript
  describe('Rapid Switching Stress Test', () => {
    it('should maintain performance during rapid language switches', async () => {
      const durations: number[] = [];
      const languages = ['en', 'es', 'fr', 'de', 'nl', 'it'];

      const { result } = renderHook(() =>
        useGuestLanguagePlaceholder({
          initialLanguage: 'en',
          sourceLanguage: 'en',
          availableTranslations: languages,
        })
      );

      // Rapid switching through all languages
      for (let round = 0; round < 10; round++) {
        for (const lang of languages) {
          const start = performance.now();
          await act(async () => {
            result.current.setLanguage(lang);
          });
          const end = performance.now();

          durations.push(end - start);
        }
      }

      const stats = calculateStats(durations);

      console.log('Rapid Switching Stats:', {
        totalSwitches: durations.length,
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
        max: `${stats.max.toFixed(3)}ms`,
      });

      // Should maintain performance even under stress
      expect(stats.average).toBeLessThan(CLIENT_SWITCH.AVERAGE);
      expect(stats.max).toBeLessThan(CLIENT_SWITCH.P99 * 2); // Allow some headroom for outliers
    });
  });
});
```

**Verification:**
- [ ] Rapid switching is tested
- [ ] No performance degradation under stress

---

### Task 5: Create Component Render Performance Tests

**Objective:** Validate that the GuestLanguageSwitcher component renders efficiently.

**File:** `/src/components/guest/__tests__/GuestLanguageSwitcher.perf.test.tsx`

**Estimated Effort:** 1 story point

**Note:** This task depends on the existence of the GuestLanguageSwitcher component. Create placeholder tests if the component does not exist yet.

#### Task 5.1: Create component render timing test

**Action:** CREATE test file for component render performance

```typescript
// /src/components/guest/__tests__/GuestLanguageSwitcher.perf.test.tsx

/**
 * Performance Tests: GuestLanguageSwitcher Component
 * Validates that component rendering meets performance thresholds.
 *
 * @module components/guest/__tests__/GuestLanguageSwitcher.perf.test
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  PERF_THRESHOLDS,
  calculateStats,
} from '@/lib/__tests__/perf-utils';

const { CLIENT_SWITCH, SAMPLE_SIZE } = PERF_THRESHOLDS;

// Placeholder component for testing (replace with actual import when available)
const GuestLanguageSwitcherPlaceholder: React.FC<{
  currentLanguage: string;
  availableTranslations: string[];
  sourceLanguage: string;
  onLanguageChange: (lang: string) => void;
}> = ({ currentLanguage, availableTranslations, onLanguageChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div data-testid="language-switcher">
      <button onClick={() => setIsOpen(!isOpen)} data-testid="switcher-trigger">
        {currentLanguage}
      </button>
      {isOpen && (
        <ul data-testid="language-list">
          {availableTranslations.map((lang) => (
            <li key={lang}>
              <button
                onClick={() => {
                  onLanguageChange(lang);
                  setIsOpen(false);
                }}
                data-testid={`lang-option-${lang}`}
              >
                {lang}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

describe('GuestLanguageSwitcher Render Performance', () => {
  describe('Initial Render Performance', () => {
    it('should render initially under 50ms', () => {
      const durations: number[] = [];

      for (let i = 0; i < SAMPLE_SIZE.CLIENT_SIDE; i++) {
        const start = performance.now();

        const { unmount } = render(
          <GuestLanguageSwitcherPlaceholder
            currentLanguage="en"
            availableTranslations={['en', 'es', 'fr', 'de', 'nl', 'it']}
            sourceLanguage="en"
            onLanguageChange={() => {}}
          />
        );

        const end = performance.now();
        durations.push(end - start);

        unmount();
      }

      const stats = calculateStats(durations);

      console.log('Initial Render Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(50);
    });
  });

  describe('Re-render Performance', () => {
    it('should re-render on language change under 100ms', () => {
      const durations: number[] = [];
      const languages = ['en', 'es', 'fr', 'de', 'nl', 'it'];

      const TestWrapper: React.FC = () => {
        const [lang, setLang] = React.useState('en');

        return (
          <div>
            <GuestLanguageSwitcherPlaceholder
              currentLanguage={lang}
              availableTranslations={languages}
              sourceLanguage="en"
              onLanguageChange={setLang}
            />
            <button
              data-testid="external-trigger"
              onClick={() => setLang(languages[(languages.indexOf(lang) + 1) % languages.length])}
            >
              Next Language
            </button>
          </div>
        );
      };

      render(<TestWrapper />);

      const trigger = screen.getByTestId('external-trigger');

      for (let i = 0; i < SAMPLE_SIZE.CLIENT_SIDE; i++) {
        const start = performance.now();
        fireEvent.click(trigger);
        const end = performance.now();
        durations.push(end - start);
      }

      const stats = calculateStats(durations);

      console.log('Re-render Stats:', {
        average: `${stats.average.toFixed(3)}ms`,
        p95: `${stats.p95.toFixed(3)}ms`,
      });

      expect(stats.average).toBeLessThan(CLIENT_SWITCH.AVERAGE);
    });
  });
});
```

**Verification:**
- [ ] Initial render is tested
- [ ] Re-renders are tested
- [ ] Performance meets thresholds

---

### Task 6: Create E2E Performance Tests

**Objective:** Create Playwright-based end-to-end performance tests for real browser validation.

**File:** `/e2e/guest-localization-performance.spec.ts`

**Estimated Effort:** 2 story points

**Note:** This task requires Playwright to be configured. If Playwright is not set up, this task includes creating a basic configuration.

#### Task 6.1: Create Playwright configuration (if needed)

**Action:** CREATE Playwright config file

```typescript
// /playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-precise-memory-info'],
        },
      },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Verification:**
- [ ] Playwright config is created
- [ ] Performance project is configured
- [ ] Web server is configured

#### Task 6.2: Create E2E performance test file

**Action:** CREATE E2E performance test

```typescript
// /e2e/guest-localization-performance.spec.ts

/**
 * E2E Performance Tests: Guest Localization
 * Validates end-to-end performance of guest localization features.
 *
 * @module e2e/guest-localization-performance.spec
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { test, expect } from '@playwright/test';

// Performance thresholds (matching unit test thresholds with network overhead)
const THRESHOLDS = {
  PAGE_LOAD_WITH_TRANSLATION: 2000, // 2 seconds including network
  CLIENT_SIDE_SWITCH: 200, // 200ms for client-side only
  NAVIGATION_TIMING_RESPONSE: 500, // Server response time
};

test.describe('Guest Localization Performance', () => {
  test.describe('Page Load Performance', () => {
    test('should load item page with translation under threshold', async ({ page }) => {
      // Navigate with performance measurement
      const startTime = Date.now();
      await page.goto('/item/test-public-id?lang=es', {
        waitUntil: 'domcontentloaded',
      });
      const loadTime = Date.now() - startTime;

      console.log(`Page load time: ${loadTime}ms`);

      // Verify page loaded with translation
      await expect(page.locator('[data-testid="item-content"]')).toBeVisible({
        timeout: 5000,
      });

      expect(loadTime).toBeLessThan(THRESHOLDS.PAGE_LOAD_WITH_TRANSLATION);
    });

    test('should measure server response time via Navigation Timing API', async ({
      page,
    }) => {
      await page.goto('/item/test-public-id?lang=fr');

      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        return {
          responseEnd: nav.responseEnd,
          requestStart: nav.requestStart,
          serverTime: nav.responseEnd - nav.requestStart,
          domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        };
      });

      console.log('Navigation Timing:', {
        serverTime: `${timing.serverTime.toFixed(2)}ms`,
        domContentLoaded: `${timing.domContentLoaded.toFixed(2)}ms`,
      });

      expect(timing.serverTime).toBeLessThan(THRESHOLDS.NAVIGATION_TIMING_RESPONSE);
    });
  });

  test.describe('Client-Side Switch Performance', () => {
    test('should switch language client-side under threshold', async ({ page }) => {
      await page.goto('/item/test-public-id?lang=en');

      // Wait for page to be fully loaded
      await page.waitForSelector('[data-testid="language-switcher"]', {
        timeout: 5000,
      });

      // Open language switcher
      const trigger = page.locator('[data-testid="language-switcher-trigger"]');
      await trigger.click();

      // Measure language switch
      const startTime = Date.now();
      await page.locator('[data-testid="lang-option-es"]').click();

      // Wait for content to update
      await page.waitForSelector('[data-language="es"]', { timeout: 1000 });
      const switchTime = Date.now() - startTime;

      console.log(`Language switch time: ${switchTime}ms`);

      expect(switchTime).toBeLessThan(THRESHOLDS.CLIENT_SIDE_SWITCH);
    });

    test('should handle rapid language switches without degradation', async ({
      page,
    }) => {
      await page.goto('/item/test-public-id?lang=en');

      await page.waitForSelector('[data-testid="language-switcher"]', {
        timeout: 5000,
      });

      const languages = ['es', 'fr', 'de', 'en'];
      const switchTimes: number[] = [];

      for (const lang of languages) {
        const trigger = page.locator('[data-testid="language-switcher-trigger"]');
        await trigger.click();

        const startTime = Date.now();
        await page.locator(`[data-testid="lang-option-${lang}"]`).click();
        await page.waitForSelector(`[data-language="${lang}"]`, { timeout: 1000 });
        const switchTime = Date.now() - startTime;

        switchTimes.push(switchTime);

        // Small delay between switches
        await page.waitForTimeout(100);
      }

      const avgSwitchTime =
        switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
      const maxSwitchTime = Math.max(...switchTimes);

      console.log('Rapid Switch Stats:', {
        average: `${avgSwitchTime.toFixed(2)}ms`,
        max: `${maxSwitchTime}ms`,
        times: switchTimes.map((t) => `${t}ms`),
      });

      expect(avgSwitchTime).toBeLessThan(THRESHOLDS.CLIENT_SIDE_SWITCH);
    });
  });

  test.describe('Re-render Performance', () => {
    test('should not have excessive re-renders on language switch', async ({
      page,
    }) => {
      await page.goto('/item/test-public-id?lang=en');

      // Inject render counter
      await page.evaluate(() => {
        (window as any).__RENDER_COUNT__ = 0;
      });

      await page.waitForSelector('[data-testid="language-switcher"]', {
        timeout: 5000,
      });

      const initialRenderCount = await page.evaluate(() => {
        return (window as any).__RENDER_COUNT__ || 0;
      });

      // Switch language
      const trigger = page.locator('[data-testid="language-switcher-trigger"]');
      await trigger.click();
      await page.locator('[data-testid="lang-option-fr"]').click();

      // Wait for switch to complete
      await page.waitForSelector('[data-language="fr"]', { timeout: 1000 });

      const finalRenderCount = await page.evaluate(() => {
        return (window as any).__RENDER_COUNT__ || 0;
      });

      const renderDiff = finalRenderCount - initialRenderCount;

      console.log(`Re-renders during switch: ${renderDiff}`);

      // Should not cause more than 5 re-renders
      expect(renderDiff).toBeLessThanOrEqual(5);
    });
  });
});
```

**Verification:**
- [ ] E2E tests are runnable
- [ ] Performance metrics are collected
- [ ] Thresholds are validated

---

### Task 7: Update Configuration Files

**Objective:** Update Vitest and (optionally) Playwright configurations to include performance test patterns.

**File:** `/vitest.config.ts`

**Estimated Effort:** 1 story point

#### Task 7.1: Update Vitest configuration

**Action:** MODIFY vitest.config.ts to include performance tests

```typescript
// Add to the include array in vitest.config.ts
include: [
  'src/**/*.test.ts',
  'src/**/*.test.tsx',
  'src/**/*.perf.test.ts',   // Add this line
  'src/**/*.perf.test.tsx',  // Add this line
],

// Optionally add a separate project for performance tests
projects: [
  {
    name: 'unit',
    test: {
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['**/*.perf.test.*'],
    },
  },
  {
    name: 'performance',
    test: {
      include: ['src/**/*.perf.test.ts', 'src/**/*.perf.test.tsx'],
      testTimeout: 30000, // Longer timeout for performance tests
    },
  },
],
```

**Verification:**
- [ ] Performance test files are discovered
- [ ] Performance tests can run separately with `npx vitest --project=performance`

---

### Task 8: Create Performance Test Runner Script

**Objective:** Create a convenience script to run all performance tests and generate a report.

**File:** `/scripts/run-perf-tests.sh`

**Estimated Effort:** 0.5 story points

#### Task 8.1: Create performance test runner script

**Action:** CREATE shell script for running performance tests

```bash
#!/bin/bash

# /scripts/run-perf-tests.sh
# Run all performance tests and generate report
#
# Usage: ./scripts/run-perf-tests.sh [unit|e2e|all]
#
# Created: 2026-01-20
# Last Modified: 2026-01-20

set -e

MODE=${1:-all}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="test-reports/performance"

mkdir -p "$REPORT_DIR"

echo "======================================"
echo "Performance Test Runner"
echo "Mode: $MODE"
echo "Timestamp: $TIMESTAMP"
echo "======================================"

run_unit_perf() {
  echo ""
  echo "Running unit performance tests..."
  echo "--------------------------------------"

  npx vitest run --reporter=verbose --reporter=json --outputFile="$REPORT_DIR/unit-perf-$TIMESTAMP.json" 'src/**/*.perf.test.{ts,tsx}' || true

  echo "Unit performance tests complete."
}

run_e2e_perf() {
  echo ""
  echo "Running E2E performance tests..."
  echo "--------------------------------------"

  if [ -f "playwright.config.ts" ]; then
    npx playwright test --project=performance --reporter=html,"$REPORT_DIR/e2e-perf-$TIMESTAMP.html" e2e/guest-localization-performance.spec.ts || true
  else
    echo "Playwright not configured. Skipping E2E tests."
  fi

  echo "E2E performance tests complete."
}

generate_summary() {
  echo ""
  echo "======================================"
  echo "Performance Test Summary"
  echo "======================================"
  echo ""
  echo "Reports generated in: $REPORT_DIR/"
  echo ""

  if [ -f "$REPORT_DIR/unit-perf-$TIMESTAMP.json" ]; then
    echo "Unit test results: $REPORT_DIR/unit-perf-$TIMESTAMP.json"
  fi

  if [ -f "$REPORT_DIR/e2e-perf-$TIMESTAMP.html" ]; then
    echo "E2E test results: $REPORT_DIR/e2e-perf-$TIMESTAMP.html"
  fi

  echo ""
  echo "======================================"
}

case $MODE in
  unit)
    run_unit_perf
    ;;
  e2e)
    run_e2e_perf
    ;;
  all)
    run_unit_perf
    run_e2e_perf
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Usage: $0 [unit|e2e|all]"
    exit 1
    ;;
esac

generate_summary

echo "Performance testing complete!"
```

**Verification:**
- [ ] Script is executable (`chmod +x scripts/run-perf-tests.sh`)
- [ ] Script runs unit tests correctly
- [ ] Script generates reports

---

### Task 9: Document Performance Baselines

**Objective:** Create documentation for performance baselines and regression testing.

**File:** `/docs/performance-baselines-guest-l10n.md`

**Estimated Effort:** 0.5 story points

#### Task 9.1: Create performance baseline documentation

**Action:** CREATE documentation file

```markdown
# Performance Baselines: Guest Localization Features

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

## Overview

This document records performance baselines for guest localization features. These baselines serve as regression tests for future development.

## Performance Thresholds

### Language Detection (Server-Side)

| Metric | Threshold | Baseline | Measured Date |
|--------|-----------|----------|---------------|
| Average | < 10ms | TBD | TBD |
| P95 | < 15ms | TBD | TBD |
| P99 | < 25ms | TBD | TBD |
| Max (normal) | < 50ms | TBD | TBD |

### Content with Translation Retrieval

| Metric | Threshold | Baseline | Measured Date |
|--------|-----------|----------|---------------|
| Average | < 200ms | TBD | TBD |
| P95 | < 300ms | TBD | TBD |
| P99 | < 500ms | TBD | TBD |

**Content Size Variations:**

| Size | Articles | Links | Tags | Average Threshold |
|------|----------|-------|------|-------------------|
| Small | 2 | 5 | 5 | < 150ms |
| Medium | 5 | 10 | 15 | < 200ms |
| Large | 10 | 25 | 30 | < 300ms |

### Client-Side Language Switch

| Metric | Threshold | Baseline | Measured Date |
|--------|-----------|----------|---------------|
| Average | < 100ms | TBD | TBD |
| P95 | < 150ms | TBD | TBD |
| P99 | < 200ms | TBD | TBD |

## Running Performance Tests

```bash
# Run all performance tests
./scripts/run-perf-tests.sh all

# Run only unit performance tests
./scripts/run-perf-tests.sh unit

# Run only E2E performance tests
./scripts/run-perf-tests.sh e2e

# Run via npm
npm run test:perf
```

## Interpreting Results

### Acceptable Results

- All metrics below threshold
- P99 no more than 2x average
- Standard deviation < 20% of average

### Concerning Results

- Average approaching threshold (> 80%)
- High standard deviation (> 30% of average)
- Outliers > 3x average

### Action Required

- Average exceeds threshold
- P95 or P99 exceeds threshold
- Consistent degradation over time

## Regression Testing

Performance tests should be run:

1. Before merging changes to translation-related code
2. After dependency updates
3. Weekly as part of CI/CD pipeline
4. After infrastructure changes

## Optimization Opportunities

If thresholds are not met, consider:

### Language Detection
- Cache Accept-Language parsing results
- Pre-validate supported language codes
- Reduce console.log calls in production

### Content Retrieval
- Add database indexes on translation lookup columns
- Implement query batching for multiple translations
- Consider caching frequently accessed translations

### Client-Side Switch
- Memoize expensive calculations
- Reduce unnecessary re-renders
- Lazy load language options

## References

- Overview Document: `/docs/REQ-E04-027-performance-validation-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Performance Monitor: `/src/lib/performance-monitor.ts`
```

**Verification:**
- [ ] Documentation is complete
- [ ] Thresholds match implementation
- [ ] Instructions are accurate

---

## File Specifications

### New Files to Create

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/lib/__tests__/perf-utils.ts` | Performance test utilities | Task 1 |
| `/src/lib/i18n/__tests__/language-detection.perf.test.ts` | Language detection timing tests | Task 2 |
| `/src/lib/translations/__tests__/fetch-translations.perf.test.ts` | Translation fetch timing tests | Task 3 |
| `/src/hooks/__tests__/useGuestLanguage.perf.test.tsx` | Hook performance tests | Task 4 |
| `/src/components/guest/__tests__/GuestLanguageSwitcher.perf.test.tsx` | Component render performance | Task 5 |
| `/e2e/guest-localization-performance.spec.ts` | E2E performance validation | Task 6 |
| `/playwright.config.ts` | Playwright configuration (if needed) | Task 6.1 |
| `/scripts/run-perf-tests.sh` | Performance test runner script | Task 8 |
| `/docs/performance-baselines-guest-l10n.md` | Performance baseline documentation | Task 9 |

### Files to Modify

| File Path | Changes | Task |
|-----------|---------|------|
| `/vitest.config.ts` | Add performance test patterns to include array | Task 7 |

### Dependencies (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/performance-monitor.ts` | Existing performance utilities to leverage |
| `/src/lib/i18n/language-detection.ts` | Language detection functions to test |
| `/src/lib/i18n/config.ts` | i18n configuration |

---

## Acceptance Criteria Checklist

### AC-1: Language Detection Performance (< 10ms)

- [ ] Test case measures complete language detection cycle
- [ ] Test case measures cookie reading performance
- [ ] Test case measures Accept-Language header parsing
- [ ] Test case measures language validation performance
- [ ] Test case measures fallback logic performance
- [ ] Average time < 10ms verified across 100 samples
- [ ] P95 < 15ms verified
- [ ] P99 < 25ms verified
- [ ] Performance consistent with 5+ languages in header
- [ ] Performance consistent when cookie is missing

### AC-2: Content with Translation Retrieval (< 200ms)

- [ ] Test case measures item fetch with translations
- [ ] Test case measures translation merge performance
- [ ] Test case measures response construction performance
- [ ] Average time < 200ms verified
- [ ] P95 < 300ms verified
- [ ] P99 < 500ms verified
- [ ] Small content (2 articles, 5 links, 5 tags) < 150ms
- [ ] Medium content (5 articles, 10 links, 15 tags) < 200ms
- [ ] Large content (10 articles, 25 links, 30 tags) < 300ms

### AC-3: Client-Side Language Switch (< 100ms)

- [ ] Test case measures React state update performance
- [ ] Test case measures component re-render performance
- [ ] Test case measures view original toggle performance
- [ ] Average time < 100ms verified across 50 samples
- [ ] P95 < 150ms verified
- [ ] P99 < 200ms verified
- [ ] Performance consistent during rapid switches
- [ ] No excessive re-renders (< 5 per switch)

### AC-4: E2E Performance Validation

- [ ] Page load with translation under 2 seconds
- [ ] Server response time under 500ms
- [ ] Client-side switch under 200ms in browser
- [ ] No performance degradation with rapid switches

### AC-5: Documentation and Tooling

- [ ] Performance test utilities module created
- [ ] Performance test runner script created
- [ ] Performance baseline documentation created
- [ ] Vitest configuration updated for performance tests

---

## Testing Requirements

### Test Execution Commands

```bash
# Run all unit performance tests
npx vitest run --reporter=verbose 'src/**/*.perf.test.{ts,tsx}'

# Run specific performance test file
npx vitest run src/lib/i18n/__tests__/language-detection.perf.test.ts

# Run E2E performance tests (requires Playwright)
npx playwright test --project=performance e2e/guest-localization-performance.spec.ts

# Run all performance tests via script
./scripts/run-perf-tests.sh all
```

### CI/CD Integration

Add to `.github/workflows/ci.yml` or equivalent:

```yaml
performance-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npx vitest run 'src/**/*.perf.test.{ts,tsx}'
    - run: npx playwright install chromium
    - run: npx playwright test --project=performance
```

---

## Rollback Plan

### If Performance Tests Fail

1. **Identify the bottleneck** - Check test output for which specific operation exceeds threshold
2. **Review recent changes** - Check git history for changes to affected modules
3. **Profile in detail** - Use Node.js profiler or Chrome DevTools for deeper analysis
4. **Optimize or revert** - Either optimize the slow path or revert problematic changes

### If Tests Break Other Functionality

1. **Check for mock conflicts** - Ensure mocks don't affect other tests
2. **Verify import paths** - Ensure new utilities don't break existing imports
3. **Isolate performance tests** - Run in separate project if needed

### Revert Commands

```bash
# Revert performance test files
git checkout HEAD~1 -- src/lib/__tests__/perf-utils.ts
git checkout HEAD~1 -- 'src/**/*.perf.test.{ts,tsx}'
git checkout HEAD~1 -- e2e/guest-localization-performance.spec.ts

# Revert configuration changes
git checkout HEAD~1 -- vitest.config.ts
git checkout HEAD~1 -- playwright.config.ts
```

---

## Implementation Notes

1. **Use Existing PerformanceMonitor:** Leverage the existing `PerformanceMonitor` class at `/src/lib/performance-monitor.ts` for consistent timing utilities

2. **Sample Size:** Use minimum 100 samples for server-side tests, 50 for client-side tests

3. **Warm-up Iterations:** Exclude first 5 iterations to avoid cold-start skew in measurements

4. **Percentile Calculations:** Always report average, P95, and P99 for comprehensive analysis

5. **Isolation:** Ensure tests run in isolation to avoid cross-test interference by using `beforeEach` and `afterEach` hooks

6. **Environment Parity:** Document any differences between test and production environments in the baseline documentation

7. **Database State:** Use consistent mock data for reproducible results; integration tests should use test database fixtures

8. **CI/CD Integration:** Add performance tests to CI pipeline with appropriate thresholds and failure conditions

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience - Phase 7.5 Performance Validation*
