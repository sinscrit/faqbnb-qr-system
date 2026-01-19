# REQ-239: Create Retry Logic with Exponential Backoff - Detailed Task Breakdown

**Document Created:** 2026-01-18 23:58 UTC
**Last Modified:** 2026-01-19 14:08 UTC
**Request Reference:** REQ-239 (Translation Service Retry Logic with Exponential Backoff)
**Overview Document:** REQ-239-create-retry-logic-with-exponential-backoff-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.5

---

## Summary

Create a retry utility for the translation service that automatically retries failed translation requests using exponential backoff with jitter. This utility handles transient failures gracefully by attempting up to 3 retries with increasing delays, while distinguishing between retryable errors (timeouts, 5xx responses) and permanent failures (4xx client errors). The implementation includes jitter to prevent thundering herd problems when multiple clients retry simultaneously.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] **REQ-235 Completed**: Translation service module structure exists at `/src/lib/translation-service/`
- [x] **Directory Exists**: `/src/lib/translation-service/utils/` directory exists (create if not)
- [x] **Types File Exists**: Core types defined in translation-service.types.ts (or will be created)

---

## Task Breakdown

### Task 3.5.1: Create Directory Structure and Type Definitions

**Priority:** High (Blocking)
**Estimated Effort:** 1 story point
**Dependencies:** REQ-235 (translation service module structure)

#### Objective
Create the retry utility file with TypeScript interfaces for retry configuration and result tracking.

#### Implementation Steps

1. **Verify/Create Directory Structure**
   ```
   /src/lib/translation-service/
   └── utils/
       └── retry.ts
   ```

2. **Create `/src/lib/translation-service/utils/retry.ts`** with the following type definitions:

```typescript
/**
 * Retry Logic with Exponential Backoff
 * Part of REQ-239: Translation Service Retry Logic
 *
 * Provides retry functionality for async operations with:
 * - Exponential backoff delay calculation
 * - Jitter to prevent thundering herd
 * - Configurable retry policies
 * - Comprehensive result tracking
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

#### Acceptance Criteria
- [x] File `/src/lib/translation-service/utils/retry.ts` exists
- [x] All four interfaces are defined: `RetryConfig`, `RetryResult`, `AttemptDetail`, `HttpError`
- [x] JSDoc comments provide clear documentation for each interface and property
- [x] TypeScript compiles without errors

#### Verification Command
```bash
npx tsc --noEmit src/lib/translation-service/utils/retry.ts
```

---

### Task 3.5.2: Implement Default Configuration and Delay Calculation Functions

**Priority:** High (Blocking)
**Estimated Effort:** 1 story point
**Dependencies:** Task 3.5.1

#### Objective
Create helper functions for delay calculation, jitter application, and default configuration.

#### Implementation Steps

Add the following to `/src/lib/translation-service/utils/retry.ts`:

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
 * Formula: baseDelay * (multiplier ^ attempt)
 * Result is capped at maxDelayMs to prevent excessive waits
 *
 * @param attempt - The retry attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds (without jitter)
 *
 * @example
 * // With baseDelayMs=1000, multiplier=2:
 * calculateExponentialDelay(0, config) // 1000ms
 * calculateExponentialDelay(1, config) // 2000ms
 * calculateExponentialDelay(2, config) // 4000ms
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
 * Jitter adds randomness to prevent multiple clients from retrying
 * simultaneously after a shared failure. Uses uniform distribution
 * within ±jitterFactor of the base delay.
 *
 * @param delayMs - Base delay in milliseconds
 * @param jitterFactor - Maximum jitter as percentage (e.g., 0.25 = ±25%)
 * @returns Delay with jitter applied (never negative)
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
 * Combines exponential backoff calculation with jitter application.
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
 * Create a promise that resolves after a delay
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### Acceptance Criteria
- [x] `DEFAULT_CONFIG` constant defined with standard values (maxRetries: 3, baseDelayMs: 1000, etc.)
- [x] `calculateExponentialDelay()` correctly implements exponential formula
- [x] `calculateExponentialDelay()` caps delay at maxDelayMs
- [x] `applyJitter()` returns values within expected range (±jitterFactor)
- [x] `applyJitter()` never returns negative values
- [x] `calculateRetryDelay()` combines exponential delay with jitter
- [x] `sleep()` utility function works correctly

#### Test Cases to Verify
```typescript
// Exponential delay
expect(calculateExponentialDelay(0, { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 30000 })).toBe(1000);
expect(calculateExponentialDelay(1, { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 30000 })).toBe(2000);
expect(calculateExponentialDelay(10, { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 5000 })).toBe(5000); // capped

