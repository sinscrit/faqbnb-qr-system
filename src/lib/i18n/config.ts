/**
 * i18n Configuration Module
 *
 * Centralized locale configuration for the FAQBNB application.
 * Provides type-safe locale definitions and configuration constants.
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
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
 * Type representing a valid supported locale
 */
export type SupportedLocale = (typeof locales)[number];

/**
 * Default locale used when no preference is detected
 */
export const defaultLocale: SupportedLocale = 'en';

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
 * Type guard to check if a string is a valid supported locale
 * @param locale - The string to check
 * @returns True if the locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale);
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
