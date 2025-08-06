import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';

/**
 * Email Template Utilities for REQ-016: System Admin Back Office
 */

/**
 * Generate access approval email template
 */
export function generateAccessApprovalEmail(
  request: AccessRequest, 
  accessCode: string,
  accountName?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const isBetaRequest = request.source === AccessRequestSource.BETA_WAITLIST;
  
  // Handle beta requests differently
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName);
  }
  
  const accountDisplayName = accountName || 'Account';
  
  return {
    subject: `Access Granted: ${accountDisplayName} - Your Access Code`,
    body: `Hello ${requesterName},

Great news! Your access request for "${accountDisplayName}" has been approved.

Your Access Details:
• Account: ${accountDisplayName}
• Access Code: ${accessCode}
• Requested on: ${new Date(request.request_date).toLocaleDateString()}

To complete your access setup:
1. Visit the FAQBNB registration page: ${createRegistrationLink()}
2. Create your account or log in if you already have one
3. Navigate to Account Access and enter your access code: ${accessCode}
4. Start exploring the items and resources

Your access code: ${accessCode}

Important Notes:
- Keep your access code secure and don't share it with others
- Your access code will remain valid until you complete registration
- If you have any questions, please contact the account owner

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.
If you need assistance, please contact support through the FAQBNB platform.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: new Date(request.request_date).toLocaleDateString(),
      registrationLink: createRegistrationLink()
    }
  };
}

/**
 * Generate beta access approval email template
 * For users who signed up through the beta waitlist
 */
export function generateBetaAccessApprovalEmail(
  request: AccessRequest, 
  accessCode: string,
  accountName?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'the FAQBNB platform';
  
  return {
    subject: `🚀 Welcome to FAQBNB Beta - Access Granted!`,
    body: `Hello ${requesterName},

🎉 Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!

Your Beta Access Details:
• Platform: ${accountDisplayName}
• Access Code: ${accessCode}
• Beta Access Granted: ${new Date().toLocaleDateString()}
• Original Request: ${new Date(request.request_date).toLocaleDateString()}

Getting Started with Your Beta Access:
1. Visit the FAQBNB platform: ${createRegistrationLink()}
2. Create your account using the email address: ${request.requester_email}
3. Enter your beta access code: ${accessCode}
4. Start exploring the platform features and capabilities

Your beta access code: ${accessCode}

What to Expect:
✨ Early access to all FAQBNB features
📱 QR code generation and management tools
📊 Analytics and insights dashboard
🛠️ Priority support during the beta period
💌 Direct feedback channel to influence product development

Important Beta Program Notes:
- Your access code provides full platform access during the beta period
- As a beta user, your feedback is invaluable to us
- Some features may be evolving - please share your experience!
- Keep your access code secure and don't share it with others
- Beta users will receive priority updates on new features

We're excited to have you as part of our exclusive beta community!

Best regards,
The FAQBNB Beta Team

---
🚀 You're part of something special! Thank you for joining our beta program.
For beta support or feedback, please contact us through the platform or reply to this email.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: new Date(request.request_date).toLocaleDateString(),
      approvalDate: new Date().toLocaleDateString(),
      registrationLink: createRegistrationLink(),
      userEmail: request.requester_email
    }
  };
}

/**
 * Create access link with embedded code
 */
export function createAccessLink(accountId: string, accessCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/account-access?code=${encodeURIComponent(accessCode)}&account=${encodeURIComponent(accountId)}`;
}

/**
 * Create registration link
 */
export function createRegistrationLink(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/register`;
}

/**
 * Validate email template structure
 */
