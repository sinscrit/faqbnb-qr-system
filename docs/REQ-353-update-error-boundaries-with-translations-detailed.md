# REQ-353: Update Error Boundaries with Translations - Detailed Task Breakdown

**Last Modified:** 2026-01-19
**Request Reference:** docs/gen_requests_epic2.md - REQ-353
**Overview Document:** docs/REQ-353-update-error-boundaries-with-translations-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2J - Error Messages & Validation
**Task ID:** 2J.6
**Type:** ENHANCEMENT
**Size:** S (Small)
**Estimated Effort:** 6 hours

---

## Executive Summary

This document provides granular, actionable implementation tasks for updating all error boundary components to display localized error messages. The work involves adding translation keys to the `errors` namespace and updating 4 files that contain error boundary logic. Special consideration is required for the global error boundary which renders outside the IntlProvider context.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (next-intl installed and configured)
- [ ] IntlProvider is properly configured in `/src/app/layout.tsx`
- [ ] Translation files exist in `/messages/*.json`
- [ ] The `errors` namespace exists in `/messages/en.json` (currently has basic error messages)

---

## Task Breakdown

### Task 1: Add Error Boundary Translation Keys to Messages Files

**Objective:** Add all required translation keys for error boundary components to the English translations file.

**File to Modify:** `/messages/en.json`

**Current State (lines 103-120):**
```json
"errors": {
  "required": "This field is required",
  "invalidEmail": "Invalid email address",
  ...
}
```

**Implementation Steps:**

1.1. Open `/messages/en.json`

1.2. Locate the `errors` object (currently at lines 103-120)

1.3. Add the following nested structure within the `errors` object:

```json
"errors": {
  // ... existing keys remain unchanged ...

  "boundary": {
    "title": "Something went wrong!",
    "description": "We apologize for the inconvenience. Our team has been notified of this error.",
    "errorId": "Error ID: {digest}",
    "tryAgain": "Try again"
  },
  "item": {
    "notFoundTitle": "Item Not Found",
    "notFoundDescription": "The item you're looking for doesn't exist or may have been removed. Please check the QR code and try again.",
    "notFoundShort": "The requested item could not be found.",
    "returnHome": "Return Home",
    "goBackDemo": "Go Back (Demo Mode)",
    "contactSupport": "If you believe this is an error, please contact support."
  },
  "reaction": {
    "updateFailed": "Failed to update reaction counts",
    "unavailable": "Reaction system temporarily unavailable",
    "dismiss": "Dismiss"
  }
}
```

1.4. Verify JSON syntax is valid (no trailing commas, proper nesting)

**Acceptance Criteria for Task 1:**
- [ ] `errors.boundary` namespace contains 4 keys (title, description, errorId, tryAgain)
- [ ] `errors.item` namespace contains 6 keys (notFoundTitle, notFoundDescription, notFoundShort, returnHome, goBackDemo, contactSupport)
- [ ] `errors.reaction` namespace contains 3 keys (updateFailed, unavailable, dismiss)
- [ ] JSON file remains valid (no syntax errors)
- [ ] Build passes with updated translation file

---

### Task 2: Update App Error Boundary Component

**Objective:** Update the app-level error boundary to use translations instead of hardcoded strings.

**File to Modify:** `/src/app/error.tsx`

**Current State (lines 1-47):**
- Client component using Sentry for error reporting
- 4 hardcoded English strings:
  - Line 27: `"Something went wrong!"`
  - Line 30: `"We apologize for the inconvenience..."`
  - Line 34: `"Error ID: "`
  - Line 41: `"Try again"`

**Implementation Steps:**

2.1. Add useTranslations import at line 10 (after existing imports):
```typescript
import { useTranslations } from 'next-intl';
```

2.2. Add translation hook inside the Error component (after line 17):
```typescript
const t = useTranslations('errors.boundary');
```

2.3. Replace hardcoded string at line 27:
```typescript
// FROM:
<h2 className="text-red-500 mb-4 text-2xl font-semibold">
  Something went wrong!
</h2>
// TO:
<h2 className="text-red-500 mb-4 text-2xl font-semibold">
  {t('title')}
</h2>
```

2.4. Replace hardcoded string at line 30:
```typescript
// FROM:
<p className="text-gray-600 mb-6 leading-relaxed">
  We apologize for the inconvenience. Our team has been notified of this error.
</p>
// TO:
<p className="text-gray-600 mb-6 leading-relaxed">
  {t('description')}
</p>
```

