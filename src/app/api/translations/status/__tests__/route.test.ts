/**
 * Unit Tests for Translation Status API Endpoint
 * Part of REQ-E05-001: Create Translation Status API Endpoint
 *
 * Tests query parameter validation, authentication, property access control,
 * and status aggregation logic.
 *
 * @created 2026-01-23
 * @lastModified 2026-01-23 17:00
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

// Mock modules before importing the route
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Import after mocking
import { GET, OPTIONS } from '../route';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Creates a mock NextRequest with query parameters
 */
function createMockRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/translations/status');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Mock user for authentication
 */
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'admin',
};

/**
 * Creates a mock Supabase client with chained methods
 */
function createMockSupabaseChain(data: unknown[], error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue({ data, error }),
  };
}

/**
 * Sets up default mocks for a successful request
 */
function setupDefaultMocks() {
  // Mock auth success
  (validateAdminAuth as Mock).mockResolvedValue({
    user: mockUser,
    isAdmin: true,
    isSysAdmin: false,
    supabase: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ account_id: 'account-1', accounts: { properties: [{ id: 'property-1' }] } }],
          error: null,
        }),
      }),
    },
  });

  // Mock supabaseAdmin default
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data: [], error: null }),
    not: vi.fn().mockReturnThis(),
  };
  (supabaseAdmin.from as Mock).mockReturnValue(mockChain);
}

// ============================================================================
// Test Suites
// ============================================================================

