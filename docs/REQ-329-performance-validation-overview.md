# REQ-329: Performance Validation for Guest Localization System

**Last Modified:** 2026-01-18
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 7 - Testing & Polish
**Task ID:** 7.5
**PRD Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## Summary

The system should meet defined performance benchmarks for all guest-facing localization operations to ensure language features do not degrade user experience or page load times.

### Performance Targets

| Operation | Target | Measurement Point |
|-----------|--------|-------------------|
| Language Detection | < 10ms | Request to language code result |
| Content with Translation | < 200ms | Database query to merged content response |
| Language Switch (Client-side) | < 100ms | User action to content display update |

---

## Current Behavior

Guest localization features including language detection, content translation display, and language switching have been implemented but lack systematic performance measurement and validation. Without defined performance benchmarks and testing, there is no guarantee that translation features execute efficiently or that they maintain acceptable response times under production load conditions.

---

## Expected Behavior

A comprehensive performance test suite validates that all localization operations meet defined performance thresholds:

1. **Language Detection** completes in under 10 milliseconds, ensuring minimal impact on server response times and page load performance
2. **Content Retrieval with Translation** completes in under 200 milliseconds, providing fast page rendering even when fetching and merging translated content from the database
3. **Client-side Language Switching** executes in under 100 milliseconds, creating an instant, responsive feel when guests toggle between languages or view original content

Performance tests run against realistic data volumes including items with multiple translations, complex Accept-Language headers, and concurrent request scenarios.

---

## Technical Context

### Existing Performance Monitoring Infrastructure

The codebase has an established performance monitoring utility at `/src/lib/performance-monitor.ts`:

```typescript
interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  operation: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  lastExecution: number;
}
```

**Available Functions:**
- `startTiming(operation, metadata?)` - Start timing an operation
- `endTiming(metricId, success, metadata?)` - End timing an operation
- `recordTiming(operation, duration, success, metadata?)` - Record a complete operation
- `getPerformanceStats(operation?)` - Get statistics for operations
- `getPerformanceSummary()` - Get overall performance summary

### Testing Framework

| Component | Details |
|-----------|---------|
| Framework | Vitest |
| Environment | jsdom |
| Config | `/vitest.config.ts` |
| Setup | `/vitest.setup.ts` |
| Test Location | `src/**/__tests__/*.test.ts` |

### Localization Dependencies (from Epic 4)

| Dependency | Expected Location | Purpose |
|------------|-------------------|---------|
| Language Detection Utility | `/src/lib/i18n/guest-language.ts` | Detect language from URL/cookie/headers |
| Translation Fetch Utilities | `/src/lib/translations/fetch-translations.ts` | Fetch translated content from DB |
| Translation Utils | `/src/lib/translations/translation-utils.ts` | Merge translations with content |
| useGuestLanguage Hook | `/src/hooks/useGuestLanguage.ts` | Client-side language state management |

---

## Implementation Approach

### Phase 1: Performance Test Utilities

Create dedicated performance testing utilities that integrate with the existing performance monitor and vitest framework.

**Task 1.1: Create performance test helpers**
- Create timing assertion utilities
- Create benchmark runner for repeated measurements
- Create statistical analysis helpers (percentiles, standard deviation)

**Task 1.2: Create mock data factories for performance testing**
- Create complex Accept-Language header generator
- Create mock translation data with realistic sizes
- Create mock item data with varying translation completeness

### Phase 2: Language Detection Performance Tests

**Task 2.1: URL parameter detection benchmark**
- Measure time to detect language from `?lang=` parameter
- Test with valid, invalid, and missing parameters
- Verify < 10ms threshold

**Task 2.2: Cookie detection benchmark**
- Measure time to parse and extract language from cookie
- Test with various cookie scenarios
- Verify < 10ms threshold

**Task 2.3: Accept-Language header parsing benchmark**
- Measure time to parse simple headers (single language)
- Measure time to parse complex headers (multiple languages with quality weights)
- Test worst-case scenario (maximum complexity header)
- Verify < 10ms threshold

**Task 2.4: Combined detection priority benchmark**
- Measure end-to-end detection time with all sources
- Test fallback chain performance
- Verify < 10ms threshold

### Phase 3: Content Retrieval Performance Tests

