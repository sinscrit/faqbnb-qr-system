/**
 * Unit Tests for Retry Failed Translations API Endpoint
 * Part of REQ-E03-022: Create Retry Failed Translations Endpoint
 *
 * @created 2026-01-21
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
import { POST, OPTIONS } from '../route';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to create mock NextRequest
function createMockRequest(body: unknown): NextRequest {
  const bodyStr = JSON.stringify(body);
  return new NextRequest('http://localhost/api/translations/retry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: bodyStr,
  });
}

// Helper for mock user
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'admin',
};

describe('POST /api/translations/retry', () => {
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

  describe('Validation', () => {
    it('should return 400 for invalid entityType', async () => {
      const request = createMockRequest({
        entityType: 'invalid',
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('INVALID_ENTITY_TYPE');
      expect(json.error).toContain('Invalid entity type');
    });

    it('should return 400 for missing entityType', async () => {
      const request = createMockRequest({
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('VALIDATION_ERROR');
      expect(json.error).toContain('entityType is required');
    });

    it('should return 400 for missing entityId', async () => {
      const request = createMockRequest({
        entityType: 'item',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('VALIDATION_ERROR');
      expect(json.error).toContain('entityId is required');
    });

    it('should return 400 for invalid entityId format', async () => {
      const request = createMockRequest({
        entityType: 'item',
        entityId: 'not-a-uuid',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.code).toBe('VALIDATION_ERROR');
      expect(json.error).toContain('valid UUID');
    });

    it('should accept valid tag with non-UUID entityId', async () => {
      // For tags, the entityId can be a string key, not UUID
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      (supabaseAdmin.from as Mock).mockReturnValue(mockChain);

      const request = createMockRequest({
        entityType: 'tag',
        entityId: 'tag-key-string',
      });

      const response = await POST(request);
      // Should proceed past validation - may return 404 for entity not found, but not 400 for UUID
      expect(response.status).not.toBe(400);
    });

    it('should return 400 for invalid JSON body', async () => {
      const request = new NextRequest('http://localhost/api/translations/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not json',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Invalid JSON');
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      (validateAdminAuth as Mock).mockResolvedValue({
        error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
      });

      const request = createMockRequest({
        entityType: 'item',
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Entity Validation', () => {
    it('should return 404 for non-existent item', async () => {
      // Mock entity not found (PGRST116 error code)
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        }),
      };
      (supabaseAdmin.from as Mock).mockReturnValue(mockChain);

      const request = createMockRequest({
        entityType: 'item',
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.code).toBe('NOT_FOUND');
    });
  });

  describe('Successful Operations', () => {
    it('should reset all failed jobs when languages not specified', async () => {
      // Setup: Entity exists
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1' }, error: null }),
      };

      // Setup: Failed jobs query
      const mockJobsQueryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({
          data: [
            { id: 'job-1', target_language: 'fr' },
            { id: 'job-2', target_language: 'de' },
          ],
          error: null,
        })),
      };

      // Setup: Reset chain
      const mockResetChain = {
        update: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [
            { id: 'job-1', target_language: 'fr' },
            { id: 'job-2', target_language: 'de' },
          ],
          error: null,
        }),
      };

      let callCount = 0;
      (supabaseAdmin.from as Mock).mockImplementation((table) => {
        if (table === 'items') return mockItemChain;
        if (table === 'translation_jobs') {
          callCount++;
          // First call is for querying failed jobs, second is for update
          if (callCount === 1) {
            return mockJobsQueryChain;
          }
          return mockResetChain;
        }
        return mockItemChain;
      });

      const request = createMockRequest({
        entityType: 'item',
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.entityType).toBe('item');
      expect(json.data.entityId).toBe('12345678-1234-1234-1234-123456789abc');
      expect(json.data.timestamp).toBeDefined();
      expect(json.data.jobsRequeued).toBe(2);
      expect(json.data.affectedLanguages).toContain('fr');
      expect(json.data.affectedLanguages).toContain('de');
    });

    it('should return success with count 0 when no failed jobs exist', async () => {
      // Setup: Entity exists
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1' }, error: null }),
      };

      // Setup: No failed jobs
      const mockJobsQueryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table) => {
        if (table === 'items') return mockItemChain;
        if (table === 'translation_jobs') return mockJobsQueryChain;
        return mockItemChain;
      });

      const request = createMockRequest({
        entityType: 'item',
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.jobsRequeued).toBe(0);
      expect(json.data.affectedLanguages).toEqual([]);
    });
  });

  describe('Idempotency', () => {
    it('should be safe to call multiple times', async () => {
      // Setup: Entity exists, no failed jobs
      const mockItemChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'item-1' }, error: null }),
      };

      const mockJobsQueryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };

      (supabaseAdmin.from as Mock).mockImplementation((table) => {
        if (table === 'items') return mockItemChain;
        if (table === 'translation_jobs') return mockJobsQueryChain;
        return mockItemChain;
      });

      const request1 = createMockRequest({
        entityType: 'item',
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const request2 = createMockRequest({
        entityType: 'item',
        entityId: '12345678-1234-1234-1234-123456789abc',
      });

      const response1 = await POST(request1);
      const response2 = await POST(request2);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const json1 = await response1.json();
      const json2 = await response2.json();

      expect(json1.success).toBe(true);
      expect(json2.success).toBe(true);
    });
  });
});

describe('OPTIONS /api/translations/retry', () => {
  it('should return 204 with CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
  });
});
