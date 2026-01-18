# REQ-277: Implement Concurrency Control for Translation API Calls - Overview

**Document Created:** 2026-01-18 14:45:00 UTC
**Last Modified:** 2026-01-18 14:45:00 UTC
**Request Reference:** `/docs/gen_requests_epic3.md` - Request #277
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.7
**Size:** M (Medium)
**Priority:** P1 - High
**Depends On:** Epic 1 Foundation (Plan-110), Job Queue Infrastructure (REQ-243/244), Job Prioritization (REQ-276)

---

## Summary

Implement a concurrency control mechanism for the translation job processor that enforces a maximum of 10 concurrent translation API calls at any given time. This prevents overwhelming translation service providers with excessive simultaneous requests, ensuring stable, predictable translation throughput without service interruptions caused by rate limiting or provider throttling. The implementation uses a semaphore-based pattern with configurable limits.

---

## Current Behavior

Translation job processors execute API calls to translation service providers without limits on concurrent execution:

```typescript
// Current behavior (hypothetical - no concurrency control)
async function processTranslationBatch(jobs: TranslationJob[]): Promise<void> {
  // All jobs start processing simultaneously
  await Promise.all(jobs.map(job => processTranslationJob(job)));
  // This can generate dozens or hundreds of concurrent API requests
}
```

This results in:
- Potential dozens or hundreds of concurrent API requests during peak load
- Translation service provider rate limit violations (HTTP 429 errors)
- Service throttling causing translation delays
- Degraded translation service performance due to resource exhaustion
- Possible service suspension or additional costs for exceeding provider quotas

---

## Expected Behavior

When translation jobs are being processed, the system enforces a maximum of 10 concurrent translation API calls at any given time:

1. **Queue-based throttling**: Jobs wait in a queue until concurrency slot is available
2. **Semaphore pattern**: Acquire permit before API call, release after completion
3. **Graceful handling**: Failed jobs release their slots correctly
4. **Configurable limit**: Maximum concurrency is configurable via environment variable
5. **Non-blocking management**: Concurrency control does not block job picker or queue management

```
Job Processor picks 20 jobs
        │
        ▼
    Concurrency Semaphore (limit: 10)
        │
        ├── Jobs 1-10: Acquire permits, start processing
        │
        ├── Jobs 11-20: Wait in queue
        │
        ▼
    Job 3 completes, releases permit
        │
        ▼
    Job 11 acquires permit, starts processing
        │
        ▼
    (continues until all jobs processed)
```

---

## Technical Context

### Dependencies from Epic 1 (Plan-110)

This task requires the following Epic 1 infrastructure to be implemented:

| Component | Location | Required For |
|-----------|----------|--------------|
| Translation service | `/src/lib/translation-service/` | `translateText()` function |
| Translation jobs table | Database | `translation_jobs` with status tracking |
| Job queue infrastructure | `/src/lib/job-queue/` | Job processing pipeline |
| Job processor | `/src/lib/job-queue/translation-jobs.ts` | Integration point for concurrency |

### Existing Patterns to Follow

Based on codebase exploration, the project has established patterns for concurrency and rate limiting:

| Pattern | Source Location | Relevance |
|---------|-----------------|-----------|
| Batch processing with batch size | `/src/hooks/useQRCodeGeneration.ts` | Configurable batch size (5) |
| Sequential processing in batches | `/src/hooks/useQRCodeGeneration.ts` | Process items within batch sequentially |
| Inter-batch delays | `/src/hooks/useQRCodeGeneration.ts` | 100ms delay between batches |
| Rate limiting with delays | `/src/lib/email-service.ts` | 100ms delay between operations |
| Timeout with Promise.race | `/src/lib/auth.ts`, `/src/lib/qrcode-utils.ts` | 10-second timeouts |
| Retry on rate limit (429) | `/src/lib/api.ts` | Detect and handle rate limiting |
| AbortController integration | `/src/hooks/useQRCodeGeneration.ts` | Cancellable operations |

### Configuration Pattern

From `/src/lib/config.ts`, environment variables follow this pattern:

```typescript
// Priority chain for configuration
export function getConfigValue(key: string): string | null {
  return process.env[key] || null;
}
```

---

## Architecture

### Component Location

```
/src/lib/job-queue/
├── index.ts                      # Module exports (add concurrency exports)
├── translation-jobs.ts           # Job processing (integrate concurrency)
├── translation-jobs.types.ts     # Types (add concurrency-related types)
├── priority.ts                   # Job prioritization (REQ-276)
└── concurrency.ts                # NEW: Concurrency control (This REQ)
```

### Data Flow

