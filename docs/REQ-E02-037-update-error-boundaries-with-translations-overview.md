# Implementation Breakdown: REQ-E02-037 - Update Error Boundaries with Translations

**Document Created:** 2026-01-20 22:30:00 UTC
**Last Modified:** 2026-01-20 22:30:00 UTC
**Request ID:** REQ-E02-037
**Phase:** 2J (Error Messages & Validation)
**Task:** 2J.6
**Size:** M (Medium)
**Priority:** P1 - High (Critical user experience during error states)

---

## 1. Overview

### Summary

Update all React error boundary components in the FAQBNB application to display translated error messages, recovery instructions, and action buttons using the next-intl internationalization system. This ensures users encountering unexpected application errors see error recovery interfaces in their preferred language rather than hardcoded English strings.

### Background

The FAQBNB application currently has two primary error boundary files:

1. **`/src/app/error.tsx`** - Page-level error boundary catching errors in page components
2. **`/src/app/global-error.tsx`** - Root-level error boundary catching errors in the root layout

Both files contain hardcoded English strings:
- "Something went wrong!"
- "We apologize for the inconvenience. Our team has been notified of this error."
- "Error ID: {digest}"
- "Try again"

Additionally, a not-found page exists at `/src/app/item/[publicId]/not-found.tsx` with similar hardcoded strings that should also be updated for consistency.

When users have selected a non-English language and encounter an error, the error screen suddenly displays English text, breaking the localized experience and potentially confusing international users during an already frustrating moment.

### Business Value

- Maintains language consistency during error states, reinforcing trust in complete internationalization
- Improves error recovery success rates by providing clear, understandable instructions in the user's language
- Reduces support requests from international users confused by English error messages
- Demonstrates professional attention to quality in all user-facing scenarios
- Supports global expansion objectives by ensuring error handling is fully internationalized

### Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | ✅ Complete (Epic 1) |
| NextIntlClientProvider | `/src/app/layout.tsx` | ✅ Complete (Epic 1) |
| Translation files | `/messages/*.json` | ✅ Complete (Epic 1) |
| `useTranslations` hook | next-intl | ✅ Available |
| `errors` namespace | `/messages/en.json` | ✅ Exists (needs expansion for boundary messages) |
| Centralized error utility | `/src/lib/i18n/error-translations.ts` | 🔄 REQ-E02-035 (may be completed first) |

---

## 2. Technical Context

### Existing Error Boundary Implementation

**Page-Level Error Boundary (`/src/app/error.tsx`):**
```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-5">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
        <h2 className="text-red-500 mb-4 text-2xl font-semibold">
          Something went wrong!  {/* Hardcoded English */}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We apologize for the inconvenience...  {/* Hardcoded English */}
        </p>
        <button onClick={() => reset()}>
          Try again  {/* Hardcoded English */}
        </button>
      </div>
    </div>
  );
}
```

**Global Error Boundary (`/src/app/global-error.tsx`):**
- Similar structure but uses inline styles instead of Tailwind
- Renders its own `<html>` and `<body>` tags (required for global error handling)
- Cannot use NextIntlClientProvider context directly since it wraps even the layout

### Special Challenge: Global Error Boundary

The global error boundary (`global-error.tsx`) has a unique challenge:
- It must render its own `<html>` and `<body>` elements
- It cannot rely on the `NextIntlClientProvider` from the layout since global errors catch layout failures
- It needs a fallback strategy for translations when the i18n system may be unavailable

### Existing Translation Patterns

**Current `useTranslations` usage in components (`/src/components/LogoutButton.tsx`):**
```typescript
'use client';
import { useTranslations } from 'next-intl';

function ConfirmationModal({ ... }) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  return (
    <h3>{t('confirmLogout')}</h3>
    <button>{tCommon('cancel')}</button>
  );
}
```

**Current `errors` namespace (`/messages/en.json`):**
```json
{
  "errors": {
    "required": "This field is required",
    "networkError": "Network error. Please try again.",
    "serverError": "Server error. Please try again later.",
    "genericError": "Something went wrong. Please try again."
  }
}
```

