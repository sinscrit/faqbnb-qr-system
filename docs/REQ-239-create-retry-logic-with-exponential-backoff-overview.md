# REQ-239: Create Retry Logic with Exponential Backoff - Implementation Overview

**Document Created:** 2026-01-18 23:55 UTC
**Last Modified:** 2026-01-18 23:55 UTC
**Request Reference:** REQ-239 (Translation Service Retry Logic with Exponential Backoff)
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.5

---

## Summary

Create a retry utility for the translation service that automatically retries failed translation requests using exponential backoff with jitter. This utility handles transient failures gracefully by attempting up to 3 retries with increasing delays, while distinguishing between retryable errors (timeouts, 5xx responses) and permanent failures (4xx client errors). The implementation includes jitter to prevent thundering herd problems when multiple clients retry simultaneously.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Simple Retry Logic | `/src/lib/api.ts:440-462` | Basic single retry pattern for visits API with `isRetryable()` check |
| ApiError with isRetryable | `/src/lib/api.ts:634-652` | `ApiError` class with `isRetryable()` method checking 429, 502, 503 status codes |
| Error Classification | `/src/lib/error-utils.ts:134-163` | `classifyError()` function categorizing errors by type and severity |
| HTTP Status Mapping | `/src/lib/api.ts:119-168` | `getErrorMessageForStatus()` and `getErrorCodeForStatus()` helper functions |
| Service Pattern | `/src/lib/email-service.ts:33-187` | MockEmailService with simulated failures and async operations |
| Utility Pattern | `/src/lib/utils.ts` | Pure utility functions with clear JSDoc documentation |

### Dependencies

#### Dependencies Required First

- **REQ-235** (Task 3.1): Translation service module structure and type definitions
  - `/src/lib/translation-service/translation-service.types.ts` must exist with core types
  - `/src/lib/translation-service/index.ts` barrel file for exports

#### No New External Dependencies Required

The retry logic will be implemented using native TypeScript/JavaScript constructs (setTimeout, Promise) without external libraries.

### Target File Location

**File:** `/src/lib/translation-service/utils/retry.ts`

This file will be created as part of the translation-service utils directory structure.

---

## Implementation Tasks

### Task 3.5.1: Define Retry Configuration Types

Define TypeScript interfaces for retry configuration and result tracking.

**File:** `/src/lib/translation-service/utils/retry.ts`

**Type Definitions:**

```typescript
/**
 * Retry Logic with Exponential Backoff
 * Part of REQ-239: Translation Service Retry Logic
 *
 * @module translation-service/utils/retry
 */

/**
 * Configuration options for retry behavior
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in milliseconds for first retry (default: 1000) */
  baseDelayMs: number;
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelayMs: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier: number;
  /** Maximum jitter as percentage of delay (default: 0.25 = 25%) */
  jitterFactor: number;
  /** Function to determine if error is retryable (optional) */
  isRetryable?: (error: unknown) => boolean;
  /** Callback fired before each retry attempt (optional) */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
  /** The successful result if operation succeeded */
  data?: T;
  /** The final error if all retries exhausted */
  error?: Error;
  /** Whether the operation ultimately succeeded */
  success: boolean;
  /** Total number of attempts made (1 = no retries, 2+ = retries occurred) */
  attempts: number;
  /** Total time elapsed in milliseconds */
  totalTimeMs: number;
  /** Individual attempt details */
  attemptDetails: AttemptDetail[];
}

/**
 * Details about a single attempt
 */
export interface AttemptDetail {
  /** Attempt number (1-indexed) */
  attempt: number;
  /** Whether this attempt succeeded */
  success: boolean;
  /** Error if attempt failed */
  error?: Error;
  /** Delay before this attempt (0 for first attempt) */
  delayMs: number;
  /** Duration of this attempt */
  durationMs: number;
}

/**
 * HTTP error with status code for retry determination
 */
export interface HttpError extends Error {
  status?: number;
  code?: string;
}
```

### Task 3.5.2: Implement Retry Helper Functions

Create helper functions for delay calculation, jitter, and error classification.

**File:** `/src/lib/translation-service/utils/retry.ts`

**Implementation Requirements:**

1. **Exponential Delay Calculation**
   - Calculate delay based on attempt number: `baseDelay * (multiplier ^ attempt)`
   - Cap at maximum delay to prevent excessive waits

