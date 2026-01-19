/**
 * i18n Module Exports
 * Centralized exports for internationalization utilities.
 *
 * Usage:
 *   import { locales, defaultLocale, isValidLocale } from '@/lib/i18n';
 *   import { detectUserLanguage, setLocaleCookie } from '@/lib/i18n';
 *   import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from '@/lib/i18n';
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * REQ-246: Create Language Detection Utility
 * Plan-110: L10N Epic 1 - Foundation
 *
 * @module lib/i18n
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

// Configuration exports (safe for client and server components)
export {
  // Original exports
  locales,
  defaultLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  localeMetadata,
  i18nConfig,
  getLocaleMetadata,
  isValidLocale,
  normalizeLocale,
  getAllLocales,
  // REQ-246 aliases for language detection
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_DISPLAY_NAMES,
  isSupportedLocale,
  // Types
  type SupportedLocale,
  type LocaleMetadata,
} from './config';

// Language Detection exports (REQ-246)
export {
  detectUserLanguage,
  setLocaleCookie,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from './language-detection';
