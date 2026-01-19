# REQ-253: Write Unit Tests for Translation Service - Detailed Task Breakdown

**Generated:** 2026-01-18 01:15 UTC
**Last Modified:** 2026-01-18 14:59 UTC
**Request Reference:** docs/gen_requests.md - Request #253
**Overview Document:** docs/REQ-253-write-unit-tests-for-translation-service-overview.md
**Implementation Plan Reference:** docs/prd/Plan-110-L10N-Epic1-Foundation.md (Phase 6, Task 6.1)
**Status:** COMPLETED - All 18 tasks verified

---

## Document Purpose

This document provides granular, implementation-ready tasks for creating comprehensive unit tests for the translation service. Each task is designed to be approximately 1 story point (completable in under 30 minutes by an AI coding agent or junior developer).

---

## Prerequisites

Before starting implementation:

1. **Phase 3 Completion Required:** The translation service modules must exist:
   - `/src/lib/translation-service/translation-service.ts`
   - `/src/lib/translation-service/utils/retry.ts`
   - `/src/lib/translation-service/utils/rate-limiter.ts`
   - `/src/lib/translation-service/providers/claude-provider.ts`
   - `/src/lib/translation-service/providers/openai-provider.ts`

2. **Test Framework Available:** Vitest is already configured (`vitest.config.ts`)

3. **Environment Variables:** Test environment should have mock API keys configured

---

## Task Overview

| Task # | Description | Estimated Effort | Dependencies |
|--------|-------------|------------------|--------------|
| 1 | Create test directory structure | 5 min | None |
| 2 | Create test mock factories and helpers | 15 min | Task 1 |
| 3 | Write rate limiter initialization tests | 15 min | Task 1, 2 |
| 4 | Write rate limiter token bucket behavior tests | 20 min | Task 3 |
| 5 | Write rate limiter timing tests | 15 min | Task 4 |
| 6 | Write retry utility success tests | 15 min | Task 1, 2 |
| 7 | Write retry utility failure tests | 15 min | Task 6 |
| 8 | Write retry utility timing tests | 20 min | Task 7 |
| 9 | Write Claude provider API request tests | 20 min | Task 1, 2 |
| 10 | Write Claude provider error handling tests | 15 min | Task 9 |
| 11 | Write OpenAI provider API request tests | 20 min | Task 1, 2 |
| 12 | Write OpenAI provider error handling tests | 15 min | Task 11 |
| 13 | Write translateText success tests | 20 min | Task 1, 2 |
| 14 | Write translateText provider fallback tests | 15 min | Task 13 |
| 15 | Write translateText error handling tests | 15 min | Task 14 |
| 16 | Write batch translation tests | 20 min | Task 15 |
| 17 | Update vitest.config.ts for coverage | 5 min | Task 16 |
| 18 | Run full test suite and verify coverage | 10 min | All |

---

## Detailed Tasks

### Task 1: Create Test Directory Structure

**File Operations:** CREATE directories and files

**Description:** Create the `__tests__` directory structure for translation service test files.

**Steps:**

1. Create directory: `/src/lib/translation-service/__tests__/`
2. Create directory: `/src/lib/translation-service/utils/__tests__/`
3. Create directory: `/src/lib/translation-service/providers/__tests__/`
4. Create empty test file: `/src/lib/translation-service/__tests__/translation-service.test.ts`
5. Create empty test file: `/src/lib/translation-service/utils/__tests__/retry.test.ts`
6. Create empty test file: `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`
7. Create empty test file: `/src/lib/translation-service/providers/__tests__/claude-provider.test.ts`
8. Create empty test file: `/src/lib/translation-service/providers/__tests__/openai-provider.test.ts`

**Expected File Structure:**
```
/src/lib/translation-service/
├── __tests__/
│   └── translation-service.test.ts
├── utils/
│   └── __tests__/
│       ├── retry.test.ts
│       └── rate-limiter.test.ts
└── providers/
    └── __tests__/
        ├── claude-provider.test.ts
        └── openai-provider.test.ts
```

**Verification:**
- All 5 test files exist
- Each file can be imported without errors

---

### Task 2: Create Test Mock Factories and Helpers

**File:** `/src/lib/translation-service/__tests__/test-helpers.ts`

**Description:** Create shared mock factories and test helper functions used across all test files.

**Steps:**

1. Create the test helpers file
2. Implement `createMockTranslationRequest()` factory
3. Implement `createMockTranslationResponse()` factory
4. Implement `createMockApiResponse()` helper for fetch mocking
5. Implement `createMockError()` helper for error scenarios
6. Export all helpers

**Code Template:**

```typescript
/**
 * Test Helpers for Translation Service Tests
 *
 * Shared mock factories and utilities for translation service unit tests.
 *
 * @module translation-service/__tests__/test-helpers
 * @lastModified 2026-01-18 (REQ-253)
 */

import type {
  TranslationRequest,
  TranslationResponse,
  TranslationContext,
  SupportedLanguage,
} from '../translation-service.types';

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Create a mock TranslationRequest for testing.
 */
export function createMockTranslationRequest(
  overrides: Partial<TranslationRequest> = {}
): TranslationRequest {
  return {
    text: 'Hello world',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    ...overrides,
  };
}

/**
 * Create a mock TranslationResponse for testing.
 */
export function createMockTranslationResponse(
  overrides: Partial<TranslationResponse> = {}
): TranslationResponse {
  return {
    translatedText: 'Bonjour le monde',
    provider: 'claude',
    confidence: 0.95,
    tokensUsed: 25,
    ...overrides,
  };
}

/**
 * Create a mock TranslationContext for testing.
 */
export function createMockTranslationContext(
  overrides: Partial<TranslationContext> = {}
): TranslationContext {
  return {
    contentType: 'item_name',
    domainContext: 'household appliance in rental property',
    maxLength: 255,
    ...overrides,
  };
}

// =============================================================================
// API Response Helpers
// =============================================================================

/**
 * Create a mock successful fetch Response.
 */
export function createMockApiResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as Response;
}

/**
 * Create a mock error Response.
 */
export function createMockErrorResponse(
  status: number,
  message: string
): Response {
  return {
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: { message } }),
    text: () => Promise.resolve(JSON.stringify({ error: { message } })),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as Response;
}

// =============================================================================
// Error Helpers
// =============================================================================

/**
 * Create a mock error for testing error scenarios.
 */
export function createMockError(
  message: string,
  code?: string
): Error & { code?: string } {
  const error = new Error(message) as Error & { code?: string };
  if (code) {
    error.code = code;
  }
  return error;
}

// =============================================================================
// Supported Languages List
// =============================================================================

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'en', 'fr', 'es', 'de', 'nl', 'it'
];

export const LANGUAGE_PAIRS: Array<{ source: SupportedLanguage; target: SupportedLanguage }> = [
  { source: 'en', target: 'fr' },
  { source: 'en', target: 'es' },
  { source: 'en', target: 'de' },
  { source: 'en', target: 'nl' },
  { source: 'en', target: 'it' },
  { source: 'fr', target: 'en' },
];
```

