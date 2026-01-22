/**
 * Email Translation Utility
 *
 * Provides server-side translation support for email templates.
 * Uses translation files from /messages/{locale}.json (emails namespace).
 *
 * ## Features
 *
 * - Support for 6 languages (en, fr, es, de, nl, it)
 * - Variable interpolation with {variableName} syntax
 * - Automatic fallback to English for missing translations
 * - In-memory caching for performance
 * - Helper functions for common patterns (subject, greeting, footer)
 * - Type-safe API with TypeScript
 *
 * ## Usage
 *
 * ```typescript
 * import { getEmailTranslation, getEmailSubject } from '@/lib/email-translations';
 *
 * // Basic translation with variables
 * const subject = getEmailTranslation(
 *   'accessApproval.subject',
 *   'fr',
 *   { accountName: 'MyAccount' }
 * );
 * // Returns: "Accès Accordé: MyAccount - Votre Code d'Accès"
 *
 * // Using helper function
 * const greeting = getEmailGreeting('accessApproval', 'es', 'María');
 * // Returns: "Hola María,"
 * ```
 *
 * ## Fallback Behavior
 *
 * The utility implements a three-tier fallback strategy:
 * 1. Try requested language
 * 2. Fall back to English if translation not found
 * 3. Return translation key as-is if still not found
 *
 * This ensures email generation never fails due to missing translations.
 *
 * ## Performance
 *
 * Translations are cached in memory after first load:
 * - First call per language: ~5-10ms (file I/O)
 * - Subsequent calls: ~0.1ms (cache hit)
 *
 * Use `preloadEmailTranslations()` at server startup to eliminate
 * first-request latency in production environments.
 *
 * ## Architecture
 *
 * - **Synchronous API**: Uses `require()` for synchronous file loading
 * - **Module-level cache**: Shared across all function calls
 * - **Never throws**: All functions return strings; errors are logged
 * - **Server-side only**: Not designed for browser environments
 *
 * @module email-translations
 * @see REQ-E02-020: Task 2I.2
 * @since Epic 2 - Localization (L10N)
 * Last Modified: 2026-01-22 19:30
 */

import type { SupportedLanguage } from '@/types';

// ============================================================================
// Type definitions
// ============================================================================

/**
 * Email translation variables
 * Supports both string and number values (numbers converted to strings)
 */
export type EmailTranslationVariables = Record<string, string | number>;

/**
 * Internal cache structure for loaded translations
 */
type TranslationCache = {
  [lang in SupportedLanguage]?: {
    emails: Record<string, any>;
  };
};

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Resolve nested translation key
 *
 * Navigates through a nested object structure using dot notation.
 * Example: 'accessApproval.subject' → translations.accessApproval.subject
 *
 * @param translations - The translations object to navigate
 * @param key - Dot-separated key path (e.g., 'accessApproval.subject')
 * @returns The resolved string value, or null if not found or invalid
 */
function resolveTranslationKey(
  translations: Record<string, any>,
  key: string
): string | null {
  // Handle empty key
  if (!key || key.trim() === '') {
    return null;
  }

  // Split the key by dots to navigate nested structure
  const parts = key.split('.');

  // Initialize current pointer to translations root
  let current: any = translations;

  // Navigate through each part of the key path
  for (const part of parts) {
    // Check if current is an object and contains the next part
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Path doesn't exist
      return null;
    }
  }

  // Verify final value is a string
  if (typeof current === 'string') {
    return current;
  }

  // Final value is not a string
  return null;
}

/**
 * Interpolate variables into a template string
 *
 * Replaces {variableName} placeholders with provided values.
 * - Supports both string and number values (numbers are converted to strings)
 * - Replaces all occurrences of each variable (global flag)
 * - Unused variables in the object are ignored
 * - Missing variables leave the placeholder intact
 *
 * @param template - The template string with {variableName} placeholders
 * @param variables - Optional object with variable values
 * @returns The interpolated string
 *
 * @example
 * ```typescript
 * interpolateVariables('Hello {name}!', { name: 'John' })
 * // Returns: 'Hello John!'
 *
 * interpolateVariables('Count: {count}', { count: 42 })
 * // Returns: 'Count: 42'
 * ```
 */
function interpolateVariables(
  template: string,
  variables?: EmailTranslationVariables
): string {
  // Handle empty template
  if (!template) {
    return '';
  }

  // No variables provided - return template unchanged
  if (!variables || Object.keys(variables).length === 0) {
    return template;
  }

  // Use reduce to chain replacements for all variables
  return Object.entries(variables).reduce((result, [key, value]) => {
    // Convert numbers to strings
    const stringValue = typeof value === 'number' ? value.toString() : value;

    // Create regex to match all occurrences of placeholder
    // Escape curly braces in the regex pattern
    const regex = new RegExp(`\\{${key}\\}`, 'g');

    // Replace all occurrences
    return result.replace(regex, stringValue);
  }, template);
}

// ============================================================================
// Cache system
// ============================================================================

// Module-level cache (persists across function calls)
const translationCache: TranslationCache = {};

/**
 * Load translations for a specific language from the messages directory.
 * Caches translations in memory to avoid repeated file I/O operations.
 *
 * @param language - The language code to load translations for
 * @returns The emails namespace translations, or null if loading failed
 */
