/**
 * Component Test Mock Utilities
 *
 * Reusable mock utilities for translation component tests.
 * Centralizes mocks for hooks, APIs, and dependencies.
 *
 * @module TranslationManagement/__tests__/mocks/component-mocks
 * @created 2026-01-24
 * @requestReference REQ-E05-034
 */

import { vi, type Mock } from 'vitest';
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Mock return type for useTranslationStatus hook.
 */
export interface MockTranslationStatusReturn {
  data: MockTranslationItem[] | null;
  items: MockTranslationItem[] | null;
  summary: MockStatusSummary | null;
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: Mock;
  lastUpdated: Date | null;
  isFetched: boolean;
}

/**
 * Mock return type for useTranslationRealtime hook.
 */
export interface MockTranslationRealtimeReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  subscribe: Mock;
  unsubscribe: Mock;
  lastEvent: MockRealtimePayload | null;
  lastEventAt: Date | null;
  error: Error | null;
}

/**
 * Mock translation item data structure.
 */
export interface MockTranslationItem {
  id: string;
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  language: SupportedLanguage;
  status: TranslationStatus;
  translated_content?: string;
  original_content?: string;
  translatedAt?: string;
  isStale?: boolean;
  canEdit?: boolean;
  canRetranslate?: boolean;
}

/**
 * Mock status summary data structure.
 */
export interface MockStatusSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
  stale: number;
}

/**
 * Mock realtime event payload.
 */
export interface MockRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  entityId: string;
  entityType: string;
  language: string;
  status?: string;
  timestamp: Date;
}

/**
 * Props for TranslationEditor component mock.
 */
export interface MockTranslationEditorProps {
  isOpen: boolean;
  onClose: Mock;
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  language: SupportedLanguage;
  sourceContent: { fieldName: string; fieldLabel: string; value: string; maxLength?: number }[];
  initialTranslation: { fieldName: string; fieldLabel: string; value: string; maxLength?: number }[];
  onSave: Mock;
  isLoading?: boolean;
}

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Creates a mock useTranslationStatus hook return value.
 * Default returns two translation items (Spanish completed, French pending).
 *
 * @param overrides - Partial overrides for the mock return value
 * @returns MockTranslationStatusReturn with customizable values
 *
 * @example
 * const mockStatus = createMockTranslationStatus({ isLoading: true });
 * (useTranslationStatus as Mock).mockReturnValue(mockStatus);
 */
export function createMockTranslationStatus(
  overrides: Partial<MockTranslationStatusReturn> = {}
): MockTranslationStatusReturn {
  const defaultItems: MockTranslationItem[] = [
    createMockTranslationItem({ language: 'es', status: 'completed' }),
    createMockTranslationItem({ language: 'fr', status: 'pending', id: 'trans-456' }),
  ];

  return {
    data: overrides.data ?? defaultItems,
    items: overrides.items ?? defaultItems,
    summary: overrides.summary ?? createMockStatusSummary(),
    isLoading: overrides.isLoading ?? false,
    isRefetching: overrides.isRefetching ?? false,
    isError: overrides.isError ?? false,
    error: overrides.error ?? null,
    refetch: overrides.refetch ?? vi.fn(),
    lastUpdated: overrides.lastUpdated ?? new Date(),
    isFetched: overrides.isFetched ?? true,
  };
}

/**
 * Creates a mock useTranslationRealtime hook return value.
 * Default returns connected state with no errors.
 *
 * @param overrides - Partial overrides for the mock return value
 * @returns MockTranslationRealtimeReturn with customizable values
 *
 * @example
 * const mockRealtime = createMockTranslationRealtime({ isConnected: false });
 */
export function createMockTranslationRealtime(
  overrides: Partial<MockTranslationRealtimeReturn> = {}
): MockTranslationRealtimeReturn {
  return {
    isConnected: overrides.isConnected ?? true,
    isConnecting: overrides.isConnecting ?? false,
    connectionStatus: overrides.connectionStatus ?? 'connected',
    subscribe: overrides.subscribe ?? vi.fn(),
    unsubscribe: overrides.unsubscribe ?? vi.fn(),
    lastEvent: overrides.lastEvent ?? null,
    lastEventAt: overrides.lastEventAt ?? null,
    error: overrides.error ?? null,
  };
}

/**
 * Creates a mock translation function for next-intl.
 * Returns the key with optional parameter interpolation.
 *
 * @returns Translation function that returns key with params
 *
 * @example
 * const t = createMockTranslationFn();
 * t('hello.world'); // Returns 'hello.world'
 * t('greeting', { name: 'John' }); // Returns 'greeting(name: John)'
 */
export function createMockTranslationFn() {
  return (key: string, params?: Record<string, unknown>): string => {
    if (params && Object.keys(params).length > 0) {
      const paramStr = Object.entries(params)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      return `${key}(${paramStr})`;
    }
    return key;
  };
}

/**
 * Sets up mock configuration for next-intl useTranslations hook.
 * Returns a function that creates the mock translation function.
 *
 * @returns Object suitable for vi.mock factory
 *
 * @example
 * vi.mock('next-intl', () => setupNextIntlMock());
 */
export function setupNextIntlMock() {
  return {
    useTranslations: () => createMockTranslationFn(),
  };
}

/**
 * Creates a mock Supabase client with chainable query methods.
 * Supports from, update, eq, select, single with mockReturnThis.
 *
 * @returns Mock Supabase client object
 *
 * @example
 * const mockSupabase = createMockSupabaseClient();
 * vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));
 */
