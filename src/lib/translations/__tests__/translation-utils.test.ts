/**
 * @fileoverview Unit tests for Translation Utility Helpers
 *
 * Tests for:
 * - mergeTranslation: Content merging with translation data
 * - getDisplayLanguage: Language selection priority cascade
 * - formatLanguageName: Language code formatting
 * - isTranslationComplete: Translation completeness check
 * - getTranslatedFields: Translated field listing
 * - validateLanguageCode: Language code validation type guard
 *
 * @since Epic 4 - Guest Experience
 * Last Modified: 2026-01-23 13:55
 */

// Import directly from translation-utils to avoid triggering supabase client in barrel export
import {
  mergeTranslation,
  getDisplayLanguage,
  formatLanguageName,
  isTranslationComplete,
  getTranslatedFields,
  validateLanguageCode,
} from '../translation-utils';

// Define SupportedLanguage locally to avoid importing from files that trigger Supabase
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// =============================================================================
// mergeTranslation Tests
// =============================================================================

describe('mergeTranslation', () => {
  it('should return merged content when all fields are translated', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };
    const translation = { name: 'Café', description: 'Boisson chaude' };

    const result = mergeTranslation(original, translation);

    expect(result).toEqual({ name: 'Café', description: 'Boisson chaude' });
  });

  it('should preserve original fields when translation field is null', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };
    const translation = { name: 'Café', description: null };

    const result = mergeTranslation(original, translation);

    expect(result).toEqual({ name: 'Café', description: 'Hot drink' });
  });

  it('should preserve original fields when translation field is undefined', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };
    const translation = { name: 'Café' }; // description is undefined

    const result = mergeTranslation(original, translation);

    expect(result).toEqual({ name: 'Café', description: 'Hot drink' });
  });

  it('should return original unchanged when translation is null', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };

    const result = mergeTranslation(original, null);

    expect(result).toEqual(original);
    expect(result).toBe(original); // Should be exact same reference
  });

  it('should return original unchanged when translation is empty object', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };

    const result = mergeTranslation(original, {});

    expect(result).toEqual(original);
  });

  it('should replace arrays completely (not merge elements)', () => {
    const original = { tags: ['kitchen', 'appliance'] };
    const translation = { tags: ['cuisine', 'appareil'] };

    const result = mergeTranslation(original, translation);

    expect(result.tags).toEqual(['cuisine', 'appareil']);
    expect(result.tags).toHaveLength(2);
  });

  it('should handle mixed scenario with some translated, some original fields', () => {
    const original = { name: 'Coffee', description: 'Hot drink', category: 'beverages' };
    const translation = { name: 'Café', description: null }; // category not provided

    const result = mergeTranslation(original, translation);

    expect(result).toEqual({
      name: 'Café',
      description: 'Hot drink', // preserved because translation.description is null
      category: 'beverages', // preserved because not in translation
    });
  });

  it('should work with different content types (items, articles, links)', () => {
    // Item-like object
    const item = { id: '1', name: 'Item', publicId: 'abc' };
    const itemTranslation = { name: 'Article' };
    expect(mergeTranslation(item, itemTranslation)).toEqual({ id: '1', name: 'Article', publicId: 'abc' });

    // Article-like object
    const article = { id: '2', title: 'Title', description: 'Desc' };
    const articleTranslation = { title: 'Titre', description: 'Description' };
    expect(mergeTranslation(article, articleTranslation)).toEqual({
      id: '2',
      title: 'Titre',
      description: 'Description',
    });

    // Link-like object
    const link = { id: '3', title: 'Link Title', url: 'https://example.com' };
    const linkTranslation = { title: 'Titre du lien' };
    expect(mergeTranslation(link, linkTranslation)).toEqual({
      id: '3',
      title: 'Titre du lien',
      url: 'https://example.com',
    });
  });

  it('should not modify the original object', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };
    const translation = { name: 'Café' };

    mergeTranslation(original, translation);

    expect(original.name).toBe('Coffee'); // Original unchanged
  });
});

// =============================================================================
// getDisplayLanguage Tests
// =============================================================================

