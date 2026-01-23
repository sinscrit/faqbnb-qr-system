# Detailed Task Breakdown: Performance Validation

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-026 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 19:59 |
| Overview Document | REQ-E04-026-performance-validation-overview.md |
| Breakdown Created | 2026-01-23 00:06 |
| Phase | 7 - Testing & Polish |
| Task ID | 7.5 |
| Title | Performance validation |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command | Description |
|--------|---------|-------------|
| Type Check | `npm run typecheck` | Verify TypeScript types |
| Unit Tests | `npm test` | Run all tests with Vitest |
| Performance Tests | `npm run test:perf` | Run performance benchmarks |
| Performance Watch | `npm run test:perf:watch` | Run perf tests in watch mode |
| Coverage | `npm run test:coverage` | Generate coverage report |
| Build | `npm run build` | Build production bundle |
| Lint | `npm run lint` | Run ESLint |

---

## Overview

This document provides a detailed task breakdown for **REQ-E04-026: Performance Validation**. This task creates comprehensive performance tests to validate that the guest language detection and translation system meets latency requirements. Tests measure middleware detection (< 10ms), server-side detection (< 5ms), content loading (< 200ms), client-side toggle (< 100ms), and language switcher interaction (< 50ms).

**Key objectives:**
1. Create performance test utilities (measurement, benchmarking, validation)
2. Test language detection performance (URL param, cookie, Accept-Language header)
3. Test content loading performance (fetch with translation merge)
4. Test client-side interaction performance (toggle, language switch, component rendering)
5. Test page load performance (SSR, metadata generation)
6. Measure impact on Core Web Vitals (TTFB, LCP)
7. Establish performance benchmarks with P95/P99 statistics
8. Create performance test runner script
9. Add performance test commands to package.json
10. Validate all operations meet target latencies

**Performance Targets:**
- Middleware detection: < 10ms
- Server-side detection: < 5ms
- Content fetch with translation: < 200ms
- Client-side toggle: < 100ms
- Language switcher: < 50ms
- TTFB increase: < 50ms
- LCP increase: < 100ms

This is a **SPECIFICATION** document for work that WILL BE DONE by the implementation agent (Agent 04). All checkboxes are **unchecked** by default. Agent 04 will check them off as work progresses.

**Status:** PENDING

---

## Phase 1: Performance Test Infrastructure

### Task 1.1: Create Performance Test Directory

**ID:** **1.1**

Create directory structure for performance tests.

**Context:** Performance tests require dedicated directory separate from unit tests.

**Files to modify:**
- Create: `src/__tests__/performance/` directory

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **1.1.1** Create `src/__tests__` directory if it doesn't exist
- [ ] **1.1.2** Create `src/__tests__/performance/` subdirectory
- [ ] **1.1.3** Verify directory structure is correct
- [ ] **1.1.4** Run `ls -la src/__tests__/performance/` to confirm creation

**Implementation Notes:**
- Performance tests are separate from functional tests
- Use `.perf.test.ts` naming convention for performance test files

**Verification Steps:**
1. Verify directory created at correct path
2. Check directory permissions are correct
3. Confirm directory is accessible

---

### Task 1.2: Create Performance Helper Utilities File

**ID:** **1.2**

Create `src/__tests__/performance/performanceHelpers.ts` with measurement and validation utilities.

**Context:** Performance tests need reusable utilities for measuring execution time, running benchmarks, and validating results against targets.

