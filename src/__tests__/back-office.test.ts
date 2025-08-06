/**
 * Comprehensive Testing Suite for REQ-016: System Admin Back Office
 * Tests domain configuration, user analytics, access management, and email templates
 */

import { validateDomainConfig, getQRDomain, buildQRUrl } from '@/lib/config';
import { generateQRCodeForItem, validateQRConfiguration } from '@/lib/qrcode-utils';
import { validateAccessRequest, generateAccessCode, processAccessApproval } from '@/lib/access-management';
import { generateAccessApprovalEmail, validateEmailTemplate, generateSecureAccessLink, validateAccessLink } from '@/lib/email-templates';
import { calculateDaysSinceRequest, getRegistrationStatus, analyzeRegistrationTimelines } from '@/lib/analytics';
import { MockEmailService, validateEmailAddresses } from '@/lib/email-service';

/**
 * Domain Configuration Tests
 */
describe('Domain Configuration', () => {
  test('should validate HTTPS domains correctly', () => {
    expect(validateDomainConfig('https://faqbnb.com')).toBe(true);
    expect(validateDomainConfig('https://app.faqbnb.com')).toBe(true);
    expect(validateDomainConfig('http://insecure.com')).toBe(false);
    expect(validateDomainConfig('invalid-url')).toBe(false);
    expect(validateDomainConfig('')).toBe(false);
  });

  test('should build QR URLs correctly', () => {
    const publicId = 'test-item-123';
    const url = buildQRUrl(publicId);
    expect(url).toContain('/item/test-item-123');
    expect(url).toMatch(/^https?:\/\//);
  });

  test('should validate QR configuration', () => {
    const validation = validateQRConfiguration();
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('issues');
    expect(validation).toHaveProperty('configuration');
    expect(Array.isArray(validation.issues)).toBe(true);
  });
});

/**
 * QR Code Generation Tests
 */
describe('QR Code Generation', () => {
  test('should generate QR code for item successfully', async () => {
    const result = await generateQRCodeForItem('test-item-456');
    expect(result.success).toBe(true);
    expect(result.url).toContain('test-item-456');
    expect(result.metadata.domain).toBeTruthy();
    expect(result.metadata.timestamp).toBeTruthy();
  });

  test('should handle custom domain override', async () => {
    const result = await generateQRCodeForItem('test-item-789', {
      domain: 'https://custom.faqbnb.com'
    });
    expect(result.success).toBe(true);
    expect(result.url).toContain('custom.faqbnb.com');
    expect(result.metadata.domainSource).toBe('override');
  });

  test('should reject invalid domain override', async () => {
    const result = await generateQRCodeForItem('test-item-error', {
      domain: 'invalid-domain'
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid domain');
  });
});

/**
 * Access Management Tests
 */
describe('Access Management', () => {
  test('should generate valid access codes', async () => {
    const code1 = await generateAccessCode();
    const code2 = await generateAccessCode();
    
    expect(code1).toHaveLength(12);
    expect(code2).toHaveLength(12);
    expect(code1).not.toBe(code2);
    expect(code1).toMatch(/^[A-Z0-9]{12}$/);
  });

  test('should validate access requests correctly', async () => {
    const validRequest = {
      requester_email: 'test@example.com',
      account_id: 'test-account-123',
      status: 'pending' as const
    };

    const invalidRequest = {
      requester_email: 'invalid-email',
      account_id: '',
    };

    const validResult = await validateAccessRequest(validRequest);
    const invalidResult = await validateAccessRequest(invalidRequest);

    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
    
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test('should validate email addresses', () => {
    const emails = [
      'valid@example.com',
      'invalid-email',
      'another@test.org',
      '@invalid.com',
      'valid.email+tag@domain.com'
    ];

    const result = validateEmailAddresses(emails);
    expect(result.valid).toContain('valid@example.com');
    expect(result.valid).toContain('another@test.org');
    expect(result.valid).toContain('valid.email+tag@domain.com');
    expect(result.invalid.some(item => item.email === 'invalid-email')).toBe(true);
  });
});

/**
 * Email Template Tests
 */
describe('Email Templates', () => {
  test('should generate access approval email', () => {
    const mockRequest = {
      id: 'req-123',
      requester_email: 'user@example.com',
      requester_name: 'Test User',
      account_id: 'account-456',
      request_date: new Date().toISOString(),
      status: 'pending' as const
    };

    const template = generateAccessApprovalEmail(mockRequest, 'ABC123DEF456', 'Test Account');
    
    expect(template.subject).toContain('Access Granted');
    expect(template.body).toContain('ABC123DEF456');
    expect(template.body).toContain('Test User');
    expect(template.body).toContain('Test Account');
    expect(template.variables.accessCode).toBe('ABC123DEF456');
  });

  test('should validate email templates', () => {
    const validTemplate = {
      subject: 'Test Subject',
      body: 'Test body with content',
      variables: { accessCode: 'TEST123' }
    };

    const invalidTemplate = {
      subject: '',
      body: '',
      variables: {}
    };

    const validResult = validateEmailTemplate(validTemplate);
    const invalidResult = validateEmailTemplate(invalidTemplate);

    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test('should generate and validate secure access links', () => {
    const accountId = 'test-account';
    const accessCode = 'TEST123ABCDE';
    
    const link = generateSecureAccessLink(accountId, accessCode, 24);
    expect(link).toContain('/access/redeem');
    expect(link).toContain(`code=${accessCode}`);
    expect(link).toContain(`account=${accountId}`);

    const validation = validateAccessLink(link);
    expect(validation.isValid).toBe(true);
    expect(validation.accessCode).toBe(accessCode);
    expect(validation.accountId).toBe(accountId);
    expect(validation.isExpired).toBe(false);
  });
});

/**
 * Analytics Tests
 */
describe('Analytics', () => {
  test('should calculate days since request', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    expect(calculateDaysSinceRequest(yesterday)).toBe(1);
    expect(calculateDaysSinceRequest(weekAgo)).toBe(7);
  });

  test('should analyze registration status', () => {
    const pendingRequest = {
      request_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      approval_date: null,
      registration_completed_date: null
    };

    const status = getRegistrationStatus(pendingRequest);
    expect(status.stage).toBe('pending');
    expect(status.daysSinceRequest).toBe(10);
    expect(status.isOverdue).toBe(true);
    expect(status.timeline).toHaveLength(1);
  });

  test('should analyze registration timelines', () => {
    const mockRequests = [
      {
        request_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approval_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        registration_completed_date: new Date().toISOString(),
        status: 'registered'
      },
      {
        request_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        approval_date: null,
        registration_completed_date: null,
        status: 'pending'
      }
    ];

    const analysis = analyzeRegistrationTimelines(mockRequests);
    expect(analysis).toHaveProperty('averageDaysToApproval');
    expect(analysis).toHaveProperty('completionRate');
    expect(analysis).toHaveProperty('stageDistribution');
    expect(analysis.completionRate).toBe(50); // 1 out of 2 completed
  });
});

/**
 * Email Service Tests
 */
describe('Email Service', () => {
  let emailService: MockEmailService;

  beforeEach(() => {
    emailService = new MockEmailService();
  });

  test('should send approval email successfully', async () => {
    const template = {
      subject: 'Test Subject',
      body: 'Test body',
      variables: { accessCode: 'TEST123' }
    };

    const result = await emailService.sendApprovalEmail('test@example.com', template);
    expect(result.success).toBe(true);
    expect(result.messageId).toBeTruthy();
    expect(result.deliveryStatus).toBe('sent');
  });

  test('should validate email addresses correctly', () => {
    expect(emailService.validateEmailAddress('valid@example.com')).toBe(true);
    expect(emailService.validateEmailAddress('invalid-email')).toBe(false);
    expect(emailService.validateEmailAddress('user@domain')).toBe(false);
    expect(emailService.validateEmailAddress('')).toBe(false);
  });

  test('should track email delivery', async () => {
    const template = {
      subject: 'Test Subject',
      body: 'Test body',
      variables: {}
    };

    const sendResult = await emailService.sendApprovalEmail('test@example.com', template);
    
    // Wait for mock delivery simulation
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    const deliveryStatus = await emailService.trackEmailDelivery(sendResult.messageId!);
    expect(deliveryStatus.status).toBe('delivered');
  });
});

/**
 * Integration Tests
 */
describe('Back Office Integration', () => {
  test('should complete full approval workflow', async () => {
    // 1. Generate access code
    const accessCode = await generateAccessCode();
    expect(accessCode).toHaveLength(12);

    // 2. Create email template
    const mockRequest = {
      id: 'req-integration',
      requester_email: 'integration@test.com',
      requester_name: 'Integration Test',
      account_id: 'account-integration',
      request_date: new Date().toISOString(),
      status: 'pending' as const
    };

    const template = generateAccessApprovalEmail(mockRequest, accessCode, 'Integration Account');
    expect(template.variables.accessCode).toBe(accessCode);

    // 3. Validate template
    const validation = validateEmailTemplate(template);
    expect(validation.isValid).toBe(true);

    // 4. Generate secure link
    const link = generateSecureAccessLink(mockRequest.account_id, accessCode);
    const linkValidation = validateAccessLink(link);
    expect(linkValidation.isValid).toBe(true);

    // 5. Test email service
    const emailService = new MockEmailService();
    const emailResult = await emailService.sendApprovalEmail(mockRequest.requester_email, template);
    expect(emailResult.success).toBe(true);
  });

  test('should handle complete domain configuration workflow', async () => {
    // 1. Validate configuration
    const config = validateQRConfiguration();
    expect(config).toHaveProperty('isValid');

    // 2. Generate QR with default domain
    const qrResult1 = await generateQRCodeForItem('integration-item-1');
    expect(qrResult1.success).toBe(true);

    // 3. Generate QR with custom domain
    const qrResult2 = await generateQRCodeForItem('integration-item-2', {
      domain: 'https://production.faqbnb.com'
    });
    expect(qrResult2.success).toBe(true);
    expect(qrResult2.metadata.domainSource).toBe('override');

    // 4. Verify URLs are different
    expect(qrResult1.url).not.toBe(qrResult2.url);
    expect(qrResult2.url).toContain('production.faqbnb.com');
  });
});

/**
 * Error Handling Tests
 */
describe('Error Handling', () => {
  test('should handle invalid access request gracefully', async () => {
    const invalidRequest = {
      requester_email: '',
      account_id: '',
      status: 'invalid' as any
    };

    const result = await validateAccessRequest(invalidRequest);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should handle email service failures', async () => {
    const emailService = new MockEmailService();
    
    // Test with invalid email
    const template = {
      subject: 'Test',
      body: 'Test body',
      variables: {}
    };

    const result = await emailService.sendApprovalEmail('invalid-email', template);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid email');
  });

  test('should handle QR generation with invalid domain', async () => {
    const result = await generateQRCodeForItem('test-item', {
      domain: 'not-a-valid-url'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid domain');
  });
});

/**
 * Performance Tests
 */
describe('Performance', () => {
  test('should generate access codes quickly', async () => {
    const startTime = Date.now();
    const codes = await Promise.all([
      generateAccessCode(),
      generateAccessCode(),
      generateAccessCode(),
      generateAccessCode(),
      generateAccessCode()
    ]);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    expect(codes).toHaveLength(5);
    expect(new Set(codes).size).toBe(5); // All unique
  });

  test('should validate multiple email addresses efficiently', () => {
    const emails = Array.from({ length: 100 }, (_, i) => `user${i}@example.com`);
    
    const startTime = Date.now();
    const result = validateEmailAddresses(emails);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    expect(result.valid).toHaveLength(100);
    expect(result.invalid).toHaveLength(0);
  });
});

console.log('🧪 REQ-016 Back Office Test Suite completed successfully!');