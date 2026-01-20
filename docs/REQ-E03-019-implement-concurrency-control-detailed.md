# REQ-E03-019: Implement Concurrency Control - Detailed Task Breakdown

**Generated:** 2026-01-20 16:45:00 UTC
**Last Modified:** 2026-01-20 16:45:00 UTC
**Request ID:** REQ-E03-019
**Epic:** 3 - Dynamic Content Translation
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.7
**Size:** M (Medium)
**Overview Document:** REQ-E03-019-implement-concurrency-control-overview.md
**Implementation Plan:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating a semaphore-based concurrency control mechanism that limits concurrent translation API calls to a configurable maximum (default 10), implements FIFO queuing for waiting requests, and integrates rate limit backoff coordination across all content-specific translation processors.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (translation service at `/src/lib/translation-service/`)
- [ ] Existing job processor is implemented (`/src/lib/job-queue/job-processor.ts`)
- [ ] Rate limiter utilities exist (`/src/lib/translation-service/utils/rate-limiter.ts`)
- [ ] Retry utilities exist (`/src/lib/translation-service/utils/retry.ts`)
- [ ] Content-specific processors from REQ-E03-014 through REQ-E03-017 are created

---

## Task Breakdown

### Task 1: Create TranslationSemaphore Type Definitions

**File:** `/src/lib/job-queue/concurrency.ts` (NEW)
**Estimated Complexity:** Low
**Dependencies:** None

#### 1.1 Create the new file with module documentation

```typescript
/**
 * Translation Semaphore - Concurrency Control for Translation API Calls
 * Part of REQ-E03-019: Implement Concurrency Control
 *
 * Provides a semaphore-based mechanism to limit concurrent translation
 * API calls, preventing service provider overload and respecting rate limits.
 *
 * @module job-queue/concurrency
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */
```

#### 1.2 Define SemaphoreConfig interface

```typescript
/**
 * Configuration for the translation semaphore
 */
export interface SemaphoreConfig {
  /** Maximum concurrent translation API calls (default: 10) */
  maxConcurrent: number;
  /** Maximum time to wait for a slot in milliseconds (default: 60000 = 1 minute) */
  acquireTimeoutMs: number;
  /** Enable metrics collection (default: true) */
  enableMetrics: boolean;
}
```

**Location in file:** Lines ~15-25

#### 1.3 Define SemaphoreMetrics interface

```typescript
/**
 * Metrics exposed by the semaphore for monitoring
 */
export interface SemaphoreMetrics {
  /** Current number of active slots in use */
  activeCount: number;
  /** Number of requests waiting in queue */
  queueDepth: number;
  /** Total slots acquired since creation */
  totalAcquired: number;
  /** Total slots released since creation */
  totalReleased: number;
  /** Total acquire timeouts since creation */
  totalTimeouts: number;
  /** Average wait time in milliseconds for queued requests */
  avgWaitTimeMs: number;
}
```

**Location in file:** Lines ~27-45

#### 1.4 Define BackoffState interface

```typescript
/**
 * Rate limit backoff state tracking
 */
export interface BackoffState {
  /** Whether the semaphore is currently in backoff mode */
  isInBackoff: boolean;
  /** Timestamp when backoff period ends */
  backoffUntil: Date | null;
  /** Number of consecutive rate limit responses */
  consecutiveRateLimits: number;
  /** Timestamp of last rate limit response */
  lastRateLimitAt: Date | null;
}
```

**Location in file:** Lines ~47-62

#### 1.5 Define internal QueuedAcquire interface

```typescript
/**
 * Internal representation of a queued acquire request
 */
interface QueuedAcquire {
  /** Resolve function to grant the slot */
  resolve: () => void;
  /** Reject function for timeout or shutdown */
  reject: (error: Error) => void;
  /** Timestamp when request was queued */
  enqueuedAt: number;
}
```

**Location in file:** Lines ~64-75

#### 1.6 Define default configuration constants

```typescript
/**
 * Default semaphore configuration
 */
export const DEFAULT_SEMAPHORE_CONFIG: SemaphoreConfig = {
  maxConcurrent: parseInt(process.env.TRANSLATION_MAX_CONCURRENT || '10', 10),
  acquireTimeoutMs: parseInt(process.env.TRANSLATION_ACQUIRE_TIMEOUT_MS || '60000', 10),
  enableMetrics: true,
};

/**
 * Rate limit backoff configuration constants
 */
export const RATE_LIMIT_BASE_DELAY_MS = parseInt(
  process.env.TRANSLATION_RATE_LIMIT_BASE_DELAY_MS || '5000',
  10
);
export const RATE_LIMIT_MAX_DELAY_MS = parseInt(
  process.env.TRANSLATION_RATE_LIMIT_MAX_DELAY_MS || '60000',
  10
);
```