**Files to modify:**
- Create: `src/__tests__/performance/performanceHelpers.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **1.2.1** Create file with module header and REQ-E04-026 reference
- [ ] **1.2.2** Define `PerformanceMetric` interface with operation, duration, timestamp, metadata fields
- [ ] **1.2.3** Define `PerformanceBenchmark` interface with operation, targetMs, samples, mean, median, p95, p99, passRate
- [ ] **1.2.4** Export `measureAsync<T>` function
- [ ] **1.2.5** Function accepts async function, returns `{ result: T; duration: number }`
- [ ] **1.2.6** Use `performance.now()` for timing
- [ ] **1.2.7** Export `measureSync<T>` function
- [ ] **1.2.8** Function accepts sync function, returns `{ result: T; duration: number }`
- [ ] **1.2.9** Export `runBenchmark<T>` function
- [ ] **1.2.10** Function accepts name, function to test, options (iterations, warmup, targetMs)
- [ ] **1.2.11** Default iterations: 100, warmup: 10, targetMs: 100
- [ ] **1.2.12** Run warmup iterations without counting
- [ ] **1.2.13** Run measured iterations and collect samples
- [ ] **1.2.14** Calculate mean: sum of samples / count
- [ ] **1.2.15** Calculate median: sorted[floor(length / 2)]
- [ ] **1.2.16** Calculate p95: sorted[floor(length * 0.95)]
- [ ] **1.2.17** Calculate p99: sorted[floor(length * 0.99)]
- [ ] **1.2.18** Calculate passRate: samples <= targetMs / total samples
- [ ] **1.2.19** Return PerformanceBenchmark object
- [ ] **1.2.20** Export `validateBenchmark` function
- [ ] **1.2.21** Accept benchmark and options (requireP95, requireP99, minPassRate)
- [ ] **1.2.22** Check if passRate >= minPassRate (default 0.95)
- [ ] **1.2.23** Check if p95 <= targetMs when requireP95 is true
- [ ] **1.2.24** Check if p99 <= targetMs when requireP99 is true
- [ ] **1.2.25** Return `{ passed: boolean; message: string }`
- [ ] **1.2.26** Export `createMockRequest` function
- [ ] **1.2.27** Accept options: url, searchParams, cookies, headers
- [ ] **1.2.28** Return mock NextRequest object with url, nextUrl, cookies.get, headers.get
- [ ] **1.2.29** Export `simulateNetworkLatency(ms)` function
- [ ] **1.2.30** Return Promise that resolves after ms milliseconds
- [ ] **1.2.31** Export `formatBenchmarkReport` function
- [ ] **1.2.32** Accept array of benchmarks
- [ ] **1.2.33** Return formatted table string with box drawing characters
- [ ] **1.2.34** Include operation name, target, mean, median, p95, p99, pass rate
- [ ] **1.2.35** Add JSDoc comments for all exports
- [ ] **1.2.36** Run `npm run typecheck` to verify no type errors

**Implementation Notes:**
- Use `performance.now()` for high-resolution timing
- Warmup iterations eliminate cold-start bias
- P95/P99 percentiles show performance distribution
- Pass rate indicates consistency

**Verification Steps:**
1. Verify file created at correct path
2. Verify all exports are properly typed
3. Run typecheck to ensure no errors
4. Test helper functions with simple examples

---

## Phase 2: Language Detection Performance Tests

### Task 2.1: Create Language Detection Performance Test File

**ID:** **2.1**

Create `src/__tests__/performance/languageDetection.perf.test.ts` with test structure.

**Context:** Language detection is critical path operation that must be fast (< 5ms).

**Files to modify:**
- Create: `src/__tests__/performance/languageDetection.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.1.1** Create file with module header and REQ reference
- [ ] **2.1.2** Import Vitest utilities: describe, it, expect, beforeAll, afterAll
- [ ] **2.1.3** Import `detectGuestLanguage` from '@/lib/i18n/guest-language'
- [ ] **2.1.4** Import performance helpers
- [ ] **2.1.5** Create benchmarks array to collect results
- [ ] **2.1.6** Create top-level describe: 'Language Detection - Performance'
- [ ] **2.1.7** Add afterAll to print benchmark report
- [ ] **2.1.8** Run `npm run typecheck` to verify structure

**Implementation Notes:**
- Collect benchmarks for reporting at end
- afterAll prints formatted report

**Verification Steps:**
1. Verify file created correctly
2. Verify imports resolve
3. Run typecheck to verify structure

---

### Task 2.2: Test URL Parameter Detection Performance

**ID:** **2.2**

Write benchmark test for detecting language from URL parameter.

**Context:** URL parameter is highest priority detection source. Must be very fast.

**Files to modify:**
- Edit: `src/__tests__/performance/languageDetection.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.2.1** Create describe block: 'Server-Side Detection Function'
- [ ] **2.2.2** Write test: 'detects language from URL parameter in < 5ms'
- [ ] **2.2.3** Create mock request with searchParams: { lang: 'fr' }
- [ ] **2.2.4** Run benchmark: call detectGuestLanguage('fr', request)
- [ ] **2.2.5** Set targetMs: 5, iterations: 1000
- [ ] **2.2.6** Push benchmark to benchmarks array
- [ ] **2.2.7** Validate benchmark with requireP95: true, minPassRate: 0.95
- [ ] **2.2.8** Expect validation.passed to be true
- [ ] **2.2.9** Run `npm run test:perf` to verify test passes

**Implementation Notes:**
- 1000 iterations provides good statistical sample
- P95 requirement ensures consistent performance
- 5ms target is aggressive but achievable

**Verification Steps:**
1. Run test and verify it passes
2. Check benchmark report shows good performance
3. Verify P95 is under 5ms

---

### Task 2.3: Test Cookie Detection Performance

**ID:** **2.3**

Write benchmark test for detecting language from cookie.

**Context:** Cookie is second priority detection source. Should be very fast.

**Files to modify:**
- Edit: `src/__tests__/performance/languageDetection.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.3.1** Write test: 'detects language from cookie in < 5ms'
- [ ] **2.3.2** Create mock request with cookies: { FAQBNB_GUEST_LANG: 'es' }
- [ ] **2.3.3** Run benchmark: call detectGuestLanguage(null, request)
- [ ] **2.3.4** Set targetMs: 5, iterations: 1000
- [ ] **2.3.5** Push benchmark to array
- [ ] **2.3.6** Validate with requireP95: true
- [ ] **2.3.7** Expect validation.passed to be true
- [ ] **2.3.8** Run test to verify it passes

**Implementation Notes:**
- Cookie detection should be as fast as URL parameter
- Same 5ms target