2.5. Replace hardcoded string at line 34 (Error ID with interpolation):
```typescript
// FROM:
<p className="text-xs text-gray-400 mb-4 font-mono">
  Error ID: {error.digest}
</p>
// TO:
<p className="text-xs text-gray-400 mb-4 font-mono">
  {t('errorId', { digest: error.digest })}
</p>
```

2.6. Replace hardcoded string at line 41:
```typescript
// FROM:
<button onClick={() => reset()} className="...">
  Try again
</button>
// TO:
<button onClick={() => reset()} className="...">
  {t('tryAgain')}
</button>
```

2.7. Update Last Modified comment at line 6:
```typescript
// Last Modified: 2026-01-19
```

**Acceptance Criteria for Task 2:**
- [ ] `useTranslations` hook imported from 'next-intl'
- [ ] Translation hook initialized with 'errors.boundary' namespace
- [ ] All 4 hardcoded strings replaced with `t()` calls
- [ ] Error ID uses interpolation with `{ digest: error.digest }`
- [ ] Sentry integration remains functional
- [ ] Component renders correctly in English
- [ ] No TypeScript errors

---

### Task 3: Update Global Error Boundary with Fallback Strategy

**Objective:** Update the global error boundary to use translations with a fallback mechanism since it renders outside the IntlProvider context.

**File to Modify:** `/src/app/global-error.tsx`

**Current State (lines 1-89):**
- Client component with inline styles (CSS may not load for root errors)
- 4 hardcoded English strings (same as app error boundary)
- Renders `<html>` and `<body>` tags directly

**Special Consideration:** This component may render when the IntlProvider context is unavailable. Must implement dynamic translation loading with static fallback.

**Implementation Steps:**

3.1. Add useState import (line 9, update existing import):
```typescript
import { useEffect, useState } from "react";
```

3.2. Add fallback messages constant after imports (after line 9):
```typescript
// Static fallback messages when translations are unavailable
const FALLBACK_MESSAGES = {
  title: "Something went wrong!",
  description: "We apologize for the inconvenience. Our team has been notified of this error.",
  errorId: "Error ID:",
  tryAgain: "Try again"
} as const;
```

3.3. Add translation loading function before the component (after FALLBACK_MESSAGES):
```typescript
/**
 * Attempts to load translations from the messages files.
 * Falls back to English if locale detection or loading fails.
 */
async function loadTranslatedMessages(): Promise<typeof FALLBACK_MESSAGES> {
  try {
    // Attempt to detect locale from cookie
    const cookieMatch = typeof document !== 'undefined'
      ? document.cookie.match(/FAQBNB_LANG=(\w+)/)
      : null;
    const locale = cookieMatch?.[1] || 'en';

    // Dynamically import the messages file
    const messages = await import(`../../messages/${locale}.json`);

    return {
      title: messages.errors?.boundary?.title ?? FALLBACK_MESSAGES.title,
      description: messages.errors?.boundary?.description ?? FALLBACK_MESSAGES.description,
      errorId: messages.errors?.boundary?.errorId?.replace(' {digest}', ':') ?? FALLBACK_MESSAGES.errorId,
      tryAgain: messages.errors?.boundary?.tryAgain ?? FALLBACK_MESSAGES.tryAgain
    };
  } catch (error) {
    console.warn('Failed to load translations for global error boundary:', error);
    return FALLBACK_MESSAGES;
  }
}
```

3.4. Add state for messages inside the GlobalError component (after line 17):
```typescript
const [messages, setMessages] = useState(FALLBACK_MESSAGES);
```

3.5. Update the useEffect to include translation loading (lines 18-21):
```typescript
useEffect(() => {
  // Report the error to Sentry
  Sentry.captureException(error);

  // Attempt to load translations (non-blocking)
  loadTranslatedMessages()
    .then(setMessages)
    .catch(() => {/* Fallback already set */});
}, [error]);
```

3.6. Replace hardcoded string at line 49:
```typescript
// FROM:
<h1 style={{...}}>
  Something went wrong!
</h1>
// TO:
<h1 style={{...}}>
  {messages.title}
</h1>
```

3.7. Replace hardcoded string at line 56:
```typescript
// FROM:
<p style={{...}}>
  We apologize for the inconvenience. Our team has been notified of this error.
</p>
// TO:
<p style={{...}}>
  {messages.description}
</p>
```