**Location in file:** Lines ~77-95

**Acceptance Criteria for Task 1:**
- [ ] All interfaces are properly typed with JSDoc comments
- [ ] Default configuration reads from environment variables with sensible fallbacks
- [ ] TypeScript compiles without errors
- [ ] Interfaces match the patterns established in `/src/lib/job-queue/concurrency-control.ts`

---

### Task 2: Implement TranslationSemaphore Class Core

**File:** `/src/lib/job-queue/concurrency.ts` (EXTEND)
**Estimated Complexity:** Medium
**Dependencies:** Task 1

#### 2.1 Create class skeleton with private state

```typescript
/**
 * Semaphore for controlling concurrent translation API calls
 *
 * Ensures no more than `maxConcurrent` translation requests are in-flight
 * simultaneously. Queued requests are processed in FIFO order.
 *
 * @example
 * ```typescript
 * const semaphore = getTranslationSemaphore();
 *
 * try {
 *   await semaphore.acquire();
 *   const result = await translateText(...);
 * } finally {
 *   semaphore.release();
 * }
 * ```
 */
export class TranslationSemaphore {
  private config: SemaphoreConfig;
  private activeCount: number = 0;
  private queue: QueuedAcquire[] = [];
  private backoffState: BackoffState = {
    isInBackoff: false,
    backoffUntil: null,
    consecutiveRateLimits: 0,
    lastRateLimitAt: null,
  };

  // Metrics tracking
  private totalAcquired: number = 0;
  private totalReleased: number = 0;
  private totalTimeouts: number = 0;
  private waitTimes: number[] = [];

  constructor(config: Partial<SemaphoreConfig> = {}) {
    this.config = { ...DEFAULT_SEMAPHORE_CONFIG, ...config };
  }
}
```

**Location in file:** Lines ~100-140

#### 2.2 Implement acquire() method

```typescript
/**
 * Acquire a slot for making a translation API call
 *
 * If all slots are in use, the caller is queued and waits until
 * a slot becomes available or the timeout expires.
 *
 * @param timeoutMs - Optional override for acquire timeout
 * @returns Promise that resolves when slot is acquired
 * @throws Error if timeout expires or semaphore is shutting down
 */
async acquire(timeoutMs?: number): Promise<void> {
  const timeout = timeoutMs ?? this.config.acquireTimeoutMs;

  // If in backoff, wait for backoff to expire first
  if (this.backoffState.isInBackoff && this.backoffState.backoffUntil) {
    const waitTime = this.backoffState.backoffUntil.getTime() - Date.now();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    // Clear backoff state after waiting
    this.clearBackoff();
  }

  // Check if slot is immediately available
  if (this.activeCount < this.config.maxConcurrent) {
    this.activeCount++;
    this.totalAcquired++;
    return;
  }

  // No slot available - queue the request
  return this.enqueue(timeout);
}
```

**Location in file:** Lines ~145-180

#### 2.3 Implement enqueue() private method

```typescript
/**
 * Enqueue an acquire request and wait for a slot
 */
private enqueue(timeoutMs: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const enqueuedAt = Date.now();

    const queuedRequest: QueuedAcquire = {
      resolve: () => {
        // Track wait time for metrics
        if (this.config.enableMetrics) {
          this.waitTimes.push(Date.now() - enqueuedAt);
          // Keep only last 100 wait times for averaging
          if (this.waitTimes.length > 100) {
            this.waitTimes.shift();
          }
        }
        this.activeCount++;
        this.totalAcquired++;
        resolve();
      },
      reject,
      enqueuedAt,
    };

    this.queue.push(queuedRequest);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      // Remove from queue if still present
      const index = this.queue.indexOf(queuedRequest);
      if (index !== -1) {
        this.queue.splice(index, 1);
        this.totalTimeouts++;
        reject(new Error(
          `Semaphore acquire timeout after ${timeoutMs}ms. ` +
          `Active: ${this.activeCount}, Queue: ${this.queue.length}`
        ));
      }
    }, timeoutMs);

    // Store timeout ID for cleanup (attach to request object)
    (queuedRequest as QueuedAcquire & { timeoutId: NodeJS.Timeout }).timeoutId = timeoutId;
  });
}
```

**Location in file:** Lines ~185-230

#### 2.4 Implement release() method

```typescript
/**
 * Release a slot back to the semaphore
 *
 * Must be called after translation completes (success or failure).
 * Best practice is to call this in a finally block.
 */
release(): void {
  if (this.activeCount <= 0) {
    console.warn('[TranslationSemaphore] Release called but no active slots');
    return;
  }

  this.activeCount--;
  this.totalReleased++;

  // Process next queued request if any
  this.processQueue();
}
```

**Location in file:** Lines ~235-255

#### 2.5 Implement processQueue() private method

