import { getRequestConfig } from 'next-intl/server';

// Supported locales for the application
// Must match the locale files in /messages/ directory
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type Locale = (typeof locales)[number];

// Default locale (source language for translations)
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // This function is called for every request
  // requestLocale comes from the routing configuration or middleware
  let locale = await requestLocale;

  // Validate locale and fallback to default if invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    // Dynamically import the appropriate message file
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
