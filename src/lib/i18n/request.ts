/**
 * Server-Side Locale Detection
 *
 * Provides the getRequestConfig function required by next-intl for
 * server-side locale detection and message loading.
 *
 * Detection Priority:
 * 1. FAQBNB_LANG cookie (persisted preference)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale ('en')
 *
 * Note: User database preference syncing is handled by middleware (Task 5.2)
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-18
 * @lastModified 2026-01-18
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import {
  defaultLocale,
  isValidLocale,
  normalizeLocale,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from './config';

/**
 * Parse Accept-Language header and find the best matching locale
 *
 * Parses the standard Accept-Language header format:
 * "en-US,en;q=0.9,fr;q=0.8" -> sorted by quality value
 *
 * @param acceptLanguage - The Accept-Language header value
 * @returns The best matching supported locale or null if none found
 */
export function parseAcceptLanguage(acceptLanguage: string | null): SupportedLocale | null {
  if (!acceptLanguage) {
    return null;
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fr;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .filter(({ quality }) => !isNaN(quality))
    .sort((a, b) => b.quality - a.quality);

  // Find the first matching supported locale
  for (const { code } of languages) {
    const baseCode = code.split('-')[0]?.toLowerCase();
    if (baseCode && isValidLocale(baseCode)) {
      return normalizeLocale(code);
    }
  }

  return null;
}

/**
 * Detect the locale from the current request
 *
 * Priority order:
 * 1. Cookie (FAQBNB_LANG) - persisted preference
 * 2. Accept-Language header - browser preference
 * 3. Default locale - fallback
 *
 * Note: User database preference is not checked here as it requires
 * database access. The middleware (Task 5.2) will handle syncing
 * the user's database preference to the cookie.
 *
 * @returns The detected locale
 */
export async function detectLocale(): Promise<SupportedLocale> {
  // Priority 1: Check cookie for stored preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // Priority 2: Parse Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('Accept-Language');
  const browserLocale = parseAcceptLanguage(acceptLanguage);

  if (browserLocale) {
    return browserLocale;
  }

  // Priority 3: Return default locale
  return defaultLocale;
}

/**
 * Get the current locale from the request
 * Alias for detectLocale for semantic clarity
 */
export async function getCurrentLocale(): Promise<SupportedLocale> {
  return detectLocale();
}

/**
 * next-intl request configuration
 *
 * This function is called by next-intl on each request to determine
 * the locale and load the appropriate messages.
 *
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#i18nts
 */
export default getRequestConfig(async () => {
  const locale = await detectLocale();

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