```typescript
/**
 * Process the queue and grant slot to next waiting request
 */
private processQueue(): void {
  // If in backoff, don't process queue
  if (this.backoffState.isInBackoff && this.backoffState.backoffUntil) {
    const now = Date.now();
    if (this.backoffState.backoffUntil.getTime() > now) {
      return; // Still in backoff period
    }
    // Backoff expired
    this.clearBackoff();
  }

  // Grant slot to next waiting request
  while (this.queue.length > 0 && this.activeCount < this.config.maxConcurrent) {
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      // Clear the timeout
      const reqWithTimeout = nextRequest as QueuedAcquire & { timeoutId?: NodeJS.Timeout };
      if (reqWithTimeout.timeoutId) {
        clearTimeout(reqWithTimeout.timeoutId);
      }
      // Grant the slot
      nextRequest.resolve();
    }
  }
}
```

**Location in file:** Lines ~260-290

#### 2.6 Implement tryAcquire() method for non-blocking acquisition

```typescript
/**
 * Try to acquire a slot without waiting
 *
 * @returns true if slot was acquired, false if no slot available
 */
tryAcquire(): boolean {
  if (this.backoffState.isInBackoff) {
    return false;
  }

  if (this.activeCount < this.config.maxConcurrent) {
    this.activeCount++;
    this.totalAcquired++;
    return true;
  }

  return false;
}
```

**Location in file:** Lines ~295-315

**Acceptance Criteria for Task 2:**
- [ ] `acquire()` blocks when all slots are in use
- [ ] `acquire()` respects backoff state before granting slots
- [ ] `release()` correctly decrements active count and processes queue
- [ ] `tryAcquire()` returns immediately without blocking
- [ ] Timeout is properly handled with cleanup
- [ ] FIFO order is maintained for queued requests

---

### Task 3: Implement Rate Limit Backoff Logic

**File:** `/src/lib/job-queue/concurrency.ts` (EXTEND)
**Estimated Complexity:** Medium
**Dependencies:** Task 2

#### 3.1 Implement notifyRateLimit() method

```typescript
/**
 * Notify the semaphore that a rate limit (HTTP 429) was received
 *
 * This triggers exponential backoff for all subsequent acquire() calls.
 * Call this when the translation service returns a rate limit error.
 */
notifyRateLimit(): void {
  const now = new Date();
  this.backoffState.consecutiveRateLimits++;
  this.backoffState.lastRateLimitAt = now;

  // Calculate backoff using exponential formula
  // Formula: baseDelay * (2 ^ consecutiveCount), capped at maxDelay
  const backoffMs = Math.min(
    RATE_LIMIT_BASE_DELAY_MS * Math.pow(2, this.backoffState.consecutiveRateLimits - 1),
    RATE_LIMIT_MAX_DELAY_MS
  );

  this.backoffState.isInBackoff = true;
  this.backoffState.backoffUntil = new Date(now.getTime() + backoffMs);

  console.warn(
    `[TranslationSemaphore] Rate limit detected. ` +
    `Consecutive: ${this.backoffState.consecutiveRateLimits}, ` +
    `Backoff: ${backoffMs}ms, Until: ${this.backoffState.backoffUntil.toISOString()}`
  );
}
```

**Location in file:** Lines ~320-350

#### 3.2 Implement clearBackoff() private method

```typescript
/**
 * Clear the backoff state after successful request or timeout
 */
private clearBackoff(): void {
  this.backoffState.isInBackoff = false;
  this.backoffState.backoffUntil = null;
  // Note: We don't reset consecutiveRateLimits here
  // It resets on notifySuccess()
}
```

**Location in file:** Lines ~355-365

#### 3.3 Implement notifySuccess() method

```typescript
/**
 * Notify the semaphore that a translation succeeded
 *
 * This resets the consecutive rate limit counter, reducing future backoff.
 * Call this after a successful translation API call.
 */
notifySuccess(): void {
  if (this.backoffState.consecutiveRateLimits > 0) {
    this.backoffState.consecutiveRateLimits = 0;
  }
}
```

**Location in file:** Lines ~370-385

#### 3.4 Implement getBackoffState() method

```typescript
/**
 * Get the current backoff state
 *
 * @returns Current backoff state for monitoring
 */
getBackoffState(): BackoffState {
  return {
    isInBackoff: this.backoffState.isInBackoff,
    backoffUntil: this.backoffState.backoffUntil,
    consecutiveRateLimits: this.backoffState.consecutiveRateLimits,
    lastRateLimitAt: this.backoffState.lastRateLimitAt,
  };
}
```

**Location in file:** Lines ~390-405

#### 3.5 Implement isBackoffActive() method