export function createMockSupabaseClient() {
  const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
  });

  // Set up chaining
  mockSelect.mockReturnValue({
    eq: mockEq,
    single: mockSingle,
  });
  mockEq.mockReturnValue({
    select: mockSelect,
    single: mockSingle,
  });
  mockUpdate.mockReturnValue({
    eq: mockEq,
    select: mockSelect,
    single: mockSingle,
  });

  return {
    from: mockFrom,
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  };
}

/**
 * Creates a mock Next.js router with navigation functions.
 * Includes push, replace, refresh, back, forward, prefetch.
 *
 * @param overrides - Partial overrides for router properties
 * @returns Mock router object
 *
 * @example
 * const mockRouter = createMockRouter({ pathname: '/dashboard2/items' });
 * vi.mock('next/navigation', () => ({ useRouter: () => mockRouter }));
 */
export function createMockRouter(overrides: Partial<{
  push: Mock;
  replace: Mock;
  refresh: Mock;
  back: Mock;
  forward: Mock;
  prefetch: Mock;
  pathname: string;
  query: Record<string, string>;
  asPath: string;
}> = {}) {
  return {
    push: overrides.push ?? vi.fn(),
    replace: overrides.replace ?? vi.fn(),
    refresh: overrides.refresh ?? vi.fn(),
    back: overrides.back ?? vi.fn(),
    forward: overrides.forward ?? vi.fn(),
    prefetch: overrides.prefetch ?? vi.fn(),
    pathname: overrides.pathname ?? '/',
    query: overrides.query ?? {},
    asPath: overrides.asPath ?? '/',
  };
}

/**
 * Creates a mock translation item with sensible defaults.
 * Default is a completed Spanish translation.
 *
 * @param overrides - Partial overrides for item properties
 * @returns MockTranslationItem with customizable values
 *
 * @example
 * const item = createMockTranslationItem({ status: 'failed', language: 'de' });
 */
export function createMockTranslationItem(
  overrides: Partial<MockTranslationItem> = {}
): MockTranslationItem {
  return {
    id: overrides.id ?? 'trans-123',
    entityId: overrides.entityId ?? 'item-456',
    entityType: overrides.entityType ?? 'item',
    language: overrides.language ?? 'es',
    status: overrides.status ?? 'completed',
    translated_content: overrides.translated_content ?? 'Bienvenido a nuestra propiedad',
    original_content: overrides.original_content ?? 'Welcome to our property',
    translatedAt: overrides.translatedAt ?? '2026-01-24T12:00:00Z',
    isStale: overrides.isStale ?? false,
    canEdit: overrides.canEdit ?? true,
    canRetranslate: overrides.canRetranslate ?? true,
  };
}

/**
 * Creates a mock status summary with default counts.
 * Default: total 10, complete 6, pending 4.
 *
 * @param overrides - Partial overrides for summary counts
 * @returns MockStatusSummary with customizable values
 *
 * @example
 * const summary = createMockStatusSummary({ failed: 2, pending: 3 });
 */
export function createMockStatusSummary(
  overrides: Partial<MockStatusSummary> = {}
): MockStatusSummary {
  return {
    total: overrides.total ?? 10,
    complete: overrides.complete ?? 6,
    partial: overrides.partial ?? 0,
    pending: overrides.pending ?? 4,
    failed: overrides.failed ?? 0,
    stale: overrides.stale ?? 0,
  };
}

/**
 * Creates mock TranslationEditor props with sensible defaults.
 *
 * @param overrides - Partial overrides for props
 * @returns MockTranslationEditorProps with customizable values
 */
export function createMockEditorProps(
  overrides: Partial<MockTranslationEditorProps> = {}
): MockTranslationEditorProps {
  return {
    isOpen: overrides.isOpen ?? true,
    onClose: overrides.onClose ?? vi.fn(),
    entityId: overrides.entityId ?? 'item-123',
    entityType: overrides.entityType ?? 'item',
    language: overrides.language ?? 'es',
    sourceContent: overrides.sourceContent ?? [
      { fieldName: 'name', fieldLabel: 'Name', value: 'Welcome to our property', maxLength: 100 },
      { fieldName: 'description', fieldLabel: 'Description', value: 'A beautiful vacation rental', maxLength: 500 },
    ],
    initialTranslation: overrides.initialTranslation ?? [
      { fieldName: 'name', fieldLabel: 'Name', value: 'Bienvenido a nuestra propiedad', maxLength: 100 },
      { fieldName: 'description', fieldLabel: 'Description', value: 'Un hermoso alquiler vacacional', maxLength: 500 },
    ],
    onSave: overrides.onSave ?? vi.fn().mockResolvedValue(undefined),
    isLoading: overrides.isLoading ?? false,
  };
}

/**
 * Creates a mock realtime payload for testing event callbacks.
 *
 * @param overrides - Partial overrides for payload
 * @returns MockRealtimePayload with customizable values
 */
export function createMockRealtimePayload(
  overrides: Partial<MockRealtimePayload> = {}
): MockRealtimePayload {
  return {
    eventType: overrides.eventType ?? 'UPDATE',
    table: overrides.table ?? 'item_translations',
    entityId: overrides.entityId ?? 'item-123',
    entityType: overrides.entityType ?? 'item',
    language: overrides.language ?? 'es',
    status: overrides.status ?? 'completed',
    timestamp: overrides.timestamp ?? new Date(),
  };
}

// =============================================================================
// Export All Utilities
// =============================================================================

export {
  vi,
  type Mock,
};
