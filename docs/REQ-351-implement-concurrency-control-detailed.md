# REQ-351: Detailed Task Breakdown - Implement Concurrency Control for Translation API Calls

**Document Created:** 2026-01-19 14:45:00 UTC
**Last Modified:** 2026-01-19 14:45:00 UTC
**Request Reference:** docs/gen_requests_epic3.md - REQ-277 (Task 3.7 in Implementation Plan)
**Overview Document:** docs/REQ-351-implement-concurrency-control-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 3 - Translation Job Processing Enhancement
**Task ID:** 3.7
**Estimated Story Points:** 5

---

## Executive Summary

This document provides a granular, actionable task breakdown for implementing semaphore-based concurrency control to limit concurrent translation API calls. The system will enforce a maximum of 10 concurrent translation API calls at any given time, preventing overwhelming translation service providers (Claude/OpenAI) and avoiding rate limiting penalties.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] `src/lib/job-queue/job-processor.ts` exists and is functional
- [ ] `src/lib/job-queue/concurrency-control.ts` exists (lock management module)
- [ ] `src/lib/translation-service/index.ts` exports `translateText` function
- [ ] `src/lib/translation-service/utils/rate-limiter.ts` exists (reference pattern)
- [ ] Translation jobs table exists in database with proper schema

**Verification Commands:**
```bash
ls -la src/lib/job-queue/
ls -la src/lib/translation-service/
```

---

## Task Breakdown

### Task 1: Create Semaphore Types and Interfaces

**File:** `src/lib/job-queue/concurrency.ts`
**Story Points:** 0.5
**Dependencies:** None

#### Subtask 1.1: Create File Header and Imports

**Action:** Create new file `src/lib/job-queue/concurrency.ts` with module header.

**Code to implement:**
```typescript
/**
 * Concurrency Control for Translation API Calls
 * Part of REQ-277 / Task 3.7: Implement Concurrency Control
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
```

**Acceptance Criteria:**
- [ ] File created at `src/lib/job-queue/concurrency.ts`
- [ ] Module header includes purpose, features, and date stamps
- [ ] No import errors

---

#### Subtask 1.2: Define Configuration Constants

**Action:** Add configuration constants with environment variable support.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] `DEFAULT_MAX_CONCURRENT` set to 10
- [ ] `DEFAULT_WAIT_TIMEOUT_MS` set to 30000
- [ ] Both constants are exported

---

#### Subtask 1.3: Define SemaphoreConfig Interface

**Action:** Define the configuration interface for the semaphore.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] `SemaphoreConfig` interface has `maxConcurrent` and `waitTimeoutMs` properties
- [ ] Environment variable overrides work correctly
- [ ] Default config object is exported

---

#### Subtask 1.4: Define SemaphoreStatus Interface

**Action:** Define the status interface for monitoring.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] `SemaphoreStatus` interface includes all required fields
- [ ] Interface is exported

---

#### Subtask 1.5: Define AcquireResult Interface

**Action:** Define the result type for permit acquisition.

**Code to implement:**
```typescript
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

**Acceptance Criteria:**
- [ ] `AcquireResult` interface includes `acquired`, `permitId`, and `error` fields
- [ ] Interface is exported

---

#### Subtask 1.6: Define Internal QueuedWaiter Interface

**Action:** Define the internal structure for queued waiters.

**Code to implement:**
```typescript
/**
 * Internal structure for queued waiters
 */
interface QueuedWaiter {
  resolve: (result: AcquireResult) => void;
  reject: (error: Error) => void;
  enqueuedAt: number;
  permitId: string;
}
```

**Acceptance Criteria:**
- [ ] `QueuedWaiter` interface defined (not exported - internal only)
- [ ] Includes resolve, reject callbacks and metadata

---

#### Subtask 1.7: Define SemaphoreTimeoutError Class

**Action:** Create custom error class for timeout scenarios.

**Code to implement:**
```typescript
/**
 * Error thrown when semaphore timeout is reached
 */
export class SemaphoreTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Timed out waiting for semaphore permit after ${timeoutMs}ms`);
    this.name = 'SemaphoreTimeoutError';
  }
}
```

**Acceptance Criteria:**
- [ ] `SemaphoreTimeoutError` extends `Error`
- [ ] Sets custom `name` property
- [ ] Error message includes timeout duration
- [ ] Class is exported

---

### Task 2: Implement TranslationSemaphore Class

