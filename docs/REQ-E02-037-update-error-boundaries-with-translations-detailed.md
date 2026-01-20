# Detailed Task Breakdown: REQ-E02-037 - Update Error Boundaries with Translations

**Document Created:** 2026-01-20 23:45:00 UTC
**Last Modified:** 2026-01-20 23:45:00 UTC
**Request ID:** REQ-E02-037
**Phase:** 2J (Error Messages & Validation)
**Task:** 2J.6
**Size:** M (Medium)
**Priority:** P1 - High (Critical user experience during error states)

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating all React error boundary components in the FAQBNB application to display translated error messages using the next-intl internationalization system. The implementation covers three existing error-related files and the creation of translation keys for all six supported languages.

---

## Prerequisites Checklist

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| next-intl package installed | ✅ Required | From Epic 1 |
| NextIntlClientProvider configured | ✅ Required | In `/src/app/layout.tsx` |
| `/messages/*.json` files exist | ✅ Required | en, fr, es, de, nl, it |
| `errors` namespace exists | ✅ Exists | Needs expansion for boundary messages |
| useTranslations hook available | ✅ Available | From next-intl |
| getTranslations function available | ✅ Available | From next-intl/server |

---

## Files To Modify

| File Path | Type | Modification Type |
|-----------|------|-------------------|
| `/messages/en.json` | Translation | Add `errors.boundary`, `errors.notFound`, `errors.global` keys |
| `/messages/fr.json` | Translation | Add translated error boundary keys |
| `/messages/es.json` | Translation | Add translated error boundary keys |
| `/messages/de.json` | Translation | Add translated error boundary keys |
| `/messages/nl.json` | Translation | Add translated error boundary keys |
| `/messages/it.json` | Translation | Add translated error boundary keys |
| `/src/app/error.tsx` | Component | Add useTranslations, replace 4 hardcoded strings |
| `/src/app/global-error.tsx` | Component | Add fallback translation mechanism, replace 4 hardcoded strings |
| `/src/app/item/[publicId]/not-found.tsx` | Component | Convert to async server component, add getTranslations |

## Files To Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/not-found.tsx` | Root-level not-found page with translations |

---

## Detailed Task Breakdown

### TASK 1: Expand Errors Namespace with Error Boundary Messages (English)

**File:** `/messages/en.json`
**Estimated Effort:** 20 minutes
**Dependencies:** None

#### Description
Add error boundary-specific translation keys to the existing `errors` namespace in the English messages file.

#### Current State Analysis
The current `errors` namespace (lines 103-120) contains generic error messages but lacks:
- Error boundary titles and messages
- Not-found page strings
- Global error fallback messages
- Recovery action labels

#### Implementation Steps

**Step 1.1:** Open `/messages/en.json` and locate the `errors` object (around line 103).

**Step 1.2:** Replace the existing `errors` object with the expanded version:

```json
"errors": {
  "required": "This field is required",
  "invalidEmail": "Invalid email address",
  "networkError": "Network error. Please try again.",
  "unauthorized": "You are not authorized to perform this action",
  "notFound": "The requested resource was not found",
  "serverError": "Server error. Please try again later.",
  "validationFailed": "Validation failed. Please check your input.",
  "sessionExpired": "Your session has expired. Please sign in again.",
  "tooManyRequests": "Too many requests. Please wait a moment.",
  "invalidCredentials": "Invalid email or password",
  "emailTaken": "This email is already registered",
  "passwordTooWeak": "Password must be at least 8 characters",
  "uploadFailed": "Upload failed. Please try again.",
  "fileTooLarge": "File is too large",
  "invalidFileType": "Invalid file type",
  "genericError": "Something went wrong. Please try again.",
  "boundary": {
    "title": "Something went wrong!",
    "message": "We apologize for the inconvenience. Our team has been notified of this error.",
    "errorId": "Error ID: {digest}",
    "tryAgain": "Try again",
    "goHome": "Go to Home",
    "refresh": "Refresh Page",
    "contactSupport": "Contact Support"
  },
  "notFoundPage": {
    "title": "Page Not Found",
    "itemTitle": "Item Not Found",
    "itemMessage": "The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again.",
    "pageMessage": "The page you're looking for doesn't exist or may have been moved.",
    "goBack": "Go Back",
    "goBackDemo": "Go Back (Demo Mode)",
    "returnHome": "Return Home",
    "helpText": "If you believe this is an error, please contact support."
  },
  "global": {
    "title": "Application Error",
    "message": "A critical error occurred. Please try refreshing the page.",
    "tryAgain": "Try Again"
  }
}
```

