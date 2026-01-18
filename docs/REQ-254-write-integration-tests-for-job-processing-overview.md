# REQ-254: Integration Tests for Translation Job Processing - Implementation Overview

**Generated:** 2026-01-18 14:30:00 UTC
**Last Modified:** 2026-01-18 14:30:00 UTC
**Request Reference:** REQ-254 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
**Phase:** 6 - Testing & Validation
**Task ID:** 6.2

---

## 1. Executive Summary

This document provides a comprehensive technical breakdown for implementing integration tests for the translation job processing system. The tests will verify the complete job lifecycle from creation through completion, concurrent job processing scenarios, failure handling, and data integrity under load. These tests ensure the job queue module, job processor, and concurrency control mechanisms work together reliably in production-like conditions.

---

## 2. Request Reference

### From `docs/gen_requests.md` - REQ-254

**Summary**: The system must include comprehensive integration tests that verify translation jobs are processed correctly from creation to completion, including scenarios with multiple concurrent jobs.

### Acceptance Criteria

- [ ] Tests verify a job progresses through all lifecycle states (created → queued → processing → completed)
- [ ] Tests verify failed jobs transition to the failed state and include error details
- [ ] Tests verify job results are correctly stored and retrievable via status endpoints
- [ ] Tests simulate multiple concurrent jobs and verify all complete successfully
- [ ] Tests verify concurrent jobs do not interfere with each other's data or state
- [ ] Tests verify system maintains data integrity under concurrent load
- [ ] All integration tests pass consistently in CI/CD pipeline

---

## 3. Implementation Plan Reference

**Source**: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`

### Relevant Sections

- **Phase 6: Testing & Validation** - Task 6.2: Integration Tests
  - [ ] Test job lifecycle
  - [ ] Test concurrent processing

### Component Architecture (from Plan)

```
/src/lib/job-queue/
├── index.ts                        # Barrel exports
├── translation-jobs.ts             # Job queue module (REQ-243)
├── translation-jobs.types.ts       # Type definitions
├── job-processor.ts                # Job processor (REQ-244)
└── concurrency-control.ts          # Concurrency control (REQ-245)

/src/lib/translation-service/
├── index.ts                        # Translation service exports
├── translation-service.ts          # Main translation wrapper (REQ-240)
├── translation-service.types.ts    # TypeScript types
├── providers/
│   ├── claude-provider.ts          # Claude implementation (REQ-236)
│   └── openai-provider.ts          # OpenAI fallback (REQ-237)
└── utils/
    ├── rate-limiter.ts             # Rate limiting (REQ-238)
    └── retry.ts                    # Retry logic (REQ-239)

/src/app/api/admin/
├── process-translations/route.ts   # Job processing trigger API
└── translation-jobs/route.ts       # Job status API
```

---

## 4. Existing Patterns Analysis

### 4.1 Integration Test Patterns in Codebase

**Reference Files**:
- `src/__tests__/beta-access-requests.test.ts` - API integration testing with mocked fetch
- `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx` - Component integration testing
- `src/components/ItemCapture/__tests__/ItemCapture.integration.test.tsx` - Multi-component flow testing

**Key Patterns Identified**:

1. **Mock Setup Pattern**: Use `vi.mock()` for external dependencies (fetch, Supabase)
2. **Helper Factory Functions**: Create mock data with consistent shapes
3. **Async Flow Testing**: Use `waitFor()` and proper promise handling
4. **Grouped Test Suites**: Organize tests by feature area (lifecycle, concurrency, error handling)
5. **Test Utilities Export**: Export helpers for reuse in other test files

### 4.2 Testing Framework Configuration

**From `vitest.config.ts`**:
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
  },
});
```

### 4.3 Job Queue Module Interfaces

**From REQ-243 (translation-jobs.types.ts)**:
```typescript
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}
```

### 4.4 Job Processor Interfaces

**From REQ-244 (job-processor.ts)**:
```typescript
export interface JobProcessingResult {
  jobId: string;
  success: boolean;
  entityType: EntityType;
  entityId: string;
  targetLanguage: SupportedLanguage;
  translatedFields?: Record<string, string>;
  errorMessage?: string;
  processingTimeMs: number;
}

export interface ProcessingRunResult {
  startedAt: string;
  completedAt: string;
  jobsProcessed: number;
  jobsSucceeded: number;
  jobsFailed: number;
  results: JobProcessingResult[];
}
```

### 4.5 Concurrency Control Interfaces

