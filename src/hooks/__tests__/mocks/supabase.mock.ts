/**
 * Supabase Mock Utilities
 *
 * Reusable mock utilities for testing hooks that interact with Supabase.
 * Provides mock query builders, realtime channels, and response helpers.
 *
 * @module hooks/__tests__/mocks/supabase.mock
 * @created 2026-01-24
 * @requestReference REQ-E05-033
 */

import { vi } from 'vitest';

// =============================================================================
// Types
// =============================================================================

export type MockQueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
};

export type EventHandler = (payload: unknown) => void;

export type MockChannel = {
  on: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
  unsubscribe: ReturnType<typeof vi.fn>;
  _eventHandlers: Map<string, EventHandler[]>;
  _subscribeCallback: ((status: string) => void) | null;
  _triggerEvent: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', payload: Record<string, unknown>) => void;
  _triggerConnectionChange: (status: string) => void;
};

export type MockSupabaseClient = {
  from: ReturnType<typeof vi.fn>;
  channel: ReturnType<typeof vi.fn>;
  removeChannel: ReturnType<typeof vi.fn>;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  _queryBuilder: MockQueryBuilder;
  _channel: MockChannel;
};

export interface SuccessResponse<T> {
  data: T;
  error: null;
  status: number;
}

export interface ErrorResponse {
  data: null;
  error: {
    message: string;
    code?: string;
  };
  status: number;
}

// =============================================================================
// Query Builder Mock
// =============================================================================

/**
 * Creates a mock Supabase query builder with chainable methods.
 * Each method returns `this` for chaining, except `single` which returns the final result.
 */
export function createMockQueryBuilder(): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    then: vi.fn(),
  };

  // Make select return the builder for chaining
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);

  return builder;
}

// =============================================================================
// Realtime Channel Mock
// =============================================================================

/**
 * Creates a mock Supabase realtime channel with event handling capabilities.
 * Includes helper methods for simulating events in tests.
 */
export function createMockChannel(): MockChannel {
  const eventHandlers = new Map<string, EventHandler[]>();
  let subscribeCallback: ((status: string) => void) | null = null;

  const channel: MockChannel = {
    _eventHandlers: eventHandlers,
    _subscribeCallback: null,

    on: vi.fn((event: string, _config: unknown, handler: EventHandler) => {
      const handlers = eventHandlers.get(event) || [];
      handlers.push(handler);
      eventHandlers.set(event, handlers);
      return channel; // Return channel for chaining
    }),

    subscribe: vi.fn((callback?: (status: string) => void) => {
      if (callback) {
        subscribeCallback = callback;
        channel._subscribeCallback = callback;
        // Simulate async subscription success
        setTimeout(() => {
          callback('SUBSCRIBED');
        }, 0);
      }
      return channel;
    }),

    unsubscribe: vi.fn(() => {
      eventHandlers.clear();
      subscribeCallback = null;
      channel._subscribeCallback = null;
      return Promise.resolve();
    }),

    /**
     * Helper method to simulate realtime events in tests.
     * @param eventType - The type of database event
     * @param payload - The event payload
     */
    _triggerEvent: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', payload: Record<string, unknown>) => {
      const handlers = eventHandlers.get('postgres_changes') || [];
      const fullPayload = {
        eventType,
        new: eventType !== 'DELETE' ? payload : undefined,
        old: eventType !== 'INSERT' ? payload : undefined,
        commit_timestamp: new Date().toISOString(),
        ...payload,
      };
      handlers.forEach((handler) => handler(fullPayload));
    },

    /**
     * Helper method to simulate connection state changes in tests.
     * @param status - The connection status (SUBSCRIBED, CHANNEL_ERROR, TIMED_OUT, CLOSED)
     */
    _triggerConnectionChange: (status: string) => {
      if (subscribeCallback) {
        subscribeCallback(status);
      }
    },
  };

  return channel;
}

// =============================================================================
// Supabase Client Mock
// =============================================================================

/**
 * Creates a complete mock Supabase client combining query builder and channel.
 * Use this as the default mock for @/lib/supabase/client.
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  const queryBuilder = createMockQueryBuilder();
  const channel = createMockChannel();

  const client: MockSupabaseClient = {
    _queryBuilder: queryBuilder,
    _channel: channel,

    from: vi.fn(() => queryBuilder),

    channel: vi.fn(() => channel),

    removeChannel: vi.fn(() => Promise.resolve()),

    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            },
          },
          error: null,
        })
      ),
    },
  };

  return client;
}

// =============================================================================
// Response Helpers
// =============================================================================

/**
 * Creates a successful Supabase response object.
 * @param data - The data to return
 * @returns A success response with data and null error
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    data,
    error: null,
    status: 200,
  };
}

/**
 * Creates an error Supabase response object.
 * @param message - The error message
 * @param code - Optional error code (e.g., '401', '403', '500')
 * @returns An error response with null data and error object
 */
export function createErrorResponse(message: string, code?: string): ErrorResponse {
  return {
    data: null,
    error: {
      message,
      code,
    },
    status: code ? parseInt(code, 10) : 500,
  };
}

// =============================================================================
// Sample Test Data
// =============================================================================

/**
 * Sample translation status data for testing.
 * Contains 3 languages: es (completed), fr (pending), de (failed).
 */
export const mockTranslationStatus = {
  items: [
    {
      entityId: 'item-123',
      entityType: 'item' as const,
      entityName: 'Test Item',
      translations: [
        {
          language: 'es' as const,
          status: 'completed' as const,
          translatedAt: '2026-01-24T10:00:00Z',
          isStale: false,
        },
        {
          language: 'fr' as const,
          status: 'pending' as const,
          translatedAt: null,
          isStale: false,
        },
        {
          language: 'de' as const,
          status: 'failed' as const,
          translatedAt: null,
          isStale: false,
        },
      ],
    },
  ],
  summary: {
    total: 3,
    completed: 1,
    pending: 1,
    failed: 1,
    stale: 0,
    complete: 1,
  },
};

/**
 * Sample translation realtime event payload for testing.
 */
export const mockRealtimePayload = {
  eventType: 'UPDATE' as const,
  new: {
    id: 'trans-1',
    item_id: 'item-123',
    language: 'fr',
    translation_status: 'completed',
    translated_name: 'Article de test',
  },
  old: {
    id: 'trans-1',
    item_id: 'item-123',
    language: 'fr',
    translation_status: 'pending',
    translated_name: null,
  },
  commit_timestamp: '2026-01-24T10:30:00Z',
};

// =============================================================================
// API Request Mock Helper
// =============================================================================

/**
 * Creates a mock for the apiRequest function.
 * @param response - The response to return (success or error)
 * @returns A vi.fn() mock that returns the specified response
 */
export function createMockApiRequest<T>(response: T) {
  return vi.fn(() => Promise.resolve(response));
}

/**
 * Creates a mock for apiRequest that rejects with an error.
 * @param error - The error to throw
 * @returns A vi.fn() mock that rejects with the error
 */
export function createMockApiRequestError(error: Error) {
  return vi.fn(() => Promise.reject(error));
}