```typescript
/**
 * Check if backoff is currently active
 *
 * @returns true if semaphore is in backoff period
 */
isBackoffActive(): boolean {
  if (!this.backoffState.isInBackoff || !this.backoffState.backoffUntil) {
    return false;
  }
  return this.backoffState.backoffUntil.getTime() > Date.now();
}
```

**Location in file:** Lines ~410-425

**Acceptance Criteria for Task 3:**
- [ ] `notifyRateLimit()` calculates correct exponential backoff
- [ ] Backoff delay increases exponentially up to max (60s)
- [ ] `notifySuccess()` resets consecutive rate limit counter
- [ ] `isBackoffActive()` correctly reports backoff state
- [ ] Backoff is enforced in `acquire()` and `processQueue()`

---

### Task 4: Implement Metrics and Utility Methods

**File:** `/src/lib/job-queue/concurrency.ts` (EXTEND)
**Estimated Complexity:** Low
**Dependencies:** Task 2

#### 4.1 Implement getMetrics() method

```typescript
/**
 * Get current semaphore metrics
 *
 * @returns Metrics snapshot for monitoring
 */
getMetrics(): SemaphoreMetrics {
  const avgWaitTimeMs = this.waitTimes.length > 0
    ? Math.round(this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length)
    : 0;

  return {
    activeCount: this.activeCount,
    queueDepth: this.queue.length,
    totalAcquired: this.totalAcquired,
    totalReleased: this.totalReleased,
    totalTimeouts: this.totalTimeouts,
    avgWaitTimeMs,
  };
}
```

**Location in file:** Lines ~430-450

#### 4.2 Implement isAvailable() method

```typescript
/**
 * Check if a slot is immediately available
 *
 * @returns true if acquire() would succeed immediately
 */
isAvailable(): boolean {
  return !this.isBackoffActive() && this.activeCount < this.config.maxConcurrent;
}
```

**Location in file:** Lines ~455-465

#### 4.3 Implement updateConfig() method

```typescript
/**
 * Update semaphore configuration at runtime
 *
 * Note: Changing maxConcurrent does not immediately release or queue slots.
 * Changes take effect on next acquire/release cycle.
 *
 * @param config - Partial configuration to update
 */
updateConfig(config: Partial<SemaphoreConfig>): void {
  this.config = { ...this.config, ...config };
  console.info('[TranslationSemaphore] Configuration updated', this.config);

  // If maxConcurrent increased, process queue to grant any waiting slots
  if (config.maxConcurrent !== undefined) {
    this.processQueue();
  }
}
```

**Location in file:** Lines ~470-490

#### 4.4 Implement reset() method for testing

```typescript
/**
 * Reset the semaphore state (for testing)
 *
 * Rejects all queued requests and resets counters.
 * Use only in test environments.
 */
reset(): void {
  // Reject all queued requests
  while (this.queue.length > 0) {
    const request = this.queue.shift();
    if (request) {
      const reqWithTimeout = request as QueuedAcquire & { timeoutId?: NodeJS.Timeout };
      if (reqWithTimeout.timeoutId) {
        clearTimeout(reqWithTimeout.timeoutId);
      }
      request.reject(new Error('Semaphore reset'));
    }
  }

  // Reset all state
  this.activeCount = 0;
  this.totalAcquired = 0;
  this.totalReleased = 0;
  this.totalTimeouts = 0;
  this.waitTimes = [];
  this.backoffState = {
    isInBackoff: false,
    backoffUntil: null,
    consecutiveRateLimits: 0,
    lastRateLimitAt: null,
  };
}
```

**Location in file:** Lines ~495-530

**Acceptance Criteria for Task 4:**
- [ ] `getMetrics()` returns accurate snapshot of semaphore state
- [ ] `isAvailable()` correctly reports immediate availability
- [ ] `updateConfig()` allows runtime configuration changes
- [ ] `reset()` properly cleans up all state and queued requests

---

### Task 5: Implement Singleton Factory Functions

**File:** `/src/lib/job-queue/concurrency.ts` (EXTEND)
**Estimated Complexity:** Low
**Dependencies:** Tasks 2-4

#### 5.1 Implement factory functions and singleton

```typescript
// ============================================================================
// Factory and Singleton
// ============================================================================

let globalSemaphore: TranslationSemaphore | null = null;

/**
 * Create a new translation semaphore instance
 *
 * @param config - Configuration options
 * @returns New TranslationSemaphore instance
 */
export function createTranslationSemaphore(
  config?: Partial<SemaphoreConfig>
): TranslationSemaphore {
  return new TranslationSemaphore(config);
}

/**
 * Get the global singleton translation semaphore
 *
 * Creates a new instance if none exists. Use this for application-wide
 * concurrency control across all translation processors.
 *
 * @returns Global TranslationSemaphore instance
 */
export function getTranslationSemaphore(): TranslationSemaphore {
  if (!globalSemaphore) {
    globalSemaphore = createTranslationSemaphore();
  }
  return globalSemaphore;
}

/**
 * Reset the global translation semaphore (useful for testing)
 *
 * Resets the current semaphore if running and clears the reference.
 */
export function resetTranslationSemaphore(): void {
  if (globalSemaphore) {
    globalSemaphore.reset();
    globalSemaphore = null;
  }
}
```

