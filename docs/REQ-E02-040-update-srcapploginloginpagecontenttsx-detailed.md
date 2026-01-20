# REQ-E02-040: Update LoginPageContent Component for Internationalization - Detailed Task Breakdown

*Generated: 2026-01-20 15:30:00 UTC*
*Last Modified: 2026-01-20 15:30:00 UTC*

## Reference

- **Request**: REQ-E02-040 (Update LoginPageContent Component for Internationalization)
- **Overview Document**: docs/REQ-E02-040-update-srcapploginloginpagecontenttsx-overview.md
- **Requirements Source**: docs/gen_requests_epic2.md (Request #40)
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2A (Authentication & Registration)
- **Task ID**: 2A.2
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-039 (Create auth namespace structure)

---

## Implementation Summary

This document breaks down the implementation of internationalization for the LoginPageContent component into granular, actionable 1-story-point tasks. The goal is to replace all hardcoded English strings with translation keys from the `auth.login` namespace, enabling the login page to display in all 6 supported languages.

**Total Estimated Tasks**: 12 tasks
**Primary File**: `/src/app/login/LoginPageContent.tsx`
**Translation Files**: `/messages/*.json` (6 files)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] REQ-E02-039 auth namespace structure exists in `/messages/en.json`
- [ ] IntlProvider is configured in `/src/app/layout.tsx`
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] Build passes without errors: `npm run build`

---

## Task Breakdown

### Task 1: Add auth.login Namespace to English Translation File

**File**: `/messages/en.json`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Add the complete `auth.login` namespace structure with all strings extracted from LoginPageContent.tsx.

**Steps**:
1. Open `/messages/en.json`
2. Locate the existing `auth` namespace (contains keys like `signIn`, `signOut`, etc.)
3. Add a nested `login` object within `auth` containing all required translation keys

**Code to Add** (insert within the `auth` object):

```json
"login": {
  "title": "Sign in to your account",
  "subtitle": "Access the FAQBNB administration panel",
  "logoAlt": "FAQBNB Logo",
  "adminAccess": "Admin Access",
  "backToHome": "Back to Home",
  "clearSession": "Clear Session",
  "clearSessionTooltip": "Clear stored session and reload page",
  "secureAccess": "Secure Access",
  "secureAccessDescription": "This area is restricted to authorized administrators only. All access attempts are logged and monitored.",
  "copyright": "© 2024 FAQBNB. All rights reserved.",
  "loading": {
    "authenticating": "Completing authentication...",
    "loading": "Loading authentication..."
  },
  "messages": {
    "success": "Login successful! Redirecting...",
    "completingGoogle": "Completing Google sign-in..."
  },
  "debug": {
    "consoleNote": "Debug: Check console for LOGIN_PAGE_DEBUG logs (REQ-025)"
  }
}
```

**Verification**:
- [ ] JSON is valid (no syntax errors)
- [ ] Keys follow `auth.login.*` naming convention
- [ ] All 15 unique strings from component are included
- [ ] Nested structures for `loading`, `messages`, and `debug` are correct

---

### Task 2: Add auth.login Namespace to French Translation File

**File**: `/messages/fr.json`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Add the French translations for the `auth.login` namespace.

**Code to Add** (insert within the `auth` object):

```json
"login": {
  "title": "Connectez-vous à votre compte",
  "subtitle": "Accédez au panneau d'administration FAQBNB",
  "logoAlt": "Logo FAQBNB",
  "adminAccess": "Accès administrateur",
  "backToHome": "Retour à l'accueil",
  "clearSession": "Effacer la session",
  "clearSessionTooltip": "Effacer la session stockée et recharger la page",
  "secureAccess": "Accès sécurisé",
  "secureAccessDescription": "Cette zone est réservée aux administrateurs autorisés uniquement. Toutes les tentatives d'accès sont enregistrées et surveillées.",
  "copyright": "© 2024 FAQBNB. Tous droits réservés.",
  "loading": {
    "authenticating": "Authentification en cours...",
    "loading": "Chargement de l'authentification..."
  },
  "messages": {
    "success": "Connexion réussie ! Redirection...",
    "completingGoogle": "Finalisation de la connexion Google..."
  },
  "debug": {
    "consoleNote": "Debug: Consultez la console pour les logs LOGIN_PAGE_DEBUG (REQ-025)"
  }
}
```

**Verification**:
- [ ] JSON is valid
- [ ] All keys match English structure exactly
- [ ] French translations are grammatically correct

---

