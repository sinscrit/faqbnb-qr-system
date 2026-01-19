/**
 * i18n Configuration for next-intl
 *
 * This file provides the getRequestConfig function required by next-intl
 * for server-side locale detection and message loading.
 *
 * Note: The IntlProvider wrapper in layout.tsx uses its own manual locale
 * detection due to Next.js 15 build worker compatibility considerations.
 * This file satisfies next-intl's build-time requirements.
 *
 * REQ-232: IntlProvider wrapper configuration
 * Last Modified: 2026-01-18
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

// Supported locales - keep in sync with layout.tsx and src/lib/i18n/config.ts
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Detect locale from request headers and cookies
 * Detection chain: cookie > Accept-Language header > default locale
 */
async function getLocaleFromRequest(): Promise<Locale> {
  try {
    // 1. Check cookie first (user preference)
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      return cookieLocale as Locale;
    }

    // 2. Check Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');

    if (acceptLanguage) {
      // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en;q=0.8")
      const preferredLocales = acceptLanguage
        .split(',')
        .map(lang => {
          const [locale] = lang.trim().split(';');
          return locale.split('-')[0].toLowerCase();
        });

      // Find first matching supported locale
      for (const preferred of preferredLocales) {
        if (locales.includes(preferred as Locale)) {
          return preferred as Locale;
        }
      }
    }
  } catch {
    // Headers/cookies not available during static generation
    // This is expected behavior - fall through to default
  }

  return defaultLocale;
}

/**
 * next-intl request configuration
 * This is called on each request to determine the locale and load messages
 */
export default getRequestConfig(async () => {
  const locale = await getLocaleFromRequest();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
