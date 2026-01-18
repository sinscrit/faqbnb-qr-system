/**
 * i18n Module Barrel Export
 *
 * Provides clean import paths for i18n utilities and configuration.
 *
 * Usage:
 *   import { locales, defaultLocale, isValidLocale } from '@/lib/i18n';
 *   import { detectLocale, getCurrentLocale } from '@/lib/i18n';
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

// Configuration exports (safe for client and server components)
export {
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
  type SupportedLocale,
  type LocaleMetadata,
} from './config';

// Server-side detection exports
// Note: These are async functions and should only be used in Server Components
export { detectLocale, getCurrentLocale, parseAcceptLanguage } from './request';
