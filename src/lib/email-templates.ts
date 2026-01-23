import { AccessRequest, EmailTemplate, AccessRequestSource } from '@/types/admin';
import { getServerBaseUrl } from './config';
import { getEmailTranslation } from '@/lib/email-translations';
import { SupportedLanguage } from '@/types';

const formatRequestDate = (dateString: string | null) =>
  dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

/**
 * Email Template Utilities for REQ-016: System Admin Back Office
 * Last Modified: 2026-01-15 - Updated to use getServerBaseUrl for proper domain handling
 */

/**
 * Generate access approval email template
 * Uses translations from emails.accessApproval namespace
 * Supports all 6 languages: en, fr, es, de, nl, it
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name (defaults to 'Account')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Language for email content (defaults to 'en')
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 */
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const isBetaRequest = request.source === AccessRequestSource.BETA_WAITLIST;

  // Handle beta requests differently
  if (isBetaRequest) {
    return generateBetaAccessApprovalEmail(request, accessCode, accountName, baseUrl, language);
  }

  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  // Helper to translate email content with accessApproval namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`accessApproval.${key}`, language, vars);

  // Helper to translate common email content
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    subject: t('subject', { accountName: accountDisplayName }),
    body: `${t('greeting', { name: requesterName })}

${t('intro', { accountName: accountDisplayName })}

${t('accessDetails')}
• ${t('account', { accountName: accountDisplayName })}
• ${t('accessCode', { accessCode })}
• ${t('requestedOn', { date: formatRequestDate(request.request_date) })}

${t('instructions')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}
3. ${t('step3')}

${t('accessCodeLabel', { accessCode })}
${t('directLinkLabel', { link: directRegistrationLink })}

${t('notes')}
- ${t('note1')}
- ${t('note2')}
- ${t('note3')}

${tc('regards')}
${tc('team')}

---
${tc('footer')}
${tc('footerSupport')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: formatRequestDate(request.request_date),
      registrationLink,
      directRegistrationLink,
      language
    }
  };
}

/**
 * Generate beta access approval email template
 * For users who signed up through the beta waitlist
 * Uses translations from emails.betaAccess namespace
 * Supports all 6 languages: en, fr, es, de, nl, it
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param accountName - Optional account name (defaults to 'the FAQBNB platform')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Language for email content (defaults to 'en')
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.3 - Pattern established for email translation
 */
export function generateBetaAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'the FAQBNB platform';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  // Helper to translate email content with betaAccess namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`betaAccess.${key}`, language, vars);

  // Helper to translate common email content (only for regards)
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    subject: t('subject'),
    body: `${t('greeting', { name: requesterName })}

${t('congratulations')}

${t('accessDetails')}
• ${t('platform', { accountName: accountDisplayName })}
• ${t('accessCode', { accessCode })}
• ${t('betaAccessGranted', { approvalDate: new Date().toLocaleDateString() })}
• ${t('originalRequest', { requestDate: formatRequestDate(request.request_date) })}

${t('gettingStarted')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}
3. ${t('step3')}

${t('accessCodeLabel', { accessCode })}
${t('directLinkLabel', { link: directRegistrationLink })}

${t('whatToExpect')}
${t('feature1')}
${t('feature2')}
${t('feature3')}
${t('feature4')}
${t('feature5')}

${t('betaNotes')}
- ${t('note1')}
- ${t('note2')}
- ${t('note3')}
- ${t('note4')}
- ${t('note5')}

${t('excited')}

${tc('regards')}
${t('team')}

---
${t('footer')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      requestDate: formatRequestDate(request.request_date),
      approvalDate: new Date().toLocaleDateString(),
      registrationLink,
      directRegistrationLink,
      userEmail: request.requester_email,
      language
    }
  };
}

/**
 * Create access link with embedded code
 * @param accountId - Account ID to include in the link
 * @param accessCode - Access code to include in the link
 * @param baseUrl - Optional base URL (defaults to getServerBaseUrl())
 */
export function createAccessLink(accountId: string, accessCode: string, baseUrl?: string): string {
  const url = baseUrl || getServerBaseUrl();
  return `${url}/account-access?code=${encodeURIComponent(accessCode)}&account=${encodeURIComponent(accountId)}`;
}

/**
 * Create registration link
 * @param baseUrl - Optional base URL (defaults to getServerBaseUrl())
 */
export function createRegistrationLink(baseUrl?: string): string {
  const url = baseUrl || getServerBaseUrl();
  return `${url}/register`;
}

/**
 * Create registration link with access code and email
 * @param accessCode - Access code to pre-fill
 * @param email - Email to pre-fill
 * @param baseUrl - Optional base URL (defaults to getServerBaseUrl())
 */