```
Translation Job Processor
        │
        ▼
processTranslationJob(job)
        │
        ├── Acquire concurrency permit
        │   │
        │   └── If at limit (10): Wait until permit available
        │
        ▼
Call Translation Service API
        │
        ├── Success: Store translation, update job status
        │
        ├── Failure: Handle error, update job status
        │
        └── Always: Release concurrency permit

    === CONCURRENT PROCESSING ===

    Permit Pool: [■■■■■■■■■■] (10 max)
                  ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
                  │ │ │ │ │ │ │ │ │ │
                  Active API Calls

    Waiting Queue: [Job 11] [Job 12] [Job 13] ...
                    (waiting for available permit)
```

### Semaphore Implementation

```typescript
// Semaphore-based concurrency control
class TranslationSemaphore {
  private permits: number;
  private readonly maxPermits: number;
  private waitingQueue: Array<() => void> = [];

  constructor(maxConcurrent: number = 10) {
    this.maxPermits = maxConcurrent;
    this.permits = maxConcurrent;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    // Wait for a permit to be released
    return new Promise<void>((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      next?.();
    } else {
      this.permits++;
    }
  }
}
```

---

## Integration Contract

### Type Definitions

```typescript
// /src/lib/job-queue/concurrency.ts

/**
 * Configuration options for concurrency control
 */
export interface ConcurrencyConfig {
  /** Maximum number of concurrent translation API calls */
  maxConcurrent: number;
  /** Optional timeout for waiting to acquire permit (in ms) */
  acquireTimeout?: number;
}

/**
 * Result of attempting to acquire a concurrency permit
 */
export interface AcquireResult {
  /** Whether the permit was successfully acquired */
  acquired: boolean;
  /** If failed, the reason why */
  error?: string;
}

/**
 * Statistics about current concurrency state
 */
export interface ConcurrencyStats {
  /** Number of available permits */
  available: number;
  /** Number of currently active API calls */
  active: number;
  /** Number of jobs waiting for a permit */
  waiting: number;
  /** Maximum concurrent limit */
  limit: number;
}
```

### Function Signatures

```typescript
// /src/lib/job-queue/concurrency.ts

/**
 * Get the singleton TranslationSemaphore instance
 *
 * Creates or returns the existing semaphore with the configured
 * maximum concurrency limit.
 *
 * @returns The singleton semaphore instance
 *
 * @example
 * const semaphore = getTranslationSemaphore();
 * await semaphore.acquire();
 * try {
 *   await callTranslationAPI();
 * } finally {
 *   semaphore.release();
 * }
 */
export function getTranslationSemaphore(): TranslationSemaphore;

/**
 * Execute a function with concurrency control
 *
 * Acquires a permit, executes the function, and releases the permit.
 * Ensures permit is always released even if function throws.
 *
 * @param fn - The async function to execute with concurrency control
 * @returns The result of the function
 *
 * @example
 * const result = await withConcurrencyControl(async () => {
 *   return await translateText(text, options);
 * });
 */
export function withConcurrencyControl<T>(fn: () => Promise<T>): Promise<T>;

/**
 * Get current concurrency statistics
 *
 * @returns Statistics about the current concurrency state
 *
 * @example
 * const stats = getConcurrencyStats();
 * console.log(`Active: ${stats.active}, Waiting: ${stats.waiting}`);
 */
export function getConcurrencyStats(): ConcurrencyStats;

/**
 * Get the maximum concurrency limit from configuration
 *
 * Reads from TRANSLATION_MAX_CONCURRENCY environment variable
 * or falls back to default of 10.
 *
 * @returns The maximum concurrency limit
 */
export function getMaxConcurrency(): number;

/**
 * Reset the semaphore (for testing purposes)
 *
 * WARNING: Only use in test environments
 */
export function resetSemaphore(): void;
```

### Usage from Job Processor

```typescript
// In /src/lib/job-queue/translation-jobs.ts

import { withConcurrencyControl, getConcurrencyStats } from './concurrency';
import { translateText } from '../translation-service';

async function processItemTranslation(job: TranslationJob): Promise<void> {
  // Fetch source content
  const item = await fetchItem(job.entity_id);

  // Translate with concurrency control
  const translatedName = await withConcurrencyControl(async () => {
    return await translateText({
      text: item.name,
      sourceLanguage: job.source_language,
      targetLanguage: job.target_language,
      context: { contentType: 'item_name' }
    });
  });

  const translatedDescription = await withConcurrencyControl(async () => {
    return await translateText({
      text: item.description,
      sourceLanguage: job.source_language,
      targetLanguage: job.target_language,
      context: { contentType: 'item_description' }
    });
  });

  // Store translation
  await storeItemTranslation(job.entity_id, job.target_language, {
    name: translatedName,
    description: translatedDescription
  });

  // Update job status
  await updateJobStatus(job.id, 'completed');
}

// Optional: Log concurrency stats periodically
async function logConcurrencyStats(): Promise<void> {
  const stats = getConcurrencyStats();
  console.log(`[Concurrency] Active: ${stats.active}/${stats.limit}, Waiting: ${stats.waiting}`);
}
```