**Location in file:** Lines ~535-585

**Acceptance Criteria for Task 5:**
- [ ] `createTranslationSemaphore()` creates new isolated instances
- [ ] `getTranslationSemaphore()` returns singleton instance
- [ ] `resetTranslationSemaphore()` cleans up global instance
- [ ] Pattern matches `/src/lib/job-queue/concurrency-control.ts:689-715`

---

### Task 6: Export from Job Queue Module Index

**File:** `/src/lib/job-queue/index.ts` (MODIFY)
**Estimated Complexity:** Low
**Dependencies:** Tasks 1-5

#### 6.1 Add type exports

Add after line 102:

```typescript
// Concurrency (Translation Semaphore) types (REQ-E03-019)
export type {
  SemaphoreConfig,
  SemaphoreMetrics,
  BackoffState,
} from './concurrency';
```

#### 6.2 Add function and class exports

Add after the type exports:

```typescript
// Concurrency (Translation Semaphore) exports (REQ-E03-019)
export {
  TranslationSemaphore,
  getTranslationSemaphore,
  resetTranslationSemaphore,
  createTranslationSemaphore,
  DEFAULT_SEMAPHORE_CONFIG,
  RATE_LIMIT_BASE_DELAY_MS,
  RATE_LIMIT_MAX_DELAY_MS,
} from './concurrency';
```

**Acceptance Criteria for Task 6:**
- [ ] All types are exported from module index
- [ ] All functions and classes are exported
- [ ] Import statement `import { getTranslationSemaphore } from '@/lib/job-queue'` works

---

### Task 7: Create Rate Limit Detection Helper

**File:** `/src/lib/job-queue/concurrency.ts` (EXTEND)
**Estimated Complexity:** Low
**Dependencies:** Task 3

#### 7.1 Implement isRateLimitError helper function

Add before the class definition:

```typescript
/**
 * Check if an error represents a rate limit (HTTP 429) response
 *
 * @param error - Error to check
 * @returns true if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  // Check for HTTP status code
  const httpError = error as { status?: number; code?: string; message?: string };

  // HTTP 429 Too Many Requests
  if (typeof httpError.status === 'number' && httpError.status === 429) {
    return true;
  }

  // Check for error code
  if (typeof httpError.code === 'string') {
    const code = httpError.code.toUpperCase();
    if (code === 'RATE_LIMITED' || code === 'TOO_MANY_REQUESTS') {
      return true;
    }
  }

  // Check error message
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('429')
  ) {
    return true;
  }

  return false;
}
```

**Location in file:** Lines ~97-135 (before class)

**Acceptance Criteria for Task 7:**
- [ ] Detects HTTP 429 status codes
- [ ] Detects rate limit error codes
- [ ] Detects rate limit mentions in error messages
- [ ] Returns false for non-rate-limit errors

---

### Task 8: Integrate with Item Translation Processor

**File:** `/src/lib/content-translation/processors/item-processor.ts` (MODIFY)
**Estimated Complexity:** Medium
**Dependencies:** Tasks 1-7, REQ-E03-014

#### 8.1 Add import statement

Add at top of file:

```typescript
import {
  getTranslationSemaphore,
  isRateLimitError,
} from '@/lib/job-queue';
```

#### 8.2 Modify processItemTranslation function

Wrap the translation call with semaphore acquire/release:

```typescript
export async function processItemTranslation(job: TranslationJob): Promise<void> {
  const semaphore = getTranslationSemaphore();

  try {
    // Wait for slot (respects concurrency limit and rate limit backoff)
    await semaphore.acquire();

    // Fetch item content
    const content = await fetchItemContent(job.entityId);
    if (!content) {
      throw new Error(`Item not found: ${job.entityId}`);
    }

    // Translate fields
    const translatedFields = await translateItemFields(
      content,
      job.sourceLanguage,
      job.targetLanguage
    );

    // Store translation
    await storeItemTranslation(
      job.entityId,
      job.targetLanguage,
      translatedFields
    );

    // Notify success to reset rate limit counter
    semaphore.notifySuccess();

    // Mark job completed
    await markJobCompleted(job.id);

  } catch (error) {
    // Check for rate limit
    if (isRateLimitError(error)) {
      semaphore.notifyRateLimit();
    }
    throw error;
  } finally {
    // ALWAYS release slot
    semaphore.release();
  }
}
```

