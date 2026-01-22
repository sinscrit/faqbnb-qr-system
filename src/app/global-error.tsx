"use client";

// Global Error Page for Next.js App Router
// This catches errors in the root layout and displays a fallback UI
// Sentry will automatically capture these errors
// Last Modified: 2026-01-22

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

// Fallback messages in all supported languages for when i18n is unavailable
const FALLBACK_MESSAGES = {
  title: {
    en: "Something went wrong!",
    fr: "Une erreur s'est produite !",
    es: "¡Algo salió mal!",
    de: "Etwas ist schiefgelaufen!",
    nl: "Er is iets misgegaan!",
    it: "Qualcosa è andato storto!"
  },
  message: {
    en: "We apologize for the inconvenience. Our team has been notified.",
    fr: "Nous nous excusons pour ce désagrément. Notre équipe a été informée.",
    es: "Nos disculpamos por las molestias. Nuestro equipo ha sido notificado.",
    de: "Wir entschuldigen uns für die Unannehmlichkeiten. Unser Team wurde benachrichtigt.",
    nl: "Onze excuses voor het ongemak. Ons team is op de hoogte gesteld.",
    it: "Ci scusiamo per l'inconveniente. Il nostro team è stato avvisato."
  },
  errorId: {
    en: "Error ID:",
    fr: "ID d'erreur :",
    es: "ID de error:",
    de: "Fehler-ID:",
    nl: "Fout-ID:",
    it: "ID errore:"
  },
  tryAgain: {
    en: "Try again",
    fr: "Réessayer",
    es: "Intentar de nuevo",
    de: "Erneut versuchen",
    nl: "Opnieuw proberen",
    it: "Riprova"
  }
} as const;

type SupportedLocale = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

function getPreferredLocale(): SupportedLocale {
  if (typeof document !== 'undefined') {
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=(\w{2})/);
    if (cookieMatch && cookieMatch[1] in FALLBACK_MESSAGES.title) {
      return cookieMatch[1] as SupportedLocale;
    }
  }
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang in FALLBACK_MESSAGES.title) {
      return browserLang as SupportedLocale;
    }
  }
  return 'en';
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<SupportedLocale>('en');

  useEffect(() => {
    setLocale(getPreferredLocale());
  }, []);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const getMessage = (key: keyof typeof FALLBACK_MESSAGES) => {
    return FALLBACK_MESSAGES[key][locale] || FALLBACK_MESSAGES[key]['en'];
  };

  return (
    <html lang={locale}>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f8f9fa',
        }}>
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              maxWidth: '500px',
            }}
          >
            <h1 style={{
              color: '#dc3545',
              marginBottom: '16px',
              fontSize: '24px',
            }}>
              {getMessage('title')}
            </h1>
            <p style={{
              color: '#6c757d',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              {getMessage('message')}
            </p>
            {error.digest && (
              <p style={{
                fontSize: '12px',
                color: '#adb5bd',
                marginBottom: '16px',
                fontFamily: 'monospace',
              }}>
                {getMessage('errorId')} {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              {getMessage('tryAgain')}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