#### Verification Steps
- [ ] JSON file parses without syntax errors
- [ ] All new keys follow the established naming convention
- [ ] Variable placeholders use correct ICU format `{variableName}`

---

### TASK 2: Update Page-Level Error Boundary with Translations

**File:** `/src/app/error.tsx`
**Estimated Effort:** 15 minutes
**Dependencies:** TASK 1

#### Description
Update the page-level error boundary to use `useTranslations` hook for all user-facing strings while maintaining Sentry error logging.

#### Current State Analysis
The file (47 lines) contains 4 hardcoded English strings:
- Line 27: `"Something went wrong!"`
- Line 30: `"We apologize for the inconvenience. Our team has been notified of this error."`
- Line 34: `"Error ID: {error.digest}"` (partially dynamic)
- Line 40: `"Try again"`

#### Implementation Steps

**Step 2.1:** Add the `useTranslations` import at line 8:

```typescript
import { useTranslations } from 'next-intl';
```

**Step 2.2:** Add the translation hook inside the component function at line 18 (before the useEffect):

```typescript
const t = useTranslations('errors.boundary');
```

**Step 2.3:** Replace line 27 (h2 content):
```typescript
// Before
Something went wrong!

// After
{t('title')}
```

**Step 2.4:** Replace line 30 (p content):
```typescript
// Before
We apologize for the inconvenience. Our team has been notified of this error.

// After
{t('message')}
```

**Step 2.5:** Replace line 34 (error ID paragraph):
```typescript
// Before
Error ID: {error.digest}

// After
{t('errorId', { digest: error.digest })}
```

**Step 2.6:** Replace line 40 (button content):
```typescript
// Before
Try again

// After
{t('tryAgain')}
```

**Step 2.7:** Add accessibility attributes to the container div:
```typescript
<div
  role="alert"
  aria-live="assertive"
  className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg"
>
```

#### Complete Updated File
```typescript
"use client";

// Error Page for Next.js App Router
// This catches errors in page components and displays a fallback UI
// Sentry will automatically capture these errors
// Last Modified: 2026-01-20

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.boundary');

  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-5">
      <div
        role="alert"
        aria-live="assertive"
        className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg"
      >
        <h2 className="text-red-500 mb-4 text-2xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {t('message')}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            {t('errorId', { digest: error.digest })}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  );
}
```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] Component renders correctly in development
- [ ] Sentry error logging continues to function
- [ ] Reset button functionality preserved

---

### TASK 3: Update Global Error Boundary with Fallback Strategy

**File:** `/src/app/global-error.tsx`
**Estimated Effort:** 45 minutes
**Dependencies:** TASK 1

#### Description
Update the global error boundary with a robust fallback translation mechanism. This component cannot use `useTranslations` directly since it renders outside the `NextIntlClientProvider` context and must handle scenarios where the i18n system itself may have failed.

#### Current State Analysis
The file (89 lines) contains 4 hardcoded English strings:
- Line 49: `"Something went wrong!"`
- Line 56: `"We apologize for the inconvenience. Our team has been notified of this error."`
- Line 65: `"Error ID: {error.digest}"` (partially dynamic)
- Line 81: `"Try again"`

The component:
- Uses inline styles (not Tailwind) - this must be preserved
- Renders its own `<html>` and `<body>` tags
- Cannot rely on any context providers

#### Implementation Steps

**Step 3.1:** Add the fallback translations object after imports (around line 10):

```typescript
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
```

**Step 3.2:** Add the locale detection utility function (after the FALLBACK_MESSAGES):

```typescript
function getPreferredLocale(): SupportedLocale {
  // Try to get locale from cookie or navigator
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
```

**Step 3.3:** Add state import and locale state management inside the component:

```typescript
import { useEffect, useState } from "react";

// Inside the component:
const [locale, setLocale] = useState<SupportedLocale>('en');

useEffect(() => {
  setLocale(getPreferredLocale());
}, []);
```

**Step 3.4:** Add the getMessage helper function inside the component:

```typescript
const getMessage = (key: keyof typeof FALLBACK_MESSAGES) => {
  return FALLBACK_MESSAGES[key][locale] || FALLBACK_MESSAGES[key]['en'];
};
```

**Step 3.5:** Update the html tag to include lang attribute:
```typescript
<html lang={locale}>
```

**Step 3.6:** Replace the 4 hardcoded strings with getMessage calls:
- Line 49: `{getMessage('title')}`
- Line 56: `{getMessage('message')}`
- Line 65: `{getMessage('errorId')} {error.digest}`
- Line 81: `{getMessage('tryAgain')}`

**Step 3.7:** Add ARIA attributes for accessibility:
```typescript
<div
  role="alert"
  aria-live="assertive"
  style={{...}}
>
```

#### Complete Updated File
```typescript
"use client";

// Global Error Page for Next.js App Router
// This catches errors in the root layout and displays a fallback UI
// Sentry will automatically capture these errors
// Last Modified: 2026-01-20

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
```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] Inline styles preserved (no Tailwind)
- [ ] HTML lang attribute updates based on detected locale
- [ ] Fallback to English works when locale detection fails
- [ ] Sentry error logging continues to function
- [ ] Reset button functionality preserved

---

### TASK 4: Update Item Not-Found Page with Translations

**File:** `/src/app/item/[publicId]/not-found.tsx`
**Estimated Effort:** 20 minutes
**Dependencies:** TASK 1

#### Description
Convert the item not-found page to an async server component using `getTranslations` from next-intl/server.

#### Current State Analysis
The file (54 lines) contains 5 hardcoded English strings:
- Line 17: `"Item Not Found"`
- Lines 20-22: `"The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again."`
- Line 32: `"Go Back (Demo Mode)"`
- Line 39: `"Return Home"`
- Line 46: `"If you believe this is an error, please contact support."`

#### Implementation Steps

**Step 4.1:** Add the async keyword to the function and import getTranslations:

```typescript
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors.notFoundPage');
```

**Step 4.2:** Add the Home icon import for the return home button:
```typescript
import { Search, ArrowLeft, Home } from 'lucide-react';
```

**Step 4.3:** Replace line 17 (h1 content):
```typescript
{t('itemTitle')}
```

**Step 4.4:** Replace lines 20-22 (p content):
```typescript
{t('itemMessage')}
```

**Step 4.5:** Replace line 32 (disabled button content):
```typescript
{t('goBackDemo')}
```

**Step 4.6:** Replace line 39 (Link content):
```typescript
<Home className="w-4 h-4 mr-2" />
{t('returnHome')}
```

**Step 4.7:** Replace line 46 (help text):
```typescript
{t('helpText')}
```

#### Complete Updated File
```typescript
import Link from 'next/link';
import { Search, ArrowLeft, Home } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors.notFoundPage');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('itemTitle')}
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {t('itemMessage')}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
            disabled
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('goBackDemo')}
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            {t('returnHome')}
          </Link>
        </div>

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {t('helpText')}
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] Page renders as async server component
- [ ] Translations display correctly
- [ ] Navigation links work properly

---

### TASK 5: Create Root-Level Not-Found Page

**File:** `/src/app/not-found.tsx` (NEW FILE)
**Estimated Effort:** 15 minutes
**Dependencies:** TASK 1

#### Description
Create an application-level not-found page with translations that handles any 404 routes not caught by more specific not-found pages.

#### Implementation Steps

**Step 5.1:** Create the new file `/src/app/not-found.tsx` with the following content:

```typescript
import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors.notFoundPage');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {t('pageMessage')}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            {t('returnHome')}
          </Link>
        </div>

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {t('helpText')}
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### Verification Steps
- [ ] File compiles without TypeScript errors
- [ ] Navigating to non-existent route shows translated 404 page
- [ ] Return Home link works correctly

---