### Alternative: Batch Processing with Semaphore

```typescript
// For processing multiple jobs with shared concurrency limit

async function processTranslationBatch(jobs: TranslationJob[]): Promise<void> {
  const semaphore = getTranslationSemaphore();

  // Map jobs to promises with concurrency control
  const promises = jobs.map(async (job) => {
    await semaphore.acquire();
    try {
      await processTranslationJob(job);
    } finally {
      semaphore.release();
    }
  });

  // All jobs execute respecting max concurrency
  await Promise.all(promises);
}
```

---

## Implementation Tasks

### Task 1: Create Concurrency Module File Structure

**File:** `/src/lib/job-queue/concurrency.ts`

```typescript
/**
 * Translation API Concurrency Control
 *
 * Provides semaphore-based throttling to limit concurrent translation
 * API calls, preventing rate limiting and service degradation.
 *
 * Default limit: 10 concurrent calls
 * Configurable via: TRANSLATION_MAX_CONCURRENCY environment variable
 *
 * @module job-queue/concurrency
 * @see docs/REQ-277-implement-concurrency-control-overview.md
 */

/**
 * Default maximum concurrent translation API calls
 */
const DEFAULT_MAX_CONCURRENCY = 10;

/**
 * Environment variable name for configuring max concurrency
 */
const ENV_MAX_CONCURRENCY = 'TRANSLATION_MAX_CONCURRENCY';

/**
 * Configuration options for concurrency control
 */
export interface ConcurrencyConfig {
  /** Maximum number of concurrent translation API calls */
  maxConcurrent: number;
  /** Optional timeout for waiting to acquire permit (in ms) */
  acquireTimeout?: number;
}

/**
 * Statistics about current concurrency state
 */
export interface ConcurrencyStats {
  /** Number of available permits */
  available: number;
  /** Number of currently active API calls */
  active: number;
  /** Number of jobs waiting for a permit */
  waiting: number;
  /** Maximum concurrent limit */
  limit: number;
}
```

### Task 2: Implement TranslationSemaphore Class

```typescript
/**
 * Semaphore for controlling concurrent translation API calls
 *
 * Uses a permit-based system where each API call must acquire a permit
 * before executing and release it when done. Waiting calls are queued
 * in FIFO order.
 */
export class TranslationSemaphore {
  private permits: number;
  private readonly maxPermits: number;
  private waitingQueue: Array<() => void> = [];

  /**
   * Create a new TranslationSemaphore
   *
   * @param maxConcurrent - Maximum number of concurrent operations (default: 10)
   */
  constructor(maxConcurrent: number = DEFAULT_MAX_CONCURRENCY) {
    if (maxConcurrent < 1) {
      throw new Error('maxConcurrent must be at least 1');
    }
    this.maxPermits = maxConcurrent;
    this.permits = maxConcurrent;
  }

  /**
   * Acquire a permit to proceed with an API call
   *
   * If no permits are available, the caller will wait until one is released.
   *
   * @returns Promise that resolves when permit is acquired
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    // Wait for a permit to be released
    return new Promise<void>((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  /**
   * Release a permit after completing an API call
   *
   * If there are waiting callers, the next one in queue is allowed to proceed.
   * Otherwise, the permit is returned to the pool.
   */
  release(): void {
    if (this.waitingQueue.length > 0) {
      // Give permit to next waiting caller
      const next = this.waitingQueue.shift();
      next?.();
    } else {
      // Return permit to pool
      this.permits++;
    }
  }

  /**
   * Get current statistics about the semaphore state
   *
   * @returns Current concurrency statistics
   */
  getStats(): ConcurrencyStats {
    return {
      available: this.permits,
      active: this.maxPermits - this.permits,
      waiting: this.waitingQueue.length,
      limit: this.maxPermits
    };
  }

  /**
   * Get the maximum concurrent limit
   *
   * @returns Maximum number of concurrent operations
   */
  getLimit(): number {
    return this.maxPermits;
  }

  /**
   * Check if all permits are currently in use
   *
   * @returns True if no permits are available
   */
  isAtCapacity(): boolean {
    return this.permits === 0;
  }

  /**
   * Reset the semaphore to initial state (for testing)
   *
   * WARNING: Only use in test environments. This will leave any
   * waiting callers hanging indefinitely.
   */
  reset(): void {
    this.permits = this.maxPermits;
    this.waitingQueue = [];
  }
}
```

### Task 3: Implement Singleton Instance Management

