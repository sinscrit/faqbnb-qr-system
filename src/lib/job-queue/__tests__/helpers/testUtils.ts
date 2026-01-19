/**
 * Test Utility Functions for Job Queue Integration Tests
 *
 * Provides helper functions for async operations, waiting,
 * and common test patterns.
 *
 * @module job-queue/__tests__/helpers/testUtils
 * @lastModified 2026-01-18
 */

import type { TranslationJob, JobStatus } from '../../translation-jobs.types';

/**
 * Delays execution for a specified number of milliseconds.
 * Useful for simulating async operations in tests.
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Waits for a job to reach a specific status with timeout.
 * Polls the job function at regular intervals.
 *
 * @param getJobFn - Async function that retrieves the current job state
 * @param expectedStatus - The status to wait for
 * @param timeoutMs - Maximum time to wait (default: 5000ms)
 * @param intervalMs - Polling interval (default: 100ms)
 * @throws Error if timeout is reached before status is achieved
 */
export async function waitForJobStatus(
  getJobFn: () => Promise<TranslationJob | null>,
  expectedStatus: JobStatus,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<TranslationJob | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const job = await getJobFn();
    if (job && job.status === expectedStatus) {
      return job;
    }
    await delay(intervalMs);
  }

  throw new Error(`Job did not reach status '${expectedStatus}' within ${timeoutMs}ms`);
}

/**
 * Waits for a condition to become true with timeout.
 * More generic than waitForJobStatus.
 */
export async function waitForCondition(
  conditionFn: () => Promise<boolean> | boolean,
  timeoutMs: number = 5000,
  intervalMs: number = 100,
  errorMessage?: string
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const result = await conditionFn();
    if (result) {
      return;
    }
    await delay(intervalMs);
  }

  throw new Error(errorMessage || `Condition not met within ${timeoutMs}ms`);
}

/**
 * Creates a timer that tracks elapsed time for performance assertions.
 */
export function createTimer() {
  const startTime = Date.now();

  return {
    elapsed: () => Date.now() - startTime,
    hasExceeded: (maxMs: number) => Date.now() - startTime > maxMs,
  };
}

/**
 * Runs a function multiple times concurrently and collects results.
 * Useful for testing concurrent operations.
 */
export async function runConcurrently<T>(
  fn: (index: number) => Promise<T>,
  count: number
): Promise<T[]> {
  const promises = Array.from({ length: count }, (_, index) => fn(index));
  return Promise.all(promises);
}

/**
 * Runs functions in sequence with optional delay between each.
 */
export async function runSequentially<T>(
  fns: (() => Promise<T>)[],
  delayMs: number = 0
): Promise<T[]> {
  const results: T[] = [];

  for (const fn of fns) {
    results.push(await fn());
    if (delayMs > 0) {
      await delay(delayMs);
    }
  }

  return results;
}

/**
 * Creates a mock function that tracks call order across multiple mocks.
 * Useful for verifying operation sequences.
 */
export function createOrderTracker() {
  const callOrder: string[] = [];

  return {
    track: (name: string) => {
      callOrder.push(name);
    },
    getOrder: () => [...callOrder],
    wasCalledBefore: (first: string, second: string) => {
      const firstIndex = callOrder.indexOf(first);
      const secondIndex = callOrder.indexOf(second);
      return firstIndex !== -1 && secondIndex !== -1 && firstIndex < secondIndex;
    },
    reset: () => {
      callOrder.length = 0;
    },
  };
}

/**
 * Generates a unique worker ID for testing concurrent workers.
 */
export function generateWorkerId(prefix: string = 'worker'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Asserts that an array contains unique values only.
 */
export function assertAllUnique<T>(arr: T[], getKey?: (item: T) => string): boolean {
  const keys = getKey ? arr.map(getKey) : arr.map(String);
  const uniqueKeys = new Set(keys);
  return uniqueKeys.size === arr.length;
}

/**
 * Creates a controlled promise that can be resolved/rejected externally.
 * Useful for testing async coordination.
 */
export function createDeferredPromise<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
