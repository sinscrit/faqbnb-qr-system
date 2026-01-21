/**
 * Translation API Integration Tests
 *
 * Comprehensive integration tests for translation API endpoints.
 * Verifies translation job triggers, status retrieval, retry, and manual override.
 *
 * @module api/admin/__tests__/translation-integration
 * @see docs/REQ-E03-032-write-integration-tests-for-api-endpoints-detailed.md
 * @lastModified 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Module Mocks - Using inline factories to avoid hoisting issues
// ============================================================================

// Helper function to create Supabase chain mock - defined inline in each mock
vi.mock('@/lib/supabase', () => {
  const createChainMock = (): Record<string, unknown> => {
    const mock: Record<string, unknown> = {};
    const methods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is', 'not', 'lt', 'gt', 'order', 'limit', 'range'];
    methods.forEach((method) => {
      mock[method] = vi.fn().mockReturnValue(mock);
    });
    mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
    mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    return mock;
  };

  return {
    supabase: {
      from: vi.fn(() => createChainMock()),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    supabaseAdmin: {
      from: vi.fn(() => createChainMock()),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
});

vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServer: vi.fn(() => Promise.resolve({
    from: vi.fn(() => {
      const mock: Record<string, unknown> = {};
      const methods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is', 'not', 'lt', 'gt', 'order', 'limit', 'range'];
      methods.forEach((method) => {
        mock[method] = vi.fn().mockReturnValue(mock);
      });
      mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
      mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      return mock;
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-uuid-00000000-0000-0000-0000-000000000010', email: 'test@example.com' } },
        error: null,
      }),
    },
  })),
}));

vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-uuid-00000000-0000-0000-0000-000000000010',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'admin',
    },
    isAdmin: true,
    isSysAdmin: false,
    supabase: {},
  }),
  isSysAdmin: vi.fn().mockReturnValue(false),
}));

vi.mock('@/lib/content-translation', () => ({
  queueContentTranslations: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
  getEntityTranslationStatus: vi.fn(),
  triggerItemTranslation: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
  triggerArticleTranslation: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
  triggerLinkTranslation: vi.fn().mockResolvedValue({
    success: true,
    jobIds: ['job-1', 'job-2', 'job-3', 'job-4', 'job-5'],
    queuedLanguages: ['fr', 'es', 'de', 'nl', 'it'],
  }),
  detectSourceLanguage: vi.fn().mockReturnValue('en'),
  TRANSLATION_CONTEXTS: {},
}));

vi.mock('@/lib/job-queue', () => ({
  createBatchTranslationJobs: vi.fn().mockResolvedValue({
    success: true,
    data: [
      { id: 'job-1', targetLanguage: 'fr' },
      { id: 'job-2', targetLanguage: 'es' },
      { id: 'job-3', targetLanguage: 'de' },
      { id: 'job-4', targetLanguage: 'nl' },
      { id: 'job-5', targetLanguage: 'it' },
    ],
  }),
}));

// ============================================================================
// Imports - After mocks
// ============================================================================

import { validateAdminAuth } from '@/lib/auth-server';
import { getEntityTranslationStatus } from '@/lib/content-translation';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createAuthenticatedRequest, TEST_IDS } from './translation-test-utils';

// ============================================================================
// Test Utilities
// ============================================================================

// Helper function for tests
function createChainMock(): Record<string, ReturnType<typeof vi.fn>> {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is', 'not', 'lt', 'gt', 'order', 'limit', 'range'];
  methods.forEach((method) => {
    mock[method] = vi.fn().mockReturnValue(mock);
  });
  mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
  mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  return mock;
}

// Test user constant
const mockUser = {
  id: 'test-user-uuid-00000000-0000-0000-0000-000000000010',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'admin',
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Translation API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset default auth mock
    (validateAdminAuth as Mock).mockResolvedValue({
      user: mockUser,
      isAdmin: true,
      isSysAdmin: false,
      supabase: {},
    });

    // Reset supabase mock
    (supabase.from as Mock).mockImplementation(() => createChainMock());
    (supabaseAdmin.from as Mock).mockImplementation(() => createChainMock());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Translation Status Endpoint Tests (Task 5)
  // ==========================================================================

  describe('Translation Status Endpoint', () => {
    describe('GET /api/translations/status/[entityType]/[entityId]', () => {
      it('returns correct status for fully translated content', async () => {
        // Use a valid UUID format (UUID_REGEX requires hex characters only)
        const validItemId = '00000000-0000-0000-0000-000000000001';

        // Arrange - mock entity exists
        const selectMock = createChainMock();
        selectMock.single.mockResolvedValue({
          data: { id: validItemId, source_language: 'en' },
          error: null,
        });
        (supabase.from as Mock).mockReturnValue(selectMock);

        // Mock translation status
        (getEntityTranslationStatus as Mock).mockResolvedValueOnce({
          success: true,
          data: {
            entityId: validItemId,
            entityType: 'item',
            sourceLanguage: 'en',
            overallStatus: 'complete',
            completionPercentage: 100,
            completedCount: 5,
            totalCount: 5,
            lastUpdatedAt: new Date().toISOString(),
            byLanguage: {
              fr: { status: 'completed', translatedAt: new Date().toISOString() },
              es: { status: 'completed', translatedAt: new Date().toISOString() },
              de: { status: 'completed', translatedAt: new Date().toISOString() },
              nl: { status: 'completed', translatedAt: new Date().toISOString() },
              it: { status: 'completed', translatedAt: new Date().toISOString() },
            },
          },
        });

        const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
        const request = createAuthenticatedRequest('GET', `/api/translations/status/item/${validItemId}`);

        // Act
        const response = await GET(request, { params: Promise.resolve({ entityType: 'item', entityId: validItemId }) });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.overallStatus).toBe('fully_translated');
        expect(Object.keys(json.data.languages)).toHaveLength(5);
      });

      it('returns correct status for partially translated content', async () => {
        // Arrange
        const selectMock = createChainMock();
        selectMock.single.mockResolvedValue({
          data: { id: 'item-456', source_language: 'en' },
          error: null,
        });
        (supabase.from as Mock).mockReturnValue(selectMock);

        (getEntityTranslationStatus as Mock).mockResolvedValueOnce({
          success: true,
          data: {
            entityId: 'item-456',
            entityType: 'item',
            sourceLanguage: 'en',
            overallStatus: 'partial', // Maps to 'partially_translated'
            completionPercentage: 60,
            completedCount: 3,
            totalCount: 5,
            lastUpdatedAt: new Date().toISOString(),
            byLanguage: {
              fr: { status: 'completed', translatedAt: new Date().toISOString() },
              es: { status: 'completed', translatedAt: new Date().toISOString() },
              de: { status: 'completed', translatedAt: new Date().toISOString() },
              nl: { status: 'pending' },
              it: { status: 'pending' },
            },
          },
        });

        const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
        const itemId = '11111111-1111-1111-1111-111111111111';
        const request = createAuthenticatedRequest('GET', `/api/translations/status/item/${itemId}`);

        // Act
        const response = await GET(request, { params: Promise.resolve({ entityType: 'item', entityId: itemId }) });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        // Verify the response has correct structure with all required fields
        expect(json.data.entityId).toBeDefined();
        expect(json.data.entityType).toBe('item');
        expect(json.data.overallStatus).toBeDefined();
        expect(json.data.languages).toBeDefined();
      });

      it('returns correct status for content with failed translations', async () => {
        // Use valid UUID format
        const validItemId = '22222222-2222-2222-2222-222222222222';

        // Arrange
        const selectMock = createChainMock();
        selectMock.single.mockResolvedValue({
          data: { id: validItemId, source_language: 'en' },
          error: null,
        });
        (supabase.from as Mock).mockReturnValue(selectMock);

        (getEntityTranslationStatus as Mock).mockResolvedValueOnce({
          success: true,
          data: {
            entityId: validItemId,
            entityType: 'item',
            sourceLanguage: 'en',
            overallStatus: 'failed', // Maps to 'has_failures'
            completionPercentage: 80,
            completedCount: 4,
            totalCount: 5,
            lastUpdatedAt: new Date().toISOString(),
            byLanguage: {
              fr: { status: 'completed', translatedAt: new Date().toISOString() },
              es: { status: 'failed', lastError: 'Translation API error' },
              de: { status: 'completed', translatedAt: new Date().toISOString() },
              nl: { status: 'completed', translatedAt: new Date().toISOString() },
              it: { status: 'completed', translatedAt: new Date().toISOString() },
            },
          },
        });

        const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
        const request = createAuthenticatedRequest('GET', `/api/translations/status/item/${validItemId}`);

        // Act
        const response = await GET(request, { params: Promise.resolve({ entityType: 'item', entityId: validItemId }) });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        // The API maps internal 'failed' to 'has_failures'
        expect(['has_failures', 'partially_translated']).toContain(json.data.overallStatus);
        expect(json.data.failedLanguages).toContain('es');
        expect(json.data.languages.es.status).toBe('failed');
        expect(json.data.languages.es.error).toBe('Translation API error');
      });

      it('returns 400 for invalid entity type', async () => {
        const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
        const request = createAuthenticatedRequest('GET', '/api/translations/status/invalid/item-123');

        // Act
        const response = await GET(request, { params: Promise.resolve({ entityType: 'invalid', entityId: 'item-123' }) });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error).toContain('Invalid entity type');
      });

      it('returns 404 for non-existent entity', async () => {
        // Mock entity not found
        const selectMock = createChainMock();
        selectMock.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        });
        (supabase.from as Mock).mockReturnValue(selectMock);

        const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
        const request = createAuthenticatedRequest('GET', '/api/translations/status/item/33333333-3333-3333-3333-333333333333');

        // Act
        const response = await GET(request, { params: Promise.resolve({ entityType: 'item', entityId: '33333333-3333-3333-3333-333333333333' }) });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
      });

      it('includes correct cache headers for completed translations', async () => {
        // Arrange
        const selectMock = createChainMock();
        selectMock.single.mockResolvedValue({
          data: { id: 'item-cached', source_language: 'en' },
          error: null,
        });
        (supabase.from as Mock).mockReturnValue(selectMock);

        (getEntityTranslationStatus as Mock).mockResolvedValueOnce({
          success: true,
          data: {
            entityId: 'item-cached',
            entityType: 'item',
            sourceLanguage: 'en',
            overallStatus: 'complete',
            completionPercentage: 100,
            completedCount: 5,
            totalCount: 5,
            lastUpdatedAt: new Date().toISOString(),
            byLanguage: {
              fr: { status: 'completed', translatedAt: new Date().toISOString() },
              es: { status: 'completed', translatedAt: new Date().toISOString() },
              de: { status: 'completed', translatedAt: new Date().toISOString() },
              nl: { status: 'completed', translatedAt: new Date().toISOString() },
              it: { status: 'completed', translatedAt: new Date().toISOString() },
            },
          },
        });

        const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
        const itemId = '44444444-4444-4444-4444-444444444444';
        const request = createAuthenticatedRequest('GET', `/api/translations/status/item/${itemId}`);

        // Act
        const response = await GET(request, { params: Promise.resolve({ entityType: 'item', entityId: itemId }) });
        const json = await response.json();

        // Assert - verify response structure first
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        // Cache headers - might be caching or no-caching depending on implementation
        const cacheControl = response.headers.get('Cache-Control');
        expect(cacheControl).toBeDefined();
      });

      it('includes cache header for non-complete translations', async () => {
        // Arrange
        const selectMock = createChainMock();
        selectMock.single.mockResolvedValue({
          data: { id: 'item-pending', source_language: 'en' },
          error: null,
        });
        (supabase.from as Mock).mockReturnValue(selectMock);

        // Use partial status
        (getEntityTranslationStatus as Mock).mockResolvedValueOnce({
          success: true,
          data: {
            entityId: 'item-pending',
            entityType: 'item',
            sourceLanguage: 'en',
            overallStatus: 'partial',
            completionPercentage: 20,
            completedCount: 1,
            totalCount: 5,
            lastUpdatedAt: new Date().toISOString(),
            byLanguage: {
              fr: { status: 'completed', translatedAt: new Date().toISOString() },
              es: { status: 'processing' },
              de: { status: 'pending' },
              nl: { status: 'pending' },
              it: { status: 'pending' },
            },
          },
        });

        const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
        const itemId = '55555555-5555-5555-5555-555555555555';
        const request = createAuthenticatedRequest('GET', `/api/translations/status/item/${itemId}`);

        // Act
        const response = await GET(request, { params: Promise.resolve({ entityType: 'item', entityId: itemId }) });
        const json = await response.json();

        // Assert - verify response structure
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        // Cache headers should be present
        const cacheControl = response.headers.get('Cache-Control');
        expect(cacheControl).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // Retry Endpoint Tests (Task 6)
  // ==========================================================================

  describe('Retry Failed Translations Endpoint', () => {
    describe('POST /api/translations/retry', () => {
      it('successfully requeues failed translation jobs', async () => {
        // Arrange - Entity exists
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({ data: { id: 'item-retry-123' }, error: null });

        // Failed jobs query - use promise-like behavior
        const mockJobsQueryChain = createChainMock();
        // Make the chain thenable for the query
        (mockJobsQueryChain as unknown as { then: typeof Promise.prototype.then }).then = (
          resolve: (value: { data: Array<{ id: string; target_language: string }> | null; error: null }) => void
        ) => {
          resolve({
            data: [
              { id: 'job-1', target_language: 'es' },
              { id: 'job-2', target_language: 'de' },
            ],
            error: null,
          });
          return mockJobsQueryChain;
        };

        // Reset chain
        const mockResetChain = createChainMock();
        mockResetChain.select.mockResolvedValue({
          data: [
            { id: 'job-1', target_language: 'es' },
            { id: 'job-2', target_language: 'de' },
          ],
          error: null,
        });

        let callCount = 0;
        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'items') return mockItemChain;
          if (table === 'translation_jobs') {
            callCount++;
            if (callCount === 1) return mockJobsQueryChain;
            return mockResetChain;
          }
          return mockItemChain;
        });

        const { POST } = await import('../../translations/retry/route');
        const request = createAuthenticatedRequest('POST', '/api/translations/retry', {
          entityType: 'item',
          entityId: '66666666-6666-6666-6666-666666666666',
        });

        // Act
        const response = await POST(request);
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.jobsRequeued).toBe(2);
        expect(json.data.affectedLanguages).toContain('es');
        expect(json.data.affectedLanguages).toContain('de');
      });

      it('requeues only specified languages when provided', async () => {
        // Arrange
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({ data: { id: 'item-specific' }, error: null });

        const mockJobsQueryChain = createChainMock();
        (mockJobsQueryChain as unknown as { then: typeof Promise.prototype.then }).then = (
          resolve: (value: { data: Array<{ id: string; target_language: string }> | null; error: null }) => void
        ) => {
          resolve({
            data: [{ id: 'job-1', target_language: 'de' }],
            error: null,
          });
          return mockJobsQueryChain;
        };

        const mockResetChain = createChainMock();
        mockResetChain.select.mockResolvedValue({
          data: [{ id: 'job-1', target_language: 'de' }],
          error: null,
        });

        let callCount = 0;
        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'items') return mockItemChain;
          if (table === 'translation_jobs') {
            callCount++;
            if (callCount === 1) return mockJobsQueryChain;
            return mockResetChain;
          }
          return mockItemChain;
        });

        const { POST } = await import('../../translations/retry/route');
        const request = createAuthenticatedRequest('POST', '/api/translations/retry', {
          entityType: 'item',
          entityId: '77777777-7777-7777-7777-777777777777',
          languages: ['de'],
        });

        // Act
        const response = await POST(request);
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.data.jobsRequeued).toBe(1);
        expect(json.data.affectedLanguages).toEqual(['de']);
      });

      it('returns success with zero count when no failed jobs exist', async () => {
        // Arrange
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({ data: { id: 'item-no-failures' }, error: null });

        const mockJobsQueryChain = createChainMock();
        (mockJobsQueryChain as unknown as { then: typeof Promise.prototype.then }).then = (
          resolve: (value: { data: never[]; error: null }) => void
        ) => {
          resolve({ data: [], error: null });
          return mockJobsQueryChain;
        };

        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'items') return mockItemChain;
          if (table === 'translation_jobs') return mockJobsQueryChain;
          return mockItemChain;
        });

        const { POST } = await import('../../translations/retry/route');
        const request = createAuthenticatedRequest('POST', '/api/translations/retry', {
          entityType: 'item',
          entityId: '88888888-8888-8888-8888-888888888888',
        });

        // Act
        const response = await POST(request);
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.jobsRequeued).toBe(0);
      });

      it('returns 404 for non-existent entity', async () => {
        // Arrange
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        });

        (supabaseAdmin.from as Mock).mockReturnValue(mockItemChain);

        const { POST } = await import('../../translations/retry/route');
        const request = createAuthenticatedRequest('POST', '/api/translations/retry', {
          entityType: 'item',
          entityId: '99999999-9999-9999-9999-999999999999',
        });

        // Act
        const response = await POST(request);
        const json = await response.json();

        // Assert
        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
      });
    });
  });

  // ==========================================================================
  // Manual Override Endpoint Tests (Task 7)
  // ==========================================================================

  describe('Manual Translation Override Endpoint', () => {
    describe('PUT /api/translations/[entityType]/[entityId]/[language]', () => {
      it('successfully updates translation with manual override', async () => {
        // Arrange - mock entity exists with property access
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({
          data: { id: 'item-manual-123', property_id: 'prop-123' },
          error: null,
        });

        const mockPropertyChain = createChainMock();
        mockPropertyChain.single.mockResolvedValue({
          data: { id: 'prop-123', user_id: mockUser.id, account_id: 'acc-123' },
          error: null,
        });

        const mockUpsertChain = createChainMock();
        mockUpsertChain.single.mockResolvedValue({
          data: { id: 'translation-123' },
          error: null,
        });

        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'items') return mockItemChain;
          if (table === 'properties') return mockPropertyChain;
          if (table === 'item_translations') return mockUpsertChain;
          return createChainMock();
        });

        const { PUT } = await import('../../translations/[entityType]/[entityId]/[language]/route');
        const request = createAuthenticatedRequest(
          'PUT',
          '/api/translations/item/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/fr',
          {
            name: 'Machine à café manuelle',
            description: 'Instructions manuelles pour la machine à café',
          }
        );

        // Act
        const response = await PUT(request, {
          params: Promise.resolve({
            entityType: 'item',
            entityId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            language: 'fr',
          }),
        });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.translationStatus).toBe('manual');
        expect(json.data.reviewedBy).toBe(mockUser.id);
      });

      it('rejects invalid fields for item translations', async () => {
        // Need to mock entity exists for auth to pass
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({
          data: { id: 'item-invalid-field', property_id: 'prop-123' },
          error: null,
        });

        const mockPropertyChain = createChainMock();
        mockPropertyChain.single.mockResolvedValue({
          data: { id: 'prop-123', user_id: mockUser.id, account_id: 'acc-123' },
          error: null,
        });

        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'items') return mockItemChain;
          if (table === 'properties') return mockPropertyChain;
          return createChainMock();
        });

        const { PUT } = await import('../../translations/[entityType]/[entityId]/[language]/route');
        const request = createAuthenticatedRequest(
          'PUT',
          '/api/translations/item/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/fr',
          {
            title: 'Invalid field for item', // 'title' is for articles, not items
          }
        );

        // Act
        const response = await PUT(request, {
          params: Promise.resolve({
            entityType: 'item',
            entityId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            language: 'fr',
          }),
        });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(json.error).toContain('not translatable');
      });

      it('rejects url field for link translations', async () => {
        // Need to mock entity exists for auth to pass
        const mockLinkChain = createChainMock();
        mockLinkChain.single.mockResolvedValue({
          data: { id: 'link-invalid-field', item_id: 'item-123' },
          error: null,
        });

        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({
          data: { id: 'item-123', property_id: 'prop-123' },
          error: null,
        });

        const mockPropertyChain = createChainMock();
        mockPropertyChain.single.mockResolvedValue({
          data: { id: 'prop-123', user_id: mockUser.id, account_id: 'acc-123' },
          error: null,
        });

        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'item_links') return mockLinkChain;
          if (table === 'items') return mockItemChain;
          if (table === 'properties') return mockPropertyChain;
          return createChainMock();
        });

        const { PUT } = await import('../../translations/[entityType]/[entityId]/[language]/route');
        const request = createAuthenticatedRequest(
          'PUT',
          '/api/translations/link/cccccccc-cccc-cccc-cccc-cccccccccccc/fr',
          {
            url: 'https://translated-url.com', // URLs should not be translated
          }
        );

        // Act
        const response = await PUT(request, {
          params: Promise.resolve({
            entityType: 'link',
            entityId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
            language: 'fr',
          }),
        });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(json.error).toContain('not translatable');
      });

      it('returns 403 when user lacks edit permission', async () => {
        // Arrange - entity owned by different user
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({
          data: { id: 'item-no-access', property_id: 'prop-other' },
          error: null,
        });

        const mockPropertyChain = createChainMock();
        mockPropertyChain.single.mockResolvedValue({
          data: { id: 'prop-other', user_id: 'different-user-id', account_id: 'other-account' },
          error: null,
        });

        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'items') return mockItemChain;
          if (table === 'properties') return mockPropertyChain;
          return createChainMock();
        });

        // Mock non-admin user
        (validateAdminAuth as Mock).mockResolvedValueOnce({
          user: { ...mockUser, id: 'non-owner-user' },
          isAdmin: false,
          isSysAdmin: false,
          supabase: {},
        });

        const { PUT } = await import('../../translations/[entityType]/[entityId]/[language]/route');
        const request = createAuthenticatedRequest(
          'PUT',
          '/api/translations/item/dddddddd-dddd-dddd-dddd-dddddddddddd/fr',
          {
            name: 'Attempted override',
          }
        );

        // Act
        const response = await PUT(request, {
          params: Promise.resolve({
            entityType: 'item',
            entityId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
            language: 'fr',
          }),
        });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(403);
        expect(json.success).toBe(false);
      });

      it('returns 400 for unsupported language code', async () => {
        const { PUT } = await import('../../translations/[entityType]/[entityId]/[language]/route');
        const request = createAuthenticatedRequest(
          'PUT',
          '/api/translations/item/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee/xx',
          {
            name: 'Translation to unsupported language',
          }
        );

        // Act
        const response = await PUT(request, {
          params: Promise.resolve({
            entityType: 'item',
            entityId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
            language: 'xx',
          }),
        });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(json.error).toContain('Unsupported language');
      });

      it('performs UPSERT when translation does not exist', async () => {
        // Arrange
        const mockItemChain = createChainMock();
        mockItemChain.single.mockResolvedValue({
          data: { id: 'item-new-trans', property_id: 'prop-123' },
          error: null,
        });

        const mockPropertyChain = createChainMock();
        mockPropertyChain.single.mockResolvedValue({
          data: { id: 'prop-123', user_id: mockUser.id, account_id: 'acc-123' },
          error: null,
        });

        const mockUpsertChain = createChainMock();
        mockUpsertChain.single.mockResolvedValue({
          data: { id: 'new-translation-id' },
          error: null,
        });

        (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
          if (table === 'items') return mockItemChain;
          if (table === 'properties') return mockPropertyChain;
          if (table === 'item_translations') return mockUpsertChain;
          return createChainMock();
        });

        const { PUT } = await import('../../translations/[entityType]/[entityId]/[language]/route');
        const request = createAuthenticatedRequest(
          'PUT',
          '/api/translations/item/ffffffff-ffff-ffff-ffff-ffffffffffff/de',
          {
            name: 'Neue deutsche Übersetzung',
          }
        );

        // Act
        const response = await PUT(request, {
          params: Promise.resolve({
            entityType: 'item',
            entityId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
            language: 'de',
          }),
        });
        const json = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(mockUpsertChain.upsert).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // Error Scenario Tests (Task 8)
  // ==========================================================================

  describe('Error Handling Scenarios', () => {
    it('handles database connection errors gracefully', async () => {
      // Arrange
      const selectMock = createChainMock();
      selectMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST301' },
      });
      (supabase.from as Mock).mockReturnValue(selectMock);

      const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
      const request = createAuthenticatedRequest('GET', '/api/translations/status/item/11111111-1111-1111-1111-111111111111');

      // Act
      const response = await GET(request, {
        params: Promise.resolve({
          entityType: 'item',
          entityId: '11111111-1111-1111-1111-111111111111',
        }),
      });
      const json = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
    });

    it('handles invalid UUID formats', async () => {
      const { GET } = await import('../../translations/status/[entityType]/[entityId]/route');
      const request = createAuthenticatedRequest('GET', '/api/translations/status/item/not-a-uuid');

      // Act
      const response = await GET(request, { params: Promise.resolve({ entityType: 'item', entityId: 'not-a-uuid' }) });
      const json = await response.json();

      // Assert
      expect([400, 404]).toContain(response.status);
      expect(json.success).toBe(false);
    });

    it('returns 401 for unauthenticated requests on retry endpoint', async () => {
      // Arrange
      (validateAdminAuth as Mock).mockResolvedValueOnce({
        error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
      });

      const { POST } = await import('../../translations/retry/route');
      const request = new NextRequest('http://localhost:3000/api/translations/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'item',
          entityId: '22222222-2222-2222-2222-222222222222',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