**From REQ-245 (concurrency-control.ts)**:
```typescript
export interface CleanupResult {
  staleJobsFound: number;
  jobsReset: number;
  jobsMarkedFailed: number;
  affectedJobIds: string[];
  cleanedAt: string;
}

export interface LockStatistics {
  activeLocksCount: number;
  staleLocksCount: number;
  locksByWorker: Record<string, number>;
  avgLockDurationMs: number;
}
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/lib/job-queue/__tests__/job-processing.integration.test.ts` | Main integration test file for job lifecycle and processing |
| `src/lib/job-queue/__tests__/concurrent-processing.integration.test.ts` | Concurrent job processing tests |
| `src/lib/job-queue/__tests__/helpers/mockFactories.ts` | Shared test mock factories |
| `src/lib/job-queue/__tests__/helpers/testUtils.ts` | Shared test utility functions |
| `src/lib/job-queue/__tests__/helpers/mockSupabase.ts` | Supabase mock utilities |

### 5.2 Existing Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|------------------|
| `src/lib/job-queue/translation-jobs.ts` | Job queue functions under test |
| `src/lib/job-queue/translation-jobs.types.ts` | Type definitions |
| `src/lib/job-queue/job-processor.ts` | Job processor under test |
| `src/lib/job-queue/concurrency-control.ts` | Concurrency control under test |
| `src/lib/translation-service/translation-service.ts` | Translation service (to be mocked) |
| `src/lib/supabase-server.ts` | Server-side Supabase client |

### 5.3 Configuration Files (May Need Update)

| File Path | Potential Modification |
|-----------|----------------------|
| `vitest.config.ts` | Add job-queue to coverage includes |
| `vitest.setup.ts` | Add integration test specific setup if needed |

---

## 6. Task Breakdown

### Task 6.2.1: Create Test Infrastructure [0.5 story points]

**Create test helper files**:
- `mockFactories.ts`: Factory functions for creating test data
- `testUtils.ts`: Utility functions for common test operations
- `mockSupabase.ts`: Supabase mock setup utilities

**Mock Factories Required**:
```typescript
// mockFactories.ts
import type {
  TranslationJob,
  JobStatus,
  EntityType,
  SupportedLanguage,
} from '../translation-jobs.types';
import type {
  JobProcessingResult,
  ProcessingRunResult,
} from '../job-processor';

export function createMockTranslationJob(
  overrides?: Partial<TranslationJob>
): TranslationJob {
  return {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

export function createMockJobProcessingResult(
  overrides?: Partial<JobProcessingResult>
): JobProcessingResult {
  return {
    jobId: `job-${Date.now()}`,
    success: true,
    entityType: 'article',
    entityId: `entity-${Date.now()}`,
    targetLanguage: 'fr',
    translatedFields: {
      title: 'Translated Title',
      description: 'Translated Description',
    },
    processingTimeMs: 150,
    ...overrides,
  };
}

export function createMockProcessingRunResult(
  overrides?: Partial<ProcessingRunResult>
): ProcessingRunResult {
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

export function createMockArticleContent() {
  return {
    id: `article-${Date.now()}`,
    title: 'Test Article Title',
    description: 'Test article description for translation.',
    source_language: 'en',
    created_at: new Date().toISOString(),
  };
}

export function createMockItemContent() {
  return {
    id: `item-${Date.now()}`,
    name: 'Test Item Name',
    description: 'Test item description for translation.',
    source_language: 'en',
    created_at: new Date().toISOString(),
  };
}
```