3.8. Replace hardcoded string at line 65:
```typescript
// FROM:
<p style={{...}}>
  Error ID: {error.digest}
</p>
// TO:
<p style={{...}}>
  {messages.errorId} {error.digest}
</p>
```

3.9. Replace hardcoded string at line 81:
```typescript
// FROM:
<button onClick={() => reset()} style={{...}}>
  Try again
</button>
// TO:
<button onClick={() => reset()} style={{...}}>
  {messages.tryAgain}
</button>
```

3.10. Update Last Modified comment at line 6:
```typescript
// Last Modified: 2026-01-19
```

**Acceptance Criteria for Task 3:**
- [ ] Fallback messages constant defined with English defaults
- [ ] Dynamic translation loading function implemented
- [ ] State management for messages with useState
- [ ] Translation loading attempted in useEffect
- [ ] All 4 hardcoded strings replaced with `messages.*` references
- [ ] Sentry integration remains functional
- [ ] Component renders with fallback when translations unavailable
- [ ] Component updates to localized text when translations load
- [ ] Inline styles preserved (required for root layout errors)
- [ ] No TypeScript errors

---

### Task 4: Update Item Not Found Page

**Objective:** Convert the Item Not Found page to use server-side translations.

**File to Modify:** `/src/app/item/[publicId]/not-found.tsx`

**Current State (lines 1-54):**
- Server component (no 'use client' directive)
- 5 hardcoded English strings:
  - Line 17: `"Item Not Found"`
  - Lines 20-22: `"The item you're looking for doesn't exist..."`
  - Line 32: `"Go Back (Demo Mode)"`
  - Line 38: `"Return Home"`
  - Line 46: `"If you believe this is an error, please contact support."`

**Implementation Steps:**

4.1. Add getTranslations import at line 2 (after Link import):
```typescript
import { getTranslations } from 'next-intl/server';
```

4.2. Convert component to async function (line 4):
```typescript
// FROM:
export default function NotFound() {
// TO:
export default async function NotFound() {
```

4.3. Add translation initialization at the start of the function (after line 4):
```typescript
const t = await getTranslations('errors.item');
```

4.4. Replace hardcoded string at line 17:
```typescript
// FROM:
<h1 className="text-3xl font-bold text-gray-900 mb-4">
  Item Not Found
</h1>
// TO:
<h1 className="text-3xl font-bold text-gray-900 mb-4">
  {t('notFoundTitle')}
</h1>
```

4.5. Replace hardcoded string at lines 20-22:
```typescript
// FROM:
<p className="text-gray-600 mb-8 leading-relaxed">
  The item you&apos;re looking for doesn&apos;t exist or may have been removed.
  Please check the QR code and try again.
</p>
// TO:
<p className="text-gray-600 mb-8 leading-relaxed">
  {t('notFoundDescription')}
</p>
```

4.6. Replace hardcoded string at line 32:
```typescript
// FROM:
<button className="..." disabled>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Go Back (Demo Mode)
</button>
// TO:
<button className="..." disabled>
  <ArrowLeft className="w-4 h-4 mr-2" />
  {t('goBackDemo')}
</button>
```

4.7. Replace hardcoded string at line 38:
```typescript
// FROM:
<Link href="/" className="...">
  Return Home
</Link>
// TO:
<Link href="/" className="...">
  {t('returnHome')}
</Link>
```

4.8. Replace hardcoded string at line 46:
```typescript
// FROM:
<p className="text-sm text-gray-500">
  If you believe this is an error, please contact support.
</p>
// TO:
<p className="text-sm text-gray-500">
  {t('contactSupport')}
</p>
```

**Acceptance Criteria for Task 4:**
- [ ] `getTranslations` imported from 'next-intl/server'
- [ ] Component converted to async function
- [ ] Translation initialized with await getTranslations('errors.item')
- [ ] All 5 hardcoded strings replaced with `t()` calls
- [ ] Page renders correctly at `/item/[invalid-id]`
- [ ] No TypeScript errors

---

### Task 5: Update ItemDisplay Component Inline Errors

**Objective:** Update the ItemDisplay component to use translations for inline error messages and fallback UI.

**File to Modify:** `/src/components/ItemDisplay.tsx`

**Current State (lines 1-293):**
- Client component with 'use client' directive
- Hardcoded strings:
  - Line 73: `'Failed to update reaction counts'`
  - Line 80: `'Reaction system temporarily unavailable'`
  - Line 87: `"Item Not Found"`
  - Line 88: `"The requested item could not be found."`
  - Line 163: `"Dismiss"`

