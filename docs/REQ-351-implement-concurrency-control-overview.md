# REQ-351: Implementation Breakdown - Implement Concurrency Control for Translation API Calls

**Document Created:** 2026-01-19 14:30
**Last Modified:** 2026-01-19 14:30
**Request Reference:** docs/gen_requests_epic3.md - Request #277 (mapped as Task 3.7)
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.7

---

## Overview

This document provides a detailed implementation breakdown for the concurrency control module that limits concurrent translation API calls to prevent overwhelming translation service providers.

### Purpose

The concurrency control module serves to:

- Enforce a maximum of 10 concurrent translation API calls at any given time
- Use semaphore-based throttling to manage access to translation service providers
- Queue additional requests when the concurrency limit is reached
- Release concurrency slots when API calls complete (success or failure)
- Protect translation provider integrations from rate limiting and service degradation

### Problem Statement

Without concurrency control, the translation job processor can generate dozens or hundreds of concurrent API requests when multiple jobs are processed simultaneously. This can:

1. Exceed provider rate limits (Claude/OpenAI)
2. Trigger service throttling
3. Degrade translation service performance
4. Cause unexpected costs from quota overages

### Solution

Implement a semaphore-based concurrency control mechanism that:

1. Maintains a count of active API calls
2. Blocks new calls when the limit is reached
3. Releases permits when calls complete
4. Integrates with the existing job processor

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Translation job processor | **Required** | `src/lib/job-queue/job-processor.ts` must exist |
| Translation service | **Required** | `src/lib/translation-service/` must exist |
| Rate limiter utility | **Reference** | `src/lib/translation-service/utils/rate-limiter.ts` for patterns |
| Concurrency control (existing) | **Partial** | `src/lib/job-queue/concurrency-control.ts` has lock management but not API throttling |

### Dependents (Blocked by this task)

- Job processing API route (REQ-332) - relies on concurrency control during job processing
- Automated job processing trigger (REQ-333) - needs stable concurrency
- Future batch translation operations

---

## Technical Approach

### Existing Implementation Analysis

The existing `concurrency-control.ts` file handles:
- **Stale lock cleanup** - recovering stuck jobs
- **Lock heartbeat** - refreshing locks for long-running jobs
- **Duplicate prevention** - idempotent job creation
- **Lock statistics** - monitoring active locks

**What's Missing:** API-level concurrency throttling for translation service calls.

The `rate-limiter.ts` file handles per-provider rate limiting (requests per minute) but not concurrent request limiting.

### Distinction: Rate Limiting vs Concurrency Control

| Feature | Rate Limiter | Concurrency Control |
|---------|--------------|---------------------|
| Purpose | Limit requests per time window | Limit simultaneous requests |
| Metric | Requests/minute | Active requests at a time |
| Behavior | Delays after quota used | Blocks until slot available |
| Location | `translation-service/utils/rate-limiter.ts` | `job-queue/concurrency.ts` (NEW) |

### Architecture Decision

**Semaphore Pattern** - Chosen over queue-based throttling for:
- Simpler implementation
- Familiar async/await integration
- Natural fit with TypeScript/Node.js
- No need for persistent queue state

---

## Architecture

### Module Structure

```
src/lib/job-queue/
├── concurrency.ts         # NEW: API concurrency control (semaphore)
├── concurrency-control.ts # EXISTING: Lock management
├── job-processor.ts       # MODIFY: Integrate concurrency control
├── index.ts               # MODIFY: Export concurrency utilities
└── ...
```

### Concurrency Flow

```
Translation Job Processing
    │
    ▼
Job Processor retrieves job
    │
    ▼
Acquire Semaphore Permit ◄────┐
    │                         │
    ├─► Permit Available?     │
    │   └── YES: Continue     │
    │   └── NO: Wait ─────────┘
    │
    ▼
Execute Translation API Call
    │
    ├── Success: Save translation
    └── Failure: Handle error
    │
    ▼
Release Semaphore Permit (always)
    │
    ▼
Next waiting job proceeds
```