**Test Utilities Required**:
```typescript
// testUtils.ts
import { vi } from 'vitest';

export interface MockSupabaseResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number;
}

export function createMockSupabaseClient() {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({ single: mockSingle, in: vi.fn() }));
  const mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq, in: vi.fn() }));
  const mockInsert = vi.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    upsert: vi.fn(() => ({ onConflict: vi.fn() })),
    eq: mockEq,
  }));
  const mockRpc = vi.fn();

  return {
    from: mockFrom,
    rpc: mockRpc,
    _mocks: {
      from: mockFrom,
      select: mockSelect,
      single: mockSingle,
      eq: mockEq,
      update: mockUpdate,
      insert: mockInsert,
      rpc: mockRpc,
    },
  };
}

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
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Job did not reach status '${expectedStatus}' within ${timeoutMs}ms`);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Mock Supabase Required**:
```typescript
// mockSupabase.ts
import { vi } from 'vitest';

let mockDatabase: Map<string, any[]> = new Map();

export function resetMockDatabase() {
  mockDatabase = new Map([
    ['translation_jobs', []],
    ['article_translations', []],
    ['item_translations', []],
    ['item_articles', []],
    ['items', []],
  ]);
}

export function getMockDatabase() {
  return mockDatabase;
}

export function seedMockDatabase(table: string, records: any[]) {
  mockDatabase.set(table, records);
}

export function createMockSupabaseServer() {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (col: string, val: any) => ({
          single: async () => {
            const records = mockDatabase.get(table) || [];
            const record = records.find(r => r[col] === val);
            return { data: record || null, error: null };
          },
          order: (col: string, opts?: any) => ({
            limit: (n: number) => ({
              data: (mockDatabase.get(table) || [])
                .filter(r => r[col] === val)
                .slice(0, n),
              error: null,
            }),
          }),
        }),
        single: async () => {
          const records = mockDatabase.get(table) || [];
          return { data: records[0] || null, error: null };
        },
        in: (col: string, vals: any[]) => ({
          data: (mockDatabase.get(table) || []).filter(r => vals.includes(r[col])),
          error: null,
        }),
      }),
      insert: (record: any) => ({
        select: () => ({
          single: async () => {
            const records = mockDatabase.get(table) || [];
            const newRecord = { ...record, id: record.id || `gen-${Date.now()}` };
            records.push(newRecord);
            mockDatabase.set(table, records);
            return { data: newRecord, error: null };
          },
        }),
      }),
      update: (updates: any) => ({
        eq: (col: string, val: any) => ({
          select: () => ({
            single: async () => {
              const records = mockDatabase.get(table) || [];
              const idx = records.findIndex(r => r[col] === val);
              if (idx >= 0) {
                records[idx] = { ...records[idx], ...updates };
                return { data: records[idx], error: null };
              }
              return { data: null, error: { message: 'Not found' } };
            },
          }),
        }),
        in: (col: string, vals: any[]) => ({
          data: null,
          error: null,
        }),
      }),
      upsert: (record: any, opts?: any) => ({
        data: record,
        error: null,
      }),
    }),
    rpc: async (fnName: string, params: any) => {
      if (fnName === 'fetch_and_lock_translation_job') {
        const jobs = mockDatabase.get('translation_jobs') || [];
        const queuedJob = jobs.find(j => j.status === 'queued');
        if (queuedJob) {
          queuedJob.status = 'processing';
          queuedJob.locked_by = params.p_worker_id;
          queuedJob.locked_at = new Date().toISOString();
          queuedJob.started_at = new Date().toISOString();
          queuedJob.attempts = (queuedJob.attempts || 0) + 1;
          return { data: [queuedJob], error: null };
        }
        return { data: [], error: null };
      }
      return { data: null, error: null };
    },
  };
}
```

### Task 6.2.2: Job Lifecycle Integration Tests [1 story point]

**File**: `job-processing.integration.test.ts`

**Test Suites**:

1. **Job Creation and Initial State**
   - Test job is created with 'queued' status
   - Test job has correct entity reference
   - Test job timestamps are set correctly
   - Test duplicate job prevention

2. **Job State Transitions**
   - Test queued → processing transition
   - Test processing → completed transition
   - Test processing → failed transition
   - Test failed job includes error details

3. **Job Completion Flow**
   - Test translation results are stored
   - Test completed_at timestamp is set
   - Test job can be retrieved after completion

4. **Job Failure Flow**
   - Test error message is captured
   - Test attempts counter is incremented
   - Test job can be retried (if under max attempts)