describe('getDisplayLanguage', () => {
  it('should return requested language when it is available', () => {
    const result = getDisplayLanguage('fr', ['en', 'fr', 'es'], 'en');
    expect(result).toBe('fr');
  });

  it('should return source language when requested is not available', () => {
    const result = getDisplayLanguage('de', ['en', 'fr', 'es'], 'en');
    expect(result).toBe('en');
  });

  it('should return source language when requested IS the source', () => {
    const result = getDisplayLanguage('en', ['fr', 'es'], 'en');
    expect(result).toBe('en');
  });

  it('should return source language when available array is empty', () => {
    const result = getDisplayLanguage('fr', [], 'en');
    expect(result).toBe('en');
  });

  it('should return source when it is in available list but requested is not', () => {
    const result = getDisplayLanguage('de', ['en', 'fr'], 'en');
    expect(result).toBe('en');
  });

  it('should return first available language when requested and source not in list', () => {
    // Edge case: source 'de' not in available list ['fr', 'es']
    // Priority 4 applies: return first available when source not in list
    const result = getDisplayLanguage('it', ['fr', 'es'], 'de');
    expect(result).toBe('fr'); // First available when source not in list
  });

  it('should handle all 6 supported languages correctly', () => {
    const allLanguages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

    allLanguages.forEach(lang => {
      const result = getDisplayLanguage(lang, allLanguages, 'en');
      expect(result).toBe(lang); // Each should be returned when available
    });
  });

  it('should prioritize requested over source when both available', () => {
    const result = getDisplayLanguage('fr', ['en', 'fr'], 'en');
    expect(result).toBe('fr'); // Requested takes priority
  });

  it('should handle single language in available array when source not available', () => {
    // When source 'en' is not in available ['fr'], return first available
    const result = getDisplayLanguage('de', ['fr'], 'en');
    expect(result).toBe('fr'); // First available when source not in list
  });

  it('should prefer source when source is in available array', () => {
    // When source 'en' IS in available ['en', 'fr'], prefer source over random
    const result = getDisplayLanguage('de', ['en', 'fr'], 'en');
    expect(result).toBe('en'); // Source preferred when available
  });
});

// =============================================================================
// formatLanguageName Tests
// =============================================================================

describe('formatLanguageName', () => {
  it('should return English name by default for all 6 languages', () => {
    expect(formatLanguageName('en')).toBe('English');
    expect(formatLanguageName('fr')).toBe('French');
    expect(formatLanguageName('es')).toBe('Spanish');
    expect(formatLanguageName('de')).toBe('German');
    expect(formatLanguageName('nl')).toBe('Dutch');
    expect(formatLanguageName('it')).toBe('Italian');
  });

  it('should return native name when native parameter is true', () => {
    expect(formatLanguageName('en', true)).toBe('English');
    expect(formatLanguageName('fr', true)).toBe('Français');
    expect(formatLanguageName('es', true)).toBe('Español');
    expect(formatLanguageName('de', true)).toBe('Deutsch');
    expect(formatLanguageName('nl', true)).toBe('Nederlands');
    expect(formatLanguageName('it', true)).toBe('Italiano');
  });

  it('should include flag emoji when includeFlag is true', () => {
    expect(formatLanguageName('en', false, true)).toBe('🇬🇧 English');
    expect(formatLanguageName('fr', false, true)).toBe('🇫🇷 French');
    expect(formatLanguageName('es', false, true)).toBe('🇪🇸 Spanish');
    expect(formatLanguageName('de', false, true)).toBe('🇩🇪 German');
    expect(formatLanguageName('nl', false, true)).toBe('🇳🇱 Dutch');
    expect(formatLanguageName('it', false, true)).toBe('🇮🇹 Italian');
  });

  it('should return code itself when language not found (invalid code)', () => {
    // Cast to bypass TypeScript checking for test purposes
    const result = formatLanguageName('xx' as SupportedLanguage);
    expect(result).toBe('xx');
  });

  it('should handle all parameter combinations (English, native, with/without flag)', () => {
    // English without flag
    expect(formatLanguageName('fr', false, false)).toBe('French');

    // English with flag
    expect(formatLanguageName('fr', false, true)).toBe('🇫🇷 French');

    // Native without flag
    expect(formatLanguageName('fr', true, false)).toBe('Français');

    // Native with flag
    expect(formatLanguageName('fr', true, true)).toBe('🇫🇷 Français');
  });

  it('should use default parameter values correctly', () => {
    // Default: native=false, includeFlag=false
    const defaultResult = formatLanguageName('fr');
    const explicitResult = formatLanguageName('fr', false, false);
    expect(defaultResult).toBe(explicitResult);
  });
});

