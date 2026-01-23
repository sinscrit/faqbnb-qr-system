/**
 * @fileoverview Performance Test Helper Utilities for Epic 4 - Guest Experience
 *
 * This module provides reusable utilities for measuring execution time,
 * running benchmarks, and validating performance against target latencies.
 *
 * @description
 * Performance testing utilities:
 * - measureAsync/measureSync: High-resolution timing for individual operations
 * - runBenchmark: Statistical benchmarking with warmup, percentiles, pass rate
 * - validateBenchmark: Validates benchmark results against target criteria
 * - createMockRequest: Creates mock NextRequest for testing server-side functions
 * - formatBenchmarkReport: Formats benchmark results into readable table
 *
 * @module __tests__/performance/performanceHelpers
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-026 - Performance validation specification
 *
 * Last Modified: 2026-01-23 22:26
 */

// =============================================================================
// Interfaces
// =============================================================================

/**
 * Represents a single performance measurement result.
 */
export interface PerformanceMetric {
  /** Name of the operation measured */
  operation: string;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp when measurement was taken */
  timestamp: number;
  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Statistical benchmark result with percentiles and pass rate.
 */
export interface PerformanceBenchmark {
  /** Name of the operation benchmarked */
  operation: string;
  /** Target latency in milliseconds */
  targetMs: number;
  /** Number of samples collected */
  samples: number;
  /** Arithmetic mean of all samples */
  mean: number;
  /** Median (50th percentile) */
  median: number;
  /** 95th percentile latency */
  p95: number;
  /** 99th percentile latency */
  p99: number;
  /** Percentage of samples meeting target (0-1) */
  passRate: number;
  /** Minimum observed latency */
  min: number;
  /** Maximum observed latency */
  max: number;
}

/**
 * Options for running a benchmark.
 */
export interface BenchmarkOptions {
  /** Number of measured iterations (default: 100) */
  iterations?: number;
  /** Number of warmup iterations before measuring (default: 10) */
  warmup?: number;
  /** Target latency in milliseconds (default: 100) */
  targetMs?: number;
}

/**
 * Options for validating a benchmark result.
 */
export interface ValidationOptions {
  /** Require P95 <= targetMs (default: false) */
  requireP95?: boolean;
  /** Require P99 <= targetMs (default: false) */
  requireP99?: boolean;
  /** Minimum required pass rate (default: 0.95) */
  minPassRate?: number;
}

/**
 * Result of benchmark validation.
 */
export interface ValidationResult {
  /** Whether the benchmark passed all criteria */
  passed: boolean;
  /** Human-readable message explaining the result */
  message: string;
}

/**
 * Options for creating mock NextRequest.
 */
export interface MockRequestOptions {
  /** Base URL (default: 'https://example.com') */
  url?: string;
  /** URL search parameters */
  searchParams?: Record<string, string>;
  /** Cookies to include */
  cookies?: Record<string, string>;
  /** Headers to include */
  headers?: Record<string, string>;
}

// =============================================================================
// Measurement Functions
// =============================================================================

/**
 * Measures the execution time of an async function.
 *
 * Uses performance.now() for high-resolution timing.
 *
 * @template T - Return type of the measured function
 * @param fn - Async function to measure
 * @returns Object with result and duration in milliseconds
 *
 * @example
 * const { result, duration } = await measureAsync(async () => {
 *   return await fetch('/api/data');
 * });
 * console.log(`Fetch took ${duration}ms`);
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
 * Measures the execution time of a synchronous function.
 *
 * Uses performance.now() for high-resolution timing.
 *
 * @template T - Return type of the measured function
 * @param fn - Sync function to measure
 * @returns Object with result and duration in milliseconds
 *
 * @example
 * const { result, duration } = measureSync(() => {
 *   return parseJSON(data);
 * });
 * console.log(`Parse took ${duration}ms`);
 */
export function measureSync<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

// =============================================================================
// Benchmark Functions
// =============================================================================

/**
 * Runs a benchmark with warmup iterations and statistical analysis.
 *
 * @description
 * This function:
 * 1. Runs warmup iterations to eliminate cold-start bias
 * 2. Runs measured iterations and collects timing samples
 * 3. Calculates statistics: mean, median, P95, P99, pass rate
 *
 * @template T - Return type of the benchmarked function
 * @param name - Name of the operation being benchmarked
 * @param fn - Function to benchmark (sync or async)
 * @param options - Benchmark configuration options
 * @returns PerformanceBenchmark with statistical results
 *
 * @example
 * const benchmark = await runBenchmark(
 *   'detectLanguage',
 *   () => detectGuestLanguage(request),
 *   { targetMs: 5, iterations: 1000 }
 * );
 * console.log(`P95: ${benchmark.p95}ms`);
 */
export async function runBenchmark<T>(
  name: string,
  fn: () => T | Promise<T>,
  options: BenchmarkOptions = {}
): Promise<PerformanceBenchmark> {
  const {
    iterations = 100,
    warmup = 10,
    targetMs = 100,
  } = options;

  // Run warmup iterations (not measured)
  for (let i = 0; i < warmup; i++) {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
  }

  // Collect measured samples
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    const duration = performance.now() - start;
    samples.push(duration);
  }