### Semaphore State

```
┌─────────────────────────────────────────┐
│         TranslationSemaphore            │
├─────────────────────────────────────────┤
│ maxConcurrent: 10                       │
│ activeCount: 7                          │
│ waitingQueue: [Promise, Promise, ...]   │
├─────────────────────────────────────────┤
│ Available Permits: 3                    │
│ Waiting Requests: 0                     │
└─────────────────────────────────────────┘
```

---

## Integration Contract

### Semaphore Types

```typescript
// /src/lib/job-queue/concurrency.ts

/**
 * Configuration for the translation semaphore
 */
export interface SemaphoreConfig {
  /** Maximum concurrent translation API calls (default: 10) */
  maxConcurrent: number;
  /** Timeout for waiting in queue in milliseconds (default: 30000) */
  waitTimeoutMs: number;
}

/**
 * Status of the semaphore
 */
export interface SemaphoreStatus {
  /** Maximum concurrent permits */
  maxConcurrent: number;
  /** Currently active permits */
  activeCount: number;
  /** Number of requests waiting */
  waitingCount: number;
  /** Available permits */
  availablePermits: number;
  /** Status timestamp */
  timestamp: string;
}

/**
 * Result of acquiring a permit
 */
export interface AcquireResult {
  /** Whether permit was acquired */
  acquired: boolean;
  /** Unique permit ID for release */
  permitId?: string;
  /** Error message if failed */
  error?: string;
}
```

### Semaphore API

```typescript
// /src/lib/job-queue/concurrency.ts

/**
 * Translation API Semaphore
 * Limits concurrent translation API calls
 */
export class TranslationSemaphore {
  constructor(config?: Partial<SemaphoreConfig>);

  /**
   * Acquire a permit to make an API call
   * Blocks until permit is available or timeout
   */
  acquire(): Promise<AcquireResult>;

  /**
   * Release a permit after API call completes
   * MUST be called after acquire (success or failure)
   */
  release(permitId: string): void;

  /**
   * Get current semaphore status
   */
  getStatus(): SemaphoreStatus;

  /**
   * Check if permits are available without acquiring
   */
  hasAvailablePermits(): boolean;

  /**
   * Reset semaphore (for testing)
   */
  reset(): void;
}

/**
 * Execute a function with semaphore protection
 * Automatically acquires and releases permit
 */
export async function withConcurrencyLimit<T>(
  fn: () => Promise<T>
): Promise<T>;

/**
 * Get the global translation semaphore
 */
export function getTranslationSemaphore(): TranslationSemaphore;

/**
 * Reset the global semaphore (for testing)
 */
export function resetTranslationSemaphore(): void;
```

### Usage in Job Processor

```typescript
// Example integration in job-processor.ts

import { withConcurrencyLimit } from './concurrency';

async function processJob(job: TranslationJob): Promise<JobProcessingResult> {
  // ... fetch content

  // Translate with concurrency control
  const translatedFields = await withConcurrencyLimit(async () => {
    const results: Record<string, string> = {};
    for (const [fieldName, fieldValue] of Object.entries(content.fields)) {
      if (fieldValue) {
        const result = await translateText(fieldValue, sourceLanguage, targetLanguage, {
          context: { contentType, domainContext: context.domainContext },
        });
        results[fieldName] = result.translatedText;
      }
    }
    return results;
  });

  // ... save translation
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/concurrency.ts` | Semaphore-based API concurrency control |
| `src/lib/job-queue/__tests__/concurrency.test.ts` | Unit tests for semaphore |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/lib/job-queue/job-processor.ts` | Wrap translation calls with concurrency control |
| `src/lib/job-queue/index.ts` | Export concurrency utilities |

### Dependencies (Read-Only Reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/lib/job-queue/concurrency-control.ts` | Pattern for module structure and manager class |
| `src/lib/translation-service/utils/rate-limiter.ts` | Pattern for async queue management |
| `src/lib/translation-service/index.ts` | Translation API interface |

---

