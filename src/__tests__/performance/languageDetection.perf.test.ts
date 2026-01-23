/**
 * @fileoverview Language Detection Performance Tests for Epic 4 - Guest Experience
 *
 * This module tests the performance of guest language detection functions
 * to ensure they meet the < 5ms latency target for server-side operations.
 *
 * @description
 * Performance tests for:
 * - URL parameter detection (highest priority)
 * - Cookie-based detection
 * - Accept-Language header parsing
 * - Full detection cascade
 * - Edge cases (invalid codes, malformed headers)
 *
 * @module __tests__/performance/languageDetection.perf.test
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-026 - Performance validation specification
 *
 * Last Modified: 2026-01-23 22:30
 */

import { describe, it, expect, afterAll } from 'vitest';
import {
  detectGuestLanguage,
  parseAcceptLanguage,
  mapToSupportedLanguage,
} from '@/lib/i18n/guest-language';
import {
  runBenchmark,
  validateBenchmark,
  createMockRequest,
  formatBenchmarkReport,
  type PerformanceBenchmark,
} from './performanceHelpers';

// =============================================================================
// Test Configuration
// =============================================================================

/** Collect all benchmarks for final report */
const benchmarks: PerformanceBenchmark[] = [];

/** Target latency for language detection operations */
const DETECTION_TARGET_MS = 5;

/** Number of iterations for statistical significance */
const ITERATIONS = 1000;

// =============================================================================
// Report Generation
// =============================================================================

afterAll(() => {
  console.log('\n' + '═'.repeat(80));
  console.log('Language Detection Performance Report');
  console.log('═'.repeat(80));
  console.log(formatBenchmarkReport(benchmarks));
});

// =============================================================================
// Test Suite
// =============================================================================

describe('Language Detection - Performance', () => {
  describe('Server-Side Detection Function', () => {
    it('detects language from URL parameter in < 5ms', async () => {
      const request = createMockRequest({
        searchParams: { lang: 'fr' },
      });

      const benchmark = await runBenchmark(
        'URL Parameter Detection',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => detectGuestLanguage(request as any, 'fr'),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
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
        'Cookie Detection',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => detectGuestLanguage(request as any),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
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
        'Accept-Language Detection',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => detectGuestLanguage(request as any),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('full detection cascade in < 5ms', async () => {
      // Create request with all detection sources
      const request = createMockRequest({
        searchParams: { lang: 'de' },
        cookies: { FAQBNB_GUEST_LANG: 'es' },
        headers: { 'Accept-Language': 'fr-FR,fr;q=0.9' },
      });

      const benchmark = await runBenchmark(
        'Full Detection Cascade',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => detectGuestLanguage(request as any, 'de'),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
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
      const benchmark = await runBenchmark(
        'Invalid Language Code',
        () => mapToSupportedLanguage('invalid-lang'),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('handles malformed Accept-Language efficiently', async () => {
      const benchmark = await runBenchmark(
        'Malformed Accept-Language',
        () => parseAcceptLanguage(';;;invalid;;;'),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('handles empty input efficiently', async () => {
      const benchmark = await runBenchmark(
        'Empty Accept-Language',
        () => parseAcceptLanguage(''),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('handles null input efficiently', async () => {
      const benchmark = await runBenchmark(
        'Null Accept-Language',
        () => parseAcceptLanguage(null),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Helper Functions Performance', () => {
    it('parseAcceptLanguage with complex header in < 5ms', async () => {
      const complexHeader =
        'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,de-DE;q=0.6,de;q=0.5,es;q=0.4,it;q=0.3,nl;q=0.2';

      const benchmark = await runBenchmark(
        'Parse Complex Accept-Language',
        () => parseAcceptLanguage(complexHeader),
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('mapToSupportedLanguage with regional variants in < 5ms', async () => {
      const variants = ['en-US', 'fr-CA', 'de-DE', 'es-ES', 'nl-BE', 'it-IT'];

      const benchmark = await runBenchmark(
        'Map Regional Variants',
        () => {
          variants.forEach((v) => mapToSupportedLanguage(v));
        },
        { targetMs: DETECTION_TARGET_MS, iterations: ITERATIONS }
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
