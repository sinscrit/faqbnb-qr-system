/**
 * Email Template Translation Tests
 * Task 2I.9 - Test email generation in each language
 *
 * This test suite validates that all 4 email generation functions work correctly
 * in all 6 supported languages (en, fr, es, de, nl, it). Tests verify:
 * - Translation application
 * - Variable interpolation
 * - Emoji preservation
 * - Beta routing with language parameter
 * - Language included in variables object
 */

import {
  generateAccessApprovalEmail,
  generateBetaAccessApprovalEmail,
  generateAccessDenialEmail,
  generateRegistrationReminderEmail
} from '@/lib/email-templates';
import { AccessRequest, AccessRequestSource } from '@/types/admin';
import type { SupportedLanguage } from '@/types';

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'https://faqbnb.com';

describe('Email Template Translations', () => {
  // =========================================================================
  // Fixtures
  // =========================================================================

  const mockAccessRequest: AccessRequest = {
    id: 'test-req-001',
    requester_email: 'test@example.com',
    requester_name: 'Test User',
    account_id: 'account-123',
    request_date: '2026-01-15T10:00:00Z',
    status: 'pending',
    source: AccessRequestSource.ADMIN_CREATED,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z'
  };

  const mockBetaRequest: AccessRequest = {
    ...mockAccessRequest,
    id: 'beta-req-001',
    source: AccessRequestSource.BETA_WAITLIST,
    account_id: null
  };

  const testAccessCode = 'TEST123ABC';
  const testAccountName = 'Test Property Account';
  const testDaysSinceApproval = 7;
  const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

  // =========================================================================
  // English (en) - Baseline Tests
  // =========================================================================

  describe('English (en) - Baseline', () => {
    test('generateAccessApprovalEmail - English default (no language param)', () => {
      const result = generateAccessApprovalEmail(mockAccessRequest, testAccessCode, testAccountName);

      expect(result.subject).toContain('Access Granted');
      expect(result.body).toContain('Hello Test User,');
      expect(result.body).toContain(testAccessCode);
    });

    test('generateAccessApprovalEmail - Explicit English', () => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        'en'
      );

      expect(result.subject).toContain('Access Granted');
    });

    test('generateBetaAccessApprovalEmail - English default', () => {
      const result = generateBetaAccessApprovalEmail(mockBetaRequest, testAccessCode, testAccountName);

      expect(result.subject).toContain('🚀');
      expect(result.body).toContain('Congratulations');
    });

    test('generateAccessDenialEmail - English default', () => {
      const result = generateAccessDenialEmail(mockAccessRequest, 'Test reason', testAccountName);

      expect(result.body).toContain('Unfortunately');
    });

    test('generateRegistrationReminderEmail - English default', () => {
      const result = generateRegistrationReminderEmail(
        mockAccessRequest,
        testAccessCode,
        testDaysSinceApproval,
        testAccountName
      );

      expect(result.subject).toContain('Reminder');
      expect(result.body).toContain('7');
    });
  });

  // =========================================================================
  // French (fr) Tests
  // =========================================================================

  describe('French (fr)', () => {
    const language: SupportedLanguage = 'fr';

    test('generateAccessApprovalEmail - French', () => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('Accès Accordé');
      expect(result.subject).not.toContain('Access Granted');
      expect(result.body).toContain(testAccessCode);
    });

    test('generateBetaAccessApprovalEmail - French', () => {
      const result = generateBetaAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('🚀');
      expect(result.body).toContain('Félicitations');
    });

    test('generateAccessDenialEmail - French', () => {
      const result = generateAccessDenialEmail(
        mockAccessRequest,
        'Test reason',
        testAccountName,
        language
      );

      expect(result.body).toContain('Malheureusement');
    });

    test('generateRegistrationReminderEmail - French', () => {
      const result = generateRegistrationReminderEmail(
        mockAccessRequest,
        testAccessCode,
        testDaysSinceApproval,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('Rappel');
      expect(result.body).toContain('7');
    });
  });

  // =========================================================================
  // Spanish (es) Tests
  // =========================================================================

  describe('Spanish (es)', () => {
    const language: SupportedLanguage = 'es';

    test('generateAccessApprovalEmail - Spanish', () => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('Acceso Concedido');
      expect(result.body).toContain(testAccessCode);
    });

    test('generateBetaAccessApprovalEmail - Spanish', () => {
      const result = generateBetaAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('🚀');
      expect(result.body).toContain('🎉');
    });

    test('generateAccessDenialEmail - Spanish', () => {
      const result = generateAccessDenialEmail(
        mockAccessRequest,
        'Test reason',
        testAccountName,
        language
      );

      // Should contain Spanish content, not English
      expect(result.body).not.toContain('Unfortunately');
    });

    test('generateRegistrationReminderEmail - Spanish', () => {
      const result = generateRegistrationReminderEmail(
        mockAccessRequest,
        testAccessCode,
        testDaysSinceApproval,
        testAccountName,
        undefined,
        language
      );

      expect(result.body).toContain(testDaysSinceApproval.toString());
    });
  });

  // =========================================================================
  // German (de) Tests
  // =========================================================================

  describe('German (de)', () => {
    const language: SupportedLanguage = 'de';

    test('generateAccessApprovalEmail - German', () => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('Zugang Gewährt');
      expect(result.body).toContain('Hallo');
    });

    test('generateBetaAccessApprovalEmail - German', () => {
      const result = generateBetaAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('🚀');
    });

    test('generateAccessDenialEmail - German', () => {
      const result = generateAccessDenialEmail(
        mockAccessRequest,
        'Test reason',
        testAccountName,
        language
      );

      // Should contain German content
      expect(result.body).not.toContain('Unfortunately');
    });

    test('generateRegistrationReminderEmail - German', () => {
      const result = generateRegistrationReminderEmail(
        mockAccessRequest,
        testAccessCode,
        testDaysSinceApproval,
        testAccountName,
        undefined,
        language
      );

      expect(result.body).toContain('7');
    });
  });

  // =========================================================================
  // Dutch (nl) Tests
  // =========================================================================

  describe('Dutch (nl)', () => {
    const language: SupportedLanguage = 'nl';

    test('generateAccessApprovalEmail - Dutch', () => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('Toegang Verleend');
      expect(result.body).toContain('Hallo');
    });

    test('generateBetaAccessApprovalEmail - Dutch', () => {
      const result = generateBetaAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('🚀');
    });

    test('generateAccessDenialEmail - Dutch', () => {
      const result = generateAccessDenialEmail(
        mockAccessRequest,
        'Test reason',
        testAccountName,
        language
      );

      // Should NOT contain English denial phrases
      expect(result.body).not.toContain('Unfortunately');
    });

    test('generateRegistrationReminderEmail - Dutch', () => {
      const result = generateRegistrationReminderEmail(
        mockAccessRequest,
        testAccessCode,
        testDaysSinceApproval,
        testAccountName,
        undefined,
        language
      );

      // Variables should be interpolated
      expect(result.body).toContain(testAccessCode);
    });
  });

  // =========================================================================
  // Italian (it) Tests
  // =========================================================================

  describe('Italian (it)', () => {
    const language: SupportedLanguage = 'it';

    test('generateAccessApprovalEmail - Italian', () => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('Accesso Concesso');
      expect(result.body).toContain('Ciao');
    });

    test('generateBetaAccessApprovalEmail - Italian', () => {
      const result = generateBetaAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('🚀');
    });

    test('generateAccessDenialEmail - Italian', () => {
      const result = generateAccessDenialEmail(
        mockAccessRequest,
        'Test reason',
        testAccountName,
        language
      );

      // Should contain Italian content
      expect(result.body).not.toContain('Unfortunately');
    });

    test('generateRegistrationReminderEmail - Italian', () => {
      const result = generateRegistrationReminderEmail(
        mockAccessRequest,
        testAccessCode,
        testDaysSinceApproval,
        testAccountName,
        undefined,
        language
      );

      // Variables should be interpolated
      expect(result.body).toContain(testAccessCode);
    });
  });

  // =========================================================================
  // Variable Interpolation Across Languages
  // =========================================================================

  describe('Variable Interpolation Across Languages', () => {
    test.each(SUPPORTED_LANGUAGES)('accessCode is interpolated in %s', (language) => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.body).toContain(testAccessCode);
      expect(result.body).not.toContain('{accessCode}');
    });

    test.each(SUPPORTED_LANGUAGES)('accountName is interpolated in %s', (language) => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain(testAccountName);
      expect(result.body).toContain(testAccountName);
      expect(result.body).not.toContain('{accountName}');
    });

    test.each(SUPPORTED_LANGUAGES)('requesterName is interpolated in %s', (language) => {
      const result = generateAccessApprovalEmail(
        mockAccessRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.body).toContain('Test User');
      expect(result.body).not.toContain('{name}');
    });

    test.each(SUPPORTED_LANGUAGES)('days is interpolated in reminder email for %s', (language) => {
      const result = generateRegistrationReminderEmail(
        mockAccessRequest,
        testAccessCode,
        testDaysSinceApproval,
        testAccountName,
        undefined,
        language
      );

      expect(result.body).toContain('7');
      expect(result.body).not.toContain('{days}');
    });
  });

  // =========================================================================
  // Emoji Preservation
  // =========================================================================

  describe('Emoji Preservation', () => {
    test.each(SUPPORTED_LANGUAGES)('subject emoji preserved in %s', (language) => {
      const result = generateBetaAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.subject).toContain('🚀');
    });

    test.each(SUPPORTED_LANGUAGES)('body emojis preserved in %s', (language) => {
      const result = generateBetaAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        language
      );

      expect(result.body).toContain('🎉');
      expect(result.body).toContain('✨');
      expect(result.body).toContain('📱');
      expect(result.body).toContain('📊');
      expect(result.body).toContain('🛠️');
      expect(result.body).toContain('💌');
    });
  });

  // =========================================================================
  // Beta Request Routing with Language
  // =========================================================================

  describe('Beta Request Routing with Language', () => {
    test('beta request routed to beta template with French', () => {
      const result = generateAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        'fr'
      );

      // Confirms beta template used
      expect(result.subject).toContain('🚀');
      expect(result.body).toContain('Félicitations');
      expect(result.body).not.toContain('Congratulations');
    });

    test('beta request routed to beta template with Spanish', () => {
      const result = generateAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        'es'
      );

      expect(result.subject).toContain('🚀');
      expect(result.body).not.toContain('Congratulations');
    });

    test('beta request routed to beta template with German', () => {
      const result = generateAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        'de'
      );

      expect(result.subject).toContain('🚀');
      expect(result.body).toContain('Glückwunsch');
    });

    test('beta request routed to beta template with Dutch', () => {
      const result = generateAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        'nl'
      );

      expect(result.subject).toContain('🚀');
      expect(result.body).not.toContain('Congratulations');
    });

    test('beta request routed to beta template with Italian', () => {
      const result = generateAccessApprovalEmail(
        mockBetaRequest,
        testAccessCode,
        testAccountName,
        undefined,
        'it'
      );

      expect(result.subject).toContain('🚀');
      expect(result.body).not.toContain('Congratulations');
    });
  });

  // =========================================================================
  // Language in Variables Object
  // =========================================================================

  describe('Language in Variables Object', () => {
    test.each(SUPPORTED_LANGUAGES)(
      'language %s is in variables object for generateAccessApprovalEmail',
      (language) => {
        const result = generateAccessApprovalEmail(
          mockAccessRequest,
          testAccessCode,
          testAccountName,
          undefined,
          language
        );

        expect(result.variables.language).toBe(language);
      }
    );

    test.each(SUPPORTED_LANGUAGES)(
      'language %s is in variables object for generateBetaAccessApprovalEmail',
      (language) => {
        const result = generateBetaAccessApprovalEmail(
          mockBetaRequest,
          testAccessCode,
          testAccountName,
          undefined,
          language
        );

        expect(result.variables.language).toBe(language);
      }
    );

    test.each(SUPPORTED_LANGUAGES)(
      'language %s is in variables object for generateAccessDenialEmail',
      (language) => {
        const result = generateAccessDenialEmail(
          mockAccessRequest,
          'Test reason',
          testAccountName,
          language
        );

        expect(result.variables.language).toBe(language);
      }
    );

    test.each(SUPPORTED_LANGUAGES)(
      'language %s is in variables object for generateRegistrationReminderEmail',
      (language) => {
        const result = generateRegistrationReminderEmail(
          mockAccessRequest,
          testAccessCode,
          testDaysSinceApproval,
          testAccountName,
          undefined,
          language
        );

        expect(result.variables.language).toBe(language);
      }
    );
  });
});