// =============================================================================
// isTranslationComplete Tests
// =============================================================================

describe('isTranslationComplete', () => {
  it('should return true when all fields are translated', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };
    const translation = { name: 'Café', description: 'Boisson chaude' };

    expect(isTranslationComplete(original, translation)).toBe(true);
  });

  it('should return false when some fields are null', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };
    const translation = { name: 'Café', description: null };

    expect(isTranslationComplete(original, translation)).toBe(false);
  });

  it('should return false when some fields are missing (undefined)', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };
    const translation = { name: 'Café' }; // description missing

    expect(isTranslationComplete(original, translation)).toBe(false);
  });

  it('should return false when translation is null', () => {
    const original = { name: 'Coffee', description: 'Hot drink' };

    expect(isTranslationComplete(original, null)).toBe(false);
  });

  it('should return true for empty original object with empty translation', () => {
    const original = {};
    const translation = {};

    expect(isTranslationComplete(original, translation)).toBe(true);
  });

  it('should work with complex objects', () => {
    const original = { id: '1', name: 'Item', description: 'Desc', tags: ['a'] };
    const fullTranslation = { id: '1', name: 'Article', description: 'Texte', tags: ['b'] };
    const partialTranslation = { id: '1', name: 'Article', tags: ['b'] }; // description missing

    expect(isTranslationComplete(original, fullTranslation)).toBe(true);
    expect(isTranslationComplete(original, partialTranslation)).toBe(false);
  });
});

// =============================================================================
// getTranslatedFields Tests
// =============================================================================

describe('getTranslatedFields', () => {
  it('should return array of translated field names', () => {
    const translation = { name: 'Café', description: 'Boisson chaude' };

    const result = getTranslatedFields(translation);

    expect(result).toContain('name');
    expect(result).toContain('description');
    expect(result).toHaveLength(2);
  });

  it('should exclude null fields', () => {
    const translation = { name: 'Café', description: null };

    const result = getTranslatedFields(translation);

    expect(result).toContain('name');
    expect(result).not.toContain('description');
    expect(result).toHaveLength(1);
  });

  it('should exclude undefined fields', () => {
    const translation: { name: string; description?: string } = { name: 'Café' };

    const result = getTranslatedFields(translation);

    expect(result).toContain('name');
    expect(result).not.toContain('description');
  });

  it('should return empty array for null translation', () => {
    const result = getTranslatedFields(null);

    expect(result).toEqual([]);
  });

  it('should return empty array for empty translation object', () => {
    const result = getTranslatedFields({});

    expect(result).toEqual([]);
  });

  it('should handle mixed scenario correctly', () => {
    const translation = { name: 'Café', description: null, tags: ['cuisine'] };

    const result = getTranslatedFields(translation);

    expect(result).toContain('name');
    expect(result).toContain('tags');
    expect(result).not.toContain('description');
    expect(result).toHaveLength(2);
  });
});

// =============================================================================
// validateLanguageCode Tests
// =============================================================================

describe('validateLanguageCode', () => {
  it('should return true for valid language codes', () => {
    expect(validateLanguageCode('en')).toBe(true);
    expect(validateLanguageCode('fr')).toBe(true);
    expect(validateLanguageCode('es')).toBe(true);
    expect(validateLanguageCode('de')).toBe(true);
    expect(validateLanguageCode('nl')).toBe(true);
    expect(validateLanguageCode('it')).toBe(true);
  });

  it('should return false for invalid language codes', () => {
    expect(validateLanguageCode('xx')).toBe(false);
    expect(validateLanguageCode('invalid')).toBe(false);
    expect(validateLanguageCode('')).toBe(false);
    expect(validateLanguageCode('EN')).toBe(false); // Case sensitive
    expect(validateLanguageCode('french')).toBe(false);
  });

  it('should act as type guard', () => {
    const userInput: string = 'fr';

    if (validateLanguageCode(userInput)) {
      // TypeScript should allow using userInput as SupportedLanguage here
      const name: string = formatLanguageName(userInput);
      expect(name).toBe('French');
    }
  });

  it('should handle edge cases', () => {
    expect(validateLanguageCode(' ')).toBe(false); // Whitespace
    expect(validateLanguageCode('en ')).toBe(false); // Trailing space
    expect(validateLanguageCode(' en')).toBe(false); // Leading space
  });
});
