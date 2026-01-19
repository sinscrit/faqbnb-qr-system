/**
 * Translation Service Types Tests
 * Part of REQ-235: Translation Service Module Infrastructure
 *
 * @created 2026-01-18
 */

import { describe, it, expect } from 'vitest';
import {
  SupportedLanguage,
  TranslationStatus,
  TranslationProvider,
  TranslatableEntityType,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationRequest,
  BatchTranslationResponse,
  TranslationJob,
  ITranslationProvider,
  TranslationServiceConfig,
  TranslationResult,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  getLanguageInfo,
  getOtherLanguages,
} from '../index';

describe('Translation Service Types', () => {
  describe('SupportedLanguage', () => {
    it('should accept valid language codes', () => {
      const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
      expect(languages.length).toBe(6);
    });
  });

  describe('isSupportedLanguage', () => {
    it('should return true for valid language codes', () => {
      expect(isSupportedLanguage('en')).toBe(true);
      expect(isSupportedLanguage('fr')).toBe(true);
      expect(isSupportedLanguage('es')).toBe(true);
      expect(isSupportedLanguage('de')).toBe(true);
      expect(isSupportedLanguage('nl')).toBe(true);
      expect(isSupportedLanguage('it')).toBe(true);
    });

    it('should return false for invalid language codes', () => {
      expect(isSupportedLanguage('invalid')).toBe(false);
      expect(isSupportedLanguage('EN')).toBe(false); // Case sensitive
      expect(isSupportedLanguage('')).toBe(false);
      expect(isSupportedLanguage('english')).toBe(false);
    });

    it('should narrow type correctly', () => {
      const code = 'en' as string;
      if (isSupportedLanguage(code)) {
        // TypeScript should accept this
        const lang: SupportedLanguage = code;
        expect(lang).toBe('en');
      }
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should have all 6 supported languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBe(6);
    });

    it('should have correct language codes', () => {
      const codes = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(codes).toEqual(['en', 'fr', 'es', 'de', 'nl', 'it']);
    });

    it('should have native names for each language', () => {
      const nativeNames = SUPPORTED_LANGUAGES.map(l => l.nativeName);
      expect(nativeNames).toContain('English');
      expect(nativeNames).toContain('Français');
      expect(nativeNames).toContain('Español');
      expect(nativeNames).toContain('Deutsch');
      expect(nativeNames).toContain('Nederlands');
      expect(nativeNames).toContain('Italiano');
    });

    it('should have no RTL languages', () => {
      const hasRtl = SUPPORTED_LANGUAGES.some(l => l.rtl);
      expect(hasRtl).toBe(false);
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    it('should be English', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });
  });

  describe('getLanguageInfo', () => {
    it('should return language info for valid codes', () => {
      const info = getLanguageInfo('fr');
      expect(info).toBeDefined();
      expect(info?.name).toBe('French');
      expect(info?.nativeName).toBe('Français');
    });

    it('should return undefined for invalid codes', () => {
      const info = getLanguageInfo('invalid');
      expect(info).toBeUndefined();
    });
  });

  describe('getOtherLanguages', () => {
    it('should return all languages except the specified one', () => {
      const others = getOtherLanguages('en');
      expect(others.length).toBe(5);
      expect(others).not.toContain('en');
      expect(others).toContain('fr');
      expect(others).toContain('es');
    });
  });

  describe('TranslationRequest', () => {
    it('should accept valid request structure', () => {
      const request: TranslationRequest = {
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        context: {
          contentType: 'item_name',
          domainContext: 'vacation rental property',
        },
      };
      expect(request.text).toBe('Hello world');
    });
  });

  describe('TranslationResponse', () => {
    it('should accept valid response structure', () => {
      const response: TranslationResponse = {
        translatedText: 'Bonjour le monde',
        provider: 'claude',
        tokensUsed: 50,
        durationMs: 234,
      };
      expect(response.translatedText).toBe('Bonjour le monde');
    });
  });

  describe('TranslationResult', () => {
    it('should handle success case', () => {
      const result: TranslationResult<string> = {
        success: true,
        data: 'translated text',
      };
      if (result.success) {
        expect(result.data).toBe('translated text');
      }
    });

    it('should handle failure case', () => {
      const result: TranslationResult<string> = {
        success: false,
        error: 'Translation failed',
        code: 'RATE_LIMIT',
      };
      if (!result.success) {
        expect(result.error).toBe('Translation failed');
        expect(result.code).toBe('RATE_LIMIT');
      }
    });
  });
});
