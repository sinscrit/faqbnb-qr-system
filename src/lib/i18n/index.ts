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
 * @lastModified 2026-01-23
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

// Guest language detection utilities (Epic 4 - Guest Experience)
export {
  // Cookie constants
  GUEST_LANG_COOKIE_NAME,
  GUEST_LANG_COOKIE_MAX_AGE,
  GUEST_LANG_COOKIE_PATH,
  GUEST_LANG_COOKIE_SAMESITE,
  // Accept-Language parsing
  parseAcceptLanguage,
  // Language validation and mapping
  isSupportedLanguage,
  mapToSupportedLanguage,
  // Cookie utilities
  getGuestLanguageCookie,
  setGuestLanguageCookie,
  clearGuestLanguageCookie,
  // Language detection
  detectGuestLanguage,
  detectGuestLanguageClient,
} from './guest-language';

// Date/Time Formatting exports (REQ-E02-029)
export {
  useDateTimeFormatter,
  getDateTimeFormatter,
  type DateFormatStyle,
  type TimeFormatStyle,
  type DateTimeFormatterReturn,
} from './datetime-formatting';

// Error Translation exports (REQ-E02-035)
export {
  useErrorTranslations,
  getErrorTranslations,
  getHttpErrorKey,
  getErrorCodeKey,
  getErrorCategory,
  type ErrorTranslationUtils,
  type ErrorCategory,
  type FormErrorKey,
  type AuthErrorKey,
  type ApiErrorKey,
  type NetworkErrorKey,
  type ItemErrorKey,
  type PropertyErrorKey,
  type FileErrorKey,
  type ErrorParams,
} from './error-translations';

// Language Options helper (REQ-E05-025)
export * from './language-options';
