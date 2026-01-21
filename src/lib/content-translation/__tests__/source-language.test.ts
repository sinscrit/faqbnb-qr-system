/**
 * Unit Tests for Source Language Detection Utility
 * Part of REQ-E03-007: Add Source Language Detection Utility
 *
 * @module content-translation/__tests__/source-language.test
 * @created 2026-01-21
 */

import {
  detectSourceLanguage,
  detectSourceLanguageFromContext,
} from '../source-language';

describe('detectSourceLanguage', () => {
  describe('Override Priority Tests', () => {
    it('returns override when valid', () => {
      expect(detectSourceLanguage({ override: 'fr' })).toBe('fr');
    });

    it('override beats user preference', () => {
      expect(detectSourceLanguage({
        override: 'fr',
        user: { preferred_language: 'es' }
      })).toBe('fr');
    });

    it('override beats account preference', () => {
      expect(detectSourceLanguage({
        override: 'de',
        account: { preferred_language: 'it' }
      })).toBe('de');
    });

    it('override beats both user and account preferences', () => {
      expect(detectSourceLanguage({
        override: 'nl',
        user: { preferred_language: 'es' },
        account: { preferred_language: 'fr' }
      })).toBe('nl');
    });

    it('invalid override falls through to user preference', () => {
      expect(detectSourceLanguage({
        override: 'invalid',
        user: { preferred_language: 'es' }
      })).toBe('es');
    });

    it('empty override falls through', () => {
      expect(detectSourceLanguage({
        override: '',
        user: { preferred_language: 'de' }
      })).toBe('de');
    });

    it('null override falls through', () => {
      expect(detectSourceLanguage({
        override: null,
        user: { preferred_language: 'it' }
      })).toBe('it');
    });
  });

  describe('User Preference Tests', () => {
    it('returns user preference when no override', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: 'de' }
      })).toBe('de');
    });

    it('user preference beats account preference', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: 'de' },
        account: { preferred_language: 'fr' }
      })).toBe('de');
    });

    it('invalid user preference falls through to account', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: 'invalid' },
        account: { preferred_language: 'fr' }
      })).toBe('fr');
    });

    it('null user preference falls through to account', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: null },
        account: { preferred_language: 'es' }
      })).toBe('es');
    });

    it('undefined user preference falls through to account', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: undefined },
        account: { preferred_language: 'nl' }
      })).toBe('nl');
    });

    it('empty user preference falls through to account', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: '' },
        account: { preferred_language: 'it' }
      })).toBe('it');
    });
  });

  describe('Account Preference Tests', () => {
    it('returns account preference when no user preference', () => {
      expect(detectSourceLanguage({
        account: { preferred_language: 'nl' }
      })).toBe('nl');
    });

    it('null user falls through to account', () => {
      expect(detectSourceLanguage({
        user: null,
        account: { preferred_language: 'it' }
      })).toBe('it');
    });

    it('undefined user falls through to account', () => {
      expect(detectSourceLanguage({
        user: undefined,
        account: { preferred_language: 'es' }
      })).toBe('es');
    });

    it('user without preferred_language falls through to account', () => {
      expect(detectSourceLanguage({
        user: {},
        account: { preferred_language: 'de' }
      })).toBe('de');
    });

    it('invalid account preference falls through to default', () => {
      expect(detectSourceLanguage({
        account: { preferred_language: 'invalid' }
      })).toBe('en');
    });
  });

  describe('Default Fallback Tests', () => {
    it('returns English for empty options', () => {
      expect(detectSourceLanguage({})).toBe('en');
    });

    it('returns English for no options', () => {
      expect(detectSourceLanguage()).toBe('en');
    });

    it('returns English when all values are null', () => {
      expect(detectSourceLanguage({
        user: null,
        account: null,
        override: null
      })).toBe('en');
    });

    it('returns English when preferred_language is undefined', () => {
      expect(detectSourceLanguage({
        user: {},
        account: {}
      })).toBe('en');
    });

    it('returns English when all values are invalid', () => {
      expect(detectSourceLanguage({
        override: 'xx',
        user: { preferred_language: 'yy' },
        account: { preferred_language: 'zz' }
      })).toBe('en');
    });
  });

  describe('All Supported Languages', () => {
    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'] as const)('accepts %s as override', (lang) => {
      expect(detectSourceLanguage({ override: lang })).toBe(lang);
    });

    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'] as const)('accepts %s as user preference', (lang) => {
      expect(detectSourceLanguage({ user: { preferred_language: lang } })).toBe(lang);
    });

    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'] as const)('accepts %s as account preference', (lang) => {
      expect(detectSourceLanguage({ account: { preferred_language: lang } })).toBe(lang);
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace-only override', () => {
      expect(detectSourceLanguage({
        override: '   ',
        user: { preferred_language: 'fr' }
      })).toBe('fr');
    });

    it('handles case sensitivity (uppercase should fail)', () => {
      expect(detectSourceLanguage({
        override: 'FR',
        user: { preferred_language: 'de' }
      })).toBe('de');
    });

    it('handles mixed case (should fail)', () => {
      expect(detectSourceLanguage({
        override: 'Fr',
        user: { preferred_language: 'es' }
      })).toBe('es');
    });

    it('handles language code with extra characters (should fail)', () => {
      expect(detectSourceLanguage({
        override: 'fr-FR',
        user: { preferred_language: 'de' }
      })).toBe('de');
    });
  });
});

describe('detectSourceLanguageFromContext', () => {
  it('delegates to detectSourceLanguage with user preference', () => {
    expect(detectSourceLanguageFromContext(
      { preferred_language: 'fr' },
      null,
      undefined
    )).toBe('fr');
  });

  it('accepts null parameters', () => {
    expect(detectSourceLanguageFromContext(null, null)).toBe('en');
  });

  it('accepts undefined parameters', () => {
    expect(detectSourceLanguageFromContext(undefined, undefined)).toBe('en');
  });

  it('override takes priority', () => {
    expect(detectSourceLanguageFromContext(
      { preferred_language: 'fr' },
      { preferred_language: 'de' },
      'es'
    )).toBe('es');
  });

  it('user takes priority over account', () => {
    expect(detectSourceLanguageFromContext(
      { preferred_language: 'nl' },
      { preferred_language: 'it' }
    )).toBe('nl');
  });

  it('account is used when user is null', () => {
    expect(detectSourceLanguageFromContext(
      null,
      { preferred_language: 'de' }
    )).toBe('de');
  });

  it('account is used when user has no preference', () => {
    expect(detectSourceLanguageFromContext(
      {},
      { preferred_language: 'fr' }
    )).toBe('fr');
  });

  it('returns default when no valid preferences', () => {
    expect(detectSourceLanguageFromContext(
      { preferred_language: 'invalid' },
      { preferred_language: 'also-invalid' }
    )).toBe('en');
  });
});