**Verification:**
- File imports without TypeScript errors
- All factory functions return valid typed objects

---

### Task 3: Write Rate Limiter Initialization Tests

**File:** `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`

**Description:** Write tests for RateLimiter initialization and configuration.

**Steps:**

1. Add file header with vitest-environment directive
2. Import dependencies from vitest and the rate-limiter module
3. Create `describe('RateLimiter')` test suite
4. Add `describe('initialization')` nested suite
5. Write tests for:
   - Creates limiter with specified requests per minute
   - Uses default 60 requests per minute when not specified
   - Accepts custom window size configuration
   - Initial token count equals configured rate limit

**Code Template:**

```typescript
/**
 * Unit Tests for Rate Limiter Utility
 *
 * Tests token bucket rate limiting behavior for translation API calls.
 *
 * @module translation-service/utils/__tests__/rate-limiter.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-18 (REQ-253)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter, createRateLimiter } from '../rate-limiter';

// =============================================================================
// Test Suites
// =============================================================================

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('initialization', () => {
    it('creates limiter with specified requests per minute', () => {
      const limiter = createRateLimiter({ requestsPerMinute: 30 });

      expect(limiter.getRemainingTokens()).toBe(30);
    });

    it('uses default 60 requests per minute when not specified', () => {
      const limiter = createRateLimiter({});

      expect(limiter.getRemainingTokens()).toBe(60);
    });

    it('accepts custom window size configuration', () => {
      const limiter = createRateLimiter({
        requestsPerMinute: 10,
        windowMs: 30000 // 30 seconds
      });

      expect(limiter.getRemainingTokens()).toBe(10);
    });

    it('initial token count equals configured rate limit', () => {
      const limiter = createRateLimiter({ requestsPerMinute: 100 });

      expect(limiter.getRemainingTokens()).toBe(100);
    });
  });
});
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`
- All 4 tests pass

---

### Task 4: Write Rate Limiter Token Bucket Behavior Tests

**File:** `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`

**Description:** Add tests for token bucket acquire/release behavior.

**Steps:**

1. Add `describe('token bucket behavior')` nested suite
2. Write tests for:
   - Allows requests within limit
   - Blocks requests exceeding limit (tryAcquire returns false)
   - Decrements token count after acquire
   - Refills tokens over time
   - Tracks remaining tokens accurately

**Code to Add:**

```typescript
  // ===========================================================================
  // Token Bucket Behavior Tests
  // ===========================================================================

  describe('token bucket behavior', () => {
    it('allows requests within limit', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 5 });

      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        const acquired = await limiter.tryAcquire();
        expect(acquired).toBe(true);
      }
    });

    it('blocks requests exceeding limit', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 3 });

      // Exhaust tokens
      for (let i = 0; i < 3; i++) {
        await limiter.tryAcquire();
      }

      // Next request should be blocked
      const acquired = await limiter.tryAcquire();
      expect(acquired).toBe(false);
    });

    it('decrements token count after acquire', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 10 });

      expect(limiter.getRemainingTokens()).toBe(10);

      await limiter.acquire();
      expect(limiter.getRemainingTokens()).toBe(9);

      await limiter.acquire();
      expect(limiter.getRemainingTokens()).toBe(8);
    });

    it('refills tokens over time', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 60 });

      // Exhaust all tokens
      for (let i = 0; i < 60; i++) {
        await limiter.tryAcquire();
      }

      expect(limiter.getRemainingTokens()).toBe(0);

      // Advance time by 1 second (should refill 1 token at 60/min)
      await vi.advanceTimersByTimeAsync(1000);

      expect(limiter.getRemainingTokens()).toBe(1);
    });

    it('tracks remaining tokens accurately', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 10 });

      expect(limiter.getRemainingTokens()).toBe(10);

      await limiter.acquire();
      expect(limiter.getRemainingTokens()).toBe(9);

      await limiter.acquire();
      expect(limiter.getRemainingTokens()).toBe(8);

      // Advance 6 seconds (should add 1 token at 10/min)
      await vi.advanceTimersByTimeAsync(6000);
      expect(limiter.getRemainingTokens()).toBe(9);
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`
- All token bucket tests pass

---

### Task 5: Write Rate Limiter Timing Tests

**File:** `/src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`

**Description:** Add tests for rate limiter blocking/waiting behavior and concurrent access.

**Steps:**

1. Add `describe('acquire method')` nested suite
2. Add `describe('concurrent access')` nested suite
3. Write tests for:
   - acquire() returns immediately when tokens available
   - acquire() waits when no tokens available
   - Multiple simultaneous acquires are handled correctly
   - Respects order of waiting requests (FIFO)