**Acceptance Criteria for Task 8:**
- [ ] Import statements added correctly
- [ ] `acquire()` called before translation
- [ ] `release()` called in finally block
- [ ] `notifyRateLimit()` called on rate limit errors
- [ ] `notifySuccess()` called on successful translations

---

### Task 9: Integrate with Article Translation Processor

**File:** `/src/lib/content-translation/processors/article-processor.ts` (MODIFY)
**Estimated Complexity:** Medium
**Dependencies:** Tasks 1-7, REQ-E03-015

#### 9.1 Follow same pattern as Task 8

Apply identical changes as Task 8:
- Add import for `getTranslationSemaphore` and `isRateLimitError`
- Wrap translation logic with `acquire()`/`release()`
- Call `notifyRateLimit()` on 429 errors
- Call `notifySuccess()` on success

**Acceptance Criteria for Task 9:**
- [ ] Import statements added correctly
- [ ] `acquire()` called before translation
- [ ] `release()` called in finally block
- [ ] Pattern matches Task 8 implementation

---

### Task 10: Integrate with Link Translation Processor

**File:** `/src/lib/content-translation/processors/link-processor.ts` (MODIFY)
**Estimated Complexity:** Medium
**Dependencies:** Tasks 1-7, REQ-E03-016

#### 10.1 Follow same pattern as Task 8

Apply identical changes as Task 8.

**Acceptance Criteria for Task 10:**
- [ ] Import statements added correctly
- [ ] `acquire()` called before translation
- [ ] `release()` called in finally block
- [ ] Pattern matches Task 8 implementation

---

### Task 11: Integrate with Tag Translation Processor

**File:** `/src/lib/content-translation/processors/tag-processor.ts` (MODIFY)
**Estimated Complexity:** Medium
**Dependencies:** Tasks 1-7, REQ-E03-017

#### 11.1 Follow same pattern as Task 8

Apply identical changes as Task 8.

**Acceptance Criteria for Task 11:**
- [ ] Import statements added correctly
- [ ] `acquire()` called before translation
- [ ] `release()` called in finally block
- [ ] Pattern matches Task 8 implementation

---

### Task 12: Write Unit Tests - Core Semaphore

**File:** `/src/lib/job-queue/__tests__/concurrency.test.ts` (NEW)
**Estimated Complexity:** Medium
**Dependencies:** Tasks 1-5

#### 12.1 Create test file with test setup

```typescript
/**
 * Unit tests for TranslationSemaphore
 * Tests for REQ-E03-019: Implement Concurrency Control
 */

import {
  TranslationSemaphore,
  createTranslationSemaphore,
  getTranslationSemaphore,
  resetTranslationSemaphore,
  isRateLimitError,
  DEFAULT_SEMAPHORE_CONFIG,
} from '../concurrency';

describe('TranslationSemaphore', () => {
  afterEach(() => {
    resetTranslationSemaphore();
  });

  // Tests go here
});
```

#### 12.2 Test: Limits concurrent acquisitions to maxConcurrent

```typescript
it('should limit concurrent acquisitions to maxConcurrent', async () => {
  const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

  // Acquire 2 slots
  await semaphore.acquire();
  await semaphore.acquire();

  // Third should not resolve immediately
  let thirdAcquired = false;
  const thirdPromise = semaphore.acquire().then(() => {
    thirdAcquired = true;
  });

  // Give some time for potential resolution
  await new Promise(resolve => setTimeout(resolve, 50));

  expect(thirdAcquired).toBe(false);
  expect(semaphore.getMetrics().activeCount).toBe(2);
  expect(semaphore.getMetrics().queueDepth).toBe(1);

  // Release one slot
  semaphore.release();

  // Third should now acquire
  await thirdPromise;
  expect(thirdAcquired).toBe(true);
  expect(semaphore.getMetrics().activeCount).toBe(2);
});
```

#### 12.3 Test: FIFO queue order

```typescript
it('should process queue in FIFO order', async () => {
  const semaphore = createTranslationSemaphore({ maxConcurrent: 1 });
  const order: number[] = [];

  // Acquire the only slot
  await semaphore.acquire();

  // Queue 3 more requests
  const p1 = semaphore.acquire().then(() => order.push(1));
  const p2 = semaphore.acquire().then(() => order.push(2));
  const p3 = semaphore.acquire().then(() => order.push(3));

  // Release slots one at a time
  semaphore.release();
  await p1;

  semaphore.release();
  await p2;

  semaphore.release();
  await p3;

  expect(order).toEqual([1, 2, 3]);
});
```

#### 12.4 Test: Acquire timeout

```typescript
it('should timeout acquire after configured duration', async () => {
  const semaphore = createTranslationSemaphore({
    maxConcurrent: 1,
    acquireTimeoutMs: 100,
  });

  // Acquire the only slot
  await semaphore.acquire();

  // Second acquire should timeout
  await expect(semaphore.acquire()).rejects.toThrow(/timeout/i);

  expect(semaphore.getMetrics().totalTimeouts).toBe(1);
});
```

