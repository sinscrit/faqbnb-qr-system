# Implementation Overview: REQ-E04-027 - Performance Validation

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-027
**Epic:** Epic 4 - Guest Experience
**Phase:** 7 - Testing & Polish
**Task ID:** 7.5
**Request Type:** ENHANCEMENT
**Size:** M

---

## Summary

This document outlines the implementation approach for comprehensive performance validation of the guest localization features. The testing validates that language detection completes in under 10 milliseconds, content retrieval with translations completes in under 200 milliseconds, and client-side language switching completes in under 100 milliseconds. These performance thresholds ensure a responsive, high-quality multilingual experience for international guests.

---

## Background & Context

### Current State

Guest localization features have been implemented including:
- **Language Detection** - Server-side detection from cookies, URL parameters, and Accept-Language headers
- **Translation Fetch Utilities** - Database queries to retrieve translated content
- **Guest Item Page** - Server component fetching items with translation merging
- **useGuestLanguage Hook** - Client-side language state management
- **GuestLanguageSwitcher** - Client-side language selection with state updates

While functional implementation is complete, no systematic performance validation has confirmed these operations meet acceptable thresholds for production use.

### Performance Targets

| Operation | Target | Rationale |
|-----------|--------|-----------|
| Language Detection | < 10ms | Server-side operations should not add perceptible latency |
| Content with Translation | < 200ms | Total response time for complete translated item |
| Client-side Language Switch | < 100ms | Instant visual feedback for user interactions |

### Existing Performance Infrastructure

The codebase has a mature performance monitoring system at `/src/lib/performance-monitor.ts`:

| Feature | Description |
|---------|-------------|
| **PerformanceMonitor class** | Tracks timing of operations with metadata |
| **start()/end()** | Bracket-style timing for operations |
| **record()** | Direct recording of duration values |
| **getStats()** | Statistics per operation (min/max/avg) |
| **getSummary()** | Aggregate performance summary |
| **export()** | Full export for analysis |

**Existing Timing Utilities:**
```typescript
import { startTiming, endTiming, recordTiming, getPerformanceStats } from '@/lib/performance-monitor';
```

### Existing Test Framework

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | v4.0.16 | Unit and component testing |
| **Playwright** | v1.55.0 | E2E testing with performance profiling |
| **@testing-library/react** | v16.3.1 | Component testing utilities |

---

## Implementation Approach

### Test Categories

#### 1. Language Detection Performance (< 10ms)

Test the server-side language detection pipeline:

**Operations to Measure:**
- Cookie value reading from request headers
- Accept-Language header parsing with quality values
- Language code validation against supported languages
- Fallback logic execution when primary detection fails
- Complete detection cycle (URL param > Cookie > Header > Default)

**Target Metrics:**
| Percentile | Target |
|------------|--------|
| Average | < 10ms |
| P95 | < 15ms |
| P99 | < 25ms |
| Max (normal) | < 50ms |

#### 2. Content with Translation Retrieval (< 200ms)

Test the complete server-side content retrieval pipeline:

**Operations to Measure:**
- Item data fetch with all related articles, links, tags
- Translation table queries for requested language
- Original content merge with translation data
- Response payload construction with metadata
- Total time from request receipt to response transmission

**Target Metrics:**
| Percentile | Target |
|------------|--------|
| Average | < 200ms |
| P95 | < 300ms |
| P99 | < 500ms |

**Test Content Sizes:**
| Size | Articles | Links | Tags |
|------|----------|-------|------|
| Small | 2 | 5 | 5 |
| Medium | 5 | 10 | 15 |
| Large | 10 | 25 | 30 |

#### 3. Client-Side Language Switch (< 100ms)

Test the React state update and re-render performance:

**Operations to Measure:**
- Language switcher selection to state update
- React component re-render for all affected content
- DOM updates for translated content display
- Visual transition effects (if any)
- View Original toggle state changes

**Target Metrics:**
| Percentile | Target |
|------------|--------|
| Average | < 100ms |
| P95 | < 150ms |
| P99 | < 200ms |

---

## Test Implementation Details

### Test File Locations

```
/src/lib/i18n/__tests__/
├── language-detection.perf.test.ts    # Language detection performance

/src/lib/translations/__tests__/
├── fetch-translations.perf.test.ts    # Translation fetch performance

/src/hooks/__tests__/
├── useGuestLanguage.perf.test.tsx     # Hook performance

/src/components/guest/__tests__/
├── GuestLanguageSwitcher.perf.test.tsx # Component render performance

/e2e/
├── guest-localization-performance.spec.ts  # E2E performance validation
```