**Task 3.1: Single item with translation fetch benchmark**
- Measure database query + translation merge time
- Test with complete translations
- Test with partial translations
- Test with no translations (fallback to original)
- Verify < 200ms threshold

**Task 3.2: Item with articles and links benchmark**
- Measure time to fetch item, articles, and links with translations
- Test varying numbers of articles/links
- Verify < 200ms threshold

**Task 3.3: Translation merge operation benchmark**
- Measure isolated merge operation time
- Test with varying field counts
- Verify merge contributes minimally to total time

**Task 3.4: Database query efficiency validation**
- Verify translation joins use appropriate indexes
- Measure query plan efficiency
- Identify any N+1 query patterns

### Phase 4: Client-Side Language Switch Performance Tests

**Task 4.1: State update benchmark**
- Measure React state update time for language change
- Verify < 100ms threshold

**Task 4.2: View Original toggle benchmark**
- Measure content swap time (no network request)
- Verify instant client-side toggle
- Verify < 100ms threshold

**Task 4.3: Cookie update benchmark**
- Measure cookie persistence time
- Verify non-blocking operation

**Task 4.4: URL parameter update benchmark**
- Measure URL update via history API
- Verify no page reload triggered
- Verify < 100ms threshold

### Phase 5: Integration and Regression Tests

**Task 5.1: End-to-end performance test**
- Measure complete user flow: page load with translation
- Measure language switch and content refresh
- Verify all thresholds met in combination

**Task 5.2: Performance regression test setup**
- Create automated benchmark that can be run in CI
- Establish baseline metrics
- Configure threshold alerts

**Task 5.3: Load testing considerations**
- Document concurrent request handling
- Test multiple simultaneous translation fetches
- Verify no performance degradation under load

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/__tests__/guest-language.performance.test.ts` | Language detection performance tests |
| `/src/lib/translations/__tests__/fetch-translations.performance.test.ts` | Content retrieval performance tests |
| `/src/hooks/__tests__/useGuestLanguage.performance.test.ts` | Client-side switch performance tests |
| `/src/lib/__tests__/performance-test-utils.ts` | Shared performance testing utilities |

### Existing Files to Modify

| File Path | Modifications |
|-----------|---------------|
| `/src/lib/i18n/guest-language.ts` | Add performance.now() instrumentation points |
| `/src/lib/translations/fetch-translations.ts` | Add timing measurements for database queries |
| `/src/lib/translations/translation-utils.ts` | Add timing for merge operations |
| `/src/hooks/useGuestLanguage.ts` | Add client-side timing for state updates |
| `/vitest.config.ts` | Add performance test include patterns if needed |

### Functions to Instrument

**Language Detection (`/src/lib/i18n/guest-language.ts`):**
- `detectGuestLanguage()` - Main detection function
- `parseAcceptLanguage()` - Header parsing
- `mapToSupportedLanguage()` - Language mapping

**Translation Fetch (`/src/lib/translations/fetch-translations.ts`):**
- `fetchTranslatedItem()` - Item with translation
- `fetchArticleTranslations()` - Article translations
- `fetchLinkTranslations()` - Link translations

**Translation Utils (`/src/lib/translations/translation-utils.ts`):**
- `mergeTranslation()` - Content merging
- `getDisplayLanguage()` - Language selection logic

**Client Hook (`/src/hooks/useGuestLanguage.ts`):**
- `setLanguage()` - Language change handler
- `toggleOriginal()` - Original view toggle

---

## Test Specifications

### Performance Test Structure

```typescript
// Example test structure for language detection
describe('Language Detection Performance', () => {
  const THRESHOLD_MS = 10;
  const ITERATIONS = 100;

  describe('URL Parameter Detection', () => {
    it('should detect language from URL param in under 10ms', async () => {
      const times: number[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        await detectGuestLanguage({ lang: 'fr' });
        const end = performance.now();
        times.push(end - start);
      }

      const average = times.reduce((a, b) => a + b) / times.length;
      const p95 = percentile(times, 95);

      expect(average).toBeLessThan(THRESHOLD_MS);
      expect(p95).toBeLessThan(THRESHOLD_MS * 2); // P95 can be 2x threshold
    });
  });
});
```

### Mock Data Specifications

**Complex Accept-Language Header (Worst Case):**
```typescript
const complexHeader =
  'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,de-DE;q=0.6,de;q=0.5,es-ES;q=0.4,es;q=0.3,it;q=0.2,nl;q=0.1';