**Sample Test Structure**:
```typescript
// job-processing.integration.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockArticleContent,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
  createMockSupabaseServer,
} from './helpers/mockSupabase';

// Mock the Supabase server module
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: () => createMockSupabaseServer(),
}));

// Mock the translation service
vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockResolvedValue({
    translatedText: 'Translated text',
    provider: 'claude',
    tokensUsed: 100,
  }),
}));

describe('Translation Job Processing Integration', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Job Lifecycle States', () => {
    it('creates job with queued status', async () => {
      const { createTranslationJob } = await import('../translation-jobs');

      const result = await createTranslationJob({
        entityType: 'article',
        entityId: 'article-123',
        targetLanguage: 'fr',
      });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('queued');
      expect(result.data?.attempts).toBe(0);
      expect(result.data?.createdAt).toBeDefined();
    });

    it('transitions job from queued to processing when fetched', async () => {
      const job = createMockTranslationJob({ status: 'queued' });
      seedMockDatabase('translation_jobs', [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'worker-1',
        lockTimeoutMinutes: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('processing');
      expect(result.data?.lockedBy).toBe('worker-1');
      expect(result.data?.lockedAt).toBeDefined();
    });

    it('transitions job to completed on successful processing', async () => {
      const job = createMockTranslationJob({
        id: 'job-123',
        status: 'processing',
        lockedBy: 'worker-1',
      });
      seedMockDatabase('translation_jobs', [job]);

      const { markJobCompleted } = await import('../translation-jobs');

      const result = await markJobCompleted('job-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('completed');
      expect(result.data?.completedAt).toBeDefined();
    });

    it('transitions job to failed with error details', async () => {
      const job = createMockTranslationJob({
        id: 'job-456',
        status: 'processing',
        lockedBy: 'worker-1',
      });
      seedMockDatabase('translation_jobs', [job]);

      const { markJobFailed } = await import('../translation-jobs');

      const result = await markJobFailed('job-456', 'Translation API error');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('failed');
      expect(result.data?.errorMessage).toBe('Translation API error');
    });
  });

  describe('Complete Job Lifecycle', () => {
    it('processes job from creation to completion', async () => {
      // Seed source content
      const article = createMockArticleContent();
      seedMockDatabase('item_articles', [article]);

      const {
        createTranslationJob,
        fetchAndLockNextJob,
        markJobCompleted,
      } = await import('../translation-jobs');

      // Step 1: Create job
      const createResult = await createTranslationJob({
        entityType: 'article',
        entityId: article.id,
        targetLanguage: 'fr',
      });

      expect(createResult.data?.status).toBe('queued');

      // Step 2: Fetch and lock
      const fetchResult = await fetchAndLockNextJob({
        workerId: 'test-worker',
        lockTimeoutMinutes: 5,
      });

      expect(fetchResult.data?.status).toBe('processing');
      expect(fetchResult.data?.lockedBy).toBe('test-worker');

      // Step 3: Complete
      const completeResult = await markJobCompleted(fetchResult.data!.id);

      expect(completeResult.data?.status).toBe('completed');
      expect(completeResult.data?.completedAt).toBeDefined();
    });

    it('handles job failure and records error details', async () => {
      const job = createMockTranslationJob({ status: 'queued' });
      seedMockDatabase('translation_jobs', [job]);

      const {
        fetchAndLockNextJob,
        markJobFailed,
      } = await import('../translation-jobs');

      // Fetch job
      const fetchResult = await fetchAndLockNextJob({
        workerId: 'test-worker',
        lockTimeoutMinutes: 5,
      });

      // Mark as failed
      const errorMessage = 'API rate limit exceeded';
      const failResult = await markJobFailed(fetchResult.data!.id, errorMessage);

      expect(failResult.data?.status).toBe('failed');
      expect(failResult.data?.errorMessage).toBe(errorMessage);
      expect(failResult.data?.attempts).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Job Results Storage', () => {
    it('stores translation results in correct table', async () => {
      const article = createMockArticleContent();
      seedMockDatabase('item_articles', [article]);

      const { saveTranslation } = await import('../job-processor');

      const saved = await saveTranslation(
        'article',
        article.id,
        'fr',
        {
          title: 'Titre traduit',
          description: 'Description traduite',
        }
      );

      expect(saved).toBe(true);
    });

    it('retrieves job status via status endpoint pattern', async () => {
      const job = createMockTranslationJob({
        id: 'status-test-job',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      seedMockDatabase('translation_jobs', [job]);

      const { getJobsByEntity } = await import('../translation-jobs');

      const result = await getJobsByEntity('article', job.entityId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].status).toBe('completed');
    });
  });
});
```

### Task 6.2.3: Concurrent Processing Integration Tests [1.5 story points]

**File**: `concurrent-processing.integration.test.ts`

**Test Suites**:

1. **Multiple Concurrent Jobs**
   - Test multiple jobs can be created simultaneously
   - Test all jobs complete successfully
   - Test no job is processed twice

2. **Worker Isolation**
   - Test different workers get different jobs
   - Test locked jobs are skipped by other workers
   - Test each job result is isolated

3. **Data Integrity Under Load**
   - Test no data corruption with concurrent writes
   - Test transaction isolation
   - Test consistent final state

4. **Race Condition Prevention**
   - Test duplicate job creation prevention
   - Test lock acquisition is atomic
   - Test concurrent completion attempts