2. **Jitter Application**
   - Add randomized jitter to prevent thundering herd
   - Jitter should be ±jitterFactor of the calculated delay
   - Use uniform random distribution

3. **Retryable Error Detection**
   - Default to retrying on: timeouts, network errors, 429 (rate limit), 5xx (server errors)
   - Do NOT retry on: 4xx client errors (400, 401, 403, 404, etc.)
   - Allow custom retry function override

**Helper Functions:**

```typescript
/**
 * Default configuration values
 */
const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.25,
};

/**
 * Calculate delay for a given attempt using exponential backoff
 *
 * @param attempt - The retry attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds (without jitter)
 */
export function calculateExponentialDelay(
  attempt: number,
  config: Pick<RetryConfig, 'baseDelayMs' | 'backoffMultiplier' | 'maxDelayMs'>
): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Apply jitter to a delay value to prevent thundering herd
 *
 * @param delayMs - Base delay in milliseconds
 * @param jitterFactor - Maximum jitter as percentage (e.g., 0.25 = ±25%)
 * @returns Delay with jitter applied
 *
 * @example
 * applyJitter(1000, 0.25) // Returns between 750-1250ms
 */
export function applyJitter(delayMs: number, jitterFactor: number): number {
  // Calculate jitter range (±jitterFactor of delay)
  const jitterRange = delayMs * jitterFactor;
  // Random value between -jitterRange and +jitterRange
  const jitter = (Math.random() * 2 - 1) * jitterRange;
  // Ensure delay is never negative
  return Math.max(0, Math.round(delayMs + jitter));
}

/**
 * Calculate the full delay for a retry attempt including jitter
 *
 * @param attempt - The retry attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds with jitter applied
 */
export function calculateRetryDelay(
  attempt: number,
  config: Pick<RetryConfig, 'baseDelayMs' | 'backoffMultiplier' | 'maxDelayMs' | 'jitterFactor'>
): number {
  const baseDelay = calculateExponentialDelay(attempt, config);
  return applyJitter(baseDelay, config.jitterFactor);
}

/**
 * Determine if an error is retryable based on default rules
 *
 * Retryable conditions:
 * - Network errors (fetch failures, timeouts)
 * - Rate limiting (HTTP 429)
 * - Server errors (HTTP 5xx)
 *
 * Non-retryable conditions:
 * - Client errors (HTTP 4xx except 429)
 * - Validation errors
 * - Authentication errors
 *
 * @param error - The error to check
 * @returns true if the error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Null/undefined - not retryable
  if (!error) return false;

  // Check for HTTP status codes
  const httpError = error as HttpError;
  if (typeof httpError.status === 'number') {
    const status = httpError.status;

    // Rate limiting - retryable
    if (status === 429) return true;

    // Server errors (5xx) - retryable
    if (status >= 500 && status < 600) return true;

    // Client errors (4xx except 429) - not retryable
    if (status >= 400 && status < 500) return false;
  }

  // Check for error codes
  if (typeof httpError.code === 'string') {
    const code = httpError.code.toUpperCase();

    // Retryable error codes
    if ([
      'RATE_LIMITED',
      'SERVICE_UNAVAILABLE',
      'BAD_GATEWAY',
      'GATEWAY_TIMEOUT',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
    ].includes(code)) {
      return true;
    }

    // Non-retryable error codes
    if ([
      'BAD_REQUEST',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'VALIDATION_FAILED',
    ].includes(code)) {
      return false;
    }
  }

  // Check error message for network-related patterns
  const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // Network errors - retryable
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('socket hang up') ||
    errorMessage.includes('fetch failed')
  ) {
    return true;
  }

  // Default: assume retryable to be safe
  return true;
}

/**
 * Create a promise that resolves after a delay
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Task 3.5.3: Implement Main Retry Function

Create the primary `withRetry` function that wraps async operations with retry logic.

**File:** `/src/lib/translation-service/utils/retry.ts`

**Implementation Requirements:**

1. **Retry Execution Loop**
   - Execute the operation with configurable max retries
   - Return immediately on success
   - Apply delay before each retry

2. **Error Handling**
   - Check if error is retryable before attempting retry
   - Preserve original error on final failure
   - Log retry attempts for observability

3. **Result Tracking**
   - Track attempt count, timing, and individual attempt details
   - Return comprehensive result object

**Main Function:**

```typescript
/**
 * Execute an async operation with exponential backoff retry logic
 *
 * @param operation - Async function to execute
 * @param config - Retry configuration (partial, merged with defaults)
 * @returns RetryResult containing success status, data/error, and attempt details
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => translateText(request),
 *   { maxRetries: 3, onRetry: (attempt, error) => console.log(`Retry ${attempt}`) }
 * );
 *
 * if (result.success) {
 *   console.log('Translation:', result.data);
 * } else {
 *   console.error('Failed after retries:', result.error);
 * }
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const fullConfig: RetryConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    isRetryable: config.isRetryable ?? isRetryableError,
  };

  const attemptDetails: AttemptDetail[] = [];
  const startTime = Date.now();
  let lastError: Error | undefined;

  // Total attempts = 1 initial + maxRetries
  const totalAttempts = fullConfig.maxRetries + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const isRetry = attempt > 0;
    let delayMs = 0;

    // Apply delay before retry (not before first attempt)
    if (isRetry) {
      delayMs = calculateRetryDelay(attempt - 1, fullConfig);
      await sleep(delayMs);
    }

    const attemptStartTime = Date.now();

    try {
      // Execute the operation
      const data = await operation();

      // Success - record attempt and return
      attemptDetails.push({
        attempt: attempt + 1,
        success: true,
        delayMs,
        durationMs: Date.now() - attemptStartTime,
      });

      return {
        data,
        success: true,
        attempts: attempt + 1,
        totalTimeMs: Date.now() - startTime,
        attemptDetails,
      };
    } catch (error) {
      // Capture error as Error object
      lastError = error instanceof Error ? error : new Error(String(error));

      // Record failed attempt
      attemptDetails.push({
        attempt: attempt + 1,
        success: false,
        error: lastError,
        delayMs,
        durationMs: Date.now() - attemptStartTime,
      });

      // Check if we should retry
      const canRetry = attempt < fullConfig.maxRetries;
      const shouldRetry = canRetry && fullConfig.isRetryable!(error);

      if (shouldRetry) {
        // Calculate next delay for logging
        const nextDelay = calculateRetryDelay(attempt, fullConfig);

        // Fire onRetry callback if provided
        if (fullConfig.onRetry) {
          fullConfig.onRetry(attempt + 1, error, nextDelay);
        }

        // Log retry attempt
        console.warn(
          `[retry] Attempt ${attempt + 1}/${totalAttempts} failed. ` +
          `Retrying in ${nextDelay}ms. Error: ${lastError.message}`
        );

        continue;
      }

      // Not retryable or no retries left - break out of loop
      if (!shouldRetry && canRetry) {
        console.warn(
          `[retry] Attempt ${attempt + 1}/${totalAttempts} failed with non-retryable error: ` +
          lastError.message
        );
      }

      break;
    }
  }

  // All attempts exhausted - return failure result
  return {
    error: lastError,
    success: false,
    attempts: attemptDetails.length,
    totalTimeMs: Date.now() - startTime,
    attemptDetails,
  };
}
```

### Task 3.5.4: Implement Convenience Functions

Create convenience wrapper functions for common retry patterns.

**File:** `/src/lib/translation-service/utils/retry.ts`

**Convenience Functions:**

```typescript
/**
 * Execute an operation with retry and throw on final failure
 *
 * Unlike withRetry which returns a result object, this function
 * throws the final error if all retries are exhausted.
 *
 * @param operation - Async function to execute
 * @param config - Retry configuration
 * @returns The operation result on success
 * @throws The final error if all retries exhausted
 *
 * @example
 * ```typescript
 * try {
 *   const translation = await retryOperation(
 *     () => translateText(request),
 *     { maxRetries: 3 }
 *   );
 * } catch (error) {
 *   console.error('Translation failed after all retries:', error);
 * }
 * ```
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const result = await withRetry(operation, config);

  if (result.success) {
    return result.data!;
  }

  // Enhance error with retry information
  const error = result.error || new Error('Operation failed after retries');
  (error as any).retryAttempts = result.attempts;
  (error as any).totalTimeMs = result.totalTimeMs;

  throw error;
}

/**
 * Create a retry-wrapped version of an async function
 *
 * @param fn - Async function to wrap
 * @param config - Retry configuration
 * @returns Wrapped function that will retry on failure
 *
 * @example
 * ```typescript
 * const robustTranslate = withRetryWrapper(translateText, { maxRetries: 3 });
 * const result = await robustTranslate(request);
 * ```
 */