**Implementation Steps:**

5.1. Add useTranslations import at line 2 (after useState import):
```typescript
import { useTranslations } from 'next-intl';
```

5.2. Add translation hook inside the ItemDisplay component (after line 18):
```typescript
const t = useTranslations('errors');
```

5.3. Replace hardcoded string at line 73:
```typescript
// FROM:
setReactionError('Failed to update reaction counts');
// TO:
setReactionError(t('reaction.updateFailed'));
```

5.4. Replace hardcoded string at line 80:
```typescript
// FROM:
setReactionError('Reaction system temporarily unavailable');
// TO:
setReactionError(t('reaction.unavailable'));
```

5.5. Replace hardcoded strings at lines 87-88 (item fallback):
```typescript
// FROM:
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>
    <p className="text-gray-600">The requested item could not be found.</p>
  </div>
</div>
// TO:
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('item.notFoundTitle')}</h1>
    <p className="text-gray-600">{t('item.notFoundShort')}</p>
  </div>
</div>
```

5.6. Replace hardcoded string at line 163:
```typescript
// FROM:
<button
  onClick={() => setReactionError(null)}
  className="text-xs text-red-500 hover:text-red-700 mt-1"
>
  Dismiss
</button>
// TO:
<button
  onClick={() => setReactionError(null)}
  className="text-xs text-red-500 hover:text-red-700 mt-1"
>
  {t('reaction.dismiss')}
</button>
```

**Acceptance Criteria for Task 5:**
- [ ] `useTranslations` hook imported from 'next-intl'
- [ ] Translation hook initialized with 'errors' namespace
- [ ] Reaction error messages use `t('reaction.*')` calls
- [ ] Item not found fallback uses `t('item.*')` calls
- [ ] Dismiss button uses `t('reaction.dismiss')`
- [ ] Component renders correctly when item exists
- [ ] Component renders fallback correctly when item is null
- [ ] Error messages display correctly
- [ ] No TypeScript errors

---

### Task 6: Generate Non-English Translations

**Objective:** Add translations for all supported non-English languages (fr, es, de, nl, it).

**Files to Modify:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Implementation Steps:**

6.1. Add the following translations to `/messages/fr.json`:
```json
"errors": {
  // ... existing keys ...
  "boundary": {
    "title": "Une erreur s'est produite !",
    "description": "Nous nous excusons pour le desagrement. Notre equipe a ete informee de cette erreur.",
    "errorId": "ID de l'erreur : {digest}",
    "tryAgain": "Reessayer"
  },
  "item": {
    "notFoundTitle": "Article non trouve",
    "notFoundDescription": "L'article que vous recherchez n'existe pas ou a peut-etre ete supprime. Veuillez verifier le code QR et reessayer.",
    "notFoundShort": "L'article demande n'a pas pu etre trouve.",
    "returnHome": "Retour a l'accueil",
    "goBackDemo": "Retour (Mode Demo)",
    "contactSupport": "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support."
  },
  "reaction": {
    "updateFailed": "Echec de la mise a jour des reactions",
    "unavailable": "Systeme de reactions temporairement indisponible",
    "dismiss": "Ignorer"
  }
}
```

6.2. Add the following translations to `/messages/es.json`:
```json
"errors": {
  // ... existing keys ...
  "boundary": {
    "title": "Algo salio mal!",
    "description": "Pedimos disculpas por las molestias. Nuestro equipo ha sido notificado de este error.",
    "errorId": "ID del error: {digest}",
    "tryAgain": "Intentar de nuevo"
  },
  "item": {
    "notFoundTitle": "Articulo no encontrado",
    "notFoundDescription": "El articulo que buscas no existe o puede haber sido eliminado. Por favor, verifica el codigo QR e intentalo de nuevo.",
    "notFoundShort": "No se pudo encontrar el articulo solicitado.",
    "returnHome": "Volver al inicio",
    "goBackDemo": "Volver (Modo Demo)",
    "contactSupport": "Si crees que esto es un error, por favor contacta al soporte."
  },
  "reaction": {
    "updateFailed": "Error al actualizar las reacciones",
    "unavailable": "Sistema de reacciones temporalmente no disponible",
    "dismiss": "Cerrar"
  }
}
```

