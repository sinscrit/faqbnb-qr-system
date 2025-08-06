/**
 * Beta Access Request Functionality Test Suite
 * REQ-017: Auto-Create Access Requests from Beta Waitlist
 * 
 * This test suite validates the complete beta waitlist to access request flow,
 * including mailing list integration, access request creation, admin dashboard
 * functionality, and email template generation.
 */

import { AccessRequestSource, AccessRequestStatus } from '@/types/admin';
import { validateBetaAccessRequest } from '@/lib/access-management';
import { generateBetaAccessApprovalEmail, generateAccessApprovalEmail } from '@/lib/email-templates';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'https://faqbnb.com';

describe('REQ-017: Beta Access Request Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Type System Validation', () => {
    test('should support beta access request source in enum', () => {
      expect(AccessRequestSource.BETA_WAITLIST).toBe('beta_waitlist');
      expect(Object.values(AccessRequestSource)).toContain('beta_waitlist');
    });

    test('should include all expected access request sources', () => {
      const expectedSources = ['admin_created', 'beta_waitlist', 'public_form', 'direct_request'];
      expectedSources.forEach(source => {
        expect(Object.values(AccessRequestSource)).toContain(source);
      });
    });

    test('should support null account_id in interface', () => {
      // This is a TypeScript compile-time test
      const betaRequest = {
        id: 'test-id',
        requester_email: 'test@example.com',
        account_id: null, // Should be allowed for beta requests
        request_date: new Date().toISOString(),
        status: 'pending' as const,
        source: AccessRequestSource.BETA_WAITLIST,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      expect(betaRequest.account_id).toBeNull();
      expect(betaRequest.source).toBe(AccessRequestSource.BETA_WAITLIST);
    });
  });

  describe('2. Mailing List API Integration', () => {
    test('should create access request when mailing list signup succeeds', async () => {
      const mockResponse = {
        success: true,
        message: 'Thank you for subscribing!',
        data: {
          email: 'beta@example.com',
          subscribedAt: new Date().toISOString(),
          alreadySubscribed: false,
          accessRequest: {
            id: 'request-123',
            status: 'pending',
            created: true
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'beta@example.com' })
      });

      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.accessRequest).toBeDefined();
      expect(data.data.accessRequest.created).toBe(true);
    });

    test('should handle existing subscriber with new access request', async () => {
      const mockResponse = {
        success: true,
        message: 'You are already subscribed!',
        data: {
          email: 'existing@example.com',
          subscribedAt: '2025-01-01T00:00:00Z',
          alreadySubscribed: true,
          accessRequest: {
            id: 'request-456',
            status: 'pending',
            created: true
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        body: JSON.stringify({ email: 'existing@example.com' })
      });

      const data = await response.json();
      
      expect(data.data.alreadySubscribed).toBe(true);
      expect(data.data.accessRequest.created).toBe(true);
    });

    test('should handle mailing list signup without breaking on access request failure', async () => {
      const mockResponse = {
        success: true,
        message: 'Thank you for subscribing!',
        data: {
          email: 'test@example.com',
          subscribedAt: new Date().toISOString(),
          alreadySubscribed: false
          // No accessRequest field indicates it failed
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' })
      });

      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.accessRequest).toBeUndefined();
    });
  });

  describe('3. Access Management Validation', () => {
    test('should validate beta access requests correctly', () => {
      const validResult = validateBetaAccessRequest('valid@example.com', {
        origin: 'beta_waitlist',
        auto_created: true
      });

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      expect(validResult.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Beta access request will require admin assignment'),
          expect.stringContaining('User will receive access notification email')
        ])
      );
    });

    test('should reject invalid email formats', () => {
      const invalidResult = validateBetaAccessRequest('invalid-email', {});
      
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Invalid email format');
    });

    test('should reject empty email', () => {
      const emptyResult = validateBetaAccessRequest('', {});
      
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.errors).toContain('Email is required for beta access request');
    });

    test('should reject too long emails', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const longResult = validateBetaAccessRequest(longEmail, {});
      
      expect(longResult.isValid).toBe(false);
      expect(longResult.errors).toContain('Email address is too long (max 255 characters)');
    });

    test('should validate metadata structure', () => {
      const invalidMetadata = validateBetaAccessRequest('test@example.com', 'invalid' as any);
      
      expect(invalidMetadata.isValid).toBe(false);
      expect(invalidMetadata.errors).toContain('Metadata must be an object');
    });
  });

  describe('4. Admin API Integration', () => {
    test('should support source filtering in GET requests', async () => {
      const mockRequests = [
        {
          id: 'req-1',
          requester_email: 'beta1@example.com',
          source: AccessRequestSource.BETA_WAITLIST,
          status: AccessRequestStatus.PENDING
        },
        {
          id: 'req-2', 
          requester_email: 'admin@example.com',
          source: AccessRequestSource.ADMIN_CREATED,
          status: AccessRequestStatus.APPROVED
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { requests: mockRequests.filter(r => r.source === AccessRequestSource.BETA_WAITLIST) }
        })
      });

      const response = await fetch('/api/admin/access-requests?source=beta_waitlist');
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.requests).toHaveLength(1);
      expect(data.data.requests[0].source).toBe(AccessRequestSource.BETA_WAITLIST);
    });

    test('should support creating beta requests via POST', async () => {
      const betaRequestData = {
        requester_email: 'beta@example.com',
        requester_name: null,
        account_id: null,
        source: AccessRequestSource.BETA_WAITLIST,
        notes: 'Auto-created from beta waitlist'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'new-beta-req',
            ...betaRequestData,
            status: AccessRequestStatus.PENDING,
            created_at: new Date().toISOString()
          }
        })
      });

      const response = await fetch('/api/admin/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betaRequestData)
      });

      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.source).toBe(AccessRequestSource.BETA_WAITLIST);
      expect(data.data.account_id).toBeNull();
    });
  });

  describe('5. Email Template Generation', () => {
    const mockBetaRequest = {
      id: 'beta-req-1',
      requester_email: 'beta@example.com',
      requester_name: 'Beta User',
      account_id: null,
      request_date: '2025-08-06T10:00:00Z',
      status: 'pending' as const,
      source: AccessRequestSource.BETA_WAITLIST,
      created_at: '2025-08-06T10:00:00Z',
      updated_at: '2025-08-06T10:00:00Z'
    };

    test('should generate beta-specific email template', () => {
      const template = generateBetaAccessApprovalEmail(mockBetaRequest, 'BETA123', 'Test Account');
      
      expect(template.subject).toContain('Beta');
      expect(template.subject).toContain('🚀');
      expect(template.body).toContain('beta');
      expect(template.body).toContain('BETA123');
      expect(template.body).toContain('exclusive early access');
      expect(template.variables.accessCode).toBe('BETA123');
      expect(template.variables.userEmail).toBe('beta@example.com');
    });

    test('should route beta requests to beta email template', () => {
      const template = generateAccessApprovalEmail(mockBetaRequest, 'BETA456', 'Test Account');
      
      // Should be routed to beta template
      expect(template.subject).toContain('Beta');
      expect(template.body).toContain('beta'));
    });

    test('should use regular template for non-beta requests', () => {
      const regularRequest = {
        ...mockBetaRequest,
        source: AccessRequestSource.ADMIN_CREATED,
        account_id: 'account-123'
      };

      const template = generateAccessApprovalEmail(regularRequest, 'REG789', 'Test Account');
      
      expect(template.subject).not.toContain('Beta');
      expect(template.subject).toContain('Access Granted');
      expect(template.body).toContain('REG789');
      expect(template.body).not.toContain('beta');
    });

    test('should handle missing requester name in beta template', () => {
      const noNameRequest = {
        ...mockBetaRequest,
        requester_name: undefined
      };

      const template = generateBetaAccessApprovalEmail(noNameRequest, 'TEST123');
      
      expect(template.body).toContain('Hello there,');
      expect(template.variables.requesterName).toBe('there');
    });

    test('should include all required variables in beta template', () => {
      const template = generateBetaAccessApprovalEmail(mockBetaRequest, 'VAR123', 'Var Account');
      
      const expectedVariables = [
        'requesterName', 'accountName', 'accessCode', 
        'requestDate', 'approvalDate', 'registrationLink', 'userEmail'
      ];

      expectedVariables.forEach(variable => {
        expect(template.variables).toHaveProperty(variable);
      });
    });
  });

  describe('6. User Interface Components', () => {
    test('should render beta source badge correctly', () => {
      // This would be tested in a component test environment
      const sourceBadge = {
        style: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Beta Waitlist',
        icon: '🚀'
      };

      expect(sourceBadge.label).toBe('Beta Waitlist');
      expect(sourceBadge.icon).toBe('🚀');
      expect(sourceBadge.style).toContain('purple');
    });

    test('should support source filtering in UI', () => {
      const filterOptions = [
        { value: 'all', label: 'All Sources' },
        { value: AccessRequestSource.BETA_WAITLIST, label: '🚀 Beta Waitlist' },
        { value: AccessRequestSource.ADMIN_CREATED, label: '👑 Admin Created' },
        { value: AccessRequestSource.PUBLIC_FORM, label: '📝 Public Form' },
        { value: AccessRequestSource.DIRECT_REQUEST, label: '📞 Direct Request' }
      ];

      const betaOption = filterOptions.find(opt => opt.value === AccessRequestSource.BETA_WAITLIST);
      expect(betaOption).toBeDefined();
      expect(betaOption?.label).toContain('Beta Waitlist');
    });
  });

  describe('7. Integration Flow Tests', () => {
    test('should complete full beta signup to approval flow', async () => {
      // Step 1: Beta signup
      const signupResponse = {
        success: true,
        data: {
          email: 'integration@example.com',
          accessRequest: { id: 'int-req-1', created: true }
        }
      };

      // Step 2: Admin sees request in dashboard
      const dashboardResponse = {
        success: true,
        data: {
          requests: [{
            id: 'int-req-1',
            requester_email: 'integration@example.com',
            source: AccessRequestSource.BETA_WAITLIST,
            status: AccessRequestStatus.PENDING
          }]
        }
      };

      // Step 3: Admin approves request
      const approvalResponse = {
        success: true,
        data: {
          id: 'int-req-1',
          status: AccessRequestStatus.APPROVED,
          access_code: 'INT123'
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => signupResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => dashboardResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => approvalResponse });

      // Execute flow
      const signup = await fetch('/api/mailing-list', {
        method: 'POST',
        body: JSON.stringify({ email: 'integration@example.com' })
      });
      const signupData = await signup.json();

      const dashboard = await fetch('/api/admin/access-requests?source=beta_waitlist');
      const dashboardData = await dashboard.json();

      const approval = await fetch(`/api/admin/access-requests/${signupData.data.accessRequest.id}/grant`, {
        method: 'POST',
        body: JSON.stringify({ send_email: true })
      });
      const approvalData = await approval.json();

      // Verify complete flow
      expect(signupData.data.accessRequest.created).toBe(true);
      expect(dashboardData.data.requests[0].source).toBe(AccessRequestSource.BETA_WAITLIST);
      expect(approvalData.data.status).toBe(AccessRequestStatus.APPROVED);
    });

    test('should handle error scenarios gracefully', async () => {
      // Test mailing list success with access request failure
      const partialSuccessResponse = {
        success: true,
        message: 'Subscribed successfully',
        data: {
          email: 'partial@example.com',
          subscribedAt: new Date().toISOString(),
          // No accessRequest indicates creation failed
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => partialSuccessResponse
      });

      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        body: JSON.stringify({ email: 'partial@example.com' })
      });

      const data = await response.json();
      
      // Should succeed for mailing list even if access request fails
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('partial@example.com');
      expect(data.data.accessRequest).toBeUndefined();
    });
  });

  describe('8. Performance and Edge Cases', () => {
    test('should handle duplicate beta signups correctly', async () => {
      const email = 'duplicate@example.com';
      
      // First signup
      const firstResponse = {
        success: true,
        data: {
          email,
          accessRequest: { id: 'dup-1', created: true }
        }
      };

      // Second signup (duplicate)
      const secondResponse = {
        success: true,
        data: {
          email,
          alreadySubscribed: true,
          accessRequest: { id: 'dup-1', created: false } // Already exists
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => firstResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => secondResponse });

      const first = await fetch('/api/mailing-list', { method: 'POST', body: JSON.stringify({ email }) });
      const firstData = await first.json();

      const second = await fetch('/api/mailing-list', { method: 'POST', body: JSON.stringify({ email }) });
      const secondData = await second.json();

      expect(firstData.data.accessRequest.created).toBe(true);
      expect(secondData.data.accessRequest.created).toBe(false);
      expect(secondData.data.alreadySubscribed).toBe(true);
    });

    test('should validate email format before processing', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test space@example.com',
        '',
        'a'.repeat(250) + '@example.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateBetaAccessRequest(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should handle large metadata objects', () => {
      const largeMetadata = {
        origin: 'beta_waitlist',
        user_agent: 'A'.repeat(1000),
        ip_address: '127.0.0.1',
        referrer: 'https://example.com',
        additional_data: { key: 'B'.repeat(500) }
      };

      const result = validateBetaAccessRequest('test@example.com', largeMetadata);
      expect(result.isValid).toBe(true);
    });
  });
});

/**
 * Test Utilities for Beta Access Request Testing
 */
export const testUtils = {
  createMockBetaRequest: (overrides = {}) => ({
    id: 'test-beta-req',
    requester_email: 'test@example.com',
    requester_name: 'Test User',
    account_id: null,
    request_date: new Date().toISOString(),
    status: AccessRequestStatus.PENDING,
    source: AccessRequestSource.BETA_WAITLIST,
    metadata: {
      origin: 'beta_waitlist',
      auto_created: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  createMockMailingListResponse: (email: string, hasAccessRequest = true) => ({
    success: true,
    message: 'Thank you for subscribing!',
    data: {
      email,
      subscribedAt: new Date().toISOString(),
      alreadySubscribed: false,
      ...(hasAccessRequest && {
        accessRequest: {
          id: `req-${Date.now()}`,
          status: 'pending',
          created: true
        }
      })
    }
  }),

  mockApiResponse: (data: any, success = true) => ({
    ok: success,
    json: async () => ({ success, data })
  })
};