### Performance Test Pattern - Language Detection

```typescript
// Example: language-detection.perf.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectUserLanguage, parseAcceptLanguageHeader } from '../language-detection';
import { performance } from 'perf_hooks';

describe('Language Detection Performance', () => {
  const DETECTION_THRESHOLD_MS = 10;
  const DETECTION_P95_THRESHOLD_MS = 15;
  const DETECTION_P99_THRESHOLD_MS = 25;
  const SAMPLE_SIZE = 100;

  // Helper to calculate percentiles
  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  };

  describe('detectUserLanguage - Timing', () => {
    it('should complete language detection under 10ms average', async () => {
      const durations: number[] = [];

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const mockRequest = new Request('https://example.com/item/test', {
          headers: {
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6',
            'Cookie': 'FAQBNB_LANG=es'
          }
        });

        const start = performance.now();
        await detectUserLanguage(mockRequest);
        const end = performance.now();
        durations.push(end - start);
      }

      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      const p95 = percentile(durations, 95);
      const p99 = percentile(durations, 99);

      expect(average).toBeLessThan(DETECTION_THRESHOLD_MS);
      expect(p95).toBeLessThan(DETECTION_P95_THRESHOLD_MS);
      expect(p99).toBeLessThan(DETECTION_P99_THRESHOLD_MS);
    });

    it('should parse Accept-Language header under 5ms', () => {
      const durations: number[] = [];
      const complexHeader = 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,nl;q=0.3';

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const start = performance.now();
        parseAcceptLanguageHeader(complexHeader);
        const end = performance.now();
        durations.push(end - start);
      }

      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(average).toBeLessThan(5);
    });
  });
});
```

### Performance Test Pattern - Content Retrieval

```typescript
// Example: fetch-translations.perf.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTranslatedItem } from '../fetch-translations';
import { performance } from 'perf_hooks';

// Mock Supabase for consistent timing
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockItemData, error: null }))
        }))
      }))
    }))
  }))
}));

describe('Content with Translation Performance', () => {
  const CONTENT_THRESHOLD_MS = 200;
  const CONTENT_P95_THRESHOLD_MS = 300;
  const CONTENT_P99_THRESHOLD_MS = 500;
  const SAMPLE_SIZE = 100;

  describe('fetchTranslatedItem - Timing', () => {
    it('should complete item fetch with translation under 200ms average', async () => {
      const durations: number[] = [];

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const start = performance.now();
        await fetchTranslatedItem('test-public-id', 'es');
        const end = performance.now();
        durations.push(end - start);
      }

      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      const p95 = percentile(durations, 95);
      const p99 = percentile(durations, 99);

      expect(average).toBeLessThan(CONTENT_THRESHOLD_MS);
      expect(p95).toBeLessThan(CONTENT_P95_THRESHOLD_MS);
      expect(p99).toBeLessThan(CONTENT_P99_THRESHOLD_MS);
    });
  });
});
```

### Performance Test Pattern - Client-Side Switching

```typescript
// Example: useGuestLanguage.perf.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGuestLanguage } from '../useGuestLanguage';
import { performance } from 'perf_hooks';

describe('Client-Side Language Switch Performance', () => {
  const SWITCH_THRESHOLD_MS = 100;
  const SWITCH_P95_THRESHOLD_MS = 150;
  const SAMPLE_SIZE = 50;

  it('should complete language switch under 100ms average', async () => {
    const durations: number[] = [];

    const { result } = renderHook(() =>
      useGuestLanguage({
        initialLanguage: 'en',
        sourceLanguage: 'en',
        availableTranslations: ['en', 'es', 'fr', 'de', 'nl', 'it']
      })
    );

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const nextLang = i % 2 === 0 ? 'es' : 'en';

      const start = performance.now();
      await act(async () => {
        result.current.setLanguage(nextLang);
      });
      const end = performance.now();

      durations.push(end - start);
    }

    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    const p95 = percentile(durations, 95);

    expect(average).toBeLessThan(SWITCH_THRESHOLD_MS);
    expect(p95).toBeLessThan(SWITCH_P95_THRESHOLD_MS);
  });

  it('should complete view original toggle under 100ms', async () => {
    const durations: number[] = [];

    const { result } = renderHook(() =>
      useGuestLanguage({
        initialLanguage: 'es',
        sourceLanguage: 'en',
        availableTranslations: ['en', 'es']
      })
    );

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const start = performance.now();
      await act(async () => {
        result.current.toggleOriginal();
      });
      const end = performance.now();

      durations.push(end - start);
    }

    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    expect(average).toBeLessThan(SWITCH_THRESHOLD_MS);
  });
});
```