// Jitter (run multiple times)
const result = applyJitter(1000, 0.25);
expect(result).toBeGreaterThanOrEqual(750);
expect(result).toBeLessThanOrEqual(1250);
```

---

### Task 3.5.3: Implement Retryable Error Detection Function

**Priority:** High (Blocking)
**Estimated Effort:** 1 story point
**Dependencies:** Task 3.5.1

#### Objective
Create the `isRetryableError()` function that determines if an error should trigger a retry.

#### Implementation Steps

Add to `/src/lib/translation-service/utils/retry.ts`:

```typescript
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
  // Null/undefined - not retryable (shouldn't happen but be safe)
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

  // Check for error codes (consistent with existing ApiError pattern in /src/lib/api.ts)
  if (typeof httpError.code === 'string') {
    const code = httpError.code.toUpperCase();

    // Retryable error codes
    const retryableCodes = [
      'RATE_LIMITED',
      'SERVICE_UNAVAILABLE',
      'BAD_GATEWAY',
      'GATEWAY_TIMEOUT',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
    ];
    if (retryableCodes.includes(code)) {
      return true;
    }

    // Non-retryable error codes
    const nonRetryableCodes = [
      'BAD_REQUEST',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'VALIDATION_FAILED',
    ];
    if (nonRetryableCodes.includes(code)) {
      return false;
    }
  }

  // Check error message for network-related patterns
  const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // Network errors - retryable
  const networkPatterns = [
    'network',
    'timeout',
    'econnreset',
    'socket hang up',
    'fetch failed',
    'connection refused',
    'dns',
  ];

  if (networkPatterns.some(pattern => errorMessage.includes(pattern))) {
    return true;
  }

  // Default: assume retryable to be safe (fail-safe approach)
  return true;
}
```

#### Acceptance Criteria
- [x] Returns `true` for HTTP 429 (rate limit)
- [x] Returns `true` for HTTP 5xx (500, 502, 503, 504)
- [x] Returns `false` for HTTP 4xx (400, 401, 403, 404) except 429
- [x] Returns `true` for network error messages (timeout, connection refused, etc.)
- [x] Returns `true` for retryable error codes (ECONNRESET, ETIMEDOUT, etc.)
- [x] Returns `false` for non-retryable error codes (UNAUTHORIZED, BAD_REQUEST, etc.)
- [x] Defaults to `true` for unknown errors (fail-safe)
- [x] Aligns with existing `isRetryable()` pattern in `/src/lib/api.ts:650-652`

#### Test Cases to Verify
```typescript
// HTTP status codes
expect(isRetryableError({ status: 429, message: 'Rate limited' })).toBe(true);
expect(isRetryableError({ status: 500, message: 'Server error' })).toBe(true);
expect(isRetryableError({ status: 502, message: 'Bad gateway' })).toBe(true);
expect(isRetryableError({ status: 400, message: 'Bad request' })).toBe(false);
expect(isRetryableError({ status: 401, message: 'Unauthorized' })).toBe(false);

// Error codes
expect(isRetryableError({ code: 'ECONNRESET' })).toBe(true);
expect(isRetryableError({ code: 'ETIMEDOUT' })).toBe(true);
expect(isRetryableError({ code: 'BAD_REQUEST' })).toBe(false);