**Verification Steps:**
1. Run test and verify it passes
2. Check performance is consistent
3. Verify no slowdowns with cookie parsing

---

### Task 2.4: Test Accept-Language Header Parsing Performance

**ID:** **2.4**

Write benchmark test for parsing Accept-Language header.

**Context:** Header parsing is more complex than URL/cookie. Must still be fast.

**Files to modify:**
- Edit: `src/__tests__/performance/languageDetection.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.4.1** Write test: 'parses Accept-Language header in < 5ms'
- [ ] **2.4.2** Create mock request with header: 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
- [ ] **2.4.3** Run benchmark: call detectGuestLanguage(null, request)
- [ ] **2.4.4** Set targetMs: 5, iterations: 1000
- [ ] **2.4.5** Push benchmark to array
- [ ] **2.4.6** Validate with requireP95: true
- [ ] **2.4.7** Expect validation.passed to be true
- [ ] **2.4.8** Run test to verify it passes

**Implementation Notes:**
- Complex header with quality values
- Tests realistic scenario
- Parsing must be optimized

**Verification Steps:**
1. Run test and verify it passes
2. Check header parsing doesn't slow detection
3. Verify P95 meets target

---

### Task 2.5: Test Full Detection Cascade Performance

**ID:** **2.5**

Write benchmark test for complete priority cascade.

**Context:** Real-world requests have all detection sources. Test complete flow.

**Files to modify:**
- Edit: `src/__tests__/performance/languageDetection.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.5.1** Write test: 'full detection cascade in < 5ms'
- [ ] **2.5.2** Create mock request with all sources: URL param, cookie, header
- [ ] **2.5.3** Set searchParams: { lang: 'de' }
- [ ] **2.5.4** Set cookies: { FAQBNB_GUEST_LANG: 'es' }
- [ ] **2.5.5** Set headers: { 'Accept-Language': 'fr-FR,fr;q=0.9' }
- [ ] **2.5.6** Run benchmark: call detectGuestLanguage('de', request)
- [ ] **2.5.7** Set targetMs: 5, iterations: 1000
- [ ] **2.5.8** Push benchmark to array
- [ ] **2.5.9** Validate with requireP95: true
- [ ] **2.5.10** Expect validation.passed to be true
- [ ] **2.5.11** Run test to verify it passes

**Implementation Notes:**
- Tests worst-case: all detection sources present
- URL param should win (highest priority)
- Cascade evaluation should still be fast

**Verification Steps:**
1. Run test and verify it passes
2. Check cascade doesn't add significant overhead
3. Verify result is 'de' (URL param wins)

---

### Task 2.6: Test Edge Case Performance

**ID:** **2.6**

Write benchmark tests for edge cases (invalid codes, malformed headers).

**Context:** Error handling must not significantly slow down detection.

**Files to modify:**
- Edit: `src/__tests__/performance/languageDetection.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **2.6.1** Create describe block: 'Edge Cases Performance'
- [ ] **2.6.2** Write test: 'handles invalid language codes efficiently'
- [ ] **2.6.3** Run benchmark with invalid language: 'invalid-lang'
- [ ] **2.6.4** Set targetMs: 5
- [ ] **2.6.5** Validate and expect pass
- [ ] **2.6.6** Write test: 'handles malformed Accept-Language efficiently'
- [ ] **2.6.7** Create request with malformed header: ';;;invalid;;;'
- [ ] **2.6.8** Run benchmark
- [ ] **2.6.9** Set targetMs: 5
- [ ] **2.6.10** Validate and expect pass
- [ ] **2.6.11** Run tests to verify they pass

**Implementation Notes:**
- Error handling should be fast
- Invalid input shouldn't cause slowdowns
- Fallback to default should be quick

**Verification Steps:**
1. Run tests and verify they pass
2. Check error paths are performant
3. Verify no exceptions thrown

---

## Phase 3: Content Loading Performance Tests

### Task 3.1: Create Content Loading Performance Test File

**ID:** **3.1**

Create `src/__tests__/performance/contentLoading.perf.test.ts` with test structure.

**Context:** Content loading with translation merge must complete in < 200ms.

**Files to modify:**
- Create: `src/__tests__/performance/contentLoading.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.1.1** Create file with module header and REQ reference
- [ ] **3.1.2** Import Vitest utilities including vi for mocking
- [ ] **3.1.3** Import fetchTranslatedItem or equivalent function
- [ ] **3.1.4** Import performance helpers
- [ ] **3.1.5** Mock Supabase client
- [ ] **3.1.6** Create mock item data with translations
- [ ] **3.1.7** Mock returns data and no error
- [ ] **3.1.8** Create benchmarks array
- [ ] **3.1.9** Create top-level describe: 'Content Loading - Performance'
- [ ] **3.1.10** Add afterAll to print report
- [ ] **3.1.11** Run typecheck to verify structure

**Implementation Notes:**
- Mock database to isolate content processing performance
- Focus on translation merge logic, not network
- Mock data should be realistic