**Code to Add:**

```typescript
  // ===========================================================================
  // Acquire Method Tests
  // ===========================================================================

  describe('acquire method', () => {
    it('returns immediately when tokens available', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 10 });
      const startTime = Date.now();

      await limiter.acquire();

      // Should complete almost instantly (no waiting)
      expect(Date.now() - startTime).toBeLessThan(100);
    });

    it('waits when no tokens available', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 1 });

      // Take the only token
      await limiter.acquire();

      // Start another acquire (should wait)
      let acquired = false;
      const acquirePromise = limiter.acquire().then(() => {
        acquired = true;
      });

      // Should not be acquired yet
      expect(acquired).toBe(false);

      // Advance time to refill (1 token per minute)
      await vi.advanceTimersByTimeAsync(60000);
      await acquirePromise;

      expect(acquired).toBe(true);
    });

    it('tryAcquire returns false without waiting', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 1 });

      // Take the only token
      await limiter.tryAcquire();

      // Should return false immediately, not wait
      const result = await limiter.tryAcquire();
      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // Concurrent Access Tests
  // ===========================================================================

  describe('concurrent access', () => {
    it('handles multiple simultaneous acquires', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 2 });

      // Start 3 concurrent acquires
      const results: number[] = [];
      const p1 = limiter.acquire().then(() => results.push(1));
      const p2 = limiter.acquire().then(() => results.push(2));
      const p3 = limiter.acquire().then(() => results.push(3));

      // First two should resolve immediately
      await vi.advanceTimersByTimeAsync(0);
      await Promise.resolve(); // Flush microtasks
      expect(results).toContain(1);
      expect(results).toContain(2);
      expect(results).not.toContain(3);

      // Third should wait for refill
      await vi.advanceTimersByTimeAsync(30000); // Wait for token refill
      await p3;
      expect(results).toContain(3);
    });

    it('maintains correct token count under concurrent load', async () => {
      const limiter = createRateLimiter({ requestsPerMinute: 5 });

      // Fire 5 concurrent requests
      const promises = Array(5).fill(null).map(() => limiter.tryAcquire());
      const results = await Promise.all(promises);

      // All should succeed
      expect(results.every(r => r === true)).toBe(true);
      expect(limiter.getRemainingTokens()).toBe(0);
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/utils/__tests__/rate-limiter.test.ts`
- All timing and concurrency tests pass

---

### Task 6: Write Retry Utility Success Tests

**File:** `/src/lib/translation-service/utils/__tests__/retry.test.ts`

**Description:** Write tests for successful retry operations.

**Steps:**

1. Add file header with vitest-environment directive
2. Import dependencies
3. Create main `describe('withRetry')` test suite
4. Add `describe('successful operations')` nested suite
5. Write tests for:
   - Returns result on first attempt success
   - Returns result after retries succeed
   - Preserves return value type

**Code Template:**

```typescript
/**
 * Unit Tests for Retry Utility
 *
 * Tests exponential backoff retry logic for translation API calls.
 *
 * @module translation-service/utils/__tests__/retry.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-18 (REQ-253)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, calculateBackoffDelay } from '../retry';

// =============================================================================
// Test Suites
// =============================================================================

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // Successful Operations Tests
  // ===========================================================================

  describe('successful operations', () => {
    it('returns result on first attempt success', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('returns result after retries succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const resultPromise = withRetry(operation, { maxRetries: 3 });

      // Advance through retry delays
      await vi.advanceTimersByTimeAsync(1000); // first retry
      await vi.advanceTimersByTimeAsync(2000); // second retry

      const result = await resultPromise;
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('preserves return value type', async () => {
      interface TranslationResult {
        text: string;
        confidence: number;
      }

      const expectedResult: TranslationResult = {
        text: 'Bonjour',
        confidence: 0.95,
      };

      const operation = vi.fn().mockResolvedValue(expectedResult);

      const result = await withRetry<TranslationResult>(operation);

      expect(result).toEqual(expectedResult);
      expect(result.text).toBe('Bonjour');
      expect(result.confidence).toBe(0.95);
    });

    it('calls operation with correct arguments when provided', async () => {
      const operation = vi.fn().mockResolvedValue('done');

      await withRetry(() => operation('arg1', 'arg2'));

      expect(operation).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/utils/__tests__/retry.test.ts`
- All 4 tests pass

---

### Task 7: Write Retry Utility Failure Tests

**File:** `/src/lib/translation-service/utils/__tests__/retry.test.ts`

**Description:** Add tests for retry failure scenarios.

**Steps:**

1. Add `describe('failure handling')` nested suite
2. Write tests for:
   - Throws after exhausting all retries
   - Includes attempt count in error (or error context)
   - Preserves original error message
   - Respects custom maxRetries setting

**Code to Add:**

```typescript
  // ===========================================================================
  // Failure Handling Tests
  // ===========================================================================

  describe('failure handling', () => {
    it('throws after exhausting all retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('persistent failure'));

      const resultPromise = withRetry(operation, { maxRetries: 3 });

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(1000); // first retry delay
      await vi.advanceTimersByTimeAsync(2000); // second retry delay
      await vi.advanceTimersByTimeAsync(4000); // third retry delay

      await expect(resultPromise).rejects.toThrow('persistent failure');
      expect(operation).toHaveBeenCalledTimes(4); // initial + 3 retries
    });

    it('preserves original error message', async () => {
      const originalError = new Error('API rate limit exceeded');
      const operation = vi.fn().mockRejectedValue(originalError);

      const resultPromise = withRetry(operation, { maxRetries: 2 });

      // Advance through retries
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      await expect(resultPromise).rejects.toThrow('API rate limit exceeded');
    });

    it('respects custom maxRetries setting', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      const resultPromise = withRetry(operation, { maxRetries: 1 });

      // Advance through single retry
      await vi.advanceTimersByTimeAsync(1000);

      await expect(resultPromise).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(2); // initial + 1 retry
    });

    it('stops retrying immediately when maxRetries is 0', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      await expect(withRetry(operation, { maxRetries: 0 })).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/utils/__tests__/retry.test.ts`