// Error messages
expect(isRetryableError(new Error('network error'))).toBe(true);
expect(isRetryableError(new Error('Request timeout'))).toBe(true);
```

---

### Task 3.5.4: Implement Main `withRetry` Function

**Priority:** High (Blocking)
**Estimated Effort:** 2 story points
**Dependencies:** Tasks 3.5.1, 3.5.2, 3.5.3

#### Objective
Create the primary `withRetry()` function that wraps async operations with retry logic.

#### Implementation Steps

Add to `/src/lib/translation-service/utils/retry.ts`:

```typescript
/**
 * Execute an async operation with exponential backoff retry logic
 *
 * Automatically retries failed operations based on error type and
 * configuration. Returns a comprehensive result object with success
 * status, data/error, and detailed attempt information.
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

        // Log retry attempt for observability (REQ-239 acceptance criteria)
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

#### Acceptance Criteria
- [x] Returns immediately on first success without retry delay
- [x] Retries up to maxRetries times on retryable errors
- [x] Does not retry on non-retryable errors
- [x] Applies exponential delay between retries
- [x] Calls `onRetry` callback before each retry
- [x] Logs retry attempts with `console.warn()` for observability
- [x] Tracks all attempt details including timing
- [x] Returns comprehensive `RetryResult` with error, attempts, and timing
- [x] Preserves original error in result on final failure

#### Test Cases to Verify
```typescript
// Success on first attempt
const successOp = vi.fn().mockResolvedValue('success');
const result1 = await withRetry(successOp);
expect(result1.success).toBe(true);
expect(result1.attempts).toBe(1);
expect(successOp).toHaveBeenCalledTimes(1);

// Success after retry
const retryOp = vi.fn()
  .mockRejectedValueOnce({ status: 500 })
  .mockResolvedValue('success');
const result2 = await withRetry(retryOp, { maxRetries: 3, baseDelayMs: 10 });
expect(result2.success).toBe(true);
expect(result2.attempts).toBe(2);

// Failure - non-retryable
const nonRetryableOp = vi.fn().mockRejectedValue({ status: 400 });
const result3 = await withRetry(nonRetryableOp);
expect(result3.success).toBe(false);
expect(result3.attempts).toBe(1);

// Failure - all retries exhausted
const alwaysFailOp = vi.fn().mockRejectedValue({ status: 500 });
const result4 = await withRetry(alwaysFailOp, { maxRetries: 2, baseDelayMs: 10 });
expect(result4.success).toBe(false);
expect(result4.attempts).toBe(3); // 1 initial + 2 retries
```

---

### Task 3.5.5: Implement Convenience Functions and Presets

**Priority:** Medium
**Estimated Effort:** 1 story point
**Dependencies:** Task 3.5.4

#### Objective
Create convenience wrapper functions for common retry patterns and predefined configuration presets.

#### Implementation Steps

Add to `/src/lib/translation-service/utils/retry.ts`:

```typescript
/**
 * Execute an operation with retry and throw on final failure
 *
 * Unlike withRetry which returns a result object, this function
 * throws the final error if all retries are exhausted. Use this
 * when you want standard try/catch error handling.
 *
 * @param operation - Async function to execute
 * @param config - Retry configuration
 * @returns The operation result on success
 * @throws The final error if all retries exhausted (with retryAttempts metadata)
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

  // Enhance error with retry information for debugging
  const error = result.error || new Error('Operation failed after retries');
  (error as any).retryAttempts = result.attempts;
  (error as any).totalTimeMs = result.totalTimeMs;

  throw error;
}

/**
 * Create a retry-wrapped version of an async function
 *
 * Returns a new function with the same signature that automatically
 * retries on transient failures. Useful for wrapping existing functions.
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
 *
 * Use these presets as starting points for retry configuration.
 * They can be extended or overridden as needed.
 */
export const RetryPresets = {
  /**
   * Standard retry for API calls: 3 retries, 1s base delay
   * Good default for most translation operations
   */
  standard: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.25,
  } as RetryConfig,

  /**
   * Aggressive retry for critical operations: 5 retries, 500ms base delay
   * Use when reliability is critical and latency is less important
   */
  aggressive: {
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
    jitterFactor: 0.3,
  } as RetryConfig,

  /**
   * Conservative retry for rate-limited APIs: 3 retries, 2s base delay
   * Use when dealing with strict rate limits (e.g., Claude API)
   */
  conservative: {
    maxRetries: 3,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 3,
    jitterFactor: 0.4,
  } as RetryConfig,

  /**
   * Quick retry for fast-failing operations: 2 retries, 100ms base delay
   * Use for operations that should fail quickly if not working
   */
  quick: {
    maxRetries: 2,
    baseDelayMs: 100,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
  } as RetryConfig,
} as const;
```

#### Acceptance Criteria
- [x] `retryOperation()` returns data on success
- [x] `retryOperation()` throws error with `retryAttempts` metadata on failure
- [x] `withRetryWrapper()` creates a wrapped function with retry behavior
- [x] `withRetryWrapper()` preserves function arguments
- [x] `RetryPresets.standard` has expected default values
- [x] `RetryPresets.aggressive` has higher maxRetries (5)
- [x] `RetryPresets.conservative` has longer baseDelayMs (2s)
- [x] `RetryPresets.quick` has shorter delays for fast-fail scenarios
- [x] All presets are typed as `RetryConfig`

#### Test Cases to Verify
```typescript
// retryOperation - success
const result = await retryOperation(() => Promise.resolve('success'));
expect(result).toBe('success');