### Task 3: Add auth.login Namespace to Spanish Translation File

**File**: `/messages/es.json`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Add the Spanish translations for the `auth.login` namespace.

**Code to Add** (insert within the `auth` object):

```json
"login": {
  "title": "Inicia sesión en tu cuenta",
  "subtitle": "Accede al panel de administración de FAQBNB",
  "logoAlt": "Logo de FAQBNB",
  "adminAccess": "Acceso de administrador",
  "backToHome": "Volver al inicio",
  "clearSession": "Borrar sesión",
  "clearSessionTooltip": "Borrar la sesión almacenada y recargar la página",
  "secureAccess": "Acceso seguro",
  "secureAccessDescription": "Esta área está restringida solo a administradores autorizados. Todos los intentos de acceso se registran y monitorean.",
  "copyright": "© 2024 FAQBNB. Todos los derechos reservados.",
  "loading": {
    "authenticating": "Completando autenticación...",
    "loading": "Cargando autenticación..."
  },
  "messages": {
    "success": "¡Inicio de sesión exitoso! Redirigiendo...",
    "completingGoogle": "Completando inicio de sesión con Google..."
  },
  "debug": {
    "consoleNote": "Debug: Revisa la consola para los registros LOGIN_PAGE_DEBUG (REQ-025)"
  }
}
```

**Verification**:
- [ ] JSON is valid
- [ ] All keys match English structure exactly
- [ ] Spanish translations are grammatically correct

---

### Task 4: Add auth.login Namespace to German Translation File

**File**: `/messages/de.json`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Add the German translations for the `auth.login` namespace.

**Code to Add** (insert within the `auth` object):

```json
"login": {
  "title": "Bei Ihrem Konto anmelden",
  "subtitle": "Zugriff auf das FAQBNB-Administrationspanel",
  "logoAlt": "FAQBNB-Logo",
  "adminAccess": "Admin-Zugang",
  "backToHome": "Zurück zur Startseite",
  "clearSession": "Sitzung löschen",
  "clearSessionTooltip": "Gespeicherte Sitzung löschen und Seite neu laden",
  "secureAccess": "Sicherer Zugang",
  "secureAccessDescription": "Dieser Bereich ist nur für autorisierte Administratoren zugänglich. Alle Zugriffsversuche werden protokolliert und überwacht.",
  "copyright": "© 2024 FAQBNB. Alle Rechte vorbehalten.",
  "loading": {
    "authenticating": "Authentifizierung wird abgeschlossen...",
    "loading": "Authentifizierung wird geladen..."
  },
  "messages": {
    "success": "Anmeldung erfolgreich! Weiterleitung...",
    "completingGoogle": "Google-Anmeldung wird abgeschlossen..."
  },
  "debug": {
    "consoleNote": "Debug: Konsole auf LOGIN_PAGE_DEBUG-Protokolle prüfen (REQ-025)"
  }
}
```

**Verification**:
- [ ] JSON is valid
- [ ] All keys match English structure exactly
- [ ] German translations are grammatically correct

---

### Task 5: Add auth.login Namespace to Dutch Translation File

**File**: `/messages/nl.json`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Add the Dutch translations for the `auth.login` namespace.

**Code to Add** (insert within the `auth` object):

```json
"login": {
  "title": "Log in op uw account",
  "subtitle": "Toegang tot het FAQBNB-beheerpaneel",
  "logoAlt": "FAQBNB-logo",
  "adminAccess": "Beheerderstoegang",
  "backToHome": "Terug naar home",
  "clearSession": "Sessie wissen",
  "clearSessionTooltip": "Opgeslagen sessie wissen en pagina herladen",
  "secureAccess": "Beveiligde toegang",
  "secureAccessDescription": "Dit gebied is alleen toegankelijk voor geautoriseerde beheerders. Alle toegangspogingen worden geregistreerd en gemonitord.",
  "copyright": "© 2024 FAQBNB. Alle rechten voorbehouden.",
  "loading": {
    "authenticating": "Authenticatie voltooien...",
    "loading": "Authenticatie laden..."
  },
  "messages": {
    "success": "Inloggen geslaagd! Doorsturen...",
    "completingGoogle": "Google-aanmelding voltooien..."
  },
  "debug": {
    "consoleNote": "Debug: Controleer console voor LOGIN_PAGE_DEBUG logs (REQ-025)"
  }
}
```

**Verification**:
- [ ] JSON is valid
- [ ] All keys match English structure exactly
- [ ] Dutch translations are grammatically correct

---