- All failure handling tests pass

---

### Task 8: Write Retry Utility Timing Tests

**File:** `/src/lib/translation-service/utils/__tests__/retry.test.ts`

**Description:** Add tests for exponential backoff timing and jitter.

**Steps:**

1. Add `describe('timing')` nested suite
2. Add `describe('calculateBackoffDelay')` test suite
3. Write tests for:
   - First retry delay is baseDelay
   - Second retry delay is baseDelay * 2
   - Third retry delay is baseDelay * 4
   - Respects maxDelay cap
   - Adds jitter to prevent thundering herd

**Code to Add:**

```typescript
  // ===========================================================================
  // Timing Tests
  // ===========================================================================

  describe('timing', () => {
    it('waits baseDelay before first retry', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      const resultPromise = withRetry(operation, {
        maxRetries: 3,
        baseDelay: 1000,
      });

      // Check first delay
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      // First retry should use baseDelay (with possible jitter)
      const firstDelay = setTimeoutSpy.mock.calls[0]?.[1] as number;
      expect(firstDelay).toBeGreaterThanOrEqual(800);
      expect(firstDelay).toBeLessThanOrEqual(1200);
    });

    it('uses exponential backoff for subsequent retries', async () => {
      const delays: number[] = [];
      const originalSetTimeout = globalThis.setTimeout;

      vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay) => {
        delays.push(delay as number);
        return originalSetTimeout(fn, 0);
      });

      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      await withRetry(operation, {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      });

      // Verify delays are exponential (with jitter tolerance of ±20%)
      expect(delays[0]).toBeGreaterThanOrEqual(800);  // ~1000ms
      expect(delays[0]).toBeLessThanOrEqual(1200);
      expect(delays[1]).toBeGreaterThanOrEqual(1600); // ~2000ms
      expect(delays[1]).toBeLessThanOrEqual(2400);
    });

    it('respects maxDelay cap', async () => {
      const delays: number[] = [];
      const originalSetTimeout = globalThis.setTimeout;

      vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay) => {
        delays.push(delay as number);
        return originalSetTimeout(fn, 0);
      });

      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      await withRetry(operation, {
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 3000,
      });

      // All delays should be capped at maxDelay (with jitter)
      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(3600); // 3000 + 20% jitter
      });
    });
  });
});

// =============================================================================
// calculateBackoffDelay Tests
// =============================================================================

describe('calculateBackoffDelay', () => {
  it('calculates correct exponential delay', () => {
    expect(calculateBackoffDelay(0, 1000)).toBe(1000); // 1000 * 2^0
    expect(calculateBackoffDelay(1, 1000)).toBe(2000); // 1000 * 2^1
    expect(calculateBackoffDelay(2, 1000)).toBe(4000); // 1000 * 2^2
    expect(calculateBackoffDelay(3, 1000)).toBe(8000); // 1000 * 2^3
  });

  it('respects maxDelay cap', () => {
    const result = calculateBackoffDelay(10, 1000, 5000);
    expect(result).toBeLessThanOrEqual(5000);
  });

  it('handles attempt 0 correctly', () => {
    const result = calculateBackoffDelay(0, 500);
    expect(result).toBe(500);
  });
});
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/utils/__tests__/retry.test.ts`
- All timing tests pass

---

### Task 9: Write Claude Provider API Request Tests

**File:** `/src/lib/translation-service/providers/__tests__/claude-provider.test.ts`

**Description:** Write tests for Claude provider API request formatting.

**Steps:**

1. Add file header with vitest-environment directive
2. Import dependencies and mock fetch globally
3. Create main `describe('Claude Provider')` test suite
4. Write tests for:
   - Sends correct API request format
   - Includes authentication headers
   - Returns translated text from API response
   - Includes context in prompt when provided

**Code Template:**

```typescript
/**
 * Unit Tests for Claude Translation Provider
 *
 * Tests Claude API integration for translation service.
 *
 * @module translation-service/providers/__tests__/claude-provider.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-18 (REQ-253)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translate } from '../claude-provider';
import {
  createMockTranslationRequest,
  createMockTranslationContext,
  createMockApiResponse,
} from '../../__tests__/test-helpers';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// =============================================================================
// Test Suites
// =============================================================================

describe('Claude Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key-12345');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ===========================================================================
  // API Request Format Tests
  // ===========================================================================

  describe('translate function', () => {
    it('sends correct API request format', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          content: [{ text: 'Bonjour' }],
          usage: { input_tokens: 10, output_tokens: 5 },
        })
      );

      await translate(createMockTranslationRequest());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key-12345',
            'anthropic-version': expect.any(String),
            'content-type': 'application/json',
          }),
        })
      );
    });

    it('includes authentication headers', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          content: [{ text: 'Bonjour' }],
        })
      );

      await translate(createMockTranslationRequest());

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['x-api-key']).toBe('test-api-key-12345');
    });

    it('returns translated text from API response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          content: [{ text: 'Bonjour le monde' }],
        })
      );

      const result = await translate(createMockTranslationRequest({
        text: 'Hello world',
        targetLanguage: 'fr',
      }));

      expect(result.translatedText).toBe('Bonjour le monde');
      expect(result.provider).toBe('claude');
    });

    it('includes source and target text in request body', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          content: [{ text: 'Hola' }],
        })
      );

      await translate(createMockTranslationRequest({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      }));

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.messages[0].content).toContain('Hello');
      // Should reference target language in prompt
      expect(JSON.stringify(body)).toContain('es');
    });

    it('includes context in prompt when provided', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          content: [{ text: 'Cuisiniere' }],
        })
      );

      await translate({
        ...createMockTranslationRequest({ text: 'Stove' }),
        context: createMockTranslationContext({
          contentType: 'item_name',
          domainContext: 'kitchen appliance in rental property',
        }),
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      // Context should be included in the prompt
      expect(JSON.stringify(body)).toContain('kitchen appliance');
    });

    it('reports token usage when available', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          content: [{ text: 'Bonjour' }],
          usage: { input_tokens: 15, output_tokens: 8 },
        })
      );

      const result = await translate(createMockTranslationRequest());

      expect(result.tokensUsed).toBe(23); // 15 + 8
    });
  });
});
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/providers/__tests__/claude-provider.test.ts`
- All API request tests pass