export function withRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: Partial<RetryConfig> = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    return retryOperation(() => fn(...args), config);
  };
}

/**
 * Retry configuration presets for common use cases
 */
export const RetryPresets = {
  /** Standard retry for API calls: 3 retries, 1s base delay */
  standard: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.25,
  } as RetryConfig,

  /** Aggressive retry for critical operations: 5 retries, 500ms base delay */
  aggressive: {
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
    jitterFactor: 0.3,
  } as RetryConfig,

  /** Conservative retry for rate-limited APIs: 3 retries, 2s base delay */
  conservative: {
    maxRetries: 3,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 3,
    jitterFactor: 0.4,
  } as RetryConfig,

  /** Quick retry for fast-failing operations: 2 retries, 100ms base delay */
  quick: {
    maxRetries: 2,
    baseDelayMs: 100,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
  } as RetryConfig,
} as const;
```

### Task 3.5.5: Create Unit Tests

Create comprehensive unit tests for the retry utility.

**File:** `/src/lib/translation-service/utils/__tests__/retry.test.ts`

**Test Cases:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  retryOperation,
  withRetryWrapper,
  calculateExponentialDelay,
  applyJitter,
  calculateRetryDelay,
  isRetryableError,
  sleep,
  RetryPresets,
} from '../retry';

describe('retry utility', () => {
  describe('calculateExponentialDelay', () => {
    it('should calculate correct delay for each attempt', () => {
      const config = { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 30000 };

      expect(calculateExponentialDelay(0, config)).toBe(1000);  // 1000 * 2^0
      expect(calculateExponentialDelay(1, config)).toBe(2000);  // 1000 * 2^1
      expect(calculateExponentialDelay(2, config)).toBe(4000);  // 1000 * 2^2
      expect(calculateExponentialDelay(3, config)).toBe(8000);  // 1000 * 2^3
    });

    it('should cap delay at maxDelayMs', () => {
      const config = { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 5000 };

      expect(calculateExponentialDelay(0, config)).toBe(1000);
      expect(calculateExponentialDelay(10, config)).toBe(5000); // Capped
    });
  });

  describe('applyJitter', () => {
    it('should return value within jitter range', () => {
      const baseDelay = 1000;
      const jitterFactor = 0.25;

      // Run multiple times to verify randomness stays in range
      for (let i = 0; i < 100; i++) {
        const result = applyJitter(baseDelay, jitterFactor);
        expect(result).toBeGreaterThanOrEqual(750);  // 1000 - 25%
        expect(result).toBeLessThanOrEqual(1250);    // 1000 + 25%
      }
    });

    it('should never return negative delay', () => {
      for (let i = 0; i < 100; i++) {
        const result = applyJitter(100, 0.99);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('isRetryableError', () => {
    it('should return true for rate limit errors (429)', () => {
      expect(isRetryableError({ status: 429, message: 'Rate limited' })).toBe(true);
    });

    it('should return true for server errors (5xx)', () => {
      expect(isRetryableError({ status: 500, message: 'Server error' })).toBe(true);
      expect(isRetryableError({ status: 502, message: 'Bad gateway' })).toBe(true);
      expect(isRetryableError({ status: 503, message: 'Service unavailable' })).toBe(true);
    });

    it('should return false for client errors (4xx except 429)', () => {
      expect(isRetryableError({ status: 400, message: 'Bad request' })).toBe(false);
      expect(isRetryableError({ status: 401, message: 'Unauthorized' })).toBe(false);
      expect(isRetryableError({ status: 403, message: 'Forbidden' })).toBe(false);
      expect(isRetryableError({ status: 404, message: 'Not found' })).toBe(false);
    });

    it('should return true for network error messages', () => {
      expect(isRetryableError(new Error('network error'))).toBe(true);
      expect(isRetryableError(new Error('Request timeout'))).toBe(true);
      expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
      expect(isRetryableError(new Error('fetch failed'))).toBe(true);
    });

    it('should return true for retryable error codes', () => {
      expect(isRetryableError({ code: 'RATE_LIMITED' })).toBe(true);
      expect(isRetryableError({ code: 'SERVICE_UNAVAILABLE' })).toBe(true);
      expect(isRetryableError({ code: 'ECONNRESET' })).toBe(true);
    });

    it('should return false for non-retryable error codes', () => {
      expect(isRetryableError({ code: 'BAD_REQUEST' })).toBe(false);
      expect(isRetryableError({ code: 'VALIDATION_FAILED' })).toBe(false);
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should succeed on first attempt without retry', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const resultPromise = withRetry(operation);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error and succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Server error' })
        .mockResolvedValue('success');

      const resultPromise = withRetry(operation, { maxRetries: 3, baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = vi.fn()
        .mockRejectedValue({ status: 400, message: 'Bad request' });

      const resultPromise = withRetry(operation, { maxRetries: 3 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should exhaust all retries and fail', async () => {
      const operation = vi.fn()
        .mockRejectedValue({ status: 500, message: 'Server error' });

      const resultPromise = withRetry(operation, { maxRetries: 3, baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(4); // 1 initial + 3 retries
      expect(operation).toHaveBeenCalledTimes(4);
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const operation = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Error' })
        .mockResolvedValue('success');

      const resultPromise = withRetry(operation, {
        maxRetries: 3,
        baseDelayMs: 100,
        onRetry,
      });
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Object), expect.any(Number));
    });

    it('should track attempt details', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Error 1' })
        .mockRejectedValueOnce({ status: 500, message: 'Error 2' })
        .mockResolvedValue('success');

      const resultPromise = withRetry(operation, { maxRetries: 3, baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.attemptDetails).toHaveLength(3);
      expect(result.attemptDetails[0].success).toBe(false);
      expect(result.attemptDetails[0].delayMs).toBe(0); // No delay on first attempt
      expect(result.attemptDetails[1].success).toBe(false);
      expect(result.attemptDetails[1].delayMs).toBeGreaterThan(0);
      expect(result.attemptDetails[2].success).toBe(true);
    });

    it('should use custom isRetryable function', async () => {
      const customIsRetryable = vi.fn().mockReturnValue(false);
      const operation = vi.fn().mockRejectedValue(new Error('Custom error'));

      const resultPromise = withRetry(operation, {
        maxRetries: 3,
        isRetryable: customIsRetryable,
      });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.attempts).toBe(1);
      expect(customIsRetryable).toHaveBeenCalled();
    });
  });

  describe('retryOperation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return data on success', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const resultPromise = retryOperation(operation);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
    });

    it('should throw on failure after retries', async () => {
      const operation = vi.fn()
        .mockRejectedValue({ status: 500, message: 'Server error' });

      const resultPromise = retryOperation(operation, { maxRetries: 2, baseDelayMs: 100 });
      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toMatchObject({
        message: 'Server error',
        retryAttempts: 3,
      });
    });
  });

  describe('withRetryWrapper', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create a wrapped function with retry', async () => {
      const originalFn = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Error' })
        .mockResolvedValue('wrapped result');

      const wrappedFn = withRetryWrapper(originalFn, { maxRetries: 3, baseDelayMs: 100 });

      const resultPromise = wrappedFn('arg1', 'arg2');
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('wrapped result');
      expect(originalFn).toHaveBeenCalledTimes(2);
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('RetryPresets', () => {
    it('should have standard preset', () => {
      expect(RetryPresets.standard.maxRetries).toBe(3);
      expect(RetryPresets.standard.baseDelayMs).toBe(1000);
    });

    it('should have aggressive preset', () => {
      expect(RetryPresets.aggressive.maxRetries).toBe(5);
      expect(RetryPresets.aggressive.baseDelayMs).toBe(500);
    });

    it('should have conservative preset', () => {
      expect(RetryPresets.conservative.maxRetries).toBe(3);
      expect(RetryPresets.conservative.baseDelayMs).toBe(2000);
    });

    it('should have quick preset', () => {
      expect(RetryPresets.quick.maxRetries).toBe(2);
      expect(RetryPresets.quick.baseDelayMs).toBe(100);
    });
  });
});
```