```typescript
/**
 * Singleton instance of the translation semaphore
 */
let semaphoreInstance: TranslationSemaphore | null = null;

/**
 * Get the maximum concurrency limit from configuration
 *
 * Reads from TRANSLATION_MAX_CONCURRENCY environment variable
 * or falls back to default of 10.
 *
 * @returns The maximum concurrency limit
 */
export function getMaxConcurrency(): number {
  const envValue = process.env[ENV_MAX_CONCURRENCY];

  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
    console.warn(
      `[Concurrency] Invalid ${ENV_MAX_CONCURRENCY} value: "${envValue}", using default: ${DEFAULT_MAX_CONCURRENCY}`
    );
  }

  return DEFAULT_MAX_CONCURRENCY;
}

/**
 * Get the singleton TranslationSemaphore instance
 *
 * Creates or returns the existing semaphore with the configured
 * maximum concurrency limit.
 *
 * @returns The singleton semaphore instance
 */
export function getTranslationSemaphore(): TranslationSemaphore {
  if (!semaphoreInstance) {
    const maxConcurrency = getMaxConcurrency();
    semaphoreInstance = new TranslationSemaphore(maxConcurrency);
    console.log(`[Concurrency] Initialized semaphore with max concurrency: ${maxConcurrency}`);
  }
  return semaphoreInstance;
}

/**
 * Reset the semaphore instance (for testing purposes)
 *
 * WARNING: Only use in test environments
 */
export function resetSemaphore(): void {
  if (semaphoreInstance) {
    semaphoreInstance.reset();
  }
  semaphoreInstance = null;
}
```

### Task 4: Implement withConcurrencyControl Wrapper

```typescript
/**
 * Execute a function with concurrency control
 *
 * Acquires a permit, executes the function, and releases the permit.
 * Ensures permit is always released even if function throws.
 *
 * @param fn - The async function to execute with concurrency control
 * @returns The result of the function
 * @throws Rethrows any error from the wrapped function after releasing permit
 *
 * @example
 * const result = await withConcurrencyControl(async () => {
 *   return await translateText(text, options);
 * });
 */
export async function withConcurrencyControl<T>(fn: () => Promise<T>): Promise<T> {
  const semaphore = getTranslationSemaphore();

  await semaphore.acquire();

  try {
    return await fn();
  } finally {
    semaphore.release();
  }
}
```

### Task 5: Implement getConcurrencyStats Helper

```typescript
/**
 * Get current concurrency statistics
 *
 * @returns Statistics about the current concurrency state
 *
 * @example
 * const stats = getConcurrencyStats();
 * console.log(`Active: ${stats.active}, Waiting: ${stats.waiting}`);
 */
export function getConcurrencyStats(): ConcurrencyStats {
  const semaphore = getTranslationSemaphore();
  return semaphore.getStats();
}
```

### Task 6: Implement Acquire with Timeout (Optional Enhancement)

```typescript
/**
 * Acquire a permit with timeout
 *
 * Attempts to acquire a permit within the specified timeout period.
 * Returns false if timeout expires before permit is available.
 *
 * @param timeoutMs - Maximum time to wait for a permit (in milliseconds)
 * @returns Promise resolving to true if acquired, false if timed out
 *
 * @example
 * const acquired = await tryAcquireWithTimeout(5000);
 * if (!acquired) {
 *   console.log('Timed out waiting for concurrency slot');
 * }
 */
export async function tryAcquireWithTimeout(timeoutMs: number): Promise<boolean> {
  const semaphore = getTranslationSemaphore();

  // Create timeout promise
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), timeoutMs);
  });

  // Create acquire promise
  const acquirePromise = semaphore.acquire().then(() => true);

  // Race between acquire and timeout
  const acquired = await Promise.race([acquirePromise, timeoutPromise]);

  // If timed out but acquire was successful, release the permit
  // Note: This is a race condition edge case - in production, consider
  // using a more sophisticated timeout mechanism

  return acquired;
}
```

### Task 7: Export from Module Index

**File:** `/src/lib/job-queue/index.ts` (modify)

```typescript
// Add exports for concurrency module
export {
  TranslationSemaphore,
  getTranslationSemaphore,
  withConcurrencyControl,
  getConcurrencyStats,
  getMaxConcurrency,
  resetSemaphore,
  type ConcurrencyConfig,
  type ConcurrencyStats
} from './concurrency';
```

### Task 8: Update Environment Configuration Documentation

Add to `.env.example`:

```bash
# ==============================================
# Translation Service Configuration
# ==============================================

# Maximum number of concurrent translation API calls
# Default: 10
# Prevents overwhelming translation providers with too many simultaneous requests
TRANSLATION_MAX_CONCURRENCY=10
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/job-queue/concurrency.ts` | Concurrency control module with semaphore implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/job-queue/index.ts` | Export concurrency module functions and types |
| `/src/lib/job-queue/translation-jobs.ts` | Integrate `withConcurrencyControl` around translation API calls |
| `/.env.example` | Add `TRANSLATION_MAX_CONCURRENCY` documentation |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `TranslationSemaphore` class | `concurrency.ts` | Semaphore implementation for permit-based throttling |
| `getTranslationSemaphore` | `concurrency.ts` | Singleton instance getter |
| `withConcurrencyControl` | `concurrency.ts` | Wrapper function for concurrency-controlled execution |
| `getConcurrencyStats` | `concurrency.ts` | Get current concurrency statistics |
| `getMaxConcurrency` | `concurrency.ts` | Read max concurrency from environment |
| `resetSemaphore` | `concurrency.ts` | Reset for testing purposes |

### Functions to Modify

| Function | Location | Modification |
|----------|----------|--------------|
| `processItemTranslation` | `translation-jobs.ts` | Wrap translation API calls with `withConcurrencyControl` |
| `processArticleTranslation` | `translation-jobs.ts` | Wrap translation API calls with `withConcurrencyControl` |
| `processLinkTranslation` | `translation-jobs.ts` | Wrap translation API calls with `withConcurrencyControl` |
| `processTagTranslation` | `translation-jobs.ts` | Wrap translation API calls with `withConcurrencyControl` |

---

## Critical Implementation Notes

### Permit Release Guarantee

Always use `try/finally` to ensure permits are released even on errors:

```typescript
// CORRECT: Using withConcurrencyControl wrapper
const result = await withConcurrencyControl(async () => {
  return await translateText(options);
});

// CORRECT: Manual acquire/release with try/finally
const semaphore = getTranslationSemaphore();
await semaphore.acquire();
try {
  const result = await translateText(options);
  return result;
} finally {
  semaphore.release();  // Always called, even on error
}

// INCORRECT: Missing finally block - permit leak risk
const semaphore = getTranslationSemaphore();
await semaphore.acquire();
const result = await translateText(options);  // If this throws, permit leaks!
semaphore.release();
```

### Non-Blocking Job Picker

The concurrency control must NOT block the job picker query:

```typescript
// CORRECT: Concurrency only affects translation API calls
async function processTranslationJob(job: TranslationJob): Promise<void> {
  // Fetch content (NOT concurrency controlled - fast DB operation)
  const item = await fetchItem(job.entity_id);

  // Translation API call (IS concurrency controlled - external API)
  const result = await withConcurrencyControl(async () => {
    return await translateText(item.name, options);
  });

  // Store result (NOT concurrency controlled - fast DB operation)
  await storeTranslation(job.entity_id, result);
}

// Job picker runs independently - never blocked by semaphore
async function pickNextJob(): Promise<TranslationJob | null> {
  // This query runs regardless of concurrency state
  return await supabase
    .from('translation_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1);
}
```

### Environment Variable Parsing Safety

Handle invalid environment values gracefully:

```typescript
export function getMaxConcurrency(): number {
  const envValue = process.env.TRANSLATION_MAX_CONCURRENCY;

  if (envValue) {
    const parsed = parseInt(envValue, 10);

    // Validate: must be positive integer
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }

    // Invalid value - log warning and use default
    console.warn(
      `[Concurrency] Invalid TRANSLATION_MAX_CONCURRENCY: "${envValue}", ` +
      `using default: ${DEFAULT_MAX_CONCURRENCY}`
    );
  }

  return DEFAULT_MAX_CONCURRENCY;
}
```

### Concurrency Per Field vs Per Job

Consider whether to count each translated field or each job against the limit:

```typescript
// Option A: Concurrency per translation API call (RECOMMENDED)
// More accurate rate limiting, respects provider per-call limits
async function processItemTranslation(job: TranslationJob): Promise<void> {
  const item = await fetchItem(job.entity_id);

  // Each call counts toward limit
  const translatedName = await withConcurrencyControl(() =>
    translateText(item.name, options)
  );

  // Each call counts toward limit
  const translatedDescription = await withConcurrencyControl(() =>
    translateText(item.description, options)
  );
}