```

**Realistic Translation Data:**
```typescript
const mockTranslation = {
  id: 'trans-1',
  item_id: 'item-1',
  language: 'fr',
  name: 'Translated name with moderate length for realistic testing',
  description: 'A longer translated description that simulates realistic content length with multiple sentences and proper grammar.',
  translation_status: 'completed',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

---

## Acceptance Criteria

### Language Detection (< 10ms)
- [ ] Performance test measures language detection execution time from request to language code result
- [ ] Language detection consistently completes in under 10 milliseconds across all detection scenarios
- [ ] Detection performance test covers URL parameter detection, cookie detection, and Accept-Language header parsing
- [ ] Performance benchmark accounts for worst-case Accept-Language header complexity with multiple language codes and quality weights

### Content Retrieval (< 200ms)
- [ ] Performance test measures end-to-end content retrieval time including database queries and translation merging
- [ ] Content with translation retrieval consistently completes in under 200 milliseconds for typical items
- [ ] Content retrieval benchmark includes joining item content with translation data across all relevant translation tables
- [ ] Performance test validates query efficiency for items with articles, links, and tags that all require translation lookups

### Client-Side Switch (< 100ms)
- [ ] Performance test measures client-side language switch time from user action to content display update
- [ ] Language switching consistently completes in under 100 milliseconds for client-side toggle operations
- [ ] Switch performance benchmark includes state updates, content swapping, and banner visibility changes

### General Performance Requirements
- [ ] Performance tests execute against realistic production-scale data volumes with hundreds of items and translations
- [ ] Tests measure performance impact of partial translations versus complete translations
- [ ] Tests validate that language detection does not create measurable overhead on non-localized routes
- [ ] Performance regression tests run automatically to detect degradation when new localization features are added
- [ ] Benchmark results are documented and tracked over time to identify performance trends
- [ ] Tests identify and report specific bottlenecks when performance thresholds are not met
- [ ] Performance test suite covers both server-side operations and client-side rendering and state management

---

## Dependencies

### Prerequisites (from Epic 4)
- REQ-305: Guest Language Detection Utility Module (implemented)
- REQ-307: Translation Fetch Utilities (implemented)
- REQ-310: Translation Utility Helpers (implemented)
- REQ-317: useGuestLanguage Hook (implemented)
- REQ-319: Guest Item Page with Language Detection (implemented)

### Existing Infrastructure
- Performance monitor utility (`/src/lib/performance-monitor.ts`)
- Vitest testing framework configured
- jsdom test environment
- Database translation tables (from Epic 1)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database performance varies | Medium | Medium | Use connection pooling, test with warm cache |
| CI environment has different performance | High | Low | Use relative thresholds and percentage comparisons |
| Mock data doesn't reflect production | Medium | Medium | Use realistic data sizes and structures |
| Performance monitor adds overhead | Low | Low | Measure overhead and subtract from thresholds |
| Network latency in tests | Medium | Medium | Use mocked database responses for unit tests |

---

## Implementation Notes

### Performance Measurement Best Practices

1. **Warm-up runs**: Discard first few iterations to avoid JIT compilation effects
2. **Multiple iterations**: Run at least 100 iterations for statistical significance
3. **Statistical analysis**: Report mean, P50, P95, P99, and max values
4. **Isolation**: Test each operation in isolation before integration
5. **Realistic data**: Use production-like data volumes and complexity

### Threshold Justification

| Operation | Threshold | Justification |
|-----------|-----------|---------------|
| Language Detection (10ms) | Imperceptible delay; should not impact server response time |
| Content Retrieval (200ms) | Fast enough for smooth page load; accounts for database roundtrip |
| Language Switch (100ms) | Perceived as instant by users; no loading indicator needed |

### Integration with Existing Monitoring

Leverage the existing `performanceMonitor` singleton for production metrics:

```typescript
// In production code
import { startTiming, endTiming } from '@/lib/performance-monitor';

const metricId = startTiming('language_detection', { source: 'url' });
const language = detectFromUrl(params);
endTiming(metricId, true, { detected: language });
```

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Epic 4 Requests: `/docs/gen_requests_epic4.md`
- Performance Monitor: `/src/lib/performance-monitor.ts`
- Vitest Config: `/vitest.config.ts`
- Test Setup: `/vitest.setup.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 7 Testing & Polish*