### Playwright E2E Performance Test

```typescript
// Example: guest-localization-performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Guest Localization Performance', () => {
  test.describe('Content Retrieval Performance', () => {
    test('should load item with translation in under 200ms', async ({ page }) => {
      // Start performance measurement
      await page.goto('/item/test-public-id?lang=es');

      // Use Navigation Timing API
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          responseEnd: nav.responseEnd,
          requestStart: nav.requestStart,
          totalTime: nav.responseEnd - nav.requestStart
        };
      });

      expect(timing.totalTime).toBeLessThan(500); // Network + processing
    });

    test('should switch language client-side in under 100ms', async ({ page }) => {
      await page.goto('/item/test-public-id?lang=en');

      // Open language switcher
      const trigger = page.getByRole('button', { name: /language/i });
      await trigger.click();

      // Measure language switch performance
      const start = Date.now();
      await page.getByRole('option', { name: /Espanol/i }).click();
      await page.waitForSelector('[data-language="es"]');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200); // Includes click + render
    });
  });

  test.describe('React Component Performance', () => {
    test('should not have excessive re-renders on language switch', async ({ page }) => {
      await page.goto('/item/test-public-id?lang=en');

      // Start React profiler (if DevTools extension available)
      // Alternatively, count renders via test-id updates

      const initialRenderCount = await page.evaluate(() => {
        return (window as any).__RENDER_COUNT__ || 0;
      });

      // Switch language
      const trigger = page.getByRole('button', { name: /language/i });
      await trigger.click();
      await page.getByRole('option', { name: /Francais/i }).click();

      const finalRenderCount = await page.evaluate(() => {
        return (window as any).__RENDER_COUNT__ || 0;
      });

      // Should not cause more than 3 re-renders
      expect(finalRenderCount - initialRenderCount).toBeLessThanOrEqual(3);
    });
  });
});
```

---

## Acceptance Criteria Mapping

### AC-1: Language Detection Performance (< 10ms)

| Criterion | Test Type | Validation Method |
|-----------|-----------|-------------------|
| Cookie reading < 5ms | Unit | `performance.now()` timing |
| Accept-Language parsing < 5ms | Unit | `performance.now()` timing |
| Language validation < 2ms | Unit | `performance.now()` timing |
| Fallback logic < 5ms | Unit | `performance.now()` timing |
| Complete detection < 10ms avg | Unit | 100-sample average |
| P95 < 15ms | Unit | Percentile calculation |
| P99 < 25ms | Unit | Percentile calculation |
| Consistent with 5+ languages in header | Unit | Complex header tests |
| Consistent with missing cookie | Unit | Fallback scenario |

### AC-2: Content with Translation Retrieval (< 200ms)

| Criterion | Test Type | Validation Method |
|-----------|-----------|-------------------|
| Item fetch with articles < 200ms | Integration | Database query timing |
| Translation merge < 50ms | Unit | `performance.now()` timing |
| Response construction < 20ms | Unit | `performance.now()` timing |
| Complete response < 200ms avg | E2E | Navigation Timing API |
| P95 < 300ms | Integration | Percentile calculation |
| P99 < 500ms | Integration | Percentile calculation |
| Small content < 150ms | Integration | Size-based testing |
| Medium content < 200ms | Integration | Size-based testing |
| Large content < 300ms | Integration | Size-based testing |

### AC-3: Client-Side Language Switch (< 100ms)

| Criterion | Test Type | Validation Method |
|-----------|-----------|-------------------|
| React state update < 50ms | Component | `performance.now()` timing |
| Component re-render < 100ms | Component | React Testing Library |
| DOM update < 100ms | E2E | Playwright timing |
| Toggle original < 100ms | Component | `performance.now()` timing |
| Multiple switches consistent | Component | 50-sample average |
| Mobile performance acceptable | E2E | Device emulation |

---

## Authorized Files and Functions for Modification

