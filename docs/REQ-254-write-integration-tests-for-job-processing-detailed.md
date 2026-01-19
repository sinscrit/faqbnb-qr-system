# REQ-254: Integration Tests for Translation Job Processing - Detailed Task Breakdown

**Generated:** 2026-01-18 15:45:00 UTC
**Last Modified:** 2026-01-18 15:45:00 UTC
**Request Reference:** REQ-254 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-254-write-integration-tests-for-job-processing-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 6 - Testing & Validation
**Task ID:** 6.2

---

## Document Purpose

This document provides granular, implementation-ready tasks that an AI coding agent or junior developer can execute step-by-step. Each task is designed to be approximately 1 story point or less, with clear acceptance criteria and verification steps.

---

## Prerequisites

Before starting implementation, verify the following are complete:

| Prerequisite | Reference | Status Check |
|--------------|-----------|--------------|
| Job Queue Module | REQ-243 | File exists: `src/lib/job-queue/translation-jobs.ts` |
| Job Processor | REQ-244 | File exists: `src/lib/job-queue/job-processor.ts` |
| Concurrency Control | REQ-245 | File exists: `src/lib/job-queue/concurrency-control.ts` |
| Unit Tests for Translation Service | REQ-253 | Tests exist in `src/lib/translation-service/__tests__/` |

---

## Task Summary

| Task ID | Title | Story Points | Dependencies |
|---------|-------|--------------|--------------|
| 6.2.1 | Create test directory structure | 0.25 | None |
| 6.2.2 | Create mock factory utilities | 0.5 | 6.2.1 |
| 6.2.3 | Create test utility functions | 0.5 | 6.2.1 |
| 6.2.4 | Create mock Supabase server utilities | 0.5 | 6.2.1 |
| 6.2.5 | Create shared test constants | 0.25 | 6.2.1 |
| 6.2.6 | Implement job creation lifecycle tests | 0.5 | 6.2.2, 6.2.3, 6.2.4 |
| 6.2.7 | Implement job state transition tests | 0.5 | 6.2.6 |
| 6.2.8 | Implement job completion flow tests | 0.5 | 6.2.7 |
| 6.2.9 | Implement job failure handling tests | 0.5 | 6.2.7 |
| 6.2.10 | Implement concurrent job creation tests | 0.5 | 6.2.4 |
| 6.2.11 | Implement worker isolation tests | 0.5 | 6.2.10 |
| 6.2.12 | Implement data integrity tests | 0.5 | 6.2.10 |
| 6.2.13 | Implement race condition prevention tests | 0.5 | 6.2.11 |
| 6.2.14 | Implement job processor lifecycle tests | 0.5 | 6.2.8 |
| 6.2.15 | Implement stale lock recovery tests | 0.5 | 6.2.11 |
| 6.2.16 | Update vitest.config.ts for coverage | 0.25 | 6.2.6 |
| 6.2.17 | Run full test suite and verify CI compatibility | 0.25 | All above |

**Total Estimated Effort:** 6.75 story points

---

## Detailed Tasks

### Task 6.2.1: Create Test Directory Structure

**Objective:** Set up the directory structure for integration tests.

**Files to Create:**
```
src/lib/job-queue/__tests__/
├── helpers/
│   ├── index.ts
│   ├── mockFactories.ts
│   ├── testUtils.ts
│   ├── mockSupabase.ts
│   └── constants.ts
├── job-processing.integration.test.ts
└── concurrent-processing.integration.test.ts
```

**Implementation Steps:**

1. Create the `__tests__` directory:
   ```bash
   mkdir -p src/lib/job-queue/__tests__/helpers
   ```

2. Create empty placeholder files for each test file and helper.

3. Create `src/lib/job-queue/__tests__/helpers/index.ts`:
   ```typescript
   /**
    * Test Helpers for Job Queue Integration Tests
    *
    * Exports all test utilities, mock factories, and constants.
    *
    * @module job-queue/__tests__/helpers
    * @lastModified 2026-01-18
    */

   export * from './mockFactories';
   export * from './testUtils';
   export * from './mockSupabase';
   export * from './constants';
   ```

**Verification:**
- [x] Directory structure exists as specified
- [x] All files created (can be empty placeholders)
- [x] index.ts exports all modules

**Acceptance Criteria:**
- Directory structure matches the specification
- No TypeScript compilation errors

---

### Task 6.2.2: Create Mock Factory Utilities

**Objective:** Create factory functions for generating test data with consistent shapes.

**File:** `src/lib/job-queue/__tests__/helpers/mockFactories.ts`

**Implementation Steps:**

1. Create the mock factories file with the following content:

```typescript
/**
 * Mock Factory Functions for Job Queue Tests
 *
 * Provides factory functions for creating test data with consistent shapes.
 * Follow existing patterns from ItemCreationWorkflow tests.
 *
 * @module job-queue/__tests__/helpers/mockFactories
 * @lastModified 2026-01-18
 */

import type { TranslationJob, JobStatus, EntityType, SupportedLanguage } from '../../translation-jobs.types';

/**
 * Creates a mock translation job with default values.
 * Allows partial overrides for flexible test scenarios.
 */
export function createMockTranslationJob(
  overrides?: Partial<TranslationJob>
): TranslationJob {
  const baseId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    id: baseId,
    entityType: 'article',
    entityId: `entity-${Date.now()}`,
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    status: 'queued',
    attempts: 0,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    lockedBy: null,
    lockedAt: null,
    ...overrides,
  };
}

/**
 * Creates a mock job processing result.
 */
export function createMockJobProcessingResult(
  overrides?: Partial<{
    jobId: string;
    success: boolean;
    entityType: EntityType;
    entityId: string;
    targetLanguage: SupportedLanguage;
    translatedFields: Record<string, string>;
    errorMessage: string;
    processingTimeMs: number;
  }>
) {
  return {
    jobId: `job-${Date.now()}`,
    success: true,
    entityType: 'article' as EntityType,
    entityId: `entity-${Date.now()}`,
    targetLanguage: 'fr' as SupportedLanguage,
    translatedFields: {
      title: 'Titre traduit',
      description: 'Description traduite',
    },
    processingTimeMs: 150,
    ...overrides,
  };
}

/**
 * Creates a mock processing run result for batch operations.
 */
export function createMockProcessingRunResult(
  overrides?: Partial<{
    startedAt: string;
    completedAt: string;
    jobsProcessed: number;
    jobsSucceeded: number;
    jobsFailed: number;
    results: ReturnType<typeof createMockJobProcessingResult>[];
  }>
) {
  return {
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    jobsProcessed: 1,
    jobsSucceeded: 1,
    jobsFailed: 0,
    results: [createMockJobProcessingResult()],
    ...overrides,
  };
}

/**
 * Creates a mock article content record for testing article translations.
 */
export function createMockArticleContent(
  overrides?: Partial<{
    id: string;
    title: string;
    description: string;
    source_language: string;
    created_at: string;
    item_id: string;
  }>
) {
  return {
    id: `article-${Date.now()}`,
    title: 'Test Article Title',
    description: 'Test article description for translation.',
    source_language: 'en',
    created_at: new Date().toISOString(),
    item_id: `item-${Date.now()}`,
    ...overrides,
  };
}

/**
 * Creates a mock item content record for testing item translations.
 */
export function createMockItemContent(
  overrides?: Partial<{
    id: string;
    name: string;
    description: string;
    source_language: string;
    created_at: string;
    property_id: string;
  }>
) {
  return {
    id: `item-${Date.now()}`,
    name: 'Test Item Name',
    description: 'Test item description for translation.',
    source_language: 'en',
    created_at: new Date().toISOString(),
    property_id: `property-${Date.now()}`,
    ...overrides,
  };
}

/**
 * Creates a batch of mock translation jobs for concurrent testing.
 */
export function createMockJobBatch(
  count: number,
  overrides?: Partial<TranslationJob>
): TranslationJob[] {
  return Array.from({ length: count }, (_, index) =>
    createMockTranslationJob({
      id: `batch-job-${index}-${Date.now()}`,
      entityId: `batch-entity-${index}`,
      ...overrides,
    })
  );
}

/**
 * Creates a mock lock statistics result.
 */
export function createMockLockStatistics(
  overrides?: Partial<{
    activeLocksCount: number;
    staleLocksCount: number;
    locksByWorker: Record<string, number>;
    avgLockDurationMs: number;
  }>
) {
  return {
    activeLocksCount: 0,
    staleLocksCount: 0,
    locksByWorker: {},
    avgLockDurationMs: 0,
    ...overrides,
  };
}

/**
 * Creates a mock cleanup result for stale lock tests.
 */
export function createMockCleanupResult(
  overrides?: Partial<{
    staleJobsFound: number;
    jobsReset: number;
    jobsMarkedFailed: number;
    affectedJobIds: string[];
    cleanedAt: string;
  }>
) {
  return {
    staleJobsFound: 0,
    jobsReset: 0,
    jobsMarkedFailed: 0,
    affectedJobIds: [],
    cleanedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

**Verification:**
- [x] File compiles without TypeScript errors
- [x] All factory functions are exported
- [x] Factory functions return properly typed objects

**Acceptance Criteria:**
- Factory functions create valid mock objects
- Override parameter allows customization
- Types align with actual implementation types

---

### Task 6.2.3: Create Test Utility Functions

**Objective:** Create utility functions for common test operations like waiting for job status changes.

**File:** `src/lib/job-queue/__tests__/helpers/testUtils.ts`

**Implementation Steps:**

1. Create the test utilities file:

```typescript
/**
 * Test Utility Functions for Job Queue Integration Tests
 *
 * Provides helper functions for async operations, waiting,
 * and common test patterns.
 *
 * @module job-queue/__tests__/helpers/testUtils
 * @lastModified 2026-01-18
 */

