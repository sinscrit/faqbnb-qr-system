// /src/components/LanguageSwitcher/constants.ts
// REQ-248: Locale configuration constants
// Last Modified: 2026-01-18

import type { LocaleOption, SupportedLanguage } from './LanguageSwitcher.types';

/**
 * All supported locales with native names and flags
 * Order: English first (default), then alphabetically by English name
 */
export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

/**
 * Default locale when no preference is set
 */
export const DEFAULT_LOCALE: SupportedLanguage = 'en';

/**
 * Cookie name for storing language preference
 * Used for both guests and authenticated users (immediate persistence)
 */
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * API endpoint for persisting language preference to database
 */
export const LANGUAGE_PREFERENCE_API = '/api/user/language';

/**
 * Get locale option by code
 */
export function getLocaleByCode(code: SupportedLanguage): LocaleOption | undefined {
  return SUPPORTED_LOCALES.find(locale => locale.code === code);
}

/**
 * Check if a string is a valid supported language code
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return ['en', 'fr', 'es', 'de', 'nl', 'it'].includes(code);
}