**Verification Steps:**
1. Verify file created correctly
2. Verify mocks are set up properly
3. Run typecheck to verify structure

---

### Task 3.2: Test Item Fetching with Translation Merge

**ID:** **3.2**

Write benchmark tests for fetching item with translation merge.

**Context:** Most common operation - fetch item and merge translation. Must be fast.

**Files to modify:**
- Edit: `src/__tests__/performance/contentLoading.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.2.1** Create describe block: 'Item Fetching with Translation Merge'
- [ ] **3.2.2** Write test: 'fetches and merges translation in < 200ms'
- [ ] **3.2.3** Run benchmark: call fetchTranslatedItem('test123', 'fr')
- [ ] **3.2.4** Set targetMs: 200, iterations: 100
- [ ] **3.2.5** Push benchmark to array
- [ ] **3.2.6** Validate with requireP95: true, minPassRate: 0.90
- [ ] **3.2.7** Expect validation.passed to be true
- [ ] **3.2.8** Write test: 'fetches original content in < 200ms'
- [ ] **3.2.9** Run benchmark with language 'en' (no translation needed)
- [ ] **3.2.10** Validate and expect pass
- [ ] **3.2.11** Write test: 'handles missing translation efficiently'
- [ ] **3.2.12** Run benchmark with unsupported language 'de'
- [ ] **3.2.13** Validate and expect pass
- [ ] **3.2.14** Run tests to verify they pass

**Implementation Notes:**
- 200ms includes database fetch simulation
- Translation merge should add minimal overhead
- Missing translation should fall back quickly

**Verification Steps:**
1. Run tests and verify they pass
2. Check translation merge is fast
3. Verify fallback doesn't slow down

---

### Task 3.3: Test Batch Operations Performance

**ID:** **3.3**

Write benchmark tests for batch fetching articles and links.

**Context:** Items may have multiple articles/links needing translation. Batch operations must be efficient.

**Files to modify:**
- Edit: `src/__tests__/performance/contentLoading.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **3.3.1** Create describe block: 'Batch Operations Performance'
- [ ] **3.3.2** Write test: 'batch fetches article translations efficiently'
- [ ] **3.3.3** Create array of article IDs: ['article-1', 'article-2', 'article-3']
- [ ] **3.3.4** Run benchmark: call fetchArticleTranslations(articleIds, 'fr')
- [ ] **3.3.5** Set targetMs: 250, iterations: 50
- [ ] **3.3.6** Validate with minPassRate: 0.90
- [ ] **3.3.7** Expect validation.passed to be true
- [ ] **3.3.8** Write test: 'batch fetches link translations efficiently'
- [ ] **3.3.9** Create array of link IDs
- [ ] **3.3.10** Run benchmark for link translations
- [ ] **3.3.11** Validate and expect pass
- [ ] **3.3.12** Run tests to verify they pass

**Implementation Notes:**
- Batch operations allow slightly higher latency (250ms)
- Should be more efficient than N individual fetches
- Test with realistic batch sizes (3 items)

**Verification Steps:**
1. Run tests and verify they pass
2. Check batch operations are efficient
3. Verify no N+1 query patterns

---

## Phase 4: Client-Side Performance Tests

### Task 4.1: Create Client Interactions Performance Test File

**ID:** **4.1**

Create `src/__tests__/performance/clientInteractions.perf.test.ts` with test structure.

**Context:** Client-side operations must be fast for good UX (< 100ms).

**Files to modify:**
- Create: `src/__tests__/performance/clientInteractions.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.1.1** Create file with module header and REQ reference
- [ ] **4.1.2** Import Vitest utilities including vi
- [ ] **4.1.3** Import renderHook and act from '@testing-library/react'
- [ ] **4.1.4** Import useGuestLanguage hook
- [ ] **4.1.5** Import performance helpers
- [ ] **4.1.6** Create benchmarks array
- [ ] **4.1.7** Create describe: 'Client-Side Interactions - Performance'
- [ ] **4.1.8** Add afterAll to print report
- [ ] **4.1.9** Run typecheck to verify

**Implementation Notes:**
- Test React hook and component performance
- Use renderHook for testing hooks
- Focus on state update speed

**Verification Steps:**
1. Verify file created correctly
2. Verify imports resolve
3. Run typecheck

---

### Task 4.2: Test useGuestLanguage Hook Performance

**ID:** **4.2**

Write benchmark tests for hook operations (toggle, setLanguage).

**Context:** Hook operations must be fast - they're triggered by user interactions.

**Files to modify:**
- Edit: `src/__tests__/performance/clientInteractions.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.2.1** Create describe block: 'useGuestLanguage Hook'
- [ ] **4.2.2** Write test: 'toggleOriginal completes in < 100ms'
- [ ] **4.2.3** Render hook with initial language 'fr'
- [ ] **4.2.4** Run benchmark: call result.current.toggleOriginal() in act()
- [ ] **4.2.5** Set targetMs: 100, iterations: 100
- [ ] **4.2.6** Validate with requireP95: true, minPassRate: 0.95
- [ ] **4.2.7** Expect validation.passed to be true
- [ ] **4.2.8** Write test: 'setLanguage completes in < 100ms'
- [ ] **4.2.9** Render hook
- [ ] **4.2.10** Run benchmark: call result.current.setLanguage('fr') in act()
- [ ] **4.2.11** Validate and expect pass
- [ ] **4.2.12** Run tests to verify they pass