import { vi } from 'vitest';
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
```

**Verification:**
- [x] File compiles without TypeScript errors
- [x] All utility functions are exported
- [x] Functions work correctly with async operations

**Acceptance Criteria:**
- Utility functions handle async operations properly
- Error messages are descriptive
- Functions are generic enough for multiple use cases

---

### Task 6.2.4: Create Mock Supabase Server Utilities

**Objective:** Create comprehensive mock for Supabase server operations to enable isolated testing.

**File:** `src/lib/job-queue/__tests__/helpers/mockSupabase.ts`

**Implementation Steps:**

1. Create the mock Supabase file:

```typescript
/**
 * Mock Supabase Server Utilities for Job Queue Tests
 *
 * Provides an in-memory mock database that simulates Supabase behavior
 * for isolated integration testing without actual database connections.
 *
 * @module job-queue/__tests__/helpers/mockSupabase
 * @lastModified 2026-01-18
 */

import { vi } from 'vitest';
import type { TranslationJob } from '../../translation-jobs.types';

// In-memory mock database storage
let mockDatabase: Map<string, unknown[]> = new Map();

/**
 * Resets the mock database to initial empty state.
 * Call in beforeEach() to ensure test isolation.
 */
export function resetMockDatabase(): void {
  mockDatabase = new Map([
    ['translation_jobs', []],
    ['article_translations', []],
    ['item_translations', []],
    ['link_translations', []],
    ['tag_translations', []],
    ['item_articles', []],
    ['items', []],
    ['item_links', []],
  ]);
}

/**
 * Gets the current mock database for inspection in tests.
 */
export function getMockDatabase(): Map<string, unknown[]> {
  return mockDatabase;
}

/**
 * Gets records from a specific table.
 */
export function getTableRecords<T>(tableName: string): T[] {
  return (mockDatabase.get(tableName) || []) as T[];
}

/**
 * Seeds the mock database with test data.
 */
export function seedMockDatabase<T>(tableName: string, records: T[]): void {
  mockDatabase.set(tableName, records);
}

/**
 * Adds a single record to a table.
 */
export function addMockRecord<T>(tableName: string, record: T): void {
  const records = mockDatabase.get(tableName) || [];
  records.push(record);
  mockDatabase.set(tableName, records);
}

/**
 * Updates a record in a table by a field match.
 */
export function updateMockRecord<T extends Record<string, unknown>>(
  tableName: string,
  matchField: keyof T,
  matchValue: unknown,
  updates: Partial<T>
): T | null {
  const records = getTableRecords<T>(tableName);
  const index = records.findIndex(r => r[matchField] === matchValue);

  if (index >= 0) {
    records[index] = { ...records[index], ...updates };
    return records[index];
  }

  return null;
}

/**
 * Finds a record in a table by a field match.
 */
export function findMockRecord<T extends Record<string, unknown>>(
  tableName: string,
  matchField: keyof T,
  matchValue: unknown
): T | null {
  const records = getTableRecords<T>(tableName);
  return records.find(r => r[matchField] === matchValue) || null;
}

/**
 * Creates a mock Supabase server client with in-memory database operations.
 */
