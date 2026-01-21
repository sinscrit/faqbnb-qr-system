/**
 * Supabase Mock Utilities for Content Translation Tests (REQ-E03-030)
 *
 * Provides mock Supabase client factories and utilities for testing
 * database operations without actual database connections.
 *
 * @created 2026-01-21
 */

import { vi } from 'vitest';

/**
 * Mock query chain result type
 */
export interface MockQueryResult<T = unknown> {
  data: T | null;
  error: { message: string; code: string } | null;
}

/**
 * Creates a chainable Supabase query mock that simulates
 * the fluent API pattern used by Supabase client.
 */
export function createSupabaseChainMock<T = unknown>() {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  // All chainable methods return the mock itself
  const chainableMethods = [
    'select',
    'eq',
    'neq',
    'in',
    'is',
    'order',
    'limit',
    'range',
    'insert',
    'update',
    'upsert',
    'delete',
    'match',
    'filter',
  ];

  chainableMethods.forEach(method => {
    mock[method] = vi.fn().mockReturnValue(mock);
  });

  // Terminal methods return promises
  mock.single = vi.fn().mockResolvedValue({ data: null, error: null } as MockQueryResult<T>);
  mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null } as MockQueryResult<T>);
  mock.execute = vi.fn().mockResolvedValue({ data: [], error: null });

  return mock;
}

/**
 * Creates a mock supabaseAdmin client for testing.
 * Returns an object with a `from` method that returns chainable query mocks.
 */
export function createMockSupabaseAdmin() {
  const tableMocks: Record<string, ReturnType<typeof createSupabaseChainMock>> = {};

  return {
    from: vi.fn((table: string) => {
      if (!tableMocks[table]) {
        tableMocks[table] = createSupabaseChainMock();
      }
      return tableMocks[table];
    }),
    // Expose table mocks for test configuration
    _tableMocks: tableMocks,
  };
}

/**
 * Configure mock to return specific data for a query
 */
export function mockQuerySuccess<T>(
  mock: ReturnType<typeof createSupabaseChainMock>,
  data: T
): void {
  mock.single.mockResolvedValue({ data, error: null });
  mock.maybeSingle.mockResolvedValue({ data, error: null });
}

/**
 * Configure mock to return an error for a query
 */
export function mockQueryError(
  mock: ReturnType<typeof createSupabaseChainMock>,
  message: string,
  code = 'PGRST116'
): void {
  const error = { message, code };
  mock.single.mockResolvedValue({ data: null, error });
  mock.maybeSingle.mockResolvedValue({ data: null, error });
}

/**
 * Configure mock to return "not found" (null data, no error)
 */
export function mockQueryNotFound(
  mock: ReturnType<typeof createSupabaseChainMock>
): void {
  mock.single.mockResolvedValue({ data: null, error: null });
  mock.maybeSingle.mockResolvedValue({ data: null, error: null });
}

/**
 * Reset all mocks on a Supabase admin client mock
 */
export function resetMockSupabase(
  mockSupabase: ReturnType<typeof createMockSupabaseAdmin>
): void {
  vi.clearAllMocks();
  mockSupabase.from.mockClear();
  // Reset table mocks
  Object.values(mockSupabase._tableMocks).forEach(tableMock => {
    Object.values(tableMock).forEach(methodMock => {
      if (typeof methodMock.mockClear === 'function') {
        methodMock.mockClear();
      }
    });
  });
}