function loadTranslations(language: SupportedLanguage): Record<string, any> | null {
  // Check if language is already cached
  if (translationCache[language]) {
    return translationCache[language]!.emails;
  }

  try {
    // Load translation file using require (synchronous)
    // Use relative path to handle both runtime and test environments
    const messages = require(`../../messages/${language}.json`);

    // Extract and cache only the emails namespace
    if (messages.emails) {
      translationCache[language] = {
        emails: messages.emails
      };
      return messages.emails;
    } else {
      console.error(`[email-translations] No 'emails' namespace found in ${language}.json`);
      return null;
    }
  } catch (error) {
    console.error(`[email-translations] Failed to load translations for ${language}:`, error);
    return null;
  }
}

// ============================================================================
// Main API
// ============================================================================

/**
 * Get translated email text with variable interpolation
 *
 * Loads translations from the emails namespace and resolves the requested key
 * with automatic fallback to English if translation not found.
 *
 * @param key - Translation key path (e.g., 'accessApproval.subject')
 * @param language - Target language code
 * @param variables - Optional variables for interpolation
 * @returns Translated and interpolated text
 *
 * @example
 * ```typescript
 * const subject = getEmailTranslation(
 *   'accessApproval.subject',
 *   'fr',
 *   { accountName: 'MyAccount' }
 * );
 * // Returns: "Accès Accordé: MyAccount - Votre Code d'Accès"
 * ```
 *
 * ## Fallback behavior
 *
 * 1. Try requested language
 * 2. Fall back to English if not found
 * 3. Return translation key as-is if still not found
 *
 * @remarks
 * - Never throws errors; always returns a string
 * - Logs warnings for missing translations to aid debugging
 * - Uses in-memory cache for performance
 */
export function getEmailTranslation(
  key: string,
  language: SupportedLanguage,
  variables?: EmailTranslationVariables
): string {
  // Validate key parameter
  if (!key || key.trim() === '') {
    console.warn('[email-translations] Empty translation key provided');
    return '';
  }

  // Load translations for requested language
  const translations = loadTranslations(language);

  // Try to resolve the key in requested language
  let resolvedText: string | null = null;
  if (translations) {
    resolvedText = resolveTranslationKey(translations, key);
  }

  // If not found and language is not English, fall back to English
  if (!resolvedText && language !== 'en') {
    const englishTranslations = loadTranslations('en');
    if (englishTranslations) {
      resolvedText = resolveTranslationKey(englishTranslations, key);
    }
  }

  // If still not found, log warning and return key as last resort
  if (!resolvedText) {
    console.warn(
      `[email-translations] Translation not found for key '${key}' in language '${language}'`
    );
    return key;
  }

  // Interpolate variables if provided
  const finalText = interpolateVariables(resolvedText, variables);

  return finalText;
}

// ============================================================================
// Helper functions for common patterns
// ============================================================================

/**
 * Get email subject line for a specific email type
 *
 * Convenience wrapper that simplifies getting subject lines for standard email templates.
 *
 * @param emailType - The type of email (accessApproval, accessDenial, etc.)
 * @param language - Target language code
 * @param variables - Optional variables for interpolation
 * @returns The translated subject line
 *
 * @example
 * ```typescript
 * const subject = getEmailSubject('accessApproval', 'fr', { accountName: 'MyAccount' });
 * // Returns: "Accès Accordé: MyAccount - Votre Code d'Accès"
 * ```
 */
export function getEmailSubject(
  emailType: 'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder',
  language: SupportedLanguage,
  variables?: EmailTranslationVariables
): string {
  return getEmailTranslation(`${emailType}.subject`, language, variables);
}

/**
 * Get email greeting with name for a specific email type
 *
 * Convenience wrapper that simplifies getting personalized greetings.
 *
 * @param emailType - The type of email (accessApproval, accessDenial, etc.)
 * @param language - Target language code
 * @param name - The recipient's name to include in the greeting
 * @returns The translated greeting with name
 *
 * @example
 * ```typescript
 * const greeting = getEmailGreeting('accessApproval', 'es', 'María');
 * // Returns: "Hola María,"
 * ```
 */
export function getEmailGreeting(
  emailType: 'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder',
  language: SupportedLanguage,
  name: string
): string {
  return getEmailTranslation(`${emailType}.greeting`, language, { name });
}

/**
 * Get common email footer in the requested language
 *
 * Returns the standard footer text used across all email templates.
 *
 * @param language - Target language code
 * @returns The translated footer text
 *
 * @example
 * ```typescript
 * const footer = getEmailFooter('de');
 * // Returns: "Mit freundlichen Grüßen,\nDas FAQBNB Team"
 * ```
 */
export function getEmailFooter(language: SupportedLanguage): string {
  return getEmailTranslation('common.footer', language);
}

/**
 * Preload all email translations into cache
 *
 * Warms up the translation cache by loading all supported languages at application startup.
 * This reduces first-request latency by ensuring translations are already in memory.
 *
 * Call this function during server initialization or API route setup, ideally in production
 * environments where startup time is less critical than runtime performance.
 *
 * @remarks
 * - Loads translations for all 6 supported languages
 * - Errors are logged but don't prevent other languages from loading
 * - Safe to call multiple times (already-loaded languages are served from cache)
 *
 * @example
 * ```typescript
 * // In server startup or API route initialization
 * if (process.env.NODE_ENV === 'production') {
 *   preloadEmailTranslations();
 * }
 * ```
 */
export function preloadEmailTranslations(): void {
  // Array of all supported languages
  const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

  // Load each language with error handling
  languages.forEach((lang) => {
    try {
      loadTranslations(lang);
    } catch (error) {
      console.error(`[email-translations] Failed to preload translations for ${lang}:`, error);
    }
  });
}