**Implementation Notes:**
- Toggle and language change are instant operations
- Should complete well under 100ms
- Use act() to wrap state updates

**Verification Steps:**
1. Run tests and verify they pass
2. Check hook operations are very fast
3. Verify no unnecessary re-renders

---

### Task 4.3: Test Component Render Performance

**ID:** **4.3**

Write benchmark tests for component rendering speed.

**Context:** Components should render quickly to avoid UI lag.

**Files to modify:**
- Edit: `src/__tests__/performance/clientInteractions.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.3.1** Create describe block: 'Component Render Performance'
- [ ] **4.3.2** Write test: 'GuestLanguageSwitcher renders in < 50ms'
- [ ] **4.3.3** Import component dynamically
- [ ] **4.3.4** Import render from '@testing-library/react'
- [ ] **4.3.5** Run benchmark: render component with props
- [ ] **4.3.6** Set targetMs: 50, iterations: 50
- [ ] **4.3.7** Validate with minPassRate: 0.90
- [ ] **4.3.8** Expect validation.passed to be true
- [ ] **4.3.9** Write test: 'TranslationBanner renders in < 50ms'
- [ ] **4.3.10** Benchmark banner component render
- [ ] **4.3.11** Validate and expect pass
- [ ] **4.3.12** Run tests to verify they pass

**Implementation Notes:**
- 50ms target for UI component render
- Lower iteration count (50) due to DOM operations
- Dynamic imports to isolate component loading

**Verification Steps:**
1. Run tests and verify they pass
2. Check component rendering is fast
3. Verify no expensive computations in render

---

### Task 4.4: Test Cookie Operations Performance

**ID:** **4.4**

Write benchmark test for cookie setting operation.

**Context:** Cookie operations happen on language change. Should be very fast.

**Files to modify:**
- Edit: `src/__tests__/performance/clientInteractions.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **4.4.1** Create describe block: 'Cookie Operations'
- [ ] **4.4.2** Write test: 'setGuestLanguageCookie completes in < 10ms'
- [ ] **4.4.3** Import setGuestLanguageCookie function
- [ ] **4.4.4** Create mock response with cookies.set
- [ ] **4.4.5** Run benchmark: call setGuestLanguageCookie(mockResponse, 'fr')
- [ ] **4.4.6** Set targetMs: 10, iterations: 1000
- [ ] **4.4.7** Validate with requireP95: true
- [ ] **4.4.8** Expect validation.passed to be true
- [ ] **4.4.9** Run test to verify it passes

**Implementation Notes:**
- Cookie setting is simple operation
- Should be very fast (< 10ms)
- 1000 iterations for good statistical sample

**Verification Steps:**
1. Run test and verify it passes
2. Check cookie operation is very fast
3. Verify no blocking operations

---

## Phase 5: Page Load Performance Tests

### Task 5.1: Create Page Load Performance Test File

**ID:** **5.1**

Create `src/__tests__/performance/pageLoad.perf.test.ts` with test structure.

**Context:** Page load metrics (TTFB, LCP) critical for user experience.

**Files to modify:**
- Create: `src/__tests__/performance/pageLoad.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.1.1** Create file with module header and REQ reference
- [ ] **5.1.2** Import Vitest utilities
- [ ] **5.1.3** Import performance helpers
- [ ] **5.1.4** Create mock item and translation meta data
- [ ] **5.1.5** Create benchmarks array
- [ ] **5.1.6** Create describe: 'Page Load - Performance'
- [ ] **5.1.7** Add afterAll to print report
- [ ] **5.1.8** Run typecheck to verify

**Implementation Notes:**
- Page load tests may require actual page components
- Mock data to avoid database dependencies
- Focus on SSR performance

**Verification Steps:**
1. Verify file created correctly
2. Verify imports and mocks set up
3. Run typecheck

---

### Task 5.2: Test Server-Side Rendering Performance

**ID:** **5.2**

Write benchmark tests for SSR of guest item page.

**Context:** SSR performance affects TTFB. Must be fast.

**Files to modify:**
- Edit: `src/__tests__/performance/pageLoad.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.2.1** Create describe block: 'Server-Side Rendering'
- [ ] **5.2.2** Write test: 'guest item page SSR in < 500ms (with translation)'
- [ ] **5.2.3** Import ItemPage component
- [ ] **5.2.4** Run benchmark: call ItemPage with params and searchParams
- [ ] **5.2.5** Pass params: Promise.resolve({ publicId: 'test123' })
- [ ] **5.2.6** Pass searchParams: Promise.resolve({ lang: 'fr' })
- [ ] **5.2.7** Set targetMs: 500, iterations: 20
- [ ] **5.2.8** Validate with minPassRate: 0.80
- [ ] **5.2.9** Expect validation.passed to be true
- [ ] **5.2.10** Write test: 'metadata generation in < 100ms'
- [ ] **5.2.11** Import generateMetadata function
- [ ] **5.2.12** Benchmark metadata generation
- [ ] **5.2.13** Set targetMs: 100, iterations: 50
- [ ] **5.2.14** Validate and expect pass
- [ ] **5.2.15** Run tests to verify they pass

