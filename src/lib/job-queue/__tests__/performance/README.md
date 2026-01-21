# Performance Tests for Translation Job Queue

**Last Modified:** 2026-01-21

## Overview

This directory contains performance tests for the translation job queue system. These tests validate:

- High-volume job creation (100+ concurrent jobs)
- Job completion time (target: p95 < 60 seconds)
- Rate limiting under load
- Concurrency limit enforcement
- Memory stability (no leaks)
- Recovery behavior after high load

## Test Structure

```
performance/
├── helpers/
│   ├── index.ts                 # Barrel exports
│   ├── performance-metrics.ts   # Metrics collection and analysis
│   ├── load-generator.ts        # Job batch creation utilities
│   ├── timing-utils.ts          # High-resolution timing helpers
│   └── resource-monitor.ts      # Memory and connection tracking
├── high-volume-job-creation.perf.test.ts
├── job-completion-time.perf.test.ts
├── rate-limiting-under-load.perf.test.ts
├── concurrency-limits.perf.test.ts
├── sustained-load.perf.test.ts
├── recovery-behavior.perf.test.ts
└── README.md
```

## Running Performance Tests

### Run All Performance Tests

```bash
npm run test:perf
```

### Run Specific Test File

```bash
npx vitest run src/lib/job-queue/__tests__/performance/job-completion-time.perf.test.ts
```

### Run with Verbose Output

```bash
npm run test:perf -- --reporter=verbose
```

### Run with Memory Profiling (requires --expose-gc)

```bash
node --expose-gc ./node_modules/.bin/vitest run --testNamePattern='perf'
```

## Metrics Output

Test results are written to `../performance-results/` as JSON files with timestamps.

### Output Format

```json
{
  "testName": "high-volume-creation",
  "testRunAt": "2026-01-21T17:45:00.000Z",
  "config": {
    "totalJobs": 100,
    "maxConcurrent": 10,
    "batchSize": 20,
    "mockLatencyRange": { "min": 50, "max": 200 }
  },
  "metrics": {
    "totalJobs": 100,
    "completedJobs": 100,
    "failedJobs": 0,
    "avgCompletionTimeMs": 250.5,
    "p50CompletionTimeMs": 230.2,
    "p95CompletionTimeMs": 450.8,
    "p99CompletionTimeMs": 520.1,
    "throughputJobsPerSecond": 38.5
  },
  "rateLimitMetrics": {
    "totalRequests": 100,
    "throttledRequests": 25,
    "avgQueueWaitMs": 120.5
  },
  "resourceMetrics": {
    "peakMemoryUsageMb": 85.2,
    "avgMemoryUsageMb": 72.1,
    "peakConcurrentJobs": 10
  }
}
```

## Interpreting Results

### Key Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| p95CompletionTimeMs | < 60,000 | 95th percentile completion time in milliseconds |
| failedJobs | 0 | Number of jobs that failed during processing |
| peakConcurrentJobs | <= maxConcurrent | Should never exceed configured limit |
| memoryGrowth | < 50 MB | Memory growth over sustained load |

### Warning Signs

- **p95 > 60 seconds**: Job processing too slow, check concurrency settings
- **Failed jobs > 0**: Check error logs, may indicate rate limiting issues
- **Peak concurrent > limit**: Concurrency control not working correctly
- **Memory growing linearly**: Potential memory leak

### Common Issues

1. **Slow completion times**
   - Increase `maxConcurrent` if rate limits allow
   - Check mock latency settings
   - Verify no unnecessary delays in processing

2. **Rate limit failures**
   - Reduce concurrent requests
   - Increase queue size
   - Use longer queue timeout

3. **Memory growth**
   - Check for uncleared references
   - Verify cleanup in afterEach hooks
   - Run with `--expose-gc` for accurate measurements

## Test Dependencies

- Vitest (test framework)
- Node.js performance API
- process.memoryUsage() for memory tracking

## Adding New Tests

1. Create test file with `.perf.test.ts` extension
2. Import helpers from `./helpers`
3. Use `createMetricsCollector` for timing
4. Use `createResourceMonitor` for memory tracking
5. Write results to `../performance-results/`

## CI/CD Integration

Performance tests are excluded from regular CI runs due to timing sensitivity. Run manually or in dedicated performance testing environment.

```yaml
# Example CI job for performance tests
performance-tests:
  runs-on: ubuntu-latest
  timeout-minutes: 30
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm run test:perf
    - uses: actions/upload-artifact@v4
      with:
        name: perf-results
        path: src/lib/job-queue/__tests__/performance-results/
```