## Implementation Tasks

### Task 1: Create Semaphore Module (45 min)

**File:** `src/lib/job-queue/concurrency.ts`

**Deliverables:**
- [ ] Define `SemaphoreConfig` interface
- [ ] Define `SemaphoreStatus` interface
- [ ] Define `AcquireResult` interface
- [ ] Implement `TranslationSemaphore` class
- [ ] Implement `acquire()` method with timeout
- [ ] Implement `release()` method
- [ ] Implement `getStatus()` method
- [ ] Implement `hasAvailablePermits()` method
- [ ] Implement `withConcurrencyLimit()` helper function
- [ ] Add factory/singleton pattern
- [ ] Add JSDoc documentation

**Implementation:**

```typescript
/**
 * Concurrency Control for Translation API Calls
 * Part of REQ-351 / Task 3.7: Implement Concurrency Control
 *
 * Provides semaphore-based throttling to limit concurrent translation
 * API calls and prevent overwhelming service providers.
 *
 * Features:
 * - Maximum 10 concurrent translation API calls (configurable)
 * - Queue-based waiting when limit is reached
 * - Timeout protection for waiting requests
 * - Automatic permit release via wrapper function
 *
 * @module job-queue/concurrency
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// ===========================================================================
// Configuration
// ===========================================================================

/**
 * Default maximum concurrent translation API calls
 * Can be overridden via TRANSLATION_MAX_CONCURRENT env var
 */
export const DEFAULT_MAX_CONCURRENT = 10;

/**
 * Default timeout for waiting to acquire a permit (30 seconds)
 * Can be overridden via TRANSLATION_CONCURRENCY_TIMEOUT_MS env var
 */
export const DEFAULT_WAIT_TIMEOUT_MS = 30000;

/**
 * Configuration for the translation semaphore
 */
export interface SemaphoreConfig {
  /** Maximum concurrent translation API calls (default: 10) */
  maxConcurrent: number;
  /** Timeout for waiting in queue in milliseconds (default: 30000) */
  waitTimeoutMs: number;
}

/**
 * Default semaphore configuration
 */
export const DEFAULT_SEMAPHORE_CONFIG: SemaphoreConfig = {
  maxConcurrent: parseInt(
    process.env.TRANSLATION_MAX_CONCURRENT || String(DEFAULT_MAX_CONCURRENT),
    10
  ),
  waitTimeoutMs: parseInt(
    process.env.TRANSLATION_CONCURRENCY_TIMEOUT_MS || String(DEFAULT_WAIT_TIMEOUT_MS),
    10
  ),
};

// ===========================================================================
// Types
// ===========================================================================

/**
 * Status of the semaphore
 */
export interface SemaphoreStatus {
  /** Maximum concurrent permits */
  maxConcurrent: number;
  /** Currently active permits */
  activeCount: number;
  /** Number of requests waiting */
  waitingCount: number;
  /** Available permits */
  availablePermits: number;
  /** Status timestamp */
  timestamp: string;
}

/**
 * Result of acquiring a permit
 */
export interface AcquireResult {
  /** Whether permit was acquired */
  acquired: boolean;
  /** Unique permit ID for release */
  permitId?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Internal structure for queued waiters
 */
interface QueuedWaiter {
  resolve: (result: AcquireResult) => void;
  reject: (error: Error) => void;
  enqueuedAt: number;
  permitId: string;
}

// ===========================================================================
// Error Types
// ===========================================================================

/**
 * Error thrown when semaphore timeout is reached
 */
export class SemaphoreTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Timed out waiting for semaphore permit after ${timeoutMs}ms`);
    this.name = 'SemaphoreTimeoutError';
  }
}

// ===========================================================================
// TranslationSemaphore Class
// ===========================================================================

