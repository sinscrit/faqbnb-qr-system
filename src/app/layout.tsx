import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Temporarily disabled due to 404 errors
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { VersionFooter } from "@/components/VersionFooter";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

// Force dynamic rendering to avoid static generation issues with next-intl
// This is required because getLocale() and getMessages() need request context
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: "FAQBNB - QR Item Display System",
  description: "FAQBNB provides instant access to detailed guides, manuals, and resources for any appliance or item via QR codes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the detected locale from the request
  // This uses the locale detection chain: cookie > Accept-Language > default
  const locale = await getLocale();

  // Load all messages for the detected locale
  // Messages are loaded from /messages/{locale}.json
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <LocaleProvider>
              {children}
              <VersionFooter />
            </LocaleProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