### TASK 6: Generate Translations for Non-English Languages

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimated Effort:** 45 minutes
**Dependencies:** TASK 1

#### Description
Add the error boundary translations to all five non-English language files.

#### Implementation Steps

**Step 6.1:** Add French translations to `/messages/fr.json`:

```json
"errors": {
  "required": "Ce champ est obligatoire",
  "invalidEmail": "Adresse e-mail invalide",
  "networkError": "Erreur réseau. Veuillez réessayer.",
  "unauthorized": "Vous n'êtes pas autorisé à effectuer cette action",
  "notFound": "La ressource demandée est introuvable",
  "serverError": "Erreur du serveur. Veuillez réessayer plus tard.",
  "validationFailed": "Validation échouée. Veuillez vérifier vos données.",
  "sessionExpired": "Votre session a expiré. Veuillez vous reconnecter.",
  "tooManyRequests": "Trop de requêtes. Veuillez patienter un moment.",
  "invalidCredentials": "E-mail ou mot de passe invalide",
  "emailTaken": "Cet e-mail est déjà enregistré",
  "passwordTooWeak": "Le mot de passe doit contenir au moins 8 caractères",
  "uploadFailed": "Échec du téléchargement. Veuillez réessayer.",
  "fileTooLarge": "Le fichier est trop volumineux",
  "invalidFileType": "Type de fichier invalide",
  "genericError": "Une erreur s'est produite. Veuillez réessayer.",
  "boundary": {
    "title": "Une erreur s'est produite !",
    "message": "Nous nous excusons pour ce désagrément. Notre équipe a été informée de cette erreur.",
    "errorId": "ID d'erreur : {digest}",
    "tryAgain": "Réessayer",
    "goHome": "Aller à l'accueil",
    "refresh": "Actualiser la page",
    "contactSupport": "Contacter le support"
  },
  "notFoundPage": {
    "title": "Page introuvable",
    "itemTitle": "Article introuvable",
    "itemMessage": "L'article que vous recherchez n'existe pas ou a été supprimé. Veuillez vérifier le code QR et réessayer.",
    "pageMessage": "La page que vous recherchez n'existe pas ou a été déplacée.",
    "goBack": "Retour",
    "goBackDemo": "Retour (Mode Démo)",
    "returnHome": "Retour à l'accueil",
    "helpText": "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support."
  },
  "global": {
    "title": "Erreur d'application",
    "message": "Une erreur critique s'est produite. Veuillez actualiser la page.",
    "tryAgain": "Réessayer"
  }
}
```

**Step 6.2:** Add Spanish translations to `/messages/es.json`:

```json
"errors": {
  "required": "Este campo es obligatorio",
  "invalidEmail": "Dirección de correo electrónico no válida",
  "networkError": "Error de red. Por favor, inténtelo de nuevo.",
  "unauthorized": "No está autorizado para realizar esta acción",
  "notFound": "No se encontró el recurso solicitado",
  "serverError": "Error del servidor. Por favor, inténtelo más tarde.",
  "validationFailed": "La validación falló. Por favor, revise sus datos.",
  "sessionExpired": "Su sesión ha expirado. Por favor, inicie sesión de nuevo.",
  "tooManyRequests": "Demasiadas solicitudes. Por favor, espere un momento.",
  "invalidCredentials": "Correo electrónico o contraseña no válidos",
  "emailTaken": "Este correo electrónico ya está registrado",
  "passwordTooWeak": "La contraseña debe tener al menos 8 caracteres",
  "uploadFailed": "Error en la carga. Por favor, inténtelo de nuevo.",
  "fileTooLarge": "El archivo es demasiado grande",
  "invalidFileType": "Tipo de archivo no válido",
  "genericError": "Algo salió mal. Por favor, inténtelo de nuevo.",
  "boundary": {
    "title": "¡Algo salió mal!",
    "message": "Nos disculpamos por las molestias. Nuestro equipo ha sido notificado de este error.",
    "errorId": "ID de error: {digest}",
    "tryAgain": "Intentar de nuevo",
    "goHome": "Ir al inicio",
    "refresh": "Actualizar página",
    "contactSupport": "Contactar soporte"
  },
  "notFoundPage": {
    "title": "Página no encontrada",
    "itemTitle": "Artículo no encontrado",
    "itemMessage": "El artículo que busca no existe o ha sido eliminado. Por favor, verifique el código QR e inténtelo de nuevo.",
    "pageMessage": "La página que busca no existe o ha sido movida.",
    "goBack": "Volver",
    "goBackDemo": "Volver (Modo Demo)",
    "returnHome": "Volver al inicio",
    "helpText": "Si cree que esto es un error, por favor contacte al soporte."
  },
  "global": {
    "title": "Error de aplicación",
    "message": "Se produjo un error crítico. Por favor, actualice la página.",
    "tryAgain": "Intentar de nuevo"
  }
}
```

