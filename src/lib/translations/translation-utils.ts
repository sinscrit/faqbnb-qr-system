/**
 * @fileoverview Translation Utility Helpers (Epic 4 - Guest Experience)
 *
 * Pure utility functions for translation operations: merging content, determining
 * display language, and formatting language names. Works in both server and client contexts.
 *
 * @description
 * This module provides:
 * - `mergeTranslation<T>` - Merge original content with translation data
 * - `getDisplayLanguage` - Determine best language to display based on availability
 * - `formatLanguageName` - Format language codes to human-readable names
 * - `isTranslationComplete` - Check if all fields have translations
 * - `getTranslatedFields` - Get list of translated field names
 * - `validateLanguageCode` - Type guard for runtime language code validation
 *
 * All functions are pure (no side effects) and type-safe.
 *
 * @module lib/translations/translation-utils
 * @since Epic 4 - Guest Experience
 *
 * @see {@link @/types/l10n} - Type definitions for localization
 * @see {@link ./fetch-translations} - Translation fetch utilities
 *
 * @example
 * ```typescript
 * import {
 *   mergeTranslation,
 *   getDisplayLanguage,
 *   formatLanguageName
 * } from '@/lib/translations';
 *
 * // Complete flow: fetch → merge → determine display language → format name
 * const translation = await fetchTranslation(itemId, 'fr');
 * const merged = mergeTranslation(original, translation);
 * const displayLang = getDisplayLanguage('fr', ['en', 'fr'], 'en');
 * const langName = formatLanguageName(displayLang, true, true); // "🇫🇷 Français"
 * ```
 *
 * Last Modified: 2026-01-23 13:45
 */

import type { SupportedLanguage } from '@/types/l10n';
import { SUPPORTED_LANGUAGES } from '@/types/l10n';

// =============================================================================
// Section 1: Content Merge Utilities
// =============================================================================