/**
 * Translation API Semaphore
 *
 * Limits concurrent translation API calls using a semaphore pattern.
 * When the maximum concurrent limit is reached, additional requests
 * are queued and wait until a permit becomes available.
 *
 * @example
 * ```typescript
 * const semaphore = new TranslationSemaphore({ maxConcurrent: 10 });
 *
 * const result = await semaphore.acquire();
 * if (result.acquired) {
 *   try {
 *     await translateText(...);
 *   } finally {
 *     semaphore.release(result.permitId!);
 *   }
 * }
 * ```
 */
export class TranslationSemaphore {
  private config: SemaphoreConfig;
  private activeCount = 0;
  private activePermits: Set<string> = new Set();
  private waitQueue: QueuedWaiter[] = [];
  private permitCounter = 0;

  constructor(config: Partial<SemaphoreConfig> = {}) {
    this.config = { ...DEFAULT_SEMAPHORE_CONFIG, ...config };
  }

  /**
   * Generate a unique permit ID
   */
  private generatePermitId(): string {
    this.permitCounter++;
    return `permit-${Date.now()}-${this.permitCounter}`;
  }

  /**
   * Acquire a permit to make a translation API call
   *
   * If a permit is available, returns immediately.
   * If no permits available, waits in queue until one becomes available
   * or timeout is reached.
   *
   * @returns Acquire result with permit ID on success
   */
  async acquire(): Promise<AcquireResult> {
    // If permits available, grant immediately
    if (this.activeCount < this.config.maxConcurrent) {
      const permitId = this.generatePermitId();
      this.activeCount++;
      this.activePermits.add(permitId);

      return {
        acquired: true,
        permitId,
      };
    }

    // No permits available - queue and wait
    return new Promise<AcquireResult>((resolve, reject) => {
      const permitId = this.generatePermitId();
      const waiter: QueuedWaiter = {
        resolve,
        reject,
        enqueuedAt: Date.now(),
        permitId,
      };

      this.waitQueue.push(waiter);

      // Set up timeout
      const timeoutId = setTimeout(() => {
        // Remove from queue if still waiting
        const index = this.waitQueue.indexOf(waiter);
        if (index !== -1) {
          this.waitQueue.splice(index, 1);
          resolve({
            acquired: false,
            error: `Timed out waiting for semaphore permit after ${this.config.waitTimeoutMs}ms`,
          });
        }
      }, this.config.waitTimeoutMs);

      // Store timeout ID in waiter for cleanup
      (waiter as unknown as { timeoutId: NodeJS.Timeout }).timeoutId = timeoutId;
    });
  }

  /**
   * Release a permit after translation API call completes
   *
   * MUST be called after acquire(), regardless of success or failure.
   * Failing to release will cause permit leaks and eventual deadlock.
   *
   * @param permitId - The permit ID returned from acquire()
   */
  release(permitId: string): void {
    // Validate permit
    if (!this.activePermits.has(permitId)) {
      console.warn(`[TranslationSemaphore] Attempted to release unknown permit: ${permitId}`);
      return;
    }

    // Release the permit
    this.activePermits.delete(permitId);
    this.activeCount--;

    // Process waiting queue
    this.processQueue();
  }

  /**
   * Process the waiting queue when a permit becomes available
   */
  private processQueue(): void {
    // If no one waiting or no capacity, nothing to do
    if (this.waitQueue.length === 0 || this.activeCount >= this.config.maxConcurrent) {
      return;
    }

    // Get next waiter
    const waiter = this.waitQueue.shift();
    if (!waiter) return;

    // Clear timeout
    const timeoutId = (waiter as unknown as { timeoutId?: NodeJS.Timeout }).timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Grant permit
    this.activeCount++;
    this.activePermits.add(waiter.permitId);

    waiter.resolve({
      acquired: true,
      permitId: waiter.permitId,
    });
  }