**Implementation Notes:**
- SSR includes data fetching, so higher latency acceptable
- 500ms target for complete page render
- Metadata generation should be faster (100ms)

**Verification Steps:**
1. Run tests and verify they pass
2. Check SSR performance is acceptable
3. Verify metadata generation is fast

---

### Task 5.3: Test Core Web Vitals Impact

**ID:** **5.3**

Write benchmark tests to measure TTFB and LCP impact.

**Context:** Translation should not significantly degrade Core Web Vitals.

**Files to modify:**
- Edit: `src/__tests__/performance/pageLoad.perf.test.ts`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **5.3.1** Create describe block: 'Core Web Vitals Impact'
- [ ] **5.3.2** Write test: 'TTFB increase is acceptable (< 50ms delta)'
- [ ] **5.3.3** Run baseline benchmark: fetch without translation
- [ ] **5.3.4** Set targetMs: 200, iterations: 20
- [ ] **5.3.5** Run translated benchmark: fetch with ?lang=fr
- [ ] **5.3.6** Set targetMs: 250, iterations: 20
- [ ] **5.3.7** Calculate delta: translatedBenchmark.mean - baselineBenchmark.mean
- [ ] **5.3.8** Push both benchmarks to array
- [ ] **5.3.9** Expect delta < 50ms
- [ ] **5.3.10** Log delta for visibility
- [ ] **5.3.11** Write test: 'LCP does not significantly increase with translation'
- [ ] **5.3.12** Benchmark ItemDisplay render time
- [ ] **5.3.13** Set targetMs: 100, iterations: 50
- [ ] **5.3.14** Validate with minPassRate: 0.90
- [ ] **5.3.15** Expect validation.passed to be true
- [ ] **5.3.16** Run tests to verify they pass

**Implementation Notes:**
- TTFB delta test requires actual fetch if possible
- LCP approximated by component render time in unit tests
- Real LCP testing requires E2E tests with Lighthouse

**Verification Steps:**
1. Run tests and verify they pass
2. Check TTFB delta is minimal
3. Verify content render is fast

---

## Phase 6: Test Runner and Configuration

### Task 6.1: Create Performance Test Runner Script

**ID:** **6.1**

Create `scripts/run-perf-tests.sh` for running performance tests.

**Context:** Convenient script for running all performance tests with formatted output.

**Files to modify:**
- Create: `scripts/run-perf-tests.sh`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.1.1** Create scripts directory if it doesn't exist
- [ ] **6.1.2** Create run-perf-tests.sh file
- [ ] **6.1.3** Add shebang: `#!/usr/bin/env bash`
- [ ] **6.1.4** Add `set -e` for error handling
- [ ] **6.1.5** Print header with box drawing characters
- [ ] **6.1.6** Run `npm test -- --run --reporter=verbose src/__tests__/performance/*.perf.test.ts`
- [ ] **6.1.7** Print completion message
- [ ] **6.1.8** Make script executable: `chmod +x scripts/run-perf-tests.sh`
- [ ] **6.1.9** Test script: `./scripts/run-perf-tests.sh`
- [ ] **6.1.10** Verify output is formatted correctly

**Implementation Notes:**
- Use --run flag to disable watch mode
- Use --reporter=verbose for detailed output
- Script should be executable

**Verification Steps:**
1. Verify script created and executable
2. Run script and check output
3. Verify all tests run

---

### Task 6.2: Add Performance Test Scripts to package.json

**ID:** **6.2**

Add `test:perf` scripts to package.json.

**Context:** npm scripts provide convenient way to run performance tests.

**Files to modify:**
- Edit: `package.json`

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **6.2.1** Open package.json
- [ ] **6.2.2** Locate "scripts" section
- [ ] **6.2.3** Add `"test:perf": "vitest run src/__tests__/performance/*.perf.test.ts"`
- [ ] **6.2.4** Add `"test:perf:watch": "vitest watch src/__tests__/performance/*.perf.test.ts"`
- [ ] **6.2.5** Add `"test:perf:ui": "vitest --ui src/__tests__/performance/*.perf.test.ts"`
- [ ] **6.2.6** Verify JSON syntax is valid
- [ ] **6.2.7** Run `npm run test:perf` to verify script works
- [ ] **6.2.8** Run `npm run test:perf:watch` to verify watch mode works
- [ ] **6.2.9** Verify all performance tests run

**Implementation Notes:**
- test:perf runs tests once (for CI)
- test:perf:watch runs in watch mode (for development)
- test:perf:ui opens Vitest UI (optional)

**Verification Steps:**
1. Verify scripts added to package.json
2. Test each script command
3. Verify correct tests run