// Option B: Concurrency per job (alternative)
// Simpler but less precise rate limiting
async function processItemTranslation(job: TranslationJob): Promise<void> {
  await withConcurrencyControl(async () => {
    const item = await fetchItem(job.entity_id);

    // Both calls happen within one permit
    const translatedName = await translateText(item.name, options);
    const translatedDescription = await translateText(item.description, options);
  });
}
```

**Recommendation:** Use Option A (per API call) for more accurate rate limiting.

---

## Error Handling

### Translation Service Errors

Errors from the translation service should be caught and handled, with permit properly released:

```typescript
async function processTranslationWithRetry(text: string, options: TranslateOptions): Promise<string> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withConcurrencyControl(async () => {
        return await translateText(text, options);
      });
    } catch (error) {
      // Permit is automatically released by withConcurrencyControl

      if (attempt === maxRetries) {
        throw error;  // Re-throw on final attempt
      }

      // Exponential backoff before retry
      const delay = Math.pow(2, attempt) * 1000;  // 2s, 4s, 8s
      await sleep(delay);
    }
  }
}
```

### Deadlock Prevention

The semaphore implementation is deadlock-free by design:
- FIFO queue ordering ensures fairness
- No nested acquire calls (single permit per operation)
- Automatic release via `finally` blocks

### Resource Cleanup

On process shutdown, any pending jobs should be allowed to complete:

```typescript
// In job processor main loop
process.on('SIGTERM', async () => {
  console.log('[JobProcessor] Shutdown signal received, completing active jobs...');

  // Stop accepting new jobs
  stopJobPicker();

  // Wait for active concurrency slots to be released
  const stats = getConcurrencyStats();
  while (stats.active > 0) {
    await sleep(100);
    const newStats = getConcurrencyStats();
    if (newStats.active === stats.active) {
      break;  // No progress, force exit
    }
  }

  console.log('[JobProcessor] Graceful shutdown complete');
  process.exit(0);
});
```

---

## Acceptance Criteria

From REQ-277 in gen_requests_epic3.md:

- [ ] A concurrency control module is implemented at `/src/lib/job-queue/concurrency.ts`
- [ ] The module exports a mechanism to enforce a maximum of 10 concurrent translation API calls
- [ ] The concurrency control uses either semaphore-based throttling or queue-based throttling to manage access
- [ ] Translation job processors acquire concurrency permission before making API calls to the translation service
- [ ] When the concurrency limit is reached, additional jobs wait until an active API call completes
- [ ] When an API call completes, the concurrency control releases one waiting job to proceed
- [ ] The concurrency limit value is configurable through environment variables or configuration constants
- [ ] The implementation respects translation provider rate limits by preventing excessive concurrent requests
- [ ] The concurrency control handles edge cases such as job failures releasing concurrency slots correctly
- [ ] The module is properly exported and importable by translation job processor modules
- [ ] The concurrency control integrates with the translation job processing infrastructure from Epic 1
- [ ] The implementation does not block the job picker or job queue management operations

---

## User Impact

- **Property Owners**: Translation jobs are processed reliably without service interruptions caused by rate limiting
- **Guests**: Consistent translation processing times ensure translated content is available when expected
- **System Operations**: Steady progress through translation backlogs without triggering provider-imposed restrictions

---

## Business Value

Protects the translation service integration from rate limiting penalties and service degradation:

1. **Reliability**: Prevents rate limit errors (HTTP 429) from disrupting translation pipeline
2. **Predictability**: Consistent throughput enables accurate translation time estimates
3. **Cost Protection**: Avoids potential service suspension or additional costs for exceeding quotas
4. **Scalability**: Configurable limits allow tuning based on provider capacity

---

## Testing Strategy

### Unit Tests

```typescript
describe('TranslationSemaphore', () => {
  beforeEach(() => {
    resetSemaphore();
  });

  describe('constructor', () => {
    it('should create semaphore with specified limit', () => {
      const semaphore = new TranslationSemaphore(5);
      expect(semaphore.getLimit()).toBe(5);
    });

    it('should throw error for invalid limit', () => {
      expect(() => new TranslationSemaphore(0)).toThrow();
      expect(() => new TranslationSemaphore(-1)).toThrow();
    });
  });

  describe('acquire and release', () => {
    it('should allow acquiring up to max permits', async () => {
      const semaphore = new TranslationSemaphore(3);

      await semaphore.acquire();
      await semaphore.acquire();
      await semaphore.acquire();

      expect(semaphore.getStats().available).toBe(0);
      expect(semaphore.getStats().active).toBe(3);
    });

    it('should queue callers when at capacity', async () => {
      const semaphore = new TranslationSemaphore(1);

      await semaphore.acquire();

      // Start waiting acquire (will not resolve immediately)
      let secondAcquired = false;
      const acquirePromise = semaphore.acquire().then(() => {
        secondAcquired = true;
      });

      // Second acquire should be waiting
      expect(semaphore.getStats().waiting).toBe(1);
      expect(secondAcquired).toBe(false);

      // Release first permit
      semaphore.release();

      await acquirePromise;
      expect(secondAcquired).toBe(true);
    });

    it('should process waiting callers in FIFO order', async () => {
      const semaphore = new TranslationSemaphore(1);
      await semaphore.acquire();

      const order: number[] = [];

      const promise1 = semaphore.acquire().then(() => order.push(1));
      const promise2 = semaphore.acquire().then(() => order.push(2));
      const promise3 = semaphore.acquire().then(() => order.push(3));

      expect(semaphore.getStats().waiting).toBe(3);

      // Release permits one at a time
      semaphore.release(); await promise1;
      semaphore.release(); await promise2;
      semaphore.release(); await promise3;

      expect(order).toEqual([1, 2, 3]);  // FIFO order
    });

    it('should handle release when no one is waiting', () => {
      const semaphore = new TranslationSemaphore(2);

      semaphore.acquire();
      expect(semaphore.getStats().available).toBe(1);

      semaphore.release();
      expect(semaphore.getStats().available).toBe(2);

      // Extra release should not exceed max
      semaphore.release();
      expect(semaphore.getStats().available).toBe(2);  // Still 2, not 3
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', async () => {
      const semaphore = new TranslationSemaphore(5);

      await semaphore.acquire();
      await semaphore.acquire();

      const stats = semaphore.getStats();
      expect(stats.limit).toBe(5);
      expect(stats.active).toBe(2);
      expect(stats.available).toBe(3);
      expect(stats.waiting).toBe(0);
    });
  });
});