### Task 3.5.6: Update Module Exports

Update the translation service barrel file to export the retry utilities.

**File:** `/src/lib/translation-service/index.ts` (modify/create)

**Add exports:**

```typescript
// Export retry utilities
export {
  withRetry,
  retryOperation,
  withRetryWrapper,
  calculateExponentialDelay,
  applyJitter,
  calculateRetryDelay,
  isRetryableError,
  sleep,
  RetryPresets,
} from './utils/retry';
export type {
  RetryConfig,
  RetryResult,
  AttemptDetail,
  HttpError,
} from './utils/retry';
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/utils/retry.ts` | Retry utility with exponential backoff |
| `/src/lib/translation-service/utils/__tests__/retry.test.ts` | Unit tests for retry utility |

### Directories to Create (if not existing)

| Directory Path | Purpose |
|----------------|---------|
| `/src/lib/translation-service/` | Translation service module |
| `/src/lib/translation-service/utils/` | Utility functions |
| `/src/lib/translation-service/utils/__tests__/` | Test files |

### Existing Files to Modify

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/translation-service/index.ts` | Exports | Add retry utility exports (create if not exists) |

### Files NOT to Modify

- `/src/lib/api.ts` - Has its own retry logic, keep separate
- `/src/lib/error-utils.ts` - Error classification is different use case
- `/src/lib/translation-service/utils/rate-limiter.ts` - Separate task (Task 3.4)
- `/src/lib/translation-service/providers/*` - Use retry but don't modify
- `/src/lib/translation-service/translation-service.ts` - Main wrapper, separate task (Task 3.6)

---

## Implementation Order

1. **Create directory structure** - Ensure `/src/lib/translation-service/utils/` exists
2. **Define types** (Task 3.5.1) - Add configuration and result types
3. **Implement helpers** (Task 3.5.2) - Delay calculation, jitter, error classification
4. **Implement main retry function** (Task 3.5.3) - Core `withRetry` function
5. **Implement convenience functions** (Task 3.5.4) - `retryOperation`, `withRetryWrapper`, presets
6. **Write tests** (Task 3.5.5) - Create unit test file
7. **Update exports** (Task 3.5.6) - Add to barrel file

---

## Acceptance Criteria Verification

| Criteria (from REQ-239) | Implementation Verification |
|-------------------------|----------------------------|
| Failed translation requests are automatically retried up to three times | `withRetry()` with `maxRetries: 3` default (1 initial + 3 retries = 4 attempts) |
| Delay between retries increases exponentially with each attempt | `calculateExponentialDelay()` uses `baseDelay * 2^attempt` formula |
| Random jitter is added to retry delays to prevent synchronized retry storms | `applyJitter()` applies ±jitterFactor randomization to calculated delay |
| Retry logic distinguishes between retryable errors (timeouts, 5xx) and permanent failures (4xx client errors) | `isRetryableError()` checks status codes: returns true for 429/5xx, false for 4xx |
| After all retries are exhausted, the original error is surfaced to the caller | `RetryResult.error` contains last error; `retryOperation()` throws it |
| Retry attempts and outcomes are logged for observability | `console.warn()` logs each retry attempt with error details; `onRetry` callback available |

---

## Dependencies

### Depends On (Completed First)

- **REQ-235** (Task 3.1): Translation service module structure
  - Directory structure at `/src/lib/translation-service/`
  - Barrel file `/src/lib/translation-service/index.ts`

### Used By (Requires This First)

- **Task 3.2** (REQ-236): Claude translation provider - Can wrap API calls with retry
- **Task 3.3** (REQ-237): OpenAI translation provider - Can wrap API calls with retry
- **Task 3.6**: Main translation service wrapper - Uses retry for translation calls

---

## Testing Strategy

### Unit Tests

Cover the following scenarios:

1. **Delay calculation**: Exponential backoff formula correctness
2. **Jitter application**: Values stay within expected range
3. **Error classification**: Correct retryable/non-retryable determination
4. **Success on first attempt**: No retry delay applied
5. **Retry on retryable error**: Delay applied, operation retried
6. **No retry on non-retryable error**: Immediate failure return
7. **All retries exhausted**: Correct attempt count, error preserved
8. **Callback invocation**: `onRetry` called with correct parameters
9. **Attempt details**: Correct tracking of each attempt
10. **Presets**: Correct configuration values

### Integration Testing

Integration tests should be performed as part of translation provider testing:

1. Real API calls with transient failures trigger retries
2. Permanent failures (401, 400) do not trigger retries
3. Rate limit errors (429) trigger retry with appropriate backoff
4. Multiple concurrent operations maintain independent retry state

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Retrying non-idempotent operations | Low | Medium | Document that wrapped operations should be idempotent |
| Excessive delay for fast failures | Low | Low | `quick` preset for fast-failing operations |
| Timer memory leaks | Low | Low | Use standard setTimeout/Promise; no cleanup needed |
| Jitter causing negative delays | Very Low | Low | `Math.max(0, ...)` ensures non-negative delays |
| Logging too verbose | Medium | Low | Only warn on retries, not on success |

---

## Estimated Effort

**Complexity:** Medium
**Estimated Time:** 2-3 hours

| Sub-task | Time |
|----------|------|
| Create directory structure | 5 min |
| Define types | 20 min |
| Implement helper functions | 30 min |
| Implement main retry function | 45 min |
| Implement convenience functions | 20 min |
| Write unit tests | 45 min |
| Update exports | 5 min |

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Default max retries | 3 | Industry standard; balances reliability with latency |
| Base delay | 1000ms | Reasonable starting point; not too aggressive |
| Backoff multiplier | 2 | Standard exponential backoff factor |
| Jitter approach | ±percentage of delay | Decorrelates retry times effectively |
| Error classification | Status code + message pattern matching | Comprehensive coverage of common error types |
| Return type | `RetryResult` object | Provides full observability; `retryOperation` for throw-on-fail |
| Logging | console.warn | Appropriate severity for retries; easy to filter |

---

## Usage Examples

### Basic Usage

```typescript
import { withRetry } from '@/lib/translation-service';

const result = await withRetry(
  () => translateText({ text: 'Hello', targetLanguage: 'fr' }),
  { maxRetries: 3 }
);

if (result.success) {
  console.log('Translation:', result.data);
} else {
  console.error('Failed:', result.error?.message);
  console.error('Attempts made:', result.attempts);
}
```

### Throw-on-Failure Pattern

```typescript
import { retryOperation } from '@/lib/translation-service';

try {
  const translation = await retryOperation(
    () => translateText(request),
    { maxRetries: 3 }
  );
  console.log('Translation:', translation);
} catch (error) {
  console.error('Translation failed after all retries:', error);
}
```

### Using Presets

```typescript
import { retryOperation, RetryPresets } from '@/lib/translation-service';

// Use conservative preset for rate-limited APIs
const translation = await retryOperation(
  () => translateText(request),
  RetryPresets.conservative
);
```

### Custom Retry Logic

```typescript
import { withRetry } from '@/lib/translation-service';

const result = await withRetry(
  () => translateText(request),
  {
    maxRetries: 5,
    baseDelayMs: 500,
    isRetryable: (error) => {
      // Custom retry logic: only retry on specific error codes
      return error?.code === 'RATE_LIMITED';
    },
    onRetry: (attempt, error, delay) => {
      // Log to monitoring service
      logger.warn('Translation retry', { attempt, error, delay });
    },
  }
);
```

### Wrapping Functions

```typescript
import { withRetryWrapper, RetryPresets } from '@/lib/translation-service';

// Create a retry-enabled version of the translate function
const robustTranslate = withRetryWrapper(translateText, RetryPresets.standard);

// Use like a normal function - retries are automatic
const translation = await robustTranslate({ text: 'Hello', targetLanguage: 'es' });
```

---

## Delay Examples

With default configuration (`baseDelayMs: 1000`, `backoffMultiplier: 2`, `jitterFactor: 0.25`):

| Attempt | Base Delay | With Jitter (approx) |
|---------|------------|---------------------|
| 1 (initial) | 0ms | 0ms |
| 2 (retry 1) | 1000ms | 750-1250ms |
| 3 (retry 2) | 2000ms | 1500-2500ms |
| 4 (retry 3) | 4000ms | 3000-5000ms |

Total potential wait time: 6-8.75 seconds before final failure (excluding operation time).

---

## Notes

- The retry utility is generic and can be used for any async operation, not just translation
- Jitter is critical for preventing thundering herd problems in distributed systems
- The `onRetry` callback enables custom logging/metrics without modifying retry logic
- Consider circuit breaker pattern for sustained failures (future enhancement)
- Tests use `vi.useFakeTimers()` to avoid actual delays during testing

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.5*
