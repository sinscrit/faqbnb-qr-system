/**
 * Unit Tests for Manual Translation Override API Endpoint
 * Part of REQ-E03-023: Create Manual Translation Override Endpoint (Epic 3)
 * Part of REQ-E05-002: Create Update Translation API Endpoint (Epic 5)
 *
 * Mock Setup Requirements:
 * - Mock Supabase client using vi.mock
 * - Mock validateAdminAuth to return test user data
 * - Tests do not connect to real database
 *
 * Epic 5 Enhancements:
 * - reviewed_by column now available for items, articles, and links
 * - Tags do not support reviewed_by (different schema)
 *
 * @created 2026-01-21
 * @lastModified 2026-01-24
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

vi.mock('@/lib/translation-service/translation-service.types', () => ({
  isSupportedLanguage: vi.fn((lang: string) => ['en', 'fr', 'es', 'de', 'nl', 'it'].includes(lang)),
}));

// Import after mocking
import { PUT, OPTIONS } from '../route';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to create mock NextRequest
function createMockRequest(
  body: unknown,
  params: { entityType: string; entityId: string; language: string }
): NextRequest {
  const bodyStr = JSON.stringify(body);
  return new NextRequest(
    `http://localhost/api/translations/${params.entityType}/${params.entityId}/${params.language}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyStr,
    }
  );
}

// Helper for mock user
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'admin',
};

// Helper for mock params
function createParams(entityType: string, entityId: string, language: string) {
  return { params: Promise.resolve({ entityType, entityId, language }) };
}

describe('PUT /api/translations/[entityType]/[entityId]/[language]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default auth success
    (validateAdminAuth as Mock).mockResolvedValue({
      user: mockUser,
      isAdmin: true,
      isSysAdmin: false,
      supabase: {},
    });
  });

  describe('Parameter Validation', () => {
    it('should return 400 for invalid entityType', async () => {
      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'invalid', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('invalid', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('INVALID_ENTITY_TYPE');
    });

    it('should return 400 for invalid entityId format', async () => {
      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: 'not-a-uuid', language: 'fr' }
      );
      const params = createParams('item', 'not-a-uuid', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('INVALID_ENTITY_ID');
    });

    it('should accept non-UUID entityId for tags', async () => {
      // Setup mocks
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      (supabaseAdmin.from as Mock).mockReturnValue(mockChain);

      const request = createMockRequest(
        { value: 'Test Value' },
        { entityType: 'tag', entityId: 'my-tag-key', language: 'fr' }
      );
      const params = createParams('tag', 'my-tag-key', 'fr');

      const response = await PUT(request, params);
      // Should proceed past UUID validation - may fail at entity check
      expect(response.status).not.toBe(400);
    });

    it('should return 400 for invalid language', async () => {
      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'xx' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'xx');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('INVALID_LANGUAGE');
    });

    it('should accept valid language codes', async () => {
      // Setup entity found mock
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'user-123' }, error: null }),
      };
      const mockUpsertChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'trans-1' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        if (table === 'item_translations') return mockUpsertChain;
        return mockItemChain;
      });

      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);

      // Should not fail validation
      expect(response.status).not.toBe(400);
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      (validateAdminAuth as Mock).mockResolvedValue({
        error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
      });

      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);

      expect(response.status).toBe(401);
    });
  });

  describe('Entity Validation', () => {
    it('should return 404 for non-existent entity', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        }),
      };
      (supabaseAdmin.from as Mock).mockReturnValue(mockChain);

      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.code).toBe('ENTITY_NOT_FOUND');
    });
  });

  describe('Authorization', () => {
    it('should return 403 when user lacks permission', async () => {
      (validateAdminAuth as Mock).mockResolvedValue({
        user: { ...mockUser, id: 'other-user' },
        isAdmin: false,
        isSysAdmin: false,
        supabase: {},
      });

      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'owner-user' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        return mockItemChain;
      });

      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.code).toBe('FORBIDDEN');
    });

    it('should allow admin to edit any entity', async () => {
      (validateAdminAuth as Mock).mockResolvedValue({
        user: mockUser,
        isAdmin: true,
        isSysAdmin: false,
        supabase: {},
      });

      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'other-user' }, error: null }),
      };
      const mockUpsertChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'trans-1' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        if (table === 'item_translations') return mockUpsertChain;
        return mockItemChain;
      });

      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);

      // Admin should be able to proceed
      expect(response.status).not.toBe(403);
    });
  });

  describe('Field Validation', () => {
    beforeEach(() => {
      // Setup entity exists
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'user-123' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        return mockItemChain;
      });
    });

    it('should return 400 for invalid JSON body', async () => {
      const request = new NextRequest(
        'http://localhost/api/translations/item/12345678-1234-1234-1234-123456789abc/fr',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: 'not json',
        }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('INVALID_FIELDS');
    });

    it('should return 400 for non-translatable fields', async () => {
      const request = createMockRequest(
        { url: 'https://example.com' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('INVALID_FIELDS');
      expect(json.error).toContain('not translatable');
    });

    it('should return 400 for empty fields', async () => {
      const request = createMockRequest(
        { name: '   ' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('INVALID_FIELDS');
      expect(json.error).toContain('empty');
    });

    it('should return 400 for no fields provided', async () => {
      const request = createMockRequest(
        {},
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('At least one');
    });
  });

  describe('Successful Operations', () => {
    it('should update item translation and return success', async () => {
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'user-123' }, error: null }),
      };
      const mockUpsertChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'trans-1' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        if (table === 'item_translations') return mockUpsertChain;
        return mockItemChain;
      });

      const request = createMockRequest(
        { name: 'Test Name', description: 'Test Description' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.entityType).toBe('item');
      expect(json.data.entityId).toBe('12345678-1234-1234-1234-123456789abc');
      expect(json.data.language).toBe('fr');
      expect(json.data.fieldsUpdated).toBe(2);
      expect(json.data.translationStatus).toBe('manual');
      expect(json.data.reviewedBy).toBe('user-123');
    });

    it('should update article translation with reviewed_by', async () => {
      const mockArticleChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'article-1', item_id: 'item-1' }, error: null }),
      };
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'user-123' }, error: null }),
      };
      const mockUpsertChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'trans-1' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'item_articles') return mockArticleChain;
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        if (table === 'article_translations') return mockUpsertChain;
        return mockArticleChain;
      });

      const request = createMockRequest(
        { title: 'Test Title' },
        { entityType: 'article', entityId: '12345678-1234-1234-1234-123456789abc', language: 'es' }
      );
      const params = createParams('article', '12345678-1234-1234-1234-123456789abc', 'es');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.entityType).toBe('article');
      expect(json.data.fieldsUpdated).toBe(1);
      expect(json.data.reviewedBy).toBe('user-123');
    });

    // Epic 5: Link translation with reviewed_by
    it('should update link translation with reviewed_by (Epic 5)', async () => {
      const mockLinkChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'link-1', item_id: 'item-1' }, error: null }),
      };
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'user-123' }, error: null }),
      };
      const mockUpsertChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'trans-1' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'item_links') return mockLinkChain;
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        if (table === 'link_translations') return mockUpsertChain;
        return mockLinkChain;
      });

      const request = createMockRequest(
        { title: 'Test Link Title' },
        { entityType: 'link', entityId: '12345678-1234-1234-1234-123456789abc', language: 'de' }
      );
      const params = createParams('link', '12345678-1234-1234-1234-123456789abc', 'de');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.entityType).toBe('link');
      expect(json.data.language).toBe('de');
      expect(json.data.fieldsUpdated).toBe(1);
      expect(json.data.translationStatus).toBe('manual');
      expect(json.data.reviewedBy).toBe('user-123');
    });

    // Epic 5: Verify updatedAt timestamp is returned
    it('should include updatedAt timestamp in response (Epic 5)', async () => {
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1', property_id: 'prop-1' }, error: null }),
      };
      const mockPropChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'prop-1', user_id: 'user-123' }, error: null }),
      };
      const mockUpsertChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'trans-1' }, error: null }),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table: string) => {
        if (table === 'items') return mockItemChain;
        if (table === 'properties') return mockPropChain;
        if (table === 'item_translations') return mockUpsertChain;
        return mockItemChain;
      });

      const request = createMockRequest(
        { name: 'Test Name' },
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789abc', language: 'fr' }
      );
      const params = createParams('item', '12345678-1234-1234-1234-123456789abc', 'fr');

      const response = await PUT(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.updatedAt).toBeDefined();
      // Verify it's a valid ISO date string
      expect(new Date(json.data.updatedAt).toISOString()).toBe(json.data.updatedAt);
    });
  });
});

describe('OPTIONS /api/translations/[entityType]/[entityId]/[language]', () => {
  it('should return 204 with CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('PUT, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
  });
});