6.3. Add the following translations to `/messages/de.json`:
```json
"errors": {
  // ... existing keys ...
  "boundary": {
    "title": "Etwas ist schief gelaufen!",
    "description": "Wir entschuldigen uns fur die Unannehmlichkeiten. Unser Team wurde uber diesen Fehler informiert.",
    "errorId": "Fehler-ID: {digest}",
    "tryAgain": "Erneut versuchen"
  },
  "item": {
    "notFoundTitle": "Artikel nicht gefunden",
    "notFoundDescription": "Der gesuchte Artikel existiert nicht oder wurde moglicherweise entfernt. Bitte uberprufen Sie den QR-Code und versuchen Sie es erneut.",
    "notFoundShort": "Der angeforderte Artikel konnte nicht gefunden werden.",
    "returnHome": "Zur Startseite",
    "goBackDemo": "Zuruck (Demo-Modus)",
    "contactSupport": "Wenn Sie glauben, dass dies ein Fehler ist, wenden Sie sich bitte an den Support."
  },
  "reaction": {
    "updateFailed": "Fehler beim Aktualisieren der Reaktionen",
    "unavailable": "Reaktionssystem vorubergehend nicht verfugbar",
    "dismiss": "Schliessen"
  }
}
```

6.4. Add the following translations to `/messages/nl.json`:
```json
"errors": {
  // ... existing keys ...
  "boundary": {
    "title": "Er ging iets mis!",
    "description": "Onze excuses voor het ongemak. Ons team is op de hoogte gebracht van deze fout.",
    "errorId": "Fout-ID: {digest}",
    "tryAgain": "Opnieuw proberen"
  },
  "item": {
    "notFoundTitle": "Item niet gevonden",
    "notFoundDescription": "Het item dat je zoekt bestaat niet of is mogelijk verwijderd. Controleer de QR-code en probeer het opnieuw.",
    "notFoundShort": "Het gevraagde item kon niet worden gevonden.",
    "returnHome": "Terug naar home",
    "goBackDemo": "Terug (Demo-modus)",
    "contactSupport": "Als je denkt dat dit een fout is, neem dan contact op met de ondersteuning."
  },
  "reaction": {
    "updateFailed": "Kon reactieaantallen niet bijwerken",
    "unavailable": "Reactiesysteem tijdelijk niet beschikbaar",
    "dismiss": "Sluiten"
  }
}
```

6.5. Add the following translations to `/messages/it.json`:
```json
"errors": {
  // ... existing keys ...
  "boundary": {
    "title": "Qualcosa e andato storto!",
    "description": "Ci scusiamo per l'inconveniente. Il nostro team e stato informato di questo errore.",
    "errorId": "ID errore: {digest}",
    "tryAgain": "Riprova"
  },
  "item": {
    "notFoundTitle": "Articolo non trovato",
    "notFoundDescription": "L'articolo che stai cercando non esiste o potrebbe essere stato rimosso. Verifica il codice QR e riprova.",
    "notFoundShort": "Impossibile trovare l'articolo richiesto.",
    "returnHome": "Torna alla home",
    "goBackDemo": "Torna indietro (Modalita Demo)",
    "contactSupport": "Se ritieni che questo sia un errore, contatta l'assistenza."
  },
  "reaction": {
    "updateFailed": "Impossibile aggiornare i conteggi delle reazioni",
    "unavailable": "Sistema di reazioni temporaneamente non disponibile",
    "dismiss": "Chiudi"
  }
}
```

**Acceptance Criteria for Task 6:**
- [ ] French translations added to `/messages/fr.json`
- [ ] Spanish translations added to `/messages/es.json`
- [ ] German translations added to `/messages/de.json`
- [ ] Dutch translations added to `/messages/nl.json`
- [ ] Italian translations added to `/messages/it.json`
- [ ] All JSON files remain valid (no syntax errors)
- [ ] Interpolation placeholders `{digest}` preserved in all translations
- [ ] Build passes with all translation files

---

### Task 7: Verification and Testing

**Objective:** Verify all error boundaries display correctly in all supported languages.

**Manual Testing Scenarios:**

7.1. **App Error Boundary Test:**
- Temporarily add `throw new Error('Test')` to a page component
- Verify error page displays with correct translations
- Test language switching using cookie or LanguageSwitcher
- Verify in: en, fr, es, de, nl, it

7.2. **Global Error Boundary Test:**
- Temporarily break the root layout to trigger global error
- Verify fallback English displays immediately
- Verify translations load after dynamic import
- Test in: en, fr, es, de, nl, it

