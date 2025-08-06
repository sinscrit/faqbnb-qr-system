import { EmailTemplate } from '@/types/admin';

/**
 * Email Service Integration
 * Part of REQ-016: System Admin Back Office
 */

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus: 'sent' | 'failed' | 'pending';
  timestamp: string;
}

export interface DeliveryStatus {
  status: 'delivered' | 'bounced' | 'complaint' | 'delivery_unknown';
  timestamp: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface EmailService {
  sendApprovalEmail(to: string, template: EmailTemplate): Promise<EmailResult>;
  validateEmailAddress(email: string): boolean;
  trackEmailDelivery(emailId: string): Promise<DeliveryStatus>;
  sendBulkEmails(recipients: Array<{ email: string; template: EmailTemplate }>): Promise<EmailResult[]>;
}

/**
 * Mock Email Service for development and testing
 */
export class MockEmailService implements EmailService {
  private sentEmails: Map<string, EmailResult> = new Map();
  private deliveryStatuses: Map<string, DeliveryStatus> = new Map();

  async sendApprovalEmail(to: string, template: EmailTemplate): Promise<EmailResult> {
    console.log('📧 MOCK_EMAIL_DEBUG: Sending approval email', {
      to,
      subject: template.subject,
      timestamp: new Date().toISOString()
    });

    // Simulate email validation
    if (!this.validateEmailAddress(to)) {
      return {
        success: false,
        error: 'Invalid email address',
        deliveryStatus: 'failed',
        timestamp: new Date().toISOString()
      };
    }

    // Generate mock message ID
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate potential failure (5% chance)
    const shouldFail = Math.random() < 0.05;
    
    if (shouldFail) {
      const result: EmailResult = {
        success: false,
        messageId,
        error: 'Simulated email service failure',
        deliveryStatus: 'failed',
        timestamp: new Date().toISOString()
      };
      
      this.sentEmails.set(messageId, result);
      return result;
    }

    // Simulate successful send
    const result: EmailResult = {
      success: true,
      messageId,
      deliveryStatus: 'sent',
      timestamp: new Date().toISOString()
    };

    this.sentEmails.set(messageId, result);

    // Simulate delivery status (delayed)
    setTimeout(() => {
      this.deliveryStatuses.set(messageId, {
        status: 'delivered',
        timestamp: new Date().toISOString(),
        metadata: {
          provider: 'mock-service',
          region: 'us-east-1'
        }
      });
    }, 2000);

    // Log email content for development
    console.log('📧 MOCK_EMAIL_CONTENT:', {
      to,
      subject: template.subject,
      bodyPreview: template.body.substring(0, 100) + '...',
      variables: template.variables
    });

    return result;
  }

  validateEmailAddress(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Basic format validation
    if (!emailRegex.test(email)) {
      return false;
    }

    // Length validation
    if (email.length > 320) { // RFC 5321 limit
      return false;
    }

    // Common invalid patterns
    const invalidPatterns = [
      /^\./, // Starts with dot
      /\.$/, // Ends with dot
      /\.\./, // Consecutive dots
      /@\./,  // @ followed by dot
      /\.@/   // Dot followed by @
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(email)) {
        return false;
      }
    }

    return true;
  }

  async trackEmailDelivery(emailId: string): Promise<DeliveryStatus> {
    const status = this.deliveryStatuses.get(emailId);
    
    if (status) {
      return status;
    }

    // Default unknown status
    return {
      status: 'delivery_unknown',
      timestamp: new Date().toISOString(),
      reason: 'Email ID not found or delivery status not available'
    };
  }

