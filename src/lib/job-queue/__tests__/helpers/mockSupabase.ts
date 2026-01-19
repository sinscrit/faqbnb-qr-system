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