### Task 6: Add auth.login Namespace to Italian Translation File

**File**: `/messages/it.json`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Add the Italian translations for the `auth.login` namespace.

**Code to Add** (insert within the `auth` object):

```json
"login": {
  "title": "Accedi al tuo account",
  "subtitle": "Accedi al pannello di amministrazione FAQBNB",
  "logoAlt": "Logo FAQBNB",
  "adminAccess": "Accesso amministratore",
  "backToHome": "Torna alla home",
  "clearSession": "Cancella sessione",
  "clearSessionTooltip": "Cancella la sessione memorizzata e ricarica la pagina",
  "secureAccess": "Accesso sicuro",
  "secureAccessDescription": "Quest'area è riservata esclusivamente agli amministratori autorizzati. Tutti i tentativi di accesso vengono registrati e monitorati.",
  "copyright": "© 2024 FAQBNB. Tutti i diritti riservati.",
  "loading": {
    "authenticating": "Completamento autenticazione...",
    "loading": "Caricamento autenticazione..."
  },
  "messages": {
    "success": "Accesso riuscito! Reindirizzamento...",
    "completingGoogle": "Completamento accesso Google..."
  },
  "debug": {
    "consoleNote": "Debug: Controlla la console per i log LOGIN_PAGE_DEBUG (REQ-025)"
  }
}
```

**Verification**:
- [ ] JSON is valid
- [ ] All keys match English structure exactly
- [ ] Italian translations are grammatically correct

---

### Task 7: Import useTranslations Hook in LoginPageContent

**File**: `/src/app/login/LoginPageContent.tsx`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Add the import statement for the `useTranslations` hook from next-intl.

**Current Code** (line 1-10):
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { AlertCircle, CheckCircle, Home } from 'lucide-react';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
```

**Modified Code**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { AlertCircle, CheckCircle, Home } from 'lucide-react';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
```

**Verification**:
- [ ] Import statement is added after other third-party imports
- [ ] No TypeScript errors
- [ ] File saves without syntax errors

---

### Task 8: Initialize Translation Hook in Component

**File**: `/src/app/login/LoginPageContent.tsx`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Initialize the `useTranslations` hook at the top of the component function to access `auth.login` namespace translations.

**Location**: Inside `LoginPageContent` function, after the existing hook declarations (around line 20-21)

**Current Code** (around line 17-24):
```typescript
export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, authState } = useAuth();

  // REQ-025: Debug logging for sequential authentication state machine
  const DEBUG_PREFIX = "🔄 LOGIN_PAGE_DEBUG:";
```

**Modified Code**:
```typescript
export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, authState } = useAuth();
  const t = useTranslations('auth.login');

  // REQ-025: Debug logging for sequential authentication state machine
  const DEBUG_PREFIX = "🔄 LOGIN_PAGE_DEBUG:";
```

**Verification**:
- [ ] Hook is declared after other hooks
- [ ] Namespace is `'auth.login'`
- [ ] `t` variable is accessible throughout the component
- [ ] No TypeScript errors

---

### Task 9: Replace Loading State Strings with Translations

**File**: `/src/app/login/LoginPageContent.tsx`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Replace hardcoded loading state messages with translation function calls.

**Location 1**: Lines 164-169 (Loading state render)

**Current Code**:
```typescript
<p className="text-gray-600">
  {authState === 'LOADING' ? 'Completing authentication...' : 'Loading authentication...'}
</p>
<p className="text-xs text-gray-400 mt-2">
  Debug: Check console for LOGIN_PAGE_DEBUG logs (REQ-025)
</p>
```

**Modified Code**:
```typescript
<p className="text-gray-600">
  {authState === 'LOADING' ? t('loading.authenticating') : t('loading.loading')}
</p>
<p className="text-xs text-gray-400 mt-2">
  {t('debug.consoleNote')}
</p>
```

**Verification**:
- [ ] Both loading messages use translation keys
- [ ] Debug message uses translation key
- [ ] Ternary logic preserved
- [ ] No hardcoded strings remain in this section

---

### Task 10: Replace Success and OAuth Messages with Translations

**File**: `/src/app/login/LoginPageContent.tsx`
**Complexity**: Low
**Estimated Points**: 1

**Description**: Replace hardcoded success and OAuth completion messages with translation function calls.

**Location 1**: Lines 176-179 (handleLoginSuccess function)

**Current Code**:
```typescript
const handleLoginSuccess = () => {
  setLoginMessage({
    type: 'success',
    message: 'Login successful! Redirecting...',
  });
};
```