  async sendBulkEmails(recipients: Array<{ email: string; template: EmailTemplate }>): Promise<EmailResult[]> {
    console.log('📧 MOCK_EMAIL_DEBUG: Sending bulk emails to', recipients.length, 'recipients');

    const results: EmailResult[] = [];

    for (const recipient of recipients) {
      const result = await this.sendApprovalEmail(recipient.email, recipient.template);
      results.push(result);
      
      // Small delay to simulate rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  // Development utilities
  getSentEmails(): Array<{ messageId: string; result: EmailResult }> {
    return Array.from(this.sentEmails.entries()).map(([messageId, result]) => ({
      messageId,
      result
    }));
  }

  clearHistory(): void {
    this.sentEmails.clear();
    this.deliveryStatuses.clear();
  }

  getDeliveryStatuses(): Array<{ messageId: string; status: DeliveryStatus }> {
    return Array.from(this.deliveryStatuses.entries()).map(([messageId, status]) => ({
      messageId,
      status
    }));
  }
}

/**
 * Production Email Service Interface (for future implementation)
 * This would integrate with services like SendGrid, AWS SES, etc.
 */
export class ProductionEmailService implements EmailService {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  async sendApprovalEmail(to: string, template: EmailTemplate): Promise<EmailResult> {
    // TODO: Implement actual email service integration
    // This would make HTTP requests to the email service API
    throw new Error('Production email service not implemented yet');
  }

  validateEmailAddress(email: string): boolean {
    // Reuse the same validation logic as MockEmailService
    const mockService = new MockEmailService();
    return mockService.validateEmailAddress(email);
  }

  async trackEmailDelivery(emailId: string): Promise<DeliveryStatus> {
    // TODO: Implement actual delivery tracking
    throw new Error('Production email delivery tracking not implemented yet');
  }

  async sendBulkEmails(recipients: Array<{ email: string; template: EmailTemplate }>): Promise<EmailResult[]> {
    // TODO: Implement bulk email sending
    throw new Error('Production bulk email sending not implemented yet');
  }
}

/**
 * Email Service Factory
 */
export function createEmailService(): EmailService {
  // In development, always use mock service
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_SERVICE_API_KEY) {
    return new MockEmailService();
  }

  // In production, use configured service
  return new ProductionEmailService(
    process.env.EMAIL_SERVICE_API_KEY!,
    process.env.EMAIL_SERVICE_ENDPOINT || 'https://api.emailservice.com'
  );
}

/**
 * Global email service instance
 */
export const emailService = createEmailService();

/**
 * Email sending helper with logging and error handling
 */
export async function sendAccessApprovalEmail(
  to: string,
  template: EmailTemplate,
  metadata?: Record<string, any>
): Promise<EmailResult> {
  console.log('📧 EMAIL_SERVICE_DEBUG: Sending access approval email', {
    to,
    subject: template.subject,
    metadata,
    timestamp: new Date().toISOString()
  });

  try {
    const result = await emailService.sendApprovalEmail(to, template);
    
    console.log('📧 EMAIL_SERVICE_DEBUG: Email send result', {
      success: result.success,
      messageId: result.messageId,
      deliveryStatus: result.deliveryStatus,
      error: result.error
    });

    return result;
  } catch (error) {
    console.error('📧 EMAIL_SERVICE_ERROR: Failed to send email', {
      to,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      deliveryStatus: 'failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Validate multiple email addresses
 */
export function validateEmailAddresses(emails: string[]): {
  valid: string[];
  invalid: Array<{ email: string; reason: string }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ email: string; reason: string }> = [];

  for (const email of emails) {
    if (emailService.validateEmailAddress(email)) {
      valid.push(email);
    } else {
      invalid.push({
        email,
        reason: 'Invalid email format'
      });
    }
  }

  return { valid, invalid };
}

/**
 * Email template validation for sending
 */
export function validateEmailTemplateForSending(template: EmailTemplate): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.subject || template.subject.trim().length === 0) {
    errors.push('Email subject is required');
  }

  if (!template.body || template.body.trim().length === 0) {
    errors.push('Email body is required');
  }

  if (template.subject && template.subject.length > 250) {
    errors.push('Email subject is too long (max 250 characters)');
  }

  if (template.body && template.body.length > 50000) {
    errors.push('Email body is too long (max 50,000 characters)');
  }

  // Check for required variables in access approval emails
  if (template.body && template.body.includes('access')) {
    const requiredVars = ['accessCode', 'accountName'];
    for (const varName of requiredVars) {
      if (!template.variables[varName]) {
        errors.push(`Missing required variable: ${varName}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}