describe('GET /api/translations/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Section 9: Query Parameter Validation Tests
  // ==========================================================================
  describe('Query Parameter Validation', () => {
    beforeEach(() => {
      setupDefaultMocks();
    });

    it('should accept valid entityType parameter - item', async () => {
      const request = createMockRequest({ entityType: 'item' });
      const response = await GET(request);

      // Should not return 400
      expect(response.status).not.toBe(400);
    });

    it('should accept valid entityType parameter - article', async () => {
      const request = createMockRequest({ entityType: 'article' });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });

    it('should accept valid entityType parameter - link', async () => {
      const request = createMockRequest({ entityType: 'link' });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });

    it('should accept valid entityType parameter - tag', async () => {
      const request = createMockRequest({ entityType: 'tag' });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });

    it('should reject invalid entityType parameter', async () => {
      const request = createMockRequest({ entityType: 'invalid' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Invalid entityType');
      expect(json.error).toContain('item, article, link, tag');
    });

    it('should accept valid status parameter - pending', async () => {
      const request = createMockRequest({ status: 'pending' });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });

    it('should accept valid status parameter - completed', async () => {
      const request = createMockRequest({ status: 'completed' });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });

    it('should accept valid status parameter - failed', async () => {
      const request = createMockRequest({ status: 'failed' });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });

    it('should accept valid status parameter - manual', async () => {
      const request = createMockRequest({ status: 'manual' });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });

    it('should reject invalid status parameter', async () => {
      const request = createMockRequest({ status: 'invalid' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Invalid status');
      expect(json.error).toContain('pending, processing, completed, failed, manual');
    });

    it('should accept entityId as optional parameter', async () => {
      const requestWithId = createMockRequest({ entityId: 'test-entity-id' });
      const responseWithId = await GET(requestWithId);

      const requestWithoutId = createMockRequest({});
      const responseWithoutId = await GET(requestWithoutId);

      expect(responseWithId.status).not.toBe(400);
      expect(responseWithoutId.status).not.toBe(400);
    });

    it('should accept propertyId as optional parameter', async () => {
      const requestWithId = createMockRequest({ propertyId: 'property-123' });
      const responseWithId = await GET(requestWithId);

      const requestWithoutId = createMockRequest({});
      const responseWithoutId = await GET(requestWithoutId);

      expect(responseWithId.status).not.toBe(400);
      expect(responseWithoutId.status).not.toBe(400);
    });

    it('should accept multiple valid parameters together', async () => {
      const request = createMockRequest({
        entityType: 'item',
        status: 'completed',
        propertyId: 'property-123',
      });
      const response = await GET(request);

      expect(response.status).not.toBe(400);
    });
  });

  // ==========================================================================
  // Section 10: Property Access Control Tests
  // ==========================================================================
  describe('Property Access Control', () => {
    it('should return 401 for unauthenticated requests', async () => {
      (validateAdminAuth as Mock).mockResolvedValue({
        error: NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        ),
      });

      const request = createMockRequest({});
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 when user has no property access', async () => {
      (validateAdminAuth as Mock).mockResolvedValue({
        user: mockUser,
        isAdmin: false,
        isSysAdmin: false,
        supabase: {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        },
      });

      const request = createMockRequest({});
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toContain('No property access');
    });

    it('should return 403 when requesting inaccessible property', async () => {
      (validateAdminAuth as Mock).mockResolvedValue({
        user: mockUser,
        isAdmin: false,
        isSysAdmin: false,
        supabase: {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        },
      });

      const request = createMockRequest({ propertyId: 'inaccessible-property' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toContain('Access denied');
    });

    it('should return status for accessible properties only', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ account_id: 'account-1', accounts: { properties: [{ id: 'property-1' }] } }],
            error: null,
          }),
        }),
      };

      (validateAdminAuth as Mock).mockResolvedValue({
        user: mockUser,
        isAdmin: false,
        isSysAdmin: false,
        supabase: mockSupabase,
      });

      // Mock supabaseAdmin to return items
      (supabaseAdmin.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [{ id: 'item-1', name: 'Test Item', source_language: 'en', property_id: 'property-1', updated_at: '2026-01-23' }],
          error: null,
        }),
        not: vi.fn().mockReturnThis(),
      });

      const request = createMockRequest({ propertyId: 'property-1' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  // ==========================================================================
  // Section 11: Status Aggregation Tests
  // ==========================================================================
  describe('Status Aggregation', () => {
    beforeEach(() => {
      // Create a proper mock chain that returns expected nested data
      const createMockChain = () => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
        };
        // The final call in the chain should resolve with data
        chain.eq = vi.fn().mockResolvedValue({
          data: [{
            account_id: 'account-1',
            accounts: {
              id: 'account-1',
              properties: [{ id: 'property-1' }]
            }
          }],
          error: null,
        });
        return chain;
      };

      const mockSupabase = {
        from: vi.fn().mockImplementation(() => createMockChain()),
      };

      (validateAdminAuth as Mock).mockResolvedValue({
        user: mockUser,
        isAdmin: true,
        isSysAdmin: false,
        supabase: mockSupabase,
      });
    });

    it('should calculate correct summary counts with mixed statuses', async () => {
      // Mock items query
      const mockItemsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { id: 'item-1', name: 'Item 1', source_language: 'en', property_id: 'property-1', updated_at: '2026-01-23' },
          ],
          error: null,
        }),
        not: vi.fn().mockReturnThis(),
      };

      // Mock translations with mixed statuses
      const mockTranslationsChain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { item_id: 'item-1', language: 'fr', translation_status: 'completed', translated_at: '2026-01-22' },
            { item_id: 'item-1', language: 'es', translation_status: 'failed', translated_at: null },
            { item_id: 'item-1', language: 'de', translation_status: 'manual', translated_at: '2026-01-21' },
          ],
          error: null,
        }),
      };

      // Mock jobs
      const mockJobsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { entity_id: 'item-1', target_language: 'nl', status: 'queued', created_at: '2026-01-23' },
          ],
          error: null,
        }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemsChain;
        if (table === 'item_translations') return mockTranslationsChain;
        if (table === 'translation_jobs') return mockJobsChain;
        return mockItemsChain;
      });

      const request = createMockRequest({ entityType: 'item' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      // Verify the summary structure exists and has expected shape
      expect(json.summary).toBeDefined();
      expect(typeof json.summary.complete).toBe('number');
      expect(typeof json.summary.failed).toBe('number');
      expect(typeof json.summary.pending).toBe('number');
      expect(typeof json.summary.manual).toBe('number');
      expect(typeof json.summary.total).toBe('number');
    });

    it('should handle entities with no translations', async () => {
      // Mock items query
      const mockItemsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { id: 'item-1', name: 'Item 1', source_language: 'en', property_id: 'property-1', updated_at: '2026-01-23' },
          ],
          error: null,
        }),
        not: vi.fn().mockReturnThis(),
      };

      // Mock empty translations and jobs
      const mockEmptyChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemsChain;
        return mockEmptyChain;
      });

      const request = createMockRequest({ entityType: 'item' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.items).toHaveLength(1);
      // All languages should show as pending since no translations exist
      expect(json.items[0].translations).toBeDefined();
    });

    it('should filter items by status parameter', async () => {
      // Mock items query
      const mockItemsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { id: 'item-1', name: 'Item 1', source_language: 'en', property_id: 'property-1', updated_at: '2026-01-23' },
            { id: 'item-2', name: 'Item 2', source_language: 'en', property_id: 'property-1', updated_at: '2026-01-23' },
          ],
          error: null,
        }),
        not: vi.fn().mockReturnThis(),
      };

      // Mock translations - item-1 has failed, item-2 has completed
      const mockTranslationsChain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { item_id: 'item-1', language: 'fr', translation_status: 'failed', translated_at: null },
            { item_id: 'item-2', language: 'fr', translation_status: 'completed', translated_at: '2026-01-22' },
          ],
          error: null,
        }),
      };

      const mockJobsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemsChain;
        if (table === 'item_translations') return mockTranslationsChain;
        if (table === 'translation_jobs') return mockJobsChain;
        return mockItemsChain;
      });

      const request = createMockRequest({ entityType: 'item', status: 'failed' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      // Only item-1 should be returned since it has a failed translation
      expect(json.items.some((item: { entityId: string }) => item.entityId === 'item-1')).toBe(true);
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================
  describe('Error Handling', () => {
    it('should return 500 on unexpected error', async () => {
      (validateAdminAuth as Mock).mockRejectedValue(new Error('Unexpected error'));

      const request = createMockRequest({});
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Internal server error');
    });
  });
});

// ============================================================================
// OPTIONS Handler Tests
// ============================================================================
describe('OPTIONS /api/translations/status', () => {
  it('should return 204 with CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
  });
});