  // Sort samples for percentile calculations
  const sortedSamples = [...samples].sort((a, b) => a - b);

  // Calculate statistics
  const sum = samples.reduce((acc, val) => acc + val, 0);
  const mean = sum / samples.length;
  const median = sortedSamples[Math.floor(sortedSamples.length / 2)];
  const p95 = sortedSamples[Math.floor(sortedSamples.length * 0.95)];
  const p99 = sortedSamples[Math.floor(sortedSamples.length * 0.99)];
  const min = sortedSamples[0];
  const max = sortedSamples[sortedSamples.length - 1];

  // Calculate pass rate (percentage of samples <= targetMs)
  const passingCount = samples.filter((s) => s <= targetMs).length;
  const passRate = passingCount / samples.length;

  return {
    operation: name,
    targetMs,
    samples: samples.length,
    mean,
    median,
    p95,
    p99,
    passRate,
    min,
    max,
  };
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates a benchmark result against specified criteria.
 *
 * @description
 * Validation checks:
 * - Pass rate >= minPassRate (default 0.95)
 * - P95 <= targetMs (if requireP95 is true)
 * - P99 <= targetMs (if requireP99 is true)
 *
 * @param benchmark - Benchmark result to validate
 * @param options - Validation criteria
 * @returns ValidationResult with passed status and message
 *
 * @example
 * const validation = validateBenchmark(benchmark, {
 *   requireP95: true,
 *   minPassRate: 0.95
 * });
 * expect(validation.passed).toBe(true);
 */
export function validateBenchmark(
  benchmark: PerformanceBenchmark,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    requireP95 = false,
    requireP99 = false,
    minPassRate = 0.95,
  } = options;

  const failures: string[] = [];

  // Check pass rate
  if (benchmark.passRate < minPassRate) {
    failures.push(
      `Pass rate ${(benchmark.passRate * 100).toFixed(1)}% < required ${(minPassRate * 100).toFixed(1)}%`
    );
  }

  // Check P95 if required
  if (requireP95 && benchmark.p95 > benchmark.targetMs) {
    failures.push(
      `P95 ${benchmark.p95.toFixed(2)}ms > target ${benchmark.targetMs}ms`
    );
  }

  // Check P99 if required
  if (requireP99 && benchmark.p99 > benchmark.targetMs) {
    failures.push(
      `P99 ${benchmark.p99.toFixed(2)}ms > target ${benchmark.targetMs}ms`
    );
  }