**Sample Test Structure**:
```typescript
// concurrent-processing.integration.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockTranslationJob,
  createMockArticleContent,
} from './helpers/mockFactories';
import {
  resetMockDatabase,
  seedMockDatabase,
  getMockDatabase,
  createMockSupabaseServer,
} from './helpers/mockSupabase';
import { delay } from './helpers/testUtils';

// Mock modules
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: () => createMockSupabaseServer(),
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

describe('Concurrent Job Processing Integration', () => {
  beforeEach(() => {
    resetMockDatabase();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Multiple Concurrent Jobs', () => {
    it('creates multiple jobs simultaneously without conflicts', async () => {
      const { createTranslationJob } = await import('../translation-jobs');

      const createPromises = Array.from({ length: 5 }, (_, i) =>
        createTranslationJob({
          entityType: 'article',
          entityId: `article-${i}`,
          targetLanguage: 'fr',
        })
      );

      const results = await Promise.all(createPromises);

      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.data?.entityId).toBe(`article-${i}`);
      });

      // Verify all jobs in database
      const db = getMockDatabase();
      expect(db.get('translation_jobs')).toHaveLength(5);
    });

    it('all concurrent jobs complete successfully', async () => {
      // Seed multiple queued jobs
      const jobs = Array.from({ length: 5 }, (_, i) =>
        createMockTranslationJob({
          id: `job-${i}`,
          entityId: `article-${i}`,
          status: 'queued',
        })
      );
      seedMockDatabase('translation_jobs', jobs);

      const {
        fetchAndLockNextJob,
        markJobCompleted,
      } = await import('../translation-jobs');

      // Process all jobs concurrently with different workers
      const processPromises = Array.from({ length: 5 }, async (_, i) => {
        const result = await fetchAndLockNextJob({
          workerId: `worker-${i}`,
          lockTimeoutMinutes: 5,
        });

        if (result.data) {
          await markJobCompleted(result.data.id);
          return result.data.id;
        }
        return null;
      });

      const processedIds = await Promise.all(processPromises);

      // All jobs should be processed
      const validIds = processedIds.filter(id => id !== null);
      expect(validIds).toHaveLength(5);
    });

    it('prevents duplicate processing of the same job', async () => {
      const job = createMockTranslationJob({
        id: 'single-job',
        status: 'queued',
      });
      seedMockDatabase('translation_jobs', [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      // Multiple workers try to fetch simultaneously
      const fetchPromises = Array.from({ length: 3 }, (_, i) =>
        fetchAndLockNextJob({
          workerId: `worker-${i}`,
          lockTimeoutMinutes: 5,
        })
      );

      const results = await Promise.all(fetchPromises);

      // Only one worker should get the job
      const jobsAcquired = results.filter(r => r.data !== null);
      expect(jobsAcquired).toHaveLength(1);
    });
  });

  describe('Worker Isolation', () => {
    it('different workers get different jobs', async () => {
      // Seed 3 queued jobs
      const jobs = Array.from({ length: 3 }, (_, i) =>
        createMockTranslationJob({
          id: `job-${i}`,
          status: 'queued',
        })
      );
      seedMockDatabase('translation_jobs', jobs);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      // 3 workers fetch jobs
      const worker1 = await fetchAndLockNextJob({ workerId: 'w1', lockTimeoutMinutes: 5 });
      const worker2 = await fetchAndLockNextJob({ workerId: 'w2', lockTimeoutMinutes: 5 });
      const worker3 = await fetchAndLockNextJob({ workerId: 'w3', lockTimeoutMinutes: 5 });

      // Each should get a different job
      const jobIds = [worker1.data?.id, worker2.data?.id, worker3.data?.id].filter(Boolean);
      const uniqueIds = new Set(jobIds);

      expect(uniqueIds.size).toBe(3);
    });

    it('locked jobs are skipped by other workers', async () => {
      // One queued job, one already locked
      const lockedJob = createMockTranslationJob({
        id: 'locked-job',
        status: 'processing',
        lockedBy: 'other-worker',
        lockedAt: new Date().toISOString(),
      });
      const queuedJob = createMockTranslationJob({
        id: 'queued-job',
        status: 'queued',
      });
      seedMockDatabase('translation_jobs', [lockedJob, queuedJob]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      const result = await fetchAndLockNextJob({
        workerId: 'new-worker',
        lockTimeoutMinutes: 5,
      });

      // Should get the queued job, not the locked one
      expect(result.data?.id).toBe('queued-job');
    });
  });

  describe('Data Integrity Under Concurrent Load', () => {
    it('maintains data integrity with concurrent writes', async () => {
      const jobs = Array.from({ length: 10 }, (_, i) =>
        createMockTranslationJob({
          id: `job-${i}`,
          entityId: `article-${i}`,
          status: 'queued',
        })
      );
      seedMockDatabase('translation_jobs', jobs);

      const {
        fetchAndLockNextJob,
        markJobCompleted,
        markJobFailed,
      } = await import('../translation-jobs');

      // Process jobs with mixed success/failure
      const processPromises = jobs.map(async (_, i) => {
        const result = await fetchAndLockNextJob({
          workerId: `worker-${i}`,
          lockTimeoutMinutes: 5,
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
      });

      const results = (await Promise.all(processPromises)).filter(Boolean);

      // Verify final state
      const db = getMockDatabase();
      const finalJobs = db.get('translation_jobs') || [];

      const completedCount = finalJobs.filter(j => j.status === 'completed').length;
      const failedCount = finalJobs.filter(j => j.status === 'failed').length;

      expect(completedCount + failedCount).toBe(10);
    });

    it('handles concurrent status updates without corruption', async () => {
      const job = createMockTranslationJob({
        id: 'concurrent-update-job',
        status: 'processing',
        lockedBy: 'worker-1',
      });
      seedMockDatabase('translation_jobs', [job]);

      const { updateJobStatus } = await import('../translation-jobs');

      // Multiple concurrent updates
      const updatePromises = [
        updateJobStatus('concurrent-update-job', { attempts: 1 }),
        updateJobStatus('concurrent-update-job', { attempts: 2 }),
        updateJobStatus('concurrent-update-job', { attempts: 3 }),
      ];

      await Promise.all(updatePromises);

      const db = getMockDatabase();
      const updatedJob = (db.get('translation_jobs') || []).find(
        j => j.id === 'concurrent-update-job'
      );

      // Should have one of the values (last write wins)
      expect(updatedJob?.attempts).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Race Condition Prevention', () => {
    it('prevents duplicate job creation for same entity/language', async () => {
      const { createJobIfNotExists } = await import('../concurrency-control');

      const createParams = {
        entityType: 'article' as const,
        entityId: 'article-123',
        targetLanguage: 'fr' as const,
      };

      // Concurrent creation attempts
      const createPromises = Array.from({ length: 5 }, () =>
        createJobIfNotExists(createParams)
      );

      const results = await Promise.all(createPromises);

      // Only one should create, others should return null
      const created = results.filter(r => r.data !== null);
      expect(created.length).toBeLessThanOrEqual(1);

      // Verify database has only one job
      const db = getMockDatabase();
      const jobs = (db.get('translation_jobs') || []).filter(
        j => j.entity_id === 'article-123' && j.target_language === 'fr'
      );
      expect(jobs.length).toBeLessThanOrEqual(1);
    });

    it('lock acquisition is atomic', async () => {
      const job = createMockTranslationJob({
        id: 'atomic-lock-job',
        status: 'queued',
      });
      seedMockDatabase('translation_jobs', [job]);

      const { fetchAndLockNextJob } = await import('../translation-jobs');

      // Many workers try to lock the same job at once
      const lockPromises = Array.from({ length: 10 }, (_, i) =>
        fetchAndLockNextJob({
          workerId: `worker-${i}`,
          lockTimeoutMinutes: 5,
        })
      );

      const results = await Promise.all(lockPromises);

      // Exactly one should succeed
      const successful = results.filter(r => r.data?.id === 'atomic-lock-job');
      expect(successful).toHaveLength(1);
    });
  });
});
```