**Step 6.3:** Add German translations to `/messages/de.json`:

```json
"errors": {
  "required": "Dieses Feld ist erforderlich",
  "invalidEmail": "Ungültige E-Mail-Adresse",
  "networkError": "Netzwerkfehler. Bitte versuchen Sie es erneut.",
  "unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzuführen",
  "notFound": "Die angeforderte Ressource wurde nicht gefunden",
  "serverError": "Serverfehler. Bitte versuchen Sie es später erneut.",
  "validationFailed": "Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.",
  "sessionExpired": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
  "tooManyRequests": "Zu viele Anfragen. Bitte warten Sie einen Moment.",
  "invalidCredentials": "Ungültige E-Mail oder Passwort",
  "emailTaken": "Diese E-Mail ist bereits registriert",
  "passwordTooWeak": "Das Passwort muss mindestens 8 Zeichen lang sein",
  "uploadFailed": "Upload fehlgeschlagen. Bitte versuchen Sie es erneut.",
  "fileTooLarge": "Die Datei ist zu groß",
  "invalidFileType": "Ungültiger Dateityp",
  "genericError": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  "boundary": {
    "title": "Etwas ist schiefgelaufen!",
    "message": "Wir entschuldigen uns für die Unannehmlichkeiten. Unser Team wurde über diesen Fehler informiert.",
    "errorId": "Fehler-ID: {digest}",
    "tryAgain": "Erneut versuchen",
    "goHome": "Zur Startseite",
    "refresh": "Seite aktualisieren",
    "contactSupport": "Support kontaktieren"
  },
  "notFoundPage": {
    "title": "Seite nicht gefunden",
    "itemTitle": "Artikel nicht gefunden",
    "itemMessage": "Der gesuchte Artikel existiert nicht oder wurde entfernt. Bitte überprüfen Sie den QR-Code und versuchen Sie es erneut.",
    "pageMessage": "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    "goBack": "Zurück",
    "goBackDemo": "Zurück (Demo-Modus)",
    "returnHome": "Zur Startseite",
    "helpText": "Wenn Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte den Support."
  },
  "global": {
    "title": "Anwendungsfehler",
    "message": "Ein kritischer Fehler ist aufgetreten. Bitte aktualisieren Sie die Seite.",
    "tryAgain": "Erneut versuchen"
  }
}
```

**Step 6.4:** Add Dutch translations to `/messages/nl.json`:

```json
"errors": {
  "required": "Dit veld is verplicht",
  "invalidEmail": "Ongeldig e-mailadres",
  "networkError": "Netwerkfout. Probeer het opnieuw.",
  "unauthorized": "U bent niet gemachtigd om deze actie uit te voeren",
  "notFound": "De gevraagde bron is niet gevonden",
  "serverError": "Serverfout. Probeer het later opnieuw.",
  "validationFailed": "Validatie mislukt. Controleer uw invoer.",
  "sessionExpired": "Uw sessie is verlopen. Meld u opnieuw aan.",
  "tooManyRequests": "Te veel verzoeken. Wacht even.",
  "invalidCredentials": "Ongeldig e-mailadres of wachtwoord",
  "emailTaken": "Dit e-mailadres is al geregistreerd",
  "passwordTooWeak": "Het wachtwoord moet minimaal 8 tekens bevatten",
  "uploadFailed": "Upload mislukt. Probeer het opnieuw.",
  "fileTooLarge": "Het bestand is te groot",
  "invalidFileType": "Ongeldig bestandstype",
  "genericError": "Er is iets misgegaan. Probeer het opnieuw.",
  "boundary": {
    "title": "Er is iets misgegaan!",
    "message": "Onze excuses voor het ongemak. Ons team is op de hoogte gesteld van deze fout.",
    "errorId": "Fout-ID: {digest}",
    "tryAgain": "Opnieuw proberen",
    "goHome": "Naar startpagina",
    "refresh": "Pagina vernieuwen",
    "contactSupport": "Contact opnemen met support"
  },
  "notFoundPage": {
    "title": "Pagina niet gevonden",
    "itemTitle": "Item niet gevonden",
    "itemMessage": "Het item dat u zoekt bestaat niet of is verwijderd. Controleer de QR-code en probeer het opnieuw.",
    "pageMessage": "De pagina die u zoekt bestaat niet of is verplaatst.",
    "goBack": "Terug",
    "goBackDemo": "Terug (Demo-modus)",
    "returnHome": "Terug naar startpagina",
    "helpText": "Als u denkt dat dit een fout is, neem dan contact op met de support."
  },
  "global": {
    "title": "Applicatiefout",
    "message": "Er is een kritieke fout opgetreden. Vernieuw de pagina.",
    "tryAgain": "Opnieuw proberen"
  }
}
```

**Step 6.5:** Add Italian translations to `/messages/it.json`:

```json
"errors": {
  "required": "Questo campo è obbligatorio",
  "invalidEmail": "Indirizzo email non valido",
  "networkError": "Errore di rete. Riprova.",
  "unauthorized": "Non sei autorizzato a eseguire questa azione",
  "notFound": "La risorsa richiesta non è stata trovata",
  "serverError": "Errore del server. Riprova più tardi.",
  "validationFailed": "Validazione fallita. Controlla i tuoi dati.",
  "sessionExpired": "La tua sessione è scaduta. Accedi di nuovo.",
  "tooManyRequests": "Troppe richieste. Attendi un momento.",
  "invalidCredentials": "Email o password non validi",
  "emailTaken": "Questa email è già registrata",
  "passwordTooWeak": "La password deve contenere almeno 8 caratteri",
  "uploadFailed": "Caricamento fallito. Riprova.",
  "fileTooLarge": "Il file è troppo grande",
  "invalidFileType": "Tipo di file non valido",
  "genericError": "Qualcosa è andato storto. Riprova.",
  "boundary": {
    "title": "Qualcosa è andato storto!",
    "message": "Ci scusiamo per l'inconveniente. Il nostro team è stato avvisato di questo errore.",
    "errorId": "ID errore: {digest}",
    "tryAgain": "Riprova",
    "goHome": "Vai alla home",
    "refresh": "Aggiorna pagina",
    "contactSupport": "Contatta il supporto"
  },
  "notFoundPage": {
    "title": "Pagina non trovata",
    "itemTitle": "Articolo non trovato",
    "itemMessage": "L'articolo che stai cercando non esiste o è stato rimosso. Controlla il codice QR e riprova.",
    "pageMessage": "La pagina che stai cercando non esiste o è stata spostata.",
    "goBack": "Indietro",
    "goBackDemo": "Indietro (Modalità Demo)",
    "returnHome": "Torna alla home",
    "helpText": "Se ritieni che questo sia un errore, contatta il supporto."
  },
  "global": {
    "title": "Errore dell'applicazione",
    "message": "Si è verificato un errore critico. Aggiorna la pagina.",
    "tryAgain": "Riprova"
  }
}
```

#### Verification Steps
- [ ] All 5 language files parse without JSON syntax errors
- [ ] Key structure matches English file exactly
- [ ] No missing keys in any language file
- [ ] Translations are contextually appropriate

---

### TASK 7: Test Error Boundaries in All Languages

**Estimated Effort:** 30 minutes
**Dependencies:** TASKS 1-6

#### Description
Verify that all error boundaries display correctly in all 6 supported languages.

#### Test Cases

**Test 7.1: Page-Level Error Boundary**
1. Set language preference to each language (en, fr, es, de, nl, it)
2. Trigger a page-level error (e.g., throw error in component)
3. Verify error title displays in selected language
4. Verify error message displays in selected language
5. Verify "Try again" button label displays in selected language
6. Click reset button and verify it functions correctly
7. Check browser console for Sentry error capture