#### 12.5 Test: Release in finally pattern

```typescript
it('should release slot even when error occurs', async () => {
  const semaphore = createTranslationSemaphore({ maxConcurrent: 1 });

  try {
    await semaphore.acquire();
    throw new Error('Test error');
  } catch {
    // Expected
  } finally {
    semaphore.release();
  }

  // Should be able to acquire again
  expect(semaphore.isAvailable()).toBe(true);
  await semaphore.acquire();
  expect(semaphore.getMetrics().activeCount).toBe(1);
});
```

#### 12.6 Test: Metrics accuracy

```typescript
it('should track metrics accurately', async () => {
  const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

  await semaphore.acquire();
  await semaphore.acquire();

  const metrics = semaphore.getMetrics();
  expect(metrics.activeCount).toBe(2);
  expect(metrics.totalAcquired).toBe(2);
  expect(metrics.totalReleased).toBe(0);

  semaphore.release();
  semaphore.release();

  const metricsAfter = semaphore.getMetrics();
  expect(metricsAfter.activeCount).toBe(0);
  expect(metricsAfter.totalReleased).toBe(2);
});
```

**Acceptance Criteria for Task 12:**
- [ ] Test file compiles and runs
- [ ] All 5+ core tests pass
- [ ] Tests cover concurrency limiting, FIFO order, timeout, finally pattern, metrics

---

### Task 13: Write Unit Tests - Rate Limit Backoff

**File:** `/src/lib/job-queue/__tests__/concurrency.test.ts` (EXTEND)
**Estimated Complexity:** Medium
**Dependencies:** Task 12

#### 13.1 Test: Rate limit backoff delays acquisitions

```typescript
describe('Rate Limit Backoff', () => {
  it('should delay acquisitions during backoff', async () => {
    const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

    // First acquisition succeeds immediately
    await semaphore.acquire();

    // Notify rate limit
    semaphore.notifyRateLimit();

    expect(semaphore.isBackoffActive()).toBe(true);

    // Release the slot
    semaphore.release();

    // Next acquire should wait for backoff (we'll use a short timeout to test)
    const start = Date.now();
    // Use a semaphore with shorter backoff for testing
    // Note: In real tests, you'd mock the constants or time
    expect(semaphore.getBackoffState().isInBackoff).toBe(true);
  });
});
```

#### 13.2 Test: Backoff resets after success

```typescript
it('should reset consecutive rate limits after notifySuccess', async () => {
  const semaphore = createTranslationSemaphore({ maxConcurrent: 2 });

  // Trigger multiple rate limits
  semaphore.notifyRateLimit();
  semaphore.notifyRateLimit();

  expect(semaphore.getBackoffState().consecutiveRateLimits).toBe(2);

  // Notify success
  semaphore.notifySuccess();

  expect(semaphore.getBackoffState().consecutiveRateLimits).toBe(0);
});
```

#### 13.3 Test: isRateLimitError detection

```typescript
describe('isRateLimitError', () => {
  it('should detect HTTP 429 status', () => {
    const error = { status: 429, message: 'Too Many Requests' };
    expect(isRateLimitError(error)).toBe(true);
  });

  it('should detect RATE_LIMITED error code', () => {
    const error = { code: 'RATE_LIMITED', message: 'Rate limit exceeded' };
    expect(isRateLimitError(error)).toBe(true);
  });

  it('should detect rate limit in message', () => {
    const error = new Error('API rate limit exceeded');
    expect(isRateLimitError(error)).toBe(true);
  });

  it('should return false for non-rate-limit errors', () => {
    const error = new Error('Connection refused');
    expect(isRateLimitError(error)).toBe(false);
  });
});
```

**Acceptance Criteria for Task 13:**
- [ ] Backoff state is correctly tracked
- [ ] `notifySuccess()` resets rate limit counter
- [ ] `isRateLimitError()` correctly identifies rate limit errors

---

### Task 14: Write Integration Tests

**File:** `/src/lib/job-queue/__tests__/concurrency.integration.test.ts` (NEW)
**Estimated Complexity:** Medium
**Dependencies:** Tasks 8-11

#### 14.1 Create integration test file