**Modified Code**:
```typescript
const handleLoginSuccess = () => {
  setLoginMessage({
    type: 'success',
    message: t('messages.success'),
  });
};
```

**Location 2**: Lines 132-135 (OAuth completion message in useEffect)

**Current Code**:
```typescript
setLoginMessage({
  type: 'info',
  message: 'Completing Google sign-in...',
});
```

**Modified Code**:
```typescript
setLoginMessage({
  type: 'info',
  message: t('messages.completingGoogle'),
});
```

**Verification**:
- [ ] Success message uses `t('messages.success')`
- [ ] OAuth message uses `t('messages.completingGoogle')`
- [ ] setLoginMessage structure preserved
- [ ] No TypeScript errors

---

### Task 11: Replace Header and Main Content Strings with Translations

**File**: `/src/app/login/LoginPageContent.tsx`
**Complexity**: Medium
**Estimated Points**: 1

**Description**: Replace all hardcoded strings in the header section, logo area, and main content area.

**Location**: Lines 233-253 (Header section)

**Current Code**:
```typescript
<Image
  src="/faqbnb_logoshort.png"
  alt="FAQBNB Logo"
  width={48}
  height={48}
  className="rounded-lg"
/>
<div className="text-left">
  <h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
  <p className="text-sm text-gray-600">Admin Access</p>
</div>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  Sign in to your account
</h2>
<p className="mt-2 text-sm text-gray-600">
  Access the FAQBNB administration panel
</p>
```

**Modified Code**:
```typescript
<Image
  src="/faqbnb_logoshort.png"
  alt={t('logoAlt')}
  width={48}
  height={48}
  className="rounded-lg"
/>
<div className="text-left">
  <h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
  <p className="text-sm text-gray-600">{t('adminAccess')}</p>
</div>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  {t('title')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('subtitle')}
</p>
```

**Note**: "FAQBNB" brand name remains hardcoded as it's a proper noun.

**Verification**:
- [ ] Logo alt text uses `t('logoAlt')`
- [ ] "Admin Access" uses `t('adminAccess')`
- [ ] Main title uses `t('title')`
- [ ] Subtitle uses `t('subtitle')`
- [ ] Brand name "FAQBNB" remains as literal string

---

### Task 12: Replace Footer Links and Security Notice Strings with Translations

**File**: `/src/app/login/LoginPageContent.tsx`
**Complexity**: Medium
**Estimated Points**: 1

**Description**: Replace all hardcoded strings in the footer links, Clear Session button, copyright, and security notice sections.

**Location 1**: Lines 274-276 (Back to Home link)

**Current Code**:
```typescript
<Link
  href="/"
  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  Back to Home
</Link>
```

**Modified Code**:
```typescript
<Link
  href="/"
  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  {t('backToHome')}
</Link>
```

**Location 2**: Lines 287-290 (Clear Session button)

**Current Code**:
```typescript
<button
  onClick={() => {
    // Clear any stored sessions and force fresh login
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }}
  className="text-sm text-red-600 hover:text-red-700 underline"
  title="Clear stored session and reload page"
>
  Clear Session
</button>
```

**Modified Code**:
```typescript
<button
  onClick={() => {
    // Clear any stored sessions and force fresh login
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }}
  className="text-sm text-red-600 hover:text-red-700 underline"
  title={t('clearSessionTooltip')}
>
  {t('clearSession')}
</button>
```

**Location 3**: Lines 295-297 (Copyright)

**Current Code**:
```typescript
<p className="text-xs text-gray-500">
  © 2024 FAQBNB. All rights reserved.
</p>
```

**Modified Code**:
```typescript
<p className="text-xs text-gray-500">
  {t('copyright')}
</p>
```

**Location 4**: Lines 331-337 (Security notice)

**Current Code**:
```typescript
<h3 className="text-sm font-medium text-gray-800">
  Secure Access
</h3>
<p className="text-xs text-gray-600 mt-1">
  This area is restricted to authorized administrators only.
  All access attempts are logged and monitored.
</p>
```

**Modified Code**:
```typescript
<h3 className="text-sm font-medium text-gray-800">
  {t('secureAccess')}
</h3>
<p className="text-xs text-gray-600 mt-1">
  {t('secureAccessDescription')}
</p>
```

**Verification**:
- [ ] "Back to Home" uses `t('backToHome')`
- [ ] "Clear Session" button text uses `t('clearSession')`
- [ ] Clear Session title attribute uses `t('clearSessionTooltip')`
- [ ] Copyright uses `t('copyright')`
- [ ] "Secure Access" heading uses `t('secureAccess')`
- [ ] Security notice body uses `t('secureAccessDescription')`