/**
 * Merge original content with translation data. Translated fields override original when present.
 * Original preserved when translation field is null/undefined.
 *
 * @description
 * This is a shallow merge. Arrays are replaced, not merged. Nested objects are replaced, not deep-merged.
 * Null/undefined translation fields preserve original field values (explicit fallback).
 *
 * @template T - Content type parameter (extends Record<string, unknown>)
 * @param original - Original content object
 * @param translation - Translation data (partial or null)
 * @returns Merged content with translations applied
 *
 * @example
 * ```typescript
 * // Full translation - all fields translated
 * const original = { name: 'Coffee', description: 'Hot drink' };
 * const translation = { name: 'Café', description: 'Boisson chaude' };
 * mergeTranslation(original, translation);
 * // Result: { name: 'Café', description: 'Boisson chaude' }
 * ```
 *
 * @example
 * ```typescript
 * // Partial translation - only name translated, description null
 * const original = { name: 'Coffee', description: 'Hot drink' };
 * const translation = { name: 'Café', description: null };
 * mergeTranslation(original, translation);
 * // Result: { name: 'Café', description: 'Hot drink' }
 * ```
 *
 * @example
 * ```typescript
 * // Null translation - returns original unchanged
 * const original = { name: 'Coffee', description: 'Hot drink' };
 * mergeTranslation(original, null);
 * // Result: { name: 'Coffee', description: 'Hot drink' }
 * ```
 *
 * @example
 * ```typescript
 * // Empty translation object - returns original unchanged
 * const original = { name: 'Coffee', description: 'Hot drink' };
 * mergeTranslation(original, {});
 * // Result: { name: 'Coffee', description: 'Hot drink' }
 * ```
 *
 * @example
 * ```typescript
 * // Array field replacement (arrays not merged element-wise)
 * const original = { tags: ['kitchen', 'appliance'] };
 * const translation = { tags: ['cuisine', 'appareil'] };
 * mergeTranslation(original, translation);
 * // Result: { tags: ['cuisine', 'appareil'] }
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null
): T {
  // Early return: if translation is null or undefined, return original unchanged
  if (translation === null || translation === undefined) {
    return original;
  }

  // Shallow merge: replace fields, don't deep merge nested objects
  const result = { ...original };

  for (const key in translation) {
    // Only override if translation value is not null and not undefined
    if (translation[key] !== null && translation[key] !== undefined) {
      (result as Record<string, unknown>)[key] = translation[key];
    }
  }

  return result;
}

// =============================================================================
// Section 2: Language Selection Utilities
// =============================================================================

/**
 * Determine best language to display based on user preference and availability.
 * Priority: requested (if available) → source → first available → source (fallback)
 *
 * @description
 * Implements the language selection algorithm that balances user preference with content availability.
 * Original content (source language) is always "available" since no translation needed.
 *
 * Decision tree:
 * 1. requested available? → requested
 * 2. requested is source? → source (original always available)
 * 3. source available? → source (prefer original over random language)
 * 4. any available? → first available
 * 5. fallback → source
 *
 * @param requested - User's requested language
 * @param available - Array of available translated languages
 * @param source - Source/original content language
 * @returns Best language to display
 *
 * @example
 * ```typescript
 * // Requested language is available - returns requested
 * getDisplayLanguage('fr', ['en', 'fr', 'es'], 'en');
 * // Returns: 'fr'
 * ```
 *
 * @example
 * ```typescript
 * // Requested language not available - returns source
 * getDisplayLanguage('de', ['en', 'fr', 'es'], 'en');
 * // Returns: 'en'
 * ```
 *
 * @example
 * ```typescript
 * // Requested is source language - returns source
 * getDisplayLanguage('en', ['en', 'fr'], 'en');
 * // Returns: 'en'
 * ```
 *
 * @example
 * ```typescript
 * // Empty available array - returns source
 * getDisplayLanguage('fr', [], 'en');
 * // Returns: 'en'
 * ```
 *
 * @example
 * ```typescript
 * // Source not in available list - returns first available or source
 * getDisplayLanguage('de', ['fr', 'es'], 'en');
 * // Returns: 'en' (source preferred over random language)
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export function getDisplayLanguage(
  requested: SupportedLanguage,
  available: SupportedLanguage[],
  source: SupportedLanguage
): SupportedLanguage {
  // Priority 1: If requested language is available, return it
  if (available.includes(requested)) {
    return requested;
  }

  // Priority 2: If requested is the source language, return source (original always available)
  if (requested === source) {
    return source;
  }

  // Priority 3: If source is in available list, return source (prefer original over random language)
  if (available.includes(source)) {
    return source;
  }

  // Priority 4: If any language is available, return first available
  if (available.length > 0) {
    return available[0];
  }

  // Priority 5: Last resort fallback - return source
  return source;
}

// =============================================================================
// Section 3: Language Name Formatting Utilities
// =============================================================================

/**
 * Format language code into human-readable name. Returns English name by default,
 * or native name when specified. Optionally includes flag emoji.
 *
 * @description
 * Useful for language switchers, labels, and badges in UI components.
 * Flag emoji may not display correctly on all platforms/fonts.
 *
 * @param code - Language code to format
 * @param native - Return native name if true, English name if false (default: false)
 * @param includeFlag - Include flag emoji in output (default: false)
 * @returns Formatted language name
 *
 * @example
 * ```typescript
 * // Default (English name)
 * formatLanguageName('fr');
 * // Returns: "French"
 * ```
 *
 * @example
 * ```typescript
 * // Native name
 * formatLanguageName('fr', true);
 * // Returns: "Français"
 * ```
 *
 * @example
 * ```typescript
 * // English name with flag
 * formatLanguageName('fr', false, true);
 * // Returns: "🇫🇷 French"
 * ```
 *
 * @example
 * ```typescript
 * // Native name with flag
 * formatLanguageName('fr', true, true);
 * // Returns: "🇫🇷 Français"
 * ```
 *
 * @example
 * ```typescript
 * // Invalid code fallback
 * formatLanguageName('xx' as SupportedLanguage);
 * // Returns: "xx"
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export function formatLanguageName(
  code: SupportedLanguage,
  native = false,
  includeFlag = false
): string {
  // Look up language in SUPPORTED_LANGUAGES
  const language = SUPPORTED_LANGUAGES.find(loc => loc.code === code);

  // Graceful fallback: return code itself if language metadata not found
  if (!language) {
    return code;
  }

  // Select name based on native parameter
  const name = native ? language.nativeName : language.name;

  // Add flag if requested and available
  const result = includeFlag && language.flag ? `${language.flag} ${name}` : name;

  return result;
}

// =============================================================================
// Section 4: Optional Helper Functions
// =============================================================================

/**
 * Check if all translatable fields have values in translation.
 * Useful for UI indicators (partial translation badge).
 *
 * @description
 * Compares the keys in the original object against the translation object.
 * Returns true only if ALL keys from the original have non-null/undefined values in the translation.
 *
 * @template T - Content type parameter
 * @param original - The original content object
 * @param translation - The translation data (partial or null)
 * @returns True if all fields are translated, false otherwise
 *
 * @example
 * ```typescript
 * const original = { name: 'Coffee', description: 'Hot drink' };
 * const fullTranslation = { name: 'Café', description: 'Boisson chaude' };
 * const partialTranslation = { name: 'Café', description: null };
 *
 * isTranslationComplete(original, fullTranslation); // true
 * isTranslationComplete(original, partialTranslation); // false
 * isTranslationComplete(original, null); // false
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export function isTranslationComplete<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null
): boolean {
  // Null translation means no translation exists
  if (translation === null) {
    return false;
  }

  // Check if all keys in original exist in translation and are non-null/undefined
  for (const key in original) {
    if (translation[key] === null || translation[key] === undefined) {
      return false;
    }
  }

  return true;
}

/**
 * Return array of field names that have translations.
 * Useful for debugging and analytics.
 *
 * @description
 * Inspects the translation object and returns the names of all fields
 * that have non-null/undefined values.
 *
 * @template T - Content type parameter
 * @param translation - The translation data (partial or null)
 * @returns Array of field names that have translations
 *
 * @example
 * ```typescript
 * const translation = { name: 'Café', description: null, tags: ['cuisine'] };
 * getTranslatedFields(translation);
 * // Returns: ['name', 'tags']
 *
 * getTranslatedFields(null);
 * // Returns: []
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export function getTranslatedFields<T extends Record<string, unknown>>(
  translation: Partial<T> | null
): (keyof T)[] {
  // Return empty array for null translation
  if (translation === null) {
    return [];
  }

  // Return array of keys where value is non-null/undefined
  const translatedFields: (keyof T)[] = [];

  for (const key in translation) {
    if (translation[key] !== null && translation[key] !== undefined) {
      translatedFields.push(key as keyof T);
    }
  }

  return translatedFields;
}

/**
 * Type guard for validating language codes at runtime.
 * Useful for API input validation.
 *
 * @description
 * Checks if the provided string is a valid SupportedLanguage code.
 * This is a TypeScript type guard that narrows the type from `string` to `SupportedLanguage`.
 *
 * @param code - The string to validate
 * @returns True if code is a valid SupportedLanguage, false otherwise
 *
 * @example
 * ```typescript
 * const userInput: string = 'fr';
 *
 * if (validateLanguageCode(userInput)) {
 *   // TypeScript knows userInput is SupportedLanguage here
 *   const displayName = formatLanguageName(userInput);
 * } else {
 *   console.error('Invalid language code');
 * }
 * ```
 *
 * @since Epic 4 - Guest Experience
 */
export function validateLanguageCode(code: string): code is SupportedLanguage {
  // Check if code is in SUPPORTED_LANGUAGES array
  return SUPPORTED_LANGUAGES.some(loc => loc.code === code);
}