  if (failures.length === 0) {
    return {
      passed: true,
      message: `✓ ${benchmark.operation}: P95=${benchmark.p95.toFixed(2)}ms, Pass Rate=${(benchmark.passRate * 100).toFixed(1)}%`,
    };
  }

  return {
    passed: false,
    message: `✗ ${benchmark.operation}: ${failures.join(', ')}`,
  };
}

// =============================================================================
// Mock Request Factory
// =============================================================================

/**
 * Creates a mock NextRequest object for testing server-side functions.
 *
 * @description
 * Creates a lightweight mock that implements the essential parts of NextRequest:
 * - url: Full URL with search params
 * - nextUrl: URL object with searchParams
 * - cookies.get: Function to retrieve cookies
 * - headers.get: Function to retrieve headers
 *
 * @param options - Request configuration
 * @returns Mock NextRequest-like object
 *
 * @example
 * const request = createMockRequest({
 *   searchParams: { lang: 'fr' },
 *   cookies: { FAQBNB_GUEST_LANG: 'es' },
 *   headers: { 'Accept-Language': 'fr-FR,fr;q=0.9' }
 * });
 */
export function createMockRequest(options: MockRequestOptions = {}): {
  url: string;
  nextUrl: { searchParams: URLSearchParams };
  cookies: { get: (name: string) => { value: string } | undefined };
  headers: { get: (name: string) => string | null };
} {
  const {
    url = 'https://example.com',
    searchParams = {},
    cookies = {},
    headers = {},
  } = options;

  // Build URL with search params
  const urlObj = new URL(url);
  for (const [key, value] of Object.entries(searchParams)) {
    urlObj.searchParams.set(key, value);
  }

  return {
    url: urlObj.toString(),
    nextUrl: {
      searchParams: urlObj.searchParams,
    },
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        return value !== undefined ? { value } : undefined;
      },
    },
    headers: {
      get: (name: string) => headers[name] ?? null,
    },
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Simulates network latency by waiting a specified time.
 *
 * Useful for mocking database or API response times in tests.
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified delay
 *
 * @example
 * // Simulate 50ms database latency
 * await simulateNetworkLatency(50);
 */
export function simulateNetworkLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Formats an array of benchmark results into a readable table.
 *
 * @description
 * Creates an ASCII table with columns:
 * - Operation name
 * - Target (ms)
 * - Mean (ms)
 * - Median (ms)
 * - P95 (ms)
 * - P99 (ms)
 * - Pass Rate (%)
 *
 * @param benchmarks - Array of benchmark results
 * @returns Formatted table string with box drawing characters
 *
 * @example
 * console.log(formatBenchmarkReport([benchmark1, benchmark2]));
 */
export function formatBenchmarkReport(
  benchmarks: PerformanceBenchmark[]
): string {
  if (benchmarks.length === 0) {
    return 'No benchmarks to report.';
  }

  const header =
    '┌────────────────────────────────────────┬────────┬────────┬────────┬────────┬────────┬────────┐\n' +
    '│ Operation                              │ Target │   Mean │ Median │    P95 │    P99 │  Pass% │\n' +
    '├────────────────────────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤';

  const rows = benchmarks.map((b) => {
    const opName = b.operation.substring(0, 38).padEnd(38);
    const target = `${b.targetMs}ms`.padStart(6);
    const mean = `${b.mean.toFixed(1)}`.padStart(6);
    const median = `${b.median.toFixed(1)}`.padStart(6);
    const p95 = `${b.p95.toFixed(1)}`.padStart(6);
    const p99 = `${b.p99.toFixed(1)}`.padStart(6);
    const pass = `${(b.passRate * 100).toFixed(0)}%`.padStart(6);
    return `│ ${opName} │ ${target} │ ${mean} │ ${median} │ ${p95} │ ${p99} │ ${pass} │`;
  });

  const footer =
    '└────────────────────────────────────────┴────────┴────────┴────────┴────────┴────────┴────────┘';

  return [header, ...rows, footer].join('\n');
}