**File:** `src/lib/job-queue/concurrency.ts`
**Story Points:** 2
**Dependencies:** Task 1

#### Subtask 2.1: Create Class Shell with Constructor

**Action:** Implement the TranslationSemaphore class structure.

**Code to implement:**
```typescript
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
}
```

**Acceptance Criteria:**
- [ ] Class has private `config`, `activeCount`, `activePermits`, `waitQueue`, `permitCounter` properties
- [ ] Constructor merges provided config with defaults
- [ ] `generatePermitId()` creates unique IDs

---

#### Subtask 2.2: Implement acquire() Method

**Action:** Implement permit acquisition with queue waiting.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] Returns immediately if permits available
- [ ] Queues request if no permits available
- [ ] Timeout resolves with `acquired: false` and error message
- [ ] Active count and permits set are updated correctly

---

#### Subtask 2.3: Implement release() Method

**Action:** Implement permit release with queue processing.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] Validates permit exists before releasing
- [ ] Logs warning for unknown permits
- [ ] Decrements active count
- [ ] Processes waiting queue after release
- [ ] Clears timeout for granted waiters

---

#### Subtask 2.4: Implement getStatus() Method

**Action:** Implement status reporting for monitoring.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] Returns all required status fields
- [ ] `availablePermits` is calculated correctly (never negative)
- [ ] Timestamp is in ISO format

---

#### Subtask 2.5: Implement hasAvailablePermits() Method

**Action:** Implement availability check for optimization.

**Code to implement:**
```typescript
/**
 * Check if permits are available without acquiring
 */
hasAvailablePermits(): boolean {
  return this.activeCount < this.config.maxConcurrent;
}
```

**Acceptance Criteria:**
- [ ] Returns `true` when permits available
- [ ] Returns `false` when at capacity

---

#### Subtask 2.6: Implement Configuration Methods

**Action:** Add configuration getter and updater.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] `updateConfig` merges with existing config
- [ ] `getConfig` returns a copy (not reference)

---

#### Subtask 2.7: Implement reset() Method

**Action:** Implement reset for testing and shutdown.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] All waiting requests are resolved with `acquired: false`
- [ ] All timeouts are cleared
- [ ] Active count reset to 0
- [ ] Active permits set is cleared

---

### Task 3: Implement Helper Functions

**File:** `src/lib/job-queue/concurrency.ts`
**Story Points:** 1
**Dependencies:** Task 2

#### Subtask 3.1: Implement withConcurrencyLimit() Function

**Action:** Create wrapper function for automatic permit management.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] Automatically acquires permit before execution
- [ ] Automatically releases permit after execution (success or failure)
- [ ] Throws `SemaphoreTimeoutError` if permit not acquired
- [ ] Uses generic type for return value

---

#### Subtask 3.2: Implement tryWithConcurrencyLimit() Function

**Action:** Create non-throwing wrapper alternative.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] Returns `null` instead of throwing on timeout
- [ ] Releases permit on success or error
- [ ] Uses generic type for return value

---

### Task 4: Implement Singleton Pattern

**File:** `src/lib/job-queue/concurrency.ts`
**Story Points:** 0.5
**Dependencies:** Task 2

#### Subtask 4.1: Implement Global Instance Management

**Action:** Create singleton pattern for global semaphore.

**Code to implement:**
```typescript
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
- [ ] `getTranslationSemaphore()` returns singleton
- [ ] `createTranslationSemaphore()` creates new instance
- [ ] `resetTranslationSemaphore()` clears singleton and resets state
- [ ] `getSemaphoreStatus()` provides quick status access

---

### Task 5: Integrate with Job Processor

**File:** `src/lib/job-queue/job-processor.ts`
**Story Points:** 0.5
**Dependencies:** Tasks 1-4

#### Subtask 5.1: Add Import Statement

**Action:** Import concurrency functions at top of job-processor.ts.

**Location:** After existing imports in `src/lib/job-queue/job-processor.ts`

**Code to add:**
```typescript
import { withConcurrencyLimit, getSemaphoreStatus } from './concurrency';
```

**Acceptance Criteria:**
- [ ] Import statement added
- [ ] No import errors

---

#### Subtask 5.2: Wrap Translation Calls in processJob Function

**Action:** Modify the `processJob` function to wrap translation calls with concurrency control.

**Location:** Inside `processJob` function, around the translation loop (lines ~468-488)

**Modification:** Replace the existing translation loop:

```typescript
// BEFORE (existing code):
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