describe('withConcurrencyControl', () => {
  beforeEach(() => {
    resetSemaphore();
  });

  it('should execute function and return result', async () => {
    const result = await withConcurrencyControl(async () => {
      return 'test-result';
    });

    expect(result).toBe('test-result');
  });

  it('should release permit on success', async () => {
    const statsBefore = getConcurrencyStats();

    await withConcurrencyControl(async () => {
      // Permit is held during execution
      expect(getConcurrencyStats().active).toBe(statsBefore.active + 1);
    });

    // Permit released after execution
    expect(getConcurrencyStats().active).toBe(statsBefore.active);
  });

  it('should release permit on error', async () => {
    const statsBefore = getConcurrencyStats();

    try {
      await withConcurrencyControl(async () => {
        throw new Error('test-error');
      });
    } catch (e) {
      // Expected
    }

    // Permit released even after error
    expect(getConcurrencyStats().active).toBe(statsBefore.active);
  });

  it('should rethrow error from wrapped function', async () => {
    await expect(
      withConcurrencyControl(async () => {
        throw new Error('test-error');
      })
    ).rejects.toThrow('test-error');
  });

  it('should enforce concurrency limit', async () => {
    // Set limit to 2 for testing
    process.env.TRANSLATION_MAX_CONCURRENCY = '2';
    resetSemaphore();

    let concurrentCount = 0;
    let maxConcurrent = 0;

    const tasks = Array(5).fill(null).map(async () => {
      return withConcurrencyControl(async () => {
        concurrentCount++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);

        await sleep(50);  // Simulate API call

        concurrentCount--;
      });
    });

    await Promise.all(tasks);

    expect(maxConcurrent).toBe(2);  // Never exceeded limit

    delete process.env.TRANSLATION_MAX_CONCURRENCY;
  });
});

