import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Temporarily disabled due to 404 errors
import { AuthPageProviderBoundary } from "@/components/auth/AuthPageProviderBoundary";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import "./globals.css";

// Force dynamic rendering for next-intl
export const dynamic = 'force-dynamic';

/**
 * Root Layout with IntlProvider Wrapper
 *
 * This layout wraps the entire application with NextIntlClientProvider
 * to enable translation functionality via useTranslations hook.
 *
 * REQ-232: IntlProvider wrapper integration
 * REQ-250: LocaleProvider integration for locale state management
 * Last Modified: 2026-01-18
 */

// Temporarily using system fonts to prevent 404 flickering errors
const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

const jetbrainsMono = {
  variable: "--font-jetbrains-mono",
  className: "font-mono",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.app');
  const locale = await getLocale();

  return {
    metadataBase: new URL(
      process.env.NODE_ENV === 'production'
        ? 'https://faqbnb.com'
        : 'http://localhost:3000'
    ),
    title: {
      default: `${t('name')} - ${t('tagline')}`,
      template: '%s',
    },
    description: t('defaultDescription'),
    openGraph: {
      locale: locale,
      siteName: t('name'),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthPageProviderBoundary>{children}</AuthPageProviderBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