### New Test Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/__tests__/language-detection.perf.test.ts` | Language detection timing tests |
| `/src/lib/translations/__tests__/fetch-translations.perf.test.ts` | Translation fetch timing tests |
| `/src/hooks/__tests__/useGuestLanguage.perf.test.tsx` | Hook performance tests |
| `/src/components/guest/__tests__/GuestLanguageSwitcher.perf.test.tsx` | Component render performance |
| `/e2e/guest-localization-performance.spec.ts` | E2E performance validation |

### Existing Files for Performance Instrumentation (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/performance-monitor.ts` | Existing performance utilities to leverage |
| `/src/lib/i18n/language-detection.ts` | Language detection functions to test |
| `/src/lib/i18n/config.ts` | i18n configuration |
| `/src/lib/translations/fetch-translations.ts` | Translation fetch utilities |
| `/src/hooks/useGuestLanguage.ts` | Guest language hook |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Language switcher component |

### Configuration Files That May Need Updates

| File Path | Potential Changes |
|-----------|------------------|
| `/vitest.config.ts` | Add performance test patterns if needed |
| `/playwright.config.ts` | Add performance test project configuration |

---

## Dependencies

### Prerequisites

- REQ-E04-002: Guest language detection utilities must be implemented
- REQ-E04-004: Translation fetch utilities must be implemented
- REQ-E04-014: useGuestLanguage hook must be implemented
- REQ-E04-008: GuestLanguageSwitcher component must be implemented
- REQ-E04-016: Guest item page with translation support must be implemented

### Epic Dependencies

- Epic 1 (Foundation) - i18n infrastructure and database tables
- Epic 3 (Dynamic Content) - Translation data populated in database

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database latency varies in prod | High | Medium | Use representative staging environment |
| Mock data doesn't reflect real performance | Medium | High | Include integration tests with real DB |
| Cold start vs warm cache differences | Medium | Medium | Test both scenarios explicitly |
| CI/CD environment differs from local | Medium | Low | Document expected variance |
| Component dependencies affect results | Low | Medium | Isolate timing measurements |

---

## Test Execution Plan

### Phase 1: Unit Performance Tests (Vitest)

1. Create performance test files for language detection
2. Create performance test files for translation fetch utilities
3. Create performance test files for useGuestLanguage hook
4. Run with `npm test -- --grep "Performance"` or `npx vitest`
5. Collect timing statistics and validate against thresholds

### Phase 2: Component Performance Tests (Vitest + React Testing Library)

1. Create render performance tests for GuestLanguageSwitcher
2. Measure re-render counts on language switches
3. Validate memory usage doesn't grow with repeated switches
4. Run with `npm test`

### Phase 3: E2E Performance Tests (Playwright)

1. Configure Playwright for performance measurement
2. Create navigation timing tests
3. Create client-side switching timing tests
4. Run with `npx playwright test --project=performance`

### Phase 4: Performance Analysis and Documentation

1. Aggregate all timing results
2. Calculate percentile statistics (average, P95, P99)
3. Document any bottlenecks identified
4. Create optimization recommendations if thresholds exceeded
5. Establish baseline metrics for regression testing

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Language detection average | < 10ms | Vitest performance tests |
| Language detection P95 | < 15ms | Vitest performance tests |
| Language detection P99 | < 25ms | Vitest performance tests |
| Content retrieval average | < 200ms | Integration tests |
| Content retrieval P95 | < 300ms | Integration tests |
| Content retrieval P99 | < 500ms | Integration tests |
| Client-side switch average | < 100ms | Component tests |
| Client-side switch P95 | < 150ms | Component tests |
| All performance tests pass | 100% | CI/CD pipeline |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-E04-027)
- **Performance Monitor Utility:** `/src/lib/performance-monitor.ts`
- **Language Detection:** `/src/lib/i18n/language-detection.ts`
- **Vitest Configuration:** `/vitest.config.ts`
- **Playwright Configuration:** `/playwright.config.ts`

---

## Implementation Notes

1. **Use Existing PerformanceMonitor:** Leverage the existing `PerformanceMonitor` class for consistent timing across tests
2. **Sample Size:** Use minimum 100 samples for server-side tests, 50 for client-side tests
3. **Percentile Calculations:** Report average, P95, and P99 for comprehensive analysis
4. **Warm-up Iterations:** Exclude first few iterations to avoid cold-start skew
5. **Isolation:** Ensure tests run in isolation to avoid cross-test interference
6. **Environment Parity:** Document any differences between test and production environments
7. **Database State:** Use consistent test data for reproducible results
8. **CI/CD Integration:** Add performance tests to CI pipeline with appropriate thresholds

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience - Phase 7.5 Performance Validation*