export function createRegistrationLinkWithCode(accessCode: string, email: string, baseUrl?: string): string {
  const url = baseUrl || getServerBaseUrl();
  const params = new URLSearchParams({
    code: accessCode,
    email: email
  });
  return `${url}/register?${params.toString()}`;
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
 * Uses translations from emails.accessDenial namespace
 * Supports all 6 languages: en, fr, es, de, nl, it
 *
 * @param request - Access request data
 * @param reason - Optional denial reason to include in email
 * @param accountName - Optional account name (defaults to 'Account')
 * @param language - Language for email content (defaults to 'en')
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 * @see Task 2I.3 - Pattern established for email translation
 */
export function generateAccessDenialEmail(
  request: AccessRequest,
  reason?: string,
  accountName?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';

  // Helper to translate email content with accessDenial namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`accessDenial.${key}`, language, vars);

  // Helper to translate common email content
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    subject: t('subject', { accountName: accountDisplayName }),
    body: `${t('greeting', { name: requesterName })}

${t('intro', { accountName: accountDisplayName })}

${t('message')}

${reason ? t('reason', { reason }) : ''}

${t('requestDetails')}
• ${t('account', { accountName: accountDisplayName })}
• ${t('requestedOn', { date: formatRequestDate(request.request_date) })}

${t('contact')}

${tc('regards')}
${tc('team')}

---
${tc('footer')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      reason: reason || '',
      requestDate: formatRequestDate(request.request_date),
      language
    }
  };
}

/**
 * Generate reminder email for pending registration
 * Uses translations from emails.registrationReminder namespace
 * Supports all 6 languages: en, fr, es, de, nl, it
 *
 * @param request - Access request data
 * @param accessCode - Generated access code
 * @param daysSinceApproval - Number of days since approval
 * @param accountName - Optional account name (defaults to 'Account')
 * @param baseUrl - Optional base URL for links (defaults to getServerBaseUrl())
 * @param language - Language for email content (defaults to 'en')
 * @returns Email template with subject and body using translations
 *
 * @see Task 2I.1 - Translation namespace structure
 * @see Task 2I.2 - getEmailTranslation utility
 */
export function generateRegistrationReminderEmail(
  request: AccessRequest,
  accessCode: string,
  daysSinceApproval: number,
  accountName?: string,
  baseUrl?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
  const requesterName = request.requester_name || 'there';
  const accountDisplayName = accountName || 'Account';
  const registrationLink = createRegistrationLink(baseUrl);
  const directRegistrationLink = createRegistrationLinkWithCode(accessCode, request.requester_email, baseUrl);

  // Helper to translate email content with registrationReminder namespace
  const t = (key: string, vars?: Record<string, string | number>) =>
    getEmailTranslation(`registrationReminder.${key}`, language, vars);

  // Helper to translate common email content
  const tc = (key: string) =>
    getEmailTranslation(`common.${key}`, language);

  return {
    subject: t('subject', { accountName: accountDisplayName }),
    body: `${t('greeting', { name: requesterName })}

${t('message', { accountName: accountDisplayName, days: daysSinceApproval })}

${t('accessCodeLabel', { accessCode })}

${t('instructions')}
1. ${t('step1', { link: directRegistrationLink })}
   ${t('step1Note')}
2. ${t('step2')}

${t('alternative', { registrationLink, accessCode })}

${t('closing')}

${t('questions')}

${tc('regards')}
${tc('team')}

---
${tc('footer')}`,
    variables: {
      requesterName,
      accountName: accountDisplayName,
      accessCode,
      daysSinceApproval: daysSinceApproval.toString(),
      registrationLink,
      directRegistrationLink,
      language
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
 * @param accountId - Account ID to include in the link
 * @param accessCode - Access code to include in the link
 * @param expirationHours - Link expiration in hours (default 168 / 7 days)
 * @param baseUrl - Optional base URL (defaults to getServerBaseUrl())
 */
export function generateSecureAccessLink(
  accountId: string,
  accessCode: string,
  expirationHours: number = 168, // 7 days default
  baseUrl?: string
): string {
  const url = baseUrl || getServerBaseUrl();
  const expirationTime = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

  // Create access link with embedded parameters
  const params = new URLSearchParams({
    code: accessCode,
    account: accountId,
    expires: expirationTime.toISOString()
  });

  return `${url}/access/redeem?${params.toString()}`;
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
 * @param accessCode - Access code to include in the link
 * @param baseUrl - Optional base URL (defaults to getServerBaseUrl())
 */
export function generateSecureRegistrationLink(accessCode: string, baseUrl?: string): string {
  const url = baseUrl || getServerBaseUrl();
  return `${url}/register?access_code=${encodeURIComponent(accessCode)}`;
}

/**
 * Generate account access redemption link
 * @param accountId - Account ID to include in the link
 * @param accessCode - Access code to include in the link
 * @param baseUrl - Optional base URL (defaults to getServerBaseUrl())
 */
export function generateAccountAccessLink(accountId: string, accessCode: string, baseUrl?: string): string {
  const url = baseUrl || getServerBaseUrl();
  const params = new URLSearchParams({
    account_id: accountId,
    access_code: accessCode
  });

  return `${url}/account/join?${params.toString()}`;
}
