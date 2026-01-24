/**
 * Language Options Helper
 *
 * Utility functions for converting locale metadata to LanguageOption format
 * expected by the LanguagePreferenceSection component.
 *
 * REQ-E05-025: Create LanguagePreferenceSection component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * @created 2026-01-24
 * @lastModified 2026-01-24
 */

import { localeMetadata, type SupportedLocale } from './config';
import type { LanguageOption } from '@/components/TranslationManagement/LanguagePreference';

/**
 * Get all supported languages as LanguageOption array.
 * Converts locale metadata to the format expected by LanguagePreferenceSection.
 *
 * @returns Array of all supported languages with code, name, and nativeName
 *
 * @example
 * const languages = getLanguageOptions();
 * // Returns: [{ code: 'en', name: 'English', nativeName: 'English' }, ...]
 */
export function getLanguageOptions(): LanguageOption[] {
  return Object.values(localeMetadata).map((meta) => ({
    code: meta.code,
    name: meta.name,
    nativeName: meta.nativeName,
  }));
}

/**
 * Get a single language option by its code.
 *
 * @param code - The ISO language code to look up (e.g., 'en', 'fr')
 * @returns The LanguageOption for the code, or null if not found
 *
 * @example
 * const english = getLanguageOption('en');
 * // Returns: { code: 'en', name: 'English', nativeName: 'English' }
 *
 * const invalid = getLanguageOption('invalid');
 * // Returns: null
 */
export function getLanguageOption(code: string): LanguageOption | null {
  const meta = localeMetadata[code as SupportedLocale];
  if (!meta) {
    return null;
  }
  return {
    code: meta.code,
    name: meta.name,
    nativeName: meta.nativeName,
  };
}