### Task 6.2.4: Job Processor Integration Tests [1 story point]

**Add to**: `job-processing.integration.test.ts`

**Test Suites**:

1. **Processor Lifecycle**
   - Test processor starts and stops correctly
   - Test processor fetches and processes jobs
   - Test processor handles empty queue

2. **Error Handling**
   - Test processor handles translation failures
   - Test consecutive failures trigger pause
   - Test processor resumes after pause

3. **Statistics Tracking**
   - Test stats are updated on success
   - Test stats are updated on failure
   - Test stats can be retrieved

**Sample Test Structure**:
```typescript
describe('Job Processor Integration', () => {
  describe('Processor Lifecycle', () => {
    it('processes job through complete lifecycle', async () => {
      const article = createMockArticleContent();
      seedMockDatabase('item_articles', [article]);

      const job = createMockTranslationJob({
        entityType: 'article',
        entityId: article.id,
        status: 'queued',
      });
      seedMockDatabase('translation_jobs', [job]);

      const {
        createJobProcessor,
        resetJobProcessor,
      } = await import('../job-processor');

      const processor = createJobProcessor({
        pollingIntervalMs: 100,
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
  });

  describe('Statistics Tracking', () => {
    it('updates stats on successful processing', async () => {
      const article = createMockArticleContent();
      seedMockDatabase('item_articles', [article]);

      const job = createMockTranslationJob({
        entityType: 'article',
        entityId: article.id,
        status: 'queued',
      });
      seedMockDatabase('translation_jobs', [job]);

      const { createJobProcessor } = await import('../job-processor');

      const processor = createJobProcessor({ enableLogging: false });
      await processor.processNextJob();

      const stats = processor.getStats();
      expect(stats.totalJobsProcessed).toBe(1);
      expect(stats.totalJobsSucceeded).toBe(1);
      expect(stats.totalJobsFailed).toBe(0);
    });
  });
});
```