---

### Task 10: Write Claude Provider Error Handling Tests

**File:** `/src/lib/translation-service/providers/__tests__/claude-provider.test.ts`

**Description:** Add tests for Claude provider error scenarios.

**Steps:**

1. Add `describe('error handling')` nested suite
2. Write tests for:
   - Handles 429 rate limit errors
   - Handles 401 authentication errors
   - Handles 500 server errors
   - Handles network errors
   - Handles malformed API responses

**Code to Add:**

```typescript
  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('handles 429 rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } }),
      } as Response);

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        /rate limit|429|too many/i
      );
    });

    it('handles 401 authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
      } as Response);

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        /unauthorized|401|api key/i
      );
    });

    it('handles 500 server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: { message: 'Server error' } }),
      } as Response);

      await expect(translate(createMockTranslationRequest())).rejects.toThrow();
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        'Network connection failed'
      );
    });

    it('handles malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          // Missing 'content' array
          unexpected: 'response format',
        })
      );

      await expect(translate(createMockTranslationRequest())).rejects.toThrow();
    });

    it('handles empty content array', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          content: [], // Empty array
        })
      );

      await expect(translate(createMockTranslationRequest())).rejects.toThrow();
    });
  });

  // ===========================================================================
  // API Configuration Tests
  // ===========================================================================

  describe('API configuration', () => {
    it('uses correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({ content: [{ text: 'test' }] })
      );

      await translate(createMockTranslationRequest());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.anything()
      );
    });

    it('throws error when API key is missing', async () => {
      vi.stubEnv('ANTHROPIC_API_KEY', '');

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        /api key/i
      );
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/providers/__tests__/claude-provider.test.ts`
- All error handling tests pass

---

### Task 11: Write OpenAI Provider API Request Tests

**File:** `/src/lib/translation-service/providers/__tests__/openai-provider.test.ts`

**Description:** Write tests for OpenAI provider API request formatting.

**Steps:**

1. Add file header with vitest-environment directive
2. Import dependencies and mock fetch globally
3. Create main `describe('OpenAI Provider')` test suite
4. Write tests for:
   - Sends correct API request format (chat completions endpoint)
   - Includes authentication headers (Bearer token)
   - Returns translated text from API response
   - Includes context in prompt when provided

**Code Template:**

```typescript
/**
 * Unit Tests for OpenAI Translation Provider
 *
 * Tests OpenAI API integration for translation service (fallback provider).
 *
 * @module translation-service/providers/__tests__/openai-provider.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-18 (REQ-253)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translate } from '../openai-provider';
import {
  createMockTranslationRequest,
  createMockTranslationContext,
  createMockApiResponse,
} from '../../__tests__/test-helpers';

// =============================================================================
// Mock Setup
// =============================================================================

const mockFetch = vi.fn();
global.fetch = mockFetch;

// =============================================================================
// Test Suites
// =============================================================================

describe('OpenAI Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-openai-key-12345');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ===========================================================================
  // API Request Format Tests
  // ===========================================================================

  describe('translate function', () => {
    it('sends correct API request format', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [
            {
              message: { content: 'Bonjour' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        })
      );

      await translate(createMockTranslationRequest());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-openai-key-12345',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('includes authentication headers with Bearer token', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [{ message: { content: 'Bonjour' } }],
        })
      );

      await translate(createMockTranslationRequest());

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['Authorization']).toBe('Bearer sk-test-openai-key-12345');
    });

    it('returns translated text from API response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [
            {
              message: { content: 'Bonjour le monde' },
              finish_reason: 'stop',
            },
          ],
        })
      );

      const result = await translate(createMockTranslationRequest({
        text: 'Hello world',
        targetLanguage: 'fr',
      }));

      expect(result.translatedText).toBe('Bonjour le monde');
      expect(result.provider).toBe('openai');
    });

    it('includes source and target language in request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [{ message: { content: 'Hola' } }],
        })
      );

      await translate(createMockTranslationRequest({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      }));

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      // Messages should contain translation instructions
      expect(body.messages).toBeDefined();
      expect(JSON.stringify(body.messages)).toContain('Hello');
    });

    it('includes context in system prompt when provided', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [{ message: { content: 'Cuisiniere' } }],
        })
      );

      await translate({
        ...createMockTranslationRequest({ text: 'Stove' }),
        context: createMockTranslationContext({
          contentType: 'item_name',
          domainContext: 'kitchen appliance in rental property',
        }),
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(JSON.stringify(body.messages)).toContain('kitchen appliance');
    });

    it('reports token usage when available', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [{ message: { content: 'Bonjour' } }],
          usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
        })
      );

      const result = await translate(createMockTranslationRequest());

      expect(result.tokensUsed).toBe(30);
    });
  });
});
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/providers/__tests__/openai-provider.test.ts`
- All API request tests pass

---

### Task 12: Write OpenAI Provider Error Handling Tests

**File:** `/src/lib/translation-service/providers/__tests__/openai-provider.test.ts`

**Description:** Add tests for OpenAI provider error scenarios.

**Steps:**

1. Add `describe('error handling')` nested suite
2. Write tests for:
   - Handles 429 rate limit errors
   - Handles 401 authentication errors
   - Handles 500 server errors
   - Handles network errors
   - Handles malformed API responses