describe('getMaxConcurrency', () => {
  const originalEnv = process.env.TRANSLATION_MAX_CONCURRENCY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.TRANSLATION_MAX_CONCURRENCY = originalEnv;
    } else {
      delete process.env.TRANSLATION_MAX_CONCURRENCY;
    }
    resetSemaphore();
  });

  it('should return default when env var not set', () => {
    delete process.env.TRANSLATION_MAX_CONCURRENCY;
    expect(getMaxConcurrency()).toBe(10);
  });

  it('should return env var value when valid', () => {
    process.env.TRANSLATION_MAX_CONCURRENCY = '15';
    expect(getMaxConcurrency()).toBe(15);
  });

  it('should return default for invalid env var', () => {
    process.env.TRANSLATION_MAX_CONCURRENCY = 'invalid';
    expect(getMaxConcurrency()).toBe(10);
  });

  it('should return default for zero or negative values', () => {
    process.env.TRANSLATION_MAX_CONCURRENCY = '0';
    expect(getMaxConcurrency()).toBe(10);

    process.env.TRANSLATION_MAX_CONCURRENCY = '-5';
    expect(getMaxConcurrency()).toBe(10);
  });
});
```

### Integration Tests

```typescript
describe('Concurrency Control Integration', () => {
  beforeEach(() => {
    resetSemaphore();
  });

  it('should limit concurrent translation API calls', async () => {
    const apiCallTimes: number[] = [];
    const apiCallDurations: { start: number; end: number }[] = [];

    // Mock translation service
    const mockTranslate = jest.fn(async () => {
      const start = Date.now();
      apiCallTimes.push(start);

      await sleep(100);  // Simulate API latency

      apiCallDurations.push({ start, end: Date.now() });
      return 'translated';
    });

    // Process 5 jobs with limit of 2
    process.env.TRANSLATION_MAX_CONCURRENCY = '2';
    resetSemaphore();

    const jobs = Array(5).fill(null).map(() =>
      withConcurrencyControl(() => mockTranslate())
    );

    await Promise.all(jobs);

    // Verify max concurrent was respected
    let maxConcurrent = 0;
    for (const duration of apiCallDurations) {
      const concurrent = apiCallDurations.filter(
        d => d.start <= duration.start && d.end > duration.start
      ).length;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
    }

    expect(maxConcurrent).toBeLessThanOrEqual(2);
    expect(mockTranslate).toHaveBeenCalledTimes(5);

    delete process.env.TRANSLATION_MAX_CONCURRENCY;
  });

  it('should not block job picker during high load', async () => {
    // Start 10 slow translation jobs
    const translationPromises = Array(10).fill(null).map(() =>
      withConcurrencyControl(async () => {
        await sleep(500);  // Slow API call
      })
    );

    // Job picker should still work while translations are in progress
    const pickStart = Date.now();
    const stats = getConcurrencyStats();
    const pickEnd = Date.now();

    // Pick operation should be fast (< 50ms)
    expect(pickEnd - pickStart).toBeLessThan(50);
    expect(stats.active).toBeGreaterThan(0);

    await Promise.all(translationPromises);
  });

  it('should handle errors without leaking permits', async () => {
    const semaphore = getTranslationSemaphore();
    const initialStats = semaphore.getStats();

    // Run jobs that fail
    const failingJobs = Array(5).fill(null).map(async () => {
      try {
        await withConcurrencyControl(async () => {
          throw new Error('API error');
        });
      } catch {
        // Expected
      }
    });

    await Promise.all(failingJobs);

    // All permits should be released
    const finalStats = semaphore.getStats();
    expect(finalStats.available).toBe(initialStats.available);
    expect(finalStats.active).toBe(0);
    expect(finalStats.waiting).toBe(0);
  });
});
```

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: Create module file structure | 10 min | Low |
| Task 2: Implement TranslationSemaphore class | 30 min | Medium |
| Task 3: Implement singleton management | 15 min | Low |
| Task 4: Implement withConcurrencyControl wrapper | 10 min | Low |
| Task 5: Implement getConcurrencyStats helper | 5 min | Low |
| Task 6: Implement acquire with timeout (optional) | 15 min | Medium |
| Task 7: Export from module index | 5 min | Low |
| Task 8: Update environment documentation | 5 min | Low |
| Integration with job processors | 20 min | Medium |
| Testing | 45 min | Medium |
| **Total** | **~2.5 hours** | **Medium** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Permit leaks from unhandled errors | Low | High | Always use `withConcurrencyControl` or `try/finally` |
| Deadlock from nested acquires | Low | Critical | Design ensures single acquire per operation |
| Starvation of waiting jobs | Low | Medium | FIFO queue ensures fairness |
| Incorrect concurrency limit | Low | Medium | Validate env var, log warnings for invalid values |
| Blocking job picker | Low | High | Concurrency only applied to translation API calls |
| Memory leak from abandoned waits | Low | Low | Reset function for testing; process shutdown cleanup |

---

## Future Enhancements

### Adaptive Concurrency (Not in Scope)

Future enhancement to adjust concurrency based on API response times:

```typescript
// If API latency increases, reduce concurrency
// If API latency decreases, increase concurrency
async function adaptiveConcurrency(): Promise<void> {
  const recentLatencies = getRecentLatencies();
  const avgLatency = average(recentLatencies);

  if (avgLatency > 2000) {
    decreaseMaxConcurrency();
  } else if (avgLatency < 500) {
    increaseMaxConcurrency();
  }
}
```

### Per-Provider Concurrency

Different limits for different translation providers:

```typescript
const PROVIDER_LIMITS = {
  'claude': 10,
  'openai': 20,
  'google': 100
};

function getProviderSemaphore(provider: string): TranslationSemaphore {
  return providerSemaphores[provider];
}
```

### Concurrency Monitoring Dashboard

Integration with monitoring to track:
- Active concurrent translations over time
- Wait queue depth
- Time spent waiting for permits

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-277)
- Job Prioritization: `/docs/REQ-276-implement-job-prioritization-overview.md`
- QR Batch Processing Pattern: `/src/hooks/useQRCodeGeneration.ts`
- Email Rate Limiting Pattern: `/src/lib/email-service.ts`
- API Retry Pattern: `/src/lib/api.ts`
- Configuration Pattern: `/src/lib/config.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 3, Task 3.7 - Implement Concurrency Control*