// AFTER (with concurrency control):
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
```

**Acceptance Criteria:**
- [ ] Translation loop wrapped in `withConcurrencyLimit`
- [ ] Functionality remains the same
- [ ] Permits are automatically released on success or error
- [ ] No change to return values or error handling

---

### Task 6: Update Module Exports

**File:** `src/lib/job-queue/index.ts`
**Story Points:** 0.25
**Dependencies:** Tasks 1-4

#### Subtask 6.1: Add Concurrency API Exports

**Action:** Export all concurrency control functions and types.

**Code to add at end of `src/lib/job-queue/index.ts`:**
```typescript
// Concurrency control exports (REQ-277 - API throttling)
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
- [ ] All public functions exported
- [ ] All public types exported
- [ ] Constants exported
- [ ] No import/export errors

---

### Task 7: Write Unit Tests

**File:** `src/lib/job-queue/__tests__/concurrency.test.ts`
**Story Points:** 1
**Dependencies:** Tasks 1-4

#### Subtask 7.1: Create Test File with Setup

**Action:** Create test file with imports and setup.

**Code to implement:**
```typescript
/**
 * Unit Tests for Translation Semaphore
 * Part of REQ-277: Implement Concurrency Control
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TranslationSemaphore,
  createTranslationSemaphore,
  withConcurrencyLimit,
  tryWithConcurrencyLimit,
  getTranslationSemaphore,
  resetTranslationSemaphore,
  getSemaphoreStatus,
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

  // Tests follow...
});
```

**Acceptance Criteria:**
- [ ] Test file created at correct path
- [ ] Vitest imports present
- [ ] Setup and teardown configured

---

#### Subtask 7.2: Write acquire() Tests

**Action:** Test permit acquisition scenarios.

**Code to implement:**
```typescript
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

    // Cleanup
    semaphore.reset();
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

    shortSemaphore.reset();
  });
});
```

**Acceptance Criteria:**
- [ ] Test for immediate permit grant
- [ ] Test for multiple permits up to limit
- [ ] Test for queue when limit reached
- [ ] Test for timeout behavior

---

#### Subtask 7.3: Write release() Tests

**Action:** Test permit release scenarios.

**Code to implement:**
```typescript
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
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Should not throw
    expect(() => semaphore.release('unknown-permit')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('decrements active count', async () => {
    const result = await semaphore.acquire();
    expect(semaphore.getStatus().activeCount).toBe(1);

    semaphore.release(result.permitId!);
    expect(semaphore.getStatus().activeCount).toBe(0);
  });
});
```

**Acceptance Criteria:**
- [ ] Test for release allowing waiting request
- [ ] Test for unknown permit handling
- [ ] Test for active count decrement

---

#### Subtask 7.4: Write getStatus() Tests

**Action:** Test status reporting.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] All status fields are correct
- [ ] Timestamp is present

---

#### Subtask 7.5: Write hasAvailablePermits() Tests

**Action:** Test availability check.

**Code to implement:**
```typescript
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
```

**Acceptance Criteria:**
- [ ] Returns true when available
- [ ] Returns false when at capacity

---

#### Subtask 7.6: Write reset() Tests

**Action:** Test reset functionality.

**Code to implement:**
```typescript
describe('reset', () => {
  it('clears all state', async () => {
    await semaphore.acquire();
    await semaphore.acquire();

    semaphore.reset();

    expect(semaphore.getStatus().activeCount).toBe(0);
    expect(semaphore.getStatus().waitingCount).toBe(0);
  });

  it('resolves waiting requests with acquired=false', async () => {
    // Fill permits
    await Promise.all([
      semaphore.acquire(),
      semaphore.acquire(),
      semaphore.acquire(),
    ]);

    // Start waiting request
    const waitingPromise = semaphore.acquire();

    // Give time for queue
    await new Promise(resolve => setTimeout(resolve, 10));

    // Reset
    semaphore.reset();

    // Waiting request should resolve with acquired=false
    const result = await waitingPromise;
    expect(result.acquired).toBe(false);
    expect(result.error).toBe('Semaphore reset');
  });
});
```

**Acceptance Criteria:**
- [ ] State is cleared
- [ ] Waiting requests are resolved

---

#### Subtask 7.7: Write withConcurrencyLimit() Tests

**Action:** Test wrapper function.