### Task 6.2.5: Stale Lock Recovery Integration Tests [0.5 story points]

**Add to**: `concurrent-processing.integration.test.ts`

**Test Suites**:

1. **Stale Lock Detection**
   - Test identifies jobs with stale locks
   - Test respects timeout configuration

2. **Stale Lock Cleanup**
   - Test resets stale jobs to queued
   - Test marks exceeded-retry jobs as failed
   - Test cleanup is idempotent

**Sample Test Structure**:
```typescript
describe('Stale Lock Recovery', () => {
  it('detects jobs with stale locks', async () => {
    // Create job with old lock (6 minutes ago)
    const staleJob = createMockTranslationJob({
      id: 'stale-job',
      status: 'processing',
      lockedBy: 'dead-worker',
      lockedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 min ago
    });
    seedMockDatabase('translation_jobs', [staleJob]);

    const { findStaleProcessingJobs } = await import('../concurrency-control');

    const staleJobs = await findStaleProcessingJobs(5); // 5 min timeout

    expect(staleJobs).toHaveLength(1);
    expect(staleJobs[0].id).toBe('stale-job');
  });

  it('cleans up stale jobs and resets to queued', async () => {
    const staleJob = createMockTranslationJob({
      id: 'stale-cleanup-job',
      status: 'processing',
      lockedBy: 'dead-worker',
      lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
      attempts: 1,
    });
    seedMockDatabase('translation_jobs', [staleJob]);

    const { cleanupStaleProcessingJobs } = await import('../concurrency-control');

    const result = await cleanupStaleProcessingJobs({
      lockTimeoutMinutes: 5,
      maxStaleRetries: 3,
    });

    expect(result.staleJobsFound).toBe(1);
    expect(result.jobsReset).toBe(1);
    expect(result.jobsMarkedFailed).toBe(0);
  });

  it('marks jobs as failed when max retries exceeded', async () => {
    const staleJob = createMockTranslationJob({
      id: 'max-retry-job',
      status: 'processing',
      lockedBy: 'dead-worker',
      lockedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      attempts: 4, // Exceeds max of 3
    });
    seedMockDatabase('translation_jobs', [staleJob]);

    const { cleanupStaleProcessingJobs } = await import('../concurrency-control');

    const result = await cleanupStaleProcessingJobs({
      lockTimeoutMinutes: 5,
      maxStaleRetries: 3,
    });

    expect(result.staleJobsFound).toBe(1);
    expect(result.jobsReset).toBe(0);
    expect(result.jobsMarkedFailed).toBe(1);
  });
});
```

---

## 7. Technical Implementation Details

### 7.1 Testing Framework Configuration

**Vitest Config** (`vitest.config.ts`):
Ensure coverage includes job-queue:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      include: [
        'src/components/ItemCreationWorkflow/**/*.ts',
        'src/components/ItemCreationWorkflow/**/*.tsx',
        'src/lib/job-queue/**/*.ts',  // Add this
        'src/lib/translation-service/**/*.ts',  // Add this
      ],
    },
  },
});
```

### 7.2 Required Mocks

**Supabase Server Mock**:
```typescript
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: vi.fn(() => createMockSupabaseServer()),
}));
```

**Translation Service Mock**:
```typescript
vi.mock('@/lib/translation-service', () => ({
  translateText: vi.fn().mockResolvedValue({
    translatedText: 'Mock translated text',
    provider: 'claude',
    tokensUsed: 100,
  }),
  translateToAllLanguages: vi.fn().mockResolvedValue({
    translations: {
      fr: 'Texte traduit',
      es: 'Texto traducido',
      de: 'Übersetzter Text',
    },
    provider: 'claude',
    totalTokensUsed: 300,
  }),
}));
```

### 7.3 Test Data Constants

```typescript
// Test fixture constants
export const TEST_ENTITY_TYPES = ['article', 'item', 'link', 'tag'] as const;
export const TEST_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export const TEST_JOB_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const;

