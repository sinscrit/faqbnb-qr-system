/**
 * Translation API Test Utilities
 *
 * Factory functions and helpers for translation integration tests.
 *
 * @module api/admin/__tests__/translation-test-utils
 * @see docs/REQ-E03-032-write-integration-tests-for-api-endpoints-detailed.md
 * @lastModified 2026-01-21
 */

import { vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Constants
// ============================================================================

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
export const TARGET_LANGUAGES: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];

/** Test entity IDs */
export const TEST_IDS = {
  ITEM: 'test-item-uuid-00000000-0000-0000-0000-000000000001',
  ARTICLE: 'test-article-uuid-00000000-0000-0000-0000-000000000002',
  LINK: 'test-link-uuid-00000000-0000-0000-0000-000000000003',
  TAG: 'test-tag-key',
  USER: 'test-user-uuid-00000000-0000-0000-0000-000000000010',
  ACCOUNT: 'test-account-uuid-00000000-0000-0000-0000-000000000020',
  PROPERTY: 'test-property-uuid-00000000-0000-0000-0000-000000000030',
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

export interface MockItem {
  id: string;
  public_id: string;
  name: string;
  description?: string | null;
  property_id: string;
  source_language: string;
  created_at: string;
  updated_at: string;
}

export interface MockArticle {
  id: string;
  item_id: string;
  purpose: string;
  title: string;
  description?: string | null;
  source_language: string;
  created_at: string;
  updated_at: string;
}

export interface MockTranslationJob {
  id: string;
  entity_type: 'item' | 'article' | 'link' | 'tag';
  entity_id: string;
  source_language: string;
  target_language: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  error_message?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface MockTranslation {
  id: string;
  item_id?: string;
  article_id?: string;
  link_id?: string;
  language: string;
  name?: string;
  title?: string;
  description?: string | null;
  translation_status: 'pending' | 'completed' | 'failed' | 'manual';
  translated_at?: string;
  reviewed_by?: string;
}

export interface TranslationStatusResponse {
  success: boolean;
  data: {
    entityId: string;
    entityType: string;
    sourceLanguage: string;
    overallStatus: 'fully_translated' | 'partially_translated' | 'pending' | 'has_failures' | 'not_started';
    completionPercentage: number;
    lastUpdated: string | null;
    languages: Record<string, {
      status: 'pending' | 'completed' | 'failed' | 'processing' | 'not_started';
      translatedAt?: string;
      error?: string;
    }>;
    completedLanguages: string[];
    pendingLanguages: string[];
    failedLanguages: string[];
  };
  error?: string;
}

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates mock item data for testing
 */
export function createMockItem(overrides: Partial<MockItem> = {}): MockItem {
  return {
    id: overrides.id ?? `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    public_id: overrides.public_id ?? `test-item-${Date.now()}`,
    name: overrides.name ?? 'Test Coffee Machine',
    description: overrides.description ?? 'Instructions for operating the coffee machine',
    property_id: overrides.property_id ?? TEST_IDS.PROPERTY,
    source_language: overrides.source_language ?? 'en',
    created_at: overrides.created_at ?? new Date().toISOString(),
    updated_at: overrides.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Creates mock article data for testing
 */
export function createMockArticle(overrides: Partial<MockArticle> = {}): MockArticle {
  return {
    id: overrides.id ?? `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    item_id: overrides.item_id ?? TEST_IDS.ITEM,
    purpose: overrides.purpose ?? 'how_to_use',
    title: overrides.title ?? 'How to Use the Coffee Machine',
    description: overrides.description ?? 'Step-by-step instructions for making coffee',
    source_language: overrides.source_language ?? 'en',
    created_at: overrides.created_at ?? new Date().toISOString(),
    updated_at: overrides.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Creates mock translation job data
 */
export function createMockTranslationJob(overrides: Partial<MockTranslationJob> = {}): MockTranslationJob {
  return {
    id: overrides.id ?? `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    entity_type: overrides.entity_type ?? 'item',
    entity_id: overrides.entity_id ?? TEST_IDS.ITEM,
    source_language: overrides.source_language ?? 'en',
    target_language: overrides.target_language ?? 'fr',
    status: overrides.status ?? 'queued',
    priority: overrides.priority ?? 100,
    attempts: overrides.attempts ?? 0,
    error_message: overrides.error_message ?? null,
    created_at: overrides.created_at ?? new Date().toISOString(),
    started_at: overrides.started_at ?? null,
    completed_at: overrides.completed_at ?? null,
  };
}

/**
 * Creates mock translation record
 */
export function createMockTranslation(overrides: Partial<MockTranslation> = {}): MockTranslation {
  return {
    id: overrides.id ?? `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    item_id: overrides.item_id ?? TEST_IDS.ITEM,
    language: overrides.language ?? 'fr',
    name: overrides.name ?? 'Machine à café de test',
    description: overrides.description ?? 'Instructions pour utiliser la machine à café',
    translation_status: overrides.translation_status ?? 'completed',
    translated_at: overrides.translated_at ?? new Date().toISOString(),
  };
}

// ============================================================================
// Mock Supabase Chain Utilities
// ============================================================================

/**
 * Creates a chainable Supabase query mock that simulates
 * the fluent API pattern used by Supabase client.
 */
export function createSupabaseChainMock<T = unknown>(): Record<string, ReturnType<typeof vi.fn>> {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};

  // All chainable methods return the mock itself
  const chainableMethods = [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'neq',
    'in',
    'is',
    'not',
    'lt',
    'gt',
    'lte',
    'gte',
    'order',
    'limit',
    'range',
    'match',
    'filter',
  ];

  chainableMethods.forEach(method => {
    mock[method] = vi.fn().mockReturnValue(mock);
  });

  // Terminal methods return promises
  mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
  mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  mock.then = vi.fn((resolve) => resolve({ data: [], error: null }));

  return mock;
}

/**
 * Creates a mock supabaseAdmin client for testing.
 */
export function createMockSupabaseClient() {
  const tableMocks: Record<string, ReturnType<typeof createSupabaseChainMock>> = {};

  return {
    from: vi.fn((table: string) => {
      if (!tableMocks[table]) {
        tableMocks[table] = createSupabaseChainMock();
      }
      return tableMocks[table];
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    _tableMocks: tableMocks,
  };
}

// ============================================================================
// Request Helper Functions
// ============================================================================

/**
 * Creates authenticated NextRequest for testing
 */
export function createAuthenticatedRequest(
  method: string,
  path: string,
  body?: object,
  headers?: Record<string, string>
): NextRequest {
  const url = `http://localhost:3000${path}`;
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-jwt-token',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
}

/**
 * Creates item creation request
 */
export function createItemRequest(itemData: Partial<MockItem> = {}): NextRequest {
  const item = createMockItem(itemData);
  return createAuthenticatedRequest('POST', '/api/admin/items', {
    publicId: item.public_id,
    name: item.name,
    description: item.description,
    propertyId: item.property_id,
    sourceLanguage: item.source_language,
  });
}

/**
 * Creates article creation request
 */
export function createArticleRequest(articleData: Partial<MockArticle> = {}): NextRequest {
  const article = createMockArticle(articleData);
  return createAuthenticatedRequest('POST', '/api/admin/articles', {
    itemId: article.item_id,
    purpose: article.purpose,
    title: article.title,
    description: article.description,
    sourceLanguage: article.source_language,
  });
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Asserts translation jobs were queued for all target languages
 */
export function assertTranslationJobsQueued(
  mockFn: ReturnType<typeof vi.fn>,
  entityType: 'item' | 'article' | 'link',
  entityId: string,
  sourceLanguage: string = 'en'
): void {
  expect(mockFn).toHaveBeenCalled();
  const call = mockFn.mock.calls[0][0];
  expect(call.content.entityType).toBe(entityType);
  expect(call.content.entityId).toBe(entityId);
  expect(call.content.sourceLanguage).toBe(sourceLanguage);
}

/**
 * Asserts translation status response structure
 */
export function assertTranslationStatusResponse(
  response: TranslationStatusResponse,
  expectedOverallStatus: 'fully_translated' | 'partially_translated' | 'pending' | 'has_failures' | 'not_started'
): void {
  expect(response.success).toBe(true);
  expect(response.data).toBeDefined();
  expect(response.data.overallStatus).toBe(expectedOverallStatus);
  expect(response.data.languages).toBeDefined();
}

// ============================================================================
// Mock User and Account Data
// ============================================================================

export const mockUser = {
  id: TEST_IDS.USER,
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'admin',
  preferred_language: 'en',
};

export const mockAccount = {
  id: TEST_IDS.ACCOUNT,
  name: 'Test Account',
  preferred_language: 'en',
};

/**
 * Creates mock auth result for successful authentication
 */
export function createMockAuthSuccess(userOverrides?: Partial<typeof mockUser>) {
  return {
    user: { ...mockUser, ...userOverrides },
    isAdmin: true,
    isSysAdmin: false,
    supabase: createMockSupabaseClient(),
  };
}

/**
 * Creates mock auth result for failed authentication
 */
export function createMockAuthError(status: number = 401, message: string = 'Unauthorized') {
  const { NextResponse } = require('next/server');
  return {
    error: NextResponse.json({ success: false, error: message }, { status }),
  };
}