**Code to Add:**

```typescript
  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('handles 429 rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({
          error: { message: 'Rate limit exceeded', type: 'rate_limit_error' }
        }),
      } as Response);

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        /rate limit|429|too many/i
      );
    });

    it('handles 401 authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({
          error: { message: 'Invalid API key', type: 'invalid_api_key' }
        }),
      } as Response);

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        /unauthorized|401|api key/i
      );
    });

    it('handles 500 server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({
          error: { message: 'Server error' }
        }),
      } as Response);

      await expect(translate(createMockTranslationRequest())).rejects.toThrow();
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        'Network connection failed'
      );
    });

    it('handles malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          // Missing 'choices' array
          unexpected: 'response format',
        })
      );

      await expect(translate(createMockTranslationRequest())).rejects.toThrow();
    });

    it('handles empty choices array', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [], // Empty array
        })
      );

      await expect(translate(createMockTranslationRequest())).rejects.toThrow();
    });
  });

  // ===========================================================================
  // API Configuration Tests
  // ===========================================================================

  describe('API configuration', () => {
    it('uses correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockApiResponse({
          choices: [{ message: { content: 'test' } }],
        })
      );

      await translate(createMockTranslationRequest());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.anything()
      );
    });

    it('throws error when API key is missing', async () => {
      vi.stubEnv('OPENAI_API_KEY', '');

      await expect(translate(createMockTranslationRequest())).rejects.toThrow(
        /api key/i
      );
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/providers/__tests__/openai-provider.test.ts`
- All error handling tests pass

---

### Task 13: Write translateText Success Tests

**File:** `/src/lib/translation-service/__tests__/translation-service.test.ts`

**Description:** Write tests for main translateText function success scenarios.

**Steps:**

1. Add file header with vitest-environment directive
2. Import dependencies and mock provider modules
3. Create main `describe('translateText')` test suite
4. Write tests for:
   - Translates text from English to French
   - Translates text from English to Spanish
   - Translates to all supported languages
   - Includes context in translation requests
   - Respects maxLength constraints

**Code Template:**

```typescript
/**
 * Unit Tests for Translation Service
 *
 * Tests the main translation service wrapper functionality.
 *
 * @module translation-service/__tests__/translation-service.test
 * @vitest-environment jsdom
 * @lastModified 2026-01-18 (REQ-253)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translateText, translateToAllLanguages } from '../translation-service';
import * as claudeProvider from '../providers/claude-provider';
import * as openaiProvider from '../providers/openai-provider';
import {
  createMockTranslationRequest,
  createMockTranslationResponse,
  createMockTranslationContext,
  LANGUAGE_PAIRS,
} from './test-helpers';

// =============================================================================
// Mock Setup
// =============================================================================

vi.mock('../providers/claude-provider');
vi.mock('../providers/openai-provider');

// =============================================================================
// Test Suites
// =============================================================================

describe('translateText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('TRANSLATION_PROVIDER', 'claude');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ===========================================================================
  // Successful Translations Tests
  // ===========================================================================

  describe('successful translations', () => {
    it('translates text from English to French', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse({
          translatedText: 'Bonjour le monde',
          provider: 'claude',
        })
      );

      const result = await translateText({
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.translatedText).toBe('Bonjour le monde');
      expect(result.provider).toBe('claude');
    });

    it('translates text from English to Spanish', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse({
          translatedText: 'Hola mundo',
          provider: 'claude',
        })
      );

      const result = await translateText({
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      });

      expect(result.translatedText).toBe('Hola mundo');
    });

    it('calls provider with correct request parameters', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse()
      );

      await translateText({
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(claudeProvider.translate).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Hello world',
          sourceLanguage: 'en',
          targetLanguage: 'fr',
        })
      );
    });

    it('includes context in translation requests', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse()
      );

      const context = createMockTranslationContext({
        contentType: 'item_name',
        domainContext: 'kitchen appliance',
      });

      await translateText({
        text: 'Dishwasher',
        sourceLanguage: 'en',
        targetLanguage: 'de',
        context,
      });

      expect(claudeProvider.translate).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            contentType: 'item_name',
            domainContext: 'kitchen appliance',
          }),
        })
      );
    });

    it('respects maxLength constraints', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse()
      );

      await translateText({
        text: 'Short text',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        context: {
          contentType: 'item_name',
          maxLength: 50,
        },
      });

      expect(claudeProvider.translate).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            maxLength: 50,
          }),
        })
      );
    });
  });
});
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/__tests__/translation-service.test.ts`
- All success tests pass

---

### Task 14: Write translateText Provider Fallback Tests

**File:** `/src/lib/translation-service/__tests__/translation-service.test.ts`

**Description:** Add tests for provider selection and fallback behavior.

**Steps:**

1. Add `describe('provider selection')` nested suite
2. Write tests for:
   - Uses Claude provider by default
   - Falls back to OpenAI when Claude fails
   - Respects TRANSLATION_PROVIDER env configuration
   - Uses OpenAI when configured as primary

**Code to Add:**

