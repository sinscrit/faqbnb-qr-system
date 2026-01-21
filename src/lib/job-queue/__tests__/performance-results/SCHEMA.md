# Performance Test Results Schema

**Last Modified:** 2026-01-21

This directory contains JSON output from performance tests.
Files are generated automatically and ignored by git.

## File Naming Convention

`{test-name}-{timestamp}.json`

Example: `high-volume-1705773900000.json`

## Schema Reference

See `../helpers/performance-metrics.ts` for TypeScript interfaces:
- `PerformanceTestResults`
- `JobTimingMetric`
- `RateLimitEvent`
- `ResourceSnapshot`

## Example Output

```json
{
  "testName": "high-volume-creation",
  "testRunAt": "2026-01-21T12:00:00.000Z",
  "config": {
    "totalJobs": 100,
    "maxConcurrent": 10,
    "batchSize": 20,
    "mockLatencyRange": { "min": 50, "max": 200 },
    "rateLimitConfig": { "maxRequests": 20, "windowMs": 1000 }
  },
  "metrics": {
    "totalJobs": 100,
    "completedJobs": 100,
    "failedJobs": 0,
    "avgCompletionTimeMs": 250.5,
    "p50CompletionTimeMs": 230.2,
    "p95CompletionTimeMs": 450.8,
    "p99CompletionTimeMs": 520.1,
    "maxCompletionTimeMs": 750.0,
    "minCompletionTimeMs": 55.2,
    "throughputJobsPerSecond": 38.5
  },
  "rateLimitMetrics": {
    "totalRequests": 100,
    "throttledRequests": 25,
    "queuedRequests": 25,
    "avgQueueWaitMs": 120.5
  },
  "resourceMetrics": {
    "peakMemoryUsageMb": 85.2,
    "avgMemoryUsageMb": 72.1,
    "peakConcurrentJobs": 10,
    "avgConcurrentJobs": 7.5
  },
  "jobTimings": [
    {
      "jobId": "abc-123",
      "entityType": "item",
      "queuedAt": 12345.67,
      "startedAt": 12350.00,
      "completedAt": 12600.00,
      "totalDurationMs": 254.33,
      "processingDurationMs": 250.00,
      "queueWaitMs": 4.33,
      "status": "completed"
    }
  ]
}
```