---

## Phase 7: Test Execution and Validation

### Task 7.1: Run All Performance Tests

**ID:** **7.1**

Execute all performance tests and verify they pass.

**Context:** Complete test suite must pass and meet performance targets.

**Files to modify:**
- None (test execution only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.1.1** Run `npm run test:perf` command
- [ ] **7.1.2** Verify language detection tests pass
- [ ] **7.1.3** Verify content loading tests pass
- [ ] **7.1.4** Verify client interaction tests pass
- [ ] **7.1.5** Verify page load tests pass
- [ ] **7.1.6** Check all P95 targets are met
- [ ] **7.1.7** Review benchmark reports
- [ ] **7.1.8** Verify pass rates are >= 95%
- [ ] **7.1.9** Check exit code is 0 (all tests passed)
- [ ] **7.1.10** Document any performance concerns

**Implementation Notes:**
- All tests must pass before task is complete
- Review benchmark reports carefully
- Document any borderline performance

**Verification Steps:**
1. Run complete performance test suite
2. Review all benchmark reports
3. Verify all targets met
4. Document results

---

### Task 7.2: Run Performance Tests in CI

**ID:** **7.2**

Integrate performance tests into CI pipeline.

**Context:** Performance tests should run on every PR to catch regressions.

**Files to modify:**
- None (configuration may be needed)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.2.1** Add performance test step to CI configuration
- [ ] **7.2.2** Run `npm run test:perf` in CI
- [ ] **7.2.3** Verify tests run successfully in CI environment
- [ ] **7.2.4** Set up performance regression alerts if possible
- [ ] **7.2.5** Document CI integration in README

**Implementation Notes:**
- CI environment may have different performance characteristics
- May need to adjust targets for CI
- Consider caching to speed up CI runs

**Verification Steps:**
1. Trigger CI build
2. Verify performance tests run
3. Check test results
4. Verify alerts work if configured

---

### Task 7.3: Manual Performance Validation

**ID:** **7.3**

Perform manual performance validation with real tools.

**Context:** Automated tests don't catch everything. Manual validation important.

**Files to modify:**
- None (manual testing only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **7.3.1** Start dev server: `npm run dev`
- [ ] **7.3.2** Open Chrome DevTools
- [ ] **7.3.3** Run Lighthouse audit on guest item page without translation
- [ ] **7.3.4** Record baseline TTFB and LCP scores
- [ ] **7.3.5** Run Lighthouse audit on same page with ?lang=fr
- [ ] **7.3.6** Compare scores
- [ ] **7.3.7** Verify TTFB delta < 50ms
- [ ] **7.3.8** Verify LCP delta < 100ms
- [ ] **7.3.9** Use Performance tab to record page load
- [ ] **7.3.10** Verify no long tasks blocking main thread
- [ ] **7.3.11** Check for memory leaks
- [ ] **7.3.12** Test with "Fast 3G" network throttling
- [ ] **7.3.13** Verify performance is acceptable on slow connection
- [ ] **7.3.14** Document findings

**Implementation Notes:**
- Lighthouse provides real Core Web Vitals metrics
- Performance tab shows detailed timing breakdown
- Test on slow network to catch issues
- Document any performance concerns

**Verification Steps:**
1. Complete all manual test scenarios
2. Document Lighthouse scores
3. Compare baseline vs translated
4. Note any issues found

---

## Phase 8: Documentation and Finalization

### Task 8.1: Document Performance Benchmarks

**ID:** **8.1**

Create documentation for performance benchmarks and targets.

**Context:** Performance targets should be documented for future reference.

**Files to modify:**
- Create or edit: Performance documentation

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.1.1** Document all performance targets
- [ ] **8.1.2** List middleware detection: < 10ms
- [ ] **8.1.3** List server-side detection: < 5ms
- [ ] **8.1.4** List content fetch: < 200ms
- [ ] **8.1.5** List client toggle: < 100ms
- [ ] **8.1.6** List language switcher: < 50ms
- [ ] **8.1.7** List TTFB increase: < 50ms
- [ ] **8.1.8** List LCP increase: < 100ms
- [ ] **8.1.9** Document how to run performance tests
- [ ] **8.1.10** Explain benchmark statistics (mean, p95, p99)
- [ ] **8.1.11** Add to README or docs folder

**Implementation Notes:**
- Clear documentation helps future developers
- Include examples of running tests
- Explain what targets mean

**Verification Steps:**
1. Review documentation for clarity
2. Verify all targets documented
3. Check examples are correct

---

### Task 8.2: Commit Changes

**ID:** **8.2**

Commit all performance test files with proper message.

**Context:** Follow project git conventions for commits.

**Files to modify:**
- None (git operations only)

**Estimated effort:** 1 story point

**Acceptance Criteria:**
- [ ] **8.2.1** Run `git status` to review changed files
- [ ] **8.2.2** Verify test files and package.json changes are included
- [ ] **8.2.3** Run `git add .` to stage all changes
- [ ] **8.2.4** Create commit with message: `[REQ-E04-026] Performance validation`
- [ ] **8.2.5** Add second line: blank
- [ ] **8.2.6** Add third line: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
- [ ] **8.2.7** Verify commit succeeds
- [ ] **8.2.8** Run `git log` to verify commit appears correctly
- [ ] **8.2.9** Push to remote if appropriate

**Implementation Notes:**
- Follow project commit message format exactly
- Include Co-Authored-By line per project standards
- Commit should include all test files and package.json

**Verification Steps:**
1. Review git status
2. Verify commit message format
3. Check commit appears in log
4. Push if required

---

## Dependencies

**Depends On (Must Complete First):**
- REQ-E04-002: Guest language utility must exist
- REQ-E04-004: Translation fetch utilities must exist
- REQ-E04-008: GuestLanguageSwitcher component must exist
- REQ-E04-009: TranslationBanner component must exist
- REQ-E04-014: useGuestLanguage hook must exist
- REQ-E04-016: Guest item page with translation support must exist
- REQ-E04-020: Middleware language detection must exist
- REQ-E04-021: Server-side detection utility must exist

**Blocks (Cannot Start Until This Completes):**
- None - Testing task doesn't block other work

**Parallel Safety:**
- Safe to run in parallel with REQ-E04-025 (Mobile Testing)
- Safe to run in parallel with other functional tests
- Only creates test files and adds npm scripts

---

## Technical Context

**Project Stack:**
- Next.js 15 (App Router)
- TypeScript 5.x
- Vitest (testing framework)
- React Testing Library (@testing-library/react)
- Performance API (performance.now())

**Key Files:**
- `src/lib/i18n/guest-language.ts` - Functions under test
- `src/lib/i18n/translation-fetch.ts` - Functions under test
- `src/hooks/useGuestLanguage.ts` - Hook under test
- `src/components/guest/*.tsx` - Components under test
- `src/app/item/[publicId]/page.tsx` - Page under test

**Performance Targets:**
- **Critical Path**: Middleware (10ms), Server detection (5ms)
- **User Interaction**: Toggle (100ms), Switcher (50ms), Cookie (10ms)
- **Content Load**: Fetch with translation (200ms), Batch (250ms)
- **Page Load**: SSR (500ms), Metadata (100ms), TTFB delta (50ms), LCP delta (100ms)

---

## Acceptance Criteria Summary

This task is complete when:

1. **Performance Test Infrastructure Created:**
   - [ ] Performance test directory created
   - [ ] Performance helper utilities implemented
   - [ ] Measurement and benchmark functions working

2. **All Performance Tests Written:**
   - [ ] Language detection tests (URL param, cookie, header, cascade, edge cases)
   - [ ] Content loading tests (fetch with merge, original, missing translation, batch)
   - [ ] Client interaction tests (toggle, setLanguage, component render, cookie)
   - [ ] Page load tests (SSR, metadata, Core Web Vitals)

3. **All Performance Targets Met:**
   - [ ] Middleware detection < 10ms (P95)
   - [ ] Server-side detection < 5ms (P95)
   - [ ] Content fetch < 200ms (P95)
   - [ ] Client toggle < 100ms (P95)
   - [ ] Language switcher < 50ms (P95)
   - [ ] TTFB increase < 50ms (mean delta)
   - [ ] LCP increase < 100ms (approximated)

4. **Test Infrastructure Complete:**
   - [ ] Performance test runner script created and executable
   - [ ] npm scripts added to package.json
   - [ ] Tests run successfully via `npm run test:perf`

5. **All Tests Pass:**
   - [ ] Performance test suite passes: `npm run test:perf`
   - [ ] All P95 targets met
   - [ ] All pass rates >= 95%
   - [ ] Benchmark reports generated

6. **CI Integration:**
   - [ ] Performance tests integrated into CI pipeline
   - [ ] Tests run successfully in CI environment

7. **Manual Validation Complete:**
   - [ ] Lighthouse audits performed
   - [ ] TTFB and LCP deltas measured
   - [ ] Performance tab validation done
   - [ ] Network throttling tested

8. **Documentation Complete:**
   - [ ] Performance targets documented
   - [ ] Test running instructions documented
   - [ ] Benchmark statistics explained

9. **Changes Committed:**
   - [ ] All test files committed with proper message
   - [ ] package.json changes committed
   - [ ] Co-Authored-By line included

---

## Notes

- **Performance Budget:** Critical operations have aggressive targets to ensure good UX
- **P95 Metrics:** 95th percentile ensures consistent performance, not just average
- **Warmup Iterations:** Eliminate cold-start bias from measurements
- **Pass Rate:** 95% pass rate ensures operations are consistently fast
- **Statistics:** Mean, median, P95, P99 provide complete performance picture
- **Edge Cases:** Error handling must not slow down happy path
- **Real Metrics:** Manual validation with Lighthouse provides real Core Web Vitals
- **Continuous Monitoring:** Tests in CI catch performance regressions early

---

*Document created: 2026-01-23 00:06*
*Status: PENDING - Ready for implementation by Agent 04*