export const DEFAULT_LOCK_TIMEOUT_MINUTES = 5;
export const DEFAULT_MAX_RETRIES = 3;
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Component | Import Path | Usage |
|-----------|-------------|-------|
| Translation Jobs | `@/lib/job-queue/translation-jobs` | Job queue functions under test |
| Job Processor | `@/lib/job-queue/job-processor` | Processor functions under test |
| Concurrency Control | `@/lib/job-queue/concurrency-control` | Concurrency functions under test |
| Translation Service | `@/lib/translation-service` | Mocked for isolated testing |
| Supabase Server | `@/lib/supabase-server` | Mocked for database operations |

### 8.2 Testing Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^2.0.0 | Test runner |
| @testing-library/react | ^14.0.0 | React testing utilities |
| jsdom | ^22.0.0 | DOM environment |

### 8.3 Prerequisites (Must Be Completed First)

| Task | Reference | Dependency |
|------|-----------|------------|
| REQ-243 | Job Queue Module | Provides functions to test |
| REQ-244 | Job Processor | Provides processor to test |
| REQ-245 | Concurrency Control | Provides concurrency functions to test |
| REQ-253 | Unit Tests for Translation Service | Unit test patterns to follow |

---

## 9. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex mock setup | Medium | Medium | Create reusable mock factories and utilities |
| Flaky async tests | Medium | High | Use proper waitFor patterns, avoid arbitrary delays |
| Database mock divergence | Medium | Medium | Keep mock behavior aligned with actual Supabase behavior |
| Test isolation issues | Medium | Medium | Reset all mocks and state in beforeEach |
| Concurrent test interference | Medium | Medium | Use unique IDs per test, proper cleanup |
| CI timing variations | Low | High | Use generous timeouts, avoid timing-dependent assertions |

---

## 10. Estimated Effort

| Task | Story Points | Estimated Hours |
|------|--------------|-----------------|
| Test Infrastructure Setup | 0.5 | 2 |
| Job Lifecycle Integration Tests | 1.0 | 4 |
| Concurrent Processing Tests | 1.5 | 6 |
| Job Processor Integration Tests | 1.0 | 4 |
| Stale Lock Recovery Tests | 0.5 | 2 |
| **Total** | **4.5** | **18 hours** |

---

## 11. Success Criteria

1. All integration tests pass in CI environment
2. Tests verify complete job lifecycle (queued → processing → completed/failed)
3. Tests verify concurrent job processing without data corruption
4. Tests demonstrate worker isolation and lock safety
5. Tests verify stale lock cleanup functionality
6. No flaky tests after 10 consecutive runs
7. Test execution completes in under 60 seconds

---

## 12. Acceptance Criteria Verification

| Acceptance Criteria | Test Coverage |
|---------------------|---------------|
| Jobs progress through all lifecycle states | Task 6.2.2: Job Lifecycle Integration Tests |
| Failed jobs include error details | Task 6.2.2: Job Failure Flow tests |
| Job results are stored and retrievable | Task 6.2.2: Job Results Storage tests |
| Multiple concurrent jobs complete successfully | Task 6.2.3: Multiple Concurrent Jobs tests |
| Concurrent jobs don't interfere with each other | Task 6.2.3: Worker Isolation tests |
| Data integrity under concurrent load | Task 6.2.3: Data Integrity Under Load tests |
| Tests pass consistently in CI/CD | All tests with proper mocking and isolation |

---

## 13. References

- **Implementation Plan**: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Request Definition**: `/docs/gen_requests.md` - REQ-254
- **Job Queue Module Overview**: `/docs/REQ-243-create-translation-job-queue-module-overview.md`
- **Job Processor Overview**: `/docs/REQ-244-implement-job-processor-overview.md`
- **Concurrency Control Overview**: `/docs/REQ-245-implement-concurrency-control-overview.md`
- **Unit Tests for Translation Service**: `/docs/REQ-253-write-unit-tests-for-translation-service-overview.md`
- **Existing Integration Test Patterns**:
  - `src/__tests__/beta-access-requests.test.ts`
  - `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
- **Vitest Configuration**: `vitest.config.ts`

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation, Phase 6, Task 6.2*