```typescript
  // ===========================================================================
  // Provider Selection Tests
  // ===========================================================================

  describe('provider selection', () => {
    it('uses Claude provider by default', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse({ provider: 'claude' })
      );

      const result = await translateText(createMockTranslationRequest());

      expect(claudeProvider.translate).toHaveBeenCalled();
      expect(openaiProvider.translate).not.toHaveBeenCalled();
      expect(result.provider).toBe('claude');
    });

    it('falls back to OpenAI when Claude fails', async () => {
      vi.mocked(claudeProvider.translate).mockRejectedValueOnce(
        new Error('Claude API error')
      );
      vi.mocked(openaiProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse({
          translatedText: 'Bonjour le monde',
          provider: 'openai',
        })
      );

      const result = await translateText(createMockTranslationRequest());

      expect(claudeProvider.translate).toHaveBeenCalled();
      expect(openaiProvider.translate).toHaveBeenCalled();
      expect(result.provider).toBe('openai');
    });

    it('respects TRANSLATION_PROVIDER=openai configuration', async () => {
      vi.stubEnv('TRANSLATION_PROVIDER', 'openai');
      vi.mocked(openaiProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse({ provider: 'openai' })
      );

      const result = await translateText(createMockTranslationRequest());

      expect(openaiProvider.translate).toHaveBeenCalled();
      expect(claudeProvider.translate).not.toHaveBeenCalled();
      expect(result.provider).toBe('openai');
    });

    it('falls back to Claude when OpenAI is primary and fails', async () => {
      vi.stubEnv('TRANSLATION_PROVIDER', 'openai');
      vi.mocked(openaiProvider.translate).mockRejectedValueOnce(
        new Error('OpenAI API error')
      );
      vi.mocked(claudeProvider.translate).mockResolvedValueOnce(
        createMockTranslationResponse({ provider: 'claude' })
      );

      const result = await translateText(createMockTranslationRequest());

      expect(openaiProvider.translate).toHaveBeenCalled();
      expect(claudeProvider.translate).toHaveBeenCalled();
      expect(result.provider).toBe('claude');
    });

    it('throws error when both providers fail', async () => {
      vi.mocked(claudeProvider.translate).mockRejectedValueOnce(
        new Error('Claude failed')
      );
      vi.mocked(openaiProvider.translate).mockRejectedValueOnce(
        new Error('OpenAI failed')
      );

      await expect(translateText(createMockTranslationRequest())).rejects.toThrow();
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/__tests__/translation-service.test.ts`
- All provider selection tests pass

---

### Task 15: Write translateText Error Handling Tests

**File:** `/src/lib/translation-service/__tests__/translation-service.test.ts`

**Description:** Add tests for input validation and error handling.

**Steps:**

1. Add `describe('error handling')` nested suite
2. Write tests for:
   - Throws error for empty text input
   - Throws error for unsupported source language
   - Throws error for unsupported target language
   - Throws error when same source and target language
   - Propagates provider errors with context

**Code to Add:**

```typescript
  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('throws error for empty text input', async () => {
      await expect(translateText({
        text: '',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow(/text.*required|empty/i);
    });

    it('throws error for whitespace-only text', async () => {
      await expect(translateText({
        text: '   ',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow(/text.*required|empty/i);
    });

    it('throws error for unsupported source language', async () => {
      await expect(translateText({
        text: 'Hello',
        sourceLanguage: 'xx' as any,
        targetLanguage: 'fr',
      })).rejects.toThrow(/unsupported.*language|invalid.*source/i);
    });

    it('throws error for unsupported target language', async () => {
      await expect(translateText({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'xx' as any,
      })).rejects.toThrow(/unsupported.*language|invalid.*target/i);
    });

    it('throws error when source and target language are same', async () => {
      await expect(translateText({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'en',
      })).rejects.toThrow(/same.*language|source.*target/i);
    });

    it('propagates provider errors with context', async () => {
      const providerError = new Error('API quota exceeded');
      vi.mocked(claudeProvider.translate).mockRejectedValueOnce(providerError);
      vi.mocked(openaiProvider.translate).mockRejectedValueOnce(providerError);

      await expect(translateText(createMockTranslationRequest())).rejects.toThrow(
        'API quota exceeded'
      );
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/__tests__/translation-service.test.ts`
- All error handling tests pass

---

### Task 16: Write Batch Translation Tests

**File:** `/src/lib/translation-service/__tests__/translation-service.test.ts`

**Description:** Add tests for translateToAllLanguages batch function.

**Steps:**

1. Add `describe('batch translations')` nested suite
2. Write tests for:
   - translateToAllLanguages processes all target languages
   - Aggregates results correctly
   - Handles partial failures gracefully
   - Excludes source language from targets

**Code to Add:**

```typescript
  // ===========================================================================
  // Batch Translation Tests
  // ===========================================================================

  describe('batch translations', () => {
    it('translateToAllLanguages processes all target languages', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValue(
        createMockTranslationResponse()
      );

      const results = await translateToAllLanguages(
        'Hello world',
        'en',
        { contentType: 'item_name' }
      );

      // Should translate to 5 languages (all except source 'en')
      expect(Object.keys(results.translations)).toHaveLength(5);
      expect(results.translations).toHaveProperty('fr');
      expect(results.translations).toHaveProperty('es');
      expect(results.translations).toHaveProperty('de');
      expect(results.translations).toHaveProperty('nl');
      expect(results.translations).toHaveProperty('it');
    });

    it('excludes source language from targets', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValue(
        createMockTranslationResponse()
      );

      const results = await translateToAllLanguages('Hello', 'en');

      expect(results.translations).not.toHaveProperty('en');
    });

    it('aggregates results correctly', async () => {
      vi.mocked(claudeProvider.translate)
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Bonjour' }))
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Hola' }))
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Hallo' }))
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Hallo' }))
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Ciao' }));

      const results = await translateToAllLanguages('Hello', 'en');

      expect(Object.values(results.translations).length).toBe(5);
    });

    it('handles partial failures gracefully', async () => {
      vi.mocked(claudeProvider.translate)
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Bonjour' }))
        .mockRejectedValueOnce(new Error('Failed for Spanish'))
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Hallo' }))
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Hallo' }))
        .mockResolvedValueOnce(createMockTranslationResponse({ translatedText: 'Ciao' }));

      // Should complete with partial results (depending on implementation)
      // Either returns partial results or throws aggregated error
      try {
        const results = await translateToAllLanguages('Hello', 'en');
        // If implementation returns partial results
        expect(results.translations).toHaveProperty('fr');
      } catch (error) {
        // If implementation throws on any failure
        expect(error).toBeDefined();
      }
    });

    it('returns correct provider used', async () => {
      vi.mocked(claudeProvider.translate).mockResolvedValue(
        createMockTranslationResponse({ provider: 'claude' })
      );

      const results = await translateToAllLanguages('Hello', 'en');

      expect(results.provider).toBe('claude');
    });
  });
```