**Test 7.2: Global Error Boundary**
1. For each language:
   - Set NEXT_LOCALE cookie to language code
   - Trigger a global error (e.g., error in root layout)
   - Verify error screen displays in correct language
   - Verify fallback to English if cookie/navigator detection fails
2. Test with no cookie and English browser - should default to English
3. Test with French browser language - should display French

**Test 7.3: Item Not-Found Page**
1. Set language preference to each language
2. Navigate to `/item/nonexistent-id`
3. Verify "Item Not Found" title displays in selected language
4. Verify error message displays in selected language
5. Verify button labels display in selected language
6. Click "Return Home" and verify navigation works

**Test 7.4: Root Not-Found Page**
1. Set language preference to each language
2. Navigate to a non-existent route (e.g., `/this-page-does-not-exist`)
3. Verify "Page Not Found" title displays in selected language
4. Verify error message displays in selected language
5. Verify "Return Home" button displays in selected language

**Test 7.5: Accessibility Testing**
1. Use screen reader to navigate error boundary
2. Verify ARIA role="alert" is announced
3. Verify all button labels are read correctly
4. Test keyboard navigation (Tab, Enter)

#### Verification Checklist
- [ ] Page error boundary works in all 6 languages
- [ ] Global error boundary fallback works in all 6 languages
- [ ] Item not-found page works in all 6 languages
- [ ] Root not-found page works in all 6 languages
- [ ] Reset/retry buttons function correctly in all scenarios
- [ ] Sentry logging continues to work
- [ ] Accessibility features function correctly

---

## Implementation Summary

### Files Modified
| File | Changes |
|------|---------|
| `/messages/en.json` | Added `errors.boundary`, `errors.notFoundPage`, `errors.global` |
| `/messages/fr.json` | Added translated error boundary keys |
| `/messages/es.json` | Added translated error boundary keys |
| `/messages/de.json` | Added translated error boundary keys |
| `/messages/nl.json` | Added translated error boundary keys |
| `/messages/it.json` | Added translated error boundary keys |
| `/src/app/error.tsx` | Added useTranslations, replaced 4 hardcoded strings, added ARIA |
| `/src/app/global-error.tsx` | Added fallback translations, locale detection, ARIA |
| `/src/app/item/[publicId]/not-found.tsx` | Converted to async, added getTranslations |

### Files Created
| File | Purpose |
|------|---------|
| `/src/app/not-found.tsx` | Root-level translated 404 page |

### Total Estimated Effort
| Task | Effort |
|------|--------|
| TASK 1: English translations | 20 min |
| TASK 2: Page error boundary | 15 min |
| TASK 3: Global error boundary | 45 min |
| TASK 4: Item not-found page | 20 min |
| TASK 5: Root not-found page | 15 min |
| TASK 6: Non-English translations | 45 min |
| TASK 7: Testing | 30 min |
| **Total** | **~3 hours** |

---

## Acceptance Criteria Verification

| Criteria | Task | Status |
|----------|------|--------|
| All error boundary components identified | Analysis | ✅ Documented |
| Root application error boundary uses translations | TASK 3 | Pending |
| Page-level error boundaries use translations | TASK 2 | Pending |
| Error boundaries access current language context | TASK 2, 3 | Pending |
| Primary error messages translated for all 6 languages | TASK 1, 6 | Pending |
| Secondary explanatory messages translated | TASK 1, 6 | Pending |
| Button labels translated | TASK 1, 6 | Pending |
| Error boundaries handle translation system failures | TASK 3 | Pending |
| Error message tone is appropriate | TASK 6 | Pending |
| Visual styling consistent across languages | All | Pending |
| Error logging continues correctly | TASK 2, 3 | Pending |
| Testing in all 6 languages | TASK 7 | Pending |
| Accessibility features | TASK 2, 3 | Pending |
| Recovery actions function correctly | TASK 7 | Pending |

---

## References

- [Overview Document](/docs/REQ-E02-037-update-error-boundaries-with-translations-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Requirements: gen_requests_epic2.md](/docs/gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