---

## Post-Implementation Verification

### Automated Checks

Run the following commands after implementation:

```bash
# 1. Verify TypeScript compilation
npm run build

# 2. Check for ESLint errors
npm run lint

# 3. Start development server
npm run dev
```

### Manual Testing Checklist

- [ ] Navigate to `/login` page
- [ ] Verify page title "Sign in to your account" displays correctly
- [ ] Verify subtitle "Access the FAQBNB administration panel" displays correctly
- [ ] Verify logo alt text by inspecting element
- [ ] Verify "Admin Access" label displays correctly
- [ ] Trigger loading state (if possible) and verify loading messages
- [ ] Attempt login and verify success message
- [ ] Click "Back to Home" link and verify text
- [ ] Hover over "Clear Session" button (if visible) and verify tooltip
- [ ] Verify copyright text in footer
- [ ] Verify security notice heading and body text
- [ ] Check browser console for any translation errors or warnings

### Language Switching Test

If language switching is implemented:

1. Switch to French (fr) and verify all strings display in French
2. Switch to Spanish (es) and verify all strings display in Spanish
3. Switch to German (de) and verify all strings display in German
4. Switch to Dutch (nl) and verify all strings display in Dutch
5. Switch to Italian (it) and verify all strings display in Italian
6. Switch back to English (en) and verify all strings display in English

### Visual Regression Check

- [ ] No text overflow or truncation issues
- [ ] Layout remains intact with all language variants
- [ ] German translations (typically longer) fit within containers
- [ ] Buttons and links remain properly sized

---

## Rollback Plan

If issues are discovered, rollback by:

1. Revert changes to `/src/app/login/LoginPageContent.tsx` using git:
   ```bash
   git checkout HEAD -- src/app/login/LoginPageContent.tsx
   ```

2. Translation file changes can remain as they don't affect functionality until used.

---

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `/messages/en.json` | Translation | Add `auth.login` namespace with 15 keys |
| `/messages/fr.json` | Translation | Add `auth.login` namespace with French translations |
| `/messages/es.json` | Translation | Add `auth.login` namespace with Spanish translations |
| `/messages/de.json` | Translation | Add `auth.login` namespace with German translations |
| `/messages/nl.json` | Translation | Add `auth.login` namespace with Dutch translations |
| `/messages/it.json` | Translation | Add `auth.login` namespace with Italian translations |
| `/src/app/login/LoginPageContent.tsx` | Component | Import hook, initialize, replace 15 hardcoded strings |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task |
|---------------------|------|
| Page header text uses translation key | Task 11 |
| Subheading uses translation key | Task 11 |
| Logo alt text uses translation key | Task 11 |
| "Admin Access" label uses translation key | Task 11 |
| Loading state messages use translation keys | Task 9 |
| Debug message uses translation key | Task 9 |
| Success message uses translation key | Task 10 |
| OAuth completion message uses translation key | Task 10 |
| "Back to Home" link uses translation key | Task 12 |
| "Clear Session" button uses translation key | Task 12 |
| Button title attribute uses translation key | Task 12 |
| Copyright uses translation key | Task 12 |
| Security notice heading uses translation key | Task 12 |
| Security notice body uses translation key | Task 12 |
| Component imports useTranslations hook | Task 7 |
| Translation keys follow auth.login.* namespace | Tasks 1-6 |
| All strings added to English base file | Task 1 |
| Component remains fully functional | Post-Implementation Verification |
| Visual regression testing confirms layout intact | Visual Regression Check |

---

## Notes

### Brand Name Handling

The brand name "FAQBNB" remains as a literal string and is not translated. This is standard practice for proper nouns and brand names.

### Debug Message Decision

The debug message "Check console for LOGIN_PAGE_DEBUG logs (REQ-025)" has been included in translations for completeness. However, this could optionally be:
- Kept in English only (technical content for developers)
- Removed from production builds entirely
- Hidden behind a development mode flag

### Version Footer

The version footer (`v0.671 | 97aedfc | 2026-01-13`) is technical/dynamic content and remains unchanged. This is appropriate as version information doesn't require translation.

### URL Parameter Messages

URL parameter messages (OAuth errors, redirect messages) are handled dynamically. A future enhancement could implement a translation lookup for known message types, but this is outside the current task scope.

---

*End of Detailed Task Breakdown*
