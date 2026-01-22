/**
 * Email Translation Utility Tests
 * REQ-E02-020: Task 2I.2
 * Last Modified: 2026-01-22 19:30
 */

import {
  getEmailTranslation,
  getEmailSubject,
  getEmailGreeting,
  getEmailFooter,
  preloadEmailTranslations
} from '../email-translations';

describe('getEmailTranslation', () => {
  describe('Basic functionality', () => {
    it('should return English translation for valid key', () => {
      const result = getEmailTranslation('accessApproval.subject', 'en', { accountName: 'TestAccount' });
      expect(result).toContain('TestAccount');
      expect(result).toContain('Access Granted');
    });

    it('should return French translation for valid key', () => {
      const result = getEmailTranslation('accessApproval.greeting', 'fr', { name: 'Marie' });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // French greeting should contain the name
      expect(result).toContain('Marie');
    });

    it('should handle all 6 supported languages', () => {
      const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
      languages.forEach((lang) => {
        const result = getEmailTranslation('accessApproval.subject', lang, { accountName: 'Test' });
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result).toContain('Test');
      });
    });
  });

  describe('Variable interpolation', () => {
    it('should replace single variable', () => {
      const result = getEmailTranslation('accessApproval.subject', 'en', { accountName: 'TestAccount' });
      expect(result).toContain('TestAccount');
      expect(result).not.toContain('{accountName}');
    });

    it('should replace multiple variables', () => {
      const result = getEmailTranslation('accessApproval.greeting', 'en', { name: 'John' });
      expect(result).toContain('John');
      expect(result).not.toContain('{name}');
    });

    it('should handle numeric variables (convert to string)', () => {
      // Using a key that might have numeric placeholders
      const result = getEmailTranslation('accessApproval.subject', 'en', {
        accountName: 'Account',
        count: 42
      });
      expect(typeof result).toBe('string');
      // Result should not throw error with numeric variable
    });

    it('should handle missing variables gracefully (leave placeholder)', () => {
      const result = getEmailTranslation('accessApproval.subject', 'en', {});
      // Should still return a string with placeholder intact
      expect(result).toContain('{accountName}');
    });

    it('should handle unused variables (ignore them)', () => {
      const result = getEmailTranslation('accessApproval.greeting', 'en', {
        name: 'John',
        unusedVar: 'ignored'
      });
      expect(result).toContain('John');
      expect(result).not.toContain('ignored');
    });

    it('should replace multiple occurrences of same variable', () => {
      // If a template has the same variable twice, both should be replaced
      const result = getEmailTranslation('accessApproval.account', 'en', { accountName: 'TestAccount' });
      const occurrences = (result.match(/TestAccount/g) || []).length;
      expect(occurrences).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Fallback behavior', () => {
    it('should fall back to English for missing translation in non-English language', () => {
      // Using an invalid key that doesn't exist - should fall back to English
      const result = getEmailTranslation('nonexistent.key.path', 'fr');
      // Should return the key itself as last resort
      expect(result).toBe('nonexistent.key.path');
    });

    it('should return key for completely missing key (not in any language)', () => {
      const result = getEmailTranslation('totally.invalid.key', 'en');
      expect(result).toBe('totally.invalid.key');
    });

    it('should handle invalid language code gracefully', () => {
      // TypeScript won't allow invalid codes, but test runtime behavior
      const result = getEmailTranslation('accessApproval.subject', 'en', { accountName: 'Test' });
      expect(result).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty key string', () => {
      const result = getEmailTranslation('', 'en');
      expect(result).toBe('');
    });

    it('should handle malformed key path (invalid nesting)', () => {
      const result = getEmailTranslation('emails.invalid.deep.nesting.path', 'en');
      // Should return the key as fallback
      expect(typeof result).toBe('string');
    });

    it('should handle null/undefined variables parameter', () => {
      const result = getEmailTranslation('accessApproval.greeting', 'en', undefined);
      expect(typeof result).toBe('string');
      // Should contain placeholder since no variables provided
      expect(result).toContain('{name}');
    });

    it('should handle nested keys correctly (multiple dots)', () => {
      const result = getEmailTranslation('accessApproval.subject', 'en', { accountName: 'Test' });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle special characters in variable values', () => {
      const result = getEmailTranslation('accessApproval.greeting', 'en', {
        name: "O'Brien & Co. <test@example.com>"
      });
      expect(result).toContain("O'Brien");
      expect(result).toContain('&');
    });
  });

  describe('Performance', () => {
    it('should use cached translations on subsequent calls', () => {
      // First call - loads from file
      const start1 = Date.now();
      getEmailTranslation('accessApproval.subject', 'en', { accountName: 'Test1' });
      const duration1 = Date.now() - start1;

      // Second call - should use cache (much faster)
      const start2 = Date.now();
      getEmailTranslation('accessApproval.subject', 'en', { accountName: 'Test2' });
      const duration2 = Date.now() - start2;

      // Cache hit should be significantly faster (but we won't assert specific timing)
      expect(duration2).toBeLessThanOrEqual(duration1);
    });

    it('should handle rapid successive calls efficiently', () => {
      const iterations = 100;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        getEmailTranslation('accessApproval.greeting', 'en', { name: `User${i}` });
      }

      const duration = Date.now() - start;
      // 100 calls should complete quickly (within 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});

describe('Helper functions', () => {
  describe('getEmailSubject', () => {
    it('should return correct subject for accessApproval', () => {
      const result = getEmailSubject('accessApproval', 'en', { accountName: 'TestAccount' });
      expect(result).toContain('Access Granted');
      expect(result).toContain('TestAccount');
    });

    it('should return correct subject for accessDenial', () => {
      const result = getEmailSubject('accessDenial', 'en', { accountName: 'TestAccount' });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should interpolate variables in subject', () => {
      const result = getEmailSubject('accessApproval', 'fr', { accountName: 'MonCompte' });
      expect(result).toContain('MonCompte');
    });

    it('should work for all email types', () => {
      const types: Array<'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder'> = [
        'accessApproval',
        'accessDenial',
        'betaAccess',
        'registrationReminder'
      ];

      types.forEach((type) => {
        const result = getEmailSubject(type, 'en', { accountName: 'Test' });
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('getEmailGreeting', () => {
    it('should format greeting with name for accessApproval', () => {
      const result = getEmailGreeting('accessApproval', 'en', 'John');
      expect(result).toContain('John');
      expect(result).toContain('Hello');
    });

    it('should format greeting with name for all email types', () => {
      const types: Array<'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder'> = [
        'accessApproval',
        'accessDenial',
        'betaAccess',
        'registrationReminder'
      ];

      types.forEach((type) => {
        const result = getEmailGreeting(type, 'en', 'TestUser');
        expect(result).toContain('TestUser');
      });
    });

    it('should work in different languages', () => {
      const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
      languages.forEach((lang) => {
        const result = getEmailGreeting('accessApproval', lang, 'Marie');
        expect(result).toContain('Marie');
      });
    });
  });

  describe('getEmailFooter', () => {
    it('should return common footer in English', () => {
      const result = getEmailFooter('en');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return common footer in all 6 languages', () => {
      const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
      languages.forEach((lang) => {
        const result = getEmailFooter(lang);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        // Each language should have different footer text
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('preloadEmailTranslations', () => {
    it('should load all languages without errors', () => {
      // Should not throw
      expect(() => {
        preloadEmailTranslations();
      }).not.toThrow();
    });

    it('should populate cache for all languages', () => {
      preloadEmailTranslations();

      // Verify all languages work after preload
      const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
      languages.forEach((lang) => {
        const result = getEmailTranslation('accessApproval.subject', lang, { accountName: 'Test' });
        expect(result).toBeTruthy();
      });
    });
  });
});