// retryOperation - failure
await expect(
  retryOperation(() => Promise.reject({ status: 500 }), { maxRetries: 0 })
).rejects.toMatchObject({ retryAttempts: 1 });

// withRetryWrapper
const original = vi.fn().mockResolvedValue('wrapped');
const wrapped = withRetryWrapper(original, { maxRetries: 3 });
const result = await wrapped('arg1', 'arg2');
expect(result).toBe('wrapped');
expect(original).toHaveBeenCalledWith('arg1', 'arg2');

// Presets
expect(RetryPresets.standard.maxRetries).toBe(3);
expect(RetryPresets.aggressive.maxRetries).toBe(5);
expect(RetryPresets.conservative.baseDelayMs).toBe(2000);
expect(RetryPresets.quick.maxRetries).toBe(2);
```

---

### Task 3.5.6: Create Unit Tests

**Priority:** High
**Estimated Effort:** 2 story points
**Dependencies:** Tasks 3.5.1-3.5.5

#### Objective
Create comprehensive unit tests for the retry utility following project testing patterns.

#### Implementation Steps

1. **Create test directory if not exists:**
   ```
   /src/lib/translation-service/utils/__tests__/
   ```

2. **Create `/src/lib/translation-service/utils/__tests__/retry.test.ts`:**

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

describe('retry utility (REQ-239)', () => {
  describe('calculateExponentialDelay', () => {
    const config = { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 30000 };

    it('should calculate correct delay for each attempt', () => {
      expect(calculateExponentialDelay(0, config)).toBe(1000);  // 1000 * 2^0
      expect(calculateExponentialDelay(1, config)).toBe(2000);  // 1000 * 2^1
      expect(calculateExponentialDelay(2, config)).toBe(4000);  // 1000 * 2^2
      expect(calculateExponentialDelay(3, config)).toBe(8000);  // 1000 * 2^3
    });

    it('should cap delay at maxDelayMs', () => {
      const cappedConfig = { baseDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 5000 };
      expect(calculateExponentialDelay(0, cappedConfig)).toBe(1000);
      expect(calculateExponentialDelay(10, cappedConfig)).toBe(5000); // Capped
    });

    it('should handle multiplier of 1 (linear)', () => {
      const linearConfig = { baseDelayMs: 1000, backoffMultiplier: 1, maxDelayMs: 30000 };
      expect(calculateExponentialDelay(0, linearConfig)).toBe(1000);
      expect(calculateExponentialDelay(5, linearConfig)).toBe(1000);
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

    it('should return 0 for 0 delay', () => {
      expect(applyJitter(0, 0.25)).toBe(0);
    });

    it('should return exact delay when jitterFactor is 0', () => {
      expect(applyJitter(1000, 0)).toBe(1000);
    });
  });

  describe('isRetryableError', () => {
    describe('HTTP status codes', () => {
      it('should return true for rate limit errors (429)', () => {
        expect(isRetryableError({ status: 429, message: 'Rate limited' })).toBe(true);
      });

      it('should return true for server errors (5xx)', () => {
        expect(isRetryableError({ status: 500, message: 'Internal server error' })).toBe(true);
        expect(isRetryableError({ status: 502, message: 'Bad gateway' })).toBe(true);
        expect(isRetryableError({ status: 503, message: 'Service unavailable' })).toBe(true);
        expect(isRetryableError({ status: 504, message: 'Gateway timeout' })).toBe(true);
      });

      it('should return false for client errors (4xx except 429)', () => {
        expect(isRetryableError({ status: 400, message: 'Bad request' })).toBe(false);
        expect(isRetryableError({ status: 401, message: 'Unauthorized' })).toBe(false);
        expect(isRetryableError({ status: 403, message: 'Forbidden' })).toBe(false);
        expect(isRetryableError({ status: 404, message: 'Not found' })).toBe(false);
        expect(isRetryableError({ status: 422, message: 'Unprocessable entity' })).toBe(false);
      });
    });

    describe('error codes', () => {
      it('should return true for retryable error codes', () => {
        expect(isRetryableError({ code: 'RATE_LIMITED' })).toBe(true);
        expect(isRetryableError({ code: 'SERVICE_UNAVAILABLE' })).toBe(true);
        expect(isRetryableError({ code: 'ECONNRESET' })).toBe(true);
        expect(isRetryableError({ code: 'ETIMEDOUT' })).toBe(true);
        expect(isRetryableError({ code: 'ECONNREFUSED' })).toBe(true);
      });

      it('should return false for non-retryable error codes', () => {
        expect(isRetryableError({ code: 'BAD_REQUEST' })).toBe(false);
        expect(isRetryableError({ code: 'UNAUTHORIZED' })).toBe(false);
        expect(isRetryableError({ code: 'VALIDATION_FAILED' })).toBe(false);
      });

      it('should handle case-insensitive codes', () => {
        expect(isRetryableError({ code: 'econnreset' })).toBe(true);
        expect(isRetryableError({ code: 'bad_request' })).toBe(false);
      });
    });

    describe('error messages', () => {
      it('should return true for network error messages', () => {
        expect(isRetryableError(new Error('network error'))).toBe(true);
        expect(isRetryableError(new Error('Request timeout'))).toBe(true);
        expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
        expect(isRetryableError(new Error('fetch failed'))).toBe(true);
        expect(isRetryableError(new Error('socket hang up'))).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should return false for null/undefined', () => {
        expect(isRetryableError(null)).toBe(false);
        expect(isRetryableError(undefined)).toBe(false);
      });

      it('should default to true for unknown errors', () => {
        expect(isRetryableError(new Error('Unknown error'))).toBe(true);
        expect(isRetryableError('string error')).toBe(true);
      });
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
      expect(result.attemptDetails[0].delayMs).toBe(0);
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

    it('should preserve error in result', async () => {
      const testError = new Error('Test failure');
      const operation = vi.fn().mockRejectedValue(testError);

      const resultPromise = withRetry(operation, { maxRetries: 0 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.error?.message).toBe('Test failure');
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

    it('should preserve function arguments', async () => {
      const originalFn = vi.fn().mockResolvedValue('result');
      const wrappedFn = withRetryWrapper(originalFn, {});

      const resultPromise = wrappedFn('a', 1, { key: 'value' });
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(originalFn).toHaveBeenCalledWith('a', 1, { key: 'value' });
    });
  });

  describe('RetryPresets', () => {
    it('should have standard preset with expected values', () => {
      expect(RetryPresets.standard.maxRetries).toBe(3);
      expect(RetryPresets.standard.baseDelayMs).toBe(1000);
      expect(RetryPresets.standard.maxDelayMs).toBe(30000);
      expect(RetryPresets.standard.backoffMultiplier).toBe(2);
      expect(RetryPresets.standard.jitterFactor).toBe(0.25);
    });

    it('should have aggressive preset for critical operations', () => {
      expect(RetryPresets.aggressive.maxRetries).toBe(5);
      expect(RetryPresets.aggressive.baseDelayMs).toBe(500);
    });

    it('should have conservative preset for rate-limited APIs', () => {
      expect(RetryPresets.conservative.maxRetries).toBe(3);
      expect(RetryPresets.conservative.baseDelayMs).toBe(2000);
      expect(RetryPresets.conservative.backoffMultiplier).toBe(3);
    });

    it('should have quick preset for fast-failing operations', () => {
      expect(RetryPresets.quick.maxRetries).toBe(2);
      expect(RetryPresets.quick.baseDelayMs).toBe(100);
      expect(RetryPresets.quick.maxDelayMs).toBe(1000);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should resolve after specified delay', async () => {
      const callback = vi.fn();
      const promise = sleep(1000).then(callback);

      expect(callback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(999);
      expect(callback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await promise;
      expect(callback).toHaveBeenCalled();
    });

    it('should handle 0ms delay', async () => {
      const callback = vi.fn();
      await sleep(0).then(callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});
```