7.3. **Item Not Found Page Test:**
- Navigate to `/item/invalid-public-id`
- Verify all text displays in correct language
- Test all action buttons function correctly
- Test in: en, fr, es, de, nl, it

7.4. **ItemDisplay Fallback Test:**
- Render ItemDisplay with `item={null}`
- Verify fallback UI displays correct translations
- Test in: en, fr, es, de, nl, it

7.5. **Reaction Error Test:**
- Trigger a reaction system error (network failure)
- Verify error message displays in correct language
- Verify dismiss button works
- Test in: en, fr, es, de, nl, it

7.6. **Translation Fallback Test:**
- Temporarily remove a translation key
- Verify English fallback is used
- Verify no JavaScript errors in console

**Acceptance Criteria for Task 7:**
- [ ] App error boundary displays correct translations in all 6 languages
- [ ] Global error boundary displays with fallback, then loads translations
- [ ] Item not found page displays correctly in all 6 languages
- [ ] ItemDisplay fallback displays correctly in all 6 languages
- [ ] Reaction errors display correctly in all 6 languages
- [ ] Missing translation fallback works (English default)
- [ ] No console errors related to translations
- [ ] Sentry error reporting still functions

---

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `/messages/en.json` | Translation | Add `errors.boundary`, `errors.item`, `errors.reaction` keys |
| `/messages/fr.json` | Translation | Add French translations for error boundaries |
| `/messages/es.json` | Translation | Add Spanish translations for error boundaries |
| `/messages/de.json` | Translation | Add German translations for error boundaries |
| `/messages/nl.json` | Translation | Add Dutch translations for error boundaries |
| `/messages/it.json` | Translation | Add Italian translations for error boundaries |
| `/src/app/error.tsx` | Component | Add useTranslations, replace 4 hardcoded strings |
| `/src/app/global-error.tsx` | Component | Add dynamic translation loading with fallback |
| `/src/app/item/[publicId]/not-found.tsx` | Component | Convert to async, add getTranslations, replace 5 strings |
| `/src/components/ItemDisplay.tsx` | Component | Add useTranslations, replace 5 hardcoded strings |

---

## Dependencies

### Upstream Dependencies (Must be complete before starting)

| Dependency | File/Feature | Status |
|------------|--------------|--------|
| Epic 1 Foundation | next-intl installed | Required |
| IntlProvider | `/src/app/layout.tsx` | Required |
| Translation files structure | `/messages/*.json` | Required |

### Related Tasks in Sub-Epic 2J

| Task ID | Description | Relationship |
|---------|-------------|--------------|
| 2J.1 | Create `errors` namespace structure | Parallel (namespace may already exist) |
| 2J.7 | Generate translations for 5 non-English languages | Task 6 covers error boundary translations |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Global error boundary outside IntlProvider | Implement dynamic loading with static fallback |
| Translation provider failure | All components have fallback to English strings |
| Layout issues with longer translations | Test German (typically longest) thoroughly |
| Sentry integration disruption | Keep Sentry calls unchanged, test error reporting |

---

## Rollback Plan

If issues are discovered:

1. **Translation issues:** Revert to hardcoded strings by removing `useTranslations` usage
2. **Global error boundary issues:** Restore original component from git
3. **Build failures:** Check JSON syntax in translation files

Git command to revert a specific file:
```bash
git checkout HEAD~1 -- <file-path>
```

---

## Completion Checklist

Before marking REQ-353 as complete:

- [ ] Task 1: Translation keys added to `/messages/en.json`
- [ ] Task 2: App error boundary updated
- [ ] Task 3: Global error boundary updated with fallback
- [ ] Task 4: Item not found page updated
- [ ] Task 5: ItemDisplay component updated
- [ ] Task 6: Non-English translations added to all 5 language files
- [ ] Task 7: All manual testing scenarios passed
- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] No hardcoded English strings remain in error boundary components
- [ ] Sentry error reporting verified functional

---

## References

- [Request: docs/gen_requests_epic2.md - REQ-353](/docs/gen_requests_epic2.md)
- [Overview: docs/REQ-353-update-error-boundaries-with-translations-overview.md](/docs/REQ-353-update-error-boundaries-with-translations-overview.md)
- [Implementation Plan: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Example Pattern: /src/components/LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Config: /src/lib/i18n/config.ts](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2J: Error Messages & Validation*
*Task 2J.6: Update Error Boundaries with Translations*