export function validateEmailTemplate(template: EmailTemplate): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.subject || template.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!template.body || template.body.trim().length === 0) {
    errors.push('Body is required');
  }

  if (template.subject && template.subject.length > 200) {
    errors.push('Subject must be less than 200 characters');
  }

  if (template.body && template.body.length > 10000) {
    errors.push('Body must be less than 10,000 characters');
  }

  // Check for required variables in access approval emails
  if (template.body && template.body.includes('access code')) {
    if (!template.variables.accessCode) {
      errors.push('Access code variable is required for access approval emails');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Render email as HTML (basic HTML formatting)
 */
export function renderEmailHTML(template: EmailTemplate): string {
  // Convert basic text to HTML
  let htmlBody = template.body
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');

  // Replace variables in the HTML
  Object.entries(template.variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    htmlBody = htmlBody.replace(new RegExp(placeholder, 'g'), value);
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .access-code {
          background-color: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          border: 2px solid #2196f3;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          background-color: #2196f3;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FAQBNB Access Notification</h1>
      </div>
      ${htmlBody}
      <div class="footer">
        <p>This is an automated message from FAQBNB. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate access denial email template
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';
  
  return {
    subject: `Access Request Update: ${accountDisplayName}`,
    body: `Hello ${requesterName},

Thank you for your interest in accessing "${accountDisplayName}".

Unfortunately, we're unable to approve your access request at this time.

${reason ? `Reason: ${reason}` : ''}

Request Details:
• Account: ${accountDisplayName}
• Requested on: ${new Date(request.request_date).toLocaleDateString()}

If you believe this is an error or have questions about this decision, please contact the account owner directly.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: new Date(request.request_date).toLocaleDateString()
    }
  };
}

/**
 * Generate reminder email for pending registration
 */
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';
  
  return {
    subject: `Reminder: Complete Your ${accountDisplayName} Access Setup`,
    body: `Hello ${requesterName},

This is a friendly reminder that your access to "${accountDisplayName}" was approved ${daysSinceApproval} days ago, but you haven't completed your registration yet.

Your Access Code: ${accessCode}

To complete your access setup:
1. Visit: ${createRegistrationLink()}
2. Create your account or log in
3. Enter your access code: ${accessCode}

Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.

If you no longer need access or have any questions, please let us know.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      daysSinceApproval: daysSinceApproval.toString(),
      registrationLink: createRegistrationLink()
    }
  };
}

/**
 * Sanitize email content to prevent XSS
 */
export function sanitizeEmailContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Extract access code from email body
 */
export function extractAccessCodeFromEmail(emailBody: string): string | null {
  const codeMatch = emailBody.match(/Access Code:\s*([A-Z0-9]+)/i);
  return codeMatch ? codeMatch[1] : null;
}

/**
 * Generate secure access link with expiration
 */
export function generateSecureAccessLink(
  accountId: string, 
  accessCode: string, 
  expirationHours: number = 168 // 7 days default
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const expirationTime = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
  
  // Create access link with embedded parameters
  const params = new URLSearchParams({
    code: accessCode,
    account: accountId,
    expires: expirationTime.toISOString()
  });
  
  return `${baseUrl}/access/redeem?${params.toString()}`;
}

/**
 * Link validation interface
 */
export interface LinkValidation {
  isValid: boolean;
  isExpired: boolean;
  error?: string;
  accessCode?: string;
  accountId?: string;
  expirationDate?: Date;
}

/**
 * Validate access link structure and expiration
 */
export function validateAccessLink(link: string): LinkValidation {
  try {
    const url = new URL(link);
    
    // Check if it's the correct path
    if (!url.pathname.includes('/access/redeem')) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Invalid access link format'
      };
    }
    
    const accessCode = url.searchParams.get('code');
    const accountId = url.searchParams.get('account');
    const expiresParam = url.searchParams.get('expires');
    
    if (!accessCode || !accountId) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Missing required parameters'
      };
    }
    
    // Validate access code format
    if (!/^[A-Z0-9]{12}$/.test(accessCode)) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Invalid access code format'
      };
    }
    
    // Check expiration if provided
    let isExpired = false;
    let expirationDate: Date | undefined;
    
    if (expiresParam) {
      expirationDate = new Date(expiresParam);
      isExpired = expirationDate < new Date();
    }
    
    return {
      isValid: true,
      isExpired,
      accessCode,
      accountId,
      expirationDate
    };
    
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Invalid URL format'
    };
  }
}

/**
 * Generate secure registration link
 */
export function generateSecureRegistrationLink(accessCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/register?access_code=${encodeURIComponent(accessCode)}`;
}

/**
 * Generate account access redemption link
 */
export function generateAccountAccessLink(accountId: string, accessCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    account_id: accountId,
    access_code: accessCode
  });
  
  return `${baseUrl}/account/join?${params.toString()}`;
}