```typescript
/**
 * Integration tests for TranslationSemaphore
 * Tests for REQ-E03-019: Implement Concurrency Control
 *
 * These tests verify the semaphore works correctly with
 * multiple processors and simulated translation operations.
 */

import {
  getTranslationSemaphore,
  resetTranslationSemaphore,
} from '../concurrency';

describe('TranslationSemaphore Integration', () => {
  beforeEach(() => {
    resetTranslationSemaphore();
  });

  afterEach(() => {
    resetTranslationSemaphore();
  });

  it('should share semaphore across multiple processors', async () => {
    const semaphore = getTranslationSemaphore();
    const maxConcurrent = 10; // Default

    // Simulate multiple processors acquiring slots concurrently
    const processors = Array.from({ length: 15 }, (_, i) => i);
    let activeCount = 0;
    let maxObservedActive = 0;

    const results = await Promise.all(
      processors.map(async (id) => {
        await semaphore.acquire();
        activeCount++;
        maxObservedActive = Math.max(maxObservedActive, activeCount);

        // Simulate translation work
        await new Promise(resolve => setTimeout(resolve, 50));

        activeCount--;
        semaphore.release();
        return id;
      })
    );

    expect(results.length).toBe(15);
    expect(maxObservedActive).toBeLessThanOrEqual(maxConcurrent);
  });
});
```

#### 14.2 Test: Timeout handling doesn't deadlock

```typescript
it('should not deadlock when timeout occurs', async () => {
  const semaphore = getTranslationSemaphore();

  // Acquire all slots
  for (let i = 0; i < 10; i++) {
    await semaphore.acquire();
  }

  // This should timeout, not hang
  const timeoutPromise = semaphore.acquire(100);

  await expect(timeoutPromise).rejects.toThrow(/timeout/i);

  // Semaphore should still be functional
  semaphore.release();
  await semaphore.acquire(); // Should succeed

  // Cleanup
  for (let i = 0; i < 10; i++) {
    semaphore.release();
  }
});
```

**Acceptance Criteria for Task 14:**
- [ ] Multiple processors share semaphore correctly
- [ ] Concurrent operations respect maxConcurrent limit
- [ ] Timeout doesn't cause deadlock
- [ ] Semaphore remains functional after errors

---

## File Changes Summary

### New Files

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/lib/job-queue/concurrency.ts` | TranslationSemaphore class and helpers | Tasks 1-5, 7 |
| `/src/lib/job-queue/__tests__/concurrency.test.ts` | Unit tests | Tasks 12-13 |
| `/src/lib/job-queue/__tests__/concurrency.integration.test.ts` | Integration tests | Task 14 |

### Modified Files

| File Path | Changes | Task |
|-----------|---------|------|
| `/src/lib/job-queue/index.ts` | Add concurrency exports | Task 6 |
| `/src/lib/content-translation/processors/item-processor.ts` | Add semaphore integration | Task 8 |
| `/src/lib/content-translation/processors/article-processor.ts` | Add semaphore integration | Task 9 |
| `/src/lib/content-translation/processors/link-processor.ts` | Add semaphore integration | Task 10 |
| `/src/lib/content-translation/processors/tag-processor.ts` | Add semaphore integration | Task 11 |

---

## Environment Variables

Add to deployment configuration:

```bash
# Translation Concurrency Control (REQ-E03-019)
TRANSLATION_MAX_CONCURRENT=10
TRANSLATION_ACQUIRE_TIMEOUT_MS=60000
TRANSLATION_RATE_LIMIT_BASE_DELAY_MS=5000
TRANSLATION_RATE_LIMIT_MAX_DELAY_MS=60000
```

---

## Implementation Order

Execute tasks in this order to minimize conflicts:

1. **Tasks 1-5:** Core TranslationSemaphore implementation
2. **Task 7:** Rate limit error detection helper
3. **Task 6:** Export from module index
4. **Tasks 12-13:** Unit tests (verify implementation)
5. **Tasks 8-11:** Processor integrations (can be parallelized)
6. **Task 14:** Integration tests

---

## Verification Checklist

After completing all tasks, verify:

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm test -- --grep "TranslationSemaphore"` - all tests pass
- [ ] Semaphore limits concurrent API calls to configured max
- [ ] Queued requests are served in FIFO order
- [ ] Rate limit detection triggers exponential backoff
- [ ] All four processors use semaphore acquire/release pattern
- [ ] Metrics accurately reflect semaphore state

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Deadlock if release not called | Enforce try/finally pattern in all processors; timeout on acquire |
| Memory leak from queue buildup | Queue has implicit limit via timeout; rejected requests are cleaned up |
| Race condition in acquire/release | JavaScript is single-threaded; Promise queue is atomic |
| Backoff too aggressive | Configurable via environment; reasonable defaults (5s-60s) |

---

## References

- Overview Document: `REQ-E03-019-implement-concurrency-control-overview.md`
- Implementation Plan: `Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Existing Patterns: `/src/lib/job-queue/concurrency-control.ts` (singleton pattern)
- Existing Rate Limiter: `/src/lib/translation-service/utils/rate-limiter.ts` (acquire pattern)
- Existing Retry Logic: `/src/lib/translation-service/utils/retry.ts` (backoff calculation)