**Code to implement:**
```typescript
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
    await withConcurrencyLimit(async () => {
      expect(getSemaphoreStatus().activeCount).toBe(1);
    });

    expect(getSemaphoreStatus().activeCount).toBe(0);
  });

  it('releases permit on error', async () => {
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
- [ ] Function executes and returns result
- [ ] Permit released on success
- [ ] Permit released on error

---

#### Subtask 7.8: Write tryWithConcurrencyLimit() Tests

**Action:** Test non-throwing wrapper.

**Code to implement:**
```typescript
describe('tryWithConcurrencyLimit', () => {
  beforeEach(() => {
    resetTranslationSemaphore();
  });

  afterEach(() => {
    resetTranslationSemaphore();
  });

  it('returns null when permit cannot be acquired', async () => {
    // Create semaphore with short timeout and fill it
    const customSemaphore = createTranslationSemaphore({
      maxConcurrent: 1,
      waitTimeoutMs: 50,
    });

    // Note: tryWithConcurrencyLimit uses global semaphore
    // For this test, we need to test with a full global semaphore
    // This is a limitation - consider if custom semaphore support is needed
  });

  it('executes function when permit available', async () => {
    const result = await tryWithConcurrencyLimit(async () => {
      return 'success';
    });

    expect(result).toBe('success');
  });
});
```

**Acceptance Criteria:**
- [ ] Returns result on success
- [ ] Returns null on timeout (if testable)

---

### Task 8: Verify Build and Tests

**Story Points:** 0.25
**Dependencies:** All previous tasks

#### Subtask 8.1: Run TypeScript Build

**Action:** Verify no TypeScript errors.

**Command:**
```bash
npx tsc --noEmit
```

**Acceptance Criteria:**
- [ ] No TypeScript errors
- [ ] All imports resolve correctly

---

#### Subtask 8.2: Run Unit Tests

**Action:** Execute the new test suite.

**Command:**
```bash
npm run test -- src/lib/job-queue/__tests__/concurrency.test.ts
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] No test failures

---

#### Subtask 8.3: Run Full Test Suite

**Action:** Ensure no regressions.

**Command:**
```bash
npm run test
```

**Acceptance Criteria:**
- [ ] All existing tests still pass
- [ ] New tests pass
- [ ] No regressions introduced

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRANSLATION_MAX_CONCURRENT` | `10` | Maximum concurrent translation API calls |
| `TRANSLATION_CONCURRENCY_TIMEOUT_MS` | `30000` | Timeout for waiting to acquire permit (ms) |

---

## File Summary

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/lib/job-queue/concurrency.ts` | Semaphore-based API concurrency control module |
| `src/lib/job-queue/__tests__/concurrency.test.ts` | Unit tests for concurrency module |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/lib/job-queue/job-processor.ts` | Import concurrency, wrap translation calls |
| `src/lib/job-queue/index.ts` | Export concurrency utilities and types |

---

## Verification Checklist

### Functional Verification

- [ ] Semaphore limits concurrent calls to configured maximum (default 10)
- [ ] Additional requests queue when limit is reached
- [ ] Queued requests proceed when permits are released
- [ ] Timeout mechanism prevents indefinite waiting (default 30s)
- [ ] Permits are released on both success and failure
- [ ] `withConcurrencyLimit` wrapper works correctly
- [ ] Singleton pattern provides global access

### Integration Verification

- [ ] Job processor uses concurrency control for translation calls
- [ ] No import errors in job processor
- [ ] All exports accessible from `@/lib/job-queue`

### Test Verification

- [ ] All unit tests pass
- [ ] Edge cases covered (timeout, double release, unknown permit)
- [ ] No regressions in existing tests

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Permit leaks causing deadlock | Always use `withConcurrencyLimit` wrapper; implement timeout |
| Timeout too short causing failures | Make configurable via environment variable |
| Race conditions | Use atomic state updates; queue-based processing |
| Memory leak in queue | Queue entries cleaned on timeout/release |

---

## References

- **Overview Document:** `docs/REQ-351-implement-concurrency-control-overview.md`
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Definition:** `docs/gen_requests_epic3.md` - REQ-277
- **Pattern Reference - Lock Management:** `src/lib/job-queue/concurrency-control.ts`
- **Pattern Reference - Rate Limiter:** `src/lib/translation-service/utils/rate-limiter.ts`
- **Pattern Reference - Job Processor:** `src/lib/job-queue/job-processor.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Task 3.7: Implement concurrency control for translation API calls*