#### Acceptance Criteria
- [x] Test file created at `/src/lib/translation-service/utils/__tests__/retry.test.ts`
- [x] All delay calculation tests pass
- [x] All jitter tests pass
- [x] All error classification tests pass
- [x] All withRetry behavior tests pass
- [x] All convenience function tests pass
- [x] All preset validation tests pass
- [x] Tests use `vi.useFakeTimers()` to avoid actual delays
- [x] Test coverage > 90% for retry.ts

#### Verification Command
```bash
npx vitest run src/lib/translation-service/utils/__tests__/retry.test.ts --coverage
```

---

### Task 3.5.7: Update Module Exports

**Priority:** Medium
**Estimated Effort:** 0.5 story points
**Dependencies:** Tasks 3.5.1-3.5.5

#### Objective
Update the translation service barrel file to export the retry utilities.

#### Implementation Steps

1. **Ensure `/src/lib/translation-service/index.ts` exists** (create if not)

2. **Add retry utility exports:**

```typescript
// /src/lib/translation-service/index.ts

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

#### Acceptance Criteria
- [x] `/src/lib/translation-service/index.ts` exists
- [x] All retry functions are exported
- [x] All retry types are exported
- [x] Imports work from `@/lib/translation-service`

#### Verification
```typescript
// This should work:
import { withRetry, RetryPresets, type RetryConfig } from '@/lib/translation-service';
```

---

## Files Summary

### Files to Create

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

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/translation-service/index.ts` | Add retry utility exports (create if not exists) |