### Integration Points

| Integration Point | Description |
|-------------------|-------------|
| Page-level error boundary | Uses `useTranslations` directly (within NextIntlClientProvider context) |
| Global error boundary | Requires fallback strategy since it's outside provider context |
| Not-found pages | Server components that can use `getTranslations` |
| Sentry integration | Error logging should continue unchanged |

---

## 3. Implementation Tasks

### Task 3.1: Expand Errors Namespace with Error Boundary Messages

**Files:** `/messages/en.json`, `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Description:** Add error boundary-specific translation keys to the `errors` namespace.

**Translation Keys to Add (`/messages/en.json`):**

```json
{
  "errors": {
    "boundary": {
      "title": "Something went wrong!",
      "message": "We apologize for the inconvenience. Our team has been notified of this error.",
      "errorId": "Error ID: {digest}",
      "tryAgain": "Try again",
      "goHome": "Go to Home",
      "refresh": "Refresh Page",
      "contactSupport": "Contact Support"
    },
    "notFound": {
      "title": "Page Not Found",
      "itemTitle": "Item Not Found",
      "itemMessage": "The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again.",
      "pageMessage": "The page you're looking for doesn't exist or may have been moved.",
      "goBack": "Go Back",
      "returnHome": "Return Home",
      "helpText": "If you believe this is an error, please contact support."
    },
    "global": {
      "title": "Application Error",
      "message": "A critical error occurred. Please try refreshing the page.",
      "tryAgain": "Try Again",
      "fallbackMessage": "Error / Erreur / Error / Fehler / Fout / Errore"
    }
  }
}
```

**Estimated Effort:** 1 hour (English + generate translations for 5 other languages)

---

### Task 3.2: Update Page-Level Error Boundary with Translations

**File:** `/src/app/error.tsx`

**Description:** Update the page-level error boundary to use `useTranslations` for all user-facing strings.

**Implementation:**

```typescript
"use client";

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
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
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

**Estimated Effort:** 30 minutes

---

### Task 3.3: Update Global Error Boundary with Fallback Strategy

**File:** `/src/app/global-error.tsx`

**Description:** Update the global error boundary with a robust fallback strategy for translations. Since global errors may occur before or during the loading of the i18n system, implement a multi-tiered approach.

**Implementation Strategy:**

The global error boundary requires special handling because:
1. It renders outside the `NextIntlClientProvider` context
2. The error may have been caused by the i18n system itself
3. It must provide understandable content even if translations fail

**Approach:** Use a try-catch wrapper with hardcoded multilingual fallback

```typescript
"use client";

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
  tryAgain: {
    en: "Try again",
    fr: "Réessayer",
    es: "Intentar de nuevo",
    de: "Erneut versuchen",
    nl: "Opnieuw proberen",
    it: "Riprova"
  }
};

type SupportedLocale = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

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
    // Report the error to Sentry
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
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
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
                Error ID: {error.digest}
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

**Estimated Effort:** 1-2 hours

---

### Task 3.4: Update Item Not-Found Page with Translations

**File:** `/src/app/item/[publicId]/not-found.tsx`

**Description:** Convert the item not-found page to use translations. Since this is a server component, use `getTranslations` from `next-intl/server`.

**Implementation:**

```typescript
import Link from 'next/link';
import { Search, ArrowLeft, Home } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors.notFound');

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
            {t('goBack')} (Demo Mode)
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

**Estimated Effort:** 30 minutes

---

### Task 3.5: Create Root-Level Not-Found Page (Optional)

