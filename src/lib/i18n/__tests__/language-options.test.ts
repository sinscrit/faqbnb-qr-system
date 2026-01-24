/**
 * Language Options Helper Tests
 *
 * REQ-E05-025: Create LanguagePreferenceSection component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * @created 2026-01-24
 * @lastModified 2026-01-24
 */

import { describe, it, expect } from 'vitest';
import { getLanguageOptions, getLanguageOption } from '../language-options';
import { localeMetadata } from '../config';

describe('language-options - getLanguageOptions', () => {
  it('returns array of all supported languages', () => {
    const languages = getLanguageOptions();

    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBe(Object.keys(localeMetadata).length);
  });

  it('each language option has required properties', () => {
    const languages = getLanguageOptions();

    languages.forEach((lang) => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('nativeName');

      expect(typeof lang.code).toBe('string');
      expect(typeof lang.name).toBe('string');
      expect(typeof lang.nativeName).toBe('string');
    });
  });

  it('language options match localeMetadata structure', () => {
    const languages = getLanguageOptions();
    const metadataValues = Object.values(localeMetadata);

    expect(languages.length).toBe(metadataValues.length);

    languages.forEach((lang, index) => {
      const metadata = metadataValues[index];
      expect(lang.code).toBe(metadata.code);
      expect(lang.name).toBe(metadata.name);
      expect(lang.nativeName).toBe(metadata.nativeName);
    });
  });

  it('includes English language', () => {
    const languages = getLanguageOptions();
    const english = languages.find((lang) => lang.code === 'en');

    expect(english).toBeDefined();
    expect(english?.name).toBe('English');
  });
});

describe('language-options - getLanguageOption', () => {
  it('returns correct language for valid code', () => {
    const english = getLanguageOption('en');

    expect(english).not.toBeNull();
    expect(english?.code).toBe('en');
    expect(english?.name).toBe('English');
    expect(english?.nativeName).toBe('English');
  });

  it('returns null for invalid code', () => {
    const invalid = getLanguageOption('invalid');

    expect(invalid).toBeNull();
  });

  it('returns null for empty string', () => {
    const empty = getLanguageOption('');

    expect(empty).toBeNull();
  });

  it('handles all supported language codes', () => {
    const supportedCodes = Object.keys(localeMetadata);

    supportedCodes.forEach((code) => {
      const language = getLanguageOption(code);

      expect(language).not.toBeNull();
      expect(language?.code).toBe(code);
    });
  });

  it('returned object has same structure as localeMetadata entry', () => {
    const french = getLanguageOption('fr');
    const frenchMetadata = localeMetadata.fr;

    expect(french).not.toBeNull();
    expect(french?.code).toBe(frenchMetadata.code);
    expect(french?.name).toBe(frenchMetadata.name);
    expect(french?.nativeName).toBe(frenchMetadata.nativeName);
  });
});