  /**
   * Get current semaphore status
   */
  getStatus(): SemaphoreStatus {
    return {
      maxConcurrent: this.config.maxConcurrent,
      activeCount: this.activeCount,
      waitingCount: this.waitQueue.length,
      availablePermits: Math.max(0, this.config.maxConcurrent - this.activeCount),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check if permits are available without acquiring
   */
  hasAvailablePermits(): boolean {
    return this.activeCount < this.config.maxConcurrent;
  }

  /**
   * Update semaphore configuration
   *
   * Note: Changing maxConcurrent while requests are active
   * may temporarily allow more or fewer concurrent requests.
   */
  updateConfig(config: Partial<SemaphoreConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SemaphoreConfig {
    return { ...this.config };
  }

  /**
   * Reset semaphore to initial state
   *
   * WARNING: This will reject all waiting requests.
   * Only use for testing or shutdown scenarios.
   */
  reset(): void {
    // Reject all waiting requests
    while (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift();
      if (waiter) {
        const timeoutId = (waiter as unknown as { timeoutId?: NodeJS.Timeout }).timeoutId;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        waiter.resolve({
          acquired: false,
          error: 'Semaphore reset',
        });
      }
    }

    // Clear state
    this.activeCount = 0;
    this.activePermits.clear();
  }
}

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Execute a function with semaphore protection
 *
 * Automatically acquires and releases a permit, ensuring proper
 * cleanup even if the function throws an error.
 *
 * @example
 * ```typescript
 * const result = await withConcurrencyLimit(async () => {
 *   return await translateText(text, 'en', 'fr');
 * });
 * ```
 *
 * @param fn - Async function to execute with concurrency protection
 * @returns Result of the function
 * @throws SemaphoreTimeoutError if permit cannot be acquired
 */
export async function withConcurrencyLimit<T>(
  fn: () => Promise<T>
): Promise<T> {
  const semaphore = getTranslationSemaphore();
  const result = await semaphore.acquire();

  if (!result.acquired) {
    throw new SemaphoreTimeoutError(semaphore.getConfig().waitTimeoutMs);
  }

  try {
    return await fn();
  } finally {
    semaphore.release(result.permitId!);
  }
}

/**
 * Try to execute a function with semaphore protection
 *
 * Like withConcurrencyLimit but returns null instead of throwing
 * if permit cannot be acquired.
 *
 * @param fn - Async function to execute
 * @returns Result of function or null if permit unavailable
 */
export async function tryWithConcurrencyLimit<T>(
  fn: () => Promise<T>
): Promise<T | null> {
  const semaphore = getTranslationSemaphore();
  const result = await semaphore.acquire();

  if (!result.acquired) {
    return null;
  }

  try {
    return await fn();
  } finally {
    semaphore.release(result.permitId!);
  }
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let globalSemaphore: TranslationSemaphore | null = null;

/**
 * Get the global translation semaphore instance
 *
 * Creates a singleton on first call.
 *
 * @returns Global TranslationSemaphore instance
 */
export function getTranslationSemaphore(): TranslationSemaphore {
  if (!globalSemaphore) {
    globalSemaphore = new TranslationSemaphore();
  }
  return globalSemaphore;
}

/**
 * Create a new semaphore instance (for testing or custom config)
 *
 * @param config - Optional configuration
 * @returns New TranslationSemaphore instance
 */
export function createTranslationSemaphore(
  config?: Partial<SemaphoreConfig>
): TranslationSemaphore {
  return new TranslationSemaphore(config);
}

/**
 * Reset the global semaphore
 *
 * Useful for testing and cleanup.
 */
export function resetTranslationSemaphore(): void {
  if (globalSemaphore) {
    globalSemaphore.reset();
    globalSemaphore = null;
  }
}

/**
 * Get semaphore status (convenience function)
 */
export function getSemaphoreStatus(): SemaphoreStatus {
  return getTranslationSemaphore().getStatus();
}
```

**Acceptance Criteria:**
- Semaphore limits concurrent calls to configured maximum
- Requests wait in queue when limit reached
- Permits are released on both success and failure
- Timeout mechanism prevents indefinite waiting
- Singleton pattern provides global access

### Task 2: Integrate with Job Processor (30 min)

**File:** `src/lib/job-queue/job-processor.ts`

**Deliverables:**
- [ ] Import `withConcurrencyLimit` from concurrency module
- [ ] Wrap translation API calls with concurrency protection
- [ ] Ensure proper error handling and permit release
- [ ] Add logging for concurrency events

**Modifications:**

```typescript
// Add import at top of file
import { withConcurrencyLimit, getSemaphoreStatus } from './concurrency';

// Modify the processJob function translation section:
async function processJob(
  job: TranslationJob,
  config: JobProcessorConfig
): Promise<JobProcessingResult> {
  const startTime = Date.now();
  const { entityType, entityId, sourceLanguage, targetLanguage } = job;

  const stopHeartbeat = createLockHeartbeat(
    job.id,
    config.workerId,
    config.heartbeatIntervalMs || DEFAULT_HEARTBEAT_INTERVAL_MS
  );

  try {
    const content = await fetchEntityContent(entityType, entityId);

    if (!content) {
      throw new Error(`Entity not found: ${entityType}/${entityId}`);
    }

    // Translate each field WITH CONCURRENCY CONTROL
    const translatedFields: Record<string, string> = {};
    const context = getTranslationContext(entityType);

    // Wrap the translation loop in concurrency control
    await withConcurrencyLimit(async () => {
      for (const [fieldName, fieldValue] of Object.entries(content.fields)) {
        if (fieldValue === null || fieldValue === '') {
          continue;
        }

        const contentType = getContentType(entityType, fieldName);

        const result = await translateText(fieldValue, sourceLanguage, targetLanguage, {
          context: {
            contentType,
            domainContext: context.domainContext,
          },
        });

        translatedFields[fieldName] = result.translatedText;
      }
    });

    // Save and complete as before...
    const saved = await saveTranslation(
      entityType,
      entityId,
      targetLanguage,
      translatedFields
    );

    if (!saved) {
      throw new Error('Failed to save translation to database');
    }

    await markJobCompleted(job.id);

    if (config.enableLogging) {
      console.log(`[JobProcessor] Job ${job.id} completed successfully`);
    }

    return {
      jobId: job.id,
      success: true,
      entityType,
      entityId,
      targetLanguage,
      translatedFields,
      processingTimeMs: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await markJobFailed(job.id, errorMessage);

    if (config.enableLogging) {
      console.error(`[JobProcessor] Job ${job.id} failed:`, errorMessage);
    }

    return {
      jobId: job.id,
      success: false,
      entityType,
      entityId,
      targetLanguage,
      errorMessage,
      processingTimeMs: Date.now() - startTime,
    };
  } finally {
    stopHeartbeat();
  }
}
```

**Acceptance Criteria:**
- Translation calls are protected by semaphore
- Permits are released even on error
- Logging includes concurrency state when enabled

### Task 3: Update Module Exports (10 min)

**File:** `src/lib/job-queue/index.ts`

**Deliverables:**
- [ ] Export concurrency types
- [ ] Export concurrency functions
- [ ] Export semaphore class

**Additions:**

```typescript
// Concurrency control exports (REQ-351 - API throttling)
export {
  TranslationSemaphore,
  createTranslationSemaphore,
  getTranslationSemaphore,
  resetTranslationSemaphore,
  withConcurrencyLimit,
  tryWithConcurrencyLimit,
  getSemaphoreStatus,
  SemaphoreTimeoutError,
  DEFAULT_MAX_CONCURRENT,
  DEFAULT_WAIT_TIMEOUT_MS,
  DEFAULT_SEMAPHORE_CONFIG,
} from './concurrency';

export type {
  SemaphoreConfig,
  SemaphoreStatus,
  AcquireResult,
} from './concurrency';
```

**Acceptance Criteria:**
- All concurrency utilities accessible via `import { ... } from '@/lib/job-queue'`
- No import errors

### Task 4: Write Unit Tests (45 min)

**File:** `src/lib/job-queue/__tests__/concurrency.test.ts`

**Test Coverage:**
- [ ] Semaphore grants permits when available
- [ ] Semaphore queues requests when limit reached
- [ ] Semaphore releases permits correctly
- [ ] Timeout behavior works correctly
- [ ] `withConcurrencyLimit` wraps functions correctly
- [ ] Reset clears all state
- [ ] Edge cases (double release, unknown permit)

**Example Tests:**

```typescript
import {
  TranslationSemaphore,
  createTranslationSemaphore,
  withConcurrencyLimit,
  resetTranslationSemaphore,
  SemaphoreTimeoutError,
} from '../concurrency';

describe('TranslationSemaphore', () => {
  let semaphore: TranslationSemaphore;

  beforeEach(() => {
    semaphore = createTranslationSemaphore({ maxConcurrent: 3, waitTimeoutMs: 1000 });
  });

  afterEach(() => {
    semaphore.reset();
  });

  describe('acquire', () => {
    it('grants permit when capacity available', async () => {
      const result = await semaphore.acquire();

      expect(result.acquired).toBe(true);
      expect(result.permitId).toBeDefined();
      expect(semaphore.getStatus().activeCount).toBe(1);
    });

    it('grants multiple permits up to limit', async () => {
      const results = await Promise.all([
        semaphore.acquire(),
        semaphore.acquire(),
        semaphore.acquire(),
      ]);

      expect(results.every(r => r.acquired)).toBe(true);
      expect(semaphore.getStatus().activeCount).toBe(3);
      expect(semaphore.getStatus().availablePermits).toBe(0);
    });

    it('queues requests when limit reached', async () => {
      // Fill all permits
      await Promise.all([
        semaphore.acquire(),
        semaphore.acquire(),
        semaphore.acquire(),
      ]);

      expect(semaphore.getStatus().activeCount).toBe(3);

      // Start a waiting request (don't await yet)
      const waitingPromise = semaphore.acquire();

      // Give time for queue to process
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(semaphore.getStatus().waitingCount).toBe(1);

      // Clean up - timeout will handle the waiting request
    });

    it('times out when no permit available', async () => {
      // Use short timeout for test
      const shortSemaphore = createTranslationSemaphore({
        maxConcurrent: 1,
        waitTimeoutMs: 100
      });

      // Acquire the only permit
      await shortSemaphore.acquire();

      // Try to acquire another (should timeout)
      const result = await shortSemaphore.acquire();

      expect(result.acquired).toBe(false);
      expect(result.error).toContain('Timed out');
    });
  });

  describe('release', () => {
    it('releases permit and allows waiting request to proceed', async () => {
      // Fill all permits
      const [result1] = await Promise.all([
        semaphore.acquire(),
        semaphore.acquire(),
        semaphore.acquire(),
      ]);

      // Start waiting request
      const waitingPromise = semaphore.acquire();

      // Release one permit
      semaphore.release(result1.permitId!);

      // Waiting request should now succeed
      const waitingResult = await waitingPromise;
      expect(waitingResult.acquired).toBe(true);
    });

    it('handles unknown permit gracefully', () => {
      // Should not throw
      expect(() => semaphore.release('unknown-permit')).not.toThrow();
    });

    it('decrements active count', async () => {
      const result = await semaphore.acquire();
      expect(semaphore.getStatus().activeCount).toBe(1);

      semaphore.release(result.permitId!);
      expect(semaphore.getStatus().activeCount).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('returns correct status', async () => {
      await semaphore.acquire();
      await semaphore.acquire();

      const status = semaphore.getStatus();

      expect(status.maxConcurrent).toBe(3);
      expect(status.activeCount).toBe(2);
      expect(status.waitingCount).toBe(0);
      expect(status.availablePermits).toBe(1);
      expect(status.timestamp).toBeDefined();
    });
  });

  describe('hasAvailablePermits', () => {
    it('returns true when permits available', () => {
      expect(semaphore.hasAvailablePermits()).toBe(true);
    });

    it('returns false when no permits available', async () => {
      await Promise.all([
        semaphore.acquire(),
        semaphore.acquire(),
        semaphore.acquire(),
      ]);

      expect(semaphore.hasAvailablePermits()).toBe(false);
    });
  });

  describe('reset', () => {
    it('clears all state', async () => {
      await semaphore.acquire();
      await semaphore.acquire();

      semaphore.reset();

      expect(semaphore.getStatus().activeCount).toBe(0);
      expect(semaphore.getStatus().waitingCount).toBe(0);
    });
  });
});

describe('withConcurrencyLimit', () => {
  beforeEach(() => {
    resetTranslationSemaphore();
  });

  afterEach(() => {
    resetTranslationSemaphore();
  });

  it('executes function and returns result', async () => {
    const result = await withConcurrencyLimit(async () => {
      return 'test-result';
    });

    expect(result).toBe('test-result');
  });

  it('releases permit after function completes', async () => {
    const { getSemaphoreStatus } = await import('../concurrency');

    await withConcurrencyLimit(async () => {
      expect(getSemaphoreStatus().activeCount).toBe(1);
    });

    expect(getSemaphoreStatus().activeCount).toBe(0);
  });

  it('releases permit on error', async () => {
    const { getSemaphoreStatus } = await import('../concurrency');

    await expect(
      withConcurrencyLimit(async () => {
        throw new Error('Test error');
      })
    ).rejects.toThrow('Test error');

    expect(getSemaphoreStatus().activeCount).toBe(0);
  });
});
```

**Acceptance Criteria:**
- All tests pass
- Tests cover success and error paths
- Tests are isolated (use beforeEach/afterEach)

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: Create Semaphore Module | 45 min | Medium |
| Task 2: Integrate with Job Processor | 30 min | Medium |
| Task 3: Update Module Exports | 10 min | Low |
| Task 4: Unit Tests | 45 min | Medium |
| **Total** | **~2 hours** | Medium |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Permit leaks cause deadlock | Medium | High | Always use withConcurrencyLimit wrapper |
| Timeout too short | Low | Medium | Make configurable via env var |
| Timeout too long | Low | Low | Monitor queue depth in production |
| Race conditions | Low | Medium | Use atomic state updates |
| Memory leak in queue | Low | Low | Queue entries are cleaned on timeout/release |

---

## Testing Checklist

### Unit Tests
- [ ] Semaphore grants permits when available
- [ ] Semaphore queues when limit reached
- [ ] Permits are released correctly
- [ ] Timeout mechanism works
- [ ] `withConcurrencyLimit` handles success
- [ ] `withConcurrencyLimit` handles errors
- [ ] Reset clears all state
- [ ] Edge cases (double release, unknown permit)

### Integration Tests
- [ ] Job processor respects concurrency limit
- [ ] Multiple jobs queue correctly
- [ ] Error jobs release permits

### Manual Testing
- [ ] Process 20+ jobs simultaneously, verify max 10 concurrent API calls
- [ ] Monitor queue depth during batch processing
- [ ] Verify permits are released on job failure

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRANSLATION_MAX_CONCURRENT` | `10` | Maximum concurrent translation API calls |
| `TRANSLATION_CONCURRENCY_TIMEOUT_MS` | `30000` | Timeout for waiting to acquire permit |

---

## Code Standards

### Naming Conventions
- Use PascalCase for class names (TranslationSemaphore)
- Use camelCase for functions (withConcurrencyLimit)
- Use UPPER_CASE for constants (DEFAULT_MAX_CONCURRENT)

### Documentation
- JSDoc comments for all exported functions
- Module-level documentation header
- Inline comments for complex logic

### Error Handling
- Clear error messages for timeout
- Graceful handling of unknown permits
- Logging for unexpected states

---

## References

- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Definition:** `docs/gen_requests_epic3.md` - Request #277
- **Pattern Reference - Lock Management:** `src/lib/job-queue/concurrency-control.ts`
- **Pattern Reference - Rate Limiter:** `src/lib/translation-service/utils/rate-limiter.ts`
- **Pattern Reference - Job Processor:** `src/lib/job-queue/job-processor.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 3.7: Implement concurrency control for translation API calls*