**File:** `/src/app/not-found.tsx` (new file if doesn't exist)

**Description:** Create an application-level not-found page with translations if one doesn't already exist.

**Implementation:** Similar to Task 3.4, using `getTranslations('errors.notFound')` with appropriate keys.

**Estimated Effort:** 30 minutes

---

### Task 3.6: Generate Translations for Non-English Languages

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Description:** Generate translations for all new error boundary keys in the 5 non-English languages.

**French Example (`/messages/fr.json`):**
```json
{
  "errors": {
    "boundary": {
      "title": "Une erreur s'est produite !",
      "message": "Nous nous excusons pour ce désagrément. Notre équipe a été informée de cette erreur.",
      "errorId": "ID d'erreur : {digest}",
      "tryAgain": "Réessayer",
      "goHome": "Aller à l'accueil",
      "refresh": "Actualiser la page",
      "contactSupport": "Contacter le support"
    },
    "notFound": {
      "title": "Page introuvable",
      "itemTitle": "Article introuvable",
      "itemMessage": "L'article que vous recherchez n'existe pas ou a été supprimé. Veuillez vérifier le code QR et réessayer.",
      "pageMessage": "La page que vous recherchez n'existe pas ou a été déplacée.",
      "goBack": "Retour",
      "returnHome": "Retour à l'accueil",
      "helpText": "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support."
    },
    "global": {
      "title": "Erreur d'application",
      "message": "Une erreur critique s'est produite. Veuillez actualiser la page.",
      "tryAgain": "Réessayer"
    }
  }
}
```

**Estimated Effort:** 1-2 hours (for all 5 languages)

---

### Task 3.7: Add Accessibility Attributes

**Files:** `/src/app/error.tsx`, `/src/app/global-error.tsx`, `/src/app/item/[publicId]/not-found.tsx`

**Description:** Ensure error boundaries have proper ARIA attributes for accessibility.

**Implementation Details:**
- Add `role="alert"` to error message containers
- Add `aria-live="assertive"` for dynamic error messages
- Ensure button labels are descriptive
- Add appropriate `aria-label` attributes where needed

**Example:**
```typescript
<div
  role="alert"
  aria-live="assertive"
  className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg"
>
  <h2 aria-describedby="error-description">
    {t('title')}
  </h2>
  <p id="error-description">
    {t('message')}
  </p>
  <button aria-label={t('tryAgain')}>
    {t('tryAgain')}
  </button>
</div>
```

**Estimated Effort:** 30 minutes

---

### Task 3.8: Test Error Boundaries in All Languages

**Description:** Verify error boundaries display correctly in all 6 supported languages.

**Test Cases:**
1. Trigger page-level error in each language - verify translated content
2. Trigger global error (e.g., layout error) - verify fallback translations work
3. Navigate to non-existent item - verify not-found page translations
4. Switch languages while on error page - verify updates
5. Test error boundary when translation system fails - verify graceful fallback
6. Verify Sentry error logging continues to function
7. Test accessibility with screen readers in each language

**Estimated Effort:** 2 hours

---

## 4. Authorized Files and Functions for Modification

### Existing Files to Modify

| File Path | Modifications |
|-----------|---------------|
| `/src/app/error.tsx` | Add `useTranslations` hook, replace all hardcoded strings |
| `/src/app/global-error.tsx` | Add fallback translation mechanism, replace all hardcoded strings |
| `/src/app/item/[publicId]/not-found.tsx` | Add `getTranslations`, replace all hardcoded strings |
| `/messages/en.json` | Add `errors.boundary`, `errors.notFound`, `errors.global` keys |
| `/messages/fr.json` | Add translated error boundary keys |
| `/messages/es.json` | Add translated error boundary keys |
| `/messages/de.json` | Add translated error boundary keys |
| `/messages/nl.json` | Add translated error boundary keys |
| `/messages/it.json` | Add translated error boundary keys |

### New Files to Create (Optional)

| File Path | Purpose |
|-----------|---------|
| `/src/app/not-found.tsx` | Root-level not-found page (if doesn't exist) |

### Functions to Modify

| Function | File | Modifications |
|----------|------|---------------|
| `Error()` | `/src/app/error.tsx` | Add `useTranslations('errors.boundary')`, replace 4 hardcoded strings |
| `GlobalError()` | `/src/app/global-error.tsx` | Add fallback translations object, locale detection, replace 4 hardcoded strings |
| `NotFound()` | `/src/app/item/[publicId]/not-found.tsx` | Add `getTranslations('errors.notFound')`, replace 5 hardcoded strings |

---

## 5. Acceptance Criteria Verification

| Acceptance Criteria | Task | Verification |
|---------------------|------|--------------|
| All error boundary components identified | Analysis | `/src/app/error.tsx`, `/src/app/global-error.tsx` |
| Root application error boundary uses translations | 3.3 | Global error uses fallback translation mechanism |
| Page-level error boundaries use translations | 3.2 | Page error uses `useTranslations` hook |
| Error boundaries access current language context | 3.2, 3.3 | Via next-intl context or fallback detection |
| Primary error messages translated for all 6 languages | 3.1, 3.6 | `errors.boundary.title` in all locale files |
| Secondary explanatory messages translated | 3.1, 3.6 | `errors.boundary.message` in all locale files |
| Recovery instruction messages translated | 3.1, 3.6 | Included in error boundary keys |
| Button labels for retry/refresh translated | 3.1, 3.6 | `errors.boundary.tryAgain`, etc. |
| Error boundaries handle translation system failures | 3.3 | Fallback messages in global error |
| Error message tone is appropriate | 3.1, 3.6 | Professional, reassuring language |
| Visual styling consistent across languages | 3.2, 3.3, 3.4 | No layout changes, same CSS |
| Technical error details have translated labels | 3.1 | `errors.boundary.errorId` |
| Error logging continues correctly | 3.2, 3.3 | Sentry integration unchanged |
| Testing in all 6 languages | 3.8 | Manual testing verification |
| Accessibility features | 3.7 | ARIA attributes added |
| Recovery actions function correctly | 3.2, 3.3 | Reset button works with translated label |

---

## 6. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page error translation | `useTranslations` hook | Within NextIntlClientProvider context, standard pattern |
| Global error translation | Embedded fallback object | Cannot rely on provider context, must work independently |
| Locale detection for global error | Cookie → Navigator → 'en' | Best effort at detecting user preference |
| Not-found page translation | `getTranslations` (server) | Server component pattern from next-intl |
| Error ID display | Keep English "Error ID:" label | Technical identifier, translation adds complexity |
| Styling approach | Keep inline styles for global error | Must work without Tailwind/CSS loading |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation system causes the error | Low | High | Global error has embedded fallback translations |
| Missing translation keys | Low | Medium | Fallback to generic error message |
| Layout issues with longer translations | Low | Low | Max-width constraints, flexible layouts |
| Global error locale detection fails | Low | Low | Defaults to English |
| Performance overhead | Very Low | Very Low | Translations are lightweight, cached |

---

## 8. Implementation Order

1. **Task 3.1:** Add translation keys to English messages file
2. **Task 3.2:** Update page-level error boundary (`/src/app/error.tsx`)
3. **Task 3.3:** Update global error boundary (`/src/app/global-error.tsx`)
4. **Task 3.4:** Update item not-found page
5. **Task 3.5:** Create root not-found page (if needed)
6. **Task 3.6:** Generate translations for non-English languages
7. **Task 3.7:** Add accessibility attributes
8. **Task 3.8:** Test error boundaries in all languages

---

## 9. Estimated Total Effort

| Task | Estimate |
|------|----------|
| Task 3.1: Add translation keys | 1 hour |
| Task 3.2: Update page error boundary | 30 minutes |
| Task 3.3: Update global error boundary | 1-2 hours |
| Task 3.4: Update item not-found page | 30 minutes |
| Task 3.5: Create root not-found page | 30 minutes |
| Task 3.6: Generate translations | 1-2 hours |
| Task 3.7: Add accessibility attributes | 30 minutes |
| Task 3.8: Testing | 2 hours |
| **Total** | **7-9 hours** |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2J, Task 2J.6
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - i18n infrastructure
- [REQ-E02-035: Centralized Error Message Utility](/docs/REQ-E02-035-create-centralized-error-message-utility-overview.md) - Related error utility
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - Translation framework
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling) - Error boundary patterns
- [Existing Error Boundary](/src/app/error.tsx) - Current implementation
- [Existing Global Error](/src/app/global-error.tsx) - Current implementation