---

## Acceptance Criteria Verification Matrix

| REQ-239 Acceptance Criteria | Task | Verification |
|----------------------------|------|--------------|
| Failed translation requests are automatically retried up to three times | 3.5.4 | `withRetry()` with `maxRetries: 3` default |
| Delay between retries increases exponentially with each attempt | 3.5.2 | `calculateExponentialDelay()` uses `baseDelay * 2^attempt` |
| Random jitter is added to retry delays | 3.5.2 | `applyJitter()` applies ±jitterFactor randomization |
| Retry logic distinguishes between retryable and permanent errors | 3.5.3 | `isRetryableError()` checks status codes and patterns |
| After all retries are exhausted, the original error is surfaced | 3.5.4 | `RetryResult.error` contains last error |
| Retry attempts and outcomes are logged for observability | 3.5.4 | `console.warn()` logs each retry attempt |

---

## Implementation Order

1. **Task 3.5.1** - Create directory structure and type definitions
2. **Task 3.5.2** - Implement default config and delay calculation functions
3. **Task 3.5.3** - Implement retryable error detection function
4. **Task 3.5.4** - Implement main `withRetry` function
5. **Task 3.5.5** - Implement convenience functions and presets
6. **Task 3.5.6** - Create unit tests
7. **Task 3.5.7** - Update module exports

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
  console.log('Attempts:', result.attempts);
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
  console.error('Retry attempts:', error.retryAttempts);
}
```

### Using Presets

```typescript
import { retryOperation, RetryPresets } from '@/lib/translation-service';

// Use conservative preset for rate-limited APIs
const translation = await retryOperation(
  () => translateWithClaude(request),
  RetryPresets.conservative
);
```

---

## Delay Calculation Examples

With default configuration (`baseDelayMs: 1000`, `backoffMultiplier: 2`, `jitterFactor: 0.25`):

| Attempt | Base Delay | With Jitter (approx) |
|---------|------------|---------------------|
| 1 (initial) | 0ms | 0ms |
| 2 (retry 1) | 1000ms | 750-1250ms |
| 3 (retry 2) | 2000ms | 1500-2500ms |
| 4 (retry 3) | 4000ms | 3000-5000ms |

Total potential wait time: ~6-8.75 seconds before final failure (excluding operation time).

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Retrying non-idempotent operations | Document that wrapped operations should be idempotent |
| Timer memory leaks | Use standard setTimeout/Promise; no cleanup needed |
| Excessive logging | Only log retries (not successes) with `console.warn()` |
| Jitter causing negative delays | `Math.max(0, ...)` ensures non-negative delays |

---

## Notes

- The retry utility is generic and can be used for any async operation, not just translation
- Jitter is critical for preventing thundering herd problems in distributed systems
- The `onRetry` callback enables custom logging/metrics without modifying retry logic
- Tests use `vi.useFakeTimers()` to avoid actual delays during testing
- Consider circuit breaker pattern for sustained failures (future enhancement, not in scope)

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.5*
*Part of the automated pipeline processing workflow*