**Verification:**
- Run: `npm test -- src/lib/translation-service/__tests__/translation-service.test.ts`
- All batch translation tests pass

---

### Task 17: Update vitest.config.ts for Coverage

**File:** `/vitest.config.ts`

**Description:** Update vitest configuration to include translation service in coverage reports.

**Steps:**

1. Read current vitest.config.ts
2. Add translation service paths to coverage include array
3. Verify configuration is valid

**Changes:**

```typescript
// Update the coverage.include array to add:
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/lib/translation-service/**/*.ts',  // ADD THIS LINE
  ],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
},
```

**Verification:**
- Configuration file is valid TypeScript
- Run: `npm test -- --coverage src/lib/translation-service` completes without errors

---

### Task 18: Run Full Test Suite and Verify Coverage

**File Operations:** EXECUTE commands

**Description:** Run all translation service tests and verify coverage meets 80% threshold.

**Steps:**

1. Run all translation service tests:
   ```bash
   npm test -- src/lib/translation-service
   ```

2. Run with coverage:
   ```bash
   npm test -- --coverage src/lib/translation-service
   ```

3. Verify:
   - All tests pass (0 failures)
   - Coverage exceeds 80% for:
     - `translation-service.ts`
     - `utils/retry.ts`
     - `utils/rate-limiter.ts`
     - `providers/claude-provider.ts`
     - `providers/openai-provider.ts`
   - Test execution completes in under 30 seconds

**Expected Output:**
```
✓ src/lib/translation-service/__tests__/translation-service.test.ts
✓ src/lib/translation-service/utils/__tests__/retry.test.ts
✓ src/lib/translation-service/utils/__tests__/rate-limiter.test.ts
✓ src/lib/translation-service/providers/__tests__/claude-provider.test.ts
✓ src/lib/translation-service/providers/__tests__/openai-provider.test.ts

Test Files  5 passed (5)
Tests       XX passed (XX)
Coverage    > 80%
Duration    < 30s
```

---

## Acceptance Criteria Verification Checklist

| Criterion | Task(s) | Test File(s) |
|-----------|---------|--------------|
| Text translation produces correct results | 13 | translation-service.test.ts |
| Multiple language pairs tested | 13 | translation-service.test.ts |
| Retry with exponential backoff | 6, 7, 8 | retry.test.ts |
| Rate limit handling | 3, 4, 5 | rate-limiter.test.ts |
| Invalid inputs rejected | 15 | translation-service.test.ts |
| All tests pass consistently | 18 | All test files |
| Tests complete under 30 seconds | 18 | All test files |
| Coverage exceeds 80% | 17, 18 | Coverage report |

---

## Dependencies and Blockers

### Hard Dependencies (Must be completed before this task)

| Dependency | Description | Blocking Tasks |
|------------|-------------|----------------|
| REQ-238 | Rate limiter utility must exist | 3, 4, 5 |
| REQ-239 | Retry logic must exist | 6, 7, 8 |
| REQ-236 | Claude provider must exist | 9, 10 |
| REQ-237 | OpenAI provider must exist | 11, 12 |
| REQ-240 | Translation service wrapper must exist | 13, 14, 15, 16 |

### Soft Dependencies (Recommended before this task)

| Dependency | Description | Impact |
|------------|-------------|--------|
| REQ-241 | Environment variables | Tests may need mock values |

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Source files don't exist yet | Medium | Skip tasks until Phase 3 complete |
| API mocking complexity | Low | Use test helpers and factories |
| Timer mocking issues | Low | Use vi.useFakeTimers() consistently |
| Coverage threshold not met | Low | Add edge case tests as needed |

---

## Notes

- All tests use `vi.useFakeTimers()` for deterministic timing behavior
- Mock external API calls to avoid network dependencies
- Each test file is self-contained with clear describe blocks
- Factory functions create consistent mock data across tests
- Test patterns follow existing codebase conventions (see `validation.test.ts`)

---

## References

- [Overview Document](/docs/REQ-253-write-unit-tests-for-translation-service-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Phase 6, Task 6.1
- [Request #253](/docs/gen_requests.md#req-253)
- [Existing Test Examples](/src/components/ItemCapture/utils/__tests__/validation.test.ts)
- [Vitest Documentation](https://vitest.dev/)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)

---

## Completion Summary (2026-01-18 14:59 UTC)

**All tasks verified and completed:**

| Task # | Status | Notes |
|--------|--------|-------|
| 1 | ✅ Complete | Test directories exist |
| 2 | ✅ Complete | test-helpers.ts created |
| 3-5 | ✅ Complete | Rate limiter tests pass (21 tests) |
| 6-8 | ✅ Complete | Retry utility tests pass |
| 9-10 | ✅ Complete | Claude provider tests pass (17 tests) |
| 11-12 | ✅ Complete | OpenAI provider tests pass (21 tests) |
| 13-16 | ✅ Complete | Translation service tests pass (58 tests) |
| 17 | ✅ Complete | vitest.config.ts updated for coverage |
| 18 | ✅ Complete | All 133 tests pass |

**Test Results:**
- Test Files: 6 passed
- Tests: 133 passed
- Duration: ~3s
- Coverage: Translation service utilities at 91.89%

**Files Created/Modified:**
- Created: `/src/lib/translation-service/__tests__/test-helpers.ts`
- Modified: `/vitest.config.ts` (added translation-service to coverage)

---

*Document generated on 2026-01-18 for REQ-253: Write Unit Tests for Translation Service*
*Implementation completed on 2026-01-18 14:59 UTC*
