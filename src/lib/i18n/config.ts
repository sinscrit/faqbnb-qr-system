/**
 * i18n Configuration Module
 *
 * Centralized locale configuration for the FAQBNB application.
 * Provides type-safe locale definitions and configuration constants.
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * REQ-246: Create Language Detection Utility
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2 & Phase 5, Task 5.1
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

/**
 * Supported locale codes as a const tuple
 * These are the language codes supported by the application.
 */
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

/**
 * Array of all supported locale codes in the application.
 * Order determines display order in UI components.
 * Alias for `locales` to match REQ-246 specification.
 */
export const SUPPORTED_LOCALES = locales;

/**
 * Type representing a valid supported locale
 */
export type SupportedLocale = (typeof locales)[number];

/**
 * Default locale used when no preference is detected
 */
export const defaultLocale: SupportedLocale = 'en';

/**
 * The default locale used when no preference is detected.
 * Alias for `defaultLocale` to match REQ-246 specification.
 */
export const DEFAULT_LOCALE: SupportedLocale = defaultLocale;

/**
 * Cookie name for storing language preference
 * Used by middleware and LanguageSwitcher component
 */
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * i18n configuration object for next-intl
 * Used by getRequestConfig and IntlProvider
 */
export const i18nConfig = {
  locales,
  defaultLocale,
  localePrefix: 'as-needed' as const,
} as const;

/**
 * Locale metadata including native names and optional flags
 */
export interface LocaleMetadata {
  /** ISO locale code */
  code: SupportedLocale;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Optional flag emoji */
  flag?: string;
}

/**
 * Complete locale metadata for all supported languages
 */
export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
};

/**
 * Display names for each locale in both English and native language.
 * Used by LanguageSwitcher component for UI display.
 * Format matches REQ-246 specification.
 */
export const LOCALE_DISPLAY_NAMES: Record<SupportedLocale, { english: string; native: string }> = {
  en: { english: 'English', native: 'English' },
  fr: { english: 'French', native: 'Français' },
  es: { english: 'Spanish', native: 'Español' },
  de: { english: 'German', native: 'Deutsch' },
  nl: { english: 'Dutch', native: 'Nederlands' },
  it: { english: 'Italian', native: 'Italiano' },
};

/**
 * Type guard to check if a string is a valid supported locale
 * @param locale - The string to check
 * @returns True if the locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale);
}

/**
 * Type guard to check if a string is a supported locale.
 * Use this to validate user input or external data.
 * Alias for `isValidLocale` to match REQ-246 specification.
 *
 * @param locale - The string to check
 * @returns True if the locale is supported, false otherwise
 *
 * @example
 * const userLocale = 'fr';
 * if (isSupportedLocale(userLocale)) {
 *   // TypeScript knows userLocale is SupportedLocale here
 * }
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return isValidLocale(locale);
}

/**
 * Normalize a locale code to a supported locale
 * Handles variations like 'en-US' -> 'en', 'fr-CA' -> 'fr'
 * @param locale - The locale string to normalize
 * @returns The normalized supported locale or default locale if not found
 */
export function normalizeLocale(locale: string | null | undefined): SupportedLocale {
  if (!locale) {
    return defaultLocale;
  }

  // Direct match
  if (isValidLocale(locale)) {
    return locale;
  }

  // Try extracting the language code (e.g., 'en-US' -> 'en')
  const languageCode = locale.split('-')[0]?.toLowerCase();
  if (languageCode && isValidLocale(languageCode)) {
    return languageCode;
  }

  return defaultLocale;
}

/**
 * Get locale metadata for a specific locale
 * @param locale - The locale code to get metadata for
 * @returns Locale metadata or undefined if not found
 */
export function getLocaleMetadata(locale: string): LocaleMetadata | undefined {
  if (isValidLocale(locale)) {
    return localeMetadata[locale];
  }
  return undefined;
}

/**
 * Get all supported locales as an array of LocaleMetadata
 * Useful for rendering language selectors
 * @returns Array of locale metadata
 */
export function getAllLocales(): LocaleMetadata[] {
  return locales.map((code) => localeMetadata[code]);
}