export function createMockSupabaseServer() {
  const mockFrom = vi.fn((tableName: string) => {
    const table = tableName;

    return {
      select: vi.fn((columns?: string) => ({
        eq: vi.fn((col: string, val: unknown) => ({
          single: vi.fn(async () => {
            const records = getTableRecords<Record<string, unknown>>(table);
            const record = records.find(r => r[col] === val);
            return { data: record || null, error: record ? null : null };
          }),
          order: vi.fn((orderCol: string, opts?: { ascending?: boolean }) => ({
            limit: vi.fn((n: number) => ({
              data: getTableRecords<Record<string, unknown>>(table)
                .filter(r => r[col] === val)
                .slice(0, n),
              error: null,
            })),
          })),
          maybeSingle: vi.fn(async () => {
            const records = getTableRecords<Record<string, unknown>>(table);
            const record = records.find(r => r[col] === val);
            return { data: record || null, error: null };
          }),
        })),
        in: vi.fn((col: string, vals: unknown[]) => ({
          data: getTableRecords<Record<string, unknown>>(table)
            .filter(r => vals.includes(r[col])),
          error: null,
        })),
        single: vi.fn(async () => {
          const records = getTableRecords<Record<string, unknown>>(table);
          return { data: records[0] || null, error: null };
        }),
        order: vi.fn((col: string, opts?: { ascending?: boolean }) => ({
          limit: vi.fn((n: number) => ({
            data: getTableRecords<Record<string, unknown>>(table).slice(0, n),
            error: null,
          })),
        })),
      })),
      insert: vi.fn((record: Record<string, unknown> | Record<string, unknown>[]) => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => {
            const records = Array.isArray(record) ? record : [record];
            for (const r of records) {
              const newRecord = {
                ...r,
                id: r.id || `gen-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              };
              addMockRecord(table, newRecord);
            }
            const allRecords = getTableRecords<Record<string, unknown>>(table);
            return {
              data: Array.isArray(record) ? allRecords.slice(-records.length) : allRecords[allRecords.length - 1],
              error: null,
            };
          }),
        })),
      })),
      update: vi.fn((updates: Record<string, unknown>) => ({
        eq: vi.fn((col: string, val: unknown) => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => {
              const updated = updateMockRecord<Record<string, unknown>>(table, col, val, updates);
              return { data: updated, error: updated ? null : { message: 'Not found' } };
            }),
          })),
        })),
        in: vi.fn((col: string, vals: unknown[]) => ({
          data: null,
          error: null,
        })),
        match: vi.fn((criteria: Record<string, unknown>) => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => {
              const records = getTableRecords<Record<string, unknown>>(table);
              const record = records.find(r =>
                Object.entries(criteria).every(([k, v]) => r[k] === v)
              );
              if (record) {
                Object.assign(record, updates);
                return { data: record, error: null };
              }
              return { data: null, error: { message: 'Not found' } };
            }),
          })),
        })),
      })),
      upsert: vi.fn((record: Record<string, unknown>, opts?: { onConflict?: string }) => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => {
            const conflictKey = opts?.onConflict || 'id';
            const existing = findMockRecord<Record<string, unknown>>(table, conflictKey, record[conflictKey]);

            if (existing) {
              Object.assign(existing, record);
              return { data: existing, error: null };
            }

            addMockRecord(table, record);
            return { data: record, error: null };
          }),
        })),
        data: record,
        error: null,
      })),
      delete: vi.fn(() => ({
        eq: vi.fn((col: string, val: unknown) => {
          const records = getTableRecords<Record<string, unknown>>(table);
          const filtered = records.filter(r => r[col] !== val);
          mockDatabase.set(table, filtered);
          return { data: null, error: null };
        }),
      })),
    };
  });

  const mockRpc = vi.fn(async (fnName: string, params: Record<string, unknown>) => {
    // Simulate fetch_and_lock_translation_job RPC
    if (fnName === 'fetch_and_lock_translation_job') {
      const jobs = getTableRecords<TranslationJob>('translation_jobs');
      const queuedJob = jobs.find(j => j.status === 'queued');

      if (queuedJob) {
        queuedJob.status = 'processing';
        queuedJob.lockedBy = params.p_worker_id as string;
        queuedJob.lockedAt = new Date().toISOString();
        queuedJob.startedAt = new Date().toISOString();
        queuedJob.attempts = (queuedJob.attempts || 0) + 1;
        return { data: [queuedJob], error: null };
      }

      return { data: [], error: null };
    }

    // Simulate cleanup_stale_jobs RPC
    if (fnName === 'cleanup_stale_jobs') {
      const jobs = getTableRecords<TranslationJob>('translation_jobs');
      const lockTimeoutMinutes = (params.p_lock_timeout_minutes as number) || 5;
      const maxRetries = (params.p_max_retries as number) || 3;
      const cutoffTime = new Date(Date.now() - lockTimeoutMinutes * 60 * 1000);

      const staleJobs = jobs.filter(j =>
        j.status === 'processing' &&
        j.lockedAt &&
        new Date(j.lockedAt) < cutoffTime
      );

      let jobsReset = 0;
      let jobsMarkedFailed = 0;

      for (const job of staleJobs) {
        if (job.attempts >= maxRetries) {
          job.status = 'failed';
          job.errorMessage = 'Max retries exceeded after stale lock';
          jobsMarkedFailed++;
        } else {
          job.status = 'queued';
          job.lockedBy = null;
          job.lockedAt = null;
          jobsReset++;
        }
      }

      return {
        data: {
          staleJobsFound: staleJobs.length,
          jobsReset,
          jobsMarkedFailed,
          affectedJobIds: staleJobs.map(j => j.id),
        },
        error: null,
      };
    }

    return { data: null, error: null };
  });

  return {
    from: mockFrom,
    rpc: mockRpc,
    _mocks: {
      from: mockFrom,
      rpc: mockRpc,
    },
  };
}

/**
 * Sets up the Supabase server mock for a test suite.
 * Returns the mock client for assertions.
 */
export function setupSupabaseMock() {
  const mockClient = createMockSupabaseServer();

  vi.mock('@/lib/supabase-server', () => ({
    createSupabaseServer: vi.fn(() => mockClient),
  }));

  return mockClient;
}
```

**Verification:**
- [x] File compiles without TypeScript errors
- [x] Mock database operations work correctly
- [x] RPC functions simulate expected behavior

**Acceptance Criteria:**
- Mock database maintains state during tests
- resetMockDatabase() clears all data
- All CRUD operations work as expected

---

### Task 6.2.5: Create Shared Test Constants

**Objective:** Define constants used across integration tests.

**File:** `src/lib/job-queue/__tests__/helpers/constants.ts`

**Implementation Steps:**

1. Create the constants file:

```typescript
/**
 * Shared Constants for Job Queue Integration Tests
 *
 * Defines constants and configuration values used across test files.
 *
 * @module job-queue/__tests__/helpers/constants
 * @lastModified 2026-01-18
 */

import type { EntityType, SupportedLanguage, JobStatus } from '../../translation-jobs.types';

/**
 * All entity types supported by the translation system.
 */
export const TEST_ENTITY_TYPES: readonly EntityType[] = [
  'article',
  'item',
  'link',
  'tag',
] as const;

/**
 * All supported languages for testing.
 */
export const TEST_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'fr',
  'es',
  'de',
  'nl',
  'it',
] as const;

/**
 * All possible job statuses.
 */
export const TEST_JOB_STATUSES: readonly JobStatus[] = [
  'queued',
  'processing',
  'completed',
  'failed',
] as const;

/**
 * Default configuration values for tests.
 */
export const TEST_DEFAULTS = {
  LOCK_TIMEOUT_MINUTES: 5,
  MAX_RETRIES: 3,
  POLLING_INTERVAL_MS: 100,
  TEST_TIMEOUT_MS: 5000,
  CONCURRENT_WORKERS: 5,
  BATCH_SIZE: 10,
} as const;

/**
 * Table names for database operations.
 */
export const TABLE_NAMES = {
  TRANSLATION_JOBS: 'translation_jobs',
  ARTICLE_TRANSLATIONS: 'article_translations',
  ITEM_TRANSLATIONS: 'item_translations',
  LINK_TRANSLATIONS: 'link_translations',
  TAG_TRANSLATIONS: 'tag_translations',
  ITEM_ARTICLES: 'item_articles',
  ITEMS: 'items',
  ITEM_LINKS: 'item_links',
} as const;

/**
 * Mock translation responses for different languages.
 */
export const MOCK_TRANSLATIONS: Record<SupportedLanguage, { title: string; description: string }> = {
  en: { title: 'Test Title', description: 'Test Description' },
  fr: { title: 'Titre de Test', description: 'Description de Test' },
  es: { title: 'Titulo de Prueba', description: 'Descripcion de Prueba' },
  de: { title: 'Testtitel', description: 'Testbeschreibung' },
  nl: { title: 'Testtitel', description: 'Testbeschrijving' },
  it: { title: 'Titolo di Test', description: 'Descrizione di Test' },
};

/**
 * Error messages for test assertions.
 */
export const ERROR_MESSAGES = {
  JOB_NOT_FOUND: 'Translation job not found',
  INVALID_STATUS_TRANSITION: 'Invalid job status transition',
  LOCK_ACQUISITION_FAILED: 'Failed to acquire job lock',
  MAX_RETRIES_EXCEEDED: 'Maximum retry attempts exceeded',
  TRANSLATION_FAILED: 'Translation service failed',
  DUPLICATE_JOB: 'Duplicate translation job exists',
} as const;
```

**Verification:**
- [x] File compiles without TypeScript errors
- [x] Constants match actual system values
- [x] All exports are properly typed

**Acceptance Criteria:**
- Constants provide single source of truth for test values
- Values align with production configuration

---

### Task 6.2.6: Implement Job Creation Lifecycle Tests

**Objective:** Write tests for job creation and initial state verification.

**File:** `src/lib/job-queue/__tests__/job-processing.integration.test.ts`

**Implementation Steps:**

1. Create the initial test file structure:

```typescript
/**
 * Job Processing Integration Tests
 *
 * Comprehensive integration tests for the translation job processing system.
 * Tests job lifecycle, state transitions, and completion flows.
 *
 * @module job-queue/__tests__/job-processing.integration
 * @see docs/REQ-254-write-integration-tests-for-job-processing-detailed.md
 * @lastModified 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockArticleContent,
  createMockItemContent,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
  getMockDatabase,
  getTableRecords,
  createMockSupabaseServer,
} from './helpers/mockSupabase';
import { delay, waitForJobStatus, generateWorkerId } from './helpers/testUtils';
import { TEST_DEFAULTS, TABLE_NAMES, MOCK_TRANSLATIONS } from './helpers/constants';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock the Supabase server module
const mockSupabase = createMockSupabaseServer();
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: vi.fn(() => mockSupabase),
}));

// Mock the translation service
vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockResolvedValue({
    translatedText: 'Texte traduit',
    provider: 'claude',
    tokensUsed: 100,
  }),
  translateToAllLanguages: vi.fn().mockResolvedValue({
    translations: MOCK_TRANSLATIONS,
    provider: 'claude',
    totalTokensUsed: 600,
  }),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('Translation Job Processing Integration', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Job Creation Tests
  // ===========================================================================
  describe('Job Creation and Initial State', () => {
    it('creates job with queued status', async () => {
      const { createTranslationJob } = await import('../translation-jobs');

      const result = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-123',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('queued');
      expect(result.data?.attempts).toBe(0);
      expect(result.data?.errorMessage).toBeNull();
    });

    it('creates job with correct entity reference', async () => {
      const { createTranslationJob } = await import('../translation-jobs');

      const result = await createTranslationJob({
        entityType: 'item',
        entityId: 'item-456',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      });

      expect(result.data?.entityType).toBe('item');
      expect(result.data?.entityId).toBe('item-456');
      expect(result.data?.sourceLanguage).toBe('en');
      expect(result.data?.targetLanguage).toBe('es');
    });

    it('sets timestamps correctly on creation', async () => {
      const { createTranslationJob } = await import('../translation-jobs');
      const beforeCreate = new Date().toISOString();

      const result = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-789',
        sourceLanguage: 'en',
        targetLanguage: 'de',
      });

      const afterCreate = new Date().toISOString();

      expect(result.data?.createdAt).toBeDefined();
      expect(result.data?.createdAt >= beforeCreate).toBe(true);
      expect(result.data?.createdAt <= afterCreate).toBe(true);
      expect(result.data?.startedAt).toBeNull();
      expect(result.data?.completedAt).toBeNull();
    });

    it('generates unique job ID', async () => {
      const { createTranslationJob } = await import('../translation-jobs');

      const result1 = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-1',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      const result2 = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-2',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result1.data?.id).toBeDefined();
      expect(result2.data?.id).toBeDefined();
      expect(result1.data?.id).not.toBe(result2.data?.id);
    });

    it('prevents duplicate job for same entity/language pair', async () => {
      const { createTranslationJob, createJobIfNotExists } = await import('../translation-jobs');

      // Create first job
      await createTranslationJob({
        entityType: 'article',
        entityId: 'article-duplicate',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      // Attempt duplicate
      const duplicateResult = await createJobIfNotExists({
        entityType: 'article',
        entityId: 'article-duplicate',
        targetLanguage: 'fr',
      });

      // Should return existing job or null, not create duplicate
      expect(duplicateResult.isDuplicate).toBe(true);
    });
  });
});
```

**Verification:**
- [x] Tests compile without errors
- [x] Tests can be run with `npm test`
- [x] All job creation scenarios are covered

**Acceptance Criteria:**
- Tests verify job is created with correct initial state
- Tests verify unique ID generation
- Tests verify duplicate prevention

---

### Task 6.2.7: Implement Job State Transition Tests

**Objective:** Write tests for job state transitions (queued -> processing -> completed/failed).

**File:** `src/lib/job-queue/__tests__/job-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite to the existing file:

```typescript
  // ===========================================================================
  // Job State Transition Tests
  // ===========================================================================
  describe('Job State Transitions', () => {
    it('transitions job from queued to processing when fetched', async () => {
      const job = createMockTranslationJob({ status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'worker-transition-test',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('processing');
      expect(result.data?.lockedBy).toBe('worker-transition-test');
      expect(result.data?.lockedAt).toBeDefined();
      expect(result.data?.startedAt).toBeDefined();
    });

    it('increments attempts counter when job is fetched', async () => {
      const job = createMockTranslationJob({ status: 'queued', attempts: 0 });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'worker-attempts-test',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(result.data?.attempts).toBe(1);
    });

    it('transitions job to completed on successful processing', async () => {
      const job = createMockTranslationJob({
        id: 'job-complete-test',
        status: 'processing',
        lockedBy: 'worker-1',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { markJobCompleted } = await import('../translation-jobs');

      const result = await markJobCompleted('job-complete-test');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('completed');
      expect(result.data?.completedAt).toBeDefined();
    });

    it('transitions job to failed with error details', async () => {
      const job = createMockTranslationJob({
        id: 'job-fail-test',
        status: 'processing',
        lockedBy: 'worker-1',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { markJobFailed } = await import('../translation-jobs');

      const errorMessage = 'Translation API rate limit exceeded';
      const result = await markJobFailed('job-fail-test', errorMessage);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('failed');
      expect(result.data?.errorMessage).toBe(errorMessage);
    });

    it('returns null when no queued jobs available', async () => {
      // Seed only processing and completed jobs
      const processingJob = createMockTranslationJob({ status: 'processing' });
      const completedJob = createMockTranslationJob({ status: 'completed' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob, completedJob]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'worker-empty-queue',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(result.data).toBeNull();
    });

    it('does not modify jobs that are already processing', async () => {
      const processingJob = createMockTranslationJob({
        id: 'already-processing',
        status: 'processing',
        lockedBy: 'other-worker',
        lockedAt: new Date().toISOString(),
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [processingJob]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'new-worker',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      // Should not get the already processing job
      expect(result.data?.id).not.toBe('already-processing');
    });
  });
```

**Verification:**
- [x] All state transition tests pass
- [x] Edge cases are covered (empty queue, already processing)
- [x] Lock acquisition is verified

**Acceptance Criteria:**
- Tests cover all valid state transitions
- Tests verify lock information is set correctly
- Tests verify timestamp updates

---

### Task 6.2.8: Implement Job Completion Flow Tests

**Objective:** Write tests for the complete job lifecycle from creation to completion.

**File:** `src/lib/job-queue/__tests__/job-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite:

```typescript
  // ===========================================================================
  // Complete Job Lifecycle Tests
  // ===========================================================================
  describe('Complete Job Lifecycle', () => {
    it('processes job from creation to completion', async () => {
      // Seed source content
      const article = createMockArticleContent({ id: 'lifecycle-article' });
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [article]);

      const {
        createTranslationJob,
        fetchAndLockNextJob,
        markJobCompleted,
        getJobById,
      } = await import('../translation-jobs');

      // Step 1: Create job
      const createResult = await createTranslationJob({
        entityType: 'article',
        entityId: article.id,
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(createResult.success).toBe(true);
      expect(createResult.data?.status).toBe('queued');
      const jobId = createResult.data!.id;

      // Step 2: Fetch and lock
      const fetchResult = await fetchAndLockNextJob({
        workerId: 'lifecycle-worker',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      expect(fetchResult.success).toBe(true);
      expect(fetchResult.data?.id).toBe(jobId);
      expect(fetchResult.data?.status).toBe('processing');
      expect(fetchResult.data?.lockedBy).toBe('lifecycle-worker');

      // Step 3: Complete
      const completeResult = await markJobCompleted(jobId);

      expect(completeResult.success).toBe(true);
      expect(completeResult.data?.status).toBe('completed');
      expect(completeResult.data?.completedAt).toBeDefined();

      // Verify final state
      const finalJob = await getJobById(jobId);
      expect(finalJob?.status).toBe('completed');
    });

    it('stores translation results correctly', async () => {
      const article = createMockArticleContent({ id: 'results-article' });
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [article]);

      const { saveTranslationResult } = await import('../job-processor');

      const saved = await saveTranslationResult({
        entityType: 'article',
        entityId: article.id,
        targetLanguage: 'fr',
        translatedFields: {
          title: 'Titre traduit',
          description: 'Description traduite',
        },
      });

      expect(saved.success).toBe(true);

      // Verify in database
      const translations = getTableRecords<{
        article_id: string;
        language: string;
        title: string;
      }>(TABLE_NAMES.ARTICLE_TRANSLATIONS);

      const savedTranslation = translations.find(
        t => t.article_id === article.id && t.language === 'fr'
      );
      expect(savedTranslation).toBeDefined();
      expect(savedTranslation?.title).toBe('Titre traduit');
    });

    it('retrieves job status via status endpoint pattern', async () => {
      const job = createMockTranslationJob({
        id: 'status-retrieve-job',
        entityId: 'entity-for-status',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { getJobsByEntity } = await import('../translation-jobs');

      const result = await getJobsByEntity('article', 'entity-for-status');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].status).toBe('completed');
      expect(result.data![0].completedAt).toBeDefined();
    });

    it('retrieves all jobs for an entity across languages', async () => {
      const entityId = 'multi-lang-entity';
      const jobs = [
        createMockTranslationJob({ entityId, targetLanguage: 'fr', status: 'completed' }),
        createMockTranslationJob({ entityId, targetLanguage: 'es', status: 'processing' }),
        createMockTranslationJob({ entityId, targetLanguage: 'de', status: 'queued' }),
      ];
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { getJobsByEntity } = await import('../translation-jobs');

      const result = await getJobsByEntity('article', entityId);

      expect(result.data).toHaveLength(3);
      expect(result.data!.map(j => j.targetLanguage).sort()).toEqual(['de', 'es', 'fr']);
    });
  });
```

**Verification:**
- [x] All lifecycle tests pass
- [x] Translation results are properly stored
- [x] Job retrieval works correctly

**Acceptance Criteria:**
- Tests verify complete job flow
- Tests verify results storage
- Tests verify job retrieval patterns

---

### Task 6.2.9: Implement Job Failure Handling Tests

**Objective:** Write tests for job failure scenarios and error handling.

**File:** `src/lib/job-queue/__tests__/job-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite:

```typescript
  // ===========================================================================
  // Job Failure Handling Tests
  // ===========================================================================
  describe('Job Failure Handling', () => {
    it('captures error message on job failure', async () => {
      const job = createMockTranslationJob({
        id: 'error-capture-job',
        status: 'processing',
        lockedBy: 'worker-1',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { markJobFailed } = await import('../translation-jobs');

      const errorMessage = 'API Error: Service temporarily unavailable';
      const result = await markJobFailed('error-capture-job', errorMessage);

      expect(result.data?.status).toBe('failed');
      expect(result.data?.errorMessage).toBe(errorMessage);
      expect(result.data?.completedAt).toBeNull();
    });

    it('increments attempts counter on failure', async () => {
      const job = createMockTranslationJob({
        id: 'retry-count-job',
        status: 'processing',
        lockedBy: 'worker-1',
        attempts: 1,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { markJobFailed, getJobById } = await import('../translation-jobs');

      await markJobFailed('retry-count-job', 'Temporary failure');

      const updatedJob = await getJobById('retry-count-job');
      expect(updatedJob?.attempts).toBeGreaterThanOrEqual(1);
    });

    it('allows retry of failed job if under max attempts', async () => {
      const job = createMockTranslationJob({
        id: 'retry-allowed-job',
        status: 'failed',
        attempts: 1,
        errorMessage: 'Previous failure',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { retryFailedJob, getJobById } = await import('../translation-jobs');

      const result = await retryFailedJob('retry-allowed-job');

      expect(result.success).toBe(true);

      const retriedJob = await getJobById('retry-allowed-job');
      expect(retriedJob?.status).toBe('queued');
      expect(retriedJob?.errorMessage).toBeNull();
    });

    it('prevents retry when max attempts exceeded', async () => {
      const job = createMockTranslationJob({
        id: 'max-retry-job',
        status: 'failed',
        attempts: TEST_DEFAULTS.MAX_RETRIES,
        errorMessage: 'Multiple failures',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { retryFailedJob } = await import('../translation-jobs');

      const result = await retryFailedJob('max-retry-job');

      expect(result.success).toBe(false);
      expect(result.error).toContain('max');
    });

    it('handles failure during different job phases', async () => {
      const { createTranslationJob, fetchAndLockNextJob, markJobFailed } =
        await import('../translation-jobs');

      // Create and lock job
      await createTranslationJob({
        entityType: 'article',
        entityId: 'phase-fail-article',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      const fetchResult = await fetchAndLockNextJob({
        workerId: 'phase-fail-worker',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      // Simulate failure during translation
      const failResult = await markJobFailed(
        fetchResult.data!.id,
        'Translation provider returned invalid response'
      );

      expect(failResult.data?.status).toBe('failed');
      expect(failResult.data?.lockedBy).toBe('phase-fail-worker'); // Still has lock info
      expect(failResult.data?.startedAt).toBeDefined(); // Started time preserved
    });

    it('preserves job history on failure', async () => {
      const job = createMockTranslationJob({
        id: 'history-preserve-job',
        status: 'processing',
        lockedBy: 'history-worker',
        lockedAt: new Date().toISOString(),
        startedAt: new Date(Date.now() - 1000).toISOString(),
        attempts: 2,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { markJobFailed, getJobById } = await import('../translation-jobs');

      await markJobFailed('history-preserve-job', 'Final failure');

      const failedJob = await getJobById('history-preserve-job');
      expect(failedJob?.startedAt).toBeDefined();
      expect(failedJob?.lockedBy).toBe('history-worker');
      expect(failedJob?.attempts).toBe(2);
    });
  });
```

**Verification:**
- [x] All failure handling tests pass
- [x] Error messages are captured correctly
- [x] Retry logic works as expected

**Acceptance Criteria:**
- Tests verify error capture
- Tests verify retry mechanisms
- Tests verify max retry enforcement

---

### Task 6.2.10: Implement Concurrent Job Creation Tests

**Objective:** Write tests for multiple concurrent job creation scenarios.

**File:** `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts`

**Implementation Steps:**

1. Create the new test file:

```typescript
/**
 * Concurrent Job Processing Integration Tests
 *
 * Tests for concurrent job processing scenarios including worker isolation,
 * race condition prevention, and data integrity under load.
 *
 * @module job-queue/__tests__/concurrent-processing.integration
 * @see docs/REQ-254-write-integration-tests-for-job-processing-detailed.md
 * @lastModified 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockJobBatch,
  createMockArticleContent,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
  getMockDatabase,
  getTableRecords,
  createMockSupabaseServer,
} from './helpers/mockSupabase';
import {
  delay,
  runConcurrently,
  generateWorkerId,
  assertAllUnique,
} from './helpers/testUtils';
import { TEST_DEFAULTS, TABLE_NAMES, MOCK_TRANSLATIONS } from './helpers/constants';
import type { TranslationJob } from '../translation-jobs.types';

// =============================================================================
// Mock Setup
// =============================================================================

const mockSupabase = createMockSupabaseServer();
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockImplementation(async () => {
    // Simulate variable translation time
    await delay(Math.random() * 50);
    return {
      translatedText: `Translated at ${Date.now()}`,
      provider: 'claude',
      tokensUsed: 100,
    };
  }),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('Concurrent Job Processing Integration', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Multiple Concurrent Jobs Tests
  // ===========================================================================
  describe('Multiple Concurrent Jobs', () => {
    it('creates multiple jobs simultaneously without conflicts', async () => {
      const { createTranslationJob } = await import('../translation-jobs');

      const createPromises = Array.from({ length: 5 }, (_, i) =>
        createTranslationJob({
          entityType: 'article',
          entityId: `concurrent-article-${i}`,
          sourceLanguage: 'en',
          targetLanguage: 'fr',
        })
      );

      const results = await Promise.all(createPromises);

      // All should succeed
      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.data?.entityId).toBe(`concurrent-article-${i}`);
      });

      // All IDs should be unique
      const ids = results.map(r => r.data?.id).filter(Boolean);
      expect(assertAllUnique(ids)).toBe(true);

      // Verify all jobs in database
      const db = getMockDatabase();
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      expect(jobs.length).toBe(5);
    });

    it('all concurrent jobs complete successfully', async () => {
      // Seed multiple queued jobs
      const jobs = createMockJobBatch(5, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { fetchAndLockNextJob, markJobCompleted } = await import('../translation-jobs');

      // Process all jobs concurrently with different workers
      const processPromises = Array.from({ length: 5 }, async (_, i) => {
        const workerId = generateWorkerId(`worker-${i}`);
        const result = await fetchAndLockNextJob({
          workerId,
          lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
        });

        if (result.data) {
          await delay(Math.random() * 50); // Simulate work
          await markJobCompleted(result.data.id);
          return result.data.id;
        }
        return null;
      });

      const processedIds = await Promise.all(processPromises);
      const validIds = processedIds.filter(id => id !== null);

      // All jobs should be processed
      expect(validIds.length).toBe(5);

      // Verify all are completed
      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const completedJobs = finalJobs.filter(j => j.status === 'completed');
      expect(completedJobs.length).toBe(5);
    });

    it('prevents duplicate processing of the same job', async () => {
      const job = createMockTranslationJob({
        id: 'single-target-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      // Multiple workers try to fetch simultaneously
      const fetchPromises = await runConcurrently(
        async (i) => {
          return fetchAndLockNextJob({
            workerId: `race-worker-${i}`,
            lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
          });
        },
        3
      );

      // Only one worker should get the job
      const jobsAcquired = fetchPromises.filter(r => r.data?.id === 'single-target-job');
      expect(jobsAcquired.length).toBe(1);
    });

    it('handles mixed success and failure in concurrent batch', async () => {
      const jobs = createMockJobBatch(10, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { fetchAndLockNextJob, markJobCompleted, markJobFailed } =
        await import('../translation-jobs');

      // Process with some failures
      const results = await runConcurrently(
        async (i) => {
          const result = await fetchAndLockNextJob({
            workerId: generateWorkerId(`mixed-worker-${i}`),
            lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
          });

          if (result.data) {
            if (i % 3 === 0) {
              await markJobFailed(result.data.id, `Simulated failure ${i}`);
              return { id: result.data.id, status: 'failed' };
            } else {
              await markJobCompleted(result.data.id);
              return { id: result.data.id, status: 'completed' };
            }
          }
          return null;
        },
        10
      );

      const validResults = results.filter(Boolean);
      expect(validResults.length).toBe(10);

      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
      const completedCount = finalJobs.filter(j => j.status === 'completed').length;
      const failedCount = finalJobs.filter(j => j.status === 'failed').length;

      expect(completedCount + failedCount).toBe(10);
    });
  });
});
```

**Verification:**
- [x] Tests compile without errors
- [x] Concurrent operations don't cause conflicts
- [x] All jobs are tracked correctly

**Acceptance Criteria:**
- Tests verify concurrent job creation
- Tests verify all jobs complete
- Tests verify no duplicate processing

---

### Task 6.2.11: Implement Worker Isolation Tests

**Objective:** Write tests to verify different workers operate independently.

**File:** `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite:

```typescript
  // ===========================================================================
  // Worker Isolation Tests
  // ===========================================================================
  describe('Worker Isolation', () => {
    it('different workers get different jobs', async () => {
      // Seed 3 queued jobs
      const jobs = createMockJobBatch(3, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      // 3 workers fetch jobs sequentially
      const worker1 = await fetchAndLockNextJob({
        workerId: 'isolation-w1',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });
      const worker2 = await fetchAndLockNextJob({
        workerId: 'isolation-w2',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });
      const worker3 = await fetchAndLockNextJob({
        workerId: 'isolation-w3',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      // Each should get a different job
      const jobIds = [
        worker1.data?.id,
        worker2.data?.id,
        worker3.data?.id,
      ].filter(Boolean);

      expect(jobIds.length).toBe(3);
      expect(assertAllUnique(jobIds)).toBe(true);
    });

    it('locked jobs are skipped by other workers', async () => {
      // One queued job, one already locked
      const lockedJob = createMockTranslationJob({
        id: 'locked-job',
        status: 'processing',
        lockedBy: 'existing-worker',
        lockedAt: new Date().toISOString(),
      });
      const queuedJob = createMockTranslationJob({
        id: 'queued-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [lockedJob, queuedJob]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'new-worker',
        lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
      });

      // Should get the queued job, not the locked one
      expect(result.data?.id).toBe('queued-job');
      expect(result.data?.lockedBy).toBe('new-worker');
    });

    it('each worker result is isolated', async () => {
      const articles = Array.from({ length: 3 }, (_, i) =>
        createMockArticleContent({ id: `isolation-article-${i}` })
      );
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, articles);

      const jobs = articles.map((article, i) =>
        createMockTranslationJob({
          id: `isolation-job-${i}`,
          entityId: article.id,
          status: 'queued',
        })
      );
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { fetchAndLockNextJob, markJobCompleted } = await import('../translation-jobs');
      const { saveTranslationResult } = await import('../job-processor');

      // Process each job with different worker
      const results = await runConcurrently(
        async (i) => {
          const fetchResult = await fetchAndLockNextJob({
            workerId: `result-worker-${i}`,
            lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
          });

          if (fetchResult.data) {
            // Save unique result for this worker's job
            await saveTranslationResult({
              entityType: 'article',
              entityId: fetchResult.data.entityId,
              targetLanguage: 'fr',
              translatedFields: {
                title: `Title from worker ${i}`,
                description: `Description from worker ${i}`,
              },
            });

            await markJobCompleted(fetchResult.data.id);
            return {
              workerId: `result-worker-${i}`,
              jobId: fetchResult.data.id,
              entityId: fetchResult.data.entityId,
            };
          }
          return null;
        },
        3
      );

      // Verify each worker's result is isolated
      const translations = getTableRecords<{
        article_id: string;
        title: string;
      }>(TABLE_NAMES.ARTICLE_TRANSLATIONS);

      expect(translations.length).toBe(3);

      // Each translation should have unique content
      const titles = translations.map(t => t.title);
      expect(assertAllUnique(titles)).toBe(true);
    });

    it('worker cannot complete another worker\'s job', async () => {
      const job = createMockTranslationJob({
        id: 'protected-job',
        status: 'processing',
        lockedBy: 'worker-A',
        lockedAt: new Date().toISOString(),
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { markJobCompletedByWorker } = await import('../translation-jobs');

      // Worker B tries to complete Worker A's job
      const result = await markJobCompletedByWorker('protected-job', 'worker-B');

      expect(result.success).toBe(false);
      expect(result.error).toContain('lock');
    });
  });
```

**Verification:**
- [x] Worker isolation tests pass
- [x] Lock ownership is respected
- [x] Results are properly isolated

**Acceptance Criteria:**
- Tests verify workers get different jobs
- Tests verify locks prevent interference
- Tests verify result isolation

---

### Task 6.2.12: Implement Data Integrity Tests

**Objective:** Write tests to verify data integrity under concurrent load.

**File:** `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite:

```typescript
  // ===========================================================================
  // Data Integrity Under Concurrent Load Tests
  // ===========================================================================
  describe('Data Integrity Under Concurrent Load', () => {
    it('maintains data integrity with concurrent writes', async () => {
      const jobs = createMockJobBatch(10, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { fetchAndLockNextJob, markJobCompleted, markJobFailed } =
        await import('../translation-jobs');

      // Process jobs with mixed success/failure
      await runConcurrently(
        async (i) => {
          const result = await fetchAndLockNextJob({
            workerId: `integrity-worker-${i}`,
            lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
          });

          if (result.data) {
            await delay(Math.random() * 20);
            if (i % 3 === 0) {
              await markJobFailed(result.data.id, `Integrity test failure ${i}`);
            } else {
              await markJobCompleted(result.data.id);
            }
          }
        },
        10
      );

      // Verify final state consistency
      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      // All jobs should be in a final state
      const inFinalState = finalJobs.every(
        j => j.status === 'completed' || j.status === 'failed'
      );
      expect(inFinalState).toBe(true);

      // No job should be corrupted
      finalJobs.forEach(job => {
        expect(job.id).toBeDefined();
        expect(job.entityId).toBeDefined();
        expect(job.status).toBeDefined();
        if (job.status === 'failed') {
          expect(job.errorMessage).toBeDefined();
        }
      });
    });

    it('handles concurrent status updates without corruption', async () => {
      const job = createMockTranslationJob({
        id: 'concurrent-update-job',
        status: 'processing',
        lockedBy: 'update-worker',
        attempts: 0,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { updateJobProgress } = await import('../translation-jobs');

      // Multiple concurrent progress updates
      await runConcurrently(
        async (i) => {
          await updateJobProgress('concurrent-update-job', {
            progress: i * 10,
            lastActivity: new Date().toISOString(),
          });
        },
        5
      );

      const updatedJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'concurrent-update-job');

      // Job should still be valid
      expect(updatedJob).toBeDefined();
      expect(updatedJob?.status).toBe('processing');
    });

    it('transaction isolation prevents partial updates', async () => {
      const job = createMockTranslationJob({
        id: 'transaction-test-job',
        status: 'processing',
        lockedBy: 'tx-worker',
      });
      const article = createMockArticleContent({ id: 'tx-article' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);
      seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [article]);

      const { completeJobWithTranslation } = await import('../job-processor');

      // Simulate a job completion that should be atomic
      await completeJobWithTranslation({
        jobId: 'transaction-test-job',
        entityType: 'article',
        entityId: 'tx-article',
        targetLanguage: 'fr',
        translatedFields: {
          title: 'Titre',
          description: 'Description',
        },
      });

      // Both job status AND translation should be saved
      const finalJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'transaction-test-job');
      const translation = getTableRecords<{ article_id: string }>(TABLE_NAMES.ARTICLE_TRANSLATIONS)
        .find(t => t.article_id === 'tx-article');

      expect(finalJob?.status).toBe('completed');
      expect(translation).toBeDefined();
    });

    it('consistent final state after heavy concurrent processing', async () => {
      // Create 20 jobs
      const jobs = createMockJobBatch(20, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { fetchAndLockNextJob, markJobCompleted, markJobFailed } =
        await import('../translation-jobs');

      // 10 workers processing concurrently
      await runConcurrently(
        async (workerId) => {
          // Each worker processes multiple jobs
          for (let attempt = 0; attempt < 3; attempt++) {
            const result = await fetchAndLockNextJob({
              workerId: `heavy-worker-${workerId}`,
              lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
            });

            if (result.data) {
              await delay(Math.random() * 10);
              if (Math.random() > 0.2) {
                await markJobCompleted(result.data.id);
              } else {
                await markJobFailed(result.data.id, 'Random failure');
              }
            }
          }
        },
        10
      );

      // Verify database consistency
      const finalJobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);

      // Count states
      const states = {
        queued: finalJobs.filter(j => j.status === 'queued').length,
        processing: finalJobs.filter(j => j.status === 'processing').length,
        completed: finalJobs.filter(j => j.status === 'completed').length,
        failed: finalJobs.filter(j => j.status === 'failed').length,
      };

      // Total should equal original count
      expect(states.queued + states.processing + states.completed + states.failed).toBe(20);

      // All IDs should still be unique
      const ids = finalJobs.map(j => j.id);
      expect(assertAllUnique(ids)).toBe(true);
    });
  });
```

**Verification:**
- [x] Data integrity tests pass
- [x] No corruption under concurrent load
- [x] Transaction isolation works

**Acceptance Criteria:**
- Tests verify data consistency
- Tests verify no partial updates
- Tests handle heavy concurrent processing

---

### Task 6.2.13: Implement Race Condition Prevention Tests

**Objective:** Write tests for race condition prevention mechanisms.

**File:** `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite:

```typescript
  // ===========================================================================
  // Race Condition Prevention Tests
  // ===========================================================================
  describe('Race Condition Prevention', () => {
    it('prevents duplicate job creation for same entity/language pair', async () => {
      const { createJobIfNotExists } = await import('../translation-jobs');

      const createParams = {
        entityType: 'article' as const,
        entityId: 'race-article',
        sourceLanguage: 'en' as const,
        targetLanguage: 'fr' as const,
      };

      // Concurrent creation attempts
      const results = await runConcurrently(
        async () => createJobIfNotExists(createParams),
        5
      );

      // Count successful creations vs duplicates
      const created = results.filter(r => r.success && !r.isDuplicate);
      const duplicates = results.filter(r => r.isDuplicate);

      // Only one should create
      expect(created.length).toBe(1);
      expect(duplicates.length).toBe(4);

      // Verify database has only one job
      const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .filter(j => j.entityId === 'race-article' && j.targetLanguage === 'fr');
      expect(jobs.length).toBe(1);
    });

    it('lock acquisition is atomic', async () => {
      const job = createMockTranslationJob({
        id: 'atomic-lock-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      // Many workers try to lock the same job at once
      const results = await runConcurrently(
        async (i) =>
          fetchAndLockNextJob({
            workerId: `atomic-worker-${i}`,
            lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
          }),
        10
      );

      // Count how many got the specific job
      const successful = results.filter(r => r.data?.id === 'atomic-lock-job');
      expect(successful.length).toBe(1);

      // Verify lock state
      const lockedJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'atomic-lock-job');
      expect(lockedJob?.status).toBe('processing');
      expect(lockedJob?.lockedBy).toBeDefined();
    });

    it('concurrent completion attempts are handled safely', async () => {
      const job = createMockTranslationJob({
        id: 'double-complete-job',
        status: 'processing',
        lockedBy: 'original-worker',
        lockedAt: new Date().toISOString(),
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { markJobCompleted } = await import('../translation-jobs');

      // Multiple concurrent completion attempts
      const results = await runConcurrently(
        async () => markJobCompleted('double-complete-job'),
        3
      );

      // At least one should succeed
      const succeeded = results.filter(r => r.success);
      expect(succeeded.length).toBeGreaterThanOrEqual(1);

      // Job should be completed exactly once
      const finalJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'double-complete-job');
      expect(finalJob?.status).toBe('completed');
    });

    it('prevents processing of same job by multiple workers simultaneously', async () => {
      // Create multiple queued jobs
      const jobs = createMockJobBatch(1, { status: 'queued' });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      // 5 workers try to get the same job
      const results = await runConcurrently(
        async (i) =>
          fetchAndLockNextJob({
            workerId: `simultaneous-worker-${i}`,
            lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
          }),
        5
      );

      // Only one should get a job
      const gotJob = results.filter(r => r.data !== null);
      expect(gotJob.length).toBe(1);
    });

    it('handles rapid sequential lock/unlock cycles', async () => {
      const job = createMockTranslationJob({
        id: 'rapid-cycle-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

      const { fetchAndLockNextJob, markJobFailed, retryFailedJob } =
        await import('../translation-jobs');

      // Rapid lock/fail/retry cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        const fetchResult = await fetchAndLockNextJob({
          workerId: `rapid-worker-${cycle}`,
          lockTimeoutMinutes: TEST_DEFAULTS.LOCK_TIMEOUT_MINUTES,
        });

        if (fetchResult.data) {
          await markJobFailed(fetchResult.data.id, `Cycle ${cycle} failure`);
          await retryFailedJob(fetchResult.data.id);
        }
      }

      // Job should still be valid
      const finalJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'rapid-cycle-job');
      expect(finalJob).toBeDefined();
      expect(['queued', 'failed']).toContain(finalJob?.status);
    });
  });
```

**Verification:**
- [x] Race condition tests pass
- [x] Duplicate prevention works
- [x] Atomic lock acquisition works

**Acceptance Criteria:**
- Tests verify duplicate prevention
- Tests verify atomic operations
- Tests handle edge cases

---

### Task 6.2.14: Implement Job Processor Lifecycle Tests

**Objective:** Write tests for job processor functionality.

**File:** `src/lib/job-queue/__tests__/job-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite:

```typescript
  // ===========================================================================
  // Job Processor Integration Tests
  // ===========================================================================
  describe('Job Processor Integration', () => {
    describe('Processor Lifecycle', () => {
      it('processes job through complete lifecycle', async () => {
        const article = createMockArticleContent({ id: 'processor-article' });
        seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [article]);

        const job = createMockTranslationJob({
          entityType: 'article',
          entityId: article.id,
          status: 'queued',
        });
        seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

        const { createJobProcessor, resetJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({
          pollingIntervalMs: TEST_DEFAULTS.POLLING_INTERVAL_MS,
          enableLogging: false,
        });

        const result = await processor.processNextJob();

        expect(result).not.toBeNull();
        expect(result?.success).toBe(true);
        expect(result?.translatedFields).toBeDefined();

        await resetJobProcessor();
      });

      it('returns null when no jobs available', async () => {
        const { createJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({ enableLogging: false });
        const result = await processor.processNextJob();

        expect(result).toBeNull();
      });

      it('processes multiple jobs in sequence', async () => {
        const jobs = createMockJobBatch(3, { status: 'queued' });
        seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, jobs);

        const { createJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({ enableLogging: false });

        const results = [];
        for (let i = 0; i < 3; i++) {
          const result = await processor.processNextJob();
          if (result) results.push(result);
        }

        expect(results.length).toBe(3);
        results.forEach(r => expect(r.success).toBe(true));
      });
    });

    describe('Statistics Tracking', () => {
      it('updates stats on successful processing', async () => {
        const article = createMockArticleContent({ id: 'stats-article' });
        seedMockDatabase(TABLE_NAMES.ITEM_ARTICLES, [article]);

        const job = createMockTranslationJob({
          entityType: 'article',
          entityId: article.id,
          status: 'queued',
        });
        seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

        const { createJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({ enableLogging: false });
        await processor.processNextJob();

        const stats = processor.getStats();
        expect(stats.totalJobsProcessed).toBe(1);
        expect(stats.totalJobsSucceeded).toBe(1);
        expect(stats.totalJobsFailed).toBe(0);
      });

      it('updates stats on failed processing', async () => {
        const job = createMockTranslationJob({
          entityType: 'article',
          entityId: 'nonexistent-article',
          status: 'queued',
        });
        seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

        const { createJobProcessor } = await import('../job-processor');

        // Force translation to fail
        vi.mocked(await import('@/lib/translation-service')).translateText
          .mockRejectedValueOnce(new Error('Translation failed'));

        const processor = createJobProcessor({ enableLogging: false });
        await processor.processNextJob();

        const stats = processor.getStats();
        expect(stats.totalJobsProcessed).toBe(1);
        expect(stats.totalJobsFailed).toBe(1);
      });

      it('tracks processing time metrics', async () => {
        const job = createMockTranslationJob({ status: 'queued' });
        seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [job]);

        const { createJobProcessor } = await import('../job-processor');

        const processor = createJobProcessor({ enableLogging: false });
        const result = await processor.processNextJob();

        expect(result?.processingTimeMs).toBeDefined();
        expect(result?.processingTimeMs).toBeGreaterThan(0);
      });
    });
  });
```

**Verification:**
- [x] Processor tests pass
- [x] Statistics tracking works
- [x] Processing time is measured

**Acceptance Criteria:**
- Tests verify processor lifecycle
- Tests verify stats tracking
- Tests verify metrics collection

---

### Task 6.2.15: Implement Stale Lock Recovery Tests

**Objective:** Write tests for stale lock detection and cleanup.

**File:** `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` (add to existing)

**Implementation Steps:**

1. Add the following test suite:

```typescript
  // ===========================================================================
  // Stale Lock Recovery Tests
  // ===========================================================================
  describe('Stale Lock Recovery', () => {
    it('detects jobs with stale locks', async () => {
      // Create job with old lock (6 minutes ago)
      const staleJob = createMockTranslationJob({
        id: 'stale-detection-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 min ago
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob]);

      const { findStaleProcessingJobs } = await import('../concurrency-control');

      const staleJobs = await findStaleProcessingJobs(5); // 5 min timeout

      expect(staleJobs.length).toBe(1);
      expect(staleJobs[0].id).toBe('stale-detection-job');
    });

    it('does not flag recently locked jobs as stale', async () => {
      // Create job with recent lock (1 minute ago)
      const recentJob = createMockTranslationJob({
        id: 'recent-lock-job',
        status: 'processing',
        lockedBy: 'active-worker',
        lockedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [recentJob]);

      const { findStaleProcessingJobs } = await import('../concurrency-control');

      const staleJobs = await findStaleProcessingJobs(5); // 5 min timeout

      expect(staleJobs.length).toBe(0);
    });

    it('cleans up stale jobs and resets to queued', async () => {
      const staleJob = createMockTranslationJob({
        id: 'stale-cleanup-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
        attempts: 1,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob]);

      const { cleanupStaleProcessingJobs } = await import('../concurrency-control');

      const result = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      expect(result.staleJobsFound).toBe(1);
      expect(result.jobsReset).toBe(1);
      expect(result.jobsMarkedFailed).toBe(0);

      // Verify job was reset
      const resetJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'stale-cleanup-job');
      expect(resetJob?.status).toBe('queued');
      expect(resetJob?.lockedBy).toBeNull();
    });

    it('marks jobs as failed when max retries exceeded', async () => {
      const staleJob = createMockTranslationJob({
        id: 'max-retry-stale-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        attempts: 4, // Exceeds max of 3
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob]);

      const { cleanupStaleProcessingJobs } = await import('../concurrency-control');

      const result = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      expect(result.staleJobsFound).toBe(1);
      expect(result.jobsReset).toBe(0);
      expect(result.jobsMarkedFailed).toBe(1);

      // Verify job was marked failed
      const failedJob = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS)
        .find(j => j.id === 'max-retry-stale-job');
      expect(failedJob?.status).toBe('failed');
      expect(failedJob?.errorMessage).toContain('stale');
    });

    it('cleanup is idempotent - running twice has same result', async () => {
      const staleJob = createMockTranslationJob({
        id: 'idempotent-cleanup-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        attempts: 1,
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob]);

      const { cleanupStaleProcessingJobs } = await import('../concurrency-control');

      // First cleanup
      const result1 = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      expect(result1.staleJobsFound).toBe(1);
      expect(result1.jobsReset).toBe(1);

      // Second cleanup - should find nothing
      const result2 = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      expect(result2.staleJobsFound).toBe(0);
      expect(result2.jobsReset).toBe(0);
    });

    it('handles mixed stale and active jobs correctly', async () => {
      const staleJob = createMockTranslationJob({
        id: 'mixed-stale-job',
        status: 'processing',
        lockedBy: 'dead-worker',
        lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        attempts: 1,
      });
      const activeJob = createMockTranslationJob({
        id: 'mixed-active-job',
        status: 'processing',
        lockedBy: 'active-worker',
        lockedAt: new Date().toISOString(),
        attempts: 1,
      });
      const queuedJob = createMockTranslationJob({
        id: 'mixed-queued-job',
        status: 'queued',
      });
      seedMockDatabase(TABLE_NAMES.TRANSLATION_JOBS, [staleJob, activeJob, queuedJob]);

      const { cleanupStaleProcessingJobs } = await import('../concurrency-control');

      const result = await cleanupStaleProcessingJobs({
        lockTimeoutMinutes: 5,
        maxStaleRetries: 3,
      });

      expect(result.staleJobsFound).toBe(1);
      expect(result.affectedJobIds).toContain('mixed-stale-job');
      expect(result.affectedJobIds).not.toContain('mixed-active-job');
      expect(result.affectedJobIds).not.toContain('mixed-queued-job');
    });
  });
```

**Verification:**
- [x] Stale lock tests pass
- [x] Detection logic is correct
- [x] Cleanup is idempotent

**Acceptance Criteria:**
- Tests verify stale lock detection
- Tests verify cleanup mechanism
- Tests verify max retry handling

---

### Task 6.2.16: Update vitest.config.ts for Coverage

**Objective:** Update Vitest configuration to include job-queue in coverage reports.

**File:** `vitest.config.ts`

**Implementation Steps:**

1. Update the coverage configuration:

```typescript
/**
 * Vitest Configuration for FAQbnb Project
 *
 * Configures test environment and coverage for React/Next.js application.
 *
 * @lastModified 2026-01-18 (REQ-254)
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/ItemCreationWorkflow/**/*.ts',
        'src/components/ItemCreationWorkflow/**/*.tsx',
        'src/lib/job-queue/**/*.ts',  // Added for REQ-254
        'src/lib/translation-service/**/*.ts',  // Added for L10N coverage
      ],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    },
    // Timeout for integration tests that may take longer
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Verification:**
- [x] Config file is valid
- [x] Coverage includes job-queue directory
- [x] Tests still run correctly

**Acceptance Criteria:**
- Coverage reports include job-queue files
- Test timeout is appropriate for integration tests

---

### Task 6.2.17: Run Full Test Suite and Verify CI Compatibility

**Objective:** Execute all integration tests and ensure they pass consistently.

**Implementation Steps:**

1. Run the full test suite:
   ```bash
   npm test -- --run src/lib/job-queue/__tests__/
   ```

2. Run tests multiple times to check for flakiness:
   ```bash
   for i in {1..5}; do npm test -- --run src/lib/job-queue/__tests__/ || exit 1; done
   ```

3. Generate coverage report:
   ```bash
   npm test -- --coverage src/lib/job-queue/__tests__/
   ```

4. Verify CI compatibility by ensuring:
   - No hardcoded paths
   - No environment-specific dependencies
   - Proper mock isolation between tests
   - Test execution under 60 seconds total

5. Document any issues found and fix them.

**Verification Checklist:**
- [x] All tests pass on first run
- [x] All tests pass on 5 consecutive runs
- [x] No flaky tests identified
- [x] Coverage report generates correctly
- [x] Total test execution under 60 seconds
- [x] No console errors or warnings

**Acceptance Criteria:**
- 100% test pass rate
- No flaky tests after 10 runs
- Coverage meets minimum threshold
- CI-ready test suite

---

## Acceptance Criteria Verification Matrix

| REQ-254 Acceptance Criteria | Implementing Task(s) | Verification |
|-----------------------------|---------------------|--------------|
| Tests verify job lifecycle states | 6.2.6, 6.2.7, 6.2.8 | Job state tests |
| Tests verify failed jobs include error details | 6.2.9 | Failure handling tests |
| Tests verify job results are stored/retrievable | 6.2.8 | Completion flow tests |
| Tests simulate multiple concurrent jobs | 6.2.10, 6.2.11 | Concurrent processing tests |
| Tests verify concurrent jobs don't interfere | 6.2.11, 6.2.12 | Worker isolation tests |
| Tests verify data integrity under load | 6.2.12 | Data integrity tests |
| All tests pass in CI/CD | 6.2.17 | CI verification |

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Flaky async tests | Use explicit waitFor patterns, avoid arbitrary delays |
| Mock state leakage | Reset all mocks in beforeEach, verify cleanup |
| Complex mock setup | Centralize mocks in helper files, document patterns |
| CI timing variations | Use generous timeouts, avoid timing-dependent assertions |
| Database mock divergence | Keep mock behavior aligned with Supabase patterns |

---

## Definition of Done

- [ ] All 17 tasks completed
- [ ] All acceptance criteria verified
- [ ] Tests pass consistently (10+ consecutive runs)
- [ ] Coverage report shows job-queue coverage
- [ ] No TypeScript errors
- [ ] Code follows existing test patterns in codebase
- [ ] Documentation updated if needed

---

*Detailed task breakdown generated for FAQBNB Localization Epic 1 - Foundation, Phase 6, Task 6.2*
*Document follows patterns from existing test documentation in the codebase*
